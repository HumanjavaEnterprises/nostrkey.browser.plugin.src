import Alpine from 'alpinejs';
import { api } from '../utilities/browser-polyfill';
import {
    getVaultIndex,
    getDocument,
    saveDocumentLocal,
    deleteDocumentLocal,
    listDocuments,
    updateSyncStatus,
} from '../utilities/vault-store';

Alpine.data('vault', () => ({
    // State
    documents: [],
    searchQuery: '',
    selectedPath: null,
    editorTitle: '',
    editorContent: '',
    pristineTitle: '',
    pristineContent: '',
    globalSyncStatus: 'idle', // idle | syncing | error
    syncError: '',
    saving: false,
    isNew: false,
    toast: '',
    relayInfo: { read: [], write: [] },

    async init() {
        // Load relay info
        this.relayInfo = await api.runtime.sendMessage({ kind: 'vault.getRelays' });

        // Load local cache
        this.documents = await listDocuments();

        // Auto-sync from relays
        if (this.hasRelays) {
            await this.syncAll();
        }
    },

    // --- CRUD ---

    newDocument() {
        this.isNew = true;
        this.selectedPath = null;
        this.editorTitle = '';
        this.editorContent = '';
        this.pristineTitle = '';
        this.pristineContent = '';
    },

    async selectDocument(path) {
        const doc = await getDocument(path);
        if (!doc) return;

        this.isNew = false;
        this.selectedPath = path;
        this.editorTitle = doc.path;
        this.editorContent = doc.content;
        this.pristineTitle = doc.path;
        this.pristineContent = doc.content;
    },

    async saveDocument() {
        const title = this.editorTitle.trim();
        if (!title) return;

        this.saving = true;
        try {
            // Publish to relays
            const result = await api.runtime.sendMessage({
                kind: 'vault.publish',
                payload: { path: title, content: this.editorContent },
            });

            if (result.success) {
                // If title changed on existing doc, delete old local entry
                if (this.selectedPath && this.selectedPath !== title) {
                    await deleteDocumentLocal(this.selectedPath);
                }

                // Save to local cache
                await saveDocumentLocal(
                    title,
                    this.editorContent,
                    'synced',
                    result.eventId,
                    result.createdAt,
                );

                this.selectedPath = title;
                this.isNew = false;
                this.pristineTitle = title;
                this.pristineContent = this.editorContent;
                this.documents = await listDocuments();
                this.showToast('Saved');
            } else {
                // Save locally if relay publish failed
                await saveDocumentLocal(title, this.editorContent, 'local-only');
                if (this.selectedPath && this.selectedPath !== title) {
                    await deleteDocumentLocal(this.selectedPath);
                }
                this.selectedPath = title;
                this.isNew = false;
                this.pristineTitle = title;
                this.pristineContent = this.editorContent;
                this.documents = await listDocuments();
                this.showToast('Saved locally (relay error: ' + (result.error || 'unknown') + ')');
            }
        } catch (e) {
            // Network failure — save locally
            await saveDocumentLocal(this.editorTitle.trim(), this.editorContent, 'local-only');
            this.selectedPath = this.editorTitle.trim();
            this.isNew = false;
            this.pristineTitle = this.editorTitle;
            this.pristineContent = this.editorContent;
            this.documents = await listDocuments();
            this.showToast('Saved locally (offline)');
        }
        this.saving = false;
    },

    async deleteDocument() {
        if (!this.selectedPath) return;
        if (!confirm(`Delete "${this.selectedPath}"?`)) return;

        const doc = await getDocument(this.selectedPath);

        // Publish deletion to relays if we have an eventId
        if (doc?.eventId) {
            try {
                await api.runtime.sendMessage({
                    kind: 'vault.delete',
                    payload: { path: this.selectedPath, eventId: doc.eventId },
                });
            } catch (_) {
                // Continue with local deletion even if relay fails
            }
        }

        await deleteDocumentLocal(this.selectedPath);
        this.selectedPath = null;
        this.isNew = false;
        this.editorTitle = '';
        this.editorContent = '';
        this.pristineTitle = '';
        this.pristineContent = '';
        this.documents = await listDocuments();
        this.showToast('Deleted');
    },

    // --- Sync ---

    async syncAll() {
        this.globalSyncStatus = 'syncing';
        this.syncError = '';

        try {
            const result = await api.runtime.sendMessage({ kind: 'vault.fetch' });

            if (!result.success) {
                this.globalSyncStatus = 'error';
                this.syncError = result.error || 'Sync failed';
                return;
            }

            // Merge remote documents with local cache
            const localDocs = await getVaultIndex();

            for (const remote of result.documents) {
                const local = localDocs[remote.path];

                if (!local) {
                    // New document from relay — add to local cache
                    await saveDocumentLocal(
                        remote.path,
                        remote.content,
                        'synced',
                        remote.eventId,
                        remote.createdAt,
                    );
                } else if (local.syncStatus === 'local-only') {
                    // Local has unsaved changes — keep local, mark conflict if relay has different content
                    if (local.content !== remote.content) {
                        await updateSyncStatus(remote.path, 'conflict', remote.eventId, remote.createdAt);
                    }
                } else if (!local.relayCreatedAt || remote.createdAt > local.relayCreatedAt) {
                    // Relay version is newer — update local
                    await saveDocumentLocal(
                        remote.path,
                        remote.content,
                        'synced',
                        remote.eventId,
                        remote.createdAt,
                    );
                    // If this doc is currently selected, refresh editor
                    if (this.selectedPath === remote.path) {
                        this.editorContent = remote.content;
                        this.pristineContent = remote.content;
                    }
                }
            }

            this.documents = await listDocuments();
            this.globalSyncStatus = 'idle';
        } catch (e) {
            this.globalSyncStatus = 'error';
            this.syncError = e.message || 'Sync failed';
        }
    },

    // --- Computed ---

    get filteredDocuments() {
        if (!this.searchQuery) return this.documents;
        const q = this.searchQuery.toLowerCase();
        return this.documents.filter(d => d.path.toLowerCase().includes(q));
    },

    get isDirty() {
        return (
            this.editorContent !== this.pristineContent ||
            this.editorTitle !== this.pristineTitle
        );
    },

    get hasRelays() {
        return this.relayInfo.read.length > 0 || this.relayInfo.write.length > 0;
    },

    // --- Helpers ---

    showToast(msg) {
        this.toast = msg;
        setTimeout(() => { this.toast = ''; }, 2000);
    },
}));

Alpine.start();
