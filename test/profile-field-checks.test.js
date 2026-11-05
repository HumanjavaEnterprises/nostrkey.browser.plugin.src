import { describe, it, expect } from 'vitest';
import { checkNip05, checkLud16, checkImage, checkFields, splitAddress } from '../src/profiles/field-checks.js';

const PK = 'ab'.repeat(32);
const json = (body, extra = {}) => async () => ({ ok: true, redirected: false, text: async () => JSON.stringify(body), ...extra });
const recorder = (impl) => { const calls = []; const f = async (u, o) => { calls.push([u, o]); return impl(u, o); }; f.calls = calls; return f; };

describe('NIP-05', () => {
    it('match, lowercasing the local part, no redirects', async () => {
        const f = recorder(json({ names: { bob: PK } }));
        expect((await checkNip05('Bob@Example.com', PK.toUpperCase(), { fetch: f })).status).toBe('verified');
        expect(f.calls[0][0]).toBe('https://example.com/.well-known/nostr.json?name=bob');
        expect(f.calls[0][1].redirect).toBe('error');
    });
    it('_ local part', async () => {
        const f = recorder(json({ names: { _: PK } }));
        expect((await checkNip05('_@example.com', PK, { fetch: f })).status).toBe('verified');
    });
    it('mismatch warns', async () => {
        expect((await checkNip05('bob@example.com', PK, { fetch: json({ names: { bob: 'cd'.repeat(32) } }) })).status).toBe('mismatch');
        expect((await checkNip05('bob@example.com', PK, { fetch: json({ names: {} }) })).status).toBe('mismatch');
    });
    it('redirect, CORS/network failure, non-200, timeout are unverified', async () => {
        const fail = async () => { throw new TypeError('Failed to fetch'); };
        expect((await checkNip05('bob@example.com', PK, { fetch: fail })).status).toBe('unverified');
        expect((await checkNip05('bob@example.com', PK, { fetch: json({ names: { bob: PK } }, { redirected: true }) })).status).toBe('unverified');
        expect((await checkNip05('bob@example.com', PK, { fetch: json({}, { ok: false }) })).status).toBe('unverified');
        const hang = () => new Promise(() => {});
        expect((await checkNip05('bob@example.com', PK, { fetch: hang, timeoutMs: 20 })).status).toBe('unverified');
    });
    it('bad shape is invalid and never fetched', async () => {
        const f = recorder(json({}));
        for (const v of ['bob', '@example.com', 'bo b@example.com', 'bob@exa mple.com', 'bob@localhost', 'bob@example.com:8080', 'bob@user:pw@example.com']) {
            expect((await checkNip05(v, PK, { fetch: f })).status).toBe('invalid');
        }
        expect(f.calls).toHaveLength(0);
        expect(splitAddress('A.b-c_d@x.io')).toEqual({ name: 'a.b-c_d', domain: 'x.io' });
    });
});

describe('LUD-16', () => {
    it('payRequest verifies at the lnurlp path', async () => {
        const f = recorder(json({ tag: 'payRequest', callback: 'https://x.io/cb' }));
        expect((await checkLud16('alice@x.io', { fetch: f })).status).toBe('verified');
        expect(f.calls[0][0]).toBe('https://x.io/.well-known/lnurlp/alice');
        expect(f.calls[0][1].redirect).toBe('error');
    });
    it('wrong tag warns; failure is unverified; bad shape invalid', async () => {
        expect((await checkLud16('alice@x.io', { fetch: json({ tag: 'withdrawRequest' }) })).status).toBe('mismatch');
        expect((await checkLud16('alice@x.io', { fetch: async () => { throw new Error('cors'); } })).status).toBe('unverified');
        expect((await checkLud16('al ice@x.io', { fetch: json({}) })).status).toBe('invalid');
    });
});

describe('images', () => {
    it('https only; load, fail and hang', async () => {
        expect((await checkImage('http://x.io/a.png', { loadImage: async () => true })).status).toBe('invalid');
        expect((await checkImage('data:image/png;base64,AA', { loadImage: async () => true })).status).toBe('invalid');
        expect((await checkImage('https://x.io/a.png', { loadImage: async () => true })).status).toBe('verified');
        expect((await checkImage('https://x.io/a.png', { loadImage: async () => false })).status).toBe('mismatch');
        expect((await checkImage('https://x.io/a.png', { loadImage: () => new Promise(() => {}), timeoutMs: 20 })).status).toBe('unverified');
    });
});

describe('checkFields', () => {
    it('fields without a check confirm with the profile, incl. deprecated names', async () => {
        const out = await checkFields({ name: 'n', displayName: 'd', username: 'u', about: 'a', nip05: 'bob@example.com', picture: 'https://x.io/p.png' }, PK,
            { fetch: json({ names: { bob: PK } }), loadImage: async () => true });
        expect(out.name.status).toBe('confirmed');
        expect(out.displayName.status).toBe('confirmed');
        expect(out.username.status).toBe('confirmed');
        expect(out.nip05.status).toBe('verified');
        expect(out.picture.status).toBe('verified');
        for (const v of Object.values(out)) expect(typeof v.label).toBe('string');
    });
});
