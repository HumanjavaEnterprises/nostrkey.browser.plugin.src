/**
 * Secret Vault — at-rest encryption for private keys and application secrets.
 *
 * Threat model (T0-4): raw secret bytes must never sit in browser storage in
 * cleartext, even for the DEFAULT passwordless user. This module provides two
 * wrapping strategies behind one `wrapSecret` / `unwrapSecret` interface:
 *
 *   1. DEVICE KEY (default, no master password) — a non-extractable AES-256-GCM
 *      CryptoKey. Three persistence strategies exist, and each is VERIFIED
 *      (read back and round-tripped through encrypt/decrypt) before it is
 *      trusted:
 *
 *        a. `idb`    — a CryptoKey *handle* in IndexedDB. Only ever ADOPTED,
 *                      never minted: we trust `idb` exclusively when db.get()
 *                      hands back a PRE-EXISTING key that round-trips, because
 *                      that — and only that — proves the handle survived a
 *                      previous context. A same-context put→get probe cannot
 *                      prove cross-context persistence. Keeping the adopt path
 *                      preserves every Chrome/Firefox vault written before
 *                      1.8.1, whose blobs live under this key.
 *                      **NEVER used as the wrapping key on Safari.** Device
 *                      forensics on iPadOS 26.2 (2026-08-07) found two
 *                      IndexedDB origin directories for one extension: WebKit
 *                      scopes extension IndexedDB by the per-install
 *                      `safari-web-extension://<uuid>` ORIGIN, which rotates
 *                      across (re)installs, while `storage.local` is scoped by
 *                      BUNDLE ID and survives. So on Safari a vault can keep
 *                      its data and lose its wrapping key — the exact 1.8.0
 *                      data-loss shape. Safari therefore always writes under
 *                      `seed`; adopted IDB keys are decrypt-only legacy there,
 *                      and the at-rest migration re-wraps EVERY device blob the
 *                      extension stores — profile private keys, API-key
 *                      secrets, vault-note bodies, and NIP-46 bunker session
 *                      secrets / session private keys — not just profile keys.
 *        b. `seed`   — 32 random bytes in `browser.storage.local` under
 *                      `deviceKeySeed`, imported as a non-extractable AES-GCM
 *                      key at load. This is where EVERY new device key lands,
 *                      on every platform: when no pre-existing IDB key is
 *                      found we do not mint one, we seed. Chrome/Firefox fresh
 *                      installs therefore use `seed` too — one code path, and
 *                      the only one whose persistence we can actually verify.
 *        c. `memory` — last resort (unit tests, sandboxed contexts). Secrets
 *                      wrapped here do not survive a reload.
 *
 *      The resolved strategy is STICKY: it is recorded in storage.local under
 *      `deviceKeyStrategy` and honoured on later loads, so a context cannot
 *      silently flip strategies and orphan the blobs written under the old
 *      one. Decryption is symmetric regardless: `decryptWithDeviceKey` tries
 *      the current key, then every other key this install could ever have had
 *      (legacy IDB handle, existing seed), and callers using
 *      `decryptDeviceBlobForRewrap` re-wrap under the current strategy.
 *
 *      Threat model, honestly stated: the `seed` strategy protects against
 *      casual inspection of extension storage on disk, NOT against an attacker
 *      who already executes in this extension's context — such an attacker can
 *      read the seed just as it can read a CryptoKey handle's plaintext output.
 *      And on Safari, where `seed` is the ONLY strategy, the seed and the
 *      ciphertext it opens live side by side in one bundle-scoped
 *      `storage.local` file that is swept into device backups — so the
 *      passwordless device tier there is obfuscation, not protection, against
 *      an attacker holding that file or a backup extracted from it. A
 *      Keychain-backed key handed in by the native container is the real fix
 *      (future work); a master password is the defence available today.
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
// storage.local key holding the base64 raw seed for the `seed` strategy.
const DEVICE_SEED_KEY = 'deviceKeySeed';
const DEVICE_SEED_BYTES = 32;
// storage.local key holding the STICKY resolved strategy ('idb' | 'seed').
const DEVICE_STRATEGY_KEY = 'deviceKeyStrategy';

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
let _deviceStrategy = null;   // 'idb' | 'seed' | 'memory' — set once resolved
let _memoryDeviceKey = null;  // last-resort key for contexts that persist nothing
let _legacyIdbKeyPromise = null; // read-only handle on the pre-1.8.1 IDB key
let _existingSeedKeyPromise = null; // read-only handle on an existing seed key

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
 * Prove a candidate key is actually usable before we trust a strategy with a
 * user's only copy of a private key. A read-back handle that structured-clone
 * mangled (or a seed that came back truncated) fails here instead of silently
 * producing undecryptable blobs.
 */
