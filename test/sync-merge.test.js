/**
 * Sync merge — deletion / tombstone regression tests (GitHub issue #3).
 *
 * DROP-IN target: test/sync-merge.test.js
 *
 * Ground truth (read 2026-09, v1.8.3, src/utilities/sync-manager.js):
 *   - `computeMergeUpdates()` and `setSyncRespectingQuota()` (names used in the
 *     issue) do not exist anywhere in this repo. The real functions are
 *     `mergeIntoLocal()` (sync-manager.js:310) and `pushToSync()`
 *     (sync-manager.js:187) — both MODULE-PRIVATE (not exported). Only
 *     `scheduleSyncPush`, `isSyncEnabled`, `setSyncEnabled`, `initSync` are
 *     exported (sync-manager.js:445,458,463,478). So these tests drive merge
 *     behaviour the same way every other suite in this repo does: seed the
 *     fake `chrome.storage.local` / `chrome.storage.sync` areas directly, call
 *     the real public surface, and assert on what lands in the fake stores.
 *   - There is still NO tombstone / deletion-merge concept anywhere in src:
 *     `grep -rn "tombstone\|deletedAt\|deletedDocs\|deletedKeys" src/` is empty.
 *   - `mergeIntoLocal()`'s vault-doc loop (sync-manager.js:412-429) only ever
 *     ADDS or overwrites `vaultDocs[path]` when `syncData['vaultDoc:'+path]`
 *     is newer than the local copy. It never removes a local doc that is
 *     simply ABSENT from the incoming sync payload — there is no code path
 *     that deletes anything out of `local.vaultDocs`.
 *   - `buildSyncPayload()` (sync-manager.js:166-178) unconditionally re-emits
 *     every doc currently in `local.vaultDocs`. A device that still has a
 *     stale local copy of a doc deleted elsewhere will push it right back
 *     into the storage.sync mirror on its next debounced push — this is the
 *     literal resurrection the issue describes, and test (b) below
 *     reproduces it with ZERO invented schema.
 *   - `deleteDocumentLocal()` (src/utilities/vault-store.js:99) is the local
 *     side of deletion. It does exactly `delete docs[path]; setDocs(docs)` —
 *     i.e. `storage.local.set({vaultDocs})` + `scheduleSyncPush()`. It writes
 *     no tombstone anywhere. The NIP-09 relay deletion (`vault.delete` /
 *     `apikeys.delete`, src/background.js:1670 / 1805) only publishes a
 *     kind-5 deletion event to relays — it never touches storage.sync and
 *     never calls `deleteDocumentLocal`; that call is made separately by the
 *     UI (src/vault/vault.js:238) after the message round-trip. Confirms the
 *     relay-deletion path and the sync-mirror path are fully disconnected
 *     today, exactly as the issue describes.
 *
 * Tests (a) and (b) FAIL against current code — they are RED until an Option
 * A/C tombstone mechanism lands. Tests (c) and (d) already PASS today: an
 * unrecognised `deletedDocs` key in the sync payload is silently ignored by
 * `mergeIntoLocal()`, so a normal recency-wins doc merge just does the right
 * thing by coincidence. They stay in the suite as forward-compatibility
 * guards — the obvious first tombstone implementation ("delete locally
 * whenever ANY tombstone matches the path, ignore recency") would break them
 * immediately, and that is the bug this suite exists to catch.
 *
 * `deletedDocs` (a plain `{ path: deletedAtSeconds }` map, mirroring the
 * `updatedAt` convention already used by `vaultDocs`/`apiKeyVault.keys`) is
 * NOT existing code — it is the proposed Option A/C tombstone shape assumed
 * by tests (a), (c), (d) so they exercise a concrete target API instead of a
 * vague one. Whoever implements the fix should treat the key name as a
 * starting proposal, not a contract.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

const env = installFakeChrome();
const { local, sync } = env;

const { setUnlocked } = await import('../src/utilities/secret-vault.js');
const { scheduleSyncPush, setSyncEnabled, initSync } =
  await import('../src/utilities/sync-manager.js');

// Mirrors the internal (unexported) SYNC_META_KEY constant, sync-manager.js:22.
const SYNC_META_KEY = '_sync_meta';

// buildSyncPayload() (sync-manager.js:111,170-173) drops any vault-doc whose
// `content` is not already ciphertext (T0-5: never let plaintext leave the
// device). Tests that need a doc to actually survive a PUSH must use a
// ciphertext-shaped body, same fixture as test/storage-at-rest.test.js.
const CIPHER = JSON.stringify({ v: 1, k: 'device', iv: 'AAAAAAAAAAAAAAAA', ciphertext: 'Zm9v' });

/** A vaultDocs entry, matching the real shape (vault-store.js:83-91). */
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

