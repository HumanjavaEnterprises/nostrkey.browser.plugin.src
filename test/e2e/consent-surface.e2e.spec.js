/**
 * The approval sheet in real layout: the decision stays in view at real sizes, and
 * a media server request reads the way it should. Set NK_SHOT_DIR to keep a
 * screenshot of each state and print where the controls landed.
 */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  launchWithExtension, seedLocalProfile, openFixture, waitForPermissionFrame, ALICE,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const SHOT_DIR = process.env.NK_SHOT_DIR;
const SIZES = [
  ['desktop-1280x600', 1280, 600],
  ['iphone-390x700', 390, 700],
  ['iphone-375x667', 375, 667],
  ['phone-landscape-667x375', 667, 375],
  ['phone-landscape-844x390', 844, 390],
  ['short-desktop-1280x400', 1280, 400],
  ['short-desktop-1280x300', 1280, 300],
];
const SHORT_SIZES = SIZES.slice(3);

const now = () => Math.floor(Date.now() / 1000);
const HASH = 'a'.repeat(64);
const token = (verb, { tags = [], ttl = 3600, content = 'Upload blob' } = {}) => ({
  kind: 24242, created_at: now(), content, tags: [['t', verb], ['expiration', String(now() + ttl)], ...tags],
});
const LONG_NOTE = 'A note from the app that runs on for a while. '.repeat(12);
const manyHashes = Array.from({ length: 8 }, (_, i) => ['x', String(i).repeat(64)]);
const STATES = {
  upload: () => token('upload', {
    content: LONG_NOTE,
    tags: [...manyHashes, ['server', 'cdn.example.com'], ['server', 'media.example.org']],
  }),
  delete: () => token('delete', { tags: [['x', HASH]] }),
  'delete-long-expiry': () => token('delete', { tags: [['x', HASH]], ttl: 2 * 86400 }),
  unreadable: () => token('upload', { tags: [['x', HASH]], ttl: 2 * 86400 }),
};

let context, sw, hostCount = 0;

