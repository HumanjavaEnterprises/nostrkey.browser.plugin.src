/**
 * setPermission(host, action, perm, index) and an explicit index of 0.
 *
 * setPermission() falls back to the ACTIVE profile only when no explicit index
 * is passed. The old guard `if (!index)` treated profile index 0 as "unset", so
 * a grant explicitly targeted at profile 0 silently wrote to whatever profile
 * was currently active. `if (index == null)` respects 0.
 *
 * Exercises the REAL src/utilities/utils.js seam via the fake-chrome harness,
 * following the pattern in test/active-profile-switch.test.js.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome, flushStorageWrites } from './helpers/fake-chrome.js';

const UTILS = '../src/utilities/utils.js';

function makeProfile(name, overrides = {}) {
    return {
        name,
        privKey: '',
        pubKey: '',
        hosts: {},
        relays: [],
        relayReminder: false,
        type: 'local',
        bunkerUrl: null,
        remotePubkey: null,
        updatedAt: Math.floor(Date.now() / 1000),
        ...overrides,
    };
}

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('setPermission respects an explicit profile index of 0', () => {
    it('a grant targeted at profile 0 writes to profile 0, not the active profile', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        // Profile 1 (Bob) is the ACTIVE profile; the grant is aimed at profile 0.
        await local.set({
            profiles: [makeProfile('Alice'), makeProfile('Bob')],
            profileIndex: 1,
        });

        const { setPermission, getProfiles } = await import(UTILS);

        await setPermission('https://snort.social', 'signEvent', 'allow', 0);
        await flushStorageWrites();

        const profiles = await getProfiles();
        // The grant landed on profile 0 (Alice)...
        expect(profiles[0].hosts['https://snort.social']).toEqual({ signEvent: 'allow' });
        // ...and NOT on the active profile 1 (Bob).
        expect(profiles[1].hosts['https://snort.social']).toBeUndefined();
    });

    it('with no index it still falls back to the active profile', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        await local.set({
            profiles: [makeProfile('Alice'), makeProfile('Bob')],
            profileIndex: 1,
        });

        const { setPermission, getProfiles } = await import(UTILS);

        // Omitting index → active profile (index 1 / Bob).
        await setPermission('https://iris.to', 'signEvent', 'deny');
        await flushStorageWrites();

        const profiles = await getProfiles();
        expect(profiles[1].hosts['https://iris.to']).toEqual({ signEvent: 'deny' });
        expect(profiles[0].hosts['https://iris.to']).toBeUndefined();
    });

    it('an explicit non-zero index is honored', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        await local.set({
            profiles: [makeProfile('Alice'), makeProfile('Bob'), makeProfile('Carol')],
            profileIndex: 0,
        });

        const { setPermission, getProfiles } = await import(UTILS);

        await setPermission('https://primal.net', 'getPubKey', 'allow', 2);
        await flushStorageWrites();

        const profiles = await getProfiles();
        expect(profiles[2].hosts['https://primal.net']).toEqual({ getPubKey: 'allow' });
        expect(profiles[0].hosts['https://primal.net']).toBeUndefined();
    });
});

describe('setPermission on an incomplete profile', () => {
    it('writes the grant on a profile that has no hosts map', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        const { hosts, ...adopted } = makeProfile('Synced');
        await local.set({ profiles: [adopted], profileIndex: 0 });

        const { setPermission, getPermission } = await import(UTILS);

        await setPermission('https://jumble.social', 'signEvent:1', 'allow');
        await flushStorageWrites();

        expect(await getPermission('https://jumble.social', 'signEvent:1')).toBe('allow');
    });

    it('names the problem when the profile index does not exist', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        await local.set({ profiles: [makeProfile('Alice')], profileIndex: 0 });

        const { setPermission, getProfiles } = await import(UTILS);

        await expect(setPermission('https://iris.to', 'signEvent', 'allow', 4))
            .rejects.toThrow(/no profile at index 4/i);
        await flushStorageWrites();
        expect(await getProfiles()).toHaveLength(1);
    });
});
