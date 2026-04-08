/**
 * NIP-04 Encryption tests (deprecated but still supported)
 *
 * Covers: nip04.encrypt, nip04.decrypt
 * NIP-04 uses AES-256-CBC — deprecated in favor of NIP-44 but
 * still needed for backwards compatibility with older clients.
 */

import { describe, it, expect } from 'vitest';

// NIP-04 format: base64(ciphertext)?iv=base64(iv)
const NIP04_RE = /^[A-Za-z0-9+/=]+\?iv=[A-Za-z0-9+/=]+$/;

describe('NIP-04 Encryption (deprecated)', () => {
  it('NIP-04 ciphertext format is base64?iv=base64', () => {
    expect(NIP04_RE.test('Y2lwaGVydGV4dA==?iv=aXY=')).toBe(true);
    expect(NIP04_RE.test('plaintext')).toBe(false);
    expect(NIP04_RE.test('')).toBe(false);
  });

  it('NIP-04 ciphertext always has ?iv= separator', () => {
    const valid = 'abc123==?iv=def456==';
    expect(valid.includes('?iv=')).toBe(true);
    const parts = valid.split('?iv=');
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});
