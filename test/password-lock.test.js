/**
 * Password & Lock lifecycle — driven against the REAL background worker.
 *
 * This suite used to build a `createLockState()` fake whose "encryption" was the
 * string `hash:${password}`. It therefore passed against an empty implementation:
 * every assertion exercised the fake's own comparator, never
 * `background.js`'s unlockSession / lockSession / setPassword / changePassword /
 * removePassword, and never crypto.js's PBKDF2 at all.
 *
 * Everything below now goes through `chrome.runtime.onMessage` — the same
 * channel the side panel and the security page use — against a fake `chrome`
 * namespace, and asserts what is actually AT REST in storage.local:
 *
 *   - a master password produces real AES-GCM password blobs (salt/iv/ciphertext)
 *     that only the real password opens, and a salted PBKDF2 verifier that is
 *     never the password and never repeats across salts;
 *   - lock really evicts the decrypted keys (getNsec goes dark), unlock really
 *     restores them;
 *   - the brute-force cooldown after 3 bad unlocks is real and refuses even the
 *     CORRECT password while it is running;
 *   - changePassword re-encrypts every blob so the OLD password stops working
 *     on the ciphertext at rest, not merely on a comparator;
 *   - removePassword drops to the DEVICE-key tier — it must never leave a
 *     private key as plaintext at rest (T0-4) — and carries the API-key secrets
 *     and note bodies the same session wrapped along with it;
 *   - a vault holding password blobs with no verifier is detected, offered the
 *     unlock surface, and recovered onto the device key by the password that
 *     was removed — while a wrong password changes nothing;
 *   - a verifier that is half-missing fails CLOSED: no password is accepted;
 *   - lock clears the session KEY itself, not just the decrypted key cache;
 *   - the auto-lock timeout is an allowlist, and the alarm it schedules is what
 *     actually locks the session.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { encrypt, decrypt, hashPassword, verifyPassword } from '../src/utilities/crypto.js';

const PASSWORD = 'correct horse battery staple';
const NEW_PASSWORD = 'a totally different passphrase';
// secp256k1 generator multiples — demo material, never a real secret.
const HEX_A = '0000000000000000000000000000000000000000000000000000000000000001';
const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';

/** Let the background's async startup IIFE (and any queued write) settle. */
async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

/**
 * Boot a fresh copy of the background worker against a fresh fake chrome.
 * Seeds land BEFORE the import so the startup path sees them, exactly like a
 * real worker start.
 */
async function bootBackground(seedLocal = {}, { session = false, seedSession = null } = {}) {
    vi.resetModules();
    const env = installFakeChrome({ alarms: true, session });
    env.local._seed(seedLocal);
    if (seedSession && env.session) env.session._seed(seedSession);
    await import('../src/background.js');
    await settle();
    return env;
}

/**
 * Load the REAL utils module against a fresh fake chrome holding `seedLocal`,
 * without booting the background worker — for the storage-shape checks that
 * have no message-path equivalent.
 */
async function importUtilsWith(seedLocal = {}) {
    vi.resetModules();
    const env = installFakeChrome();
    env.local._seed(seedLocal);
    const utils = await import('../src/utilities/utils.js');
    return { env, utils };
}

function profile(name, privKey) {
    return { name, privKey, pubKey: '', hosts: {}, relays: [], type: 'local' };
}

/** A passwordless vault holding plaintext-hex keys (the pre-password state). */
function plainVault(extra = {}) {
    return {
        profiles: [profile('P1', HEX_A), profile('P2', HEX_B)],
        profileIndex: 0,
        isEncrypted: false,
        autoLockMinutes: 0, // no timer unless a test asks for one
        ...extra,
    };
}

/** A vault already protected by PASSWORD, at rest. */
async function passwordVault(extra = {}) {
    const { hash, salt } = await hashPassword(PASSWORD);
    return {
        profiles: [
            profile('P1', await encrypt(HEX_A, PASSWORD)),
            profile('P2', await encrypt(HEX_B, PASSWORD)),
        ],
        profileIndex: 0,
        isEncrypted: true,
        passwordHash: hash,
        passwordSalt: salt,
        autoLockMinutes: 0,
        ...extra,
    };
}

