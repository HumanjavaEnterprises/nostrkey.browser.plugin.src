/**
 * The worker's own settings: the auto-lock window, Nostr access while locked,
 * and cross-origin frame blocking. Their defaults are the safe side, from the
 * first message the worker can answer.
 */

import { describe, it, expect, afterEach } from 'vitest';
import {
    bootUnlocked, bootWithPassword, bootWorker, deviceWrapped, localProfile, HEX_A,
} from './helpers/boot-worker.js';

const PASSWORD = 'correct horse battery staple';
const ALARM = 'nostrkey-auto-lock';

afterEach(() => { delete globalThis.chrome; });

/** A worker whose startup is still waiting on storage. */
async function bootStillStarting() {
    return bootWorker({}, {
        beforeBoot(env) {
            const get = env.local.get;
            env.local.get = (query) => (
                query && typeof query === 'object' && 'autoLockMinutes' in query
                    ? new Promise(() => {})
                    : get(query));
        },
    });
}

async function unlock(env) {
    expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD })).toMatchObject({ success: true });
}

describe('before startup has read storage', () => {
    it('frames stay blocked', async () => {
        const env = await bootStillStarting();
        expect(await env.dispatch({ kind: 'getBlockCrossOriginFrames' })).toBe(true);
    });

    it('access while locked stays off', async () => {
        const env = await bootStillStarting();
        expect(await env.dispatch({ kind: 'getNostrAccessWhileLocked' })).toBe(false);
    });
});

describe('cross-origin frame blocking', () => {
    it.each([
        ['nothing stored', {}, true],
        ['stored on', { blockCrossOriginFrames: true }, true],
        ['stored off', { blockCrossOriginFrames: false }, false],
    ])('at startup with %s', async (_, stored, expected) => {
        const env = await bootWorker(stored);
        expect(await env.dispatch({ kind: 'getBlockCrossOriginFrames' })).toBe(expected);
    });

    it('a change is stored and survives a restart', async () => {
        let env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'setBlockCrossOriginFrames', payload: false })).toBe(true);
        expect(await env.dispatch({ kind: 'getBlockCrossOriginFrames' })).toBe(false);
        env = await env.restart();
        expect(await env.dispatch({ kind: 'getBlockCrossOriginFrames' })).toBe(false);
    });
});

describe('opening all approvals in a tab', () => {
    const get = (env) => env.dispatch({ kind: 'getApprovalsInTab' });

    it.each([
        ['nothing stored', {}, false],
        ['stored on', { approvalsInTab: true }, true],
        ['stored with anything else', { approvalsInTab: 'yes' }, false],
    ])('at startup with %s', async (_, stored, expected) => {
        const env = await bootWorker(stored);
        expect(await get(env)).toBe(expected);
    });

    it('a change is stored and survives a restart', async () => {
        let env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'setApprovalsInTab', payload: true })).toBe(true);
        expect(await get(env)).toBe(true);
        env = await env.restart();
        expect(await get(env)).toBe(true);
    });
});

describe('Nostr access while locked', () => {
    it.each([
        ['nothing stored', {}, false],
        ['stored on', { nostrAccessWhileLocked: true }, true],
    ])('at startup with %s', async (_, stored, expected) => {
        const env = await bootWorker(stored);
        expect(await env.dispatch({ kind: 'getNostrAccessWhileLocked' })).toBe(expected);
    });

    it('while on, locking keeps the keys; turning it off while locked drops them', async () => {
        const env = await bootWithPassword(PASSWORD, { nostrAccessWhileLocked: true });
        await unlock(env);
        await env.dispatch({ kind: 'lock' });
        expect((await env.dispatch({ kind: 'getActiveProfileInfo' })).hasKeys).toBe(true);

        expect(await env.dispatch({ kind: 'setNostrAccessWhileLocked', payload: false })).toBe(true);
        expect((await env.dispatch({ kind: 'getActiveProfileInfo' })).hasKeys).toBe(false);
        await env.flushWrites();
        expect(env.local._dump().nostrAccessWhileLocked).toBe(false);
    });

    it('turning it off while unlocked leaves the keys alone', async () => {
        const env = await bootWithPassword(PASSWORD, { nostrAccessWhileLocked: true });
        await unlock(env);
        await env.dispatch({ kind: 'setNostrAccessWhileLocked', payload: false });
        expect((await env.dispatch({ kind: 'getActiveProfileInfo' })).hasKeys).toBe(true);
    });
});

