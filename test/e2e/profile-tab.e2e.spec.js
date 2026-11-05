/**
 * The profile tab in a real browser: open profile.html for an identity and see
 * each state. A relay stand-in replaces the worker's WebSocket, so nothing
 * leaves the machine. Screenshots go to PROFILE_SHOTS when it is set.
 */
import { test, expect } from '@playwright/test';
import { finalizeEvent } from 'nostr-crypto-utils';
import { ALICE, launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const RELAY = 'wss://relay.stand-in.example';
const SHOTS = process.env.PROFILE_SHOTS || '';
let context, extensionId, sw, kind0;

/**
 * mode: 'serve' answers with the stored kind 0, 'empty' answers EOSE only, 'down' never connects,
 * 'refuse' serves but answers every EVENT with OK false. A published event is kept and served next.
 */
const setRelay = (mode, event = null) => sw.evaluate(({ mode, event }) => {
  globalThis.__standInEvent = event;
  globalThis.WebSocket = class {
    constructor() {
      if (mode === 'down') throw new Error('unreachable');
      this.readyState = 1; setTimeout(() => this.onopen?.(), 0);
    }

    reply(f) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(f) }), 0); }

    send(text) {
      const [type, sub, filter] = JSON.parse(text);
      if (type === 'EVENT') {
        const ok = mode !== 'refuse';
        if (ok) globalThis.__standInEvent = sub;
        this.reply(['OK', sub.id, ok, ok ? '' : 'blocked: test']);
        return;
      }
      if (type !== 'REQ') return;
      const stored = globalThis.__standInEvent;
      if (stored && filter.kinds?.includes(stored.kind)) this.reply(['EVENT', sub, stored]);
      this.reply(['EOSE', sub]);
    }

    close() { this.readyState = 3; }
  };
}, { mode, event });

async function openTab(width = 1200) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`chrome-extension://${extensionId}/profile.html?pubkey=${ALICE.pubKey}`);
  return page;
}

async function shot(page, name) {
  if (!SHOTS) return;
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
  await sw.evaluate(async (url) => {
    const { profiles } = await chrome.storage.local.get('profiles');
    profiles[0].relays = [{ url, read: true, write: true }];
    await chrome.storage.local.set({ profiles });
  }, RELAY);
  // Image hosts answer nothing, so the picture check fails without the network.
  await context.route('https://img.stand-in.example/**', r => r.abort());
  kind0 = await finalizeEvent({
    kind: 0, created_at: Math.floor(Date.now() / 1000), tags: [],
    content: JSON.stringify({ name: 'alice', about: 'Testing the profile tab.', picture: 'https://img.stand-in.example/a.png', website: 'https://alice.example' }),
  }, ALICE.privKey);
});

test.afterAll(async () => { await context?.close(); });

test('confirmed: fields show with per-field status in words, Edit is available', async () => {
  await setRelay('serve', kind0);
  for (const [width, tag] of [[1200, 'desktop'], [390, 'mobile']]) {
    const page = await openTab(width);
    await expect(page.locator('body')).toHaveAttribute('data-state', 'confirmed');
    await expect(page.locator('#pd-title')).toHaveText('E2E');
    await expect(page.locator('#pd-npub')).toHaveText(/^npub1.{7}….{8}$/);
    const name = page.locator('.pd-field[data-field="name"]');
    await expect(name.locator('.pd-field-value')).toHaveText('alice');
    await expect(name.locator('.pd-status-text')).toHaveText('From your profile');
    const pic = page.locator('.pd-field[data-field="picture"]');
    await expect(pic.locator('.pd-mark')).toHaveText('!', { timeout: 10000 });
    await expect(page.locator('#pd-edit')).toBeEnabled();
    await expect(page.locator('#pd-create')).toBeHidden();
    await expect(page.locator('#pd-privacy')).toHaveText('Checking a picture or banner contacts the host of that image.');
    await shot(page, `confirmed-${tag}`);
    await page.close();
  }
});

test('none: offers Create your profile', async () => {
  await setRelay('empty');
  for (const [width, tag] of [[1200, 'desktop'], [390, 'mobile']]) {
    const page = await openTab(width);
    await expect(page.locator('body')).toHaveAttribute('data-state', 'none');
    await expect(page.locator('#pd-create')).toBeVisible();
    await expect(page.locator('#pd-create')).toBeEnabled();
    await shot(page, `none-${tag}`);
    await page.close();
  }
});

test('unreachable: fields stay "?", editing locked, Retry recovers', async () => {
  await setRelay('down');
  for (const [width, tag] of [[1200, 'desktop'], [390, 'mobile']]) {
    const page = await openTab(width);
    await expect(page.locator('body')).toHaveAttribute('data-state', 'unreachable', { timeout: 15000 });
    await expect(page.locator('#pd-message')).toHaveText("Couldn't reach your relays. Editing is locked so nothing gets overwritten.");
    await expect(page.locator('.pd-mark').first()).toHaveText('?');
    await expect(page.locator('#pd-edit')).toBeDisabled();
    await shot(page, `unreachable-${tag}`);
    if (tag === 'desktop') {
      await setRelay('serve', kind0);
      await page.locator('#pd-retry').click();
      await expect(page.locator('body')).toHaveAttribute('data-state', 'confirmed');
      await setRelay('down');
    }
    await page.close();
  }
});

