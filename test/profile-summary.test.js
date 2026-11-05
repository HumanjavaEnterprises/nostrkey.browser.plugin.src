/**
 * The public profile summary the profile tab keeps for the side panel, and the
 * panel wiring that shows it and opens the tab.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { rememberSummary, readSummary, summaryName, SUMMARY_KEY } from '../src/profiles/profile-summary.js';

const PK = 'a'.repeat(64);
const fakeApi = () => {
    const store = {};
    return { store, storage: { local: {
        get: async (d) => { const k = Object.keys(d)[0]; return { [k]: store[k] ?? d[k] }; },
        set: async (o) => Object.assign(store, o),
    } } };
};

describe('profile summary', () => {
    it('keeps the display name, else the name, cut short', () => {
        expect(summaryName({ display_name: ' Alice ', name: 'al' })).toBe('Alice');
        expect(summaryName({ name: 'al' })).toBe('al');
        expect(summaryName({ name: 'x'.repeat(200) })).toHaveLength(64);
        expect(summaryName(null)).toBe('');
    });

    it('a newer profile replaces the kept one; an older one never does', async () => {
        const a = fakeApi();
        expect(await rememberSummary(a, PK, { created_at: 10 }, { name: 'Old' })).toBe(true);
        expect(await rememberSummary(a, PK, { created_at: 20 }, { name: 'New' })).toBe(true);
        expect(await rememberSummary(a, PK, { created_at: 15 }, { name: 'Stale' })).toBe(false);
        expect(await readSummary(a, PK)).toEqual({ name: 'New', at: 20 });
        expect(Object.keys(a.store[SUMMARY_KEY])).toEqual([PK]);
    });

    it('refuses a bad key or an event with no date', async () => {
        const a = fakeApi();
        expect(await rememberSummary(a, 'nope', { created_at: 1 }, { name: 'x' })).toBe(false);
        expect(await rememberSummary(a, PK, {}, { name: 'x' })).toBe(false);
        expect(await readSummary(a, 'nope')).toBeNull();
    });
});

describe('side panel profile view wiring', () => {
    const js = readFileSync(new URL('../src/sidepanel.js', import.meta.url), 'utf8');
    const html = readFileSync(new URL('../src/sidepanel.html', import.meta.url), 'utf8');
    it('keeps its profile view and links to the full profile and its connected sites', () => {
        expect(html).toMatch(/id="view-profile-view"/);
        expect(html).toMatch(/id="view-full-profile-btn"[^>]*>View full profile</);
        expect(html).toMatch(/id="pd-permissions-details"[^>]*>Open details</);
        expect(html).toMatch(/id="permissions-details-btn"[^>]*>Open details</);
        expect(js).toMatch(/openProfileTab\(api, pk, section\)/);
        expect(js).toMatch(/openFullProfile\(state\.detailProfileIndex, 'sites'\)/);
    });
    it('follows the summary the profile tab writes', () => {
        expect(js).toMatch(/changes\[SUMMARY_KEY\]/);
        const tab = readFileSync(new URL('../src/profile.js', import.meta.url), 'utf8');
        expect(tab).toMatch(/rememberSummary\(api, pubkey, loaded\.event, content\)/);
    });
});
