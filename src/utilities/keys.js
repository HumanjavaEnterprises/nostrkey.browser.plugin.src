/**
 * Key generation utilities for Nostr
 * 
 * Uses schnorr-specific functions from @noble/curves as required by NIP-01.
 * This ensures proper key generation compatible with the Nostr protocol.
 */

import { schnorr } from '@noble/curves/secp256k1.js';
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js';

/**
 * Generates a new Nostr keypair using schnorr functions.
 * Returns the private key as hex string and public key as hex string.
 */
export async function generateKeyPair() {
    const privateKeyBytes = randomBytes(32);
    const publicKeyBytes = schnorr.getPublicKey(privateKeyBytes);
    
    return {
        privateKey: bytesToHex(privateKeyBytes),
        publicKey: bytesToHex(publicKeyBytes)
    };
}

/**
 * Gets the public key from a private key (hex string).
 * Uses schnorr.getPublicKey as required by Nostr/BIP340.
 */
export function getPublicKeyFromPrivate(privateKeyHex) {
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const publicKeyBytes = schnorr.getPublicKey(privateKeyBytes);
    return bytesToHex(publicKeyBytes);
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
    if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

export { bytesToHex };
