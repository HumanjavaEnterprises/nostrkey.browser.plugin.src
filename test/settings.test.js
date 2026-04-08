/**
 * Settings tests
 *
 * Covers: setAutoLockTimeout, getAutoLockTimeout, setNostrAccessWhileLocked,
 *         setBlockCrossOriginFrames, getBlockCrossOriginFrames
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createSettings() {
  let settings = {
    autoLockTimeout: 15,
    nostrAccessWhileLocked: false,
    blockCrossOriginFrames: true,
  };

  return {
    async get(key) { return settings[key]; },
    async set(key, value) {
      if (!(key in settings)) throw new Error(`Unknown setting: ${key}`);
      settings[key] = value;
    },
    async getAll() { return { ...settings }; },
    _reset() {
      settings = { autoLockTimeout: 15, nostrAccessWhileLocked: false, blockCrossOriginFrames: true };
    },
  };
}

describe('Settings', () => {
  let settings;

  beforeEach(() => {
    settings = createSettings();
  });

  describe('auto-lock timeout', () => {
    it('defaults to 15 minutes', async () => {
      expect(await settings.get('autoLockTimeout')).toBe(15);
    });

    it('can set to 5 minutes', async () => {
      await settings.set('autoLockTimeout', 5);
      expect(await settings.get('autoLockTimeout')).toBe(5);
    });

    it('can set to 0 (never)', async () => {
      await settings.set('autoLockTimeout', 0);
      expect(await settings.get('autoLockTimeout')).toBe(0);
    });

    it('can set to 60 minutes', async () => {
      await settings.set('autoLockTimeout', 60);
      expect(await settings.get('autoLockTimeout')).toBe(60);
    });
  });

  describe('nostr access while locked', () => {
    it('defaults to false', async () => {
      expect(await settings.get('nostrAccessWhileLocked')).toBe(false);
    });

    it('can enable (allow getPublicKey while locked)', async () => {
      await settings.set('nostrAccessWhileLocked', true);
      expect(await settings.get('nostrAccessWhileLocked')).toBe(true);
    });
  });

  describe('block cross-origin frames', () => {
    it('defaults to true (secure)', async () => {
      expect(await settings.get('blockCrossOriginFrames')).toBe(true);
    });

    it('can disable for compatibility', async () => {
      await settings.set('blockCrossOriginFrames', false);
      expect(await settings.get('blockCrossOriginFrames')).toBe(false);
    });
  });

  describe('unknown settings', () => {
    it('rejects unknown setting keys', async () => {
      await expect(settings.set('unknownKey', true))
        .rejects.toThrow('Unknown setting');
    });
  });

  describe('full settings object', () => {
    it('returns all settings', async () => {
      const all = await settings.getAll();
      expect(all).toHaveProperty('autoLockTimeout');
      expect(all).toHaveProperty('nostrAccessWhileLocked');
      expect(all).toHaveProperty('blockCrossOriginFrames');
    });
  });
});
