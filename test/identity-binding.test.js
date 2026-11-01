/**
 * A request is answered by the identity whose grant or prompt authorised it, or
 * not at all. The sweeps below move the active profile before every storage read
 * a request makes, so each read is proven in turn. Real worker.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { getPublicKeySync, hexToBytes, nip44 } from 'nostr-crypto-utils';
import {
  bootWorker, deviceWrapped, localProfile, answerWithin, settle, track,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';

const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
const PUB_B = getPublicKeySync(HEX_B);
const SIGN_1 = { 'signEvent:1': 'allow' };
const NOW = () => Math.floor(Date.now() / 1000);
const RELAY = 'wss://relay.example.com/';

const sign = (kind = 1, tags = [], host = ORIGIN) => ({
  kind: 'signEvent', host, payload: { kind, content: 'x', tags, created_at: NOW() },
});
const send = (env, message) => env.dispatch(message, PAGE_SENDER);
const post = (env, kind, uuid, extra = {}) => env.dispatch({ kind, payload: uuid, ...extra }, PERMISSION_SENDER);

async function bootTwo(hostsA = {}, hostsB = {}, seed = {}) {
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, HEX_B);
  return bootWorker({
    profiles: [
      localProfile(blobs[0], hostsA, { relays: [{ url: 'wss://a.example.com/', read: true, write: true }] }),
      localProfile(blobs[1], hostsB, { name: 'P2', pubKey: PUB_B, relays: [{ url: 'wss://b.example.com/', read: true, write: true }] }),
    ],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
    deviceKeySeed, deviceKeyStrategy, ...seed,
  });
}

/** Run `act` just before the nth storage read from now on. */
function beforeRead(env, n, act) {
  const raw = env.chrome.storage.local;
  const read = raw.get.bind(raw);
  let reads = 0;
  raw.get = (...args) => {
    if (reads++ === n) return Promise.resolve(act()).then(() => read(...args));
    return read(...args);
  };
}
const switchTo = (env, index) => () => env.chrome.storage.local.set({ profileIndex: index });

