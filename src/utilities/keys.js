/**
 * Key generation utilities for Nostr
 *
 * Uses nostr-crypto-utils for all cryptographic operations.
 * Returns plain hex strings for both private and public keys.
 */

import { generateKeyPair as generateKeyPairCrypto, getPublicKeySync, bytesToHex } from 'nostr-crypto-utils';

/**
 * Generates a new Nostr keypair.
 * Returns the private key and public key as hex strings.
 */
export async function generateKeyPair() {
    const keyPair = await generateKeyPairCrypto();
    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey.hex,
    };
}

/**
 * Gets the public key from a private key (hex string).
 */
export function getPublicKeyFromPrivate(privateKeyHex) {
    return getPublicKeySync(privateKeyHex);
}

export { bytesToHex };
