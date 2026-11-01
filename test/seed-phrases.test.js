/**
 * Seed phrase messages on the real worker. The key derivations themselves are
 * pinned to vectors in seedphrase-nip06.test.js.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { bootUnlocked, bootWorker, localProfile, HEX_A } from './helpers/boot-worker.js';

const TWELVE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const TWENTY_FOUR = `${'abandon '.repeat(23)}art`;

afterEach(() => { delete globalThis.chrome; });

describe('seedPhrase.validate', () => {
    it.each([
        ['twelve words', TWELVE],
        ['twenty-four words', TWENTY_FOUR],
        ['extra spaces and capitals', `  ${TWELVE.toUpperCase().replace(/ /g, '  ')}  `],
    ])('accepts %s', async (_, payload) => {
        const env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'seedPhrase.validate', payload })).toBe(true);
    });

    it.each([
        ['a bad checksum', 'abandon '.repeat(12).trim()],
        ['a word off the list', TWELVE.replace('about', 'zzzzz')],
        ['too few words', 'abandon abandon abandon'],
        ['an empty string', ''],
        ['not a string', 42],
    ])('refuses %s', async (_, payload) => {
        const env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'seedPhrase.validate', payload })).toBe(false);
    });
});

describe('seedPhrase.fromKey and seedPhrase.toKey', () => {
    it('a key written as words comes back through the legacy reading', async () => {
        const env = await bootUnlocked();
        const { success, seedPhrase } = await env.dispatch({ kind: 'seedPhrase.fromKey', payload: 0 });
        expect(success).toBe(true);
        expect(seedPhrase.split(' ')).toHaveLength(24);
        const back = await env.dispatch({ kind: 'seedPhrase.toKey', payload: { phrase: seedPhrase, mode: 'legacy' } });
        expect(back).toMatchObject({ success: true, hexKey: HEX_A, derivation: 'legacy' });
    });

    it('refuses a phrase that does not validate', async () => {
        const env = await bootUnlocked();
        expect((await env.dispatch({ kind: 'seedPhrase.toKey', payload: 'abandon abandon abandon' })).success).toBe(false);
    });

    it('a remote signer profile has no key to write out', async () => {
        const env = await bootWorker({ profiles: [localProfile('', {}, { type: 'bunker' })], profileIndex: 0 });
        expect(await env.dispatch({ kind: 'seedPhrase.fromKey', payload: 0 }))
            .toEqual({ success: false, error: 'Cannot export bunker profile as seed phrase' });
    });
});
