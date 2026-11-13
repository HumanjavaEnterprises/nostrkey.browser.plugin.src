/**
 * What a remote signer sends back is checked against what was authorised before
 * anyone sees it. Real worker, fake signer.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { finalizeEvent, getPublicKeySync, hexToBytes, nip19, verifySignature } from 'nostr-crypto-utils';
import {
  bootWorker, deviceWrapped, localProfile, answerWithin,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER,
} from './helpers/boot-worker.js';
import {
  installFakeSigner, SIGNER_HEX, SIGNER_PUB, OTHER_SIGNER_HEX,
} from './helpers/fake-signer.js';

const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
const PUB_B = getPublicKeySync(HEX_B);
const ADDRESS = `bunker://${SIGNER_PUB}?relay=wss://relay.example.com`;
const GRANT = (key) => ({ [ORIGIN]: { [key]: 'allow' } });
const SHA = 'a'.repeat(64);
const bunker = (overrides = {}) => ({
  name: 'Remote', privKey: '', pubKey: '', relays: [], type: 'bunker',
  bunkerUrl: null, remotePubkey: SIGNER_PUB, hosts: {}, ...overrides,
});
const request = (fields = {}) => ({
  kind: 'signEvent', host: ORIGIN, payload: { kind: 1, content: 'x', tags: [], created_at: 1700000000, ...fields },
});
const send = (env, message) => answerWithin(env.dispatch(message, PAGE_SENDER), 2000);
const signedBy = (hex, event) => finalizeEvent(event, hexToBytes(hex));
const NOW = () => Math.floor(Date.now() / 1000);

async function bootRemote(hosts) {
  const signer = installFakeSigner();
  const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
  const env = await bootWorker({
    profiles: [bunker({ hosts })], profileIndex: 0, isEncrypted: false, autoLockMinutes: 0,
    deviceKeySeed, deviceKeyStrategy,
  });
  await env.dispatch({ kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: ADDRESS } });
  await env.flushWrites();
  return { env, signer };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('an answer from a remote signer', () => {
  it('that matches the request reaches the site and the event history', async () => {
    const { env } = await bootRemote(GRANT('signEvent:1'));
    const event = await send(env, request({ tags: [['t', 'hello']] }));
    expect(event.pubkey).toBe(SIGNER_PUB);
    expect(event.tags).toEqual([['t', 'hello']]);
    expect(await verifySignature(event)).toBe(true);
    expect(env.savedEvents).toHaveLength(1);
  });

  const refused = [
    ['a different kind', { kind: 5 }],
    ['different content', { content: 'y' }],
    ['different tags', { tags: [['t', 'other']] }],
    ['a different time', { created_at: 1700000001 }],
  ];
  for (const [name, changed] of refused) {
    it(`with ${name} is refused and not recorded`, async () => {
      const { env, signer } = await bootRemote(GRANT('signEvent:1'));
      signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
        kind: 1, content: 'x', tags: [], created_at: 1700000000, ...changed,
      }));
      const answer = await send(env, request());
      expect(answer).toMatchObject({ error: 'signer_mismatch' });
      expect(env.savedEvents).toHaveLength(0);
    });
  }

  it('with an upload request rewritten to a delete is refused', async () => {
    const tags = (verb) => [['t', verb], ['x', SHA], ['expiration', String(NOW() + 600)]];
    const { env, signer } = await bootRemote(GRANT('signEvent:24242:upload'));
    const created_at = NOW();
    signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
      kind: 24242, content: 'Upload', tags: tags('delete'), created_at,
    }));
    const answer = await send(env, { kind: 'signEvent', host: ORIGIN, payload: { kind: 24242, content: 'Upload', tags: tags('upload'), created_at } });
    expect(answer).toMatchObject({ error: 'signer_mismatch' });
    expect(env.savedEvents).toHaveLength(0);
  });

  it('with a bad signature is refused', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    const good = await signedBy(SIGNER_HEX, { kind: 1, content: 'x', tags: [], created_at: 1700000000 });
    signer.signAnswer = JSON.stringify({ ...good, sig: 'f'.repeat(128) });
    expect(await send(env, request())).toMatchObject({ error: 'signer_mismatch' });
    expect(env.savedEvents).toHaveLength(0);
  });

  it('with an id that does not match its contents is refused', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    const good = await signedBy(SIGNER_HEX, { kind: 1, content: 'x', tags: [], created_at: 1700000000 });
    signer.signAnswer = JSON.stringify({ ...good, id: '0'.repeat(64) });
    expect(await send(env, request())).toMatchObject({ error: 'signer_mismatch' });
  });

  it('signed by another key but naming this identity is refused', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    const other = await signedBy(OTHER_SIGNER_HEX, { kind: 1, content: 'x', tags: [], created_at: 1700000000 });
    signer.signAnswer = JSON.stringify({ ...other, pubkey: SIGNER_PUB });
    expect(await send(env, request())).toMatchObject({ error: 'signer_mismatch' });
    expect(env.savedEvents).toHaveLength(0);
  });

  it('that is only a pubkey is refused', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    signer.signAnswer = JSON.stringify({ pubkey: SIGNER_PUB });
    expect(await send(env, request())).toMatchObject({ error: 'signer_mismatch' });
  });

  it('for another identity is refused as such', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    signer.signAsHex = OTHER_SIGNER_HEX;
    expect(await send(env, request())).toMatchObject({ error: 'identity_mismatch' });
    expect(env.savedEvents).toHaveLength(0);
  });

  describe('when the request gave no time', () => {
    const untimed = { kind: 'signEvent', host: ORIGIN, payload: { kind: 1, content: 'x', tags: [] } };

    it('may carry the signer\'s own current time', async () => {
      const { env } = await bootRemote(GRANT('signEvent:1'));
      const event = await send(env, untimed);
      expect(event.sig).toBeTruthy();
      expect(Math.abs(event.created_at - NOW())).toBeLessThan(5);
    });

    for (const [name, offset] of [['far past', -400], ['far future', 400]]) {
      it(`is refused with a time in the ${name}`, async () => {
        const { env, signer } = await bootRemote(GRANT('signEvent:1'));
        signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
          kind: 1, content: 'x', tags: [], created_at: NOW() + offset,
        }));
        expect(await send(env, untimed)).toMatchObject({ error: 'signer_mismatch' });
      });
    }

    it('is refused with a time that is not a whole number', async () => {
      const { env, signer } = await bootRemote(GRANT('signEvent:1'));
      signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
        kind: 1, content: 'x', tags: [], created_at: String(NOW()),
      }));
      expect(await send(env, untimed)).toMatchObject({ error: 'signer_mismatch' });
    });

    it('accepts a slow clock inside the window', async () => {
      const { env, signer } = await bootRemote(GRANT('signEvent:1'));
      signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
        kind: 1, content: 'x', tags: [], created_at: NOW() - 280,
      }));
      expect((await send(env, untimed)).sig).toBeTruthy();
    });
  });

  it('with a key in upper case is refused', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
      kind: 1, content: 'x', tags: [], created_at: 1700000000, pubkey: SIGNER_PUB.toUpperCase(),
    }));
    expect(await send(env, request())).toMatchObject({ error: 'signer_mismatch' });
  });

  it('with empty content and tags matches a request that left them out', async () => {
    const { env } = await bootRemote(GRANT('signEvent:1'));
    const event = await send(env, { kind: 'signEvent', host: ORIGIN, payload: { kind: 1, created_at: 1700000000 } });
    expect(event.sig).toBeTruthy();
    expect(event).toMatchObject({ content: '', tags: [] });
  });

  describe('tidied by the signer', () => {
    const NPUB = nip19.npubEncode(PUB_B);
    const asTidied = {
      kind: 1, content: `#gm nostr:${NPUB}`, created_at: 1700000000,
      tags: [['p', PUB_B], ['t', 'gm'], ['client', 'an app']],
    };

    it('reaches the site and the event history as the signer signed it', async () => {
      const { env, signer } = await bootRemote(GRANT('signEvent:1'));
      const signed = await signedBy(SIGNER_HEX, asTidied);
      signer.signAnswer = JSON.stringify({ ...signed, note: 'extra' });
      const answer = await send(env, request({ content: `#gm @${NPUB}` }));
      expect(answer).toEqual(signed);
      expect(Object.keys(answer).sort()).toEqual(['content', 'created_at', 'id', 'kind', 'pubkey', 'sig', 'tags']);
      expect(await verifySignature(answer)).toBe(true);
      expect(env.savedEvents).toHaveLength(1);
      expect(env.savedEvents[0].event).toEqual(signed);
    });

    it('with an upload that gained a tag is refused and not recorded', async () => {
      const tags = [['t', 'upload'], ['x', SHA], ['expiration', String(NOW() + 600)]];
      const { env, signer } = await bootRemote(GRANT('signEvent:24242:upload'));
      const created_at = NOW();
      signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
        kind: 24242, content: 'Upload', tags: [...tags, ['client', 'an app']], created_at,
      }));
      const answer = await send(env, { kind: 'signEvent', host: ORIGIN, payload: { kind: 24242, content: 'Upload', tags, created_at } });
      expect(answer).toMatchObject({ error: 'signer_mismatch' });
      expect(env.savedEvents).toHaveLength(0);
    });

    it('with a tag the content does not support is refused and not recorded', async () => {
      const { env, signer } = await bootRemote(GRANT('signEvent:1'));
      signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, {
        kind: 1, content: 'x', tags: [['t', 'other']], created_at: 1700000000,
      }));
      expect(await send(env, request())).toMatchObject({ error: 'signer_mismatch' });
      expect(env.savedEvents).toHaveLength(0);
    });
  });

  it('carries nothing beyond the fields that were checked', async () => {
    const { env, signer } = await bootRemote(GRANT('signEvent:1'));
    const good = await signedBy(SIGNER_HEX, { kind: 1, content: 'x', tags: [], created_at: 1700000000 });
    signer.signAnswer = JSON.stringify({ ...good, note: 'extra' });
    expect(await send(env, request())).toEqual(good);
  });
});

describe('what NostrKey signs for itself on a remote signer', () => {
  const PUBLISH_RELAYS = [{ url: 'wss://relay.example.com', read: true, write: true }];
  const VAULT_ACTIONS = [
    ['vault.publish', { path: 'notes/a.md', content: 'hello' }],
    ['vault.delete', { path: 'notes/a.md', eventId: SHA }],
    ['apikeys.publish', { keys: { one: 'value' } }],
    ['apikeys.delete', { eventId: SHA }],
  ];

  async function bootVault() {
    const { env, signer } = await bootRemote({});
    const profiles = env.local._dump().profiles;
    profiles[0].relays = PUBLISH_RELAYS;
    await env.local.set({ profiles });
    await env.flushWrites();
    return { env, signer };
  }

  for (const [kind, payload] of VAULT_ACTIONS) {
    it(`${kind} publishes a signature that matches`, async () => {
      const { env, signer } = await bootVault();
      expect(await env.dispatch({ kind, payload })).toMatchObject({ success: true });
      expect(signer.published).toHaveLength(1);
      expect(signer.published[0].pubkey).toBe(SIGNER_PUB);
    });

    it(`${kind} publishes nothing when the signature is for a different event`, async () => {
      const { env, signer } = await bootVault();
      signer.signAnswer = JSON.stringify(await signedBy(SIGNER_HEX, { kind: 1, content: 'other', tags: [], created_at: NOW() }));
      expect(await env.dispatch({ kind, payload })).toMatchObject({ success: false });
      expect(signer.published).toEqual([]);
    });

    it(`${kind} publishes nothing when another key signed`, async () => {
      const { env, signer } = await bootVault();
      signer.signAsHex = OTHER_SIGNER_HEX;
      expect(await env.dispatch({ kind, payload })).toMatchObject({ success: false });
      expect(signer.published).toEqual([]);
    });
  }
});

describe('a local profile', () => {
  it('signs as itself whatever pubkey the site put in the event', async () => {
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [localProfile(blobs[0], GRANT('signEvent:1'))], profileIndex: 0,
      isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    const event = await send(env, request({ pubkey: PUB_B }));
    expect(event.pubkey).toBe(PUB_A);
    expect(await verifySignature(event)).toBe(true);
  });
});
