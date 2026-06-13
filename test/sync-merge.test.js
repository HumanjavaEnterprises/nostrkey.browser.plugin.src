/**
 * Sync merge regression tests
 *
 * Locks in fixes for three storage.sync data-loss bugs:
 *   1. Bunker wipe   — a bunker profile (privKey:'' but a real identity) was
 *                      mistaken for a blank fresh-install profile and wiped.
 *   2. Index clobber — profiles were merged by array index, so reordering or a
 *                      partial sync could overwrite one identity's key material
 *                      with another's.
 *   3. Lockout       — synced isEncrypted=true (with no synced verifier) flipped
 *                      a second device into a permanently locked state.
 *
 * These exercise the REAL merge logic via computeMergeUpdates(), not a
 * reimplementation. sync-manager imports browser-polyfill, which throws unless
 * an extension API namespace exists — so we install a minimal chrome stub
 * before dynamically importing the module.
 */

import { describe, it, expect } from 'vitest';

globalThis.chrome = {
  runtime: { onMessage: { addListener() {} } },
  storage: {
    local: { get() {}, set() {} },
    sync: { get() {}, set() {} },
    onChanged: { addListener() {} },
  },
};

const { computeMergeUpdates, compareSemver } = await import('../src/utilities/sync-manager.js');

describe('sync merge — computeMergeUpdates', () => {
  describe('bug 1: bunker profile must not be treated as a blank fresh install', () => {
    it('keeps a bunker-only local install and merges (does not wipe) incoming profiles', () => {
      const local = {
        profiles: [
          // Real remote-signer identity: no privKey, but a bunker URL + pubkey.
          { name: 'Bunker', privKey: '', pubKey: 'pubBunker', bunkerUrl: 'bunker://relay?pubkey=pubBunker', updatedAt: 100 },
        ],
      };
      const syncData = {
        profiles: [
          { name: 'Alice', privKey: 'encA', pubKey: 'pubAlice', updatedAt: 100 },
        ],
      };

      const { updates, changed } = computeMergeUpdates(local, syncData);

      expect(changed).toBe(true);
      // The bunker identity survives, and the synced profile is appended.
      const byPub = Object.fromEntries(updates.profiles.map(p => [p.pubKey, p]));
      expect(byPub.pubBunker).toBeDefined();
      expect(byPub.pubBunker.bunkerUrl).toBe('bunker://relay?pubkey=pubBunker');
      expect(byPub.pubAlice).toBeDefined();
      expect(updates.profiles).toHaveLength(2);
    });

    it('a type:bunker profile also counts as a real identity', () => {
      const local = { profiles: [{ name: 'B', privKey: '', pubKey: 'pb', type: 'bunker' }] };
      const syncData = { profiles: [{ name: 'New', privKey: 'k', pubKey: 'pn' }] };

      const { updates } = computeMergeUpdates(local, syncData);
      // Not a wholesale adopt — bunker is preserved alongside the new one.
      expect(updates.profiles).toHaveLength(2);
    });
  });

  describe('bug 2: profiles merge by pubkey, never by array index', () => {
    it('an out-of-order partial sync updates the matching identity, not position 0', () => {
      const local = {
        profiles: [
          { name: 'A', privKey: 'KA', pubKey: 'pa', updatedAt: 100 },
          { name: 'B', privKey: 'KB', pubKey: 'pb', updatedAt: 100 },
        ],
      };
      // Sync carries only B, newer. Old index-based code matched syncData[0] to
      // merged[0]=A and overwrote A's key material with B's.
      const syncData = {
        profiles: [
          { name: 'B', privKey: 'KB2', pubKey: 'pb', updatedAt: 200 },
        ],
      };

      const { updates } = computeMergeUpdates(local, syncData);

      const byPub = Object.fromEntries(updates.profiles.map(p => [p.pubKey, p]));
      // A is completely untouched.
      expect(byPub.pa.privKey).toBe('KA');
      expect(byPub.pa.name).toBe('A');
      // B is updated to the newer key.
      expect(byPub.pb.privKey).toBe('KB2');
    });

    it('older sync profile never downgrades a newer local one', () => {
      const local = { profiles: [{ name: 'A', privKey: 'KA2', pubKey: 'pa', updatedAt: 200 }] };
      const syncData = { profiles: [{ name: 'A', privKey: 'KA1', pubKey: 'pa', updatedAt: 100 }] };

      const { updates, changed } = computeMergeUpdates(local, syncData);
      // Nothing newer arrived → no profile change.
      expect(changed).toBe(false);
      expect(updates.profiles).toBeUndefined();
    });

    it('preserves local per-site hosts when accepting a newer synced profile', () => {
      const local = { profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa', updatedAt: 100, hosts: { 'example.com': { allow: true } } }] };
      const syncData = { profiles: [{ name: 'A', privKey: 'KA2', pubKey: 'pa', updatedAt: 200 }] };

      const { updates } = computeMergeUpdates(local, syncData);
      expect(updates.profiles[0].privKey).toBe('KA2');
      expect(updates.profiles[0].hosts).toEqual({ 'example.com': { allow: true } });
    });

    it('a synced profile with no pubkey is appended, never matched onto an existing one', () => {
      const local = { profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa', updatedAt: 100 }] };
      const syncData = { profiles: [{ name: 'Mystery', privKey: 'KX', updatedAt: 999 }] }; // no pubKey

      const { updates } = computeMergeUpdates(local, syncData);
      expect(updates.profiles).toHaveLength(2);
      const a = updates.profiles.find(p => p.pubKey === 'pa');
      expect(a.privKey).toBe('KA'); // untouched
    });
  });

  describe('version compare is numeric, not lexicographic', () => {
    it('treats double-digit minors correctly (1.10.0 > 1.9.0)', () => {
      expect(compareSemver('1.10.0', '1.9.0')).toBe(1);
      expect(compareSemver('1.9.0', '1.10.0')).toBe(-1);
    });

    it('equal versions and missing components', () => {
      expect(compareSemver('1.6.2', '1.6.2')).toBe(0);
      expect(compareSemver('1.6', '1.6.0')).toBe(0);
      expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    });

    it('a newer synced version is accepted, an equal/older one is not', () => {
      const base = { profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa' }], version: '1.9.0' };
      // Newer → adopted.
      let r = computeMergeUpdates(base, { version: '1.10.0' });
      expect(r.updates.version).toBe('1.10.0');
      // Older → rejected (the lexicographic bug would have accepted it).
      r = computeMergeUpdates(base, { version: '1.8.0' });
      expect('version' in r.updates).toBe(false);
      // Equal → rejected.
      r = computeMergeUpdates(base, { version: '1.9.0' });
      expect('version' in r.updates).toBe(false);
    });
  });

  describe('bug 3: encryption state is device-local and never merged from sync', () => {
    it('does not adopt a synced isEncrypted=true (would cause permanent lockout)', () => {
      const local = { profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa' }], isEncrypted: false };
      const syncData = { isEncrypted: true, profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa' }] };

      const { updates } = computeMergeUpdates(local, syncData);
      expect('isEncrypted' in updates).toBe(false);
    });
  });

  describe('fresh install still adopts sync wholesale (no over-correction)', () => {
    it('an empty local profile list adopts incoming profiles and index', () => {
      const local = { profiles: [] };
      const syncData = {
        profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa' }],
        profileIndex: { current: 'pa' },
      };

      const { updates, changed } = computeMergeUpdates(local, syncData);
      expect(changed).toBe(true);
      expect(updates.profiles).toEqual(syncData.profiles);
      expect(updates.profileIndex).toEqual({ current: 'pa' });
    });

    it('a single blank placeholder profile (no key, no pubkey) counts as fresh', () => {
      const local = { profiles: [{ name: 'default', privKey: '' }] };
      const syncData = { profiles: [{ name: 'A', privKey: 'KA', pubKey: 'pa' }] };

      const { updates } = computeMergeUpdates(local, syncData);
      expect(updates.profiles).toEqual(syncData.profiles);
    });
  });
});
