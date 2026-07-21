// @vitest-environment jsdom
/**
 * insConfirm / insNotice — the shared consent-overlay (real DOM).
 *
 * REAL import of src/ins-confirm.js. It is pure ESM: it touches only `document`
 * and `window.matchMedia`, with no browser-polyfill / storage / messaging deps,
 * so jsdom can exercise it directly. Covers CS-07..CS-11 + CS-13 of the
 * consent-surface standard: sheet-vs-popover proportionality, destructive
 * treatment (alertdialog + destructive button + Cancel-first focus), the exact
 * resolved value for every dismissal path, focus trap + restore, textContent-only
 * (XSS-safe) rendering, queue serialization, notice single-button shape, aria
 * wiring, and reduced-motion synchronous teardown.
 *
 * beforeEach stamps <html data-ins-motion="off"> so motionOff()===true and
 * settle()->finish() runs synchronously (no 250ms timer). Initial focus is set
 * inside requestAnimationFrame (ins-confirm.js:145-152), so tests await a rAF
 * before asserting document.activeElement. Escape/Tab handlers are attached with
 * capture=true on `document` (ins-confirm.js:142), so key events are dispatched
 * on `document`.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { insConfirm, insNotice } from '../src/ins-confirm.js';

// --- helpers -----------------------------------------------------------------
const roots = () => document.querySelectorAll('.ins-consent-root');
const openRoot = () => document.querySelector('.ins-consent-root');
const dialogEl = () => document.querySelector('.ins-consent-sheet, .ins-consent-popover');
const titleEl = () => document.querySelector('.ins-consent-title');
const bodyEl = () => document.querySelector('.ins-consent-body');
const confirmBtn = () => document.querySelector('.ins-consent-actions button:last-child');
const cancelBtn = () => document.querySelector('.ins-consent-actions .btn--ghost');
const backdrop = () => document.querySelector('.ins-consent-backdrop');

// setTimeout(0) drains the microtask queue where queue.then(openDialog) lives.
const flush = () => new Promise((r) => setTimeout(r, 0));
// rAF is where ins-confirm.js sets initial focus + is-open classes.
const raf = () => new Promise((r) => requestAnimationFrame(() => r()));

/**
 * Fire a dialog and wait until it is mounted AND initial focus is applied.
 * The pending dialog promise is wrapped in a plain object — returning it bare
 * from an async fn would flatten the thenable and deadlock (await would wait for
 * the dialog to resolve, which only happens after a click).
 */
async function mount(fn, opts) {
  const box = { p: fn(opts) };
  await flush();
  await raf();
  return box;
}

function key(name, extra = {}) {
  return new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra });
}

beforeEach(() => {
  document.documentElement.setAttribute('data-ins-motion', 'off');
  // motionOff() short-circuits on the attribute above, but stub matchMedia so
  // the try/catch path is never a source of surprise.
  if (!window.matchMedia) window.matchMedia = () => ({ matches: false });
  document.body.innerHTML = '';
});

// Guarantee the module-level `queue` is drained between tests: any dialog left
// open would block the next test's dialog from ever mounting.
afterEach(async () => {
  let guard = 0;
  while (openRoot() && guard++ < 10) {
    document.dispatchEvent(key('Escape'));
    await flush();
  }
});

describe('variant proportionality (CS-07/CS-08)', () => {
  it("default variant builds a .ins-consent-sheet WITH a .ins-consent-handle", async () => {
    const { p } = await mount(insConfirm, { title: 'Save?' });
    expect(document.querySelector('.ins-consent-sheet')).not.toBeNull();
    expect(document.querySelector('.ins-consent-popover')).toBeNull();
    expect(document.querySelector('.ins-consent-handle')).not.toBeNull();
    confirmBtn().click();
    await p;
  });

  it("variant:'popover' builds a .ins-consent-popover with NO handle", async () => {
    const { p } = await mount(insConfirm, { title: 'Copy?', variant: 'popover' });
    expect(document.querySelector('.ins-consent-popover')).not.toBeNull();
    expect(document.querySelector('.ins-consent-sheet')).toBeNull();
    expect(document.querySelector('.ins-consent-handle')).toBeNull();
    confirmBtn().click();
    await p;
  });
});

