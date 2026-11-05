/**
 * profile.publish through the real worker: merge into the newest kind 0, stale
 * guard, sender gate, ownership, lock, bunker signature checks, relay results.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { finalizeEvent, hexToBytes } from 'nostr-crypto-utils';
import {
    bootUnlocked, bootWorker, bootWithPassword, deviceWrapped, answerWithin, PAGE_SENDER, PUB_A, HEX_A,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB, SIGNER_HEX, OTHER_SIGNER_HEX } from './helpers/fake-signer.js';

const REJECTED = { success: false, error: 'Unauthorized sender' };
const TAB = {
    id: 'test-extension-id',
    tab: { id: 12, url: `chrome-extension://test/profile.html?pubkey=${PUB_A}` },
    url: `chrome-extension://test/profile.html?pubkey=${PUB_A}`,
};
const RELAY = 'wss://profile.example';

/** A relay stand-in: stores events, answers REQ, OKs EVENT (unless `refuse`). */
function fakeRelay(Base = null) {
    const relay = { stored: [], published: [], refuse: false };
    const Parent = Base || class { constructor() { queueMicrotask(() => this.onopen?.()); } send() {} close() {} };
    class Sock extends Parent {
        constructor(url) {
            super(url);
            this.purl = url;
            if (!Base) this.readyState = 1;
        }

        out(f) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(f) }), 0); }

        send(text) {
            const [type, a, filter] = JSON.parse(text);
            if (this.purl !== RELAY) return super.send(text);
            if (type === 'REQ') {
                for (const e of relay.stored) if (filter.kinds?.includes(e.kind) && filter.authors?.includes(e.pubkey)) this.out(['EVENT', a, e]);
                this.out(['EOSE', a]);
            } else if (type === 'EVENT') {
                relay.published.push(a);
                if (!relay.refuse) relay.stored = [a, ...relay.stored.filter(e => !(e.kind === a.kind && e.pubkey === a.pubkey))];
                this.out(['OK', a.id, !relay.refuse, relay.refuse ? 'blocked: no' : '']);
            }
        }
    }
    vi.stubGlobal('WebSocket', Sock);
    return relay;
}

async function setRelays(env, index = 0) {
    const { profiles } = await globalThis.chrome.storage.local.get('profiles');
    profiles[index].relays = [{ url: RELAY, read: true, write: true }];
    await globalThis.chrome.storage.local.set({ profiles });
}

const k0 = (content, at = 1700000000, hex = HEX_A) => finalizeEvent({ kind: 0, created_at: at, tags: [], content: JSON.stringify(content) }, hexToBytes(hex));
const publish = (env, payload, sender = TAB, ms = 20000) => answerWithin(env.dispatch({ kind: 'profile.publish', payload }, sender), ms);

afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('profile.publish, local key', () => {
    it('keeps unknown fields and publishes to the write relays', async () => {
        const relay = fakeRelay();
        const env = await bootUnlocked();
        await setRelays(env);
        const old = await k0({ name: 'alice', birthday: { year: 1990 }, lud06: 'lnurl1xyz', custom: { a: [1, 2] }, displayName: 'A' });
        relay.stored.push(old);
        const res = await publish(env, { pubkey: PUB_A, baseId: old.id, changes: { name: 'Alice B', about: 'new' } });
        expect(res.success).toBe(true);
        expect(res.accepted).toBe(1);
        expect(res.total).toBe(1);
        const sent = relay.published[0];
        expect(sent.pubkey).toBe(PUB_A);
        expect(sent.created_at).toBeGreaterThan(old.created_at);
        expect(JSON.parse(sent.content)).toEqual({ name: 'Alice B', birthday: { year: 1990 }, lud06: 'lnurl1xyz', custom: { a: [1, 2] }, displayName: 'A', about: 'new' });
        expect(env.savedEvents.map(e => e.event.id)).toEqual([sent.id]);
    }, 30000);

    it('stops on a newer kind 0 than the loaded one and signs nothing', async () => {
        const relay = fakeRelay();
        const env = await bootUnlocked();
        await setRelays(env);
        const old = await k0({ name: 'alice' }, 1700000000);
        const newer = await k0({ name: 'alice2', lud06: 'x' }, 1700000100);
        relay.stored.push(newer);
        const res = await publish(env, { pubkey: PUB_A, baseId: old.id, changes: { name: 'mine' } });
        expect(res.code).toBe('stale');
        expect(res.event.id).toBe(newer.id);
        expect(res.content).toEqual({ name: 'alice2', lud06: 'x' });
        expect(relay.published).toEqual([]);
        expect(env.savedEvents).toEqual([]);
    }, 30000);

    it('treats zero accepting relays as a failure', async () => {
        const relay = fakeRelay();
        relay.refuse = true;
        const env = await bootUnlocked();
        await setRelays(env);
        const res = await publish(env, { pubkey: PUB_A, baseId: null, changes: { name: 'x' } });
        expect(res.success).toBe(false);
        expect(res.code).toBe('no-relay-accepted');
        expect(res.accepted).toBe(0);
        expect(env.savedEvents).toEqual([]);
    }, 30000);

    it('refuses invalid fields and non-https images before signing', async () => {
        const relay = fakeRelay();
        const env = await bootUnlocked();
        await setRelays(env);
        const res = await publish(env, { pubkey: PUB_A, baseId: null, changes: { picture: 'http://x.example/a.png' } });
        expect(res.code).toBe('invalid');
        expect(relay.published).toEqual([]);
    });
});

