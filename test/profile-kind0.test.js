import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { finalizeEvent, getPublicKeySync, hexToBytes } from 'nostr-crypto-utils';
import { fetchProfile, pickNewest, isNewerRelayList, isOwnEvent } from '../src/profiles/kind0.js';
import { selectRelayUrls } from '../src/utilities/relay-select.js';

const SK = '1'.repeat(64), SK2 = '2'.repeat(64);
const PK = getPublicKeySync(hexToBytes(SK));
const sign = async (sk, kind, created_at, content = '{}', tags = []) =>
    finalizeEvent({ kind, tags, content, created_at }, hexToBytes(sk));

/** relays: url -> { events, eose: bool, fail: bool } */
const opener = (relays) => (url) => {
    const r = relays[url] || {};
    return {
        async connect() { if (r.fail) throw new Error('down'); },
        subscribe(_id, _f, onEvent, onEose) {
            queueMicrotask(() => { for (const e of r.events || []) onEvent(e); if (r.eose !== false) onEose(); });
        },
        unsubscribe() {}, close() {},
    };
};

describe('fetchProfile', () => {
    it('newest wins; tie goes to lowest id', async () => {
        const a = await sign(SK, 0, 100, '{"name":"a"}');
        const b = await sign(SK, 0, 100, '{"name":"b"}');
        const old = await sign(SK, 0, 50, '{"name":"old"}');
        const low = a.id < b.id ? a : b;
        expect(pickNewest([old, a, b]).id).toBe(low.id);
        const res = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'],
            openRelay: opener({ 'wss://1': { events: [old, a] }, 'wss://2': { events: [b] } }) });
        expect(res.state).toBe('confirmed');
        expect(res.event.id).toBe(low.id);
        expect(res.content.name).toBe(low === a ? 'a' : 'b');
    });

    it('drops a bad signature and a wrong pubkey', async () => {
        const good = await sign(SK, 0, 10, '{"name":"good"}');
        const forged = { ...(await sign(SK, 0, 999, '{"name":"x"}')), content: '{"name":"evil"}' };
        const other = await sign(SK2, 0, 999, '{"name":"other"}');
        const res = await fetchProfile({ pubkey: PK, urls: ['wss://1'],
            openRelay: opener({ 'wss://1': { events: [forged, other, good] } }) });
        expect(res.event.id).toBe(good.id);
        expect(await isOwnEvent(forged, PK, 0)).toBe(false);
        expect(await isOwnEvent(other, PK, 0)).toBe(false);
    });

    it('none only when every relay answered empty; partial when some did not; unreachable when none did', async () => {
        const all = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'],
            openRelay: opener({ 'wss://1': { events: [] }, 'wss://2': { events: [] } }) });
        expect(all.state).toBe('none');
        const partial = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'], timeoutMs: 30,
            openRelay: opener({ 'wss://1': { events: [] }, 'wss://2': { eose: false } }) });
        expect(partial.state).toBe('partial');
        expect(partial.answered).toBe(1);
        const refused = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'],
            openRelay: opener({ 'wss://1': { events: [] }, 'wss://2': { fail: true } }) });
        expect(refused.state).toBe('partial');
        const good = await sign(SK, 0, 10, '{"name":"g"}');
        const conf = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'], timeoutMs: 30,
            openRelay: opener({ 'wss://1': { events: [good] }, 'wss://2': { eose: false } }) });
        expect(conf.state).toBe('confirmed');
        const un = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'], timeoutMs: 30,
            openRelay: opener({ 'wss://1': { fail: true }, 'wss://2': { eose: false } }) });
        expect(un.state).toBe('unreachable');
        const empty = await fetchProfile({ pubkey: PK, urls: [], openRelay: opener({}) });
        expect(empty.state).toBe('unreachable');
    });

    it('a forged copy reusing the genuine id cannot displace the real event', async () => {
        const good = await sign(SK, 0, 10, '{"name":"good"}');
        const forged = { ...good, content: '{"name":"evil"}' };
        const res = await fetchProfile({ pubkey: PK, urls: ['wss://1', 'wss://2'],
            openRelay: opener({ 'wss://1': { events: [good] }, 'wss://2': { events: [forged] } }) });
        expect(res.state).toBe('confirmed');
        expect(res.content.name).toBe('good');
        const rev = await fetchProfile({ pubkey: PK, urls: ['wss://1'],
            openRelay: opener({ 'wss://1': { events: [forged, good] } }) });
        expect(rev.content.name).toBe('good');
    });

    it('drops oversized events and caps the count per relay', async () => {
        const big = await sign(SK, 0, 10, JSON.stringify({ about: 'x'.repeat(70 * 1024) }));
        const res = await fetchProfile({ pubkey: PK, urls: ['wss://1'],
            openRelay: opener({ 'wss://1': { events: [big] } }) });
        expect(res.state).toBe('none');
        const many = [];
        for (let i = 0; i < 25; i++) many.push(await sign(SK2, 0, i));
        const good = await sign(SK, 0, 1, '{"name":"late"}');
        const capped = await fetchProfile({ pubkey: PK, urls: ['wss://1'],
            openRelay: opener({ 'wss://1': { events: [...many, good] } }) });
        expect(capped.state).toBe('none');
    });

    it('returns the newest verified kind 10002', async () => {
        const r1 = await sign(SK, 10002, 5, '', [['r', 'wss://a']]);
        const r2 = await sign(SK, 10002, 6, '', [['r', 'wss://b']]);
        const res = await fetchProfile({ pubkey: PK, urls: ['wss://1'],
            openRelay: opener({ 'wss://1': { events: [r1, r2] } }) });
        expect(res.state).toBe('none');
        expect(res.relayListEvent.id).toBe(r2.id);
    });

    it('rejects a malformed pubkey', async () => {
        await expect(fetchProfile({ pubkey: 'npub1x', urls: [], openRelay: opener({}) })).rejects.toThrow();
    });
});

describe('isNewerRelayList', () => {
    it('stores only when newer', () => {
        expect(isNewerRelayList({ created_at: 5, id: 'b' }, null)).toBe(true);
        expect(isNewerRelayList({ created_at: 5, id: 'b' }, { created_at: 6, id: 'a' })).toBe(false);
        expect(isNewerRelayList({ created_at: 7, id: 'b' }, { created_at: 6, id: 'a' })).toBe(true);
        expect(isNewerRelayList({ created_at: 6, id: 'b' }, { created_at: 6, id: 'a' })).toBe(false);
        expect(isNewerRelayList(null, null)).toBe(false);
    });
});

describe('relay cap applies after the mode filter', () => {
    it('write relays survive 25 read-only relays listed first', async () => {
        const relays = [];
        for (let i = 0; i < 25; i++) relays.push({ url: `wss://r${i}.example`, read: true, write: false });
        relays.push({ url: 'wss://w.example', read: false, write: true });
        expect(await selectRelayUrls('write', [{ relays }], 0)).toEqual(['wss://w.example']);
        expect(await selectRelayUrls('read', [{ relays }], 0)).toHaveLength(20);
    });
});

describe('profile.fetch wiring', () => {
    const src = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');
    it('is gated to extension pages and uses write relays', () => {
        const gate = src.slice(src.indexOf('const SENSITIVE_KINDS'), src.indexOf('function isExtensionSender'));
        expect(gate).toContain("'profile.fetch'");
        expect(src).toMatch(/selectRelayUrls\('write', await get\('profiles'\), index, \{ pubkey: pk \}\)/);
    });
});
