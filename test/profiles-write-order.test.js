/**
 * Profiles writes land in order: a slow writer works from a fresh read when it
 * finally writes, so it never puts back a stale copy over someone else's change.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  bootWorker, bootUnlocked, answerWithin, settle, localProfile,
  HEX_A, PUB_A, ORIGIN, PERMISSION_SENDER,
} from './helpers/boot-worker.js';
import { installFakeChrome } from './helpers/fake-chrome.js';

const RELAYS = [{ url: 'wss://relay.example.com/', read: true, write: true }];

function gate() {
  let open;
  const opened = new Promise((r) => { open = r; });
  return { opened, open };
}

afterEach(() => {
  vi.doUnmock('../src/utilities/secret-vault');
  vi.doUnmock('../src/profiles/kind0.js');
  delete globalThis.chrome;
  delete globalThis.browser;
});

describe('profiles writes keep each other\'s changes', () => {
  it('a slow at-rest migration and a relays edit made meanwhile both persist', async () => {
    const slow = gate();
    let entered = false;
    const env = await bootWorker({
      profiles: [localProfile(HEX_A, {}, { pubKey: '' })],
      profileIndex: 0,
      isEncrypted: false,
      autoLockMinutes: 0,
    }, {
      beforeBoot: () => {
        vi.doMock('../src/utilities/secret-vault', async (importOriginal) => {
          const real = await importOriginal();
          return {
            ...real,
            encryptWithDeviceKey: async (value) => {
              entered = true;
              await slow.opened;
              return real.encryptWithDeviceKey(value);
            },
          };
        });
      },
    });
    expect(entered).toBe(true); // the migration is mid-flight

    const { saveRelays } = await import('../src/utilities/utils.js');
    await saveRelays(0, RELAYS);
    slow.open();
    await settle(30);

    const [p] = env.local._dump().profiles;
    expect(p.relays).toEqual(RELAYS);
    expect(p.privKey).not.toBe(HEX_A); // wrapped at rest
    expect(p.pubKey).toBe(PUB_A);
  });

  it('a revoke made while a profile fetch is out stays revoked', async () => {
    const slow = gate();
    const env = await bootUnlocked({ [ORIGIN]: { 'signEvent:1': 'allow', 'signEvent:7': 'allow' } }, {
      beforeBoot: () => {
        vi.doMock('../src/profiles/kind0.js', async (importOriginal) => ({
          ...(await importOriginal()),
          fetchProfile: async () => {
            await slow.opened;
            return {
              state: 'found', event: null, content: {}, answered: 1, asked: 1,
              relayListEvent: { kind: 10002, created_at: 1700000000, tags: [], pubkey: PUB_A },
            };
          },
        }));
      },
    });

    const answer = env.dispatch({ kind: 'profile.fetch', payload: { pubkey: PUB_A } }, PERMISSION_SENDER);
    await settle(10);
    const { revokePermission } = await import('../src/utilities/utils.js');
    // The fetch comes back while the revoke is between its read and its write.
    slow.open();
    await revokePermission({ pubkey: PUB_A }, ORIGIN, 'signEvent:1');
    await answerWithin(answer);
    await settle(10);

    const [p] = env.local._dump().profiles;
    expect(p.hosts[ORIGIN]).toEqual({ 'signEvent:7': 'allow' });
    expect(p.relayListEvent?.created_at).toBe(1700000000);
  });

  it('two grants stored at once for different sites both persist', async () => {
    vi.resetModules();
    const env = installFakeChrome();
    env.local._seed({ profiles: [localProfile('x', {})], profileIndex: 0 });
    const { setPermission } = await import('../src/utilities/utils.js');
    await Promise.all([
      setPermission(PUB_A, 'https://a.example', 'signEvent:1', 'allow'),
      setPermission(PUB_A, 'https://b.example', 'signEvent:1', 'allow'),
    ]);
    await env.flushWrites();
    const [p] = env.local._dump().profiles;
    expect(p.hosts).toEqual({
      'https://a.example': { 'signEvent:1': 'allow' },
      'https://b.example': { 'signEvent:1': 'allow' },
    });
  });
});

describe('checker follow-ups', () => {
  async function fresh(seed) {
    vi.resetModules();
    const env = installFakeChrome();
    env.setSendMessage(async () => undefined);
    env.local._seed(seed);
    return env;
  }

  it('a grant for an unread identity does not land on whoever took its slot', async () => {
    const env = await fresh({
      profiles: [localProfile('blobA', {}, { pubKey: '' }), localProfile('blobB', {}, { pubKey: '', name: 'P2' })],
      profileIndex: 0,
    });
    const utils = await import('../src/utilities/utils.js');
    const del = utils.deleteProfile(0);
    const grant = utils.setPermissionForUnreadIdentity(0, ORIGIN, 'signEvent:1', 'allow', { unreadKey: 'blobA' });
    await del;
    await expect(grant).rejects.toThrow();
    await utils.revokePermission({ index: 0, unreadKey: 'blobA' }, ORIGIN, 'signEvent:1');
    await env.flushWrites();
    const { profiles } = env.local._dump();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].privKey).toBe('blobB');
    expect(profiles[0].hosts).toEqual({});
  });

  it('a key added while the password changes is re-wrapped under the new one', async () => {
    const { encrypt, decrypt } = await import('../src/utilities/crypto.js');
    const HEX_B = '0000000000000000000000000000000000000000000000000000000000000002';
    const env = await fresh({
      profiles: [localProfile(await encrypt(HEX_A, 'old'))],
      profileIndex: 0,
      isEncrypted: true,
    });
    const blobB = await encrypt(HEX_B, 'old');
    const utils = await import('../src/utilities/utils.js');
    const { updateProfiles } = await import('../src/utilities/profiles-store.js');
    // Add the second key once the change has read the list and is doing its crypto.
    let readList;
    const listRead = new Promise((r) => { readList = r; });
    const get = env.local.get;
    env.local.get = (q) => { if (q === 'profiles' || q?.profiles) readList(); return get(q); };
    const change = utils.changePasswordForKeys('old', 'new');
    await listRead;
    env.local.get = get;
    await updateProfiles((profiles) => { profiles.push(localProfile(blobB, {}, { pubKey: '', name: 'P2' })); });
    expect(await change).toEqual({ skipped: [] });
    await env.flushWrites();
    const { profiles, passwordHash } = env.local._dump();
    expect(passwordHash).toBeTruthy();
    expect(await decrypt(profiles[0].privKey, 'new')).toBe(HEX_A);
    expect(await decrypt(profiles[1].privKey, 'new')).toBe(HEX_B);
  });

  it('a profiles write started from inside a mutator is refused, not deadlocked', async () => {
    await fresh({ profiles: [localProfile('x')] });
    const { updateProfiles } = await import('../src/utilities/profiles-store.js');
    await expect(updateProfiles(() => { updateProfiles(() => {}); })).rejects.toThrow(/inside a profiles mutator/);
    // The lock is free again afterwards.
    expect((await updateProfiles(() => {})).written).toBe(true);
  });
});
