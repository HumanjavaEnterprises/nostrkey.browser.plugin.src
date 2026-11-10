/**
 * The device copy of an identity's lists: verified events only, newest wins,
 * keyed by (pubkey, kind).
 */
import { describe, it, expect } from 'vitest';
import { finalizeEvent, getPublicKeySync, hexToBytes } from 'nostr-crypto-utils';
import { createListStore, memoryBackend, HISTORY_CAP, BASELINE_WINDOW_MS, FUTURE_LIMIT_S } from '../src/utilities/list-store.js';

const SK = '1'.repeat(64), SK2 = '2'.repeat(64);
const PK = getPublicKeySync(hexToBytes(SK));
const hexN = (n) => n.toString(16).padStart(64, '0');
const follows = (n) => Array.from({ length: n }, (_, i) => ['p', hexN(i + 1)]);
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
            const events = await Promise.all([1, 2, 3, 4].map(i => sign(SK, 3, i, [['p', hexN(i)]])));
            await Promise.all(events.map(e => store.put(e)));
            expect(await store.history(PK, 3)).toHaveLength(4);
        });

        it('the same list signed again with a new date is not a new version', async () => {
            let t = 1000;
            const store = createListStore(memoryBackend(), { now: () => t });
            const a = await sign(SK, 3, 100, [['p', hexN(1)]]);
            await store.put(a, { seen: true });
            t = 5000;
            await store.put(await sign(SK, 3, 200, [['p', hexN(1)]]));
            const h = await store.history(PK, 3);
            expect(h.map(v => v.event.id)).toEqual([a.id]);
            expect(h[0].lastSeenAt).toBe(5000);
        });

        it('flush repro: 10 signed copies cannot push out the real versions or the baseline', async () => {
            let t = Date.UTC(2026, 10, 10, 12);
            const store = createListStore(memoryBackend(), { now: () => t });
            const real = await sign(SK, 3, 100, follows(100));
            await store.put(real, { seen: true });
            for (let i = 1; i <= 10; i++) { t += 1000; await store.put(await sign(SK, 3, 100, follows(100))); } // same body
            for (let i = 1; i <= 12; i++) { t += 1000; await store.put(await sign(SK, 3, 100 + i, follows(100 - i))); } // small steps
            const ids = (await store.history(PK, 3)).map(v => v.event.id);
            expect(ids).toContain(real.id);
            expect((await store.baseline(PK, 3)).event.id).toBe(real.id);
        });

        it('the cap keeps the newest version from before the window and one per day for a week', async () => {
            const DAY = BASELINE_WINDOW_MS;
            let t = Date.UTC(2026, 10, 1, 12);
            const store = createListStore(memoryBackend(), { now: () => t });
            const daily = [];
            for (let d = 0; d < 5; d++) {
                const e = await sign(SK, 3, 100 + d, [['p', hexN(d + 1)]]);
                daily.push(e);
                await store.put(e, { seen: true });
                t += DAY;
            }
            for (let i = 0; i < 15; i++) { t += 1000; await store.put(await sign(SK, 3, 200 + i, [['p', hexN(50 + i)]])); }
            const ids = (await store.history(PK, 3)).map(v => v.event.id);
            for (const e of daily) expect(ids).toContain(e.id);
        });

        it('an event dated more than 10 minutes ahead is refused', async () => {
            const t = 1_700_000_000_000;
            const store = createListStore(memoryBackend(), { now: () => t });
            expect(await store.put(await sign(SK, 3, t / 1000 + FUTURE_LIMIT_S + 5))).toBe(false);
            expect(await store.history(PK, 3)).toEqual([]);
            expect(await store.put(await sign(SK, 3, t / 1000 + 60))).toBe(true);
        });

        it('a version only signed here is kept but never the baseline', async () => {
            const store = createListStore(memoryBackend());
            const signedOnly = await sign(SK, 3, 100, [['p', hexN(1)]]);
            await store.put(signedOnly);
            expect((await store.history(PK, 3))[0]).toMatchObject({ seen: false });
            expect(await store.baseline(PK, 3)).toBeNull();
            await store.put(signedOnly, { seen: true });
            expect((await store.baseline(PK, 3)).event.id).toBe(signedOnly.id);
        });

        it('baseline: the oldest seen version still current within the last day', async () => {
            let t = 0;
            const store = createListStore(memoryBackend(), { now: () => t });
            const DAY = BASELINE_WINDOW_MS;
            const old = await sign(SK, 3, 100, [['p', hexN(1)]]), mid = await sign(SK, 3, 200, [['p', hexN(2)]]), cur = await sign(SK, 3, 300, [['p', hexN(3)]]);
            t = 0; await store.put(old, { seen: true });
            t = DAY / 2; await store.put(mid, { seen: true }); // old was current until now
            t = DAY * 2; await store.put(cur, { seen: true }); // mid was current until now
            expect((await store.baseline(PK, 3)).event.id).toBe(mid.id);
            t = DAY * 2 + DAY / 4;
            expect((await store.baseline(PK, 3)).event.id).toBe(mid.id);
            t = DAY * 4;
            expect(await store.baseline(PK, 3)).toBeNull();
        });

        it('an approval becomes the baseline only when its signed event is stored', async () => {
            let t = 1000;
            const store = createListStore(memoryBackend(), { now: () => t });
            const big = await sign(SK, 3, 100, follows(20)), small = await sign(SK, 3, 200, follows(2));
            await store.put(big, { seen: true });
            store.approve(PK, 3, { tags: small.tags, content: '' });
            // Signing failed: nothing stored, the baseline stays.
            expect((await store.baseline(PK, 3)).event.id).toBe(big.id);
            t = 3000; await store.put(small);
            expect((await store.baseline(PK, 3)).event.id).toBe(small.id);
        });

        it('acknowledge by id makes that version the baseline', async () => {
            const store = createListStore(memoryBackend());
            const big = await sign(SK, 3, 100, follows(20)), small = await sign(SK, 3, 200, follows(2));
            await store.put(big, { seen: true });
            await store.put(small, { seen: true });
            expect((await store.baseline(PK, 3)).event.id).toBe(big.id);
            await store.acknowledge(PK, 3, small.id);
            expect((await store.baseline(PK, 3)).event.id).toBe(small.id);
        });

        it('forget clears every kind for that identity only', async () => {
            const store = createListStore(memoryBackend());
            await store.put(await sign(SK, 3, 100), { seen: true });
            await store.put(await sign(SK, 0, 100), { seen: true });
            const theirs = await sign(SK2, 3, 100);
            await store.put(theirs);
            await store.forget(PK);
            expect(await store.history(PK, 3)).toEqual([]);
            expect(await store.history(PK, 0)).toEqual([]);
            expect(await store.get(PK, 3)).toBeNull();
            expect((await store.get(getPublicKeySync(hexToBytes(SK2)), 3)).id).toBe(theirs.id);
        });
    });
});

describe('wipe', () => {
    it('removes every saved list and version', async () => {
        const { createListStore, memoryBackend } = await import('../src/utilities/list-store.js');
        const backend = memoryBackend();
        await backend.put('k', { a: 1 });
        await backend.putHistory('k', [{ a: 1 }]);
        const store = createListStore(backend, { verify: () => true });
        await store.wipe();
        expect(await backend.get('k')).toBeUndefined();
        expect(await backend.getHistory('k')).toBeUndefined();
    });
});
