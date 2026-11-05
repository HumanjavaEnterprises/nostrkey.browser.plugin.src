import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { clampRememberFor, maxRememberFor, REMEMBER_ORDER } from '../src/utilities/consent-policy.js';

describe('a remembered allow never outlasts the kind maximum', () => {
    it('cuts a longer duration down to the maximum', () => {
        expect(clampRememberFor('forever', '1d')).toBe('1d');
        expect(clampRememberFor('30d', '1h')).toBe('1h');
    });
    it('keeps a duration within the maximum', () => {
        expect(clampRememberFor('1h', '30d')).toBe('1h');
        for (const d of REMEMBER_ORDER) expect(clampRememberFor(d, 'forever')).toBe(d);
    });
    it('does not remember anything that is not a known duration', () => {
        for (const bad of ['7d', '', null, undefined, 3600, '__proto__', {}, 'Forever'])
            expect(clampRememberFor(bad, 'forever')).toBeNull();
    });
    it('does not remember when the maximum itself is not known', () => {
        expect(clampRememberFor('1h', undefined)).toBeNull();
        expect(clampRememberFor('1h', 'never')).toBeNull();
    });
    it('every kind may be remembered forever until per-kind limits arrive', () => {
        for (const m of ['signEvent', 'nip44.decrypt', 'getPubKey'])
            expect(REMEMBER_ORDER).toContain(maxRememberFor(m));
    });
    it('the worker clamps by the request kind before storing', () => {
        const src = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');
        expect(src).toMatch(/clampRememberFor\(asked, maxRememberFor\(method\)\)/);
        expect(src).toMatch(/allowToRemember\(rememberFor, origKind\)/);
    });
});
