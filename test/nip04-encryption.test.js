/**
 * NIP-04 through the real worker, against a fixed ciphertext and against an
 * independent AES-256-CBC built from node:crypto. Deprecated, and still answered
 * for older clients.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { createCipheriv, createDecipheriv, createECDH } from 'node:crypto';
import { bootWorker, deviceWrapped, localProfile, ORIGIN, PAGE_SENDER } from './helpers/boot-worker.js';
import { getPublicKeySync } from 'nostr-crypto-utils';

const OURS = '91ba716fa9e7ea2fcbad360cf4f8e0d312f73984da63d90f524ad61a6a1e7dbe';
const THEIRS = '96f6fa197aa07477ab88f6981118466ae3a982faab8ad5db9d5426870c73d220';
const THEIR_PUB = getPublicKeySync(THEIRS);
// 'nanana' to those two keys, sealed by node:crypto with a fixed iv.
const FIXED = 'fslZeA+1UyhFrYHe5u/FMA==?iv=BwcHBwcHBwcHBwcHBwcHBw==';

const GRANTS = { [ORIGIN]: { 'nip04.encrypt': 'allow', 'nip04.decrypt': 'allow' } };

afterEach(() => { delete globalThis.chrome; });

async function boot() {
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(OURS);
    return bootWorker({
        profiles: [localProfile(blobs[0], GRANTS, { pubKey: getPublicKeySync(OURS) })],
        profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
}

/** The shared secret: the x coordinate of ECDH on secp256k1, not hashed. */
function sharedSecret() {
    const ecdh = createECDH('secp256k1');
    ecdh.setPrivateKey(THEIRS, 'hex');
    return ecdh.computeSecret(Buffer.from(`02${getPublicKeySync(OURS)}`, 'hex'));
}

const send = (env, kind, payload) => env.dispatch({ kind, host: ORIGIN, payload }, PAGE_SENDER);

describe('NIP-04', () => {
    it('opens a fixed ciphertext', async () => {
        const env = await boot();
        expect(await send(env, 'nip04.decrypt', { pubKey: THEIR_PUB, cipherText: FIXED })).toBe('nanana');
    });

    it('what it seals, plain AES-256-CBC opens', async () => {
        const env = await boot();
        const sealed = await send(env, 'nip04.encrypt', { pubKey: THEIR_PUB, plainText: 'hello from the worker' });
        expect(sealed).toMatch(/^[A-Za-z0-9+/=]+\?iv=[A-Za-z0-9+/=]+$/);
        const [body, iv] = sealed.split('?iv=');
        const decipher = createDecipheriv('aes-256-cbc', sharedSecret(), Buffer.from(iv, 'base64'));
        expect(decipher.update(body, 'base64', 'utf8') + decipher.final('utf8')).toBe('hello from the worker');
    });

    it('opens what plain AES-256-CBC sealed', async () => {
        const env = await boot();
        const iv = Buffer.alloc(16, 7);
        const cipher = createCipheriv('aes-256-cbc', sharedSecret(), iv);
        const body = cipher.update('hello from node', 'utf8', 'base64') + cipher.final('base64');
        const cipherText = `${body}?iv=${iv.toString('base64')}`;
        expect(await send(env, 'nip04.decrypt', { pubKey: THEIR_PUB, cipherText })).toBe('hello from node');
    });
});
