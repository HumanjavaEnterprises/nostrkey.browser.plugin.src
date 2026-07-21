/**
 * consent-kind-tiers.test.js — Kind/method readout tiers + rememberability.
 *
 * Real import of src/permission/kind-labels.js (CS-01 consequence-first labels,
 * CS-02/CS-06 Tier-B non-rememberable gate, and the loud unknown-kind decode
 * warning). describeKind/describeMethod are pure, BUT kind-labels.js imports
 * { KINDS } from ../utilities/utils, and utils.js reads api.storage.local at
 * module top (utils.js:15). So a fake `chrome` MUST be installed on globalThis
 * BEFORE the dynamic import, exactly like storage-at-rest.test.js does.
 */

import { describe, it, expect } from 'vitest';
import { installFakeChrome } from './helpers/fake-chrome.js';

// Install the fake namespace FIRST so browser-polyfill (pulled in transitively
// by utils.js) binds to it, then load the real module under test.
installFakeChrome();

const { describeKind, describeMethod } =
  await import('../src/permission/kind-labels.js');

describe('CS-01 — consequence-first labels for common kinds', () => {
  it('describeKind(1) → neutral, rememberable, known, "Publish a public note"', () => {
    const d = describeKind(1);
    expect(d.risk).toBe('neutral');
    expect(d.rememberable).toBe(true);
    expect(d.known).toBe(true);
    expect(d.label).toBe('Publish a public note');
  });

  it('describeKind(3) → warn, and the label names the contact/follow-list replacement (src:21)', () => {
    const d = describeKind(3);
    expect(d.risk).toBe('warn');
    expect(d.known).toBe(true);
    // src line 21: 'Replace your contact/follow list' — the consequence, not "kind 3".
    expect(d.label).toBe('Replace your contact/follow list');
    expect(d.label).not.toMatch(/kind\s*3/i);
    expect(d.label.toLowerCase()).toContain('follow');
  });
});

describe('CS-02 / CS-06 — Tier-B kinds can never be remembered', () => {
  it('describeKind(5) → danger, rememberable FALSE, "Delete events" (delete is never durable)', () => {
    const d = describeKind(5);
    expect(d.risk).toBe('danger');
    expect(d.rememberable).toBe(false);
    expect(d.label).toBe('Delete events');
    expect(d.known).toBe(true);
  });

  it('gift-wrap (1059) and NIP-04 DM (4) are non-neutral (Tier-B-ish → warn)', () => {
    const wrap = describeKind(1059);
    expect(wrap.risk).toBe('warn');
    expect(wrap.risk).not.toBe('neutral');

    const dm = describeKind(4);
    expect(dm.risk).toBe('warn');
    expect(dm.risk).not.toBe('neutral');
  });
});

describe('CS-06 — unknown kinds are said LOUDLY and never remembered', () => {
  it('describeKind(987654) → known false, warn, not rememberable, echoes the raw number', () => {
    const d = describeKind(987654);
    expect(d.known).toBe(false);
    expect(d.risk).toBe('warn');
    expect(d.rememberable).toBe(false);
    // kind-labels.js:82-90 — the loud copy must literally contain the number.
    expect(d.warning).toContain('987654');
    expect(d.warning.toLowerCase()).toContain('does not recognize kind');
    expect(d.label).toContain('987654');
  });

  it('a NIP-table-known-but-uncurated kind → neutral, rememberable, known (fallback branch :78-79)', () => {
    // Kind 2 ("Recommend Relay") is in the KINDS NIP table but NOT in the
    // curated KIND_LABELS map — it must hit the spec fallback.
    const d = describeKind(2);
    expect(d.known).toBe(true);
    expect(d.risk).toBe('neutral');
    expect(d.rememberable).toBe(true);
    // Label comes from the NIP table (spec[1]), not the "Unknown kind" copy.
    expect(d.label).toBe('Recommend Relay');
    expect(d.label).not.toMatch(/unknown/i);
  });
});

describe('describeMethod — recognized vs bogus methods', () => {
  it('a recognized method returns a human label distinct from the raw permission string', () => {
    // permission.js:69 feeds the internal permission string (e.g. "getPubKey").
    const d = describeMethod('getPubKey');
    expect(d.label).toBe('Read your public key');
    expect(d.label).not.toBe('getPubKey');
    expect(d.risk).toBe('neutral');
  });

  it('an unrecognized method → warn + a warning (forces always-ask in permission.js)', () => {
    const d = describeMethod('someBogusMethod');
    expect(d.risk).toBe('warn');
    expect(d.warning).toBeTruthy();
    expect(typeof d.warning).toBe('string');
    // The default branch echoes the raw perm as the label (String(perm)).
    expect(d.label).toBe('someBogusMethod');
  });
});

describe('every describeKind result carries a nip URL string', () => {
  it('known, curated-only, and unknown kinds all return a string nip (defaulting to the NIPs index)', () => {
    const known = describeKind(1); // in KINDS → blob url
    expect(typeof known.nip).toBe('string');
    expect(known.nip).toMatch(/^https?:\/\//);

    // 1059 is curated but NOT in the KINDS NIP table → nip defaults to the index.
    const curatedNoSpec = describeKind(1059);
    expect(typeof curatedNoSpec.nip).toBe('string');
    expect(curatedNoSpec.nip).toBe('https://github.com/nostr-protocol/nips');

    const unknown = describeKind(987654);
    expect(typeof unknown.nip).toBe('string');
    expect(unknown.nip).toBe('https://github.com/nostr-protocol/nips');
  });
});
