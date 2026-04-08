/**
 * Profile lifecycle tests — create, rename, switch, delete
 *
 * Tests the core profile operations by simulating the message kinds
 * that the sidepanel/popup send to background.js.
 *
 * These are unit tests of the data logic, not browser integration tests.
 * For full UI tests, see test/e2e/ (Playwright).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock chrome.storage.local ──
// Simulates the extension's storage layer

function createMockStorage() {
  let data = {};
  return {
    get: vi.fn(async (keys) => {
      if (typeof keys === 'string') return { [keys]: data[keys] };
      if (Array.isArray(keys)) {
        const result = {};
        keys.forEach(k => { if (k in data) result[k] = data[k]; });
        return result;
      }
      return { ...data };
    }),
    set: vi.fn(async (items) => {
      Object.assign(data, items);
    }),
    remove: vi.fn(async (keys) => {
      const arr = Array.isArray(keys) ? keys : [keys];
      arr.forEach(k => delete data[k]);
    }),
    clear: vi.fn(async () => { data = {}; }),
    _data: () => data,
    _reset: () => { data = {}; },
  };
}

// ── Profile data helpers (replicate background.js logic) ──

function generateProfileId() {
  return 'profile_' + Math.random().toString(36).slice(2, 10);
}

async function getProfiles(storage) {
  const result = await storage.get('profiles');
  return result.profiles || [];
}

async function saveProfiles(storage, profiles) {
  await storage.set({ profiles });
}

async function addProfile(storage, { name, nsec, type = 'local' }) {
  const profiles = await getProfiles(storage);
  const id = generateProfileId();
  const profile = { id, name, nsec, type, created: Date.now() };
  profiles.push(profile);
  await saveProfiles(storage, profiles);
  return profile;
}

async function renameProfile(storage, id, newName) {
  const profiles = await getProfiles(storage);
  const profile = profiles.find(p => p.id === id);
  if (!profile) throw new Error('Profile not found');
  profile.name = newName;
  await saveProfiles(storage, profiles);
  return profile;
}

async function deleteProfile(storage, id) {
  const profiles = await getProfiles(storage);
  const filtered = profiles.filter(p => p.id !== id);
  if (filtered.length === profiles.length) throw new Error('Profile not found');
  await saveProfiles(storage, filtered);
  return filtered;
}

async function getActiveProfile(storage) {
  const result = await storage.get('active_profile');
  return result.active_profile || null;
}

async function setActiveProfile(storage, id) {
  await storage.set({ active_profile: id });
}

// ── Tests ──

describe('Profile Lifecycle', () => {
  let storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  describe('create profile', () => {
    it('creates a profile with name and nsec', async () => {
      const profile = await addProfile(storage, {
        name: 'Test Profile',
        nsec: 'nsec1fake0000000000000000000000000000000000000000000000000000000',
      });

      expect(profile.id).toMatch(/^profile_/);
      expect(profile.name).toBe('Test Profile');
      expect(profile.nsec).toContain('nsec1');
      expect(profile.type).toBe('local');
      expect(profile.created).toBeGreaterThan(0);
    });

    it('stores profile in storage', async () => {
      await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });

      const profiles = await getProfiles(storage);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Alice');
    });

    it('can create multiple profiles', async () => {
      await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });
      await addProfile(storage, { name: 'Bob', nsec: 'nsec1bob' });
      await addProfile(storage, { name: 'Charlie', nsec: 'nsec1charlie' });

      const profiles = await getProfiles(storage);
      expect(profiles).toHaveLength(3);
      expect(profiles.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('each profile gets a unique ID', async () => {
      const p1 = await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });
      const p2 = await addProfile(storage, { name: 'Bob', nsec: 'nsec1bob' });

      expect(p1.id).not.toBe(p2.id);
    });
  });

  describe('rename profile', () => {
    it('renames an existing profile', async () => {
      const profile = await addProfile(storage, { name: 'Old Name', nsec: 'nsec1test' });

      await renameProfile(storage, profile.id, 'New Name');

      const profiles = await getProfiles(storage);
      expect(profiles[0].name).toBe('New Name');
    });

    it('preserves other profile data when renaming', async () => {
      const profile = await addProfile(storage, { name: 'Original', nsec: 'nsec1test' });
      const originalNsec = profile.nsec;

      await renameProfile(storage, profile.id, 'Renamed');

      const profiles = await getProfiles(storage);
      expect(profiles[0].nsec).toBe(originalNsec);
      expect(profiles[0].id).toBe(profile.id);
    });

    it('throws when renaming non-existent profile', async () => {
      await expect(renameProfile(storage, 'fake_id', 'Nope'))
        .rejects.toThrow('Profile not found');
    });

    it('only renames the targeted profile', async () => {
      const p1 = await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });
      await addProfile(storage, { name: 'Bob', nsec: 'nsec1bob' });

      await renameProfile(storage, p1.id, 'Alice Updated');

      const profiles = await getProfiles(storage);
      expect(profiles[0].name).toBe('Alice Updated');
      expect(profiles[1].name).toBe('Bob');
    });
  });

  describe('delete profile', () => {
    it('deletes a profile', async () => {
      const profile = await addProfile(storage, { name: 'Delete Me', nsec: 'nsec1del' });

      await deleteProfile(storage, profile.id);

      const profiles = await getProfiles(storage);
      expect(profiles).toHaveLength(0);
    });

    it('only deletes the targeted profile', async () => {
      const p1 = await addProfile(storage, { name: 'Keep', nsec: 'nsec1keep' });
      const p2 = await addProfile(storage, { name: 'Delete', nsec: 'nsec1del' });

      await deleteProfile(storage, p2.id);

      const profiles = await getProfiles(storage);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].name).toBe('Keep');
    });

    it('throws when deleting non-existent profile', async () => {
      await expect(deleteProfile(storage, 'fake_id'))
        .rejects.toThrow('Profile not found');
    });
  });

  describe('switch active profile', () => {
    it('sets active profile', async () => {
      const p1 = await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });

      await setActiveProfile(storage, p1.id);

      const active = await getActiveProfile(storage);
      expect(active).toBe(p1.id);
    });

    it('switches between profiles', async () => {
      const p1 = await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });
      const p2 = await addProfile(storage, { name: 'Bob', nsec: 'nsec1bob' });

      await setActiveProfile(storage, p1.id);
      expect(await getActiveProfile(storage)).toBe(p1.id);

      await setActiveProfile(storage, p2.id);
      expect(await getActiveProfile(storage)).toBe(p2.id);
    });
  });

  describe('full lifecycle', () => {
    it('create → rename → switch → delete flow', async () => {
      // Create two profiles
      const alice = await addProfile(storage, { name: 'Alice', nsec: 'nsec1alice' });
      const bob = await addProfile(storage, { name: 'Bob', nsec: 'nsec1bob' });
      expect(await getProfiles(storage)).toHaveLength(2);

      // Set Alice as active
      await setActiveProfile(storage, alice.id);
      expect(await getActiveProfile(storage)).toBe(alice.id);

      // Rename Alice
      await renameProfile(storage, alice.id, 'Alice (Primary)');
      const profiles = await getProfiles(storage);
      expect(profiles[0].name).toBe('Alice (Primary)');

      // Switch to Bob
      await setActiveProfile(storage, bob.id);
      expect(await getActiveProfile(storage)).toBe(bob.id);

      // Delete Alice
      await deleteProfile(storage, alice.id);
      expect(await getProfiles(storage)).toHaveLength(1);
      expect((await getProfiles(storage))[0].name).toBe('Bob');

      // Active profile should still be Bob
      expect(await getActiveProfile(storage)).toBe(bob.id);
    });
  });
});
