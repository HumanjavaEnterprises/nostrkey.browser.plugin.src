/**
 * NIP-44 Encryption tests (ChaCha20-Poly1305)
 *
 * Covers: nip44.encrypt, nip44.decrypt — round-trip encryption
 */

import { describe, it, expect } from 'vitest';

let ncu;
try {
  ncu = await import('nostr-crypto-utils');
} catch {
  ncu = null;
}

describe('NIP-44 Encryption', () => {
  if (!ncu || !ncu.generatePrivateKey || !ncu.getPublicKey) {
    it.skip('nostr-crypto-utils not available', () => {});
    return;
  }

  // NIP-44 uses the sender's private key + recipient's public key
  const senderSk = ncu.generatePrivateKey();
  const senderPk = ncu.getPublicKey(senderSk);
  const recipientSk = ncu.generatePrivateKey();
  const recipientPk = ncu.getPublicKey(recipientSk);

  const encrypt = ncu.nip44Encrypt || ncu.encrypt;
  const decrypt = ncu.nip44Decrypt || ncu.decrypt;

  if (!encrypt || !decrypt) {
    it.skip('NIP-44 encrypt/decrypt not available in this version', () => {});
    return;
  }

  it('encrypts a message', () => {
    const ciphertext = encrypt('Hello secret world', senderSk, recipientPk);
    expect(ciphertext).toBeDefined();
    expect(ciphertext).not.toBe('Hello secret world');
    expect(ciphertext.length).toBeGreaterThan(0);
  });

  it('decrypts back to original message', () => {
    const plaintext = 'Hello secret world';
    const ciphertext = encrypt(plaintext, senderSk, recipientPk);
    const decrypted = decrypt(ciphertext, recipientSk, senderPk);
    expect(decrypted).toBe(plaintext);
  });

  it('round-trips unicode content', () => {
    const plaintext = '日本語テスト 🎉 émojis et accents';
    const ciphertext = encrypt(plaintext, senderSk, recipientPk);
    const decrypted = decrypt(ciphertext, recipientSk, senderPk);
    expect(decrypted).toBe(plaintext);
  });

  it('round-trips long content', () => {
    const plaintext = 'A'.repeat(10000);
    const ciphertext = encrypt(plaintext, senderSk, recipientPk);
    const decrypted = decrypt(ciphertext, recipientSk, senderPk);
    expect(decrypted).toBe(plaintext);
  });

  it('round-trips empty string', () => {
    const ciphertext = encrypt('', senderSk, recipientPk);
    const decrypted = decrypt(ciphertext, recipientSk, senderPk);
    expect(decrypted).toBe('');
  });

  it('produces different ciphertext each time (random nonce)', () => {
    const plaintext = 'same message';
    const c1 = encrypt(plaintext, senderSk, recipientPk);
    const c2 = encrypt(plaintext, senderSk, recipientPk);
    expect(c1).not.toBe(c2); // random nonce makes each encryption unique
  });

  it('wrong key cannot decrypt', () => {
    const plaintext = 'secret';
    const ciphertext = encrypt(plaintext, senderSk, recipientPk);
    const wrongSk = ncu.generatePrivateKey();

    expect(() => {
      decrypt(ciphertext, wrongSk, senderPk);
    }).toThrow();
  });
});
