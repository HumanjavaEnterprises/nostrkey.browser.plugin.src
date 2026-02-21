/**
 * BIP39 Seed Phrase utilities for NostrKey.
 *
 * Implements the same algorithm as `nostr-nsec-seedphrase`:
 * the 32-byte private key IS the BIP39 entropy (bidirectional encoding).
 *
 * Uses @scure/bip39 (already a transitive dep of nostr-tools).
 */

import { entropyToMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { hexToBytes, bytesToHex, getPublicKeySync } from 'nostr-crypto-utils';

/**
 * Convert a hex private key to a 24-word BIP39 mnemonic.
 * @param {string} hexKey - 64-char hex private key
 * @returns {string} 24-word mnemonic
 */
export function keyToSeedPhrase(hexKey) {
    const bytes = hexToBytes(hexKey);
    return entropyToMnemonic(bytes, wordlist);
}

/**
 * Convert a BIP39 mnemonic back to a hex private key + derived pubkey.
 * @param {string} phrase - 24-word mnemonic
 * @returns {{ hexKey: string, pubKey: string }}
 */
export function seedPhraseToKey(phrase) {
    const entropy = mnemonicToEntropy(phrase.trim().toLowerCase(), wordlist);
    const hexKey = bytesToHex(entropy);
    const pubKey = getPublicKeySync(hexKey);
    return { hexKey, pubKey };
}

/**
 * Validate a BIP39 mnemonic (checksum + wordlist).
 * @param {string} phrase
 * @returns {boolean}
 */
export function isValidSeedPhrase(phrase) {
    try {
        return validateMnemonic(phrase.trim().toLowerCase(), wordlist);
    } catch {
        return false;
    }
}

/**
 * Fast heuristic: does the input look like it could be a seed phrase?
 * (12+ space-separated alphabetic words)
 * @param {string} input
 * @returns {boolean}
 */
export function looksLikeSeedPhrase(input) {
    if (!input || typeof input !== 'string') return false;
    const words = input.trim().split(/\s+/);
    return words.length >= 12 && words.every(w => /^[a-zA-Z]+$/.test(w));
}