async function keyRoundTrips(key) {
    if (!key) return false;
    try {
        const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
        const probe = new TextEncoder().encode('nostrkey-device-probe');
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, probe);
        const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(pt) === 'nostrkey-device-probe';
    } catch {
        return false;
    }
}

async function openDeviceDb() {
    // Lazy import so the module works in contexts/tests without idb bundled.
    const { openDB } = await import('idb');
    return openDB(DEVICE_DB, 1, {
        upgrade(d) {
            if (!d.objectStoreNames.contains(DEVICE_STORE)) {
                d.createObjectStore(DEVICE_STORE);
            }
        },
    });
}

/**
 * Strategy (a): ADOPT a pre-existing non-extractable CryptoKey handle from
 * IndexedDB. Never mints one.
 *
 * A key that db.get() hands back is a key some EARLIER context wrote, so it is
 * proof of cross-context persistence — the one thing a same-context
 * put→get→round-trip probe can never establish. iOS Safari's IndexedDB is
 * functional but ephemeral for the extension background: it would have passed
 * the probe and then lost the user's only copy of a private key. So: no
 * pre-existing key means no `idb`, and the caller seeds instead.
 *
 * Returns null (never throws) when nothing usable is there.
 */
async function tryIdbDeviceKey() {
    if (!indexedDbAvailable()) return null;
    try {
        const db = await openDeviceDb();
        const existing = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
        if (!existing) return null; // empty store → seed, do NOT mint here
        return (await keyRoundTrips(existing)) ? existing : null;
    } catch {
        return null;
    }
}

/**
 * The storage area backing the `seed` strategy. Imported lazily because
 * browser-polyfill throws at module load when no extension namespace exists.
 */
async function seedStorage() {
    try {
        const { api } = await import('./browser-polyfill');
        return api?.storage?.local || null;
    } catch {
        return null;
    }
}

/** Signal 2: a WebKit user agent with no Chromium marker on it. */
function looksLikeWebKitOnlyUa() {
    try {
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
        return /Safari|AppleWebKit/.test(ua) && !/Chrom(e|ium)|Edg\/|OPR\//.test(ua);
    } catch {
        return false;
    }
}

/**
 * True on Safari (iOS + macOS), where IndexedDB must NEVER hold the wrapping
 * key — see the module header's storage-scope note.
 *
 * Detection is multi-signal and BIASED TOWARD SAFARI, because the two errors
 * are not symmetric: seeding a Chrome vault costs nothing (seed is already the
 * strategy every fresh install lands on), while IDB-wrapping a Safari vault is
 * the 1.8.0 data-loss bug. So only a POSITIVELY identified Chrome/Firefox
 * origin may adopt an IndexedDB key — a getURL that is missing, throws, returns
 * a non-string, returns '' or returns a scheme we do not recognise all resolve
 * to Safari.
 */
