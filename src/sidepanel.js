/**
 * NostrKey Side Panel - Vanilla JS (CSP-safe)
 * Tabbed navigation with master-detail pattern
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
    getPermissions,
    newProfile,
    saveProfileName,
    deleteProfile,
    getProfile,
    getProfiles,
} from './utilities/utils';
import { api } from './utilities/browser-polyfill';
import { isSyncEnabled, setSyncEnabled } from './utilities/sync-manager';
import QRCode from 'qrcode';

// State
let state = {
    profileNames: ['Default Nostr Profile'],
    profileIndex: 0,
    relayCount: 0,
    relays: [],
    showRelayReminder: true,
    isLocked: false,
    hasPassword: false,
    nostrAccessWhileLocked: false,
    lockedProfileName: '',
    lockedProfileNpub: '',
    lockedProfileHasKeys: false,
    npubQrDataUrl: '',
    currentNpub: '',
    profileType: 'local',
    bunkerConnected: false,
    currentView: 'home',
    permissions: [],
    // Profile view state
    viewingProfileIndex: null,
    viewNsecVisible: false,
    viewNsecValue: '',
    // Profile edit state
    editingProfileIndex: null, // null = new profile, number = editing existing
    editProfileName: '',
    editProfileKey: '',
    keyVisible: false,
};

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
    // Profile list UI
    elements.profileList = $('profile-list');
    elements.profileDetails = $('profile-details');
    elements.profileName = $('profile-name');
    elements.npubDisplay = $('npub-display');
    elements.addProfileBtn = $('add-profile-btn');
    elements.copyNpubBtn = $('copy-npub-btn');
    elements.qrContainer = $('qr-container');
    elements.qrImage = $('qr-image');
    elements.copyQrPngBtn = $('copy-qr-png-btn');
    elements.bunkerStatus = $('bunker-status');
    elements.bunkerIndicator = $('bunker-indicator');
    elements.bunkerText = $('bunker-text');
    elements.relayReminder = $('relay-reminder');
    elements.relayCountText = $('relay-count-text');
    elements.addRelaysBtn = $('add-relays-btn');
    elements.noThanksBtn = $('no-thanks-btn');
    // Tab navigation
    elements.tabBtns = document.querySelectorAll('.tab-btn');
    elements.viewSections = document.querySelectorAll('.view-section');
    // Relays view
    elements.relayList = $('relay-list');
    elements.newRelayInput = $('new-relay-input');
    elements.addRelayBtn = $('add-relay-btn');
    // Permissions view
    elements.permissionsList = $('permissions-list');
    // Settings view buttons
    elements.openSettingsBtn = $('open-settings-btn');
    elements.openHistoryBtn = $('open-history-btn');
    elements.openExperimentalBtn = $('open-experimental-btn');
    elements.openVaultBtn = $('open-vault-btn');
    elements.openApikeysBtn = $('open-apikeys-btn');
    elements.vaultNoPassword = $('vault-no-password');
    elements.vaultLockedGate = $('vault-locked-gate');
    elements.vaultUnlockedContent = $('vault-unlocked-content');
    elements.vaultGotoSecurityBtn = $('vault-goto-security-btn');
    elements.vaultUnlockForm = $('vault-unlock-form');
    elements.vaultUnlockPassword = $('vault-unlock-password');
    elements.vaultUnlockError = $('vault-unlock-error');
    elements.settingsSecurityBtn = $('settings-security-btn');
    elements.settingsAutolockBtn = $('settings-autolock-btn');
    elements.unencryptedWarning = $('unencrypted-warning');
    elements.setupEncryptionBtn = $('setup-encryption-btn');
    elements.checkVaultBtn = $('check-vault-btn');
    elements.vaultCheckResult = $('vault-check-result');
    // Profile view (read-only)
    elements.profileViewTitle = $('profile-view-title');
    elements.viewProfileName = $('view-profile-name');
    elements.viewNpub = $('view-npub');
    elements.viewNsec = $('view-nsec');
    elements.backFromViewBtn = $('back-from-view-btn');
    elements.editProfileBtn = $('edit-profile-btn');
    elements.copyViewNpubBtn = $('copy-view-npub-btn');
    elements.copyViewNsecBtn = $('copy-view-nsec-btn');
    elements.toggleViewNsecBtn = $('toggle-view-nsec-btn');
    // Profile edit view
    elements.profileEditTitle = $('profile-edit-title');
    elements.editProfileName = $('edit-profile-name');
    elements.editProfileKey = $('edit-profile-key');
    elements.toggleKeyVisibility = $('toggle-key-visibility');
    elements.generateKeyBtn = $('generate-key-btn');
    elements.saveProfileBtn = $('save-profile-btn');
    elements.deleteProfileBtn = $('delete-profile-btn');
    elements.backToProfilesBtn = $('back-to-profiles-btn');
    elements.profileEditError = $('profile-edit-error');
    elements.profileEditSuccess = $('profile-edit-success');
    elements.keySection = $('key-section');
    // Sync toggle
    elements.syncToggle = $('sync-toggle');
    elements.syncStatusText = $('sync-status-text');
    // Frame protection toggle
    elements.frameProtectionToggle = $('frame-protection-toggle');
    elements.frameProtectionStatus = $('frame-protection-status');
    // Reset flow elements
    elements.forgotPasswordBtn = $('forgot-password-btn');
    elements.resetConfirm = $('reset-confirm');
    elements.confirmResetBtn = $('confirm-reset-btn');
    elements.cancelResetBtn = $('cancel-reset-btn');
    // Locked access card
    elements.lockedAccessCard = $('locked-access-card');
    elements.lockedProfileName = $('locked-profile-name');
    elements.lockedProfileNpub = $('locked-profile-npub');
    elements.nostrAccessToggle = $('nostr-access-toggle');
    elements.nostrAccessStatus = $('nostr-access-status');
    elements.copyLockedNpubBtn = $('copy-locked-npub-btn');
}

// Render functions
function render() {
    if (state.isLocked) {
        elements.lockedView.classList.remove('hidden');
        elements.unlockedView.classList.add('hidden');
        renderLockedAccessCard();
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

    // Auto-lock button — disabled without a master password
    if (elements.settingsAutolockBtn) {
        elements.settingsAutolockBtn.disabled = !state.hasPassword;
        elements.settingsAutolockBtn.style.opacity = state.hasPassword ? '1' : '0.4';
    }

    // Unencrypted warning banner
    if (elements.unencryptedWarning) {
        if (!state.hasPassword) {
            elements.unencryptedWarning.classList.remove('hidden');
        } else {
            elements.unencryptedWarning.classList.add('hidden');
        }
    }

    // Vault states: no password, locked, or unlocked
    if (elements.vaultNoPassword && elements.vaultLockedGate && elements.vaultUnlockedContent) {
        if (!state.hasPassword) {
            // No password set
            elements.vaultNoPassword.style.display = 'block';
            elements.vaultLockedGate.style.display = 'none';
            elements.vaultUnlockedContent.style.display = 'none';
        } else if (state.isLocked) {
            // Password set but locked
            elements.vaultNoPassword.style.display = 'none';
            elements.vaultLockedGate.style.display = 'block';
            elements.vaultUnlockedContent.style.display = 'none';
        } else {
            // Unlocked
            elements.vaultNoPassword.style.display = 'none';
            elements.vaultLockedGate.style.display = 'none';
            elements.vaultUnlockedContent.style.display = 'block';
        }
    }

    // Profile list
    renderProfileList();

    // Profile details
    renderProfileDetails();
}

function renderProfileList() {
    if (!elements.profileList) return;
    
    elements.profileList.innerHTML = state.profileNames.map((name, i) => `
        <div class="profile-item flex items-center gap-3 p-3 rounded-lg transition-colors ${i === state.profileIndex ? 'bg-monokai-bg-lighter border border-monokai-accent' : 'bg-monokai-bg-light border border-transparent hover:border-monokai-bg-lighter'}" data-index="${i}">
            <div class="profile-select-area flex items-center gap-3 flex-1 min-w-0 cursor-pointer" data-index="${i}">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background:#272822;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${i === state.profileIndex ? '#a6e22e' : '#8f908a'}" stroke-width="1.5">
                        <circle cx="12" cy="8" r="4"></circle>
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium truncate" style="color:${i === state.profileIndex ? '#a6e22e' : '#f8f8f2'};">${name}</div>
                    <div class="text-xs truncate" style="color:#8f908a;">${i === state.profileIndex ? 'Active' : 'Click to select'}</div>
                </div>
            </div>
            <button class="profile-edit-btn flex-shrink-0" data-index="${i}" title="Edit profile" style="padding:8px;background:transparent;border:none;cursor:pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8f908a" stroke-width="1.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            ${i === state.profileIndex ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6e22e" stroke-width="2" class="flex-shrink-0"><path d="M20 6L9 17l-5-5"></path></svg>' : ''}
        </div>
    `).join('');

    // Bind click events for selecting profile
    elements.profileList.querySelectorAll('.profile-select-area').forEach(area => {
        area.addEventListener('click', async () => {
            const idx = parseInt(area.dataset.index, 10);
            if (idx !== state.profileIndex) {
                await selectProfile(idx);
            }
        });
    });

    // Bind click events for viewing profile (opens read-only view)
    elements.profileList.querySelectorAll('.profile-edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index, 10);
            await openProfileView(idx);
        });
    });
}

function renderProfileDetails() {
    if (!elements.profileDetails) return;

    // Show profile details
    elements.profileDetails.classList.remove('hidden');
    elements.profileName.textContent = state.profileNames[state.profileIndex] || 'Default';

    // npub display
    if (state.currentNpub && elements.npubDisplay) {
        elements.npubDisplay.textContent = state.currentNpub;
    }

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
        elements.bunkerIndicator.className = `inline-block w-2 h-2 rounded-full ${state.bunkerConnected ? 'bg-green-500' : 'bg-red-500'}`;
        elements.bunkerText.textContent = state.bunkerConnected ? 'Bunker connected' : 'Bunker disconnected';
    } else {
        elements.bunkerStatus.classList.add('hidden');
    }

    // Relay count
    if (elements.relayCountText) {
        elements.relayCountText.textContent = `${state.relayCount} relay${state.relayCount !== 1 ? 's' : ''} configured`;
    }

    // Relay reminder
    if (state.relayCount < 1 && state.showRelayReminder) {
        elements.relayReminder.classList.remove('hidden');
    } else {
        elements.relayReminder.classList.add('hidden');
    }
}

function renderLockedAccessCard() {
    if (!elements.lockedAccessCard) return;

    // Only show when master password is active
    if (!state.hasPassword) {
        elements.lockedAccessCard.classList.add('hidden');
        return;
    }

    elements.lockedAccessCard.classList.remove('hidden');

    // Profile name
    if (elements.lockedProfileName) {
        elements.lockedProfileName.textContent = state.lockedProfileName || '—';
    }

    // Truncated npub
    if (elements.lockedProfileNpub) {
        const npub = state.lockedProfileNpub;
        if (npub && npub.length > 20) {
            elements.lockedProfileNpub.textContent = npub.slice(0, 12) + '...' + npub.slice(-8);
        } else {
            elements.lockedProfileNpub.textContent = npub || '';
        }
    }

    // Toggle checked state
    if (elements.nostrAccessToggle) {
        elements.nostrAccessToggle.checked = state.nostrAccessWhileLocked;
    }

    // Status text with color coding
    if (elements.nostrAccessStatus) {
        if (state.nostrAccessWhileLocked && state.lockedProfileHasKeys) {
            elements.nostrAccessStatus.textContent = 'Sites can request signing while locked.';
            elements.nostrAccessStatus.style.color = '#a6e22e';
        } else if (state.nostrAccessWhileLocked && !state.lockedProfileHasKeys) {
            elements.nostrAccessStatus.textContent = 'Unlock once this session to enable signing.';
            elements.nostrAccessStatus.style.color = '#fd971f';
        } else {
            elements.nostrAccessStatus.textContent = 'Sites cannot access keys while locked.';
            elements.nostrAccessStatus.style.color = '#b0b0a8';
        }
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
    await generateQr();
    render();
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
            state.currentNpub = '';
            return;
        }
        state.currentNpub = npub;
        state.npubQrDataUrl = await QRCode.toDataURL(npub.toUpperCase(), {
            width: 200,
            margin: 2,
            color: { dark: '#a6e22e', light: '#272822' },
        });
    } catch {
        state.npubQrDataUrl = '';
        state.currentNpub = '';
    }
}

async function selectProfile(index) {
    state.profileIndex = index;
    await setProfileIndex(state.profileIndex);
    await loadProfileType();
    await countRelays();
    await checkRelayReminder();
    await generateQr();
    render();
}

function openAddProfile() {
    // Open profile edit view for new profile
    state.editingProfileIndex = null;
    state.editProfileName = '';
    state.editProfileKey = '';
    state.keyVisible = false;
    showProfileEditView();
}

function showProfileEditView() {
    // Update title
    if (elements.profileEditTitle) {
        elements.profileEditTitle.textContent = state.editingProfileIndex === null ? 'New Profile' : 'Edit Profile';
    }
    // Populate fields
    if (elements.editProfileName) {
        elements.editProfileName.value = state.editProfileName;
    }
    if (elements.editProfileKey) {
        elements.editProfileKey.value = state.editProfileKey;
        elements.editProfileKey.type = state.keyVisible ? 'text' : 'password';
    }
    // Show/hide delete button (only for existing profiles, and not if it's the only profile)
    if (elements.deleteProfileBtn) {
        if (state.editingProfileIndex !== null && state.profileNames.length > 1) {
            elements.deleteProfileBtn.classList.remove('hidden');
        } else {
            elements.deleteProfileBtn.classList.add('hidden');
        }
    }
    // Hide key section when editing (can't change key after creation for security)
    if (elements.keySection) {
        if (state.editingProfileIndex !== null) {
            elements.keySection.classList.add('hidden');
        } else {
            elements.keySection.classList.remove('hidden');
        }
    }
    // Clear messages
    if (elements.profileEditError) elements.profileEditError.classList.add('hidden');
    if (elements.profileEditSuccess) elements.profileEditSuccess.classList.add('hidden');
    
    // Switch to profile edit view
    switchViewDirect('profile-edit');
}

function switchViewDirect(viewName) {
    // Hide all views
    elements.viewSections.forEach(section => {
        section.classList.remove('active');
    });
    // Show target view
    const targetView = document.getElementById('view-' + viewName);
    if (targetView) {
        targetView.classList.add('active');
    }
    state.currentView = viewName;
}

async function openProfileView(index) {
    const profile = await getProfile(index);
    if (!profile) return;
    
    state.viewingProfileIndex = index;
    state.viewNsecVisible = false;
    
    // Get npub and nsec
    const npub = await getNpub(index);
    const nsec = await api.runtime.sendMessage({ kind: 'getNsec', payload: index });
    state.viewNsecValue = nsec || '';
    
    // Populate view
    if (elements.viewProfileName) {
        elements.viewProfileName.textContent = profile.name || 'Unnamed';
    }
    if (elements.viewNpub) {
        elements.viewNpub.textContent = npub || 'Not available';
    }
    if (elements.viewNsec) {
        elements.viewNsec.textContent = '••••••••••••••••••••••••••••••••';
    }
    if (elements.copyViewNsecBtn) {
        elements.copyViewNsecBtn.classList.add('hidden');
    }
    
    switchViewDirect('profile-view');
}

function toggleViewNsec() {
    state.viewNsecVisible = !state.viewNsecVisible;
    if (elements.viewNsec) {
        elements.viewNsec.textContent = state.viewNsecVisible 
            ? state.viewNsecValue 
            : '••••••••••••••••••••••••••••••••';
    }
    if (elements.copyViewNsecBtn) {
        if (state.viewNsecVisible) {
            elements.copyViewNsecBtn.classList.remove('hidden');
        } else {
            elements.copyViewNsecBtn.classList.add('hidden');
        }
    }
}

async function copyViewNpub() {
    if (elements.viewNpub) {
        await navigator.clipboard.writeText(elements.viewNpub.textContent);
    }
}

async function copyViewNsec() {
    if (state.viewNsecValue) {
        await navigator.clipboard.writeText(state.viewNsecValue);
    }
}

function goToEditFromView() {
    if (state.viewingProfileIndex !== null) {
        openEditProfile(state.viewingProfileIndex);
    }
}

async function openEditProfile(index) {
    const profile = await getProfile(index);
    if (!profile) return;
    
    state.editingProfileIndex = index;
    state.editProfileName = profile.name || '';
    state.editProfileKey = ''; // Don't show existing key for security
    state.keyVisible = false;
    showProfileEditView();
}

async function generateNewKey() {
    try {
        console.log('Generating new key...');
        const newKey = await api.runtime.sendMessage({ kind: 'generatePrivateKey' });
        console.log('Generated key:', newKey ? 'success' : 'failed');
        if (newKey && elements.editProfileKey) {
            state.editProfileKey = newKey;
            elements.editProfileKey.value = newKey;
            // Show the key so user can see it was generated
            state.keyVisible = true;
            elements.editProfileKey.type = 'text';
            showProfileSuccess('Key generated!');
        } else {
            showProfileError('Failed to generate key - no response');
        }
    } catch (e) {
        console.error('Generate key error:', e);
        showProfileError('Failed to generate key: ' + e.message);
    }
}

function toggleKeyVisibility() {
    state.keyVisible = !state.keyVisible;
    if (elements.editProfileKey) {
        elements.editProfileKey.type = state.keyVisible ? 'text' : 'password';
    }
}

async function saveProfileChanges() {
    const name = elements.editProfileName?.value?.trim();
    if (!name) {
        showProfileError('Please enter a profile name');
        return;
    }

    try {
        if (state.editingProfileIndex === null) {
            // Creating new profile
            const key = elements.editProfileKey?.value?.trim();
            if (!key) {
                showProfileError('Please enter or generate a private key');
                return;
            }
            // Create new profile
            const newIndex = await newProfile();
            await saveProfileName(newIndex, name);
            // Save the private key
            await api.runtime.sendMessage({
                kind: 'savePrivateKey',
                payload: [newIndex, key]
            });
            state.profileIndex = newIndex;
            await setProfileIndex(newIndex);
            showProfileSuccess('Profile created!');
        } else {
            // Editing existing profile - just save name
            await saveProfileName(state.editingProfileIndex, name);
            showProfileSuccess('Profile updated!');
        }
        
        // Reload and go back to home
        setTimeout(async () => {
            await loadUnlockedState();
            switchViewDirect('home');
        }, 800);
    } catch (e) {
        showProfileError('Failed to save profile: ' + e.message);
    }
}

async function deleteCurrentProfile() {
    if (state.editingProfileIndex === null) return;
    if (state.profileNames.length <= 1) {
        showProfileError('Cannot delete the only profile');
        return;
    }
    
    if (!confirm('Delete this profile? This cannot be undone.')) return;
    
    try {
        await deleteProfile(state.editingProfileIndex);
        showProfileSuccess('Profile deleted');
        setTimeout(async () => {
            await loadUnlockedState();
            switchViewDirect('home');
        }, 800);
    } catch (e) {
        showProfileError('Failed to delete profile: ' + e.message);
    }
}

function showProfileError(msg) {
    if (elements.profileEditError) {
        elements.profileEditError.textContent = msg;
        elements.profileEditError.classList.remove('hidden');
    }
    if (elements.profileEditSuccess) {
        elements.profileEditSuccess.classList.add('hidden');
    }
    // Add red border to profile name input on error
    if (elements.editProfileName && msg.toLowerCase().includes('profile name')) {
        elements.editProfileName.style.borderColor = '#f43f5e';
        elements.editProfileName.style.borderWidth = '2px';
    }
}

function showProfileSuccess(msg) {
    if (elements.profileEditSuccess) {
        elements.profileEditSuccess.textContent = msg;
        elements.profileEditSuccess.classList.remove('hidden');
    }
    if (elements.profileEditError) {
        elements.profileEditError.classList.add('hidden');
    }
    // Clear error styling
    clearProfileErrorStyling();
}

function clearProfileErrorStyling() {
    if (elements.editProfileName) {
        elements.editProfileName.style.borderColor = '';
        elements.editProfileName.style.borderWidth = '';
    }
}

function backToProfiles() {
    switchViewDirect('home');
}

async function doUnlock() {
    const password = elements.unlockPassword.value;
    if (!password) {
        elements.unlockError.textContent = 'Please enter your master password.';
        elements.unlockError.classList.remove('hidden');
        return;
    }

    const result = await api.runtime.sendMessage({ kind: 'unlock', payload: password });
    console.log('[sidepanel:doUnlock] result:', JSON.stringify(result));
    if (!result) {
        elements.unlockError.textContent = 'Service worker not ready — try again.';
        elements.unlockError.classList.remove('hidden');
        return;
    }
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
    // Refresh locked access card with current profile
    try {
        const info = await api.runtime.sendMessage({ kind: 'getActiveProfileInfo' });
        if (info && typeof info === 'object') {
            state.lockedProfileName = info.name || 'Unnamed Profile';
            state.lockedProfileNpub = info.npub || '';
            state.lockedProfileHasKeys = !!info.hasKeys;
        }
    } catch (_) {}
    render();
}

async function doVaultUnlock() {
    const password = elements.vaultUnlockPassword.value;
    if (!password) {
        elements.vaultUnlockError.textContent = 'Please enter your master password.';
        elements.vaultUnlockError.classList.remove('hidden');
        return;
    }

    const result = await api.runtime.sendMessage({ kind: 'unlock', payload: password });
    console.log('[sidepanel:doVaultUnlock] result:', JSON.stringify(result));
    if (!result) {
        elements.vaultUnlockError.textContent = 'Service worker not ready — try again.';
        elements.vaultUnlockError.classList.remove('hidden');
        return;
    }
    if (result.success) {
        state.isLocked = false;
        elements.vaultUnlockPassword.value = '';
        elements.vaultUnlockError.classList.add('hidden');
        renderUnlockedState();
    } else {
        elements.vaultUnlockError.textContent = result.error || 'Invalid password.';
        elements.vaultUnlockError.classList.remove('hidden');
    }
}

async function handleResetAllData() {
    const result = await api.runtime.sendMessage({ kind: 'resetAllData' });
    console.log('[sidepanel:resetAllData] result:', JSON.stringify(result));
    if (result?.success) {
        // Reset local state and reload
        state.isLocked = false;
        state.hasPassword = false;
        state.profileIndex = 0;
        state.profileNames = ['Default Nostr Profile'];
        elements.resetConfirm.classList.add('hidden');
        elements.forgotPasswordBtn.style.display = 'inline';
        await loadUnlockedState();
    } else {
        console.error('Failed to reset data:', result?.error);
    }
}

async function handleProfileChange() {
    const newIndex = parseInt(elements.profileSelect.value, 10);
    if (newIndex !== state.profileIndex) {
        state.profileIndex = newIndex;
        await setProfileIndex(state.profileIndex);
        await loadProfileType();
        await countRelays();
        await checkRelayReminder();
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
}

async function copyQrAsPng() {
    if (!elements.qrImage?.src || !state.npubQrDataUrl) return;
    
    try {
        // Create a canvas with profile name + QR code
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const padding = 24;
        const qrSize = 200;
        const titleHeight = 40;
        
        canvas.width = qrSize + (padding * 2);
        canvas.height = qrSize + titleHeight + (padding * 2);
        
        // Background
        ctx.fillStyle = '#3e3d32';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
        ctx.fill();
        
        // Profile name
        const profileName = state.profileNames[state.profileIndex] || 'Nostr Profile';
        ctx.fillStyle = '#f8f8f2';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(profileName, canvas.width / 2, padding + 20);
        
        // QR code - use existing img element directly (avoids CSP fetch issues)
        const qrImg = elements.qrImage;
        ctx.drawImage(qrImg, padding, padding + titleHeight, qrSize, qrSize);
        
        // Convert to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        // Copy to clipboard
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        
        // Visual feedback
        const btn = elements.copyQrPngBtn;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = originalText; }, 1500);
    } catch (e) {
        console.error('Failed to copy QR as PNG:', e);
    }
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

function openOptions() {
    openUrl('full_settings.html');
}

function openUrl(path) {
    const url = api.runtime.getURL(path);
    // Use named window target so all options pages open in the same tab
    window.open(url, 'nostrkey-options');
}

async function refreshPasswordState() {
    state.hasPassword = !!(await api.runtime.sendMessage({ kind: 'isEncrypted' }));
    state.isLocked = !!(await api.runtime.sendMessage({ kind: 'isLocked' }));
    renderUnlockedState();
}

function updateSyncStatusText(enabled) {
    if (elements.syncStatusText) {
        elements.syncStatusText.textContent = enabled
            ? 'Data syncs via your browser account'
            : 'Sync disabled';
    }
}

async function loadSyncState() {
    try {
        const enabled = await isSyncEnabled();
        if (elements.syncToggle) {
            elements.syncToggle.checked = enabled;
        }
        updateSyncStatusText(enabled);
    } catch {
        // sync-manager not available (e.g. no storage.sync)
        if (elements.syncToggle) {
            elements.syncToggle.disabled = true;
        }
        updateSyncStatusText(false);
    }
}

function updateFrameProtectionText(enabled) {
    if (elements.frameProtectionStatus) {
        elements.frameProtectionStatus.textContent = enabled
            ? 'Third-party iframes cannot access window.nostr'
            : 'All frames can access window.nostr';
    }
}

async function loadFrameProtectionState() {
    try {
        const enabled = await api.runtime.sendMessage({ kind: 'getBlockCrossOriginFrames' });
        if (elements.frameProtectionToggle) {
            elements.frameProtectionToggle.checked = !!enabled;
        }
        updateFrameProtectionText(!!enabled);
    } catch {
        if (elements.frameProtectionToggle) {
            elements.frameProtectionToggle.checked = true;
        }
        updateFrameProtectionText(true);
    }
}

// Tab navigation
function switchView(viewName) {
    state.currentView = viewName;
    // Update tab buttons
    elements.tabBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Update view sections
    elements.viewSections.forEach(section => {
        if (section.id === `view-${viewName}`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    // Load view-specific data
    if (viewName === 'relays') loadRelaysView();
    if (viewName === 'permissions') loadPermissionsView();
    if (viewName === 'vault') refreshPasswordState();
    if (viewName === 'settings') {
        refreshPasswordState();
        loadSyncState();
        loadFrameProtectionState();
    }
}

async function loadRelaysView() {
    state.relays = await getRelays(state.profileIndex);
    renderRelayList();
}

function renderRelayList() {
    if (!elements.relayList) return;
    if (state.relays.length === 0) {
        elements.relayList.innerHTML = '<p style="color:#8f908a;font-style:italic;">No relays configured.</p>';
        return;
    }
    elements.relayList.innerHTML = state.relays.map((relay, i) => `
        <div class="flex items-center gap-2 py-2" style="border-bottom:1px solid #49483e;">
            <span class="flex-1 text-sm" style="color:#f8f8f2;word-break:break-all;">${relay.url}</span>
            <button class="button relay-delete-btn" data-index="${i}" style="min-width:auto;padding:6px 10px;font-size:12px;">Delete</button>
        </div>
    `).join('');
    // Bind delete buttons
    elements.relayList.querySelectorAll('.relay-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.index, 10);
            state.relays.splice(idx, 1);
            await saveRelays(state.profileIndex, state.relays);
            renderRelayList();
            await countRelays();
        });
    });
}

async function addSingleRelay() {
    const url = elements.newRelayInput?.value?.trim();
    if (!url || !url.startsWith('wss://')) return;
    state.relays.push({ url, read: true, write: true });
    await saveRelays(state.profileIndex, state.relays);
    elements.newRelayInput.value = '';
    renderRelayList();
    await countRelays();
}

async function loadPermissionsView() {
    try {
        const perms = await api.runtime.sendMessage({ kind: 'getPermissions' });
        state.permissions = perms || [];
        renderPermissionsList();
    } catch {
        state.permissions = [];
        renderPermissionsList();
    }
}

function renderPermissionsList() {
    if (!elements.permissionsList) return;
    if (state.permissions.length === 0) {
        elements.permissionsList.innerHTML = '<p style="color:#8f908a;font-style:italic;">No permissions granted yet.</p>';
        return;
    }
    elements.permissionsList.innerHTML = state.permissions.map(p => `
        <div class="flex items-center justify-between py-2" style="border-bottom:1px solid #49483e;">
            <span class="text-sm" style="color:#f8f8f2;">${p.host || p.origin || 'Unknown'}</span>
            <span class="text-xs" style="color:#8f908a;">${p.level || 'granted'}</span>
        </div>
    `).join('');
}

// Event bindings
function bindEvents() {
    elements.unlockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await doUnlock();
    });

    // Lock screen footer links — reuse same tab
    ['footer-home-link', 'footer-terms-link', 'footer-donate-link'].forEach(id => {
        const el = $(id);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(el.href, 'nostrkey-options');
            });
        }
    });

    // Reset flow handlers
    if (elements.forgotPasswordBtn) {
        elements.forgotPasswordBtn.addEventListener('click', () => {
            elements.resetConfirm.classList.remove('hidden');
            elements.forgotPasswordBtn.style.display = 'none';
        });
    }
    if (elements.cancelResetBtn) {
        elements.cancelResetBtn.addEventListener('click', () => {
            elements.resetConfirm.classList.add('hidden');
            elements.forgotPasswordBtn.style.display = 'inline';
        });
    }
    if (elements.confirmResetBtn) {
        elements.confirmResetBtn.addEventListener('click', handleResetAllData);
    }

    // Copy npub from lock screen
    if (elements.copyLockedNpubBtn) {
        elements.copyLockedNpubBtn.addEventListener('click', async () => {
            if (!state.lockedProfileNpub) return;
            try {
                await navigator.clipboard.writeText(state.lockedProfileNpub);
                elements.copyLockedNpubBtn.style.opacity = '0.5';
                setTimeout(() => { elements.copyLockedNpubBtn.style.opacity = '1'; }, 800);
            } catch (_) {}
        });
    }

    // Nostr access while locked toggle
    if (elements.nostrAccessToggle) {
        elements.nostrAccessToggle.addEventListener('change', async () => {
            const enabled = elements.nostrAccessToggle.checked;
            await api.runtime.sendMessage({ kind: 'setNostrAccessWhileLocked', payload: enabled });
            state.nostrAccessWhileLocked = enabled;
            // Re-query profile info (hasKeys may change if turning OFF cleared keys)
            try {
                const info = await api.runtime.sendMessage({ kind: 'getActiveProfileInfo' });
                if (info) {
                    state.lockedProfileHasKeys = !!info.hasKeys;
                }
            } catch (_) {}
            renderLockedAccessCard();
        });
    }

    elements.lockBtn.addEventListener('click', doLock);
    elements.copyNpubBtn.addEventListener('click', copyNpub);
    elements.addRelaysBtn.addEventListener('click', addRelays);
    elements.noThanksBtn.addEventListener('click', noThanks);
    
    // Copy QR as PNG
    if (elements.copyQrPngBtn) {
        elements.copyQrPngBtn.addEventListener('click', copyQrAsPng);
    }
    
    // Add profile button
    if (elements.addProfileBtn) {
        elements.addProfileBtn.addEventListener('click', openAddProfile);
    }

    // Profile view (read-only)
    if (elements.backFromViewBtn) {
        elements.backFromViewBtn.addEventListener('click', () => switchViewDirect('home'));
    }
    if (elements.editProfileBtn) {
        elements.editProfileBtn.addEventListener('click', goToEditFromView);
    }
    if (elements.copyViewNpubBtn) {
        elements.copyViewNpubBtn.addEventListener('click', copyViewNpub);
    }
    if (elements.copyViewNsecBtn) {
        elements.copyViewNsecBtn.addEventListener('click', copyViewNsec);
    }
    if (elements.toggleViewNsecBtn) {
        elements.toggleViewNsecBtn.addEventListener('click', toggleViewNsec);
    }

    // Profile edit view
    if (elements.backToProfilesBtn) {
        elements.backToProfilesBtn.addEventListener('click', backToProfiles);
    }
    if (elements.generateKeyBtn) {
        elements.generateKeyBtn.addEventListener('click', generateNewKey);
    }
    if (elements.toggleKeyVisibility) {
        elements.toggleKeyVisibility.addEventListener('click', toggleKeyVisibility);
    }
    if (elements.saveProfileBtn) {
        elements.saveProfileBtn.addEventListener('click', saveProfileChanges);
    }
    if (elements.deleteProfileBtn) {
        elements.deleteProfileBtn.addEventListener('click', deleteCurrentProfile);
    }
    // Clear error styling when user types in profile name
    if (elements.editProfileName) {
        elements.editProfileName.addEventListener('input', clearProfileErrorStyling);
    }

    // Tab navigation
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Relays view
    if (elements.addRelayBtn) {
        elements.addRelayBtn.addEventListener('click', addSingleRelay);
    }
    if (elements.newRelayInput) {
        elements.newRelayInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addSingleRelay();
        });
    }

    // Vault unlock form
    if (elements.vaultUnlockForm) {
        elements.vaultUnlockForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await doVaultUnlock();
        });
    }

    // Settings view buttons
    if (elements.openSettingsBtn) {
        elements.openSettingsBtn.addEventListener('click', openOptions);
    }
    if (elements.openHistoryBtn) {
        elements.openHistoryBtn.addEventListener('click', () => openUrl('event_history/event_history.html'));
    }
    if (elements.openExperimentalBtn) {
        elements.openExperimentalBtn.addEventListener('click', () => openUrl('experimental/experimental.html'));
    }
    if (elements.openVaultBtn) {
        elements.openVaultBtn.addEventListener('click', () => openUrl('vault/vault.html'));
    }
    if (elements.openApikeysBtn) {
        elements.openApikeysBtn.addEventListener('click', () => openUrl('api-keys/api-keys.html'));
    }
    if (elements.settingsSecurityBtn) {
        elements.settingsSecurityBtn.addEventListener('click', () => openUrl('security/security.html'));
    }
    if (elements.settingsAutolockBtn) {
        elements.settingsAutolockBtn.addEventListener('click', () => openUrl('security/security.html'));
    }
    if (elements.vaultGotoSecurityBtn) {
        elements.vaultGotoSecurityBtn.addEventListener('click', () => openUrl('security/security.html'));
    }
    if (elements.checkVaultBtn) {
        elements.checkVaultBtn.addEventListener('click', checkForExistingVault);
    }
    if (elements.setupEncryptionBtn) {
        elements.setupEncryptionBtn.addEventListener('click', () => openUrl('security/security.html'));
    }
    // Sync toggle
    if (elements.syncToggle) {
        elements.syncToggle.addEventListener('change', async () => {
            await setSyncEnabled(elements.syncToggle.checked);
            updateSyncStatusText(elements.syncToggle.checked);
        });
    }
    // Frame protection toggle
    if (elements.frameProtectionToggle) {
        elements.frameProtectionToggle.addEventListener('change', async () => {
            const enabled = elements.frameProtectionToggle.checked;
            await api.runtime.sendMessage({ kind: 'setBlockCrossOriginFrames', payload: enabled });
            updateFrameProtectionText(enabled);
        });
    }
}

// Vault detection
async function checkForExistingVault() {
    const resultEl = elements.vaultCheckResult;
    const checkBtn = elements.checkVaultBtn;
    if (checkBtn) {
        checkBtn.disabled = true;
        checkBtn.textContent = 'Checking...';
    }
    try {
        console.log('[sidepanel:checkVault] Sending hasEncryptedData...');
        const result = await api.runtime.sendMessage({ kind: 'hasEncryptedData' });
        console.log('[sidepanel:checkVault] Response:', JSON.stringify(result));
        if (result?.found) {
            // Encrypted vault found — self-heal state and show locked view
            state.hasPassword = true;
            state.isLocked = true;
            render();
        } else {
            // No vault found — show inline message
            if (resultEl) {
                resultEl.textContent = 'No existing vault found. Set a new password to get started.';
                resultEl.style.background = '#49483e';
                resultEl.style.color = '#b0b0a8';
                resultEl.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error('checkForExistingVault error:', e);
        if (resultEl) {
            resultEl.textContent = 'Could not check — try again in a moment.';
            resultEl.style.background = '#49483e';
            resultEl.style.color = '#fd971f';
            resultEl.classList.remove('hidden');
        }
    } finally {
        if (checkBtn) {
            checkBtn.disabled = false;
            checkBtn.textContent = 'Check for Existing Vault';
        }
    }
}

// Initialize
async function init() {
    console.log('NostrKey Side Panel initializing...');
    initElements();
    bindEvents();

    await initialize();

    // Try to detect encryption state; if service worker isn't ready, default to
    // showing the vault status card (hasPassword = false) so the user can
    // manually trigger a check.
    try {
        console.log('[sidepanel:init] Sending isEncrypted...');
        const encResult = await api.runtime.sendMessage({ kind: 'isEncrypted' });
        console.log('[sidepanel:init] isEncrypted response:', encResult);
        state.hasPassword = !!encResult;

        console.log('[sidepanel:init] Sending isLocked...');
        const lockResult = await api.runtime.sendMessage({ kind: 'isLocked' });
        console.log('[sidepanel:init] isLocked response:', lockResult);
        state.isLocked = !!lockResult;
    } catch (e) {
        console.warn('[sidepanel:init] Could not query encryption state (service worker may be restarting):', e);
        state.hasPassword = false;
        state.isLocked = false;
    }
    console.log(`[sidepanel:init] Final state: hasPassword=${state.hasPassword}, isLocked=${state.isLocked}`);

    // Fallback: if isEncrypted/isLocked returned falsy (polyfill or timing issue),
    // do a deep scan via hasEncryptedData which returns an object (more reliable).
    if (!state.hasPassword) {
        console.log('[sidepanel:init] hasPassword=false, running hasEncryptedData fallback...');
        try {
            const deep = await api.runtime.sendMessage({ kind: 'hasEncryptedData' });
            console.log('[sidepanel:init] hasEncryptedData response:', JSON.stringify(deep));
            if (deep?.found) {
                state.hasPassword = true;
                state.isLocked = true;
                console.log('[sidepanel:init] Vault detected via fallback — switching to locked view');
            }
        } catch (e) {
            console.warn('[sidepanel:init] hasEncryptedData fallback failed:', e);
        }
    }

    // Query nostr-access-while-locked state and active profile info
    try {
        const nawl = await api.runtime.sendMessage({ kind: 'getNostrAccessWhileLocked' });
        state.nostrAccessWhileLocked = !!nawl;
    } catch (e) {
        console.warn('[sidepanel:init] Could not query locked access toggle:', e);
    }
    try {
        const info = await api.runtime.sendMessage({ kind: 'getActiveProfileInfo' });
        console.log('[sidepanel:init] getActiveProfileInfo response:', JSON.stringify(info));
        if (info && typeof info === 'object') {
            state.lockedProfileName = info.name || 'Unnamed Profile';
            state.lockedProfileNpub = info.npub || '';
            state.lockedProfileHasKeys = !!info.hasKeys;
        }
    } catch (e) {
        console.warn('[sidepanel:init] Could not query active profile info:', e);
    }

    // Listen for password state changes from security page
    api.runtime.onMessage.addListener((message) => {
        if (message.kind === 'passwordStateChanged') {
            state.hasPassword = message.hasPassword;
            renderUnlockedState();
        }
    });

    if (!state.isLocked) {
        await loadUnlockedState();
    } else {
        render();
    }
}

document.addEventListener('DOMContentLoaded', init);
