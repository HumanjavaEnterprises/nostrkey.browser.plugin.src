/**
 * NostrKey, profile detail tab (read-only in this release step).
 * Opened as profile.html?pubkey=<hex>, one tab per identity.
 */
import { api } from './utilities/browser-polyfill';
import { nip19 } from 'nostr-crypto-utils';
import { truncateNpub } from './utilities/npub-guard.js';
import { checkFields } from './profiles/field-checks.js';
import { buildView, renderView, pubkeyFromSearch } from './profiles/profile-view.js';

const pubkey = pubkeyFromSearch(location.search);
let run = 0;

const send = (message) => api.runtime.sendMessage(message);

async function isLocked() {
    try { return (await send({ kind: 'isLocked' })) === true; } catch (_) { return false; }
}

async function load() {
    const mine = ++run;
    if (!pubkey) { renderView(document, buildView({ state: 'invalid' })); return; }
    const locked = await isLocked();
    renderView(document, buildView({ state: 'loading', locked }));
    let res;
    try { res = await send({ kind: 'profile.fetch', payload: { pubkey } }); } catch (_) { res = null; }
    if (mine !== run) return;
    const state = res && typeof res.state === 'string' ? res.state : 'error';
    const content = res && res.content;
    renderView(document, buildView({ state, content, checks: null, locked }));
    if (state !== 'confirmed') return;
    let checks = {};
    try { checks = await checkFields(content, pubkey); } catch (_) { checks = {}; }
    if (mine !== run) return;
    renderView(document, buildView({ state, content, checks, locked }));
}

function header() {
    if (!pubkey) return;
    try {
        const npub = truncateNpub(nip19.npubEncode(pubkey));
        document.getElementById('pd-title').textContent = npub;
        document.getElementById('pd-npub').textContent = 'Public profile of this identity';
        document.title = `${npub}, NostrKey`;
    } catch (_) { /* leave the default title */ }
}

document.addEventListener('DOMContentLoaded', () => {
    header();
    document.getElementById('pd-retry').addEventListener('click', load);
    load();
});
