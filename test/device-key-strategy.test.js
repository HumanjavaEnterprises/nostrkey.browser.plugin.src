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
import { hashPassword } from '../src/utilities/crypto.js';

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
    delete globalThis.browser;
    delete globalThis.indexedDB;
    vi.doUnmock('idb');
});

/** Let an async startup IIFE (background worker) run to completion. */
async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

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

/**
 * Safari-specific: WebKit scopes extension IndexedDB by the per-install
 * `safari-web-extension://<uuid>` ORIGIN, which rotates across (re)installs,
 * while storage.local is scoped by BUNDLE ID and survives. A Safari vault can
 * therefore keep its data and lose an IDB-held wrapping key. Discovered by
 * device forensics on iPadOS 26.2 (two IndexedDB origin dirs, one extension) —
 * the mechanism behind the 1.8.0 iOS data loss.
 */
describe('Safari never wraps under an IndexedDB key', () => {
    const SAFARI = 'safari-web-extension://11111111-2222-3333-4444-555555555555/';

    it('adopts nothing from IDB and seeds instead, even with a perfectly good pre-existing key', async () => {
        vi.resetModules();
        const store = new Map();
        store.set(DEVICE_KEY_ID, await makeAesKey()); // a durable, adoptable handle
        mockIdb(store);
        const env = installFakeChrome({ origin: SAFARI });
        const vault = await import(VAULT);

        const blob = await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        expect(typeof env.local._dump().deviceKeySeed).toBe('string');
        expect(env.local._dump().deviceKeyStrategy).toBe('seed');
        expect(await vault.unwrapSecret(blob)).toBe(HEX_A);
    });

    it('still reads a legacy IDB blob, and re-wraps it under the seed', async () => {
        // LIFE 1 — a 1.8.0-era Chrome-shaped life that wrapped under the IDB key.
        vi.resetModules();
        const store = new Map();
        store.set(DEVICE_KEY_ID, await makeAesKey());
        mockIdb(store);
        const chromeEnv = installFakeChrome();
        let vault = await import(VAULT);
        await chromeEnv.local.set({ deviceKeyStrategy: 'idb' }); // pin the old strategy
        vi.resetModules();
        mockIdb(store);
        vault = await import(VAULT);
        const legacyBlob = await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('idb');
        const carriedStorage = { ...chromeEnv.local._dump() };

        // LIFE 2 — same data, now on Safari: the IDB key must not be adopted,
        // yet the legacy blob must still open and come back seed-wrapped.
        vi.resetModules();
        mockIdb(store);
        const safariEnv = installFakeChrome({ origin: SAFARI });
        safariEnv.local._seed(carriedStorage);
        vault = await import(VAULT);

        const { plaintext, rewrapped } = await vault.decryptDeviceBlobForRewrap(legacyBlob);
        expect(plaintext).toBe(HEX_A);            // no data loss
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        expect(rewrapped).toBeTruthy();           // migrated off IDB

        // LIFE 3 — a reinstall (IDB gone entirely). The re-wrapped blob
        // survives; the un-migrated original would not have.
        vi.resetModules();
        noIdb();
        const rotated = installFakeChrome({ origin: 'safari-web-extension://99999999-0000-0000-0000-000000000000/' });
        rotated.local._seed(safariEnv.local._dump());
        vault = await import(VAULT);
        expect(await vault.unwrapSecret(rewrapped)).toBe(HEX_A);
    });

    it('takes the seed path when the extension namespace is `browser`, not `chrome`', async () => {
        // Real Safari (and Firefox) expose `browser`; the suite's default
        // `chrome`-only shape never exercised the polyfill's pass-through
        // branch, so the Safari guard was only ever tested through Chrome's.
        vi.resetModules();
        const store = new Map([[DEVICE_KEY_ID, await makeAesKey()]]);
        mockIdb(store);
        const env = installFakeChrome({ namespace: 'browser', origin: SAFARI });
        expect(globalThis.chrome).toBeUndefined();
        expect(globalThis.browser).toBeTruthy();

        const vault = await import(VAULT);
        const blob = await vault.wrapSecret(HEX_A);

        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        expect(typeof env.local._dump().deviceKeySeed).toBe('string');
        expect(await vault.unwrapSecret(blob)).toBe(HEX_A);
    });
});

