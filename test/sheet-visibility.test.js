/**
 * What the sheet does with the browser's reports on whether it can be seen.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { canTrackVisibility, trackVisibility, SEEN_QUIET_MS, UNSEEN_LIMIT_MS } from '../src/permission/sheet-visibility.js';

function fakeWindow({ supported = true, hidden = false } = {}) {
    const observers = [];
    class IntersectionObserver {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.targets = [];
            observers.push(this);
        }
        observe(target) { this.targets.push(target); }
        disconnect() { this.disconnected = true; }
    }
    const win = {
        IntersectionObserver,
        IntersectionObserverEntry: class {},
        document: { visibilityState: hidden ? 'hidden' : 'visible' },
        report: (isVisible) => observers[0].callback([{ isVisible }]),
        observers,
    };
    if (supported) win.IntersectionObserverEntry.prototype.isVisible = false;
    return win;
}

function watch(win) {
    const holds = [];
    const lost = { count: 0 };
    const stop = trackVisibility({}, { onHold: h => holds.push(h), onUnseen: () => { lost.count++; } }, win);
    return { holds, lost, stop };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('whether reports are available', () => {
    it('needs the visibility field', () => {
        expect(canTrackVisibility(fakeWindow())).toBe(true);
        expect(canTrackVisibility(fakeWindow({ supported: false }))).toBe(false);
    });
    it('needs the observer at all', () => {
        expect(canTrackVisibility({})).toBe(false);
    });
    it('with no reports available nothing is held', () => {
        const win = fakeWindow({ supported: false });
        const { holds } = watch(win);
        expect(holds).toEqual([]);
        expect(win.observers).toEqual([]);
    });
});

describe('with reports', () => {
    it('asks for reports with a delay of at least 100 ms', () => {
        const win = fakeWindow();
        watch(win);
        expect(win.observers[0].options.trackVisibility).toBe(true);
        expect(win.observers[0].options.delay).toBeGreaterThanOrEqual(100);
    });

    it('starts held', () => {
        expect(watch(fakeWindow()).holds).toEqual([true]);
    });

    it('lets go a quiet time after a report that it can be seen', () => {
        const win = fakeWindow();
        const { holds } = watch(win);
        win.report(true);
        vi.advanceTimersByTime(SEEN_QUIET_MS - 1);
        expect(holds).toEqual([true]);
        vi.advanceTimersByTime(1);
        expect(holds).toEqual([true, false]);
    });

    it('holds again at once on a report that it cannot', () => {
        const win = fakeWindow();
        const { holds } = watch(win);
        win.report(true);
        vi.advanceTimersByTime(SEEN_QUIET_MS);
        win.report(false);
        expect(holds).toEqual([true, false, true]);
    });

    it('a flicker starts the quiet time again', () => {
        const win = fakeWindow();
        const { holds } = watch(win);
        win.report(true);
        vi.advanceTimersByTime(SEEN_QUIET_MS - 1);
        win.report(false);
        win.report(true);
        vi.advanceTimersByTime(SEEN_QUIET_MS - 1);
        expect(holds).toEqual([true]);
    });

    it('gives up on the sheet if it is not seen in time', () => {
        const { lost } = watch(fakeWindow());
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS - 1);
        expect(lost.count).toBe(0);
        vi.advanceTimersByTime(1);
        expect(lost.count).toBe(1);
    });

    it('gives up once it has stayed out of sight', () => {
        const win = fakeWindow();
        const { lost } = watch(win);
        win.report(true);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS * 3);
        expect(lost.count).toBe(0);
        win.report(false);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS);
        expect(lost.count).toBe(1);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS * 3);
        expect(lost.count).toBe(1);
    });

    it('a sheet back in view in time stays', () => {
        const win = fakeWindow();
        const { lost } = watch(win);
        win.report(false);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS - 1);
        win.report(true);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS * 2);
        expect(lost.count).toBe(0);
    });

    it('waits while the tab itself is out of sight', () => {
        const win = fakeWindow({ hidden: true });
        const { lost } = watch(win);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS * 3);
        expect(lost.count).toBe(0);
        win.document.visibilityState = 'visible';
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS);
        expect(lost.count).toBe(1);
    });

    it('stopping ends it', () => {
        const win = fakeWindow();
        const { lost, stop } = watch(win);
        stop();
        expect(win.observers[0].disconnected).toBe(true);
        vi.advanceTimersByTime(UNSEEN_LIMIT_MS * 3);
        expect(lost.count).toBe(0);
    });
});
