/**
 * Storage at-rest regression tests (audit 2026-07, T0-4 / T0-5 / F5 / F6).
 *
 * These import the REAL extension storage modules and assert the security
 * invariants A2 owed — the bugs that shipped precisely because the old suites
 * only tested in-file mocks:
 *
 *   T0-4  a private key is never stored as plaintext at rest; the passwordless
 *         path yields ciphertext wrapped by a NON-extractable device key.
 *   T0-4  API-key secrets and vault-note bodies are ciphertext at rest.
 *   T0-5  buildSyncPayload (driven via the public scheduleSyncPush) emits NO
 *         plaintext secret — the drop-plaintext guard fires.
 *   F5/F6 a locked session cannot read API keys or vault content.
 *
 * A fake `chrome` namespace is installed BEFORE importing the modules so the
 * browser-polyfill binds to it. No IndexedDB → secret-vault uses its in-memory
 * non-extractable device key, i.e. the real passwordless at-rest path.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPublicKeySync } from 'nostr-crypto-utils';
import { installFakeChrome } from './helpers/fake-chrome.js';

// Install the fake namespace FIRST, then load the real modules against it.
const env = installFakeChrome();
const { local, sync, setSendMessage } = env;

const { generateProfile, isCiphertext, isDeviceKeyBlob } =
  await import('../src/utilities/utils.js');
const {
  getDeviceKey,
  decryptWithDeviceKey,
  clearSession,
  setSessionKey,
  setUnlocked,
  unwrapSecret,
} = await import('../src/utilities/secret-vault.js');
const { deriveKey, encryptWithKey } = await import('../src/utilities/crypto.js');
const { saveApiKey, getApiKey, listApiKeys, exportStore } =
  await import('../src/utilities/api-key-store.js');
const { saveDocumentLocal, getDocument, listDocuments } =
  await import('../src/utilities/vault-store.js');
const { scheduleSyncPush, setSyncEnabled } = await import('../src/utilities/sync-manager.js');

const HEX64 = /^[0-9a-f]{64}$/;
// A deterministic "private key" the background worker would hand back.
const KNOWN_PRIV = '0000000000000000000000000000000000000000000000000000000000000001';

beforeEach(() => {
  local._reset();
  sync._reset();
  setUnlocked(null); // passwordless / never-locked default
  vi.useFakeTimers();
  // generateProfile asks the background worker for a fresh key.
  setSendMessage(async (msg) => {
    if (msg?.kind === 'generatePrivateKey') return KNOWN_PRIV;
    return undefined;
  });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  clearSession();    // no session key may leak into the next test...
  setUnlocked(null); // ...and the default tier is passwordless, never locked
});

describe('T0-4 — private key is never plaintext at rest (passwordless path)', () => {
  it('generateProfile wraps the private key as device-key ciphertext', async () => {
    const profile = await generateProfile('Default', 'local');

    // Not the raw hex, not any 64-hex private key.
    expect(profile.privKey).not.toBe(KNOWN_PRIV);
    expect(HEX64.test(profile.privKey)).toBe(false);

    // It is a device-key ciphertext blob.
    expect(isCiphertext(profile.privKey)).toBe(true);
    expect(isDeviceKeyBlob(profile.privKey)).toBe(true);

    // The public key is cached in cleartext (safe) and matches the wrapped key.
    expect(profile.pubKey).toBe(getPublicKeySync(KNOWN_PRIV));

    // Round-trips back to the original secret.
    expect(await decryptWithDeviceKey(profile.privKey)).toBe(KNOWN_PRIV);
  });

  it('the device wrap key is a NON-extractable AES-GCM handle', async () => {
    const key = await getDeviceKey();
    expect(key.type).toBe('secret');
    expect(key.extractable).toBe(false);
    expect(key.algorithm.name).toBe('AES-GCM');
  });
});

describe('T0-4 — API-key secrets and vault notes are ciphertext at rest', () => {
  it('saveApiKey stores ciphertext, getApiKey returns the plaintext', async () => {
    const SECRET = 'sk-live-super-secret-value';
    await saveApiKey('id-1', 'OpenAI', SECRET);

    const raw = local._dump().apiKeyVault.keys['id-1'];
    expect(raw.secret).not.toBe(SECRET);
    expect(isCiphertext(raw.secret)).toBe(true);
    expect(JSON.stringify(local._dump())).not.toContain(SECRET);

    const got = await getApiKey('id-1');
    expect(got.secret).toBe(SECRET);
  });

  it('saveDocumentLocal stores ciphertext note bodies, getDocument decrypts', async () => {
    const NOTE = 'my private seed backup and recovery words';
    await saveDocumentLocal('notes/secret.md', NOTE, 'local-only');

    const raw = local._dump().vaultDocs['notes/secret.md'];
    expect(raw.content).not.toBe(NOTE);
    expect(isCiphertext(raw.content)).toBe(true);
    expect(JSON.stringify(local._dump())).not.toContain(NOTE);

    const got = await getDocument('notes/secret.md');
    expect(got.content).toBe(NOTE);
  });
});

describe('T0-5 — sync push never emits a plaintext secret', () => {
  it('drops plaintext privKey / API secret / note content from the sync payload', async () => {
    const PLAIN_PRIV = 'a'.repeat(64);
    const PLAIN_API = 'plaintext-api-secret';
    const PLAIN_NOTE = 'plaintext note body';
    // A legitimately-encrypted API secret must survive (positive control).
    const CIPHER_SECRET = JSON.stringify({
      v: 1, k: 'device', iv: 'AAAAAAAAAAAAAAAA', ciphertext: 'Zm9v',
    });

    local._seed({
      platformSyncEnabled: true,
      profiles: [
        { name: 'p', privKey: PLAIN_PRIV, pubKey: 'b'.repeat(64), hosts: { x: 1 }, relays: [] },
      ],
      apiKeyVault: {
        keys: {
          bad: { id: 'bad', label: 'bad', secret: PLAIN_API },
          good: { id: 'good', label: 'good', secret: CIPHER_SECRET },
        },
        syncEnabled: true,
      },
      vaultDocs: {
        'n.md': { path: 'n.md', content: PLAIN_NOTE, updatedAt: 2 },
      },
    });

    await setSyncEnabled(true);
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2100); // fire the 2s debounce + flush pushToSync
    // The debounce fired on the FAKE clock; the storage write it triggers lands
    // on a real macrotask, like a real storage.sync IPC round-trip.
    await env.flushWrites();

    const dumped = JSON.stringify(sync._dump());
    // `{}` is length 2 — assert the payload is really there, not merely non-empty.
    expect(Object.keys(sync._dump()).length).toBeGreaterThan(0); // a push actually happened

    // No plaintext secret escaped to storage.sync.
    expect(dumped).not.toContain(PLAIN_PRIV);
    expect(dumped).not.toContain(PLAIN_API);
    expect(dumped).not.toContain(PLAIN_NOTE);

    // The properly-encrypted secret DID sync (guard only drops plaintext).
    expect(dumped).toContain('good');
    expect(dumped).not.toContain('"bad"');
  });
});

describe('F5 / F6 — a locked session cannot read secrets', () => {
  it('getApiKey rejects when the session is locked', async () => {
    await saveApiKey('id-locked', 'Svc', 'top-secret');
    clearSession(); // marks the session explicitly locked
    await expect(getApiKey('id-locked')).rejects.toThrow(/locked/);
  });

  it('getDocument rejects when the session is locked', async () => {
    await saveDocumentLocal('locked.md', 'confidential', 'local-only');
    clearSession();
    await expect(getDocument('locked.md')).rejects.toThrow(/locked/);
  });
});

/**
 * SV-05 — unwrapSecret and a PASSWORD blob with no session key.
 *
 * The explicit "locked" flag is only one of the two ways the key can be
 * missing. A context that was never locked (passwordless, flag `null`) or that
 * is marked unlocked without ever having been handed a key (flag `true`, the
 * half-restored worker) has no session key either, and there is nothing it can
 * legitimately return for a password blob. It must THROW: handing the caller
 * the blob string, or any stand-in value, would put ciphertext where a secret
 * is expected — and callers that re-save what they read would then persist it.
 */
