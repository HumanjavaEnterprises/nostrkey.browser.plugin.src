/**
 * Reset all data tests
 *
 * Covers: resetAllData — nuclear option that wipes everything
 * This is a sensitive operation that should only be accessible from extension UI.
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createFullState() {
  let state = {
    profiles: [{ id: 'p1', name: 'Alice', nsec: 'nsec1alice' }],
    relays: ['wss://relay.nostrkeep.com'],
    active_profile: 'p1',
    password_hash: 'hash:test',
    permissions: { 'https://snort.social': { signEvent: 'always' } },
    vault: { doc1: { content: 'secret' } },
    apikeys: { k1: { name: 'test', value: 'enc:val' } },
    settings: { autoLockTimeout: 15 },
  };

  return {
    async getState() { return { ...state }; },
    async resetAllData(confirmPassword) {
      // In real code, this requires the master password for confirmation
      if (state.password_hash && `hash:${confirmPassword}` !== state.password_hash) {
        throw new Error('Wrong password — cannot reset');
      }
      state = {
        profiles: [],
        relays: [],
        active_profile: null,
        password_hash: null,
        permissions: {},
        vault: {},
        apikeys: {},
        settings: { autoLockTimeout: 15 },
      };
      return { reset: true };
    },
    _setState(s) { state = s; },
  };
}

describe('Reset All Data', () => {
  let system;

  beforeEach(() => {
    system = createFullState();
  });

  it('has data before reset', async () => {
    const state = await system.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.relays).toHaveLength(1);
    expect(state.active_profile).toBe('p1');
  });

  it('resets everything with correct password', async () => {
    await system.resetAllData('test');
    const state = await system.getState();
    expect(state.profiles).toHaveLength(0);
    expect(state.relays).toHaveLength(0);
    expect(state.active_profile).toBeNull();
    expect(state.password_hash).toBeNull();
    expect(state.permissions).toEqual({});
    expect(state.vault).toEqual({});
    expect(state.apikeys).toEqual({});
  });

  it('rejects wrong password', async () => {
    await expect(system.resetAllData('wrong'))
      .rejects.toThrow('Wrong password');
    // Data should still be there
    const state = await system.getState();
    expect(state.profiles).toHaveLength(1);
  });

  it('preserves default settings after reset', async () => {
    await system.resetAllData('test');
    const state = await system.getState();
    expect(state.settings.autoLockTimeout).toBe(15);
  });

  it('allows reset without password when no password is set', async () => {
    system._setState({
      profiles: [{ id: 'p1', name: 'Test' }],
      relays: [],
      active_profile: 'p1',
      password_hash: null,
      permissions: {},
      vault: {},
      apikeys: {},
      settings: { autoLockTimeout: 15 },
    });

    await system.resetAllData(null);
    const state = await system.getState();
    expect(state.profiles).toHaveLength(0);
  });
});
