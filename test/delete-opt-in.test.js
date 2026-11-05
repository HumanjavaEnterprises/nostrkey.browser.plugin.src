/**
 * Delete opt-in on the REAL worker: a media server delete always asks unless the
 * site is opted in for this identity in the connected sites list. An opted-in
 * delete signs with no prompt, is logged in event history, takes one limit slot
 * per blob, and never signs while locked. Only the list can opt a site in.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  bootUnlocked, bootWorker, deviceWrapped, answerWithin, settle, track,
  HEX_A, PUB_A, ORIGIN, PERMISSION_SENDER, pageSender,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';
import {
  grantState, grantTimeLeft, isOptedIn, optInValue, resolveGrant, canRemember, grantChoices,
} from '../src/utilities/consent-policy.js';

const DELETE = 'signEvent:24242:delete';
const PASSWORD = 'correct horse battery staple';
const NOW = () => Math.floor(Date.now() / 1000);
const del = (n = 1) => ({
  kind: 'signEvent', host: ORIGIN,
  payload: {
    kind: 24242, content: '', created_at: NOW(),
    tags: [['t', 'delete'], ['expiration', String(NOW() + 3600)],
      ...Array.from({ length: n }, (_, i) => ['x', String(i).padStart(64, '0')])],
  },
});
const send = (env, m) => env.dispatch(m, pageSender(ORIGIN));
const staff = (env, kind, payload) => env.dispatch({ kind, payload }, PERMISSION_SENDER);
const optIn = (choice = '1h') => optInValue(choice, NOW());

async function lock(env, { whileLocked }) {
  await staff(env, 'setPassword', PASSWORD);
  await env.flushWrites();
  if (whileLocked) await staff(env, 'setNostrAccessWhileLocked', true);
  await staff(env, 'lock');
  await env.flushWrites();
}

async function asks(env, message) {
  const r = track(send(env, message));
  await settle(30);
  expect(env.tabs.shown).toHaveLength(1);
  expect(r.answered).toBe(false);
  expect(env.savedEvents).toEqual([]);
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('what an opt-in is (Ring 0)', () => {
  const now = 1_700_000_000;
  it('only a list opt-in under the delete key counts; a plain allow does not', () => {
    expect(isOptedIn(DELETE, optInValue('1h', now), now)).toBe(true);
    expect(isOptedIn(DELETE, optInValue('forever', now), now)).toBe(true);
    expect(isOptedIn(DELETE, 'allow', now)).toBe(false);
    expect(isOptedIn(DELETE, { v: 'allow', exp: now + 60, d: '1h' }, now)).toBe(false);
    expect(isOptedIn('signEvent:5', optInValue('1h', now), now)).toBe(false);
    expect(isOptedIn(DELETE, optInValue('1h', now), now + 3600)).toBe(false);
  });
  it('the list shows an opt-in as allowed, with time left, and Forever with none', () => {
    expect(grantState(DELETE, optInValue('1h', now), now)).toBe('allow');
    expect(grantState(DELETE, 'allow', now)).toBe('ask');
    expect(grantState('signEvent:5', optInValue('forever', now), now)).toBe('ask');
    expect(grantTimeLeft(optInValue('1h', now), now)).toBe('1 hour left');
    expect(grantTimeLeft(optInValue('forever', now), now)).toBeNull();
  });
  it('a Forever value without the opt-in mark, or with an expiry, is not an allow', () => {
    expect(resolveGrant({ v: 'allow', d: 'forever' }, now)).toBe('ask');
    expect(resolveGrant({ v: 'allow', d: 'forever', optIn: true, exp: now + 10 }, now)).toBe('ask');
  });
  it('a prompt still cannot remember a delete; kinds 5 and 62 cannot be opted in', () => {
    expect(canRemember(DELETE, 'signEvent')).toBe(false);
    expect(grantChoices('signEvent:5')).toEqual(['ask', 'deny']);
    expect(grantChoices('signEvent:62')).toEqual(['ask', 'deny']);
  });
});

describe('a media server delete on the worker (Ring 2)', () => {
  it('with no list entry, it asks', async () => {
    await asks(await bootUnlocked(), del());
  });

  it('a plain allow, as an older version stored it, still asks', async () => {
    await asks(await bootUnlocked({ [ORIGIN]: { [DELETE]: 'allow' } }), del());
  });

  it('a kind 5 shaped like an opt-in still asks', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:5': optIn() } });
    await asks(env, { kind: 'signEvent', host: ORIGIN, payload: { kind: 5, content: '', tags: [], created_at: NOW() } });
  });

  it('opted in from the list, it signs with no prompt and is logged in event history', async () => {
    const env = await bootUnlocked();
    const { writeListGrant } = await import('../src/utilities/grant-list.js');
    expect(await writeListGrant(PUB_A, ORIGIN, DELETE, '1h')).toBeNull();
    await env.flushWrites();
    expect(await answerWithin(send(env, del()))).toMatchObject({ kind: 24242 });
    expect(await answerWithin(send(env, del()))).toMatchObject({ kind: 24242 });
    expect(env.tabs.shown).toEqual([]);
    expect(env.savedEvents).toHaveLength(2);
    for (const e of env.savedEvents) {
      expect(e.event.kind).toBe(24242);
      expect(e.metadata.host).toBe(ORIGIN);
    }
  });

  it('opted in Forever, it signs with no prompt', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: optIn('forever') } });
    expect(await answerWithin(send(env, del()))).toMatchObject({ kind: 24242 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('an opt-in that ran out asks', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: { ...optInValue('1h', NOW() - 4000) } } });
    await asks(env, del());
  });

  it('takes one slot per blob: five a minute, then it is refused', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: optIn() } });
    expect(await answerWithin(send(env, del(3)))).toMatchObject({ kind: 24242 });
    expect(await answerWithin(send(env, del(2)))).toMatchObject({ kind: 24242 });
    expect(await answerWithin(send(env, del(1)))).toMatchObject({ error: 'rate_limited' });
    expect(env.savedEvents).toHaveLength(2);
  });

  it('a prompt answered with remember stores nothing for a delete', async () => {
    const env = await bootUnlocked();
    const r = track(send(env, del()));
    await settle(30);
    await env.dispatch({
      kind: 'allowed', payload: env.tabs.shown[0].uuid, origKind: 'signEvent',
      event: del().payload, remember: true, rememberFor: 'forever', host: ORIGIN,
    }, PERMISSION_SENDER);
    await settle(30);
    expect(r.answered).toBe(true);
    await env.flushWrites();
    expect((await env.local.get('profiles')).profiles[0].hosts?.[ORIGIN]?.[DELETE]).toBeUndefined();
  });

  it('a restored backup leaves the opt-in out', async () => {
    const { withoutNeverGranted } = await import('../src/utilities/consent-policy.js');
    const [p] = withoutNeverGranted([{ hosts: { [ORIGIN]: { [DELETE]: optIn('forever') } } }]);
    expect(p.hosts[ORIGIN]).toEqual({});
  });
});

describe('an opted-in delete while locked', () => {
  it('on a local key with signing while locked on, it is not signed', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: optIn() } });
    await lock(env, { whileLocked: true });
    const r = track(send(env, del()));
    await settle(30);
    expect(env.savedEvents).toEqual([]);
    if (r.answered) expect(r.value).not.toMatchObject({ kind: 24242 });
  });

  it('on a local key with the setting off, it is refused as locked', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { [DELETE]: optIn() } });
    await lock(env, { whileLocked: false });
    expect(await answerWithin(send(env, del()))).toMatchObject({ error: 'locked' });
    expect(env.savedEvents).toEqual([]);
  });

  it('on a remote signer with signing while locked on, it asks', async () => {
    const signer = installFakeSigner();
    const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [{
        name: 'Remote', privKey: '', pubKey: '', hosts: { [ORIGIN]: { [DELETE]: optIn() } }, relays: [], type: 'bunker',
        bunkerUrl: null, remotePubkey: SIGNER_PUB,
      }],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    await env.dispatch({
      kind: 'bunker.connect',
      payload: { profileIndex: 0, bunkerUrl: `bunker://${SIGNER_PUB}?relay=wss://relay.example.com` },
    });
    await lock(env, { whileLocked: true });
    signer.requests.length = 0;
    const r = track(send(env, del()));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    expect(r.answered).toBe(false);
    expect(signer.requests.map(q => q.method)).not.toContain('sign_event');
  });
});
