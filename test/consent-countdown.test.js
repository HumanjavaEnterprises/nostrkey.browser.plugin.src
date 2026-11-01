// @vitest-environment jsdom
/**
 * The real permission page's auto-decline countdown. The worker holds the real
 * timer; the page counts down to the same deadline, so a sheet reopened from its
 * minimized button shows the time actually left.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { open } from './helpers/permission-page.js';

const T0 = 1_700_000_000_000;
const QUERY = { uuid: 'u-1', host: 'https://example.com', kind: 'getPubKey' };

const countdown = () => document.getElementById('perm-countdown');
const bar = () => document.getElementById('perm-timebar-fill');
const approve = () => document.getElementById('allow-btn');
const urgent = (el) => el.classList.contains('is-urgent');

const start = (left = 40000, ttl = 40000) => open({ ...QUERY, deadline: String(T0 + left), ttl: String(ttl) });
const pass = (ms) => vi.advanceTimersByTimeAsync(ms);

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
});

afterEach(() => {
    vi.useRealTimers();
    window.history.pushState({}, '', '/');
});

describe('the countdown', () => {
    it('starts at the full window', async () => {
        await start();
        expect(countdown().textContent).toBe('40s');
        expect(countdown().title).toBe('Auto-declines in 40s');
        expect(bar().style.width).toBe('100%');
        expect(urgent(countdown())).toBe(false);
    });

    it('counts down', async () => {
        await start();
        await pass(20000);
        expect(countdown().textContent).toBe('20s');
        expect(bar().style.width).toBe('50%');
    });

    it('counts from the deadline, so a reopened sheet shows the time left', async () => {
        await start(15000);
        expect(countdown().textContent).toBe('15s');
        expect(bar().style.width).toBe('37.5%');
    });

    it('turns urgent at 10 seconds, not before', async () => {
        await start(10250);
        expect(urgent(countdown())).toBe(false);
        expect(urgent(bar())).toBe(false);
        await pass(250);
        expect(urgent(countdown())).toBe(true);
        expect(urgent(bar())).toBe(true);
    });

    it('rounds up, so it never reads 0s with time left', async () => {
        await start(750);
        await pass(250);
        expect(countdown().textContent).toBe('1s');
        expect(countdown().classList.contains('is-expired')).toBe(false);
    });
});

describe('at the deadline', () => {
    it.each([
        ['already past when the page opens', -1000],
        ['reached while the page settles', 100],
        ['reached as the page settles', 450],
    ])('never offers Approve to a request %s', async (_, left) => {
        await start(left);
        expect(approve().disabled).toBe(true);
        await pass(450);
        expect(approve().disabled).toBe(true);
        await pass(1000);
        expect(approve().disabled).toBe(true);
        expect(countdown().textContent).toBe('Expired');
    });

    it('still offers Approve to a request with time left after the settle', async () => {
        await start(451);
        await pass(450);
        expect(approve().disabled).toBe(false);
    });

    it('reads Expired, empties the bar, and takes Approve away', async () => {
        await start(12000);
        await pass(500);
        expect(approve().disabled).toBe(false);
        expect(urgent(countdown())).toBe(false);
        await pass(2000);
        expect(urgent(countdown())).toBe(true);
        await pass(10000);
        expect(countdown().textContent).toBe('Expired');
        expect(countdown().classList.contains('is-expired')).toBe(true);
        expect(urgent(countdown())).toBe(false);
        expect(bar().style.width).toBe('0%');
        expect(approve().disabled).toBe(true);
    });

    it('stops ticking', async () => {
        await start(1000);
        await pass(1000);
        countdown().textContent = 'left alone';
        await pass(5000);
        expect(countdown().textContent).toBe('left alone');
    });
});

describe('a request with no window', () => {
    it.each([
        ['no ttl', { deadline: String(T0 + 40000), ttl: '0' }],
        ['no deadline', { ttl: '40000' }],
    ])('leaves the readout alone with %s', async (_, window_) => {
        await open({ ...QUERY, ...window_ });
        expect(countdown().textContent).toBe('');
        await pass(1000);
        expect(countdown().textContent).toBe('');
        expect(approve().disabled).toBe(false);
    });
});