/**
 * A vault a "remove master password" left half-converted: no verifier on file,
 * every profile key still wrapped under PASSWORD.
 */
async function strandedVault(extra = {}) {
    return {
        profiles: [
            profile('P1', await encrypt(HEX_A, PASSWORD)),
            profile('P2', await encrypt(HEX_B, PASSWORD)),
        ],
        profileIndex: 0,
        isEncrypted: false,
        passwordHash: null,
        passwordSalt: null,
        autoLockMinutes: 0,
        ...extra,
    };
}

const API_SECRET = 'sk-test-not-a-real-credential';
const NOTE_BODY = '# seed backup location';

/** The two secret stores a password session also wraps, as password blobs. */
async function secondaryStores() {
    return {
        apiKeyVault: {
            keys: {
                k1: {
                    id: 'k1', label: 'Test key', secret: await encrypt(API_SECRET, PASSWORD),
                    createdAt: 1, updatedAt: 1, profileScope: null,
                },
            },
            syncEnabled: false,
        },
        vaultDocs: {
            'note.md': {
                path: 'note.md', content: await encrypt(NOTE_BODY, PASSWORD),
                updatedAt: 1, syncStatus: 'local', eventId: null, relayCreatedAt: null,
            },
        },
    };
}

/** Both secondary secrets open on the device key, and not on PASSWORD. */
async function expectSecondaryStoresOnDeviceTier(env) {
    const { isDeviceKeyBlob, decryptWithDeviceKey } =
        await import('../src/utilities/secret-vault.js');
    const dump = env.local._dump();
    const secret = dump.apiKeyVault.keys.k1.secret;
    const body = dump.vaultDocs['note.md'].content;

    expect(isDeviceKeyBlob(secret)).toBe(true);
    expect(isDeviceKeyBlob(body)).toBe(true);
    expect(await decryptWithDeviceKey(secret)).toBe(API_SECRET);
    expect(await decryptWithDeviceKey(body)).toBe(NOTE_BODY);
    await expect(decrypt(secret, PASSWORD)).rejects.toThrow();
    await expect(decrypt(body, PASSWORD)).rejects.toThrow();
}

const isPasswordBlobShape = (v) => {
    try {
        const p = JSON.parse(v);
        return !!(p.salt && p.iv && p.ciphertext);
    } catch { return false; }
};

afterEach(() => {
    vi.useRealTimers();
    delete globalThis.chrome;
});

describe('setPassword — real password-derived encryption', () => {
    it('replaces plaintext keys with AES-GCM blobs only the real password opens', async () => {
        const env = await bootBackground(plainVault());

        const res = await env.dispatch({ kind: 'setPassword', payload: PASSWORD });
        expect(res.success).toBe(true);
        await env.flushWrites();

        const stored = env.local._dump().profiles;
        for (const [i, hex] of [HEX_A, HEX_B].entries()) {
            // Not plaintext, not a `hash:${password}` stand-in — a real blob.
            expect(stored[i].privKey).not.toBe(hex);
            expect(stored[i].privKey).not.toContain(PASSWORD);
            expect(isPasswordBlobShape(stored[i].privKey)).toBe(true);
            // The real password opens it...
            expect(await decrypt(stored[i].privKey, PASSWORD)).toBe(hex);
            // ...and a wrong one does not (AEAD, not a string compare).
            await expect(decrypt(stored[i].privKey, 'wrong password')).rejects.toThrow();
        }
    });

    it('stores a salted PBKDF2 verifier, never the password, and never the same twice', async () => {
        const env = await bootBackground(plainVault());
        await env.dispatch({ kind: 'setPassword', payload: PASSWORD });
        await env.flushWrites();

        const { passwordHash, passwordSalt } = env.local._dump();
        expect(passwordHash).toBeTruthy();
        expect(passwordSalt).toBeTruthy();
        expect(passwordHash).not.toBe(PASSWORD);
        expect(passwordHash).not.toContain(PASSWORD);
        expect(passwordHash).not.toBe(`hash:${PASSWORD}`);
        // It really is a verifier for THIS password and nothing else.
        expect(await verifyPassword(PASSWORD, passwordHash, passwordSalt)).toBe(true);
        expect(await verifyPassword(PASSWORD + 'x', passwordHash, passwordSalt)).toBe(false);

        // A second vault with the SAME password must not produce the same hash —
        // proof the salt is actually mixed in.
        const env2 = await bootBackground(plainVault());
        await env2.dispatch({ kind: 'setPassword', payload: PASSWORD });
        await env2.flushWrites();
        expect(env2.local._dump().passwordHash).not.toBe(passwordHash);
    });

    it('caches pubKeys before encrypting so npub survives a lock', async () => {
        const env = await bootBackground(plainVault());
        await env.dispatch({ kind: 'setPassword', payload: PASSWORD });
        await env.flushWrites();

        const stored = env.local._dump().profiles;
        expect(stored[0].pubKey).toMatch(/^[0-9a-f]{64}$/);

        await env.dispatch({ kind: 'lock' });
        expect(await env.dispatch({ kind: 'getNpub', payload: 0 })).toMatch(/^npub1/);
    });

    it('reports encrypted and unlocked immediately after setPassword', async () => {
        const env = await bootBackground(plainVault());
        await env.dispatch({ kind: 'setPassword', payload: PASSWORD });
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(true);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
    });
});

