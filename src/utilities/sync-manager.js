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
import { isCiphertext, isPasswordBlob } from './secret-vault';
import { bunkerSessionsAfterMoves, redactProfiles } from './bunker-url.js';

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
    // Tombstones (deletion records) get the guaranteed top slot: a deletion must
    // never lose its budget race to bulky vault content, or the deleted item
    // resurrects on the next device that still has a stale copy (issue #3).
    P0_TOMBSTONES: 0,
    P1_PROFILES: 1,
    P2_SETTINGS: 2,
    P3_APIKEYS: 3,
    P4_VAULT: 4,
};

// Warning thresholds for retained deletion history (tombstones are kept
// forever so an offline device that never learned about a deletion cannot
// resurrect the item — the count only grows, so nudge the user to trim it).
const TOMBSTONE_WARN_GENTLE = 8;
const TOMBSTONE_WARN_STRONG = 16;

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
// Version comparison
// ---------------------------------------------------------------------------

/**
 * Compare two dotted version strings numerically.
 * Returns 1 if a > b, -1 if a < b, 0 if equal. Missing / non-numeric
 * components are treated as 0 so '1.10.0' correctly sorts above '1.9.0'
 * (a plain string compare would put '1.9.0' first).
 */
function compareSemver(a, b) {
    const pa = String(a).split('.');
    const pb = String(b).split('.');
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const x = parseInt(pa[i], 10) || 0;
        const y = parseInt(pb[i], 10) || 0;
        if (x > y) return 1;
        if (x < y) return -1;
    }
    return 0;
}

// ---------------------------------------------------------------------------
// Build sync payload
// ---------------------------------------------------------------------------

/**
 * Read all local data and build a prioritised list of entries to sync.
 * Returns { entries: [{ key, jsonString, priority, size }], totalSize }
 */
