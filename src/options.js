/**
 * NostrKey Full Settings - Vanilla JS (CSP-safe)
 */

import {
    clearData,
    getProfileIndex,
    getProfileNames,
    getProfile,
    getRelays,
    initialize,
    newBunkerProfile,
    savePrivateKey,
    saveProfileName,
    saveRelays,
    RECOMMENDED_RELAYS,
    getPermissions,
    setPermission,
    humanPermission,
    validateKey,
    isNcryptsec,
    looksLikeSeedPhrase,
} from './utilities/utils';
import { api } from './utilities/browser-polyfill';
import QRCode from 'qrcode';

// State
const state = {
    profileNames: ['---'],
    profileIndex: 0,
    profileName: '',
    pristineProfileName: '',
    privKey: '',
    pristinePrivKey: '',
    pubKey: '',
    relays: [],
    newRelay: '',
    urlError: '',
    recommendedRelay: '',
    permissions: {},
    host: '',
    permHosts: [],
    hostPerms: [],
    visible: false,
    copied: false,
    
    // QR state
    npubQrDataUrl: '',
    nsecQrDataUrl: '',
    showNsecQr: false,
    
    // ncryptsec state
    ncryptsecPassword: '',
    ncryptsecError: '',
    ncryptsecLoading: false,
    ncryptsecExportPassword: '',
    ncryptsecExportConfirm: '',
    ncryptsecExportResult: '',
    ncryptsecExportError: '',
    ncryptsecExportLoading: false,
    ncryptsecExportCopied: false,

    // Seed phrase state
    seedPhraseDetected: false,
    seedPhraseError: '',
    seedPhraseLoading: false,
    seedPhraseRevealed: false,
    seedPhraseText: '',
    seedPhraseCopied: false,

    // Bunker state
    profileType: 'local',
    bunkerUrl: '',
    bunkerConnected: false,
    bunkerError: '',
    bunkerConnecting: false,
    bunkerPubkey: '',
    
    // Protocol handler
    protocolHandler: '',
    
    // Security state
    hasPassword: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    removePasswordInput: '',
    securityError: '',
    securitySuccess: '',
    removeError: '',
};

// DOM Elements
const elements = {};

function $(id) {
    return document.getElementById(id);
}

function initElements() {
    // Profile elements
    elements.profileSelect = $('profiles');
    elements.settingsContainer = $('settings-container');
    elements.newBunkerBtn = document.querySelector('[data-action="newBunkerProfile"]');
    
    // Keys section (local profiles)
    elements.keysSection = document.querySelector('[data-section="keys"]');
    elements.profileNameInput = $('profile-name');
    elements.privKeyInput = $('priv-key');
    elements.pubKeyInput = $('pub-key');
    elements.visibilityToggle = document.querySelector('[data-action="toggleVisibility"]');
    elements.copyPubKeyBtn = document.querySelector('[data-action="copyPubKey"]');
    elements.saveProfileBtn = document.querySelector('[data-action="saveProfile"]');
    
    // ncryptsec import
    elements.ncryptsecSection = document.querySelector('[data-section="ncryptsec-import"]');
    elements.ncryptsecPasswordInput = $('ncryptsec-password');
    elements.ncryptsecError = $('ncryptsec-error');
    elements.decryptBtn = document.querySelector('[data-action="decryptNcryptsec"]');
    
    // QR codes
    elements.npubQrContainer = $('npub-qr-container');
    elements.npubQrImage = $('npub-qr-image');
    elements.showNsecQrBtn = document.querySelector('[data-action="showNsecQr"]');
    elements.nsecQrSection = $('nsec-qr-section');
    elements.nsecQrImage = $('nsec-qr-image');
    elements.hideNsecQrBtn = document.querySelector('[data-action="hideNsecQr"]');
    
    // ncryptsec export
    elements.ncryptsecExportPassword = $('ncryptsec-export-password');
    elements.ncryptsecExportConfirm = $('ncryptsec-export-confirm');
    elements.ncryptsecExportError = $('ncryptsec-export-error');
    elements.exportNcryptsecBtn = document.querySelector('[data-action="exportNcryptsec"]');
    elements.ncryptsecExportResult = $('ncryptsec-export-result');
    elements.copyNcryptsecBtn = document.querySelector('[data-action="copyNcryptsecExport"]');
    
    // Seed phrase import
    elements.seedPhraseImportSection = document.querySelector('[data-section="seedphrase-import"]');
    elements.seedPhraseImportError = $('seedphrase-import-error');
    elements.importSeedPhraseBtn = document.querySelector('[data-action="importSeedPhrase"]');

    // Seed phrase export
    elements.seedPhraseExportSection = $('seedphrase-export-section');
    elements.revealSeedPhraseBtn = document.querySelector('[data-action="revealSeedPhrase"]');
    elements.seedPhraseRevealBox = $('seedphrase-export-reveal');
    elements.seedPhraseText = $('seedphrase-export-text');
    elements.copySeedPhraseBtn = document.querySelector('[data-action="copySeedPhrase"]');
    elements.hideSeedPhraseBtn = document.querySelector('[data-action="hideSeedPhrase"]');

    // Bunker section
    elements.bunkerSection = document.querySelector('[data-section="bunker"]');
    elements.bunkerProfileNameInput = $('bunker-profile-name');
    elements.saveBunkerNameBtn = document.querySelector('[data-action="saveBunkerName"]');
    elements.bunkerUrlInput = $('bunker-url');
    elements.connectBunkerBtn = document.querySelector('[data-action="connectBunker"]');
    elements.disconnectBunkerBtn = document.querySelector('[data-action="disconnectBunker"]');
    elements.pingBunkerBtn = document.querySelector('[data-action="pingBunker"]');
    elements.bunkerStatus = $('bunker-status-indicator');
    elements.bunkerStatusText = $('bunker-status-text');
    elements.bunkerError = $('bunker-error');
    elements.bunkerPubKeyInput = $('bunker-pubkey');
    elements.copyBunkerPubKeyBtn = document.querySelector('[data-action="copyBunkerPubKey"]');
    
    // Relays
    elements.relaysTable = $('relays-table');
    elements.relaysEmpty = $('relays-empty');
    elements.recommendedRelaySelect = $('recommended-relay');
    elements.newRelayInput = $('new-relay');
    elements.addRelayBtn = document.querySelector('[data-action="addRelay"]');
    elements.relayError = $('relay-error');
    
    // Permissions
    elements.appSelect = $('app-select');
    elements.permissionsTable = $('permissions-table');
    elements.permissionsEmpty = $('permissions-empty');
    
    // Security
    elements.securityStatus = $('security-status');
    elements.setPasswordSection = $('set-password-section');
    elements.changePasswordSection = $('change-password-section');
    elements.newPasswordInput = $('new-password');
    elements.confirmPasswordInput = $('confirm-password');
    elements.passwordStrength = $('password-strength');
    elements.securityError = $('security-error');
    elements.securitySuccess = $('security-success');
    elements.setPasswordBtn = document.querySelector('[data-action="setPassword"]');
    elements.currentPasswordInput = $('current-password');
    elements.newPasswordChangeInput = $('new-password-change');
    elements.confirmPasswordChangeInput = $('confirm-password-change');
    elements.changePasswordBtn = document.querySelector('[data-action="changePassword"]');
    elements.removePasswordInput = $('remove-password');
    elements.removeError = $('remove-error');
    elements.removePasswordBtn = document.querySelector('[data-action="removePassword"]');
    
    // Protocol handler
    elements.protocolHandlerInput = $('protocol-handler');
    elements.useNjumpBtn = document.querySelector('[data-action="useNjump"]');
    elements.disableHandlerBtn = document.querySelector('[data-action="disableHandler"]');
    
    // General
    elements.closeBtn = $('close-btn');
    elements.clearDataBtn = document.querySelector('[data-action="clearData"]');
}

