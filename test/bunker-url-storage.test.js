/**
 * A remote signer's connection secret stays out of everything NostrKey keeps or
 * sends about a profile. The profile holds the signer's address only; a live
 * session keeps its own wrapped copy in bunkerSessions.
 *
 * The checks read the parsed `secret` value and search for the secret's own
 * text, rather than looking for the string "secret=".
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';
import {
    bootWorker, bootUnlocked, deviceWrapped, localProfile, answerWithin,
    HEX_A, PUB_A, ORIGIN, PAGE_SENDER,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';
import { encrypt, decrypt } from '../src/utilities/crypto.js';
import {
    parseBunkerUrl, redactBunkerUrl, redactProfiles, bunkerUrlHasSecret,
} from '../src/utilities/bunker-url.js';

const SECRET = 'plum-orchard-41';
const RELAY = 'wss://relay.example.com';
const PK = SIGNER_PUB;
const ADDRESS = `bunker://${PK}?relay=${RELAY}`;
const WITH_SECRET = `${ADDRESS}&secret=${SECRET}`;
const PASSWORD = 'correct horse battery staple';

const holdsSecret = (value) => JSON.stringify(value).includes(SECRET);

const bunkerProfile = (bunkerUrl, overrides = {}) => ({
    name: 'Remote', privKey: '', pubKey: '', hosts: {}, relays: [], type: 'bunker',
    bunkerUrl, remotePubkey: PK, updatedAt: 1700000000, ...overrides,
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('redactBunkerUrl', () => {
    it('keeps the signer pubkey and every relay', () => {
        const url = `bunker://${PK}?relay=${RELAY}&relay=wss://two.example.com&secret=${SECRET}`;
        const parsed = parseBunkerUrl(redactBunkerUrl(url));
        expect(parsed).toEqual({
            remotePubkey: PK,
            relays: [RELAY, 'wss://two.example.com'],
            secret: null,
        });
    });

    const carriers = {
        'a plain value': WITH_SECRET,
        'a repeated value': `${WITH_SECRET}&secret=other-${SECRET}`,
        'an encoded name': `${ADDRESS}&%73ecret=${SECRET}`,
        'a fragment': `${ADDRESS}#secret=${SECRET}`,
        'userinfo': `bunker://user:${SECRET}@${PK}?relay=${RELAY}`,
        'another name': `${ADDRESS}&token=${SECRET}`,
        'a relay with userinfo': `bunker://${PK}?relay=${encodeURIComponent(`wss://user:${SECRET}@relay.example.com`)}`,
        'a relay with a secret param': `bunker://${PK}?relay=${encodeURIComponent(`${RELAY}?secret=${SECRET}`)}`,
        'a relay with an encoded secret param': `bunker://${PK}?relay=${encodeURIComponent(`${RELAY}?%73ecret=${SECRET}`)}`,
    };
    for (const [name, url] of Object.entries(carriers)) {
        it(`removes ${name}`, () => {
            const clean = redactBunkerUrl(url);
            expect(clean).not.toContain(SECRET);
            expect(parseBunkerUrl(clean).remotePubkey).toBe(PK);
            expect(new URL(parseBunkerUrl(clean).relays[0]).hostname).toBe('relay.example.com');
            expect(redactBunkerUrl(clean)).toBe(clean);
        });
    }

    it('keeps a relay address exactly when it holds nothing to remove', () => {
        expect(redactBunkerUrl(WITH_SECRET)).toBe(ADDRESS);
    });

    it('keeps a relay\'s other query params', () => {
        const relay = `${RELAY}/path?auth=public&secret=${SECRET}&region=ca`;
        const [kept] = parseBunkerUrl(redactBunkerUrl(`bunker://${PK}?relay=${encodeURIComponent(relay)}`)).relays;
        expect(kept).toBe(`${RELAY}/path?auth=public&region=ca`);
    });

    it('rebuilds a relay that needs escaping so it still parses the same', () => {
        const relay = 'wss://relay.example.com/a?b=1&c=2';
        const url = `bunker://${PK}?relay=${encodeURIComponent(relay)}&secret=${SECRET}`;
        expect(parseBunkerUrl(redactBunkerUrl(url)).relays).toEqual([relay]);
    });

    it('is stable on its own output', () => {
        const once = redactBunkerUrl(WITH_SECRET);
        expect(redactBunkerUrl(once)).toBe(once);
    });

    for (const [name, bad] of [
        ['not a bunker url', `https://example.com?secret=${SECRET}`],
        ['a short pubkey', `bunker://abc?relay=${RELAY}&secret=${SECRET}`],
        ['no relay', `bunker://${PK}?secret=${SECRET}`],
        ['a non-websocket relay', `bunker://${PK}?relay=https://x.example&secret=${SECRET}`],
        ['null', null],
        ['undefined', undefined],
        ['a number', 7],
        ['an object', { url: SECRET }],
    ]) {
        it(`returns empty for ${name}`, () => {
            expect(redactBunkerUrl(bad)).toBe('');
        });
    }
});

describe('redactProfiles', () => {
    it('hands back the same list when there is nothing to do', () => {
        const profiles = [bunkerProfile(ADDRESS), bunkerProfile(null), bunkerProfile(''), { name: 'x' }];
        expect(redactProfiles(profiles)).toBe(profiles);
    });

    it('leaves everything but the address alone', () => {
        const [clean] = redactProfiles([bunkerProfile(WITH_SECRET, { updatedAt: 5 })]);
        expect(clean).toEqual(bunkerProfile(ADDRESS, { updatedAt: 5 }));
    });

    it('passes a non-list through', () => {
        expect(redactProfiles(undefined)).toBeUndefined();
        expect(redactProfiles('x')).toBe('x');
    });

    it('does not trip on a null entry', () => {
        expect(redactProfiles([null, bunkerProfile(WITH_SECRET)])[1].bunkerUrl).toBe(ADDRESS);
    });
});

describe('bunkerUrlHasSecret', () => {
    it('reads the parsed value and never throws', () => {
        expect(bunkerUrlHasSecret(WITH_SECRET)).toBe(true);
        expect(bunkerUrlHasSecret(`${ADDRESS}&%73ecret=${SECRET}`)).toBe(true);
        expect(bunkerUrlHasSecret(ADDRESS)).toBe(false);
        expect(bunkerUrlHasSecret('nonsense')).toBe(false);
        expect(bunkerUrlHasSecret(null)).toBe(false);
    });
});

describe('bunkerUrlHasSecret agrees with redaction', () => {
    const inRelay = (relay) => `bunker://${PK}?relay=${encodeURIComponent(relay)}`;
    it('sees a secret held in a relay value', () => {
        expect(bunkerUrlHasSecret(inRelay(`${RELAY}?secret=${SECRET}`))).toBe(true);
        expect(bunkerUrlHasSecret(inRelay(`wss://user:${SECRET}@relay.example.com`))).toBe(true);
    });
    it('sees none in a relay with only other params', () => {
        expect(bunkerUrlHasSecret(inRelay(`${RELAY}?auth=public`))).toBe(false);
    });
    it('sees none in anything redaction produced', () => {
        for (const url of [WITH_SECRET, inRelay(`${RELAY}?secret=${SECRET}`)]) {
            expect(bunkerUrlHasSecret(redactBunkerUrl(url))).toBe(false);
        }
    });
});

describe('the profile list after startup', () => {
    const bootWith = async (bunkerUrl, extra = {}, opts = {}) => {
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        return bootWorker({
            profiles: [localProfile(blobs[0]), bunkerProfile(bunkerUrl)],
            profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
            deviceKeySeed, deviceKeyStrategy, ...extra,
        }, opts);
    };

    it('an older stored secret is removed, and updatedAt does not move', async () => {
        const env = await bootWith(WITH_SECRET);
        await env.flushWrites();
        const { profiles } = await env.local.get('profiles');
        expect(profiles[1]).toEqual(bunkerProfile(ADDRESS));
        expect(holdsSecret(env.local._dump())).toBe(false);
    });

    it('a clean list is not written at all', async () => {
        let set;
        const env = await bootWith(ADDRESS, {}, {
            beforeBoot: (e) => { set = vi.spyOn(e.chrome.storage.local, 'set'); },
        });
        await env.flushWrites();
        expect(set.mock.calls.filter(([written]) => 'profiles' in written)).toEqual([]);
    });

    it('a second start finds nothing left to change', async () => {
        const env = await bootWith(WITH_SECRET);
        await env.flushWrites();
        const before = (await env.local.get('profiles')).profiles;
        const again = await env.restart();
        await again.flushWrites();
        expect((await again.local.get('profiles')).profiles).toEqual(before);
    });

    it('an unlock waits for the cleanup, so the two cannot overwrite each other', async () => {
        let letGo;
        const gate = new Promise(r => { letGo = r; });
        const order = [];
        const env = await bootWorker({ profiles: [bunkerProfile(WITH_SECRET)], profileIndex: 0, isEncrypted: false }, {
            beforeBoot: (e) => {
                const { get } = e.chrome.storage.local;
                e.chrome.storage.local.get = async (keys) => {
                    const isCleanup = keys && typeof keys === 'object' && !Array.isArray(keys)
                        && Object.keys(keys).length === 1 && Array.isArray(keys.profiles);
                    if (isCleanup && !order.includes('cleanup')) { order.push('cleanup'); await gate; order.push('cleaned'); }
                    return get(keys);
                };
            },
        });
        const unlock = env.dispatch({ kind: 'unlock', payload: 'x' }).then(() => order.push('unlocked'));
        await new Promise(r => setTimeout(r, 30));
        expect(order).toEqual(['cleanup']);
        letGo();
        await unlock;
        expect(order).toEqual(['cleanup', 'cleaned', 'unlocked']);
    });

    it('does not touch the database version', async () => {
        const env = await bootWith(WITH_SECRET, { version: 5 });
        await env.flushWrites();
        expect((await env.local.get('version')).version).toBe(5);
    });
});

describe('storage.sync', () => {
    const syncOf = (profiles) => ({
        profiles: JSON.stringify(profiles),
        _sync_meta: JSON.stringify({ lastWrittenAt: 1, keys: ['profiles'] }),
    });

    /** The chunked shape the sync layer writes for a large value. */
    function chunkedSync(profiles) {
        const json = JSON.stringify(profiles);
        const size = 8092;
        const chunks = {};
        let count = 0;
        for (let i = 0; i < json.length; i += size) chunks[`_chunk:profiles:${count++}`] = json.slice(i, i + size);
        return {
            ...chunks,
            profiles: JSON.stringify({ __chunked: true, count }),
            _sync_meta: JSON.stringify({ lastWrittenAt: 1, keys: [...Object.keys(chunks), 'profiles'] }),
        };
    }

    const bootLocal = async (sync, extra = {}, opts = {}) => {
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        return bootWorker({
            profiles: [localProfile(blobs[0])], profileIndex: 0, isEncrypted: false,
            autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy, ...extra,
        }, { sync, ...opts });
    };

    it('an old secret is removed even with sync turned off', async () => {
        const env = await bootLocal(syncOf([bunkerProfile(WITH_SECRET)]), { platformSyncEnabled: false });
        await env.flushWrites();
        const dump = env.sync._dump();
        expect(holdsSecret(dump)).toBe(false);
        expect(JSON.parse(dump.profiles)).toEqual([bunkerProfile(ADDRESS)]);
        expect(holdsSecret(env.local._dump())).toBe(false);
    });

    it('nothing is written when sync already holds no secret', async () => {
        const seeded = syncOf([bunkerProfile(ADDRESS)]);
        let set;
        const env = await bootLocal(seeded, { platformSyncEnabled: false }, {
            beforeBoot: (e) => { set = vi.spyOn(e.chrome.storage.sync, 'set'); },
        });
        await env.flushWrites();
        expect(set).not.toHaveBeenCalled();
        expect(env.sync._dump()).toEqual(seeded);
    });

    it('a secret split across chunks is removed, and no old chunk is left over', async () => {
        // The padding puts the secret past the first chunk.
        const filler = bunkerProfile(ADDRESS, { name: 'n'.repeat(9000) });
        const synced = [filler, bunkerProfile(WITH_SECRET, { remotePubkey: PUB_A })];
        const seeded = chunkedSync(synced);
        expect(Object.keys(seeded).filter(k => k.startsWith('_chunk:')).length).toBeGreaterThan(1);

        const env = await bootLocal(seeded, { platformSyncEnabled: false });
        await env.flushWrites();
        const dump = env.sync._dump();
        expect(holdsSecret(dump)).toBe(false);

        const { pullFromSync } = await import('../src/utilities/sync-manager.js');
        const pulled = await pullFromSync();
        expect(pulled.profiles.map(p => p.bunkerUrl)).toEqual([ADDRESS, ADDRESS]);
    });

    it('a list that gets shorter drops the chunks it no longer uses', async () => {
        // One long secret pushes the list over the chunk size; without it the
        // list fits in a single item.
        const long = `${ADDRESS}&secret=${SECRET}${'x'.repeat(9000)}`;
        const env = await bootLocal(chunkedSync([bunkerProfile(long)]), { platformSyncEnabled: false });
        await env.flushWrites();
        const dump = env.sync._dump();
        expect(Object.keys(dump).filter(k => k.startsWith('_chunk:'))).toEqual([]);
        expect(JSON.parse(dump.profiles)).toEqual([bunkerProfile(ADDRESS)]);
    });

    it('leaves another value\'s chunks alone when dropping its own', async () => {
        const long = `${ADDRESS}&secret=${SECRET}${'x'.repeat(9000)}`;
        const neighbours = {
            '_chunk:vaultDocs:0': 'v0', '_chunk:vaultDocs:1': 'v1', '_chunk:profilesArchive:0': 'a0',
        };
        const env = await bootLocal(
            { ...chunkedSync([bunkerProfile(long)]), ...neighbours },
            { platformSyncEnabled: false },
        );
        await env.flushWrites();
        const dump = env.sync._dump();
        expect(Object.keys(dump).filter(k => k.startsWith('_chunk:')).sort()).toEqual(Object.keys(neighbours).sort());
        for (const [k, v] of Object.entries(neighbours)) expect(dump[k]).toBe(v);
    });

    it('a failed cleanup does not stop sync from starting', async () => {
        const env = await bootLocal(syncOf([bunkerProfile(ADDRESS, { name: 'From sync' })]));
        const { initSync } = await import('../src/utilities/sync-manager.js');
        const { get } = env.chrome.storage.sync;
        const reads = vi.fn();
        env.chrome.storage.sync.get = async (keys) => {
            reads();
            if (reads.mock.calls.length === 1) throw new Error('quota');
            return get(keys);
        };
        await expect(initSync()).resolves.toBeUndefined();
        expect(reads.mock.calls.length).toBeGreaterThan(1);
    });

    it('leaves unreadable sync data alone', async () => {
        const seeded = { profiles: '{not json' };
        const env = await bootLocal(seeded, { platformSyncEnabled: false });
        await env.flushWrites();
        expect(env.sync._dump()).toEqual(seeded);
    });
});

