// @vitest-environment jsdom
/**
 * Cloud-backup ENGINE tests (browser-agnostic layer).
 *
 * The engine is isolated from the browser here: the per-browser folder shim and
 * the extension `api` are both mocked, so these tests prove the orchestration —
 * enable/disable, debounced auto-save on change, the reuse of the real
 * backup.export envelope, and restore-through-backup.import — independent of any
 * one browser. The shim itself is proven separately in folder-target.test.js.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// --- mock the extension API (in-memory storage.local + runtime stub) ---------
vi.mock('../src/utilities/browser-polyfill', () => {
    const store = {};
    const api = {
        storage: {
            local: {
                get: async (defaults) => {
                    if (defaults == null) return { ...store };
                    const out = {};
                    for (const k of Object.keys(defaults)) out[k] = k in store ? store[k] : defaults[k];
                    return out;
                },
                set: async (obj) => { Object.assign(store, obj); },
            },
        },
        runtime: { sendMessage: vi.fn() },
    };
    globalThis.__mock = { store, api };
    return { api };
});

// --- mock the per-browser folder target (a controllable fake) ----------------
vi.mock('../src/shims/folder-target', () => {
    const target = {
        id: 'fsapi',
        label: 'fake folder',
        silent: true,
        isAvailable: () => true,
        connect: vi.fn(async () => ({ ok: true, folderName: 'NostrKey' })),
        status: vi.fn(async () => ({ connected: true, needsPermission: false, folderName: 'NostrKey' })),
        writeBlob: vi.fn(async () => ({ ok: true })),
        readBlob: vi.fn(async () => null),
        disconnect: vi.fn(async () => {}),
    };
    globalThis.__target = target;
    return { resolveFolderTarget: () => target, fsApiTarget: target, fileTarget: target };
});

import {
    enableCloudBackup, disableCloudBackup, isCloudBackupEnabled,
    getCloudStatus, cloudBackupNow, scheduleCloudBackup, restoreFromCloud,
} from '../src/utilities/cloud-backup.js';

const ENVELOPE = {
    format: 'nostrkey-backup', version: 1, createdAt: 'now',
    extensionVersion: '1.8.0', profileCount: 2, payload: { salt: 's', iv: 'i', ciphertext: 'c' },
};

let mock, target;

beforeEach(() => {
    mock = globalThis.__mock;
    target = globalThis.__target;
    for (const k of Object.keys(mock.store)) delete mock.store[k];
    target.silent = true;
    target.isAvailable = () => true;
    target.connect.mockClear().mockResolvedValue({ ok: true, folderName: 'NostrKey' });
    target.status.mockClear().mockResolvedValue({ connected: true, needsPermission: false, folderName: 'NostrKey' });
    target.writeBlob.mockClear().mockResolvedValue({ ok: true });
    target.readBlob.mockClear().mockResolvedValue(null);
    target.disconnect.mockClear().mockResolvedValue();
    mock.api.runtime.sendMessage.mockReset().mockImplementation(async (msg) => {
        if (msg.kind === 'backup.export') return { success: true, envelope: ENVELOPE };
        if (msg.kind === 'backup.import') return { success: true, profileCount: 2 };
        return { success: false };
    });
});

describe('enable / disable', () => {
    it('enable connects, persists state, and writes a first snapshot (silent target)', async () => {
        const res = await enableCloudBackup();
        expect(res.ok).toBe(true);
        expect(target.connect).toHaveBeenCalledOnce();
        expect(await isCloudBackupEnabled()).toBe(true);
        expect(mock.store['cloudBackup:mode']).toBe('folder');
        expect(mock.store['cloudBackup:folderName']).toBe('NostrKey');
        // first snapshot written
        expect(target.writeBlob).toHaveBeenCalledOnce();
    });

    it('enable does NOT auto-download on a manual (non-silent) target', async () => {
        target.silent = false;
        const res = await enableCloudBackup();
        expect(res.ok).toBe(true);
        expect(mock.store['cloudBackup:mode']).toBe('manual');
        expect(target.writeBlob).not.toHaveBeenCalled();
    });

    it('enable surfaces a cancelled picker without recording an error', async () => {
        const abort = Object.assign(new Error('x'), { name: 'AbortError' });
        target.connect.mockRejectedValueOnce(abort);
        const res = await enableCloudBackup();
        expect(res.ok).toBe(false);
        expect(res.error).toBe('cancelled');
        expect(await isCloudBackupEnabled()).toBe(false);
    });

    it('disable clears state and forgets the folder', async () => {
        await enableCloudBackup();
        await disableCloudBackup();
        expect(await isCloudBackupEnabled()).toBe(false);
        expect(target.disconnect).toHaveBeenCalledOnce();
        expect(mock.store['cloudBackup:folderName']).toBe(null);
    });
});

describe('write', () => {
    it('cloudBackupNow exports the real envelope and writes it to the folder', async () => {
        const res = await cloudBackupNow();
        expect(res.ok).toBe(true);
        expect(mock.api.runtime.sendMessage).toHaveBeenCalledWith({ kind: 'backup.export' });
        const [name, text] = target.writeBlob.mock.calls[0];
        expect(name).toBe('nostrkey-vault.enc');
        expect(JSON.parse(text)).toEqual(ENVELOPE); // exact backup.export format
        expect(typeof mock.store['cloudBackup:lastWriteAt']).toBe('number');
    });

    it('cloudBackupNow records an error when the vault is locked (export fails)', async () => {
        mock.api.runtime.sendMessage.mockImplementationOnce(async () => ({ success: false, error: 'locked' }));
        const res = await cloudBackupNow();
        expect(res.ok).toBe(false);
        expect(target.writeBlob).not.toHaveBeenCalled();
        expect(mock.store['cloudBackup:lastError']).toBeTruthy();
    });
});

describe('scheduleCloudBackup (debounced auto-save on change)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('coalesces a burst of edits into a single write', async () => {
        await mock.api.storage.local.set({ 'cloudBackup:enabled': true });
        scheduleCloudBackup();
        scheduleCloudBackup();
        scheduleCloudBackup();
        expect(target.writeBlob).not.toHaveBeenCalled(); // still debouncing
        await vi.advanceTimersByTimeAsync(2100);
        expect(target.writeBlob).toHaveBeenCalledOnce();
    });

    it('never auto-writes on a manual (non-silent) target', async () => {
        target.silent = false;
        await mock.api.storage.local.set({ 'cloudBackup:enabled': true });
        scheduleCloudBackup();
        await vi.advanceTimersByTimeAsync(3000);
        expect(target.writeBlob).not.toHaveBeenCalled();
    });

    it('does nothing when backup is disabled', async () => {
        scheduleCloudBackup();
        await vi.advanceTimersByTimeAsync(3000);
        expect(target.writeBlob).not.toHaveBeenCalled();
    });
});

describe('restore', () => {
    it('reads the blob and restores through backup.import', async () => {
        target.readBlob.mockResolvedValueOnce(JSON.stringify(ENVELOPE));
        const res = await restoreFromCloud('hunter2');
        expect(res.ok).toBe(true);
        expect(res.profileCount).toBe(2);
        expect(mock.api.runtime.sendMessage).toHaveBeenCalledWith({
            kind: 'backup.import',
            payload: { envelope: ENVELOPE, password: 'hunter2' },
        });
    });

    it('requires a password', async () => {
        const res = await restoreFromCloud('');
        expect(res.ok).toBe(false);
        expect(res.error).toMatch(/master password/i);
    });

    it('reports when no backup exists in the folder', async () => {
        target.readBlob.mockResolvedValueOnce(null);
        const res = await restoreFromCloud('pw');
        expect(res.ok).toBe(false);
        expect(res.error).toMatch(/no nostrkey backup/i);
    });

    it('reports a corrupt/unparseable file', async () => {
        target.readBlob.mockResolvedValueOnce('{not json');
        const res = await restoreFromCloud('pw');
        expect(res.ok).toBe(false);
        expect(res.error).toMatch(/not valid/i);
    });

    it('surfaces a wrong-password failure from backup.import', async () => {
        target.readBlob.mockResolvedValueOnce(JSON.stringify(ENVELOPE));
        mock.api.runtime.sendMessage.mockImplementationOnce(async () => ({ success: false, error: 'Wrong password' }));
        const res = await restoreFromCloud('nope');
        expect(res.ok).toBe(false);
        expect(res.error).toMatch(/wrong password/i);
    });
});

describe('status', () => {
    it('reflects the target + stored fields', async () => {
        await enableCloudBackup();
        const s = await getCloudStatus();
        expect(s).toMatchObject({
            available: true, silent: true, enabled: true,
            connected: true, needsPermission: false, mode: 'folder', folderName: 'NostrKey',
        });
    });

    it('reports needsPermission from the target', async () => {
        await enableCloudBackup();
        target.status.mockResolvedValueOnce({ connected: true, needsPermission: true, folderName: 'NostrKey' });
        const s = await getCloudStatus();
        expect(s.needsPermission).toBe(true);
    });
});
