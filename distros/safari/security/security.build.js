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
    autolockSuccess: ""
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
        const colors = ["", "text-red-500", "text-orange-500", "text-yellow-600", "text-green-600", "text-green-700 font-bold"];
        strengthEl.textContent = labels[strength] || "";
        strengthEl.className = `text-xs mt-1 ${colors[strength] || ""}`;
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
        render();
        showPageSuccess("Vault deleted. You can now set up a new master password.");
      } else {
        alert("Failed to delete vault: " + (result?.error || "Unknown error"));
      }
    } catch (e) {
      alert("Failed to delete vault: " + e.message);
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
    $("show-delete-confirm-btn")?.addEventListener("click", () => {
      $("delete-confirm-dialog")?.classList.remove("hidden");
      $("show-delete-confirm-btn").style.display = "none";
    });
    $("cancel-delete-btn")?.addEventListener("click", () => {
      $("delete-confirm-dialog")?.classList.add("hidden");
      $("show-delete-confirm-btn").style.display = "inline-block";
    });
    $("confirm-delete-btn")?.addEventListener("click", handleDeleteVault);
  }
  async function init() {
    state.hasPassword = !!await api.runtime.sendMessage({ kind: "isEncrypted" });
    state.isLocked = !!await api.runtime.sendMessage({ kind: "isLocked" });
    state.autoLockMinutes = await api.runtime.sendMessage({ kind: "getAutoLockTimeout" }) ?? 15;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9zZWN1cml0eS9zZWN1cml0eS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgIGhhc1Bhc3N3b3JkOiBmYWxzZSxcbiAgICAvLyBVbmxvY2tcbiAgICB1bmxvY2tFcnJvcjogJycsXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgbmV3UGFzc3dvcmQ6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZDogJycsXG4gICAgc2VjdXJpdHlFcnJvcjogJycsXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkXG4gICAgY3VycmVudFBhc3N3b3JkOiAnJyxcbiAgICBuZXdQYXNzd29yZENoYW5nZTogJycsXG4gICAgY29uZmlybVBhc3N3b3JkQ2hhbmdlOiAnJyxcbiAgICBjaGFuZ2VFcnJvcjogJycsXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgcmVtb3ZlUGFzc3dvcmRJbnB1dDogJycsXG4gICAgcmVtb3ZlRXJyb3I6ICcnLFxuICAgIC8vIFNoYXJlZCBwYWdlLWxldmVsIHN1Y2Nlc3NcbiAgICBwYWdlU3VjY2VzczogJycsXG4gICAgLy8gQXV0by1sb2NrXG4gICAgYXV0b0xvY2tNaW51dGVzOiAxNSxcbiAgICBhdXRvbG9ja1N1Y2Nlc3M6ICcnLFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgocHcpIHtcbiAgICBpZiAocHcubGVuZ3RoID09PSAwKSByZXR1cm4gMDtcbiAgICBpZiAocHcubGVuZ3RoIDwgOCkgcmV0dXJuIDE7XG4gICAgbGV0IHNjb3JlID0gMjtcbiAgICBpZiAocHcubGVuZ3RoID49IDEyKSBzY29yZSsrO1xuICAgIGlmICgvW0EtWl0vLnRlc3QocHcpICYmIC9bYS16XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgaWYgKC9cXGQvLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvW15BLVphLXowLTldLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICByZXR1cm4gTWF0aC5taW4oc2NvcmUsIDUpO1xufVxuXG5mdW5jdGlvbiBzaG93UGFnZVN1Y2Nlc3MobXNnKSB7XG4gICAgc3RhdGUucGFnZVN1Y2Nlc3MgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnBhZ2VTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCA1MDAwKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIExvY2tlZCB2cyB1bmxvY2tlZCB2aWV3c1xuICAgIGNvbnN0IGxvY2tlZFZpZXcgPSAkKCdsb2NrZWQtdmlldycpO1xuICAgIGNvbnN0IHVubG9ja2VkVmlldyA9ICQoJ3VubG9ja2VkLXZpZXcnKTtcbiAgICBpZiAobG9ja2VkVmlldykgbG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmICh1bmxvY2tlZFZpZXcpIHVubG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgLy8gVW5sb2NrIGVycm9yXG4gICAgY29uc3QgdW5sb2NrRXJyID0gJCgndW5sb2NrLWVycm9yJyk7XG4gICAgaWYgKHVubG9ja0VycikgeyB1bmxvY2tFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS51bmxvY2tFcnJvcjsgdW5sb2NrRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS51bmxvY2tFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIFBhZ2UtbGV2ZWwgc3VjY2VzcyBiYW5uZXJcbiAgICBjb25zdCBwYWdlU3VjID0gJCgncGFnZS1zdWNjZXNzJyk7XG4gICAgaWYgKHBhZ2VTdWMpIHsgcGFnZVN1Yy50ZXh0Q29udGVudCA9IHN0YXRlLnBhZ2VTdWNjZXNzOyBwYWdlU3VjLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5wYWdlU3VjY2VzcyA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIFNlY3VyaXR5IHN0YXR1c1xuICAgIGNvbnN0IHNlY3VyaXR5U3RhdHVzID0gJCgnc2VjdXJpdHktc3RhdHVzJyk7XG4gICAgaWYgKHNlY3VyaXR5U3RhdHVzKSB7XG4gICAgICAgIHNlY3VyaXR5U3RhdHVzLnRleHRDb250ZW50ID0gc3RhdGUuaGFzUGFzc3dvcmRcbiAgICAgICAgICAgID8gJ01hc3RlciBwYXNzd29yZCBpcyBhY3RpdmUgXHUyMDE0IGtleXMgYXJlIGVuY3J5cHRlZCBhdCByZXN0LidcbiAgICAgICAgICAgIDogJ05vIG1hc3RlciBwYXNzd29yZCBzZXQgXHUyMDE0IGtleXMgYXJlIHN0b3JlZCB1bmVuY3J5cHRlZC4nO1xuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBzZWN0aW9ucyBiYXNlZCBvbiBwYXNzd29yZCBzdGF0ZVxuICAgIGNvbnN0IHNldFNlY3Rpb24gPSAkKCdzZXQtcGFzc3dvcmQtc2VjdGlvbicpO1xuICAgIGNvbnN0IGNoYW5nZVNlY3Rpb24gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtc2VjdGlvbicpO1xuICAgIGlmIChzZXRTZWN0aW9uKSBzZXRTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdub25lJyA6ICdibG9jayc7XG4gICAgaWYgKGNoYW5nZVNlY3Rpb24pIGNoYW5nZVNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIC8vIFBhc3N3b3JkIHN0cmVuZ3RoXG4gICAgY29uc3Qgc3RyZW5ndGhFbCA9ICQoJ3Bhc3N3b3JkLXN0cmVuZ3RoJyk7XG4gICAgaWYgKHN0cmVuZ3RoRWwpIHtcbiAgICAgICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkKSB7XG4gICAgICAgICAgICBjb25zdCBzdHJlbmd0aCA9IGNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgoc3RhdGUubmV3UGFzc3dvcmQpO1xuICAgICAgICAgICAgY29uc3QgbGFiZWxzID0gWycnLCAnVG9vIHNob3J0JywgJ1dlYWsnLCAnRmFpcicsICdTdHJvbmcnLCAnVmVyeSBzdHJvbmcnXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IFsnJywgJ3RleHQtcmVkLTUwMCcsICd0ZXh0LW9yYW5nZS01MDAnLCAndGV4dC15ZWxsb3ctNjAwJywgJ3RleHQtZ3JlZW4tNjAwJywgJ3RleHQtZ3JlZW4tNzAwIGZvbnQtYm9sZCddO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC50ZXh0Q29udGVudCA9IGxhYmVsc1tzdHJlbmd0aF0gfHwgJyc7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLmNsYXNzTmFtZSA9IGB0ZXh0LXhzIG10LTEgJHtjb2xvcnNbc3RyZW5ndGhdIHx8ICcnfWA7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IHNldEJ0biA9ICQoJ3NldC1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAoc2V0QnRuKSB7XG4gICAgICAgIHNldEJ0bi5kaXNhYmxlZCA9ICEoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoID49IDggJiYgc3RhdGUubmV3UGFzc3dvcmQgPT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZCk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IGNoYW5nZUJ0biA9ICQoJ2NoYW5nZS1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAoY2hhbmdlQnRuKSB7XG4gICAgICAgIGNoYW5nZUJ0bi5kaXNhYmxlZCA9ICEoc3RhdGUuY3VycmVudFBhc3N3b3JkLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLmxlbmd0aCA+PSA4ICYmXG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9PT0gc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3QgcmVtb3ZlQnRuID0gJCgncmVtb3ZlLXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChyZW1vdmVCdG4pIHtcbiAgICAgICAgcmVtb3ZlQnRuLmRpc2FibGVkID0gIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQ7XG4gICAgfVxuXG4gICAgLy8gSW5saW5lIGVycm9yIG1lc3NhZ2VzXG4gICAgY29uc3Qgc2VjRXJyID0gJCgnc2VjdXJpdHktZXJyb3InKTtcbiAgICBpZiAoc2VjRXJyKSB7IHNlY0Vyci50ZXh0Q29udGVudCA9IHN0YXRlLnNlY3VyaXR5RXJyb3I7IHNlY0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuc2VjdXJpdHlFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cbiAgICBjb25zdCBjaGdFcnIgPSAkKCdjaGFuZ2UtZXJyb3InKTtcbiAgICBpZiAoY2hnRXJyKSB7IGNoZ0Vyci50ZXh0Q29udGVudCA9IHN0YXRlLmNoYW5nZUVycm9yOyBjaGdFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmNoYW5nZUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuICAgIGNvbnN0IHJtRXJyID0gJCgncmVtb3ZlLWVycm9yJyk7XG4gICAgaWYgKHJtRXJyKSB7IHJtRXJyLnRleHRDb250ZW50ID0gc3RhdGUucmVtb3ZlRXJyb3I7IHJtRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5yZW1vdmVFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIEVuY3J5cHRpb24gc3RhdHVzIGJhbm5lclxuICAgIGNvbnN0IGVuY3J5cHRpb25TdGF0dXMgPSAkKCdlbmNyeXB0aW9uLXN0YXR1cycpO1xuICAgIGlmIChlbmNyeXB0aW9uU3RhdHVzKSBlbmNyeXB0aW9uU3RhdHVzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdmbGV4JyA6ICdub25lJztcblxuICAgIC8vIEF1dG8tbG9jayBzZWN0aW9uXG4gICAgY29uc3QgYXV0b2xvY2tEaXNhYmxlZCA9ICQoJ2F1dG9sb2NrLWRpc2FibGVkLW1zZycpO1xuICAgIGNvbnN0IGF1dG9sb2NrQ29udHJvbHMgPSAkKCdhdXRvbG9jay1jb250cm9scycpO1xuICAgIGlmIChhdXRvbG9ja0Rpc2FibGVkKSBhdXRvbG9ja0Rpc2FibGVkLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdub25lJyA6ICdibG9jayc7XG4gICAgaWYgKGF1dG9sb2NrQ29udHJvbHMpIGF1dG9sb2NrQ29udHJvbHMuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIGNvbnN0IGF1dG9sb2NrU2VsZWN0ID0gJCgnYXV0b2xvY2stc2VsZWN0Jyk7XG4gICAgaWYgKGF1dG9sb2NrU2VsZWN0KSBhdXRvbG9ja1NlbGVjdC52YWx1ZSA9IFN0cmluZyhzdGF0ZS5hdXRvTG9ja01pbnV0ZXMpO1xuXG4gICAgY29uc3QgYXV0b2xvY2tTdWNjZXNzID0gJCgnYXV0b2xvY2stc3VjY2VzcycpO1xuICAgIGlmIChhdXRvbG9ja1N1Y2Nlc3MpIHtcbiAgICAgICAgYXV0b2xvY2tTdWNjZXNzLnRleHRDb250ZW50ID0gc3RhdGUuYXV0b2xvY2tTdWNjZXNzO1xuICAgICAgICBhdXRvbG9ja1N1Y2Nlc3Muc3R5bGUuZGlzcGxheSA9IHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG4vLyAtLS0gSGFuZGxlcnMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVubG9jaygpIHtcbiAgICBjb25zdCBwdyA9ICQoJ3VubG9jay1wYXNzd29yZCcpPy52YWx1ZTtcbiAgICBpZiAoIXB3KSB7XG4gICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3VubG9jaycsIHBheWxvYWQ6IHB3IH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAnJztcbiAgICAgICAgICAgIGlmICgkKCd1bmxvY2stcGFzc3dvcmQnKSkgJCgndW5sb2NrLXBhc3N3b3JkJykudmFsdWUgPSAnJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ludmFsaWQgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHVubG9jay4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNldFBhc3N3b3JkKCkge1xuICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnJztcblxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZC5sZW5ndGggPCA4KSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkICE9PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3NldFBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHN0YXRlLm5ld1Bhc3N3b3JkLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIG1hc3RlciBwYXNzd29yZCBhY2NvcmRpb25cbiAgICAgICAgICAgIGNvbnN0IG1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hc3Rlci1wYXNzd29yZCcpO1xuICAgICAgICAgICAgaWYgKG1wICYmIG1wLm9wZW4pIG1wLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIHNldC4gWW91ciBrZXlzIGFyZSBub3cgZW5jcnlwdGVkIGF0IHJlc3QuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHNldCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNoYW5nZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLmN1cnJlbnRQYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBjdXJyZW50IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPCA4KSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdOZXcgcGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdjaGFuZ2VQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgb2xkUGFzc3dvcmQ6IHN0YXRlLmN1cnJlbnRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZDogc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9ICcnO1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZW1vdmVQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICcnO1xuXG4gICAgaWYgKCFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0KSB7XG4gICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFjb25maXJtKCdUaGlzIHdpbGwgcmVtb3ZlIGVuY3J5cHRpb24gZnJvbSB5b3VyIHByaXZhdGUga2V5cy4gVGhleSB3aWxsIGJlIHN0b3JlZCBhcyBwbGFpbnRleHQuIEFyZSB5b3Ugc3VyZT8nKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3JlbW92ZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9ICcnO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgcmVtb3ZlZC4gS2V5cyBhcmUgbm93IHN0b3JlZCB1bmVuY3J5cHRlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gcmVtb3ZlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVWYXVsdCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdyZXNldEFsbERhdGEnIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAvLyBSZXNldCBzdGF0ZSBhbmQgc2hvdyBzZXQgcGFzc3dvcmQgdmlld1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnVmF1bHQgZGVsZXRlZC4gWW91IGNhbiBub3cgc2V0IHVwIGEgbmV3IG1hc3RlciBwYXNzd29yZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gZGVsZXRlIHZhdWx0OiAnICsgKHJlc3VsdD8uZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InKSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gZGVsZXRlIHZhdWx0OiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKCkge1xuICAgIGNvbnN0IHNlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmICghc2VsZWN0KSByZXR1cm47XG4gICAgY29uc3QgbWludXRlcyA9IHBhcnNlSW50KHNlbGVjdC52YWx1ZSwgMTApO1xuICAgIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9IG1pbnV0ZXM7XG5cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzZXRBdXRvTG9ja1RpbWVvdXQnLFxuICAgICAgICBwYXlsb2FkOiBtaW51dGVzLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGFiZWwgPSBtaW51dGVzID09PSAwID8gJ2Rpc2FibGVkJ1xuICAgICAgICA6IG1pbnV0ZXMgPT09IDYwID8gJzEgaG91cidcbiAgICAgICAgOiBtaW51dGVzID09PSAxODAgPyAnMyBob3VycydcbiAgICAgICAgOiBgJHttaW51dGVzfSBtaW51dGVzYDtcbiAgICBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSBtaW51dGVzID09PSAwXG4gICAgICAgID8gJ0F1dG8tbG9jayBkaXNhYmxlZC4nXG4gICAgICAgIDogYEF1dG8tbG9jayBzZXQgdG8gJHtsYWJlbH0uYDtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuYXV0b2xvY2tTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCAzMDAwKTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAvLyBDbG9zZVxuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBmb3JtIHN1Ym1pc3Npb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmb3JtJykuZm9yRWFjaChmb3JtID0+IHtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICB9KTtcblxuICAgIC8vIFVubG9ja1xuICAgICQoJ3VubG9jay1mb3JtJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgaGFuZGxlVW5sb2NrKCk7IH0pO1xuXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgJCgnbmV3LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ3NldC1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXRQYXNzd29yZCk7XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmRcbiAgICAkKCdjdXJyZW50LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCduZXctcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2hhbmdlUGFzc3dvcmQpO1xuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVJlbW92ZVBhc3N3b3JkKTtcblxuICAgIC8vIEF1dG8tbG9ja1xuICAgICQoJ2F1dG9sb2NrLXNlbGVjdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBdXRvTG9ja0NoYW5nZSk7XG5cbiAgICAvLyBEZWxldGUgdmF1bHQgKGZyb20gbG9ja2VkIHZpZXcpXG4gICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJ2RlbGV0ZS1jb25maXJtLWRpYWxvZycpPy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0pO1xuICAgICQoJ2NhbmNlbC1kZWxldGUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAkKCdkZWxldGUtY29uZmlybS1kaWFsb2cnKT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgIH0pO1xuICAgICQoJ2NvbmZpcm0tZGVsZXRlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZURlbGV0ZVZhdWx0KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBzdGF0ZS5oYXNQYXNzd29yZCA9ICEhKGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzRW5jcnlwdGVkJyB9KSk7XG4gICAgc3RhdGUuaXNMb2NrZWQgPSAhIShhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0xvY2tlZCcgfSkpO1xuICAgIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9IChhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZXRBdXRvTG9ja1RpbWVvdXQnIH0pKSA/PyAxNTtcblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIC8vIE9wZW4gYWNjb3JkaW9uIG1hdGNoaW5nIFVSTCBoYXNoIChlLmcuICNtYXN0ZXItcGFzc3dvcmQgb3IgI2F1dG9sb2NrKVxuICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpO1xuICAgIGlmIChoYXNoKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhhc2gpO1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC50YWdOYW1lID09PSAnREVUQUlMUycpIHtcbiAgICAgICAgICAgIHRhcmdldC5vcGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIERlZmF1bHQ6IG9wZW4gbWFzdGVyLXBhc3N3b3JkIGFjY29yZGlvblxuICAgICAgICBjb25zdCBtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXN0ZXItcGFzc3dvcmQnKTtcbiAgICAgICAgaWYgKG1wKSBtcC5vcGVuID0gdHJ1ZTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFR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
