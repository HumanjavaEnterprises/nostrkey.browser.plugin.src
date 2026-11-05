/**
 * Vault Store — Local cache for encrypted vault documents
 *
 * Storage schema in browser.storage.local:
 *   vaultDocs: {
 *     "path/to/file.md": {
 *       path, content, updatedAt, syncStatus, eventId, relayCreatedAt,
 *       profileScope
 *     }
 *   }
 *
 * syncStatus: "synced" | "local-only" | "conflict"
 * profileScope: null (all profiles) | number[] (specific profile indices)
 */

import { api } from './browser-polyfill';
import { scheduleSyncPush } from './sync-manager';
import { wrapSecret, unwrapSecret } from './secret-vault';
import { API_KEYS_PATH } from './nip78';

const storage = api.storage.local;
const STORAGE_KEY = 'vaultDocs';
// Deletion tombstones keyed by path (issue #3): { <path>: deletedAtSeconds }.
const DELETED_KEY = 'deletedDocs';

export async function getDeletedDocs() {
    const data = await storage.get({ [DELETED_KEY]: {} });
    return data[DELETED_KEY] && typeof data[DELETED_KEY] === 'object' ? data[DELETED_KEY] : {};
}

async function getDocs() {
    const data = await storage.get({ [STORAGE_KEY]: {} });
    return data[STORAGE_KEY] || {};
}

/**
 * Decrypt a document's `content` for callers. Re-throws lock errors so a locked
 * session cannot read notes (F6).
 *
 * A genuine decrypt failure (e.g. a value synced from another device, or a blob
 * whose wrapping key rotated away) is reported as `undecryptable: true` with
 * `content: null` — NOT as an empty string. Empty content is indistinguishable
 * from a real empty note: the editor opened it blank, and the next Save wrote
 * that blank over the user's only copy. `null` + the flag lets callers refuse
 * to open or overwrite it, and leaves the ciphertext at rest untouched.
 */
async function decryptDoc(doc) {
    if (!doc) return doc;
    try {
        return { ...doc, content: await unwrapSecret(doc.content) };
    } catch (e) {
        if (String(e.message || '').startsWith('locked')) throw e;
        return { ...doc, content: null, undecryptable: true };
    }
}

async function setDocs(docs) {
    await storage.set({ [STORAGE_KEY]: docs });
    scheduleSyncPush();
}

/**
 * Get the full vault docs object.
 * @returns {Promise<Object>} Map of path -> doc
 */
export async function getVaultIndex() {
    const docs = await getDocs();
    const out = {};
    for (const [path, doc] of Object.entries(docs)) {
        out[path] = await decryptDoc(doc);
    }
    return out;
}

/**
 * Get a single document by path (content decrypted).
 * @param {string} path
 * @returns {Promise<Object|null>}
 */
export async function getDocument(path) {
    const docs = await getDocs();
    return docs[path] ? decryptDoc(docs[path]) : null;
}

/**
 * Save or update a document in the local cache.
 */
export async function saveDocumentLocal(path, content, syncStatus, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    const existing = docs[path];
    docs[path] = {
        path,
        content: await wrapSecret(content), // T0-4: encrypt note body at rest
        updatedAt: Math.floor(Date.now() / 1000),
        syncStatus,
        eventId,
        relayCreatedAt,
        profileScope: existing?.profileScope ?? null,
    };
    // Recreate clears any tombstone for this path (issue #3), so the freshly
    // saved doc is no longer suppressed from the sync payload.
    const deleted = await getDeletedDocs();
    if (deleted[path] != null) {
        delete deleted[path];
        await storage.set({ [STORAGE_KEY]: docs, [DELETED_KEY]: deleted });
    } else {
        await storage.set({ [STORAGE_KEY]: docs });
    }
    scheduleSyncPush();
    return decryptDoc(docs[path]);
}

/**
 * Delete a document from the local cache and record a tombstone (issue #3) so
 * the deletion propagates through storage.sync and a stale copy on another
 * device cannot resurrect it.
 */
export async function deleteDocumentLocal(path) {
    const docs = await getDocs();
    delete docs[path];
    const deleted = await getDeletedDocs();
    deleted[path] = Math.floor(Date.now() / 1000);
    await storage.set({ [STORAGE_KEY]: docs, [DELETED_KEY]: deleted });
    scheduleSyncPush();
}

/**
 * List all documents sorted by updatedAt descending.
 * @returns {Promise<Array>} Sorted array of doc metadata
 */
export async function listDocuments() {
    const docs = await getDocs();
    const decrypted = [];
    for (const doc of Object.values(docs)) {
        if (doc?.path === API_KEYS_PATH) continue;
        decrypted.push(await decryptDoc(doc));
    }
    return decrypted.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Update the sync status (and optionally eventId/relayCreatedAt) for a document.
 */
export async function updateSyncStatus(path, status, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    if (!docs[path]) return null;
    docs[path].syncStatus = status;
    if (eventId !== null) docs[path].eventId = eventId;
    if (relayCreatedAt !== null) docs[path].relayCreatedAt = relayCreatedAt;
    await setDocs(docs);
    return docs[path];
}
