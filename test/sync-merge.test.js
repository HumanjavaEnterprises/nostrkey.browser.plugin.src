/**
 * Sync merge: deletions and tombstones.
 *
 * These exercise the tombstone system:
 *   - `deletedDocs: { <path>: deletedAtSeconds }` and
 *     `deletedKeys: { <id>: deletedAtSeconds }` are top-level siblings of
 *     `vaultDocs` / `apiKeyVault` in storage.local, mirrored to storage.sync.
 *   - The STORE layer writes a tombstone on delete (vault-store.deleteDocumentLocal,
 *     api-key-store.deleteApiKey) and clears it on recreate (saveDocumentLocal /
 *     saveApiKey).
 *   - buildSyncPayload() emits tombstones (docs, keys AND profiles) as P0 (a
 *     guaranteed slot) and suppresses anything a tombstone has superseded
 *     (deletedAt >= updatedAt).
 *   - mergeIntoLocal() unions local+remote tombstones (PURE union, never pruned)
 *     and removes a merged doc/key/profile when `updatedAt <= deletedAt` (deletion
 *     wins ties, so a same-second delete is honoured; a strictly-newer recreate
 *     survives). All its writes go through the raw module-level storage handle —
 *     it never calls the store-layer helpers, so a merge never schedules a sync
 *     push (no loop).
 *   - pushToSync() pull-merges before building, so a device that never learned
 *     of a deletion absorbs the tombstone (and suppresses the stale doc) before
 *     its own orphan-cleanup runs.
 *
 * Tests drive the real public surface the same way the rest of the suite does:
 * seed the fake chrome.storage areas, call the real functions, assert on what
 * lands in the fake stores.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

const env = installFakeChrome();
const { local, sync } = env;

const { setUnlocked } = await import('../src/utilities/secret-vault.js');
const {
  scheduleSyncPush,
  setSyncEnabled,
  initSync,
  pullFromSync,
  mergeIntoLocal,
  getTombstoneCount,
  tombstoneWarningLevel,
} = await import('../src/utilities/sync-manager.js');
const { saveDocumentLocal, deleteDocumentLocal } =
  await import('../src/utilities/vault-store.js');
const { saveApiKey, deleteApiKey } =
  await import('../src/utilities/api-key-store.js');
const { deleteProfile, setPermission } = await import('../src/utilities/utils.js');

// Mirrors the internal (unexported) SYNC_META_KEY constant, sync-manager.js.
const SYNC_META_KEY = '_sync_meta';

// A fixed "now" for the fake clock (seconds*1000). Store-layer deletes stamp
// Math.floor(Date.now()/1000) = 3000, comfortably newer than the small
// updatedAt values the fixtures use (1000).
const NOW_SECONDS = 3000;

// buildSyncPayload() drops any vault-doc / api-key whose secret is not already
// ciphertext (T0-5). Anything that must survive a PUSH uses a ciphertext body.
const CIPHER = JSON.stringify({ v: 1, k: 'device', iv: 'AAAAAAAAAAAAAAAA', ciphertext: 'Zm9v' });
const bigCipher = (n) => JSON.stringify({ v: 1, k: 'device', iv: 'AAAAAAAAAAAAAAAA', ciphertext: 'A'.repeat(n) });

/** A vaultDocs entry, matching the real shape (vault-store.js). */
function doc(path, content, updatedAt, extra = {}) {
  return {
    path,
    content,
    updatedAt,
    syncStatus: 'synced',
    eventId: 'evt-' + path,
    relayCreatedAt: updatedAt,
    profileScope: null,
    ...extra,
  };
}

/** An apiKeyVault.keys entry, matching the real shape (api-key-store.js). */
function key(id, updatedAt, extra = {}) {
  return {
    id,
    label: 'label-' + id,
    secret: CIPHER,
    createdAt: updatedAt,
    updatedAt,
    profileScope: null,
    ...extra,
  };
}

/** A full apiKeyVault wrapper around a keys map. */
function vault(keys) {
  return { keys, syncEnabled: true, eventId: null, relayCreatedAt: null, syncStatus: 'synced' };
}

