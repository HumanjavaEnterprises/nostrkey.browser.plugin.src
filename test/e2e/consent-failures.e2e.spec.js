/**
 * Requests that cannot be shown normally, in real Chromium: each still gets an
 * answer, and none keeps the next request from its turn.
 */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  launchWithExtension, seedLocalProfile, openFixture,
  permissionFrame, waitForPermissionFrame, EXTENSION_PATH,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
});
test.afterAll(async () => { await context.close(); });

const note = (content, extra = {}) => ({ kind: 1, created_at: Math.floor(Date.now() / 1000), tags: [], content, ...extra });

test('a request too large to show is answered with an error, and the next one opens', async () => {
  const page = await openFixture(context, 'https://large.example.com/');
  await page.evaluate((e) => window.__triggerEvent(e), note('a'.repeat(5_000_000)));
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  const answered = await page.evaluate(() => window.__nk);
  expect(answered.sig).toBeUndefined();
  expect(answered.err).toMatch(/too large/i);
  expect(permissionFrame(page)).toBeNull();

  await page.evaluate(() => window.__triggerSign());
  const next = await waitForPermissionFrame(page);
  await next.locator('#deny-btn').click();
  await page.close();
});

const answer = async (surface, page) => {
  await surface.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
};

const LARGE_EVENTS = {
  'long CJK article': () => ({ kind: 30023, created_at: Math.floor(Date.now() / 1000), tags: [['d', 'a']], content: '語'.repeat(30_000) }),
  'list of 3,000 follows': () => ({ kind: 3, created_at: Math.floor(Date.now() / 1000), content: '', tags: Array.from({ length: 3000 }, (_, i) => ['p', i.toString(16).padStart(64, '0')]) }),
};

let sites = 0;
for (const [name, build] of Object.entries(LARGE_EVENTS)) {
  test(`a ${name} draws in the sheet and is signed`, async () => {
    const page = await openFixture(context, `https://sheet${++sites}.example.com/`);
    await page.evaluate((e) => window.__triggerEvent(e), build());
    const frame = await waitForPermissionFrame(page);
    await expect(frame.locator('#perm-type')).toHaveText('Sign an event');
    await answer(frame, page);
    expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
    await page.close();
  });

  test(`a ${name} draws in a tab and is signed`, async () => {
    const page = await openFixture(context, `https://tab${++sites}.example.com/`);
    await page.evaluate((e) => window.__triggerEvent(e), build());
    await waitForPermissionFrame(page);
    const tabOpened = context.waitForEvent('page');
    await page.evaluate(() => window.__redress());
    const tab = await tabOpened;
    await expect(tab.locator('#perm-type')).toHaveText('Sign an event');
    await answer(tab, page);
    expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
    await page.close();
  });
}

test('Deny reaches the site as an error with a code', async () => {
  const page = await openFixture(context, 'https://denied.example.com/');
  await page.evaluate(() => {
    window.__deny = { done: false };
    window.nostr.signEvent({ kind: 1, created_at: Math.floor(Date.now() / 1000), tags: [], content: 'x' })
      .then((v) => { window.__deny.value = v === undefined ? 'undefined' : 'value'; })
      .catch((e) => { window.__deny.message = e.message; window.__deny.code = e.code; })
      .finally(() => { window.__deny.done = true; });
  });
  const frame = await waitForPermissionFrame(page);
  await frame.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__deny.done, { timeout: 8000 });
  const got = await page.evaluate(() => window.__deny);
  expect(got.value).toBeUndefined();
  expect(got.code).toBe('denied');
  expect(got.message).toBe('NostrKey: request denied');
  await page.close();
});

test('a 300 KB decrypt draws and is answered', async () => {
  const page = await openFixture(context, 'https://decrypt.example.com/');
  await page.evaluate(() => {
    window.__nk = { done: false };
    window.nostr.nip04.decrypt('b'.repeat(64), 'QUJD+/=='.repeat(37_500))
      .catch(() => {}).finally(() => { window.__nk.done = true; });
  });
  const frame = await waitForPermissionFrame(page);
  await frame.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  await page.close();
});

test('the largest request that fits still draws, and Deny answers it', async () => {
  const page = await openFixture(context, 'https://fits.example.com/');
  await page.evaluate((e) => window.__triggerEvent(e), note('a'.repeat(2_090_000)));
  const frame = await waitForPermissionFrame(page);
  await expect(frame.locator('#perm-type')).toHaveText('Sign an event');
  await frame.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  await page.close();
});

