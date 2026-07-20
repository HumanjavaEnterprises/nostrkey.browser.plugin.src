import { deleteDB } from 'idb';
import { downloadAllContents, getHosts, sortByIndex } from '../utilities/db';
import { getProfiles, KINDS } from '../utilities/utils';
import { api } from '../utilities/browser-polyfill';

const TOMORROW = new Date();
TOMORROW.setDate(TOMORROW.getDate() + 1);

const state = {
    events: [],
    view: 'created_at',
    max: 100,
    sort: 'asc',
    allHosts: [],
    host: '',
    allProfiles: [],
    profile: '',
    pubkey: '',
    selected: null,
    copied: false,

    // date view
    fromCreatedAt: '2008-10-31',
    toCreatedAt: TOMORROW.toISOString().split('T')[0],

    // kind view
    quickKind: '',
    fromKind: 0,
    toKind: 50000,
};

function $(id) { return document.getElementById(id); }

function getFromTime() {
    const dt = new Date(state.fromCreatedAt);
    return Math.floor(dt.getTime() / 1000);
}

function getToTime() {
    const dt = new Date(state.toCreatedAt);
    return Math.floor(dt.getTime() / 1000);
}

function getKeyRange() {
    switch (state.view) {
        case 'created_at':
            return IDBKeyRange.bound(getFromTime(), getToTime());
        case 'kind':
            return IDBKeyRange.bound(state.fromKind, state.toKind);
        case 'host':
            if (state.host.length === 0) return null;
            return IDBKeyRange.only(state.host);
        case 'pubkey':
            if (state.pubkey.length === 0) return null;
            return IDBKeyRange.only(state.pubkey);
        default:
            return null;
    }
}

function formatDate(epochSeconds) {
    // Mono instrument timestamp: 2026-07-19 14:03:22 UTC
    return new Date(epochSeconds * 1000)
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, ' UTC');
}

/**
 * Human action labels for signed kinds (SHOW-THE-EVENT differentiator).
 * tier: '' = routine, 'warn' = caution (amber), 'danger' = destructive (red).
 * Mirrors the bunker's Tier-A/Tier-B split (bunker-server.js).
 */
const KIND_ACTIONS = new Map([
    [0, { label: 'Update your profile', tier: 'warn' }],
    [1, { label: 'Publish a public note', tier: '' }],
    [3, { label: 'Replace your follow list', tier: 'warn' }],
    [4, { label: 'Send a DM (legacy)', tier: 'warn' }],
    [5, { label: 'Delete events', tier: 'danger' }],
    [6, { label: 'Repost a note', tier: '' }],
    [7, { label: 'Send a reaction', tier: '' }],
    [13, { label: 'Seal a private message', tier: 'warn' }],
    [14, { label: 'Send a DM', tier: 'warn' }],
    [16, { label: 'Repost (generic)', tier: '' }],
    [1059, { label: 'Wrap a private message', tier: 'warn' }],
    [9734, { label: 'Request a zap payment', tier: 'warn' }],
    [10000, { label: 'Replace your mute list', tier: 'warn' }],
    [10002, { label: 'Replace your relay list', tier: 'warn' }],
    [22242, { label: 'Authenticate to a relay', tier: '' }],
    [24133, { label: 'Bunker connect message', tier: '' }],
    [27235, { label: 'Authenticate to a server', tier: '' }],
    [30023, { label: 'Publish a long-form article', tier: '' }],
]);

function kindMeta(kind) {
    const known = KIND_ACTIONS.get(kind);
    if (known) return known;
    const k = KINDS.find(([kNum]) => kNum === kind);
    if (k) return { label: k[1], tier: '' };
    // Can't decode it — say so loudly (amber).
    return { label: 'Unknown kind — not decoded', tier: 'warn' };
}

