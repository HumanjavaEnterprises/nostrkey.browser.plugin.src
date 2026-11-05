import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

globalThis.browser = globalThis.browser || { runtime: { getURL: (p) => p }, storage: { local: { get: async () => ({}), set: async () => {} } } };
const { RelayConnection, publishToRelays } = await import('../src/utilities/nip46.js');

/** A fake relay socket: records sent frames, lets the test answer. */
function fakeRelay(url, answer) {
    const relay = new RelayConnection(url);
    const sent = [];
    relay.ws = {
        send(frame) {
            sent.push(JSON.parse(frame));
            const [, ev] = JSON.parse(frame);
            const reply = answer?.(ev);
            if (reply) queueMicrotask(() => relay.handleMessage(reply));
        },
        close() {},
    };
    relay.connected = true;
    relay.sent = sent;
    return relay;
}

const ev = { id: 'e'.repeat(64), kind: 0, content: '{}', tags: [] };

describe('RelayConnection.publish waits for NIP-01 OK', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('ok: true', async () => {
        const r = fakeRelay('wss://ok', e => ['OK', e.id, true, '']);
        await expect(r.publish(ev)).resolves.toEqual({ url: 'wss://ok', ok: true, message: '' });
        expect(r.sent[0]).toEqual(['EVENT', ev]);
        expect(r.pendingOks.size).toBe(0);
    });

    it('ok: false carries the relay message', async () => {
        const r = fakeRelay('wss://no', e => ['OK', e.id, false, 'blocked: not allowed']);
        await expect(r.publish(ev)).resolves.toEqual({ url: 'wss://no', ok: false, message: 'blocked: not allowed' });
    });

    it('an OK for another event id does not answer this one', async () => {
        const r = fakeRelay('wss://other', () => ['OK', 'f'.repeat(64), true, '']);
        const p = r.publish(ev, { timeoutMs: 1000 });
        await vi.advanceTimersByTimeAsync(1000);
        await expect(p).resolves.toEqual({ url: 'wss://other', ok: false, message: 'timeout' });
    });

    it('silence times out per relay', async () => {
        const r = fakeRelay('wss://silent', () => null);
        const p = r.publish(ev, { timeoutMs: 500 });
        await vi.advanceTimersByTimeAsync(499);
        expect(r.pendingOks.size).toBe(1);
        await vi.advanceTimersByTimeAsync(1);
        await expect(p).resolves.toEqual({ url: 'wss://silent', ok: false, message: 'timeout' });
        expect(r.pendingOks.size).toBe(0);
    });

    it('close settles waiting publishes', async () => {
        const r = fakeRelay('wss://closing', () => null);
        const p = r.publish(ev);
        r.close();
        await expect(p).resolves.toEqual({ url: 'wss://closing', ok: false, message: 'connection closed' });
    });

    it('still throws synchronously when not connected (existing callers rely on it)', () => {
        const r = new RelayConnection('wss://down');
        expect(() => r.publish(ev)).toThrow('Not connected');
    });
});

describe('publishToRelays', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('reports each relay: ok, refused, silent, not connected', async () => {
        const relays = [
            fakeRelay('wss://a', e => ['OK', e.id, true, '']),
            fakeRelay('wss://b', e => ['OK', e.id, false, 'rate-limited: slow down']),
            fakeRelay('wss://c', () => null),
            new RelayConnection('wss://d'),
        ];
        const p = publishToRelays(relays, ev, { timeoutMs: 300 });
        await vi.advanceTimersByTimeAsync(300);
        const res = await p;
        expect(res).toEqual([
            { url: 'wss://a', ok: true, message: '' },
            { url: 'wss://b', ok: false, message: 'rate-limited: slow down' },
            { url: 'wss://c', ok: false, message: 'timeout' },
            { url: 'wss://d', ok: false, message: 'Not connected' },
        ]);
        expect(res.filter(r => r.ok).length).toBe(1);
    });
});

describe('P1/P2 confirmation hardening', () => {
    it('caps the OK message at 200 characters', async () => {
        const r = fakeRelay('wss://long', e => ['OK', e.id, false, 'x'.repeat(5000)]);
        const res = await r.publish(ev);
        expect(res.message).toHaveLength(200);
    });
    it('refuses an event with no id', () => {
        const r = fakeRelay('wss://noid');
        expect(() => r.publish({ kind: 1, tags: [] })).toThrow(/no id/);
        expect(r.pendingOks.size).toBe(0);
    });
    it('an unexpected socket close fails pending publishes at once', async () => {
        const OrigWS = globalThis.WebSocket;
        let sock;
        globalThis.WebSocket = class { constructor() { sock = this; queueMicrotask(() => this.onopen()); } send() {} close() {} };
        try {
            const r = new RelayConnection('wss://drop');
            r.maxReconnectAttempts = 0;
            await r.connect();
            const p = r.publish(ev);
            sock.onclose();
            await expect(p).resolves.toEqual({ url: 'wss://drop', ok: false, message: 'connection closed' });
            expect(r.pendingOks.size).toBe(0);
        } finally {
            globalThis.WebSocket = OrigWS;
        }
    });
});
