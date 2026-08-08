/**
 * Security regressions — one killing test per surviving at-rest / session
 * mutation.
 *
 * Every case here pins an invariant that the rest of the suite states in prose
 * but never actually asserts, so a one-line deletion in src used to sail
 * through green. Each `it` is written so that removing the named guard from
 * src turns it RED:
 *
 *   utils.removePasswordProtection  — dropping `wrapSecret` writes raw 64-hex
 *                                     private keys to disk (T0-4 downgrade).
 *   utils.encryptAllKeys            — dropping the `isEncryptedBlob` guard
 *                                     double-encrypts an already-password
 *                                     blob, so the password no longer opens it
 *                                     in one pass.
 *   utils.isEncrypted               — dropping the passwordHash fallback lets a
 *                                     stale `isEncrypted:false` present a
 *                                     password vault as passwordless.
 *   api-key-store.importStore       — dropping `wrapSecret` lands a plaintext
 *                                     API secret in storage.local.
 *   background.restoreSessionState  — dropping the lockAt check resumes a
 *                                     session the user's auto-lock already
 *                                     expired; dropping setVaultSessionKey
 *                                     resumes HALF unlocked (reads work, every
 *                                     secret-vault write/read silently falls
 *                                     back to the device key or throws).
 *   background.lockSession          — dropping clearVaultSession leaves the
 *                                     secret vault handing out plaintext after
 *                                     the vault is locked.
 *
 * The background cases drive the REAL worker through the fake `chrome`
 * namespace + storage.session, the same way session-vault.test.js does, because
 * these bugs live in the seam between the worker and the secret vault.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { encrypt, decrypt, hashPassword } from '../src/utilities/crypto.js';

const PASSWORD = 'correct horse battery staple';
// Demo keys only: secp256k1 generator multiples (priv = 1, 2). Never a real key.
const HEX_A = '0000000000000000000000000000000000000000000000000000000000000001';
const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
const HEX64 = /^[0-9a-f]{64}$/;
// Obvious fake — this is the string we assert must never reach storage.
const FAKE_API_SECRET = 'sk-test-not-a-real-secret-000';

/** Let the background's async startup IIFE run to completion. */
async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

/** Boot a fresh copy of the real background worker against a fresh fake chrome. */
async function bootBackground({ seedLocal = {}, seedSession = null, session = false } = {}) {
    vi.resetModules();
    const env = installFakeChrome({ session, alarms: true });
    env.local._seed(seedLocal);
    if (seedSession && env.session) env.session._seed(seedSession);
    env.setSendMessage((msg) => env.dispatch(msg));
    await import('../src/background.js');
    await settle();
    return env;
}

/** A password-protected vault at rest: hash + salt + isEncrypted. */
async function passwordVault(extra = {}) {
    const { hash, salt } = await hashPassword(PASSWORD);
    return {
        isEncrypted: true,
        passwordHash: hash,
        passwordSalt: salt,
        autoLockMinutes: 0,
        profileIndex: 0,
        ...extra,
    };
}

