/**
 * Shared harness for the consent-surface Ring-2 e2e specs.
 *
 * These tests load the REAL extension in a real Chromium and exercise the parts
 * of the consent surface that jsdom cannot prove: the in-page bottom sheet is an
 * extension-origin iframe injected by the content script, the redress guard runs
 * against real layout/compositing, and the sheet<->FAB<->tab lifecycle depends on
 * real event routing. See qa/test-coverage-map.md §4 (Ring-2 owed) for why these
 * are here and not in the vitest suite.
 */
import { chromium } from '@playwright/test';
import path from 'path';

export const EXTENSION_PATH = path.resolve('distros/chrome');

// Canonical BIP-340 demo vector (test/vectors/nostr-vectors.json → alice).
// smallest valid secret key = 1; x-only pubkey = generator G.x. Disposable — this
// is a public known-answer vector, never a real key.
export const ALICE = {
  privKey: '0000000000000000000000000000000000000000000000000000000000000001',
  pubKey: '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
};

// A benign origin we intercept and serve our own fixture on, so the content
// script injects (real https origin) without any network dependency.
export const FIXTURE_URL = 'https://example.com/';

const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>NostrKey e2e fixture</title></head>
<body><h1>NostrKey consent e2e</h1>
<script>
  // Result sink the test polls. signEvent stays pending until the user consents,
  // so __triggerSign is fire-and-forget — never awaited by the test.
  window.__nk = { sig: undefined, err: undefined, done: false };
  window.__triggerSign = () => {
    window.__nk = { sig: undefined, err: undefined, done: false };
    window.nostr.signEvent({ kind: 1, created_at: Math.floor(Date.now()/1000), tags: [], content: 'e2e' })
      .then(ev => { window.__nk.sig = ev; })
      .catch(e => { window.__nk.err = String((e && e.message) || e); })
      .finally(() => { window.__nk.done = true; });
  };
  // Redress attack: re-parent the injected consent host under a near-transparent
  // filter group. The host is the documentElement child pinned to max z-index.
  window.__redress = () => {
    const host = Array.from(document.documentElement.children)
      .find(el => el.tagName === 'DIV' && el.style && el.style.zIndex === '2147483647');
    if (!host) return 'no-host';
    const wrap = document.createElement('div');
    wrap.id = '__attack_wrap';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483647;filter:opacity(0.02)';
    document.documentElement.appendChild(wrap);
    wrap.appendChild(host);
    return 'reparented';
  };
  // Count injected consent hosts (sheet or FAB) currently in light DOM.
  window.__consentHostCount = () => Array.from(document.documentElement.children)
    .filter(el => el.tagName === 'DIV' && el.style && el.style.zIndex === '2147483647').length;
</script></body></html>`;

/** Launch a persistent context with the extension loaded and return {context, extensionId, sw}. */
export async function launchWithExtension() {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
  let sw = context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'));
  const extensionId = sw.url().split('/')[2];
  return { context, extensionId, sw };
}

/** Seed a single unlocked local profile straight into the extension's storage. */
export async function seedLocalProfile(sw, profile = ALICE) {
  await sw.evaluate(async (p) => {
    await chrome.storage.local.set({
      profiles: [{ name: 'E2E', type: 'local', pubKey: p.pubKey, privKey: p.privKey }],
      profileIndex: 0,
      isEncrypted: false,
    });
    // Clear any remembered per-site grants so signEvent always prompts.
    const all = await chrome.storage.local.get(null);
    for (const k of Object.keys(all)) {
      if (k.startsWith('permissions') || k === 'hosts') await chrome.storage.local.remove(k);
    }
  }, profile);
}

/** Open the fixture page (content script injected) with window.nostr ready. */
export async function openFixture(context) {
  const page = await context.newPage();
  await page.route(FIXTURE_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: FIXTURE_HTML }));
  await page.goto(FIXTURE_URL);
  await page.waitForFunction(() => typeof window.nostr !== 'undefined', { timeout: 10000 });
  return page;
}

/** The injected permission iframe as a Playwright Frame, or null. Frames are visible even inside a closed shadow root. */
export function permissionFrame(page) {
  return page.frames().find(f => f.url().includes('permission/permission.html')) || null;
}

/** Wait until the injected permission iframe is present in the page's frame tree. */
export async function waitForPermissionFrame(page, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const f = permissionFrame(page);
    if (f) return f;
    await page.waitForTimeout(100);
  }
  return null;
}
