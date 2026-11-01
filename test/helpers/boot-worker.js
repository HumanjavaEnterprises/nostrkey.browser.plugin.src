/**
 * Boots the REAL src/background.js on the fake chrome harness and drives it
 * through `chrome.runtime.onMessage`, the same door a website's window.nostr
 * call or the extension's own permission page uses. Nothing here reaches into
 * the worker's internals; a suite observes only answers, storage and the tabs
 * calls below.
 *
 * Demo material only: HEX_A is a secp256k1 generator multiple.
 */

import { vi } from 'vitest';
import { getPublicKeySync } from 'nostr-crypto-utils';
import { installFakeChrome, flushStorageWrites } from './fake-chrome.js';

export const HEX_A = '0000000000000000000000000000000000000000000000000000000000000001';
export const PUB_A = getPublicKeySync(HEX_A);
export const ORIGIN = 'https://example.com';

/** The sender shape a content script has: our id, a tab, a WEB PAGE url. */
export const pageSender = (origin) => ({
    id: 'test-extension-id',
    tab: { id: 7, url: `${origin}/app` },
    url: `${origin}/app`,
});

export const PAGE_SENDER = pageSender(ORIGIN);

/** The sender shape of our own permission page, opened as a tab. */
export const PERMISSION_SENDER = {
    id: 'test-extension-id',
    tab: { id: 99, url: 'chrome-extension://test/permission/permission.html' },
    url: 'chrome-extension://test/permission/permission.html',
};

/**
 * Let the worker's async startup and any queued write settle. Runs on the real
 * clock (flushStorageWrites), so it also works while a suite fakes timers.
 */
export function settle(ticks = 12) {
    return flushStorageWrites(ticks);
}

/**
 * A stand-in for `chrome.tabs` that records what the worker shows.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.sheet] the active tab can host the in-page sheet
 *        (default). False leaves only the dedicated-tab fallback.
 *
 * A surface that opens reports ready, as the real page does. Boot with
 * `deadSurface: true` for one that opens and never does.
 */
function fakeTabs({ sheet = true } = {}) {
    const state = {
        shown: [],          // { uuid, kind, host, queuePosition, queueTotal, url, via }
        sent: [],           // every tabs.sendMessage message
        sentTo: [],         // the tab id of each of those, in the same order
        queries: [],        // the arguments of every tabs.query
        createError: null,  // set to make tabs.create reject
        createHold: null,   // see holdCreate()
        sheetHold: null,    // see holdSheet()
        nextTabId: 100,
        sheet,              // can the active tab host the sheet? May change mid-test
        deadTabs: new Set(), // tab ids tabs.get should fail for
        /** Make the next tabs.create wait until the returned promise settles. */
        holdCreate() {
            let resolve;
            let reject;
            const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
            state.createHold = promise;
            return { resolve, reject };
        },
    };
    /** Make the next sheet wait, as a busy page does, until the promise settles. */
    state.holdSheet = () => {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
        state.sheetHold = promise;
        return { resolve, reject };
    };
    const record = (url, via) => {
        const q = new URL(url).searchParams;
        state.shown.push({
            uuid: q.get('uuid'),
            kind: q.get('kind'),
            host: q.get('host'),
            queuePosition: Number(q.get('queuePosition')),
            queueTotal: Number(q.get('queueTotal')),
            url,
            via,
        });
        state.onShown?.(q.get('uuid'));
    };
    const tabs = {
        query: async (queryInfo) => {
            state.queries.push(queryInfo);
            return state.sheet ? [{ id: 7, url: `${ORIGIN}/app` }] : [];
        },
        getCurrent: async () => undefined,
        get: async (id) => {
            if (state.deadTabs.has(id)) throw new Error(`No tab with id: ${id}`);
            return { id };
        },
        create: async ({ url }) => {
            const hold = state.createHold;
            state.createHold = null;
            if (hold) await hold;
            if (state.createError) throw state.createError;
            record(url, 'tab');
            return { id: state.nextTabId++ };
        },
        sendMessage: async (tabId, message) => {
            state.sent.push(message);
            state.sentTo.push(tabId);
            if (message.kind === 'showPermissionSheet') {
                const hold = state.sheetHold;
                state.sheetHold = null;
                if (hold) await hold;
                record(message.url, 'sheet');
            }
        },
    };
    return { tabs, state };
}

