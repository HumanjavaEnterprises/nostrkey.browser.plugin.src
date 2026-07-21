/**
 * consent-readout-logic.test.js — LOGIC MIRROR of the pure helpers inside
 * src/permission/permission.js (the signing-approval readout).
 *
 * permission.js imports ../utilities/browser-polyfill at the top (permission.js:1)
 * and is DOM/querySelector-driven, so it is NOT cleanly importable. Following the
 * project's logic-mirror convention (see test/security.test.js), each helper is
 * copied VERBATIM from current source with a comment citing the source line range,
 * and the copy is exercised with literal event objects (no keys, no secrets).
 *
 * Covers CS-01 (skew / decode / preview signals) and the CS-02/CS-06 Tier-B
 * rememberable gate, as computed on the readout side.
 */

import { describe, it, expect } from 'vitest';

// ── Mirror 1: bunkerClaim (permission.js:19-24) ────────────────────────────
// Inbound NIP-46 bunker requests arrive with a synthesized host string built in
// background.js: `bunker client <pk12>… (claimed — not verified)`.
const BUNKER_HOST_RE = /^bunker client (.+?)\s*\(claimed — not verified\)$/;

function bunkerClaim(host) {
    const m = typeof host === 'string' ? host.match(BUNKER_HOST_RE) : null;
    return m ? m[1] : null;
}

// ── Mirror 2: timestampInfo (permission.js:44-51) ──────────────────────────
function timestampInfo(event) {
    const ts = event?.created_at;
    if (typeof ts !== 'number' || !Number.isFinite(ts)) return null;
    const skewSec = Math.round(ts - Date.now() / 1000);
    const iso = new Date(ts * 1000).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
    const suspicious = Math.abs(skewSec) > 900; // > 15 min from now
    return { iso, skewSec, suspicious };
}

// ── Mirror 3: eventKindInfo decode-error branch (permission.js:27-41) ───────
// Reproduces ONLY the guard + the danger object it returns. The non-error path
// delegates to describeKind() (covered by the kind-labels cluster); here it
// returns null so this mirror never silently diverges from that delegation.
function eventKindInfoDecodeBranch(permission, decodeError, event) {
    if (permission !== 'signEvent') return null;
    if (decodeError || !event || typeof event !== 'object') {
        return {
            kind: NaN,
            label: 'Cannot decode this event',
            risk: 'danger',
            rememberable: false,
            known: false,
            nip: 'https://github.com/nostr-protocol/nips',
            warning: 'NostrKey could not decode this event. Signing it is signing something you cannot read.',
        };
    }
    return null; // real source: return describeKind(state.event.kind)
}

// ── Mirror 4: content-preview branch chain (permission.js:165-177) ─────────
function contentPreview(decodeError, event) {
    if (decodeError || !event || typeof event !== 'object') {
        return '(cannot decode — see raw payload below)';
    } else if (typeof event.content !== 'string') {
        return '(content is not text — inspect the raw JSON)';
    } else if (event.content.length === 0) {
        return '(no content)';
    } else {
        const c = event.content;
        return c.length > 400 ? `${c.slice(0, 400)}…` : c;
    }
}

// ── Mirror 5: renderPatchPoint rememberable computation (permission.js:193-208) ─
function computeRememberable(permission, methodInfo, kindInfo, isSigningEvent, decodeError) {
    let rememberable = true;
    if (isSigningEvent) {
        rememberable = !!kindInfo?.rememberable && !decodeError;
    } else if (methodInfo.label === String(permission) && methodInfo.risk === 'warn') {
        rememberable = false; // unrecognized method
    }
    return rememberable;
}

// ───────────────────────────────────────────────────────────────────────────

describe('bunkerClaim (permission.js:19-24)', () => {
    it('extracts the claimed key from a synthesized bunker host', () => {
        const host = 'bunker client abc123def456… (claimed — not verified)';
        expect(bunkerClaim(host)).toBe('abc123def456…');
    });

    it('returns null for a normal web origin (chip shows ONLY for bunker requests)', () => {
        expect(bunkerClaim('https://example.com')).toBeNull();
    });

    it('returns null for a non-string host', () => {
        expect(bunkerClaim(undefined)).toBeNull();
        expect(bunkerClaim(null)).toBeNull();
    });
});

describe('timestampInfo (permission.js:44-51)', () => {
    it('flags a far-future created_at as suspicious with the right skew (>900s gate)', () => {
        const now = Math.floor(Date.now() / 1000);
        const info = timestampInfo({ created_at: now + 1200 });
        expect(info).not.toBeNull();
        expect(info.suspicious).toBe(true);
        // skewSec is now+1200 minus the current second at call time → ~1200
        expect(info.skewSec).toBeGreaterThan(1100);
        expect(info.skewSec).toBeLessThanOrEqual(1200);
        expect(info.skewSec).toBeGreaterThan(900);
    });

    it('does NOT flag a created_at only 60s ahead (inside the 900s gate)', () => {
        const now = Math.floor(Date.now() / 1000);
        const info = timestampInfo({ created_at: now + 60 });
        expect(info).not.toBeNull();
        expect(info.suspicious).toBe(false);
    });

    it('returns null when created_at is not a finite number (no timestamp row)', () => {
        expect(timestampInfo({ created_at: 'soon' })).toBeNull();
        expect(timestampInfo({ created_at: Infinity })).toBeNull();
        expect(timestampInfo({ created_at: NaN })).toBeNull();
        expect(timestampInfo({})).toBeNull();
    });
});

