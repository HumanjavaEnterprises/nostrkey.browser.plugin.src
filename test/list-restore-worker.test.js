/**
 * Saved versions and restore on the REAL worker, with a relay stand-in behind
 * WebSocket: what gets captured, what restore signs and publishes, what it
 * refuses, the slow-shrink check under a grant, and the sender gate.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { finalizeEvent, hexToBytes, getPublicKeySync } from 'nostr-crypto-utils';
import {
  bootWorker, bootWithPassword, deviceWrapped, localProfile, answerWithin, settle, track,
  HEX_A, PUB_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import { installRelay } from './helpers/relay-stand-in.js';

const RELAY = 'wss://relay.stand-in.example';
const RELAYS = [{ url: RELAY, read: true, write: true }];
const hex = (n) => n.toString(16).padStart(64, '0');
const follows = (n, from = 1) => Array.from({ length: n }, (_, i) => ['p', hex(i + from)]);
const signA = (event) => finalizeEvent(event, hexToBytes(HEX_A));
const ext = (env, kind, payload) => env.dispatch({ kind, payload }, PERMISSION_SENDER);

async function boot(events = [], hosts = {}, profile = {}) {
  const relay = installRelay();
  relay.events.push(...events);
  const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
  const env = await bootWorker({
    profiles: [localProfile(blobs[0], hosts, { relays: RELAYS, ...profile })],
    profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
  });
  return { env, relay };
}

const versionsOf = (res, kind) => res.kinds.find(k => k.kind === kind).versions;

afterEach(() => {
  vi.useRealTimers();
  vi.doUnmock('../src/utilities/bunker-server');
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('capture', () => {
  it('opening the profile tab saves kinds 0, 3, 10000 and 10002 from relays', async () => {
    const events = [
      await signA({ kind: 0, content: '{"name":"Ann"}', tags: [], created_at: 1700000000 }),
      await signA({ kind: 3, content: '', tags: follows(450), created_at: 1700000000 }),
      await signA({ kind: 10000, content: 'opaque', tags: follows(6), created_at: 1700000000 }),
      await signA({ kind: 10002, content: '', tags: [['r', RELAY], ['r', 'wss://b.example', 'read']], created_at: 1700000000 }),
    ];
    const { env } = await boot(events);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const res = await ext(env, 'profile.history', { pubkey: PUB_A });
    expect(versionsOf(res, 0)[0]).toMatchObject({ summary: 'Name: Ann', current: true });
    expect(versionsOf(res, 3)[0].summary).toBe('450 follows');
    expect(versionsOf(res, 10000)[0].summary).toBe('6 muted items, plus a private part');
    expect(versionsOf(res, 10002)[0].summary).toBe('2 relays');
  });

  it('a list signed through signEvent is saved as a new version', async () => {
    const current = await signA({ kind: 3, content: '', tags: follows(20), created_at: 1700000000 });
    const { env } = await boot([current], { [ORIGIN]: { 'signEvent:3': 'allow' } });
    const signed = await answerWithin(env.dispatch({ kind: 'signEvent', host: ORIGIN,
      payload: { kind: 3, content: '', tags: follows(21), created_at: 1700000100 } }, PAGE_SENDER), 4000);
    expect(signed).toMatchObject({ kind: 3 });
    const v = versionsOf(await ext(env, 'profile.history', { pubkey: PUB_A }), 3);
    expect(v.map(x => x.id)).toEqual([signed.id, current.id]);
  });

  it('a list a remote app signs through the bunker is saved', async () => {
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
    await ext(env, 'bunkerServer.start', {});
    const signed = await signA({ kind: 10000, content: '', tags: follows(3), created_at: 1700000000 });
    await hooks.onSigned(signed);
    expect(versionsOf(await ext(env, 'profile.history', { pubkey: PUB_A }), 10000)[0].id).toBe(signed.id);
  });
});

describe('restore', () => {
  async function twoVersions({ largeFirst = false } = {}) {
    const small = await signA({ kind: 3, content: '', tags: follows(2), created_at: largeFirst ? 1700000050 : 1700000000 });
    const large = await signA({ kind: 3, content: '', tags: follows(20), created_at: largeFirst ? 1700000000 : 1700000050 });
    const { env, relay } = await boot([largeFirst ? large : small]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    relay.events.push(largeFirst ? small : large);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    return { env, relay, small, large };
  }

  it('re-signs the saved tags and content with a fresh created_at and publishes', async () => {
    const { env, relay, small, large } = await twoVersions({ largeFirst: true });
    const preview = await ext(env, 'profile.restorePreview', { pubkey: PUB_A, kind: 3, id: large.id });
    expect(preview.effect).toMatchObject({ destructive: false });
    expect(preview.effect.lines[0]).toBe('Adds 18 follows.');
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: large.id });
    expect(res).toMatchObject({ success: true, accepted: 1, total: 1 });
    const out = relay.published.at(-1);
    expect(out.tags).toEqual(large.tags);
    expect(out.content).toBe(large.content);
    expect(out.pubkey).toBe(PUB_A);
    expect(out.id).not.toBe(large.id);
    expect(out.created_at).toBeGreaterThan(small.created_at);
  });

  it('a destructive restore needs understood', async () => {
    const { env, relay, small } = await twoVersions();
    const preview = await ext(env, 'profile.restorePreview', { pubkey: PUB_A, kind: 3, id: small.id });
    expect(preview.effect).toMatchObject({ destructive: true, lines: expect.arrayContaining(['Removes 18 of your 20 follows.']) });
    const refused = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: small.id });
    expect(refused).toMatchObject({ success: false, code: 'needs-understood' });
    expect(relay.published).toEqual([]);
    const ok = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: small.id, understood: true });
    expect(ok.success).toBe(true);
    expect(relay.published.at(-1).tags).toEqual(small.tags);
  });

  it('refuses a version that is not this identity\'s own', async () => {
    const other = '2'.repeat(64);
    const theirs = await finalizeEvent({ kind: 3, content: '', tags: follows(1), created_at: 1700000000 }, hexToBytes(other));
    const { env, relay } = await boot([theirs]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: theirs.id, understood: true });
    expect(res).toMatchObject({ success: false, code: 'not-own' });
    expect(relay.published).toEqual([]);
    const notMine = await ext(env, 'profile.restore', { pubkey: getPublicKeySync(other), kind: 3, id: theirs.id });
    expect(notMine.code).toBe('not-mine');
  });

  it('refuses while NostrKey is locked', async () => {
    const relay = installRelay();
    const env = await bootWithPassword('pw-1234567');
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: hex(9), understood: true });
    expect(res).toMatchObject({ success: false, code: 'locked' });
    expect(relay.published).toEqual([]);
  });

  it('kind 0 restore goes through the profile conflict check', async () => {
    const v1 = await signA({ kind: 0, content: '{"name":"Ann","about":"hi"}', tags: [], created_at: 1700000000 });
    const v2 = await signA({ kind: 0, content: '{"name":"Anne"}', tags: [], created_at: 1700000050 });
    const { env, relay } = await boot([v1]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    relay.events.push(v2);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const preview = await ext(env, 'profile.restorePreview', { pubkey: PUB_A, kind: 0, id: v1.id });
    expect(preview.baseId).toBe(v2.id);
    const stale = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 0, id: v1.id, baseId: v1.id });
    expect(stale.code).toBe('stale');
    expect(relay.published).toEqual([]);
    const ok = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 0, id: v1.id, baseId: v2.id });
    expect(ok).toMatchObject({ success: true, accepted: 1 });
    expect(relay.published.at(-1)).toMatchObject({ kind: 0, content: v1.content, tags: [] });
  });

  it('kind 10002 restore also refreshes the stored relay list event', async () => {
    const v1 = await signA({ kind: 10002, content: '', tags: [['r', RELAY], ['r', 'wss://b.example']], created_at: 1700000000 });
    const v2 = await signA({ kind: 10002, content: '', tags: [['r', RELAY]], created_at: 1700000050 });
    const { env, relay } = await boot([v1]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    relay.events.push(v2);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 10002, id: v1.id });
    expect(res.success).toBe(true);
    await env.flushWrites();
    const [p] = env.local._dump().profiles;
    expect(p.relayListEvent.id).toBe(res.event.id);
    expect(p.relayListEvent.tags).toEqual(v1.tags);
  });
});

describe('slow shrink under a grant', () => {
  it('9 removed per step: the first signs from the grant, later steps prompt', async () => {
    const start = await signA({ kind: 3, content: '', tags: follows(100), created_at: 1700000000 });
    const { env, relay } = await boot([start], { [ORIGIN]: { 'signEvent:3': 'allow' } });
    const step = (k) => env.dispatch({ kind: 'signEvent', host: ORIGIN,
      payload: { kind: 3, content: '', tags: follows(100 - 9 * k, 1 + 9 * k), created_at: 1700000000 + k } }, PAGE_SENDER);

    const first = await answerWithin(step(1), 4000);
    expect(first).toMatchObject({ kind: 3 });
    expect(env.tabs.shown).toEqual([]);
    relay.events.push(first); // the site publishes it

    track(step(2));
    await settle(60);
    expect(env.tabs.shown).toHaveLength(1);
    const [{ uuid }] = env.tabs.shown;
    const effect = await new Promise(r => env.deliver({ kind: 'promptEffect', payload: uuid }, PERMISSION_SENDER, r));
    expect(effect.destructive).toBe(true);
    expect(effect.lines).toContain('Removes 9 of your 91 follows.');
    expect(effect.lines.some(l => /^Removes 18 of the 100 follows you had (earlier today|yesterday)\.$/.test(l))).toBe(true);
  });
});

describe('after a ticked approval', () => {
  it('the next small change is not flagged again for the removal already approved', async () => {
    const start = await signA({ kind: 3, content: '', tags: follows(20), created_at: 1700000000 });
    const { env } = await boot([start], { [ORIGIN]: { 'signEvent:3': 'allow' } });
    const send = (tags, at) => env.dispatch({ kind: 'signEvent', host: ORIGIN, payload: { kind: 3, content: '', tags, created_at: at } }, PAGE_SENDER);
    const big = track(send(follows(2), 1700000100));
    await settle(60);
    const [{ uuid }] = env.tabs.shown;
    expect(await new Promise(r => env.deliver({ kind: 'allowed', payload: uuid, understood: true }, PERMISSION_SENDER, r))).toBe(true);
    await settle(60);
    expect(big.value).toMatchObject({ kind: 3 });
    const next = await answerWithin(send(follows(3), 1700000200), 4000);
    expect(next).toMatchObject({ kind: 3 });
    expect(env.tabs.shown).toHaveLength(1);
  });
});

describe('slow shrink through the bunker', () => {
  it('the remote app path checks the day-old baseline too', async () => {
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
    const start = await signA({ kind: 3, content: '', tags: follows(100), created_at: 1700000000 });
    const { env, relay } = await boot([start]);
    await ext(env, 'bunkerServer.start', {});
    const s1 = { kind: 3, content: '', tags: follows(91, 10), created_at: 1700000001 };
    expect((await hooks.effectOf(s1)).destructive).toBe(false);
    const signed1 = await signA(s1);
    await hooks.onSigned(signed1);
    relay.events.push(signed1);
    const e2 = await hooks.effectOf({ kind: 3, content: '', tags: follows(82, 19), created_at: 1700000002 });
    expect(e2.destructive).toBe(true);
    expect(e2.lines.some(l => l.startsWith('Removes 18 of the 100 follows you had'))).toBe(true);
  });
});

describe('checker follow-ups', () => {
  it('a list only signed here is labelled not seen on relays and is not current', async () => {
    const current = await signA({ kind: 3, content: '', tags: follows(20), created_at: 1700000000 });
    const { env } = await boot([current], { [ORIGIN]: { 'signEvent:3': 'allow' } });
    const signed = await answerWithin(env.dispatch({ kind: 'signEvent', host: ORIGIN,
      payload: { kind: 3, content: '', tags: follows(21), created_at: 1700000100 } }, PAGE_SENDER), 4000);
    const v = versionsOf(await ext(env, 'profile.history', { pubkey: PUB_A }), 3);
    expect(v.find(x => x.id === signed.id)).toMatchObject({ seen: false, current: false });
    expect(v.find(x => x.id === current.id)).toMatchObject({ seen: true, current: true });
  });

  it('a failed restore leaves the baseline as it was', async () => {
    const small = await signA({ kind: 3, content: '', tags: follows(2), created_at: 1700000000 });
    const large = await signA({ kind: 3, content: '', tags: follows(20), created_at: 1700000050 });
    const { env, relay } = await boot([small]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    relay.events.push(large);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const Base = globalThis.WebSocket;
    vi.stubGlobal('WebSocket', class extends Base {
      send(frame) {
        const [type, ev] = JSON.parse(frame);
        if (type === 'EVENT') { this.onmessage?.({ data: JSON.stringify(['OK', ev.id, false, 'blocked: test']) }); return; }
        super.send(frame);
      }
    });
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: small.id, understood: true });
    expect(res).toMatchObject({ success: false, code: 'no-relay-accepted' });
    // The big removal still compares with the 20-follow version.
    const preview = await ext(env, 'profile.restorePreview', { pubkey: PUB_A, kind: 3, id: small.id });
    expect(preview.effect.destructive).toBe(true);
    const { listStore } = await import('../src/utilities/list-store.js');
    expect((await listStore().baseline(PUB_A, 3)).event.id).toBe(small.id); // oldest seen in the window, unchanged
  });

  it('a successful ticked restore makes the restored version the baseline', async () => {
    const small = await signA({ kind: 3, content: '', tags: follows(2), created_at: 1700000000 });
    const large = await signA({ kind: 3, content: '', tags: follows(20), created_at: 1700000050 });
    const { env, relay } = await boot([small]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    relay.events.push(large);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: small.id, understood: true });
    expect(res.success).toBe(true);
    const { listStore } = await import('../src/utilities/list-store.js');
    expect((await listStore().baseline(PUB_A, 3)).event.id).toBe(res.event.id);
  });

  it('restore never dates the new event far ahead, even if the current one is future-dated', async () => {
    const nowS = Math.floor(Date.now() / 1000);
    const old = await signA({ kind: 3, content: '', tags: follows(20), created_at: nowS - 100 });
    const future = await signA({ kind: 3, content: '', tags: follows(21), created_at: nowS + 300 });
    const { env, relay } = await boot([old]);
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    relay.events.push(future);
    const res = await ext(env, 'profile.restore', { pubkey: PUB_A, kind: 3, id: old.id });
    expect(res.success).toBe(true);
    expect(res.event.created_at).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 60);
  });

  it('deleting an identity clears its saved versions', async () => {
    const B = '3'.repeat(64);
    const current = await signA({ kind: 3, content: '', tags: follows(5), created_at: 1700000000 });
    const relay = installRelay();
    relay.events.push(current);
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, B);
    const env = await bootWorker({
      profiles: [localProfile(blobs[0], {}, { relays: RELAYS }),
        localProfile(blobs[1], {}, { relays: RELAYS, name: 'P2', pubKey: getPublicKeySync(B) })],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    await ext(env, 'profile.fetch', { pubkey: PUB_A });
    const { listStore } = await import('../src/utilities/list-store.js');
    expect(await listStore().history(PUB_A, 3)).toHaveLength(1);
    const { deleteProfile } = await import('../src/utilities/utils.js');
    await deleteProfile(0);
    expect(await listStore().history(PUB_A, 3)).toEqual([]);
    expect(await listStore().get(PUB_A, 3)).toBeNull();
  });
});

describe('sender gate', () => {
  it('a web page cannot list, preview or restore', async () => {
    const { env, relay } = await boot();
    for (const kind of ['profile.history', 'profile.restorePreview', 'profile.restore']) {
      const res = await env.dispatch({ kind, payload: { pubkey: PUB_A, kind: 3, id: hex(1), understood: true } }, PAGE_SENDER);
      expect(res).toMatchObject({ success: false, error: 'Unauthorized sender' });
    }
    expect(relay.published).toEqual([]);
  });
});