export async function buildSyncPayload() {
    const all = await storage.get(null);
    const entries = [];

    // T0-5: a secret is only ever emitted to storage.sync (Google/iCloud) if it
    // is already an encrypted blob. Any value that is NOT ciphertext is refused
    // (dropped) so plaintext private keys / API secrets / notes can never leave
    // the device. `''` (empty / bunker) is allowed through as non-secret.
    const secretOk = v => !v || isCiphertext(v);

    // Tombstones (issue #3). A doc/key is suppressed from the payload when a
    // tombstone dated at-or-after its updatedAt exists, so a stale local copy
    // cannot re-push a deleted item back into the mirror.
    const deletedDocs = (all.deletedDocs && typeof all.deletedDocs === 'object') ? all.deletedDocs : {};
    const deletedKeys = (all.deletedKeys && typeof all.deletedKeys === 'object') ? all.deletedKeys : {};
    const deletedProfiles = (all.deletedProfiles && typeof all.deletedProfiles === 'object') ? all.deletedProfiles : {};

    // A profile's stable identity for tombstone / recency keying: its pubkey,
    // else (for a bunker) its remote pubkey. Matches mergeIntoLocal's identityOf.
    const identityOf = (p) => (p && (p.pubKey || p.remotePubkey)) || null;

    // P0: Tombstones — the guaranteed slot (emitted before anything else).
    if (Object.keys(deletedDocs).length > 0) {
        const json = JSON.stringify(deletedDocs);
        entries.push({ key: 'deletedDocs', jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (Object.keys(deletedKeys).length > 0) {
        const json = JSON.stringify(deletedKeys);
        entries.push({ key: 'deletedKeys', jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (Object.keys(deletedProfiles).length > 0) {
        const json = JSON.stringify(deletedProfiles);
        entries.push({ key: 'deletedProfiles', jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }

    // P1: Profiles (strip `hosts` to save space) + profileIndex
    if (all.profiles) {
        const cleanProfiles = redactProfiles(all.profiles)
            .filter(p => {
                // Suppress a profile a tombstone has superseded (deletedAt >= updatedAt),
                // so a stale local copy cannot re-push a deleted identity.
                const id = identityOf(p);
                return !(id != null && deletedProfiles[id] != null && deletedProfiles[id] >= (p.updatedAt || 0));
            })
            .map(p => {
                const { hosts, ...rest } = p;
                if (rest.privKey && !secretOk(rest.privKey)) {
                    console.warn('[SyncManager] Refusing to sync plaintext privKey — dropped');
                    rest.privKey = '';
                }
                return rest;
            });
        const json = JSON.stringify(cleanProfiles);
        entries.push({ key: 'profiles', jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    if (all.profileIndex != null) {
        const json = JSON.stringify(all.profileIndex);
        entries.push({ key: 'profileIndex', jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    // NOTE: `isEncrypted` (the master-password lock flag) is deliberately NOT
    // synced. It is a per-device fact — a device holds the password verifier or
    // it does not — and mirroring it once latched a passwordless device into a
    // dead-end lock screen it had no password for. See selfHealEncryptionFlag().

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

    // P3: API key vault — only sync keys whose secret is ciphertext (T0-5)
    if (all.apiKeyVault && all.apiKeyVault.keys) {
        const safeKeys = {};
        for (const [id, key] of Object.entries(all.apiKeyVault.keys)) {
            // Suppress a key a tombstone has superseded (deletedAt >= updatedAt).
            if (deletedKeys[id] != null && deletedKeys[id] >= (key.updatedAt || 0)) {
                continue;
            }
            if (secretOk(key.secret)) {
                safeKeys[id] = key;
            } else {
                console.warn('[SyncManager] Refusing to sync plaintext API secret — dropped');
            }
        }
        const safeVault = { ...all.apiKeyVault, keys: safeKeys };
        const json = JSON.stringify(safeVault);
        entries.push({ key: 'apiKeyVault', jsonString: json, priority: PRIORITY.P3_APIKEYS, size: json.length });
    }

    // P4: Vault docs (individually, newest first) — only if content is ciphertext
    if (all.vaultDocs && typeof all.vaultDocs === 'object') {
        const docs = Object.values(all.vaultDocs).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        for (const doc of docs) {
            // Suppress a doc a tombstone has superseded (deletedAt >= updatedAt).
            if (deletedDocs[doc.path] != null && deletedDocs[doc.path] >= (doc.updatedAt || 0)) {
                continue;
            }
            if (!secretOk(doc.content)) {
                console.warn('[SyncManager] Refusing to sync plaintext vault content — dropped');
                continue;
            }
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

/**
 * Write a prioritised, pre-chunked payload to storage.sync, retrying on an
 * over-quota rejection by dropping the lowest-priority tier still present and
 * trying again. P0 (tombstones) and P1 (profiles) are NEVER dropped — a full
 * batch failure would strand a deletion or a key, so the important tiers sync
 * even when the bulky ones cannot.
 *
 * @param {{ priority: number, chunks: {key:string, value:string}[] }[]} included
 * @returns {Promise<number>} number of data keys actually written
 */
async function setSyncRespectingQuota(included) {
    let tiers = included.slice();
    // Guard against an unbounded loop: at most one retry per distinct priority.
    for (let attempt = 0; ; attempt++) {
        const syncPayload = {};
        const allSyncKeys = [];
        for (const item of tiers) {
            for (const c of item.chunks) {
                syncPayload[c.key] = c.value;
                allSyncKeys.push(c.key);
            }
        }
        syncPayload[SYNC_META_KEY] = JSON.stringify({ lastWrittenAt: Date.now(), keys: allSyncKeys });

        try {
            await api.storage.sync.set(syncPayload);

            // Clean orphaned chunks: remove any existing sync key not in our payload.
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
            return allSyncKeys.length;
        } catch (e) {
            // Over quota (or MAX_ITEMS) — drop the lowest-priority tier still
            // present and retry. Never drop P0/P1.
            const maxPriority = tiers.reduce((m, t) => Math.max(m, t.priority), -1);
            if (maxPriority <= PRIORITY.P1_PROFILES) {
                throw e; // nothing droppable left; P0/P1 must survive or fail loudly
            }
            const before = tiers.length;
            tiers = tiers.filter(t => t.priority < maxPriority);
            if (tiers.length === before) throw e; // no progress — bail
            console.warn(`[SyncManager] sync.set over quota — dropped priority ${maxPriority} tier, retrying`);
        }
    }
}

export async function pushToSync() {
    if (!api.storage.sync) return;

    const enabled = await isSyncEnabled();
    if (!enabled) return;

    try {
        // Pull-merge BEFORE building: orphan-cleanup below wipes any mirror key
        // absent from this device's payload, so we must first absorb remote
        // state (especially remote tombstones, which then suppress the matching
        // docs/keys from the payload we are about to build). Without this a
        // device that never learned of a deletion would re-push the item.
        const remote = await pullFromSync();
        if (remote) await mergeIntoLocal(remote);

        const entries = await buildSyncPayload();

        // Sort by priority (ascending = most important first)
        entries.sort((a, b) => a.priority - b.priority);

        // Build the included set respecting the in-code byte/item budget.
        let usedBytes = 0;
        let usedItems = 0;
        const included = [];
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
                    // Critical data (incl. P0 tombstones) — include anyway; the
                    // runtime quota fallback will shed bulky tiers if the API rejects.
                } else {
                    console.warn(`[SyncManager] Budget exhausted at priority ${entry.priority}, skipping remaining entries`);
                    budgetExhausted = true;
                    break;
                }
            }

            included.push({ priority: entry.priority, chunks });
            usedBytes += entrySize;
            usedItems += chunks.length;
        }

        const written = await setSyncRespectingQuota(included);
        console.log(`[SyncManager] Pushed ${written} entries (${usedBytes} bytes) to sync storage`);
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
export async function pullFromSync() {
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

// The background's own way to hear of moved profiles. A worker cannot message
// itself, so a merge running there calls this; a page sends a message.
let profileMoveHandler = null;

export function setProfileMoveHandler(handler) {
    profileMoveHandler = handler;
}

async function announceProfileMoves(moves) {
    if (profileMoveHandler) {
        profileMoveHandler(moves);
        return;
    }
    try {
        await api.runtime.sendMessage({ kind: 'profilesMoved', payload: moves });
    } catch { /* background unavailable: what is keyed by index checks its identity */ }
}

/**
 * Where each profile went. An untouched record is found as itself, and one sync
 * replaced is found by identity. Each place is claimed once.
 *
 * @param {object[]} before
 * @param {object[]} after
 * @param {(profile: object) => ?string} identityOf
 * @returns {Array<[number, ?number]>} [old index, new index or null if gone], changes only
 */
function profileMoves(before, after, identityOf) {
    const places = before.map(profile => after.indexOf(profile));
    const claimed = new Set(places);
    before.forEach((profile, i) => {
        const id = identityOf(profile);
        if (places[i] >= 0 || !id) return;
        places[i] = after.findIndex((other, j) => !claimed.has(j) && identityOf(other) === id);
        claimed.add(places[i]);
    });
    return places.flatMap((place, i) => (place === i ? [] : [[i, place < 0 ? null : place]]));
}

/**
 * Merge sync data into local storage with conflict resolution.
 *
 * CONDITION 3 (issue #3 loop invariant): every write here goes through the raw
 * module-level `storage` (= api.storage.local) via a single `storage.set`. It
 * MUST NOT call the store-layer helpers (deleteDocumentLocal / saveDocumentLocal
 * / deleteApiKey / saveApiKey), because those call scheduleSyncPush() — a merge
 * that scheduled a push would turn every incoming sync into an outgoing one and
 * loop. A regression test asserts mergeIntoLocal never schedules a push.
 */
export async function mergeIntoLocal(syncData) {
    if (!syncData) return;
    if (syncData.profiles) {
        syncData = { ...syncData, profiles: redactProfiles(syncData.profiles) };
    }

    const local = await storage.get(null);
    const updates = {};
    let changed = false;

    // Detect fresh install: no profiles, or a single untouched default profile.
    // (Default keys are now wrapped at rest, so `privKey` is truthy even on a
    // fresh install — detect the untouched default by its name + absence of any
    // per-site grants instead.)
    //
    // C1: a lone profile is only "untouched/fresh" when it carries no identity.
    // A lone BUNKER profile has privKey:'' but IS a real identity (type/bunkerUrl
    // /remotePubkey), and must not be treated as fresh and wiped by a sync pull.
    const hasIdentity = (p) => !!(p && (
        p.privKey || p.pubKey || p.type === 'bunker' || p.bunkerUrl || p.remotePubkey
    ));
    const lone = local.profiles && local.profiles.length === 1 ? local.profiles[0] : null;
    const isFresh = !local.profiles ||
        local.profiles.length === 0 ||
        (lone && !lone.privKey && !hasIdentity(lone)) ||
        (lone && lone.name === 'Default Nostr Profile' &&
            Object.keys(lone.hosts || {}).length === 0);

    // Stable identity for profile matching / tombstones: pubKey, else the
    // bunker's remotePubkey. Matches buildSyncPayload's identityOf.
    const identityOf = (p) => (p && (p.pubKey || p.remotePubkey)) || null;

    // Capture the ACTIVE identity BEFORE any reordering/removal so the active
    // index can follow that identity through the merge (a key manager must not
    // silently switch which identity is active just because a profile ordered
    // before it was removed on another device).
    const localActiveIndex = (local.profileIndex != null) ? local.profileIndex : 0;
    const activeId = (local.profiles && local.profiles[localActiveIndex])
        ? identityOf(local.profiles[localActiveIndex])
        : null;

    // --- Profile tombstones (issue #3) — union local + remote, max per identity ---
    const deletedProfiles = { ...(local.deletedProfiles && typeof local.deletedProfiles === 'object' ? local.deletedProfiles : {}) };
    if (syncData.deletedProfiles && typeof syncData.deletedProfiles === 'object') {
        for (const [id, ts] of Object.entries(syncData.deletedProfiles)) {
            if (deletedProfiles[id] == null || ts > deletedProfiles[id]) deletedProfiles[id] = ts;
        }
    }

    // --- Profiles (P1) — pubkey-keyed merge + tombstone removal ---
    // Match by stable identity rather than array index, so a reordered or partial
    // sync payload cannot overwrite one identity's key material with another's.
    let mergedProfiles = local.profiles ? [...local.profiles] : null;
    let profilesChanged = false;
    if (syncData.profiles) {
        if (isFresh) {
            // Fresh install — adopt sync profiles entirely
            mergedProfiles = syncData.profiles.slice();
            profilesChanged = true;
        } else if (local.profiles) {
            const indexByIdentity = new Map();
            mergedProfiles.forEach((p, i) => {
                const id = identityOf(p);
                if (id && !indexByIdentity.has(id)) indexByIdentity.set(id, i);
            });
            for (const syncProfile of syncData.profiles) {
                const id = identityOf(syncProfile);
                if (id && indexByIdentity.has(id)) {
                    const i = indexByIdentity.get(id);
                    const localProfile = mergedProfiles[i];
                    if ((syncProfile.updatedAt || 0) > (localProfile.updatedAt || 0)) {
                        // Sync is newer — adopt it but preserve local per-site hosts
                        mergedProfiles[i] = { ...syncProfile, hosts: localProfile.hosts || {} };
                        profilesChanged = true;
                    }
                } else if (id) {
                    // A genuinely new identity not present locally — append it.
                    indexByIdentity.set(id, mergedProfiles.length);
                    mergedProfiles.push(syncProfile);
                    profilesChanged = true;
                }
                // A keyless remote profile cannot be reconciled to a local one
                // safely (no identity to match on), so it is skipped.
            }
        }
    }

    // Apply profile tombstones: remove any merged profile whose identity has
    // (updatedAt <= deletedAt) — deletion wins ties, consistent with docs/keys.
    // A recreated profile (updatedAt > deletedAt) survives. Never prune tombstones.
    if (mergedProfiles && Object.keys(deletedProfiles).length > 0) {
        const kept = mergedProfiles.filter(p => {
            const id = identityOf(p);
            const ts = id != null ? deletedProfiles[id] : null;
            return !(ts != null && (p.updatedAt || 0) <= ts);
        });
        // Safety: never let a sync merge leave ZERO profiles (that would orphan
        // the active index and brick the UI). If removal would empty the list,
        // keep the profiles as-is — the local user can still delete deliberately.
        // Deliberate trade-off: cross-device deletion does NOT converge on a
        // device where applying it would leave zero profiles; the profile stays
        // tombstone-suppressed on emit, so it does not re-propagate to others.
        if (kept.length !== mergedProfiles.length && kept.length > 0) {
            mergedProfiles = kept;
            profilesChanged = true;
        }
    }

    let moves = [];
    if (profilesChanged && mergedProfiles) {
        updates.profiles = mergedProfiles;
        changed = true;
        moves = profileMoves(local.profiles || [], mergedProfiles, identityOf);
        if (moves.length > 0 && local.bunkerSessions) {
            updates.bunkerSessions = bunkerSessionsAfterMoves(local.bunkerSessions, moves);
        }
    }

    // --- Profile index (P1) — FOLLOW THE ACTIVE IDENTITY across the merge ---
    // The active index tracks the active identity, not a raw slot: if a profile
    // ordered before the active one is removed on another device, the index
    // shifts so the SAME identity stays active. The index only moves to a
    // different identity when the active one is itself gone (tombstoned), or on a
    // fresh adopt — then it falls back to the safe clamp.
    if (mergedProfiles && mergedProfiles.length > 0) {
        let desiredIndex;
        if (syncData.profiles && isFresh) {
            // Fresh adopt — take sync's active index, clamped into range.
            const base = syncData.profileIndex != null ? syncData.profileIndex : 0;
            desiredIndex = Math.min(Math.max(base, 0), mergedProfiles.length - 1);
        } else {
            const followed = activeId != null
                ? mergedProfiles.findIndex(p => identityOf(p) === activeId)
                : -1;
            desiredIndex = followed >= 0
                ? followed
                : Math.min(Math.max(localActiveIndex, 0), mergedProfiles.length - 1);
        }
        if (desiredIndex !== local.profileIndex) {
            updates.profileIndex = desiredIndex;
            changed = true;
        }
    }

    // --- Encryption state (P1) ---
    // A2: `isEncrypted` is NOT merged. The master-password lock is a per-device
    // fact proven by the local verifier; mirroring it once latched a passwordless
    // device into a lock screen it had no password for. See selfHealEncryptionFlag().

    // --- Settings (P2) — last-write-wins ---
    const settingsKeys = ['autoLockMinutes', 'version', 'protocol_handler', LOCAL_ENABLED_KEY];
    for (const key of settingsKeys) {
        if (syncData[key] != null && syncData[key] !== local[key]) {
            // For version, only accept a numerically-higher one ('1.10.0' > '1.9.0').
            if (key === 'version' && local.version && compareSemver(syncData.version, local.version) <= 0) continue;
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

    // --- Tombstones (issue #3) — union local + remote, max deletedAt per key ---
    const deletedDocs = { ...(local.deletedDocs && typeof local.deletedDocs === 'object' ? local.deletedDocs : {}) };
    if (syncData.deletedDocs && typeof syncData.deletedDocs === 'object') {
        for (const [path, ts] of Object.entries(syncData.deletedDocs)) {
            if (deletedDocs[path] == null || ts > deletedDocs[path]) deletedDocs[path] = ts;
        }
    }
    const deletedKeys = { ...(local.deletedKeys && typeof local.deletedKeys === 'object' ? local.deletedKeys : {}) };
    if (syncData.deletedKeys && typeof syncData.deletedKeys === 'object') {
        for (const [id, ts] of Object.entries(syncData.deletedKeys)) {
            if (deletedKeys[id] == null || ts > deletedKeys[id]) deletedKeys[id] = ts;
        }
    }

    // --- API Key Vault (P3) ---
    // Build the merged key set, fold in any remote keys, then apply key
    // tombstones. Runs even when the pull carries NO apiKeyVault, so a
    // delete-only pull can still remove a locally-held key.
    {
        let baseVault = local.apiKeyVault || null;
        let mergedKeys = { ...((local.apiKeyVault && local.apiKeyVault.keys) || {}) };
        let apiChanged = false;
        if ((!local.apiKeyVault || isFresh) && syncData.apiKeyVault) {
            baseVault = syncData.apiKeyVault;
            mergedKeys = { ...(syncData.apiKeyVault.keys || {}) };
            apiChanged = true;
        } else if (syncData.apiKeyVault) {
            const syncKeys = syncData.apiKeyVault.keys || {};
            for (const [id, syncKey] of Object.entries(syncKeys)) {
                const localKey = mergedKeys[id];
                if (!localKey || (syncKey.updatedAt || 0) > (localKey.updatedAt || 0)) {
                    mergedKeys[id] = syncKey;
                    apiChanged = true;
                }
            }
        }
        // Apply tombstones. Deletion wins ties (`<=`), consistent with the
        // emit-side suppression (`deletedAt >= updatedAt`): a key whose
        // updatedAt equals the tombstone was deleted in that same second, so it
        // must NOT be re-added from the mirror on the deleting device. The
        // tombstone is NEVER pruned here — pruning it would let the very copy it
        // just removed resurrect on the next merge. Tombstones are cleared only
        // at the source (saveApiKey on same-device recreate) or by the user.
        for (const id of Object.keys(mergedKeys)) {
            const ts = deletedKeys[id];
            if (ts != null && (mergedKeys[id].updatedAt || 0) <= ts) {
                delete mergedKeys[id];
                apiChanged = true;
            }
        }
        if (apiChanged && baseVault) {
            updates.apiKeyVault = { ...baseVault, keys: mergedKeys };
            changed = true;
        }
    }

    // --- Vault docs (P4) ---
    const mergedDocs = { ...(local.vaultDocs || {}) };
    let docsChanged = false;
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
    // Apply doc tombstones. Deletion wins ties (`<=`), and tombstones are NEVER
    // pruned here — same rationale as the API keys above.
    for (const path of Object.keys(mergedDocs)) {
        const ts = deletedDocs[path];
        if (ts != null && (mergedDocs[path].updatedAt || 0) <= ts) {
            delete mergedDocs[path];
            docsChanged = true;
        }
    }
    if (docsChanged) {
        updates.vaultDocs = mergedDocs;
        changed = true;
    }

    // Persist the tombstone sets. These are a PURE UNION (max deletedAt per
    // key) — the merge never removes a tombstone, so they are retained forever
    // and an offline device cannot resurrect a deletion. They are cleared only
    // at the source (saveDocumentLocal/saveApiKey on same-device recreate) or by
    // the user via clearDeletionHistory.
    //
    // Residual (accepted, documented): pure cross-device clock skew — a live
    // copy whose updatedAt is genuinely NEWER than the delete's timestamp — wins
    // under the `<=` rule and is kept. That is an inherent last-write-wins limit
    // that tombstones do not resolve; "fixing" it by pruning would reintroduce
    // the same-second resurrection bug, so it is left as-is.
    if (JSON.stringify(deletedDocs) !== JSON.stringify(local.deletedDocs || {})) {
        updates.deletedDocs = deletedDocs;
        changed = true;
    }
    if (JSON.stringify(deletedKeys) !== JSON.stringify(local.deletedKeys || {})) {
        updates.deletedKeys = deletedKeys;
        changed = true;
    }
    if (JSON.stringify(deletedProfiles) !== JSON.stringify(local.deletedProfiles || {})) {
        updates.deletedProfiles = deletedProfiles;
        changed = true;
    }

    if (changed) {
        // Raw local write ONLY — never scheduleSyncPush (loop invariant).
        await storage.set(updates);
        console.log('[SyncManager] Merged sync data into local:', Object.keys(updates));
    }
    if (moves.length > 0) await announceProfileMoves(moves);
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
// Deletion-history (tombstone) retention helpers
// ---------------------------------------------------------------------------

/**
 * Total number of retained deletion records (docs + keys). Grows over the life
 * of the install because tombstones are kept forever (an offline device that
 * never learned of a deletion must not be able to resurrect the item).
 */
export async function getTombstoneCount() {
    const data = await storage.get({ deletedDocs: {}, deletedKeys: {}, deletedProfiles: {} });
    const docs = data.deletedDocs && typeof data.deletedDocs === 'object' ? data.deletedDocs : {};
    const keys = data.deletedKeys && typeof data.deletedKeys === 'object' ? data.deletedKeys : {};
    const profiles = data.deletedProfiles && typeof data.deletedProfiles === 'object' ? data.deletedProfiles : {};
    return Object.keys(docs).length + Object.keys(keys).length + Object.keys(profiles).length;
}

/**
 * Warning level for a given retained-deletion count:
 *   0 = fine, 1 = gentle nudge (>= 8), 2 = stronger warning (>= 16).
 */
export function tombstoneWarningLevel(count) {
    if (count >= TOMBSTONE_WARN_STRONG) return 2;
    if (count >= TOMBSTONE_WARN_GENTLE) return 1;
    return 0;
}

/**
 * Clear all retained deletion history. Informed-user choice: a device that has
 * been offline since before one of these deletions can, on its next sync,
 * re-add the item — because the record that told everyone it was deleted is
 * now gone. Schedules a push so the cleared state propagates to the mirror.
 */
export async function clearDeletionHistory() {
    await storage.set({ deletedDocs: {}, deletedKeys: {}, deletedProfiles: {} });
    scheduleSyncPush();
}

// ---------------------------------------------------------------------------
// Encryption-flag self-heal (A2)
// ---------------------------------------------------------------------------

/**
 * Clear a bogus `isEncrypted=true` when this device holds no evidence of real
 * password protection — no password verifier (passwordHash) AND no profile key
 * that is a PASSWORD blob.
 *
 * Gating detail (critical): evidence is a PASSWORD blob (isPasswordBlob), NOT a
 * device-key blob. Since v1.7.0 every key is wrapped at rest even for the
 * passwordless Level-0 user, so a normal passwordless install is full of
 * device-key ciphertext; keying off that would wrongly keep the flag latched.
 * Only a password-derived blob (or the verifier) proves a master password.
 *
 * @returns {Promise<boolean>} true if a bogus flag was cleared.
 */
export async function selfHealEncryptionFlag() {
    const data = await storage.get({ isEncrypted: false, passwordHash: null, profiles: [] });
    if (!data.isEncrypted) return false;   // nothing latched — nothing to heal
    if (data.passwordHash) return false;   // real verifier present — keep the flag

    const hasPasswordBlob = Array.isArray(data.profiles) &&
        data.profiles.some(p => p && isPasswordBlob(p.privKey));
    if (hasPasswordBlob) return false;     // password-encrypted key material — keep

    // Flag is bogus (e.g. mirrored in from another device that DID have a
    // password). Clear it so this device is not stranded at a dead-end unlock.
    await storage.set({ isEncrypted: false });
    console.log('[SyncManager] Cleared bogus isEncrypted flag (no password verifier/blob)');
    return true;
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

/**
 * Reduce every bunkerUrl in the `profiles` mirror to its address. Works on the
 * stored data directly, so it does not depend on sync being enabled, and writes
 * nothing when there is nothing to change.
 */
export async function scrubSyncedProfiles() {
    if (!api.storage.sync) return;
    const raw = await api.storage.sync.get(null);
    const profiles = raw ? reassembleFromSyncData('profiles', raw) : null;
    if (!Array.isArray(profiles)) return;
    const clean = redactProfiles(profiles);
    if (clean === profiles) return;

    const entries = chunkValue('profiles', JSON.stringify(clean));
    const payload = Object.fromEntries(entries.map(e => [e.key, e.value]));
    await api.storage.sync.set(payload);
    const unused = Object.keys(raw).filter(k =>
        k.startsWith(`${CHUNK_PREFIX}profiles:`) && !(k in payload)
    );
    if (unused.length > 0) await api.storage.sync.remove(unused);
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Called once on startup (from background.js).
 * Pulls from sync, merges, then listens for remote changes.
 */
export async function initSync() {
    // Self-heal a bogus encryption flag first — this must run even when sync is
    // unavailable or disabled, because the bad state it fixes may have been left
    // behind by an earlier (now-removed) isEncrypted-syncing build.
    try {
        await selfHealEncryptionFlag();
    } catch (e) {
        console.error('[SyncManager] selfHealEncryptionFlag failed:', e);
    }

    if (!api.storage.sync) {
        console.log('[SyncManager] storage.sync not available — skipping');
        return;
    }

    try {
        await scrubSyncedProfiles();
    } catch (e) {
        console.error('[SyncManager] scrubSyncedProfiles failed:', e);
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