// Render functions
function render() {
    renderProfileSelect();
    renderProfileType();
    
    if (state.profileType === 'local') {
        renderLocalProfile();
    } else {
        renderBunkerProfile();
    }
    
    renderRelays();
    renderPermissions();
    renderSecurity();
    renderProtocolHandler();
    renderInputs();
}

function renderProfileSelect() {
    if (!elements.profileSelect) return;
    
    const hasSelection = state.profileIndex !== null && state.profileIndex >= 0;
    
    elements.profileSelect.innerHTML = 
        '<option value="" disabled' + (!hasSelection ? ' selected' : '') + '>Select a profile...</option>' +
        state.profileNames
            .map((name, i) => `<option value="${i}"${i === state.profileIndex && hasSelection ? ' selected' : ''}>${name}</option>`)
            .join('');
    
    // Show/hide settings container based on selection
    if (elements.settingsContainer) {
        elements.settingsContainer.style.display = hasSelection ? 'block' : 'none';
    }
}

function renderProfileType() {
    const isLocal = state.profileType === 'local';
    
    if (elements.keysSection) {
        elements.keysSection.style.display = isLocal ? 'block' : 'none';
    }
    if (elements.bunkerSection) {
        elements.bunkerSection.style.display = isLocal ? 'none' : 'block';
    }
}

function renderLocalProfile() {
    if (elements.profileNameInput) {
        elements.profileNameInput.value = state.profileName;
    }
    if (elements.privKeyInput) {
        elements.privKeyInput.value = state.privKey;
        elements.privKeyInput.type = state.visible ? 'text' : 'password';
        
        // Validate key
        const isValid = validateKey(state.privKey);
        if (state.privKey && !isValid) {
            elements.privKeyInput.classList.add('ring-2', 'ring-rose-500');
        } else {
            elements.privKeyInput.classList.remove('ring-2', 'ring-rose-500');
        }
    }
    if (elements.pubKeyInput) {
        elements.pubKeyInput.value = state.pubKey;
    }
    if (elements.visibilityToggle) {
        elements.visibilityToggle.textContent = state.visible ? 'Hide' : 'Show';
    }
    
    // ncryptsec import section
    const hasNcryptsec = isNcryptsec(state.privKey);
    if (elements.ncryptsecSection) {
        elements.ncryptsecSection.style.display = hasNcryptsec ? 'block' : 'none';
    }

    // Seed phrase import section
    if (elements.seedPhraseImportSection) {
        elements.seedPhraseImportSection.style.display = state.seedPhraseDetected && !hasNcryptsec ? 'block' : 'none';
    }
    if (elements.seedPhraseImportError) {
        elements.seedPhraseImportError.textContent = state.seedPhraseError;
        elements.seedPhraseImportError.style.display = state.seedPhraseError ? 'block' : 'none';
    }
    if (elements.importSeedPhraseBtn) {
        elements.importSeedPhraseBtn.disabled = state.seedPhraseLoading;
        elements.importSeedPhraseBtn.textContent = state.seedPhraseLoading ? 'Importing...' : 'Import from Seed Phrase';
    }

    if (elements.saveProfileBtn) {
        elements.saveProfileBtn.style.display = hasNcryptsec || state.seedPhraseDetected ? 'none' : 'block';
        const needsSave = state.privKey !== state.pristinePrivKey || state.profileName !== state.pristineProfileName;
        elements.saveProfileBtn.disabled = !needsSave || !validateKey(state.privKey);
    }

    // Seed phrase export section (only for local profiles with an existing key)
    if (elements.seedPhraseExportSection) {
        elements.seedPhraseExportSection.style.display = state.pristinePrivKey && !hasNcryptsec ? 'block' : 'none';
    }
    if (elements.seedPhraseRevealBox) {
        elements.seedPhraseRevealBox.style.display = state.seedPhraseRevealed ? 'block' : 'none';
    }
    if (elements.seedPhraseText) {
        elements.seedPhraseText.value = state.seedPhraseText;
    }
    if (elements.revealSeedPhraseBtn) {
        elements.revealSeedPhraseBtn.style.display = state.seedPhraseRevealed ? 'none' : 'inline-block';
    }
    if (elements.copySeedPhraseBtn) {
        elements.copySeedPhraseBtn.textContent = state.seedPhraseCopied ? 'Copied!' : 'Copy';
    }
    
    // QR codes
    if (elements.npubQrContainer && state.npubQrDataUrl) {
        elements.npubQrContainer.style.display = 'flex';
        if (elements.npubQrImage) {
            elements.npubQrImage.src = state.npubQrDataUrl;
        }
    } else if (elements.npubQrContainer) {
        elements.npubQrContainer.style.display = 'none';
    }
    
    if (elements.showNsecQrBtn) {
        elements.showNsecQrBtn.style.display = state.visible && state.privKey && !hasNcryptsec ? 'block' : 'none';
    }
    if (elements.nsecQrSection) {
        elements.nsecQrSection.style.display = state.showNsecQr && state.nsecQrDataUrl ? 'block' : 'none';
        if (elements.nsecQrImage && state.nsecQrDataUrl) {
            elements.nsecQrImage.src = state.nsecQrDataUrl;
        }
    }
    
    // ncryptsec export
    if (elements.exportNcryptsecBtn) {
        const canExport = state.ncryptsecExportPassword.length >= 8 && 
                         state.ncryptsecExportPassword === state.ncryptsecExportConfirm;
        elements.exportNcryptsecBtn.disabled = !canExport || state.ncryptsecExportLoading;
        elements.exportNcryptsecBtn.textContent = state.ncryptsecExportLoading ? 'Encrypting...' : 'Export ncryptsec';
    }
    if (elements.ncryptsecExportResult) {
        elements.ncryptsecExportResult.value = state.ncryptsecExportResult;
        elements.ncryptsecExportResult.parentElement.style.display = state.ncryptsecExportResult ? 'block' : 'none';
    }
    if (elements.copyNcryptsecBtn) {
        elements.copyNcryptsecBtn.textContent = state.ncryptsecExportCopied ? 'Copied!' : 'Copy';
    }
}