async function isSafariEngine() {
    let origin = null;
    try {
        const { api } = await import('./browser-polyfill');
        const url = api?.runtime?.getURL?.('');
        origin = typeof url === 'string' ? url : null;
    } catch {
        origin = null;
    }
    // Signal 1: a positively identified Safari origin.
    if (origin && origin.startsWith('safari-web-extension://')) return true;
    // Signal 2: a WebKit-only UA outranks the origin — a Safari build that
    // reported an unexpected origin still must not touch IndexedDB.
    if (looksLikeWebKitOnlyUa()) return true;
    // Signal 3: only these two origins earn the IDB adopt path.
    if (origin && (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://'))) {
        return false;
    }
    return true; // ambiguous → seed
}

/** Import raw seed bytes (base64) as a non-extractable AES-GCM key. */
async function importSeedKey(seedB64) {
    return crypto.subtle.importKey(
        'raw', base64ToAb(seedB64), { name: 'AES-GCM' },
        false, // NON-extractable once imported
        ['encrypt', 'decrypt'],
    );
}

/** Read the sticky strategy recorded by a previous resolution (null if none). */
async function readStickyStrategy() {
    const store = await seedStorage();
    if (!store) return null;
    try {
        const got = await store.get({ [DEVICE_STRATEGY_KEY]: null });
        const s = got?.[DEVICE_STRATEGY_KEY];
        return (s === 'idb' || s === 'seed') ? s : null;
    } catch {
        return null;
    }
}

/** Record the resolved strategy so later loads cannot silently flip it. */
async function writeStickyStrategy(strategy) {
    if (strategy !== 'idb' && strategy !== 'seed') return; // 'memory' persists nothing
    const store = await seedStorage();
    if (!store) return;
    try {
        await store.set({ [DEVICE_STRATEGY_KEY]: strategy });
    } catch { /* best effort — the strategy still resolves the same way */ }
}

/** Strategy (b): a raw random seed in storage.local, imported non-extractable. */
async function trySeedDeviceKey() {
    const store = await seedStorage();
    if (!store) return null;
    try {
        const got = await store.get({ [DEVICE_SEED_KEY]: null });
        let seed = got?.[DEVICE_SEED_KEY];
        if (!seed) {
            seed = abToBase64(crypto.getRandomValues(new Uint8Array(DEVICE_SEED_BYTES)).buffer);
            await store.set({ [DEVICE_SEED_KEY]: seed });
            // VERIFY persistence before anything is wrapped under it.
            const check = await store.get({ [DEVICE_SEED_KEY]: null });
            const persisted = check?.[DEVICE_SEED_KEY];
            if (persisted !== seed) {
                // Another context (popup vs background on a first run) minted
                // and wrote its own seed between our set() and this read. ADOPT
                // THE WINNER: any seed actually in storage is exactly as good as
                // ours, and it is the one the other context is already wrapping
                // under. Returning null here would drop the caller through to
                // the memory key, whose blobs die with this context — the very
                // loss this strategy exists to prevent. Only a genuinely absent
                // or unusable value is a failure.
                if (typeof persisted !== 'string' || persisted.length === 0) return null;
                seed = persisted;
            }
        }
        const key = await importSeedKey(seed);
        return (await keyRoundTrips(key)) ? key : null;
    } catch {
        return null;
    }
}

/**
 * Get (creating on first use) the device wrap key.
 *
 * Resolution order, once: honour the sticky strategy this install already
 * recorded; otherwise ADOPT a pre-existing IndexedDB key if one is there, and
 * failing that seed. Whatever resolves is written back as the sticky strategy.
 */
export async function getDeviceKey() {
    if (_deviceKeyPromise) return _deviceKeyPromise;
    _deviceKeyPromise = (async () => {
        const sticky = await readStickyStrategy();

        // A vault already on `seed` never re-probes IndexedDB: its blobs are
        // under the seed key, and adopting a stray IDB handle would orphan them.
        // On Safari we never WRITE under an IDB key at all (see header): the
        // extension's IndexedDB is origin-scoped and the origin rotates across
        // installs, while storage.local is bundle-scoped and survives. Existing
        // IDB blobs stay readable through the decrypt fallback and are re-wrapped
        // under the seed by the at-rest migration.
        if (sticky !== 'seed' && !(await isSafariEngine())) {
            const idbKey = await tryIdbDeviceKey();
            if (idbKey) {
                _deviceStrategy = 'idb';
                await writeStickyStrategy('idb');
                return idbKey;
            }
        }

        const seedKey = await trySeedDeviceKey();
        if (seedKey) {
            _deviceStrategy = 'seed';
            // Also covers the degrade case: sticky was 'idb' but the handle is
            // gone. Old blobs stay readable through the decrypt fallback below.
            await writeStickyStrategy('seed');
            return seedKey;
        }

        // Nothing persists here. Better than refusing to encrypt, but blobs
        // written under this key die with the context — see module header.
        if (!_memoryDeviceKey) _memoryDeviceKey = await generateDeviceKey();
        _deviceStrategy = 'memory';
        return _memoryDeviceKey;
    })();
    return _deviceKeyPromise;
}

/** Which persistence strategy the device key resolved to (null until resolved). */
export function getDeviceKeyStrategy() {
    return _deviceStrategy;
}

/**
 * Drop every memoised device-key handle. MUST be called immediately after any
 * `storage.clear()`: the seed (and the sticky strategy) are gone from storage,
 * so a cached promise would keep handing out a key whose backing material no
 * longer exists — the next getDeviceKey() would wrap secrets under a key that
 * dies with this context.
 */
export function resetDeviceKey() {
    _deviceKeyPromise = null;
    _deviceStrategy = null;
    _memoryDeviceKey = null;
    _legacyIdbKeyPromise = null;
    _existingSeedKeyPromise = null;
}

/**
 * Read-only access to a pre-existing IndexedDB device key, used only as a
 * decrypt fallback for blobs written before this context changed strategy.
 * Never creates one.
 */
async function getLegacyIdbKey() {
    if (_legacyIdbKeyPromise) return _legacyIdbKeyPromise;
    _legacyIdbKeyPromise = (async () => {
        if (!indexedDbAvailable()) return null;
        try {
            const db = await openDeviceDb();
            const key = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
            return (await keyRoundTrips(key)) ? key : null;
        } catch {
            return null;
        }
    })();
    return _legacyIdbKeyPromise;
}

/**
 * Read-only access to the key an EXISTING `deviceKeySeed` imports to, used only
 * as a decrypt fallback. Never mints a seed (that is trySeedDeviceKey's job).
 */
async function getExistingSeedKey() {
    if (_existingSeedKeyPromise) return _existingSeedKeyPromise;
    _existingSeedKeyPromise = (async () => {
        const store = await seedStorage();
        if (!store) return null;
        try {
            const got = await store.get({ [DEVICE_SEED_KEY]: null });
            const seed = got?.[DEVICE_SEED_KEY];
            if (!seed) return null;
            const key = await importSeedKey(seed);
            return (await keyRoundTrips(key)) ? key : null;
        } catch {
            return null;
        }
    })();
    return _existingSeedKeyPromise;
}

/**
 * Every OTHER key this install could have wrapped a device blob under, in
 * preference order. Strategy flips (idb→seed on degrade, seed→idb on an
 * adopted handle) must never orphan a blob, so the fallback is symmetric: a
 * seed blob stays readable while the strategy is 'idb' and vice versa.
 */
async function fallbackDeviceKeys() {
    const keys = [];
    if (_deviceStrategy !== 'idb') {
        const legacy = await getLegacyIdbKey();
        if (legacy) keys.push(legacy);
    }
    if (_deviceStrategy !== 'seed') {
        const seedKey = await getExistingSeedKey();
        if (seedKey) keys.push(seedKey);
    }
    return keys;
}

/**
 * Decrypt a device blob with the current key, falling back to every other key
 * this install has ever had. Returns the plaintext plus whether a fallback key
 * was needed (i.e. the blob is stale and worth re-wrapping).
 */
async function decryptDeviceBlobAnyKey(iv, ciphertext) {
    const key = await getDeviceKey();
    try {
        return { plaintext: await decryptDeviceBlobWith(key, iv, ciphertext), stale: false };
    } catch (e) {
        for (const fallback of await fallbackDeviceKeys()) {
            try {
                return {
                    plaintext: await decryptDeviceBlobWith(fallback, iv, ciphertext),
                    stale: true,
                };
            } catch { /* try the next one */ }
        }
        throw e; // report the CURRENT key's failure, not the last fallback's
    }
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

async function decryptDeviceBlobWith(key, iv, ciphertext) {
    const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(base64ToAb(iv)) },
        key,
        base64ToAb(ciphertext),
    );
    return new TextDecoder().decode(plainBuf);
}

