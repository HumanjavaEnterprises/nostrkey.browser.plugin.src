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
