/**
 * The side panel keeps its profile view and links to the full profile tab:
 * "View full profile" opens the tab for that identity, and focuses it the next
 * time; "Open details" opens the tab at Connected sites; a profile saved in the
 * tab shows in the panel. A relay stand-in keeps everything on the machine.
 * Screenshots go to LINK_SHOTS when it is set.
 */
import { test, expect } from '@playwright/test';
import { finalizeEvent } from 'nostr-crypto-utils';
import { ALICE, launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const RELAY = 'wss://relay.stand-in.example';
const SHOTS = process.env.LINK_SHOTS || '';
let context, extensionId, sw;

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw);
  const first = await context.newPage();
  await first.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await first.locator('.tab-btn.active').waitFor();
  await first.waitForTimeout(800);
  await first.close();
  await sw.evaluate(async (url) => {
    const { profiles } = await chrome.storage.local.get('profiles');
    profiles[0].relays = [{ url, read: true, write: true }];
    await chrome.storage.local.set({ profiles });
  }, RELAY);
  const kind0 = await finalizeEvent({
    kind: 0, created_at: Math.floor(Date.now() / 1000) - 60, tags: [],
    content: JSON.stringify({ name: 'alice' }),
  }, ALICE.privKey);
  await sw.evaluate((event) => {
    globalThis.__standInEvent = event;
    globalThis.WebSocket = class {
      constructor() { this.readyState = 1; setTimeout(() => this.onopen?.(), 0); }
      reply(f) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(f) }), 0); }
      send(text) {
        const [type, sub, filter] = JSON.parse(text);
        if (type === 'EVENT') { globalThis.__standInEvent = sub; this.reply(['OK', sub.id, true, '']); return; }
        if (type !== 'REQ') return;
        const stored = globalThis.__standInEvent;
        if (stored && filter.kinds?.includes(stored.kind)) this.reply(['EVENT', sub, stored]);
        this.reply(['EOSE', sub]);
      }
      close() { this.readyState = 3; }
    };
  }, kind0);
});
test.afterAll(async () => { await context?.close(); });

const profileTabs = () => context.pages().filter(p => p.url().includes('/profile.html'));

async function openPanelProfile() {
  const panel = await context.newPage();
  await panel.setViewportSize({ width: 400, height: 900 });
  await panel.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await panel.locator('.profile-edit-btn').first().click();
  await expect(panel.locator('#view-profile-view')).toBeVisible();
  return panel;
}

test('View full profile opens the tab once and focuses it after; the panel follows a save', async () => {
  const panel = await openPanelProfile();
  await expect(panel.locator('#view-full-profile-btn')).toHaveText('View full profile');
  if (SHOTS) await panel.screenshot({ path: `${SHOTS}/panel-profile-view.png`, fullPage: true });

  const opened = context.waitForEvent('page');
  await panel.click('#view-full-profile-btn');
  const tab = await opened;
  await tab.waitForLoadState();
  expect(tab.url()).toContain(`profile.html?pubkey=${ALICE.pubKey}`);
  await expect(tab.locator('body')).toHaveAttribute('data-state', 'confirmed');
  await expect(panel.locator('#pd-public-name')).toHaveText('Public profile name: alice');

  await panel.bringToFront();
  await panel.click('#view-full-profile-btn');
  await panel.waitForTimeout(500);
  expect(profileTabs()).toHaveLength(1);
  expect(await tab.evaluate(() => document.visibilityState)).toBe('visible');

  // Save a new name in the tab; the panel shows it.
  await tab.click('#pd-edit');
  await tab.fill('#pd-in-name', 'alice two');
  await tab.click('#pd-save');
  await expect(tab.locator('#pd-save-result')).toBeVisible({ timeout: 10000 });
  await expect(panel.locator('#pd-public-name')).toHaveText('Public profile name: alice two');
  if (SHOTS) await panel.screenshot({ path: `${SHOTS}/panel-after-tab-save.png`, fullPage: true });
  await panel.close();
});

test('Open details goes to Connected sites in the same tab', async () => {
  const panel = await openPanelProfile();
  await panel.click('#pd-permissions-details');
  await panel.waitForTimeout(500);
  const tabs = profileTabs();
  expect(tabs).toHaveLength(1);
  await expect.poll(() => tabs[0].url()).toMatch(/#sites$/);
  if (SHOTS) await tabs[0].screenshot({ path: `${SHOTS}/tab-at-sites.png` });

  await panel.locator('.tab-btn[data-view="permissions"]').click();
  await expect(panel.locator('#permissions-details-btn')).toHaveText('Open details');
  if (SHOTS) await panel.screenshot({ path: `${SHOTS}/panel-apps-tab.png`, fullPage: true });
  await panel.click('#permissions-details-btn');
  await panel.waitForTimeout(300);
  expect(profileTabs()).toHaveLength(1);
  await panel.close();
});
