/**
 * describeEffect: what signing a kind 0, 3, 5, 10000 or 10002 changes, in words,
 * and whether the change is destructive (Decision 2 thresholds).
 */
import { describe, it, expect } from 'vitest';
import { describeEffect, REMOVE_COUNT_LIMIT } from '../src/permission/effect-preview.js';

const hex = (n) => n.toString(16).padStart(64, '0');
const follows = (from, to, pet = () => undefined) => {
    const tags = [];
    for (let i = from; i < to; i++) {
        const p = pet(i);
        tags.push(p ? ['p', hex(i + 1), '', p] : ['p', hex(i + 1)]);
    }
    return tags;
};
const ev = (kind, tags = [], content = '') => ({ kind, tags, content, created_at: 1 });
const cur = (event, basis = 'relays') => ({ event, basis });

describe('kind 3 follow list', () => {
    it.each([
        // [before, after, destructive, first line]
        ['adds two', [0, 20], [0, 22], false, 'Adds 2 follows.'],
        ['removes one of twenty (5 percent)', [0, 20], [1, 20], false, 'Removes 1 of your 20 follows.'],
        ['removes two of ten (20 percent)', [0, 10], [2, 10], true, 'Removes 2 of your 10 follows.'],
        ['removes eleven of a thousand (count)', [0, 1000], [11, 1000], true, 'Removes 11 of your 1000 follows.'],
        ['removes ten of a thousand (at the limit)', [0, 1000], [10, 1000], false, 'Removes 10 of your 1000 follows.'],
        ['no change', [0, 5], [0, 5], false, 'No change to your follows.'],
    ])('%s', (_name, before, after, destructive, first) => {
        const out = describeEffect(3, ev(3, follows(...after)), cur(ev(3, follows(...before))));
        expect(out.destructive).toBe(destructive);
        expect(out.lines[0]).toBe(first);
        expect(out.basis).toBe('relays');
    });

    it('a big wipe is summarised, with a few names and a count', () => {
        const before = ev(3, follows(0, 450, i => (i === 0 ? 'alice' : undefined)));
        const after = ev(3, [...follows(447, 450), ...follows(1000, 1003)]);
        const out = describeEffect(3, after, cur(before));
        expect(out.lines[0]).toBe('Removes 447 of your 450 follows, adds 3.');
        expect(out.lines[1]).toMatch(/^Removes: alice, npub1\S+…\S+, npub1\S+…\S+ and 444 more\.$/);
        expect(out.lines.join('\n').length).toBeLessThan(600);
        expect(out.lines).toContain('After this: 6 follows.');
        expect(out.destructive).toBe(true);
    });

    it('no current list: says so, and a whole-list replace is destructive', () => {
        const out = describeEffect(3, ev(3, follows(0, 2)), null);
        expect(out).toEqual({
            lines: [
                "Could not check your current follow list, so this can't be compared.",
                'This replaces your whole follow list with 2 follows.',
            ],
            destructive: true,
            basis: 'none',
        });
    });

    it('limit is ten', () => expect(REMOVE_COUNT_LIMIT).toBe(10));
});

describe('kind 10000 mute list', () => {
    const before = ev(10000, [['p', hex(1)], ['t', 'spam'], ['word', 'crypto'], ['e', hex(9)]], 'cipher-a');

    it('diffs p, t, word and e tags', () => {
        const out = describeEffect(10000, ev(10000, [['p', hex(1)], ['t', 'spam']], 'cipher-a'), cur(before, 'local'));
        expect(out.lines[0]).toBe('Removes 2 of your 4 muted items.');
        expect(out.lines[1]).toBe('Removes: "crypto", a thread.');
        expect(out.destructive).toBe(true); // 50 percent
        expect(out.basis).toBe('local');
    });

    it('a changed private part is noted, not read', () => {
        const out = describeEffect(10000, { ...before, content: 'cipher-b' }, cur(before));
        expect(out.lines).toEqual(['No change to your muted items.', 'The private part also changes.']);
        expect(out.destructive).toBe(false);
    });

    it('no current list is destructive', () => {
        const out = describeEffect(10000, ev(10000, []), null);
        expect(out.destructive).toBe(true);
        expect(out.lines[0]).toMatch(/Could not check your current mute list/);
    });
});

