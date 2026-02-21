import { api } from '../utilities/browser-polyfill';
import {
    getVaultIndex,
    getDocument,
    saveDocumentLocal,
    deleteDocumentLocal,
    listDocuments,
    updateSyncStatus,
} from '../utilities/vault-store';

const state = {
    documents: [],
    searchQuery: '',
    selectedPath: null,
    editorTitle: '',
    editorContent: '',
    pristineTitle: '',
    pristineContent: '',
    globalSyncStatus: 'idle',
    syncError: '',
    saving: false,
    isNew: false,
    toast: '',
    relayInfo: { read: [], write: [] },
};

function $(id) { return document.getElementById(id); }

function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
}

function getFilteredDocuments() {
    if (!state.searchQuery) return state.documents;
    const q = state.searchQuery.toLowerCase();
    return state.documents.filter(d => d.path.toLowerCase().includes(q));
}

function isDirty() {
    return state.editorContent !== state.pristineContent || state.editorTitle !== state.pristineTitle;
}

function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => { state.toast = ''; render(); }, 2000);
}

function syncStatusClass(status) {
    if (status === 'idle') return 'bg-green-500';
    if (status === 'syncing') return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
}

function syncStatusText() {
    if (state.globalSyncStatus === 'syncing') return 'Syncing...';
    if (state.globalSyncStatus === 'error') return state.syncError;
    return 'Synced';
}

function docSyncClass(syncStatus) {
    if (syncStatus === 'synced') return 'bg-green-500';
    if (syncStatus === 'local-only') return 'bg-yellow-500';
    return 'bg-red-500';
}

