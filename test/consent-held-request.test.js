/**
 * What a prompt acts on comes from the worker's own record of the request. The
 * permission surface contributes the uuid and the remember choice, nothing else.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { getPublicKeySync } from 'nostr-crypto-utils';
import {
  bootUnlocked, bootWorker, deviceWrapped, localProfile, answerWithin, settle, track,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';

const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
const PUB_B = getPublicKeySync(HEX_B);
const OTHER = 'https://other.example';
const NOW = () => Math.floor(Date.now() / 1000);
const HASH = 'ab'.repeat(32);

const EVENT = { kind: 7, content: 'held', tags: [], created_at: 1700000000 };
const sign = (kind = 7) => ({ kind: 'signEvent', host: ORIGIN, payload: { ...EVENT, kind } });
const send = (env, message) => env.dispatch(message, PAGE_SENDER);
const blossom = (verb, extra = []) => ({
  kind: 'signEvent', host: ORIGIN,
  payload: {
    kind: 24242, content: 'note', created_at: NOW(),
    tags: [['t', verb], ['expiration', String(NOW() + 3600)], ['x', HASH], ...extra],
  },
});
const post = (env, kind, uuid, fields = {}) => env.dispatch({ kind, payload: uuid, ...fields }, PERMISSION_SENDER);
const profiles = async (env) => (await env.local.get('profiles')).profiles;
const heldCount = async () => (await import('../src/utilities/held-requests.js')).heldCount();

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

async function bootTwo(active = 0, seed = {}) {
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, HEX_B);
  return bootWorker({
    profiles: [localProfile(blobs[0]), localProfile(blobs[1], {}, { name: 'P2', pubKey: PUB_B })],
    profileIndex: active, isEncrypted: false, autoLockMinutes: 0,
    deviceKeySeed, deviceKeyStrategy, ...seed,
  });
}

describe('fields in an approval other than uuid and remember', () => {
  it('the held event is signed and the held key is written', async () => {
    const env = await bootUnlocked();
    const first = send(env, sign(7));
    await settle(30);
    await post(env, 'allowed', env.tabs.shown[0].uuid, {
      remember: true,
      origKind: 'getPubKey',
      event: { ...EVENT, kind: 1, content: 'swapped' },
      host: OTHER,
    });
    const signed = await answerWithin(first);
    await env.flushWrites();
    expect(signed).toMatchObject({ kind: 7, content: 'held', pubkey: PUB_A });
    expect((await profiles(env))[0].hosts).toEqual({ [ORIGIN]: { 'signEvent:7': 'allow' } });
  });

  it('a denial writes the held key', async () => {
    const env = await bootUnlocked();
    const first = send(env, sign(7));
    await settle(30);
    await post(env, 'denied', env.tabs.shown[0].uuid, {
      remember: true, origKind: 'signEvent', event: { kind: 1 }, host: OTHER,
    });
    expect(await answerWithin(first)).toBeUndefined();
    await env.flushWrites();
    expect((await profiles(env))[0].hosts).toEqual({ [ORIGIN]: { 'signEvent:7': 'deny' } });
  });
});

describe('what may not be remembered', () => {
  const rows = {
    'a delete token': blossom('delete'),
    'a Blossom token with no expiry': {
      kind: 'signEvent', host: ORIGIN,
      payload: { kind: 24242, content: '', created_at: NOW(), tags: [['t', 'upload'], ['x', HASH]] },
    },
    'kind 5': sign(5),
    'kind 62': sign(62),
    'an unlisted kind': sign(9999),
  };
  for (const [name, request] of Object.entries(rows)) {
    for (const answer of ['allowed', 'denied']) {
      it(`${name}, ${answer}: writes nothing`, async () => {
        const env = await bootUnlocked();
        const first = send(env, request);
        await settle(30);
        await post(env, answer, env.tabs.shown[0].uuid, { remember: true });
        await answerWithin(first);
        await env.flushWrites();
        expect((await profiles(env))[0].hosts).toEqual({});
      });
    }
  }

  it('an upload token is remembered under its verb', async () => {
    const env = await bootUnlocked();
    const first = send(env, blossom('upload'));
    await settle(30);
    await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
    await answerWithin(first);
    await env.flushWrites();
    expect((await profiles(env))[0].hosts).toEqual({ [ORIGIN]: { 'signEvent:24242:upload': 'allow' } });
  });

  it('a stored grant for the bare kind does not reach a Blossom token', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:24242': 'allow' } });
    send(env, blossom('upload'));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
  });
});

describe('which identity a remembered choice lands on', () => {
  it('a switch while the prompt is open writes to the identity that was asked', async () => {
    const env = await bootTwo(0);
    const first = send(env, sign(7));
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
    await answerWithin(first);
    await env.flushWrites();
    const [a, b] = await profiles(env);
    expect(a.hosts).toEqual({ [ORIGIN]: { 'signEvent:7': 'allow' } });
    expect(b.hosts).toEqual({});
  });

  it('a switch while queued writes to the identity shown, never the earlier one', async () => {
    const env = await bootTwo(0);
    const first = send(env, sign(3));
    await settle(30);
    const queued = send(env, sign(7));
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await answerWithin(first);
    await settle(30);

    await post(env, 'allowed', env.tabs.shown[1].uuid, { remember: true });
    await answerWithin(queued);
    await env.flushWrites();
    const [a, b] = await profiles(env);
    expect(a.hosts).toEqual({});
    expect(b.hosts).toEqual({ [ORIGIN]: { 'signEvent:7': 'allow' } });
  });

  it('nothing is written if that slot now holds another identity', async () => {
    const env = await bootTwo(1);
    const first = send(env, sign(7));
    await settle(30);
    const list = await profiles(env);
    await env.local.set({ profiles: [list[0], { ...list[1], pubKey: PUB_A }] });
    await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
    await answerWithin(first);
    await env.flushWrites();
    expect((await profiles(env))[1].hosts).toEqual({});
  });

  it('a remote signer slot pointed at another signer writes nothing', async () => {
    const remote = {
      name: 'Remote', privKey: '', pubKey: '', hosts: {}, relays: [], type: 'bunker',
      bunkerUrl: null, remotePubkey: SIGNER_PUB,
    };
    const env = await bootWorker({
      profiles: [remote], profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
    });
    send(env, sign(7));
    await settle(30);
    await env.local.set({ profiles: [{ ...remote, remotePubkey: PUB_B }] });
    await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
    await settle(30);
    await env.flushWrites();
    expect((await profiles(env))[0].hosts).toEqual({});
  });

  it('a remote signer profile with no local pubKey is remembered', async () => {
    const signer = installFakeSigner();
    const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [{
        name: 'Remote', privKey: '', pubKey: '', hosts: {}, relays: [], type: 'bunker',
        bunkerUrl: null, remotePubkey: SIGNER_PUB,
      }],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    await env.dispatch({
      kind: 'bunker.connect',
      payload: { profileIndex: 0, bunkerUrl: `bunker://${SIGNER_PUB}?relay=wss://relay.example.com` },
    });
    const first = send(env, sign(7));
    await settle(30);
    await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
    expect(await answerWithin(first)).toMatchObject({ kind: 7, pubkey: SIGNER_PUB });
    await env.flushWrites();
    expect((await profiles(env))[0].hosts).toEqual({ [ORIGIN]: { 'signEvent:7': 'allow' } });
    expect(signer.requests.map(r => r.method)).toContain('sign_event');
  });
});

describe('a remember write that fails', () => {
  it('logs, still signs, and the next prompt shows', async () => {
    const env = await bootUnlocked();
    const first = send(env, sign(7));
    await settle(30);
    const queued = track(send(env, sign(3)));
    await settle(30);
    const { set } = env.chrome.storage.local;
    env.chrome.storage.local.set = async (items) => {
      if (items.profiles) throw new Error('quota');
      return set(items);
    };
    expect(await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true })).toBe(true);
    expect(await answerWithin(first)).toMatchObject({ kind: 7 });
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
    expect(queued.answered).toBe(false);
  });

  it('on a denial, the request is still declined', async () => {
    const env = await bootUnlocked();
    const first = track(send(env, sign(7)));
    await settle(30);
    env.chrome.storage.local.set = async () => { throw new Error('quota'); };
    await post(env, 'denied', env.tabs.shown[0].uuid, { remember: true });
    await settle(10);
    expect(first.answered).toBe(true);
  });
});

describe('nothing stays held', () => {
  const exits = {
    'approved': async (env) => { const r = send(env, sign(7)); await settle(30); await post(env, 'allowed', env.tabs.shown[0].uuid); await answerWithin(r); },
    'declined': async (env) => { const r = send(env, sign(7)); await settle(30); await post(env, 'denied', env.tabs.shown[0].uuid); await answerWithin(r); },
    'closed': async (env) => { const r = send(env, sign(7)); await settle(30); await post(env, 'closePrompt', env.tabs.shown[0].uuid); await answerWithin(r); },
    'a stored grant': async (env) => { await answerWithin(send(env, sign(1))); },
    'a stored denial': async (env) => { await answerWithin(send(env, sign(2))); },
    'an invalid request': async (env) => { await answerWithin(send(env, { kind: 'signEvent', host: ORIGIN })); },
    'a prompt that cannot open': async (env) => {
      env.tabs.sheet = false; env.tabs.createError = new Error('no');
      await answerWithin(send(env, sign(7)));
    },
    'the grant limit': async (env) => {
      for (let i = 0; i < 60; i++) await answerWithin(send(env, sign(1)));
      expect(await answerWithin(send(env, sign(1)))).toMatchObject({ error: 'rate_limited' });
    },
    'the prompt limit': async (env) => {
      for (let i = 0; i < 5; i++) {
        const r = send(env, sign(7));
        await settle(30);
        await post(env, 'denied', env.tabs.shown.at(-1).uuid);
        await answerWithin(r);
      }
      expect(await answerWithin(send(env, sign(7)))).toMatchObject({ error: 'rate_limited' });
    },
  };
  for (const [name, run] of Object.entries(exits)) {
    it(name, async () => {
      const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:2': 'deny' } });
      await run(env);
      expect(await heldCount()).toBe(0);
    });
  }

  it('a locked refusal', async () => {
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
    await env.dispatch({ kind: 'setPassword', payload: 'correct horse battery staple' }, PERMISSION_SENDER);
    await env.dispatch({ kind: 'lock' }, PERMISSION_SENDER);
    expect(await answerWithin(send(env, sign(1)))).toMatchObject({ error: 'locked' });
    expect(await heldCount()).toBe(0);
  });

  it('every path that forgets a request also drops what was held', () => {
    const source = readFileSync('src/background.js', 'utf8');
    const forgets = [...source.matchAll(/delete validations\[/g)];
    expect(forgets.length).toBe(3);
    for (const fn of ['settleRequest', 'complete', 'deny']) {
      const body = source.match(new RegExp(`function ${fn}\\([\\s\\S]*?\\n}`))[0];
      expect(body).toContain('delete validations[');
      expect(body).toContain('takeHeld(');
    }
  });
});

describe('a request with no identity to remember against', () => {
  it('stores nothing, for an allow or a deny', async () => {
    for (const verdict of ['allowed', 'denied']) {
      const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
      const env = await bootWorker({
        profiles: [{
          name: 'Remote', privKey: '', pubKey: '', hosts: {}, relays: [], type: 'bunker',
          bunkerUrl: null, remotePubkey: null,
        }],
        profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
      });
      const pending = send(env, sign(7));
      await settle(30);
      await post(env, verdict, env.tabs.shown[0].uuid, { remember: true });
      await answerWithin(pending);
      await env.flushWrites();
      expect((await profiles(env))[0].hosts).toEqual({});
    }
  });

  it('two profiles with no cached key each keep their own choice', async () => {
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, HEX_B);
    const env = await bootWorker({
      profiles: [
        localProfile(blobs[0], {}, { pubKey: '' }),
        localProfile(blobs[1], {}, { name: 'P2', pubKey: '' }),
      ],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    const pending = send(env, sign(7));
    await settle(30);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
    await answerWithin(pending);
    await env.flushWrites();
    expect((await profiles(env))[0].hosts).toEqual({});
  });
});
