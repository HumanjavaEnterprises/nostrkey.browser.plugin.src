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
    return new Date(epochSeconds * 1000).toUTCString();
}

function formatKind(kind) {
    const k = KINDS.find(([kNum]) => kNum === kind);
    return k ? `${k[1]} (${kind})` : `Unknown (${kind})`;
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

    dateFilters.forEach(el => el.style.display = state.view === 'created_at' ? '' : 'none');
    kindFilters.forEach(el => el.style.display = state.view === 'kind' ? '' : 'none');
    hostFilters.forEach(el => el.style.display = state.view === 'host' ? '' : 'none');
    pubkeyFilters.forEach(el => el.style.display = state.view === 'pubkey' ? '' : 'none');

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

    // Event list
    const eventList = $('event-list');
    if (eventList) {
        eventList.innerHTML = state.events.map((event, index) => `
            <div class="mt-3 border-solid border border-monokai-bg-lighter rounded-lg">
                <div
                    class="select-none flex cursor-pointer text-sm md:text-xl"
                    data-action="toggle-event"
                    data-index="${index}"
                >
                    <div class="flex-none w-14 p-4 font-extrabold">${state.selected === index ? '-' : '+'}</div>
                    <div class="flex-1 w-64 p-4">${escapeHtml(formatDate(event.metadata.signed_at))}</div>
                    <div class="flex-1 w-64 p-4">${escapeHtml(event.metadata.host)}</div>
                    <div class="flex-1 w-64 p-4">${escapeHtml(formatKind(event.event.kind))}</div>
                </div>
                <div data-action="copy-event" data-index="${index}" class="cursor-pointer">
                    <pre
                        class="rounded-b-lg bg-monokai-bg-lighter text-sm md:text-base p-4 overflow-x-auto"
                        style="display:${state.selected === index ? 'block' : 'none'};"
                    >${escapeHtml(JSON.stringify(event, null, 2))}</pre>
                </div>
            </div>
        `).join('');

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
    if (copiedToast) copiedToast.style.display = state.copied ? 'block' : 'none';
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