describe('destructive treatment (CS-09)', () => {
  it("destructive:true -> confirm button 'btn btn--destructive' + role='alertdialog'", async () => {
    const { p } = await mount(insConfirm, { title: 'Delete key', destructive: true });
    expect(confirmBtn().className).toBe('btn btn--destructive');
    expect(dialogEl().getAttribute('role')).toBe('alertdialog');
    cancelBtn().click();
    await p;
  });

  it("non-destructive -> confirm button 'btn btn--primary' + role='dialog'", async () => {
    const { p } = await mount(insConfirm, { title: 'Continue' });
    expect(confirmBtn().className).toBe('btn btn--primary');
    expect(dialogEl().getAttribute('role')).toBe('dialog');
    confirmBtn().click();
    await p;
  });
});

describe('resolved value per dismissal path (CS-10)', () => {
  it('confirm click resolves true', async () => {
    const { p } = await mount(insConfirm, { title: 'ok?' });
    confirmBtn().click();
    await expect(p).resolves.toBe(true);
  });

  it('cancel click resolves false', async () => {
    const { p } = await mount(insConfirm, { title: 'ok?' });
    cancelBtn().click();
    await expect(p).resolves.toBe(false);
  });

  it('Escape (capture, on document) resolves false', async () => {
    const { p } = await mount(insConfirm, { title: 'ok?' });
    document.dispatchEvent(key('Escape'));
    await expect(p).resolves.toBe(false);
  });

  it('backdrop click resolves false', async () => {
    const { p } = await mount(insConfirm, { title: 'ok?' });
    backdrop().click();
    await expect(p).resolves.toBe(false);
  });
});

describe('initial focus proportionality (CS-09)', () => {
  it('destructive:true starts focus on CANCEL so Enter cannot rush a delete', async () => {
    const { p } = await mount(insConfirm, { title: 'Delete', destructive: true });
    expect(document.activeElement).toBe(cancelBtn());
    cancelBtn().click();
    await p;
  });

  it('non-destructive starts focus on CONFIRM', async () => {
    const { p } = await mount(insConfirm, { title: 'Continue' });
    expect(document.activeElement).toBe(confirmBtn());
    confirmBtn().click();
    await p;
  });
});

describe('focus trap (CS-11)', () => {
  it('Tab from last button wraps to first; Shift+Tab from first wraps to last', async () => {
    const { p } = await mount(insConfirm, { title: 'trap' });
    const first = cancelBtn();
    const last = confirmBtn();

    // Focus starts on last (confirm). Tab -> wraps to first (cancel).
    last.focus();
    expect(document.activeElement).toBe(last);
    document.dispatchEvent(key('Tab'));
    expect(document.activeElement).toBe(first);

    // Shift+Tab from first -> wraps to last.
    first.focus();
    document.dispatchEvent(key('Tab', { shiftKey: true }));
    expect(document.activeElement).toBe(last);

    // The page body never became the active element.
    expect(document.activeElement === document.body).toBe(false);

    confirmBtn().click();
    await p;
  });
});

describe('focus restore (CS-11)', () => {
  it('restores focus to the element focused before the dialog opened', async () => {
    const prior = document.createElement('button');
    prior.textContent = 'opener';
    document.body.appendChild(prior);
    prior.focus();
    expect(document.activeElement).toBe(prior);

    const { p } = await mount(insConfirm, { title: 'transient' });
    // Dialog stole focus to one of its buttons.
    expect(document.activeElement).not.toBe(prior);

    confirmBtn().click();
    await p;
    // motionOff() -> finish() ran synchronously and restored focus.
    expect(document.activeElement).toBe(prior);
  });
});

