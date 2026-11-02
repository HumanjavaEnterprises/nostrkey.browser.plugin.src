/**
 * The consent flow in real Firefox (Selenium + geckodriver, headless).
 *
 * Playwright can't load a Firefox WebExtension, so this installs the built add-on the
 * way firefox-settings.mjs does and drives it through a site served from this process.
 * Nothing leaves the machine: sites are *.localhost, which Firefox resolves to loopback
 * and treats as a secure context, and every other address goes to a closed local port.
 *
 * The sheet's iframe and the minimized button sit in a closed shadow root, out of reach
 * of page script. Firefox lets a frame script read it, so `surface()` reports what is
 * drawn and hands the iframe to WebDriver. Everything else is a real WebDriver click in
 * the frame, or a real click by viewport coordinate on the page.
 *
 * Tests that wait out the 40 second window each get their own browser and run side by
 * side, so the suite takes about as long as the longest one.
 *
 *   npm run build:firefox:prod && npm run test:e2e:firefox:consent
 *   NK_FF_GREP='remember|queue' npm run test:e2e:firefox:consent     # a subset
 */

import assert from 'node:assert/strict';
import { existsSync, statSync, readFileSync, mkdtempSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Builder, By, Key, Origin } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import { download } from 'geckodriver';
import { calculateEventId, verifySignature } from 'nostr-crypto-utils';
import { ALICE, FIXTURE_HTML } from './helpers/consent-harness.js';
import { newestSource } from './helpers/check-build.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const GECKO_ID = 'nostrkey@nostrkey.com';
const UUID = 'a11a11a1-1a11-4a11-8a11-a11a11a11a11';
const EXTENSION_ORIGIN = `moz-extension://${UUID}/`;
const PROMPT_PATH = 'permission/permission.html';
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const XPI = resolve(ROOT, `distros/nostrkey-firefox-v${pkg.version}.zip`);

const PROMPT_MS = 40_000;       // PROMPT_TIMEOUT_MS in background.js
const EXPIRED_PILL_MS = 20_000; // FAB_EXPIRED_MS in content.js
const QUIET_MS = 450;           // APPROVE_QUIET_MS in permission.js
// The decline runs on a timer in the hidden background page. Timers in hidden contexts
// came in 3 to 5 seconds late over a 40 second wait, and never early.
const HIDDEN_TIMER_SLACK_MS = 5000;
const TEST_LIMIT_MS = 120_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => Math.floor(Date.now() / 1000);

// ── The site ──────────────────────────────────────────────────────────────

// What the shared fixture lacks: JSON in, two requests at once, and a record of every
// injected host, so "never prompted" is checked rather than assumed.
const FIXTURE_EXTRA = `<script>
  window.__triggerJson = (json) => window.__triggerEvent(JSON.parse(json));
  window.__triggerSized = (size) => window.__triggerEvent({
    kind: 1, created_at: Math.floor(Date.now() / 1000), tags: [], content: 'a'.repeat(size) });
  window.__triggerKey = () => {
    window.__nk = { sig: undefined, err: undefined, done: false };
    window.nostr.getPublicKey()
      .then(key => { window.__nk.sig = key; })
      .catch(e => { window.__nk.err = String((e && e.message) || e); })
      .finally(() => { window.__nk.done = true; });
  };
  window.__triggerDecrypt = () => {
    window.__nk = { done: false };
    window.nostr.nip04.decrypt('b'.repeat(64), 'QUJD+/=='.repeat(37500))
      .catch(() => {}).finally(() => { window.__nk.done = true; });
  };
  window.__answers = [];
  window.__triggerTwo = (json) => JSON.parse(json).forEach((event, i) => {
    window.nostr.signEvent(event)
      .then(sig => { window.__answers[i] = { sig: sig === undefined ? null : sig }; })
      .catch(e => { window.__answers[i] = { err: String(e) }; });
  });
  window.__hostsEver = 0;
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.tagName === 'DIV' && node.style.zIndex === '2147483647') window.__hostsEver++;
    }
  }).observe(document.documentElement, { childList: true });
</script>`;
const FIXTURE = FIXTURE_HTML.replace('</body>', `${FIXTURE_EXTRA}</body>`);

function startSite() {
  const server = http.createServer((req, res) => {
    if (!req.url.startsWith('/') || req.url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    const headers = { 'content-type': 'text/html; charset=utf-8' };
    if (req.url === '/isolated') {
      headers['cross-origin-embedder-policy'] = 'require-corp';
      headers['cross-origin-opener-policy'] = 'same-origin';
    }
    res.writeHead(200, headers);
    res.end(FIXTURE);
  });
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)));
}

// ── Requests ──────────────────────────────────────────────────────────────

const HASH = 'a'.repeat(64);
const token = (verb, { tags = [], ttl = 3600, content = 'Upload blob' } = {}) => ({
  kind: 24242, created_at: now(), content, tags: [['t', verb], ['expiration', String(now() + ttl)], ...tags],
});
const upload = (hash = HASH) => token('upload', { tags: [['x', hash]] });
const kindFive = () => ({ kind: 5, created_at: now(), tags: [['e', HASH]], content: '' });
const erase = () => ({ kind: 62, created_at: now(), tags: [['relay', 'ALL_RELAYS']], content: '' });
const mediaDelete = () => token('delete', { tags: [['x', HASH]], ttl: 600, content: '' });
const note = (content) => ({ kind: 1, created_at: now(), tags: [], content });
const longUpload = () => token('upload', {
  content: 'A note from the app that runs on for a while. '.repeat(12),
  tags: [...Array.from({ length: 8 }, (_, i) => ['x', String(i).repeat(64)]), ['server', 'cdn.example.com'], ['server', 'media.example.org']],
});

// Runs in the page's process with access to closed shadow roots. Sent as a string, so
// `content` and `sendAsyncMessage` are the frame script's own.
function readSurface() {
  const hosts = Array.from(content.document.querySelectorAll('div'))
    .filter((el) => el.openOrClosedShadowRoot);
  const report = { hosts: hosts.length, sheet: false, src: null, pill: null };
  delete content.wrappedJSObject.__nkSheetFrame;
  for (const host of hosts) {
    const root = host.openOrClosedShadowRoot;
    const frame = root.querySelector('iframe');
    if (frame) {
      report.sheet = true;
      report.src = frame.src;
      report.inPlace = frame.getBoundingClientRect().bottom <= content.innerHeight + 1;
      content.wrappedJSObject.__nkSheetFrame = frame;
    }
    const pill = root.querySelector('.nk-fab');
    if (pill) {
      const box = pill.getBoundingClientRect();
      report.pill = {
        label: root.querySelector('.nk-fab-label').textContent,
        countdown: root.querySelector('.nk-fab-cd').textContent,
        x: Math.round(box.left + box.width / 2),
        y: Math.round(box.top + box.height / 2),
      };
    }
  }
  sendAsyncMessage('nk-surface', report);
}
const SURFACE_SCRIPT = `data:application/javascript,${encodeURIComponent(`(${readSurface})()`)}`;

