/**
 * Contract tests for the test harness itself (test/helpers/fake-chrome.js).
 *
 * Every storage suite in this repo is only as sharp as this fake. Three of its
 * properties are what turn a whole class of src regression from invisible into
 * a failing assertion:
 *
 *   1. get() and set() deep-copy across the boundary. A real chrome.storage
 *      call is an IPC hop — nothing is shared by reference. Without the copy,
 *      "src mutated the object it read and never wrote it back" is silently
 *      visible on the next get(), i.e. a repair that is computed and thrown
 *      away still looks like it worked.
 *   2. set() resolves on a MACROTASK. Without that, a dropped `await
 *      storage.set(...)` in src is indistinguishable from a correct one.
 *   3. A per-item quota ceiling, so an oversized write rejects here the way
 *      chrome.storage.local rejects it in the field.
 *
 * If any of these regress, the suites keep passing while the bugs walk. So
 * they are asserted directly.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { installFakeChrome, flushStorageWrites } from './helpers/fake-chrome.js';

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('the fake storage boundary copies, never aliases', () => {
    it('get() hands back a detached snapshot — an in-place mutation is NOT a write', async () => {
        const { local } = installFakeChrome();
        await local.set({ profiles: [{ name: 'A', hosts: { 'x.com': 1 } }] });

        // The shape of the bug this kills: src reads, repairs in place, and
        // never calls set(). That must not be observable on the next read.
        const got = await local.get({ profiles: [] });
        got.profiles[0].name = 'MUTATED';
        got.profiles.push({ name: 'GHOST' });
        got.profiles[0].hosts['evil.com'] = 1;

        const again = await local.get({ profiles: [] });
        expect(again.profiles).toHaveLength(1);
        expect(again.profiles[0].name).toBe('A');
        expect(again.profiles[0].hosts).toEqual({ 'x.com': 1 });
    });

    it('get(null) and get([keys]) copy too, not just the defaults form', async () => {
        const { local } = installFakeChrome();
        await local.set({ a: { n: 1 }, b: { n: 2 } });

        (await local.get(null)).a.n = 99;
        (await local.get(['b'])).b.n = 99;
        (await local.get('a')).a.n = 77;

        expect((await local.get(null))).toEqual({ a: { n: 1 }, b: { n: 2 } });
    });

    it('set() copies the incoming object — the caller keeps no handle into the store', async () => {
        const { local } = installFakeChrome();
        const live = { name: 'A', hosts: {} };
        await local.set({ profiles: [live] });

        // Mutating the object the caller still holds must not reach the store.
        live.name = 'MUTATED';
        live.hosts['evil.com'] = 1;

        const { profiles } = await local.get({ profiles: [] });
        expect(profiles[0].name).toBe('A');
        expect(profiles[0].hosts).toEqual({});
    });

    it('_dump() is a snapshot, not a window into the store', async () => {
        const { local } = installFakeChrome();
        await local.set({ a: { n: 1 } });

        const dumped = local._dump();
        dumped.a.n = 99;
        dumped.injected = true;

        expect(local._dump()).toEqual({ a: { n: 1 } });
    });

    it('_seed() copies its input', async () => {
        const { local } = installFakeChrome();
        const seed = { a: { n: 1 } };
        local._seed(seed);
        seed.a.n = 99;
        expect((await local.get('a')).a.n).toBe(1);
    });
});

describe('the fake storage boundary is asynchronous, like the real one', () => {
    it('a dropped `await storage.set()` is observable as a missing write', async () => {
        const { local, flushWrites } = installFakeChrome();

        local.set({ a: 1 }); // no await — the regression shape
        expect(await local.get('a')).toEqual({});

        await flushWrites();
        expect(await local.get('a')).toEqual({ a: 1 });
    });

    it('an awaited set() is readable immediately after', async () => {
        const { local } = installFakeChrome();
        await local.set({ a: 1 });
        expect(await local.get('a')).toEqual({ a: 1 });
    });

    it('writes land in call order', async () => {
        const { local } = installFakeChrome();
        local.set({ a: 'first' });
        local.set({ a: 'second' });
        await flushStorageWrites();
        expect((await local.get('a')).a).toBe('second');
    });
});

describe('the fake storage boundary enforces a per-item quota', () => {
    it('defaults to chrome.storage.local\'s 8 MB per-item ceiling', () => {
        const { local, sync } = installFakeChrome();
        expect(local.QUOTA_BYTES_PER_ITEM).toBe(8192 * 1024);
        expect(sync.QUOTA_BYTES_PER_ITEM).toBe(8192 * 1024);
    });

    it('rejects an oversized item and leaves the store untouched', async () => {
        const { local } = installFakeChrome();
        await local.set({ keep: 'safe' });
        local.QUOTA_BYTES_PER_ITEM = 64; // lowered so the path is cheap to prove

        await expect(local.set({ big: 'x'.repeat(500) }))
            .rejects.toThrow(/QUOTA_BYTES_PER_ITEM/);

        await flushStorageWrites();
        expect(await local.get('big')).toEqual({});
        expect((await local.get('keep')).keep).toBe('safe');
    });

    it('rejects the whole set() when ANY key in it is oversized', async () => {
        const { local } = installFakeChrome();
        local.QUOTA_BYTES_PER_ITEM = 64;

        await expect(local.set({ small: 'ok', big: 'x'.repeat(500) }))
            .rejects.toThrow(/QUOTA_BYTES_PER_ITEM/);

        expect(await local.get(null)).toEqual({});
    });

    it('accepts an item right at the ceiling', async () => {
        const { local } = installFakeChrome();
        // cost = key length (1) + JSON.stringify('xxxxxxxxxx').length (12) = 13
        local.QUOTA_BYTES_PER_ITEM = 13;
        await local.set({ k: 'x'.repeat(10) });
        expect((await local.get('k')).k).toBe('x'.repeat(10));
    });

    it('can be lowered at install time', async () => {
        const { local } = installFakeChrome({ quotaBytesPerItem: 32 });
        expect(local.QUOTA_BYTES_PER_ITEM).toBe(32);
        await expect(local.set({ big: 'x'.repeat(100) })).rejects.toThrow(/quota/i);
    });

    it('getBytesInUse reports real usage, not a hardcoded zero', async () => {
        const { local } = installFakeChrome();
        expect(await local.getBytesInUse()).toBe(0);
        await local.set({ a: 'hello' });
        expect(await local.getBytesInUse()).toBe('a'.length + '"hello"'.length);
        expect(await local.getBytesInUse('missing')).toBe(0);
    });
});
