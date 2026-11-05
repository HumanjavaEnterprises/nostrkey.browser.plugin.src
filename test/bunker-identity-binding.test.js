/**
 * A remote signer session belongs to one identity. Real worker, fake signer.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  bootWorker, deviceWrapped, localProfile, answerWithin, settle,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import {
  installFakeSigner, SIGNER_PUB, OTHER_SIGNER_HEX, OTHER_SIGNER_PUB,
} from './helpers/fake-signer.js';

const ADDRESS = `bunker://${SIGNER_PUB}?relay=wss://relay.example.com`;
const GRANT = (key) => ({ [ORIGIN]: { [key]: 'allow' } });
const bunker = (overrides = {}) => ({
  name: 'Remote', privKey: '', pubKey: '', relays: [], type: 'bunker',
  bunkerUrl: null, remotePubkey: SIGNER_PUB, hosts: {}, ...overrides,
});
const sign = (kind = 1) => ({
  kind: 'signEvent', host: ORIGIN, payload: { kind, content: 'x', tags: [], created_at: 1700000000 },
});
const send = (env, message) => answerWithin(env.dispatch(message, PAGE_SENDER));
const connect = (env, profileIndex = 0) => env.dispatch({ kind: 'bunker.connect', payload: { profileIndex, bunkerUrl: ADDRESS } });

async function boot(profiles, seed = {}) {
  const signer = installFakeSigner();
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
  const list = typeof profiles === 'function' ? profiles(blobs[0]) : profiles;
  const env = await bootWorker({
    profiles: list, profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
    deviceKeySeed, deviceKeyStrategy, ...seed,
  });
  return { env, signer };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('removing a profile', () => {
  it('takes its remote session with it, so the next profile never signs through it', async () => {
    const { env, signer } = await boot([
      bunker(),
      bunker({ name: 'Next', remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') }),
    ]);
    await connect(env, 0);
    await env.flushWrites();
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    signer.requests.length = 0;

    const answer = await send(env, sign());
    expect(answer.sig).toBeUndefined();
    expect(answer.error).toBeTruthy();
    expect(signer.requests).toEqual([]);
    expect(env.savedEvents).toEqual([]);
    expect(env.local._dump().bunkerSessions).toEqual({});
  });

  it('removes the session from memory as well as storage', async () => {
    const { env, signer } = await boot([bunker(), bunker({ name: 'Next' })]);
    await connect(env, 0);
    await env.flushWrites();
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    expect(signer.closed).toBeGreaterThan(0);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: false, hasSession: false });
  });

  it('keeps later sessions on their own profiles, in memory and in storage', async () => {
    const { env, signer } = await boot((blob) => [
      localProfile(blob),
      bunker({ hosts: GRANT('signEvent:1') }),
    ]);
    await connect(env, 1);
    await env.flushWrites();
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    expect(Object.keys(env.local._dump().bunkerSessions)).toEqual(['0']);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: true, hasSession: true });

    expect(await send(env, sign())).toMatchObject({ pubkey: SIGNER_PUB });
    const after = await env.restart();
    expect(await send(after, sign())).toMatchObject({ pubkey: SIGNER_PUB });
    expect(signer.requests.filter(r => r.method === 'sign_event')).toHaveLength(2);
  });

  it('leaves earlier sessions alone', async () => {
    const { env } = await boot((blob) => [bunker(), localProfile(blob)]);
    await connect(env, 0);
    await env.flushWrites();
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(1);
    await env.flushWrites();
    expect(Object.keys(env.local._dump().bunkerSessions)).toEqual(['0']);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: true, hasSession: true });
  });

  it('removing the last profile closes its session too', async () => {
    const { env, signer } = await boot([bunker()]);
    await connect(env, 0);
    await env.flushWrites();
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    expect(signer.closed).toBeGreaterThan(0);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: false, hasSession: false });
  });
});

describe('what a remote signer returns', () => {
  it('a signature from any other key is answered with an error and never kept', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    signer.signAsHex = OTHER_SIGNER_HEX;
    const answer = await send(env, sign());
    expect(answer.sig).toBeUndefined();
    expect(answer.error).toBeTruthy();
    expect(env.savedEvents).toEqual([]);
  });

  it('a garbled answer is an error too', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    signer.signAnswer = 'null';
    const answer = await send(env, sign());
    expect(answer.sig).toBeUndefined();
    expect(answer.error).toBeTruthy();
  });

  it('a profile with no known signer identity does not sign', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    await env.flushWrites();
    const { profiles } = env.local._dump();
    profiles[0].remotePubkey = null;
    await env.local.set({ profiles });
    signer.requests.length = 0;
    const answer = await send(env, sign());
    expect(answer.sig).toBeUndefined();
    expect(signer.requests).toEqual([]);
  });

  it('a stored session that does not know its identity does not sign for a profile with none', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    await env.flushWrites();
    const { bunkerSessions, profiles } = env.local._dump();
    delete bunkerSessions[0].userPubkey;
    profiles[0].remotePubkey = null;
    await env.local.set({ bunkerSessions, profiles });
    const after = await env.restart();
    signer.requests.length = 0;
    expect((await send(after, sign())).sig).toBeUndefined();
    expect(signer.requests.map(r => r.method)).not.toContain('sign_event');
  });

  it('a session opened for another identity is not used, for signing or encryption', async () => {
    const { env, signer } = await boot([bunker({
      hosts: { [ORIGIN]: { 'signEvent:1': 'allow', 'nip44.encrypt': 'allow', 'nip04.decrypt': 'allow' } },
    })]);
    await connect(env);
    await env.flushWrites();
    const { profiles } = env.local._dump();
    profiles[0].remotePubkey = OTHER_SIGNER_PUB;
    await env.local.set({ profiles });
    signer.requests.length = 0;

    expect((await send(env, sign())).sig).toBeUndefined();
    const enc = { kind: 'nip44.encrypt', host: ORIGIN, payload: { pubKey: PUB_A, plainText: 'hi' } };
    const dec = { kind: 'nip04.decrypt', host: ORIGIN, payload: { pubKey: PUB_A, cipherText: 'hi' } };
    expect((await send(env, enc)).error).toBeTruthy();
    expect((await send(env, dec)).error).toBeTruthy();
    expect(signer.requests).toEqual([]);
  });

  it('a session stored before the signer identity was kept is confirmed before encryption', async () => {
    const { env, signer } = await boot([bunker({
      hosts: { [ORIGIN]: { 'nip44.encrypt': 'allow' } },
    })]);
    await connect(env);
    await env.flushWrites();
    const { bunkerSessions, profiles } = env.local._dump();
    delete bunkerSessions[0].userPubkey;
    profiles[0].remotePubkey = OTHER_SIGNER_PUB;
    await env.local.set({ bunkerSessions, profiles });
    const after = await env.restart();
    signer.requests.length = 0;

    const enc = { kind: 'nip44.encrypt', host: ORIGIN, payload: { pubKey: PUB_A, plainText: 'hi' } };
    expect((await send(after, enc)).error).toBeTruthy();
    expect(signer.requests.map(r => r.method)).not.toContain('nip44_encrypt');
  });

  it('a stored session still works after a restart, confirming its identity once at most', async () => {
    const { env, signer } = await boot([bunker({
      hosts: { [ORIGIN]: { 'nip44.encrypt': 'allow', 'signEvent:1': 'allow' } },
    })]);
    await connect(env);
    await env.flushWrites();
    const after = await env.restart();
    signer.requests.length = 0;
    expect(await send(after, sign())).toMatchObject({ pubkey: SIGNER_PUB });
    const enc = { kind: 'nip44.encrypt', host: ORIGIN, payload: { pubKey: PUB_A, plainText: 'hi' } };
    expect(await send(after, enc)).toBe('nip44_encrypt:hi');
    expect(signer.requests.map(r => r.method)).not.toContain('get_public_key');
  });
});

describe('asking a remote signer who it is', () => {
  it('stores the answer on the profile that asked, not one that moved into its place', async () => {
    const HEX_C = '0000000000000000000000000000000000000000000000000000000000000005';
    const { env, signer } = await boot((blob) => [
      localProfile(blob),
      bunker({ hosts: GRANT('getPubKey') }),
      localProfile(blob, {}, { name: 'Last', pubKey: HEX_C }),
    ]);
    await connect(env, 1);
    await env.flushWrites();
    const { profiles } = env.local._dump();
    profiles[1].remotePubkey = null;
    await env.local.set({ profiles, profileIndex: 1 });

    const { deleteProfile } = await import('../src/utilities/utils.js');
    signer.beforeAnswer = async (method) => {
      if (method === 'get_public_key') await deleteProfile(0);
    };
    await send(env, { kind: 'getPubKey', host: ORIGIN, payload: {} });
    await env.flushWrites();
    const left = env.local._dump().profiles;
    expect(left).toHaveLength(2);
    expect(left[1].name).toBe('Last');
    expect(left[1].remotePubkey).toBeNull();
    expect(signer.requests.map(r => r.method)).toContain('get_public_key');
  });
});

describe('connecting', () => {
  it('a failed connection closes its socket', async () => {
    const { env, signer } = await boot([bunker()]);
    signer.refuse.get_public_key = 'no';
    expect((await connect(env)).success).toBe(false);
    expect(signer.sockets).toBe(1);
    expect(signer.closed).toBe(1);
  });

  it('a new connection closes the one it replaces', async () => {
    const { env, signer } = await boot([bunker()]);
    await connect(env);
    expect(signer.closed).toBe(0);
    await connect(env);
    expect(signer.sockets).toBe(2);
    expect(signer.closed).toBe(1);
  });
});

describe('grants when a profile changes identity', () => {
  const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
  const SIGN = GRANT('signEvent:1');
  const hostsOf = (env, i = 0) => env.local._dump().profiles[i].hosts;
  const asked = async (env) => {
    const before = env.tabs.shown.length;
    await answerWithin(env.dispatch(sign(), PAGE_SENDER), 300);
    return env.tabs.shown.length === before + 1;
  };

  it('connecting to a different remote identity clears them', async () => {
    const { env } = await boot([bunker({ remotePubkey: OTHER_SIGNER_PUB, hosts: SIGN })]);
    const pending = await connect(env);
    expect(pending.needsConfirm).toBe(true);
    await env.dispatch({ kind: 'bunker.confirmConnect', payload: pending.pendingId });
    await env.flushWrites();
    expect(hostsOf(env)).toEqual({});
    expect(await asked(env)).toBe(true);
  });

  it('a first connection clears any left on the profile', async () => {
    const { env } = await boot([bunker({ remotePubkey: null, hosts: SIGN })]);
    await connect(env);
    await env.flushWrites();
    expect(hostsOf(env)).toEqual({});
  });

  it('reconnecting to the same identity keeps them', async () => {
    const { env } = await boot([bunker({ hosts: SIGN })]);
    await connect(env);
    await env.flushWrites();
    expect(hostsOf(env)).toEqual(SIGN);
  });

  it('only the connected profile is touched', async () => {
    const { env } = await boot([
      bunker({ remotePubkey: OTHER_SIGNER_PUB, hosts: SIGN }),
      bunker({ name: 'Next', hosts: SIGN }),
    ]);
    await connect(env, 0);
    await env.flushWrites();
    expect(hostsOf(env, 1)).toEqual(SIGN);
  });

  it('replacing a local key clears them', async () => {
    const { env } = await boot((blob) => [localProfile(blob, SIGN)]);
    const res = await env.dispatch({ kind: 'savePrivateKey', payload: [0, HEX_B] });
    expect(res).toEqual({ success: true });
    await env.flushWrites();
    expect(hostsOf(env)).toEqual({});
    expect(await asked(env)).toBe(true);
    expect(env.savedEvents).toEqual([]);
  });

  it('saving the same local key keeps them', async () => {
    const { env } = await boot((blob) => [localProfile(blob, SIGN)]);
    await env.dispatch({ kind: 'savePrivateKey', payload: [0, HEX_A] });
    await env.flushWrites();
    expect(hostsOf(env)).toEqual(SIGN);
  });

  it('a seed phrase replacing a local key clears them, through the same save', async () => {
    const { env } = await boot((blob) => [localProfile(blob, SIGN)]);
    const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const { hexKey } = await env.dispatch({ kind: 'seedPhrase.toKey', payload: phrase });
    expect(hexKey).toMatch(/^[0-9a-f]{64}$/);
    await env.dispatch({ kind: 'savePrivateKey', payload: [0, hexKey] });
    await env.flushWrites();
    expect(hostsOf(env)).toEqual({});
  });
});

describe('opening a stored session', () => {
  async function restarted(profiles = [bunker({ hosts: GRANT('signEvent:1') })]) {
    const { env, signer } = await boot(profiles);
    await connect(env);
    await env.flushWrites();
    const after = await env.restart();
    signer.requests.length = 0;
    signer.sockets = 0;
    signer.closed = 0;
    return { env: after, signer };
  }
  const methods = (signer, name) => signer.requests.filter(r => r.method === name);
  const hold = (signer, method) => {
    let release;
    const gate = new Promise((r) => { release = r; });
    signer.beforeAnswer = async (m) => {
      if (m === method) { signer.beforeAnswer = null; await gate; }
    };
    return release;
  };

  it('a burst opens one socket and one connection, and every request signs', async () => {
    const { env, signer } = await restarted();
    const answers = await Promise.all(
      Array.from({ length: 10 }, () => send(env, sign())),
    );
    for (const answer of answers) expect(answer).toMatchObject({ pubkey: SIGNER_PUB });
    expect(signer.sockets).toBe(1);
    expect(methods(signer, 'connect')).toHaveLength(1);
    expect(methods(signer, 'sign_event')).toHaveLength(10);
    expect(signer.closed).toBe(0);
  });

  it('a failed open closes its socket and the next request tries again', async () => {
    const { env, signer } = await restarted();
    signer.refuse.connect = 'not now';
    const answers = await Promise.all([send(env, sign()), send(env, sign())]);
    for (const answer of answers) expect(answer.error).toBeTruthy();
    expect(signer.sockets).toBe(1);
    expect(signer.closed).toBe(1);

    delete signer.refuse.connect;
    expect(await send(env, sign())).toMatchObject({ pubkey: SIGNER_PUB });
    expect(signer.sockets).toBe(2);
  });

  it('sessions of different profiles open separately', async () => {
    const { env, signer } = await boot([
      bunker({ hosts: GRANT('signEvent:1') }),
      bunker({ name: 'Next', hosts: GRANT('signEvent:1') }),
    ]);
    await connect(env, 0);
    await connect(env, 1);
    await env.flushWrites();
    const after = await env.restart();
    signer.sockets = 0;
    const first = send(after, sign());
    await after.local.set({ profileIndex: 1 });
    await Promise.all([first, send(after, sign())]);
    expect(signer.sockets).toBe(2);
  });

  it('a new connection made during an open wins, and the open is closed', async () => {
    const { env, signer } = await restarted();
    const release = hold(signer, 'connect');
    const pending = send(env, sign());
    await settle(10);
    expect(signer.sockets).toBe(1);

    await connect(env);
    release();
    expect((await pending).sig).toBeUndefined();
    await settle(10);
    expect(signer.sockets).toBe(2);
    expect(signer.closed).toBe(1);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: true, hasSession: true });
    expect(await send(env, sign())).toMatchObject({ pubkey: SIGNER_PUB });
    expect(signer.sockets).toBe(2);
  });

  it('a disconnect during an open is not undone by it', async () => {
    const { env, signer } = await restarted();
    const release = hold(signer, 'connect');
    const pending = send(env, sign());
    await settle(10);
    await env.dispatch({ kind: 'bunker.disconnect', payload: 0 });
    release();
    expect((await pending).sig).toBeUndefined();
    await settle(10);
    expect(signer.closed).toBe(1);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: false, hasSession: false });
  });

  it('a profile removed during an open does not get a session in its old place', async () => {
    const { env, signer } = await restarted([
      bunker({ hosts: GRANT('signEvent:1') }),
      bunker({ name: 'Next', remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') }),
    ]);
    const release = hold(signer, 'connect');
    const pending = send(env, sign());
    await settle(10);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    release();
    expect((await pending).sig).toBeUndefined();
    await settle(10);
    expect(signer.closed).toBe(1);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: false, hasSession: false });
  });
});

describe('connecting while the list changes', () => {
  const holdPublicKey = (signer) => {
    let open;
    const gate = new Promise((resolve) => { open = resolve; });
    signer.beforeAnswer = async (method) => { if (method === 'get_public_key') await gate; };
    return open;
  };

  const removeWhileConnecting = async (profiles) => {
    const { env, signer } = await boot(profiles);
    const open = holdPublicKey(signer);
    const connecting = connect(env, 0);
    await settle(20);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    open();
    const result = await connecting;
    await env.flushWrites();
    return { env, signer, result };
  };

  it('leaves the next remote profile as it was', async () => {
    const { env, signer, result } = await removeWhileConnecting([
      bunker({ name: 'Gone', remotePubkey: null }),
      bunker({ name: 'Next', remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') }),
    ]);
    expect(result.success).toBe(false);
    const { profiles, bunkerSessions } = env.local._dump();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].remotePubkey).toBe(OTHER_SIGNER_PUB);
    expect(profiles[0].hosts).toEqual(GRANT('signEvent:1'));
    expect(bunkerSessions ?? {}).toEqual({});
    expect(signer.closed).toBeGreaterThan(0);
  });

  it('leaves the next local profile as it was', async () => {
    const { env, result } = await removeWhileConnecting((blob) => [
      bunker({ name: 'Gone', remotePubkey: null }),
      localProfile(blob, GRANT('signEvent:1')),
    ]);
    expect(result.success).toBe(false);
    const [profile] = env.local._dump().profiles;
    expect(profile.remotePubkey ?? null).toBeNull();
    expect(profile.hosts).toEqual(GRANT('signEvent:1'));
  });

  it('stops at a removal even when the identity at that place looks the same', async () => {
    const { env, result } = await removeWhileConnecting([
      bunker({ name: 'Gone', remotePubkey: null }),
      bunker({ name: 'Next', remotePubkey: null }),
    ]);
    expect(result.success).toBe(false);
    expect(env.local._dump().profiles[0].remotePubkey).toBeNull();
    expect(env.local._dump().bunkerSessions ?? {}).toEqual({});
  });

  it('a removal as the session is being stored takes that session back out', async () => {
    const { env } = await boot([
      bunker({ name: 'Gone', remotePubkey: null }),
      bunker({ name: 'Next', remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') }),
    ]);
    const raw = env.chrome.storage.local;
    const set = raw.set.bind(raw);
    let release = null;
    raw.set = (items) => {
      if (!release && Object.keys(items).length === 1 && items.bunkerSessions) {
        return new Promise((resolve) => { release = resolve; }).then(() => set(items));
      }
      return set(items);
    };
    const connecting = connect(env, 0);
    await settle(40);
    expect(release).toBeTypeOf('function');
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    release();
    expect((await connecting).success).toBe(false);
    await env.flushWrites();
    const { profiles, bunkerSessions } = env.local._dump();
    expect(profiles[0]).toMatchObject({ name: 'Next', remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') });
    expect(bunkerSessions ?? {}).toEqual({});
  });

  const removeUnheard = async (profiles) => {
    const { env, signer } = await boot(profiles);
    const open = holdPublicKey(signer);
    const connecting = connect(env, 0);
    await settle(20);
    // The list changed in storage and the background has not heard yet.
    env.setSendMessage(async () => { throw new Error('no receiver'); });
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    open();
    const result = await connecting;
    await env.flushWrites();
    return { env, result };
  };

  it('stops at another identity in that place before the background hears', async () => {
    const { env, result } = await removeUnheard([
      bunker({ name: 'Gone', remotePubkey: null }),
      bunker({ name: 'Next', remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') }),
    ]);
    expect(result.success).toBe(false);
    expect(env.local._dump().profiles[0]).toMatchObject({ remotePubkey: OTHER_SIGNER_PUB, hosts: GRANT('signEvent:1') });
  });

  it('stops at a local profile with the same identity in that place', async () => {
    const { env, result } = await removeUnheard((blob) => [
      bunker({ name: 'Gone', remotePubkey: PUB_A }),
      localProfile(blob, GRANT('signEvent:1')),
    ]);
    expect(result.success).toBe(false);
    expect(env.local._dump().bunkerSessions ?? {}).toEqual({});
  });

  it('a local profile is never connected', async () => {
    const { env, signer } = await boot((blob) => [localProfile(blob)]);
    const sockets = signer.sockets;
    expect((await connect(env, 0)).success).toBe(false);
    expect(signer.sockets).toBe(sockets);
  });

  it('leaves the live session of the profile that moved into that place', async () => {
    const { env, signer } = await boot([
      bunker({ name: 'Gone', remotePubkey: null }),
      bunker({ name: 'Next', hosts: GRANT('signEvent:1') }),
    ]);
    await connect(env, 1);
    await env.flushWrites();
    const open = holdPublicKey(signer);
    const connecting = connect(env, 0);
    await settle(20);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    await env.flushWrites();
    const stored = env.local._dump().bunkerSessions;
    open();
    expect((await connecting).success).toBe(false);
    await env.flushWrites();
    expect(env.local._dump().bunkerSessions).toEqual(stored);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: true, hasSession: true });
  });

  it('a removal further down the list changes nothing', async () => {
    const { env, signer } = await boot([bunker({ name: 'Mine' }), bunker({ name: 'Other', remotePubkey: OTHER_SIGNER_PUB })]);
    const open = holdPublicKey(signer);
    const connecting = connect(env, 0);
    await settle(20);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(1);
    await env.flushWrites();
    open();
    expect((await connecting).success).toBe(true);
  });

  it('a profile that is not there cannot be connected', async () => {
    const { env } = await boot([bunker()]);
    const result = await connect(env, 3);
    await env.flushWrites();
    expect(result.success).toBe(false);
    expect(env.local._dump().bunkerSessions ?? {}).toEqual({});
  });

  const holdSessionWrite = (env) => {
    const raw = env.chrome.storage.local;
    const get = raw.get.bind(raw);
    const hold = { armed: false, release: null };
    raw.get = (...args) => {
      const [wanted] = args;
      if (hold.armed && wanted && typeof wanted === 'object' && 'bunkerSessions' in wanted) {
        hold.armed = false;
        return new Promise((resolve) => { hold.release = resolve; }).then(() => get(...args));
      }
      return get(...args);
    };
    return hold;
  };

  it('a stale open in the moment of the switch leaves exactly one session', async () => {
    const { env: first, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(first);
    const env = await first.restart();
    const hold = holdSessionWrite(env);
    signer.beforeAnswer = async (method) => { if (method === 'get_public_key') hold.armed = true; };
    const socketsBefore = signer.sockets;
    const connecting = connect(env);
    await settle(40);
    const burst = env.dispatch(sign(1), PAGE_SENDER);
    await settle(30);
    hold.release();
    await connecting;
    await answerWithin(burst, 1000);
    await settle(40);
    signer.beforeAnswer = undefined;
    // One socket each for the connect and the open, and the open's must be closed.
    expect(signer.sockets - signer.closed - socketsBefore).toBe(1);
  });

  it('a stale open finishing first does not leak its socket', async () => {
    const { env: first, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(first);
    const env = await first.restart();
    const hold = holdSessionWrite(env);
    signer.beforeAnswer = async (method) => { if (method === 'get_public_key') hold.armed = true; };
    const socketsBefore = signer.sockets;
    const connecting = connect(env);
    await settle(40);
    const event = await answerWithin(env.dispatch(sign(1), PAGE_SENDER), 1000);
    expect(event.sig).toBeTruthy();
    hold.release();
    await connecting;
    await settle(40);
    expect(signer.sockets - signer.closed - socketsBefore).toBe(1);
  });
});

describe('an open that starts while a connect stores its session', () => {
  const holdStoring = async () => {
    const { env: first, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(first);
    const env = await first.restart();
    const raw = env.chrome.storage.local;
    const set = raw.set.bind(raw);
    const hold = { release: null };
    raw.set = (items) => {
      if (!hold.release && Object.keys(items).length === 1 && items.bunkerSessions) {
        return new Promise((resolve) => { hold.release = resolve; }).then(() => set(items));
      }
      return set(items);
    };
    const sockets = signer.sockets;
    const connecting = connect(env);
    await settle(40);
    expect(hold.release).toBeTypeOf('function');
    return { env, signer, hold, connecting, openSockets: () => signer.sockets - signer.closed - sockets };
  };

  it('closes itself if it finishes after the connect', async () => {
    const { env, signer, hold, connecting, openSockets } = await holdStoring();
    let finish;
    const gate = new Promise((resolve) => { finish = resolve; });
    signer.beforeAnswer = async (method) => { if (method === 'connect') await gate; };
    const burst = env.dispatch(sign(1), PAGE_SENDER);
    await settle(30);
    hold.release();
    await connecting;
    finish();
    await answerWithin(burst, 1000);
    await settle(40);
    expect(openSockets()).toBe(1);
  });

  it('is closed if it finishes first', async () => {
    const { env, hold, connecting, openSockets } = await holdStoring();
    expect((await answerWithin(env.dispatch(sign(1), PAGE_SENDER), 1000)).sig).toBeTruthy();
    hold.release();
    await connecting;
    await settle(40);
    expect(openSockets()).toBe(1);
  });
});

describe('the key a signer gives when connecting', () => {
  for (const [name, value] of [['empty', ''], ['not a key', 'not-a-key'], ['too short', 'ab'.repeat(31)]]) {
    it(`${name}: fails the connect and clears nothing`, async () => {
      const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
      await connect(env);
      await env.flushWrites();
      const stored = env.local._dump().bunkerSessions;
      signer.pubAnswer = value;
      const result = await connect(env);
      await env.flushWrites();
      expect(result.success).toBe(false);
      const after = env.local._dump();
      expect(after.profiles[0].remotePubkey).toBe(SIGNER_PUB);
      expect(after.profiles[0].hosts).toEqual(GRANT('signEvent:1'));
      expect(after.bunkerSessions).toEqual(stored);
      signer.pubAnswer = undefined;
      expect((await send(env, sign(1))).sig).toBeTruthy();
    });
  }

  it('in upper case is stored in lower case, and the same identity keeps its grants', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    signer.pubAnswer = SIGNER_PUB.toUpperCase();
    const result = await connect(env);
    await env.flushWrites();
    expect(result).toMatchObject({ success: true, remotePubkey: SIGNER_PUB });
    expect(env.local._dump().profiles[0]).toMatchObject({ remotePubkey: SIGNER_PUB, hosts: GRANT('signEvent:1') });
  });

  it('compares correctly with a value stored in upper case', async () => {
    const { env } = await boot([bunker({ remotePubkey: SIGNER_PUB.toUpperCase(), hosts: GRANT('signEvent:1') })]);
    await connect(env);
    await env.flushWrites();
    expect(env.local._dump().profiles[0]).toMatchObject({ remotePubkey: SIGNER_PUB, hosts: GRANT('signEvent:1') });
  });

  it('a session stored against an upper-case identity still signs', async () => {
    const { env } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    await env.flushWrites();
    const dump = env.local._dump();
    dump.profiles[0].remotePubkey = SIGNER_PUB.toUpperCase();
    await env.local.set({ profiles: dump.profiles });
    await env.flushWrites();
    const next = await env.restart();
    expect((await send(next, sign(1))).sig).toBeTruthy();
  });

  it('a live session and an upper-case stored identity agree for encryption too', async () => {
    const { env } = await boot([bunker({ hosts: GRANT('nip44.encrypt') })]);
    await connect(env);
    await env.flushWrites();
    const dump = env.local._dump();
    dump.profiles[0].remotePubkey = SIGNER_PUB.toUpperCase();
    await env.local.set({ profiles: dump.profiles });
    await env.flushWrites();
    const next = await env.restart();
    const answer = await send(next, { kind: 'nip44.encrypt', host: ORIGIN, payload: { pubKey: PUB_A, plainText: 'x' } });
    expect(answer).toBe('nip44_encrypt:x');
  });

  it('a null identity profile asking for its key gets a checked answer', async () => {
    const { env, signer } = await boot([bunker({ remotePubkey: SIGNER_PUB, hosts: GRANT('getPubKey') })]);
    await connect(env);
    await env.flushWrites();
    const dump = env.local._dump();
    dump.profiles[0].remotePubkey = null;
    await env.local.set({ profiles: dump.profiles });
    await env.flushWrites();
    signer.pubAnswer = 'not-a-key';
    const answer = await send(env, { kind: 'getPubKey', host: ORIGIN });
    expect(answer).toMatchObject({ error: expect.any(String) });
    expect(env.local._dump().profiles[0].remotePubkey).toBeNull();
  });
});

describe('a sync that changes the list', () => {
  const STALE = 'cd'.repeat(32);
  const later = () => Math.floor(Date.now() / 1000) + 100;
  const merge = async (data) => (await import('../src/utilities/sync-manager.js')).mergeIntoLocal(data);
  const tombstone = (...ids) => ({ deletedProfiles: Object.fromEntries(ids.map(id => [id, Math.floor(Date.now() / 1000)])), profiles: [] });

  const bootSecond = async () => {
    const { env, signer } = await boot([
      bunker({ name: 'Gone', remotePubkey: STALE, updatedAt: 1 }),
      bunker({ name: 'Mine', hosts: GRANT('signEvent:1'), updatedAt: later() }),
    ], { profileIndex: 1 });
    await connect(env, 1);
    await env.flushWrites();
    return { env, signer };
  };

  it('keeps a live session with the profile that stays', async () => {
    const { env, signer } = await bootSecond();
    const sockets = signer.sockets;
    // A worker cannot message itself, so nothing may depend on that here.
    env.setSendMessage(async () => { throw new Error('no receiver'); });
    await merge(tombstone(STALE));
    await env.flushWrites();
    const dump = env.local._dump();
    expect(dump.profiles.map(p => p.name)).toEqual(['Mine']);
    expect(Object.keys(dump.bunkerSessions)).toEqual(['0']);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: true, hasSession: true });
    expect((await send(env, sign(1))).pubkey).toBe(SIGNER_PUB);
    expect(signer.sockets).toBe(sockets);
  });

  it('keeps the stored session with it across a restart', async () => {
    const { env } = await bootSecond();
    await merge(tombstone(STALE));
    const next = await env.restart();
    expect((await send(next, sign(1))).pubkey).toBe(SIGNER_PUB);
  });

  it('closes the session of the profile that goes', async () => {
    const { env, signer } = await boot([
      bunker({ name: 'Keep', remotePubkey: OTHER_SIGNER_PUB, updatedAt: later() }),
      bunker({ name: 'Gone', updatedAt: 1 }),
    ]);
    await connect(env, 1);
    await env.flushWrites();
    await merge(tombstone(SIGNER_PUB));
    await env.flushWrites();
    expect(signer.closed).toBeGreaterThan(0);
    expect(env.local._dump().bunkerSessions).toEqual({});
  });

  it('follows a profile that a first sync puts in another place', async () => {
    const { env } = await boot([bunker({ name: 'Default Nostr Profile', hosts: {} })]);
    await connect(env, 0);
    await env.flushWrites();
    await merge({
      profiles: [
        { name: 'First', privKey: '', pubKey: '', type: 'bunker', remotePubkey: OTHER_SIGNER_PUB, hosts: {} },
        { name: 'Second', privKey: '', pubKey: '', type: 'bunker', remotePubkey: SIGNER_PUB, hosts: {} },
      ],
      profileIndex: 1,
    });
    await env.flushWrites();
    expect(Object.keys(env.local._dump().bunkerSessions)).toEqual(['1']);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 1 })).toEqual({ connected: true, hasSession: true });
    expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: false, hasSession: false });
  });

  it('leaves everything alone when only details change', async () => {
    const { env } = await bootSecond();
    const before = env.local._dump().bunkerSessions;
    await merge({ profiles: [{ ...env.local._dump().profiles[1], name: 'Renamed', updatedAt: later() + 5 }] });
    await env.flushWrites();
    expect(env.local._dump().bunkerSessions).toEqual(before);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 1 })).toEqual({ connected: true, hasSession: true });
  });

  it('keeps an unlocked key with the profile that stays', async () => {
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [
        bunker({ name: 'Gone', remotePubkey: STALE, updatedAt: 1 }),
        localProfile(blobs[0], GRANT('signEvent:1'), { updatedAt: later() }),
      ],
      profileIndex: 1, isEncrypted: false, autoLockMinutes: 15, deviceKeySeed, deviceKeyStrategy,
    });
    await env.dispatch({ kind: 'setPassword', payload: 'correct horse battery' }, PERMISSION_SENDER);
    await env.flushWrites();
    env.setSendMessage(async () => { throw new Error('no receiver'); });
    await merge(tombstone(STALE));
    await env.flushWrites();
    expect((await send(env, sign(1))).pubkey).toBe(PUB_A);
  });

  it('stops a connect in progress on a profile that moved', async () => {
    const { env, signer } = await boot([
      bunker({ name: 'Gone', remotePubkey: STALE, updatedAt: 1 }),
      bunker({ name: 'Mine', remotePubkey: null, updatedAt: later() }),
    ]);
    let open;
    const gate = new Promise((resolve) => { open = resolve; });
    signer.beforeAnswer = async (method) => { if (method === 'get_public_key') await gate; };
    const connecting = connect(env, 1);
    await settle(20);
    await merge(tombstone(STALE));
    await env.flushWrites();
    open();
    expect((await connecting).success).toBe(false);
    expect(env.local._dump().bunkerSessions ?? {}).toEqual({});
  });

  it('the page door moves nothing, and a bad list is ignored', async () => {
    const { env } = await bootSecond();
    await env.dispatch({ kind: 'profilesMoved', payload: [[1, 0]] }, PAGE_SENDER);
    await env.dispatch({ kind: 'profilesMoved', payload: 'x' }, PERMISSION_SENDER);
    await env.dispatch({ kind: 'profilesMoved', payload: [[1, 'y']] }, PERMISSION_SENDER);
    expect(await env.dispatch({ kind: 'bunker.status', payload: 1 })).toEqual({ connected: true, hasSession: true });
  });

  it('an extension page reports a move to the background', async () => {
    const { env } = await bootSecond();
    await env.dispatch({ kind: 'profilesMoved', payload: [[1, 0], [0, null]] }, PERMISSION_SENDER);
    expect((await env.dispatch({ kind: 'bunker.status', payload: 0 })).connected).toBe(true);
  });
});

describe('a stored session that does not yet know its identity', () => {
  const decrypt = { kind: 'nip44.decrypt', host: ORIGIN, payload: { pubKey: PUB_A, cipherText: 'c' } };
  const askedKey = (signer) => signer.requests.filter(r => r.method === 'get_public_key').length;

  const bootLegacy = async (hosts = GRANT('nip44.decrypt')) => {
    const { env, signer } = await boot([bunker({ hosts })]);
    await connect(env);
    await env.flushWrites();
    const { bunkerSessions } = env.local._dump();
    delete bunkerSessions[0].userPubkey;
    await env.local.set({ bunkerSessions });
    const next = await env.restart();
    signer.requests.length = 0;
    return { env: next, signer };
  };

  it('asks once for a burst, and everything waits for that answer', async () => {
    const { env, signer } = await bootLegacy();
    const answers = await Promise.all(Array.from({ length: 5 }, () => send(env, decrypt)));
    expect(answers).toEqual(Array(5).fill('nip44_decrypt:c'));
    expect(askedKey(signer)).toBe(1);
  });

  it('remembers the answer, so a restart does not ask again', async () => {
    const { env, signer } = await bootLegacy();
    await send(env, decrypt);
    await env.flushWrites();
    expect(env.local._dump().bunkerSessions[0].userPubkey).toBe(SIGNER_PUB);
    const next = await env.restart();
    signer.requests.length = 0;
    expect(await send(next, decrypt)).toBe('nip44_decrypt:c');
    expect(askedKey(signer)).toBe(0);
  });

  it('does nothing if the signer will not say, and asks again next time', async () => {
    const { env, signer } = await bootLegacy();
    signer.refuse.get_public_key = 'not allowed';
    expect(await send(env, decrypt)).toMatchObject({ error: 'bunker_error', message: 'not allowed' });
    expect(signer.requests.some(r => r.method === 'nip44_decrypt')).toBe(false);
    expect(env.local._dump().bunkerSessions[0].userPubkey ?? null).toBeNull();
    delete signer.refuse.get_public_key;
    expect(await send(env, decrypt)).toBe('nip44_decrypt:c');
    expect(askedKey(signer)).toBe(2);
  });

  it('does nothing with an answer that is not a key', async () => {
    const { env, signer } = await bootLegacy();
    signer.pubAnswer = 'not-a-key';
    expect(await send(env, decrypt)).toMatchObject({ error: expect.any(String) });
    expect(signer.requests.some(r => r.method === 'nip44_decrypt')).toBe(false);
    expect(env.local._dump().bunkerSessions[0].userPubkey ?? null).toBeNull();
  });

  it('refuses a session that turns out to be someone else', async () => {
    const { env, signer } = await bootLegacy();
    signer.pubAnswer = OTHER_SIGNER_PUB;
    expect(await send(env, decrypt)).toMatchObject({ error: 'identity_mismatch' });
    expect(signer.requests.some(r => r.method === 'nip44_decrypt')).toBe(false);
  });
});

describe('closing a session with a request on its way', () => {
  const holdSigning = (signer) => {
    let open;
    const gate = new Promise((resolve) => { open = resolve; });
    signer.beforeAnswer = async (method) => { if (method === 'sign_event') await gate; };
    return open;
  };

  it('a reconnect answers the waiting request straight away', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    await env.flushWrites();
    const open = holdSigning(signer);
    const waiting = env.dispatch(sign(1), PAGE_SENDER);
    await settle(20);
    signer.beforeAnswer = undefined;
    await connect(env);
    expect(await answerWithin(waiting, 500)).toMatchObject({ error: 'bunker_error' });
    open();
  });

  it('a disconnect answers it too', async () => {
    const { env, signer } = await boot([bunker({ hosts: GRANT('signEvent:1') })]);
    await connect(env);
    await env.flushWrites();
    holdSigning(signer);
    const waiting = env.dispatch(sign(1), PAGE_SENDER);
    await settle(20);
    await env.dispatch({ kind: 'bunker.disconnect', payload: 0 });
    expect(await answerWithin(waiting, 500)).toMatchObject({ error: 'bunker_error' });
  });
});
