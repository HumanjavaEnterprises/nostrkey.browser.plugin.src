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
    setPermission,
    humanPermission,
    KINDS,
    newProfile,
    saveProfileName,
    deleteProfile,
    getProfile,
    getProfiles,
} from './utilities/utils';
import { api } from './utilities/browser-polyfill';
import { isSyncEnabled, setSyncEnabled } from './utilities/sync-manager';
import {
    enableCloudBackup, disableCloudBackup, getCloudStatus,
    cloudBackupNow, scheduleCloudBackup, restoreFromCloud,
    noteAccountsChanged, getBackupFreshness,
    hasDecidedCloudBackup, markCloudBackupOffered,
} from './utilities/cloud-backup';
import QRCode from 'qrcode';

// iOS Safari extension popup fixes (moved from inline script for CSP compliance)
(function() {
    if (!window.matchMedia('(pointer: coarse) and (hover: none)').matches) return;
    if (window.innerWidth > 500) {
        var vp = document.querySelector('meta[name="viewport"]');
        if (vp) vp.setAttribute('content', 'width=380,initial-scale=1,shrink-to-fit=no');
        var s = document.createElement('style');
        s.textContent = '.sidepanel-layout{min-height:580px}';
        document.head.appendChild(s);
    }
})();

// iOS: hide tab bar and locked footer when virtual keyboard is open
(function() {
    if (!window.visualViewport) return;
    var threshold = 0.75;
    window.visualViewport.addEventListener('resize', function() {
        var kbOpen = window.visualViewport.height < window.innerHeight * threshold;
        var tabs = document.querySelector('.sidepanel-tabs');
        var footer = document.getElementById('locked-footer');
        if (tabs) tabs.style.display = kbOpen ? 'none' : '';
        if (footer) footer.style.display = kbOpen ? 'none' : '';
    });
})();

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
    bunkerServerActive: false,
    lastBackupAt: 0,
    currentView: 'home',
    permissions: [],
    // Profile view state
    viewingProfileIndex: null,
    // Profile DETAIL view — the identity whose inline feature-objects (Keys,
    // Seed, Relays, App permissions, Bunker) are currently shown. Feature-
    // migration agents read state.detailProfileIndex to know which profile to
    // render into #pd-keys / #pd-seed / #pd-relays / #pd-permissions / #pd-bunker.
    detailProfileIndex: null,
    viewNsecVisible: false,
    viewNsecValue: '',
    // Profile edit state
    editingProfileIndex: null, // null = new profile, number = editing existing
    editProfileName: '',
    editProfileKey: '',
    keyVisible: false,
    // Where the add/edit form should return on save/cancel:
    // 'home' (the identity rack) or 'profile-view' (the Manage Profiles screen).
    editReturnView: 'home',
};

// DOM Elements
const elements = {};

function $(id) {
    return document.getElementById(id);
}

// Escape user-controlled strings before interpolating into innerHTML templates
function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    // (Outgoing bunker-server UI now lives on the profile-detail Bunker
    //  feature-object — see renderPDBunker(); no shared elements here.)
    // Settings view buttons
    elements.openSettingsBtn = $('open-settings-btn');
    elements.openHistoryBtn = $('open-history-btn');
    elements.openExperimentalBtn = $('open-experimental-btn');
    elements.openVaultBtn = $('open-vault-btn');
    elements.openApikeysBtn = $('open-apikeys-btn');
    elements.openNostrkeysBtn = $('open-nostrkeys-btn');
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
    elements.addProfileFromViewBtn = $('add-profile-from-view-btn');
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
    // Cloud backup (folder)
    elements.cloudBackupCard = $('cloud-backup-card');
    elements.cloudBackupToggle = $('cloud-backup-toggle');
    elements.cloudBackupStatus = $('cloud-backup-status');
    elements.cloudBackupActions = $('cloud-backup-actions');
    elements.cloudBackupNowBtn = $('cloud-backup-now-btn');
    elements.cloudBackupRestoreBtn = $('cloud-backup-restore-btn');
    elements.cloudRestorePanel = $('cloud-restore-panel');
    elements.cloudRestorePassword = $('cloud-restore-password');
    elements.cloudRestoreError = $('cloud-restore-error');
    elements.cloudRestoreSuccess = $('cloud-restore-success');
    elements.cloudDoRestoreBtn = $('cloud-do-restore-btn');
    elements.cloudCancelRestoreBtn = $('cloud-cancel-restore-btn');
    elements.backupFreshness = $('backup-freshness');
    // First-run cloud-backup offer
    elements.cloudBackupPrompt = $('cloud-backup-prompt');
    elements.cloudOfferEnableBtn = $('cloud-offer-enable-btn');
    elements.cloudOfferDismissBtn = $('cloud-offer-dismiss-btn');
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
    // Backup / restore
    elements.backupPrompt = $('backup-prompt');
    elements.backupSaveBtn = $('backup-save-btn');
    elements.backupDismissBtn = $('backup-dismiss-btn');
    elements.downloadBackupBtn = $('download-backup-btn');
    // Lock screen restore
    elements.restoreBackupBtn = $('restore-backup-btn');
    elements.restoreBackupPanel = $('restore-backup-panel');
    elements.restorePassword = $('restore-password');
    elements.restoreFile = $('restore-file');
    elements.restoreError = $('restore-error');
    elements.restoreSuccess = $('restore-success');
    elements.doRestoreBtn = $('do-restore-btn');
    elements.cancelRestoreBtn = $('cancel-restore-btn');
    // First-run restore
    elements.firstrunRestoreBtn = $('firstrun-restore-btn');
    elements.firstrunRestorePanel = $('firstrun-restore-panel');
    elements.firstrunRestorePassword = $('firstrun-restore-password');
    elements.firstrunRestoreFile = $('firstrun-restore-file');
    elements.firstrunRestoreError = $('firstrun-restore-error');
    elements.firstrunRestoreSuccess = $('firstrun-restore-success');
    elements.firstrunDoRestoreBtn = $('firstrun-do-restore-btn');
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

// --- Security level meter (the L0→L3 progressive-trust ladder) ---
function computeSecurityLevel() {
    // L0 instant key · L1 backed up · L2 master password + auto-lock ·
    // L3 bunker (per-connection, default-deny per-kind signing)
    let level = 0;
    if (state.lastBackupAt) level = 1;
    if (state.hasPassword) level = 2;
    if (state.profileType === 'bunker' || state.bunkerServerActive) level = 3;
    return level;
}

const SECURITY_LEVEL_LABELS = [
    'L0 · KEY ONLY — NOT BACKED UP',
    'L1 · BACKED UP',
    'L2 · ENCRYPTED + AUTO-LOCK',
    'L3 · BUNKER ACTIVE',
];

function renderSecurityMeter() {
    // Once a master password is set the meter has said its piece — hide it so Home
    // stays focused on identities rather than a level that no longer moves.
    const strip = $('home-security-strip');
    if (strip) strip.classList.toggle('hidden', !!state.hasPassword);
    const meter = $('home-meter');
    const label = $('home-meter-label');
    if (!meter || !label) return;
    const level = computeSecurityLevel();
    meter.dataset.level = String(level);
    meter.setAttribute('aria-label', `Security level ${level} of 3`);
    label.textContent = SECURITY_LEVEL_LABELS[level] || SECURITY_LEVEL_LABELS[0];
}

function renderUnlockedState() {
    // Security-level meter (channel meter on Home)
    renderSecurityMeter();

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
    
    elements.profileList.innerHTML = state.profileNames.map((name, i) => {
        const active = i === state.profileIndex;
        // Channel-strip sub-line: active identity shows its mono npub readout
        let sub;
        if (active) {
            const npub = state.currentNpub;
            sub = npub && npub.length > 20
                ? `${esc(npub.slice(0, 14))}…${esc(npub.slice(-6))}`
                : 'ACTIVE — SIGNING IDENTITY';
        } else {
            sub = 'STANDBY — SELECT TO ACTIVATE';
        }
        return `
        <div class="profile-item id-strip ${active ? 'is-active' : ''}" data-index="${i}">
            <div class="profile-select-area id-strip-main" data-index="${i}">
                <div class="strip-glyph" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="4"></circle>
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                    </svg>
                </div>
                <div class="id-strip-id">
                    <div class="id-name">${esc(name)}${active ? ' <span class="led led--signal" aria-label="Active signing identity"></span>' : ''}</div>
                    <div class="id-sub mono">${sub}</div>
                </div>
            </div>
            <button class="profile-edit-btn id-edit" data-index="${i}" title="View profile" aria-label="View profile ${esc(name)}">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
        </div>`;
    }).join('');

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
        elements.bunkerIndicator.className = `led ${state.bunkerConnected ? 'led--green' : 'led--red'}`;
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
            elements.nostrAccessStatus.style.color = '#c084fc'; /* live capability — signal */
        } else if (state.nostrAccessWhileLocked && !state.lockedProfileHasKeys) {
            elements.nostrAccessStatus.textContent = 'Unlock once this session to enable signing.';
            elements.nostrAccessStatus.style.color = '#f59e0b'; /* caution — amber */
        } else {
            elements.nostrAccessStatus.textContent = 'Sites cannot access keys while locked.';
            elements.nostrAccessStatus.style.color = '#8A90A0'; /* muted */
        }
    }
}

