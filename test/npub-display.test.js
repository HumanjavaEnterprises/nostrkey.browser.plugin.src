/**
 * A8: every shortened npub on screen comes from truncateNpub, so a lookalike
 * check and the eye always compare the same characters.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', 'src');

function sources(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) out.push(...sources(full));
        else if (/\.(js|html)$/.test(name) && !/\.build\./.test(name)) out.push(full);
    }
    return out;
}

const OWNER = join(SRC, 'utilities', 'npub-guard.js');

describe('A8: one npub display', () => {
    it('no source file shortens an npub by hand', () => {
        const offenders = [];
        for (const file of sources(SRC)) {
            if (file === OWNER) continue;
            readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
                if (/npub\w*\s*\??\.\s*(slice|substring|substr)\s*\(/i.test(line)) {
                    offenders.push(`${file}:${i + 1}`);
                }
            });
        }
        expect(offenders).toEqual([]);
    });

    it('no source file defines its own truncation helper', () => {
        const offenders = sources(SRC)
            .filter(f => f !== OWNER)
            .filter(f => /function\s+truncate(Key|Npub)\b/.test(readFileSync(f, 'utf8')));
        expect(offenders).toEqual([]);
    });

    it('the surfaces that show a short npub import the shared helper', () => {
        for (const rel of ['sidepanel.js', 'nostr-keys/nostr-keys.js', 'profiles/profiles.js']) {
            expect(readFileSync(join(SRC, rel), 'utf8')).toMatch(/import\s*\{[^}]*truncateNpub[^}]*\}\s*from\s*'[^']*npub-guard/);
        }
    });

    it('the locked screen and profile list do not show the old hand-cut forms', () => {
        const side = readFileSync(join(SRC, 'sidepanel.js'), 'utf8');
        expect(side).not.toMatch(/slice\(0,\s*14\)/);
        expect(side).not.toMatch(/\+ '\.\.\.' \+/);
    });
});
