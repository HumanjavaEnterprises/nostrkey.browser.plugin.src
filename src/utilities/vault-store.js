/**
 * Vault Store — Local cache for encrypted vault documents
 *
 * Storage schema in browser.storage.local:
 *   vaultDocs: {
 *     "path/to/file.md": {
 *       path, content, updatedAt, syncStatus, eventId, relayCreatedAt
 *     }
 *   }
 *
 * syncStatus: "synced" | "local-only" | "conflict"
 */

import { api } from './browser-polyfill';

const storage = api.storage.local;
const STORAGE_KEY = 'vaultDocs';

async function getDocs() {
    const data = await storage.get({ [STORAGE_KEY]: {} });
    return data[STORAGE_KEY] || {};
}

async function setDocs(docs) {
    await storage.set({ [STORAGE_KEY]: docs });
}

/**
 * Get the full vault docs object.
 * @returns {Promise<Object>} Map of path -> doc
 */
export async function getVaultIndex() {
    return getDocs();
}

/**
 * Get a single document by path.
 * @param {string} path
 * @returns {Promise<Object|null>}
 */
export async function getDocument(path) {
    const docs = await getDocs();
    return docs[path] || null;
}

/**
 * Save or update a document in the local cache.
 */
export async function saveDocumentLocal(path, content, syncStatus, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    docs[path] = {
        path,
        content,
        updatedAt: Math.floor(Date.now() / 1000),
        syncStatus,
        eventId,
        relayCreatedAt,
    };
    await setDocs(docs);
    return docs[path];
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
    return Object.values(docs).sort((a, b) => b.updatedAt - a.updatedAt);
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
