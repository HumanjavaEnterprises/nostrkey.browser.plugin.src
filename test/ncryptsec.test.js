/**
 * NIP-49 password-encrypted keys through the real worker.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { bootUnlocked, bootWorker, localProfile, HEX_A } from './helpers/boot-worker.js';

// The worked example in NIP-49.
const SPEC = {
    ncryptsec: 'ncryptsec1qgg9947rlpvqu76pj5ecreduf9jxhselq2nae2kghhvd5g7dgjtcxfqtd67p9m0w57lspw8gsq6yphnm8623nsl8xn9j4jdzz84zm3frztj3z7s35vpzmqf6ksu8r89qk5z2zxfmu5gv8th8wclt0h4p',
    password: 'nostr',
    hexKey: '3501454135014541350145413501453fefb02227e449e57cf4d3a3ce05378683',
};

afterEach(() => { delete globalThis.chrome; });

const encrypt = (env, password) => env.dispatch({ kind: 'ncryptsec.encrypt', payload: { profileIndex: 0, password } });
const decrypt = (env, ncryptsec, password) => env.dispatch({ kind: 'ncryptsec.decrypt', payload: { ncryptsec, password } });

describe('ncryptsec', () => {
    it('opens the worked example from the spec', async () => {
        const env = await bootUnlocked();
        expect(await decrypt(env, SPEC.ncryptsec, SPEC.password)).toEqual({ success: true, hexKey: SPEC.hexKey });
    });

    it('seals the profile key so its password, and only that, opens it', async () => {
        const env = await bootUnlocked();
        const sealed = await encrypt(env, 'first password');
        expect(sealed.success).toBe(true);
        expect(sealed.ncryptsec).toMatch(/^ncryptsec1[a-z0-9]+$/);

        expect(await decrypt(env, sealed.ncryptsec, 'first password')).toEqual({ success: true, hexKey: HEX_A });
        expect((await decrypt(env, sealed.ncryptsec, 'second password')).success).toBe(false);
        expect((await decrypt(env, sealed.ncryptsec, 'x')).success).toBe(false);
    });

    it('refuses text that is not an ncryptsec', async () => {
        const env = await bootUnlocked();
        expect((await decrypt(env, 'nsec1notanencryptedkey', 'pw')).success).toBe(false);
    });

    it('a remote signer profile has no key to seal', async () => {
        const env = await bootWorker({ profiles: [localProfile('', {}, { type: 'bunker' })], profileIndex: 0 });
        expect(await encrypt(env, 'pw')).toEqual({ success: false, error: 'Cannot export bunker profile as ncryptsec' });
    });
});