function render() {
    // Sync bar
    const syncDot = $('sync-dot');
    const syncText = $('sync-text');
    const syncBtn = $('sync-btn');
    const docCount = $('doc-count');

    if (syncDot) syncDot.className = `inline-block w-3 h-3 rounded-full ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === 'syncing' || !hasRelays();
    if (docCount) docCount.textContent = state.documents.length + ' doc' + (state.documents.length !== 1 ? 's' : '');

    // File list
    const fileList = $('file-list');
    const emptyMsg = $('no-documents');
    const filtered = getFilteredDocuments();

    if (fileList) {
        fileList.innerHTML = filtered.map(doc => `
            <div
                class="p-2 cursor-pointer rounded text-sm border border-transparent hover:border-monokai-accent ${state.selectedPath === doc.path ? 'bg-monokai-bg-lighter border-monokai-accent' : ''}"
                data-doc-path="${doc.path}"
            >
                <div class="font-bold truncate">${doc.path}</div>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full ${docSyncClass(doc.syncStatus)}"></span>
                    <span>${doc.syncStatus}</span>
                </div>
            </div>
        `).join('');

        fileList.querySelectorAll('[data-doc-path]').forEach(el => {
            el.addEventListener('click', () => selectDocument(el.dataset.docPath));
        });
    }
    if (emptyMsg) emptyMsg.style.display = filtered.length === 0 ? 'block' : 'none';

    // Editor
    const editorPanel = $('editor-panel');
    const editorEmpty = $('editor-empty');
    const showEditor = state.selectedPath !== null || state.isNew;

    if (editorPanel) editorPanel.style.display = showEditor ? 'block' : 'none';
    if (editorEmpty) editorEmpty.style.display = showEditor ? 'none' : 'block';

    if (showEditor) {
        const titleInput = $('editor-title');
        const contentArea = $('editor-content');
        const saveBtn = $('save-doc-btn');
        const deleteBtn = $('delete-doc-btn');
        const dirtyLabel = $('dirty-label');

        if (titleInput) titleInput.value = state.editorTitle;
        if (contentArea) contentArea.value = state.editorContent;
        if (saveBtn) {
            saveBtn.disabled = state.saving || state.editorTitle.trim().length === 0;
            saveBtn.textContent = state.saving ? 'Saving...' : 'Save';
        }
        if (deleteBtn) deleteBtn.style.display = state.selectedPath !== null && !state.isNew ? 'inline-block' : 'none';
        if (dirtyLabel) dirtyLabel.style.display = isDirty() ? 'inline' : 'none';
    }

    // Search
    const searchInput = $('search-input');
    if (searchInput && document.activeElement !== searchInput) {
        searchInput.value = state.searchQuery;
    }

    // Toast
    const toast = $('toast');
    if (toast) {
        toast.textContent = state.toast;
        toast.style.display = state.toast ? 'block' : 'none';
    }
}

function newDocument() {
    state.isNew = true;
    state.selectedPath = null;
    state.editorTitle = '';
    state.editorContent = '';
    state.pristineTitle = '';
    state.pristineContent = '';
    render();
}

async function selectDocument(path) {
    const doc = await getDocument(path);
    if (!doc) return;

    state.isNew = false;
    state.selectedPath = path;
    state.editorTitle = doc.path;
    state.editorContent = doc.content;
    state.pristineTitle = doc.path;
    state.pristineContent = doc.content;
    render();
}

async function saveDocument() {
    const title = state.editorTitle.trim();
    if (!title) return;

    state.saving = true;
    render();

    try {
        const result = await api.runtime.sendMessage({
            kind: 'vault.publish',
            payload: { path: title, content: state.editorContent },
        });

        if (result.success) {
            if (state.selectedPath && state.selectedPath !== title) {
                await deleteDocumentLocal(state.selectedPath);
            }
            await saveDocumentLocal(title, state.editorContent, 'synced', result.eventId, result.createdAt);
            state.selectedPath = title;
            state.isNew = false;
            state.pristineTitle = title;
            state.pristineContent = state.editorContent;
            state.documents = await listDocuments();
            showToast('Saved');
        } else {
            await saveDocumentLocal(title, state.editorContent, 'local-only');
            if (state.selectedPath && state.selectedPath !== title) {
                await deleteDocumentLocal(state.selectedPath);
            }
            state.selectedPath = title;
            state.isNew = false;
            state.pristineTitle = title;
            state.pristineContent = state.editorContent;
            state.documents = await listDocuments();
            showToast('Saved locally (relay error: ' + (result.error || 'unknown') + ')');
        }
    } catch (e) {
        await saveDocumentLocal(state.editorTitle.trim(), state.editorContent, 'local-only');
        state.selectedPath = state.editorTitle.trim();
        state.isNew = false;
        state.pristineTitle = state.editorTitle;
        state.pristineContent = state.editorContent;
        state.documents = await listDocuments();
        showToast('Saved locally (offline)');
    }

    state.saving = false;
    render();
}

async function deleteDocument() {
    if (!state.selectedPath) return;
    if (!confirm(`Delete "${state.selectedPath}"?`)) return;

    const doc = await getDocument(state.selectedPath);

    if (doc?.eventId) {
        try {
            await api.runtime.sendMessage({
                kind: 'vault.delete',
                payload: { path: state.selectedPath, eventId: doc.eventId },
            });
        } catch (_) {}
    }

    await deleteDocumentLocal(state.selectedPath);
    state.selectedPath = null;
    state.isNew = false;
    state.editorTitle = '';
    state.editorContent = '';
    state.pristineTitle = '';
    state.pristineContent = '';
    state.documents = await listDocuments();
    showToast('Deleted');
    render();
}

async function syncAll() {
    state.globalSyncStatus = 'syncing';
    state.syncError = '';
    render();

    try {
        const result = await api.runtime.sendMessage({ kind: 'vault.fetch' });

        if (!result.success) {
            state.globalSyncStatus = 'error';
            state.syncError = result.error || 'Sync failed';
            render();
            return;
        }

        const localDocs = await getVaultIndex();

        for (const remote of result.documents) {
            const local = localDocs[remote.path];

            if (!local) {
                await saveDocumentLocal(remote.path, remote.content, 'synced', remote.eventId, remote.createdAt);
            } else if (local.syncStatus === 'local-only') {
                if (local.content !== remote.content) {
                    await updateSyncStatus(remote.path, 'conflict', remote.eventId, remote.createdAt);
                }
            } else if (!local.relayCreatedAt || remote.createdAt > local.relayCreatedAt) {
                await saveDocumentLocal(remote.path, remote.content, 'synced', remote.eventId, remote.createdAt);
                if (state.selectedPath === remote.path) {
                    state.editorContent = remote.content;
                    state.pristineContent = remote.content;
                }
            }
        }

        state.documents = await listDocuments();
        state.globalSyncStatus = 'idle';
    } catch (e) {
        state.globalSyncStatus = 'error';
        state.syncError = e.message || 'Sync failed';
    }

    render();
}

function bindEvents() {
    $('new-doc-btn')?.addEventListener('click', newDocument);
    $('sync-btn')?.addEventListener('click', syncAll);
    $('save-doc-btn')?.addEventListener('click', saveDocument);
    $('delete-doc-btn')?.addEventListener('click', deleteDocument);

    $('search-input')?.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        render();
    });

    $('editor-title')?.addEventListener('input', (e) => {
        state.editorTitle = e.target.value;
        render();
    });

    $('editor-content')?.addEventListener('input', (e) => {
        state.editorContent = e.target.value;
        render();
    });

    $('close-btn')?.addEventListener('click', () => window.close());
}

async function init() {
    // Gate: require master password before allowing vault access
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

    try {
        const relays = await api.runtime.sendMessage({ kind: 'vault.getRelays' });
        state.relayInfo = relays || { read: [], write: [] };
    } catch (e) {
        console.warn('[vault] Failed to load relays:', e.message);
        state.relayInfo = { read: [], write: [] };
    }

    try {
        state.documents = await listDocuments();
    } catch (e) {
        console.error('[vault] Failed to load documents:', e.message);
        state.documents = [];
    }

    bindEvents();
    render();

    if (hasRelays()) {
        try {
            await syncAll();
        } catch (e) {
            console.warn('[vault] Sync failed:', e.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
