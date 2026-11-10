/**
 * History and restore in a real browser: the relay holds follow list A, then a
 * newer list B. The profile tab saves both on this device; restoring A (a big
 * removal against B) needs the "I understand" tick, then publishes a newer event
 * with A's tags. A relay stand-in replaces the worker's WebSocket.
 */
import { test, expect } from '@playwright/test';
import { finalizeEvent, hexToBytes } from 'nostr-crypto-utils';
import { ALICE, launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const RELAY = 'wss://relay.stand-in.example';
const hex = (n) => n.toString(16).padStart(64, '0');
const follows = (n) => Array.from({ length: n }, (_, i) => ['p', hex(i + 1)]);

let context, extensionId, sw;

/** Serves every stored event matching the filter; a published event is stored and served next. */
const installRelay = (events) => sw.evaluate((events) => {
  globalThis.__relay = { published: [], events };
  globalThis.WebSocket = class {
    constructor() { this.readyState = 1; setTimeout(() => this.onopen?.(), 0); }

    reply(frame) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(frame) }), 0); }

    send(text) {
      const [type, a, ...filters] = JSON.parse(text);
      if (type === 'EVENT') {
        globalThis.__relay.published.push(a);
        globalThis.__relay.events.push(a);
        this.reply(['OK', a.id, true, '']);
      } else if (type === 'REQ') {
        const out = new Map();
        for (const f of filters) {
          globalThis.__relay.events
            .filter(e => f.kinds?.includes(e.kind) && (!f.authors || f.authors.includes(e.pubkey)))
            .forEach(e => out.set(e.id, e));
        }
        for (const e of out.values()) this.reply(['EVENT', a, e]);
        this.reply(['EOSE', a]);
      }
    }

    close() { this.readyState = 3; }
  };
}, events);

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw, ALICE, { relays: [{ url: RELAY, read: true, write: true }] });
});

test.afterAll(async () => { await context?.close(); });

test('restore an older follow list from the profile tab, with the tick', async () => {
  const now = Math.floor(Date.now() / 1000);
  const listA = await finalizeEvent({ kind: 3, tags: follows(2), content: '', created_at: now - 3600 }, hexToBytes(ALICE.privKey));
  const listB = await finalizeEvent({ kind: 3, tags: follows(20), content: '', created_at: now - 1800 }, hexToBytes(ALICE.privKey));
  await installRelay([listA]);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/profile.html?pubkey=${ALICE.pubKey}`);
  const group = page.locator('.pd-history-group[data-kind="3"]');
  await expect(group.locator('.pd-history-row')).toHaveCount(1, { timeout: 10000 });

  await sw.evaluate((b) => { globalThis.__relay.events.push(b); }, listB);
  await page.reload();
  await expect(group.locator('.pd-history-row')).toHaveCount(2, { timeout: 10000 });
  await expect(group.locator(`.pd-history-row[data-id="${listB.id}"]`)).toContainText('20 follows');
  await expect(group.locator(`.pd-history-row[data-id="${listB.id}"]`)).toContainText('Current');
  await expect(group.locator(`.pd-history-row[data-id="${listA.id}"]`)).toContainText('2 follows');

  await group.locator(`.pd-history-row[data-id="${listA.id}"] .pd-history-restore`).click();
  await expect(page.locator('#pd-restore')).toBeVisible();
  await expect(page.locator('#pd-restore-lines')).toContainText('Removes 18 of your 20 follows.');
  await expect(page.locator('#pd-restore-confirm')).toBeDisabled();
  await page.locator('#pd-restore-understood').check();
  await expect(page.locator('#pd-restore-confirm')).toBeEnabled();
  await page.locator('#pd-restore-confirm').click();
  await expect(page.locator('#pd-restore-status')).toHaveText('Published to 1 of 1 relay.', { timeout: 10000 });

  const published = await sw.evaluate(() => globalThis.__relay.published);
  const restored = published.filter(e => e.kind === 3).at(-1);
  expect(restored.tags).toEqual(listA.tags);
  expect(restored.pubkey).toBe(ALICE.pubKey);
  expect(restored.created_at).toBeGreaterThan(listB.created_at);
  await expect(group.locator('.pd-history-row').first()).toHaveAttribute('data-id', restored.id);
  await page.close();
});
