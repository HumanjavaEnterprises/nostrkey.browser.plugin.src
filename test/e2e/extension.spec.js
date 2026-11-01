/**
 * NostrKey Extension E2E Tests — Chrome
 *
 * These tests load the actual extension in a real Chrome browser and
 * verify the UI works end-to-end. They catch bugs that unit tests miss
 * (like the vault "Unauthorized sender" and Safari window.open issues).
 *
 * Run: npx playwright test test/e2e/extension.spec.js
 */

import { test, expect } from '@playwright/test';
import { launchWithExtension, openFixture, seedLocalProfile } from './helpers/consent-harness.js';

let context;
let extensionId;
let sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
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

test('can create a new profile from the sidepanel', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.locator('#add-profile-btn').click();
  await page.locator('#edit-profile-name').fill('Second');
  await page.locator('#generate-key-btn').click();
  await expect(page.locator('#profile-edit-success')).toHaveText('Key generated!');
  const key = await page.locator('#edit-profile-key').inputValue();
  expect(key).not.toBe('');
  await page.locator('#save-profile-btn').click();
  await expect(page.locator('#profile-edit-success')).toHaveText('Profile created!');

  const { profiles, profileIndex } = await sw.evaluate(() => chrome.storage.local.get(['profiles', 'profileIndex']));
  expect(profiles.map(p => p.name)).toEqual(['E2E', 'Second']);
  expect(profileIndex).toBe(1);
  expect(profiles[1].pubKey).toMatch(/^[0-9a-f]{64}$/);
  expect(JSON.stringify(profiles)).not.toContain(key);

  await page.close();
});

// ── NIP-07 content script injection ──

test('NIP-07 window.nostr is available on web pages', async () => {
  const page = await openFixture(context);
  expect(await page.evaluate(() => typeof window.nostr)).toBe('object');
  await page.close();
});

test('window.nostr has the NIP-07 methods', async () => {
  const page = await openFixture(context);
  const types = await page.evaluate(() => ({
    getPublicKey: typeof window.nostr.getPublicKey,
    signEvent: typeof window.nostr.signEvent,
    getRelays: typeof window.nostr.getRelays,
    'nip04.encrypt': typeof window.nostr.nip04?.encrypt,
    'nip04.decrypt': typeof window.nostr.nip04?.decrypt,
    'nip44.encrypt': typeof window.nostr.nip44?.encrypt,
    'nip44.decrypt': typeof window.nostr.nip44?.decrypt,
  }));
  expect(Object.entries(types).filter(([, type]) => type !== 'function')).toEqual([]);
  await page.close();
});
