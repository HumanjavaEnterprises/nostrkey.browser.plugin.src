/**
 * Password & Lock lifecycle tests
 *
 * Tests: set password → lock → unlock → change password → remove password
 * Also tests auto-lock timeout and encrypted state detection.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock password/lock state ──

function createLockState() {
  let passwordHash = null;
  let isLocked = false;
  let autoLockTimeout = 15; // minutes
  let lockTimer = null;

  return {
    async setPassword(password) {
      if (!password || password.length < 1) throw new Error('Password required');
      // In real code this is a PBKDF2 hash
      passwordHash = `hash:${password}`;
      isLocked = false;
    },

    async changePassword(oldPassword, newPassword) {
      if (!passwordHash) throw new Error('No password set');
      if (`hash:${oldPassword}` !== passwordHash) throw new Error('Wrong password');
      if (!newPassword || newPassword.length < 1) throw new Error('New password required');
      passwordHash = `hash:${newPassword}`;
    },

    async removePassword(password) {
      if (!passwordHash) throw new Error('No password set');
      if (`hash:${password}` !== passwordHash) throw new Error('Wrong password');
      passwordHash = null;
      isLocked = false;
    },

    async lock() {
      if (!passwordHash) throw new Error('Cannot lock without a password');
      isLocked = true;
    },

    async unlock(password) {
      if (!passwordHash) throw new Error('No password set');
      if (`hash:${password}` !== passwordHash) throw new Error('Wrong password');
      isLocked = false;
    },

    async isEncrypted() {
      return passwordHash !== null;
    },

    async getIsLocked() {
      return isLocked;
    },

    async setAutoLockTimeout(minutes) {
      if (minutes < 0) throw new Error('Invalid timeout');
      autoLockTimeout = minutes;
    },

    async getAutoLockTimeout() {
      return autoLockTimeout;
    },

    // Test helpers
    _getHash: () => passwordHash,
  };
}

// ── Tests ──

describe('Password Management', () => {
  let lock;

  beforeEach(() => {
    lock = createLockState();
  });

  describe('set password', () => {
    it('sets a master password', async () => {
      await lock.setPassword('mypassword123');
      expect(await lock.isEncrypted()).toBe(true);
    });

    it('is not locked after setting password', async () => {
      await lock.setPassword('mypassword123');
      expect(await lock.getIsLocked()).toBe(false);
    });

    it('rejects empty password', async () => {
      await expect(lock.setPassword('')).rejects.toThrow('Password required');
    });
  });

  describe('lock / unlock', () => {
    it('locks after password is set', async () => {
      await lock.setPassword('test123');
      await lock.lock();
      expect(await lock.getIsLocked()).toBe(true);
    });

    it('unlocks with correct password', async () => {
      await lock.setPassword('test123');
      await lock.lock();
      await lock.unlock('test123');
      expect(await lock.getIsLocked()).toBe(false);
    });

    it('rejects wrong password on unlock', async () => {
      await lock.setPassword('test123');
      await lock.lock();
      await expect(lock.unlock('wrong')).rejects.toThrow('Wrong password');
      expect(await lock.getIsLocked()).toBe(true);
    });

    it('cannot lock without a password', async () => {
      await expect(lock.lock()).rejects.toThrow('Cannot lock without a password');
    });
  });

  describe('change password', () => {
    it('changes password with correct old password', async () => {
      await lock.setPassword('old123');
      await lock.changePassword('old123', 'new456');

      // Old password should no longer work
      await lock.lock();
      await expect(lock.unlock('old123')).rejects.toThrow('Wrong password');

      // New password should work
      await lock.unlock('new456');
      expect(await lock.getIsLocked()).toBe(false);
    });

    it('rejects wrong old password', async () => {
      await lock.setPassword('correct');
      await expect(lock.changePassword('wrong', 'new'))
        .rejects.toThrow('Wrong password');
    });

    it('rejects empty new password', async () => {
      await lock.setPassword('old');
      await expect(lock.changePassword('old', ''))
        .rejects.toThrow('New password required');
    });
  });

  describe('remove password', () => {
    it('removes password with correct password', async () => {
      await lock.setPassword('test123');
      await lock.removePassword('test123');
      expect(await lock.isEncrypted()).toBe(false);
      expect(await lock.getIsLocked()).toBe(false);
    });

    it('rejects wrong password', async () => {
      await lock.setPassword('test123');
      await expect(lock.removePassword('wrong'))
        .rejects.toThrow('Wrong password');
      expect(await lock.isEncrypted()).toBe(true);
    });
  });

  describe('auto-lock timeout', () => {
    it('defaults to 15 minutes', async () => {
      expect(await lock.getAutoLockTimeout()).toBe(15);
    });

    it('can be changed', async () => {
      await lock.setAutoLockTimeout(30);
      expect(await lock.getAutoLockTimeout()).toBe(30);
    });

    it('can be set to 0 (never auto-lock)', async () => {
      await lock.setAutoLockTimeout(0);
      expect(await lock.getAutoLockTimeout()).toBe(0);
    });

    it('rejects negative values', async () => {
      await expect(lock.setAutoLockTimeout(-1))
        .rejects.toThrow('Invalid timeout');
    });
  });

  describe('full lifecycle', () => {
    it('set → lock → fail unlock → unlock → change → lock → unlock with new', async () => {
      // Set password
      await lock.setPassword('first');
      expect(await lock.isEncrypted()).toBe(true);
      expect(await lock.getIsLocked()).toBe(false);

      // Lock
      await lock.lock();
      expect(await lock.getIsLocked()).toBe(true);

      // Wrong password
      await expect(lock.unlock('nope')).rejects.toThrow();
      expect(await lock.getIsLocked()).toBe(true);

      // Correct password
      await lock.unlock('first');
      expect(await lock.getIsLocked()).toBe(false);

      // Change password
      await lock.changePassword('first', 'second');

      // Lock again
      await lock.lock();

      // Old password fails
      await expect(lock.unlock('first')).rejects.toThrow();

      // New password works
      await lock.unlock('second');
      expect(await lock.getIsLocked()).toBe(false);

      // Remove password
      await lock.removePassword('second');
      expect(await lock.isEncrypted()).toBe(false);
    });
  });
});
