/**
 * Settings persistence — Firefox synthetic browser test (Selenium + geckodriver)
 *
 * Playwright can't load a Firefox WebExtension, so this uses Selenium: it pins the
 * extension's internal moz-extension UUID (via the extensions.webextensions.uuids
 * pref, keyed on the manifest's gecko id), temporarily installs the built add-on,
 * then drives the real full_settings page — save → reload → recover — against real
 * Firefox storage. Runs headless.
 *
 *   npm run build:firefox && node test/e2e/firefox-settings.mjs
 */

import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import { download } from 'geckodriver';   // fetches (cached) the driver binary
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const GECKO_ID = 'nostrkey@nostrkey.com';
const UUID = 'a11a11a1-1a11-4a11-8a11-a11a11a11a11'; // any valid UUID; pinned below
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const XPI = resolve(ROOT, `distros/nostrkey-firefox-v${pkg.version}.zip`);

let failures = 0;
const eq = (name, got, want) => {
  const ok = got === want;
  console.log(`  ${ok ? '✓' : '✗'} ${name}: ${JSON.stringify(got)}${ok ? '' : ` (expected ${JSON.stringify(want)})`}`);
  if (!ok) failures++;
};
const attr = (driver, name) =>
  driver.executeScript((n) => document.documentElement.getAttribute(n), name);

async function main() {
  if (!existsSync(XPI)) throw new Error(`missing ${XPI} — run: npm run build:firefox`);

  const opts = new firefox.Options();
  opts.addArguments('-headless');
  // pin the internal UUID so we can navigate to moz-extension://<UUID>/...
  opts.setPreference('extensions.webextensions.uuids', JSON.stringify({ [GECKO_ID]: UUID }));
  opts.setPreference('xpinstall.signatures.required', false);
  opts.setPreference('extensions.experiments.enabled', true);

  const geckoBinary = await download();
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(opts)
    .setFirefoxService(new firefox.ServiceBuilder(geckoBinary))
    .build();
  try {
    await driver.installAddon(XPI, /* temporary */ true);
    const page = `moz-extension://${UUID}/full_settings.html`;

    // --- save then reload → recover ---
    await driver.get(page);
    await driver.wait(() => driver.executeScript(() => !!window.insA11y), 10000);
    await driver.executeScript(() =>
      window.insA11y.set({ theme: 'analog', mode: 'light', density: 'compact', textSize: 'xl' }));
    eq('applied immediately (data-ins-skin)', await attr(driver, 'data-ins-skin'), 'analog-light');

    await driver.navigate().refresh();
    await driver.wait(() => driver.executeScript(() => !!window.insA11y), 10000);
    eq('recovered after reload (skin)', await attr(driver, 'data-ins-skin'), 'analog-light');
    eq('recovered after reload (text)', await attr(driver, 'data-ins-text'), 'xl');
    eq('recovered after reload (density=compact→null)', await attr(driver, 'data-ins-density'), null);

    // --- cross-surface: a different extension page boots with the saved skin ---
    await driver.executeScript(() => window.insA11y.set({ theme: 'console', mode: 'dark' }));
    await driver.get(`moz-extension://${UUID}/sidepanel.html`);
    await driver.wait(() => driver.executeScript(() => !!window.insA11y), 10000);
    eq('cross-surface recover (sidepanel skin)', await attr(driver, 'data-ins-skin'), 'console-dark');

    // reset for a clean profile next run
    await driver.get(page);
    await driver.wait(() => driver.executeScript(() => !!window.insA11y), 10000);
    await driver.executeScript(() =>
      window.insA11y.set({ theme: 'instrument', mode: 'dark', density: 'comfortable', textSize: 'm' }));
  } finally {
    await driver.quit();
  }
}

main()
  .then(() => {
    console.log(failures ? `\nFIREFOX: ${failures} assertion(s) FAILED` : '\nFIREFOX: all settings persisted ✓');
    process.exit(failures ? 1 : 0);
  })
  .catch((e) => { console.error('FIREFOX test error:', e.message); process.exit(2); });