describe('lock / unlock — the session cache is what actually gates key access', () => {
    it('lock evicts the decrypted keys: getNsec goes dark, unlock restores it', async () => {
        const env = await bootBackground(await passwordVault());

        // Locked at startup: the blob is on disk but no session key exists.
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();

        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        const nsec = await env.dispatch({ kind: 'getNsec', payload: 0 });
        expect(nsec).toMatch(/^nsec1/);

        await env.dispatch({ kind: 'lock' });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();

        // And it comes back — the ciphertext at rest was never damaged.
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBe(nsec);
    });

    it('rejects a wrong password and stays locked', async () => {
        const env = await bootBackground(await passwordVault());
        const res = await env.dispatch({ kind: 'unlock', payload: 'not the password' });
        expect(res).toMatchObject({ success: false, error: 'Invalid password' });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
    });

    it('refuses a near-miss password (one character off)', async () => {
        const env = await bootBackground(await passwordVault());
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD + ' ' })).success).toBe(false);
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD.slice(0, -1) })).success).toBe(false);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
    });

    it('never reports locked when no master password is set', async () => {
        // `lock` is not refused in the passwordless tier — it is simply moot,
        // because checkLockState() resolves lock state from isEncrypted.
        const env = await bootBackground(plainVault());
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(false);
        await env.dispatch({ kind: 'lock' });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        // Device-tier keys stay readable — that is the passwordless contract.
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });

    it('applies a brute-force cooldown after 3 failures — even the CORRECT password waits', async () => {
        const env = await bootBackground(await passwordVault());

        for (let i = 0; i < 3; i++) {
            expect((await env.dispatch({ kind: 'unlock', payload: 'nope' })).error)
                .toBe('Invalid password');
        }

        const blocked = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(blocked.success).toBe(false);
        expect(blocked.error).toMatch(/Too many attempts/);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
    });

    it('clears the failure counter after a successful unlock', async () => {
        const env = await bootBackground(await passwordVault());
        await env.dispatch({ kind: 'unlock', payload: 'nope' });
        await env.dispatch({ kind: 'unlock', payload: 'nope' });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        await env.dispatch({ kind: 'lock' });
        // Two more failures must NOT trip the cooldown (counter was reset).
        await env.dispatch({ kind: 'unlock', payload: 'nope' });
        await env.dispatch({ kind: 'unlock', payload: 'nope' });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
    });
});

