// @vitest-environment jsdom
/**
 * Folder SHIM tests — the one per-browser file.
 *
 * Proves the File System Access API target (Chromium) against a fake
 * directory handle + an in-memory idb, and the Save/Open-file fallback
 * (Firefox/Safari/iOS) against jsdom's DOM. resolveFolderTarget() must pick the
 * right one purely from feature detection.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// in-memory idb so handle persistence works without a real IndexedDB
vi.mock('idb', () => {
    const dbs = {};
    return {
        openDB: async (name) => {
            dbs[name] ??= {};
            return {
                objectStoreNames: { contains: () => true },
                createObjectStore: () => {},
                get: async (store, key) => (dbs[name][store] || {})[key],
                put: async (store, val, key) => { (dbs[name][store] ??= {})[key] = val; },
                delete: async (store, key) => { if (dbs[name][store]) delete dbs[name][store][key]; },
            };
        },
        __reset: () => { for (const k of Object.keys(dbs)) delete dbs[k]; },
    };
});

import { resolveFolderTarget, fsApiTarget, fileTarget } from '../src/shims/folder-target.js';
import * as idb from 'idb';

// A fake FileSystemDirectoryHandle backed by an in-memory file map.
function makeDirHandle(name = 'NostrKey', { query = 'granted', request = 'granted' } = {}) {
    const files = {};
    return {
        name,
        _files: files,
        queryPermission: vi.fn(async () => query),
        requestPermission: vi.fn(async () => request),
        getFileHandle: vi.fn(async (fname, opts) => {
            if (!files[fname]) {
                if (!opts || !opts.create) {
                    throw Object.assign(new Error('not found'), { name: 'NotFoundError' });
                }
                files[fname] = { content: '' };
            }
            return {
                createWritable: async () => ({
                    write: async (t) => { files[fname].content = t; },
                    close: async () => {},
                }),
                getFile: async () => ({ text: async () => files[fname].content }),
            };
        }),
    };
}

beforeEach(() => { idb.__reset(); vi.restoreAllMocks(); });

describe('resolveFolderTarget (feature detection)', () => {
    it('picks the File System Access target when showDirectoryPicker exists', () => {
        window.showDirectoryPicker = () => {};
        expect(resolveFolderTarget().id).toBe('fsapi');
        delete window.showDirectoryPicker;
    });

    it('falls back to the file target when it does not', () => {
        delete window.showDirectoryPicker;
        expect(resolveFolderTarget().id).toBe('file');
    });
});

describe('fsApiTarget (Chromium — File System Access API)', () => {
    it('connect picks a folder and persists the handle', async () => {
        const handle = makeDirHandle('MyCloud');
        window.showDirectoryPicker = vi.fn(async () => handle);
        const res = await fsApiTarget.connect();
        expect(res).toEqual({ ok: true, folderName: 'MyCloud' });
        // handle persisted → status sees it without re-picking
        const st = await fsApiTarget.status();
        expect(st).toMatchObject({ connected: true, needsPermission: false, folderName: 'MyCloud' });
        delete window.showDirectoryPicker;
    });

    it('round-trips: write then read the same blob silently', async () => {
        const handle = makeDirHandle();
        window.showDirectoryPicker = vi.fn(async () => handle);
        await fsApiTarget.connect();
        await fsApiTarget.writeBlob('nostrkey-vault.enc', 'SECRET-BLOB');
        expect(handle._files['nostrkey-vault.enc'].content).toBe('SECRET-BLOB');
        const back = await fsApiTarget.readBlob('nostrkey-vault.enc');
        expect(back).toBe('SECRET-BLOB');
        // overwrite on next change
        await fsApiTarget.writeBlob('nostrkey-vault.enc', 'UPDATED');
        expect(await fsApiTarget.readBlob('nostrkey-vault.enc')).toBe('UPDATED');
        delete window.showDirectoryPicker;
    });

    it('readBlob returns null when no backup exists yet', async () => {
        const handle = makeDirHandle();
        window.showDirectoryPicker = vi.fn(async () => handle);
        await fsApiTarget.connect();
        expect(await fsApiTarget.readBlob('nostrkey-vault.enc')).toBe(null);
        delete window.showDirectoryPicker;
    });

    it('re-grants permission when the persisted handle is in prompt state', async () => {
        const handle = makeDirHandle('C', { query: 'prompt', request: 'granted' });
        window.showDirectoryPicker = vi.fn(async () => handle);
        await fsApiTarget.connect();          // connect itself needs the grant
        await fsApiTarget.writeBlob('nostrkey-vault.enc', 'X');
        expect(handle.requestPermission).toHaveBeenCalled();
        expect(handle._files['nostrkey-vault.enc'].content).toBe('X');
        delete window.showDirectoryPicker;
    });

    it('throws NEEDS_PERMISSION when the grant is refused', async () => {
        // connect succeeds (granted), but a later session denies re-grant
        const handle = makeDirHandle('C', { query: 'granted', request: 'granted' });
        window.showDirectoryPicker = vi.fn(async () => handle);
        await fsApiTarget.connect();
        handle.queryPermission.mockResolvedValue('prompt');
        handle.requestPermission.mockResolvedValue('denied');
        await expect(fsApiTarget.writeBlob('nostrkey-vault.enc', 'X'))
            .rejects.toMatchObject({ code: 'NEEDS_PERMISSION' });
        delete window.showDirectoryPicker;
    });

    it('writeBlob throws NOT_CONNECTED with no folder', async () => {
        await fsApiTarget.disconnect();
        await expect(fsApiTarget.writeBlob('x', 'y')).rejects.toMatchObject({ code: 'NOT_CONNECTED' });
    });
});

describe('fileTarget (Firefox / Safari / iOS fallback)', () => {
    it('is a non-silent, always-available floor', () => {
        expect(fileTarget.silent).toBe(false);
        expect(fileTarget.isAvailable()).toBe(true);
    });

    it('writeBlob triggers a download', async () => {
        const click = vi.fn();
        const realCreate = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = realCreate(tag);
            if (tag === 'a') el.click = click;
            return el;
        });
        // jsdom lacks these — stub so the download path runs
        globalThis.URL.createObjectURL = vi.fn(() => 'blob:x');
        globalThis.URL.revokeObjectURL = vi.fn();
        const res = await fileTarget.writeBlob('nostrkey-vault.enc', 'DATA');
        expect(res).toMatchObject({ ok: true, downloaded: true });
        expect(click).toHaveBeenCalledOnce();
    });

    it('readBlob resolves the chosen file text', async () => {
        const realCreate = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = realCreate(tag);
            if (tag === 'input') {
                // simulate the user picking a file the moment click() is called
                el.click = () => {
                    Object.defineProperty(el, 'files', {
                        value: [{ text: async () => 'RESTORED-BLOB' }], configurable: true,
                    });
                    el.onchange();
                };
            }
            return el;
        });
        const text = await fileTarget.readBlob('nostrkey-vault.enc');
        expect(text).toBe('RESTORED-BLOB');
    });
});