// Actions
async function loadUnlockedState() {
    await api.runtime.sendMessage({ kind: 'resetAutoLock' });
    await deduplicateProfiles();
    await loadNames();
    await loadProfileIndex();
    await loadProfileType();
    await countRelays();
    await checkRelayReminder();
    await generateQr();
    render();
    // Offer folder cloud-backup once, now that the vault is unlocked.
    maybeShowCloudBackupOffer();
}

/**
 * Remove duplicate profiles (same nsec/npub). Keeps the first occurrence,
 * deletes copies. Runs on every unlock to auto-heal from rapid-click duplicates.
 */
async function deduplicateProfiles() {
    try {
        const profiles = await getProfiles();
        if (profiles.length <= 1) return;

        const seen = new Map(); // npub → first index
        const toDelete = []; // indices to remove (reverse order)

        for (let i = 0; i < profiles.length; i++) {
            const npub = await getNpub(i);
            if (!npub) continue;

            if (seen.has(npub)) {
                toDelete.push(i);
            } else {
                seen.set(npub, i);
            }
        }

        if (toDelete.length === 0) return;

        console.log(`[dedup] Found ${toDelete.length} duplicate profile(s), removing...`);

        // Delete from highest index first so indices don't shift
        for (let i = toDelete.length - 1; i >= 0; i--) {
            await deleteProfile(toDelete[i]);
        }

        console.log(`[dedup] Cleaned up ${toDelete.length} duplicate(s)`);
    } catch (e) {
        console.error('[dedup] Failed to deduplicate profiles:', e);
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
            state.currentNpub = '';
            return;
        }
        state.currentNpub = npub;
        state.npubQrDataUrl = await QRCode.toDataURL(npub.toUpperCase(), {
            width: 200,
            margin: 2,
            color: { dark: '#0E0F13', light: '#E7E9EE' },
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

function openAddProfile(returnView) {
    // Open profile edit view for a new profile. `returnView` decides where the
    // back/cancel and post-save navigation lands ('home' or 'profile-view').
    state.editingProfileIndex = null;
    state.editProfileName = '';
    state.editProfileKey = '';
    state.keyVisible = false;
    state.editReturnView = returnView === 'profile-view' ? 'profile-view' : 'home';
    showProfileEditView();
}

// Home "Add" (+) routes INTO the Manage Profiles context (view-profile-view)
// with the add form active, so back/cancel returns to Manage Profiles — not
// straight to a bare edit view out of context.
async function openAddProfileFromHome() {
    await openProfileView(state.profileIndex);
    openAddProfile('profile-view');
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

// openProfileView = THE opener for the Profile DETAIL view (#view-profile-view).
// Reached from the Home identity rack (per-row view button) and the add/edit
// return flows. It fills the identity header, sets state.detailProfileIndex,
// tags the container with the profile type (feature-visibility hook), then hands
// off to renderProfileDetail() which paints the five inline feature-objects.
async function openProfileView(index) {
    const profile = await getProfile(index);
    if (!profile) return;

    state.viewingProfileIndex = index;
    state.detailProfileIndex = index;
    state.viewNsecVisible = false;

    // Show/hide delete button on profile view (not for the only profile)
    const deleteFromViewBtn = document.getElementById('delete-from-view-btn');
    if (deleteFromViewBtn) {
        if (state.profileNames.length > 1) {
            deleteFromViewBtn.classList.remove('hidden');
        } else {
            deleteFromViewBtn.classList.add('hidden');
        }
    }

    // Feature-visibility hook: bunker profiles hide Keys/Seed (no local key).
    const detailContainer = $('view-profile-view');
    if (detailContainer) {
        detailContainer.dataset.profileType = profile.type || 'local';
    }

    // Identity header: name + npub (nsec reveal now lives in the Keys
    // feature-object #pd-keys, ported from options.js by the keys agent).
    const npub = await getNpub(index);
    if (elements.viewProfileName) {
        elements.viewProfileName.textContent = profile.name || 'Unnamed';
    }
    if (elements.viewNpub) {
        elements.viewNpub.textContent = npub || 'Not available';
    }

    renderProfileDetail(index);
    switchViewDirect('profile-view');
}

// renderProfileDetail(index) — paints the Profile DETAIL view for one identity:
// the header status LED, then each inline feature-object via its stub renderer.
// Feature-migration agents implement the renderPD* stubs below (one per agent),
// each painting into its module body (#pd-keys / #pd-seed / #pd-relays /
// #pd-permissions / #pd-bunker). They MUST NOT collide — one function each.
function renderProfileDetail(index) {
    state.detailProfileIndex = index;

    // Header status LED: is this the active signing identity, or standby?
    const led = $('pd-status-led');
    const statusText = $('pd-status-text');
    const isActive = index === state.profileIndex;
    if (led) led.className = 'led ' + (isActive ? 'led--signal' : 'led--off');
    if (statusText) {
        statusText.textContent = isActive
            ? 'Active — signing identity'
            : 'Standby — select on Home to activate';
    }

    // Inline feature-objects (bodies filled by the feature-migration agents).
    renderPDKeys(index);
    renderPDSeed(index);
    renderPDRelays(index);
    renderPDPermissions(index);
    renderPDBunker(index);
}

// --- Profile-detail feature-object renderers (STUBS) ----------------------
// Each renders one feature-object for state.detailProfileIndex into its module
// body. A feature-migration agent ports the matching options.js logic here.
// Keep these as one-function-per-feature so agents don't collide.

// renderPDKeys(index) — the KEYS feature-object for state.detailProfileIndex,
// ported from full_settings.html #keys-form + options.js (loadLocalProfile /
// handleCopyPubKey / handleToggleVisibility / generateNsecQr's getNsec fetch).
// Shows this identity's public key (npub + hex) with copy actions and a gated,
// danger-confirmed private-key (nsec) reveal. The nsec is NEVER pulled into the
// DOM until the user confirms the reveal — same safety posture as options.js,
// which only requested getNsec on demand. Rebuilt on every open, so the inline
// listeners below are always attached to fresh nodes (no duplicate handlers).
async function renderPDKeys(index) {
    const body = $('pd-keys');
    if (!body) return;

    const profile = await getProfile(index);
    if (!profile) { body.innerHTML = ''; return; }

    const isBunker = (profile.type === 'bunker');
    // npub via the same helper the identity strip uses; hex from the cached
    // public key (local) or the remote signer's pubkey (bunker).
    const npub = (await getNpub(index)) || '';
    const hex = profile.pubKey || profile.remotePubkey || '';

    body.innerHTML = `
        <p class="status-line ins-muted">This is the identity's signing key — the secret that proves and authorizes everything this profile publishes to Nostr.</p>

        <div class="readout-param">
            <span class="readout-key">npub</span>
            <button class="btn btn--ghost btn--sm ml-auto" data-action="pd-copy-npub"${npub ? '' : ' disabled'}>Copy</button>
        </div>
        <pre class="readout mono" id="pd-keys-npub">${esc(npub || 'Not available')}</pre>

        <div class="readout-param">
            <span class="readout-key">Hex</span>
            <button class="btn btn--ghost btn--sm ml-auto" data-action="pd-copy-hex"${hex ? '' : ' disabled'}>Copy</button>
        </div>
        <pre class="readout mono" id="pd-keys-hex">${esc(hex || 'Not available')}</pre>

        ${isBunker ? `
        <div class="warn-strip" role="note">Private key held remotely on the bunker — it is never stored in this browser.</div>
        ` : `
        <div class="readout-param">
            <span class="readout-key">nsec</span>
            <span class="led led--red ml-auto" aria-label="Private key — secret"></span>
        </div>
        <div class="warn-strip warn-strip--red" role="alert">Your private key is your identity. Anyone who sees it controls this profile forever. Never share it or paste it into a website.</div>
        <div id="pd-keys-nsec-locked">
            <button class="btn btn--destructive btn--sm w-full" data-action="pd-reveal-nsec">Reveal private key</button>
        </div>
        <div id="pd-keys-nsec-open" class="hidden">
            <pre class="readout mono" id="pd-keys-nsec"></pre>
            <div class="flex gap-2 mt-3">
                <button class="btn btn--ghost btn--sm" data-action="pd-copy-nsec">Copy</button>
                <button class="btn btn--ghost btn--sm" data-action="pd-hide-nsec">Hide</button>
            </div>
        </div>
        `}
    `;

    // Copy-with-feedback (mirrors handleCopyPubKey's transient "Copied!" state).
    const copyFeedback = async (btn, text) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
        } catch (e) {
            console.error('[pd-keys] copy failed:', e);
        }
    };

    const copyNpubBtn = body.querySelector('[data-action="pd-copy-npub"]');
    if (copyNpubBtn) copyNpubBtn.addEventListener('click', () => copyFeedback(copyNpubBtn, npub));

    const copyHexBtn = body.querySelector('[data-action="pd-copy-hex"]');
    if (copyHexBtn) copyHexBtn.addEventListener('click', () => copyFeedback(copyHexBtn, hex));

    if (isBunker) return;

    const lockedBox = body.querySelector('#pd-keys-nsec-locked');
    const openBox = body.querySelector('#pd-keys-nsec-open');
    const nsecEl = body.querySelector('#pd-keys-nsec');
    const revealBtn = body.querySelector('[data-action="pd-reveal-nsec"]');
    const copyNsecBtn = body.querySelector('[data-action="pd-copy-nsec"]');
    const hideNsecBtn = body.querySelector('[data-action="pd-hide-nsec"]');
    let revealedNsec = '';

    const hideNsec = () => {
        revealedNsec = '';
        if (nsecEl) nsecEl.textContent = '';
        openBox?.classList.add('hidden');
        lockedBox?.classList.remove('hidden');
    };

    if (revealBtn) {
        revealBtn.addEventListener('click', async () => {
            // Danger/confirm gate BEFORE the secret is fetched into the DOM.
            if (!confirm('Reveal your private key (nsec)?\n\nAnyone who sees these characters gains full control of this identity. Make sure no one is watching your screen.')) return;
            try {
                const nsec = await api.runtime.sendMessage({ kind: 'getNsec', payload: index });
                if (!nsec) {
                    alert('Private key is unavailable. If a master password is set, unlock first.');
                    return;
                }
                revealedNsec = nsec;
                if (nsecEl) nsecEl.textContent = nsec;
                lockedBox?.classList.add('hidden');
                openBox?.classList.remove('hidden');
            } catch (e) {
                console.error('[pd-keys] getNsec failed:', e);
                alert('Failed to reveal private key.');
            }
        });
    }

    if (copyNsecBtn) copyNsecBtn.addEventListener('click', () => copyFeedback(copyNsecBtn, revealedNsec));
    if (hideNsecBtn) hideNsecBtn.addEventListener('click', hideNsec);
}

// --- Seed phrase (BIP39) feature-object ----------------------------------
// Ported from full_settings.html "Seed phrase (BIP39)" export section + the
// "seedphrase-import" detect-box, and options.js (handleRevealSeedPhrase /
// handleHideSeedPhrase / handleCopySeedPhrase / handleImportSeedPhrase).
// Reused background messages (unchanged shapes):
//   seedPhrase.fromKey  payload=index          → { success, seedPhrase }
//   seedPhrase.toKey    payload=phraseString   → { success, hexKey }
//   savePrivateKey      payload=[index, hexKey]
// Transient reveal/import UI state, scoped to THIS feature-object only.
let pdSeed = {
    revealed: false,
    text: '',
    copied: false,
    error: '',
    importOpen: false,
    importText: '',
    importError: '',
    importLoading: false,
};

async function renderPDSeed(index) {
    const body = $('pd-seed');
    if (!body) return;

    // Fresh transient state every time the detail view (re)opens for a profile
    // — never leave a previously-revealed phrase lingering across identities.
    pdSeed = {
        revealed: false,
        text: '',
        copied: false,
        error: '',
        importOpen: false,
        importText: '',
        importError: '',
        importLoading: false,
    };

    const profile = await getProfile(index);
    // Bunker identities have no local key — nothing to export as a seed phrase.
    if (!profile || profile.type === 'bunker') {
        body.innerHTML =
            '<p class="ins-muted">This identity signs through a remote bunker (NIP-46). Its private key never touches this browser, so there is no seed phrase to export here.</p>';
        return;
    }

    paintPDSeed(index);
}

// Paints #pd-seed from pdSeed state and (re)binds its buttons. Called on every
// state change (reveal/hide/copy/import toggle) — mirrors renderRelayList().
function paintPDSeed(index) {
    const body = $('pd-seed');
    if (!body) return;

    let html =
        '<p class="ins-muted">This identity\'s private key can also be written down as a 24-word BIP39 seed phrase. Anyone with these words controls the key &mdash; only reveal it somewhere private.</p>';

    if (!pdSeed.revealed) {
        html +=
            '<div class="flex gap-2 mt-3">' +
            '<button type="button" class="button button--danger flex-1 pd-seed-reveal-btn">Reveal seed phrase</button>' +
            '</div>';
    } else {
        html +=
            '<div class="warn-strip warn-strip--red mt-3" role="alert">Secret seed phrase &mdash; anyone who reads these words controls your key.</div>' +
            '<textarea class="ins-input mono w-full mt-3 pd-seed-text" rows="3" readonly aria-label="Seed phrase">' +
            esc(pdSeed.text) +
            '</textarea>' +
            '<div class="flex gap-2 mt-3">' +
            '<button type="button" class="button button--sm flex-1 pd-seed-copy-btn">' +
            (pdSeed.copied ? 'Copied!' : 'Copy') +
            '</button>' +
            '<button type="button" class="button button--sm button--muted flex-1 pd-seed-hide-btn">Hide</button>' +
            '</div>';
    }

    if (pdSeed.error) {
        html += '<div class="warn-strip warn-strip--red mt-3" role="alert">' + esc(pdSeed.error) + '</div>';
    }

    html += '<hr class="ins-hr" />';

    // Import / recover: paste a phrase to replace THIS identity's key.
    if (!pdSeed.importOpen) {
        html +=
            '<button type="button" class="button button--sm button--muted w-full pd-seed-import-toggle">Import from seed phrase…</button>';
    } else {
        html +=
            '<p class="ins-muted">Paste a 12- or 24-word BIP39 seed phrase to derive a key and replace this identity\'s current key. This overwrites the existing key &mdash; make sure it is backed up first.</p>' +
            '<textarea class="ins-input mono w-full mt-3 pd-seed-import-input" rows="3" placeholder="word1 word2 word3 …" aria-label="Seed phrase to import">' +
            esc(pdSeed.importText) +
            '</textarea>';
        if (pdSeed.importError) {
            html += '<div class="warn-strip warn-strip--red mt-3" role="alert">' + esc(pdSeed.importError) + '</div>';
        }
        html +=
            '<div class="flex gap-2 mt-3">' +
            '<button type="button" class="button button--primary button--sm flex-1 pd-seed-import-btn"' +
            (pdSeed.importLoading ? ' disabled' : '') +
            '>' +
            (pdSeed.importLoading ? 'Importing…' : 'Import &amp; replace key') +
            '</button>' +
            '<button type="button" class="button button--sm button--muted flex-1 pd-seed-import-cancel">Cancel</button>' +
            '</div>';
    }

    body.innerHTML = html;

    const revealBtn = body.querySelector('.pd-seed-reveal-btn');
    if (revealBtn) revealBtn.addEventListener('click', () => handlePDSeedReveal(index));
    const copyBtn = body.querySelector('.pd-seed-copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', () => handlePDSeedCopy(index));
    const hideBtn = body.querySelector('.pd-seed-hide-btn');
    if (hideBtn) hideBtn.addEventListener('click', () => handlePDSeedHide(index));
    const importToggle = body.querySelector('.pd-seed-import-toggle');
    if (importToggle) {
        importToggle.addEventListener('click', () => {
            pdSeed.importOpen = true;
            pdSeed.importError = '';
            paintPDSeed(index);
        });
    }
    const importCancel = body.querySelector('.pd-seed-import-cancel');
    if (importCancel) {
        importCancel.addEventListener('click', () => {
            pdSeed.importOpen = false;
            pdSeed.importError = '';
            pdSeed.importText = '';
            paintPDSeed(index);
        });
    }
    const importInput = body.querySelector('.pd-seed-import-input');
    if (importInput) {
        // Keep the typed phrase across error re-paints without re-rendering per keystroke.
        importInput.addEventListener('input', () => { pdSeed.importText = importInput.value; });
    }
    const importBtn = body.querySelector('.pd-seed-import-btn');
    if (importBtn) importBtn.addEventListener('click', () => handlePDSeedImport(index));
}

async function handlePDSeedReveal(index) {
    pdSeed.error = '';
    try {
        const result = await api.runtime.sendMessage({ kind: 'seedPhrase.fromKey', payload: index });
        if (result && result.success) {
            pdSeed.text = result.seedPhrase;
            pdSeed.revealed = true;
            pdSeed.copied = false;
        } else {
            pdSeed.revealed = false;
            pdSeed.text = '';
            pdSeed.error = (result && result.error) || 'Failed to reveal seed phrase';
        }
    } catch (e) {
        pdSeed.error = e.message || 'Failed to reveal seed phrase';
    }
    paintPDSeed(index);
}

function handlePDSeedHide(index) {
    pdSeed.revealed = false;
    pdSeed.text = '';
    pdSeed.copied = false;
    pdSeed.error = '';
    paintPDSeed(index);
}

async function handlePDSeedCopy(index) {
    try {
        await navigator.clipboard.writeText(pdSeed.text);
        pdSeed.copied = true;
        paintPDSeed(index);
        setTimeout(() => {
            pdSeed.copied = false;
            if (state.detailProfileIndex === index) paintPDSeed(index);
        }, 1500);
    } catch (e) {
        // Clipboard denied — leave the phrase visible for manual copy.
    }
}

async function handlePDSeedImport(index) {
    const phrase = (pdSeed.importText || '').trim().replace(/\s+/g, ' ');
    if (!phrase) {
        pdSeed.importError = 'Enter a seed phrase to import.';
        paintPDSeed(index);
        return;
    }
    if (!confirm(
        'Replace this identity\'s key with the one derived from this seed phrase? ' +
        'This overwrites the current key and cannot be undone.'
    )) {
        return;
    }
    pdSeed.importError = '';
    pdSeed.importLoading = true;
    paintPDSeed(index);
    try {
        const result = await api.runtime.sendMessage({ kind: 'seedPhrase.toKey', payload: phrase });
        if (result && result.success) {
            await api.runtime.sendMessage({ kind: 'savePrivateKey', payload: [index, result.hexKey] });
            // Reset transient state, then re-open the detail view so the header
            // npub and every feature-object reflect the newly imported key.
            pdSeed = {
                revealed: false,
                text: '',
                copied: false,
                error: '',
                importOpen: false,
                importText: '',
                importError: '',
                importLoading: false,
            };
            await openProfileView(index);
            return;
        }
        pdSeed.importError = (result && result.error) || 'Invalid seed phrase';
    } catch (e) {
        pdSeed.importError = e.message || 'Import failed';
    }
    pdSeed.importLoading = false;
    paintPDSeed(index);
}

// renderPDRelays(index) — RELAYS feature-object for ONE identity (the profile
// at state.detailProfileIndex). Ports the full_settings/options.js relays-table
// + add/remove/read-write logic to operate against `index` instead of the
// globally-active profile. Shows this identity's relationship to the network:
// where it publishes (write) and reads (read). Uses the same storage helpers
// (getRelays/saveRelays) and RECOMMENDED_RELAYS as options.js.
async function renderPDRelays(index) {
    const container = $('pd-relays');
    if (container == null) return;

    const relays = await getRelays(index);

    // Recommended relays not already assigned (ports getRecommendedRelays()).
    const existingUrls = relays.map((r) => {
        try { return new URL(r.url).href; } catch { return r.url; }
    });
    const recommended = RECOMMENDED_RELAYS
        .map((r) => r.href)
        .filter((href) => !existingUrls.includes(href));

    const rowsHtml = relays.length > 0
        ? relays.map((relay, i) => `
            <div class="relay-row">
                <span class="relay-url mono ins-truncate" title="${esc(relay.url)}">${esc(relay.url)}</span>
                <div class="relay-flags">
                    <button type="button" class="button button--sm ${relay.read ? 'button--primary' : 'button--muted'}" aria-pressed="${relay.read ? 'true' : 'false'}" data-pd-relay-prop="read" data-pd-relay-index="${i}" title="Read from this relay">Read</button>
                    <button type="button" class="button button--sm ${relay.write ? 'button--primary' : 'button--muted'}" aria-pressed="${relay.write ? 'true' : 'false'}" data-pd-relay-prop="write" data-pd-relay-index="${i}" title="Publish to this relay">Write</button>
                </div>
                <button type="button" class="button button--sm button--danger" data-pd-relay-del="${i}" aria-label="Remove ${esc(relay.url)}">Delete</button>
            </div>
        `).join('')
        : '<p class="empty-note">There are no relays assigned to this profile.</p>';

    const recommendedHtml = recommended.length > 0
        ? `<div class="field">
                <select id="pd-relay-recommended" class="input" aria-label="Recommended relays">
                    <option value="" disabled selected>Recommended Relays</option>
                    ${recommended.map((url) => `<option value="${esc(url)}">${esc(url)}</option>`).join('')}
                </select>
            </div>`
        : '';

    container.innerHTML = `
        <p class="card-lede">Where this identity publishes and reads. Relay suggestions clients can pick up.</p>
        <div class="relay-rack">${rowsHtml}</div>
        ${recommendedHtml}
        <div class="flex gap-2 mt-3">
            <input id="pd-relay-input" type="text" class="input input--mono flex-1" placeholder="wss://..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
            <button id="pd-relay-add-btn" type="button" class="button button--primary">Add</button>
        </div>
        <div id="pd-relay-error" class="field-error" role="alert"></div>
    `;

    // Read/Write toggles (ports handleRelayCheckboxChange).
    container.querySelectorAll('[data-pd-relay-prop]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const i = parseInt(btn.dataset.pdRelayIndex, 10);
            const prop = btn.dataset.pdRelayProp;
            const current = await getRelays(index);
            if (!current[i]) return;
            current[i][prop] = !current[i][prop];
            await saveRelays(index, current);
            renderPDRelays(index);
        });
    });

    // Delete a relay (ports handleDeleteRelay).
    container.querySelectorAll('[data-pd-relay-del]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const i = parseInt(btn.dataset.pdRelayDel, 10);
            const current = await getRelays(index);
            current.splice(i, 1);
            await saveRelays(index, current);
            renderPDRelays(index);
        });
    });

    // Add via the recommended dropdown (ports recommended-relay change handler).
    const recSelect = container.querySelector('#pd-relay-recommended');
    if (recSelect) {
        recSelect.addEventListener('change', (e) => addPDRelay(index, e.target.value));
    }

    // Add via free-text input (ports handleAddRelay + Enter-to-add).
    const input = container.querySelector('#pd-relay-input');
    const addBtn = container.querySelector('#pd-relay-add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => addPDRelay(index, input ? input.value : ''));
    }
    if (input) {
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') addPDRelay(index, input.value);
        });
    }
}

