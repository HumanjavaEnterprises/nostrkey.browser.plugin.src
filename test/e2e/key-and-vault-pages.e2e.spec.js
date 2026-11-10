/**
 * The extension's own pages, each in a real browser, doing the work that reads or
 * spends a key: showing a private key, reading the vault and API keys back, saving
 * and deleting. A relay stand-in sits inside the worker, so nothing leaves the
 * machine and every published event can be read back.
 */
import { test, expect } from '@playwright/test';
import {
  ALICE, launchWithExtension, seedLocalProfile, openFixture, waitForPermissionFrame,
} from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const PASSWORD = 'correct horse battery';
const RELAY = 'wss://relay.stand-in.example';
const NSEC = 'nsec1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsmhltgl';
const UNAUTHORIZED = 'Unauthorized sender';

let context, extensionId, sw;

/** Stand in for the worker's WebSocket: keep what is published and serve it back. */
const installRelay = () => sw.evaluate(() => {
  const relay = globalThis.__relay ??= { published: [] };
  globalThis.WebSocket = class {
    constructor() { this.readyState = 1; setTimeout(() => this.onopen?.(), 0); }

    reply(frame) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(frame) }), 0); }

    send(text) {
      const [type, a, filter] = JSON.parse(text);
      if (type === 'EVENT') {
        relay.published.push(a);
        this.reply(['OK', a.id, true, '']);
      } else if (type === 'REQ') {
        const wanted = filter['#d'];
        relay.published
          .filter(e => filter.kinds?.includes(e.kind) && (!wanted || e.tags.some(t => t[0] === 'd' && wanted.includes(t[1]))))
          .forEach(e => this.reply(['EVENT', a, e]));
        this.reply(['EOSE', a]);
      }
    }

    close() { this.readyState = 3; }
  };
});

const published = () => sw.evaluate(() => globalThis.__relay.published);

