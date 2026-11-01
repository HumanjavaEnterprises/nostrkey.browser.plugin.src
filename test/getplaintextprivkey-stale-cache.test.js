/**
 * sessionKeys is a Map keyed by profile INDEX, and deleteProfile() splices the
 * list without reindexing it, so after a mid-list delete an index can hold another
 * identity's key. getPlaintextPrivKey() only trusts a cached key that derives the
 * profile's stored pubKey, and that check needs a pubKey to compare with.
 *
 * Driven through the real worker: a backup restored from before pubKeys were
 * stored comes back with them filled in, so the check still works afterwards.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getPublicKeySync } from 'nostr-crypto-utils';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { encrypt, hashPassword } from '../src/utilities/crypto.js';

const here = dirname(fileURLToPath(import.meta.url));
const V = JSON.parse(readFileSync(join(here, 'vectors', 'nostr-vectors.json'), 'utf8'));
const alice = V.keypairs.alice; // privateKey -> xonlyPubkey
const bob = V.keypairs.bob;

// ── The restore path ──
// The check can only reject a stale entry when the profile carries a
// pubKey. Every sessionKeys writer co-populates pubKey EXCEPT backup.import,
// which cached keys from a restored backup verbatim — a pre-pubKey-caching
// backup left pubKey='' beside a populated sessionKeys entry, so a later
// mid-list deleteProfile (which does NOT reindex the index-keyed sessionKeys)
// could sign as the shifted-in profile with the WRONG cached key. This drives
// the REAL background worker to prove the whole chain is closed.
//
// RED WITHOUT the restore-loop fix: the restored profiles keep pubKey='', so
// after the delete the guard is skipped and getNsec(0) returns ALICE's nsec.
// GREEN WITH it: restored profiles get a pubKey, the guard fires, getNsec(0)
// refuses (returns null) rather than hand back a wrong-identity key.

const PASSWORD = 'correct horse battery staple';
const HEX_A = '1111111111111111111111111111111111111111111111111111111111111111';
const HEX_B = '2222222222222222222222222222222222222222222222222222222222222222';

async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

async function bootBackground({ seedLocal = {}, session = false } = {}) {
    vi.resetModules();
    const env = installFakeChrome({ session, alarms: true });
    env.local._seed(seedLocal);
    env.setSendMessage((msg) => env.dispatch(msg));
    await import('../src/background.js');
    await settle();
    return env;
}

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

// A restored backup profile with an encrypted-blob key and NO cached pubKey —
// the exact pre-pubKey-caching shape the fix has to repair.
function legacyProfile(name, privKeyBlob) {
    return { name, privKey: privKeyBlob, pubKey: '', hosts: {}, relays: [], type: 'local' };
}

describe('backup.import fills in pubKey as it caches each key', () => {
    afterEach(() => {
        delete globalThis.chrome;
        delete globalThis.browser;
    });

    async function importPreFixBackup() {
        // Two encrypted-blob profiles with pubKey='' (a pre-pubKey-caching backup).
        const data = await passwordVault({
            profiles: [
                legacyProfile('Alice', await encrypt(HEX_A, PASSWORD)),
                legacyProfile('Bob', await encrypt(HEX_B, PASSWORD)),
            ],
            profileIndex: 0,
        });
        const payloadBlob = await encrypt(JSON.stringify(data), PASSWORD);
        const envelope = {
            format: 'nostrkey-backup',
            version: 1,
            payload: JSON.parse(payloadBlob),
        };

        const env = await bootBackground({ seedLocal: {} });
        const imported = await env.dispatch({
            kind: 'backup.import',
            payload: { envelope, password: PASSWORD },
        });
        expect(imported.success).toBe(true);
        return env;
    }

    it('co-populates a non-empty pubKey for every restored profile with a cached key', async () => {
        const env = await importPreFixBackup();

        const stored = env.local._dump().profiles;
        // Invariant: no sessionKeys entry now exists without a verifiable pubKey.
        expect(stored[0].pubKey).toMatch(/^[0-9a-f]{64}$/);
        expect(stored[1].pubKey).toMatch(/^[0-9a-f]{64}$/);
        // Each pubKey actually derives from its own key (not swapped).
        expect(stored[0].pubKey).toBe(getPublicKeySync(HEX_A));
        expect(stored[1].pubKey).toBe(getPublicKeySync(HEX_B));

        // Both profiles still resolve to their OWN nsec right after restore.
        const aNsec = await env.dispatch({ kind: 'getNsec', payload: 0 });
        const bNsec = await env.dispatch({ kind: 'getNsec', payload: 1 });
        expect(aNsec).toMatch(/^nsec1/);
        expect(bNsec).toMatch(/^nsec1/);
        expect(aNsec).not.toBe(bNsec);
    });

    it('after a mid-list delete, getNsec on the shifted slot NEVER returns the wrong identity', async () => {
        const env = await importPreFixBackup();

        // Alice's nsec, so we can assert it is never handed back for Bob's slot.
        const aNsec = await env.dispatch({ kind: 'getNsec', payload: 0 });
        expect(aNsec).toMatch(/^nsec1/);

        // Simulate utils.deleteProfile(0): splice the profiles array WITHOUT
        // touching the background's index-keyed sessionKeys (the real gap).
        const profiles = env.local._dump().profiles;
        profiles.splice(0, 1);           // Bob shifts from index 1 -> index 0
        await env.local.set({ profiles, profileIndex: 0 });

        // sessionKeys still maps {0: HEX_A (Alice), 1: HEX_B (Bob)}, but profiles[0]
        // is now Bob. Asking for the key at index 0 must NOT return Alice's key.
        const shifted = await env.dispatch({ kind: 'getNsec', payload: 0 });
        expect(shifted).not.toBe(aNsec);  // never Alice's identity in Bob's slot
        expect(shifted).toBeNull();       // the guard threw -> handler returns null
    });

    it('drops the entry it refused, so it cannot come back with the profile', async () => {
        const env = await importPreFixBackup();
        const profiles = env.local._dump().profiles;

        await env.local.set({ profiles: [profiles[1]], profileIndex: 0 });
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();

        await env.local.set({ profiles, profileIndex: 0 });
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
    });
});