// addPDRelay(index, candidate) — validate + persist one relay for the profile at
// `index`. Ports the validation from options.js handleAddRelay: must be a wss://
// URL, no duplicates. Errors surface inline in #pd-relay-error (auto-clearing,
// ports setUrlError's 3s timeout). Dedicated helper for renderPDRelays only.
async function addPDRelay(index, candidate) {
    const value = (candidate || '').trim();
    if (!value) return;
    let url;
    try {
        url = new URL(value);
    } catch {
        showPDRelayError('Invalid websocket URL');
        return;
    }
    if (url.protocol !== 'wss:') {
        showPDRelayError('Must be a websocket url');
        return;
    }
    const current = await getRelays(index);
    if (current.map((v) => v.url).includes(url.href)) {
        showPDRelayError('URL already exists');
        return;
    }
    current.push({ url: url.href, read: true, write: true });
    await saveRelays(index, current);
    renderPDRelays(index);
}

// showPDRelayError — inline, auto-clearing validation message for the relays
// feature-object (ports setUrlError's transient behavior).
function showPDRelayError(message) {
    const errEl = $('pd-relay-error');
    if (!errEl) return;
    errEl.textContent = message;
    if (errEl._clearTimer) clearTimeout(errEl._clearTimer);
    errEl._clearTimer = setTimeout(() => {
        const el = $('pd-relay-error');
        if (el) el.textContent = '';
    }, 3000);
}

