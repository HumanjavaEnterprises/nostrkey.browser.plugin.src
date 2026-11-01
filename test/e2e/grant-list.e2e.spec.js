/**
 * Both app lists, rendered from stored grants in the real side panel: what a
 * grant says, which are red, and what a stored answer that is not acted on shows.
 */
import { test, expect } from '@playwright/test';
import { launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const ORIGIN = 'https://jumble.example';
const HOSTS = {
  [ORIGIN]: {
    'signEvent:24242:upload': 'allow',
    'signEvent:24242:media': 'allow',
    'signEvent:24242:get': 'allow',
    'signEvent:24242:list': 'allow',
    'signEvent:24242:delete': 'allow',
    'signEvent:1059': 'allow',
  },
};

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
  await sw.evaluate(async (hosts) => {
    const { profiles } = await chrome.storage.local.get('profiles');
    profiles[0].hosts = hosts;
    await chrome.storage.local.set({ profiles });
  }, HOSTS);
});
test.afterAll(async () => { await context.close(); });

async function expectGrants(list) {
  const row = (key) => list.locator('.patch-point', { hasText: key });
  await expect(row('Upload a file to a media server')).toContainText('ALLOW');
  await expect(row('Send a file to a media server to process')).toContainText('ALLOW');
  await expect(row('Fetch a file from a media server')).toContainText('ALLOW');
  await expect(row('List your files on a media server')).toContainText('ALLOW');
  await expect(row('Send a gift-wrapped message')).toHaveClass(/patch-point--danger/);
  await expect(row('Upload a file to a media server')).not.toHaveClass(/patch-point--danger/);

  // A stored allow that is never acted on reads as what will happen.
  const del = row('Delete a file from a media server');
  await expect(del).toHaveClass(/patch-point--danger/);
  await expect(del).toContainText('ASK');
  await expect(del).toHaveAttribute('aria-pressed', 'false');
  await expect(del).toHaveAttribute('title', 'Will ask each time');
  await expect(list).not.toContainText('Unknown');
}

test('the Apps tab reads each grant by what it does', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.locator('.tab-btn[data-view="permissions"]').click();
  await expectGrants(page.locator('#permissions-list'));
  await page.close();
});

test('the profile view reads them the same way', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.locator('.profile-edit-btn').first().click();
  await expect(page.locator('#view-profile-view')).toBeVisible();
  await expectGrants(page.locator('#pd-permissions'));
  await page.close();
});
