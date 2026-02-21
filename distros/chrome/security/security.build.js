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
    state.autolockSuccess = minutes === 0 ? "Auto-lock disabled." : `Auto-lock set to ${minutes} minutes.`;
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
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9zZWN1cml0eS9zZWN1cml0eS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgaXNMb2NrZWQ6IGZhbHNlLFxuICAgIGhhc1Bhc3N3b3JkOiBmYWxzZSxcbiAgICAvLyBVbmxvY2tcbiAgICB1bmxvY2tFcnJvcjogJycsXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgbmV3UGFzc3dvcmQ6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZDogJycsXG4gICAgc2VjdXJpdHlFcnJvcjogJycsXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkXG4gICAgY3VycmVudFBhc3N3b3JkOiAnJyxcbiAgICBuZXdQYXNzd29yZENoYW5nZTogJycsXG4gICAgY29uZmlybVBhc3N3b3JkQ2hhbmdlOiAnJyxcbiAgICBjaGFuZ2VFcnJvcjogJycsXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgcmVtb3ZlUGFzc3dvcmRJbnB1dDogJycsXG4gICAgcmVtb3ZlRXJyb3I6ICcnLFxuICAgIC8vIFNoYXJlZCBwYWdlLWxldmVsIHN1Y2Nlc3NcbiAgICBwYWdlU3VjY2VzczogJycsXG4gICAgLy8gQXV0by1sb2NrXG4gICAgYXV0b0xvY2tNaW51dGVzOiAxNSxcbiAgICBhdXRvbG9ja1N1Y2Nlc3M6ICcnLFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgocHcpIHtcbiAgICBpZiAocHcubGVuZ3RoID09PSAwKSByZXR1cm4gMDtcbiAgICBpZiAocHcubGVuZ3RoIDwgOCkgcmV0dXJuIDE7XG4gICAgbGV0IHNjb3JlID0gMjtcbiAgICBpZiAocHcubGVuZ3RoID49IDEyKSBzY29yZSsrO1xuICAgIGlmICgvW0EtWl0vLnRlc3QocHcpICYmIC9bYS16XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgaWYgKC9cXGQvLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvW15BLVphLXowLTldLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICByZXR1cm4gTWF0aC5taW4oc2NvcmUsIDUpO1xufVxuXG5mdW5jdGlvbiBzaG93UGFnZVN1Y2Nlc3MobXNnKSB7XG4gICAgc3RhdGUucGFnZVN1Y2Nlc3MgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnBhZ2VTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCA1MDAwKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIExvY2tlZCB2cyB1bmxvY2tlZCB2aWV3c1xuICAgIGNvbnN0IGxvY2tlZFZpZXcgPSAkKCdsb2NrZWQtdmlldycpO1xuICAgIGNvbnN0IHVubG9ja2VkVmlldyA9ICQoJ3VubG9ja2VkLXZpZXcnKTtcbiAgICBpZiAobG9ja2VkVmlldykgbG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmICh1bmxvY2tlZFZpZXcpIHVubG9ja2VkVmlldy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaXNMb2NrZWQgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgLy8gVW5sb2NrIGVycm9yXG4gICAgY29uc3QgdW5sb2NrRXJyID0gJCgndW5sb2NrLWVycm9yJyk7XG4gICAgaWYgKHVubG9ja0VycikgeyB1bmxvY2tFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS51bmxvY2tFcnJvcjsgdW5sb2NrRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS51bmxvY2tFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIFBhZ2UtbGV2ZWwgc3VjY2VzcyBiYW5uZXJcbiAgICBjb25zdCBwYWdlU3VjID0gJCgncGFnZS1zdWNjZXNzJyk7XG4gICAgaWYgKHBhZ2VTdWMpIHsgcGFnZVN1Yy50ZXh0Q29udGVudCA9IHN0YXRlLnBhZ2VTdWNjZXNzOyBwYWdlU3VjLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5wYWdlU3VjY2VzcyA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIFNlY3VyaXR5IHN0YXR1c1xuICAgIGNvbnN0IHNlY3VyaXR5U3RhdHVzID0gJCgnc2VjdXJpdHktc3RhdHVzJyk7XG4gICAgaWYgKHNlY3VyaXR5U3RhdHVzKSB7XG4gICAgICAgIHNlY3VyaXR5U3RhdHVzLnRleHRDb250ZW50ID0gc3RhdGUuaGFzUGFzc3dvcmRcbiAgICAgICAgICAgID8gJ01hc3RlciBwYXNzd29yZCBpcyBhY3RpdmUgXHUyMDE0IGtleXMgYXJlIGVuY3J5cHRlZCBhdCByZXN0LidcbiAgICAgICAgICAgIDogJ05vIG1hc3RlciBwYXNzd29yZCBzZXQgXHUyMDE0IGtleXMgYXJlIHN0b3JlZCB1bmVuY3J5cHRlZC4nO1xuICAgIH1cblxuICAgIC8vIFRvZ2dsZSBzZWN0aW9ucyBiYXNlZCBvbiBwYXNzd29yZCBzdGF0ZVxuICAgIGNvbnN0IHNldFNlY3Rpb24gPSAkKCdzZXQtcGFzc3dvcmQtc2VjdGlvbicpO1xuICAgIGNvbnN0IGNoYW5nZVNlY3Rpb24gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtc2VjdGlvbicpO1xuICAgIGlmIChzZXRTZWN0aW9uKSBzZXRTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdub25lJyA6ICdibG9jayc7XG4gICAgaWYgKGNoYW5nZVNlY3Rpb24pIGNoYW5nZVNlY3Rpb24uc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIC8vIFBhc3N3b3JkIHN0cmVuZ3RoXG4gICAgY29uc3Qgc3RyZW5ndGhFbCA9ICQoJ3Bhc3N3b3JkLXN0cmVuZ3RoJyk7XG4gICAgaWYgKHN0cmVuZ3RoRWwpIHtcbiAgICAgICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkKSB7XG4gICAgICAgICAgICBjb25zdCBzdHJlbmd0aCA9IGNhbGN1bGF0ZVBhc3N3b3JkU3RyZW5ndGgoc3RhdGUubmV3UGFzc3dvcmQpO1xuICAgICAgICAgICAgY29uc3QgbGFiZWxzID0gWycnLCAnVG9vIHNob3J0JywgJ1dlYWsnLCAnRmFpcicsICdTdHJvbmcnLCAnVmVyeSBzdHJvbmcnXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IFsnJywgJ3RleHQtcmVkLTUwMCcsICd0ZXh0LW9yYW5nZS01MDAnLCAndGV4dC15ZWxsb3ctNjAwJywgJ3RleHQtZ3JlZW4tNjAwJywgJ3RleHQtZ3JlZW4tNzAwIGZvbnQtYm9sZCddO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC50ZXh0Q29udGVudCA9IGxhYmVsc1tzdHJlbmd0aF0gfHwgJyc7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLmNsYXNzTmFtZSA9IGB0ZXh0LXhzIG10LTEgJHtjb2xvcnNbc3RyZW5ndGhdIHx8ICcnfWA7XG4gICAgICAgICAgICBzdHJlbmd0aEVsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IHNldEJ0biA9ICQoJ3NldC1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAoc2V0QnRuKSB7XG4gICAgICAgIHNldEJ0bi5kaXNhYmxlZCA9ICEoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoID49IDggJiYgc3RhdGUubmV3UGFzc3dvcmQgPT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZCk7XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IGNoYW5nZUJ0biA9ICQoJ2NoYW5nZS1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAoY2hhbmdlQnRuKSB7XG4gICAgICAgIGNoYW5nZUJ0bi5kaXNhYmxlZCA9ICEoc3RhdGUuY3VycmVudFBhc3N3b3JkLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLmxlbmd0aCA+PSA4ICYmXG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9PT0gc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgcGFzc3dvcmQgYnV0dG9uXG4gICAgY29uc3QgcmVtb3ZlQnRuID0gJCgncmVtb3ZlLXBhc3N3b3JkLWJ0bicpO1xuICAgIGlmIChyZW1vdmVCdG4pIHtcbiAgICAgICAgcmVtb3ZlQnRuLmRpc2FibGVkID0gIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQ7XG4gICAgfVxuXG4gICAgLy8gSW5saW5lIGVycm9yIG1lc3NhZ2VzXG4gICAgY29uc3Qgc2VjRXJyID0gJCgnc2VjdXJpdHktZXJyb3InKTtcbiAgICBpZiAoc2VjRXJyKSB7IHNlY0Vyci50ZXh0Q29udGVudCA9IHN0YXRlLnNlY3VyaXR5RXJyb3I7IHNlY0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuc2VjdXJpdHlFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cbiAgICBjb25zdCBjaGdFcnIgPSAkKCdjaGFuZ2UtZXJyb3InKTtcbiAgICBpZiAoY2hnRXJyKSB7IGNoZ0Vyci50ZXh0Q29udGVudCA9IHN0YXRlLmNoYW5nZUVycm9yOyBjaGdFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmNoYW5nZUVycm9yID8gJ2Jsb2NrJyA6ICdub25lJzsgfVxuICAgIGNvbnN0IHJtRXJyID0gJCgncmVtb3ZlLWVycm9yJyk7XG4gICAgaWYgKHJtRXJyKSB7IHJtRXJyLnRleHRDb250ZW50ID0gc3RhdGUucmVtb3ZlRXJyb3I7IHJtRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5yZW1vdmVFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cblxuICAgIC8vIEF1dG8tbG9jayBzZWN0aW9uXG4gICAgY29uc3QgYXV0b2xvY2tEaXNhYmxlZCA9ICQoJ2F1dG9sb2NrLWRpc2FibGVkLW1zZycpO1xuICAgIGNvbnN0IGF1dG9sb2NrQ29udHJvbHMgPSAkKCdhdXRvbG9jay1jb250cm9scycpO1xuICAgIGlmIChhdXRvbG9ja0Rpc2FibGVkKSBhdXRvbG9ja0Rpc2FibGVkLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdub25lJyA6ICdibG9jayc7XG4gICAgaWYgKGF1dG9sb2NrQ29udHJvbHMpIGF1dG9sb2NrQ29udHJvbHMuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmhhc1Bhc3N3b3JkID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIGNvbnN0IGF1dG9sb2NrU2VsZWN0ID0gJCgnYXV0b2xvY2stc2VsZWN0Jyk7XG4gICAgaWYgKGF1dG9sb2NrU2VsZWN0KSBhdXRvbG9ja1NlbGVjdC52YWx1ZSA9IFN0cmluZyhzdGF0ZS5hdXRvTG9ja01pbnV0ZXMpO1xuXG4gICAgY29uc3QgYXV0b2xvY2tTdWNjZXNzID0gJCgnYXV0b2xvY2stc3VjY2VzcycpO1xuICAgIGlmIChhdXRvbG9ja1N1Y2Nlc3MpIHtcbiAgICAgICAgYXV0b2xvY2tTdWNjZXNzLnRleHRDb250ZW50ID0gc3RhdGUuYXV0b2xvY2tTdWNjZXNzO1xuICAgICAgICBhdXRvbG9ja1N1Y2Nlc3Muc3R5bGUuZGlzcGxheSA9IHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG4vLyAtLS0gSGFuZGxlcnMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVubG9jaygpIHtcbiAgICBjb25zdCBwdyA9ICQoJ3VubG9jay1wYXNzd29yZCcpPy52YWx1ZTtcbiAgICBpZiAoIXB3KSB7XG4gICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3VubG9jaycsIHBheWxvYWQ6IHB3IH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5pc0xvY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAnJztcbiAgICAgICAgICAgIGlmICgkKCd1bmxvY2stcGFzc3dvcmQnKSkgJCgndW5sb2NrLXBhc3N3b3JkJykudmFsdWUgPSAnJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ludmFsaWQgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHVubG9jay4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVNldFBhc3N3b3JkKCkge1xuICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnJztcblxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZC5sZW5ndGggPCA4KSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkICE9PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3NldFBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHN0YXRlLm5ld1Bhc3N3b3JkLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSB0cnVlO1xuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9ICcnO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgc2V0LiBZb3VyIGtleXMgYXJlIG5vdyBlbmNyeXB0ZWQgYXQgcmVzdC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBzZXQgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2hhbmdlUGFzc3dvcmQoKSB7XG4gICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnJztcblxuICAgIGlmICghc3RhdGUuY3VycmVudFBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlLmxlbmd0aCA8IDgpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAnTmV3IHBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlKSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZHMgZG8gbm90IG1hdGNoLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2NoYW5nZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBvbGRQYXNzd29yZDogc3RhdGUuY3VycmVudFBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSAnJztcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIGNoYW5nZWQgc3VjY2Vzc2Z1bGx5LicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGNoYW5nZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAnUGxlYXNlIGVudGVyIHlvdXIgY3VycmVudCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWNvbmZpcm0oJ1RoaXMgd2lsbCByZW1vdmUgZW5jcnlwdGlvbiBmcm9tIHlvdXIgcHJpdmF0ZSBrZXlzLiBUaGV5IHdpbGwgYmUgc3RvcmVkIGFzIHBsYWludGV4dC4gQXJlIHlvdSBzdXJlPycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAncmVtb3ZlUGFzc3dvcmQnLFxuICAgICAgICAgICAgcGF5bG9hZDogc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gJyc7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCByZW1vdmVkLiBLZXlzIGFyZSBub3cgc3RvcmVkIHVuZW5jcnlwdGVkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSAocmVzdWx0ICYmIHJlc3VsdC5lcnJvcikgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5yZW1vdmVFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlbW92ZSBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZURlbGV0ZVZhdWx0KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QWxsRGF0YScgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHN0YXRlIGFuZCBzaG93IHNldCBwYXNzd29yZCB2aWV3XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdWYXVsdCBkZWxldGVkLiBZb3UgY2FuIG5vdyBzZXQgdXAgYSBuZXcgbWFzdGVyIHBhc3N3b3JkLicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBkZWxldGUgdmF1bHQ6ICcgKyAocmVzdWx0Py5lcnJvciB8fCAnVW5rbm93biBlcnJvcicpKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYWxlcnQoJ0ZhaWxlZCB0byBkZWxldGUgdmF1bHQ6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQXV0b0xvY2tDaGFuZ2UoKSB7XG4gICAgY29uc3Qgc2VsZWN0ID0gJCgnYXV0b2xvY2stc2VsZWN0Jyk7XG4gICAgaWYgKCFzZWxlY3QpIHJldHVybjtcbiAgICBjb25zdCBtaW51dGVzID0gcGFyc2VJbnQoc2VsZWN0LnZhbHVlLCAxMCk7XG4gICAgc3RhdGUuYXV0b0xvY2tNaW51dGVzID0gbWludXRlcztcblxuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ3NldEF1dG9Mb2NrVGltZW91dCcsXG4gICAgICAgIHBheWxvYWQ6IG1pbnV0ZXMsXG4gICAgfSk7XG5cbiAgICBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSBtaW51dGVzID09PSAwXG4gICAgICAgID8gJ0F1dG8tbG9jayBkaXNhYmxlZC4nXG4gICAgICAgIDogYEF1dG8tbG9jayBzZXQgdG8gJHttaW51dGVzfSBtaW51dGVzLmA7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA9ICcnOyByZW5kZXIoKTsgfSwgMzAwMCk7XG59XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgLy8gQ2xvc2VcbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG5cbiAgICAvLyBQcmV2ZW50IGRlZmF1bHQgZm9ybSBzdWJtaXNzaW9uXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZm9ybScpLmZvckVhY2goZm9ybSA9PiB7XG4gICAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gICAgfSk7XG5cbiAgICAvLyBVbmxvY2tcbiAgICAkKCd1bmxvY2stZm9ybScpPy5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4geyBlLnByZXZlbnREZWZhdWx0KCk7IGhhbmRsZVVubG9jaygpOyB9KTtcblxuICAgIC8vIFNldCBwYXNzd29yZFxuICAgICQoJ25ldy1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLm5ld1Bhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjb25maXJtLXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY29uZmlybVBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdzZXQtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlU2V0UGFzc3dvcmQpO1xuXG4gICAgLy8gQ2hhbmdlIHBhc3N3b3JkXG4gICAgJCgnY3VycmVudC1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmN1cnJlbnRQYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnbmV3LXBhc3N3b3JkLWNoYW5nZScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLm5ld1Bhc3N3b3JkQ2hhbmdlID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjb25maXJtLXBhc3N3b3JkLWNoYW5nZScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY2hhbmdlLXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNoYW5nZVBhc3N3b3JkKTtcblxuICAgIC8vIFJlbW92ZSBwYXNzd29yZFxuICAgICQoJ3JlbW92ZS1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ3JlbW92ZS1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVSZW1vdmVQYXNzd29yZCk7XG5cbiAgICAvLyBBdXRvLWxvY2tcbiAgICAkKCdhdXRvbG9jay1zZWxlY3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaGFuZGxlQXV0b0xvY2tDaGFuZ2UpO1xuXG4gICAgLy8gRGVsZXRlIHZhdWx0IChmcm9tIGxvY2tlZCB2aWV3KVxuICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAkKCdkZWxldGUtY29uZmlybS1kaWFsb2cnKT8uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgICQoJ3Nob3ctZGVsZXRlLWNvbmZpcm0tYnRuJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9KTtcbiAgICAkKCdjYW5jZWwtZGVsZXRlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnZGVsZXRlLWNvbmZpcm0tZGlhbG9nJyk/LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICB9KTtcbiAgICAkKCdjb25maXJtLWRlbGV0ZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVEZWxldGVWYXVsdCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgc3RhdGUuaGFzUGFzc3dvcmQgPSAhIShhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSkpO1xuICAgIHN0YXRlLmlzTG9ja2VkID0gISEoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNMb2NrZWQnIH0pKTtcbiAgICBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPSAoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2V0QXV0b0xvY2tUaW1lb3V0JyB9KSkgPz8gMTU7XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxT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
