// Channel token handshake (NK-5): the content script stamps the injected
// script element with a per-page-load random token via a data attribute.
// We read it synchronously at load and immediately strip it from the DOM,
// then require every inbound response to carry this token. A same-page
// script that only observed the request broadcast does not know the token,
// so it cannot forge a response. (Residual: a same-origin script is already
// inside the page trust boundary and could call window.nostr itself.)
const NK_CHANNEL_TOKEN = (() => {
    try {
        const el = document.currentScript;
        const t = el?.dataset?.nkToken || null;
        if (el) el.removeAttribute('data-nk-token');
        return t;
    } catch {
        return null;
    }
})();

window.nostr = {
    requests: {},

    async getPublicKey() {
        return await this.broadcast('getPubKey');
    },

    async signEvent(event) {
        return await this.broadcast('signEvent', event);
    },

    async getRelays() {
        return await this.broadcast('getRelays');
    },

    async addRelay(url) {
        return await this.broadcast('addRelay', { url });
    },

    // NOTE: exportProfile() and the nip46 bunker controls are intentionally NOT
    // exposed to web pages. Exporting the private key and starting/stopping a
    // NIP-46 bunker are privileged operations that must originate from the
    // extension's own UI (sidepanel/options), never from a page message.
    // See security audit T0-2 / T0-3.

    // This is here for Alby comatibility. This is not part of the NIP-07 standard.
    // I have found at least one site, nostr.band, which expects it to be present.
    async enable() {
        return { enabled: true };
    },

    broadcast(kind, payload) {
        let reqId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                delete this.requests[reqId];
                reject(new Error('NostrKey: request timed out'));
            }, 30000);
            this.requests[reqId] = (result) => {
                clearTimeout(timeout);
                resolve(result);
            };
            // NK-6: target this page's own origin instead of '*'.
            window.postMessage({ kind, reqId, payload }, window.location.origin);
        });
    },

    nip04: {
        async encrypt(pubKey, plainText) {
            return await window.nostr.broadcast('nip04.encrypt', {
                pubKey,
                plainText,
            });
        },

        async decrypt(pubKey, cipherText) {
            return await window.nostr.broadcast('nip04.decrypt', {
                pubKey,
                cipherText,
            });
        },
    },

    nip44: {
        async encrypt(pubKey, plainText) {
            return await window.nostr.broadcast('nip44.encrypt', {
                pubKey,
                plainText,
            });
        },

        async decrypt(pubKey, cipherText) {
            return await window.nostr.broadcast('nip44.decrypt', {
                pubKey,
                cipherText,
            });
        },
    },
};

// nostr: protocol link handler — replaces nostr:npub1.../note1... hrefs
// with a configurable web URL (default: njump.me) on mousedown, before
// the browser navigates.
let _nostrLinkDisabled = null;
document.addEventListener('mousedown', async e => {
    if (e.target.tagName !== 'A' || !e.target.href.startsWith('nostr:')) return;
    if (_nostrLinkDisabled === false) return;

    let response = await window.nostr.broadcast('replaceURL', {
        url: e.target.href,
    });
    if (response === false) {
        _nostrLinkDisabled = false;
        return;
    }
    e.target.href = response;
});

window.addEventListener('message', message => {
    // NK-5: only accept responses from this same window, carrying the private
    // channel token that the content script and this script share.
    if (message.source !== window) return;
    if (!message.data || message.data.token !== NK_CHANNEL_TOKEN) return;

    const validEvents = [
        'getPubKey',
        'signEvent',
        'getRelays',
        'addRelay',
        'nip04.encrypt',
        'nip04.decrypt',
        'nip44.encrypt',
        'nip44.decrypt',
    ].map(e => `return_${e}`);
    let { kind, reqId, payload } = message.data;

    if (!validEvents.includes(kind)) return;

    window.nostr.requests[reqId]?.(payload);
    delete window.nostr.requests[reqId];
});
