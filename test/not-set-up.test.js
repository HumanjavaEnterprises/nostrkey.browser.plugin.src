/**
 * A site asking before NostrKey has an identity (fresh install, or after
 * Reset Everything until NostrKey is opened) gets a clear answer straight
 * away and no prompt is shown.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { bootWorker, bootUnlocked, answerWithin, settle, track, ORIGIN, PUB_A, pageSender } from './helpers/boot-worker.js';

afterEach(() => { vi.restoreAllMocks(); });

const ask = (env, kind, payload) => env.dispatch({ kind, host: ORIGIN, payload }, pageSender(ORIGIN));
const note = () => ({ kind: 1, content: 'hi', tags: [], created_at: Math.floor(Date.now() / 1000) });

describe('requests before NostrKey is set up', () => {
    it('fresh install, no profiles: getPubKey is answered not_set_up with no prompt', async () => {
        const env = await bootWorker({});
        const res = await answerWithin(ask(env, 'getPubKey'));
        expect(res).toMatchObject({ error: 'not_set_up' });
        expect(env.tabs.shown).toHaveLength(0);
    });

    it('fresh install: signEvent is answered not_set_up with no prompt', async () => {
        const env = await bootWorker({});
        expect(await answerWithin(ask(env, 'signEvent', note()))).toMatchObject({ error: 'not_set_up' });
        expect(env.tabs.shown).toHaveLength(0);
    });

    it('after Reset Everything (a profile with no key): not_set_up', async () => {
        const env = await bootWorker({ profiles: [{ name: 'Default Nostr Profile', privKey: '', pubKey: '' }], profileIndex: 0 });
        expect(await answerWithin(ask(env, 'getPubKey'))).toMatchObject({ error: 'not_set_up' });
        expect(env.tabs.shown).toHaveLength(0);
    });

    it('with an identity, the request still asks as before', async () => {
        const env = await bootUnlocked();
        const answer = track(ask(env, 'getPubKey'));
        await settle(30);
        expect(answer.answered).toBe(false);
        expect(env.tabs.shown.length).toBeGreaterThan(0);
    });

    it('with an identity and a grant, it answers with the key', async () => {
        const env = await bootUnlocked({ [ORIGIN]: { getPubKey: 'allow' } });
        expect(await answerWithin(ask(env, 'getPubKey'))).toBe(PUB_A);
    });
});
