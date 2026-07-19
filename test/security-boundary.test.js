/**
 * Security boundary regression tests (audit 2026-07).
 *
 * These assert the trust boundary between a web page and the extension:
 *   - T0-1: a page cannot approve its own consent prompt (no in-page consent).
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
  it('content script no longer renders an in-page Allow/Deny consent sheet', () => {
    expect(contentJs).not.toMatch(/nk-btn-allow/);
    expect(contentJs).not.toMatch(/function showPermissionSheet/);
    expect(contentJs).not.toMatch(/kind === 'showPermissionSheet'/);
  });

  it('background does not send showPermissionSheet to a content script', () => {
    expect(backgroundJs).not.toMatch(/kind:\s*'showPermissionSheet'/);
  });

  it('allowed/denied/closePrompt are SENSITIVE_KINDS (extension-sender only)', () => {
    const sensitive = backgroundJs.match(/SENSITIVE_KINDS = new Set\(\[([\s\S]*?)\]\)/)[1];
    expect(sensitive).toContain("'allowed'");
    expect(sensitive).toContain("'denied'");
    expect(sensitive).toContain("'closePrompt'");
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