/** A Firefox with the add-on installed and the demo key as its only profile. */
class Browser {
  constructor(site, addon = XPI) {
    this.port = site.address().port;
    this.addon = addon;
    this.sites = 0;
  }

  async start() {
    const options = new firefox.Options();
    options.addArguments('-headless');
    options.setPreference('extensions.webextensions.uuids', JSON.stringify({ [GECKO_ID]: UUID }));
    options.setPreference('xpinstall.signatures.required', false);
    // Everything that is not this machine goes to a port nothing listens on.
    options.setPreference('network.proxy.type', 1);
    for (const scheme of ['http', 'ssl', 'socks']) {
      options.setPreference(`network.proxy.${scheme}`, '127.0.0.1');
      options.setPreference(`network.proxy.${scheme}_port`, 1);
    }
    options.setPreference('network.proxy.no_proxies_on', '.localhost,localhost,127.0.0.1');
    this.driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .setFirefoxService(new firefox.ServiceBuilder(await download()).addArguments('--allow-system-access'))
      .build();
    await this.driver.installAddon(this.addon, /* temporary */ true);
    this.home = await this.driver.getWindowHandle();
    await this.seed();
    return this;
  }

  async stop() {
    await this.driver?.quit().catch(() => {});
    this.driver = null;
  }

  storage(script, ...args) {
    return this.driver.executeAsyncScript(script, ...args);
  }

  /** The first open of a page sets up storage, so seed once that has settled. */
  async seed(profile = { name: 'E2E', type: 'local', pubKey: ALICE.pubKey, privKey: ALICE.privKey, hosts: {} }) {
    const { driver } = this;
    await driver.get(`${EXTENSION_ORIGIN}sidepanel.html`);
    await driver.wait(async () => {
      const read = () => this.storage(function (done) {
        browser.storage.local.get(['version', 'profiles']).then((s) => done(s.profiles?.length ? s.version || 0 : 0));
      });
      const first = await read();
      await sleep(250);
      return first > 0 && first === await read();
    }, 10_000, 'storage never settled');
    await this.storage(function (seedProfile, done) {
      browser.storage.local.set({ profiles: [seedProfile], profileIndex: 0, isEncrypted: false }).then(() => done());
    }, profile);
    await driver.get('about:blank');
  }

  // Page ───────────────────────────────────────────────────────────────────

  /** A new tab on a site of its own, since prompts are limited per site. */
  async open(path = '/', host = `t${++this.sites}.localhost`) {
    const { driver } = this;
    await driver.switchTo().newWindow('tab');
    this.page = await driver.getWindowHandle();
    this.origin = `http://${host}:${this.port}`;
    await driver.get(`${this.origin}${path}`);
    await driver.wait(() => driver.executeScript(() => typeof window.nostr !== 'undefined'), 10_000, 'window.nostr never appeared');
    return this.origin;
  }

  /** Close every tab but the blank one, so the next test starts from nothing. */
  async closeTabs() {
    const { driver } = this;
    for (const handle of await driver.getAllWindowHandles()) {
      if (handle === this.home) continue;
      await driver.switchTo().window(handle);
      await driver.close();
    }
    await driver.switchTo().window(this.home);
  }

  sign(event = note('e2e')) {
    return this.driver.executeScript((json) => { window.__triggerJson(json); }, JSON.stringify(event));
  }

  /** WebDriver turns undefined into null, so the page reports what it really got. */
  answer() {
    return this.driver.executeScript(() => ({ ...window.__nk, sigType: typeof window.__nk.sig }));
  }

  hostsEver() { return this.driver.executeScript(() => window.__hostsEver); }

  async answered(timeout = 8000) {
    await this.driver.wait(() => this.driver.executeScript(() => window.__nk.done), timeout, 'the page never got an answer');
    return this.answer();
  }

  async expectPending() {
    const res = await this.answer();
    assert.equal(res.done, false, 'the request should still be pending');
    assert.ok(!res.sig, 'no signature yet');
    assert.ok(!res.err, 'no error yet');
  }

  async expectSigned(res, event) {
    assert.ok(!res.err, `signing failed: ${res.err}`);
    await expectValidSignature(res.sig, event);
  }

  expectDeclined(res) {
    assert.equal(res.done, true);
    assert.equal(res.sigType, 'undefined', 'a decline resolves to undefined');
    assert.ok(!res.err, `a decline is not an error: ${res.err}`);
  }

  // Closed shadow root ──────────────────────────────────────────────────────

  /** What is drawn in the open page: `{ hosts, sheet, src, pill }`. */
  async surface() {
    const { driver } = this;
    await driver.setContext(firefox.Context.CHROME);
    try {
      return await driver.executeAsyncScript(function (script, done) {
        const { messageManager } = gBrowser.selectedBrowser;
        messageManager.addMessageListener('nk-surface', function heard(message) {
          messageManager.removeMessageListener('nk-surface', heard);
          done(message.data);
        });
        messageManager.loadFrameScript(script, false);
      }, SURFACE_SCRIPT);
    } finally {
      await driver.setContext(firefox.Context.CONTENT);
    }
  }

