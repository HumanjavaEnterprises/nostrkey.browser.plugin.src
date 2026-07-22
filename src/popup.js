/**
 * NostrKey Popup - Vanilla JS (CSP-safe)
 */

import {
    getProfileNames,
    setProfileIndex,
    getProfileIndex,
    getRelays,
    RECOMMENDED_RELAYS,
    saveRelays,
    initialize,
    relayReminder,
    toggleRelayReminder,
    getNpub,
    get,
} from './utilities/utils';
import { api } from './utilities/browser-polyfill';
import QRCode from 'qrcode';

// State
let state = {
    profileNames: ['Default Nostr Profile'],
    profileIndex: 0,
    relayCount: 0,
    showRelayReminder: true,
    isLocked: false,
    hasPassword: false,
    npubQrDataUrl: '',
    profileType: 'local',
    bunkerConnected: false,
    npub: '',
    backedUp: false,
    trustLevel: 0,
};

// L0→L3 progressive-trust ladder labels (instrument security readout)
const TRUST_LABELS = [
    'L0 · BACKUP RECOMMENDED',
    'L1 · BACKED UP',
    'L2 · PASSWORD + AUTO-LOCK',
    'L3 · REMOTE BUNKER',
];

// DOM Elements
const elements = {};

function $(id) {
    return document.getElementById(id);
}

function initElements() {
    elements.lockedView = $('locked-view');
    elements.unlockedView = $('unlocked-view');
    elements.unlockForm = $('unlock-form');
    elements.unlockPassword = $('unlock-password');
    elements.unlockError = $('unlock-error');
    elements.lockBtn = $('lock-btn');
    elements.profileSelect = $('profile-select');
    elements.copyNpubBtn = $('copy-npub-btn');
    elements.qrContainer = $('qr-container');
    elements.qrImage = $('qr-image');
    elements.bunkerStatus = $('bunker-status');
    elements.bunkerIndicator = $('bunker-indicator');
    elements.bunkerText = $('bunker-text');
    elements.relayReminder = $('relay-reminder');
    elements.addRelaysBtn = $('add-relays-btn');
    elements.noThanksBtn = $('no-thanks-btn');
    elements.settingsBtn = $('settings-btn');
    elements.lockedSettingsBtn = $('locked-settings-btn');
    // Instrument rack: channel strip + security readout
    elements.avatarGlyph = $('avatar-glyph');
    elements.stripNameText = $('strip-name-text');
    elements.stripLed = $('strip-led');
    elements.stripNpub = $('strip-npub');
    elements.trustMeter = $('trust-meter');
    elements.securityLed = $('security-led');
    elements.securityStatus = $('security-status');
    elements.securityRow = $('security-row');
    elements.backupNudge = $('backup-nudge');
    elements.backupNowBtn = $('backup-now-btn');
}

// Render functions
function render() {
    if (state.isLocked) {
        elements.lockedView.classList.remove('hidden');
        elements.unlockedView.classList.add('hidden');
    } else {
        elements.lockedView.classList.add('hidden');
        elements.unlockedView.classList.remove('hidden');
        renderUnlockedState();
    }
}

function renderUnlockedState() {
    // Lock button visibility
    if (state.hasPassword) {
        elements.lockBtn.classList.remove('hidden');
    } else {
        elements.lockBtn.classList.add('hidden');
    }

    // Channel strip: name + avatar glyph + mono npub + status LED
    const activeName = state.profileNames[state.profileIndex] || 'Nostr Profile';
    elements.stripNameText.textContent = activeName;
    elements.avatarGlyph.textContent = (activeName.trim().charAt(0) || 'N').toUpperCase();
    elements.stripNpub.textContent = state.npub || '—';
    elements.stripNpub.title = state.npub || '';

    // Trust-ladder level meter (the L0→L3 channel meter)
    const level = state.trustLevel;
    elements.trustMeter.dataset.level = String(level);
    elements.trustMeter.setAttribute('aria-label', `Security level ${level} of 3`);
    elements.securityStatus.textContent = TRUST_LABELS[level];
    const ledClass = level >= 1 ? 'led led--green' : 'led led--amber';
    elements.stripLed.className = ledClass;
    elements.stripLed.setAttribute(
        'aria-label',
        level >= 1 ? 'Security in place' : 'Backup recommended'
    );
    elements.securityLed.className = ledClass;

    // Guided-backup nudge (L0 only — never blocks use)
    if (level === 0) {
        elements.backupNudge.classList.remove('hidden');
    } else {
        elements.backupNudge.classList.add('hidden');
    }

    // Profile dropdown
    elements.profileSelect.innerHTML = state.profileNames
        .map((name, i) => `<option value="${i}"${i === state.profileIndex ? ' selected' : ''}>${name}</option>`)
        .join('');

    // QR code
    if (state.npubQrDataUrl) {
        elements.qrImage.src = state.npubQrDataUrl;
        elements.qrContainer.classList.remove('hidden');
    } else {
        elements.qrContainer.classList.add('hidden');
    }

    // Bunker status
    if (state.profileType === 'bunker') {
        elements.bunkerStatus.classList.remove('hidden');
        elements.bunkerIndicator.className = `led ${state.bunkerConnected ? 'led--green' : 'led--red'}`;
        elements.bunkerText.textContent = state.bunkerConnected ? 'Bunker connected' : 'Bunker disconnected';
    } else {
        elements.bunkerStatus.classList.add('hidden');
    }

    // Relay reminder
    if (state.relayCount < 1 && state.showRelayReminder) {
        elements.relayReminder.classList.remove('hidden');
    } else {
        elements.relayReminder.classList.add('hidden');
    }
}

