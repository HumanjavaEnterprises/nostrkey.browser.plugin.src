import { api } from '../utilities/browser-polyfill';
import { insConfirm } from '../ins-confirm.js';
import {
    getApiKeyStore,
    saveApiKey,
    deleteApiKey,
    listApiKeys,
    setSyncEnabled,
    isSyncEnabled,
    updateStoreSyncState,
    exportStore,
    importStore,
} from '../utilities/api-key-store';

const state = {
    keys: [],
    newLabel: '',
    newSecret: '',
    editingId: null,
    editLabel: '',
    editSecret: '',
    copiedId: null,
    revealedId: null,
    syncEnabled: true,
    globalSyncStatus: 'idle',
    syncError: '',
    saving: false,
    toast: '',
    relayInfo: { read: [], write: [] },
};

function $(id) { return document.getElementById(id); }

function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
}

function sortedKeys() {
    return [...state.keys].sort((a, b) =>
        a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
    );
}

function maskSecret(secret) {
    if (!secret) return '';
    if (secret.length <= 8) return '\u2022'.repeat(secret.length);
    return secret.slice(0, 4) + '\u2022'.repeat(4) + secret.slice(-4);
}

function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => { state.toast = ''; render(); }, 2000);
}

function syncStatusClass(status) {
    if (status === 'idle') return state.syncEnabled ? 'led--green' : 'led--off';
    if (status === 'syncing') return 'led--amber animate-pulse';
    return 'led--red';
}

function syncStatusText() {
    if (state.globalSyncStatus === 'syncing') return 'Syncing...';
    if (state.globalSyncStatus === 'error') return state.syncError;
    return state.syncEnabled ? 'Synced' : 'Local only';
}

// --- Render ---

