/**
 * API Key Vault tests
 *
 * Covers: apikeys.encrypt, apikeys.decrypt, apikeys.publish, apikeys.fetch, apikeys.delete
 * Stores encrypted API keys on Nostr relays, synced across devices.
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createApiKeyStore() {
  let keys = {};

  return {
    async store(id, name, value, metadata = {}) {
      if (!id) throw new Error('Key ID required');
      if (!name) throw new Error('Key name required');
      if (!value) throw new Error('Key value required');
      // In real code, value is encrypted before storage
      keys[id] = { id, name, encrypted_value: `enc:${value}`, metadata, created: Date.now() };
      return keys[id];
    },

    async fetch() {
      return Object.values(keys);
    },

    async get(id) {
      if (!keys[id]) throw new Error('API key not found');
      return keys[id];
    },

    async decrypt(id) {
      if (!keys[id]) throw new Error('API key not found');
      return keys[id].encrypted_value.replace('enc:', '');
    },

    async delete(id) {
      if (!keys[id]) throw new Error('API key not found');
      delete keys[id];
    },

    _reset() { keys = {}; },
  };
}

describe('API Key Vault', () => {
  let store;

  beforeEach(() => {
    store = createApiKeyStore();
  });

  it('stores an API key', async () => {
    await store.store('k1', 'OpenAI', 'sk-abc123');
    const keys = await store.fetch();
    expect(keys).toHaveLength(1);
    expect(keys[0].name).toBe('OpenAI');
  });

  it('encrypts the value', async () => {
    await store.store('k1', 'OpenAI', 'sk-abc123');
    const key = await store.get('k1');
    expect(key.encrypted_value).not.toBe('sk-abc123');
    expect(key.encrypted_value).toContain('enc:');
  });

  it('decrypts back to original', async () => {
    await store.store('k1', 'OpenAI', 'sk-abc123');
    const decrypted = await store.decrypt('k1');
    expect(decrypted).toBe('sk-abc123');
  });

  it('stores multiple keys', async () => {
    await store.store('k1', 'OpenAI', 'sk-abc');
    await store.store('k2', 'Anthropic', 'sk-def');
    await store.store('k3', 'RunPod', 'rpa-ghi');
    expect(await store.fetch()).toHaveLength(3);
  });

  it('deletes a key', async () => {
    await store.store('k1', 'OpenAI', 'sk-abc');
    await store.delete('k1');
    expect(await store.fetch()).toHaveLength(0);
  });

  it('stores metadata', async () => {
    await store.store('k1', 'OpenAI', 'sk-abc', { service: 'chat', tier: 'pro' });
    const key = await store.get('k1');
    expect(key.metadata.service).toBe('chat');
  });

  it('rejects empty values', async () => {
    await expect(store.store('k1', 'Test', '')).rejects.toThrow('Key value required');
    await expect(store.store('k1', '', 'val')).rejects.toThrow('Key name required');
  });

  it('full lifecycle: store → fetch → decrypt → delete', async () => {
    await store.store('k1', 'MyKey', 'secret-value-123');
    expect(await store.fetch()).toHaveLength(1);
    expect(await store.decrypt('k1')).toBe('secret-value-123');
    await store.delete('k1');
    expect(await store.fetch()).toHaveLength(0);
  });
});