// Actions
async function loadUnlockedState() {
    await api.runtime.sendMessage({ kind: 'resetAutoLock' });
    await loadNames();
    await loadProfileIndex();
    await loadProfileType();
    await countRelays();
    await checkRelayReminder();
    await loadNpub();
    await loadTrustLevel();
    await generateQr();
    render();
}

async function loadNpub() {
    try {
        state.npub = (await getNpub()) || '';
    } catch {
        state.npub = '';
    }
}

async function loadTrustLevel() {
    // L0 instant key · L1 backed up · L2 master password + auto-lock ·
    // L3 bunker/enclave. Derived from real device state — never faked.
    try {
        state.backedUp = !!(await get('backedUp'));
    } catch {
        state.backedUp = false;
    }
    if (state.profileType === 'bunker') {
        state.trustLevel = 3;
    } else if (state.hasPassword) {
        state.trustLevel = 2;
    } else if (state.backedUp) {
        state.trustLevel = 1;
    } else {
        state.trustLevel = 0;
    }
}

async function loadNames() {
    state.profileNames = await getProfileNames();
}

async function loadProfileIndex() {
    state.profileIndex = await getProfileIndex();
}

async function loadProfileType() {
    state.profileType = await api.runtime.sendMessage({ kind: 'getProfileType' });
    if (state.profileType === 'bunker') {
        const status = await api.runtime.sendMessage({ kind: 'bunker.status' });
        state.bunkerConnected = status?.connected || false;
    } else {
        state.bunkerConnected = false;
    }
}

async function countRelays() {
    const relays = await getRelays(state.profileIndex);
    state.relayCount = relays.length;
}

async function checkRelayReminder() {
    state.showRelayReminder = await relayReminder();
}

async function generateQr() {
    try {
        const npub = await getNpub();
        if (!npub) {
            state.npubQrDataUrl = '';
            return;
        }
        state.npubQrDataUrl = await QRCode.toDataURL(npub.toUpperCase(), {
            width: 200,
            margin: 2,
            color: { dark: '#E7E9EE', light: '#0E0F13' },
        });
    } catch {
        state.npubQrDataUrl = '';
    }
}

async function doUnlock() {
    const password = elements.unlockPassword.value;
    if (!password) {
        elements.unlockError.textContent = 'Please enter your master password.';
        elements.unlockError.classList.remove('hidden');
        return;
    }

    const result = await api.runtime.sendMessage({ kind: 'unlock', payload: password });
    if (result.success) {
        state.isLocked = false;
        elements.unlockPassword.value = '';
        elements.unlockError.classList.add('hidden');
        await loadUnlockedState();
    } else {
        elements.unlockError.textContent = result.error || 'Invalid password.';
        elements.unlockError.classList.remove('hidden');
    }
}

async function doLock() {
    await api.runtime.sendMessage({ kind: 'lock' });
    state.isLocked = true;
    render();
}

async function handleProfileChange() {
    const newIndex = parseInt(elements.profileSelect.value, 10);
    if (newIndex !== state.profileIndex) {
        state.profileIndex = newIndex;
        await setProfileIndex(state.profileIndex);
        await loadProfileType();
        await countRelays();
        await checkRelayReminder();
        await loadNpub();
        await loadTrustLevel();
        await generateQr();
        render();
    }
}

async function copyNpub() {
    const npub = await getNpub();
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(npub);
    } else {
        await api.runtime.sendMessage({ kind: 'copy', payload: npub });
    }
    // Brief "signal" flash on the copy control as confirmation
    elements.copyNpubBtn.classList.add('is-live');
    setTimeout(() => elements.copyNpubBtn.classList.remove('is-live'), 900);
}

async function addRelays() {
    const relays = RECOMMENDED_RELAYS.map(r => ({ url: r.href, read: true, write: true }));
    await saveRelays(state.profileIndex, relays);
    await countRelays();
    render();
}

async function noThanks() {
    await toggleRelayReminder();
    state.showRelayReminder = false;
    render();
}

async function openOptions() {
    await api.runtime.openOptionsPage();
    window.close();
}

// Event bindings
function bindEvents() {
    elements.unlockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await doUnlock();
    });

    elements.lockBtn.addEventListener('click', doLock);
    elements.profileSelect.addEventListener('change', handleProfileChange);
    elements.copyNpubBtn.addEventListener('click', copyNpub);
    elements.addRelaysBtn.addEventListener('click', addRelays);
    elements.noThanksBtn.addEventListener('click', noThanks);
    elements.settingsBtn.addEventListener('click', openOptions);
    elements.lockedSettingsBtn.addEventListener('click', openOptions);
    elements.securityRow.addEventListener('click', openOptions);
    elements.backupNowBtn.addEventListener('click', openOptions);
}

// Initialize
async function init() {
    console.log('NostrKey Popup initializing...');
    initElements();
    bindEvents();

    await initialize();

    state.hasPassword = await api.runtime.sendMessage({ kind: 'isEncrypted' });
    state.isLocked = await api.runtime.sendMessage({ kind: 'isLocked' });

    if (!state.isLocked) {
        await loadUnlockedState();
    } else {
        render();
    }
}

document.addEventListener('DOMContentLoaded', init);
