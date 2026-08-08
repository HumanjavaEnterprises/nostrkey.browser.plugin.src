/**
 * Minimal in-memory `chrome.*` stand-in for exercising the REAL extension
 * storage modules (utils / api-key-store / vault-store / sync-manager /
 * secret-vault) under vitest.
 *
 * `src/utilities/browser-polyfill.js` reads the global `chrome`/`browser`
 * namespace at import time and throws if neither exists, so the caller MUST
 * install this on `globalThis.chrome` BEFORE dynamically importing any module
 * that pulls in the polyfill. By default only `chrome` is set (not `browser`)
 * so the polyfill takes its Chromium code path; every method returns a Promise,
 * which the polyfill passes straight through. Pass `namespace: 'browser'` for
 * the Safari/Firefox shape, where only `browser` exists.
 *
 * No IndexedDB is provided, so secret-vault falls back to an in-memory
 * non-extractable device key — exactly the passwordless at-rest path we test.
 */

/**
 * chrome.storage.local's real per-item ceiling (8 MB). `sync` is far smaller
 * (8 KB) but the suites only ever push small blobs at `sync`, so both areas
 * start at the local number; a test that wants to prove the quota path can
 * lower `area.QUOTA_BYTES_PER_ITEM` in place (it is read on every `set`).
 */
const QUOTA_BYTES_PER_ITEM = 8192 * 1024;

/**
 * The real `setTimeout`, captured at module load — i.e. before any suite calls
 * `vi.useFakeTimers()`. Storage is the *browser*, not the code under test: a
 * suite that fakes the clock to drive a debounce must not also freeze the
 * storage backend, or every `await storage.set(...)` deadlocks. Writes still
 * land on a macrotask (so a dropped `await` in src is observable); they just
 * land on the real one.
 */
const realSetTimeout = globalThis.setTimeout.bind(globalThis);

/**
 * Wait for queued `storage.*.set()` writes to actually land.
 *
 * Because `set()` resolves on a macrotask, a test that fires a write it does
 * not await (or that drives src which fires one) must yield before reading the
 * store back — exactly as a real extension must let the browser's storage IPC
 * complete. Several ticks so a short write→read→write chain settles too.
 *
 * If an assertion only passes with an ever-growing tick count, that is the
 * signal of a genuinely dropped write in src, not a flaky harness.
 */
export function flushStorageWrites(ticks = 3) {
    let p = Promise.resolve();
    for (let i = 0; i < ticks; i++) {
        p = p.then(() => new Promise(r => realSetTimeout(r, 0)));
    }
    return p;
}

/** Deep copy across the fake storage boundary, exactly like a real IPC hop. */
function copy(value) {
    return value === undefined ? undefined : structuredClone(value);
}

/**
 * Byte cost chrome charges for one item: the key plus the JSON serialization
 * of the value.
 */
function itemBytes(key, value) {
    const json = value === undefined ? '' : (JSON.stringify(value) ?? '');
    return String(key).length + json.length;
}

function makeArea(areaOpts = {}) {
    let data = {};

    function get(query) {
        // chrome semantics: null → everything; string → {k:v}; array → subset;
        // object → defaults overridden by stored values.
        // Every stored value is deep-copied on the way out: the caller gets a
        // detached snapshot, never a live handle into the store. That is what
        // makes "src mutated the object in place and never wrote it back" a
        // FAILURE here instead of an invisible no-op.
        if (query == null) return Promise.resolve(copy(data));
        if (typeof query === 'string') {
            return Promise.resolve(query in data ? { [query]: copy(data[query]) } : {});
        }
        if (Array.isArray(query)) {
            const out = {};
            for (const k of query) if (k in data) out[k] = copy(data[k]);
            return Promise.resolve(out);
        }
        // object of defaults
        const out = {};
        for (const [k, def] of Object.entries(query)) {
            out[k] = k in data ? copy(data[k]) : def;
        }
        return Promise.resolve(out);
    }

    /**
     * Writes land on a MACROTASK, not synchronously and not on the microtask
     * queue. A `storage.set(...)` whose promise is never awaited therefore
     * shows up as a missing (or late) write on the next `get`, instead of
     * being silently already-applied.
     */
    function set(obj) {
        if (obj == null || typeof obj !== 'object') {
            return Promise.reject(new TypeError('storage.set expects an object'));
        }
        // Snapshot the caller's object up front so later mutations of the
        // argument cannot leak into the store, and so the store never hands
        // the caller a live reference back.
        let staged;
        try {
            staged = Object.fromEntries(
                Object.entries(obj).map(([k, v]) => [k, copy(v)]),
            );
        } catch (err) {
            return Promise.reject(err);
        }
        const limit = area.QUOTA_BYTES_PER_ITEM;
        const oversized = Object.entries(staged)
            .find(([k, v]) => itemBytes(k, v) > limit);
        return new Promise((resolve, reject) => {
            realSetTimeout(() => {
                if (oversized) {
                    reject(new Error(
                        `QUOTA_BYTES_PER_ITEM quota exceeded for key "${oversized[0]}"`,
                    ));
                    return;
                }
                Object.assign(data, staged);
                resolve();
            }, 0);
        });
    }

    const area = {
        // Mirrors the constant chrome exposes on the area object. Writable so a
        // test can lower it and exercise the rejection path.
        QUOTA_BYTES_PER_ITEM: areaOpts.quotaBytesPerItem ?? QUOTA_BYTES_PER_ITEM,
        get,
        set,
        remove(keys) {
            for (const k of Array.isArray(keys) ? keys : [keys]) delete data[k];
            return Promise.resolve();
        },
        clear() { data = {}; return Promise.resolve(); },
        getBytesInUse(keys) {
            const ks = keys == null
                ? Object.keys(data)
                : (Array.isArray(keys) ? keys : [keys]);
            let total = 0;
            for (const k of ks) if (k in data) total += itemBytes(k, data[k]);
            return Promise.resolve(total);
        },
        // test-only helpers (not part of the chrome API surface).
        // `_dump` is a snapshot, not a window into the store.
        _dump: () => copy(data),
        _reset: () => { data = {}; },
        _seed: (obj) => { data = copy(obj ?? {}); },
    };
    return area;
}

