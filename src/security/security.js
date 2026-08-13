import { api } from '../utilities/browser-polyfill';
import { insConfirm, insNotice } from '../ins-confirm.js';

const state = {
    isLocked: false,
    hasPassword: false,
    // Stranded-key signal (single channel: hasEncryptedData). strandedKeys is the
    // count of profile keys wrapped under a master password no verifier can open;
    // hasPasswordHash is whether a verifier is on disk. Both come from the
    // background module so every surface reads the same truth.
    strandedKeys: 0,
    hasPasswordHash: false,
    // Unlock
    unlockError: '',
    // Set password
    newPassword: '',
    confirmPassword: '',
    securityError: '',
    // Change password
    currentPassword: '',
    newPasswordChange: '',
    confirmPasswordChange: '',
    changeError: '',
    // Remove password
    removePasswordInput: '',
    removeError: '',
    // Shared page-level success
    pageSuccess: '',
    // Auto-lock
    autoLockMinutes: 15,
    autolockSuccess: '',
    // Trust ladder (L0→L3 level-meter)
    profileName: '',
    profileNpub: '',
    isBunkerProfile: false,
    bunkerActive: false,
    lastBackupAt: null,
    backupError: '',
};

function $(id) { return document.getElementById(id); }

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

// --- Trust ladder (L0 working key · L1 backed up · L2 encrypted+auto-lock ·
// L3 remote signer). The meter shows the HIGHEST achieved level; skipped
// lower rungs stay amber so the gap is visible and actionable.
function trustAchievements() {
    return {
        l1: !!state.lastBackupAt,
        l2: state.hasPassword && state.autoLockMinutes > 0,
        l3: state.bunkerActive || state.isBunkerProfile,
    };
}

function trustLevel() {
    const a = trustAchievements();
    if (a.l3) return 3;
    if (a.l2) return 2;
    if (a.l1) return 1;
    return 0;
}

function renderRung(n, achieved, level) {
    const rung = $(`rung-l${n}`);
    const led = $(`rung-l${n}-led`);
    const stateEl = $(`rung-l${n}-state`);
    if (rung) rung.dataset.achieved = achieved ? 'true' : 'false';
    if (led) {
        // achieved = green LED · skipped (below current level) = amber · not
        // yet reached = off. Green is a status LED only, per design system.
        led.className = achieved
            ? 'led led--green'
            : (n < level ? 'led led--amber' : 'led led--off');
    }
    if (stateEl) stateEl.textContent = achieved ? 'OK' : '—';
}

function renderTrust() {
    const a = trustAchievements();
    const level = trustLevel();

    const meter = $('trust-meter');
    if (meter) {
        meter.dataset.level = String(level);
        meter.setAttribute('aria-label', `Security level ${level} of 3`);
    }
    const readout = $('trust-level-readout');
    if (readout) readout.textContent = `L${level}`;

    renderRung(1, a.l1, level);
    renderRung(2, a.l2, level);
    renderRung(3, a.l3, level);

    // L1 level-up action: encrypted backup needs a master password; until
    // then, point at the key-export path instead of showing a dead button.
    const backupBtn = $('backup-export-btn');
    const l1Hint = $('rung-l1-hint');
    /* 'inline-flex' matches .btn base display (instrument.css); '' would lose
       to the #backup-export-btn stylesheet rule that replaced its inline style. */
    if (backupBtn) backupBtn.style.display = state.hasPassword ? 'inline-flex' : 'none';
    if (l1Hint) {
        l1Hint.textContent = state.hasPassword
            ? 'Level up: download an encrypted backup of your vault and store it somewhere safe.'
            : 'Level up: set a master password first, then download an encrypted backup here — or export your key from the NostrKey panel and store it safely.';
    }
    const backupErr = $('backup-error');
    if (backupErr) {
        backupErr.textContent = state.backupError;
        backupErr.style.display = state.backupError ? 'block' : 'none';
    }

    // L2 action refinement: password set but auto-lock disabled.
    const l2Action = $('rung-l2-action');
    if (l2Action) {
        l2Action.textContent = (state.hasPassword && state.autoLockMinutes === 0)
            ? 'Level up: auto-lock is set to Never — pick an interval below to reach L2.'
            : 'Level up: set a master password below, then pick an auto-lock interval.';
    }

    // Channel strip: identity + status LED.
    const nameText = $('strip-name-text');
    if (nameText) nameText.textContent = state.profileName || 'Profile';
    const npubEl = $('strip-npub');
    if (npubEl) npubEl.textContent = state.profileNpub || 'no key on this profile';
    const stripLed = $('strip-led');
    if (stripLed) {
        stripLed.className = state.hasPassword ? 'led led--green' : 'led led--amber';
    }

    // Module-header LEDs (master password / auto-lock).
    const pwLed = $('password-led');
    if (pwLed) pwLed.className = state.hasPassword ? 'led led--green' : 'led led--off';
    const alLed = $('autolock-led');
    if (alLed) {
        alLed.className = (state.hasPassword && state.autoLockMinutes > 0)
            ? 'led led--green' : 'led led--off';
    }
}