describe('buildSyncPayload', () => {
    it('never carries a secret, even from an unhealed local profile', async () => {
        const { local } = installFakeChrome();
        local._seed({ profiles: [bunkerProfile(WITH_SECRET)] });
        vi.resetModules();
        const { buildSyncPayload } = await import('../src/utilities/sync-manager.js');
        const entries = await buildSyncPayload();
        const profiles = JSON.parse(entries.find(e => e.key === 'profiles').jsonString);
        expect(parseBunkerUrl(profiles[0].bunkerUrl)).toMatchObject({ remotePubkey: PK, secret: null });
        expect(holdsSecret(entries)).toBe(false);
    });
});

describe('mergeIntoLocal', () => {
    const loadMerge = async (seed) => {
        const env = installFakeChrome();
        env.local._seed(seed);
        vi.resetModules();
        const { mergeIntoLocal } = await import('../src/utilities/sync-manager.js');
        return { env, mergeIntoLocal };
    };
    const paths = {
        'a fresh install adopting everything': {},
        'a newer copy of a profile already here': {
            profiles: [bunkerProfile(ADDRESS, { updatedAt: 1 }), { name: 'Other', pubKey: PUB_A, hosts: {} }],
        },
        'a new identity': {
            profiles: [{ name: 'Mine', pubKey: PUB_A, privKey: 'x', hosts: { a: {} } }, { name: 'Other', pubKey: 'cd'.repeat(32), hosts: {} }],
        },
    };
    for (const [name, seed] of Object.entries(paths)) {
        it(`stores no secret: ${name}`, async () => {
            const { env, mergeIntoLocal } = await loadMerge(seed);
            await mergeIntoLocal({ profiles: [bunkerProfile(WITH_SECRET)] });
            const { profiles } = env.local._dump();
            expect(profiles.some(p => p.bunkerUrl === ADDRESS)).toBe(true);
            expect(holdsSecret(env.local._dump())).toBe(false);
        });
    }
});

