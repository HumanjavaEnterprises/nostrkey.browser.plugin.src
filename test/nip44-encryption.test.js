/**
 * NIP-44 v2 encryption tests — REAL crypto against official KAT vectors.
 *
 * Converted mock→real (audit 2026-07, T1-4). The old suite probed
 * `ncu.nip44Encrypt || ncu.encrypt` (neither exists in 0.8.0) and skipped.
 * This drives the real `nip44` surface and asserts:
 *   - get_conversation_key official vectors (byte-exact),
 *   - encrypt/decrypt official vectors (payload byte-exact + decrypt),
 *   - calc_padded_len vectors,
 *   - CROSS-PARTY exchange (A encrypts → B decrypts), not just self round-trip.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  nip44,
  getPublicKeySync,
  hexToBytes,
  bytesToHex,
} from 'nostr-crypto-utils';

const here = dirname(fileURLToPath(import.meta.url));
const V = JSON.parse(readFileSync(join(here, 'vectors', 'nostr-vectors.json'), 'utf8'));

// getConversationKey(privBytes, pubHexXonly) — sec is bytes, pub is 64-hex x-only.
const convKey = (secHex, pubHex) => nip44.getConversationKey(hexToBytes(secHex), pubHex);

describe('NIP-44 v2 Encryption (real nostr-crypto-utils + official KAT vectors)', () => {
  describe('get_conversation_key — known-answer vectors', () => {
    V.nip44.get_conversation_key.forEach((vec, i) => {
      it(`vector ${i} derives the expected conversation key`, () => {
        const ck = convKey(vec.sec1, vec.pub2);
        expect(bytesToHex(ck)).toBe(vec.conversation_key);
      });
    });
  });

  describe('encrypt / decrypt — known-answer vectors', () => {
    V.nip44.encrypt_decrypt.forEach((vec, i) => {
      it(`vector ${i}: encrypt(plaintext, ck, nonce) === payload`, () => {
        const ck = hexToBytes(vec.conversation_key);
        const nonce = hexToBytes(vec.nonce);
        expect(nip44.encrypt(vec.plaintext, ck, nonce)).toBe(vec.payload);
      });

      it(`vector ${i}: decrypt(payload, ck) === plaintext`, () => {
        const ck = hexToBytes(vec.conversation_key);
        expect(nip44.decrypt(vec.payload, ck)).toBe(vec.plaintext);
      });
    });
  });

  describe('calc_padded_len — known-answer vectors', () => {
    it('matches every [unpadded, padded] vector', () => {
      for (const [unpadded, padded] of V.nip44.calc_padded_len) {
        expect(nip44.calcPaddedLen(unpadded)).toBe(padded);
      }
    });
  });

  describe('cross-party exchange (A encrypts → B decrypts)', () => {
    const alice = V.keypairs.alice;
    const bob = V.keypairs.bob;

    it('conversation key is symmetric across the two parties', () => {
      const ab = convKey(alice.privateKey, bob.xonlyPubkey);
      const ba = convKey(bob.privateKey, alice.xonlyPubkey);
      expect(bytesToHex(ab)).toBe(bytesToHex(ba));
    });

    it('Bob decrypts a message Alice encrypted to him', () => {
      const ab = convKey(alice.privateKey, bob.xonlyPubkey);
      const ba = convKey(bob.privateKey, alice.xonlyPubkey);
      const plaintext = 'cross-party 日本語 🎉 secret';
      const payload = nip44.encrypt(plaintext, ab);
      expect(payload).not.toContain(plaintext);
      expect(nip44.decrypt(payload, ba)).toBe(plaintext);
    });

    it('a third party (wrong conversation key) cannot decrypt', () => {
      const carolSk = '0000000000000000000000000000000000000000000000000000000000000003';
      const ab = convKey(alice.privateKey, bob.xonlyPubkey);
      const wrong = convKey(carolSk, alice.xonlyPubkey);
      const payload = nip44.encrypt('for bob only', ab);
      expect(() => nip44.decrypt(payload, wrong)).toThrow();
    });

    it('random nonce makes each encryption unique', () => {
      const ab = convKey(alice.privateKey, bob.xonlyPubkey);
      expect(nip44.encrypt('same', ab)).not.toBe(nip44.encrypt('same', ab));
    });
  });
});
