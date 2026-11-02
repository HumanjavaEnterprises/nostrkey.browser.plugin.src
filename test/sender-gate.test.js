/**
 * Which messages the background worker answers, and from whom.
 *
 * The kinds come from the worker's own message switch, so a new `case` lands
 * here on its own: it is held to the gate unless it is named in OPEN_KINDS.
 * That list is written out by hand because the gate's list cannot check itself.
 * Every kind runs through the real worker, through the door the app uses.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bootUnlocked, answerWithin, HEX_A, PUB_A } from './helpers/boot-worker.js';

const REJECTED = { success: false, error: 'Unauthorized sender' };

// Kinds that throw on a payload that is no key.
const PAYLOADS = { calcPubKey: HEX_A, npubEncode: PUB_A };

const OPEN_KINDS = new Set([
    // What a website reaches through window.nostr.
    'getPubKey', 'signEvent', 'getRelays', 'addRelay',
    'nip04.encrypt', 'nip04.decrypt', 'nip44.encrypt', 'nip44.decrypt', 'replaceURL',
    // What the content script sends for itself.
    'resetAutoLock', 'permissionSheetCompromised', 'holdMinimizedPrompt',
]);

// Has no handler left, and stays on the gate's list so that no page can reach
// one that comes back.
const GATED_WITHOUT_A_HANDLER = ['exportProfile'];

const source = readFileSync(resolve('src/background.js'), 'utf8');
const handled = source.slice(source.indexOf('api.runtime.onMessage.addListener('));
const allKinds = [...new Set([...handled.matchAll(/case '([\w.]+)':/g)].map(m => m[1]))];
const gatedKinds = [...allKinds.filter(k => !OPEN_KINDS.has(k)), ...GATED_WITHOUT_A_HANDLER];

const ID = 'test-extension-id';
const CHROME = 'chrome-extension://test/';
const FIREFOX = 'moz-extension://11111111-2222-3333-4444-555555555555/';
const PAGE = 'https://example.com/page';

const framed = (origin) => ({ id: ID, tab: { id: 7, url: PAGE }, url: `${origin}permission/permission.html?uuid=u`, frameId: 3 });

/** Senders that must get in, on an extension whose own origin is `origin`. */
const trusted = (origin) => [
    ['a page with no tab', { id: ID, url: `${origin}sidepanel.html` }],
    ['a page opened in a tab', { id: ID, tab: { id: 8, url: `${origin}vault/vault.html` }, url: `${origin}vault/vault.html` }],
    ['the consent sheet framed in a website', framed(origin)],
];

/** Senders that must be turned away, on an extension whose own origin is `origin`. */
const outsiders = (origin) => [
    ['a content script in a website', { id: ID, tab: { id: 7, url: PAGE }, url: PAGE }],
    ['a website in a tab reported as ours', { id: ID, tab: { id: 7, url: `${origin}permission/permission.html` }, url: PAGE, frameId: 1 }],
    ['a tab with no frame url', { id: ID, tab: { id: 7, url: `${origin}vault/vault.html` } }],
    ['another extension', { id: 'other-extension' }],
    ['another extension on our url', { id: 'other-extension', tab: { id: 7, url: `${origin}x.html` }, url: `${origin}x.html` }],
    ['another Chrome extension origin', { id: ID, tab: { id: 7, url: PAGE }, url: 'chrome-extension://other/page.html' }],
    ['another Firefox extension origin', { id: ID, tab: { id: 7, url: PAGE }, url: 'moz-extension://99999999-0000-0000-0000-000000000000/page.html' }],
    ['another Safari extension origin', { id: ID, tab: { id: 7, url: PAGE }, url: 'safari-web-extension://99999999-0000-0000-0000-000000000000/page.html' }],
    ['an origin that only starts like ours', { id: ID, tab: { id: 7, url: PAGE }, url: `${origin.slice(0, -1)}.example.com/page.html` }],
];

beforeEach(() => {
    vi.stubGlobal('WebSocket', class { constructor() { throw new Error('no sockets'); } });
});

afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('the message list', () => {
    it('finds the worker switch', () => {
        expect(allKinds.length).toBeGreaterThan(60);
        expect(gatedKinds).toContain('resetAllData');
    });

    it('names only kinds the worker still handles', () => {
        expect([...OPEN_KINDS].filter(k => !allKinds.includes(k))).toEqual([]);
    });
});

describe.each(gatedKinds)('%s', (kind) => {
    it.each(['chrome', 'firefox'])('answers only our own surfaces on %s', async (engine) => {
        const origin = engine === 'chrome' ? CHROME : FIREFOX;
        const env = await bootUnlocked({}, engine === 'chrome' ? {} : { origin, namespace: 'browser' });
        const before = env.local._dump();

        for (const [who, sender] of outsiders(origin)) {
            const answer = await answerWithin(env.dispatch({ kind, payload: PAYLOADS[kind] ?? 'x' }, sender), 300);
            expect(answer, who).toEqual(REJECTED);
        }
        await env.flushWrites();
        expect(env.local._dump()).toEqual(before);

        for (const [who, sender] of trusted(origin)) {
            const answer = await answerWithin(env.dispatch({ kind, payload: PAYLOADS[kind] ?? 'x' }, sender), 50);
            expect(answer, who).not.toEqual(REJECTED);
        }
    });
});

describe('the kinds a website is not given', () => {
    // A kind gated by accident of the list above would still pass the sweep if
    // the list lost it, so the ones that matter most are named.
    it.each([
        'getNsec', 'apikeys.decrypt', 'apikeys.fetch', 'vault.fetch',
        'vault.publish', 'apikeys.publish', 'vault.delete', 'apikeys.delete',
        'bunker.connect', 'bunker.disconnect',
    ])('%s is held to the gate', (kind) => {
        expect(gatedKinds).toContain(kind);
        expect(OPEN_KINDS.has(kind)).toBe(false);
    });
});

describe('what a website legitimately sends', () => {
    it.each(['resetAutoLock', 'permissionSheetCompromised', 'holdMinimizedPrompt'])('%s passes the gate', async (kind) => {
        const env = await bootUnlocked();
        const [, sender] = outsiders(CHROME)[0];
        expect(await answerWithin(env.dispatch({ kind }, sender), 300)).not.toEqual(REJECTED);
    });
});
