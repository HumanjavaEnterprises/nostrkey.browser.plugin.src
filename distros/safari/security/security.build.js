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
  var ACTIVITY_NOTE_MS = 3e4;
  function watchActivity() {
    let lastNote = 0;
    const note = () => {
      if (Date.now() - lastNote < ACTIVITY_NOTE_MS) return;
      lastNote = Date.now();
      api.runtime.sendMessage({ kind: "resetAutoLock" })?.catch?.(() => {
      });
    };
    document.addEventListener("pointerdown", note, { capture: true, passive: true });
    document.addEventListener("keydown", note, { capture: true, passive: true });
  }
  async function startPage(init2) {
    watchActivity();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvc2VjdXJpdHkvc2VjdXJpdHkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zZXNzaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBNVjMgaW4tbWVtb3J5IGFyZWEgdGhhdCBzdXJ2aXZlcyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbiBidXQgbmV2ZXIgdG91Y2hlc1xuICAgIC8vIGRpc2suIE51bGwgb24gZW5naW5lcyB0aGF0IGRvbid0IGltcGxlbWVudCBpdCAoU2FmYXJpIGJhY2tncm91bmQgcGFnZSxcbiAgICAvLyBvbGRlciBGaXJlZm94KSBcdTIwMTQgY2FsbGVycyBtdXN0IGZlYXR1cmUtZGV0ZWN0IGFuZCBmYWxsIGJhY2suXG4gICAgc2Vzc2lvbjogX2Jyb3dzZXIuc3RvcmFnZT8uc2Vzc2lvbiA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRoZSBhcmVhIHRvIGV4dGVuc2lvbi1wcml2aWxlZ2VkIGNvbnRleHRzLiBDaHJvbWUtb25seTtcbiAgICAgICAgICogcmVzb2x2ZXMgaGFybWxlc3NseSB3aGVyZSB0aGUgbWV0aG9kIGlzIGFic2VudC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBUaGUgcXVlc3Rpb25zIGEgcGFnZSBhc2tzIHRoZSB3b3JrZXIgYmVmb3JlIGl0IGNhbiBkcmF3IGFueXRoaW5nLiBUaGUgd29ya2VyXG4gKiBjYW4gYW5zd2VyIHRoZW0gd2l0aCBhIHJlZnVzYWwgb2JqZWN0LCBhbmQgYW4gb2JqZWN0IGlzIHRydXRoeSwgc28gYSBwYWdlIHRoYXRcbiAqIHJlYWRzIGl0IGFzIGEgeWVzIHNob3dzIHRoZSB3cm9uZyBzY3JlZW4uIFBhZ2VzIGFzayB0aHJvdWdoIGFza0dhdGUgaW5zdGVhZDpcbiAqIGEgcmVmdXNhbCByZXBsYWNlcyB0aGUgcGFnZSB3aXRoIGEgcGxhaW4gbWVzc2FnZSBhbmQgc3RvcHMgaXRzIHN0YXJ0LXVwLlxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmV4cG9ydCBjb25zdCBTVEFSVF9FUlJPUiA9ICdOb3N0cktleSBjb3VsZCBub3Qgc3RhcnQgdGhpcyBwYWdlLiBSZWxvYWQgb3IgcmVpbnN0YWxsLic7XG5cbmV4cG9ydCBjbGFzcyBHYXRlUmVmdXNlZCBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZnVzZWQoYW5zd2VyKSB7XG4gICAgcmV0dXJuICEhYW5zd2VyICYmIHR5cGVvZiBhbnN3ZXIgPT09ICdvYmplY3QnICYmIGFuc3dlci5zdWNjZXNzID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdGFydEVycm9yKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYWxlcnQnKTtcbiAgICBtZXNzYWdlLmRhdGFzZXQuc3RhcnRFcnJvciA9ICcnO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBTVEFSVF9FUlJPUjtcbiAgICBtZXNzYWdlLnN0eWxlLnBhZGRpbmcgPSAnMTZweCc7XG4gICAgZG9jdW1lbnQuYm9keS5yZXBsYWNlQ2hpbGRyZW4obWVzc2FnZSk7XG59XG5cbi8qKiBBc2sgdGhlIHdvcmtlci4gT24gYSByZWZ1c2FsLCBzaG93IHRoZSBtZXNzYWdlIGFuZCB0aHJvdyBHYXRlUmVmdXNlZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc2tHYXRlKGtpbmQpIHtcbiAgICBjb25zdCBhbnN3ZXIgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQgfSk7XG4gICAgaWYgKGlzUmVmdXNlZChhbnN3ZXIpKSB7XG4gICAgICAgIHNob3dTdGFydEVycm9yKCk7XG4gICAgICAgIHRocm93IG5ldyBHYXRlUmVmdXNlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gYW5zd2VyO1xufVxuXG4vLyBBdCBtb3N0IG9uZSBub3RlIGluIHRoaXMgdGltZSwgaG93ZXZlciBidXN5IHRoZSBwZXJzb24gaXMuXG5jb25zdCBBQ1RJVklUWV9OT1RFX01TID0gMzBfMDAwO1xuXG4vKipcbiAqIFVzaW5nIG9uZSBvZiBOb3N0cktleSdzIG93biBwYWdlcyBjb3VudHMgYXMgYWN0aXZpdHkgZm9yIGF1dG8tbG9jaywgYXMgZG9lc1xuICogYW5zd2VyaW5nIGEgcmVxdWVzdCBvciBhIHNpdGUgc2lnbmluZyBmcm9tIGEgcmVtZW1iZXJlZCBncmFudC5cbiAqL1xuZnVuY3Rpb24gd2F0Y2hBY3Rpdml0eSgpIHtcbiAgICBsZXQgbGFzdE5vdGUgPSAwO1xuICAgIGNvbnN0IG5vdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdE5vdGUgPCBBQ1RJVklUWV9OT1RFX01TKSByZXR1cm47XG4gICAgICAgIGxhc3ROb3RlID0gRGF0ZS5ub3coKTtcbiAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncmVzZXRBdXRvTG9jaycgfSk/LmNhdGNoPy4oKCkgPT4ge30pO1xuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBub3RlLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5vdGUsIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cblxuLyoqIFJ1biBhIHBhZ2UncyBzdGFydC11cC4gQSByZWZ1c2FsIGhhcyBhbHJlYWR5IGJlZW4gc2hvd24sIHNvIGl0IGVuZHMgaGVyZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydFBhZ2UoaW5pdCkge1xuICAgIHdhdGNoQWN0aXZpdHkoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBpbml0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgR2F0ZVJlZnVzZWQpKSB0aHJvdyBlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgYXNrR2F0ZSwgc3RhcnRQYWdlLCBHYXRlUmVmdXNlZCB9IGZyb20gJy4uL3V0aWxpdGllcy9wYWdlLWdhdGUnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSwgaW5zTm90aWNlIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBpc0xvY2tlZDogZmFsc2UsXG4gICAgaGFzUGFzc3dvcmQ6IGZhbHNlLFxuICAgIC8vIFN0cmFuZGVkLWtleSBzaWduYWwgKHNpbmdsZSBjaGFubmVsOiBoYXNFbmNyeXB0ZWREYXRhKS4gc3RyYW5kZWRLZXlzIGlzIHRoZVxuICAgIC8vIGNvdW50IG9mIHByb2ZpbGUga2V5cyB3cmFwcGVkIHVuZGVyIGEgbWFzdGVyIHBhc3N3b3JkIG5vIHZlcmlmaWVyIGNhbiBvcGVuO1xuICAgIC8vIGhhc1Bhc3N3b3JkSGFzaCBpcyB3aGV0aGVyIGEgdmVyaWZpZXIgaXMgb24gZGlzay4gQm90aCBjb21lIGZyb20gdGhlXG4gICAgLy8gYmFja2dyb3VuZCBtb2R1bGUgc28gZXZlcnkgc3VyZmFjZSByZWFkcyB0aGUgc2FtZSB0cnV0aC5cbiAgICBzdHJhbmRlZEtleXM6IDAsXG4gICAgaGFzUGFzc3dvcmRIYXNoOiBmYWxzZSxcbiAgICAvLyBVbmxvY2tcbiAgICB1bmxvY2tFcnJvcjogJycsXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgbmV3UGFzc3dvcmQ6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZDogJycsXG4gICAgc2VjdXJpdHlFcnJvcjogJycsXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkXG4gICAgY3VycmVudFBhc3N3b3JkOiAnJyxcbiAgICBuZXdQYXNzd29yZENoYW5nZTogJycsXG4gICAgY29uZmlybVBhc3N3b3JkQ2hhbmdlOiAnJyxcbiAgICBjaGFuZ2VFcnJvcjogJycsXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgcmVtb3ZlUGFzc3dvcmRJbnB1dDogJycsXG4gICAgcmVtb3ZlRXJyb3I6ICcnLFxuICAgIC8vIFNoYXJlZCBwYWdlLWxldmVsIHN1Y2Nlc3NcbiAgICBwYWdlU3VjY2VzczogJycsXG4gICAgLy8gQXV0by1sb2NrXG4gICAgYXV0b0xvY2tNaW51dGVzOiAxNSxcbiAgICBhdXRvbG9ja1N1Y2Nlc3M6ICcnLFxuICAgIC8vIFRydXN0IGxhZGRlciAoTDBcdTIxOTJMMyBsZXZlbC1tZXRlcilcbiAgICBwcm9maWxlTmFtZTogJycsXG4gICAgcHJvZmlsZU5wdWI6ICcnLFxuICAgIGlzQnVua2VyUHJvZmlsZTogZmFsc2UsXG4gICAgYnVua2VyQWN0aXZlOiBmYWxzZSxcbiAgICBsYXN0QmFja3VwQXQ6IG51bGwsXG4gICAgYmFja3VwRXJyb3I6ICcnLFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgocHcpIHtcbiAgICBpZiAocHcubGVuZ3RoID09PSAwKSByZXR1cm4gMDtcbiAgICBpZiAocHcubGVuZ3RoIDwgOCkgcmV0dXJuIDE7XG4gICAgbGV0IHNjb3JlID0gMjtcbiAgICBpZiAocHcubGVuZ3RoID49IDEyKSBzY29yZSsrO1xuICAgIGlmICgvW0EtWl0vLnRlc3QocHcpICYmIC9bYS16XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgaWYgKC9cXGQvLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvW15BLVphLXowLTldLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICByZXR1cm4gTWF0aC5taW4oc2NvcmUsIDUpO1xufVxuXG4vLyAtLS0gVHJ1c3QgbGFkZGVyIChMMCB3b3JraW5nIGtleSBcdTAwQjcgTDEgYmFja2VkIHVwIFx1MDBCNyBMMiBlbmNyeXB0ZWQrYXV0by1sb2NrIFx1MDBCN1xuLy8gTDMgcmVtb3RlIHNpZ25lcikuIFRoZSBtZXRlciBzaG93cyB0aGUgSElHSEVTVCBhY2hpZXZlZCBsZXZlbDsgc2tpcHBlZFxuLy8gbG93ZXIgcnVuZ3Mgc3RheSBhbWJlciBzbyB0aGUgZ2FwIGlzIHZpc2libGUgYW5kIGFjdGlvbmFibGUuXG5mdW5jdGlvbiB0cnVzdEFjaGlldmVtZW50cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsMTogISFzdGF0ZS5sYXN0QmFja3VwQXQsXG4gICAgICAgIGwyOiBzdGF0ZS5oYXNQYXNzd29yZCAmJiBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPiAwLFxuICAgICAgICBsMzogc3RhdGUuYnVua2VyQWN0aXZlIHx8IHN0YXRlLmlzQnVua2VyUHJvZmlsZSxcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB0cnVzdExldmVsKCkge1xuICAgIGNvbnN0IGEgPSB0cnVzdEFjaGlldmVtZW50cygpO1xuICAgIGlmIChhLmwzKSByZXR1cm4gMztcbiAgICBpZiAoYS5sMikgcmV0dXJuIDI7XG4gICAgaWYgKGEubDEpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSdW5nKG4sIGFjaGlldmVkLCBsZXZlbCkge1xuICAgIGNvbnN0IHJ1bmcgPSAkKGBydW5nLWwke259YCk7XG4gICAgY29uc3QgbGVkID0gJChgcnVuZy1sJHtufS1sZWRgKTtcbiAgICBjb25zdCBzdGF0ZUVsID0gJChgcnVuZy1sJHtufS1zdGF0ZWApO1xuICAgIGlmIChydW5nKSBydW5nLmRhdGFzZXQuYWNoaWV2ZWQgPSBhY2hpZXZlZCA/ICd0cnVlJyA6ICdmYWxzZSc7XG4gICAgaWYgKGxlZCkge1xuICAgICAgICAvLyBhY2hpZXZlZCA9IGdyZWVuIExFRCBcdTAwQjcgc2tpcHBlZCAoYmVsb3cgY3VycmVudCBsZXZlbCkgPSBhbWJlciBcdTAwQjcgbm90XG4gICAgICAgIC8vIHlldCByZWFjaGVkID0gb2ZmLiBHcmVlbiBpcyBhIHN0YXR1cyBMRUQgb25seSwgcGVyIGRlc2lnbiBzeXN0ZW0uXG4gICAgICAgIGxlZC5jbGFzc05hbWUgPSBhY2hpZXZlZFxuICAgICAgICAgICAgPyAnbGVkIGxlZC0tZ3JlZW4nXG4gICAgICAgICAgICA6IChuIDwgbGV2ZWwgPyAnbGVkIGxlZC0tYW1iZXInIDogJ2xlZCBsZWQtLW9mZicpO1xuICAgIH1cbiAgICBpZiAoc3RhdGVFbCkgc3RhdGVFbC50ZXh0Q29udGVudCA9IGFjaGlldmVkID8gJ09LJyA6ICdcdTIwMTQnO1xufVxuXG5mdW5jdGlvbiByZW5kZXJUcnVzdCgpIHtcbiAgICBjb25zdCBhID0gdHJ1c3RBY2hpZXZlbWVudHMoKTtcbiAgICBjb25zdCBsZXZlbCA9IHRydXN0TGV2ZWwoKTtcblxuICAgIGNvbnN0IG1ldGVyID0gJCgndHJ1c3QtbWV0ZXInKTtcbiAgICBpZiAobWV0ZXIpIHtcbiAgICAgICAgbWV0ZXIuZGF0YXNldC5sZXZlbCA9IFN0cmluZyhsZXZlbCk7XG4gICAgICAgIG1ldGVyLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGBTZWN1cml0eSBsZXZlbCAke2xldmVsfSBvZiAzYCk7XG4gICAgfVxuICAgIGNvbnN0IHJlYWRvdXQgPSAkKCd0cnVzdC1sZXZlbC1yZWFkb3V0Jyk7XG4gICAgaWYgKHJlYWRvdXQpIHJlYWRvdXQudGV4dENvbnRlbnQgPSBgTCR7bGV2ZWx9YDtcblxuICAgIHJlbmRlclJ1bmcoMSwgYS5sMSwgbGV2ZWwpO1xuICAgIHJlbmRlclJ1bmcoMiwgYS5sMiwgbGV2ZWwpO1xuICAgIHJlbmRlclJ1bmcoMywgYS5sMywgbGV2ZWwpO1xuXG4gICAgLy8gTDEgbGV2ZWwtdXAgYWN0aW9uOiBlbmNyeXB0ZWQgYmFja3VwIG5lZWRzIGEgbWFzdGVyIHBhc3N3b3JkOyB1bnRpbFxuICAgIC8vIHRoZW4sIHBvaW50IGF0IHRoZSBrZXktZXhwb3J0IHBhdGggaW5zdGVhZCBvZiBzaG93aW5nIGEgZGVhZCBidXR0b24uXG4gICAgY29uc3QgYmFja3VwQnRuID0gJCgnYmFja3VwLWV4cG9ydC1idG4nKTtcbiAgICBjb25zdCBsMUhpbnQgPSAkKCdydW5nLWwxLWhpbnQnKTtcbiAgICAvKiAnaW5saW5lLWZsZXgnIG1hdGNoZXMgLmJ0biBiYXNlIGRpc3BsYXkgKGluc3RydW1lbnQuY3NzKTsgJycgd291bGQgbG9zZVxuICAgICAgIHRvIHRoZSAjYmFja3VwLWV4cG9ydC1idG4gc3R5bGVzaGVldCBydWxlIHRoYXQgcmVwbGFjZWQgaXRzIGlubGluZSBzdHlsZS4gKi9cbiAgICBpZiAoYmFja3VwQnRuKSBiYWNrdXBCdG4uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2lubGluZS1mbGV4JyA6ICdub25lJztcbiAgICBpZiAobDFIaW50KSB7XG4gICAgICAgIGwxSGludC50ZXh0Q29udGVudCA9IHN0YXRlLmhhc1Bhc3N3b3JkXG4gICAgICAgICAgICA/ICdMZXZlbCB1cDogZG93bmxvYWQgYW4gZW5jcnlwdGVkIGJhY2t1cCBvZiB5b3VyIHZhdWx0IGFuZCBzdG9yZSBpdCBzb21ld2hlcmUgc2FmZS4nXG4gICAgICAgICAgICA6ICdMZXZlbCB1cDogc2V0IGEgbWFzdGVyIHBhc3N3b3JkIGZpcnN0LCB0aGVuIGRvd25sb2FkIGFuIGVuY3J5cHRlZCBiYWNrdXAgaGVyZSBcdTIwMTQgb3IgZXhwb3J0IHlvdXIga2V5IGZyb20gdGhlIE5vc3RyS2V5IHBhbmVsIGFuZCBzdG9yZSBpdCBzYWZlbHkuJztcbiAgICB9XG4gICAgY29uc3QgYmFja3VwRXJyID0gJCgnYmFja3VwLWVycm9yJyk7XG4gICAgaWYgKGJhY2t1cEVycikge1xuICAgICAgICBiYWNrdXBFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5iYWNrdXBFcnJvcjtcbiAgICAgICAgYmFja3VwRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5iYWNrdXBFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gTDIgYWN0aW9uIHJlZmluZW1lbnQ6IHBhc3N3b3JkIHNldCBidXQgYXV0by1sb2NrIGRpc2FibGVkLlxuICAgIGNvbnN0IGwyQWN0aW9uID0gJCgncnVuZy1sMi1hY3Rpb24nKTtcbiAgICBpZiAobDJBY3Rpb24pIHtcbiAgICAgICAgbDJBY3Rpb24udGV4dENvbnRlbnQgPSAoc3RhdGUuaGFzUGFzc3dvcmQgJiYgc3RhdGUuYXV0b0xvY2tNaW51dGVzID09PSAwKVxuICAgICAgICAgICAgPyAnTGV2ZWwgdXA6IGF1dG8tbG9jayBpcyBzZXQgdG8gTmV2ZXIgXHUyMDE0IHBpY2sgYW4gaW50ZXJ2YWwgYmVsb3cgdG8gcmVhY2ggTDIuJ1xuICAgICAgICAgICAgOiAnTGV2ZWwgdXA6IHNldCBhIG1hc3RlciBwYXNzd29yZCBiZWxvdywgdGhlbiBwaWNrIGFuIGF1dG8tbG9jayBpbnRlcnZhbC4nO1xuICAgIH1cblxuICAgIC8vIENoYW5uZWwgc3RyaXA6IGlkZW50aXR5ICsgc3RhdHVzIExFRC5cbiAgICBjb25zdCBuYW1lVGV4dCA9ICQoJ3N0cmlwLW5hbWUtdGV4dCcpO1xuICAgIGlmIChuYW1lVGV4dCkgbmFtZVRleHQudGV4dENvbnRlbnQgPSBzdGF0ZS5wcm9maWxlTmFtZSB8fCAnUHJvZmlsZSc7XG4gICAgY29uc3QgbnB1YkVsID0gJCgnc3RyaXAtbnB1YicpO1xuICAgIGlmIChucHViRWwpIG5wdWJFbC50ZXh0Q29udGVudCA9IHN0YXRlLnByb2ZpbGVOcHViIHx8ICdubyBrZXkgb24gdGhpcyBwcm9maWxlJztcbiAgICBjb25zdCBzdHJpcExlZCA9ICQoJ3N0cmlwLWxlZCcpO1xuICAgIGlmIChzdHJpcExlZCkge1xuICAgICAgICBzdHJpcExlZC5jbGFzc05hbWUgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdsZWQgbGVkLS1ncmVlbicgOiAnbGVkIGxlZC0tYW1iZXInO1xuICAgIH1cblxuICAgIC8vIE1vZHVsZS1oZWFkZXIgTEVEcyAobWFzdGVyIHBhc3N3b3JkIC8gYXV0by1sb2NrKS5cbiAgICBjb25zdCBwd0xlZCA9ICQoJ3Bhc3N3b3JkLWxlZCcpO1xuICAgIGlmIChwd0xlZCkgcHdMZWQuY2xhc3NOYW1lID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbGVkIGxlZC0tZ3JlZW4nIDogJ2xlZCBsZWQtLW9mZic7XG4gICAgY29uc3QgYWxMZWQgPSAkKCdhdXRvbG9jay1sZWQnKTtcbiAgICBpZiAoYWxMZWQpIHtcbiAgICAgICAgYWxMZWQuY2xhc3NOYW1lID0gKHN0YXRlLmhhc1Bhc3N3b3JkICYmIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA+IDApXG4gICAgICAgICAgICA/ICdsZWQgbGVkLS1ncmVlbicgOiAnbGVkIGxlZC0tb2ZmJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3dQYWdlU3VjY2Vzcyhtc2cpIHtcbiAgICBzdGF0ZS5wYWdlU3VjY2VzcyA9IG1zZztcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUucGFnZVN1Y2Nlc3MgPSAnJzsgcmVuZGVyKCk7IH0sIDUwMDApO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gTG9ja2VkIHZzIHVubG9ja2VkIHZpZXdzXG4gICAgY29uc3QgbG9ja2VkVmlldyA9ICQoJ2xvY2tlZC12aWV3Jyk7XG4gICAgY29uc3QgdW5sb2NrZWRWaWV3ID0gJCgndW5sb2NrZWQtdmlldycpO1xuICAgIGlmIChsb2NrZWRWaWV3KSBsb2NrZWRWaWV3LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5pc0xvY2tlZCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKHVubG9ja2VkVmlldykgdW5sb2NrZWRWaWV3LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5pc0xvY2tlZCA/ICdub25lJyA6ICdibG9jayc7XG5cbiAgICAvLyBSZWNvdmVyIGFmZm9yZGFuY2UgaW4gdGhlIGxvY2tlZCB2aWV3OiBvbmx5IHdoZW4gdGhlIGxvY2sgaXMgcmVhbGx5IGFuXG4gICAgLy8gb2xkLXBhc3N3b3JkIHN0cmFuZGluZyAobm8gdmVyaWZpZXIgb24gZGlzayksIG5ldmVyIGZvciBhIG5vcm1hbCB2YXVsdC5cbiAgICBjb25zdCBzdHJhbmRlZEhpbnQgPSAkKCdzdHJhbmRlZC1yZWNvdmVyLWhpbnQnKTtcbiAgICBpZiAoc3RyYW5kZWRIaW50KSB7XG4gICAgICAgIGNvbnN0IHN0cmFuZGVkID0gc3RhdGUuc3RyYW5kZWRLZXlzID4gMCAmJiAhc3RhdGUuaGFzUGFzc3dvcmRIYXNoO1xuICAgICAgICBzdHJhbmRlZEhpbnQuc3R5bGUuZGlzcGxheSA9IHN0cmFuZGVkID8gJycgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gVW5sb2NrIGVycm9yXG4gICAgY29uc3QgdW5sb2NrRXJyID0gJCgndW5sb2NrLWVycm9yJyk7XG4gICAgaWYgKHVubG9ja0VycikgeyB1bmxvY2tFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS51bmxvY2tFcnJvcjsgdW5sb2NrRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS51bmxvY2tFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIFBhZ2UtbGV2ZWwgc3VjY2VzcyBiYW5uZXJcbiAgICBjb25zdCBwYWdlU3VjID0gJCgncGFnZS1zdWNjZXNzJyk7XG4gICAgaWYgKHBhZ2VTdWMpIHsgcGFnZVN1Yy50ZXh0Q29udGVudCA9IHN0YXRlLnBhZ2VTdWNjZXNzOyBwYWdlU3VjLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5wYWdlU3VjY2VzcyA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIFNlY3VyaXR5IHN0YXR1c1xuICAgIGNvbnN0IHNlY3VyaXR5U3RhdHVzID0gJCgnc2VjdXJpdHktc3RhdHVzJyk7XG4gICAgaWYgKHNlY3VyaXR5U3RhdHVzKSB7XG4gICAgICAgIGlmIChzdGF0ZS5oYXNQYXNzd29yZCkge1xuICAgICAgICAgICAgc2VjdXJpdHlTdGF0dXMudGV4dENvbnRlbnQgPSAnTWFzdGVyIHBhc3N3b3JkIGlzIGFjdGl2ZS4gWW91ciBrZXlzIGFyZSBlbmNyeXB0ZWQgYXQgcmVzdC4nO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlLnN0cmFuZGVkS2V5cyA+IDApIHtcbiAgICAgICAgICAgIC8vIE5vIHZlcmlmaWVyIG9uIGRpc2ssIGJ1dCBzb21lIGtleXMgYXJlIHN0aWxsIHdyYXBwZWQgdW5kZXIgYSBtYXN0ZXJcbiAgICAgICAgICAgIC8vIHBhc3N3b3JkIHRoYXQgaXMgZ29uZS4gVGhleSBhcmUgbmVpdGhlciBvcGVuIG5vciB1bmVuY3J5cHRlZC5cbiAgICAgICAgICAgIHNlY3VyaXR5U3RhdHVzLnRleHRDb250ZW50ID0gJ1NvbWUga2V5cyBhcmUgcHJvdGVjdGVkIGJ5IGEgbWFzdGVyIHBhc3N3b3JkIHRoYXQgaXMgbm8gbG9uZ2VyIG9uIGZpbGUuIFVubG9jayB0byByZWNvdmVyIHRoZW0gd2l0aCB0aGF0IG9sZCBwYXNzd29yZC4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gUGFzc3dvcmRsZXNzIGRlZmF1bHQgaXMgTk9UIHBsYWludGV4dDoga2V5cyBhcmUgZGV2aWNlLWtleSBlbmNyeXB0ZWQuXG4gICAgICAgICAgICBzZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9ICdObyBtYXN0ZXIgcGFzc3dvcmQgc2V0LiBZb3VyIGtleXMgYXJlIHN0aWxsIGVuY3J5cHRlZCBhdCByZXN0IHdpdGggYSBkZXZpY2Uga2V5Lic7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgc2VjdGlvbnMgYmFzZWQgb24gcGFzc3dvcmQgc3RhdGVcbiAgICBjb25zdCBzZXRTZWN0aW9uID0gJCgnc2V0LXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBjb25zdCBjaGFuZ2VTZWN0aW9uID0gJCgnY2hhbmdlLXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBpZiAoc2V0U2VjdGlvbikgc2V0U2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChjaGFuZ2VTZWN0aW9uKSBjaGFuZ2VTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBQYXNzd29yZCBzdHJlbmd0aFxuICAgIGNvbnN0IHN0cmVuZ3RoRWwgPSAkKCdwYXNzd29yZC1zdHJlbmd0aCcpO1xuICAgIGlmIChzdHJlbmd0aEVsKSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCkge1xuICAgICAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHN0YXRlLm5ld1Bhc3N3b3JkKTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVscyA9IFsnJywgJ1RvbyBzaG9ydCcsICdXZWFrJywgJ0ZhaXInLCAnU3Ryb25nJywgJ1Zlcnkgc3Ryb25nJ107XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnRleHRDb250ZW50ID0gbGFiZWxzW3N0cmVuZ3RoXSB8fCAnJztcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuY2xhc3NOYW1lID0gYGZpZWxkLWhpbnQgc3RyZW5ndGgtJHtzdHJlbmd0aH1gO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBzZXRCdG4gPSAkKCdzZXQtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHNldEJ0bikge1xuICAgICAgICBzZXRCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIHN0YXRlLm5ld1Bhc3N3b3JkID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBjaGFuZ2VCdG4gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKGNoYW5nZUJ0bikge1xuICAgICAgICBjaGFuZ2VCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLmN1cnJlbnRQYXNzd29yZC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPj0gOCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IHJlbW92ZUJ0biA9ICQoJ3JlbW92ZS1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAocmVtb3ZlQnRuKSB7XG4gICAgICAgIHJlbW92ZUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0O1xuICAgIH1cblxuICAgIC8vIElubGluZSBlcnJvciBtZXNzYWdlc1xuICAgIGNvbnN0IHNlY0VyciA9ICQoJ3NlY3VyaXR5LWVycm9yJyk7XG4gICAgaWYgKHNlY0VycikgeyBzZWNFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5zZWN1cml0eUVycm9yOyBzZWNFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlY3VyaXR5RXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3QgY2hnRXJyID0gJCgnY2hhbmdlLWVycm9yJyk7XG4gICAgaWYgKGNoZ0VycikgeyBjaGdFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5jaGFuZ2VFcnJvcjsgY2hnRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5jaGFuZ2VFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cbiAgICBjb25zdCBybUVyciA9ICQoJ3JlbW92ZS1lcnJvcicpO1xuICAgIGlmIChybUVycikgeyBybUVyci50ZXh0Q29udGVudCA9IHN0YXRlLnJlbW92ZUVycm9yOyBybUVyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucmVtb3ZlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBFbmNyeXB0aW9uIHN0YXR1cyBiYW5uZXJcbiAgICBjb25zdCBlbmNyeXB0aW9uU3RhdHVzID0gJCgnZW5jcnlwdGlvbi1zdGF0dXMnKTtcbiAgICBpZiAoZW5jcnlwdGlvblN0YXR1cykgZW5jcnlwdGlvblN0YXR1cy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnZmxleCcgOiAnbm9uZSc7XG5cbiAgICAvLyBBdXRvLWxvY2sgc2VjdGlvblxuICAgIGNvbnN0IGF1dG9sb2NrRGlzYWJsZWQgPSAkKCdhdXRvbG9jay1kaXNhYmxlZC1tc2cnKTtcbiAgICBjb25zdCBhdXRvbG9ja0NvbnRyb2xzID0gJCgnYXV0b2xvY2stY29udHJvbHMnKTtcbiAgICBpZiAoYXV0b2xvY2tEaXNhYmxlZCkgYXV0b2xvY2tEaXNhYmxlZC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChhdXRvbG9ja0NvbnRyb2xzKSBhdXRvbG9ja0NvbnRyb2xzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBjb25zdCBhdXRvbG9ja1NlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmIChhdXRvbG9ja1NlbGVjdCkgYXV0b2xvY2tTZWxlY3QudmFsdWUgPSBTdHJpbmcoc3RhdGUuYXV0b0xvY2tNaW51dGVzKTtcblxuICAgIGNvbnN0IGF1dG9sb2NrU3VjY2VzcyA9ICQoJ2F1dG9sb2NrLXN1Y2Nlc3MnKTtcbiAgICBpZiAoYXV0b2xvY2tTdWNjZXNzKSB7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy50ZXh0Q29udGVudCA9IHN0YXRlLmF1dG9sb2NrU3VjY2VzcztcbiAgICAgICAgYXV0b2xvY2tTdWNjZXNzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFRydXN0IGxhZGRlciAvIGxldmVsIG1ldGVyXG4gICAgcmVuZGVyVHJ1c3QoKTtcbn1cblxuLy8gLS0tIEhhbmRsZXJzIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2soKSB7XG4gICAgY29uc3QgcHcgPSAkKCd1bmxvY2stcGFzc3dvcmQnKT8udmFsdWU7XG4gICAgaWYgKCFwdykge1xuICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd1bmxvY2snLCBwYXlsb2FkOiBwdyB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gJyc7XG4gICAgICAgICAgICBpZiAoJCgndW5sb2NrLXBhc3N3b3JkJykpICQoJ3VubG9jay1wYXNzd29yZCcpLnZhbHVlID0gJyc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdJbnZhbGlkIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1bmxvY2suJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXRQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJyc7XG5cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdzZXRQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiBzdGF0ZS5uZXdQYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtYXN0ZXIgcGFzc3dvcmQgYWNjb3JkaW9uXG4gICAgICAgICAgICBjb25zdCBtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXN0ZXItcGFzc3dvcmQnKTtcbiAgICAgICAgICAgIGlmIChtcCAmJiBtcC5vcGVuKSBtcC5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCBzZXQuIFlvdXIga2V5cyBhcmUgbm93IGVuY3J5cHRlZCBhdCByZXN0LicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnRmFpbGVkIHRvIHNldCBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBzZXQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVDaGFuZ2VQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICcnO1xuXG4gICAgaWYgKCFzdGF0ZS5jdXJyZW50UGFzc3dvcmQpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdOZXcgcGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlICE9PSBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnTmV3IHBhc3N3b3JkcyBkbyBub3QgbWF0Y2guJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnY2hhbmdlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgICAgICAgIG9sZFBhc3N3b3JkOiBzdGF0ZS5jdXJyZW50UGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQ6IHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmN1cnJlbnRQYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSA9ICcnO1xuICAgICAgICAgICAgY29uc3Qgc2tpcHBlZCA9IEFycmF5LmlzQXJyYXkocmVzdWx0LnNraXBwZWQpID8gcmVzdWx0LnNraXBwZWQubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIGlmIChza2lwcGVkID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEEgY2hhbmdlUGFzc3dvcmQgc2tpcCBpcyBvcnBoYW5lZCB1bmRlciB0aGUgT0xEIHBhc3N3b3JkIHdpdGggYVxuICAgICAgICAgICAgICAgIC8vIGxpdmUgTkVXIHZlcmlmaWVyOiBpdCBpcyBOT1Qgc3RyYW5kZWQgYW5kIGNhbm5vdCBiZSByZWNvdmVyZWQgYnlcbiAgICAgICAgICAgICAgICAvLyB1bmxvY2suIFRoZSBob25lc3QgcGF0aCBpcyByZW1vdmUtdGhlbi1yZWNvdmVyLCBzbyBzYXkgZXhhY3RseSB0aGF0LlxuICAgICAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcyhgTWFzdGVyIHBhc3N3b3JkIGNoYW5nZWQsIGJ1dCAke3NraXBwZWR9IGtleSR7c2tpcHBlZCA9PT0gMSA/ICcgc3RpbGwgcmVxdWlyZXMnIDogJ3Mgc3RpbGwgcmVxdWlyZSd9IHlvdXIgcHJldmlvdXMgcGFzc3dvcmQgYW5kICR7c2tpcHBlZCA9PT0gMSA/ICd3YXMnIDogJ3dlcmUnfSBrZXB0IGFzLWlzLiBSZW1vdmUgdGhlIG1hc3RlciBwYXNzd29yZCwgdGhlbiByZWNvdmVyICR7c2tpcHBlZCA9PT0gMSA/ICdpdCcgOiAndGhlbSd9IHdpdGggdGhhdCBwcmV2aW91cyBwYXNzd29yZC5gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgY2hhbmdlZCBzdWNjZXNzZnVsbHkuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9IChyZXN1bHQgJiYgcmVzdWx0LmVycm9yKSB8fCAnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4nO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVtb3ZlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAnJztcblxuICAgIGlmICghc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBjdXJyZW50IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKGF3YWl0IGluc0NvbmZpcm0oeyB0aXRsZTogJ1JlbW92ZSBtYXN0ZXIgcGFzc3dvcmQ/JywgYm9keTogJ1lvdXIgcHJpdmF0ZSBrZXlzIHN0YXkgZW5jcnlwdGVkIGF0IHJlc3Qgd2l0aCBhIGRldmljZSBrZXkgb24gdGhpcyBkZXZpY2UuIFlvdSBqdXN0IHdpbGwgbm90IGhhdmUgYSBtYXN0ZXIgcGFzc3dvcmQgYWZ0ZXIgdGhpcy4nLCBjb25maXJtTGFiZWw6ICdSZW1vdmUgcGFzc3dvcmQnLCBkZXN0cnVjdGl2ZTogdHJ1ZSB9KSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdyZW1vdmVQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQgPSAnJztcbiAgICAgICAgICAgIC8vIFJlZnJlc2ggdGhlIHN0cmFuZGVkIHNpZ25hbDogYSBrZXkgd2UgY291bGQgbm90IGNvbnZlcnQgaXMgbm93IGFcbiAgICAgICAgICAgIC8vIHJlY292ZXJhYmxlIHN0cmFuZGVkIGJsb2IsIGFuZCB0aGUgY29weSBzaG91bGQgcmVmbGVjdCB0aGF0LlxuICAgICAgICAgICAgYXdhaXQgcmVmcmVzaFN0cmFuZGVkU2lnbmFsKCk7XG4gICAgICAgICAgICBjb25zdCBza2lwcGVkID0gQXJyYXkuaXNBcnJheShyZXN1bHQuc2tpcHBlZCkgPyByZXN1bHQuc2tpcHBlZC5sZW5ndGggOiAwO1xuICAgICAgICAgICAgaWYgKHNraXBwZWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKGBNYXN0ZXIgcGFzc3dvcmQgcmVtb3ZlZCwgYnV0ICR7c2tpcHBlZH0ga2V5JHtza2lwcGVkID09PSAxID8gJyBpcycgOiAncyBhcmUnfSBwcm90ZWN0ZWQgYnkgYSBkaWZmZXJlbnQgcGFzc3dvcmQgYW5kIHdlcmUga2VwdCBhcy1pcy4gVW5sb2NrIHdpdGggdGhhdCBwYXNzd29yZCB0byByZWNvdmVyICR7c2tpcHBlZCA9PT0gMSA/ICdpdCcgOiAndGhlbSd9LmApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCByZW1vdmVkLiBZb3VyIGtleXMgYXJlIG5vdyBlbmNyeXB0ZWQgYXQgcmVzdCB3aXRoIGEgZGV2aWNlIGtleS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlbW92ZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZVZhdWx0KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QWxsRGF0YScgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHN0YXRlIGFuZCBzaG93IHNldCBwYXNzd29yZCB2aWV3XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IG51bGw7XG4gICAgICAgICAgICBzdGF0ZS5pc0J1bmtlclByb2ZpbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmJ1bmtlckFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ1ZhdWx0IGRlbGV0ZWQuIFlvdSBjYW4gbm93IHNldCB1cCBhIG5ldyBtYXN0ZXIgcGFzc3dvcmQuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBpbnNOb3RpY2UoeyB0aXRsZTogJ1ZhdWx0IGRlbGV0aW9uIGZhaWxlZCcsIGJvZHk6IChyZXN1bHQ/LmVycm9yIHx8ICdVbmtub3duIGVycm9yJykgfSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IGluc05vdGljZSh7IHRpdGxlOiAnVmF1bHQgZGVsZXRpb24gZmFpbGVkJywgYm9keTogZS5tZXNzYWdlIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQmFja3VwRXhwb3J0KCkge1xuICAgIHN0YXRlLmJhY2t1cEVycm9yID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnYmFja3VwLmV4cG9ydCcgfSk7XG4gICAgICAgIGlmICghcmVzdWx0IHx8ICFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuYmFja3VwRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0JhY2t1cCBleHBvcnQgZmFpbGVkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0LmVudmVsb3BlLCBudWxsLCAyKTtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtqc29uXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGEuaHJlZiA9IHVybDtcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgICAgIGEuZG93bmxvYWQgPSBgbm9zdHJrZXktYmFja3VwLSR7ZGF0ZX0uanNvbmA7XG4gICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgLy8gRGVsYXkgcmV2b2tlIFx1MjAxNCBTYWZhcmkvRmlyZWZveCBjYW4gc3RhcnQgdGhlIGRvd25sb2FkIGFmdGVyIHRoaXMgdGlja1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IFVSTC5yZXZva2VPYmplY3RVUkwodXJsKSwgMTAwMDApO1xuXG4gICAgICAgIC8vIFJlY29yZCB0aGUgYmFja3VwIHNvIHRoZSB0cnVzdCBtZXRlciBjYW4gbGlnaHQgTDEgaG9uZXN0bHkuXG4gICAgICAgIHN0YXRlLmxhc3RCYWNrdXBBdCA9IERhdGUubm93KCk7XG4gICAgICAgIHRyeSB7IGF3YWl0IGFwaS5zdG9yYWdlLnNldCh7IGxhc3RCYWNrdXBBdDogc3RhdGUubGFzdEJhY2t1cEF0IH0pOyB9IGNhdGNoIHsgLyogbm9uLWZhdGFsICovIH1cbiAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdFbmNyeXB0ZWQgYmFja3VwIGRvd25sb2FkZWQuIFN0b3JlIGl0IHNvbWV3aGVyZSBzYWZlIFx1MjAxNCBpdCBuZWVkcyB5b3VyIG1hc3RlciBwYXNzd29yZCB0byByZXN0b3JlLicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuYmFja3VwRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0JhY2t1cCBleHBvcnQgZmFpbGVkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXV0b0xvY2tDaGFuZ2UoKSB7XG4gICAgY29uc3Qgc2VsZWN0ID0gJCgnYXV0b2xvY2stc2VsZWN0Jyk7XG4gICAgaWYgKCFzZWxlY3QpIHJldHVybjtcbiAgICBjb25zdCBtaW51dGVzID0gcGFyc2VJbnQoc2VsZWN0LnZhbHVlLCAxMCk7XG4gICAgc3RhdGUuYXV0b0xvY2tNaW51dGVzID0gbWludXRlcztcblxuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ3NldEF1dG9Mb2NrVGltZW91dCcsXG4gICAgICAgIHBheWxvYWQ6IG1pbnV0ZXMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBsYWJlbCA9IG1pbnV0ZXMgPT09IDAgPyAnZGlzYWJsZWQnXG4gICAgICAgIDogbWludXRlcyA9PT0gNjAgPyAnMSBob3VyJ1xuICAgICAgICA6IG1pbnV0ZXMgPT09IDE4MCA/ICczIGhvdXJzJ1xuICAgICAgICA6IGAke21pbnV0ZXN9IG1pbnV0ZXNgO1xuICAgIHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA9IG1pbnV0ZXMgPT09IDBcbiAgICAgICAgPyAnQXV0by1sb2NrIGRpc2FibGVkLidcbiAgICAgICAgOiBgQXV0by1sb2NrIHNldCB0byAke2xhYmVsfS5gO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSAnJzsgcmVuZGVyKCk7IH0sIDMwMDApO1xufVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgIC8vIENsb3NlXG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGZvcm0gc3VibWlzc2lvblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0nKS5mb3JFYWNoKGZvcm0gPT4ge1xuICAgICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgIH0pO1xuXG4gICAgLy8gVW5sb2NrXG4gICAgJCgndW5sb2NrLWZvcm0nKT8uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBoYW5kbGVVbmxvY2soKTsgfSk7XG5cbiAgICAvLyBTZXQgcGFzc3dvcmRcbiAgICAkKCduZXctcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5uZXdQYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY29uZmlybS1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnc2V0LXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNldFBhc3N3b3JkKTtcblxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgICQoJ2N1cnJlbnQtcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ25ldy1wYXNzd29yZC1jaGFuZ2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY29uZmlybS1wYXNzd29yZC1jaGFuZ2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NoYW5nZS1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDaGFuZ2VQYXNzd29yZCk7XG5cbiAgICAvLyBSZW1vdmUgcGFzc3dvcmRcbiAgICAkKCdyZW1vdmUtcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdyZW1vdmUtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlUmVtb3ZlUGFzc3dvcmQpO1xuXG4gICAgLy8gQXV0by1sb2NrXG4gICAgJCgnYXV0b2xvY2stc2VsZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKTtcblxuICAgIC8vIFRydXN0IGxhZGRlcjogZW5jcnlwdGVkIGJhY2t1cCBleHBvcnQgKEwxIGxldmVsLXVwIGFjdGlvbilcbiAgICAkKCdiYWNrdXAtZXhwb3J0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUJhY2t1cEV4cG9ydCk7XG5cbiAgICAvLyBEZWxldGUgdmF1bHQgKGZyb20gbG9ja2VkIHZpZXcpXG4gICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJ2RlbGV0ZS1jb25maXJtLWRpYWxvZycpPy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0pO1xuICAgICQoJ2NhbmNlbC1kZWxldGUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAkKCdkZWxldGUtY29uZmlybS1kaWFsb2cnKT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJykuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIH0pO1xuICAgICQoJ2NvbmZpcm0tZGVsZXRlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZURlbGV0ZVZhdWx0KTtcbn1cblxuLy8gU2luZ2xlIHNpZ25hbCBjaGFubmVsIGZvciB0aGUgc3RyYW5kZWQta2V5IHN0YXRlLiBCZXN0LWVmZm9ydDogdGhlXG4vLyBoYXNFbmNyeXB0ZWREYXRhIGhhbmRsZXIgc2VsZi1oZWFscyBhIHZlcmlmaWVyIHZhdWx0IChhbiBpZGVtcG90ZW50IHN0b3JhZ2Vcbi8vIHdyaXRlKSB3aGljaCBpcyBleHBlY3RlZCBhbmQgYmVuaWduOyBhIGZhaWx1cmUgaGVyZSBqdXN0IGxlYXZlcyBzdHJhbmRlZEtleXNcbi8vIGF0IDAgcmF0aGVyIHRoYW4gYnJlYWtpbmcgdGhlIHBhZ2UuXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoU3RyYW5kZWRTaWduYWwoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW5jID0gYXdhaXQgYXNrR2F0ZSgnaGFzRW5jcnlwdGVkRGF0YScpO1xuICAgICAgICBzdGF0ZS5zdHJhbmRlZEtleXMgPSBlbmM/LnN0cmFuZGVkS2V5cyB8fCAwO1xuICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZEhhc2ggPSAhIWVuYz8uaGFzUGFzc3dvcmRIYXNoO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHYXRlUmVmdXNlZCkgdGhyb3cgZTsgLy8gb3RoZXJ3aXNlIGxlYXZlIHN0cmFuZGVkS2V5cyBhdCAwXG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gISEoYXdhaXQgYXNrR2F0ZSgnaXNFbmNyeXB0ZWQnKSk7XG4gICAgc3RhdGUuaXNMb2NrZWQgPSAhIShhd2FpdCBhc2tHYXRlKCdpc0xvY2tlZCcpKTtcbiAgICBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPSAoYXdhaXQgYXNrR2F0ZSgnZ2V0QXV0b0xvY2tUaW1lb3V0JykpID8/IDE1O1xuXG4gICAgYXdhaXQgcmVmcmVzaFN0cmFuZGVkU2lnbmFsKCk7XG5cbiAgICAvLyBUcnVzdC1sYWRkZXIgc2lnbmFscyBcdTIwMTQgZWFjaCBpcyBiZXN0LWVmZm9ydDsgYSBmYWlsdXJlIGp1c3QgbGVhdmVzIHRoZVxuICAgIC8vIHJ1bmcgdW5saXQgcmF0aGVyIHRoYW4gYnJlYWtpbmcgdGhlIHBhZ2UuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dldEFjdGl2ZVByb2ZpbGVJbmZvJyB9KTtcbiAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgIHN0YXRlLnByb2ZpbGVOYW1lID0gaW5mby5uYW1lIHx8ICcnO1xuICAgICAgICAgICAgc3RhdGUucHJvZmlsZU5wdWIgPSBpbmZvLm5wdWIgfHwgJyc7XG4gICAgICAgICAgICBzdGF0ZS5pc0J1bmtlclByb2ZpbGUgPSAhIWluZm8uaXNCdW5rZXI7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBidW5rZXIgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdidW5rZXJTZXJ2ZXIuc3RhdHVzJyB9KTtcbiAgICAgICAgc3RhdGUuYnVua2VyQWN0aXZlID0gISEoYnVua2VyICYmIGJ1bmtlci5hY3RpdmUpO1xuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZCA9IGF3YWl0IGFwaS5zdG9yYWdlLmdldCh7IGxhc3RCYWNrdXBBdDogbnVsbCB9KTtcbiAgICAgICAgc3RhdGUubGFzdEJhY2t1cEF0ID0gc3RvcmVkPy5sYXN0QmFja3VwQXQgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIC8vIE9wZW4gYWNjb3JkaW9uIG1hdGNoaW5nIFVSTCBoYXNoIChlLmcuICNtYXN0ZXItcGFzc3dvcmQgb3IgI2F1dG9sb2NrKVxuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpO1xuICAgIGlmIChoYXNoKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhhc2gpO1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC50YWdOYW1lID09PSAnREVUQUlMUycpIHtcbiAgICAgICAgICAgIHRhcmdldC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERlZmF1bHQ6IG9wZW4gbWFzdGVyLXBhc3N3b3JkIGFjY29yZGlvblxuICAgICAgICBjb25zdCBtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXN0ZXItcGFzc3dvcmQnKTtcbiAgICAgICAgaWYgKG1wKSBtcC5vcGVuID0gdHJ1ZTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBzdGFydFBhZ2UoaW5pdCkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxj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
