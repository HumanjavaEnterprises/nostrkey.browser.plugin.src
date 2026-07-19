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

const storage = api.storage.local;
const STORAGE_KEY = 'vaultDocs';

async function getDocs() {
    const data = await storage.get({ [STORAGE_KEY]: {} });
    return data[STORAGE_KEY] || {};
}

/**
 * Decrypt a document's `content` for callers. Re-throws lock errors so a locked
 * session cannot read notes (F6); tolerates genuine decrypt failures (e.g. a
 * value synced from another device) by returning empty content.
 */
async function decryptDoc(doc) {
    if (!doc) return doc;
    try {
        return { ...doc, content: await unwrapSecret(doc.content) };
    } catch (e) {
        if (String(e.message || '').startsWith('locked')) throw e;
        return { ...doc, content: '' };
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
    await setDocs(docs);
    return decryptDoc(docs[path]);
}

/**
 * Delete a document from the local cache.
 */
export async function deleteDocumentLocal(path) {
    const docs = await getDocs();
    delete docs[path];
    await setDocs(docs);
}

/**
 * List all documents sorted by updatedAt descending.
 * @returns {Promise<Array>} Sorted array of doc metadata
 */
export async function listDocuments() {
    const docs = await getDocs();
    const decrypted = [];
    for (const doc of Object.values(docs)) {
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
