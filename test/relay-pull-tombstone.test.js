// @vitest-environment jsdom
/**
 * A pull from the relay does not bring back what was deleted on this device,
 * for vault documents and API keys, through the real pages and stores.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { startPage } from './helpers/start-page.js';

const relays = { read: ['wss://relay.example.com'], write: ['wss://relay.example.com'] };
const now = () => Math.floor(Date.now() / 1000);

async function openPage(env, htmlPath, modPath, fetchKind, fetchReply) {
    const sent = [];
    env.setSendMessage(async (m) => {
        sent.push(m);
        if (m.kind === 'isEncrypted') return true;
        if (m.kind === 'isLocked') return false;
        if (m.kind === 'vault.getRelays') return relays;
        if (m.kind === fetchKind) return fetchReply;
        if (m.kind.endsWith('.publish')) return { success: true, eventId: 'e'.repeat(64), createdAt: now() };
        return undefined;
    });
    const html = readFileSync(resolve(htmlPath), 'utf8');
    document.documentElement.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    await startPage(() => import(modPath));
    return sent;
}

afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('relay pull after a local delete', () => {
    it('API keys: a stale relay copy of a deleted key stays deleted', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const store = await import('../src/utilities/api-key-store.js');
        await store.saveApiKey('k1', 'Gone', 'gone-secret');
        await store.saveApiKey('k2', 'Kept', 'kept-secret');
        const stale = { ...(await store.getApiKey('k1')) };
        await store.deleteApiKey('k1');

        const sent = await openPage(env, 'src/api-keys/api-keys.html', '../src/api-keys/api-keys.js', 'apikeys.fetch', {
            success: true,
            keys: { k1: { ...stale, secret: 'gone-secret' }, k3: { id: 'k3', label: 'New', secret: 'n', updatedAt: now() + 10 } },
            eventId: 'f'.repeat(64), createdAt: now() + 10,
        });
        await vi.waitFor(async () => {
            expect(sent.some(m => m.kind === 'apikeys.fetch')).toBe(true);
            expect(Object.keys((await store.getApiKeyStore()).keys).sort()).toEqual(['k2', 'k3']);
        });
    });

    it('vault: a stale relay copy of a deleted document stays deleted', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        const store = await import('../src/utilities/vault-store.js');
        await store.saveDocumentLocal('gone.md', 'old', 'synced', 'a'.repeat(64), now() - 100);
        await store.deleteDocumentLocal('gone.md');

        const sent = await openPage(env, 'src/vault/vault.html', '../src/vault/vault.js', 'vault.fetch', {
            success: true,
            documents: [
                { path: 'gone.md', content: 'old', createdAt: now() - 100, eventId: 'a'.repeat(64) },
                { path: 'new.md', content: 'fresh', createdAt: now() + 10, eventId: 'b'.repeat(64) },
            ],
        });
        await vi.waitFor(() => expect(sent.some(m => m.kind === 'vault.getRelays')).toBe(true));
        document.getElementById('sync-btn').click();
        await vi.waitFor(async () => {
            expect(sent.some(m => m.kind === 'vault.fetch')).toBe(true);
            expect(Object.keys(await store.getVaultIndex())).toEqual(['new.md']);
        });
        expect(env.local._dump().deletedDocs['gone.md']).toBeTypeOf('number');
    });
});
