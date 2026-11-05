/**
 * Prompt lifecycle on the REAL background worker: the auto-decline timer, which
 * postbacks may write grants, and the queue numbers the consent UI shows.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  bootUnlocked, settle, track, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';

// Read the REAL constant out of source so a change to it fails here, instead of
// this suite asserting its own literal.
const backgroundJs = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'background.js'),
  'utf8',
);
const PROMPT_TIMEOUT_MS = Number(
  (backgroundJs.match(/PROMPT_TIMEOUT_MS\s*=\s*([0-9_]+)/) || [])[1]?.replace(/_/g, ''),
);

describe('PROMPT_TIMEOUT_MS (source-coupled)', () => {
  it('the prompt URL carries ttl so the consent countdown can mirror it', () => {
    expect(backgroundJs).toMatch(/ttl:\s*String\(PROMPT_TIMEOUT_MS\)/);
    expect(backgroundJs).toMatch(/deadline=\$\{prompt\.deadline\}/);
  });
});

// How long a page waits for an answer, and what has to fit inside it.
const source = (file) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', file), 'utf8');
const millis = (text, name) => Number((text.match(new RegExp(`${name}\\s*=\\s*([0-9_]+)`)) || [])[1]?.replace(/_/g, ''));
const PAGE_TIMEOUT_MS = millis(source('src/nostr.js'), 'PAGE_TIMEOUT_MS');
const PROMPT_WAIT_MS = millis(backgroundJs, 'PROMPT_WAIT_MS');
const REMOTE_REQUEST_MS = millis(source('src/utilities/nip46.js'), 'REMOTE_REQUEST_MS');

describe('a page outlasts its prompt (source-coupled)', () => {
  it('a remote signer has 30s to answer', () => {
    expect(REMOTE_REQUEST_MS).toBe(30_000);
  });
  it('the page waits out a turn in the queue, a prompt moved to a tab, and a remote signer starting a session', () => {
    const inQueue = PROMPT_WAIT_MS;
    const onSheetThenTab = 2 * PROMPT_TIMEOUT_MS;
    const connectThenSign = 3 * REMOTE_REQUEST_MS;
    expect(PAGE_TIMEOUT_MS).toBeGreaterThan(inQueue + onSheetThenTab + connectThenSign);
  });
  it('a turn in the queue may last as long as the prompt ahead of it', () => {
    expect(PROMPT_WAIT_MS).toBeGreaterThanOrEqual(2 * PROMPT_TIMEOUT_MS + REMOTE_REQUEST_MS);
  });
});

const EVENT = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
const signKind = (kind) => ({ kind: 'signEvent', host: ORIGIN, payload: { ...EVENT, kind } });
const request = (env, message) => env.dispatch(message, PAGE_SENDER);

const postback = (env, kind, uuid, fields = {}) => env.dispatch({
  kind,
  payload: uuid,
  origKind: 'signEvent',
  event: EVENT,
  remember: false,
  host: ORIGIN,
  ...fields,
}, PERMISSION_SENDER);

const hostsOf = async (env) => (await env.local.get('profiles')).profiles[0].hosts;

afterEach(() => {
  vi.useRealTimers();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('auto-decline timer', () => {
  let env;

  beforeEach(async () => {
    env = await bootUnlocked();
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
  });

  it('stamps deadline = now + PROMPT_TIMEOUT_MS and arms exactly one timer', async () => {
    request(env, signKind(1));
    await settle(30);

    const q = new URL(env.tabs.shown[0].url).searchParams;
    expect(Number(q.get('deadline'))).toBe(Date.now() + PROMPT_TIMEOUT_MS);
    expect(q.get('ttl')).toBe(String(PROMPT_TIMEOUT_MS));
    expect(vi.getTimerCount()).toBe(1);
  });

  it('re-arming on escalation to a tab leaves exactly one pending decline', async () => {
    const answer = track(request(env, signKind(1)));
    await settle(30);

    await vi.advanceTimersByTimeAsync(30_000);
    await env.dispatch({ kind: 'permissionSheetCompromised' }, PAGE_SENDER);
    await settle();

    expect(env.tabs.shown).toHaveLength(2);
    expect(env.tabs.shown[1].via).toBe('tab');
    expect(Number(new URL(env.tabs.shown[1].url).searchParams.get('deadline')))
      .toBe(Date.now() + PROMPT_TIMEOUT_MS);
    expect(vi.getTimerCount()).toBe(1);

    // The first deadline passes and nothing happens...
    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS - 1);
    await settle();
    expect(answer.answered).toBe(false);

    // ...then the new one declines it.
    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(answer.answered).toBe(true);
    expect(answer.value).toMatchObject({ error: 'timed_out' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a live request declines at the deadline, the sheet closes, the next request runs', async () => {
    const answer = track(request(env, signKind(1)));
    await settle(30);

    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS - 1);
    await settle();
    expect(answer.answered).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await settle();
    expect(answer.answered).toBe(true);
    expect(answer.value).toMatchObject({ error: 'timed_out' });
    expect(env.tabs.sent.map(m => m.kind)).toContain('closePermissionSheet');

    request(env, signKind(1));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a request already answered is not declined again, and its timer is gone', async () => {
    const respond = vi.fn();
    env.deliver(signKind(1), PAGE_SENDER, respond);
    await settle(30);

    await postback(env, 'denied', env.tabs.shown[0].uuid);
    await settle();
    expect(respond).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS);
    await settle();
    expect(respond).toHaveBeenCalledTimes(1);
  });

  it('an answered prompt does not eat into the next prompt\'s window', async () => {
    request(env, signKind(1));
    await settle(30);
    await vi.advanceTimersByTimeAsync(30_000);
    await postback(env, 'denied', env.tabs.shown[0].uuid);
    await settle();

    const next = track(request(env, signKind(1)));
    await settle(30);
    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS - 1);
    await settle();
    expect(next.answered).toBe(false);
  });
});

describe('only a live request can write a grant', () => {
  for (const kind of ['allowed', 'denied']) {
    it(`${kind} with an unknown uuid writes nothing`, async () => {
      const env = await bootUnlocked();
      const before = await hostsOf(env);

      expect(await postback(env, kind, crypto.randomUUID(), {
        event: { kind: 1 }, remember: true, host: 'https://other.example',
      })).toBe(true);

      await env.flushWrites();
      expect(await hostsOf(env)).toEqual(before);
    });
  }

  it('a live uuid with remember writes the allow for that kind', async () => {
    const env = await bootUnlocked();
    request(env, signKind(30078));
    await settle(30);

    await postback(env, 'allowed', env.tabs.shown[0].uuid, {
      event: { ...EVENT, kind: 30078 }, remember: true,
    });
    await settle();

    expect((await hostsOf(env))[ORIGIN]).toEqual({ 'signEvent:30078': 'allow' });
  });

  it('a live uuid with remember writes the deny and declines the request', async () => {
    const env = await bootUnlocked();
    const payload = { pubKey: 'a'.repeat(64), plainText: 'x' };
    const answer = track(request(env, { kind: 'nip04.encrypt', host: ORIGIN, payload }));
    await settle(30);

    await postback(env, 'denied', env.tabs.shown[0].uuid, {
      origKind: 'nip04.encrypt', event: payload, remember: true,
    });
    await settle();

    expect((await hostsOf(env))[ORIGIN]).toEqual({ 'nip04.encrypt': 'deny' });
    expect(answer.answered).toBe(true);
    expect(answer.value).toMatchObject({ error: 'denied' });
  });
});

describe('queue numbers', () => {
  const finish = async (env, kind, index) => {
    await postback(env, kind, env.tabs.shown[index].uuid);
    await settle(30);
  };

  it('requests waiting together count up from 1', async () => {
    const env = await bootUnlocked();
    request(env, signKind(1));
    request(env, signKind(1));
    await settle(30);
    await finish(env, 'denied', 0);

    expect(env.tabs.shown[0]).toMatchObject({ queuePosition: 1, queueTotal: 2 });
    expect(env.tabs.shown[1]).toMatchObject({ queuePosition: 2, queueTotal: 2 });
  });

  it('answering one request does not reset the count while another waits', async () => {
    const env = await bootUnlocked();
    request(env, signKind(1));
    request(env, signKind(1));
    await settle(30);
    await finish(env, 'denied', 0);

    request(env, signKind(1));
    await settle(30);
    await finish(env, 'denied', 1);

    expect(env.tabs.shown[2]).toMatchObject({ queuePosition: 3, queueTotal: 3 });
  });

  for (const [kind, label] of [['allowed', 'allow'], ['denied', 'deny']]) {
    it(`${label} on the last request starts the next one back at 1 of 1`, async () => {
      const env = await bootUnlocked();
      request(env, signKind(1));
      request(env, signKind(1));
      await settle(30);
      await finish(env, kind, 0);
      await finish(env, kind, 1);

      request(env, signKind(1));
      await settle(30);

      expect(env.tabs.shown[2]).toMatchObject({ queuePosition: 1, queueTotal: 1 });
    });
  }
});

describe('a request that has waited too long for its turn', () => {
  it('is answered instead of shown, so a late Approve never signs for nobody', async () => {
    const env = await bootUnlocked();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(1_000_000);
    const first = track(request(env, signKind(1)));
    await settle(30);
    const second = track(request(env, signKind(3)));
    await settle(30);
    const third = track(request(env, signKind(7)));
    await settle(30);
    const uuids = () => env.tabs.shown.map(s => s.uuid);
    expect(uuids()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS);
    await settle(30);
    expect(first.answered).toBe(true);
    expect(uuids()).toHaveLength(2);

    await vi.advanceTimersByTimeAsync(PROMPT_TIMEOUT_MS);
    await settle(30);
    expect(second.answered).toBe(true);
    expect(uuids()).toHaveLength(3);

    await vi.advanceTimersByTimeAsync(PROMPT_WAIT_MS - 2 * PROMPT_TIMEOUT_MS);
    expect(third.answered).toBe(false);
  });

  it('past the limit it gets a timed out error, and the next request its turn', async () => {
    const env = await bootUnlocked();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(1_000_000);
    const first = track(request(env, signKind(1)));
    await settle(30);
    const late = track(request(env, signKind(3)));
    await settle(30);

    await vi.advanceTimersByTimeAsync(39_000);
    await env.dispatch({ kind: 'permissionSheetCompromised' }, PAGE_SENDER);
    await settle(30);
    await vi.advanceTimersByTimeAsync(39_000);
    vi.setSystemTime(Date.now() + PROMPT_WAIT_MS);
    await vi.advanceTimersByTimeAsync(1_000);
    await settle(30);
    expect(first.answered).toBe(true);
    expect(late.answered).toBe(true);
    expect(late.value).toMatchObject({ error: 'timed_out' });
    expect(env.tabs.shown.map(s => s.uuid).filter((u, i, all) => all.indexOf(u) === i)).toHaveLength(1);

    const next = track(request(env, signKind(7)));
    await settle(30);
    expect(env.tabs.shown.at(-1).kind).toBe('signEvent');
    expect(next.answered).toBe(false);
  });
});
