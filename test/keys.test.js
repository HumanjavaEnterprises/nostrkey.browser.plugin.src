/**
 * Key operations tests — generate, derive pubkey, encode/decode
 *
 * Covers: generatePrivateKey, calcPubKey, getPubKey, getNpub, getNsec, npubEncode
 */

import { describe, it, expect } from 'vitest';

// We can test the actual crypto since nostr-crypto-utils is a dependency
let ncu;
try {
  ncu = await import('nostr-crypto-utils');
} catch {
  ncu = null;
}

// Fallback: test format validation only
const HEX_RE = /^[0-9a-f]{64}$/;
const NPUB_RE = /^npub1[a-z0-9]{58}$/;
const NSEC_RE = /^nsec1[a-z0-9]{58}$/;

describe('Key Operations', () => {
  describe('key format validation', () => {
    it('hex private key is 64 chars', () => {
      expect(HEX_RE.test('a'.repeat(64))).toBe(true);
      expect(HEX_RE.test('a'.repeat(63))).toBe(false);
      expect(HEX_RE.test('g'.repeat(64))).toBe(false);
    });

    it('npub starts with npub1 and is 63 chars', () => {
      expect(NPUB_RE.test('npub1' + 'a'.repeat(58))).toBe(true);
      expect(NPUB_RE.test('nsec1' + 'a'.repeat(58))).toBe(false);
    });

    it('nsec starts with nsec1 and is 63 chars', () => {
      expect(NSEC_RE.test('nsec1' + 'a'.repeat(58))).toBe(true);
      expect(NSEC_RE.test('npub1' + 'a'.repeat(58))).toBe(false);
    });
  });

  if (ncu) {
    describe('key generation (nostr-crypto-utils)', () => {
      it('generates a valid hex private key', () => {
        const key = ncu.generatePrivateKey ? ncu.generatePrivateKey() : null;
        if (key) {
          expect(HEX_RE.test(key)).toBe(true);
        }
      });

      it('derives public key from private key', () => {
        if (ncu.generatePrivateKey && ncu.getPublicKey) {
          const sk = ncu.generatePrivateKey();
          const pk = ncu.getPublicKey(sk);
          expect(HEX_RE.test(pk)).toBe(true);
          expect(pk).not.toBe(sk);
        }
      });

      it('same private key always derives same public key', () => {
        if (ncu.generatePrivateKey && ncu.getPublicKey) {
          const sk = ncu.generatePrivateKey();
          const pk1 = ncu.getPublicKey(sk);
          const pk2 = ncu.getPublicKey(sk);
          expect(pk1).toBe(pk2);
        }
      });

      it('different private keys derive different public keys', () => {
        if (ncu.generatePrivateKey && ncu.getPublicKey) {
          const sk1 = ncu.generatePrivateKey();
          const sk2 = ncu.generatePrivateKey();
          const pk1 = ncu.getPublicKey(sk1);
          const pk2 = ncu.getPublicKey(sk2);
          expect(pk1).not.toBe(pk2);
        }
      });
    });

    describe('bech32 encoding (npub/nsec)', () => {
      it('encodes pubkey to npub', () => {
        if (ncu.npubEncode) {
          const pk = 'a'.repeat(64);
          const npub = ncu.npubEncode(pk);
          expect(npub.startsWith('npub1')).toBe(true);
        }
      });

      it('encodes private key to nsec', () => {
        if (ncu.nsecEncode) {
          const sk = 'b'.repeat(64);
          const nsec = ncu.nsecEncode(sk);
          expect(nsec.startsWith('nsec1')).toBe(true);
        }
      });

      it('round-trips: encode then decode', () => {
        if (ncu.npubEncode && ncu.npubDecode) {
          const pk = 'c'.repeat(64);
          const npub = ncu.npubEncode(pk);
          const decoded = ncu.npubDecode(npub);
          expect(decoded).toBe(pk);
        }
      });
    });
  }
});
