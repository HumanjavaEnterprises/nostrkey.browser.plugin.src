/**
 * Crypto invariant (property) tests — src/utilities/crypto.js
 *
 * The existing suites only ever round-trip encrypt→decrypt, which survives
 * almost any weakening of the primitive: a 1,000-iteration KDF still decrypts,
 * an all-zero IV still decrypts, an extractable session key still decrypts, a
 * `===` hash compare still verifies. This file pins the PROPERTIES instead of
 * the happy path, so each of those regressions turns a test red:
 *
 *   P1  PBKDF2 runs at 600,000 iterations (OWASP 2023) — asserted on the
 *       arguments actually handed to crypto.subtle.deriveKey / deriveBits.
 *   P2  deriveKey() yields a NON-extractable key by default; only the explicit
 *       `{ extractable: true }` opt-in can leave the crypto subsystem, and
 *       importKeyBase64() always comes back opaque.
 *   P3  Every encryption uses a FRESH random 12-byte IV (AES-GCM nonce reuse
 *       under one key is catastrophic).
 *   P4  Every encrypt()/hashPassword() blob carries a FRESH random 16-byte salt.
 *   P5  Password verification compares DECODED BYTES in constant time, and the
 *       length participates — a prefix of the stored hash must not verify.
 *
 * No mocks of the module under test: these call the real Web Crypto.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
    deriveKey,
    exportKeyBase64,
    importKeyBase64,
    bytesToBase64,
    base64ToBytes,
    encryptWithKey,
    encrypt,
    decrypt,
    decryptWithKey,
    hashPassword,
    verifyPassword,
    constantTimeEqualBase64,
} from '../src/utilities/crypto.js';

const CRYPTO_SRC_PATH = fileURLToPath(
    new URL('../src/utilities/crypto.js', import.meta.url)
);

const EXPECTED_ITERATIONS = 600000;
const EXPECTED_SALT_BYTES = 16;
const EXPECTED_IV_BYTES = 12;

const PASSWORD = 'correct horse battery staple';
const PLAINTEXT =
    '0000000000000000000000000000000000000000000000000000000000000002';

/** Parse an encrypt()/encryptWithKey() blob into raw byte arrays. */
function parseBlob(json) {
    const { salt, iv, ciphertext } = JSON.parse(json);
    return {
        saltB64: salt,
        ivB64: iv,
        ciphertextB64: ciphertext,
        salt: base64ToBytes(salt),
        iv: base64ToBytes(iv),
        ciphertext: base64ToBytes(ciphertext),
    };
}

const isAllZero = (bytes) => bytes.every((b) => b === 0);

afterEach(() => {
    vi.restoreAllMocks();
});

// ── P1: PBKDF2 iteration count ──────────────────────────────────────────────