function renderBunkerProfile() {
    if (elements.bunkerProfileNameInput) {
        elements.bunkerProfileNameInput.value = state.profileName;
    }
    if (elements.bunkerUrlInput) {
        elements.bunkerUrlInput.value = state.bunkerUrl;
        elements.bunkerUrlInput.disabled = state.bunkerConnected;
    }
    if (elements.connectBunkerBtn) {
        elements.connectBunkerBtn.style.display = state.bunkerConnected ? 'none' : 'inline-block';
        elements.connectBunkerBtn.disabled = state.bunkerConnecting || !state.bunkerUrl;
        elements.connectBunkerBtn.textContent = state.bunkerConnecting ? 'Connecting...' : 'Connect';
    }
    if (elements.disconnectBunkerBtn) {
        elements.disconnectBunkerBtn.style.display = state.bunkerConnected ? 'inline-block' : 'none';
    }
    if (elements.pingBunkerBtn) {
        elements.pingBunkerBtn.style.display = state.bunkerConnected ? 'inline-block' : 'none';
    }
    if (elements.bunkerStatus) {
        elements.bunkerStatus.className = `inline-block w-3 h-3 rounded-full ${state.bunkerConnected ? 'bg-green-500' : 'bg-red-500'}`;
    }
    if (elements.bunkerStatusText) {
        elements.bunkerStatusText.textContent = state.bunkerConnected ? 'Connected' : 'Disconnected';
    }
    if (elements.bunkerError) {
        elements.bunkerError.textContent = state.bunkerError;
        elements.bunkerError.style.display = state.bunkerError ? 'block' : 'none';
    }
    if (elements.bunkerPubKeyInput) {
        elements.bunkerPubKeyInput.value = state.pubKey;
        elements.bunkerPubKeyInput.parentElement.style.display = state.bunkerPubkey ? 'block' : 'none';
    }
    if (elements.saveBunkerNameBtn) {
        const needsSave = state.profileName !== state.pristineProfileName;
        elements.saveBunkerNameBtn.disabled = !needsSave;
    }
}

function renderInputs() {
    // Sync state → DOM for all two-way bound inputs
    if (elements.newRelayInput) elements.newRelayInput.value = state.newRelay;
    if (elements.ncryptsecPasswordInput) elements.ncryptsecPasswordInput.value = state.ncryptsecPassword;
    if (elements.ncryptsecExportPassword) elements.ncryptsecExportPassword.value = state.ncryptsecExportPassword;
    if (elements.ncryptsecExportConfirm) elements.ncryptsecExportConfirm.value = state.ncryptsecExportConfirm;
    if (elements.newPasswordInput) elements.newPasswordInput.value = state.newPassword;
    if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = state.confirmPassword;
    if (elements.currentPasswordInput) elements.currentPasswordInput.value = state.currentPassword;
    if (elements.newPasswordChangeInput) elements.newPasswordChangeInput.value = state.newPassword;
    if (elements.confirmPasswordChangeInput) elements.confirmPasswordChangeInput.value = state.confirmPassword;
    if (elements.removePasswordInput) elements.removePasswordInput.value = state.removePasswordInput;
}

