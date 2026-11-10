/**
 * Per-site grants and the request limiters on the REAL background worker: what
 * a stored grant does to a request from a page, and how a grant gets stored.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  bootUnlocked, bootWorker, deviceWrapped, answerWithin, settle, track,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER, pageSender,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';
import { encrypt, decrypt } from '../src/utilities/crypto.js';

const EVENT = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
const signKind = (kind, host = ORIGIN) => ({
  kind: 'signEvent', host, payload: { ...EVENT, kind },
});
const send = (env, message) => env.dispatch(message, pageSender(message.host ?? ORIGIN));

const postback = (env, kind, uuid, kindNumber, remember) => env.dispatch({
  kind,
  payload: uuid,
  origKind: 'signEvent',
  event: { ...EVENT, kind: kindNumber },
  remember,
  host: ORIGIN,
}, PERMISSION_SENDER);

const utils = () => import('../src/utilities/utils.js');

const POLICY = '../src/utilities/consent-policy';
/** For the rules a delete grant follows once a site can hold one. */
const allowDeleteGrants = () => vi.doMock(POLICY, async (importOriginal) => ({
  ...(await importOriginal()),
  isNeverGranted: () => false,
}));

afterEach(() => {
  vi.useRealTimers();
  vi.doUnmock(POLICY);
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('what a stored grant does to a request', () => {
  it('no grant: the request waits on a prompt', async () => {
    const env = await bootUnlocked();
    const answer = track(send(env, signKind(1)));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    expect(answer.answered).toBe(false);
  });

  it('allow: signs with no prompt', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('deny: declines with no prompt', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'deny' } });
    expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ error: 'denied' });
    expect(env.tabs.shown).toEqual([]);
  });

  it('kinds and methods are separate', async () => {
    const env = await bootUnlocked({
      [ORIGIN]: { 'signEvent:1': 'allow', 'nip04.decrypt': 'deny' },
    });
    expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
    expect(await answerWithin(send(env, {
      kind: 'nip04.decrypt', host: ORIGIN, payload: { pubKey: 'a'.repeat(64), cipherText: 'x' },
    }))).toMatchObject({ error: 'denied' });

    send(env, signKind(3));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('a grant on one origin does not reach another scheme or port', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    send(env, signKind(1, 'http://example.com'));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    await postback(env, 'denied', env.tabs.shown[0].uuid, 1, false);

    send(env, signKind(1, 'https://example.com:8443'));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a legacy grant stored under the bare host is still honoured', async () => {
    const env = await bootUnlocked({ 'example.com': { 'signEvent:1': 'allow' } });
    expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('a grant belongs to the profile it was stored on', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    const { profiles } = await env.local.get('profiles');
    await env.local.set({ profiles: [...profiles, { ...profiles[0], hosts: {} }], profileIndex: 1 });

    send(env, signKind(1));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
  });
});

describe('storing a grant from the prompt', () => {
  it('remember + allow: the next request needs no prompt', async () => {
    const env = await bootUnlocked();
    const first = send(env, signKind(7));
    await settle(30);
    await postback(env, 'allowed', env.tabs.shown[0].uuid, 7, true);
    await answerWithin(first);
    await settle(30);

    expect(await answerWithin(send(env, signKind(7)))).toMatchObject({ kind: 7 });
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('remember + deny: the next request is declined with no prompt', async () => {
    const env = await bootUnlocked();
    const first = send(env, signKind(7));
    await settle(30);
    await postback(env, 'denied', env.tabs.shown[0].uuid, 7, true);
    await answerWithin(first);
    await settle(30);

    expect(await answerWithin(send(env, signKind(7)))).toMatchObject({ error: 'denied' });
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('approving without remember stores nothing', async () => {
    const env = await bootUnlocked();
    const first = send(env, signKind(7));
    await settle(30);
    await postback(env, 'allowed', env.tabs.shown[0].uuid, 7, false);
    await answerWithin(first);
    await settle(30);

    expect((await env.local.get('profiles')).profiles[0].hosts).toEqual({});
  });
});

describe('revoking and listing, as the side panel does', () => {
  it('lists what is stored, per site', async () => {
    await bootUnlocked({
      [ORIGIN]: { 'signEvent:1': 'allow' },
      'https://iris.to': { getPubKey: 'allow', 'signEvent:7': 'deny' },
    });
    const { getPermissions } = await utils();
    const hosts = await getPermissions(0);
    expect(Object.keys(hosts).sort()).toEqual([ORIGIN, 'https://iris.to'].sort());
    expect(hosts['https://iris.to']).toEqual({ getPubKey: 'allow', 'signEvent:7': 'deny' });
  });

  it('revoking one grant asks again and leaves the site\'s other grants', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:7': 'allow' } });
    const { revokePermission, getPermission } = await utils();
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'signEvent:1');
    await env.flushWrites();

    expect(await getPermission(ORIGIN, 'signEvent:1')).toBe('ask');
    expect(await answerWithin(send(env, signKind(7)))).toMatchObject({ kind: 7 });
    send(env, signKind(1));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('revoking every grant for a site returns it to asking', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow', getPubKey: 'allow' } });
    const { revokePermission, getPermission } = await utils();
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'signEvent:1');
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'getPubKey');
    await env.flushWrites();

    expect(await getPermission(ORIGIN, 'signEvent:1')).toBe('ask');
    expect(await getPermission(ORIGIN, 'getPubKey')).toBe('ask');
  });

  it('revoke then sign at once, with no flush in between, asks', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    const { revokePermission } = await utils();
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'signEvent:1');
    const answer = track(send(env, signKind(1)));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    expect(answer.answered).toBe(false);
  });

  it('a request already past the grant check when revoke lands has signed (current behaviour)', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    const inFlight = send(env, signKind(1));
    const { revokePermission } = await utils();
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'signEvent:1');
    // The grant was read before the revoke, so this one auto-signed. Open
    // prompts are protected by revokedWhileOpen instead (see below).
    expect(await answerWithin(inFlight)).toMatchObject({ kind: 1 });
    expect(env.tabs.shown).toEqual([]);
    send(env, signKind(1));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
  });
});

