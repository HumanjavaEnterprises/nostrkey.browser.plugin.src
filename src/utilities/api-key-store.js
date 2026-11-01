/**
 * API Key Store — Local cache for encrypted API keys
 *
 * Storage schema in browser.storage.local:
 *   apiKeyVault: {
 *     keys: {
 *       "<uuid>": { id, label, secret, createdAt, updatedAt, profileScope }
 *     },
 *     syncEnabled: true,
 *     eventId: null,
 *     relayCreatedAt: null,
 *     syncStatus: "synced"    // synced | local-only | conflict
 *   }
 *
 * profileScope: null (all profiles) | number[] (specific profile indices)
 */

import { api } from './browser-polyfill';
import { scheduleSyncPush } from './sync-manager';
import { wrapSecret, unwrapSecret, isCiphertext } from './secret-vault';

const storage = api.storage.local;
const STORAGE_KEY = 'apiKeyVault';
// Deletion tombstones keyed by id (issue #3): { <id>: deletedAtSeconds }.
const DELETED_KEY = 'deletedKeys';

async function getDeletedKeys() {
    const data = await storage.get({ [DELETED_KEY]: {} });
    return data[DELETED_KEY] && typeof data[DELETED_KEY] === 'object' ? data[DELETED_KEY] : {};
}

/**
 * Decrypt a key's `secret` field for callers. Re-throws lock errors so a locked
 * session cannot read secrets (F5).
 *
 * A genuine decrypt failure (e.g. a device-wrapped value synced from another
 * device, or a blob whose wrapping key rotated away) is reported as
 * `undecryptable: true` with `secret: null` — NOT as an empty string. An empty
 * string is indistinguishable from a real value: the UI rendered it as blank
 * and exportStore() wrote it into the user's encrypted backup, quietly
 * replacing the only copy of the secret with nothing. `null` + the flag makes
 * the failure visible to every caller, and exportStore() carries the untouched
 * ciphertext instead.
 */
async function decryptKey(key) {
    if (!key) return key;
    try {
        return { ...key, secret: await unwrapSecret(key.secret) };
    } catch (e) {
        if (String(e.message || '').startsWith('locked')) throw e;
        return { ...key, secret: null, undecryptable: true };
    }
}

const DEFAULT_STORE = {
    keys: {},
    syncEnabled: true,
    eventId: null,
    relayCreatedAt: null,
    syncStatus: 'synced',
};

async function getStore() {
    const data = await storage.get({ [STORAGE_KEY]: DEFAULT_STORE });
    return { ...DEFAULT_STORE, ...data[STORAGE_KEY] };
}

async function setStore(store) {
    await storage.set({ [STORAGE_KEY]: store });
    scheduleSyncPush();
}

/**
 * Get the full API key store object.
 */
export async function getApiKeyStore() {
    const store = await getStore();
    const keys = {};
    for (const [id, key] of Object.entries(store.keys)) {
        keys[id] = await decryptKey(key);
    }
    return { ...store, keys };
}

/**
 * Get a single API key by id (secret decrypted).
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getApiKey(id) {
    const store = await getStore();
    return store.keys[id] ? decryptKey(store.keys[id]) : null;
}

/**
 * Upsert an API key. Creates if new, updates if existing.
 * @param {string} id - UUID
 * @param {string} label
 * @param {string} secret
 */
export async function saveApiKey(id, label, secret) {
    const store = await getStore();
    const now = Math.floor(Date.now() / 1000);
    const existing = store.keys[id];
    // T0-4: encrypt the secret before it touches storage.
    store.keys[id] = {
        id,
        label,
        secret: await wrapSecret(secret),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        profileScope: existing?.profileScope ?? null,
    };
    // Recreate clears any tombstone for this id (issue #3) so the freshly saved
    // key is no longer suppressed from the sync payload.
    const deleted = await getDeletedKeys();
    if (deleted[id] != null) {
        delete deleted[id];
        await storage.set({ [STORAGE_KEY]: store, [DELETED_KEY]: deleted });
        scheduleSyncPush();
    } else {
        await setStore(store);
    }
    return decryptKey(store.keys[id]);
}

/**
 * Delete an API key by id and record a tombstone (issue #3) so the deletion
 * propagates through storage.sync and a stale whole-object overwrite from
 * another device cannot resurrect it.
 */
