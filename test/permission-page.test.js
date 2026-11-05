// @vitest-environment jsdom
/**
 * The real permission page, rendered from its real HTML.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { open, sent } from './helpers/permission-page.js';

afterEach(() => { window.history.pushState({}, '', '/'); });

describe('the remember control', () => {
    const base = { uuid: 'u-1', host: 'https://example.com', payload: 'false' };

    it('is off for a method it does not recognise', async () => {
        await open({ ...base, kind: 'someNewMethod' });
        expect(document.getElementById('remember-patch').disabled).toBe(true);
    });

    it('is on when the worker says the request can be remembered', async () => {
        await open({ ...base, kind: 'nip44.encrypt', rememberable: '1', grantKey: 'nip44.encrypt' });
        expect(document.getElementById('remember-patch').disabled).toBe(false);
    });

    it('is off when the worker says nothing about it', async () => {
        await open({ ...base, kind: 'nip44.encrypt' });
        expect(document.getElementById('remember-patch').disabled).toBe(true);
    });

    it('says what it covers for a plain kind', async () => {
        await open({ ...base, kind: 'signEvent', payload: '{"kind":1}', rememberable: '1', grantKey: 'signEvent:1' });
        expect(document.getElementById('remember-note').textContent).toBe('Off by default. Applies to this site and this kind only.');
    });

    it('follows the worker, not its own reading of the request', async () => {
        await open({ ...base, kind: 'signEvent', payload: '{"kind":1}', rememberable: '0', grantKey: 'signEvent:1' });
        expect(document.getElementById('remember-patch').disabled).toBe(true);
        await open({ ...base, kind: 'signEvent', payload: '{"kind":12345}', rememberable: '1', grantKey: 'signEvent:12345' });
        expect(document.getElementById('remember-patch').disabled).toBe(false);
    });

    it('says how long a capped request is kept', async () => {
        await open({ ...base, kind: 'nip44.decrypt', rememberable: '1', grantKey: 'nip44.decrypt', maxDuration: '30d' });
        expect(document.getElementById('remember-patch-label').textContent).toBe('Remember for 30 days · this site');
    });

    it('keeps the plain label when the request is not capped', async () => {
        await open({ ...base, kind: 'nip44.encrypt', rememberable: '1', grantKey: 'nip44.encrypt', maxDuration: 'forever' });
        expect(document.getElementById('remember-patch-label').textContent).not.toMatch(/days/);
    });

    it('the page holds no rule of its own for this', () => {
        const source = readFileSync(resolve('src/permission/permission.js'), 'utf8');
        expect(source).not.toMatch(/canRemember|grantKeyFor|REMEMBERABLE/);
    });
});

describe('a media server request', () => {
    const NOW = () => Math.floor(Date.now() / 1000);
    const HASH = 'a'.repeat(64);
    const token = (verb, { ttl = 3900, tags = [], content = 'Upload blob' } = {}) => ({
        kind: 24242,
        created_at: NOW(),
        content,
        tags: [['t', verb], ['expiration', String(NOW() + ttl)], ...tags],
    });
    const page = (event, query = {}) => {
        const verb = event.tags.find(t => t[0] === 't')?.[1];
        return open({
            uuid: 'u-1', host: 'https://example.com', kind: 'signEvent',
            payload: JSON.stringify(event), grantKey: `signEvent:24242:${verb}`,
            rememberable: verb === 'delete' ? '0' : '1', parsedAt: String(NOW()),
            profileName: 'Alice', profileType: 'local', ...query,
        });
    };
    const text = (id) => document.getElementById(id).textContent.trim();
    const hidden = (id) => document.getElementById(id).hidden;
    const X = [['x', HASH]];

    for (const [verb, action, remember, tags] of [
        ['upload', 'Upload a file to a media server', 'Remember uploads for this site', X],
        ['media', 'Send a file to a media server to process', 'Remember media uploads for this site', X],
        ['get', 'Fetch a file from a media server', 'Remember file fetches for this site', []],
        ['list', 'List your files on a media server', 'Remember file lists for this site', []],
    ]) {
        it(`${verb} says what it does and what Remember covers`, async () => {
            await page(token(verb, { tags }));
            expect(text('perm-type')).toBe(action);
            expect(text('remember-patch-label')).toBe(remember);
            expect(document.getElementById('remember-patch').disabled).toBe(false);
            expect(document.body.textContent).not.toMatch(/image/i);
        });
    }

    it('reads out the identity, file count, servers and how long the request stays valid', async () => {
        await page(token('upload', { ttl: 3900, tags: [...X, ['x', 'b'.repeat(64)], ['server', 'cdn.example.com'], ['server', 'media.example.org']] }));
        expect(text('perm-identity')).toBe('Alice');
        expect(text('perm-files')).toBe('2 files');
        expect(text('perm-servers')).toBe('cdn.example.com, media.example.org');
        expect(text('perm-valid')).toMatch(/^1 hour( 5 min| 4 min)$/);
    });

    it('says any server when the request names none, and counts one file', async () => {
        await page(token('upload', { ttl: 300, tags: X }));
        expect(text('perm-files')).toBe('1 file');
        expect(text('perm-servers')).toBe('any server');
        expect(text('perm-valid')).toMatch(/^[45] min$/);
    });

    it('shows no file count for a request that has none', async () => {
        await page(token('list'));
        expect(hidden('files-row')).toBe(true);
    });

    it("calls the app's text a note", async () => {
        await page(token('upload', { tags: X, content: 'Upload this' }));
        expect(text('event-preview-title')).toBe("App's note");
    });

    it('a delete is red, cannot be remembered, and points nowhere else', async () => {
        await page(token('delete', { tags: X }));
        expect(text('perm-type')).toBe('Delete a file from a media server');
        const patch = document.getElementById('remember-patch');
        expect(patch.disabled).toBe(true);
        expect(patch.classList.contains('patch-point--danger')).toBe(true);
        expect(document.getElementById('kind-channel').classList.contains('kind-channel--danger')).toBe(true);
        expect(document.querySelector('.warn-strip--red')).not.toBeNull();
        expect(patch.hidden).toBe(true);
        expect(text('remember-note')).toBe('This always asks here');
        expect(document.body.textContent).not.toMatch(/settings/i);
    });

    it('a delete warning sits with the decision, under the Action', async () => {
        await page(token('delete', { tags: X }));
        const footer = document.querySelector('.perm-footer');
        expect(footer.querySelector('#perm-type').textContent).toBe('Delete a file from a media server');
        expect(footer.querySelector('#perm-danger .warn-strip--red').textContent).toMatch(/deletes a file/);
        expect(document.querySelector('#perm-warnings .warn-strip--red')).toBeNull();
    });

    it('any other request that cannot be remembered keeps its label and says why', async () => {
        await page(token('upload', { tags: X }), { rememberable: '0' });
        expect(document.getElementById('remember-patch').hidden).toBe(false);
        expect(text('remember-note')).toBe('This always asks here');
    });

    it('the note under Remember says it is off and what it covers, in plain words', async () => {
        await page(token('upload', { tags: X }));
        expect(text('remember-note')).toBe('Off by default. Applies to this site and this action only.');
    });

    const unreadable = (problemEvent) => page(problemEvent, { grantKey: '', rememberable: '0' });
    const base = () => ({ kind: 24242, created_at: NOW(), content: '', tags: [['t', 'upload'], ['expiration', String(NOW() + 60)], ['x', HASH]] });

    for (const [name, mutate, words] of [
        ['two actions', e => e.tags.push(['t', 'get']), /exactly one action/],
        ['no expiry', e => e.tags.splice(1, 1), /exactly one expiry/],
        ['an expiry already past', e => { e.tags[1][1] = String(NOW() - 10); }, /already expired/],
        ['a creation time ahead of now', e => { e.created_at = NOW() + 3600; }, /creation time/],
        ['no file hash', e => e.tags.pop(), /file hash/],
        ['a server that is not a host name', e => e.tags.push(['server', 'https://x/']), /host name/],
        ['tags it cannot read', e => e.tags.push([]), /tags/],
    ]) {
        it(`names the rule for ${name}`, async () => {
            const event = base();
            mutate(event);
            await unreadable(event);
            const strip = document.querySelector('#perm-warnings .warn-strip').textContent;
            expect(strip).toMatch(words);
            expect(strip).toMatch(/so this asks\.$/);
            expect(document.getElementById('remember-patch').disabled).toBe(true);
        });
    }

    it('says how far off a long expiry is', async () => {
        const event = base();
        event.tags[1][1] = String(NOW() + 2 * 86400);
        await unreadable(event);
        expect(document.querySelector('#perm-warnings .warn-strip').textContent).toMatch(/expires in 2 days, so this asks/);
    });

    describe('a request that names delete but fails a rule', () => {
        const farDelete = () => {
            const event = base();
            event.tags[0][1] = 'delete';
            event.tags[1][1] = String(NOW() + 2 * 86400);
            return event;
        };
        const unreadableDelete = (event) => page(event, { grantKey: '', rememberable: '0', requestRisk: 'danger' });
        const expectRed = () => {
            expect(text('perm-type')).toBe('Delete a file from a media server');
            expect(document.getElementById('perm-type').classList.contains('readout-val--danger')).toBe(true);
            expect(document.getElementById('kind-channel').classList.contains('kind-channel--danger')).toBe(true);
            expect(document.querySelector('.warn-strip--red').textContent).toMatch(/deletes a file/);
        };

        it('with an expiry days out: red, with the delete warning and the reason', async () => {
            await unreadableDelete(farDelete());
            expectRed();
            expect(document.getElementById('perm-warnings').textContent).toMatch(/expires in 2 days/);
        });

        it('with an upload beside it: red, with the reason', async () => {
            const event = base();
            event.tags.push(['t', 'delete']);
            await unreadableDelete(event);
            expectRed();
            expect(document.getElementById('perm-warnings').textContent).toMatch(/exactly one action/);
        });

        it('with too many hashes: red, with the reason', async () => {
            const event = farDelete();
            event.tags[1][1] = String(NOW() + 60);
            event.tags.push(...Array.from({ length: 20 }, (_, i) => ['x', String(i % 10).repeat(64)]));
            await unreadableDelete(event);
            expectRed();
            expect(document.getElementById('perm-warnings').textContent).toMatch(/file hashes/);
        });
    });

    it('a request it cannot read is amber, never plain', async () => {
        const event = base();
        event.tags.push(['t', 'get']);
        await page(event, { grantKey: '', rememberable: '0', requestRisk: 'warn' });
        expect(text('perm-type')).toBe('Authorize a media server request');
        expect(document.getElementById('kind-channel').classList.contains('kind-channel--warn')).toBe(true);
    });

    it('a remote signer profile hears that its signer may still ask', async () => {
        await page(token('upload', { tags: X }), { profileType: 'bunker' });
        expect(text('remember-note')).toBe("NostrKey won't ask. Your remote signer may.");
    });

    it('a local profile does not', async () => {
        await page(token('upload', { tags: X }));
        expect(text('remember-note')).not.toMatch(/remote signer/i);
    });

    it('a request that always asks does not offer that note', async () => {
        await page(token('delete', { tags: X }), { profileType: 'bunker' });
        expect(text('remember-note')).toBe('This always asks here');
    });

    it('a grant held back by the lock says so and offers no Remember', async () => {
        await page(token('upload', { tags: X }), { profileType: 'bunker', lockedGrant: '1' });
        expect(text('remember-note')).toBe('NostrKey is locked, so this asks');
        const patch = document.getElementById('remember-patch');
        expect(patch.hidden).toBe(true);
        expect(patch.disabled).toBe(true);
    });

    it('its new copy has no long dash and no claim of checking anyone', async () => {
        for (const event of [token('upload', { tags: X }), token('delete', { tags: X })]) {
            await page(event, { profileType: 'bunker' });
            const words = ['perm-type', 'remember-patch-label', 'remember-note', 'perm-warnings']
                .map(text).join(' ');
            expect(words).not.toMatch(/\u2014/);
            expect(words).not.toMatch(/client verified|identity verified|is verified/);
        }
    });
});

describe('a request from a client of NostrKey as a remote signer', () => {
    const query = {
        uuid: 'u-1', kind: 'signEvent', payload: '{"kind":1}', grantKey: 'signEvent:1',
        host: 'bunker client abcdef012345… (claimed — not verified)', inbound: '1',
        profileName: 'Alice', profileType: 'local',
    };

    it('offers no Remember when the server would ignore it', async () => {
        await open({ ...query, rememberable: '0' });
        expect(document.getElementById('remember-patch').disabled).toBe(true);
        expect(document.getElementById('remember-note').textContent).toBe('This always asks here');
    });

    it('offers it for the connection, not a site, when the server keeps it', async () => {
        await open({ ...query, rememberable: '1' });
        expect(document.getElementById('remember-patch').disabled).toBe(false);
        expect(document.getElementById('remember-patch-label').textContent).toMatch(/this connection/);
        expect(document.getElementById('remember-patch-label').textContent).not.toMatch(/site/);
        expect(document.getElementById('remember-note').textContent).toBe('Off by default. Applies to this connection and this kind only.');
    });
});

describe('how event text is shown', () => {
    const show = (content, extra = {}) => open({
        uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', grantKey: 'signEvent:1',
        payload: JSON.stringify({ kind: 1, content, tags: [], ...extra }),
    });
    const preview = () => document.getElementById('content-preview').textContent;
    const raw = () => document.getElementById('event-preview-pre').textContent;

    for (const [char, name] of [
        ['\u202E', 'U+202E'], ['\u202A', 'U+202A'], ['\u2066', 'U+2066'], ['\u2069', 'U+2069'],
        ['\u200F', 'U+200F'], ['\u200E', 'U+200E'], ['\u061C', 'U+061C'],
    ]) {
        it(`a direction control shows as ${name} in the preview and raw JSON`, async () => {
            await show(`before${char}after`);
            expect(preview()).toBe(`before[${name}]after`);
            expect(raw()).toContain(`before[${name}]after`);
            expect(raw()).not.toContain(char);
        });
    }

    it('in the raw JSON that covers tags too', async () => {
        await show('x', { tags: [['t', 'a\u202Eb']] });
        expect(raw()).toContain('a[U+202E]b');
    });

    it('in the raw JSON that covers field names too', async () => {
        await show('x', { 'a\u202Eb': 1 });
        expect(raw()).toContain('a[U+202E]b');
    });

    it('in a payload that could not be decoded too', async () => {
        await open({ uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', payload: 'not json \u202E here' });
        expect(raw()).toContain('[U+202E]');
    });

    it('a run of blank lines collapses, so what follows is in view', async () => {
        await show(`top${'\n'.repeat(400)}bottom`);
        expect(preview()).toBe('top\n\nbottom');
        expect(raw()).not.toContain('\\n\\n\\n');
    });

    it('lines of only spaces or other blanks count as blank', async () => {
        await show(`top\n \n\t\n\u00A0\n\u3164\n\u2800\nbottom`);
        expect(preview()).toBe('top\n\nbottom');
    });

    it('a long run of spaces collapses, and a blank run counts toward nothing', async () => {
        await show(`left${' '.repeat(500)}right`);
        expect(preview()).toBe('left   right');
    });

    for (const [name, content] of [
        ['spaces', ' '.repeat(260_000)],
        ['line breaks', '\n'.repeat(260_000)],
        ['spaces and breaks in turn', ' \n'.repeat(130_000)],
        ['words between spaces', 'a   '.repeat(65_000)],
    ]) {
        it(`the largest payload of ${name} draws at once`, async () => {
            const started = performance.now();
            await show(content);
            expect(performance.now() - started).toBeLessThan(500);
        });
    }

    it('ordinary text is left alone, including joined emoji and one blank line', async () => {
        const text = 'one\n\ntwo  three \u{1F468}\u200D\u{1F469}\u200D\u{1F467}';
        await show(text);
        expect(preview()).toBe(text);
    });

    it('the raw JSON keeps its indenting', async () => {
        await show('x');
        expect(raw()).toContain('\n  "kind": 1');
    });
});

describe('the identity row', () => {
    it('names the profile on any request', async () => {
        await open({ uuid: 'u-1', host: 'https://example.com', kind: 'getPubKey', payload: 'false', profileName: 'Alice' });
        expect(document.getElementById('perm-identity').textContent).toBe('Alice');
        expect(document.getElementById('identity-row').hidden).toBe(false);
    });

    it('stays out of the way with no name', async () => {
        await open({ uuid: 'u-1', host: 'https://example.com', kind: 'getPubKey', payload: 'false' });
        expect(document.getElementById('identity-row').hidden).toBe(true);
    });
});

describe('a request the page cannot draw', () => {
    const query = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', grantKey: 'signEvent:1', rememberable: '1' };
    const broken = { ...query, payload: JSON.stringify({ kind: 1, created_at: 1e20, content: 'x', tags: [] }) };

    afterEach(() => { vi.doUnmock('../src/permission/kind-labels'); });

    it('shows the loud state, offers no Remember, and Deny answers', async () => {
        await open(broken);
        expect(document.querySelector('.warn-strip--red').textContent).toMatch(/Could not decode/);
        expect(document.getElementById('remember-patch').disabled).toBe(true);
        document.getElementById('deny-btn').click();
        await new Promise(r => setTimeout(r, 0));
        expect(sent.find(m => m.kind === 'denied')).toEqual({ kind: 'denied', payload: 'u-1', remember: false });
    });

    it('with nothing at all drawn, says so and Deny still answers', async () => {
        vi.doMock('../src/permission/kind-labels', async (importOriginal) => ({
            ...(await importOriginal()),
            describeMethod: () => { throw new Error('no'); },
        }));
        await open(query);
        expect(document.querySelector('.warn-strip--red').textContent).toMatch(/Could not decode/);
        expect(document.getElementById('allow-btn')).toBeNull();
        document.getElementById('deny-btn').click();
        await new Promise(r => setTimeout(r, 0));
        expect(sent.find(m => m.kind === 'denied')).toEqual({ kind: 'denied', payload: 'u-1', remember: false });
    });

    it('Deny is live before anything is drawn', () => {
        const source = readFileSync(resolve('src/permission/permission.js'), 'utf8');
        const init = source.slice(source.indexOf('async function init()'));
        expect(init.indexOf("'deny-btn'")).toBeGreaterThan(-1);
        expect(init.indexOf("'deny-btn'")).toBeLessThan(init.indexOf('draw()'));
    });
});

describe('holding the request open', () => {
    const query = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', payload: '{"kind":1,"content":"x"}' };
    const notes = () => sent.filter(m => m.kind === 'holdPrompt');

    it('tells the worker at least every 10 seconds until the deadline', async () => {
        vi.useFakeTimers();
        try {
            await open({ ...query, deadline: String(Date.now() + 40_000), ttl: '40000' });
            await vi.advanceTimersByTimeAsync(39_000);
            expect(notes().length).toBeGreaterThanOrEqual(3);
            expect(notes().at(-1)).toMatchObject({ kind: 'holdPrompt', payload: 'u-1' });
        } finally { vi.useRealTimers(); }
    });

    it('stops once the prompt has expired', async () => {
        vi.useFakeTimers();
        try {
            await open({ ...query, deadline: String(Date.now() + 40_000), ttl: '40000' });
            await vi.advanceTimersByTimeAsync(41_000);
            const count = notes().length;
            await vi.advanceTimersByTimeAsync(60_000);
            expect(notes().length).toBe(count);
        } finally { vi.useRealTimers(); }
    });
});

describe('a prompt in its own tab, while in use', () => {
    const query = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', payload: '{"kind":1,"content":"x"}' };
    const notes = () => sent.filter(m => m.kind === 'holdPrompt');
    const closes = async () => {
        const { api } = await import('../src/utilities/browser-polyfill');
        return vi.spyOn(api.tabs, 'getCurrent');
    };

    it('says it is in use soon after a key press while focused', async () => {
        vi.useFakeTimers();
        const focus = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
        try {
            await open({ ...query, deadline: String(Date.now() + 40_000), ttl: '40000' });
            await vi.advanceTimersByTimeAsync(3_000);
            const before = notes().length;
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
            expect(notes().length).toBeGreaterThan(before);
            expect(notes().at(-1)).toEqual({ kind: 'holdPrompt', payload: 'u-1', inUse: true });
        } finally { focus.mockRestore(); vi.useRealTimers(); }
    });

    it('an unfocused tab closes when its request runs out', async () => {
        vi.useFakeTimers();
        const focus = vi.spyOn(document, 'hasFocus').mockReturnValue(false);
        try {
            await open({ ...query, deadline: String(Date.now() + 40_000), ttl: '40000' });
            const getCurrent = await closes();
            await vi.advanceTimersByTimeAsync(39_000);
            expect(getCurrent).not.toHaveBeenCalled();
            await vi.advanceTimersByTimeAsync(2_000);
            expect(getCurrent).toHaveBeenCalledTimes(1);
        } finally { focus.mockRestore(); vi.useRealTimers(); }
    });

    it('a focused tab stays when its request runs out, and closes once it loses focus', async () => {
        vi.useFakeTimers();
        const focus = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
        try {
            await open({ ...query, deadline: String(Date.now() + 40_000), ttl: '40000' });
            const getCurrent = await closes();
            await vi.advanceTimersByTimeAsync(60_000);
            expect(getCurrent).not.toHaveBeenCalled();
            expect(document.getElementById('perm-countdown').textContent).toBe('Expired');
            window.dispatchEvent(new Event('blur'));
            expect(getCurrent).toHaveBeenCalledTimes(1);
        } finally { focus.mockRestore(); vi.useRealTimers(); }
    });
});

describe('the ready report', () => {
    const query = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', payload: '{"kind":1,"content":"held text"}' };
    const shown = () => document.getElementById('content-preview').textContent;

    it('goes to the worker and brings back what to show', async () => {
        await open(query);
        expect(sent.find(m => m.kind === 'promptReady')).toEqual({ kind: 'promptReady', payload: 'u-1' });
        expect(shown()).toBe('held text');
    });

    it('goes even when the page could not draw the request', async () => {
        await open({ ...query, payload: '{"kind":1,"created_at":1e20}' });
        expect(sent.find(m => m.kind === 'promptReady')).toEqual({ kind: 'promptReady', payload: 'u-1' });
        expect(document.getElementById('perm-danger').textContent).toMatch(/could not decode/i);
    });

    it('nothing in the address is shown as the request', async () => {
        await open(query, { payload: '{"kind":1,"content":"held text"}' });
        expect(shown()).toBe('held text');
        const page = readFileSync(resolve('src/permission/permission.js'), 'utf8');
        expect(page).not.toMatch(/qs\.get\('payload'\)/);
    });

    it('Approve stays off until there is something to approve', async () => {
        const held = new Promise(() => {});
        await open(query, held);
        await new Promise(r => setTimeout(r, 500));
        expect(document.getElementById('allow-btn').disabled).toBe(true);
        expect(document.getElementById('deny-btn').disabled).toBe(false);
    });

    for (const [name, held] of [
        ['the worker no longer has it', null],
        ['the worker cannot be reached', new Error('gone')],
        ['a reply with nothing in it', { success: false, error: 'x' }],
    ]) {
        it(`${name}: says it ended, and offers only a way out`, async () => {
            await open(query, held);
            expect(document.getElementById('allow-btn')).toBeNull();
            expect(document.getElementById('perm-danger').textContent).toMatch(/no longer open/i);
            expect(document.getElementById('perm-host').textContent).toBe('https://example.com');
            expect(document.getElementById('remember-patch').hidden).toBe(true);
            expect(document.getElementById('deny-btn').textContent).toBe('Close');
        });
    }
});

describe('the Approve hold', () => {
    const query = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', payload: '{"kind":1}' };

    it('a click with no press behind it is refused while held', async () => {
        await open(query);
        const el = document.getElementById('allow-btn');
        el.disabled = false;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(el.getAttribute('aria-disabled')).toBe('true');
        el.click();
        await new Promise(r => setTimeout(r, 0));
        expect(sent.find(m => m.kind === 'allowed')).toBeUndefined();
    });
});

describe('the answer the page sends', () => {
    const base = { uuid: 'u-1', host: 'https://example.com', kind: 'signEvent', payload: '{"kind":1}' };

    for (const [button, kind] of [['allow-btn', 'allowed'], ['deny-btn', 'denied']]) {
        it(`${kind} carries the uuid and remember, nothing else`, async () => {
            await open(base);
            const el = document.getElementById(button);
            el.disabled = false;
            el.click();
            await new Promise(r => setTimeout(r, 0));
            expect(sent.find(m => m.kind === kind)).toEqual({ kind, payload: 'u-1', remember: false });
        });
    }
});