async function renderPDPermissions(index) {
    // App-permissions feature-object for THIS identity (state.detailProfileIndex):
    // the apps this profile has authorized and their per-(action × kind) grants,
    // painted as instrument patch-points. Default-deny — a lit point = an active
    // grant; clicking it revokes back to "ask". Ported from options.js
    // (loadPermissions / renderPermissions / handlePermissionChange) + the
    // home-level renderPermissionsList, but scoped to this profile's index and
    // reading/writing straight from the profile record (same source options.js
    // uses): { "<origin>": { "signEvent:1": "allow", "getPubKey": "allow", … } }.
    const container = $('pd-permissions');
    if (!container) return;

    let apps;
    try {
        const hosts = await getPermissions(index);
        apps = Object.entries(hosts || {}).map(([origin, grants]) => ({
            origin,
            grants: Object.entries(grants || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([action, value]) => ({ action, value })),
        })).sort((a, b) => a.origin.localeCompare(b.origin));
    } catch {
        apps = [];
    }

    // Guard against a stale async paint if the user moved to another profile.
    if (index !== state.detailProfileIndex) return;

    if (apps.length === 0) {
        container.innerHTML =
            '<p class="empty-note">No apps connected yet. Every request is denied by ' +
            'default — when you approve one, a patch point appears here for that app ' +
            'and kind only, so you can revoke it any time.</p>';
        return;
    }

    container.innerHTML = apps.map((app, ai) => {
        const points = app.grants.map((g, gi) => {
            const risky = isRiskyGrant(g.action);
            const kindNum = grantKindNum(g.action);
            const allowed = g.value === 'allow';
            const denied = g.value === 'deny' || g.value === 'reject';
            const stateWord = allowed ? 'ALLOW' : denied ? 'DENY' : 'ASK';
            const title = allowed
                ? 'Granted — click to revoke (back to ask)'
                : denied
                    ? 'Denied — click to clear (back to ask)'
                    : 'Will ask each time';
            return `
            <button type="button"
                class="patch-point pd-perm-patch${risky ? ' patch-point--danger' : ''}${denied ? ' patch-point--denied' : ''}"
                aria-pressed="${allowed ? 'true' : 'false'}"
                data-app="${ai}" data-grant="${gi}"
                title="${esc(title)}">
                <span class="patch-jack" aria-hidden="true"></span>
                ${kindNum !== null ? `<span class="kind-num mono">${kindNum}</span>` : ''}
                <span>${esc(grantLabel(g.action))}</span>
                <span class="patch-state mono">${stateWord}</span>
            </button>`;
        }).join('');
        return `
        <div class="app-module">
            <div class="module-header">
                <span class="app-origin" title="${esc(app.origin)}">${esc(app.origin)}</span>
                <span class="header-end">
                    <span class="led led--green" aria-label="Connected"></span>
                    <button type="button" class="button button--sm button--muted pd-perm-revoke-all" data-app="${ai}" title="Revoke every grant for this app">Revoke all</button>
                </span>
            </div>
            <div class="patch-bay">${points || '<p class="empty-note">No grants stored.</p>'}</div>
        </div>`;
    }).join('');

    // Patch-point click = clear the stored decision (revert to default-deny "ask").
    container.querySelectorAll('.pd-perm-patch').forEach(btn => {
        btn.addEventListener('click', async () => {
            const app = apps[parseInt(btn.dataset.app, 10)];
            const grant = app?.grants[parseInt(btn.dataset.grant, 10)];
            if (!app || !grant) return;
            if (grant.value === 'ask') return; // nothing stored to clear
            try {
                await setPermission(app.origin, grant.action, 'ask', index);
            } catch (e) {
                console.error('Failed to update permission:', e);
            }
            renderPDPermissions(index);
        });
    });

    // Revoke-all for one app (every action back to "ask").
    container.querySelectorAll('.pd-perm-revoke-all').forEach(btn => {
        btn.addEventListener('click', async () => {
            const app = apps[parseInt(btn.dataset.app, 10)];
            if (!app) return;
            try {
                for (const grant of app.grants) {
                    await setPermission(app.origin, grant.action, 'ask', index);
                }
            } catch (e) {
                console.error('Failed to revoke permissions:', e);
            }
            renderPDPermissions(index);
        });
    });
}

