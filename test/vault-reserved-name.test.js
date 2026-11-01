// @vitest-environment jsdom
/**
 * The real vault page and store, with the name the API key store uses on the relay.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { startPage } from './helpers/start-page.js';

const html = readFileSync(resolve('src/vault/vault.html'), 'utf8');

async function openVault() {
    vi.resetModules();
    const env = installFakeChrome();
    const sent = [];
    env.setSendMessage(async (m) => {
        sent.push(m);
        if (m.kind === 'isEncrypted') return true;
        if (m.kind === 'vault.getRelays') return { read: [], write: [] };
        return { success: true, eventId: 'e'.repeat(64), createdAt: 1700000000 };
    });
    document.documentElement.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    await startPage(() => import('../src/vault/vault.js'));
    await vi.waitFor(() => expect(sent.some(m => m.kind === 'vault.getRelays')).toBe(true));
    return { env, sent };
}

function saveAs(title) {
    document.getElementById('new-doc-btn').click();
    const el = document.getElementById('editor-title');
    el.value = title;
    el.dispatchEvent(new Event('input'));
    const content = document.getElementById('editor-content');
    content.value = 'body';
    content.dispatchEvent(new Event('input'));
    document.getElementById('save-doc-btn').click();
}

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('a vault document named like the API key store', () => {
    it('is refused on the page, before anything is sent or stored', async () => {
        const { env, sent } = await openVault();
        saveAs('vault/api-keys');
        await vi.waitFor(() => expect(document.getElementById('toast').textContent).toMatch(/another title/i));
        expect(sent.some(m => m.kind === 'vault.publish')).toBe(false);
        expect(env.local._dump().vaultDocs?.['vault/api-keys']).toBeUndefined();
    });

    it('any other title saves as before', async () => {
        const { sent } = await openVault();
        saveAs('vault/notes.md');
        await vi.waitFor(() => expect(sent.some(m => m.kind === 'vault.publish')).toBe(true));
    });

    it('a copy an earlier version stored is no longer listed', async () => {
        vi.resetModules();
        installFakeChrome();
        const store = await import('../src/utilities/vault-store.js');
        await store.saveDocumentLocal('vault/api-keys', '{"one":{}}', 'synced');
        await store.saveDocumentLocal('notes/a.md', 'kept', 'synced');
        expect((await store.listDocuments()).map(d => d.path)).toEqual(['notes/a.md']);
    });
});