describe('restoring a backup made before this change', () => {
    async function envelope(data) {
        const blob = await encrypt(JSON.stringify(data), PASSWORD);
        return { format: 'nostrkey-backup', version: 1, payload: JSON.parse(blob) };
    }

    it('no write ever carries the secret, even with a profile that needs its pubKey filled', async () => {
        const env = await bootUnlocked();
        const withoutPubKey = { ...localProfile(await encrypt(HEX_A, PASSWORD)), pubKey: '' };
        const backup = await envelope({
            profiles: [withoutPubKey, bunkerProfile(WITH_SECRET)],
            profileIndex: 0,
            isEncrypted: true,
        });

        const set = vi.spyOn(env.chrome.storage.local, 'set');
        const res = await env.dispatch({ kind: 'backup.import', payload: { envelope: backup, password: PASSWORD } });
        expect(res).toMatchObject({ success: true });
        await env.flushWrites();

        expect(set).toHaveBeenCalled();
        for (const [written] of set.mock.calls) expect(holdsSecret(written)).toBe(false);
        expect(holdsSecret(env.local._dump())).toBe(false);
        const { profiles } = env.local._dump();
        expect(profiles[0].pubKey).toBe(PUB_A);
        expect(profiles[1].bunkerUrl).toBe(ADDRESS);
    });
});