describe('profile.publish, the gates', () => {
    it('is refused from a web page sender', async () => {
        const relay = fakeRelay();
        const env = await bootUnlocked();
        await setRelays(env);
        const p = { pubkey: PUB_A, baseId: null, changes: { name: 'x' } };
        expect(await publish(env, p, PAGE_SENDER, 1000)).toEqual(REJECTED);
        expect(await publish(env, p, { ...PAGE_SENDER, url: 'https://evil.example/profile.html' }, 1000)).toEqual(REJECTED);
        expect(relay.published).toEqual([]);
    });

    it('refuses a pubkey that is not one of yours', async () => {
        const relay = fakeRelay();
        const env = await bootUnlocked();
        const res = await publish(env, { pubkey: 'f'.repeat(64), baseId: null, changes: { name: 'x' } });
        expect(res.code).toBe('not-mine');
        expect(relay.published).toEqual([]);
    });

    it('refuses while locked', async () => {
        const relay = fakeRelay();
        const env = await bootWithPassword('correct horse battery');
        const { profiles } = await globalThis.chrome.storage.local.get('profiles');
        profiles[0].pubKey = PUB_A;
        profiles[0].relays = [{ url: RELAY, read: true, write: true }];
        await globalThis.chrome.storage.local.set({ profiles });
        const res = await publish(env, { pubkey: PUB_A, baseId: null, changes: { name: 'x' } });
        expect(res.code).toBe('locked');
        expect(relay.published).toEqual([]);
    });
});

describe('profile.publish, bunker identity', () => {
    async function bootBunker() {
        const signer = installFakeSigner();
        const relay = fakeRelay(globalThis.WebSocket);
        const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
        const env = await bootWorker({
            profiles: [{ name: 'Remote', privKey: '', pubKey: '', type: 'bunker', bunkerUrl: null, remotePubkey: SIGNER_PUB, hosts: {}, relays: [{ url: RELAY, read: true, write: true }] }],
            profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
        });
        await env.dispatch({ kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: `bunker://${SIGNER_PUB}?relay=wss://relay.example.com` } });
        await env.flushWrites();
        return { env, signer, relay };
    }
    const BTAB = { ...TAB, url: `chrome-extension://test/profile.html?pubkey=${SIGNER_PUB}` };

    it('is signed by the bunker and published', async () => {
        const { env, signer, relay } = await bootBunker();
        const old = await k0({ name: 'r', lud06: 'keep' }, 1700000000, SIGNER_HEX);
        relay.stored.push(old);
        const res = await publish(env, { pubkey: SIGNER_PUB, baseId: old.id, changes: { name: 'R2' } }, BTAB);
        expect(res.success).toBe(true);
        expect(signer.requests.some(r => r.method === 'sign_event')).toBe(true);
        expect(JSON.parse(relay.published[0].content)).toEqual({ name: 'R2', lud06: 'keep' });
    }, 30000);

    it('rejects a signature from another pubkey and publishes nothing', async () => {
        const { env, signer, relay } = await bootBunker();
        signer.signAsHex = OTHER_SIGNER_HEX;
        const res = await publish(env, { pubkey: SIGNER_PUB, baseId: null, changes: { name: 'R2' } }, BTAB);
        expect(res.success).toBe(false);
        expect(res.code).toBe('sign-failed');
        expect(relay.published).toEqual([]);
        expect(env.savedEvents).toEqual([]);
    }, 30000);

    it('profile.fetch reports a reachable signer, and an unreachable one keeps Edit locked with a reason', async () => {
        const { env, signer } = await bootBunker();
        const ok = await answerWithin(env.dispatch({ kind: 'profile.fetch', payload: { pubkey: SIGNER_PUB } }, BTAB), 20000);
        expect(ok.signer).toEqual({ ready: true });
        signer.refuse.ping = 'offline';
        const down = await answerWithin(env.dispatch({ kind: 'profile.fetch', payload: { pubkey: SIGNER_PUB } }, BTAB), 20000);
        expect(down.signer.ready).toBe(false);
        expect(down.signer.reason).toMatch(/remote signer/);
    }, 30000);
});