// renderPDBunker(index) — the BUNKER feature-object for one identity, painted
// inline into #pd-bunker. Ported from full_settings.html "Bunker connection" +
// options.js (handleConnectBunker / handleDisconnectBunker / handlePingBunker /
// loadBunkerProfile / renderBunkerProfile / copyBunkerPubKey) and the outgoing
// bunker-server flow (bunkerServer.start / stop / status). Two faces, keyed off
// the profile's own type:
//   • bunker profile → REMOTE signer config: bunker URL + Connect/Disconnect/
//     Ping + live status LED + remote pubkey (its key never touches this browser)
//   • local profile  → CREATE BUNKER URL: turn this identity into a NIP-46 signer
// Everything is keyed on state.detailProfileIndex; handlers are self-contained
// closures bound after each innerHTML paint (mirrors renderRelayList).
async function renderPDBunker(index) {
    const body = $('pd-bunker');
    if (!body) return;
    const profile = await getProfile(index);
    if (!profile) {
        body.innerHTML = '';
        return;
    }
    const type = profile.type || 'local';

    if (type === 'bunker') {
        // --- REMOTE signer (this profile is a bunker profile) ----------------
        const status = await api.runtime.sendMessage({ kind: 'bunker.status', payload: index });
        const connected = !!(status && status.connected);
        const bunkerUrl = profile.bunkerUrl || '';
        let remoteNpub = '';
        if (profile.remotePubkey) {
            remoteNpub = await api.runtime.sendMessage({ kind: 'npubEncode', payload: profile.remotePubkey });
        }

        body.innerHTML = `
            <p class="hint-text">Remote signer (NIP-46). Your private key stays on the bunker server — this browser only relays signing requests.</p>
            <div class="module-row">
                <span class="row-label">Status</span>
                <span class="row-value led-label"><span class="led ${connected ? 'led--green' : 'led--red'}"></span> ${connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <label class="micro-label" for="pd-bunker-url">Bunker URL</label>
            <input id="pd-bunker-url" type="text" class="input input--mono"
                placeholder="bunker://<pubkey>?relay=wss://...&secret=..."
                autocapitalize="off" autocomplete="off" spellcheck="false"
                value="${esc(bunkerUrl)}"${connected ? ' disabled' : ''} />
            <div id="pd-bunker-error" class="warn-strip warn-strip--red hidden" role="alert"></div>
            <div class="flex gap-2 mt-3">
                <button id="pd-bunker-connect" class="button button--primary${connected ? ' hidden' : ''}" type="button">Connect</button>
                <button id="pd-bunker-disconnect" class="button button--danger${connected ? '' : ' hidden'}" type="button">Disconnect</button>
                <button id="pd-bunker-ping" class="button button--sm${connected ? '' : ' hidden'}" type="button">Ping</button>
            </div>
            ${remoteNpub ? `
            <div class="module-row mt-3">
                <span class="row-label">Remote key</span>
                <span class="row-value mono ins-truncate">${esc(remoteNpub)}</span>
            </div>
            <button id="pd-bunker-copy-pubkey" class="button button--sm mt-3" type="button">Copy remote key</button>` : ''}
        `;

        const errBox = $('pd-bunker-error');
        const showErr = (msg) => {
            if (!errBox) return;
            errBox.textContent = msg || '';
            errBox.classList.toggle('hidden', !msg);
        };

        const connectBtn = $('pd-bunker-connect');
        if (connectBtn) {
            connectBtn.addEventListener('click', async () => {
                showErr('');
                const urlInput = $('pd-bunker-url');
                const url = urlInput ? urlInput.value.trim() : '';
                connectBtn.disabled = true;
                connectBtn.textContent = 'Connecting…';
                try {
                    const validation = await api.runtime.sendMessage({ kind: 'bunker.validateUrl', payload: url });
                    if (!validation || !validation.valid) {
                        showErr(validation?.error || 'Invalid bunker URL');
                        connectBtn.disabled = false;
                        connectBtn.textContent = 'Connect';
                        return;
                    }
                    const result = await api.runtime.sendMessage({
                        kind: 'bunker.connect',
                        payload: { profileIndex: index, bunkerUrl: url },
                    });
                    if (result && result.success) {
                        await renderPDBunker(index);
                    } else {
                        showErr((result && result.error) || 'Failed to connect');
                        connectBtn.disabled = false;
                        connectBtn.textContent = 'Connect';
                    }
                } catch (e) {
                    showErr(e.message || 'Connection failed');
                    connectBtn.disabled = false;
                    connectBtn.textContent = 'Connect';
                }
            });
        }

        const disconnectBtn = $('pd-bunker-disconnect');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', async () => {
                showErr('');
                const result = await api.runtime.sendMessage({ kind: 'bunker.disconnect', payload: index });
                if (result && result.success) {
                    await renderPDBunker(index);
                } else {
                    showErr((result && result.error) || 'Failed to disconnect');
                }
            });
        }

        const pingBtn = $('pd-bunker-ping');
        if (pingBtn) {
            pingBtn.addEventListener('click', async () => {
                showErr('');
                const result = await api.runtime.sendMessage({ kind: 'bunker.ping', payload: index });
                if (!result || !result.success) {
                    showErr((result && result.error) || 'Ping failed');
                    await renderPDBunker(index);
                }
            });
        }

        const copyBtn = $('pd-bunker-copy-pubkey');
        if (copyBtn && remoteNpub) {
            copyBtn.addEventListener('click', async () => {
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(remoteNpub);
                    } else {
                        await api.runtime.sendMessage({ kind: 'copy', payload: remoteNpub });
                    }
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => { copyBtn.textContent = 'Copy remote key'; }, 1500);
                } catch (_) {}
            });
        }
        return;
    }

    // --- LOCAL profile: offer "Create Bunker URL" (outgoing NIP-46 signer) ----
    // Plain-language explainer — the real gap is that nobody's sure WHEN to use
    // a bunker. Always visible (not an accordion), sits above the control.
    const bunkerExplainer = `
        <div class="bunker-explainer">
            <div class="micro-label">Sign in without sharing your key</div>
            <p class="hint-text">Log in to Nostr apps without handing over your keys. Your private key stays here — the app sends signing requests to NostrKey and gets back only the signature. It's an optional, advanced convenience.</p>
            <div class="micro-label">When you'd use it</div>
            <ul>
                <li>Logging into a Nostr <strong>web</strong> app (Coracle, Nostrudel, nsec.app) where you haven't installed this extension.</li>
                <li>Using one identity across several apps or devices without copying your nsec around.</li>
                <li>On mobile or a shared computer where extension signing isn't available.</li>
            </ul>
            <p class="hint-text">Create a URL below, then in a Nostr web app choose "Log in with a bunker / NIP-46 URL" and paste it — you'll get an approval prompt here for each action. The easiest place to try your URL is the live demo page.</p>
            <p class="hint-text">New to bunkers? Watch one connect live at <a class="link-quiet" href="https://nostrkey.com/test-bunker.html" target="_blank" rel="noopener noreferrer">nostrkey.com/test-bunker.html</a>.</p>
        </div>
    `;

    // The bunker server signs with the ACTIVE identity's key (background uses
    // getPubKey()), so only offer it while this profile is the active one —
    // otherwise the URL would sign as a different identity than the one shown.
    if (index !== state.profileIndex) {
        body.innerHTML = `
            ${bunkerExplainer}
            <div class="warn-strip warn-strip--amber" role="alert">A bunker URL signs as your active identity. Select this profile on Home first, then create its bunker URL here.</div>
        `;
        return;
    }

    let srv = null;
    try {
        srv = await api.runtime.sendMessage({ kind: 'bunkerServer.status' });
    } catch (_) {}
    const srvActive = !!(srv && srv.active);
    state.bunkerServerActive = srvActive;

    body.innerHTML = `
        ${bunkerExplainer}
        ${srvActive ? `
        <div class="bunker-live-row">
            <span class="led led--signal led--pulse" aria-hidden="true"></span>
            <span class="bunker-live-text">Live</span>
        </div>
        <div class="bunker-uri-row is-live">
            <code id="pd-bunker-srv-uri" class="bunker-uri">${esc(srv.uri || '')}</code>
            <button id="pd-bunker-srv-copy" class="button button--sm" type="button">Copy</button>
        </div>
        <div class="warn-strip warn-strip--red mb-12px" role="alert">Never share this URL. Anyone with it can sign events as you.</div>
        <button id="pd-bunker-srv-stop" class="button button--danger w-full" type="button">Disconnect</button>
        ` : `
        <button id="pd-bunker-srv-start" class="button button--primary w-full" type="button">Create Bunker URL</button>
        `}
    `;

    const startBtn = $('pd-bunker-srv-start');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            startBtn.disabled = true;
            startBtn.textContent = 'Creating…';
            try {
                const result = await api.runtime.sendMessage({
                    kind: 'bunkerServer.start',
                    payload: { relayUrls: ['wss://relay.nostrkey.com'] },
                });
                if (!result || !result.success) throw new Error(result?.error || 'Failed');
                state.bunkerServerActive = true;
                if (typeof renderSecurityMeter === 'function') renderSecurityMeter();
                await renderPDBunker(index);
            } catch (e) {
                console.error('Bunker start error:', e);
                startBtn.disabled = false;
                startBtn.textContent = 'Create Bunker URL';
            }
        });
    }

    const stopBtn = $('pd-bunker-srv-stop');
    if (stopBtn) {
        stopBtn.addEventListener('click', async () => {
            try {
                await api.runtime.sendMessage({ kind: 'bunkerServer.stop' });
            } catch (_) {}
            state.bunkerServerActive = false;
            if (typeof renderSecurityMeter === 'function') renderSecurityMeter();
            await renderPDBunker(index);
        });
    }

    const copySrvBtn = $('pd-bunker-srv-copy');
    if (copySrvBtn) {
        copySrvBtn.addEventListener('click', async () => {
            const uriEl = $('pd-bunker-srv-uri');
            const uri = uriEl ? uriEl.textContent : '';
            if (!uri) return;
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(uri);
                } else {
                    await api.runtime.sendMessage({ kind: 'copy', payload: uri });
                }
                copySrvBtn.textContent = 'Copied!';
                setTimeout(() => { copySrvBtn.textContent = 'Copy'; }, 1500);
            } catch (_) {}
        });
    }
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
    // Editing is always entered from the Manage Profiles (profile-view) screen,
    // so back/cancel and save should return there.
    state.editReturnView = 'profile-view';
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
    // Debounce — prevent rapid double-clicks
    if (state._saving) return;
    state._saving = true;
    if (elements.saveProfileBtn) elements.saveProfileBtn.disabled = true;

    const name = elements.editProfileName?.value?.trim();
    if (!name) {
        showProfileError('Please enter a profile name');
        state._saving = false;
        if (elements.saveProfileBtn) elements.saveProfileBtn.disabled = false;
        return;
    }

    try {
        if (state.editingProfileIndex === null) {
            // Creating new profile
            const key = elements.editProfileKey?.value?.trim();
            if (!key) {
                showProfileError('Please enter or generate a private key');
                state._saving = false;
                if (elements.saveProfileBtn) elements.saveProfileBtn.disabled = false;
                return;
            }

            // Duplicate check — see if this nsec/npub already exists
            const profiles = await getProfiles();
            for (let i = 0; i < profiles.length; i++) {
                const existingNsec = await api.runtime.sendMessage({ kind: 'getNsec', payload: i });
                if (existingNsec && existingNsec === key) {
                    showProfileError('This key already exists in profile "' + (profiles[i].name || 'Unnamed') + '"');
                    state._saving = false;
                    if (elements.saveProfileBtn) elements.saveProfileBtn.disabled = false;
                    return;
                }
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
        
        // Reload, then return to the Manage Profiles screen (showing the new/
        // edited profile) when the flow started there, else Home.
        const returnView = state.editReturnView;
        const savedIndex = state.editingProfileIndex !== null
            ? state.editingProfileIndex
            : state.profileIndex;
        setTimeout(async () => {
            await loadUnlockedState();
            if (returnView === 'profile-view') {
                await openProfileView(savedIndex);
            } else {
                switchViewDirect('home');
            }
            showBackupPrompt();
        }, 800);
    } catch (e) {
        showProfileError('Failed to save profile: ' + e.message);
    } finally {
        state._saving = false;
        if (elements.saveProfileBtn) elements.saveProfileBtn.disabled = false;
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
            showBackupPrompt();
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
        elements.editProfileName.style.borderColor = '#f87171';
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

async function backToProfiles() {
    // Return to wherever the add/edit form was opened from: the Manage Profiles
    // screen (view-profile-view) when the flow started there, else Home.
    if (state.editReturnView === 'profile-view') {
        const idx = state.editingProfileIndex !== null
            ? state.editingProfileIndex
            : state.profileIndex;
        await openProfileView(idx);
    } else {
        switchViewDirect('home');
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
        ctx.fillStyle = '#16181D';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 16);
        ctx.fill();
        
        // Profile name
        const profileName = state.profileNames[state.profileIndex] || 'Nostr Profile';
        ctx.fillStyle = '#E7E9EE';
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
    showBackupPrompt();
}

async function noThanks() {
    await toggleRelayReminder();
    state.showRelayReminder = false;
    render();
}

function openOptions() {
    openUrl('full_settings.html');
}

// Open an extension page, REUSING its existing tab instead of popping a new one
// every time. We remember one tab id per page path in storage.local (no "tabs"
// permission needed — we never read tab URLs, only focus/navigate ids we own).
async function openUrl(path) {
    const url = api.runtime.getURL(path);
    try {
        if (api.tabs && api.tabs.create && api.tabs.get && api.tabs.update) {
            const store = await api.storage.local.get('_pageTabs');
            const map = store._pageTabs || {};
            const existingId = map[path];
            if (existingId != null) {
                try {
                    await api.tabs.get(existingId);               // throws if the tab is gone
                    await api.tabs.update(existingId, { url, active: true });
                    const tab = await api.tabs.get(existingId);
                    if (tab && tab.windowId != null && api.windows && api.windows.update) {
                        await api.windows.update(tab.windowId, { focused: true });
                    }
                    return;                                        // reused the same tab
                } catch (_) { /* tab closed — fall through and open a fresh one */ }
            }
            const tab = await api.tabs.create({ url });
            map[path] = tab.id;
            await api.storage.local.set({ _pageTabs: map });
            return;
        }
    } catch (_) { /* fall through to the simplest path */ }
    if (api.tabs && api.tabs.create) {
        api.tabs.create({ url });
    } else {
        window.open(url, 'nostrkey-options');
    }
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

// Human "how long ago" for the backup-freshness line.
function formatSince(ts) {
    if (!ts) return null;
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 45) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
    const mo = Math.floor(d / 30);
    return `${mo} month${mo === 1 ? '' : 's'} ago`;
}

function renderBackupFreshness(status) {
    const el = elements.backupFreshness;
    if (!el) return;
    el.classList.remove('status-line--warn');
    if (status.dirty) {
        // Accounts changed since the last backup → the nudge.
        el.textContent = status.lastBackupAt
            ? `⚠ Accounts changed since your last backup (${formatSince(status.lastBackupAt)}) — back up now.`
            : '⚠ You have accounts but no backup yet — back up now.';
        el.classList.add('status-line--warn');
    } else if (status.lastBackupAt) {
        el.textContent = `Last backed up ${formatSince(status.lastBackupAt)}.`;
    } else {
        el.textContent = 'No backup yet.';
    }
}

async function loadCloudBackupState() {
    if (!elements.cloudBackupCard) return;
    let status;
    try {
        status = await getCloudStatus();
    } catch {
        status = { available: false };
    }
    // On browsers without a directory picker, present it as manual save/restore
    // rather than hiding it — the same folder idea, the user just confirms each.
    if (elements.cloudBackupToggle) elements.cloudBackupToggle.checked = !!status.enabled;
    if (elements.cloudBackupActions) {
        elements.cloudBackupActions.classList.toggle('hidden', !status.enabled);
    }
    renderBackupFreshness(status);
    renderCloudBackupStatus(status);
}

// First-run offer: pitch auto folder-backup once, on browsers where it's silent.
let cloudOfferShownThisSession = false;
async function maybeShowCloudBackupOffer() {
    if (cloudOfferShownThisSession) return;
    if (!state.hasPassword || state.isLocked) return;
    if (!elements.cloudBackupPrompt) return;
    let status;
    try { status = await getCloudStatus(); } catch { return; }
    if (!status.silent || status.enabled) return;      // only where auto-save works
    if (await hasDecidedCloudBackup()) return;          // already chose / dismissed
    cloudOfferShownThisSession = true;
    elements.cloudBackupPrompt.classList.remove('hidden');
}

async function dismissCloudBackupOffer() {
    if (elements.cloudBackupPrompt) elements.cloudBackupPrompt.classList.add('hidden');
    await markCloudBackupOffered();
}

async function acceptCloudBackupOffer() {
    // This click is the user gesture the folder picker requires.
    await markCloudBackupOffered();
    const res = await enableCloudBackup();
    if (elements.cloudBackupPrompt) elements.cloudBackupPrompt.classList.add('hidden');
    if (res.ok) {
        await loadCloudBackupState();
        renderSecurityMeter();
    }
}

function renderCloudBackupStatus(status) {
    if (!elements.cloudBackupStatus) return;
    let text;
    if (!status.enabled) {
        text = status.silent
            ? 'Off — pick a folder to auto-save an encrypted copy.'
            : 'Off — save an encrypted copy to a folder you choose.';
    } else if (status.needsPermission) {
        text = `Reconnect needed — click Save now to re-grant access${status.folderName ? ` to “${status.folderName}”` : ''}.`;
    } else {
        const where = status.folderName ? `“${status.folderName}”` : 'your chosen folder';
        const when = status.lastWriteAt
            ? ` · last saved ${new Date(status.lastWriteAt).toLocaleString()}`
            : '';
        text = status.silent
            ? `On — auto-saving to ${where}${when}.`
            : `On — save/restore manually to ${where}${when}.`;
    }
    elements.cloudBackupStatus.textContent = text;
}

async function onCloudBackupToggle() {
    const want = elements.cloudBackupToggle.checked;
    elements.cloudBackupToggle.disabled = true;
    try {
        if (want) {
            // enable requires a user gesture on Chromium (this click is one)
            const res = await enableCloudBackup();
            if (!res.ok) {
                elements.cloudBackupToggle.checked = false;
                if (res.error && res.error !== 'cancelled') {
                    elements.cloudBackupStatus.textContent = res.error;
                }
            }
        } else {
            await disableCloudBackup();
        }
    } finally {
        elements.cloudBackupToggle.disabled = false;
        await loadCloudBackupState();
    }
}

async function onCloudSaveNow() {
    if (!elements.cloudBackupNowBtn) return;
    elements.cloudBackupNowBtn.disabled = true;
    const prev = elements.cloudBackupNowBtn.textContent;
    elements.cloudBackupNowBtn.textContent = 'Saving…';
    try {
        const res = await cloudBackupNow();
        if (!res.ok) {
            elements.cloudBackupStatus.textContent = res.error || 'Save failed.';
        }
    } finally {
        elements.cloudBackupNowBtn.textContent = prev;
        elements.cloudBackupNowBtn.disabled = false;
        await loadCloudBackupState();
    }
}

async function onCloudDoRestore() {
    const pw = elements.cloudRestorePassword?.value?.trim();
    if (elements.cloudRestoreError) elements.cloudRestoreError.classList.add('hidden');
    if (elements.cloudRestoreSuccess) elements.cloudRestoreSuccess.classList.add('hidden');
    const res = await restoreFromCloud(pw);
    if (!res.ok) {
        if (elements.cloudRestoreError) {
            elements.cloudRestoreError.textContent = res.error || 'Restore failed.';
            elements.cloudRestoreError.classList.remove('hidden');
        }
        return;
    }
    if (elements.cloudRestoreSuccess) {
        elements.cloudRestoreSuccess.textContent = `Restored ${res.profileCount} profile(s). Reloading…`;
        elements.cloudRestoreSuccess.classList.remove('hidden');
    }
    setTimeout(() => location.reload(), 1200);
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
        loadCloudBackupState();
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
        elements.relayList.innerHTML = '<p class="empty-note">No relays configured.</p>';
        return;
    }
    elements.relayList.innerHTML = state.relays.map((relay, i) => `
        <div class="relay-row">
            <span class="relay-url" title="${esc(relay.url)}">${esc(relay.url)}</span>
            <button class="button button--sm button--danger relay-delete-btn" data-index="${i}">Delete</button>
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
            showBackupPrompt();
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
    showBackupPrompt();
}

// --- Backup / Restore ---
let backupPromptShownThisSession = false;
let backupAutoDismissTimer = null;

async function showBackupPrompt() {
    // Accounts just changed: mark a backup due, and refresh the encrypted folder
    // copy if it's on (self-guards on enabled + silent target; manual no-ops).
    noteAccountsChanged();
    scheduleCloudBackup();
    if (backupPromptShownThisSession) return;
    if (!state.hasPassword || state.isLocked) return;
    // If auto folder-backup is active and healthy, the change is already being
    // saved silently — don't nag. Otherwise fall through to the reminder.
    try {
        const s = await getCloudStatus();
        if (s.enabled && s.silent && s.connected && !s.needsPermission) return;
    } catch { /* fall through to the reminder */ }
    if (!elements.backupPrompt) return;
    backupPromptShownThisSession = true;
    elements.backupPrompt.classList.remove('hidden');
    backupAutoDismissTimer = setTimeout(dismissBackupPrompt, 30000);
}

function dismissBackupPrompt() {
    if (backupAutoDismissTimer) {
        clearTimeout(backupAutoDismissTimer);
        backupAutoDismissTimer = null;
    }
    if (elements.backupPrompt) {
        elements.backupPrompt.classList.add('hidden');
    }
}

async function doBackupExport() {
    try {
        const result = await api.runtime.sendMessage({ kind: 'backup.export' });
        if (!result || !result.success) {
            console.error('Backup export failed:', result?.error);
            return;
        }
        const json = JSON.stringify(result.envelope, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `nostrkey-backup-${date}.json`;
        a.click();
        // Delay revoke — Safari/Firefox popups can close before download completes
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        // Record the backup moment — this is the L1 rung of the security ladder
        try {
            state.lastBackupAt = Date.now();
            await api.storage.local.set({ lastBackupAt: state.lastBackupAt });
        } catch {}
        renderSecurityMeter();
        dismissBackupPrompt();
    } catch (e) {
        console.error('Backup export error:', e);
    }
}

async function doBackupImport(passwordEl, fileEl, errorEl, successEl) {
    const password = passwordEl?.value?.trim();
    const file = fileEl?.files?.[0];
    if (errorEl) { errorEl.classList.add('hidden'); errorEl.textContent = ''; }
    if (successEl) { successEl.classList.add('hidden'); successEl.textContent = ''; }
    if (!password) {
        if (errorEl) { errorEl.textContent = 'Please enter the master password'; errorEl.classList.remove('hidden'); }
        return;
    }
    if (!file) {
        if (errorEl) { errorEl.textContent = 'Please select a backup file'; errorEl.classList.remove('hidden'); }
        return;
    }
    try {
        const text = await file.text();
        let envelope;
        try {
            envelope = JSON.parse(text);
        } catch (_) {
            if (errorEl) { errorEl.textContent = 'Invalid file — not valid JSON'; errorEl.classList.remove('hidden'); }
            return;
        }
        const result = await api.runtime.sendMessage({
            kind: 'backup.import',
            payload: { envelope, password },
        });
        if (!result || !result.success) {
            if (errorEl) { errorEl.textContent = result?.error || 'Restore failed'; errorEl.classList.remove('hidden'); }
            return;
        }
        if (successEl) {
            successEl.textContent = `Restored ${result.profileCount} profile(s). Reloading...`;
            successEl.classList.remove('hidden');
        }
        setTimeout(() => location.reload(), 1200);
    } catch (e) {
        if (errorEl) { errorEl.textContent = e.message || 'Restore failed'; errorEl.classList.remove('hidden'); }
    }
}

async function loadPermissionsView() {
    // Read the per-(app × action × kind) grant matrix straight from the
    // profile record (same source options.js uses). Shape:
    //   { "<origin>": { "signEvent:1": "allow", "getPubKey": "allow", ... } }
    try {
        const hosts = await getPermissions(state.profileIndex);
        state.permissions = Object.entries(hosts || {}).map(([origin, grants]) => ({
            origin,
            grants: Object.entries(grants || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([action, value]) => ({ action, value })),
        })).sort((a, b) => a.origin.localeCompare(b.origin));
        renderPermissionsList();
    } catch {
        state.permissions = [];
        renderPermissionsList();
    }
    checkBunkerServerStatus();
}

// Tier-B / risky grants: deletes, follow-list, DMs + decryption
function isRiskyGrant(action) {
    if (/decrypt/i.test(action)) return true;
    if (action.startsWith('signEvent:')) {
        const k = parseInt(action.split(':')[1], 10);
        return [3, 4, 5, 13, 14, 1059].includes(k);
    }
    return false;
}

function grantKindNum(action) {
    if (!action.startsWith('signEvent:')) return null;
    const k = parseInt(action.split(':')[1], 10);
    return Number.isNaN(k) ? null : k;
}

function grantLabel(action) {
    const k = grantKindNum(action);
    if (k !== null) {
        return KINDS.find(e => e[0] === k)?.[1] || `Unknown kind`;
    }
    return humanPermission(action);
}

function renderPermissionsList() {
    if (!elements.permissionsList) return;
    if (!state.permissions || state.permissions.length === 0) {
        elements.permissionsList.innerHTML =
            '<p class="empty-note">No apps connected yet. When you approve a request, ' +
            'a patch point appears here for that app and kind only.</p>';
        return;
    }
    elements.permissionsList.innerHTML = state.permissions.map((app, ai) => {
        const points = app.grants.map((g, gi) => {
            const risky = isRiskyGrant(g.action);
            const kindNum = grantKindNum(g.action);
            const allowed = g.value === 'allow';
            const denied = g.value === 'deny' || g.value === 'reject';
            const stateWord = allowed ? 'ALLOW' : denied ? 'DENY' : 'ASK';
            const title = allowed
                ? 'Granted — click to revoke (back to ask)'
                : denied
                    ? 'Denied — click to clear (back to ask)'
                    : 'Will ask each time';
            return `
            <button type="button"
                class="patch-point perm-patch${risky ? ' patch-point--danger' : ''}${denied ? ' patch-point--denied' : ''}"
                aria-pressed="${allowed ? 'true' : 'false'}"
                data-app="${ai}" data-grant="${gi}"
                title="${esc(title)}">
                <span class="patch-jack" aria-hidden="true"></span>
                ${kindNum !== null ? `<span class="kind-num mono">${kindNum}</span>` : ''}
                <span>${esc(grantLabel(g.action))}</span>
                <span class="patch-state mono">${stateWord}</span>
            </button>`;
        }).join('');
        return `
        <div class="app-module">
            <div class="module-header">
                <span class="app-origin" title="${esc(app.origin)}">${esc(app.origin)}</span>
                <span class="header-end">
                    <span class="led led--green" aria-label="Connected"></span>
                    <button type="button" class="button button--sm button--muted perm-revoke-all" data-app="${ai}" title="Revoke every grant for this app">Revoke all</button>
                </span>
            </div>
            <div class="patch-bay">${points || '<p class="empty-note">No grants stored.</p>'}</div>
        </div>`;
    }).join('');

    // Patch-point click = clear the stored decision (revert to default-deny "ask")
    elements.permissionsList.querySelectorAll('.perm-patch').forEach(btn => {
        btn.addEventListener('click', async () => {
            const app = state.permissions[parseInt(btn.dataset.app, 10)];
            const grant = app?.grants[parseInt(btn.dataset.grant, 10)];
            if (!app || !grant) return;
            if (grant.value === 'ask') return; // nothing stored to clear
            try {
                await setPermission(app.origin, grant.action, 'ask');
            } catch (e) {
                console.error('Failed to update permission:', e);
            }
            await loadPermissionsView();
        });
    });

    // Revoke-all for one app
    elements.permissionsList.querySelectorAll('.perm-revoke-all').forEach(btn => {
        btn.addEventListener('click', async () => {
            const app = state.permissions[parseInt(btn.dataset.app, 10)];
            if (!app) return;
            try {
                for (const grant of app.grants) {
                    await setPermission(app.origin, grant.action, 'ask');
                }
            } catch (e) {
                console.error('Failed to revoke permissions:', e);
            }
            await loadPermissionsView();
        });
    });
}

// Outgoing bunker-server status \u2014 the interactive UI now lives on the profile
// detail's Bunker feature-object (renderPDBunker). This keeps only the
// meter-facing state fresh (L3 lights when a bunker URL is live) without
// touching any DOM, so the Home security meter stays accurate regardless of
// which view is open.
async function checkBunkerServerStatus() {
    try {
        const status = await api.runtime.sendMessage({ kind: 'bunkerServer.status' });
        state.bunkerServerActive = !!(status && status.active);
        renderSecurityMeter();
    } catch {
        // Extension may not support it yet
    }
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
    
    // Add profile button (Home) — routes into the Manage Profiles context
    if (elements.addProfileBtn) {
        elements.addProfileBtn.addEventListener('click', openAddProfileFromHome);
    }

    // Add profile button (on the Manage Profiles screen itself)
    if (elements.addProfileFromViewBtn) {
        elements.addProfileFromViewBtn.addEventListener('click', () => openAddProfile('profile-view'));
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

    // Delete from profile view
    const deleteFromViewBtn = document.getElementById('delete-from-view-btn');
    if (deleteFromViewBtn) {
        deleteFromViewBtn.addEventListener('click', async () => {
            if (state.viewingProfileIndex === null) return;
            if (state.profileNames.length <= 1) return;
            if (!confirm('Delete this profile? This cannot be undone.')) return;
            try {
                await deleteProfile(state.viewingProfileIndex);
                await loadUnlockedState();
                switchViewDirect('home');
                showBackupPrompt();
            } catch (e) {
                console.error('Failed to delete profile:', e);
            }
        });
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

    // (Outgoing bunker-server controls are bound inside renderPDBunker.)

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
    if (elements.openNostrkeysBtn) {
        elements.openNostrkeysBtn.addEventListener('click', () => openUrl('nostr-keys/nostr-keys.html'));
    }
    // Security meter strip on Home → security settings (raise your level)
    const homeSecurityStrip = $('home-security-strip');
    if (homeSecurityStrip) {
        homeSecurityStrip.addEventListener('click', () => openUrl('security/security.html'));
    }

    if (elements.settingsSecurityBtn) {
        elements.settingsSecurityBtn.addEventListener('click', () => openUrl('security/security.html#master-password'));
    }
    if (elements.settingsAutolockBtn) {
        elements.settingsAutolockBtn.addEventListener('click', () => openUrl('security/security.html#autolock'));
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

    // Manage Profiles (full-screen page)
    const manageProfilesBtn = document.getElementById('manage-profiles-btn');
    if (manageProfilesBtn) {
        manageProfilesBtn.addEventListener('click', () => openUrl('profiles/profiles.html'));
    }

    // Backup / Restore listeners
    if (elements.backupSaveBtn) {
        elements.backupSaveBtn.addEventListener('click', doBackupExport);
    }
    if (elements.backupDismissBtn) {
        elements.backupDismissBtn.addEventListener('click', dismissBackupPrompt);
    }
    if (elements.downloadBackupBtn) {
        elements.downloadBackupBtn.addEventListener('click', doBackupExport);
    }
    // Lock screen restore
    if (elements.restoreBackupBtn) {
        elements.restoreBackupBtn.addEventListener('click', () => {
            elements.restoreBackupPanel?.classList.toggle('hidden');
        });
    }
    if (elements.cancelRestoreBtn) {
        elements.cancelRestoreBtn.addEventListener('click', () => {
            elements.restoreBackupPanel?.classList.add('hidden');
        });
    }
    if (elements.doRestoreBtn) {
        elements.doRestoreBtn.addEventListener('click', () => {
            doBackupImport(elements.restorePassword, elements.restoreFile, elements.restoreError, elements.restoreSuccess);
        });
    }
    // First-run restore
    if (elements.firstrunRestoreBtn) {
        elements.firstrunRestoreBtn.addEventListener('click', () => {
            elements.firstrunRestorePanel?.classList.toggle('hidden');
        });
    }
    if (elements.firstrunDoRestoreBtn) {
        elements.firstrunDoRestoreBtn.addEventListener('click', () => {
            doBackupImport(elements.firstrunRestorePassword, elements.firstrunRestoreFile, elements.firstrunRestoreError, elements.firstrunRestoreSuccess);
        });
    }

    // Sync toggle
    if (elements.syncToggle) {
        elements.syncToggle.addEventListener('change', async () => {
            await setSyncEnabled(elements.syncToggle.checked);
            updateSyncStatusText(elements.syncToggle.checked);
        });
    }
    // Cloud backup (folder)
    if (elements.cloudBackupToggle) {
        elements.cloudBackupToggle.addEventListener('change', onCloudBackupToggle);
    }
    if (elements.cloudBackupNowBtn) {
        elements.cloudBackupNowBtn.addEventListener('click', onCloudSaveNow);
    }
    if (elements.cloudBackupRestoreBtn) {
        elements.cloudBackupRestoreBtn.addEventListener('click', () => {
            elements.cloudRestorePanel?.classList.toggle('hidden');
        });
    }
    if (elements.cloudCancelRestoreBtn) {
        elements.cloudCancelRestoreBtn.addEventListener('click', () => {
            elements.cloudRestorePanel?.classList.add('hidden');
            if (elements.cloudRestorePassword) elements.cloudRestorePassword.value = '';
        });
    }
    if (elements.cloudDoRestoreBtn) {
        elements.cloudDoRestoreBtn.addEventListener('click', onCloudDoRestore);
    }
    if (elements.cloudOfferEnableBtn) {
        elements.cloudOfferEnableBtn.addEventListener('click', acceptCloudBackupOffer);
    }
    if (elements.cloudOfferDismissBtn) {
        elements.cloudOfferDismissBtn.addEventListener('click', dismissCloudBackupOffer);
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
                resultEl.style.background = '#1E2128';
                resultEl.style.color = '#8A90A0';
                resultEl.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error('checkForExistingVault error:', e);
        if (resultEl) {
            resultEl.textContent = 'Could not check — try again in a moment.';
            resultEl.style.background = '#1E2128';
            resultEl.style.color = '#f59e0b';
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

    // Version readouts (moved from inline <script> — MV3 CSP blocks inline JS).
    // Use the raw namespace: the browser-polyfill wrapper has no getManifest().
    try {
        const raw = (typeof browser !== 'undefined' && browser.runtime) ? browser
            : (typeof chrome !== 'undefined' && chrome.runtime) ? chrome : null;
        const v = raw ? 'v' + raw.runtime.getManifest().version : '';
        const lockedVersion = $('locked-version');
        const settingsVersion = $('settings-version');
        if (lockedVersion) lockedVersion.textContent = v;
        if (settingsVersion) settingsVersion.textContent = v;
    } catch {}

    // Last backup marker — feeds the L0→L3 security meter (L1 = backed up)
    try {
        const stored = await api.storage.local.get('lastBackupAt');
        state.lastBackupAt = stored?.lastBackupAt || 0;
    } catch {}

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
        if (message.kind === 'backupNeeded') {
            showBackupPrompt();
        }
    });

    if (!state.isLocked) {
        await loadUnlockedState();
    } else {
        render();
    }
}

document.addEventListener('DOMContentLoaded', init);