function renderRelays() {
    if (!elements.relaysTable) return;

    if (state.relays.length > 0) {
        elements.relaysTable.style.display = 'table';
        if (elements.relaysEmpty) elements.relaysEmpty.style.display = 'none';
        
        const tbody = elements.relaysTable.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = state.relays.map((relay, index) => `
                <tr>
                    <td class="p-2 w-1/3">${relay.url}</td>
                    <td class="p-2 text-center">
                        <input class="checkbox" type="checkbox" ${relay.read ? 'checked' : ''} data-relay-index="${index}" data-relay-prop="read">
                    </td>
                    <td class="p-2 text-center">
                        <input class="checkbox" type="checkbox" ${relay.write ? 'checked' : ''} data-relay-index="${index}" data-relay-prop="write">
                    </td>
                    <td class="p-2 text-center">
                        <button class="button" data-action="deleteRelay" data-relay-index="${index}">Delete</button>
                    </td>
                </tr>
            `).join('');
            
            // Bind relay checkbox events
            tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', handleRelayCheckboxChange);
            });
            
            // Bind delete relay buttons
            tbody.querySelectorAll('[data-action="deleteRelay"]').forEach(btn => {
                btn.addEventListener('click', handleDeleteRelay);
            });
        }
    } else {
        elements.relaysTable.style.display = 'none';
        if (elements.relaysEmpty) elements.relaysEmpty.style.display = 'block';
    }
    
    // Recommended relays
    if (elements.recommendedRelaySelect) {
        const recommended = getRecommendedRelays();
        elements.recommendedRelaySelect.parentElement.style.display = recommended.length > 0 ? 'block' : 'none';
        elements.recommendedRelaySelect.innerHTML = '<option value="" disabled selected>Recommended Relays</option>' +
            recommended.map(url => `<option value="${url}">${url}</option>`).join('');
    }
    
    if (elements.relayError) {
        elements.relayError.textContent = state.urlError;
        elements.relayError.style.display = state.urlError ? 'block' : 'none';
    }
}

function renderPermissions() {
    if (!elements.appSelect) return;
    
    // Render app select
    if (state.permHosts.length > 0) {
        elements.appSelect.parentElement.style.display = 'block';
        elements.appSelect.innerHTML = '<option value=""></option>' +
            state.permHosts.map(host => `<option value="${host}"${host === state.host ? ' selected' : ''}>${host}</option>`).join('');
    } else {
        elements.appSelect.parentElement.style.display = 'none';
    }
    
    // Render permissions table
    if (elements.permissionsTable && state.hostPerms.length > 0) {
        elements.permissionsTable.style.display = 'table';
        if (elements.permissionsEmpty) elements.permissionsEmpty.style.display = 'none';
        
        const tbody = elements.permissionsTable.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = state.hostPerms.map(([etype, humanName, perm]) => `
                <tr>
                    <td class="p-2 w-1/3 md:w-2/4">${humanName}</td>
                    <td class="p-2 text-center">
                        <select class="input" data-perm-type="${etype}" data-perm-value="${perm}">
                            <option value="ask"${perm === 'ask' ? ' selected' : ''}>Ask</option>
                            <option value="allow"${perm === 'allow' ? ' selected' : ''}>Allow</option>
                            <option value="deny"${perm === 'deny' ? ' selected' : ''}>Deny</option>
                        </select>
                    </td>
                </tr>
            `).join('');
            
            // Bind permission change events
            tbody.querySelectorAll('select').forEach(sel => {
                sel.addEventListener('change', handlePermissionChange);
            });
        }
    } else {
        if (elements.permissionsTable) elements.permissionsTable.style.display = 'none';
        if (elements.permissionsEmpty) {
            elements.permissionsEmpty.style.display = state.permHosts.length === 0 ? 'block' : 'none';
        }
    }
}

function renderSecurity() {
    if (elements.securityStatus) {
        elements.securityStatus.textContent = state.hasPassword
            ? 'Master password is active — keys are encrypted at rest.'
            : 'No master password set — keys are stored unencrypted.';
    }
    
    if (elements.setPasswordSection) {
        elements.setPasswordSection.style.display = state.hasPassword ? 'none' : 'block';
    }
    if (elements.changePasswordSection) {
        elements.changePasswordSection.style.display = state.hasPassword ? 'block' : 'none';
    }
    
    // Password strength indicator
    if (elements.passwordStrength && state.newPassword) {
        const strength = calculatePasswordStrength(state.newPassword);
        const labels = ['', 'Too short', 'Weak', 'Fair', 'Strong', 'Very strong'];
        const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-green-700 font-bold'];
        elements.passwordStrength.textContent = labels[strength] || '';
        elements.passwordStrength.className = `text-xs mt-1 ${colors[strength] || ''}`;
        elements.passwordStrength.style.display = state.newPassword ? 'block' : 'none';
    } else if (elements.passwordStrength) {
        elements.passwordStrength.style.display = 'none';
    }
    
    // Button states
    if (elements.setPasswordBtn) {
        const canSet = state.newPassword.length >= 8 && state.newPassword === state.confirmPassword;
        elements.setPasswordBtn.disabled = !canSet;
    }
    if (elements.changePasswordBtn) {
        const canChange = state.currentPassword.length > 0 && 
                         state.newPassword.length >= 8 && 
                         state.newPassword === state.confirmPassword;
        elements.changePasswordBtn.disabled = !canChange;
    }
    if (elements.removePasswordBtn) {
        elements.removePasswordBtn.disabled = !state.removePasswordInput;
    }
    
    // Error/success messages
    if (elements.securityError) {
        elements.securityError.textContent = state.securityError;
        elements.securityError.style.display = state.securityError ? 'block' : 'none';
    }
    if (elements.securitySuccess) {
        elements.securitySuccess.textContent = state.securitySuccess;
        elements.securitySuccess.style.display = state.securitySuccess ? 'block' : 'none';
    }
    if (elements.removeError) {
        elements.removeError.textContent = state.removeError;
        elements.removeError.style.display = state.removeError ? 'block' : 'none';
    }
}

function renderProtocolHandler() {
    if (elements.protocolHandlerInput) {
        elements.protocolHandlerInput.value = state.protocolHandler;
    }
}

// Helper functions
function getRecommendedRelays() {
    const relayUrls = state.relays.map(r => new URL(r.url).href);
    return RECOMMENDED_RELAYS.filter(r => !relayUrls.includes(r.href)).map(r => r.href);
}

function calculatePasswordStrength(pw) {
    if (pw.length === 0) return 0;
    if (pw.length < 8) return 1;
    let score = 2;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 5);
}

