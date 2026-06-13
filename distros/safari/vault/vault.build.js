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
    },
    // --- storage.sync ----------------------------------------------------------
    // Null when the browser doesn't support sync (older Safari, etc.)
    sync: _browser.storage?.sync ? {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.sync.get(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.sync.set(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.set)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.sync.remove(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.remove)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.sync.clear(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.clear)(...args);
      },
      getBytesInUse(...args) {
        if (!_browser.storage.sync.getBytesInUse) {
          return Promise.resolve(0);
        }
        if (!isChrome) {
          return _browser.storage.sync.getBytesInUse(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.getBytesInUse)(...args);
      }
    } : null,
    // --- storage.onChanged -----------------------------------------------------
    onChanged: _browser.storage?.onChanged || null
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
    },
    sendMessage(...args) {
      if (!isChrome) {
        return _browser.tabs.sendMessage(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.sendMessage)(...args);
    }
  };
  api.alarms = _browser.alarms ? {
    create(...args) {
      const result = _browser.alarms.create(...args);
      return result && typeof result.then === "function" ? result : Promise.resolve();
    },
    clear(...args) {
      if (!isChrome) {
        return _browser.alarms.clear(...args);
      }
      return promisify(_browser.alarms, _browser.alarms.clear)(...args);
    },
    onAlarm: _browser.alarms.onAlarm
  } : null;

  // src/utilities/sync-manager.js
  var SYNC_QUOTA = 102400;
  var MAX_ITEM = 8192;
  var MAX_ITEMS = 512;
  var CHUNK_PREFIX = "_chunk:";
  var SYNC_META_KEY = "_sync_meta";
  var LOCAL_ENABLED_KEY = "platformSyncEnabled";
  var PRIORITY = {
    P1_PROFILES: 1,
    P2_SETTINGS: 2,
    P3_APIKEYS: 3,
    P4_VAULT: 4
  };
  var storage = api.storage.local;
  var pushTimer = null;
  function chunkValue(key, jsonString) {
    const chunks = [];
    for (let i = 0; i < jsonString.length; i += MAX_ITEM - 100) {
      chunks.push(jsonString.slice(i, i + MAX_ITEM - 100));
    }
    if (chunks.length === 1) {
      return [{ key, value: jsonString }];
    }
    const entries = [];
    for (let i = 0; i < chunks.length; i++) {
      entries.push({ key: `${CHUNK_PREFIX}${key}:${i}`, value: chunks[i] });
    }
    entries.push({ key, value: JSON.stringify({ __chunked: true, count: chunks.length }) });
    return entries;
  }
  async function buildSyncPayload() {
    const all = await storage.get(null);
    const entries = [];
    if (all.profiles) {
      const cleanProfiles = all.profiles.map((p) => {
        const { hosts, ...rest } = p;
        return rest;
      });
      const json = JSON.stringify(cleanProfiles);
      entries.push({ key: "profiles", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    if (all.profileIndex != null) {
      const json = JSON.stringify(all.profileIndex);
      entries.push({ key: "profileIndex", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    const settingsKeys = ["autoLockMinutes", "version", "protocol_handler", LOCAL_ENABLED_KEY];
    for (const k of settingsKeys) {
      if (all[k] != null) {
        const json = JSON.stringify(all[k]);
        entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
      }
    }
    for (const k of Object.keys(all)) {
      if (k.startsWith("feature:")) {
        const json = JSON.stringify(all[k]);
        entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
      }
    }
    if (all.apiKeyVault) {
      const json = JSON.stringify(all.apiKeyVault);
      entries.push({ key: "apiKeyVault", jsonString: json, priority: PRIORITY.P3_APIKEYS, size: json.length });
    }
    if (all.vaultDocs && typeof all.vaultDocs === "object") {
      const docs = Object.values(all.vaultDocs).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      for (const doc of docs) {
        const docKey = `vaultDoc:${doc.path}`;
        const json = JSON.stringify(doc);
        entries.push({ key: docKey, jsonString: json, priority: PRIORITY.P4_VAULT, size: json.length });
      }
    }
    return entries;
  }
  async function pushToSync() {
    if (!api.storage.sync) return;
    const enabled = await isSyncEnabled();
    if (!enabled) return;
    try {
      const entries = await buildSyncPayload();
      entries.sort((a, b) => a.priority - b.priority);
      let usedBytes = 0;
      let usedItems = 0;
      const syncPayload = {};
      const allSyncKeys = [];
      let budgetExhausted = false;
      for (const entry of entries) {
        if (budgetExhausted) break;
        const chunks = chunkValue(entry.key, entry.jsonString);
        let entrySize = 0;
        for (const c of chunks) {
          entrySize += c.key.length + (typeof c.value === "string" ? c.value.length : JSON.stringify(c.value).length);
        }
        if (usedBytes + entrySize > SYNC_QUOTA - 500 || usedItems + chunks.length > MAX_ITEMS - 5) {
          if (entry.priority <= PRIORITY.P3_APIKEYS) {
          } else {
            console.warn(`[SyncManager] Budget exhausted at priority ${entry.priority}, skipping remaining entries`);
            budgetExhausted = true;
            break;
          }
        }
        for (const c of chunks) {
          syncPayload[c.key] = c.value;
          allSyncKeys.push(c.key);
        }
        usedBytes += entrySize;
        usedItems += chunks.length;
      }
      const meta = {
        lastWrittenAt: Date.now(),
        keys: allSyncKeys
      };
      syncPayload[SYNC_META_KEY] = JSON.stringify(meta);
      await api.storage.sync.set(syncPayload);
      try {
        const existing = await api.storage.sync.get(null);
        const orphanKeys = Object.keys(existing).filter(
          (k) => k !== SYNC_META_KEY && !allSyncKeys.includes(k)
        );
        if (orphanKeys.length > 0) {
          await api.storage.sync.remove(orphanKeys);
        }
      } catch {
      }
      console.log(`[SyncManager] Pushed ${allSyncKeys.length} entries (${usedBytes} bytes) to sync storage`);
    } catch (e) {
      console.error("[SyncManager] pushToSync error:", e);
    }
  }
  function scheduleSyncPush() {
    if (!api.storage.sync) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      pushTimer = null;
      pushToSync();
    }, 2e3);
  }
  async function isSyncEnabled() {
    const data = await storage.get({ [LOCAL_ENABLED_KEY]: true });
    return data[LOCAL_ENABLED_KEY];
  }

  // src/utilities/vault-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "vaultDocs";
  async function getDocs() {
    const data = await storage2.get({ [STORAGE_KEY]: {} });
    return data[STORAGE_KEY] || {};
  }
  async function setDocs(docs) {
    await storage2.set({ [STORAGE_KEY]: docs });
    scheduleSyncPush();
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
    const existing = docs[path];
    docs[path] = {
      path,
      content,
      updatedAt: Math.floor(Date.now() / 1e3),
      syncStatus,
      eventId,
      relayCreatedAt,
      profileScope: existing?.profileScope ?? null
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
                class="doc-item ${state.selectedPath === doc.path ? "selected" : ""}"
                data-doc-path="${doc.path}"
            >
                <div class="font-bold text-sm truncate" style="color:#f8f8f2;">${doc.path}</div>
                <div class="doc-sync flex items-center gap-1">
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
    const isEncrypted = await api.runtime.sendMessage({ kind: "isEncrypted" });
    const gate = $("vault-locked-gate");
    const main = $("vault-main-content");
    if (!isEncrypted) {
      if (gate) gate.style.display = "block";
      if (main) main.style.display = "none";
      $("gate-security-btn")?.addEventListener("click", () => {
        const url = api.runtime.getURL("security/security.html");
        window.open(url, "nostrkey-options");
      });
      return;
    }
    if (gate) gate.style.display = "none";
    if (main) main.style.display = "block";
    try {
      const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
      state.relayInfo = relays || { read: [], write: [] };
    } catch (e) {
      console.warn("[vault] Failed to load relays:", e.message);
      state.relayInfo = { read: [], write: [] };
    }
    try {
      state.documents = await listDocuments();
    } catch (e) {
      console.error("[vault] Failed to load documents:", e.message);
      state.documents = [];
    }
    bindEvents();
    render();
    if (hasRelays()) {
      try {
        await syncAll();
      } catch (e) {
        console.warn("[vault] Sync failed:", e.message);
      }
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc3luYy1tYW5hZ2VyLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdmF1bHQtc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBTeW5jIE1hbmFnZXIgXHUyMDE0IFBsYXRmb3JtIHN5bmMgdmlhIHN0b3JhZ2Uuc3luYyAoQ2hyb21lIFx1MjE5MiBHb29nbGUsIFNhZmFyaSBcdTIxOTIgaUNsb3VkKVxuICpcbiAqIEFyY2hpdGVjdHVyZTpcbiAqICAgV3JpdGU6IGFwcCBcdTIxOTIgc3RvcmFnZS5sb2NhbCBcdTIxOTIgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjE5MiBzdG9yYWdlLnN5bmNcbiAqICAgUmVhZDogIHB1bGxGcm9tU3luYygpIG9uIHN0YXJ0dXAgXHUyMTkyIG1lcmdlIGludG8gc3RvcmFnZS5sb2NhbFxuICogICBMaXN0ZW46IHN0b3JhZ2Uub25DaGFuZ2VkKFwic3luY1wiKSBcdTIxOTIgbWVyZ2UgcmVtb3RlIGNoYW5nZXMgaW50byBsb2NhbFxuICpcbiAqIHN0b3JhZ2UubG9jYWwgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoLiBzdG9yYWdlLnN5bmMgaXMgYSBiZXN0LWVmZm9ydCBtaXJyb3IuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgU1lOQ19RVU9UQSA9IDEwMl80MDA7ICAgICAgIC8vIDEwMCBLQiB0b3RhbFxuY29uc3QgTUFYX0lURU0gPSA4XzE5MjsgICAgICAgICAgIC8vIDggS0IgcGVyIGl0ZW1cbmNvbnN0IE1BWF9JVEVNUyA9IDUxMjtcbmNvbnN0IENIVU5LX1BSRUZJWCA9ICdfY2h1bms6JztcbmNvbnN0IFNZTkNfTUVUQV9LRVkgPSAnX3N5bmNfbWV0YSc7XG5jb25zdCBMT0NBTF9FTkFCTEVEX0tFWSA9ICdwbGF0Zm9ybVN5bmNFbmFibGVkJztcblxuLy8gS2V5cyB0aGF0IHNob3VsZCBuZXZlciBiZSBzeW5jZWRcbmNvbnN0IEVYQ0xVREVEX0tFWVMgPSBbXG4gICAgJ2J1bmtlclNlc3Npb25zJyxcbiAgICAnaWdub3JlSW5zdGFsbEhvb2snLFxuICAgICdwYXNzd29yZEhhc2gnLFxuICAgICdwYXNzd29yZFNhbHQnLFxuXTtcblxuLy8gUHJpb3JpdHkgdGllcnMgZm9yIGJ1ZGdldCBhbGxvY2F0aW9uXG5jb25zdCBQUklPUklUWSA9IHtcbiAgICBQMV9QUk9GSUxFUzogMSxcbiAgICBQMl9TRVRUSU5HUzogMixcbiAgICBQM19BUElLRVlTOiAzLFxuICAgIFA0X1ZBVUxUOiA0LFxufTtcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xubGV0IHB1c2hUaW1lciA9IG51bGw7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ2h1bmtpbmcgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU3BsaXQgYSBKU09OLXNlcmlhbGlzZWQgdmFsdWUgaW50byA8PThLQiBjaHVua3MuXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHsga2V5LCB2YWx1ZSB9IHBhaXJzIHJlYWR5IGZvciBzdG9yYWdlLnN5bmMuc2V0KCkuXG4gKi9cbmZ1bmN0aW9uIGNodW5rVmFsdWUoa2V5LCBqc29uU3RyaW5nKSB7XG4gICAgY29uc3QgY2h1bmtzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqc29uU3RyaW5nLmxlbmd0aDsgaSArPSBNQVhfSVRFTSAtIDEwMCkge1xuICAgICAgICAvLyBSZXNlcnZlIH4xMDAgYnl0ZXMgZm9yIHRoZSBrZXkgb3ZlcmhlYWQgaW4gdGhlIHN0b3JlZCBpdGVtXG4gICAgICAgIGNodW5rcy5wdXNoKGpzb25TdHJpbmcuc2xpY2UoaSwgaSArIE1BWF9JVEVNIC0gMTAwKSk7XG4gICAgfVxuICAgIGlmIChjaHVua3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpdHMgaW4gYSBzaW5nbGUgaXRlbSBcdTIwMTQgc3RvcmUgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIFt7IGtleSwgdmFsdWU6IGpzb25TdHJpbmcgfV07XG4gICAgfVxuICAgIC8vIE11bHRpcGxlIGNodW5rc1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWAsIHZhbHVlOiBjaHVua3NbaV0gfSk7XG4gICAgfVxuICAgIC8vIFN0b3JlIGEgbWV0YWRhdGEgZW50cnkgc28gd2Uga25vdyBob3cgbWFueSBjaHVua3MgdGhlcmUgYXJlXG4gICAgZW50cmllcy5wdXNoKHsga2V5LCB2YWx1ZTogSlNPTi5zdHJpbmdpZnkoeyBfX2NodW5rZWQ6IHRydWUsIGNvdW50OiBjaHVua3MubGVuZ3RoIH0pIH0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vKipcbiAqIFJlYXNzZW1ibGUgY2h1bmtlZCBkYXRhIGZyb20gYSBzeW5jIGRhdGEgb2JqZWN0LlxuICogUmV0dXJucyB0aGUgcGFyc2VkIEpTT04gdmFsdWUsIG9yIG51bGwgb24gZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCBzeW5jRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLl9fY2h1bmtlZCkge1xuICAgICAgICAgICAgLy8gTm90IGNodW5rZWQgXHUyMDE0IHBhcnNlIGRpcmVjdGx5XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbWJpbmVkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua0tleSA9IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWA7XG4gICAgICAgICAgICBpZiAoc3luY0RhdGFbY2h1bmtLZXldID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29tYmluZWQgKz0gc3luY0RhdGFbY2h1bmtLZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbWJpbmVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHN5bmMgcGF5bG9hZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgbG9jYWwgZGF0YSBhbmQgYnVpbGQgYSBwcmlvcml0aXNlZCBsaXN0IG9mIGVudHJpZXMgdG8gc3luYy5cbiAqIFJldHVybnMgeyBlbnRyaWVzOiBbeyBrZXksIGpzb25TdHJpbmcsIHByaW9yaXR5LCBzaXplIH1dLCB0b3RhbFNpemUgfVxuICovXG5hc3luYyBmdW5jdGlvbiBidWlsZFN5bmNQYXlsb2FkKCkge1xuICAgIGNvbnN0IGFsbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcblxuICAgIC8vIFAxOiBQcm9maWxlcyAoc3RyaXAgYGhvc3RzYCB0byBzYXZlIHNwYWNlKSArIHByb2ZpbGVJbmRleFxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IGFsbC5wcm9maWxlcy5tYXAocCA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY2xlYW5Qcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5wcm9maWxlSW5kZXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsLnByb2ZpbGVJbmRleCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVJbmRleCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIC8vIE5PVEU6IGBpc0VuY3J5cHRlZGAgaXMgaW50ZW50aW9uYWxseSBOT1Qgc3luY2VkLiBUaGUgcGFzc3dvcmQgdmVyaWZpZXJcbiAgICAvLyAocGFzc3dvcmRIYXNoL3Bhc3N3b3JkU2FsdCkgaXMgZXhjbHVkZWQgZnJvbSBzeW5jIGZvciBzZWN1cml0eSwgc28gYSBkZXZpY2VcbiAgICAvLyB0aGF0IHJlY2VpdmVkIGlzRW5jcnlwdGVkPXRydWUgd2l0aCBubyBoYXNoIHdvdWxkIGJlIHBlcm1hbmVudGx5IGxvY2tlZCBvdXRcbiAgICAvLyAoY2hlY2tQYXNzd29yZCBhbHdheXMgZmFpbHMpLiBFbmNyeXB0aW9uIHN0YXRlIGlzIHN0cmljdGx5IGRldmljZS1sb2NhbC5cblxuICAgIC8vIFAyOiBTZXR0aW5nc1xuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGsgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChhbGxba10gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhhbGwpKSB7XG4gICAgICAgIGlmIChrLnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUDM6IEFQSSBrZXkgdmF1bHRcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0KSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwuYXBpS2V5VmF1bHQpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdhcGlLZXlWYXVsdCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QM19BUElLRVlTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQNDogVmF1bHQgZG9jcyAoaW5kaXZpZHVhbGx5LCBuZXdlc3QgZmlyc3QpXG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgc3luYyBwYXlsb2FkIHJlc3BlY3RpbmcgYnVkZ2V0XG4gICAgICAgIGxldCB1c2VkQnl0ZXMgPSAwO1xuICAgICAgICBsZXQgdXNlZEl0ZW1zID0gMDtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgbGV0IGJ1ZGdldEV4aGF1c3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKGJ1ZGdldEV4aGF1c3RlZCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVmFsdWUoZW50cnkua2V5LCBlbnRyeS5qc29uU3RyaW5nKTtcbiAgICAgICAgICAgIGxldCBlbnRyeVNpemUgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgIGVudHJ5U2l6ZSArPSBjLmtleS5sZW5ndGggKyAodHlwZW9mIGMudmFsdWUgPT09ICdzdHJpbmcnID8gYy52YWx1ZS5sZW5ndGggOiBKU09OLnN0cmluZ2lmeShjLnZhbHVlKS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodXNlZEJ5dGVzICsgZW50cnlTaXplID4gU1lOQ19RVU9UQSAtIDUwMCB8fCB1c2VkSXRlbXMgKyBjaHVua3MubGVuZ3RoID4gTUFYX0lURU1TIC0gNSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5wcmlvcml0eSA8PSBQUklPUklUWS5QM19BUElLRVlTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyaXRpY2FsIGRhdGEgXHUyMDE0IHRyeSBhbnl3YXksIGxldCB0aGUgQVBJIHRocm93IGlmIHRydWx5IG92ZXJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gQnVkZ2V0IGV4aGF1c3RlZCBhdCBwcmlvcml0eSAke2VudHJ5LnByaW9yaXR5fSwgc2tpcHBpbmcgcmVtYWluaW5nIGVudHJpZXNgKTtcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0RXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgc3luY1BheWxvYWRbYy5rZXldID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgICBhbGxTeW5jS2V5cy5wdXNoKGMua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBzeW5jIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XG4gICAgICAgICAgICBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAga2V5czogYWxsU3luY0tleXMsXG4gICAgICAgIH07XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkobWV0YSk7XG5cbiAgICAgICAgLy8gV3JpdGUgdG8gc3luYyBzdG9yYWdlXG4gICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHN5bmNQYXlsb2FkKTtcblxuICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlYWQgZXhpc3Rpbmcgc3luYyBrZXlzIGFuZCByZW1vdmUgYW55IG5vdCBpbiBvdXIgcGF5bG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7YWxsU3luY0tleXMubGVuZ3RofSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgIGlmICghcmF3IHx8IE9iamVjdC5rZXlzKHJhdykubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXRhU3RyID0gcmF3W1NZTkNfTUVUQV9LRVldO1xuICAgICAgICBpZiAoIW1ldGFTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBtZXRhO1xuICAgICAgICB0cnkgeyBtZXRhID0gSlNPTi5wYXJzZShtZXRhU3RyKTsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIG5vbi1jaHVuaywgbm9uLW1ldGEga2V5c1xuICAgICAgICBjb25zdCBkYXRhS2V5cyA9IG1ldGEua2V5cy5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKENIVU5LX1BSRUZJWCkgJiYgayAhPT0gU1lOQ19NRVRBX0tFWSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHJhdyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQuX3N5bmNNZXRhID0gbWV0YTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVsbEZyb21TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWVyZ2UgbG9naWNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIE1lcmdlIHN5bmMgZGF0YSBpbnRvIGxvY2FsIHN0b3JhZ2Ugd2l0aCBjb25mbGljdCByZXNvbHV0aW9uLlxuICovXG5hc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgeyB1cGRhdGVzLCBjaGFuZ2VkIH0gPSBjb21wdXRlTWVyZ2VVcGRhdGVzKGxvY2FsLCBzeW5jRGF0YSk7XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG59XG5cbi8qKlxuICogUHVyZSBtZXJnZTogZ2l2ZW4gdGhlIGN1cnJlbnQgbG9jYWwgc3RhdGUgYW5kIGFuIGluY29taW5nIHN5bmMgcGF5bG9hZCxcbiAqIGNvbXB1dGUgdGhlIHN0b3JhZ2UgdXBkYXRlcyB0byBhcHBseS4gTm8gSS9PIFx1MjAxNCBleHBvcnRlZCBzbyB0aGUgbWVyZ2UgcnVsZXNcbiAqIChmcmVzaC1pbnN0YWxsIGRldGVjdGlvbiwgcHVia2V5LWtleWVkIHByb2ZpbGUgbWF0Y2hpbmcsIGVuY3J5cHRpb24tc3RhdGVcbiAqIGV4Y2x1c2lvbikgY2FuIGJlIHJlZ3Jlc3Npb24tdGVzdGVkIGRpcmVjdGx5LlxuICpcbiAqIEByZXR1cm5zIHt7IHVwZGF0ZXM6IE9iamVjdCwgY2hhbmdlZDogYm9vbGVhbiB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZU1lcmdlVXBkYXRlcyhsb2NhbCwgc3luY0RhdGEpIHtcbiAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAoIXN5bmNEYXRhKSByZXR1cm4geyB1cGRhdGVzLCBjaGFuZ2VkIH07XG5cbiAgICAvLyBEZXRlY3QgZnJlc2ggaW5zdGFsbDogbm8gcHJvZmlsZXMsIG9yIG9ubHkgcHJvZmlsZShzKSB0aGF0IGNhcnJ5IG5vXG4gICAgLy8gaWRlbnRpdHkgYXQgYWxsIChubyBwcml2YXRlIGtleSwgbm8gY2FjaGVkIHB1YmtleSwgbm90IGEgYnVua2VyL3JlbW90ZVxuICAgIC8vIHNpZ25lcikuIEEgYnVua2VyIHByb2ZpbGUgbGVnaXRpbWF0ZWx5IGhhcyBwcml2S2V5OicnIGJ1dCBJUyBhIHJlYWxcbiAgICAvLyBpZGVudGl0eSBcdTIwMTQgaXQgbXVzdCBub3QgYmUgdHJlYXRlZCBhcyBhIGJsYW5rIGluc3RhbGwgYW5kIHdpcGVkLlxuICAgIGNvbnN0IGhhc0lkZW50aXR5ID0gKHApID0+XG4gICAgICAgICEhKHAucHJpdktleSB8fCBwLnB1YktleSB8fCBwLnR5cGUgPT09ICdidW5rZXInIHx8IHAuYnVua2VyVXJsIHx8IHAucmVtb3RlUHVia2V5KTtcbiAgICBjb25zdCBpc0ZyZXNoID0gIWxvY2FsLnByb2ZpbGVzIHx8XG4gICAgICAgIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAhbG9jYWwucHJvZmlsZXMuc29tZShoYXNJZGVudGl0eSk7XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGluc3RhbGwgXHUyMDE0IGFkb3B0IHN5bmMgcHJvZmlsZXMgZW50aXJlbHlcbiAgICAgICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcztcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAvLyBNYXRjaCBwcm9maWxlcyBieSBwdWJrZXkgKHN0YWJsZSBpZGVudGl0eSksIE5PVCBhcnJheSBpbmRleCBcdTIwMTRcbiAgICAgICAgICAgIC8vIHJlb3JkZXJpbmcgb3IgaW5zZXJ0aW5nIGEgcHJvZmlsZSBvbiBvbmUgZGV2aWNlIG11c3QgbmV2ZXIgY2F1c2VcbiAgICAgICAgICAgIC8vIG9uZSBpZGVudGl0eSdzIGtleSBtYXRlcmlhbCB0byBvdmVyd3JpdGUgYW4gdW5yZWxhdGVkIHByb2ZpbGUuXG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbLi4ubG9jYWwucHJvZmlsZXNdO1xuICAgICAgICAgICAgY29uc3QgaW5kZXhCeVB1YmtleSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIG1lcmdlZC5mb3JFYWNoKChwLCBpKSA9PiB7IGlmIChwLnB1YktleSkgaW5kZXhCeVB1YmtleS5zZXQocC5wdWJLZXksIGkpOyB9KTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBzeW5jUHJvZmlsZSBvZiBzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsSWR4ID0gc3luY1Byb2ZpbGUucHViS2V5ICE9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgPyBpbmRleEJ5UHVia2V5LmdldChzeW5jUHJvZmlsZS5wdWJLZXkpXG4gICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsSWR4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gbG9jYWwgcHJvZmlsZSB3aXRoIHRoaXMgcHVia2V5IFx1MjAxNCBpdCdzIGEgbmV3IG9uZSBmcm9tIHN5bmMuXG4gICAgICAgICAgICAgICAgICAgIC8vIChQcm9maWxlcyB3aXRob3V0IGEgcHVia2V5IGNhbid0IGJlIHNhZmVseSBtYXRjaGVkLCBzbyB3ZSBhZGRcbiAgICAgICAgICAgICAgICAgICAgLy8gcmF0aGVyIHRoYW4gcmlzayBjbG9iYmVyaW5nIGFuIHVucmVsYXRlZCBsb2NhbCBwcm9maWxlLilcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkLnB1c2goc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3luY1Byb2ZpbGUucHViS2V5KSBpbmRleEJ5UHVia2V5LnNldChzeW5jUHJvZmlsZS5wdWJLZXksIG1lcmdlZC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkW2xvY2FsSWR4XTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3luY1RpbWUgPSBzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxUaW1lID0gbG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3luY1RpbWUgPiBsb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN5bmMgaXMgbmV3ZXIgXHUyMDE0IG1lcmdlIGJ1dCBwcmVzZXJ2ZSBsb2NhbCBob3N0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2xvY2FsSWR4XSA9IHsgLi4uc3luY1Byb2ZpbGUsIGhvc3RzOiBsb2NhbFByb2ZpbGUuaG9zdHMgfHwge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHVwZGF0ZXMucHJvZmlsZXMgPSBtZXJnZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIC0tLVxuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlSW5kZXggIT0gbnVsbCAmJiBpc0ZyZXNoKSB7XG4gICAgICAgIHVwZGF0ZXMucHJvZmlsZUluZGV4ID0gc3luY0RhdGEucHJvZmlsZUluZGV4O1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAtLS0gRW5jcnlwdGlvbiBzdGF0ZSAoUDEpIC0tLVxuICAgIC8vIEludGVudGlvbmFsbHkgTk9UIG1lcmdlZCBmcm9tIHN5bmMuIFNlZSBidWlsZFN5bmNQYXlsb2FkKCk6IHRoZSBwYXNzd29yZFxuICAgIC8vIHZlcmlmaWVyIGlzIG5ldmVyIHN5bmNlZCwgc28gdHJ1c3RpbmcgYSBzeW5jZWQgaXNFbmNyeXB0ZWQ9dHJ1ZSB3b3VsZCBsb2NrXG4gICAgLy8gdGhlIHVzZXIgb3V0IHBlcm1hbmVudGx5LiBFbmNyeXB0aW9uIHN0YXRlIHN0YXlzIGRldmljZS1sb2NhbC5cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc3luY01ldGEgPSBzeW5jRGF0YS5fc3luY01ldGEgfHwge307XG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBoaWdoZXJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIHN5bmNEYXRhLnZlcnNpb24gPD0gbG9jYWwudmVyc2lvbikgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEFQSSBLZXkgVmF1bHQgKFAzKSAtLS1cbiAgICBpZiAoc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgaWYgKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1lcmdlIGluZGl2aWR1YWwga2V5cyBieSB1cGRhdGVkQXRcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IGxvY2FsLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBzeW5jS2V5cyA9IHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLmxvY2FsS2V5cyB9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIHN5bmNLZXldIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNLZXlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5ID0gbWVyZ2VkW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsS2V5IHx8IChzeW5jS2V5LnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbEtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2lkXSA9IHN5bmNLZXk7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4ubG9jYWwuYXBpS2V5VmF1bHQsIGtleXM6IG1lcmdlZCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCBsb2NhbERvY3MgPSBsb2NhbC52YXVsdERvY3MgfHwge307XG4gICAgbGV0IGRvY3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgbWVyZ2VkRG9jcyA9IHsgLi4ubG9jYWxEb2NzIH07XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbG9jYWxEb2MgPSBtZXJnZWREb2NzW2RvYy5wYXRoXTtcbiAgICAgICAgaWYgKCFsb2NhbERvYyB8fCAoZG9jLnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbERvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgIG1lcmdlZERvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgICAgICAgICAgZG9jc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7IHVwZGF0ZXMsIGNoYW5nZWQgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBWYXVsdCBTdG9yZSBcdTIwMTQgTG9jYWwgY2FjaGUgZm9yIGVuY3J5cHRlZCB2YXVsdCBkb2N1bWVudHNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIHZhdWx0RG9jczoge1xuICogICAgIFwicGF0aC90by9maWxlLm1kXCI6IHtcbiAqICAgICAgIHBhdGgsIGNvbnRlbnQsIHVwZGF0ZWRBdCwgc3luY1N0YXR1cywgZXZlbnRJZCwgcmVsYXlDcmVhdGVkQXQsXG4gKiAgICAgICBwcm9maWxlU2NvcGVcbiAqICAgICB9XG4gKiAgIH1cbiAqXG4gKiBzeW5jU3RhdHVzOiBcInN5bmNlZFwiIHwgXCJsb2NhbC1vbmx5XCIgfCBcImNvbmZsaWN0XCJcbiAqIHByb2ZpbGVTY29wZTogbnVsbCAoYWxsIHByb2ZpbGVzKSB8IG51bWJlcltdIChzcGVjaWZpYyBwcm9maWxlIGluZGljZXMpXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IHNjaGVkdWxlU3luY1B1c2ggfSBmcm9tICcuL3N5bmMtbWFuYWdlcic7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmNvbnN0IFNUT1JBR0VfS0VZID0gJ3ZhdWx0RG9jcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERvY3MoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXToge30gfSk7XG4gICAgcmV0dXJuIGRhdGFbU1RPUkFHRV9LRVldIHx8IHt9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXREb2NzKGRvY3MpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IGRvY3MgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCB2YXVsdCBkb2NzIG9iamVjdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IE1hcCBvZiBwYXRoIC0+IGRvY1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmF1bHRJbmRleCgpIHtcbiAgICByZXR1cm4gZ2V0RG9jcygpO1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBkb2N1bWVudCBieSBwYXRoLlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdHxudWxsPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIHJldHVybiBkb2NzW3BhdGhdIHx8IG51bGw7XG59XG5cbi8qKlxuICogU2F2ZSBvciB1cGRhdGUgYSBkb2N1bWVudCBpbiB0aGUgbG9jYWwgY2FjaGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlRG9jdW1lbnRMb2NhbChwYXRoLCBjb250ZW50LCBzeW5jU3RhdHVzLCBldmVudElkID0gbnVsbCwgcmVsYXlDcmVhdGVkQXQgPSBudWxsKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBjb25zdCBleGlzdGluZyA9IGRvY3NbcGF0aF07XG4gICAgZG9jc1twYXRoXSA9IHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgY29udGVudCxcbiAgICAgICAgdXBkYXRlZEF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICAgICAgc3luY1N0YXR1cyxcbiAgICAgICAgZXZlbnRJZCxcbiAgICAgICAgcmVsYXlDcmVhdGVkQXQsXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgYXdhaXQgc2V0RG9jcyhkb2NzKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXTtcbn1cblxuLyoqXG4gKiBEZWxldGUgYSBkb2N1bWVudCBmcm9tIHRoZSBsb2NhbCBjYWNoZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZURvY3VtZW50TG9jYWwocGF0aCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgZGVsZXRlIGRvY3NbcGF0aF07XG4gICAgYXdhaXQgc2V0RG9jcyhkb2NzKTtcbn1cblxuLyoqXG4gKiBMaXN0IGFsbCBkb2N1bWVudHMgc29ydGVkIGJ5IHVwZGF0ZWRBdCBkZXNjZW5kaW5nLlxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fSBTb3J0ZWQgYXJyYXkgb2YgZG9jIG1ldGFkYXRhXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0RG9jdW1lbnRzKCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoZG9jcykuc29ydCgoYSwgYikgPT4gYi51cGRhdGVkQXQgLSBhLnVwZGF0ZWRBdCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzeW5jIHN0YXR1cyAoYW5kIG9wdGlvbmFsbHkgZXZlbnRJZC9yZWxheUNyZWF0ZWRBdCkgZm9yIGEgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTeW5jU3RhdHVzKHBhdGgsIHN0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgaWYgKCFkb2NzW3BhdGhdKSByZXR1cm4gbnVsbDtcbiAgICBkb2NzW3BhdGhdLnN5bmNTdGF0dXMgPSBzdGF0dXM7XG4gICAgaWYgKGV2ZW50SWQgIT09IG51bGwpIGRvY3NbcGF0aF0uZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBkb2NzW3BhdGhdLnJlbGF5Q3JlYXRlZEF0ID0gcmVsYXlDcmVhdGVkQXQ7XG4gICAgYXdhaXQgc2V0RG9jcyhkb2NzKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXTtcbn1cbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQge1xuICAgIGdldFZhdWx0SW5kZXgsXG4gICAgZ2V0RG9jdW1lbnQsXG4gICAgc2F2ZURvY3VtZW50TG9jYWwsXG4gICAgZGVsZXRlRG9jdW1lbnRMb2NhbCxcbiAgICBsaXN0RG9jdW1lbnRzLFxuICAgIHVwZGF0ZVN5bmNTdGF0dXMsXG59IGZyb20gJy4uL3V0aWxpdGllcy92YXVsdC1zdG9yZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGRvY3VtZW50czogW10sXG4gICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgIHNlbGVjdGVkUGF0aDogbnVsbCxcbiAgICBlZGl0b3JUaXRsZTogJycsXG4gICAgZWRpdG9yQ29udGVudDogJycsXG4gICAgcHJpc3RpbmVUaXRsZTogJycsXG4gICAgcHJpc3RpbmVDb250ZW50OiAnJyxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsXG4gICAgc3luY0Vycm9yOiAnJyxcbiAgICBzYXZpbmc6IGZhbHNlLFxuICAgIGlzTmV3OiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlcmVkRG9jdW1lbnRzKCkge1xuICAgIGlmICghc3RhdGUuc2VhcmNoUXVlcnkpIHJldHVybiBzdGF0ZS5kb2N1bWVudHM7XG4gICAgY29uc3QgcSA9IHN0YXRlLnNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHN0YXRlLmRvY3VtZW50cy5maWx0ZXIoZCA9PiBkLnBhdGgudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHN0YXRlLmVkaXRvckNvbnRlbnQgIT09IHN0YXRlLnByaXN0aW5lQ29udGVudCB8fCBzdGF0ZS5lZGl0b3JUaXRsZSAhPT0gc3RhdGUucHJpc3RpbmVUaXRsZTtcbn1cblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1zZykge1xuICAgIHN0YXRlLnRvYXN0ID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS50b2FzdCA9ICcnOyByZW5kZXIoKTsgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNDbGFzcyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiAnYmctZ3JlZW4tNTAwJztcbiAgICBpZiAoc3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnYmcteWVsbG93LTUwMCBhbmltYXRlLXB1bHNlJztcbiAgICByZXR1cm4gJ2JnLXJlZC01MDAnO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzVGV4dCgpIHtcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ1N5bmNpbmcuLi4nO1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnZXJyb3InKSByZXR1cm4gc3RhdGUuc3luY0Vycm9yO1xuICAgIHJldHVybiAnU3luY2VkJztcbn1cblxuZnVuY3Rpb24gZG9jU3luY0NsYXNzKHN5bmNTdGF0dXMpIHtcbiAgICBpZiAoc3luY1N0YXR1cyA9PT0gJ3N5bmNlZCcpIHJldHVybiAnYmctZ3JlZW4tNTAwJztcbiAgICBpZiAoc3luY1N0YXR1cyA9PT0gJ2xvY2FsLW9ubHknKSByZXR1cm4gJ2JnLXllbGxvdy01MDAnO1xuICAgIHJldHVybiAnYmctcmVkLTUwMCc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3QgZG9jQ291bnQgPSAkKCdkb2MtY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBpbmxpbmUtYmxvY2sgdy0zIGgtMyByb3VuZGVkLWZ1bGwgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCk7XG4gICAgaWYgKGRvY0NvdW50KSBkb2NDb3VudC50ZXh0Q29udGVudCA9IHN0YXRlLmRvY3VtZW50cy5sZW5ndGggKyAnIGRvYycgKyAoc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEZpbGUgbGlzdFxuICAgIGNvbnN0IGZpbGVMaXN0ID0gJCgnZmlsZS1saXN0Jyk7XG4gICAgY29uc3QgZW1wdHlNc2cgPSAkKCduby1kb2N1bWVudHMnKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGdldEZpbHRlcmVkRG9jdW1lbnRzKCk7XG5cbiAgICBpZiAoZmlsZUxpc3QpIHtcbiAgICAgICAgZmlsZUxpc3QuaW5uZXJIVE1MID0gZmlsdGVyZWQubWFwKGRvYyA9PiBgXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJkb2MtaXRlbSAke3N0YXRlLnNlbGVjdGVkUGF0aCA9PT0gZG9jLnBhdGggPyAnc2VsZWN0ZWQnIDogJyd9XCJcbiAgICAgICAgICAgICAgICBkYXRhLWRvYy1wYXRoPVwiJHtkb2MucGF0aH1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb250LWJvbGQgdGV4dC1zbSB0cnVuY2F0ZVwiIHN0eWxlPVwiY29sb3I6I2Y4ZjhmMjtcIj4ke2RvYy5wYXRofTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkb2Mtc3luYyBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImlubGluZS1ibG9jayB3LTIgaC0yIHJvdW5kZWQtZnVsbCAke2RvY1N5bmNDbGFzcyhkb2Muc3luY1N0YXR1cyl9XCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj4ke2RvYy5zeW5jU3RhdHVzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgKS5qb2luKCcnKTtcblxuICAgICAgICBmaWxlTGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1kb2MtcGF0aF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2VsZWN0RG9jdW1lbnQoZWwuZGF0YXNldC5kb2NQYXRoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZW1wdHlNc2cpIGVtcHR5TXNnLnN0eWxlLmRpc3BsYXkgPSBmaWx0ZXJlZC5sZW5ndGggPT09IDAgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgLy8gRWRpdG9yXG4gICAgY29uc3QgZWRpdG9yUGFuZWwgPSAkKCdlZGl0b3ItcGFuZWwnKTtcbiAgICBjb25zdCBlZGl0b3JFbXB0eSA9ICQoJ2VkaXRvci1lbXB0eScpO1xuICAgIGNvbnN0IHNob3dFZGl0b3IgPSBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IG51bGwgfHwgc3RhdGUuaXNOZXc7XG5cbiAgICBpZiAoZWRpdG9yUGFuZWwpIGVkaXRvclBhbmVsLnN0eWxlLmRpc3BsYXkgPSBzaG93RWRpdG9yID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAoZWRpdG9yRW1wdHkpIGVkaXRvckVtcHR5LnN0eWxlLmRpc3BsYXkgPSBzaG93RWRpdG9yID8gJ25vbmUnIDogJ2Jsb2NrJztcblxuICAgIGlmIChzaG93RWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IHRpdGxlSW5wdXQgPSAkKCdlZGl0b3ItdGl0bGUnKTtcbiAgICAgICAgY29uc3QgY29udGVudEFyZWEgPSAkKCdlZGl0b3ItY29udGVudCcpO1xuICAgICAgICBjb25zdCBzYXZlQnRuID0gJCgnc2F2ZS1kb2MtYnRuJyk7XG4gICAgICAgIGNvbnN0IGRlbGV0ZUJ0biA9ICQoJ2RlbGV0ZS1kb2MtYnRuJyk7XG4gICAgICAgIGNvbnN0IGRpcnR5TGFiZWwgPSAkKCdkaXJ0eS1sYWJlbCcpO1xuXG4gICAgICAgIGlmICh0aXRsZUlucHV0KSB0aXRsZUlucHV0LnZhbHVlID0gc3RhdGUuZWRpdG9yVGl0bGU7XG4gICAgICAgIGlmIChjb250ZW50QXJlYSkgY29udGVudEFyZWEudmFsdWUgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICBpZiAoc2F2ZUJ0bikge1xuICAgICAgICAgICAgc2F2ZUJ0bi5kaXNhYmxlZCA9IHN0YXRlLnNhdmluZyB8fCBzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCkubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgc2F2ZUJ0bi50ZXh0Q29udGVudCA9IHN0YXRlLnNhdmluZyA/ICdTYXZpbmcuLi4nIDogJ1NhdmUnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWxldGVCdG4pIGRlbGV0ZUJ0bi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSBudWxsICYmICFzdGF0ZS5pc05ldyA/ICdpbmxpbmUtYmxvY2snIDogJ25vbmUnO1xuICAgICAgICBpZiAoZGlydHlMYWJlbCkgZGlydHlMYWJlbC5zdHlsZS5kaXNwbGF5ID0gaXNEaXJ0eSgpID8gJ2lubGluZScgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoXG4gICAgY29uc3Qgc2VhcmNoSW5wdXQgPSAkKCdzZWFyY2gtaW5wdXQnKTtcbiAgICBpZiAoc2VhcmNoSW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgc2VhcmNoSW5wdXQudmFsdWUgPSBzdGF0ZS5zZWFyY2hRdWVyeTtcbiAgICB9XG5cbiAgICAvLyBUb2FzdFxuICAgIGNvbnN0IHRvYXN0ID0gJCgndG9hc3QnKTtcbiAgICBpZiAodG9hc3QpIHtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBzdGF0ZS50b2FzdDtcbiAgICAgICAgdG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLnRvYXN0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG5ld0RvY3VtZW50KCkge1xuICAgIHN0YXRlLmlzTmV3ID0gdHJ1ZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gJyc7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VsZWN0RG9jdW1lbnQocGF0aCkge1xuICAgIGNvbnN0IGRvYyA9IGF3YWl0IGdldERvY3VtZW50KHBhdGgpO1xuICAgIGlmICghZG9jKSByZXR1cm47XG5cbiAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHBhdGg7XG4gICAgc3RhdGUuZWRpdG9yVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gZG9jLmNvbnRlbnQ7XG4gICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IGRvYy5wYXRoO1xuICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRG9jdW1lbnQoKSB7XG4gICAgY29uc3QgdGl0bGUgPSBzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCk7XG4gICAgaWYgKCF0aXRsZSkgcmV0dXJuO1xuXG4gICAgc3RhdGUuc2F2aW5nID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5wdWJsaXNoJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgcGF0aDogdGl0bGUsIGNvbnRlbnQ6IHN0YXRlLmVkaXRvckNvbnRlbnQgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoICYmIHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gdGl0bGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHN0YXRlLnNlbGVjdGVkUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbCh0aXRsZSwgc3RhdGUuZWRpdG9yQ29udGVudCwgJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgICAgICBzaG93VG9hc3QoJ1NhdmVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbCh0aXRsZSwgc3RhdGUuZWRpdG9yQ29udGVudCwgJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggJiYgc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSB0aXRsZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgICAgICBzaG93VG9hc3QoJ1NhdmVkIGxvY2FsbHkgKHJlbGF5IGVycm9yOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpICsgJyknKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwoc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCk7XG4gICAgICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSBzdGF0ZS5lZGl0b3JUaXRsZTtcbiAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICBzaG93VG9hc3QoJ1NhdmVkIGxvY2FsbHkgKG9mZmxpbmUpJyk7XG4gICAgfVxuXG4gICAgc3RhdGUuc2F2aW5nID0gZmFsc2U7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZURvY3VtZW50KCkge1xuICAgIGlmICghc3RhdGUuc2VsZWN0ZWRQYXRoKSByZXR1cm47XG4gICAgaWYgKCFjb25maXJtKGBEZWxldGUgXCIke3N0YXRlLnNlbGVjdGVkUGF0aH1cIj9gKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZG9jID0gYXdhaXQgZ2V0RG9jdW1lbnQoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcblxuICAgIGlmIChkb2M/LmV2ZW50SWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAndmF1bHQuZGVsZXRlJyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IHBhdGg6IHN0YXRlLnNlbGVjdGVkUGF0aCwgZXZlbnRJZDogZG9jLmV2ZW50SWQgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChfKSB7fVxuICAgIH1cblxuICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgc3RhdGUuZWRpdG9yVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICBzaG93VG9hc3QoJ0RlbGV0ZWQnKTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3luY0FsbCgpIHtcbiAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ3N5bmNpbmcnO1xuICAgIHN0YXRlLnN5bmNFcnJvciA9ICcnO1xuICAgIHJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZmV0Y2gnIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvY2FsRG9jcyA9IGF3YWl0IGdldFZhdWx0SW5kZXgoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJlbW90ZSBvZiByZXN1bHQuZG9jdW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbCA9IGxvY2FsRG9jc1tyZW1vdGUucGF0aF07XG5cbiAgICAgICAgICAgIGlmICghbG9jYWwpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChyZW1vdGUucGF0aCwgcmVtb3RlLmNvbnRlbnQsICdzeW5jZWQnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnN5bmNTdGF0dXMgPT09ICdsb2NhbC1vbmx5Jykge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbC5jb250ZW50ICE9PSByZW1vdGUuY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB1cGRhdGVTeW5jU3RhdHVzKHJlbW90ZS5wYXRoLCAnY29uZmxpY3QnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghbG9jYWwucmVsYXlDcmVhdGVkQXQgfHwgcmVtb3RlLmNyZWF0ZWRBdCA+IGxvY2FsLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwocmVtb3RlLnBhdGgsIHJlbW90ZS5jb250ZW50LCAnc3luY2VkJywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggPT09IHJlbW90ZS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSByZW1vdGUuY29udGVudDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gcmVtb3RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgICQoJ25ldy1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmV3RG9jdW1lbnQpO1xuICAgICQoJ3N5bmMtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3luY0FsbCk7XG4gICAgJCgnc2F2ZS1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZURvY3VtZW50KTtcbiAgICAkKCdkZWxldGUtZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZURvY3VtZW50KTtcblxuICAgICQoJ3NlYXJjaC1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnNlYXJjaFF1ZXJ5ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnZWRpdG9yLXRpdGxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZWRpdG9yVGl0bGUgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdlZGl0b3ItY29udGVudCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gR2F0ZTogcmVxdWlyZSBtYXN0ZXIgcGFzc3dvcmQgYmVmb3JlIGFsbG93aW5nIHZhdWx0IGFjY2Vzc1xuICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCByZWxheXM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUucmVsYXlJbmZvID0geyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCBkb2N1bWVudHM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gW107XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKGhhc1JlbGF5cygpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBTeW5jIGZhaWxlZDonLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdCQSxN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
