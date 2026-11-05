import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { clampRememberFor, maxRememberFor, rememberLimit, grantValue, resolveGrant, grantState, REMEMBER_ORDER } from '../src/utilities/consent-policy.js';

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
    it('the maximum is always a known duration', () => {
        for (const m of ['signEvent', 'nip44.decrypt', 'getPubKey'])
            expect(REMEMBER_ORDER).toContain(maxRememberFor(m));
    });
    it('the worker clamps by the request kind before storing', () => {
        const src = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');
        expect(src).toMatch(/clampRememberFor\(asked, maxRememberFor\(method, key\)\)/);
        expect(src).toMatch(/allowToRemember\(rememberFor, origKind, held\.key\)/);
    });
});

describe('reading messages and direct messages are remembered for at most 30 days', () => {
    const DM_KINDS = [4, 13, 14, 1059];
    it('decrypt is capped at 30 days', () => {
        for (const m of ['nip04.decrypt', 'nip44.decrypt']) {
            expect(maxRememberFor(m, m)).toBe('30d');
            expect(rememberLimit(m, m)).toBe('30d');
        }
    });
    it('direct message kinds are capped at 30 days', () => {
        for (const k of DM_KINDS) {
            expect(maxRememberFor('signEvent', `signEvent:${k}`)).toBe('30d');
            expect(rememberLimit(`signEvent:${k}`, 'signEvent')).toBe('30d');
        }
    });
    it('other requests keep Forever', () => {
        expect(rememberLimit('signEvent:1', 'signEvent')).toBe('forever');
        expect(rememberLimit('nip44.encrypt', 'nip44.encrypt')).toBe('forever');
        expect(rememberLimit('getPubKey', 'getPubKey')).toBe('forever');
        expect(maxRememberFor('signEvent', null)).toBe('forever');
    });
    it('a request that always asks offers nothing', () => {
        expect(rememberLimit('signEvent:5', 'signEvent')).toBeNull();
        expect(rememberLimit('signEvent:24242:delete', 'signEvent')).toBeNull();
    });
    it('a Forever asked for decrypt or a DM is stored as a 30 day allow', () => {
        const now = 1_700_000_000;
        for (const [method, key] of [['nip44.decrypt', 'nip44.decrypt'], ['signEvent', 'signEvent:4'], ['signEvent', 'signEvent:1059']]) {
            const kept = clampRememberFor('forever', maxRememberFor(method, key));
            expect(grantValue(kept, now)).toEqual({ v: 'allow', exp: now + 30 * 86400, d: '30d' });
        }
        expect(grantValue(clampRememberFor('forever', maxRememberFor('signEvent', 'signEvent:1')), now)).toBe('allow');
    });
    it('a Forever grant stored before the cap still answers', () => {
        for (const key of ['nip04.decrypt', 'nip44.decrypt', 'signEvent:4', 'signEvent:14']) {
            expect(resolveGrant('allow', 1_700_000_000)).toBe('allow');
            expect(grantState(key, 'allow')).toBe('allow');
        }
    });
    it('the prompt is told the longest it may offer', () => {
        const src = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');
        expect(src).toMatch(/maxDuration: rememberLimit\(shownKey, kind\) \|\| ''/);
    });
});