// Data loading functions
async function loadProfile() {
    state.profileNames = await getProfileNames();
    state.profileIndex = await getProfileIndex();
    
    // Check for index in URL
    const params = new URLSearchParams(window.location.search);
    const urlIndex = params.get('index');
    if (urlIndex) {
        state.profileIndex = parseInt(urlIndex);
    }
    
    await refreshProfile();
}

async function refreshProfile() {
    state.profileNames = await getProfileNames();
    state.profileName = state.profileNames[state.profileIndex];
    state.pristineProfileName = state.profileName;
    
    // Load profile type
    state.profileType = await api.runtime.sendMessage({
        kind: 'getProfileType',
        payload: state.profileIndex,
    });
    
    // Reset QR, ncryptsec, and seed phrase state
    state.npubQrDataUrl = '';
    state.nsecQrDataUrl = '';
    state.showNsecQr = false;
    state.ncryptsecExportResult = '';
    state.ncryptsecExportError = '';
    state.ncryptsecExportPassword = '';
    state.ncryptsecExportConfirm = '';
    state.seedPhraseDetected = false;
    state.seedPhraseError = '';
    state.seedPhraseLoading = false;
    state.seedPhraseRevealed = false;
    state.seedPhraseText = '';
    state.seedPhraseCopied = false;
    
    if (state.profileType === 'local') {
        await loadLocalProfile();
    } else {
        await loadBunkerProfile();
    }
    
    await loadRelays();
    await loadPermissions();
    
    render();
}

async function loadLocalProfile() {
    state.privKey = await api.runtime.sendMessage({
        kind: 'getNsec',
        payload: state.profileIndex,
    });
    state.pristinePrivKey = state.privKey;
    
    state.pubKey = await api.runtime.sendMessage({
        kind: 'getNpub',
        payload: state.profileIndex,
    });
    
    await generateNpubQr();
}

async function loadBunkerProfile() {
    const profile = await getProfile(state.profileIndex);
    state.bunkerUrl = profile?.bunkerUrl || '';
    state.bunkerPubkey = profile?.remotePubkey || '';
    state.bunkerError = '';
    
    if (state.bunkerPubkey) {
        state.pubKey = await api.runtime.sendMessage({
            kind: 'npubEncode',
            payload: state.bunkerPubkey,
        });
    } else {
        state.pubKey = '';
    }
    
    const status = await api.runtime.sendMessage({
        kind: 'bunker.status',
        payload: state.profileIndex,
    });
    state.bunkerConnected = status?.connected || false;
}

async function loadRelays() {
    state.relays = await getRelays(state.profileIndex);
}

async function loadPermissions() {
    state.permissions = await getPermissions(state.profileIndex);
    
    // Calculate hosts
    state.permHosts = Object.keys(state.permissions).sort();
    
    // Calculate host perms
    calcHostPerms();
}

function calcHostPerms() {
    const hp = state.permissions[state.host] || {};
    const keys = Object.keys(hp).sort();
    state.hostPerms = keys.map(k => [k, humanPermission(k), hp[k]]);
}

async function generateNpubQr() {
    try {
        if (!state.pubKey) {
            state.npubQrDataUrl = '';
            return;
        }
        state.npubQrDataUrl = await QRCode.toDataURL(state.pubKey.toUpperCase(), {
            width: 200,
            margin: 2,
            color: { dark: '#701a75', light: '#fdf4ff' },
        });
    } catch {
        state.npubQrDataUrl = '';
    }
}

async function generateNsecQr() {
    try {
        if (!state.visible || !state.privKey) {
            state.nsecQrDataUrl = '';
            return;
        }
        const nsec = await api.runtime.sendMessage({
            kind: 'getNsec',
            payload: state.profileIndex,
        });
        if (!nsec) {
            state.nsecQrDataUrl = '';
            return;
        }
        state.nsecQrDataUrl = await QRCode.toDataURL(nsec.toUpperCase(), {
            width: 200,
            margin: 2,
            color: { dark: '#991b1b', light: '#fef2f2' },
        });
    } catch {
        state.nsecQrDataUrl = '';
    }
}

// Event handlers
async function handleProfileChange() {
    const val = elements.profileSelect.value;
    if (!val && val !== '0') return; // placeholder selected
    const newIndex = parseInt(val);
    if (isNaN(newIndex)) return;
    if (newIndex !== state.profileIndex) {
        state.profileIndex = newIndex;
        state.host = '';
        await refreshProfile();
    }
}

async function handleNewBunkerProfile() {
    const newIndex = await newBunkerProfile();
    state.profileIndex = newIndex;
    await refreshProfile();
}

function handleProfileNameInput(e) {
    state.profileName = e.target.value;
    render();
}

function handlePrivKeyInput(e) {
    state.privKey = e.target.value;
    state.seedPhraseDetected = looksLikeSeedPhrase(state.privKey);
    state.seedPhraseError = '';
    render();
}

function handleToggleVisibility() {
    state.visible = !state.visible;
    render();
}

async function handleCopyPubKey() {
    await navigator.clipboard.writeText(state.pubKey);
    state.copied = true;
    render();
    setTimeout(() => {
        state.copied = false;
        render();
    }, 1500);
}

async function handleSaveProfile() {
    if (state.profileType === 'local') {
        await savePrivateKey(state.profileIndex, state.privKey);
    }
    await saveProfileName(state.profileIndex, state.profileName);
    await refreshProfile();
}

async function handleShowNsecQr() {
    await generateNsecQr();
    state.showNsecQr = true;
    render();
}

function handleHideNsecQr() {
    state.showNsecQr = false;
    state.nsecQrDataUrl = '';
    render();
}

