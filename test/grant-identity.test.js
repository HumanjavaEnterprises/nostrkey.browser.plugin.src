/**
 * Site grants are addressed by the identity's public key, resolved to the
 * profile(s) at write time, never by list position or the active profile.
 * Exercises the REAL src/utilities/utils.js via the fake-chrome harness.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { getPublicKeySync, nip19 } from 'nostr-crypto-utils';
import { installFakeChrome, flushStorageWrites } from './helpers/fake-chrome.js';

const UTILS = '../src/utilities/utils.js';
const PK_A = 'a'.repeat(64);
const PK_B = 'b'.repeat(64);
const PK_C = 'c'.repeat(64);

function makeProfile(name, overrides = {}) {
    return {
        name, privKey: '', pubKey: '', hosts: {}, relays: [], relayReminder: false,
        type: 'local', bunkerUrl: null, remotePubkey: null, updatedAt: 1, ...overrides,
    };
}

async function boot(profiles, profileIndex = 0) {
    vi.resetModules();
    const { local } = installFakeChrome();
    await local.set({ profiles, profileIndex });
    return import(UTILS);
}

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('setPermission(pubkey, origin, action, value)', () => {
    it('after profile 1 is deleted, a grant for profile 2\'s pubkey lands on profile 2', async () => {
        const u = await boot([
            makeProfile('A', { pubKey: PK_A }),
            makeProfile('B', { pubKey: PK_B }),
            makeProfile('C', { pubKey: PK_C }),
        ]);
        // Profile at index 1 goes away; C moves from index 2 to index 1.
        const profiles = await u.getProfiles();
        profiles.splice(1, 1);
        await chrome.storage.local.set({ profiles });

        await u.setPermission(PK_C, 'https://snort.social', 'signEvent:1', 'allow');
        await flushStorageWrites();

        const after = await u.getProfiles();
        expect(after[1].name).toBe('C');
        expect(after[1].hosts['https://snort.social']).toEqual({ 'signEvent:1': 'allow' });
        expect(after[0].hosts).toEqual({});
    });

    it('does not fall back to the active profile', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A }), makeProfile('B', { pubKey: PK_B })], 1);
        await u.setPermission(PK_A, 'https://iris.to', 'signEvent', 'deny');
        await flushStorageWrites();
        const after = await u.getProfiles();
        expect(after[0].hosts['https://iris.to']).toEqual({ signEvent: 'deny' });
        expect(after[1].hosts['https://iris.to']).toBeUndefined();
    });

    it('an unknown pubkey throws and writes nothing', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A })]);
        await expect(u.setPermission(PK_B, 'https://iris.to', 'signEvent', 'allow')).rejects.toThrow(/no profile/);
        expect((await u.getProfiles())[0].hosts).toEqual({});
    });

    it('a missing pubkey throws (no implicit identity)', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A })]);
        await expect(u.setPermission(null, 'https://iris.to', 'signEvent', 'allow')).rejects.toThrow(/required/);
        await expect(u.setPermission(undefined, 'https://iris.to', 'signEvent', 'allow')).rejects.toThrow(/required/);
    });

    it('matches a bunker profile by its remote pubkey', async () => {
        const u = await boot([makeProfile('Bunker', { type: 'bunker', remotePubkey: PK_B })]);
        await u.setPermission(PK_B, 'https://primal.net', 'getPubKey', 'allow');
        await flushStorageWrites();
        expect((await u.getProfiles())[0].hosts['https://primal.net']).toEqual({ getPubKey: 'allow' });
    });

    it('writes on a profile that has no hosts map', async () => {
        const p = makeProfile('A', { pubKey: PK_A });
        delete p.hosts;
        const u = await boot([p]);
        await u.setPermission(PK_A, 'https://iris.to', 'signEvent', 'allow');
        await flushStorageWrites();
        expect((await u.getProfiles())[0].hosts).toEqual({ 'https://iris.to': { signEvent: 'allow' } });
    });

    it('keeps the storage shape a 1.8.5 build reads (profiles[i].hosts[origin][action])', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A })]);
        await u.setPermission(PK_A, 'https://jumble.social', 'signEvent:1', 'allow');
        await flushStorageWrites();
        expect(await u.getPermission('https://jumble.social', 'signEvent:1', 0)).toBe('allow');
    });
});

describe('duplicate pubkeys', () => {
    it('a grant and a revoke land on every profile with that pubkey', async () => {
        const u = await boot([
            makeProfile('Local', { pubKey: PK_A }),
            makeProfile('Other', { pubKey: PK_B }),
            makeProfile('Bunker', { type: 'bunker', remotePubkey: PK_A }),
        ]);
        await u.setPermission(PK_A, 'https://iris.to', 'signEvent:1', 'allow');
        await flushStorageWrites();
        let after = await u.getProfiles();
        expect(after[0].hosts['https://iris.to']).toEqual({ 'signEvent:1': 'allow' });
        expect(after[2].hosts['https://iris.to']).toEqual({ 'signEvent:1': 'allow' });
        expect(after[1].hosts).toEqual({});

        await u.revokePermission({ pubkey: PK_A, index: 0 }, 'https://iris.to', 'signEvent:1');
        await flushStorageWrites();
        after = await u.getProfiles();
        expect(after[0].hosts['https://iris.to']['signEvent:1']).toBe('ask');
        expect(after[2].hosts['https://iris.to']['signEvent:1']).toBe('ask');
    });
});

describe('revokePermission', () => {
    it('falls back to the row index when the identity cannot be read', async () => {
        const u = await boot([
            makeProfile('Locked', { privKey: 'ciphertext', hosts: { 'https://iris.to': { getPubKey: 'allow' } } }),
            makeProfile('B', { pubKey: PK_B, hosts: { 'https://iris.to': { getPubKey: 'allow' } } }),
        ], 1);
        await u.revokePermission({ pubkey: null, index: 0 }, 'https://iris.to', 'getPubKey');
        await flushStorageWrites();
        const after = await u.getProfiles();
        expect(after[0].hosts['https://iris.to'].getPubKey).toBe('ask');
        expect(after[1].hosts['https://iris.to'].getPubKey).toBe('allow');
    });

    it('never adds a grant', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A })]);
        await u.revokePermission({ pubkey: PK_A, index: 0 }, 'https://iris.to', 'signEvent:1');
        await flushStorageWrites();
        expect((await u.getProfiles())[0].hosts).toEqual({});
    });

    it('does not throw for an unknown identity and an out-of-range index', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A })]);
        await expect(u.revokePermission({ pubkey: PK_B, index: 9 }, 'https://iris.to', 'x')).resolves.toEqual([]);
    });

    it('notes the revocation time for the site', async () => {
        const u = await boot([makeProfile('A', { pubKey: PK_A, hosts: { 'https://iris.to': { getPubKey: 'allow' } } })]);
        const before = Date.now();
        await u.revokePermission({ pubkey: PK_A, index: 0 }, 'https://iris.to', 'getPubKey');
        await flushStorageWrites();
        const { siteRevocations } = await chrome.storage.local.get('siteRevocations');
        expect(u.wasRevokedSince(siteRevocations, 'https://iris.to', before)).toBe(true);
        expect(u.wasRevokedSince(siteRevocations, 'https://iris.to', Date.now() + 1000)).toBe(false);
    });

    it('a legacy bare-host revocation matches the full origin', async () => {
        const { wasRevokedSince } = await boot([]);
        expect(wasRevokedSince({ 'iris.to': 10 }, 'https://iris.to', 5)).toBe(true);
        expect(wasRevokedSince({ 'iris.to': 10 }, 'https://other.to', 5)).toBe(false);
    });
});

describe('import duplicate check compares the derived pubkey', () => {
    const HEX = '0000000000000000000000000000000000000000000000000000000000000001';
    const PUB = getPublicKeySync(HEX);

    it('hex and nsec of the same key derive the same pubkey', async () => {
        const { pubkeyFromKeyInput } = await boot([]);
        const nsec = nip19.nsecEncode(HEX);
        expect(pubkeyFromKeyInput(HEX)).toBe(PUB);
        expect(pubkeyFromKeyInput(nsec)).toBe(PUB);
        expect(pubkeyFromKeyInput(HEX.toUpperCase())).toBe(PUB);
        expect(pubkeyFromKeyInput('not a key')).toBeNull();
    });

    it('the side panel import refuses a key whose derived pubkey already exists', () => {
        const src = readFileSync(new URL('../src/sidepanel.js', import.meta.url), 'utf8');
        const body = src.slice(src.indexOf('async function saveProfileChanges'), src.indexOf('// Create new profile'));
        expect(body).toContain('pubkeyFromKeyInput(key)');
        expect(body).toMatch(/existing === newPubkey/);
        expect(body).not.toMatch(/existingNsec === key/);
    });
});

describe('every grant write names an identity', () => {
    it('no call site writes a grant by index or the active profile', () => {
        const files = ['../src/background.js', '../src/sidepanel.js'].map(f => readFileSync(new URL(f, import.meta.url), 'utf8'));
        for (const src of files) {
            for (const m of src.matchAll(/\bsetPermission\(([^)]*)\)/g)) {
                expect(m[1]).toMatch(/^held\.pubkey,/);
            }
        }
        // The only index write is the documented unread-identity fallback.
        const bg = files[0];
        expect(bg.match(/setPermissionForUnreadIdentity\(/g)).toHaveLength(1);
        expect(bg).toMatch(/profile\.privKey !== held\.unreadKey\) return false;\s*await setPermissionForUnreadIdentity/);
        // The Apps tab passes the profile it is showing.
        expect(files[1]).toContain('grantOwner(state.profileIndex)');
        expect(files[1]).not.toMatch(/setPermission\(/);
    });
});
