/**
 * Where the prompt loads from, in real Chromium: a per-session address on Chrome,
 * and every surface still reaches the worker from it.
 */
import { test, expect } from '@playwright/test';
import {
  launchWithExtension, seedLocalProfile, openFixture, waitForPermissionFrame,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
});
test.afterAll(async () => { await context.close(); });

test('the prompt uses a per-session address, and the fixed one does not load in a page', async () => {
  const address = await sw.evaluate(() => chrome.runtime.getURL('permission/permission.html'));
  expect(new URL(address).host).not.toBe(extensionId);

  const page = await openFixture(context, 'https://session.example.com/');
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  await expect(frame.locator('#deny-btn')).toBeVisible();
  await expect(frame.locator('#allow-btn')).toBeEnabled();
  await frame.locator('#deny-btn').click();
  await expect.poll(() => page.evaluate(() => window.__nk.done), { timeout: 4000 }).toBe(true);

  await page.evaluate((url) => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    document.body.appendChild(iframe);
  }, `chrome-extension://${extensionId}/permission/permission.html`);
  await page.waitForTimeout(800);
  const drawn = await Promise.all(page.frames().filter(f => f !== page.mainFrame())
    .map(f => f.locator('#deny-btn').count().catch(() => 0)));
  expect(drawn.reduce((a, b) => a + b, 0)).toBe(0);
  await page.close();
});

test('a prompt reopened in a tab can be approved', async () => {
  const page = await openFixture(context, 'https://tab.example.com/');
  await page.evaluate(() => window.__triggerSign());
  await waitForPermissionFrame(page);
  const tabOpened = context.waitForEvent('page');
  expect(await page.evaluate(() => window.__redress())).toBe('reparented');
  const tab = await tabOpened;
  await tab.locator('#allow-btn').waitFor();
  await expect(tab.locator('#allow-btn')).toBeEnabled();
  await tab.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
  await page.close();
});

test('an extension page in a tab can still reach what is kept for extension pages', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  const answer = await page.evaluate(() => chrome.runtime.sendMessage({ kind: 'bunkerServer.status' }));
  expect(answer).toMatchObject({ active: false });
  await page.close();
});