function profile(name, privKey, type = 'local') {
    return { name, privKey, pubKey: '', hosts: {}, relays: [], type };
}

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('T0-4 — removing the master password must not downgrade keys to plaintext', () => {
    it('re-wraps every profile key under the device key instead of storing hex', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const utils = await import('../src/utilities/utils.js');
        const vault = await import('../src/utilities/secret-vault.js');

        env.local._seed({
            ...env.local._dump(),
            ...await passwordVault({
                profiles: [
                    profile('A', await encrypt(HEX_A, PASSWORD)),
                    profile('B', await encrypt(HEX_B, PASSWORD)),
                    profile('Bunker', '', 'bunker'),
                ],
            }),
        });

        await utils.removePasswordProtection(PASSWORD);
        await env.flushWrites();

        const dump = env.local._dump();
        // The password itself is gone…
        expect(dump.isEncrypted).toBe(false);
        expect(dump.passwordHash).toBeNull();
        expect(dump.passwordSalt).toBeNull();

        // …but nothing was downgraded to a raw key on disk.
        for (const p of dump.profiles) {
            if (p.type === 'bunker') continue;
            expect(HEX64.test(p.privKey)).toBe(false);
            expect(vault.isDeviceKeyBlob(p.privKey)).toBe(true);
        }
        // Not one raw key anywhere in the storage image.
        const image = JSON.stringify(dump);
        expect(image).not.toContain(HEX_A);
        expect(image).not.toContain(HEX_B);

        // And the keys are still recoverable — the re-wrap is lossless.
        expect(await vault.unwrapSecret(dump.profiles[0].privKey)).toBe(HEX_A);
        expect(await vault.unwrapSecret(dump.profiles[1].privKey)).toBe(HEX_B);
    });

    it('leaves a device-wrapped key wrapped when the password is removed', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const vault = await import('../src/utilities/secret-vault.js');
        const deviceBlob = await vault.encryptWithDeviceKey(HEX_B);
        const utils = await import('../src/utilities/utils.js');

        env.local._seed({
            ...env.local._dump(),
            ...await passwordVault({
                profiles: [
                    profile('Password blob', await encrypt(HEX_A, PASSWORD)),
                    profile('Device blob', deviceBlob), // the 1.8.0 mixed state
                ],
            }),
        });

        await utils.removePasswordProtection(PASSWORD);
        await env.flushWrites();

        for (const p of env.local._dump().profiles) {
            expect(HEX64.test(p.privKey)).toBe(false);
            expect(vault.isDeviceKeyBlob(p.privKey)).toBe(true);
        }
    });
});

describe('encryptAllKeys — setting a password must not double-encrypt', () => {
    it('leaves an already-password-encrypted blob byte-identical and singly decryptable', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const utils = await import('../src/utilities/utils.js');

        const blobA = await encrypt(HEX_A, PASSWORD);
        env.local._seed({
            ...env.local._dump(),
            profiles: [profile('A', blobA)],
            profileIndex: 0,
        });

        // A second setPassword over an already-encrypted vault (password change
        // aborted midway, repeated "set password" click, re-run migration).
        await utils.encryptAllKeys(PASSWORD);
        await env.flushWrites();

        const stored = env.local._dump().profiles[0].privKey;
        // Untouched: the guard `continue`s before re-encrypting.
        expect(stored).toBe(blobA);
        // ONE decrypt returns the key, not another blob.
        const opened = await decrypt(stored, PASSWORD);
        expect(opened).toBe(HEX_A);
        expect(utils.isEncryptedBlob(opened)).toBe(false);
    });

    it('still converts a device blob to a password blob in the same pass', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const vault = await import('../src/utilities/secret-vault.js');
        const deviceBlob = await vault.encryptWithDeviceKey(HEX_B);
        const utils = await import('../src/utilities/utils.js');

        const blobA = await encrypt(HEX_A, PASSWORD);
        env.local._seed({
            ...env.local._dump(),
            profiles: [profile('Already', blobA), profile('Device', deviceBlob)],
            profileIndex: 0,
        });

        await utils.encryptAllKeys(PASSWORD);
        await env.flushWrites();

        const profiles = env.local._dump().profiles;
        expect(profiles[0].privKey).toBe(blobA);            // skipped
        expect(await decrypt(profiles[0].privKey, PASSWORD)).toBe(HEX_A);
        expect(vault.isDeviceKeyBlob(profiles[1].privKey)).toBe(false); // converted
        expect(await decrypt(profiles[1].privKey, PASSWORD)).toBe(HEX_B);
        expect(env.local._dump().isEncrypted).toBe(true);
    });
});

describe('isEncrypted — a stale flag must not present a password vault as passwordless', () => {
    it('treats passwordHash + isEncrypted:false as encrypted and self-heals the flag', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const utils = await import('../src/utilities/utils.js');
        const { hash, salt } = await hashPassword(PASSWORD);

        // The crashed-service-worker shape: the hash landed, the flag did not.
        env.local._seed({
            ...env.local._dump(),
            isEncrypted: false,
            passwordHash: hash,
            passwordSalt: salt,
            profiles: [profile('A', await encrypt(HEX_A, PASSWORD))],
        });

        expect(await utils.isEncrypted()).toBe(true);
        await env.flushWrites();
        expect(env.local._dump().isEncrypted).toBe(true);
        // Idempotent: the healed flag alone still reads as encrypted.
        expect(await utils.isEncrypted()).toBe(true);
    });

    it('does NOT infer a password from ciphertext alone (passwordless stays passwordless)', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const vault = await import('../src/utilities/secret-vault.js');
        const deviceBlob = await vault.encryptWithDeviceKey(HEX_A);
        const utils = await import('../src/utilities/utils.js');

        env.local._seed({
            ...env.local._dump(),
            isEncrypted: false,
            passwordHash: null,
            profiles: [profile('A', deviceBlob), profile('B', await encrypt(HEX_B, PASSWORD))],
        });

        // A stray password-style blob must never latch the vault into a
        // lockable state with no recoverable password.
        expect(await utils.isEncrypted()).toBe(false);
        await env.flushWrites();
        expect(env.local._dump().isEncrypted).toBe(false);
    });
});

