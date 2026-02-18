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
            window.postMessage({ kind, reqId, payload }, '*');
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
    const validEvents = [
        'getPubKey',
        'signEvent',
        'getRelays',
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
