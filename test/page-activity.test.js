// @vitest-environment jsdom
/**
 * Using NostrKey's own pages holds off auto-lock, through the real page start-up.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let sent;
let added;
const NOTE = { kind: 'resetAutoLock' };
const press = () => document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
const type = () => document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));

beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    sent = [];
    added = [];
    const add = document.addEventListener.bind(document);
    vi.spyOn(document, 'addEventListener').mockImplementation((type, fn, opts) => {
        added.push([type, fn, opts]);
        add(type, fn, opts);
    });
    vi.doMock('../src/utilities/browser-polyfill', () => ({
        api: { runtime: { sendMessage: async (m) => { sent.push(m); } } },
    }));
    const { startPage } = await import('../src/utilities/page-gate');
    await startPage(async () => {});
});

afterEach(() => {
    added.forEach(([type, fn, opts]) => document.removeEventListener(type, fn, opts));
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.doUnmock('../src/utilities/browser-polyfill');
});

describe('activity on an extension page', () => {
    it('sends nothing just for opening', () => {
        expect(sent).toEqual([]);
    });

    it.each([['a press', press], ['a key', type]])('%s holds off auto-lock', (_, act) => {
        act();
        expect(sent).toEqual([NOTE]);
    });

    it('sends one note in 30 seconds, then another', () => {
        press();
        vi.advanceTimersByTime(29_000);
        press();
        type();
        expect(sent).toHaveLength(1);
        vi.advanceTimersByTime(1_000);
        press();
        expect(sent).toHaveLength(2);
    });
});