async function handleDecryptNcryptsec() {
    state.ncryptsecError = '';
    state.ncryptsecLoading = true;
    render();
    
    try {
        const result = await api.runtime.sendMessage({
            kind: 'ncryptsec.decrypt',
            payload: {
                ncryptsec: state.privKey,
                password: state.ncryptsecPassword,
            },
        });
        
        if (result.success) {
            await savePrivateKey(state.profileIndex, result.hexKey);
            state.ncryptsecPassword = '';
            await refreshProfile();
        } else {
            state.ncryptsecError = result.error || 'Decryption failed. Wrong password?';
        }
    } catch (e) {
        state.ncryptsecError = e.message || 'Decryption failed';
    }
    
    state.ncryptsecLoading = false;
    render();
}

async function handleExportNcryptsec() {
    state.ncryptsecExportError = '';
    state.ncryptsecExportResult = '';
    state.ncryptsecExportLoading = true;
    render();
    
    try {
        const result = await api.runtime.sendMessage({
            kind: 'ncryptsec.encrypt',
            payload: {
                profileIndex: state.profileIndex,
                password: state.ncryptsecExportPassword,
            },
        });
        
        if (result.success) {
            state.ncryptsecExportResult = result.ncryptsec;
            state.ncryptsecExportPassword = '';
            state.ncryptsecExportConfirm = '';
        } else {
            state.ncryptsecExportError = result.error || 'Encryption failed';
        }
    } catch (e) {
        state.ncryptsecExportError = e.message || 'Encryption failed';
    }
    
    state.ncryptsecExportLoading = false;
    render();
}

async function handleCopyNcryptsecExport() {
    await navigator.clipboard.writeText(state.ncryptsecExportResult);
    state.ncryptsecExportCopied = true;
    render();
    setTimeout(() => {
        state.ncryptsecExportCopied = false;
        render();
    }, 1500);
}

async function handleImportSeedPhrase() {
    state.seedPhraseError = '';
    state.seedPhraseLoading = true;
    render();

    try {
        const result = await api.runtime.sendMessage({
            kind: 'seedPhrase.toKey',
            payload: state.privKey,
        });

        if (result.success) {
            await savePrivateKey(state.profileIndex, result.hexKey);
            await refreshProfile();
        } else {
            state.seedPhraseError = result.error || 'Invalid seed phrase';
        }
    } catch (e) {
        state.seedPhraseError = e.message || 'Import failed';
    }

    state.seedPhraseLoading = false;
    render();
}

async function handleRevealSeedPhrase() {
    try {
        const result = await api.runtime.sendMessage({
            kind: 'seedPhrase.fromKey',
            payload: state.profileIndex,
        });

        if (result.success) {
            state.seedPhraseText = result.seedPhrase;
            state.seedPhraseRevealed = true;
        } else {
            state.seedPhraseText = '';
            state.seedPhraseRevealed = false;
            alert(result.error || 'Failed to reveal seed phrase');
        }
    } catch (e) {
        alert(e.message || 'Failed to reveal seed phrase');
    }
    render();
}

function handleHideSeedPhrase() {
    state.seedPhraseText = '';
    state.seedPhraseRevealed = false;
    state.seedPhraseCopied = false;
    render();
}

async function handleCopySeedPhrase() {
    await navigator.clipboard.writeText(state.seedPhraseText);
    state.seedPhraseCopied = true;
    render();
    setTimeout(() => {
        state.seedPhraseCopied = false;
        render();
    }, 1500);
}

async function handleConnectBunker() {
    state.bunkerError = '';
    state.bunkerConnecting = true;
    render();
    
    try {
        const validation = await api.runtime.sendMessage({
            kind: 'bunker.validateUrl',
            payload: state.bunkerUrl,
        });
        if (!validation.valid) {
            state.bunkerError = validation.error;
            state.bunkerConnecting = false;
            render();
            return;
        }
        
        const result = await api.runtime.sendMessage({
            kind: 'bunker.connect',
            payload: {
                profileIndex: state.profileIndex,
                bunkerUrl: state.bunkerUrl,
            },
        });
        
        if (result.success) {
            state.bunkerConnected = true;
            state.bunkerPubkey = result.remotePubkey;
            state.pubKey = await api.runtime.sendMessage({
                kind: 'npubEncode',
                payload: result.remotePubkey,
            });
        } else {
            state.bunkerError = result.error || 'Failed to connect';
        }
    } catch (e) {
        state.bunkerError = e.message || 'Connection failed';
    }
    
    state.bunkerConnecting = false;
    render();
}

async function handleDisconnectBunker() {
    state.bunkerError = '';
    const result = await api.runtime.sendMessage({
        kind: 'bunker.disconnect',
        payload: state.profileIndex,
    });
    if (result.success) {
        state.bunkerConnected = false;
    } else {
        state.bunkerError = result.error || 'Failed to disconnect';
    }
    render();
}

async function handlePingBunker() {
    state.bunkerError = '';
    const result = await api.runtime.sendMessage({
        kind: 'bunker.ping',
        payload: state.profileIndex,
    });
    if (!result.success) {
        state.bunkerError = result.error || 'Ping failed';
        state.bunkerConnected = false;
    }
    render();
}

async function handleRelayCheckboxChange(e) {
    const index = parseInt(e.target.dataset.relayIndex);
    const prop = e.target.dataset.relayProp;
    state.relays[index][prop] = e.target.checked;
    await saveRelays(state.profileIndex, state.relays);
    await loadRelays();
    render();
}

async function handleDeleteRelay(e) {
    const index = parseInt(e.target.dataset.relayIndex);
    state.relays.splice(index, 1);
    await saveRelays(state.profileIndex, state.relays);
    await loadRelays();
    render();
}

async function handleAddRelay() {
    const newRelay = state.recommendedRelay || state.newRelay;
    try {
        const url = new URL(newRelay);
        if (url.protocol !== 'wss:') {
            setUrlError('Must be a websocket url');
            return;
        }
        const urls = state.relays.map(v => v.url);
        if (urls.includes(url.href)) {
            setUrlError('URL already exists');
            return;
        }
        state.relays.push({ url: url.href, read: true, write: true });
        await saveRelays(state.profileIndex, state.relays);
        state.newRelay = '';
        state.recommendedRelay = '';
        await loadRelays();
        render();
    } catch (error) {
        setUrlError('Invalid websocket URL');
    }
}

