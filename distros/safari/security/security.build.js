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

  // src/security/security.js
  var state = {
    isLocked: false,
    hasPassword: false,
    // Unlock
    unlockError: "",
    // Set password
    newPassword: "",
    confirmPassword: "",
    securityError: "",
    // Change password
    currentPassword: "",
    newPasswordChange: "",
    confirmPasswordChange: "",
    changeError: "",
    // Remove password
    removePasswordInput: "",
    removeError: "",
    // Shared page-level success
    pageSuccess: "",
    // Auto-lock
    autoLockMinutes: 15,
    autolockSuccess: "",
    // Trust ladder (L0→L3 level-meter)
    profileName: "",
    profileNpub: "",
    isBunkerProfile: false,
    bunkerActive: false,
    lastBackupAt: null,
    backupError: ""
  };
  function $(id) {
    return document.getElementById(id);
  }
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
  function trustAchievements() {
    return {
      l1: !!state.lastBackupAt,
      l2: state.hasPassword && state.autoLockMinutes > 0,
      l3: state.bunkerActive || state.isBunkerProfile
    };
  }
  function trustLevel() {
    const a = trustAchievements();
    if (a.l3) return 3;
    if (a.l2) return 2;
    if (a.l1) return 1;
    return 0;
  }
  function renderRung(n, achieved, level) {
    const rung = $(`rung-l${n}`);
    const led = $(`rung-l${n}-led`);
    const stateEl = $(`rung-l${n}-state`);
    if (rung) rung.dataset.achieved = achieved ? "true" : "false";
    if (led) {
      led.className = achieved ? "led led--green" : n < level ? "led led--amber" : "led led--off";
    }
    if (stateEl) stateEl.textContent = achieved ? "OK" : "\u2014";
  }
  function renderTrust() {
    const a = trustAchievements();
    const level = trustLevel();
    const meter = $("trust-meter");
    if (meter) {
      meter.dataset.level = String(level);
      meter.setAttribute("aria-label", `Security level ${level} of 3`);
    }
    const readout = $("trust-level-readout");
    if (readout) readout.textContent = `L${level}`;
    renderRung(1, a.l1, level);
    renderRung(2, a.l2, level);
    renderRung(3, a.l3, level);
    const backupBtn = $("backup-export-btn");
    const l1Hint = $("rung-l1-hint");
    if (backupBtn) backupBtn.style.display = state.hasPassword ? "inline-flex" : "none";
    if (l1Hint) {
      l1Hint.textContent = state.hasPassword ? "Level up: download an encrypted backup of your vault and store it somewhere safe." : "Level up: set a master password first, then download an encrypted backup here \u2014 or export your key from the NostrKey panel and store it safely.";
    }
    const backupErr = $("backup-error");
    if (backupErr) {
      backupErr.textContent = state.backupError;
      backupErr.style.display = state.backupError ? "block" : "none";
    }
    const l2Action = $("rung-l2-action");
    if (l2Action) {
      l2Action.textContent = state.hasPassword && state.autoLockMinutes === 0 ? "Level up: auto-lock is set to Never \u2014 pick an interval below to reach L2." : "Level up: set a master password below, then pick an auto-lock interval.";
    }
    const nameText = $("strip-name-text");
    if (nameText) nameText.textContent = state.profileName || "Profile";
    const npubEl = $("strip-npub");
    if (npubEl) npubEl.textContent = state.profileNpub || "no key on this profile";
    const stripLed = $("strip-led");
    if (stripLed) {
      stripLed.className = state.hasPassword ? "led led--green" : "led led--amber";
    }
    const pwLed = $("password-led");
    if (pwLed) pwLed.className = state.hasPassword ? "led led--green" : "led led--off";
    const alLed = $("autolock-led");
    if (alLed) {
      alLed.className = state.hasPassword && state.autoLockMinutes > 0 ? "led led--green" : "led led--off";
    }
  }
  function showPageSuccess(msg) {
    state.pageSuccess = msg;
    render();
    setTimeout(() => {
      state.pageSuccess = "";
      render();
    }, 5e3);
  }
  function render() {
    const lockedView = $("locked-view");
    const unlockedView = $("unlocked-view");
    if (lockedView) lockedView.style.display = state.isLocked ? "block" : "none";
    if (unlockedView) unlockedView.style.display = state.isLocked ? "none" : "block";
    const unlockErr = $("unlock-error");
    if (unlockErr) {
      unlockErr.textContent = state.unlockError;
      unlockErr.style.display = state.unlockError ? "block" : "none";
    }
    const pageSuc = $("page-success");
    if (pageSuc) {
      pageSuc.textContent = state.pageSuccess;
      pageSuc.style.display = state.pageSuccess ? "block" : "none";
    }
    const securityStatus = $("security-status");
    if (securityStatus) {
      securityStatus.textContent = state.hasPassword ? "Master password is active \u2014 keys are encrypted at rest." : "No master password set \u2014 keys are stored unencrypted.";
    }
    const setSection = $("set-password-section");
    const changeSection = $("change-password-section");
    if (setSection) setSection.style.display = state.hasPassword ? "none" : "block";
    if (changeSection) changeSection.style.display = state.hasPassword ? "block" : "none";
    const strengthEl = $("password-strength");
    if (strengthEl) {
      if (state.newPassword) {
        const strength = calculatePasswordStrength(state.newPassword);
        const labels = ["", "Too short", "Weak", "Fair", "Strong", "Very strong"];
        strengthEl.textContent = labels[strength] || "";
        strengthEl.className = `field-hint strength-${strength}`;
        strengthEl.style.display = "block";
      } else {
        strengthEl.style.display = "none";
      }
    }
    const setBtn = $("set-password-btn");
    if (setBtn) {
      setBtn.disabled = !(state.newPassword.length >= 8 && state.newPassword === state.confirmPassword);
    }
    const changeBtn = $("change-password-btn");
    if (changeBtn) {
      changeBtn.disabled = !(state.currentPassword.length > 0 && state.newPasswordChange.length >= 8 && state.newPasswordChange === state.confirmPasswordChange);
    }
    const removeBtn = $("remove-password-btn");
    if (removeBtn) {
      removeBtn.disabled = !state.removePasswordInput;
    }
    const secErr = $("security-error");
    if (secErr) {
      secErr.textContent = state.securityError;
      secErr.style.display = state.securityError ? "block" : "none";
    }
    const chgErr = $("change-error");
    if (chgErr) {
      chgErr.textContent = state.changeError;
      chgErr.style.display = state.changeError ? "block" : "none";
    }
    const rmErr = $("remove-error");
    if (rmErr) {
      rmErr.textContent = state.removeError;
      rmErr.style.display = state.removeError ? "block" : "none";
    }
    const encryptionStatus = $("encryption-status");
    if (encryptionStatus) encryptionStatus.style.display = state.hasPassword ? "flex" : "none";
    const autolockDisabled = $("autolock-disabled-msg");
    const autolockControls = $("autolock-controls");
    if (autolockDisabled) autolockDisabled.style.display = state.hasPassword ? "none" : "block";
    if (autolockControls) autolockControls.style.display = state.hasPassword ? "block" : "none";
    const autolockSelect = $("autolock-select");
    if (autolockSelect) autolockSelect.value = String(state.autoLockMinutes);
    const autolockSuccess = $("autolock-success");
    if (autolockSuccess) {
      autolockSuccess.textContent = state.autolockSuccess;
      autolockSuccess.style.display = state.autolockSuccess ? "block" : "none";
    }
    renderTrust();
  }
  async function handleUnlock() {
    const pw = $("unlock-password")?.value;
    if (!pw) {
      state.unlockError = "Please enter your master password.";
      render();
      return;
    }
    try {
      const result = await api.runtime.sendMessage({ kind: "unlock", payload: pw });
      if (result && result.success) {
        state.isLocked = false;
        state.unlockError = "";
        if ($("unlock-password")) $("unlock-password").value = "";
        render();
      } else {
        state.unlockError = result && result.error || "Invalid password.";
        render();
      }
    } catch (e) {
      state.unlockError = e.message || "Failed to unlock.";
      render();
    }
  }
  async function handleSetPassword() {
    state.securityError = "";
    if (state.newPassword.length < 8) {
      state.securityError = "Password must be at least 8 characters.";
      render();
      return;
    }
    if (state.newPassword !== state.confirmPassword) {
      state.securityError = "Passwords do not match.";
      render();
      return;
    }
    try {
      const result = await api.runtime.sendMessage({
        kind: "setPassword",
        payload: state.newPassword
      });
      if (result && result.success) {
        state.hasPassword = true;
        state.newPassword = "";
        state.confirmPassword = "";
        const mp = document.getElementById("master-password");
        if (mp && mp.open) mp.open = false;
        showPageSuccess("Master password set. Your keys are now encrypted at rest.");
      } else {
        state.securityError = result && result.error || "Failed to set password.";
        render();
      }
    } catch (e) {
      state.securityError = e.message || "Failed to set password.";
      render();
    }
  }
  async function handleChangePassword() {
    state.changeError = "";
    if (!state.currentPassword) {
      state.changeError = "Please enter your current password.";
      render();
      return;
    }
    if (state.newPasswordChange.length < 8) {
      state.changeError = "New password must be at least 8 characters.";
      render();
      return;
    }
    if (state.newPasswordChange !== state.confirmPasswordChange) {
      state.changeError = "New passwords do not match.";
      render();
      return;
    }
    try {
      const result = await api.runtime.sendMessage({
        kind: "changePassword",
        payload: {
          oldPassword: state.currentPassword,
          newPassword: state.newPasswordChange
        }
      });
      if (result && result.success) {
        state.currentPassword = "";
        state.newPasswordChange = "";
        state.confirmPasswordChange = "";
        showPageSuccess("Master password changed successfully.");
      } else {
        state.changeError = result && result.error || "Failed to change password.";
        render();
      }
    } catch (e) {
      state.changeError = e.message || "Failed to change password.";
      render();
    }
  }
  async function handleRemovePassword() {
    state.removeError = "";
    if (!state.removePasswordInput) {
      state.removeError = "Please enter your current password.";
      render();
      return;
    }
    if (!confirm("This will remove encryption from your private keys. They will be stored as plaintext. Are you sure?")) {
      return;
    }
    try {
      const result = await api.runtime.sendMessage({
        kind: "removePassword",
        payload: state.removePasswordInput
      });
      if (result && result.success) {
        state.hasPassword = false;
        state.removePasswordInput = "";
        showPageSuccess("Master password removed. Keys are now stored unencrypted.");
      } else {
        state.removeError = result && result.error || "Failed to remove password.";
        render();
      }
    } catch (e) {
      state.removeError = e.message || "Failed to remove password.";
      render();
    }
  }
  async function handleDeleteVault() {
    try {
      const result = await api.runtime.sendMessage({ kind: "resetAllData" });
      if (result && result.success) {
        state.hasPassword = false;
        state.isLocked = false;
        state.lastBackupAt = null;
        state.isBunkerProfile = false;
        state.bunkerActive = false;
        render();
        showPageSuccess("Vault deleted. You can now set up a new master password.");
      } else {
        alert("Failed to delete vault: " + (result?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to delete vault: " + e.message);
    }
  }
  async function handleBackupExport() {
    state.backupError = "";
    try {
      const result = await api.runtime.sendMessage({ kind: "backup.export" });
      if (!result || !result.success) {
        state.backupError = result && result.error || "Backup export failed.";
        render();
        return;
      }
      const json = JSON.stringify(result.envelope, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      a.download = `nostrkey-backup-${date}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e4);
      state.lastBackupAt = Date.now();
      try {
        await api.storage.set({ lastBackupAt: state.lastBackupAt });
      } catch {
      }
      showPageSuccess("Encrypted backup downloaded. Store it somewhere safe \u2014 it needs your master password to restore.");
    } catch (e) {
      state.backupError = e.message || "Backup export failed.";
      render();
    }
  }
  async function handleAutoLockChange() {
    const select = $("autolock-select");
    if (!select) return;
    const minutes = parseInt(select.value, 10);
    state.autoLockMinutes = minutes;
    await api.runtime.sendMessage({
      kind: "setAutoLockTimeout",
      payload: minutes
    });
    const label = minutes === 0 ? "disabled" : minutes === 60 ? "1 hour" : minutes === 180 ? "3 hours" : `${minutes} minutes`;
    state.autolockSuccess = minutes === 0 ? "Auto-lock disabled." : `Auto-lock set to ${label}.`;
    render();
    setTimeout(() => {
      state.autolockSuccess = "";
      render();
    }, 3e3);
  }
  function bindEvents() {
    $("close-btn")?.addEventListener("click", () => window.close());
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (e) => e.preventDefault());
    });
    $("unlock-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUnlock();
    });
    $("new-password")?.addEventListener("input", (e) => {
      state.newPassword = e.target.value;
      render();
    });
    $("confirm-password")?.addEventListener("input", (e) => {
      state.confirmPassword = e.target.value;
      render();
    });
    $("set-password-btn")?.addEventListener("click", handleSetPassword);
    $("current-password")?.addEventListener("input", (e) => {
      state.currentPassword = e.target.value;
      render();
    });
    $("new-password-change")?.addEventListener("input", (e) => {
      state.newPasswordChange = e.target.value;
      render();
    });
    $("confirm-password-change")?.addEventListener("input", (e) => {
      state.confirmPasswordChange = e.target.value;
      render();
    });
    $("change-password-btn")?.addEventListener("click", handleChangePassword);
    $("remove-password")?.addEventListener("input", (e) => {
      state.removePasswordInput = e.target.value;
      render();
    });
    $("remove-password-btn")?.addEventListener("click", handleRemovePassword);
    $("autolock-select")?.addEventListener("change", handleAutoLockChange);
    $("backup-export-btn")?.addEventListener("click", handleBackupExport);
    $("show-delete-confirm-btn")?.addEventListener("click", () => {
      $("delete-confirm-dialog")?.classList.remove("hidden");
      $("show-delete-confirm-btn").style.display = "none";
    });
    $("cancel-delete-btn")?.addEventListener("click", () => {
      $("delete-confirm-dialog")?.classList.add("hidden");
      $("show-delete-confirm-btn").style.display = "";
    });
    $("confirm-delete-btn")?.addEventListener("click", handleDeleteVault);
  }
  async function init() {
    state.hasPassword = !!await api.runtime.sendMessage({ kind: "isEncrypted" });
    state.isLocked = !!await api.runtime.sendMessage({ kind: "isLocked" });
    state.autoLockMinutes = await api.runtime.sendMessage({ kind: "getAutoLockTimeout" }) ?? 15;
    try {
      const info = await api.runtime.sendMessage({ kind: "getActiveProfileInfo" });
      if (info) {
        state.profileName = info.name || "";
        state.profileNpub = info.npub || "";
        state.isBunkerProfile = !!info.isBunker;
      }
    } catch {
    }
    try {
      const bunker = await api.runtime.sendMessage({ kind: "bunkerServer.status" });
      state.bunkerActive = !!(bunker && bunker.active);
    } catch {
    }
    try {
      const stored = await api.storage.get({ lastBackupAt: null });
      state.lastBackupAt = stored?.lastBackupAt || null;
    } catch {
    }
    bindEvents();
    render();
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const target = document.getElementById(hash);
      if (target && target.tagName === "DETAILS") {
        target.open = true;
      }
    } else {
      const mp = document.getElementById("master-password");
      if (mp) mp.open = true;
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9zZWN1cml0eS9zZWN1cml0eS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgIGhhc1Bhc3N3b3JkOiBmYWxzZSxcbiAgICAvLyBVbmxvY2tcbiAgICB1bmxvY2tFcnJvcjogJycsXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgbmV3UGFzc3dvcmQ6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZDogJycsXG4gICAgc2VjdXJpdHlFcnJvcjogJycsXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkXG4gICAgY3VycmVudFBhc3N3b3JkOiAnJyxcbiAgICBuZXdQYXNzd29yZENoYW5nZTogJycsXG4gICAgY29uZmlybVBhc3N3b3JkQ2hhbmdlOiAnJyxcbiAgICBjaGFuZ2VFcnJvcjogJycsXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgcmVtb3ZlUGFzc3dvcmRJbnB1dDogJycsXG4gICAgcmVtb3ZlRXJyb3I6ICcnLFxuICAgIC8vIFNoYXJlZCBwYWdlLWxldmVsIHN1Y2Nlc3NcbiAgICBwYWdlU3VjY2VzczogJycsXG4gICAgLy8gQXV0by1sb2NrXG4gICAgYXV0b0xvY2tNaW51dGVzOiAxNSxcbiAgICBhdXRvbG9ja1N1Y2Nlc3M6ICcnLFxuICAgIC8vIFRydXN0IGxhZGRlciAoTDBcdTIxOTJMMyBsZXZlbC1tZXRlcilcbiAgICBwcm9maWxlTmFtZTogJycsXG4gICAgcHJvZmlsZU5wdWI6ICcnLFxuICAgIGlzQnVua2VyUHJvZmlsZTogZmFsc2UsXG4gICAgYnVua2VyQWN0aXZlOiBmYWxzZSxcbiAgICBsYXN0QmFja3VwQXQ6IG51bGwsXG4gICAgYmFja3VwRXJyb3I6ICcnLFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgocHcpIHtcbiAgICBpZiAocHcubGVuZ3RoID09PSAwKSByZXR1cm4gMDtcbiAgICBpZiAocHcubGVuZ3RoIDwgOCkgcmV0dXJuIDE7XG4gICAgbGV0IHNjb3JlID0gMjtcbiAgICBpZiAocHcubGVuZ3RoID49IDEyKSBzY29yZSsrO1xuICAgIGlmICgvW0EtWl0vLnRlc3QocHcpICYmIC9bYS16XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgaWYgKC9cXGQvLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvW15BLVphLXowLTldLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICByZXR1cm4gTWF0aC5taW4oc2NvcmUsIDUpO1xufVxuXG4vLyAtLS0gVHJ1c3QgbGFkZGVyIChMMCB3b3JraW5nIGtleSBcdTAwQjcgTDEgYmFja2VkIHVwIFx1MDBCNyBMMiBlbmNyeXB0ZWQrYXV0by1sb2NrIFx1MDBCN1xuLy8gTDMgcmVtb3RlIHNpZ25lcikuIFRoZSBtZXRlciBzaG93cyB0aGUgSElHSEVTVCBhY2hpZXZlZCBsZXZlbDsgc2tpcHBlZFxuLy8gbG93ZXIgcnVuZ3Mgc3RheSBhbWJlciBzbyB0aGUgZ2FwIGlzIHZpc2libGUgYW5kIGFjdGlvbmFibGUuXG5mdW5jdGlvbiB0cnVzdEFjaGlldmVtZW50cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsMTogISFzdGF0ZS5sYXN0QmFja3VwQXQsXG4gICAgICAgIGwyOiBzdGF0ZS5oYXNQYXNzd29yZCAmJiBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPiAwLFxuICAgICAgICBsMzogc3RhdGUuYnVua2VyQWN0aXZlIHx8IHN0YXRlLmlzQnVua2VyUHJvZmlsZSxcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB0cnVzdExldmVsKCkge1xuICAgIGNvbnN0IGEgPSB0cnVzdEFjaGlldmVtZW50cygpO1xuICAgIGlmIChhLmwzKSByZXR1cm4gMztcbiAgICBpZiAoYS5sMikgcmV0dXJuIDI7XG4gICAgaWYgKGEubDEpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSdW5nKG4sIGFjaGlldmVkLCBsZXZlbCkge1xuICAgIGNvbnN0IHJ1bmcgPSAkKGBydW5nLWwke259YCk7XG4gICAgY29uc3QgbGVkID0gJChgcnVuZy1sJHtufS1sZWRgKTtcbiAgICBjb25zdCBzdGF0ZUVsID0gJChgcnVuZy1sJHtufS1zdGF0ZWApO1xuICAgIGlmIChydW5nKSBydW5nLmRhdGFzZXQuYWNoaWV2ZWQgPSBhY2hpZXZlZCA/ICd0cnVlJyA6ICdmYWxzZSc7XG4gICAgaWYgKGxlZCkge1xuICAgICAgICAvLyBhY2hpZXZlZCA9IGdyZWVuIExFRCBcdTAwQjcgc2tpcHBlZCAoYmVsb3cgY3VycmVudCBsZXZlbCkgPSBhbWJlciBcdTAwQjcgbm90XG4gICAgICAgIC8vIHlldCByZWFjaGVkID0gb2ZmLiBHcmVlbiBpcyBhIHN0YXR1cyBMRUQgb25seSwgcGVyIGRlc2lnbiBzeXN0ZW0uXG4gICAgICAgIGxlZC5jbGFzc05hbWUgPSBhY2hpZXZlZFxuICAgICAgICAgICAgPyAnbGVkIGxlZC0tZ3JlZW4nXG4gICAgICAgICAgICA6IChuIDwgbGV2ZWwgPyAnbGVkIGxlZC0tYW1iZXInIDogJ2xlZCBsZWQtLW9mZicpO1xuICAgIH1cbiAgICBpZiAoc3RhdGVFbCkgc3RhdGVFbC50ZXh0Q29udGVudCA9IGFjaGlldmVkID8gJ09LJyA6ICdcdTIwMTQnO1xufVxuXG5mdW5jdGlvbiByZW5kZXJUcnVzdCgpIHtcbiAgICBjb25zdCBhID0gdHJ1c3RBY2hpZXZlbWVudHMoKTtcbiAgICBjb25zdCBsZXZlbCA9IHRydXN0TGV2ZWwoKTtcblxuICAgIGNvbnN0IG1ldGVyID0gJCgndHJ1c3QtbWV0ZXInKTtcbiAgICBpZiAobWV0ZXIpIHtcbiAgICAgICAgbWV0ZXIuZGF0YXNldC5sZXZlbCA9IFN0cmluZyhsZXZlbCk7XG4gICAgICAgIG1ldGVyLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBTZWN1cml0eSBsZXZlbCAke2xldmVsfSBvZiAzYCk7XG4gICAgfVxuICAgIGNvbnN0IHJlYWRvdXQgPSAkKCd0cnVzdC1sZXZlbC1yZWFkb3V0Jyk7XG4gICAgaWYgKHJlYWRvdXQpIHJlYWRvdXQudGV4dENvbnRlbnQgPSBgTCR7bGV2ZWx9YDtcblxuICAgIHJlbmRlclJ1bmcoMSwgYS5sMSwgbGV2ZWwpO1xuICAgIHJlbmRlclJ1bmcoMiwgYS5sMiwgbGV2ZWwpO1xuICAgIHJlbmRlclJ1bmcoMywgYS5sMywgbGV2ZWwpO1xuXG4gICAgLy8gTDEgbGV2ZWwtdXAgYWN0aW9uOiBlbmNyeXB0ZWQgYmFja3VwIG5lZWRzIGEgbWFzdGVyIHBhc3N3b3JkOyB1bnRpbFxuICAgIC8vIHRoZW4sIHBvaW50IGF0IHRoZSBrZXktZXhwb3J0IHBhdGggaW5zdGVhZCBvZiBzaG93aW5nIGEgZGVhZCBidXR0b24uXG4gICAgY29uc3QgYmFja3VwQnRuID0gJCgnYmFja3VwLWV4cG9ydC1idG4nKTtcbiAgICBjb25zdCBsMUhpbnQgPSAkKCdydW5nLWwxLWhpbnQnKTtcbiAgICAvKiAnaW5saW5lLWZsZXgnIG1hdGNoZXMgLmJ0biBiYXNlIGRpc3BsYXkgKGluc3RydW1lbnQuY3NzKTsgJycgd291bGQgbG9zZVxuICAgICAgIHRvIHRoZSAjYmFja3VwLWV4cG9ydC1idG4gc3R5bGVzaGVldCBydWxlIHRoYXQgcmVwbGFjZWQgaXRzIGlubGluZSBzdHlsZS4gKi9cbiAgICBpZiAoYmFja3VwQnRuKSBiYWNrdXBCdG4uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2lubGluZS1mbGV4JyA6ICdub25lJztcbiAgICBpZiAobDFIaW50KSB7XG4gICAgICAgIGwxSGludC50ZXh0Q29udGVudCA9IHN0YXRlLmhhc1Bhc3N3b3JkXG4gICAgICAgICAgICA/ICdMZXZlbCB1cDogZG93bmxvYWQgYW4gZW5jcnlwdGVkIGJhY2t1cCBvZiB5b3VyIHZhdWx0IGFuZCBzdG9yZSBpdCBzb21ld2hlcmUgc2FmZS4nXG4gICAgICAgICAgICA6ICdMZXZlbCB1cDogc2V0IGEgbWFzdGVyIHBhc3N3b3JkIGZpcnN0LCB0aGVuIGRvd25sb2FkIGFuIGVuY3J5cHRlZCBiYWNrdXAgaGVyZSBcdTIwMTQgb3IgZXhwb3J0IHlvdXIga2V5IGZyb20gdGhlIE5vc3RyS2V5IHBhbmVsIGFuZCBzdG9yZSBpdCBzYWZlbHkuJztcbiAgICB9XG4gICAgY29uc3QgYmFja3VwRXJyID0gJCgnYmFja3VwLWVycm9yJyk7XG4gICAgaWYgKGJhY2t1cEVycikge1xuICAgICAgICBiYWNrdXBFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5iYWNrdXBFcnJvcjtcbiAgICAgICAgYmFja3VwRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5iYWNrdXBFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gTDIgYWN0aW9uIHJlZmluZW1lbnQ6IHBhc3N3b3JkIHNldCBidXQgYXV0by1sb2NrIGRpc2FibGVkLlxuICAgIGNvbnN0IGwyQWN0aW9uID0gJCgncnVuZy1sMi1hY3Rpb24nKTtcbiAgICBpZiAobDJBY3Rpb24pIHtcbiAgICAgICAgbDJBY3Rpb24udGV4dENvbnRlbnQgPSAoc3RhdGUuaGFzUGFzc3dvcmQgJiYgc3RhdGUuYXV0b0xvY2tNaW51dGVzID09PSAwKVxuICAgICAgICAgICAgPyAnTGV2ZWwgdXA6IGF1dG8tbG9jayBpcyBzZXQgdG8gTmV2ZXIgXHUyMDE0IHBpY2sgYW4gaW50ZXJ2YWwgYmVsb3cgdG8gcmVhY2ggTDIuJ1xuICAgICAgICAgICAgOiAnTGV2ZWwgdXA6IHNldCBhIG1hc3RlciBwYXNzd29yZCBiZWxvdywgdGhlbiBwaWNrIGFuIGF1dG8tbG9jayBpbnRlcnZhbC4nO1xuICAgIH1cblxuICAgIC8vIENoYW5uZWwgc3RyaXA6IGlkZW50aXR5ICsgc3RhdHVzIExFRC5cbiAgICBjb25zdCBuYW1lVGV4dCA9ICQoJ3N0cmlwLW5hbWUtdGV4dCcpO1xuICAgIGlmIChuYW1lVGV4dCkgbmFtZVRleHQudGV4dENvbnRlbnQgPSBzdGF0ZS5wcm9maWxlTmFtZSB8fCAnUHJvZmlsZSc7XG4gICAgY29uc3QgbnB1YkVsID0gJCgnc3RyaXAtbnB1YicpO1xuICAgIGlmIChucHViRWwpIG5wdWJFbC50ZXh0Q29udGVudCA9IHN0YXRlLnByb2ZpbGVOcHViIHx8ICdubyBrZXkgb24gdGhpcyBwcm9maWxlJztcbiAgICBjb25zdCBzdHJpcExlZCA9ICQoJ3N0cmlwLWxlZCcpO1xuICAgIGlmIChzdHJpcExlZCkge1xuICAgICAgICBzdHJpcExlZC5jbGFzc05hbWUgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdsZWQgbGVkLS1ncmVlbicgOiAnbGVkIGxlZC0tYW1iZXInO1xuICAgIH1cblxuICAgIC8vIE1vZHVsZS1oZWFkZXIgTEVEcyAobWFzdGVyIHBhc3N3b3JkIC8gYXV0by1sb2NrKS5cbiAgICBjb25zdCBwd0xlZCA9ICQoJ3Bhc3N3b3JkLWxlZCcpO1xuICAgIGlmIChwd0xlZCkgcHdMZWQuY2xhc3NOYW1lID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbGVkIGxlZC0tZ3JlZW4nIDogJ2xlZCBsZWQtLW9mZic7XG4gICAgY29uc3QgYWxMZWQgPSAkKCdhdXRvbG9jay1sZWQnKTtcbiAgICBpZiAoYWxMZWQpIHtcbiAgICAgICAgYWxMZWQuY2xhc3NOYW1lID0gKHN0YXRlLmhhc1Bhc3N3b3JkICYmIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA+IDApXG4gICAgICAgICAgICA/ICdsZWQgbGVkLS1ncmVlbicgOiAnbGVkIGxlZC0tb2ZmJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3dQYWdlU3VjY2Vzcyhtc2cpIHtcbiAgICBzdGF0ZS5wYWdlU3VjY2VzcyA9IG1zZztcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUucGFnZVN1Y2Nlc3MgPSAnJzsgcmVuZGVyKCk7IH0sIDUwMDApO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gTG9ja2VkIHZzIHVubG9ja2VkIHZpZXdzXG4gICAgY29uc3QgbG9ja2VkVmlldyA9ICQoJ2xvY2tlZC12aWV3Jyk7XG4gICAgY29uc3QgdW5sb2NrZWRWaWV3ID0gJCgndW5sb2NrZWQtdmlldycpO1xuICAgIGlmIChsb2NrZWRWaWV3KSBsb2NrZWRWaWV3LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5pc0xvY2tlZCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKHVubG9ja2VkVmlldykgdW5sb2NrZWRWaWV3LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5pc0xvY2tlZCA/ICdub25lJyA6ICdibG9jayc7XG5cbiAgICAvLyBVbmxvY2sgZXJyb3JcbiAgICBjb25zdCB1bmxvY2tFcnIgPSAkKCd1bmxvY2stZXJyb3InKTtcbiAgICBpZiAodW5sb2NrRXJyKSB7IHVubG9ja0Vyci50ZXh0Q29udGVudCA9IHN0YXRlLnVubG9ja0Vycm9yOyB1bmxvY2tFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnVubG9ja0Vycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuXG4gICAgLy8gUGFnZS1sZXZlbCBzdWNjZXNzIGJhbm5lclxuICAgIGNvbnN0IHBhZ2VTdWMgPSAkKCdwYWdlLXN1Y2Nlc3MnKTtcbiAgICBpZiAocGFnZVN1YykgeyBwYWdlU3VjLnRleHRDb250ZW50ID0gc3RhdGUucGFnZVN1Y2Nlc3M7IHBhZ2VTdWMuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnBhZ2VTdWNjZXNzID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuXG4gICAgLy8gU2VjdXJpdHkgc3RhdHVzXG4gICAgY29uc3Qgc2VjdXJpdHlTdGF0dXMgPSAkKCdzZWN1cml0eS1zdGF0dXMnKTtcbiAgICBpZiAoc2VjdXJpdHlTdGF0dXMpIHtcbiAgICAgICAgc2VjdXJpdHlTdGF0dXMudGV4dENvbnRlbnQgPSBzdGF0ZS5oYXNQYXNzd29yZFxuICAgICAgICAgICAgPyAnTWFzdGVyIHBhc3N3b3JkIGlzIGFjdGl2ZSBcdTIwMTQga2V5cyBhcmUgZW5jcnlwdGVkIGF0IHJlc3QuJ1xuICAgICAgICAgICAgOiAnTm8gbWFzdGVyIHBhc3N3b3JkIHNldCBcdTIwMTQga2V5cyBhcmUgc3RvcmVkIHVuZW5jcnlwdGVkLic7XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIHNlY3Rpb25zIGJhc2VkIG9uIHBhc3N3b3JkIHN0YXRlXG4gICAgY29uc3Qgc2V0U2VjdGlvbiA9ICQoJ3NldC1wYXNzd29yZC1zZWN0aW9uJyk7XG4gICAgY29uc3QgY2hhbmdlU2VjdGlvbiA9ICQoJ2NoYW5nZS1wYXNzd29yZC1zZWN0aW9uJyk7XG4gICAgaWYgKHNldFNlY3Rpb24pIHNldFNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICBpZiAoY2hhbmdlU2VjdGlvbikgY2hhbmdlU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgLy8gUGFzc3dvcmQgc3RyZW5ndGhcbiAgICBjb25zdCBzdHJlbmd0aEVsID0gJCgncGFzc3dvcmQtc3RyZW5ndGgnKTtcbiAgICBpZiAoc3RyZW5ndGhFbCkge1xuICAgICAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmVuZ3RoID0gY2FsY3VsYXRlUGFzc3dvcmRTdHJlbmd0aChzdGF0ZS5uZXdQYXNzd29yZCk7XG4gICAgICAgICAgICBjb25zdCBsYWJlbHMgPSBbJycsICdUb28gc2hvcnQnLCAnV2VhaycsICdGYWlyJywgJ1N0cm9uZycsICdWZXJ5IHN0cm9uZyddO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC50ZXh0Q29udGVudCA9IGxhYmVsc1tzdHJlbmd0aF0gfHwgJyc7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLmNsYXNzTmFtZSA9IGBmaWVsZC1oaW50IHN0cmVuZ3RoLSR7c3RyZW5ndGh9YDtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3Qgc2V0QnRuID0gJCgnc2V0LXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChzZXRCdG4pIHtcbiAgICAgICAgc2V0QnRuLmRpc2FibGVkID0gIShzdGF0ZS5uZXdQYXNzd29yZC5sZW5ndGggPj0gOCAmJiBzdGF0ZS5uZXdQYXNzd29yZCA9PT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3QgY2hhbmdlQnRuID0gJCgnY2hhbmdlLXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChjaGFuZ2VCdG4pIHtcbiAgICAgICAgY2hhbmdlQnRuLmRpc2FibGVkID0gIShzdGF0ZS5jdXJyZW50UGFzc3dvcmQubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UubGVuZ3RoID49IDggJiZcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCByZW1vdmVCdG4gPSAkKCdyZW1vdmUtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHJlbW92ZUJ0bikge1xuICAgICAgICByZW1vdmVCdG4uZGlzYWJsZWQgPSAhc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dDtcbiAgICB9XG5cbiAgICAvLyBJbmxpbmUgZXJyb3IgbWVzc2FnZXNcbiAgICBjb25zdCBzZWNFcnIgPSAkKCdzZWN1cml0eS1lcnJvcicpO1xuICAgIGlmIChzZWNFcnIpIHsgc2VjRXJyLnRleHRDb250ZW50ID0gc3RhdGUuc2VjdXJpdHlFcnJvcjsgc2VjRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5zZWN1cml0eUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuICAgIGNvbnN0IGNoZ0VyciA9ICQoJ2NoYW5nZS1lcnJvcicpO1xuICAgIGlmIChjaGdFcnIpIHsgY2hnRXJyLnRleHRDb250ZW50ID0gc3RhdGUuY2hhbmdlRXJyb3I7IGNoZ0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuY2hhbmdlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3Qgcm1FcnIgPSAkKCdyZW1vdmUtZXJyb3InKTtcbiAgICBpZiAocm1FcnIpIHsgcm1FcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5yZW1vdmVFcnJvcjsgcm1FcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnJlbW92ZUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuXG4gICAgLy8gRW5jcnlwdGlvbiBzdGF0dXMgYmFubmVyXG4gICAgY29uc3QgZW5jcnlwdGlvblN0YXR1cyA9ICQoJ2VuY3J5cHRpb24tc3RhdHVzJyk7XG4gICAgaWYgKGVuY3J5cHRpb25TdGF0dXMpIGVuY3J5cHRpb25TdGF0dXMuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2ZsZXgnIDogJ25vbmUnO1xuXG4gICAgLy8gQXV0by1sb2NrIHNlY3Rpb25cbiAgICBjb25zdCBhdXRvbG9ja0Rpc2FibGVkID0gJCgnYXV0b2xvY2stZGlzYWJsZWQtbXNnJyk7XG4gICAgY29uc3QgYXV0b2xvY2tDb250cm9scyA9ICQoJ2F1dG9sb2NrLWNvbnRyb2xzJyk7XG4gICAgaWYgKGF1dG9sb2NrRGlzYWJsZWQpIGF1dG9sb2NrRGlzYWJsZWQuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICBpZiAoYXV0b2xvY2tDb250cm9scykgYXV0b2xvY2tDb250cm9scy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgY29uc3QgYXV0b2xvY2tTZWxlY3QgPSAkKCdhdXRvbG9jay1zZWxlY3QnKTtcbiAgICBpZiAoYXV0b2xvY2tTZWxlY3QpIGF1dG9sb2NrU2VsZWN0LnZhbHVlID0gU3RyaW5nKHN0YXRlLmF1dG9Mb2NrTWludXRlcyk7XG5cbiAgICBjb25zdCBhdXRvbG9ja1N1Y2Nlc3MgPSAkKCdhdXRvbG9jay1zdWNjZXNzJyk7XG4gICAgaWYgKGF1dG9sb2NrU3VjY2Vzcykge1xuICAgICAgICBhdXRvbG9ja1N1Y2Nlc3MudGV4dENvbnRlbnQgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3M7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuYXV0b2xvY2tTdWNjZXNzID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG5cbiAgICAvLyBUcnVzdCBsYWRkZXIgLyBsZXZlbCBtZXRlclxuICAgIHJlbmRlclRydXN0KCk7XG59XG5cbi8vIC0tLSBIYW5kbGVycyAtLS1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVW5sb2NrKCkge1xuICAgIGNvbnN0IHB3ID0gJCgndW5sb2NrLXBhc3N3b3JkJyk/LnZhbHVlO1xuICAgIGlmICghcHcpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndW5sb2NrJywgcGF5bG9hZDogcHcgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICcnO1xuICAgICAgICAgICAgaWYgKCQoJ3VubG9jay1wYXNzd29yZCcpKSAkKCd1bmxvY2stcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnSW52YWxpZCBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdW5sb2NrLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2V0UGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkcyBkbyBub3QgbWF0Y2guJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnc2V0UGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUubmV3UGFzc3dvcmQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWFzdGVyIHBhc3N3b3JkIGFjY29yZGlvblxuICAgICAgICAgICAgY29uc3QgbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFzdGVyLXBhc3N3b3JkJyk7XG4gICAgICAgICAgICBpZiAobXAgJiYgbXAub3BlbikgbXAub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgc2V0LiBZb3VyIGtleXMgYXJlIG5vdyBlbmNyeXB0ZWQgYXQgcmVzdC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBzZXQgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnJztcblxuICAgIGlmICghc3RhdGUuY3VycmVudFBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnTmV3IHBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBvbGRQYXNzd29yZDogc3RhdGUuY3VycmVudFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSAnJztcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5LicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWNvbmZpcm0oJ1RoaXMgd2lsbCByZW1vdmUgZW5jcnlwdGlvbiBmcm9tIHlvdXIgcHJpdmF0ZSBrZXlzLiBUaGV5IHdpbGwgYmUgc3RvcmVkIGFzIHBsYWludGV4dC4gQXJlIHlvdSBzdXJlPycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAncmVtb3ZlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gJyc7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCByZW1vdmVkLiBLZXlzIGFyZSBub3cgc3RvcmVkIHVuZW5jcnlwdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlbW92ZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZVZhdWx0KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QWxsRGF0YScgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHN0YXRlIGFuZCBzaG93IHNldCBwYXNzd29yZCB2aWV3XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IG51bGw7XG4gICAgICAgICAgICBzdGF0ZS5pc0J1bmtlclByb2ZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmJ1bmtlckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ1ZhdWx0IGRlbGV0ZWQuIFlvdSBjYW4gbm93IHNldCB1cCBhIG5ldyBtYXN0ZXIgcGFzc3dvcmQuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGVydCgnRmFpbGVkIHRvIGRlbGV0ZSB2YXVsdDogJyArIChyZXN1bHQ/LmVycm9yIHx8ICdVbmtub3duIGVycm9yJykpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhbGVydCgnRmFpbGVkIHRvIGRlbGV0ZSB2YXVsdDogJyArIGUubWVzc2FnZSk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVCYWNrdXBFeHBvcnQoKSB7XG4gICAgc3RhdGUuYmFja3VwRXJyb3IgPSAnJztcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdiYWNrdXAuZXhwb3J0JyB9KTtcbiAgICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5iYWNrdXBFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnQmFja3VwIGV4cG9ydCBmYWlsZWQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShyZXN1bHQuZW52ZWxvcGUsIG51bGwsIDIpO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2pzb25dLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbiAgICAgICAgYS5kb3dubG9hZCA9IGBub3N0cmtleS1iYWNrdXAtJHtkYXRlfS5qc29uYDtcbiAgICAgICAgYS5jbGljaygpO1xuICAgICAgICAvLyBEZWxheSByZXZva2UgXHUyMDE0IFNhZmFyaS9GaXJlZm94IGNhbiBzdGFydCB0aGUgZG93bmxvYWQgYWZ0ZXIgdGhpcyB0aWNrXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpLCAxMDAwMCk7XG5cbiAgICAgICAgLy8gUmVjb3JkIHRoZSBiYWNrdXAgc28gdGhlIHRydXN0IG1ldGVyIGNhbiBsaWdodCBMMSBob25lc3RseS5cbiAgICAgICAgc3RhdGUubGFzdEJhY2t1cEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdHJ5IHsgYXdhaXQgYXBpLnN0b3JhZ2Uuc2V0KHsgbGFzdEJhY2t1cEF0OiBzdGF0ZS5sYXN0QmFja3VwQXQgfSk7IH0gY2F0Y2ggeyAvKiBub24tZmF0YWwgKi8gfVxuICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ0VuY3J5cHRlZCBiYWNrdXAgZG93bmxvYWRlZC4gU3RvcmUgaXQgc29tZXdoZXJlIHNhZmUgXHUyMDE0IGl0IG5lZWRzIHlvdXIgbWFzdGVyIHBhc3N3b3JkIHRvIHJlc3RvcmUuJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5iYWNrdXBFcnJvciA9IGUubWVzc2FnZSB8fCAnQmFja3VwIGV4cG9ydCBmYWlsZWQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBdXRvTG9ja0NoYW5nZSgpIHtcbiAgICBjb25zdCBzZWxlY3QgPSAkKCdhdXRvbG9jay1zZWxlY3QnKTtcbiAgICBpZiAoIXNlbGVjdCkgcmV0dXJuO1xuICAgIGNvbnN0IG1pbnV0ZXMgPSBwYXJzZUludChzZWxlY3QudmFsdWUsIDEwKTtcbiAgICBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPSBtaW51dGVzO1xuXG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2V0QXV0b0xvY2tUaW1lb3V0JyxcbiAgICAgICAgcGF5bG9hZDogbWludXRlcyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGxhYmVsID0gbWludXRlcyA9PT0gMCA/ICdkaXNhYmxlZCdcbiAgICAgICAgOiBtaW51dGVzID09PSA2MCA/ICcxIGhvdXInXG4gICAgICAgIDogbWludXRlcyA9PT0gMTgwID8gJzMgaG91cnMnXG4gICAgICAgIDogYCR7bWludXRlc30gbWludXRlc2A7XG4gICAgc3RhdGUuYXV0b2xvY2tTdWNjZXNzID0gbWludXRlcyA9PT0gMFxuICAgICAgICA/ICdBdXRvLWxvY2sgZGlzYWJsZWQuJ1xuICAgICAgICA6IGBBdXRvLWxvY2sgc2V0IHRvICR7bGFiZWx9LmA7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA9ICcnOyByZW5kZXIoKTsgfSwgMzAwMCk7XG59XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgLy8gQ2xvc2VcbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG5cbiAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZm9ybSBzdWJtaXNzaW9uXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZm9ybScpLmZvckVhY2goZm9ybSA9PiB7XG4gICAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gICAgfSk7XG5cbiAgICAvLyBVbmxvY2tcbiAgICAkKCd1bmxvY2stZm9ybScpPy5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4geyBlLnByZXZlbnREZWZhdWx0KCk7IGhhbmRsZVVubG9jaygpOyB9KTtcblxuICAgIC8vIFNldCBwYXNzd29yZFxuICAgICQoJ25ldy1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLm5ld1Bhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjb25maXJtLXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdzZXQtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2V0UGFzc3dvcmQpO1xuXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkXG4gICAgJCgnY3VycmVudC1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmN1cnJlbnRQYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnbmV3LXBhc3N3b3JkLWNoYW5nZScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjb25maXJtLXBhc3N3b3JkLWNoYW5nZScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY2hhbmdlLXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNoYW5nZVBhc3N3b3JkKTtcblxuICAgIC8vIFJlbW92ZSBwYXNzd29yZFxuICAgICQoJ3JlbW92ZS1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ3JlbW92ZS1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVSZW1vdmVQYXNzd29yZCk7XG5cbiAgICAvLyBBdXRvLWxvY2tcbiAgICAkKCdhdXRvbG9jay1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQXV0b0xvY2tDaGFuZ2UpO1xuXG4gICAgLy8gVHJ1c3QgbGFkZGVyOiBlbmNyeXB0ZWQgYmFja3VwIGV4cG9ydCAoTDEgbGV2ZWwtdXAgYWN0aW9uKVxuICAgICQoJ2JhY2t1cC1leHBvcnQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQmFja3VwRXhwb3J0KTtcblxuICAgIC8vIERlbGV0ZSB2YXVsdCAoZnJvbSBsb2NrZWQgdmlldylcbiAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnZGVsZXRlLWNvbmZpcm0tZGlhbG9nJyk/LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSk7XG4gICAgJCgnY2FuY2VsLWRlbGV0ZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJ2RlbGV0ZS1jb25maXJtLWRpYWxvZycpPy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgfSk7XG4gICAgJCgnY29uZmlybS1kZWxldGUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRGVsZXRlVmF1bHQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gISEoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pKTtcbiAgICBzdGF0ZS5pc0xvY2tlZCA9ICEhKGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzTG9ja2VkJyB9KSk7XG4gICAgc3RhdGUuYXV0b0xvY2tNaW51dGVzID0gKGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dldEF1dG9Mb2NrVGltZW91dCcgfSkpID8/IDE1O1xuXG4gICAgLy8gVHJ1c3QtbGFkZGVyIHNpZ25hbHMgXHUyMDE0IGVhY2ggaXMgYmVzdC1lZmZvcnQ7IGEgZmFpbHVyZSBqdXN0IGxlYXZlcyB0aGVcbiAgICAvLyBydW5nIHVubGl0IHJhdGhlciB0aGFuIGJyZWFraW5nIHRoZSBwYWdlLlxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZXRBY3RpdmVQcm9maWxlSW5mbycgfSk7XG4gICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBzdGF0ZS5wcm9maWxlTmFtZSA9IGluZm8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIHN0YXRlLnByb2ZpbGVOcHViID0gaW5mby5ucHViIHx8ICcnO1xuICAgICAgICAgICAgc3RhdGUuaXNCdW5rZXJQcm9maWxlID0gISFpbmZvLmlzQnVua2VyO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYnVua2VyID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnYnVua2VyU2VydmVyLnN0YXR1cycgfSk7XG4gICAgICAgIHN0YXRlLmJ1bmtlckFjdGl2ZSA9ICEhKGJ1bmtlciAmJiBidW5rZXIuYWN0aXZlKTtcbiAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSBhd2FpdCBhcGkuc3RvcmFnZS5nZXQoeyBsYXN0QmFja3VwQXQ6IG51bGwgfSk7XG4gICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IHN0b3JlZD8ubGFzdEJhY2t1cEF0IHx8IG51bGw7XG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICAvLyBPcGVuIGFjY29yZGlvbiBtYXRjaGluZyBVUkwgaGFzaCAoZS5nLiAjbWFzdGVyLXBhc3N3b3JkIG9yICNhdXRvbG9jaylcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcbiAgICBpZiAoaGFzaCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYXNoKTtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQudGFnTmFtZSA9PT0gJ0RFVEFJTFMnKSB7XG4gICAgICAgICAgICB0YXJnZXQub3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEZWZhdWx0OiBvcGVuIG1hc3Rlci1wYXNzd29yZCBhY2NvcmRpb25cbiAgICAgICAgY29uc3QgbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFzdGVyLXBhc3N3b3JkJyk7XG4gICAgICAgIGlmIChtcCkgbXAub3BlbiA9IHRydWU7XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixNQUFJLENBQUMsVUFBVTtBQUNYLFVBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLEVBQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQU1yRSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFD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