/** A profile, matching the real shape (utils.generateProfile). identity = pubKey. */
function prof(pubKey, updatedAt, extra = {}) {
  return {
    name: 'p-' + pubKey,
    privKey: '', // empty is allowed through the plaintext guard (non-secret)
    pubKey,
    hosts: {},
    relays: [],
    relayReminder: false,
    type: 'local',
    bunkerUrl: null,
    remotePubkey: null,
    updatedAt,
    ...extra,
  };
}

/** Parse the profiles array written to the storage.sync mirror. */
const mirrorProfiles = () => JSON.parse(sync._dump().profiles || '[]');

/**
 * Seed storage.sync with a realistic wire payload: a `_sync_meta` pointer plus
 * one JSON-string entry per key, exactly like pushToSync's single-chunk write.
 */
function seedSync(keyed) {
  const payload = { [SYNC_META_KEY]: JSON.stringify({ lastWrittenAt: Date.now(), keys: Object.keys(keyed) }) };
  for (const [k, v] of Object.entries(keyed)) payload[k] = JSON.stringify(v);
  sync._seed(payload);
}

/** Pull + merge via the real (now-exported) internals — no push scheduled. */
async function pullAndMerge() {
  const s = await pullFromSync();
  await mergeIntoLocal(s);
}

/** Drive a debounced push to completion (fake debounce + real storage writes). */
async function runPush() {
  await vi.advanceTimersByTimeAsync(2100);
  await env.flushWrites(10);
}

beforeEach(() => {
  local._reset();
  sync._reset();
  setUnlocked(null); // passwordless / never-locked default
  vi.useFakeTimers();
  vi.setSystemTime(NOW_SECONDS * 1000);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('sync-merge — vault-doc deletion tombstones (issue #3)', () => {
  // (1) delete-propagates
  it('removes a local doc when the remote tombstone is newer than the local copy', async () => {
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', 'old content', 1000) },
    });
    seedSync({ deletedDocs: { 'notes/a.md': 2000 } });

    await pullAndMerge();

    expect((local._dump().vaultDocs || {})['notes/a.md']).toBeUndefined();
    // Tombstone retained locally so it keeps propagating.
    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(2000);
  });

  // (2) no-resurrection-on-repush (the issue's literal complaint), with a REAL
  // deletion modelled via deleteDocumentLocal.
  it('a stale local copy on device B does not resurrect the doc into storage.sync on repush', async () => {
    await setSyncEnabled(true);

    // The mirror holds the doc from an earlier successful sync round.
    seedSync({ 'vaultDoc:notes/a.md': doc('notes/a.md', CIPHER, 1000) });

    // Device A: really deletes the doc (writes a tombstone) and pushes.
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', CIPHER, 1000) },
    });
    await deleteDocumentLocal('notes/a.md');
    await env.flushWrites(4);
    await runPush();
    // A's delete propagated: the mirror no longer carries the doc, but does
    // carry the tombstone.
    expect(Object.keys(sync._dump())).not.toContain('vaultDoc:notes/a.md');
    expect(Object.keys(sync._dump())).toContain('deletedDocs');

    // Device B: separate local state, never pulled A's deletion — still has
    // the pre-delete doc in its own storage.local.vaultDocs.
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', CIPHER, 1000) },
    });
    scheduleSyncPush(); // B's own debounced push, unrelated to A's delete
    await runPush();

    // The doc must not be back in the mirror B just wrote to; B must also have
    // absorbed the tombstone and dropped its own stale copy.
    expect(Object.keys(sync._dump())).not.toContain('vaultDoc:notes/a.md');
    expect((local._dump().vaultDocs || {})['notes/a.md']).toBeUndefined();
  });

  // (3) recreate-after-delete wins
  it('keeps a local doc newer than an incoming tombstone', async () => {
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', 'recreated content', 5000) },
    });
    seedSync({ deletedDocs: { 'notes/a.md': 1000 } });

    await pullAndMerge();

    expect((local._dump().vaultDocs || {})['notes/a.md']?.content).toBe('recreated content');
    // The merge never prunes tombstones — the stale one is retained. It is
    // harmless: 1000 < the doc's 5000, so it does not suppress the doc.
    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(1000);
  });

  // (4) older-remote-tombstone ignored (both doc + stale tombstone in one pull)
  it('a newer remote doc wins over an older remote tombstone in the same pull', async () => {
    local._seed({ platformSyncEnabled: true, vaultDocs: {} });
    seedSync({
      'vaultDoc:notes/a.md': doc('notes/a.md', 'remote recreated content', 5000),
      deletedDocs: { 'notes/a.md': 1000 },
    });

    await pullAndMerge();

    expect((local._dump().vaultDocs || {})['notes/a.md']?.content).toBe('remote recreated content');
  });
});

