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
    // --- storage.session -------------------------------------------------------
    // MV3 in-memory area that survives service-worker eviction but never touches
    // disk. Null on engines that don't implement it (Safari background page,
    // older Firefox) — callers must feature-detect and fall back.
    session: _browser.storage?.session ? {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.session.get(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.session.set(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.set)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.session.remove(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.remove)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.session.clear(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.clear)(...args);
      },
      /**
       * Restrict the area to extension-privileged contexts. Chrome-only;
       * resolves harmlessly where the method is absent.
       */
      setAccessLevel(...args) {
        if (!_browser.storage.session.setAccessLevel) return Promise.resolve();
        if (!isChrome) {
          return _browser.storage.session.setAccessLevel(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.setAccessLevel)(...args);
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
    // Stranded-key signal (single channel: hasEncryptedData). strandedKeys is the
    // count of profile keys wrapped under a master password no verifier can open;
    // hasPasswordHash is whether a verifier is on disk. Both come from the
    // background module so every surface reads the same truth.
    strandedKeys: 0,
    hasPasswordHash: false,
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
    const strandedHint = $("stranded-recover-hint");
    if (strandedHint) {
      const stranded = state.strandedKeys > 0 && !state.hasPasswordHash;
      strandedHint.style.display = stranded ? "" : "none";
    }
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
      if (state.hasPassword) {
        securityStatus.textContent = "Master password is active. Your keys are encrypted at rest.";
      } else if (state.strandedKeys > 0) {
        securityStatus.textContent = "Some keys are protected by a master password that is no longer on file. Unlock to recover them with that old password.";
      } else {
        securityStatus.textContent = "No master password set. Your keys are still encrypted at rest with a device key.";
      }
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
        const skipped = Array.isArray(result.skipped) ? result.skipped.length : 0;
        if (skipped > 0) {
          showPageSuccess(`Master password changed, but ${skipped} key${skipped === 1 ? " still requires" : "s still require"} your previous password and ${skipped === 1 ? "was" : "were"} kept as-is. Remove the master password, then recover ${skipped === 1 ? "it" : "them"} with that previous password.`);
        } else {
          showPageSuccess("Master password changed successfully.");
        }
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
    if (!await insConfirm({ title: "Remove master password?", body: "Your private keys stay encrypted at rest with a device key on this device. You just will not have a master password after this.", confirmLabel: "Remove password", destructive: true })) {
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
        await refreshStrandedSignal();
        const skipped = Array.isArray(result.skipped) ? result.skipped.length : 0;
        if (skipped > 0) {
          showPageSuccess(`Master password removed, but ${skipped} key${skipped === 1 ? " is" : "s are"} protected by a different password and were kept as-is. Unlock with that password to recover ${skipped === 1 ? "it" : "them"}.`);
        } else {
          showPageSuccess("Master password removed. Your keys are now encrypted at rest with a device key.");
        }
        render();
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
  async function refreshStrandedSignal() {
    try {
      const enc = await api.runtime.sendMessage({ kind: "hasEncryptedData" });
      state.strandedKeys = enc?.strandedKeys || 0;
      state.hasPasswordHash = !!enc?.hasPasswordHash;
    } catch {
    }
  }
  async function init() {
    state.hasPassword = !!await api.runtime.sendMessage({ kind: "isEncrypted" });
    state.isLocked = !!await api.runtime.sendMessage({ kind: "isLocked" });
    state.autoLockMinutes = await api.runtime.sendMessage({ kind: "getAutoLockTimeout" }) ?? 15;
    await refreshStrandedSignal();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvc2VjdXJpdHkvc2VjdXJpdHkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zZXNzaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBNVjMgaW4tbWVtb3J5IGFyZWEgdGhhdCBzdXJ2aXZlcyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbiBidXQgbmV2ZXIgdG91Y2hlc1xuICAgIC8vIGRpc2suIE51bGwgb24gZW5naW5lcyB0aGF0IGRvbid0IGltcGxlbWVudCBpdCAoU2FmYXJpIGJhY2tncm91bmQgcGFnZSxcbiAgICAvLyBvbGRlciBGaXJlZm94KSBcdTIwMTQgY2FsbGVycyBtdXN0IGZlYXR1cmUtZGV0ZWN0IGFuZCBmYWxsIGJhY2suXG4gICAgc2Vzc2lvbjogX2Jyb3dzZXIuc3RvcmFnZT8uc2Vzc2lvbiA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRoZSBhcmVhIHRvIGV4dGVuc2lvbi1wcml2aWxlZ2VkIGNvbnRleHRzLiBDaHJvbWUtb25seTtcbiAgICAgICAgICogcmVzb2x2ZXMgaGFybWxlc3NseSB3aGVyZSB0aGUgbWV0aG9kIGlzIGFic2VudC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBpbnMtY29uZmlybS5qcyBcdTIwMTQgdGhlIHNoYXJlZCBjb25zZW50IG92ZXJsYXkgZm9yIGV4dGVuc2lvbiBwYWdlcy5cbiAqXG4gKiBPbmUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGNvbnNlbnQtc3VyZmFjZSBzdGFuZGFyZDogYSBkaW1tZWQgYmFja2Ryb3AgcGx1c1xuICogZWl0aGVyIGEgYm90dG9tIFNIRUVUIChkZWZhdWx0OyBkZXN0cnVjdGl2ZSAvIGlycmV2ZXJzaWJsZSBhY3RzKSBvciBhXG4gKiBjZW50ZXJlZCBQT1BPVkVSIChsb3ctc3Rha2VzLCByZXZlcnNpYmxlIGFjdHMpLiBSZXBsYWNlcyBuYXRpdmVcbiAqIGNvbmZpcm0oKS9hbGVydCgpIG9uIGV2ZXJ5IGV4dGVuc2lvbi1wYWdlIHN1cmZhY2UuXG4gKlxuICogICBpbnNDb25maXJtKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50IH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTxib29sZWFuPiAgICh0cnVlID0gY29uZmlybWVkOyBFc2NhcGUvYmFja2Ryb3AvY2FuY2VsID0gZmFsc2UpXG4gKiAgIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPHZvaWQ+XG4gKlxuICogU3R5bGluZyBjb21lcyBlbnRpcmVseSBmcm9tIGluc3RydW1lbnQuY3NzIChzZWN0aW9uIDE4ICsgdGhlIC5idG4gZmFtaWx5KSxcbiAqIHNvIHNraW4gLyBtb2RlIC8gY29udHJhc3QgLyBkZW5zaXR5IC8gdGV4dC1zaXplIGFycml2ZSB2aWEgdGhlIHBhZ2Unc1xuICogc3RhbXBlZCBkYXRhLWlucy0qIGF0dHJpYnV0ZXMgXHUyMDE0IG5vIHN0b3JhZ2UgYWNjZXNzLCBubyBtZXNzYWdpbmcgaGVyZS5cbiAqXG4gKiBTYWZldHk6IHRpdGxlL2JvZHkgbWF5IGNvbnRhaW4gdXNlciBkYXRhIChrZXkgbGFiZWxzLCB2YXVsdCBwYXRocyk7IHRoZSBET01cbiAqIGlzIGJ1aWx0IHdpdGggY3JlYXRlRWxlbWVudCArIHRleHRDb250ZW50IE9OTFkgXHUyMDE0IG5ldmVyIGlubmVySFRNTC5cbiAqL1xuXG4vLyBTZXJpYWxpemUgb3ZlcmxhcHBpbmcgY2FsbHMgc28gYSBzZWNvbmQgZGlhbG9nIG5ldmVyIGRvdWJsZS1yZW5kZXJzIG9uIHRvcFxuLy8gb2YgKG9yIGludGVybGVhdmVzIHdpdGgpIGFuIG9wZW4gb25lLlxubGV0IHF1ZXVlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbmxldCBpZENvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBtb3Rpb25PZmYoKSB7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5zLW1vdGlvbicpID09PSAnb2ZmJykgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEJ1aWxkLCBzaG93IGFuZCBzZXR0bGUgb25lIGRpYWxvZy4gUmVzb2x2ZXMgdHJ1ZSAoY29uZmlybSkgb3IgZmFsc2VcbiAqIChjYW5jZWwgLyBFc2NhcGUgLyBiYWNrZHJvcCBjbGljaykuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZSB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByb290LmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1yb290JztcblxuICAgICAgICBjb25zdCBiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBiYWNrZHJvcC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYmFja2Ryb3AnO1xuXG4gICAgICAgIGNvbnN0IGlzU2hlZXQgPSB2YXJpYW50ICE9PSAncG9wb3Zlcic7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaWFsb2cuY2xhc3NOYW1lID0gaXNTaGVldCA/ICdpbnMtY29uc2VudC1zaGVldCcgOiAnaW5zLWNvbnNlbnQtcG9wb3Zlcic7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAoZGVzdHJ1Y3RpdmUgfHwgbm90aWNlKSA/ICdhbGVydGRpYWxvZycgOiAnZGlhbG9nJyk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuXG4gICAgICAgIGlmIChpc1NoZWV0KSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhhbmRsZS5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtaGFuZGxlJztcbiAgICAgICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChoYW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdWlkID0gKytpZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC10aXRsZSc7XG4gICAgICAgIHRpdGxlRWwuaWQgPSBgaW5zLWNvbnNlbnQtdGl0bGUtJHt1aWR9YDtcbiAgICAgICAgdGl0bGVFbC50ZXh0Q29udGVudCA9IHRpdGxlIHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIHRpdGxlRWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGJvZHlFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgYm9keUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1ib2R5JztcbiAgICAgICAgYm9keUVsLmlkID0gYGlucy1jb25zZW50LWJvZHktJHt1aWR9YDtcbiAgICAgICAgYm9keUVsLnRleHRDb250ZW50ID0gYm9keSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGJvZHlFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCBib2R5RWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYWN0aW9ucyc7XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IFtdO1xuICAgICAgICBsZXQgY2FuY2VsQnRuID0gbnVsbDtcbiAgICAgICAgY29uc3QgY29uZmlybUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjb25maXJtQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY29uZmlybUJ0bi50ZXh0Q29udGVudCA9IGNvbmZpcm1MYWJlbDtcbiAgICAgICAgaWYgKG5vdGljZSkge1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSAnYnRuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi5jbGFzc05hbWUgPSAnYnRuIGJ0bi0tZ2hvc3QnO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gY2FuY2VsTGFiZWw7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gZGVzdHJ1Y3RpdmUgPyAnYnRuIGJ0bi0tZGVzdHJ1Y3RpdmUnIDogJ2J0biBidG4tLXByaW1hcnknO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY29uZmlybUJ0bik7XG4gICAgICAgIGJ1dHRvbnMucHVzaChjb25maXJtQnRuKTtcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoYmFja2Ryb3ApO1xuICAgICAgICByb290LmFwcGVuZENoaWxkKGRpYWxvZyk7XG5cbiAgICAgICAgbGV0IHNldHRsZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gc2V0dGxlKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZGb2N1cyAmJiB0eXBlb2YgcHJldkZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nICYmIGRvY3VtZW50LmNvbnRhaW5zKHByZXZGb2N1cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZGb2N1cy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBmb2N1cyByZXN0b3JlIGlzIGJlc3QtZWZmb3J0ICovIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG1vdGlvbk9mZigpKSBmaW5pc2goKTtcbiAgICAgICAgICAgIGVsc2Ugc2V0VGltZW91dChmaW5pc2gsIDI1MCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbktleWRvd24oZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzZXR0bGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdUYWInKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJhcCBmb2N1cyBhY3Jvc3MgdGhlIGRpYWxvZydzIGJ1dHRvbnMgb25seS5cbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJ1dHRvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBldi5zaGlmdEtleSA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBidXR0b25zWyhpZHggKyBkaXIgKyBidXR0b25zLmxlbmd0aCkgJSBidXR0b25zLmxlbmd0aF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJhY2tkcm9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGlmIChjYW5jZWxCdG4pIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKHRydWUpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290KTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAvLyBEZXN0cnVjdGl2ZSBhY3RzIHN0YXJ0IG9uIENhbmNlbCBzbyBFbnRlciBjYW4ndCBydXNoIHRoZSBkZWxldGU7XG4gICAgICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2Ugc3RhcnRzIG9uIHRoZSBjb25maXJtaW5nIGFjdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWwgPSBub3RpY2UgPyBjb25maXJtQnRuIDogKGRlc3RydWN0aXZlID8gY2FuY2VsQnRuIDogY29uZmlybUJ0bik7XG4gICAgICAgICAgICAoaW5pdGlhbCB8fCBjb25maXJtQnRuKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc0NvbmZpcm0oe1xuICAgIHRpdGxlLFxuICAgIGJvZHksXG4gICAgY29uZmlybUxhYmVsID0gJ0NvbmZpcm0nLFxuICAgIGNhbmNlbExhYmVsID0gJ0NhbmNlbCcsXG4gICAgZGVzdHJ1Y3RpdmUgPSBmYWxzZSxcbiAgICB2YXJpYW50ID0gJ3NoZWV0Jyxcbn0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlOiBmYWxzZSB9KSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsID0gJ09LJyB9ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgY29uZmlybUxhYmVsOiBkaXNtaXNzTGFiZWwsXG4gICAgICAgICAgICBjYW5jZWxMYWJlbDogJycsXG4gICAgICAgICAgICBkZXN0cnVjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB2YXJpYW50OiAnc2hlZXQnLFxuICAgICAgICAgICAgbm90aWNlOiB0cnVlLFxuICAgICAgICB9KS50aGVuKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGluc0NvbmZpcm0sIGluc05vdGljZSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgIGhhc1Bhc3N3b3JkOiBmYWxzZSxcbiAgICAvLyBTdHJhbmRlZC1rZXkgc2lnbmFsIChzaW5nbGUgY2hhbm5lbDogaGFzRW5jcnlwdGVkRGF0YSkuIHN0cmFuZGVkS2V5cyBpcyB0aGVcbiAgICAvLyBjb3VudCBvZiBwcm9maWxlIGtleXMgd3JhcHBlZCB1bmRlciBhIG1hc3RlciBwYXNzd29yZCBubyB2ZXJpZmllciBjYW4gb3BlbjtcbiAgICAvLyBoYXNQYXNzd29yZEhhc2ggaXMgd2hldGhlciBhIHZlcmlmaWVyIGlzIG9uIGRpc2suIEJvdGggY29tZSBmcm9tIHRoZVxuICAgIC8vIGJhY2tncm91bmQgbW9kdWxlIHNvIGV2ZXJ5IHN1cmZhY2UgcmVhZHMgdGhlIHNhbWUgdHJ1dGguXG4gICAgc3RyYW5kZWRLZXlzOiAwLFxuICAgIGhhc1Bhc3N3b3JkSGFzaDogZmFsc2UsXG4gICAgLy8gVW5sb2NrXG4gICAgdW5sb2NrRXJyb3I6ICcnLFxuICAgIC8vIFNldCBwYXNzd29yZFxuICAgIG5ld1Bhc3N3b3JkOiAnJyxcbiAgICBjb25maXJtUGFzc3dvcmQ6ICcnLFxuICAgIHNlY3VyaXR5RXJyb3I6ICcnLFxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgIGN1cnJlbnRQYXNzd29yZDogJycsXG4gICAgbmV3UGFzc3dvcmRDaGFuZ2U6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZENoYW5nZTogJycsXG4gICAgY2hhbmdlRXJyb3I6ICcnLFxuICAgIC8vIFJlbW92ZSBwYXNzd29yZFxuICAgIHJlbW92ZVBhc3N3b3JkSW5wdXQ6ICcnLFxuICAgIHJlbW92ZUVycm9yOiAnJyxcbiAgICAvLyBTaGFyZWQgcGFnZS1sZXZlbCBzdWNjZXNzXG4gICAgcGFnZVN1Y2Nlc3M6ICcnLFxuICAgIC8vIEF1dG8tbG9ja1xuICAgIGF1dG9Mb2NrTWludXRlczogMTUsXG4gICAgYXV0b2xvY2tTdWNjZXNzOiAnJyxcbiAgICAvLyBUcnVzdCBsYWRkZXIgKEwwXHUyMTkyTDMgbGV2ZWwtbWV0ZXIpXG4gICAgcHJvZmlsZU5hbWU6ICcnLFxuICAgIHByb2ZpbGVOcHViOiAnJyxcbiAgICBpc0J1bmtlclByb2ZpbGU6IGZhbHNlLFxuICAgIGJ1bmtlckFjdGl2ZTogZmFsc2UsXG4gICAgbGFzdEJhY2t1cEF0OiBudWxsLFxuICAgIGJhY2t1cEVycm9yOiAnJyxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHB3KSB7XG4gICAgaWYgKHB3Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHB3Lmxlbmd0aCA8IDgpIHJldHVybiAxO1xuICAgIGxldCBzY29yZSA9IDI7XG4gICAgaWYgKHB3Lmxlbmd0aCA+PSAxMikgc2NvcmUrKztcbiAgICBpZiAoL1tBLVpdLy50ZXN0KHB3KSAmJiAvW2Etel0vLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvXFxkLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICBpZiAoL1teQS1aYS16MC05XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgcmV0dXJuIE1hdGgubWluKHNjb3JlLCA1KTtcbn1cblxuLy8gLS0tIFRydXN0IGxhZGRlciAoTDAgd29ya2luZyBrZXkgXHUwMEI3IEwxIGJhY2tlZCB1cCBcdTAwQjcgTDIgZW5jcnlwdGVkK2F1dG8tbG9jayBcdTAwQjdcbi8vIEwzIHJlbW90ZSBzaWduZXIpLiBUaGUgbWV0ZXIgc2hvd3MgdGhlIEhJR0hFU1QgYWNoaWV2ZWQgbGV2ZWw7IHNraXBwZWRcbi8vIGxvd2VyIHJ1bmdzIHN0YXkgYW1iZXIgc28gdGhlIGdhcCBpcyB2aXNpYmxlIGFuZCBhY3Rpb25hYmxlLlxuZnVuY3Rpb24gdHJ1c3RBY2hpZXZlbWVudHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbDE6ICEhc3RhdGUubGFzdEJhY2t1cEF0LFxuICAgICAgICBsMjogc3RhdGUuaGFzUGFzc3dvcmQgJiYgc3RhdGUuYXV0b0xvY2tNaW51dGVzID4gMCxcbiAgICAgICAgbDM6IHN0YXRlLmJ1bmtlckFjdGl2ZSB8fCBzdGF0ZS5pc0J1bmtlclByb2ZpbGUsXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdHJ1c3RMZXZlbCgpIHtcbiAgICBjb25zdCBhID0gdHJ1c3RBY2hpZXZlbWVudHMoKTtcbiAgICBpZiAoYS5sMykgcmV0dXJuIDM7XG4gICAgaWYgKGEubDIpIHJldHVybiAyO1xuICAgIGlmIChhLmwxKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUnVuZyhuLCBhY2hpZXZlZCwgbGV2ZWwpIHtcbiAgICBjb25zdCBydW5nID0gJChgcnVuZy1sJHtufWApO1xuICAgIGNvbnN0IGxlZCA9ICQoYHJ1bmctbCR7bn0tbGVkYCk7XG4gICAgY29uc3Qgc3RhdGVFbCA9ICQoYHJ1bmctbCR7bn0tc3RhdGVgKTtcbiAgICBpZiAocnVuZykgcnVuZy5kYXRhc2V0LmFjaGlldmVkID0gYWNoaWV2ZWQgPyAndHJ1ZScgOiAnZmFsc2UnO1xuICAgIGlmIChsZWQpIHtcbiAgICAgICAgLy8gYWNoaWV2ZWQgPSBncmVlbiBMRUQgXHUwMEI3IHNraXBwZWQgKGJlbG93IGN1cnJlbnQgbGV2ZWwpID0gYW1iZXIgXHUwMEI3IG5vdFxuICAgICAgICAvLyB5ZXQgcmVhY2hlZCA9IG9mZi4gR3JlZW4gaXMgYSBzdGF0dXMgTEVEIG9ubHksIHBlciBkZXNpZ24gc3lzdGVtLlxuICAgICAgICBsZWQuY2xhc3NOYW1lID0gYWNoaWV2ZWRcbiAgICAgICAgICAgID8gJ2xlZCBsZWQtLWdyZWVuJ1xuICAgICAgICAgICAgOiAobiA8IGxldmVsID8gJ2xlZCBsZWQtLWFtYmVyJyA6ICdsZWQgbGVkLS1vZmYnKTtcbiAgICB9XG4gICAgaWYgKHN0YXRlRWwpIHN0YXRlRWwudGV4dENvbnRlbnQgPSBhY2hpZXZlZCA/ICdPSycgOiAnXHUyMDE0Jztcbn1cblxuZnVuY3Rpb24gcmVuZGVyVHJ1c3QoKSB7XG4gICAgY29uc3QgYSA9IHRydXN0QWNoaWV2ZW1lbnRzKCk7XG4gICAgY29uc3QgbGV2ZWwgPSB0cnVzdExldmVsKCk7XG5cbiAgICBjb25zdCBtZXRlciA9ICQoJ3RydXN0LW1ldGVyJyk7XG4gICAgaWYgKG1ldGVyKSB7XG4gICAgICAgIG1ldGVyLmRhdGFzZXQubGV2ZWwgPSBTdHJpbmcobGV2ZWwpO1xuICAgICAgICBtZXRlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgU2VjdXJpdHkgbGV2ZWwgJHtsZXZlbH0gb2YgM2ApO1xuICAgIH1cbiAgICBjb25zdCByZWFkb3V0ID0gJCgndHJ1c3QtbGV2ZWwtcmVhZG91dCcpO1xuICAgIGlmIChyZWFkb3V0KSByZWFkb3V0LnRleHRDb250ZW50ID0gYEwke2xldmVsfWA7XG5cbiAgICByZW5kZXJSdW5nKDEsIGEubDEsIGxldmVsKTtcbiAgICByZW5kZXJSdW5nKDIsIGEubDIsIGxldmVsKTtcbiAgICByZW5kZXJSdW5nKDMsIGEubDMsIGxldmVsKTtcblxuICAgIC8vIEwxIGxldmVsLXVwIGFjdGlvbjogZW5jcnlwdGVkIGJhY2t1cCBuZWVkcyBhIG1hc3RlciBwYXNzd29yZDsgdW50aWxcbiAgICAvLyB0aGVuLCBwb2ludCBhdCB0aGUga2V5LWV4cG9ydCBwYXRoIGluc3RlYWQgb2Ygc2hvd2luZyBhIGRlYWQgYnV0dG9uLlxuICAgIGNvbnN0IGJhY2t1cEJ0biA9ICQoJ2JhY2t1cC1leHBvcnQtYnRuJyk7XG4gICAgY29uc3QgbDFIaW50ID0gJCgncnVuZy1sMS1oaW50Jyk7XG4gICAgLyogJ2lubGluZS1mbGV4JyBtYXRjaGVzIC5idG4gYmFzZSBkaXNwbGF5IChpbnN0cnVtZW50LmNzcyk7ICcnIHdvdWxkIGxvc2VcbiAgICAgICB0byB0aGUgI2JhY2t1cC1leHBvcnQtYnRuIHN0eWxlc2hlZXQgcnVsZSB0aGF0IHJlcGxhY2VkIGl0cyBpbmxpbmUgc3R5bGUuICovXG4gICAgaWYgKGJhY2t1cEJ0bikgYmFja3VwQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdpbmxpbmUtZmxleCcgOiAnbm9uZSc7XG4gICAgaWYgKGwxSGludCkge1xuICAgICAgICBsMUhpbnQudGV4dENvbnRlbnQgPSBzdGF0ZS5oYXNQYXNzd29yZFxuICAgICAgICAgICAgPyAnTGV2ZWwgdXA6IGRvd25sb2FkIGFuIGVuY3J5cHRlZCBiYWNrdXAgb2YgeW91ciB2YXVsdCBhbmQgc3RvcmUgaXQgc29tZXdoZXJlIHNhZmUuJ1xuICAgICAgICAgICAgOiAnTGV2ZWwgdXA6IHNldCBhIG1hc3RlciBwYXNzd29yZCBmaXJzdCwgdGhlbiBkb3dubG9hZCBhbiBlbmNyeXB0ZWQgYmFja3VwIGhlcmUgXHUyMDE0IG9yIGV4cG9ydCB5b3VyIGtleSBmcm9tIHRoZSBOb3N0cktleSBwYW5lbCBhbmQgc3RvcmUgaXQgc2FmZWx5Lic7XG4gICAgfVxuICAgIGNvbnN0IGJhY2t1cEVyciA9ICQoJ2JhY2t1cC1lcnJvcicpO1xuICAgIGlmIChiYWNrdXBFcnIpIHtcbiAgICAgICAgYmFja3VwRXJyLnRleHRDb250ZW50ID0gc3RhdGUuYmFja3VwRXJyb3I7XG4gICAgICAgIGJhY2t1cEVyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuYmFja3VwRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIEwyIGFjdGlvbiByZWZpbmVtZW50OiBwYXNzd29yZCBzZXQgYnV0IGF1dG8tbG9jayBkaXNhYmxlZC5cbiAgICBjb25zdCBsMkFjdGlvbiA9ICQoJ3J1bmctbDItYWN0aW9uJyk7XG4gICAgaWYgKGwyQWN0aW9uKSB7XG4gICAgICAgIGwyQWN0aW9uLnRleHRDb250ZW50ID0gKHN0YXRlLmhhc1Bhc3N3b3JkICYmIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9PT0gMClcbiAgICAgICAgICAgID8gJ0xldmVsIHVwOiBhdXRvLWxvY2sgaXMgc2V0IHRvIE5ldmVyIFx1MjAxNCBwaWNrIGFuIGludGVydmFsIGJlbG93IHRvIHJlYWNoIEwyLidcbiAgICAgICAgICAgIDogJ0xldmVsIHVwOiBzZXQgYSBtYXN0ZXIgcGFzc3dvcmQgYmVsb3csIHRoZW4gcGljayBhbiBhdXRvLWxvY2sgaW50ZXJ2YWwuJztcbiAgICB9XG5cbiAgICAvLyBDaGFubmVsIHN0cmlwOiBpZGVudGl0eSArIHN0YXR1cyBMRUQuXG4gICAgY29uc3QgbmFtZVRleHQgPSAkKCdzdHJpcC1uYW1lLXRleHQnKTtcbiAgICBpZiAobmFtZVRleHQpIG5hbWVUZXh0LnRleHRDb250ZW50ID0gc3RhdGUucHJvZmlsZU5hbWUgfHwgJ1Byb2ZpbGUnO1xuICAgIGNvbnN0IG5wdWJFbCA9ICQoJ3N0cmlwLW5wdWInKTtcbiAgICBpZiAobnB1YkVsKSBucHViRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5wcm9maWxlTnB1YiB8fCAnbm8ga2V5IG9uIHRoaXMgcHJvZmlsZSc7XG4gICAgY29uc3Qgc3RyaXBMZWQgPSAkKCdzdHJpcC1sZWQnKTtcbiAgICBpZiAoc3RyaXBMZWQpIHtcbiAgICAgICAgc3RyaXBMZWQuY2xhc3NOYW1lID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbGVkIGxlZC0tZ3JlZW4nIDogJ2xlZCBsZWQtLWFtYmVyJztcbiAgICB9XG5cbiAgICAvLyBNb2R1bGUtaGVhZGVyIExFRHMgKG1hc3RlciBwYXNzd29yZCAvIGF1dG8tbG9jaykuXG4gICAgY29uc3QgcHdMZWQgPSAkKCdwYXNzd29yZC1sZWQnKTtcbiAgICBpZiAocHdMZWQpIHB3TGVkLmNsYXNzTmFtZSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2xlZCBsZWQtLWdyZWVuJyA6ICdsZWQgbGVkLS1vZmYnO1xuICAgIGNvbnN0IGFsTGVkID0gJCgnYXV0b2xvY2stbGVkJyk7XG4gICAgaWYgKGFsTGVkKSB7XG4gICAgICAgIGFsTGVkLmNsYXNzTmFtZSA9IChzdGF0ZS5oYXNQYXNzd29yZCAmJiBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPiAwKVxuICAgICAgICAgICAgPyAnbGVkIGxlZC0tZ3JlZW4nIDogJ2xlZCBsZWQtLW9mZic7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93UGFnZVN1Y2Nlc3MobXNnKSB7XG4gICAgc3RhdGUucGFnZVN1Y2Nlc3MgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnBhZ2VTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCA1MDAwKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIExvY2tlZCB2cyB1bmxvY2tlZCB2aWV3c1xuICAgIGNvbnN0IGxvY2tlZFZpZXcgPSAkKCdsb2NrZWQtdmlldycpO1xuICAgIGNvbnN0IHVubG9ja2VkVmlldyA9ICQoJ3VubG9ja2VkLXZpZXcnKTtcbiAgICBpZiAobG9ja2VkVmlldykgbG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmICh1bmxvY2tlZFZpZXcpIHVubG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgLy8gUmVjb3ZlciBhZmZvcmRhbmNlIGluIHRoZSBsb2NrZWQgdmlldzogb25seSB3aGVuIHRoZSBsb2NrIGlzIHJlYWxseSBhblxuICAgIC8vIG9sZC1wYXNzd29yZCBzdHJhbmRpbmcgKG5vIHZlcmlmaWVyIG9uIGRpc2spLCBuZXZlciBmb3IgYSBub3JtYWwgdmF1bHQuXG4gICAgY29uc3Qgc3RyYW5kZWRIaW50ID0gJCgnc3RyYW5kZWQtcmVjb3Zlci1oaW50Jyk7XG4gICAgaWYgKHN0cmFuZGVkSGludCkge1xuICAgICAgICBjb25zdCBzdHJhbmRlZCA9IHN0YXRlLnN0cmFuZGVkS2V5cyA+IDAgJiYgIXN0YXRlLmhhc1Bhc3N3b3JkSGFzaDtcbiAgICAgICAgc3RyYW5kZWRIaW50LnN0eWxlLmRpc3BsYXkgPSBzdHJhbmRlZCA/ICcnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFVubG9jayBlcnJvclxuICAgIGNvbnN0IHVubG9ja0VyciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGlmICh1bmxvY2tFcnIpIHsgdW5sb2NrRXJyLnRleHRDb250ZW50ID0gc3RhdGUudW5sb2NrRXJyb3I7IHVubG9ja0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudW5sb2NrRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBQYWdlLWxldmVsIHN1Y2Nlc3MgYmFubmVyXG4gICAgY29uc3QgcGFnZVN1YyA9ICQoJ3BhZ2Utc3VjY2VzcycpO1xuICAgIGlmIChwYWdlU3VjKSB7IHBhZ2VTdWMudGV4dENvbnRlbnQgPSBzdGF0ZS5wYWdlU3VjY2VzczsgcGFnZVN1Yy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucGFnZVN1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBTZWN1cml0eSBzdGF0dXNcbiAgICBjb25zdCBzZWN1cml0eVN0YXR1cyA9ICQoJ3NlY3VyaXR5LXN0YXR1cycpO1xuICAgIGlmIChzZWN1cml0eVN0YXR1cykge1xuICAgICAgICBpZiAoc3RhdGUuaGFzUGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5U3RhdHVzLnRleHRDb250ZW50ID0gJ01hc3RlciBwYXNzd29yZCBpcyBhY3RpdmUuIFlvdXIga2V5cyBhcmUgZW5jcnlwdGVkIGF0IHJlc3QuJztcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5zdHJhbmRlZEtleXMgPiAwKSB7XG4gICAgICAgICAgICAvLyBObyB2ZXJpZmllciBvbiBkaXNrLCBidXQgc29tZSBrZXlzIGFyZSBzdGlsbCB3cmFwcGVkIHVuZGVyIGEgbWFzdGVyXG4gICAgICAgICAgICAvLyBwYXNzd29yZCB0aGF0IGlzIGdvbmUuIFRoZXkgYXJlIG5laXRoZXIgb3BlbiBub3IgdW5lbmNyeXB0ZWQuXG4gICAgICAgICAgICBzZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9ICdTb21lIGtleXMgYXJlIHByb3RlY3RlZCBieSBhIG1hc3RlciBwYXNzd29yZCB0aGF0IGlzIG5vIGxvbmdlciBvbiBmaWxlLiBVbmxvY2sgdG8gcmVjb3ZlciB0aGVtIHdpdGggdGhhdCBvbGQgcGFzc3dvcmQuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFBhc3N3b3JkbGVzcyBkZWZhdWx0IGlzIE5PVCBwbGFpbnRleHQ6IGtleXMgYXJlIGRldmljZS1rZXkgZW5jcnlwdGVkLlxuICAgICAgICAgICAgc2VjdXJpdHlTdGF0dXMudGV4dENvbnRlbnQgPSAnTm8gbWFzdGVyIHBhc3N3b3JkIHNldC4gWW91ciBrZXlzIGFyZSBzdGlsbCBlbmNyeXB0ZWQgYXQgcmVzdCB3aXRoIGEgZGV2aWNlIGtleS4nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIHNlY3Rpb25zIGJhc2VkIG9uIHBhc3N3b3JkIHN0YXRlXG4gICAgY29uc3Qgc2V0U2VjdGlvbiA9ICQoJ3NldC1wYXNzd29yZC1zZWN0aW9uJyk7XG4gICAgY29uc3QgY2hhbmdlU2VjdGlvbiA9ICQoJ2NoYW5nZS1wYXNzd29yZC1zZWN0aW9uJyk7XG4gICAgaWYgKHNldFNlY3Rpb24pIHNldFNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICBpZiAoY2hhbmdlU2VjdGlvbikgY2hhbmdlU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgLy8gUGFzc3dvcmQgc3RyZW5ndGhcbiAgICBjb25zdCBzdHJlbmd0aEVsID0gJCgncGFzc3dvcmQtc3RyZW5ndGgnKTtcbiAgICBpZiAoc3RyZW5ndGhFbCkge1xuICAgICAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmVuZ3RoID0gY2FsY3VsYXRlUGFzc3dvcmRTdHJlbmd0aChzdGF0ZS5uZXdQYXNzd29yZCk7XG4gICAgICAgICAgICBjb25zdCBsYWJlbHMgPSBbJycsICdUb28gc2hvcnQnLCAnV2VhaycsICdGYWlyJywgJ1N0cm9uZycsICdWZXJ5IHN0cm9uZyddO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC50ZXh0Q29udGVudCA9IGxhYmVsc1tzdHJlbmd0aF0gfHwgJyc7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLmNsYXNzTmFtZSA9IGBmaWVsZC1oaW50IHN0cmVuZ3RoLSR7c3RyZW5ndGh9YDtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3Qgc2V0QnRuID0gJCgnc2V0LXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChzZXRCdG4pIHtcbiAgICAgICAgc2V0QnRuLmRpc2FibGVkID0gIShzdGF0ZS5uZXdQYXNzd29yZC5sZW5ndGggPj0gOCAmJiBzdGF0ZS5uZXdQYXNzd29yZCA9PT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3QgY2hhbmdlQnRuID0gJCgnY2hhbmdlLXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChjaGFuZ2VCdG4pIHtcbiAgICAgICAgY2hhbmdlQnRuLmRpc2FibGVkID0gIShzdGF0ZS5jdXJyZW50UGFzc3dvcmQubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UubGVuZ3RoID49IDggJiZcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCByZW1vdmVCdG4gPSAkKCdyZW1vdmUtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHJlbW92ZUJ0bikge1xuICAgICAgICByZW1vdmVCdG4uZGlzYWJsZWQgPSAhc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dDtcbiAgICB9XG5cbiAgICAvLyBJbmxpbmUgZXJyb3IgbWVzc2FnZXNcbiAgICBjb25zdCBzZWNFcnIgPSAkKCdzZWN1cml0eS1lcnJvcicpO1xuICAgIGlmIChzZWNFcnIpIHsgc2VjRXJyLnRleHRDb250ZW50ID0gc3RhdGUuc2VjdXJpdHlFcnJvcjsgc2VjRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5zZWN1cml0eUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuICAgIGNvbnN0IGNoZ0VyciA9ICQoJ2NoYW5nZS1lcnJvcicpO1xuICAgIGlmIChjaGdFcnIpIHsgY2hnRXJyLnRleHRDb250ZW50ID0gc3RhdGUuY2hhbmdlRXJyb3I7IGNoZ0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuY2hhbmdlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3Qgcm1FcnIgPSAkKCdyZW1vdmUtZXJyb3InKTtcbiAgICBpZiAocm1FcnIpIHsgcm1FcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5yZW1vdmVFcnJvcjsgcm1FcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnJlbW92ZUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuXG4gICAgLy8gRW5jcnlwdGlvbiBzdGF0dXMgYmFubmVyXG4gICAgY29uc3QgZW5jcnlwdGlvblN0YXR1cyA9ICQoJ2VuY3J5cHRpb24tc3RhdHVzJyk7XG4gICAgaWYgKGVuY3J5cHRpb25TdGF0dXMpIGVuY3J5cHRpb25TdGF0dXMuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2ZsZXgnIDogJ25vbmUnO1xuXG4gICAgLy8gQXV0by1sb2NrIHNlY3Rpb25cbiAgICBjb25zdCBhdXRvbG9ja0Rpc2FibGVkID0gJCgnYXV0b2xvY2stZGlzYWJsZWQtbXNnJyk7XG4gICAgY29uc3QgYXV0b2xvY2tDb250cm9scyA9ICQoJ2F1dG9sb2NrLWNvbnRyb2xzJyk7XG4gICAgaWYgKGF1dG9sb2NrRGlzYWJsZWQpIGF1dG9sb2NrRGlzYWJsZWQuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICBpZiAoYXV0b2xvY2tDb250cm9scykgYXV0b2xvY2tDb250cm9scy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgY29uc3QgYXV0b2xvY2tTZWxlY3QgPSAkKCdhdXRvbG9jay1zZWxlY3QnKTtcbiAgICBpZiAoYXV0b2xvY2tTZWxlY3QpIGF1dG9sb2NrU2VsZWN0LnZhbHVlID0gU3RyaW5nKHN0YXRlLmF1dG9Mb2NrTWludXRlcyk7XG5cbiAgICBjb25zdCBhdXRvbG9ja1N1Y2Nlc3MgPSAkKCdhdXRvbG9jay1zdWNjZXNzJyk7XG4gICAgaWYgKGF1dG9sb2NrU3VjY2Vzcykge1xuICAgICAgICBhdXRvbG9ja1N1Y2Nlc3MudGV4dENvbnRlbnQgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3M7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuYXV0b2xvY2tTdWNjZXNzID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG5cbiAgICAvLyBUcnVzdCBsYWRkZXIgLyBsZXZlbCBtZXRlclxuICAgIHJlbmRlclRydXN0KCk7XG59XG5cbi8vIC0tLSBIYW5kbGVycyAtLS1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVW5sb2NrKCkge1xuICAgIGNvbnN0IHB3ID0gJCgndW5sb2NrLXBhc3N3b3JkJyk/LnZhbHVlO1xuICAgIGlmICghcHcpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndW5sb2NrJywgcGF5bG9hZDogcHcgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICcnO1xuICAgICAgICAgICAgaWYgKCQoJ3VubG9jay1wYXNzd29yZCcpKSAkKCd1bmxvY2stcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnSW52YWxpZCBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdW5sb2NrLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2V0UGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkcyBkbyBub3QgbWF0Y2guJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnc2V0UGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUubmV3UGFzc3dvcmQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWFzdGVyIHBhc3N3b3JkIGFjY29yZGlvblxuICAgICAgICAgICAgY29uc3QgbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFzdGVyLXBhc3N3b3JkJyk7XG4gICAgICAgICAgICBpZiAobXAgJiYgbXAub3BlbikgbXAub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgc2V0LiBZb3VyIGtleXMgYXJlIG5vdyBlbmNyeXB0ZWQgYXQgcmVzdC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBzZXQgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnJztcblxuICAgIGlmICghc3RhdGUuY3VycmVudFBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnTmV3IHBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBvbGRQYXNzd29yZDogc3RhdGUuY3VycmVudFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSAnJztcbiAgICAgICAgICAgIGNvbnN0IHNraXBwZWQgPSBBcnJheS5pc0FycmF5KHJlc3VsdC5za2lwcGVkKSA/IHJlc3VsdC5za2lwcGVkLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICBpZiAoc2tpcHBlZCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBIGNoYW5nZVBhc3N3b3JkIHNraXAgaXMgb3JwaGFuZWQgdW5kZXIgdGhlIE9MRCBwYXNzd29yZCB3aXRoIGFcbiAgICAgICAgICAgICAgICAvLyBsaXZlIE5FVyB2ZXJpZmllcjogaXQgaXMgTk9UIHN0cmFuZGVkIGFuZCBjYW5ub3QgYmUgcmVjb3ZlcmVkIGJ5XG4gICAgICAgICAgICAgICAgLy8gdW5sb2NrLiBUaGUgaG9uZXN0IHBhdGggaXMgcmVtb3ZlLXRoZW4tcmVjb3Zlciwgc28gc2F5IGV4YWN0bHkgdGhhdC5cbiAgICAgICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoYE1hc3RlciBwYXNzd29yZCBjaGFuZ2VkLCBidXQgJHtza2lwcGVkfSBrZXkke3NraXBwZWQgPT09IDEgPyAnIHN0aWxsIHJlcXVpcmVzJyA6ICdzIHN0aWxsIHJlcXVpcmUnfSB5b3VyIHByZXZpb3VzIHBhc3N3b3JkIGFuZCAke3NraXBwZWQgPT09IDEgPyAnd2FzJyA6ICd3ZXJlJ30ga2VwdCBhcy1pcy4gUmVtb3ZlIHRoZSBtYXN0ZXIgcGFzc3dvcmQsIHRoZW4gcmVjb3ZlciAke3NraXBwZWQgPT09IDEgPyAnaXQnIDogJ3RoZW0nfSB3aXRoIHRoYXQgcHJldmlvdXMgcGFzc3dvcmQuYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6ICdSZW1vdmUgbWFzdGVyIHBhc3N3b3JkPycsIGJvZHk6ICdZb3VyIHByaXZhdGUga2V5cyBzdGF5IGVuY3J5cHRlZCBhdCByZXN0IHdpdGggYSBkZXZpY2Uga2V5IG9uIHRoaXMgZGV2aWNlLiBZb3UganVzdCB3aWxsIG5vdCBoYXZlIGEgbWFzdGVyIHBhc3N3b3JkIGFmdGVyIHRoaXMuJywgY29uZmlybUxhYmVsOiAnUmVtb3ZlIHBhc3N3b3JkJywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAncmVtb3ZlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gJyc7XG4gICAgICAgICAgICAvLyBSZWZyZXNoIHRoZSBzdHJhbmRlZCBzaWduYWw6IGEga2V5IHdlIGNvdWxkIG5vdCBjb252ZXJ0IGlzIG5vdyBhXG4gICAgICAgICAgICAvLyByZWNvdmVyYWJsZSBzdHJhbmRlZCBibG9iLCBhbmQgdGhlIGNvcHkgc2hvdWxkIHJlZmxlY3QgdGhhdC5cbiAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hTdHJhbmRlZFNpZ25hbCgpO1xuICAgICAgICAgICAgY29uc3Qgc2tpcHBlZCA9IEFycmF5LmlzQXJyYXkocmVzdWx0LnNraXBwZWQpID8gcmVzdWx0LnNraXBwZWQubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGlmIChza2lwcGVkID4gMCkge1xuICAgICAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcyhgTWFzdGVyIHBhc3N3b3JkIHJlbW92ZWQsIGJ1dCAke3NraXBwZWR9IGtleSR7c2tpcHBlZCA9PT0gMSA/ICcgaXMnIDogJ3MgYXJlJ30gcHJvdGVjdGVkIGJ5IGEgZGlmZmVyZW50IHBhc3N3b3JkIGFuZCB3ZXJlIGtlcHQgYXMtaXMuIFVubG9jayB3aXRoIHRoYXQgcGFzc3dvcmQgdG8gcmVjb3ZlciAke3NraXBwZWQgPT09IDEgPyAnaXQnIDogJ3RoZW0nfS5gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgcmVtb3ZlZC4gWW91ciBrZXlzIGFyZSBub3cgZW5jcnlwdGVkIGF0IHJlc3Qgd2l0aCBhIGRldmljZSBrZXkuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gcmVtb3ZlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVWYXVsdCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdyZXNldEFsbERhdGEnIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAvLyBSZXNldCBzdGF0ZSBhbmQgc2hvdyBzZXQgcGFzc3dvcmQgdmlld1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5sYXN0QmFja3VwQXQgPSBudWxsO1xuICAgICAgICAgICAgc3RhdGUuaXNCdW5rZXJQcm9maWxlID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5idW5rZXJBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdWYXVsdCBkZWxldGVkLiBZb3UgY2FuIG5vdyBzZXQgdXAgYSBuZXcgbWFzdGVyIHBhc3N3b3JkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgaW5zTm90aWNlKHsgdGl0bGU6ICdWYXVsdCBkZWxldGlvbiBmYWlsZWQnLCBib2R5OiAocmVzdWx0Py5lcnJvciB8fCAnVW5rbm93biBlcnJvcicpIH0pO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCBpbnNOb3RpY2UoeyB0aXRsZTogJ1ZhdWx0IGRlbGV0aW9uIGZhaWxlZCcsIGJvZHk6IGUubWVzc2FnZSB9KTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJhY2t1cEV4cG9ydCgpIHtcbiAgICBzdGF0ZS5iYWNrdXBFcnJvciA9ICcnO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2JhY2t1cC5leHBvcnQnIH0pO1xuICAgICAgICBpZiAoIXJlc3VsdCB8fCAhcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmJhY2t1cEVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdCYWNrdXAgZXhwb3J0IGZhaWxlZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdC5lbnZlbG9wZSwgbnVsbCwgMik7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbanNvbl0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICBhLmRvd25sb2FkID0gYG5vc3Rya2V5LWJhY2t1cC0ke2RhdGV9Lmpzb25gO1xuICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgIC8vIERlbGF5IHJldm9rZSBcdTIwMTQgU2FmYXJpL0ZpcmVmb3ggY2FuIHN0YXJ0IHRoZSBkb3dubG9hZCBhZnRlciB0aGlzIHRpY2tcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCksIDEwMDAwKTtcblxuICAgICAgICAvLyBSZWNvcmQgdGhlIGJhY2t1cCBzbyB0aGUgdHJ1c3QgbWV0ZXIgY2FuIGxpZ2h0IEwxIGhvbmVzdGx5LlxuICAgICAgICBzdGF0ZS5sYXN0QmFja3VwQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0cnkgeyBhd2FpdCBhcGkuc3RvcmFnZS5zZXQoeyBsYXN0QmFja3VwQXQ6IHN0YXRlLmxhc3RCYWNrdXBBdCB9KTsgfSBjYXRjaCB7IC8qIG5vbi1mYXRhbCAqLyB9XG4gICAgICAgIHNob3dQYWdlU3VjY2VzcygnRW5jcnlwdGVkIGJhY2t1cCBkb3dubG9hZGVkLiBTdG9yZSBpdCBzb21ld2hlcmUgc2FmZSBcdTIwMTQgaXQgbmVlZHMgeW91ciBtYXN0ZXIgcGFzc3dvcmQgdG8gcmVzdG9yZS4nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmJhY2t1cEVycm9yID0gZS5tZXNzYWdlIHx8ICdCYWNrdXAgZXhwb3J0IGZhaWxlZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKCkge1xuICAgIGNvbnN0IHNlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmICghc2VsZWN0KSByZXR1cm47XG4gICAgY29uc3QgbWludXRlcyA9IHBhcnNlSW50KHNlbGVjdC52YWx1ZSwgMTApO1xuICAgIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9IG1pbnV0ZXM7XG5cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzZXRBdXRvTG9ja1RpbWVvdXQnLFxuICAgICAgICBwYXlsb2FkOiBtaW51dGVzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGFiZWwgPSBtaW51dGVzID09PSAwID8gJ2Rpc2FibGVkJ1xuICAgICAgICA6IG1pbnV0ZXMgPT09IDYwID8gJzEgaG91cidcbiAgICAgICAgOiBtaW51dGVzID09PSAxODAgPyAnMyBob3VycydcbiAgICAgICAgOiBgJHttaW51dGVzfSBtaW51dGVzYDtcbiAgICBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSBtaW51dGVzID09PSAwXG4gICAgICAgID8gJ0F1dG8tbG9jayBkaXNhYmxlZC4nXG4gICAgICAgIDogYEF1dG8tbG9jayBzZXQgdG8gJHtsYWJlbH0uYDtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuYXV0b2xvY2tTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCAzMDAwKTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAvLyBDbG9zZVxuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBmb3JtIHN1Ym1pc3Npb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmb3JtJykuZm9yRWFjaChmb3JtID0+IHtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICB9KTtcblxuICAgIC8vIFVubG9ja1xuICAgICQoJ3VubG9jay1mb3JtJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgaGFuZGxlVW5sb2NrKCk7IH0pO1xuXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgJCgnbmV3LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ3NldC1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXRQYXNzd29yZCk7XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmRcbiAgICAkKCdjdXJyZW50LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCduZXctcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2hhbmdlUGFzc3dvcmQpO1xuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVJlbW92ZVBhc3N3b3JkKTtcblxuICAgIC8vIEF1dG8tbG9ja1xuICAgICQoJ2F1dG9sb2NrLXNlbGVjdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBdXRvTG9ja0NoYW5nZSk7XG5cbiAgICAvLyBUcnVzdCBsYWRkZXI6IGVuY3J5cHRlZCBiYWNrdXAgZXhwb3J0IChMMSBsZXZlbC11cCBhY3Rpb24pXG4gICAgJCgnYmFja3VwLWV4cG9ydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVCYWNrdXBFeHBvcnQpO1xuXG4gICAgLy8gRGVsZXRlIHZhdWx0IChmcm9tIGxvY2tlZCB2aWV3KVxuICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAkKCdkZWxldGUtY29uZmlybS1kaWFsb2cnKT8uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9KTtcbiAgICAkKCdjYW5jZWwtZGVsZXRlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnZGVsZXRlLWNvbmZpcm0tZGlhbG9nJyk/LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB9KTtcbiAgICAkKCdjb25maXJtLWRlbGV0ZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVEZWxldGVWYXVsdCk7XG59XG5cbi8vIFNpbmdsZSBzaWduYWwgY2hhbm5lbCBmb3IgdGhlIHN0cmFuZGVkLWtleSBzdGF0ZS4gQmVzdC1lZmZvcnQ6IHRoZVxuLy8gaGFzRW5jcnlwdGVkRGF0YSBoYW5kbGVyIHNlbGYtaGVhbHMgYSB2ZXJpZmllciB2YXVsdCAoYW4gaWRlbXBvdGVudCBzdG9yYWdlXG4vLyB3cml0ZSkgd2hpY2ggaXMgZXhwZWN0ZWQgYW5kIGJlbmlnbjsgYSBmYWlsdXJlIGhlcmUganVzdCBsZWF2ZXMgc3RyYW5kZWRLZXlzXG4vLyBhdCAwIHJhdGhlciB0aGFuIGJyZWFraW5nIHRoZSBwYWdlLlxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFN0cmFuZGVkU2lnbmFsKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVuYyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2hhc0VuY3J5cHRlZERhdGEnIH0pO1xuICAgICAgICBzdGF0ZS5zdHJhbmRlZEtleXMgPSBlbmM/LnN0cmFuZGVkS2V5cyB8fCAwO1xuICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZEhhc2ggPSAhIWVuYz8uaGFzUGFzc3dvcmRIYXNoO1xuICAgIH0gY2F0Y2ggeyAvKiBsZWF2ZSBzdHJhbmRlZEtleXMgYXQgMCAqLyB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgc3RhdGUuaGFzUGFzc3dvcmQgPSAhIShhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSkpO1xuICAgIHN0YXRlLmlzTG9ja2VkID0gISEoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNMb2NrZWQnIH0pKTtcbiAgICBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPSAoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2V0QXV0b0xvY2tUaW1lb3V0JyB9KSkgPz8gMTU7XG5cbiAgICBhd2FpdCByZWZyZXNoU3RyYW5kZWRTaWduYWwoKTtcblxuICAgIC8vIFRydXN0LWxhZGRlciBzaWduYWxzIFx1MjAxNCBlYWNoIGlzIGJlc3QtZWZmb3J0OyBhIGZhaWx1cmUganVzdCBsZWF2ZXMgdGhlXG4gICAgLy8gcnVuZyB1bmxpdCByYXRoZXIgdGhhbiBicmVha2luZyB0aGUgcGFnZS5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2V0QWN0aXZlUHJvZmlsZUluZm8nIH0pO1xuICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgc3RhdGUucHJvZmlsZU5hbWUgPSBpbmZvLm5hbWUgfHwgJyc7XG4gICAgICAgICAgICBzdGF0ZS5wcm9maWxlTnB1YiA9IGluZm8ubnB1YiB8fCAnJztcbiAgICAgICAgICAgIHN0YXRlLmlzQnVua2VyUHJvZmlsZSA9ICEhaW5mby5pc0J1bmtlcjtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJ1bmtlciA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2J1bmtlclNlcnZlci5zdGF0dXMnIH0pO1xuICAgICAgICBzdGF0ZS5idW5rZXJBY3RpdmUgPSAhIShidW5rZXIgJiYgYnVua2VyLmFjdGl2ZSk7XG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3RvcmVkID0gYXdhaXQgYXBpLnN0b3JhZ2UuZ2V0KHsgbGFzdEJhY2t1cEF0OiBudWxsIH0pO1xuICAgICAgICBzdGF0ZS5sYXN0QmFja3VwQXQgPSBzdG9yZWQ/Lmxhc3RCYWNrdXBBdCB8fCBudWxsO1xuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgLy8gT3BlbiBhY2NvcmRpb24gbWF0Y2hpbmcgVVJMIGhhc2ggKGUuZy4gI21hc3Rlci1wYXNzd29yZCBvciAjYXV0b2xvY2spXG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCAnJyk7XG4gICAgaWYgKGhhc2gpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaCk7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0LnRhZ05hbWUgPT09ICdERVRBSUxTJykge1xuICAgICAgICAgICAgdGFyZ2V0Lm9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRGVmYXVsdDogb3BlbiBtYXN0ZXItcGFzc3dvcmQgYWNjb3JkaW9uXG4gICAgICAgIGNvbnN0IG1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hc3Rlci1wYXNzd29yZCcpO1xuICAgICAgICBpZiAobXApIG1wLm9wZW4gPSB0cnVlO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsZUFBTyxNQUFNLFNBQVM7QUFBQSxVQUNsQixHQUFHO0FBQUEsVUFDSCxJQUFJLFdBQVc7QUFDWCxnQkFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLFdBQVc7QUFDaEQscUJBQU8sSUFBSSxNQUFNLFNBQVMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3hELE9B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
