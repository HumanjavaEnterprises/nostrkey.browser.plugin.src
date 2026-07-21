/**
 * Cloud backup engine — save an encrypted copy of the vault into a folder the
 * user owns, so their accounts survive an uninstall / a new device / a new
 * browser. The folder is usually inside their own cloud (iCloud Drive, Google
 * Drive, Dropbox); we never talk to any cloud API — we just write a file, and
 * the OS syncs it.
 *
 * WHY THIS RECOVERS AFTER UNINSTALL: the browser wipes chrome.storage on
 * uninstall, but it cannot touch a file sitting in the user's own folder. That
 * file is the recovery.
 *
 * This module is browser-agnostic. The one thing that differs per browser —
 * how a file lands in the chosen folder — is isolated in shims/folder-target.js
 * (File System Access API on Chromium; Save/Open-file elsewhere). The engine
 * only ever calls the shim's contract, so it reads the same on every browser.
 *
 * THE BLOB is exactly the existing `backup.export` envelope: an AES-256-GCM
 * ciphertext of the full vault, encrypted with the master password. We reuse it
 * verbatim — nothing new is written to the folder that isn't already the format
 * "Download Backup" produces, so the folder copy and a manual backup file are
 * interchangeable and restore through the same `backup.import` path.
 */

import { api } from './browser-polyfill';
import { resolveFolderTarget } from '../shims/folder-target';

// storage.local keys (mirrors the sync-manager's convention)
const K_ENABLED = 'cloudBackup:enabled';
const K_MODE = 'cloudBackup:mode';       // 'folder' (silent) | 'manual'
const K_FOLDER = 'cloudBackup:folderName';
const K_LAST = 'cloudBackup:lastWriteAt';
const K_ERROR = 'cloudBackup:lastError';

const FILENAME = 'nostrkey-vault.enc';
const DEBOUNCE_MS = 2000;

const storage = api.storage.local;

let _target = null;
let _pushTimer = null;

function target() {
    if (!_target) _target = resolveFolderTarget();
    return _target;
}

// ---------------------------------------------------------------------------
// Enable / disable
// ---------------------------------------------------------------------------

/**
 * Turn cloud backup on. On Chromium this prompts the user to pick a folder
 * (must be called from a user gesture); on other browsers it just arms the
 * manual Save/Restore flow. Writes a first copy immediately on success.
 *
 * @returns {Promise<{ ok: boolean, error?: string, status?: object }>}
 */
export async function enableCloudBackup() {
    const t = target();
    try {
        const { ok, folderName } = await t.connect();
        if (!ok) return { ok: false, error: 'Folder selection was cancelled.' };
        await storage.set({
            [K_ENABLED]: true,
            [K_MODE]: t.silent ? 'folder' : 'manual',
            [K_FOLDER]: folderName || null,
            [K_ERROR]: null,
        });
        // First snapshot right away (only meaningful/silent on Chromium; on the
        // fallback this would pop a download, so we skip the auto-write there).
        if (t.silent) await cloudBackupNow();
        return { ok: true, status: await getCloudStatus() };
    } catch (e) {
        // AbortError = the user closed the picker; not an error worth recording.
        if (e && e.name === 'AbortError') return { ok: false, error: 'cancelled' };
        return { ok: false, error: e?.message || 'Could not enable cloud backup.' };
    }
}

/** Turn cloud backup off and forget the folder handle. */
export async function disableCloudBackup() {
    if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null; }
    try { await target().disconnect(); } catch { /* best effort */ }
    await storage.set({ [K_ENABLED]: false, [K_MODE]: null, [K_FOLDER]: null });
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export async function isCloudBackupEnabled() {
    const d = await storage.get({ [K_ENABLED]: false });
    return !!d[K_ENABLED];
}

/**
 * A single object the UI can render from.
 * @returns {Promise<{available, silent, enabled, connected, needsPermission,
 *                     mode, folderName, lastWriteAt, lastError}>}
 */
export async function getCloudStatus() {
    const t = target();
    const d = await storage.get({
        [K_ENABLED]: false, [K_MODE]: null, [K_FOLDER]: null,
        [K_LAST]: null, [K_ERROR]: null,
    });
    let connected = false;
    let needsPermission = false;
    let folderName = d[K_FOLDER];
    if (d[K_ENABLED]) {
        try {
            const s = await t.status();
            connected = s.connected;
            needsPermission = s.needsPermission;
            folderName = s.folderName ?? folderName;
        } catch { /* leave defaults */ }
    }
    return {
        available: t.isAvailable(),
        silent: t.silent,
        enabled: !!d[K_ENABLED],
        connected,
        needsPermission,
        mode: d[K_MODE],
        folderName,
        lastWriteAt: d[K_LAST],
        lastError: d[K_ERROR],
    };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Ask the background for a fresh encrypted backup envelope. Requires the
 * extension to be unlocked (same requirement as "Download Backup").
 */
async function exportEnvelope() {
    const result = await api.runtime.sendMessage({ kind: 'backup.export' });
    if (!result || !result.success) {
        throw new Error(result?.error || 'Could not create backup (is the vault unlocked?)');
    }
    return result.envelope;
}

/**
 * Write the current vault to the folder now. Silent on Chromium; on the
 * fallback target this produces a download the user confirms.
 */
export async function cloudBackupNow() {
    const t = target();
    try {
        const envelope = await exportEnvelope();
        const json = JSON.stringify(envelope, null, 2);
        const res = await t.writeBlob(FILENAME, json);
        await storage.set({ [K_LAST]: Date.now(), [K_ERROR]: null });
        return { ok: true, ...res };
    } catch (e) {
        await storage.set({ [K_ERROR]: e?.code || e?.message || 'write failed' });
        return { ok: false, error: e?.message || 'write failed', code: e?.code };
    }
}

/**
 * Debounced auto-save — call this on every account add / modify. It mirrors the
 * sync-manager's scheduleSyncPush(): coalesce a burst of edits into one write.
 * Only fires when backup is enabled AND the target can write silently; the
 * manual (file) target never auto-downloads.
 */
export function scheduleCloudBackup() {
    const t = target();
    if (!t.silent) return; // manual target — user saves explicitly
    if (_pushTimer) clearTimeout(_pushTimer);
    _pushTimer = setTimeout(async () => {
        _pushTimer = null;
        if (await isCloudBackupEnabled()) await cloudBackupNow();
    }, DEBOUNCE_MS);
}

// ---------------------------------------------------------------------------
// Restore
// ---------------------------------------------------------------------------

/**
 * Read the encrypted blob back from the folder and restore it. Needs the master
 * password to decrypt (the file is opaque without it). Runs through the exact
 * same `backup.import` path a file restore uses.
 *
 * @param {string} password master password used when the backup was created
 * @returns {Promise<{ ok, profileCount?, error? }>}
 */
export async function restoreFromCloud(password) {
    if (!password) return { ok: false, error: 'Enter your master password.' };
    const t = target();
    let text;
    try {
        text = await t.readBlob(FILENAME);
    } catch (e) {
        return { ok: false, error: e?.message || 'Could not read the backup.' };
    }
    if (!text) return { ok: false, error: 'No NostrKey backup found in that folder.' };

    let envelope;
    try {
        envelope = JSON.parse(text);
    } catch {
        return { ok: false, error: 'The backup file is not valid — could not parse it.' };
    }
    const result = await api.runtime.sendMessage({
        kind: 'backup.import',
        payload: { envelope, password },
    });
    if (!result || !result.success) {
        return { ok: false, error: result?.error || 'Restore failed.' };
    }
    return { ok: true, profileCount: result.profileCount };
}
