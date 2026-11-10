/**
 * Auth events (NIP-98 kind 27235, NIP-42 kind 22242): refused when malformed or
 * aimed at NostrKey's own relay, prompted with the target named when another site.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { checkAuthTarget, grantKeyFor, parseGrantKey, canRemember } from '../src/utilities/consent-policy.js';

import { bootUnlocked, answerWithin, settle, track, ORIGIN, PUB_A, pageSender, PERMISSION_SENDER } from './helpers/boot-worker.js';

const NOW = 1_800_000_000;
const OWN = ['wss://relay.nostrkey.com'];
const http = (tags, created_at = NOW) => ({ kind: 27235, content: '', tags, created_at });
const relay = (tags, created_at = NOW) => ({ kind: 22242, content: '', tags, created_at });
const U = (u) => ['u', u];
const M = ['method', 'GET'];

describe('checkAuthTarget', () => {
  it.each([
    ['no u', http([M]), 'https://example.com', 'refuse', 'bad_url'],
    ['relative u', http([U('/api'), M]), 'https://example.com', 'refuse', 'bad_url'],
    ['http u on a public site', http([U('http://example.com/api'), M]), 'https://example.com', 'refuse', 'insecure_url'],
    ['http u off localhost', http([U('http://example.com/api'), M]), 'http://localhost:3000', 'refuse', 'insecure_url'],
    ['no method', http([U('https://example.com/api')]), 'https://example.com', 'refuse', 'no_method'],
    ['stale', http([U('https://example.com/api'), M], NOW - 61), 'https://example.com', 'refuse', 'stale'],
    ['future', http([U('https://example.com/api'), M], NOW + 61), 'https://example.com', 'refuse', 'stale'],
    ['cross-origin', http([U('https://api.other.com/x'), M]), 'https://example.com', 'prompt', 'cross_origin'],
    ['same origin', http([U('https://example.com/api'), M]), 'https://example.com', 'ok', null],
    ['http on localhost', http([U('http://localhost:3000/api'), M]), 'http://localhost:3000', 'ok', null],
    ['http on 127.0.0.1', http([U('http://127.0.0.1:8080/api'), M]), 'http://127.0.0.1:8080', 'ok', null],
    ['no relay', relay([['challenge', 'c']]), 'https://example.com', 'refuse', 'bad_relay'],
    ['https relay', relay([['relay', 'https://r.example'], ['challenge', 'c']]), 'https://example.com', 'refuse', 'insecure_relay'],
    ['ws relay public', relay([['relay', 'ws://r.example'], ['challenge', 'c']]), 'https://example.com', 'refuse', 'insecure_relay'],
    ['no challenge', relay([['relay', 'wss://r.example']]), 'https://example.com', 'refuse', 'no_challenge'],
    ['stale relay auth', relay([['relay', 'wss://r.example'], ['challenge', 'c']], NOW - 601), 'https://example.com', 'refuse', 'stale'],
    ['own bunker relay', relay([['relay', 'wss://relay.nostrkey.com/'], ['challenge', 'c']]), 'https://example.com', 'prompt', 'own_relay'],
    ['own bunker relay, uppercase', relay([['relay', 'WSS://Relay.NostrKey.COM'], ['challenge', 'c']]), 'https://example.com', 'prompt', 'own_relay'],
    ['uppercase host and default port is same origin', http([U('HTTPS://Example.COM:443/api'), M]), 'https://example.com', 'ok', null],
    ['non-default port is another site', http([U('https://example.com:8443/api'), M]), 'https://example.com', 'prompt', 'cross_origin'],
    ['localhost port mismatch is another site', http([U('http://localhost:4000/api'), M]), 'http://localhost:3000', 'prompt', 'cross_origin'],
    ['ws localhost relay', relay([['relay', 'ws://localhost:7777'], ['challenge', 'c']]), 'https://example.com', 'ok', null],
    ['valid relay auth', relay([['relay', 'wss://r.example'], ['challenge', 'c']], NOW - 500), 'https://example.com', 'ok', null],
    ['other kinds', { kind: 1, tags: [], created_at: 0 }, 'https://example.com', 'ok', null],
  ])('%s', (_name, event, origin, verdict, reason) => {
    const res = checkAuthTarget(event, origin, NOW, OWN);
    expect(res.verdict).toBe(verdict);
    expect(res.reason).toBe(reason);
  });

  it('names the target origin on a cross-origin prompt', () => {
    expect(checkAuthTarget(http([U('https://api.other.com/x?y=1'), M]), 'https://example.com', NOW, OWN).target)
      .toBe('https://api.other.com');
  });

  it('never throws on junk', () => {
    expect(checkAuthTarget(null, null, NaN).verdict).toBe('ok');
    expect(checkAuthTarget({ kind: 27235, tags: 'x' }, 'https://e.com', NOW).verdict).toBe('refuse');
  });
});

describe('target-keyed sign-in grants', () => {
  const ev = http([U('https://api.other.com/x'), M]);
  it('a cross-origin 27235 is keyed by its target and can be remembered', () => {
    const key = grantKeyFor('signEvent', ev, NOW, 'https://example.com');
    expect(key).toBe('signEvent:27235@https://api.other.com');
    expect(parseGrantKey(key)).toMatchObject({ kind: 27235, target: 'https://api.other.com' });
    expect(canRemember(key, 'signEvent')).toBe(true);
  });
  it('same origin keeps the plain key', () => {
    expect(grantKeyFor('signEvent', http([U('https://example.com/x'), M]), NOW, 'https://example.com')).toBe('signEvent:27235');
  });
  it('rejects a target that is not exactly an allowed origin', () => {
    for (const k of ['signEvent:27235@http://evil.com', 'signEvent:27235@https://a.com/x', 'signEvent:27235@junk', 'signEvent:1@https://a.com']) {
      expect(parseGrantKey(k)).toBeNull();
    }
  });
});

describe('auth events on the real worker', () => {
  afterEach(() => { delete globalThis.chrome; delete globalThis.browser; });
  const nowS = () => Math.floor(Date.now() / 1000);
  const send = (env, payload) => env.dispatch({ kind: 'signEvent', host: ORIGIN, payload }, pageSender(ORIGIN));
  const GRANT = { [ORIGIN]: { 'signEvent:27235': 'allow' } };

  it('a stored 27235 grant still signs a same-origin u', async () => {
    const env = await bootUnlocked(GRANT);
    const res = await answerWithin(send(env, http([U(`${ORIGIN}/api`), M], nowS())));
    expect(res).toMatchObject({ kind: 27235 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('a stored 27235 grant does not sign a cross-origin u: it prompts, named, with no remember', async () => {
    const env = await bootUnlocked(GRANT);
    const answer = track(send(env, http([U('https://api.other.com/x'), M], nowS())));
    await settle(30);
    expect(answer.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(1);
    const url = new URL(env.tabs.shown[0].url);
    expect(url.searchParams.get('authTarget')).toBe('api.other.com');
    expect(url.searchParams.get('authKind')).toBe('site');
    expect(url.searchParams.get('rememberable')).toBe('1');
    expect(url.searchParams.get('grantKey')).toBe('signEvent:27235@https://api.other.com');
  });

  it('a target-keyed grant signs to that target and not to another', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:27235@https://api.other.com': 'allow' } });
    expect(await answerWithin(send(env, http([U('https://api.other.com/x'), M], nowS())))).toMatchObject({ kind: 27235 });
    expect(env.tabs.shown).toEqual([]);
    const other = track(send(env, http([U('https://api.third.com/x'), M], nowS())));
    await settle(30);
    expect(other.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('revoking a target-keyed grant makes that target ask again', async () => {
    const T = 'signEvent:27235@https://api.other.com';
    const env = await bootUnlocked({ [ORIGIN]: { [T]: 'allow' } });
    const { revokePermission } = await import('../src/utilities/utils.js');
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, T);
    const answer = track(send(env, http([U('https://api.other.com/x'), M], nowS())));
    await settle(30);
    expect(answer.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('remember on a cross-site prompt stores only the target-keyed grant', async () => {
    const env = await bootUnlocked();
    const first = send(env, http([U('https://api.other.com/x'), M], nowS()));
    await settle(30);
    const { uuid } = env.tabs.shown[0];
    await env.dispatch({ kind: 'allowed', payload: uuid, origKind: 'signEvent', event: http([U('https://api.other.com/x'), M], nowS()), remember: true, host: ORIGIN }, PERMISSION_SENDER);
    await answerWithin(first);
    await settle(30);
    const { profiles } = await env.local.get('profiles');
    const keys = Object.keys(profiles[0].hosts?.[ORIGIN] ?? {});
    expect(keys).toContain('signEvent:27235@https://api.other.com');
    expect(keys).not.toContain('signEvent:27235');
  });

  it('a 22242 to NostrKey\'s own relay asks, names the relay, and cannot be remembered, grant or not', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:22242': 'allow' } });
    const answer = track(send(env, relay([['relay', 'wss://relay.nostrkey.com'], ['challenge', 'c']], nowS())));
    await settle(30);
    expect(answer.answered).toBe(false);
    const url = new URL(env.tabs.shown[0].url);
    expect(url.searchParams.get('authTarget')).toBe('relay.nostrkey.com');
    expect(url.searchParams.get('authKind')).toBe('relay');
    expect(url.searchParams.get('rememberable')).toBe('0');
  });

  it('a 22242 to another relay names it for information and still signs from a grant', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:22242': 'allow' } });
    expect(await answerWithin(send(env, relay([['relay', 'wss://r.example'], ['challenge', 'c']], nowS())))).toMatchObject({ kind: 22242 });
  });

  it('a malformed auth event is refused with no prompt, grant or not', async () => {
    const env = await bootUnlocked(GRANT);
    const res = await answerWithin(send(env, http([U(`${ORIGIN}/api`)], nowS())));
    expect(res).toMatchObject({ error: 'bad_auth_target' });
    expect(res.message).toMatch(/wrong place/);
    expect(env.tabs.shown).toEqual([]);
  });
});
