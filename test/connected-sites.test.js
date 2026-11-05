/**
 * The profile tab's Connected sites list (A5): the origin normaliser, the
 * answers the list may store, and one store seen from both doors on the REAL
 * worker: what the list writes, a page request honours, and what a prompt
 * writes, the list reads.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  normaliseOrigin, grantChoices, listGrantValue, rememberedValue, maxRememberFor, LIST_ACTIONS, DURATIONS,
} from '../src/utilities/consent-policy.js';
import {
  bootUnlocked, answerWithin, settle, track, PUB_A, ORIGIN, PERMISSION_SENDER, pageSender,
} from './helpers/boot-worker.js';

const NOW = 1_700_000_000;

describe('normaliseOrigin (Ring 0)', () => {
  const table = [
    ['jumble.social', 'https://jumble.social'],
    ['  Jumble.Social  ', 'https://jumble.social'],
    ['jumble.social:8080', 'https://jumble.social:8080'],
    ['https://jumble.social:443', 'https://jumble.social'],
    ['https://jumble.social/path/to?q=1#frag', 'https://jumble.social'],
    ['münchen.de', 'https://xn--mnchen-3ya.de'],
    ['https://xn--mnchen-3ya.de', 'https://xn--mnchen-3ya.de'],
    ['localhost:3000', 'https://localhost:3000'],
    ['http://localhost:3000', 'http://localhost:3000'],
    ['http://127.0.0.1:5173', 'http://127.0.0.1:5173'],
    ['http://evil', null],
    ['http://evil.com', null],
    ['http://localhost.evil.com', null],
    ['https://user:pw@jumble.social', null],
    ['https://user@jumble.social', null],
    ['blob:https://jumble.social/1234', null],
    ['data:text/html,hi', null],
    ['javascript:alert(1)', null],
    ['ftp://jumble.social', null],
    ['ws://jumble.social', null],
    ['//jumble.social', null],
    ['/path', null],
    ['jumble', null],
    ['https://jumble.social.', null],
    ['jumble .social', null],
    ['', null],
    [null, null],
    [42, null],
  ];
  it.each(table)('%j gives %j', (input, want) => {
    expect(normaliseOrigin(input)).toBe(want);
  });
  it('never returns a bare host', () => {
    for (const [input] of table) {
      const out = normaliseOrigin(input);
      if (out) expect(out).toMatch(/^https?:\/\//);
    }
  });
});

describe('what the list may store (durations clamp)', () => {
  it('Allow offers 1 hour, 1 day, 30 days and Forever for an ordinary kind', () => {
    expect(grantChoices('signEvent:1')).toEqual(['ask', '1h', '1d', '30d', 'forever', 'deny']);
  });
  it('reading and sending messages stop at 30 days, as the prompt does', () => {
    for (const key of ['nip44.decrypt', 'nip04.decrypt', 'signEvent:4', 'signEvent:14', 'signEvent:1059']) {
      expect(grantChoices(key)).not.toContain('forever');
      expect(listGrantValue('forever', key, NOW)).toBeNull();
      expect(listGrantValue('30d', key, NOW)).toEqual({ v: 'allow', exp: NOW + DURATIONS['30d'], d: '30d' });
    }
  });
  it('a kind that always asks, and delete, offer only Ask and Deny', () => {
    for (const key of ['signEvent:5', 'signEvent:62', 'signEvent:24242:delete', 'signEvent:9999']) {
      expect(grantChoices(key)).toEqual(['ask', 'deny']);
      for (const d of ['1h', '1d', '30d', 'forever']) expect(listGrantValue(d, key, NOW)).toBeNull();
      expect(listGrantValue('deny', key, NOW)).toBe('deny');
    }
  });
  it('unknown keys and answers store nothing; ask is never stored', () => {
    expect(grantChoices('bogus')).toEqual([]);
    expect(listGrantValue('deny', 'bogus', NOW)).toBeNull();
    expect(listGrantValue('allow', 'signEvent:1', NOW)).toBeNull();
    expect(listGrantValue('ask', 'signEvent:1', NOW)).toBeNull();
  });
  it('every listed action has choices and each allow is no longer than the worker would keep', () => {
    for (const key of LIST_ACTIONS) {
      const method = key.startsWith('signEvent') ? 'signEvent' : key;
      expect(grantChoices(key).length).toBeGreaterThan(1);
      for (const c of grantChoices(key).filter(c => c !== 'ask' && c !== 'deny')) {
        expect(listGrantValue(c, key, NOW)).toEqual(rememberedValue(c, method, key, NOW));
      }
      expect(['1h', '1d', '30d', 'forever']).toContain(maxRememberFor(method, key));
    }
  });
  it('the list writes through the shared clamp, by public key, with no message kind', () => {
    const src = readFileSync(new URL('../src/utilities/grant-list.js', import.meta.url), 'utf8');
    const page = readFileSync(new URL('../src/profiles/connected-sites.js', import.meta.url), 'utf8');
    expect(src).toMatch(/listGrantValue\(choice, key,/);
    expect(src).not.toMatch(/sendMessage/);
    expect(page).not.toMatch(/sendMessage/);
    expect(page).toMatch(/This identity is not on this device/);
  });
  it('the tab says the list applies to this device only', () => {
    const html = readFileSync(new URL('../src/profile.html', import.meta.url), 'utf8');
    expect(html).toContain('This list applies to this device only.');
    expect(html).not.toMatch(/[–—]/);
  });
});

const EVENT = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
const signKind = (kind) => ({ kind: 'signEvent', host: ORIGIN, payload: { ...EVENT, kind } });
const send = (env, m) => env.dispatch(m, pageSender(ORIGIN));

afterEach(() => {
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('one store, two doors (Ring 2)', () => {
  it('an Allow 1 day set in the list signs with no prompt', async () => {
    const env = await bootUnlocked();
    const { writeListGrant } = await import('../src/utilities/grant-list.js');
    expect(await writeListGrant(PUB_A, ORIGIN, 'signEvent:1', '1d')).toBeNull();
    await env.flushWrites();
    expect(await answerWithin(send(env, signKind(1)))).toMatchObject({ kind: 1 });
    expect(env.tabs.shown).toEqual([]);
  });

  it('a Deny set in the list answers at once with no prompt', async () => {
    const env = await bootUnlocked();
    const { writeListGrant } = await import('../src/utilities/grant-list.js');
    expect(await writeListGrant(PUB_A, ORIGIN, 'signEvent:7', 'deny')).toBeNull();
    await env.flushWrites();
    expect(await answerWithin(send(env, signKind(7)))).toMatchObject({ error: 'denied' });
    expect(env.tabs.shown).toEqual([]);
  });

  it('a list write cannot widen past the cap or reach an http site', async () => {
    const env = await bootUnlocked();
    const { writeListGrant } = await import('../src/utilities/grant-list.js');
    expect(await writeListGrant(PUB_A, ORIGIN, 'nip44.decrypt', 'forever')).toMatch(/not available/);
    expect(await writeListGrant(PUB_A, ORIGIN, 'signEvent:24242:delete', 'forever')).toMatch(/not available/);
    expect(await writeListGrant(PUB_A, 'http://jumble.social', 'signEvent:1', '1d')).toMatch(/https/);
    expect(await writeListGrant(PUB_A, 'jumble.social', 'signEvent:1', '1d')).toMatch(/https/);
    expect(await writeListGrant('b'.repeat(64), ORIGIN, 'signEvent:1', '1d')).toMatch(/no longer on this device/);
    expect(await writeListGrant(null, ORIGIN, 'signEvent:1', '1d')).toMatch(/can't be read/);
    await env.flushWrites();
    expect((await env.local.get('profiles')).profiles[0].hosts?.[ORIGIN]).toBeUndefined();
  });

  it('what a prompt remembers is what the list reads', async () => {
    const env = await bootUnlocked();
    const first = send(env, signKind(7));
    await settle(30);
    await env.dispatch({
      kind: 'allowed', payload: env.tabs.shown[0].uuid, origKind: 'signEvent',
      event: { ...EVENT, kind: 7 }, remember: true, rememberFor: '1d', host: ORIGIN,
    }, PERMISSION_SENDER);
    await answerWithin(first);
    await settle(30);
    const { readGrantApps } = await import('../src/utilities/grant-list.js');
    const apps = await readGrantApps(0);
    expect(apps.map(a => a.origin)).toEqual([ORIGIN]);
    expect(apps[0].grants[0].action).toBe('signEvent:7');
    expect(apps[0].grants[0].value).toMatchObject({ v: 'allow', d: '1d' });
  });

  it('a revoke from the list during an open prompt is still honoured', async () => {
    const env = await bootUnlocked();
    const { writeListGrant } = await import('../src/utilities/grant-list.js');
    await writeListGrant(PUB_A, ORIGIN, 'signEvent:1', '30d');
    await env.flushWrites();
    const first = track(send(env, signKind(7)));
    await settle(30);
    expect(env.tabs.shown).toHaveLength(1);
    const { revokePermission } = await import('../src/utilities/utils.js');
    await revokePermission({ pubkey: PUB_A, index: 0 }, ORIGIN, ['signEvent:1']);
    await env.flushWrites();
    await env.dispatch({
      kind: 'allowed', payload: env.tabs.shown[0].uuid, origKind: 'signEvent',
      event: { ...EVENT, kind: 7 }, remember: true, host: ORIGIN,
    }, PERMISSION_SENDER);
    await answerWithin(first.promise ?? first);
    await settle(30);
    const hosts = (await env.local.get('profiles')).profiles[0].hosts;
    expect(hosts[ORIGIN]?.['signEvent:7']).toBeUndefined();
    expect(hosts[ORIGIN]?.['signEvent:1']).toBeUndefined();
  });
});