/**
 * Finding 4 — the seed-mint race.
 *
 * getDeviceKey() resolves independently in every context, so on a first run the
 * popup and the background can both find no seed and both mint one. The loser's
 * verify-read comes back with the winner's seed. Returning null there dropped
 * the loser through to `_memoryDeviceKey`, wrapping that context's secrets under
 * a key that dies with the context — and on Safari, where seed is now the ONLY
 * strategy, this window is open on every install.
 */
describe('a seed minted by another context is adopted, not treated as failure', () => {
    it('adopts the winning seed instead of degrading to a memory key', async () => {
        vi.resetModules();
        noIdb();
        const env = installFakeChrome();

        // 32 bytes of a DIFFERENT seed, as another context would have written.
        const winner = btoa(String.fromCharCode(...new Uint8Array(32).fill(7)));
        const realSet = env.local.set;
        let raced = false;
        env.local.set = (obj) => {
            if (!raced && obj && typeof obj.deviceKeySeed === 'string') {
                raced = true;
                // The other context's write lands last: ours is overwritten.
                return realSet({ ...obj, deviceKeySeed: winner });
            }
            return realSet(obj);
        };

        const vault = await import(VAULT);
        const blob = await vault.wrapSecret(HEX_A);

        expect(raced).toBe(true);
        // The losing context must still be on a PERSISTED key.
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        expect(vault.getDeviceKeyStrategy()).not.toBe('memory');
        expect(env.local._dump().deviceKeySeed).toBe(winner);

        // And the blob it wrapped opens under the winning seed in a NEW context
        // — i.e. it actually survived, which a memory key never does.
        const carried = { ...env.local._dump() };
        vi.resetModules();
        noIdb();
        const next = installFakeChrome();
        next.local._seed(carried);
        const v2 = await import(VAULT);
        expect(await v2.unwrapSecret(blob)).toBe(HEX_A);
    });

    it('still fails cleanly when the verify-read comes back with nothing at all', async () => {
        vi.resetModules();
        noIdb();
        const env = installFakeChrome();
        // A storage area that silently drops writes has no winner to adopt.
        env.local.set = () => Promise.resolve();

        const vault = await import(VAULT);
        await vault.getDeviceKey();
        expect(vault.getDeviceKeyStrategy()).toBe('memory');
    });
});

/**
 * Finding 6 — engine detection must fail toward `seed`.
 *
 * The two errors are not symmetric: seeding a Chrome vault costs nothing (seed
 * is already where every fresh install lands), while adopting an IndexedDB key
 * on Safari is unsafe. So only a POSITIVELY identified
 * Chrome/Firefox origin may adopt.
 */
describe('ambiguous engine detection resolves to seed', () => {
    it('does not adopt an IDB key when the origin scheme is unrecognised', async () => {
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        const env = installFakeChrome({ origin: 'some-future-extension://abc/' });

        const vault = await import(VAULT);
        const blob = await vault.wrapSecret(HEX_A);

        expect(vault.getDeviceKeyStrategy()).toBe('seed');
        expect(typeof env.local._dump().deviceKeySeed).toBe('string');
        expect(await vault.unwrapSecret(blob)).toBe(HEX_A);
    });

    it('does not adopt an IDB key when getURL throws', async () => {
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        const env = installFakeChrome();
        env.chrome.runtime.getURL = () => { throw new Error('not available here'); };

        const vault = await import(VAULT);
        await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
    });

    it('does not adopt an IDB key when getURL is missing entirely', async () => {
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        const env = installFakeChrome();
        delete env.chrome.runtime.getURL;

        const vault = await import(VAULT);
        await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('seed');
    });

    it('still adopts on a positively identified chrome-extension:// origin', async () => {
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        installFakeChrome({ origin: 'chrome-extension://abcdef/' });
        const vault = await import(VAULT);
        await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('idb');
    });

    it('still adopts on a positively identified moz-extension:// origin', async () => {
        vi.resetModules();
        mockIdb(new Map([[DEVICE_KEY_ID, await makeAesKey()]]));
        installFakeChrome({ origin: 'moz-extension://abcdef/' });
        const vault = await import(VAULT);
        await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('idb');
    });
});

