/**
 * The effect preview in a real browser: a kind 3 that would drop most of the
 * follow list says so and needs the "I understand" tick before Approve; one that
 * only adds stays one tap. The current list comes from a relay stand-in inside
 * the worker, so nothing leaves the machine.
 */
import { test, expect } from '@playwright/test';
import { finalizeEvent, hexToBytes } from 'nostr-crypto-utils';
import {
  ALICE, launchWithExtension, seedLocalProfile, openFixture, waitForPermissionFrame,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const RELAY = 'wss://relay.stand-in.example';
const hex = (n) => n.toString(16).padStart(64, '0');
const follows = (n) => Array.from({ length: n }, (_, i) => ['p', hex(i + 1)]);

let context, sw, hostCount = 0;

/** Stand in for the worker's WebSocket: serve `events` back for a matching REQ. */
const installRelay = (events) => sw.evaluate((events) => {
  globalThis.__relay = { published: [], events };
  globalThis.WebSocket = class {
    constructor() { this.readyState = 1; setTimeout(() => this.onopen?.(), 0); }

    reply(frame) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(frame) }), 0); }

    send(text) {
      const [type, a, filter] = JSON.parse(text);
      if (type === 'EVENT') {
        globalThis.__relay.published.push(a);
        this.reply(['OK', a.id, true, '']);
      } else if (type === 'REQ') {
        globalThis.__relay.events
          .filter(e => filter.kinds?.includes(e.kind) && (!filter.authors || filter.authors.includes(e.pubkey)))
          .forEach(e => this.reply(['EVENT', a, e]));
        this.reply(['EOSE', a]);
      }
    }

    close() { this.readyState = 3; }
  };
}, events);

async function openRequest(tags) {
  const page = await openFixture(context, `https://t${++hostCount}.example.com/`);
  await page.evaluate((tags) => window.__triggerEvent({
    kind: 3, created_at: Math.floor(Date.now() / 1000), tags, content: '',
  }), tags);
  const frame = await waitForPermissionFrame(page);
  expect(frame).not.toBeNull();
  return { page, frame };
}

test.beforeAll(async () => {
  ({ context, sw } = await launchWithExtension());
  await seedLocalProfile(sw, ALICE, { relays: [{ url: RELAY, read: true, write: true }] });
  const current = await finalizeEvent({
    kind: 3, tags: follows(20), content: '', created_at: Math.floor(Date.now() / 1000) - 3600,
  }, hexToBytes(ALICE.privKey));
  await installRelay([current]);
});

test.afterAll(async () => { await context.close(); });

test('dropping most follows says so, and Approve waits for the tick', async () => {
  const { page, frame } = await openRequest(follows(2));
  const lines = frame.locator('#effect-lines');
  await expect(lines).toContainText('Removes 18 of your 20 follows.');
  await expect(lines).toContainText('After this: 2 follows.');
  const tick = frame.locator('#effect-understood-box');
  await expect(tick).toBeVisible();
  await page.waitForTimeout(700); // past the settle
  await expect(frame.locator('#allow-btn')).toBeDisabled();
  await tick.check();
  await expect(frame.locator('#allow-btn')).toBeEnabled();
  await frame.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, null, { timeout: 8000 });
  const result = await page.evaluate(() => window.__nk);
  expect(result.sig).toMatchObject({ kind: 3 });
  expect(result.sig.tags).toHaveLength(2);
  await page.close();
});

test('adding a follow is one tap, with no tick', async () => {
  // The list just signed (2 follows) is now the newest copy on this device.
  const { page, frame } = await openRequest(follows(3));
  await expect(frame.locator('#effect-lines')).toContainText('Adds 1 follow.');
  await expect(frame.locator('#effect-understood')).toBeHidden();
  await expect(frame.locator('#allow-btn')).toBeEnabled({ timeout: 3000 });
  await frame.locator('#allow-btn').click();
  await page.waitForFunction(() => window.__nk.done, null, { timeout: 8000 });
  expect((await page.evaluate(() => window.__nk)).sig).toMatchObject({ kind: 3 });
  await page.close();
});
