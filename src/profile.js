/**
 * NostrKey, profile detail tab (read-only in this release step).
 * Opened as profile.html?pubkey=<hex>, one tab per identity.
 */
import { api } from './utilities/browser-polyfill';
import { nip19 } from 'nostr-crypto-utils';
import { truncateNpub } from './utilities/npub-guard.js';
import { checkFields } from './profiles/field-checks.js';
import { buildView, renderView, pubkeyFromSearch, headerText } from './profiles/profile-view.js';

const pubkey = pubkeyFromSearch(location.search);
const ADDRESS_FIELDS = ['nip05', 'lud16'];
let run = 0;

const send = (message) => api.runtime.sendMessage(message);

// If the lock state cannot be read, treat NostrKey as locked.
async function isLocked() {
    try { return (await send({ kind: 'isLocked' })) !== false; } catch (_) { return true; }
}

function npubText() {
    try { return truncateNpub(nip19.npubEncode(pubkey)); } catch (_) { return ''; }
}

function header(info = {}) {
    if (!pubkey) return;
    const { title, sub } = headerText({ ...info, npub: npubText() });
    document.getElementById('pd-title').textContent = title;
    const npubEl = document.getElementById('pd-npub');
    npubEl.textContent = sub;
    npubEl.hidden = !sub;
    document.title = `${title}, NostrKey`;
}

async function checkAll(content) {
    const [local, remote] = await Promise.all([
        checkFields(content, pubkey, { skip: ADDRESS_FIELDS }).catch(() => ({})),
        send({ kind: 'profile.checkAddresses', payload: { pubkey, content } }).catch(() => null),
    ]);
    const addr = remote && remote.checks && typeof remote.checks === 'object' ? remote.checks : {};
    const out = { ...local };
    for (const k of ADDRESS_FIELDS) {
        if (content[k] === undefined || content[k] === null || content[k] === '') continue;
        out[k] = addr[k] || { status: 'unverified', label: "Couldn't verify" };
    }
    return out;
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
    header({ localName: res && res.localName, state, content });
    renderView(document, buildView({ state, content, checks: null, locked }));
    if (state !== 'confirmed') return;
    let checks = {};
    try { checks = await checkAll(content || {}); } catch (_) { checks = {}; }
    if (mine !== run) return;
    renderView(document, buildView({ state, content, checks, locked }));
}

document.addEventListener('DOMContentLoaded', () => {
    header();
    document.getElementById('pd-retry').addEventListener('click', load);
    load();
});
