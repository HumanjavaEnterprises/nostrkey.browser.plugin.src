/**
 * Background prompt lifecycle — LOGIC MIRROR of src/background.js
 *
 * background.js is a service worker with import-time side effects (registers
 * chrome.runtime listeners, boots a Mutex, etc.) and is NOT cleanly importable
 * under vitest/jsdom. Per the harness's logic-mirror approach (see
 * test/security.test.js), these tests copy the relevant functions VERBATIM from
 * current source and assert on the copy. Each mirror block cites the exact
 * source file:line it was copied from — if source drifts, update the mirror.
 *
 * Covers:
 *   CS-01/CS-02 — forged-uuid poisoning guard in complete()/deny()
 *   CS-17       — pendingQueue accounting: no queued request silently dropped
 *   CS-18       — fail-closed: prompt auto-declines on the 40s timeout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Read the REAL constant out of source so this test (and the mirror harness
// below, which uses it for timer math) tracks background.js and fails on drift —
// a local `const = 40_000` would only assert the test's own literal.
const backgroundJs = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'background.js'),
  'utf8',
);
const PROMPT_TIMEOUT_MS = Number(
  (backgroundJs.match(/PROMPT_TIMEOUT_MS\s*=\s*([0-9_]+)/) || [])[1]?.replace(/_/g, ''),
);

describe('PROMPT_TIMEOUT_MS (source-coupled)', () => {
  it('src/background.js sets the auto-decline window to 40s', () => {
    // Fails if source drifts away from 40_000 — not a self-check of a local literal.
    expect(PROMPT_TIMEOUT_MS).toBe(40000);
  });
  it('the prompt URL carries ttl so the consent countdown can mirror it', () => {
    expect(backgroundJs).toMatch(/ttl:\s*String\(PROMPT_TIMEOUT_MS\)/);
    expect(backgroundJs).toMatch(/deadline=\$\{prompt\.deadline\}/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared mirror harness. Rebuilt fresh per test so no cross-test bleed.
//
// `prompt` mirrors the shape declared at background.js:94-100.
// `validations` mirrors background.js:89.
// `pendingQueue` mirrors background.js:101.
// setPermission / deny are spies so we can observe the security-relevant writes.
// ─────────────────────────────────────────────────────────────────────────────
function makeHarness() {
  const validations = {};
  let pendingQueue = { total: 0, processed: 0 };
  const prompt = { denyTimer: null, deadline: 0, release: vi.fn() };

  const setPermission = vi.fn();

  // ── deny() mirror — background.js:1779-1798 ──
  function deny({ origKind, host, payload, remember, event }) {
    const sendResponse = validations[payload];
    // Same guard as complete(): only a live pending request may write the
    // persistent deny-list. A forged/framed postback with an unknown uuid is
    // ignored so it cannot poison (host,kind)→deny entries.
    if (!sendResponse) return false;
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    delete validations[payload];
    if (Object.keys(validations).length === 0) {
      pendingQueue = { total: 0, processed: 0 };
    }

    if (remember) {
      let mKind =
        origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
      setPermission(host, mKind, 'deny');
    }

    sendResponse(undefined);
    return false;
  }

  // ── complete() mirror — background.js:1724-1742 (prologue + queue + remember) ──
  // The trailing origKind switch (real crypto ops) is intentionally omitted:
  // these tests exercise the guard/queue/setPermission prologue only, and the
  // real signing paths need the extension runtime. We record the origKind that
  // WOULD dispatch instead.
  function complete({ payload, origKind, event, remember, host }) {
    const sendResponse = validations[payload];
    // Ignore any postback that doesn't match a LIVE pending request. payload is
    // an unguessable crypto.randomUUID() minted per real prompt, so requiring
    // it to exist here stops a framed/forged permission page from writing the
    // persistent allow-list via setPermission or perturbing queue state.
    if (!sendResponse) return;
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    delete validations[payload];
    if (Object.keys(validations).length === 0) {
      pendingQueue = { total: 0, processed: 0 };
    }

    if (remember) {
      let mKind =
        origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
      setPermission(host, mKind, 'allow');
    }
    // dispatch of origKind omitted — see comment above.
  }

  // ── armPromptTimeout() mirror — background.js:129-140 ──
  function armPromptTimeout(uuid, kind, host) {
    if (prompt.denyTimer) { clearTimeout(prompt.denyTimer); prompt.denyTimer = null; }
    prompt.deadline = Date.now() + PROMPT_TIMEOUT_MS;
    prompt.denyTimer = setTimeout(() => {
      prompt.denyTimer = null;
      // Deny the still-pending request on timeout instead of silently releasing.
      if (validations[uuid]) {
        deny({ payload: uuid, origKind: kind, host });
      }
      prompt.release?.();
    }, PROMPT_TIMEOUT_MS);
  }

  // ── enqueue mirror — background.js:1468-1471 (the validations/pendingQueue
  //    bookkeeping run when a real signing request arrives) ──
  function enqueue(uuid, sendResponse) {
    validations[uuid] = sendResponse;
    if (Object.keys(validations).length === 1) {
      pendingQueue = { total: 0, processed: 0 };
    }
    pendingQueue.total++;
  }

  return {
    validations,
    prompt,
    setPermission,
    deny,
    complete,
    armPromptTimeout,
    enqueue,
    getQueue: () => pendingQueue,
    // test-only: simulate a stale queue left non-zero by a prior cycle so the
    // first-enqueue reset branch becomes observable (not part of the source API).
    _dirtyQueue: (q) => { pendingQueue = { ...q }; },
  };
}

describe('armPromptTimeout — arm / re-arm (background.js:129-140)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_000_000); });
  afterEach(() => { vi.useRealTimers(); });

  it('stamps deadline = now + PROMPT_TIMEOUT_MS and sets exactly one denyTimer', () => {
    const h = makeHarness();
    h.enqueue('u1', vi.fn());

    h.armPromptTimeout('u1', 'signEvent', 'example.com');

    expect(h.prompt.deadline).toBe(Date.now() + PROMPT_TIMEOUT_MS);
    expect(h.prompt.denyTimer).not.toBeNull();
    // Exactly one pending timer armed.
    expect(vi.getTimerCount()).toBe(1);
  });

  it('re-arming (escalation) clears the previous timer so only one decline is pending', () => {
    const h = makeHarness();
    h.enqueue('u1', vi.fn());

    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    h.armPromptTimeout('u1', 'signEvent', 'example.com');
    const firstTimer = h.prompt.denyTimer;

    h.armPromptTimeout('u1', 'signEvent', 'example.com');
    const secondTimer = h.prompt.denyTimer;

    // The previous timer was cleared...
    expect(clearSpy).toHaveBeenCalledWith(firstTimer);
    // ...and a new distinct timer replaced it; still exactly one pending.
    expect(secondTimer).not.toBe(firstTimer);
    expect(vi.getTimerCount()).toBe(1);
    clearSpy.mockRestore();
  });
});

describe('timeout → fail-closed deny (CS-18, background.js:133-138)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_000_000); });
  afterEach(() => { vi.useRealTimers(); });

  it('with uuid STILL live → deny() fires, then release()', () => {
    const h = makeHarness();
    const respond = vi.fn();
    h.enqueue('u1', respond);
    // armPromptTimeout closes over the harness's own `deny`, so we assert on the
    // OBSERVABLE effect of deny: the pending sendResponse is resolved with
    // undefined and the validation entry is removed.

    h.armPromptTimeout('u1', 'signEvent', 'example.com');
    vi.advanceTimersByTime(PROMPT_TIMEOUT_MS);

    // deny() resolved the pending request with undefined (fail-closed).
    expect(respond).toHaveBeenCalledWith(undefined);
    // validation entry cleared.
    expect(h.validations.u1).toBeUndefined();
    // release() called after the deny.
    expect(h.prompt.release).toHaveBeenCalledTimes(1);
  });

  it('with uuid ALREADY resolved → deny() is NOT invoked (guarded by if(validations[uuid]))', () => {
    const h = makeHarness();
    const respond = vi.fn();
    h.enqueue('u1', respond);

    h.armPromptTimeout('u1', 'signEvent', 'example.com');

    // Simulate the request being resolved by a path that left the auto-decline
    // timer armed (the entry is gone from `validations` but the setTimeout is
    // still queued). This is precisely the race the `if (validations[uuid])`
    // guard at background.js:135 exists to defend: the timer must NOT re-deny an
    // already-resolved request.
    delete h.validations.u1;

    // Fire the still-armed timeout.
    vi.advanceTimersByTime(PROMPT_TIMEOUT_MS);

    // deny() must NOT have run: respond was never resolved with undefined.
    expect(respond).not.toHaveBeenCalled();
    // release() still runs — it is unconditional in the timeout callback.
    expect(h.prompt.release).toHaveBeenCalledTimes(1);
  });
});

describe('complete() poisoning guard (CS-01, background.js:1724-1742)', () => {
  it('forged uuid not in validations → returns early, no setPermission, queue untouched', () => {
    const h = makeHarness();
    h.enqueue('live', vi.fn());
    const beforeTotal = h.getQueue().total;

    h.complete({
      payload: 'forged-not-present',
      origKind: 'signEvent',
      event: { kind: 1 },
      remember: true,
      host: 'evil.example',
    });

    expect(h.setPermission).not.toHaveBeenCalled();
    // queue accounting untouched by the forged postback.
    expect(h.getQueue().total).toBe(beforeTotal);
    // the real live request is still pending.
    expect(h.validations.live).toBeDefined();
  });

  it('live uuid + remember + origKind signEvent → setPermission(host, "signEvent:"+kind, "allow")', () => {
    const h = makeHarness();
    h.enqueue('live', vi.fn());

    h.complete({
      payload: 'live',
      origKind: 'signEvent',
      event: { kind: 30078 },
      remember: true,
      host: 'good.example',
    });

    expect(h.setPermission).toHaveBeenCalledWith('good.example', 'signEvent:30078', 'allow');
  });
});

describe('deny() poisoning guard (CS-02, background.js:1779-1798)', () => {
  it('forged uuid → returns false, setPermission never called', () => {
    const h = makeHarness();
    h.enqueue('live', vi.fn());

    const ret = h.deny({
      payload: 'forged',
      origKind: 'signEvent',
      event: { kind: 1 },
      remember: true,
      host: 'evil.example',
    });

    expect(ret).toBe(false);
    expect(h.setPermission).not.toHaveBeenCalled();
    // cannot poison a (host,kind)→deny entry; live request still pending.
    expect(h.validations.live).toBeDefined();
  });

  it('live uuid + remember → setPermission(host, kind, "deny")', () => {
    const h = makeHarness();
    const respond = vi.fn();
    h.enqueue('live', respond);

    h.deny({
      payload: 'live',
      origKind: 'nip04.encrypt',
      remember: true,
      host: 'good.example',
    });

    expect(h.setPermission).toHaveBeenCalledWith('good.example', 'nip04.encrypt', 'deny');
    // request resolved with undefined (declined).
    expect(respond).toHaveBeenCalledWith(undefined);
  });
});

describe('pendingQueue accounting (CS-17, background.js:1468-1471 / 1734-1736 / 1787-1789)', () => {
  it('first validation into an empty map resets a stale queue to {0,0} then total++', () => {
    const h = makeHarness();
    // Pre-dirty the queue as if a prior cycle left it non-zero. This is what makes
    // the reset branch load-bearing: without the `length===1 → {0,0}` reset, the
    // first enqueue would yield {total:10, processed:4}, not {total:1}.
    h._dirtyQueue({ total: 9, processed: 4 });

    h.enqueue('u1', vi.fn());
    expect(h.getQueue()).toEqual({ total: 1, processed: 0 }); // reset THEN total++

    h.enqueue('u2', vi.fn());
    // second enqueue does NOT reset — total accumulates on top of the reset value.
    expect(h.getQueue()).toEqual({ total: 2, processed: 0 });
  });

  it('removing the LAST validation via complete() empties the queue cleanly to {0,0}', () => {
    const h = makeHarness();
    h.enqueue('u1', vi.fn());
    h.enqueue('u2', vi.fn());
    expect(h.getQueue().total).toBe(2);

    // resolve one — map is non-empty, queue must NOT reset.
    h.complete({ payload: 'u1', origKind: 'getPubKey', remember: false, host: 'h' });
    expect(h.getQueue().total).toBe(2);
    expect(Object.keys(h.validations)).toEqual(['u2']);

    // resolve the last — map empties, queue resets.
    h.complete({ payload: 'u2', origKind: 'getPubKey', remember: false, host: 'h' });
    expect(h.getQueue()).toEqual({ total: 0, processed: 0 });
    expect(Object.keys(h.validations)).toEqual([]);
  });

  it('removing the LAST validation via deny() also resets queue to {0,0} (no request silently dropped)', () => {
    const h = makeHarness();
    h.enqueue('only', vi.fn());
    expect(h.getQueue().total).toBe(1);

    h.deny({ payload: 'only', origKind: 'getPubKey', remember: false, host: 'h' });
    expect(h.getQueue()).toEqual({ total: 0, processed: 0 });
    expect(Object.keys(h.validations)).toEqual([]);
  });
});
