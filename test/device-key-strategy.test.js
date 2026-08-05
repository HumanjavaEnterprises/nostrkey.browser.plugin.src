/**
 * v1.8.1 device-key persistence integrity.
 *
 * The 1.8.1-rc device key trusted IndexedDB whenever a put→get→round-trip probe
 * passed IN THE SAME CONTEXT. That probe cannot prove the handle survives a
 * context change, which is exactly the iOS Safari failure it was written to
 * catch: functional-but-ephemeral IndexedDB passes the probe and then loses the
 * user's only copy of a private key. These tests pin the corrected contract:
 *
 *   - `idb` is only ever ADOPTED (a PRE-EXISTING key that round-trips), never
 *     minted. That is the one signal that proves cross-context persistence, and
 *     it keeps every pre-1.8.1 Chrome/Firefox vault readable.
 *   - every NEW device key lands on `seed` (storage.local), on every platform.
 *   - the resolved strategy is STICKY, so a later context cannot flip strategy
 *     and orphan the blobs already at rest.
 *   - decryption is SYMMETRIC: a seed blob is readable while the strategy is
 *     'idb' and an IDB blob is readable while the strategy is 'seed'.
 *   - resetDeviceKey() drops memoised handles after a storage.clear(), so the
 *     next wrap mints a key that is actually persisted.
 *
 * vitest has no IndexedDB, so `idb` is mocked per test with an in-memory store
 * and `globalThis.indexedDB` is set to make the availability check pass.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

const HEX_A = '1111111111111111111111111111111111111111111111111111111111111111';
const HEX_B = '2222222222222222222222222222222222222222222222222222222222222222';
const DEVICE_KEY_ID = 'device-wrap-key-v1';

const VAULT = '../src/utilities/secret-vault.js';

/** A real non-extractable AES-GCM key, as the extension would have stored. */
function makeAesKey() {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
        'encrypt',
        'decrypt',
    ]);
}

/**
 * Mock the `idb` package with an in-memory store.
 * `ephemeral: true` is the iOS Safari shape — put() resolves, get() never
 * returns anything a later context could use.
 */
function mockIdb(store, { ephemeral = false } = {}) {
    globalThis.indexedDB = {}; // only presence is checked
    vi.doMock('idb', () => ({
        openDB: async () => ({
            get: async (_s, k) => (ephemeral ? undefined : store.get(k)),
            put: async (_s, v, k) => { if (!ephemeral) store.set(k, v); },
            objectStoreNames: { contains: () => true },
            createObjectStore: () => {},
        }),
    }));
}

function noIdb() {
    delete globalThis.indexedDB;
    vi.doUnmock('idb');
}

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.indexedDB;
    vi.doUnmock('idb');
});

describe('a NEW device key never lands on idb, even where IndexedDB works', () => {
    it('uses the seed strategy when the IDB store is empty', async () => {
        vi.resetModules();
        const store = new Map(); // fully functional IDB — just nothing in it yet
        mockIdb(store);
        const env = installFakeChrome();

        const vault = await import(VAULT);
        const blob = await vault.wrapSecret(HEX_A);

        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        // Nothing was minted into IndexedDB — a same-context probe would have
        // passed here, and that is precisely what must not be trusted.
        expect(store.has(DEVICE_KEY_ID)).toBe(false);
        expect(typeof env.local._dump().deviceKeySeed).toBe('string');
        expect(await vault.unwrapSecret(blob)).toBe(HEX_A);
    });

    it('still ADOPTS a pre-existing IDB key (pre-1.8.1 Chrome/Firefox vaults)', async () => {
        vi.resetModules();
        const store = new Map([[DEVICE_KEY_ID, await makeAesKey()]]);
        mockIdb(store);
        const env = installFakeChrome();

        const vault = await import(VAULT);
        const blob = await vault.wrapSecret(HEX_A);

        expect(vault.getDeviceKeyStrategy()).toBe('idb');
        expect(env.local._dump().deviceKeyStrategy).toBe('idb');
        expect(env.local._dump().deviceKeySeed).toBeUndefined();
        expect(await vault.unwrapSecret(blob)).toBe(HEX_A);
    });

    it('seeds when IndexedDB accepts writes but loses them (the iOS shape)', async () => {
        vi.resetModules();
        const store = new Map();
        mockIdb(store, { ephemeral: true });
        installFakeChrome();

        const vault = await import(VAULT);
        await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
    });
});

