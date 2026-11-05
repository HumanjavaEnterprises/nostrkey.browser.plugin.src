/**
 * Profile detail tab: turn a profile.fetch answer (P3) and field checks (P4)
 * into what the page shows. Pure, so every state can be tested without a
 * browser. Rendering uses textContent only: profile content comes from relays
 * and is never treated as markup.
 *
 * Each field carries a mark and a text label. The mark is decoration
 * (aria-hidden); the label says the same thing in words, so status is never
 * carried by colour or symbol alone.
 */

export const FIELDS = [
    { key: 'name', label: 'Name' },
    { key: 'display_name', label: 'Display name' },
    { key: 'about', label: 'About' },
    { key: 'picture', label: 'Picture' },
    { key: 'banner', label: 'Banner' },
    { key: 'website', label: 'Website' },
    { key: 'nip05', label: 'Nostr address' },
    { key: 'lud16', label: 'Lightning address' },
];

export const MESSAGES = {
    loading: 'Looking for your profile on your relays.',
    unreachable: "Couldn't reach your relays. Editing is locked so nothing gets overwritten.",
    none: "Your relays answered and you don't have a profile yet.",
    locked: 'NostrKey is locked. Your profile is shown read-only. Unlock NostrKey to edit.',
    invalid: 'This link does not name an identity.',
    error: "Couldn't load your profile.",
};

export const PRIVACY_NOTE = 'Checking a picture or banner contacts the host of that image.';

/** Mark and text for one field from its check result (or none yet). */
export function fieldStatus(check, { checking = false } = {}) {
    if (!check) return { mark: '?', tone: 'pending', text: checking ? 'Checking' : 'Not checked' };
    switch (check.status) {
        case 'verified':
        case 'confirmed':
            return { mark: '✓', tone: 'ok', text: check.label || 'Confirmed' };
        case 'mismatch':
        case 'invalid':
            return { mark: '!', tone: 'fail', text: check.label || 'Check failed' };
        default:
            return { mark: '?', tone: 'pending', text: check.label || "Couldn't verify" };
    }
}

function displayValue(v) {
    if (v === undefined || v === null) return '';
    return typeof v === 'string' ? v : JSON.stringify(v);
}

/**
 * @param {object} o
 * @param {'loading'|'confirmed'|'none'|'partial'|'unreachable'|'invalid'|'error'} o.state
 * @param {object|null} [o.content]  parsed kind 0 content
 * @param {object|null} [o.checks]   checkFields result, null while checking
 * @param {boolean} [o.locked]       extension locked
 */
export function buildView({ state, content = null, checks = null, locked = false }) {
    const v = {
        state, message: '', showFields: false, fields: [], showRetry: false,
        showCreate: false, createDisabled: true, editDisabled: true, editReason: '',
        lockedNote: locked ? MESSAGES.locked : '',
    };
    switch (state) {
        case 'confirmed': {
            v.showFields = true;
            const c = content && typeof content === 'object' ? content : {};
            const keys = [...FIELDS.map(f => f.key), ...Object.keys(c).filter(k => !FIELDS.some(f => f.key === k))];
            for (const key of keys) {
                const known = FIELDS.find(f => f.key === key);
                const value = displayValue(c[key]);
                if (!known && value === '') continue;
                const status = value === ''
                    ? { mark: '–', tone: 'empty', text: 'Not set' }
                    : fieldStatus(checks ? checks[key] : null, { checking: !checks });
                v.fields.push({ key, label: known ? known.label : key, value, ...status });
            }
            v.editReason = locked ? 'Unlock NostrKey to edit.' : 'Editing is not available yet.';
            break;
        }
        case 'none':
            v.message = MESSAGES.none;
            v.showCreate = true;
            v.editReason = 'There is no profile to edit yet.';
            break;
        case 'partial':
        case 'unreachable':
            v.message = MESSAGES.unreachable;
            v.showFields = true;
            v.showRetry = true;
            v.fields = FIELDS.map(f => ({ key: f.key, label: f.label, value: '', mark: '?', tone: 'pending', text: 'Unknown' }));
            v.editReason = 'Editing is locked until your relays answer.';
            break;
        case 'loading':
            v.message = MESSAGES.loading;
            v.showFields = true;
            v.fields = FIELDS.map(f => ({ key: f.key, label: f.label, value: '', mark: '?', tone: 'pending', text: 'Checking' }));
            v.editReason = 'Editing is locked until your profile is confirmed.';
            break;
        case 'invalid':
            v.message = MESSAGES.invalid;
            v.editReason = 'No identity.';
            break;
        default:
            v.message = MESSAGES.error;
            v.showRetry = true;
            v.editReason = 'Editing is locked until your profile is confirmed.';
    }
    return v;
}

