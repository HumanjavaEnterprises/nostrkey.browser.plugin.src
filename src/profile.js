/**
 * NostrKey, profile detail tab: view, edit and save the identity's kind 0.
 * Opened as profile.html?pubkey=<hex>, one tab per identity.
 */
import { api } from './utilities/browser-polyfill';
import { nip19 } from 'nostr-crypto-utils';
import { truncateNpub } from './utilities/npub-guard.js';
import { checkFields } from './profiles/field-checks.js';
import { buildView, renderView, pubkeyFromSearch, headerText } from './profiles/profile-view.js';
import { EDIT_FIELDS, editableValue, validateField, changedFields, httpsUrl, publishSummary } from './profiles/profile-edit.js';

const pubkey = pubkeyFromSearch(location.search);
const ADDRESS_FIELDS = ['nip05', 'lud16'];
let run = 0;
// What the view last loaded; the editor starts from it.
let loaded = { state: '', event: null, content: null, signer: null, locked: true };
// One token per edit session; a result for an older session is dropped.
let editToken = 0;
let editing = false;
let saving = false;

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
    const signer = res && res.signer && typeof res.signer === 'object' ? res.signer : null;
    loaded = { state, event: (res && res.event) || null, content: content || null, signer, locked };
    header({ localName: res && res.localName, state, content });
    renderView(document, buildView({ state, content, checks: null, locked, signer }));
    if (state !== 'confirmed') return;
    let checks = {};
    try { checks = await checkAll(content || {}); } catch (_) { checks = {}; }
    if (mine !== run) return;
    renderView(document, buildView({ state, content, checks, locked, signer }));
}

// --- Editor ---------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function formValues() {
    const out = {};
    for (const f of EDIT_FIELDS) {
        const el = $(`pd-in-${f.key}`);
        if (el && !el.disabled) out[f.key] = el.value;
    }
    return out;
}

const isDirty = () => editing && Object.keys(changedFields(loaded.content, formValues())).length > 0;

function showStatus(text) {
    const el = $('pd-form-status');
    el.textContent = text || '';
    el.hidden = !text;
}

function updatePreview(key) {
    const f = EDIT_FIELDS.find(x => x.key === key);
    if (!f || !f.image) return;
    const row = $(`pd-row-${key}`);
    row.querySelector('img')?.remove();
    const url = httpsUrl($(`pd-in-${key}`).value.trim());
    if (!url) return;
    const img = document.createElement('img');
    img.className = 'pd-input-preview';
    img.referrerPolicy = 'no-referrer';
    img.setAttribute('referrerpolicy', 'no-referrer');
    img.alt = key === 'banner' ? 'Banner preview' : 'Picture preview';
    img.addEventListener('error', () => { img.remove(); setFieldError(key, "Image doesn't load from this link."); });
    img.src = url;
    row.append(img);
}

function setFieldError(key, text) {
    const err = $(`pd-err-${key}`);
    const input = $(`pd-in-${key}`);
    err.textContent = text || '';
    err.hidden = !text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
}

function refreshDirty() {
    $('pd-dirty').hidden = !isDirty();
}

function buildForm(values) {
    const box = $('pd-form-fields');
    box.replaceChildren();
    for (const f of EDIT_FIELDS) {
        const row = document.createElement('div');
        row.className = 'pd-input-row';
        row.id = `pd-row-${f.key}`;
        const label = document.createElement('label');
        label.htmlFor = `pd-in-${f.key}`;
        label.textContent = f.label;
        const input = document.createElement(f.multiline ? 'textarea' : 'input');
        input.id = `pd-in-${f.key}`;
        input.className = 'ins-input';
        input.name = f.key;
        input.maxLength = f.max;
        if (!f.multiline) input.type = f.image || f.url ? 'url' : 'text';
        input.setAttribute('aria-describedby', `pd-err-${f.key}`);
        const text = editableValue(loaded.content, f.key);
        if (text === null) {
            // Not text in the stored profile: shown, kept as it is, not edited here.
            input.value = JSON.stringify(loaded.content[f.key]);
            input.disabled = true;
        } else {
            input.value = values && typeof values[f.key] === 'string' ? values[f.key] : text;
        }
        const err = document.createElement('p');
        err.className = 'pd-input-error';
        err.id = `pd-err-${f.key}`;
        err.hidden = true;
        input.addEventListener('input', () => {
            setFieldError(f.key, validateField(f.key, input.value));
            updatePreview(f.key);
            refreshDirty();
        });
        row.append(label, input, err);
        box.append(row);
    }
    for (const f of EDIT_FIELDS) if (f.image) updatePreview(f.key);
}

