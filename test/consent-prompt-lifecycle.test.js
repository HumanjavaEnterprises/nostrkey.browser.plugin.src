/**
 * Prompt ownership on the REAL background worker: every way a prompt can end acts
 * only on the prompt it belongs to, and a prompt that ends is answered.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  bootUnlocked, bootWorker, deviceWrapped, localProfile, settle, track,
  HEX_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB } from './helpers/fake-signer.js';

const PROMPT_MS = 40_000;
const BUNKER_MS = 60_000;

const EVENT = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
const signKind = (kind) => ({ kind: 'signEvent', host: ORIGIN, payload: { ...EVENT, kind } });
const request = (env, kind) => track(env.dispatch(signKind(kind), PAGE_SENDER));
const staff = (env, kind, payload, fields = {}) => env.dispatch({
  // Kind 3 with no current list to compare needs the tick (E1); these tests are about the lifecycle.
  kind, payload, origKind: 'signEvent', event: { ...EVENT, kind: 3 }, host: ORIGIN, understood: true, ...fields,
}, PERMISSION_SENDER);

const answerAll = async () => { for (let i = 0; i < 6; i++) await vi.advanceTimersByTimeAsync(0); };

afterEach(() => {
  vi.doUnmock('../src/utilities/bunker-server');
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete globalThis.chrome;
  delete globalThis.browser;
});

/** One open prompt, a second request waiting on it, the clock under test control. */
async function promptWithWaiter(opts = {}) {
  const env = await bootUnlocked({}, opts);
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
  vi.setSystemTime(1_000_000);
  const first = request(env, 3);
  await settle(30);
  const waiter = request(env, 7);
  await settle(30);
  expect(env.tabs.shown).toHaveLength(1);
  return { env, first, waiter, uuid: env.tabs.shown[0].uuid };
}

describe('a postback for a uuid that is not the open prompt', () => {
  const unknown = {
    allowed: (env) => staff(env, 'allowed', 'not-a-live-uuid', { remember: true }),
    denied: (env) => staff(env, 'denied', 'not-a-live-uuid'),
    closePrompt: (env) => staff(env, 'closePrompt', 'not-a-live-uuid'),
    'closePrompt without a uuid': (env) => staff(env, 'closePrompt'),
  };

  for (const [name, send] of Object.entries(unknown)) {
    it(`${name}: an unknown uuid does not release`, async () => {
      const { env, first, waiter } = await promptWithWaiter();
      expect(await send(env)).toBe(true);
      await settle(30);

      expect(env.tabs.shown).toHaveLength(1);
      expect(first.answered).toBe(false);
      expect(waiter.answered).toBe(false);
    });

    it(`${name}: the open prompt keeps its timer`, async () => {
      const { env, first } = await promptWithWaiter();
      await send(env);
      await vi.advanceTimersByTimeAsync(PROMPT_MS - 1);
      expect(first.answered).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await answerAll();
      expect(first.answered).toBe(true);
      await settle(30);
      expect(env.tabs.shown).toHaveLength(2);
    });
  }

  it('an answered uuid cannot end the next prompt', async () => {
    const { env, first, uuid } = await promptWithWaiter();
    await staff(env, 'allowed', uuid);
    await settle(30);
    expect(first.answered).toBe(true);
    expect(env.tabs.shown).toHaveLength(2);

    const third = request(env, 16);
    await settle(30);
    await staff(env, 'closePrompt', uuid);
    await staff(env, 'denied', uuid);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
    expect(third.answered).toBe(false);
  });

  it('a second allowed for the same uuid waits with the first', async () => {
    const { env, uuid, waiter } = await promptWithWaiter();
    let letGo;
    const gate = new Promise(r => { letGo = r; });
    const { set } = env.chrome.storage.local;
    env.chrome.storage.local.set = async (items) => {
      if (items.profiles) await gate;
      return set(items);
    };

    const one = track(staff(env, 'allowed', uuid, { remember: true }));
    await settle(10);
    await staff(env, 'allowed', uuid);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    expect(one.answered).toBe(false);
    expect(waiter.answered).toBe(false);

    letGo();
    await settle(30);
    expect(one.answered).toBe(true);
    expect(env.tabs.shown).toHaveLength(2);
  });
});