test.beforeAll(async () => {
  ({ context, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
});
test.afterAll(async () => { await context.close(); });

const seedRemoteProfile = () => sw.evaluate(async (pubKey) => {
  await chrome.storage.local.set({
    profiles: [{ name: 'Remote E2E', type: 'bunker', pubKey: '', privKey: '', remotePubkey: pubKey, bunkerUrl: null, relays: [], hosts: {} }],
    profileIndex: 0,
    isEncrypted: false,
  });
}, ALICE.pubKey);

/** Every host gets its own page, since prompts are limited per site. */
async function openSheet(w, h, event) {
  const page = await openFixture(context, `https://t${++hostCount}.example.com/`);
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate((e) => window.__triggerEvent(e), event);
  const frame = await waitForPermissionFrame(page);
  expect(frame).not.toBeNull();
  await frame.locator('#deny-btn').waitFor();
  await page.waitForTimeout(450); // the sheet's slide-in
  return { page, frame };
}

/** A delete opens in its own tab, so that is the surface measured for one. */
async function openDelete(w, h, event) {
  const opener = await openFixture(context, `https://t${++hostCount}.example.com/`);
  const opened = context.waitForEvent('page');
  await opener.evaluate((e) => window.__triggerEvent(e), event);
  const page = await opened;
  await page.setViewportSize({ width: w, height: h });
  await page.locator('#deny-btn').waitFor();
  await page.waitForTimeout(200);
  page.once('close', () => { opener.close().catch(() => {}); });
  return { page, frame: page };
}

const opensInTab = (state) => state.startsWith('delete');

/** Each control, in page coordinates, with nothing scrolled. */
async function measure(page, frame) {
  const box = frame === page
    ? { x: 0, y: 0, ...page.viewportSize() }
    : await (await frame.frameElement()).boundingBox();
  const inside = await frame.evaluate(() => {
    const rect = (id) => {
      const r = document.getElementById(id).getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
    };
    return {
      deny: rect('deny-btn'),
      approve: rect('allow-btn'),
      remember: rect('remember-patch'),
      inner: { w: window.innerWidth, h: window.innerHeight },
      scrolled: document.scrollingElement.scrollTop,
      detailsScroll: document.querySelector('.perm-scroll').scrollTop,
      documentOverflows: document.documentElement.scrollHeight > window.innerHeight,
      inSheet: document.documentElement.classList.contains('perm-in-sheet'),
    };
  });
  return { box, viewport: page.viewportSize(), ...inside };
}

function expectDecisionInView(m) {
  expect(m.scrolled).toBe(0);
  expect(m.documentOverflows).toBe(false);
  for (const control of [m.deny, m.approve, m.remember]) {
    expect(control.top).toBeGreaterThanOrEqual(0);
    expect(control.bottom).toBeLessThanOrEqual(m.inner.h);
    expect(control.left).toBeGreaterThanOrEqual(0);
    expect(control.right).toBeLessThanOrEqual(m.inner.w);
  }
  expect(m.box.y).toBeGreaterThanOrEqual(0);
  expect(m.box.y + m.box.height).toBeLessThanOrEqual(m.viewport.height + 1);
  expect(m.box.x + m.box.width).toBeLessThanOrEqual(m.viewport.width + 1);
}

async function keep(page, name, m) {
  if (!SHOT_DIR) return;
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await page.waitForTimeout(700); // Approve at rest
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`) });
  console.log(`${name}: ${JSON.stringify(m)}`);
}

for (const [sizeName, w, h] of SIZES) {
  for (const [state, build] of Object.entries(STATES)) {
    test(`${state} at ${sizeName}: Deny, Approve and Remember are in view without scrolling`, async () => {
      const inTab = opensInTab(state);
      const { page, frame } = await (inTab ? openDelete : openSheet)(w, h, build());
      const surface = inTab ? 'tab' : 'sheet';
      const m = await measure(page, frame);
      expect(m.inSheet).toBe(!inTab);
      expect(m.detailsScroll).toBe(0);
      expectDecisionInView(m);
      await keep(page, `${surface}-${state}-${sizeName}`, m);

      await frame.locator('#raw-json-toggle').click();
      await expect(frame.locator('#event-preview-pre')).toBeVisible();
      const expanded = await measure(page, frame);
      expectDecisionInView(expanded);
      await keep(page, `${surface}-${state}-${sizeName}-raw`, expanded);

      await frame.locator('#deny-btn').click();
      await page.close();
    });
  }
}

/** Is this element whole, inside the frame, above the decision, and on top? */
async function inPlainSight(frame, selector) {
  return frame.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { missing: sel };
    const r = el.getBoundingClientRect();
    const deny = document.getElementById('deny-btn').getBoundingClientRect();
    const onTop = el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    return { height: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom), denyTop: Math.round(deny.top), inner: window.innerHeight, onTop };
  }, selector);
}

for (const [sizeName, w, h] of SIZES) {
  for (const state of ['delete', 'delete-long-expiry']) {
    test(`${state} at ${sizeName}: Action and the delete warning stay in view while Approve is live`, async () => {
      const { page, frame } = await openDelete(w, h, STATES[state]());
      await expect(frame.locator('#allow-btn')).toBeEnabled();
      await expect(frame.locator('#perm-type')).toHaveText('Delete a file from a media server');

      const check = async () => {
        for (const selector of ['#perm-type', '#perm-danger .warn-strip--red']) {
          const seen = await inPlainSight(frame, selector);
          expect(seen, selector).toMatchObject({ onTop: true });
          expect(seen.height, selector).toBeGreaterThan(0);
          expect(seen.top, selector).toBeGreaterThanOrEqual(0);
          expect(seen.bottom, selector).toBeLessThanOrEqual(seen.denyTop);
          expect(seen.bottom, selector).toBeLessThanOrEqual(seen.inner);
        }
      };
      await check();
      if (SHOT_DIR) console.log(`${state}@${sizeName}: ${JSON.stringify(await measure(page, frame))} ${JSON.stringify(await inPlainSight(frame, '#perm-danger'))}`);
      await keep(page, `tab-${state}-${sizeName}`, {});

      await frame.locator('.perm-scroll').evaluate((el) => { el.scrollTop = el.scrollHeight; });
      await check();

      await frame.locator('#raw-json-toggle').click();
      await check();

      await frame.locator('#deny-btn').click();
      await page.close();
    });
  }
}

test('a delete offers no Remember at any height', async () => {
  const { page, frame } = await openDelete(390, 700, STATES.delete());
  await expect(frame.locator('#remember-patch')).toBeHidden();
  await frame.locator('#deny-btn').click();
  await page.close();
});

for (const [sizeName, w, h] of SHORT_SIZES) {
  test(`an upload at ${sizeName}: Action stays in view`, async () => {
    const { page, frame } = await openSheet(w, h, STATES.upload());
    const seen = await inPlainSight(frame, '#perm-type');
    expect(seen).toMatchObject({ onTop: true });
    expect(seen.bottom).toBeLessThanOrEqual(seen.denyTop);
    await frame.locator('#deny-btn').click();
    await page.close();
  });
}

test('direction controls show as marks, and blank runs do not push text out of view', async () => {
  const content = `shown first\u202E${'\n'.repeat(300)}shown last`;
  const { page, frame } = await openSheet(390, 700, { kind: 1, created_at: now(), tags: [], content });
  await expect(frame.locator('#content-preview')).toHaveText(/shown first\[U\+202E\]\s+shown last/);
  const fits = await frame.locator('#content-preview').evaluate(el => el.scrollHeight <= el.clientHeight);
  expect(fits).toBe(true);
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('rows that do not apply are not drawn', async () => {
  const { page, frame } = await openSheet(390, 700, STATES.unreadable());
  await expect(frame.locator('#bunker-notice')).toBeHidden();
  await expect(frame.locator('#files-row')).toBeHidden();
  await expect(frame.locator('#servers-row')).toBeHidden();
  await expect(frame.locator('#valid-row')).toBeHidden();
  await expect(frame.locator('#perm-type')).toHaveText('Authorize a media server request');
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('a short request shows its whole readout with no scrolling at phone size', async () => {
  const { page, frame } = await openSheet(390, 700, token('upload', { tags: [['x', HASH]] }));
  const fit = await frame.evaluate(() => {
    const details = document.querySelector('.perm-scroll').getBoundingClientRect();
    return { validBottom: document.getElementById('valid-row').getBoundingClientRect().bottom, detailsBottom: details.bottom };
  });
  expect(fit.validBottom).toBeLessThanOrEqual(fit.detailsBottom);
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('the details scroll to their end above the decision', async () => {
  const { page, frame } = await openSheet(390, 700, STATES.upload());
  const reached = await frame.evaluate(() => {
    const details = document.querySelector('.perm-scroll');
    details.scrollTop = details.scrollHeight;
    const last = details.lastElementChild.getBoundingClientRect();
    return { lastBottom: last.bottom, detailsBottom: details.getBoundingClientRect().bottom, overflowed: details.scrollHeight > details.clientHeight };
  });
  expect(reached.overflowed).toBe(true);
  expect(reached.lastBottom).toBeLessThanOrEqual(reached.detailsBottom + 1);
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('Approve stays held for its settle time, in the slimmer sheet too', async () => {
  const page = await openFixture(context, `https://t${++hostCount}.example.com/`);
  await page.setViewportSize({ width: 390, height: 700 });
  await page.evaluate((e) => window.__triggerEvent(e), STATES.upload());
  const frame = await waitForPermissionFrame(page);
  await expect(frame.locator('#allow-btn')).toBeDisabled({ timeout: 3000 });
  await expect(frame.locator('#allow-btn')).toBeEnabled({ timeout: 3000 });
  await frame.locator('#deny-btn').click();
  await page.close();
});

/** Where a control sits in page coordinates. */
async function pagePoint(frame, id) {
  const box = await (await frame.frameElement()).boundingBox();
  const r = await frame.evaluate((el) => {
    const b = document.getElementById(el).getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  }, id);
  return { x: box.x + r.x, y: box.y + r.y };
}

const QUIET_MS = 450;
const signed = async (page) => !!(await page.evaluate(() => window.__nk.sig));

test('sustained clicks at Approve never land, and it arms after 450 ms of quiet', async () => {
  const page = await openFixture(context, `https://t${++hostCount}.example.com/`);
  await page.setViewportSize({ width: 390, height: 700 });
  await page.evaluate((e) => window.__triggerEvent(e), STATES.upload());
  const frame = await waitForPermissionFrame(page);
  await frame.locator('#allow-btn').waitFor();
  await page.waitForTimeout(350); // the slide-in, so the point stays put
  const at = await pagePoint(frame, 'allow-btn');
  const held = [];
  for (let i = 0; i < 18; i++) {
    await page.mouse.click(at.x, at.y);
    held.push(await frame.locator('#allow-btn').evaluate(b => b.disabled || b.getAttribute('aria-disabled') === 'true'));
    await page.waitForTimeout(180);
  }
  expect(held.every(Boolean), `held after each click: ${held}`).toBe(true);
  expect(await signed(page)).toBe(false);

  await page.waitForTimeout(QUIET_MS + 150);
  await expect(frame.locator('#allow-btn')).toBeEnabled();
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);
  await page.mouse.click(at.x, at.y);
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect(await signed(page)).toBe(true);
  await page.close();
});