describe('UT-08 — a half-missing verifier fails CLOSED', () => {
    /**
     * `checkPassword` is the single gate in front of unlock, changePassword and
     * removePassword. It reads BOTH halves of the verifier and returns false
     * unless both are there, so a vault whose `passwordHash` or `passwordSalt`
     * did not survive (a partial write, a sync that carried profiles but not the
     * local verifier) accepts NO password instead of every password.
     */
    const HALVES = [
        ['passwordHash missing', { passwordSalt: 'c2FsdA==' }],
        ['passwordSalt missing', { passwordHash: 'aGFzaA==' }],
        ['both missing', {}],
    ];

    for (const [label, verifier] of HALVES) {
        it(`checkPassword returns false when ${label}`, async () => {
            const { utils } = await importUtilsWith({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
                profileIndex: 0,
                isEncrypted: true,
                ...verifier,
            });
            // Not the real password, not an empty one, not anything.
            for (const attempt of [PASSWORD, '', 'anything at all']) {
                expect(await utils.checkPassword(attempt)).toBe(false);
            }
        });

        it(`unlock refuses every password when ${label}`, async () => {
            const env = await bootBackground({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
                profileIndex: 0,
                isEncrypted: true,
                autoLockMinutes: 0,
                ...verifier,
            });
            expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
            expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(false);
            expect((await env.dispatch({ kind: 'unlock', payload: '' })).success).toBe(false);
            expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
            expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
        });
    }

    it('accepts the real password when BOTH halves are present', async () => {
        // Non-vacuity: the same helper says true for an intact verifier.
        const { hash, salt } = await hashPassword(PASSWORD);
        const { utils } = await importUtilsWith({
            isEncrypted: true, passwordHash: hash, passwordSalt: salt,
        });
        expect(await utils.checkPassword(PASSWORD)).toBe(true);
        expect(await utils.checkPassword(PASSWORD + 'x')).toBe(false);
    });
});

describe('BG-04 — lock clears the session key itself', () => {
    /**
     * Refusing reads is not enough: `lockSession` must drop the derived key
     * material too — `sessionCryptoKey`, its raw bytes and its salt — or a
     * locked worker can still WRITE password blobs.
     *
     * Those are module-private, so they are asserted through the only surfaces
     * that read them: `wrapPrivKey` / `savePrivateKey` refuse without
     * `sessionCryptoKey`, and the parked `nkSessionState` (the sole mirror of
     * `sessionKeyRaw` / `sessionKeySalt`) is gone, so a restarted worker cannot
     * rebuild a session from it either.
     */
    it('after lock, nothing can wrap a secret and nothing is left parked', async () => {
        const env = await bootBackground(await passwordVault(), { session: true });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        await env.flushWrites();

        // Unlocked: the worker holds a usable session key and has mirrored it.
        expect((await env.dispatch({ kind: 'wrapPrivKey', payload: HEX_B })).success).toBe(true);
        const parked = env.session._dump().nkSessionState;
        expect(parked.keyRaw).toBeTruthy();
        expect(parked.salt).toBeTruthy();

        await env.dispatch({ kind: 'lock' });
        await env.flushWrites();

        // sessionCryptoKey is null — both writers that need it refuse.
        expect(await env.dispatch({ kind: 'wrapPrivKey', payload: HEX_B }))
            .toMatchObject({ success: false, error: expect.stringMatching(/locked/i) });
        expect(await env.dispatch({ kind: 'savePrivateKey', payload: [0, HEX_B] }))
            .toMatchObject({ success: false, error: expect.stringMatching(/locked/i) });
        // sessionKeyRaw / sessionKeySalt are gone with their mirror.
        expect(env.session._dump().nkSessionState).toBeUndefined();
        // The key on disk was not damaged by any of that.
        expect(isPasswordBlobShape(env.local._dump().profiles[0].privKey)).toBe(true);
    });

    it('a worker restarted after a lock cannot resume the session', async () => {
        const env = await bootBackground(await passwordVault(), { session: true });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        await env.flushWrites();
        await env.dispatch({ kind: 'lock' });
        await env.flushWrites();

        const restarted = await bootBackground(env.local._dump(), {
            session: true,
            seedSession: env.session._dump(),
        });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await restarted.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
        expect((await restarted.dispatch({ kind: 'wrapPrivKey', payload: HEX_B })).success).toBe(false);
    });
});

