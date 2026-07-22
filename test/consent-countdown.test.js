// @vitest-environment jsdom
/**
 * Auto-decline countdown readout math (CS-01, CS-03).
 *
 * LOGIC MIRROR of startCountdown()/tick() from
 * src/permission/permission.js:339-369 (v1.7.0). background.js arms the real
 * auto-decline timer; the sheet mirrors it so the user sees the remaining
 * window. Because it derives the count from a FIXED absolute `deadline` (not a
 * fresh duration), minimize→reopen keeps the readout correct.
 *
 * The function is not cleanly importable (permission.js binds DOMContentLoaded
 * + sends runtime messages at import time), so per the harness's logic-mirror
 * approach we copy startCountdown VERBATIM here and drive the real element ids
 * it reads (#perm-countdown, #perm-timebar-fill, #allow-btn) with fake timers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────
// VERBATIM copy of src/permission/permission.js:339-369 (do not edit — mirror)
// ─────────────────────────────────────────────────────────────────────────
function startCountdown(qs) {
    const deadline = Number(qs.get('deadline')) || 0;
    const ttl = Number(qs.get('ttl')) || 0;
    if (!deadline || !ttl) return;
    const cdEl = document.getElementById('perm-countdown');
    const barEl = document.getElementById('perm-timebar-fill');
    const allowBtn = document.getElementById('allow-btn');
    let timer = null;
    const tick = () => {
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
            if (cdEl) { cdEl.textContent = 'Expired'; cdEl.classList.add('is-expired'); cdEl.classList.remove('is-urgent'); }
            if (barEl) barEl.style.width = '0%';
            if (allowBtn) allowBtn.disabled = true; // background has already declined
            if (timer) clearInterval(timer);
            return;
        }
        const secs = Math.ceil(remaining / 1000);
        if (cdEl) {
            cdEl.textContent = `${secs}s`;
            cdEl.title = `Auto-declines in ${secs}s`;
            cdEl.classList.toggle('is-urgent', remaining <= 10000);
        }
        if (barEl) {
            barEl.style.width = `${Math.max(0, Math.min(100, (remaining / ttl) * 100))}%`;
            barEl.classList.toggle('is-urgent', remaining <= 10000);
        }
    };
    tick();
    timer = setInterval(tick, 250);
}
// ─────────────────────────────────────────────────────────────────────────
// end mirror
// ─────────────────────────────────────────────────────────────────────────

// Build the real element ids the function reads, plus a URLSearchParams-shaped
// query. permission.html:20/27 give #perm-timebar-fill and #perm-countdown;
// permission.html #allow-btn is the Approve button (permission.js:314/323).
function mountDom() {
    document.body.innerHTML = `
        <div id="perm-timebar-fill" class="perm-timebar-fill"></div>
        <span id="perm-countdown" class="perm-countdown"></span>
        <button id="allow-btn">Approve</button>
    `;
}

function qsOf(obj) {
    return new URLSearchParams(obj);
}

const T0 = 1_700_000_000_000; // fixed wall-clock anchor

describe('consent auto-decline countdown (permission.js:339-369)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(T0);
        mountDom();
    });
    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    const cd = () => document.getElementById('perm-countdown');
    const bar = () => document.getElementById('perm-timebar-fill');
    const allow = () => document.getElementById('allow-btn');

    it('CS-01: first tick shows 40s and a 100% bar for deadline=now+40000, ttl=40000', () => {
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '40000' }));
        expect(cd().textContent).toBe('40s');
        expect(bar().style.width).toBe('100%');
        expect(cd().classList.contains('is-urgent')).toBe(false);
        expect(bar().classList.contains('is-urgent')).toBe(false);
    });

    it('CS-01: adds is-urgent on countdown AND bar once remaining <= 10000ms (9000ms)', () => {
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '40000' }));
        // Advance the fixed clock to leave exactly 9000ms.
        vi.advanceTimersByTime(31000);
        expect(cd().textContent).toBe('9s');
        expect(cd().classList.contains('is-urgent')).toBe(true);
        expect(bar().classList.contains('is-urgent')).toBe(true);
    });

    it('CS-01: does NOT flag is-urgent at exactly 10001ms remaining (threshold is <=10000)', () => {
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '40000' }));
        vi.advanceTimersByTime(29999); // remaining = 10001
        expect(cd().classList.contains('is-urgent')).toBe(false);
        expect(bar().classList.contains('is-urgent')).toBe(false);
    });

    it('CS-01: readout uses Math.ceil — at 500ms remaining it still shows 1s, not 0s', () => {
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '40000' }));
        vi.advanceTimersByTime(39500); // remaining = 500
        expect(cd().textContent).toBe('1s');
        expect(cd().classList.contains('is-expired')).toBe(false);
    });

    it('CS-01: at remaining<=0 → text "Expired", is-expired set, is-urgent cleared, bar 0%, Approve disabled, interval cleared', () => {
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '40000' }));
        // Drive into the urgent window first so we can prove is-urgent is removed.
        vi.advanceTimersByTime(31000);
        expect(cd().classList.contains('is-urgent')).toBe(true);
        // Now cross the deadline.
        vi.advanceTimersByTime(15000); // remaining = -6000
        expect(cd().textContent).toBe('Expired');
        expect(cd().classList.contains('is-expired')).toBe(true);
        expect(cd().classList.contains('is-urgent')).toBe(false);
        expect(bar().style.width).toBe('0%');
        expect(allow().disabled).toBe(true);

        // Interval was cleared: mutate the readout and advance more — no further
        // tick should overwrite it (if the interval were still live, tick would
        // reset the text back to 'Expired').
        cd().textContent = 'SENTINEL';
        vi.advanceTimersByTime(5000);
        expect(cd().textContent).toBe('SENTINEL');
    });

    it('CS-03: absolute-deadline — advancing wall-clock 20s between ticks yields 20s (derived from fixed deadline, survives minimize→reopen)', () => {
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '40000' }));
        expect(cd().textContent).toBe('40s');
        vi.advanceTimersByTime(20000);
        // Count is deadline - now, NOT a fresh 40s duration restarted on reopen.
        expect(cd().textContent).toBe('20s');
        expect(bar().style.width).toBe('50%');
    });

    it('inert (early return) when ttl is 0/absent — no interval, no DOM mutation', () => {
        cd().textContent = 'UNTOUCHED';
        bar().style.width = '77%';
        const setInt = vi.spyOn(globalThis, 'setInterval');
        startCountdown(qsOf({ deadline: String(T0 + 40000), ttl: '0' }));
        expect(setInt).not.toHaveBeenCalled();
        expect(cd().textContent).toBe('UNTOUCHED');
        expect(bar().style.width).toBe('77%');
        setInt.mockRestore();
    });

    it('inert (early return) when deadline is 0/absent', () => {
        cd().textContent = 'UNTOUCHED';
        const setInt = vi.spyOn(globalThis, 'setInterval');
        startCountdown(qsOf({ ttl: '40000' })); // no deadline
        expect(setInt).not.toHaveBeenCalled();
        expect(cd().textContent).toBe('UNTOUCHED');
        setInt.mockRestore();
    });
});
