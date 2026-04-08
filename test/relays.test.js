/**
 * Relay management tests
 *
 * Covers: addRelay, getRelays — relay list CRUD
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createRelayStore() {
  let relays = [];

  return {
    async addRelay(url) {
      // Validate relay URL
      if (!url) throw new Error('Relay URL required');
      if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
        throw new Error('Relay URL must start with wss:// or ws://');
      }
      // Normalize: strip trailing slash
      const normalized = url.replace(/\/+$/, '');
      // Check for duplicates
      if (relays.includes(normalized)) {
        throw new Error('Relay already exists');
      }
      relays.push(normalized);
      return relays;
    },

    async removeRelay(url) {
      const normalized = url.replace(/\/+$/, '');
      const idx = relays.indexOf(normalized);
      if (idx === -1) throw new Error('Relay not found');
      relays.splice(idx, 1);
      return relays;
    },

    async getRelays() {
      return [...relays];
    },

    _reset() { relays = []; },
  };
}

describe('Relay Management', () => {
  let store;

  beforeEach(() => {
    store = createRelayStore();
  });

  it('adds a relay', async () => {
    await store.addRelay('wss://relay.nostrkeep.com');
    const relays = await store.getRelays();
    expect(relays).toHaveLength(1);
    expect(relays[0]).toBe('wss://relay.nostrkeep.com');
  });

  it('adds multiple relays', async () => {
    await store.addRelay('wss://relay.nostrkeep.com');
    await store.addRelay('wss://relay.damus.io');
    await store.addRelay('wss://nos.lol');
    expect(await store.getRelays()).toHaveLength(3);
  });

  it('rejects empty URL', async () => {
    await expect(store.addRelay('')).rejects.toThrow('Relay URL required');
  });

  it('rejects non-websocket URL', async () => {
    await expect(store.addRelay('https://relay.example.com'))
      .rejects.toThrow('must start with wss://');
  });

  it('rejects duplicate relay', async () => {
    await store.addRelay('wss://relay.nostrkeep.com');
    await expect(store.addRelay('wss://relay.nostrkeep.com'))
      .rejects.toThrow('Relay already exists');
  });

  it('normalizes trailing slashes', async () => {
    await store.addRelay('wss://relay.nostrkeep.com/');
    const relays = await store.getRelays();
    expect(relays[0]).toBe('wss://relay.nostrkeep.com');
  });

  it('removes a relay', async () => {
    await store.addRelay('wss://relay.nostrkeep.com');
    await store.addRelay('wss://relay.damus.io');
    await store.removeRelay('wss://relay.nostrkeep.com');
    const relays = await store.getRelays();
    expect(relays).toHaveLength(1);
    expect(relays[0]).toBe('wss://relay.damus.io');
  });

  it('throws when removing non-existent relay', async () => {
    await expect(store.removeRelay('wss://fake.relay'))
      .rejects.toThrow('Relay not found');
  });

  it('allows ws:// for local relays', async () => {
    await store.addRelay('ws://localhost:7777');
    expect(await store.getRelays()).toContain('ws://localhost:7777');
  });
});
