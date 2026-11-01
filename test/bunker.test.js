/**
 * Whether a bunker:// string is usable, as the worker's bunker.validateUrl
 * answers it to the connect form. Connecting is covered by the remote signer
 * suites.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { bootUnlocked } from './helpers/boot-worker.js';

const PUB = 'a'.repeat(64);

afterEach(() => { delete globalThis.chrome; });

describe('bunker.validateUrl', () => {
    it.each([
        ['one relay', `bunker://${PUB}?relay=wss://relay.example.com`],
        ['several relays and a secret', `bunker://${PUB}?relay=wss://a.example.com&relay=wss://b.example.com&secret=s`],
        ['a ws relay', `bunker://${PUB}?relay=ws://localhost:7777`],
    ])('accepts %s', async (_, payload) => {
        const env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'bunker.validateUrl', payload })).toEqual({ valid: true, error: null });
    });

    it.each([
        ['another scheme', 'https://relay.example.com', 'must start with bunker://'],
        ['a short pubkey', 'bunker://short?relay=wss://relay.example.com', 'pubkey must be 64 hex characters'],
        ['no relay', `bunker://${PUB}`, 'at least one relay is required'],
        ['an https relay', `bunker://${PUB}?relay=https://relay.example.com`, 'Invalid relay URL'],
        ['an empty string', '', 'must start with bunker://'],
    ])('refuses %s and says why', async (_, payload, why) => {
        const env = await bootUnlocked();
        const answer = await env.dispatch({ kind: 'bunker.validateUrl', payload });
        expect(answer.valid).toBe(false);
        expect(answer.error).toContain(why);
    });
});

describe('bunker.status', () => {
    it('a profile that never connected has no session', async () => {
        const env = await bootUnlocked();
        expect(await env.dispatch({ kind: 'bunker.status', payload: 0 })).toEqual({ connected: false, hasSession: false });
    });
});