describe('newBunkerProfile', () => {
    it('stores the address only', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        env.local._seed({ profiles: [], profileIndex: 0 });
        const { newBunkerProfile } = await import('../src/utilities/utils.js');
        await newBunkerProfile('Remote', WITH_SECRET);
        await env.flushWrites();
        const { profiles } = env.local._dump();
        expect(profiles.at(-1).bunkerUrl).toBe(ADDRESS);
        expect(holdsSecret(profiles)).toBe(false);
    });
});

describe('a real connection', () => {
    const SIGN = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
    const grants = { [ORIGIN]: { 'signEvent:1': 'allow' } };

    async function connected() {
        const signer = installFakeSigner();
        const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        const env = await bootWorker({
            profiles: [bunkerProfile(null, { hosts: grants })],
            profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
            deviceKeySeed, deviceKeyStrategy,
        });
        const res = await env.dispatch({
            kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: WITH_SECRET },
        });
        expect(res).toMatchObject({ success: true, remotePubkey: PK });
        await env.flushWrites();
        return { env, signer };
    }

    it('uses the pasted secret, and stores only the address', async () => {
        const { env, signer } = await connected();
        const connect = signer.requests.find(r => r.method === 'connect');
        expect(connect.params).toEqual([PK, SECRET]);

        const { profiles } = env.local._dump();
        expect(profiles[0].bunkerUrl).toBe(ADDRESS);
        expect(profiles[0].remotePubkey).toBe(PK);
        expect(holdsSecret(profiles)).toBe(false);
    });

    it('nothing in local storage or sync reads back a secret', async () => {
        const { env } = await connected();
        const { pushToSync } = await import('../src/utilities/sync-manager.js');
        await pushToSync();
        await env.flushWrites();

        expect(holdsSecret(env.local._dump())).toBe(false);
        expect(holdsSecret(env.sync._dump())).toBe(false);
        expect(JSON.parse(env.sync._dump().profiles)[0].bunkerUrl).toBe(ADDRESS);
    });

    it('nothing in an encrypted backup reads back a secret', async () => {
        const { env } = await connected();
        await env.dispatch({ kind: 'setPassword', payload: PASSWORD });
        await env.flushWrites();
        const res = await env.dispatch({ kind: 'backup.export' });
        expect(res).toMatchObject({ success: true });

        const plain = await decrypt(JSON.stringify(res.envelope.payload), PASSWORD);
        expect(plain).toContain(PK);
        expect(plain).not.toContain(SECRET);
    });

    it('status says a stored session can be picked up again', async () => {
        const { env } = await connected();
        expect(await env.dispatch({ kind: 'bunker.status', payload: 0 }))
            .toEqual({ connected: true, hasSession: true });
        const next = await env.restart();
        expect(await next.dispatch({ kind: 'bunker.status', payload: 0 }))
            .toEqual({ connected: false, hasSession: true });
    });

    it('status says so when nothing is stored', async () => {
        const { env } = await connected();
        await env.dispatch({ kind: 'bunker.disconnect', payload: 0 });
        await env.flushWrites();
        expect(await env.dispatch({ kind: 'bunker.status', payload: 0 }))
            .toEqual({ connected: false, hasSession: false });
    });

    it('a reconnect the signer does not accept keeps the working session', async () => {
        const { env, signer } = await connected();
        const before = JSON.stringify(env.local._dump().bunkerSessions);

        signer.refuse.get_public_key = 'unauthorized';
        const res = await env.dispatch({
            kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: ADDRESS },
        });
        expect(res).toMatchObject({ success: false, error: 'unauthorized' });
        await env.flushWrites();
        expect(JSON.stringify(env.local._dump().bunkerSessions)).toBe(before);

        delete signer.refuse.get_public_key;
        expect(await answerWithin(env.dispatch(
            { kind: 'signEvent', payload: SIGN, host: ORIGIN }, PAGE_SENDER,
        ))).toMatchObject({ kind: 1, pubkey: PK });
    });

    it('a reconnect the signer does accept replaces the session', async () => {
        const { env } = await connected();
        const before = JSON.stringify(env.local._dump().bunkerSessions);
        const res = await env.dispatch({
            kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: WITH_SECRET },
        });
        expect(res).toMatchObject({ success: true, remotePubkey: PK });
        await env.flushWrites();
        expect(JSON.stringify(env.local._dump().bunkerSessions)).not.toBe(before);
    });

    it('a session from an older version keeps signing after the address is cleaned', async () => {
        const { env, signer } = await connected();

        // What 1.8.4 left behind: the whole string on the profile.
        const { profiles } = env.local._dump();
        const sessions = JSON.stringify(env.local._dump().bunkerSessions);
        await env.local.set({ profiles: [{ ...profiles[0], bunkerUrl: WITH_SECRET }] });

        const next = await env.restart();
        await next.flushWrites();
        expect((await next.local.get('profiles')).profiles[0].bunkerUrl).toBe(ADDRESS);
        expect(JSON.stringify(next.local._dump().bunkerSessions)).toBe(sessions);

        signer.requests.length = 0;
        const signed = await answerWithin(next.dispatch(
            { kind: 'signEvent', payload: SIGN, host: ORIGIN }, PAGE_SENDER,
        ));
        expect(signed).toMatchObject({ kind: 1, pubkey: PK });
        expect(signed.sig).toMatch(/^[0-9a-f]{128}$/);
        expect(signer.requests.map(r => r.method)).toContain('sign_event');
    });
});