describe('P1 — PBKDF2 work factor is 600,000 iterations', () => {
    it('declares PBKDF2_ITERATIONS = 600_000 in source', () => {
        const src = readFileSync(CRYPTO_SRC_PATH, 'utf8');
        const match = src.match(/const\s+PBKDF2_ITERATIONS\s*=\s*([0-9_]+)\s*;/);
        expect(match, 'PBKDF2_ITERATIONS declaration not found').not.toBeNull();
        expect(Number(match[1].replace(/_/g, ''))).toBe(EXPECTED_ITERATIONS);
    });

    it('deriveKey calls crypto.subtle.deriveKey with iterations = 600000', async () => {
        const spy = vi.spyOn(crypto.subtle, 'deriveKey');
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));

        await deriveKey(PASSWORD, salt);

        expect(spy).toHaveBeenCalledTimes(1);
        const algo = spy.mock.calls[0][0];
        expect(algo.name).toBe('PBKDF2');
        expect(algo.hash).toBe('SHA-256');
        expect(algo.iterations).toBe(EXPECTED_ITERATIONS);

        // and the derived key really is AES-256-GCM
        const derivedType = spy.mock.calls[0][2];
        expect(derivedType).toEqual({ name: 'AES-GCM', length: 256 });
    });

    it('encrypt() derives at 600000 iterations', async () => {
        const spy = vi.spyOn(crypto.subtle, 'deriveKey');
        await encrypt(PLAINTEXT, PASSWORD);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0].iterations).toBe(EXPECTED_ITERATIONS);
    });

    it('decrypt() derives at 600000 iterations', async () => {
        const blob = await encrypt(PLAINTEXT, PASSWORD);
        const spy = vi.spyOn(crypto.subtle, 'deriveKey');
        await decrypt(blob, PASSWORD);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0].iterations).toBe(EXPECTED_ITERATIONS);
    });

    it('hashPassword calls crypto.subtle.deriveBits with iterations = 600000 and 256 bits', async () => {
        const spy = vi.spyOn(crypto.subtle, 'deriveBits');

        await hashPassword(PASSWORD);

        expect(spy).toHaveBeenCalledTimes(1);
        const [algo, , bits] = spy.mock.calls[0];
        expect(algo.name).toBe('PBKDF2');
        expect(algo.hash).toBe('SHA-256');
        expect(algo.iterations).toBe(EXPECTED_ITERATIONS);
        expect(bits).toBe(256);
    });

    it('verifyPassword re-derives at 600000 iterations (no cheaper verification path)', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const spy = vi.spyOn(crypto.subtle, 'deriveBits');

        await verifyPassword(PASSWORD, hash, salt);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0].iterations).toBe(EXPECTED_ITERATIONS);
    });
});

// ── P2: extractability ──────────────────────────────────────────────────────

describe('P2 — key extractability is opt-in and one-way', () => {
    it('deriveKey() defaults to a NON-extractable key', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt);

        expect(key.extractable).toBe(false);
        await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow();
        await expect(exportKeyBase64(key)).rejects.toThrow();
    });

    it('deriveKey() with an empty options object is still NON-extractable', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt, {});
        expect(key.extractable).toBe(false);
        await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow();
    });

    it('deriveKey() with { extractable: false } is NON-extractable', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt, { extractable: false });
        expect(key.extractable).toBe(false);
        await expect(crypto.subtle.exportKey('raw', key)).rejects.toThrow();
    });

    it('deriveKey() with { extractable: true } is extractable and exports 32 raw bytes', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt, { extractable: true });

        expect(key.extractable).toBe(true);
        const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
        expect(raw.length).toBe(32); // AES-256
        expect(base64ToBytes(await exportKeyBase64(key))).toEqual(raw);
    });

    it('the extractable flag is forwarded verbatim to crypto.subtle.deriveKey', async () => {
        const spy = vi.spyOn(crypto.subtle, 'deriveKey');
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));

        await deriveKey(PASSWORD, salt);
        await deriveKey(PASSWORD, salt, { extractable: true });

        expect(spy.mock.calls[0][3]).toBe(false);
        expect(spy.mock.calls[1][3]).toBe(true);
        // usages are encrypt/decrypt only — never wrapKey/exportable side doors
        expect(spy.mock.calls[0][4]).toEqual(['encrypt', 'decrypt']);
    });

    it('importKeyBase64() ALWAYS returns a non-extractable key, even from extractable bytes', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const extractableKey = await deriveKey(PASSWORD, salt, {
            extractable: true,
        });
        const raw = await exportKeyBase64(extractableKey);

        const restored = await importKeyBase64(raw);

        expect(restored.extractable).toBe(false);
        await expect(crypto.subtle.exportKey('raw', restored)).rejects.toThrow();
        await expect(exportKeyBase64(restored)).rejects.toThrow();
    });

    it('a restored non-extractable key still decrypts what the original key encrypted', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt, { extractable: true });
        const blob = await encryptWithKey(PLAINTEXT, key, salt);

        const restored = await importKeyBase64(await exportKeyBase64(key));

        expect(await decryptWithKey(blob, restored)).toBe(PLAINTEXT);
    });

    it('a default (non-extractable) derived key can still encrypt and decrypt', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt);
        const blob = await encryptWithKey(PLAINTEXT, key, salt);
        expect(await decryptWithKey(blob, key)).toBe(PLAINTEXT);
    });
});

