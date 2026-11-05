/**
 * The vault and API key messages through the real worker, with a relay stand-in:
 * what is signed, what reaches the relay, and what comes back. A remote signer
 * profile runs the same paths through a fake signer.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { finalizeEvent, hexToBytes, nip44, verifySignature } from 'nostr-crypto-utils';
import {
    bootWorker, bootWithPassword, deviceWrapped, localProfile, settle, HEX_A, PUB_A,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';
import { installRelay } from './helpers/relay-stand-in.js';

const RELAYS = [{ url: 'wss://relay.example.com', read: true, write: true }];
const ADDRESS = `bunker://${SIGNER_PUB}?relay=wss://relay.example.com`;
const API_D = 'nostrkey:vault/api-keys';
const PASSWORD = 'correct horse battery';

async function bootLocal(overrides = {}) {
    const relay = installRelay();
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
        profiles: [localProfile(blobs[0], {}, { relays: RELAYS, ...overrides })],
        profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    return { env, relay };
}

async function bootRemote() {
    const signer = installFakeSigner();
    const env = await bootWorker({
        profiles: [{
            name: 'Remote', privKey: '', pubKey: '', relays: RELAYS, type: 'bunker',
            bunkerUrl: null, remotePubkey: SIGNER_PUB, hosts: {},
        }],
        profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
    });
    expect(await env.dispatch({ kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: ADDRESS } }))
        .toMatchObject({ success: true });
    await env.flushWrites();
    return { env, signer };
}

const selfKey = () => nip44.v2.utils.getConversationKey(hexToBytes(HEX_A), PUB_A);
const opened = (event) => nip44.v2.decrypt(event.content, selfKey());
const sealed = (text) => nip44.v2.encrypt(text, selfKey());
const signedBack = (d, text, created_at = 1700000000) => finalizeEvent({
    kind: 30078, content: sealed(text), tags: [['d', d]], created_at,
}, hexToBytes(HEX_A));

afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('publishing', () => {
    it('a vault document goes out as a signed, sealed kind 30078', async () => {
        const { env, relay } = await bootLocal();
        const res = await env.dispatch({ kind: 'vault.publish', payload: { path: 'notes/a.md', content: 'hello' } });
        expect(res).toMatchObject({ success: true });
        expect(relay.published).toHaveLength(1);
        const [event] = relay.published;
        expect(event).toMatchObject({ id: res.eventId, created_at: res.createdAt, kind: 30078, pubkey: PUB_A });
        expect(event.tags).toContainEqual(['d', 'nostrkey:notes/a.md']);
        expect(opened(event)).toBe('hello');
        expect(await verifySignature(event)).toBe(true);
    });

    it('the API key store goes out the same way, under its own address', async () => {
        const { env, relay } = await bootLocal();
        const keys = { one: { label: 'Service', secret: 's3' } };
        const res = await env.dispatch({ kind: 'apikeys.publish', payload: { keys } });
        expect(res).toMatchObject({ success: true });
        const [event] = relay.published;
        expect(event).toMatchObject({ id: res.eventId, kind: 30078, pubkey: PUB_A });
        expect(event.tags).toContainEqual(['d', API_D]);
        expect(JSON.parse(opened(event))).toEqual(keys);
        expect(await verifySignature(event)).toBe(true);
    });

    it.each([
        ['vault.delete', { path: 'notes/a.md', eventId: 'e'.repeat(64) }, 'nostrkey:notes/a.md'],
        ['apikeys.delete', { eventId: 'e'.repeat(64) }, API_D],
    ])('%s goes out as a signed kind 5 naming the event', async (kind, payload, d) => {
        const { env, relay } = await bootLocal();
        expect(await env.dispatch({ kind, payload })).toEqual({ success: true });
        const [event] = relay.published;
        expect(event).toMatchObject({ kind: 5, pubkey: PUB_A });
        expect(event.tags).toEqual([['e', 'e'.repeat(64)], ['a', `30078:${PUB_A}:${d}`]]);
        expect(await verifySignature(event)).toBe(true);
    });

    it.each([
        ['vault.publish', { path: 'a', content: 'x' }],
        ['apikeys.publish', { keys: {} }],
        ['vault.delete', { path: 'a', eventId: 'e'.repeat(64) }],
        ['apikeys.delete', { eventId: 'e'.repeat(64) }],
    ])('%s says so when no relay is set', async (kind, payload) => {
        const { env, relay } = await bootLocal({ relays: [] });
        expect(await env.dispatch({ kind, payload })).toEqual({ success: false, error: 'No relays configured' });
        expect(relay.published).toEqual([]);
    });
});

describe('the API key store is not a vault document', () => {
    it.each([
        ['vault.publish', { path: 'vault/api-keys', content: 'x' }],
        ['vault.delete', { path: 'vault/api-keys', eventId: 'e'.repeat(64) }],
    ])('%s refuses its address and sends nothing', async (kind, payload) => {
        const { env, relay } = await bootLocal();
        expect(await env.dispatch({ kind, payload })).toMatchObject({ success: false, error: expect.any(String) });
        expect(relay.published).toEqual([]);
    });

    it('a document with a name close to it still goes out', async () => {
        const { env, relay } = await bootLocal();
        const res = await env.dispatch({ kind: 'vault.publish', payload: { path: 'vault/api-keys.md', content: 'x' } });
        expect(res).toMatchObject({ success: true });
        expect(relay.published[0].tags).toContainEqual(['d', 'nostrkey:vault/api-keys.md']);
    });

    it('apikeys.publish and apikeys.delete still use it', async () => {
        const { env, relay } = await bootLocal();
        expect(await env.dispatch({ kind: 'apikeys.publish', payload: { keys: {} } })).toMatchObject({ success: true });
        expect(await env.dispatch({ kind: 'apikeys.delete', payload: { eventId: 'e'.repeat(64) } })).toEqual({ success: true });
        expect(relay.published.map(e => e.kind)).toEqual([30078, 5]);
    });
});

describe('publishing through a remote signer', () => {
    it.each([
        ['vault.publish', { path: 'a.md', content: 'x' }, 30078],
        ['apikeys.publish', { keys: {} }, 30078],
        ['vault.delete', { path: 'a.md', eventId: 'e'.repeat(64) }, 5],
        ['apikeys.delete', { eventId: 'e'.repeat(64) }, 5],
    ])('%s reaches the relay as the signer signed it', async (kind, payload, want) => {
        const { env, signer } = await bootRemote();
        expect(await env.dispatch({ kind, payload })).toMatchObject({ success: true });
        expect(signer.published).toHaveLength(1);
        expect(signer.published[0]).toMatchObject({ kind: want, pubkey: SIGNER_PUB });
    });

    it.each([
        ['vault.publish', { path: 'a.md', content: 'x' }],
        ['apikeys.publish', { keys: {} }],
        ['vault.delete', { path: 'a.md', eventId: 'e'.repeat(64) }],
        ['apikeys.delete', { eventId: 'e'.repeat(64) }],
    ])('%s publishes nothing a signer changed the kind of', async (kind, payload) => {
        const { env, signer } = await bootRemote();
        signer.signAnswer = JSON.stringify(await finalizeEvent(
            { kind: 1, content: 'x', tags: [], created_at: 1700000000 }, hexToBytes(signer.signAsHex),
        ));
        expect(await env.dispatch({ kind, payload })).toMatchObject({ success: false });
        expect(signer.published).toEqual([]);
    });
});

describe('reading back', () => {
    it('vault.fetch opens the newest copy of each document', async () => {
        const { env, relay } = await bootLocal();
        relay.events.push(
            await signedBack('nostrkey:notes/a.md', 'old', 1700000000),
            await signedBack('nostrkey:notes/a.md', 'new', 1700000100),
            await signedBack('nostrkey:notes/b.md', 'other', 1700000000),
        );
        const res = await env.dispatch({ kind: 'vault.fetch' });
        expect(res.success).toBe(true);
        expect(res.documents.map(d => [d.path, d.content]).sort()).toEqual([
            ['notes/a.md', 'new'], ['notes/b.md', 'other'],
        ]);
    });

    it('vault.fetch never offers the API key store as a document', async () => {
        const { env, relay } = await bootLocal();
        relay.events.push(
            await signedBack(API_D, JSON.stringify({ one: { secret: 's3' } })),
            await signedBack('nostrkey:notes/a.md', 'kept'),
        );
        const res = await env.dispatch({ kind: 'vault.fetch' });
        expect(res.documents.map(d => d.path)).toEqual(['notes/a.md']);
        expect(JSON.stringify(res)).not.toContain('s3');
    });

    it('apikeys.fetch opens the newest store', async () => {
        const { env, relay } = await bootLocal();
        const older = await signedBack(API_D, JSON.stringify({ a: 1 }), 1700000000);
        const newer = await signedBack(API_D, JSON.stringify({ a: 2 }), 1700000100);
        relay.events.push(older, newer);
        expect(await env.dispatch({ kind: 'apikeys.fetch' })).toEqual({
            success: true, keys: { a: 2 }, eventId: newer.id, createdAt: newer.created_at,
        });
    });

    const deletedBack = (tags, created_at) => finalizeEvent({
        kind: 5, content: '', tags, created_at,
    }, hexToBytes(HEX_A));

    it('vault.fetch leaves out a document the author deleted with kind 5 afterwards', async () => {
        const { env, relay } = await bootLocal();
        relay.events.push(
            await signedBack('nostrkey:notes/a.md', 'gone', 1700000000),
            await signedBack('nostrkey:notes/b.md', 'kept', 1700000000),
            await deletedBack([['a', `30078:${PUB_A}:nostrkey:notes/a.md`]], 1700000050),
        );
        const res = await env.dispatch({ kind: 'vault.fetch' });
        expect(res.documents.map(d => d.path)).toEqual(['notes/b.md']);
    });

    it('vault.fetch keeps a document written again after its kind 5', async () => {
        const { env, relay } = await bootLocal();
        relay.events.push(
            await deletedBack([['a', `30078::nostrkey:notes/a.md`]], 1700000050),
            await signedBack('nostrkey:notes/a.md', 'again', 1700000100),
        );
        const res = await env.dispatch({ kind: 'vault.fetch' });
        expect(res.documents.map(d => d.content)).toEqual(['again']);
    });

    it('apikeys.fetch reads nothing when the newest store was deleted by the author', async () => {
        const { env, relay } = await bootLocal();
        const store = await signedBack(API_D, JSON.stringify({ a: 1 }), 1700000000);
        relay.events.push(store, await deletedBack([['e', store.id]], 1700000010));
        expect((await env.dispatch({ kind: 'apikeys.fetch' })).keys).toBeNull();
    });

    it('a kind 5 from someone else is not a deletion', async () => {
        const { env, relay } = await bootLocal();
        const store = await signedBack(API_D, JSON.stringify({ a: 1 }), 1700000000);
        const other = finalizeEvent({ kind: 5, content: '', tags: [['e', store.id]], created_at: 1700000010 },
            hexToBytes('1'.repeat(64)));
        relay.events.push(store, other);
        expect((await env.dispatch({ kind: 'apikeys.fetch' })).keys).toEqual({ a: 1 });
    });

    it('apikeys.fetch reads nothing for a store that was never published', async () => {
        const { env } = await bootLocal();
        expect(await env.dispatch({ kind: 'apikeys.fetch' }))
            .toEqual({ success: true, keys: null, eventId: null, createdAt: null });
    });

    it('apikeys.fetch passes over a copy whose signature does not hold', async () => {
        const { env, relay } = await bootLocal();
        const good = await signedBack(API_D, JSON.stringify({ a: 1 }), 1700000000);
        const bad = await signedBack(API_D, JSON.stringify({ a: 2 }), 1700000100);
        relay.events.push(good, { ...bad, sig: 'f'.repeat(128) });
        expect((await env.dispatch({ kind: 'apikeys.fetch' })).keys).toEqual({ a: 1 });
    });
});

describe('apikeys.encrypt and apikeys.decrypt', () => {
    it('round trip under the profile key, for the export file', async () => {
        const { env } = await bootLocal();
        const { success, cipherText } = await env.dispatch({ kind: 'apikeys.encrypt', payload: { plainText: 'export' } });
        expect(success).toBe(true);
        expect(cipherText).not.toContain('export');
        expect(nip44.v2.decrypt(cipherText, selfKey())).toBe('export');
        expect(await env.dispatch({ kind: 'apikeys.decrypt', payload: { cipherText } }))
            .toEqual({ success: true, plainText: 'export' });
    });

    it('apikeys.decrypt fails plainly on text that is not its own', async () => {
        const { env } = await bootLocal();
        expect(await env.dispatch({ kind: 'apikeys.decrypt', payload: { cipherText: 'nonsense' } }))
            .toMatchObject({ success: false, error: expect.any(String) });
    });
});

describe('while locked', () => {
    async function lockedWithStored() {
        const relay = installRelay();
        const env = await bootWithPassword(PASSWORD);
        const { profiles } = env.local._dump();
        profiles[0].relays = RELAYS;
        profiles[0].pubKey = PUB_A;
        await env.local.set({ profiles });
        await settle();
        relay.events.push(await signedBack(API_D, JSON.stringify({ a: 1 })));
        relay.events.push(await signedBack('nostrkey:notes/a.md', 'hello'));
        return { env, relay };
    }

    it.each([
        ['vault.publish', { path: 'a', content: 'x' }],
        ['apikeys.publish', { keys: {} }],
        ['apikeys.fetch', undefined],
        ['apikeys.encrypt', { plainText: 'x' }],
        ['apikeys.decrypt', { cipherText: 'x' }],
        ['vault.delete', { path: 'a', eventId: 'e'.repeat(64) }],
        ['apikeys.delete', { eventId: 'e'.repeat(64) }],
    ])('%s does nothing', async (kind, payload) => {
        const { env, relay } = await lockedWithStored();
        expect(await env.dispatch({ kind, payload })).toMatchObject({ success: false });
        expect(relay.published).toEqual([]);
    });

    it('vault.fetch opens nothing', async () => {
        const { env } = await lockedWithStored();
        expect(await env.dispatch({ kind: 'vault.fetch' })).toEqual({ success: true, documents: [] });
    });
});

describe('a remote signer profile', () => {
    it('has no private key to hand back, even with one left on the profile', async () => {
        installRelay();
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        const env = await bootWorker({
            profiles: [localProfile(blobs[0], {}, { type: 'bunker', remotePubkey: SIGNER_PUB })],
            profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
        });
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeNull();
    });
});

describe('saveProfileName', () => {
    it('renames that profile, stamps it, and leaves the others', async () => {
        const { env } = await bootLocal();
        const stored = env.local._dump().profiles;
        stored.push({ ...stored[0], name: 'Second', updatedAt: 1 });
        stored[0].updatedAt = 1;
        await env.local.set({ profiles: stored });
        await settle();
        const { saveProfileName } = await import('../src/utilities/utils.js');
        const before = Math.floor(Date.now() / 1000);
        await saveProfileName(1, 'Renamed');
        const after = env.local._dump().profiles;
        expect(after.map(p => p.name)).toEqual(['P1', 'Renamed']);
        expect(after[1].updatedAt).toBeGreaterThanOrEqual(before);
        expect(after[0].updatedAt).toBe(1);
    });
});
