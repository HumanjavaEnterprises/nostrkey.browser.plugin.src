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
    if (all.isEncrypted != null) {
      const json = JSON.stringify(all.isEncrypted);
      entries.push({ key: "isEncrypted", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
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

  // src/utilities/api-key-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "apiKeyVault";
  var DEFAULT_STORE = {
    keys: {},
    syncEnabled: true,
    eventId: null,
    relayCreatedAt: null,
    syncStatus: "synced"
  };
  async function getStore() {
    const data = await storage2.get({ [STORAGE_KEY]: DEFAULT_STORE });
    return { ...DEFAULT_STORE, ...data[STORAGE_KEY] };
  }
  async function setStore(store) {
    await storage2.set({ [STORAGE_KEY]: store });
    scheduleSyncPush();
  }
  async function getApiKeyStore() {
    return getStore();
  }
  async function saveApiKey(id, label, secret) {
    const store = await getStore();
    const now = Math.floor(Date.now() / 1e3);
    const existing = store.keys[id];
    store.keys[id] = {
      id,
      label,
      secret,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      profileScope: existing?.profileScope ?? null
    };
    await setStore(store);
    return store.keys[id];
  }
  async function deleteApiKey(id) {
    const store = await getStore();
    delete store.keys[id];
    await setStore(store);
  }
  async function listApiKeys() {
    const store = await getStore();
    return Object.values(store.keys).sort(
      (a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  }
  async function setSyncEnabled(enabled) {
    const store = await getStore();
    store.syncEnabled = enabled;
    await setStore(store);
  }
  async function isSyncEnabled2() {
    const store = await getStore();
    return store.syncEnabled;
  }
  async function updateStoreSyncState(syncStatus, eventId = null, relayCreatedAt = null) {
    const store = await getStore();
    store.syncStatus = syncStatus;
    if (eventId !== null) store.eventId = eventId;
    if (relayCreatedAt !== null) store.relayCreatedAt = relayCreatedAt;
    await setStore(store);
  }
  async function exportStore() {
    const store = await getStore();
    return store.keys;
  }
  async function importStore(keys) {
    const store = await getStore();
    for (const [id, key] of Object.entries(keys)) {
      store.keys[id] = key;
    }
    await setStore(store);
  }

  // src/api-keys/api-keys.js
  var state = {
    keys: [],
    newLabel: "",
    newSecret: "",
    editingId: null,
    editLabel: "",
    editSecret: "",
    copiedId: null,
    revealedId: null,
    syncEnabled: true,
    globalSyncStatus: "idle",
    syncError: "",
    saving: false,
    toast: "",
    relayInfo: { read: [], write: [] }
  };
  function $(id) {
    return document.getElementById(id);
  }
  function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
  }
  function sortedKeys() {
    return [...state.keys].sort(
      (a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  }
  function maskSecret(secret) {
    if (!secret) return "";
    if (secret.length <= 8) return "\u2022".repeat(secret.length);
    return secret.slice(0, 4) + "\u2022".repeat(4) + secret.slice(-4);
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
    return state.syncEnabled ? "Synced" : "Local only";
  }
  function render() {
    const syncDot = $("sync-dot");
    const syncText = $("sync-text");
    const syncBtn = $("sync-btn");
    const syncToggle = $("sync-toggle");
    const keyCount = $("key-count");
    if (syncDot) syncDot.className = `inline-block w-3 h-3 rounded-full ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === "syncing" || !hasRelays() || !state.syncEnabled;
    if (syncToggle) syncToggle.checked = state.syncEnabled;
    if (keyCount) keyCount.textContent = state.keys.length + " key" + (state.keys.length !== 1 ? "s" : "");
    const keyTableContainer = $("key-table-container");
    const noKeysMsg = $("no-keys");
    const keyTableBody = $("key-table-body");
    if (keyTableContainer) keyTableContainer.style.display = state.keys.length > 0 ? "block" : "none";
    if (noKeysMsg) noKeysMsg.style.display = state.keys.length === 0 ? "block" : "none";
    if (keyTableBody) {
      const sorted = sortedKeys();
      keyTableBody.innerHTML = sorted.map((key) => {
        if (state.editingId === key.id) {
          return `
                    <tr class="border-b border-monokai-bg-lighter hover:bg-monokai-bg-lighter">
                        <td class="p-2">
                            <input
                                type="text"
                                class="input text-sm w-full"
                                autocomplete="off"
                                data-edit-label="${key.id}"
                                value="${escapeAttr(state.editLabel)}"
                            />
                        </td>
                        <td class="p-2 font-mono text-xs">
                            <input
                                type="text"
                                class="input text-xs font-mono w-full"
                                autocomplete="off"
                                spellcheck="false"
                                data-edit-secret="${key.id}"
                                value="${escapeAttr(state.editSecret)}"
                            />
                        </td>
                        <td class="p-2 text-right whitespace-nowrap">
                            <button class="button text-xs" data-action="save-edit">Save</button>
                            <button class="button text-xs" data-action="cancel-edit">Cancel</button>
                        </td>
                    </tr>
                `;
        }
        const displaySecret = state.revealedId === key.id ? escapeHtml(key.secret) : escapeHtml(maskSecret(key.secret));
        const copyLabel = state.copiedId === key.id ? "Copied!" : "Copy";
        return `
                <tr class="border-b border-monokai-bg-lighter hover:bg-monokai-bg-lighter">
                    <td class="p-2">
                        <span class="cursor-pointer hover:underline" data-action="start-edit" data-key-id="${key.id}">${escapeHtml(key.label)}</span>
                    </td>
                    <td class="p-2 font-mono text-xs">
                        <span class="cursor-pointer" data-action="toggle-reveal" data-key-id="${key.id}">${displaySecret}</span>
                    </td>
                    <td class="p-2 text-right whitespace-nowrap">
                        <button class="button text-xs" data-action="copy-secret" data-key-id="${key.id}">${copyLabel}</button>
                        <button class="button text-xs" data-action="delete-key" data-key-id="${key.id}">Del</button>
                    </td>
                </tr>
            `;
      }).join("");
      keyTableBody.querySelectorAll('[data-action="start-edit"]').forEach((el) => {
        el.addEventListener("click", () => startEdit(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="toggle-reveal"]').forEach((el) => {
        el.addEventListener("click", () => {
          state.revealedId = state.revealedId === el.dataset.keyId ? null : el.dataset.keyId;
          render();
        });
      });
      keyTableBody.querySelectorAll('[data-action="copy-secret"]').forEach((el) => {
        el.addEventListener("click", () => copySecret(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="delete-key"]').forEach((el) => {
        el.addEventListener("click", () => deleteKey(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="save-edit"]').forEach((el) => {
        el.addEventListener("click", saveEdit);
      });
      keyTableBody.querySelectorAll('[data-action="cancel-edit"]').forEach((el) => {
        el.addEventListener("click", cancelEdit);
      });
      keyTableBody.querySelectorAll("[data-edit-label]").forEach((el) => {
        el.addEventListener("input", (e) => {
          state.editLabel = e.target.value;
        });
        el.addEventListener("keyup", (e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        });
      });
      keyTableBody.querySelectorAll("[data-edit-secret]").forEach((el) => {
        el.addEventListener("input", (e) => {
          state.editSecret = e.target.value;
        });
        el.addEventListener("keyup", (e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        });
      });
    }
    const newLabelInput = $("new-label");
    const newSecretInput = $("new-secret");
    const addKeyBtn = $("add-key-btn");
    if (newLabelInput && document.activeElement !== newLabelInput) newLabelInput.value = state.newLabel;
    if (newSecretInput && document.activeElement !== newSecretInput) newSecretInput.value = state.newSecret;
    if (addKeyBtn) {
      addKeyBtn.disabled = state.saving || state.newLabel.trim().length === 0 || state.newSecret.trim().length === 0;
      addKeyBtn.textContent = state.saving ? "Saving..." : "Save";
    }
    const toast = $("toast");
    if (toast) {
      toast.textContent = state.toast;
      toast.style.display = state.toast ? "block" : "none";
    }
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  async function addKey() {
    const label = state.newLabel.trim();
    const secret = state.newSecret.trim();
    if (!label || !secret) return;
    state.saving = true;
    render();
    const id = crypto.randomUUID();
    await saveApiKey(id, label, secret);
    state.keys = await listApiKeys();
    state.newLabel = "";
    state.newSecret = "";
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    state.saving = false;
    showToast("Key added");
  }
  function startEdit(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
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
    state.editLabel = "";
    state.editSecret = "";
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    showToast("Key updated");
  }
  function cancelEdit() {
    state.editingId = null;
    state.editLabel = "";
    state.editSecret = "";
    render();
  }
  async function deleteKey(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (!confirm(`Delete "${key.label}"?`)) return;
    await deleteApiKey(id);
    state.keys = await listApiKeys();
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    showToast("Key deleted");
  }
  async function copySecret(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    await navigator.clipboard.writeText(key.secret);
    state.copiedId = id;
    render();
    setTimeout(() => {
      state.copiedId = null;
      render();
    }, 2e3);
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => {
      });
    }, 3e4);
  }
  async function publishToRelay() {
    try {
      const store = await getApiKeyStore();
      const result = await api.runtime.sendMessage({
        kind: "apikeys.publish",
        payload: { keys: store.keys }
      });
      if (result.success) {
        await updateStoreSyncState("synced", result.eventId, result.createdAt);
      }
      return result;
    } catch (e) {
      await updateStoreSyncState("local-only");
      return { success: false, error: e.message };
    }
  }
  async function syncAll() {
    state.globalSyncStatus = "syncing";
    state.syncError = "";
    render();
    try {
      const result = await api.runtime.sendMessage({ kind: "apikeys.fetch" });
      if (!result.success) {
        state.globalSyncStatus = "error";
        state.syncError = result.error || "Sync failed";
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
        await updateStoreSyncState("synced", result.eventId, result.createdAt);
        state.keys = await listApiKeys();
      }
      state.globalSyncStatus = "idle";
    } catch (e) {
      state.globalSyncStatus = "error";
      state.syncError = e.message || "Sync failed";
    }
    render();
  }
  async function toggleSync() {
    await setSyncEnabled(state.syncEnabled);
    if (state.syncEnabled && hasRelays()) {
      await syncAll();
    }
  }
  async function exportKeys() {
    const keys = await exportStore();
    const plainText = JSON.stringify(keys, null, 2);
    const result = await api.runtime.sendMessage({
      kind: "apikeys.encrypt",
      payload: { plainText }
    });
    if (!result.success) {
      showToast("Export failed: " + (result.error || "unknown"));
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ encrypted: true, data: result.cipherText })],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nostrkey-api-keys-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported");
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
          kind: "apikeys.decrypt",
          payload: { cipherText: parsed.data }
        });
        if (!result.success) {
          showToast("Decrypt failed: " + (result.error || "unknown"));
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
      showToast("Imported " + Object.keys(keys).length + " keys");
    } catch (e) {
      showToast("Import failed: " + e.message);
    }
    event.target.value = "";
  }
  function bindEvents() {
    $("sync-btn")?.addEventListener("click", syncAll);
    $("add-key-btn")?.addEventListener("click", addKey);
    $("export-btn")?.addEventListener("click", exportKeys);
    $("import-file")?.addEventListener("change", importKeys);
    $("close-btn")?.addEventListener("click", () => window.close());
    $("sync-toggle")?.addEventListener("change", (e) => {
      state.syncEnabled = e.target.checked;
      toggleSync();
    });
    $("new-label")?.addEventListener("input", (e) => {
      state.newLabel = e.target.value;
      render();
    });
    $("new-secret")?.addEventListener("input", (e) => {
      state.newSecret = e.target.value;
      render();
    });
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
    const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
    state.relayInfo = relays || { read: [], write: [] };
    state.syncEnabled = await isSyncEnabled2();
    state.keys = await listApiKeys();
    bindEvents();
    render();
    if (state.syncEnabled && hasRelays()) {
      await syncAll();
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc3luYy1tYW5hZ2VyLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYXBpLWtleS1zdG9yZS5qcyIsICIuLi8uLi8uLi9zcmMvYXBpLWtleXMvYXBpLWtleXMuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBLZXlzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIHN5bmNlZFxuY29uc3QgRVhDTFVERURfS0VZUyA9IFtcbiAgICAnYnVua2VyU2Vzc2lvbnMnLFxuICAgICdpZ25vcmVJbnN0YWxsSG9vaycsXG4gICAgJ3Bhc3N3b3JkSGFzaCcsXG4gICAgJ3Bhc3N3b3JkU2FsdCcsXG5dO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIFAxX1BST0ZJTEVTOiAxLFxuICAgIFAyX1NFVFRJTkdTOiAyLFxuICAgIFAzX0FQSUtFWVM6IDMsXG4gICAgUDRfVkFVTFQ6IDQsXG59O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgc3luYyBwYXlsb2FkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBsb2NhbCBkYXRhIGFuZCBidWlsZCBhIHByaW9yaXRpc2VkIGxpc3Qgb2YgZW50cmllcyB0byBzeW5jLlxuICogUmV0dXJucyB7IGVudHJpZXM6IFt7IGtleSwganNvblN0cmluZywgcHJpb3JpdHksIHNpemUgfV0sIHRvdGFsU2l6ZSB9XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4ICsgZW5jcnlwdGlvbiBzdGF0ZVxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IGFsbC5wcm9maWxlcy5tYXAocCA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY2xlYW5Qcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5wcm9maWxlSW5kZXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsLnByb2ZpbGVJbmRleCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVJbmRleCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChhbGwuaXNFbmNyeXB0ZWQgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsLmlzRW5jcnlwdGVkKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnaXNFbmNyeXB0ZWQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFAyOiBTZXR0aW5nc1xuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGsgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChhbGxba10gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhhbGwpKSB7XG4gICAgICAgIGlmIChrLnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUDM6IEFQSSBrZXkgdmF1bHRcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0KSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwuYXBpS2V5VmF1bHQpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdhcGlLZXlWYXVsdCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QM19BUElLRVlTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQNDogVmF1bHQgZG9jcyAoaW5kaXZpZHVhbGx5LCBuZXdlc3QgZmlyc3QpXG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgc3luYyBwYXlsb2FkIHJlc3BlY3RpbmcgYnVkZ2V0XG4gICAgICAgIGxldCB1c2VkQnl0ZXMgPSAwO1xuICAgICAgICBsZXQgdXNlZEl0ZW1zID0gMDtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgbGV0IGJ1ZGdldEV4aGF1c3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKGJ1ZGdldEV4aGF1c3RlZCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVmFsdWUoZW50cnkua2V5LCBlbnRyeS5qc29uU3RyaW5nKTtcbiAgICAgICAgICAgIGxldCBlbnRyeVNpemUgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgIGVudHJ5U2l6ZSArPSBjLmtleS5sZW5ndGggKyAodHlwZW9mIGMudmFsdWUgPT09ICdzdHJpbmcnID8gYy52YWx1ZS5sZW5ndGggOiBKU09OLnN0cmluZ2lmeShjLnZhbHVlKS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodXNlZEJ5dGVzICsgZW50cnlTaXplID4gU1lOQ19RVU9UQSAtIDUwMCB8fCB1c2VkSXRlbXMgKyBjaHVua3MubGVuZ3RoID4gTUFYX0lURU1TIC0gNSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5wcmlvcml0eSA8PSBQUklPUklUWS5QM19BUElLRVlTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyaXRpY2FsIGRhdGEgXHUyMDE0IHRyeSBhbnl3YXksIGxldCB0aGUgQVBJIHRocm93IGlmIHRydWx5IG92ZXJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gQnVkZ2V0IGV4aGF1c3RlZCBhdCBwcmlvcml0eSAke2VudHJ5LnByaW9yaXR5fSwgc2tpcHBpbmcgcmVtYWluaW5nIGVudHJpZXNgKTtcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0RXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgc3luY1BheWxvYWRbYy5rZXldID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgICBhbGxTeW5jS2V5cy5wdXNoKGMua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBzeW5jIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XG4gICAgICAgICAgICBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAga2V5czogYWxsU3luY0tleXMsXG4gICAgICAgIH07XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkobWV0YSk7XG5cbiAgICAgICAgLy8gV3JpdGUgdG8gc3luYyBzdG9yYWdlXG4gICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHN5bmNQYXlsb2FkKTtcblxuICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlYWQgZXhpc3Rpbmcgc3luYyBrZXlzIGFuZCByZW1vdmUgYW55IG5vdCBpbiBvdXIgcGF5bG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7YWxsU3luY0tleXMubGVuZ3RofSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgIGlmICghcmF3IHx8IE9iamVjdC5rZXlzKHJhdykubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXRhU3RyID0gcmF3W1NZTkNfTUVUQV9LRVldO1xuICAgICAgICBpZiAoIW1ldGFTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBtZXRhO1xuICAgICAgICB0cnkgeyBtZXRhID0gSlNPTi5wYXJzZShtZXRhU3RyKTsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIG5vbi1jaHVuaywgbm9uLW1ldGEga2V5c1xuICAgICAgICBjb25zdCBkYXRhS2V5cyA9IG1ldGEua2V5cy5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKENIVU5LX1BSRUZJWCkgJiYgayAhPT0gU1lOQ19NRVRBX0tFWSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHJhdyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQuX3N5bmNNZXRhID0gbWV0YTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVsbEZyb21TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWVyZ2UgbG9naWNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIE1lcmdlIHN5bmMgZGF0YSBpbnRvIGxvY2FsIHN0b3JhZ2Ugd2l0aCBjb25mbGljdCByZXNvbHV0aW9uLlxuICovXG5hc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgdXBkYXRlcyA9IHt9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlY3QgZnJlc2ggaW5zdGFsbDogbm8gcHJvZmlsZXMgb3Igb25seSB0aGUgZGVmYXVsdCBlbXB0eSBwcm9maWxlXG4gICAgY29uc3QgaXNGcmVzaCA9ICFsb2NhbC5wcm9maWxlcyB8fFxuICAgICAgICBsb2NhbC5wcm9maWxlcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgKGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMSAmJiAhbG9jYWwucHJvZmlsZXNbMF0ucHJpdktleSk7XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGluc3RhbGwgXHUyMDE0IGFkb3B0IHN5bmMgcHJvZmlsZXMgZW50aXJlbHlcbiAgICAgICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcztcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAvLyBQZXItaW5kZXggdXBkYXRlZEF0IGNvbXBhcmlzb24gXHUyMDE0IG5ld2VyIHdpbnMsIGxvY2FsIHdpbnMgdGllc1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gWy4uLmxvY2FsLnByb2ZpbGVzXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3luY0RhdGEucHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzeW5jUHJvZmlsZSA9IHN5bmNEYXRhLnByb2ZpbGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChpID49IG1lcmdlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHByb2ZpbGUgZnJvbSBzeW5jXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZC5wdXNoKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzeW5jVGltZSA9IHN5bmNQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFRpbWUgPSBsb2NhbFByb2ZpbGUudXBkYXRlZEF0IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW5jVGltZSA+IGxvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgbWVyZ2UgYnV0IHByZXNlcnZlIGxvY2FsIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSB7IC4uLnN5bmNQcm9maWxlLCBob3N0czogbG9jYWxQcm9maWxlLmhvc3RzIHx8IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB1cGRhdGVzLnByb2ZpbGVzID0gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGUgaW5kZXggKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZUluZGV4ICE9IG51bGwgJiYgaXNGcmVzaCkge1xuICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleDtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSBcdTIwMTQgbmV2ZXIgZG93bmdyYWRlIC0tLVxuICAgIGlmIChzeW5jRGF0YS5pc0VuY3J5cHRlZCA9PT0gdHJ1ZSAmJiAhbG9jYWwuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgdXBkYXRlcy5pc0VuY3J5cHRlZCA9IHRydWU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc3luY01ldGEgPSBzeW5jRGF0YS5fc3luY01ldGEgfHwge307XG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBoaWdoZXJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIHN5bmNEYXRhLnZlcnNpb24gPD0gbG9jYWwudmVyc2lvbikgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEFQSSBLZXkgVmF1bHQgKFAzKSAtLS1cbiAgICBpZiAoc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgaWYgKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1lcmdlIGluZGl2aWR1YWwga2V5cyBieSB1cGRhdGVkQXRcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IGxvY2FsLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBzeW5jS2V5cyA9IHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLmxvY2FsS2V5cyB9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIHN5bmNLZXldIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNLZXlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5ID0gbWVyZ2VkW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsS2V5IHx8IChzeW5jS2V5LnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbEtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2lkXSA9IHN5bmNLZXk7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4ubG9jYWwuYXBpS2V5VmF1bHQsIGtleXM6IG1lcmdlZCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCBsb2NhbERvY3MgPSBsb2NhbC52YXVsdERvY3MgfHwge307XG4gICAgbGV0IGRvY3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgbWVyZ2VkRG9jcyA9IHsgLi4ubG9jYWxEb2NzIH07XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbG9jYWxEb2MgPSBtZXJnZWREb2NzW2RvYy5wYXRoXTtcbiAgICAgICAgaWYgKCFsb2NhbERvYyB8fCAoZG9jLnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbERvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgIG1lcmdlZERvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgICAgICAgICAgZG9jc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBBUEkgS2V5IFN0b3JlIFx1MjAxNCBMb2NhbCBjYWNoZSBmb3IgZW5jcnlwdGVkIEFQSSBrZXlzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICBhcGlLZXlWYXVsdDoge1xuICogICAgIGtleXM6IHtcbiAqICAgICAgIFwiPHV1aWQ+XCI6IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0LCBwcm9maWxlU2NvcGUgfVxuICogICAgIH0sXG4gKiAgICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gKiAgICAgZXZlbnRJZDogbnVsbCxcbiAqICAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAqICAgICBzeW5jU3RhdHVzOiBcInN5bmNlZFwiICAgIC8vIHN5bmNlZCB8IGxvY2FsLW9ubHkgfCBjb25mbGljdFxuICogICB9XG4gKlxuICogcHJvZmlsZVNjb3BlOiBudWxsIChhbGwgcHJvZmlsZXMpIHwgbnVtYmVyW10gKHNwZWNpZmljIHByb2ZpbGUgaW5kaWNlcylcbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgc2NoZWR1bGVTeW5jUHVzaCB9IGZyb20gJy4vc3luYy1tYW5hZ2VyJztcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuY29uc3QgU1RPUkFHRV9LRVkgPSAnYXBpS2V5VmF1bHQnO1xuXG5jb25zdCBERUZBVUxUX1NUT1JFID0ge1xuICAgIGtleXM6IHt9LFxuICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICAgIGV2ZW50SWQ6IG51bGwsXG4gICAgcmVsYXlDcmVhdGVkQXQ6IG51bGwsXG4gICAgc3luY1N0YXR1czogJ3N5bmNlZCcsXG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTdG9yZSgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbU1RPUkFHRV9LRVldOiBERUZBVUxUX1NUT1JFIH0pO1xuICAgIHJldHVybiB7IC4uLkRFRkFVTFRfU1RPUkUsIC4uLmRhdGFbU1RPUkFHRV9LRVldIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldFN0b3JlKHN0b3JlKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBzdG9yZSB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBmdWxsIEFQSSBrZXkgc3RvcmUgb2JqZWN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpS2V5U3RvcmUoKSB7XG4gICAgcmV0dXJuIGdldFN0b3JlKCk7XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIEFQSSBrZXkgYnkgaWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdHxudWxsPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUtleShpZCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICByZXR1cm4gc3RvcmUua2V5c1tpZF0gfHwgbnVsbDtcbn1cblxuLyoqXG4gKiBVcHNlcnQgYW4gQVBJIGtleS4gQ3JlYXRlcyBpZiBuZXcsIHVwZGF0ZXMgaWYgZXhpc3RpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBVVUlEXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWNyZXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBzdG9yZS5rZXlzW2lkXTtcbiAgICBzdG9yZS5rZXlzW2lkXSA9IHtcbiAgICAgICAgaWQsXG4gICAgICAgIGxhYmVsLFxuICAgICAgICBzZWNyZXQsXG4gICAgICAgIGNyZWF0ZWRBdDogZXhpc3Rpbmc/LmNyZWF0ZWRBdCB8fCBub3csXG4gICAgICAgIHVwZGF0ZWRBdDogbm93LFxuICAgICAgICBwcm9maWxlU2NvcGU6IGV4aXN0aW5nPy5wcm9maWxlU2NvcGUgPz8gbnVsbCxcbiAgICB9O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbiAgICByZXR1cm4gc3RvcmUua2V5c1tpZF07XG59XG5cbi8qKlxuICogRGVsZXRlIGFuIEFQSSBrZXkgYnkgaWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZGVsZXRlIHN0b3JlLmtleXNbaWRdO1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBMaXN0IGFsbCBBUEkga2V5cyBzb3J0ZWQgYnkgbGFiZWwgKGNhc2UtaW5zZW5zaXRpdmUpLlxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdEFwaUtleXMoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpLnNvcnQoKGEsIGIpID0+XG4gICAgICAgIGEubGFiZWwudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIubGFiZWwudG9Mb3dlckNhc2UoKSksXG4gICAgKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHJlbGF5IHN5bmMgdG9nZ2xlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3luY0VuYWJsZWQoZW5hYmxlZCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHJlbGF5IHN5bmMgaXMgZW5hYmxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBzdG9yZS5zeW5jRW5hYmxlZDtcbn1cblxuLyoqXG4gKiBVcGRhdGUgc3luYyBzdGF0ZSBhZnRlciBhIHJlbGF5IG9wZXJhdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVN0b3JlU3luY1N0YXRlKHN5bmNTdGF0dXMsIGV2ZW50SWQgPSBudWxsLCByZWxheUNyZWF0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgc3RvcmUuc3luY1N0YXR1cyA9IHN5bmNTdGF0dXM7XG4gICAgaWYgKGV2ZW50SWQgIT09IG51bGwpIHN0b3JlLmV2ZW50SWQgPSBldmVudElkO1xuICAgIGlmIChyZWxheUNyZWF0ZWRBdCAhPT0gbnVsbCkgc3RvcmUucmVsYXlDcmVhdGVkQXQgPSByZWxheUNyZWF0ZWRBdDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogRXhwb3J0IHRoZSBrZXlzIG9iamVjdCAoZm9yIGVuY3J5cHRlZCBiYWNrdXApLlxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gTWFwIG9mIGlkIC0+IGtleSBkYXRhXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTdG9yZSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLmtleXM7XG59XG5cbi8qKlxuICogSW1wb3J0IGtleXMgaW50byB0aGUgc3RvcmUgKG1lcmdlIFx1MjAxNCBleGlzdGluZyBrZXlzIHdpdGggc2FtZSBpZCBhcmUgb3ZlcndyaXR0ZW4pLlxuICogQHBhcmFtIHtPYmplY3R9IGtleXMgLSBNYXAgb2YgaWQgLT4geyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQgfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW1wb3J0U3RvcmUoa2V5cykge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhrZXlzKSkge1xuICAgICAgICBzdG9yZS5rZXlzW2lkXSA9IGtleTtcbiAgICB9XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7XG4gICAgZ2V0QXBpS2V5U3RvcmUsXG4gICAgc2F2ZUFwaUtleSxcbiAgICBkZWxldGVBcGlLZXksXG4gICAgbGlzdEFwaUtleXMsXG4gICAgc2V0U3luY0VuYWJsZWQsXG4gICAgaXNTeW5jRW5hYmxlZCxcbiAgICB1cGRhdGVTdG9yZVN5bmNTdGF0ZSxcbiAgICBleHBvcnRTdG9yZSxcbiAgICBpbXBvcnRTdG9yZSxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBrZXlzOiBbXSxcbiAgICBuZXdMYWJlbDogJycsXG4gICAgbmV3U2VjcmV0OiAnJyxcbiAgICBlZGl0aW5nSWQ6IG51bGwsXG4gICAgZWRpdExhYmVsOiAnJyxcbiAgICBlZGl0U2VjcmV0OiAnJyxcbiAgICBjb3BpZWRJZDogbnVsbCxcbiAgICByZXZlYWxlZElkOiBudWxsLFxuICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgdG9hc3Q6ICcnLFxuICAgIHJlbGF5SW5mbzogeyByZWFkOiBbXSwgd3JpdGU6IFtdIH0sXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gaGFzUmVsYXlzKCkge1xuICAgIHJldHVybiBzdGF0ZS5yZWxheUluZm8ucmVhZC5sZW5ndGggPiAwIHx8IHN0YXRlLnJlbGF5SW5mby53cml0ZS5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBzb3J0ZWRLZXlzKCkge1xuICAgIHJldHVybiBbLi4uc3RhdGUua2V5c10uc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBtYXNrU2VjcmV0KHNlY3JldCkge1xuICAgIGlmICghc2VjcmV0KSByZXR1cm4gJyc7XG4gICAgaWYgKHNlY3JldC5sZW5ndGggPD0gOCkgcmV0dXJuICdcXHUyMDIyJy5yZXBlYXQoc2VjcmV0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHNlY3JldC5zbGljZSgwLCA0KSArICdcXHUyMDIyJy5yZXBlYXQoNCkgKyBzZWNyZXQuc2xpY2UoLTQpO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuICdiZy1ncmVlbi01MDAnO1xuICAgIGlmIChzdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdiZy15ZWxsb3ctNTAwIGFuaW1hdGUtcHVsc2UnO1xuICAgIHJldHVybiAnYmctcmVkLTUwMCc7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNUZXh0KCkge1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnU3luY2luZy4uLic7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdlcnJvcicpIHJldHVybiBzdGF0ZS5zeW5jRXJyb3I7XG4gICAgcmV0dXJuIHN0YXRlLnN5bmNFbmFibGVkID8gJ1N5bmNlZCcgOiAnTG9jYWwgb25seSc7XG59XG5cbi8vIC0tLSBSZW5kZXIgLS0tXG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3Qgc3luY1RvZ2dsZSA9ICQoJ3N5bmMtdG9nZ2xlJyk7XG4gICAgY29uc3Qga2V5Q291bnQgPSAkKCdrZXktY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBpbmxpbmUtYmxvY2sgdy0zIGgtMyByb3VuZGVkLWZ1bGwgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCkgfHwgIXN0YXRlLnN5bmNFbmFibGVkO1xuICAgIGlmIChzeW5jVG9nZ2xlKSBzeW5jVG9nZ2xlLmNoZWNrZWQgPSBzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICBpZiAoa2V5Q291bnQpIGtleUNvdW50LnRleHRDb250ZW50ID0gc3RhdGUua2V5cy5sZW5ndGggKyAnIGtleScgKyAoc3RhdGUua2V5cy5sZW5ndGggIT09IDEgPyAncycgOiAnJyk7XG5cbiAgICAvLyBLZXkgdGFibGVcbiAgICBjb25zdCBrZXlUYWJsZUNvbnRhaW5lciA9ICQoJ2tleS10YWJsZS1jb250YWluZXInKTtcbiAgICBjb25zdCBub0tleXNNc2cgPSAkKCduby1rZXlzJyk7XG4gICAgY29uc3Qga2V5VGFibGVCb2R5ID0gJCgna2V5LXRhYmxlLWJvZHknKTtcblxuICAgIGlmIChrZXlUYWJsZUNvbnRhaW5lcikga2V5VGFibGVDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID4gMCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKG5vS2V5c01zZykgbm9LZXlzTXNnLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5rZXlzLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBpZiAoa2V5VGFibGVCb2R5KSB7XG4gICAgICAgIGNvbnN0IHNvcnRlZCA9IHNvcnRlZEtleXMoKTtcbiAgICAgICAga2V5VGFibGVCb2R5LmlubmVySFRNTCA9IHNvcnRlZC5tYXAoa2V5ID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5lZGl0aW5nSWQgPT09IGtleS5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cImJvcmRlci1iIGJvcmRlci1tb25va2FpLWJnLWxpZ2h0ZXIgaG92ZXI6YmctbW9ub2thaS1iZy1saWdodGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucHV0IHRleHQtc20gdy1mdWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1lZGl0LWxhYmVsPVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdExhYmVsKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicC0yIGZvbnQtbW9ubyB0ZXh0LXhzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbnB1dCB0ZXh0LXhzIGZvbnQtbW9ubyB3LWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVsbGNoZWNrPVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtc2VjcmV0PVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdFNlY3JldCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInAtMiB0ZXh0LXJpZ2h0IHdoaXRlc3BhY2Utbm93cmFwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ1dHRvbiB0ZXh0LXhzXCIgZGF0YS1hY3Rpb249XCJzYXZlLWVkaXRcIj5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ1dHRvbiB0ZXh0LXhzXCIgZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVNlY3JldCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGtleS5pZCA/IGVzY2FwZUh0bWwoa2V5LnNlY3JldCkgOiBlc2NhcGVIdG1sKG1hc2tTZWNyZXQoa2V5LnNlY3JldCkpO1xuICAgICAgICAgICAgY29uc3QgY29weUxhYmVsID0gc3RhdGUuY29waWVkSWQgPT09IGtleS5pZCA/ICdDb3BpZWQhJyA6ICdDb3B5JztcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwiYm9yZGVyLWIgYm9yZGVyLW1vbm9rYWktYmctbGlnaHRlciBob3ZlcjpiZy1tb25va2FpLWJnLWxpZ2h0ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImN1cnNvci1wb2ludGVyIGhvdmVyOnVuZGVybGluZVwiIGRhdGEtYWN0aW9uPVwic3RhcnQtZWRpdFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtlc2NhcGVIdG1sKGtleS5sYWJlbCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTIgZm9udC1tb25vIHRleHQteHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY3Vyc29yLXBvaW50ZXJcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7ZGlzcGxheVNlY3JldH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInAtMiB0ZXh0LXJpZ2h0IHdoaXRlc3BhY2Utbm93cmFwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV0dG9uIHRleHQteHNcIiBkYXRhLWFjdGlvbj1cImNvcHktc2VjcmV0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj4ke2NvcHlMYWJlbH08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidXR0b24gdGV4dC14c1wiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+RGVsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIGA7XG4gICAgICAgIH0pLmpvaW4oJycpO1xuXG4gICAgICAgIC8vIEJpbmQgdGFibGUgZXZlbnRzXG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHN0YXJ0RWRpdChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhdGUucmV2ZWFsZWRJZCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGVsLmRhdGFzZXQua2V5SWQgPyBudWxsIDogZWwuZGF0YXNldC5rZXlJZDtcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNvcHktc2VjcmV0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGNvcHlTZWNyZXQoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImRlbGV0ZS1rZXlcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZGVsZXRlS2V5KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJzYXZlLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUVkaXQpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNhbmNlbC1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbEVkaXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCaW5kIGVkaXQgaW5wdXQgZXZlbnRzXG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1lZGl0LWxhYmVsXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5lZGl0TGFiZWwgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtc2VjcmV0XScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5lZGl0U2VjcmV0ID0gZS50YXJnZXQudmFsdWU7IH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgc2F2ZUVkaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBjYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGtleSBmb3JtXG4gICAgY29uc3QgbmV3TGFiZWxJbnB1dCA9ICQoJ25ldy1sYWJlbCcpO1xuICAgIGNvbnN0IG5ld1NlY3JldElucHV0ID0gJCgnbmV3LXNlY3JldCcpO1xuICAgIGNvbnN0IGFkZEtleUJ0biA9ICQoJ2FkZC1rZXktYnRuJyk7XG5cbiAgICBpZiAobmV3TGFiZWxJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBuZXdMYWJlbElucHV0KSBuZXdMYWJlbElucHV0LnZhbHVlID0gc3RhdGUubmV3TGFiZWw7XG4gICAgaWYgKG5ld1NlY3JldElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld1NlY3JldElucHV0KSBuZXdTZWNyZXRJbnB1dC52YWx1ZSA9IHN0YXRlLm5ld1NlY3JldDtcbiAgICBpZiAoYWRkS2V5QnRuKSB7XG4gICAgICAgIGFkZEtleUJ0bi5kaXNhYmxlZCA9IHN0YXRlLnNhdmluZyB8fCBzdGF0ZS5uZXdMYWJlbC50cmltKCkubGVuZ3RoID09PSAwIHx8IHN0YXRlLm5ld1NlY3JldC50cmltKCkubGVuZ3RoID09PSAwO1xuICAgICAgICBhZGRLZXlCdG4udGV4dENvbnRlbnQgPSBzdGF0ZS5zYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlJztcbiAgICB9XG5cbiAgICAvLyBUb2FzdFxuICAgIGNvbnN0IHRvYXN0ID0gJCgndG9hc3QnKTtcbiAgICBpZiAodG9hc3QpIHtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBzdGF0ZS50b2FzdDtcbiAgICAgICAgdG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLnRvYXN0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LnRleHRDb250ZW50ID0gc3RyO1xuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuLy8gLS0tIENSVUQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGFkZEtleSgpIHtcbiAgICBjb25zdCBsYWJlbCA9IHN0YXRlLm5ld0xhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5uZXdTZWNyZXQudHJpbSgpO1xuICAgIGlmICghbGFiZWwgfHwgIXNlY3JldCkgcmV0dXJuO1xuXG4gICAgc3RhdGUuc2F2aW5nID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcblxuICAgIGNvbnN0IGlkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICBhd2FpdCBzYXZlQXBpS2V5KGlkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5uZXdMYWJlbCA9ICcnO1xuICAgIHN0YXRlLm5ld1NlY3JldCA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc3RhdGUuc2F2aW5nID0gZmFsc2U7XG4gICAgc2hvd1RvYXN0KCdLZXkgYWRkZWQnKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRFZGl0KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgc3RhdGUuZWRpdGluZ0lkID0ga2V5LmlkO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9IGtleS5sYWJlbDtcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0ga2V5LnNlY3JldDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZUVkaXQoKSB7XG4gICAgaWYgKCFzdGF0ZS5lZGl0aW5nSWQpIHJldHVybjtcbiAgICBjb25zdCBsYWJlbCA9IHN0YXRlLmVkaXRMYWJlbC50cmltKCk7XG4gICAgY29uc3Qgc2VjcmV0ID0gc3RhdGUuZWRpdFNlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBhd2FpdCBzYXZlQXBpS2V5KHN0YXRlLmVkaXRpbmdJZCwgbGFiZWwsIHNlY3JldCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgc3RhdGUuZWRpdGluZ0lkID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSB1cGRhdGVkJyk7XG59XG5cbmZ1bmN0aW9uIGNhbmNlbEVkaXQoKSB7XG4gICAgc3RhdGUuZWRpdGluZ0lkID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUtleShpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmICghY29uZmlybShgRGVsZXRlIFwiJHtrZXkubGFiZWx9XCI/YCkpIHJldHVybjtcblxuICAgIGF3YWl0IGRlbGV0ZUFwaUtleShpZCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSBkZWxldGVkJyk7XG59XG5cbi8vIC0tLSBDbGlwYm9hcmQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlTZWNyZXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChrZXkuc2VjcmV0KTtcbiAgICBzdGF0ZS5jb3BpZWRJZCA9IGlkO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5jb3BpZWRJZCA9IG51bGw7IHJlbmRlcigpOyB9LCAyMDAwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoJycpLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9LCAzMDAwMCk7XG59XG5cbi8vIC0tLSBTeW5jIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoVG9SZWxheSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldEFwaUtleVN0b3JlKCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBrZXlzOiBzdG9yZS5rZXlzIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdhcGlrZXlzLmZldGNoJyB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IHN0b3JlLmtleXM7XG4gICAgICAgICAgICBjb25zdCBsb2NhbENvdW50ID0gT2JqZWN0LmtleXMobG9jYWxLZXlzKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChsb2NhbENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3RvcmUucmVsYXlDcmVhdGVkQXQgfHwgcmVzdWx0LmNyZWF0ZWRBdCA+IHN0b3JlLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVTeW5jKCkge1xuICAgIGF3YWl0IHNldFN5bmNFbmFibGVkKHN0YXRlLnN5bmNFbmFibGVkKTtcbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuLy8gLS0tIEltcG9ydCAvIEV4cG9ydCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gYXdhaXQgZXhwb3J0U3RvcmUoKTtcbiAgICBjb25zdCBwbGFpblRleHQgPSBKU09OLnN0cmluZ2lmeShrZXlzLCBudWxsLCAyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2FwaWtleXMuZW5jcnlwdCcsXG4gICAgICAgIHBheWxvYWQ6IHsgcGxhaW5UZXh0IH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHNob3dUb2FzdCgnRXhwb3J0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeSh7IGVuY3J5cHRlZDogdHJ1ZSwgZGF0YTogcmVzdWx0LmNpcGhlclRleHQgfSldLFxuICAgICAgICB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcbiAgICBhLmRvd25sb2FkID0gJ25vc3Rya2V5LWFwaS1rZXlzLWJhY2t1cC5qc29uJztcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIHNob3dUb2FzdCgnRXhwb3J0ZWQnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0S2V5cyhldmVudCkge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBmaWxlLnRleHQoKTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh0ZXh0KTtcblxuICAgICAgICBsZXQga2V5cztcbiAgICAgICAgaWYgKHBhcnNlZC5lbmNyeXB0ZWQgJiYgcGFyc2VkLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAnYXBpa2V5cy5kZWNyeXB0JyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGNpcGhlclRleHQ6IHBhcnNlZC5kYXRhIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzaG93VG9hc3QoJ0RlY3J5cHQgZmFpbGVkOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXlzID0gSlNPTi5wYXJzZShyZXN1bHQucGxhaW5UZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBwYXJzZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShrZXlzKTtcbiAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICAgICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnRlZCAnICsgT2JqZWN0LmtleXMoa2V5cykubGVuZ3RoICsgJyBrZXlzJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydCBmYWlsZWQ6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnO1xufVxuXG4vLyAtLS0gRXZlbnQgYmluZGluZyAtLS1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAkKCdzeW5jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN5bmNBbGwpO1xuICAgICQoJ2FkZC1rZXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYWRkS2V5KTtcbiAgICAkKCdleHBvcnQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXhwb3J0S2V5cyk7XG4gICAgJCgnaW1wb3J0LWZpbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaW1wb3J0S2V5cyk7XG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xuXG4gICAgJCgnc3luYy10b2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuc3luY0VuYWJsZWQgPSBlLnRhcmdldC5jaGVja2VkO1xuICAgICAgICB0b2dnbGVTeW5jKCk7XG4gICAgfSk7XG5cbiAgICAkKCduZXctbGFiZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5uZXdMYWJlbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5uZXdTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gR2F0ZTogcmVxdWlyZSBtYXN0ZXIgcGFzc3dvcmQgYmVmb3JlIGFsbG93aW5nIGFjY2Vzc1xuICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgc3RhdGUucmVsYXlJbmZvID0gcmVsYXlzIHx8IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuICAgIHN0YXRlLnN5bmNFbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHN5bmNBbGwoKTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDakY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNY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
