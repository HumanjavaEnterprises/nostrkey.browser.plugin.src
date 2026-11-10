/**
 * The device copy of an identity's lists: verified events only, newest wins,
 * keyed by (pubkey, kind).
 */
import { describe, it, expect } from 'vitest';
import { finalizeEvent, getPublicKeySync, hexToBytes } from 'nostr-crypto-utils';
import { createListStore, memoryBackend, HISTORY_CAP, BASELINE_WINDOW_MS } from '../src/utilities/list-store.js';

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

    describe('history', () => {
        it('keeps distinct versions newest first, deduped by id', async () => {
            const store = createListStore(memoryBackend());
            const a = await sign(SK, 3, 100), b = await sign(SK, 3, 200);
            await store.put(b); await store.put(a); await store.put(b);
            expect((await store.history(PK, 3)).map(v => v.event.id)).toEqual([b.id, a.id]);
            expect(await store.version(PK, 3, a.id)).toMatchObject({ event: a });
            expect(await store.version(PK, 10000, a.id)).toBeNull();
        });

        it('caps the history per key, dropping the oldest', async () => {
            const store = createListStore(memoryBackend());
            for (let i = 1; i <= HISTORY_CAP + 3; i++) await store.put(await sign(SK, 10002, i, [['r', `wss://r${i}.example`]]));
            const h = await store.history(PK, 10002);
            expect(h).toHaveLength(HISTORY_CAP);
            expect(h[0].event.created_at).toBe(HISTORY_CAP + 3);
            expect(h.at(-1).event.created_at).toBe(4);
        });

        it('another identity\'s events never land in this history', async () => {
            const store = createListStore(memoryBackend());
            await store.put(await sign(SK2, 3, 100));
            expect(await store.history(PK, 3)).toEqual([]);
        });

        it('survives a restart over the same backend', async () => {
            const backend = memoryBackend();
            const e = await sign(SK, 0, 100);
            await createListStore(backend).put(e);
            const again = createListStore(backend);
            expect((await again.history(PK, 0))[0].event.id).toBe(e.id);
            expect((await again.get(PK, 0)).id).toBe(e.id);
        });

        it('concurrent puts lose nothing', async () => {
            const store = createListStore(memoryBackend());
            const events = await Promise.all([1, 2, 3, 4].map(i => sign(SK, 3, i)));
            await Promise.all(events.map(e => store.put(e)));
            expect(await store.history(PK, 3)).toHaveLength(4);
        });

        it('baseline: the oldest version still current within the last day', async () => {
            let t = 0;
            const store = createListStore(memoryBackend(), { now: () => t });
            const DAY = BASELINE_WINDOW_MS;
            const old = await sign(SK, 3, 100), mid = await sign(SK, 3, 200), cur = await sign(SK, 3, 300);
            t = 0; await store.put(old);
            t = DAY / 2; await store.put(mid); // old was current until now
            t = DAY * 2; await store.put(cur); // mid was current until now
            expect((await store.baseline(PK, 3)).event.id).toBe(mid.id);
            t = DAY * 2 + DAY / 4;
            expect((await store.baseline(PK, 3)).event.id).toBe(mid.id);
            t = DAY * 4;
            expect(await store.baseline(PK, 3)).toBeNull();
        });

        it('a ticked approval resets the baseline to versions seen after it', async () => {
            let t = 1000;
            const store = createListStore(memoryBackend(), { now: () => t });
            const big = await sign(SK, 3, 100), small = await sign(SK, 3, 200);
            await store.put(big);
            t = 2000; await store.acknowledge(PK, 3);
            t = 3000; await store.put(small);
            expect((await store.baseline(PK, 3)).event.id).toBe(small.id);
        });
    });
});