describe('api-key-store.importStore — an import must never write a plaintext secret', () => {
    it('wraps a plaintext secret from a backup/relay fetch before it touches storage', async () => {
        vi.resetModules();
        vi.useFakeTimers(); // swallow scheduleSyncPush's 2s timer
        try {
            const env = installFakeChrome();
            const store = await import('../src/utilities/api-key-store.js');
            const vault = await import('../src/utilities/secret-vault.js');

            await store.importStore({
                k1: {
                    id: 'k1',
                    label: 'Imported',
                    secret: FAKE_API_SECRET, // decrypted backup / relay payload
                    createdAt: 1,
                    updatedAt: 2,
                },
            });
            await env.flushWrites();

            const raw = env.local._dump().apiKeyVault.keys.k1;
            expect(raw.secret).not.toBe(FAKE_API_SECRET);
            expect(vault.isCiphertext(raw.secret)).toBe(true);
            expect(vault.isDeviceKeyBlob(raw.secret)).toBe(true);
            // Nowhere in the whole storage image, not just this field.
            expect(JSON.stringify(env.local._dump())).not.toContain(FAKE_API_SECRET);
            // Metadata still rides through untouched.
            expect(raw.label).toBe('Imported');
            expect(raw.createdAt).toBe(1);

            // …and the import is lossless for the caller.
            expect((await store.getApiKey('k1')).secret).toBe(FAKE_API_SECRET);
        } finally {
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });

    it('passes existing ciphertext through without re-wrapping it', async () => {
        vi.resetModules();
        vi.useFakeTimers();
        try {
            const env = installFakeChrome();
            const vault = await import('../src/utilities/secret-vault.js');
            const blob = await vault.encryptWithDeviceKey(FAKE_API_SECRET);
            const store = await import('../src/utilities/api-key-store.js');

            await store.importStore({ k1: { id: 'k1', label: 'Ciphered', secret: blob } });
            await env.flushWrites();

            expect(env.local._dump().apiKeyVault.keys.k1.secret).toBe(blob);
            expect((await store.getApiKey('k1')).secret).toBe(FAKE_API_SECRET);
        } finally {
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });
});

describe('restoreSessionState — a parked session past its auto-lock deadline must not resume', () => {
    it('stays locked, wipes the stale parked state and refuses secret reads', async () => {
        const seedLocal = await passwordVault({
            autoLockMinutes: 15, // a real deadline lands in the parked state
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const env = await bootBackground({ seedLocal, session: true });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        await env.flushWrites();

        const parked = env.session._dump().nkSessionState;
        expect(parked.lockAt).toBeGreaterThan(Date.now());

        // The worker was evicted and the browser sat idle past the deadline —
        // storage.session survived (it dies with the BROWSER, not the worker),
        // so the deadline is the only thing standing between an evicted worker
        // and an auto-lock that never happens.
        const expired = { ...parked, lockAt: Date.now() - 1000 };
        const restarted = await bootBackground({
            seedLocal: { ...env.local._dump() },
            seedSession: { nkSessionState: expired },
            session: true,
        });

        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(true);
        await restarted.flushWrites();
        expect(restarted.session._dump().nkSessionState).toBeUndefined();

        // No key material leaked into the resumed context.
        const vault = await import('../src/utilities/secret-vault.js');
        await expect(vault.unwrapSecret(await encrypt(HEX_B, PASSWORD)))
            .rejects.toThrow(/locked/i);
        expect(vault.hasSessionKey()).toBe(false);
        const nsec = await restarted.dispatch({ kind: 'getNsec', payload: 0 });
        expect(String(nsec ?? '')).not.toMatch(/^nsec1/);
    });

    it('resumes normally when the deadline is still in the future', async () => {
        const seedLocal = await passwordVault({
            autoLockMinutes: 15,
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const env = await bootBackground({ seedLocal, session: true });
        await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        await env.flushWrites();

        const restarted = await bootBackground({
            seedLocal: { ...env.local._dump() },
            seedSession: { nkSessionState: env.session._dump().nkSessionState },
            session: true,
        });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(false);
    });
});

describe('restoreSessionState — a resumed worker must hand the vault its session key', () => {
    it('routes secret-vault writes through the PASSWORD key, not silently to the device key', async () => {
        const seedLocal = await passwordVault({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const env = await bootBackground({ seedLocal, session: true });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        await env.flushWrites();

        // A secret wrapped under the PRE-restart session key. The parked
        // `keyRaw` carries those exact bytes forward, so a correctly resumed
        // worker can still open it.
        const vaultBefore = await import('../src/utilities/secret-vault.js');
        const blobBefore = await vaultBefore.wrapSecret(HEX_A);
        expect(vaultBefore.isPasswordBlob(blobBefore)).toBe(true);

        const restarted = await bootBackground({
            seedLocal: { ...env.local._dump() },
            seedSession: { nkSessionState: env.session._dump().nkSessionState },
            session: true,
        });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(false);

        // Same module registry as the worker: this is the vault the worker fed.
        const vault = await import('../src/utilities/secret-vault.js');
        expect(vault.hasSessionKey()).toBe(true);

        // Writes: a resumed worker must still produce PASSWORD blobs. Without
        // the handoff wrapSecret falls through to the device key and quietly
        // plants a device blob inside a password vault (the F1 shape).
        const wrapped = await vault.wrapSecret(HEX_B);
        expect(vault.isDeviceKeyBlob(wrapped)).toBe(false);
        expect(vault.isPasswordBlob(wrapped)).toBe(true);
        expect(await decrypt(wrapped, PASSWORD)).toBe(HEX_B);

        // Reads: a blob written before the eviction still opens, rather than
        // throwing "no session key available to decrypt secret".
        expect(await vault.unwrapSecret(blobBefore)).toBe(HEX_A);
    });
});

describe('lockSession — the secret vault must refuse reads once the vault is locked', () => {
    it('rejects unwrapSecret for password AND device blobs after `lock`', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
            session: true,
        });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        const vault = await import('../src/utilities/secret-vault.js');
        // Written through the live session, exactly as the extension would.
        const passwordBlob = await vault.wrapSecret(HEX_A);
        const deviceBlob = await vault.encryptWithDeviceKey(HEX_B);
        expect(vault.isPasswordBlob(passwordBlob)).toBe(true);
        // Sanity: while unlocked both are readable.
        expect(await vault.unwrapSecret(passwordBlob)).toBe(HEX_A);
        expect(await vault.unwrapSecret(deviceBlob)).toBe(HEX_B);

        await env.dispatch({ kind: 'lock' });

        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(vault.hasSessionKey()).toBe(false);
        await expect(vault.unwrapSecret(passwordBlob)).rejects.toThrow(/locked/i);
        // The device key is still present in this context, so only the explicit
        // lock flag stops a locked page from reading a device-wrapped secret.
        await expect(vault.unwrapSecret(deviceBlob)).rejects.toThrow(/locked/i);
    });

    it('makes the API-key store refuse to hand out secrets after `lock`', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
            session: true,
        });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        // Only now: the worker has booted (bootBackground needs a real clock),
        // and from here the fake clock swallows scheduleSyncPush's 2s timer.
        vi.useFakeTimers();
        try {
            const store = await import('../src/utilities/api-key-store.js');
            await store.saveApiKey('k1', 'Imported', FAKE_API_SECRET);
            await env.flushWrites();
            expect((await store.getApiKey('k1')).secret).toBe(FAKE_API_SECRET);

            await env.dispatch({ kind: 'lock' });

            await expect(store.getApiKey('k1')).rejects.toThrow(/locked/i);
            await expect(store.listApiKeys()).rejects.toThrow(/locked/i);
        } finally {
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });
});
