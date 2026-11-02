/**
 * resetAllData on the real worker: everything goes, at rest and in memory, and
 * the vault comes back as a first run. It asks for no password. Only the sender
 * gate stands in front of it.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { bootUnlocked, bootWithPassword, PAGE_SENDER, HEX_A, localProfile, PUB_A } from './helpers/boot-worker.js';

const PASSWORD = 'correct horse battery staple';
const FRESH = {
    profiles: [{ name: 'Default Nostr Profile', privKey: '', pubKey: '' }],
    profileIndex: 0,
    isEncrypted: false,
    passwordHash: null,
    passwordSalt: null,
};

afterEach(() => { delete globalThis.chrome; });

async function unlockedVault(extra) {
    const env = await bootWithPassword(PASSWORD, extra);
    expect(await env.dispatch({ kind: 'unlock', payload: PASSWORD })).toMatchObject({ success: true });
    await env.flushWrites();
    return env;
}

describe('resetAllData', () => {
    it('leaves storage as a first run, whatever it held', async () => {
        const env = await unlockedVault({
            apiKeyVault: { k: 'v' }, vaultDocs: { d: 'v' }, autoLockMinutes: 30, somethingElse: 1,
        });
        expect(await env.dispatch({ kind: 'resetAllData' })).toEqual({ success: true });
        await env.flushWrites();
        expect(env.local._dump()).toEqual(FRESH);
    });

    it('needs no password, even on a locked vault', async () => {
        const env = await bootWithPassword(PASSWORD);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(true);
        expect(await env.dispatch({ kind: 'resetAllData' })).toEqual({ success: true });
        await env.flushWrites();
        expect(env.local._dump()).toEqual(FRESH);
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await env.dispatch({ kind: 'isEncrypted' })).toBe(false);
    });

    it('drops the decrypted keys', async () => {
        const env = await unlockedVault();
        expect((await env.dispatch({ kind: 'getActiveProfileInfo' })).hasKeys).toBe(true);
        await env.dispatch({ kind: 'resetAllData' });
        expect((await env.dispatch({ kind: 'getActiveProfileInfo' })).hasKeys).toBe(false);
    });

    it('drops the session key, so nothing can still be backed up', async () => {
        const env = await unlockedVault();
        expect(await env.dispatch({ kind: 'backup.export' })).toMatchObject({ success: true });
        await env.dispatch({ kind: 'resetAllData' });
        expect(await env.dispatch({ kind: 'backup.export' }))
            .toEqual({ success: false, error: 'Extension must be unlocked to create a backup' });
    });

    it('puts the security settings back to their defaults', async () => {
        const env = await unlockedVault({ nostrAccessWhileLocked: true, blockCrossOriginFrames: false, approvalsInTab: true });
        await env.dispatch({ kind: 'resetAllData' });
        expect(await env.dispatch({ kind: 'getNostrAccessWhileLocked' })).toBe(false);
        expect(await env.dispatch({ kind: 'getBlockCrossOriginFrames' })).toBe(true);
        expect(await env.dispatch({ kind: 'getApprovalsInTab' })).toBe(false);
    });

    it('turns a website away and leaves everything in place', async () => {
        const env = await bootUnlocked({ 'https://example.com': { getPubKey: 'allow' } });
        const before = env.local._dump();
        expect(await env.dispatch({ kind: 'resetAllData' }, PAGE_SENDER))
            .toEqual({ success: false, error: 'Unauthorized sender' });
        await env.flushWrites();
        expect(env.local._dump()).toEqual(before);
    });
});