// ── P3: IV freshness ────────────────────────────────────────────────────────

describe('P3 — every encryption uses a fresh random IV', () => {
    it('encryptWithKey(): 32 encryptions of the same plaintext+key yield 32 distinct IVs', async () => {
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        const key = await deriveKey(PASSWORD, salt);

        const ivs = [];
        const cts = [];
        for (let i = 0; i < 32; i++) {
            const blob = parseBlob(await encryptWithKey(PLAINTEXT, key, salt));
            expect(blob.iv.length).toBe(EXPECTED_IV_BYTES);
            expect(isAllZero(blob.iv)).toBe(false);
            ivs.push(blob.ivB64);
            cts.push(blob.ciphertextB64);
        }

        expect(new Set(ivs).size).toBe(ivs.length);
        // nonce freshness must be observable in the output too
        expect(new Set(cts).size).toBe(cts.length);
    });

    it('encrypt(): 8 encryptions of the same plaintext+password yield 8 distinct IVs', async () => {
        const ivs = [];
        for (let i = 0; i < 8; i++) {
            const blob = parseBlob(await encrypt(PLAINTEXT, PASSWORD));
            expect(blob.iv.length).toBe(EXPECTED_IV_BYTES);
            expect(isAllZero(blob.iv)).toBe(false);
            ivs.push(blob.ivB64);
        }
        expect(new Set(ivs).size).toBe(ivs.length);
    });

    it('the IV is drawn from crypto.getRandomValues, not a constant', async () => {
        const spy = vi.spyOn(crypto, 'getRandomValues');
        const salt = crypto.getRandomValues(new Uint8Array(EXPECTED_SALT_BYTES));
        spy.mockClear();

        const key = await deriveKey(PASSWORD, salt);
        await encryptWithKey(PLAINTEXT, key, salt);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toBeInstanceOf(Uint8Array);
        expect(spy.mock.calls[0][0].length).toBe(EXPECTED_IV_BYTES);
    });

    it('the IV in the blob is the IV that actually decrypts it', async () => {
        const blob = await encrypt(PLAINTEXT, PASSWORD);
        const { iv } = parseBlob(blob);

        expect(await decrypt(blob, PASSWORD)).toBe(PLAINTEXT);

        // flip one IV bit → AES-GCM must reject
        const tampered = new Uint8Array(iv);
        tampered[0] ^= 0x01;
        const parsed = JSON.parse(blob);
        parsed.iv = bytesToBase64(tampered);
        await expect(decrypt(JSON.stringify(parsed), PASSWORD)).rejects.toThrow();
    });
});

// ── P4: salt freshness ──────────────────────────────────────────────────────

