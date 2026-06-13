/**
 * Backup-password regression tests
 *
 * Locks in the fix that lets users export an encrypted backup WITHOUT a master
 * password. The backup handler now encrypts the payload with a dedicated backup
 * password supplied at export time (`encryptBlob` === crypto `encrypt`), instead
 * of the in-memory session key. That means a backup can be created with no
 * master password set and even while the extension is locked.
 *
 * These exercise the real crypto round-trip the handler relies on. The handler
 * itself isn't node-importable (it pulls in background.js + the extension API),
 * so we assert against the exact primitive it calls and re-encode its 8-char
 * minimum password rule.
 */

import { describe, it, expect } from 'vitest';
import { encrypt as encryptBlob, decrypt as decryptBlob } from '../src/utilities/crypto.js';

// Mirrors background.js: a backup password is required and must be >= 8 chars.
function requireBackupPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return { success: false, error: 'A backup password of at least 8 characters is required' };
  }
  return { success: true };
}

describe('backup export — password-based, no session key required', () => {
  const state = JSON.stringify({
    profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa' }],
    relays: { 'wss://relay.example.com': { read: true, write: true } },
    version: '1.6.2',
  });

  it('round-trips the backup with only a backup password (no master/session key)', async () => {
    const password = 'correct horse';
    const envelope = await encryptBlob(state, password);

    // Envelope is self-describing ciphertext — no plaintext leaks.
    const parsed = JSON.parse(envelope);
    expect(parsed.salt).toBeDefined();
    expect(parsed.iv).toBeDefined();
    expect(parsed.ciphertext).toBeDefined();
    expect(envelope).not.toContain('KA');

    const restored = await decryptBlob(envelope, password);
    expect(restored).toBe(state);
  });

  it('cannot be decrypted with the wrong password', async () => {
    const envelope = await encryptBlob(state, 'correct horse');
    await expect(decryptBlob(envelope, 'wrong horse')).rejects.toThrow();
  });

  it('two exports of the same data produce different ciphertext (random salt/iv)', async () => {
    const a = await encryptBlob(state, 'correct horse');
    const b = await encryptBlob(state, 'correct horse');
    expect(a).not.toBe(b);
  });

  it('rejects a backup password shorter than 8 characters', () => {
    expect(requireBackupPassword('short').success).toBe(false);
    expect(requireBackupPassword('').success).toBe(false);
    expect(requireBackupPassword(undefined).success).toBe(false);
    expect(requireBackupPassword('longenough').success).toBe(true);
  });
});
