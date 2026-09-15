/**
 * GitHub issue #5 — "Cannot create new vault on iOS".
 *
 * Symptom: on the iOS Safari Web Extension, confirming the master password
 * during NEW VAULT CREATION failed with "Unauthorised sender". The report is a
 * regression of the T0-1 boundary: `setPassword` is a SENSITIVE_KIND, so it must
 * originate from an extension-owned surface, and the sender gate
 * (`isExtensionSender` in src/background.js) rejects anything else.
 *
 * Root cause (fixed in e27893c, shipped in 1.8.2): the gate hardcoded
 * `chrome-extension://<id>` for tab/framed senders. On iOS an extension page
 * opened in a tab has `sender.url = safari-web-extension://<uuid>/...`, which the
 * hardcoded chrome prefix never matched, so a legitimate first-run
 * vault-creation message was rejected. The gate now derives the origin from
 * `runtime.getURL('')`, which is correct on Chrome, Firefox AND Safari.
 *
 * These tests drive the REAL background worker through the same message seam the
 * app uses (there is no exported `isExtensionSender`; the seam is the
 * onMessage listener, matching test/session-vault.test.js). The iOS case asserts
 * the CORRECT behaviour: a legitimate extension-owned iOS sender IS authorized.
 * If the pre-e27893c bug is reintroduced, that assertion goes RED.
 *
 * The Safari/iOS shape is reproduced with `namespace: 'browser'` (Safari exposes
 * `browser`, not `chrome`) and `origin: 'safari-web-extension://<uuid>/'`, as the
 * fake-chrome helper documents.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

const IOS_UUID = 'safari-web-extension://11111111-2222-3333-4444-555555555555/';
const REJECTED = { success: false, error: 'Unauthorized sender' };

/** Let the background's async startup IIFE run to completion. */
async function settle(ticks = 12) {
    for (let i = 0; i < ticks; i++) await new Promise(r => setTimeout(r, 0));
}

function profile(name, privKey) {
    return { name, privKey, pubKey: '', hosts: {}, relays: [], type: 'local' };
}

/**
 * Boot a fresh background worker against a fresh fake runtime whose origin and
 * namespace can be set, so the same worker can be exercised as Chrome or as the
 * iOS Safari Web Extension.
 */
async function bootBackground({ origin, namespace } = {}) {
    vi.resetModules();
    const env = installFakeChrome({ alarms: true, origin, namespace });
    // First-run / new-vault state: passwordless, one local profile, no verifier.
    env.local._seed({ autoLockMinutes: 0, profiles: [profile('P1', '')], profileIndex: 0 });
    env.setSendMessage((msg) => env.dispatch(msg));
    await import('../src/background.js');
    await settle();
    return env;
}

afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('issue #5 — new-vault setPassword must be authorized from the iOS extension surface', () => {
    it('AUTHORIZES a first-run setPassword from a Chrome extension page opened in a tab (control)', async () => {
        const env = await bootBackground({ origin: 'chrome-extension://test/', namespace: 'chrome' });
        const chromeSender = {
            id: 'test-extension-id',
            tab: { id: 7 },
            url: 'chrome-extension://test/sidepanel.html',
        };
        const res = await env.dispatch({ kind: 'setPassword', payload: 'correct horse battery staple' }, chromeSender);
        // The gate let it through — it is NOT the sender-gate rejection.
        expect(res).not.toEqual(REJECTED);
    });

    it('AUTHORIZES a first-run setPassword from the iOS Safari Web Extension surface (RED before e27893c)', async () => {
        // Real iOS shape: `browser` namespace, safari-web-extension origin, and an
        // extension page opened in a tab — the branch the old hardcoded
        // chrome-extension:// prefix wrongly rejected.
        const env = await bootBackground({ origin: IOS_UUID, namespace: 'browser' });
        const iosSender = {
            id: 'test-extension-id',
            tab: { id: 7 },
            url: `${IOS_UUID}sidepanel.html`,
        };
        const res = await env.dispatch({ kind: 'setPassword', payload: 'correct horse battery staple' }, iosSender);
        // A legitimate extension-owned iOS sender MUST be authorized. If the gate
        // reverts to a hardcoded chrome origin, this equals REJECTED and fails.
        expect(res).not.toEqual(REJECTED);
    });

    it('STILL rejects setPassword from a real web page on iOS (T0-1 boundary preserved)', async () => {
        // The fix must not widen the gate to arbitrary pages: a content script in
        // a web page carries the PAGE url, not the extension origin, so even under
        // the iOS runtime it is rejected. This is the hole that must stay closed.
        const env = await bootBackground({ origin: IOS_UUID, namespace: 'browser' });
        const pageSender = {
            id: 'test-extension-id',
            tab: { id: 7 },
            url: 'https://evil.example/page',
        };
        const res = await env.dispatch({ kind: 'setPassword', payload: 'correct horse battery staple' }, pageSender);
        expect(res).toEqual(REJECTED);
    });

    it('STILL rejects setPassword from a foreign extension id on iOS', async () => {
        const env = await bootBackground({ origin: IOS_UUID, namespace: 'browser' });
        const res = await env.dispatch(
            { kind: 'setPassword', payload: 'correct horse battery staple' },
            { id: 'some-other-extension' },
        );
        expect(res).toEqual(REJECTED);
    });
});
