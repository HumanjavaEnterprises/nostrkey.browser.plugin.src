/**
 * Security tests — isExtensionSender + SENSITIVE_KINDS
 *
 * These tests verify the security hardening from v1.6.1 doesn't
 * break legitimate extension functionality (vault, profiles, etc.)
 */

import { describe, it, expect } from 'vitest';

// ── Replicate the security logic from background.js ──

const SENSITIVE_KINDS = new Set([
  'setPassword', 'changePassword', 'removePassword', 'resetAllData',
  'setAutoLockTimeout', 'setNostrAccessWhileLocked', 'setBlockCrossOriginFrames',
  'backup.export', 'backup.import', 'unlock',
]);

const EXTENSION_ID = 'cggakcmbihnpmcddkkfmoglgaocnmaop';

function isExtensionSender(sender, runtimeId = EXTENSION_ID) {
  if (sender.id !== runtimeId) return false;
  if (sender.tab) {
    const extOrigin = `chrome-extension://${runtimeId}`;
    const url = sender.tab.url || sender.url || '';
    return url.startsWith(extOrigin) || url.startsWith('moz-extension://');
  }
  return true;
}

// ── Tests ──

describe('SENSITIVE_KINDS', () => {
  it('includes password operations', () => {
    expect(SENSITIVE_KINDS.has('setPassword')).toBe(true);
    expect(SENSITIVE_KINDS.has('changePassword')).toBe(true);
    expect(SENSITIVE_KINDS.has('removePassword')).toBe(true);
    expect(SENSITIVE_KINDS.has('unlock')).toBe(true);
  });

  it('includes backup operations', () => {
    expect(SENSITIVE_KINDS.has('backup.export')).toBe(true);
    expect(SENSITIVE_KINDS.has('backup.import')).toBe(true);
  });

  it('includes destructive operations', () => {
    expect(SENSITIVE_KINDS.has('resetAllData')).toBe(true);
  });

  it('does NOT include vault operations (they have their own auth)', () => {
    expect(SENSITIVE_KINDS.has('vault.publish')).toBe(false);
    expect(SENSITIVE_KINDS.has('vault.delete')).toBe(false);
    expect(SENSITIVE_KINDS.has('vault.fetch')).toBe(false);
  });

  it('does NOT include read operations', () => {
    expect(SENSITIVE_KINDS.has('getProfiles')).toBe(false);
    expect(SENSITIVE_KINDS.has('isEncrypted')).toBe(false);
  });
});

describe('isExtensionSender', () => {
  // ── Extension pages (popup, sidepanel) — TRUSTED ──

  it('trusts popup (no tab, correct ID)', () => {
    const sender = { id: EXTENSION_ID };
    expect(isExtensionSender(sender)).toBe(true);
  });

  it('trusts sidepanel (no tab, correct ID)', () => {
    const sender = { id: EXTENSION_ID, url: `chrome-extension://${EXTENSION_ID}/sidepanel.html` };
    expect(isExtensionSender(sender)).toBe(true);
  });

  // ── Extension pages in tabs (vault, profiles, settings) — TRUSTED ──

  it('trusts vault page opened in tab (has tab, extension URL)', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: `chrome-extension://${EXTENSION_ID}/vault/vault.html` },
    };
    expect(isExtensionSender(sender)).toBe(true);
  });

  it('trusts profiles page opened in tab', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: `chrome-extension://${EXTENSION_ID}/profiles/profiles.html` },
    };
    expect(isExtensionSender(sender)).toBe(true);
  });

  it('trusts settings page opened in tab', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: `chrome-extension://${EXTENSION_ID}/full_settings.html` },
    };
    expect(isExtensionSender(sender)).toBe(true);
  });

  it('trusts Firefox extension pages in tabs (moz-extension://)', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: `moz-extension://some-uuid/vault/vault.html` },
    };
    expect(isExtensionSender(sender)).toBe(true);
  });

  // ── Content scripts on web pages — BLOCKED ──

  it('blocks content script on web page (has tab, web URL)', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: 'https://evil-site.com/steal-keys' },
    };
    expect(isExtensionSender(sender)).toBe(false);
  });

  it('blocks content script on nostr web app', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: 'https://snort.social/messages' },
    };
    expect(isExtensionSender(sender)).toBe(false);
  });

  it('blocks content script on localhost', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: 'http://localhost:3000/test' },
    };
    expect(isExtensionSender(sender)).toBe(false);
  });

  // ── Wrong extension ID — BLOCKED ──

  it('blocks messages from different extension', () => {
    const sender = { id: 'some-other-extension-id' };
    expect(isExtensionSender(sender)).toBe(false);
  });

  it('blocks tab with wrong extension ID', () => {
    const sender = {
      id: 'wrong-id',
      tab: { url: `chrome-extension://${EXTENSION_ID}/vault/vault.html` },
    };
    expect(isExtensionSender(sender)).toBe(false);
  });

  // ── Edge cases ──

  it('blocks tab with empty URL', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: '' },
    };
    expect(isExtensionSender(sender)).toBe(false);
  });

  it('blocks tab with no URL property', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: {},
    };
    expect(isExtensionSender(sender)).toBe(false);
  });

  it('handles sender.url fallback when tab.url is missing', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: {},
      url: `chrome-extension://${EXTENSION_ID}/vault/vault.html`,
    };
    expect(isExtensionSender(sender)).toBe(true);
  });
});

describe('message routing security', () => {
  function wouldBlock(kind, sender) {
    return SENSITIVE_KINDS.has(kind) && !isExtensionSender(sender);
  }

  it('allows unlock from popup', () => {
    expect(wouldBlock('unlock', { id: EXTENSION_ID })).toBe(false);
  });

  it('allows unlock from vault page in tab', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: `chrome-extension://${EXTENSION_ID}/vault/vault.html` },
    };
    expect(wouldBlock('unlock', sender)).toBe(false);
  });

  it('blocks unlock from web page content script', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: 'https://evil.com' },
    };
    expect(wouldBlock('unlock', sender)).toBe(true);
  });

  it('allows vault.publish from any extension context (not in SENSITIVE_KINDS)', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: 'https://some-nostr-app.com' },
    };
    // vault.publish is not sensitive — it has its own auth via encrypted storage
    expect(wouldBlock('vault.publish', sender)).toBe(false);
  });

  it('blocks setPassword from web page', () => {
    const sender = {
      id: EXTENSION_ID,
      tab: { url: 'https://evil.com/phishing' },
    };
    expect(wouldBlock('setPassword', sender)).toBe(true);
  });

  it('allows setPassword from sidepanel', () => {
    expect(wouldBlock('setPassword', { id: EXTENSION_ID })).toBe(false);
  });
});
