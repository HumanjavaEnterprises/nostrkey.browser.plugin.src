/**
 * Settings persistence — Safari (macOS WebKit) test, via safaridriver.
 *
 * safaridriver can't drive real Safari extension pages, so this drives the harness
 * (test/e2e/safari-harness.html), which runs the REAL src/a11y.js in Safari's WebKit
 * engine with an in-memory chrome.storage mock, re-initialised in-page — so
 * save → load → apply is exercised in the true engine iOS Safari uses too.
 *
 * One-time setup:  sudo safaridriver --enable   (authorises WebDriver in Safari)
 * Run:             node test/e2e/safari-settings.mjs
 */

import { Builder } from 'selenium-webdriver';
import safari from 'selenium-webdriver/safari.js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..'); // repo root, so ../../src/a11y.js resolves
const A11Y_SRC = readFileSync(resolve(ROOT, 'src/a11y.js'), 'utf8');

// simulate a fresh load in the same page (safaridriver sessions may not persist
// localStorage across a real reload): wipe the DOM attrs + re-run a11y.js, which
// re-reads the persisted store and re-applies — the true save→load→apply cycle.
const reinit = (driver) => driver.executeAsyncScript((src, done) => {
  ['data-ins-skin', 'data-ins-text', 'data-ins-density', 'data-ins-contrast', 'data-ins-motion']
    .forEach((a) => document.documentElement.removeAttribute(a));
  // eslint-disable-next-line no-eval
  (0, eval)(src);
  const r = window.insA11y && window.insA11y.ready;
  (r && r.then ? r : Promise.resolve()).then(() => done());
}, A11Y_SRC);

// Safari disables localStorage on file:// — serve over http://localhost where it works.
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
function startServer() {
  return new Promise((res) => {
    const srv = createServer(async (req, r) => {
      try {
        const p = resolve(ROOT, '.' + decodeURIComponent(req.url.split('?')[0]));
        if (!p.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
        const body = await readFile(p);
        r.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
        r.end(body);
      } catch { r.writeHead(404); r.end(); }
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

let failures = 0;
const eq = (name, got, want) => {
  const ok = got === want;
  console.log(`  ${ok ? '✓' : '✗'} ${name}: ${JSON.stringify(got)}${ok ? '' : ` (expected ${JSON.stringify(want)})`}`);
  if (!ok) failures++;
};
const attr = (d, n) => d.executeScript((x) => document.documentElement.getAttribute(x), n);
const ready = (d) => d.wait(() => d.executeScript(() => !!window.insA11y), 10000);

async function main() {
  const srv = await startServer();
  const port = srv.address().port;
  const HARNESS = `http://127.0.0.1:${port}/test/e2e/safari-harness.html`;
  const driver = await new Builder().forBrowser('safari').setSafariOptions(new safari.Options()).build();
  try {
    await driver.get(HARNESS);
    await ready(driver);
    // save (await the persist promise so it flushes before we reload)
    await driver.executeAsyncScript((done) =>
      window.insA11y.set({ theme: 'analog', mode: 'light', density: 'compact', textSize: 'xl' }).then(done));
    eq('applied immediately (skin)', await attr(driver, 'data-ins-skin'), 'analog-light');

    // fresh a11y init reads the persisted store → recover
    await reinit(driver);
    eq('recovered after re-init (skin)', await attr(driver, 'data-ins-skin'), 'analog-light');
    eq('recovered after re-init (text)', await attr(driver, 'data-ins-text'), 'xl');
    eq('recovered after re-init (density=compact→null)', await attr(driver, 'data-ins-density'), null);

    // change + re-init again → still recovers
    await driver.executeAsyncScript((done) =>
      window.insA11y.set({ theme: 'console', mode: 'dark' }).then(done));
    await reinit(driver);
    eq('recovered second change (skin)', await attr(driver, 'data-ins-skin'), 'console-dark');  } finally {
    await driver.quit();
    srv.close();
  }
}

main()
  .then(() => {
    console.log(failures ? `\nSAFARI(WebKit): ${failures} assertion(s) FAILED` : '\nSAFARI(WebKit): settings persist in the real engine ✓');
    process.exit(failures ? 1 : 0);
  })
  .catch((e) => {
    if (/allow remote automation|not authoriz|Enable the .Allow Remote/i.test(e.message || '')) {
      console.error('SAFARI: needs one-time setup → run:  sudo safaridriver --enable   (then re-run)');
      process.exit(3);
    }
    console.error('SAFARI test error:', e.message);
    process.exit(2);
  });
