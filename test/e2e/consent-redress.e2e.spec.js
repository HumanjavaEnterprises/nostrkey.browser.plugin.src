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
  await frame.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 4000 });
  await page.close();
});

const center = async (frame, selector) => {
  const box = await (await frame.frameElement()).boundingBox();
  const at = await frame.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  return { x: box.x + at.x, y: box.y + at.y };
};

/** Something of the page's own in front of the sheet. */
const cover = (page, style = 'inset:0') => page.evaluate((style) => {
  const el = document.createElement('div');
  el.id = 'cover';
  el.style.cssText = `position:fixed;${style};z-index:2147483647;pointer-events:none;background:#fff`;
  document.documentElement.appendChild(el);
}, style);

const kindFive = () => ({ kind: 5, created_at: Math.floor(Date.now() / 1000), tags: [['e', 'a'.repeat(64)]], content: '' });
const blossomDelete = () => {
  const at = Math.floor(Date.now() / 1000);
  return { kind: 24242, created_at: at, content: '', tags: [['t', 'delete'], ['expiration', String(at + 600)], ['x', 'a'.repeat(64)]] };
};
const erase = () => ({ kind: 62, created_at: Math.floor(Date.now() / 1000), tags: [['relay', 'ALL_RELAYS']], content: '' });

let covered = 0;
const site = () => `https://cover${++covered}.example.com/`;

for (const [name, build] of [['a delete', kindFive], ['a request to erase', erase], ['a media server delete', blossomDelete]]) {
  test(`${name} opens in a tab, never on the page`, async () => {
    const page = await openFixture(context, site());
    const tabOpened = context.waitForEvent('page', { timeout: 4000 });
    await page.evaluate((e) => window.__triggerEvent(e), build());
    const tab = await tabOpened;
    expect(permissionFrame(page)).toBeNull();
    expect(await page.evaluate(() => window.__consentHostCount())).toBe(0);
    await tab.locator('#deny-btn').click();
    await page.waitForFunction(() => window.__nk.done, { timeout: 4000 });
    await expect.poll(() => tab.isClosed(), { timeout: 3000 }).toBe(true);
    await expect.poll(() => page.evaluate(() => document.visibilityState), { timeout: 3000 }).toBe('visible');
    await page.close();
  });
}

test('a delete under a covered page can only be signed from its tab', async () => {
  const page = await openFixture(context, site());
  await cover(page);
  const tabOpened = context.waitForEvent('page', { timeout: 4000 });
  await page.evaluate((e) => window.__triggerEvent(e), kindFive());
  const tab = await tabOpened;
  await page.bringToFront();
  await page.mouse.click(400, 500);
  await page.mouse.click(600, 650);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);

  await tab.bringToFront();
  await tab.locator('#effect-understood-box').check(); // a delete always needs the tick (E1)
  await tab.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 4000 });
  expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
  await page.close();
});

test('with nothing over it, Approve on the sheet works once the sheet has been seen', async () => {
  const page = await openFixture(context, site());
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  await expect(frame.locator('#allow-btn')).toBeEnabled({ timeout: 3000 });
  await page.waitForTimeout(100);
  await frame.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 4000 });
  expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
  await page.close();
});

for (const [name, style] of [
  ['the whole page', 'inset:0'],
  ['only the Approve row', null],
  ['only the top of the sheet', null],
]) {
  test(`a real click on a sheet with ${name} covered does nothing, and the request moves to a tab`, async () => {
    const page = await openFixture(context, site());
    await page.evaluate(() => window.__triggerSign());
    const frame = await waitForPermissionFrame(page);
    await expect(frame.locator('#allow-btn')).toBeEnabled({ timeout: 3000 });
    await page.waitForTimeout(100);
    const approve = await center(frame, '#allow-btn');
    const box = await (await frame.frameElement()).boundingBox();
    const area = style ?? (name.includes('Approve')
      ? `left:${approve.x - 60}px;top:${approve.y - 24}px;width:120px;height:48px`
      : `left:${box.x}px;top:${box.y}px;width:${box.width}px;height:80px`);

    const tabOpened = context.waitForEvent('page', { timeout: 5000 });
    await cover(page, area);
    await page.waitForTimeout(300);
    await page.mouse.click(approve.x, approve.y);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__nk.done)).toBe(false);

    const tab = await tabOpened;
    expect(permissionFrame(page)).toBeNull();
    await tab.locator('#allow-btn').click();
    await page.waitForFunction(() => window.__nk.done, { timeout: 4000 });
    expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
    await page.close();
  });
}

test('a sheet covered from the moment it opens never arms', async () => {
  const page = await openFixture(context, site());
  await cover(page);
  await page.evaluate(() => {
    const el = document.getElementById('cover');
    new MutationObserver(() => {
      if (document.documentElement.lastElementChild !== el) document.documentElement.appendChild(el);
    }).observe(document.documentElement, { childList: true });
  });
  const tabOpened = context.waitForEvent('page', { timeout: 5000 });
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  await frame.locator('#allow-btn').waitFor({ state: 'attached' });
  await page.waitForTimeout(700);
  const approve = await center(frame, '#allow-btn');
  await page.mouse.click(approve.x, approve.y);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);
  const tab = await tabOpened;
  await tab.locator('#deny-btn').click();
  await page.close();
});

test('a cover lifted just before a click leaves Approve held', async () => {
  const page = await openFixture(context, site());
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  await expect(frame.locator('#allow-btn')).toBeEnabled({ timeout: 3000 });
  const approve = await center(frame, '#allow-btn');
  await cover(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById('cover').remove());
  await page.waitForTimeout(150);
  await page.mouse.click(approve.x, approve.y);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);
  await frame.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 4000 });
  await page.close();
});