async function open(path) {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/${path}`);
  return page;
}

/** Send from inside a page or frame of ours, as its own script does. */
const ask = (where, message) => where.evaluate(m => chrome.runtime.sendMessage(m), message);

test.beforeAll(async () => {
  ({ context, extensionId, sw } = await launchWithExtension());
  await seedLocalProfile(sw, ALICE, { relays: [{ url: RELAY, read: true, write: true }] });
  await installRelay();
  const first = await open('sidepanel.html');
  await first.locator('.tab-btn.active').waitFor();
  await first.waitForTimeout(800);
  expect(await ask(first, { kind: 'setPassword', payload: PASSWORD })).toMatchObject({ success: true });
  await first.close();
});

test.afterAll(async () => { await context.close(); });

test('the side panel shows a private key once confirmed', async () => {
  const page = await open('sidepanel.html');
  await page.locator('.profile-edit-btn').first().click();
  await page.locator('[data-action="pd-reveal-nsec"]').click();
  await page.getByRole('button', { name: 'Reveal key' }).click();
  await expect(page.locator('#pd-keys-nsec')).toHaveText(NSEC);
  await page.close();
});

test('the key page shows a private key', async () => {
  const page = await open('nostr-keys/nostr-keys.html');
  await page.locator('#profile-list [data-index], #profile-list button, #profile-list > *').first().click();
  await page.locator('#toggle-nsec-btn').click();
  await expect(page.locator('#detail-nsec')).toHaveText(NSEC);
  await page.close();
});

test('the vault saves a document, reads it back and deletes it', async () => {
  const page = await open('vault/vault.html');
  // Save only once the relay list is stored and the page has loaded it: the
  // sync button turns on when the page has relays and is not mid-sync.
  await expect.poll(() => ask(page, { kind: 'vault.getRelays' })).toMatchObject({ write: [RELAY] });
  await expect(page.locator('#sync-btn')).toBeEnabled();
  await page.locator('#new-doc-btn').click();
  await page.locator('#editor-title').fill('notes/first.md');
  await page.locator('#editor-content').fill('a private note');
  await page.locator('#save-doc-btn').click();
  await expect(page.locator('#toast')).toHaveText('Saved');

  const [saved] = await published();
  expect(saved).toMatchObject({ kind: 30078, pubkey: ALICE.pubKey });
  expect(saved.tags).toContainEqual(['d', 'nostrkey:notes/first.md']);
  expect(saved.content).not.toContain('a private note');

  const fetched = await ask(page, { kind: 'vault.fetch' });
  expect(fetched.documents).toEqual([expect.objectContaining({ path: 'notes/first.md', content: 'a private note' })]);
  await page.locator('#sync-btn').click();
  await expect(page.locator('#sync-text')).not.toContainText('rror');

  await page.locator('#file-list [data-doc-path]').first().click();
  await page.locator('#delete-doc-btn').click();
  await page.getByRole('button', { name: 'Delete document' }).click();
  await expect(page.locator('#toast')).toHaveText('Deleted');

  const gone = (await published()).at(-1);
  expect(gone).toMatchObject({ kind: 5, pubkey: ALICE.pubKey });
  expect(gone.tags).toContainEqual(['e', saved.id]);
  await page.close();
});

test('the API key page saves a key, reads it back, exports it and deletes it', async () => {
  const page = await open('api-keys/api-keys.html');
  await page.locator('#new-label').fill('Service');
  await page.locator('#new-secret').fill('secret-value');
  await page.locator('#add-key-btn').click();
  await expect(page.locator('[data-action="delete-key"]')).toHaveCount(1);

  await expect.poll(async () => (await published()).filter(e => e.tags.some(t => t[1] === 'nostrkey:vault/api-keys')).length).toBe(1);
  const saved = (await published()).at(-1);
  expect(saved).toMatchObject({ kind: 30078, pubkey: ALICE.pubKey });
  expect(saved.content).not.toContain('secret-value');

  const fetched = await ask(page, { kind: 'apikeys.fetch' });
  expect(Object.values(fetched.keys).map(k => k.label)).toEqual(['Service']);

  await page.locator('#sync-btn').click();
  await expect(page.locator('#sync-text')).not.toContainText('rror');

  // Export and import both pass through the worker.
  const { cipherText } = await ask(page, { kind: 'apikeys.encrypt', payload: { plainText: 'round trip' } });
  expect(await ask(page, { kind: 'apikeys.decrypt', payload: { cipherText } }))
    .toMatchObject({ success: true, plainText: 'round trip' });

  await page.locator('[data-action="delete-key"]').click();
  await page.getByRole('button', { name: 'Delete key' }).click();
  await expect(page.locator('[data-action="delete-key"]')).toHaveCount(0);
  await expect.poll(async () => (await published()).filter(e => e.tags.some(t => t[1] === 'nostrkey:vault/api-keys')).length).toBe(2);
  await page.close();
});

test('the remote signer panel reaches the worker', async () => {
  const page = await open('sidepanel.html');
  await page.locator('.tab-btn.active').waitFor();
  expect(await ask(page, { kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: 'x' } }))
    .toMatchObject({ success: false, error: expect.not.stringContaining(UNAUTHORIZED) });
  expect(await ask(page, { kind: 'bunker.disconnect', payload: 0 })).toEqual({ success: true });
  await page.close();
});

const READS = [
  { kind: 'isLocked' }, { kind: 'isEncrypted' }, { kind: 'hasEncryptedData' },
  { kind: 'getAutoLockTimeout' }, { kind: 'getNostrAccessWhileLocked' },
  { kind: 'getBlockCrossOriginFrames' }, { kind: 'getActiveProfileInfo' },
  { kind: 'getProfileType' }, { kind: 'getNpub', payload: 0 }, { kind: 'getNsec', payload: 0 },
  { kind: 'calcPubKey', payload: ALICE.privKey }, { kind: 'npubEncode', payload: ALICE.pubKey },
  { kind: 'seedPhrase.validate', payload: 'x' }, { kind: 'vault.getRelays' },
  { kind: 'bunker.status' }, { kind: 'bunker.validateUrl', payload: 'x' },
];

async function expectAnswered(where) {
  for (const message of READS) {
    const answer = await ask(where, message);
    expect(answer?.error, message.kind).not.toBe(UNAUTHORIZED);
  }
  expect(await ask(where, { kind: 'getNsec', payload: 0 })).toBe(NSEC);
}

for (const path of [
  'sidepanel.html', 'popup.html', 'full_settings.html', 'vault/vault.html', 'api-keys/api-keys.html',
  'nostr-keys/nostr-keys.html', 'profiles/profiles.html', 'security/security.html',
  'event_history/event_history.html', 'permission/permission.html',
]) {
  test(`${path} is answered`, async () => {
    const page = await open(path);
    await expectAnswered(page);
    await page.close();
  });
}

test('the consent sheet framed in a website is answered', async () => {
  const page = await openFixture(context);
  const answer = page.evaluate(() => window.nostr.signEvent({ kind: 1, content: 'x', tags: [], created_at: 1 }).catch(() => null));
  const frame = await waitForPermissionFrame(page);
  await expectAnswered(frame);
  await frame.locator('#deny, button:has-text("Deny")').first().click();
  await answer;
  await page.close();
});

test('window.nostr lives in the top frame only, whatever the frame setting says', async () => {
  const body = '<!doctype html><title>t</title><iframe id="same" srcdoc="<p>x</p>"></iframe>'
    + '<iframe id="blank" src="about:blank"></iframe>'
    + '<iframe id="other" src="https://frame.example/"></iframe>';
  const page = await context.newPage();
  await page.route('https://example.com/framed', route => route.fulfill({ status: 200, contentType: 'text/html', body }));
  await page.route('https://frame.example/', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>inner</p>' }));
  const sidepanel = await open('sidepanel.html');
  for (const blocked of [true, false]) {
    await ask(sidepanel, { kind: 'setBlockCrossOriginFrames', payload: blocked });
    await page.goto('https://example.com/framed');
    await page.waitForFunction(() => typeof window.nostr !== 'undefined');
    await page.waitForTimeout(300);
    const frames = page.frames().filter(f => f !== page.mainFrame());
    expect(frames).toHaveLength(3);
    for (const frame of frames) {
      expect(await frame.evaluate(() => typeof window.nostr), frame.url()).toBe('undefined');
    }
  }
  await ask(sidepanel, { kind: 'setBlockCrossOriginFrames', payload: true });
  await sidepanel.close();
  await page.close();
});

test('a request from a website is shown under the origin the browser reports', async () => {
  await sw.evaluate(() => {
    globalThis.__senders = [];
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (message.kind === 'getPubKey') globalThis.__senders.push({ origin: sender.origin, url: sender.url, frameId: sender.frameId });
    });
  });
  const page = await openFixture(context);
  await expect(page.locator('body')).toBeVisible();
  const asked = page.evaluate(() => window.nostr.getPublicKey().catch(() => null));
  const frame = await waitForPermissionFrame(page);
  expect(new URL(frame.url()).searchParams.get('host')).toBe('https://example.com');
  expect(await sw.evaluate(() => globalThis.__senders)).toEqual([
    { origin: 'https://example.com', url: 'https://example.com/', frameId: 0 },
  ]);
  await frame.locator('#deny, button:has-text("Deny")').first().click();
  await asked;
  await page.close();
});
