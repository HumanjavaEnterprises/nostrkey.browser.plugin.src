/**
 * Every place a release number is written must agree. A store build or an
 * Xcode Cloud archive takes its number from a different file, so one missed
 * location ships the wrong version. package.json is the reference.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const version = (p) => JSON.parse(read(p)).version;

const expected = version('package.json');

describe('release version agrees everywhere', () => {
    it('package.json holds a plain x.y.z version', () => {
        expect(expected).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('package-lock.json root agrees in both places', () => {
        const lock = JSON.parse(read('package-lock.json'));
        expect(lock.version).toBe(expected);
        expect(lock.packages[''].version).toBe(expected);
    });

    for (const manifest of [
        'src/manifest.json',
        'src/chrome-manifest.json',
        'src/firefox-manifest.json',
        'distros/safari/manifest.json',
    ]) {
        it(`${manifest} agrees`, () => {
            expect(version(manifest)).toBe(expected);
        });
    }

    it('all 8 Xcode MARKETING_VERSION entries agree', () => {
        const pbxproj = read('dev/apple/NostrKey.xcodeproj/project.pbxproj');
        const values = [...pbxproj.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(m => m[1]);
        expect(values).toEqual(Array(8).fill(expected));
    });
});