export async function decryptWithDeviceKey(encryptedData) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    // GCM authentication can fail with the CURRENT strategy's key because the
    // blob predates a strategy change (a Chrome/Firefox vault whose IDB handle
    // is still readable while this context settled on the seed, or the reverse).
    // Try every key this install has ever had before declaring the secret lost.
    const { plaintext } = await decryptDeviceBlobAnyKey(iv, ciphertext);
    return plaintext;
}

/**
 * Decrypt a device blob and, when it could only be read via a fallback key
 * (legacy IndexedDB handle, or an existing seed while the strategy is 'idb'),
 * hand back a replacement blob wrapped under the CURRENT strategy so the caller
 * can persist the upgrade opportunistically.
 * `rewrapped` is null when the blob is already current.
 */
export async function decryptDeviceBlobForRewrap(encryptedData) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const { plaintext, stale } = await decryptDeviceBlobAnyKey(iv, ciphertext);
    return {
        plaintext,
        rewrapped: stale ? await encryptWithDeviceKey(plaintext) : null,
    };
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
 *
 * The tier is therefore AMBIENT — it is whatever `setSessionKey` / `clearSession`
 * last did in this module, which may have been done by a different file. Only
 * call this where either tier is genuinely acceptable (a value that
 * `unwrapSecret` can open under both). A caller that needs a SPECIFIC tier must
 * name it: `encryptWithDeviceKey` or `encryptWithKey`.
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
