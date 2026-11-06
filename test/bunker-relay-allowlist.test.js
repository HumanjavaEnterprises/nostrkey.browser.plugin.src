/**
 * nBunker relay allowlist (1.8.6).
 *
 * DEFAULT_BUNKER_RELAYS is both the default relay set and the allowlist base
 * for which relays the bunker signer may run on. relay.nostrkeep.app was
 * dropped (not a live relay). The service worker is not importable in
 * isolation, so we lift DEFAULT_BUNKER_RELAYS + resolveBunkerRelays out of the
 * source and run them against a stubbed getRelays().
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/background.js'), 'utf8');

const block = src.match(
    /const DEFAULT_BUNKER_RELAYS = [\s\S]*?\nasync function resolveBunkerRelays\(requested\) \{[\s\S]*?\n\}\n/
)[0];

function load(profileRelays) {
    const getRelays = async () => {
        if (profileRelays instanceof Error) throw profileRelays;
        return profileRelays;
    };
    // eslint-disable-next-line no-new-func
    return new Function('getRelays', `${block}\nreturn { DEFAULT_BUNKER_RELAYS, resolveBunkerRelays };`)(getRelays);
}

describe('DEFAULT_BUNKER_RELAYS', () => {
    it('is exactly relay.nostrkey.com', () => {
        expect(load({}).DEFAULT_BUNKER_RELAYS).toEqual(['wss://relay.nostrkey.com']);
    });

    it('no source in src/ references relay.nostrkeep.app', () => {
        expect(src).not.toContain('relay.nostrkeep.app');
        expect(readFileSync(join(root, 'src/sidepanel.js'), 'utf8')).not.toContain('relay.nostrkeep.app');
    });
});

describe('resolveBunkerRelays allowlist', () => {
    it('no request -> defaults', async () => {
        const { resolveBunkerRelays } = load({});
        expect(await resolveBunkerRelays(undefined)).toEqual(['wss://relay.nostrkey.com']);
        expect(await resolveBunkerRelays([])).toEqual(['wss://relay.nostrkey.com']);
    });

    it('drops a relay outside defaults + profile relays', async () => {
        const { resolveBunkerRelays } = load({ 'wss://mine.example': {} });
        expect(await resolveBunkerRelays(['wss://evil.example', 'wss://relay.nostrkey.com']))
            .toEqual(['wss://relay.nostrkey.com']);
        expect(await resolveBunkerRelays(['wss://evil.example'])).toEqual(['wss://relay.nostrkey.com']);
    });

    it('drops relay.nostrkeep.app when not in the profile relays', async () => {
        const { resolveBunkerRelays } = load({ 'wss://mine.example': {} });
        expect(await resolveBunkerRelays(['wss://relay.nostrkey.com', 'wss://relay.nostrkeep.app']))
            .toEqual(['wss://relay.nostrkey.com']);
    });

    it('keeps relay.nostrkeep.app when the profile lists it itself', async () => {
        const { resolveBunkerRelays } = load({ 'wss://relay.nostrkeep.app': {} });
        expect(await resolveBunkerRelays(['wss://relay.nostrkey.com', 'wss://relay.nostrkeep.app']))
            .toEqual(['wss://relay.nostrkey.com', 'wss://relay.nostrkeep.app']);
    });

    it('allows a profile wss relay, ignores non-wss profile entries', async () => {
        const { resolveBunkerRelays } = load({ 'wss://mine.example': {}, 'ws://plain.example': {} });
        expect(await resolveBunkerRelays(['wss://mine.example', 'ws://plain.example']))
            .toEqual(['wss://mine.example']);
    });

    it('getRelays failure falls back to defaults only', async () => {
        const { resolveBunkerRelays } = load(new Error('locked'));
        expect(await resolveBunkerRelays(['wss://mine.example'])).toEqual(['wss://relay.nostrkey.com']);
    });
});