test('a prompt whose request is gone says so, with no Approve', async () => {
  const page = await context.newPage();
  const query = new URLSearchParams({
    uuid: 'not-live', kind: 'signEvent', host: 'https://example.com', rememberable: '1', grantKey: 'signEvent:1',
  });
  await page.goto(`chrome-extension://${extensionId}/permission/permission.html?${query}`);
  await expect(page.locator('.warn-strip--red').first()).toContainText('no longer open');
  await expect(page.locator('#allow-btn')).toHaveCount(0);
  await expect(page.locator('#deny-btn')).toHaveText('Close');
  await page.close();
});

test('a sheet left open across a worker restart cannot sign, and closes', async () => {
  const page = await openFixture(context, 'https://restart.example.com/');
  await page.evaluate(() => window.__triggerSign());
  const frame = await waitForPermissionFrame(page);
  await frame.locator('#allow-btn').waitFor();
  await page.waitForTimeout(600);

  const session = await context.newCDPSession(page);
  const { targetInfos } = await session.send('Target.getTargets');
  await session.send('Target.closeTarget', { targetId: targetInfos.find(t => t.type === 'service_worker').targetId });
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect((await page.evaluate(() => window.__nk)).sig).toBeUndefined();

  await frame.locator('#allow-btn').click();
  await expect.poll(() => permissionFrame(page), { timeout: 3000 }).toBeNull();
  expect((await page.evaluate(() => window.__nk)).sig).toBeUndefined();
  await page.close();
  sw = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
});

test('a frame that never loads moves to a tab, then is declined, and the next request gets its turn', async () => {
  test.setTimeout(60000);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nk-dead-frame-'));
  fs.cpSync(EXTENSION_PATH, dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'permission/permission.build.js'), '');
  const dead = await launchWithExtension({}, dir);
  try {
    await seedLocalProfile(dead.sw);
    const page = await openFixture(dead.context, 'https://dead.example.com/');
    await page.evaluate(() => window.__triggerSign());
    const first = await waitForPermissionFrame(page);
    expect(first).not.toBeNull();
    const firstUrl = first.url();
    await page.evaluate(() => window.__triggerEvent({ kind: 7, created_at: 1800000000, tags: [], content: '+' }));
    const started = Date.now();
    const tab = await dead.context.waitForEvent('page', { timeout: 20000 });
    expect(tab.url()).toContain('permission/permission.html');
    // The first request's turn ends on its own, and the second opens its own frame.
    await page.bringToFront();
    await expect.poll(() => {
      const frame = permissionFrame(page);
      return !!frame && frame.url() !== firstUrl;
    }, { timeout: 30000 }).toBe(true);
    // Two 6 s ready windows, on a loaded machine. What must not happen is the
    // request sitting out its 40 s prompt window.
    expect(Date.now() - started).toBeLessThan(38000);
  } finally {
    await dead.context.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** A page whose main thread is taken as soon as the request is sent. */
test('a page too busy to draw the sheet gets a tab, and the answer reaches it', async () => {
  const page = await openFixture(context, 'https://busy.example.com/');
  const tabOpened = context.waitForEvent('page', { timeout: 9000 });
  await page.evaluate(() => {
    window.__triggerSign();
    setTimeout(() => { const end = Date.now() + 7000; while (Date.now() < end); }, 0);
  });
  const tab = await tabOpened;
  expect(tab.url()).toContain('permission/permission.html');
  await tab.locator('#allow-btn').waitFor();
  await tab.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 12000 });
  expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
  expect(permissionFrame(page)).toBeNull();
  await page.close();
});

test('a page that refuses the frame gets a tab', async () => {
  const url = 'https://isolated.example.com/';
  const seed = await openFixture(context, url);
  const body = await seed.content();
  await seed.close();
  const page = await context.newPage();
  await page.route(url, (route) => route.fulfill({
    status: 200, contentType: 'text/html', body,
    headers: { 'cross-origin-embedder-policy': 'require-corp', 'cross-origin-opener-policy': 'same-origin' },
  }));
  await page.goto(url);
  await page.waitForFunction(() => typeof window.nostr !== 'undefined', { timeout: 5000 });
  const tabOpened = context.waitForEvent('page', { timeout: 9000 });
  await page.evaluate(() => window.__triggerSign());
  const tab = await tabOpened;
  await tab.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect(await page.evaluate(() => window.__consentHostCount())).toBe(0);
  await page.close();
});
