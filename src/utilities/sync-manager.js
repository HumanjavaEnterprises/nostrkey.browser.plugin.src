/**
 * Sync Manager — Platform sync via storage.sync (Chrome → Google, Safari → iCloud)
 *
 * Architecture:
 *   Write: app → storage.local → scheduleSyncPush() → storage.sync
 *   Read:  pullFromSync() on startup → merge into storage.local
 *   Listen: storage.onChanged("sync") → merge remote changes into local
 *
 * storage.local remains the source of truth. storage.sync is a best-effort mirror.
 */

import { api } from './browser-polyfill';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SYNC_QUOTA = 102_400;       // 100 KB total
const MAX_ITEM = 8_192;           // 8 KB per item
const MAX_ITEMS = 512;
const CHUNK_PREFIX = '_chunk:';
const SYNC_META_KEY = '_sync_meta';
const LOCAL_ENABLED_KEY = 'platformSyncEnabled';

// Keys that should never be synced
const EXCLUDED_KEYS = [
    'bunkerSessions',
    'ignoreInstallHook',
    'passwordHash',
    'passwordSalt',
];

// Priority tiers for budget allocation
const PRIORITY = {
    P1_PROFILES: 1,
    P2_SETTINGS: 2,
    P3_APIKEYS: 3,
    P4_VAULT: 4,
};

const storage = api.storage.local;
let pushTimer = null;

// ---------------------------------------------------------------------------
// Chunking helpers
// ---------------------------------------------------------------------------

/**
 * Split a JSON-serialised value into <=8KB chunks.
 * Returns an array of { key, value } pairs ready for storage.sync.set().
 */
function chunkValue(key, jsonString) {
    const chunks = [];
    for (let i = 0; i < jsonString.length; i += MAX_ITEM - 100) {
        // Reserve ~100 bytes for the key overhead in the stored item
        chunks.push(jsonString.slice(i, i + MAX_ITEM - 100));
    }
    if (chunks.length === 1) {
        // Fits in a single item — store directly
        return [{ key, value: jsonString }];
    }
    // Multiple chunks
    const entries = [];
    for (let i = 0; i < chunks.length; i++) {
        entries.push({ key: `${CHUNK_PREFIX}${key}:${i}`, value: chunks[i] });
    }
    // Store a metadata entry so we know how many chunks there are
    entries.push({ key, value: JSON.stringify({ __chunked: true, count: chunks.length }) });
    return entries;
}

/**
 * Reassemble chunked data from a sync data object.
 * Returns the parsed JSON value, or null on error.
 */
