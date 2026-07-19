/**
 * Secret Vault — at-rest encryption for private keys and application secrets.
 *
 * Threat model (T0-4): raw secret bytes must never sit in browser storage in
 * cleartext, even for the DEFAULT passwordless user. This module provides two
 * wrapping strategies behind one `wrapSecret` / `unwrapSecret` interface:
 *
 *   1. DEVICE KEY (default, no master password) — a non-extractable AES-256-GCM
 *      CryptoKey generated with `extractable:false` and persisted as a CryptoKey
 *      *handle* in IndexedDB. The raw key bytes never leave the browser's key
 *      store, so storage only ever holds ciphertext + a handle that cannot be
 *      exported. In environments without IndexedDB (unit tests) the key is held
 *      in memory for the life of the module.
 *
 *   2. SESSION KEY (master password set + unlocked) — the AES-256-GCM key
 *      derived from the password (see crypto.js). Set by the background worker
 *      on unlock via `setSessionKey`, cleared on lock via `clearSession`.
 *
 * Blob formats (both are self-describing JSON strings):
 *   password blob : { salt, iv, ciphertext }
 *   device  blob : { v:1, k:"device", iv, ciphertext }
 *
 * `unwrapSecret` refuses to decrypt when the session has been explicitly locked
 * (F5/F6) so a locked page cannot read secrets.
 */

import { encryptWithKey, decryptWithKey } from './crypto';

const IV_BYTES = 12;
const DEVICE_DB = 'nostrkey-secret-vault';
const DEVICE_STORE = 'keys';
const DEVICE_KEY_ID = 'device-wrap-key-v1';

// --- Base64 helpers (kept local so this module has no cross-deps) ------------
function abToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}
function base64ToAb(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

// --- Session (password-derived) key state ------------------------------------
let _sessionKey = null;   // CryptoKey | null
let _sessionSalt = null;  // Uint8Array | null
// _unlocked: null = passwordless / not applicable (never locked),
//            true = unlocked, false = locked (refuse secret reads).
let _unlocked = null;

export function setSessionKey(cryptoKey, salt) {
    _sessionKey = cryptoKey;
    _sessionSalt = salt;
    _unlocked = true;
}

export function clearSession() {
    _sessionKey = null;
    _sessionSalt = null;
    _unlocked = false;
}

/** Explicitly mark the session unlocked/locked without providing a key. */
export function setUnlocked(v) {
    _unlocked = v === null ? null : !!v;
}

export function hasSessionKey() {
    return !!_sessionKey;
}

// --- Device key --------------------------------------------------------------
let _deviceKeyPromise = null;
let _memoryDeviceKey = null; // fallback for environments without IndexedDB

async function generateDeviceKey() {
    return crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false, // NON-extractable: raw bytes can never be read back out
        ['encrypt', 'decrypt'],
    );
}

function indexedDbAvailable() {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

/**
 * Get (creating on first use) the persistent non-extractable device key.
 * Persisted in IndexedDB as a CryptoKey handle via structured clone.
 */
export async function getDeviceKey() {
    if (_deviceKeyPromise) return _deviceKeyPromise;
    _deviceKeyPromise = (async () => {
        if (!indexedDbAvailable()) {
            if (!_memoryDeviceKey) _memoryDeviceKey = await generateDeviceKey();
            return _memoryDeviceKey;
        }
        // Lazy import so the module works in contexts/tests without idb bundled.
        const { openDB } = await import('idb');
        const db = await openDB(DEVICE_DB, 1, {
            upgrade(d) {
                if (!d.objectStoreNames.contains(DEVICE_STORE)) {
                    d.createObjectStore(DEVICE_STORE);
                }
            },
        });
        let key = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
        if (!key) {
            key = await generateDeviceKey();
            await db.put(DEVICE_STORE, key, DEVICE_KEY_ID);
        }
        return key;
    })();
    return _deviceKeyPromise;
}

export async function encryptWithDeviceKey(plaintext) {
    const key = await getDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, enc.encode(plaintext),
    );
    return JSON.stringify({
        v: 1,
        k: 'device',
        iv: abToBase64(iv),
        ciphertext: abToBase64(ciphertext),
    });
}

export async function decryptWithDeviceKey(encryptedData) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const key = await getDeviceKey();
    const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(base64ToAb(iv)) },
        key,
        base64ToAb(ciphertext),
    );
    return new TextDecoder().decode(plainBuf);
}

// --- Blob classification -----------------------------------------------------
export function isPasswordBlob(value) {
    if (typeof value !== 'string') return false;
    try {
        const p = JSON.parse(value);
        return !!(p && p.salt && p.iv && p.ciphertext && p.k !== 'device');
    } catch { return false; }
}

export function isDeviceKeyBlob(value) {
    if (typeof value !== 'string') return false;
    try {
        const p = JSON.parse(value);
        return !!(p && p.k === 'device' && p.iv && p.ciphertext);
    } catch { return false; }
}

/** True if the value is already ciphertext (either wrapping). */
export function isCiphertext(value) {
    return isPasswordBlob(value) || isDeviceKeyBlob(value);
}

// --- Unified wrap / unwrap ---------------------------------------------------

/**
 * Encrypt a secret for at-rest storage. Prefers the password-derived session
 * key when one is available in this context (background, unlocked); otherwise
 * falls back to the always-available device key. Never returns plaintext.
 */
export async function wrapSecret(plaintext) {
    if (typeof plaintext !== 'string' || plaintext.length === 0) return plaintext;
    if (isCiphertext(plaintext)) return plaintext; // already wrapped — don't double-wrap
    if (_sessionKey) {
        return encryptWithKey(plaintext, _sessionKey, _sessionSalt);
    }
    return encryptWithDeviceKey(plaintext);
}

/**
 * Decrypt an at-rest secret. Refuses when the session is explicitly locked.
 * Legacy plaintext values are returned unchanged (transitional — callers should
 * re-wrap on next write; see migration paths).
 */
export async function unwrapSecret(value) {
    if (typeof value !== 'string' || value.length === 0) return value;
    if (!isCiphertext(value)) return value; // legacy plaintext passthrough
    if (_unlocked === false) {
        throw new Error('locked: session is locked — cannot read secret');
    }
    if (isDeviceKeyBlob(value)) {
        return decryptWithDeviceKey(value);
    }
    // password blob
    if (!_sessionKey) {
        throw new Error('locked: no session key available to decrypt secret');
    }
    return decryptWithKey(value, _sessionKey);
}
