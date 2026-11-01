// @vitest-environment jsdom
/**
 * API key secrets across two devices, with the real store and the real page. A
 * key saved on one device can be unreadable on another, and that second device
 * must not be able to blank the first one's secret through the relay.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { startPage } from './helpers/start-page.js';

const html = readFileSync(resolve('src/api-keys/api-keys.html'), 'utf8');
const relays = { read: ['wss://relay.example.com'], write: ['wss://relay.example.com'] };

/** One device: its own storage and, from a fresh module load, its own device key. */
async function device() {
    vi.resetModules();
    const env = installFakeChrome();
    const store = await import('../src/utilities/api-key-store.js');
    return { env, store };
}

/** Open the real API Keys page on the current device, with the worker stood in for. */
async function openPage(env, onMessage = () => undefined) {
    const sent = [];
    env.setSendMessage(async (m) => {
        sent.push(m);
        const canned = onMessage(m);
        if (canned !== undefined) return canned;
        if (m.kind === 'isEncrypted') return true;
        if (m.kind === 'isLocked') return false;
        if (m.kind === 'vault.getRelays') return relays;
        if (m.kind === 'apikeys.fetch') return { success: true, keys: null };
        if (m.kind === 'apikeys.publish') return { success: true, eventId: 'e'.repeat(64), createdAt: 1700000000 };
        return undefined;
    });
    document.documentElement.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    await startPage(() => import('../src/api-keys/api-keys.js'));
    await vi.waitFor(() => expect(sent.some(m => m.kind === 'apikeys.fetch')).toBe(true));
    return sent;
}

async function addKeyOnPage(label, secret) {
    const type = (id, value) => {
        const el = document.getElementById(id);
        el.value = value;
        el.dispatchEvent(new Event('input'));
    };
    type('new-label', label);
    type('new-secret', secret);
    document.getElementById('add-key-btn').click();
}

/** Give B a key as sync would: the same stored ciphertext, wrapped on device A. */
async function carryOver(from, to, id) {
    const raw = from.env.local._dump().apiKeyVault.keys[id];
    await to.env.local.set({ apiKeyVault: { keys: { [id]: raw }, syncEnabled: true } });
}

afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('publishing from a device that cannot read a key', () => {
    it('A keeps its secret after B publishes and A imports what B sent', async () => {
        const a = await device();
        await a.store.saveApiKey('k1', 'Service', 'real-secret');

        const b = await device();
        await carryOver(a, b, 'k1');
        expect((await b.store.getApiKey('k1')).undecryptable).toBe(true);

        const sent = await openPage(b.env);
        await addKeyOnPage('Another', 'another-secret');
        const publish = await vi.waitFor(() => {
            const found = sent.find(m => m.kind === 'apikeys.publish');
            expect(found).toBeTruthy();
            return found;
        });

        // Over the relay and back, as JSON.
        const relayed = JSON.parse(JSON.stringify(publish.payload.keys));
        expect(Object.keys(relayed)).not.toContain('k1');
        await a.store.importStore(relayed);

        expect((await a.store.getApiKey('k1')).secret).toBe('real-secret');
        expect(a.env.local._dump().apiKeyVault.keys.k1.secret).toBeTypeOf('string');
    });

    it('sends only the keys it can read', async () => {
        const a = await device();
        await a.store.saveApiKey('k1', 'Unreadable', 'real-secret');
        const b = await device();
        await carryOver(a, b, 'k1');
        await b.store.saveApiKey('k2', 'Readable', 'readable-secret');

        const out = await b.store.keysForRelay();
        expect(Object.keys(out)).toEqual(['k2']);
        expect(out.k2.secret).toBe('readable-secret');
    });
});

describe('importStore leaves a good secret alone', () => {
    it.each([
        ['a null secret', { id: 'k1', label: 'Bad', secret: null, undecryptable: true }],
        ['a null secret with no flag', { id: 'k1', label: 'Bad', secret: null }],
        ['no secret at all', { id: 'k1', label: 'Bad' }],
        ['a number', { id: 'k1', label: 'Bad', secret: 7 }],
        ['an object', { id: 'k1', label: 'Bad', secret: { a: 1 } }],
        ['a blank', { id: 'k1', label: 'Bad', secret: '' }],
        ['the unreadable flag on a string', { id: 'k1', label: 'Bad', secret: 'blob', undecryptable: true }],
    ])('skips %s', async (_, entry) => {
        const a = await device();
        await a.store.saveApiKey('k1', 'Service', 'real-secret');
        const before = a.env.local._dump().apiKeyVault.keys.k1;

        await a.store.importStore({ k1: entry });

        expect(a.env.local._dump().apiKeyVault.keys.k1).toEqual(before);
        expect((await a.store.getApiKey('k1')).secret).toBe('real-secret');
    });

    it('does not add a new key with nothing to keep, and still takes the good ones', async () => {
        const a = await device();
        const counts = await a.store.importStore({
            bad: { id: 'bad', label: 'Bad', secret: null, undecryptable: true },
            none: null,
            good: { id: 'good', label: 'Good', secret: 'good-secret' },
        });
        expect(counts).toEqual({ imported: 1, skipped: 2 });
        expect((await a.store.listApiKeys()).map(k => k.id)).toEqual(['good']);
    });
});
