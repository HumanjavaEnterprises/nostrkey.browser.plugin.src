/**
 * Ring-2 e2e — consent sheet lifecycle (CS-03, CS-04).
 *
 * Real event routing that jsdom can't model: the in-page sheet is an injected
 * extension iframe; Minimize and a backdrop click collapse it to the FAB while
 * keeping the request PENDING (never approve/deny); the FAB re-opens it. The FAB
 * and backdrop live in a closed shadow root, so we drive them by viewport
 * coordinate (a real user click), while the iframe's own buttons are reachable as
 * a browser frame.
 */
import { test, expect } from '@playwright/test';
import {
  launchWithExtension, seedLocalProfile, openFixture,
  permissionFrame, waitForPermissionFrame,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
});
test.afterAll(async () => { await context.close(); });

test.afterEach(async () => {
  for (const p of context.pages()) {
    if (p.url().includes('permission/permission.html')) {
      await p.locator('#deny-btn').click().catch(() => {});
      await p.close().catch(() => {});
    }
  }
});

async function viewport(page) {
  return page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
}

test('CS-03: Minimize collapses the sheet to the FAB with the request still pending, FAB re-opens it', async () => {
  const page = await openFixture(context);
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  expect(frame).not.toBeNull();

  // Minimize (button lives in the extension iframe).
  await frame.locator('#minimize-btn').click();

  // Sheet iframe is gone, but ONE injected host remains (the FAB), and the request
  // is still pending — minimize is not a decision.
  await expect.poll(() => permissionFrame(page) === null, { timeout: 4000 }).toBe(true);
  expect(await page.evaluate(() => window.__consentHostCount())).toBe(1);
  let res = await page.evaluate(() => window.__nk);
  expect(res.done).toBe(false);
  expect(res.sig).toBeFalsy();

  // Click the FAB (bottom-right pill) by coordinate → sheet re-opens.
  const { w, h } = await viewport(page);
  await page.mouse.click(w - 60, h - 30);
  const reopened = await waitForPermissionFrame(page);
  expect(reopened, 'FAB click should re-open the sheet').not.toBeNull();

  // And it can still be approved after the round-trip.
  await reopened.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  res = await page.evaluate(() => window.__nk);
  expect(res.sig, `expected a signature, got err=${res.err}`).toBeTruthy();
  expect(res.sig.sig).toMatch(/^[0-9a-f]{128}$/);
  await page.close();
});

test('CS-04: a backdrop click minimizes (never approves, never denies)', async () => {
  const page = await openFixture(context);
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  expect(frame).not.toBeNull();

  // Click the dimmed backdrop above the bottom sheet (top of viewport is backdrop
  // only; the sheet occupies the bottom 72vh).
  const { w, h } = await viewport(page);
  await page.mouse.click(Math.floor(w / 2), 24);

  // Collapses to the FAB; request stays pending — NOT approved and NOT denied.
  await expect.poll(() => permissionFrame(page) === null, { timeout: 4000 }).toBe(true);
  expect(await page.evaluate(() => window.__consentHostCount())).toBe(1);
  const res = await page.evaluate(() => window.__nk);
  expect(res.done).toBe(false);
  expect(res.sig).toBeFalsy();
  expect(res.err).toBeFalsy();
  await page.close();
});
