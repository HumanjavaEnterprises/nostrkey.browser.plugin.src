// @vitest-environment jsdom
/**
 * The profile tab, read-only: what each profile.fetch state shows, how field
 * checks read (mark plus words, never colour alone), editing stays locked, and
 * the tab-per-identity opener.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    buildView, renderView, fieldStatus, pubkeyFromSearch, openProfileTab, MESSAGES, PRIVACY_NOTE,
    headerText, previewUrl,
} from '../src/profiles/profile-view.js';

const html = readFileSync(resolve('src/profile.html'), 'utf8');
const PK = 'a'.repeat(64);

beforeEach(() => {
    document.documentElement.innerHTML = html.replace(/^<!doctype html>/i, '');
});

const show = (o) => { renderView(document, buildView(o)); return document; };
const row = (key) => document.querySelector(`.pd-field[data-field="${key}"]`);

describe('confirmed', () => {
    const content = { name: 'alice', picture: 'https://img.example/a.png', nip05: 'a@b.example', lud16: 'a@w.example' };

    it('shows "?" Checking on every set field while checks run', () => {
        show({ state: 'confirmed', content, checks: null });
        for (const k of Object.keys(content)) {
            expect(row(k).querySelector('.pd-mark').textContent).toBe('?');
            expect(row(k).querySelector('.pd-status-text').textContent).toBe('Checking');
        }
        expect(row('about').querySelector('.pd-status-text').textContent).toBe('Not set');
    });

    it('shows a check when confirmed and "!" when a check fails, each with words', () => {
        show({ state: 'confirmed', content, checks: {
            name: { status: 'confirmed', label: 'From your profile' },
            picture: { status: 'mismatch', label: "Image doesn't load" },
            nip05: { status: 'verified', label: 'Points to this key' },
            lud16: { status: 'unverified', label: "Couldn't verify" },
        } });
        expect(row('name').dataset.tone).toBe('ok');
        expect(row('nip05').querySelector('.pd-mark').textContent).toBe('✓');
        expect(row('picture').querySelector('.pd-mark').textContent).toBe('!');
        expect(row('picture').querySelector('.pd-status-text').textContent).toBe("Image doesn't load");
        expect(row('lud16').querySelector('.pd-mark').textContent).toBe('?');
        for (const m of document.querySelectorAll('.pd-mark')) expect(m.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders relay content as text, never markup', () => {
        show({ state: 'confirmed', content: { name: '<img src=x onerror=alert(1)>' }, checks: {} });
        expect(document.querySelector('.pd-fields img')).toBeNull();
        expect(row('name').querySelector('.pd-field-value').textContent).toContain('<img');
    });

    it('enables Edit when unlocked, with no create offer', () => {
        show({ state: 'confirmed', content, checks: {} });
        expect(document.getElementById('pd-edit').disabled).toBe(false);
        expect(document.getElementById('pd-create').hidden).toBe(true);
        expect(document.getElementById('pd-retry').hidden).toBe(true);
    });
});

describe('none', () => {
    it('offers Create your profile, active when unlocked', () => {
        show({ state: 'none' });
        const create = document.getElementById('pd-create');
        expect(create.hidden).toBe(false);
        expect(create.disabled).toBe(false);
        expect(document.getElementById('pd-fields').hidden).toBe(true);
        expect(document.getElementById('pd-message').textContent).toBe(MESSAGES.none);
    });
});

describe.each(['partial', 'unreachable'])('%s', (state) => {
    it('keeps every field "?", locks editing and offers Retry', () => {
        show({ state });
        expect(document.getElementById('pd-message').textContent)
            .toBe("Couldn't reach your relays. Editing is locked so nothing gets overwritten.");
        expect(document.getElementById('pd-retry').hidden).toBe(false);
        expect(document.getElementById('pd-create').hidden).toBe(true);
        expect(document.getElementById('pd-edit').disabled).toBe(true);
        const marks = [...document.querySelectorAll('.pd-mark')].map(m => m.textContent);
        expect(marks.length).toBeGreaterThan(0);
        expect(marks.every(m => m === '?')).toBe(true);
    });
});

describe('extension locked', () => {
    it('still renders the profile, says why Edit is unavailable', () => {
        show({ state: 'confirmed', content: { name: 'alice' }, checks: {}, locked: true });
        expect(row('name')).not.toBeNull();
        expect(document.getElementById('pd-locked').hidden).toBe(false);
        expect(document.getElementById('pd-edit').disabled).toBe(true);
        expect(document.getElementById('pd-edit-reason').textContent).toMatch(/Unlock/);
    });
});

describe('page text', () => {
    it('carries the image privacy note and no em-dashes', () => {
        expect(document.getElementById('pd-privacy').textContent).toBe(PRIVACY_NOTE);
        const all = [html, ...Object.values(MESSAGES), readFileSync(resolve('src/profiles/profile-view.js'), 'utf8')].join('\n');
        expect(all).not.toMatch(/—|&mdash;/);
    });

    it('fieldStatus never returns a tone without words', () => {
        for (const s of ['verified', 'confirmed', 'mismatch', 'invalid', 'unverified', 'x']) {
            expect(fieldStatus({ status: s }).text.length).toBeGreaterThan(0);
        }
        expect(fieldStatus(null).text).toBe('Not checked');
    });
});

describe('identity in the URL', () => {
    it('accepts only a 64-char hex pubkey', () => {
        expect(pubkeyFromSearch(`?pubkey=${PK.toUpperCase()}`)).toBe(PK);
        expect(pubkeyFromSearch('?pubkey=npub1xyz')).toBeNull();
        expect(pubkeyFromSearch('')).toBeNull();
        show({ state: 'invalid' });
        expect(document.getElementById('pd-message').textContent).toBe(MESSAGES.invalid);
    });
});

describe('openProfileTab', () => {
    let a_urls = {};
    const fakeApi = () => {
        a_urls = {};
        const store = {};
        const open = new Set();
        let next = 1;
        return {
            open,
            runtime: { getURL: (p) => `chrome-extension://id/${p}` },
            storage: { local: {
                get: async (k) => ({ [k]: store[k] }),
                set: async (o) => Object.assign(store, o),
            } },
            tabs: {
                create: vi.fn(async ({ url }) => { const id = next++; open.add(id); return { id, url, windowId: 1 }; }),
                urls: {},
                get: async (id) => { if (!open.has(id)) throw new Error('gone'); return { id, windowId: 1, url: a_urls[id] }; },
                update: vi.fn(async () => ({})),
            },
            windows: { update: vi.fn(async () => ({})) },
        };
    };

    it('opens one tab per identity and focuses it the second time', async () => {
        const a = fakeApi();
        const first = await openProfileTab(a, PK);
        expect(a.tabs.create).toHaveBeenCalledWith({ url: `chrome-extension://id/profile.html?pubkey=${PK}` });
        expect(await openProfileTab(a, PK)).toBe(first);
        expect(a.tabs.create).toHaveBeenCalledTimes(1);
        expect(a.tabs.update).toHaveBeenCalledWith(first, { active: true });
        const other = await openProfileTab(a, 'b'.repeat(64));
        expect(other).not.toBe(first);
    });

    it('reopens when the remembered tab was closed, and refuses a bad key', async () => {
        const a = fakeApi();
        const first = await openProfileTab(a, PK);
        a.open.delete(first);
        expect(await openProfileTab(a, PK)).not.toBe(first);
        await expect(openProfileTab(a, 'nope')).rejects.toThrow();
    });

    it('does not focus a remembered id whose tab now shows another page', async () => {
        const a = fakeApi();
        const first = await openProfileTab(a, PK);
        a_urls[first] = 'https://unrelated.example/';
        const second = await openProfileTab(a, PK);
        expect(second).not.toBe(first);
        expect(a.tabs.update).not.toHaveBeenCalled();
    });

    it('opens at a section, and moves an open tab to it, still counting it as this identity', async () => {
        const a = fakeApi();
        const base = `chrome-extension://id/profile.html?pubkey=${PK}`;
        const first = await openProfileTab(a, PK, 'sites');
        expect(a.tabs.create).toHaveBeenCalledWith({ url: `${base}#sites` });
        a_urls[first] = `${base}#sites`;
        expect(await openProfileTab(a, PK, 'sites')).toBe(first);
        expect(a.tabs.update).toHaveBeenCalledWith(first, { active: true, url: `${base}#sites` });
        expect(await openProfileTab(a, PK)).toBe(first);
        await expect(openProfileTab(a, PK, 'javascript:x')).rejects.toThrow();
    });

    it('forgets a tab when it closes', async () => {
        const { forgetProfileTab } = await import('../src/profiles/profile-tabs.js');
        const a = fakeApi();
        const first = await openProfileTab(a, PK);
        await forgetProfileTab(a, first);
        // The id is gone from the map, so even if the browser reuses it nothing is focused.
        expect(await openProfileTab(a, PK)).not.toBe(first);
        expect(a.tabs.update).not.toHaveBeenCalled();
    });
});

describe('not one of your identities', () => {
    it('shows a clear refusal and no fields or actions', () => {
        const v = buildView({ state: 'not-mine' });
        expect(v.message).toBe(MESSAGES.notMine);
        expect(v.message).toMatch(/^Not one of your identities/);
        expect(v.showFields).toBe(false);
        expect(v.showCreate).toBe(false);
        expect(v.showRetry).toBe(false);
        expect(v.editDisabled).toBe(true);
    });
});

describe('header', () => {
    it('uses the local name, then the confirmed kind 0 name, with the npub beneath', () => {
        expect(headerText({ localName: 'Work', npub: 'npub1x' })).toEqual({ title: 'Work', sub: 'npub1x' });
        expect(headerText({ state: 'confirmed', content: { display_name: 'Al' }, npub: 'npub1x' })).toEqual({ title: 'Al', sub: 'npub1x' });
        expect(headerText({ state: 'unreachable', content: { name: 'x' }, npub: 'npub1x' })).toEqual({ title: 'npub1x', sub: '' });
    });
});

describe('image previews', () => {
    it('appear only after the image check passed, https only', () => {
        const content = { picture: 'https://img.example/a.png', banner: 'http://img.example/b.png' };
        expect(buildView({ state: 'confirmed', content, checks: null }).fields.find(f => f.key === 'picture').preview).toBe('');
        const checks = { picture: { status: 'verified', label: 'Image loads' }, banner: { status: 'verified' } };
        const v = buildView({ state: 'confirmed', content, checks });
        expect(v.fields.find(f => f.key === 'picture').preview).toBe('https://img.example/a.png');
        expect(v.fields.find(f => f.key === 'banner').preview).toBe('');
        expect(previewUrl('https://u:p@x.example/a.png')).toBe('');
        expect(previewUrl('javascript:alert(1)')).toBe('');
    });
});

describe('image preview element', () => {
    it('loads with no referrer, has alt text, keeps the URL as text, and falls back to "!" when it fails', () => {
        const content = { picture: 'https://img.example/a.png' };
        const doc = show({ state: 'confirmed', content, checks: { picture: { status: 'verified', label: 'Image loads' } } });
        const row = doc.querySelector('.pd-field[data-field="picture"]');
        const img = row.querySelector('img.pd-preview');
        expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
        expect(img.alt).toBe('Profile picture');
        expect(row.querySelector('.pd-field-value').textContent).toBe('https://img.example/a.png');
        img.dispatchEvent(new Event('error'));
        expect(row.querySelector('img')).toBeNull();
        expect(row.querySelector('.pd-mark').textContent).toBe('!');
        expect(row.querySelector('.pd-status-text').textContent).toBe("Image doesn't load");
    });
});
