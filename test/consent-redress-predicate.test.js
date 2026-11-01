/**
 * The check the content script makes on a computed style to decide whether the
 * consent sheet can still be seen. It runs here as shipped, taken from the source
 * of src/content.js, over plain objects: which properties count, not how a browser
 * composites them. The browser half is in test/e2e/consent-redress.e2e.spec.js.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve('src/content.js'), 'utf8');
const body = source.match(/function styleSuppresses\(cs\) \{[\s\S]*?\n\}/)?.[0];
// eslint-disable-next-line no-eval
const styleSuppresses = (0, eval)(`(${body})`);

const VISIBLE = {
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

const check = (changes) => !!styleSuppresses({ ...VISIBLE, ...changes });

describe('styleSuppresses', () => {
    it('passes a fully visible surface', () => {
        expect(check({})).toBe(false);
    });

    it('passes a browser with no mask or backdrop-filter properties', () => {
        expect(check({ mask: undefined, webkitMask: undefined, backdropFilter: undefined })).toBe(false);
    });

    it.each([['1', false], ['0.95', false], ['0.9', false], ['0.89', true], ['0.5', true], ['0.02', true]])(
        'at opacity %s: %s', (opacity, expected) => {
            expect(check({ opacity })).toBe(expected);
        },
    );

    it.each([
        ['visibility', 'hidden'],
        ['display', 'none'],
        ['pointerEvents', 'none'],
        ['filter', 'blur(2px)'],
        ['transform', 'scale(0)'],
        ['mixBlendMode', 'multiply'],
        ['clipPath', 'inset(100%)'],
        ['perspective', '500px'],
        ['contentVisibility', 'hidden'],
        ['mask', 'url(#m)'],
        ['webkitMask', 'url(#m)'],
        ['backdropFilter', 'blur(4px)'],
    ])('%s: %s alone counts', (property, value) => {
        expect(check({ [property]: value })).toBe(true);
    });

    it.each([[null], [undefined]])('with no style to read (%s) it assumes the worst', (style) => {
        expect(styleSuppresses(style)).toBe(true);
    });
});
