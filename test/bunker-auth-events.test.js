/**
 * A remote app's auth events (NIP-98, NIP-42) on the bunker path: malformed,
 * stale, or aimed at NostrKey's own relay is refused before any grant.
 */
import { describe, it, expect } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

installFakeChrome();
const { bunkerAuthProblem } = await import('../src/utilities/bunker-server.js');

const NOW = 1_800_000_000;
const http = (tags, created_at = NOW) => ({ kind: 27235, content: '', tags, created_at });
const relay = (tags, created_at = NOW) => ({ kind: 22242, content: '', tags, created_at });
const U = (u) => ['u', u];
const M = ['method', 'GET'];

describe('bunker inbound auth events', () => {
  const OWN_B = ['wss://relay.nostrkey.com'];
  it.each([
    ['malformed 27235', http([M]), 'bad_url'],
    ['stale 27235', http([U('https://a.com/'), M], NOW - 120), 'stale'],
    ['22242 without challenge', relay([['relay', 'wss://r.example']]), 'no_challenge'],
    ['22242 to the bunker relay', relay([['relay', 'wss://relay.nostrkey.com'], ['challenge', 'c']]), 'own_relay'],
    ['valid 27235 (no site to compare)', http([U('https://a.com/'), M]), null],
    ['valid 22242', relay([['relay', 'wss://r.example'], ['challenge', 'c']]), null],
    ['a note', { kind: 1, tags: [], created_at: 0 }, null],
  ])('%s', (_n, event, problem) => {
    expect(bunkerAuthProblem(event, NOW, OWN_B)).toBe(problem);
  });
});