describe('a remembered answer follows the identity, not the list position', () => {
  it('remember + allow writes by the held pubkey after the profile moved in the list', async () => {
    const env = await bootUnlocked();
    const first = send(env, signKind(7));
    await settle(30);
    // Another identity is inserted ahead of the one asked while the prompt is open.
    const { profiles } = await env.local.get('profiles');
    const other = { ...profiles[0], name: 'Other', pubKey: 'b'.repeat(64), hosts: {} };
    await env.local.set({ profiles: [other, profiles[0]], profileIndex: 1 });
    await postback(env, 'allowed', env.tabs.shown[0].uuid, 7, true);
    await answerWithin(first);
    await settle(30);

    const after = (await env.local.get('profiles')).profiles;
    expect(after[0].hosts).toEqual({});
    expect(after[1].hosts[ORIGIN]).toEqual({ 'signEvent:7': 'allow' });
  });

  it('remember + deny writes by the held pubkey after the profile moved in the list', async () => {
    const env = await bootUnlocked();
    const first = send(env, signKind(7));
    await settle(30);
    const { profiles } = await env.local.get('profiles');
    const other = { ...profiles[0], name: 'Other', pubKey: 'b'.repeat(64), hosts: {} };
    await env.local.set({ profiles: [other, profiles[0]], profileIndex: 1 });
    await postback(env, 'denied', env.tabs.shown[0].uuid, 7, true);
    await answerWithin(first);
    await settle(30);

    const after = (await env.local.get('profiles')).profiles;
    expect(after[0].hosts).toEqual({});
    expect(after[1].hosts[ORIGIN]).toEqual({ 'signEvent:7': 'deny' });
  });
});

describe('revoking a site while its prompt is open', () => {
  it('approve with remember answers that request only and does not recreate the grant', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    const first = send(env, signKind(7));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);

    const { revokePermission } = await utils();
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'signEvent:1');
    await env.flushWrites();

    await postback(env, 'allowed', env.tabs.shown[0].uuid, 7, true);
    expect(await answerWithin(first)).toMatchObject({ kind: 7 });
    await settle(30);

    const hosts = (await env.local.get('profiles')).profiles[0].hosts;
    expect(hosts[ORIGIN]?.['signEvent:7']).toBeUndefined();
    expect(hosts[ORIGIN]?.['signEvent:1']).toBeUndefined();
    send(env, signKind(7));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a prompt opened after the revoke may remember again', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    const { revokePermission } = await utils();
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, 'signEvent:1');
    await env.flushWrites();
    await new Promise(r => setTimeout(r, 5));

    const first = send(env, signKind(7));
    await settle(30);
    await postback(env, 'allowed', env.tabs.shown[0].uuid, 7, true);
    await answerWithin(first);
    await settle(30);
    expect((await env.local.get('profiles')).profiles[0].hosts[ORIGIN]['signEvent:7']).toBe('allow');
  });
});

