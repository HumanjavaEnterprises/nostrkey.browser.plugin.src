/**
 * v1.8.1 session / at-rest wrapping regressions.
 *
 * These drive the REAL background worker (imported against a fake `chrome`
 * namespace) plus the real storage modules, because every bug below shipped in
 * 1.8.0 through the seams BETWEEN those modules:
 *
 *   D1 / F1  a key created while a master password is set was device-wrapped,
 *            landing a blob inside a password vault that the password can never
 *            open. Wrapping is now background-owned and password-aware.
 *   D2 / F2  the non-extractable device key never persisted on iOS Safari.
 *            getDeviceKey now verifies persistence and falls back to a
 *            storage.local seed, which must survive a fresh context.
 *   D5 / F4  one damaged blob failed the WHOLE unlock (permanent lockout).
 *   F3       device blobs found under an active password self-heal on unlock.
 *   D3 / F5  decrypted keys are parked in storage.session so a service-worker
 *            eviction no longer forces a re-unlock.
 *   D4       reply() propagates the real error instead of `undefined`.
 *
 * Node's vitest environment has no IndexedDB, which is exactly the iOS Safari
 * shape: the `idb` strategy is unavailable and the seed strategy must carry it.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { encrypt, decrypt, hashPassword } from '../src/utilities/crypto.js';

const PASSWORD = 'correct horse battery staple';
const HEX_A = '1111111111111111111111111111111111111111111111111111111111111111';
const HEX_B = '2222222222222222222222222222222222222222222222222222222222222222';
const HEX64 = /^[0-9a-f]{64}$/;

/** Let the background's async startup IIFE run to completion. */
async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

/**
 * Boot a fresh copy of the background worker against a fresh fake chrome.
 * `seedLocal` / `seedSession` are written BEFORE the module is imported so the
 * startup path sees them, just like a real worker start.
 */
async function bootBackground({ seedLocal = {}, seedSession = null, session = false } = {}) {
    vi.resetModules();
    const env = installFakeChrome({ session, alarms: true });
    env.local._seed(seedLocal);
    if (seedSession && env.session) env.session._seed(seedSession);
    // Route in-extension sendMessage traffic (generateProfile → background) at
    // the same listener the tests drive directly.
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
        autoLockMinutes: 0, // no auto-lock timer during tests
        profileIndex: 0,
        ...extra,
    };
}

function profile(name, privKey) {
    return { name, privKey, pubKey: '', hosts: {}, relays: [], type: 'local' };
}

/** Same JSON shape as a password blob, but the ciphertext will not authenticate. */
function corruptPasswordBlob(blob) {
    const p = JSON.parse(blob);
    p.ciphertext = 'AAAA' + p.ciphertext.slice(4);
    return JSON.stringify(p);
}

afterEach(() => {
    delete globalThis.chrome;
});

describe('F1 / D1 — a password vault never receives a device blob', () => {
    it('generateProfile produces a PASSWORD blob once a master password is unlocked', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
        });

        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        const { generateProfile } = await import('../src/utilities/utils.js');
        const { isDeviceKeyBlob, isPasswordBlob } = await import('../src/utilities/secret-vault.js');
        const created = await generateProfile('New', 'local');

        expect(isDeviceKeyBlob(created.privKey)).toBe(false);
        expect(isPasswordBlob(created.privKey)).toBe(true);
        // And it really is openable with the master password.
        expect(HEX64.test(await decrypt(created.privKey, PASSWORD))).toBe(true);
    });

    it('refuses to mint a key while the vault is locked rather than device-wrapping it', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
        });

        const { generateProfile } = await import('../src/utilities/utils.js');
        await expect(generateProfile('New', 'local')).rejects.toThrow(/locked/i);
        expect(env.local._dump().profiles).toHaveLength(1);
    });

    it('stays on the device key when no master password is set', async () => {
        await bootBackground({ seedLocal: { autoLockMinutes: 0 } });

        const { generateProfile } = await import('../src/utilities/utils.js');
        const { isDeviceKeyBlob } = await import('../src/utilities/secret-vault.js');
        const created = await generateProfile('Default', 'local');

        expect(isDeviceKeyBlob(created.privKey)).toBe(true);
    });
});