function renderKindChip(kind) {
    const { label, tier } = kindMeta(kind);
    const cls =
        tier === 'danger' ? ' kind-channel--danger' :
        tier === 'warn' ? ' kind-channel--warn' : '';
    return `<span class="kind-channel${cls}"><span class="kind-num mono">${Number(kind)}</span>${escapeHtml(label)}</span>`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Render ---

function render() {
    // View select
    const viewSelect = $('view');
    const sortSelect = $('sort');
    const maxInput = $('max');

    if (viewSelect && document.activeElement !== viewSelect) viewSelect.value = state.view;
    if (sortSelect && document.activeElement !== sortSelect) sortSelect.value = state.sort;
    if (maxInput && document.activeElement !== maxInput) maxInput.value = state.max;

    // Show/hide filter sections
    const dateFilters = document.querySelectorAll('[data-filter="created_at"]');
    const kindFilters = document.querySelectorAll('[data-filter="kind"]');
    const hostFilters = document.querySelectorAll('[data-filter="host"]');
    const pubkeyFilters = document.querySelectorAll('[data-filter="pubkey"]');

    dateFilters.forEach(el => el.hidden = state.view !== 'created_at');
    kindFilters.forEach(el => el.hidden = state.view !== 'kind');
    hostFilters.forEach(el => el.hidden = state.view !== 'host');
    pubkeyFilters.forEach(el => el.hidden = state.view !== 'pubkey');

    // Date inputs
    const fromCreatedAt = $('fromCreatedAt');
    const toCreatedAt = $('toCreatedAt');
    if (fromCreatedAt && document.activeElement !== fromCreatedAt) fromCreatedAt.value = state.fromCreatedAt;
    if (toCreatedAt && document.activeElement !== toCreatedAt) toCreatedAt.value = state.toCreatedAt;

    // Kind inputs
    const fromKind = $('fromKind');
    const toKind = $('toKind');
    if (fromKind && document.activeElement !== fromKind) fromKind.value = state.fromKind;
    if (toKind && document.activeElement !== toKind) toKind.value = state.toKind;

    // Quick kind select
    const kindShortcut = $('kindShortcut');
    if (kindShortcut && document.activeElement !== kindShortcut) kindShortcut.value = state.quickKind;

    // Host select
    const hostSelect = $('host');
    if (hostSelect) {
        hostSelect.innerHTML = '<option value=""></option>' +
            state.allHosts.map(h => `<option value="${escapeHtml(h)}" ${state.host === h ? 'selected' : ''}>${escapeHtml(h)}</option>`).join('');
    }

    // Profiles select
    const profileSelect = $('profiles');
    if (profileSelect) {
        const profileNames = state.allProfiles.map(p => p.name);
        profileSelect.innerHTML = '<option value=""></option>' +
            profileNames.map(p => `<option value="${escapeHtml(p)}" ${state.profile === p ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('');
    }

    // Pubkey input
    const pubkeyInput = $('pubkey');
    if (pubkeyInput && document.activeElement !== pubkeyInput) pubkeyInput.value = state.pubkey;

    // Event count readout in the Filter module header
    const eventCount = $('event-count');
    if (eventCount) eventCount.textContent = String(state.events.length);

    // Event list — activity readout log
    const eventList = $('event-list');
    if (eventList) {
        if (state.events.length === 0) {
            eventList.innerHTML = '<div class="eh-empty mono">No signed events in range</div>';
        } else {
            eventList.innerHTML = state.events.map((event, index) => `
            <div class="eh-event${state.selected === index ? ' is-open' : ''}">
                <button
                    type="button"
                    class="eh-row"
                    data-action="toggle-event"
                    data-index="${index}"
                    aria-expanded="${state.selected === index}"
                >
                    <span class="eh-toggle mono" aria-hidden="true">${state.selected === index ? '−' : '+'}</span>
                    <span class="eh-time mono">${escapeHtml(formatDate(event.metadata.signed_at))}</span>
                    <span class="eh-host mono ins-truncate">${escapeHtml(event.metadata.host)}</span>
                    <span class="eh-kind">${renderKindChip(event.event.kind)}</span>
                </button>
                <div
                    data-action="copy-event"
                    data-index="${index}"
                    class="eh-json"
                    title="Click to copy the raw event"
                    ${state.selected === index ? '' : 'hidden'}
                >
                    <pre class="readout">${escapeHtml(JSON.stringify(event, null, 2))}</pre>
                </div>
            </div>
        `).join('');
        }

        // Bind event toggle
        eventList.querySelectorAll('[data-action="toggle-event"]').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index);
                state.selected = state.selected === idx ? null : idx;
                render();
            });
        });

        // Bind copy event
        eventList.querySelectorAll('[data-action="copy-event"]').forEach(el => {
            el.addEventListener('click', async () => {
                const idx = parseInt(el.dataset.index);
                await copyEvent(idx);
            });
        });
    }

    // Copied toast
    const copiedToast = $('copied-toast');
    if (copiedToast) copiedToast.hidden = !state.copied;
}

// --- Actions ---

async function reload() {
    const events = await sortByIndex(
        state.view,
        getKeyRange(),
        state.sort === 'asc',
        state.max,
    );
    state.events = events.map(e => ({ ...e, copied: false }));

    getHosts().then(hosts => { state.allHosts = hosts; render(); });

    const profiles = await getProfiles();
    state.allProfiles = await Promise.all(
        profiles.map(async (profile, index) => ({
            name: profile.name,
            pubkey: await api.runtime.sendMessage({
                kind: 'getNpub',
                payload: index,
            }),
        })),
    );

    render();
}

async function saveAll() {
    const file = await downloadAllContents();
    api.tabs.create({
        url: URL.createObjectURL(file),
        active: true,
    });
}

async function deleteAll() {
    if (confirm('Are you sure you want to delete ALL events?')) {
        await deleteDB('events');
        await reload();
    }
}

function quickKindSelect() {
    if (state.quickKind === '') return;
    const i = parseInt(state.quickKind);
    state.fromKind = i;
    state.toKind = i;
    reload();
}

function pkFromProfile() {
    const found = state.allProfiles.find(({ name }) => name === state.profile);
    if (found) {
        state.pubkey = found.pubkey;
        reload();
    }
}

async function copyEvent(index) {
    const event = JSON.stringify(state.events[index]);
    state.copied = true;
    render();
    setTimeout(() => { state.copied = false; render(); }, 1000);
    await navigator.clipboard.writeText(event);
}

// --- Event binding ---

let maxDebounceTimer = null;
let pubkeyDebounceTimer = null;

function bindEvents() {
    $('view')?.addEventListener('change', (e) => {
        state.view = e.target.value;
        reload();
    });

    $('sort')?.addEventListener('change', (e) => {
        state.sort = e.target.value;
        reload();
    });

    $('max')?.addEventListener('input', (e) => {
        state.max = parseInt(e.target.value) || 100;
        clearTimeout(maxDebounceTimer);
        maxDebounceTimer = setTimeout(() => reload(), 750);
    });

    $('fromCreatedAt')?.addEventListener('change', (e) => {
        state.fromCreatedAt = e.target.value;
        reload();
    });

    $('toCreatedAt')?.addEventListener('change', (e) => {
        state.toCreatedAt = e.target.value;
        reload();
    });

    $('kindShortcut')?.addEventListener('change', (e) => {
        state.quickKind = e.target.value;
        quickKindSelect();
    });

    $('fromKind')?.addEventListener('change', (e) => {
        state.fromKind = parseInt(e.target.value) || 0;
        reload();
    });

    $('toKind')?.addEventListener('change', (e) => {
        state.toKind = parseInt(e.target.value) || 50000;
        reload();
    });

    $('host')?.addEventListener('change', (e) => {
        state.host = e.target.value;
        reload();
    });

    $('profiles')?.addEventListener('change', (e) => {
        state.profile = e.target.value;
        pkFromProfile();
    });

    $('pubkey')?.addEventListener('input', (e) => {
        state.pubkey = e.target.value;
        clearTimeout(pubkeyDebounceTimer);
        pubkeyDebounceTimer = setTimeout(() => reload(), 500);
    });

    $('save-all-btn')?.addEventListener('click', saveAll);
    $('delete-all-btn')?.addEventListener('click', deleteAll);
    $('close-btn')?.addEventListener('click', () => window.close());
}

// --- Init ---

async function init() {
    // Populate the kind shortcut select
    const kindShortcut = $('kindShortcut');
    if (kindShortcut) {
        kindShortcut.innerHTML = '<option></option>' +
            KINDS.map(([kind, desc]) => `<option value="${kind}">${escapeHtml(desc)}</option>`).join('');
    }

    bindEvents();
    await reload();
}

document.addEventListener('DOMContentLoaded', init);