describe('sync-merge — API-key deletion tombstones (issue #3)', () => {
  // (5) delete-propagates (key)
  it('removes a local API key when the remote tombstone is newer', async () => {
    local._seed({ platformSyncEnabled: true, apiKeyVault: vault({ k1: key('k1', 1000) }) });
    seedSync({ deletedKeys: { k1: 2000 } });

    await pullAndMerge();

    expect((local._dump().apiKeyVault.keys || {}).k1).toBeUndefined();
    expect((local._dump().deletedKeys || {}).k1).toBe(2000);
  });

  // (6) whole-object-overwrite resurrection blocked: a stale device re-pushed
  // the entire apiKeyVault (carrying k1) but a newer tombstone must win.
  it('blocks a whole-object apiKeyVault overwrite that would resurrect a deleted key', async () => {
    local._seed({ platformSyncEnabled: true });
    seedSync({
      apiKeyVault: vault({ k1: key('k1', 1000) }),
      deletedKeys: { k1: 2000 },
    });

    await pullAndMerge();

    expect((local._dump().apiKeyVault.keys || {}).k1).toBeUndefined();
  });

  // (7) recreate wins (key)
  it('keeps a local API key newer than an incoming tombstone', async () => {
    local._seed({ platformSyncEnabled: true, apiKeyVault: vault({ k1: key('k1', 5000) }) });
    seedSync({ deletedKeys: { k1: 1000 } });

    await pullAndMerge();

    expect((local._dump().apiKeyVault.keys || {}).k1?.updatedAt).toBe(5000);
    // Tombstone retained (the merge never prunes); harmless since 1000 < 5000.
    expect((local._dump().deletedKeys || {}).k1).toBe(1000);
  });

  // (8) older-tombstone ignored (key, remote side of the merge)
  it('a newer remote key wins over an older remote tombstone in the same pull', async () => {
    local._seed({ platformSyncEnabled: true });
    seedSync({
      apiKeyVault: vault({ k1: key('k1', 5000) }),
      deletedKeys: { k1: 1000 },
    });

    await pullAndMerge();

    expect((local._dump().apiKeyVault.keys || {}).k1?.updatedAt).toBe(5000);
  });
});

describe('sync-merge — quota / budget', () => {
  // (9) tombstones survive P4 budget exhaustion (they own the P0 slot)
  it('emits the tombstone (P0) even when vault docs exhaust the byte budget', async () => {
    await setSyncEnabled(true);
    const docs = {};
    // 20 x ~6KB ciphertext docs = ~120KB > the 100KB SYNC_QUOTA.
    for (let i = 0; i < 20; i++) {
      docs[`notes/${i}.md`] = doc(`notes/${i}.md`, bigCipher(6000), 1000 + i);
    }
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: docs,
      deletedDocs: { 'notes/deleted.md': 2500 },
    });

    scheduleSyncPush();
    await runPush();

    const mirror = Object.keys(sync._dump());
    // The P0 tombstone made it despite the P4 flood.
    expect(mirror).toContain('deletedDocs');
    // Budget was actually exhausted — not every doc got a slot.
    const vaultKeys = mirror.filter(k => k.startsWith('vaultDoc:'));
    expect(vaultKeys.length).toBeLessThan(20);
  });
});

