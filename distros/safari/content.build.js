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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5hc3luYyBmdW5jdGlvbiBzaG91bGRJbmplY3QoKSB7XG4gICAgaWYgKHdpbmRvdyA9PT0gd2luZG93LnRvcCkgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IGJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXM6IHRydWUgfSk7XG4gICAgICAgIGlmICghZGF0YS5ibG9ja0Nyb3NzT3JpZ2luRnJhbWVzKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICB2b2lkIHdpbmRvdy50b3AubG9jYXRpb24uaHJlZjsgLy8gdGhyb3dzIGZvciBjcm9zcy1vcmlnaW4gZnJhbWVzXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBOSy01OiBwZXItcGFnZS1sb2FkIGNoYW5uZWwgdG9rZW4gc2hhcmVkIHByaXZhdGVseSB3aXRoIHRoZSBpbmplY3RlZFxuLy8gcGFnZS13b3JsZCBzY3JpcHQuIFBhc3NlZCB2aWEgYSBkYXRhIGF0dHJpYnV0ZSB0aGF0IHRoZSBpbmplY3RlZCBzY3JpcHRcbi8vIHJlYWRzIGFuZCBzdHJpcHMgc3luY2hyb25vdXNseSBvbiBsb2FkLiBFdmVyeSByZXNwb25zZSB3ZSBwb3N0IGJhY2sgdG8gdGhlXG4vLyBwYWdlIGNhcnJpZXMgdGhpcyB0b2tlbiBzbyBhIHNhbWUtcGFnZSBzY3JpcHQgdGhhdCBvbmx5IHNhdyB0aGUgcmVxdWVzdFxuLy8gYnJvYWRjYXN0IGNhbm5vdCBmb3JnZSBhIHJlc3BvbnNlLlxuY29uc3QgTktfQ0hBTk5FTF9UT0tFTiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG5cbnNob3VsZEluamVjdCgpLnRoZW4oaW5qZWN0ID0+IHtcbiAgICBpZiAoIWluamVjdCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBhcGkucnVudGltZS5nZXRVUkwoJ25vc3RyLmJ1aWxkLmpzJykpO1xuICAgIHNjcmlwdC5kYXRhc2V0Lm5rVG9rZW4gPSBOS19DSEFOTkVMX1RPS0VOO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgIC8vIFJlc2V0IGF1dG8tbG9jayB0aW1lciB3aGVuIGEgTm9zdHItZW5hYmxlZCB0YWIgZ2FpbnMgZm9jdXNcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAndmlzaWJsZScpIHtcbiAgICAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QXV0b0xvY2snIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbi8vIFx1MjUwMFx1MjUwMCBBcHBlYXJhbmNlIGZvciBpbmplY3RlZCBjaHJvbWUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgaW5qZWN0ZWQgY29uc2VudCBjaHJvbWUgKGxvY2tlZCBzaGVldCwgcGVybWlzc2lvbi1zaGVldCB3cmFwcGVyLCBGQUIpXG4vLyBmb2xsb3dzIHRoZSB1c2VyJ3MgQXBwZWFyYW5jZSBwcmVmcyAoYTExeV9wcmVmcyBcdTIxOTIgTE9PSyBcdTAwRDcgTU9ERSArIHJlZHVjZVxuLy8gbW90aW9uKS4gU0VDVVJJVFk6IHN0b3JhZ2UgdmFsdWVzIG9ubHkgZXZlciBTRUxFQ1Qgb25lIG9mIHRoZXNlIGhhcmRjb2RlZFxuLy8gbGl0ZXJhbCBwYWxldHRlcyBcdTIwMTQgbm8gc3RvcmFnZS1kZXJpdmVkIHN0cmluZyBpcyBpbnRlcnBvbGF0ZWQgaW50byBpbmplY3RlZFxuLy8gbWFya3VwLiBWYWx1ZXMgY29waWVkIHZlcmJhdGltIGZyb20gaW5zdHJ1bWVudC5jc3Mgc2tpbiB0b2tlbnMuXG5jb25zdCBOS19QQUxFVFRFUyA9IHtcbiAgICAnaW5zdHJ1bWVudC1kYXJrJzogIHsgYmFzZTogJyMwRTBGMTMnLCBwYW5lbDogJyMxNjE4MUQnLCBoYWlyOiAnIzJBMkUzNycsIHRleHQ6ICcjRTdFOUVFJywgbXV0ZWQ6ICcjOEE5MEEwJywgc2lnbmFsOiAnI2MwODRmYycsIHNpZ25hbERpbTogJ3JnYmEoMTkyLDEzMiwyNTIsMC4xNiknIH0sXG4gICAgJ2luc3RydW1lbnQtbGlnaHQnOiB7IGJhc2U6ICcjRjRGNUY3JywgcGFuZWw6ICcjRkZGRkZGJywgaGFpcjogJyNEQ0RGRTYnLCB0ZXh0OiAnIzE5MUIyMicsIG11dGVkOiAnIzYyNjg3OCcsIHNpZ25hbDogJyM3QzNBRUQnLCBzaWduYWxEaW06ICdyZ2JhKDEyNCw1OCwyMzcsMC4xMiknIH0sXG4gICAgJ2FuYWxvZy1kYXJrJzogICAgICB7IGJhc2U6ICcjMTQxMjEwJywgcGFuZWw6ICcjMUMxODE1JywgaGFpcjogJyMzNTJFMjUnLCB0ZXh0OiAnI0VERTZEQScsIG11dGVkOiAnI0EyOTM3QycsIHNpZ25hbDogJyNmYmJmMjQnLCBzaWduYWxEaW06ICdyZ2JhKDI1MSwxOTEsMzYsMC4xNCknIH0sXG4gICAgJ2FuYWxvZy1saWdodCc6ICAgICB7IGJhc2U6ICcjRjRFQUQ2JywgcGFuZWw6ICcjRkNGNkU4JywgaGFpcjogJyNEQkNBQTQnLCB0ZXh0OiAnIzMzMjYwRicsIG11dGVkOiAnIzcyNjEzQScsIHNpZ25hbDogJyM5ODRFMDknLCBzaWduYWxEaW06ICdyZ2JhKDE1Miw3OCw5LDAuMTIpJyB9LFxuICAgICdjb25zb2xlLWRhcmsnOiAgICAgeyBiYXNlOiAnIzBCMTIyMCcsIHBhbmVsOiAnIzExMUEyQicsIGhhaXI6ICcjMjQzMTRBJywgdGV4dDogJyNFNkVERjYnLCBtdXRlZDogJyM4MzkxQTgnLCBzaWduYWw6ICcjMmRkNGJmJywgc2lnbmFsRGltOiAncmdiYSg0NSwyMTIsMTkxLDAuMTUpJyB9LFxuICAgICdjb25zb2xlLWxpZ2h0JzogICAgeyBiYXNlOiAnI0YxRjVGOScsIHBhbmVsOiAnI0ZGRkZGRicsIGhhaXI6ICcjRDJEQkU2JywgdGV4dDogJyMwRjE3MkEnLCBtdXRlZDogJyM1QjY4NzknLCBzaWduYWw6ICcjMEE3NjZDJywgc2lnbmFsRGltOiAncmdiYSgxMCwxMTgsMTA4LDAuMTIpJyB9LFxufTtcblxubGV0IG5rTG9va1Byb21pc2UgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiByZWFkTmtMb29rKCkge1xuICAgIGxldCBwcmVmcyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KCdhMTF5X3ByZWZzJyk7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEuYTExeV9wcmVmcyAmJiB0eXBlb2YgZGF0YS5hMTF5X3ByZWZzID09PSAnb2JqZWN0JykgcHJlZnMgPSBkYXRhLmExMXlfcHJlZnM7XG4gICAgfSBjYXRjaCAoXykgeyAvKiBzeW5jIHVuYXZhaWxhYmxlIFx1MjAxNCBmYWxsIHRocm91Z2ggKi8gfVxuICAgIGlmICghcHJlZnMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoJ2ExMXlfcHJlZnMnKTtcbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuYTExeV9wcmVmcyAmJiB0eXBlb2YgZGF0YS5hMTF5X3ByZWZzID09PSAnb2JqZWN0JykgcHJlZnMgPSBkYXRhLmExMXlfcHJlZnM7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogc3RvcmFnZSB1bmF2YWlsYWJsZSBcdTIwMTQgZGVmYXVsdHMgYmVsb3cgKi8gfVxuICAgIH1cbiAgICBwcmVmcyA9IHByZWZzIHx8IHt9O1xuICAgIC8vIE1pcnJvcnMgYTExeS5qcyBzYW5pdGl6ZSgpOiB1bmtub3duIHZhbHVlcyBmYWxsIGJhY2sgdG8gZGVmYXVsdHMuXG4gICAgY29uc3QgdGhlbWUgPSBbJ2luc3RydW1lbnQnLCAnYW5hbG9nJywgJ2NvbnNvbGUnXS5pbmNsdWRlcyhwcmVmcy50aGVtZSkgPyBwcmVmcy50aGVtZSA6ICdjb25zb2xlJztcbiAgICBsZXQgbW9kZSA9IFsnZGFyaycsICdsaWdodCcsICdzeXN0ZW0nXS5pbmNsdWRlcyhwcmVmcy5tb2RlKSA/IHByZWZzLm1vZGUgOiAnZGFyayc7XG4gICAgaWYgKG1vZGUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtb2RlID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpJykubWF0Y2hlcyA/ICdsaWdodCcgOiAnZGFyayc7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIG1vZGUgPSAnZGFyayc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogTktfUEFMRVRURVNbdGhlbWUgKyAnLScgKyBtb2RlXSB8fCBOS19QQUxFVFRFU1snY29uc29sZS1kYXJrJ10sXG4gICAgICAgIHJlZHVjZU1vdGlvbjogcHJlZnMucmVkdWNlTW90aW9uID09PSB0cnVlLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldE5rTG9vaygpIHtcbiAgICBpZiAoIW5rTG9va1Byb21pc2UpIG5rTG9va1Byb21pc2UgPSByZWFkTmtMb29rKCk7XG4gICAgcmV0dXJuIG5rTG9va1Byb21pc2U7XG59XG5cbi8vIFJlLXJlc29sdmUgb24gcHJlZiBjaGFuZ2VzIChBcHBlYXJhbmNlIGVkaXRlZCBpbiBhbm90aGVyIHN1cmZhY2UpLlxudHJ5IHtcbiAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWEpID0+IHtcbiAgICAgICAgaWYgKChhcmVhID09PSAnc3luYycgfHwgYXJlYSA9PT0gJ2xvY2FsJykgJiYgY2hhbmdlcy5hMTF5X3ByZWZzKSBua0xvb2tQcm9taXNlID0gbnVsbDtcbiAgICB9KTtcbn0gY2F0Y2ggKF8pIHsgLyogb25DaGFuZ2VkIHVuYXZhaWxhYmxlIFx1MjAxNCBjYWNoZSBzaW1wbHkgcGVyc2lzdHMgKi8gfVxuXG4vLyBcdTI1MDBcdTI1MDAgSW5qZWN0ZWQtc3VyZmFjZSBpc29sYXRpb24gKGNsaWNramFja2luZyAvIFVJLXJlZHJlc3MgZGVmZW5zZSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBFdmVyeSBpbmplY3RlZCBvdmVybGF5IChsb2NrZWQgc2hlZXQsIHBlcm1pc3Npb24gY29uc2VudCBzaGVldCwgRkFCKSBtb3VudHNcbi8vIGluc2lkZSBhIENMT1NFRCBzaGFkb3cgcm9vdCBvbiBhIGhhcmRlbmVkIGhvc3QuIFR3byB0aGluZ3MgdGhpcyBidXlzIHVzOlxuLy8gICAxLiBQYWdlIENTUyBzZWxlY3RvcnMgY2Fubm90IHJlYWNoIHRoZSBpbnRlcm5hbCBub2RlcyAobm8gcmVzdHlsaW5nIHRoZVxuLy8gICAgICBjb25zZW50IGlmcmFtZSBcdTIwMTQgZS5nLiB0aGUgY2xhc3NpYyBvcGFjaXR5Oi4wMiFpbXBvcnRhbnQgcmVkcmVzcyBhdHRhY2spLlxuLy8gICAyLiBUaGUgaG9zdCBsaXZlcyBpbiB0aGUgcGFnZSdzIGxpZ2h0IERPTS4gUGlubmluZyB0aGUgaG9zdCdzIE9XTlxuLy8gICAgICBjb21wb3NpdGluZyBwcm9wZXJ0aWVzIGlubGluZSB3aXRoICFpbXBvcnRhbnQgYmVhdHMgYW55IGF1dGhvciBzdHlsZXNoZWV0XG4vLyAgICAgICFpbXBvcnRhbnQsIHNvIHRoZSBwYWdlIGNhbm5vdCByZXN0eWxlIHRoZSBob3N0IGl0c2VsZiB0cmFuc3BhcmVudCAvXG4vLyAgICAgIHRyYW5zZm9ybWVkIC8gZmlsdGVyZWQuXG4vLyBMSU1JVFMgXHUyMDE0IHJlYWQgYmVmb3JlIHRydXN0aW5nIHRoaXMgYXMgYW50aS1jbGlja2phY2tpbmcgKGl0IGlzIE5PVCBzdWZmaWNpZW50KTpcbi8vICAgXHUyMDIyIElubGluZSBwaW5zIG9ubHkgZ292ZXJuIHRoZSBob3N0J3Mgb3duIGJveC4gVGhleSBkbyBOT1QgZGVmZW5kIGFnYWluc3QgYW5cbi8vICAgICBBTkNFU1RPUiBlZmZlY3Q6IGJlY2F1c2UgdGhlIHBhZ2UgaGFzIERPTSB3cml0ZSBhY2Nlc3MgdG8gZG9jdW1lbnQuYm9keSxcbi8vICAgICBpdCBjYW4gd3JhcCBvciByZS1wYXJlbnQgb3VyIGhvc3QgdW5kZXIgYW4gYXR0YWNrZXIgZWxlbWVudCB3aXRoXG4vLyAgICAgb3BhY2l0eTwxIC8gZmlsdGVyIC8gdHJhbnNmb3JtLiBHcm91cC9jb21wb3NpdGluZyBlZmZlY3RzIGFwcGx5IHRvIHRoZVxuLy8gICAgIHdob2xlIHN1YnRyZWUgYW5kIGEgZGVzY2VuZGFudCBjYW5ub3Qgb3B0IG91dCBcdTIwMTQgc28gdGhlIGhvc3QgY2FuIHN0aWxsIGJlXG4vLyAgICAgcmVuZGVyZWQgfnRyYW5zcGFyZW50LWJ1dC1jbGlja2FibGUgYW5kIGEgY2xpY2sgbHVyZWQgb250byB0aGUgcmVhbCBBbGxvdy5cbi8vICAgXHUyMDIyIEEgcGFnZSBjYW4gYWxzbyBwYWludCBpdHMgT1dOIGRlY295IGF0IHRoZSBzYW1lIG1heCB6LWluZGV4IG92ZXIgdGhlIHNoZWV0LlxuLy8gSW4tcGFnZSBjb25zZW50IGVtYmVkZGVkIGJ5IGFuIHVudHJ1c3RlZCBwYWdlIGlzIElOSEVSRU5UTFkgcmVkcmVzcy1leHBvc2VkO1xuLy8gb25seSB0aGUgdGFiIGZhbGxiYWNrIChjaHJvbWU6Ly8sIFBERiwgYnVua2VyKSBpcyBmdWxseSByZWRyZXNzLWltbXVuZS4gVGhlXG4vLyBzaGFkb3cgcm9vdCArIGhvc3QgcGlucyBjbG9zZSB0aGUgdHJpdmlhbCBwYWdlLUNTUyByZXN0eWxlLCBub3QgcmUtcGFyZW50aW5nLlxuLy8gVDAtMSBzdGlsbCBob2xkcyByZWdhcmRsZXNzIFx1MjAxNCB0aGUgQWxsb3cgdmVyYiBuZXZlciBsaXZlcyBpbiBwYWdlIERPTSwgc28gdGhpc1xuLy8gaXMgYSBkZWZlYXQtdGhlLWh1bWFuIHJpc2ssIG5vdCBhIGZvcmdlLWNvbnNlbnQtd2l0aG91dC1hLWNsaWNrIG9uZS5cbmZ1bmN0aW9uIG1vdW50U2hhZG93SG9zdCgpIHtcbiAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgcGluID0gKHByb3AsIHZhbCkgPT4gaG9zdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wLCB2YWwsICdpbXBvcnRhbnQnKTtcbiAgICBwaW4oJ2FsbCcsICdpbml0aWFsJyk7XG4gICAgcGluKCdwb3NpdGlvbicsICdmaXhlZCcpO1xuICAgIHBpbigndG9wJywgJzAnKTtcbiAgICBwaW4oJ2xlZnQnLCAnMCcpO1xuICAgIHBpbignd2lkdGgnLCAnMCcpO1xuICAgIHBpbignaGVpZ2h0JywgJzAnKTtcbiAgICBwaW4oJ3otaW5kZXgnLCAnMjE0NzQ4MzY0NycpO1xuICAgIHBpbignb3BhY2l0eScsICcxJyk7XG4gICAgcGluKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICBwaW4oJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICBwaW4oJ3RyYW5zZm9ybScsICdub25lJyk7XG4gICAgcGluKCdmaWx0ZXInLCAnbm9uZScpO1xuICAgIHBpbignbWl4LWJsZW5kLW1vZGUnLCAnbm9ybWFsJyk7XG4gICAgcGluKCdwb2ludGVyLWV2ZW50cycsICdhdXRvJyk7XG4gICAgY29uc3Qgcm9vdCA9IGhvc3QuYXR0YWNoU2hhZG93KHsgbW9kZTogJ2Nsb3NlZCcgfSk7XG4gICAgLy8gTW91bnQgb24gPGh0bWw+LCBub3QgPGJvZHk+OiB0aGlzIG1ha2VzIDxodG1sPiB0aGUgT05MWSBhbmNlc3Rvciwgc2hyaW5raW5nXG4gICAgLy8gdGhlIHN1cmZhY2UgZm9yIGFuIGFuY2VzdG9yIGdyb3VwLWVmZmVjdCAob3BhY2l0eS9maWx0ZXIvdHJhbnNmb3JtKSByZWRyZXNzXG4gICAgLy8gdG8gYSBzaW5nbGUgZWxlbWVudCB0aGUgc2hlZXQgZ3VhcmQgd2F0Y2hlcy5cbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaG9zdCk7XG4gICAgcmV0dXJuIHsgaG9zdCwgcm9vdCB9O1xufVxuXG4vLyBMb2NrZWQgbm90aWZpY2F0aW9uIHNoZWV0IFx1MjAxNCBzaG93biB3aGVuIGEgc2l0ZSBuZWVkcyB0aGUgcHJpdmF0ZSBrZXlcbi8vIGJ1dCB0aGUgZXh0ZW5zaW9uIGlzIGxvY2tlZC4gU2hvd3MgZXZlcnkgdGltZSB1bnRpbCB1bmxvY2tlZC5cbmxldCBsb2NrZWRTaGVldEhvc3QgPSBudWxsO1xubGV0IGxvY2tlZFNoZWV0RWwgPSBudWxsO1xubGV0IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBzaG93TG9ja2VkU2hlZXQoZmlyc3RVbmxvY2spIHtcbiAgICAvLyBJZiBhbHJlYWR5IHZpc2libGUsIHJlc2V0IHRoZSBhdXRvLWRpc21pc3MgdGltZXJcbiAgICBpZiAobG9ja2VkU2hlZXRFbCAmJiBsb2NrZWRTaGVldEVsLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgaWYgKGxvY2tlZFNoZWV0VGltZXIpIGNsZWFyVGltZW91dChsb2NrZWRTaGVldFRpbWVyKTtcbiAgICAgICAgbG9ja2VkU2hlZXRUaW1lciA9IHNldFRpbWVvdXQoZGlzbWlzc0xvY2tlZFNoZWV0LCA1MDAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcCwgcmVkdWNlTW90aW9uIH0gPSBhd2FpdCBnZXROa0xvb2soKTtcblxuICAgIC8vIFJlbW92ZSBhbnkgc3RhbGUgc2hlZXQgKGluY2x1ZGluZyBvbmUgY3JlYXRlZCB3aGlsZSB3ZSBhd2FpdGVkKVxuICAgIGlmIChsb2NrZWRTaGVldEhvc3QpIGxvY2tlZFNoZWV0SG9zdC5yZW1vdmUoKTtcblxuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3Qgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzaGVldC5pZCA9ICdub3N0cmtleS1sb2NrZWQtc2hlZXQnO1xuICAgIHNoZWV0LmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgICAgIHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgICBpbnNldDogMDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuNSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQuYWN0aXZlIC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnBhbmVsfTtcbiAgICAgICAgICAgICAgICBib3JkZXItdG9wOiAxcHggc29saWQgJHtwLmhhaXJ9O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHggMTZweCAwIDA7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMjRweDtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTAwJSk7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZTtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIC00cHggMjBweCByZ2JhKDAsMCwwLDAuMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0LmFjdGl2ZSAubmstc2hlZXQge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWhhbmRsZSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA0cHg7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLmhhaXJ9O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxNnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstaWNvbiB7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAzMnB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstdGl0bGUge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AudGV4dH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXRleHQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AudGV4dH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS41O1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDRweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLW11dGVkIHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLm11dGVkfTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAxNHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAke3Auc2lnbmFsfTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsRGltfTtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLnNpZ25hbH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDIwcHg7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjE1cyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsRGltfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICR7cmVkdWNlTW90aW9uID8gYCNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJhY2tkcm9wLFxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstc2hlZXQgeyB0cmFuc2l0aW9uOiBub25lOyB9YCA6ICcnfVxuICAgICAgICAgICAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1iYWNrZHJvcCxcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1zaGVldCB7IHRyYW5zaXRpb246IG5vbmU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1zaGVldFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWhhbmRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWljb25cIj4mI3gxRjUxMjs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10aXRsZVwiPiR7Zmlyc3RVbmxvY2sgPyAnTm9zdHJLZXkgTmVlZHMgdG8gRGVjcnlwdCBZb3VyIEtleXMnIDogJ05vc3RyS2V5IGlzIExvY2tlZCd9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstdGV4dFwiPiR7Zmlyc3RVbmxvY2tcbiAgICAgICAgICAgICAgICA/ICdUaGlzIHNpdGUgaXMgcmVxdWVzdGluZyB5b3VyIE5vc3RyIGlkZW50aXR5LiBFbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZCB0byBkZWNyeXB0IHlvdXIga2V5IHZhdWx0IGZvciB0aGlzIHNlc3Npb24uJ1xuICAgICAgICAgICAgICAgIDogJ1RoaXMgc2l0ZSBuZWVkcyB5b3VyIGtleSB0byBzaWduIG9yIGVuY3J5cHQuJ308L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1tdXRlZFwiPkNsaWNrIHRoZSBOb3N0cktleSBpY29uIGluIHlvdXIgdG9vbGJhciBhbmQgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibmstYnRuXCI+R290IGl0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChzaGVldCk7XG4gICAgbG9ja2VkU2hlZXRIb3N0ID0gaG9zdDtcbiAgICBsb2NrZWRTaGVldEVsID0gc2hlZXQ7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHNoZWV0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTtcblxuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJy5uay1idG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3NMb2NrZWRTaGVldCk7XG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzTG9ja2VkU2hlZXQpO1xuXG4gICAgLy8gQXV0by1kaXNtaXNzIGFmdGVyIDUgc2Vjb25kc1xuICAgIGxvY2tlZFNoZWV0VGltZXIgPSBzZXRUaW1lb3V0KGRpc21pc3NMb2NrZWRTaGVldCwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIGRpc21pc3NMb2NrZWRTaGVldCgpIHtcbiAgICBpZiAobG9ja2VkU2hlZXRUaW1lcikgeyBjbGVhclRpbWVvdXQobG9ja2VkU2hlZXRUaW1lcik7IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsOyB9XG4gICAgaWYgKCFsb2NrZWRTaGVldEVsKSByZXR1cm47XG4gICAgbG9ja2VkU2hlZXRFbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBjb25zdCBob3N0ID0gbG9ja2VkU2hlZXRIb3N0O1xuICAgIGxvY2tlZFNoZWV0RWwgPSBudWxsO1xuICAgIGxvY2tlZFNoZWV0SG9zdCA9IG51bGw7XG4gICAgc2V0VGltZW91dCgoKSA9PiBob3N0ICYmIGhvc3QucmVtb3ZlKCksIDMwMCk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBQZXJtaXNzaW9uIGNvbnNlbnQgc2hlZXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgQWxsb3cvRGVueSBVSSBpcyBhbiBFWFRFTlNJT04tT1dORUQgaWZyYW1lIChwZXJtaXNzaW9uL3Blcm1pc3Npb24uaHRtbClcbi8vIGluamVjdGVkIGFzIGEgZGltbWVkIGJvdHRvbSBzaGVldCwgc28gdGhlIHVzZXIga2VlcHMgdGhlIHNpdGUgaW4gdmlldyBmb3Jcbi8vIGluZm9ybWVkIGNvbnNlbnQuIEJlY2F1c2UgdGhlIGlmcmFtZSBpcyBhIGNyb3NzLW9yaWdpbiBleHRlbnNpb24gcGFnZSwgdGhlXG4vLyB3ZWIgcGFnZSBDQU5OT1Qgc2NyaXB0IGludG8gaXQgb3IgY2xpY2sgQWxsb3cgXHUyMDE0IHRoZSBUMC0xIHByb3RlY3Rpb24gaG9sZHMuXG4vLyBUaGUgYmFja2Ryb3AgYW5kIHRoZSBtaW5pbWl6ZWQgRkFCICh0aGlzIGZpbGUsIHBhZ2UgRE9NKSBjYXJyeSBOTyBjb25zZW50XG4vLyBhY3Rpb247IHRoZXkgb25seSBzaG93L2hpZGUgdGhlIHNoZWV0LCBzbyB0aGV5IGFyZSBzYWZlIHRvIGxpdmUgaW4gdGhlIHBhZ2UuXG5sZXQgcGVybVNoZWV0SG9zdCA9IG51bGw7XG5sZXQgcGVybVNoZWV0RWwgPSBudWxsO1xubGV0IHBlcm1GYWJIb3N0ID0gbnVsbDtcbmxldCBwZXJtRmFiRWwgPSBudWxsO1xubGV0IHBlcm1TaGVldFNyYyA9IG51bGw7XG5cbi8vIEdlbmVyYXRpb24gY291bnRlciBndWFyZGluZyB0aGUgYXN5bmMgZ2FwIGluIHNob3dQZXJtaXNzaW9uU2hlZXQgL1xuLy8gc2hvd1Blcm1pc3Npb25GYWI6IGEgY2xvc2VQZXJtaXNzaW9uU2hlZXQgKG9yIGEgbmV3ZXIgc2hvdykgYXJyaXZpbmcgd2hpbGVcbi8vIHRoZSBhcHBlYXJhbmNlIHJlYWQgaXMgaW4gZmxpZ2h0IGJ1bXBzIHRoZSBjb3VudGVyLCBzbyB0aGUgc3RhbGUgY2FsbCBiYWlsc1xuLy8gaW5zdGVhZCBvZiByZXN1cnJlY3RpbmcgYSBzaGVldCB0aGUgYmFja2dyb3VuZCBhbHJlYWR5IGNsb3NlZC5cbmxldCBua1Blcm1HZW4gPSAwO1xuXG5hc3luYyBmdW5jdGlvbiBzaG93UGVybWlzc2lvblNoZWV0KHNyYykge1xuICAgIHBlcm1TaGVldFNyYyA9IHNyYztcbiAgICBjb25zdCBnZW4gPSArK25rUGVybUdlbjtcbiAgICBjb25zdCB7IHAsIHJlZHVjZU1vdGlvbiB9ID0gYXdhaXQgZ2V0TmtMb29rKCk7XG4gICAgaWYgKGdlbiAhPT0gbmtQZXJtR2VuKSByZXR1cm47IC8vIHN1cGVyc2VkZWQgd2hpbGUgd2UgYXdhaXRlZFxuICAgIHJlbW92ZVBlcm1pc3Npb25GYWIoKTtcbiAgICBpZiAocGVybVNoZWV0SG9zdCkgcGVybVNoZWV0SG9zdC5yZW1vdmUoKTtcbiAgICBjb25zdCB7IGhvc3QsIHJvb3QgfSA9IG1vdW50U2hhZG93SG9zdCgpO1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWwuaWQgPSAnbm9zdHJrZXktcGVybS1zaGVldCc7XG4gICAgZWwuaW5uZXJIVE1MID0gYFxuICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCB7IHBvc2l0aW9uOiBmaXhlZDsgaW5zZXQ6IDA7IHotaW5kZXg6IDIxNDc0ODM2NDc7IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwwLjUpO1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDA7JHtyZWR1Y2VNb3Rpb24gPyAnJyA6ICcgdHJhbnNpdGlvbjogb3BhY2l0eSAuMnMgZWFzZTsnfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQuYWN0aXZlIC5uay1iYWNrZHJvcCB7IG9wYWNpdHk6IDE7IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IC5uay1mcmFtZS13cmFwIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7IGxlZnQ6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7XG4gICAgICAgICAgICAgICAgbWF4LXdpZHRoOiA0NjBweDsgbWFyZ2luOiAwIGF1dG87XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpOyR7cmVkdWNlTW90aW9uID8gJycgOiAnIHRyYW5zaXRpb246IHRyYW5zZm9ybSAuM3MgZWFzZTsnfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQuYWN0aXZlIC5uay1mcmFtZS13cmFwIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApOyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCBpZnJhbWUge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiA3MnZoOyBtYXgtaGVpZ2h0OiA2NDBweDtcbiAgICAgICAgICAgICAgICBib3JkZXI6IDA7IGJvcmRlci1yYWRpdXM6IDE2cHggMTZweCAwIDA7XG4gICAgICAgICAgICAgICAgYm94LXNoYWRvdzogMCAtNnB4IDI4cHggcmdiYSgwLDAsMCwuNDUpOyBiYWNrZ3JvdW5kOiAke3AuYmFzZX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAgICAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IC5uay1iYWNrZHJvcCxcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstZnJhbWUtd3JhcCB7IHRyYW5zaXRpb246IG5vbmU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1mcmFtZS13cmFwXCI+PGlmcmFtZSB0aXRsZT1cIk5vc3RyS2V5IHBlcm1pc3Npb24gcmVxdWVzdFwiPjwvaWZyYW1lPjwvZGl2PlxuICAgIGA7XG4gICAgZWwucXVlcnlTZWxlY3RvcignaWZyYW1lJykuc3JjID0gc3JjOyAvLyBzZXQgdmlhIHByb3BlcnR5LCBub3QgSFRNTCBpbnRlcnBvbGF0aW9uXG4gICAgcm9vdC5hcHBlbmRDaGlsZChlbCk7XG4gICAgcGVybVNoZWV0SG9zdCA9IGhvc3Q7XG4gICAgcGVybVNoZWV0RWwgPSBlbDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gZWwuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJykpO1xuICAgIC8vIEJhY2tkcm9wIGNsaWNrIE1JTklNSVNFUyAocmVxdWVzdCBzdGF5cyBwZW5kaW5nKSByYXRoZXIgdGhhbiBkaXNtaXNzaW5nLlxuICAgIGVsLnF1ZXJ5U2VsZWN0b3IoJy5uay1iYWNrZHJvcCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbWluaW1pemVQZXJtaXNzaW9uU2hlZXQpO1xuICAgIC8vIEZhaWwtY2xvc2VkIHJlZHJlc3MgZ3VhcmQ6IHRoaXMgaXMgdGhlIGFjdHVhbCBjb25zZW50IHN1cmZhY2UsIHNvIGlmIHRoZSBwYWdlXG4gICAgLy8gcmUtcGFyZW50cyBvciB2aXN1YWxseSBzdXBwcmVzc2VzIGl0IHdlIHRlYXIgaXQgZG93biAobm8gY2xpY2sgY2FuIGxhbmQgb24gYVxuICAgIC8vIGhpZGRlbiBBcHByb3ZlKSBhbmQgZXNjYWxhdGUgdGhlIFNBTUUgcGVuZGluZyByZXF1ZXN0IHRvIGEgcmVkcmVzcy1pbW11bmUgdGFiLlxuICAgIHN0YXJ0U2hlZXRHdWFyZCgpO1xufVxuXG5mdW5jdGlvbiBtaW5pbWl6ZVBlcm1pc3Npb25TaGVldCgpIHtcbiAgICBpZiAoIXBlcm1TaGVldEhvc3QpIHJldHVybjtcbiAgICBzdG9wU2hlZXRHdWFyZCgpO1xuICAgIHBlcm1TaGVldEhvc3QucmVtb3ZlKCk7XG4gICAgcGVybVNoZWV0SG9zdCA9IG51bGw7XG4gICAgcGVybVNoZWV0RWwgPSBudWxsO1xuICAgIHNob3dQZXJtaXNzaW9uRmFiKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3dQZXJtaXNzaW9uRmFiKCkge1xuICAgIGlmIChwZXJtRmFiRWwgfHwgIXBlcm1TaGVldFNyYykgcmV0dXJuO1xuICAgIGNvbnN0IGdlbiA9ICsrbmtQZXJtR2VuO1xuICAgIGNvbnN0IHsgcCwgcmVkdWNlTW90aW9uIH0gPSBhd2FpdCBnZXROa0xvb2soKTtcbiAgICBpZiAoZ2VuICE9PSBua1Blcm1HZW4pIHJldHVybjsgLy8gc3VwZXJzZWRlZCB3aGlsZSB3ZSBhd2FpdGVkXG4gICAgaWYgKHBlcm1GYWJFbCB8fCAhcGVybVNoZWV0U3JjKSByZXR1cm47XG4gICAgY29uc3QgeyBob3N0LCByb290IH0gPSBtb3VudFNoYWRvd0hvc3QoKTtcbiAgICBjb25zdCBmYWIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBmYWIuaWQgPSAnbm9zdHJrZXktcGVybS1mYWInO1xuICAgIGZhYi5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiB7IHBvc2l0aW9uOiBmaXhlZDsgcmlnaHQ6IDE2cHg7IGJvdHRvbTogMTZweDsgei1pbmRleDogMjE0NzQ4MzY0NztcbiAgICAgICAgICAgICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWY7IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZmFiIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA4cHg7IHBhZGRpbmc6IDEycHggMTZweDtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA5OTlweDsgY3Vyc29yOiBwb2ludGVyOyBib3JkZXI6IDFweCBzb2xpZCAke3Auc2lnbmFsfTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3AucGFuZWx9OyBjb2xvcjogJHtwLnRleHR9OyBmb250LXNpemU6IDE0cHg7IGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICAgICAgYm94LXNoYWRvdzogMCA0cHggMThweCByZ2JhKDAsMCwwLC40KTske3JlZHVjZU1vdGlvbiA/ICcnIDogJyBhbmltYXRpb246IG5rLWZhYi1wdWxzZSAycyBlYXNlLWluLW91dCBpbmZpbml0ZTsnfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIC5uay1kb3QgeyB3aWR0aDogOHB4OyBoZWlnaHQ6IDhweDsgYm9yZGVyLXJhZGl1czogNTAlOyBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsfTsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIC5uay1mYWItY2QgeyBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zOyBjb2xvcjogJHtwLm11dGVkfTsgZm9udC13ZWlnaHQ6IDYwMDsgfVxuICAgICAgICAgICAgQGtleWZyYW1lcyBuay1mYWItcHVsc2UgeyAwJSwxMDAleyBib3gtc2hhZG93OiAwIDRweCAxOHB4IHJnYmEoMCwwLDAsLjQpO30gNTAleyBib3gtc2hhZG93OiAwIDRweCAyNHB4ICR7cC5zaWduYWxEaW19O30gfVxuICAgICAgICAgICAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWZhYiB7IGFuaW1hdGlvbjogbm9uZTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibmstZmFiXCIgdHlwZT1cImJ1dHRvblwiPjxzcGFuIGNsYXNzPVwibmstZG90XCI+PC9zcGFuPlJldmlldyBzaWduaW5nIHJlcXVlc3Q8c3BhbiBjbGFzcz1cIm5rLWZhYi1jZFwiPjwvc3Bhbj48L2J1dHRvbj5cbiAgICBgO1xuICAgIHJvb3QuYXBwZW5kQ2hpbGQoZmFiKTtcbiAgICBwZXJtRmFiSG9zdCA9IGhvc3Q7XG4gICAgcGVybUZhYkVsID0gZmFiO1xuICAgIGZhYi5xdWVyeVNlbGVjdG9yKCcubmstZmFiJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzaG93UGVybWlzc2lvblNoZWV0KHBlcm1TaGVldFNyYykpO1xuICAgIHN0YXJ0RmFiQ291bnRkb3duKGZhYi5xdWVyeVNlbGVjdG9yKCcubmstZmFiLWNkJykpO1xufVxuXG4vLyBBIG1pbmltaXplZCByZXF1ZXN0IGtlZXBzIGNvdW50aW5nIGRvd247IHN1cmZhY2UgdGhlIHJlbWFpbmluZyB0aW1lIG9uIHRoZSBGQUJcbi8vIHNvIGl0IGRvZXNuJ3Qgc2lsZW50bHkgZXhwaXJlIHdoaWxlIHR1Y2tlZCBhd2F5LiBEZWFkbGluZSBpcyByZWFkIGZyb20gdGhlXG4vLyBwZW5kaW5nIHNoZWV0IFVSTCB0aGF0IGJhY2tncm91bmQgc3RhbXBlZCAoP2RlYWRsaW5lPSkuXG5sZXQgcGVybUZhYlRpbWVyID0gbnVsbDtcbmZ1bmN0aW9uIHN0YXJ0RmFiQ291bnRkb3duKGNkRWwpIHtcbiAgICBzdG9wRmFiQ291bnRkb3duKCk7XG4gICAgbGV0IGRlYWRsaW5lID0gMDtcbiAgICB0cnkgeyBkZWFkbGluZSA9IE51bWJlcihuZXcgVVJMKHBlcm1TaGVldFNyYykuc2VhcmNoUGFyYW1zLmdldCgnZGVhZGxpbmUnKSkgfHwgMDsgfSBjYXRjaCAoXykgeyAvKiBuby1vcCAqLyB9XG4gICAgaWYgKCFkZWFkbGluZSB8fCAhY2RFbCkgcmV0dXJuO1xuICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGRlYWRsaW5lIC0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7IGNkRWwudGV4dENvbnRlbnQgPSAnXHUwMEI3IGV4cGlyZWQnOyBzdG9wRmFiQ291bnRkb3duKCk7IHJldHVybjsgfVxuICAgICAgICBjZEVsLnRleHRDb250ZW50ID0gYFx1MDBCNyAke01hdGguY2VpbChyZW1haW5pbmcgLyAxMDAwKX1zYDtcbiAgICB9O1xuICAgIHRpY2soKTtcbiAgICBwZXJtRmFiVGltZXIgPSBzZXRJbnRlcnZhbCh0aWNrLCAyNTApO1xufVxuZnVuY3Rpb24gc3RvcEZhYkNvdW50ZG93bigpIHtcbiAgICBpZiAocGVybUZhYlRpbWVyKSB7IGNsZWFySW50ZXJ2YWwocGVybUZhYlRpbWVyKTsgcGVybUZhYlRpbWVyID0gbnVsbDsgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVQZXJtaXNzaW9uRmFiKCkge1xuICAgIHN0b3BGYWJDb3VudGRvd24oKTtcbiAgICBpZiAocGVybUZhYkhvc3QpIHsgcGVybUZhYkhvc3QucmVtb3ZlKCk7IHBlcm1GYWJIb3N0ID0gbnVsbDsgfVxuICAgIHBlcm1GYWJFbCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVBlcm1pc3Npb25VSSgpIHtcbiAgICBua1Blcm1HZW4rKzsgLy8gaW52YWxpZGF0ZSBhbnkgc2hvdyogc3RpbGwgYXdhaXRpbmcgaXRzIGFwcGVhcmFuY2UgcmVhZFxuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgaWYgKHBlcm1TaGVldEhvc3QpIHsgcGVybVNoZWV0SG9zdC5yZW1vdmUoKTsgcGVybVNoZWV0SG9zdCA9IG51bGw7IHBlcm1TaGVldEVsID0gbnVsbDsgfVxuICAgIHJlbW92ZVBlcm1pc3Npb25GYWIoKTtcbiAgICBwZXJtU2hlZXRTcmMgPSBudWxsO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgU2hlZXQgcmVkcmVzcyBndWFyZCAoZmFpbC1jbG9zZWQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLy8gVGhlIGNvbnNlbnQgaWZyYW1lIGxpdmVzIGluIHBhZ2UgbGlnaHQgRE9NLCBzbyBhIHBhZ2Ugd2l0aCBET00td3JpdGUgYWNjZXNzIGNhblxuLy8gc3RpbGwgcmUtcGFyZW50IG91ciBob3N0IHVuZGVyIGEgdHJhbnNwYXJlbnQgZ3JvdXAgKG9wYWNpdHkvZmlsdGVyKSBvciBvdGhlcndpc2Vcbi8vIHN1cHByZXNzIGl0IHdoaWxlIGtlZXBpbmcgaXQgY2xpY2thYmxlIFx1MjAxNCBsdXJpbmcgYSBjbGljayBvbnRvIHRoZSByZWFsIEFwcHJvdmUuXG4vLyBUaGUgaW5saW5lIGhvc3QgcGlucyBjYW5ub3Qgb3B0IGEgc3VidHJlZSBvdXQgb2YgYW4gQU5DRVNUT1IgZ3JvdXAgZWZmZWN0LiBTbyB3ZVxuLy8gYWN0aXZlbHkgd2F0Y2g6IGlmIHRoZSBzdXJmYWNlIHN0b3BzIGJlaW5nIGZ1bGx5IHZpc2libGUgLyBjb3JyZWN0bHkgcGFyZW50ZWQsXG4vLyB3ZSBkZXN0cm95IGl0IChub3RoaW5nIGxlZnQgdG8gbWlzLWNsaWNrKSBhbmQgaGFuZCB0aGUgcmVxdWVzdCB0byB0aGUgdGFiLCB3aGljaFxuLy8gdGhlIHBhZ2UgY2Fubm90IHN0eWxlIGF0IGFsbC5cbmxldCBzaGVldEd1YXJkT2JzZXJ2ZXIgPSBudWxsO1xubGV0IHNoZWV0R3VhcmRUaW1lciA9IG51bGw7XG5cbmZ1bmN0aW9uIHN0eWxlU3VwcHJlc3Nlcyhjcykge1xuICAgIGlmICghY3MpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBwYXJzZUZsb2F0KGNzLm9wYWNpdHkpIDwgMC45XG4gICAgICAgIHx8IGNzLnZpc2liaWxpdHkgIT09ICd2aXNpYmxlJ1xuICAgICAgICB8fCBjcy5kaXNwbGF5ID09PSAnbm9uZSdcbiAgICAgICAgfHwgY3MucG9pbnRlckV2ZW50cyA9PT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLmZpbHRlciAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLnRyYW5zZm9ybSAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLm1peEJsZW5kTW9kZSAhPT0gJ25vcm1hbCdcbiAgICAgICAgfHwgY3MuY2xpcFBhdGggIT09ICdub25lJ1xuICAgICAgICB8fCBjcy5wZXJzcGVjdGl2ZSAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLmNvbnRlbnRWaXNpYmlsaXR5ID09PSAnaGlkZGVuJ1xuICAgICAgICB8fCAoY3MubWFzayAmJiBjcy5tYXNrICE9PSAnbm9uZScpXG4gICAgICAgIHx8IChjcy53ZWJraXRNYXNrICYmIGNzLndlYmtpdE1hc2sgIT09ICdub25lJylcbiAgICAgICAgfHwgKGNzLmJhY2tkcm9wRmlsdGVyICYmIGNzLmJhY2tkcm9wRmlsdGVyICE9PSAnbm9uZScpO1xufVxuXG5mdW5jdGlvbiBzaGVldExvb2tzQ29tcHJvbWlzZWQoKSB7XG4gICAgY29uc3QgaG9zdCA9IHBlcm1TaGVldEhvc3Q7XG4gICAgaWYgKCFob3N0IHx8ICFob3N0LmlzQ29ubmVjdGVkKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaG9zdC5wYXJlbnROb2RlICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHJldHVybiB0cnVlOyAvLyByZS1wYXJlbnRlZFxuICAgIHRyeSB7XG4gICAgICAgIGlmIChzdHlsZVN1cHByZXNzZXMoZ2V0Q29tcHV0ZWRTdHlsZShob3N0KSkpIHJldHVybiB0cnVlOyAgICAgICAvLyBob3N0IGJveFxuICAgICAgICBpZiAoc3R5bGVTdXBwcmVzc2VzKGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSkpIHJldHVybiB0cnVlOyAvLyBzb2xlIGFuY2VzdG9yXG4gICAgICAgIGNvbnN0IGlmcmFtZSA9IHBlcm1TaGVldEVsICYmIHBlcm1TaGVldEVsLnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgICAgICBpZiAoIWlmcmFtZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGNvbnN0IGlmY3MgPSBnZXRDb21wdXRlZFN0eWxlKGlmcmFtZSk7XG4gICAgICAgIGlmIChwYXJzZUZsb2F0KGlmY3Mub3BhY2l0eSkgPCAwLjkgfHwgaWZjcy52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGlmIHdlIGNhbid0IHZlcmlmeSwgZmFpbCBjbG9zZWRcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvblNoZWV0Q29tcHJvbWlzZWQoKSB7XG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICByZW1vdmVQZXJtaXNzaW9uVUkoKTsgLy8gZGVzdHJveSB0aGUgaW4tcGFnZSBzdXJmYWNlIFx1MjAxNCBubyBoaWRkZW4gQXBwcm92ZSB0byBjbGlja1xuICAgIC8vIEFzayB0aGUgYmFja2dyb3VuZCB0byByZW9wZW4gdGhlIFNBTUUgcGVuZGluZyBwcm9tcHQgYXMgYSBkZWRpY2F0ZWQgdGFiLlxuICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Blcm1pc3Npb25TaGVldENvbXByb21pc2VkJyB9KS5jYXRjaCgoKSA9PiB7fSk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0U2hlZXRHdWFyZCgpIHtcbiAgICBzdG9wU2hlZXRHdWFyZCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHNoZWV0R3VhcmRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChzaGVldExvb2tzQ29tcHJvbWlzZWQoKSkgb25TaGVldENvbXByb21pc2VkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBjaGlsZExpc3Qvc3VidHJlZSBjYXRjaGVzIHJlLXBhcmVudGluZzsgc3R5bGUvY2xhc3MgYXR0cnMgY2F0Y2ggYSBwYWdlXG4gICAgICAgIC8vIGRyb3BwaW5nIGEgZmlsdGVyL29wYWNpdHkgb250byA8aHRtbD4gb3Igd3JhcHBpbmcgb3VyIGhvc3QuXG4gICAgICAgIHNoZWV0R3VhcmRPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydzdHlsZScsICdjbGFzcyddLFxuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoXykgeyAvKiBvYnNlcnZlciB1bmF2YWlsYWJsZSBcdTIwMTQgcG9sbCBzdGlsbCBjb3ZlcnMgdXMgKi8gfVxuICAgIC8vIEJhY2tzdG9wIGZvciBlZmZlY3RzIGEgbXV0YXRpb24gY2FuJ3Qgc3VyZmFjZSAoc3R5bGVzaGVldCBzd2FwcywgOmhvdmVyIHJ1bGVzKS5cbiAgICBzaGVldEd1YXJkVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChzaGVldExvb2tzQ29tcHJvbWlzZWQoKSkgb25TaGVldENvbXByb21pc2VkKCk7XG4gICAgfSwgMjAwKTtcbn1cblxuZnVuY3Rpb24gc3RvcFNoZWV0R3VhcmQoKSB7XG4gICAgaWYgKHNoZWV0R3VhcmRPYnNlcnZlcikgeyBzaGVldEd1YXJkT2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyBzaGVldEd1YXJkT2JzZXJ2ZXIgPSBudWxsOyB9XG4gICAgaWYgKHNoZWV0R3VhcmRUaW1lcikgeyBjbGVhckludGVydmFsKHNoZWV0R3VhcmRUaW1lcik7IHNoZWV0R3VhcmRUaW1lciA9IG51bGw7IH1cbn1cblxuLy8gTWluaW1pc2Ugc2lnbmFsIGZyb20gaW5zaWRlIHRoZSBwZXJtaXNzaW9uIGlmcmFtZSAoZXh0ZW5zaW9uIG9yaWdpbikuIFRoaXMgaXMgYVxuLy8gaGFybWxlc3MgVUkgYWN0aW9uIChoaWRlIHRoZSBzaGVldCksIHNvIGNvbmZpcm1pbmcgaXQgY2FtZSBmcm9tIE9VUiBpZnJhbWUgaXNcbi8vIGVub3VnaCBcdTIwMTQgbm8gY29uc2VudCBkZWNpc2lvbiB0cmF2ZWxzIHRoaXMgY2hhbm5lbC5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2KSA9PiB7XG4gICAgaWYgKCFwZXJtU2hlZXRFbCkgcmV0dXJuO1xuICAgIGNvbnN0IGlmcmFtZSA9IHBlcm1TaGVldEVsLnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgIGlmICghaWZyYW1lIHx8IGV2LnNvdXJjZSAhPT0gaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICBpZiAoZXYuZGF0YSAmJiBldi5kYXRhLl9fbm9zdHJrZXlfcGVybSA9PT0gJ21pbmltaXplJykgbWluaW1pemVQZXJtaXNzaW9uU2hlZXQoKTtcbn0pO1xuXG4vLyBMaXN0ZW4gZm9yIHJlcXVlc3RzIGZyb20gYmFja2dyb3VuZFxuYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIC8vIE5PVEU6IGNvbnNlbnQgKEFsbG93L0RlbnkpIGlzIE5PVCByZW5kZXJlZCBpbiB0aGUgcGFnZSBET00uIEl0IGxpdmVzIGluIHRoZVxuICAgIC8vIGV4dGVuc2lvbi1vd25lZCBwZXJtaXNzaW9uIGlmcmFtZSAoc2VlIHNob3dQZXJtaXNzaW9uU2hlZXQgKyBhdWRpdCBUMC0xKTtcbiAgICAvLyBhIHdlYiBwYWdlIGNhbiBuZWl0aGVyIHNjcmlwdCBpbnRvIGl0IG5vciBjbGljayBBbGxvdy5cbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnc2hvd0xvY2tlZFNoZWV0Jykge1xuICAgICAgICBzaG93TG9ja2VkU2hlZXQobWVzc2FnZS5maXJzdFVubG9jayB8fCBmYWxzZSk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChtZXNzYWdlLmtpbmQgPT09ICdzaG93UGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICBzaG93UGVybWlzc2lvblNoZWV0KG1lc3NhZ2UudXJsKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uua2luZCA9PT0gJ2Nsb3NlUGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICByZW1vdmVQZXJtaXNzaW9uVUkoKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyBtZXNzYWdlID0+IHtcbiAgICAvLyBDMyBmaXg6IE9ubHkgYWNjZXB0IG1lc3NhZ2VzIGZyb20gdGhlIHRvcC1sZXZlbCBwYWdlIGNvbnRleHRcbiAgICBpZiAobWVzc2FnZS5zb3VyY2UgIT09IHdpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gUGFnZS1yZWFjaGFibGUgbWV0aG9kcyBvbmx5LiBleHBvcnRQcm9maWxlIGFuZCBidW5rZXJTZXJ2ZXIuKiBhcmVcbiAgICAvLyBkZWxpYmVyYXRlbHkgZXhjbHVkZWQgXHUyMDE0IHRob3NlIGFyZSBwcml2aWxlZ2VkIGFuZCBtYXkgb3JpZ2luYXRlIE9OTFkgZnJvbVxuICAgIC8vIHRoZSBleHRlbnNpb24gVUkgKHNlY3VyaXR5IGF1ZGl0IFQwLTIgLyBUMC0zKS5cbiAgICBjb25zdCB2YWxpZEV2ZW50cyA9IFtcbiAgICAgICAgJ2dldFB1YktleScsXG4gICAgICAgICdzaWduRXZlbnQnLFxuICAgICAgICAnZ2V0UmVsYXlzJyxcbiAgICAgICAgJ2FkZFJlbGF5JyxcbiAgICAgICAgJ25pcDA0LmVuY3J5cHQnLFxuICAgICAgICAnbmlwMDQuZGVjcnlwdCcsXG4gICAgICAgICduaXA0NC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDQ0LmRlY3J5cHQnLFxuICAgICAgICAncmVwbGFjZVVSTCcsXG4gICAgXTtcbiAgICBsZXQgeyBraW5kLCByZXFJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZS5kYXRhO1xuICAgIGlmICghdmFsaWRFdmVudHMuaW5jbHVkZXMoa2luZCkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIHBheWxvYWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgIC8vIE5LLTAzOiBrZXkgcGVybWlzc2lvbiBncmFudHMgb24gdGhlIGZ1bGwgb3JpZ2luIChzY2hlbWUraG9zdFs6cG9ydF0pLFxuICAgICAgICAgICAgLy8gbm90IHRoZSBiYXJlIGhvc3QsIHNvIGh0dHAvaHR0cHMgYW5kIGRpZmZlcmVudCBwb3J0cyBkb24ndCBzaGFyZSBncmFudHMuXG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHBheWxvYWQgPSB7IGVycm9yOiAnY29ubmVjdGlvbl9lcnJvcicsIG1lc3NhZ2U6IGUubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlYWNoIGV4dGVuc2lvbiBiYWNrZ3JvdW5kJyB9O1xuICAgIH1cblxuICAgIGtpbmQgPSBgcmV0dXJuXyR7a2luZH1gO1xuXG4gICAgLy8gTkstNSAvIE5LLTY6IHN0YW1wIHRoZSBwcml2YXRlIGNoYW5uZWwgdG9rZW4gYW5kIHRhcmdldCB0aGlzIHBhZ2UncyBvd25cbiAgICAvLyBvcmlnaW4gc28gYSBzYW1lLXBhZ2Ugc2NyaXB0IGNhbid0IGZvcmdlL29ic2VydmUgY3Jvc3Mtb3JpZ2luLlxuICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7IGtpbmQsIHJlcUlkLCBwYXlsb2FkLCB0b2tlbjogTktfQ0hBTk5FTF9UT0tFTiB9LCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsZUFBTyxNQUFNLFNBQVM7QUFBQSxVQUNsQixHQUFHO0FBQUEsVUFDSCxJQUFJLFdBQVc7QUFDWCxnQkFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLFdBQVc7QUFDaEQscUJBQU8sSUFBSSxNQUFNLFNBQVMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3hELE9BQU87QUFDSCxzQkFBUSxPQUFPLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxNQUFNO0FBQUEsWUFDbkQ7QUFBQSxVQUNKO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFNQSxNQUFNLE1BQU0sQ0FBQztBQUdiLE1B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