describe('the resolved strategy is sticky across module reloads', () => {
    it('a seeded vault does not adopt an IDB key that appears later', async () => {
        // Context 1: no IndexedDB at all → seed.
        vi.resetModules();
        noIdb();
        const first = installFakeChrome();
        const v1 = await import(VAULT);
        const blob = await v1.wrapSecret(HEX_A);
        expect(v1.getDeviceKeyStrategy()).toBe('seed');
        expect(first.local._dump().deviceKeyStrategy).toBe('seed');

        // Context 2: same storage, and now a perfectly good IDB key is present.
        const carried = { ...first.local._dump() };
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        const second = installFakeChrome();
        second.local._seed(carried);

        const v2 = await import(VAULT);
        expect(await v2.unwrapSecret(blob)).toBe(HEX_A);
        // Honoured the record instead of flipping and orphaning the blob.
        expect(v2.getDeviceKeyStrategy()).toBe('seed');
    });

    it('degrades idb→seed and records the new strategy when the handle is gone', async () => {
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        const first = installFakeChrome();
        const v1 = await import(VAULT);
        const idbBlob = await v1.wrapSecret(HEX_A);
        expect(v1.getDeviceKeyStrategy()).toBe('idb');

        // The handle vanishes (browser eviction / profile move).
        const carried = { ...first.local._dump() };
        vi.resetModules();
        mockIdb(new Map());
        const second = installFakeChrome();
        second.local._seed(carried);

        const v2 = await import(VAULT);
        const seedBlob = await v2.wrapSecret(HEX_B);
        expect(v2.getDeviceKeyStrategy()).toBe('seed');
        expect(second.local._dump().deviceKeyStrategy).toBe('seed');
        expect(await v2.unwrapSecret(seedBlob)).toBe(HEX_B);
        // The idb-wrapped blob is genuinely unreadable now (its key is gone) —
        // it must fail loudly, not silently decrypt to something else.
        await expect(v2.unwrapSecret(idbBlob)).rejects.toBeTruthy();
    });
});

describe('decrypt fallback is symmetric across a strategy flip', () => {
    it('reads a SEED blob while the current strategy is idb', async () => {
        // Context 1: seed strategy writes the blob.
        vi.resetModules();
        noIdb();
        const first = installFakeChrome();
        const v1 = await import(VAULT);
        const seedBlob = await v1.wrapSecret(HEX_A);
        expect(v1.getDeviceKeyStrategy()).toBe('seed');

        // Context 2: the sticky record is lost but the seed survives, and an IDB
        // key is now adoptable → the context resolves to 'idb'.
        const carried = { ...first.local._dump() };
        delete carried.deviceKeyStrategy;
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        const second = installFakeChrome();
        second.local._seed(carried);

        const v2 = await import(VAULT);
        expect(await v2.getDeviceKey()).toBeTruthy();
        expect(v2.getDeviceKeyStrategy()).toBe('idb');
        // The seed blob is still readable — the flip must not orphan it.
        expect(await v2.unwrapSecret(seedBlob)).toBe(HEX_A);

        // And it can be opportunistically upgraded to the current strategy.
        const { plaintext, rewrapped } = await v2.decryptDeviceBlobForRewrap(seedBlob);
        expect(plaintext).toBe(HEX_A);
        expect(rewrapped).toBeTruthy();
        expect(await v2.unwrapSecret(rewrapped)).toBe(HEX_A);
    });

    it('reads an IDB blob while the current strategy is seed', async () => {
        vi.resetModules();
        const idbStore = new Map([[DEVICE_KEY_ID, await makeAesKey()]]);
        mockIdb(idbStore);
        const first = installFakeChrome();
        const v1 = await import(VAULT);
        const idbBlob = await v1.wrapSecret(HEX_B);
        expect(v1.getDeviceKeyStrategy()).toBe('idb');

        // Context 2: the sticky record says seed (e.g. a degrade happened in
        // between), while the IDB handle is still there.
        const carried = { ...first.local._dump(), deviceKeyStrategy: 'seed' };
        vi.resetModules();
        mockIdb(idbStore);
        const second = installFakeChrome();
        second.local._seed(carried);

        const v2 = await import(VAULT);
        await v2.getDeviceKey();
        expect(v2.getDeviceKeyStrategy()).toBe('seed');
        expect(await v2.unwrapSecret(idbBlob)).toBe(HEX_B);

        const { rewrapped } = await v2.decryptDeviceBlobForRewrap(idbBlob);
        expect(rewrapped).toBeTruthy();
        expect(await v2.unwrapSecret(rewrapped)).toBe(HEX_B);
    });
});

describe('resetDeviceKey — memoised handles must not outlive storage.clear()', () => {
    it('clearData() forces a fresh, actually-persisted device key', async () => {
        vi.resetModules();
        noIdb();
        const env = installFakeChrome();
        const vault = await import(VAULT);

        await vault.wrapSecret(HEX_A);
        const seedBefore = env.local._dump().deviceKeySeed;
        expect(typeof seedBefore).toBe('string');

        const { clearData } = await import('../src/utilities/utils.js');
        await clearData();
        expect(env.local._dump().deviceKeySeed).toBeUndefined();
        expect(env.local._dump().deviceKeyStrategy).toBeUndefined();

        // Without the reset this would silently reuse the cached key and never
        // write a seed — the blob would die with this context.
        const after = await vault.wrapSecret(HEX_B);
        const seedAfter = env.local._dump().deviceKeySeed;
        expect(typeof seedAfter).toBe('string');
        expect(seedAfter).not.toBe(seedBefore);
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        expect(await vault.unwrapSecret(after)).toBe(HEX_B);
    });
});
