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

  // src/utilities/page-gate.js
  var START_ERROR = "NostrKey could not start this page. Reload or reinstall.";
  var GateRefused = class extends Error {
  };
  function isRefused(answer) {
    return !!answer && typeof answer === "object" && answer.success === false;
  }
  function showStartError() {
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.dataset.startError = "";
    message.textContent = START_ERROR;
    message.style.padding = "16px";
    document.body.replaceChildren(message);
  }
  async function askGate(kind) {
    const answer = await api.runtime.sendMessage({ kind });
    if (isRefused(answer)) {
      showStartError();
      throw new GateRefused();
    }
    return answer;
  }
  async function startPage(init2) {
    try {
      await init2();
    } catch (e) {
      if (!(e instanceof GateRefused)) throw e;
    }
  }

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
      const enc = await askGate("hasEncryptedData");
      state.strandedKeys = enc?.strandedKeys || 0;
      state.hasPasswordHash = !!enc?.hasPasswordHash;
    } catch (e) {
      if (e instanceof GateRefused) throw e;
    }
  }
  async function init() {
    state.hasPassword = !!await askGate("isEncrypted");
    state.isLocked = !!await askGate("isLocked");
    state.autoLockMinutes = await askGate("getAutoLockTimeout") ?? 15;
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
  document.addEventListener("DOMContentLoaded", () => startPage(init));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvc2VjdXJpdHkvc2VjdXJpdHkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zZXNzaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBNVjMgaW4tbWVtb3J5IGFyZWEgdGhhdCBzdXJ2aXZlcyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbiBidXQgbmV2ZXIgdG91Y2hlc1xuICAgIC8vIGRpc2suIE51bGwgb24gZW5naW5lcyB0aGF0IGRvbid0IGltcGxlbWVudCBpdCAoU2FmYXJpIGJhY2tncm91bmQgcGFnZSxcbiAgICAvLyBvbGRlciBGaXJlZm94KSBcdTIwMTQgY2FsbGVycyBtdXN0IGZlYXR1cmUtZGV0ZWN0IGFuZCBmYWxsIGJhY2suXG4gICAgc2Vzc2lvbjogX2Jyb3dzZXIuc3RvcmFnZT8uc2Vzc2lvbiA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRoZSBhcmVhIHRvIGV4dGVuc2lvbi1wcml2aWxlZ2VkIGNvbnRleHRzLiBDaHJvbWUtb25seTtcbiAgICAgICAgICogcmVzb2x2ZXMgaGFybWxlc3NseSB3aGVyZSB0aGUgbWV0aG9kIGlzIGFic2VudC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBUaGUgcXVlc3Rpb25zIGEgcGFnZSBhc2tzIHRoZSB3b3JrZXIgYmVmb3JlIGl0IGNhbiBkcmF3IGFueXRoaW5nLiBUaGUgd29ya2VyXG4gKiBjYW4gYW5zd2VyIHRoZW0gd2l0aCBhIHJlZnVzYWwgb2JqZWN0LCBhbmQgYW4gb2JqZWN0IGlzIHRydXRoeSwgc28gYSBwYWdlIHRoYXRcbiAqIHJlYWRzIGl0IGFzIGEgeWVzIHNob3dzIHRoZSB3cm9uZyBzY3JlZW4uIFBhZ2VzIGFzayB0aHJvdWdoIGFza0dhdGUgaW5zdGVhZDpcbiAqIGEgcmVmdXNhbCByZXBsYWNlcyB0aGUgcGFnZSB3aXRoIGEgcGxhaW4gbWVzc2FnZSBhbmQgc3RvcHMgaXRzIHN0YXJ0LXVwLlxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmV4cG9ydCBjb25zdCBTVEFSVF9FUlJPUiA9ICdOb3N0cktleSBjb3VsZCBub3Qgc3RhcnQgdGhpcyBwYWdlLiBSZWxvYWQgb3IgcmVpbnN0YWxsLic7XG5cbmV4cG9ydCBjbGFzcyBHYXRlUmVmdXNlZCBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZnVzZWQoYW5zd2VyKSB7XG4gICAgcmV0dXJuICEhYW5zd2VyICYmIHR5cGVvZiBhbnN3ZXIgPT09ICdvYmplY3QnICYmIGFuc3dlci5zdWNjZXNzID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdGFydEVycm9yKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYWxlcnQnKTtcbiAgICBtZXNzYWdlLmRhdGFzZXQuc3RhcnRFcnJvciA9ICcnO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBTVEFSVF9FUlJPUjtcbiAgICBtZXNzYWdlLnN0eWxlLnBhZGRpbmcgPSAnMTZweCc7XG4gICAgZG9jdW1lbnQuYm9keS5yZXBsYWNlQ2hpbGRyZW4obWVzc2FnZSk7XG59XG5cbi8qKiBBc2sgdGhlIHdvcmtlci4gT24gYSByZWZ1c2FsLCBzaG93IHRoZSBtZXNzYWdlIGFuZCB0aHJvdyBHYXRlUmVmdXNlZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc2tHYXRlKGtpbmQpIHtcbiAgICBjb25zdCBhbnN3ZXIgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQgfSk7XG4gICAgaWYgKGlzUmVmdXNlZChhbnN3ZXIpKSB7XG4gICAgICAgIHNob3dTdGFydEVycm9yKCk7XG4gICAgICAgIHRocm93IG5ldyBHYXRlUmVmdXNlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gYW5zd2VyO1xufVxuXG4vKiogUnVuIGEgcGFnZSdzIHN0YXJ0LXVwLiBBIHJlZnVzYWwgaGFzIGFscmVhZHkgYmVlbiBzaG93biwgc28gaXQgZW5kcyBoZXJlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0UGFnZShpbml0KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaW5pdCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEdhdGVSZWZ1c2VkKSkgdGhyb3cgZTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBpbnMtY29uZmlybS5qcyBcdTIwMTQgdGhlIHNoYXJlZCBjb25zZW50IG92ZXJsYXkgZm9yIGV4dGVuc2lvbiBwYWdlcy5cbiAqXG4gKiBPbmUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGNvbnNlbnQtc3VyZmFjZSBzdGFuZGFyZDogYSBkaW1tZWQgYmFja2Ryb3AgcGx1c1xuICogZWl0aGVyIGEgYm90dG9tIFNIRUVUIChkZWZhdWx0OyBkZXN0cnVjdGl2ZSAvIGlycmV2ZXJzaWJsZSBhY3RzKSBvciBhXG4gKiBjZW50ZXJlZCBQT1BPVkVSIChsb3ctc3Rha2VzLCByZXZlcnNpYmxlIGFjdHMpLiBSZXBsYWNlcyBuYXRpdmVcbiAqIGNvbmZpcm0oKS9hbGVydCgpIG9uIGV2ZXJ5IGV4dGVuc2lvbi1wYWdlIHN1cmZhY2UuXG4gKlxuICogICBpbnNDb25maXJtKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50IH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTxib29sZWFuPiAgICh0cnVlID0gY29uZmlybWVkOyBFc2NhcGUvYmFja2Ryb3AvY2FuY2VsID0gZmFsc2UpXG4gKiAgIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPHZvaWQ+XG4gKlxuICogU3R5bGluZyBjb21lcyBlbnRpcmVseSBmcm9tIGluc3RydW1lbnQuY3NzIChzZWN0aW9uIDE4ICsgdGhlIC5idG4gZmFtaWx5KSxcbiAqIHNvIHNraW4gLyBtb2RlIC8gY29udHJhc3QgLyBkZW5zaXR5IC8gdGV4dC1zaXplIGFycml2ZSB2aWEgdGhlIHBhZ2Unc1xuICogc3RhbXBlZCBkYXRhLWlucy0qIGF0dHJpYnV0ZXMgXHUyMDE0IG5vIHN0b3JhZ2UgYWNjZXNzLCBubyBtZXNzYWdpbmcgaGVyZS5cbiAqXG4gKiBTYWZldHk6IHRpdGxlL2JvZHkgbWF5IGNvbnRhaW4gdXNlciBkYXRhIChrZXkgbGFiZWxzLCB2YXVsdCBwYXRocyk7IHRoZSBET01cbiAqIGlzIGJ1aWx0IHdpdGggY3JlYXRlRWxlbWVudCArIHRleHRDb250ZW50IE9OTFkgXHUyMDE0IG5ldmVyIGlubmVySFRNTC5cbiAqL1xuXG4vLyBTZXJpYWxpemUgb3ZlcmxhcHBpbmcgY2FsbHMgc28gYSBzZWNvbmQgZGlhbG9nIG5ldmVyIGRvdWJsZS1yZW5kZXJzIG9uIHRvcFxuLy8gb2YgKG9yIGludGVybGVhdmVzIHdpdGgpIGFuIG9wZW4gb25lLlxubGV0IHF1ZXVlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbmxldCBpZENvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBtb3Rpb25PZmYoKSB7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5zLW1vdGlvbicpID09PSAnb2ZmJykgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEJ1aWxkLCBzaG93IGFuZCBzZXR0bGUgb25lIGRpYWxvZy4gUmVzb2x2ZXMgdHJ1ZSAoY29uZmlybSkgb3IgZmFsc2VcbiAqIChjYW5jZWwgLyBFc2NhcGUgLyBiYWNrZHJvcCBjbGljaykuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZSB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByb290LmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1yb290JztcblxuICAgICAgICBjb25zdCBiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBiYWNrZHJvcC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYmFja2Ryb3AnO1xuXG4gICAgICAgIGNvbnN0IGlzU2hlZXQgPSB2YXJpYW50ICE9PSAncG9wb3Zlcic7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaWFsb2cuY2xhc3NOYW1lID0gaXNTaGVldCA/ICdpbnMtY29uc2VudC1zaGVldCcgOiAnaW5zLWNvbnNlbnQtcG9wb3Zlcic7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAoZGVzdHJ1Y3RpdmUgfHwgbm90aWNlKSA/ICdhbGVydGRpYWxvZycgOiAnZGlhbG9nJyk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuXG4gICAgICAgIGlmIChpc1NoZWV0KSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhhbmRsZS5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtaGFuZGxlJztcbiAgICAgICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChoYW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdWlkID0gKytpZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC10aXRsZSc7XG4gICAgICAgIHRpdGxlRWwuaWQgPSBgaW5zLWNvbnNlbnQtdGl0bGUtJHt1aWR9YDtcbiAgICAgICAgdGl0bGVFbC50ZXh0Q29udGVudCA9IHRpdGxlIHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIHRpdGxlRWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGJvZHlFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgYm9keUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1ib2R5JztcbiAgICAgICAgYm9keUVsLmlkID0gYGlucy1jb25zZW50LWJvZHktJHt1aWR9YDtcbiAgICAgICAgYm9keUVsLnRleHRDb250ZW50ID0gYm9keSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGJvZHlFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCBib2R5RWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYWN0aW9ucyc7XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IFtdO1xuICAgICAgICBsZXQgY2FuY2VsQnRuID0gbnVsbDtcbiAgICAgICAgY29uc3QgY29uZmlybUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjb25maXJtQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY29uZmlybUJ0bi50ZXh0Q29udGVudCA9IGNvbmZpcm1MYWJlbDtcbiAgICAgICAgaWYgKG5vdGljZSkge1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSAnYnRuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi5jbGFzc05hbWUgPSAnYnRuIGJ0bi0tZ2hvc3QnO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gY2FuY2VsTGFiZWw7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gZGVzdHJ1Y3RpdmUgPyAnYnRuIGJ0bi0tZGVzdHJ1Y3RpdmUnIDogJ2J0biBidG4tLXByaW1hcnknO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY29uZmlybUJ0bik7XG4gICAgICAgIGJ1dHRvbnMucHVzaChjb25maXJtQnRuKTtcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoYmFja2Ryb3ApO1xuICAgICAgICByb290LmFwcGVuZENoaWxkKGRpYWxvZyk7XG5cbiAgICAgICAgbGV0IHNldHRsZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gc2V0dGxlKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZGb2N1cyAmJiB0eXBlb2YgcHJldkZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nICYmIGRvY3VtZW50LmNvbnRhaW5zKHByZXZGb2N1cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZGb2N1cy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBmb2N1cyByZXN0b3JlIGlzIGJlc3QtZWZmb3J0ICovIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG1vdGlvbk9mZigpKSBmaW5pc2goKTtcbiAgICAgICAgICAgIGVsc2Ugc2V0VGltZW91dChmaW5pc2gsIDI1MCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbktleWRvd24oZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzZXR0bGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdUYWInKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJhcCBmb2N1cyBhY3Jvc3MgdGhlIGRpYWxvZydzIGJ1dHRvbnMgb25seS5cbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJ1dHRvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBldi5zaGlmdEtleSA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBidXR0b25zWyhpZHggKyBkaXIgKyBidXR0b25zLmxlbmd0aCkgJSBidXR0b25zLmxlbmd0aF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJhY2tkcm9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGlmIChjYW5jZWxCdG4pIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKHRydWUpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290KTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAvLyBEZXN0cnVjdGl2ZSBhY3RzIHN0YXJ0IG9uIENhbmNlbCBzbyBFbnRlciBjYW4ndCBydXNoIHRoZSBkZWxldGU7XG4gICAgICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2Ugc3RhcnRzIG9uIHRoZSBjb25maXJtaW5nIGFjdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWwgPSBub3RpY2UgPyBjb25maXJtQnRuIDogKGRlc3RydWN0aXZlID8gY2FuY2VsQnRuIDogY29uZmlybUJ0bik7XG4gICAgICAgICAgICAoaW5pdGlhbCB8fCBjb25maXJtQnRuKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc0NvbmZpcm0oe1xuICAgIHRpdGxlLFxuICAgIGJvZHksXG4gICAgY29uZmlybUxhYmVsID0gJ0NvbmZpcm0nLFxuICAgIGNhbmNlbExhYmVsID0gJ0NhbmNlbCcsXG4gICAgZGVzdHJ1Y3RpdmUgPSBmYWxzZSxcbiAgICB2YXJpYW50ID0gJ3NoZWV0Jyxcbn0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlOiBmYWxzZSB9KSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsID0gJ09LJyB9ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgY29uZmlybUxhYmVsOiBkaXNtaXNzTGFiZWwsXG4gICAgICAgICAgICBjYW5jZWxMYWJlbDogJycsXG4gICAgICAgICAgICBkZXN0cnVjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB2YXJpYW50OiAnc2hlZXQnLFxuICAgICAgICAgICAgbm90aWNlOiB0cnVlLFxuICAgICAgICB9KS50aGVuKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGFza0dhdGUsIHN0YXJ0UGFnZSwgR2F0ZVJlZnVzZWQgfSBmcm9tICcuLi91dGlsaXRpZXMvcGFnZS1nYXRlJztcbmltcG9ydCB7IGluc0NvbmZpcm0sIGluc05vdGljZSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgIGhhc1Bhc3N3b3JkOiBmYWxzZSxcbiAgICAvLyBTdHJhbmRlZC1rZXkgc2lnbmFsIChzaW5nbGUgY2hhbm5lbDogaGFzRW5jcnlwdGVkRGF0YSkuIHN0cmFuZGVkS2V5cyBpcyB0aGVcbiAgICAvLyBjb3VudCBvZiBwcm9maWxlIGtleXMgd3JhcHBlZCB1bmRlciBhIG1hc3RlciBwYXNzd29yZCBubyB2ZXJpZmllciBjYW4gb3BlbjtcbiAgICAvLyBoYXNQYXNzd29yZEhhc2ggaXMgd2hldGhlciBhIHZlcmlmaWVyIGlzIG9uIGRpc2suIEJvdGggY29tZSBmcm9tIHRoZVxuICAgIC8vIGJhY2tncm91bmQgbW9kdWxlIHNvIGV2ZXJ5IHN1cmZhY2UgcmVhZHMgdGhlIHNhbWUgdHJ1dGguXG4gICAgc3RyYW5kZWRLZXlzOiAwLFxuICAgIGhhc1Bhc3N3b3JkSGFzaDogZmFsc2UsXG4gICAgLy8gVW5sb2NrXG4gICAgdW5sb2NrRXJyb3I6ICcnLFxuICAgIC8vIFNldCBwYXNzd29yZFxuICAgIG5ld1Bhc3N3b3JkOiAnJyxcbiAgICBjb25maXJtUGFzc3dvcmQ6ICcnLFxuICAgIHNlY3VyaXR5RXJyb3I6ICcnLFxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgIGN1cnJlbnRQYXNzd29yZDogJycsXG4gICAgbmV3UGFzc3dvcmRDaGFuZ2U6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZENoYW5nZTogJycsXG4gICAgY2hhbmdlRXJyb3I6ICcnLFxuICAgIC8vIFJlbW92ZSBwYXNzd29yZFxuICAgIHJlbW92ZVBhc3N3b3JkSW5wdXQ6ICcnLFxuICAgIHJlbW92ZUVycm9yOiAnJyxcbiAgICAvLyBTaGFyZWQgcGFnZS1sZXZlbCBzdWNjZXNzXG4gICAgcGFnZVN1Y2Nlc3M6ICcnLFxuICAgIC8vIEF1dG8tbG9ja1xuICAgIGF1dG9Mb2NrTWludXRlczogMTUsXG4gICAgYXV0b2xvY2tTdWNjZXNzOiAnJyxcbiAgICAvLyBUcnVzdCBsYWRkZXIgKEwwXHUyMTkyTDMgbGV2ZWwtbWV0ZXIpXG4gICAgcHJvZmlsZU5hbWU6ICcnLFxuICAgIHByb2ZpbGVOcHViOiAnJyxcbiAgICBpc0J1bmtlclByb2ZpbGU6IGZhbHNlLFxuICAgIGJ1bmtlckFjdGl2ZTogZmFsc2UsXG4gICAgbGFzdEJhY2t1cEF0OiBudWxsLFxuICAgIGJhY2t1cEVycm9yOiAnJyxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHB3KSB7XG4gICAgaWYgKHB3Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHB3Lmxlbmd0aCA8IDgpIHJldHVybiAxO1xuICAgIGxldCBzY29yZSA9IDI7XG4gICAgaWYgKHB3Lmxlbmd0aCA+PSAxMikgc2NvcmUrKztcbiAgICBpZiAoL1tBLVpdLy50ZXN0KHB3KSAmJiAvW2Etel0vLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvXFxkLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICBpZiAoL1teQS1aYS16MC05XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgcmV0dXJuIE1hdGgubWluKHNjb3JlLCA1KTtcbn1cblxuLy8gLS0tIFRydXN0IGxhZGRlciAoTDAgd29ya2luZyBrZXkgXHUwMEI3IEwxIGJhY2tlZCB1cCBcdTAwQjcgTDIgZW5jcnlwdGVkK2F1dG8tbG9jayBcdTAwQjdcbi8vIEwzIHJlbW90ZSBzaWduZXIpLiBUaGUgbWV0ZXIgc2hvd3MgdGhlIEhJR0hFU1QgYWNoaWV2ZWQgbGV2ZWw7IHNraXBwZWRcbi8vIGxvd2VyIHJ1bmdzIHN0YXkgYW1iZXIgc28gdGhlIGdhcCBpcyB2aXNpYmxlIGFuZCBhY3Rpb25hYmxlLlxuZnVuY3Rpb24gdHJ1c3RBY2hpZXZlbWVudHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbDE6ICEhc3RhdGUubGFzdEJhY2t1cEF0LFxuICAgICAgICBsMjogc3RhdGUuaGFzUGFzc3dvcmQgJiYgc3RhdGUuYXV0b0xvY2tNaW51dGVzID4gMCxcbiAgICAgICAgbDM6IHN0YXRlLmJ1bmtlckFjdGl2ZSB8fCBzdGF0ZS5pc0J1bmtlclByb2ZpbGUsXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gdHJ1c3RMZXZlbCgpIHtcbiAgICBjb25zdCBhID0gdHJ1c3RBY2hpZXZlbWVudHMoKTtcbiAgICBpZiAoYS5sMykgcmV0dXJuIDM7XG4gICAgaWYgKGEubDIpIHJldHVybiAyO1xuICAgIGlmIChhLmwxKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUnVuZyhuLCBhY2hpZXZlZCwgbGV2ZWwpIHtcbiAgICBjb25zdCBydW5nID0gJChgcnVuZy1sJHtufWApO1xuICAgIGNvbnN0IGxlZCA9ICQoYHJ1bmctbCR7bn0tbGVkYCk7XG4gICAgY29uc3Qgc3RhdGVFbCA9ICQoYHJ1bmctbCR7bn0tc3RhdGVgKTtcbiAgICBpZiAocnVuZykgcnVuZy5kYXRhc2V0LmFjaGlldmVkID0gYWNoaWV2ZWQgPyAndHJ1ZScgOiAnZmFsc2UnO1xuICAgIGlmIChsZWQpIHtcbiAgICAgICAgLy8gYWNoaWV2ZWQgPSBncmVlbiBMRUQgXHUwMEI3IHNraXBwZWQgKGJlbG93IGN1cnJlbnQgbGV2ZWwpID0gYW1iZXIgXHUwMEI3IG5vdFxuICAgICAgICAvLyB5ZXQgcmVhY2hlZCA9IG9mZi4gR3JlZW4gaXMgYSBzdGF0dXMgTEVEIG9ubHksIHBlciBkZXNpZ24gc3lzdGVtLlxuICAgICAgICBsZWQuY2xhc3NOYW1lID0gYWNoaWV2ZWRcbiAgICAgICAgICAgID8gJ2xlZCBsZWQtLWdyZWVuJ1xuICAgICAgICAgICAgOiAobiA8IGxldmVsID8gJ2xlZCBsZWQtLWFtYmVyJyA6ICdsZWQgbGVkLS1vZmYnKTtcbiAgICB9XG4gICAgaWYgKHN0YXRlRWwpIHN0YXRlRWwudGV4dENvbnRlbnQgPSBhY2hpZXZlZCA/ICdPSycgOiAnXHUyMDE0Jztcbn1cblxuZnVuY3Rpb24gcmVuZGVyVHJ1c3QoKSB7XG4gICAgY29uc3QgYSA9IHRydXN0QWNoaWV2ZW1lbnRzKCk7XG4gICAgY29uc3QgbGV2ZWwgPSB0cnVzdExldmVsKCk7XG5cbiAgICBjb25zdCBtZXRlciA9ICQoJ3RydXN0LW1ldGVyJyk7XG4gICAgaWYgKG1ldGVyKSB7XG4gICAgICAgIG1ldGVyLmRhdGFzZXQubGV2ZWwgPSBTdHJpbmcobGV2ZWwpO1xuICAgICAgICBtZXRlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBgU2VjdXJpdHkgbGV2ZWwgJHtsZXZlbH0gb2YgM2ApO1xuICAgIH1cbiAgICBjb25zdCByZWFkb3V0ID0gJCgndHJ1c3QtbGV2ZWwtcmVhZG91dCcpO1xuICAgIGlmIChyZWFkb3V0KSByZWFkb3V0LnRleHRDb250ZW50ID0gYEwke2xldmVsfWA7XG5cbiAgICByZW5kZXJSdW5nKDEsIGEubDEsIGxldmVsKTtcbiAgICByZW5kZXJSdW5nKDIsIGEubDIsIGxldmVsKTtcbiAgICByZW5kZXJSdW5nKDMsIGEubDMsIGxldmVsKTtcblxuICAgIC8vIEwxIGxldmVsLXVwIGFjdGlvbjogZW5jcnlwdGVkIGJhY2t1cCBuZWVkcyBhIG1hc3RlciBwYXNzd29yZDsgdW50aWxcbiAgICAvLyB0aGVuLCBwb2ludCBhdCB0aGUga2V5LWV4cG9ydCBwYXRoIGluc3RlYWQgb2Ygc2hvd2luZyBhIGRlYWQgYnV0dG9uLlxuICAgIGNvbnN0IGJhY2t1cEJ0biA9ICQoJ2JhY2t1cC1leHBvcnQtYnRuJyk7XG4gICAgY29uc3QgbDFIaW50ID0gJCgncnVuZy1sMS1oaW50Jyk7XG4gICAgLyogJ2lubGluZS1mbGV4JyBtYXRjaGVzIC5idG4gYmFzZSBkaXNwbGF5IChpbnN0cnVtZW50LmNzcyk7ICcnIHdvdWxkIGxvc2VcbiAgICAgICB0byB0aGUgI2JhY2t1cC1leHBvcnQtYnRuIHN0eWxlc2hlZXQgcnVsZSB0aGF0IHJlcGxhY2VkIGl0cyBpbmxpbmUgc3R5bGUuICovXG4gICAgaWYgKGJhY2t1cEJ0bikgYmFja3VwQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdpbmxpbmUtZmxleCcgOiAnbm9uZSc7XG4gICAgaWYgKGwxSGludCkge1xuICAgICAgICBsMUhpbnQudGV4dENvbnRlbnQgPSBzdGF0ZS5oYXNQYXNzd29yZFxuICAgICAgICAgICAgPyAnTGV2ZWwgdXA6IGRvd25sb2FkIGFuIGVuY3J5cHRlZCBiYWNrdXAgb2YgeW91ciB2YXVsdCBhbmQgc3RvcmUgaXQgc29tZXdoZXJlIHNhZmUuJ1xuICAgICAgICAgICAgOiAnTGV2ZWwgdXA6IHNldCBhIG1hc3RlciBwYXNzd29yZCBmaXJzdCwgdGhlbiBkb3dubG9hZCBhbiBlbmNyeXB0ZWQgYmFja3VwIGhlcmUgXHUyMDE0IG9yIGV4cG9ydCB5b3VyIGtleSBmcm9tIHRoZSBOb3N0cktleSBwYW5lbCBhbmQgc3RvcmUgaXQgc2FmZWx5Lic7XG4gICAgfVxuICAgIGNvbnN0IGJhY2t1cEVyciA9ICQoJ2JhY2t1cC1lcnJvcicpO1xuICAgIGlmIChiYWNrdXBFcnIpIHtcbiAgICAgICAgYmFja3VwRXJyLnRleHRDb250ZW50ID0gc3RhdGUuYmFja3VwRXJyb3I7XG4gICAgICAgIGJhY2t1cEVyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuYmFja3VwRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIEwyIGFjdGlvbiByZWZpbmVtZW50OiBwYXNzd29yZCBzZXQgYnV0IGF1dG8tbG9jayBkaXNhYmxlZC5cbiAgICBjb25zdCBsMkFjdGlvbiA9ICQoJ3J1bmctbDItYWN0aW9uJyk7XG4gICAgaWYgKGwyQWN0aW9uKSB7XG4gICAgICAgIGwyQWN0aW9uLnRleHRDb250ZW50ID0gKHN0YXRlLmhhc1Bhc3N3b3JkICYmIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9PT0gMClcbiAgICAgICAgICAgID8gJ0xldmVsIHVwOiBhdXRvLWxvY2sgaXMgc2V0IHRvIE5ldmVyIFx1MjAxNCBwaWNrIGFuIGludGVydmFsIGJlbG93IHRvIHJlYWNoIEwyLidcbiAgICAgICAgICAgIDogJ0xldmVsIHVwOiBzZXQgYSBtYXN0ZXIgcGFzc3dvcmQgYmVsb3csIHRoZW4gcGljayBhbiBhdXRvLWxvY2sgaW50ZXJ2YWwuJztcbiAgICB9XG5cbiAgICAvLyBDaGFubmVsIHN0cmlwOiBpZGVudGl0eSArIHN0YXR1cyBMRUQuXG4gICAgY29uc3QgbmFtZVRleHQgPSAkKCdzdHJpcC1uYW1lLXRleHQnKTtcbiAgICBpZiAobmFtZVRleHQpIG5hbWVUZXh0LnRleHRDb250ZW50ID0gc3RhdGUucHJvZmlsZU5hbWUgfHwgJ1Byb2ZpbGUnO1xuICAgIGNvbnN0IG5wdWJFbCA9ICQoJ3N0cmlwLW5wdWInKTtcbiAgICBpZiAobnB1YkVsKSBucHViRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5wcm9maWxlTnB1YiB8fCAnbm8ga2V5IG9uIHRoaXMgcHJvZmlsZSc7XG4gICAgY29uc3Qgc3RyaXBMZWQgPSAkKCdzdHJpcC1sZWQnKTtcbiAgICBpZiAoc3RyaXBMZWQpIHtcbiAgICAgICAgc3RyaXBMZWQuY2xhc3NOYW1lID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbGVkIGxlZC0tZ3JlZW4nIDogJ2xlZCBsZWQtLWFtYmVyJztcbiAgICB9XG5cbiAgICAvLyBNb2R1bGUtaGVhZGVyIExFRHMgKG1hc3RlciBwYXNzd29yZCAvIGF1dG8tbG9jaykuXG4gICAgY29uc3QgcHdMZWQgPSAkKCdwYXNzd29yZC1sZWQnKTtcbiAgICBpZiAocHdMZWQpIHB3TGVkLmNsYXNzTmFtZSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2xlZCBsZWQtLWdyZWVuJyA6ICdsZWQgbGVkLS1vZmYnO1xuICAgIGNvbnN0IGFsTGVkID0gJCgnYXV0b2xvY2stbGVkJyk7XG4gICAgaWYgKGFsTGVkKSB7XG4gICAgICAgIGFsTGVkLmNsYXNzTmFtZSA9IChzdGF0ZS5oYXNQYXNzd29yZCAmJiBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPiAwKVxuICAgICAgICAgICAgPyAnbGVkIGxlZC0tZ3JlZW4nIDogJ2xlZCBsZWQtLW9mZic7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93UGFnZVN1Y2Nlc3MobXNnKSB7XG4gICAgc3RhdGUucGFnZVN1Y2Nlc3MgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnBhZ2VTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCA1MDAwKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIExvY2tlZCB2cyB1bmxvY2tlZCB2aWV3c1xuICAgIGNvbnN0IGxvY2tlZFZpZXcgPSAkKCdsb2NrZWQtdmlldycpO1xuICAgIGNvbnN0IHVubG9ja2VkVmlldyA9ICQoJ3VubG9ja2VkLXZpZXcnKTtcbiAgICBpZiAobG9ja2VkVmlldykgbG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmICh1bmxvY2tlZFZpZXcpIHVubG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgLy8gUmVjb3ZlciBhZmZvcmRhbmNlIGluIHRoZSBsb2NrZWQgdmlldzogb25seSB3aGVuIHRoZSBsb2NrIGlzIHJlYWxseSBhblxuICAgIC8vIG9sZC1wYXNzd29yZCBzdHJhbmRpbmcgKG5vIHZlcmlmaWVyIG9uIGRpc2spLCBuZXZlciBmb3IgYSBub3JtYWwgdmF1bHQuXG4gICAgY29uc3Qgc3RyYW5kZWRIaW50ID0gJCgnc3RyYW5kZWQtcmVjb3Zlci1oaW50Jyk7XG4gICAgaWYgKHN0cmFuZGVkSGludCkge1xuICAgICAgICBjb25zdCBzdHJhbmRlZCA9IHN0YXRlLnN0cmFuZGVkS2V5cyA+IDAgJiYgIXN0YXRlLmhhc1Bhc3N3b3JkSGFzaDtcbiAgICAgICAgc3RyYW5kZWRIaW50LnN0eWxlLmRpc3BsYXkgPSBzdHJhbmRlZCA/ICcnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFVubG9jayBlcnJvclxuICAgIGNvbnN0IHVubG9ja0VyciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGlmICh1bmxvY2tFcnIpIHsgdW5sb2NrRXJyLnRleHRDb250ZW50ID0gc3RhdGUudW5sb2NrRXJyb3I7IHVubG9ja0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudW5sb2NrRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBQYWdlLWxldmVsIHN1Y2Nlc3MgYmFubmVyXG4gICAgY29uc3QgcGFnZVN1YyA9ICQoJ3BhZ2Utc3VjY2VzcycpO1xuICAgIGlmIChwYWdlU3VjKSB7IHBhZ2VTdWMudGV4dENvbnRlbnQgPSBzdGF0ZS5wYWdlU3VjY2VzczsgcGFnZVN1Yy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucGFnZVN1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBTZWN1cml0eSBzdGF0dXNcbiAgICBjb25zdCBzZWN1cml0eVN0YXR1cyA9ICQoJ3NlY3VyaXR5LXN0YXR1cycpO1xuICAgIGlmIChzZWN1cml0eVN0YXR1cykge1xuICAgICAgICBpZiAoc3RhdGUuaGFzUGFzc3dvcmQpIHtcbiAgICAgICAgICAgIHNlY3VyaXR5U3RhdHVzLnRleHRDb250ZW50ID0gJ01hc3RlciBwYXNzd29yZCBpcyBhY3RpdmUuIFlvdXIga2V5cyBhcmUgZW5jcnlwdGVkIGF0IHJlc3QuJztcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZS5zdHJhbmRlZEtleXMgPiAwKSB7XG4gICAgICAgICAgICAvLyBObyB2ZXJpZmllciBvbiBkaXNrLCBidXQgc29tZSBrZXlzIGFyZSBzdGlsbCB3cmFwcGVkIHVuZGVyIGEgbWFzdGVyXG4gICAgICAgICAgICAvLyBwYXNzd29yZCB0aGF0IGlzIGdvbmUuIFRoZXkgYXJlIG5laXRoZXIgb3BlbiBub3IgdW5lbmNyeXB0ZWQuXG4gICAgICAgICAgICBzZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9ICdTb21lIGtleXMgYXJlIHByb3RlY3RlZCBieSBhIG1hc3RlciBwYXNzd29yZCB0aGF0IGlzIG5vIGxvbmdlciBvbiBmaWxlLiBVbmxvY2sgdG8gcmVjb3ZlciB0aGVtIHdpdGggdGhhdCBvbGQgcGFzc3dvcmQuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFBhc3N3b3JkbGVzcyBkZWZhdWx0IGlzIE5PVCBwbGFpbnRleHQ6IGtleXMgYXJlIGRldmljZS1rZXkgZW5jcnlwdGVkLlxuICAgICAgICAgICAgc2VjdXJpdHlTdGF0dXMudGV4dENvbnRlbnQgPSAnTm8gbWFzdGVyIHBhc3N3b3JkIHNldC4gWW91ciBrZXlzIGFyZSBzdGlsbCBlbmNyeXB0ZWQgYXQgcmVzdCB3aXRoIGEgZGV2aWNlIGtleS4nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVG9nZ2xlIHNlY3Rpb25zIGJhc2VkIG9uIHBhc3N3b3JkIHN0YXRlXG4gICAgY29uc3Qgc2V0U2VjdGlvbiA9ICQoJ3NldC1wYXNzd29yZC1zZWN0aW9uJyk7XG4gICAgY29uc3QgY2hhbmdlU2VjdGlvbiA9ICQoJ2NoYW5nZS1wYXNzd29yZC1zZWN0aW9uJyk7XG4gICAgaWYgKHNldFNlY3Rpb24pIHNldFNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICBpZiAoY2hhbmdlU2VjdGlvbikgY2hhbmdlU2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgLy8gUGFzc3dvcmQgc3RyZW5ndGhcbiAgICBjb25zdCBzdHJlbmd0aEVsID0gJCgncGFzc3dvcmQtc3RyZW5ndGgnKTtcbiAgICBpZiAoc3RyZW5ndGhFbCkge1xuICAgICAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmVuZ3RoID0gY2FsY3VsYXRlUGFzc3dvcmRTdHJlbmd0aChzdGF0ZS5uZXdQYXNzd29yZCk7XG4gICAgICAgICAgICBjb25zdCBsYWJlbHMgPSBbJycsICdUb28gc2hvcnQnLCAnV2VhaycsICdGYWlyJywgJ1N0cm9uZycsICdWZXJ5IHN0cm9uZyddO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC50ZXh0Q29udGVudCA9IGxhYmVsc1tzdHJlbmd0aF0gfHwgJyc7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLmNsYXNzTmFtZSA9IGBmaWVsZC1oaW50IHN0cmVuZ3RoLSR7c3RyZW5ndGh9YDtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3Qgc2V0QnRuID0gJCgnc2V0LXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChzZXRCdG4pIHtcbiAgICAgICAgc2V0QnRuLmRpc2FibGVkID0gIShzdGF0ZS5uZXdQYXNzd29yZC5sZW5ndGggPj0gOCAmJiBzdGF0ZS5uZXdQYXNzd29yZCA9PT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3QgY2hhbmdlQnRuID0gJCgnY2hhbmdlLXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChjaGFuZ2VCdG4pIHtcbiAgICAgICAgY2hhbmdlQnRuLmRpc2FibGVkID0gIShzdGF0ZS5jdXJyZW50UGFzc3dvcmQubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UubGVuZ3RoID49IDggJiZcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCByZW1vdmVCdG4gPSAkKCdyZW1vdmUtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHJlbW92ZUJ0bikge1xuICAgICAgICByZW1vdmVCdG4uZGlzYWJsZWQgPSAhc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dDtcbiAgICB9XG5cbiAgICAvLyBJbmxpbmUgZXJyb3IgbWVzc2FnZXNcbiAgICBjb25zdCBzZWNFcnIgPSAkKCdzZWN1cml0eS1lcnJvcicpO1xuICAgIGlmIChzZWNFcnIpIHsgc2VjRXJyLnRleHRDb250ZW50ID0gc3RhdGUuc2VjdXJpdHlFcnJvcjsgc2VjRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5zZWN1cml0eUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuICAgIGNvbnN0IGNoZ0VyciA9ICQoJ2NoYW5nZS1lcnJvcicpO1xuICAgIGlmIChjaGdFcnIpIHsgY2hnRXJyLnRleHRDb250ZW50ID0gc3RhdGUuY2hhbmdlRXJyb3I7IGNoZ0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuY2hhbmdlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3Qgcm1FcnIgPSAkKCdyZW1vdmUtZXJyb3InKTtcbiAgICBpZiAocm1FcnIpIHsgcm1FcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5yZW1vdmVFcnJvcjsgcm1FcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnJlbW92ZUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuXG4gICAgLy8gRW5jcnlwdGlvbiBzdGF0dXMgYmFubmVyXG4gICAgY29uc3QgZW5jcnlwdGlvblN0YXR1cyA9ICQoJ2VuY3J5cHRpb24tc3RhdHVzJyk7XG4gICAgaWYgKGVuY3J5cHRpb25TdGF0dXMpIGVuY3J5cHRpb25TdGF0dXMuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2ZsZXgnIDogJ25vbmUnO1xuXG4gICAgLy8gQXV0by1sb2NrIHNlY3Rpb25cbiAgICBjb25zdCBhdXRvbG9ja0Rpc2FibGVkID0gJCgnYXV0b2xvY2stZGlzYWJsZWQtbXNnJyk7XG4gICAgY29uc3QgYXV0b2xvY2tDb250cm9scyA9ICQoJ2F1dG9sb2NrLWNvbnRyb2xzJyk7XG4gICAgaWYgKGF1dG9sb2NrRGlzYWJsZWQpIGF1dG9sb2NrRGlzYWJsZWQuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ25vbmUnIDogJ2Jsb2NrJztcbiAgICBpZiAoYXV0b2xvY2tDb250cm9scykgYXV0b2xvY2tDb250cm9scy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgY29uc3QgYXV0b2xvY2tTZWxlY3QgPSAkKCdhdXRvbG9jay1zZWxlY3QnKTtcbiAgICBpZiAoYXV0b2xvY2tTZWxlY3QpIGF1dG9sb2NrU2VsZWN0LnZhbHVlID0gU3RyaW5nKHN0YXRlLmF1dG9Mb2NrTWludXRlcyk7XG5cbiAgICBjb25zdCBhdXRvbG9ja1N1Y2Nlc3MgPSAkKCdhdXRvbG9jay1zdWNjZXNzJyk7XG4gICAgaWYgKGF1dG9sb2NrU3VjY2Vzcykge1xuICAgICAgICBhdXRvbG9ja1N1Y2Nlc3MudGV4dENvbnRlbnQgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3M7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuYXV0b2xvY2tTdWNjZXNzID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG5cbiAgICAvLyBUcnVzdCBsYWRkZXIgLyBsZXZlbCBtZXRlclxuICAgIHJlbmRlclRydXN0KCk7XG59XG5cbi8vIC0tLSBIYW5kbGVycyAtLS1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlVW5sb2NrKCkge1xuICAgIGNvbnN0IHB3ID0gJCgndW5sb2NrLXBhc3N3b3JkJyk/LnZhbHVlO1xuICAgIGlmICghcHcpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndW5sb2NrJywgcGF5bG9hZDogcHcgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICcnO1xuICAgICAgICAgICAgaWYgKCQoJ3VubG9jay1wYXNzd29yZCcpKSAkKCd1bmxvY2stcGFzc3dvcmQnKS52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnSW52YWxpZCBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdW5sb2NrLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlU2V0UGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkcyBkbyBub3QgbWF0Y2guJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnc2V0UGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUubmV3UGFzc3dvcmQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IHRydWU7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICAvLyBDbG9zZSB0aGUgbWFzdGVyIHBhc3N3b3JkIGFjY29yZGlvblxuICAgICAgICAgICAgY29uc3QgbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFzdGVyLXBhc3N3b3JkJyk7XG4gICAgICAgICAgICBpZiAobXAgJiYgbXAub3BlbikgbXAub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgc2V0LiBZb3VyIGtleXMgYXJlIG5vdyBlbmNyeXB0ZWQgYXQgcmVzdC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBzZXQgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnJztcblxuICAgIGlmICghc3RhdGUuY3VycmVudFBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnTmV3IHBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBvbGRQYXNzd29yZDogc3RhdGUuY3VycmVudFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSAnJztcbiAgICAgICAgICAgIGNvbnN0IHNraXBwZWQgPSBBcnJheS5pc0FycmF5KHJlc3VsdC5za2lwcGVkKSA/IHJlc3VsdC5za2lwcGVkLmxlbmd0aCA6IDA7XG4gICAgICAgICAgICBpZiAoc2tpcHBlZCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyBBIGNoYW5nZVBhc3N3b3JkIHNraXAgaXMgb3JwaGFuZWQgdW5kZXIgdGhlIE9MRCBwYXNzd29yZCB3aXRoIGFcbiAgICAgICAgICAgICAgICAvLyBsaXZlIE5FVyB2ZXJpZmllcjogaXQgaXMgTk9UIHN0cmFuZGVkIGFuZCBjYW5ub3QgYmUgcmVjb3ZlcmVkIGJ5XG4gICAgICAgICAgICAgICAgLy8gdW5sb2NrLiBUaGUgaG9uZXN0IHBhdGggaXMgcmVtb3ZlLXRoZW4tcmVjb3Zlciwgc28gc2F5IGV4YWN0bHkgdGhhdC5cbiAgICAgICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoYE1hc3RlciBwYXNzd29yZCBjaGFuZ2VkLCBidXQgJHtza2lwcGVkfSBrZXkke3NraXBwZWQgPT09IDEgPyAnIHN0aWxsIHJlcXVpcmVzJyA6ICdzIHN0aWxsIHJlcXVpcmUnfSB5b3VyIHByZXZpb3VzIHBhc3N3b3JkIGFuZCAke3NraXBwZWQgPT09IDEgPyAnd2FzJyA6ICd3ZXJlJ30ga2VwdCBhcy1pcy4gUmVtb3ZlIHRoZSBtYXN0ZXIgcGFzc3dvcmQsIHRoZW4gcmVjb3ZlciAke3NraXBwZWQgPT09IDEgPyAnaXQnIDogJ3RoZW0nfSB3aXRoIHRoYXQgcHJldmlvdXMgcGFzc3dvcmQuYCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5LicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6ICdSZW1vdmUgbWFzdGVyIHBhc3N3b3JkPycsIGJvZHk6ICdZb3VyIHByaXZhdGUga2V5cyBzdGF5IGVuY3J5cHRlZCBhdCByZXN0IHdpdGggYSBkZXZpY2Uga2V5IG9uIHRoaXMgZGV2aWNlLiBZb3UganVzdCB3aWxsIG5vdCBoYXZlIGEgbWFzdGVyIHBhc3N3b3JkIGFmdGVyIHRoaXMuJywgY29uZmlybUxhYmVsOiAnUmVtb3ZlIHBhc3N3b3JkJywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAncmVtb3ZlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gJyc7XG4gICAgICAgICAgICAvLyBSZWZyZXNoIHRoZSBzdHJhbmRlZCBzaWduYWw6IGEga2V5IHdlIGNvdWxkIG5vdCBjb252ZXJ0IGlzIG5vdyBhXG4gICAgICAgICAgICAvLyByZWNvdmVyYWJsZSBzdHJhbmRlZCBibG9iLCBhbmQgdGhlIGNvcHkgc2hvdWxkIHJlZmxlY3QgdGhhdC5cbiAgICAgICAgICAgIGF3YWl0IHJlZnJlc2hTdHJhbmRlZFNpZ25hbCgpO1xuICAgICAgICAgICAgY29uc3Qgc2tpcHBlZCA9IEFycmF5LmlzQXJyYXkocmVzdWx0LnNraXBwZWQpID8gcmVzdWx0LnNraXBwZWQubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGlmIChza2lwcGVkID4gMCkge1xuICAgICAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcyhgTWFzdGVyIHBhc3N3b3JkIHJlbW92ZWQsIGJ1dCAke3NraXBwZWR9IGtleSR7c2tpcHBlZCA9PT0gMSA/ICcgaXMnIDogJ3MgYXJlJ30gcHJvdGVjdGVkIGJ5IGEgZGlmZmVyZW50IHBhc3N3b3JkIGFuZCB3ZXJlIGtlcHQgYXMtaXMuIFVubG9jayB3aXRoIHRoYXQgcGFzc3dvcmQgdG8gcmVjb3ZlciAke3NraXBwZWQgPT09IDEgPyAnaXQnIDogJ3RoZW0nfS5gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgcmVtb3ZlZC4gWW91ciBrZXlzIGFyZSBub3cgZW5jcnlwdGVkIGF0IHJlc3Qgd2l0aCBhIGRldmljZSBrZXkuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gcmVtb3ZlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVWYXVsdCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdyZXNldEFsbERhdGEnIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAvLyBSZXNldCBzdGF0ZSBhbmQgc2hvdyBzZXQgcGFzc3dvcmQgdmlld1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5sYXN0QmFja3VwQXQgPSBudWxsO1xuICAgICAgICAgICAgc3RhdGUuaXNCdW5rZXJQcm9maWxlID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5idW5rZXJBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdWYXVsdCBkZWxldGVkLiBZb3UgY2FuIG5vdyBzZXQgdXAgYSBuZXcgbWFzdGVyIHBhc3N3b3JkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgaW5zTm90aWNlKHsgdGl0bGU6ICdWYXVsdCBkZWxldGlvbiBmYWlsZWQnLCBib2R5OiAocmVzdWx0Py5lcnJvciB8fCAnVW5rbm93biBlcnJvcicpIH0pO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCBpbnNOb3RpY2UoeyB0aXRsZTogJ1ZhdWx0IGRlbGV0aW9uIGZhaWxlZCcsIGJvZHk6IGUubWVzc2FnZSB9KTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUJhY2t1cEV4cG9ydCgpIHtcbiAgICBzdGF0ZS5iYWNrdXBFcnJvciA9ICcnO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2JhY2t1cC5leHBvcnQnIH0pO1xuICAgICAgICBpZiAoIXJlc3VsdCB8fCAhcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmJhY2t1cEVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdCYWNrdXAgZXhwb3J0IGZhaWxlZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdC5lbnZlbG9wZSwgbnVsbCwgMik7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbanNvbl0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICBhLmRvd25sb2FkID0gYG5vc3Rya2V5LWJhY2t1cC0ke2RhdGV9Lmpzb25gO1xuICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgIC8vIERlbGF5IHJldm9rZSBcdTIwMTQgU2FmYXJpL0ZpcmVmb3ggY2FuIHN0YXJ0IHRoZSBkb3dubG9hZCBhZnRlciB0aGlzIHRpY2tcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCksIDEwMDAwKTtcblxuICAgICAgICAvLyBSZWNvcmQgdGhlIGJhY2t1cCBzbyB0aGUgdHJ1c3QgbWV0ZXIgY2FuIGxpZ2h0IEwxIGhvbmVzdGx5LlxuICAgICAgICBzdGF0ZS5sYXN0QmFja3VwQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0cnkgeyBhd2FpdCBhcGkuc3RvcmFnZS5zZXQoeyBsYXN0QmFja3VwQXQ6IHN0YXRlLmxhc3RCYWNrdXBBdCB9KTsgfSBjYXRjaCB7IC8qIG5vbi1mYXRhbCAqLyB9XG4gICAgICAgIHNob3dQYWdlU3VjY2VzcygnRW5jcnlwdGVkIGJhY2t1cCBkb3dubG9hZGVkLiBTdG9yZSBpdCBzb21ld2hlcmUgc2FmZSBcdTIwMTQgaXQgbmVlZHMgeW91ciBtYXN0ZXIgcGFzc3dvcmQgdG8gcmVzdG9yZS4nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmJhY2t1cEVycm9yID0gZS5tZXNzYWdlIHx8ICdCYWNrdXAgZXhwb3J0IGZhaWxlZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKCkge1xuICAgIGNvbnN0IHNlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmICghc2VsZWN0KSByZXR1cm47XG4gICAgY29uc3QgbWludXRlcyA9IHBhcnNlSW50KHNlbGVjdC52YWx1ZSwgMTApO1xuICAgIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9IG1pbnV0ZXM7XG5cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzZXRBdXRvTG9ja1RpbWVvdXQnLFxuICAgICAgICBwYXlsb2FkOiBtaW51dGVzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGFiZWwgPSBtaW51dGVzID09PSAwID8gJ2Rpc2FibGVkJ1xuICAgICAgICA6IG1pbnV0ZXMgPT09IDYwID8gJzEgaG91cidcbiAgICAgICAgOiBtaW51dGVzID09PSAxODAgPyAnMyBob3VycydcbiAgICAgICAgOiBgJHttaW51dGVzfSBtaW51dGVzYDtcbiAgICBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSBtaW51dGVzID09PSAwXG4gICAgICAgID8gJ0F1dG8tbG9jayBkaXNhYmxlZC4nXG4gICAgICAgIDogYEF1dG8tbG9jayBzZXQgdG8gJHtsYWJlbH0uYDtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuYXV0b2xvY2tTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCAzMDAwKTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAvLyBDbG9zZVxuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBmb3JtIHN1Ym1pc3Npb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmb3JtJykuZm9yRWFjaChmb3JtID0+IHtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICB9KTtcblxuICAgIC8vIFVubG9ja1xuICAgICQoJ3VubG9jay1mb3JtJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgaGFuZGxlVW5sb2NrKCk7IH0pO1xuXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgJCgnbmV3LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ3NldC1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXRQYXNzd29yZCk7XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmRcbiAgICAkKCdjdXJyZW50LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCduZXctcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2hhbmdlUGFzc3dvcmQpO1xuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVJlbW92ZVBhc3N3b3JkKTtcblxuICAgIC8vIEF1dG8tbG9ja1xuICAgICQoJ2F1dG9sb2NrLXNlbGVjdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBdXRvTG9ja0NoYW5nZSk7XG5cbiAgICAvLyBUcnVzdCBsYWRkZXI6IGVuY3J5cHRlZCBiYWNrdXAgZXhwb3J0IChMMSBsZXZlbC11cCBhY3Rpb24pXG4gICAgJCgnYmFja3VwLWV4cG9ydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVCYWNrdXBFeHBvcnQpO1xuXG4gICAgLy8gRGVsZXRlIHZhdWx0IChmcm9tIGxvY2tlZCB2aWV3KVxuICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAkKCdkZWxldGUtY29uZmlybS1kaWFsb2cnKT8uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9KTtcbiAgICAkKCdjYW5jZWwtZGVsZXRlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnZGVsZXRlLWNvbmZpcm0tZGlhbG9nJyk/LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICB9KTtcbiAgICAkKCdjb25maXJtLWRlbGV0ZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVEZWxldGVWYXVsdCk7XG59XG5cbi8vIFNpbmdsZSBzaWduYWwgY2hhbm5lbCBmb3IgdGhlIHN0cmFuZGVkLWtleSBzdGF0ZS4gQmVzdC1lZmZvcnQ6IHRoZVxuLy8gaGFzRW5jcnlwdGVkRGF0YSBoYW5kbGVyIHNlbGYtaGVhbHMgYSB2ZXJpZmllciB2YXVsdCAoYW4gaWRlbXBvdGVudCBzdG9yYWdlXG4vLyB3cml0ZSkgd2hpY2ggaXMgZXhwZWN0ZWQgYW5kIGJlbmlnbjsgYSBmYWlsdXJlIGhlcmUganVzdCBsZWF2ZXMgc3RyYW5kZWRLZXlzXG4vLyBhdCAwIHJhdGhlciB0aGFuIGJyZWFraW5nIHRoZSBwYWdlLlxuYXN5bmMgZnVuY3Rpb24gcmVmcmVzaFN0cmFuZGVkU2lnbmFsKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVuYyA9IGF3YWl0IGFza0dhdGUoJ2hhc0VuY3J5cHRlZERhdGEnKTtcbiAgICAgICAgc3RhdGUuc3RyYW5kZWRLZXlzID0gZW5jPy5zdHJhbmRlZEtleXMgfHwgMDtcbiAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmRIYXNoID0gISFlbmM/Lmhhc1Bhc3N3b3JkSGFzaDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgR2F0ZVJlZnVzZWQpIHRocm93IGU7IC8vIG90aGVyd2lzZSBsZWF2ZSBzdHJhbmRlZEtleXMgYXQgMFxuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBzdGF0ZS5oYXNQYXNzd29yZCA9ICEhKGF3YWl0IGFza0dhdGUoJ2lzRW5jcnlwdGVkJykpO1xuICAgIHN0YXRlLmlzTG9ja2VkID0gISEoYXdhaXQgYXNrR2F0ZSgnaXNMb2NrZWQnKSk7XG4gICAgc3RhdGUuYXV0b0xvY2tNaW51dGVzID0gKGF3YWl0IGFza0dhdGUoJ2dldEF1dG9Mb2NrVGltZW91dCcpKSA/PyAxNTtcblxuICAgIGF3YWl0IHJlZnJlc2hTdHJhbmRlZFNpZ25hbCgpO1xuXG4gICAgLy8gVHJ1c3QtbGFkZGVyIHNpZ25hbHMgXHUyMDE0IGVhY2ggaXMgYmVzdC1lZmZvcnQ7IGEgZmFpbHVyZSBqdXN0IGxlYXZlcyB0aGVcbiAgICAvLyBydW5nIHVubGl0IHJhdGhlciB0aGFuIGJyZWFraW5nIHRoZSBwYWdlLlxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZXRBY3RpdmVQcm9maWxlSW5mbycgfSk7XG4gICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBzdGF0ZS5wcm9maWxlTmFtZSA9IGluZm8ubmFtZSB8fCAnJztcbiAgICAgICAgICAgIHN0YXRlLnByb2ZpbGVOcHViID0gaW5mby5ucHViIHx8ICcnO1xuICAgICAgICAgICAgc3RhdGUuaXNCdW5rZXJQcm9maWxlID0gISFpbmZvLmlzQnVua2VyO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgYnVua2VyID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnYnVua2VyU2VydmVyLnN0YXR1cycgfSk7XG4gICAgICAgIHN0YXRlLmJ1bmtlckFjdGl2ZSA9ICEhKGJ1bmtlciAmJiBidW5rZXIuYWN0aXZlKTtcbiAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdG9yZWQgPSBhd2FpdCBhcGkuc3RvcmFnZS5nZXQoeyBsYXN0QmFja3VwQXQ6IG51bGwgfSk7XG4gICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IHN0b3JlZD8ubGFzdEJhY2t1cEF0IHx8IG51bGw7XG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICAvLyBPcGVuIGFjY29yZGlvbiBtYXRjaGluZyBVUkwgaGFzaCAoZS5nLiAjbWFzdGVyLXBhc3N3b3JkIG9yICNhdXRvbG9jaylcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcbiAgICBpZiAoaGFzaCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYXNoKTtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQudGFnTmFtZSA9PT0gJ0RFVEFJTFMnKSB7XG4gICAgICAgICAgICB0YXJnZXQub3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEZWZhdWx0OiBvcGVuIG1hc3Rlci1wYXNzd29yZCBhY2NvcmRpb25cbiAgICAgICAgY29uc3QgbXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFzdGVyLXBhc3N3b3JkJyk7XG4gICAgICAgIGlmIChtcCkgbXAub3BlbiA9IHRydWU7XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gc3RhcnRQYWdlKGluaXQpKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDakY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxRQUM5QztBQUNBLGVBQU8s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