describe('changePassword — the ciphertext at rest is re-keyed', () => {
    it('re-encrypts every blob so the old password no longer opens it', async () => {
        const env = await bootBackground(await passwordVault());
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        const res = await env.dispatch({
            kind: 'changePassword',
            payload: { oldPassword: PASSWORD, newPassword: NEW_PASSWORD },
        });
        expect(res.success).toBe(true);
        await env.flushWrites();

        const stored = env.local._dump().profiles;
        for (const [i, hex] of [HEX_A, HEX_B].entries()) {
            expect(await decrypt(stored[i].privKey, NEW_PASSWORD)).toBe(hex);
            await expect(decrypt(stored[i].privKey, PASSWORD)).rejects.toThrow();
        }

        // The verifier moved too.
        const { passwordHash, passwordSalt } = env.local._dump();
        expect(await verifyPassword(NEW_PASSWORD, passwordHash, passwordSalt)).toBe(true);
        expect(await verifyPassword(PASSWORD, passwordHash, passwordSalt)).toBe(false);

        // And the live session followed the new password.
        await env.dispatch({ kind: 'lock' });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(false);
        expect((await env.dispatch({ kind: 'unlock', payload: NEW_PASSWORD })).success).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });

    it('rejects a wrong current password and leaves the vault untouched', async () => {
        const env = await bootBackground(await passwordVault());
        const before = JSON.stringify(env.local._dump().profiles);

        const res = await env.dispatch({
            kind: 'changePassword',
            payload: { oldPassword: 'wrong', newPassword: NEW_PASSWORD },
        });
        expect(res).toMatchObject({ success: false, error: 'Invalid current password' });
        await env.flushWrites();

        expect(JSON.stringify(env.local._dump().profiles)).toBe(before);
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
    });
});

describe('removePassword — drops to the device tier, never to plaintext', () => {
    /**
     * The tier of the re-wrap is the whole point of this test: after removal
     * every key must open WITHOUT the password that was removed, and the
     * removed password must not open any of them. Do not weaken it — the two
     * layers that hold it up (an explicit `encryptWithDeviceKey` at the re-wrap
     * site, and the vault session dropped to the device tier before the pass
     * runs) are each independently sufficient, so a green run here after a
     * source change is only meaningful with both still in place.
     */
    it('re-wraps every key under the DEVICE key instead of the removed password', async () => {
        const env = await bootBackground(await passwordVault());
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        expect(await env.dispatch({ kind: 'removePassword', payload: PASSWORD }))
            .toMatchObject({ success: true });
        await env.flushWrites();

        const { isDeviceKeyBlob, isCiphertext } =
            await import('../src/utilities/secret-vault.js');

        const stored = env.local._dump().profiles;
        for (const [i, hex] of [HEX_A, HEX_B].entries()) {
            // T0-4: removing the password must NOT put the raw key on disk...
            expect(stored[i].privKey).not.toBe(hex);
            expect(isCiphertext(stored[i].privKey)).toBe(true);
            // ...and it must be openable WITHOUT the removed password.
            expect(isDeviceKeyBlob(stored[i].privKey)).toBe(true);
            // The removed password must no longer open the ciphertext at rest.
            await expect(decrypt(stored[i].privKey, PASSWORD)).rejects.toThrow();
        }
        expect(env.local._dump().passwordHash).toBeNull();
        expect(env.local._dump().passwordSalt).toBeNull();
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(false);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        // Keys are still usable — device-wrapped blobs open without an unlock.
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });

    it('rejects the wrong password and keeps the vault encrypted', async () => {
        const env = await bootBackground(await passwordVault());
        await env.dispatch({ kind: 'unlock', payload: PASSWORD });

        expect(await env.dispatch({ kind: 'removePassword', payload: 'wrong' }))
            .toMatchObject({ success: false, error: 'Invalid password' });
        await env.flushWrites();

        expect(env.local._dump().passwordHash).toBeTruthy();
        expect(isPasswordBlobShape(env.local._dump().profiles[0].privKey)).toBe(true);
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(true);
    });

    /**
     * Profile keys are not the only thing a master-password session wraps: an
     * API-key secret or a note body saved while unlocked is a password blob
     * too. Removal must carry those to the device tier in the same write, or
     * they stay shut on a vault that reports it has no password.
     */
    it('carries API-key secrets and note bodies to the device tier too', async () => {
        const env = await bootBackground(await passwordVault(await secondaryStores()));
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        expect(await env.dispatch({ kind: 'removePassword', payload: PASSWORD }))
            .toMatchObject({ success: true });
        await env.flushWrites();

        await expectSecondaryStoresOnDeviceTier(env);
    });
});