function setUrlError(message) {
    state.urlError = message;
    render();
    setTimeout(() => {
        state.urlError = '';
        render();
    }, 3000);
}

async function handlePermissionChange(e) {
    const etype = e.target.dataset.permType;
    const value = e.target.value;
    await setPermission(state.host, etype, value, state.profileIndex);
    await loadPermissions();
    render();
}

async function handleSetPassword() {
    state.securityError = '';
    state.securitySuccess = '';
    
    if (state.newPassword.length < 8) {
        state.securityError = 'Password must be at least 8 characters.';
        render();
        return;
    }
    if (state.newPassword !== state.confirmPassword) {
        state.securityError = 'Passwords do not match.';
        render();
        return;
    }
    
    const result = await api.runtime.sendMessage({
        kind: 'setPassword',
        payload: state.newPassword,
    });
    if (result.success) {
        state.hasPassword = true;
        state.newPassword = '';
        state.confirmPassword = '';
        state.securitySuccess = 'Master password set. Your keys are now encrypted at rest.';
        render();
        setTimeout(() => {
            state.securitySuccess = '';
            render();
        }, 5000);
    } else {
        state.securityError = result.error || 'Failed to set password.';
        render();
    }
}

async function handleChangePassword() {
    state.securityError = '';
    state.securitySuccess = '';
    
    if (!state.currentPassword) {
        state.securityError = 'Please enter your current password.';
        render();
        return;
    }
    if (state.newPassword.length < 8) {
        state.securityError = 'New password must be at least 8 characters.';
        render();
        return;
    }
    if (state.newPassword !== state.confirmPassword) {
        state.securityError = 'New passwords do not match.';
        render();
        return;
    }
    
    const result = await api.runtime.sendMessage({
        kind: 'changePassword',
        payload: {
            oldPassword: state.currentPassword,
            newPassword: state.newPassword,
        },
    });
    if (result.success) {
        state.currentPassword = '';
        state.newPassword = '';
        state.confirmPassword = '';
        state.securitySuccess = 'Master password changed successfully.';
        render();
        setTimeout(() => {
            state.securitySuccess = '';
            render();
        }, 5000);
    } else {
        state.securityError = result.error || 'Failed to change password.';
        render();
    }
}

async function handleRemovePassword() {
    state.removeError = '';
    
    if (!state.removePasswordInput) {
        state.removeError = 'Please enter your current password.';
        render();
        return;
    }
    if (!confirm('This will remove encryption from your private keys. They will be stored as plaintext. Are you sure?')) {
        return;
    }
    
    const result = await api.runtime.sendMessage({
        kind: 'removePassword',
        payload: state.removePasswordInput,
    });
    if (result.success) {
        state.hasPassword = false;
        state.removePasswordInput = '';
        state.securitySuccess = 'Master password removed. Keys are now stored unencrypted.';
        render();
        setTimeout(() => {
            state.securitySuccess = '';
            render();
        }, 5000);
    } else {
        state.removeError = result.error || 'Failed to remove password.';
        render();
    }
}

async function handleSaveProtocolHandler() {
    if (state.protocolHandler) {
        await api.storage.local.set({ protocol_handler: state.protocolHandler });
    } else {
        await api.storage.local.remove('protocol_handler');
    }
}

async function handleClearData() {
    if (!confirm('This will remove your private keys and all associated data. Are you sure you wish to continue?')) {
        return;
    }
    await clearData();
    await loadProfile();
}

function handleClose() {
    window.close();
}