describe('F4 / D5 — one damaged blob must not fail the whole unlock', () => {
    it('unlocks the healthy profiles and reports the casualty by name', async () => {
        const good = await encrypt(HEX_A, PASSWORD);
        const bad = corruptPasswordBlob(await encrypt(HEX_B, PASSWORD));
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('Good One', good), profile('Damaged One', bad)],
            }),
        });

        const result = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(result.success).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0]).toMatchObject({ index: 1, name: 'Damaged One' });

        // The surviving profile is usable — nsec resolves from the session cache.
        const nsec = await env.dispatch({ kind: 'getNsec', payload: 0 });
        expect(nsec).toMatch(/^nsec1/);
    });
});

describe('F3 — self-heal converts device blobs found under a password', () => {
    it('re-wraps a device-wrapped key under the master password on unlock', async () => {
        // Build the blob with the SAME module registry the background will use.
        vi.resetModules();
        const env = installFakeChrome({ alarms: true });
        const { encryptWithDeviceKey, isDeviceKeyBlob, isPasswordBlob } =
            await import('../src/utilities/secret-vault.js');
        const deviceBlob = await encryptWithDeviceKey(HEX_B);
        expect(isDeviceKeyBlob(deviceBlob)).toBe(true);

        // Keep whatever the device key persisted (deviceKeySeed) — a real vault
        // would still have it on disk.
        env.local._seed({
            ...env.local._dump(),
            ...await passwordVault({
                profiles: [
                    profile('Pre-password', await encrypt(HEX_A, PASSWORD)),
                    profile('Post-password', deviceBlob), // the 1.8.0 mixed state
                ],
            }),
        });
        env.setSendMessage((msg) => env.dispatch(msg));
        await import('../src/background.js');
        await settle();

        const result = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(result.success).toBe(true);
        expect(result.warnings).toHaveLength(0);

        const healed = env.local._dump().profiles[1].privKey;
        expect(isDeviceKeyBlob(healed)).toBe(false);
        expect(isPasswordBlob(healed)).toBe(true);
        expect(await decrypt(healed, PASSWORD)).toBe(HEX_B);
    });
});

describe('F2 / D2 — the device key survives without IndexedDB', () => {
    it('falls back to a storage.local seed and round-trips across a fresh context', async () => {
        // The iOS Safari shape: no IndexedDB at all.
        expect(typeof indexedDB).toBe('undefined');

        vi.resetModules();
        const first = installFakeChrome();
        const vault1 = await import('../src/utilities/secret-vault.js');
        const blob = await vault1.wrapSecret(HEX_A);

        expect(vault1.isDeviceKeyBlob(blob)).toBe(true);
        expect(vault1.getDeviceKeyStrategy()).toBe('seed');
        expect(typeof first.local._dump().deviceKeySeed).toBe('string');
        expect(await vault1.unwrapSecret(blob)).toBe(HEX_A);

        // Simulate the background page dying and coming back: brand-new module
        // instances, same on-disk storage. Under 1.8.0 this lost the key.
        const carried = { ...first.local._dump() };
        vi.resetModules();
        const second = installFakeChrome();
        second.local._seed(carried);
        const vault2 = await import('../src/utilities/secret-vault.js');
        expect(await vault2.unwrapSecret(blob)).toBe(HEX_A);
        expect(vault2.getDeviceKeyStrategy()).toBe('seed');
    });

    it('imports the seed as a NON-extractable AES-GCM key', async () => {
        vi.resetModules();
        installFakeChrome();
        const { getDeviceKey } = await import('../src/utilities/secret-vault.js');
        const key = await getDeviceKey();
        expect(key.type).toBe('secret');
        expect(key.extractable).toBe(false);
        expect(key.algorithm.name).toBe('AES-GCM');
    });
});