describe('eventKindInfo decode-error branch (permission.js:27-41)', () => {
    it('an undecodable event is Tier-B: danger risk, never rememberable', () => {
        const info = eventKindInfoDecodeBranch('signEvent', true, null);
        expect(info).not.toBeNull();
        expect(info.risk).toBe('danger');
        expect(info.rememberable).toBe(false);
        expect(info.label).toBe('Cannot decode this event');
    });

    it('warns that signing an undecodable event is signing something unreadable', () => {
        const info = eventKindInfoDecodeBranch('signEvent', true, null);
        expect(info.warning).toContain('you cannot read');
    });

    it('also triggers the danger object when the event is a non-object', () => {
        const info = eventKindInfoDecodeBranch('signEvent', false, 'not-an-object');
        expect(info).not.toBeNull();
        expect(info.rememberable).toBe(false);
        expect(info.risk).toBe('danger');
    });

    it('returns null (no readout) for non-signEvent methods', () => {
        expect(eventKindInfoDecodeBranch('getPubKey', true, null)).toBeNull();
    });
});

describe('content-preview truncation (permission.js:165-177)', () => {
    it('truncates 500-char content to first 400 chars + ellipsis (length 401)', () => {
        const content = 'a'.repeat(500);
        const out = contentPreview(false, { content });
        expect(out.length).toBe(401);
        expect(out.endsWith('…')).toBe(true);
        expect(out.slice(0, 400)).toBe('a'.repeat(400));
    });

    it('leaves exactly-400-char content unchanged (no ellipsis at the boundary)', () => {
        const content = 'b'.repeat(400);
        const out = contentPreview(false, { content });
        expect(out).toBe(content);
        expect(out.length).toBe(400);
    });

    it('renders empty content as "(no content)"', () => {
        expect(contentPreview(false, { content: '' })).toBe('(no content)');
    });

    it('renders non-string content as the "not text" notice', () => {
        const out = contentPreview(false, { content: { some: 'object' } });
        expect(out.startsWith('(content is not text')).toBe(true);
    });

    it('renders undecodable payloads with the raw-payload pointer', () => {
        expect(contentPreview(true, null)).toBe('(cannot decode — see raw payload below)');
    });
});

describe('renderPatchPoint rememberable gating (permission.js:193-208)', () => {
    // kindInfo objects mirror describeKind() output from kind-labels.js:
    //   kind 5 (Delete events) → { rememberable: false, risk: 'danger' }
    //   kind 1 (Publish a public note) → { rememberable: true, risk: 'neutral' }
    const kind5 = { kind: 5, rememberable: false, risk: 'danger' };
    const kind1 = { kind: 1, rememberable: true, risk: 'neutral' };
    const decodeDanger = { kind: NaN, rememberable: false, risk: 'danger' };
    const signMethod = { label: 'Sign an event', risk: 'neutral' };

    it('signEvent + kind 5 (delete) is NOT rememberable — patch disabled', () => {
        expect(computeRememberable('signEvent', signMethod, kind5, true, false)).toBe(false);
    });

    it('signEvent with decodeError is NOT rememberable even when kindInfo IS rememberable', () => {
        // Use a rememberable kindInfo (kind 1) so the `&& !decodeError` clause is
        // load-bearing: if that clause were dropped, `!!true` would make this pass
        // as rememberable. decodeError:true must still force false.
        expect(computeRememberable('signEvent', signMethod, kind1, true, true)).toBe(false);
    });

    it('signEvent + kind 1 (public note) IS rememberable — patch enabled', () => {
        expect(computeRememberable('signEvent', signMethod, kind1, true, false)).toBe(true);
    });

    it('a warn-risk unrecognized method is NOT rememberable', () => {
        // describeMethod() default: { label: String(perm), risk: 'warn' }
        const perm = 'someWeirdMethod';
        const unknownMethod = { label: perm, risk: 'warn' };
        expect(computeRememberable(perm, unknownMethod, null, false, false)).toBe(false);
    });

    it('a recognized non-signing method (label != raw perm) stays rememberable', () => {
        // e.g. getRelays → { label: 'Read your relay list', risk: 'neutral' }
        const method = { label: 'Read your relay list', risk: 'neutral' };
        expect(computeRememberable('getRelays', method, null, false, false)).toBe(true);
    });
});
