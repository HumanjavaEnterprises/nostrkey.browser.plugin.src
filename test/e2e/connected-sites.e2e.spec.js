/**
 * Connected sites in the profile tab: add a site, Allow it for 1 day, see the
 * time left, revoke with the confirmation, and the site is gone. The side panel
 * Apps tab reads the same store. Screenshots go to SITES_SHOTS when it is set.
 */
import { test, expect } from '@playwright/test';
import { ALICE, launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const SHOTS = process.env.SITES_SHOTS || '';
let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
  // The first open of a page runs the storage migrations, which start hosts empty.
  const first = await context.newPage();
  await first.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await first.locator('.tab-btn.active').waitFor();
  await first.waitForTimeout(800);
  await first.close();
  // The worker never reaches a relay here.
  await sw.evaluate(() => { globalThis.WebSocket = class { constructor() { throw new Error('offline'); } }; });
});
test.afterAll(async () => { await context?.close(); });

async function openTab(width) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`chrome-extension://${extensionId}/profile.html?pubkey=${ALICE.pubKey}`);
  await expect(page.locator('#pd-sites')).toContainText('No sites connected yet');
  return page;
}

test('add a site, allow it for 1 day, see time left, revoke it', async () => {
  const page = await openTab(1200);
  await expect(page.locator('#pd-sites-device')).toContainText('This list applies to this device only.');

  await page.fill('#pd-site-origin', 'http://evil.example');
  await page.click('#pd-site-submit');
  await expect(page.locator('#pd-site-error')).toBeVisible();

  await page.fill('#pd-site-origin', 'Jumble.Example/some/path');
  await page.selectOption('#pd-site-action', 'signEvent:1');
  await page.selectOption('#pd-site-choice', '1d');
  await page.click('#pd-site-submit');
  const site = page.locator('.site-module[data-origin="https://jumble.example"]');
  await expect(site).toBeVisible();
  await expect(page.locator('#pd-site-error')).toBeHidden();
  const row = site.locator('.grant-row').first();
  await expect(row).toContainText('ALLOW');
  await expect(row.locator('.grant-left')).toHaveText(/^(23 hours|1 day) left$/);
  await expect(row.locator('.grant-choice')).toHaveValue('1d');

  // Another action, then Deny is picked for it.
  await site.locator('.grant-add-key').selectOption('getPubKey');
  await expect(site.locator('.grant-row')).toHaveCount(2);
  await expect(page.locator('#pd-sites')).toContainText('DENY');

  // The side panel Apps tab shows the same store.
  const panel = await context.newPage();
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await panel.locator('.tab-btn[data-view="permissions"]').click();
  await expect(panel.locator('#permissions-list')).toContainText('https://jumble.example');
  await panel.close();

  if (SHOTS) await page.screenshot({ path: `${SHOTS}/connected-sites-desktop.png`, fullPage: true });
  const narrow = await context.newPage();
  await narrow.setViewportSize({ width: 390, height: 900 });
  await narrow.goto(`chrome-extension://${extensionId}/profile.html?pubkey=${ALICE.pubKey}`);
  await expect(narrow.locator('.site-module')).toBeVisible();
  const overflow = await narrow.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  if (SHOTS) await narrow.screenshot({ path: `${SHOTS}/connected-sites-390.png`, fullPage: true });
  await narrow.close();

  await site.locator('.grant-revoke-all').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(site).toBeVisible();
  await site.locator('.grant-revoke-all').click();
  await page.getByRole('button', { name: 'Remove all', exact: true }).click();
  await expect(page.locator('.site-module')).toHaveCount(0);
  await expect(page.locator('#pd-sites')).toContainText('No sites connected yet');
  const hosts = await sw.evaluate(async () => (await chrome.storage.local.get('profiles')).profiles[0].hosts);
  expect(hosts['https://jumble.example']).toBeUndefined();
  await page.close();
});
