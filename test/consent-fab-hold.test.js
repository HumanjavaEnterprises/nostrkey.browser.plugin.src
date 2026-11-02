// @vitest-environment jsdom
/**
 * Minimizing removes the iframe that keeps a suspendable background awake, so the
 * real minimized button has to send the note instead, until the deadline.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const T0 = 1_700_000_000_000;
const NOTE = { kind: 'holdMinimizedPrompt' };

let sent;
let toContent;
let roots;

const notes = () => sent.filter(m => m.kind === NOTE.kind);
const pass = (ms) => vi.advanceTimersByTimeAsync(ms);

async function showSheet(left = 40_000) {
    toContent(
        { kind: 'showPermissionSheet', url: `chrome-extension://test/permission/permission.html?deadline=${T0 + left}` },
        {},
        () => {},
    );
    await pass(0);
}

async function minimize() {
    roots.at(-1).querySelector('.nk-backdrop').click();
    await pass(0);
}

beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    sent = [];
    roots = [];
    const attach = Element.prototype.attachShadow;
    vi.spyOn(Element.prototype, 'attachShadow').mockImplementation(function shadow() {
        const root = attach.call(this, { mode: 'open' });
        roots.push(root);
        return root;
    });
    // jsdom leaves these style fields empty, which the redress guard rightly distrusts.
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        opacity: '1', visibility: 'visible', display: 'block', pointerEvents: 'auto', filter: 'none',
        transform: 'none', mixBlendMode: 'normal', clipPath: 'none', perspective: 'none',
        contentVisibility: 'visible',
    });
    vi.doMock('../src/utilities/browser-polyfill', () => ({
        api: {
            runtime: {
                sendMessage: async (m) => { sent.push(m); },
                getURL: (p) => `chrome-extension://test/${p}`,
                onMessage: { addListener(fn) { toContent = fn; } },
            },
            storage: { local: { get: async () => ({}), set: async () => {} }, onChanged: { addListener() {} } },
        },
    }));
    await import('../src/content.js');
    await pass(0);
    sent.length = 0;
});

afterEach(() => {
    toContent({ kind: 'closePermissionSheet' }, {}, () => {});
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.doUnmock('../src/utilities/browser-polyfill');
    document.documentElement.querySelectorAll(':scope > div').forEach(el => el.remove());
});

describe('the minimized button', () => {
    it('sends nothing while the sheet is open, which sends its own', async () => {
        await showSheet();
        await pass(20_000);
        expect(notes()).toEqual([]);
    });

    it('sends the note as soon as the sheet is minimized', async () => {
        await showSheet();
        await minimize();
        expect(notes()).toEqual([NOTE]);
    });

    it('sends it at least every 10 seconds until the deadline', async () => {
        await showSheet();
        await minimize();
        await pass(39_000);
        expect(notes().length).toBeGreaterThanOrEqual(4);
        expect(sent.every(m => m.kind === NOTE.kind)).toBe(true);
    });

    it('stops at the deadline', async () => {
        await showSheet();
        await minimize();
        await pass(41_000);
        const count = notes().length;
        await pass(60_000);
        expect(notes().length).toBe(count);
    });

    it('stops when the prompt is closed', async () => {
        await showSheet();
        await minimize();
        toContent({ kind: 'closePermissionSheet' }, {}, () => {});
        const count = notes().length;
        await pass(30_000);
        expect(notes().length).toBe(count);
    });

    it('sends no decision and no request data', async () => {
        await showSheet();
        await minimize();
        expect(notes()[0]).toEqual({ kind: 'holdMinimizedPrompt' });
    });
});