/**
 * Boot the worker on a fresh fake chrome.
 *
 * @param {object} [seedLocal] initial storage.local
 * @param {object} [opts]      see fakeTabs; `opts.sync` seeds storage.sync,
 *                             `opts.origin` and `opts.namespace` pick the engine
 *                             as in installFakeChrome, and
 *                             `opts.beforeBoot(env)` runs before the worker loads
 * @returns the fake chrome env plus `tabs` (the recording state) and
 *          `restart()`, which re-imports the worker over the same stored data,
 *          exactly what a background restart does: storage survives and every
 *          in-memory prompt is gone.
 */
export async function bootWorker(seedLocal = {}, opts = {}) {
    vi.resetModules();
    const env = installFakeChrome({ alarms: true, origin: opts.origin, namespace: opts.namespace });
    const { tabs, state } = fakeTabs(opts);
    env.chrome.tabs = tabs;
    const addListener = env.chrome.runtime.onMessage.addListener;
    env.chrome.runtime.onMessage.addListener = (fn) => {
        // Lets a suite count responses, which dispatch() cannot show.
        env.deliver ??= (message, sender, sendResponse) => fn(message, sender, sendResponse);
        addListener(fn);
    };
    env.local._seed(seedLocal);
    if (opts.sync) env.sync._seed(opts.sync);
    opts.beforeBoot?.(env);
    // Event history lives in IndexedDB, which the harness does not provide.
    env.savedEvents = [];
    vi.doMock('../../src/utilities/db', async (importOriginal) => ({
        ...(await importOriginal()),
        saveEvent: async (entry) => { env.savedEvents.push(entry); },
    }));
    env.setSendMessage((msg) => env.dispatch(msg));
    await import('../../src/background.js');
    await settle();
    env.tabs = state;
    if (!opts.deadSurface) {
        state.onShown = (uuid) => env.deliver({ kind: 'promptReady', payload: uuid }, PERMISSION_SENDER, () => {});
    }
    env.restart = async () => {
        await env.flushWrites();
        return bootWorker(env.local._dump(), { ...opts, sync: env.sync._dump() });
    };
    return env;
}

/**
 * Mint device blobs the way the extension does, in a throwaway context, and
 * hand back the `deviceKeySeed` they were wrapped under so a freshly booted
 * worker resolves the SAME device key from storage.local.
 */
export async function deviceWrapped(...secrets) {
    vi.resetModules();
    const env = installFakeChrome();
    const { encryptWithDeviceKey } = await import('../../src/utilities/secret-vault.js');
    const blobs = [];
    for (const s of secrets) blobs.push(await encryptWithDeviceKey(s));
    await env.flushWrites();
    const { deviceKeySeed, deviceKeyStrategy } = env.local._dump();
    delete globalThis.chrome;
    return { blobs, deviceKeySeed, deviceKeyStrategy };
}

/** A local profile for an unlocked, passwordless vault. */
export function localProfile(privKey, hosts = {}, overrides = {}) {
    return {
        name: 'P1', privKey, pubKey: PUB_A, hosts,
        relays: [], type: 'local', bunkerUrl: null, remotePubkey: null,
        ...overrides,
    };
}

/** Boot an unlocked, passwordless vault whose one profile holds `hosts`. */
export async function bootUnlocked(hosts = {}, opts = {}) {
    const { blobs, deviceKeySeed, deviceKeyStrategy } = await deviceWrapped(HEX_A);
    return bootWorker({
        profiles: [localProfile(blobs[0], hosts)],
        profileIndex: 0,
        isEncrypted: false,
        autoLockMinutes: 0,
        deviceKeySeed,
        deviceKeyStrategy,
    }, opts);
}

/**
 * Boot a vault protected by `password`, still locked, whose one profile holds
 * HEX_A. `extra` adds to or replaces what is stored.
 */
export async function bootWithPassword(password, extra = {}, opts = {}) {
    const { encrypt, hashPassword } = await import('../../src/utilities/crypto.js');
    const { hash, salt } = await hashPassword(password);
    return bootWorker({
        profiles: [localProfile(await encrypt(HEX_A, password))],
        profileIndex: 0,
        isEncrypted: true,
        passwordHash: hash,
        passwordSalt: salt,
        autoLockMinutes: 0,
        ...extra,
    }, opts);
}

/** Watch a pending answer without awaiting it, for suites that fake the clock. */
export function track(promise) {
    const tracked = { answered: false, value: undefined };
    promise.then((value) => { tracked.answered = true; tracked.value = value; });
    return tracked;
}

/** Resolve with the answer, or the string 'NO_ANSWER' after `ms` of real time. */
export function answerWithin(promise, ms = 1500) {
    let timer;
    const noAnswer = new Promise(r => { timer = setTimeout(() => r('NO_ANSWER'), ms); });
    return Promise.race([promise, noAnswer]).finally(() => clearTimeout(timer));
}
