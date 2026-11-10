/**
 * The effect preview on the REAL worker: a kind 3 compared with the identity's
 * current follow list from its relays (a stand-in behind WebSocket).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { finalizeEvent, hexToBytes } from 'nostr-crypto-utils';
import {
  bootWorker, deviceWrapped, localProfile, answerWithin, settle, track,
  HEX_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import { installRelay } from './helpers/relay-stand-in.js';

const RELAYS = [{ url: 'wss://relay.stand-in.example', read: true, write: true }];
const hex = (n) => n.toString(16).padStart(64, '0');
const follows = (n) => Array.from({ length: n }, (_, i) => ['p', hex(i + 1)]);
const request = (env, tags) => env.dispatch({
  kind: 'signEvent', host: ORIGIN, payload: { kind: 3, content: '', tags, created_at: 1700000100 },
}, PAGE_SENDER);
const ask = (env, message) => new Promise(r => env.deliver(message, PERMISSION_SENDER, r));

async function boot(hosts = {}) {
  const relay = installRelay();
  relay.events.push(await finalizeEvent({ kind: 3, tags: follows(20), content: '', created_at: 1700000000 }, hexToBytes(HEX_A)));
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
  const env = await bootWorker({
    profiles: [localProfile(blobs[0], hosts, { relays: RELAYS })],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
  });
  return { env, relay };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('effect preview in the worker', () => {
  it('the prompt reads the effect through promptReady and promptEffect, not the address', async () => {
    const { env } = await boot();
    track(request(env, follows(2)));
    await settle(30);
    const [{ uuid, url }] = env.tabs.shown;
    expect(url).not.toMatch(/Removes|effect/);
    const ready = await ask(env, { kind: 'promptReady', payload: uuid });
    expect(ready.effect).toBeTruthy();
    const effect = await ask(env, { kind: 'promptEffect', payload: uuid });
    expect(effect.lines[0]).toBe('Removes 18 of your 20 follows.');
    expect(effect.destructive).toBe(true);
    expect(effect.basis).toBe('relays');
    expect((await ask(env, { kind: 'promptReady', payload: uuid })).effect).toEqual(effect);
  });

  it('a destructive allow without understood is refused; with it, it signs', async () => {
    const { env } = await boot();
    const answer = track(request(env, follows(2)));
    await settle(30);
    const [{ uuid }] = env.tabs.shown;
    expect(await ask(env, { kind: 'allowed', payload: uuid })).toBe(false);
    await settle(10);
    expect(answer.answered).toBe(false);
    expect(await ask(env, { kind: 'allowed', payload: uuid, understood: true })).toBe(true);
    await settle(30);
    expect(answer.value).toMatchObject({ kind: 3 });
  });

  it('a destructive change asks even with a stored grant', async () => {
    const { env } = await boot({ [ORIGIN]: { 'signEvent:3': 'allow' } });
    const answer = track(request(env, follows(2)));
    await settle(60);
    expect(env.tabs.shown).toHaveLength(1);
    expect(answer.answered).toBe(false);
  });

  it('a non-destructive change with a stored grant still signs with no prompt', async () => {
    const { env } = await boot({ [ORIGIN]: { 'signEvent:3': 'allow' } });
    const answer = await answerWithin(request(env, follows(21)), 4000);
    expect(answer).toMatchObject({ kind: 3 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('a non-destructive prompt approves with no tick', async () => {
    const { env } = await boot();
    const answer = track(request(env, follows(21)));
    await settle(30);
    const [{ uuid }] = env.tabs.shown;
    const effect = await ask(env, { kind: 'promptEffect', payload: uuid });
    expect(effect).toMatchObject({ destructive: false, lines: ['Adds 1 follow.', expect.any(String), 'After this: 21 follows.'] });
    expect(await ask(env, { kind: 'allowed', payload: uuid })).toBe(true);
    await settle(30);
    expect(answer.value).toMatchObject({ kind: 3 });
  });
});
