/**
 * Minimal in-memory `chrome.*` stand-in for exercising the REAL extension
 * storage modules (utils / api-key-store / vault-store / sync-manager /
 * secret-vault) under vitest.
 *
 * `src/utilities/browser-polyfill.js` reads the global `chrome`/`browser`
 * namespace at import time and throws if neither exists, so the caller MUST
 * install this on `globalThis.chrome` BEFORE dynamically importing any module
 * that pulls in the polyfill. Only `chrome` is set (not `browser`) so the
 * polyfill takes its Chromium code path; every method returns a Promise, which
 * the polyfill passes straight through.
 *
 * No IndexedDB is provided, so secret-vault falls back to an in-memory
 * non-extractable device key — exactly the passwordless at-rest path we test.
 */

function makeArea() {
    let data = {};

    function get(query) {
        // chrome semantics: null → everything; string → {k:v}; array → subset;
        // object → defaults overridden by stored values.
        if (query == null) return Promise.resolve({ ...data });
        if (typeof query === 'string') {
            return Promise.resolve(query in data ? { [query]: data[query] } : {});
        }
        if (Array.isArray(query)) {
            const out = {};
            for (const k of query) if (k in data) out[k] = data[k];
            return Promise.resolve(out);
        }
        // object of defaults
        const out = {};
        for (const [k, def] of Object.entries(query)) {
            out[k] = k in data ? data[k] : def;
        }
        return Promise.resolve(out);
    }

    return {
        get,
        set(obj) { Object.assign(data, obj); return Promise.resolve(); },
        remove(keys) {
            for (const k of Array.isArray(keys) ? keys : [keys]) delete data[k];
            return Promise.resolve();
        },
        clear() { data = {}; return Promise.resolve(); },
        getBytesInUse() { return Promise.resolve(0); },
        // test-only helpers (not part of the chrome API surface)
        _dump: () => data,
        _reset: () => { data = {}; },
        _seed: (obj) => { data = { ...obj }; },
    };
}

/**
 * Install a fresh fake chrome on globalThis and return handles to the two
 * storage areas plus the runtime message mock.
 */
export function installFakeChrome() {
    const local = makeArea();
    const sync = makeArea();

    let sendMessageImpl = async () => undefined;

    const chrome = {
        runtime: {
            id: 'test-extension-id',
            sendMessage: (...args) => sendMessageImpl(...args),
            onMessage: { addListener() {}, removeListener() {} },
            getURL: (p) => `chrome-extension://test/${p}`,
            lastError: null,
        },
        storage: {
            local,
            sync,
            onChanged: { addListener() {}, removeListener() {} },
        },
    };

    globalThis.chrome = chrome;
    // Ensure the polyfill takes the Chrome (not Firefox `browser`) path.
    if ('browser' in globalThis) delete globalThis.browser;

    return {
        chrome,
        local,
        sync,
        setSendMessage: (fn) => { sendMessageImpl = fn; },
    };
}