describe('revoking from the Apps tab on a locked profile with no cached public key', () => {
  it('resolves by the row index and lowers the grant', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    const { profiles } = await env.local.get('profiles');
    await env.local.set({ profiles: [{ ...profiles[0], pubKey: '' }] });
    const { revokePermission } = await utils();
    await revokePermission({ pubkey: null, index: 0 }, ORIGIN, 'signEvent:1');
    await env.flushWrites();
    expect((await env.local.get('profiles')).profiles[0].hosts[ORIGIN]?.['signEvent:1']).toBeUndefined();
  });
});

describe('prompt limiters', () => {
  const LIMITED_60S = { error: 'rate_limited', message: 'Too many requests. Please wait a moment.' };
  const LIMITED_10S = { error: 'rate_limited', message: 'Too many requests. Please wait.' };

  /** Fake only the clock: the worker's storage hops still run for real. */
  async function bootAtTime() {
    const env = await bootUnlocked();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(1_000_000);
    return env;
  }

  const at = (seconds) => vi.setSystemTime(1_000_000 + seconds * 1000);

  /** Send one ungranted request. A prompt is declined at once, and said so. */
  async function ask(env, host = ORIGIN) {
    const shown = env.tabs.shown.length;
    const answer = send(env, signKind(1, host));
    await settle(30);
    if (env.tabs.shown.length === shown) return answerWithin(answer);
    await postback(env, 'denied', env.tabs.shown.at(-1).uuid, 1);
    return 'PROMPTED';
  }

  it('allows 5 requests from an origin, then refuses the 6th for the 60 s window', async () => {
    const env = await bootAtTime();
    for (let i = 0; i < 5; i++) expect(await ask(env)).toBe('PROMPTED');
    expect(await ask(env)).toEqual(LIMITED_60S);

    at(59);
    expect(await ask(env)).toEqual(LIMITED_60S);
  });

  it('the 60 s window ends and requests work again', async () => {
    const env = await bootAtTime();
    for (let i = 0; i < 6; i++) await ask(env);

    at(61);
    expect(await ask(env)).toBe('PROMPTED');
  });

  it('a limit on one origin does not touch another', async () => {
    const env = await bootAtTime();
    for (let i = 0; i < 6; i++) await ask(env);

    expect(await ask(env, 'https://other.example')).toBe('PROMPTED');
  });

  it('allows 5 requests in any 10 s, even across a fresh 60 s window', async () => {
    const env = await bootAtTime();
    for (const t of [0, 55, 56, 57, 58]) {
      at(t);
      expect(await ask(env)).toBe('PROMPTED');
    }

    // The 60 s window has rolled over, but these fall inside one 10 s span.
    at(61);
    expect(await ask(env)).toBe('PROMPTED');
    at(62);
    expect(await ask(env)).toEqual(LIMITED_10S);

    at(68);
    expect(await ask(env)).toBe('PROMPTED');
  });

  it('a limited request is answered, never left waiting behind an open prompt', async () => {
    const env = await bootUnlocked();
    for (let i = 0; i < 5; i++) send(env, signKind(1));
    await settle(30);
    expect(await answerWithin(send(env, signKind(1)))).toEqual(LIMITED_60S);
  });
});

