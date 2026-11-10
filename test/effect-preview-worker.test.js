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

const signA = (event) => finalizeEvent(event, hexToBytes(HEX_A));

async function boot(hosts = {}, { events = null, profile = {} } = {}) {
  const relay = installRelay();
  relay.events.push(...(events ?? [await signA({ kind: 3, tags: follows(20), content: '', created_at: 1700000000 })]));
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
  const env = await bootWorker({
    profiles: [localProfile(blobs[0], hosts, { relays: RELAYS, ...profile })],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
  });
  return { env, relay };
}

afterEach(() => {
  vi.useRealTimers();
  vi.doUnmock('../src/utilities/bunker-server');
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

const sendEvent = (env, payload) => env.dispatch({ kind: 'signEvent', host: ORIGIN, payload }, PAGE_SENDER);

describe('kind 0 and 10002', () => {
  it('kind 0 with nothing to compare asks even with a grant, says so, and needs no tick', async () => {
    const { env } = await boot({ [ORIGIN]: { 'signEvent:0': 'allow' } }, { events: [] });
    const answer = track(sendEvent(env, { kind: 0, content: '{"name":"Ann"}', tags: [], created_at: 1700000100 }));
    await settle(60);
    expect(env.tabs.shown).toHaveLength(1);
    const [{ uuid }] = env.tabs.shown;
    const effect = await ask(env, { kind: 'promptEffect', payload: uuid });
    expect(effect).toEqual({
      lines: ["Could not check your current profile, so this can't be compared.", 'Sets name.'],
      destructive: false, basis: 'none',
    });
    expect(await ask(env, { kind: 'allowed', payload: uuid })).toBe(true);
    await settle(30);
    expect(answer.value).toMatchObject({ kind: 0 });
  });

  it('kind 0 compared with the relay copy and only changing a field signs from the grant', async () => {
    const current = await signA({ kind: 0, content: '{"name":"Ann"}', tags: [], created_at: 1700000000 });
    const { env } = await boot({ [ORIGIN]: { 'signEvent:0': 'allow' } }, { events: [current] });
    const answer = await answerWithin(sendEvent(env, { kind: 0, content: '{"name":"Anne"}', tags: [], created_at: 1700000100 }), 4000);
    expect(answer).toMatchObject({ kind: 0 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('kind 10002 is compared with a newer relay copy over the stored relay list event', async () => {
    const A = RELAYS[0].url;
    const older = await signA({ kind: 10002, content: '', tags: [['r', A]], created_at: 1700000000 });
    const newer = await signA({ kind: 10002, content: '', tags: [['r', A], ['r', 'wss://b.example', 'write']], created_at: 1700000050 });
    const { env } = await boot({}, { events: [newer], profile: { relayListEvent: older } });
    track(sendEvent(env, { kind: 10002, content: '', tags: [['r', A]], created_at: 1700000100 }));
    await settle(30);
    const [{ uuid }] = env.tabs.shown;
    const effect = await ask(env, { kind: 'promptEffect', payload: uuid });
    expect(effect.lines).toEqual(['Removes 1 relay: b.example.']);
    expect(effect).toMatchObject({ destructive: true, basis: 'relays' });
  });
});

describe('a remote app (bunker) request', () => {
  async function bootBunker() {
    const hooks = {};
    vi.doMock('../src/utilities/bunker-server', async (importOriginal) => ({
      ...(await importOriginal()),
      BunkerServer: class {
        async start(opts) { Object.assign(hooks, opts); }
        stop() {}
        status() { return {}; }
        getConnectionString() { return 'bunker://x'; }
      },
    }));
    const { env } = await boot();
    await env.dispatch({ kind: 'bunkerServer.start', payload: {} }, PERMISSION_SENDER);
    return { env, hooks };
  }

  it('a destructive list change shows its lines and is refused without the tick', async () => {
    const { env, hooks } = await bootBunker();
    const unsigned = { kind: 3, content: '', tags: follows(2), created_at: 1700000100 };
    const effect = await hooks.effectOf(unsigned);
    expect(effect).toMatchObject({ destructive: true, basis: 'relays' });
    expect(effect.lines[0]).toBe('Removes 18 of your 20 follows.');

    const decision = track(hooks.requestApproval({
      clientPubkey: 'c'.repeat(64), method: 'sign_event', kind: 3, unsigned, rememberable: true, effect,
    }));
    await settle(30);
    const [{ uuid }] = env.tabs.shown;
    expect((await ask(env, { kind: 'promptReady', payload: uuid })).effect).toEqual(effect);
    expect(await ask(env, { kind: 'allowed', payload: uuid })).toBe(false);
    await settle(10);
    expect(decision.answered).toBe(false);
    expect(await ask(env, { kind: 'allowed', payload: uuid, understood: true })).toBe(true);
    await settle(10);
    expect(decision.value).toMatchObject({ approved: true });
  });

  it('a delete gets a preview too', async () => {
    const { hooks } = await bootBunker();
    const effect = await hooks.effectOf({ kind: 5, content: '', tags: [['e', hex(7)]], created_at: 1 });
    expect(effect).toMatchObject({ destructive: true, lines: ['Asks relays to delete 1 event.', expect.any(String)] });
  });
});
