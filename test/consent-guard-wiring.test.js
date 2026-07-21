/**
 * Consent trust-boundary WIRING (source-level assertions).
 *
 * These guards protect the CS-* consent invariants that jsdom cannot actually
 * execute: closed-shadow-root compositing, a real MutationObserver measuring
 * occlusion, and cross-origin iframe isolation. There is no runtime we can run
 * that faithfully reproduces "the page re-parented our host under a transparent
 * group" in jsdom, so instead we assert that the SOURCE wiring which enforces
 * these properties still exists — the test fails if a future edit removes the
 * guard (mirroring the style of security-boundary.test.js NK-07 / NK-08).
 *
 * Executable companions (do the runtime part): consent-redress-predicate
 * (runs styleSuppresses/sheetLooksCompromised) and consent-prompt-timer (runs
 * the armPromptTimeout / pending-queue logic). This file is the wiring half.
 *
 * Sources asserted: src/content.js, src/background.js, src/permission/permission.js.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const contentJs = read('src/content.js');
const backgroundJs = read('src/background.js');
const permissionJs = read('src/permission/permission.js');

describe('CS-18 — injected chrome mounts in a CLOSED shadow root, pinned on top', () => {
  // content.js:121-143 mountShadowHost — every injected overlay (locked sheet,
  // consent sheet, FAB) mounts here. The page must not be able to script into
  // the internal nodes (closed root) nor click through / around the host.
  it('attaches a closed shadow root', () => {
    expect(contentJs).toMatch(/attachShadow\(\{\s*mode:\s*'closed'\s*\}\)/);
  });

  it("pins z-index to the max stacking value with !important", () => {
    // pin() is host.style.setProperty(prop, val, 'important'), so a literal
    // pin('z-index', '2147483647') means the host box sits above page content
    // and the page's own !important cannot lower it.
    expect(contentJs).toMatch(/pin\('z-index',\s*'2147483647'\)/);
  });

  it("pins pointer-events 'auto' so the consent surface stays clickable", () => {
    expect(contentJs).toMatch(/pin\('pointer-events',\s*'auto'\)/);
  });
});

describe('CS-15 — sheet redress guard is wired fail-closed and escalates to a tab', () => {
  // content.js:491-509 startSheetGuard + 484-489 onSheetCompromised.
  const guardBody = contentJs.match(/function startSheetGuard\(\)[\s\S]*?\n}/)[0];

  it('observes document.documentElement for style/class + childList + subtree', () => {
    expect(guardBody).toMatch(/new MutationObserver\(/);
    expect(guardBody).toMatch(/\.observe\(\s*document\.documentElement/);
    expect(guardBody).toMatch(/attributeFilter:\s*\[\s*'style',\s*'class'\s*\]/);
    expect(guardBody).toMatch(/childList:\s*true/);
    expect(guardBody).toMatch(/subtree:\s*true/);
  });

  it('backstops the observer with a ~200ms interval poll', () => {
    expect(guardBody).toMatch(/setInterval\(\s*\(\)\s*=>\s*\{[\s\S]*?sheetLooksCompromised\(\)[\s\S]*?\},\s*200\s*\)/);
  });

  it('onSheetCompromised destroys the in-page surface THEN escalates to background', () => {
    const body = contentJs.match(/function onSheetCompromised\(\)[\s\S]*?\n}/)[0];
    const removeIdx = body.indexOf('removePermissionUI()');
    const sendIdx = body.search(/kind:\s*'permissionSheetCompromised'/);
    expect(removeIdx).toBeGreaterThan(-1); // tears down the in-page sheet
    expect(sendIdx).toBeGreaterThan(-1);   // and hands off to the redress-immune tab
    expect(sendIdx).toBeGreaterThan(removeIdx); // destroy first, no hidden Approve to click
  });
});

describe('CS-03 — the page→content minimize channel is source-gated and consent-free', () => {
  // content.js:520-525 — the only window-message the content script honours from
  // the iframe is source-checked to iframe.contentWindow and limited to minimize.
  const handler = contentJs.match(/window\.addEventListener\('message',\s*\(ev\)\s*=>\s*\{[\s\S]*?\}\);/)[0];

  it('ignores any message whose source is not the consent iframe', () => {
    expect(handler).toMatch(/ev\.source !== iframe\.contentWindow/);
    // the source guard returns BEFORE the minimize action can run
    const guardIdx = handler.search(/ev\.source !== iframe\.contentWindow.*return/);
    const actIdx = handler.indexOf('__nostrkey_perm');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(actIdx).toBeGreaterThan(guardIdx);
  });

  it("only acts on __nostrkey_perm === 'minimize' — no allow/deny verb travels this channel", () => {
    expect(handler).toMatch(/__nostrkey_perm === 'minimize'/);
    expect(handler).not.toMatch(/__nostrkey_perm === 'allow/);
    expect(handler).not.toMatch(/__nostrkey_perm === 'deny/);
  });
});

describe('CS-13 — the FAB pulse animation honours reduced motion', () => {
  // content.js:386 gates the nk-fab-pulse animation behind the reduceMotion flag,
  // and :392 adds a @media(prefers-reduced-motion) belt-and-suspenders rule.
  it('the pulse animation is emitted only when reduceMotion is false', () => {
    expect(contentJs).toMatch(/reduceMotion \? '' : ' animation: nk-fab-pulse [^']*'/);
  });

  it('a prefers-reduced-motion media query also disables the FAB animation', () => {
    const fab = contentJs.match(/function showPermissionFab\(\)[\s\S]*?\n}/)[0];
    expect(fab).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.nk-fab \{ animation: none; \}/);
  });
});

describe('CS-12 / T0-1 — content.js never emits an Allow/Deny verb into page light DOM', () => {
  it('every injected backdrop is a fixed, full-viewport rgba(0,0,0,0.5) dim', () => {
    // Source-assertion (jsdom cannot measure real occlusion): assert each
    // .nk-backdrop rule COUPLES full-viewport fixed positioning WITH the consent
    // dim, so making a backdrop transparent, unsized, or unpositioned trips this —
    // not just a color literal floating somewhere in the file.
    const allRules = [...contentJs.matchAll(/\.nk-backdrop\s*\{[\s\S]*?\}/g)].map(m => m[0]);
    // Base backdrop definitions declare a background; `.active .nk-backdrop` state
    // rules only toggle opacity — check the definitions, not the state toggles.
    const baseRules = allRules.filter(r => /background:/.test(r));
    expect(baseRules.length).toBeGreaterThan(0);
    for (const rule of baseRules) {
      expect(rule).toMatch(/position:\s*fixed/);
      expect(rule).toMatch(/inset:\s*0/);
      expect(rule).toMatch(/background:\s*rgba\(0,0,0,0\.5\)/);
    }
  });

  it('no clickable Allow/Deny button markup exists in the content script', () => {
    // The Allow/Deny controls live INSIDE the extension iframe (permission.html).
    // content.js may reference "Allow"/"Deny" in comments, but must never build a
    // page-DOM button carrying the consent verb, nor an nk-btn-allow/deny class.
    expect(contentJs).not.toMatch(/nk-btn-allow/);
    expect(contentJs).not.toMatch(/nk-btn-deny/);
    expect(contentJs).not.toMatch(/<button[^>]*>[^<]*(Allow|Deny)[^<]*<\/button>/i);
  });
});

describe('T0-1 / NK-04 — consent verbs are extension-sender-only in background', () => {
  const sensitive = backgroundJs.match(/SENSITIVE_KINDS = new Set\(\[([\s\S]*?)\]\)/)[1];

  it("SENSITIVE_KINDS gates allowed/denied/closePrompt/exportProfile", () => {
    for (const k of ['allowed', 'denied', 'closePrompt', 'exportProfile']) {
      expect(sensitive).toContain(`'${k}'`);
    }
  });

  it("the onMessage listener rejects a sensitive kind from a non-extension sender", () => {
    // background.js:517-521 — the gate runs before the switch, replying
    // 'Unauthorized sender' and returning, so a page/content-script cannot
    // reach the allowed/denied handlers at all.
    expect(backgroundJs).toMatch(
      /SENSITIVE_KINDS\.has\(message\.kind\)\s*&&\s*!isExtensionSender\(_sender\)/,
    );
    const gate = backgroundJs.match(
      /if \(SENSITIVE_KINDS\.has\(message\.kind\)[\s\S]*?return true;\s*\}/,
    )[0];
    expect(gate).toMatch(/error:\s*'Unauthorized sender'/);
  });
});

describe('CS-05 — permissionSheetCompromised escalation is tab-scoped', () => {
  // background.js:532-547 — a page cannot use this verb to spawn tabs or hijack
  // another tab's prompt; the handler requires the sender's tab to be the one
  // that currently hosts the sheet.
  const handler = backgroundJs.match(/case 'permissionSheetCompromised':[\s\S]*?return true;/)[0];

  it('guards on _sender.tab.id === prompt.sheetTabId before creating the tab', () => {
    expect(handler).toMatch(/_sender\.tab && _sender\.tab\.id === prompt\.sheetTabId/);
    const guardIdx = handler.search(/_sender\.tab\.id === prompt\.sheetTabId/);
    const createIdx = handler.indexOf('api.tabs.create(');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(createIdx).toBeGreaterThan(guardIdx); // tab is opened only inside the guard
  });
});

describe('CS-18 — single pending decline: PROMPT_TIMEOUT_MS + one denyTimer', () => {
  it('PROMPT_TIMEOUT_MS is 40000 (40_000)', () => {
    expect(backgroundJs).toMatch(/const PROMPT_TIMEOUT_MS = 40_000;/);
  });

  it('armPromptTimeout clears any prior denyTimer before arming a new one', () => {
    // background.js:129-140 — re-arming (e.g. on tab escalation) must not leave
    // two pending auto-declines racing.
    const body = backgroundJs.match(/function armPromptTimeout\([\s\S]*?\n}/)[0];
    const clearIdx = body.search(/clearTimeout\(prompt\.denyTimer\)/);
    const setIdx = body.search(/prompt\.denyTimer = setTimeout\(/);
    expect(clearIdx).toBeGreaterThan(-1);
    expect(setIdx).toBeGreaterThan(-1);
    expect(setIdx).toBeGreaterThan(clearIdx); // clear-before-set
  });
});

describe('CS-01 / CS-05 — permission.js anti-clickjack arm delay + sheet-only minimize', () => {
  it('Approve is disabled then re-enabled only after a 450ms settle', () => {
    // permission.js:323-324
    expect(permissionJs).toMatch(
      /allowBtn\.disabled = true;\s*setTimeout\(\(\)\s*=>\s*\{\s*allowBtn\.disabled = false;\s*\},\s*450\)/,
    );
  });

  it('minimize() only posts to the parent when running inside the in-page sheet', () => {
    // permission.js:279-281 — window.top !== window.self means we are the framed
    // consent sheet; in the tab fallback minimize is a no-op (and the button is
    // hidden at :318-320).
    const body = permissionJs.match(/function minimize\(\)[\s\S]*?\n}/)[0];
    expect(body).toMatch(/if \(window\.top !== window\.self\)\s*window\.parent\.postMessage\(\{\s*__nostrkey_perm:\s*'minimize'\s*\}/);
    expect(permissionJs).toMatch(/if \(window\.top === window\.self\)[\s\S]*?minimize-btn[\s\S]*?display = 'none'/);
  });
});

describe('CS-06 — bunker chip is claimed-not-verified, never labelled verified', () => {
  it('the bunker host regex requires the "(claimed — not verified)" suffix', () => {
    // permission.js:19 — the only way a bunker claim is parsed is through this RE,
    // which structurally embeds the not-verified caveat.
    expect(permissionJs).toMatch(/BUNKER_HOST_RE = \/\^bunker client \(\.\+\?\)\\s\*\\\(claimed — not verified\\\)\$\//);
  });

  it('the remote-client strip says "claimed, not verified" and never "verified" alone', () => {
    // permission.js:138-140
    expect(permissionJs).toMatch(/claimed, not verified/);
    // guard against a regression that would print a bare "verified" affirmation
    expect(permissionJs).not.toMatch(/client verified|identity verified|is verified/i);
  });
});
