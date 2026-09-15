/**
 * Issue #4 — "No way to switch the active profile" — regression coverage
 * for the actual switch seam: getProfileIndex/setProfileIndex/getProfiles
 * in src/utilities/utils.js. This is the same storage.set({ profileIndex })
 * call that sidepanel.js's selectProfile() (src/sidepanel.js:621-629) makes
 * when a user clicks a profile row in the Home "Identities" list.
 *
 * NOTE FOR REVIEWER: existing test/profiles.test.js already has a "switch
 * active profile" describe block, but it exercises a hand-rolled replica
 * (id-keyed `active_profile`) that does not match production, which tracks
 * the active profile as a 0-based `profileIndex` into the `profiles` array
 * (src/utilities/utils.js:173-180). This file exercises the REAL functions
 * instead, following the pattern used in test/device-key-strategy.test.js
 * and test/fake-chrome-contract.test.js (installFakeChrome + dynamic import
 * so src/utilities/browser-polyfill.js sees a chrome global at import time).
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

describe('active profile switch (real src/utilities/utils.js seam)', () => {
    it('defaults to profile index 0 when nothing has been set', async () => {
        vi.resetModules();
        installFakeChrome();
        const { getProfileIndex } = await import(UTILS);

        expect(await getProfileIndex()).toBe(0);
    });

    it('setProfileIndex makes the requested profile active and the previous one no longer active', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        await local.set({
            profiles: [makeProfile('Alice'), makeProfile('Bob')],
            profileIndex: 0,
        });

        const { getProfileIndex, setProfileIndex, getProfiles } = await import(UTILS);

        expect(await getProfileIndex()).toBe(0);
        expect((await getProfiles())[await getProfileIndex()].name).toBe('Alice');

        await setProfileIndex(1);
        await flushStorageWrites();

        const activeIndex = await getProfileIndex();
        expect(activeIndex).toBe(1);
        expect(activeIndex).not.toBe(0);
        expect((await getProfiles())[activeIndex].name).toBe('Bob');
    });

    it('the switch persists across a reload (fresh module import against the same store)', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        await local.set({
            profiles: [makeProfile('Alice'), makeProfile('Bob'), makeProfile('Carol')],
            profileIndex: 0,
        });

        const first = await import(UTILS);
        await first.setProfileIndex(2);
        await flushStorageWrites();

        // Simulate the extension reloading (e.g. sidepanel re-opened): fresh
        // module graph, same underlying storage area.
        vi.resetModules();
        const second = await import(UTILS);

        expect(await second.getProfileIndex()).toBe(2);
        expect((await second.getProfiles())[await second.getProfileIndex()].name).toBe('Carol');
    });

    it('switching back and forth between profiles only ever marks one index active at a time', async () => {
        vi.resetModules();
        const { local } = installFakeChrome();
        await local.set({
            profiles: [makeProfile('Alice'), makeProfile('Bob')],
            profileIndex: 0,
        });

        const { getProfileIndex, setProfileIndex } = await import(UTILS);

        await setProfileIndex(1);
        await flushStorageWrites();
        expect(await getProfileIndex()).toBe(1);

        await setProfileIndex(0);
        await flushStorageWrites();
        expect(await getProfileIndex()).toBe(0);
    });
});
