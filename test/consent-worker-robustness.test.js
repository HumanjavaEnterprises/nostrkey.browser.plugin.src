/**
 * Malformed window.nostr requests are answered, and later requests still run.
 *
 * Runs the REAL background worker (see helpers/boot-worker.js).
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { getPublicKeySync } from 'nostr-crypto-utils';
import {
    bootUnlocked, bootWorker, deviceWrapped, localProfile, answerWithin, settle, track,
    HEX_A, ORIGIN, PAGE_SENDER, PERMISSION_SENDER,
} from './helpers/boot-worker.js';

const GOOD_EVENT = { kind: 1, content: 'x', tags: [], created_at: 1700000000 };
const goodSign = { kind: 'signEvent', payload: GOOD_EVENT, host: ORIGIN };
const GRANTS = { [ORIGIN]: { 'signEvent:1': 'allow', addRelay: 'allow' } };

const send = (env, message) => env.dispatch(message, PAGE_SENDER);
const sign = (kind, extra = {}) => ({
    kind: 'signEvent',
    host: ORIGIN,
    payload: { ...GOOD_EVENT, kind, ...extra },
});

afterEach(() => {
    vi.useRealTimers();
    delete globalThis.chrome;
    delete globalThis.browser;
});

describe('malformed requests are answered', () => {
    const bad = {
        'signEvent with no payload': { kind: 'signEvent', host: ORIGIN },
        'signEvent with a null payload': { kind: 'signEvent', host: ORIGIN, payload: null },
        'signEvent with a non-object payload': { kind: 'signEvent', host: ORIGIN, payload: 'x' },
        'signEvent with no kind': { kind: 'signEvent', host: ORIGIN, payload: { content: 'x', tags: [] } },
        'a string kind': sign('1'),
        'an array kind': sign([1]),
        'a fractional kind': sign(1.5),
        'a negative kind': sign(-1),
        'a kind above the 16-bit range': sign(65536),
        'addRelay with no payload': { kind: 'addRelay', host: ORIGIN },
        'addRelay with a non-string url': { kind: 'addRelay', host: ORIGIN, payload: { url: 7 } },
        'nip04.encrypt with no payload': { kind: 'nip04.encrypt', host: ORIGIN },
        'nip04.decrypt with no cipherText': { kind: 'nip04.decrypt', host: ORIGIN, payload: { pubKey: 'a' } },
        'nip44.encrypt with no pubKey': { kind: 'nip44.encrypt', host: ORIGIN, payload: { plainText: 'a' } },
        'nip44.decrypt with no payload': { kind: 'nip44.decrypt', host: ORIGIN },
        'a creation time past what a date can hold': sign(1, { created_at: 1e20 }),
        'a negative creation time': sign(1, { created_at: -1 }),
        'a fractional creation time': sign(1, { created_at: 1.5 }),
    };

    for (const [name, message] of Object.entries(bad)) {
        it(`${name}: answered invalid_request, then a granted sign still works`, async () => {
            const env = await bootUnlocked(GRANTS);

            const answer = await answerWithin(send(env, message));
            expect(answer).toMatchObject({ error: 'invalid_request' });

            const next = await answerWithin(send(env, goodSign));
            expect(next).toMatchObject({ kind: 1 });
            expect(next.sig).toMatch(/^[0-9a-f]{128}$/);
            expect(env.tabs.shown).toEqual([]);
        });
    }

    // Kind 0 is left out: with nothing to compare it asks (E1, see effect-preview-worker).
    for (const kind of [30023, 65535]) {
        it(`kind ${kind} is well-formed and signs under a grant`, async () => {
            const env = await bootUnlocked({ [ORIGIN]: { [`signEvent:${kind}`]: 'allow' } });
            const answer = await answerWithin(send(env, sign(kind)));
            expect(answer).toMatchObject({ kind });
            expect(answer.sig).toMatch(/^[0-9a-f]{128}$/);
        });
    }

    it('a bad shape is answered inside 100 ms of fake time', async () => {
        const env = await bootUnlocked(GRANTS);
        vi.useFakeTimers();
        let answer = 'none';
        send(env, { kind: 'signEvent', host: ORIGIN }).then(a => { answer = a; });
        await vi.advanceTimersByTimeAsync(100);
        expect(answer).toMatchObject({ error: 'invalid_request' });
    });

    it('a kindless event is never signed as kind 1, whatever is stored', async () => {
        const env = await bootUnlocked({
            [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:undefined': 'allow' },
        });
        const answer = await answerWithin(send(env, {
            kind: 'signEvent', host: ORIGIN, payload: { content: 'x', tags: [], created_at: 1700000000 },
        }));
        expect(answer).toMatchObject({ error: 'invalid_request' });
        expect(answer.sig).toBeUndefined();
    });

    it('well-formed requests that take no payload are not refused', async () => {
        const env = await bootUnlocked({ [ORIGIN]: { getRelays: 'allow', getPubKey: 'allow' } });
        expect(await answerWithin(send(env, { kind: 'getPubKey', host: ORIGIN })))
            .toMatch(/^[0-9a-f]{64}$/);
        const relays = await answerWithin(send(env, { kind: 'getRelays', host: ORIGIN }));
        expect(relays?.error).toBeUndefined();
    });
});

describe('odd tags still get an answer', () => {
    for (const [name, tags] of [
        ['a null tag', [null]],
        ['a string in place of tags', 'x'],
        ['an array-like in place of tags', { length: 1 }],
    ]) {
        it(`kind 1 with ${name}`, async () => {
            const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
            const answer = await answerWithin(send(env, sign(1, { tags })));
            expect(answer).not.toBe('NO_ANSWER');
            expect(await answerWithin(send(env, goodSign))).toMatchObject({ kind: 1 });
        });

        it(`kind 24242 with ${name} asks, whatever is stored`, async () => {
            const env = await bootUnlocked({
                [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:24242': 'allow' },
            });
            send(env, sign(24242, { tags }));
            await settle(30);
            expect(env.tabs.shown).toHaveLength(1);
        });
    }
});

describe('a prompt that cannot be shown is answered and cleaned up', () => {
    it('a failed tab open answers the request and the next one proceeds', async () => {
        const env = await bootUnlocked(GRANTS, { sheet: false });
        env.tabs.createError = new Error('no tab for you');

        const answer = await answerWithin(send(env, sign(7)));
        expect(answer).toMatchObject({ error: 'request_failed' });

        env.tabs.createError = null;
        expect(await answerWithin(send(env, goodSign))).toMatchObject({ kind: 1 });
    });

    it('the failed prompt leaves no timer behind', async () => {
        const env = await bootUnlocked(GRANTS, { sheet: false });
        vi.useFakeTimers();
        env.tabs.createError = new Error('no tab for you');
        await answerWithin(send(env, sign(7)));
        expect(vi.getTimerCount()).toBe(0);
    });

    it('a slow failure from an expired prompt leaves the current prompt alone', async () => {
        const env = await bootUnlocked(GRANTS, { sheet: false });
        vi.useFakeTimers();

        // A never gets its tab, and runs out of time while waiting for one.
        const hold = env.tabs.holdCreate();
        const a = track(send(env, sign(7)));
        await settle(30);
        expect(vi.getTimerCount(), 'its auto-decline, and the wait for its surface').toBe(2);
        await vi.advanceTimersByTimeAsync(40_000);
        await settle();
        expect(a.answered).toBe(true);

        // B has the screen, and C waits behind it.
        const b = track(send(env, sign(3)));
        await settle(30);
        expect(env.tabs.shown.map(p => p.kind)).toEqual(['signEvent']);
        const [{ uuid: bUuid }] = env.tabs.shown;
        const c = track(send(env, sign(6)));
        await settle(30);

        // Now A's tab finally fails.
        hold.reject(new Error('no tab for you'));
        await settle(30);

        expect(vi.getTimerCount(), "B's auto-decline survives").toBe(1);
        expect(env.tabs.shown, 'B still holds the prompt').toHaveLength(1);
        expect(b.answered).toBe(false);
        expect(c.answered).toBe(false);

        await vi.advanceTimersByTimeAsync(40_000);
        await settle(30);
        expect(b.answered, 'B still auto-declines').toBe(true);
        expect(b.value).toMatchObject({ error: 'timed_out' });
        expect(env.tabs.shown).toHaveLength(2);
        expect(env.tabs.shown[1].uuid).not.toBe(bUuid);
    });
});

describe('queue numbers stay honest when a request leaves before its turn', () => {
    const approve = (env, uuid) => env.dispatch(
        { kind: 'allowed', payload: uuid, origKind: 'signEvent', event: GOOD_EVENT, remember: false, host: ORIGIN },
        PERMISSION_SENDER,
    );

    it('an invalid request does not count toward the prompt queue', async () => {
        const env = await bootUnlocked();
        const first = send(env, sign(1));
        await settle(30);
        const bad = await answerWithin(send(env, { kind: 'signEvent', host: ORIGIN }));
        expect(bad).toMatchObject({ error: 'invalid_request' });
        const second = send(env, sign(1));
        await settle(30);

        await approve(env, env.tabs.shown[0].uuid);
        await answerWithin(first);
        await settle(30);

        expect(env.tabs.shown[1]).toMatchObject({ queuePosition: 2, queueTotal: 2 });
        await approve(env, env.tabs.shown[1].uuid);
        await answerWithin(second);
    });

    it('a rate-limited request does not count toward the prompt queue', async () => {
        const env = await bootUnlocked();
        const pending = [1, 2, 3, 4, 5].map(() => send(env, sign(1)));
        await settle(30);
        const limited = await answerWithin(send(env, sign(1)));
        expect(limited).toMatchObject({ error: 'rate_limited' });

        for (let i = 0; i < 5; i++) {
            expect(env.tabs.shown[i]).toMatchObject({ queuePosition: i + 1, queueTotal: 5 });
            await approve(env, env.tabs.shown[i].uuid);
            await answerWithin(pending[i]);
            await settle(30);
        }
    });

    it('the numbers restart cleanly once a queue has drained through an early exit', async () => {
        const env = await bootUnlocked(GRANTS);
        await answerWithin(send(env, { kind: 'signEvent', host: ORIGIN }));
        const open = send(env, sign(3));
        await settle(30);
        expect(env.tabs.shown[0]).toMatchObject({ queuePosition: 1, queueTotal: 1 });
        await approve(env, env.tabs.shown[0].uuid);
        await answerWithin(open);
    });
});

describe('a background restart in the middle of a prompt', () => {
    async function restartedWithStaleUuid(extraHosts = {}) {
        const before = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow', ...extraHosts } });
        send(before, sign(3)); // this answer dies with the old worker
        await settle(30);
        const [{ uuid }] = before.tabs.shown;
        return { env: await before.restart(), uuid };
    }

    const hostsOf = async (env) => (await env.local.get('profiles')).profiles[0].hosts;

    it('a late allowed for the old uuid writes nothing and is answered', async () => {
        const { env, uuid } = await restartedWithStaleUuid();
        const before = await hostsOf(env);
        const answer = await answerWithin(env.dispatch({
            kind: 'allowed', payload: uuid, origKind: 'signEvent',
            event: { kind: 3 }, remember: true, host: ORIGIN,
        }, PERMISSION_SENDER));
        await env.flushWrites();
        expect(answer).toBe(true);
        expect(await hostsOf(env)).toEqual(before);
        expect(await answerWithin(send(env, goodSign))).toMatchObject({ kind: 1 });
    });

    it('a late denied for the old uuid writes nothing and is answered', async () => {
        const { env, uuid } = await restartedWithStaleUuid();
        const before = await hostsOf(env);
        const answer = await answerWithin(env.dispatch({
            kind: 'denied', payload: uuid, origKind: 'signEvent',
            event: { kind: 3 }, remember: true, host: ORIGIN,
        }, PERMISSION_SENDER));
        await env.flushWrites();
        expect(answer).toBe(true);
        expect(await hostsOf(env)).toEqual(before);
    });

    it('a late closePrompt is answered and signing still works', async () => {
        const { env } = await restartedWithStaleUuid();
        expect(await answerWithin(env.dispatch({ kind: 'closePrompt' }, PERMISSION_SENDER))).toBe(true);
        expect(await answerWithin(send(env, goodSign))).toMatchObject({ kind: 1 });
    });
});

describe('a profile that arrived by sync', () => {
    const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';

    it('can remember a site, and the grant is honoured', async () => {
        const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A, HEX_B);
        const env = await bootWorker({
            profiles: [localProfile(blobs[0])],
            profileIndex: 0,
            isEncrypted: false,
            autoLockMinutes: 0,
            deviceKeySeed,
            deviceKeyStrategy,
        });

        // A new identity adopted from sync arrives without a hosts map.
        const { hosts, ...synced } = localProfile(blobs[1], {}, {
            name: 'Synced', pubKey: getPublicKeySync(HEX_B), updatedAt: 1700000000,
        });
        const { mergeIntoLocal } = await import('../src/utilities/sync-manager.js');
        await mergeIntoLocal({ profiles: [synced] });
        await env.local.set({ profileIndex: 1 });
        await env.flushWrites();
        expect((await env.local.get('profiles')).profiles[1]).not.toHaveProperty('hosts');

        const first = send(env, sign(1));
        await settle(30);
        const [{ uuid }] = env.tabs.shown;
        await env.dispatch({
            kind: 'allowed', payload: uuid, origKind: 'signEvent',
            event: { ...GOOD_EVENT, kind: 1 }, remember: true, host: ORIGIN,
        }, PERMISSION_SENDER);
        expect(await answerWithin(first)).toMatchObject({ kind: 1 });
        await settle(30);

        const { profiles } = await env.local.get('profiles');
        expect(profiles[1].hosts[ORIGIN]).toEqual({ 'signEvent:1': 'allow' });

        expect(await answerWithin(send(env, sign(1)))).toMatchObject({ kind: 1 });
        expect(env.tabs.shown).toHaveLength(1);
    });
});

describe('a request that arrives while the worker is starting', () => {
    const PASSWORD = 'correct horse battery staple';
    const staff = (env, kind, payload) => env.dispatch({ kind, payload }, PERMISSION_SENDER);
    const parked = { keys: [[0, HEX_A]], lockAt: 0, keyRaw: null, salt: null };

    async function vault() {
        const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow' } });
        await staff(env, 'setPassword', PASSWORD);
        await env.flushWrites();
        const seed = env.local._dump();
        delete globalThis.chrome;
        return seed;
    }

    /** Boot with a request delivered as soon as the worker's listener exists. */
    async function wake(seed, sessionGet, before) {
        let answer;
        const env = await bootWorker(seed, {
            beforeBoot(e) {
                before?.(e);
                e.chrome.storage.session = {
                    get: sessionGet, set: async () => {}, remove: async () => {}, setAccessLevel: async () => {},
                };
                const add = e.chrome.runtime.onMessage.addListener;
                e.chrome.runtime.onMessage.addListener = (fn) => {
                    add(fn);
                    queueMicrotask(() => { answer = new Promise(r => fn(goodSign, PAGE_SENDER, r)); });
                };
            },
        });
        return { env, answer };
    }

    it('waits for a slow session read instead of reporting locked', async () => {
        const slow = async () => {
            await new Promise(r => setTimeout(r, 30));
            return { nkSessionState: parked };
        };
        const { env, answer } = await wake(await vault(), slow);
        expect(await answerWithin(answer)).toMatchObject({ kind: 1 });
        expect(env.tabs.sent.map(m => m.kind)).not.toContain('showLockedSheet');
    });

    it('a failing session read still gets an answer', async () => {
        const failing = async () => { throw new Error('no session area'); };
        const { answer } = await wake(await vault(), failing);
        expect(await answerWithin(answer)).toMatchObject({ error: 'locked' });
    });

    it('a session read that never finishes still gets an answer, and it is not a signature', async () => {
        const { answer } = await wake(await vault(), () => new Promise(() => {}));
        const reply = await answerWithin(answer, 4000);
        expect(reply).not.toBe('NO_ANSWER');
        expect(reply.sig).toBeUndefined();
    }, 8000);

    it('a startup that fails outright still gets an answer', async () => {
        const seed = await vault();
        const { answer } = await wake(seed, async () => ({}), (e) => {
            const raw = e.chrome.storage.local;
            const read = raw.get.bind(raw);
            raw.get = (...args) => {
                raw.get = read;
                return Promise.reject(new Error('storage unavailable'));
            };
        });
        const reply = await answerWithin(answer, 1000);
        expect(reply).not.toBe('NO_ANSWER');
        expect(reply.sig).toBeUndefined();
    }, 8000);
});