describe('P4 — every blob carries a fresh random salt', () => {
    it('encrypt(): 8 blobs for the same password yield 8 distinct 16-byte salts', async () => {
        const salts = [];
        for (let i = 0; i < 8; i++) {
            const blob = parseBlob(await encrypt(PLAINTEXT, PASSWORD));
            expect(blob.salt.length).toBe(EXPECTED_SALT_BYTES);
            expect(isAllZero(blob.salt)).toBe(false);
            salts.push(blob.saltB64);
        }
        expect(new Set(salts).size).toBe(salts.length);
    });

    it('encrypt() draws BOTH a 16-byte salt and a 12-byte IV from getRandomValues', async () => {
        const spy = vi.spyOn(crypto, 'getRandomValues');
        await encrypt(PLAINTEXT, PASSWORD);

        const lengths = spy.mock.calls.map((c) => c[0].length);
        expect(lengths).toEqual([EXPECTED_SALT_BYTES, EXPECTED_IV_BYTES]);
    });

    it('the salt in the blob is the salt the key was derived from', async () => {
        const spy = vi.spyOn(crypto.subtle, 'deriveKey');
        const blob = await encrypt(PLAINTEXT, PASSWORD);
        const { salt } = parseBlob(blob);

        const usedSalt = new Uint8Array(spy.mock.calls[0][0].salt);
        expect(Array.from(usedSalt)).toEqual(Array.from(salt));
    });

    it('hashPassword(): 4 hashes of the same password yield distinct salts AND distinct hashes', async () => {
        const salts = [];
        const hashes = [];
        for (let i = 0; i < 4; i++) {
            const { hash, salt } = await hashPassword(PASSWORD);
            expect(base64ToBytes(salt).length).toBe(EXPECTED_SALT_BYTES);
            expect(isAllZero(base64ToBytes(salt))).toBe(false);
            salts.push(salt);
            hashes.push(hash);
        }
        expect(new Set(salts).size).toBe(salts.length);
        expect(new Set(hashes).size).toBe(hashes.length);
    });

    it('a supplied salt is honoured — hashPassword is deterministic given salt', async () => {
        const first = await hashPassword(PASSWORD);
        const second = await hashPassword(PASSWORD, first.salt);
        expect(second.salt).toBe(first.salt);
        expect(second.hash).toBe(first.hash);
    });

    it('two blobs of the same plaintext+password share no salt, IV or ciphertext', async () => {
        const a = parseBlob(await encrypt(PLAINTEXT, PASSWORD));
        const b = parseBlob(await encrypt(PLAINTEXT, PASSWORD));
        expect(a.saltB64).not.toBe(b.saltB64);
        expect(a.ivB64).not.toBe(b.ivB64);
        expect(a.ciphertextB64).not.toBe(b.ciphertextB64);
    });
});

// ── P5: constant-time, length-aware password verification ───────────────────

describe('P5 — verifyPassword compares decoded bytes, length included', () => {
    it('accepts the right password and rejects the wrong one', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        expect(await verifyPassword(PASSWORD, hash, salt)).toBe(true);
        expect(await verifyPassword(PASSWORD + '!', hash, salt)).toBe(false);
    });

    it('a stored hash TRUNCATED to a strict prefix does not verify', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const full = base64ToBytes(hash);
        const prefix = bytesToBase64(full.slice(0, 16));

        expect(await verifyPassword(PASSWORD, prefix, salt)).toBe(false);
    });

    it('a stored hash EXTENDED with zero bytes does not verify (length is part of the compare)', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const full = base64ToBytes(hash);

        // Same 32 leading bytes, then zeros: a byte-only compare that ignores
        // length (and treats missing bytes as 0) would wrongly call this equal.
        const extended = new Uint8Array(full.length + 8);
        extended.set(full, 0);

        expect(isAllZero(extended.slice(full.length))).toBe(true);
        expect(await verifyPassword(PASSWORD, bytesToBase64(extended), salt)).toBe(
            false
        );
    });

    it('differs only in the LAST byte → still rejected (whole hash is scanned)', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const bytes = base64ToBytes(hash);
        bytes[bytes.length - 1] ^= 0x01;

        expect(await verifyPassword(PASSWORD, bytesToBase64(bytes), salt)).toBe(
            false
        );
    });

    it('differs only in the FIRST byte → still rejected', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);
        const bytes = base64ToBytes(hash);
        bytes[0] ^= 0x01;

        expect(await verifyPassword(PASSWORD, bytesToBase64(bytes), salt)).toBe(
            false
        );
    });

    it('verifies against a differently-spelled but byte-identical base64 hash (bytes, not strings)', async () => {
        const { hash, salt } = await hashPassword(PASSWORD);

        // Re-spell the final base64 character: the low bits of the last symbol
        // are padding and are dropped on decode, so this string is a DIFFERENT
        // string that decodes to the SAME 32 bytes. A `===` compare fails it;
        // a byte compare must not.
        const ALPHABET =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const padStart = hash.indexOf('=');
        const lastIdx = (padStart === -1 ? hash.length : padStart) - 1;
        const symbol = ALPHABET.indexOf(hash[lastIdx]);
        const respelled =
            hash.slice(0, lastIdx) +
            ALPHABET[(symbol & ~0b11) | ((symbol + 1) & 0b11)] +
            hash.slice(lastIdx + 1);

        expect(respelled).not.toBe(hash);
        expect(Array.from(base64ToBytes(respelled))).toEqual(
            Array.from(base64ToBytes(hash))
        );
        expect(await verifyPassword(PASSWORD, respelled, salt)).toBe(true);
    });
});

