/**
 * Which site a window.nostr request belongs to. The browser's own record of the
 * sender decides it, on every engine, and the text of the message has no say.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { senderOrigin } from '../src/utilities/consent-policy.js';
import { bootUnlocked, answerWithin, HEX_A, PUB_A } from './helpers/boot-worker.js';
import { getPublicKeySync } from 'nostr-crypto-utils';

const ID = 'test-extension-id';
const SITE = 'https://site.example';
const OTHER = 'https://other.example';
const SIGN = { kind: 1, content: 'hello', tags: [], created_at: 1 };

const chromeSender = (origin, path = '/app') => ({
    id: ID, origin, url: `${origin}${path}`, frameId: 0, tab: { id: 7, url: `${origin}${path}` },
});
// Firefox and Safari leave `origin` off.
const plainSender = (origin, path = '/app') => ({
    id: ID, url: `${origin}${path}`, frameId: 0, tab: { id: 7, url: `${origin}${path}` },
});

describe('senderOrigin', () => {
    it.each([
        ['the origin the browser states', chromeSender(SITE), SITE],
        ['the frame url when no origin is stated', plainSender(SITE), SITE],
        ['a port', plainSender('http://localhost:3000'), 'http://localhost:3000'],
        ['the full address of a stated origin', { origin: `${SITE}/`, url: `${OTHER}/x`, frameId: 0 }, SITE],
        ['a frame on its own origin, not the tab', { url: `${OTHER}/frame`, frameId: 3, tab: { id: 7, url: `${SITE}/` } }, OTHER],
        ['the frame url when the stated origin is opaque', { origin: 'null', url: `${SITE}/x`, frameId: 0 }, SITE],
        ['a blank frame with a stated origin', { origin: SITE, url: 'about:blank', frameId: 3, tab: { id: 7, url: `${OTHER}/` } }, SITE],
        ['the tab of a top frame with no url', { frameId: 0, tab: { id: 7, url: `${SITE}/app` } }, SITE],
        ['the tab of a blank top frame', { url: 'about:blank', frameId: 0, tab: { id: 7, url: `${SITE}/app` } }, SITE],
        ['the tab when no frame is reported', { tab: { id: 7, url: `${SITE}/app` } }, SITE],
        ['a local file as one origin', plainSender('file://', '/home/a.html'), 'file://'],
    ])('reads %s', (_, sender, want) => {
        expect(senderOrigin(sender)).toBe(want);
    });

    it.each([
        ['nothing', {}],
        ['no sender', undefined],
        ['a blank frame inside a tab', { url: 'about:blank', frameId: 3, tab: { id: 7, url: `${SITE}/` } }],
        ['a srcdoc frame inside a tab', { url: 'about:srcdoc', frameId: 3, tab: { id: 7, url: `${SITE}/` } }],
        ['a data frame inside a tab', { url: 'data:text/html,hi', frameId: 3, tab: { id: 7, url: `${SITE}/` } }],
        ['an opaque origin inside a tab', { origin: 'null', url: 'about:blank', frameId: 3, tab: { id: 7, url: `${SITE}/` } }],
        ['text that is no address', { origin: 'not a url', url: 'also not' }],
        ['a value that is no text', { origin: 7, url: {} }],
    ])('has no origin for %s', (_, sender) => {
        expect(senderOrigin(sender)).toBeNull();
    });
});

describe('a request through the real worker', () => {
    beforeEach(() => {
        vi.stubGlobal('WebSocket', class { constructor() { throw new Error('no sockets'); } });
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        delete globalThis.chrome;
        delete globalThis.browser;
    });

    it.each([
        ['with a stated origin', chromeSender],
        ['without a stated origin', plainSender],
    ])('is shown as the site that sent it, %s', async (_, sender) => {
        const env = await bootUnlocked();
        env.dispatch({ kind: 'signEvent', payload: SIGN, host: OTHER }, sender(SITE));
        await vi.waitFor(() => expect(env.tabs.shown).toHaveLength(1));
        expect(env.tabs.shown[0].host).toBe(SITE);
    });

    it.each([
        ['with a stated origin', chromeSender],
        ['without a stated origin', plainSender],
    ])('gets nothing from the grants of a site it names, %s', async (_, sender) => {
        const env = await bootUnlocked({ [OTHER]: { 'signEvent:1': 'allow' } });
        env.dispatch({ kind: 'signEvent', payload: SIGN, host: OTHER }, sender(SITE));
        await vi.waitFor(() => expect(env.tabs.shown).toHaveLength(1));
    });

    it('is not refused by a refusal stored for a site it names', async () => {
        const env = await bootUnlocked({ [OTHER]: { 'signEvent:1': 'deny' } });
        env.dispatch({ kind: 'signEvent', payload: SIGN, host: OTHER }, chromeSender(SITE));
        await vi.waitFor(() => expect(env.tabs.shown).toHaveLength(1));
    });

    it.each([
        ['with a stated origin', chromeSender],
        ['without a stated origin', plainSender],
    ])('uses the grant of its own site, %s', async (_, sender) => {
        const env = await bootUnlocked({ [SITE]: { 'signEvent:1': 'allow' } });
        const res = await answerWithin(env.dispatch({ kind: 'signEvent', payload: SIGN }, sender(SITE)));
        expect(res.pubkey).toBe(PUB_A);
        expect(env.tabs.shown).toHaveLength(0);
    });

    it.each([
        ['https', 'https://site.example', 'site.example'],
        ['http on a port', 'http://localhost:3000', 'localhost:3000'],
    ])('still honours a bare-host grant from an older version, over %s', async (_, origin, bare) => {
        const env = await bootUnlocked({ [bare]: { 'signEvent:1': 'allow' } });
        const res = await answerWithin(env.dispatch({ kind: 'signEvent', payload: SIGN }, plainSender(origin)));
        expect(res.pubkey).toBe(getPublicKeySync(HEX_A));
        expect(env.tabs.shown).toHaveLength(0);
    });

    it('answers a sender with no origin at once, and keeps nothing for it', async () => {
        const env = await bootUnlocked({ [OTHER]: { 'signEvent:1': 'allow' } });
        const res = await answerWithin(env.dispatch(
            { kind: 'signEvent', payload: SIGN, host: OTHER },
            { id: ID, url: 'about:blank', frameId: 3, tab: { id: 7, url: `${OTHER}/` } },
        ));
        expect(res).toMatchObject({ error: 'invalid_request' });
        expect(env.tabs.shown).toHaveLength(0);
        expect(env.savedEvents).toHaveLength(0);
    });

    it('a remembered answer is stored under the site that asked', async () => {
        const env = await bootUnlocked();
        const res = env.dispatch({ kind: 'signEvent', payload: SIGN, host: OTHER }, plainSender(SITE));
        await vi.waitFor(() => expect(env.tabs.shown).toHaveLength(1));
        const { uuid } = env.tabs.shown[0];
        await env.dispatch({ kind: 'allowed', payload: uuid, remember: true }, {
            id: ID, tab: { id: 99, url: 'chrome-extension://test/permission/permission.html' },
            url: 'chrome-extension://test/permission/permission.html',
        });
        await res;
        await env.flushWrites();
        const { hosts } = env.local._dump().profiles[0];
        expect(hosts[SITE]).toEqual({ 'signEvent:1': 'allow' });
        expect(hosts[OTHER]).toBeUndefined();
    });
});
