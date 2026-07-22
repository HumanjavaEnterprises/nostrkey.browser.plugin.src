/**
 * npub-guard tests — lookalike / substituted-npub ("npub poisoning") detection.
 *
 * The only substitution attack on Nostr is truncation collision: a different key
 * whose shown head (12) + tail (8) match a trusted key, so both read identically
 * once the UI truncates them. These tests pin that detection.
 */

import { describe, it, expect } from 'vitest';
import {
  NPUB_HEAD,
  NPUB_TAIL,
  truncateNpub,
  findLookalikes,
  hasLookalike,
  collidingNpubs,
} from '../src/utilities/npub-guard.js';

// Real-shaped npubs: 'npub1' (5) + 58 bech32 data chars = 63. Charset is
// qpzry9x8gf2tvdw0s3jn54khce6mua7l. head = npub1 + 7 data; tail = last 8 data;
// middle = 43 data chars in between.
const HEAD7 = 'qpzry9x';
const TAIL8 = 'mua7lqpz';
const mk = (mid) => 'npub1' + HEAD7 + String(mid).repeat(43) + TAIL8;

const A = mk('q'); // shown = npub1qpzry9x … mua7lqpz
const B = mk('p'); // SAME shown head+tail as A, different middle  → lookalike of A
const C = 'npub1' + 'w0s3jn5' + 'w'.repeat(43) + '4khce6mu'; // different head+tail → distinct

describe('npub-guard: truncation window', () => {
  it('exposes the display window the profile list actually uses', () => {
    expect(NPUB_HEAD).toBe(12);
    expect(NPUB_TAIL).toBe(8);
  });

  it('truncateNpub shows head(12) … tail(8)', () => {
    expect(A.length).toBe(63);
    expect(truncateNpub(A)).toBe('npub1qpzry9x' + '…' + 'mua7lqpz');
    expect(truncateNpub(A).startsWith(A.slice(0, 12))).toBe(true);
    expect(truncateNpub(A).endsWith(A.slice(-8))).toBe(true);
  });

  it('passes short / non-string values through safely', () => {
    expect(truncateNpub('npub1short')).toBe('npub1short');
    expect(truncateNpub('')).toBe('');
    expect(truncateNpub(null)).toBe('');
    expect(truncateNpub(undefined)).toBe('');
  });
});

describe('npub-guard: findLookalikes', () => {
  it('flags a different key that renders identically once truncated', () => {
    // A and B are NOT equal, but truncate to the same string — the attack.
    expect(A).not.toBe(B);
    expect(truncateNpub(A)).toBe(truncateNpub(B));
    expect(findLookalikes(A, [B, C])).toEqual([B]);
  });

  it('does NOT flag a distinct npub (different head/tail)', () => {
    expect(findLookalikes(A, [C])).toEqual([]);
    expect(hasLookalike(A, [C])).toBe(false);
  });

  it('does NOT flag an exact duplicate as a lookalike (that is a separate condition)', () => {
    expect(findLookalikes(A, [A])).toEqual([]);
    expect(findLookalikes(A, [A, C])).toEqual([]);
  });

  it('hasLookalike is true when a collision exists', () => {
    expect(hasLookalike(A, [B])).toBe(true);
    expect(hasLookalike(A, [C, B])).toBe(true);
  });

  it('ignores empty / non-string inputs without throwing', () => {
    expect(findLookalikes('', [A])).toEqual([]);
    expect(findLookalikes(A, null)).toEqual([]);
    expect(findLookalikes(A, [null, undefined, '', C])).toEqual([]);
    expect(hasLookalike(null, [A])).toBe(false);
  });

  it('does not false-positive when only the head OR only the tail matches', () => {
    const sameHead = 'npub1' + HEAD7 + 'z'.repeat(43) + '0000q000'; // head matches, tail differs
    const sameTail = 'npub1' + '0000q00' + 'z'.repeat(43) + TAIL8;  // tail matches, head differs
    expect(hasLookalike(A, [sameHead])).toBe(false);
    expect(hasLookalike(A, [sameTail])).toBe(false);
  });
});

describe('npub-guard: collidingNpubs (whole-list scan)', () => {
  it('returns every npub involved in a truncation collision', () => {
    const set = collidingNpubs([A, B, C]);
    expect(set.has(A)).toBe(true);
    expect(set.has(B)).toBe(true);
    expect(set.has(C)).toBe(false);
    expect(set.size).toBe(2);
  });

  it('treats exact duplicates as NOT colliding (same key, not a lookalike)', () => {
    expect(collidingNpubs([A, A, C]).size).toBe(0);
  });

  it('handles empty / malformed lists', () => {
    expect(collidingNpubs([]).size).toBe(0);
    expect(collidingNpubs(null).size).toBe(0);
    expect(collidingNpubs([null, '', A]).size).toBe(0);
  });
});