  async waitForSurface(test, what, timeout = 8000) {
    const deadline = Date.now() + timeout;
    for (;;) {
      const seen = await this.surface();
      if (test(seen)) return seen;
      if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}: ${JSON.stringify(seen)}`);
      await sleep(100);
    }
  }

  waitForSheet(timeout) { return this.waitForSurface((s) => s.sheet, 'the sheet', timeout); }
  waitForNoSheet(timeout) { return this.waitForSurface((s) => !s.sheet, 'the sheet to close', timeout); }
  waitForPill() { return this.waitForSurface((s) => s.pill, 'the minimized button'); }

  /** The buttons are in the page's markup, so wait for the request itself to be drawn. */
  drawn() {
    return this.driver.wait(
      () => this.driver.executeScript(() => !!document.getElementById('perm-type')?.textContent),
      5000, 'the prompt never drew');
  }

  /** Run `fn` inside the sheet once it has slid in, or at once with `early`. */
  async inSheet(fn, { early = false } = {}) {
    const { driver } = this;
    await this.waitForSurface((s) => s.sheet && (early || s.inPlace), 'the sheet in place');
    const frame = await driver.executeScript(() => window.__nkSheetFrame);
    await driver.switchTo().frame(frame);
    try {
      await this.drawn();
      return await fn();
    } finally {
      await driver.switchTo().defaultContent();
    }
  }

  clickAt(x, y) {
    return this.driver.actions().move({ x, y, origin: Origin.VIEWPORT }).click().perform();
  }

  async clickBackdrop() {
    const width = await this.driver.executeScript(() => window.innerWidth);
    await this.clickAt(Math.floor(width / 2), 24);
  }

  // Prompt surfaces ─────────────────────────────────────────────────────────

  text(id) { return this.driver.findElement(By.id(id)).getText(); }
  shown(id) { return this.driver.findElement(By.id(id)).isDisplayed(); }

  /** Wait for Approve to arm, then press it. Works in the sheet or in a tab. */
  async approve() {
    const { driver } = this;
    const allow = await driver.findElement(By.id('allow-btn'));
    await driver.wait(() => allow.isEnabled(), 3000, 'Approve never armed');
    await sleep(QUIET_MS + 100);
    await allow.click();
  }

  deny() { return this.driver.findElement(By.id('deny-btn')).click(); }

  /** Find the prompt's own tab and switch to it. */
  async promptTab(timeout = 9000, { draws = true } = {}) {
    const { driver } = this;
    const known = new Set([this.home, this.page]);
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      for (const handle of await driver.getAllWindowHandles()) {
        if (known.has(handle)) continue;
        await driver.switchTo().window(handle);
        await driver.wait(async () => (await driver.getCurrentUrl()) !== 'about:blank', 3000).catch(() => {});
        assert.ok((await driver.getCurrentUrl()).startsWith(`${EXTENSION_ORIGIN}${PROMPT_PATH}`), 'unexpected new tab');
        if (draws) await this.drawn();
        this.tab = handle;
        return handle;
      }
      await sleep(100);
    }
    throw new Error('no prompt tab opened');
  }

  async backToPage() {
    await this.driver.switchTo().window(this.page);
  }

  async tabCloses() {
    await this.driver.wait(async () => !(await this.driver.getAllWindowHandles()).includes(this.tab), 3000, 'the prompt tab stayed open');
    await this.backToPage();
  }

  async expectNoTab() {
    const handles = await this.driver.getAllWindowHandles();
    assert.deepEqual(handles.sort(), [this.home, this.page].sort(), 'no prompt tab should have opened');
  }

  /** Stop the suspendable background, as Firefox does to an idle one. */
  async stopBackground() {
    const { driver } = this;
    await driver.setContext(firefox.Context.CHROME);
    try {
      await driver.executeAsyncScript(function (id, done) {
        WebExtensionPolicy.getByID(id).extension.terminateBackground({ disableResetIdleForTest: true }).then(() => done());
      }, GECKO_ID);
    } finally {
      await driver.setContext(firefox.Context.CONTENT);
    }
  }
}

async function expectValidSignature(event, asked) {
  assert.ok(event, 'expected a signed event');
  assert.equal(event.pubkey, ALICE.pubKey, 'signed by the seeded key');
  assert.equal(await calculateEventId(event), event.id, 'the id is the hash of the event');
  assert.equal(await verifySignature(event), true, 'the signature verifies');
  const flipped = (event.sig[0] === '0' ? '1' : '0') + event.sig.slice(1);
  assert.equal(await verifySignature({ ...event, sig: flipped }), false, 'a changed signature must not verify');
  if (asked) {
    for (const field of ['kind', 'created_at', 'content']) assert.equal(event[field], asked[field], field);
    assert.deepEqual(event.tags, asked.tags);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────

const tests = [];
const test = (name, fn, options = {}) => tests.push({ name, fn, ...options });
/** Waits out a prompt window, so it gets a browser of its own. */
const longTest = (name, fn, options = {}) => test(name, fn, { ...options, alone: true });

// The sheet ───────────────────────────────────────────────────────────────

test('nothing is drawn until a site asks', async (b) => {
  await b.open();
  assert.deepEqual(await b.surface(), { hosts: 0, sheet: false, src: null, pill: null });
});

test('a signing request opens the sheet in the page, from the extension', async (b) => {
  const origin = await b.open();
  await b.sign();
  const { hosts, src } = await b.waitForSheet();
  assert.equal(hosts, 1);
  assert.ok(src.startsWith(`${EXTENSION_ORIGIN}${PROMPT_PATH}?`), src);
  await b.expectPending();
  await b.inSheet(async () => {
    assert.ok((await b.driver.executeScript(() => document.documentElement.className)).includes('perm-in-sheet'));
    assert.equal(await b.text('perm-host'), origin);
    assert.equal(await b.text('perm-type'), 'Sign an event');
    assert.equal(await b.text('kind-label'), 'Publish a public note');
    assert.equal(await b.text('perm-identity'), 'E2E');
    assert.equal(await b.text('content-preview'), 'e2e');
    assert.match(await b.text('perm-countdown'), /^\d+s$/);
    assert.equal(await b.shown('minimize-btn'), true);
    await b.deny();
  });
  await b.answered();
});

test('Approve signs with a valid signature, and the sheet goes', async (b) => {
  await b.open();
  const event = note('approve me');
  await b.sign(event);
  await b.inSheet(() => b.approve());
  await b.expectSigned(await b.answered(), event);
  const after = await b.waitForNoSheet();
  assert.equal(after.hosts, 0);
});

test('Deny resolves to undefined, and the next request opens its own sheet', async (b) => {
  await b.open();
  await b.sign();
  const first = await b.waitForSheet();
  await b.inSheet(() => b.deny());
  b.expectDeclined(await b.answered());
  await b.waitForNoSheet();

  await b.sign();
  const next = await b.waitForSheet();
  assert.notEqual(next.src, first.src);
  await b.inSheet(() => b.deny());
  b.expectDeclined(await b.answered());
});

test('getPublicKey asks too, and returns the seeded key', async (b) => {
  await b.open();
  await b.driver.executeScript(() => window.__triggerKey());
  await b.inSheet(() => b.approve());
  assert.equal((await b.answered()).sig, ALICE.pubKey);
});

test('a 300 KB decrypt draws and is answered', async (b) => {
  await b.open();
  await b.driver.executeScript(() => window.__triggerDecrypt());
  await b.inSheet(() => b.deny());
  await b.answered();
});

test('a page-drawn lookalike cannot sign', async (b) => {
  await b.open();
  await b.sign();
  await b.waitForSheet();
  await b.driver.executeScript(() => {
    const button = document.createElement('button');
    button.textContent = 'Approve';
    document.body.appendChild(button);
    button.click();
  });
  await sleep(500);
  await b.expectPending();
  await b.inSheet(() => b.deny());
  await b.answered();
});

// Minimize ────────────────────────────────────────────────────────────────

test('Minimize collapses to the pill, still pending, and the pill restores it', async (b) => {
  await b.open();
  const event = note('round trip');
  await b.sign(event);
  await b.inSheet(() => b.driver.findElement(By.id('minimize-btn')).click());

  const { pill, hosts, sheet } = await b.waitForPill();
  assert.equal(sheet, false);
  assert.equal(hosts, 1);
  assert.equal(pill.label, 'Review signing request');
  assert.match(pill.countdown, /^· \d+s$/);
  await b.expectPending();

  await b.clickAt(pill.x, pill.y);
  const restored = await b.waitForSheet();
  assert.equal(restored.pill, null);
  await b.inSheet(() => b.approve());
  await b.expectSigned(await b.answered(), event);
});

test('a backdrop click minimizes: never approves, never denies', async (b) => {
  await b.open();
  await b.sign();
  await b.waitForSheet();
  await sleep(400); // the slide-in
  await b.clickBackdrop();
  const { pill, hosts } = await b.waitForPill();
  assert.equal(hosts, 1);
  assert.equal(pill.label, 'Review signing request');
  await b.expectPending();

  await b.clickAt(pill.x, pill.y);
  await b.inSheet(() => b.deny());
  await b.answered();
});

test('answering removes a pill that was restored and minimized again', async (b) => {
  await b.open();
  await b.sign();
  await b.inSheet(() => b.driver.findElement(By.id('minimize-btn')).click());
  const { pill } = await b.waitForPill();
  await b.clickAt(pill.x, pill.y);
  await b.inSheet(() => b.deny());
  await b.answered();
  const after = await b.waitForSurface((s) => s.hosts === 0, 'everything to leave');
  assert.equal(after.pill, null);
});

// The 40 second window ────────────────────────────────────────────────────

/** Read when this prompt's window ends, as the worker stamped it. */
const deadlineOf = (src) => Number(new URL(src).searchParams.get('deadline'));

async function untilAnswered(b, deadline) {
  const limit = deadline + HIDDEN_TIMER_SLACK_MS + 1000;
  for (;;) {
    const res = await b.answer();
    if (res.done) return { res, at: Date.now() };
    if (Date.now() > limit) throw new Error('no answer after the window ended');
    await sleep(100);
  }
}

function expectEndedOnTime(deadline, at, asked) {
  assert.ok(Math.abs(deadline - asked - PROMPT_MS) < 1500, `window was ${deadline - asked} ms`);
  assert.ok(at >= deadline - 300, `ended ${deadline - at} ms early`);
  assert.ok(at <= deadline + HIDDEN_TIMER_SLACK_MS, `ended ${at - deadline} ms late`);
}

longTest('no answer on an open sheet declines at 40 s, and the sheet goes', async (b) => {
  await b.open();
  const asked = Date.now();
  await b.sign();
  const { src } = await b.waitForSheet();
  const deadline = deadlineOf(src);

  await sleep(deadline - Date.now() - 2000);
  await b.expectPending();
  assert.equal((await b.surface()).sheet, true);

  const { res, at } = await untilAnswered(b, deadline);
  expectEndedOnTime(deadline, at, asked);
  b.expectDeclined(res);
  const after = await b.waitForNoSheet(2000);
  assert.equal(after.hosts, 0, 'nothing stays behind an open sheet');
});

/** Ask, minimize, and sit out the window. Returns what the pill reads at the end. */
async function expirePill(b) {
  await b.open();
  await b.sign();
  const { src } = await b.waitForSheet();
  const deadline = deadlineOf(src);
  await b.inSheet(() => b.driver.findElement(By.id('minimize-btn')).click());
  await b.waitForPill();
  await sleep(deadline - Date.now() - 2000);
  await b.expectPending();
  const { pill } = await b.surface();
  assert.equal(pill.label, 'Review signing request');
  assert.match(pill.countdown, /^· [1-3]s$/);
  const { res, at } = await untilAnswered(b, deadline);
  assert.ok(at >= deadline - 300, `ended ${deadline - at} ms early`);
  assert.ok(at <= deadline + HIDDEN_TIMER_SLACK_MS, `ended ${at - deadline} ms late`);
  b.expectDeclined(res);
  return deadline;
}

const expired = (s) => s.pill?.label === 'Signing request expired';

longTest('an expired pill says so for 20 s, then leaves', async (b) => {
  const deadline = await expirePill(b);
  const shown = await b.waitForSurface(expired, 'the expired text', 2000);
  assert.equal(shown.pill.countdown, '');
  assert.equal(shown.sheet, false);

  await sleep(deadline + EXPIRED_PILL_MS - 1500 - Date.now());
  const late = await b.surface();
  assert.ok(expired(late), `gone too soon: ${JSON.stringify(late)}`);

  const gone = await b.waitForSurface((s) => s.hosts === 0, 'the pill to leave', 4000);
  assert.ok(Date.now() >= deadline + EXPIRED_PILL_MS - 500);
  assert.equal(gone.pill, null);
});

longTest('a tap on an expired pill dismisses it and opens nothing', async (b) => {
  await expirePill(b);
  const { pill } = await b.waitForSurface(expired, 'the expired text', 2000);
  await b.clickAt(pill.x, pill.y);
  const after = await b.waitForSurface((s) => s.hosts === 0, 'the pill to leave', 1500);
  assert.equal(after.sheet, false);
  await b.expectNoTab();
});

longTest('the next request replaces an expired pill, and its sheet stays', async (b) => {
  await expirePill(b);
  const { pill } = await b.waitForSurface(expired, 'the expired text', 2000);
  assert.ok(pill);
  await b.sign();
  const replaced = await b.waitForSheet();
  assert.equal(replaced.pill, null);
  assert.equal(replaced.hosts, 1);
  await sleep(EXPIRED_PILL_MS + 1000); // the old pill's timer must not take the sheet with it
  assert.equal((await b.surface()).sheet, true);
  await b.inSheet(() => b.deny());
  b.expectDeclined(await b.answered());
});

longTest('an answer given late in the window still reaches the page', async (b) => {
  await b.open();
  const event = note('late');
  await b.sign(event);
  await b.waitForSheet();
  await sleep(33_000); // past the 30 s after which Firefox suspends an idle background
  await b.expectPending();
  await b.inSheet(() => b.approve());
  await b.expectSigned(await b.answered(4000), event);
});

// Remember ────────────────────────────────────────────────────────────────

test('remembering an upload answers the next one on that site, and no other', async (b) => {
  const origin = await b.open();
  await b.sign(upload());
  await b.inSheet(async () => {
    assert.equal(await b.text('perm-type'), 'Upload a file to a media server');
    assert.equal(await b.text('remember-patch-label'), 'Remember uploads for this site');
    assert.equal(await b.text('perm-servers'), 'any server');
    const remember = await b.driver.findElement(By.id('remember-patch'));
    assert.equal(await remember.getAttribute('aria-pressed'), 'false');
    await remember.click();
    assert.equal(await remember.getAttribute('aria-pressed'), 'true');
    await b.approve();
  });
  await b.answered();
  await b.waitForNoSheet();
  const hosts = await b.hostsEver();
  assert.equal(hosts, 1);

  const next = upload('b'.repeat(64));
  await b.sign(next);
  await b.expectSigned(await b.answered(4000), next);
  assert.equal(await b.hostsEver(), hosts, 'the remembered upload drew a prompt');
  await b.expectNoTab();

  // Another action on the same site still asks.
  await b.sign(token('list'));
  await b.waitForSheet();
  await b.inSheet(() => b.deny());
  await b.answered();

  // So does the same action on another site.
  await b.open();
  assert.notEqual(b.origin, origin);
  await b.sign(upload('c'.repeat(64)));
  await b.waitForSheet();
  await b.inSheet(() => b.deny());
  await b.answered();
});

test('without Remember, the next upload asks again', async (b) => {
  await b.open();
  await b.sign(upload());
  await b.inSheet(() => b.approve());
  await b.answered();
  await b.waitForNoSheet();
  await b.sign(upload('b'.repeat(64)));
  await b.waitForSheet();
  await b.inSheet(() => b.deny());
  await b.answered();
});

// Requests that always get a tab ──────────────────────────────────────────

for (const [name, build, action] of [
  ['a media server delete', mediaDelete, 'Delete a file from a media server'],
  ['a delete', kindFive, null],
  ['a request to erase', erase, null],
]) {
  test(`${name} opens its own tab, offers no Remember, and returns to the page`, async (b) => {
    await b.open();
    await b.sign(build());
    await b.promptTab();
    if (action) assert.equal(await b.text('perm-type'), action);
    assert.equal(await b.shown('remember-patch'), false);
    assert.equal(await b.shown('minimize-btn'), false);
    assert.ok(await b.driver.findElement(By.css('#perm-danger .warn-strip--red')).isDisplayed());
    await b.deny();
    await b.tabCloses();
    const surface = await b.surface();
    assert.equal(surface.hosts, 0);
    assert.equal(await b.hostsEver(), 0, 'it must never draw on the page');
    b.expectDeclined(await b.answered());
  });
}

test('after a tab is answered the page it came from is in front', async (b) => {
  await b.open();
  await b.sign(kindFive());
  const { driver } = b;
  await b.promptTab();
  await b.deny();
  await driver.wait(async () => !(await driver.getAllWindowHandles()).includes(b.tab), 3000, 'the prompt tab stayed open');
  await driver.setContext(firefox.Context.CHROME);
  try {
    const front = await driver.executeScript(() => gBrowser.selectedBrowser.currentURI.spec);
    assert.ok(front.startsWith(b.origin), `in front: ${front}`);
  } finally {
    await driver.setContext(firefox.Context.CONTENT);
  }
  await b.backToPage();
});

test('a delete approved in its tab signs, and the next one asks again', async (b) => {
  await b.open();
  const event = mediaDelete();
  await b.sign(event);
  await b.promptTab();
  await b.approve();
  await b.tabCloses();
  await b.expectSigned(await b.answered(), event);

  await b.sign(mediaDelete());
  await b.promptTab();
  await b.deny();
  await b.tabCloses();
  b.expectDeclined(await b.answered());
});

test('a stored allow for a delete is not acted on: it still asks', async (b) => {
  const origin = await b.open();
  const { driver } = b;
  await driver.switchTo().newWindow('tab');
  await driver.get(`${EXTENSION_ORIGIN}sidepanel.html`);
  await b.storage(function (site, done) {
    browser.storage.local.get('profiles').then(({ profiles }) => {
      profiles[0].hosts = { [site]: { 'signEvent:24242:delete': 'allow' } };
      return browser.storage.local.set({ profiles });
    }).then(() => done());
  }, origin);
  await driver.close();
  await b.backToPage();

  await b.sign(mediaDelete());
  await b.promptTab();
  assert.equal(await b.shown('remember-patch'), false);
  await b.deny();
  await b.tabCloses();
  b.expectDeclined(await b.answered());
});

// One at a time ───────────────────────────────────────────────────────────

test('choosing all approvals in a tab sends an ordinary request to one, and it can be undone', async (b) => {
  const { driver } = b;
  const choose = async (value) => {
    await driver.switchTo().window(b.home);
    await driver.get(`${EXTENSION_ORIGIN}sidepanel.html`);
    await driver.executeAsyncScript(function (on, done) {
      browser.runtime.sendMessage({ kind: 'setApprovalsInTab', payload: on }).then(done);
    }, value);
  };
  try {
    await choose(true);
    await b.open();
    await b.sign();
    await b.promptTab();
    await b.deny();
    await b.tabCloses();
    assert.equal(await b.hostsEver(), 0, 'it must never draw on the page');
    b.expectDeclined(await b.answered());
  } finally {
    await choose(false);
  }
  await b.open();
  await b.sign();
  await b.waitForSheet();
  await b.inSheet(() => b.deny());
  b.expectDeclined(await b.answered());
});

test('a second request waits its turn: each sheet shows its place, each gets its answer', async (b) => {
  await b.open();
  const second = note('second');
  await b.driver.executeScript((json) => window.__triggerTwo(json), JSON.stringify([note('first'), second]));
  const first = await b.waitForSheet();
  await b.inSheet(async () => {
    assert.equal(await b.text('content-preview'), 'first');
    assert.equal(await b.text('perm-queue'), '1/2');
    await b.deny();
  });
  const next = await b.waitForSurface((s) => s.sheet && s.src !== first.src, 'the second sheet');
  assert.equal(next.hosts, 1);
  await b.inSheet(async () => {
    assert.equal(await b.text('content-preview'), 'second');
    assert.equal(await b.text('perm-queue'), '2/2');
    await b.approve();
  });
  await b.driver.wait(() => b.driver.executeScript(() => window.__answers.filter(Boolean).length === 2), 8000, 'both answers');
  const [one, two] = await b.driver.executeScript(() => window.__answers);
  assert.deepEqual(one, { sig: null }, 'the first was declined');
  await expectValidSignature(two.sig, second);
  await b.waitForSurface((s) => s.hosts === 0, 'everything to leave');
});

// The request moves to a tab ──────────────────────────────────────────────

test('moving the sheet under a page element destroys it and moves the request to a tab', async (b) => {
  await b.open();
  const event = note('moved');
  await b.sign(event);
  const { hosts } = await b.waitForSheet();
  assert.equal(hosts, 1);
  assert.equal(await b.driver.executeScript(() => window.__redress()), 'reparented');
  await b.promptTab();
  await b.backToPage();
  const after = await b.surface();
  assert.equal(after.sheet, false, 'no sheet left on the page');
  await b.expectPending();

  await b.driver.switchTo().window(b.tab);
  await b.approve();
  await b.tabCloses();
  await b.expectSigned(await b.answered(), event);
});

for (const [name, style] of [
  ['a filter', 'opacity(0.02)'],
  ['a transform', null],
]) {
  test(`${name} on the page root moves the request to a tab`, async (b) => {
    await b.open();
    await b.sign();
    await b.waitForSheet();
    await b.driver.executeScript((filter) => {
      if (filter) document.documentElement.style.filter = filter;
      else document.documentElement.style.transform = 'translateX(1px)';
    }, style);
    await b.promptTab();
    await b.deny();
    await b.tabCloses();
    assert.equal((await b.surface()).sheet, false);
    b.expectDeclined(await b.answered());
  });
}

test('a stylesheet that hides the root, with no mutation to notice, moves the request to a tab', async (b) => {
  await b.open();
  await b.sign();
  await b.waitForSheet();
  await b.driver.executeScript(() => {
    const css = new CSSStyleSheet();
    css.replaceSync('html { opacity: 0.2 }');
    document.adoptedStyleSheets = [css];
  });
  await b.promptTab();
  await b.deny();
  await b.tabCloses();
  b.expectDeclined(await b.answered());
});

test('a prompt moved to a tab gets a fresh 40 s window', async (b) => {
  await b.open();
  await b.sign();
  const { src } = await b.waitForSheet();
  await sleep(1200);
  await b.driver.executeScript(() => window.__redress());
  await b.promptTab();
  const moved = deadlineOf(await b.driver.getCurrentUrl());
  assert.ok(moved > deadlineOf(src), 'the tab should run on a new deadline');
  await b.deny();
  await b.tabCloses();
  await b.answered();
});

test('a cross-origin isolated page still draws the sheet, which answers', async (b) => {
  await b.open('/isolated');
  assert.equal(await b.driver.executeScript(() => window.crossOriginIsolated), true);
  const event = note('isolated');
  await b.sign(event);
  await b.inSheet(() => b.approve());
  await b.expectSigned(await b.answered(), event);
  await b.expectNoTab();
});

test('a page too busy to draw the sheet gets a tab, and the answer reaches it', async (b) => {
  await b.open();
  const event = note('busy');
  await b.driver.executeScript((json) => {
    window.__triggerJson(json);
    window.setTimeout(window.eval('() => { const end = Date.now() + 7000; while (Date.now() < end); }'), 0);
  }, JSON.stringify(event));
  await b.promptTab();
  await b.approve();
  await b.tabCloses();
  await b.expectSigned(await b.answered(12_000), event);
  assert.equal((await b.surface()).sheet, false);
});

longTest('a sheet whose script never runs moves to a tab, and the next request gets its turn', async (b) => {
  await b.open();
  await b.sign();
  const first = await b.waitForSheet();
  const started = Date.now();
  await b.driver.executeScript(() => { window.__triggerEvent({ kind: 7, created_at: 1800000000, tags: [], content: '+' }); });
  await b.promptTab(20_000, { draws: false });
  await b.backToPage();
  await b.waitForSurface((s) => s.sheet && s.src !== first.src, 'the next request to open', 30_000);
  assert.ok(Date.now() - started < 38_000, 'it must not sit out the 40 s window');
}, { brokenPrompt: true });

// Worker lifecycle ────────────────────────────────────────────────────────

test('a sheet left open across a background restart cannot sign, and closes', async (b) => {
  await b.open();
  await b.sign();
  await b.waitForSheet();
  await sleep(QUIET_MS + 150);
  await b.stopBackground();
  assert.ok(!(await b.answered()).sig);

  await b.inSheet(async () => {
    const allow = await b.driver.findElement(By.id('allow-btn'));
    await allow.click();
  });
  await b.waitForNoSheet(3000);
  assert.ok(!(await b.answer()).sig);
});

// Approve's hold ──────────────────────────────────────────────────────────

test('Approve starts disabled and arms by itself', async (b) => {
  await b.open();
  await b.sign();
  await b.inSheet(async () => {
    const allow = await b.driver.findElement(By.id('allow-btn'));
    assert.equal(await allow.isEnabled(), false);
    await b.driver.wait(() => allow.isEnabled(), 3000, 'Approve never armed');
  }, { early: true });
  await b.inSheet(() => b.deny());
  await b.answered();
});

test('sustained clicks at Approve never land, then it arms after quiet', async (b) => {
  await b.open();
  const event = upload();
  await b.sign(event);
  const { driver } = b;
  await b.inSheet(async () => {
    const allow = await driver.findElement(By.id('allow-btn'));
    await driver.wait(() => allow.isEnabled(), 3000);
    await driver.findElement(By.id('perm-host')).click(); // starts the hold
    const held = [];
    for (let i = 0; i < 8; i++) {
      await driver.actions().move({ origin: allow }).click().perform();
      held.push(await allow.getAttribute('aria-disabled'));
    }
    assert.deepEqual(held, Array(8).fill('true'));
  });
  await sleep(150);
  await b.expectPending();
  await b.inSheet(async () => {
    await sleep(QUIET_MS + 150);
    const allow = await driver.findElement(By.id('allow-btn'));
    assert.equal(await allow.getAttribute('aria-disabled'), null);
    await allow.click();
  });
  await b.expectSigned(await b.answered(), event);
});

test('a press begun while held does not approve when it ends', async (b) => {
  await b.open();
  await b.sign(upload());
  await b.inSheet(async () => {
    const { driver } = b;
    const allow = await driver.findElement(By.id('allow-btn'));
    await driver.wait(() => allow.isEnabled(), 3000);
    await driver.findElement(By.id('perm-host')).click();
    await driver.actions().move({ origin: allow }).press().perform();
    await sleep(QUIET_MS + 300);
    await driver.actions().release().perform();
    await sleep(300);
  });
  await b.expectPending();
  await b.inSheet(() => b.deny());
  await b.answered();
});

test('a click elsewhere in the sheet restarts the hold', async (b) => {
  await b.open();
  await b.sign(upload());
  await b.inSheet(async () => {
    const { driver } = b;
    const allow = await driver.findElement(By.id('allow-btn'));
    await driver.wait(() => allow.isEnabled(), 3000);
    await sleep(QUIET_MS);
    assert.equal(await allow.getAttribute('aria-disabled'), null);
    await driver.findElement(By.id('perm-host')).click();
    assert.equal(await allow.getAttribute('aria-disabled'), 'true');
    await driver.wait(async () => (await allow.getAttribute('aria-disabled')) === null, QUIET_MS + 400);
    await b.deny();
  });
  await b.answered();
});

test('Deny answers at once during the hold', async (b) => {
  await b.open();
  await b.sign(upload());
  await b.inSheet(() => b.deny());
  b.expectDeclined(await b.answered());
});

for (const [name, key] of [['Enter', Key.ENTER], ['Space', Key.SPACE]]) {
  test(`the keyboard reaches Approve and ${name} signs`, async (b) => {
    await b.open();
    const event = upload();
    await b.sign(event);
    await b.inSheet(async () => {
      const { driver } = b;
      const allow = await driver.findElement(By.id('allow-btn'));
      await driver.wait(() => allow.isEnabled(), 3000);
      await driver.executeScript(() => document.getElementById('deny-btn').focus());
      await driver.actions().sendKeys(Key.TAB).perform();
      assert.equal(await driver.executeScript(() => document.activeElement.id), 'allow-btn');
      await sleep(QUIET_MS + 150);
      await driver.actions().sendKeys(key).perform();
    });
    await b.expectSigned(await b.answered(), event);
  });
}

test('a key mashed on Approve never lands, and a held key does not either', async (b) => {
  await b.open();
  await b.sign(upload());
  await b.inSheet(async () => {
    const { driver } = b;
    await driver.wait(() => driver.findElement(By.id('allow-btn')).isEnabled(), 3000);
    await driver.executeScript(() => document.getElementById('allow-btn').focus());
    await driver.actions().sendKeys(Key.SHIFT).perform();
    for (let i = 0; i < 6; i++) await driver.actions().sendKeys(Key.ENTER).perform();
    await driver.actions().keyDown(Key.SPACE).perform();
    await sleep(QUIET_MS + 200);
    await driver.actions().keyUp(Key.SPACE).perform();
    await sleep(200);
  });
  await b.expectPending();
  await b.inSheet(() => b.deny());
  await b.answered();
});

// What it says ────────────────────────────────────────────────────────────

test('direction controls show as marks, and blank runs do not push text out of view', async (b) => {
  await b.open();
  await b.sign(note(`shown first‮${'\n'.repeat(300)}shown last`));
  await b.inSheet(async () => {
    assert.match(await b.text('content-preview'), /shown first\[U\+202E\]\s+shown last/);
    assert.equal(await b.driver.executeScript(() => {
      const el = document.getElementById('content-preview');
      return el.scrollHeight <= el.clientHeight;
    }), true);
    await b.deny();
  });
  await b.answered();
});

test('rows that do not apply are not drawn', async (b) => {
  await b.open();
  await b.sign(token('upload', { tags: [['x', HASH]], ttl: 2 * 86400 }));
  await b.inSheet(async () => {
    for (const id of ['bunker-notice', 'files-row', 'servers-row', 'valid-row']) {
      assert.equal(await b.shown(id), false, id);
    }
    assert.equal(await b.text('perm-type'), 'Authorize a media server request');
    await b.deny();
  });
  await b.answered();
});

test('a remote signer profile says its signer may still ask', async (b) => {
  const { driver } = b;
  await b.seed({ name: 'Remote E2E', type: 'bunker', pubKey: '', privKey: '', remotePubkey: ALICE.pubKey, bunkerUrl: null, relays: [], hosts: {} });
  try {
    await b.open();
    await b.sign(upload());
    await b.inSheet(async () => {
      assert.equal(await b.text('remember-note'), "NostrKey won't ask. Your remote signer may.");
      assert.equal(await b.text('perm-identity'), 'Remote E2E');
      assert.equal(await b.shown('bunker-notice'), true);
      await b.deny();
    });
    await b.answered();
  } finally {
    await driver.switchTo().window(b.home);
    await b.seed();
  }
});

test('a prompt whose request is gone says so, with no Approve', async (b) => {
  const { driver } = b;
  await driver.switchTo().newWindow('tab');
  const query = new URLSearchParams({ uuid: 'not-live', kind: 'signEvent', host: 'https://example.com', rememberable: '1', grantKey: 'signEvent:1' });
  await driver.get(`${EXTENSION_ORIGIN}${PROMPT_PATH}?${query}`);
  await driver.wait(async () => (await driver.findElements(By.id('allow-btn'))).length === 0, 3000, 'Approve is still there');
  assert.match(await driver.findElement(By.css('.warn-strip--red')).getText(), /no longer open/);
  assert.equal(await b.text('deny-btn'), 'Close');
});

// Sizes ───────────────────────────────────────────────────────────────────

test('a request too large to show is answered with an error, and the next one opens', async (b) => {
  await b.open();
  await b.driver.executeScript(() => window.__triggerSized(5_000_000));
  const res = await b.answered();
  assert.ok(!res.sig);
  assert.match(res.err, /too large/i);
  assert.equal((await b.surface()).sheet, false);
  await b.sign();
  await b.inSheet(() => b.deny());
  await b.answered();
});

test('the largest request that fits still draws, and Deny answers it', async (b) => {
  await b.open();
  await b.driver.executeScript(() => window.__triggerSized(2_090_000));
  await b.inSheet(async () => {
    assert.equal(await b.text('perm-type'), 'Sign an event');
    await b.deny();
  });
  b.expectDeclined(await b.answered());
});

for (const [name, build] of [
  ['long CJK article', () => ({ kind: 30023, created_at: now(), tags: [['d', 'a']], content: '語'.repeat(30_000) })],
  ['list of 3,000 follows', () => ({ kind: 3, created_at: now(), content: '', tags: Array.from({ length: 3000 }, (_, i) => ['p', i.toString(16).padStart(64, '0')]) })],
]) {
  test(`a ${name} draws in the sheet and is signed`, async (b) => {
    await b.open();
    const event = build();
    await b.sign(event);
    await b.inSheet(() => b.approve());
    await b.expectSigned(await b.answered(), event);
  });

  test(`a ${name} draws in a tab and is signed`, async (b) => {
    await b.open();
    const event = build();
    await b.sign(event);
    await b.waitForSheet();
    await b.driver.executeScript(() => window.__redress());
    await b.promptTab();
    await b.approve();
    await b.tabCloses();
    await b.expectSigned(await b.answered(), event);
  });
}

// Layout ──────────────────────────────────────────────────────────────────

const inView = () => {
  const rect = (id) => document.getElementById(id).getBoundingClientRect();
  const inner = { w: window.innerWidth, h: window.innerHeight };
  const sticks = ['deny-btn', 'allow-btn', 'remember-patch'].map((id) => {
    const r = rect(id);
    return { id, ok: r.top >= 0 && r.left >= 0 && r.bottom <= inner.h && r.right <= inner.w };
  });
  return {
    inner,
    off: sticks.filter((s) => !s.ok).map((s) => s.id),
    scrolled: document.scrollingElement.scrollTop,
    overflows: document.documentElement.scrollHeight > inner.h,
  };
};

for (const [name, width, height] of [
  ['desktop 1280x600', 1280, 600],
  ['phone 500x700', 500, 700],
  ['short 1280x400', 1280, 400],
]) {
  test(`at ${name}, Deny, Approve and Remember are in view without scrolling, raw JSON open too`, async (b) => {
    const { driver } = b;
    const before = await driver.manage().window().getRect();
    try {
      await driver.manage().window().setRect({ x: 0, y: 0, width, height });
      await b.open();
      await b.sign(longUpload());
      await b.inSheet(async () => {
        for (const step of ['closed', 'raw open']) {
          const seen = await driver.executeScript(inView);
          assert.deepEqual(seen.off, [], `${step}: ${JSON.stringify(seen)}`);
          assert.equal(seen.scrolled, 0, step);
          assert.equal(seen.overflows, false, step);
          if (step === 'closed') {
            await driver.findElement(By.id('raw-json-toggle')).click();
            assert.equal(await b.shown('event-preview-pre'), true);
          }
        }
        await b.deny();
      });
      await b.answered();
    } finally {
      await driver.manage().window().setRect(before);
    }
  });
}

// ── Runner ────────────────────────────────────────────────────────────────

function checkBuild() {
  const fix = 'Run: npm run build:firefox:prod';
  if (!existsSync(XPI)) throw new Error(`No Firefox build at ${relative(ROOT, XPI)}. ${fix}`);
  const { time, file } = newestSource(resolve(ROOT, 'src'));
  if (time > statSync(XPI).mtimeMs) throw new Error(`The Firefox build is older than ${relative(ROOT, file)}. ${fix}`);
}

/** The built add-on with the prompt's script emptied, for a frame that never reports in. */
function brokenPromptAddon() {
  const dir = mkdtempSync(join(tmpdir(), 'nk-ff-dead-frame-'));
  cpSync(resolve(ROOT, 'distros/firefox'), dir, { recursive: true });
  writeFileSync(join(dir, 'permission/permission.build.js'), '');
  return dir;
}

async function runOne(browser, { name, fn }) {
  const started = Date.now();
  let timer;
  try {
    await Promise.race([
      fn(browser),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`no result after ${TEST_LIMIT_MS} ms`)), TEST_LIMIT_MS); }),
    ]);
    console.log(`  ✓ ${name} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${name} (${((Date.now() - started) / 1000).toFixed(1)}s)\n      ${String(e.message).split('\n').slice(0, 6).join('\n      ')}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  checkBuild();
  const started = Date.now();
  const grep = process.env.NK_FF_GREP ? new RegExp(process.env.NK_FF_GREP, 'i') : null;
  const chosen = tests.filter((t) => !grep || grep.test(t.name));
  const shared = chosen.filter((t) => !t.alone);
  const alone = chosen.filter((t) => t.alone);
  const site = await startSite();
  const results = [];
  let browser = null;
  let brokenAddon = null;

  try {
    for (const t of shared) {
      browser ??= await new Browser(site).start();
      const passed = await runOne(browser, t);
      results.push(passed);
      // A failed test can leave a prompt holding the line, so it takes its browser with it.
      if (passed) await browser.closeTabs();
      else { await browser.stop(); browser = null; }
    }
    await browser?.stop();

    results.push(...await Promise.all(alone.map(async (t) => {
      let addon = XPI;
      if (t.brokenPrompt) addon = brokenAddon = brokenPromptAddon();
      const own = new Browser(site, addon);
      try {
        await own.start();
        return await runOne(own, t);
      } catch (e) {
        console.log(`  ✗ ${t.name}: could not start: ${e.message}`);
        return false;
      } finally {
        await own.stop();
      }
    })));
  } finally {
    await browser?.stop();
    site.close();
    if (brokenAddon) rmSync(brokenAddon, { recursive: true, force: true });
  }

  const failed = results.filter((passed) => !passed).length;
  const took = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`\nFIREFOX consent: ${results.length - failed} passed, ${failed} failed, ${took}s`);
  return failed;
}

main()
  .then((failed) => process.exit(failed ? 1 : 0))
  .catch((e) => { console.error('FIREFOX test error:', e.message); process.exit(2); });
