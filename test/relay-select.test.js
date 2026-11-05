import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { finalizeEvent, getPublicKeySync, hexToBytes } from 'nostr-crypto-utils';
import { selectRelayUrls, relaysFromKind10002, normaliseRelayUrl, sanitiseRelayList, MAX_RELAYS } from '../src/utilities/relay-select.js';

const SK_C = '1'.repeat(64), SK_X = '2'.repeat(64);
const A = 'a'.repeat(64), B = 'b'.repeat(64), C = getPublicKeySync(hexToBytes(SK_C));
const sign = (sk, tags, kind = 10002) => finalizeEvent({ kind, tags, content: '', created_at: 1700000000 }, hexToBytes(sk));
const C_TAGS = [['r', 'wss://c-w', 'write'], ['r', 'wss://c-r', 'read'], ['r', 'wss://c-rw']];
const c10002 = await sign(SK_C, C_TAGS);
const profiles = [
    { pubKey: A, relays: [
        { url: 'wss://a-rw', read: true, write: true },
        { url: 'wss://a-r', read: true, write: false },
    ] },
    { pubKey: B, relays: [{ url: 'wss://b-w', read: false, write: true }] },
    { type: 'bunker', remotePubkey: C, relays: [{ url: 'wss://c-own', read: true, write: true }],
      relayListEvent: c10002 },
];

describe('selectRelayUrls', () => {
    it('with no option uses the active profile, as before', async () => {
        expect(await selectRelayUrls('write', profiles, 0)).toEqual(['wss://a-rw']);
        expect(await selectRelayUrls('read', profiles, 0)).toEqual(['wss://a-rw', 'wss://a-r']);
        expect(await selectRelayUrls('write', profiles, 1)).toEqual(['wss://b-w']);
    });

    it('ignores relayListEvent on the active-profile path (unchanged behaviour)', async () => {
        expect(await selectRelayUrls('write', profiles, 2)).toEqual(['wss://c-own']);
    });

    it('a non-active identity uses its own relays, not the active one', async () => {
        expect(await selectRelayUrls('write', profiles, 0, { pubkey: B })).toEqual(['wss://b-w']);
        expect(await selectRelayUrls('write', profiles, 0, { pubkey: B.toUpperCase() })).toEqual(['wss://b-w']);
    });

    it('prefers the identity\'s kind 10002 write relays when known', async () => {
        expect(await selectRelayUrls('write', profiles, 0, { pubkey: C })).toEqual(['wss://c-w', 'wss://c-rw']);
        expect(await selectRelayUrls('read', profiles, 0, { pubkey: C })).toEqual(['wss://c-r', 'wss://c-rw']);
    });

    it('an unknown identity is refused rather than falling back to the active profile', async () => {
        await expect(selectRelayUrls('write', profiles, 0, { pubkey: 'd'.repeat(64) })).rejects.toThrow();
    });

    it('empty list yields no URLs (withRelays then throws "No relays configured")', async () => {
        expect(await selectRelayUrls('write', [{ relays: [] }], 0)).toEqual([]);
        expect(await selectRelayUrls('write', [{}], 0)).toEqual([]);
    });
});

describe('stored kind 10002 is trusted only when it is genuinely the identity\'s own', () => {
    const withEvent = (ev) => [{ remotePubkey: C, relays: [{ url: 'wss://c-own', read: true, write: true }], relayListEvent: ev }];
    it('a 10002 signed by someone else is ignored', async () => {
        const foreign = await sign(SK_X, C_TAGS);
        expect(await selectRelayUrls('write', withEvent(foreign), 0, { pubkey: C })).toEqual(['wss://c-own']);
        expect(await selectRelayUrls('write', withEvent({ ...foreign, pubkey: C }), 0, { pubkey: C })).toEqual(['wss://c-own']);
    });
    it('a 10002 with a bad signature or altered tags is ignored', async () => {
        const badSig = { ...c10002, sig: c10002.sig.slice(0, -2) + (c10002.sig.endsWith('00') ? '11' : '00') };
        expect(await selectRelayUrls('write', withEvent(badSig), 0, { pubkey: C })).toEqual(['wss://c-own']);
        const altered = { ...c10002, tags: [['r', 'wss://evil']] };
        expect(await selectRelayUrls('write', withEvent(altered), 0, { pubkey: C })).toEqual(['wss://c-own']);
    });
    it('a correctly signed event of another kind is ignored', async () => {
        const k3 = await sign(SK_C, C_TAGS, 3);
        expect(await selectRelayUrls('write', withEvent(k3), 0, { pubkey: C })).toEqual(['wss://c-own']);
    });
    it('a genuine 10002 with no relays for the mode falls back to the profile list', async () => {
        const readOnly = await sign(SK_C, [['r', 'wss://c-r', 'read']]);
        expect(await selectRelayUrls('write', withEvent(readOnly), 0, { pubkey: C })).toEqual(['wss://c-own']);
        expect(await selectRelayUrls('read', withEvent(readOnly), 0, { pubkey: C })).toEqual(['wss://c-r']);
    });
});

describe('relay URL safety', () => {
    it('accepts wss and local ws, normalised', () => {
        expect(normaliseRelayUrl('wss://Relay.Example.COM/')).toBe('wss://relay.example.com');
        expect(normaliseRelayUrl('wss://relay.example.com/path/')).toBe('wss://relay.example.com/path');
        expect(normaliseRelayUrl('ws://localhost:7777')).toBe('ws://localhost:7777');
        expect(normaliseRelayUrl('ws://127.0.0.1:4869/')).toBe('ws://127.0.0.1:4869');
        expect(normaliseRelayUrl('ws://[::1]:7777')).toBe('ws://[::1]:7777');
    });
    it('refuses other schemes, remote ws, credentials and private addresses', () => {
        for (const bad of ['javascript:alert(1)', 'data:text/plain,x', 'http://relay.example.com',
            'https://relay.example.com', 'ws://relay.example.com', 'wss://user:pw@relay.example.com',
            'wss://10.0.0.5', 'wss://192.168.1.1', 'wss://172.16.0.1', 'wss://169.254.169.254',
            'wss://[fd00::1]', 'wss://[fe80::1]', 'not a url', 42, null]) {
            expect(normaliseRelayUrl(bad)).toBeNull();
        }
    });
    it('dedupes (merging flags), drops bad entries and caps the list', () => {
        const out = sanitiseRelayList([
            { url: 'wss://r.example/', read: true, write: false },
            { url: 'wss://R.example', read: false, write: true },
            { url: 'http://nope', read: true, write: true },
        ]);
        expect(out).toEqual([{ url: 'wss://r.example', read: true, write: true }]);
        const many = Array.from({ length: 50 }, (_, i) => ({ url: `wss://r${i}.example`, read: true, write: true }));
        expect(sanitiseRelayList(many)).toHaveLength(MAX_RELAYS);
    });
    it('applies to the profile list too, keeping valid entries', async () => {
        const p = [{ relays: [{ url: 'wss://ok.example/', read: true, write: true }, { url: 'ws://lan.example', read: true, write: true }] }];
        expect(await selectRelayUrls('write', p, 0)).toEqual(['wss://ok.example']);
    });
});

describe('relaysFromKind10002', () => {
    it('ignores tags with unknown markers', () => {
        const out = relaysFromKind10002({ kind: 10002, tags: [['r', 'wss://a.example', 'Write'], ['r', 'wss://b.example', 'foo'], ['r', 'wss://c.example']] });
        expect(out).toEqual([{ url: 'wss://c.example', read: true, write: true }]);
    });
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