function showPageSuccess(msg) {
    state.pageSuccess = msg;
    render();
    setTimeout(() => { state.pageSuccess = ''; render(); }, 5000);
}

function render() {
    // Locked vs unlocked views
    const lockedView = $('locked-view');
    const unlockedView = $('unlocked-view');
    if (lockedView) lockedView.style.display = state.isLocked ? 'block' : 'none';
    if (unlockedView) unlockedView.style.display = state.isLocked ? 'none' : 'block';

    // Recover affordance in the locked view: only when the lock is really an
    // old-password stranding (no verifier on disk), never for a normal vault.
    const strandedHint = $('stranded-recover-hint');
    if (strandedHint) {
        const stranded = state.strandedKeys > 0 && !state.hasPasswordHash;
        strandedHint.style.display = stranded ? '' : 'none';
    }

    // Unlock error
    const unlockErr = $('unlock-error');
    if (unlockErr) { unlockErr.textContent = state.unlockError; unlockErr.style.display = state.unlockError ? 'block' : 'none'; }

    // Page-level success banner
    const pageSuc = $('page-success');
    if (pageSuc) { pageSuc.textContent = state.pageSuccess; pageSuc.style.display = state.pageSuccess ? 'block' : 'none'; }

    // Security status
    const securityStatus = $('security-status');
    if (securityStatus) {
        if (state.hasPassword) {
            securityStatus.textContent = 'Master password is active. Your keys are encrypted at rest.';
        } else if (state.strandedKeys > 0) {
            // No verifier on disk, but some keys are still wrapped under a master
            // password that is gone. They are neither open nor unencrypted.
            securityStatus.textContent = 'Some keys are protected by a master password that is no longer on file. Unlock to recover them with that old password.';
        } else {
            // Passwordless default is NOT plaintext: keys are device-key encrypted.
            securityStatus.textContent = 'No master password set. Your keys are still encrypted at rest with a device key.';
        }
    }

    // Toggle sections based on password state
    const setSection = $('set-password-section');
    const changeSection = $('change-password-section');
    if (setSection) setSection.style.display = state.hasPassword ? 'none' : 'block';
    if (changeSection) changeSection.style.display = state.hasPassword ? 'block' : 'none';

    // Password strength
    const strengthEl = $('password-strength');
    if (strengthEl) {
        if (state.newPassword) {
            const strength = calculatePasswordStrength(state.newPassword);
            const labels = ['', 'Too short', 'Weak', 'Fair', 'Strong', 'Very strong'];
            strengthEl.textContent = labels[strength] || '';
            strengthEl.className = `field-hint strength-${strength}`;
            strengthEl.style.display = 'block';
        } else {
            strengthEl.style.display = 'none';
        }
    }

    // Set password button
    const setBtn = $('set-password-btn');
    if (setBtn) {
        setBtn.disabled = !(state.newPassword.length >= 8 && state.newPassword === state.confirmPassword);
    }

    // Change password button
    const changeBtn = $('change-password-btn');
    if (changeBtn) {
        changeBtn.disabled = !(state.currentPassword.length > 0 &&
            state.newPasswordChange.length >= 8 &&
            state.newPasswordChange === state.confirmPasswordChange);
    }

    // Remove password button
    const removeBtn = $('remove-password-btn');
    if (removeBtn) {
        removeBtn.disabled = !state.removePasswordInput;
    }

    // Inline error messages
    const secErr = $('security-error');
    if (secErr) { secErr.textContent = state.securityError; secErr.style.display = state.securityError ? 'block' : 'none'; }
    const chgErr = $('change-error');
    if (chgErr) { chgErr.textContent = state.changeError; chgErr.style.display = state.changeError ? 'block' : 'none'; }
    const rmErr = $('remove-error');
    if (rmErr) { rmErr.textContent = state.removeError; rmErr.style.display = state.removeError ? 'block' : 'none'; }

    // Encryption status banner
    const encryptionStatus = $('encryption-status');
    if (encryptionStatus) encryptionStatus.style.display = state.hasPassword ? 'flex' : 'none';

    // Auto-lock section
    const autolockDisabled = $('autolock-disabled-msg');
    const autolockControls = $('autolock-controls');
    if (autolockDisabled) autolockDisabled.style.display = state.hasPassword ? 'none' : 'block';
    if (autolockControls) autolockControls.style.display = state.hasPassword ? 'block' : 'none';

    const autolockSelect = $('autolock-select');
    if (autolockSelect) autolockSelect.value = String(state.autoLockMinutes);

    const autolockSuccess = $('autolock-success');
    if (autolockSuccess) {
        autolockSuccess.textContent = state.autolockSuccess;
        autolockSuccess.style.display = state.autolockSuccess ? 'block' : 'none';
    }

    // Trust ladder / level meter
    renderTrust();
}

