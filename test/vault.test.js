/**
 * Vault document store — driven against the REAL `src/utilities/vault-store.js`.
 *
 * This suite used to define a `createVaultStore()` fake with its own
 * `documents` map and its own `sort((a,b) => b.updated - a.updated)`. Its
 * "returns newest first" test therefore proved that the FIXTURE sorts, never
 * that `vault-store.js:115` does; the whole file passed against an empty
 * implementation. Every test below now calls the exported functions against a
 * fake `chrome` namespace and inspects what actually lands in
 * `storage.local.vaultDocs`.
 *
 * secret-vault has no IndexedDB here, so it falls back to the in-memory
 * non-extractable device key — the real passwordless at-rest path. Plaintext
 * seeds are legal input (unwrapSecret passes legacy plaintext through), which
 * is what lets the ordering tests pin exact `updatedAt` values instead of
 * racing the clock.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

// Install the fake namespace FIRST, then load the real modules against it.
const env = installFakeChrome();
const { local } = env;

const { setUnlocked, isCiphertext, unwrapSecret } =
  await import('../src/utilities/secret-vault.js');
const {
  getVaultIndex,
  getDocument,
  saveDocumentLocal,
  deleteDocumentLocal,
  listDocuments,
  updateSyncStatus,
} = await import('../src/utilities/vault-store.js');
const { setSyncEnabled } = await import('../src/utilities/sync-manager.js');

/** Seed `vaultDocs` straight into storage with exact, controlled fields. */
function seedDocs(docs) {
  local._seed({ vaultDocs: docs });
}

function doc(path, content, updatedAt, extra = {}) {
  return {
    path,
    content,
    updatedAt,
    syncStatus: 'local-only',
    eventId: null,
    relayCreatedAt: null,
    profileScope: null,
    ...extra,
  };
}

