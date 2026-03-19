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

  // src/content.js
  async function shouldInject() {
    if (window === window.top) return true;
    try {
      const data = await api.storage.local.get({ blockCrossOriginFrames: true });
      if (!data.blockCrossOriginFrames) return true;
    } catch {
      return false;
    }
    try {
      void window.top.location.href;
      return true;
    } catch {
      return false;
    }
  }
  shouldInject().then((inject) => {
    if (!inject) return;
    let script = document.createElement("script");
    script.setAttribute("src", api.runtime.getURL("nostr.build.js"));
    document.body.appendChild(script);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        api.runtime.sendMessage({ kind: "resetAutoLock" }).catch(() => {
        });
      }
    });
  });
  var permissionSheet = null;
  var permissionResolve = null;
  function createPermissionSheet() {
    if (permissionSheet) return;
    const sheet = document.createElement("div");
    sheet.id = "nostrkey-permission-sheet";
    sheet.innerHTML = `
        <style>
            #nostrkey-permission-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: none;
            }
            #nostrkey-permission-sheet.active {
                pointer-events: auto;
            }
            #nostrkey-permission-sheet .nk-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #nostrkey-permission-sheet.active .nk-backdrop {
                opacity: 1;
            }
            #nostrkey-permission-sheet .nk-sheet {
                position: relative;
                background: #3e3d32;
                border-radius: 16px 16px 0 0;
                padding: 24px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #nostrkey-permission-sheet.active .nk-sheet {
                transform: translateY(0);
            }
            #nostrkey-permission-sheet .nk-handle {
                width: 40px;
                height: 4px;
                background: #8f908a;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-permission-sheet .nk-title {
                color: #a6e22e;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
            }
            #nostrkey-permission-sheet .nk-host {
                color: #66d9ef;
                font-weight: 600;
            }
            #nostrkey-permission-sheet .nk-permission {
                color: #a6e22e;
                font-weight: 600;
            }
            #nostrkey-permission-sheet .nk-text {
                color: #f8f8f2;
                font-size: 14px;
                text-align: center;
                margin-bottom: 8px;
                line-height: 1.5;
            }
            #nostrkey-permission-sheet .nk-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }
            #nostrkey-permission-sheet .nk-btn {
                flex: 1;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #a6e22e;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            #nostrkey-permission-sheet .nk-btn-allow {
                background: rgba(166,226,46,0.1);
                color: #a6e22e;
            }
            #nostrkey-permission-sheet .nk-btn-allow:hover {
                background: rgba(166,226,46,0.2);
            }
            #nostrkey-permission-sheet .nk-btn-deny {
                background: transparent;
                border-color: #f92672;
                color: #f92672;
            }
            #nostrkey-permission-sheet .nk-btn-deny:hover {
                background: rgba(249,38,114,0.1);
            }
            #nostrkey-permission-sheet .nk-remember {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 16px;
                color: #8f908a;
                font-size: 13px;
            }
            #nostrkey-permission-sheet .nk-remember input {
                accent-color: #a6e22e;
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-title">Permission Request <span id="nk-queue" style="color: #8f908a; font-size: 14px; font-weight: 400;"></span></div>
            <div class="nk-text">
                <span class="nk-host" id="nk-host"></span> wants to:
            </div>
            <div class="nk-text" style="font-size:16px;">
                <span class="nk-permission" id="nk-permission"></span>
            </div>
            <div class="nk-buttons">
                <button class="nk-btn nk-btn-allow" id="nk-allow">Allow</button>
                <button class="nk-btn nk-btn-deny" id="nk-deny">Deny</button>
            </div>
            <div class="nk-remember">
                <input type="checkbox" id="nk-remember">
                <label for="nk-remember">Remember this choice</label>
            </div>
        </div>
    `;
    document.body.appendChild(sheet);
    permissionSheet = sheet;
    sheet.querySelector("#nk-allow").addEventListener("click", () => {
      handlePermissionResponse(true);
    });
    sheet.querySelector("#nk-deny").addEventListener("click", () => {
      handlePermissionResponse(false);
    });
    sheet.querySelector(".nk-backdrop").addEventListener("click", () => {
      handlePermissionResponse(false);
    });
  }
  function handlePermissionResponse(allowed) {
    if (!permissionResolve) return;
    const remember = permissionSheet.querySelector("#nk-remember").checked;
    permissionSheet.classList.remove("active");
    permissionSheet.querySelector("#nk-remember").checked = false;
    permissionResolve({ allowed, remember });
    permissionResolve = null;
  }
  function getHumanPermission(kind) {
    switch (kind) {
      case "getPubKey":
        return "Read your public key";
      case "signEvent":
        return "Sign an event";
      case "getRelays":
        return "Read your relay list";
      case "nip04.encrypt":
        return "Encrypt a message (NIP-04)";
      case "nip04.decrypt":
        return "Decrypt a message (NIP-04)";
      case "nip44.encrypt":
        return "Encrypt a message (NIP-44)";
      case "nip44.decrypt":
        return "Decrypt a message (NIP-44)";
      default:
        return kind;
    }
  }
  function showPermissionSheet(host, kind, queuePosition, queueTotal) {
    createPermissionSheet();
    permissionSheet.querySelector("#nk-host").textContent = host;
    permissionSheet.querySelector("#nk-permission").textContent = getHumanPermission(kind);
    const queueEl = permissionSheet.querySelector("#nk-queue");
    if (queueEl) {
      queueEl.textContent = queueTotal > 1 ? `(${queuePosition} of ${queueTotal})` : "";
    }
    permissionSheet.classList.add("active");
    return new Promise((resolve) => {
      permissionResolve = resolve;
    });
  }
  var lockedSheetEl = null;
  var lockedSheetTimer = null;
  function showLockedSheet() {
    if (lockedSheetEl && lockedSheetEl.classList.contains("active")) {
      if (lockedSheetTimer) clearTimeout(lockedSheetTimer);
      lockedSheetTimer = setTimeout(dismissLockedSheet, 5e3);
      return;
    }
    if (lockedSheetEl) lockedSheetEl.remove();
    const sheet = document.createElement("div");
    sheet.id = "nostrkey-locked-sheet";
    sheet.innerHTML = `
        <style>
            #nostrkey-locked-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: auto;
            }
            #nostrkey-locked-sheet .nk-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #nostrkey-locked-sheet.active .nk-backdrop {
                opacity: 1;
            }
            #nostrkey-locked-sheet .nk-sheet {
                position: relative;
                background: #3e3d32;
                border-radius: 16px 16px 0 0;
                padding: 24px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #nostrkey-locked-sheet.active .nk-sheet {
                transform: translateY(0);
            }
            #nostrkey-locked-sheet .nk-handle {
                width: 40px;
                height: 4px;
                background: #8f908a;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: #e6db74;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: #f8f8f2;
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: #8f908a;
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #a6e22e;
                background: rgba(166,226,46,0.1);
                color: #a6e22e;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: rgba(166,226,46,0.2);
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-icon">&#x1F512;</div>
            <div class="nk-title">NostrKey is Locked</div>
            <div class="nk-text">This site needs your key to sign or encrypt.</div>
            <div class="nk-muted">Click the NostrKey icon in your toolbar and enter your master password.</div>
            <button class="nk-btn">Got it</button>
        </div>
    `;
    document.body.appendChild(sheet);
    lockedSheetEl = sheet;
    requestAnimationFrame(() => sheet.classList.add("active"));
    sheet.querySelector(".nk-btn").addEventListener("click", dismissLockedSheet);
    sheet.querySelector(".nk-backdrop").addEventListener("click", dismissLockedSheet);
    lockedSheetTimer = setTimeout(dismissLockedSheet, 5e3);
  }
  function dismissLockedSheet() {
    if (lockedSheetTimer) {
      clearTimeout(lockedSheetTimer);
      lockedSheetTimer = null;
    }
    if (!lockedSheetEl) return;
    lockedSheetEl.classList.remove("active");
    const el = lockedSheetEl;
    lockedSheetEl = null;
    setTimeout(() => el.remove(), 300);
  }
  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.kind === "showPermissionSheet") {
      showPermissionSheet(message.host, message.permissionKind, message.queuePosition, message.queueTotal).then((result) => {
        sendResponse(result);
      });
      return true;
    }
    if (message.kind === "showLockedSheet") {
      showLockedSheet();
      sendResponse(true);
      return true;
    }
  });
  window.addEventListener("message", async (message) => {
    if (message.source !== window) return;
    const validEvents = [
      "getPubKey",
      "signEvent",
      "getRelays",
      "addRelay",
      "exportProfile",
      "nip04.encrypt",
      "nip04.decrypt",
      "nip44.encrypt",
      "nip44.decrypt",
      "replaceURL",
      "bunkerServer.start",
      "bunkerServer.stop",
      "bunkerServer.status"
    ];
    let { kind, reqId, payload } = message.data;
    if (!validEvents.includes(kind)) return;
    try {
      payload = await api.runtime.sendMessage({
        kind,
        payload,
        host: window.location.host
      });
    } catch (e) {
      payload = { error: "connection_error", message: e.message || "Failed to reach extension background" };
    }
    kind = `return_${kind}`;
    window.postMessage({ kind, reqId, payload }, "*");
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3VsZEluamVjdCgpIHtcbiAgICBpZiAod2luZG93ID09PSB3aW5kb3cudG9wKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgYmxvY2tDcm9zc09yaWdpbkZyYW1lczogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKCFkYXRhLmJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXMpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHZvaWQgd2luZG93LnRvcC5sb2NhdGlvbi5ocmVmOyAvLyB0aHJvd3MgZm9yIGNyb3NzLW9yaWdpbiBmcmFtZXNcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbnNob3VsZEluamVjdCgpLnRoZW4oaW5qZWN0ID0+IHtcbiAgICBpZiAoIWluamVjdCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBhcGkucnVudGltZS5nZXRVUkwoJ25vc3RyLmJ1aWxkLmpzJykpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgIC8vIFJlc2V0IGF1dG8tbG9jayB0aW1lciB3aGVuIGEgTm9zdHItZW5hYmxlZCB0YWIgZ2FpbnMgZm9jdXNcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAndmlzaWJsZScpIHtcbiAgICAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QXV0b0xvY2snIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbi8vIFBlcm1pc3Npb24gYm90dG9tIHNoZWV0XG5sZXQgcGVybWlzc2lvblNoZWV0ID0gbnVsbDtcbmxldCBwZXJtaXNzaW9uUmVzb2x2ZSA9IG51bGw7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBlcm1pc3Npb25TaGVldCgpIHtcbiAgICBpZiAocGVybWlzc2lvblNoZWV0KSByZXR1cm47XG4gICAgXG4gICAgY29uc3Qgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzaGVldC5pZCA9ICdub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0JztcbiAgICBzaGVldC5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgICAgICAgICAgei1pbmRleDogMjE0NzQ4MzY0NztcbiAgICAgICAgICAgICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XG4gICAgICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldC5hY3RpdmUge1xuICAgICAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICAgICAgaW5zZXQ6IDA7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwwLjUpO1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGVhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldC5hY3RpdmUgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogIzNlM2QzMjtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxNnB4IDE2cHggMCAwO1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDI0cHg7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGVhc2U7XG4gICAgICAgICAgICAgICAgYm94LXNoYWRvdzogMCAtNHB4IDIwcHggcmdiYSgwLDAsMCwwLjMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQuYWN0aXZlIC5uay1zaGVldCB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWhhbmRsZSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA0cHg7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogIzhmOTA4YTtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAwIGF1dG8gMTZweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay10aXRsZSB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICNhNmUyMmU7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstaG9zdCB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICM2NmQ5ZWY7XG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1wZXJtaXNzaW9uIHtcbiAgICAgICAgICAgICAgICBjb2xvcjogI2E2ZTIyZTtcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLXRleHQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjZjhmOGYyO1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstYnV0dG9ucyB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgICAgICBnYXA6IDEycHg7XG4gICAgICAgICAgICAgICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1idG4ge1xuICAgICAgICAgICAgICAgIGZsZXg6IDE7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMTRweDtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2E2ZTIyZTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstYnRuLWFsbG93IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDE2NiwyMjYsNDYsMC4xKTtcbiAgICAgICAgICAgICAgICBjb2xvcjogI2E2ZTIyZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1idG4tYWxsb3c6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMTY2LDIyNiw0NiwwLjIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWJ0bi1kZW55IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgICAgICBib3JkZXItY29sb3I6ICNmOTI2NzI7XG4gICAgICAgICAgICAgICAgY29sb3I6ICNmOTI2NzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstYnRuLWRlbnk6aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjQ5LDM4LDExNCwwLjEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLXJlbWVtYmVyIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgZ2FwOiA4cHg7XG4gICAgICAgICAgICAgICAgbWFyZ2luLXRvcDogMTZweDtcbiAgICAgICAgICAgICAgICBjb2xvcjogIzhmOTA4YTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstcmVtZW1iZXIgaW5wdXQge1xuICAgICAgICAgICAgICAgIGFjY2VudC1jb2xvcjogI2E2ZTIyZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1zaGVldFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWhhbmRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRpdGxlXCI+UGVybWlzc2lvbiBSZXF1ZXN0IDxzcGFuIGlkPVwibmstcXVldWVcIiBzdHlsZT1cImNvbG9yOiAjOGY5MDhhOyBmb250LXNpemU6IDE0cHg7IGZvbnQtd2VpZ2h0OiA0MDA7XCI+PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRleHRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm5rLWhvc3RcIiBpZD1cIm5rLWhvc3RcIj48L3NwYW4+IHdhbnRzIHRvOlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstdGV4dFwiIHN0eWxlPVwiZm9udC1zaXplOjE2cHg7XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJuay1wZXJtaXNzaW9uXCIgaWQ9XCJuay1wZXJtaXNzaW9uXCI+PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJuay1idG4gbmstYnRuLWFsbG93XCIgaWQ9XCJuay1hbGxvd1wiPkFsbG93PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5rLWJ0biBuay1idG4tZGVueVwiIGlkPVwibmstZGVueVwiPkRlbnk8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXJlbWVtYmVyXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwibmstcmVtZW1iZXJcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibmstcmVtZW1iZXJcIj5SZW1lbWJlciB0aGlzIGNob2ljZTwvbGFiZWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNoZWV0KTtcbiAgICBwZXJtaXNzaW9uU2hlZXQgPSBzaGVldDtcbiAgICBcbiAgICBzaGVldC5xdWVyeVNlbGVjdG9yKCcjbmstYWxsb3cnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaGFuZGxlUGVybWlzc2lvblJlc3BvbnNlKHRydWUpO1xuICAgIH0pO1xuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJyNuay1kZW55JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhhbmRsZVBlcm1pc3Npb25SZXNwb25zZShmYWxzZSk7XG4gICAgfSk7XG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhhbmRsZVBlcm1pc3Npb25SZXNwb25zZShmYWxzZSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVBlcm1pc3Npb25SZXNwb25zZShhbGxvd2VkKSB7XG4gICAgaWYgKCFwZXJtaXNzaW9uUmVzb2x2ZSkgcmV0dXJuO1xuICAgIGNvbnN0IHJlbWVtYmVyID0gcGVybWlzc2lvblNoZWV0LnF1ZXJ5U2VsZWN0b3IoJyNuay1yZW1lbWJlcicpLmNoZWNrZWQ7XG4gICAgcGVybWlzc2lvblNoZWV0LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHBlcm1pc3Npb25TaGVldC5xdWVyeVNlbGVjdG9yKCcjbmstcmVtZW1iZXInKS5jaGVja2VkID0gZmFsc2U7XG4gICAgcGVybWlzc2lvblJlc29sdmUoeyBhbGxvd2VkLCByZW1lbWJlciB9KTtcbiAgICBwZXJtaXNzaW9uUmVzb2x2ZSA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldEh1bWFuUGVybWlzc2lvbihraW5kKSB7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgIGNhc2UgJ2dldFB1YktleSc6IHJldHVybiAnUmVhZCB5b3VyIHB1YmxpYyBrZXknO1xuICAgICAgICBjYXNlICdzaWduRXZlbnQnOiByZXR1cm4gJ1NpZ24gYW4gZXZlbnQnO1xuICAgICAgICBjYXNlICdnZXRSZWxheXMnOiByZXR1cm4gJ1JlYWQgeW91ciByZWxheSBsaXN0JztcbiAgICAgICAgY2FzZSAnbmlwMDQuZW5jcnlwdCc6IHJldHVybiAnRW5jcnlwdCBhIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXAwNC5kZWNyeXB0JzogcmV0dXJuICdEZWNyeXB0IGEgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmVuY3J5cHQnOiByZXR1cm4gJ0VuY3J5cHQgYSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZGVjcnlwdCc6IHJldHVybiAnRGVjcnlwdCBhIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4ga2luZDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNob3dQZXJtaXNzaW9uU2hlZXQoaG9zdCwga2luZCwgcXVldWVQb3NpdGlvbiwgcXVldWVUb3RhbCkge1xuICAgIGNyZWF0ZVBlcm1pc3Npb25TaGVldCgpO1xuICAgIHBlcm1pc3Npb25TaGVldC5xdWVyeVNlbGVjdG9yKCcjbmstaG9zdCcpLnRleHRDb250ZW50ID0gaG9zdDtcbiAgICBwZXJtaXNzaW9uU2hlZXQucXVlcnlTZWxlY3RvcignI25rLXBlcm1pc3Npb24nKS50ZXh0Q29udGVudCA9IGdldEh1bWFuUGVybWlzc2lvbihraW5kKTtcbiAgICBjb25zdCBxdWV1ZUVsID0gcGVybWlzc2lvblNoZWV0LnF1ZXJ5U2VsZWN0b3IoJyNuay1xdWV1ZScpO1xuICAgIGlmIChxdWV1ZUVsKSB7XG4gICAgICAgIHF1ZXVlRWwudGV4dENvbnRlbnQgPSBxdWV1ZVRvdGFsID4gMSA/IGAoJHtxdWV1ZVBvc2l0aW9ufSBvZiAke3F1ZXVlVG90YWx9KWAgOiAnJztcbiAgICB9XG4gICAgcGVybWlzc2lvblNoZWV0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIFxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgcGVybWlzc2lvblJlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pO1xufVxuXG4vLyBMb2NrZWQgbm90aWZpY2F0aW9uIHNoZWV0IFx1MjAxNCBzaG93biB3aGVuIGEgc2l0ZSBuZWVkcyB0aGUgcHJpdmF0ZSBrZXlcbi8vIGJ1dCB0aGUgZXh0ZW5zaW9uIGlzIGxvY2tlZC4gU2hvd3MgZXZlcnkgdGltZSB1bnRpbCB1bmxvY2tlZC5cbmxldCBsb2NrZWRTaGVldEVsID0gbnVsbDtcbmxldCBsb2NrZWRTaGVldFRpbWVyID0gbnVsbDtcblxuZnVuY3Rpb24gc2hvd0xvY2tlZFNoZWV0KCkge1xuICAgIC8vIElmIGFscmVhZHkgdmlzaWJsZSwgcmVzZXQgdGhlIGF1dG8tZGlzbWlzcyB0aW1lclxuICAgIGlmIChsb2NrZWRTaGVldEVsICYmIGxvY2tlZFNoZWV0RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgICBpZiAobG9ja2VkU2hlZXRUaW1lcikgY2xlYXJUaW1lb3V0KGxvY2tlZFNoZWV0VGltZXIpO1xuICAgICAgICBsb2NrZWRTaGVldFRpbWVyID0gc2V0VGltZW91dChkaXNtaXNzTG9ja2VkU2hlZXQsIDUwMDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFueSBzdGFsZSBzaGVldFxuICAgIGlmIChsb2NrZWRTaGVldEVsKSBsb2NrZWRTaGVldEVsLnJlbW92ZSgpO1xuXG4gICAgY29uc3Qgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzaGVldC5pZCA9ICdub3N0cmtleS1sb2NrZWQtc2hlZXQnO1xuICAgIHNoZWV0LmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgICAgIHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgICBpbnNldDogMDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuNSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQuYWN0aXZlIC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogIzNlM2QzMjtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxNnB4IDE2cHggMCAwO1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDI0cHg7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGVhc2U7XG4gICAgICAgICAgICAgICAgYm94LXNoYWRvdzogMCAtNHB4IDIwcHggcmdiYSgwLDAsMCwwLjMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldC5hY3RpdmUgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1oYW5kbGUge1xuICAgICAgICAgICAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogNHB4O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICM4ZjkwOGE7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgICAgICAgICAgICAgIG1hcmdpbjogMCBhdXRvIDE2cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1pY29uIHtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDMycHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay10aXRsZSB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICNlNmRiNzQ7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXRleHQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjZjhmOGYyO1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNTtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA0cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1tdXRlZCB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICM4ZjkwOGE7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJ0biB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMTRweDtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2E2ZTIyZTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDE2NiwyMjYsNDYsMC4xKTtcbiAgICAgICAgICAgICAgICBjb2xvcjogI2E2ZTIyZTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICAgICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMTVzIGVhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1idG46aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMTY2LDIyNiw0NiwwLjIpO1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXNoZWV0XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstaGFuZGxlXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstaWNvblwiPiYjeDFGNTEyOzwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRpdGxlXCI+Tm9zdHJLZXkgaXMgTG9ja2VkPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstdGV4dFwiPlRoaXMgc2l0ZSBuZWVkcyB5b3VyIGtleSB0byBzaWduIG9yIGVuY3J5cHQuPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstbXV0ZWRcIj5DbGljayB0aGUgTm9zdHJLZXkgaWNvbiBpbiB5b3VyIHRvb2xiYXIgYW5kIGVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkLjwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5rLWJ0blwiPkdvdCBpdDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICBgO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2hlZXQpO1xuICAgIGxvY2tlZFNoZWV0RWwgPSBzaGVldDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gc2hlZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJykpO1xuXG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzc0xvY2tlZFNoZWV0KTtcbiAgICBzaGVldC5xdWVyeVNlbGVjdG9yKCcubmstYmFja2Ryb3AnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3NMb2NrZWRTaGVldCk7XG5cbiAgICAvLyBBdXRvLWRpc21pc3MgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgbG9ja2VkU2hlZXRUaW1lciA9IHNldFRpbWVvdXQoZGlzbWlzc0xvY2tlZFNoZWV0LCA1MDAwKTtcbn1cblxuZnVuY3Rpb24gZGlzbWlzc0xvY2tlZFNoZWV0KCkge1xuICAgIGlmIChsb2NrZWRTaGVldFRpbWVyKSB7IGNsZWFyVGltZW91dChsb2NrZWRTaGVldFRpbWVyKTsgbG9ja2VkU2hlZXRUaW1lciA9IG51bGw7IH1cbiAgICBpZiAoIWxvY2tlZFNoZWV0RWwpIHJldHVybjtcbiAgICBsb2NrZWRTaGVldEVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIGNvbnN0IGVsID0gbG9ja2VkU2hlZXRFbDtcbiAgICBsb2NrZWRTaGVldEVsID0gbnVsbDtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGVsLnJlbW92ZSgpLCAzMDApO1xufVxuXG4vLyBMaXN0ZW4gZm9yIHJlcXVlc3RzIGZyb20gYmFja2dyb3VuZFxuYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGlmIChtZXNzYWdlLmtpbmQgPT09ICdzaG93UGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICBzaG93UGVybWlzc2lvblNoZWV0KG1lc3NhZ2UuaG9zdCwgbWVzc2FnZS5wZXJtaXNzaW9uS2luZCwgbWVzc2FnZS5xdWV1ZVBvc2l0aW9uLCBtZXNzYWdlLnF1ZXVlVG90YWwpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShyZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZVxuICAgIH1cbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnc2hvd0xvY2tlZFNoZWV0Jykge1xuICAgICAgICBzaG93TG9ja2VkU2hlZXQoKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyBtZXNzYWdlID0+IHtcbiAgICAvLyBDMyBmaXg6IE9ubHkgYWNjZXB0IG1lc3NhZ2VzIGZyb20gdGhlIHRvcC1sZXZlbCBwYWdlIGNvbnRleHRcbiAgICBpZiAobWVzc2FnZS5zb3VyY2UgIT09IHdpbmRvdykgcmV0dXJuO1xuXG4gICAgY29uc3QgdmFsaWRFdmVudHMgPSBbXG4gICAgICAgICdnZXRQdWJLZXknLFxuICAgICAgICAnc2lnbkV2ZW50JyxcbiAgICAgICAgJ2dldFJlbGF5cycsXG4gICAgICAgICdhZGRSZWxheScsXG4gICAgICAgICdleHBvcnRQcm9maWxlJyxcbiAgICAgICAgJ25pcDA0LmVuY3J5cHQnLFxuICAgICAgICAnbmlwMDQuZGVjcnlwdCcsXG4gICAgICAgICduaXA0NC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDQ0LmRlY3J5cHQnLFxuICAgICAgICAncmVwbGFjZVVSTCcsXG4gICAgICAgICdidW5rZXJTZXJ2ZXIuc3RhcnQnLFxuICAgICAgICAnYnVua2VyU2VydmVyLnN0b3AnLFxuICAgICAgICAnYnVua2VyU2VydmVyLnN0YXR1cycsXG4gICAgXTtcbiAgICBsZXQgeyBraW5kLCByZXFJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZS5kYXRhO1xuICAgIGlmICghdmFsaWRFdmVudHMuaW5jbHVkZXMoa2luZCkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIHBheWxvYWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5ob3N0LFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHBheWxvYWQgPSB7IGVycm9yOiAnY29ubmVjdGlvbl9lcnJvcicsIG1lc3NhZ2U6IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlYWNoIGV4dGVuc2lvbiBiYWNrZ3JvdW5kJyB9O1xuICAgIH1cblxuICAgIGtpbmQgPSBgcmV0dXJuXyR7a2luZH1gO1xuXG4gICAgd2luZG93LnBvc3RNZXNzYWdlKHsga2luZCwgcmVxSWQsIHBheWxvYWQgfSwgJyonKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsZUFBTyxNQUFNLFNBQVM7QUFBQSxVQUNsQixHQUFHO0FBQUEsVUFDSCxJQUFJLFdBQVc7QUFDWCxnQkFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLFdBQVc7QUFDaEQscUJBQU8sSUFBSSxNQUFNLFNBQVMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3hELE9BQU87QUFDSCxzQkFBUSxPQUFPLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxNQUFNO0FBQUEsWUFDbkQ7QUFBQSxVQUNKO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFNQSxNQUFNLE1BQU0sQ0FBQztBQUdiLE1BQUksVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSVYsZUFBZSxNQUFNO0FBQ2pCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsWUFBWSxHQUFHLElBQUk7QUFBQSxNQUMvQztBQUNBLGFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUM1RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBUUEsV0FBVyxTQUFTLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUs1QixPQUFPLE1BQU07QUFDVCxhQUFPLFNBQVMsUUFBUSxPQUFPLElBQUk7QUFBQSxJQUN2QztBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0Esa0JBQWtCO0FBQ2QsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsUUFBUSxnQkFBZ0I7QUFBQSxNQUM1QztBQUNBLGFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLGVBQWUsRUFBRTtBQUFBLElBQ3pFO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxJQUFJLEtBQUs7QUFDTCxhQUFPLFNBQVMsUUFBUTtBQUFBLElBQzVCO0FBQUEsRUFDSjtBQUdBLE1BQUksVUFBVTtBQUFBLElBQ1YsT0FBTztBQUFBLE1BQ0gsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzdDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzdDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsU0FBUyxNQUFNO0FBQ1gsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEdBQUcsSUFBSTtBQUFBLFFBQy9DO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNsRjtBQUFBLE1BQ0EsVUFBVSxNQUFNO0FBQ1osWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsTUFBTSxPQUFPLEdBQUcsSUFBSTtBQUFBLFFBQ2hEO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNuRjtBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUEsSUFJQSxNQUFNLFNBQVMsU0FBUyxPQUFPO0FBQUEsTUFDM0IsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzVDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUM5RTtBQUFBLE1BQ0EsT0FBTyxNQUFNO0FBQ1QsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLFFBQzVDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUM5RTtBQUFBLE1BQ0EsVUFBVSxNQUFNO0FBQ1osWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLFFBQy9DO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNqRjtBQUFBLE1BQ0EsU0FBUyxNQUFNO0FBQ1gsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLFFBQzlDO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxNQUNoRjtBQUFBLE1BQ0EsaUJBQWlCLE1BQU07QUFDbkIsWUFBSSxDQUFDLFNBQVMsUUFBUSxLQUFLLGVBQWU7QUFFdEMsaUJBQU8sUUFBUSxRQUFRLENBQUM7QUFBQSxRQUM1QjtBQUNBLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssY0FBYyxHQUFHLElBQUk7QUFBQSxRQUN0RDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxhQUFhLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDeEY7QUFBQSxJQUNKLElBQUk7QUFBQTtBQUFBLElBR0osV0FBVyxTQUFTLFNBQVMsYUFBYTtBQUFBLEVBQzlDO0FBR0EsTUFBSSxPQUFPO0FBQUEsSUFDUCxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLFNBQVMsTUFBTTtBQUNYLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxNQUN0QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNoRTtBQUFBLElBQ0EsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLE9BQU8sTUFBTTtBQUNULFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxNQUNwQztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUM5RDtBQUFBLElBQ0EsY0FBYyxNQUFNO0FBQ2hCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssV0FBVyxHQUFHLElBQUk7QUFBQSxNQUMzQztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNyRTtBQUFBLElBQ0EsZUFBZSxNQUFNO0FBQ2pCLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssWUFBWSxHQUFHLElBQUk7QUFBQSxNQUM1QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxJQUN0RTtBQUFBLEVBQ0o7OztBQ3JPQSxpQkFBZSxlQUFlO0FBQzFCLFFBQUksV0FBVyxPQUFPLElBQUssUUFBTztBQUNsQyxRQUFJO0FBQ0EsWUFBTSxPQUFPLE1BQU0sSUFBSSxRQUFRLE1BQU0sSUFBSSxFQUFFLHdCQUF3QixLQUFLLENBQUM7QUFDekUsVUFBSSxDQUFDLEtBQUssdUJBQXdCLFFBQU87QUFBQSxJQUM3QyxRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJO0FBQ0EsV0FBSyxPQUFPLElBQUksU0FBUztBQUN6QixhQUFPO0FBQUEsSUFDWCxRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBRUEsZUFBYSxFQUFFLEtBQUssWUFBVTtBQUMxQixRQUFJLENBQUMsT0FBUTtBQUNiLFFBQUksU0FBUyxTQUFTLGNBQWMsUUFBUTtBQUM1QyxXQUFPLGFBQWEsT0FBTyxJQUFJLFFBQVEsT0FBTyxnQkFBZ0IsQ0FBQztBQUMvRCxhQUFTLEtBQUssWUFBWSxNQUFNO0FBR2hDLGFBQVMsaUJBQWlCLG9CQUFvQixNQUFNO0FBQ2hELFVBQUksU0FBUyxvQkFBb0IsV0FBVztBQUN4QyxZQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxNQUFNLE1BQU07QUFBQSxRQUFDLENBQUM7QUFBQSxNQUNyRTtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0wsQ0FBQztBQUdELE1BQUksa0JBQWtCO0FBQ3RCLE1BQUksb0JBQW9CO0FBRXhCLFdBQVMsd0JBQXdCO0FBQzdCLFFBQUksZ0JBQWlCO0FBRXJCLFVBQU0sUUFBUSxTQUFTLGNBQWMsS0FBSztBQUMxQyxVQUFNLEtBQUs7QUFDWCxVQUFNLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWdJbEIsYUFBUyxLQUFLLFlBQVksS0FBSztBQUMvQixzQkFBa0I7QUFFbEIsVUFBTSxjQUFjLFdBQVcsRUFBRSxpQkFBaUIsU0FBUyxNQUFNO0FBQzdELCtCQUF5QixJQUFJO0FBQUEsSUFDakMsQ0FBQztBQUNELFVBQU0sY0FBYyxVQUFVLEVBQUUsaUJBQWlCLFNBQVMsTUFBTTtBQUM1RCwrQkFBeUIsS0FBSztBQUFBLElBQ2xDLENBQUM7QUFDRCxVQUFNLGNBQWMsY0FBYyxFQUFFLGlCQUFpQixTQUFTLE1BQU07QUFDaEUsK0JBQXlCLEtBQUs7QUFBQSxJQUNsQyxDQUFDO0FBQUEsRUFDTDtBQUVBLFdBQVMseUJBQXlCLFNBQVM7QUFDdkMsUUFBSSxDQUFDLGtCQUFtQjtBQUN4QixVQUFNLFdBQVcsZ0JBQWdCLGNBQWMsY0FBYyxFQUFFO0FBQy9ELG9CQUFnQixVQUFVLE9BQU8sUUFBUTtBQUN6QyxvQkFBZ0IsY0FBYyxjQUFjLEVBQUUsVUFBVTtBQUN4RCxzQkFBa0IsRUFBRSxTQUFTLFNBQVMsQ0FBQztBQUN2Qyx3QkFBb0I7QUFBQSxFQUN4QjtBQUVBLFdBQVMsbUJBQW1CLE1BQU07QUFDOUIsWUFBUSxNQUFNO0FBQUEsTUFDVixLQUFLO0FBQWEsZUFBTztBQUFBLE1BQ3pCLEtBQUs7QUFBYSxlQUFPO0FBQUEsTUFDekIsS0FBSztBQUFhLGVBQU87QUFBQSxNQUN6QixLQUFLO0FBQWlCLGVBQU87QUFBQSxNQUM3QixLQUFLO0FBQWlCLGVBQU87QUFBQSxNQUM3QixLQUFLO0FBQWlCLGVBQU87QUFBQSxNQUM3QixLQUFLO0FBQWlCLGVBQU87QUFBQSxNQUM3QjtBQUFTLGVBQU87QUFBQSxJQUNwQjtBQUFBLEVBQ0o7QUFFQSxXQUFTLG9CQUFvQixNQUFNLE1BQU0sZUFBZSxZQUFZO0FBQ2hFLDBCQUFzQjtBQUN0QixvQkFBZ0IsY0FBYyxVQUFVLEVBQUUsY0FBYztBQUN4RCxvQkFBZ0IsY0FBYyxnQkFBZ0IsRUFBRSxjQUFjLG1CQUFtQixJQUFJO0FBQ3JGLFVBQU0sVUFBVSxnQkFBZ0IsY0FBYyxXQUFXO0FBQ3pELFFBQUksU0FBUztBQUNULGNBQVEsY0FBYyxhQUFhLElBQUksSUFBSSxhQUFhLE9BQU8sVUFBVSxNQUFNO0FBQUEsSUFDbkY7QUFDQSxvQkFBZ0IsVUFBVSxJQUFJLFFBQVE7QUFFdEMsV0FBTyxJQUFJLFFBQVEsYUFBVztBQUMxQiwwQkFBb0I7QUFBQSxJQUN4QixDQUFDO0FBQUEsRUFDTDtBQUlBLE1BQUksZ0JBQWdCO0FBQ3BCLE1BQUksbUJBQW1CO0FBRXZCLFdBQVMsa0JBQWtCO0FBRXZCLFFBQUksaUJBQWlCLGNBQWMsVUFBVSxTQUFTLFFBQVEsR0FBRztBQUM3RCxVQUFJLGlCQUFrQixjQUFhLGdCQUFnQjtBQUNuRCx5QkFBbUIsV0FBVyxvQkFBb0IsR0FBSTtBQUN0RDtBQUFBLElBQ0o7QUFHQSxRQUFJLGNBQWUsZUFBYyxPQUFPO0FBRXhDLFVBQU0sUUFBUSxTQUFTLGNBQWMsS0FBSztBQUMxQyxVQUFNLEtBQUs7QUFDWCxVQUFNLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTRGbEIsYUFBUyxLQUFLLFlBQVksS0FBSztBQUMvQixvQkFBZ0I7QUFDaEIsMEJBQXNCLE1BQU0sTUFBTSxVQUFVLElBQUksUUFBUSxDQUFDO0FBRXpELFVBQU0sY0FBYyxTQUFTLEVBQUUsaUJBQWlCLFNBQVMsa0JBQWtCO0FBQzNFLFVBQU0sY0FBYyxjQUFjLEVBQUUsaUJBQWlCLFNBQVMsa0JBQWtCO0FBR2hGLHVCQUFtQixXQUFXLG9CQUFvQixHQUFJO0FBQUEsRUFDMUQ7QUFFQSxXQUFTLHFCQUFxQjtBQUMxQixRQUFJLGtCQUFrQjtBQUFFLG1CQUFhLGdCQUFnQjtBQUFHLHlCQUFtQjtBQUFBLElBQU07QUFDakYsUUFBSSxDQUFDLGNBQWU7QUFDcEIsa0JBQWMsVUFBVSxPQUFPLFFBQVE7QUFDdkMsVUFBTSxLQUFLO0FBQ1gsb0JBQWdCO0FBQ2hCLGVBQVcsTUFBTSxHQUFHLE9BQU8sR0FBRyxHQUFHO0FBQUEsRUFDckM7QUFHQSxNQUFJLFFBQVEsVUFBVSxZQUFZLENBQUMsU0FBUyxRQUFRLGlCQUFpQjtBQUNqRSxRQUFJLFFBQVEsU0FBUyx1QkFBdUI7QUFDeEMsMEJBQW9CLFFBQVEsTUFBTSxRQUFRLGdCQUFnQixRQUFRLGVBQWUsUUFBUSxVQUFVLEVBQUUsS0FBSyxZQUFVO0FBQ2hILHFCQUFhLE1BQU07QUFBQSxNQUN2QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLFFBQVEsU0FBUyxtQkFBbUI7QUFDcEMsc0JBQWdCO0FBQ2hCLG1CQUFhLElBQUk7QUFDakIsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKLENBQUM7QUFFRCxTQUFPLGlCQUFpQixXQUFXLE9BQU0sWUFBVztBQUVoRCxRQUFJLFFBQVEsV0FBVyxPQUFRO0FBRS9CLFVBQU0sY0FBYztBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUNBLFFBQUksRUFBRSxNQUFNLE9BQU8sUUFBUSxJQUFJLFFBQVE7QUFDdkMsUUFBSSxDQUFDLFlBQVksU0FBUyxJQUFJLEVBQUc7QUFFakMsUUFBSTtBQUNBLGdCQUFVLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxRQUNwQztBQUFBLFFBQ0E7QUFBQSxRQUNBLE1BQU0sT0FBTyxTQUFTO0FBQUEsTUFDMUIsQ0FBQztBQUFBLElBQ0wsU0FBUyxHQUFHO0FBQ1IsZ0JBQVUsRUFBRSxPQUFPLG9CQUFvQixTQUFTLEVBQUUsV0FBVyx1Q0FBdUM7QUFBQSxJQUN4RztBQUVBLFdBQU8sVUFBVSxJQUFJO0FBRXJCLFdBQU8sWUFBWSxFQUFFLE1BQU0sT0FBTyxRQUFRLEdBQUcsR0FBRztBQUFBLEVBQ3BELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