// --- Handlers ---

async function handleUnlock() {
    const pw = $('unlock-password')?.value;
    if (!pw) {
        state.unlockError = 'Please enter your master password.';
        render();
        return;
    }

    try {
        const result = await api.runtime.sendMessage({ kind: 'unlock', payload: pw });
        if (result && result.success) {
            state.isLocked = false;
            state.unlockError = '';
            if ($('unlock-password')) $('unlock-password').value = '';
            render();
        } else {
            state.unlockError = (result && result.error) || 'Invalid password.';
            render();
        }
    } catch (e) {
        state.unlockError = e.message || 'Failed to unlock.';
        render();
    }
}

async function handleSetPassword() {
    state.securityError = '';

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

    try {
        const result = await api.runtime.sendMessage({
            kind: 'setPassword',
            payload: state.newPassword,
        });
        if (result && result.success) {
            state.hasPassword = true;
            state.newPassword = '';
            state.confirmPassword = '';
            // Close the master password accordion
            const mp = document.getElementById('master-password');
            if (mp && mp.open) mp.open = false;
            showPageSuccess('Master password set. Your keys are now encrypted at rest.');
        } else {
            state.securityError = (result && result.error) || 'Failed to set password.';
            render();
        }
    } catch (e) {
        state.securityError = e.message || 'Failed to set password.';
        render();
    }
}

