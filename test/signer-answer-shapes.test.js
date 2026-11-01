/**
 * What a remote signer may tidy on the way through, and what it may not. Each
 * accepted answer below has the shape NDK 2.3.1 or 3.0.3 gives an event when it
 * signs: nsecBunker runs on the first, newer signers on the second. Everything is
 * really signed and goes through the same check the worker uses.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { finalizeEvent, getPublicKeySync, hexToBytes, nip19 } from 'nostr-crypto-utils';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { SIGNER_TAG_KINDS_EXACT, mustMatchExactly } from '../src/utilities/signer-answer.js';

installFakeChrome();
const { signedAsRequested } = await import('../src/utilities/nip46.js');

const KEY = hexToBytes('0000000000000000000000000000000000000000000000000000000000000003');
const FRIEND = getPublicKeySync('0000000000000000000000000000000000000000000000000000000000000005');
const STRANGER = getPublicKeySync('0000000000000000000000000000000000000000000000000000000000000006');
const NOTE_ID = 'b'.repeat(64);
const OTHER_ID = 'c'.repeat(64);
const RELAY = 'wss://relay.example.com';
const NPUB = nip19.npubEncode(FRIEND);
const NPROFILE = nip19.nprofileEncode(FRIEND, [RELAY]);
const NOTE = nip19.noteEncode(NOTE_ID);
const NEVENT = nip19.neventEncode(NOTE_ID, [RELAY], FRIEND);
const NADDR = nip19.naddrEncode(FRIEND, 30023, 'post', []);
const SECONDS = 1_800_000_000;
const SENT_AT = SECONDS - 86_400;

const sign = (fields) => finalizeEvent(fields, KEY);
const answer = async (request, changes = {}) => {
  const signed = await sign({ tags: [], content: '', created_at: SECONDS, ...request, ...changes });
  return signedAsRequested(signed, request);
};

afterEach(() => { vi.useRealTimers(); });
const atClock = () => { vi.useFakeTimers(); vi.setSystemTime(SECONDS * 1000); };

it('the rules import nothing', () => {
  const source = readFileSync(new URL('../src/utilities/signer-answer.js', import.meta.url), 'utf8');
  expect(source).not.toMatch(/^\s*import\b/m);
});

describe('the shapes real signers give back', () => {
  const note = (content, tags = []) => ({ kind: 1, content, tags, created_at: SENT_AT });

  const accepted = [
    ['NDK 2.3.1, a hashtag', note('gm #nostr'), { tags: [['t', 'nostr']] }],
    ['NDK 2.3.1, a hashtag inside a word', note('see a#b'), { tags: [['t', 'b']] }],
    ['NDK 2.3.1, a hashtag cut at a non-ASCII letter', note('#café'), { tags: [['t', 'caf']] }],
    ['NDK 3.0.3, a hashtag', note('gm #nostr'), { tags: [['t', 'nostr']] }],
    ['NDK 3.0.3, a non-ASCII hashtag', note('#café au lait'), { tags: [['t', 'café']] }],
    ['NDK 3.0.3, a hashtag keeps its case', note('#Nostr'), { tags: [['t', 'Nostr']] }],
    ['NDK 3.0.3, hashtags after the tags asked for', note('#a #b', [['r', 'https://example.com']]),
      { tags: [['r', 'https://example.com'], ['t', 'a'], ['t', 'b']] }],
    ['NDK 2.3.1, an @npub mention', note(`hi @${NPUB}`), { content: `hi nostr:${NPUB}`, tags: [['p', FRIEND]] }],
    ['NDK 3.0.3, an @npub mention', note(`hi @${NPUB}`), { content: `hi nostr:${NPUB}`, tags: [['p', FRIEND]] }],
    ['NDK 3.0.3, an @nprofile mention', note(`hi @${NPROFILE}`), { content: `hi nostr:${NPROFILE}`, tags: [['p', FRIEND]] }],
    ['NDK 3.0.3, a mention already in nostr: form', note(`hi nostr:${NPUB}`), { tags: [['p', FRIEND]] }],
    ['NDK 3.0.3, an @note mention', note(`see @${NOTE}`), { content: `see nostr:${NOTE}`, tags: [['q', NOTE_ID, '']] }],
    ['NDK 3.0.3, an @nevent mention', note(`see @${NEVENT}`),
      { content: `see nostr:${NEVENT}`, tags: [['q', NOTE_ID, RELAY], ['p', FRIEND]] }],
    ['NDK 3.0.3, an @naddr mention', note(`see @${NADDR}`),
      { content: `see nostr:${NADDR}`, tags: [['q', `30023:${FRIEND}:post`, ''], ['p', FRIEND]] }],
    ['NDK 3.0.3, a mention and a hashtag together', note(`#gm @${NPUB}`),
      { content: `#gm nostr:${NPUB}`, tags: [['p', FRIEND], ['t', 'gm']] }],
    ['NDK 2.3.1, a client tag', note('x'), { tags: [['client', 'an app']] }],
    ['NDK 3.0.3, a client tag with its handler', note('x'), { tags: [['client', 'an app', `31990:${FRIEND}:handler`]] }],
    ['NDK 3.0.3, an unnamed client tag', note('x'), { tags: [['client', '']] }],
  ];
  for (const [name, request, changes] of accepted) {
    it(`accepts ${name}`, async () => {
      atClock();
      expect(await answer(request, { created_at: SENT_AT, ...changes })).toBe(true);
    });
  }

  it('accepts a 30023 with no d tag getting a generated one', async () => {
    const request = { kind: 30023, content: 'long read', tags: [['title', 'A post']], created_at: SECONDS };
    expect(await answer(request, { tags: [['title', 'A post'], ['d', 'A-post-x1y2z3']] })).toBe(true);
  });

  it('accepts a 30023 with no title getting a random d tag', async () => {
    const request = { kind: 30023, content: 'long read', tags: [], created_at: SECONDS };
    expect(await answer(request, { tags: [['d', 'k3j9x0q1a2b3c4d5']] })).toBe(true);
  });

  const replaceable = [0, 3, 10000, 10002, 19999, 30000, 30023, 39999];
  for (const kind of replaceable) {
    it(`accepts kind ${kind} with its time reset to the signer's clock`, async () => {
      atClock();
      const tags = kind >= 30000 ? [['d', 'one']] : [];
      expect(await answer({ kind, content: 'x', tags, created_at: SENT_AT }, { created_at: SECONDS - 20 })).toBe(true);
    });
  }

  it('still accepts an answer that changes nothing', async () => {
    expect(await answer({ kind: 1, content: 'plain', tags: [['t', 'x']], created_at: SECONDS })).toBe(true);
  });

  it('accepts a tag added between the tags that were asked for', async () => {
    const request = note('#b', [['r', 'one'], ['r', 'two']]);
    expect(await answer(request, { created_at: SENT_AT, tags: [['r', 'one'], ['t', 'b'], ['r', 'two']] })).toBe(true);
  });
});

describe('what a signer may never change', () => {
  const note = (content, tags = []) => ({ kind: 1, content, tags, created_at: SECONDS });
  const asked = [['e', NOTE_ID], ['t', 'kept']];

  const refused = [
    ['a tag removed', note('#kept', asked), { tags: [['t', 'kept']] }],
    ['a changed tag value', note('x', asked), { tags: [['e', OTHER_ID], ['t', 'kept']] }],
    ['a longer tag', note('x', asked), { tags: [['e', NOTE_ID, RELAY], ['t', 'kept']] }],
    ['tags in another order', note('x', asked), { tags: [['t', 'kept'], ['e', NOTE_ID]] }],
    ['a t that is not in the content', note('hello'), { tags: [['t', 'spam']] }],
    ['a t that differs in case', note('#Nostr'), { tags: [['t', 'nostr']] }],
    ['a t with extra values', note('#a'), { tags: [['t', 'a', 'b']] }],
    ['an extra e tag', note(`see @${NOTE}`), { content: `see nostr:${NOTE}`, tags: [['e', NOTE_ID, '', 'mention']] }],
    ['an extra a tag', note(`see @${NADDR}`), { content: `see nostr:${NADDR}`, tags: [['a', `30023:${FRIEND}:post`, '', 'mention']] }],
    ['an extra r tag', note('x'), { tags: [['r', 'https://example.com']] }],
    ['a tag name nobody listed', note('x'), { tags: [['constructor', 'x']] }],
    ['a tag named after an object key', note('x'), { tags: [['__proto__', 'x']] }],
    ['a p for someone the content does not name', note(`hi @${NPUB}`), { content: `hi nostr:${NPUB}`, tags: [['p', STRANGER]] }],
    ['a p with nothing in the content', note('hi'), { tags: [['p', FRIEND]] }],
    ['a p with a relay added', note(`hi nostr:${NPUB}`), { tags: [['p', FRIEND, RELAY]] }],
    ['a q for another event', note(`see nostr:${NOTE}`), { tags: [['q', OTHER_ID, '']] }],
    ['a q pointing at a relay the mention does not name', note(`see nostr:${NOTE}`), { tags: [['q', NOTE_ID, 'wss://other.example.com']] }],
    ['a q for a person', note(`hi nostr:${NPUB}`), { tags: [['q', FRIEND, '']] }],
    ['a p for an event', note(`see nostr:${NOTE}`), { tags: [['p', NOTE_ID]] }],
    ['a d on a kind that does not use it', note('x'), { tags: [['d', 'one']] }],
    ['a client tag twice', note('x'), { tags: [['client', 'a'], ['client', 'b']] }],
    ['a second client tag beside the one asked for', note('x', [['client', 'a']]), { tags: [['client', 'a'], ['client', 'b']] }],
    ['a client tag with too many values', note('x'), { tags: [['client', 'a', 'b', 'c']] }],
    ['a tag that is not all text', note('#a'), { tags: [['t', 1]] }],
    ['changed content', note('hello'), { content: 'hello there' }],
    ['content rewritten but with a word changed', note(`hi @${NPUB}`), { content: `hey nostr:${NPUB}` }],
    ['only part of the rewrite', note(`@${NPUB} @${NPROFILE}`), { content: `nostr:${NPUB} @${NPROFILE}` }],
    ['a rewrite of something that is not an entity', note('@npub1nope'), { content: 'nostr:npub1nope' }],
    ['a rewrite in the other direction', note(`hi nostr:${NPUB}`), { content: `hi @${NPUB}` }],
    ['a rewrite of a secret key form', note('@nsec1abc'), { content: 'nostr:nsec1abc' }],
    ['a new time on a kind that is not replaceable', note('x'), { created_at: SECONDS + 1 }],
    ['a new time on an ephemeral kind', { kind: 20001, content: 'x', tags: [], created_at: SECONDS }, { created_at: SECONDS + 1 }],
    ['a different kind', note('x'), { kind: 2 }],
    ['an upload that came back as a delete', { kind: 24242, content: 'x', tags: [['t', 'upload']], created_at: SECONDS }, { tags: [['t', 'delete']] }],
  ];
  for (const [name, request, changes] of refused) {
    it(`refuses ${name}`, async () => {
      atClock();
      expect(await answer(request, changes)).toBe(false);
    });
  }

  it('refuses a d on a replaceable event that already had one', async () => {
    const request = { kind: 30023, content: 'x', tags: [['d', 'one']], created_at: SECONDS };
    expect(await answer(request, { tags: [['d', 'one'], ['d', 'two']] })).toBe(false);
  });

  it('refuses a d on a kind outside the addressable range', async () => {
    for (const kind of [10000, 29999, 40000]) {
      expect(await answer({ kind, content: 'x', tags: [], created_at: SECONDS }, { tags: [['d', 'one']] })).toBe(false);
    }
  });

  it('refuses a second d added to an addressable event', async () => {
    const request = { kind: 30023, content: 'x', tags: [], created_at: SECONDS };
    expect(await answer(request, { tags: [['d', 'one'], ['d', 'two']] })).toBe(false);
  });

  it('refuses an empty d', async () => {
    const request = { kind: 30023, content: 'x', tags: [], created_at: SECONDS };
    expect(await answer(request, { tags: [['d', '']] })).toBe(false);
  });

  it('refuses a replaceable event with a time outside the window of our clock', async () => {
    atClock();
    const request = { kind: 10002, content: '', tags: [], created_at: SENT_AT };
    for (const offset of [-301, 301]) {
      expect(await answer(request, { created_at: SECONDS + offset })).toBe(false);
    }
    expect(await answer(request, { created_at: SECONDS - 300 })).toBe(true);
    expect(await answer(request, { created_at: SECONDS + 300 })).toBe(true);
  });

  it('refuses a replaceable event with a time that is not a whole number', async () => {
    atClock();
    const request = { kind: 10002, content: '', tags: [], created_at: SENT_AT };
    expect(await answer(request, { created_at: SECONDS + 0.5 })).toBe(false);
  });

  it('refuses a good answer with a wrong signature', async () => {
    const request = note('#a');
    const signed = await sign({ ...request, tags: [['t', 'a']] });
    expect(await signedAsRequested({ ...signed, sig: 'f'.repeat(128) }, request)).toBe(false);
  });

  it('refuses a good answer with a wrong id', async () => {
    const request = note('#a');
    const signed = await sign({ ...request, tags: [['t', 'a']] });
    expect(await signedAsRequested({ ...signed, id: '0'.repeat(64) }, request)).toBe(false);
  });

  it('refuses tags that are not a list, on either side, without throwing', async () => {
    const good = await sign({ kind: 1, content: 'x', tags: [], created_at: SECONDS });
    for (const tags of ['x', null, 5, [null], [[]], [{}]]) {
      expect(await signedAsRequested({ ...good, tags }, note('x'))).toBe(false);
    }
    for (const tags of ['x', 5, [null], { length: 1 }]) {
      expect(await signedAsRequested(good, { ...note('x'), tags })).toBe(false);
    }
  });
});

describe('kinds that come back exactly or not at all', () => {
  const EXACT = [
    [4, [['p', FRIEND]]],
    [5, [['e', NOTE_ID]]],
    [13, []],
    [14, [['p', FRIEND]]],
    [62, [['relay', 'ALL_RELAYS']]],
    [1059, [['p', FRIEND]]],
    [9000, [['h', 'group'], ['p', FRIEND]]],
    [9021, [['h', 'group']]],
    [9030, [['h', 'group']]],
    [9321, [['p', FRIEND], ['proof', '{}']]],
    [9734, [['p', FRIEND], ['relays', RELAY]]],
    [22242, [['relay', RELAY], ['challenge', 'abc']]],
    [23194, [['p', FRIEND]]],
    [24133, [['p', FRIEND]]],
    [24242, [['t', 'upload'], ['x', 'a'.repeat(64)], ['expiration', '1800000600']]],
    [27235, [['u', 'https://example.com/api'], ['method', 'POST']]],
    [28934, [['claim', 'invite']]],
    [28935, []],
    [28936, []],
  ];

  for (const [kind, tags] of EXACT) {
    const content = `#added hi @${NPUB}`;
    const request = { kind, content, tags, created_at: SENT_AT };

    it(`kind ${kind} is on the list`, () => {
      expect(mustMatchExactly(kind)).toBe(true);
    });

    it(`kind ${kind} accepts an answer that changes nothing`, async () => {
      expect(await answer(request)).toBe(true);
    });

    const changes = [
      ['an added t the content supports', { tags: [...tags, ['t', 'added']] }],
      ['an added p the content supports', { tags: [...tags, ['p', FRIEND]] }],
      ['an added client tag', { tags: [...tags, ['client', 'an app']] }],
      ['an added d tag', { tags: [...tags, ['d', 'x']] }],
      ['a rewritten mention', { content: `#added hi nostr:${NPUB}` }],
      ['a time reset to our clock', { created_at: SECONDS }],
    ];
    for (const [name, change] of changes) {
      it(`kind ${kind} refuses ${name}`, async () => {
        atClock();
        expect(await answer(request, change)).toBe(false);
      });
    }

    if (tags.length) {
      it(`kind ${kind} refuses a removed tag`, async () => {
        expect(await answer(request, { tags: tags.slice(1) })).toBe(false);
      });
    }
  }

  it('the list is one literal of kinds and ranges', () => {
    expect(SIGNER_TAG_KINDS_EXACT).toEqual([
      [4, 4], [5, 5], [13, 13], [14, 14], [62, 62], [1059, 1059], [9000, 9030], [9321, 9321], [9734, 9734],
      [22242, 22242], [23194, 23194], [24133, 24133], [24242, 24242], [27235, 27235], [28934, 28936],
    ]);
  });

  it('ordinary kinds are not on it', () => {
    for (const kind of [0, 1, 3, 6, 7, 1111, 10002, 30023, 8999, 9031]) {
      expect(mustMatchExactly(kind)).toBe(false);
    }
  });
});
