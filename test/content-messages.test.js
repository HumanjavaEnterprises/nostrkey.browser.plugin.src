// @vitest-environment jsdom
/**
 * Which page messages the real content script carries to the worker. It takes
 * messages from its own window only.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let sent;

const request = (kind = 'getPubKey') => ({ kind, reqId: 'r1', payload: { a: 1 } });
const deliver = (source, data = request()) => window.dispatchEvent(new MessageEvent('message', { data, source }));
const settle = () => new Promise(r => setTimeout(r, 0));

beforeEach(async () => {
    vi.resetModules();
    sent = [];
    vi.doMock('../src/utilities/browser-polyfill', () => ({
        api: {
            runtime: {
                sendMessage: async (m) => { sent.push(m); return 'answer'; },
                getURL: (p) => `chrome-extension://test/${p}`,
                onMessage: { addListener() {} },
            },
            storage: { local: { get: async (k) => k, set: async () => {} }, onChanged: { addListener() {} } },
        },
    }));
    await import('../src/content.js');
    await settle();
    sent.length = 0;
});

afterEach(() => { vi.doUnmock('../src/utilities/browser-polyfill'); });

describe('a page message', () => {
    it('from this window reaches the worker, with this page as its origin', async () => {
        deliver(window);
        await settle();
        expect(sent).toEqual([{ kind: 'getPubKey', payload: { a: 1 }, host: window.location.origin }]);
    });

    it('from another window does not', async () => {
        const frame = document.createElement('iframe');
        document.body.appendChild(frame);
        deliver(frame.contentWindow);
        await settle();
        expect(sent).toEqual([]);
    });

    it('from no window does not', async () => {
        deliver(null);
        await settle();
        expect(sent).toEqual([]);
    });

    it('of a kind off the list does not', async () => {
        deliver(window, request('getNsec'));
        await settle();
        expect(sent).toEqual([]);
    });
});