async function handleChangePassword() {
    state.changeError = '';

    if (!state.currentPassword) {
        state.changeError = 'Please enter your current password.';
        render();
        return;
    }
    if (state.newPasswordChange.length < 8) {
        state.changeError = 'New password must be at least 8 characters.';
        render();
        return;
    }
    if (state.newPasswordChange !== state.confirmPasswordChange) {
        state.changeError = 'New passwords do not match.';
        render();
        return;
    }

    try {
        const result = await api.runtime.sendMessage({
            kind: 'changePassword',
            payload: {
                oldPassword: state.currentPassword,
                newPassword: state.newPasswordChange,
            },
        });
        if (result && result.success) {
            state.currentPassword = '';
            state.newPasswordChange = '';
            state.confirmPasswordChange = '';
            const skipped = Array.isArray(result.skipped) ? result.skipped.length : 0;
            if (skipped > 0) {
                // A changePassword skip is orphaned under the OLD password with a
                // live NEW verifier: it is NOT stranded and cannot be recovered by
                // unlock. The honest path is remove-then-recover, so say exactly that.
                showPageSuccess(`Master password changed, but ${skipped} key${skipped === 1 ? ' still requires' : 's still require'} your previous password and ${skipped === 1 ? 'was' : 'were'} kept as-is. Remove the master password, then recover ${skipped === 1 ? 'it' : 'them'} with that previous password.`);
            } else {
                showPageSuccess('Master password changed successfully.');
            }
        } else {
            state.changeError = (result && result.error) || 'Failed to change password.';
            render();
        }
    } catch (e) {
        state.changeError = e.message || 'Failed to change password.';
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
    if (!(await insConfirm({ title: 'Remove master password?', body: 'Your private keys stay encrypted at rest with a device key on this device. You just will not have a master password after this.', confirmLabel: 'Remove password', destructive: true }))) {
        return;
    }

    try {
        const result = await api.runtime.sendMessage({
            kind: 'removePassword',
            payload: state.removePasswordInput,
        });
        if (result && result.success) {
            state.hasPassword = false;
            state.removePasswordInput = '';
            // Refresh the stranded signal: a key we could not convert is now a
            // recoverable stranded blob, and the copy should reflect that.
            await refreshStrandedSignal();
            const skipped = Array.isArray(result.skipped) ? result.skipped.length : 0;
            if (skipped > 0) {
                showPageSuccess(`Master password removed, but ${skipped} key${skipped === 1 ? ' is' : 's are'} protected by a different password and were kept as-is. Unlock with that password to recover ${skipped === 1 ? 'it' : 'them'}.`);
            } else {
                showPageSuccess('Master password removed. Your keys are now encrypted at rest with a device key.');
            }
            render();
        } else {
            state.removeError = (result && result.error) || 'Failed to remove password.';
            render();
        }
    } catch (e) {
        state.removeError = e.message || 'Failed to remove password.';
        render();
    }
}

async function handleDeleteVault() {
    try {
        const result = await api.runtime.sendMessage({ kind: 'resetAllData' });
        if (result && result.success) {
            // Reset state and show set password view
            state.hasPassword = false;
            state.isLocked = false;
            state.lastBackupAt = null;
            state.isBunkerProfile = false;
            state.bunkerActive = false;
            render();
            showPageSuccess('Vault deleted. You can now set up a new master password.');
        } else {
            await insNotice({ title: 'Vault deletion failed', body: (result?.error || 'Unknown error') });
        }
    } catch (e) {
        await insNotice({ title: 'Vault deletion failed', body: e.message });
    }
}

async function handleBackupExport() {
    state.backupError = '';
    try {
        const result = await api.runtime.sendMessage({ kind: 'backup.export' });
        if (!result || !result.success) {
            state.backupError = (result && result.error) || 'Backup export failed.';
            render();
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
        // Delay revoke — Safari/Firefox can start the download after this tick
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        // Record the backup so the trust meter can light L1 honestly.
        state.lastBackupAt = Date.now();
        try { await api.storage.set({ lastBackupAt: state.lastBackupAt }); } catch { /* non-fatal */ }
        showPageSuccess('Encrypted backup downloaded. Store it somewhere safe — it needs your master password to restore.');
    } catch (e) {
        state.backupError = e.message || 'Backup export failed.';
        render();
    }
}

async function handleAutoLockChange() {
    const select = $('autolock-select');
    if (!select) return;
    const minutes = parseInt(select.value, 10);
    state.autoLockMinutes = minutes;

    await api.runtime.sendMessage({
        kind: 'setAutoLockTimeout',
        payload: minutes,
    });

    const label = minutes === 0 ? 'disabled'
        : minutes === 60 ? '1 hour'
        : minutes === 180 ? '3 hours'
        : `${minutes} minutes`;
    state.autolockSuccess = minutes === 0
        ? 'Auto-lock disabled.'
        : `Auto-lock set to ${label}.`;
    render();
    setTimeout(() => { state.autolockSuccess = ''; render(); }, 3000);
}

function bindEvents() {
    // Close
    $('close-btn')?.addEventListener('click', () => window.close());

    // Prevent default form submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => e.preventDefault());
    });

    // Unlock
    $('unlock-form')?.addEventListener('submit', (e) => { e.preventDefault(); handleUnlock(); });

    // Set password
    $('new-password')?.addEventListener('input', (e) => { state.newPassword = e.target.value; render(); });
    $('confirm-password')?.addEventListener('input', (e) => { state.confirmPassword = e.target.value; render(); });
    $('set-password-btn')?.addEventListener('click', handleSetPassword);

    // Change password
    $('current-password')?.addEventListener('input', (e) => { state.currentPassword = e.target.value; render(); });
    $('new-password-change')?.addEventListener('input', (e) => { state.newPasswordChange = e.target.value; render(); });
    $('confirm-password-change')?.addEventListener('input', (e) => { state.confirmPasswordChange = e.target.value; render(); });
    $('change-password-btn')?.addEventListener('click', handleChangePassword);

    // Remove password
    $('remove-password')?.addEventListener('input', (e) => { state.removePasswordInput = e.target.value; render(); });
    $('remove-password-btn')?.addEventListener('click', handleRemovePassword);

    // Auto-lock
    $('autolock-select')?.addEventListener('change', handleAutoLockChange);

    // Trust ladder: encrypted backup export (L1 level-up action)
    $('backup-export-btn')?.addEventListener('click', handleBackupExport);

    // Delete vault (from locked view)
    $('show-delete-confirm-btn')?.addEventListener('click', () => {
        $('delete-confirm-dialog')?.classList.remove('hidden');
        $('show-delete-confirm-btn').style.display = 'none';
    });
    $('cancel-delete-btn')?.addEventListener('click', () => {
        $('delete-confirm-dialog')?.classList.add('hidden');
        $('show-delete-confirm-btn').style.display = '';
    });
    $('confirm-delete-btn')?.addEventListener('click', handleDeleteVault);
}

