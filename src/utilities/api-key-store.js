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

const storage = api.storage.local;
const STORAGE_KEY = 'apiKeyVault';

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
    return getStore();
}

/**
 * Get a single API key by id.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getApiKey(id) {
    const store = await getStore();
    return store.keys[id] || null;
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
    store.keys[id] = {
        id,
        label,
        secret,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        profileScope: existing?.profileScope ?? null,
    };
    await setStore(store);
    return store.keys[id];
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
    return Object.values(store.keys).sort((a, b) =>
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
    return store.keys;
}

/**
 * Import keys into the store (merge — existing keys with same id are overwritten).
 * @param {Object} keys - Map of id -> { id, label, secret, createdAt, updatedAt }
 */
export async function importStore(keys) {
    const store = await getStore();
    for (const [id, key] of Object.entries(keys)) {
        store.keys[id] = key;
    }
    await setStore(store);
}
