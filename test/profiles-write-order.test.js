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
