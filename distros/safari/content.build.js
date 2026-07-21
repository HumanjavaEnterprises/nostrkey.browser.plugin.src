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
  var NK_CHANNEL_TOKEN = crypto.randomUUID();
  shouldInject().then((inject) => {
    if (!inject) return;
    let script = document.createElement("script");
    script.setAttribute("src", api.runtime.getURL("nostr.build.js"));
    script.dataset.nkToken = NK_CHANNEL_TOKEN;
    document.body.appendChild(script);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        api.runtime.sendMessage({ kind: "resetAutoLock" }).catch(() => {
        });
      }
    });
  });
  var NK_PALETTES = {
    "instrument-dark": { base: "#0E0F13", panel: "#16181D", hair: "#2A2E37", text: "#E7E9EE", muted: "#8A90A0", signal: "#c084fc", signalDim: "rgba(192,132,252,0.16)" },
    "instrument-light": { base: "#F4F5F7", panel: "#FFFFFF", hair: "#DCDFE6", text: "#191B22", muted: "#626878", signal: "#7C3AED", signalDim: "rgba(124,58,237,0.12)" },
    "analog-dark": { base: "#141210", panel: "#1C1815", hair: "#352E25", text: "#EDE6DA", muted: "#A2937C", signal: "#fbbf24", signalDim: "rgba(251,191,36,0.14)" },
    "analog-light": { base: "#F4EAD6", panel: "#FCF6E8", hair: "#DBCAA4", text: "#33260F", muted: "#72613A", signal: "#984E09", signalDim: "rgba(152,78,9,0.12)" },
    "console-dark": { base: "#0B1220", panel: "#111A2B", hair: "#24314A", text: "#E6EDF6", muted: "#8391A8", signal: "#2dd4bf", signalDim: "rgba(45,212,191,0.15)" },
    "console-light": { base: "#F1F5F9", panel: "#FFFFFF", hair: "#D2DBE6", text: "#0F172A", muted: "#5B6879", signal: "#0A766C", signalDim: "rgba(10,118,108,0.12)" }
  };
  var nkLookPromise = null;
  async function readNkLook() {
    let prefs = null;
    try {
      const data = await api.storage.sync.get("a11y_prefs");
      if (data && data.a11y_prefs && typeof data.a11y_prefs === "object") prefs = data.a11y_prefs;
    } catch (_) {
    }
    if (!prefs) {
      try {
        const data = await api.storage.local.get("a11y_prefs");
        if (data && data.a11y_prefs && typeof data.a11y_prefs === "object") prefs = data.a11y_prefs;
      } catch (_) {
      }
    }
    prefs = prefs || {};
    const theme = ["instrument", "analog", "console"].includes(prefs.theme) ? prefs.theme : "console";
    let mode = ["dark", "light", "system"].includes(prefs.mode) ? prefs.mode : "dark";
    if (mode === "system") {
      try {
        mode = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      } catch (_) {
        mode = "dark";
      }
    }
    return {
      p: NK_PALETTES[theme + "-" + mode] || NK_PALETTES["console-dark"],
      reduceMotion: prefs.reduceMotion === true
    };
  }
  function getNkLook() {
    if (!nkLookPromise) nkLookPromise = readNkLook();
    return nkLookPromise;
  }
  try {
    api.storage.onChanged.addListener((changes, area) => {
      if ((area === "sync" || area === "local") && changes.a11y_prefs) nkLookPromise = null;
    });
  } catch (_) {
  }
  function mountShadowHost() {
    const host = document.createElement("div");
    const pin = (prop, val) => host.style.setProperty(prop, val, "important");
    pin("all", "initial");
    pin("position", "fixed");
    pin("top", "0");
    pin("left", "0");
    pin("width", "0");
    pin("height", "0");
    pin("z-index", "2147483647");
    pin("opacity", "1");
    pin("visibility", "visible");
    pin("display", "block");
    pin("transform", "none");
    pin("filter", "none");
    pin("mix-blend-mode", "normal");
    pin("pointer-events", "auto");
    const root = host.attachShadow({ mode: "closed" });
    document.documentElement.appendChild(host);
    return { host, root };
  }
  var lockedSheetHost = null;
  var lockedSheetEl = null;
  var lockedSheetTimer = null;
  async function showLockedSheet(firstUnlock) {
    if (lockedSheetEl && lockedSheetEl.classList.contains("active")) {
      if (lockedSheetTimer) clearTimeout(lockedSheetTimer);
      lockedSheetTimer = setTimeout(dismissLockedSheet, 5e3);
      return;
    }
    const { p, reduceMotion } = await getNkLook();
    if (lockedSheetHost) lockedSheetHost.remove();
    const { host, root } = mountShadowHost();
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
                background: ${p.panel};
                border-top: 1px solid ${p.hair};
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
                background: ${p.hair};
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: ${p.text};
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: ${p.text};
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: ${p.muted};
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid ${p.signal};
                background: ${p.signalDim};
                color: ${p.signal};
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: ${p.signalDim};
            }
            ${reduceMotion ? `#nostrkey-locked-sheet .nk-backdrop,
            #nostrkey-locked-sheet .nk-sheet { transition: none; }` : ""}
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-locked-sheet .nk-backdrop,
                #nostrkey-locked-sheet .nk-sheet { transition: none; }
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-icon">&#x1F512;</div>
            <div class="nk-title">${firstUnlock ? "NostrKey Needs to Decrypt Your Keys" : "NostrKey is Locked"}</div>
            <div class="nk-text">${firstUnlock ? "This site is requesting your Nostr identity. Enter your master password to decrypt your key vault for this session." : "This site needs your key to sign or encrypt."}</div>
            <div class="nk-muted">Click the NostrKey icon in your toolbar and enter your master password.</div>
            <button class="nk-btn">Got it</button>
        </div>
    `;
    root.appendChild(sheet);
    lockedSheetHost = host;
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
    const host = lockedSheetHost;
    lockedSheetEl = null;
    lockedSheetHost = null;
    setTimeout(() => host && host.remove(), 300);
  }
  var permSheetHost = null;
  var permSheetEl = null;
  var permFabHost = null;
  var permFabEl = null;
  var permSheetSrc = null;
  var nkPermGen = 0;
  async function showPermissionSheet(src) {
    permSheetSrc = src;
    const gen = ++nkPermGen;
    const { p, reduceMotion } = await getNkLook();
    if (gen !== nkPermGen) return;
    removePermissionFab();
    if (permSheetHost) permSheetHost.remove();
    const { host, root } = mountShadowHost();
    const el = document.createElement("div");
    el.id = "nostrkey-perm-sheet";
    el.innerHTML = `
        <style>
            #nostrkey-perm-sheet { position: fixed; inset: 0; z-index: 2147483647; }
            #nostrkey-perm-sheet .nk-backdrop {
                position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                opacity: 0;${reduceMotion ? "" : " transition: opacity .2s ease;"}
            }
            #nostrkey-perm-sheet.active .nk-backdrop { opacity: 1; }
            #nostrkey-perm-sheet .nk-frame-wrap {
                position: fixed; left: 0; right: 0; bottom: 0;
                max-width: 460px; margin: 0 auto;
                transform: translateY(100%);${reduceMotion ? "" : " transition: transform .3s ease;"}
            }
            #nostrkey-perm-sheet.active .nk-frame-wrap { transform: translateY(0); }
            #nostrkey-perm-sheet iframe {
                display: block; width: 100%; height: 72vh; max-height: 640px;
                border: 0; border-radius: 16px 16px 0 0;
                box-shadow: 0 -6px 28px rgba(0,0,0,.45); background: ${p.base};
            }
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-perm-sheet .nk-backdrop,
                #nostrkey-perm-sheet .nk-frame-wrap { transition: none; }
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-frame-wrap"><iframe title="NostrKey permission request"></iframe></div>
    `;
    el.querySelector("iframe").src = src;
    root.appendChild(el);
    permSheetHost = host;
    permSheetEl = el;
    requestAnimationFrame(() => el.classList.add("active"));
    el.querySelector(".nk-backdrop").addEventListener("click", minimizePermissionSheet);
    startSheetGuard();
  }
  function minimizePermissionSheet() {
    if (!permSheetHost) return;
    stopSheetGuard();
    permSheetHost.remove();
    permSheetHost = null;
    permSheetEl = null;
    showPermissionFab();
  }
  async function showPermissionFab() {
    if (permFabEl || !permSheetSrc) return;
    const gen = ++nkPermGen;
    const { p, reduceMotion } = await getNkLook();
    if (gen !== nkPermGen) return;
    if (permFabEl || !permSheetSrc) return;
    const { host, root } = mountShadowHost();
    const fab = document.createElement("div");
    fab.id = "nostrkey-perm-fab";
    fab.innerHTML = `
        <style>
            #nostrkey-perm-fab { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            #nostrkey-perm-fab .nk-fab {
                display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px;
                border-radius: 999px; cursor: pointer; border: 1px solid ${p.signal};
                background: ${p.panel}; color: ${p.text}; font-size: 14px; font-weight: 600;
                box-shadow: 0 4px 18px rgba(0,0,0,.4);${reduceMotion ? "" : " animation: nk-fab-pulse 2s ease-in-out infinite;"}
            }
            #nostrkey-perm-fab .nk-dot { width: 8px; height: 8px; border-radius: 50%; background: ${p.signal}; }
            #nostrkey-perm-fab .nk-fab-cd { font-variant-numeric: tabular-nums; color: ${p.muted}; font-weight: 600; }
            @keyframes nk-fab-pulse { 0%,100%{ box-shadow: 0 4px 18px rgba(0,0,0,.4);} 50%{ box-shadow: 0 4px 24px ${p.signalDim};} }
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-perm-fab .nk-fab { animation: none; }
            }
        </style>
        <button class="nk-fab" type="button"><span class="nk-dot"></span>Review signing request<span class="nk-fab-cd"></span></button>
    `;
    root.appendChild(fab);
    permFabHost = host;
    permFabEl = fab;
    fab.querySelector(".nk-fab").addEventListener("click", () => showPermissionSheet(permSheetSrc));
    startFabCountdown(fab.querySelector(".nk-fab-cd"));
  }
  var permFabTimer = null;
  function startFabCountdown(cdEl) {
    stopFabCountdown();
    let deadline = 0;
    try {
      deadline = Number(new URL(permSheetSrc).searchParams.get("deadline")) || 0;
    } catch (_) {
    }
    if (!deadline || !cdEl) return;
    const tick = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        cdEl.textContent = "\xB7 expired";
        stopFabCountdown();
        return;
      }
      cdEl.textContent = `\xB7 ${Math.ceil(remaining / 1e3)}s`;
    };
    tick();
    permFabTimer = setInterval(tick, 250);
  }
  function stopFabCountdown() {
    if (permFabTimer) {
      clearInterval(permFabTimer);
      permFabTimer = null;
    }
  }
  function removePermissionFab() {
    stopFabCountdown();
    if (permFabHost) {
      permFabHost.remove();
      permFabHost = null;
    }
    permFabEl = null;
  }
  function removePermissionUI() {
    nkPermGen++;
    stopSheetGuard();
    if (permSheetHost) {
      permSheetHost.remove();
      permSheetHost = null;
      permSheetEl = null;
    }
    removePermissionFab();
    permSheetSrc = null;
  }
  var sheetGuardObserver = null;
  var sheetGuardTimer = null;
  function styleSuppresses(cs) {
    if (!cs) return true;
    return parseFloat(cs.opacity) < 0.9 || cs.visibility !== "visible" || cs.display === "none" || cs.pointerEvents === "none" || cs.filter !== "none" || cs.transform !== "none" || cs.mixBlendMode !== "normal" || cs.clipPath !== "none" || cs.perspective !== "none" || cs.contentVisibility === "hidden" || cs.mask && cs.mask !== "none" || cs.webkitMask && cs.webkitMask !== "none" || cs.backdropFilter && cs.backdropFilter !== "none";
  }
  function sheetLooksCompromised() {
    const host = permSheetHost;
    if (!host || !host.isConnected) return true;
    if (host.parentNode !== document.documentElement) return true;
    try {
      if (styleSuppresses(getComputedStyle(host))) return true;
      if (styleSuppresses(getComputedStyle(document.documentElement))) return true;
      const iframe = permSheetEl && permSheetEl.querySelector("iframe");
      if (!iframe) return true;
      const ifcs = getComputedStyle(iframe);
      if (parseFloat(ifcs.opacity) < 0.9 || ifcs.visibility !== "visible") return true;
    } catch (_) {
      return true;
    }
    return false;
  }
  function onSheetCompromised() {
    stopSheetGuard();
    removePermissionUI();
    api.runtime.sendMessage({ kind: "permissionSheetCompromised" }).catch(() => {
    });
  }
  function startSheetGuard() {
    stopSheetGuard();
    try {
      sheetGuardObserver = new MutationObserver(() => {
        if (sheetLooksCompromised()) onSheetCompromised();
      });
      sheetGuardObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["style", "class"],
        childList: true,
        subtree: true
      });
    } catch (_) {
    }
    sheetGuardTimer = setInterval(() => {
      if (sheetLooksCompromised()) onSheetCompromised();
    }, 200);
  }
  function stopSheetGuard() {
    if (sheetGuardObserver) {
      sheetGuardObserver.disconnect();
      sheetGuardObserver = null;
    }
    if (sheetGuardTimer) {
      clearInterval(sheetGuardTimer);
      sheetGuardTimer = null;
    }
  }
  window.addEventListener("message", (ev) => {
    if (!permSheetEl) return;
    const iframe = permSheetEl.querySelector("iframe");
    if (!iframe || ev.source !== iframe.contentWindow) return;
    if (ev.data && ev.data.__nostrkey_perm === "minimize") minimizePermissionSheet();
  });
  api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.kind === "showLockedSheet") {
      showLockedSheet(message.firstUnlock || false);
      sendResponse(true);
      return true;
    }
    if (message.kind === "showPermissionSheet") {
      showPermissionSheet(message.url);
      sendResponse(true);
      return true;
    }
    if (message.kind === "closePermissionSheet") {
      removePermissionUI();
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
      "nip04.encrypt",
      "nip04.decrypt",
      "nip44.encrypt",
      "nip44.decrypt",
      "replaceURL"
    ];
    let { kind, reqId, payload } = message.data;
    if (!validEvents.includes(kind)) return;
    try {
      payload = await api.runtime.sendMessage({
        kind,
        payload,
        // NK-03: key permission grants on the full origin (scheme+host[:port]),
        // not the bare host, so http/https and different ports don't share grants.
        host: window.location.origin
      });
    } catch (e) {
      payload = { error: "connection_error", message: e.message || "Failed to reach extension background" };
    }
    kind = `return_${kind}`;
    window.postMessage({ kind, reqId, payload, token: NK_CHANNEL_TOKEN }, window.location.origin);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3VsZEluamVjdCgpIHtcbiAgICBpZiAod2luZG93ID09PSB3aW5kb3cudG9wKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgYmxvY2tDcm9zc09yaWdpbkZyYW1lczogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKCFkYXRhLmJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXMpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHZvaWQgd2luZG93LnRvcC5sb2NhdGlvbi5ocmVmOyAvLyB0aHJvd3MgZm9yIGNyb3NzLW9yaWdpbiBmcmFtZXNcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8vIE5LLTU6IHBlci1wYWdlLWxvYWQgY2hhbm5lbCB0b2tlbiBzaGFyZWQgcHJpdmF0ZWx5IHdpdGggdGhlIGluamVjdGVkXG4vLyBwYWdlLXdvcmxkIHNjcmlwdC4gUGFzc2VkIHZpYSBhIGRhdGEgYXR0cmlidXRlIHRoYXQgdGhlIGluamVjdGVkIHNjcmlwdFxuLy8gcmVhZHMgYW5kIHN0cmlwcyBzeW5jaHJvbm91c2x5IG9uIGxvYWQuIEV2ZXJ5IHJlc3BvbnNlIHdlIHBvc3QgYmFjayB0byB0aGVcbi8vIHBhZ2UgY2FycmllcyB0aGlzIHRva2VuIHNvIGEgc2FtZS1wYWdlIHNjcmlwdCB0aGF0IG9ubHkgc2F3IHRoZSByZXF1ZXN0XG4vLyBicm9hZGNhc3QgY2Fubm90IGZvcmdlIGEgcmVzcG9uc2UuXG5jb25zdCBOS19DSEFOTkVMX1RPS0VOID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcblxuc2hvdWxkSW5qZWN0KCkudGhlbihpbmplY3QgPT4ge1xuICAgIGlmICghaW5qZWN0KSByZXR1cm47XG4gICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIGFwaS5ydW50aW1lLmdldFVSTCgnbm9zdHIuYnVpbGQuanMnKSk7XG4gICAgc2NyaXB0LmRhdGFzZXQubmtUb2tlbiA9IE5LX0NIQU5ORUxfVE9LRU47XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXG4gICAgLy8gUmVzZXQgYXV0by1sb2NrIHRpbWVyIHdoZW4gYSBOb3N0ci1lbmFibGVkIHRhYiBnYWlucyBmb2N1c1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICd2aXNpYmxlJykge1xuICAgICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncmVzZXRBdXRvTG9jaycgfSkuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICB9XG4gICAgfSk7XG59KTtcblxuLy8gXHUyNTAwXHUyNTAwIEFwcGVhcmFuY2UgZm9yIGluamVjdGVkIGNocm9tZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8vIFRoZSBpbmplY3RlZCBjb25zZW50IGNocm9tZSAobG9ja2VkIHNoZWV0LCBwZXJtaXNzaW9uLXNoZWV0IHdyYXBwZXIsIEZBQilcbi8vIGZvbGxvd3MgdGhlIHVzZXIncyBBcHBlYXJhbmNlIHByZWZzIChhMTF5X3ByZWZzIFx1MjE5MiBMT09LIFx1MDBENyBNT0RFICsgcmVkdWNlXG4vLyBtb3Rpb24pLiBTRUNVUklUWTogc3RvcmFnZSB2YWx1ZXMgb25seSBldmVyIFNFTEVDVCBvbmUgb2YgdGhlc2UgaGFyZGNvZGVkXG4vLyBsaXRlcmFsIHBhbGV0dGVzIFx1MjAxNCBubyBzdG9yYWdlLWRlcml2ZWQgc3RyaW5nIGlzIGludGVycG9sYXRlZCBpbnRvIGluamVjdGVkXG4vLyBtYXJrdXAuIFZhbHVlcyBjb3BpZWQgdmVyYmF0aW0gZnJvbSBpbnN0cnVtZW50LmNzcyBza2luIHRva2Vucy5cbmNvbnN0IE5LX1BBTEVUVEVTID0ge1xuICAgICdpbnN0cnVtZW50LWRhcmsnOiAgeyBiYXNlOiAnIzBFMEYxMycsIHBhbmVsOiAnIzE2MTgxRCcsIGhhaXI6ICcjMkEyRTM3JywgdGV4dDogJyNFN0U5RUUnLCBtdXRlZDogJyM4QTkwQTAnLCBzaWduYWw6ICcjYzA4NGZjJywgc2lnbmFsRGltOiAncmdiYSgxOTIsMTMyLDI1MiwwLjE2KScgfSxcbiAgICAnaW5zdHJ1bWVudC1saWdodCc6IHsgYmFzZTogJyNGNEY1RjcnLCBwYW5lbDogJyNGRkZGRkYnLCBoYWlyOiAnI0RDREZFNicsIHRleHQ6ICcjMTkxQjIyJywgbXV0ZWQ6ICcjNjI2ODc4Jywgc2lnbmFsOiAnIzdDM0FFRCcsIHNpZ25hbERpbTogJ3JnYmEoMTI0LDU4LDIzNywwLjEyKScgfSxcbiAgICAnYW5hbG9nLWRhcmsnOiAgICAgIHsgYmFzZTogJyMxNDEyMTAnLCBwYW5lbDogJyMxQzE4MTUnLCBoYWlyOiAnIzM1MkUyNScsIHRleHQ6ICcjRURFNkRBJywgbXV0ZWQ6ICcjQTI5MzdDJywgc2lnbmFsOiAnI2ZiYmYyNCcsIHNpZ25hbERpbTogJ3JnYmEoMjUxLDE5MSwzNiwwLjE0KScgfSxcbiAgICAnYW5hbG9nLWxpZ2h0JzogICAgIHsgYmFzZTogJyNGNEVBRDYnLCBwYW5lbDogJyNGQ0Y2RTgnLCBoYWlyOiAnI0RCQ0FBNCcsIHRleHQ6ICcjMzMyNjBGJywgbXV0ZWQ6ICcjNzI2MTNBJywgc2lnbmFsOiAnIzk4NEUwOScsIHNpZ25hbERpbTogJ3JnYmEoMTUyLDc4LDksMC4xMiknIH0sXG4gICAgJ2NvbnNvbGUtZGFyayc6ICAgICB7IGJhc2U6ICcjMEIxMjIwJywgcGFuZWw6ICcjMTExQTJCJywgaGFpcjogJyMyNDMxNEEnLCB0ZXh0OiAnI0U2RURGNicsIG11dGVkOiAnIzgzOTFBOCcsIHNpZ25hbDogJyMyZGQ0YmYnLCBzaWduYWxEaW06ICdyZ2JhKDQ1LDIxMiwxOTEsMC4xNSknIH0sXG4gICAgJ2NvbnNvbGUtbGlnaHQnOiAgICB7IGJhc2U6ICcjRjFGNUY5JywgcGFuZWw6ICcjRkZGRkZGJywgaGFpcjogJyNEMkRCRTYnLCB0ZXh0OiAnIzBGMTcyQScsIG11dGVkOiAnIzVCNjg3OScsIHNpZ25hbDogJyMwQTc2NkMnLCBzaWduYWxEaW06ICdyZ2JhKDEwLDExOCwxMDgsMC4xMiknIH0sXG59O1xuXG5sZXQgbmtMb29rUHJvbWlzZSA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWROa0xvb2soKSB7XG4gICAgbGV0IHByZWZzID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQoJ2ExMXlfcHJlZnMnKTtcbiAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5hMTF5X3ByZWZzICYmIHR5cGVvZiBkYXRhLmExMXlfcHJlZnMgPT09ICdvYmplY3QnKSBwcmVmcyA9IGRhdGEuYTExeV9wcmVmcztcbiAgICB9IGNhdGNoIChfKSB7IC8qIHN5bmMgdW5hdmFpbGFibGUgXHUyMDE0IGZhbGwgdGhyb3VnaCAqLyB9XG4gICAgaWYgKCFwcmVmcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCgnYTExeV9wcmVmcycpO1xuICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5hMTF5X3ByZWZzICYmIHR5cGVvZiBkYXRhLmExMXlfcHJlZnMgPT09ICdvYmplY3QnKSBwcmVmcyA9IGRhdGEuYTExeV9wcmVmcztcbiAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBzdG9yYWdlIHVuYXZhaWxhYmxlIFx1MjAxNCBkZWZhdWx0cyBiZWxvdyAqLyB9XG4gICAgfVxuICAgIHByZWZzID0gcHJlZnMgfHwge307XG4gICAgLy8gTWlycm9ycyBhMTF5LmpzIHNhbml0aXplKCk6IHVua25vd24gdmFsdWVzIGZhbGwgYmFjayB0byBkZWZhdWx0cy5cbiAgICBjb25zdCB0aGVtZSA9IFsnaW5zdHJ1bWVudCcsICdhbmFsb2cnLCAnY29uc29sZSddLmluY2x1ZGVzKHByZWZzLnRoZW1lKSA/IHByZWZzLnRoZW1lIDogJ2NvbnNvbGUnO1xuICAgIGxldCBtb2RlID0gWydkYXJrJywgJ2xpZ2h0JywgJ3N5c3RlbSddLmluY2x1ZGVzKHByZWZzLm1vZGUpID8gcHJlZnMubW9kZSA6ICdkYXJrJztcbiAgICBpZiAobW9kZSA9PT0gJ3N5c3RlbScpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1vZGUgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCknKS5tYXRjaGVzID8gJ2xpZ2h0JyA6ICdkYXJrJztcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgbW9kZSA9ICdkYXJrJztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBOS19QQUxFVFRFU1t0aGVtZSArICctJyArIG1vZGVdIHx8IE5LX1BBTEVUVEVTWydjb25zb2xlLWRhcmsnXSxcbiAgICAgICAgcmVkdWNlTW90aW9uOiBwcmVmcy5yZWR1Y2VNb3Rpb24gPT09IHRydWUsXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TmtMb29rKCkge1xuICAgIGlmICghbmtMb29rUHJvbWlzZSkgbmtMb29rUHJvbWlzZSA9IHJlYWROa0xvb2soKTtcbiAgICByZXR1cm4gbmtMb29rUHJvbWlzZTtcbn1cblxuLy8gUmUtcmVzb2x2ZSBvbiBwcmVmIGNoYW5nZXMgKEFwcGVhcmFuY2UgZWRpdGVkIGluIGFub3RoZXIgc3VyZmFjZSkuXG50cnkge1xuICAgIGFwaS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcigoY2hhbmdlcywgYXJlYSkgPT4ge1xuICAgICAgICBpZiAoKGFyZWEgPT09ICdzeW5jJyB8fCBhcmVhID09PSAnbG9jYWwnKSAmJiBjaGFuZ2VzLmExMXlfcHJlZnMpIG5rTG9va1Byb21pc2UgPSBudWxsO1xuICAgIH0pO1xufSBjYXRjaCAoXykgeyAvKiBvbkNoYW5nZWQgdW5hdmFpbGFibGUgXHUyMDE0IGNhY2hlIHNpbXBseSBwZXJzaXN0cyAqLyB9XG5cbi8vIFx1MjUwMFx1MjUwMCBJbmplY3RlZC1zdXJmYWNlIGlzb2xhdGlvbiAoY2xpY2tqYWNraW5nIC8gVUktcmVkcmVzcyBkZWZlbnNlKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8vIEV2ZXJ5IGluamVjdGVkIG92ZXJsYXkgKGxvY2tlZCBzaGVldCwgcGVybWlzc2lvbiBjb25zZW50IHNoZWV0LCBGQUIpIG1vdW50c1xuLy8gaW5zaWRlIGEgQ0xPU0VEIHNoYWRvdyByb290IG9uIGEgaGFyZGVuZWQgaG9zdC4gVHdvIHRoaW5ncyB0aGlzIGJ1eXMgdXM6XG4vLyAgIDEuIFBhZ2UgQ1NTIHNlbGVjdG9ycyBjYW5ub3QgcmVhY2ggdGhlIGludGVybmFsIG5vZGVzIChubyByZXN0eWxpbmcgdGhlXG4vLyAgICAgIGNvbnNlbnQgaWZyYW1lIFx1MjAxNCBlLmcuIHRoZSBjbGFzc2ljIG9wYWNpdHk6LjAyIWltcG9ydGFudCByZWRyZXNzIGF0dGFjaykuXG4vLyAgIDIuIFRoZSBob3N0IGxpdmVzIGluIHRoZSBwYWdlJ3MgbGlnaHQgRE9NLiBQaW5uaW5nIHRoZSBob3N0J3MgT1dOXG4vLyAgICAgIGNvbXBvc2l0aW5nIHByb3BlcnRpZXMgaW5saW5lIHdpdGggIWltcG9ydGFudCBiZWF0cyBhbnkgYXV0aG9yIHN0eWxlc2hlZXRcbi8vICAgICAgIWltcG9ydGFudCwgc28gdGhlIHBhZ2UgY2Fubm90IHJlc3R5bGUgdGhlIGhvc3QgaXRzZWxmIHRyYW5zcGFyZW50IC9cbi8vICAgICAgdHJhbnNmb3JtZWQgLyBmaWx0ZXJlZC5cbi8vIExJTUlUUyBcdTIwMTQgcmVhZCBiZWZvcmUgdHJ1c3RpbmcgdGhpcyBhcyBhbnRpLWNsaWNramFja2luZyAoaXQgaXMgTk9UIHN1ZmZpY2llbnQpOlxuLy8gICBcdTIwMjIgSW5saW5lIHBpbnMgb25seSBnb3Zlcm4gdGhlIGhvc3QncyBvd24gYm94LiBUaGV5IGRvIE5PVCBkZWZlbmQgYWdhaW5zdCBhblxuLy8gICAgIEFOQ0VTVE9SIGVmZmVjdDogYmVjYXVzZSB0aGUgcGFnZSBoYXMgRE9NIHdyaXRlIGFjY2VzcyB0byBkb2N1bWVudC5ib2R5LFxuLy8gICAgIGl0IGNhbiB3cmFwIG9yIHJlLXBhcmVudCBvdXIgaG9zdCB1bmRlciBhbiBhdHRhY2tlciBlbGVtZW50IHdpdGhcbi8vICAgICBvcGFjaXR5PDEgLyBmaWx0ZXIgLyB0cmFuc2Zvcm0uIEdyb3VwL2NvbXBvc2l0aW5nIGVmZmVjdHMgYXBwbHkgdG8gdGhlXG4vLyAgICAgd2hvbGUgc3VidHJlZSBhbmQgYSBkZXNjZW5kYW50IGNhbm5vdCBvcHQgb3V0IFx1MjAxNCBzbyB0aGUgaG9zdCBjYW4gc3RpbGwgYmVcbi8vICAgICByZW5kZXJlZCB+dHJhbnNwYXJlbnQtYnV0LWNsaWNrYWJsZSBhbmQgYSBjbGljayBsdXJlZCBvbnRvIHRoZSByZWFsIEFsbG93LlxuLy8gICBcdTIwMjIgQSBwYWdlIGNhbiBhbHNvIHBhaW50IGl0cyBPV04gZGVjb3kgYXQgdGhlIHNhbWUgbWF4IHotaW5kZXggb3ZlciB0aGUgc2hlZXQuXG4vLyBJbi1wYWdlIGNvbnNlbnQgZW1iZWRkZWQgYnkgYW4gdW50cnVzdGVkIHBhZ2UgaXMgSU5IRVJFTlRMWSByZWRyZXNzLWV4cG9zZWQ7XG4vLyBvbmx5IHRoZSB0YWIgZmFsbGJhY2sgKGNocm9tZTovLywgUERGLCBidW5rZXIpIGlzIGZ1bGx5IHJlZHJlc3MtaW1tdW5lLiBUaGVcbi8vIHNoYWRvdyByb290ICsgaG9zdCBwaW5zIGNsb3NlIHRoZSB0cml2aWFsIHBhZ2UtQ1NTIHJlc3R5bGUsIG5vdCByZS1wYXJlbnRpbmcuXG4vLyBUMC0xIHN0aWxsIGhvbGRzIHJlZ2FyZGxlc3MgXHUyMDE0IHRoZSBBbGxvdyB2ZXJiIG5ldmVyIGxpdmVzIGluIHBhZ2UgRE9NLCBzbyB0aGlzXG4vLyBpcyBhIGRlZmVhdC10aGUtaHVtYW4gcmlzaywgbm90IGEgZm9yZ2UtY29uc2VudC13aXRob3V0LWEtY2xpY2sgb25lLlxuZnVuY3Rpb24gbW91bnRTaGFkb3dIb3N0KCkge1xuICAgIGNvbnN0IGhvc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBwaW4gPSAocHJvcCwgdmFsKSA9PiBob3N0LnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbCwgJ2ltcG9ydGFudCcpO1xuICAgIHBpbignYWxsJywgJ2luaXRpYWwnKTtcbiAgICBwaW4oJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XG4gICAgcGluKCd0b3AnLCAnMCcpO1xuICAgIHBpbignbGVmdCcsICcwJyk7XG4gICAgcGluKCd3aWR0aCcsICcwJyk7XG4gICAgcGluKCdoZWlnaHQnLCAnMCcpO1xuICAgIHBpbignei1pbmRleCcsICcyMTQ3NDgzNjQ3Jyk7XG4gICAgcGluKCdvcGFjaXR5JywgJzEnKTtcbiAgICBwaW4oJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgIHBpbignZGlzcGxheScsICdibG9jaycpO1xuICAgIHBpbigndHJhbnNmb3JtJywgJ25vbmUnKTtcbiAgICBwaW4oJ2ZpbHRlcicsICdub25lJyk7XG4gICAgcGluKCdtaXgtYmxlbmQtbW9kZScsICdub3JtYWwnKTtcbiAgICBwaW4oJ3BvaW50ZXItZXZlbnRzJywgJ2F1dG8nKTtcbiAgICBjb25zdCByb290ID0gaG9zdC5hdHRhY2hTaGFkb3coeyBtb2RlOiAnY2xvc2VkJyB9KTtcbiAgICAvLyBNb3VudCBvbiA8aHRtbD4sIG5vdCA8Ym9keT46IHRoaXMgbWFrZXMgPGh0bWw+IHRoZSBPTkxZIGFuY2VzdG9yLCBzaHJpbmtpbmdcbiAgICAvLyB0aGUgc3VyZmFjZSBmb3IgYW4gYW5jZXN0b3IgZ3JvdXAtZWZmZWN0IChvcGFjaXR5L2ZpbHRlci90cmFuc2Zvcm0pIHJlZHJlc3NcbiAgICAvLyB0byBhIHNpbmdsZSBlbGVtZW50IHRoZSBzaGVldCBndWFyZCB3YXRjaGVzLlxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChob3N0KTtcbiAgICByZXR1cm4geyBob3N0LCByb290IH07XG59XG5cbi8vIExvY2tlZCBub3RpZmljYXRpb24gc2hlZXQgXHUyMDE0IHNob3duIHdoZW4gYSBzaXRlIG5lZWRzIHRoZSBwcml2YXRlIGtleVxuLy8gYnV0IHRoZSBleHRlbnNpb24gaXMgbG9ja2VkLiBTaG93cyBldmVyeSB0aW1lIHVudGlsIHVubG9ja2VkLlxubGV0IGxvY2tlZFNoZWV0SG9zdCA9IG51bGw7XG5sZXQgbG9ja2VkU2hlZXRFbCA9IG51bGw7XG5sZXQgbG9ja2VkU2hlZXRUaW1lciA9IG51bGw7XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3dMb2NrZWRTaGVldChmaXJzdFVubG9jaykge1xuICAgIC8vIElmIGFscmVhZHkgdmlzaWJsZSwgcmVzZXQgdGhlIGF1dG8tZGlzbWlzcyB0aW1lclxuICAgIGlmIChsb2NrZWRTaGVldEVsICYmIGxvY2tlZFNoZWV0RWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgICBpZiAobG9ja2VkU2hlZXRUaW1lcikgY2xlYXJUaW1lb3V0KGxvY2tlZFNoZWV0VGltZXIpO1xuICAgICAgICBsb2NrZWRTaGVldFRpbWVyID0gc2V0VGltZW91dChkaXNtaXNzTG9ja2VkU2hlZXQsIDUwMDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBwLCByZWR1Y2VNb3Rpb24gfSA9IGF3YWl0IGdldE5rTG9vaygpO1xuXG4gICAgLy8gUmVtb3ZlIGFueSBzdGFsZSBzaGVldCAoaW5jbHVkaW5nIG9uZSBjcmVhdGVkIHdoaWxlIHdlIGF3YWl0ZWQpXG4gICAgaWYgKGxvY2tlZFNoZWV0SG9zdCkgbG9ja2VkU2hlZXRIb3N0LnJlbW92ZSgpO1xuXG4gICAgY29uc3QgeyBob3N0LCByb290IH0gPSBtb3VudFNoYWRvd0hvc3QoKTtcbiAgICBjb25zdCBzaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHNoZWV0LmlkID0gJ25vc3Rya2V5LWxvY2tlZC1zaGVldCc7XG4gICAgc2hlZXQuaW5uZXJIVE1MID0gYFxuICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgICAgICAgICAgei1pbmRleDogMjE0NzQ4MzY0NztcbiAgICAgICAgICAgICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7XG4gICAgICAgICAgICAgICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGluc2V0OiAwO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsMC41KTtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgMC4ycyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldC5hY3RpdmUgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstc2hlZXQge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3AucGFuZWx9O1xuICAgICAgICAgICAgICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCAke3AuaGFpcn07XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTZweCAxNnB4IDAgMDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAyNHB4O1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgLTRweCAyMHB4IHJnYmEoMCwwLDAsMC4zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQuYWN0aXZlIC5uay1zaGVldCB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstaGFuZGxlIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogNDBweDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDRweDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3AuaGFpcn07XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgICAgICAgICAgICAgIG1hcmdpbjogMCBhdXRvIDE2cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1pY29uIHtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDMycHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDEycHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay10aXRsZSB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICR7cC50ZXh0fTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE4cHg7XG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstdGV4dCB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICR7cC50ZXh0fTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxLjU7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogNHB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstbXV0ZWQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AubXV0ZWR9O1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1idG4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDE0cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICR7cC5zaWduYWx9O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICR7cC5zaWduYWxEaW19O1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3Auc2lnbmFsfTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICAgICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgICAgICAgICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMTVzIGVhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1idG46aG92ZXIge1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICR7cC5zaWduYWxEaW19O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHtyZWR1Y2VNb3Rpb24gPyBgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYmFja2Ryb3AsXG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1zaGVldCB7IHRyYW5zaXRpb246IG5vbmU7IH1gIDogJyd9XG4gICAgICAgICAgICBAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAgICAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJhY2tkcm9wLFxuICAgICAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXNoZWV0IHsgdHJhbnNpdGlvbjogbm9uZTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXNoZWV0XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstaGFuZGxlXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstaWNvblwiPiYjeDFGNTEyOzwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRpdGxlXCI+JHtmaXJzdFVubG9jayA/ICdOb3N0cktleSBOZWVkcyB0byBEZWNyeXB0IFlvdXIgS2V5cycgOiAnTm9zdHJLZXkgaXMgTG9ja2VkJ308L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10ZXh0XCI+JHtmaXJzdFVubG9ja1xuICAgICAgICAgICAgICAgID8gJ1RoaXMgc2l0ZSBpcyByZXF1ZXN0aW5nIHlvdXIgTm9zdHIgaWRlbnRpdHkuIEVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkIHRvIGRlY3J5cHQgeW91ciBrZXkgdmF1bHQgZm9yIHRoaXMgc2Vzc2lvbi4nXG4gICAgICAgICAgICAgICAgOiAnVGhpcyBzaXRlIG5lZWRzIHlvdXIga2V5IHRvIHNpZ24gb3IgZW5jcnlwdC4nfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLW11dGVkXCI+Q2xpY2sgdGhlIE5vc3RyS2V5IGljb24gaW4geW91ciB0b29sYmFyIGFuZCBlbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZC48L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJuay1idG5cIj5Hb3QgaXQ8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgYDtcbiAgICByb290LmFwcGVuZENoaWxkKHNoZWV0KTtcbiAgICBsb2NrZWRTaGVldEhvc3QgPSBob3N0O1xuICAgIGxvY2tlZFNoZWV0RWwgPSBzaGVldDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gc2hlZXQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJykpO1xuXG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzc0xvY2tlZFNoZWV0KTtcbiAgICBzaGVldC5xdWVyeVNlbGVjdG9yKCcubmstYmFja2Ryb3AnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3NMb2NrZWRTaGVldCk7XG5cbiAgICAvLyBBdXRvLWRpc21pc3MgYWZ0ZXIgNSBzZWNvbmRzXG4gICAgbG9ja2VkU2hlZXRUaW1lciA9IHNldFRpbWVvdXQoZGlzbWlzc0xvY2tlZFNoZWV0LCA1MDAwKTtcbn1cblxuZnVuY3Rpb24gZGlzbWlzc0xvY2tlZFNoZWV0KCkge1xuICAgIGlmIChsb2NrZWRTaGVldFRpbWVyKSB7IGNsZWFyVGltZW91dChsb2NrZWRTaGVldFRpbWVyKTsgbG9ja2VkU2hlZXRUaW1lciA9IG51bGw7IH1cbiAgICBpZiAoIWxvY2tlZFNoZWV0RWwpIHJldHVybjtcbiAgICBsb2NrZWRTaGVldEVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIGNvbnN0IGhvc3QgPSBsb2NrZWRTaGVldEhvc3Q7XG4gICAgbG9ja2VkU2hlZXRFbCA9IG51bGw7XG4gICAgbG9ja2VkU2hlZXRIb3N0ID0gbnVsbDtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGhvc3QgJiYgaG9zdC5yZW1vdmUoKSwgMzAwKTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwIFBlcm1pc3Npb24gY29uc2VudCBzaGVldCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8vIFRoZSBBbGxvdy9EZW55IFVJIGlzIGFuIEVYVEVOU0lPTi1PV05FRCBpZnJhbWUgKHBlcm1pc3Npb24vcGVybWlzc2lvbi5odG1sKVxuLy8gaW5qZWN0ZWQgYXMgYSBkaW1tZWQgYm90dG9tIHNoZWV0LCBzbyB0aGUgdXNlciBrZWVwcyB0aGUgc2l0ZSBpbiB2aWV3IGZvclxuLy8gaW5mb3JtZWQgY29uc2VudC4gQmVjYXVzZSB0aGUgaWZyYW1lIGlzIGEgY3Jvc3Mtb3JpZ2luIGV4dGVuc2lvbiBwYWdlLCB0aGVcbi8vIHdlYiBwYWdlIENBTk5PVCBzY3JpcHQgaW50byBpdCBvciBjbGljayBBbGxvdyBcdTIwMTQgdGhlIFQwLTEgcHJvdGVjdGlvbiBob2xkcy5cbi8vIFRoZSBiYWNrZHJvcCBhbmQgdGhlIG1pbmltaXplZCBGQUIgKHRoaXMgZmlsZSwgcGFnZSBET00pIGNhcnJ5IE5PIGNvbnNlbnRcbi8vIGFjdGlvbjsgdGhleSBvbmx5IHNob3cvaGlkZSB0aGUgc2hlZXQsIHNvIHRoZXkgYXJlIHNhZmUgdG8gbGl2ZSBpbiB0aGUgcGFnZS5cbmxldCBwZXJtU2hlZXRIb3N0ID0gbnVsbDtcbmxldCBwZXJtU2hlZXRFbCA9IG51bGw7XG5sZXQgcGVybUZhYkhvc3QgPSBudWxsO1xubGV0IHBlcm1GYWJFbCA9IG51bGw7XG5sZXQgcGVybVNoZWV0U3JjID0gbnVsbDtcblxuLy8gR2VuZXJhdGlvbiBjb3VudGVyIGd1YXJkaW5nIHRoZSBhc3luYyBnYXAgaW4gc2hvd1Blcm1pc3Npb25TaGVldCAvXG4vLyBzaG93UGVybWlzc2lvbkZhYjogYSBjbG9zZVBlcm1pc3Npb25TaGVldCAob3IgYSBuZXdlciBzaG93KSBhcnJpdmluZyB3aGlsZVxuLy8gdGhlIGFwcGVhcmFuY2UgcmVhZCBpcyBpbiBmbGlnaHQgYnVtcHMgdGhlIGNvdW50ZXIsIHNvIHRoZSBzdGFsZSBjYWxsIGJhaWxzXG4vLyBpbnN0ZWFkIG9mIHJlc3VycmVjdGluZyBhIHNoZWV0IHRoZSBiYWNrZ3JvdW5kIGFscmVhZHkgY2xvc2VkLlxubGV0IG5rUGVybUdlbiA9IDA7XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3dQZXJtaXNzaW9uU2hlZXQoc3JjKSB7XG4gICAgcGVybVNoZWV0U3JjID0gc3JjO1xuICAgIGNvbnN0IGdlbiA9ICsrbmtQZXJtR2VuO1xuICAgIGNvbnN0IHsgcCwgcmVkdWNlTW90aW9uIH0gPSBhd2FpdCBnZXROa0xvb2soKTtcbiAgICBpZiAoZ2VuICE9PSBua1Blcm1HZW4pIHJldHVybjsgLy8gc3VwZXJzZWRlZCB3aGlsZSB3ZSBhd2FpdGVkXG4gICAgcmVtb3ZlUGVybWlzc2lvbkZhYigpO1xuICAgIGlmIChwZXJtU2hlZXRIb3N0KSBwZXJtU2hlZXRIb3N0LnJlbW92ZSgpO1xuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbC5pZCA9ICdub3N0cmtleS1wZXJtLXNoZWV0JztcbiAgICBlbC5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IHsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgei1pbmRleDogMjE0NzQ4MzY0NzsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7IGluc2V0OiAwOyBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuNSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDske3JlZHVjZU1vdGlvbiA/ICcnIDogJyB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycyBlYXNlOyd9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldC5hY3RpdmUgLm5rLWJhY2tkcm9wIHsgb3BhY2l0eTogMTsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWZyYW1lLXdyYXAge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDsgbGVmdDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBtYXgtd2lkdGg6IDQ2MHB4OyBtYXJnaW46IDAgYXV0bztcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTAwJSk7JHtyZWR1Y2VNb3Rpb24gPyAnJyA6ICcgdHJhbnNpdGlvbjogdHJhbnNmb3JtIC4zcyBlYXNlOyd9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldC5hY3RpdmUgLm5rLWZyYW1lLXdyYXAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IGlmcmFtZSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDcydmg7IG1heC1oZWlnaHQ6IDY0MHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogMDsgYm9yZGVyLXJhZGl1czogMTZweCAxNnB4IDAgMDtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIC02cHggMjhweCByZ2JhKDAsMCwwLC40NSk7IGJhY2tncm91bmQ6ICR7cC5iYXNlfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWJhY2tkcm9wLFxuICAgICAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IC5uay1mcmFtZS13cmFwIHsgdHJhbnNpdGlvbjogbm9uZTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWZyYW1lLXdyYXBcIj48aWZyYW1lIHRpdGxlPVwiTm9zdHJLZXkgcGVybWlzc2lvbiByZXF1ZXN0XCI+PC9pZnJhbWU+PC9kaXY+XG4gICAgYDtcbiAgICBlbC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKS5zcmMgPSBzcmM7IC8vIHNldCB2aWEgcHJvcGVydHksIG5vdCBIVE1MIGludGVycG9sYXRpb25cbiAgICByb290LmFwcGVuZENoaWxkKGVsKTtcbiAgICBwZXJtU2hlZXRIb3N0ID0gaG9zdDtcbiAgICBwZXJtU2hlZXRFbCA9IGVsO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKSk7XG4gICAgLy8gQmFja2Ryb3AgY2xpY2sgTUlOSU1JU0VTIChyZXF1ZXN0IHN0YXlzIHBlbmRpbmcpIHJhdGhlciB0aGFuIGRpc21pc3NpbmcuXG4gICAgZWwucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBtaW5pbWl6ZVBlcm1pc3Npb25TaGVldCk7XG4gICAgLy8gRmFpbC1jbG9zZWQgcmVkcmVzcyBndWFyZDogdGhpcyBpcyB0aGUgYWN0dWFsIGNvbnNlbnQgc3VyZmFjZSwgc28gaWYgdGhlIHBhZ2VcbiAgICAvLyByZS1wYXJlbnRzIG9yIHZpc3VhbGx5IHN1cHByZXNzZXMgaXQgd2UgdGVhciBpdCBkb3duIChubyBjbGljayBjYW4gbGFuZCBvbiBhXG4gICAgLy8gaGlkZGVuIEFwcHJvdmUpIGFuZCBlc2NhbGF0ZSB0aGUgU0FNRSBwZW5kaW5nIHJlcXVlc3QgdG8gYSByZWRyZXNzLWltbXVuZSB0YWIuXG4gICAgc3RhcnRTaGVldEd1YXJkKCk7XG59XG5cbmZ1bmN0aW9uIG1pbmltaXplUGVybWlzc2lvblNoZWV0KCkge1xuICAgIGlmICghcGVybVNoZWV0SG9zdCkgcmV0dXJuO1xuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgcGVybVNoZWV0SG9zdC5yZW1vdmUoKTtcbiAgICBwZXJtU2hlZXRIb3N0ID0gbnVsbDtcbiAgICBwZXJtU2hlZXRFbCA9IG51bGw7XG4gICAgc2hvd1Blcm1pc3Npb25GYWIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2hvd1Blcm1pc3Npb25GYWIoKSB7XG4gICAgaWYgKHBlcm1GYWJFbCB8fCAhcGVybVNoZWV0U3JjKSByZXR1cm47XG4gICAgY29uc3QgZ2VuID0gKytua1Blcm1HZW47XG4gICAgY29uc3QgeyBwLCByZWR1Y2VNb3Rpb24gfSA9IGF3YWl0IGdldE5rTG9vaygpO1xuICAgIGlmIChnZW4gIT09IG5rUGVybUdlbikgcmV0dXJuOyAvLyBzdXBlcnNlZGVkIHdoaWxlIHdlIGF3YWl0ZWRcbiAgICBpZiAocGVybUZhYkVsIHx8ICFwZXJtU2hlZXRTcmMpIHJldHVybjtcbiAgICBjb25zdCB7IGhvc3QsIHJvb3QgfSA9IG1vdW50U2hhZG93SG9zdCgpO1xuICAgIGNvbnN0IGZhYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZhYi5pZCA9ICdub3N0cmtleS1wZXJtLWZhYic7XG4gICAgZmFiLmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIHsgcG9zaXRpb246IGZpeGVkOyByaWdodDogMTZweDsgYm90dG9tOiAxNnB4OyB6LWluZGV4OiAyMTQ3NDgzNjQ3O1xuICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIC5uay1mYWIge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDsgcGFkZGluZzogMTJweCAxNnB4O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlcjogMXB4IHNvbGlkICR7cC5zaWduYWx9O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICR7cC5wYW5lbH07IGNvbG9yOiAke3AudGV4dH07IGZvbnQtc2l6ZTogMTRweDsgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIDRweCAxOHB4IHJnYmEoMCwwLDAsLjQpOyR7cmVkdWNlTW90aW9uID8gJycgOiAnIGFuaW1hdGlvbjogbmstZmFiLXB1bHNlIDJzIGVhc2UtaW4tb3V0IGluZmluaXRlOyd9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWRvdCB7IHdpZHRoOiA4cHg7IGhlaWdodDogOHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6ICR7cC5zaWduYWx9OyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWZhYi1jZCB7IGZvbnQtdmFyaWFudC1udW1lcmljOiB0YWJ1bGFyLW51bXM7IGNvbG9yOiAke3AubXV0ZWR9OyBmb250LXdlaWdodDogNjAwOyB9XG4gICAgICAgICAgICBAa2V5ZnJhbWVzIG5rLWZhYi1wdWxzZSB7IDAlLDEwMCV7IGJveC1zaGFkb3c6IDAgNHB4IDE4cHggcmdiYSgwLDAsMCwuNCk7fSA1MCV7IGJveC1zaGFkb3c6IDAgNHB4IDI0cHggJHtwLnNpZ25hbERpbX07fSB9XG4gICAgICAgICAgICBAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAgICAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZmFiIHsgYW5pbWF0aW9uOiBub25lOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJuay1mYWJcIiB0eXBlPVwiYnV0dG9uXCI+PHNwYW4gY2xhc3M9XCJuay1kb3RcIj48L3NwYW4+UmV2aWV3IHNpZ25pbmcgcmVxdWVzdDxzcGFuIGNsYXNzPVwibmstZmFiLWNkXCI+PC9zcGFuPjwvYnV0dG9uPlxuICAgIGA7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChmYWIpO1xuICAgIHBlcm1GYWJIb3N0ID0gaG9zdDtcbiAgICBwZXJtRmFiRWwgPSBmYWI7XG4gICAgZmFiLnF1ZXJ5U2VsZWN0b3IoJy5uay1mYWInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNob3dQZXJtaXNzaW9uU2hlZXQocGVybVNoZWV0U3JjKSk7XG4gICAgc3RhcnRGYWJDb3VudGRvd24oZmFiLnF1ZXJ5U2VsZWN0b3IoJy5uay1mYWItY2QnKSk7XG59XG5cbi8vIEEgbWluaW1pemVkIHJlcXVlc3Qga2VlcHMgY291bnRpbmcgZG93bjsgc3VyZmFjZSB0aGUgcmVtYWluaW5nIHRpbWUgb24gdGhlIEZBQlxuLy8gc28gaXQgZG9lc24ndCBzaWxlbnRseSBleHBpcmUgd2hpbGUgdHVja2VkIGF3YXkuIERlYWRsaW5lIGlzIHJlYWQgZnJvbSB0aGVcbi8vIHBlbmRpbmcgc2hlZXQgVVJMIHRoYXQgYmFja2dyb3VuZCBzdGFtcGVkICg/ZGVhZGxpbmU9KS5cbmxldCBwZXJtRmFiVGltZXIgPSBudWxsO1xuZnVuY3Rpb24gc3RhcnRGYWJDb3VudGRvd24oY2RFbCkge1xuICAgIHN0b3BGYWJDb3VudGRvd24oKTtcbiAgICBsZXQgZGVhZGxpbmUgPSAwO1xuICAgIHRyeSB7IGRlYWRsaW5lID0gTnVtYmVyKG5ldyBVUkwocGVybVNoZWV0U3JjKS5zZWFyY2hQYXJhbXMuZ2V0KCdkZWFkbGluZScpKSB8fCAwOyB9IGNhdGNoIChfKSB7IC8qIG5vLW9wICovIH1cbiAgICBpZiAoIWRlYWRsaW5lIHx8ICFjZEVsKSByZXR1cm47XG4gICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gZGVhZGxpbmUgLSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAocmVtYWluaW5nIDw9IDApIHsgY2RFbC50ZXh0Q29udGVudCA9ICdcdTAwQjcgZXhwaXJlZCc7IHN0b3BGYWJDb3VudGRvd24oKTsgcmV0dXJuOyB9XG4gICAgICAgIGNkRWwudGV4dENvbnRlbnQgPSBgXHUwMEI3ICR7TWF0aC5jZWlsKHJlbWFpbmluZyAvIDEwMDApfXNgO1xuICAgIH07XG4gICAgdGljaygpO1xuICAgIHBlcm1GYWJUaW1lciA9IHNldEludGVydmFsKHRpY2ssIDI1MCk7XG59XG5mdW5jdGlvbiBzdG9wRmFiQ291bnRkb3duKCkge1xuICAgIGlmIChwZXJtRmFiVGltZXIpIHsgY2xlYXJJbnRlcnZhbChwZXJtRmFiVGltZXIpOyBwZXJtRmFiVGltZXIgPSBudWxsOyB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVBlcm1pc3Npb25GYWIoKSB7XG4gICAgc3RvcEZhYkNvdW50ZG93bigpO1xuICAgIGlmIChwZXJtRmFiSG9zdCkgeyBwZXJtRmFiSG9zdC5yZW1vdmUoKTsgcGVybUZhYkhvc3QgPSBudWxsOyB9XG4gICAgcGVybUZhYkVsID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlUGVybWlzc2lvblVJKCkge1xuICAgIG5rUGVybUdlbisrOyAvLyBpbnZhbGlkYXRlIGFueSBzaG93KiBzdGlsbCBhd2FpdGluZyBpdHMgYXBwZWFyYW5jZSByZWFkXG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICBpZiAocGVybVNoZWV0SG9zdCkgeyBwZXJtU2hlZXRIb3N0LnJlbW92ZSgpOyBwZXJtU2hlZXRIb3N0ID0gbnVsbDsgcGVybVNoZWV0RWwgPSBudWxsOyB9XG4gICAgcmVtb3ZlUGVybWlzc2lvbkZhYigpO1xuICAgIHBlcm1TaGVldFNyYyA9IG51bGw7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBTaGVldCByZWRyZXNzIGd1YXJkIChmYWlsLWNsb3NlZCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgY29uc2VudCBpZnJhbWUgbGl2ZXMgaW4gcGFnZSBsaWdodCBET00sIHNvIGEgcGFnZSB3aXRoIERPTS13cml0ZSBhY2Nlc3MgY2FuXG4vLyBzdGlsbCByZS1wYXJlbnQgb3VyIGhvc3QgdW5kZXIgYSB0cmFuc3BhcmVudCBncm91cCAob3BhY2l0eS9maWx0ZXIpIG9yIG90aGVyd2lzZVxuLy8gc3VwcHJlc3MgaXQgd2hpbGUga2VlcGluZyBpdCBjbGlja2FibGUgXHUyMDE0IGx1cmluZyBhIGNsaWNrIG9udG8gdGhlIHJlYWwgQXBwcm92ZS5cbi8vIFRoZSBpbmxpbmUgaG9zdCBwaW5zIGNhbm5vdCBvcHQgYSBzdWJ0cmVlIG91dCBvZiBhbiBBTkNFU1RPUiBncm91cCBlZmZlY3QuIFNvIHdlXG4vLyBhY3RpdmVseSB3YXRjaDogaWYgdGhlIHN1cmZhY2Ugc3RvcHMgYmVpbmcgZnVsbHkgdmlzaWJsZSAvIGNvcnJlY3RseSBwYXJlbnRlZCxcbi8vIHdlIGRlc3Ryb3kgaXQgKG5vdGhpbmcgbGVmdCB0byBtaXMtY2xpY2spIGFuZCBoYW5kIHRoZSByZXF1ZXN0IHRvIHRoZSB0YWIsIHdoaWNoXG4vLyB0aGUgcGFnZSBjYW5ub3Qgc3R5bGUgYXQgYWxsLlxubGV0IHNoZWV0R3VhcmRPYnNlcnZlciA9IG51bGw7XG5sZXQgc2hlZXRHdWFyZFRpbWVyID0gbnVsbDtcblxuZnVuY3Rpb24gc3R5bGVTdXBwcmVzc2VzKGNzKSB7XG4gICAgaWYgKCFjcykgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoY3Mub3BhY2l0eSkgPCAwLjlcbiAgICAgICAgfHwgY3MudmlzaWJpbGl0eSAhPT0gJ3Zpc2libGUnXG4gICAgICAgIHx8IGNzLmRpc3BsYXkgPT09ICdub25lJ1xuICAgICAgICB8fCBjcy5wb2ludGVyRXZlbnRzID09PSAnbm9uZSdcbiAgICAgICAgfHwgY3MuZmlsdGVyICE9PSAnbm9uZSdcbiAgICAgICAgfHwgY3MudHJhbnNmb3JtICE9PSAnbm9uZSdcbiAgICAgICAgfHwgY3MubWl4QmxlbmRNb2RlICE9PSAnbm9ybWFsJ1xuICAgICAgICB8fCBjcy5jbGlwUGF0aCAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLnBlcnNwZWN0aXZlICE9PSAnbm9uZSdcbiAgICAgICAgfHwgY3MuY29udGVudFZpc2liaWxpdHkgPT09ICdoaWRkZW4nXG4gICAgICAgIHx8IChjcy5tYXNrICYmIGNzLm1hc2sgIT09ICdub25lJylcbiAgICAgICAgfHwgKGNzLndlYmtpdE1hc2sgJiYgY3Mud2Via2l0TWFzayAhPT0gJ25vbmUnKVxuICAgICAgICB8fCAoY3MuYmFja2Ryb3BGaWx0ZXIgJiYgY3MuYmFja2Ryb3BGaWx0ZXIgIT09ICdub25lJyk7XG59XG5cbmZ1bmN0aW9uIHNoZWV0TG9va3NDb21wcm9taXNlZCgpIHtcbiAgICBjb25zdCBob3N0ID0gcGVybVNoZWV0SG9zdDtcbiAgICBpZiAoIWhvc3QgfHwgIWhvc3QuaXNDb25uZWN0ZWQpIHJldHVybiB0cnVlO1xuICAgIGlmIChob3N0LnBhcmVudE5vZGUgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgcmV0dXJuIHRydWU7IC8vIHJlLXBhcmVudGVkXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHN0eWxlU3VwcHJlc3NlcyhnZXRDb21wdXRlZFN0eWxlKGhvc3QpKSkgcmV0dXJuIHRydWU7ICAgICAgIC8vIGhvc3QgYm94XG4gICAgICAgIGlmIChzdHlsZVN1cHByZXNzZXMoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpKSkgcmV0dXJuIHRydWU7IC8vIHNvbGUgYW5jZXN0b3JcbiAgICAgICAgY29uc3QgaWZyYW1lID0gcGVybVNoZWV0RWwgJiYgcGVybVNoZWV0RWwucXVlcnlTZWxlY3RvcignaWZyYW1lJyk7XG4gICAgICAgIGlmICghaWZyYW1lKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgY29uc3QgaWZjcyA9IGdldENvbXB1dGVkU3R5bGUoaWZyYW1lKTtcbiAgICAgICAgaWYgKHBhcnNlRmxvYXQoaWZjcy5vcGFjaXR5KSA8IDAuOSB8fCBpZmNzLnZpc2liaWxpdHkgIT09ICd2aXNpYmxlJykgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gaWYgd2UgY2FuJ3QgdmVyaWZ5LCBmYWlsIGNsb3NlZFxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9uU2hlZXRDb21wcm9taXNlZCgpIHtcbiAgICBzdG9wU2hlZXRHdWFyZCgpO1xuICAgIHJlbW92ZVBlcm1pc3Npb25VSSgpOyAvLyBkZXN0cm95IHRoZSBpbi1wYWdlIHN1cmZhY2UgXHUyMDE0IG5vIGhpZGRlbiBBcHByb3ZlIHRvIGNsaWNrXG4gICAgLy8gQXNrIHRoZSBiYWNrZ3JvdW5kIHRvIHJlb3BlbiB0aGUgU0FNRSBwZW5kaW5nIHByb21wdCBhcyBhIGRlZGljYXRlZCB0YWIuXG4gICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncGVybWlzc2lvblNoZWV0Q29tcHJvbWlzZWQnIH0pLmNhdGNoKCgpID0+IHt9KTtcbn1cblxuZnVuY3Rpb24gc3RhcnRTaGVldEd1YXJkKCkge1xuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgc2hlZXRHdWFyZE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNoZWV0TG9va3NDb21wcm9taXNlZCgpKSBvblNoZWV0Q29tcHJvbWlzZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGNoaWxkTGlzdC9zdWJ0cmVlIGNhdGNoZXMgcmUtcGFyZW50aW5nOyBzdHlsZS9jbGFzcyBhdHRycyBjYXRjaCBhIHBhZ2VcbiAgICAgICAgLy8gZHJvcHBpbmcgYSBmaWx0ZXIvb3BhY2l0eSBvbnRvIDxodG1sPiBvciB3cmFwcGluZyBvdXIgaG9zdC5cbiAgICAgICAgc2hlZXRHdWFyZE9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ3N0eWxlJywgJ2NsYXNzJ10sXG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChfKSB7IC8qIG9ic2VydmVyIHVuYXZhaWxhYmxlIFx1MjAxNCBwb2xsIHN0aWxsIGNvdmVycyB1cyAqLyB9XG4gICAgLy8gQmFja3N0b3AgZm9yIGVmZmVjdHMgYSBtdXRhdGlvbiBjYW4ndCBzdXJmYWNlIChzdHlsZXNoZWV0IHN3YXBzLCA6aG92ZXIgcnVsZXMpLlxuICAgIHNoZWV0R3VhcmRUaW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHNoZWV0TG9va3NDb21wcm9taXNlZCgpKSBvblNoZWV0Q29tcHJvbWlzZWQoKTtcbiAgICB9LCAyMDApO1xufVxuXG5mdW5jdGlvbiBzdG9wU2hlZXRHdWFyZCgpIHtcbiAgICBpZiAoc2hlZXRHdWFyZE9ic2VydmVyKSB7IHNoZWV0R3VhcmRPYnNlcnZlci5kaXNjb25uZWN0KCk7IHNoZWV0R3VhcmRPYnNlcnZlciA9IG51bGw7IH1cbiAgICBpZiAoc2hlZXRHdWFyZFRpbWVyKSB7IGNsZWFySW50ZXJ2YWwoc2hlZXRHdWFyZFRpbWVyKTsgc2hlZXRHdWFyZFRpbWVyID0gbnVsbDsgfVxufVxuXG4vLyBNaW5pbWlzZSBzaWduYWwgZnJvbSBpbnNpZGUgdGhlIHBlcm1pc3Npb24gaWZyYW1lIChleHRlbnNpb24gb3JpZ2luKS4gVGhpcyBpcyBhXG4vLyBoYXJtbGVzcyBVSSBhY3Rpb24gKGhpZGUgdGhlIHNoZWV0KSwgc28gY29uZmlybWluZyBpdCBjYW1lIGZyb20gT1VSIGlmcmFtZSBpc1xuLy8gZW5vdWdoIFx1MjAxNCBubyBjb25zZW50IGRlY2lzaW9uIHRyYXZlbHMgdGhpcyBjaGFubmVsLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXYpID0+IHtcbiAgICBpZiAoIXBlcm1TaGVldEVsKSByZXR1cm47XG4gICAgY29uc3QgaWZyYW1lID0gcGVybVNoZWV0RWwucXVlcnlTZWxlY3RvcignaWZyYW1lJyk7XG4gICAgaWYgKCFpZnJhbWUgfHwgZXYuc291cmNlICE9PSBpZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIGlmIChldi5kYXRhICYmIGV2LmRhdGEuX19ub3N0cmtleV9wZXJtID09PSAnbWluaW1pemUnKSBtaW5pbWl6ZVBlcm1pc3Npb25TaGVldCgpO1xufSk7XG5cbi8vIExpc3RlbiBmb3IgcmVxdWVzdHMgZnJvbSBiYWNrZ3JvdW5kXG5hcGkucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgLy8gTk9URTogY29uc2VudCAoQWxsb3cvRGVueSkgaXMgTk9UIHJlbmRlcmVkIGluIHRoZSBwYWdlIERPTS4gSXQgbGl2ZXMgaW4gdGhlXG4gICAgLy8gZXh0ZW5zaW9uLW93bmVkIHBlcm1pc3Npb24gaWZyYW1lIChzZWUgc2hvd1Blcm1pc3Npb25TaGVldCArIGF1ZGl0IFQwLTEpO1xuICAgIC8vIGEgd2ViIHBhZ2UgY2FuIG5laXRoZXIgc2NyaXB0IGludG8gaXQgbm9yIGNsaWNrIEFsbG93LlxuICAgIGlmIChtZXNzYWdlLmtpbmQgPT09ICdzaG93TG9ja2VkU2hlZXQnKSB7XG4gICAgICAgIHNob3dMb2NrZWRTaGVldChtZXNzYWdlLmZpcnN0VW5sb2NrIHx8IGZhbHNlKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uua2luZCA9PT0gJ3Nob3dQZXJtaXNzaW9uU2hlZXQnKSB7XG4gICAgICAgIHNob3dQZXJtaXNzaW9uU2hlZXQobWVzc2FnZS51cmwpO1xuICAgICAgICBzZW5kUmVzcG9uc2UodHJ1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnY2xvc2VQZXJtaXNzaW9uU2hlZXQnKSB7XG4gICAgICAgIHJlbW92ZVBlcm1pc3Npb25VSSgpO1xuICAgICAgICBzZW5kUmVzcG9uc2UodHJ1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn0pO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGFzeW5jIG1lc3NhZ2UgPT4ge1xuICAgIC8vIEMzIGZpeDogT25seSBhY2NlcHQgbWVzc2FnZXMgZnJvbSB0aGUgdG9wLWxldmVsIHBhZ2UgY29udGV4dFxuICAgIGlmIChtZXNzYWdlLnNvdXJjZSAhPT0gd2luZG93KSByZXR1cm47XG5cbiAgICAvLyBQYWdlLXJlYWNoYWJsZSBtZXRob2RzIG9ubHkuIGV4cG9ydFByb2ZpbGUgYW5kIGJ1bmtlclNlcnZlci4qIGFyZVxuICAgIC8vIGRlbGliZXJhdGVseSBleGNsdWRlZCBcdTIwMTQgdGhvc2UgYXJlIHByaXZpbGVnZWQgYW5kIG1heSBvcmlnaW5hdGUgT05MWSBmcm9tXG4gICAgLy8gdGhlIGV4dGVuc2lvbiBVSSAoc2VjdXJpdHkgYXVkaXQgVDAtMiAvIFQwLTMpLlxuICAgIGNvbnN0IHZhbGlkRXZlbnRzID0gW1xuICAgICAgICAnZ2V0UHViS2V5JyxcbiAgICAgICAgJ3NpZ25FdmVudCcsXG4gICAgICAgICdnZXRSZWxheXMnLFxuICAgICAgICAnYWRkUmVsYXknLFxuICAgICAgICAnbmlwMDQuZW5jcnlwdCcsXG4gICAgICAgICduaXAwNC5kZWNyeXB0JyxcbiAgICAgICAgJ25pcDQ0LmVuY3J5cHQnLFxuICAgICAgICAnbmlwNDQuZGVjcnlwdCcsXG4gICAgICAgICdyZXBsYWNlVVJMJyxcbiAgICBdO1xuICAgIGxldCB7IGtpbmQsIHJlcUlkLCBwYXlsb2FkIH0gPSBtZXNzYWdlLmRhdGE7XG4gICAgaWYgKCF2YWxpZEV2ZW50cy5pbmNsdWRlcyhraW5kKSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcGF5bG9hZCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgLy8gTkstMDM6IGtleSBwZXJtaXNzaW9uIGdyYW50cyBvbiB0aGUgZnVsbCBvcmlnaW4gKHNjaGVtZStob3N0Wzpwb3J0XSksXG4gICAgICAgICAgICAvLyBub3QgdGhlIGJhcmUgaG9zdCwgc28gaHR0cC9odHRwcyBhbmQgZGlmZmVyZW50IHBvcnRzIGRvbid0IHNoYXJlIGdyYW50cy5cbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcGF5bG9hZCA9IHsgZXJyb3I6ICdjb25uZWN0aW9uX2Vycm9yJywgbWVzc2FnZTogZS5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gcmVhY2ggZXh0ZW5zaW9uIGJhY2tncm91bmQnIH07XG4gICAgfVxuXG4gICAga2luZCA9IGByZXR1cm5fJHtraW5kfWA7XG5cbiAgICAvLyBOSy01IC8gTkstNjogc3RhbXAgdGhlIHByaXZhdGUgY2hhbm5lbCB0b2tlbiBhbmQgdGFyZ2V0IHRoaXMgcGFnZSdzIG93blxuICAgIC8vIG9yaWdpbiBzbyBhIHNhbWUtcGFnZSBzY3JpcHQgY2FuJ3QgZm9yZ2Uvb2JzZXJ2ZSBjcm9zcy1vcmlnaW4uXG4gICAgd2luZG93LnBvc3RNZXNzYWdlKHsga2luZCwgcmVxSWQsIHBheWxvYWQsIHRva2VuOiBOS19DSEFOTkVMX1RPS0VOIH0sIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixNQUFJLENBQUMsVUFBVTtBQUNYLFVBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLEVBQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQU1yRSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsWUFDeEQsT0FBTztBQUNILHNCQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQU07QUFBQSxZQUNuRDtBQUFBLFVBQ0o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQU1BLE1BQU0sTUFBTSxDQUFDO0FBR2IsTUFBSSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJVixlQUFlLE1BQU07QUFDakIsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNB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
