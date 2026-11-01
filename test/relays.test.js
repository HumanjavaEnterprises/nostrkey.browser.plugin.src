/**
 * addRelay and getRelays through the real worker, as a website with a grant
 * reaches them. A relay must be wss, and a repeat add is a success that changes
 * nothing.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { bootUnlocked, ORIGIN, PAGE_SENDER } from './helpers/boot-worker.js';

const GRANTS = { [ORIGIN]: { addRelay: 'allow', getRelays: 'allow' } };

afterEach(() => { delete globalThis.chrome; });

const add = (env, url) => env.dispatch({ kind: 'addRelay', host: ORIGIN, payload: { url } }, PAGE_SENDER);
const list = (env) => env.dispatch({ kind: 'getRelays', host: ORIGIN }, PAGE_SENDER);
const stored = (env) => env.local._dump().profiles[0].relays;

describe('addRelay', () => {
    it('stores a wss relay for reading and writing, as the URL parser writes it', async () => {
        const env = await bootUnlocked(GRANTS);
        expect(await add(env, 'wss://relay.example.com')).toEqual({ success: true, message: 'Relay added' });
        await env.flushWrites();
        expect(stored(env)).toEqual([{ url: 'wss://relay.example.com/', read: true, write: true }]);
        expect(await list(env)).toEqual({ 'wss://relay.example.com/': { read: true, write: true } });
    });

    it('takes several, in order', async () => {
        const env = await bootUnlocked(GRANTS);
        await add(env, 'wss://one.example.com');
        await add(env, 'wss://two.example.com/path');
        await env.flushWrites();
        expect(stored(env).map(r => r.url)).toEqual(['wss://one.example.com/', 'wss://two.example.com/path']);
    });

    it.each([
        ['ws', 'ws://relay.example.com', 'Must be a wss:// URL'],
        ['local ws', 'ws://localhost:7777', 'Must be a wss:// URL'],
        ['https', 'https://relay.example.com', 'Must be a wss:// URL'],
        ['not a URL', 'relay.example.com', 'Invalid URL'],
        ['nothing', '', 'Invalid URL'],
    ])('refuses %s', async (_, url, message) => {
        const env = await bootUnlocked(GRANTS);
        const answer = await add(env, url);
        expect(answer).toMatchObject({ error: expect.anything() });
        expect(JSON.stringify(answer)).toContain(message);
        await env.flushWrites();
        expect(stored(env)).toEqual([]);
    });

    it('a repeat add succeeds and stores nothing new, with or without the slash', async () => {
        const env = await bootUnlocked(GRANTS);
        await add(env, 'wss://relay.example.com/');
        const answer = await add(env, 'wss://relay.example.com');
        expect(answer).toEqual({ success: true, message: 'Relay already exists' });
        await env.flushWrites();
        expect(stored(env)).toHaveLength(1);
    });
});