describe('sync-merge — produce side (real store-layer writes)', () => {
  // (10) real deleteDocumentLocal writes a tombstone + mirror drops the doc
  it('deleteDocumentLocal records a tombstone and the push drops the mirror doc', async () => {
    await setSyncEnabled(true);
    seedSync({ 'vaultDoc:notes/a.md': doc('notes/a.md', CIPHER, 1000) });
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', CIPHER, 1000) },
    });

    await deleteDocumentLocal('notes/a.md');
    await env.flushWrites(4);

    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(NOW_SECONDS);

    await runPush();

    expect(Object.keys(sync._dump())).not.toContain('vaultDoc:notes/a.md');
    expect(Object.keys(sync._dump())).toContain('deletedDocs');
  });

  // (11) real deleteApiKey writes a tombstone + mirror drops the key
  it('deleteApiKey records a tombstone and the push drops the mirror key', async () => {
    await setSyncEnabled(true);
    local._seed({ platformSyncEnabled: true, apiKeyVault: vault({ k1: key('k1', 1000) }) });
    seedSync({ apiKeyVault: vault({ k1: key('k1', 1000) }) });

    await deleteApiKey('k1');
    await env.flushWrites(4);

    expect((local._dump().deletedKeys || {}).k1).toBe(NOW_SECONDS);

    await runPush();

    expect(Object.keys(sync._dump())).toContain('deletedKeys');
    const mirroredVault = JSON.parse(sync._dump().apiKeyVault);
    expect((mirroredVault.keys || {}).k1).toBeUndefined();
  });

  // (12) recreate clears the tombstone (doc + key)
  it('recreating a deleted doc/key clears its tombstone', async () => {
    await setSyncEnabled(true);
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', CIPHER, 1000) },
      apiKeyVault: vault({ k1: key('k1', 1000) }),
    });

    await deleteDocumentLocal('notes/a.md');
    await deleteApiKey('k1');
    await env.flushWrites(4);
    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(NOW_SECONDS);
    expect((local._dump().deletedKeys || {}).k1).toBe(NOW_SECONDS);

    await saveDocumentLocal('notes/a.md', 'reborn', 'local-only');
    await saveApiKey('k1', 'label-k1', 'new-secret');
    await env.flushWrites(4);

    expect((local._dump().deletedDocs || {})['notes/a.md']).toBeUndefined();
    expect((local._dump().deletedKeys || {}).k1).toBeUndefined();
  });

  // (checker repro) A doc saved and then deleted within the SAME wall-clock
  // second must not resurrect on the deleting device's own pull-merge-before-
  // push, against a mirror that still holds the doc. RED under the old strict
  // `<` + prune; GREEN with `<=` + retain.
  it('a doc deleted in the same second it was saved does not resurrect on repush', async () => {
    await setSyncEnabled(true);
    // Mirror still holds the doc from an earlier sync at this same second.
    seedSync({ 'vaultDoc:notes/a.md': doc('notes/a.md', CIPHER, NOW_SECONDS) });

    await saveDocumentLocal('notes/a.md', 'v1', 'synced'); // updatedAt = NOW_SECONDS
    await deleteDocumentLocal('notes/a.md');               // deletedAt = NOW_SECONDS (same second)
    await env.flushWrites(4);
    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(NOW_SECONDS);

    await runPush(); // pull-merge-before-build sees the mirror's stale doc

    expect((local._dump().vaultDocs || {})['notes/a.md']).toBeUndefined();
    expect(Object.keys(sync._dump())).not.toContain('vaultDoc:notes/a.md');
    // The protective tombstone survives.
    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(NOW_SECONDS);
  });

  // (checker repro) Same, for an API key deleted the same second it was saved.
  it('an API key deleted in the same second it was saved does not resurrect on repush', async () => {
    await setSyncEnabled(true);
    seedSync({ apiKeyVault: vault({ k1: key('k1', NOW_SECONDS) }) });

    await saveApiKey('k1', 'label-k1', 's1'); // updatedAt = NOW_SECONDS
    await deleteApiKey('k1');                  // deletedAt = NOW_SECONDS (same second)
    await env.flushWrites(4);
    expect((local._dump().deletedKeys || {}).k1).toBe(NOW_SECONDS);

    await runPush();

    expect((local._dump().apiKeyVault.keys || {}).k1).toBeUndefined();
    const mirroredVault = JSON.parse(sync._dump().apiKeyVault);
    expect((mirroredVault.keys || {}).k1).toBeUndefined();
    expect((local._dump().deletedKeys || {}).k1).toBe(NOW_SECONDS);
  });
});