test('a press begun while held does not approve when it ends', async () => {
  const { page, frame } = await openSheet(390, 700, STATES.upload());
  await expect(frame.locator('#allow-btn')).toBeEnabled();
  const at = await pagePoint(frame, 'allow-btn');
  const elsewhere = await pagePoint(frame, 'perm-host');
  await page.mouse.click(elsewhere.x, elsewhere.y);
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await page.waitForTimeout(QUIET_MS + 300);
  await page.mouse.up();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('a click on the page frame elsewhere restarts the hold', async () => {
  const { page, frame } = await openSheet(390, 700, STATES.upload());
  await expect(frame.locator('#allow-btn')).toBeEnabled();
  const at = await pagePoint(frame, 'perm-host');
  await page.mouse.click(at.x, at.y);
  await expect(frame.locator('#allow-btn')).toBeDisabled({ timeout: 100 });
  await expect(frame.locator('#allow-btn')).toBeEnabled({ timeout: QUIET_MS + 300 });
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('one click on a settled Approve signs', async () => {
  const { page, frame } = await openSheet(390, 700, STATES.upload());
  await expect(frame.locator('#allow-btn')).toBeEnabled();
  await page.waitForTimeout(QUIET_MS);
  const at = await pagePoint(frame, 'allow-btn');
  await page.mouse.click(at.x, at.y);
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect(await signed(page)).toBe(true);
  await page.close();
});

for (const key of ['Enter', 'Space']) {
  test(`the keyboard reaches Approve and ${key} signs`, async () => {
    const { page, frame } = await openSheet(390, 700, STATES.upload());
    await expect(frame.locator('#allow-btn')).toBeEnabled();
    await frame.locator('#deny-btn').focus();
    await page.keyboard.press('Tab');
    expect(await frame.evaluate(() => document.activeElement.id)).toBe('allow-btn');
    await page.waitForTimeout(QUIET_MS + 100);
    await page.keyboard.press(key);
    await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
    expect(await signed(page)).toBe(true);
    await page.close();
  });
}

test('a key mashed on Approve never lands, and a held key does not either', async () => {
  const { page, frame } = await openSheet(390, 700, STATES.upload());
  await frame.locator('#allow-btn').focus();
  await page.keyboard.press('Shift');
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(180);
  }
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);
  await page.keyboard.down('Space');
  await page.waitForTimeout(QUIET_MS + 200);
  await page.keyboard.up('Space');
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);

  // A held key repeats after a pause longer than the hold.
  await page.keyboard.press('Shift');
  await page.keyboard.down('Enter');
  await page.waitForTimeout(QUIET_MS + 100);
  await page.keyboard.down('Enter');
  await page.waitForTimeout(150);
  await page.keyboard.up('Enter');
  expect(await page.evaluate(() => window.__nk.done)).toBe(false);
  await frame.locator('#deny-btn').click();
  await page.close();
});

test('Deny answers at once during the hold', async () => {
  const page = await openFixture(context, `https://t${++hostCount}.example.com/`);
  await page.evaluate((e) => window.__triggerEvent(e), STATES.upload());
  const frame = await waitForPermissionFrame(page);
  await frame.locator('#deny-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect(await signed(page)).toBe(false);
  await page.close();
});

test('an upload reads as an upload, and remembering it answers the next one', async () => {
  const { page, frame } = await openSheet(390, 700, token('upload', { tags: [['x', HASH]] }));
  await expect(frame.locator('#perm-type')).toHaveText('Upload a file to a media server');
  await expect(frame.locator('#remember-patch-label')).toHaveText('Remember uploads for this site');
  await expect(frame.locator('#perm-servers')).toHaveText('any server');
  await frame.locator('#remember-patch').click();
  await frame.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });

  await page.evaluate((e) => window.__triggerEvent(e), token('upload', { tags: [['x', 'b'.repeat(64)]] }));
  await page.waitForFunction(() => window.__nk.done, { timeout: 8000 });
  expect((await page.evaluate(() => window.__nk)).sig?.sig).toMatch(/^[0-9a-f]{128}$/);
  await page.close();
});

