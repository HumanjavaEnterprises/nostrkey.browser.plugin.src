/**
 * Folder backup target — the ONE per-browser shim.
 *
 * The cloud-backup engine (utilities/cloud-backup.js) is browser-agnostic: it
 * encrypts, debounces, and orchestrates save/restore without ever knowing which
 * browser it runs in. The *only* thing that differs per browser is HOW we put a
 * file into the user's chosen folder — and that difference lives here, nowhere
 * else.
 *
 *   Chromium (Chrome / Edge / Brave): File System Access API. The user picks a
 *     folder once; we persist the directory handle and re-write the blob
 *     silently on every change. If they pick their iCloud Drive / Google Drive /
 *     Dropbox synced folder, the OS syncs it to their cloud — no API keys, no
 *     backend, works with whatever cloud they already use.
 *
 *   Firefox / Safari / iOS: no directory-picker API exists, so we degrade to
 *     Save-file / Open-file (a normal download + a file input). Same folder
 *     idea, but the user confirms each save/restore — it cannot be silent.
 *
 * Both shims implement the SAME contract so the engine never branches:
 *
 *   {
 *     id: string,                         // 'fsapi' | 'file'
 *     label: string,                      // human description
 *     silent: boolean,                    // can we re-write without a click?
 *     isAvailable(): boolean,             // is this mechanism usable here?
 *     async connect(): { ok, folderName } // pick the folder (user gesture)
 *     async status(): { connected, needsPermission, folderName }
 *     async writeBlob(name, text): { ok, downloaded? }
 *     async readBlob(name): string | null
 *     async disconnect(): void
 *   }
 */

import { openDB } from 'idb';

// ---------------------------------------------------------------------------
// Handle persistence (Chromium only)
//
// FileSystemDirectoryHandle is structured-cloneable, so IndexedDB can store it
// across sessions. We keep it in its own tiny DB, separate from the events DB.
// ---------------------------------------------------------------------------

const HANDLE_DB = 'nostrkey-cloud';
const HANDLE_STORE = 'handles';
const HANDLE_KEY = 'folder';

async function openHandleDb() {
    return openDB(HANDLE_DB, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(HANDLE_STORE)) {
                db.createObjectStore(HANDLE_STORE);
            }
        },
    });
}

async function saveHandle(handle) {
    const db = await openHandleDb();
    await db.put(HANDLE_STORE, handle, HANDLE_KEY);
}

async function loadHandle() {
    try {
        const db = await openHandleDb();
        return (await db.get(HANDLE_STORE, HANDLE_KEY)) || null;
    } catch {
        return null;
    }
}

async function clearHandle() {
    try {
        const db = await openHandleDb();
        await db.delete(HANDLE_STORE, HANDLE_KEY);
    } catch {
        /* nothing to clear */
    }
}

// ---------------------------------------------------------------------------
// Permission — a persisted handle may still need a fresh grant each session.
// query first (silent); only request (which needs a user gesture) if allowed.
// ---------------------------------------------------------------------------

async function permissionState(handle, write) {
    const opts = { mode: write ? 'readwrite' : 'read' };
    if (typeof handle.queryPermission !== 'function') return 'granted'; // very old impls
    try {
        return await handle.queryPermission(opts);
    } catch {
        return 'prompt';
    }
}

async function ensurePermission(handle, write) {
    const opts = { mode: write ? 'readwrite' : 'read' };
    let state = await permissionState(handle, write);
    if (state === 'granted') return true;
    // 'prompt' → requestPermission requires a user gesture; if we're not in one
    // the browser rejects it and we surface needsPermission to the engine.
    if (typeof handle.requestPermission === 'function') {
        try {
            state = await handle.requestPermission(opts);
        } catch {
            state = 'prompt';
        }
    }
    if (state !== 'granted') {
        const err = new Error('NostrKey needs permission to write to your backup folder.');
        err.code = 'NEEDS_PERMISSION';
        throw err;
    }
    return true;
}

