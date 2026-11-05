/**
 * A9: a new key that reads like one already on this device, or a signer that
 * answers with a different key, gets a warning the user can continue past.
 * Cancel on a remote signer connect leaves the prior session working.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { checkNewKey, newKeyWarning, truncateNpub } from '../src/utilities/npub-guard.js';
import {
  bootWorker, deviceWrapped, answerWithin, HEX_A, ORIGIN, PAGE_SENDER,
} from './helpers/boot-worker.js';
import { installFakeSigner, SIGNER_PUB, OTHER_SIGNER_PUB } from './helpers/fake-signer.js';

const HEAD = 'npub1abcdefg';                 // 12 shown
const TAIL = 'stuvwxyz';                     // 8 shown
const A = HEAD + 'q'.repeat(43) + TAIL;
const B = HEAD + 'p'.repeat(43) + TAIL;      // same short form, different key
const C = 'npub1zzzzzzz' + 'q'.repeat(43) + 'stuvwxyy';

describe('checkNewKey (Ring 0)', () => {
  it('finds a different key with the same short form', () => {
    expect(truncateNpub(A)).toBe(truncateNpub(B));
    const r = checkNewKey(B, [A, C]);
    expect(r.lookalikes).toEqual([A]);
    expect(r.warn).toBe(true);
  });

  it('a key that differs in the shown head or tail is not a lookalike', () => {
    expect(checkNewKey(C, [A]).warn).toBe(false);
    const tailOff = HEAD + 'q'.repeat(43) + 'stuvwxyq';
    expect(checkNewKey(tailOff, [A]).warn).toBe(false);
  });

  it('the same key is a duplicate, not a lookalike', () => {
    expect(checkNewKey(A, [A]).lookalikes).toEqual([]);
  });

  it('a replaced key is reported as changed', () => {
    expect(checkNewKey(C, [], { previous: A })).toMatchObject({ changed: true, warn: true });
    expect(checkNewKey(A, [], { previous: A }).changed).toBe(false);
    expect(checkNewKey(A, [], { previous: null }).changed).toBe(false);
  });

  it('bad input never throws and never warns', () => {
    for (const bad of [undefined, null, '', 42, {}]) {
      expect(checkNewKey(bad, [A, bad]).warn).toBe(false);
    }
    expect(checkNewKey(A, null).warn).toBe(false);
  });

  it('the warning shows both full keys, starts on Cancel and makes no promise', () => {
    const w = newKeyWarning(B, checkNewKey(B, [A]));
    expect(w.body).toContain(A);
    expect(w.body).toContain(B);
    expect(w.destructive).toBe(true);
    expect(w.cancelLabel).toBe('Cancel');
    expect(w.body + w.title).not.toMatch(/safe|protect|verified|guarantee/i);
    expect(newKeyWarning(C, checkNewKey(C, [A]))).toBeNull();
  });
});

describe('remote signer connect with a different key (Ring 2)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.chrome;
    delete globalThis.browser;
  });

  const ADDRESS = `bunker://${SIGNER_PUB}?relay=wss://relay.example.com`;
  const SIGN = { [ORIGIN]: { 'signEvent:1': 'allow' } };

  async function bootConnected() {
    const signer = installFakeSigner();
    const { deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    const env = await bootWorker({
      profiles: [{
        name: 'Remote', privKey: '', pubKey: '', relays: [], type: 'bunker',
        bunkerUrl: null, remotePubkey: SIGNER_PUB, hosts: SIGN,
      }],
      profileIndex: 0, isEncrypted: false, autoLockMinutes: 0, deviceKeySeed, deviceKeyStrategy,
    });
    const connect = () => env.dispatch({ kind: 'bunker.connect', payload: { profileIndex: 0, bunkerUrl: ADDRESS } });
    const first = await connect();
    expect(first).toMatchObject({ success: true, remotePubkey: SIGNER_PUB });
    expect(first.needsConfirm).toBeUndefined();
    await env.flushWrites();
    return { env, signer, connect };
  }

  const sign = (env) => answerWithin(env.dispatch({
    kind: 'signEvent', host: ORIGIN, payload: { kind: 1, content: 'x', tags: [], created_at: 1700000000 },
  }, PAGE_SENDER));

  it('asks first and changes nothing until the user answers', async () => {
    const { env, signer, connect } = await bootConnected();
    const before = JSON.stringify(env.local._dump().bunkerSessions);
    signer.pubAnswer = OTHER_SIGNER_PUB;
    const pending = await connect();
    await env.flushWrites();
    expect(pending).toMatchObject({ success: true, needsConfirm: true, remotePubkey: OTHER_SIGNER_PUB });
    expect(pending.warning.destructive).toBe(true);
    const profile = env.local._dump().profiles[0];
    expect(profile.remotePubkey).toBe(SIGNER_PUB);
    expect(profile.hosts).toEqual(SIGN);
    expect(JSON.stringify(env.local._dump().bunkerSessions)).toBe(before);
  });

  it('Cancel keeps the prior session signing', async () => {
    const { env, signer, connect } = await bootConnected();
    const before = JSON.stringify(env.local._dump().bunkerSessions);
    const closedBefore = signer.closed;
    signer.pubAnswer = OTHER_SIGNER_PUB;
    const pending = await connect();
    expect(await env.dispatch({ kind: 'bunker.cancelConnect', payload: pending.pendingId })).toEqual({ success: true });
    await env.flushWrites();
    expect(signer.closed).toBe(closedBefore + 1); // only the pending one closed
    delete signer.pubAnswer;

    const answer = await sign(env);
    expect(answer.sig).toBeTruthy();
    expect(answer.pubkey).toBe(SIGNER_PUB);
    expect(env.local._dump().profiles[0]).toMatchObject({ remotePubkey: SIGNER_PUB, hosts: SIGN });
    expect(JSON.stringify(env.local._dump().bunkerSessions)).toBe(before);
    expect(await env.dispatch({ kind: 'bunker.confirmConnect', payload: pending.pendingId }))
      .toMatchObject({ success: false });
  });

  it('Continue switches the profile to the new key', async () => {
    const { env, signer, connect } = await bootConnected();
    signer.pubAnswer = OTHER_SIGNER_PUB;
    const pending = await connect();
    expect(await env.dispatch({ kind: 'bunker.confirmConnect', payload: pending.pendingId }))
      .toEqual({ success: true, remotePubkey: OTHER_SIGNER_PUB });
    await env.flushWrites();
    expect(env.local._dump().profiles[0]).toMatchObject({ remotePubkey: OTHER_SIGNER_PUB, hosts: {} });
  });
});

describe('every entry point asks before adding a lookalike', () => {
  const { readFileSync } = require('node:fs');
  const { join } = require('node:path');
  const read = (rel) => readFileSync(join(__dirname, '..', 'src', rel), 'utf8');
  const body = (src, start, end) => src.slice(src.indexOf(start), src.indexOf(end, src.indexOf(start)));

  it('new profile, seed replace, key import and remote signer connect', () => {
    const side = read('sidepanel.js');
    expect(body(side, 'async function saveProfileChanges', 'async function deleteCurrentProfile')).toContain('confirmIfLookalike(');
    expect(body(side, 'async function handlePDSeedImport', "'savePrivateKey', payload: [index, result.hexKey]")).toContain('confirmIfLookalike(');
    expect(side).toMatch(/needsConfirm[\s\S]{0,200}insConfirm\(result\.warning\)[\s\S]{0,200}bunker\.cancelConnect/);
    expect(body(read('nostr-keys/nostr-keys.js'), 'async function importKeys', 'newProfile()')).toMatch(/checkNewKey[\s\S]*insConfirm\(warning\)/);
    expect(body(read('background.js'), "case 'bunker.connect':", "case 'bunker.confirmConnect':")).toMatch(/openPendingSession[\s\S]*connectWarning[\s\S]*holdPendingConnect/);
  });
});
