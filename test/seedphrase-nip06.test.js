/**
 * NIP-06 seed phrase derivation.
 *
 * Real tests that import the actual src (not mocks):
 *   (a) standard NIP-06 vector reproduces the canonical privkey + npub
 *   (b) a 12-word phrase imports without crashing
 *   (c) the legacy (entropy-as-key) path still recovers old NostrKey backups
 */

import { describe, it, expect } from 'vitest';
import {
    seedPhraseToKey,
    seedPhraseToKeyLegacy,
    keyToSeedPhrase,
    deriveNip06PrivateKey,
    isValidSeedPhrase,
} from '../src/utilities/seedphrase.js';

// Canonical shared vectors (nostr-nsec-seedphrase/test/vectors/nostr-vectors.json)
const NIP06_V1 = {
    mnemonic: 'leader monkey parrot ring guide accident before fence cannon height naive bean',
    privateKey: '7f7ff03d123792d6ac594bfa67bf6d0c0ab55b6b1fdb6249303fe861f1ccba9a',
    xonlyPubkey: '17162c921dc4d2518f9a101db33695df1afb56ab82f5ff3e5da6eec3ca5cd917',
};
const NIP06_V2 = {
    mnemonic: 'what bleak badge arrange retreat wolf trade produce cricket blur garlic valid proud rude strong choose busy staff weather area salt hollow arm fade',
    privateKey: 'c15d739894c81a2fcfd3a2df85a0d2c0dbc47a280d092799f144d73d7ae78add',
    xonlyPubkey: 'd41b22899549e1f3d335a31002cfd382174006e166d3e658e3a5eecdb6463573',
};
// Legacy NostrKey scheme = private key IS the BIP-39 entropy (24-word only).
// A valid 32-byte secp256k1 scalar; keyToSeedPhrase encodes it as 24 words.
const LEGACY_KEY = '7f7ff03d123792d6ac594bfa67bf6d0c0ab55b6b1fdb6249303fe861f1ccba9a';

describe('NIP-06 seed phrase derivation', () => {
    it('(a) reproduces the canonical NIP-06 vector 1 privkey + pubkey', () => {
        const { hexKey, pubKey, derivation } = seedPhraseToKey(NIP06_V1.mnemonic);
        expect(hexKey).toBe(NIP06_V1.privateKey);
        expect(pubKey).toBe(NIP06_V1.xonlyPubkey);
        expect(derivation).toBe('nip06');
    });

    it('(a2) reproduces the canonical NIP-06 vector 2 (24-word)', () => {
        const { hexKey, pubKey } = seedPhraseToKey(NIP06_V2.mnemonic);
        expect(hexKey).toBe(NIP06_V2.privateKey);
        expect(pubKey).toBe(NIP06_V2.xonlyPubkey);
    });

    it('deriveNip06PrivateKey matches the vector directly', () => {
        expect(deriveNip06PrivateKey(NIP06_V1.mnemonic)).toBe(NIP06_V1.privateKey);
    });

    it('(b) a 12-word phrase imports without crashing', () => {
        const twelve = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        expect(isValidSeedPhrase(twelve)).toBe(true);
        const result = seedPhraseToKey(twelve);
        expect(result.hexKey).toMatch(/^[0-9a-f]{64}$/);
        expect(result.pubKey).toMatch(/^[0-9a-f]{64}$/);
    });

    it('normalizes whitespace/case on import', () => {
        const messy = '  LEADER  monkey parrot ring guide accident before fence cannon height naive bean ';
        expect(seedPhraseToKey(messy).hexKey).toBe(NIP06_V1.privateKey);
    });

    it('rejects an invalid mnemonic', () => {
        expect(() => seedPhraseToKey('not a real seed phrase at all nope')).toThrow();
    });
});

describe('Legacy entropy-as-key recovery', () => {
    it('(c) recovers the pre-fix NostrKey key from a 24-word backup', () => {
        // A pre-fix backup phrase = keyToSeedPhrase(privkey) (entropy-as-key).
        const backup = keyToSeedPhrase(LEGACY_KEY);
        expect(backup.trim().split(/\s+/)).toHaveLength(24);
        const { hexKey } = seedPhraseToKeyLegacy(backup);
        expect(hexKey).toBe(LEGACY_KEY);
    });

    it('legacy import != NIP-06 import for the same phrase (they diverge)', () => {
        const nip06 = seedPhraseToKey(NIP06_V2.mnemonic).hexKey;
        const legacy = seedPhraseToKeyLegacy(NIP06_V2.mnemonic).hexKey;
        expect(nip06).not.toBe(legacy);
    });

    it('seedPhraseToKey exposes a legacy candidate for 24-word phrases', () => {
        const { legacy } = seedPhraseToKey(NIP06_V2.mnemonic);
        expect(legacy).toBeDefined();
        expect(legacy.hexKey).toBe(seedPhraseToKeyLegacy(NIP06_V2.mnemonic).hexKey);
    });

    it('legacy recovery rejects a 12-word phrase (16 bytes != 32)', () => {
        const twelve = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        expect(() => seedPhraseToKeyLegacy(twelve)).toThrow();
    });

    it('keyToSeedPhrase round-trips through the legacy path', () => {
        const phrase = keyToSeedPhrase(LEGACY_KEY);
        expect(isValidSeedPhrase(phrase)).toBe(true);
        expect(seedPhraseToKeyLegacy(phrase).hexKey).toBe(LEGACY_KEY);
    });
});
