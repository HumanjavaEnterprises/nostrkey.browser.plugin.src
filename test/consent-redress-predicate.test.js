/**
 * Redress suppression predicate decision-table (styleSuppresses)
 *
 * Use cases: CS-15 / CS-16 (consent-sheet redress / clickjacking defense).
 *
 * APPROACH: LOGIC MIRROR. This is a genuine Ring-1 test of the pure decision
 * table inside styleSuppresses — WHICH CSS properties are treated as evidence
 * that our consent surface has been suppressed by a hostile page. It runs the
 * verbatim predicate over synthetic plain-object "computed styles".
 *
 * It is explicitly NOT a claim to detect real compositing / occlusion. jsdom
 * cannot resolve filter/opacity compositing, stacking, or visual occlusion;
 * getComputedStyle does not composite. The real MutationObserver +
 * getComputedStyle occlusion behavior (sheetLooksCompromised wiring, actual
 * teardown, redress over a live page) stays Ring-2 (e2e) / Ring-3 (manual) and
 * is intentionally out of scope here.
 *
 * The function below is copied VERBATIM from src/content.js:450-465.
 * If content.js changes, this mirror must be re-synced or it stops testing the
 * shipped predicate.
 */

import { describe, it, expect } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// VERBATIM MIRROR of styleSuppresses — src/content.js:450-465
// ─────────────────────────────────────────────────────────────────────────────
function styleSuppresses(cs) {
    if (!cs) return true;
    return parseFloat(cs.opacity) < 0.9
        || cs.visibility !== 'visible'
        || cs.display === 'none'
        || cs.pointerEvents === 'none'
        || cs.filter !== 'none'
        || cs.transform !== 'none'
        || cs.mixBlendMode !== 'normal'
        || cs.clipPath !== 'none'
        || cs.perspective !== 'none'
        || cs.contentVisibility === 'hidden'
        || (cs.mask && cs.mask !== 'none')
        || (cs.webkitMask && cs.webkitMask !== 'none')
        || (cs.backdropFilter && cs.backdropFilter !== 'none');
}
// ─────────────────────────────────────────────────────────────────────────────

// A fully-visible, trusted surface: every field set to its benign value.
function fullyVisible() {
    return {
        opacity: '1',
        visibility: 'visible',
        display: 'block',
        pointerEvents: 'auto',
        filter: 'none',
        transform: 'none',
        mixBlendMode: 'normal',
        clipPath: 'none',
        perspective: 'none',
        contentVisibility: 'visible',
        mask: 'none',
        webkitMask: 'none',
        backdropFilter: 'none',
    };
}

describe('styleSuppresses — trusted baseline (surface is fully visible)', () => {
    it('returns false for a fully-visible surface', () => {
        expect(styleSuppresses(fullyVisible())).toBe(false);
    });

    it('does NOT false-positive when filter/transform explicitly "none" with opacity 1', () => {
        // A legitimate sheet must not be torn down just because these keys exist.
        const cs = { ...fullyVisible(), filter: 'none', transform: 'none', opacity: '1' };
        expect(styleSuppresses(cs)).toBe(false);
    });
});

describe('styleSuppresses — opacity threshold (< 0.9, content.js:452)', () => {
    it('opacity 0.5 (dimmed redress) → suppressed', () => {
        expect(styleSuppresses({ ...fullyVisible(), opacity: '0.5' })).toBe(true);
    });

    it('opacity 0.02 (classic near-invisible redress) → suppressed', () => {
        expect(styleSuppresses({ ...fullyVisible(), opacity: '0.02' })).toBe(true);
    });

    it('opacity 0.95 (above threshold) → NOT suppressed', () => {
        expect(styleSuppresses({ ...fullyVisible(), opacity: '0.95' })).toBe(false);
    });

    it('opacity exactly 0.9 (boundary, not < 0.9) → NOT suppressed', () => {
        expect(styleSuppresses({ ...fullyVisible(), opacity: '0.9' })).toBe(false);
    });
});

describe('styleSuppresses — each single suppressor independently trips', () => {
    // Each case starts from a fully-visible baseline and flips exactly ONE
    // property, so a passing result is attributable to that property alone.
    const cases = [
        ['visibility hidden', { visibility: 'hidden' }],
        ['display none', { display: 'none' }],
        ['pointerEvents none', { pointerEvents: 'none' }],
        ['filter blur(2px)', { filter: 'blur(2px)' }],
        ['transform scale(0)', { transform: 'scale(0)' }],
        ['mixBlendMode multiply', { mixBlendMode: 'multiply' }],
        ['clipPath inset(100%)', { clipPath: 'inset(100%)' }],
        ['perspective 500px', { perspective: '500px' }],
        ['contentVisibility hidden', { contentVisibility: 'hidden' }],
        ['mask set', { mask: 'url(#m)' }],
        ['webkitMask set', { webkitMask: 'url(#m)' }],
        ['backdropFilter set', { backdropFilter: 'blur(4px)' }],
    ];

    for (const [label, override] of cases) {
        it(`${label} → suppressed`, () => {
            expect(styleSuppresses({ ...fullyVisible(), ...override })).toBe(true);
        });
    }
});

describe('styleSuppresses — fail-closed on missing style (content.js:451)', () => {
    it('null computed style → suppressed (fail-closed)', () => {
        expect(styleSuppresses(null)).toBe(true);
    });

    it('undefined computed style → suppressed (fail-closed)', () => {
        expect(styleSuppresses(undefined)).toBe(true);
    });
});
