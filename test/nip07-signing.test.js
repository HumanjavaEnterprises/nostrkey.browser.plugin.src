/**
 * NIP-07 Event Signing tests
 *
 * Covers: signEvent — the core NIP-07 window.nostr.signEvent() flow
 */

import { describe, it, expect } from 'vitest';

let ncu;
try {
  ncu = await import('nostr-crypto-utils');
} catch {
  ncu = null;
}

describe('NIP-07 Event Signing', () => {
  if (!ncu || !ncu.generatePrivateKey || !ncu.getPublicKey || !ncu.signEvent) {
    it.skip('nostr-crypto-utils not available or missing signEvent', () => {});
    return;
  }

  const sk = ncu.generatePrivateKey();
  const pk = ncu.getPublicKey(sk);

  it('signs a kind 1 event (text note)', () => {
    const event = {
      kind: 1,
      content: 'Hello Nostr!',
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: pk,
    };

    const signed = ncu.signEvent(event, sk);
    expect(signed.sig).toBeDefined();
    expect(signed.sig.length).toBe(128); // 64 bytes hex
    expect(signed.id).toBeDefined();
    expect(signed.id.length).toBe(64);
    expect(signed.pubkey).toBe(pk);
  });

  it('signs a kind 0 event (metadata)', () => {
    const event = {
      kind: 0,
      content: JSON.stringify({ name: 'test', about: 'testing' }),
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: pk,
    };

    const signed = ncu.signEvent(event, sk);
    expect(signed.sig).toBeDefined();
    expect(signed.id).toBeDefined();
  });

  it('produces different sigs for different content', () => {
    const ts = Math.floor(Date.now() / 1000);
    const e1 = ncu.signEvent({ kind: 1, content: 'Hello', tags: [], created_at: ts, pubkey: pk }, sk);
    const e2 = ncu.signEvent({ kind: 1, content: 'World', tags: [], created_at: ts, pubkey: pk }, sk);
    expect(e1.sig).not.toBe(e2.sig);
    expect(e1.id).not.toBe(e2.id);
  });

  it('produces deterministic id for same event', () => {
    const event = { kind: 1, content: 'deterministic', tags: [], created_at: 1700000000, pubkey: pk };
    const s1 = ncu.signEvent(event, sk);
    const s2 = ncu.signEvent(event, sk);
    expect(s1.id).toBe(s2.id);
  });

  it('includes tags in event id', () => {
    const ts = Math.floor(Date.now() / 1000);
    const e1 = ncu.signEvent({ kind: 1, content: 'test', tags: [], created_at: ts, pubkey: pk }, sk);
    const e2 = ncu.signEvent({ kind: 1, content: 'test', tags: [['p', pk]], created_at: ts, pubkey: pk }, sk);
    expect(e1.id).not.toBe(e2.id);
  });
});
