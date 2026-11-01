// @vitest-environment jsdom
/**
 * The real window.nostr, against the replies the extension sends it.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const PUBKEY = 'b'.repeat(64);
const EVENT = { kind: 1, created_at: 1800000000, tags: [], content: 'x' };

const METHODS = [
    ['getPublicKey', 'getPubKey', () => window.nostr.getPublicKey()],
    ['signEvent', 'signEvent', () => window.nostr.signEvent(EVENT)],
    ['getRelays', 'getRelays', () => window.nostr.getRelays()],
    ['addRelay', 'addRelay', () => window.nostr.addRelay('wss://relay.example.com')],
    ['nip04.encrypt', 'nip04.encrypt', () => window.nostr.nip04.encrypt(PUBKEY, 'x')],
    ['nip04.decrypt', 'nip04.decrypt', () => window.nostr.nip04.decrypt(PUBKEY, 'x')],
    ['nip44.encrypt', 'nip44.encrypt', () => window.nostr.nip44.encrypt(PUBKEY, 'x')],
    ['nip44.decrypt', 'nip44.decrypt', () => window.nostr.nip44.decrypt(PUBKEY, 'x')],
];

/** Start a call and answer it the way the content script does. */
async function replied(call, kind, payload) {
    const post = vi.spyOn(window, 'postMessage').mockImplementation(() => {});
    const answer = call();
    await Promise.resolve();
    const sent = post.mock.calls.find(([message]) => message.kind === kind);
    post.mockRestore();
    window.dispatchEvent(new MessageEvent('message', {
        source: window,
        data: { kind: `return_${kind}`, reqId: sent[0].reqId, payload, token: null },
    }));
    return answer;
}

beforeEach(async () => {
    vi.resetModules();
    await import('../src/nostr.js');
});

afterEach(() => {
    vi.restoreAllMocks();
    delete window.nostr;
});

describe('a reply carrying an error rejects', () => {
    for (const [name, kind, call] of METHODS) {
        it(name, async () => {
            await expect(replied(call, kind, { error: 'rate_limited', message: 'x' })).rejects.toThrow(/too many requests/i);
        });
    }

    for (const [code, words] of [
        ['invalid_request', /not valid/i],
        ['request_too_large', /too large/i],
        ['rate_limited', /too many requests/i],
        ['locked', /locked/i],
        ['request_failed', /could not be completed/i],
        ['connection_error', /could not reach/i],
    ]) {
        it(`${code} keeps its code`, async () => {
            const [, kind, call] = METHODS[1];
            const error = await replied(call, kind, { error: code, message: 'detail' }).catch(e => e);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toMatch(words);
            expect(error.code).toBe(code);
        });
    }

    it('anything else reads as a plain failure, and no detail reaches the page', async () => {
        const [, kind, call] = METHODS[1];
        const error = await replied(call, kind, { error: 'constructor', message: 'relay wss://internal failed' }).catch(e => e);
        expect(error.code).toBe('request_failed');
        expect(error.message).not.toContain('internal');
        expect(error.message).not.toContain('constructor');
    });
});

describe('a reply with no error resolves as it came', () => {
    const SIGNED = { ...EVENT, id: 'a'.repeat(64), pubkey: PUBKEY, sig: 'c'.repeat(128) };
    for (const [name, value, method] of [
        ['a signed event', SIGNED, 1],
        ['a key', PUBKEY, 0],
        ['text', 'ciphertext', 4],
        ['a declined request', undefined, 1],
        ['a relay list', { 'wss://relay.example.com': { read: true, write: true } }, 2],
        ['a relay list holding a relay named error', { error: { read: true, write: false } }, 2],
    ]) {
        it(name, async () => {
            const [, kind, call] = METHODS[method];
            await expect(replied(call, kind, value)).resolves.toEqual(value);
        });
    }
});

describe('how long a page waits', () => {
    const PAGE_TIMEOUT_MS = 300_000;

    it('still takes an answer just before the limit', async () => {
        vi.useFakeTimers();
        const post = vi.spyOn(window, 'postMessage').mockImplementation(() => {});
        const answer = window.nostr.getPublicKey();
        await Promise.resolve();
        const { reqId } = post.mock.calls[0][0];
        await vi.advanceTimersByTimeAsync(PAGE_TIMEOUT_MS - 1);
        window.dispatchEvent(new MessageEvent('message', {
            source: window,
            data: { kind: 'return_getPubKey', reqId, payload: PUBKEY, token: null },
        }));
        await expect(answer).resolves.toBe(PUBKEY);
        vi.useRealTimers();
    });

    it('gives up at the limit, with a code of its own', async () => {
        vi.useFakeTimers();
        vi.spyOn(window, 'postMessage').mockImplementation(() => {});
        const answer = window.nostr.getPublicKey().catch(e => e);
        await vi.advanceTimersByTimeAsync(PAGE_TIMEOUT_MS);
        const error = await answer;
        expect(error.message).toBe('NostrKey: request timed out');
        expect(error.code).toBe('timed_out');
        vi.useRealTimers();
    });
});

