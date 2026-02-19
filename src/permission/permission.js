import { KINDS } from '../utilities/utils';
import { api } from '../utilities/browser-polyfill';

const state = {
    host: '',
    permission: '',
    key: '',
    event: null,
    remember: false,
    profileType: 'local',
};

function getHumanPermission(perm) {
    switch (perm) {
        case 'getPubKey': return 'Read public key';
        case 'signEvent': return 'Sign event';
        case 'getRelays': return 'Read relay list';
        case 'nip04.encrypt': return 'Encrypt private message (NIP-04)';
        case 'nip04.decrypt': return 'Decrypt private message (NIP-04)';
        case 'nip44.encrypt': return 'Encrypt private message (NIP-44)';
        case 'nip44.decrypt': return 'Decrypt private message (NIP-44)';
        default: return perm;
    }
}

function getEventInfo() {
    if (state.permission !== 'signEvent' || !state.event) return {};
    const found = KINDS.find(([kind]) => kind === state.event.kind);
    const [kind, desc, nip] = found || ['Unknown', 'Unknown', 'https://github.com/nostr-protocol/nips'];
    return { kind, desc, nip };
}

function render() {
    const hostEl = document.getElementById('perm-host');
    const permEl = document.getElementById('perm-type');
    const bunkerNotice = document.getElementById('bunker-notice');
    const eventKindRow = document.getElementById('event-kind-row');
    const eventPreview = document.getElementById('event-preview');
    const eventPreviewPre = document.getElementById('event-preview-pre');
    const eventKindLink = document.getElementById('event-kind-link');
    const byKindLabel = document.getElementById('by-kind-label');

    if (hostEl) hostEl.textContent = state.host;
    if (permEl) permEl.textContent = getHumanPermission(state.permission);

    if (bunkerNotice) {
        bunkerNotice.style.display = state.profileType === 'bunker' ? 'block' : 'none';
    }

    const isSigningEvent = state.permission === 'signEvent';
    if (eventKindRow) {
        eventKindRow.style.display = isSigningEvent ? 'block' : 'none';
    }
    if (eventPreview) {
        eventPreview.style.display = isSigningEvent ? 'block' : 'none';
    }
    if (byKindLabel) {
        byKindLabel.style.display = isSigningEvent ? 'inline' : 'none';
    }

    if (isSigningEvent) {
        const info = getEventInfo();
        if (eventKindLink) {
            eventKindLink.textContent = info.desc;
            eventKindLink.href = info.nip;
        }
        if (eventPreviewPre) {
            eventPreviewPre.textContent = JSON.stringify(state.event, null, 2);
        }
    }
}

async function allow() {
    console.log('allowing');
    await api.runtime.sendMessage({
        kind: 'allowed',
        payload: state.key,
        origKind: state.permission,
        event: state.event,
        remember: state.remember,
        host: state.host,
    });
    console.log('closing');
    await closeTab();
}

async function deny() {
    await api.runtime.sendMessage({
        kind: 'denied',
        payload: state.key,
        origKind: state.permission,
        event: state.event,
        remember: state.remember,
        host: state.host,
    });
    await closeTab();
}

async function closeTab() {
    const tab = await api.tabs.getCurrent();
    console.log('closing current tab: ', tab.id);
    await api.tabs.update(tab.openerTabId, { active: true });
    window.close();
}

async function openNip() {
    const info = getEventInfo();
    if (info.nip) {
        await api.tabs.create({ url: info.nip, active: true });
    }
}

async function init() {
    const qs = new URLSearchParams(location.search);
    console.log(location.search);
    state.host = qs.get('host');
    state.permission = qs.get('kind');
    state.key = qs.get('uuid');
    state.event = JSON.parse(qs.get('payload'));

    state.profileType = await api.runtime.sendMessage({
        kind: 'getProfileType',
    });

    render();

    // Bind events
    document.getElementById('allow-btn')?.addEventListener('click', allow);
    document.getElementById('deny-btn')?.addEventListener('click', deny);
    document.getElementById('remember')?.addEventListener('change', (e) => {
        state.remember = e.target.checked;
    });
    document.getElementById('event-kind-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        openNip();
    });
}

window.addEventListener('beforeunload', () => {
    api.runtime.sendMessage({ kind: 'closePrompt' });
    return true;
});

document.addEventListener('DOMContentLoaded', init);