describe('closing the prompt', () => {
  it('declines the request and moves to the next one', async () => {
    const { env, first, uuid } = await promptWithWaiter();
    await staff(env, 'closePrompt', uuid);
    await settle(30);
    expect(first.answered).toBe(true);
    expect(first.value).toMatchObject({ error: 'denied' });
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('after approving, the page unloading changes nothing', async () => {
    const { env, first, uuid } = await promptWithWaiter();
    await staff(env, 'allowed', uuid);
    await staff(env, 'closePrompt', uuid);
    await settle(30);
    expect(first.value).toMatchObject({ kind: 3 });
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('the page sends the uuid it was opened with', async () => {
    const { readFileSync } = await import('node:fs');
    const page = readFileSync('src/permission/permission.js', 'utf8');
    expect(page).toContain("api.runtime.sendMessage({ kind: 'closePrompt', payload: state.key })");
  });
});

it('closing a prompt during its remember write leaves the next request waiting for that write', async () => {
  const env = await bootUnlocked();
  const first = request(env, 1);
  const waiter = request(env, 1);
  await settle(30);
  expect(env.tabs.shown).toHaveLength(1);

  const raw = env.chrome.storage.local;
  const write = raw.set.bind(raw);
  let finishWrite;
  raw.set = (...args) => {
    raw.set = write;
    return new Promise((resolve) => { finishWrite = resolve; }).then(() => write(...args));
  };
  const approved = staff(env, 'allowed', env.tabs.shown[0].uuid, { remember: true });
  await settle(10);
  expect(finishWrite).toBeTypeOf('function');
  await staff(env, 'closePrompt', env.tabs.shown[0].uuid);
  await settle(30);
  expect(waiter.answered).toBe(false);
  expect(env.tabs.shown).toHaveLength(1);

  finishWrite();
  await approved;
  await settle(40);
  expect(first.value).toMatchObject({ kind: 1 });
  expect(waiter.value).toMatchObject({ kind: 1 });
  expect(env.tabs.shown).toHaveLength(1);
});

describe('a prompt answered while its sheet is still opening', () => {
  it('the sheet is closed, and the next prompt is not affected', async () => {
    const env = await bootUnlocked();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    let letGo;
    const gate = new Promise(r => { letGo = r; });
    const { sendMessage } = env.chrome.tabs;
    env.chrome.tabs.sendMessage = async (id, message) => {
      await sendMessage(id, message);
      if (message.kind === 'showPermissionSheet') await gate;
    };
    const first = request(env, 3);
    await settle(30);

    await vi.advanceTimersByTimeAsync(PROMPT_MS);
    await answerAll();
    expect(first.answered).toBe(true);

    letGo();
    await settle(30);
    expect(env.tabs.sent.map(m => m.kind)).toEqual(['showPermissionSheet', 'closePermissionSheet']);
  });
});

describe('a tab that dies without saying so', () => {
  it('its request is declined when the next one arrives', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const first = request(env, 3);
    await settle(30);
    env.tabs.deadTabs.add(100);

    const next = request(env, 7);
    await settle(30);
    expect(first.answered).toBe(true);
    expect(first.value).toMatchObject({ error: 'denied' });
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a finished tab prompt does not end a later sheet prompt', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const first = request(env, 3);
    await settle(30);
    await staff(env, 'allowed', env.tabs.shown[0].uuid);
    await settle(30);
    expect(first.answered).toBe(true);

    env.tabs.sheet = true;
    const sheet = request(env, 7);
    await settle(30);
    expect(env.tabs.shown[1].via).toBe('sheet');
    env.tabs.deadTabs.add(100);

    const waiter = request(env, 16);
    await settle(30);
    expect(sheet.answered).toBe(false);
    expect(waiter.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a tab that opens after its prompt ended is not treated as the next prompt\'s', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const hold = env.tabs.holdCreate();
    const first = request(env, 3);
    await settle(30);

    await vi.advanceTimersByTimeAsync(PROMPT_MS);
    await answerAll();
    expect(first.answered).toBe(true);

    env.tabs.sheet = true;
    const sheet = request(env, 7);
    await settle(30);
    hold.resolve();
    await settle(30);
    env.tabs.deadTabs.add(100);

    const waiter = request(env, 16);
    await settle(30);
    expect(sheet.answered).toBe(false);
    expect(waiter.answered).toBe(false);
    expect(env.tabs.shown.filter(s => s.via === 'sheet')).toHaveLength(1);
  });

  it('a tab that said it is in use keeps its prompt even if the browser cannot find it', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const first = request(env, 3);
    await settle(30);
    const uuid = env.tabs.shown[0].uuid;
    const ownTab = { ...PERMISSION_SENDER, tab: { ...PERMISSION_SENDER.tab, id: 100 } };
    await env.dispatch({ kind: 'holdPrompt', payload: uuid, inUse: true }, ownTab);
    env.tabs.deadTabs.add(100);

    const next = request(env, 7);
    await settle(30);
    expect(first.answered).toBe(false);
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(1);

    // It still ends at its timeout.
    await vi.advanceTimersByTimeAsync(PROMPT_MS);
    await settle(30);
    expect(first.value).toMatchObject({ error: 'timed_out' });
  });

  it('an in-use note from another tab, or one not in use, does not keep it', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const first = request(env, 3);
    await settle(30);
    const uuid = env.tabs.shown[0].uuid;
    await env.dispatch({ kind: 'holdPrompt', payload: uuid, inUse: true }, PERMISSION_SENDER);
    await env.dispatch({ kind: 'holdPrompt', payload: uuid, inUse: false },
      { ...PERMISSION_SENDER, tab: { ...PERMISSION_SENDER.tab, id: 100 } });
    env.tabs.deadTabs.add(100);

    request(env, 7);
    await settle(30);
    expect(first.value).toMatchObject({ error: 'denied' });
  });

  it('a live tab keeps its prompt', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    const first = request(env, 3);
    await settle(30);
    const waiter = request(env, 7);
    await settle(30);
    expect(first.answered).toBe(false);
    expect(waiter.answered).toBe(false);
  });
});

describe('after a prompt ends', () => {
  it('remembering finishes before the next request runs', async () => {
    const { env, uuid } = await promptWithWaiter();
    let letGo;
    const gate = new Promise(r => { letGo = r; });
    const { set } = env.chrome.storage.local;
    env.chrome.storage.local.set = async (items) => {
      if (items.profiles) await gate;
      return set(items);
    };

    const done = track(staff(env, 'allowed', uuid, { remember: true }));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    expect(done.answered).toBe(false);

    letGo();
    await settle(30);
    expect(done.value).toBe(true);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a late close does not release a request still reading its grant', async () => {
    const { env, uuid, waiter } = await promptWithWaiter();
    let letGo;
    const gate = new Promise(r => { letGo = r; });
    const { get } = env.chrome.storage.local;
    let holding = false;
    env.chrome.storage.local.get = async (keys) => {
      if (!holding) { holding = true; await gate; }
      return get(keys);
    };

    await staff(env, 'denied', uuid);
    await settle(10);
    const third = request(env, 16);
    await settle(10);
    await staff(env, 'closePrompt', uuid);
    await settle(10);
    expect(env.tabs.shown).toHaveLength(1);

    letGo();
    await settle(40);
    expect(env.tabs.shown).toHaveLength(2);
    expect(waiter.answered).toBe(false);
    expect(third.answered).toBe(false);
  });
});

describe('an inbound approval', () => {
  /** Boots with the bunker server stubbed down to the approval hook it is given. */
  async function withApproval(opts = {}) {
    let approve;
    vi.doMock('../src/utilities/bunker-server', async (importOriginal) => ({
      ...(await importOriginal()),
      BunkerServer: class {
        async start({ requestApproval }) { approve = requestApproval; }
        stop() {}
        status() { return {}; }
      },
    }));
    const env = await bootUnlocked({}, opts);
    await env.dispatch({ kind: 'bunkerServer.start', payload: {} }, PERMISSION_SENDER);
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(1_000_000);
    const decision = track(approve({ clientPubkey: 'c'.repeat(64), method: 'sign_event', kind: 1, unsigned: opts.unsigned ?? EVENT }));
    await settle(30);
    return { env, decision, uuid: env.tabs.shown[0]?.uuid, approve };
  }

  it('a declined approval is never remembered, whatever the page sends', async () => {
    const { env, decision, uuid } = await withApproval();
    await staff(env, 'denied', uuid, { remember: true });
    await settle(10);
    expect(decision.value).toEqual({ approved: false, remember: false });
  });

  it('closing its tab declines it', async () => {
    const { env, decision, uuid } = await withApproval();
    await staff(env, 'closePrompt', uuid);
    await settle(10);
    expect(decision.value).toEqual({ approved: false, remember: false });
  });

  it('approving it answers once, and the page unloading changes nothing', async () => {
    const { env, decision, uuid } = await withApproval();
    await staff(env, 'allowed', uuid, { remember: true });
    await staff(env, 'closePrompt', uuid);
    await settle(10);
    expect(decision.value).toEqual({ approved: true, remember: true });
  });

  it('after its tab closes, its timer does not release the next holder', async () => {
    const { env, uuid } = await withApproval();
    await staff(env, 'closePrompt', uuid);
    await settle(30);
    await vi.advanceTimersByTimeAsync(BUNKER_MS - PROMPT_MS / 2);
    const next = request(env, 3);
    await settle(30);
    const waiter = request(env, 7);
    await settle(30);

    await vi.advanceTimersByTimeAsync(PROMPT_MS / 2 + 1);
    await settle(30);
    expect(next.answered).toBe(false);
    expect(waiter.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('a surface that never reports ready is declined early and frees the prompt', async () => {
    const { env, decision } = await withApproval({ deadSurface: true });
    const next = request(env, 3);
    await settle(30);
    await vi.advanceTimersByTimeAsync(6_000);
    await settle(30);
    expect(decision.value).toEqual({ approved: false, remember: false });
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('an event too large to show is declined with nothing opened', async () => {
    const { env, decision } = await withApproval({ unsigned: { ...EVENT, content: 'a'.repeat(2_200_000) } });
    expect(decision.value).toEqual({ approved: false, remember: false });
    expect(env.tabs.shown).toHaveLength(0);
  });

  it('a large event opens, and its page is given it by uuid', async () => {
    const unsigned = { ...EVENT, content: '\u8a9e'.repeat(30_000) };
    const { env, uuid } = await withApproval({ unsigned });
    expect(new URL(env.tabs.shown[0].url).searchParams.has('payload')).toBe(false);
    expect(JSON.parse((await staff(env, 'promptReady', uuid)).payload)).toEqual(unsigned);
  });

  it('a request with no event gives its page nothing to show', async () => {
    const { env, approve } = await withApproval();
    await staff(env, 'denied', env.tabs.shown[0].uuid);
    await settle(30);
    approve({ clientPubkey: 'c'.repeat(64), method: 'nip44_decrypt', kind: null });
    await settle(30);
    expect(await staff(env, 'promptReady', env.tabs.shown[1].uuid)).toEqual({ payload: 'false' });
  });

  it('with no answer it declines at its timer and frees the prompt', async () => {
    const { env, decision } = await withApproval();
    const next = request(env, 3);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(BUNKER_MS);
    await settle(30);
    expect(decision.value).toEqual({ approved: false, remember: false });
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('an unknown uuid does not release it', async () => {
    const { env, decision } = await withApproval();
    const next = request(env, 3);
    await settle(30);
    await staff(env, 'closePrompt', 'not-a-live-uuid');
    await staff(env, 'denied', 'not-a-live-uuid');
    await settle(30);
    expect(decision.answered).toBe(false);
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(1);
  });

  it('its tab, once finished, does not end a later prompt', async () => {
    const { env, uuid } = await withApproval();
    await staff(env, 'allowed', uuid);
    await settle(10);
    const next = request(env, 3);
    await settle(30);
    env.tabs.deadTabs.add(100);
    const waiter = request(env, 7);
    await settle(30);
    expect(next.answered).toBe(false);
    expect(waiter.answered).toBe(false);
  });

  it('a dead tab declines it when the next request arrives', async () => {
    const { env, decision } = await withApproval();
    env.tabs.deadTabs.add(100);
    const next = request(env, 3);
    await settle(30);
    expect(decision.value).toEqual({ approved: false, remember: false });
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(2);
  });
});

describe('a request that waited behind a prompt', () => {
  const setGrants = async (env, hosts, index = 0) => {
    const { profiles } = env.local._dump();
    profiles[index].hosts = hosts;
    await env.local.set({ profiles });
    await env.flushWrites();
  };

  it('a stored deny answers it with no prompt, and the prompt queue moves on', async () => {
    const env = await bootUnlocked();
    const first = request(env, 3);
    await settle(30);
    const denied = request(env, 7);
    await settle(30);
    const third = request(env, 9);
    await settle(30);
    await setGrants(env, { [ORIGIN]: { 'signEvent:7': 'deny' } });

    await staff(env, 'denied', env.tabs.shown[0].uuid);
    await settle(40);
    expect(first.answered).toBe(true);
    expect(denied.answered).toBe(true);
    expect(denied.value).toMatchObject({ error: 'denied' });
    const heldKinds = [];
    for (const { uuid } of env.tabs.shown.slice(1)) {
      heldKinds.push(JSON.parse((await staff(env, 'promptReady', uuid)).payload).kind);
    }
    expect(heldKinds).toEqual([9]);
    expect(env.tabs.shown).toHaveLength(2);
    expect(third.answered).toBe(false);
  });

  it('a failed read after its turn answers it and frees the queue', async () => {
    const env = await bootUnlocked();
    const first = request(env, 3);
    await settle(30);
    const failing = request(env, 7);
    await settle(30);

    const raw = env.chrome.storage.local;
    const read = raw.get.bind(raw);
    raw.get = () => { raw.get = read; return Promise.reject(new Error('storage unavailable')); };
    await staff(env, 'denied', env.tabs.shown[0].uuid);
    await settle(30);
    expect(first.answered).toBe(true);
    expect(failing.value).toMatchObject({ error: 'request_failed' });

    request(env, 9);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);
  });

  it('follows the lock rule of the profile switched to, not the one it arrived on', async () => {
    const PASSWORD = 'correct horse battery staple';
    installFakeSigner();
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [
        {
          name: 'Remote', privKey: '', pubKey: '', hosts: {}, relays: [], type: 'bunker',
          bunkerUrl: null, remotePubkey: SIGNER_PUB,
        },
        localProfile(blobs[0], { [ORIGIN]: { 'signEvent:7': 'allow' } }, { name: 'Local' }),
      ],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    await env.dispatch({
      kind: 'bunker.connect',
      payload: { profileIndex: 0, bunkerUrl: `bunker://${SIGNER_PUB}?relay=wss://relay.example.com` },
    });
    await env.dispatch({ kind: 'setPassword', payload: PASSWORD }, PERMISSION_SENDER);
    await env.flushWrites();
    await env.dispatch({ kind: 'lock' }, PERMISSION_SENDER);
    await env.flushWrites();
    await env.dispatch({ kind: 'setNostrAccessWhileLocked', payload: true }, PERMISSION_SENDER);

    const first = request(env, 3);
    await settle(30);
    const queued = request(env, 7);
    await settle(30);
    await env.local.set({ profileIndex: 1 });
    await env.flushWrites();
    await staff(env, 'denied', env.tabs.shown[0].uuid);
    await settle(40);

    // The local profile's key is not in memory, so even with "access while
    // locked" on, the request is refused instead of shown.
    expect(first.answered).toBe(true);
    expect(queued.answered).toBe(true);
    expect(queued.value).toMatchObject({ error: 'locked' });
    expect(env.tabs.shown).toHaveLength(1);
  });
});

describe('a request no prompt has been shown for', () => {
  it('an approval for it stores nothing and signs nothing', async () => {
    const env = await bootUnlocked();
    const first = request(env, 3);
    await settle(30);
    const ids = ['queued-request'];
    const mint = crypto.randomUUID.bind(crypto);
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => ids.shift() ?? mint());
    const queued = request(env, 7);
    await settle(30);

    await staff(env, 'allowed', 'queued-request', { remember: true });
    await settle(10);
    await env.flushWrites();
    expect(queued.value.sig).toBeUndefined();
    expect(queued.value.error).toBeTruthy();
    expect(env.savedEvents).toEqual([]);
    expect(env.local._dump().profiles[0].hosts).toEqual({});
    expect(first.answered).toBe(false);
  });
});

describe('the tab a prompt is in', () => {
  it('a sheet moved to a tab is tracked, so a dead tab cannot hold the queue', async () => {
    const env = await bootUnlocked();
    const first = request(env, 3);
    await settle(30);
    await env.dispatch({ kind: 'permissionSheetCompromised' }, PAGE_SENDER);
    await settle(10);
    expect(env.tabs.shown).toHaveLength(2);
    env.tabs.deadTabs.add(100);

    const next = request(env, 7);
    await settle(40);
    expect(first.answered).toBe(true);
    expect(next.answered).toBe(false);
    expect(env.tabs.shown).toHaveLength(3);
  });

  it('a slow check of an old tab cannot decline the prompt that came after it', async () => {
    const env = await bootUnlocked({}, { sheet: false });
    const first = request(env, 3);
    await settle(30);

    let failCheck;
    const check = new Promise((_, reject) => { failCheck = reject; });
    const { get } = env.chrome.tabs;
    env.chrome.tabs.get = () => { env.chrome.tabs.get = get; return check; };
    const second = request(env, 7);
    await settle(30);

    await staff(env, 'denied', env.tabs.shown[0].uuid);
    await settle(30);
    expect(first.answered).toBe(true);
    const third = request(env, 9);
    await settle(30);
    expect(env.tabs.shown).toHaveLength(2);

    failCheck(new Error('No tab'));
    await settle(30);
    expect(third.answered).toBe(false);
    expect(second.answered).toBe(false);
  });
});
