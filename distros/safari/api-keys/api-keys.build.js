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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc3luYy1tYW5hZ2VyLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYXBpLWtleS1zdG9yZS5qcyIsICIuLi8uLi8uLi9zcmMvYXBpLWtleXMvYXBpLWtleXMuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBLZXlzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIHN5bmNlZFxuY29uc3QgRVhDTFVERURfS0VZUyA9IFtcbiAgICAnYnVua2VyU2Vzc2lvbnMnLFxuICAgICdpZ25vcmVJbnN0YWxsSG9vaycsXG4gICAgJ3Bhc3N3b3JkSGFzaCcsXG4gICAgJ3Bhc3N3b3JkU2FsdCcsXG5dO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIFAxX1BST0ZJTEVTOiAxLFxuICAgIFAyX1NFVFRJTkdTOiAyLFxuICAgIFAzX0FQSUtFWVM6IDMsXG4gICAgUDRfVkFVTFQ6IDQsXG59O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgc3luYyBwYXlsb2FkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBsb2NhbCBkYXRhIGFuZCBidWlsZCBhIHByaW9yaXRpc2VkIGxpc3Qgb2YgZW50cmllcyB0byBzeW5jLlxuICogUmV0dXJucyB7IGVudHJpZXM6IFt7IGtleSwganNvblN0cmluZywgcHJpb3JpdHksIHNpemUgfV0sIHRvdGFsU2l6ZSB9XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4XG4gICAgaWYgKGFsbC5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBjbGVhblByb2ZpbGVzID0gYWxsLnByb2ZpbGVzLm1hcChwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaG9zdHMsIC4uLnJlc3QgfSA9IHA7XG4gICAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgLy8gTk9URTogYGlzRW5jcnlwdGVkYCBpcyBpbnRlbnRpb25hbGx5IE5PVCBzeW5jZWQuIFRoZSBwYXNzd29yZCB2ZXJpZmllclxuICAgIC8vIChwYXNzd29yZEhhc2gvcGFzc3dvcmRTYWx0KSBpcyBleGNsdWRlZCBmcm9tIHN5bmMgZm9yIHNlY3VyaXR5LCBzbyBhIGRldmljZVxuICAgIC8vIHRoYXQgcmVjZWl2ZWQgaXNFbmNyeXB0ZWQ9dHJ1ZSB3aXRoIG5vIGhhc2ggd291bGQgYmUgcGVybWFuZW50bHkgbG9ja2VkIG91dFxuICAgIC8vIChjaGVja1Bhc3N3b3JkIGFsd2F5cyBmYWlscykuIEVuY3J5cHRpb24gc3RhdGUgaXMgc3RyaWN0bHkgZGV2aWNlLWxvY2FsLlxuXG4gICAgLy8gUDI6IFNldHRpbmdzXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3QgayBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKGFsbFtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGFsbCkpIHtcbiAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQMzogQVBJIGtleSB2YXVsdFxuICAgIGlmIChhbGwuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5hcGlLZXlWYXVsdCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2FwaUtleVZhdWx0JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAzX0FQSUtFWVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFA0OiBWYXVsdCBkb2NzIChpbmRpdmlkdWFsbHksIG5ld2VzdCBmaXJzdClcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBzeW5jIHBheWxvYWQgcmVzcGVjdGluZyBidWRnZXRcbiAgICAgICAgbGV0IHVzZWRCeXRlcyA9IDA7XG4gICAgICAgIGxldCB1c2VkSXRlbXMgPSAwO1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBsZXQgYnVkZ2V0RXhoYXVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoYnVkZ2V0RXhoYXVzdGVkKSBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtWYWx1ZShlbnRyeS5rZXksIGVudHJ5Lmpzb25TdHJpbmcpO1xuICAgICAgICAgICAgbGV0IGVudHJ5U2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgZW50cnlTaXplICs9IGMua2V5Lmxlbmd0aCArICh0eXBlb2YgYy52YWx1ZSA9PT0gJ3N0cmluZycgPyBjLnZhbHVlLmxlbmd0aCA6IEpTT04uc3RyaW5naWZ5KGMudmFsdWUpLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VkQnl0ZXMgKyBlbnRyeVNpemUgPiBTWU5DX1FVT1RBIC0gNTAwIHx8IHVzZWRJdGVtcyArIGNodW5rcy5sZW5ndGggPiBNQVhfSVRFTVMgLSA1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LnByaW9yaXR5IDw9IFBSSU9SSVRZLlAzX0FQSUtFWVMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JpdGljYWwgZGF0YSBcdTIwMTQgdHJ5IGFueXdheSwgbGV0IHRoZSBBUEkgdGhyb3cgaWYgdHJ1bHkgb3ZlclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBCdWRnZXQgZXhoYXVzdGVkIGF0IHByaW9yaXR5ICR7ZW50cnkucHJpb3JpdHl9LCBza2lwcGluZyByZW1haW5pbmcgZW50cmllc2ApO1xuICAgICAgICAgICAgICAgICAgICBidWRnZXRFeGhhdXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBzeW5jUGF5bG9hZFtjLmtleV0gPSBjLnZhbHVlO1xuICAgICAgICAgICAgICAgIGFsbFN5bmNLZXlzLnB1c2goYy5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHN5bmMgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgbWV0YSA9IHtcbiAgICAgICAgICAgIGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBrZXlzOiBhbGxTeW5jS2V5cyxcbiAgICAgICAgfTtcbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeShtZXRhKTtcblxuICAgICAgICAvLyBXcml0ZSB0byBzeW5jIHN0b3JhZ2VcbiAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQoc3luY1BheWxvYWQpO1xuXG4gICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVhZCBleGlzdGluZyBzeW5jIGtleXMgYW5kIHJlbW92ZSBhbnkgbm90IGluIG91ciBwYXlsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgIGsgIT09IFNZTkNfTUVUQV9LRVkgJiYgIWFsbFN5bmNLZXlzLmluY2x1ZGVzKGspXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKG9ycGhhbktleXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIE5vbi1jcml0aWNhbCBjbGVhbnVwXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHthbGxTeW5jS2V5cy5sZW5ndGh9IGVudHJpZXMgKCR7dXNlZEJ5dGVzfSBieXRlcykgdG8gc3luYyBzdG9yYWdlYCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1c2hUb1N5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIC8vIExvY2FsIHN0b3JhZ2UgaXMgdW5hZmZlY3RlZCBcdTIwMTQgZ3JhY2VmdWwgZGVncmFkYXRpb25cbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVsbCBmcm9tIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGRhdGEgZnJvbSBzeW5jIHN0b3JhZ2UgYW5kIHJldHVybiBhcyBhIHBsYWluIG9iamVjdCB3aXRoXG4gKiByZWFzc2VtYmxlZCBjaHVua2VkIHZhbHVlcy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHVsbEZyb21TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgaWYgKCFyYXcgfHwgT2JqZWN0LmtleXMocmF3KS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGFTdHIgPSByYXdbU1lOQ19NRVRBX0tFWV07XG4gICAgICAgIGlmICghbWV0YVN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG1ldGE7XG4gICAgICAgIHRyeSB7IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFTdHIpOyB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgLy8gQ29sbGVjdCB0aGUgbm9uLWNodW5rLCBub24tbWV0YSBrZXlzXG4gICAgICAgIGNvbnN0IGRhdGFLZXlzID0gbWV0YS5rZXlzLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoQ0hVTktfUFJFRklYKSAmJiBrICE9PSBTWU5DX01FVEFfS0VZKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgcmF3KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5fc3luY01ldGEgPSBtZXRhO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdWxsRnJvbVN5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXJnZSBsb2dpY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogTWVyZ2Ugc3luYyBkYXRhIGludG8gbG9jYWwgc3RvcmFnZSB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbG9jYWwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCB7IHVwZGF0ZXMsIGNoYW5nZWQgfSA9IGNvbXB1dGVNZXJnZVVwZGF0ZXMobG9jYWwsIHN5bmNEYXRhKTtcblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQdXJlIG1lcmdlOiBnaXZlbiB0aGUgY3VycmVudCBsb2NhbCBzdGF0ZSBhbmQgYW4gaW5jb21pbmcgc3luYyBwYXlsb2FkLFxuICogY29tcHV0ZSB0aGUgc3RvcmFnZSB1cGRhdGVzIHRvIGFwcGx5LiBObyBJL08gXHUyMDE0IGV4cG9ydGVkIHNvIHRoZSBtZXJnZSBydWxlc1xuICogKGZyZXNoLWluc3RhbGwgZGV0ZWN0aW9uLCBwdWJrZXkta2V5ZWQgcHJvZmlsZSBtYXRjaGluZywgZW5jcnlwdGlvbi1zdGF0ZVxuICogZXhjbHVzaW9uKSBjYW4gYmUgcmVncmVzc2lvbi10ZXN0ZWQgZGlyZWN0bHkuXG4gKlxuICogQHJldHVybnMge3sgdXBkYXRlczogT2JqZWN0LCBjaGFuZ2VkOiBib29sZWFuIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlTWVyZ2VVcGRhdGVzKGxvY2FsLCBzeW5jRGF0YSkge1xuICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybiB7IHVwZGF0ZXMsIGNoYW5nZWQgfTtcblxuICAgIC8vIERldGVjdCBmcmVzaCBpbnN0YWxsOiBubyBwcm9maWxlcywgb3Igb25seSBwcm9maWxlKHMpIHRoYXQgY2Fycnkgbm9cbiAgICAvLyBpZGVudGl0eSBhdCBhbGwgKG5vIHByaXZhdGUga2V5LCBubyBjYWNoZWQgcHVia2V5LCBub3QgYSBidW5rZXIvcmVtb3RlXG4gICAgLy8gc2lnbmVyKS4gQSBidW5rZXIgcHJvZmlsZSBsZWdpdGltYXRlbHkgaGFzIHByaXZLZXk6JycgYnV0IElTIGEgcmVhbFxuICAgIC8vIGlkZW50aXR5IFx1MjAxNCBpdCBtdXN0IG5vdCBiZSB0cmVhdGVkIGFzIGEgYmxhbmsgaW5zdGFsbCBhbmQgd2lwZWQuXG4gICAgY29uc3QgaGFzSWRlbnRpdHkgPSAocCkgPT5cbiAgICAgICAgISEocC5wcml2S2V5IHx8IHAucHViS2V5IHx8IHAudHlwZSA9PT0gJ2J1bmtlcicgfHwgcC5idW5rZXJVcmwgfHwgcC5yZW1vdGVQdWJrZXkpO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICFsb2NhbC5wcm9maWxlcy5zb21lKGhhc0lkZW50aXR5KTtcblxuICAgIC8vIC0tLSBQcm9maWxlcyAoUDEpIC0tLVxuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBpZiAoaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggaW5zdGFsbCBcdTIwMTQgYWRvcHQgc3luYyBwcm9maWxlcyBlbnRpcmVseVxuICAgICAgICAgICAgdXBkYXRlcy5wcm9maWxlcyA9IHN5bmNEYXRhLnByb2ZpbGVzO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobG9jYWwucHJvZmlsZXMpIHtcbiAgICAgICAgICAgIC8vIE1hdGNoIHByb2ZpbGVzIGJ5IHB1YmtleSAoc3RhYmxlIGlkZW50aXR5KSwgTk9UIGFycmF5IGluZGV4IFx1MjAxNFxuICAgICAgICAgICAgLy8gcmVvcmRlcmluZyBvciBpbnNlcnRpbmcgYSBwcm9maWxlIG9uIG9uZSBkZXZpY2UgbXVzdCBuZXZlciBjYXVzZVxuICAgICAgICAgICAgLy8gb25lIGlkZW50aXR5J3Mga2V5IG1hdGVyaWFsIHRvIG92ZXJ3cml0ZSBhbiB1bnJlbGF0ZWQgcHJvZmlsZS5cbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFsuLi5sb2NhbC5wcm9maWxlc107XG4gICAgICAgICAgICBjb25zdCBpbmRleEJ5UHVia2V5ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgbWVyZ2VkLmZvckVhY2goKHAsIGkpID0+IHsgaWYgKHAucHViS2V5KSBpbmRleEJ5UHVia2V5LnNldChwLnB1YktleSwgaSk7IH0pO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN5bmNQcm9maWxlIG9mIHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxJZHggPSBzeW5jUHJvZmlsZS5wdWJLZXkgIT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICA/IGluZGV4QnlQdWJrZXkuZ2V0KHN5bmNQcm9maWxlLnB1YktleSlcbiAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICBpZiAobG9jYWxJZHggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBsb2NhbCBwcm9maWxlIHdpdGggdGhpcyBwdWJrZXkgXHUyMDE0IGl0J3MgYSBuZXcgb25lIGZyb20gc3luYy5cbiAgICAgICAgICAgICAgICAgICAgLy8gKFByb2ZpbGVzIHdpdGhvdXQgYSBwdWJrZXkgY2FuJ3QgYmUgc2FmZWx5IG1hdGNoZWQsIHNvIHdlIGFkZFxuICAgICAgICAgICAgICAgICAgICAvLyByYXRoZXIgdGhhbiByaXNrIGNsb2JiZXJpbmcgYW4gdW5yZWxhdGVkIGxvY2FsIHByb2ZpbGUuKVxuICAgICAgICAgICAgICAgICAgICBtZXJnZWQucHVzaChzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW5jUHJvZmlsZS5wdWJLZXkpIGluZGV4QnlQdWJrZXkuc2V0KHN5bmNQcm9maWxlLnB1YktleSwgbWVyZ2VkLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFByb2ZpbGUgPSBtZXJnZWRbbG9jYWxJZHhdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzeW5jVGltZSA9IHN5bmNQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFRpbWUgPSBsb2NhbFByb2ZpbGUudXBkYXRlZEF0IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW5jVGltZSA+IGxvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgbWVyZ2UgYnV0IHByZXNlcnZlIGxvY2FsIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRbbG9jYWxJZHhdID0geyAuLi5zeW5jUHJvZmlsZSwgaG9zdHM6IGxvY2FsUHJvZmlsZS5ob3N0cyB8fCB7fSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkgdXBkYXRlcy5wcm9maWxlcyA9IG1lcmdlZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlIGluZGV4IChQMSkgLS0tXG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsICYmIGlzRnJlc2gpIHtcbiAgICAgICAgdXBkYXRlcy5wcm9maWxlSW5kZXggPSBzeW5jRGF0YS5wcm9maWxlSW5kZXg7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIC0tLSBFbmNyeXB0aW9uIHN0YXRlIChQMSkgLS0tXG4gICAgLy8gSW50ZW50aW9uYWxseSBOT1QgbWVyZ2VkIGZyb20gc3luYy4gU2VlIGJ1aWxkU3luY1BheWxvYWQoKTogdGhlIHBhc3N3b3JkXG4gICAgLy8gdmVyaWZpZXIgaXMgbmV2ZXIgc3luY2VkLCBzbyB0cnVzdGluZyBhIHN5bmNlZCBpc0VuY3J5cHRlZD10cnVlIHdvdWxkIGxvY2tcbiAgICAvLyB0aGUgdXNlciBvdXQgcGVybWFuZW50bHkuIEVuY3J5cHRpb24gc3RhdGUgc3RheXMgZGV2aWNlLWxvY2FsLlxuXG4gICAgLy8gLS0tIFNldHRpbmdzIChQMikgXHUyMDE0IGxhc3Qtd3JpdGUtd2lucyAtLS1cbiAgICBjb25zdCBzeW5jTWV0YSA9IHN5bmNEYXRhLl9zeW5jTWV0YSB8fCB7fTtcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChzeW5jRGF0YVtrZXldICE9IG51bGwgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgLy8gRm9yIHZlcnNpb24sIG9ubHkgYWNjZXB0IGhpZ2hlclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZlcnNpb24nICYmIGxvY2FsLnZlcnNpb24gJiYgc3luY0RhdGEudmVyc2lvbiA8PSBsb2NhbC52ZXJzaW9uKSBjb250aW51ZTtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSAmJiBzeW5jRGF0YVtrZXldICE9PSBsb2NhbFtrZXldKSB7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gQVBJIEtleSBWYXVsdCAoUDMpIC0tLVxuICAgIGlmIChzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICBpZiAoIWxvY2FsLmFwaUtleVZhdWx0IHx8IGlzRnJlc2gpIHtcbiAgICAgICAgICAgIHVwZGF0ZXMuYXBpS2V5VmF1bHQgPSBzeW5jRGF0YS5hcGlLZXlWYXVsdDtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gTWVyZ2UgaW5kaXZpZHVhbCBrZXlzIGJ5IHVwZGF0ZWRBdFxuICAgICAgICAgICAgY29uc3QgbG9jYWxLZXlzID0gbG9jYWwuYXBpS2V5VmF1bHQua2V5cyB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IHN5bmNLZXlzID0gc3luY0RhdGEuYXBpS2V5VmF1bHQua2V5cyB8fCB7fTtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4ubG9jYWxLZXlzIH07XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpZCwgc3luY0tleV0gb2YgT2JqZWN0LmVudHJpZXMoc3luY0tleXMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxLZXkgPSBtZXJnZWRbaWRdO1xuICAgICAgICAgICAgICAgIGlmICghbG9jYWxLZXkgfHwgKHN5bmNLZXkudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsS2V5LnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRbaWRdID0gc3luY0tleTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0geyAuLi5sb2NhbC5hcGlLZXlWYXVsdCwga2V5czogbWVyZ2VkIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gVmF1bHQgZG9jcyAoUDQpIC0tLVxuICAgIGNvbnN0IGxvY2FsRG9jcyA9IGxvY2FsLnZhdWx0RG9jcyB8fCB7fTtcbiAgICBsZXQgZG9jc0NoYW5nZWQgPSBmYWxzZTtcbiAgICBjb25zdCBtZXJnZWREb2NzID0geyAuLi5sb2NhbERvY3MgfTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKCFrZXkuc3RhcnRzV2l0aCgndmF1bHREb2M6JykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkb2MgPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIWRvYyB8fCAhZG9jLnBhdGgpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBsb2NhbERvYyA9IG1lcmdlZERvY3NbZG9jLnBhdGhdO1xuICAgICAgICBpZiAoIWxvY2FsRG9jIHx8IChkb2MudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsRG9jLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgbWVyZ2VkRG9jc1tkb2MucGF0aF0gPSBkb2M7XG4gICAgICAgICAgICBkb2NzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRvY3NDaGFuZ2VkKSB7XG4gICAgICAgIHVwZGF0ZXMudmF1bHREb2NzID0gbWVyZ2VkRG9jcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdXBkYXRlcywgY2hhbmdlZCB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlYm91bmNlZCBwdXNoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTY2hlZHVsZSBhIHN5bmMgcHVzaCB3aXRoIGEgMi1zZWNvbmQgZGVib3VuY2UuXG4gKiBFeHBvcnRlZCBmb3IgdXNlIGJ5IHN0b3JlcyBhbmQgdGhlIHN0b3JhZ2UgaW50ZXJjZXB0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZVN5bmNQdXNoKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuICAgIGlmIChwdXNoVGltZXIpIGNsZWFyVGltZW91dChwdXNoVGltZXIpO1xuICAgIHB1c2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdXNoVGltZXIgPSBudWxsO1xuICAgICAgICBwdXNoVG9TeW5jKCk7XG4gICAgfSwgMjAwMCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRW5hYmxlIC8gZGlzYWJsZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1N5bmNFbmFibGVkKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IHRydWUgfSk7XG4gICAgcmV0dXJuIGRhdGFbTE9DQUxfRU5BQkxFRF9LRVldO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3luY0VuYWJsZWQoZW5hYmxlZCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogZW5hYmxlZCB9KTtcbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEluaXRpYWxpc2F0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDYWxsZWQgb25jZSBvbiBzdGFydHVwIChmcm9tIGJhY2tncm91bmQuanMpLlxuICogUHVsbHMgZnJvbSBzeW5jLCBtZXJnZXMsIHRoZW4gbGlzdGVucyBmb3IgcmVtb3RlIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0U3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gc3RvcmFnZS5zeW5jIG5vdCBhdmFpbGFibGUgXHUyMDE0IHNraXBwaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBQbGF0Zm9ybSBzeW5jIGRpc2FibGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdWxsICsgbWVyZ2VcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzeW5jRGF0YSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAoc3luY0RhdGEpIHtcbiAgICAgICAgICAgIGF3YWl0IG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCttZXJnZSBjb21wbGV0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTm8gc3luYyBkYXRhIGZvdW5kIFx1MjAxNCBmcmVzaCBzeW5jJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlbW90ZSBjaGFuZ2VzXG4gICAgaWYgKGFwaS5zdG9yYWdlLm9uQ2hhbmdlZCkge1xuICAgICAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWFOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJlYU5hbWUgIT09ICdzeW5jJykgcmV0dXJuO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIHN5bmMgY2hhbmdlIGRldGVjdGVkJyk7XG4gICAgICAgICAgICAvLyBSZS1wdWxsIGFuZCBtZXJnZSB0aGUgZnVsbCBzeW5jIGRhdGEgdG8gaGFuZGxlIGNodW5rZWQgdmFsdWVzIGNvcnJlY3RseVxuICAgICAgICAgICAgcHVsbEZyb21TeW5jKCkudGhlbihzeW5jRGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmNEYXRhKSBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIFJlbW90ZSBtZXJnZSBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEbyBhbiBpbml0aWFsIHB1c2ggc28gbG9jYWwgZGF0YSBpcyBtaXJyb3JlZFxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cbiIsICIvKipcbiAqIEFQSSBLZXkgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgQVBJIGtleXNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIGFwaUtleVZhdWx0OiB7XG4gKiAgICAga2V5czoge1xuICogICAgICAgXCI8dXVpZD5cIjogeyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQsIHByb2ZpbGVTY29wZSB9XG4gKiAgICAgfSxcbiAqICAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAqICAgICBldmVudElkOiBudWxsLFxuICogICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICogICAgIHN5bmNTdGF0dXM6IFwic3luY2VkXCIgICAgLy8gc3luY2VkIHwgbG9jYWwtb25seSB8IGNvbmZsaWN0XG4gKiAgIH1cbiAqXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdhcGlLZXlWYXVsdCc7XG5cbmNvbnN0IERFRkFVTFRfU1RPUkUgPSB7XG4gICAga2V5czoge30sXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZXZlbnRJZDogbnVsbCxcbiAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAgICBzeW5jU3RhdHVzOiAnc3luY2VkJyxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtTVE9SQUdFX0tFWV06IERFRkFVTFRfU1RPUkUgfSk7XG4gICAgcmV0dXJuIHsgLi4uREVGQVVMVF9TVE9SRSwgLi4uZGF0YVtTVE9SQUdFX0tFWV0gfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmUoc3RvcmUpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZ1bGwgQVBJIGtleSBzdG9yZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXlTdG9yZSgpIHtcbiAgICByZXR1cm4gZ2V0U3RvcmUoKTtcbn1cblxuLyoqXG4gKiBHZXQgYSBzaW5nbGUgQVBJIGtleSBieSBpZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fG51bGw+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBzdG9yZS5rZXlzW2lkXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFVwc2VydCBhbiBBUEkga2V5LiBDcmVhdGVzIGlmIG5ldywgdXBkYXRlcyBpZiBleGlzdGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVVSURcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxuICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0b3JlLmtleXNbaWRdO1xuICAgIHN0b3JlLmtleXNbaWRdID0ge1xuICAgICAgICBpZCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIHNlY3JldCxcbiAgICAgICAgY3JlYXRlZEF0OiBleGlzdGluZz8uY3JlYXRlZEF0IHx8IG5vdyxcbiAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xuICAgIHJldHVybiBzdG9yZS5rZXlzW2lkXTtcbn1cblxuLyoqXG4gKiBEZWxldGUgYW4gQVBJIGtleSBieSBpZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUFwaUtleShpZCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBkZWxldGUgc3RvcmUua2V5c1tpZF07XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIEFQSSBrZXlzIHNvcnRlZCBieSBsYWJlbCAoY2FzZS1pbnNlbnNpdGl2ZSkuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0QXBpS2V5cygpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoc3RvcmUua2V5cykuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBNYXAgb2YgaWQgLT4ga2V5IGRhdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICByZXR1cm4gc3RvcmUua2V5cztcbn1cblxuLyoqXG4gKiBJbXBvcnQga2V5cyBpbnRvIHRoZSBzdG9yZSAobWVyZ2UgXHUyMDE0IGV4aXN0aW5nIGtleXMgd2l0aCBzYW1lIGlkIGFyZSBvdmVyd3JpdHRlbikuXG4gKiBAcGFyYW0ge09iamVjdH0ga2V5cyAtIE1hcCBvZiBpZCAtPiB7IGlkLCBsYWJlbCwgc2VjcmV0LCBjcmVhdGVkQXQsIHVwZGF0ZWRBdCB9XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRTdG9yZShrZXlzKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGtleXMpKSB7XG4gICAgICAgIHN0b3JlLmtleXNbaWRdID0ga2V5O1xuICAgIH1cbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHtcbiAgICBnZXRBcGlLZXlTdG9yZSxcbiAgICBzYXZlQXBpS2V5LFxuICAgIGRlbGV0ZUFwaUtleSxcbiAgICBsaXN0QXBpS2V5cyxcbiAgICBzZXRTeW5jRW5hYmxlZCxcbiAgICBpc1N5bmNFbmFibGVkLFxuICAgIHVwZGF0ZVN0b3JlU3luY1N0YXRlLFxuICAgIGV4cG9ydFN0b3JlLFxuICAgIGltcG9ydFN0b3JlLFxufSBmcm9tICcuLi91dGlsaXRpZXMvYXBpLWtleS1zdG9yZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGtleXM6IFtdLFxuICAgIG5ld0xhYmVsOiAnJyxcbiAgICBuZXdTZWNyZXQ6ICcnLFxuICAgIGVkaXRpbmdJZDogbnVsbCxcbiAgICBlZGl0TGFiZWw6ICcnLFxuICAgIGVkaXRTZWNyZXQ6ICcnLFxuICAgIGNvcGllZElkOiBudWxsLFxuICAgIHJldmVhbGVkSWQ6IG51bGwsXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZ2xvYmFsU3luY1N0YXR1czogJ2lkbGUnLFxuICAgIHN5bmNFcnJvcjogJycsXG4gICAgc2F2aW5nOiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIHNvcnRlZEtleXMoKSB7XG4gICAgcmV0dXJuIFsuLi5zdGF0ZS5rZXlzXS5zb3J0KChhLCBiKSA9PlxuICAgICAgICBhLmxhYmVsLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmxhYmVsLnRvTG93ZXJDYXNlKCkpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1hc2tTZWNyZXQoc2VjcmV0KSB7XG4gICAgaWYgKCFzZWNyZXQpIHJldHVybiAnJztcbiAgICBpZiAoc2VjcmV0Lmxlbmd0aCA8PSA4KSByZXR1cm4gJ1xcdTIwMjInLnJlcGVhdChzZWNyZXQubGVuZ3RoKTtcbiAgICByZXR1cm4gc2VjcmV0LnNsaWNlKDAsIDQpICsgJ1xcdTIwMjInLnJlcGVhdCg0KSArIHNlY3JldC5zbGljZSgtNCk7XG59XG5cbmZ1bmN0aW9uIHNob3dUb2FzdChtc2cpIHtcbiAgICBzdGF0ZS50b2FzdCA9IG1zZztcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUudG9hc3QgPSAnJzsgcmVuZGVyKCk7IH0sIDIwMDApO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzQ2xhc3Moc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ2lkbGUnKSByZXR1cm4gJ2JnLWdyZWVuLTUwMCc7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ2JnLXllbGxvdy01MDAgYW5pbWF0ZS1wdWxzZSc7XG4gICAgcmV0dXJuICdiZy1yZWQtNTAwJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnU3luY2VkJyA6ICdMb2NhbCBvbmx5Jztcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBzeW5jVG9nZ2xlID0gJCgnc3luYy10b2dnbGUnKTtcbiAgICBjb25zdCBrZXlDb3VudCA9ICQoJ2tleS1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGlubGluZS1ibG9jayB3LTMgaC0zIHJvdW5kZWQtZnVsbCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKSB8fCAhc3RhdGUuc3luY0VuYWJsZWQ7XG4gICAgaWYgKHN5bmNUb2dnbGUpIHN5bmNUb2dnbGUuY2hlY2tlZCA9IHN0YXRlLnN5bmNFbmFibGVkO1xuICAgIGlmIChrZXlDb3VudCkga2V5Q291bnQudGV4dENvbnRlbnQgPSBzdGF0ZS5rZXlzLmxlbmd0aCArICcga2V5JyArIChzdGF0ZS5rZXlzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEtleSB0YWJsZVxuICAgIGNvbnN0IGtleVRhYmxlQ29udGFpbmVyID0gJCgna2V5LXRhYmxlLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IG5vS2V5c01zZyA9ICQoJ25vLWtleXMnKTtcbiAgICBjb25zdCBrZXlUYWJsZUJvZHkgPSAkKCdrZXktdGFibGUtYm9keScpO1xuXG4gICAgaWYgKGtleVRhYmxlQ29udGFpbmVyKSBrZXlUYWJsZUNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUua2V5cy5sZW5ndGggPiAwID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAobm9LZXlzTXNnKSBub0tleXNNc2cuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIGlmIChrZXlUYWJsZUJvZHkpIHtcbiAgICAgICAgY29uc3Qgc29ydGVkID0gc29ydGVkS2V5cygpO1xuICAgICAgICBrZXlUYWJsZUJvZHkuaW5uZXJIVE1MID0gc29ydGVkLm1hcChrZXkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmVkaXRpbmdJZCA9PT0ga2V5LmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwiYm9yZGVyLWIgYm9yZGVyLW1vbm9rYWktYmctbGlnaHRlciBob3ZlcjpiZy1tb25va2FpLWJnLWxpZ2h0ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5wdXQgdGV4dC1zbSB3LWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtbGFiZWw9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0TGFiZWwpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTIgZm9udC1tb25vIHRleHQteHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucHV0IHRleHQteHMgZm9udC1tb25vIHctZnVsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWxsY2hlY2s9XCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1zZWNyZXQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0U2VjcmV0KX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicC0yIHRleHQtcmlnaHQgd2hpdGVzcGFjZS1ub3dyYXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV0dG9uIHRleHQteHNcIiBkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnV0dG9uIHRleHQteHNcIiBkYXRhLWFjdGlvbj1cImNhbmNlbC1lZGl0XCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5U2VjcmV0ID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0ga2V5LmlkID8gZXNjYXBlSHRtbChrZXkuc2VjcmV0KSA6IGVzY2FwZUh0bWwobWFza1NlY3JldChrZXkuc2VjcmV0KSk7XG4gICAgICAgICAgICBjb25zdCBjb3B5TGFiZWwgPSBzdGF0ZS5jb3BpZWRJZCA9PT0ga2V5LmlkID8gJ0NvcGllZCEnIDogJ0NvcHknO1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJib3JkZXItYiBib3JkZXItbW9ub2thaS1iZy1saWdodGVyIGhvdmVyOmJnLW1vbm9rYWktYmctbGlnaHRlclwiPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY3Vyc29yLXBvaW50ZXIgaG92ZXI6dW5kZXJsaW5lXCIgZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj4ke2VzY2FwZUh0bWwoa2V5LmxhYmVsKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cInAtMiBmb250LW1vbm8gdGV4dC14c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjdXJzb3ItcG9pbnRlclwiIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtkaXNwbGF5U2VjcmV0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwicC0yIHRleHQtcmlnaHQgd2hpdGVzcGFjZS1ub3dyYXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidXR0b24gdGV4dC14c1wiIGRhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7Y29weUxhYmVsfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ1dHRvbiB0ZXh0LXhzXCIgZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj5EZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgYDtcbiAgICAgICAgfSkuam9pbignJyk7XG5cbiAgICAgICAgLy8gQmluZCB0YWJsZSBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc3RhcnRFZGl0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXZlYWxlZElkID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0gZWwuZGF0YXNldC5rZXlJZCA/IG51bGwgOiBlbC5kYXRhc2V0LmtleUlkO1xuICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gY29weVNlY3JldChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBkZWxldGVLZXkoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlRWRpdCk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsRWRpdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJpbmQgZWRpdCBpbnB1dCBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtbGFiZWxdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRMYWJlbCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1zZWNyZXRdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQga2V5IGZvcm1cbiAgICBjb25zdCBuZXdMYWJlbElucHV0ID0gJCgnbmV3LWxhYmVsJyk7XG4gICAgY29uc3QgbmV3U2VjcmV0SW5wdXQgPSAkKCduZXctc2VjcmV0Jyk7XG4gICAgY29uc3QgYWRkS2V5QnRuID0gJCgnYWRkLWtleS1idG4nKTtcblxuICAgIGlmIChuZXdMYWJlbElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld0xhYmVsSW5wdXQpIG5ld0xhYmVsSW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdMYWJlbDtcbiAgICBpZiAobmV3U2VjcmV0SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3U2VjcmV0SW5wdXQpIG5ld1NlY3JldElucHV0LnZhbHVlID0gc3RhdGUubmV3U2VjcmV0O1xuICAgIGlmIChhZGRLZXlCdG4pIHtcbiAgICAgICAgYWRkS2V5QnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLm5ld0xhYmVsLnRyaW0oKS5sZW5ndGggPT09IDAgfHwgc3RhdGUubmV3U2VjcmV0LnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGFkZEtleUJ0bi50ZXh0Q29udGVudCA9IHN0YXRlLnNhdmluZyA/ICdTYXZpbmcuLi4nIDogJ1NhdmUnO1xuICAgIH1cblxuICAgIC8vIFRvYXN0XG4gICAgY29uc3QgdG9hc3QgPSAkKCd0b2FzdCcpO1xuICAgIGlmICh0b2FzdCkge1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9IHN0YXRlLnRvYXN0O1xuICAgICAgICB0b2FzdC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudG9hc3QgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBzdHI7XG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG4vLyAtLS0gQ1JVRCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gYWRkS2V5KCkge1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUubmV3TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLm5ld1NlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgY29uc3QgaWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIGF3YWl0IHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLm5ld0xhYmVsID0gJyc7XG4gICAgc3RhdGUubmV3U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICBzaG93VG9hc3QoJ0tleSBhZGRlZCcpO1xufVxuXG5mdW5jdGlvbiBzdGFydEVkaXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBrZXkuaWQ7XG4gICAgc3RhdGUuZWRpdExhYmVsID0ga2V5LmxhYmVsO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSBrZXkuc2VjcmV0O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRWRpdCgpIHtcbiAgICBpZiAoIXN0YXRlLmVkaXRpbmdJZCkgcmV0dXJuO1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUuZWRpdExhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5lZGl0U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIGF3YWl0IHNhdmVBcGlLZXkoc3RhdGUuZWRpdGluZ0lkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IHVwZGF0ZWQnKTtcbn1cblxuZnVuY3Rpb24gY2FuY2VsRWRpdCgpIHtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlS2V5KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKCFjb25maXJtKGBEZWxldGUgXCIke2tleS5sYWJlbH1cIj9gKSkgcmV0dXJuO1xuXG4gICAgYXdhaXQgZGVsZXRlQXBpS2V5KGlkKTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IGRlbGV0ZWQnKTtcbn1cblxuLy8gLS0tIENsaXBib2FyZCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gY29weVNlY3JldChpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGtleS5zZWNyZXQpO1xuICAgIHN0YXRlLmNvcGllZElkID0gaWQ7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLmNvcGllZElkID0gbnVsbDsgcmVuZGVyKCk7IH0sIDIwMDApO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCgnJykuY2F0Y2goKCkgPT4ge30pO1xuICAgIH0sIDMwMDAwKTtcbn1cblxuLy8gLS0tIFN5bmMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIHB1Ymxpc2hUb1JlbGF5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2FwaWtleXMucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGtleXM6IHN0b3JlLmtleXMgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNBbGwoKSB7XG4gICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdzeW5jaW5nJztcbiAgICBzdGF0ZS5zeW5jRXJyb3IgPSAnJztcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2FwaWtleXMuZmV0Y2gnIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQua2V5cykge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRBcGlLZXlTdG9yZSgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxLZXlzID0gc3RvcmUua2V5cztcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQ291bnQgPSBPYmplY3Qua2V5cyhsb2NhbEtleXMpLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKGxvY2FsQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZXN1bHQua2V5cyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdG9yZS5yZWxheUNyZWF0ZWRBdCB8fCByZXN1bHQuY3JlYXRlZEF0ID4gc3RvcmUucmVsYXlDcmVhdGVkQXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZXN1bHQua2V5cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnaWRsZSc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gZS5tZXNzYWdlIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVN5bmMoKSB7XG4gICAgYXdhaXQgc2V0U3luY0VuYWJsZWQoc3RhdGUuc3luY0VuYWJsZWQpO1xuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG4vLyAtLS0gSW1wb3J0IC8gRXhwb3J0IC0tLVxuXG5hc3luYyBmdW5jdGlvbiBleHBvcnRLZXlzKCkge1xuICAgIGNvbnN0IGtleXMgPSBhd2FpdCBleHBvcnRTdG9yZSgpO1xuICAgIGNvbnN0IHBsYWluVGV4dCA9IEpTT04uc3RyaW5naWZ5KGtleXMsIG51bGwsIDIpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnYXBpa2V5cy5lbmNyeXB0JyxcbiAgICAgICAgcGF5bG9hZDogeyBwbGFpblRleHQgfSxcbiAgICB9KTtcblxuICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdFeHBvcnQgZmFpbGVkOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihcbiAgICAgICAgW0pTT04uc3RyaW5naWZ5KHsgZW5jcnlwdGVkOiB0cnVlLCBkYXRhOiByZXN1bHQuY2lwaGVyVGV4dCB9KV0sXG4gICAgICAgIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgKTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIGEuZG93bmxvYWQgPSAnbm9zdHJrZXktYXBpLWtleXMtYmFja3VwLmpzb24nO1xuICAgIGEuY2xpY2soKTtcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgc2hvd1RvYXN0KCdFeHBvcnRlZCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlzKGV2ZW50KSB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdO1xuICAgIGlmICghZmlsZSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuXG4gICAgICAgIGxldCBrZXlzO1xuICAgICAgICBpZiAocGFyc2VkLmVuY3J5cHRlZCAmJiBwYXJzZWQuZGF0YSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLmRlY3J5cHQnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgY2lwaGVyVGV4dDogcGFyc2VkLmRhdGEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHNob3dUb2FzdCgnRGVjcnlwdCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleXMgPSBKU09OLnBhcnNlKHJlc3VsdC5wbGFpblRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IHBhcnNlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGltcG9ydFN0b3JlKGtleXMpO1xuICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgICAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydGVkICcgKyBPYmplY3Qua2V5cyhrZXlzKS5sZW5ndGggKyAnIGtleXMnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNob3dUb2FzdCgnSW1wb3J0IGZhaWxlZDogJyArIGUubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG59XG5cbi8vIC0tLSBFdmVudCBiaW5kaW5nIC0tLVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgICQoJ3N5bmMtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3luY0FsbCk7XG4gICAgJCgnYWRkLWtleS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRLZXkpO1xuICAgICQoJ2V4cG9ydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBleHBvcnRLZXlzKTtcbiAgICAkKCdpbXBvcnQtZmlsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBpbXBvcnRLZXlzKTtcbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG5cbiAgICAkKCdzeW5jLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICAgIHRvZ2dsZVN5bmMoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1sYWJlbCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld0xhYmVsID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LXNlY3JldCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld1NlY3JldCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBHYXRlOiByZXF1aXJlIG1hc3RlciBwYXNzd29yZCBiZWZvcmUgYWxsb3dpbmcgYWNjZXNzXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSk7XG4gICAgY29uc3QgZ2F0ZSA9ICQoJ3ZhdWx0LWxvY2tlZC1nYXRlJyk7XG4gICAgY29uc3QgbWFpbiA9ICQoJ3ZhdWx0LW1haW4tY29udGVudCcpO1xuXG4gICAgaWYgKCFpc0VuY3J5cHRlZCkge1xuICAgICAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgJCgnZ2F0ZS1zZWN1cml0eS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBhcGkucnVudGltZS5nZXRVUkwoJ3NlY3VyaXR5L3NlY3VyaXR5Lmh0bWwnKTtcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ25vc3Rya2V5LW9wdGlvbnMnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgY29uc3QgcmVsYXlzID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZ2V0UmVsYXlzJyB9KTtcbiAgICBzdGF0ZS5yZWxheUluZm8gPSByZWxheXMgfHwgeyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgc3RhdGUuc3luY0VuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsZUFBTyxNQUFNLFNBQVM7QUFBQSxVQUNsQixHQUFHO0FBQUEsVUFDSCxJQUFJLFdBQVc7QUFDWCxnQkFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLFdBQVc7QUFDaEQscUJBQU8sSUFBSSxNQUFNLFNBQVMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3hELE9BQU87QUFDSCxzQkFBUSxPQUFPLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxNQUFNO0FBQUEsWUFDbkQ7QUFBQSxVQUNKO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFNQSxNQUFNLE1BQU0sQ0FBQztBQUdiLE1BQUksVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSVYsZUFBZSxNQUFNO0FBQ2pCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsWUFBWSxHQUFHLElBQUk7QUFBQSxNQUMvQztBQUNBLGFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUM1RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBUUEsV0FBVyxTQUFTLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUs1QixPQUFPLE1BQU07QUFDVCxhQUFPLFNBQVMsUUFBUSxPQUFPLElBQUk7QUFBQSxJQUN2QztBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0Esa0JBQWtCO0FBQ2QsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsUUFBUSxnQkFBZ0I7QUFBQSxNQUM1QztBQUNBLGFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLGVBQWUsRUFBRTtBQUFBLElBQ3pFO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxJQUFJLEtBQUs7QUFDTCxhQUFPLFNBQVMsUUFBUTtBQUFBLElBQzVCO0FBQUEsRUFDSjtBQUdBLE1BQUksVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLE1BQ0gsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzdDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzdDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsU0FBUyxNQUFNO0FBQ1gsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEdBQUcsSUFBSTtBQUFBLFFBQy9DO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNsRjtBQUFBLE1BQ0EsVUFBVSxNQUFNO0FBQ1osWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxPQUFPLEdBQUcsSUFBSTtBQUFBLFFBQ2hEO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNuRjtBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUEsSUFJQSxNQUFNLFNBQVMsU0FBUyxPQUFPO0FBQUEsTUFDM0IsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzVDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUM5RTtBQUFBLE1BQ0EsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzVDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUM5RTtBQUFBLE1BQ0EsVUFBVSxNQUFNO0FBQ1osWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLFFBQy9DO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNqRjtBQUFBLE1BQ0EsU0FBUyxNQUFNO0FBQ1gsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLFFBQzlDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsaUJBQWlCLE1BQU07QUFDbkIsWUFBSSxDQUFDLFNBQVMsUUFBUSxLQUFLLGVBQWU7QUFFdEMsaUJBQU8sUUFBUSxRQUFRLENBQUM7QUFBQSxRQUM1QjtBQUNBLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssY0FBYyxHQUFHLElBQUk7QUFBQSxRQUN0RDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxhQUFhLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDeEY7QUFBQSxJQUNKLElBQUk7QUFBQTtBQUFBLElBR0osV0FBVyxTQUFTLFNBQVMsYUFBYTtBQUFBLEVBQzlDO0FBR0EsTUFBSSxPQUFPO0FBQUEsSUFDUCxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLFNBQVMsTUFBTTtBQUNYLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxNQUN0QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNoRTtBQUFBLElBQ0EsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLE9BQU8sTUFBTTtBQUNULFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxNQUNwQztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUM5RDtBQUFBLElBQ0EsY0FBYyxNQUFNO0FBQ2hCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssV0FBVyxHQUFHLElBQUk7QUFBQSxNQUMzQztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNyRTtBQUFBLElBQ0EsZUFBZSxNQUFNO0FBQ2pCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssWUFBWSxHQUFHLElBQUk7QUFBQSxNQUM1QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUN0RTtBQUFBLEVBQ0o7QUFJQSxNQUFJLFNBQVMsU0FBUyxTQUFTO0FBQUEsSUFDM0IsVUFBVSxNQUFNO0FBRVosWUFBTSxTQUFTLFNBQVMsT0FBTyxPQUFPLEdBQUcsSUFBSTtBQUM3QyxhQUFPLFVBQVUsT0FBTyxPQUFPLFNBQVMsYUFBYSxTQUFTLFFBQVEsUUFBUTtBQUFBLElBQ2xGO0FBQUEsSUFDQSxTQUFTLE1BQU07QUFDWCxVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxPQUFPLE1BQU0sR0FBRyxJQUFJO0FBQUEsTUFDeEM7QUFDQSxhQUFPLFVBQVUsU0FBUyxRQUFRLFNBQVMsT0FBTyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDcEU7QUFBQSxJQUNBLFNBQVMsU0FBUyxPQUFPO0FBQUEsRUFDN0IsSUFBSTs7O0FDeE9KLE1BQU0sYUFBYTtBQUNuQixNQUFNLFdBQVc7QUFDakIsTUFBTSxZQUFZO0FBQ2xCLE1BQU0sZUFBZTtBQUNyQixNQUFNLGdCQUFnQjtBQUN0QixNQUFNLG9CQUFvQjtBQVcxQixNQUFNLFdBQVc7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxFQUNkO0FBRUEsTUFBTSxVQUFVLElBQUksUUFBUTtBQUM1QixNQUFJLFlBQVk7QUFVaEIsV0FBUyxXQUFXLEtBQUssWUFBWTtBQUNqQyxVQUFNLFNBQVMsQ0FBQztBQUNoQixhQUFTLElBQUksR0FBRyxJQUFJLFdBQVcsUUFBUSxLQUFLLFdBQVcsS0FBSztBQUV4RCxhQUFPLEtBQUssV0FBVyxNQUFNLEdBQUcsSUFBSSxXQUFXLEdBQUcsQ0FBQztBQUFBLElBQ3ZEO0FBQ0EsUUFBSSxPQUFPLFdBQVcsR0FBRztBQUVyQixhQUFPLENBQUMsRUFBRSxLQUFLLE9BQU8sV0FBVyxDQUFDO0FBQUEsSUFDdEM7QUFFQSxVQUFNLFVBQVUsQ0FBQztBQUNqQixhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3BDLGNBQVEsS0FBSyxFQUFFLEtBQUssR0FBRyxZQUFZLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxJQUN4RTtBQUVBLFlBQVEsS0FBSyxFQUFFLEtBQUssT0FBTyxLQUFLLFVBQVUsRUFBRSxXQUFXLE1BQU0sT0FBTyxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdEYsV0FBTztBQUFBLEVBQ1g7QUFpQ0EsaUJBQWUsbUJBQW1CO0FBQzlCLFVBQU0sTUFBTSxNQUFNLFFBQVEsSUFBSSxJQUFJO0FBQ2xDLFVBQU0sVUFBVSxDQUFDO0FBR2pCLFFBQUksSUFBSSxVQUFVO0FBQ2QsWUFBTSxnQkFBZ0IsSUFBSSxTQUFTLElBQUksT0FBSztBQUN4QyxjQUFNLEVBQUUsT0FBTyxHQUFHLEtBQUssSUFBSTtBQUMzQixlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQ0QsWUFBTSxPQUFPLEtBQUssVUFBVSxhQUFhO0FBQ3pDLGNBQVEsS0FBSyxFQUFFLEtBQUssWUFBWSxZQUFZLE1BQU0sVUFBVSxTQUFTLGFBQWEsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLElBQ3pHO0FBQ0EsUUFBSSxJQUFJLGdCQUFnQixNQUFNO0FBQzFCLFlBQU0sT0FBTyxLQUFLLFVBQVUsSUFBSSxZQUFZO0FBQzVDLGNBQVEsS0FBSyxFQUFFLEtBQUssZ0JBQWdCLFlBQVksTUFBTSxVQUFVLFNBQVMsYUFBYSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsSUFDN0c7QUFPQSxVQUFNLGVBQWUsQ0FBQyxtQkFBbUIsV0FBVyxvQkFBb0IsaUJBQWlCO0FBQ3pGLGVBQVcsS0FBSyxjQUFjO0FBQzFCLFVBQUksSUFBSSxDQUFDLEtBQUssTUFBTTtBQUNoQixjQUFNLE9BQU8sS0FBSyxVQUFVLElBQUksQ0FBQyxDQUFDO0FBQ2xDLGdCQUFRLEtBQUssRUFBRSxLQUFLLEdBQUcsWUFBWSxNQUFNLFVBQVUsU0FBUyxhQUFhLE1BQU0sS0FBSyxPQUFPLENBQUM7QUFBQSxNQUNoRztBQUFBLElBQ0o7QUFFQSxlQUFXLEtBQUssT0FBTyxLQUFLLEdBQUcsR0FBRztBQUM5QixVQUFJLEVBQUUsV0FBVyxVQUFVLEdBQUc7QUFDMUIsY0FBTSxPQUFPLEtBQUssVUFBVSxJQUFJLENBQUMsQ0FBQztBQUNsQyxnQkFBUSxLQUFLLEVBQUUsS0FBSyxHQUFHLFlBQVksTUFBTSxVQUFVLFNBQVMsYUFBYSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsTUFDaEc7QUFBQSxJQUNKO0FBR0EsUUFBSSxJQUFJLGFBQWE7QUFDakIsWUFBTSxPQUFPLEtBQUssVUFBVSxJQUFJLFdBQVc7QUFDM0MsY0FBUSxLQUFLLEVBQUUsS0FBSyxlQUFlLFlBQVksTUFBTSxVQUFVLFNBQVMsWUFBWSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsSUFDM0c7QUFHQSxRQUFJLElBQUksYUFBYSxPQUFPLElBQUksY0FBYyxVQUFVO0FBQ3BELFlBQU0sT0FBTyxPQUFPLE9BQU8sSUFBSSxTQUFTLEVBQUUsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFLGFBQWEsTUFBTSxFQUFFLGFBQWEsRUFBRTtBQUNoRyxpQkFBVyxPQUFPLE1BQU07QUFDcEIsY0FBTSxTQUFTLFlBQVksSUFBSSxJQUFJO0FBQ25DLGNBQU0sT0FBTyxLQUFLLFVBQVUsR0FBRztBQUMvQixnQkFBUSxLQUFLLEVBQUUsS0FBSyxRQUFRLFlBQVksTUFBTSxVQUFVLFNBQVMsVUFBVSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsTUFDbEc7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFNQSxpQkFBZSxhQUFhO0FBQ3hCLFFBQUksQ0FBQyxJQUFJLFFBQVEsS0FBTTtBQUV2QixVQUFNLFVBQVUsTUFBTSxjQUFjO0FBQ3BDLFFBQUksQ0FBQyxRQUFTO0FBRWQsUUFBSTtBQUNBLFlBQU0sVUFBVSxNQUFNLGlCQUFpQjtBQUd2QyxjQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUc5QyxVQUFJLFlBQVk7QUFDaEIsVUFBSSxZQUFZO0FBQ2hCLFlBQU0sY0FBYyxDQUFDO0FBQ3JCLFlBQU0sY0FBYyxDQUFDO0FBQ3JCLFVBQUksa0JBQWtCO0FBRXRCLGlCQUFXLFNBQVMsU0FBUztBQUN6QixZQUFJLGdCQUFpQjtBQUVyQixjQUFNLFNBQVMsV0FBVyxNQUFNLEtBQUssTUFBTSxVQUFVO0FBQ3JELFlBQUksWUFBWTtBQUNoQixtQkFBVyxLQUFLLFFBQVE7QUFDcEIsdUJBQWEsRUFBRSxJQUFJLFVBQVUsT0FBTyxFQUFFLFVBQVUsV0FBVyxFQUFFLE1BQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxLQUFLLEVBQUU7QUFBQSxRQUN4RztBQUVBLFlBQUksWUFBWSxZQUFZLGFBQWEsT0FBTyxZQUFZLE9BQU8sU0FBUyxZQUFZLEdBQUc7QUFDdkYsY0FBSSxNQUFNLFlBQVksU0FBUyxZQUFZO0FBQUEsVUFFM0MsT0FBTztBQUNILG9CQUFRLEtBQUssOENBQThDLE1BQU0sUUFBUSw4QkFBOEI7QUFDdkcsOEJBQWtCO0FBQ2xCO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFFQSxtQkFBVyxLQUFLLFFBQVE7QUFDcEIsc0JBQVksRUFBRSxHQUFHLElBQUksRUFBRTtBQUN2QixzQkFBWSxLQUFLLEVBQUUsR0FBRztBQUFBLFFBQzFCO0FBQ0EscUJBQWE7QUFDYixxQkFBYSxPQUFPO0FBQUEsTUFDeEI7QUFHQSxZQUFNLE9BQU87QUFBQSxRQUNULGVBQWUsS0FBSyxJQUFJO0FBQUEsUUFDeEIsTUFBTTtBQUFBLE1BQ1Y7QUFDQSxrQkFBWSxhQUFhLElBQUksS0FBSyxVQUFVLElBQUk7QUFHaEQsWUFBTSxJQUFJLFFBQVEsS0FBSyxJQUFJLFdBQVc7QUFHdEMsVUFBSTtBQUNBLGNBQU0sV0FBVyxNQUFNLElBQUksUUFBUSxLQUFLLElBQUksSUFBSTtBQUNoRCxjQUFNLGFBQWEsT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUFBLFVBQU8sT0FDNUMsTUFBTSxpQkFBaUIsQ0FBQyxZQUFZLFNBQVMsQ0FBQztBQUFBLFFBQ2xEO0FBQ0EsWUFBSSxXQUFXLFNBQVMsR0FBRztBQUN2QixnQkFBTSxJQUFJLFFBQVEsS0FBSyxPQUFPLFVBQVU7QUFBQSxRQUM1QztBQUFBLE1BQ0osUUFBUTtBQUFBLE1BRVI7QUFFQSxjQUFRLElBQUksd0JBQXdCLFlBQVksTUFBTSxhQUFhLFNBQVMseUJBQXlCO0FBQUEsSUFDekcsU0FBUyxHQUFHO0FBQ1IsY0FBUSxNQUFNLG1DQUFtQyxDQUFDO0FBQUEsSUFFdEQ7QUFBQSxFQUNKO0FBZ05PLFdBQVMsbUJBQW1CO0FBQy9CLFFBQUksQ0FBQyxJQUFJLFFBQVEsS0FBTTtBQUN2QixRQUFJLFVBQVcsY0FBYSxTQUFTO0FBQ3JDLGdCQUFZLFdBQVcsTUFBTTtBQUN6QixrQkFBWTtBQUNaLGlCQUFXO0FBQUEsSUFDZixHQUFHLEdBQUk7QUFBQSxFQUNYO0FBTUEsaUJBQXNCLGdCQUFnQjtBQUNsQyxVQUFNLE9BQU8sTUFBTSxRQUFRLElBQUksRUFBRSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUM1RCxXQUFPLEtBQUssaUJBQWlCO0FBQUEsRUFDakM7OztBQ3hiQSxNQUFNQSxXQUFVLElBQUksUUFBUTtBQUM1QixNQUFNLGNBQWM7QUFFcEIsTUFBTSxnQkFBZ0I7QUFBQSxJQUNsQixNQUFNLENBQUM7QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULGdCQUFnQjtBQUFBLElBQ2hCLFlBQVk7QUFBQSxFQUNoQjtBQUVBLGlCQUFlLFdBQVc7QUFDdEIsVUFBTSxPQUFPLE1BQU1BLFNBQVEsSUFBSSxFQUFFLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQztBQUMvRCxXQUFPLEVBQUUsR0FBRyxlQUFlLEdBQUcsS0FBSyxXQUFXLEVBQUU7QUFBQSxFQUNwRDtBQUVBLGlCQUFlLFNBQVMsT0FBTztBQUMzQixVQUFNQSxTQUFRLElBQUksRUFBRSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFDMUMscUJBQWlCO0FBQUEsRUFDckI7QUFLQSxpQkFBc0IsaUJBQWlCO0FBQ25DLFdBQU8sU0FBUztBQUFBLEVBQ3BCO0FBa0JBLGlCQUFzQixXQUFXLElBQUksT0FBTyxRQUFRO0FBQ2hELFVBQU0sUUFBUSxNQUFNLFNBQVM7QUFDN0IsVUFBTSxNQUFNLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxHQUFJO0FBQ3hDLFVBQU0sV0FBVyxNQUFNLEtBQUssRUFBRTtBQUM5QixVQUFNLEtBQUssRUFBRSxJQUFJO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxXQUFXLFVBQVUsYUFBYTtBQUFBLE1BQ2xDLFdBQVc7QUFBQSxNQUNYLGNBQWMsVUFBVSxnQkFBZ0I7QUFBQSxJQUM1QztBQUNBLFVBQU0sU0FBUyxLQUFLO0FBQ3BCLFdBQU8sTUFBTSxLQUFLLEVBQUU7QUFBQSxFQUN4QjtBQUtBLGlCQUFzQixhQUFhLElBQUk7QUFDbkMsVUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixXQUFPLE1BQU0sS0FBSyxFQUFFO0FBQ3BCLFVBQU0sU0FBUyxLQUFLO0FBQUEsRUFDeEI7QUFNQSxpQkFBc0IsY0FBYztBQUNoQyxVQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLFdBQU8sT0FBTyxPQUFPLE1BQU0sSUFBSSxFQUFFO0FBQUEsTUFBSyxDQUFDLEdBQUcsTUFDdEMsRUFBRSxNQUFNLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxJQUM3RDtBQUFBLEVBQ0o7QUFLQSxpQkFBc0IsZUFBZSxTQUFTO0FBQzFDLFVBQU0sUUFBUSxNQUFNLFNBQVM7QUFDN0IsVUFBTSxjQUFjO0FBQ3BCLFVBQU0sU0FBUyxLQUFLO0FBQUEsRUFDeEI7QUFLQSxpQkFBc0JDLGlCQUFnQjtBQUNsQyxVQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLFdBQU8sTUFBTTtBQUFBLEVBQ2pCO0FBS0EsaUJBQXNCLHFCQUFxQixZQUFZLFVBQVUsTUFBTSxpQkFBaUIsTUFBTTtBQUMxRixVQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLFVBQU0sYUFBYTtBQUNuQixRQUFJLFlBQVksS0FBTSxPQUFNLFVBQVU7QUFDdEMsUUFBSSxtQkFBbUIsS0FBTSxPQUFNLGlCQUFpQjtBQUNwRCxVQUFNLFNBQVMsS0FBSztBQUFBLEVBQ3hCO0FBTUEsaUJBQXNCLGNBQWM7QUFDaEMsVUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixXQUFPLE1BQU07QUFBQSxFQUNqQjtBQU1BLGlCQUFzQixZQUFZLE1BQU07QUFDcEMsVUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixlQUFXLENBQUMsSUFBSSxHQUFHLEtBQUssT0FBTyxRQUFRLElBQUksR0FBRztBQUMxQyxZQUFNLEtBQUssRUFBRSxJQUFJO0FBQUEsSUFDckI7QUFDQSxVQUFNLFNBQVMsS0FBSztBQUFBLEVBQ3hCOzs7QUN0SUEsTUFBTSxRQUFRO0FBQUEsSUFDVixNQUFNLENBQUM7QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxJQUNWLFlBQVk7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLGtCQUFrQjtBQUFBLElBQ2xCLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLFdBQVcsRUFBRSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRTtBQUFBLEVBQ3JDO0FBRUEsV0FBUyxFQUFFLElBQUk7QUFBRSxXQUFPLFNBQVMsZUFBZSxFQUFFO0FBQUEsRUFBRztBQUVyRCxXQUFTLFlBQVk7QUFDakIsV0FBTyxNQUFNLFVBQVUsS0FBSyxTQUFTLEtBQUssTUFBTSxVQUFVLE1BQU0sU0FBUztBQUFBLEVBQzdFO0FBRUEsV0FBUyxhQUFhO0FBQ2xCLFdBQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxFQUFFO0FBQUEsTUFBSyxDQUFDLEdBQUcsTUFDNUIsRUFBRSxNQUFNLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxJQUM3RDtBQUFBLEVBQ0o7QUFFQSxXQUFTLFdBQVcsUUFBUTtBQUN4QixRQUFJLENBQUMsT0FBUSxRQUFPO0FBQ3BCLFFBQUksT0FBTyxVQUFVLEVBQUcsUUFBTyxTQUFTLE9BQU8sT0FBTyxNQUFNO0FBQzVELFdBQU8sT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsT0FBTyxDQUFDLElBQUksT0FBTyxNQUFNLEVBQUU7QUFBQSxFQUNwRTtBQUVBLFdBQVMsVUFBVSxLQUFLO0FBQ3BCLFVBQU0sUUFBUTtBQUNkLFdBQU87QUFDUCxlQUFXLE1BQU07QUFBRSxZQUFNLFFBQVE7QUFBSSxhQUFPO0FBQUEsSUFBRyxHQUFHLEdBQUk7QUFBQSxFQUMxRDtBQUVBLFdBQVMsZ0JBQWdCLFFBQVE7QUFDN0IsUUFBSSxXQUFXLE9BQVEsUUFBTztBQUM5QixRQUFJLFdBQVcsVUFBVyxRQUFPO0FBQ2pDLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxpQkFBaUI7QUFDdEIsUUFBSSxNQUFNLHFCQUFxQixVQUFXLFFBQU87QUFDakQsUUFBSSxNQUFNLHFCQUFxQixRQUFTLFFBQU8sTUFBTTtBQUNyRCxXQUFPLE1BQU0sY0FBYyxXQUFXO0FBQUEsRUFDMUM7QUFJQSxXQUFTLFNBQVM7QUFFZCxVQUFNLFVBQVUsRUFBRSxVQUFVO0FBQzVCLFVBQU0sV0FBVyxFQUFFLFdBQVc7QUFDOUIsVUFBTSxVQUFVLEVBQUUsVUFBVTtBQUM1QixVQUFNLGFBQWEsRUFBRSxhQUFhO0FBQ2xDLFVBQU0sV0FBVyxFQUFFLFdBQVc7QUFFOUIsUUFBSSxRQUFTLFNBQVEsWUFBWSxxQ0FBcUMsZ0JBQWdCLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0csUUFBSSxTQUFVLFVBQVMsY0FBYyxlQUFlO0FBQ3BELFFBQUksUUFBUyxTQUFRLFdBQVcsTUFBTSxxQkFBcUIsYUFBYSxDQUFDLFVBQVUsS0FBSyxDQUFDLE1BQU07QUFDL0YsUUFBSSxXQUFZLFlBQVcsVUFBVSxNQUFNO0FBQzNDLFFBQUksU0FBVSxVQUFTLGNBQWMsTUFBTSxLQUFLLFNBQVMsVUFBVSxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU07QUFHbkcsVUFBTSxvQkFBb0IsRUFBRSxxQkFBcUI7QUFDakQsVUFBTSxZQUFZLEVBQUUsU0FBUztBQUM3QixVQUFNLGVBQWUsRUFBRSxnQkFBZ0I7QUFFdkMsUUFBSSxrQkFBbUIsbUJBQWtCLE1BQU0sVUFBVSxNQUFNLEtBQUssU0FBUyxJQUFJLFVBQVU7QUFDM0YsUUFBSSxVQUFXLFdBQVUsTUFBTSxVQUFVLE1BQU0sS0FBSyxXQUFXLElBQUksVUFBVTtBQUU3RSxRQUFJLGNBQWM7QUFDZCxZQUFNLFNBQVMsV0FBVztBQUMxQixtQkFBYSxZQUFZLE9BQU8sSUFBSSxTQUFPO0FBQ3ZDLFlBQUksTUFBTSxjQUFjLElBQUksSUFBSTtBQUM1QixpQkFBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQU80QixJQUFJLEVBQUU7QUFBQSx5Q0FDaEIsV0FBVyxNQUFNLFNBQVMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvREFTaEIsSUFBSSxFQUFFO0FBQUEseUNBQ2pCLFdBQVcsTUFBTSxVQUFVLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFTekQ7QUFDQSxjQUFNLGdCQUFnQixNQUFNLGVBQWUsSUFBSSxLQUFLLFdBQVcsSUFBSSxNQUFNLElBQUksV0FBVyxXQUFXLElBQUksTUFBTSxDQUFDO0FBQzlHLGNBQU0sWUFBWSxNQUFNLGFBQWEsSUFBSSxLQUFLLFlBQVk7QUFDMUQsZUFBTztBQUFBO0FBQUE7QUFBQSw2R0FHMEYsSUFBSSxFQUFFLEtBQUssV0FBVyxJQUFJLEtBQUssQ0FBQztBQUFBO0FBQUE7QUFBQSxnR0FHN0MsSUFBSSxFQUFFLEtBQUssYUFBYTtBQUFBO0FBQUE7QUFBQSxnR0FHeEIsSUFBSSxFQUFFLEtBQUssU0FBUztBQUFBLCtGQUNyQixJQUFJLEVBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUk3RixDQUFDLEVBQUUsS0FBSyxFQUFFO0FBR1YsbUJBQWEsaUJBQWlCLDRCQUE0QixFQUFFLFFBQVEsUUFBTTtBQUN0RSxXQUFHLGlCQUFpQixTQUFTLE1BQU0sVUFBVSxHQUFHLFFBQVEsS0FBSyxDQUFDO0FBQUEsTUFDbEUsQ0FBQztBQUNELG1CQUFhLGlCQUFpQiwrQkFBK0IsRUFBRSxRQUFRLFFBQU07QUFDekUsV0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQy9CLGdCQUFNLGFBQWEsTUFBTSxlQUFlLEdBQUcsUUFBUSxRQUFRLE9BQU8sR0FBRyxRQUFRO0FBQzdFLGlCQUFPO0FBQUEsUUFDWCxDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQ0QsbUJBQWEsaUJBQWlCLDZCQUE2QixFQUFFLFFBQVEsUUFBTTtBQUN2RSxXQUFHLGlCQUFpQixTQUFTLE1BQU0sV0FBVyxHQUFHLFFBQVEsS0FBSyxDQUFDO0FBQUEsTUFDbkUsQ0FBQztBQUNELG1CQUFhLGlCQUFpQiw0QkFBNEIsRUFBRSxRQUFRLFFBQU07QUFDdEUsV0FBRyxpQkFBaUIsU0FBUyxNQUFNLFVBQVUsR0FBRyxRQUFRLEtBQUssQ0FBQztBQUFBLE1BQ2xFLENBQUM7QUFDRCxtQkFBYSxpQkFBaUIsMkJBQTJCLEVBQUUsUUFBUSxRQUFNO0FBQ3JFLFdBQUcsaUJBQWlCLFNBQVMsUUFBUTtBQUFBLE1BQ3pDLENBQUM7QUFDRCxtQkFBYSxpQkFBaUIsNkJBQTZCLEVBQUUsUUFBUSxRQUFNO0FBQ3ZFLFdBQUcsaUJBQWlCLFNBQVMsVUFBVTtBQUFBLE1BQzNDLENBQUM7QUFHRCxtQkFBYSxpQkFBaUIsbUJBQW1CLEVBQUUsUUFBUSxRQUFNO0FBQzdELFdBQUcsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQUUsZ0JBQU0sWUFBWSxFQUFFLE9BQU87QUFBQSxRQUFPLENBQUM7QUFDekUsV0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDaEMsY0FBSSxFQUFFLFFBQVEsUUFBUyxVQUFTO0FBQ2hDLGNBQUksRUFBRSxRQUFRLFNBQVUsWUFBVztBQUFBLFFBQ3ZDLENBQUM7QUFBQSxNQUNMLENBQUM7QUFDRCxtQkFBYSxpQkFBaUIsb0JBQW9CLEVBQUUsUUFBUSxRQUFNO0FBQzlELFdBQUcsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQUUsZ0JBQU0sYUFBYSxFQUFFLE9BQU87QUFBQSxRQUFPLENBQUM7QUFDMUUsV0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDaEMsY0FBSSxFQUFFLFFBQVEsUUFBUyxVQUFTO0FBQ2hDLGNBQUksRUFBRSxRQUFRLFNBQVUsWUFBVztBQUFBLFFBQ3ZDLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBR0EsVUFBTSxnQkFBZ0IsRUFBRSxXQUFXO0FBQ25DLFVBQU0saUJBQWlCLEVBQUUsWUFBWTtBQUNyQyxVQUFNLFlBQVksRUFBRSxhQUFhO0FBRWpDLFFBQUksaUJBQWlCLFNBQVMsa0JBQWtCLGNBQWUsZUFBYyxRQUFRLE1BQU07QUFDM0YsUUFBSSxrQkFBa0IsU0FBUyxrQkFBa0IsZUFBZ0IsZ0JBQWUsUUFBUSxNQUFNO0FBQzlGLFFBQUksV0FBVztBQUNYLGdCQUFVLFdBQVcsTUFBTSxVQUFVLE1BQU0sU0FBUyxLQUFLLEVBQUUsV0FBVyxLQUFLLE1BQU0sVUFBVSxLQUFLLEVBQUUsV0FBVztBQUM3RyxnQkFBVSxjQUFjLE1BQU0sU0FBUyxjQUFjO0FBQUEsSUFDekQ7QUFHQSxVQUFNLFFBQVEsRUFBRSxPQUFPO0FBQ3ZCLFFBQUksT0FBTztBQUNQLFlBQU0sY0FBYyxNQUFNO0FBQzFCLFlBQU0sTUFBTSxVQUFVLE1BQU0sUUFBUSxVQUFVO0FBQUEsSUFDbEQ7QUFBQSxFQUNKO0FBRUEsV0FBUyxXQUFXLEtBQUs7QUFDckIsVUFBTSxNQUFNLFNBQVMsY0FBYyxLQUFLO0FBQ3hDLFFBQUksY0FBYztBQUNsQixXQUFPLElBQUk7QUFBQSxFQUNmO0FBRUEsV0FBUyxXQUFXLEtBQUs7QUFDckIsV0FBTyxJQUFJLFFBQVEsTUFBTSxPQUFPLEVBQUUsUUFBUSxNQUFNLFFBQVEsRUFBRSxRQUFRLE1BQU0sTUFBTSxFQUFFLFFBQVEsTUFBTSxNQUFNO0FBQUEsRUFDeEc7QUFJQSxpQkFBZSxTQUFTO0FBQ3BCLFVBQU0sUUFBUSxNQUFNLFNBQVMsS0FBSztBQUNsQyxVQUFNLFNBQVMsTUFBTSxVQUFVLEtBQUs7QUFDcEMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFRO0FBRXZCLFVBQU0sU0FBUztBQUNmLFdBQU87QUFFUCxVQUFNLEtBQUssT0FBTyxXQUFXO0FBQzdCLFVBQU0sV0FBVyxJQUFJLE9BQU8sTUFBTTtBQUNsQyxVQUFNLE9BQU8sTUFBTSxZQUFZO0FBQy9CLFVBQU0sV0FBVztBQUNqQixVQUFNLFlBQVk7QUFFbEIsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sZUFBZTtBQUFBLElBQ3pCO0FBRUEsVUFBTSxTQUFTO0FBQ2YsY0FBVSxXQUFXO0FBQUEsRUFDekI7QUFFQSxXQUFTLFVBQVUsSUFBSTtBQUNuQixVQUFNLE1BQU0sTUFBTSxLQUFLLEtBQUssT0FBSyxFQUFFLE9BQU8sRUFBRTtBQUM1QyxRQUFJLENBQUMsSUFBSztBQUNWLFVBQU0sWUFBWSxJQUFJO0FBQ3RCLFVBQU0sWUFBWSxJQUFJO0FBQ3RCLFVBQU0sYUFBYSxJQUFJO0FBQ3ZCLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsV0FBVztBQUN0QixRQUFJLENBQUMsTUFBTSxVQUFXO0FBQ3RCLFVBQU0sUUFBUSxNQUFNLFVBQVUsS0FBSztBQUNuQyxVQUFNLFNBQVMsTUFBTSxXQUFXLEtBQUs7QUFDckMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFRO0FBRXZCLFVBQU0sV0FBVyxNQUFNLFdBQVcsT0FBTyxNQUFNO0FBQy9DLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFDL0IsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sWUFBWTtBQUNsQixVQUFNLGFBQWE7QUFFbkIsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sZUFBZTtBQUFBLElBQ3pCO0FBRUEsY0FBVSxhQUFhO0FBQUEsRUFDM0I7QUFFQSxXQUFTLGFBQWE7QUFDbEIsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sWUFBWTtBQUNsQixVQUFNLGFBQWE7QUFDbkIsV0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBZSxVQUFVLElBQUk7QUFDekIsVUFBTSxNQUFNLE1BQU0sS0FBSyxLQUFLLE9BQUssRUFBRSxPQUFPLEVBQUU7QUFDNUMsUUFBSSxDQUFDLElBQUs7QUFDVixRQUFJLENBQUMsUUFBUSxXQUFXLElBQUksS0FBSyxJQUFJLEVBQUc7QUFFeEMsVUFBTSxhQUFhLEVBQUU7QUFDckIsVUFBTSxPQUFPLE1BQU0sWUFBWTtBQUUvQixRQUFJLE1BQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsWUFBTSxlQUFlO0FBQUEsSUFDekI7QUFFQSxjQUFVLGFBQWE7QUFBQSxFQUMzQjtBQUlBLGlCQUFlLFdBQVcsSUFBSTtBQUMxQixVQUFNLE1BQU0sTUFBTSxLQUFLLEtBQUssT0FBSyxFQUFFLE9BQU8sRUFBRTtBQUM1QyxRQUFJLENBQUMsSUFBSztBQUNWLFVBQU0sVUFBVSxVQUFVLFVBQVUsSUFBSSxNQUFNO0FBQzlDLFVBQU0sV0FBVztBQUNqQixXQUFPO0FBQ1AsZUFBVyxNQUFNO0FBQUUsWUFBTSxXQUFXO0FBQU0sYUFBTztBQUFBLElBQUcsR0FBRyxHQUFJO0FBQzNELGVBQVcsTUFBTTtBQUNiLGdCQUFVLFVBQVUsVUFBVSxFQUFFLEVBQUUsTUFBTSxNQUFNO0FBQUEsTUFBQyxDQUFDO0FBQUEsSUFDcEQsR0FBRyxHQUFLO0FBQUEsRUFDWjtBQUlBLGlCQUFlLGlCQUFpQjtBQUM1QixRQUFJO0FBQ0EsWUFBTSxRQUFRLE1BQU0sZUFBZTtBQUNuQyxZQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWTtBQUFBLFFBQ3pDLE1BQU07QUFBQSxRQUNOLFNBQVMsRUFBRSxNQUFNLE1BQU0sS0FBSztBQUFBLE1BQ2hDLENBQUM7QUFDRCxVQUFJLE9BQU8sU0FBUztBQUNoQixjQUFNLHFCQUFxQixVQUFVLE9BQU8sU0FBUyxPQUFPLFNBQVM7QUFBQSxNQUN6RTtBQUNBLGFBQU87QUFBQSxJQUNYLFNBQVMsR0FBRztBQUNSLFlBQU0scUJBQXFCLFlBQVk7QUFDdkMsYUFBTyxFQUFFLFNBQVMsT0FBTyxPQUFPLEVBQUUsUUFBUTtBQUFBLElBQzlDO0FBQUEsRUFDSjtBQUVBLGlCQUFlLFVBQVU7QUFDckIsVUFBTSxtQkFBbUI7QUFDekIsVUFBTSxZQUFZO0FBQ2xCLFdBQU87QUFFUCxRQUFJO0FBQ0EsWUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXRFLFVBQUksQ0FBQyxPQUFPLFNBQVM7QUFDakIsY0FBTSxtQkFBbUI7QUFDekIsY0FBTSxZQUFZLE9BQU8sU0FBUztBQUNsQyxlQUFPO0FBQ1A7QUFBQSxNQUNKO0FBRUEsVUFBSSxPQUFPLE1BQU07QUFDYixjQUFNLFFBQVEsTUFBTSxlQUFlO0FBQ25DLGNBQU0sWUFBWSxNQUFNO0FBQ3hCLGNBQU0sYUFBYSxPQUFPLEtBQUssU0FBUyxFQUFFO0FBRTFDLFlBQUksZUFBZSxHQUFHO0FBQ2xCLGdCQUFNLFlBQVksT0FBTyxJQUFJO0FBQUEsUUFDakMsV0FBVyxDQUFDLE1BQU0sa0JBQWtCLE9BQU8sWUFBWSxNQUFNLGdCQUFnQjtBQUN6RSxnQkFBTSxZQUFZLE9BQU8sSUFBSTtBQUFBLFFBQ2pDO0FBRUEsY0FBTSxxQkFBcUIsVUFBVSxPQUFPLFNBQVMsT0FBTyxTQUFTO0FBQ3JFLGNBQU0sT0FBTyxNQUFNLFlBQVk7QUFBQSxNQUNuQztBQUVBLFlBQU0sbUJBQW1CO0FBQUEsSUFDN0IsU0FBUyxHQUFHO0FBQ1IsWUFBTSxtQkFBbUI7QUFDekIsWUFBTSxZQUFZLEVBQUUsV0FBVztBQUFBLElBQ25DO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBZSxhQUFhO0FBQ3hCLFVBQU0sZUFBZSxNQUFNLFdBQVc7QUFDdEMsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sUUFBUTtBQUFBLElBQ2xCO0FBQUEsRUFDSjtBQUlBLGlCQUFlLGFBQWE7QUFDeEIsVUFBTSxPQUFPLE1BQU0sWUFBWTtBQUMvQixVQUFNLFlBQVksS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDO0FBRTlDLFVBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsTUFDekMsTUFBTTtBQUFBLE1BQ04sU0FBUyxFQUFFLFVBQVU7QUFBQSxJQUN6QixDQUFDO0FBRUQsUUFBSSxDQUFDLE9BQU8sU0FBUztBQUNqQixnQkFBVSxxQkFBcUIsT0FBTyxTQUFTLFVBQVU7QUFDekQ7QUFBQSxJQUNKO0FBRUEsVUFBTSxPQUFPLElBQUk7QUFBQSxNQUNiLENBQUMsS0FBSyxVQUFVLEVBQUUsV0FBVyxNQUFNLE1BQU0sT0FBTyxXQUFXLENBQUMsQ0FBQztBQUFBLE1BQzdELEVBQUUsTUFBTSxtQkFBbUI7QUFBQSxJQUMvQjtBQUNBLFVBQU0sTUFBTSxJQUFJLGdCQUFnQixJQUFJO0FBQ3BDLFVBQU0sSUFBSSxTQUFTLGNBQWMsR0FBRztBQUNwQyxNQUFFLE9BQU87QUFDVCxNQUFFLFdBQVc7QUFDYixNQUFFLE1BQU07QUFDUixRQUFJLGdCQUFnQixHQUFHO0FBQ3ZCLGNBQVUsVUFBVTtBQUFBLEVBQ3hCO0FBRUEsaUJBQWUsV0FBVyxPQUFPO0FBQzdCLFVBQU0sT0FBTyxNQUFNLE9BQU8sUUFBUSxDQUFDO0FBQ25DLFFBQUksQ0FBQyxLQUFNO0FBRVgsUUFBSTtBQUNBLFlBQU0sT0FBTyxNQUFNLEtBQUssS0FBSztBQUM3QixZQUFNLFNBQVMsS0FBSyxNQUFNLElBQUk7QUFFOUIsVUFBSTtBQUNKLFVBQUksT0FBTyxhQUFhLE9BQU8sTUFBTTtBQUNqQyxjQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWTtBQUFBLFVBQ3pDLE1BQU07QUFBQSxVQUNOLFNBQVMsRUFBRSxZQUFZLE9BQU8sS0FBSztBQUFBLFFBQ3ZDLENBQUM7QUFDRCxZQUFJLENBQUMsT0FBTyxTQUFTO0FBQ2pCLG9CQUFVLHNCQUFzQixPQUFPLFNBQVMsVUFBVTtBQUMxRDtBQUFBLFFBQ0o7QUFDQSxlQUFPLEtBQUssTUFBTSxPQUFPLFNBQVM7QUFBQSxNQUN0QyxPQUFPO0FBQ0gsZUFBTztBQUFBLE1BQ1g7QUFFQSxZQUFNLFlBQVksSUFBSTtBQUN0QixZQUFNLE9BQU8sTUFBTSxZQUFZO0FBRS9CLFVBQUksTUFBTSxlQUFlLFVBQVUsR0FBRztBQUNsQyxjQUFNLGVBQWU7QUFBQSxNQUN6QjtBQUVBLGdCQUFVLGNBQWMsT0FBTyxLQUFLLElBQUksRUFBRSxTQUFTLE9BQU87QUFBQSxJQUM5RCxTQUFTLEdBQUc7QUFDUixnQkFBVSxvQkFBb0IsRUFBRSxPQUFPO0FBQUEsSUFDM0M7QUFFQSxVQUFNLE9BQU8sUUFBUTtBQUFBLEVBQ3pCO0FBSUEsV0FBUyxhQUFhO0FBQ2xCLE1BQUUsVUFBVSxHQUFHLGlCQUFpQixTQUFTLE9BQU87QUFDaEQsTUFBRSxhQUFhLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNsRCxNQUFFLFlBQVksR0FBRyxpQkFBaUIsU0FBUyxVQUFVO0FBQ3JELE1BQUUsYUFBYSxHQUFHLGlCQUFpQixVQUFVLFVBQVU7QUFDdkQsTUFBRSxXQUFXLEdBQUcsaUJBQWlCLFNBQVMsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUU5RCxNQUFFLGFBQWEsR0FBRyxpQkFBaUIsVUFBVSxDQUFDLE1BQU07QUFDaEQsWUFBTSxjQUFjLEVBQUUsT0FBTztBQUM3QixpQkFBVztBQUFBLElBQ2YsQ0FBQztBQUVELE1BQUUsV0FBVyxHQUFHLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUM3QyxZQUFNLFdBQVcsRUFBRSxPQUFPO0FBQzFCLGFBQU87QUFBQSxJQUNYLENBQUM7QUFFRCxNQUFFLFlBQVksR0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDOUMsWUFBTSxZQUFZLEVBQUUsT0FBTztBQUMzQixhQUFPO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDTDtBQUVBLGlCQUFlLE9BQU87QUFFbEIsVUFBTSxjQUFjLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN6RSxVQUFNLE9BQU8sRUFBRSxtQkFBbUI7QUFDbEMsVUFBTSxPQUFPLEVBQUUsb0JBQW9CO0FBRW5DLFFBQUksQ0FBQyxhQUFhO0FBQ2QsVUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBQy9CLFVBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUMvQixRQUFFLG1CQUFtQixHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDcEQsY0FBTSxNQUFNLElBQUksUUFBUSxPQUFPLHdCQUF3QjtBQUN2RCxlQUFPLEtBQUssS0FBSyxrQkFBa0I7QUFBQSxNQUN2QyxDQUFDO0FBQ0Q7QUFBQSxJQUNKO0FBRUEsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBQy9CLFFBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUUvQixVQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEUsVUFBTSxZQUFZLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRTtBQUNsRCxVQUFNLGNBQWMsTUFBTUMsZUFBYztBQUN4QyxVQUFNLE9BQU8sTUFBTSxZQUFZO0FBRS9CLGVBQVc7QUFDWCxXQUFPO0FBRVAsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sUUFBUTtBQUFBLElBQ2xCO0FBQUEsRUFDSjtBQUVBLFdBQVMsaUJBQWlCLG9CQUFvQixJQUFJOyIsCiAgIm5hbWVzIjogWyJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiaXNTeW5jRW5hYmxlZCJdCn0K