function render() {
    // Sync bar
    const syncDot = $('sync-dot');
    const syncText = $('sync-text');
    const syncBtn = $('sync-btn');
    const syncToggle = $('sync-toggle');
    const keyCount = $('key-count');

    if (syncDot) syncDot.className = `led ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === 'syncing' || !hasRelays() || !state.syncEnabled;
    if (syncToggle) syncToggle.setAttribute('aria-pressed', String(state.syncEnabled));
    if (keyCount) keyCount.textContent = state.keys.length + ' key' + (state.keys.length !== 1 ? 's' : '');

    // Key table
    const keyTableContainer = $('key-table-container');
    const noKeysMsg = $('no-keys');
    const keyTableBody = $('key-table-body');

    if (keyTableContainer) keyTableContainer.style.display = state.keys.length > 0 ? 'block' : 'none';
    if (noKeysMsg) noKeysMsg.style.display = state.keys.length === 0 ? 'block' : 'none';

    if (keyTableBody) {
        const sorted = sortedKeys();
        keyTableBody.innerHTML = sorted.map(key => {
            if (state.editingId === key.id) {
                return `
                    <div class="module is-live">
                        <div class="module-header">Edit key</div>
                        <div class="module-body flex flex-col gap-2">
                            <input
                                type="text"
                                class="ins-input"
                                autocomplete="off"
                                aria-label="Key label"
                                data-edit-label="${key.id}"
                                value="${escapeAttr(state.editLabel)}"
                            />
                            <input
                                type="text"
                                class="ins-input mono"
                                autocomplete="off"
                                spellcheck="false"
                                aria-label="Secret key"
                                data-edit-secret="${key.id}"
                                value="${escapeAttr(state.editSecret)}"
                            />
                            <div class="flex gap-2 justify-end">
                                <button class="btn btn--ghost btn--sm" type="button" data-action="cancel-edit">Cancel</button>
                                <button class="btn btn--primary btn--sm" type="button" data-action="save-edit">Save</button>
                            </div>
                        </div>
                    </div>
                `;
            }
            const revealed = state.revealedId === key.id;
            // An undecryptable secret must read as a PROBLEM, never as blank —
            // blank is what made the old data loss invisible.
            const displaySecret = key.undecryptable
                ? 'unreadable on this device'
                : (revealed ? escapeHtml(key.secret) : escapeHtml(maskSecret(key.secret)));
            const copyLabel = state.copiedId === key.id ? 'Copied!' : 'Copy';
            return `
                <div class="module${revealed ? ' is-live' : ''}">
                    <div class="module-row">
                        <button
                            class="patch-point"
                            type="button"
                            data-action="toggle-reveal"
                            data-key-id="${key.id}"
                            aria-pressed="${revealed}"
                            title="${revealed ? 'Hide secret' : 'Reveal secret'}"
                            aria-label="${revealed ? 'Hide' : 'Reveal'} secret for ${escapeAttr(key.label)}"
                        ><span class="patch-jack"></span></button>
                        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span class="text-sm font-semibold cursor-pointer hover:underline" data-action="start-edit" data-key-id="${key.id}" title="Edit key">${escapeHtml(key.label)}</span>
                            <span class="mono text-xs ${revealed ? '' : 'ins-muted '}ins-truncate cursor-pointer" data-action="toggle-reveal" data-key-id="${key.id}">${displaySecret}</span>
                        </div>
                        <span class="row-value">
                            <button class="btn btn--sm" type="button" data-action="copy-secret" data-key-id="${key.id}">${copyLabel}</button>
                            <button class="btn btn--sm btn--destructive" type="button" data-action="delete-key" data-key-id="${key.id}">Del</button>
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        // Bind table events
        keyTableBody.querySelectorAll('[data-action="start-edit"]').forEach(el => {
            el.addEventListener('click', () => startEdit(el.dataset.keyId));
        });
        keyTableBody.querySelectorAll('[data-action="toggle-reveal"]').forEach(el => {
            el.addEventListener('click', () => {
                state.revealedId = state.revealedId === el.dataset.keyId ? null : el.dataset.keyId;
                render();
            });
        });
        keyTableBody.querySelectorAll('[data-action="copy-secret"]').forEach(el => {
            el.addEventListener('click', () => copySecret(el.dataset.keyId));
        });
        keyTableBody.querySelectorAll('[data-action="delete-key"]').forEach(el => {
            el.addEventListener('click', () => deleteKey(el.dataset.keyId));
        });
        keyTableBody.querySelectorAll('[data-action="save-edit"]').forEach(el => {
            el.addEventListener('click', saveEdit);
        });
        keyTableBody.querySelectorAll('[data-action="cancel-edit"]').forEach(el => {
            el.addEventListener('click', cancelEdit);
        });

        // Bind edit input events
        keyTableBody.querySelectorAll('[data-edit-label]').forEach(el => {
            el.addEventListener('input', (e) => { state.editLabel = e.target.value; });
            el.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
            });
        });
        keyTableBody.querySelectorAll('[data-edit-secret]').forEach(el => {
            el.addEventListener('input', (e) => { state.editSecret = e.target.value; });
            el.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
            });
        });
    }

    // Add key form
    const newLabelInput = $('new-label');
    const newSecretInput = $('new-secret');
    const addKeyBtn = $('add-key-btn');

    if (newLabelInput && document.activeElement !== newLabelInput) newLabelInput.value = state.newLabel;
    if (newSecretInput && document.activeElement !== newSecretInput) newSecretInput.value = state.newSecret;
    if (addKeyBtn) {
        addKeyBtn.disabled = state.saving || state.newLabel.trim().length === 0 || state.newSecret.trim().length === 0;
        addKeyBtn.textContent = state.saving ? 'Saving...' : 'Save';
    }

    // Toast
    const toast = $('toast');
    if (toast) {
        toast.textContent = state.toast;
        toast.style.display = state.toast ? 'block' : 'none';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- CRUD ---

async function addKey() {
    const label = state.newLabel.trim();
    const secret = state.newSecret.trim();
    if (!label || !secret) return;

    state.saving = true;
    render();

    const id = crypto.randomUUID();
    await saveApiKey(id, label, secret);
    state.keys = await listApiKeys();
    state.newLabel = '';
    state.newSecret = '';

    if (state.syncEnabled && hasRelays()) {
        await publishToRelay();
    }

    state.saving = false;
    showToast('Key added');
}

function startEdit(id) {
    const key = state.keys.find(k => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
        // Opening it would seed the editor with nothing and Save would write
        // that nothing over the stored ciphertext.
        showToast('This key could not be decrypted on this device — it was left untouched');
        return;
    }
    state.editingId = key.id;
    state.editLabel = key.label;
    state.editSecret = key.secret;
    render();
}

async function saveEdit() {
    if (!state.editingId) return;
    const label = state.editLabel.trim();
    const secret = state.editSecret.trim();
    if (!label || !secret) return;

    await saveApiKey(state.editingId, label, secret);
    state.keys = await listApiKeys();
    state.editingId = null;
    state.editLabel = '';
    state.editSecret = '';

    if (state.syncEnabled && hasRelays()) {
        await publishToRelay();
    }

    showToast('Key updated');
}

function cancelEdit() {
    state.editingId = null;
    state.editLabel = '';
    state.editSecret = '';
    render();
}

async function deleteKey(id) {
    const key = state.keys.find(k => k.id === id);
    if (!key) return;
    if (!(await insConfirm({ title: `Delete "${key.label}"?`, body: 'The stored secret is removed from your encrypted vault.', confirmLabel: 'Delete key', destructive: true }))) return;

    await deleteApiKey(id);
    state.keys = await listApiKeys();

    if (state.syncEnabled && hasRelays()) {
        await publishToRelay();
    }

    showToast('Key deleted');
}

// --- Clipboard ---

async function copySecret(id) {
    const key = state.keys.find(k => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
        showToast('This key could not be decrypted on this device');
        return;
    }
    await navigator.clipboard.writeText(key.secret);
    state.copiedId = id;
    render();
    setTimeout(() => { state.copiedId = null; render(); }, 2000);
    setTimeout(() => {
        navigator.clipboard.writeText('').catch(() => {});
    }, 30000);
}

// --- Sync ---

async function publishToRelay() {
    try {
        const store = await getApiKeyStore();
        const result = await api.runtime.sendMessage({
            kind: 'apikeys.publish',
            payload: { keys: store.keys },
        });
        if (result.success) {
            await updateStoreSyncState('synced', result.eventId, result.createdAt);
        }
        return result;
    } catch (e) {
        await updateStoreSyncState('local-only');
        return { success: false, error: e.message };
    }
}

async function syncAll() {
    state.globalSyncStatus = 'syncing';
    state.syncError = '';
    render();

    try {
        const result = await api.runtime.sendMessage({ kind: 'apikeys.fetch' });

        if (!result.success) {
            state.globalSyncStatus = 'error';
            state.syncError = result.error || 'Sync failed';
            render();
            return;
        }

        if (result.keys) {
            const store = await getApiKeyStore();
            const localKeys = store.keys;
            const localCount = Object.keys(localKeys).length;

            if (localCount === 0) {
                await importStore(result.keys);
            } else if (!store.relayCreatedAt || result.createdAt > store.relayCreatedAt) {
                await importStore(result.keys);
            }

            await updateStoreSyncState('synced', result.eventId, result.createdAt);
            state.keys = await listApiKeys();
        }

        state.globalSyncStatus = 'idle';
    } catch (e) {
        state.globalSyncStatus = 'error';
        state.syncError = e.message || 'Sync failed';
    }

    render();
}

async function toggleSync() {
    await setSyncEnabled(state.syncEnabled);
    if (state.syncEnabled && hasRelays()) {
        await syncAll();
    }
}

// --- Import / Export ---

async function exportKeys() {
    const { keys, undecryptable } = await exportStore();
    const plainText = JSON.stringify(keys, null, 2);

    const result = await api.runtime.sendMessage({
        kind: 'apikeys.encrypt',
        payload: { plainText },
    });

    if (!result.success) {
        showToast('Export failed: ' + (result.error || 'unknown'));
        return;
    }

    const blob = new Blob(
        [JSON.stringify({ encrypted: true, data: result.cipherText })],
        { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nostrkey-api-keys-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast(undecryptable.length
        ? `Exported — ${undecryptable.length} key(s) could not be decrypted here and were backed up still-encrypted: ${undecryptable.join(', ')}`
        : 'Exported');
}

async function importKeys(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        let keys;
        if (parsed.encrypted && parsed.data) {
            const result = await api.runtime.sendMessage({
                kind: 'apikeys.decrypt',
                payload: { cipherText: parsed.data },
            });
            if (!result.success) {
                showToast('Decrypt failed: ' + (result.error || 'unknown'));
                return;
            }
            keys = JSON.parse(result.plainText);
        } else {
            keys = parsed;
        }

        await importStore(keys);
        state.keys = await listApiKeys();

        if (state.syncEnabled && hasRelays()) {
            await publishToRelay();
        }

        showToast('Imported ' + Object.keys(keys).length + ' keys');
    } catch (e) {
        showToast('Import failed: ' + e.message);
    }

    event.target.value = '';
}

// --- Event binding ---

function bindEvents() {
    $('sync-btn')?.addEventListener('click', syncAll);
    $('add-key-btn')?.addEventListener('click', addKey);
    $('export-btn')?.addEventListener('click', exportKeys);
    $('import-file')?.addEventListener('change', importKeys);
    $('close-btn')?.addEventListener('click', () => window.close());

    $('sync-toggle')?.addEventListener('click', () => {
        state.syncEnabled = !state.syncEnabled;
        render();
        toggleSync();
    });

    $('new-label')?.addEventListener('input', (e) => {
        state.newLabel = e.target.value;
        render();
    });

    $('new-secret')?.addEventListener('input', (e) => {
        state.newSecret = e.target.value;
        render();
    });
}

function showGate(gate, main, { title, message, button }) {
    if (gate) gate.style.display = 'block';
    if (main) main.style.display = 'none';
    const t = $('gate-title'); if (t && title) t.textContent = title;
    const m = $('gate-message'); if (m && message) m.textContent = message;
    const b = $('gate-security-btn'); if (b && button) b.textContent = button;
    b?.addEventListener('click', () => {
        const url = api.runtime.getURL('security/security.html');
        window.open(url, 'nostrkey-options');
    });
}

async function init() {
    // Gate: require master password AND an unlocked session before rendering.
    const isEncrypted = await api.runtime.sendMessage({ kind: 'isEncrypted' });
    const locked = await api.runtime.sendMessage({ kind: 'isLocked' });
    const gate = $('vault-locked-gate');
    const main = $('vault-main-content');

    if (!isEncrypted) {
        // No master password set yet — device-key encryption is active but the
        // vault UI still asks the user to set a password first.
        setUnlocked(true);
        showGate(gate, main, {});
        return;
    }

    if (locked) {
        // F5: session is locked — refuse to read/render any API-key secret.
        setUnlocked(false);
        showGate(gate, main, {
            title: 'Vault Locked',
            message: 'Unlock NostrKey with your master password to view your API keys.',
            button: 'Unlock',
        });
        return;
    }

    setUnlocked(true);
    if (gate) gate.style.display = 'none';
    if (main) main.style.display = 'block';

    const relays = await api.runtime.sendMessage({ kind: 'vault.getRelays' });
    state.relayInfo = relays || { read: [], write: [] };
    state.syncEnabled = await isSyncEnabled();
    state.keys = await listApiKeys();

    bindEvents();
    render();

    if (state.syncEnabled && hasRelays()) {
        await syncAll();
    }
}

document.addEventListener('DOMContentLoaded', init);
