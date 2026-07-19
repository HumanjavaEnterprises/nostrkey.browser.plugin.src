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

/**
 * Decrypt a key's `secret` field for callers. Re-throws lock errors so a locked
 * session cannot read secrets (F5); tolerates genuine decrypt failures (e.g. a
 * device-wrapped value synced from another device) by returning an empty secret
 * — the relay sync repopulates it.
 */
async function decryptKey(key) {
    if (!key) return key;
    try {
        return { ...key, secret: await unwrapSecret(key.secret) };
    } catch (e) {
        if (String(e.message || '').startsWith('locked')) throw e;
        return { ...key, secret: '' };
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
    await setStore(store);
    return decryptKey(store.keys[id]);
}

/**
 * Delete an API key by id.
 */
export async function deleteApiKey(id) {
    const store = await getStore();
    delete store.keys[id];
    await setStore(store);
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
 * @returns {Promise<Object>} Map of id -> key data
 */
export async function exportStore() {
    const store = await getStore();
    const keys = {};
    for (const [id, key] of Object.entries(store.keys)) {
        keys[id] = await decryptKey(key);
    }
    return keys;
}

/**
 * Import keys into the store (merge — existing keys with same id are overwritten).
 * Incoming secrets are plaintext (from a decrypted backup or a relay fetch) and
 * are re-wrapped under this device's at-rest key before storage.
 * @param {Object} keys - Map of id -> { id, label, secret, createdAt, updatedAt }
 */
export async function importStore(keys) {
    const store = await getStore();
    for (const [id, key] of Object.entries(keys)) {
        const secret = isCiphertext(key.secret) ? key.secret : await wrapSecret(key.secret);
        store.keys[id] = { ...key, secret };
    }
    await setStore(store);
}
