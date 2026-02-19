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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9zZWN1cml0eS9zZWN1cml0eS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGlzTG9ja2VkOiBmYWxzZSxcbiAgICBoYXNQYXNzd29yZDogZmFsc2UsXG4gICAgLy8gVW5sb2NrXG4gICAgdW5sb2NrRXJyb3I6ICcnLFxuICAgIC8vIFNldCBwYXNzd29yZFxuICAgIG5ld1Bhc3N3b3JkOiAnJyxcbiAgICBjb25maXJtUGFzc3dvcmQ6ICcnLFxuICAgIHNlY3VyaXR5RXJyb3I6ICcnLFxuICAgIC8vIENoYW5nZSBwYXNzd29yZFxuICAgIGN1cnJlbnRQYXNzd29yZDogJycsXG4gICAgbmV3UGFzc3dvcmRDaGFuZ2U6ICcnLFxuICAgIGNvbmZpcm1QYXNzd29yZENoYW5nZTogJycsXG4gICAgY2hhbmdlRXJyb3I6ICcnLFxuICAgIC8vIFJlbW92ZSBwYXNzd29yZFxuICAgIHJlbW92ZVBhc3N3b3JkSW5wdXQ6ICcnLFxuICAgIHJlbW92ZUVycm9yOiAnJyxcbiAgICAvLyBTaGFyZWQgcGFnZS1sZXZlbCBzdWNjZXNzXG4gICAgcGFnZVN1Y2Nlc3M6ICcnLFxuICAgIC8vIEF1dG8tbG9ja1xuICAgIGF1dG9Mb2NrTWludXRlczogMTUsXG4gICAgYXV0b2xvY2tTdWNjZXNzOiAnJyxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHB3KSB7XG4gICAgaWYgKHB3Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKHB3Lmxlbmd0aCA8IDgpIHJldHVybiAxO1xuICAgIGxldCBzY29yZSA9IDI7XG4gICAgaWYgKHB3Lmxlbmd0aCA+PSAxMikgc2NvcmUrKztcbiAgICBpZiAoL1tBLVpdLy50ZXN0KHB3KSAmJiAvW2Etel0vLnRlc3QocHcpKSBzY29yZSsrO1xuICAgIGlmICgvXFxkLy50ZXN0KHB3KSkgc2NvcmUrKztcbiAgICBpZiAoL1teQS1aYS16MC05XS8udGVzdChwdykpIHNjb3JlKys7XG4gICAgcmV0dXJuIE1hdGgubWluKHNjb3JlLCA1KTtcbn1cblxuZnVuY3Rpb24gc2hvd1BhZ2VTdWNjZXNzKG1zZykge1xuICAgIHN0YXRlLnBhZ2VTdWNjZXNzID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5wYWdlU3VjY2VzcyA9ICcnOyByZW5kZXIoKTsgfSwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBMb2NrZWQgdnMgdW5sb2NrZWQgdmlld3NcbiAgICBjb25zdCBsb2NrZWRWaWV3ID0gJCgnbG9ja2VkLXZpZXcnKTtcbiAgICBjb25zdCB1bmxvY2tlZFZpZXcgPSAkKCd1bmxvY2tlZC12aWV3Jyk7XG4gICAgaWYgKGxvY2tlZFZpZXcpIGxvY2tlZFZpZXcuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmlzTG9ja2VkID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAodW5sb2NrZWRWaWV3KSB1bmxvY2tlZFZpZXcuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmlzTG9ja2VkID8gJ25vbmUnIDogJ2Jsb2NrJztcblxuICAgIC8vIFVubG9jayBlcnJvclxuICAgIGNvbnN0IHVubG9ja0VyciA9ICQoJ3VubG9jay1lcnJvcicpO1xuICAgIGlmICh1bmxvY2tFcnIpIHsgdW5sb2NrRXJyLnRleHRDb250ZW50ID0gc3RhdGUudW5sb2NrRXJyb3I7IHVubG9ja0Vyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudW5sb2NrRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBQYWdlLWxldmVsIHN1Y2Nlc3MgYmFubmVyXG4gICAgY29uc3QgcGFnZVN1YyA9ICQoJ3BhZ2Utc3VjY2VzcycpO1xuICAgIGlmIChwYWdlU3VjKSB7IHBhZ2VTdWMudGV4dENvbnRlbnQgPSBzdGF0ZS5wYWdlU3VjY2VzczsgcGFnZVN1Yy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucGFnZVN1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBTZWN1cml0eSBzdGF0dXNcbiAgICBjb25zdCBzZWN1cml0eVN0YXR1cyA9ICQoJ3NlY3VyaXR5LXN0YXR1cycpO1xuICAgIGlmIChzZWN1cml0eVN0YXR1cykge1xuICAgICAgICBzZWN1cml0eVN0YXR1cy50ZXh0Q29udGVudCA9IHN0YXRlLmhhc1Bhc3N3b3JkXG4gICAgICAgICAgICA/ICdNYXN0ZXIgcGFzc3dvcmQgaXMgYWN0aXZlIFx1MjAxNCBrZXlzIGFyZSBlbmNyeXB0ZWQgYXQgcmVzdC4nXG4gICAgICAgICAgICA6ICdObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IFx1MjAxNCBrZXlzIGFyZSBzdG9yZWQgdW5lbmNyeXB0ZWQuJztcbiAgICB9XG5cbiAgICAvLyBUb2dnbGUgc2VjdGlvbnMgYmFzZWQgb24gcGFzc3dvcmQgc3RhdGVcbiAgICBjb25zdCBzZXRTZWN0aW9uID0gJCgnc2V0LXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBjb25zdCBjaGFuZ2VTZWN0aW9uID0gJCgnY2hhbmdlLXBhc3N3b3JkLXNlY3Rpb24nKTtcbiAgICBpZiAoc2V0U2VjdGlvbikgc2V0U2VjdGlvbi5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChjaGFuZ2VTZWN0aW9uKSBjaGFuZ2VTZWN0aW9uLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBQYXNzd29yZCBzdHJlbmd0aFxuICAgIGNvbnN0IHN0cmVuZ3RoRWwgPSAkKCdwYXNzd29yZC1zdHJlbmd0aCcpO1xuICAgIGlmIChzdHJlbmd0aEVsKSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCkge1xuICAgICAgICAgICAgY29uc3Qgc3RyZW5ndGggPSBjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKHN0YXRlLm5ld1Bhc3N3b3JkKTtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVscyA9IFsnJywgJ1RvbyBzaG9ydCcsICdXZWFrJywgJ0ZhaXInLCAnU3Ryb25nJywgJ1Zlcnkgc3Ryb25nJ107XG4gICAgICAgICAgICBjb25zdCBjb2xvcnMgPSBbJycsICd0ZXh0LXJlZC01MDAnLCAndGV4dC1vcmFuZ2UtNTAwJywgJ3RleHQteWVsbG93LTYwMCcsICd0ZXh0LWdyZWVuLTYwMCcsICd0ZXh0LWdyZWVuLTcwMCBmb250LWJvbGQnXTtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwudGV4dENvbnRlbnQgPSBsYWJlbHNbc3RyZW5ndGhdIHx8ICcnO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5jbGFzc05hbWUgPSBgdGV4dC14cyBtdC0xICR7Y29sb3JzW3N0cmVuZ3RoXSB8fCAnJ31gO1xuICAgICAgICAgICAgc3RyZW5ndGhFbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0cmVuZ3RoRWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBzZXRCdG4gPSAkKCdzZXQtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKHNldEJ0bikge1xuICAgICAgICBzZXRCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLm5ld1Bhc3N3b3JkLmxlbmd0aCA+PSA4ICYmIHN0YXRlLm5ld1Bhc3N3b3JkID09PSBzdGF0ZS5jb25maXJtUGFzc3dvcmQpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBwYXNzd29yZCBidXR0b25cbiAgICBjb25zdCBjaGFuZ2VCdG4gPSAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk7XG4gICAgaWYgKGNoYW5nZUJ0bikge1xuICAgICAgICBjaGFuZ2VCdG4uZGlzYWJsZWQgPSAhKHN0YXRlLmN1cnJlbnRQYXNzd29yZC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPj0gOCAmJlxuICAgICAgICAgICAgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkIGJ1dHRvblxuICAgIGNvbnN0IHJlbW92ZUJ0biA9ICQoJ3JlbW92ZS1wYXNzd29yZC1idG4nKTtcbiAgICBpZiAocmVtb3ZlQnRuKSB7XG4gICAgICAgIHJlbW92ZUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0O1xuICAgIH1cblxuICAgIC8vIElubGluZSBlcnJvciBtZXNzYWdlc1xuICAgIGNvbnN0IHNlY0VyciA9ICQoJ3NlY3VyaXR5LWVycm9yJyk7XG4gICAgaWYgKHNlY0VycikgeyBzZWNFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5zZWN1cml0eUVycm9yOyBzZWNFcnIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlY3VyaXR5RXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG4gICAgY29uc3QgY2hnRXJyID0gJCgnY2hhbmdlLWVycm9yJyk7XG4gICAgaWYgKGNoZ0VycikgeyBjaGdFcnIudGV4dENvbnRlbnQgPSBzdGF0ZS5jaGFuZ2VFcnJvcjsgY2hnRXJyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5jaGFuZ2VFcnJvciA/ICdibG9jaycgOiAnbm9uZSc7IH1cbiAgICBjb25zdCBybUVyciA9ICQoJ3JlbW92ZS1lcnJvcicpO1xuICAgIGlmIChybUVycikgeyBybUVyci50ZXh0Q29udGVudCA9IHN0YXRlLnJlbW92ZUVycm9yOyBybUVyci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUucmVtb3ZlRXJyb3IgPyAnYmxvY2snIDogJ25vbmUnOyB9XG5cbiAgICAvLyBBdXRvLWxvY2sgc2VjdGlvblxuICAgIGNvbnN0IGF1dG9sb2NrRGlzYWJsZWQgPSAkKCdhdXRvbG9jay1kaXNhYmxlZC1tc2cnKTtcbiAgICBjb25zdCBhdXRvbG9ja0NvbnRyb2xzID0gJCgnYXV0b2xvY2stY29udHJvbHMnKTtcbiAgICBpZiAoYXV0b2xvY2tEaXNhYmxlZCkgYXV0b2xvY2tEaXNhYmxlZC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuaGFzUGFzc3dvcmQgPyAnbm9uZScgOiAnYmxvY2snO1xuICAgIGlmIChhdXRvbG9ja0NvbnRyb2xzKSBhdXRvbG9ja0NvbnRyb2xzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5oYXNQYXNzd29yZCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBjb25zdCBhdXRvbG9ja1NlbGVjdCA9ICQoJ2F1dG9sb2NrLXNlbGVjdCcpO1xuICAgIGlmIChhdXRvbG9ja1NlbGVjdCkgYXV0b2xvY2tTZWxlY3QudmFsdWUgPSBTdHJpbmcoc3RhdGUuYXV0b0xvY2tNaW51dGVzKTtcblxuICAgIGNvbnN0IGF1dG9sb2NrU3VjY2VzcyA9ICQoJ2F1dG9sb2NrLXN1Y2Nlc3MnKTtcbiAgICBpZiAoYXV0b2xvY2tTdWNjZXNzKSB7XG4gICAgICAgIGF1dG9sb2NrU3VjY2Vzcy50ZXh0Q29udGVudCA9IHN0YXRlLmF1dG9sb2NrU3VjY2VzcztcbiAgICAgICAgYXV0b2xvY2tTdWNjZXNzLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5hdXRvbG9ja1N1Y2Nlc3MgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuLy8gLS0tIEhhbmRsZXJzIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVVbmxvY2soKSB7XG4gICAgY29uc3QgcHcgPSAkKCd1bmxvY2stcGFzc3dvcmQnKT8udmFsdWU7XG4gICAgaWYgKCFwdykge1xuICAgICAgICBzdGF0ZS51bmxvY2tFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd1bmxvY2snLCBwYXlsb2FkOiBwdyB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuaXNMb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gJyc7XG4gICAgICAgICAgICBpZiAoJCgndW5sb2NrLXBhc3N3b3JkJykpICQoJ3VubG9jay1wYXNzd29yZCcpLnZhbHVlID0gJyc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnVubG9ja0Vycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdJbnZhbGlkIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUudW5sb2NrRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1bmxvY2suJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVTZXRQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJyc7XG5cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmQubGVuZ3RoIDwgOCkge1xuICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZCAhPT0gc3RhdGUuY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAgIHN0YXRlLnNlY3VyaXR5RXJyb3IgPSAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdzZXRQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiBzdGF0ZS5uZXdQYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmhhc1Bhc3N3b3JkID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXRlLm5ld1Bhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgIHNob3dQYWdlU3VjY2VzcygnTWFzdGVyIHBhc3N3b3JkIHNldC4gWW91ciBrZXlzIGFyZSBub3cgZW5jcnlwdGVkIGF0IHJlc3QuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS5zZWN1cml0eUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gc2V0IHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuc2VjdXJpdHlFcnJvciA9IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHNldCBwYXNzd29yZC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZUNoYW5nZVBhc3N3b3JkKCkge1xuICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJyc7XG5cbiAgICBpZiAoIXN0YXRlLmN1cnJlbnRQYXNzd29yZCkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdQbGVhc2UgZW50ZXIgeW91ciBjdXJyZW50IHBhc3N3b3JkLic7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGF0ZS5uZXdQYXNzd29yZENoYW5nZS5sZW5ndGggPCA4KSB7XG4gICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gJ05ldyBwYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgIT09IHN0YXRlLmNvbmZpcm1QYXNzd29yZENoYW5nZSkge1xuICAgICAgICBzdGF0ZS5jaGFuZ2VFcnJvciA9ICdOZXcgcGFzc3dvcmRzIGRvIG5vdCBtYXRjaC4nO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdjaGFuZ2VQYXNzd29yZCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgICAgb2xkUGFzc3dvcmQ6IHN0YXRlLmN1cnJlbnRQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZDogc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gJyc7XG4gICAgICAgICAgICBzdGF0ZS5uZXdQYXNzd29yZENoYW5nZSA9ICcnO1xuICAgICAgICAgICAgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gJyc7XG4gICAgICAgICAgICBzaG93UGFnZVN1Y2Nlc3MoJ01hc3RlciBwYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLmNoYW5nZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuY2hhbmdlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVSZW1vdmVQYXNzd29yZCgpIHtcbiAgICBzdGF0ZS5yZW1vdmVFcnJvciA9ICcnO1xuXG4gICAgaWYgKCFzdGF0ZS5yZW1vdmVQYXNzd29yZElucHV0KSB7XG4gICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gJ1BsZWFzZSBlbnRlciB5b3VyIGN1cnJlbnQgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFjb25maXJtKCdUaGlzIHdpbGwgcmVtb3ZlIGVuY3J5cHRpb24gZnJvbSB5b3VyIHByaXZhdGUga2V5cy4gVGhleSB3aWxsIGJlIHN0b3JlZCBhcyBwbGFpbnRleHQuIEFyZSB5b3Ugc3VyZT8nKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3JlbW92ZVBhc3N3b3JkJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHN0YXRlLnJlbW92ZVBhc3N3b3JkSW5wdXQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5oYXNQYXNzd29yZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9ICcnO1xuICAgICAgICAgICAgc2hvd1BhZ2VTdWNjZXNzKCdNYXN0ZXIgcGFzc3dvcmQgcmVtb3ZlZC4gS2V5cyBhcmUgbm93IHN0b3JlZCB1bmVuY3J5cHRlZC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLnJlbW92ZUVycm9yID0gKHJlc3VsdCAmJiByZXN1bHQuZXJyb3IpIHx8ICdGYWlsZWQgdG8gcmVtb3ZlIHBhc3N3b3JkLic7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUucmVtb3ZlRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZW1vdmUgcGFzc3dvcmQuJztcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVBdXRvTG9ja0NoYW5nZSgpIHtcbiAgICBjb25zdCBzZWxlY3QgPSAkKCdhdXRvbG9jay1zZWxlY3QnKTtcbiAgICBpZiAoIXNlbGVjdCkgcmV0dXJuO1xuICAgIGNvbnN0IG1pbnV0ZXMgPSBwYXJzZUludChzZWxlY3QudmFsdWUsIDEwKTtcbiAgICBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPSBtaW51dGVzO1xuXG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2V0QXV0b0xvY2tUaW1lb3V0JyxcbiAgICAgICAgcGF5bG9hZDogbWludXRlcyxcbiAgICB9KTtcblxuICAgIHN0YXRlLmF1dG9sb2NrU3VjY2VzcyA9IG1pbnV0ZXMgPT09IDBcbiAgICAgICAgPyAnQXV0by1sb2NrIGRpc2FibGVkLidcbiAgICAgICAgOiBgQXV0by1sb2NrIHNldCB0byAke21pbnV0ZXN9IG1pbnV0ZXMuYDtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuYXV0b2xvY2tTdWNjZXNzID0gJyc7IHJlbmRlcigpOyB9LCAzMDAwKTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAvLyBDbG9zZVxuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgIC8vIFByZXZlbnQgZGVmYXVsdCBmb3JtIHN1Ym1pc3Npb25cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdmb3JtJykuZm9yRWFjaChmb3JtID0+IHtcbiAgICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICB9KTtcblxuICAgIC8vIFVubG9ja1xuICAgICQoJ3VubG9jay1mb3JtJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7IGUucHJldmVudERlZmF1bHQoKTsgaGFuZGxlVW5sb2NrKCk7IH0pO1xuXG4gICAgLy8gU2V0IHBhc3N3b3JkXG4gICAgJCgnbmV3LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5jb25maXJtUGFzc3dvcmQgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ3NldC1wYXNzd29yZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVTZXRQYXNzd29yZCk7XG5cbiAgICAvLyBDaGFuZ2UgcGFzc3dvcmRcbiAgICAkKCdjdXJyZW50LXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY3VycmVudFBhc3N3b3JkID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCduZXctcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUubmV3UGFzc3dvcmRDaGFuZ2UgPSBlLnRhcmdldC52YWx1ZTsgcmVuZGVyKCk7IH0pO1xuICAgICQoJ2NvbmZpcm0tcGFzc3dvcmQtY2hhbmdlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuY29uZmlybVBhc3N3b3JkQ2hhbmdlID0gZS50YXJnZXQudmFsdWU7IHJlbmRlcigpOyB9KTtcbiAgICAkKCdjaGFuZ2UtcGFzc3dvcmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGFuZGxlQ2hhbmdlUGFzc3dvcmQpO1xuXG4gICAgLy8gUmVtb3ZlIHBhc3N3b3JkXG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUucmVtb3ZlUGFzc3dvcmRJbnB1dCA9IGUudGFyZ2V0LnZhbHVlOyByZW5kZXIoKTsgfSk7XG4gICAgJCgncmVtb3ZlLXBhc3N3b3JkLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZVJlbW92ZVBhc3N3b3JkKTtcblxuICAgIC8vIEF1dG8tbG9ja1xuICAgICQoJ2F1dG9sb2NrLXNlbGVjdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBoYW5kbGVBdXRvTG9ja0NoYW5nZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgc3RhdGUuaGFzUGFzc3dvcmQgPSAhIShhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSkpO1xuICAgIHN0YXRlLmlzTG9ja2VkID0gISEoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNMb2NrZWQnIH0pKTtcbiAgICBzdGF0ZS5hdXRvTG9ja01pbnV0ZXMgPSAoYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnZ2V0QXV0b0xvY2tUaW1lb3V0JyB9KSkgPz8gMTU7XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFX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
