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
};

function $(id) { return document.getElementById(id); }

function truncateKey(key) {
    if (!key || key.length <= 20) return key || '';
    return key.slice(0, 12) + '\u2026' + key.slice(-8);
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

// --- Render ---

function render() {
    const profileList = $('profile-list');
    const noProfiles = $('no-profiles');
    const profileCount = $('profile-count');
    const detailEmpty = $('detail-empty');
    const detailPanel = $('detail-panel');
    const importPanel = $('import-panel');

    // Profile count
    if (profileCount) {
        profileCount.textContent = state.profiles.length + ' profile' + (state.profiles.length !== 1 ? 's' : '');
    }

    // Profile list
    if (profileList) {
        profileList.innerHTML = state.profiles.map(p => `
            <div class="profile-item ${state.selectedIndex === p.index ? 'selected' : ''}" data-profile-index="${p.index}">
                <div class="font-bold text-sm truncate" style="color:#f8f8f2;">${escapeHtml(p.name)}</div>
                <div class="profile-npub">${truncateKey(p.npub)}</div>
            </div>
        `).join('');

        profileList.querySelectorAll('[data-profile-index]').forEach(el => {
            el.addEventListener('click', () => selectProfile(parseInt(el.dataset.profileIndex, 10)));
        });
    }
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
        const detailNpub = $('detail-npub');
        const detailNsec = $('detail-nsec');
        const toggleBtn = $('toggle-nsec-btn');

        if (detailName) detailName.textContent = profile ? profile.name : '';
        if (detailNpub) detailNpub.textContent = state.npubValue || '';
        if (detailNsec) {
            detailNsec.textContent = state.nsecVisible ? state.nsecValue : '\u2022'.repeat(24);
        }
        if (toggleBtn) {
            toggleBtn.textContent = state.nsecVisible ? 'Hide' : 'Reveal';
        }
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
            importErrorEl.style.display = state.importError ? 'block' : 'none';
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

async function selectProfile(index) {
    state.selectedIndex = index;
    state.nsecVisible = false;
    state.nsecValue = '';
    state.npubValue = '';
    state.showImport = false;

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
    render();
}

async function copyNpub() {
    if (!state.npubValue) return;
    await navigator.clipboard.writeText(state.npubValue);
    showToast('nPub copied');
}

async function copyNsec() {
    if (!state.nsecValue) return;
    await navigator.clipboard.writeText(state.nsecValue);
    showToast('nSec copied');
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
    showToast('Exported');
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
    $('import-btn')?.addEventListener('click', showImportView);
    $('cancel-import-btn')?.addEventListener('click', hideImportView);
    $('do-import-btn')?.addEventListener('click', importKeys);

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

    await loadProfiles();
    bindEvents();
    render();
}

document.addEventListener('DOMContentLoaded', init);
