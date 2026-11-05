import { describe, it, expect } from 'vitest';
import { mergeContent, validateField, validateChanges, changedFields, isStale, buildKind0, publishSummary, editableValue } from '../src/profiles/profile-edit.js';
import { buildView } from '../src/profiles/profile-view.js';

describe('mergeContent', () => {
    const base = { name: 'alice', birthday: { year: 1990, month: 2 }, lud06: 'lnurl1abc', custom: [1, { x: 'y' }], displayName: 'Old', username: 'old', bot: false, about: 'hi' };
    it('keeps unknown and deprecated keys exactly, in order, and changes only edits', () => {
        const out = mergeContent(base, { name: 'Alice B', about: '' });
        expect(Object.keys(out)).toEqual(['name', 'birthday', 'lud06', 'custom', 'displayName', 'username', 'bot']);
        expect(out.name).toBe('Alice B');
        for (const k of ['birthday', 'lud06', 'custom', 'displayName', 'username', 'bot']) expect(JSON.stringify(out[k])).toBe(JSON.stringify(base[k]));
        expect(base.about).toBe('hi');
    });
    it('ignores keys that are not editable fields', () => {
        expect(mergeContent({ lud06: 'a' }, { lud06: 'b', __proto__x: 'z' })).toEqual({ lud06: 'a' });
    });
});

describe('validation', () => {
    it('images are https only, lengths are capped, addresses need name@domain', () => {
        expect(validateField('picture', 'http://x.example/a.png')).toMatch(/https/);
        expect(validateField('picture', 'https://u:p@x.example/a.png')).toMatch(/https/);
        expect(validateField('picture', 'https://x.example/a.png')).toBe('');
        expect(validateField('name', 'x'.repeat(101))).toMatch(/100/);
        expect(validateField('nip05', 'nope')).toMatch(/name@domain/);
        expect(validateField('website', 'javascript:alert(1)')).toBeTruthy();
        expect(validateField('about', '')).toBe('');
        expect(validateChanges({ birthday: 'x' })).toHaveProperty('birthday');
    });
});

describe('dirty, stale, build', () => {
    it('only fields that differ count as changes; non-text fields are never edited', () => {
        expect(changedFields({ name: 'a', about: 'b' }, { name: 'a', about: 'c' })).toEqual({ about: 'c' });
        expect(editableValue({ name: 5 }, 'name')).toBeNull();
        expect(changedFields({ name: 5 }, { name: 'x' })).toEqual({});
    });
    it('stale when the newest event is not the loaded one', () => {
        expect(isStale('a', { id: 'a' })).toBe(false);
        expect(isStale('a', { id: 'b' })).toBe(true);
        expect(isStale(null, null)).toBe(false);
        expect(isStale(null, { id: 'b' })).toBe(true);
    });
    it('the new kind 0 is always newer and keeps tags', () => {
        const e = buildKind0({ name: 'a' }, { created_at: 2000, tags: [['t', 'x']] }, 1000);
        expect(e).toEqual({ kind: 0, created_at: 2001, tags: [['t', 'x']], content: '{"name":"a"}' });
        expect(publishSummary(2, 3)).toBe('Published to 2 of 3 relays.');
    });
});

describe('Edit availability', () => {
    it('enabled only when confirmed and unlocked with a reachable signer', () => {
        expect(buildView({ state: 'confirmed', content: {} }).editDisabled).toBe(false);
        expect(buildView({ state: 'confirmed', content: {}, locked: true }).editDisabled).toBe(true);
        const b = buildView({ state: 'confirmed', content: {}, signer: { ready: false, reason: 'Signer away.' } });
        expect(b.editDisabled).toBe(true);
        expect(b.editReason).toBe('Signer away.');
        expect(buildView({ state: 'none' }).createDisabled).toBe(false);
        expect(buildView({ state: 'none', locked: true }).createDisabled).toBe(true);
        expect(buildView({ state: 'partial' }).editDisabled).toBe(true);
    });
});
