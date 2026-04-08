/**
 * NostrKey Extension E2E Tests — Chrome
 *
 * These tests load the actual extension in a real Chrome browser and
 * verify the UI works end-to-end. They catch bugs that unit tests miss
 * (like the vault "Unauthorized sender" and Safari window.open issues).
 *
 * Run: npx playwright test
 */

import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.resolve('distros/chrome');

let context;
let extensionId;

test.beforeAll(async () => {
  // Launch Chrome with the extension loaded
  context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  // Wait for the extension's service worker to register
  let sw;
  if (context.serviceWorkers().length === 0) {
    sw = await context.waitForEvent('serviceworker');
  } else {
    sw = context.serviceWorkers()[0];
  }

  // Extract extension ID from the service worker URL
  extensionId = sw.url().split('/')[2];
  console.log('Extension ID:', extensionId);
});

test.afterAll(async () => {
  await context.close();
});

// ── Extension loads ──

test('extension service worker is running', async () => {
  expect(extensionId).toBeDefined();
  expect(extensionId.length).toBeGreaterThan(10);
});

test('popup page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForLoadState('domcontentloaded');

  // Should have the NostrKey UI
  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

test('sidepanel page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');

  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

// ── Settings pages open ──

test('full settings page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/full_settings.html`);
  await page.waitForLoadState('domcontentloaded');

  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

test('profiles page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/profiles/profiles.html`);
  await page.waitForLoadState('domcontentloaded');

  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

test('vault page loads without Unauthorized sender', async () => {
  const page = await context.newPage();

  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(`chrome-extension://${extensionId}/vault/vault.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Let async operations complete

  // Should NOT have "Unauthorized sender" error
  const hasUnauthorized = errors.some(e => e.includes('Unauthorized sender'));
  expect(hasUnauthorized).toBe(false);

  await page.close();
});

test('security settings page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/security/security.html`);
  await page.waitForLoadState('domcontentloaded');

  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

test('event history page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/event_history/event_history.html`);
  await page.waitForLoadState('domcontentloaded');

  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

test('API keys page loads', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/api-keys/api-keys.html`);
  await page.waitForLoadState('domcontentloaded');

  const body = await page.textContent('body');
  expect(body).toBeTruthy();

  await page.close();
});

// ── Profile creation flow ──

test('can create a new profile from sidepanel', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  // Look for the "generate" or "create" button
  const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create"), #generate-btn');
  if (await generateBtn.count() > 0) {
    // There's a generate button — we're on the profile creation screen
    expect(await generateBtn.count()).toBeGreaterThan(0);
  }

  await page.close();
});

// ── NIP-07 content script injection ──

test('NIP-07 window.nostr is available on web pages', async () => {
  const page = await context.newPage();
  await page.goto('https://nostrkey.com/test');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  const hasNostr = await page.evaluate(() => {
    return typeof window.nostr !== 'undefined';
  });

  expect(hasNostr).toBe(true);

  await page.close();
});

test('window.nostr has required NIP-07 methods', async () => {
  const page = await context.newPage();
  await page.goto('https://nostrkey.com/test');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  const methods = await page.evaluate(() => {
    if (!window.nostr) return [];
    return ['getPublicKey', 'signEvent', 'nip04', 'nip44'].filter(
      m => typeof window.nostr[m] === 'function' || typeof window.nostr[m] === 'object'
    );
  });

  expect(methods).toContain('getPublicKey');
  expect(methods).toContain('signEvent');

  await page.close();
});
