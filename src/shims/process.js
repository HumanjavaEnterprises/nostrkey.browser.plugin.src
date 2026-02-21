/**
 * Minimal process shim for browser context.
 * Node.js libraries bundled via nostr-crypto-utils (crypto-browserify,
 * readable-stream, etc.) reference the global `process` object.
 * This provides just enough for them to work in a browser extension.
 */
export var process = {
    env: { NODE_ENV: 'production', LOG_LEVEL: 'warn' },
    browser: true,
    version: '',
    stdout: null,
    stderr: null,
    nextTick: function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        Promise.resolve().then(function () { fn.apply(null, args); });
    },
};
