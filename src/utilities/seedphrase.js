/**
 * BIP39 / NIP-06 Seed Phrase utilities for NostrKey.
 *
 * IMPORT (seed phrase -> private key) uses the STANDARD NIP-06 derivation
 * (BIP-39 seed -> BIP-32 master key -> `m/44'/1237'/0'/0/0`), so 12- and
 * 24-word phrases from Alby / nos2x / nak / nostrkey (Python) all import to
 * the same key they produce everywhere else. This mirrors
 * `nostr-nsec-seedphrase@0.8.0` (src/crypto/keys.ts).
 *
 * LEGACY compatibility: NostrKey builds before this fix used a NON-standard
 * scheme where "the 32-byte private key IS the BIP-39 entropy". That scheme is
 * bijective (a key <-> a 24-word phrase) but is NOT NIP-06 and NOT
 * interoperable with other wallets. It is preserved here as clearly-named
 * legacy functions so pre-fix NostrKey seed backups still restore.
 *
 * Uses @scure/bip39 (BIP-39) + @scure/bip32 (BIP-32 HD derivation), both from
 * the installed @scure/@noble v2 family.
 */

import {
    entropyToMnemonic,
    mnemonicToEntropy,
    mnemonicToSeedSync,
    validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import { hexToBytes, bytesToHex, getPublicKeySync } from 'nostr-crypto-utils';

/**
 * NIP-06 derivation path: `m/44'/1237'/0'/0/0` (account 0).
 * @see https://github.com/nostr-protocol/nips/blob/master/06.md
 */
export const NIP06_DERIVATION_PATH = "m/44'/1237'/0'/0/0";

/**
 * Normalize a seed phrase for validation/derivation.
 * @param {string} phrase
 * @returns {string}
 */
function normalize(phrase) {
    return String(phrase || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Derive a Nostr private key from a BIP39 seed phrase per NIP-06:
 * BIP39 seed -> BIP32 master key -> derive `m/44'/1237'/0'/0/0`.
 * @param {string} phrase - A valid BIP39 mnemonic (12 or 24 words)
 * @returns {string} hex-encoded 32-byte private key
 * @throws {Error} If the phrase is invalid or derivation fails
 */
export function deriveNip06PrivateKey(phrase) {
    const mnemonic = normalize(phrase);
    if (!validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Invalid seed phrase');
    }
    const seed = mnemonicToSeedSync(mnemonic); // 64-byte BIP39 seed
    try {
        const child = HDKey.fromMasterSeed(seed).derive(NIP06_DERIVATION_PATH);
        if (!child.privateKey || child.privateKey.length !== 32) {
            throw new Error('Failed to derive NIP-06 private key');
        }
        const hexKey = bytesToHex(child.privateKey);
        child.wipePrivateData?.();
        return hexKey;
    } finally {
        seed.fill(0); // zero sensitive material
    }
}

/**
 * LEGACY (pre-fix) derivation: the 32-byte private key IS the BIP39 entropy.
 * Only 24-word phrases (128... no — 256-bit / 32-byte entropy) yield a valid
 * private key; 12-word phrases (16-byte entropy) are rejected because they
 * cannot be a 32-byte secp256k1 key.
 *
 * NOT NIP-06, NOT interoperable. Kept solely to recover identities created by
 * NostrKey before the NIP-06 fix.
 * @param {string} phrase - A 24-word BIP39 mnemonic
 * @returns {string} hex-encoded 32-byte private key
 * @throws {Error} If the phrase is invalid or not 32 bytes of entropy
 */
export function deriveLegacyPrivateKey(phrase) {
    const mnemonic = normalize(phrase);
    if (!validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Invalid seed phrase');
    }
    const entropy = mnemonicToEntropy(mnemonic, wordlist);
    if (entropy.length !== 32) {
        entropy.fill?.(0);
        throw new Error('Legacy recovery requires a 24-word phrase');
    }
    const hexKey = bytesToHex(entropy);
    entropy.fill?.(0);
    return hexKey;
}

/**
 * Import a BIP39 mnemonic to a Nostr key.
 *
 * Uses the STANDARD NIP-06 derivation as the primary result. Because a legacy
 * NostrKey backup is also a syntactically valid mnemonic (NIP-06 will happily
 * derive a *different* key from it), the legacy candidate is also computed when
 * possible and returned so callers can offer "recover legacy NostrKey backup".
 *
 * @param {string} phrase - 12- or 24-word BIP39 mnemonic
 * @returns {{ hexKey: string, pubKey: string, derivation: 'nip06',
 *            legacy?: { hexKey: string, pubKey: string } }}
 * @throws {Error} If the phrase is not a valid BIP39 mnemonic
 */
export function seedPhraseToKey(phrase) {
    const hexKey = deriveNip06PrivateKey(phrase);
    const pubKey = getPublicKeySync(hexKey);
    const result = { hexKey, pubKey, derivation: 'nip06' };

    // Best-effort legacy candidate (24-word phrases only). Never let a legacy
    // failure block the standard NIP-06 import.
    try {
        const legacyHex = deriveLegacyPrivateKey(phrase);
        result.legacy = { hexKey: legacyHex, pubKey: getPublicKeySync(legacyHex) };
    } catch {
        /* no legacy candidate for this phrase */
    }
    return result;
}

/**
 * Import a BIP39 mnemonic using ONLY the legacy entropy-as-key scheme, to
 * recover a pre-fix NostrKey backup.
 * @param {string} phrase - 24-word BIP39 mnemonic
 * @returns {{ hexKey: string, pubKey: string, derivation: 'legacy' }}
 */
export function seedPhraseToKeyLegacy(phrase) {
    const hexKey = deriveLegacyPrivateKey(phrase);
    return { hexKey, pubKey: getPublicKeySync(hexKey), derivation: 'legacy' };
}

/**
 * Convert a hex private key to a 24-word BIP39 mnemonic using the LEGACY
 * entropy-as-key encoding (the only reversible key->phrase mapping; NIP-06 is
 * one-way and cannot be inverted for an arbitrary stored key).
 *
 * WARNING: the resulting phrase is a NostrKey recovery code, NOT an
 * interoperable NIP-06 phrase — importing it into another wallet's NIP-06 flow
 * derives a DIFFERENT key. Within NostrKey, re-import via the legacy candidate.
 * @param {string} hexKey - 64-char hex private key
 * @returns {string} 24-word mnemonic
 */
export function keyToSeedPhrase(hexKey) {
    const bytes = hexToBytes(hexKey);
    return entropyToMnemonic(bytes, wordlist);
}

/**
 * Validate a BIP39 mnemonic (checksum + wordlist).
 * @param {string} phrase
 * @returns {boolean}
 */
export function isValidSeedPhrase(phrase) {
    try {
        return validateMnemonic(normalize(phrase), wordlist);
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
