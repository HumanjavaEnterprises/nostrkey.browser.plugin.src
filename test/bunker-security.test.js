/**
 * Bunker security tests (security audit 2026-07 — T0-7 / BUNK-01..10, T1-3).
 *
 * These import the REAL src modules (bunker-server.js, nip46.js) and exercise
 * the signing gate, inbound event verification, per-connection model, and the
 * client-side response verification against live nostr-crypto-utils crypto —
 * not mocks.
 *
 * A minimal WebExtension `browser` global is installed before the modules load
 * (nip46.js touches `api.storage.local` at import time via browser-polyfill).
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import {
    generateKeyPair,
    getPublicKeySync,
    hexToBytes,
    bytesToHex,
    finalizeEvent,
    verifySignature,
} from 'nostr-crypto-utils';
import * as nip44 from 'nostr-crypto-utils/nip44';

const nowSec = () => Math.floor(Date.now() / 1000);

function makeBrowserStub() {
    const store = {};
    return {
        runtime: {
            id: 'test-extension-id',
            onMessage: { addListener() {}, removeListener() {} },
            getURL: (p) => `chrome-extension://test/${p}`,
            sendMessage: async () => {},
        },
        storage: {
            local: {
                async get(defaults) {
                    if (typeof defaults === 'string') return { [defaults]: store[defaults] };
                    const out = {};
                    for (const k of Object.keys(defaults || {})) {
                        out[k] = k in store ? store[k] : defaults[k];
                    }
                    return out;
                },
                async set(obj) { Object.assign(store, obj); },
                async remove(k) { delete store[k]; },
                async clear() { for (const k of Object.keys(store)) delete store[k]; },
            },
        },
        tabs: {
            getCurrent: async () => ({ id: 1 }),
            create: async () => ({ id: 2 }),
            update: async () => {},
        },
    };
}

let BunkerServer, generateSecret, classifyRequest, constantTimeEqual;
let BunkerSession, restoreSession;

beforeAll(async () => {
    globalThis.browser = makeBrowserStub();
    ({ BunkerServer, generateSecret, classifyRequest, constantTimeEqual } =
        await import('../src/utilities/bunker-server.js'));
    ({ BunkerSession, restoreSession } = await import('../src/utilities/nip46.js'));
});

async function newIdentity() {
    const kp = await generateKeyPair();
    const privHex = kp.privateKey;
    return { privHex, priv: hexToBytes(privHex), pub: getPublicKeySync(privHex) };
}

async function makeReq({ from, toPub, method, params = [], id = crypto.randomUUID(), createdAt }) {
    const convKey = nip44.v2.utils.getConversationKey(from.priv, toPub);
    const content = nip44.v2.encrypt(JSON.stringify({ id, method, params }), convKey);
    return finalizeEvent({
        kind: 24133,
        content,
        tags: [['p', toPub]],
        created_at: createdAt ?? nowSec(),
    }, from.priv);
}

function makeServer(user, secret, approval) {
    const server = new BunkerServer({ relayUrls: [], userPubkey: user.pub, secret });
    server._getPrivKey = async () => user.priv;
    server._requestApproval = approval || null;
    server.__responses = [];
    server.__privKeyCalls = 0;
    const origGet = server._getPrivKey;
    server._getPrivKey = async (...a) => { server.__privKeyCalls++; return origGet(...a); };
    server._sendResponse = async (_pk, _cp, _ck, response) => { server.__responses.push(response); };
    return server;
}

const lastResponse = (s) => s.__responses[s.__responses.length - 1];

// ---------------------------------------------------------------------------

describe('classifyRequest — kind tiers (UX-BRIEF §2)', () => {
    it('Tier-A signing kinds are remember-eligible', () => {
        for (const k of [1, 6, 7, 16, 0, 3, 10002, 9734, 22242, 27235, 30023]) {
            const c = classifyRequest('sign_event', k);
            expect(c.tier).toBe('A');
            expect(c.perm).toBe(`sign_event:${k}`);
            expect(c.canRemember).toBe(true);
        }
    });

    it('kind 5 (delete) is Tier-B and never remembered', () => {
        const c = classifyRequest('sign_event', 5);
        expect(c.tier).toBe('B');
        expect(c.canRemember).toBe(false);
    });

    it('DM / gift-wrap kinds are Tier-B', () => {
        for (const k of [4, 14, 13, 1059]) {
            expect(classifyRequest('sign_event', k).tier).toBe('B');
        }
    });

    it('unknown signing kinds are Tier-B (default-deny)', () => {
        expect(classifyRequest('sign_event', 40000).tier).toBe('B');
        expect(classifyRequest('sign_event', 40000).canRemember).toBe(false);
    });

    it('all nip04/nip44 crypto is Tier-B, never remembered', () => {
        for (const m of ['nip04_encrypt', 'nip04_decrypt', 'nip44_encrypt', 'nip44_decrypt']) {
            const c = classifyRequest(m, null);
            expect(c.tier).toBe('B');
            expect(c.canRemember).toBe(false);
        }
    });
});

describe('secret hygiene (BUNK-03/06/07)', () => {
    it('generateSecret yields a ≥128-bit hex secret from the CSPRNG', () => {
        const s = generateSecret();
        expect(s).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 128 bits
        expect(generateSecret()).not.toBe(s);
    });

    it('constantTimeEqual matches equal, rejects unequal/length-mismatch/non-string', () => {
        expect(constantTimeEqual('abc', 'abc')).toBe(true);
        expect(constantTimeEqual('abc', 'abd')).toBe(false);
        expect(constantTimeEqual('abc', 'ab')).toBe(false);
        expect(constantTimeEqual('abc', null)).toBe(false);
    });
});

describe('BunkerServer — connect authentication (BUNK-02/06)', () => {
    let user, client, secret, server;
    beforeEach(async () => {
        user = await newIdentity();
        client = await newIdentity();
        secret = generateSecret();
        server = makeServer(user, secret);
    });

    it('rejects an empty secret', async () => {
        await server._handleRequest(await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, ''] }));
        expect(lastResponse(server).error).toBe('Invalid secret');
        expect(server.connections.size).toBe(0);
    });

    it('rejects a wrong secret', async () => {
        await server._handleRequest(await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, 'not-the-secret'] }));
        expect(lastResponse(server).error).toBe('Invalid secret');
    });

    it('accepts the correct secret and creates a per-connection record', async () => {
        await server._handleRequest(await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret] }));
        expect(lastResponse(server).result).toBe('ack');
        expect(server.connections.size).toBe(1);
        const rec = server.connections.get(client.pub);
        expect(rec).toBeTruthy();
        expect(rec.perms.size).toBe(0); // default-deny — no grants yet
    });

    it('connect secret is single-use — a second client cannot reuse it', async () => {
        const other = await newIdentity();
        await server._handleRequest(await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret] }));
        expect(lastResponse(server).result).toBe('ack');
        await server._handleRequest(await makeReq({ from: other, toPub: user.pub, method: 'connect', params: [user.pub, secret] }));
        expect(lastResponse(server).error).toBe('Invalid secret');
        expect(server.connections.has(other.pub)).toBe(false);
    });
});

describe('BunkerServer — per-kind default-DENY signing (T0-7 / BUNK-01)', () => {
    let user, client, secret;
    beforeEach(async () => {
        user = await newIdentity();
        client = await newIdentity();
        secret = generateSecret();
    });

    async function connect(server) {
        await server._handleRequest(await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret] }));
    }

    it('a granted Tier-A kind auto-signs without re-prompting', async () => {
        const calls = [];
        const approval = async (d) => { calls.push(d); return { approved: true, remember: true }; };
        const server = makeServer(user, secret, approval);
        await connect(server);

        // First kind-1 sign → prompts, user approves + remembers → grant stored.
        await server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 1, content: 'hi', tags: [], created_at: nowSec() })],
        }));
        expect(calls.length).toBe(1);
        let r = lastResponse(server);
        expect(r.error).toBeNull();
        const signed1 = JSON.parse(r.result);
        expect(signed1.kind).toBe(1);
        expect(await verifySignature(signed1)).toBe(true);
        expect(server.connections.get(client.pub).perms.has('sign_event:1')).toBe(true);

        // Second kind-1 sign → auto-signs, approval NOT called again.
        await server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 1, content: 'again', tags: [], created_at: nowSec() })],
        }));
        expect(calls.length).toBe(1); // unchanged
        r = lastResponse(server);
        expect(r.error).toBeNull();
        expect(JSON.parse(r.result).kind).toBe(1);
    });

    it('an ungranted Tier-A kind is refused when the user denies', async () => {
        const approval = async () => ({ approved: false, remember: false });
        const server = makeServer(user, secret, approval);
        await connect(server);
        await server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 1, content: 'x', tags: [], created_at: nowSec() })],
        }));
        const r = lastResponse(server);
        expect(r.result).toBeNull();
        expect(r.error).toBe('User denied request');
    });

    it('an unknown kind always prompts and is never remembered', async () => {
        const calls = [];
        const approval = async (d) => { calls.push(d); return { approved: true, remember: true }; };
        const server = makeServer(user, secret, approval);
        await connect(server);
        const sign = async () => server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 40000, content: 'x', tags: [], created_at: nowSec() })],
        }));
        await sign();
        await sign();
        expect(calls.length).toBe(2); // prompted BOTH times — no standing grant
        expect(server.connections.get(client.pub).perms.has('sign_event:40000')).toBe(false);
    });

    it('with no approval UI available, ungranted requests are rejected (default-deny)', async () => {
        const server = makeServer(user, secret, null);
        await connect(server);
        await server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 1, content: 'x', tags: [], created_at: nowSec() })],
        }));
        const r = lastResponse(server);
        expect(r.result).toBeNull();
        expect(r.error).toMatch(/approval/i);
    });

    it('kind-5 delete always prompts even after other grants', async () => {
        const calls = [];
        const approval = async (d) => { calls.push(d); return { approved: true, remember: true }; };
        const server = makeServer(user, secret, approval);
        await connect(server);
        // Grant sign_event:1
        await server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 1, content: 'x', tags: [], created_at: nowSec() })],
        }));
        calls.length = 0;
        // Delete must still prompt
        await server._handleRequest(await makeReq({
            from: client, toPub: user.pub, method: 'sign_event',
            params: [JSON.stringify({ kind: 5, content: '', tags: [['e', 'abc']], created_at: nowSec() })],
        }));
        expect(calls.length).toBe(1);
        expect(server.connections.get(client.pub).perms.has('sign_event:5')).toBe(false);
    });
});

describe('BunkerServer — inbound verification + replay (BUNK-04/05, T1-3)', () => {
    let user, client, secret, server;
    beforeEach(async () => {
        user = await newIdentity();
        client = await newIdentity();
        secret = generateSecret();
        server = makeServer(user, secret);
    });

    it('rejects a forged (tampered) request event without touching the key', async () => {
        const ev = await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret] });
        ev.content = ev.content + 'ff'; // breaks id/sig
        await server._handleRequest(ev);
        expect(server.__responses.length).toBe(0);
        expect(server.__privKeyCalls).toBe(0);
        expect(server.connections.size).toBe(0);
    });

    it('rejects an event with a mismatched id', async () => {
        const ev = await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret] });
        ev.id = 'f'.repeat(64);
        await server._handleRequest(ev);
        expect(server.__responses.length).toBe(0);
    });

    it('rejects a stale event outside the freshness window', async () => {
        const ev = await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret], createdAt: nowSec() - 4000 });
        await server._handleRequest(ev);
        expect(server.__responses.length).toBe(0);
    });

    it('dedupes a replayed request event by id', async () => {
        const ev = await makeReq({ from: client, toPub: user.pub, method: 'connect', params: [user.pub, secret] });
        await server._handleRequest(ev);
        await server._handleRequest(ev); // exact replay
        expect(server.__responses.length).toBe(1); // second was dropped
    });
});

describe('BunkerServer — per-connection revocation (BUNK-08)', () => {
    it('revoking one connection blocks it but leaves others working', async () => {
        const user = await newIdentity();
        const a = await newIdentity();
        const b = await newIdentity();
        const secretA = generateSecret();
        const server = makeServer(user, secretA);
        const secretB = server.rotateSecret();

        await server._handleRequest(await makeReq({ from: a, toPub: user.pub, method: 'connect', params: [user.pub, secretA] }));
        await server._handleRequest(await makeReq({ from: b, toPub: user.pub, method: 'connect', params: [user.pub, secretB] }));
        expect(server.connections.size).toBe(2);

        expect(server.revokeConnection(a.pub)).toBe(true);
        expect(server.connections.size).toBe(1);

        // A is now unauthorized...
        await server._handleRequest(await makeReq({ from: a, toPub: user.pub, method: 'get_public_key' }));
        expect(lastResponse(server).error).toMatch(/Unauthorized/);

        // ...but B still works.
        await server._handleRequest(await makeReq({ from: b, toPub: user.pub, method: 'get_public_key' }));
        expect(lastResponse(server).result).toBe(user.pub);
    });
});

describe('BunkerSession client — response verification (BUNK-09) + at-rest key (BUNK-10)', () => {
    let bunker, session;
    beforeEach(async () => {
        bunker = await newIdentity();
        session = new BunkerSession({ remotePubkey: bunker.pub, relays: [], secret: null });
        await session.init();
    });

    async function bunkerResponse({ id, result, signer = bunker, createdAt }) {
        const convKey = nip44.v2.utils.getConversationKey(signer.priv, session.sessionPubkey);
        const content = nip44.v2.encrypt(JSON.stringify({ id, result, error: null }), convKey);
        return finalizeEvent({
            kind: 24133,
            content,
            tags: [['p', session.sessionPubkey]],
            created_at: createdAt ?? nowSec(),
        }, signer.priv);
    }

    it('accepts and resolves a valid, correlated bunker response', async () => {
        const id = 'req-1';
        const p = new Promise((resolve, reject) => session.pendingRequests.set(id, { resolve, reject }));
        await session.handleResponse(await bunkerResponse({ id, result: 'pong' }));
        await expect(p).resolves.toBe('pong');
    });

    it('rejects a response signed by anyone other than the pinned bunker', async () => {
        const attacker = await newIdentity();
        const ev = await bunkerResponse({ id: 'x', result: 'evil', signer: attacker });
        expect(await session._verifyResponseEvent(ev)).toBe(false);
    });

    it('rejects a tampered response', async () => {
        const ev = await bunkerResponse({ id: 'x', result: 'ok' });
        ev.content = ev.content + 'ab';
        expect(await session._verifyResponseEvent(ev)).toBe(false);
    });

    it('dedupes a replayed response id', async () => {
        const ev = await bunkerResponse({ id: 'once', result: 'ok' });
        expect(await session._verifyResponseEvent(ev)).toBe(true);
        session._seenResponseIds.add(ev.id);
        expect(await session._verifyResponseEvent(ev)).toBe(false);
    });

    it('persists the session private key encrypted, and restores it (BUNK-10)', async () => {
        const info = await session.getSessionInfo();
        // Not stored in cleartext.
        expect(info.sessionPrivkey).not.toContain(bytesToHex(session.sessionPrivkey));
        expect(JSON.parse(info.sessionPrivkey).k).toBe('device');
        // Round-trips back to the same key on this device.
        const restored = await restoreSession(info);
        expect(bytesToHex(restored.sessionPrivkey)).toBe(bytesToHex(session.sessionPrivkey));
        expect(restored.sessionPubkey).toBe(session.sessionPubkey);
    });
});