beforeEach(async () => {
  local._reset();
  setUnlocked(null); // passwordless / never-locked default
  await setSyncEnabled(false); // keep the 2s sync debounce inert
  local._reset();
  // Fake timers so vault-store's scheduleSyncPush() debounce never fires; the
  // fake chrome captured the REAL setTimeout at load, so storage still works.
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('saveDocumentLocal', () => {
  it('writes ciphertext at rest and hands the caller back plaintext', async () => {
    const returned = await saveDocumentLocal('notes/a.md', '# My Note\nHello', 'local-only');
    await env.flushWrites();

    const raw = local._dump().vaultDocs['notes/a.md'];
    expect(raw.content).not.toBe('# My Note\nHello');
    expect(isCiphertext(raw.content)).toBe(true);
    expect(await unwrapSecret(raw.content)).toBe('# My Note\nHello');

    // The return value is decrypted for the caller.
    expect(returned.content).toBe('# My Note\nHello');
    expect(returned.path).toBe('notes/a.md');
    expect(returned.syncStatus).toBe('local-only');
  });

  it('stamps updatedAt in SECONDS, not milliseconds', async () => {
    const before = Math.floor(Date.now() / 1000);
    const returned = await saveDocumentLocal('notes/t.md', 'x', 'local-only');
    await env.flushWrites();
    const after = Math.floor(Date.now() / 1000);

    expect(Number.isInteger(returned.updatedAt)).toBe(true);
    expect(returned.updatedAt).toBeGreaterThanOrEqual(before);
    expect(returned.updatedAt).toBeLessThanOrEqual(after);
    // A ms stamp would be ~1000× larger than a second stamp.
    expect(returned.updatedAt).toBeLessThan(Date.now() / 100);
  });

  it('carries eventId / relayCreatedAt through to storage', async () => {
    await saveDocumentLocal('notes/s.md', 'body', 'synced', 'evt-1', 1700000000);
    await env.flushWrites();

    const raw = local._dump().vaultDocs['notes/s.md'];
    expect(raw.syncStatus).toBe('synced');
    expect(raw.eventId).toBe('evt-1');
    expect(raw.relayCreatedAt).toBe(1700000000);
  });

  it('defaults eventId / relayCreatedAt to null when omitted', async () => {
    await saveDocumentLocal('notes/d.md', 'body', 'local-only');
    await env.flushWrites();

    const raw = local._dump().vaultDocs['notes/d.md'];
    expect(raw.eventId).toBeNull();
    expect(raw.relayCreatedAt).toBeNull();
  });

  it('overwrites in place on re-save (same path = same document)', async () => {
    await saveDocumentLocal('notes/a.md', 'Original', 'local-only');
    await env.flushWrites();
    await saveDocumentLocal('notes/a.md', 'Updated', 'local-only');
    await env.flushWrites();

    expect(Object.keys(local._dump().vaultDocs)).toEqual(['notes/a.md']);
    expect((await getDocument('notes/a.md')).content).toBe('Updated');
  });

  it('PRESERVES an existing profileScope across a re-save', async () => {
    seedDocs({ 'notes/scoped.md': doc('notes/scoped.md', 'v1', 100, { profileScope: [0, 2] }) });

    await saveDocumentLocal('notes/scoped.md', 'v2', 'local-only');
    await env.flushWrites();

    expect(local._dump().vaultDocs['notes/scoped.md'].profileScope).toEqual([0, 2]);
  });

  it('defaults profileScope to null for a brand-new document', async () => {
    await saveDocumentLocal('notes/new.md', 'v1', 'local-only');
    await env.flushWrites();
    expect(local._dump().vaultDocs['notes/new.md'].profileScope).toBeNull();
  });
});

describe('getDocument', () => {
  it('returns null for an unknown path (it does NOT throw)', async () => {
    expect(await getDocument('nope.md')).toBeNull();
  });

  it('decrypts the stored body', async () => {
    await saveDocumentLocal('notes/a.md', 'secret body', 'local-only');
    await env.flushWrites();
    expect((await getDocument('notes/a.md')).content).toBe('secret body');
  });
});

describe('listDocuments — vault-store.js:115 does the sorting', () => {
  it('returns newest first by updatedAt', async () => {
    // Explicit, out-of-order timestamps: a fixture that merely preserved
    // insertion order (or sorted ascending) fails here.
    seedDocs({
      'b.md': doc('b.md', 'B', 200),
      'a.md': doc('a.md', 'A', 100),
      'c.md': doc('c.md', 'C', 300),
    });

    const listed = await listDocuments();
    expect(listed.map(d => d.path)).toEqual(['c.md', 'b.md', 'a.md']);
    expect(listed.map(d => d.updatedAt)).toEqual([300, 200, 100]);
  });

  it('orders a real save sequence newest first', async () => {
    seedDocs({ 'old.md': doc('old.md', 'old', 1) });
    await saveDocumentLocal('fresh.md', 'fresh', 'local-only');
    await env.flushWrites();

    expect((await listDocuments())[0].path).toBe('fresh.md');
  });

  it('returns an empty array when the vault is empty', async () => {
    expect(await listDocuments()).toEqual([]);
  });

  it('decrypts every listed document body', async () => {
    await saveDocumentLocal('a.md', 'alpha', 'local-only');
    await env.flushWrites();
    await saveDocumentLocal('b.md', 'bravo', 'local-only');
    await env.flushWrites();

    const contents = (await listDocuments()).map(d => d.content).sort();
    expect(contents).toEqual(['alpha', 'bravo']);
  });
});

describe('getVaultIndex', () => {
  it('returns a path-keyed map with decrypted bodies', async () => {
    await saveDocumentLocal('x/y.md', 'body-xy', 'local-only');
    await env.flushWrites();

    const index = await getVaultIndex();
    expect(Object.keys(index)).toEqual(['x/y.md']);
    expect(index['x/y.md'].content).toBe('body-xy');
  });

  it('is empty for a fresh vault', async () => {
    expect(await getVaultIndex()).toEqual({});
  });
});

describe('deleteDocumentLocal', () => {
  it('removes the document from storage', async () => {
    seedDocs({ 'a.md': doc('a.md', 'A', 100), 'b.md': doc('b.md', 'B', 200) });

    await deleteDocumentLocal('a.md');
    await env.flushWrites();

    expect(Object.keys(local._dump().vaultDocs)).toEqual(['b.md']);
    expect(await getDocument('a.md')).toBeNull();
  });

  it('is a silent no-op for an unknown path (it does NOT throw)', async () => {
    seedDocs({ 'b.md': doc('b.md', 'B', 200) });
    await expect(deleteDocumentLocal('ghost.md')).resolves.toBeUndefined();
    await env.flushWrites();
    expect(Object.keys(local._dump().vaultDocs)).toEqual(['b.md']);
  });
});

describe('updateSyncStatus', () => {
  it('updates the status and persists it', async () => {
    seedDocs({ 'a.md': doc('a.md', 'A', 100) });

    const res = await updateSyncStatus('a.md', 'synced');
    await env.flushWrites();

    expect(res.syncStatus).toBe('synced');
    expect(local._dump().vaultDocs['a.md'].syncStatus).toBe('synced');
  });

  it('sets eventId / relayCreatedAt when supplied', async () => {
    seedDocs({ 'a.md': doc('a.md', 'A', 100) });

    await updateSyncStatus('a.md', 'synced', 'evt-9', 1700000123);
    await env.flushWrites();

    const raw = local._dump().vaultDocs['a.md'];
    expect(raw.eventId).toBe('evt-9');
    expect(raw.relayCreatedAt).toBe(1700000123);
  });

  it('leaves an existing eventId alone when the argument is omitted', async () => {
    seedDocs({ 'a.md': doc('a.md', 'A', 100, { eventId: 'keep-me', relayCreatedAt: 42 }) });

    await updateSyncStatus('a.md', 'conflict');
    await env.flushWrites();

    const raw = local._dump().vaultDocs['a.md'];
    expect(raw.syncStatus).toBe('conflict');
    expect(raw.eventId).toBe('keep-me');
    expect(raw.relayCreatedAt).toBe(42);
  });

  it('never leaves the note body in the clear while touching sync metadata', async () => {
    await saveDocumentLocal('a.md', 'still secret', 'local-only');
    await env.flushWrites();

    await updateSyncStatus('a.md', 'synced', 'evt-3');
    await env.flushWrites();

    const raw = local._dump().vaultDocs['a.md'];
    expect(isCiphertext(raw.content)).toBe(true);
    expect(raw.content).not.toContain('still secret');
    expect((await getDocument('a.md')).content).toBe('still secret');
  });

  it('returns null for an unknown path and writes nothing', async () => {
    seedDocs({ 'a.md': doc('a.md', 'A', 100) });

    expect(await updateSyncStatus('ghost.md', 'synced')).toBeNull();
    await env.flushWrites();
    expect(Object.keys(local._dump().vaultDocs)).toEqual(['a.md']);
  });
});

describe('full lifecycle against the real store', () => {
  it('create → read → update → list → delete', async () => {
    await saveDocumentLocal('note1.md', '# Draft\nFirst version', 'local-only');
    await env.flushWrites();
    expect((await getDocument('note1.md')).content).toContain('First version');

    await saveDocumentLocal('note1.md', '# Final\nSecond version', 'local-only');
    await env.flushWrites();
    expect((await getDocument('note1.md')).content).toContain('Second version');

    await updateSyncStatus('note1.md', 'synced', 'evt-final');
    await env.flushWrites();
    const listed = await listDocuments();
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({ path: 'note1.md', syncStatus: 'synced', eventId: 'evt-final' });

    await deleteDocumentLocal('note1.md');
    await env.flushWrites();
    expect(await getDocument('note1.md')).toBeNull();
    expect(await listDocuments()).toEqual([]);
  });
});
