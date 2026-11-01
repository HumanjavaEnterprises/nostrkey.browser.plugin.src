// @vitest-environment jsdom
/**
 * What the real permission page reads out about a signing request: who claims to
 * be asking, when the event says it was made, and what its content is. Whether a
 * request can be remembered is the policy module's and is tested there.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { open } from './helpers/permission-page.js';

const NOW = () => Math.floor(Date.now() / 1000);
const QUERY = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', grantKey: 'signEvent:1' };

const event = (fields) => ({ kind: 1, content: 'x', tags: [], ...fields });
const show = (fields) => open({ ...QUERY, payload: JSON.stringify(event(fields)) });
const $ = (id) => document.getElementById(id);
const warnings = () => $('perm-warnings').textContent;
const preview = () => $('content-preview').textContent;

afterEach(() => { window.history.pushState({}, '', '/'); });

describe('who is asking', () => {
    const BUNKER = 'bunker client abc123def456… (claimed — not verified)';

    it('a remote client gets the claimed chip and the warning', async () => {
        await open({ ...QUERY, host: BUNKER, payload: JSON.stringify(event()) });
        expect($('origin-claim').hidden).toBe(false);
        expect($('perm-host').textContent).toBe('bunker client abc123def456…');
        expect($('origin-glyph').textContent).toBe('◆');
        expect(warnings()).toMatch(/claimed, not verified/);
    });

    it('a website does not', async () => {
        await show();
        expect($('origin-claim').hidden).toBe(true);
        expect($('perm-host').textContent).toBe('https://example.com');
        expect($('origin-glyph').textContent).toBe('e');
        expect(warnings()).not.toMatch(/claimed/);
    });

    it('a host that only mentions the words is not a remote client', async () => {
        await open({ ...QUERY, host: 'https://bunker.example/?bunker client x (claimed — not verified)', payload: '{}' });
        expect($('origin-claim').hidden).toBe(true);
    });
});

describe('when the event says it was made', () => {
    it('20 minutes ahead is flagged', async () => {
        await show({ created_at: NOW() + 1200 });
        expect($('event-created').classList.contains('param-stamp--warn')).toBe(true);
        expect(warnings()).toMatch(/20 min ahead of the current time/);
    });

    it('20 minutes behind is flagged', async () => {
        await show({ created_at: NOW() - 1200 });
        expect(warnings()).toMatch(/20 min behind the current time/);
    });

    it('a minute ahead is not', async () => {
        await show({ created_at: NOW() + 60 });
        expect($('event-created-row').hidden).toBe(false);
        expect($('event-created').classList.contains('param-stamp--warn')).toBe(false);
        expect(warnings()).not.toMatch(/current time/);
    });

    it('reads out in UTC', async () => {
        await show({ created_at: 1700000000 });
        expect($('event-created').textContent).toBe('2023-11-14 22:13:20 UTC');
    });

    it.each([['text', 'soon'], ['missing', undefined]])('a %s time has no row', async (_, created_at) => {
        await show({ created_at });
        expect($('event-created-row').hidden).toBe(true);
    });
});

describe('an event that cannot be decoded', () => {
    it('is red, says so, and is not offered for remembering whatever the query says', async () => {
        await open({ ...QUERY, rememberable: '1', payload: 'not json' });
        expect($('kind-label').textContent).toBe('Cannot decode this event');
        expect($('kind-num').textContent).toBe('?');
        expect($('kind-channel').classList.contains('kind-channel--danger')).toBe(true);
        expect($('perm-danger').textContent).toMatch(/signing something you cannot read/);
        expect($('remember-patch').disabled).toBe(true);
        expect(preview()).toBe('(cannot decode — see raw payload below)');
    });
});

describe('the content preview', () => {
    it('cuts long text at 400 characters and marks the cut', async () => {
        await show({ content: 'a'.repeat(500) });
        expect(preview()).toBe(`${'a'.repeat(400)}…`);
    });

    it('leaves exactly 400 characters whole', async () => {
        await show({ content: 'b'.repeat(400) });
        expect(preview()).toBe('b'.repeat(400));
    });

    it('says when there is no content', async () => {
        await show({ content: '' });
        expect(preview()).toBe('(no content)');
    });

    it('says when the content is not text', async () => {
        await show({ content: { some: 'object' } });
        expect(preview()).toBe('(content is not text — inspect the raw JSON)');
    });

    it('is not shown for a request that signs nothing', async () => {
        await open({ ...QUERY, kind: 'getPubKey', payload: 'false' });
        expect($('event-preview').hidden).toBe(true);
        expect($('event-kind-row').hidden).toBe(true);
    });
});
