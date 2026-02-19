(() => {
  // src/utilities/browser-polyfill.js
  var _browser = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
  if (!_browser) {
    throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");
  }
  var isChrome = typeof browser === "undefined" && typeof chrome !== "undefined";
  function promisify(context, method) {
    return (...args) => {
      try {
        const result = method.apply(context, args);
        if (result && typeof result.then === "function") {
          return result;
        }
      } catch (_) {
      }
      return new Promise((resolve, reject) => {
        method.apply(context, [
          ...args,
          (...cbArgs) => {
            if (_browser.runtime && _browser.runtime.lastError) {
              reject(new Error(_browser.runtime.lastError.message));
            } else {
              resolve(cbArgs.length <= 1 ? cbArgs[0] : cbArgs);
            }
          }
        ]);
      });
    };
  }
  var api = {};
  api.runtime = {
    /**
     * sendMessage – always returns a Promise.
     */
    sendMessage(...args) {
      if (!isChrome) {
        return _browser.runtime.sendMessage(...args);
      }
      return promisify(_browser.runtime, _browser.runtime.sendMessage)(...args);
    },
    /**
     * onMessage – thin wrapper so callers use a consistent reference.
     * The listener signature is (message, sender, sendResponse).
     * On Chrome the listener can return `true` to keep the channel open,
     * or return a Promise (MV3).  Safari / Firefox expect a Promise return.
     */
    onMessage: _browser.runtime.onMessage,
    /**
     * getURL – synchronous on all browsers.
     */
    getURL(path) {
      return _browser.runtime.getURL(path);
    },
    /**
     * openOptionsPage
     */
    openOptionsPage() {
      if (!isChrome) {
        return _browser.runtime.openOptionsPage();
      }
      return promisify(_browser.runtime, _browser.runtime.openOptionsPage)();
    },
    /**
     * Expose the id for convenience.
     */
    get id() {
      return _browser.runtime.id;
    }
  };
  api.storage = {
    local: {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.local.get(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.local.set(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.set)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.local.clear(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.clear)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.local.remove(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.remove)(...args);
      }
    }
  };
  api.tabs = {
    create(...args) {
      if (!isChrome) {
        return _browser.tabs.create(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.create)(...args);
    },
    query(...args) {
      if (!isChrome) {
        return _browser.tabs.query(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.query)(...args);
    },
    remove(...args) {
      if (!isChrome) {
        return _browser.tabs.remove(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.remove)(...args);
    },
    update(...args) {
      if (!isChrome) {
        return _browser.tabs.update(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.update)(...args);
    },
    get(...args) {
      if (!isChrome) {
        return _browser.tabs.get(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.get)(...args);
    },
    getCurrent(...args) {
      if (!isChrome) {
        return _browser.tabs.getCurrent(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.getCurrent)(...args);
    }
  };

  // src/utilities/vault-store.js
  var storage = api.storage.local;
  var STORAGE_KEY = "vaultDocs";
  async function getDocs() {
    const data = await storage.get({ [STORAGE_KEY]: {} });
    return data[STORAGE_KEY] || {};
  }
  async function setDocs(docs) {
    await storage.set({ [STORAGE_KEY]: docs });
  }
  async function getVaultIndex() {
    return getDocs();
  }
  async function getDocument(path) {
    const docs = await getDocs();
    return docs[path] || null;
  }
  async function saveDocumentLocal(path, content, syncStatus, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    docs[path] = {
      path,
      content,
      updatedAt: Math.floor(Date.now() / 1e3),
      syncStatus,
      eventId,
      relayCreatedAt
    };
    await setDocs(docs);
    return docs[path];
  }
  async function deleteDocumentLocal(path) {
    const docs = await getDocs();
    delete docs[path];
    await setDocs(docs);
  }
  async function listDocuments() {
    const docs = await getDocs();
    return Object.values(docs).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async function updateSyncStatus(path, status, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    if (!docs[path]) return null;
    docs[path].syncStatus = status;
    if (eventId !== null) docs[path].eventId = eventId;
    if (relayCreatedAt !== null) docs[path].relayCreatedAt = relayCreatedAt;
    await setDocs(docs);
    return docs[path];
  }

  // src/vault/vault.js
  var state = {
    documents: [],
    searchQuery: "",
    selectedPath: null,
    editorTitle: "",
    editorContent: "",
    pristineTitle: "",
    pristineContent: "",
    globalSyncStatus: "idle",
    syncError: "",
    saving: false,
    isNew: false,
    toast: "",
    relayInfo: { read: [], write: [] }
  };
  function $(id) {
    return document.getElementById(id);
  }
  function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
  }
  function getFilteredDocuments() {
    if (!state.searchQuery) return state.documents;
    const q = state.searchQuery.toLowerCase();
    return state.documents.filter((d) => d.path.toLowerCase().includes(q));
  }
  function isDirty() {
    return state.editorContent !== state.pristineContent || state.editorTitle !== state.pristineTitle;
  }
  function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      state.toast = "";
      render();
    }, 2e3);
  }
  function syncStatusClass(status) {
    if (status === "idle") return "bg-green-500";
    if (status === "syncing") return "bg-yellow-500 animate-pulse";
    return "bg-red-500";
  }
  function syncStatusText() {
    if (state.globalSyncStatus === "syncing") return "Syncing...";
    if (state.globalSyncStatus === "error") return state.syncError;
    return "Synced";
  }
  function docSyncClass(syncStatus) {
    if (syncStatus === "synced") return "bg-green-500";
    if (syncStatus === "local-only") return "bg-yellow-500";
    return "bg-red-500";
  }
  function render() {
    const syncDot = $("sync-dot");
    const syncText = $("sync-text");
    const syncBtn = $("sync-btn");
    const docCount = $("doc-count");
    if (syncDot) syncDot.className = `inline-block w-3 h-3 rounded-full ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === "syncing" || !hasRelays();
    if (docCount) docCount.textContent = state.documents.length + " doc" + (state.documents.length !== 1 ? "s" : "");
    const fileList = $("file-list");
    const emptyMsg = $("no-documents");
    const filtered = getFilteredDocuments();
    if (fileList) {
      fileList.innerHTML = filtered.map((doc) => `
            <div
                class="p-2 cursor-pointer rounded text-sm border border-transparent hover:border-monokai-accent ${state.selectedPath === doc.path ? "bg-monokai-bg-lighter border-monokai-accent" : ""}"
                data-doc-path="${doc.path}"
            >
                <div class="font-bold truncate">${doc.path}</div>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full ${docSyncClass(doc.syncStatus)}"></span>
                    <span>${doc.syncStatus}</span>
                </div>
            </div>
        `).join("");
      fileList.querySelectorAll("[data-doc-path]").forEach((el) => {
        el.addEventListener("click", () => selectDocument(el.dataset.docPath));
      });
    }
    if (emptyMsg) emptyMsg.style.display = filtered.length === 0 ? "block" : "none";
    const editorPanel = $("editor-panel");
    const editorEmpty = $("editor-empty");
    const showEditor = state.selectedPath !== null || state.isNew;
    if (editorPanel) editorPanel.style.display = showEditor ? "block" : "none";
    if (editorEmpty) editorEmpty.style.display = showEditor ? "none" : "block";
    if (showEditor) {
      const titleInput = $("editor-title");
      const contentArea = $("editor-content");
      const saveBtn = $("save-doc-btn");
      const deleteBtn = $("delete-doc-btn");
      const dirtyLabel = $("dirty-label");
      if (titleInput) titleInput.value = state.editorTitle;
      if (contentArea) contentArea.value = state.editorContent;
      if (saveBtn) {
        saveBtn.disabled = state.saving || state.editorTitle.trim().length === 0;
        saveBtn.textContent = state.saving ? "Saving..." : "Save";
      }
      if (deleteBtn) deleteBtn.style.display = state.selectedPath !== null && !state.isNew ? "inline-block" : "none";
      if (dirtyLabel) dirtyLabel.style.display = isDirty() ? "inline" : "none";
    }
    const searchInput = $("search-input");
    if (searchInput && document.activeElement !== searchInput) {
      searchInput.value = state.searchQuery;
    }
    const toast = $("toast");
    if (toast) {
      toast.textContent = state.toast;
      toast.style.display = state.toast ? "block" : "none";
    }
  }
  function newDocument() {
    state.isNew = true;
    state.selectedPath = null;
    state.editorTitle = "";
    state.editorContent = "";
    state.pristineTitle = "";
    state.pristineContent = "";
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
        kind: "vault.publish",
        payload: { path: title, content: state.editorContent }
      });
      if (result.success) {
        if (state.selectedPath && state.selectedPath !== title) {
          await deleteDocumentLocal(state.selectedPath);
        }
        await saveDocumentLocal(title, state.editorContent, "synced", result.eventId, result.createdAt);
        state.selectedPath = title;
        state.isNew = false;
        state.pristineTitle = title;
        state.pristineContent = state.editorContent;
        state.documents = await listDocuments();
        showToast("Saved");
      } else {
        await saveDocumentLocal(title, state.editorContent, "local-only");
        if (state.selectedPath && state.selectedPath !== title) {
          await deleteDocumentLocal(state.selectedPath);
        }
        state.selectedPath = title;
        state.isNew = false;
        state.pristineTitle = title;
        state.pristineContent = state.editorContent;
        state.documents = await listDocuments();
        showToast("Saved locally (relay error: " + (result.error || "unknown") + ")");
      }
    } catch (e) {
      await saveDocumentLocal(state.editorTitle.trim(), state.editorContent, "local-only");
      state.selectedPath = state.editorTitle.trim();
      state.isNew = false;
      state.pristineTitle = state.editorTitle;
      state.pristineContent = state.editorContent;
      state.documents = await listDocuments();
      showToast("Saved locally (offline)");
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
          kind: "vault.delete",
          payload: { path: state.selectedPath, eventId: doc.eventId }
        });
      } catch (_) {
      }
    }
    await deleteDocumentLocal(state.selectedPath);
    state.selectedPath = null;
    state.isNew = false;
    state.editorTitle = "";
    state.editorContent = "";
    state.pristineTitle = "";
    state.pristineContent = "";
    state.documents = await listDocuments();
    showToast("Deleted");
    render();
  }
  async function syncAll() {
    state.globalSyncStatus = "syncing";
    state.syncError = "";
    render();
    try {
      const result = await api.runtime.sendMessage({ kind: "vault.fetch" });
      if (!result.success) {
        state.globalSyncStatus = "error";
        state.syncError = result.error || "Sync failed";
        render();
        return;
      }
      const localDocs = await getVaultIndex();
      for (const remote of result.documents) {
        const local = localDocs[remote.path];
        if (!local) {
          await saveDocumentLocal(remote.path, remote.content, "synced", remote.eventId, remote.createdAt);
        } else if (local.syncStatus === "local-only") {
          if (local.content !== remote.content) {
            await updateSyncStatus(remote.path, "conflict", remote.eventId, remote.createdAt);
          }
        } else if (!local.relayCreatedAt || remote.createdAt > local.relayCreatedAt) {
          await saveDocumentLocal(remote.path, remote.content, "synced", remote.eventId, remote.createdAt);
          if (state.selectedPath === remote.path) {
            state.editorContent = remote.content;
            state.pristineContent = remote.content;
          }
        }
      }
      state.documents = await listDocuments();
      state.globalSyncStatus = "idle";
    } catch (e) {
      state.globalSyncStatus = "error";
      state.syncError = e.message || "Sync failed";
    }
    render();
  }
  function bindEvents() {
    $("new-doc-btn")?.addEventListener("click", newDocument);
    $("sync-btn")?.addEventListener("click", syncAll);
    $("save-doc-btn")?.addEventListener("click", saveDocument);
    $("delete-doc-btn")?.addEventListener("click", deleteDocument);
    $("search-input")?.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
    });
    $("editor-title")?.addEventListener("input", (e) => {
      state.editorTitle = e.target.value;
      render();
    });
    $("editor-content")?.addEventListener("input", (e) => {
      state.editorContent = e.target.value;
      render();
    });
    $("close-btn")?.addEventListener("click", () => window.close());
  }
  async function init() {
    const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
    state.relayInfo = relays || { read: [], write: [] };
    state.documents = await listDocuments();
    bindEvents();
    render();
    if (hasRelays()) {
      await syncAll();
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdmF1bHQtc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgIi8qKlxuICogVmF1bHQgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgdmF1bHQgZG9jdW1lbnRzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICB2YXVsdERvY3M6IHtcbiAqICAgICBcInBhdGgvdG8vZmlsZS5tZFwiOiB7XG4gKiAgICAgICBwYXRoLCBjb250ZW50LCB1cGRhdGVkQXQsIHN5bmNTdGF0dXMsIGV2ZW50SWQsIHJlbGF5Q3JlYXRlZEF0XG4gKiAgICAgfVxuICogICB9XG4gKlxuICogc3luY1N0YXR1czogXCJzeW5jZWRcIiB8IFwibG9jYWwtb25seVwiIHwgXCJjb25mbGljdFwiXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuY29uc3QgU1RPUkFHRV9LRVkgPSAndmF1bHREb2NzJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0RG9jcygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbU1RPUkFHRV9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtTVE9SQUdFX0tFWV0gfHwge307XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldERvY3MoZG9jcykge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcyB9KTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZ1bGwgdmF1bHQgZG9jcyBvYmplY3QuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBNYXAgb2YgcGF0aCAtPiBkb2NcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZhdWx0SW5kZXgoKSB7XG4gICAgcmV0dXJuIGdldERvY3MoKTtcbn1cblxuLyoqXG4gKiBHZXQgYSBzaW5nbGUgZG9jdW1lbnQgYnkgcGF0aC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREb2N1bWVudChwYXRoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFNhdmUgb3IgdXBkYXRlIGEgZG9jdW1lbnQgaW4gdGhlIGxvY2FsIGNhY2hlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50TG9jYWwocGF0aCwgY29udGVudCwgc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgZG9jc1twYXRoXSA9IHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgY29udGVudCxcbiAgICAgICAgdXBkYXRlZEF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICAgICAgc3luY1N0YXR1cyxcbiAgICAgICAgZXZlbnRJZCxcbiAgICAgICAgcmVsYXlDcmVhdGVkQXQsXG4gICAgfTtcbiAgICBhd2FpdCBzZXREb2NzKGRvY3MpO1xuICAgIHJldHVybiBkb2NzW3BhdGhdO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhIGRvY3VtZW50IGZyb20gdGhlIGxvY2FsIGNhY2hlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlRG9jdW1lbnRMb2NhbChwYXRoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBkZWxldGUgZG9jc1twYXRoXTtcbiAgICBhd2FpdCBzZXREb2NzKGRvY3MpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIGRvY3VtZW50cyBzb3J0ZWQgYnkgdXBkYXRlZEF0IGRlc2NlbmRpbmcuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59IFNvcnRlZCBhcnJheSBvZiBkb2MgbWV0YWRhdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3REb2N1bWVudHMoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhkb2NzKS5zb3J0KChhLCBiKSA9PiBiLnVwZGF0ZWRBdCAtIGEudXBkYXRlZEF0KTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIHN5bmMgc3RhdHVzIChhbmQgb3B0aW9uYWxseSBldmVudElkL3JlbGF5Q3JlYXRlZEF0KSBmb3IgYSBkb2N1bWVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVN5bmNTdGF0dXMocGF0aCwgc3RhdHVzLCBldmVudElkID0gbnVsbCwgcmVsYXlDcmVhdGVkQXQgPSBudWxsKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBpZiAoIWRvY3NbcGF0aF0pIHJldHVybiBudWxsO1xuICAgIGRvY3NbcGF0aF0uc3luY1N0YXR1cyA9IHN0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgZG9jc1twYXRoXS5ldmVudElkID0gZXZlbnRJZDtcbiAgICBpZiAocmVsYXlDcmVhdGVkQXQgIT09IG51bGwpIGRvY3NbcGF0aF0ucmVsYXlDcmVhdGVkQXQgPSByZWxheUNyZWF0ZWRBdDtcbiAgICBhd2FpdCBzZXREb2NzKGRvY3MpO1xuICAgIHJldHVybiBkb2NzW3BhdGhdO1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7XG4gICAgZ2V0VmF1bHRJbmRleCxcbiAgICBnZXREb2N1bWVudCxcbiAgICBzYXZlRG9jdW1lbnRMb2NhbCxcbiAgICBkZWxldGVEb2N1bWVudExvY2FsLFxuICAgIGxpc3REb2N1bWVudHMsXG4gICAgdXBkYXRlU3luY1N0YXR1cyxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL3ZhdWx0LXN0b3JlJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZG9jdW1lbnRzOiBbXSxcbiAgICBzZWFyY2hRdWVyeTogJycsXG4gICAgc2VsZWN0ZWRQYXRoOiBudWxsLFxuICAgIGVkaXRvclRpdGxlOiAnJyxcbiAgICBlZGl0b3JDb250ZW50OiAnJyxcbiAgICBwcmlzdGluZVRpdGxlOiAnJyxcbiAgICBwcmlzdGluZUNvbnRlbnQ6ICcnLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgaXNOZXc6IGZhbHNlLFxuICAgIHRvYXN0OiAnJyxcbiAgICByZWxheUluZm86IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9LFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGhhc1JlbGF5cygpIHtcbiAgICByZXR1cm4gc3RhdGUucmVsYXlJbmZvLnJlYWQubGVuZ3RoID4gMCB8fCBzdGF0ZS5yZWxheUluZm8ud3JpdGUubGVuZ3RoID4gMDtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyZWREb2N1bWVudHMoKSB7XG4gICAgaWYgKCFzdGF0ZS5zZWFyY2hRdWVyeSkgcmV0dXJuIHN0YXRlLmRvY3VtZW50cztcbiAgICBjb25zdCBxID0gc3RhdGUuc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gc3RhdGUuZG9jdW1lbnRzLmZpbHRlcihkID0+IGQucGF0aC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpKTtcbn1cblxuZnVuY3Rpb24gaXNEaXJ0eSgpIHtcbiAgICByZXR1cm4gc3RhdGUuZWRpdG9yQ29udGVudCAhPT0gc3RhdGUucHJpc3RpbmVDb250ZW50IHx8IHN0YXRlLmVkaXRvclRpdGxlICE9PSBzdGF0ZS5wcmlzdGluZVRpdGxlO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuICdiZy1ncmVlbi01MDAnO1xuICAgIGlmIChzdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdiZy15ZWxsb3ctNTAwIGFuaW1hdGUtcHVsc2UnO1xuICAgIHJldHVybiAnYmctcmVkLTUwMCc7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNUZXh0KCkge1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnU3luY2luZy4uLic7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdlcnJvcicpIHJldHVybiBzdGF0ZS5zeW5jRXJyb3I7XG4gICAgcmV0dXJuICdTeW5jZWQnO1xufVxuXG5mdW5jdGlvbiBkb2NTeW5jQ2xhc3Moc3luY1N0YXR1cykge1xuICAgIGlmIChzeW5jU3RhdHVzID09PSAnc3luY2VkJykgcmV0dXJuICdiZy1ncmVlbi01MDAnO1xuICAgIGlmIChzeW5jU3RhdHVzID09PSAnbG9jYWwtb25seScpIHJldHVybiAnYmcteWVsbG93LTUwMCc7XG4gICAgcmV0dXJuICdiZy1yZWQtNTAwJztcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBkb2NDb3VudCA9ICQoJ2RvYy1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGlubGluZS1ibG9jayB3LTMgaC0zIHJvdW5kZWQtZnVsbCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKTtcbiAgICBpZiAoZG9jQ291bnQpIGRvY0NvdW50LnRleHRDb250ZW50ID0gc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCArICcgZG9jJyArIChzdGF0ZS5kb2N1bWVudHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpO1xuXG4gICAgLy8gRmlsZSBsaXN0XG4gICAgY29uc3QgZmlsZUxpc3QgPSAkKCdmaWxlLWxpc3QnKTtcbiAgICBjb25zdCBlbXB0eU1zZyA9ICQoJ25vLWRvY3VtZW50cycpO1xuICAgIGNvbnN0IGZpbHRlcmVkID0gZ2V0RmlsdGVyZWREb2N1bWVudHMoKTtcblxuICAgIGlmIChmaWxlTGlzdCkge1xuICAgICAgICBmaWxlTGlzdC5pbm5lckhUTUwgPSBmaWx0ZXJlZC5tYXAoZG9jID0+IGBcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzcz1cInAtMiBjdXJzb3ItcG9pbnRlciByb3VuZGVkIHRleHQtc20gYm9yZGVyIGJvcmRlci10cmFuc3BhcmVudCBob3Zlcjpib3JkZXItbW9ub2thaS1hY2NlbnQgJHtzdGF0ZS5zZWxlY3RlZFBhdGggPT09IGRvYy5wYXRoID8gJ2JnLW1vbm9rYWktYmctbGlnaHRlciBib3JkZXItbW9ub2thaS1hY2NlbnQnIDogJyd9XCJcbiAgICAgICAgICAgICAgICBkYXRhLWRvYy1wYXRoPVwiJHtkb2MucGF0aH1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb250LWJvbGQgdHJ1bmNhdGVcIj4ke2RvYy5wYXRofTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSB0ZXh0LXhzIHRleHQtZ3JheS01MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbmxpbmUtYmxvY2sgdy0yIGgtMiByb3VuZGVkLWZ1bGwgJHtkb2NTeW5jQ2xhc3MoZG9jLnN5bmNTdGF0dXMpfVwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+JHtkb2Muc3luY1N0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYCkuam9pbignJyk7XG5cbiAgICAgICAgZmlsZUxpc3QucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZG9jLXBhdGhdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNlbGVjdERvY3VtZW50KGVsLmRhdGFzZXQuZG9jUGF0aCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVtcHR5TXNnKSBlbXB0eU1zZy5zdHlsZS5kaXNwbGF5ID0gZmlsdGVyZWQubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIC8vIEVkaXRvclxuICAgIGNvbnN0IGVkaXRvclBhbmVsID0gJCgnZWRpdG9yLXBhbmVsJyk7XG4gICAgY29uc3QgZWRpdG9yRW1wdHkgPSAkKCdlZGl0b3ItZW1wdHknKTtcbiAgICBjb25zdCBzaG93RWRpdG9yID0gc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSBudWxsIHx8IHN0YXRlLmlzTmV3O1xuXG4gICAgaWYgKGVkaXRvclBhbmVsKSBlZGl0b3JQYW5lbC5zdHlsZS5kaXNwbGF5ID0gc2hvd0VkaXRvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKGVkaXRvckVtcHR5KSBlZGl0b3JFbXB0eS5zdHlsZS5kaXNwbGF5ID0gc2hvd0VkaXRvciA/ICdub25lJyA6ICdibG9jayc7XG5cbiAgICBpZiAoc2hvd0VkaXRvcikge1xuICAgICAgICBjb25zdCB0aXRsZUlucHV0ID0gJCgnZWRpdG9yLXRpdGxlJyk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRBcmVhID0gJCgnZWRpdG9yLWNvbnRlbnQnKTtcbiAgICAgICAgY29uc3Qgc2F2ZUJ0biA9ICQoJ3NhdmUtZG9jLWJ0bicpO1xuICAgICAgICBjb25zdCBkZWxldGVCdG4gPSAkKCdkZWxldGUtZG9jLWJ0bicpO1xuICAgICAgICBjb25zdCBkaXJ0eUxhYmVsID0gJCgnZGlydHktbGFiZWwnKTtcblxuICAgICAgICBpZiAodGl0bGVJbnB1dCkgdGl0bGVJbnB1dC52YWx1ZSA9IHN0YXRlLmVkaXRvclRpdGxlO1xuICAgICAgICBpZiAoY29udGVudEFyZWEpIGNvbnRlbnRBcmVhLnZhbHVlID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgaWYgKHNhdmVCdG4pIHtcbiAgICAgICAgICAgIHNhdmVCdG4uZGlzYWJsZWQgPSBzdGF0ZS5zYXZpbmcgfHwgc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIHNhdmVCdG4udGV4dENvbnRlbnQgPSBzdGF0ZS5zYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsZXRlQnRuKSBkZWxldGVCdG4uc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gbnVsbCAmJiAhc3RhdGUuaXNOZXcgPyAnaW5saW5lLWJsb2NrJyA6ICdub25lJztcbiAgICAgICAgaWYgKGRpcnR5TGFiZWwpIGRpcnR5TGFiZWwuc3R5bGUuZGlzcGxheSA9IGlzRGlydHkoKSA/ICdpbmxpbmUnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFNlYXJjaFxuICAgIGNvbnN0IHNlYXJjaElucHV0ID0gJCgnc2VhcmNoLWlucHV0Jyk7XG4gICAgaWYgKHNlYXJjaElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHNlYXJjaElucHV0KSB7XG4gICAgICAgIHNlYXJjaElucHV0LnZhbHVlID0gc3RhdGUuc2VhcmNoUXVlcnk7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBuZXdEb2N1bWVudCgpIHtcbiAgICBzdGF0ZS5pc05ldyA9IHRydWU7XG4gICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChwYXRoKTtcbiAgICBpZiAoIWRvYykgcmV0dXJuO1xuXG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBwYXRoO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gZG9jLnBhdGg7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBkb2MuY29udGVudDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50KCkge1xuICAgIGNvbnN0IHRpdGxlID0gc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpO1xuICAgIGlmICghdGl0bGUpIHJldHVybjtcblxuICAgIHN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAndmF1bHQucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IHBhdGg6IHRpdGxlLCBjb250ZW50OiBzdGF0ZS5lZGl0b3JDb250ZW50IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCAmJiBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwodGl0bGUsIHN0YXRlLmVkaXRvckNvbnRlbnQsICdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgc2hvd1RvYXN0KCdTYXZlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwodGl0bGUsIHN0YXRlLmVkaXRvckNvbnRlbnQsICdsb2NhbC1vbmx5Jyk7XG4gICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoICYmIHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gdGl0bGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHN0YXRlLnNlbGVjdGVkUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgc2hvd1RvYXN0KCdTYXZlZCBsb2NhbGx5IChyZWxheSBlcnJvcjogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSArICcpJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKSwgc3RhdGUuZWRpdG9yQ29udGVudCwgJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpO1xuICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gc3RhdGUuZWRpdG9yVGl0bGU7XG4gICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgc2hvd1RvYXN0KCdTYXZlZCBsb2NhbGx5IChvZmZsaW5lKScpO1xuICAgIH1cblxuICAgIHN0YXRlLnNhdmluZyA9IGZhbHNlO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVEb2N1bWVudCgpIHtcbiAgICBpZiAoIXN0YXRlLnNlbGVjdGVkUGF0aCkgcmV0dXJuO1xuICAgIGlmICghY29uZmlybShgRGVsZXRlIFwiJHtzdGF0ZS5zZWxlY3RlZFBhdGh9XCI/YCkpIHJldHVybjtcblxuICAgIGNvbnN0IGRvYyA9IGF3YWl0IGdldERvY3VtZW50KHN0YXRlLnNlbGVjdGVkUGF0aCk7XG5cbiAgICBpZiAoZG9jPy5ldmVudElkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAga2luZDogJ3ZhdWx0LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBwYXRoOiBzdGF0ZS5zZWxlY3RlZFBhdGgsIGV2ZW50SWQ6IGRvYy5ldmVudElkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoXykge31cbiAgICB9XG5cbiAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHN0YXRlLnNlbGVjdGVkUGF0aCk7XG4gICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gJyc7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgc2hvd1RvYXN0KCdEZWxldGVkJyk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNBbGwoKSB7XG4gICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdzeW5jaW5nJztcbiAgICBzdGF0ZS5zeW5jRXJyb3IgPSAnJztcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmZldGNoJyB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2NhbERvY3MgPSBhd2FpdCBnZXRWYXVsdEluZGV4KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCByZW1vdGUgb2YgcmVzdWx0LmRvY3VtZW50cykge1xuICAgICAgICAgICAgY29uc3QgbG9jYWwgPSBsb2NhbERvY3NbcmVtb3RlLnBhdGhdO1xuXG4gICAgICAgICAgICBpZiAoIWxvY2FsKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwocmVtb3RlLnBhdGgsIHJlbW90ZS5jb250ZW50LCAnc3luY2VkJywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5zeW5jU3RhdHVzID09PSAnbG9jYWwtb25seScpIHtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwuY29udGVudCAhPT0gcmVtb3RlLmNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3luY1N0YXR1cyhyZW1vdGUucGF0aCwgJ2NvbmZsaWN0JywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWxvY2FsLnJlbGF5Q3JlYXRlZEF0IHx8IHJlbW90ZS5jcmVhdGVkQXQgPiBsb2NhbC5yZWxheUNyZWF0ZWRBdCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHJlbW90ZS5wYXRoLCByZW1vdGUuY29udGVudCwgJ3N5bmNlZCcsIHJlbW90ZS5ldmVudElkLCByZW1vdGUuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoID09PSByZW1vdGUucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gcmVtb3RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHJlbW90ZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdpZGxlJztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICBzdGF0ZS5zeW5jRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAkKCduZXctZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG5ld0RvY3VtZW50KTtcbiAgICAkKCdzeW5jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN5bmNBbGwpO1xuICAgICQoJ3NhdmUtZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVEb2N1bWVudCk7XG4gICAgJCgnZGVsZXRlLWRvYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWxldGVEb2N1bWVudCk7XG5cbiAgICAkKCdzZWFyY2gtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5zZWFyY2hRdWVyeSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ2VkaXRvci10aXRsZScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmVkaXRvclRpdGxlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnZWRpdG9yLWNvbnRlbnQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgc3RhdGUucmVsYXlJbmZvID0gcmVsYXlzIHx8IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIGlmIChoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7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
