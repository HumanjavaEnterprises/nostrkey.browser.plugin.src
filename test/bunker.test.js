/**
 * NIP-46 Bunker tests
 *
 * Covers: bunker.connect, bunker.disconnect, bunker.status, bunker.ping, bunker.validateUrl
 * Bunker is NIP-46 remote signing — keys stay on one device, sign requests come over relays.
 */

import { describe, it, expect, beforeEach } from 'vitest';

const BUNKER_URL_RE = /^bunker:\/\/[0-9a-f]{64}\?relay=wss?:\/\/.+/;

function createBunkerClient() {
  let connected = false;
  let remoteUrl = null;

  return {
    async validateUrl(url) {
      if (!url) return { valid: false, error: 'URL required' };
      if (!url.startsWith('bunker://')) return { valid: false, error: 'Must start with bunker://' };
      if (!url.includes('?relay=')) return { valid: false, error: 'Missing relay parameter' };
      // Extract pubkey (32 bytes hex)
      const pubkey = url.replace('bunker://', '').split('?')[0];
      if (!/^[0-9a-f]{64}$/.test(pubkey)) return { valid: false, error: 'Invalid pubkey' };
      return { valid: true, pubkey };
    },

    async connect(url) {
      const validation = await this.validateUrl(url);
      if (!validation.valid) throw new Error(validation.error);
      remoteUrl = url;
      connected = true;
      return { connected: true, pubkey: validation.pubkey };
    },

    async disconnect() {
      if (!connected) throw new Error('Not connected');
      connected = false;
      remoteUrl = null;
    },

    async status() {
      return { connected, remoteUrl };
    },

    async ping() {
      if (!connected) throw new Error('Not connected');
      return { pong: true, latency_ms: 42 };
    },
  };
}

describe('NIP-46 Bunker Client', () => {
  let bunker;

  beforeEach(() => {
    bunker = createBunkerClient();
  });

  describe('URL validation', () => {
    it('accepts valid bunker URL', async () => {
      const url = `bunker://${'a'.repeat(64)}?relay=wss://relay.nostrkeep.com`;
      const result = await bunker.validateUrl(url);
      expect(result.valid).toBe(true);
      expect(result.pubkey).toBe('a'.repeat(64));
    });

    it('rejects empty URL', async () => {
      const result = await bunker.validateUrl('');
      expect(result.valid).toBe(false);
    });

    it('rejects non-bunker URL', async () => {
      const result = await bunker.validateUrl('https://relay.example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('bunker://');
    });

    it('rejects missing relay', async () => {
      const result = await bunker.validateUrl(`bunker://${'a'.repeat(64)}`);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('relay');
    });

    it('rejects invalid pubkey', async () => {
      const result = await bunker.validateUrl('bunker://short?relay=wss://r.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pubkey');
    });
  });

  describe('connect / disconnect', () => {
    const validUrl = `bunker://${'b'.repeat(64)}?relay=wss://relay.nostrkeep.com`;

    it('connects to valid bunker URL', async () => {
      const result = await bunker.connect(validUrl);
      expect(result.connected).toBe(true);
    });

    it('status shows connected', async () => {
      await bunker.connect(validUrl);
      const status = await bunker.status();
      expect(status.connected).toBe(true);
      expect(status.remoteUrl).toBe(validUrl);
    });

    it('disconnects', async () => {
      await bunker.connect(validUrl);
      await bunker.disconnect();
      const status = await bunker.status();
      expect(status.connected).toBe(false);
    });

    it('rejects disconnect when not connected', async () => {
      await expect(bunker.disconnect()).rejects.toThrow('Not connected');
    });

    it('rejects connect with invalid URL', async () => {
      await expect(bunker.connect('https://bad')).rejects.toThrow();
    });
  });

  describe('ping', () => {
    it('pings connected bunker', async () => {
      await bunker.connect(`bunker://${'c'.repeat(64)}?relay=wss://r.com`);
      const result = await bunker.ping();
      expect(result.pong).toBe(true);
      expect(result.latency_ms).toBeDefined();
    });

    it('rejects ping when not connected', async () => {
      await expect(bunker.ping()).rejects.toThrow('Not connected');
    });
  });
});
