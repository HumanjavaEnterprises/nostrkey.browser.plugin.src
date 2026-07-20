/**
 * NostrKey Full Settings - Vanilla JS (CSP-safe)
 *
 * PLUGIN-LEVEL settings only. Per-identity feature-objects (keys, seed phrase,
 * relays, app permissions, bunker connection) now live in the side-panel
 * profile-detail view — they are properties of an identity, not the plugin.
 * This page keeps only app-wide concerns:
 *   - Accessibility (viewport-level; owned by a11y.js, mirrored here)
 *   - nostr: protocol handler (app-wide redirect target)
 *   - Master password / encryption at rest (plugin-level security)
 *   - About + Clear Data
 */

import { clearData, initialize } from './utilities/utils';
import { api } from './utilities/browser-polyfill';

// State (plugin-level only)
const state = {
    // Protocol handler
    protocolHandler: '',

    // Security state (master password / encryption at rest)
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

    // Accessibility (prefs are applied by a11y.js; these controls reflect + set)
    elements.a11yTextButtons = Array.from(document.querySelectorAll('[data-a11y-text]'));
    elements.a11yContrastToggle = $('a11y-contrast-toggle');
    elements.a11yMotionToggle = $('a11y-motion-toggle');

    // General
    elements.closeBtn = $('close-btn');
    elements.clearDataBtn = document.querySelector('[data-action="clearData"]');
}

// Render functions
function render() {
    renderSecurity();
    renderProtocolHandler();
    renderInputs();
}

function renderInputs() {
    // Sync state → DOM for two-way bound security inputs
    if (elements.newPasswordInput) elements.newPasswordInput.value = state.newPassword;
    if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = state.confirmPassword;
    if (elements.currentPasswordInput) elements.currentPasswordInput.value = state.currentPassword;
    if (elements.newPasswordChangeInput) elements.newPasswordChangeInput.value = state.newPassword;
    if (elements.confirmPasswordChangeInput) elements.confirmPasswordChangeInput.value = state.confirmPassword;
    if (elements.removePasswordInput) elements.removePasswordInput.value = state.removePasswordInput;
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
        elements.passwordStrength.textContent = labels[strength] || '';
        elements.passwordStrength.className = `text-xs mt-1 strength-${strength}`;
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

// Event handlers
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
}

function handleClose() {
    window.close();
}

// Bind events
function bindEvents() {
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

    // Accessibility — window.insA11y (from a11y.js) applies the preference
    // to the page instantly and persists it; we only mirror control state.
    if (elements.a11yTextButtons) {
        elements.a11yTextButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!window.insA11y) return;
                window.insA11y.set({ textSize: btn.dataset.a11yText });
                renderA11yControls();
            });
        });
    }
    if (elements.a11yContrastToggle) {
        elements.a11yContrastToggle.addEventListener('change', (e) => {
            if (!window.insA11y) return;
            window.insA11y.set({ highContrast: e.target.checked });
        });
    }
    if (elements.a11yMotionToggle) {
        elements.a11yMotionToggle.addEventListener('change', (e) => {
            if (!window.insA11y) return;
            window.insA11y.set({ reduceMotion: e.target.checked });
        });
    }
    // Keep controls in sync when prefs change in another surface
    if (api.storage.onChanged) {
        api.storage.onChanged.addListener((changes, areaName) => {
            if ((areaName === 'sync' || areaName === 'local') && changes.a11y_prefs) {
                renderA11yControls();
            }
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

/**
 * Mirror the current accessibility prefs (owned by a11y.js) onto the
 * segmented text-size buttons and the two toggles.
 */
function renderA11yControls() {
    if (!window.insA11y) return;
    const prefs = window.insA11y.get();
    if (elements.a11yTextButtons) {
        elements.a11yTextButtons.forEach(btn => {
            btn.setAttribute('aria-pressed', String(btn.dataset.a11yText === prefs.textSize));
        });
    }
    if (elements.a11yContrastToggle) {
        elements.a11yContrastToggle.checked = prefs.highContrast;
    }
    if (elements.a11yMotionToggle) {
        elements.a11yMotionToggle.checked = prefs.reduceMotion;
    }
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

    // Accessibility controls: render once stored prefs have been applied
    if (window.insA11y) {
        renderA11yControls();
        if (window.insA11y.ready && typeof window.insA11y.ready.then === 'function') {
            window.insA11y.ready.then(renderA11yControls);
        }
    }

    render();
}

document.addEventListener('DOMContentLoaded', init);