describe('sync-merge — profile deletion tombstones (issue #3)', () => {
  // profile delete-propagates: a profile still in the payload but carrying a
  // newer tombstone is removed and does not resurrect.
  it('removes a profile the payload still lists when a newer tombstone exists', async () => {
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 0,
      profiles: [prof('pk_keep', 1000)],
    });
    seedSync({
      profiles: [prof('pk_keep', 1000), prof('pk_del', 1000)],
      deletedProfiles: { pk_del: 2000 },
    });

    await pullAndMerge();

    const ids = (local._dump().profiles || []).map(p => p.pubKey);
    expect(ids).toContain('pk_keep');
    expect(ids).not.toContain('pk_del');
    expect((local._dump().deletedProfiles || {}).pk_del).toBe(2000);
  });

  // THE reproduced blocker: local [Keep], mirror [Keep, Deleted]. The deleting
  // device's own debounced pushToSync (pull-merge-before-build) must NOT re-add
  // the deleted profile locally, and must NOT re-emit it to the mirror.
  it('a profile deleted locally does not resurrect via pull-merge-before-push', async () => {
    await setSyncEnabled(true);
    // Mirror still holds BOTH profiles from an earlier sync round.
    seedSync({ profiles: [prof('pk_keep', 1000), prof('pk_del', 1000)] });
    // Local holds both; delete the second via the REAL deleteProfile (writes
    // the tombstone + adjusts profileIndex + schedules a push).
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 0,
      profiles: [prof('pk_keep', 1000), prof('pk_del', 1000)],
    });

    await deleteProfile(1);
    await env.flushWrites(4);
    expect((local._dump().profiles || []).map(p => p.pubKey)).toEqual(['pk_keep']);
    expect((local._dump().deletedProfiles || {}).pk_del).toBe(NOW_SECONDS);

    await runPush(); // pull-merge sees the mirror's stale [Keep, Deleted]

    expect((local._dump().profiles || []).map(p => p.pubKey)).not.toContain('pk_del');
    expect(mirrorProfiles().map(p => p.pubKey)).not.toContain('pk_del');
    expect(mirrorProfiles().map(p => p.pubKey)).toContain('pk_keep');
    expect(Object.keys(sync._dump())).toContain('deletedProfiles');
  });

  // recreate-after-delete wins: a profile whose updatedAt postdates the
  // tombstone survives.
  it('keeps a profile newer than an incoming tombstone (recreate wins)', async () => {
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 0,
      profiles: [prof('pk_x', 5000)],
    });
    seedSync({ deletedProfiles: { pk_x: 1000 } });

    await pullAndMerge();

    expect((local._dump().profiles || []).map(p => p.pubKey)).toContain('pk_x');
  });

  // older-tombstone ignored on the remote side of the merge.
  it('a newer remote profile wins over an older remote tombstone in the same pull', async () => {
    local._seed({ platformSyncEnabled: true, profileIndex: 0, profiles: [] });
    seedSync({
      profiles: [prof('pk_x', 5000)],
      deletedProfiles: { pk_x: 1000 },
    });

    await pullAndMerge();

    expect((local._dump().profiles || []).map(p => p.pubKey)).toContain('pk_x');
  });

  // The active index FOLLOWS the active identity: removing a profile ordered
  // BEFORE the active one shifts the index so the same identity stays active.
  it('a site grant written after a deletion elsewhere does not keep the deleted profile', async () => {
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 1,
      profiles: [prof('pk_a', 1000), prof('pk_b', 1000)],
    });
    // Grant at "now" (3000), newer than the deletion (2000). Grants do not sync,
    // so they must not move updatedAt past the deletion.
    await setPermission('pk_a', 'https://site.example', 'signEvent:1', 'allow');
    expect(local._dump().profiles[0].updatedAt).toBe(1000);
    seedSync({ deletedProfiles: { pk_a: 2000 } });

    await pullAndMerge();

    expect((local._dump().profiles || []).map(p => p.pubKey)).toEqual(['pk_b']);
  });

  it('keeps profileIndex on the active identity when a profile before it is removed', async () => {
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 1, // pointing at B
      profiles: [prof('pk_a', 1000), prof('pk_b', 1000), prof('pk_c', 1000)],
    });
    seedSync({ deletedProfiles: { pk_a: 2000 } }); // remove A (before the active B)

    await pullAndMerge();

    const after = local._dump();
    expect((after.profiles || []).map(p => p.pubKey)).toEqual(['pk_b', 'pk_c']);
    // B was index 1, is now index 0 — the index followed it, it did NOT stay on 1 (C).
    expect(after.profileIndex).toBe(0);
    expect(after.profiles[after.profileIndex].pubKey).toBe('pk_b');
  });

  // When the ACTIVE identity itself is tombstoned, the index falls back to a
  // valid in-range profile (never out of range, never a wrong-key signature —
  // the B1 guard covers the latter).
  it('falls back to a valid in-range profileIndex when the active identity is removed', async () => {
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 2, // pointing at C
      profiles: [prof('pk_a', 1000), prof('pk_b', 1000), prof('pk_c', 1000)],
    });
    seedSync({ deletedProfiles: { pk_c: 2000 } }); // remove the ACTIVE profile

    await pullAndMerge();

    const after = local._dump();
    const ids = (after.profiles || []).map(p => p.pubKey);
    expect(ids).toEqual(['pk_a', 'pk_b']);
    // Active identity gone → fallback clamp lands in range.
    expect(after.profileIndex).toBeGreaterThanOrEqual(0);
    expect(after.profileIndex).toBeLessThan(ids.length);
    expect(after.profiles[after.profileIndex]).toBeDefined();
  });

  // Local deleteProfile keeps the active identity when deleting a profile
  // ordered before the active one (index shifts down with it).
  it('local deleteProfile keeps the active identity when deleting a profile before it', async () => {
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 1, // active = B
      profiles: [prof('pk_a', 1000), prof('pk_b', 1000), prof('pk_c', 1000)],
    });

    await deleteProfile(0); // remove A (before active B)
    await env.flushWrites(4);

    const after = local._dump();
    expect((after.profiles || []).map(p => p.pubKey)).toEqual(['pk_b', 'pk_c']);
    expect(after.profiles[after.profileIndex].pubKey).toBe('pk_b');
  });
});

