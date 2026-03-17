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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3VsZEluamVjdCgpIHtcbiAgICBpZiAod2luZG93ID09PSB3aW5kb3cudG9wKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgYmxvY2tDcm9zc09yaWdpbkZyYW1lczogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKCFkYXRhLmJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXMpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHZvaWQgd2luZG93LnRvcC5sb2NhdGlvbi5ocmVmOyAvLyB0aHJvd3MgZm9yIGNyb3NzLW9yaWdpbiBmcmFtZXNcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbnNob3VsZEluamVjdCgpLnRoZW4oaW5qZWN0ID0+IHtcbiAgICBpZiAoIWluamVjdCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBhcGkucnVudGltZS5nZXRVUkwoJ25vc3RyLmJ1aWxkLmpzJykpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn0pO1xuXG4vLyBQZXJtaXNzaW9uIGJvdHRvbSBzaGVldFxubGV0IHBlcm1pc3Npb25TaGVldCA9IG51bGw7XG5sZXQgcGVybWlzc2lvblJlc29sdmUgPSBudWxsO1xuXG5mdW5jdGlvbiBjcmVhdGVQZXJtaXNzaW9uU2hlZXQoKSB7XG4gICAgaWYgKHBlcm1pc3Npb25TaGVldCkgcmV0dXJuO1xuICAgIFxuICAgIGNvbnN0IHNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2hlZXQuaWQgPSAnbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCc7XG4gICAgc2hlZXQuaW5uZXJIVE1MID0gYFxuICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgICAgIHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQuYWN0aXZlIHtcbiAgICAgICAgICAgICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGluc2V0OiAwO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsMC41KTtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQuYWN0aXZlIC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICMzZTNkMzI7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTZweCAxNnB4IDAgMDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAyNHB4O1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgLTRweCAyMHB4IHJnYmEoMCwwLDAsMC4zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0LmFjdGl2ZSAubmstc2hlZXQge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1oYW5kbGUge1xuICAgICAgICAgICAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogNHB4O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICM4ZjkwOGE7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgICAgICAgICAgICAgIG1hcmdpbjogMCBhdXRvIDE2cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstdGl0bGUge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjYTZlMjJlO1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWhvc3Qge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjNjZkOWVmO1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstcGVybWlzc2lvbiB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICNhNmUyMmU7XG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay10ZXh0IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogI2Y4ZjhmMjtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS41O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWJ1dHRvbnMge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICAgICAgZ2FwOiAxMnB4O1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDIwcHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstYnRuIHtcbiAgICAgICAgICAgICAgICBmbGV4OiAxO1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDE0cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNhNmUyMmU7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWJ0bi1hbGxvdyB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxNjYsMjI2LDQ2LDAuMSk7XG4gICAgICAgICAgICAgICAgY29sb3I6ICNhNmUyMmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybWlzc2lvbi1zaGVldCAubmstYnRuLWFsbG93OmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDE2NiwyMjYsNDYsMC4yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1idG4tZGVueSB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICAgICAgYm9yZGVyLWNvbG9yOiAjZjkyNjcyO1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjZjkyNjcyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLWJ0bi1kZW55OmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI0OSwzOCwxMTQsMC4xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtaXNzaW9uLXNoZWV0IC5uay1yZW1lbWJlciB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICAgICAgICAgIGdhcDogOHB4O1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDE2cHg7XG4gICAgICAgICAgICAgICAgY29sb3I6ICM4ZjkwOGE7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm1pc3Npb24tc2hlZXQgLm5rLXJlbWVtYmVyIGlucHV0IHtcbiAgICAgICAgICAgICAgICBhY2NlbnQtY29sb3I6ICNhNmUyMmU7XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1iYWNrZHJvcFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstc2hlZXRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1oYW5kbGVcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10aXRsZVwiPlBlcm1pc3Npb24gUmVxdWVzdCA8c3BhbiBpZD1cIm5rLXF1ZXVlXCIgc3R5bGU9XCJjb2xvcjogIzhmOTA4YTsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogNDAwO1wiPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10ZXh0XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJuay1ob3N0XCIgaWQ9XCJuay1ob3N0XCI+PC9zcGFuPiB3YW50cyB0bzpcbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRleHRcIiBzdHlsZT1cImZvbnQtc2l6ZToxNnB4O1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibmstcGVybWlzc2lvblwiIGlkPVwibmstcGVybWlzc2lvblwiPjwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJ1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibmstYnRuIG5rLWJ0bi1hbGxvd1wiIGlkPVwibmstYWxsb3dcIj5BbGxvdzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJuay1idG4gbmstYnRuLWRlbnlcIiBpZD1cIm5rLWRlbnlcIj5EZW55PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1yZW1lbWJlclwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cIm5rLXJlbWVtYmVyXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cIm5rLXJlbWVtYmVyXCI+UmVtZW1iZXIgdGhpcyBjaG9pY2U8L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzaGVldCk7XG4gICAgcGVybWlzc2lvblNoZWV0ID0gc2hlZXQ7XG4gICAgXG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignI25rLWFsbG93JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGhhbmRsZVBlcm1pc3Npb25SZXNwb25zZSh0cnVlKTtcbiAgICB9KTtcbiAgICBzaGVldC5xdWVyeVNlbGVjdG9yKCcjbmstZGVueScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoYW5kbGVQZXJtaXNzaW9uUmVzcG9uc2UoZmFsc2UpO1xuICAgIH0pO1xuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJy5uay1iYWNrZHJvcCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBoYW5kbGVQZXJtaXNzaW9uUmVzcG9uc2UoZmFsc2UpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQZXJtaXNzaW9uUmVzcG9uc2UoYWxsb3dlZCkge1xuICAgIGlmICghcGVybWlzc2lvblJlc29sdmUpIHJldHVybjtcbiAgICBjb25zdCByZW1lbWJlciA9IHBlcm1pc3Npb25TaGVldC5xdWVyeVNlbGVjdG9yKCcjbmstcmVtZW1iZXInKS5jaGVja2VkO1xuICAgIHBlcm1pc3Npb25TaGVldC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBwZXJtaXNzaW9uU2hlZXQucXVlcnlTZWxlY3RvcignI25rLXJlbWVtYmVyJykuY2hlY2tlZCA9IGZhbHNlO1xuICAgIHBlcm1pc3Npb25SZXNvbHZlKHsgYWxsb3dlZCwgcmVtZW1iZXIgfSk7XG4gICAgcGVybWlzc2lvblJlc29sdmUgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRIdW1hblBlcm1pc3Npb24oa2luZCkge1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgICBjYXNlICdnZXRQdWJLZXknOiByZXR1cm4gJ1JlYWQgeW91ciBwdWJsaWMga2V5JztcbiAgICAgICAgY2FzZSAnc2lnbkV2ZW50JzogcmV0dXJuICdTaWduIGFuIGV2ZW50JztcbiAgICAgICAgY2FzZSAnZ2V0UmVsYXlzJzogcmV0dXJuICdSZWFkIHlvdXIgcmVsYXkgbGlzdCc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmVuY3J5cHQnOiByZXR1cm4gJ0VuY3J5cHQgYSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwMDQuZGVjcnlwdCc6IHJldHVybiAnRGVjcnlwdCBhIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXA0NC5lbmNyeXB0JzogcmV0dXJuICdFbmNyeXB0IGEgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmRlY3J5cHQnOiByZXR1cm4gJ0RlY3J5cHQgYSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIGtpbmQ7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzaG93UGVybWlzc2lvblNoZWV0KGhvc3QsIGtpbmQsIHF1ZXVlUG9zaXRpb24sIHF1ZXVlVG90YWwpIHtcbiAgICBjcmVhdGVQZXJtaXNzaW9uU2hlZXQoKTtcbiAgICBwZXJtaXNzaW9uU2hlZXQucXVlcnlTZWxlY3RvcignI25rLWhvc3QnKS50ZXh0Q29udGVudCA9IGhvc3Q7XG4gICAgcGVybWlzc2lvblNoZWV0LnF1ZXJ5U2VsZWN0b3IoJyNuay1wZXJtaXNzaW9uJykudGV4dENvbnRlbnQgPSBnZXRIdW1hblBlcm1pc3Npb24oa2luZCk7XG4gICAgY29uc3QgcXVldWVFbCA9IHBlcm1pc3Npb25TaGVldC5xdWVyeVNlbGVjdG9yKCcjbmstcXVldWUnKTtcbiAgICBpZiAocXVldWVFbCkge1xuICAgICAgICBxdWV1ZUVsLnRleHRDb250ZW50ID0gcXVldWVUb3RhbCA+IDEgPyBgKCR7cXVldWVQb3NpdGlvbn0gb2YgJHtxdWV1ZVRvdGFsfSlgIDogJyc7XG4gICAgfVxuICAgIHBlcm1pc3Npb25TaGVldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIHBlcm1pc3Npb25SZXNvbHZlID0gcmVzb2x2ZTtcbiAgICB9KTtcbn1cblxuLy8gTG9ja2VkIG5vdGlmaWNhdGlvbiBzaGVldCBcdTIwMTQgc2hvd24gd2hlbiBhIHNpdGUgbmVlZHMgdGhlIHByaXZhdGUga2V5XG4vLyBidXQgdGhlIGV4dGVuc2lvbiBpcyBsb2NrZWQuIFNob3dzIGV2ZXJ5IHRpbWUgdW50aWwgdW5sb2NrZWQuXG5sZXQgbG9ja2VkU2hlZXRFbCA9IG51bGw7XG5sZXQgbG9ja2VkU2hlZXRUaW1lciA9IG51bGw7XG5cbmZ1bmN0aW9uIHNob3dMb2NrZWRTaGVldCgpIHtcbiAgICAvLyBJZiBhbHJlYWR5IHZpc2libGUsIHJlc2V0IHRoZSBhdXRvLWRpc21pc3MgdGltZXJcbiAgICBpZiAobG9ja2VkU2hlZXRFbCAmJiBsb2NrZWRTaGVldEVsLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgaWYgKGxvY2tlZFNoZWV0VGltZXIpIGNsZWFyVGltZW91dChsb2NrZWRTaGVldFRpbWVyKTtcbiAgICAgICAgbG9ja2VkU2hlZXRUaW1lciA9IHNldFRpbWVvdXQoZGlzbWlzc0xvY2tlZFNoZWV0LCA1MDAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbnkgc3RhbGUgc2hlZXRcbiAgICBpZiAobG9ja2VkU2hlZXRFbCkgbG9ja2VkU2hlZXRFbC5yZW1vdmUoKTtcblxuICAgIGNvbnN0IHNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2hlZXQuaWQgPSAnbm9zdHJrZXktbG9ja2VkLXNoZWV0JztcbiAgICBzaGVldC5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgICBib3R0b206IDA7XG4gICAgICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgICAgICByaWdodDogMDtcbiAgICAgICAgICAgICAgICB6LWluZGV4OiAyMTQ3NDgzNjQ3O1xuICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcbiAgICAgICAgICAgICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICAgICAgaW5zZXQ6IDA7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwwLjUpO1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGVhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0LmFjdGl2ZSAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICMzZTNkMzI7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTZweCAxNnB4IDAgMDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAyNHB4O1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgLTRweCAyMHB4IHJnYmEoMCwwLDAsMC4zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQuYWN0aXZlIC5uay1zaGVldCB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstaGFuZGxlIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogNDBweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDRweDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAjOGY5MDhhO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxNnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstaWNvbiB7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAzMnB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstdGl0bGUge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjZTZkYjc0O1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay10ZXh0IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogI2Y4ZjhmMjtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogNHB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstbXV0ZWQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAjOGY5MDhhO1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1idG4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDE0cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNhNmUyMmU7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgxNjYsMjI2LDQ2LDAuMSk7XG4gICAgICAgICAgICAgICAgY29sb3I6ICNhNmUyMmU7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDIwcHg7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjE1cyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDE2NiwyMjYsNDYsMC4yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1zaGVldFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWhhbmRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWljb25cIj4mI3gxRjUxMjs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10aXRsZVwiPk5vc3RyS2V5IGlzIExvY2tlZDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRleHRcIj5UaGlzIHNpdGUgbmVlZHMgeW91ciBrZXkgdG8gc2lnbiBvciBlbmNyeXB0LjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLW11dGVkXCI+Q2xpY2sgdGhlIE5vc3RyS2V5IGljb24gaW4geW91ciB0b29sYmFyIGFuZCBlbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZC48L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJuay1idG5cIj5Hb3QgaXQ8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNoZWV0KTtcbiAgICBsb2NrZWRTaGVldEVsID0gc2hlZXQ7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHNoZWV0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTtcblxuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJy5uay1idG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3NMb2NrZWRTaGVldCk7XG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzTG9ja2VkU2hlZXQpO1xuXG4gICAgLy8gQXV0by1kaXNtaXNzIGFmdGVyIDUgc2Vjb25kc1xuICAgIGxvY2tlZFNoZWV0VGltZXIgPSBzZXRUaW1lb3V0KGRpc21pc3NMb2NrZWRTaGVldCwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIGRpc21pc3NMb2NrZWRTaGVldCgpIHtcbiAgICBpZiAobG9ja2VkU2hlZXRUaW1lcikgeyBjbGVhclRpbWVvdXQobG9ja2VkU2hlZXRUaW1lcik7IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsOyB9XG4gICAgaWYgKCFsb2NrZWRTaGVldEVsKSByZXR1cm47XG4gICAgbG9ja2VkU2hlZXRFbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBjb25zdCBlbCA9IGxvY2tlZFNoZWV0RWw7XG4gICAgbG9ja2VkU2hlZXRFbCA9IG51bGw7XG4gICAgc2V0VGltZW91dCgoKSA9PiBlbC5yZW1vdmUoKSwgMzAwKTtcbn1cblxuLy8gTGlzdGVuIGZvciByZXF1ZXN0cyBmcm9tIGJhY2tncm91bmRcbmFwaS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnc2hvd1Blcm1pc3Npb25TaGVldCcpIHtcbiAgICAgICAgc2hvd1Blcm1pc3Npb25TaGVldChtZXNzYWdlLmhvc3QsIG1lc3NhZ2UucGVybWlzc2lvbktpbmQsIG1lc3NhZ2UucXVldWVQb3NpdGlvbiwgbWVzc2FnZS5xdWV1ZVRvdGFsKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uua2luZCA9PT0gJ3Nob3dMb2NrZWRTaGVldCcpIHtcbiAgICAgICAgc2hvd0xvY2tlZFNoZWV0KCk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgYXN5bmMgbWVzc2FnZSA9PiB7XG4gICAgLy8gQzMgZml4OiBPbmx5IGFjY2VwdCBtZXNzYWdlcyBmcm9tIHRoZSB0b3AtbGV2ZWwgcGFnZSBjb250ZXh0XG4gICAgaWYgKG1lc3NhZ2Uuc291cmNlICE9PSB3aW5kb3cpIHJldHVybjtcblxuICAgIGNvbnN0IHZhbGlkRXZlbnRzID0gW1xuICAgICAgICAnZ2V0UHViS2V5JyxcbiAgICAgICAgJ3NpZ25FdmVudCcsXG4gICAgICAgICdnZXRSZWxheXMnLFxuICAgICAgICAnYWRkUmVsYXknLFxuICAgICAgICAnZXhwb3J0UHJvZmlsZScsXG4gICAgICAgICduaXAwNC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDA0LmRlY3J5cHQnLFxuICAgICAgICAnbmlwNDQuZW5jcnlwdCcsXG4gICAgICAgICduaXA0NC5kZWNyeXB0JyxcbiAgICAgICAgJ3JlcGxhY2VVUkwnLFxuICAgICAgICAnYnVua2VyU2VydmVyLnN0YXJ0JyxcbiAgICAgICAgJ2J1bmtlclNlcnZlci5zdG9wJyxcbiAgICAgICAgJ2J1bmtlclNlcnZlci5zdGF0dXMnLFxuICAgIF07XG4gICAgbGV0IHsga2luZCwgcmVxSWQsIHBheWxvYWQgfSA9IG1lc3NhZ2UuZGF0YTtcbiAgICBpZiAoIXZhbGlkRXZlbnRzLmluY2x1ZGVzKGtpbmQpKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBwYXlsb2FkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uaG9zdCxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBwYXlsb2FkID0geyBlcnJvcjogJ2Nvbm5lY3Rpb25fZXJyb3InLCBtZXNzYWdlOiBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZWFjaCBleHRlbnNpb24gYmFja2dyb3VuZCcgfTtcbiAgICB9XG5cbiAgICBraW5kID0gYHJldHVybl8ke2tpbmR9YDtcblxuICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7IGtpbmQsIHJlcUlkLCBwYXlsb2FkIH0sICcqJyk7XG59KTtcbiJdLAogICJtYXBw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QixTQUFTLGtCQUFrQjtBQUdoRix1QkFBbUIsV0FBVyxvQkFBb0IsR0FBSTtBQUFBLEVBQzFEO0FBRUEsV0FBUyxxQkFBcUI7QUFDMUIsUUFBSSxrQkFBa0I7QUFBRSxtQkFBYSxnQkFBZ0I7QUFBRyx5QkFBbUI7QUFBQSxJQUFNO0FBQ2pGLFFBQUksQ0FBQyxjQUFlO0FBQ3BCLGtCQUFjLFVBQVUsT0FBTyxRQUFRO0FBQ3ZDLFVBQU0sS0FBSztBQUNYLG9CQUFnQjtBQUNoQixlQUFXLE1BQU0sR0FBRyxPQUFPLEdBQUcsR0FBRztBQUFBLEVBQ3JDO0FBR0EsTUFBSSxRQUFRLFVBQVUsWUFBWSxDQUFDLFNBQVMsUUFBUSxpQkFBaUI7QUFDakUsUUFBSSxRQUFRLFNBQVMsdUJBQXVCO0FBQ3hDLDBCQUFvQixRQUFRLE1BQU0sUUFBUSxnQkFBZ0IsUUFBUSxlQUFlLFFBQVEsVUFBVSxFQUFFLEtBQUssWUFBVTtBQUNoSCxxQkFBYSxNQUFNO0FBQUEsTUFDdkIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxRQUFRLFNBQVMsbUJBQW1CO0FBQ3BDLHNCQUFnQjtBQUNoQixtQkFBYSxJQUFJO0FBQ2pCLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSixDQUFDO0FBRUQsU0FBTyxpQkFBaUIsV0FBVyxPQUFNLFlBQVc7QUFFaEQsUUFBSSxRQUFRLFdBQVcsT0FBUTtBQUUvQixVQUFNLGNBQWM7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFDQSxRQUFJLEVBQUUsTUFBTSxPQUFPLFFBQVEsSUFBSSxRQUFRO0FBQ3ZDLFFBQUksQ0FBQyxZQUFZLFNBQVMsSUFBSSxFQUFHO0FBRWpDLFFBQUk7QUFDQSxnQkFBVSxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsUUFDcEM7QUFBQSxRQUNBO0FBQUEsUUFDQSxNQUFNLE9BQU8sU0FBUztBQUFBLE1BQzFCLENBQUM7QUFBQSxJQUNMLFNBQVMsR0FBRztBQUNSLGdCQUFVLEVBQUUsT0FBTyxvQkFBb0IsU0FBUyxFQUFFLFdBQVcsdUNBQXVDO0FBQUEsSUFDeEc7QUFFQSxXQUFPLFVBQVUsSUFBSTtBQUVyQixXQUFPLFlBQVksRUFBRSxNQUFNLE9BQU8sUUFBUSxHQUFHLEdBQUc7QUFBQSxFQUNwRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
