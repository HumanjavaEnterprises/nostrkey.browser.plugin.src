/**
 * backup.export and backup.import on the real worker. A backup is the stored
 * vault sealed with the session key. It needs an unlocked session to make, and
 * only the password that sealed it opens it.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { bootUnlocked, bootWithPassword, HEX_A } from './helpers/boot-worker.js';

const PASSWORD = 'correct horse battery staple';

afterEach(() => { delete globalThis.chrome; });

async function exported(extra) {
    const env = await bootWithPassword(PASSWORD, extra);
    await env.dispatch({ kind: 'unlock', payload: PASSWORD });
    const { envelope } = await env.dispatch({ kind: 'backup.export' });
    return { env, envelope };
}

const restore = (env, envelope, password = PASSWORD) =>
    env.dispatch({ kind: 'backup.import', payload: { envelope, password } });

describe('backup.export', () => {
    it('refuses without a session key: locked', async () => {
        const env = await bootWithPassword(PASSWORD);
        expect(await env.dispatch({ kind: 'backup.export' }))
            .toEqual({ success: false, error: 'Extension must be unlocked to create a backup' });
    });

    it('refuses without a session key: no password set', async () => {
        const env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'backup.export' }))
            .toEqual({ success: false, error: 'Extension must be unlocked to create a backup' });
    });

    it('refuses once the password has been removed', async () => {
        const env = await bootWithPassword(PASSWORD);
        await env.dispatch({ kind: 'unlock', payload: PASSWORD });
        expect(await env.dispatch({ kind: 'removePassword', payload: PASSWORD })).toMatchObject({ success: true });
        expect(await env.dispatch({ kind: 'backup.export' }))
            .toEqual({ success: false, error: 'Extension must be unlocked to create a backup' });
    });

    it('wraps the vault in a labelled envelope, sealed', async () => {
        const { envelope } = await exported({ apiKeyVault: { name: 'findable-secret-name' } });
        expect(envelope).toMatchObject({ format: 'nostrkey-backup', version: 1, profileCount: 1 });
        expect(Object.keys(envelope.payload).sort()).toEqual(['ciphertext', 'iv', 'salt']);
        expect(JSON.stringify(envelope)).not.toContain('findable-secret-name');
    });
});

describe('backup.import', () => {
    it('brings the vault back onto a wiped extension, unlocked, keys in hand', async () => {
        const { env, envelope } = await exported({ apiKeyVault: { name: 'kept' }, autoLockMinutes: 30 });
        await env.dispatch({ kind: 'resetAllData' });

        expect(await restore(env, envelope)).toMatchObject({ success: true });
        await env.flushWrites();
        expect(env.local._dump()).toMatchObject({ apiKeyVault: { name: 'kept' }, autoLockMinutes: 30, isEncrypted: true });
        expect(await env.dispatch({ kind: 'isLocked' })).toBe(false);
        expect(await env.dispatch({ kind: 'ncryptsec.encrypt', payload: { profileIndex: 0, password: 'x' } }))
            .toMatchObject({ success: true });
    });

    it('keeps access while locked off unless the backup turned it on', async () => {
        const { env, envelope } = await exported({ nostrAccessWhileLocked: false });
        await env.dispatch({ kind: 'setNostrAccessWhileLocked', payload: true });
        await restore(env, envelope);
        expect(await env.dispatch({ kind: 'getNostrAccessWhileLocked' })).toBe(false);
    });

    it('a wrong password changes nothing', async () => {
        const { env, envelope } = await exported();
        await env.flushWrites();
        const before = env.local._dump();
        expect(await restore(env, envelope, 'wrong'))
            .toEqual({ success: false, error: 'Wrong password — could not decrypt backup' });
        await env.flushWrites();
        expect(env.local._dump()).toEqual(before);
    });

    it.each([
        ['nothing', null],
        ['another format', { format: 'some-other-backup', version: 1, payload: {} }],
    ])('refuses %s as not a backup', async (_, envelope) => {
        const { env } = await exported();
        expect(await restore(env, envelope))
            .toEqual({ success: false, error: 'Not a valid NostrKey backup file' });
    });

    it.each([
        ['newer', 2],
        ['unnumbered', '1'],
        ['missing', undefined],
    ])('refuses a version that is %s', async (_, version) => {
        const { env, envelope } = await exported();
        expect(await restore(env, { ...envelope, version }))
            .toEqual({ success: false, error: 'Backup version not supported. Update NostrKey and try again.' });
    });
});
