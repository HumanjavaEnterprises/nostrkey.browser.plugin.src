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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5hc3luYyBmdW5jdGlvbiBzaG91bGRJbmplY3QoKSB7XG4gICAgaWYgKHdpbmRvdyA9PT0gd2luZG93LnRvcCkgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IGJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXM6IHRydWUgfSk7XG4gICAgICAgIGlmICghZGF0YS5ibG9ja0Nyb3NzT3JpZ2luRnJhbWVzKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICB2b2lkIHdpbmRvdy50b3AubG9jYXRpb24uaHJlZjsgLy8gdGhyb3dzIGZvciBjcm9zcy1vcmlnaW4gZnJhbWVzXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBOSy01OiBwZXItcGFnZS1sb2FkIGNoYW5uZWwgdG9rZW4gc2hhcmVkIHByaXZhdGVseSB3aXRoIHRoZSBpbmplY3RlZFxuLy8gcGFnZS13b3JsZCBzY3JpcHQuIFBhc3NlZCB2aWEgYSBkYXRhIGF0dHJpYnV0ZSB0aGF0IHRoZSBpbmplY3RlZCBzY3JpcHRcbi8vIHJlYWRzIGFuZCBzdHJpcHMgc3luY2hyb25vdXNseSBvbiBsb2FkLiBFdmVyeSByZXNwb25zZSB3ZSBwb3N0IGJhY2sgdG8gdGhlXG4vLyBwYWdlIGNhcnJpZXMgdGhpcyB0b2tlbiBzbyBhIHNhbWUtcGFnZSBzY3JpcHQgdGhhdCBvbmx5IHNhdyB0aGUgcmVxdWVzdFxuLy8gYnJvYWRjYXN0IGNhbm5vdCBmb3JnZSBhIHJlc3BvbnNlLlxuY29uc3QgTktfQ0hBTk5FTF9UT0tFTiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG5cbnNob3VsZEluamVjdCgpLnRoZW4oaW5qZWN0ID0+IHtcbiAgICBpZiAoIWluamVjdCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBhcGkucnVudGltZS5nZXRVUkwoJ25vc3RyLmJ1aWxkLmpzJykpO1xuICAgIHNjcmlwdC5kYXRhc2V0Lm5rVG9rZW4gPSBOS19DSEFOTkVMX1RPS0VOO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgIC8vIFJlc2V0IGF1dG8tbG9jayB0aW1lciB3aGVuIGEgTm9zdHItZW5hYmxlZCB0YWIgZ2FpbnMgZm9jdXNcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAndmlzaWJsZScpIHtcbiAgICAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QXV0b0xvY2snIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbi8vIFx1MjUwMFx1MjUwMCBBcHBlYXJhbmNlIGZvciBpbmplY3RlZCBjaHJvbWUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgaW5qZWN0ZWQgY29uc2VudCBjaHJvbWUgKGxvY2tlZCBzaGVldCwgcGVybWlzc2lvbi1zaGVldCB3cmFwcGVyLCBGQUIpXG4vLyBmb2xsb3dzIHRoZSB1c2VyJ3MgQXBwZWFyYW5jZSBwcmVmcyAoYTExeV9wcmVmcyBcdTIxOTIgTE9PSyBcdTAwRDcgTU9ERSArIHJlZHVjZVxuLy8gbW90aW9uKS4gU0VDVVJJVFk6IHN0b3JhZ2UgdmFsdWVzIG9ubHkgZXZlciBTRUxFQ1Qgb25lIG9mIHRoZXNlIGhhcmRjb2RlZFxuLy8gbGl0ZXJhbCBwYWxldHRlcyBcdTIwMTQgbm8gc3RvcmFnZS1kZXJpdmVkIHN0cmluZyBpcyBpbnRlcnBvbGF0ZWQgaW50byBpbmplY3RlZFxuLy8gbWFya3VwLiBWYWx1ZXMgY29waWVkIHZlcmJhdGltIGZyb20gaW5zdHJ1bWVudC5jc3Mgc2tpbiB0b2tlbnMuXG5jb25zdCBOS19QQUxFVFRFUyA9IHtcbiAgICAnaW5zdHJ1bWVudC1kYXJrJzogIHsgYmFzZTogJyMwRTBGMTMnLCBwYW5lbDogJyMxNjE4MUQnLCBoYWlyOiAnIzJBMkUzNycsIHRleHQ6ICcjRTdFOUVFJywgbXV0ZWQ6ICcjOEE5MEEwJywgc2lnbmFsOiAnI2MwODRmYycsIHNpZ25hbERpbTogJ3JnYmEoMTkyLDEzMiwyNTIsMC4xNiknIH0sXG4gICAgJ2luc3RydW1lbnQtbGlnaHQnOiB7IGJhc2U6ICcjRjRGNUY3JywgcGFuZWw6ICcjRkZGRkZGJywgaGFpcjogJyNEQ0RGRTYnLCB0ZXh0OiAnIzE5MUIyMicsIG11dGVkOiAnIzYyNjg3OCcsIHNpZ25hbDogJyM3QzNBRUQnLCBzaWduYWxEaW06ICdyZ2JhKDEyNCw1OCwyMzcsMC4xMiknIH0sXG4gICAgJ2FuYWxvZy1kYXJrJzogICAgICB7IGJhc2U6ICcjMTQxMjEwJywgcGFuZWw6ICcjMUMxODE1JywgaGFpcjogJyMzNTJFMjUnLCB0ZXh0OiAnI0VERTZEQScsIG11dGVkOiAnI0EyOTM3QycsIHNpZ25hbDogJyNmYmJmMjQnLCBzaWduYWxEaW06ICdyZ2JhKDI1MSwxOTEsMzYsMC4xNCknIH0sXG4gICAgJ2FuYWxvZy1saWdodCc6ICAgICB7IGJhc2U6ICcjRjRFQUQ2JywgcGFuZWw6ICcjRkNGNkU4JywgaGFpcjogJyNEQkNBQTQnLCB0ZXh0OiAnIzMzMjYwRicsIG11dGVkOiAnIzcyNjEzQScsIHNpZ25hbDogJyM5ODRFMDknLCBzaWduYWxEaW06ICdyZ2JhKDE1Miw3OCw5LDAuMTIpJyB9LFxuICAgICdjb25zb2xlLWRhcmsnOiAgICAgeyBiYXNlOiAnIzBCMTIyMCcsIHBhbmVsOiAnIzExMUEyQicsIGhhaXI6ICcjMjQzMTRBJywgdGV4dDogJyNFNkVERjYnLCBtdXRlZDogJyM4MzkxQTgnLCBzaWduYWw6ICcjMmRkNGJmJywgc2lnbmFsRGltOiAncmdiYSg0NSwyMTIsMTkxLDAuMTUpJyB9LFxuICAgICdjb25zb2xlLWxpZ2h0JzogICAgeyBiYXNlOiAnI0YxRjVGOScsIHBhbmVsOiAnI0ZGRkZGRicsIGhhaXI6ICcjRDJEQkU2JywgdGV4dDogJyMwRjE3MkEnLCBtdXRlZDogJyM1QjY4NzknLCBzaWduYWw6ICcjMEE3NjZDJywgc2lnbmFsRGltOiAncmdiYSgxMCwxMTgsMTA4LDAuMTIpJyB9LFxufTtcblxubGV0IG5rTG9va1Byb21pc2UgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiByZWFkTmtMb29rKCkge1xuICAgIGxldCBwcmVmcyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KCdhMTF5X3ByZWZzJyk7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEuYTExeV9wcmVmcyAmJiB0eXBlb2YgZGF0YS5hMTF5X3ByZWZzID09PSAnb2JqZWN0JykgcHJlZnMgPSBkYXRhLmExMXlfcHJlZnM7XG4gICAgfSBjYXRjaCAoXykgeyAvKiBzeW5jIHVuYXZhaWxhYmxlIFx1MjAxNCBmYWxsIHRocm91Z2ggKi8gfVxuICAgIGlmICghcHJlZnMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoJ2ExMXlfcHJlZnMnKTtcbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuYTExeV9wcmVmcyAmJiB0eXBlb2YgZGF0YS5hMTF5X3ByZWZzID09PSAnb2JqZWN0JykgcHJlZnMgPSBkYXRhLmExMXlfcHJlZnM7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogc3RvcmFnZSB1bmF2YWlsYWJsZSBcdTIwMTQgZGVmYXVsdHMgYmVsb3cgKi8gfVxuICAgIH1cbiAgICBwcmVmcyA9IHByZWZzIHx8IHt9O1xuICAgIC8vIE1pcnJvcnMgYTExeS5qcyBzYW5pdGl6ZSgpOiB1bmtub3duIHZhbHVlcyBmYWxsIGJhY2sgdG8gZGVmYXVsdHMuXG4gICAgY29uc3QgdGhlbWUgPSBbJ2luc3RydW1lbnQnLCAnYW5hbG9nJywgJ2NvbnNvbGUnXS5pbmNsdWRlcyhwcmVmcy50aGVtZSkgPyBwcmVmcy50aGVtZSA6ICdjb25zb2xlJztcbiAgICBsZXQgbW9kZSA9IFsnZGFyaycsICdsaWdodCcsICdzeXN0ZW0nXS5pbmNsdWRlcyhwcmVmcy5tb2RlKSA/IHByZWZzLm1vZGUgOiAnZGFyayc7XG4gICAgaWYgKG1vZGUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtb2RlID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpJykubWF0Y2hlcyA/ICdsaWdodCcgOiAnZGFyayc7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIG1vZGUgPSAnZGFyayc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogTktfUEFMRVRURVNbdGhlbWUgKyAnLScgKyBtb2RlXSB8fCBOS19QQUxFVFRFU1snY29uc29sZS1kYXJrJ10sXG4gICAgICAgIHJlZHVjZU1vdGlvbjogcHJlZnMucmVkdWNlTW90aW9uID09PSB0cnVlLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldE5rTG9vaygpIHtcbiAgICBpZiAoIW5rTG9va1Byb21pc2UpIG5rTG9va1Byb21pc2UgPSByZWFkTmtMb29rKCk7XG4gICAgcmV0dXJuIG5rTG9va1Byb21pc2U7XG59XG5cbi8vIFJlLXJlc29sdmUgb24gcHJlZiBjaGFuZ2VzIChBcHBlYXJhbmNlIGVkaXRlZCBpbiBhbm90aGVyIHN1cmZhY2UpLlxudHJ5IHtcbiAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWEpID0+IHtcbiAgICAgICAgaWYgKChhcmVhID09PSAnc3luYycgfHwgYXJlYSA9PT0gJ2xvY2FsJykgJiYgY2hhbmdlcy5hMTF5X3ByZWZzKSBua0xvb2tQcm9taXNlID0gbnVsbDtcbiAgICB9KTtcbn0gY2F0Y2ggKF8pIHsgLyogb25DaGFuZ2VkIHVuYXZhaWxhYmxlIFx1MjAxNCBjYWNoZSBzaW1wbHkgcGVyc2lzdHMgKi8gfVxuXG4vLyBcdTI1MDBcdTI1MDAgSW5qZWN0ZWQtc3VyZmFjZSBpc29sYXRpb24gKGNsaWNramFja2luZyAvIFVJLXJlZHJlc3MgZGVmZW5zZSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBFdmVyeSBpbmplY3RlZCBvdmVybGF5IChsb2NrZWQgc2hlZXQsIHBlcm1pc3Npb24gY29uc2VudCBzaGVldCwgRkFCKSBtb3VudHNcbi8vIGluc2lkZSBhIENMT1NFRCBzaGFkb3cgcm9vdCBvbiBhIGhhcmRlbmVkIGhvc3QuIFR3byB0aGluZ3MgdGhpcyBidXlzIHVzOlxuLy8gICAxLiBQYWdlIENTUyBzZWxlY3RvcnMgY2Fubm90IHJlYWNoIHRoZSBpbnRlcm5hbCBub2RlcyAobm8gcmVzdHlsaW5nIHRoZVxuLy8gICAgICBjb25zZW50IGlmcmFtZSBcdTIwMTQgZS5nLiB0aGUgY2xhc3NpYyBvcGFjaXR5Oi4wMiFpbXBvcnRhbnQgcmVkcmVzcyBhdHRhY2spLlxuLy8gICAyLiBUaGUgaG9zdCBsaXZlcyBpbiB0aGUgcGFnZSdzIGxpZ2h0IERPTS4gUGlubmluZyB0aGUgaG9zdCdzIE9XTlxuLy8gICAgICBjb21wb3NpdGluZyBwcm9wZXJ0aWVzIGlubGluZSB3aXRoICFpbXBvcnRhbnQgYmVhdHMgYW55IGF1dGhvciBzdHlsZXNoZWV0XG4vLyAgICAgICFpbXBvcnRhbnQsIHNvIHRoZSBwYWdlIGNhbm5vdCByZXN0eWxlIHRoZSBob3N0IGl0c2VsZiB0cmFuc3BhcmVudCAvXG4vLyAgICAgIHRyYW5zZm9ybWVkIC8gZmlsdGVyZWQuXG4vLyBMSU1JVFMgXHUyMDE0IHJlYWQgYmVmb3JlIHRydXN0aW5nIHRoaXMgYXMgYW50aS1jbGlja2phY2tpbmcgKGl0IGlzIE5PVCBzdWZmaWNpZW50KTpcbi8vICAgXHUyMDIyIElubGluZSBwaW5zIG9ubHkgZ292ZXJuIHRoZSBob3N0J3Mgb3duIGJveC4gVGhleSBkbyBOT1QgZGVmZW5kIGFnYWluc3QgYW5cbi8vICAgICBBTkNFU1RPUiBlZmZlY3Q6IGJlY2F1c2UgdGhlIHBhZ2UgaGFzIERPTSB3cml0ZSBhY2Nlc3MgdG8gZG9jdW1lbnQuYm9keSxcbi8vICAgICBpdCBjYW4gd3JhcCBvciByZS1wYXJlbnQgb3VyIGhvc3QgdW5kZXIgYW4gYXR0YWNrZXIgZWxlbWVudCB3aXRoXG4vLyAgICAgb3BhY2l0eTwxIC8gZmlsdGVyIC8gdHJhbnNmb3JtLiBHcm91cC9jb21wb3NpdGluZyBlZmZlY3RzIGFwcGx5IHRvIHRoZVxuLy8gICAgIHdob2xlIHN1YnRyZWUgYW5kIGEgZGVzY2VuZGFudCBjYW5ub3Qgb3B0IG91dCBcdTIwMTQgc28gdGhlIGhvc3QgY2FuIHN0aWxsIGJlXG4vLyAgICAgcmVuZGVyZWQgfnRyYW5zcGFyZW50LWJ1dC1jbGlja2FibGUgYW5kIGEgY2xpY2sgbHVyZWQgb250byB0aGUgcmVhbCBBbGxvdy5cbi8vICAgXHUyMDIyIEEgcGFnZSBjYW4gYWxzbyBwYWludCBpdHMgT1dOIGRlY295IGF0IHRoZSBzYW1lIG1heCB6LWluZGV4IG92ZXIgdGhlIHNoZWV0LlxuLy8gSW4tcGFnZSBjb25zZW50IGVtYmVkZGVkIGJ5IGFuIHVudHJ1c3RlZCBwYWdlIGlzIElOSEVSRU5UTFkgcmVkcmVzcy1leHBvc2VkO1xuLy8gb25seSB0aGUgdGFiIGZhbGxiYWNrIChjaHJvbWU6Ly8sIFBERiwgYnVua2VyKSBpcyBmdWxseSByZWRyZXNzLWltbXVuZS4gVGhlXG4vLyBzaGFkb3cgcm9vdCArIGhvc3QgcGlucyBjbG9zZSB0aGUgdHJpdmlhbCBwYWdlLUNTUyByZXN0eWxlLCBub3QgcmUtcGFyZW50aW5nLlxuLy8gVGhpcyBzdGlsbCBob2xkcyByZWdhcmRsZXNzIFx1MjAxNCB0aGUgQWxsb3cgdmVyYiBuZXZlciBsaXZlcyBpbiBwYWdlIERPTSwgc28gdGhpc1xuLy8gaXMgYSBkZWZlYXQtdGhlLWh1bWFuIHJpc2ssIG5vdCBhIGZvcmdlLWNvbnNlbnQtd2l0aG91dC1hLWNsaWNrIG9uZS5cbmZ1bmN0aW9uIG1vdW50U2hhZG93SG9zdCgpIHtcbiAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgcGluID0gKHByb3AsIHZhbCkgPT4gaG9zdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wLCB2YWwsICdpbXBvcnRhbnQnKTtcbiAgICBwaW4oJ2FsbCcsICdpbml0aWFsJyk7XG4gICAgcGluKCdwb3NpdGlvbicsICdmaXhlZCcpO1xuICAgIHBpbigndG9wJywgJzAnKTtcbiAgICBwaW4oJ2xlZnQnLCAnMCcpO1xuICAgIHBpbignd2lkdGgnLCAnMCcpO1xuICAgIHBpbignaGVpZ2h0JywgJzAnKTtcbiAgICBwaW4oJ3otaW5kZXgnLCAnMjE0NzQ4MzY0NycpO1xuICAgIHBpbignb3BhY2l0eScsICcxJyk7XG4gICAgcGluKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICBwaW4oJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICBwaW4oJ3RyYW5zZm9ybScsICdub25lJyk7XG4gICAgcGluKCdmaWx0ZXInLCAnbm9uZScpO1xuICAgIHBpbignbWl4LWJsZW5kLW1vZGUnLCAnbm9ybWFsJyk7XG4gICAgcGluKCdwb2ludGVyLWV2ZW50cycsICdhdXRvJyk7XG4gICAgY29uc3Qgcm9vdCA9IGhvc3QuYXR0YWNoU2hhZG93KHsgbW9kZTogJ2Nsb3NlZCcgfSk7XG4gICAgLy8gTW91bnQgb24gPGh0bWw+LCBub3QgPGJvZHk+OiB0aGlzIG1ha2VzIDxodG1sPiB0aGUgT05MWSBhbmNlc3Rvciwgc2hyaW5raW5nXG4gICAgLy8gdGhlIHN1cmZhY2UgZm9yIGFuIGFuY2VzdG9yIGdyb3VwLWVmZmVjdCAob3BhY2l0eS9maWx0ZXIvdHJhbnNmb3JtKSByZWRyZXNzXG4gICAgLy8gdG8gYSBzaW5nbGUgZWxlbWVudCB0aGUgc2hlZXQgZ3VhcmQgd2F0Y2hlcy5cbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaG9zdCk7XG4gICAgcmV0dXJuIHsgaG9zdCwgcm9vdCB9O1xufVxuXG4vLyBMb2NrZWQgbm90aWZpY2F0aW9uIHNoZWV0IFx1MjAxNCBzaG93biB3aGVuIGEgc2l0ZSBuZWVkcyB0aGUgcHJpdmF0ZSBrZXlcbi8vIGJ1dCB0aGUgZXh0ZW5zaW9uIGlzIGxvY2tlZC4gU2hvd3MgZXZlcnkgdGltZSB1bnRpbCB1bmxvY2tlZC5cbmxldCBsb2NrZWRTaGVldEhvc3QgPSBudWxsO1xubGV0IGxvY2tlZFNoZWV0RWwgPSBudWxsO1xubGV0IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBzaG93TG9ja2VkU2hlZXQoZmlyc3RVbmxvY2spIHtcbiAgICAvLyBJZiBhbHJlYWR5IHZpc2libGUsIHJlc2V0IHRoZSBhdXRvLWRpc21pc3MgdGltZXJcbiAgICBpZiAobG9ja2VkU2hlZXRFbCAmJiBsb2NrZWRTaGVldEVsLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgaWYgKGxvY2tlZFNoZWV0VGltZXIpIGNsZWFyVGltZW91dChsb2NrZWRTaGVldFRpbWVyKTtcbiAgICAgICAgbG9ja2VkU2hlZXRUaW1lciA9IHNldFRpbWVvdXQoZGlzbWlzc0xvY2tlZFNoZWV0LCA1MDAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcCwgcmVkdWNlTW90aW9uIH0gPSBhd2FpdCBnZXROa0xvb2soKTtcblxuICAgIC8vIFJlbW92ZSBhbnkgc3RhbGUgc2hlZXQgKGluY2x1ZGluZyBvbmUgY3JlYXRlZCB3aGlsZSB3ZSBhd2FpdGVkKVxuICAgIGlmIChsb2NrZWRTaGVldEhvc3QpIGxvY2tlZFNoZWV0SG9zdC5yZW1vdmUoKTtcblxuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3Qgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzaGVldC5pZCA9ICdub3N0cmtleS1sb2NrZWQtc2hlZXQnO1xuICAgIHNoZWV0LmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgICAgIHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgICBpbnNldDogMDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuNSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQuYWN0aXZlIC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnBhbmVsfTtcbiAgICAgICAgICAgICAgICBib3JkZXItdG9wOiAxcHggc29saWQgJHtwLmhhaXJ9O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHggMTZweCAwIDA7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMjRweDtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTAwJSk7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZTtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIC00cHggMjBweCByZ2JhKDAsMCwwLDAuMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0LmFjdGl2ZSAubmstc2hlZXQge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWhhbmRsZSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA0cHg7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLmhhaXJ9O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxNnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstaWNvbiB7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAzMnB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstdGl0bGUge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AudGV4dH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXRleHQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AudGV4dH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS41O1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDRweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLW11dGVkIHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLm11dGVkfTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAxNHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAke3Auc2lnbmFsfTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsRGltfTtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLnNpZ25hbH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDIwcHg7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjE1cyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsRGltfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICR7cmVkdWNlTW90aW9uID8gYCNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJhY2tkcm9wLFxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstc2hlZXQgeyB0cmFuc2l0aW9uOiBub25lOyB9YCA6ICcnfVxuICAgICAgICAgICAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1iYWNrZHJvcCxcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1zaGVldCB7IHRyYW5zaXRpb246IG5vbmU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1zaGVldFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWhhbmRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWljb25cIj4mI3gxRjUxMjs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10aXRsZVwiPiR7Zmlyc3RVbmxvY2sgPyAnTm9zdHJLZXkgTmVlZHMgdG8gRGVjcnlwdCBZb3VyIEtleXMnIDogJ05vc3RyS2V5IGlzIExvY2tlZCd9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstdGV4dFwiPiR7Zmlyc3RVbmxvY2tcbiAgICAgICAgICAgICAgICA/ICdUaGlzIHNpdGUgaXMgcmVxdWVzdGluZyB5b3VyIE5vc3RyIGlkZW50aXR5LiBFbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZCB0byBkZWNyeXB0IHlvdXIga2V5IHZhdWx0IGZvciB0aGlzIHNlc3Npb24uJ1xuICAgICAgICAgICAgICAgIDogJ1RoaXMgc2l0ZSBuZWVkcyB5b3VyIGtleSB0byBzaWduIG9yIGVuY3J5cHQuJ308L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1tdXRlZFwiPkNsaWNrIHRoZSBOb3N0cktleSBpY29uIGluIHlvdXIgdG9vbGJhciBhbmQgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibmstYnRuXCI+R290IGl0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChzaGVldCk7XG4gICAgbG9ja2VkU2hlZXRIb3N0ID0gaG9zdDtcbiAgICBsb2NrZWRTaGVldEVsID0gc2hlZXQ7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHNoZWV0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTtcblxuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJy5uay1idG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3NMb2NrZWRTaGVldCk7XG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzTG9ja2VkU2hlZXQpO1xuXG4gICAgLy8gQXV0by1kaXNtaXNzIGFmdGVyIDUgc2Vjb25kc1xuICAgIGxvY2tlZFNoZWV0VGltZXIgPSBzZXRUaW1lb3V0KGRpc21pc3NMb2NrZWRTaGVldCwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIGRpc21pc3NMb2NrZWRTaGVldCgpIHtcbiAgICBpZiAobG9ja2VkU2hlZXRUaW1lcikgeyBjbGVhclRpbWVvdXQobG9ja2VkU2hlZXRUaW1lcik7IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsOyB9XG4gICAgaWYgKCFsb2NrZWRTaGVldEVsKSByZXR1cm47XG4gICAgbG9ja2VkU2hlZXRFbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBjb25zdCBob3N0ID0gbG9ja2VkU2hlZXRIb3N0O1xuICAgIGxvY2tlZFNoZWV0RWwgPSBudWxsO1xuICAgIGxvY2tlZFNoZWV0SG9zdCA9IG51bGw7XG4gICAgc2V0VGltZW91dCgoKSA9PiBob3N0ICYmIGhvc3QucmVtb3ZlKCksIDMwMCk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBQZXJtaXNzaW9uIGNvbnNlbnQgc2hlZXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgQWxsb3cvRGVueSBVSSBpcyBhbiBFWFRFTlNJT04tT1dORUQgaWZyYW1lIChwZXJtaXNzaW9uL3Blcm1pc3Npb24uaHRtbClcbi8vIGluamVjdGVkIGFzIGEgZGltbWVkIGJvdHRvbSBzaGVldCwgc28gdGhlIHVzZXIga2VlcHMgdGhlIHNpdGUgaW4gdmlldyBmb3Jcbi8vIGluZm9ybWVkIGNvbnNlbnQuIEJlY2F1c2UgdGhlIGlmcmFtZSBpcyBhIGNyb3NzLW9yaWdpbiBleHRlbnNpb24gcGFnZSwgdGhlXG4vLyB3ZWIgcGFnZSBDQU5OT1Qgc2NyaXB0IGludG8gaXQgb3IgY2xpY2sgQWxsb3cgXHUyMDE0IHRoZSBwcm90ZWN0aW9uIGhvbGRzLlxuLy8gVGhlIGJhY2tkcm9wIGFuZCB0aGUgbWluaW1pemVkIEZBQiAodGhpcyBmaWxlLCBwYWdlIERPTSkgY2FycnkgTk8gY29uc2VudFxuLy8gYWN0aW9uOyB0aGV5IG9ubHkgc2hvdy9oaWRlIHRoZSBzaGVldCwgc28gdGhleSBhcmUgc2FmZSB0byBsaXZlIGluIHRoZSBwYWdlLlxubGV0IHBlcm1TaGVldEhvc3QgPSBudWxsO1xubGV0IHBlcm1TaGVldEVsID0gbnVsbDtcbmxldCBwZXJtRmFiSG9zdCA9IG51bGw7XG5sZXQgcGVybUZhYkVsID0gbnVsbDtcbmxldCBwZXJtU2hlZXRTcmMgPSBudWxsO1xuXG4vLyBHZW5lcmF0aW9uIGNvdW50ZXIgZ3VhcmRpbmcgdGhlIGFzeW5jIGdhcCBpbiBzaG93UGVybWlzc2lvblNoZWV0IC9cbi8vIHNob3dQZXJtaXNzaW9uRmFiOiBhIGNsb3NlUGVybWlzc2lvblNoZWV0IChvciBhIG5ld2VyIHNob3cpIGFycml2aW5nIHdoaWxlXG4vLyB0aGUgYXBwZWFyYW5jZSByZWFkIGlzIGluIGZsaWdodCBidW1wcyB0aGUgY291bnRlciwgc28gdGhlIHN0YWxlIGNhbGwgYmFpbHNcbi8vIGluc3RlYWQgb2YgcmVzdXJyZWN0aW5nIGEgc2hlZXQgdGhlIGJhY2tncm91bmQgYWxyZWFkeSBjbG9zZWQuXG5sZXQgbmtQZXJtR2VuID0gMDtcblxuYXN5bmMgZnVuY3Rpb24gc2hvd1Blcm1pc3Npb25TaGVldChzcmMpIHtcbiAgICBwZXJtU2hlZXRTcmMgPSBzcmM7XG4gICAgY29uc3QgZ2VuID0gKytua1Blcm1HZW47XG4gICAgY29uc3QgeyBwLCByZWR1Y2VNb3Rpb24gfSA9IGF3YWl0IGdldE5rTG9vaygpO1xuICAgIGlmIChnZW4gIT09IG5rUGVybUdlbikgcmV0dXJuOyAvLyBzdXBlcnNlZGVkIHdoaWxlIHdlIGF3YWl0ZWRcbiAgICByZW1vdmVQZXJtaXNzaW9uRmFiKCk7XG4gICAgaWYgKHBlcm1TaGVldEhvc3QpIHBlcm1TaGVldEhvc3QucmVtb3ZlKCk7XG4gICAgY29uc3QgeyBob3N0LCByb290IH0gPSBtb3VudFNoYWRvd0hvc3QoKTtcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsLmlkID0gJ25vc3Rya2V5LXBlcm0tc2hlZXQnO1xuICAgIGVsLmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgeyBwb3NpdGlvbjogZml4ZWQ7IGluc2V0OiAwOyB6LWluZGV4OiAyMTQ3NDgzNjQ3OyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDsgaW5zZXQ6IDA7IGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsMC41KTtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwOyR7cmVkdWNlTW90aW9uID8gJycgOiAnIHRyYW5zaXRpb246IG9wYWNpdHkgLjJzIGVhc2U7J31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0LmFjdGl2ZSAubmstYmFja2Ryb3AgeyBvcGFjaXR5OiAxOyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstZnJhbWUtd3JhcCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkOyBsZWZ0OiAwOyByaWdodDogMDsgYm90dG9tOiAwO1xuICAgICAgICAgICAgICAgIG1heC13aWR0aDogNDYwcHg7IG1hcmdpbjogMCBhdXRvO1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTske3JlZHVjZU1vdGlvbiA/ICcnIDogJyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gLjNzIGVhc2U7J31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0LmFjdGl2ZSAubmstZnJhbWUtd3JhcCB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgaWZyYW1lIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogNzJ2aDsgbWF4LWhlaWdodDogNjQwcHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAwOyBib3JkZXItcmFkaXVzOiAxNnB4IDE2cHggMCAwO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgLTZweCAyOHB4IHJnYmEoMCwwLDAsLjQ1KTsgYmFja2dyb3VuZDogJHtwLmJhc2V9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstYmFja2Ryb3AsXG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWZyYW1lLXdyYXAgeyB0cmFuc2l0aW9uOiBub25lOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1iYWNrZHJvcFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstZnJhbWUtd3JhcFwiPjxpZnJhbWUgdGl0bGU9XCJOb3N0cktleSBwZXJtaXNzaW9uIHJlcXVlc3RcIj48L2lmcmFtZT48L2Rpdj5cbiAgICBgO1xuICAgIGVsLnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpLnNyYyA9IHNyYzsgLy8gc2V0IHZpYSBwcm9wZXJ0eSwgbm90IEhUTUwgaW50ZXJwb2xhdGlvblxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIHBlcm1TaGVldEhvc3QgPSBob3N0O1xuICAgIHBlcm1TaGVldEVsID0gZWw7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTtcbiAgICAvLyBCYWNrZHJvcCBjbGljayBNSU5JTUlTRVMgKHJlcXVlc3Qgc3RheXMgcGVuZGluZykgcmF0aGVyIHRoYW4gZGlzbWlzc2luZy5cbiAgICBlbC5xdWVyeVNlbGVjdG9yKCcubmstYmFja2Ryb3AnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1pbmltaXplUGVybWlzc2lvblNoZWV0KTtcbiAgICAvLyBGYWlsLWNsb3NlZCByZWRyZXNzIGd1YXJkOiB0aGlzIGlzIHRoZSBhY3R1YWwgY29uc2VudCBzdXJmYWNlLCBzbyBpZiB0aGUgcGFnZVxuICAgIC8vIHJlLXBhcmVudHMgb3IgdmlzdWFsbHkgc3VwcHJlc3NlcyBpdCB3ZSB0ZWFyIGl0IGRvd24gKG5vIGNsaWNrIGNhbiBsYW5kIG9uIGFcbiAgICAvLyBoaWRkZW4gQXBwcm92ZSkgYW5kIGVzY2FsYXRlIHRoZSBTQU1FIHBlbmRpbmcgcmVxdWVzdCB0byBhIHJlZHJlc3MtaW1tdW5lIHRhYi5cbiAgICBzdGFydFNoZWV0R3VhcmQoKTtcbn1cblxuZnVuY3Rpb24gbWluaW1pemVQZXJtaXNzaW9uU2hlZXQoKSB7XG4gICAgaWYgKCFwZXJtU2hlZXRIb3N0KSByZXR1cm47XG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICBwZXJtU2hlZXRIb3N0LnJlbW92ZSgpO1xuICAgIHBlcm1TaGVldEhvc3QgPSBudWxsO1xuICAgIHBlcm1TaGVldEVsID0gbnVsbDtcbiAgICBzaG93UGVybWlzc2lvbkZhYigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzaG93UGVybWlzc2lvbkZhYigpIHtcbiAgICBpZiAocGVybUZhYkVsIHx8ICFwZXJtU2hlZXRTcmMpIHJldHVybjtcbiAgICBjb25zdCBnZW4gPSArK25rUGVybUdlbjtcbiAgICBjb25zdCB7IHAsIHJlZHVjZU1vdGlvbiB9ID0gYXdhaXQgZ2V0TmtMb29rKCk7XG4gICAgaWYgKGdlbiAhPT0gbmtQZXJtR2VuKSByZXR1cm47IC8vIHN1cGVyc2VkZWQgd2hpbGUgd2UgYXdhaXRlZFxuICAgIGlmIChwZXJtRmFiRWwgfHwgIXBlcm1TaGVldFNyYykgcmV0dXJuO1xuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3QgZmFiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZmFiLmlkID0gJ25vc3Rya2V5LXBlcm0tZmFiJztcbiAgICBmYWIuaW5uZXJIVE1MID0gYFxuICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgeyBwb3NpdGlvbjogZml4ZWQ7IHJpZ2h0OiAxNnB4OyBib3R0b206IDE2cHg7IHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmOyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWZhYiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4OyBwYWRkaW5nOiAxMnB4IDE2cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOTk5cHg7IGN1cnNvcjogcG9pbnRlcjsgYm9yZGVyOiAxcHggc29saWQgJHtwLnNpZ25hbH07XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnBhbmVsfTsgY29sb3I6ICR7cC50ZXh0fTsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDE4cHggcmdiYSgwLDAsMCwuNCk7JHtyZWR1Y2VNb3Rpb24gPyAnJyA6ICcgYW5pbWF0aW9uOiBuay1mYWItcHVsc2UgMnMgZWFzZS1pbi1vdXQgaW5maW5pdGU7J31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZG90IHsgd2lkdGg6IDhweDsgaGVpZ2h0OiA4cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogJHtwLnNpZ25hbH07IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZmFiLWNkIHsgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtczsgY29sb3I6ICR7cC5tdXRlZH07IGZvbnQtd2VpZ2h0OiA2MDA7IH1cbiAgICAgICAgICAgIEBrZXlmcmFtZXMgbmstZmFiLXB1bHNlIHsgMCUsMTAwJXsgYm94LXNoYWRvdzogMCA0cHggMThweCByZ2JhKDAsMCwwLC40KTt9IDUwJXsgYm94LXNoYWRvdzogMCA0cHggMjRweCAke3Auc2lnbmFsRGltfTt9IH1cbiAgICAgICAgICAgIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIC5uay1mYWIgeyBhbmltYXRpb246IG5vbmU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5rLWZhYlwiIHR5cGU9XCJidXR0b25cIj48c3BhbiBjbGFzcz1cIm5rLWRvdFwiPjwvc3Bhbj5SZXZpZXcgc2lnbmluZyByZXF1ZXN0PHNwYW4gY2xhc3M9XCJuay1mYWItY2RcIj48L3NwYW4+PC9idXR0b24+XG4gICAgYDtcbiAgICByb290LmFwcGVuZENoaWxkKGZhYik7XG4gICAgcGVybUZhYkhvc3QgPSBob3N0O1xuICAgIHBlcm1GYWJFbCA9IGZhYjtcbiAgICBmYWIucXVlcnlTZWxlY3RvcignLm5rLWZhYicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2hvd1Blcm1pc3Npb25TaGVldChwZXJtU2hlZXRTcmMpKTtcbiAgICBzdGFydEZhYkNvdW50ZG93bihmYWIucXVlcnlTZWxlY3RvcignLm5rLWZhYi1jZCcpKTtcbn1cblxuLy8gQSBtaW5pbWl6ZWQgcmVxdWVzdCBrZWVwcyBjb3VudGluZyBkb3duOyBzdXJmYWNlIHRoZSByZW1haW5pbmcgdGltZSBvbiB0aGUgRkFCXG4vLyBzbyBpdCBkb2Vzbid0IHNpbGVudGx5IGV4cGlyZSB3aGlsZSB0dWNrZWQgYXdheS4gRGVhZGxpbmUgaXMgcmVhZCBmcm9tIHRoZVxuLy8gcGVuZGluZyBzaGVldCBVUkwgdGhhdCBiYWNrZ3JvdW5kIHN0YW1wZWQgKD9kZWFkbGluZT0pLlxubGV0IHBlcm1GYWJUaW1lciA9IG51bGw7XG5mdW5jdGlvbiBzdGFydEZhYkNvdW50ZG93bihjZEVsKSB7XG4gICAgc3RvcEZhYkNvdW50ZG93bigpO1xuICAgIGxldCBkZWFkbGluZSA9IDA7XG4gICAgdHJ5IHsgZGVhZGxpbmUgPSBOdW1iZXIobmV3IFVSTChwZXJtU2hlZXRTcmMpLnNlYXJjaFBhcmFtcy5nZXQoJ2RlYWRsaW5lJykpIHx8IDA7IH0gY2F0Y2ggKF8pIHsgLyogbm8tb3AgKi8gfVxuICAgIGlmICghZGVhZGxpbmUgfHwgIWNkRWwpIHJldHVybjtcbiAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCByZW1haW5pbmcgPSBkZWFkbGluZSAtIERhdGUubm93KCk7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkgeyBjZEVsLnRleHRDb250ZW50ID0gJ1x1MDBCNyBleHBpcmVkJzsgc3RvcEZhYkNvdW50ZG93bigpOyByZXR1cm47IH1cbiAgICAgICAgY2RFbC50ZXh0Q29udGVudCA9IGBcdTAwQjcgJHtNYXRoLmNlaWwocmVtYWluaW5nIC8gMTAwMCl9c2A7XG4gICAgfTtcbiAgICB0aWNrKCk7XG4gICAgcGVybUZhYlRpbWVyID0gc2V0SW50ZXJ2YWwodGljaywgMjUwKTtcbn1cbmZ1bmN0aW9uIHN0b3BGYWJDb3VudGRvd24oKSB7XG4gICAgaWYgKHBlcm1GYWJUaW1lcikgeyBjbGVhckludGVydmFsKHBlcm1GYWJUaW1lcik7IHBlcm1GYWJUaW1lciA9IG51bGw7IH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlUGVybWlzc2lvbkZhYigpIHtcbiAgICBzdG9wRmFiQ291bnRkb3duKCk7XG4gICAgaWYgKHBlcm1GYWJIb3N0KSB7IHBlcm1GYWJIb3N0LnJlbW92ZSgpOyBwZXJtRmFiSG9zdCA9IG51bGw7IH1cbiAgICBwZXJtRmFiRWwgPSBudWxsO1xufVxuXG5mdW5jdGlvbiByZW1vdmVQZXJtaXNzaW9uVUkoKSB7XG4gICAgbmtQZXJtR2VuKys7IC8vIGludmFsaWRhdGUgYW55IHNob3cqIHN0aWxsIGF3YWl0aW5nIGl0cyBhcHBlYXJhbmNlIHJlYWRcbiAgICBzdG9wU2hlZXRHdWFyZCgpO1xuICAgIGlmIChwZXJtU2hlZXRIb3N0KSB7IHBlcm1TaGVldEhvc3QucmVtb3ZlKCk7IHBlcm1TaGVldEhvc3QgPSBudWxsOyBwZXJtU2hlZXRFbCA9IG51bGw7IH1cbiAgICByZW1vdmVQZXJtaXNzaW9uRmFiKCk7XG4gICAgcGVybVNoZWV0U3JjID0gbnVsbDtcbn1cblxuLy8gXHUyNTAwXHUyNTAwIFNoZWV0IHJlZHJlc3MgZ3VhcmQgKGZhaWwtY2xvc2VkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8vIFRoZSBjb25zZW50IGlmcmFtZSBsaXZlcyBpbiBwYWdlIGxpZ2h0IERPTSwgc28gYSBwYWdlIHdpdGggRE9NLXdyaXRlIGFjY2VzcyBjYW5cbi8vIHN0aWxsIHJlLXBhcmVudCBvdXIgaG9zdCB1bmRlciBhIHRyYW5zcGFyZW50IGdyb3VwIChvcGFjaXR5L2ZpbHRlcikgb3Igb3RoZXJ3aXNlXG4vLyBzdXBwcmVzcyBpdCB3aGlsZSBrZWVwaW5nIGl0IGNsaWNrYWJsZSBcdTIwMTQgbHVyaW5nIGEgY2xpY2sgb250byB0aGUgcmVhbCBBcHByb3ZlLlxuLy8gVGhlIGlubGluZSBob3N0IHBpbnMgY2Fubm90IG9wdCBhIHN1YnRyZWUgb3V0IG9mIGFuIEFOQ0VTVE9SIGdyb3VwIGVmZmVjdC4gU28gd2Vcbi8vIGFjdGl2ZWx5IHdhdGNoOiBpZiB0aGUgc3VyZmFjZSBzdG9wcyBiZWluZyBmdWxseSB2aXNpYmxlIC8gY29ycmVjdGx5IHBhcmVudGVkLFxuLy8gd2UgZGVzdHJveSBpdCAobm90aGluZyBsZWZ0IHRvIG1pcy1jbGljaykgYW5kIGhhbmQgdGhlIHJlcXVlc3QgdG8gdGhlIHRhYiwgd2hpY2hcbi8vIHRoZSBwYWdlIGNhbm5vdCBzdHlsZSBhdCBhbGwuXG5sZXQgc2hlZXRHdWFyZE9ic2VydmVyID0gbnVsbDtcbmxldCBzaGVldEd1YXJkVGltZXIgPSBudWxsO1xuXG5mdW5jdGlvbiBzdHlsZVN1cHByZXNzZXMoY3MpIHtcbiAgICBpZiAoIWNzKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChjcy5vcGFjaXR5KSA8IDAuOVxuICAgICAgICB8fCBjcy52aXNpYmlsaXR5ICE9PSAndmlzaWJsZSdcbiAgICAgICAgfHwgY3MuZGlzcGxheSA9PT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLnBvaW50ZXJFdmVudHMgPT09ICdub25lJ1xuICAgICAgICB8fCBjcy5maWx0ZXIgIT09ICdub25lJ1xuICAgICAgICB8fCBjcy50cmFuc2Zvcm0gIT09ICdub25lJ1xuICAgICAgICB8fCBjcy5taXhCbGVuZE1vZGUgIT09ICdub3JtYWwnXG4gICAgICAgIHx8IGNzLmNsaXBQYXRoICE9PSAnbm9uZSdcbiAgICAgICAgfHwgY3MucGVyc3BlY3RpdmUgIT09ICdub25lJ1xuICAgICAgICB8fCBjcy5jb250ZW50VmlzaWJpbGl0eSA9PT0gJ2hpZGRlbidcbiAgICAgICAgfHwgKGNzLm1hc2sgJiYgY3MubWFzayAhPT0gJ25vbmUnKVxuICAgICAgICB8fCAoY3Mud2Via2l0TWFzayAmJiBjcy53ZWJraXRNYXNrICE9PSAnbm9uZScpXG4gICAgICAgIHx8IChjcy5iYWNrZHJvcEZpbHRlciAmJiBjcy5iYWNrZHJvcEZpbHRlciAhPT0gJ25vbmUnKTtcbn1cblxuZnVuY3Rpb24gc2hlZXRMb29rc0NvbXByb21pc2VkKCkge1xuICAgIGNvbnN0IGhvc3QgPSBwZXJtU2hlZXRIb3N0O1xuICAgIGlmICghaG9zdCB8fCAhaG9zdC5pc0Nvbm5lY3RlZCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGhvc3QucGFyZW50Tm9kZSAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm4gdHJ1ZTsgLy8gcmUtcGFyZW50ZWRcbiAgICB0cnkge1xuICAgICAgICBpZiAoc3R5bGVTdXBwcmVzc2VzKGdldENvbXB1dGVkU3R5bGUoaG9zdCkpKSByZXR1cm4gdHJ1ZTsgICAgICAgLy8gaG9zdCBib3hcbiAgICAgICAgaWYgKHN0eWxlU3VwcHJlc3NlcyhnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkpKSByZXR1cm4gdHJ1ZTsgLy8gc29sZSBhbmNlc3RvclxuICAgICAgICBjb25zdCBpZnJhbWUgPSBwZXJtU2hlZXRFbCAmJiBwZXJtU2hlZXRFbC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKTtcbiAgICAgICAgaWYgKCFpZnJhbWUpIHJldHVybiB0cnVlO1xuICAgICAgICBjb25zdCBpZmNzID0gZ2V0Q29tcHV0ZWRTdHlsZShpZnJhbWUpO1xuICAgICAgICBpZiAocGFyc2VGbG9hdChpZmNzLm9wYWNpdHkpIDwgMC45IHx8IGlmY3MudmlzaWJpbGl0eSAhPT0gJ3Zpc2libGUnKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBpZiB3ZSBjYW4ndCB2ZXJpZnksIGZhaWwgY2xvc2VkXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gb25TaGVldENvbXByb21pc2VkKCkge1xuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgcmVtb3ZlUGVybWlzc2lvblVJKCk7IC8vIGRlc3Ryb3kgdGhlIGluLXBhZ2Ugc3VyZmFjZSBcdTIwMTQgbm8gaGlkZGVuIEFwcHJvdmUgdG8gY2xpY2tcbiAgICAvLyBBc2sgdGhlIGJhY2tncm91bmQgdG8gcmVvcGVuIHRoZSBTQU1FIHBlbmRpbmcgcHJvbXB0IGFzIGEgZGVkaWNhdGVkIHRhYi5cbiAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdwZXJtaXNzaW9uU2hlZXRDb21wcm9taXNlZCcgfSkuY2F0Y2goKCkgPT4ge30pO1xufVxuXG5mdW5jdGlvbiBzdGFydFNoZWV0R3VhcmQoKSB7XG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICB0cnkge1xuICAgICAgICBzaGVldEd1YXJkT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2hlZXRMb29rc0NvbXByb21pc2VkKCkpIG9uU2hlZXRDb21wcm9taXNlZCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gY2hpbGRMaXN0L3N1YnRyZWUgY2F0Y2hlcyByZS1wYXJlbnRpbmc7IHN0eWxlL2NsYXNzIGF0dHJzIGNhdGNoIGEgcGFnZVxuICAgICAgICAvLyBkcm9wcGluZyBhIGZpbHRlci9vcGFjaXR5IG9udG8gPGh0bWw+IG9yIHdyYXBwaW5nIG91ciBob3N0LlxuICAgICAgICBzaGVldEd1YXJkT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnc3R5bGUnLCAnY2xhc3MnXSxcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKF8pIHsgLyogb2JzZXJ2ZXIgdW5hdmFpbGFibGUgXHUyMDE0IHBvbGwgc3RpbGwgY292ZXJzIHVzICovIH1cbiAgICAvLyBCYWNrc3RvcCBmb3IgZWZmZWN0cyBhIG11dGF0aW9uIGNhbid0IHN1cmZhY2UgKHN0eWxlc2hlZXQgc3dhcHMsIDpob3ZlciBydWxlcykuXG4gICAgc2hlZXRHdWFyZFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoc2hlZXRMb29rc0NvbXByb21pc2VkKCkpIG9uU2hlZXRDb21wcm9taXNlZCgpO1xuICAgIH0sIDIwMCk7XG59XG5cbmZ1bmN0aW9uIHN0b3BTaGVldEd1YXJkKCkge1xuICAgIGlmIChzaGVldEd1YXJkT2JzZXJ2ZXIpIHsgc2hlZXRHdWFyZE9ic2VydmVyLmRpc2Nvbm5lY3QoKTsgc2hlZXRHdWFyZE9ic2VydmVyID0gbnVsbDsgfVxuICAgIGlmIChzaGVldEd1YXJkVGltZXIpIHsgY2xlYXJJbnRlcnZhbChzaGVldEd1YXJkVGltZXIpOyBzaGVldEd1YXJkVGltZXIgPSBudWxsOyB9XG59XG5cbi8vIE1pbmltaXNlIHNpZ25hbCBmcm9tIGluc2lkZSB0aGUgcGVybWlzc2lvbiBpZnJhbWUgKGV4dGVuc2lvbiBvcmlnaW4pLiBUaGlzIGlzIGFcbi8vIGhhcm1sZXNzIFVJIGFjdGlvbiAoaGlkZSB0aGUgc2hlZXQpLCBzbyBjb25maXJtaW5nIGl0IGNhbWUgZnJvbSBPVVIgaWZyYW1lIGlzXG4vLyBlbm91Z2ggXHUyMDE0IG5vIGNvbnNlbnQgZGVjaXNpb24gdHJhdmVscyB0aGlzIGNoYW5uZWwuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldikgPT4ge1xuICAgIGlmICghcGVybVNoZWV0RWwpIHJldHVybjtcbiAgICBjb25zdCBpZnJhbWUgPSBwZXJtU2hlZXRFbC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKTtcbiAgICBpZiAoIWlmcmFtZSB8fCBldi5zb3VyY2UgIT09IGlmcmFtZS5jb250ZW50V2luZG93KSByZXR1cm47XG4gICAgaWYgKGV2LmRhdGEgJiYgZXYuZGF0YS5fX25vc3Rya2V5X3Blcm0gPT09ICdtaW5pbWl6ZScpIG1pbmltaXplUGVybWlzc2lvblNoZWV0KCk7XG59KTtcblxuLy8gTGlzdGVuIGZvciByZXF1ZXN0cyBmcm9tIGJhY2tncm91bmRcbmFwaS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICAvLyBOT1RFOiBjb25zZW50IChBbGxvdy9EZW55KSBpcyBOT1QgcmVuZGVyZWQgaW4gdGhlIHBhZ2UgRE9NLiBJdCBsaXZlcyBpbiB0aGVcbiAgICAvLyBleHRlbnNpb24tb3duZWQgcGVybWlzc2lvbiBpZnJhbWUgKHNlZSBzaG93UGVybWlzc2lvblNoZWV0KTtcbiAgICAvLyBhIHdlYiBwYWdlIGNhbiBuZWl0aGVyIHNjcmlwdCBpbnRvIGl0IG5vciBjbGljayBBbGxvdy5cbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnc2hvd0xvY2tlZFNoZWV0Jykge1xuICAgICAgICBzaG93TG9ja2VkU2hlZXQobWVzc2FnZS5maXJzdFVubG9jayB8fCBmYWxzZSk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChtZXNzYWdlLmtpbmQgPT09ICdzaG93UGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICBzaG93UGVybWlzc2lvblNoZWV0KG1lc3NhZ2UudXJsKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uua2luZCA9PT0gJ2Nsb3NlUGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICByZW1vdmVQZXJtaXNzaW9uVUkoKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyBtZXNzYWdlID0+IHtcbiAgICAvLyBDMyBmaXg6IE9ubHkgYWNjZXB0IG1lc3NhZ2VzIGZyb20gdGhlIHRvcC1sZXZlbCBwYWdlIGNvbnRleHRcbiAgICBpZiAobWVzc2FnZS5zb3VyY2UgIT09IHdpbmRvdykgcmV0dXJuO1xuXG4gICAgLy8gUGFnZS1yZWFjaGFibGUgbWV0aG9kcyBvbmx5LiBleHBvcnRQcm9maWxlIGFuZCBidW5rZXJTZXJ2ZXIuKiBhcmVcbiAgICAvLyBkZWxpYmVyYXRlbHkgZXhjbHVkZWQgXHUyMDE0IHRob3NlIGFyZSBwcml2aWxlZ2VkIGFuZCBtYXkgb3JpZ2luYXRlIE9OTFkgZnJvbVxuICAgIC8vIHRoZSBleHRlbnNpb24gVUkuXG4gICAgY29uc3QgdmFsaWRFdmVudHMgPSBbXG4gICAgICAgICdnZXRQdWJLZXknLFxuICAgICAgICAnc2lnbkV2ZW50JyxcbiAgICAgICAgJ2dldFJlbGF5cycsXG4gICAgICAgICdhZGRSZWxheScsXG4gICAgICAgICduaXAwNC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDA0LmRlY3J5cHQnLFxuICAgICAgICAnbmlwNDQuZW5jcnlwdCcsXG4gICAgICAgICduaXA0NC5kZWNyeXB0JyxcbiAgICAgICAgJ3JlcGxhY2VVUkwnLFxuICAgIF07XG4gICAgbGV0IHsga2luZCwgcmVxSWQsIHBheWxvYWQgfSA9IG1lc3NhZ2UuZGF0YTtcbiAgICBpZiAoIXZhbGlkRXZlbnRzLmluY2x1ZGVzKGtpbmQpKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBwYXlsb2FkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgICAvLyBOSy0wMzoga2V5IHBlcm1pc3Npb24gZ3JhbnRzIG9uIHRoZSBmdWxsIG9yaWdpbiAoc2NoZW1lK2hvc3RbOnBvcnRdKSxcbiAgICAgICAgICAgIC8vIG5vdCB0aGUgYmFyZSBob3N0LCBzbyBodHRwL2h0dHBzIGFuZCBkaWZmZXJlbnQgcG9ydHMgZG9uJ3Qgc2hhcmUgZ3JhbnRzLlxuICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBwYXlsb2FkID0geyBlcnJvcjogJ2Nvbm5lY3Rpb25fZXJyb3InLCBtZXNzYWdlOiBlLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byByZWFjaCBleHRlbnNpb24gYmFja2dyb3VuZCcgfTtcbiAgICB9XG5cbiAgICBraW5kID0gYHJldHVybl8ke2tpbmR9YDtcblxuICAgIC8vIE5LLTUgLyBOSy02OiBzdGFtcCB0aGUgcHJpdmF0ZSBjaGFubmVsIHRva2VuIGFuZCB0YXJnZXQgdGhpcyBwYWdlJ3Mgb3duXG4gICAgLy8gb3JpZ2luIHNvIGEgc2FtZS1wYWdlIHNjcmlwdCBjYW4ndCBmb3JnZS9vYnNlcnZlIGNyb3NzLW9yaWdpbi5cbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyBraW5kLCByZXFJZCwgcGF5bG9hZCwgdG9rZW46IE5LX0NIQU5ORUxfVE9LRU4gfSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDakY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFR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
