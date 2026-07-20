import { api } from '../utilities/browser-polyfill';
import {
    initialize,
    getProfileNames,
    getProfile,
    newProfile,
    saveProfileName,
    savePrivateKey,
    validateKey,
} from '../utilities/utils';

// storage.local key: { [npub]: ISO-date-string } — device-side "backed up" flags.
const BACKUP_FLAGS_KEY = 'keyBackupStatus';

const state = {
    profiles: [],          // Array of { index, name, npub }
    selectedIndex: null,
    nsecVisible: false,
    nsecValue: '',
    npubValue: '',
    showImport: false,
    importData: '',
    importName: '',
    importError: '',
    toast: '',
    // Guided backup (per-selection, resets when switching profiles)
    backupFlags: {},       // npub -> ISO date marked backed up
    backupStep1: false,    // revealed the nsec OR exported the JSON
    backupConfirmed: false // user confirmed the key lives outside the browser
};

function $(id) { return document.getElementById(id); }

function truncateKey(key) {
    if (!key || key.length <= 20) return key || '';
    return key.slice(0, 12) + '…' + key.slice(-8);
}

function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => { state.toast = ''; render(); }, 2000);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function isBackedUp(npub) {
    return Boolean(npub && state.backupFlags[npub]);
}

// Trust-ladder level for the meter. This surface is only reachable with a
// master password set (L2 prerequisite), but the ladder is cumulative:
// without a backup (L1) the channel reads L0. Lighting L1 jumps to L2.
function trustLevel(npub) {
    return isBackedUp(npub) ? 2 : 0;
}

function meterAria(level) {
    const meaning = ['not backed up', 'backed up', 'backed up + master password', 'bunker'];
    return 'Security level ' + level + ' of 3 — ' + meaning[level];
}

// --- Render ---

