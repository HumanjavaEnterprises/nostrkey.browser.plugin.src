import { api } from './utilities/browser-polyfill';

let script = document.createElement('script');
script.setAttribute('src', api.runtime.getURL('nostr.build.js'));
document.body.appendChild(script);

window.addEventListener('message', async message => {
    // C3 fix: Only accept messages from the top-level page context
    if (message.source !== window) return;

    const validEvents = [
        'getPubKey',
        'signEvent',
        'getRelays',
        'nip04.encrypt',
        'nip04.decrypt',
        'nip44.encrypt',
        'nip44.decrypt',
    ];
    let { kind, reqId, payload } = message.data;
    if (!validEvents.includes(kind)) return;

    payload = await api.runtime.sendMessage({
        kind,
        payload,
        host: window.location.host,
    });

    kind = `return_${kind}`;

    window.postMessage({ kind, reqId, payload }, window.location.origin);
});