// Bind events
function bindEvents() {
    // Profile management
    if (elements.profileSelect) {
        elements.profileSelect.addEventListener('change', handleProfileChange);
    }
    if (elements.newBunkerBtn) {
        elements.newBunkerBtn.addEventListener('click', handleNewBunkerProfile);
    }
    
    // Local profile
    if (elements.profileNameInput) {
        elements.profileNameInput.addEventListener('input', handleProfileNameInput);
    }
    if (elements.privKeyInput) {
        elements.privKeyInput.addEventListener('input', handlePrivKeyInput);
    }
    if (elements.visibilityToggle) {
        elements.visibilityToggle.addEventListener('click', handleToggleVisibility);
    }
    if (elements.copyPubKeyBtn) {
        elements.copyPubKeyBtn.addEventListener('click', handleCopyPubKey);
    }
    if (elements.saveProfileBtn) {
        elements.saveProfileBtn.addEventListener('click', handleSaveProfile);
    }
    
    // ncryptsec
    if (elements.decryptBtn) {
        elements.decryptBtn.addEventListener('click', handleDecryptNcryptsec);
    }
    if (elements.showNsecQrBtn) {
        elements.showNsecQrBtn.addEventListener('click', handleShowNsecQr);
    }
    if (elements.hideNsecQrBtn) {
        elements.hideNsecQrBtn.addEventListener('click', handleHideNsecQr);
    }
    if (elements.exportNcryptsecBtn) {
        elements.exportNcryptsecBtn.addEventListener('click', handleExportNcryptsec);
    }
    if (elements.copyNcryptsecBtn) {
        elements.copyNcryptsecBtn.addEventListener('click', handleCopyNcryptsecExport);
    }
    
    // Seed phrase
    if (elements.importSeedPhraseBtn) {
        elements.importSeedPhraseBtn.addEventListener('click', handleImportSeedPhrase);
    }
    if (elements.revealSeedPhraseBtn) {
        elements.revealSeedPhraseBtn.addEventListener('click', handleRevealSeedPhrase);
    }
    if (elements.hideSeedPhraseBtn) {
        elements.hideSeedPhraseBtn.addEventListener('click', handleHideSeedPhrase);
    }
    if (elements.copySeedPhraseBtn) {
        elements.copySeedPhraseBtn.addEventListener('click', handleCopySeedPhrase);
    }

    // Input changes for ncryptsec export
    if (elements.ncryptsecExportPassword) {
        elements.ncryptsecExportPassword.addEventListener('input', (e) => {
            state.ncryptsecExportPassword = e.target.value;
            render();
        });
    }
    if (elements.ncryptsecExportConfirm) {
        elements.ncryptsecExportConfirm.addEventListener('input', (e) => {
            state.ncryptsecExportConfirm = e.target.value;
            render();
        });
    }
    
    // Bunker profile name
    if (elements.bunkerProfileNameInput) {
        elements.bunkerProfileNameInput.addEventListener('input', handleProfileNameInput);
    }
    if (elements.saveBunkerNameBtn) {
        elements.saveBunkerNameBtn.addEventListener('click', handleSaveProfile);
    }

    // Bunker
    if (elements.bunkerUrlInput) {
        elements.bunkerUrlInput.addEventListener('input', (e) => {
            state.bunkerUrl = e.target.value;
            render();
        });
    }
    if (elements.connectBunkerBtn) {
        elements.connectBunkerBtn.addEventListener('click', handleConnectBunker);
    }
    if (elements.disconnectBunkerBtn) {
        elements.disconnectBunkerBtn.addEventListener('click', handleDisconnectBunker);
    }
    if (elements.pingBunkerBtn) {
        elements.pingBunkerBtn.addEventListener('click', handlePingBunker);
    }
    
    // Bunker pub key copy
    if (elements.copyBunkerPubKeyBtn) {
        elements.copyBunkerPubKeyBtn.addEventListener('click', handleCopyPubKey);
    }

    // ncryptsec import password
    if (elements.ncryptsecPasswordInput) {
        elements.ncryptsecPasswordInput.addEventListener('input', (e) => {
            state.ncryptsecPassword = e.target.value;
            render();
        });
    }

    // Relays
    if (elements.newRelayInput) {
        elements.newRelayInput.addEventListener('input', (e) => {
            state.newRelay = e.target.value;
        });
        elements.newRelayInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleAddRelay();
            }
        });
    }
    if (elements.recommendedRelaySelect) {
        elements.recommendedRelaySelect.addEventListener('change', (e) => {
            state.recommendedRelay = e.target.value;
            handleAddRelay();
        });
    }
    if (elements.addRelayBtn) {
        elements.addRelayBtn.addEventListener('click', handleAddRelay);
    }
    
    // Permissions
    if (elements.appSelect) {
        elements.appSelect.addEventListener('change', (e) => {
            state.host = e.target.value;
            calcHostPerms();
            render();
        });
    }
    
    // Security
    if (elements.newPasswordInput) {
        elements.newPasswordInput.addEventListener('input', (e) => {
            state.newPassword = e.target.value;
            render();
        });
    }
    if (elements.confirmPasswordInput) {
        elements.confirmPasswordInput.addEventListener('input', (e) => {
            state.confirmPassword = e.target.value;
            render();
        });
    }
    if (elements.setPasswordBtn) {
        elements.setPasswordBtn.addEventListener('click', handleSetPassword);
    }
    if (elements.currentPasswordInput) {
        elements.currentPasswordInput.addEventListener('input', (e) => {
            state.currentPassword = e.target.value;
            render();
        });
    }
    if (elements.newPasswordChangeInput) {
        elements.newPasswordChangeInput.addEventListener('input', (e) => {
            state.newPassword = e.target.value;
            render();
        });
    }
    if (elements.confirmPasswordChangeInput) {
        elements.confirmPasswordChangeInput.addEventListener('input', (e) => {
            state.confirmPassword = e.target.value;
            render();
        });
    }
    if (elements.changePasswordBtn) {
        elements.changePasswordBtn.addEventListener('click', handleChangePassword);
    }
    if (elements.removePasswordInput) {
        elements.removePasswordInput.addEventListener('input', (e) => {
            state.removePasswordInput = e.target.value;
            render();
        });
    }
    if (elements.removePasswordBtn) {
        elements.removePasswordBtn.addEventListener('click', handleRemovePassword);
    }
    
    // Protocol handler
    if (elements.protocolHandlerInput) {
        elements.protocolHandlerInput.addEventListener('input', (e) => {
            state.protocolHandler = e.target.value;
        });
        elements.protocolHandlerInput.addEventListener('change', handleSaveProtocolHandler);
    }
    if (elements.useNjumpBtn) {
        elements.useNjumpBtn.addEventListener('click', () => {
            state.protocolHandler = 'https://njump.me/{raw}';
            handleSaveProtocolHandler();
            render();
        });
    }
    if (elements.disableHandlerBtn) {
        elements.disableHandlerBtn.addEventListener('click', () => {
            state.protocolHandler = '';
            handleSaveProtocolHandler();
            render();
        });
    }
    
    // General
    if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', handleClose);
    }
    const closeOptionsBtn = document.querySelector('[data-action="closeOptions"]');
    if (closeOptionsBtn) {
        closeOptionsBtn.addEventListener('click', handleClose);
    }
    if (elements.clearDataBtn) {
        elements.clearDataBtn.addEventListener('click', handleClearData);
    }

    // Prevent default form submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => e.preventDefault());
    });

    // Prevent default on anchor click actions
    document.querySelectorAll('a[data-action]').forEach(a => {
        a.addEventListener('click', (e) => e.preventDefault());
    });
}

// Initialize
async function init() {
    console.log('NostrKey Full Settings initializing...');
    
    await initialize();
    
    // Check encryption state
    state.hasPassword = await api.runtime.sendMessage({ kind: 'isEncrypted' });
    
    // Load protocol handler
    const { protocol_handler } = await api.storage.local.get(['protocol_handler']);
    state.protocolHandler = protocol_handler || '';
    
    initElements();
    bindEvents();
    
    await loadProfile();
}

document.addEventListener('DOMContentLoaded', init);
