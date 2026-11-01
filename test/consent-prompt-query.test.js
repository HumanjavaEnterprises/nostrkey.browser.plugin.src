/**
 * What the worker tells the permission page about a request, so the page has no
 * rules of its own. Real worker.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  bootUnlocked, settle, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';

const HASH = 'a'.repeat(64);
const NOW = () => Math.floor(Date.now() / 1000);
const token = (verb, extra = []) => ({
  kind: 24242, created_at: NOW(), content: '', tags: [['t', verb], ['expiration', String(NOW() + 600)], ...extra],
});
const sign = (payload) => ({ kind: 'signEvent', host: ORIGIN, payload });
const asked = (env) => new URL(env.tabs.shown.at(-1).url).searchParams;

async function prompted(env, message) {
  env.dispatch(message, PAGE_SENDER);
  await settle(30);
  return asked(env);
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('the query a prompt opens with', () => {
  it('carries the grant key, that it can be remembered, and the identity', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(token('upload', [['x', HASH]])));
    expect(q.get('grantKey')).toBe('signEvent:24242:upload');
    expect(q.get('rememberable')).toBe('1');
    expect(q.get('profileName')).toBe('P1');
    expect(q.get('profileType')).toBe('local');
    expect(q.get('lockedGrant')).toBe('0');
    expect(Number(q.get('parsedAt'))).toBeGreaterThan(0);
  });

  it('a delete can not be remembered', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(token('delete', [['x', HASH]])));
    expect(q.get('grantKey')).toBe('signEvent:24242:delete');
    expect(q.get('rememberable')).toBe('0');
  });

  it('a request it cannot read has no key and can not be remembered', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign({ kind: 24242, created_at: NOW(), content: '', tags: [['t', 'upload']] }));
    expect(q.get('grantKey')).toBe('');
    expect(q.get('rememberable')).toBe('0');
  });

  it('a kind that is not on the list can not be remembered', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign({ kind: 12345, created_at: NOW(), content: '', tags: [] }));
    expect(q.get('grantKey')).toBe('signEvent:12345');
    expect(q.get('rememberable')).toBe('0');
  });

  it('tells the page how much a request needs flagging, even one it cannot read', async () => {
    const env = await bootUnlocked();
    const far = { kind: 24242, created_at: NOW(), content: '', tags: [['t', 'delete'], ['expiration', String(NOW() + 2 * 86400)], ['x', HASH]] };
    const q = await prompted(env, sign(far));
    expect(q.get('grantKey')).toBe('');
    expect(q.get('requestRisk')).toBe('danger');
  });

  it('a media server request it cannot read is flagged, and a plain one is not', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign({ kind: 24242, created_at: NOW(), content: '', tags: [['t', 'upload']] }));
    expect(q.get('requestRisk')).toBe('warn');
    env.dispatch({ kind: 'denied', payload: q.get('uuid') }, { id: 'test-extension-id' });
    await settle(30);
    const plain = await prompted(env, sign(token('upload', [['x', HASH]])));
    expect(plain.get('requestRisk')).toBe('neutral');
  });

  it('a method gets its own key', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, { kind: 'getPubKey', host: ORIGIN });
    expect(q.get('grantKey')).toBe('getPubKey');
    expect(q.get('rememberable')).toBe('1');
  });
});

describe('what the prompt reads back by uuid', () => {
  const NOTE = { kind: 1, created_at: 1800000000, tags: [], content: '\u8a9e'.repeat(30_000) };
  const ask = (env, uuid, sender = PERMISSION_SENDER) => env.dispatch({ kind: 'promptReady', payload: uuid }, sender);

  it('the query carries no part of the request', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(NOTE));
    expect(q.has('payload')).toBe(false);
    expect(env.tabs.shown.at(-1).url.length).toBeLessThan(1000);
  });

  it('a prompt gets the event it is showing', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(NOTE));
    expect(JSON.parse((await ask(env, q.get('uuid'))).payload)).toEqual(NOTE);
  });

  it('it can be read again, for a sheet that is reopened', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(NOTE));
    await ask(env, q.get('uuid'));
    expect(JSON.parse((await ask(env, q.get('uuid'))).payload)).toEqual(NOTE);
  });

  it('text being encrypted or decrypted is not handed to the prompt', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, { kind: 'nip04.decrypt', host: ORIGIN, payload: { pubKey: 'a'.repeat(64), cipherText: 'demo-text' } });
    expect(await ask(env, q.get('uuid'))).toEqual({ payload: 'false' });
  });

  it('an unknown uuid gets nothing', async () => {
    const env = await bootUnlocked();
    await prompted(env, sign(NOTE));
    expect(await ask(env, 'not-a-live-uuid')).toBeNull();
  });

  it('a request already answered gets nothing', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(NOTE));
    env.dispatch({ kind: 'denied', payload: q.get('uuid') }, PERMISSION_SENDER);
    await settle(30);
    expect(await ask(env, q.get('uuid'))).toBeNull();
  });

  it('a web page gets nothing', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(NOTE));
    expect((await ask(env, q.get('uuid'), PAGE_SENDER)).payload).toBeUndefined();
  });

  it('after a restart the prompt gets nothing', async () => {
    const env = await bootUnlocked();
    const q = await prompted(env, sign(NOTE));
    const restarted = await env.restart();
    expect(await ask(restarted, q.get('uuid'))).toBeNull();
  });

  it('a large event and a large decrypt both open', async () => {
    const env = await bootUnlocked();
    await prompted(env, { kind: 'nip04.decrypt', host: ORIGIN, payload: { pubKey: 'a'.repeat(64), cipherText: 'x'.repeat(300_000) } });
    expect(env.tabs.shown).toHaveLength(1);
    env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
    await settle(30);
    const follows = { kind: 3, created_at: 1800000000, content: '', tags: Array.from({ length: 3000 }, (_, i) => ['p', i.toString(16).padStart(64, '0')]) };
    const q = await prompted(env, sign(follows));
    expect(env.tabs.shown).toHaveLength(2);
    expect(JSON.parse((await ask(env, q.get('uuid'))).payload).tags).toHaveLength(3000);
  });
});

describe('where a prompt opens', () => {
  const event = (kind, tags = []) => sign({ kind, created_at: NOW(), content: '', tags });
  const opened = async (message, hosts = {}, opts) => {
    const env = await bootUnlocked(hosts, opts);
    env.dispatch(message, PAGE_SENDER);
    await settle(30);
    return { via: env.tabs.shown.at(-1).via, sheets: env.tabs.sent.filter(m => m.kind === 'showPermissionSheet').length };
  };

  for (const [name, message] of [
    ['a delete', event(5, [['e', HASH]])],
    ['a request to erase', event(62, [['relay', 'ALL_RELAYS']])],
    ['a media server delete', sign(token('delete', [['x', HASH]]))],
    ['a media server delete it cannot read', sign({ kind: 24242, created_at: NOW(), content: '', tags: [['t', 'DELETE']] })],
    ['a delete named in a second tag', sign(token('upload', [['x', HASH], ['t', 'delete']]))],
  ]) {
    it(`${name} opens in a tab`, async () => {
      expect(await opened(message)).toEqual({ via: 'tab', sheets: 0 });
    });
  }

  for (const [name, message] of [
    ['a note', event(1)],
    ['an upload', sign(token('upload', [['x', HASH]]))],
    ['a list replacement', event(3)],
    ['a kind it does not know', event(12345)],
    ['a decrypt', { kind: 'nip44.decrypt', host: ORIGIN, payload: { pubKey: HASH, cipherText: 'x' } }],
    ['a public key', { kind: 'getPubKey', host: ORIGIN }],
  ]) {
    it(`${name} opens on the page`, async () => {
      expect(await opened(message)).toEqual({ via: 'sheet', sheets: 1 });
    });
  }

  it('a tab that cannot open declines it', async () => {
    const env = await bootUnlocked();
    env.tabs.createError = new Error('no tab');
    const answer = await env.dispatch(event(5, [["e", HASH]]), PAGE_SENDER);
    expect(answer).toMatchObject({ error: 'request_failed' });
    expect(env.tabs.shown).toEqual([]);
  });
});

