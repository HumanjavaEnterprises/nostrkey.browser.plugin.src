/**
 * The device copy of an identity's lists: verified events only, newest wins,
 * keyed by (pubkey, kind).
 */
import { describe, it, expect } from 'vitest';
import { finalizeEvent, getPublicKeySync, hexToBytes } from 'nostr-crypto-utils';
import { createListStore, memoryBackend } from '../src/utilities/list-store.js';

const SK = '1'.repeat(64), SK2 = '2'.repeat(64);
const PK = getPublicKeySync(hexToBytes(SK));
const sign = (sk, kind, created_at, tags = []) => finalizeEvent({ kind, tags, content: '', created_at }, hexToBytes(sk));

describe('list store', () => {
    it('keeps a verified event and returns it by (pubkey, kind)', async () => {
        const store = createListStore(memoryBackend());
        const e = await sign(SK, 3, 100, [['p', PK]]);
        expect(await store.put(e)).toBe(true);
        expect(await store.get(PK, 3)).toEqual(e);
        expect(await store.get(PK.toUpperCase(), 3)).toEqual(e);
        expect(await store.get(PK, 10000)).toBeNull();
    });

    it('newer replaces older; older never replaces newer', async () => {
        const store = createListStore(memoryBackend());
        const old = await sign(SK, 3, 100);
        const recent = await sign(SK, 3, 200);
        await store.put(recent);
        expect(await store.put(old)).toBe(false);
        expect((await store.get(PK, 3)).id).toBe(recent.id);
    });

    it('a forged or tampered event is not kept', async () => {
        const store = createListStore(memoryBackend());
        const e = await sign(SK, 3, 100);
        expect(await store.put({ ...e, tags: [['p', PK]] })).toBe(false);
        expect(await store.put({ ...e, sig: '0'.repeat(128) })).toBe(false);
        expect(await store.get(PK, 3)).toBeNull();
    });

    it('only list kinds are kept', async () => {
        const store = createListStore(memoryBackend());
        expect(await store.put(await sign(SK, 1, 100))).toBe(false);
    });

    it('identities are kept apart', async () => {
        const store = createListStore(memoryBackend());
        const theirs = await sign(SK2, 3, 300);
        await store.put(theirs);
        expect(await store.get(PK, 3)).toBeNull();
        expect((await store.get(getPublicKeySync(hexToBytes(SK2)), 3)).id).toBe(theirs.id);
    });

    it('a failing backend reads as empty and never throws', async () => {
        const broken = { get: async () => { throw new Error('x'); }, put: async () => { throw new Error('x'); } };
        const store = createListStore(broken);
        expect(await store.get(PK, 3)).toBeNull();
        expect(await store.put(await sign(SK, 3, 1))).toBe(false);
    });
});
