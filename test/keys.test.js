/**
 * Key operations tests — REAL crypto against shared KAT vectors.
 *
 * Converted mock→real (audit 2026-07, T1-4): imports the actual
 * `nostr-crypto-utils` module the extension ships and asserts against the
 * shared known-answer vectors at test/vectors/nostr-vectors.json. Uses the
 * REAL export names (generateKeyPair / getPublicKeySync / nip19.*), so these
 * assertions execute instead of no-op'ing behind a wrong-name guard.
 */

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  generateKeyPair,
  getPublicKeySync,
  nip19,
} from 'nostr-crypto-utils';

const here = dirname(fileURLToPath(import.meta.url));
const V = JSON.parse(readFileSync(join(here, 'vectors', 'nostr-vectors.json'), 'utf8'));

const HEX64 = /^[0-9a-f]{64}$/;

describe('Key Operations (real nostr-crypto-utils + shared KAT vectors)', () => {
  describe('getPublicKeySync — known-answer vectors', () => {
    for (const name of ['alice', 'bob']) {
      it(`derives ${name}'s x-only pubkey from the vector private key`, () => {
        const kp = V.keypairs[name];
        expect(getPublicKeySync(kp.privateKey)).toBe(kp.xonlyPubkey);
      });
    }
  });

  describe('generateKeyPair — generation invariants', () => {
    it('generates a valid 64-hex private key and a matching pubkey', async () => {
      const kp = await generateKeyPair();
      expect(HEX64.test(kp.privateKey)).toBe(true);
      const pk = kp.publicKey.hex ?? kp.publicKey;
      expect(HEX64.test(pk)).toBe(true);
      // pubkey is the deterministic derivation of the private key
      expect(getPublicKeySync(kp.privateKey)).toBe(pk);
    });

    it('same private key always derives the same public key', async () => {
      const kp = await generateKeyPair();
      expect(getPublicKeySync(kp.privateKey)).toBe(getPublicKeySync(kp.privateKey));
    });

    it('different private keys derive different public keys', async () => {
      const a = await generateKeyPair();
      const b = await generateKeyPair();
      expect(a.privateKey).not.toBe(b.privateKey);
      expect(getPublicKeySync(a.privateKey)).not.toBe(getPublicKeySync(b.privateKey));
    });
  });

  describe('NIP-19 bech32 — known-answer vectors', () => {
    it('encodes the npub vector', () => {
      expect(nip19.npubEncode(V.nip19.npub.hex)).toBe(V.nip19.npub.encoded);
    });

    it('encodes the nsec vector', () => {
      expect(nip19.nsecEncode(V.nip19.nsec.hex)).toBe(V.nip19.nsec.encoded);
    });

    it('encodes the note vector', () => {
      expect(nip19.noteEncode(V.nip19.note.hex)).toBe(V.nip19.note.encoded);
    });

    it('round-trips npub encode → decode', () => {
      const npub = nip19.npubEncode(V.nip19.npub.hex);
      const decoded = nip19.decode(npub);
      expect(decoded.type).toBe('npub');
      expect(decoded.data).toBe(V.nip19.npub.hex);
    });

    it('keypair vectors carry matching npub encodings', () => {
      for (const name of ['alice', 'bob']) {
        const kp = V.keypairs[name];
        expect(nip19.npubEncode(kp.xonlyPubkey)).toBe(kp.npub);
      }
    });
  });
});

/**
 * Entropy source assurance — the RNG posture we publish in SECURITY.md.
 *
 * Key generation must draw from the platform CSPRNG and FAIL CLOSED if it is
 * absent, never fall back to a weaker source. (`@noble/hashes` throws
 * "crypto.getRandomValues must be defined" when the CSPRNG is missing.) The
 * lesson these pin: an assertion that has never fired is not evidence it works.
 */
describe('key generation draws from the platform CSPRNG and fails closed', () => {
  it('calls crypto.getRandomValues during generation', async () => {
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    try {
      const kp = await generateKeyPair();
      expect(spy).toHaveBeenCalled();
      expect(/^[0-9a-f]{64}$/.test(kp.privateKey)).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });

  it('THROWS rather than producing a key when the CSPRNG is unavailable', async () => {
    const real = globalThis.crypto.getRandomValues;
    // Simulate a platform with no secure RNG.
    globalThis.crypto.getRandomValues = undefined;
    try {
      await expect(generateKeyPair()).rejects.toThrow(/getRandomValues/i);
    } finally {
      globalThis.crypto.getRandomValues = real;
    }
  });

  it('produces 1000 distinct keys with no stuck bytes across the sample', async () => {
    const N = 1000;
    const keys = [];
    for (let i = 0; i < N; i++) keys.push((await generateKeyPair()).privateKey);
    expect(new Set(keys).size).toBe(N); // no collisions
    // No byte position is constant across the whole sample (a counter / stuck
    // source would pin at least one position). Check a few positions cheaply.
    for (const pos of [0, 15, 31]) {
      const seen = new Set(keys.map(k => k.slice(pos * 2, pos * 2 + 2)));
      expect(seen.size).toBeGreaterThan(1);
    }
  });
});
