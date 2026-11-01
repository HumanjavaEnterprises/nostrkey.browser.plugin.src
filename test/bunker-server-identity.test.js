/**
 * NostrKey acting as a remote signer serves one identity: the one it was started
 * for. Real worker, real server, a stand-in relay and client.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { finalizeEvent, getPublicKeySync, hexToBytes, nip44, verifySignature } from 'nostr-crypto-utils';
import {
  bootWorker, deviceWrapped, localProfile, settle, track,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';

const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
const PUB_B = getPublicKeySync(HEX_B);
const CLIENT_HEX = '0000000000000000000000000000000000000000000000000000000000000009';
const CLIENT_PUB = getPublicKeySync(CLIENT_HEX);

const staff = (env, kind, payload, fields = {}) => env.dispatch({ kind, payload, ...fields }, PERMISSION_SENDER);

function installRelay() {
  const relay = { sockets: [], published: [], closed: 0 };
  class Socket {
    constructor() {
      this.subId = null;
      relay.sockets.push(this);
      queueMicrotask(() => this.onopen?.());
    }

    send(frame) {
      const [type, a] = JSON.parse(frame);
      if (type === 'REQ') this.subId = a;
      if (type === 'EVENT') relay.published.push(a);
    }

    close() { relay.closed++; }
  }
  vi.stubGlobal('WebSocket', Socket);
  relay.deliver = async (event) => {
    const [socket] = relay.sockets;
    socket.onmessage?.({ data: JSON.stringify(['EVENT', socket.subId, event]) });
    await settle(30);
  };
  return relay;
}

async function bootServer(second = HEX_B) {
  const relay = installRelay();
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, second);
  const env = await bootWorker({
    profiles: [localProfile(blobs[0]), localProfile(blobs[1], {}, { name: 'P2', pubKey: getPublicKeySync(second) })],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
  });
  const { uri } = await staff(env, 'bunkerServer.start', {});
  const secret = new URL(uri.replace('bunker://', 'https://')).searchParams.get('secret');
  return { env, relay, secret };
}

let nextId = 0;
const ask = async (relay, userPub, method, params) => {
  const conversation = nip44.v2.utils.getConversationKey(hexToBytes(CLIENT_HEX), userPub);
  const id = `r${nextId++}`;
  const event = await finalizeEvent({
    kind: 24133,
    content: nip44.v2.encrypt(JSON.stringify({ id, method, params }), conversation),
    tags: [['p', userPub]],
    created_at: Math.floor(Date.now() / 1000),
  }, hexToBytes(CLIENT_HEX));
  await relay.deliver(event);
  return {
    id,
    reply: () => relay.published
      .map(e => JSON.parse(nip44.v2.decrypt(e.content, conversation)))
      .find(r => r.id === id),
  };
};

const signRequest = () => ['sign_event', [JSON.stringify({ kind: 1, content: 'x', tags: [], created_at: 1700000000 })]];

async function connectClient(env, relay, secret) {
  const connected = await ask(relay, PUB_A, 'connect', [PUB_A, secret]);
  expect(connected.reply()).toMatchObject({ result: 'ack' });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('the identity a running server answers for', () => {
  it('signs as the identity it was started for', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const request = await ask(relay, PUB_A, ...signRequest());
    await staff(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    expect(JSON.parse(request.reply().result).pubkey).toBe(PUB_A);
    expect(await staff(env, 'bunkerServer.status')).toMatchObject({ active: true });
  });

  it('signs as that identity whatever pubkey the client put in the event', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const event = { kind: 1, content: 'x', tags: [], created_at: 1700000000, pubkey: PUB_B };
    const request = await ask(relay, PUB_A, 'sign_event', [JSON.stringify(event)]);
    await staff(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    const signed = JSON.parse(request.reply().result);
    expect(signed.pubkey).toBe(PUB_A);
    expect(await verifySignature(signed)).toBe(true);
  });

  it('tells the prompt whether a remembered choice would be kept', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const queryOf = (n) => new URL(env.tabs.shown[n].url).searchParams;

    await ask(relay, PUB_A, ...signRequest());
    expect(queryOf(0).get('inbound')).toBe('1');
    expect(queryOf(0).get('rememberable')).toBe('1');
    expect(queryOf(0).get('grantKey')).toBe('signEvent:1');
    expect(queryOf(0).get('profileName')).toBe('P1');
    await staff(env, 'denied', queryOf(0).get('uuid'));
    await settle(30);

    await ask(relay, PUB_A, 'sign_event', [JSON.stringify({ kind: 4, content: 'x', tags: [], created_at: 1700000000 })]);
    expect(queryOf(1).get('inbound')).toBe('1');
    expect(queryOf(1).get('rememberable')).toBe('0');
  });

  it('after a profile switch it stops, signs nothing and asks nothing', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    const before = relay.published.length;

    const request = await ask(relay, PUB_A, ...signRequest());
    expect(request.reply()).toBeUndefined();
    expect(relay.published).toHaveLength(before);
    expect(env.tabs.shown).toEqual([]);
    expect(relay.closed).toBeGreaterThan(0);
    expect(await staff(env, 'bunkerServer.status')).toEqual({ active: false, uri: null, clientCount: 0 });
  });

  it('reports itself stopped after a switch, before any request arrives', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    expect(await staff(env, 'bunkerServer.status')).toEqual({ active: false, uri: null, clientCount: 0 });
    expect(relay.closed).toBeGreaterThan(0);
  });

  it('lists no connections after a switch', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    expect(await staff(env, 'bunkerServer.connections')).toEqual({ connections: [] });
  });

  it('a revoke after a switch reports nothing to revoke', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    expect(await staff(env, 'bunkerServer.revoke', { clientPubkey: CLIENT_PUB })).toMatchObject({ success: false });
  });

  it('stops on a switch to another profile holding the same key', async () => {
    const { env } = await bootServer(HEX_A);
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    expect(await staff(env, 'bunkerServer.status')).toMatchObject({ active: false });
  });

  it('stops if the key behind that identity is replaced', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    await staff(env, 'savePrivateKey', [0, HEX_B]);
    await env.flushWrites();
    const request = await ask(relay, PUB_A, ...signRequest());
    expect(request.reply()).toBeUndefined();
    expect(await staff(env, 'bunkerServer.status')).toMatchObject({ active: false });
  });

  it('a switch while an approval is open still signs only as the identity it started for', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const request = await ask(relay, PUB_A, ...signRequest());
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    await staff(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    expect(JSON.parse(request.reply().result).pubkey).toBe(PUB_A);
  });

  it('can be started again for the identity switched to', async () => {
    const { env, relay } = await bootServer();
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    expect(await staff(env, 'bunkerServer.status')).toMatchObject({ active: false });

    relay.sockets.length = 0;
    const { uri } = await staff(env, 'bunkerServer.start', {});
    expect(uri).toContain(PUB_B);
    const secret = new URL(uri.replace('bunker://', 'https://')).searchParams.get('secret');
    const connected = await ask(relay, PUB_B, 'connect', [PUB_B, secret]);
    expect(connected.reply()).toMatchObject({ result: 'ack' });
    expect(await staff(env, 'bunkerServer.status')).toMatchObject({ active: true });
  });

  it('a stop leaves nothing running', async () => {
    const { env } = await bootServer();
    await staff(env, 'bunkerServer.stop');
    expect(await staff(env, 'bunkerServer.status')).toEqual({ active: false, uri: null, clientCount: 0 });
  });

  it('an approval that reaches the front after a switch is declined without a prompt', async () => {
    const { env, relay, secret } = await bootServer();
    await ask(relay, PUB_A, 'connect', [PUB_A, secret]);
    const page = track(env.dispatch({ kind: 'signEvent', host: ORIGIN, payload: { kind: 1, content: 'p', tags: [], created_at: 1 } }, PAGE_SENDER));
    await settle(30);
    const held = await ask(relay, PUB_A, ...signRequest());
    const { setProfileIndex } = await import('../src/utilities/utils.js');
    await setProfileIndex(1);
    await env.flushWrites();
    await staff(env, 'denied', env.tabs.shown[0].uuid);
    await settle(40);
    expect(page.answered).toBe(true);
    expect(env.tabs.shown).toHaveLength(1);
    expect(held.reply()?.result ?? null).toBeNull();
    // The prompt lock came back, so the next request can ask.
    const next = track(env.dispatch({ kind: 'signEvent', host: ORIGIN, payload: { kind: 1, content: 'q', tags: [], created_at: 2 } }, PAGE_SENDER));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
    expect(next.answered).toBe(false);
  });

  it('starting again replaces the running server', async () => {
    const { env, relay, secret } = await bootServer();
    await connectClient(env, relay, secret);
    const closed = relay.closed;
    const { uri } = await staff(env, 'bunkerServer.start', {});
    expect(uri).toBeTruthy();
    expect(relay.closed).toBeGreaterThan(closed);
    expect(await staff(env, 'bunkerServer.status')).toMatchObject({ active: true, uri, clientCount: 0 });
  });

  it('a start that fails leaves nothing running', async () => {
    const { env, relay } = await bootServer();
    const closed = relay.closed;
    vi.stubGlobal('WebSocket', class { constructor() { throw new Error('no sockets'); } });
    await staff(env, 'bunkerServer.start', {});
    expect(relay.closed).toBeGreaterThan(closed);
  });
});