function renderProfileList() {
    const profileList = $('profile-list');
    if (!profileList) return;

    profileList.innerHTML = state.profiles.map(p => {
        const selected = state.selectedIndex === p.index;
        const backed = isBackedUp(p.npub);
        const level = trustLevel(p.npub);
        const initial = (p.name || '?').trim().charAt(0) || '?';
        return `
            <div class="channel-strip nk-strip${selected ? ' nk-strip--selected' : ''}"
                 data-profile-index="${p.index}" role="button" tabindex="0"
                 aria-pressed="${selected}">
                <div class="strip-avatar nk-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
                <div class="strip-id">
                    <div class="strip-name">
                        <span class="ins-truncate">${escapeHtml(p.name)}</span>
                        <span class="led ${backed ? 'led--green' : 'led--off'}"
                              aria-label="${backed ? 'Backed up' : 'Not backed up'}"></span>
                    </div>
                    <div class="strip-npub">${truncateKey(p.npub)}</div>
                </div>
                <div class="strip-end">
                    <div class="meter" data-level="${level}" role="img" aria-label="${meterAria(level)}">
                        <span class="meter-seg" data-seg="3"></span>
                        <span class="meter-seg" data-seg="2"></span>
                        <span class="meter-seg" data-seg="1"></span>
                        <span class="meter-seg" data-seg="0"></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    profileList.querySelectorAll('[data-profile-index]').forEach(el => {
        const go = () => selectProfile(parseInt(el.dataset.profileIndex, 10));
        el.addEventListener('click', go);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                go();
            }
        });
    });
}

function renderBackupModule() {
    const backed = isBackedUp(state.npubValue);

    const headerLed = $('backup-header-led');
    if (headerLed) headerLed.className = 'led ' + (backed ? 'led--green' : 'led--amber');

    const pending = $('backup-pending');
    const done = $('backup-done');
    if (pending) pending.style.display = backed ? 'none' : 'block';
    if (done) done.style.display = backed ? 'block' : 'none';

    if (backed) {
        const dateEl = $('backup-done-date');
        if (dateEl) {
            const iso = state.backupFlags[state.npubValue];
            let label = '';
            try { label = new Date(iso).toLocaleDateString(); } catch (_) {}
            dateEl.textContent = label ? 'L1 lit · ' + label : 'L1 lit';
        }
        return;
    }

    // Step 1 LED: revealed or exported
    const step1Led = $('backup-step1-led');
    if (step1Led) {
        step1Led.className = 'led ' + (state.backupStep1 ? 'led--green' : 'led--off');
        step1Led.setAttribute('aria-label', state.backupStep1 ? 'Step 1 complete' : 'Step 1 incomplete');
    }

    // Step 2 patch-point + LED
    const confirmBtn = $('backup-confirm-btn');
    if (confirmBtn) confirmBtn.setAttribute('aria-pressed', state.backupConfirmed ? 'true' : 'false');
    const step2Led = $('backup-step2-led');
    if (step2Led) {
        step2Led.className = 'led ' + (state.backupConfirmed ? 'led--green' : 'led--off');
        step2Led.setAttribute('aria-label', state.backupConfirmed ? 'Step 2 complete' : 'Step 2 incomplete');
    }

    // Step 3 gate: only armed once steps 1 + 2 are done
    const markBtn = $('mark-backed-up-btn');
    if (markBtn) markBtn.disabled = !(state.backupStep1 && state.backupConfirmed);
}

function render() {
    const noProfiles = $('no-profiles');
    const profileCount = $('profile-count');
    const detailEmpty = $('detail-empty');
    const detailPanel = $('detail-panel');
    const importPanel = $('import-panel');

    // Profile count
    if (profileCount) {
        profileCount.textContent = String(state.profiles.length);
    }

    renderProfileList();
    if (noProfiles) noProfiles.style.display = state.profiles.length === 0 ? 'block' : 'none';

    // Right panel states
    const showDetail = state.selectedIndex !== null && !state.showImport;
    const showImportForm = state.showImport;
    const showEmpty = !showDetail && !showImportForm;

    if (detailEmpty) detailEmpty.style.display = showEmpty ? 'block' : 'none';
    if (detailPanel) detailPanel.style.display = showDetail ? 'block' : 'none';
    if (importPanel) importPanel.style.display = showImportForm ? 'block' : 'none';

    // Detail panel content
    if (showDetail) {
        const profile = state.profiles.find(p => p.index === state.selectedIndex);
        const detailName = $('detail-name');
        const detailAvatar = $('detail-avatar');
        const detailNpub = $('detail-npub');
        const detailNpubShort = $('detail-npub-short');
        const detailNsec = $('detail-nsec');
        const toggleBtn = $('toggle-nsec-btn');
        const backupLed = $('detail-backup-led');
        const backupLabel = $('detail-backup-label');
        const meter = $('detail-meter');

        const backed = isBackedUp(state.npubValue);
        const level = trustLevel(state.npubValue);

        if (detailName) detailName.textContent = profile ? profile.name : '';
        if (detailAvatar) {
            detailAvatar.textContent = profile ? ((profile.name || '?').trim().charAt(0) || '?') : '?';
        }
        if (detailNpub) detailNpub.textContent = state.npubValue || '';
        if (detailNpubShort) detailNpubShort.textContent = truncateKey(state.npubValue);
        if (detailNsec) {
            detailNsec.textContent = state.nsecVisible ? state.nsecValue : '•'.repeat(24);
        }
        if (toggleBtn) {
            toggleBtn.textContent = state.nsecVisible ? 'Hide' : 'Reveal';
        }
        if (backupLed) backupLed.className = 'led ' + (backed ? 'led--green' : 'led--off');
        if (backupLabel) backupLabel.textContent = backed ? 'backed up' : 'not backed up';
        if (meter) {
            meter.dataset.level = String(level);
            meter.setAttribute('aria-label', meterAria(level));
        }

        renderBackupModule();
    }

    // Import form
    if (showImportForm) {
        const importDataEl = $('import-data');
        const importNameEl = $('import-name');
        const importErrorEl = $('import-error');

        if (importDataEl && document.activeElement !== importDataEl) {
            importDataEl.value = state.importData;
        }
        if (importNameEl && document.activeElement !== importNameEl) {
            importNameEl.value = state.importName;
        }
        if (importErrorEl) {
            importErrorEl.textContent = state.importError;
            importErrorEl.style.display = state.importError ? 'flex' : 'none';
        }
    }

    // Toast
    const toast = $('toast');
    if (toast) {
        toast.textContent = state.toast;
        toast.style.display = state.toast ? 'block' : 'none';
    }
}

// --- Data loading ---

async function loadProfiles() {
    const names = await getProfileNames();
    const profiles = [];

    for (let i = 0; i < names.length; i++) {
        let npub = '';
        try {
            npub = await api.runtime.sendMessage({ kind: 'getNpub', payload: i });
        } catch (_) {}
        profiles.push({ index: i, name: names[i], npub: npub || '' });
    }

    state.profiles = profiles;
}

async function loadBackupFlags() {
    try {
        const data = await api.storage.local.get({ [BACKUP_FLAGS_KEY]: {} });
        state.backupFlags = data[BACKUP_FLAGS_KEY] || {};
    } catch (_) {
        state.backupFlags = {};
    }
}

async function selectProfile(index) {
    state.selectedIndex = index;
    state.nsecVisible = false;
    state.nsecValue = '';
    state.npubValue = '';
    state.showImport = false;
    state.backupStep1 = false;
    state.backupConfirmed = false;

    // Load npub
    const profile = state.profiles.find(p => p.index === index);
    state.npubValue = profile ? profile.npub : '';

    // Load nsec from background
    try {
        const nsec = await api.runtime.sendMessage({ kind: 'getNsec', payload: index });
        state.nsecValue = nsec || '';
    } catch (_) {
        state.nsecValue = '';
    }

    render();
}

// --- Actions ---

function toggleNsec() {
    state.nsecVisible = !state.nsecVisible;
    if (state.nsecVisible) state.backupStep1 = true;  // guided backup step 1
    render();
}

async function copyNpub() {
    if (!state.npubValue) return;
    await navigator.clipboard.writeText(state.npubValue);
    showToast('npub copied');
}

async function copyNsec() {
    if (!state.nsecValue) return;
    await navigator.clipboard.writeText(state.nsecValue);
    showToast('nsec copied — clipboard clears in 30s');
    // Clear clipboard after 30 seconds for security
    setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {});
    }, 30000);
}

async function exportAsJson() {
    if (state.selectedIndex === null) return;
    const profile = state.profiles.find(p => p.index === state.selectedIndex);
    if (!profile) return;

    const data = {
        name: profile.name,
        npub: state.npubValue,
        nsec: state.nsecValue,
        exportedAt: new Date().toISOString(),
        source: 'NostrKey',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nostrkey-${profile.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    state.backupStep1 = true;  // guided backup step 1
    showToast('Exported');
}

function toggleBackupConfirm() {
    state.backupConfirmed = !state.backupConfirmed;
    render();
}

async function markBackedUp() {
    if (!state.npubValue) return;
    if (!(state.backupStep1 && state.backupConfirmed)) return;
    state.backupFlags[state.npubValue] = new Date().toISOString();
    try {
        await api.storage.local.set({ [BACKUP_FLAGS_KEY]: state.backupFlags });
    } catch (_) {}
    showToast('L1 lit — key backed up');
    render();
}

async function resetBackupStatus() {
    if (!state.npubValue) return;
    const ok = window.confirm(
        'Reset backup status for this key? The L1 LED goes dark until you complete the backup steps again.'
    );
    if (!ok) return;
    delete state.backupFlags[state.npubValue];
    try {
        await api.storage.local.set({ [BACKUP_FLAGS_KEY]: state.backupFlags });
    } catch (_) {}
    state.backupStep1 = false;
    state.backupConfirmed = false;
    render();
}

function showImportView() {
    state.showImport = true;
    state.selectedIndex = null;
    state.importData = '';
    state.importName = '';
    state.importError = '';
    render();
}

function hideImportView() {
    state.showImport = false;
    state.importData = '';
    state.importName = '';
    state.importError = '';
    render();
}

async function importKeys() {
    state.importError = '';
    const raw = state.importData.trim();

    if (!raw) {
        state.importError = 'Please paste a JSON object or nsec string.';
        render();
        return;
    }

    let name = state.importName.trim();
    let nsecKey = '';

    // Try parsing as JSON first
    try {
        const parsed = JSON.parse(raw);
        nsecKey = parsed.nsec || parsed.privkey || parsed.privateKey || '';
        if (!name && parsed.name) name = parsed.name;
    } catch (_) {
        // Not JSON — treat as raw nsec or hex key
        nsecKey = raw;
    }

    if (!nsecKey) {
        state.importError = 'No private key found. Provide an nsec string or JSON with an "nsec" field.';
        render();
        return;
    }

    // Validate the key
    if (!validateKey(nsecKey)) {
        state.importError = 'Invalid key format. Expected nsec1..., hex private key, or seed phrase.';
        render();
        return;
    }

    if (!name) name = 'Imported Profile';

    try {
        // Create a new profile slot
        const newIndex = await newProfile();

        // Save the name
        await saveProfileName(newIndex, name);

        // Save the private key via background
        await savePrivateKey(newIndex, nsecKey);

        // Reload profiles
        await loadProfiles();

        // Select the new profile
        state.showImport = false;
        state.importData = '';
        state.importName = '';
        state.importError = '';
        await selectProfile(newIndex);

        showToast('Imported "' + name + '"');
    } catch (e) {
        state.importError = 'Import failed: ' + (e.message || 'unknown error');
        render();
    }
}

// --- Event binding ---

function bindEvents() {
    $('close-btn')?.addEventListener('click', () => window.close());
    $('copy-npub-btn')?.addEventListener('click', copyNpub);
    $('copy-nsec-btn')?.addEventListener('click', copyNsec);
    $('toggle-nsec-btn')?.addEventListener('click', toggleNsec);
    $('export-btn')?.addEventListener('click', exportAsJson);
    $('export-again-btn')?.addEventListener('click', exportAsJson);
    $('import-btn')?.addEventListener('click', showImportView);
    $('cancel-import-btn')?.addEventListener('click', hideImportView);
    $('do-import-btn')?.addEventListener('click', importKeys);

    // Guided backup
    $('backup-confirm-btn')?.addEventListener('click', toggleBackupConfirm);
    $('mark-backed-up-btn')?.addEventListener('click', markBackedUp);
    $('backup-reset-btn')?.addEventListener('click', resetBackupStatus);

    $('import-data')?.addEventListener('input', (e) => {
        state.importData = e.target.value;
    });
    $('import-name')?.addEventListener('input', (e) => {
        state.importName = e.target.value;
    });
}

// --- Init ---

async function init() {
    await initialize();

    // Gate: require master password
    const isEncrypted = await api.runtime.sendMessage({ kind: 'isEncrypted' });
    const gate = $('vault-locked-gate');
    const main = $('vault-main-content');

    if (!isEncrypted) {
        if (gate) gate.style.display = 'block';
        if (main) main.style.display = 'none';
        $('gate-security-btn')?.addEventListener('click', () => {
            const url = api.runtime.getURL('security/security.html');
            window.open(url, 'nostrkey-options');
        });
        return;
    }

    if (gate) gate.style.display = 'none';
    if (main) main.style.display = 'block';

    await loadBackupFlags();
    await loadProfiles();
    bindEvents();
    render();
}

document.addEventListener('DOMContentLoaded', init);