describe('the auto-lock window', () => {
    it('is 15 minutes when nothing is stored', async () => {
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        const passwordless = await bootWorker({ profiles: [localProfile(blobs[0])], deviceKeySeed, deviceKeyStrategy });
        expect(await passwordless.dispatch({ kind: 'getAutoLockTimeout' })).toBe(15);

        const env = await bootWithPassword(PASSWORD, {}, {
            beforeBoot(e) {
                const { autoLockMinutes, ...rest } = e.local._dump();
                e.local._seed(rest);
            },
        });
        await unlock(env);
        expect(env.alarms.get(ALARM)).toEqual({ delayInMinutes: 15 });
    });

    it('a stored window is what the alarm runs for', async () => {
        const env = await bootWithPassword(PASSWORD, { autoLockMinutes: 5 });
        await unlock(env);
        expect(env.alarms.get(ALARM)).toEqual({ delayInMinutes: 5 });
    });

    it('a new window is stored and restarts the alarm; 0 means never', async () => {
        const env = await bootWithPassword(PASSWORD);
        await unlock(env);
        expect(await env.dispatch({ kind: 'setAutoLockTimeout', payload: 60 })).toBe(true);
        expect(env.alarms.get(ALARM)).toEqual({ delayInMinutes: 60 });
        await env.flushWrites();
        expect(await env.dispatch({ kind: 'getAutoLockTimeout' })).toBe(60);

        expect(await env.dispatch({ kind: 'setAutoLockTimeout', payload: 0 })).toBe(true);
        expect(env.alarms.has(ALARM)).toBe(false);
    });
});

describe('what holds off auto-lock', () => {
    const SITE = 'https://example.com';
    const PAGE = { id: 'test-extension-id', tab: { id: 7, url: `${SITE}/` }, url: `${SITE}/` };
    const event = { kind: 1, content: 'x', tags: [], created_at: Math.floor(Date.now() / 1000) };

    async function armedThenCleared(hosts = {}) {
        const env = await bootUnlocked(hosts);
        await env.dispatch({ kind: 'setAutoLockTimeout', payload: 60 });
        expect(env.alarms.has(ALARM)).toBe(true);
        env.alarms.delete(ALARM);
        return env;
    }

    it.each([
        ['approving', 'allowed'],
        ['declining', 'denied'],
        ['using a NostrKey page', 'resetAutoLock'],
    ])('%s restarts the window', async (_, kind) => {
        const env = await armedThenCleared();
        await env.dispatch({ kind, payload: 'no-open-prompt' });
        expect(env.alarms.has(ALARM)).toBe(true);
    });

    it('a site signing from a remembered grant restarts it too', async () => {
        const env = await armedThenCleared({ [SITE]: { 'signEvent:1': 'allow' } });
        const answer = await env.dispatch({ kind: 'signEvent', host: SITE, payload: event }, PAGE);
        expect(answer?.sig).toMatch(/^[0-9a-f]{128}$/);
        expect(env.alarms.has(ALARM)).toBe(true);
    });

    it('a request that would prompt does not, until it is answered', async () => {
        const env = await armedThenCleared();
        env.dispatch({ kind: 'signEvent', host: SITE, payload: event }, PAGE);
        await new Promise(r => setTimeout(r, 50));
        expect(env.alarms.has(ALARM)).toBe(false);
    });
});
