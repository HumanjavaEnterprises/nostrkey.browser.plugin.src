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

  // src/ins-confirm.js
  var queue = Promise.resolve();
  var idCounter = 0;
  function motionOff() {
    if (document.documentElement.getAttribute("data-ins-motion") === "off") return true;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }
  function openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice }) {
    return new Promise((resolve) => {
      const prevFocus = document.activeElement;
      const root = document.createElement("div");
      root.className = "ins-consent-root";
      const backdrop = document.createElement("div");
      backdrop.className = "ins-consent-backdrop";
      const isSheet = variant !== "popover";
      const dialog = document.createElement("div");
      dialog.className = isSheet ? "ins-consent-sheet" : "ins-consent-popover";
      dialog.setAttribute("role", destructive || notice ? "alertdialog" : "dialog");
      dialog.setAttribute("aria-modal", "true");
      if (isSheet) {
        const handle = document.createElement("div");
        handle.className = "ins-consent-handle";
        dialog.appendChild(handle);
      }
      const uid = ++idCounter;
      const titleEl = document.createElement("h2");
      titleEl.className = "ins-consent-title";
      titleEl.id = `ins-consent-title-${uid}`;
      titleEl.textContent = title || "";
      dialog.appendChild(titleEl);
      dialog.setAttribute("aria-labelledby", titleEl.id);
      const bodyEl = document.createElement("p");
      bodyEl.className = "ins-consent-body";
      bodyEl.id = `ins-consent-body-${uid}`;
      bodyEl.textContent = body || "";
      dialog.appendChild(bodyEl);
      dialog.setAttribute("aria-describedby", bodyEl.id);
      const actions = document.createElement("div");
      actions.className = "ins-consent-actions";
      const buttons = [];
      let cancelBtn = null;
      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.textContent = confirmLabel;
      if (notice) {
        confirmBtn.className = "btn";
      } else {
        cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "btn btn--ghost";
        cancelBtn.textContent = cancelLabel;
        actions.appendChild(cancelBtn);
        buttons.push(cancelBtn);
        confirmBtn.className = destructive ? "btn btn--destructive" : "btn btn--primary";
      }
      actions.appendChild(confirmBtn);
      buttons.push(confirmBtn);
      dialog.appendChild(actions);
      root.appendChild(backdrop);
      root.appendChild(dialog);
      let settled = false;
      function settle(result) {
        if (settled) return;
        settled = true;
        document.removeEventListener("keydown", onKeydown, true);
        backdrop.classList.remove("is-open");
        dialog.classList.remove("is-open");
        const finish = () => {
          root.remove();
          try {
            if (prevFocus && typeof prevFocus.focus === "function" && document.contains(prevFocus)) {
              prevFocus.focus();
            }
          } catch (_) {
          }
          resolve(result);
        };
        if (motionOff()) finish();
        else setTimeout(finish, 250);
      }
      function onKeydown(ev) {
        if (ev.key === "Escape") {
          ev.preventDefault();
          settle(false);
          return;
        }
        if (ev.key === "Tab") {
          ev.preventDefault();
          const idx = buttons.indexOf(document.activeElement);
          const dir = ev.shiftKey ? -1 : 1;
          buttons[(idx + dir + buttons.length) % buttons.length].focus();
        }
      }
      backdrop.addEventListener("click", () => settle(false));
      if (cancelBtn) cancelBtn.addEventListener("click", () => settle(false));
      confirmBtn.addEventListener("click", () => settle(true));
      document.addEventListener("keydown", onKeydown, true);
      document.body.appendChild(root);
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        dialog.classList.add("is-open");
        const initial = notice ? confirmBtn : destructive ? cancelBtn : confirmBtn;
        (initial || confirmBtn).focus();
      });
    });
  }
  function insConfirm({
    title,
    body,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    variant = "sheet"
  } = {}) {
    const result = queue.then(() => openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice: false }));
    queue = result.catch(() => {
    });
    return result;
  }
  function insNotice({ title, body, dismissLabel = "OK" } = {}) {
    const result = queue.then(() => openDialog({
      title,
      body,
      confirmLabel: dismissLabel,
      cancelLabel: "",
      destructive: false,
      variant: "sheet",
      notice: true
    }).then(() => void 0));
    queue = result.catch(() => {
    });
    return result;
  }

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
    if (!await insConfirm({ title: "Remove master-password encryption?", body: "Your private keys will be stored as plaintext on this device.", confirmLabel: "Remove encryption", destructive: true })) {
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
        await insNotice({ title: "Vault deletion failed", body: result?.error || "Unknown error" });
      }
    } catch (e) {
      await insNotice({ title: "Vault deletion failed", body: e.message });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvc2VjdXJpdHkvc2VjdXJpdHkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSwgaW5zTm90aWNlIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBpc0xvY2tlZDogZmFsc2UsXG4gICAgaGFzUGFzc3dvcmQ6IGZhbHNlLFxuICAgIC8vIFVubG9ja1xuICAgIHVubG9ja0Vycm9yOiAnJyxcbiAgICAvLyBTZXQgcGFzc3dvcmRcbiAgICBuZXdQYXNzd29yZDogJycsXG4gICAgY29uZmlybVBhc3N3b3JkOiAnJyxcbiAgICBzZWN1cml0eUVycm9yOiAnJyxcbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmRcbiAgICBjdXJyZW50UGFzc3dvcmQ6ICcnLFxuICAgIG5ld1Bhc3N3b3JkQ2hhbmdlOiAnJyxcbiAgICBjb25maXJtUGFzc3dvcmRDaGFuZ2U6ICcnLFxuICAgIGNoYW5nZUVycm9yOiAnJyxcbiAgICAvLyBSZW1vdmUgcGFzc3dvcmRcbiAgICByZW1vdmVQYXNzd29yZElucHV0OiAnJyxcbiAgICByZW1vdmVFcnJvcjogJycsXG4gICAgLy8gU2hhcmVkIHBhZ2UtbGV2ZWwgc3VjY2Vzc1xuICAgIHBhZ2VTdWNjZXNzOiAnJyxcbiAgICAvLyBBdXRvLWxvY2tcbiAgICBhdXRvTG9ja01pbnV0ZXM6IDE1LFxuICAgIGF1dG9sb2NrU3VjY2VzczogJycsXG4gICAgLy8gVHJ1c3QgbGFkZGVyIChMMFx1MjE5MkwzIGxldmVsLW1ldGVyKVxuICAgIHByb2ZpbGVOYW1lOiAnJyxcbiAgICBwcm9maWxlTnB1YjogJycsXG4gICAgaXNCdW5rZXJQcm9maWxlOiBmYWxzZSxcbiAgICBidW5rZXJBY3RpdmU6IGZhbHNlLFxuICAgIGxhc3RCYWNrdXBBdDogbnVsbCxcbiAgICBiYWNrdXBFcnJvcjogJycsXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUGFzc3dvcmRTdHJlbmd0aChwdykge1xuICAgIGlmIChwdy5sZW5ndGggPT09IDApIHJldHVybiAwO1xuICAgIGlmIChwdy5sZW5ndGggPCA4KSByZXR1cm4gMTtcbiAgICBsZXQgc2NvcmUgPSAyO1xuICAgIGlmIChwdy5sZW5ndGggPj0gMTIpIHNjb3JlKys7XG4gICAgaWYgKC9bQS1aXS8udGVzdChwdykgJiYgL1thLXpdLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICBpZiAoL1xcZC8udGVzdChwdykpIHNjb3JlKys7XG4gICAgaWYgKC9bXkEtWmEtejAtOV0vLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIHJldHVybiBNYXRoLm1pbihzY29yZSwgNSk7XG59XG5cbi8vIC0tLSBUcnVzdCBsYWRkZXIgKEwwIHdvcmtpbmcga2V5IFx1MDBCNyBMMSBiYWNrZWQgdXAgXHUwMEI3IEwyIGVuY3J5cHRlZCthdXRvLWxvY2sgXHUwMEI3XG4vLyBMMyByZW1vdGUgc2lnbmVyKS4gVGhlIG1ldGVyIHNob3dzIHRoZSBISUdIRVNUIGFjaGlldmVkIGxldmVsOyBza2lwcGVkXG4vLyBsb3dlciBydW5ncyBzdGF5IGFtYmVyIHNvIHRoZSBnYXAgaXMgdmlzaWJsZSBhbmQgYWN0aW9uYWJsZS5cbmZ1bmN0aW9uIHRydXN0QWNoaWV2ZW1lbnRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGwxOiAhIXN0YXRlLmxhc3RCYWNrdXBBdCxcbiAgICAgICAgbDI6IHN0YXRlLmhhc1Bhc3N3b3JkICYmIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA+IDAsXG4gICAgICAgIGwzOiBzdGF0ZS5idW5rZXJBY3RpdmUgfHwgc3RhdGUuaXNCdW5rZXJQcm9maWxlLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIHRydXN0TGV2ZWwoKSB7XG4gICAgY29uc3QgYSA9IHRydXN0QWNoaWV2ZW1lbnRzKCk7XG4gICAgaWYgKGEubDMpIHJldHVybiAzO1xuICAgIGlmIChhLmwyKSByZXR1cm4gMjtcbiAgICBpZiAoYS5sMSkgcmV0dXJuIDE7XG4gICAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclJ1bmcobiwgYWNoaWV2ZWQsIGxldmVsKSB7XG4gICAgY29uc3QgcnVuZyA9ICQoYHJ1bmctbCR7bn1gKTtcbiAgICBjb25zdCBsZWQgPSAkKGBydW5nLWwke259LWxlZGApO1xuICAgIGNvbnN0IHN0YXRlRWwgPSAkKGBydW5nLWwke259LXN0YXRlYCk7XG4gICAgaWYgKHJ1bmcpIHJ1bmcuZGF0YXNldC5hY2hpZXZlZCA9IGFjaGlldmVkID8gJ3RydWUnIDogJ2ZhbHNlJztcbiAgICBpZiAobGVkKSB7XG4gICAgICAgIC8vIGFjaGlldmVkID0gZ3JlZW4gTEVEIFx1MDBCNyBza2lwcGVkIChiZWxvdyBjdXJyZW50IGxldmVsKSA9IGFtYmVyIFx1MDBCNyBub3RcbiAgICAgICAgLy8geWV0IHJlYWNoZWQgPSBvZmYuIEdyZWVuIGlzIGEgc3RhdHVzIExFRCBvbmx5LCBwZXIgZGVzaWduIHN5c3RlbS5cbiAgICAgICAgbGVkLmNsYXNzTmFtZSA9IGFjaGlldmVkXG4gICAgICAgICAgICA/ICdsZWQgbGVkLS1ncmVlbidcbiAgICAgICAgICAgIDogKG4gPCBsZXZlbCA/ICdsZWQgbGVkLS1hbWJlcicgOiAnbGVkIGxlZC0tb2ZmJyk7XG4gICAgfVxuICAgIGlmIChzdGF0ZUVsKSBzdGF0ZUVsLnRleHRDb250ZW50ID0gYWNoaWV2ZWQgPyAnT0snIDogJ1x1MjAxNCc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRydXN0KCkge1xuICAgIGNvbnN0IGEgPSB0cnVzdEFjaGlldmVtZW50cygpO1xuICAgIGNvbnN0IGxldmVsID0gdHJ1c3RMZXZlbCgpO1xuXG4gICAgY29uc3QgbWV0ZXIgPSAkKCd0cnVzdC1tZXRlcicpO1xuICAgIGlmIChtZXRlcikge1xuICAgICAgICBtZXRlci5kYXRhc2V0LmxldmVsID0gU3RyaW5nKGxldmVsKTtcbiAgICAgICAgbWV0ZXIuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgYFNlY3VyaXR5IGxldmVsICR7bGV2ZWx9IG9mIDNgKTtcbiAgICB9XG4gICAgY29uc3QgcmVhZG91dCA9ICQoJ3RydXN0LWxldmVsLXJlYWRvdXQnKTtcbiAgICBpZiAocmVhZG91dCkgcmVhZG91dC50ZXh0Q29udGVudCA9IGBMJHtsZXZlbH1gO1xuXG4gICAgcmVuZGVyUnVuZygxLCBhLmwxLCBsZXZlbCk7XG4gICAgcmVuZGVyUnVuZygyLCBhLmwyLCBsZXZlbCk7XG4gICAgcmVuZGVyUnVuZygzLCBhLmwzLCBsZXZlbCk7XG5cbiAgICAvLyBMMSBsZXZlbC11cCBhY3Rpb246IGVuY3J5cHRlZCBiYWNrdXAgbmVlZHMgYSBtYXN0ZXIgcGFzc3dvcmQ7IHVudGlsXG4gICAgLy8gdGhlbiwgcG9pbnQgYXQgdGhlIGtleS1leHBvcnQgcGF0aCBpbnN0ZWFkIG9mIHNob3dpbmcgYSBkZWFkIGJ1dHRvbi5cbiAgICBjb25zdCBiYWNrdXBCdG4gPSAkKCdiYWNrdXAtZXhwb3J0LWJ0bicpO1xuICAgIGNvbnN0IGwxSGludCA9ICQoJ3J1bmctbDEtaGludCcpO1xuICAgIC8qICdpbmxpbmUtZmxleCcgbWF0Y2hlcyAuYnRuIGJhc2UgZGlzcGxheSAoaW5zdHJ1bWVudC5jc3MpOyAnJyB3b3VsZCBsb3NlXG4gICAgICAgdG8gdGhlICNiYWNrdXAtZXhwb3J0LWJ0biBzdHlsZXNoZWV0IHJ1bGUgdGhhdCByZXBsYWNlZCBpdHMgaW5saW5lIHN0eWxlLiAqL1xuICAgIGlmIChiYWNrdXBCdG4pIGJhY2t1cEJ0bi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnaW5saW5lLWZsZXgnIDogJ25vbmUnO1xuICAgIGlmIChsMUhpbnQpIHtcbiAgICAgICAgbDFIaW50LnRleHRDb250ZW50ID0gc3RhdGUuaGFzUGFzc3dvcmRcbiAgICAgICAgICAgID8gJ0xldmVsIHVwOiBkb3dubG9hZCBhbiBlbmNyeXB0ZWQgYmFja3VwIG9mIHlvdXIgdmF1bHQgYW5kIHN0b3JlIGl0IHNvbWV3aGVyZSBzYWZlLidcbiAgICAgICAgICAgIDogJ0xldmVsIHVwOiBzZXQgYSBtYXN0ZXIgcGFzc3dvcmQgZmlyc3QsIHRoZW4gZG93bmxvYWQgYW4gZW5jcnlwdGVkIGJhY2t1cCBoZXJlIFx1MjAxNCBvciBleHBvcnQgeW91ciBrZXkgZnJvbSB0aGUgTm9zdHJLZXkgcGFuZWwgYW5kIHN0b3JlIGl0IHNhZmVseS4nO1xuICAgIH1cbiAgICBjb25zdCBiYWNrdXBFcnIgPSAkKCdiYWNrdXAtZXJyb3InKTtcbiAgICBpZiAoYmFja3VwRXJyKSB7XG4gICAgICAgIGJhY2t1cEVyci50ZXh0Q29udGVudCA9IHN0YXRlLmJhY2t1cEVycm9yO1xuICAgICAgICBiYWNrdXBFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmJhY2t1cEVycm9yID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG5cbiAgICAvLyBMMiBhY3Rpb24gcmVmaW5lbWVudDogcGFzc3dvcmQgc2V0IGJ1dCBhdXRvLWxvY2sgZGlzYWJsZWQuXG4gICAgY29uc3QgbDJBY3Rpb24gPSAkKCdydW5nLWwyLWFjdGlvbicpO1xuICAgIGlmIChsMkFjdGlvbikge1xuICAgICAgICBsMkFjdGlvbi50ZXh0Q29udGVudCA9IChzdGF0ZS5oYXNQYXNzd29yZCAmJiBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPT09IDApXG4gICAgICAgICAgICA/ICdMZXZlbCB1cDogYXV0by1sb2NrIGlzIHNldCB0byBOZXZlciBcdTIwMTQgcGljayBhbiBpbnRlcnZhbCBiZWxvdyB0byByZWFjaCBMMi4nXG4gICAgICAgICAgICA6ICdMZXZlbCB1cDogc2V0IGEgbWFzdGVyIHBhc3N3b3JkIGJlbG93LCB0aGVuIHBpY2sgYW4gYXV0by1sb2NrIGludGVydmFsLic7XG4gICAgfVxuXG4gICAgLy8gQ2hhbm5lbCBzdHJpcDogaWRlbnRpdHkgKyBzdGF0dXMgTEVELlxuICAgIGNvbnN0IG5hbWVUZXh0ID0gJCgnc3RyaXAtbmFtZS10ZXh0Jyk7XG4gICAgaWYgKG5hbWVUZXh0KSBuYW1lVGV4dC50ZXh0Q29udGVudCA9IHN0YXRlLnByb2ZpbGVOYW1lIHx8ICdQcm9maWxlJztcbiAgICBjb25zdCBucHViRWwgPSAkKCdzdHJpcC1ucHViJyk7XG4gICAgaWYgKG5wdWJFbCkgbnB1YkVsLnRleHRDb250ZW50ID0gc3RhdGUucHJvZmlsZU5wdWIgfHwgJ25vIGtleSBvbiB0aGlzIHByb2ZpbGUnO1xuICAgIGNvbnN0IHN0cmlwTGVkID0gJCgnc3RyaXAtbGVkJyk7XG4gICAgaWYgKHN0cmlwTGVkKSB7XG4gICAgICAgIHN0cmlwTGVkLmNsYXNzTmFtZSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2xlZCBsZWQtLWdyZWVuJyA6ICdsZWQgbGVkLS1hbWJlcic7XG4gICAgfVxuXG4gICAgLy8gTW9kdWxlLWhlYWRlciBMRURzIChtYXN0ZXIgcGFzc3dvcmQgLyBhdXRvLWxvY2spLlxuICAgIGNvbnN0IHB3TGVkID0gJCgncGFzc3dvcmQtbGVkJyk7XG4gICAgaWYgKHB3TGVkKSBwd0xlZC5jbGFzc05hbWUgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdsZWQgbGVkLS1ncmVlbicgOiAnbGVkIGxlZC0tb2ZmJztcbiAgICBjb25zdCBhbExlZCA9ICQoJ2F1dG9sb2NrLWxlZCcpO1xuICAgIGlmIChhbExlZCkge1xuICAgICAgICBhbExlZC5jbGFzc05hbWUgPSAoc3RhdGUuaGFzUGFzc3dvcmQgJiYgc3RhdGUuYXV0b0xvY2tNaW51dGVzID4gMClcbiAgICAgICAgICAgID8gJ2xlZCBsZWQtLWdyZWVuJyA6ICdsZWQgbGVkLS1vZmYnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2hvd1BhZ2VTdWNjZXNzKG1zZykge1xuICAgIHN0YXRlLnBhZ2VTdWNjZXNzID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5wYWdlU3VjY2VzcyA9ICcnOyByZW5kZXIoKTsgfSwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBMb2NrZWQgdnMgdW5sb2NrZWQgdmlld3NcbiAgICBjb25zdCBsb2NrZWRWaWV3ID0gJCgnbG9ja2VkLXZpZXcnKTtcbiAgICBjb25zdCB1bmxvY2tlZFZpZXcgPSAkKCd1bmxvY2tlZC12aWV3Jyk7XG4gICAgaWYgKGxvY2tlZFZpZXcpIGxvY2tlZFZpZXcuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmlzTG9ja2VkID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAodW5sb2NrZWRWaWV3KSB1bmxvY2tlZFZpZXcuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmlzTG9ja2VkID8gJ25vbmUnIDogJ2Jsb2NrJztcblxuICAgIC8vIFVubG9jayBlcnJvclxuICAgIGNvbnN0IHVubG9ja0VyciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGlmICh1bmxvY2tFcnIpIHsgdW5sb2NrRXJyLnRleHRDb250ZW50ID0gc3RhdGUudW5sb2NrRXJyb3I7IHVubG9ja0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudW5sb2NrRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBQYWdlLWxldmVsIHN1Y2Nlc3MgYmFubmVyXG4gICAgY29uc3QgcGFnZVN1YyA9ICQoJ3BhZ2Utc3VjY2VzcycpO1xuICAgIGlmIChwYWdlU3VjKSB7IHBhZ2VTdWMudGV4dENvbnRlbnQgPSBzdGF0ZS5wYWdlU3VjY2VzczsgcGFnZVN1Yy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucGFnZVN1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBTZWN1cml0eSBzdGF0dXNcbiAgICBjb25zdCBzZWN1cml0eVN0YXR1cyA9ICQoJ3NlY3VyaXR5LXN0YXR1cycpO1xuICAgIGlmIChzZWN1cml0eVN0YXR1cykge1xuICAgICAgICBzZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9IHN0YXRlLmhhc1Bhc3N3b3JkXG4gICAgICAgICAgICA/ICdNYXN0ZXIgcGFzc3dvcmQgaXMgYWN0aXZlIFx1MjAxNCBrZXlzIGFyZSBlbmNyeXB0ZWQgYXQgcmVzdC4nXG4gICAgICAgICAgICA6ICdObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IFx1MjAxNCBrZXlzIGFyZSBzdG9yZWQgdW5lbmNyeXB0ZWQuJztcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgc2VjdGlvbnMgYmFzZWQgb24gcGFzc3dvcmQgc3RhdGVcbiAgICBjb25zdCBzZXRTZWN0aW9uID0gJCgnc2V0LXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBjb25zdCBjaGFuZ2VTZWN0aW9uID0gJCgnY2hhbmdlLXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBpZiAoc2V0U2VjdGlvbikgc2V0U2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChjaGFuZ2VTZWN0aW9uKSBjaGFuZ2VTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBQYXNzd29yZCBzdHJlbmd0aFxuICAgIGNvbnN0IHN0cmVuZ3RoRWwgPSAkKCdwYXNzd29yZC1zdHJlbmd0aCcpO1xuICAgIGlmIChzdHJlbmd0aEVsKSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCkge1xuICAgICAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHN0YXRlLm5ld1Bhc3N3b3JkKTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVscyA9IFsnJywgJ1RvbyBzaG9ydCcsICdXZWFrJywgJ0ZhaXInLCAnU3Ryb25nJywgJ1Zlcnkgc3Ryb25nJ107XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnRleHRDb250ZW50ID0gbGFiZWxzW3N0cmVuZ3RoXSB8fCAnJztcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuY2xhc3NOYW1lID0gYGZpZWxkLWhpbnQgc3RyZW5ndGgtJHtzdHJlbmd0aH1gO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBzZXRCdG4gPSAkKCdzZXQtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHNldEJ0bikge1xuICAgICAgICBzZXRCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIHN0YXRlLm5ld1Bhc3N3b3JkID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBjaGFuZ2VCdG4gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKGNoYW5nZUJ0bikge1xuICAgICAgICBjaGFuZ2VCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLmN1cnJlbnRQYXNzd29yZC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPj0gOCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IHJlbW92ZUJ0biA9ICQoJ3JlbW92ZS1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAocmVtb3ZlQnRuKSB7XG4gICAgICAgIHJlbW92ZUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0O1xuICAgIH1cblxuICAgIC8vIElubGluZSBlcnJvciBtZXNzYWdlc1xuICAgIGNvbnN0IHNlY0VyciA9ICQoJ3NlY3VyaXR5LWVycm9yJyk7XG4gICAgaWYgKHNlY0VycikgeyBzZWNFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5zZWN1cml0eUVycm9yOyBzZWNFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlY3VyaXR5RXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3QgY2hnRXJyID0gJCgnY2hhbmdlLWVycm9yJyk7XG4gICAgaWYgKGNoZ0VycikgeyBjaGdFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5jaGFuZ2VFcnJvcjsgY2hnRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5jaGFuZ2VFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cbiAgICBjb25zdCBybUVyciA9ICQoJ3JlbW92ZS1lcnJvcicpO1xuICAgIGlmIChybUVycikgeyBybUVyci50ZXh0Q29udGVudCA9IHN0YXRlLnJlbW92ZUVycm9yOyBybUVyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucmVtb3ZlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBFbmNyeXB0aW9uIHN0YXR1cyBiYW5uZXJcbiAgICBjb25zdCBlbmNyeXB0aW9uU3RhdHVzID0gJCgnZW5jcnlwdGlvbi1zdGF0dXMnKTtcbiAgICBpZiAoZW5jcnlwdGlvblN0YXR1cykgZW5jcnlwdGlvblN0YXR1cy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnZmxleCcgOiAnbm9uZSc7XG5cbiAgICAvLyBBdXRvLWxvY2sgc2VjdGlvblxuICAgIGNvbnN0IGF1dG9sb2NrRGlzYWJsZWQgPSAkKCdhdXRvbG9jay1kaXNhYmxlZC1tc2cnKTtcbiAgICBjb25zdCBhdXRvbG9ja0NvbnRyb2xzID0gJCgnYXV0b2xvY2stY29udHJvbHMnKTtcbiAgICBpZiAoYXV0b2xvY2tEaXNhYmxlZCkgYXV0b2xvY2tEaXNhYmxlZC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChhdXRvbG9ja0NvbnRyb2xzKSBhdXRvbG9ja0NvbnRyb2xzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBjb25zdCBhdXRvbG9ja1NlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmIChhdXRvbG9ja1NlbGVjdCkgYXV0b2xvY2tTZWxlY3QudmFsdWUgPSBTdHJpbmcoc3RhdGUuYXV0b0xvY2tNaW51dGVzKTtcblxuICAgIGNvbnN0IGF1dG9sb2NrU3VjY2VzcyA9ICQoJ2F1dG9sb2NrLXN1Y2Nlc3MnKTtcbiAgICBpZiAoYXV0b2xvY2tTdWNjZXNzKSB7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy50ZXh0Q29udGVudCA9IHN0YXRlLmF1dG9sb2NrU3VjY2VzcztcbiAgICAgICAgYXV0b2xvY2tTdWNjZXNzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFRydXN0IGxhZGRlciAvIGxldmVsIG1ldGVyXG4gICAgcmVuZGVyVHJ1c3QoKTtcbn1cblxuLy8gLS0tIEhhbmRsZXJzIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2soKSB7XG4gICAgY29uc3QgcHcgPSAkKCd1bmxvY2stcGFzc3dvcmQnKT8udmFsdWU7XG4gICAgaWYgKCFwdykge1xuICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd1bmxvY2snLCBwYXlsb2FkOiBwdyB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gJyc7XG4gICAgICAgICAgICBpZiAoJCgndW5sb2NrLXBhc3N3b3JkJykpICQoJ3VubG9jay1wYXNzd29yZCcpLnZhbHVlID0gJyc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdJbnZhbGlkIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1bmxvY2suJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXRQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJyc7XG5cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdzZXRQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiBzdGF0ZS5uZXdQYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtYXN0ZXIgcGFzc3dvcmQgYWNjb3JkaW9uXG4gICAgICAgICAgICBjb25zdCBtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXN0ZXItcGFzc3dvcmQnKTtcbiAgICAgICAgICAgIGlmIChtcCAmJiBtcC5vcGVuKSBtcC5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCBzZXQuIFlvdXIga2V5cyBhcmUgbm93IGVuY3J5cHRlZCBhdCByZXN0LicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnRmFpbGVkIHRvIHNldCBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBzZXQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFuZ2VQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICcnO1xuXG4gICAgaWYgKCFzdGF0ZS5jdXJyZW50UGFzc3dvcmQpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdOZXcgcGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlICE9PSBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnTmV3IHBhc3N3b3JkcyBkbyBub3QgbWF0Y2guJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIG9sZFBhc3N3b3JkOiBzdGF0ZS5jdXJyZW50UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQ6IHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRQYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSA9ICcnO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgY2hhbmdlZCBzdWNjZXNzZnVsbHkuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVtb3ZlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAnJztcblxuICAgIGlmICghc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBjdXJyZW50IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKGF3YWl0IGluc0NvbmZpcm0oeyB0aXRsZTogJ1JlbW92ZSBtYXN0ZXItcGFzc3dvcmQgZW5jcnlwdGlvbj8nLCBib2R5OiAnWW91ciBwcml2YXRlIGtleXMgd2lsbCBiZSBzdG9yZWQgYXMgcGxhaW50ZXh0IG9uIHRoaXMgZGV2aWNlLicsIGNvbmZpcm1MYWJlbDogJ1JlbW92ZSBlbmNyeXB0aW9uJywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAncmVtb3ZlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gJyc7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCByZW1vdmVkLiBLZXlzIGFyZSBub3cgc3RvcmVkIHVuZW5jcnlwdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlbW92ZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZVZhdWx0KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QWxsRGF0YScgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHN0YXRlIGFuZCBzaG93IHNldCBwYXNzd29yZCB2aWV3XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IG51bGw7XG4gICAgICAgICAgICBzdGF0ZS5pc0J1bmtlclByb2ZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmJ1bmtlckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ1ZhdWx0IGRlbGV0ZWQuIFlvdSBjYW4gbm93IHNldCB1cCBhIG5ldyBtYXN0ZXIgcGFzc3dvcmQuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBpbnNOb3RpY2UoeyB0aXRsZTogJ1ZhdWx0IGRlbGV0aW9uIGZhaWxlZCcsIGJvZHk6IChyZXN1bHQ/LmVycm9yIHx8ICdVbmtub3duIGVycm9yJykgfSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IGluc05vdGljZSh7IHRpdGxlOiAnVmF1bHQgZGVsZXRpb24gZmFpbGVkJywgYm9keTogZS5tZXNzYWdlIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQmFja3VwRXhwb3J0KCkge1xuICAgIHN0YXRlLmJhY2t1cEVycm9yID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnYmFja3VwLmV4cG9ydCcgfSk7XG4gICAgICAgIGlmICghcmVzdWx0IHx8ICFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuYmFja3VwRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0JhY2t1cCBleHBvcnQgZmFpbGVkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0LmVudmVsb3BlLCBudWxsLCAyKTtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtqc29uXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGEuaHJlZiA9IHVybDtcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgICAgIGEuZG93bmxvYWQgPSBgbm9zdHJrZXktYmFja3VwLSR7ZGF0ZX0uanNvbmA7XG4gICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgLy8gRGVsYXkgcmV2b2tlIFx1MjAxNCBTYWZhcmkvRmlyZWZveCBjYW4gc3RhcnQgdGhlIGRvd25sb2FkIGFmdGVyIHRoaXMgdGlja1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IFVSTC5yZXZva2VPYmplY3RVUkwodXJsKSwgMTAwMDApO1xuXG4gICAgICAgIC8vIFJlY29yZCB0aGUgYmFja3VwIHNvIHRoZSB0cnVzdCBtZXRlciBjYW4gbGlnaHQgTDEgaG9uZXN0bHkuXG4gICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IERhdGUubm93KCk7XG4gICAgICAgIHRyeSB7IGF3YWl0IGFwaS5zdG9yYWdlLnNldCh7IGxhc3RCYWNrdXBBdDogc3RhdGUubGFzdEJhY2t1cEF0IH0pOyB9IGNhdGNoIHsgLyogbm9uLWZhdGFsICovIH1cbiAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdFbmNyeXB0ZWQgYmFja3VwIGRvd25sb2FkZWQuIFN0b3JlIGl0IHNvbWV3aGVyZSBzYWZlIFx1MjAxNCBpdCBuZWVkcyB5b3VyIG1hc3RlciBwYXNzd29yZCB0byByZXN0b3JlLicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuYmFja3VwRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0JhY2t1cCBleHBvcnQgZmFpbGVkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXV0b0xvY2tDaGFuZ2UoKSB7XG4gICAgY29uc3Qgc2VsZWN0ID0gJCgnYXV0b2xvY2stc2VsZWN0Jyk7XG4gICAgaWYgKCFzZWxlY3QpIHJldHVybjtcbiAgICBjb25zdCBtaW51dGVzID0gcGFyc2VJbnQoc2VsZWN0LnZhbHVlLCAxMCk7XG4gICAgc3RhdGUuYXV0b0xvY2tNaW51dGVzID0gbWludXRlcztcblxuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ3NldEF1dG9Mb2NrVGltZW91dCcsXG4gICAgICAgIHBheWxvYWQ6IG1pbnV0ZXMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBsYWJlbCA9IG1pbnV0ZXMgPT09IDAgPyAnZGlzYWJsZWQnXG4gICAgICAgIDogbWludXRlcyA9PT0gNjAgPyAnMSBob3VyJ1xuICAgICAgICA6IG1pbnV0ZXMgPT09IDE4MCA/ICczIGhvdXJzJ1xuICAgICAgICA6IGAke21pbnV0ZXN9IG1pbnV0ZXNgO1xuICAgIHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA9IG1pbnV0ZXMgPT09IDBcbiAgICAgICAgPyAnQXV0by1sb2NrIGRpc2FibGVkLidcbiAgICAgICAgOiBgQXV0by1sb2NrIHNldCB0byAke2xhYmVsfS5gO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSAnJzsgcmVuZGVyKCk7IH0sIDMwMDApO1xufVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgIC8vIENsb3NlXG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGZvcm0gc3VibWlzc2lvblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0nKS5mb3JFYWNoKGZvcm0gPT4ge1xuICAgICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgIH0pO1xuXG4gICAgLy8gVW5sb2NrXG4gICAgJCgndW5sb2NrLWZvcm0nKT8uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBoYW5kbGVVbmxvY2soKTsgfSk7XG5cbiAgICAvLyBTZXQgcGFzc3dvcmRcbiAgICAkKCduZXctcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5uZXdQYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY29uZmlybS1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnc2V0LXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNldFBhc3N3b3JkKTtcblxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgICQoJ2N1cnJlbnQtcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ25ldy1wYXNzd29yZC1jaGFuZ2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY29uZmlybS1wYXNzd29yZC1jaGFuZ2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NoYW5nZS1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDaGFuZ2VQYXNzd29yZCk7XG5cbiAgICAvLyBSZW1vdmUgcGFzc3dvcmRcbiAgICAkKCdyZW1vdmUtcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdyZW1vdmUtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlUmVtb3ZlUGFzc3dvcmQpO1xuXG4gICAgLy8gQXV0by1sb2NrXG4gICAgJCgnYXV0b2xvY2stc2VsZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKTtcblxuICAgIC8vIFRydXN0IGxhZGRlcjogZW5jcnlwdGVkIGJhY2t1cCBleHBvcnQgKEwxIGxldmVsLXVwIGFjdGlvbilcbiAgICAkKCdiYWNrdXAtZXhwb3J0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUJhY2t1cEV4cG9ydCk7XG5cbiAgICAvLyBEZWxldGUgdmF1bHQgKGZyb20gbG9ja2VkIHZpZXcpXG4gICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJ2RlbGV0ZS1jb25maXJtLWRpYWxvZycpPy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0pO1xuICAgICQoJ2NhbmNlbC1kZWxldGUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAkKCdkZWxldGUtY29uZmlybS1kaWFsb2cnKT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJykuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH0pO1xuICAgICQoJ2NvbmZpcm0tZGVsZXRlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZURlbGV0ZVZhdWx0KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBzdGF0ZS5oYXNQYXNzd29yZCA9ICEhKGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzRW5jcnlwdGVkJyB9KSk7XG4gICAgc3RhdGUuaXNMb2NrZWQgPSAhIShhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0xvY2tlZCcgfSkpO1xuICAgIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9IChhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZXRBdXRvTG9ja1RpbWVvdXQnIH0pKSA/PyAxNTtcblxuICAgIC8vIFRydXN0LWxhZGRlciBzaWduYWxzIFx1MjAxNCBlYWNoIGlzIGJlc3QtZWZmb3J0OyBhIGZhaWx1cmUganVzdCBsZWF2ZXMgdGhlXG4gICAgLy8gcnVuZyB1bmxpdCByYXRoZXIgdGhhbiBicmVha2luZyB0aGUgcGFnZS5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2V0QWN0aXZlUHJvZmlsZUluZm8nIH0pO1xuICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgc3RhdGUucHJvZmlsZU5hbWUgPSBpbmZvLm5hbWUgfHwgJyc7XG4gICAgICAgICAgICBzdGF0ZS5wcm9maWxlTnB1YiA9IGluZm8ubnB1YiB8fCAnJztcbiAgICAgICAgICAgIHN0YXRlLmlzQnVua2VyUHJvZmlsZSA9ICEhaW5mby5pc0J1bmtlcjtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJ1bmtlciA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2J1bmtlclNlcnZlci5zdGF0dXMnIH0pO1xuICAgICAgICBzdGF0ZS5idW5rZXJBY3RpdmUgPSAhIShidW5rZXIgJiYgYnVua2VyLmFjdGl2ZSk7XG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gYXdhaXQgYXBpLnN0b3JhZ2UuZ2V0KHsgbGFzdEJhY2t1cEF0OiBudWxsIH0pO1xuICAgICAgICBzdGF0ZS5sYXN0QmFja3VwQXQgPSBzdG9yZWQ/Lmxhc3RCYWNrdXBBdCB8fCBudWxsO1xuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgLy8gT3BlbiBhY2NvcmRpb24gbWF0Y2hpbmcgVVJMIGhhc2ggKGUuZy4gI21hc3Rlci1wYXNzd29yZCBvciAjYXV0b2xvY2spXG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgaWYgKGhhc2gpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaCk7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0LnRhZ05hbWUgPT09ICdERVRBSUxTJykge1xuICAgICAgICAgICAgdGFyZ2V0Lm9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRGVmYXVsdDogb3BlbiBtYXN0ZXItcGFzc3dvcmQgYWNjb3JkaW9uXG4gICAgICAgIGNvbnN0IG1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hc3Rlci1wYXNzd29yZCcpO1xuICAgICAgICBpZiAobXApIG1wLm9wZW4gPSB0cnVlO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFB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