export async function deleteApiKey(id) {
    const store = await getStore();
    delete store.keys[id];
    const deleted = await getDeletedKeys();
    deleted[id] = Math.floor(Date.now() / 1000);
    await storage.set({ [STORAGE_KEY]: store, [DELETED_KEY]: deleted });
    scheduleSyncPush();
}

/**
 * List all API keys sorted by label (case-insensitive).
 * @returns {Promise<Array>}
 */
export async function listApiKeys() {
    const store = await getStore();
    const decrypted = [];
    for (const key of Object.values(store.keys)) {
        decrypted.push(await decryptKey(key));
    }
    return decrypted.sort((a, b) =>
        a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
    );
}

/**
 * Set the relay sync toggle.
 */
export async function setSyncEnabled(enabled) {
    const store = await getStore();
    store.syncEnabled = enabled;
    await setStore(store);
}

/**
 * Check if relay sync is enabled.
 */
export async function isSyncEnabled() {
    const store = await getStore();
    return store.syncEnabled;
}

/**
 * Update sync state after a relay operation.
 */
export async function updateStoreSyncState(syncStatus, eventId = null, relayCreatedAt = null) {
    const store = await getStore();
    store.syncStatus = syncStatus;
    if (eventId !== null) store.eventId = eventId;
    if (relayCreatedAt !== null) store.relayCreatedAt = relayCreatedAt;
    await setStore(store);
}

/**
 * Export the keys object (for encrypted backup).
 *
 * A key this device cannot decrypt is NEVER exported with an empty/null secret
 * — a blank would overwrite the recoverable ciphertext the next time the backup
 * is imported. It is exported as the ORIGINAL CIPHERTEXT,
 * untouched: that preserves strictly more user data than omitting it (the value
 * is still recoverable on a device that holds the wrapping key, or once the key
 * is restored), and importStore() already passes ciphertext straight through
 * instead of re-wrapping it, so the round trip is lossless. The ids are also
 * reported so the caller can tell the user which keys came through unopened.
 *
 * @returns {Promise<{keys: Object, undecryptable: string[]}>} Map of id -> key
 *          data, plus the labels/ids that were exported still-encrypted.
 */
export async function exportStore() {
    const store = await getStore();
    const keys = {};
    const undecryptable = [];
    for (const [id, key] of Object.entries(store.keys)) {
        const decrypted = await decryptKey(key);
        if (decrypted?.undecryptable) {
            keys[id] = { ...key };            // ciphertext carried through as-is
            undecryptable.push(key.label || id);
            continue;
        }
        keys[id] = decrypted;
    }
    return { keys, undecryptable };
}

/**
 * The keys to send to the relay: only those this device can read. A key it
 * cannot read is left out, so the copy on the device that can read it stays
 * the good one when that device imports what was sent.
 *
 * @returns {Promise<Object>} Map of id -> key data with plaintext secrets
 */
export async function keysForRelay() {
    const store = await getStore();
    const keys = {};
    for (const [id, key] of Object.entries(store.keys)) {
        const decrypted = await decryptKey(key);
        if (hasUsableSecret(decrypted)) keys[id] = decrypted;
    }
    return keys;
}

function hasUsableSecret(key) {
    return !!key && !key.undecryptable && typeof key.secret === 'string' && key.secret !== '';
}

/**
 * Import keys into the store (merge — existing keys with same id are overwritten).
 * Incoming secrets are plaintext (from a decrypted backup or a relay fetch) and
 * are re-wrapped for the at-rest tier this context is in — the device key, or
 * the password session key when one is live — before storage.
 *
 * An entry with no usable secret is skipped, so it can neither replace a good
 * secret nor add a key with nothing in it.
 *
 * @param {Object} keys - Map of id -> { id, label, secret, createdAt, updatedAt }
 * @returns {Promise<{imported: number, skipped: number}>}
 */
export async function importStore(keys) {
    const store = await getStore();
    let imported = 0;
    let skipped = 0;
    for (const [id, key] of Object.entries(keys)) {
        if (!hasUsableSecret(key)) {
            skipped++;
            continue;
        }
        const secret = isCiphertext(key.secret) ? key.secret : await wrapSecret(key.secret);
        store.keys[id] = { ...key, secret };
        imported++;
    }
    await setStore(store);
    return { imported, skipped };
}
