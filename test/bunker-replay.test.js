/**
 * Bunker (NIP-46) replay-protection regression tests
 *
 * The bunker server signs requests from authenticated clients. Without replay
 * protection, a captured authenticated request event could be re-published to
 * the relay and re-signed. _isFreshEvent() rejects duplicate request ids and
 * events whose created_at is outside the freshness window.
 *
 * bunker-server.js imports nip46.js → browser-polyfill, which throws unless an
 * extension API namespace exists. WebSocket is only used inside start(), not at
 * import, so we can construct a server and test _isFreshEvent without starting.
 */

import { describe, it, expect, beforeEach } from 'vitest';

globalThis.chrome = {
  runtime: { onMessage: { addListener() {} } },
  storage: {
    local: { get() {}, set() {} },
    sync: { get() {}, set() {} },
    onChanged: { addListener() {} },
  },
};

const { BunkerServer } = await import('../src/utilities/bunker-server.js');

const NOW = 1_700_000_000; // seconds
const makeServer = () => new BunkerServer({ relayUrls: ['wss://r'], userPubkey: 'pub', secret: 'sek' });

describe('BunkerServer replay protection', () => {
  let srv;
  beforeEach(() => { srv = makeServer(); });

  it('accepts a fresh, unseen event', () => {
    expect(srv._isFreshEvent({ id: 'a', created_at: NOW }, NOW)).toBe(true);
  });

  it('rejects a replayed (duplicate id) event', () => {
    expect(srv._isFreshEvent({ id: 'a', created_at: NOW }, NOW)).toBe(true);
    expect(srv._isFreshEvent({ id: 'a', created_at: NOW }, NOW)).toBe(false);
  });

  it('rejects events older than the freshness window', () => {
    expect(srv._isFreshEvent({ id: 'b', created_at: NOW - 301 }, NOW)).toBe(false);
  });

  it('rejects future-dated events beyond the window', () => {
    expect(srv._isFreshEvent({ id: 'c', created_at: NOW + 301 }, NOW)).toBe(false);
  });

  it('accepts events at the window boundary', () => {
    expect(srv._isFreshEvent({ id: 'd', created_at: NOW - 300 }, NOW)).toBe(true);
    expect(srv._isFreshEvent({ id: 'e', created_at: NOW + 300 }, NOW)).toBe(true);
  });

  it('bounds the seen-id set so it cannot grow without limit', () => {
    for (let i = 0; i < 600; i++) srv._isFreshEvent({ id: 'k' + i, created_at: NOW }, NOW);
    expect(srv._seenEventIds.size).toBeLessThanOrEqual(500);
    // The oldest id was evicted, so it is accepted again (acceptable: the
    // created_at window is the cross-eviction backstop).
    expect(srv._isFreshEvent({ id: 'k0', created_at: NOW }, NOW)).toBe(true);
  });

  it('stop() clears replay state', () => {
    srv._isFreshEvent({ id: 'a', created_at: NOW }, NOW);
    srv.stop();
    expect(srv._seenEventIds.size).toBe(0);
    expect(srv._seenOrder).toHaveLength(0);
  });
});
