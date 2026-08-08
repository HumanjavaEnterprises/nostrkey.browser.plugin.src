/**
 * BG-10 — the locked gate in front of window.nostr, END TO END.
 *
 * `consent-locked-state.test.js` mirrors the gate's control flow in isolation.
 * This file drives the REAL background worker instead: every request below
 * enters through `chrome.runtime.onMessage` from a PAGE-shaped sender (a
 * content script: our extension id, a tab, and a web-page URL), exactly as
 * `window.nostr.signEvent()` reaches the worker from a website. Nothing here
 * pokes at internals — a regression in the gate shows up as a website getting
 * an answer it must not have.
 *
 * Two shapes of locked vault are covered, because they fail differently:
 *
 *   1. password blobs at rest — the key is unreadable anyway, so even a broken
 *      gate would mostly stall further down;
 *   2. DEVICE blobs at rest under an active master password (the 1.8.0 mixed
 *      state) — the key material opens without any session, so this gate is the
 *      only thing between a locked vault and a signature. The test proves the
 *      key really is readable in that state (via the extension's own getNsec)
 *      and that the web page is still refused.
 *
 * A passwordless case closes the loop: the same message, same permission grant,
 * on a vault that is not locked, really does return a decryption — so the
 * refusals above are the gate, not a harness that never worked.
 *
 * Demo material only: HEX_A / HEX_B are secp256k1 generator multiples.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { getPublicKeySync, nip44, hexToBytes } from 'nostr-crypto-utils';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { encrypt, hashPassword } from '../src/utilities/crypto.js';

const PASSWORD = 'correct horse battery staple';
const HEX_A = '0000000000000000000000000000000000000000000000000000000000000001';
const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
const PUB_A = getPublicKeySync(HEX_A);
const PUB_B = getPublicKeySync(HEX_B);
const ORIGIN = 'https://example.com';

/** The sender shape a content script has: our id, a tab, a WEB PAGE url. */
const PAGE_SENDER = {
    id: 'test-extension-id',
    tab: { id: 7, url: `${ORIGIN}/app` },
    url: `${ORIGIN}/app`,
};

/** Let the background's async startup IIFE (and any queued write) settle. */
async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

async function bootBackground(seedLocal = {}) {
    vi.resetModules();
    const env = installFakeChrome({ alarms: true });
    env.local._seed(seedLocal);
    env.setSendMessage((msg) => env.dispatch(msg));
    await import('../src/background.js');
    await settle();
    return env;
}

function profile(privKey, hosts = {}) {
    return {
        name: 'P1', privKey, pubKey: PUB_A, hosts,
        relays: [], type: 'local', bunkerUrl: null, remotePubkey: null,
    };
}

/**
 * Mint device blobs the way the extension does, in a throwaway context, and
 * hand back the `deviceKeySeed` they were wrapped under so a freshly booted
 * worker resolves the SAME device key from storage.local.
 */
async function deviceWrapped(...secrets) {
    vi.resetModules();
    const env = installFakeChrome();
    const { encryptWithDeviceKey } = await import('../src/utilities/secret-vault.js');
    const blobs = [];
    for (const s of secrets) blobs.push(await encryptWithDeviceKey(s));
    await env.flushWrites();
    const { deviceKeySeed, deviceKeyStrategy } = env.local._dump();
    delete globalThis.chrome;
    return { blobs, deviceKeySeed, deviceKeyStrategy };
}

/** A NIP-44 message from B to A, decryptable only with A's private key. */
function nip44MessageToA(plainText) {
    const conversationKey = nip44.v2.utils.getConversationKey(hexToBytes(HEX_B), PUB_A);
    return nip44.v2.encrypt(plainText, conversationKey);
}

/** The three requests a web page uses to reach the private key. */
function keyBearingRequests() {
    return [
        ['signEvent', { kind: 1, content: 'sign me', tags: [], created_at: 1700000000 }],
        ['nip04.decrypt', { pubKey: PUB_B, cipherText: 'ZmFrZQ==?iv=ZmFrZWl2' }],
        ['nip44.decrypt', { pubKey: PUB_B, cipherText: nip44MessageToA('hello') }],
    ];
}

afterEach(() => {
    vi.useRealTimers();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('BG-10 — a locked vault refuses every key-bearing window.nostr request', () => {
    it('rejects signEvent / nip04.decrypt / nip44.decrypt (password blobs at rest)', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const env = await bootBackground({
            profiles: [profile(await encrypt(HEX_A, PASSWORD))],
            profileIndex: 0,
            isEncrypted: true,
            passwordHash: hash,
            passwordSalt: salt,
            autoLockMinutes: 0,
        });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);

        for (const [kind, payload] of keyBearingRequests()) {
            const res = await env.dispatch({ kind, payload, host: ORIGIN }, PAGE_SENDER);
            expect(res, kind).toMatchObject({ error: 'locked' });
            // Never a signature, a plaintext, or a silent undefined.
            expect(res.sig, kind).toBeUndefined();
        }
    });

    it('rejects them even when the key on disk is DEVICE-wrapped and readable', async () => {
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        const { hash, salt } = await hashPassword(PASSWORD);
        const env = await bootBackground({
            profiles: [profile(blobs[0])],
            profileIndex: 0,
            isEncrypted: true,
            passwordHash: hash,
            passwordSalt: salt,
            autoLockMinutes: 0,
            deviceKeySeed,
            deviceKeyStrategy,
        });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);

        // The key material genuinely IS readable in this state — a device blob
        // needs no session — so the gate is the only thing refusing the page.
        expect(await env.dispatch({ kind: 'getNsec', payload: 0 })).toMatch(/^nsec1/);

        for (const [kind, payload] of keyBearingRequests()) {
            const res = await env.dispatch({ kind, payload, host: ORIGIN }, PAGE_SENDER);
            expect(res, kind).toMatchObject({ error: 'locked' });
        }
    });

    it('refuses a request the host is already allowed to make', async () => {
        // A standing grant must not outrank the lock: the gate runs first.
        const { hash, salt } = await hashPassword(PASSWORD);
        const grants = {
            [ORIGIN]: { 'signEvent:1': 'allow', 'nip04.decrypt': 'allow', 'nip44.decrypt': 'allow' },
        };
        const env = await bootBackground({
            profiles: [profile(await encrypt(HEX_A, PASSWORD), grants)],
            profileIndex: 0,
            isEncrypted: true,
            passwordHash: hash,
            passwordSalt: salt,
            autoLockMinutes: 0,
        });

        for (const [kind, payload] of keyBearingRequests()) {
            const res = await env.dispatch({ kind, payload, host: ORIGIN }, PAGE_SENDER);
            expect(res, kind).toMatchObject({ error: 'locked' });
        }
    });

    it('the SAME request succeeds on an unlocked (passwordless) vault', async () => {
        // Non-vacuity: the message path, the grant and the ciphertext are all
        // real — only the lock was stopping them.
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        const env = await bootBackground({
            profiles: [profile(blobs[0], { [ORIGIN]: { 'nip44.decrypt': 'allow' } })],
            profileIndex: 0,
            isEncrypted: false,
            autoLockMinutes: 0,
            deviceKeySeed,
            deviceKeyStrategy,
        });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);

        const res = await env.dispatch({
            kind: 'nip44.decrypt',
            payload: { pubKey: PUB_B, cipherText: nip44MessageToA('hello') },
            host: ORIGIN,
        }, PAGE_SENDER);
        expect(res).toBe('hello');
    });
});