test('extension locked: the view renders and Edit is unavailable', async () => {
  await setRelay('serve', kind0);
  const page = await openTab();
  // Stand in for the worker's lock answer; the page asks isLocked first.
  await page.evaluate(() => {
    const real = chrome.runtime.sendMessage.bind(chrome.runtime);
    chrome.runtime.sendMessage = (m, ...rest) => (m && m.kind === 'isLocked' ? Promise.resolve(true) : real(m, ...rest));
  });
  await page.locator('#pd-retry').evaluate(b => { b.hidden = false; });
  await page.locator('#pd-retry').click();
  await expect(page.locator('#pd-locked')).toBeVisible();
  await expect(page.locator('.pd-field[data-field="name"] .pd-field-value')).toHaveText('alice');
  await expect(page.locator('#pd-edit')).toBeDisabled();
  await expect(page.locator('#pd-edit-reason')).toHaveText('Unlock NostrKey to edit.');
  await shot(page, 'locked-desktop');
  await page.close();
});

test('another key: the tab says it is not one of your identities and asks no relay', async () => {
  await setRelay('serve', kind0);
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/profile.html?pubkey=${'f'.repeat(64)}`);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'not-mine');
  await expect(page.locator('#pd-message')).toHaveText(/^Not one of your identities/);
  await expect(page.locator('#pd-fields')).toBeHidden();
  await expect(page.locator('#pd-create')).toBeHidden();
  await shot(page, 'not-mine-desktop');
  await page.close();
});

test('a web page cannot ask for a profile', async () => {
  await context.route('https://example.com/**', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><title>x</title>' }));
  const page = await context.newPage();
  await page.goto('https://example.com/');
  const reachable = await page.evaluate(() => typeof globalThis.chrome?.runtime?.sendMessage === 'function');
  expect(reachable).toBe(false);
  await page.close();
});

test('edit and save: Enter saves, the tab re-fetches and shows the new content, unknown fields kept', async () => {
  const withExtra = await finalizeEvent({
    kind: 0, created_at: Math.floor(Date.now() / 1000) - 60, tags: [],
    content: JSON.stringify({ name: 'alice', about: 'Testing the profile tab.', birthday: { year: 1990 }, lud06: 'lnurl1keep' }),
  }, ALICE.privKey);
  await setRelay('serve', withExtra);
  const page = await openTab();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'confirmed');
  await page.locator('#pd-edit').click();
  await expect(page.locator('#pd-in-name')).toBeFocused();
  await page.locator('#pd-in-name').fill('Alice Edited');
  await page.locator('#pd-in-picture').fill('http://img.stand-in.example/a.png');
  await expect(page.locator('#pd-err-picture')).toHaveText('Use an https link to the image.');
  await page.locator('#pd-in-picture').fill('https://img.stand-in.example/a.png');
  await expect(page.locator('#pd-dirty')).toHaveText('Unsaved changes');
  await shot(page, 'edit-desktop');
  await page.locator('#pd-in-name').press('Enter');
  await expect(page.locator('#pd-save-result')).toHaveText('Published to 1 of 1 relay.', { timeout: 20000 });
  await expect(page.locator('#pd-form')).toBeHidden();
  await expect(page.locator('#pd-edit')).toBeFocused();
  await expect(page.locator('.pd-field[data-field="name"] .pd-field-value')).toHaveText('Alice Edited');
  await expect(page.locator('.pd-field[data-field="lud06"] .pd-field-value')).toHaveText('lnurl1keep');
  await expect(page.locator('.pd-field[data-field="birthday"] .pd-field-value')).toHaveText('{"year":1990}');
  await shot(page, 'saved-desktop');
  await page.close();
});

test('Escape cancels and restores; leaving with unsaved edits warns', async () => {
  await setRelay('serve', kind0);
  const page = await openTab();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'confirmed');
  await page.locator('#pd-edit').click();
  await page.locator('#pd-in-about').fill('changed');
  await page.locator('#pd-in-about').press('Escape');
  await expect(page.locator('#pd-form')).toBeHidden();
  await expect(page.locator('#pd-edit')).toBeFocused();
  await page.locator('#pd-edit').click();
  await expect(page.locator('#pd-in-about')).toHaveValue('Testing the profile tab.');
  await expect(page.locator('#pd-dirty')).toBeHidden();
  await page.locator('#pd-in-about').fill('changed again');
  let dialog = null;
  page.on('dialog', async (d) => { dialog = d.type(); await d.dismiss(); });
  await page.close({ runBeforeUnload: true });
  await expect.poll(() => dialog).toBe('beforeunload');
});

test('no relay accepts: the save fails and the edits stay in the form', async () => {
  await setRelay('refuse', kind0);
  const page = await openTab();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'confirmed');
  await page.locator('#pd-edit').click();
  await page.locator('#pd-in-name').fill('Not saved');
  await page.locator('#pd-save').click();
  await expect(page.locator('#pd-form-status')).toHaveText('No relay accepted the update. Your edits are kept.', { timeout: 20000 });
  await expect(page.locator('#pd-in-name')).toHaveValue('Not saved');
  await expect(page.locator('#pd-save')).toBeEnabled();
  await shot(page, 'no-relay-desktop');
  page.on('dialog', d => d.accept());
  await page.close();
});

test('really locked: with a password set and NostrKey locked, the view renders read-only', async () => {
  await setRelay('serve', kind0);
  const setup = await openTab();
  await expect(setup.locator('body')).toHaveAttribute('data-state', 'confirmed');
  const ask = (m) => setup.evaluate(x => chrome.runtime.sendMessage(x), m);
  expect(await ask({ kind: 'setPassword', payload: 'correct horse battery staple 1' })).toMatchObject({ success: true });
  await ask({ kind: 'lock' });
  expect(await ask({ kind: 'isLocked' })).toBe(true);
  await setup.close();
  const page = await openTab();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'confirmed');
  await expect(page.locator('#pd-locked')).toBeVisible();
  await expect(page.locator('#pd-edit-reason')).toHaveText('Unlock NostrKey to edit.');
  await expect(page.locator('#pd-title')).toHaveText('E2E');
  await shot(page, 'locked-real-desktop');
  await page.close();
});