describe('F5 / D3 — the session survives a service-worker restart', () => {
    it('parks the decrypted keys in storage.session and resumes unlocked', async () => {
        const seedLocal = await passwordVault({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const env = await bootBackground({ seedLocal, session: true });

        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);
        // persistSessionState() is deliberately fire-and-forget, so the parking
        // write lands after the unlock response — let it land, as the browser
        // would, before reading storage.session back.
        await env.flushWrites();
        const parked = env.session._dump().nkSessionState;
        expect(parked).toBeTruthy();
        expect(parked.keys).toEqual([[0, HEX_A]]);

        // Worker evicted and restarted: same storage.local, same storage.session.
        const restarted = await bootBackground({
            seedLocal: { ...env.local._dump() },
            seedSession: { nkSessionState: parked },
            session: true,
        });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await restarted.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });

    it('stays locked after a restart when storage.session is unavailable', async () => {
        const seedLocal = await passwordVault({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const env = await bootBackground({ seedLocal });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        const restarted = await bootBackground({ seedLocal: { ...env.local._dump() } });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(true);
    });

    it('lock() clears the parked session', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
            session: true,
        });
        await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        await env.flushWrites(); // fire-and-forget park
        expect(env.session._dump().nkSessionState).toBeTruthy();

        await env.dispatch({ kind: 'lock' });
        await env.flushWrites(); // fire-and-forget clear
        expect(env.session._dump().nkSessionState).toBeUndefined();
    });
});

describe('D4 — reply() propagates the real error', () => {
    it('returns the exception message instead of an undefined response', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
        });
        await env.dispatch({ kind: 'unlock', payload: PASSWORD });

        const result = await env.dispatch({
            kind: 'savePrivateKey',
            payload: [99, HEX_B], // out-of-range profile index
        });
        expect(result).toBeTruthy();
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/Invalid profile index/);
    });

    it('refuses to save a key into a locked password vault', async () => {
        const env = await bootBackground({
            seedLocal: await passwordVault({
                profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
            }),
        });

        const before = env.local._dump().profiles[0].privKey;
        const result = await env.dispatch({ kind: 'savePrivateKey', payload: [0, HEX_B] });
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/locked/i);
        // The blob at rest is untouched — nothing was downgraded to a device blob.
        expect(env.local._dump().profiles[0].privKey).toBe(before);
    });
});