describe('SV-05 — a password blob with no session key always throws', () => {
  const PASSWORD = 'correct horse battery staple';
  const SECRET = 'the secret behind the password blob';

  /** A password blob plus the key/salt that open it. */
  async function passwordBlob() {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(PASSWORD, salt);
    return { blob: await encryptWithKey(SECRET, key, salt), key, salt };
  }

  for (const [label, flag] of [
    ['never locked (passwordless context)', null],
    ['marked unlocked but holding no key', true],
    ['explicitly locked', false],
  ]) {
    it(`throws when the session is ${label}`, async () => {
      const { blob } = await passwordBlob();
      clearSession();     // ensure no session key...
      setUnlocked(flag);  // ...then set the flag under test

      await expect(unwrapSecret(blob)).rejects.toThrow(/locked/);
      // Belt and braces: it must not resolve to the blob (or anything else).
      await expect(unwrapSecret(blob)).rejects.toBeInstanceOf(Error);
    });
  }

  it('opens the very same blob once the session key is handed over', async () => {
    // Non-vacuity: the blob is real and readable — only the key was missing.
    const { blob, key, salt } = await passwordBlob();
    setSessionKey(key, salt);
    expect(await unwrapSecret(blob)).toBe(SECRET);
  });
});

/**
 * A well-formed device blob this device cannot open: correct shape (so
 * isDeviceKeyBlob passes and unwrapSecret actually attempts a decrypt), wrong
 * key material (so AES-GCM authentication fails). This is what a blob wrapped
 * under a rotated-away Safari IndexedDB origin looks like on the next install.
 */