/**
 * Seed storage.sync with a realistic wire payload: a `_sync_meta` pointer
 * plus one JSON-string entry per key, exactly like pushToSync's chunkValue()
 * would have written for a single-chunk (<=8KB) item (sync-manager.js:58-60).
 */
function seedSync(keyed) {
  const payload = { [SYNC_META_KEY]: JSON.stringify({ lastWrittenAt: Date.now(), keys: Object.keys(keyed) }) };
  for (const [k, v] of Object.entries(keyed)) payload[k] = JSON.stringify(v);
  sync._seed(payload);
}

beforeEach(() => {
  local._reset();
  sync._reset();
  setUnlocked(null); // passwordless / never-locked default
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

// SKIPPED: RED-by-design target for issue #3. Unskip when Option C tombstones land.
describe.skip('sync-merge — deletion tombstones (issue #3, RED until fixed)', () => {
  // (a) delete-propagates: doc absent from the incoming payload + a tombstone
  // newer than the local doc's updatedAt -> the local copy must be removed.
  it('[RED] removes a local doc when the remote tombstone is newer than the local copy', async () => {
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', 'old content', 1000) },
    });
    // Remote mirror: the doc entry is already gone (the deleting device's own
    // orphan-cleanup removed it, sync-manager.js:243-254) — only the
    // (proposed) tombstone remains, and it postdates our local copy.
    seedSync({ deletedDocs: { 'notes/a.md': 2000 } });

    await setSyncEnabled(true);
    await initSync();

    const after = local._dump().vaultDocs || {};
    expect(after['notes/a.md']).toBeUndefined();
  });

  // (b) no-resurrection-on-repush: reproduces the issue's literal complaint
  // with NO invented schema. Device B never pulled device A's deletion and
  // still has the doc cached locally; B's own routine push must not put the
  // doc back into the mirror device A already cleaned.
  it('[RED] a stale local copy on device B must not resurrect the doc into storage.sync on repush', async () => {
    await setSyncEnabled(true);

    // The mirror already holds the doc from an earlier successful sync round
    // (both devices had it once).
    seedSync({ 'vaultDoc:notes/a.md': doc('notes/a.md', CIPHER, 1000) });

    // Device A: already deleted the doc locally (vaultDocs no longer has it)
    // and now runs its push -> buildSyncPayload emits nothing for it, and the
    // orphan-cleanup step (sync-manager.js:243-254) removes the now-stale
    // `vaultDoc:notes/a.md` key from the mirror.
    local._seed({ platformSyncEnabled: true, vaultDocs: {} });
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2100);
    await env.flushWrites();
    // sanity: A's delete actually propagated (proves the doc was really in
    // the mirror to begin with, i.e. the next assertion isn't vacuous)
    expect(Object.keys(sync._dump())).not.toContain('vaultDoc:notes/a.md');

    // Device B: separate local state, never pulled A's deletion — still has
    // the pre-delete doc sitting in its own storage.local.vaultDocs.
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', CIPHER, 1000) },
    });
    scheduleSyncPush(); // B's own periodic/debounced push, unrelated to A's delete
    await vi.advanceTimersByTimeAsync(2100);
    await env.flushWrites();

    // The doc must not be back in the mirror B just wrote to.
    expect(Object.keys(sync._dump())).not.toContain('vaultDoc:notes/a.md');
  });

  // (c) recreate-after-delete wins: the LOCAL doc is a genuine recreate
  // (newer than the incoming tombstone) — it must survive the merge.
  it('[guard — already passes] a local doc newer than an incoming tombstone is kept', async () => {
    local._seed({
      platformSyncEnabled: true,
      vaultDocs: { 'notes/a.md': doc('notes/a.md', 'recreated content', 5000) },
    });
    // Stale tombstone from the ORIGINAL (now superseded) deletion.
    seedSync({ deletedDocs: { 'notes/a.md': 1000 } });

    await setSyncEnabled(true);
    await initSync();

    const after = local._dump().vaultDocs || {};
    expect(after['notes/a.md']?.content).toBe('recreated content');
  });

  // (d) tombstone older than doc is ignored, on the REMOTE side of the merge:
  // both the doc and a stale tombstone for it arrive together in the same
  // pull; the newer doc must win.
  it('[guard — already passes] a newer remote doc wins over an older remote tombstone in the same pull', async () => {
    local._seed({ platformSyncEnabled: true, vaultDocs: {} });
    seedSync({
      'vaultDoc:notes/a.md': doc('notes/a.md', 'remote recreated content', 5000),
      deletedDocs: { 'notes/a.md': 1000 },
    });

    await setSyncEnabled(true);
    await initSync();

    const after = local._dump().vaultDocs || {};
    expect(after['notes/a.md']?.content).toBe('remote recreated content');
  });
});