describe('F5 / D3 — a resumed worker is FULLY unlocked, not half-unlocked', () => {
    it('restores the session CryptoKey so wrapPrivKey works right after a restart', async () => {
        const seedLocal = await passwordVault({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const env = await bootBackground({ seedLocal, session: true });
        expect((await env.dispatch({ kind: 'unlock', payload: PASSWORD })).success).toBe(true);

        await env.flushWrites(); // fire-and-forget park
        const parked = env.session._dump().nkSessionState;
        // The password-derived key rides along with the decrypted hex keys —
        // same storage.session tier, no new exposure.
        expect(typeof parked.keyRaw).toBe('string');
        expect(typeof parked.salt).toBe('string');

        const restarted = await bootBackground({
            seedLocal: { ...env.local._dump() },
            seedSession: { nkSessionState: parked },
            session: true,
        });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(false);

        // Before the fix this returned "NostrKey is locked" until the user
        // manually locked and unlocked again.
        const wrapped = await restarted.dispatch({ kind: 'wrapPrivKey', payload: HEX_B });
        expect(wrapped.success).toBe(true);

        const { isPasswordBlob, isDeviceKeyBlob } =
            await import('../src/utilities/secret-vault.js');
        expect(isPasswordBlob(wrapped.blob)).toBe(true);
        expect(isDeviceKeyBlob(wrapped.blob)).toBe(false);
        // The salt rides in the blob, so the master password still opens it.
        expect(await decrypt(wrapped.blob, PASSWORD)).toBe(HEX_B);
    });

    it('still resumes read-only from a parked session with no key material', async () => {
        // Backwards compatibility with the pre-fix parked shape.
        const seedLocal = await passwordVault({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        });
        const restarted = await bootBackground({
            seedLocal,
            seedSession: { nkSessionState: { keys: [[0, HEX_A]], lockAt: 0 } },
            session: true,
        });
        expect(await restarted.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await restarted.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);
    });
});

describe('startup must not stomp an unlock that already completed', () => {
    it('keeps the session unlocked when `unlock` wins the race with startup', async () => {
        vi.resetModules();
        // No storage.session on purpose: nothing can be "resumed", so the only
        // thing keeping this session unlocked is startup declining to stomp it.
        const env = installFakeChrome({ alarms: true });
        env.local._seed(await passwordVault({
            profiles: [profile('P1', await encrypt(HEX_A, PASSWORD))],
        }));
        env.setSendMessage((msg) => env.dispatch(msg));

        // Push every storage read onto the macrotask queue so the startup IIFE
        // is provably still mid-flight (suspended on its first get, holding no
        // mutex) when the unlock message arrives — the real-world race.
        const rawGet = env.local.get;
        env.local.get = (q) => new Promise(r => setTimeout(() => r(rawGet(q)), 0));

        // Deliberately do NOT settle: the startup IIFE is still awaiting
        // storage when this unlock takes the session mutex ahead of it.
        await import('../src/background.js');
        const result = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(result.success).toBe(true);

        // Startup now resumes and must leave the live session alone.
        await settle();
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        // Fully unlocked, not just flagged unlocked.
        expect((await env.dispatch({ kind: 'wrapPrivKey', payload: HEX_B })).success).toBe(true);
    });
});

describe('sender gate — savePrivateKey writes key material, so it is extension-only', () => {
    it('refuses a foreign extension id', async () => {
        const env = await bootBackground({
            seedLocal: { autoLockMinutes: 0, profiles: [profile('P1', '')], profileIndex: 0 },
        });
        const res = await env.dispatch(
            { kind: 'savePrivateKey', payload: [0, HEX_B] },
            { id: 'some-other-extension' },
        );
        expect(res).toEqual({ success: false, error: 'Unauthorized sender' });
        expect(env.local._dump().profiles[0].privKey).toBe('');
    });

    it('refuses a content script running in a web page', async () => {
        const env = await bootBackground({
            seedLocal: { autoLockMinutes: 0, profiles: [profile('P1', '')], profileIndex: 0 },
        });
        const res = await env.dispatch(
            { kind: 'savePrivateKey', payload: [0, HEX_B] },
            { id: 'test-extension-id', tab: { id: 7 }, url: 'https://evil.example/page' },
        );
        expect(res).toEqual({ success: false, error: 'Unauthorized sender' });
        expect(env.local._dump().profiles[0].privKey).toBe('');
    });

    it('still allows an extension page', async () => {
        const env = await bootBackground({
            seedLocal: { autoLockMinutes: 0, profiles: [profile('P1', '')], profileIndex: 0 },
        });
        const res = await env.dispatch(
            { kind: 'savePrivateKey', payload: [0, HEX_B] },
            { id: 'test-extension-id', tab: { id: 7 }, url: 'chrome-extension://test/sidepanel.html' },
        );
        expect(res.success).toBe(true);
        expect(env.local._dump().profiles[0].privKey).not.toBe('');
    });

    it('refuses the raw-key-material kinds from a content script too', async () => {
        const env = await bootBackground({
            seedLocal: { autoLockMinutes: 0, profiles: [profile('P1', '')], profileIndex: 0 },
        });
        const pageSender = { id: 'test-extension-id', tab: { id: 7 }, url: 'https://evil.example/page' };
        for (const kind of ['ncryptsec.encrypt', 'ncryptsec.decrypt', 'seedPhrase.fromKey', 'seedPhrase.toKey']) {
            const res = await env.dispatch({ kind, payload: 0 }, pageSender);
            expect(res).toEqual({ success: false, error: 'Unauthorized sender' });
        }
    });
});

describe('invariant — isEncrypted implies no device blob in any profile', () => {
    it('holds after unlock + profile creation + self-heal', async () => {
        vi.resetModules();
        const env = installFakeChrome({ alarms: true, session: true });
        const { encryptWithDeviceKey, isDeviceKeyBlob } =
            await import('../src/utilities/secret-vault.js');
        env.local._seed({
            ...env.local._dump(),
            ...await passwordVault({
                profiles: [
                    profile('A', await encrypt(HEX_A, PASSWORD)),
                    profile('B', await encryptWithDeviceKey(HEX_B)),
                ],
            }),
        });
        env.setSendMessage((msg) => env.dispatch(msg));
        await import('../src/background.js');
        await settle();

        await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        const { newProfile } = await import('../src/utilities/utils.js');
        await newProfile();

        const { profiles, isEncrypted } = env.local._dump();
        expect(isEncrypted).toBe(true);
        for (const p of profiles) {
            expect(isDeviceKeyBlob(p.privKey)).toBe(false);
        }
    });
});