function reassembleFromSyncData(key, syncData) {
    try {
        const meta = typeof syncData[key] === 'string' ? JSON.parse(syncData[key]) : syncData[key];
        if (!meta || !meta.__chunked) {
            // Not chunked — parse directly
            return typeof syncData[key] === 'string' ? JSON.parse(syncData[key]) : syncData[key];
        }
        let combined = '';
        for (let i = 0; i < meta.count; i++) {
            const chunkKey = `${CHUNK_PREFIX}${key}:${i}`;
            if (syncData[chunkKey] == null) return null;
            combined += syncData[chunkKey];
        }
        return JSON.parse(combined);
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Build sync payload
// ---------------------------------------------------------------------------

/**
 * Read all local data and build a prioritised list of entries to sync.
 * Returns { entries: [{ key, jsonString, priority, size }], totalSize }
 */
async function buildSyncPayload() {
    const all = await storage.get(null);
    const entries = [];

    // P1: Profiles (strip `hosts` to save space) + profileIndex + encryption state
    if (all.profiles) {
        const cleanProfiles = all.profiles.map(p => {
            const { hosts, ...rest } = p;
            return rest;
        });
        const json = JSON.stringify(cleanProfiles);
        entries.push({ key: 'profiles', jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    if (all.profileIndex != null) {
        const json = JSON.stringify(all.profileIndex);
        entries.push({ key: 'profileIndex', jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    if (all.isEncrypted != null) {
        const json = JSON.stringify(all.isEncrypted);
        entries.push({ key: 'isEncrypted', jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }

    // P2: Settings
    const settingsKeys = ['autoLockMinutes', 'version', 'protocol_handler', LOCAL_ENABLED_KEY];
    for (const k of settingsKeys) {
        if (all[k] != null) {
            const json = JSON.stringify(all[k]);
            entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
        }
    }
    // Feature flags
    for (const k of Object.keys(all)) {
        if (k.startsWith('feature:')) {
            const json = JSON.stringify(all[k]);
            entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
        }
    }

    // P3: API key vault
    if (all.apiKeyVault) {
        const json = JSON.stringify(all.apiKeyVault);
        entries.push({ key: 'apiKeyVault', jsonString: json, priority: PRIORITY.P3_APIKEYS, size: json.length });
    }

    // P4: Vault docs (individually, newest first)
    if (all.vaultDocs && typeof all.vaultDocs === 'object') {
        const docs = Object.values(all.vaultDocs).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        for (const doc of docs) {
            const docKey = `vaultDoc:${doc.path}`;
            const json = JSON.stringify(doc);
            entries.push({ key: docKey, jsonString: json, priority: PRIORITY.P4_VAULT, size: json.length });
        }
    }

    return entries;
}

// ---------------------------------------------------------------------------
// Push to sync
// ---------------------------------------------------------------------------

async function pushToSync() {
    if (!api.storage.sync) return;

    const enabled = await isSyncEnabled();
    if (!enabled) return;

    try {
        const entries = await buildSyncPayload();

        // Sort by priority (ascending = most important first)
        entries.sort((a, b) => a.priority - b.priority);

        // Build the sync payload respecting budget
        let usedBytes = 0;
        let usedItems = 0;
        const syncPayload = {};
        const allSyncKeys = [];
        let budgetExhausted = false;

        for (const entry of entries) {
            if (budgetExhausted) break;

            const chunks = chunkValue(entry.key, entry.jsonString);
            let entrySize = 0;
            for (const c of chunks) {
                entrySize += c.key.length + (typeof c.value === 'string' ? c.value.length : JSON.stringify(c.value).length);
            }

            if (usedBytes + entrySize > SYNC_QUOTA - 500 || usedItems + chunks.length > MAX_ITEMS - 5) {
                if (entry.priority <= PRIORITY.P3_APIKEYS) {
                    // Critical data — try anyway, let the API throw if truly over
                } else {
                    console.warn(`[SyncManager] Budget exhausted at priority ${entry.priority}, skipping remaining entries`);
                    budgetExhausted = true;
                    break;
                }
            }

            for (const c of chunks) {
                syncPayload[c.key] = c.value;
                allSyncKeys.push(c.key);
            }
            usedBytes += entrySize;
            usedItems += chunks.length;
        }

        // Add sync metadata
        const meta = {
            lastWrittenAt: Date.now(),
            keys: allSyncKeys,
        };
        syncPayload[SYNC_META_KEY] = JSON.stringify(meta);

        // Write to sync storage
        await api.storage.sync.set(syncPayload);

        // Clean orphaned chunks: read existing sync keys and remove any not in our payload
        try {
            const existing = await api.storage.sync.get(null);
            const orphanKeys = Object.keys(existing).filter(k =>
                k !== SYNC_META_KEY && !allSyncKeys.includes(k)
            );
            if (orphanKeys.length > 0) {
                await api.storage.sync.remove(orphanKeys);
            }
        } catch {
            // Non-critical cleanup
        }

        console.log(`[SyncManager] Pushed ${allSyncKeys.length} entries (${usedBytes} bytes) to sync storage`);
    } catch (e) {
        console.error('[SyncManager] pushToSync error:', e);
        // Local storage is unaffected — graceful degradation
    }
}

// ---------------------------------------------------------------------------
// Pull from sync
// ---------------------------------------------------------------------------

/**
 * Read all data from sync storage and return as a plain object with
 * reassembled chunked values.
 */
async function pullFromSync() {
    if (!api.storage.sync) return null;

    try {
        const raw = await api.storage.sync.get(null);
        if (!raw || Object.keys(raw).length === 0) return null;

        const metaStr = raw[SYNC_META_KEY];
        if (!metaStr) return null;

        let meta;
        try { meta = JSON.parse(metaStr); } catch { return null; }

        const result = {};
        // Collect the non-chunk, non-meta keys
        const dataKeys = meta.keys.filter(k => !k.startsWith(CHUNK_PREFIX) && k !== SYNC_META_KEY);

        for (const key of dataKeys) {
            const value = reassembleFromSyncData(key, raw);
            if (value != null) {
                result[key] = value;
            }
        }

        result._syncMeta = meta;
        return result;
    } catch (e) {
        console.error('[SyncManager] pullFromSync error:', e);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Merge logic
// ---------------------------------------------------------------------------

/**
 * Merge sync data into local storage with conflict resolution.
 */
async function mergeIntoLocal(syncData) {
    if (!syncData) return;

    const local = await storage.get(null);
    const updates = {};
    let changed = false;

    // Detect fresh install: no profiles or only the default empty profile
    const isFresh = !local.profiles ||
        local.profiles.length === 0 ||
        (local.profiles.length === 1 && !local.profiles[0].privKey);

    // --- Profiles (P1) ---
    if (syncData.profiles) {
        if (isFresh) {
            // Fresh install — adopt sync profiles entirely
            updates.profiles = syncData.profiles;
            changed = true;
        } else if (local.profiles) {
            // Per-index updatedAt comparison — newer wins, local wins ties
            const merged = [...local.profiles];
            for (let i = 0; i < syncData.profiles.length; i++) {
                const syncProfile = syncData.profiles[i];
                if (i >= merged.length) {
                    // New profile from sync
                    merged.push(syncProfile);
                    changed = true;
                } else {
                    const localProfile = merged[i];
                    const syncTime = syncProfile.updatedAt || 0;
                    const localTime = localProfile.updatedAt || 0;
                    if (syncTime > localTime) {
                        // Sync is newer — merge but preserve local hosts
                        merged[i] = { ...syncProfile, hosts: localProfile.hosts || {} };
                        changed = true;
                    }
                }
            }
            if (changed) updates.profiles = merged;
        }
    }

    // --- Profile index (P1) ---
    if (syncData.profileIndex != null && isFresh) {
        updates.profileIndex = syncData.profileIndex;
        changed = true;
    }

    // --- Encryption state (P1) — never downgrade ---
    if (syncData.isEncrypted === true && !local.isEncrypted) {
        updates.isEncrypted = true;
        changed = true;
    }

    // --- Settings (P2) — last-write-wins ---
    const syncMeta = syncData._syncMeta || {};
    const settingsKeys = ['autoLockMinutes', 'version', 'protocol_handler', LOCAL_ENABLED_KEY];
    for (const key of settingsKeys) {
        if (syncData[key] != null && syncData[key] !== local[key]) {
            // For version, only accept higher
            if (key === 'version' && local.version && syncData.version <= local.version) continue;
            updates[key] = syncData[key];
            changed = true;
        }
    }
    // Feature flags
    for (const key of Object.keys(syncData)) {
        if (key.startsWith('feature:') && syncData[key] !== local[key]) {
            updates[key] = syncData[key];
            changed = true;
        }
    }

    // --- API Key Vault (P3) ---
    if (syncData.apiKeyVault) {
        if (!local.apiKeyVault || isFresh) {
            updates.apiKeyVault = syncData.apiKeyVault;
            changed = true;
        } else {
            // Merge individual keys by updatedAt
            const localKeys = local.apiKeyVault.keys || {};
            const syncKeys = syncData.apiKeyVault.keys || {};
            const merged = { ...localKeys };
            for (const [id, syncKey] of Object.entries(syncKeys)) {
                const localKey = merged[id];
                if (!localKey || (syncKey.updatedAt || 0) > (localKey.updatedAt || 0)) {
                    merged[id] = syncKey;
                    changed = true;
                }
            }
            if (changed) {
                updates.apiKeyVault = { ...local.apiKeyVault, keys: merged };
            }
        }
    }

    // --- Vault docs (P4) ---
    const localDocs = local.vaultDocs || {};
    let docsChanged = false;
    const mergedDocs = { ...localDocs };
    for (const key of Object.keys(syncData)) {
        if (!key.startsWith('vaultDoc:')) continue;
        const doc = syncData[key];
        if (!doc || !doc.path) continue;
        const localDoc = mergedDocs[doc.path];
        if (!localDoc || (doc.updatedAt || 0) > (localDoc.updatedAt || 0)) {
            mergedDocs[doc.path] = doc;
            docsChanged = true;
        }
    }
    if (docsChanged) {
        updates.vaultDocs = mergedDocs;
        changed = true;
    }

    if (changed) {
        await storage.set(updates);
        console.log('[SyncManager] Merged sync data into local:', Object.keys(updates));
    }
}

// ---------------------------------------------------------------------------
// Debounced push
// ---------------------------------------------------------------------------

/**
 * Schedule a sync push with a 2-second debounce.
 * Exported for use by stores and the storage interceptor.
 */
export function scheduleSyncPush() {
    if (!api.storage.sync) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
        pushTimer = null;
        pushToSync();
    }, 2000);
}

// ---------------------------------------------------------------------------
// Enable / disable
// ---------------------------------------------------------------------------

export async function isSyncEnabled() {
    const data = await storage.get({ [LOCAL_ENABLED_KEY]: true });
    return data[LOCAL_ENABLED_KEY];
}

export async function setSyncEnabled(enabled) {
    await storage.set({ [LOCAL_ENABLED_KEY]: enabled });
    if (enabled) {
        scheduleSyncPush();
    }
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Called once on startup (from background.js).
 * Pulls from sync, merges, then listens for remote changes.
 */
export async function initSync() {
    if (!api.storage.sync) {
        console.log('[SyncManager] storage.sync not available — skipping');
        return;
    }

    const enabled = await isSyncEnabled();
    if (!enabled) {
        console.log('[SyncManager] Platform sync disabled');
        return;
    }

    // Pull + merge
    try {
        const syncData = await pullFromSync();
        if (syncData) {
            await mergeIntoLocal(syncData);
            console.log('[SyncManager] Initial pull+merge complete');
        } else {
            console.log('[SyncManager] No sync data found — fresh sync');
        }
    } catch (e) {
        console.error('[SyncManager] Initial pull failed:', e);
    }

    // Listen for remote changes
    if (api.storage.onChanged) {
        api.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'sync') return;
            console.log('[SyncManager] Remote sync change detected');
            // Re-pull and merge the full sync data to handle chunked values correctly
            pullFromSync().then(syncData => {
                if (syncData) mergeIntoLocal(syncData);
            }).catch(e => {
                console.error('[SyncManager] Remote merge error:', e);
            });
        });
    }

    // Do an initial push so local data is mirrored
    scheduleSyncPush();
}
