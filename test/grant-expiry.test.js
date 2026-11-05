/**
 * Site permissions can expire. A grant value is either a plain string, as
 * before, or { v: 'allow', exp, d } with `exp` in unix seconds. Expiry is read
 * at lookup; an expired or malformed value reads as 'ask'.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { installFakeChrome } from './helpers/fake-chrome.js';
import {
    resolveGrant, grantValue, grantState, DURATIONS, withoutNeverGranted,
} from '../src/utilities/consent-policy.js';

const NOW = 1_800_000_000;
const ORIGIN = 'https://site.example';
const KEY = 'signEvent:1';
const PK = 'a'.repeat(64);

describe('resolveGrant (Ring 0)', () => {
    const ok = { v: 'allow', exp: NOW + 3600, d: '1h' };

    it('keeps plain strings as stored, so an old bare allow is honoured', () => {
        for (const s of ['allow', 'deny', 'ask', 'reject']) expect(resolveGrant(s, NOW)).toBe(s);
    });

    it('an unexpired well-formed allow is allow', () => {
        expect(resolveGrant(ok, NOW)).toBe('allow');
        expect(resolveGrant({ v: 'allow', exp: NOW + DURATIONS['30d'], d: '30d' }, NOW)).toBe('allow');
    });

    it('boundary: allow one second before exp, ask at and after exp', () => {
        expect(resolveGrant(ok, ok.exp - 1)).toBe('allow');
        expect(resolveGrant(ok, ok.exp)).toBe('ask');
        expect(resolveGrant(ok, ok.exp + 1)).toBe('ask');
    });

    it('exp further off than its own duration reads as ask (clock moved back, or not ours)', () => {
        expect(resolveGrant({ v: 'allow', exp: NOW + 3601, d: '1h' }, NOW)).toBe('ask');
        expect(resolveGrant({ v: 'allow', exp: NOW + DURATIONS['30d'] + 1, d: '30d' }, NOW)).toBe('ask');
    });

    it('exp must be a safe integer: Infinity from 1e999, fractions, strings, huge values are rejected', () => {
        const bad = [JSON.parse('{"x":1e999}').x, NOW + 0.5, String(NOW + 60), 2 ** 53, NaN, -1, 0, null, undefined];
        for (const exp of bad) expect(resolveGrant({ v: 'allow', exp, d: '1h' }, NOW)).toBe('ask');
    });

    it('unit pin: exp is seconds; a millisecond value is rejected', () => {
        expect(resolveGrant({ v: 'allow', exp: (NOW + 60) * 1000, d: '1h' }, NOW)).toBe('ask');
        expect(resolveGrant({ v: 'allow', exp: (NOW + 60) * 1000, d: '30d' }, NOW * 1000)).toBe('ask');
    });

    it('d must be exactly one of the durations', () => {
        for (const d of ['ALLOW', '1H', ' 1h', 'forever', 'toString', '__proto__', 3600, null, undefined]) {
            expect(resolveGrant({ v: 'allow', exp: NOW + 60, d }, NOW)).toBe('ask');
        }
    });

    it('v must be exactly allow; deny never has an expiring form', () => {
        for (const v of ['ALLOW', 'deny', true, undefined]) {
            expect(resolveGrant({ v, exp: NOW + 60, d: '1h' }, NOW)).toBe('ask');
        }
    });

    it('other shapes read as ask', () => {
        for (const v of [null, undefined, 1, true, [], ['allow'], {}]) expect(resolveGrant(v, NOW)).toBe('ask');
    });

    it('a non-number now reads as ask', () => {
        expect(resolveGrant(ok, NaN)).toBe('ask');
        expect(resolveGrant(ok, undefined)).toBe('ask');
    });
});

describe('grantValue', () => {
    it('forever stores the plain string, so storage stays as before', () => {
        expect(grantValue('forever', NOW)).toBe('allow');
    });
    it('1h, 1d, 30d store an expiring allow that resolves now', () => {
        for (const d of ['1h', '1d', '30d']) {
            const v = grantValue(d, NOW);
            expect(v).toEqual({ v: 'allow', exp: NOW + DURATIONS[d], d });
            expect(resolveGrant(v, NOW)).toBe('allow');
            expect(resolveGrant(v, v.exp)).toBe('ask');
        }
    });
    it('anything else is not remembered', () => {
        for (const r of ['1H', '7d', 'toString', '', null, 3600, {}]) expect(grantValue(r, NOW)).toBe(null);
    });
});

describe('grantState and withoutNeverGranted read object values', () => {
    it('grantState shows an unexpired grant as allow and an expired one as ask', () => {
        expect(grantState(KEY, grantValue('1d', NOW), NOW)).toBe('allow');
        expect(grantState(KEY, grantValue('1d', NOW), NOW + DURATIONS['1d'])).toBe('ask');
    });
    it('an expiring allow under a never-granted key is removed like a plain one', () => {
        const [p] = withoutNeverGranted([{ hosts: { [ORIGIN]: { 'signEvent:5': { v: 'allow', exp: NOW + 60, d: '1h' } } } }]);
        expect(p.hosts[ORIGIN]['signEvent:5']).toBeUndefined();
    });
});

function makeProfile(overrides = {}) {
    return {
        name: 'A', privKey: '', pubKey: PK, hosts: {}, relays: [], relayReminder: false,
        type: 'local', bunkerUrl: null, remotePubkey: null, updatedAt: 1, ...overrides,
    };
}

async function boot(profiles) {
    vi.resetModules();
    const { local } = installFakeChrome();
    await local.set({ profiles, profileIndex: 0 });
    return { u: await import('../src/utilities/utils.js'), local };
}

describe('getPermission with expiring values (Ring 2)', () => {
    afterEach(() => {
        vi.useRealTimers();
        delete globalThis.chrome;
        delete globalThis.browser;
    });

    it('allows until expiry, then asks', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW * 1000);
        const { u } = await boot([makeProfile()]);
        await u.setPermission(PK, ORIGIN, KEY, grantValue('1h', NOW));
        expect(await u.getPermission(ORIGIN, KEY, 0)).toBe('allow');
        vi.setSystemTime((NOW + 3600) * 1000);
        expect(await u.getPermission(ORIGIN, KEY, 0)).toBe('ask');
    });

    it('a present full-origin entry wins even when expired; it never falls back to a bare-host allow', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW * 1000);
        const { u } = await boot([makeProfile({ hosts: {
            [ORIGIN]: { [KEY]: { v: 'allow', exp: NOW - 1, d: '1h' } },
            'site.example': { [KEY]: 'allow' },
        } })]);
        expect(await u.getPermission(ORIGIN, KEY, 0)).toBe('ask');
    });

    it('a malformed full-origin entry also wins over a bare-host allow', async () => {
        const { u } = await boot([makeProfile({ hosts: {
            [ORIGIN]: { [KEY]: { v: 'allow', exp: 1e999, d: '1h' } },
            'site.example': { [KEY]: 'allow' },
        } })]);
        expect(await u.getPermission(ORIGIN, KEY, 0)).toBe('ask');
    });

    it('an old bare-host allow is still honoured, and an expiring bare-host one expires', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW * 1000);
        const { u } = await boot([makeProfile({ hosts: {
            'site.example': { [KEY]: 'allow', 'signEvent:7': { v: 'allow', exp: NOW, d: '1h' } },
        } })]);
        expect(await u.getPermission(ORIGIN, KEY, 0)).toBe('allow');
        expect(await u.getPermission(ORIGIN, 'signEvent:7', 0)).toBe('ask');
    });

    it('composite keys like signEvent:24242:upload take expiring values', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW * 1000);
        const { u } = await boot([makeProfile()]);
        await u.setPermission(PK, ORIGIN, 'signEvent:24242:upload', grantValue('1d', NOW));
        expect(await u.getPermission(ORIGIN, 'signEvent:24242:upload', 0)).toBe('allow');
        expect(await u.getPermission(ORIGIN, 'signEvent:24242:delete', 0)).toBe('ask');
    });

    it('a grant write leaves updatedAt alone; a rename still moves it', async () => {
        const { u, local } = await boot([makeProfile({ updatedAt: 1 })]);
        await u.setPermission(PK, ORIGIN, KEY, grantValue('30d', Math.floor(Date.now() / 1000)));
        await u.setPermission(PK, ORIGIN, 'signEvent:7', 'deny');
        expect((await local.get('profiles')).profiles[0].updatedAt).toBe(1);
        await u.saveProfileName(0, 'Renamed');
        expect((await local.get('profiles')).profiles[0].updatedAt).toBeGreaterThan(1);
    });
});

describe('background wiring (source)', () => {
    const bg = readFileSync(new URL('../src/background.js', import.meta.url), 'utf8');

    it('both the fast path and the post-mutex path go through storedAnswer, which uses getPermission', () => {
        expect(bg.match(/await storedAnswer\(/g)?.length).toBeGreaterThanOrEqual(2);
        expect(bg).toMatch(/async function storedAnswer[\s\S]{0,200}getPermission\(/);
    });

    it('an allow is remembered with its duration; denies stay plain strings', () => {
        expect(bg).toMatch(/async function complete\(\{ payload, remember, rememberFor \}\)/);
        expect(bg).toMatch(/rememberAnswer\(held, 'deny'\)/);
    });

    it('expiry is read at lookup: grant code sets no timers', () => {
        const utils = readFileSync(new URL('../src/utilities/utils.js', import.meta.url), 'utf8');
        const policy = readFileSync(new URL('../src/utilities/consent-policy.js', import.meta.url), 'utf8');
        expect(policy).not.toMatch(/setTimeout|setInterval|alarms/);
        const grantCode = utils.slice(utils.indexOf('export async function getPermission'), utils.indexOf('export const SITE_REVOCATIONS_KEY'));
        expect(grantCode).not.toMatch(/setTimeout|setInterval|alarms|updatedAt\s*=/);
    });
});
