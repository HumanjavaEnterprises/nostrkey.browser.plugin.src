/**
 * Auto-lock while a request waits on the person, on the REAL background worker.
 * The lock waits for an open prompt, but never past the original deadline plus
 * one prompt timeout, however many requests queue. Then it locks and declines
 * everything held. A manual lock always locks at once. A request that waited its
 * turn is checked against the lock again before it is shown.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  bootWithPassword, settle, track, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';

const backgroundJs = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'background.js'),
  'utf8',
);
const PROMPT_TIMEOUT_MS = Number(
  (backgroundJs.match(/PROMPT_TIMEOUT_MS\s*=\s*([0-9_]+)/) || [])[1]?.replace(/_/g, ''),
);

const PASSWORD = 'correct horse battery staple';
const ALARM = 'nostrkey-auto-lock';
const EVENT = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
const sign = (env) => track(env.dispatch({ kind: 'signEvent', host: ORIGIN, payload: EVENT }, PAGE_SENDER));
const isLocked = (env) => env.dispatch({ kind: 'isLocked' });

async function unlocked(access = false) {
  const env = await bootWithPassword(PASSWORD, { autoLockMinutes: 15 });
  expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD })).toMatchObject({ success: true });
  await env.dispatch({ kind: 'setNostrAccessWhileLocked', payload: access });
  return env;
}

afterEach(() => {
  vi.useRealTimers();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('auto-lock waits for an open prompt', () => {
  it('with no request waiting, the auto-lock locks at once', async () => {
    const env = await unlocked();
    env.fireAlarm(ALARM);
    await settle();
    expect(await isLocked(env)).toBe(true);
  });

  it('holds while the prompt is open; answering it is activity, so the full timeout starts again', async () => {
    const env = await unlocked();
    const a = sign(env);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);

    env.fireAlarm(ALARM);
    await settle();
    expect(await isLocked(env)).toBe(false);

    await env.dispatch({
      kind: 'denied', payload: env.tabs.shown[0].uuid, origKind: 'signEvent', event: EVENT, remember: false, host: ORIGIN,
    }, PERMISSION_SENDER);
    await settle();
    expect(a.value).toMatchObject({ error: 'denied' });
    expect(await isLocked(env)).toBe(false);
    expect(env.alarms.get(ALARM)).toEqual({ delayInMinutes: 15 });
  });

  it('a prompt that ends unanswered lets the held lock go through', async () => {
    const env = await unlocked();
    vi.useFakeTimers();
    const a = sign(env);
    await settle(30);
    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS - 10_000);
    env.fireAlarm(ALARM);
    await settle();
    expect(await isLocked(env)).toBe(false);
    await vi.advanceTimersByTimeAsync(10_000);
    await settle(30);
    expect(a.value).toMatchObject({ error: 'timed_out' });
    expect(await isLocked(env)).toBe(true);
  });

  it('a queue of prompts cannot hold the lock past the deadline plus one prompt timeout', async () => {
    const env = await unlocked();
    vi.useFakeTimers();
    const answers = [sign(env), sign(env), sign(env)];
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);

    // Due 30 s into the first prompt. That prompt times out at 40 s and the
    // next one opens with a fresh 40 s, which would run to 80 s.
    await vi.advanceTimersByTimeAsync(30_000);
    env.fireAlarm(ALARM);
    await settle();

    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS - 1);
    await settle(30);
    expect(env.tabs.shown.length).toBeGreaterThanOrEqual(2);
    expect(await isLocked(env)).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await settle(30);
    expect(await isLocked(env)).toBe(true);
    for (const a of answers) {
      expect(a.answered).toBe(true);
      expect(a.value?.error).toBeTruthy();
      expect(a.value?.sig).toBeUndefined();
    }
    const shownBefore = env.tabs.shown.length;
    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS * 3);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(shownBefore);
  });
});

describe('only the person\'s own actions count as activity', () => {
  const signKind = (env, kind) => track(env.dispatch({
    kind: 'signEvent', host: ORIGIN, payload: { ...EVENT, kind },
  }, PAGE_SENDER));
  async function withGrant() {
    const env = await unlocked();
    const first = signKind(env, 1);
    await settle(30);
    await env.dispatch({
      kind: 'allowed', payload: env.tabs.shown[0].uuid, remember: true,
      origKind: 'signEvent', event: { ...EVENT, kind: 1 }, host: ORIGIN,
    }, PERMISSION_SENDER);
    await settle(30);
    expect(first.value?.sig).toBeTruthy();
    return env;
  }

  it('a site signing every minute under a remembered grant does not keep NostrKey unlocked', async () => {
    const env = await withGrant();
    env.alarms.delete(ALARM);
    for (let i = 0; i < 5; i++) {
      const r = signKind(env, 1);
      await settle(30);
      expect(r.value?.sig).toBeTruthy();
      expect(env.alarms.has(ALARM)).toBe(false);
    }
    env.fireAlarm(ALARM);
    await settle();
    expect(await isLocked(env)).toBe(true);
  });

  it('a note from a website tab is not activity; one from NostrKey\'s own page is', async () => {
    const env = await unlocked();
    env.alarms.delete(ALARM);
    await env.dispatch({ kind: 'resetAutoLock' }, PAGE_SENDER);
    expect(env.alarms.has(ALARM)).toBe(false);
    await env.dispatch({ kind: 'resetAutoLock' }, PERMISSION_SENDER);
    expect(env.alarms.get(ALARM)).toEqual({ delayInMinutes: 15 });
  });

  it('an auto-sign during a hold does not remove the deadline-plus-one-prompt cap', async () => {
    const env = await withGrant();
    vi.useFakeTimers();
    const held = signKind(env, 7);
    await settle(30);
    env.fireAlarm(ALARM);
    await settle();
    expect(await isLocked(env)).toBe(false);

    await vi.advanceTimersByTimeAsync(10_000);
    const auto = signKind(env, 1);
    await settle(30);
    expect(auto.answered).toBe(true);

    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS);
    await settle(30);
    expect(held.value?.sig).toBeUndefined();
    expect(await isLocked(env)).toBe(true);
  });
});

describe('manual lock', () => {
  it('locks at once and declines the open prompt and the queue', async () => {
    const env = await unlocked();
    const a = sign(env);
    const b = sign(env);
    await settle(30);
    await env.dispatch({ kind: 'lock' });
    await settle(30);
    expect(await isLocked(env)).toBe(true);
    expect(a.value).toMatchObject({ error: 'denied' });
    expect(b.value).toMatchObject({ error: 'locked' });
    expect(env.tabs.shown).toHaveLength(1);
  });
});

describe('a request that waited its turn is checked against the lock again', () => {
  it('"access while locked" off: refused as locked, never shown, never signed', async () => {
    const env = await unlocked(false);
    sign(env);
    const queued = sign(env);
    await settle(30);
    await env.dispatch({ kind: 'lock' });
    await settle(30);
    expect(queued.value).toEqual({
      error: 'locked', message: 'Extension is locked. Please unlock with your master password.',
    });
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('a request arriving after the lock is refused, with the keys gone', async () => {
    const env = await unlocked(false);
    await env.dispatch({ kind: 'lock' });
    const late = sign(env);
    await settle(30);
    expect(late.value).toMatchObject({ error: 'locked' });
    expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toBeFalsy();
  });
});
