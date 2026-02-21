/**
 * Browser API compatibility layer for Chrome / Safari / Firefox.
 *
 * Safari and Firefox expose `browser.*` (Promise-based, WebExtension standard).
 * Chrome exposes `chrome.*` (callback-based historically, but MV3 supports
 * promises on most APIs). In a service-worker context `browser` is undefined
 * on Chrome, so we normalise everything here.
 *
 * Usage:  import { api } from './utilities/browser-polyfill';
 *         api.runtime.sendMessage(...)
 *
 * The exported `api` object mirrors the subset of the WebExtension API that
 * NostrKey actually uses, with every method returning a Promise.
 */

// Detect which global namespace is available.
const _browser =
    typeof browser !== 'undefined' ? browser :
    typeof chrome  !== 'undefined' ? chrome  :
    null;

if (!_browser) {
    throw new Error('browser-polyfill: No extension API namespace found (neither browser nor chrome).');
}

/**
 * True when running on Chrome (or any Chromium-based browser that only
 * exposes the `chrome` namespace).
 */
const isChrome = typeof browser === 'undefined' && typeof chrome !== 'undefined';

/**
 * Wrap a Chrome callback-style method so it returns a Promise.
 * If the method already returns a promise (MV3) we just pass through.
 */
function promisify(context, method) {
    return (...args) => {
        // MV3 Chrome APIs return promises when no callback is supplied.
        // We try the promise path first; if the runtime signals an error
        // via chrome.runtime.lastError inside a callback we catch that too.
        try {
            const result = method.apply(context, args);
            if (result && typeof result.then === 'function') {
                return result;
            }
        } catch (_) {
            // fall through to callback wrapping
        }

        return new Promise((resolve, reject) => {
            method.apply(context, [
                ...args,
                (...cbArgs) => {
                    if (_browser.runtime && _browser.runtime.lastError) {
                        reject(new Error(_browser.runtime.lastError.message));
                    } else {
                        resolve(cbArgs.length <= 1 ? cbArgs[0] : cbArgs);
                    }
                },
            ]);
        });
    };
}

// ---------------------------------------------------------------------------
// Build the unified `api` object
// ---------------------------------------------------------------------------

const api = {};

// --- runtime ---------------------------------------------------------------
api.runtime = {
    /**
     * sendMessage – always returns a Promise.
     */
    sendMessage(...args) {
        if (!isChrome) {
            return _browser.runtime.sendMessage(...args);
        }
        return promisify(_browser.runtime, _browser.runtime.sendMessage)(...args);
    },

    /**
     * onMessage – thin wrapper so callers use a consistent reference.
     * The listener signature is (message, sender, sendResponse).
     * On Chrome the listener can return `true` to keep the channel open,
     * or return a Promise (MV3).  Safari / Firefox expect a Promise return.
     */
    onMessage: _browser.runtime.onMessage,

    /**
     * getURL – synchronous on all browsers.
     */
    getURL(path) {
        return _browser.runtime.getURL(path);
    },

    /**
     * openOptionsPage
     */
    openOptionsPage() {
        if (!isChrome) {
            return _browser.runtime.openOptionsPage();
        }
        return promisify(_browser.runtime, _browser.runtime.openOptionsPage)();
    },

    /**
     * Expose the id for convenience.
     */
    get id() {
        return _browser.runtime.id;
    },
};

// --- storage.local ---------------------------------------------------------
api.storage = {
    local: {
        get(...args) {
            if (!isChrome) {
                return _browser.storage.local.get(...args);
            }
            return promisify(_browser.storage.local, _browser.storage.local.get)(...args);
        },
        set(...args) {
            if (!isChrome) {
                return _browser.storage.local.set(...args);
            }
            return promisify(_browser.storage.local, _browser.storage.local.set)(...args);
        },
        clear(...args) {
            if (!isChrome) {
                return _browser.storage.local.clear(...args);
            }
            return promisify(_browser.storage.local, _browser.storage.local.clear)(...args);
        },
        remove(...args) {
            if (!isChrome) {
                return _browser.storage.local.remove(...args);
            }
            return promisify(_browser.storage.local, _browser.storage.local.remove)(...args);
        },
    },
};

// --- tabs ------------------------------------------------------------------
api.tabs = {
    create(...args) {
        if (!isChrome) {
            return _browser.tabs.create(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.create)(...args);
    },
    query(...args) {
        if (!isChrome) {
            return _browser.tabs.query(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.query)(...args);
    },
    remove(...args) {
        if (!isChrome) {
            return _browser.tabs.remove(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.remove)(...args);
    },
    update(...args) {
        if (!isChrome) {
            return _browser.tabs.update(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.update)(...args);
    },
    get(...args) {
        if (!isChrome) {
            return _browser.tabs.get(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.get)(...args);
    },
    getCurrent(...args) {
        if (!isChrome) {
            return _browser.tabs.getCurrent(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.getCurrent)(...args);
    },
    sendMessage(...args) {
        if (!isChrome) {
            return _browser.tabs.sendMessage(...args);
        }
        return promisify(_browser.tabs, _browser.tabs.sendMessage)(...args);
    },
};

export { api, isChrome };