describe('sync-merge — conditions & warnings', () => {
  // (13) tie-break — deletion wins ties (`<=`), tombstone retained
  it('removes a doc whose updatedAt equals the tombstone (deletion wins ties)', async () => {
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', 'same-second copy', 1000) },
    });
    seedSync({ deletedDocs: { 'notes/a.md': 1000 } });

    await pullAndMerge();

    // Equal timestamps: the delete wins (consistent with the emit-side `>=`
    // suppression), so the copy is removed and its protective tombstone is
    // RETAINED — never pruned by the merge.
    expect((local._dump().vaultDocs || {})['notes/a.md']).toBeUndefined();
    expect((local._dump().deletedDocs || {})['notes/a.md']).toBe(1000);
  });

  // (14) mergeIntoLocal does NOT schedule a sync push (loop invariant)
  it('a merge that removes a doc does not schedule a sync push', async () => {
    // Note: no setSyncEnabled() here — that would itself schedule a push. We
    // drive the merge directly and prove nothing writes to storage.sync.
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', 'old', 1000) },
    });
    seedSync({ deletedDocs: { 'notes/a.md': 2000 } });

    const setSpy = vi.spyOn(sync, 'set');
    await pullAndMerge();

    // The merge did its job...
    expect((local._dump().vaultDocs || {})['notes/a.md']).toBeUndefined();

    // ...and scheduled nothing: no push fires even after the debounce window.
    await vi.advanceTimersByTimeAsync(3000);
    await env.flushWrites(10);
    expect(setSpy).not.toHaveBeenCalled();
  });

  // (15) warning level 0/1/2 at counts 7/8/16
  it('reports the right retention-warning level for the tombstone count', async () => {
    expect(tombstoneWarningLevel(7)).toBe(0);
    expect(tombstoneWarningLevel(8)).toBe(1);
    expect(tombstoneWarningLevel(15)).toBe(1);
    expect(tombstoneWarningLevel(16)).toBe(2);

    // getTombstoneCount sums docs + keys.
    const deletedDocs = {};
    for (let i = 0; i < 5; i++) deletedDocs[`notes/${i}.md`] = 1000 + i;
    const deletedKeys = { k1: 1000, k2: 1001, k3: 1002 };
    local._seed({ platformSyncEnabled: true, deletedDocs, deletedKeys });

    const count = await getTombstoneCount();
    expect(count).toBe(8);
    expect(tombstoneWarningLevel(count)).toBe(1);
  });
});

