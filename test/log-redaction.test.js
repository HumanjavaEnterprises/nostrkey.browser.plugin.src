/**
 * What the worker writes to its log. Real worker; demo values only.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { bootUnlocked, settle, HEX_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER } from './helpers/boot-worker.js';

const SECRET = 'demo-connect-secret-value';
const CONNECTION = `bunker://${'a'.repeat(64)}?relay=wss%3A%2F%2Frelay.example.com&secret=${SECRET}`;
const PASSWORD = 'demo-password-value';
const WORDS = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.chrome;
    delete globalThis.browser;
});

const logged = (spy) => JSON.stringify(spy.mock.calls);

describe('a message that carries a secret is logged by kind only', () => {
    for (const [kind, payload, needle] of [
        ['bunker.connect', { profileIndex: 0, bunkerUrl: CONNECTION }, SECRET],
        ['bunker.validateUrl', CONNECTION, SECRET],
        ['copy', CONNECTION, SECRET],
        ['seedPhrase.toKey', WORDS, 'abandon'],
        ['seedPhrase.validate', WORDS, 'abandon'],
        ['calcPubKey', HEX_A, HEX_A],
        ['ncryptsec.encrypt', { profileIndex: 0, password: PASSWORD }, PASSWORD],
        ['ncryptsec.decrypt', { ncryptsec: 'ncryptsec1demo', password: PASSWORD }, PASSWORD],
    ]) {
        it(kind, async () => {
            const env = await bootUnlocked();
            const spy = vi.spyOn(console, 'log');
            await env.dispatch({ kind, payload }, PERMISSION_SENDER);
            await settle(10);
            expect(logged(spy)).toContain(kind);
            expect(logged(spy)).not.toContain(needle);
        });
    }

    it('a kind with nothing secret in it is still logged whole', async () => {
        const env = await bootUnlocked();
        const spy = vi.spyOn(console, 'log');
        await env.dispatch({ kind: 'bunker.status', payload: 0 }, PERMISSION_SENDER);
        expect(spy.mock.calls.some(call => call.some(arg => arg?.kind === 'bunker.status' && arg.payload === 0))).toBe(true);
    });
});

describe('text being encrypted or decrypted is left out of the log', () => {
    const PUBKEY = 'b'.repeat(64);
    const TEXT = 'demo-message-text';

    for (const [kind, field] of [
        ['nip04.encrypt', 'plainText'],
        ['nip04.decrypt', 'cipherText'],
        ['nip44.encrypt', 'plainText'],
        ['nip44.decrypt', 'cipherText'],
    ]) {
        it(`${kind} logs its host and peer, not its text`, async () => {
            const env = await bootUnlocked();
            const spy = vi.spyOn(console, 'log');
            env.dispatch({ kind, host: ORIGIN, payload: { pubKey: PUBKEY, [field]: TEXT } }, PAGE_SENDER);
            await settle(10);
            expect(logged(spy)).toContain(kind);
            expect(logged(spy)).toContain(PUBKEY);
            expect(logged(spy)).not.toContain(TEXT);
        });
    }

    it('a payload with no text fields is not touched', async () => {
        const env = await bootUnlocked();
        const spy = vi.spyOn(console, 'log');
        env.dispatch({ kind: 'nip44.encrypt', host: ORIGIN }, PAGE_SENDER);
        await settle(10);
        expect(logged(spy)).toContain('nip44.encrypt');
    });
});
