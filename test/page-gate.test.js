// @vitest-environment jsdom
/**
 * What each of the extension's own pages does when the worker refuses to answer
 * its first questions. The refusal is the worker's own shape. Every page is the
 * real page, from its real HTML.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installFakeChrome } from './helpers/fake-chrome.js';
import { startPage } from './helpers/start-page.js';

const REFUSED = { success: false, error: 'Unauthorized sender' };
const START_ERROR = 'NostrKey could not start this page. Reload or reinstall.';

const PAGES = [
    ['popup', 'src/popup.html', '../src/popup.js'],
    ['side panel', 'src/sidepanel.html', '../src/sidepanel.js'],
    ['security', 'src/security/security.html', '../src/security/security.js'],
    ['vault', 'src/vault/vault.html', '../src/vault/vault.js'],
    ['API keys', 'src/api-keys/api-keys.html', '../src/api-keys/api-keys.js'],
    ['Nostr keys', 'src/nostr-keys/nostr-keys.html', '../src/nostr-keys/nostr-keys.js'],
    ['full settings', 'src/full_settings.html', '../src/options.js'],
];

const pageLoads = {
    '../src/popup.js': () => import('../src/popup.js'),
    '../src/sidepanel.js': () => import('../src/sidepanel.js'),
    '../src/security/security.js': () => import('../src/security/security.js'),
    '../src/vault/vault.js': () => import('../src/vault/vault.js'),
    '../src/api-keys/api-keys.js': () => import('../src/api-keys/api-keys.js'),
    '../src/nostr-keys/nostr-keys.js': () => import('../src/nostr-keys/nostr-keys.js'),
    '../src/options.js': () => import('../src/options.js'),
};

const healthy = (locked) => (m) => {
    if (m.kind === 'isEncrypted') return true;
    if (m.kind === 'isLocked') return locked;
    if (m.kind === 'hasEncryptedData') return { found: true, hasPasswordHash: true, encryptedProfiles: 1, strandedKeys: 0 };
    if (m.kind === 'vault.getRelays') return { read: [], write: [] };
    return undefined;
};

async function openPage(htmlPath, script, answer) {
    vi.resetModules();
    const env = installFakeChrome();
    const sent = [];
    env.setSendMessage(async (m) => { sent.push(m); return answer(m); });
    const html = readFileSync(resolve(htmlPath), 'utf8');
    document.documentElement.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    await startPage(pageLoads[script]);
    await vi.waitFor(() => expect(sent.length).toBeGreaterThan(0));
    await new Promise(r => setTimeout(r, 20));
    return { env, sent };
}

const startError = () => document.querySelector('[role="alert"][data-start-error]');

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe.each(PAGES)('the %s page', (_, html, script) => {
    it('says it could not start when every question is refused', async () => {
        await openPage(html, script, () => REFUSED);
        expect(startError()?.textContent).toBe(START_ERROR);
        expect(document.body.textContent.trim()).toBe(START_ERROR);
    });

    it('does not take a healthy locked vault for a failure', async () => {
        await openPage(html, script, healthy(true));
        expect(startError()).toBeNull();
    });

    it('does not take a healthy open vault for a failure', async () => {
        await openPage(html, script, healthy(false));
        expect(startError()).toBeNull();
    });
});

describe.each([
    ['isLocked'], ['isEncrypted'], ['hasEncryptedData'],
])('a refused %s alone', (kind) => {
    it.each([
        ['popup', 'src/popup.html', '../src/popup.js'],
        ['side panel', 'src/sidepanel.html', '../src/sidepanel.js'],
        ['security', 'src/security/security.html', '../src/security/security.js'],
    ])('stops the %s page', async (_, html, script) => {
        const well = healthy(false);
        await openPage(html, script, (m) => (m.kind === kind ? REFUSED : well(m)));
        expect(startError()?.textContent).toBe(START_ERROR);
    });
});

describe.each([
    ['the API keys page', 'isLocked', 'src/api-keys/api-keys.html', '../src/api-keys/api-keys.js'],
    ['full settings', 'isEncrypted', 'src/full_settings.html', '../src/options.js'],
])('%s', (_, kind, html, script) => {
    it(`stops on a refused ${kind} alone`, async () => {
        const well = healthy(false);
        await openPage(html, script, (m) => (m.kind === kind ? REFUSED : well(m)));
        expect(startError()?.textContent).toBe(START_ERROR);
    });
});

describe('after the side panel has started', () => {
    it('a refused vault check reads as a failure, not as an empty device', async () => {
        let refuse = false;
        const well = healthy(false);
        await openPage('src/sidepanel.html', '../src/sidepanel.js', (m) => {
            if (m.kind === 'isEncrypted') return false;
            if (m.kind === 'hasEncryptedData') return refuse ? REFUSED : { found: false, hasPasswordHash: false, strandedKeys: 0 };
            return well(m);
        });
        expect(startError()).toBeNull();
        refuse = true;
        document.getElementById('check-vault-btn').click();
        await vi.waitFor(() => expect(startError()?.textContent).toBe(START_ERROR));
        expect(document.body.textContent).not.toContain('No existing vault found');
    });
});

describe('getNpub', () => {
    it('gives nothing, not the refusal, to a page that shows it', async () => {
        vi.resetModules();
        const env = installFakeChrome();
        env.setSendMessage(async () => REFUSED);
        const { getNpub } = await import('../src/utilities/utils.js');
        expect(await getNpub(0)).toBeNull();
    });
});