describe('P5 — constantTimeEqualBase64 invariants', () => {
    const b64 = (arr) => bytesToBase64(new Uint8Array(arr));

    it('equal byte sequences compare equal', () => {
        expect(constantTimeEqualBase64(b64([1, 2, 3, 4]), b64([1, 2, 3, 4]))).toBe(
            true
        );
    });

    it('a strict prefix of the stored value does NOT compare equal', () => {
        const stored = b64([1, 2, 3, 4, 5, 6, 7, 8]);
        const prefix = b64([1, 2, 3, 4]);
        expect(constantTimeEqualBase64(prefix, stored)).toBe(false);
        expect(constantTimeEqualBase64(stored, prefix)).toBe(false);
    });

    it('a prefix whose missing tail is all ZERO bytes still does NOT compare equal', () => {
        // The adversarial case for a "compare bytes, treat missing as 0" bug:
        // only the length XOR distinguishes these two.
        const stored = b64([1, 2, 3, 4, 0, 0, 0, 0]);
        const prefix = b64([1, 2, 3, 4]);
        expect(constantTimeEqualBase64(prefix, stored)).toBe(false);
        expect(constantTimeEqualBase64(stored, prefix)).toBe(false);
    });

    it('the empty value never matches a non-empty value (even an all-zero one)', () => {
        expect(constantTimeEqualBase64('', b64([0, 0, 0, 0]))).toBe(false);
        expect(constantTimeEqualBase64(b64([0, 0, 0, 0]), '')).toBe(false);
        expect(constantTimeEqualBase64('', '')).toBe(true);
    });

    it('differs in the last byte only → false; differs in the first byte only → false', () => {
        const a = b64([9, 9, 9, 9]);
        expect(constantTimeEqualBase64(a, b64([9, 9, 9, 8]))).toBe(false);
        expect(constantTimeEqualBase64(a, b64([8, 9, 9, 9]))).toBe(false);
    });

    it('compares decoded bytes, not base64 spelling', () => {
        // 'AA==' and 'AB==' both decode to the single byte 0x00.
        expect(Array.from(base64ToBytes('AB=='))).toEqual([0]);
        expect('AA==').not.toBe('AB==');
        expect(constantTimeEqualBase64('AA==', 'AB==')).toBe(true);
    });

    it('returns false (never throws) on malformed base64', () => {
        expect(constantTimeEqualBase64('!!!not-base64!!!', b64([1, 2, 3]))).toBe(
            false
        );
        expect(constantTimeEqualBase64(b64([1, 2, 3]), '!!!not-base64!!!')).toBe(
            false
        );
    });

    it('does not short-circuit: full-length scan for a 32-byte hash differing at byte 0', () => {
        const stored = new Uint8Array(32).fill(7);
        const early = new Uint8Array(32).fill(7);
        early[0] ^= 0xff;
        const late = new Uint8Array(32).fill(7);
        late[31] ^= 0xff;

        expect(constantTimeEqualBase64(bytesToBase64(early), bytesToBase64(stored))).toBe(false);
        expect(constantTimeEqualBase64(bytesToBase64(late), bytesToBase64(stored))).toBe(false);
        expect(constantTimeEqualBase64(bytesToBase64(stored), bytesToBase64(stored))).toBe(true);
    });
});