test('a remote signer profile says its signer may still ask', async () => {
  await seedRemoteProfile();
  try {
    for (const [sizeName, w, h] of SIZES) {
      const { page, frame } = await openSheet(w, h, token('upload', { tags: [['x', HASH]] }));
      await expect(frame.locator('#remember-note')).toHaveText("NostrKey won't ask. Your remote signer may.");
      await expect(frame.locator('#perm-identity')).toHaveText('Remote E2E');
      const m = await measure(page, frame);
      expectDecisionInView(m);
      await keep(page, `sheet-remote-${sizeName}`, m);
      await frame.locator('#deny-btn').click();
      await page.close();
    }
  } finally {
    await seedLocalProfile(sw);
  }
});

test('the pages a prompt can open on their own fit too', async () => {
  const { extensionId } = { extensionId: sw.url().split('/')[2] };
  const page = await context.newPage();
  await page.setViewportSize({ width: 390, height: 504 });
  // These states need a signer or a lock, so the page is given its request directly.
  await page.addInitScript((payload) => {
    const send = chrome.runtime.sendMessage.bind(chrome.runtime);
    chrome.runtime.sendMessage = (message, ...rest) => (
      message.kind === 'promptReady' ? Promise.resolve({ payload }) : send(message, ...rest));
  }, JSON.stringify(token('upload', { tags: [['x', HASH]] })));
  const base = {
    uuid: 'shot', kind: 'signEvent', queuePosition: '1', queueTotal: '1',
    grantKey: 'signEvent:24242:upload', parsedAt: String(now()), profileName: 'Remote E2E',
  };
  for (const [name, query, note] of [
    ['locked-remote', { ...base, host: 'https://example.com', rememberable: '1', profileType: 'bunker', lockedGrant: '1' }, 'NostrKey is locked, so this asks'],
    ['inbound', { ...base, host: 'bunker client abcdef012345… (claimed — not verified)', rememberable: '0', inbound: '1', profileName: 'E2E', profileType: 'local' }, 'This always asks here'],
  ]) {
    await page.goto(`chrome-extension://${extensionId}/permission/permission.html?${new URLSearchParams(query)}`);
    await expect(page.locator('#remember-note')).toHaveText(note);
    const position = await page.evaluate(() => {
      const r = document.getElementById('deny-btn').getBoundingClientRect();
      const note = document.getElementById('remember-note').getBoundingClientRect();
      return { denyBottom: r.bottom, noteBottom: note.bottom, h: window.innerHeight, overflows: document.documentElement.scrollHeight > window.innerHeight };
    });
    expect(position.denyBottom).toBeLessThanOrEqual(position.h);
    expect(position.noteBottom).toBeLessThanOrEqual(position.h);
    expect(position.overflows).toBe(false);
    await keep(page, `tab-${name}-390x504`, position);
  }
  await page.close();
});