/**
 * Recovery for a vault left holding password-wrapped keys with no verifier on
 * file. Nothing on disk identifies the password, but each blob carries its own
 * salt and authentication tag, so the blob itself verifies it — which is what
 * makes recovery possible at all.
 */
describe('recovery — keys stranded by a password removal', () => {
    it('detects the stranded vault and routes it to the unlock surface', async () => {
        const env = await bootBackground(await strandedVault());

        // The vault genuinely holds no password — but it is not usable either.
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(false);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
        // The existing vault check is what the side panel drives its locked
        // view from, so this is the recovery surface with no new screen.
        expect(await env.dispatch({ kind: 'hasEncryptedData' }))
            .toMatchObject({ found: true, hasPasswordHash: false, strandedKeys: 2 });
    });

    it('the removed password moves every stranded key onto the device key', async () => {
        const env = await bootBackground(await strandedVault());

        expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD }))
            .toMatchObject({ success: true, recovered: 2, warnings: [] });
        await env.flushWrites();

        const { isDeviceKeyBlob } = await import('../src/utilities/secret-vault.js');
        const stored = env.local._dump().profiles;
        for (const [i, hex] of [HEX_A, HEX_B].entries()) {
            expect(stored[i].privKey).not.toBe(hex);            // T0-4 still holds
            expect(isDeviceKeyBlob(stored[i].privKey)).toBe(true);
            await expect(decrypt(stored[i].privKey, PASSWORD)).rejects.toThrow();
            expect(await env.dispatch({ kind: 'getNsec', payload: i })).toMatch(/^nsec1/);
        }
        // Back to an ordinary passwordless vault — no lock, nothing to recover.
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(false);
        expect(await env.dispatch({ kind: 'hasEncryptedData' }))
            .toMatchObject({ found: false, strandedKeys: 0 });

        // And it survives a worker restart — the keys are on the device key now.
        const restarted = await bootBackground(env.local._dump());
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await restarted.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });

    it('a wrong password recovers nothing and destroys nothing', async () => {
        const env = await bootBackground(await strandedVault());
        const before = JSON.stringify(env.local._dump().profiles);

        expect(await env.dispatch({ kind: 'unlock', payload: 'not the password' }))
            .toMatchObject({ success: false, error: 'Invalid password' });
        await env.flushWrites();

        expect(JSON.stringify(env.local._dump().profiles)).toBe(before);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
        // Non-vacuity: the ciphertext is intact, so the real password still works.
        expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD }))
            .toMatchObject({ success: true, recovered: 2 });
    });

    it('leaves a healthy passwordless vault completely alone', async () => {
        const env = await bootBackground(plainVault()); // migrates to device blobs
        await env.flushWrites();

        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await env.dispatch({ kind: 'hasEncryptedData' }))
            .toMatchObject({ found: false, strandedKeys: 0 });
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
        // No stranded blob means no recovery path: a password is just wrong.
        const before = JSON.stringify(env.local._dump().profiles);
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(false);
        await env.flushWrites();
        expect(JSON.stringify(env.local._dump().profiles)).toBe(before);
    });

    it('a vault with one stranded key keeps the working one usable', async () => {
        // The shape a bricked user reaches by creating a NEW key afterwards:
        // the new key is device-wrapped and fine, the old one is stranded.
        const env = await bootBackground({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD)), profile('P2', HEX_B)],
            profileIndex: 0,
            isEncrypted: false,
            autoLockMinutes: 0,
        });
        await env.flushWrites();

        // Not latched: a working key must not be taken away to advertise a repair.
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await env.dispatch({ kind: 'getNsec', payload: 1 })).toMatch(/^nsec1/);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
        // ...but the vault check still offers the repair.
        expect(await env.dispatch({ kind: 'hasEncryptedData' }))
            .toMatchObject({ found: true, hasPasswordHash: false, strandedKeys: 1 });

        const healthyBefore = env.local._dump().profiles[1].privKey;
        expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD }))
            .toMatchObject({ success: true, recovered: 1 });
        await env.flushWrites();

        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
        expect(await env.dispatch({ kind: 'getNsec', payload: 1 })).toMatch(/^nsec1/);
        expect(env.local._dump().profiles[1].privKey).toBe(healthyBefore);
    });

    it('recovers the API-key secrets and note bodies stranded with the keys', async () => {
        const env = await bootBackground(await strandedVault(await secondaryStores()));

        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        await env.flushWrites();

        await expectSecondaryStoresOnDeviceTier(env);
    });

    it('counts bunker profiles as neither stranded nor usable', async () => {
        const bunker = {
            ...profile('Bunker', ''), type: 'bunker',
            bunkerUrl: 'bunker://abc?relay=wss://r', remotePubkey: 'ff'.repeat(32),
        };
        const env = await bootBackground({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD)), bunker],
            profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
        });
        // A remote-signer profile holds no key material, so it neither hides a
        // stranded vault nor gets dragged through the recovery pass.
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD }))
            .toMatchObject({ success: true, recovered: 1 });
        await env.flushWrites();

        expect(env.local._dump().profiles[1]).toMatchObject({
            type: 'bunker', privKey: '', bunkerUrl: bunker.bunkerUrl,
            remotePubkey: bunker.remotePubkey,
        });
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });

    /**
     * Known limit, pinned so it stays visible: setting a NEW master password
     * instead of recovering puts a verifier back on a vault whose old blobs the
     * new password cannot open. The unlock then names them and the ciphertext
     * survives — but the stranded state is defined by the ABSENCE of a
     * verifier, so this recovery path stops detecting them.
     */
    it('a new password set instead of recovering buries — but does not destroy', async () => {
        const env = await bootBackground(await strandedVault());
        expect((await env.dispatch({ kind: 'setPassword', payload: NEW_PASSWORD })).success).toBe(true);
        await env.flushWrites();

        expect(await env.dispatch({ kind: 'hasEncryptedData' })).toMatchObject({ strandedKeys: 0 });
        const unlocked = await env.dispatch({ kind: 'unlock', payload: NEW_PASSWORD });
        expect(unlocked.success).toBe(true);
        expect(unlocked.warnings).toHaveLength(2);   // named, never dropped silently
        // The only copies of those keys are still on disk, intact.
        expect(await decrypt(env.local._dump().profiles[0].privKey, PASSWORD)).toBe(HEX_A);
    });

    it('preserves what this password does not open, and names it', async () => {
        // A blob wrapped under a DIFFERENT password (an older one, or one from
        // another device) must survive the pass untouched — its ciphertext is
        // the only remaining copy, and a later attempt with the right password
        // is worth more than a tidy write.
        const env = await bootBackground({
            profiles: [
                profile('P1', await encrypt(HEX_A, PASSWORD)),
                profile('P2', await encrypt(HEX_B, NEW_PASSWORD)),
            ],
            profileIndex: 0,
            isEncrypted: false,
            autoLockMinutes: 0,
            apiKeyVault: {
                keys: {
                    k1: {
                        id: 'k1', label: 'Other', secret: await encrypt(API_SECRET, NEW_PASSWORD),
                        createdAt: 1, updatedAt: 1, profileScope: null,
                    },
                },
                syncEnabled: false,
            },
        });
        const otherKeyBefore = env.local._dump().profiles[1].privKey;
        const otherSecretBefore = env.local._dump().apiKeyVault.keys.k1.secret;

        expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD }))
            .toMatchObject({
                success: true, recovered: 1,
                warnings: [{ index: 1, name: 'P2' }],
            });
        await env.flushWrites();

        expect(env.local._dump().profiles[1].privKey).toBe(otherKeyBefore);
        expect(env.local._dump().apiKeyVault.keys.k1.secret).toBe(otherSecretBefore);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
        // The one that did not open is still there to be recovered later.
        expect(await decrypt(otherKeyBefore, NEW_PASSWORD)).toBe(HEX_B);
    });
});

