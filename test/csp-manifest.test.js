import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED = "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss://* https:; frame-src 'self'; font-src 'self'; media-src 'self'; child-src 'self';";

describe('extension pages CSP', () => {
    for (const name of ['manifest.json', 'chrome-manifest.json', 'firefox-manifest.json']) {
        it(`${name} pins the exact CSP`, () => {
            const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', name), 'utf8'));
            const csp = m.content_security_policy.extension_pages;
            expect(csp).toBe(EXPECTED);
            expect(csp).toMatch(/(^|; )script-src 'self';/);
            expect(csp).not.toMatch(/unsafe-eval/);
            expect(csp).not.toMatch(/http:/);
        });
    }
});