// ---------------------------------------------------------------------------
// Chromium target — File System Access API
// ---------------------------------------------------------------------------

const fsApiTarget = {
    id: 'fsapi',
    label: 'a folder you choose (auto-saved)',
    silent: true,

    isAvailable() {
        return (
            typeof window !== 'undefined' &&
            typeof window.showDirectoryPicker === 'function'
        );
    },

    async connect() {
        const handle = await window.showDirectoryPicker({
            id: 'nostrkey-backup',
            mode: 'readwrite',
            startIn: 'documents',
        });
        await ensurePermission(handle, true);
        await saveHandle(handle);
        return { ok: true, folderName: handle.name };
    },

    async status() {
        const handle = await loadHandle();
        if (!handle) return { connected: false, needsPermission: false, folderName: null };
        const state = await permissionState(handle, true);
        return {
            connected: true,
            needsPermission: state !== 'granted',
            folderName: handle.name,
        };
    },

    async writeBlob(name, text) {
        const handle = await loadHandle();
        if (!handle) {
            const err = new Error('No backup folder connected.');
            err.code = 'NOT_CONNECTED';
            throw err;
        }
        await ensurePermission(handle, true);
        const fileHandle = await handle.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(text);
        await writable.close();
        return { ok: true };
    },

    async readBlob(name) {
        const handle = await loadHandle();
        if (!handle) {
            const err = new Error('No backup folder connected.');
            err.code = 'NOT_CONNECTED';
            throw err;
        }
        await ensurePermission(handle, false);
        try {
            const fileHandle = await handle.getFileHandle(name, { create: false });
            const file = await fileHandle.getFile();
            return await file.text();
        } catch (e) {
            // NotFoundError → no backup in this folder yet
            if (e && (e.name === 'NotFoundError' || e.code === 'NOT_FOUND')) return null;
            throw e;
        }
    },

    async disconnect() {
        await clearHandle();
    },
};

// ---------------------------------------------------------------------------
// Fallback target — Save-file / Open-file (Firefox / Safari / iOS)
//
// No folder is remembered and writes are not silent: writeBlob() downloads the
// file (the user's browser "Save As" lets them target their cloud folder) and
// readBlob() opens a file picker. The engine treats this target as manual —
// it never auto-fires on change; it exposes explicit Save / Restore actions.
// ---------------------------------------------------------------------------

const fileTarget = {
    id: 'file',
    label: 'a file you save (manual)',
    silent: false,

    isAvailable() {
        // The universal floor — a document with anchor + file input is enough.
        return typeof document !== 'undefined';
    },

    async connect() {
        // Nothing to pick — the folder is chosen per-save by the browser dialog.
        return { ok: true, folderName: null };
    },

    async status() {
        return { connected: true, needsPermission: false, folderName: null };
    },

    async writeBlob(name, text) {
        const blob = new Blob([text], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        // Safari/Firefox popups can close before the download flushes.
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return { ok: true, downloaded: true };
    },

    async readBlob(/* name */) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.enc,.json,application/octet-stream,application/json';
            input.onchange = async () => {
                const file = input.files && input.files[0];
                if (!file) return resolve(null);
                try {
                    resolve(await file.text());
                } catch (e) {
                    reject(e);
                }
            };
            input.click();
        });
    },

    async disconnect() {
        /* nothing persisted */
    },
};

// ---------------------------------------------------------------------------
// Resolver — the engine calls this and gets the right shim for this browser.
// ---------------------------------------------------------------------------

/**
 * Pick the best folder target available in the current browser.
 * File System Access API when present (Chromium), else the file fallback.
 */
export function resolveFolderTarget() {
    if (fsApiTarget.isAvailable()) return fsApiTarget;
    return fileTarget;
}

// Exported for tests / diagnostics.
export { fsApiTarget, fileTarget };