describe('a request too large to show', () => {
    const LARGE = 'a'.repeat(2_200_000);

    it('is refused with an error, opens nothing, and frees the way', async () => {
        const env = await bootUnlocked(GRANTS);
        const answer = await answerWithin(send(env, sign(7, { content: LARGE })));
        expect(answer).toMatchObject({ error: 'request_too_large' });
        expect(answer.sig).toBeUndefined();
        expect(env.tabs.shown).toEqual([]);
        expect(await answerWithin(send(env, goodSign))).toMatchObject({ kind: 1 });
    });

    it('takes up no room in the prompt limit', async () => {
        const env = await bootUnlocked();
        for (let i = 0; i < 6; i++) await answerWithin(send(env, sign(7, { content: LARGE })));
        send(env, sign(7));
        await settle(30);
        expect(env.tabs.shown).toHaveLength(1);
    });

    it('still signs under a grant, with nothing opened', async () => {
        const env = await bootUnlocked(GRANTS);
        const answer = await answerWithin(send(env, sign(1, { content: LARGE })), 4000);
        expect(answer).toMatchObject({ kind: 1, content: LARGE });
        expect(answer.sig).toMatch(/^[0-9a-f]{128}$/);
        expect(env.tabs.shown).toEqual([]);
    });

    it('is refused for a method too', async () => {
        const env = await bootUnlocked();
        const answer = await answerWithin(send(env, {
            kind: 'nip44.encrypt', host: ORIGIN, payload: { pubKey: 'a'.repeat(64), plainText: LARGE },
        }));
        expect(answer).toMatchObject({ error: 'request_too_large' });
        expect(env.tabs.shown).toEqual([]);
    });
});

