/**
 * Security boundary regression tests (audit 2026-07).
 *
 * These assert the trust boundary between a web page and the extension:
 *   - T0-1: a page cannot approve its own consent prompt. The consent sheet may
 *           render in-page, but only as a cross-origin extension iframe the page
 *           cannot script into; Allow/Deny buttons never live in the page DOM.
 *   - T0-2: a page cannot start/stop/inspect a NIP-46 bunker.
 *   - T0-3: a page cannot call exportProfile / exfiltrate the nsec.
 *   - NK-04: consent control messages are gated behind isExtensionSender.
 *   - NK-03: permission grants keyed on full origin.
 *   - NK-5 / NK-6: page-world responses are token-bound and origin-targeted.
 *
 * The extension's runtime (service worker + injected content/page scripts) is
 * not importable in isolation, so these are source-level guards: they fail if a
 * future edit reintroduces a page-reachable privileged surface.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const nostrJs = read('src/nostr.js');
const contentJs = read('src/content.js');
const backgroundJs = read('src/background.js');

describe('T0-3 — exportProfile is not page-reachable', () => {
  it('window.nostr does not expose exportProfile', () => {
    expect(nostrJs).not.toMatch(/async\s+exportProfile\s*\(/);
    expect(nostrJs).not.toMatch(/broadcast\(\s*['"]exportProfile['"]/);
  });

  it('content-script request allowlist excludes exportProfile', () => {
    const allowlist = contentJs.match(/const validEvents = \[([\s\S]*?)\];/)[1];
    expect(allowlist).not.toContain('exportProfile');
  });

  it('exportProfile is a SENSITIVE_KIND (isExtensionSender-gated)', () => {
    const sensitive = backgroundJs.match(/SENSITIVE_KINDS = new Set\(\[([\s\S]*?)\]\)/)[1];
    expect(sensitive).toContain("'exportProfile'");
  });
});

describe('T0-2 — bunkerServer controls are not page-reachable', () => {
  it('window.nostr does not expose a nip46 bunker-control surface', () => {
    expect(nostrJs).not.toMatch(/startBunker/);
    expect(nostrJs).not.toMatch(/bunkerServer\.(start|stop|status)/);
  });

  it('content-script request allowlist excludes bunkerServer.*', () => {
    const allowlist = contentJs.match(/const validEvents = \[([\s\S]*?)\];/)[1];
    expect(allowlist).not.toContain('bunkerServer');
  });

  it('bunkerServer.start/stop/status are SENSITIVE_KINDS', () => {
    const sensitive = backgroundJs.match(/SENSITIVE_KINDS = new Set\(\[([\s\S]*?)\]\)/)[1];
    expect(sensitive).toContain("'bunkerServer.start'");
    expect(sensitive).toContain("'bunkerServer.stop'");
    expect(sensitive).toContain("'bunkerServer.status'");
  });

  it('bunker relay URLs are resolved through an allowlist, not caller input', () => {
    expect(backgroundJs).toMatch(/resolveBunkerRelays/);
    // the raw caller-supplied relayUrls must not be passed straight to BunkerServer
    expect(backgroundJs).not.toMatch(/relayUrls\s*=\s*message\.payload\?\.\s*relayUrls\s*\|\|/);
  });
});

describe('T0-1 / NK-04 — consent cannot be forged by the page', () => {
  it('in-page consent sheet is an extension iframe — never page-DOM Allow/Deny', () => {
    // The sheet may render in the page, but its body is an <iframe> pointed at an
    // extension URL. The Allow/Deny controls live INSIDE that iframe (permission.html),
    // which the page cannot script into. The content script itself must never build
    // clickable consent buttons in the page DOM.
    expect(contentJs).not.toMatch(/nk-btn-allow/);
    expect(contentJs).not.toMatch(/nk-btn-deny/);
    expect(contentJs).toMatch(/function showPermissionSheet/);
    expect(contentJs).toMatch(/<iframe/);
    // The iframe src is assigned from the caller's URL, not built in-page.
    expect(contentJs).toMatch(/querySelector\('iframe'\)\.src = src/);
  });

  it('page→content sheet channel only carries a harmless "minimize" (no consent)', () => {
    // The only postMessage the content script accepts from the iframe is source-checked
    // to the iframe's own contentWindow and limited to hiding the sheet. Consent verbs
    // (allow/deny) never travel this channel — they go permission.js → background,
    // gated by isExtensionSender (see SENSITIVE_KINDS test below).
    expect(contentJs).toMatch(/ev\.source !== iframe\.contentWindow/);
    expect(contentJs).toMatch(/__nostrkey_perm === 'minimize'/);
    expect(contentJs).not.toMatch(/__nostrkey_perm === 'allow/);
    expect(contentJs).not.toMatch(/__nostrkey_perm === 'deny/);
  });

  it('background hands the content script an extension-origin URL, not a decision', () => {
    // ask() may send showPermissionSheet, but the payload is only a getURL() address
    // for permission.html — no signing verb, no "allowed"/"denied". The page receives
    // an opaque URL it forwards to the iframe; it can never forge approval.
    expect(backgroundJs).toMatch(/kind:\s*'showPermissionSheet'/);
    expect(backgroundJs).toMatch(/getURL\(\s*[`'"]permission\/permission\.html/);
    const sheetSend = backgroundJs.match(/kind:\s*'showPermissionSheet',\s*(\w+)\s*\}/);
    expect(sheetSend).not.toBeNull();
    expect(sheetSend[1]).toBe('url'); // sends the url variable only, nothing else
  });

  it('allowed/denied/closePrompt are SENSITIVE_KINDS (extension-sender only)', () => {
    const sensitive = backgroundJs.match(/SENSITIVE_KINDS = new Set\(\[([\s\S]*?)\]\)/)[1];
    expect(sensitive).toContain("'allowed'");
    expect(sensitive).toContain("'denied'");
    expect(sensitive).toContain("'closePrompt'");
  });
});

describe('NK-07 — a framed permission page cannot poison the persistent permission store', () => {
  // permission.html is a web_accessible_resource, so a hostile page can embed the
  // real consent page with attacker-chosen ?host=/&kind= and lure a "remember +
  // Allow" click. complete()/deny() MUST ignore any postback whose payload uuid
  // isn't a live pending request BEFORE writing setPermission — otherwise the
  // attacker pre-authorizes silent signing on the victim's next real visit.
  for (const fn of ['complete', 'deny']) {
    it(`${fn}() guards on a live pending request before setPermission`, () => {
      const body = backgroundJs.match(new RegExp(`function ${fn}\\([\\s\\S]*?\\n}`))[0];
      const guardIdx = body.search(/if \(!sendResponse\) return/);
      const setPermIdx = body.indexOf('setPermission(');
      expect(guardIdx).toBeGreaterThan(-1);            // guard present
      expect(setPermIdx).toBeGreaterThan(-1);          // and there is a write to guard
      expect(setPermIdx).toBeGreaterThan(guardIdx);    // guard comes first
    });
  }
});

describe('NK-08 — in-page consent sheet is isolated + redress-guarded', () => {
  it('injected overlays mount in a CLOSED shadow root on <html>', () => {
    expect(contentJs).toMatch(/attachShadow\(\{\s*mode:\s*'closed'\s*\}\)/);
    expect(contentJs).toMatch(/document\.documentElement\.appendChild\(host\)/);
  });

  it('host compositing props are pinned inline with !important', () => {
    expect(contentJs).toMatch(/setProperty\([^)]*,\s*'important'\)/);
    for (const prop of ['opacity', 'transform', 'filter', 'visibility']) {
      expect(contentJs).toContain(`pin('${prop}'`);
    }
  });

  it('the sheet runs a fail-closed redress guard that escalates to a tab', () => {
    // guard is started when the consent sheet mounts
    expect(contentJs).toMatch(/startSheetGuard\(\)/);
    // it checks re-parenting and ancestor/host suppression
    expect(contentJs).toMatch(/host\.parentNode !== document\.documentElement/);
    expect(contentJs).toMatch(/styleSuppresses\(getComputedStyle\(document\.documentElement\)\)/);
    // on tamper it destroys the surface AND hands off to the redress-immune tab
    expect(contentJs).toMatch(/onSheetCompromised[\s\S]*removePermissionUI\(\)/);
    expect(contentJs).toMatch(/kind:\s*'permissionSheetCompromised'/);
  });

  it('background reopens as a tab only for the tab that hosts the sheet', () => {
    const c = backgroundJs.match(/case 'permissionSheetCompromised':[\s\S]*?return true;/)[0];
    expect(c).toMatch(/_sender\.tab\.id === prompt\.sheetTabId/);
    expect(c).toMatch(/api\.tabs\.create\(\{\s*url\s*\}\)/);
  });
});

describe('NK-03 / NK-5 / NK-6 — page-world hardening', () => {
  it('content script keys permission grants on window.location.origin', () => {
    expect(contentJs).toMatch(/host:\s*window\.location\.origin/);
    expect(contentJs).not.toMatch(/host:\s*window\.location\.host\b/);
  });

  it('page-world response listener checks source and a private channel token', () => {
    expect(nostrJs).toMatch(/message\.source !== window/);
    expect(nostrJs).toMatch(/NK_CHANNEL_TOKEN/);
  });

  it('responses are posted to a specific origin, not "*"', () => {
    expect(contentJs).toMatch(/window\.postMessage\([^)]*window\.location\.origin\s*\)/);
    expect(contentJs).not.toMatch(/window\.postMessage\([^)]*,\s*'\*'\s*\)/);
  });
});
