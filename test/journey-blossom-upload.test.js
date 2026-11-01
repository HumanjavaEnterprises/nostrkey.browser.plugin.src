/**
 * Ring 2.5: pasting images into a site that uploads to Blossom, from a remote
 * signer profile, on the real worker with a fake signer behind a fake relay.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  bootWorker, deviceWrapped, answerWithin, settle, HEX_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';

const ADDRESS = `bunker://${SIGNER_PUB}?relay=wss://relay.example.com`;
const NOW = () => Math.floor(Date.now() / 1000);

const serverList = () => ({
  kind: 'signEvent', host: ORIGIN,
  payload: { kind: 10063, content: '', created_at: NOW(), tags: [['server', 'https://cdn.example.com']] },
});
const upload = (n) => ({
  kind: 'signEvent', host: ORIGIN,
  payload: {
    kind: 24242, content: 'Uploading media file', created_at: NOW(),
    tags: [['t', 'upload'], ['expiration', String(NOW() + 3600)], ['x', String(n).padStart(64, '0')]],
  },
});
const paste = (env, request) => env.dispatch(request, PAGE_SENDER);
const approve = (env, uuid) => env.dispatch({ kind: 'allowed', payload: uuid, remember: true }, PERMISSION_SENDER);

async function connected(profile) {
  const signer = installFakeSigner();
  const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
  const env = await bootWorker({
    profiles: [{
      name: 'Remote', privKey: '', pubKey: '', relays: [], type: 'bunker',
      bunkerUrl: null, remotePubkey: SIGNER_PUB, hosts: {}, ...profile,
    }],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
  });
  const res = await env.dispatch({ kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: ADDRESS } });
  expect(res).toMatchObject({ success: true });
  await env.flushWrites();
  return { env, signer };
}

async function journey(env, signer) {
  const first = paste(env, serverList());
  await settle(30);
  await approve(env, env.tabs.shown[0].uuid);
  expect(await answerWithin(first)).toMatchObject({ kind: 10063, pubkey: SIGNER_PUB });

  const second = paste(env, upload(0));
  await settle(30);
  await approve(env, env.tabs.shown[1].uuid);
  expect(await answerWithin(second)).toMatchObject({ kind: 24242, pubkey: SIGNER_PUB });
  await env.flushWrites();
  expect(env.tabs.shown).toHaveLength(2);

  signer.requests.length = 0;
  const answers = await Promise.all(
    Array.from({ length: 10 }, (_, i) => answerWithin(paste(env, upload(i + 1)))),
  );
  for (const signed of answers) expect(signed).toMatchObject({ kind: 24242, pubkey: SIGNER_PUB });
  expect(env.tabs.shown).toHaveLength(2);
  expect(signer.requests.filter(r => r.method === 'sign_event')).toHaveLength(10);
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('pasting into a site that uploads to Blossom', () => {
  it('asks once per thing, then never again', async () => {
    const { env, signer } = await connected({});
    await journey(env, signer);
  });

  it('works the same on a profile that arrived by sync, with a stored session', async () => {
    const { env, signer } = await connected({});
    const { profiles } = await env.local.get('profiles');
    const { hosts, ...adopted } = profiles[0];
    await env.local.set({ profiles: [adopted] });

    const next = await env.restart();
    expect((await next.local.get('bunkerSessions')).bunkerSessions[0]).toBeTruthy();
    expect((await next.local.get('profiles')).profiles[0]).not.toHaveProperty('hosts');
    await journey(next, signer);
  });
});
