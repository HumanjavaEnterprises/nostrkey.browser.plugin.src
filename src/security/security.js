import { api } from '../utilities/browser-polyfill';

const state = {
    isLocked: false,
    hasPassword: false,
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

    // Unlock error
    const unlockErr = $('unlock-error');
    if (unlockErr) { unlockErr.textContent = state.unlockError; unlockErr.style.display = state.unlockError ? 'block' : 'none'; }

    // Page-level success banner
    const pageSuc = $('page-success');
    if (pageSuc) { pageSuc.textContent = state.pageSuccess; pageSuc.style.display = state.pageSuccess ? 'block' : 'none'; }

    // Security status
    const securityStatus = $('security-status');
    if (securityStatus) {
        securityStatus.textContent = state.hasPassword
            ? 'Master password is active — keys are encrypted at rest.'
            : 'No master password set — keys are stored unencrypted.';
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
            const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600', 'text-green-700 font-bold'];
            strengthEl.textContent = labels[strength] || '';
            strengthEl.className = `text-xs mt-1 ${colors[strength] || ''}`;
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
            showPageSuccess('Master password changed successfully.');
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
    if (!confirm('This will remove encryption from your private keys. They will be stored as plaintext. Are you sure?')) {
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
            showPageSuccess('Master password removed. Keys are now stored unencrypted.');
        } else {
            state.removeError = (result && result.error) || 'Failed to remove password.';
            render();
        }
    } catch (e) {
        state.removeError = e.message || 'Failed to remove password.';
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

    state.autolockSuccess = minutes === 0
        ? 'Auto-lock disabled.'
        : `Auto-lock set to ${minutes} minutes.`;
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
}

async function init() {
    state.hasPassword = !!(await api.runtime.sendMessage({ kind: 'isEncrypted' }));
    state.isLocked = !!(await api.runtime.sendMessage({ kind: 'isLocked' }));
    state.autoLockMinutes = (await api.runtime.sendMessage({ kind: 'getAutoLockTimeout' })) ?? 15;

    bindEvents();
    render();
}

document.addEventListener('DOMContentLoaded', init);
