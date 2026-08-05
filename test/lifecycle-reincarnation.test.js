/**
 * Worker-reincarnation lifecycle tests.
 *
 * The v1.8.0 vault bugs shared one shape: each background life was internally
 * consistent, but state written in life N was unusable in life N+1. Unit tests
 * inside a single life could never see that. These tests kill and rebirth the
 * REAL background worker — same storage, fresh module, exactly the semantics
 * of a service-worker eviction or an iOS Safari page death — and assert the
 * whole-vault invariants (test/helpers/vault-invariants.js) after every life.
 *
 * Death modes:
 *   evict()  — worker dies, browser stays up: storage.local AND storage.session survive.
 *   restart() — browser/device restart (or iOS page death pre-storage.session):
 *               storage.local survives, storage.session is wiped.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { hashPassword } from '../src/utilities/crypto.js';
import { assertVaultInvariants } from './helpers/vault-invariants.js';

const PASSWORD = 'instrument-demo-2026';
const HEX64 = /^[0-9a-f]{64}$/;

async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

async function boot({ seedLocal = {}, seedSession = null } = {}) {
    vi.resetModules();
    const env = installFakeChrome({ session: true, alarms: true });
    env.local._seed(seedLocal);
    if (seedSession) env.session._seed(seedSession);
    env.setSendMessage((msg) => env.dispatch(msg));
    await import('../src/background.js');
    await settle();
    return env;
}

/** Worker eviction: memory dies, both storage areas survive. */
async function evict(env) {
    return boot({
        seedLocal: structuredClone(env.local._dump()),
        seedSession: structuredClone(env.session._dump()),
    });
}

/** Browser restart: memory AND storage.session die; only storage.local survives. */
async function restart(env) {
    return boot({ seedLocal: structuredClone(env.local._dump()) });
}

/** Create + persist a key profile through the real wrap path. */
async function createProfile(env, name) {
    const { generateProfile } = await import('../src/utilities/utils.js');
    const p = await generateProfile(name);
    const { profiles = [] } = await env.local.get({ profiles: [] });
    profiles.push(p);
    await env.local.set({ profiles });
    return p;
}

/** A device blob wrapped with a key that no longer exists anywhere (the iPad terminal state). */
async function orphanDeviceBlob(hex) {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(hex));
    const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
    return JSON.stringify({ v: 1, k: 'device', iv: b64(iv), ciphertext: b64(ct) });
}

afterEach(() => {
    delete globalThis.chrome;
    vi.resetModules();
});

describe('the full user lifecycle survives every death mode', () => {
    it('install → generate → restart → key readable → set password → evict → still unlocked → generate → restart → unlock', async () => {
        // LIFE 1 — fresh install, passwordless key (the L0 default tier).
        let env = await boot({ seedLocal: { autoLockMinutes: 0, profiles: [], profileIndex: 0 } });
        await createProfile(env, 'Alice');
        assertVaultInvariants(env.local, 'life 1: passwordless key at rest');

        // LIFE 2 — full restart. The v1.8.0 iOS bug: the wrapping key died here.
        env = await restart(env);
        const utils2 = await import('../src/utilities/utils.js');
        const { profiles: p2 } = await env.local.get({ profiles: [] });
        const hex = await utils2.toHexPrivKey(p2[0].privKey);
        expect(hex).toMatch(HEX64); // key must be recoverable in a life that did not wrap it
        assertVaultInvariants(env.local, 'life 2: after restart, passwordless');

        // Still life 2 — user sets a master password.
        const set = await env.dispatch({ kind: 'setPassword', payload: PASSWORD });
        expect(set.success).toBe(true);
        assertVaultInvariants(env.local, 'life 2: password set');

        // LIFE 3 — worker eviction. v1.8.0 relocked here regardless of settings.
        env = await evict(env);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        // Fully unlocked, not half: creating a key must produce a password blob.
        await createProfile(env, 'Work');
        assertVaultInvariants(env.local, 'life 3: resumed session, second key');

        // LIFE 4 — browser restart: locked is correct now, and unlock must open EVERYTHING.
        env = await restart(env);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        const unlock = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(unlock.success).toBe(true);
        expect(unlock.warnings ?? []).toEqual([]); // every blob opened — no silent losses
        assertVaultInvariants(env.local, 'life 4: unlocked after restart');
    });

    it('a 1.8.0-era mixed vault (password + stray device blob) self-heals on first unlock', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        // Wrap a device blob in a passwordless life so its seed persists...
        let env = await boot({ seedLocal: { autoLockMinutes: 0, profiles: [], profileIndex: 0 } });
        await createProfile(env, 'Legacy');
        const dump = structuredClone(env.local._dump());
        // ...then impose the 1.8.0 field state: password on, blob left device-wrapped.
        dump.isEncrypted = true;
        dump.passwordHash = hash;
        dump.passwordSalt = salt;
        env = await boot({ seedLocal: dump });

        const unlock = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(unlock.success).toBe(true);
        assertVaultInvariants(env.local, 'after self-heal'); // I1 now holds: password blob
    });

    it('the iPad terminal state (orphaned device blob in a password vault) unlocks with a named warning, not a lockout', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const env = await boot({
            seedLocal: {
                autoLockMinutes: 0,
                isEncrypted: true,
                passwordHash: hash,
                passwordSalt: salt,
                profileIndex: 0,
                profiles: [{ name: 'Doomed', privKey: await orphanDeviceBlob('11'.repeat(32)), pubKey: 'abc', hosts: {}, relays: [], type: 'local' }],
            },
        });
        const unlock = await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(unlock.success).toBe(true); // v1.8.0 returned the masked "Service worker not ready" forever
        expect(unlock.warnings?.length).toBe(1);
        expect(unlock.warnings[0].name).toBe('Doomed');
    });

    it('the invariant sweeper itself catches the two 1.8.0 shapes', async () => {
        const { vaultInvariantViolations } = await import('./helpers/vault-invariants.js');
        const { hash, salt } = await hashPassword(PASSWORD);
        const deviceBlob = JSON.stringify({ v: 1, k: 'device', iv: 'aa', ciphertext: 'bb' });
        // D1 shape: device blob inside a password vault.
        expect(vaultInvariantViolations({
            isEncrypted: true, passwordHash: hash, passwordSalt: salt,
            profiles: [{ name: 'X', privKey: deviceBlob, type: 'local' }],
        }).some(v => v.startsWith('I1'))).toBe(true);
        // D2 shape: device blob with no recoverable wrapping key.
        expect(vaultInvariantViolations({
            isEncrypted: false,
            profiles: [{ name: 'X', privKey: deviceBlob, type: 'local' }],
        }).some(v => v.startsWith('I2'))).toBe(true);
        // Plaintext is always a violation.
        expect(vaultInvariantViolations({
            isEncrypted: false,
            profiles: [{ name: 'X', privKey: '11'.repeat(32), type: 'local' }],
        }).some(v => v.startsWith('I3'))).toBe(true);
    });
});