/**
 * Install a fresh fake chrome on globalThis and return handles to the storage
 * areas plus the runtime message mock.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.session] expose `storage.session` (MV3 in-memory area).
 *        Off by default so the existing suites keep exercising the
 *        no-session-area path.
 * @param {boolean} [opts.alarms]  expose the `alarms` API.
 * @param {string}  [opts.origin]  extension origin `runtime.getURL('')` returns.
 *        Pass `safari-web-extension://uuid/` to exercise the Safari code paths.
 * @param {string}  [opts.namespace] `'chrome'` (default) or `'browser'`. Real
 *        Safari and Firefox expose `browser`, not `chrome`, so the polyfill
 *        takes its NON-Chrome branch there (no promisify wrapper, direct
 *        pass-through). `'browser'` installs on `globalThis.browser` and leaves
 *        `chrome` undefined so that branch is actually exercised.
 * @param {number} [opts.quotaBytesPerItem] starting per-item byte ceiling for
 *        every area (default 8 MB, chrome.storage.local's real number). Tests
 *        can also lower `local.QUOTA_BYTES_PER_ITEM` after install.
 */
export function installFakeChrome(opts = {}) {
    const areaOpts = { quotaBytesPerItem: opts.quotaBytesPerItem };
    const local = makeArea(areaOpts);
    const sync = makeArea(areaOpts);
    const session = opts.session ? makeArea(areaOpts) : null;
    if (session) {
        session.setAccessLevel = () => Promise.resolve();
    }

    let sendMessageImpl = async () => undefined;
    const messageListeners = [];
    const alarmListeners = [];
    const alarmsSet = new Map();

    const chrome = {
        runtime: {
            id: 'test-extension-id',
            sendMessage: (...args) => sendMessageImpl(...args),
            onMessage: {
                addListener(fn) { messageListeners.push(fn); },
                removeListener(fn) {
                    const i = messageListeners.indexOf(fn);
                    if (i >= 0) messageListeners.splice(i, 1);
                },
            },
            getURL: (p) => `${opts.origin || 'chrome-extension://test/'}${p}`,
            lastError: null,
        },
        storage: {
            local,
            sync,
            onChanged: { addListener() {}, removeListener() {} },
        },
    };
    if (session) chrome.storage.session = session;

    if (opts.alarms) {
        chrome.alarms = {
            create(name, info) { alarmsSet.set(name, info); },
            clear(name) { alarmsSet.delete(name); return Promise.resolve(true); },
            onAlarm: {
                addListener(fn) { alarmListeners.push(fn); },
                removeListener() {},
            },
        };
    }

    if (opts.namespace === 'browser') {
        // Safari / Firefox shape: only `browser` exists, so the polyfill's
        // isChrome is false and every call goes straight through.
        globalThis.browser = chrome;
        delete globalThis.chrome;
    } else {
        globalThis.chrome = chrome;
        // Ensure the polyfill takes the Chrome (not Firefox `browser`) path.
        if ('browser' in globalThis) delete globalThis.browser;
    }

    return {
        chrome,
        local,
        sync,
        session,
        alarms: alarmsSet,
        // Yield until queued storage writes have landed. See flushStorageWrites.
        flushWrites: flushStorageWrites,
        setSendMessage: (fn) => { sendMessageImpl = fn; },
        // Deliver a message to the registered background listener and resolve
        // with whatever it passes to sendResponse.
        dispatch: (message, sender = { id: 'test-extension-id' }) =>
            new Promise((resolve) => {
                if (messageListeners.length === 0) { resolve(undefined); return; }
                messageListeners[0](message, sender, resolve);
            }),
        fireAlarm: (name) => alarmListeners.forEach(fn => fn({ name })),
    };
}
