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

    it('keeps Edit disabled (P6 hook) and no create offer', () => {
        show({ state: 'confirmed', content, checks: {} });
        expect(document.getElementById('pd-edit').disabled).toBe(true);
        expect(document.getElementById('pd-create').hidden).toBe(true);
        expect(document.getElementById('pd-retry').hidden).toBe(true);
    });
});

describe('none', () => {
    it('offers Create your profile, disabled until the editor lands', () => {
        show({ state: 'none' });
        const create = document.getElementById('pd-create');
        expect(create.hidden).toBe(false);
        expect(create.disabled).toBe(true);
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
    const fakeApi = () => {
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
                get: async (id) => { if (!open.has(id)) throw new Error('gone'); return { id, windowId: 1 }; },
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
});