const signedBy = (answer) => {
  if (answer === 'NO_ANSWER') return 'prompt';
  if (answer?.sig) return answer.pubkey === PUB_A ? 'A' : answer.pubkey === PUB_B ? 'B' : 'other';
  return 'error';
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('a request answered from a grant', () => {
  it('signs only as the identity that was granted, wherever the active profile moves', async () => {
    const outcomes = new Set();
    for (let n = 0; n < 14; n++) {
      const env = await bootTwo({ [ORIGIN]: SIGN_1 });
      beforeRead(env, n, switchTo(env, 1));
      const answer = await answerWithin(send(env, sign()), 400);
      outcomes.add(signedBy(answer));
      expect(env.savedEvents.every(e => e.event.pubkey === PUB_A)).toBe(true);
    }
    expect(outcomes.has('A')).toBe(true);
    expect(outcomes.has('prompt')).toBe(true);
    expect(outcomes.has('B')).toBe(false);
    expect(outcomes.has('other')).toBe(false);
  }, 60_000);

  it('a grant held only by the profile switched to signs as that profile', async () => {
    const outcomes = new Set();
    for (let n = 0; n < 14; n++) {
      const env = await bootTwo({}, { [ORIGIN]: SIGN_1 });
      beforeRead(env, n, switchTo(env, 1));
      outcomes.add(signedBy(await answerWithin(send(env, sign()), 400)));
    }
    expect(outcomes.has('A')).toBe(false);
    expect(outcomes.has('other')).toBe(false);
  }, 60_000);

  it('encrypts as the identity that was granted', async () => {
    const encrypt = { kind: 'nip44.encrypt', host: ORIGIN, payload: { pubKey: PUB_B, plainText: 'hello' } };
    for (let n = 0; n < 14; n++) {
      const env = await bootTwo({ [ORIGIN]: { 'nip44.encrypt': 'allow' } });
      beforeRead(env, n, switchTo(env, 1));
      const answer = await answerWithin(send(env, encrypt), 400);
      if (typeof answer !== 'string' || answer === 'NO_ANSWER') continue;
      const key = nip44.v2.utils.getConversationKey(hexToBytes(HEX_B), PUB_A);
      expect(nip44.v2.decrypt(answer, key)).toBe('hello');
    }
  }, 60_000);

  it('answers with the public key and relays of the identity that was granted', async () => {
    for (let n = 0; n < 12; n++) {
      const env = await bootTwo({ [ORIGIN]: { getPubKey: 'allow', getRelays: 'allow' } });
      beforeRead(env, n, switchTo(env, 1));
      const pub = await answerWithin(send(env, { kind: 'getPubKey', host: ORIGIN, payload: {} }), 400);
      if (pub !== 'NO_ANSWER') expect(pub).toBe(PUB_A);
    }
    for (let n = 0; n < 12; n++) {
      const env = await bootTwo({ [ORIGIN]: { getRelays: 'allow' } });
      beforeRead(env, n, switchTo(env, 1));
      const relays = await answerWithin(send(env, { kind: 'getRelays', host: ORIGIN, payload: {} }), 400);
      if (relays !== 'NO_ANSWER') expect(Object.keys(relays)).toEqual(['wss://a.example.com/']);
    }
  }, 60_000);

  it('adds a relay to the identity that was granted', async () => {
    for (let n = 0; n < 12; n++) {
      const env = await bootTwo({ [ORIGIN]: { addRelay: 'allow' } });
      beforeRead(env, n, switchTo(env, 1));
      await answerWithin(send(env, { kind: 'addRelay', host: ORIGIN, payload: { url: RELAY } }), 400);
      await env.flushWrites();
      const [, b] = env.local._dump().profiles;
      expect(b.relays.map(r => r.url)).toEqual(['wss://b.example.com/']);
    }
  }, 60_000);

  it('a profile removed underneath a grant does not sign as the one that took its place', async () => {
    for (let n = 0; n < 14; n++) {
      const env = await bootTwo({ [ORIGIN]: SIGN_1 });
      const { deleteProfile } = await import('../src/utilities/utils.js');
      beforeRead(env, n, () => deleteProfile(0));
      const answer = await answerWithin(send(env, sign()), 400);
      expect(signedBy(answer)).not.toBe('B');
    }
  }, 60_000);
});

it('a relay added under a grant never lands on the profile that took its place', async () => {
  for (let n = 0; n < 12; n++) {
    const env = await bootTwo({ [ORIGIN]: { addRelay: 'allow' } });
    const { deleteProfile } = await import('../src/utilities/utils.js');
    beforeRead(env, n, () => deleteProfile(0));
    await answerWithin(send(env, { kind: 'addRelay', host: ORIGIN, payload: { url: RELAY } }), 400);
    await env.flushWrites();
    const left = env.local._dump().profiles;
    expect(left[left.length - 1].relays.map(r => r.url)).toEqual(['wss://b.example.com/']);
  }
}, 60_000);

describe('a request that waited behind a prompt', () => {
  it('a token that runs out while waiting cannot store a grant', async () => {
    const env = await bootTwo();
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = NOW();
    const first = send(env, sign(1));
    await settle(30);
    const queued = track(send(env, sign(24242, [
      ['t', 'upload'], ['expiration', String(start + 5)], ['x', '0'.repeat(64)],
    ])));
    await settle(30);
    vi.setSystemTime((start + 10) * 1000);
    await post(env, 'denied', env.tabs.shown[0].uuid);
    await answerWithin(first, 400);
    await settle(40);
    expect(env.tabs.shown).toHaveLength(2);
    await post(env, 'allowed', env.tabs.shown[1].uuid, { remember: true });
    await settle(30);
    await env.flushWrites();
    expect(queued.answered).toBe(true);
    expect(env.local._dump().profiles[0].hosts).toEqual({});
  });

  it('answers from the identity holding the grant, or asks, wherever the active profile moves', async () => {
    const outcomes = new Set();
    for (let n = 0; n < 16; n++) {
      const env = await bootTwo();
      const first = send(env, sign());
      await settle(30);
      const queued = track(send(env, sign()));
      await settle(30);
      beforeRead(env, n, switchTo(env, 1));
      await post(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
      await answerWithin(first, 400);
      await env.flushWrites();
      await settle(40);
      if (queued.answered) outcomes.add(signedBy(queued.value));
      else outcomes.add('prompt');
      expect(env.savedEvents.filter(e => e.event.pubkey === PUB_B)).toEqual([]);
    }
    expect(outcomes.has('B')).toBe(false);
    expect(outcomes.has('other')).toBe(false);
    expect(outcomes.has('prompt')).toBe(true);
  }, 60_000);

  it('a token that runs out while waiting asks instead of signing, and cannot be remembered', async () => {
    const env = await bootTwo({ [ORIGIN]: {} });
    vi.useFakeTimers({ toFake: ['Date'] });
    const start = NOW();
    const { profiles } = env.local._dump();
    profiles[0].hosts[ORIGIN] = {};
    await env.local.set({ profiles });

    const first = send(env, sign(1));
    await settle(30);
    const upload = sign(24242, [
      ['t', 'upload'], ['expiration', String(start + 5)], ['x', '0'.repeat(64)],
    ]);
    const queued = track(send(env, upload));
    await settle(30);

    const fresh = env.local._dump().profiles;
    fresh[0].hosts[ORIGIN] = { 'signEvent:24242:upload': 'allow' };
    await env.local.set({ profiles: fresh });
    await env.flushWrites();
    vi.setSystemTime((start + 10) * 1000);
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await answerWithin(first, 400);
    await settle(40);

    expect(queued.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
    const before = JSON.stringify(env.local._dump().profiles[0].hosts);
    await post(env, 'allowed', env.tabs.shown[1].uuid, { remember: true });
    await settle(30);
    await env.flushWrites();
    expect(JSON.stringify(env.local._dump().profiles[0].hosts)).toBe(before);
  });

  it('a live token that waited still auto-signs', async () => {
    const env = await bootTwo();
    const first = send(env, sign(1));
    await settle(30);
    const upload = sign(24242, [
      ['t', 'upload'], ['expiration', String(NOW() + 3000)], ['x', '0'.repeat(64)],
    ]);
    const queued = track(send(env, upload));
    await settle(30);
    const fresh = env.local._dump().profiles;
    fresh[0].hosts[ORIGIN] = { 'signEvent:24242:upload': 'allow' };
    await env.local.set({ profiles: fresh });
    await env.flushWrites();
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await answerWithin(first, 400);
    await settle(40);
    expect(queued.value).toMatchObject({ kind: 24242, pubkey: PUB_A });
  });
});

describe('a prompt shown for one identity', () => {
  it('never signs as another: a switch before the answer is an error', async () => {
    const env = await bootTwo();
    const pending = send(env, sign());
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    const answer = await answerWithin(pending);
    expect(answer.sig).toBeUndefined();
    expect(answer.error).toBeTruthy();
    expect(env.savedEvents).toEqual([]);
  });

  it('a switch away and back still signs as the identity shown', async () => {
    const env = await bootTwo();
    const pending = send(env, sign());
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await env.local.set({ profileIndex: 0 });
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    expect(await answerWithin(pending)).toMatchObject({ pubkey: PUB_A });
  });

  it('fails closed if that position now holds another identity', async () => {
    const env = await bootTwo({}, {}, { profileIndex: 1 });
    const pending = send(env, sign());
    await settle(30);
    const { profiles } = env.local._dump();
    profiles[1] = profiles[0];
    await env.local.set({ profiles });
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    expect((await answerWithin(pending)).sig).toBeUndefined();
  });

  it('a request answered after its profile was removed does not sign', async () => {
    const env = await bootTwo();
    const pending = send(env, sign());
    await settle(30);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    expect((await answerWithin(pending)).sig).toBeUndefined();
  });

  it('a field in the approval cannot turn the check off', async () => {
    const env = await bootTwo();
    const pending = send(env, sign());
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await post(env, 'allowed', env.tabs.shown[0].uuid, {
      followsActive: false, profileIndex: 1, pubkey: PUB_B,
    });
    expect((await answerWithin(pending)).sig).toBeUndefined();
  });

  it('wherever the switch lands after approval the outcome is the identity shown or an error', async () => {
    const outcomes = new Set();
    for (let n = 0; n < 10; n++) {
      const env = await bootTwo();
      const pending = send(env, sign());
      await settle(30);
      beforeRead(env, n, switchTo(env, 1));
      await post(env, 'allowed', env.tabs.shown[0].uuid);
      outcomes.add(signedBy(await answerWithin(pending, 400)));
    }
    expect(outcomes.has('B')).toBe(false);
    expect(outcomes.has('prompt')).toBe(false);
    expect(outcomes.has('A')).toBe(true);
    expect(outcomes.has('error')).toBe(true);
  }, 60_000);

  it('encryption, public key and relays follow the same rule', async () => {
    for (const [kind, payload] of [
      ['nip44.encrypt', { pubKey: PUB_B, plainText: 'x' }],
      ['nip04.encrypt', { pubKey: PUB_B, plainText: 'x' }],
      ['getPubKey', {}],
      ['getRelays', {}],
      ['addRelay', { url: RELAY }],
    ]) {
      const env = await bootTwo();
      const pending = send(env, { kind, host: ORIGIN, payload });
      await settle(30);
      await env.local.set({ profileIndex: 1 });
      await post(env, 'allowed', env.tabs.shown[0].uuid);
      expect((await answerWithin(pending)).error).toBeTruthy();
      await env.flushWrites();
      expect(env.local._dump().profiles[1].relays.map(r => r.url)).toEqual(['wss://b.example.com/']);
    }
  });

  it('a request shown after a switch while queued signs as the identity shown', async () => {
    const env = await bootTwo();
    const first = send(env, sign());
    await settle(30);
    const queued = send(env, sign());
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await answerWithin(first);
    await settle(30);
    await post(env, 'allowed', env.tabs.shown[1].uuid);
    expect(await answerWithin(queued)).toMatchObject({ pubkey: PUB_B });
  });
});

it('a saved-key profile with no cached public key keeps working, and stays bound', async () => {
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, HEX_B);
  const env = await bootWorker({
    profiles: [
      localProfile(blobs[0], {}, { pubKey: '' }),
      localProfile(blobs[1], {}, { name: 'P2', pubKey: '' }),
    ],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
  });
  const pending = send(env, sign());
  await settle(30);
  await post(env, 'allowed', env.tabs.shown[0].uuid);
  expect(await answerWithin(pending)).toMatchObject({ pubkey: PUB_A });

  const second = send(env, sign());
  await settle(30);
  await env.local.set({ profileIndex: 1 });
  await post(env, 'allowed', env.tabs.shown[1].uuid);
  expect((await answerWithin(second)).sig).toBeUndefined();
});

describe('a prompt shown while the identity cannot be read', () => {
  const PASSWORD = 'correct horse battery';

  /** A password-locked local profile that has no cached public key. */
  async function bootLockedNoKey(extra = []) {
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, HEX_B);
    const first = await bootWorker({
      profiles: [localProfile(blobs[0]), ...extra.map(make => make(blobs))],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    await post(first, 'setPassword', PASSWORD);
    await first.flushWrites();
    const { profiles } = first.local._dump();
    profiles.forEach((profile) => { profile.pubKey = ''; });
    await first.local.set({ profiles });
    const env = await first.restart();
    const asked = track(env.dispatch({ kind: 'getPubKey', host: ORIGIN }, PAGE_SENDER));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    return { env, asked };
  }

  it('answers as that profile once it is unlocked', async () => {
    const { env, asked } = await bootLockedNoKey();
    await post(env, 'unlock', PASSWORD);
    await env.flushWrites();
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    expect(asked.value).toBe(PUB_A);
  });

  it('answers nothing if the active profile moved on', async () => {
    const { env, asked } = await bootLockedNoKey([(blobs) => localProfile(blobs[1], {}, { name: 'P2', pubKey: PUB_B })]);
    await post(env, 'unlock', PASSWORD);
    await env.flushWrites();
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    expect(asked.value).toMatchObject({ error: 'identity_mismatch' });
  });

  it('answers nothing if another profile took its place in the list', async () => {
    const { env, asked } = await bootLockedNoKey([(blobs) => localProfile(blobs[1], {}, { name: 'P2' })]);
    await post(env, 'unlock', PASSWORD);
    await env.flushWrites();
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    await post(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    expect(asked.value).toMatchObject({ error: 'identity_mismatch' });
  });
});