describe('XSS-safety: textContent only, never innerHTML (CS-10)', () => {
  it('markup in title/body is inert text, not parsed nodes', async () => {
    const rawTitle = '<img src=x onerror=alert(1)>';
    const rawBody = '<script>x</script>';
    const { p } = await mount(insConfirm, { title: rawTitle, body: rawBody });

    // No <img> was ever created from the title string.
    expect(openRoot().querySelector('img')).toBeNull();
    // The literal string survives verbatim as text.
    expect(titleEl().textContent).toBe(rawTitle);
    expect(bodyEl().textContent).toBe(rawBody);

    confirmBtn().click();
    await p;
  });
});

describe('serialization: overlapping calls are queued (CS-10)', () => {
  it('only one dialog is mounted at a time; the second waits for the first', async () => {
    // Fire two WITHOUT awaiting between them.
    const p1 = insConfirm({ title: 'first' });
    const p2 = insConfirm({ title: 'second' });

    await flush();
    await raf();
    expect(roots().length).toBe(1);
    expect(titleEl().textContent).toBe('first');

    // Resolve the first; the second must only mount afterwards.
    confirmBtn().click();
    await expect(p1).resolves.toBe(true);
    await flush();
    await raf();

    expect(roots().length).toBe(1);
    expect(titleEl().textContent).toBe('second');

    confirmBtn().click();
    await expect(p2).resolves.toBe(true);
  });
});

describe('insNotice single-button shape (CS-10)', () => {
  it('renders exactly ONE button, role=alertdialog, no ghost cancel', async () => {
    const { p } = await mount(insNotice, { title: 'Heads up' });
    const btns = document.querySelectorAll('.ins-consent-actions button');
    expect(btns.length).toBe(1);
    expect(btns[0].className).toBe('btn');
    expect(document.querySelector('.btn--ghost')).toBeNull();
    expect(dialogEl().getAttribute('role')).toBe('alertdialog');
    btns[0].click();
    await expect(p).resolves.toBeUndefined();
  });

  it('resolves undefined on backdrop dismissal', async () => {
    const { p } = await mount(insNotice, { title: 'Heads up' });
    backdrop().click();
    await expect(p).resolves.toBeUndefined();
  });

  it('resolves undefined on Escape', async () => {
    const { p } = await mount(insNotice, { title: 'Heads up' });
    document.dispatchEvent(key('Escape'));
    await expect(p).resolves.toBeUndefined();
  });
});

describe('reduced motion (CS-13)', () => {
  it("data-ins-motion='off' removes the root synchronously (no 250ms timer)", async () => {
    const { p } = await mount(insConfirm, { title: 'quick' });
    expect(roots().length).toBe(1);

    // Click confirm. With motionOff()===true, settle()->finish() removes the
    // root synchronously inside the click handler — assert WITHOUT any await
    // and WITHOUT advancing timers.
    confirmBtn().click();
    expect(roots().length).toBe(0);

    await expect(p).resolves.toBe(true);
  });
});

describe('aria wiring (CS-10/CS-11)', () => {
  it('aria-modal + aria-labelledby/aria-describedby point at the title/body ids', async () => {
    const { p } = await mount(insConfirm, { title: 'Labelled', body: 'Described' });
    const d = dialogEl();
    expect(d.getAttribute('aria-modal')).toBe('true');

    const labelId = d.getAttribute('aria-labelledby');
    const descId = d.getAttribute('aria-describedby');
    expect(labelId).toBeTruthy();
    expect(descId).toBeTruthy();
    expect(labelId).toBe(titleEl().id);
    expect(descId).toBe(bodyEl().id);
    expect(document.getElementById(labelId)).toBe(titleEl());
    expect(document.getElementById(descId)).toBe(bodyEl());

    confirmBtn().click();
    await p;
  });
});