/** Fill the page's elements (looked up by id inside `doc`) from a view. */
export function renderView(doc, view) {
    const $ = (id) => doc.getElementById(id);
    doc.body.dataset.state = view.state;
    const msg = $('pd-message');
    msg.textContent = view.message;
    msg.hidden = !view.message;
    const lockedNote = $('pd-locked');
    lockedNote.textContent = view.lockedNote;
    lockedNote.hidden = !view.lockedNote;
    $('pd-retry').hidden = !view.showRetry;
    const create = $('pd-create');
    create.hidden = !view.showCreate;
    create.disabled = view.createDisabled;
    const edit = $('pd-edit');
    edit.disabled = view.editDisabled;
    $('pd-edit-reason').textContent = view.editReason;

    const list = $('pd-fields');
    list.hidden = !view.showFields;
    list.replaceChildren();
    for (const f of view.fields) {
        const row = doc.createElement('div');
        row.className = 'pd-field';
        row.dataset.field = f.key;
        row.dataset.tone = f.tone;
        const dt = doc.createElement('dt');
        dt.className = 'pd-field-label';
        dt.textContent = f.label;
        const dd = doc.createElement('dd');
        dd.className = 'pd-field-body';
        const value = doc.createElement('span');
        value.className = 'pd-field-value';
        value.textContent = f.value;
        const status = doc.createElement('span');
        status.className = 'pd-status';
        const mark = doc.createElement('span');
        mark.className = 'pd-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = f.mark;
        const text = doc.createElement('span');
        text.className = 'pd-status-text';
        text.textContent = f.text;
        status.append(mark, text);
        dd.append(value, status);
        row.append(dt, dd);
        list.append(row);
    }
}

/** Accept only a 64-char hex pubkey from the page URL. */
export function pubkeyFromSearch(search) {
    const pk = new URLSearchParams(search).get('pubkey') || '';
    return /^[0-9a-fA-F]{64}$/.test(pk) ? pk.toLowerCase() : null;
}

/**
 * Open the profile tab for one identity, focusing its existing tab if there is
 * one. Tab ids are remembered per identity in storage.local, the same way the
 * side panel reuses its page tabs (no "tabs" permission: we never read URLs).
 */
export async function openProfileTab(api, pubkey) {
    if (!/^[0-9a-fA-F]{64}$/.test(pubkey || '')) throw new Error('Invalid pubkey');
    const path = `profile.html?pubkey=${pubkey.toLowerCase()}`;
    const url = api.runtime.getURL(path);
    const store = await api.storage.local.get('_pageTabs');
    const map = (store && store._pageTabs) || {};
    const existingId = map[path];
    if (existingId != null) {
        try {
            const tab = await api.tabs.get(existingId);
            await api.tabs.update(existingId, { active: true });
            if (tab && tab.windowId != null && api.windows && api.windows.update) {
                await api.windows.update(tab.windowId, { focused: true });
            }
            return existingId;
        } catch (_) { /* tab gone: open a fresh one */ }
    }
    const tab = await api.tabs.create({ url });
    map[path] = tab.id;
    await api.storage.local.set({ _pageTabs: map });
    return tab.id;
}
