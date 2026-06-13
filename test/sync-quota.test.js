/**
 * Sync quota-fallback regression tests
 *
 * storage.sync.set is all-or-nothing: an over-quota batch is rejected whole, so
 * the old code could silently sync NOTHING (not even profiles). setSyncRespectingQuota
 * drops the lowest-priority entries and retries, guaranteeing P1 still syncs.
 *
 * sync-manager imports browser-polyfill, which throws unless an extension API
 * namespace exists — install a minimal chrome stub, then import.
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

const { setSyncRespectingQuota } = await import('../src/utilities/sync-manager.js');

const NOW = 1_700_000_000_000;
const META = '_sync_meta';

const placed = () => [
  { priority: 1, keys: ['profiles', 'profileIndex'] },
  { priority: 2, keys: ['autoLockMinutes'] },
  { priority: 3, keys: ['apiKeyVault'] },
  { priority: 4, keys: ['vaultDoc:a', 'vaultDoc:b'] },
];
const payload = () => ({
  profiles: 'p', profileIndex: 'i', autoLockMinutes: '15',
  apiKeyVault: 'k', 'vaultDoc:a': 'A', 'vaultDoc:b': 'B',
});

describe('setSyncRespectingQuota', () => {
  it('writes everything (plus meta) when the first set succeeds', async () => {
    const calls = [];
    const setFn = async (p) => { calls.push({ ...p }); };
    const written = await setSyncRespectingQuota(payload(), placed(), setFn, NOW);

    expect(calls).toHaveLength(1);
    expect(calls[0][META]).toBeDefined();
    expect(written).toEqual(['profiles', 'profileIndex', 'autoLockMinutes', 'apiKeyVault', 'vaultDoc:a', 'vaultDoc:b']);
  });

  it('drops P4 then P3 on repeated quota rejection, keeping P1/P2', async () => {
    let fails = 2; // reject the first two attempts
    const seenKeys = [];
    const setFn = async (p) => {
      seenKeys.push(Object.keys(p).filter(k => k !== META));
      if (fails-- > 0) throw new Error('QUOTA_BYTES quota exceeded');
    };
    const written = await setSyncRespectingQuota(payload(), placed(), setFn, NOW);

    expect(seenKeys).toHaveLength(3);               // all → drop P4 → drop P3 → ok
    expect(written).toEqual(['profiles', 'profileIndex', 'autoLockMinutes']);
    expect(written).not.toContain('apiKeyVault');
    expect(written).not.toContain('vaultDoc:a');
  });

  it('never drops P1; throws if even the minimal payload is rejected', async () => {
    const setFn = async () => { throw new Error('quota'); };
    await expect(setSyncRespectingQuota(payload(), placed(), setFn, NOW)).rejects.toThrow();
  });

  it('meta key list reflects only the keys actually written after drops', async () => {
    let fails = 1;
    let lastMeta = null;
    const setFn = async (p) => {
      if (fails-- > 0) throw new Error('quota');
      lastMeta = JSON.parse(p[META]);
    };
    const written = await setSyncRespectingQuota(payload(), placed(), setFn, NOW);

    expect(lastMeta.keys).toEqual(written);
    expect(lastMeta.keys).not.toContain('vaultDoc:a'); // P4 dropped
    expect(lastMeta.lastWrittenAt).toBe(NOW);
  });
});