describe('a site with a grant', () => {
  const NOW = () => Math.floor(Date.now() / 1000);
  const HASH = 'ab'.repeat(32);
  const hashes = (n) => Array.from({ length: n }, (_, i) => ['x', String(i).padStart(64, '0')]);
  const token = (verb, { ttl = 3600, x = [['x', HASH]], host = ORIGIN } = {}) => ({
    kind: 'signEvent', host,
    payload: {
      kind: 24242, content: '', created_at: NOW(),
      tags: [['t', verb], ['expiration', String(NOW() + ttl)], ...(verb === 'list' ? [] : x)],
    },
  });
  const UPLOAD = 'signEvent:24242:upload';
  const DELETE = 'signEvent:24242:delete';
  const LIMITED = { error: 'rate_limited', message: 'Too many requests. Please wait a moment.' };

  const pause = (env) => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(Date.now());
    return env;
  };

  it('ten uploads at once all sign, with nothing shown', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { [UPLOAD]: 'allow' } });
    const answers = await Promise.all(Array.from({ length: 10 }, () => answerWithin(send(env, token('upload')))));
    for (const a of answers) expect(a).toMatchObject({ kind: 24242 });
    expect(env.tabs.shown).toEqual([]);
    expect(env.tabs.sent).toEqual([]);
  });

  it('is answered at once while another site has a prompt open', async () => {
    const env = pause(await bootUnlocked({ [ORIGIN]: { [UPLOAD]: 'allow' } }));
    const other = track(send(env, signKind(7, 'https://other.example')));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);

    expect(await answerWithin(send(env, token('upload')))).toMatchObject({ kind: 24242 });
    await settle(30);
    expect(other.answered).toBe(false);
    expect(env.tabs.sent.filter(m => m.kind === 'closePermissionSheet')).toEqual([]);

    await vi.advanceTimersByTimeAsync(39_999);
    expect(other.answered).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await settle(10);
    expect(other.answered).toBe(true);
  });

  it('a grant answered during a prompt does not end that prompt\'s hold on the queue', async () => {
    const env = pause(await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } }));
    const other = track(send(env, signKind(7, 'https://other.example')));
    await settle(30);
    const waiter = track(send(env, signKind(3, 'https://other.example')));
    await settle(30);

    await answerWithin(send(env, signKind(1)));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    expect(other.answered).toBe(false);
    expect(waiter.answered).toBe(false);
  });

  it('the queue count leaves out anything answered early', async () => {
    const env = pause(await bootUnlocked({
      [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:2': 'deny' },
    }));
    const open = send(env, signKind(7, 'https://other.example'));
    await settle(30);
    await answerWithin(send(env, signKind(1)));
    await answerWithin(send(env, signKind(2)));
    await answerWithin(env.dispatch({ kind: 'signEvent', host: ORIGIN }, PAGE_SENDER));
    const queued = send(env, signKind(3, 'https://other.example'));
    await settle(30);

    await postback(env, 'denied', env.tabs.shown[0].uuid, 7);
    await open;
    await settle(30);
    expect(env.tabs.shown[1]).toMatchObject({ queuePosition: 2, queueTotal: 2 });
    await postback(env, 'denied', env.tabs.shown[1].uuid, 3);
    await queued;
  });

  it('a refusal over the grant limit also leaves the queue count', async () => {
    const env = pause(await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } }));
    for (let i = 0; i < 60; i++) await answerWithin(send(env, signKind(1)));
    const open = send(env, signKind(7, 'https://other.example'));
    await settle(30);
    expect(await answerWithin(send(env, signKind(1)))).toEqual(LIMITED);
    const queued = send(env, signKind(3, 'https://other.example'));
    await settle(30);

    await postback(env, 'denied', env.tabs.shown[0].uuid, 7);
    await open;
    await settle(30);
    expect(env.tabs.shown[1]).toMatchObject({ queuePosition: 2, queueTotal: 2 });
    await postback(env, 'denied', env.tabs.shown[1].uuid, 3);
    await queued;
  });

  it('a stored denial leaves another site\'s open prompt its full time', async () => {
    const env = pause(await bootUnlocked({ [ORIGIN]: { 'signEvent:2': 'deny' } }));
    const other = track(send(env, signKind(7, 'https://other.example')));
    await settle(30);
    await answerWithin(send(env, signKind(2)));

    await vi.advanceTimersByTimeAsync(39_999);
    expect(other.answered).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await settle(10);
    expect(other.answered).toBe(true);
  });

  it('after every early exit, the next prompt starts again at 1 of 1', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:2': 'deny' } });
    await answerWithin(send(env, signKind(1)));
    await answerWithin(send(env, signKind(2)));
    await answerWithin(env.dispatch({ kind: 'signEvent', host: ORIGIN }, PAGE_SENDER));
    send(env, signKind(7));
    await settle(30);
    expect(env.tabs.shown[0]).toMatchObject({ queuePosition: 1, queueTotal: 1 });
  });

  describe('its own limit', () => {
    const start = async (hosts) => {
      const env = await bootUnlocked(hosts);
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(1_700_000_000_000);
      return env;
    };

    it('the 61st in a minute is refused, and the window reopens', async () => {
      const env = await start({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      for (let i = 0; i < 60; i++) expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
      expect(await answerWithin(send(env, signKind(1)))).toEqual(LIMITED);
      expect(env.tabs.shown).toEqual([]);

      vi.setSystemTime(1_700_000_060_001);
      expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
    });

    it('is per site and per grant', async () => {
      const env = await start({
        [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:7': 'allow' },
        'https://other.example': { 'signEvent:1': 'allow' },
      });
      for (let i = 0; i < 60; i++) await answerWithin(send(env, signKind(1)));
      expect(await answerWithin(send(env, signKind(7)))).toMatchObject({ kind: 7 });
      expect(await answerWithin(send(env, signKind(1, 'https://other.example')))).toMatchObject({ kind: 1 });
    });

    it('allows 5 silent deletes, then refuses the 6th', async () => {
      allowDeleteGrants();
      const env = await start({ [ORIGIN]: { [DELETE]: 'allow' } });
      for (let i = 0; i < 5; i++) expect(await answerWithin(send(env, token('delete')))).toMatchObject({ kind: 24242 });
      expect(await answerWithin(send(env, token('delete')))).toEqual(LIMITED);
    });

    it('a delete takes one slot per hash', async () => {
      allowDeleteGrants();
      const env = await start({ [ORIGIN]: { [DELETE]: 'allow' } });
      expect(await answerWithin(send(env, token('delete', { x: hashes(3) })))).toMatchObject({ kind: 24242 });
      expect(await answerWithin(send(env, token('delete', { x: hashes(3) })))).toEqual(LIMITED);
      expect(await answerWithin(send(env, token('delete', { x: hashes(2) })))).toMatchObject({ kind: 24242 });
    });

    it('a delete bigger than the whole limit asks, and uses up no slots', async () => {
      allowDeleteGrants();
      const env = await start({ [ORIGIN]: { [DELETE]: 'allow' } });
      const big = track(send(env, token('delete', { x: hashes(6) })));
      await settle(30);
      expect(big.answered).toBe(false);
      expect(env.tabs.shown).toHaveLength(1);
      expect(env.savedEvents).toEqual([]);
      await env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
      for (let i = 0; i < 5; i++) expect(await answerWithin(send(env, token('delete')))).toMatchObject({ kind: 24242 });
    });

    it('asks after waiting behind a prompt too', async () => {
      allowDeleteGrants();
      const env = await start({ [ORIGIN]: { [DELETE]: 'allow' } });
      const first = track(send(env, signKind(7)));
      await settle(30);
      const big = track(send(env, token('delete', { x: hashes(6) })));
      await settle(30);
      await env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
      await settle(30);
      expect(first.answered).toBe(true);
      expect(big.answered).toBe(false);
      expect(env.tabs.shown).toHaveLength(2);
    });

    it('a delete that fits the limit but not what is left of it is refused, with no slots used', async () => {
      allowDeleteGrants();
      const env = await start({ [ORIGIN]: { [DELETE]: 'allow' } });
      expect(await answerWithin(send(env, token('delete', { x: hashes(4) })))).toMatchObject({ kind: 24242 });
      expect(await answerWithin(send(env, token('delete', { x: hashes(2) })))).toEqual(LIMITED);
      expect(await answerWithin(send(env, token('delete')))).toMatchObject({ kind: 24242 });
    });

    it('prompts are still limited at 5', async () => {
      const env = await start({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      for (let i = 0; i < 5; i++) send(env, signKind(7));
      await settle(30);
      expect(await answerWithin(send(env, signKind(7)))).toMatchObject({ error: 'rate_limited' });
    });
  });

  it('parallel first uploads: approve one with remember, the rest sign', async () => {
    const env = await bootUnlocked();
    const answers = Array.from({ length: 6 }, () => send(env, token('upload')));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);

    await env.dispatch({ kind: 'allowed', payload: env.tabs.shown[0].uuid, remember: true }, PERMISSION_SENDER);
    const settled = await Promise.all(answers.map(a => answerWithin(a)));
    expect(env.tabs.shown).toHaveLength(1);
    expect(settled.slice(0, 5).every(a => a?.kind === 24242)).toBe(true);
    // The sixth arrived inside the prompt limit before any grant existed.
    expect(settled[5]).toMatchObject({ error: 'rate_limited' });
  });

  it('a silent delete behind a prompt still counts toward its limit', async () => {
    allowDeleteGrants();
    const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: 'allow' } });
    vi.useFakeTimers({ toFake: ['Date'] });
    for (let i = 0; i < 5; i++) await answerWithin(send(env, token('delete')));
    const { profiles } = await env.local.get('profiles');
    const noGrant = { ...profiles[0], hosts: {} };
    await env.local.set({ profiles: [noGrant] });
    const queued = send(env, token('delete'));
    await settle(30);
    const behind = send(env, token('delete'));
    await settle(30);
    await env.local.set({ profiles });
    await env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
    await answerWithin(queued);
    expect(await answerWithin(behind)).toEqual(LIMITED);
  });

  describe('grants that are never acted on', () => {
    const asks = async (env, message) => {
      const before = env.tabs.shown.length;
      const answer = track(send(env, message));
      await settle(30);
      expect(answer.answered).toBe(false);
      expect(env.tabs.shown).toHaveLength(before + 1);
    };

    it('a stored kind 5, kind 62 or Blossom delete grant asks', async () => {
      for (const [key, message] of [
        ['signEvent:5', signKind(5)],
        ['signEvent:62', signKind(62)],
        [DELETE, token('delete')],
      ]) {
        const env = await bootUnlocked({ [ORIGIN]: { [key]: 'allow' } });
        await asks(env, message);
        expect(env.savedEvents).toEqual([]);
      }
    });

    it('a stored deny for those keys still declines with no prompt, and is not a grant', async () => {
      for (const [key, message] of [
        ['signEvent:5', signKind(5)],
        ['signEvent:62', signKind(62)],
        [DELETE, token('delete')],
      ]) {
        const env = await bootUnlocked({ [ORIGIN]: { [key]: 'deny' } });
        expect(await answerWithin(send(env, message))).toMatchObject({ error: 'denied' });
        expect(env.tabs.shown).toEqual([]);
        expect(env.savedEvents).toEqual([]);
      }
    });

    it('a stored deny still declines after waiting behind a prompt', async () => {
      const env = await bootUnlocked();
      const first = send(env, signKind(1));
      await settle(30);
      const queued = track(send(env, signKind(5)));
      await settle(30);
      const { profiles } = env.local._dump();
      profiles[0].hosts = { [ORIGIN]: { 'signEvent:5': 'deny' } };
      await env.local.set({ profiles });
      await env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
      await answerWithin(first);
      await settle(30);
      expect(queued.answered).toBe(true);
      expect(queued.value).toMatchObject({ error: 'denied' });
      expect(env.tabs.shown).toHaveLength(1);
    });

    it('asks after waiting behind a prompt too', async () => {
      const env = await bootUnlocked();
      const first = send(env, signKind(1));
      await settle(30);
      const queued = track(send(env, signKind(5)));
      await settle(30);
      const { profiles } = env.local._dump();
      profiles[0].hosts = { [ORIGIN]: { 'signEvent:5': 'allow' } };
      await env.local.set({ profiles });
      await env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
      await answerWithin(first);
      await settle(30);
      expect(queued.answered).toBe(false);
      expect(env.tabs.shown).toHaveLength(2);
    });

    it('a grant for another kind nobody listed keeps working', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:9999': 'allow' } });
      expect(await answerWithin(send(env, signKind(9999)))).toMatchObject({ kind: 9999 });
      expect(env.tabs.shown).toEqual([]);
    });

    it('do not count as grants at the limiter: the prompt limit applies', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:5': 'allow' } });
      for (let i = 0; i < 5; i++) send(env, signKind(5));
      await settle(30);
      expect(await answerWithin(send(env, signKind(5)))).toMatchObject({
        error: 'rate_limited',
        message: 'Too many requests. Please wait a moment.',
      });
      expect(env.savedEvents).toEqual([]);
      expect(env.tabs.shown).toHaveLength(1);
    });
  });

  describe('a token the grant does not cover', () => {
    it('too long a lifetime asks', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { [UPLOAD]: 'allow' } });
      send(env, token('upload', { ttl: 3901 }));
      await settle(30);
      expect(env.tabs.shown).toHaveLength(1);
    });

    it('one that cannot be read asks', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { [UPLOAD]: 'allow' } });
      const bad = token('upload');
      bad.payload.tags.push(['t', 'delete']);
      send(env, bad);
      await settle(30);
      expect(env.tabs.shown).toHaveLength(1);
    });

    it('another verb asks', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { [UPLOAD]: 'allow' } });
      send(env, token('media'));
      await settle(30);
      expect(env.tabs.shown).toHaveLength(1);
    });
  });
});