describe('kind 10002 relay list', () => {
    const r = (url, marker) => (marker ? ['r', url, marker] : ['r', url]);
    const before = ev(10002, [r('wss://a.example'), r('wss://b.example', 'write'), r('wss://c.example', 'read')]);

    it('adding a relay is not destructive', () => {
        const out = describeEffect(10002, ev(10002, [...before.tags, r('wss://d.example')]), cur(before));
        expect(out.lines).toEqual(['Adds 1 relay: d.example.']);
        expect(out.destructive).toBe(false);
    });

    it('removing a write relay is destructive', () => {
        const out = describeEffect(10002, ev(10002, [r('wss://a.example'), r('wss://c.example', 'read')]), cur(before));
        expect(out.lines).toEqual(['Removes 1 relay: b.example.']);
        expect(out.destructive).toBe(true);
    });

    it('removing a read-only relay is not', () => {
        const out = describeEffect(10002, ev(10002, [r('wss://a.example'), r('wss://b.example', 'write')]), cur(before));
        expect(out.destructive).toBe(false);
    });

    it('read/write changes are named; no write relays left is destructive', () => {
        const out = describeEffect(10002, ev(10002, [r('wss://a.example', 'read'), r('wss://c.example', 'read')]), cur(before));
        expect(out.lines).toContain('Changes a.example from read and write to read only.');
        expect(out.lines).toContain('No write relays left. Apps will not know where to find your posts.');
        expect(out.destructive).toBe(true);
    });

    it('compares with the typed relay list when there is no relay list event', () => {
        const out = describeEffect(10002, ev(10002, [r('wss://a.example')]),
            { relays: [{ url: 'wss://a.example/', read: true, write: true }], basis: 'local' });
        expect(out.lines).toEqual(['No change to your relays.']);
        expect(out.destructive).toBe(false);
        expect(out.basis).toBe('local');
    });

    it('no current list is destructive', () => {
        const out = describeEffect(10002, ev(10002, [r('wss://a.example')]), null);
        expect(out.destructive).toBe(true);
        expect(out.basis).toBe('none');
    });
});

describe('kind 0 profile', () => {
    const p = (o) => ev(0, [], JSON.stringify(o));
    const before = p({ name: 'Ann', about: 'hi', website: 'https://a.example' });

    it('changes and additions are not destructive', () => {
        const out = describeEffect(0, p({ name: 'Anne', about: 'hi', website: 'https://a.example', picture: 'x' }), cur(before, 'history'));
        expect(out.lines).toEqual(['Changes name.', 'Adds picture.']);
        expect(out.destructive).toBe(false);
        expect(out.basis).toBe('history');
    });

    it('clearing a field that had a value is destructive', () => {
        const out = describeEffect(0, p({ name: 'Ann', about: '' }), cur(before));
        expect(out.lines).toEqual(['Clears about, website.']);
        expect(out.destructive).toBe(true);
    });

    it('content that is not a profile is destructive', () => {
        expect(describeEffect(0, ev(0, [], 'oops'), cur(before)).destructive).toBe(true);
    });

    it('no current profile: says so, not destructive', () => {
        const out = describeEffect(0, p({ name: 'Ann' }), null);
        expect(out.lines).toEqual(["Could not check your current profile, so this can't be compared.", 'Sets name.']);
        expect(out.destructive).toBe(false);
    });
});

describe('kind 5 delete', () => {
    it('counts ids, names kinds from history, notes addresses; always destructive', () => {
        const out = describeEffect(5, ev(5, [['e', hex(1)], ['e', hex(2)], ['e', hex(3)], ['a', `30023:${hex(9)}:post`], ['k', '1']]),
            null, { historyKinds: new Map([[hex(1), 1], [hex(2), 1]]) });
        expect(out.lines).toEqual([
            'Asks relays to delete 3 events.',
            'From your history: 2 notes.',
            'Deletes every version of 1 item by address, not just one copy.',
            'Relays may keep copies. A deletion cannot be undone.',
        ]);
        expect(out.destructive).toBe(true);
        expect(out.basis).toBe('history');
    });

    it('nothing known is still destructive', () => {
        const out = describeEffect(5, ev(5, [['e', hex(1)]]), null);
        expect(out.destructive).toBe(true);
        expect(out.basis).toBe('none');
    });
});

it('other kinds have no effect preview', () => {
    expect(describeEffect(1, ev(1), null)).toBeNull();
});
