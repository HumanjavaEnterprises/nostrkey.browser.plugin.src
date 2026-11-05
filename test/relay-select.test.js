import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { selectRelayUrls, relaysFromKind10002 } from '../src/utilities/relay-select.js';

const A = 'a'.repeat(64), B = 'b'.repeat(64), C = 'c'.repeat(64);
const profiles = [
    { pubKey: A, relays: [
        { url: 'wss://a-rw', read: true, write: true },
        { url: 'wss://a-r', read: true, write: false },
    ] },
    { pubKey: B, relays: [{ url: 'wss://b-w', read: false, write: true }] },
    { type: 'bunker', remotePubkey: C, relays: [{ url: 'wss://c-own', read: true, write: true }],
      relayListEvent: { kind: 10002, tags: [['r', 'wss://c-w', 'write'], ['r', 'wss://c-r', 'read'], ['r', 'wss://c-rw']] } },
];

describe('selectRelayUrls', () => {
    it('with no option uses the active profile, as before', () => {
        expect(selectRelayUrls('write', profiles, 0)).toEqual(['wss://a-rw']);
        expect(selectRelayUrls('read', profiles, 0)).toEqual(['wss://a-rw', 'wss://a-r']);
        expect(selectRelayUrls('write', profiles, 1)).toEqual(['wss://b-w']);
    });

    it('ignores relayListEvent on the active-profile path (unchanged behaviour)', () => {
        expect(selectRelayUrls('write', profiles, 2)).toEqual(['wss://c-own']);
    });

    it('a non-active identity uses its own relays, not the active one', () => {
        expect(selectRelayUrls('write', profiles, 0, { pubkey: B })).toEqual(['wss://b-w']);
        expect(selectRelayUrls('write', profiles, 0, { pubkey: B.toUpperCase() })).toEqual(['wss://b-w']);
    });

    it('prefers the identity\'s kind 10002 write relays when known', () => {
        expect(selectRelayUrls('write', profiles, 0, { pubkey: C })).toEqual(['wss://c-w', 'wss://c-rw']);
        expect(selectRelayUrls('read', profiles, 0, { pubkey: C })).toEqual(['wss://c-r', 'wss://c-rw']);
    });

    it('an unknown identity is refused rather than falling back to the active profile', () => {
        expect(() => selectRelayUrls('write', profiles, 0, { pubkey: 'd'.repeat(64) })).toThrow();
    });

    it('empty list yields no URLs (withRelays then throws "No relays configured")', () => {
        expect(selectRelayUrls('write', [{ relays: [] }], 0)).toEqual([]);
        expect(selectRelayUrls('write', [{}], 0)).toEqual([]);
    });
});

describe('relaysFromKind10002', () => {
    it('rejects other kinds', () => {
        expect(relaysFromKind10002({ kind: 3, tags: [] })).toBeNull();
        expect(relaysFromKind10002(null)).toBeNull();
    });
});

describe('withRelays in background.js', () => {
    const src = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');
    it('keeps the argument order and the F8 error message', () => {
        expect(src).toMatch(/async function withRelays\(mode, callback, \{ pubkey = null \} = \{\}\)/);
        expect(src).toContain("throw new Error('No relays configured')");
    });
    it('existing callers pass no options (active profile as today)', () => {
        const calls = src.match(/withRelays\('(read|write)', async \(relays\) => \{/g) || [];
        expect(calls.length).toBe(5);
        expect(src).not.toMatch(/\}, \{ pubkey/);
    });
});
