/**
 * profile.fetch through the real worker: a web page's content script is turned
 * away, the profile tab (profile.html, opened as a tab) gets through. Every
 * profile.* and blossom.* kind the worker handles is on the gate's list.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bootUnlocked, answerWithin, PAGE_SENDER, PUB_A } from './helpers/boot-worker.js';

const REJECTED = { success: false, error: 'Unauthorized sender' };
const PROFILE_TAB = {
    id: 'test-extension-id',
    tab: { id: 12, url: `chrome-extension://test/profile.html?pubkey=${PUB_A}` },
    url: `chrome-extension://test/profile.html?pubkey=${PUB_A}`,
};

beforeEach(() => {
    vi.stubGlobal('WebSocket', class { constructor() { throw new Error('no sockets'); } });
});
afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('profile.fetch', () => {
    it('refuses a web page and answers the profile tab', async () => {
        const env = await bootUnlocked();
        const msg = { kind: 'profile.fetch', payload: { pubkey: PUB_A } };
        expect(await answerWithin(env.dispatch(msg, PAGE_SENDER), 500)).toEqual(REJECTED);
        expect(await answerWithin(env.dispatch(msg, { ...PAGE_SENDER, url: 'https://evil.example/profile.html' }), 500)).toEqual(REJECTED);
        const ours = await answerWithin(env.dispatch(msg, PROFILE_TAB), 15000);
        expect(ours).not.toEqual(REJECTED);
        expect(['unreachable', 'partial', 'none']).toContain(ours.state);
    }, 20000);
});

describe('the gate list', () => {
    it('holds every profile.* and blossom.* kind the worker handles', () => {
        const src = readFileSync(resolve('src/background.js'), 'utf8');
        const kinds = [...new Set([...src.matchAll(/case '((?:profile|blossom)\.[\w.]+)':/g)].map(m => m[1]))];
        expect(kinds).toContain('profile.fetch');
        const list = src.slice(src.indexOf('const SENSITIVE_KINDS'), src.indexOf(']);', src.indexOf('const SENSITIVE_KINDS')));
        for (const k of kinds) expect(list).toContain(`'${k}'`);
    });
});

describe('only your own identities', () => {
    const FOREIGN = 'f'.repeat(64);
    it('profile.fetch refuses a pubkey that is not one of yours', async () => {
        const env = await bootUnlocked();
        const res = await answerWithin(env.dispatch({ kind: 'profile.fetch', payload: { pubkey: FOREIGN } }, PROFILE_TAB), 2000);
        expect(res).toEqual({ state: 'not-mine' });
    });

    it('profile.fetch finds a bunker identity by its remote pubkey', async () => {
        const REMOTE = 'e'.repeat(64);
        const env = await bootUnlocked();
        const { profiles } = await globalThis.chrome.storage.local.get('profiles');
        profiles.push({ name: 'Remote', type: 'bunker', remotePubkey: REMOTE, hosts: {}, relays: [] });
        await globalThis.chrome.storage.local.set({ profiles });
        const res = await answerWithin(env.dispatch({ kind: 'profile.fetch', payload: { pubkey: REMOTE } }, PROFILE_TAB), 15000);
        expect(res.state).not.toBe('not-mine');
        expect(res.localName).toBe('Remote');
    }, 20000);

    it('profile.checkAddresses is extension-only and refuses a foreign pubkey', async () => {
        const env = await bootUnlocked();
        const content = { nip05: 'a@b.example' };
        expect(await answerWithin(env.dispatch({ kind: 'profile.checkAddresses', payload: { pubkey: PUB_A, content } }, PAGE_SENDER), 500)).toEqual(REJECTED);
        const res = await answerWithin(env.dispatch({ kind: 'profile.checkAddresses', payload: { pubkey: FOREIGN, content } }, PROFILE_TAB), 2000);
        expect(res.state).toBe('not-mine');
    });

    it('profile.checkAddresses checks only the addresses, with no redirects and no credentials', async () => {
        const env = await bootUnlocked();
        const calls = [];
        vi.stubGlobal('fetch', async (url, init) => { calls.push({ url, init }); return { ok: true, headers: { get: () => null }, text: async () => JSON.stringify({ names: { a: PUB_A } }) }; });
        const res = await answerWithin(env.dispatch({ kind: 'profile.checkAddresses', payload: { pubkey: PUB_A, content: { nip05: 'a@b.example', picture: 'https://x.example/p.png', lud16: 'me@pay.local' } } }, PROFILE_TAB), 8000);
        expect(res.checks.nip05.status).toBe('verified');
        expect(res.checks.lud16.status).toBe('unverified');
        expect(res.checks.picture).toBeUndefined();
        expect(calls).toHaveLength(1);
        expect(calls[0].init).toMatchObject({ redirect: 'error', credentials: 'omit' });
    }, 10000);
});