describe('the path for a stored answer', () => {
  it('never touches the prompt', () => {
    const source = readFileSync('src/background.js', 'utf8');
    const ask = source.slice(source.indexOf('async function ask('));
    const path = ask.slice(0, ask.indexOf('// Everything else may prompt.'));
    expect(path.length).toBeGreaterThan(200);
    expect(path).not.toMatch(/prompt\.|forceRelease|isRateLimited|permissionRateMap/);
  });
});

describe('a grant while locked', () => {
  const PASSWORD = 'correct horse battery staple';
  const NOW = () => Math.floor(Date.now() / 1000);
  const del = () => ({
    kind: 'signEvent', host: ORIGIN,
    payload: {
      kind: 24242, content: '', created_at: NOW(),
      tags: [['t', 'delete'], ['expiration', String(NOW() + 3600)], ['x', 'ab'.repeat(32)]],
    },
  });
  const DELETE = 'signEvent:24242:delete';
  const staff = (env, kind, payload) => env.dispatch({ kind, payload }, PERMISSION_SENDER);

  async function lock(env, { whileLocked }) {
    await staff(env, 'setPassword', PASSWORD);
    await env.flushWrites();
    if (whileLocked) await staff(env, 'setNostrAccessWhileLocked', true);
    await staff(env, 'lock');
    await env.flushWrites();
    return env;
  }

  async function bunker(hosts) {
    const signer = installFakeSigner();
    const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [{
        name: 'Remote', privKey: '', pubKey: '', hosts, relays: [], type: 'bunker',
        bunkerUrl: null, remotePubkey: SIGNER_PUB,
      }],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    await env.dispatch({
      kind: 'bunker.connect',
      payload: { profileIndex: 0, bunkerUrl: `bunker://${SIGNER_PUB}?relay=wss://relay.example.com` },
    });
    return { env, signer };
  }

  describe('on a remote signer', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('with the setting off, it asks', async () => {
      const { env, signer } = await bunker({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: false });
      signer.requests.length = 0;
      const r = track(send(env, signKind(1)));
      await settle(30);
      expect(env.tabs.shown).toHaveLength(1);
      expect(r.answered).toBe(false);
      expect(signer.requests.map(q => q.method)).not.toContain('sign_event');
    });

    it('the prompt it falls back to says the lock is why', async () => {
      const { env } = await bunker({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: false });
      track(send(env, signKind(1)));
      await settle(30);
      const q = new URL(env.tabs.shown[0].url).searchParams;
      expect(q.get('lockedGrant')).toBe('1');
      expect(q.get('profileType')).toBe('bunker');
    });

    it('with no grant, the prompt does not blame the lock', async () => {
      const { env } = await bunker({});
      await lock(env, { whileLocked: false });
      track(send(env, signKind(1)));
      await settle(30);
      expect(new URL(env.tabs.shown[0].url).searchParams.get('lockedGrant')).toBe('0');
    });

    it('with the setting on, it signs', async () => {
      const { env } = await bunker({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: true });
      expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1, pubkey: SIGNER_PUB });
      expect(env.tabs.shown).toEqual([]);
    });

    it('with the setting on, after a restart, it reconnects and signs', async () => {
      const { env } = await bunker({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: true });
      const next = await env.restart();
      expect(await next.dispatch({ kind: 'isLocked' })).toBe(true);
      expect(await answerWithin(send(next, signKind(1)))).toMatchObject({ kind: 1, pubkey: SIGNER_PUB });
    });

    for (const whileLocked of [false, true]) {
      it(`delete always asks (setting ${whileLocked ? 'on' : 'off'})`, async () => {
        allowDeleteGrants();
        const { env } = await bunker({ [ORIGIN]: { [DELETE]: 'allow' } });
        await lock(env, { whileLocked });
        const r = track(send(env, del()));
        await settle(30);
        expect(env.tabs.shown).toHaveLength(1);
        expect(r.answered).toBe(false);
      });

      it(`queued behind a prompt, delete still asks (setting ${whileLocked ? 'on' : 'off'})`, async () => {
        allowDeleteGrants();
        const { env } = await bunker({ [ORIGIN]: { [DELETE]: 'allow' } });
        await lock(env, { whileLocked });
        const { profiles } = await env.local.get('profiles');
        await env.local.set({ profiles: [{ ...profiles[0], hosts: {} }] });
        send(env, signKind(7));
        await settle(30);
        const queued = track(send(env, del()));
        await settle(30);
        await env.local.set({ profiles });
        await staff(env, 'denied', env.tabs.shown[0].uuid);
        await settle(30);
        expect(env.tabs.shown).toHaveLength(2);
        expect(queued.answered).toBe(false);
      });
    }

    it('queued behind a prompt with the setting off, it asks', async () => {
      const { env } = await bunker({});
      await lock(env, { whileLocked: false });
      send(env, signKind(7));
      await settle(30);
      const queued = track(send(env, signKind(1)));
      await settle(30);
      const { profiles } = await env.local.get('profiles');
      await env.local.set({ profiles: [{ ...profiles[0], hosts: { [ORIGIN]: { 'signEvent:1': 'allow' } } }] });
      await staff(env, 'denied', env.tabs.shown[0].uuid);
      await settle(30);
      expect(env.tabs.shown).toHaveLength(2);
      expect(queued.answered).toBe(false);
    });

    it('a stored denial still declines', async () => {
      const { env } = await bunker({ [ORIGIN]: { 'signEvent:1': 'deny' } });
      await lock(env, { whileLocked: false });
      expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ error: 'denied' });
      expect(env.tabs.shown).toEqual([]);
    });
  });

  describe('on a local key', () => {
    it('it is refused with the locked notice, not a fast answer', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: false });
      expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ error: 'locked' });
      expect(env.tabs.sent.map(m => m.kind)).toEqual(['showLockedSheet']);
    });

    it('the locked notice stays capped by the prompt limit', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: false });
      for (let i = 0; i < 5; i++) expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ error: 'locked' });
      expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ error: 'rate_limited' });
      expect(env.tabs.sent.filter(m => m.kind === 'showLockedSheet')).toHaveLength(5);
    });

    it('with the setting on and the key held, it signs', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: true });
      expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
      expect(env.tabs.sent).toEqual([]);
    });

    it('with the setting on, delete asks', async () => {
      allowDeleteGrants();
      const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: 'allow' } });
      await lock(env, { whileLocked: true });
      const r = track(send(env, del()));
      await settle(30);
      expect(env.tabs.shown).toHaveLength(1);
      expect(r.answered).toBe(false);
    });

    it('with the setting on but the key not held, it is refused', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await lock(env, { whileLocked: true });
      const next = await env.restart();
      expect(await answerWithin(send(next, signKind(1)))).toMatchObject({ error: 'locked' });
    });

    it('methods that need no key still work', async () => {
      const env = await bootUnlocked({ [ORIGIN]: { getPubKey: 'allow' } });
      await lock(env, { whileLocked: false });
      expect(await answerWithin(send(env, { kind: 'getPubKey', host: ORIGIN }))).toBe(PUB_A);
    });
  });

  describe('a restored backup', () => {
    /** An encrypted backup of `settings`, restored into a fresh vault. */
    async function restore(settings) {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
      await staff(env, 'setPassword', PASSWORD);
      await env.flushWrites();
      const { envelope } = await staff(env, 'backup.export');
      const plain = JSON.parse(await decrypt(JSON.stringify(envelope.payload), PASSWORD));
      delete plain.nostrAccessWhileLocked;
      const payload = JSON.parse(await encrypt(JSON.stringify({ ...plain, ...settings }), PASSWORD));
      const res = await staff(env, 'backup.import', { envelope: { ...envelope, payload }, password: PASSWORD });
      expect(res).toMatchObject({ success: true });
      await env.flushWrites();
      return env;
    }
    const setting = (env) => env.dispatch({ kind: 'getNostrAccessWhileLocked' }, PERMISSION_SENDER);

    it('leaves out grants that are never acted on and keeps the rest', async () => {
      const hosts = {
        [ORIGIN]: {
          'signEvent:5': 'allow', 'signEvent:62': 'allow', 'signEvent:24242:delete': 'allow',
          'signEvent:1': 'allow', 'signEvent:9999': 'allow',
        },
        'https://denied.example': { 'signEvent:5': 'deny', 'signEvent:24242:delete': 'deny' },
      };
      const env = await bootUnlocked();
      await staff(env, 'setPassword', PASSWORD);
      await env.flushWrites();
      const { envelope } = await staff(env, 'backup.export');
      const plain = JSON.parse(await decrypt(JSON.stringify(envelope.payload), PASSWORD));
      plain.profiles[0].hosts = hosts;
      const payload = JSON.parse(await encrypt(JSON.stringify(plain), PASSWORD));
      await staff(env, 'backup.import', { envelope: { ...envelope, payload }, password: PASSWORD });
      await env.flushWrites();
      expect(env.local._dump().profiles[0].hosts).toEqual({
        [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:9999': 'allow' },
        'https://denied.example': { 'signEvent:5': 'deny', 'signEvent:24242:delete': 'deny' },
      });
    });

    it('with no value for signing while locked keeps it off', async () => {
      const env = await restore({});
      expect(await setting(env)).toBe(false);
      expect(env.local._dump().nostrAccessWhileLocked).toBe(false);
    });

    it('with a stray value keeps it off', async () => {
      expect(await setting(await restore({ nostrAccessWhileLocked: 'yes' }))).toBe(false);
    });

    it('with it off keeps it off', async () => {
      expect(await setting(await restore({ nostrAccessWhileLocked: false }))).toBe(false);
    });

    it('with it on keeps it on', async () => {
      const env = await restore({ nostrAccessWhileLocked: true });
      expect(await setting(env)).toBe(true);
      expect(env.local._dump().nostrAccessWhileLocked).toBe(true);
    });

    it('a missing value does not replace the off default on the next start', async () => {
      const env = await restore({});
      const next = await env.restart();
      expect(await setting(next)).toBe(false);
    });
  });
});