describe('a surface that never reports ready', () => {
    const READY_MS = 6_000;
    const faked = async (opts) => {
        const env = await bootUnlocked({}, opts);
        vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
        return env;
    };

    it('a sheet moves to a tab once, with a fresh full window', async () => {
        const env = await faked({ deadSurface: true });
        const first = track(send(env, sign(3)));
        await settle(30);
        expect(env.tabs.shown.map(s => s.via)).toEqual(['sheet']);

        await vi.advanceTimersByTimeAsync(READY_MS - 1);
        await settle(30);
        expect(env.tabs.shown).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(1);
        await settle(30);
        expect(env.tabs.shown.map(s => s.via)).toEqual(['sheet', 'tab']);
        expect(env.tabs.shown[1].uuid).toBe(env.tabs.shown[0].uuid);
        expect(Number(new URL(env.tabs.shown[1].url).searchParams.get('deadline'))).toBe(Date.now() + 40_000);
        expect(env.tabs.sent.some(m => m.kind === 'closePermissionSheet')).toBe(true);
        expect(first.answered).toBe(false);
    });

    it('a tab that reports ready can be approved', async () => {
        const env = await faked({ deadSurface: true });
        const first = track(send(env, sign(1)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        const { uuid } = env.tabs.shown[1];
        await env.dispatch({ kind: 'promptReady', payload: uuid }, PERMISSION_SENDER);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        expect(first.answered).toBe(false);
        await env.dispatch({ kind: 'allowed', payload: uuid }, PERMISSION_SENDER);
        await settle(30);
        expect(first.value?.sig).toMatch(/^[0-9a-f]{128}$/);
    });

    it('a tab that also never reports ready is declined, and the next request gets its turn', async () => {
        const env = await faked({ deadSurface: true });
        const first = track(send(env, sign(3)));
        await settle(30);
        const waiter = track(send(env, sign(7)));
        await settle(30);

        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS - 1);
        await settle(30);
        expect(first.answered).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        await settle(30);
        expect(first.answered).toBe(true);
        expect(first.value).toMatchObject({ error: 'denied' });
        expect(env.tabs.shown.map(s => s.via)).toEqual(['sheet', 'tab', 'sheet']);
        expect(waiter.answered).toBe(false);
    });

    it('a tab that cannot open is declined at once', async () => {
        const env = await faked({ deadSurface: true });
        const first = track(send(env, sign(3)));
        await settle(30);
        env.tabs.createError = new Error('no tab');
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        expect(first.answered).toBe(true);
        expect(first.value).toMatchObject({ error: 'denied' });
    });

    it('a page too busy to take the sheet gets the tab, and one surface in the end', async () => {
        const env = await faked({ deadSurface: true });
        const held = env.tabs.holdSheet();
        const first = track(send(env, sign(3)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        expect(env.tabs.shown.map(s => s.via)).toEqual(['tab']);

        held.resolve();
        await settle(30);
        expect(env.tabs.sent.at(-1).kind).toBe('closePermissionSheet');
        expect(env.tabs.shown.filter(s => s.via === 'tab')).toHaveLength(1);
        expect(first.answered).toBe(false);
    });

    it('a busy page whose sheet then fails opens no second tab', async () => {
        const env = await faked({ deadSurface: true });
        const held = env.tabs.holdSheet();
        track(send(env, sign(3)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        held.reject(new Error('no receiver'));
        await settle(30);
        expect(env.tabs.shown.filter(s => s.via === 'tab')).toHaveLength(1);
    });

    it('in a tab, the same', async () => {
        const env = await faked({ deadSurface: true, sheet: false });
        const first = track(send(env, sign(3)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        expect(first.answered).toBe(true);
    });

    it('a surface that reports ready keeps its full time', async () => {
        const env = await faked();
        const first = track(send(env, sign(3)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(39_999);
        await settle(30);
        expect(first.answered).toBe(false);
        await vi.advanceTimersByTimeAsync(1);
        await settle(30);
        expect(first.answered).toBe(true);
    });

    it('a web page cannot report ready for one', async () => {
        const env = await faked({ deadSurface: true, sheet: false });
        const first = track(send(env, sign(3)));
        await settle(30);
        await env.dispatch({ kind: 'promptReady', payload: env.tabs.shown[0].uuid }, PAGE_SENDER);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        expect(first.answered).toBe(true);
    });

    it('a hold note is refused from a page and changes nothing from the surface', async () => {
        const env = await faked({ sheet: false });
        const first = track(send(env, sign(3)));
        await settle(30);
        const uuid = env.tabs.shown[0].uuid;
        expect(await env.dispatch({ kind: 'holdPrompt', payload: uuid }, PAGE_SENDER))
            .toMatchObject({ success: false, error: 'Unauthorized sender' });
        expect(await env.dispatch({ kind: 'holdPrompt', payload: uuid }, PERMISSION_SENDER)).toBe(true);
        expect(await env.dispatch({ kind: 'holdPrompt', payload: 'not-the-open-one' }, PERMISSION_SENDER)).toBe(false);
        expect(first.answered).toBe(false);
    });

    it('the minimized button\'s note from a page changes nothing', async () => {
        const env = await faked({ sheet: false });
        const first = track(send(env, sign(3)));
        await settle(30);
        expect(await env.dispatch({ kind: 'holdMinimizedPrompt' }, PAGE_SENDER)).toBe(true);
        await settle(30);
        expect(first.answered).toBe(false);
        expect(env.tabs.shown).toHaveLength(1);
    });

    describe.each([
        ['an ordinary event', sign(1), 'sheet', 'tab'],
        ['a delete', sign(5), 'tab', 'tab'],
        ['a request for the public key', { kind: 'getPubKey', host: ORIGIN }, 'sheet', 'tab'],
    ])('where %s opens', (_, request, byDefault, whenChosen) => {
        it('by default', async () => {
            const env = await faked();
            track(send(env, request));
            await settle(30);
            expect(env.tabs.shown.map(s => s.via)).toEqual([byDefault]);
        });

        it('with all approvals in a tab', async () => {
            const env = await faked();
            await env.dispatch({ kind: 'setApprovalsInTab', payload: true }, PERMISSION_SENDER);
            track(send(env, request));
            await settle(30);
            expect(env.tabs.shown.map(s => s.via)).toEqual([whenChosen]);
        });
    });

    it('a page cannot change where approvals open', async () => {
        const env = await faked();
        expect(await env.dispatch({ kind: 'setApprovalsInTab', payload: true }, PAGE_SENDER))
            .toMatchObject({ success: false, error: 'Unauthorized sender' });
        expect(await env.dispatch({ kind: 'getApprovalsInTab' }, PERMISSION_SENDER)).toBe(false);
    });

    it('a ready report for another request changes nothing', async () => {
        const env = await faked({ deadSurface: true, sheet: false });
        const first = track(send(env, sign(3)));
        await settle(30);
        await env.dispatch({ kind: 'promptReady', payload: 'not-the-open-one' }, PERMISSION_SENDER);
        await vi.advanceTimersByTimeAsync(READY_MS);
        await settle(30);
        expect(first.answered).toBe(true);
    });

    it('a late timer does not touch the prompt that came after', async () => {
        const env = await faked({ deadSurface: true });
        const first = track(send(env, sign(3)));
        await settle(30);
        await env.dispatch({ kind: 'denied', payload: env.tabs.shown[0].uuid }, PERMISSION_SENDER);
        await settle(30);
        expect(first.answered).toBe(true);
        await vi.advanceTimersByTimeAsync(READY_MS - 1000);
        const next = track(send(env, sign(7)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS - 1);
        await settle(30);
        expect(next.answered).toBe(false);
    });

    it('a tab reopened from the sheet gets the same bound', async () => {
        const env = await faked({ deadSurface: true });
        const first = track(send(env, sign(3)));
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS - 1000);
        await env.dispatch({ kind: 'permissionSheetCompromised' }, PAGE_SENDER);
        await settle(30);
        await vi.advanceTimersByTimeAsync(READY_MS - 1);
        await settle(30);
        expect(first.answered).toBe(false);
        await vi.advanceTimersByTimeAsync(1);
        await settle(30);
        expect(first.answered).toBe(true);
    });
});