function startEdit(values = null) {
    editing = true;
    editToken++;
    $('pd-save-result').hidden = true;
    buildForm(values);
    $('pd-form').hidden = false;
    showStatus('');
    refreshDirty();
    $('pd-in-name')?.focus();
}

function endEdit() {
    editing = false;
    // saving stays set until a save in flight returns, so no second save starts.
    editToken++;
    $('pd-form').hidden = true;
    $('pd-form-fields').replaceChildren();
    $('pd-save').disabled = false;
    const back = loaded.state === 'none' ? $('pd-create') : $('pd-edit');
    back?.focus();
}

function cancelEdit() {
    // Late results of a save still in flight are dropped by the token.
    endEdit();
}

async function save() {
    if (!editing || saving) return;
    const values = formValues();
    let bad = false;
    for (const [k, v] of Object.entries(values)) {
        const e = validateField(k, v);
        setFieldError(k, e);
        if (e) bad = true;
    }
    if (bad) { showStatus('Some fields need fixing.'); return; }
    const changes = changedFields(loaded.content, values);
    if (!Object.keys(changes).length && loaded.state === 'confirmed') { showStatus('Nothing has changed.'); return; }
    const mine = editToken;
    saving = true;
    $('pd-save').disabled = true;
    showStatus('Saving. Your profile is re-checked on your relays before it is signed.');
    let res;
    try {
        res = await send({ kind: 'profile.publish', payload: { pubkey, baseId: loaded.event ? loaded.event.id : null, changes } });
    } catch (_) { res = null; }
    saving = false;
    $('pd-save').disabled = false;
    if (mine !== editToken) return; // cancelled meanwhile
    if (res && res.success) {
        const summary = publishSummary(res.accepted, res.total);
        endEdit();
        await load();
        const out = $('pd-save-result');
        out.textContent = summary;
        out.hidden = false;
        $('pd-edit').focus();
        return;
    }
    if (res && res.code === 'stale') {
        // A newer profile exists: show it, keep the user's edits for re-apply.
        loaded = { ...loaded, state: res.state, event: res.event || null, content: res.content || null };
        renderView(document, buildView({ state: loaded.state, content: loaded.content, checks: null, locked: loaded.locked, signer: loaded.signer }));
        const kept = {};
        for (const [k, v] of Object.entries(changes)) kept[k] = v;
        buildForm(kept);
        refreshDirty();
        showStatus(res.error);
        return;
    }
    if (res && res.errors) for (const [k, e] of Object.entries(res.errors)) if ($(`pd-err-${k}`)) setFieldError(k, e);
    showStatus((res && res.error) || "Couldn't save. Your edits are kept.");
}

function onFormKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); return; }
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') { e.preventDefault(); save(); }
    if (e.key === 'Enter' && e.target.tagName === 'TEXTAREA' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
}

document.addEventListener('DOMContentLoaded', () => {
    header();
    $('pd-retry').addEventListener('click', load);
    $('pd-edit').addEventListener('click', () => { if (!editing && loaded.state === 'confirmed') startEdit(); });
    $('pd-create').addEventListener('click', () => { if (!editing && loaded.state === 'none') startEdit(); });
    $('pd-form').addEventListener('submit', (e) => { e.preventDefault(); save(); });
    $('pd-form').addEventListener('keydown', onFormKey);
    $('pd-cancel').addEventListener('click', cancelEdit);
    window.addEventListener('beforeunload', (e) => {
        if (!isDirty()) return;
        e.preventDefault();
        e.returnValue = '';
    });
    load();
});
