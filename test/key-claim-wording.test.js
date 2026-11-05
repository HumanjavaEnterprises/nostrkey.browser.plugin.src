/**
 * Keys can leave the device encrypted, through sync and backup, so no copy may
 * say they never leave it. Scans the extension, the website, the store locale
 * strings and the Safari app.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOTS = ['src', 'docs', 'src/_locales', 'dev/apple/Shared (App)', 'dev/apple/iOS (App)', 'dev/apple/macOS (App)'];
const EXT = /\.(html|js|json|md|swift|strings|txt)$/;
const OLD = [
    /never\s+leaves?\s+(your|this|the)\s+device/i,
    /everything\s+stays\s+on\s+(your|this)\s+device/i,
    /all\s+sensitive\s+data\s+stays\s+on/i,
    /keys?\s+never\s+sent/i,
    /keys?\s+stays?\s+on\s+(your|this)\s+device/i,
];

function files(dir) {
    let out = [];
    let names = [];
    try { names = readdirSync(dir); } catch { return out; }
    for (const n of names) {
        const p = join(dir, n);
        if (n === 'node_modules' || n.startsWith('.')) continue;
        if (statSync(p).isDirectory()) out = out.concat(files(p));
        else if (EXT.test(n)) out.push(p);
    }
    return out;
}

describe('key wording allows for encrypted sync and backup', () => {
    const all = [...new Set(ROOTS.flatMap(r => files(resolve(r))))];

    it('scans real files', () => {
        expect(all.length).toBeGreaterThan(20);
    });

    it('no copy claims keys never leave the device', () => {
        const hits = [];
        for (const f of all) {
            readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
                if (OLD.some(re => re.test(line))) hits.push(`${f}:${i + 1}`);
            });
        }
        expect(hits).toEqual([]);
    });
});