describe('sync-merge — behavioral scenarios (smoketest-derived)', () => {
  // (a) QUOTA UNDER LOAD: a vault big enough to trip the P4 byte budget, plus
  // tombstones (docs + keys + a profile) and a live profile. A deletion (P0) or
  // an identity (P1) is never lost to vault size — only bulky P4 docs get dropped.
  it('(a) quota under load: P4 docs are dropped but all P0 tombstones and P1 profiles survive', async () => {
    await setSyncEnabled(true);
    const docs = {};
    for (let i = 0; i < 20; i++) docs[`notes/${i}.md`] = doc(`notes/${i}.md`, bigCipher(6000), 1000 + i);
    local._seed({
      platformSyncEnabled: true,
      profileIndex: 0,
      profiles: [prof('pk_live', 1000)],
      vaultDocs: docs,
      apiKeyVault: vault({ k_live: key('k_live', 1000) }),
      deletedDocs: { 'notes/gone.md': 2500 },
      deletedKeys: { k_gone: 2500 },
      deletedProfiles: { pk_gone: 2500 },
    });

    scheduleSyncPush();
    await runPush();

    const mirror = Object.keys(sync._dump());
    // All three P0 tombstone maps survived the P4 flood.
    expect(mirror).toContain('deletedDocs');
    expect(mirror).toContain('deletedKeys');
    expect(mirror).toContain('deletedProfiles');
    // P1 profiles survived too, with the live identity intact.
    expect(mirror).toContain('profiles');
    expect(mirrorProfiles().map(p => p.pubKey)).toContain('pk_live');
    // The P4 vault was genuinely over budget — not every doc got a slot.
    expect(mirror.filter(k => k.startsWith('vaultDoc:')).length).toBeLessThan(20);
  });

  // (b) MULTI-ROUND INTERLEAVED CHURN: two devices sharing one storage.sync
  // mirror, several interleaved delete/recreate rounds across docs AND keys AND
  // a profile, then extra settle rounds. Both devices must converge to identical
  // live sets, recreated items alive everywhere, deleted items dead everywhere,
  // and tombstones a superset union. No resurrection.
  it('(b) multi-round interleaved churn across docs, keys and a profile converges with no resurrection', async () => {
    const seed = () => ({
      platformSyncEnabled: true,
      profileIndex: 0,
      profiles: [prof('pk1', 1000), prof('pk2', 1000)],
      vaultDocs: {
        'd1.md': doc('d1.md', CIPHER, 1000),
        'd2.md': doc('d2.md', CIPHER, 1000),
      },
      apiKeyVault: vault({ k1: key('k1', 1000), k2: key('k2', 1000) }),
    });
    let A = seed();
    let B = seed();

    // A device "turn": load its snapshot, optionally mutate, run the real
    // debounced push (pull-merge-before-build + emit), return the new snapshot.
    const turn = async (state, editFn) => {
      local._seed(state);
      if (editFn) await editFn();
      await env.flushWrites(4);
      scheduleSyncPush();
      await runPush();
      return local._dump();
    };

    // Round 0 — establish the shared baseline in the mirror.
    A = await turn(A);
    B = await turn(B);
    A = await turn(A);

    // Round 1 — A deletes d1 and k1, syncs; B pulls the deletions.
    vi.setSystemTime(4000 * 1000);
    A = await turn(A, async () => {
      await deleteDocumentLocal('d1.md');
      await deleteApiKey('k1');
    });
    B = await turn(B);

    // Round 2 — B recreates d1 (strictly newer), syncs; A pulls the recreate.
    vi.setSystemTime(6000 * 1000);
    B = await turn(B, async () => {
      await saveDocumentLocal('d1.md', 'reborn', 'local-only');
    });
    A = await turn(A);

    // Round 3 — A deletes profile pk2, syncs; B pulls.
    vi.setSystemTime(8000 * 1000);
    A = await turn(A, async () => {
      const idx = A.profiles.findIndex(p => p.pubKey === 'pk2');
      await deleteProfile(idx);
    });
    B = await turn(B);

    // Settle — a few extra bidirectional rounds.
    A = await turn(A); B = await turn(B); A = await turn(A); B = await turn(B);

    const liveDocs = (s) => Object.keys(s.vaultDocs || {}).sort();
    const liveKeys = (s) => Object.keys((s.apiKeyVault || {}).keys || {}).sort();
    const liveProfiles = (s) => (s.profiles || []).map(p => p.pubKey).sort();
    const tomb = (s, k) => Object.keys(s[k] || {}).sort();

    // Converge to identical LIVE sets.
    expect(liveDocs(A)).toEqual(liveDocs(B));
    expect(liveKeys(A)).toEqual(liveKeys(B));
    expect(liveProfiles(A)).toEqual(liveProfiles(B));

    // Recreated item alive everywhere; genuinely-deleted items dead everywhere.
    expect(liveDocs(A)).toEqual(['d1.md', 'd2.md']); // d1 recreated, d2 untouched
    expect(liveKeys(A)).toEqual(['k2']);              // k1 deleted, never recreated
    expect(liveProfiles(A)).toEqual(['pk1']);         // pk2 deleted

    // Tombstones: identical superset union of every deletion on both devices.
    expect(tomb(A, 'deletedDocs')).toEqual(tomb(B, 'deletedDocs'));
    expect(tomb(A, 'deletedKeys')).toEqual(tomb(B, 'deletedKeys'));
    expect(tomb(A, 'deletedProfiles')).toEqual(tomb(B, 'deletedProfiles'));
    expect(tomb(A, 'deletedDocs')).toContain('d1.md');
    expect(tomb(A, 'deletedKeys')).toContain('k1');
    expect(tomb(A, 'deletedProfiles')).toContain('pk2');
  });
});

describe('a merge that moves profiles, outside the background', () => {
  const REMOVED = 'ab'.repeat(32);
  const KEPT = 'cd'.repeat(32);

  it('moves stored sessions and tells the background', async () => {
    const sent = [];
    env.setSendMessage(async (message) => { sent.push(message); });
    local._seed({
      profiles: [
        { name: 'Gone', type: 'bunker', remotePubkey: REMOVED, updatedAt: 1, hosts: {} },
        { name: 'Kept', type: 'bunker', remotePubkey: KEPT, updatedAt: 9999, hosts: {} },
      ],
      profileIndex: 1,
      bunkerSessions: { 0: { sessionPubkey: 'a' }, 1: { sessionPubkey: 'b' } },
    });
    await mergeIntoLocal({ profiles: [], deletedProfiles: { [REMOVED]: 2000 } });
    await env.flushWrites();
    expect(local._dump().bunkerSessions).toEqual({ 0: { sessionPubkey: 'b' } });
    expect(sent.filter(m => m.kind === 'profilesMoved')).toEqual([
      { kind: 'profilesMoved', payload: [[0, null], [1, 0]] },
    ]);
  });
});
