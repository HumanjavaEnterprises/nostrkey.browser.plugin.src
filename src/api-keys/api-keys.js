import Alpine from '@alpinejs/csp';
import { api } from '../utilities/browser-polyfill';
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

Alpine.data('apiKeyManager', () => ({
    // State
    keys: [],
    newLabel: '',
    newSecret: '',
    editingId: null,
    editLabel: '',
    editSecret: '',
    copiedId: null,
    revealedId: null,
    syncEnabled: true,
    globalSyncStatus: 'idle', // idle | syncing | error
    syncError: '',
    saving: false,
    toast: '',
    relayInfo: { read: [], write: [] },

    async init() {
        const relays = await api.runtime.sendMessage({ kind: 'vault.getRelays' });
        this.relayInfo = relays || { read: [], write: [] };
        this.syncEnabled = await isSyncEnabled();
        this.keys = await listApiKeys();

        // Auto-sync from relays if enabled and relays configured
        if (this.syncEnabled && this.hasRelays) {
            await this.syncAll();
        }
    },

    // --- CRUD ---

    async addKey() {
        const label = this.newLabel.trim();
        const secret = this.newSecret.trim();
        if (!label || !secret) return;

        this.saving = true;
        const id = crypto.randomUUID();
        await saveApiKey(id, label, secret);
        this.keys = await listApiKeys();
        this.newLabel = '';
        this.newSecret = '';

        // Publish to relay if sync enabled
        if (this.syncEnabled && this.hasRelays) {
            await this.publishToRelay();
        }

        this.saving = false;
        this.showToast('Key added');
    },

    startEdit(key) {
        this.editingId = key.id;
        this.editLabel = key.label;
        this.editSecret = key.secret;
    },

    async saveEdit() {
        if (!this.editingId) return;
        const label = this.editLabel.trim();
        const secret = this.editSecret.trim();
        if (!label || !secret) return;

        await saveApiKey(this.editingId, label, secret);
        this.keys = await listApiKeys();
        this.editingId = null;
        this.editLabel = '';
        this.editSecret = '';

        if (this.syncEnabled && this.hasRelays) {
            await this.publishToRelay();
        }

        this.showToast('Key updated');
    },

    cancelEdit() {
        this.editingId = null;
        this.editLabel = '';
        this.editSecret = '';
    },

    async deleteKey(id) {
        const key = this.keys.find(k => k.id === id);
        if (!key) return;
        if (!confirm(`Delete "${key.label}"?`)) return;

        await deleteApiKey(id);
        this.keys = await listApiKeys();

        if (this.syncEnabled && this.hasRelays) {
            await this.publishToRelay();
        }

        this.showToast('Key deleted');
    },

    // --- Clipboard ---

    async copySecret(id) {
        const key = this.keys.find(k => k.id === id);
        if (!key) return;
        await navigator.clipboard.writeText(key.secret);
        this.copiedId = id;
        setTimeout(() => { this.copiedId = null; }, 2000);
        // Auto-clear clipboard after 30s
        setTimeout(() => {
            navigator.clipboard.writeText('').catch(() => {});
        }, 30000);
    },

    // --- Sync ---

    async publishToRelay() {
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
    },

    async syncAll() {
        this.globalSyncStatus = 'syncing';
        this.syncError = '';

        try {
            const result = await api.runtime.sendMessage({ kind: 'apikeys.fetch' });

            if (!result.success) {
                this.globalSyncStatus = 'error';
                this.syncError = result.error || 'Sync failed';
                return;
            }

            if (result.keys) {
                const store = await getApiKeyStore();
                const localKeys = store.keys;
                const remoteKeys = result.keys;
                const localCount = Object.keys(localKeys).length;

                if (localCount === 0) {
                    // No local keys — adopt remote entirely
                    await importStore(remoteKeys);
                } else if (!store.relayCreatedAt || result.createdAt > store.relayCreatedAt) {
                    // Remote is newer — merge (remote wins for conflicts)
                    await importStore(remoteKeys);
                }

                await updateStoreSyncState('synced', result.eventId, result.createdAt);
                this.keys = await listApiKeys();
            }

            this.globalSyncStatus = 'idle';
        } catch (e) {
            this.globalSyncStatus = 'error';
            this.syncError = e.message || 'Sync failed';
        }
    },

    async toggleSync() {
        await setSyncEnabled(this.syncEnabled);
        if (this.syncEnabled && this.hasRelays) {
            await this.syncAll();
        }
    },

    // --- Import / Export ---

    async exportKeys() {
        const keys = await exportStore();
        const plainText = JSON.stringify(keys, null, 2);

        // Encrypt via background
        const result = await api.runtime.sendMessage({
            kind: 'apikeys.encrypt',
            payload: { plainText },
        });

        if (!result.success) {
            this.showToast('Export failed: ' + (result.error || 'unknown'));
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
        this.showToast('Exported');
    },

    async importKeys(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsed = JSON.parse(text);

            let keys;
            if (parsed.encrypted && parsed.data) {
                // Encrypted backup — decrypt via background
                const result = await api.runtime.sendMessage({
                    kind: 'apikeys.decrypt',
                    payload: { cipherText: parsed.data },
                });
                if (!result.success) {
                    this.showToast('Decrypt failed: ' + (result.error || 'unknown'));
                    return;
                }
                keys = JSON.parse(result.plainText);
            } else {
                // Plain JSON (legacy or manual)
                keys = parsed;
            }

            await importStore(keys);
            this.keys = await listApiKeys();

            // Publish merged state if sync enabled
            if (this.syncEnabled && this.hasRelays) {
                await this.publishToRelay();
            }

            this.showToast('Imported ' + Object.keys(keys).length + ' keys');
        } catch (e) {
            this.showToast('Import failed: ' + e.message);
        }

        // Reset file input so the same file can be re-imported
        event.target.value = '';
    },

    // --- Computed ---

    get sortedKeys() {
        return [...this.keys].sort((a, b) =>
            a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
        );
    },

    get hasRelays() {
        return this.relayInfo.read.length > 0 || this.relayInfo.write.length > 0;
    },

    // --- Helpers ---

    maskSecret(secret) {
        if (!secret) return '';
        if (secret.length <= 8) return '\u2022'.repeat(secret.length);
        return secret.slice(0, 4) + '\u2022'.repeat(4) + secret.slice(-4);
    },

    showToast(msg) {
        this.toast = msg;
        setTimeout(() => { this.toast = ''; }, 2000);
    },
}));

Alpine.start();

// Close button handler
document.getElementById('close-btn')?.addEventListener('click', () => {
    window.close();
    chrome.tabs?.getCurrent?.(t => chrome.tabs.remove(t.id));
});
