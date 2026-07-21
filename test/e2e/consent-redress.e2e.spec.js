/**
 * Ring-2 e2e — consent redress resistance (CS-15, CS-16).
 *
 * jsdom cannot prove these: they need real layout, real compositing, a real
 * content-script-injected extension iframe, and the redress guard's live
 * MutationObserver/poll. Here we drive the REAL extension in Chromium.
 *
 * What each test actually proves (non-tautological):
 *  - baseline: a real Approve inside the extension iframe signs — this also proves
 *    the live isExtensionSender(sender.url) path that jsdom could not exercise.
 *  - CS-15: re-parenting the injected host under a near-transparent filter group
 *    trips the fail-closed guard — the in-page sheet is destroyed AND the request
 *    escalates to a redress-immune tab, and NO signature is produced by the attack.
 *  - CS-16: the real consent frame is extension-origin (unforgeable); a page-drawn
 *    lookalike button cannot produce a signature.
 */
import { test, expect } from '@playwright/test';
import {
  launchWithExtension, seedLocalProfile, openFixture,
  permissionFrame, waitForPermissionFrame, FIXTURE_URL,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
});

test.afterAll(async () => { await context.close(); });

// Between tests: resolve any lingering prompt (in-page frame or escalated tab) so
// the background prompt mutex is free for the next signEvent.
test.afterEach(async () => {
  for (const p of context.pages()) {
    if (p.url().includes('permission/permission.html')) {
      await p.locator('#deny-btn').click().catch(() => {});
      await p.close().catch(() => {});
    }
  }
});

test('baseline: Approve inside the extension iframe signs (live isExtensionSender)', async () => {
  const page = await openFixture(context);
  await page.evaluate(() => window.__triggerSign());

  const frame = await waitForPermissionFrame(page);
  expect(frame, 'permission iframe should be injected in-page').not.toBeNull();
  // Sheet content is an extension-origin document — the page cannot forge it.
  expect(frame.url().startsWith(`chrome-extension://${extensionId}/`)).toBe(true);

  await frame.locator('#allow-btn').click(); // auto-waits out the 450ms settle disable

  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  const res = await page.evaluate(() => window.__nk);
  expect(res.err, `signEvent errored: ${res.err}`).toBeFalsy();
  expect(res.sig).toBeTruthy();
  expect(res.sig.id).toMatch(/^[0-9a-f]{64}$/);
  expect(res.sig.sig).toMatch(/^[0-9a-f]{128}$/);
  await page.close();
});

test('CS-15: redress re-parent trips the guard → sheet destroyed, escalates to tab, no signature', async () => {
  const page = await openFixture(context);
  await page.evaluate(() => window.__triggerSign());

  const frame = await waitForPermissionFrame(page);
  expect(frame).not.toBeNull();

  // Arm detection of the escalation tab BEFORE attacking.
  const escalatedTabP = context.waitForEvent('page', { timeout: 8000 });

  const outcome = await page.evaluate(() => window.__redress());
  expect(outcome, 'attack should have found + re-parented the host').toBe('reparented');

  // 1) The in-page consent surface is torn down (no hidden Approve to click).
  await expect.poll(() => permissionFrame(page) === null, { timeout: 5000 }).toBe(true);

  // 2) The SAME request escalates to a dedicated tab (redress-immune).
  const escalated = await escalatedTabP;
  await escalated.waitForLoadState('domcontentloaded');
  expect(escalated.url()).toContain('permission/permission.html');

  // 3) The attack produced NO signature — the request is still pending.
  const res = await page.evaluate(() => window.__nk);
  expect(res.done).toBe(false);
  expect(res.sig).toBeFalsy();

  await page.close();
});

test('CS-16: a page-drawn lookalike cannot sign; only the extension-origin frame can', async () => {
  const page = await openFixture(context);
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  expect(frame).not.toBeNull();

  // The page builds its OWN fake "Approve" button and clicks it. It has no channel
  // to the signer, so no signature can result from it.
  const forged = await page.evaluate(async () => {
    const b = document.createElement('button');
    b.id = '__fake_allow';
    b.textContent = 'Approve';
    document.body.appendChild(b);
    b.click();
    await new Promise(r => setTimeout(r, 500));
    return { done: window.__nk.done, sig: window.__nk.sig };
  });
  expect(forged.done).toBe(false);
  expect(forged.sig).toBeFalsy();

  // The only surface that CAN sign is the extension-origin iframe.
  expect(frame.url().startsWith(`chrome-extension://${extensionId}/`)).toBe(true);
  await page.close();
});
