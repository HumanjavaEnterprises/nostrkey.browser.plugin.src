/**
 * Removing a grant from the Apps tab in the real side panel: Cancel keeps it,
 * Remove deletes it, and a site with nothing left leaves the list.
 */
import { test, expect } from '@playwright/test';
import { launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

const ORIGIN = 'https://revoke.example';
let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
  const first = await context.newPage();
  await first.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await first.locator('.tab-btn.active').waitFor();
  await first.waitForTimeout(800);
  await first.close();
  await sw.evaluate(async (origin) => {
    const now = Math.floor(Date.now() / 1000);
    const { profiles } = await chrome.storage.local.get('profiles');
    profiles[0].hosts = { [origin]: { 'signEvent:1': { v: 'allow', exp: now + 2 * 86400 + 60, d: '30d' } } };
    await chrome.storage.local.set({ profiles });
  }, ORIGIN);
});
test.afterAll(async () => { await context.close(); });

const stored = () => sw.evaluate(async () => (await chrome.storage.local.get('profiles')).profiles[0].hosts);

test('Cancel keeps the grant, Remove deletes it and the site leaves the list', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.locator('.tab-btn[data-view="permissions"]').click();
  const list = page.locator('#permissions-list');
  const point = list.locator('.patch-point', { hasText: 'Publish a public note' });
  await expect(point).toContainText('ALLOW');
  await expect(point).toContainText('2 days left');

  await point.click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(point).toContainText('ALLOW');
  expect((await stored())[ORIGIN]).toBeTruthy();

  await point.click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(list).not.toContainText(ORIGIN);
  await expect(list).toContainText('No apps connected yet');
  expect((await stored())[ORIGIN]).toBeUndefined();
  await page.close();
});