function undecryptableBlob() {
  return JSON.stringify({
    v: 1,
    k: 'device',
    iv: 'AAAAAAAAAAAAAAAA',
    ciphertext: 'AAAAAAAAAAAAAAAAAAAAAAAA',
  });
}

/**
 * An undecryptable secret is a PROBLEM, not an empty value.
 *
 * Rendering it as `''` made the failure invisible, and — far worse —
 * exportStore() then wrote that empty string into the user's encrypted backup,
 * so restoring the backup replaced the only surviving copy (the ciphertext)
 * with nothing. Silent, propagating loss.
 */
describe('undecryptable secrets are surfaced, never rendered or exported as empty', () => {
  it('listApiKeys / getApiKey flag the key instead of blanking the secret', async () => {
    await local.set({
      apiKeyVault: {
        keys: {
          bad: {
            id: 'bad', label: 'Rotated', secret: undecryptableBlob(),
            createdAt: 1, updatedAt: 1, profileScope: null,
          },
        },
        syncEnabled: true, eventId: null, relayCreatedAt: null, syncStatus: 'synced',
      },
    });

    const one = await getApiKey('bad');
    expect(one.undecryptable).toBe(true);
    expect(one.secret).toBeNull();
    expect(one.secret).not.toBe(''); // the old silent-blank shape

    const all = await listApiKeys();
    expect(all).toHaveLength(1);
    expect(all[0].undecryptable).toBe(true);
    expect(all[0].secret).toBeNull();
  });

  it('exportStore carries the ciphertext through and never exports an empty secret', async () => {
    const cipher = undecryptableBlob();
    await saveApiKey('good', 'Readable', 'sk-readable');
    await local.set({
      apiKeyVault: {
        ...(await local.get({ apiKeyVault: null })).apiKeyVault,
        keys: {
          ...(await local.get({ apiKeyVault: null })).apiKeyVault.keys,
          bad: {
            id: 'bad', label: 'Rotated', secret: cipher,
            createdAt: 1, updatedAt: 1, profileScope: null,
          },
        },
      },
    });

    const { keys, undecryptable } = await exportStore();

    // The readable one exports decrypted, as before.
    expect(keys.good.secret).toBe('sk-readable');
    // The unreadable one exports as the UNTOUCHED ciphertext — not '' and not
    // null. Anything else is the backup overwriting the last copy with nothing.
    expect(keys.bad.secret).toBe(cipher);
    expect(keys.bad.secret).not.toBe('');
    expect(keys.bad.secret).not.toBeNull();
    // And the caller is told, so the user can be told.
    expect(undecryptable).toEqual(['Rotated']);
  });

  it('vault docs flag undecryptable content instead of returning an empty note', async () => {
    await local.set({
      vaultDocs: {
        'rotated.md': {
          path: 'rotated.md', content: undecryptableBlob(), updatedAt: 2,
          syncStatus: 'synced', eventId: null, relayCreatedAt: null,
          profileScope: null,
        },
      },
    });

    const doc = await getDocument('rotated.md');
    expect(doc.undecryptable).toBe(true);
    expect(doc.content).toBeNull();
    expect(doc.content).not.toBe('');

    const listed = await listDocuments();
    expect(listed[0].undecryptable).toBe(true);
    expect(listed[0].content).toBeNull();

    // The ciphertext at rest is untouched — nothing was destroyed on read.
    const raw = (await local.get({ vaultDocs: {} })).vaultDocs['rotated.md'];
    expect(raw.content).toBe(undecryptableBlob());
  });
});