/**
 * Finding 1 — the at-rest migration must repair ALL FOUR stores.
 *
 * Before this fix `migrateSecretsAtRest()` re-wrapped `profiles[].privKey` and
 * nothing else: the API-key and vault-doc arms only fired on values that were
 * NOT already ciphertext (a legacy device blob IS ciphertext, so they were
 * skipped), and `bunkerSessions` was never read at all. Those three stores
 * therefore stayed wrapped under the pre-1.8.1 IndexedDB key — and on Safari
 * that key can become unreachable after a reinstall.
 *
 * The probe is the three-life model: write under IDB (life 1), boot the
 * background on a Safari origin (life 2, migration runs), then rotate the
 * origin away (life 3) and demand every secret still opens.
 */
describe('the at-rest migration re-wraps every store off a legacy IDB key', () => {
    const SAFARI_1 = 'safari-web-extension://aaaaaaaa-1111-1111-1111-111111111111/';
    const SAFARI_2 = 'safari-web-extension://bbbbbbbb-2222-2222-2222-222222222222/';

    const API_SECRET = 'sk-live-do-not-lose-me';
    const NOTE_BODY = '# recovery codes\n1234-5678';
    const BUNKER_SECRET = 'connect-secret-abc';
    const BUNKER_PRIVKEY = '3333333333333333333333333333333333333333333333333333333333333333';

    /** Life 1: a Chrome-shaped context that wraps everything under the IDB key. */
    async function writeLegacyIdbVault(idbStore) {
        vi.resetModules();
        mockIdb(idbStore);
        const env = installFakeChrome();
        await env.local.set({ deviceKeyStrategy: 'idb' });
        vi.resetModules();
        mockIdb(idbStore);
        const vault = await import(VAULT);

        const privKey = await vault.wrapSecret(HEX_A);
        expect(vault.getDeviceKeyStrategy()).toBe('idb');

        await env.local.set({
            profiles: [{ name: 'Main', type: 'local', privKey, hosts: {}, relays: [] }],
            apiKeyVault: {
                keys: {
                    k1: {
                        id: 'k1', label: 'OpenAI',
                        secret: await vault.encryptWithDeviceKey(API_SECRET),
                        createdAt: 1, updatedAt: 1, profileScope: null,
                    },
                },
                syncEnabled: false, eventId: null, relayCreatedAt: null, syncStatus: 'synced',
            },
            vaultDocs: {
                'notes.md': {
                    path: 'notes.md',
                    content: await vault.encryptWithDeviceKey(NOTE_BODY),
                    updatedAt: 1, syncStatus: 'local-only', eventId: null,
                    relayCreatedAt: null, profileScope: null,
                },
            },
            bunkerSessions: {
                0: {
                    remotePubkey: 'ff'.repeat(32),
                    relayUrls: ['wss://relay.nostrkey.com'],
                    secret: await vault.encryptWithDeviceKey(BUNKER_SECRET),
                    sessionPrivkey: await vault.encryptWithDeviceKey(BUNKER_PRIVKEY),
                    sessionPubkey: 'ee'.repeat(32),
                    enc: 'device-v1',
                },
            },
        });

        // Deep clone: the migration mutates the stored objects in place, and a
        // shallow copy would let the "before" snapshot change under us.
        return structuredClone(env.local._dump());
    }

    it('repairs profiles, API keys, vault docs and bunker sessions — and they survive a reinstall', async () => {
        const idbStore = new Map([[DEVICE_KEY_ID, await makeAesKey()]]);
        const carried = await writeLegacyIdbVault(idbStore);

        // --- LIFE 2: same data on Safari. The IDB key is still reachable, so
        // the migration can read the blobs — this is its one chance to move
        // them onto the seed before a reinstall makes the IDB key unreachable.
        vi.resetModules();
        mockIdb(idbStore);
        const safari = installFakeChrome({ origin: SAFARI_1, session: true, alarms: true });
        safari.local._seed(structuredClone(carried));
        safari.setSendMessage((msg) => safari.dispatch(msg));
        await import('../src/background.js');
        await settle(20);

        const migrated = safari.local._dump();
        // Everything is still ciphertext — the migration re-wraps, never unwraps.
        expect(migrated.profiles[0].privKey).not.toBe(carried.profiles[0].privKey);
        expect(migrated.apiKeyVault.keys.k1.secret)
            .not.toBe(carried.apiKeyVault.keys.k1.secret);
        expect(migrated.vaultDocs['notes.md'].content)
            .not.toBe(carried.vaultDocs['notes.md'].content);
        expect(migrated.bunkerSessions[0].secret)
            .not.toBe(carried.bunkerSessions[0].secret);
        expect(migrated.bunkerSessions[0].sessionPrivkey)
            .not.toBe(carried.bunkerSessions[0].sessionPrivkey);
        expect(migrated.apiKeyVault.keys.k1.secret).not.toContain(API_SECRET);
        expect(migrated.vaultDocs['notes.md'].content).not.toContain(NOTE_BODY);

        // --- LIFE 3: the extension is reinstalled. WebKit hands it a new
        // origin, so the IndexedDB directory the old key lived in is gone. Only
        // the bundle-scoped storage.local (and its seed) came across.
        const afterMigration = structuredClone(safari.local._dump());
        vi.resetModules();
        noIdb();
        const rotated = installFakeChrome({ origin: SAFARI_2 });
        rotated.local._seed(structuredClone(afterMigration));
        const vault = await import(VAULT);

        expect(await vault.unwrapSecret(afterMigration.profiles[0].privKey)).toBe(HEX_A);
        expect(await vault.unwrapSecret(afterMigration.apiKeyVault.keys.k1.secret))
            .toBe(API_SECRET);
        expect(await vault.unwrapSecret(afterMigration.vaultDocs['notes.md'].content))
            .toBe(NOTE_BODY);
        expect(await vault.unwrapSecret(afterMigration.bunkerSessions[0].secret))
            .toBe(BUNKER_SECRET);
        expect(await vault.unwrapSecret(afterMigration.bunkerSessions[0].sessionPrivkey))
            .toBe(BUNKER_PRIVKEY);

        // The control: the ORIGINAL, un-migrated blobs are dead after the
        // rotation. That is the loss the migration exists to prevent.
        await expect(vault.unwrapSecret(carried.apiKeyVault.keys.k1.secret))
            .rejects.toBeTruthy();
        await expect(vault.unwrapSecret(carried.bunkerSessions[0].secret))
            .rejects.toBeTruthy();
    });
    it('repairs bunker sessions even when a master password is set (they are device blobs either way)', async () => {
        const idbStore = new Map([[DEVICE_KEY_ID, await makeAesKey()]]);
        const carried = await writeLegacyIdbVault(idbStore);
        // nip46 device-wraps session material regardless of the password state,
        // so a password vault's sessions need the same repair. Gating the
        // bunker arm on !encryptionEnabled left exactly these users exposed.
        const { hash, salt } = await hashPassword('instrument-demo-2026');
        carried.isEncrypted = true;
        carried.passwordHash = hash;
        carried.passwordSalt = salt;
        carried.autoLockMinutes = 0;

        vi.resetModules();
        mockIdb(idbStore);
        const safari = installFakeChrome({ origin: SAFARI_1, session: true, alarms: true });
        safari.local._seed(structuredClone(carried));
        safari.setSendMessage((msg) => safari.dispatch(msg));
        await import('../src/background.js');
        await settle(20);

        const migrated = structuredClone(safari.local._dump());
        expect(migrated.bunkerSessions[0].secret)
            .not.toBe(carried.bunkerSessions[0].secret);

        // And it survives the rotation that kills the un-migrated original.
        vi.resetModules();
        noIdb();
        const rotated = installFakeChrome({ origin: SAFARI_2 });
        rotated.local._seed(structuredClone(migrated));
        const vault = await import(VAULT);
        expect(await vault.unwrapSecret(migrated.bunkerSessions[0].secret)).toBe(BUNKER_SECRET);
        await expect(vault.unwrapSecret(carried.bunkerSessions[0].secret)).rejects.toBeTruthy();
    });
});
