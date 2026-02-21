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
    }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9zZWN1cml0eS9zZWN1cml0eS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGlzTG9ja2VkOiBmYWxzZSxcbiAgICBoYXNQYXNzd29yZDogZmFsc2UsXG4gICAgLy8gVW5sb2NrXG4gICAgdW5sb2NrRXJyb3I6ICcnLFxuICAgIC8vIFNldCBwYXNzd29yZFxuICAgIG5ld1Bhc3N3b3JkOiAnJyxcbiAgICBjb25maXJtUGFzc3dvcmQ6ICcnLFxuICAgIHNlY3VyaXR5RXJyb3I6ICcnLFxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgIGN1cnJlbnRQYXNzd29yZDogJycsXG4gICAgbmV3UGFzc3dvcmRDaGFuZ2U6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZENoYW5nZTogJycsXG4gICAgY2hhbmdlRXJyb3I6ICcnLFxuICAgIC8vIFJlbW92ZSBwYXNzd29yZFxuICAgIHJlbW92ZVBhc3N3b3JkSW5wdXQ6ICcnLFxuICAgIHJlbW92ZUVycm9yOiAnJyxcbiAgICAvLyBTaGFyZWQgcGFnZS1sZXZlbCBzdWNjZXNzXG4gICAgcGFnZVN1Y2Nlc3M6ICcnLFxuICAgIC8vIEF1dG8tbG9ja1xuICAgIGF1dG9Mb2NrTWludXRlczogMTUsXG4gICAgYXV0b2xvY2tTdWNjZXNzOiAnJyxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHB3KSB7XG4gICAgaWYgKHB3Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHB3Lmxlbmd0aCA8IDgpIHJldHVybiAxO1xuICAgIGxldCBzY29yZSA9IDI7XG4gICAgaWYgKHB3Lmxlbmd0aCA+PSAxMikgc2NvcmUrKztcbiAgICBpZiAoL1tBLVpdLy50ZXN0KHB3KSAmJiAvW2Etel0vLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvXFxkLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICBpZiAoL1teQS1aYS16MC05XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgcmV0dXJuIE1hdGgubWluKHNjb3JlLCA1KTtcbn1cblxuZnVuY3Rpb24gc2hvd1BhZ2VTdWNjZXNzKG1zZykge1xuICAgIHN0YXRlLnBhZ2VTdWNjZXNzID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5wYWdlU3VjY2VzcyA9ICcnOyByZW5kZXIoKTsgfSwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBMb2NrZWQgdnMgdW5sb2NrZWQgdmlld3NcbiAgICBjb25zdCBsb2NrZWRWaWV3ID0gJCgnbG9ja2VkLXZpZXcnKTtcbiAgICBjb25zdCB1bmxvY2tlZFZpZXcgPSAkKCd1bmxvY2tlZC12aWV3Jyk7XG4gICAgaWYgKGxvY2tlZFZpZXcpIGxvY2tlZFZpZXcuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmlzTG9ja2VkID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAodW5sb2NrZWRWaWV3KSB1bmxvY2tlZFZpZXcuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmlzTG9ja2VkID8gJ25vbmUnIDogJ2Jsb2NrJztcblxuICAgIC8vIFVubG9jayBlcnJvclxuICAgIGNvbnN0IHVubG9ja0VyciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGlmICh1bmxvY2tFcnIpIHsgdW5sb2NrRXJyLnRleHRDb250ZW50ID0gc3RhdGUudW5sb2NrRXJyb3I7IHVubG9ja0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudW5sb2NrRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBQYWdlLWxldmVsIHN1Y2Nlc3MgYmFubmVyXG4gICAgY29uc3QgcGFnZVN1YyA9ICQoJ3BhZ2Utc3VjY2VzcycpO1xuICAgIGlmIChwYWdlU3VjKSB7IHBhZ2VTdWMudGV4dENvbnRlbnQgPSBzdGF0ZS5wYWdlU3VjY2VzczsgcGFnZVN1Yy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucGFnZVN1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBTZWN1cml0eSBzdGF0dXNcbiAgICBjb25zdCBzZWN1cml0eVN0YXR1cyA9ICQoJ3NlY3VyaXR5LXN0YXR1cycpO1xuICAgIGlmIChzZWN1cml0eVN0YXR1cykge1xuICAgICAgICBzZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9IHN0YXRlLmhhc1Bhc3N3b3JkXG4gICAgICAgICAgICA/ICdNYXN0ZXIgcGFzc3dvcmQgaXMgYWN0aXZlIFx1MjAxNCBrZXlzIGFyZSBlbmNyeXB0ZWQgYXQgcmVzdC4nXG4gICAgICAgICAgICA6ICdObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IFx1MjAxNCBrZXlzIGFyZSBzdG9yZWQgdW5lbmNyeXB0ZWQuJztcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgc2VjdGlvbnMgYmFzZWQgb24gcGFzc3dvcmQgc3RhdGVcbiAgICBjb25zdCBzZXRTZWN0aW9uID0gJCgnc2V0LXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBjb25zdCBjaGFuZ2VTZWN0aW9uID0gJCgnY2hhbmdlLXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBpZiAoc2V0U2VjdGlvbikgc2V0U2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChjaGFuZ2VTZWN0aW9uKSBjaGFuZ2VTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBQYXNzd29yZCBzdHJlbmd0aFxuICAgIGNvbnN0IHN0cmVuZ3RoRWwgPSAkKCdwYXNzd29yZC1zdHJlbmd0aCcpO1xuICAgIGlmIChzdHJlbmd0aEVsKSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCkge1xuICAgICAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHN0YXRlLm5ld1Bhc3N3b3JkKTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVscyA9IFsnJywgJ1RvbyBzaG9ydCcsICdXZWFrJywgJ0ZhaXInLCAnU3Ryb25nJywgJ1Zlcnkgc3Ryb25nJ107XG4gICAgICAgICAgICBjb25zdCBjb2xvcnMgPSBbJycsICd0ZXh0LXJlZC01MDAnLCAndGV4dC1vcmFuZ2UtNTAwJywgJ3RleHQteWVsbG93LTYwMCcsICd0ZXh0LWdyZWVuLTYwMCcsICd0ZXh0LWdyZWVuLTcwMCBmb250LWJvbGQnXTtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwudGV4dENvbnRlbnQgPSBsYWJlbHNbc3RyZW5ndGhdIHx8ICcnO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5jbGFzc05hbWUgPSBgdGV4dC14cyBtdC0xICR7Y29sb3JzW3N0cmVuZ3RoXSB8fCAnJ31gO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBzZXRCdG4gPSAkKCdzZXQtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHNldEJ0bikge1xuICAgICAgICBzZXRCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIHN0YXRlLm5ld1Bhc3N3b3JkID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBjaGFuZ2VCdG4gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKGNoYW5nZUJ0bikge1xuICAgICAgICBjaGFuZ2VCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLmN1cnJlbnRQYXNzd29yZC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPj0gOCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IHJlbW92ZUJ0biA9ICQoJ3JlbW92ZS1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAocmVtb3ZlQnRuKSB7XG4gICAgICAgIHJlbW92ZUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0O1xuICAgIH1cblxuICAgIC8vIElubGluZSBlcnJvciBtZXNzYWdlc1xuICAgIGNvbnN0IHNlY0VyciA9ICQoJ3NlY3VyaXR5LWVycm9yJyk7XG4gICAgaWYgKHNlY0VycikgeyBzZWNFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5zZWN1cml0eUVycm9yOyBzZWNFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlY3VyaXR5RXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3QgY2hnRXJyID0gJCgnY2hhbmdlLWVycm9yJyk7XG4gICAgaWYgKGNoZ0VycikgeyBjaGdFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5jaGFuZ2VFcnJvcjsgY2hnRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5jaGFuZ2VFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cbiAgICBjb25zdCBybUVyciA9ICQoJ3JlbW92ZS1lcnJvcicpO1xuICAgIGlmIChybUVycikgeyBybUVyci50ZXh0Q29udGVudCA9IHN0YXRlLnJlbW92ZUVycm9yOyBybUVyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucmVtb3ZlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBBdXRvLWxvY2sgc2VjdGlvblxuICAgIGNvbnN0IGF1dG9sb2NrRGlzYWJsZWQgPSAkKCdhdXRvbG9jay1kaXNhYmxlZC1tc2cnKTtcbiAgICBjb25zdCBhdXRvbG9ja0NvbnRyb2xzID0gJCgnYXV0b2xvY2stY29udHJvbHMnKTtcbiAgICBpZiAoYXV0b2xvY2tEaXNhYmxlZCkgYXV0b2xvY2tEaXNhYmxlZC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChhdXRvbG9ja0NvbnRyb2xzKSBhdXRvbG9ja0NvbnRyb2xzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBjb25zdCBhdXRvbG9ja1NlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmIChhdXRvbG9ja1NlbGVjdCkgYXV0b2xvY2tTZWxlY3QudmFsdWUgPSBTdHJpbmcoc3RhdGUuYXV0b0xvY2tNaW51dGVzKTtcblxuICAgIGNvbnN0IGF1dG9sb2NrU3VjY2VzcyA9ICQoJ2F1dG9sb2NrLXN1Y2Nlc3MnKTtcbiAgICBpZiAoYXV0b2xvY2tTdWNjZXNzKSB7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy50ZXh0Q29udGVudCA9IHN0YXRlLmF1dG9sb2NrU3VjY2VzcztcbiAgICAgICAgYXV0b2xvY2tTdWNjZXNzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuLy8gLS0tIEhhbmRsZXJzIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2soKSB7XG4gICAgY29uc3QgcHcgPSAkKCd1bmxvY2stcGFzc3dvcmQnKT8udmFsdWU7XG4gICAgaWYgKCFwdykge1xuICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd1bmxvY2snLCBwYXlsb2FkOiBwdyB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gJyc7XG4gICAgICAgICAgICBpZiAoJCgndW5sb2NrLXBhc3N3b3JkJykpICQoJ3VubG9jay1wYXNzd29yZCcpLnZhbHVlID0gJyc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdJbnZhbGlkIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1bmxvY2suJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXRQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJyc7XG5cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdzZXRQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiBzdGF0ZS5uZXdQYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIHNldC4gWW91ciBrZXlzIGFyZSBub3cgZW5jcnlwdGVkIGF0IHJlc3QuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHNldCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNoYW5nZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLmN1cnJlbnRQYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBjdXJyZW50IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPCA4KSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdOZXcgcGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdjaGFuZ2VQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgb2xkUGFzc3dvcmQ6IHN0YXRlLmN1cnJlbnRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZDogc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9ICcnO1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZW1vdmVQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICcnO1xuXG4gICAgaWYgKCFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0KSB7XG4gICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFjb25maXJtKCdUaGlzIHdpbGwgcmVtb3ZlIGVuY3J5cHRpb24gZnJvbSB5b3VyIHByaXZhdGUga2V5cy4gVGhleSB3aWxsIGJlIHN0b3JlZCBhcyBwbGFpbnRleHQuIEFyZSB5b3Ugc3VyZT8nKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3JlbW92ZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9ICcnO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgcmVtb3ZlZC4gS2V5cyBhcmUgbm93IHN0b3JlZCB1bmVuY3J5cHRlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gcmVtb3ZlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEZWxldGVWYXVsdCgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdyZXNldEFsbERhdGEnIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAvLyBSZXNldCBzdGF0ZSBhbmQgc2hvdyBzZXQgcGFzc3dvcmQgdmlld1xuICAgICAgICAgICAgc3RhdGUuaGFzUGFzc3dvcmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnVmF1bHQgZGVsZXRlZC4gWW91IGNhbiBub3cgc2V0IHVwIGEgbmV3IG1hc3RlciBwYXNzd29yZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gZGVsZXRlIHZhdWx0OiAnICsgKHJlc3VsdD8uZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InKSk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGFsZXJ0KCdGYWlsZWQgdG8gZGVsZXRlIHZhdWx0OiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKCkge1xuICAgIGNvbnN0IHNlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmICghc2VsZWN0KSByZXR1cm47XG4gICAgY29uc3QgbWludXRlcyA9IHBhcnNlSW50KHNlbGVjdC52YWx1ZSwgMTApO1xuICAgIHN0YXRlLmF1dG9Mb2NrTWludXRlcyA9IG1pbnV0ZXM7XG5cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzZXRBdXRvTG9ja1RpbWVvdXQnLFxuICAgICAgICBwYXlsb2FkOiBtaW51dGVzLFxuICAgIH0pO1xuXG4gICAgc3RhdGUuYXV0b2xvY2tTdWNjZXNzID0gbWludXRlcyA9PT0gMFxuICAgICAgICA/ICdBdXRvLWxvY2sgZGlzYWJsZWQuJ1xuICAgICAgICA6IGBBdXRvLWxvY2sgc2V0IHRvICR7bWludXRlc30gbWludXRlcy5gO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPSAnJzsgcmVuZGVyKCk7IH0sIDMwMDApO1xufVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgIC8vIENsb3NlXG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xuXG4gICAgLy8gUHJldmVudCBkZWZhdWx0IGZvcm0gc3VibWlzc2lvblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0nKS5mb3JFYWNoKGZvcm0gPT4ge1xuICAgICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgIH0pO1xuXG4gICAgLy8gVW5sb2NrXG4gICAgJCgndW5sb2NrLWZvcm0nKT8uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBoYW5kbGVVbmxvY2soKTsgfSk7XG5cbiAgICAvLyBTZXQgcGFzc3dvcmRcbiAgICAkKCduZXctcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5uZXdQYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY29uZmlybS1wYXNzd29yZCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmNvbmZpcm1QYXNzd29yZCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnc2V0LXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVNldFBhc3N3b3JkKTtcblxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgICQoJ2N1cnJlbnQtcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jdXJyZW50UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ25ldy1wYXNzd29yZC1jaGFuZ2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgnY29uZmlybS1wYXNzd29yZC1jaGFuZ2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NoYW5nZS1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDaGFuZ2VQYXNzd29yZCk7XG5cbiAgICAvLyBSZW1vdmUgcGFzc3dvcmRcbiAgICAkKCdyZW1vdmUtcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0ID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdyZW1vdmUtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlUmVtb3ZlUGFzc3dvcmQpO1xuXG4gICAgLy8gQXV0by1sb2NrXG4gICAgJCgnYXV0b2xvY2stc2VsZWN0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGhhbmRsZUF1dG9Mb2NrQ2hhbmdlKTtcblxuICAgIC8vIERlbGV0ZSB2YXVsdCAoZnJvbSBsb2NrZWQgdmlldylcbiAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgJCgnZGVsZXRlLWNvbmZpcm0tZGlhbG9nJyk/LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICAkKCdzaG93LWRlbGV0ZS1jb25maXJtLWJ0bicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSk7XG4gICAgJCgnY2FuY2VsLWRlbGV0ZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICQoJ2RlbGV0ZS1jb25maXJtLWRpYWxvZycpPy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICAgICAgJCgnc2hvdy1kZWxldGUtY29uZmlybS1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgfSk7XG4gICAgJCgnY29uZmlybS1kZWxldGUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlRGVsZXRlVmF1bHQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gISEoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pKTtcbiAgICBzdGF0ZS5pc0xvY2tlZCA9ICEhKGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzTG9ja2VkJyB9KSk7XG4gICAgc3RhdGUuYXV0b0xvY2tNaW51dGVzID0gKGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dldEF1dG9Mb2NrVGltZW91dCcgfSkpID8/IDE1O1xuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixNQUFJLENBQUMsVUFBVTtBQUNYLFVBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLEVBQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQU1yRSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FB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
