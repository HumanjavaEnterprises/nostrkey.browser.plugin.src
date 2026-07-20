/**
 * a11y.js — NostrKey accessibility preferences bootstrap.
 *
 * Loaded FIRST (classic script, no defer) in the <head> of every extension
 * page so the three `data-ins-*` attributes land on <html> before first
 * paint. instrument.css keys all accessibility styling off these attributes:
 *
 *   html[data-ins-text="s|m|l|xl"]    — root font-size scaling (rem-based UI)
 *   html[data-ins-contrast="high"]    — brighter token overrides (WCAG boost)
 *   html[data-ins-motion="off"]       — kill animations/transitions (manual
 *                                       override; OS prefers-reduced-motion
 *                                       still works independently)
 *   html[data-ins-skin="<theme>-<mode>"] — resolved LOOK × MODE theme skin;
 *                                       one of instrument|analog|console ×
 *                                       dark|light (system resolves to one).
 *
 * Prefs persist in chrome.storage.sync (fallback storage.local, fallback
 * built-in defaults) under one key: `a11y_prefs`
 *   { textSize: 's'|'m'|'l'|'xl', highContrast: boolean, reduceMotion: boolean,
 *     theme: 'instrument'|'analog'|'console', mode: 'dark'|'light'|'system' }
 *
 * Live updates: subscribes to storage.onChanged so an open popup/sidepanel
 * re-applies instantly when settings change in another surface.
 *
 * Exposes a minimal API for the settings UI:
 *   window.insA11y.get()        → current prefs (copy)
 *   window.insA11y.set(partial) → merge, apply instantly, persist (Promise)
 *
 * NOT bundled by esbuild — copied verbatim to distros via build.js
 * staticFiles. Plain ES5-ish script on purpose: no imports, no modules.
 * MV3 CSP: external script file only, no inline anything.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'a11y_prefs';
    var TEXT_SIZES = ['s', 'm', 'l', 'xl'];
    var THEMES = ['instrument', 'analog', 'console'];
    var MODES = ['dark', 'light', 'system'];
    var DEFAULTS = {
        textSize: 'm',
        highContrast: false,
        reduceMotion: false,
        theme: 'instrument',
        mode: 'dark',
    };

    // Same namespace detection as utilities/browser-polyfill.js (which is an
    // ES module and therefore can't be shared with this pre-paint script).
    var _browser =
        typeof browser !== 'undefined' ? browser :
        typeof chrome !== 'undefined' ? chrome :
        null;

    var current = {
        textSize: DEFAULTS.textSize,
        highContrast: DEFAULTS.highContrast,
        reduceMotion: DEFAULTS.reduceMotion,
        theme: DEFAULTS.theme,
        mode: DEFAULTS.mode,
    };

    function sanitize(raw) {
        var p = {
            textSize: DEFAULTS.textSize,
            highContrast: DEFAULTS.highContrast,
            reduceMotion: DEFAULTS.reduceMotion,
            theme: DEFAULTS.theme,
            mode: DEFAULTS.mode,
        };
        if (raw && typeof raw === 'object') {
            if (TEXT_SIZES.indexOf(raw.textSize) !== -1) p.textSize = raw.textSize;
            p.highContrast = raw.highContrast === true;
            p.reduceMotion = raw.reduceMotion === true;
            if (THEMES.indexOf(raw.theme) !== -1) p.theme = raw.theme;
            if (MODES.indexOf(raw.mode) !== -1) p.mode = raw.mode;
        }
        return p;
    }

    // --- theme mode → skin resolution --------------------------------------
    var _lightMql = null; // cached matchMedia('(prefers-color-scheme: light)')
    var _mqlBound = false; // one-time listener guard

    function lightMql() {
        if (_lightMql === null && typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function') {
            _lightMql = window.matchMedia('(prefers-color-scheme: light)');
        }
        return _lightMql;
    }

    /** Resolve mode 'system' → 'dark'|'light' from the OS preference. */
    function resolveMode(mode) {
        if (mode !== 'system') return mode;
        var mql = lightMql();
        return (mql && mql.matches) ? 'light' : 'dark';
    }

    /** Re-resolve + re-stamp the skin (used by the matchMedia live listener). */
    function applySkin() {
        var skin = current.theme + '-' + resolveMode(current.mode);
        document.documentElement.setAttribute('data-ins-skin', skin);
    }

    /** Subscribe once to OS light/dark changes so mode==='system' updates live. */
    function bindSystemModeListener() {
        if (_mqlBound) return;
        var mql = lightMql();
        if (!mql) return;
        var handler = function () {
            // Only the resolved skin depends on the OS setting.
            if (current.mode === 'system') applySkin();
        };
        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', handler);
            _mqlBound = true;
        } else if (typeof mql.addListener === 'function') {
            // Older engines (Safari < 14) — deprecated but still needed.
            mql.addListener(handler);
            _mqlBound = true;
        }
    }

    /** Stamp the accessibility + theme data- attributes on <html>. */
    function apply(raw) {
        current = sanitize(raw);
        var root = document.documentElement;
        root.setAttribute('data-ins-text', current.textSize);
        if (current.highContrast) {
            root.setAttribute('data-ins-contrast', 'high');
        } else {
            root.removeAttribute('data-ins-contrast');
        }
        if (current.reduceMotion) {
            root.setAttribute('data-ins-motion', 'off');
        } else {
            root.removeAttribute('data-ins-motion');
        }
        applySkin();
        // Keep the live OS listener installed while any surface is open; the
        // guard makes repeated apply() calls a no-op after the first bind.
        bindSystemModeListener();
    }

    // --- storage helpers (promise-first, callback fallback — mirrors the
    // --- promisify approach in utilities/browser-polyfill.js) --------------
    function storageGet(area) {
        if (!area || typeof area.get !== 'function') {
            return Promise.reject(new Error('a11y: storage area unavailable'));
        }
        try {
            var result = area.get(STORAGE_KEY);
            if (result && typeof result.then === 'function') return result;
        } catch (_) { /* fall through to callback form */ }
        return new Promise(function (resolve, reject) {
            try {
                area.get(STORAGE_KEY, function (items) {
                    var err = _browser && _browser.runtime && _browser.runtime.lastError;
                    if (err) reject(new Error(err.message));
                    else resolve(items);
                });
            } catch (e) { reject(e); }
        });
    }

    function storageSet(area, payload) {
        if (!area || typeof area.set !== 'function') {
            return Promise.reject(new Error('a11y: storage area unavailable'));
        }
        try {
            var result = area.set(payload);
            if (result && typeof result.then === 'function') return result;
        } catch (_) { /* fall through to callback form */ }
        return new Promise(function (resolve, reject) {
            try {
                area.set(payload, function () {
                    var err = _browser && _browser.runtime && _browser.runtime.lastError;
                    if (err) reject(new Error(err.message));
                    else resolve();
                });
            } catch (e) { reject(e); }
        });
    }

    function syncArea()  { return _browser && _browser.storage ? _browser.storage.sync  : null; }
    function localArea() { return _browser && _browser.storage ? _browser.storage.local : null; }

    /** sync → local → defaults. */
    function loadPrefs() {
        function fromItems(items) {
            return items ? items[STORAGE_KEY] : undefined;
        }
        function tryLocal() {
            return storageGet(localArea()).then(fromItems);
        }
        return storageGet(syncArea())
            .then(function (items) {
                var val = fromItems(items);
                if (val !== undefined) return val;
                return tryLocal();
            })
            .catch(function () {
                return tryLocal().catch(function () { return undefined; });
            });
    }

    /** Persist to sync when available, otherwise local. */
    function savePrefs(prefs) {
        var payload = {};
        payload[STORAGE_KEY] = prefs;
        return storageSet(syncArea(), payload).catch(function () {
            return storageSet(localArea(), payload).catch(function () {
                /* storage unavailable — prefs still applied for this page */
            });
        });
    }

    // --- boot ---------------------------------------------------------------
    // Stamp defaults synchronously (pre-paint), then re-apply stored prefs.
    apply(current);
    var readyPromise = loadPrefs().then(function (stored) {
        if (stored !== undefined) apply(stored);
    });

    // Live updates when another surface changes the prefs.
    if (_browser && _browser.storage && _browser.storage.onChanged) {
        _browser.storage.onChanged.addListener(function (changes, areaName) {
            if ((areaName === 'sync' || areaName === 'local') && changes[STORAGE_KEY]) {
                apply(changes[STORAGE_KEY].newValue);
            }
        });
    }

    // --- minimal API for the settings UI ------------------------------------
    window.insA11y = {
        /** Resolves after stored prefs have been loaded and applied. */
        ready: readyPromise,
        /** @returns {{textSize:string, highContrast:boolean, reduceMotion:boolean, theme:string, mode:string}} copy of current prefs */
        get: function () {
            return {
                textSize: current.textSize,
                highContrast: current.highContrast,
                reduceMotion: current.reduceMotion,
                theme: current.theme,
                mode: current.mode,
            };
        },
        /**
         * Merge a partial prefs object, apply instantly (no reload), persist.
         * @param {object} partial e.g. { textSize: 'xl' }, { theme: 'analog' }, { mode: 'system' }
         * @returns {Promise<void>}
         */
        set: function (partial) {
            var next = sanitize({
                textSize: partial && partial.textSize !== undefined ? partial.textSize : current.textSize,
                highContrast: partial && partial.highContrast !== undefined ? partial.highContrast : current.highContrast,
                reduceMotion: partial && partial.reduceMotion !== undefined ? partial.reduceMotion : current.reduceMotion,
                theme: partial && partial.theme !== undefined ? partial.theme : current.theme,
                mode: partial && partial.mode !== undefined ? partial.mode : current.mode,
            });
            apply(next);
            return savePrefs(next);
        },
    };
})();
