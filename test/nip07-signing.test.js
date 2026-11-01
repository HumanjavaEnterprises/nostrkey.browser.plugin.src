/**
 * NIP-07 event signing: real crypto against shared known-answer vectors, through
 * finalizeEvent, the call the worker signs with, plus calculateEventId and
 * verifySignature.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  finalizeEvent,
  calculateEventId,
  getPublicKeySync,
  verifySignature,
} from 'nostr-crypto-utils';

const here = dirname(fileURLToPath(import.meta.url));
const V = JSON.parse(readFileSync(join(here, 'vectors', 'nostr-vectors.json'), 'utf8'));

const alice = V.keypairs.alice;

describe('NIP-07 Event Signing (real nostr-crypto-utils + shared KAT vectors)', () => {
  it('calculateEventId reproduces the deterministic KAT event id', async () => {
    const ex = V.nip01_events.example;
    const id = await calculateEventId({
      pubkey: ex.pubkey,
      created_at: ex.created_at,
      kind: ex.kind,
      tags: ex.tags,
      content: ex.content,
    });
    expect(id).toBe(ex.id);
  });

  it('signs a kind 1 event and the signature verifies', async () => {
    const event = {
      kind: 1,
      content: 'Hello Nostr!',
      tags: [],
      created_at: 1700000000,
      pubkey: alice.xonlyPubkey,
    };
    const signed = await finalizeEvent(event, alice.privateKey);
    expect(signed.pubkey).toBe(alice.xonlyPubkey);
    expect(signed.id).toHaveLength(64);
    expect(signed.sig).toHaveLength(128); // 64-byte schnorr sig, hex
    expect(await verifySignature(signed)).toBe(true);
  });

  it('signs a kind 0 (metadata) event without rewriting the kind', async () => {
    const event = {
      kind: 0,
      content: JSON.stringify({ name: 'test', about: 'testing' }),
      tags: [],
      created_at: 1700000000,
      pubkey: alice.xonlyPubkey,
    };
    const signed = await finalizeEvent(event, alice.privateKey);
    expect(signed.kind).toBe(0);
    expect(await verifySignature(signed)).toBe(true);
  });

  it('different content yields a different id and signature', async () => {
    const base = { kind: 1, tags: [], created_at: 1700000000, pubkey: alice.xonlyPubkey };
    const a = await finalizeEvent({ ...base, content: 'Hello' }, alice.privateKey);
    const b = await finalizeEvent({ ...base, content: 'World' }, alice.privateKey);
    expect(a.id).not.toBe(b.id);
    expect(a.sig).not.toBe(b.sig);
  });

  it('tags are bound into the event id', async () => {
    const base = { kind: 1, content: 'test', created_at: 1700000000, pubkey: alice.xonlyPubkey };
    const a = await calculateEventId({ ...base, tags: [] });
    const b = await calculateEventId({ ...base, tags: [['p', alice.xonlyPubkey]] });
    expect(a).not.toBe(b);
  });

  it('a tampered event fails verification', async () => {
    const signed = await finalizeEvent(
      { kind: 1, content: 'authentic', tags: [], created_at: 1700000000, pubkey: alice.xonlyPubkey },
      alice.privateKey,
    );
    const tampered = { ...signed, content: 'forged' };
    expect(await verifySignature(tampered)).toBe(false);
  });
});
