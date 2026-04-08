/**
 * Backup export/import tests
 *
 * Covers: backup.export, backup.import — full state round-trip
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createBackupSystem() {
  let profiles = [];
  let relays = [];
  let settings = { autoLock: 15 };

  return {
    async exportBackup() {
      return JSON.stringify({
        version: 1,
        exported_at: new Date().toISOString(),
        profiles: profiles.map(p => ({ ...p })),
        relays: [...relays],
        settings: { ...settings },
      });
    },

    async importBackup(jsonStr) {
      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch {
        throw new Error('Invalid backup format');
      }
      if (!data.version) throw new Error('Missing version in backup');
      if (!Array.isArray(data.profiles)) throw new Error('Missing profiles in backup');

      profiles = data.profiles;
      relays = data.relays || [];
      settings = data.settings || settings;
      return { imported: profiles.length };
    },

    async getProfiles() { return [...profiles]; },
    async addProfile(p) { profiles.push(p); },
    async getRelays() { return [...relays]; },
    async addRelay(r) { relays.push(r); },

    _reset() { profiles = []; relays = []; settings = { autoLock: 15 }; },
  };
}

describe('Backup / Restore', () => {
  let system;

  beforeEach(() => {
    system = createBackupSystem();
  });

  describe('export', () => {
    it('exports valid JSON', async () => {
      const backup = await system.exportBackup();
      const data = JSON.parse(backup);
      expect(data.version).toBe(1);
      expect(data.exported_at).toBeDefined();
    });

    it('includes profiles', async () => {
      await system.addProfile({ id: 'p1', name: 'Alice', nsec: 'nsec1alice' });
      const backup = await system.exportBackup();
      const data = JSON.parse(backup);
      expect(data.profiles).toHaveLength(1);
      expect(data.profiles[0].name).toBe('Alice');
    });

    it('includes relays', async () => {
      await system.addRelay('wss://relay.nostrkeep.com');
      const backup = await system.exportBackup();
      const data = JSON.parse(backup);
      expect(data.relays).toContain('wss://relay.nostrkeep.com');
    });
  });

  describe('import', () => {
    it('imports a valid backup', async () => {
      const backup = JSON.stringify({
        version: 1,
        profiles: [{ id: 'p1', name: 'Bob', nsec: 'nsec1bob' }],
        relays: ['wss://nos.lol'],
      });
      const result = await system.importBackup(backup);
      expect(result.imported).toBe(1);
    });

    it('restores profiles', async () => {
      const backup = JSON.stringify({
        version: 1,
        profiles: [
          { id: 'p1', name: 'Alice', nsec: 'nsec1alice' },
          { id: 'p2', name: 'Bob', nsec: 'nsec1bob' },
        ],
      });
      await system.importBackup(backup);
      const profiles = await system.getProfiles();
      expect(profiles).toHaveLength(2);
    });

    it('rejects invalid JSON', async () => {
      await expect(system.importBackup('not json'))
        .rejects.toThrow('Invalid backup format');
    });

    it('rejects missing version', async () => {
      await expect(system.importBackup('{"profiles":[]}'))
        .rejects.toThrow('Missing version');
    });

    it('rejects missing profiles', async () => {
      await expect(system.importBackup('{"version":1}'))
        .rejects.toThrow('Missing profiles');
    });
  });

  describe('round-trip', () => {
    it('export → import preserves all data', async () => {
      await system.addProfile({ id: 'p1', name: 'Alice', nsec: 'nsec1alice' });
      await system.addProfile({ id: 'p2', name: 'Bob', nsec: 'nsec1bob' });
      await system.addRelay('wss://relay.nostrkeep.com');

      const backup = await system.exportBackup();

      // Reset and reimport
      system._reset();
      expect(await system.getProfiles()).toHaveLength(0);

      await system.importBackup(backup);
      const profiles = await system.getProfiles();
      expect(profiles).toHaveLength(2);
      expect(profiles[0].name).toBe('Alice');
      expect(profiles[1].name).toBe('Bob');
    });
  });
});
