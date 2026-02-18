/**
 * Encryption utilities for NostrKey master password feature.
 *
 * Uses Web Crypto API (crypto.subtle) exclusively — no external libraries.
 * - PBKDF2 with 600,000 iterations (OWASP 2023 recommendation)
 * - AES-256-GCM for authenticated encryption
 * - Random salt (16 bytes) and IV (12 bytes) per operation
 * - All binary data encoded as base64 for JSON storage compatibility
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

// --- Base64 helpers ---------------------------------------------------------

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// --- Key derivation ---------------------------------------------------------

/**
 * Derive an AES-256-GCM CryptoKey from a password and salt using PBKDF2.
 *
 * @param {string} password - The master password
 * @param {ArrayBuffer|Uint8Array} salt - 16-byte salt
 * @returns {Promise<CryptoKey>} AES-256-GCM key
 */
export async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt instanceof Uint8Array ? salt : new Uint8Array(salt),
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// --- Encrypt / Decrypt ------------------------------------------------------

/**
 * Encrypt a plaintext string with a password.
 *
 * Generates a random salt (16 bytes) and IV (12 bytes), derives an
 * AES-256-GCM key via PBKDF2, and returns a JSON string containing
 * base64-encoded salt, iv, and ciphertext.
 *
 * @param {string} plaintext - The data to encrypt (e.g. hex private key)
 * @param {string} password  - The master password
 * @returns {Promise<string>} JSON string: { salt, iv, ciphertext } (all base64)
 */
export async function encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const key = await deriveKey(password, salt);

    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(plaintext)
    );

    return JSON.stringify({
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertext),
    });
}

/**
 * Decrypt data that was encrypted with `encrypt()`.
 *
 * @param {string} encryptedData - JSON string from encrypt()
 * @param {string} password      - The master password
 * @returns {Promise<string>} The original plaintext
 * @throws {Error} If the password is wrong or data is tampered with
 */
export async function decrypt(encryptedData, password) {
    const { salt, iv, ciphertext } = JSON.parse(encryptedData);

    const saltBuf = new Uint8Array(base64ToArrayBuffer(salt));
    const ivBuf = new Uint8Array(base64ToArrayBuffer(iv));
    const ctBuf = base64ToArrayBuffer(ciphertext);

    const key = await deriveKey(password, saltBuf);

    const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuf },
        key,
        ctBuf
    );

    const dec = new TextDecoder();
    return dec.decode(plainBuf);
}

// --- Password hashing (for verification) ------------------------------------

/**
 * Hash a password with PBKDF2 for verification purposes.
 *
 * This produces a separate hash (not the encryption key) that can be stored
 * to verify the password without needing to attempt decryption.
 *
 * @param {string} password - The master password
 * @param {Uint8Array} [salt] - Optional salt; generated if omitted
 * @returns {Promise<{ hash: string, salt: string }>} base64-encoded hash and salt
 */
export async function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    } else if (typeof salt === 'string') {
        salt = new Uint8Array(base64ToArrayBuffer(salt));
    }

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const hashBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    );

    return {
        hash: arrayBufferToBase64(hashBits),
        salt: arrayBufferToBase64(salt),
    };
}

/**
 * Verify a password against a stored hash.
 *
 * @param {string} password   - The password to verify
 * @param {string} storedHash - base64-encoded hash from hashPassword()
 * @param {string} storedSalt - base64-encoded salt from hashPassword()
 * @returns {Promise<boolean>} True if the password matches
 */
export async function verifyPassword(password, storedHash, storedSalt) {
    const { hash } = await hashPassword(password, storedSalt);
    return hash === storedHash;
}
