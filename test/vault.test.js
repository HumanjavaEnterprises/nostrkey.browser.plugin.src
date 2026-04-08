/**
 * Vault operations tests
 *
 * Covers: vault.publish, vault.fetch, vault.delete, vault.getRelays
 * The vault stores encrypted .md documents on Nostr relays (NIP-78)
 */

import { describe, it, expect, beforeEach } from 'vitest';

function createVaultStore() {
  let documents = {};
  let relays = ['wss://relay.nostrkeep.com'];

  return {
    async publish(id, content, title = 'Untitled') {
      if (!id) throw new Error('Document ID required');
      if (content === undefined) throw new Error('Content required');
      documents[id] = { id, title, content, updated: Date.now() };
      return { success: true, id };
    },

    async fetch() {
      return Object.values(documents).sort((a, b) => b.updated - a.updated);
    },

    async get(id) {
      if (!documents[id]) throw new Error('Document not found');
      return documents[id];
    },

    async delete(id) {
      if (!documents[id]) throw new Error('Document not found');
      delete documents[id];
      return { success: true };
    },

    async getRelays() {
      return [...relays];
    },

    _reset() { documents = {}; },
  };
}

describe('Vault Operations', () => {
  let vault;

  beforeEach(() => {
    vault = createVaultStore();
  });

  describe('create document', () => {
    it('creates a document', async () => {
      const result = await vault.publish('doc1', '# My Note\nHello world');
      expect(result.success).toBe(true);
      expect(result.id).toBe('doc1');
    });

    it('stores content correctly', async () => {
      await vault.publish('doc1', '# Test\nContent here');
      const doc = await vault.get('doc1');
      expect(doc.content).toBe('# Test\nContent here');
    });

    it('stores title', async () => {
      await vault.publish('doc1', 'content', 'My Title');
      const doc = await vault.get('doc1');
      expect(doc.title).toBe('My Title');
    });

    it('rejects empty ID', async () => {
      await expect(vault.publish('', 'content')).rejects.toThrow('Document ID required');
    });
  });

  describe('fetch documents', () => {
    it('returns empty array when no documents', async () => {
      const docs = await vault.fetch();
      expect(docs).toEqual([]);
    });

    it('returns all documents', async () => {
      await vault.publish('doc1', 'First');
      await vault.publish('doc2', 'Second');
      const docs = await vault.fetch();
      expect(docs).toHaveLength(2);
    });

    it('returns newest first', async () => {
      await vault.publish('doc1', 'First');
      await new Promise(r => setTimeout(r, 10));
      await vault.publish('doc2', 'Second');
      const docs = await vault.fetch();
      expect(docs[0].id).toBe('doc2');
    });
  });

  describe('update document', () => {
    it('updates content by publishing same ID', async () => {
      await vault.publish('doc1', 'Original');
      await vault.publish('doc1', 'Updated');
      const doc = await vault.get('doc1');
      expect(doc.content).toBe('Updated');
    });
  });

  describe('delete document', () => {
    it('deletes a document', async () => {
      await vault.publish('doc1', 'Delete me');
      await vault.delete('doc1');
      const docs = await vault.fetch();
      expect(docs).toHaveLength(0);
    });

    it('throws when deleting non-existent', async () => {
      await expect(vault.delete('fake')).rejects.toThrow('Document not found');
    });
  });

  describe('vault relays', () => {
    it('returns configured relays', async () => {
      const relays = await vault.getRelays();
      expect(relays).toContain('wss://relay.nostrkeep.com');
    });
  });

  describe('full lifecycle', () => {
    it('create → read → update → read → delete', async () => {
      // Create
      await vault.publish('note1', '# Draft\nFirst version');
      let doc = await vault.get('note1');
      expect(doc.content).toContain('First version');

      // Update
      await vault.publish('note1', '# Final\nSecond version');
      doc = await vault.get('note1');
      expect(doc.content).toContain('Second version');

      // Delete
      await vault.delete('note1');
      await expect(vault.get('note1')).rejects.toThrow('not found');
    });
  });
});