describe('auto-lock timeout — an allowlist, and an alarm that really locks', () => {
    it('defaults to 15 minutes', async () => {
        const env = await bootBackground({ profiles: [profile('P1', HEX_A)] });
        expect(await env.dispatch({ kind: 'getAutoLockTimeout' })).toBe(15);
    });

    it('accepts only the allowlisted values and persists them', async () => {
        const env = await bootBackground(plainVault());
        for (const mins of [0, 5, 15, 30, 60, 90, 180]) {
            expect(await env.dispatch({ kind: 'setAutoLockTimeout', payload: mins })).toBe(true);
            await env.flushWrites();
            expect(await env.dispatch({ kind: 'getAutoLockTimeout' })).toBe(mins);
        }
    });

    it('refuses off-allowlist values without writing them', async () => {
        const env = await bootBackground(plainVault());
        expect(await env.dispatch({ kind: 'setAutoLockTimeout', payload: 30 })).toBe(true);
        await env.flushWrites();

        for (const bad of [45, -1, 10000, 0.5, 'fifteen', undefined, {}]) {
            expect(await env.dispatch({ kind: 'setAutoLockTimeout', payload: bad })).toBe(false);
            await env.flushWrites();
            expect(await env.dispatch({ kind: 'getAutoLockTimeout' })).toBe(30);
        }
    });

    /**
     * Documented gap, not a claim of correctness: the handler validates
     * `Number(payload)` against the allowlist (background.js:1167), and
     * `Number(null)` / `Number('')` / `Number(false)` are all 0 — an allowlisted
     * value meaning "never auto-lock". A non-numeric payload therefore DISABLES
     * auto-lock rather than being rejected. Only extension-UI senders can reach
     * this kind (SENSITIVE_KINDS), so it is defence-in-depth, but the setter
     * should reject non-numbers outright. This test pins the current behaviour
     * so the eventual fix is a deliberate, visible change.
     */
    it('coerces empty-ish payloads to 0 (never auto-lock) — validation gap', async () => {
        for (const emptyish of [null, '', false]) {
            const env = await bootBackground(plainVault({ autoLockMinutes: 30 }));
            expect(await env.dispatch({ kind: 'setAutoLockTimeout', payload: emptyish })).toBe(true);
            await env.flushWrites();
            expect(await env.dispatch({ kind: 'getAutoLockTimeout' })).toBe(0);
        }
    });

    it('schedules the auto-lock alarm on unlock and firing it locks the session', async () => {
        const env = await bootBackground(await passwordVault({ autoLockMinutes: 5 }));
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        expect(env.alarms.get('nostrkey-auto-lock')).toMatchObject({ delayInMinutes: 5 });

        env.fireAlarm('nostrkey-auto-lock');
        await settle();

        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
    });

    it('schedules NO auto-lock alarm when the timeout is 0 (never)', async () => {
        const env = await bootBackground(await passwordVault({ autoLockMinutes: 0 }));
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        expect(env.alarms.has('nostrkey-auto-lock')).toBe(false);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
    });
});

describe('full lifecycle against the real worker', () => {
    it('set → lock → fail → unlock → change → lock → unlock(new) → remove', async () => {
        const env = await bootBackground(plainVault());

        expect((await env.dispatch({ kind: 'setPassword', payload: PASSWORD })).success).toBe(true);
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(true);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);

        await env.dispatch({ kind: 'lock' });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);

        expect((await env.dispatch({ kind: 'unlock', payload: 'nope' })).success).toBe(false);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);

        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);

        expect((await env.dispatch({
            kind: 'changePassword',
            payload: { oldPassword: PASSWORD, newPassword: NEW_PASSWORD },
        })).success).toBe(true);
        await env.flushWrites();

        await env.dispatch({ kind: 'lock' });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(false);
        expect((await env.dispatch({ kind: 'unlock', payload: NEW_PASSWORD })).success).toBe(true);

        expect((await env.dispatch({ kind: 'removePassword', payload: NEW_PASSWORD })).success).toBe(true);
        await env.flushWrites();
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(false);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        // The at-rest state AFTER removal is asserted by the dedicated
        // (currently RED) removePassword test above — see the bug note there.
    });
});
