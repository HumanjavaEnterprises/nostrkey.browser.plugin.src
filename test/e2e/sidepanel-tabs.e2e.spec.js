/**
 * The tab bar in real layout: first in the DOM and on screen, reachable at phone
 * widths, and still there with a keyboard up. Set NK_SHOT_DIR to keep a screenshot
 * of each size and print where things landed.
 */
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { launchWithExtension, seedLocalProfile } from './helpers/consent-harness.js';

test.describe.configure({ mode: 'serial' });

const SHOT_DIR = process.env.NK_SHOT_DIR;
const TAB_TRANSITION_MS = 120;

async function openPanel(context, extensionId, { width = 400, height = 580, init } = {}) {
  const page = await context.newPage();
  if (init) await page.addInitScript(init);
  await page.setViewportSize({ width, height });
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await page.locator('.tab-btn.active').waitFor();
  return page;
}

const measureTabs = (page) => page.evaluate(() => {
  const rect = (el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
  const settings = document.querySelector('.tab-btn[data-view="settings"]');
  const content = document.querySelector('#unlocked-view .sidepanel-content');
  const section = content.querySelector('.view-section.active');
  content.scrollTop = content.scrollHeight;
  return {
    inner: { w: window.innerWidth, h: window.innerHeight },
    nav: rect(document.querySelector('.sidepanel-tabs')),
    settings: rect(settings),
    content: rect(content),
    contentEnd: rect(section),
    overflowed: content.scrollHeight > content.clientHeight,
    pageWidth: document.documentElement.scrollWidth,
    minHeight: getComputedStyle(document.body).minHeight,
    minWidth: getComputedStyle(document.body).minWidth,
  };
});

async function keep(page, name, m) {
  if (!SHOT_DIR) return;
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await page.evaluate(() => { document.querySelector('#unlocked-view .sidepanel-content').scrollTop = 0; });
  await page.waitForTimeout(TAB_TRANSITION_MS + 100);
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`) });
  console.log(`${name}: ${JSON.stringify(m)}`);
}

test.describe('on a desktop browser', () => {
  let context, extensionId, sw;
  test.beforeAll(async () => {
    ({ context, extensionId, sw } = await launchWithExtension());
    await seedLocalProfile(sw);
  });
  test.afterAll(async () => { await context.close(); });

  test('only the active tab is drawn as active once a switch has settled', async () => {
    const page = await openPanel(context, extensionId);
    await page.locator('.tab-btn[data-view="settings"]').click();
    await page.waitForTimeout(TAB_TRANSITION_MS + 100);
    const lines = await page.evaluate(() => Object.fromEntries(
      [...document.querySelectorAll('.tab-btn')].map(b => [b.dataset.view, getComputedStyle(b).borderBottomColor]),
    ));
    expect(lines.home).toBe('rgba(0, 0, 0, 0)');
    expect(lines.settings).not.toBe('rgba(0, 0, 0, 0)');
    await page.close();
  });

  test('the nav is the first child of the unlocked view, and above the content', async () => {
    const page = await openPanel(context, extensionId);
    const layout = await page.evaluate(() => {
      const view = document.getElementById('unlocked-view');
      const nav = document.querySelector('.sidepanel-tabs');
      return {
        first: view.firstElementChild === nav,
        navTop: nav.getBoundingClientRect().top,
        navBottom: nav.getBoundingClientRect().bottom,
        contentTop: view.querySelector('.sidepanel-content').getBoundingClientRect().top,
        order: getComputedStyle(nav).order,
      };
    });
    expect(layout.first).toBe(true);
    expect(layout.navTop).toBeLessThan(layout.contentTop);
    expect(layout.navBottom).toBeLessThanOrEqual(layout.contentTop);
    expect(layout.order).toBe('0');
    await page.close();
  });

  test('the active tab is marked under it, and the bar divides from what is below', async () => {
    const page = await openPanel(context, extensionId);
    const marks = await page.evaluate(() => {
      const nav = getComputedStyle(document.querySelector('.sidepanel-tabs'));
      const active = getComputedStyle(document.querySelector('.tab-btn.active'));
      return {
        navTop: nav.borderTopWidth, navBottom: nav.borderBottomWidth,
        activeTop: active.borderTopWidth, activeBottom: active.borderBottomWidth,
        activeBottomColor: active.borderBottomColor, signal: active.color,
      };
    });
    expect(marks.navTop).toBe('0px');
    expect(marks.navBottom).toBe('1px');
    expect(marks.activeTop).toBe('0px');
    expect(marks.activeBottom).toBe('2px');
    expect(marks.activeBottomColor).toBe(marks.signal);
    await page.close();
  });

  test('keyboard focus reaches every tab first, in order', async () => {
    const page = await openPanel(context, extensionId);
    const reached = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      reached.push(await page.evaluate(() => document.activeElement?.dataset?.view));
    }
    expect(reached).toEqual(['home', 'vault', 'permissions', 'relays', 'settings']);
    await page.close();
  });

  test('a desktop popup keeps its size floor', async () => {
    const page = await openPanel(context, extensionId);
    const m = await measureTabs(page);
    expect(m.minHeight).toBe('580px');
    expect(m.minWidth).toBe('400px');
    await keep(page, 'panel-desktop-400x580', m);
    await page.close();
  });

  for (const width of [375, 390]) {
    test(`a panel dragged to ${width} keeps every tab in view`, async () => {
      const page = await openPanel(context, extensionId, { width, height: 667 });
      const m = await measureTabs(page);
      expect(m.minWidth).toBe('400px');
      expect(m.settings.right).toBeLessThanOrEqual(m.inner.w);
      await keep(page, `panel-desktop-${width}x667`, m);
      await page.close();
    });
  }

  test('a wider panel fills its width', async () => {
    const page = await openPanel(context, extensionId, { width: 420, height: 667 });
    const m = await measureTabs(page);
    expect(m.nav.right).toBe(420);
    await keep(page, 'panel-desktop-420x667', m);
    await page.close();
  });

  test('the tabs stay with a keyboard up, and the locked footer still gives way', async () => {
    // Desktop Chromium opens no on-screen keyboard, so the viewport is a stand-in.
    const init = () => {
      const stub = new EventTarget();
      stub.height = window.innerHeight || 800;
      Object.defineProperty(window, 'visualViewport', { value: stub, configurable: true });
      window.__keyboard = (up) => {
        stub.height = up ? window.innerHeight * 0.5 : window.innerHeight;
        stub.dispatchEvent(new Event('resize'));
      };
    };
    const page = await openPanel(context, extensionId, { init });
    await page.evaluate(() => window.__keyboard(true));
    for (const view of ['home', 'vault', 'permissions', 'relays', 'settings']) {
      await expect(page.locator(`.tab-btn[data-view="${view}"]`)).toBeVisible();
    }
    expect(await page.evaluate(() => document.getElementById('locked-footer').style.display)).toBe('none');
    await page.evaluate(() => window.__keyboard(false));
    expect(await page.evaluate(() => document.getElementById('locked-footer').style.display)).toBe('');
    await page.close();
  });
});

test.describe('on a phone', () => {
  let context, extensionId, sw;
  test.beforeAll(async () => {
    ({ context, extensionId, sw } = await launchWithExtension({
      hasTouch: true, isMobile: true, viewport: { width: 390, height: 700 },
    }));
    await seedLocalProfile(sw);
  });
  test.afterAll(async () => { await context.close(); });

  for (const [width, height, name] of [
    [375, 667, 'full'], [390, 700, 'full'], [420, 700, 'full'],
    [375, 400, 'half-sheet'], [390, 420, 'half-sheet'], [420, 420, 'half-sheet'],
  ]) {
    test(`at ${width}x${height} (${name}) every tab and the end of the content can be reached`, async () => {
      const page = await openPanel(context, extensionId, { width, height });
      expect(await page.evaluate(() => matchMedia('(pointer: coarse) and (hover: none)').matches)).toBe(true);
      await page.locator('.tab-btn[data-view="settings"]').tap();
      await expect(page.locator('#view-settings')).toBeVisible();
      await keep(page, `panel-phone-${width}x${height}-${name}-settings`, 'shot');
      const m = await measureTabs(page);
      expect(m.overflowed).toBe(true);
      expect(m.contentEnd.bottom).toBeGreaterThan(m.contentEnd.top);
      expect(m.settings.right).toBeLessThanOrEqual(m.inner.w);
      expect(m.nav.top).toBeGreaterThanOrEqual(0);
      expect(m.nav.bottom).toBeLessThanOrEqual(m.content.top);
      expect(m.pageWidth).toBeLessThanOrEqual(m.inner.w);
      expect(m.content.bottom).toBeLessThanOrEqual(m.inner.h);
      expect(m.contentEnd.bottom).toBeLessThanOrEqual(m.inner.h);
      await keep(page, `panel-phone-${width}x${height}-${name}`, m);
      await page.close();
    });
  }
});
