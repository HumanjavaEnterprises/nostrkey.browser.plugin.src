/**
 * Permission management tests
 *
 * Covers: allowed, denied — per-site NIP-07 permission grants
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createPermissionStore() {
  let permissions = {}; // { origin: { kind: 'always' | 'session' | 'denied' } }

  return {
    async grant(origin, kind, duration = 'session') {
      if (!origin) throw new Error('Origin required');
      if (!permissions[origin]) permissions[origin] = {};
      permissions[origin][kind] = duration;
    },

    async deny(origin, kind) {
      if (!permissions[origin]) permissions[origin] = {};
      permissions[origin][kind] = 'denied';
    },

    async check(origin, kind) {
      if (!permissions[origin]) return 'ask';
      return permissions[origin][kind] || 'ask';
    },

    async revoke(origin) {
      delete permissions[origin];
    },

    async revokeAll() {
      permissions = {};
    },

    async listGranted() {
      return Object.entries(permissions).map(([origin, kinds]) => ({
        origin,
        kinds: Object.entries(kinds).map(([k, v]) => ({ kind: k, status: v })),
      }));
    },
  };
}

describe('Permission Management', () => {
  let perms;

  beforeEach(() => {
    perms = createPermissionStore();
  });

  it('defaults to "ask" for unknown sites', async () => {
    expect(await perms.check('https://snort.social', 'signEvent')).toBe('ask');
  });

  it('grants session permission', async () => {
    await perms.grant('https://snort.social', 'signEvent', 'session');
    expect(await perms.check('https://snort.social', 'signEvent')).toBe('session');
  });

  it('grants always permission', async () => {
    await perms.grant('https://snort.social', 'signEvent', 'always');
    expect(await perms.check('https://snort.social', 'signEvent')).toBe('always');
  });

  it('denies permission', async () => {
    await perms.deny('https://evil.com', 'signEvent');
    expect(await perms.check('https://evil.com', 'signEvent')).toBe('denied');
  });

  it('different kinds have separate permissions', async () => {
    await perms.grant('https://snort.social', 'signEvent', 'always');
    await perms.deny('https://snort.social', 'nip04.decrypt');
    expect(await perms.check('https://snort.social', 'signEvent')).toBe('always');
    expect(await perms.check('https://snort.social', 'nip04.decrypt')).toBe('denied');
  });

  it('revokes all permissions for a site', async () => {
    await perms.grant('https://snort.social', 'signEvent', 'always');
    await perms.grant('https://snort.social', 'nip44.encrypt', 'session');
    await perms.revoke('https://snort.social');
    expect(await perms.check('https://snort.social', 'signEvent')).toBe('ask');
  });

  it('revokes all permissions globally', async () => {
    await perms.grant('https://snort.social', 'signEvent', 'always');
    await perms.grant('https://iris.to', 'signEvent', 'always');
    await perms.revokeAll();
    expect(await perms.check('https://snort.social', 'signEvent')).toBe('ask');
    expect(await perms.check('https://iris.to', 'signEvent')).toBe('ask');
  });

  it('lists all granted permissions', async () => {
    await perms.grant('https://snort.social', 'signEvent', 'always');
    await perms.grant('https://iris.to', 'signEvent', 'session');
    const list = await perms.listGranted();
    expect(list).toHaveLength(2);
  });
});
