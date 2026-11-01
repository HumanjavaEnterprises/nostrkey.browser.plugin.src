/**
 * What the content script carries for a website. The list is compared whole, so
 * anything added to it has to be added here on purpose.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const content = readFileSync(resolve('src/content.js'), 'utf8');
const list = content.match(/const validEvents = \[([\s\S]*?)\];/)[1];
const kinds = [...list.matchAll(/'([\w.]+)'/g)].map(m => m[1]);

describe('the kinds a website can ask for', () => {
    it('are exactly the window.nostr methods', () => {
        expect(kinds.sort()).toEqual([
            'addRelay', 'getPubKey', 'getRelays',
            'nip04.decrypt', 'nip04.encrypt', 'nip44.decrypt', 'nip44.encrypt',
            'replaceURL', 'signEvent',
        ]);
    });

    it('are written as plain text, so the comparison sees the whole list', () => {
        expect(list.replace(/'[\w.]+'/g, '').replace(/[\s,]/g, '')).toBe('');
    });
});
