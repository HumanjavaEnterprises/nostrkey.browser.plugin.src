/**
 * Settings persistence — Chrome synthetic browser test
 *
 * Loads the real extension in Chrome and verifies that appearance +
 * accessibility settings, saved via the live UI/API, survive a page reload
 * AND are visible on other extension surfaces (real chrome.storage, not a mock).
 *
 * Run: npx playwright test test/e2e/settings-persistence.spec.js
 * (headed — extensions require a real browser. See test/e2e/CROSS-BROWSER.md.)
 */

import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.resolve('distros/chrome');
let context, extensionId;

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
  const sw = context.serviceWorkers().length
    ? context.serviceWorkers()[0]
    : await context.waitForEvent('serviceworker');
  extensionId = sw.url().split('/')[2];
});

test.afterAll(async () => {
  // reset prefs so we don't pollute the persistent profile between runs
  try {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/full_settings.html`);
    await page.waitForFunction(() => !!window.insA11y);
    await page.evaluate(() => window.insA11y.set({
      theme: 'instrument', mode: 'dark', density: 'comfortable',
      textSize: 'm', highContrast: false, reduceMotion: false,
    }));
    await page.close();
  } catch { /* best effort */ }
  await context.close();
});

async function openSettings() {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/full_settings.html`);
  await page.waitForFunction(() => !!window.insA11y);
  return page;
}

test('a saved appearance setting survives a page reload', async () => {
  const page = await openSettings();

  await page.evaluate(() => window.insA11y.set({
    theme: 'analog', mode: 'light', density: 'compact', textSize: 'xl',
  }));
  // applied immediately
  expect(await page.getAttribute('html', 'data-ins-skin')).toBe('analog-light');

  await page.reload();
  await page.waitForFunction(() => !!window.insA11y);

  // recovered from real chrome.storage after reload
  expect(await page.getAttribute('html', 'data-ins-skin')).toBe('analog-light');
  expect(await page.getAttribute('html', 'data-ins-text')).toBe('xl');
  expect(await page.getAttribute('html', 'data-ins-density')).toBeNull(); // compact
  await page.close();
});

test('a saved setting is visible on a different extension surface', async () => {
  const settings = await openSettings();
  await settings.evaluate(() => window.insA11y.set({ theme: 'console', mode: 'dark' }));
  await settings.close();

  // a fresh, different page should boot with the persisted skin
  const sidepanel = await context.newPage();
  await sidepanel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await sidepanel.waitForFunction(() => !!window.insA11y);
  expect(await sidepanel.getAttribute('html', 'data-ins-skin')).toBe('console-dark');
  await sidepanel.close();
});

test('high contrast + reduce motion + text size persist together', async () => {
  const page = await openSettings();
  await page.evaluate(() => window.insA11y.set({
    highContrast: true, reduceMotion: true, textSize: 'l',
  }));
  await page.reload();
  await page.waitForFunction(() => !!window.insA11y);
  expect(await page.getAttribute('html', 'data-ins-contrast')).toBe('high');
  expect(await page.getAttribute('html', 'data-ins-motion')).toBe('off');
  expect(await page.getAttribute('html', 'data-ins-text')).toBe('l');
  await page.close();
});
