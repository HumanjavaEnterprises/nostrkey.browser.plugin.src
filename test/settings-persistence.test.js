/**
 * Settings persistence — save & recover (unit, browser-agnostic)
 *
 * Loads the REAL src/a11y.js (the pre-paint settings bootstrap) in jsdom with a
 * fake WebExtension storage, and verifies that appearance + accessibility
 * settings save, apply to <html>, persist, and RECOVER on a fresh load.
 *
 * a11y.js resolves the same `browser`/`chrome` storage the way every target does
 * (Chrome storage.sync → Google, Firefox → Firefox Sync, Safari → iCloud), so
 * this logic is identical across all browsers — the browser-specific part is only
 * which backend `storage.sync` writes to. See test/e2e for the real-browser check.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const A11Y_SRC = readFileSync(resolve('src/a11y.js'), 'utf8');
const KEY = 'a11y_prefs';

/** A fake chrome.* with independent sync + local stores (promise + callback forms). */
function makeChrome({ sync = {}, local = {} } = {}) {
  const mkArea = (store) => ({
    _store: store,
    get(key, cb) {
      const items = key in store ? { [key]: store[key] } : {};
      if (typeof cb === 'function') { cb(items); return; }
      return Promise.resolve(items);
    },
    set(payload, cb) {
      Object.assign(store, payload);
      if (typeof cb === 'function') { cb(); return; }
      return Promise.resolve();
    },
    remove(key, cb) {
      delete store[key];
      if (typeof cb === 'function') { cb(); return; }
      return Promise.resolve();
    },
  });
  return {
    storage: {
      sync: mkArea(sync),
      local: mkArea(local),
      onChanged: { addListener() {}, removeListener() {} },
    },
    runtime: {},
  };
}

/** Boot a fresh a11y.js against a chrome mock + a matchMedia stub. Returns insA11y. */
async function boot(chromeMock, { systemPrefersLight = false } = {}) {
  globalThis.chrome = chromeMock;
  delete globalThis.browser;
  const root = document.documentElement;
  ['data-ins-text', 'data-ins-contrast', 'data-ins-motion', 'data-ins-density', 'data-ins-skin']
    .forEach((a) => root.removeAttribute(a));
  window.matchMedia = (q) => ({
    matches: systemPrefersLight, media: q,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  });
  // eslint-disable-next-line no-eval
  (0, eval)(A11Y_SRC);
  const api = window.insA11y;
  if (api && api.ready && typeof api.ready.then === 'function') await api.ready;
  else await new Promise((r) => setTimeout(r, 0));
  return api;
}

const skin = () => document.documentElement.getAttribute('data-ins-skin');
const attr = (a) => document.documentElement.getAttribute(a);

describe('settings persistence — save & recover', () => {
  beforeEach(() => { delete globalThis.chrome; delete globalThis.browser; });

  it('applies defaults on a fresh install (no stored prefs)', async () => {
    await boot(makeChrome());
    expect(attr('data-ins-text')).toBe('m');
    expect(attr('data-ins-contrast')).toBeNull();       // high contrast off
    expect(attr('data-ins-motion')).toBeNull();         // reduce motion off
    expect(attr('data-ins-density')).toBe('comfortable'); // default = comfortable
    expect(skin()).toBe('instrument-dark');             // default look × mode
  });

  it('SAVES a look change and persists it to storage', async () => {
    const chrome = makeChrome();
    const a = await boot(chrome);
    await a.set({ theme: 'analog' });
    expect(skin()).toBe('analog-dark');
    expect(chrome.storage.sync._store[KEY].theme).toBe('analog'); // written through
  });

  it('resolves theme × mode into the right skin', async () => {
    const a = await boot(makeChrome());
    await a.set({ theme: 'console', mode: 'light' });
    expect(skin()).toBe('console-light');
  });

  it('density compact removes the attribute; comfortable stamps it', async () => {
    const a = await boot(makeChrome());
    await a.set({ density: 'compact' });
    expect(attr('data-ins-density')).toBeNull();
    await a.set({ density: 'comfortable' });
    expect(attr('data-ins-density')).toBe('comfortable');
  });

  it('stamps text size, high contrast, and reduce motion', async () => {
    const a = await boot(makeChrome());
    await a.set({ textSize: 'xl', highContrast: true, reduceMotion: true });
    expect(attr('data-ins-text')).toBe('xl');
    expect(attr('data-ins-contrast')).toBe('high');
    expect(attr('data-ins-motion')).toBe('off');
  });

  it('RECOVERS every setting on a fresh load from persisted storage', async () => {
    const stored = { theme: 'console', mode: 'light', density: 'compact', textSize: 'l', highContrast: true };
    await boot(makeChrome({ sync: { [KEY]: stored } }));
    expect(skin()).toBe('console-light');
    expect(attr('data-ins-text')).toBe('l');
    expect(attr('data-ins-density')).toBeNull();   // compact
    expect(attr('data-ins-contrast')).toBe('high');
  });

  it('round-trips: save on one load, recover on the next (shared backend)', async () => {
    const sync = {};
    const a = await boot(makeChrome({ sync }));
    await a.set({ theme: 'analog', mode: 'light', density: 'compact', textSize: 's' });
    // simulate a reload: new a11y instance, SAME storage backend
    await boot(makeChrome({ sync }));
    expect(skin()).toBe('analog-light');
    expect(attr('data-ins-text')).toBe('s');
    expect(attr('data-ins-density')).toBeNull();
  });

  it('sanitizes corrupt stored prefs back to safe defaults', async () => {
    const junk = { theme: 'bogus', mode: 42, textSize: 'xxl', density: null, highContrast: 'yes' };
    await boot(makeChrome({ sync: { [KEY]: junk } }));
    expect(skin()).toBe('instrument-dark');
    expect(attr('data-ins-text')).toBe('m');
    expect(attr('data-ins-density')).toBe('comfortable');
    expect(attr('data-ins-contrast')).toBeNull(); // 'yes' is not === true
  });

  it("mode 'system' follows the OS: light", async () => {
    const a = await boot(makeChrome(), { systemPrefersLight: true });
    await a.set({ theme: 'console', mode: 'system' });
    expect(skin()).toBe('console-light');
  });

  it("mode 'system' follows the OS: dark", async () => {
    const a = await boot(makeChrome(), { systemPrefersLight: false });
    await a.set({ theme: 'console', mode: 'system' });
    expect(skin()).toBe('console-dark');
  });

  it('recovers from local storage when sync is empty (fallback path)', async () => {
    await boot(makeChrome({ sync: {}, local: { [KEY]: { theme: 'analog', mode: 'dark' } } }));
    expect(skin()).toBe('analog-dark');
  });
});