// Single signal channel for the stranded-key state. Best-effort: the
// hasEncryptedData handler self-heals a verifier vault (an idempotent storage
// write) which is expected and benign; a failure here just leaves strandedKeys
// at 0 rather than breaking the page.
async function refreshStrandedSignal() {
    try {
        const enc = await api.runtime.sendMessage({ kind: 'hasEncryptedData' });
        state.strandedKeys = enc?.strandedKeys || 0;
        state.hasPasswordHash = !!enc?.hasPasswordHash;
    } catch { /* leave strandedKeys at 0 */ }
}

async function init() {
    state.hasPassword = !!(await api.runtime.sendMessage({ kind: 'isEncrypted' }));
    state.isLocked = !!(await api.runtime.sendMessage({ kind: 'isLocked' }));
    state.autoLockMinutes = (await api.runtime.sendMessage({ kind: 'getAutoLockTimeout' })) ?? 15;

    await refreshStrandedSignal();

    // Trust-ladder signals — each is best-effort; a failure just leaves the
    // rung unlit rather than breaking the page.
    try {
        const info = await api.runtime.sendMessage({ kind: 'getActiveProfileInfo' });
        if (info) {
            state.profileName = info.name || '';
            state.profileNpub = info.npub || '';
            state.isBunkerProfile = !!info.isBunker;
        }
    } catch { /* ignore */ }
    try {
        const bunker = await api.runtime.sendMessage({ kind: 'bunkerServer.status' });
        state.bunkerActive = !!(bunker && bunker.active);
    } catch { /* ignore */ }
    try {
        const stored = await api.storage.get({ lastBackupAt: null });
        state.lastBackupAt = stored?.lastBackupAt || null;
    } catch { /* ignore */ }

    bindEvents();
    render();

    // Open accordion matching URL hash (e.g. #master-password or #autolock)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const target = document.getElementById(hash);
        if (target && target.tagName === 'DETAILS') {
            target.open = true;
        }
    } else {
        // Default: open master-password accordion
        const mp = document.getElementById('master-password');
        if (mp) mp.open = true;
    }
}

document.addEventListener('DOMContentLoaded', init);
