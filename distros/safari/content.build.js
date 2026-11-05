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
    clearTimeout(permFabExpiredTimer);
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
            @media (max-height: 420px) {
                #nostrkey-perm-sheet iframe { height: 92vh; }
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
        <button class="nk-fab" type="button"><span class="nk-dot"></span><span class="nk-fab-label">Review signing request</span><span class="nk-fab-cd"></span></button>
    `;
    root.appendChild(fab);
    permFabHost = host;
    permFabEl = fab;
    fab.querySelector(".nk-fab").addEventListener("click", () => {
      if (permSheetSrc) showPermissionSheet(permSheetSrc);
      else removePermissionUI();
    });
    startFabCountdown(fab.querySelector(".nk-fab-cd"));
  }
  var permFabTimer = null;
  var permFabExpiredTimer = null;
  var FAB_EXPIRED_MS = 2e4;
  var FAB_HOLD_NOTE_MS = 1e4;
  var lastFabHoldNote = 0;
  function holdMinimizedRequest() {
    if (Date.now() - lastFabHoldNote < FAB_HOLD_NOTE_MS) return;
    lastFabHoldNote = Date.now();
    api.runtime.sendMessage({ kind: "holdMinimizedPrompt" })?.catch?.(() => {
    });
  }
  function startFabCountdown(cdEl) {
    stopFabCountdown();
    lastFabHoldNote = 0;
    const deadline = sheetDeadline();
    if (!deadline || !cdEl) return;
    const tick = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        showFabExpired();
        return;
      }
      holdMinimizedRequest();
      cdEl.textContent = `\xB7 ${Math.ceil(remaining / 1e3)}s`;
    };
    tick();
    permFabTimer = setInterval(tick, 250);
  }
  function sheetDeadline() {
    try {
      return Number(new URL(permSheetSrc).searchParams.get("deadline")) || 0;
    } catch (_) {
      return 0;
    }
  }
  function showFabExpired() {
    stopFabCountdown();
    permSheetSrc = null;
    const fab = permFabEl.querySelector(".nk-fab");
    fab.style.animation = "none";
    fab.querySelector(".nk-fab-label").textContent = "Signing request expired";
    fab.querySelector(".nk-fab-cd").textContent = "";
    clearTimeout(permFabExpiredTimer);
    permFabExpiredTimer = setTimeout(removePermissionUI, FAB_EXPIRED_MS);
  }
  function closePermissionUI() {
    if (permFabEl && !permSheetSrc) return;
    const atDeadline = permFabEl && sheetDeadline() && Date.now() >= sheetDeadline() - 500;
    if (atDeadline) showFabExpired();
    else removePermissionUI();
  }
  function stopFabCountdown() {
    if (permFabTimer) {
      clearInterval(permFabTimer);
      permFabTimer = null;
    }
  }
  function removePermissionFab() {
    stopFabCountdown();
    clearTimeout(permFabExpiredTimer);
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
    if (ev.data && ev.data.__nostrkey_perm === "close") removePermissionUI();
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
      closePermissionUI();
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
    } catch {
      payload = { error: "connection_error" };
    }
    if (typeof payload === "object" && payload !== null && typeof payload.error === "string") {
      payload = { error: payload.error };
    }
    kind = `return_${kind}`;
    window.postMessage({ kind, reqId, payload, token: NK_CHANNEL_TOKEN }, window.location.origin);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5hc3luYyBmdW5jdGlvbiBzaG91bGRJbmplY3QoKSB7XG4gICAgaWYgKHdpbmRvdyA9PT0gd2luZG93LnRvcCkgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IGJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXM6IHRydWUgfSk7XG4gICAgICAgIGlmICghZGF0YS5ibG9ja0Nyb3NzT3JpZ2luRnJhbWVzKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICB2b2lkIHdpbmRvdy50b3AubG9jYXRpb24uaHJlZjsgLy8gdGhyb3dzIGZvciBjcm9zcy1vcmlnaW4gZnJhbWVzXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBOSy01OiBwZXItcGFnZS1sb2FkIGNoYW5uZWwgdG9rZW4gc2hhcmVkIHByaXZhdGVseSB3aXRoIHRoZSBpbmplY3RlZFxuLy8gcGFnZS13b3JsZCBzY3JpcHQuIFBhc3NlZCB2aWEgYSBkYXRhIGF0dHJpYnV0ZSB0aGF0IHRoZSBpbmplY3RlZCBzY3JpcHRcbi8vIHJlYWRzIGFuZCBzdHJpcHMgc3luY2hyb25vdXNseSBvbiBsb2FkLiBFdmVyeSByZXNwb25zZSB3ZSBwb3N0IGJhY2sgdG8gdGhlXG4vLyBwYWdlIGNhcnJpZXMgdGhpcyB0b2tlbiBzbyBhIHNhbWUtcGFnZSBzY3JpcHQgdGhhdCBvbmx5IHNhdyB0aGUgcmVxdWVzdFxuLy8gYnJvYWRjYXN0IGNhbm5vdCBmb3JnZSBhIHJlc3BvbnNlLlxuY29uc3QgTktfQ0hBTk5FTF9UT0tFTiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG5cbnNob3VsZEluamVjdCgpLnRoZW4oaW5qZWN0ID0+IHtcbiAgICBpZiAoIWluamVjdCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBhcGkucnVudGltZS5nZXRVUkwoJ25vc3RyLmJ1aWxkLmpzJykpO1xuICAgIHNjcmlwdC5kYXRhc2V0Lm5rVG9rZW4gPSBOS19DSEFOTkVMX1RPS0VOO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgIC8vIFJlc2V0IGF1dG8tbG9jayB0aW1lciB3aGVuIGEgTm9zdHItZW5hYmxlZCB0YWIgZ2FpbnMgZm9jdXNcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAndmlzaWJsZScpIHtcbiAgICAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QXV0b0xvY2snIH0pLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cbi8vIFx1MjUwMFx1MjUwMCBBcHBlYXJhbmNlIGZvciBpbmplY3RlZCBjaHJvbWUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgaW5qZWN0ZWQgY29uc2VudCBjaHJvbWUgKGxvY2tlZCBzaGVldCwgcGVybWlzc2lvbi1zaGVldCB3cmFwcGVyLCBGQUIpXG4vLyBmb2xsb3dzIHRoZSB1c2VyJ3MgQXBwZWFyYW5jZSBwcmVmcyAoYTExeV9wcmVmcyBcdTIxOTIgTE9PSyBcdTAwRDcgTU9ERSArIHJlZHVjZVxuLy8gbW90aW9uKS4gU0VDVVJJVFk6IHN0b3JhZ2UgdmFsdWVzIG9ubHkgZXZlciBTRUxFQ1Qgb25lIG9mIHRoZXNlIGhhcmRjb2RlZFxuLy8gbGl0ZXJhbCBwYWxldHRlcyBcdTIwMTQgbm8gc3RvcmFnZS1kZXJpdmVkIHN0cmluZyBpcyBpbnRlcnBvbGF0ZWQgaW50byBpbmplY3RlZFxuLy8gbWFya3VwLiBWYWx1ZXMgY29waWVkIHZlcmJhdGltIGZyb20gaW5zdHJ1bWVudC5jc3Mgc2tpbiB0b2tlbnMuXG5jb25zdCBOS19QQUxFVFRFUyA9IHtcbiAgICAnaW5zdHJ1bWVudC1kYXJrJzogIHsgYmFzZTogJyMwRTBGMTMnLCBwYW5lbDogJyMxNjE4MUQnLCBoYWlyOiAnIzJBMkUzNycsIHRleHQ6ICcjRTdFOUVFJywgbXV0ZWQ6ICcjOEE5MEEwJywgc2lnbmFsOiAnI2MwODRmYycsIHNpZ25hbERpbTogJ3JnYmEoMTkyLDEzMiwyNTIsMC4xNiknIH0sXG4gICAgJ2luc3RydW1lbnQtbGlnaHQnOiB7IGJhc2U6ICcjRjRGNUY3JywgcGFuZWw6ICcjRkZGRkZGJywgaGFpcjogJyNEQ0RGRTYnLCB0ZXh0OiAnIzE5MUIyMicsIG11dGVkOiAnIzYyNjg3OCcsIHNpZ25hbDogJyM3QzNBRUQnLCBzaWduYWxEaW06ICdyZ2JhKDEyNCw1OCwyMzcsMC4xMiknIH0sXG4gICAgJ2FuYWxvZy1kYXJrJzogICAgICB7IGJhc2U6ICcjMTQxMjEwJywgcGFuZWw6ICcjMUMxODE1JywgaGFpcjogJyMzNTJFMjUnLCB0ZXh0OiAnI0VERTZEQScsIG11dGVkOiAnI0EyOTM3QycsIHNpZ25hbDogJyNmYmJmMjQnLCBzaWduYWxEaW06ICdyZ2JhKDI1MSwxOTEsMzYsMC4xNCknIH0sXG4gICAgJ2FuYWxvZy1saWdodCc6ICAgICB7IGJhc2U6ICcjRjRFQUQ2JywgcGFuZWw6ICcjRkNGNkU4JywgaGFpcjogJyNEQkNBQTQnLCB0ZXh0OiAnIzMzMjYwRicsIG11dGVkOiAnIzcyNjEzQScsIHNpZ25hbDogJyM5ODRFMDknLCBzaWduYWxEaW06ICdyZ2JhKDE1Miw3OCw5LDAuMTIpJyB9LFxuICAgICdjb25zb2xlLWRhcmsnOiAgICAgeyBiYXNlOiAnIzBCMTIyMCcsIHBhbmVsOiAnIzExMUEyQicsIGhhaXI6ICcjMjQzMTRBJywgdGV4dDogJyNFNkVERjYnLCBtdXRlZDogJyM4MzkxQTgnLCBzaWduYWw6ICcjMmRkNGJmJywgc2lnbmFsRGltOiAncmdiYSg0NSwyMTIsMTkxLDAuMTUpJyB9LFxuICAgICdjb25zb2xlLWxpZ2h0JzogICAgeyBiYXNlOiAnI0YxRjVGOScsIHBhbmVsOiAnI0ZGRkZGRicsIGhhaXI6ICcjRDJEQkU2JywgdGV4dDogJyMwRjE3MkEnLCBtdXRlZDogJyM1QjY4NzknLCBzaWduYWw6ICcjMEE3NjZDJywgc2lnbmFsRGltOiAncmdiYSgxMCwxMTgsMTA4LDAuMTIpJyB9LFxufTtcblxubGV0IG5rTG9va1Byb21pc2UgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiByZWFkTmtMb29rKCkge1xuICAgIGxldCBwcmVmcyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KCdhMTF5X3ByZWZzJyk7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEuYTExeV9wcmVmcyAmJiB0eXBlb2YgZGF0YS5hMTF5X3ByZWZzID09PSAnb2JqZWN0JykgcHJlZnMgPSBkYXRhLmExMXlfcHJlZnM7XG4gICAgfSBjYXRjaCAoXykgeyAvKiBzeW5jIHVuYXZhaWxhYmxlIFx1MjAxNCBmYWxsIHRocm91Z2ggKi8gfVxuICAgIGlmICghcHJlZnMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoJ2ExMXlfcHJlZnMnKTtcbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuYTExeV9wcmVmcyAmJiB0eXBlb2YgZGF0YS5hMTF5X3ByZWZzID09PSAnb2JqZWN0JykgcHJlZnMgPSBkYXRhLmExMXlfcHJlZnM7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogc3RvcmFnZSB1bmF2YWlsYWJsZSBcdTIwMTQgZGVmYXVsdHMgYmVsb3cgKi8gfVxuICAgIH1cbiAgICBwcmVmcyA9IHByZWZzIHx8IHt9O1xuICAgIC8vIE1pcnJvcnMgYTExeS5qcyBzYW5pdGl6ZSgpOiB1bmtub3duIHZhbHVlcyBmYWxsIGJhY2sgdG8gZGVmYXVsdHMuXG4gICAgY29uc3QgdGhlbWUgPSBbJ2luc3RydW1lbnQnLCAnYW5hbG9nJywgJ2NvbnNvbGUnXS5pbmNsdWRlcyhwcmVmcy50aGVtZSkgPyBwcmVmcy50aGVtZSA6ICdjb25zb2xlJztcbiAgICBsZXQgbW9kZSA9IFsnZGFyaycsICdsaWdodCcsICdzeXN0ZW0nXS5pbmNsdWRlcyhwcmVmcy5tb2RlKSA/IHByZWZzLm1vZGUgOiAnZGFyayc7XG4gICAgaWYgKG1vZGUgPT09ICdzeXN0ZW0nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBtb2RlID0gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLWNvbG9yLXNjaGVtZTogbGlnaHQpJykubWF0Y2hlcyA/ICdsaWdodCcgOiAnZGFyayc7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIG1vZGUgPSAnZGFyayc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogTktfUEFMRVRURVNbdGhlbWUgKyAnLScgKyBtb2RlXSB8fCBOS19QQUxFVFRFU1snY29uc29sZS1kYXJrJ10sXG4gICAgICAgIHJlZHVjZU1vdGlvbjogcHJlZnMucmVkdWNlTW90aW9uID09PSB0cnVlLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldE5rTG9vaygpIHtcbiAgICBpZiAoIW5rTG9va1Byb21pc2UpIG5rTG9va1Byb21pc2UgPSByZWFkTmtMb29rKCk7XG4gICAgcmV0dXJuIG5rTG9va1Byb21pc2U7XG59XG5cbi8vIFJlLXJlc29sdmUgb24gcHJlZiBjaGFuZ2VzIChBcHBlYXJhbmNlIGVkaXRlZCBpbiBhbm90aGVyIHN1cmZhY2UpLlxudHJ5IHtcbiAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWEpID0+IHtcbiAgICAgICAgaWYgKChhcmVhID09PSAnc3luYycgfHwgYXJlYSA9PT0gJ2xvY2FsJykgJiYgY2hhbmdlcy5hMTF5X3ByZWZzKSBua0xvb2tQcm9taXNlID0gbnVsbDtcbiAgICB9KTtcbn0gY2F0Y2ggKF8pIHsgLyogb25DaGFuZ2VkIHVuYXZhaWxhYmxlIFx1MjAxNCBjYWNoZSBzaW1wbHkgcGVyc2lzdHMgKi8gfVxuXG4vLyBcdTI1MDBcdTI1MDAgSW5qZWN0ZWQtc3VyZmFjZSBpc29sYXRpb24gKGNsaWNramFja2luZyAvIFVJLXJlZHJlc3MgZGVmZW5zZSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBFdmVyeSBpbmplY3RlZCBvdmVybGF5IChsb2NrZWQgc2hlZXQsIHBlcm1pc3Npb24gY29uc2VudCBzaGVldCwgRkFCKSBtb3VudHNcbi8vIGluc2lkZSBhIENMT1NFRCBzaGFkb3cgcm9vdCBvbiBhIGhhcmRlbmVkIGhvc3QuIFR3byB0aGluZ3MgdGhpcyBidXlzIHVzOlxuLy8gICAxLiBQYWdlIENTUyBzZWxlY3RvcnMgY2Fubm90IHJlYWNoIHRoZSBpbnRlcm5hbCBub2RlcyAobm8gcmVzdHlsaW5nIHRoZVxuLy8gICAgICBjb25zZW50IGlmcmFtZSBcdTIwMTQgZS5nLiB0aGUgY2xhc3NpYyBvcGFjaXR5Oi4wMiFpbXBvcnRhbnQgcmVkcmVzcyBhdHRhY2spLlxuLy8gICAyLiBUaGUgaG9zdCBsaXZlcyBpbiB0aGUgcGFnZSdzIGxpZ2h0IERPTS4gUGlubmluZyB0aGUgaG9zdCdzIE9XTlxuLy8gICAgICBjb21wb3NpdGluZyBwcm9wZXJ0aWVzIGlubGluZSB3aXRoICFpbXBvcnRhbnQgYmVhdHMgYW55IGF1dGhvciBzdHlsZXNoZWV0XG4vLyAgICAgICFpbXBvcnRhbnQsIHNvIHRoZSBwYWdlIGNhbm5vdCByZXN0eWxlIHRoZSBob3N0IGl0c2VsZiB0cmFuc3BhcmVudCAvXG4vLyAgICAgIHRyYW5zZm9ybWVkIC8gZmlsdGVyZWQuXG4vLyBMSU1JVFMgXHUyMDE0IHJlYWQgYmVmb3JlIHRydXN0aW5nIHRoaXMgYXMgYW50aS1jbGlja2phY2tpbmcgKGl0IGlzIE5PVCBzdWZmaWNpZW50KTpcbi8vICAgXHUyMDIyIElubGluZSBwaW5zIG9ubHkgZ292ZXJuIHRoZSBob3N0J3Mgb3duIGJveC4gVGhleSBkbyBOT1QgZGVmZW5kIGFnYWluc3QgYW5cbi8vICAgICBBTkNFU1RPUiBlZmZlY3Q6IGJlY2F1c2UgdGhlIHBhZ2UgaGFzIERPTSB3cml0ZSBhY2Nlc3MgdG8gZG9jdW1lbnQuYm9keSxcbi8vICAgICBpdCBjYW4gd3JhcCBvciByZS1wYXJlbnQgb3VyIGhvc3QgdW5kZXIgYW4gYXR0YWNrZXIgZWxlbWVudCB3aXRoXG4vLyAgICAgb3BhY2l0eTwxIC8gZmlsdGVyIC8gdHJhbnNmb3JtLiBHcm91cC9jb21wb3NpdGluZyBlZmZlY3RzIGFwcGx5IHRvIHRoZVxuLy8gICAgIHdob2xlIHN1YnRyZWUgYW5kIGEgZGVzY2VuZGFudCBjYW5ub3Qgb3B0IG91dCBcdTIwMTQgc28gdGhlIGhvc3QgY2FuIHN0aWxsIGJlXG4vLyAgICAgcmVuZGVyZWQgfnRyYW5zcGFyZW50LWJ1dC1jbGlja2FibGUgYW5kIGEgY2xpY2sgbHVyZWQgb250byB0aGUgcmVhbCBBbGxvdy5cbi8vICAgXHUyMDIyIEEgcGFnZSBjYW4gYWxzbyBwYWludCBpdHMgT1dOIGRlY295IGF0IHRoZSBzYW1lIG1heCB6LWluZGV4IG92ZXIgdGhlIHNoZWV0LlxuLy8gSW4tcGFnZSBjb25zZW50IGVtYmVkZGVkIGJ5IGFuIHVudHJ1c3RlZCBwYWdlIGlzIElOSEVSRU5UTFkgcmVkcmVzcy1leHBvc2VkO1xuLy8gb25seSB0aGUgdGFiIGZhbGxiYWNrIChjaHJvbWU6Ly8sIFBERiwgYnVua2VyKSBpcyBmdWxseSByZWRyZXNzLWltbXVuZS4gVGhlXG4vLyBzaGFkb3cgcm9vdCArIGhvc3QgcGlucyBjbG9zZSB0aGUgdHJpdmlhbCBwYWdlLUNTUyByZXN0eWxlLCBub3QgcmUtcGFyZW50aW5nLlxuLy8gVGhpcyBzdGlsbCBob2xkcyByZWdhcmRsZXNzIFx1MjAxNCB0aGUgQWxsb3cgdmVyYiBuZXZlciBsaXZlcyBpbiBwYWdlIERPTSwgc28gdGhpc1xuLy8gaXMgYSBkZWZlYXQtdGhlLWh1bWFuIHJpc2ssIG5vdCBhIGZvcmdlLWNvbnNlbnQtd2l0aG91dC1hLWNsaWNrIG9uZS5cbmZ1bmN0aW9uIG1vdW50U2hhZG93SG9zdCgpIHtcbiAgICBjb25zdCBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgcGluID0gKHByb3AsIHZhbCkgPT4gaG9zdC5zdHlsZS5zZXRQcm9wZXJ0eShwcm9wLCB2YWwsICdpbXBvcnRhbnQnKTtcbiAgICBwaW4oJ2FsbCcsICdpbml0aWFsJyk7XG4gICAgcGluKCdwb3NpdGlvbicsICdmaXhlZCcpO1xuICAgIHBpbigndG9wJywgJzAnKTtcbiAgICBwaW4oJ2xlZnQnLCAnMCcpO1xuICAgIHBpbignd2lkdGgnLCAnMCcpO1xuICAgIHBpbignaGVpZ2h0JywgJzAnKTtcbiAgICBwaW4oJ3otaW5kZXgnLCAnMjE0NzQ4MzY0NycpO1xuICAgIHBpbignb3BhY2l0eScsICcxJyk7XG4gICAgcGluKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICBwaW4oJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICBwaW4oJ3RyYW5zZm9ybScsICdub25lJyk7XG4gICAgcGluKCdmaWx0ZXInLCAnbm9uZScpO1xuICAgIHBpbignbWl4LWJsZW5kLW1vZGUnLCAnbm9ybWFsJyk7XG4gICAgcGluKCdwb2ludGVyLWV2ZW50cycsICdhdXRvJyk7XG4gICAgY29uc3Qgcm9vdCA9IGhvc3QuYXR0YWNoU2hhZG93KHsgbW9kZTogJ2Nsb3NlZCcgfSk7XG4gICAgLy8gTW91bnQgb24gPGh0bWw+LCBub3QgPGJvZHk+OiB0aGlzIG1ha2VzIDxodG1sPiB0aGUgT05MWSBhbmNlc3Rvciwgc2hyaW5raW5nXG4gICAgLy8gdGhlIHN1cmZhY2UgZm9yIGFuIGFuY2VzdG9yIGdyb3VwLWVmZmVjdCAob3BhY2l0eS9maWx0ZXIvdHJhbnNmb3JtKSByZWRyZXNzXG4gICAgLy8gdG8gYSBzaW5nbGUgZWxlbWVudCB0aGUgc2hlZXQgZ3VhcmQgd2F0Y2hlcy5cbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoaG9zdCk7XG4gICAgcmV0dXJuIHsgaG9zdCwgcm9vdCB9O1xufVxuXG4vLyBMb2NrZWQgbm90aWZpY2F0aW9uIHNoZWV0IFx1MjAxNCBzaG93biB3aGVuIGEgc2l0ZSBuZWVkcyB0aGUgcHJpdmF0ZSBrZXlcbi8vIGJ1dCB0aGUgZXh0ZW5zaW9uIGlzIGxvY2tlZC4gU2hvd3MgZXZlcnkgdGltZSB1bnRpbCB1bmxvY2tlZC5cbmxldCBsb2NrZWRTaGVldEhvc3QgPSBudWxsO1xubGV0IGxvY2tlZFNoZWV0RWwgPSBudWxsO1xubGV0IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsO1xuXG5hc3luYyBmdW5jdGlvbiBzaG93TG9ja2VkU2hlZXQoZmlyc3RVbmxvY2spIHtcbiAgICAvLyBJZiBhbHJlYWR5IHZpc2libGUsIHJlc2V0IHRoZSBhdXRvLWRpc21pc3MgdGltZXJcbiAgICBpZiAobG9ja2VkU2hlZXRFbCAmJiBsb2NrZWRTaGVldEVsLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICAgICAgaWYgKGxvY2tlZFNoZWV0VGltZXIpIGNsZWFyVGltZW91dChsb2NrZWRTaGVldFRpbWVyKTtcbiAgICAgICAgbG9ja2VkU2hlZXRUaW1lciA9IHNldFRpbWVvdXQoZGlzbWlzc0xvY2tlZFNoZWV0LCA1MDAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgcCwgcmVkdWNlTW90aW9uIH0gPSBhd2FpdCBnZXROa0xvb2soKTtcblxuICAgIC8vIFJlbW92ZSBhbnkgc3RhbGUgc2hlZXQgKGluY2x1ZGluZyBvbmUgY3JlYXRlZCB3aGlsZSB3ZSBhd2FpdGVkKVxuICAgIGlmIChsb2NrZWRTaGVldEhvc3QpIGxvY2tlZFNoZWV0SG9zdC5yZW1vdmUoKTtcblxuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3Qgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBzaGVldC5pZCA9ICdub3N0cmtleS1sb2NrZWQtc2hlZXQnO1xuICAgIHNoZWV0LmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgICAgIHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgICBpbnNldDogMDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuNSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMgZWFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQuYWN0aXZlIC5uay1iYWNrZHJvcCB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnBhbmVsfTtcbiAgICAgICAgICAgICAgICBib3JkZXItdG9wOiAxcHggc29saWQgJHtwLmhhaXJ9O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHggMTZweCAwIDA7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMjRweDtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTAwJSk7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZTtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIC00cHggMjBweCByZ2JhKDAsMCwwLDAuMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0LmFjdGl2ZSAubmstc2hlZXQge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWhhbmRsZSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA0cHg7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLmhhaXJ9O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDAgYXV0byAxNnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstaWNvbiB7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAzMnB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstdGl0bGUge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AudGV4dH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxOHB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXRleHQge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke3AudGV4dH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS41O1xuICAgICAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDRweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLW11dGVkIHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLm11dGVkfTtcbiAgICAgICAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAxNHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgICAgICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAke3Auc2lnbmFsfTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsRGltfTtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLnNpZ25hbH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiA1MDA7XG4gICAgICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDIwcHg7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAwLjE1cyBlYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYnRuOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAke3Auc2lnbmFsRGltfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICR7cmVkdWNlTW90aW9uID8gYCNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJhY2tkcm9wLFxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstc2hlZXQgeyB0cmFuc2l0aW9uOiBub25lOyB9YCA6ICcnfVxuICAgICAgICAgICAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1iYWNrZHJvcCxcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1zaGVldCB7IHRyYW5zaXRpb246IG5vbmU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWJhY2tkcm9wXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1zaGVldFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWhhbmRsZVwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWljb25cIj4mI3gxRjUxMjs8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay10aXRsZVwiPiR7Zmlyc3RVbmxvY2sgPyAnTm9zdHJLZXkgTmVlZHMgdG8gRGVjcnlwdCBZb3VyIEtleXMnIDogJ05vc3RyS2V5IGlzIExvY2tlZCd9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstdGV4dFwiPiR7Zmlyc3RVbmxvY2tcbiAgICAgICAgICAgICAgICA/ICdUaGlzIHNpdGUgaXMgcmVxdWVzdGluZyB5b3VyIE5vc3RyIGlkZW50aXR5LiBFbnRlciB5b3VyIG1hc3RlciBwYXNzd29yZCB0byBkZWNyeXB0IHlvdXIga2V5IHZhdWx0IGZvciB0aGlzIHNlc3Npb24uJ1xuICAgICAgICAgICAgICAgIDogJ1RoaXMgc2l0ZSBuZWVkcyB5b3VyIGtleSB0byBzaWduIG9yIGVuY3J5cHQuJ308L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1tdXRlZFwiPkNsaWNrIHRoZSBOb3N0cktleSBpY29uIGluIHlvdXIgdG9vbGJhciBhbmQgZW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQuPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwibmstYnRuXCI+R290IGl0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChzaGVldCk7XG4gICAgbG9ja2VkU2hlZXRIb3N0ID0gaG9zdDtcbiAgICBsb2NrZWRTaGVldEVsID0gc2hlZXQ7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHNoZWV0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTtcblxuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJy5uay1idG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRpc21pc3NMb2NrZWRTaGVldCk7XG4gICAgc2hlZXQucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzTG9ja2VkU2hlZXQpO1xuXG4gICAgLy8gQXV0by1kaXNtaXNzIGFmdGVyIDUgc2Vjb25kc1xuICAgIGxvY2tlZFNoZWV0VGltZXIgPSBzZXRUaW1lb3V0KGRpc21pc3NMb2NrZWRTaGVldCwgNTAwMCk7XG59XG5cbmZ1bmN0aW9uIGRpc21pc3NMb2NrZWRTaGVldCgpIHtcbiAgICBpZiAobG9ja2VkU2hlZXRUaW1lcikgeyBjbGVhclRpbWVvdXQobG9ja2VkU2hlZXRUaW1lcik7IGxvY2tlZFNoZWV0VGltZXIgPSBudWxsOyB9XG4gICAgaWYgKCFsb2NrZWRTaGVldEVsKSByZXR1cm47XG4gICAgbG9ja2VkU2hlZXRFbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICBjb25zdCBob3N0ID0gbG9ja2VkU2hlZXRIb3N0O1xuICAgIGxvY2tlZFNoZWV0RWwgPSBudWxsO1xuICAgIGxvY2tlZFNoZWV0SG9zdCA9IG51bGw7XG4gICAgc2V0VGltZW91dCgoKSA9PiBob3N0ICYmIGhvc3QucmVtb3ZlKCksIDMwMCk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMCBQZXJtaXNzaW9uIGNvbnNlbnQgc2hlZXQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4vLyBUaGUgQWxsb3cvRGVueSBVSSBpcyBhbiBFWFRFTlNJT04tT1dORUQgaWZyYW1lIChwZXJtaXNzaW9uL3Blcm1pc3Npb24uaHRtbClcbi8vIGluamVjdGVkIGFzIGEgZGltbWVkIGJvdHRvbSBzaGVldCwgc28gdGhlIHVzZXIga2VlcHMgdGhlIHNpdGUgaW4gdmlldyBmb3Jcbi8vIGluZm9ybWVkIGNvbnNlbnQuIEJlY2F1c2UgdGhlIGlmcmFtZSBpcyBhIGNyb3NzLW9yaWdpbiBleHRlbnNpb24gcGFnZSwgdGhlXG4vLyB3ZWIgcGFnZSBDQU5OT1Qgc2NyaXB0IGludG8gaXQgb3IgY2xpY2sgQWxsb3cgXHUyMDE0IHRoZSBwcm90ZWN0aW9uIGhvbGRzLlxuLy8gVGhlIGJhY2tkcm9wIGFuZCB0aGUgbWluaW1pemVkIEZBQiAodGhpcyBmaWxlLCBwYWdlIERPTSkgY2FycnkgTk8gY29uc2VudFxuLy8gYWN0aW9uOyB0aGV5IG9ubHkgc2hvdy9oaWRlIHRoZSBzaGVldCwgc28gdGhleSBhcmUgc2FmZSB0byBsaXZlIGluIHRoZSBwYWdlLlxubGV0IHBlcm1TaGVldEhvc3QgPSBudWxsO1xubGV0IHBlcm1TaGVldEVsID0gbnVsbDtcbmxldCBwZXJtRmFiSG9zdCA9IG51bGw7XG5sZXQgcGVybUZhYkVsID0gbnVsbDtcbmxldCBwZXJtU2hlZXRTcmMgPSBudWxsO1xuXG4vLyBHZW5lcmF0aW9uIGNvdW50ZXIgZ3VhcmRpbmcgdGhlIGFzeW5jIGdhcCBpbiBzaG93UGVybWlzc2lvblNoZWV0IC9cbi8vIHNob3dQZXJtaXNzaW9uRmFiOiBhIGNsb3NlUGVybWlzc2lvblNoZWV0IChvciBhIG5ld2VyIHNob3cpIGFycml2aW5nIHdoaWxlXG4vLyB0aGUgYXBwZWFyYW5jZSByZWFkIGlzIGluIGZsaWdodCBidW1wcyB0aGUgY291bnRlciwgc28gdGhlIHN0YWxlIGNhbGwgYmFpbHNcbi8vIGluc3RlYWQgb2YgcmVzdXJyZWN0aW5nIGEgc2hlZXQgdGhlIGJhY2tncm91bmQgYWxyZWFkeSBjbG9zZWQuXG5sZXQgbmtQZXJtR2VuID0gMDtcblxuYXN5bmMgZnVuY3Rpb24gc2hvd1Blcm1pc3Npb25TaGVldChzcmMpIHtcbiAgICBjbGVhclRpbWVvdXQocGVybUZhYkV4cGlyZWRUaW1lcik7IC8vIGEgbmV3IHJlcXVlc3QgcmVwbGFjZXMgYW4gZXhwaXJlZCBGQUJcbiAgICBwZXJtU2hlZXRTcmMgPSBzcmM7XG4gICAgY29uc3QgZ2VuID0gKytua1Blcm1HZW47XG4gICAgY29uc3QgeyBwLCByZWR1Y2VNb3Rpb24gfSA9IGF3YWl0IGdldE5rTG9vaygpO1xuICAgIGlmIChnZW4gIT09IG5rUGVybUdlbikgcmV0dXJuOyAvLyBzdXBlcnNlZGVkIHdoaWxlIHdlIGF3YWl0ZWRcbiAgICByZW1vdmVQZXJtaXNzaW9uRmFiKCk7XG4gICAgaWYgKHBlcm1TaGVldEhvc3QpIHBlcm1TaGVldEhvc3QucmVtb3ZlKCk7XG4gICAgY29uc3QgeyBob3N0LCByb290IH0gPSBtb3VudFNoYWRvd0hvc3QoKTtcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsLmlkID0gJ25vc3Rya2V5LXBlcm0tc2hlZXQnO1xuICAgIGVsLmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgeyBwb3NpdGlvbjogZml4ZWQ7IGluc2V0OiAwOyB6LWluZGV4OiAyMTQ3NDgzNjQ3OyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDsgaW5zZXQ6IDA7IGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsMC41KTtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwOyR7cmVkdWNlTW90aW9uID8gJycgOiAnIHRyYW5zaXRpb246IG9wYWNpdHkgLjJzIGVhc2U7J31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0LmFjdGl2ZSAubmstYmFja2Ryb3AgeyBvcGFjaXR5OiAxOyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstZnJhbWUtd3JhcCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGZpeGVkOyBsZWZ0OiAwOyByaWdodDogMDsgYm90dG9tOiAwO1xuICAgICAgICAgICAgICAgIG1heC13aWR0aDogNDYwcHg7IG1hcmdpbjogMCBhdXRvO1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxMDAlKTske3JlZHVjZU1vdGlvbiA/ICcnIDogJyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gLjNzIGVhc2U7J31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0LmFjdGl2ZSAubmstZnJhbWUtd3JhcCB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgaWZyYW1lIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogNzJ2aDsgbWF4LWhlaWdodDogNjQwcHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAwOyBib3JkZXItcmFkaXVzOiAxNnB4IDE2cHggMCAwO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgLTZweCAyOHB4IHJnYmEoMCwwLDAsLjQ1KTsgYmFja2dyb3VuZDogJHtwLmJhc2V9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQG1lZGlhIChtYXgtaGVpZ2h0OiA0MjBweCkge1xuICAgICAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IGlmcmFtZSB7IGhlaWdodDogOTJ2aDsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCAubmstYmFja2Ryb3AsXG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWZyYW1lLXdyYXAgeyB0cmFuc2l0aW9uOiBub25lOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1iYWNrZHJvcFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstZnJhbWUtd3JhcFwiPjxpZnJhbWUgdGl0bGU9XCJOb3N0cktleSBwZXJtaXNzaW9uIHJlcXVlc3RcIj48L2lmcmFtZT48L2Rpdj5cbiAgICBgO1xuICAgIGVsLnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpLnNyYyA9IHNyYzsgLy8gc2V0IHZpYSBwcm9wZXJ0eSwgbm90IEhUTUwgaW50ZXJwb2xhdGlvblxuICAgIHJvb3QuYXBwZW5kQ2hpbGQoZWwpO1xuICAgIHBlcm1TaGVldEhvc3QgPSBob3N0O1xuICAgIHBlcm1TaGVldEVsID0gZWw7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IGVsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTtcbiAgICAvLyBCYWNrZHJvcCBjbGljayBNSU5JTUlTRVMgKHJlcXVlc3Qgc3RheXMgcGVuZGluZykgcmF0aGVyIHRoYW4gZGlzbWlzc2luZy5cbiAgICBlbC5xdWVyeVNlbGVjdG9yKCcubmstYmFja2Ryb3AnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG1pbmltaXplUGVybWlzc2lvblNoZWV0KTtcbiAgICAvLyBGYWlsLWNsb3NlZCByZWRyZXNzIGd1YXJkOiB0aGlzIGlzIHRoZSBhY3R1YWwgY29uc2VudCBzdXJmYWNlLCBzbyBpZiB0aGUgcGFnZVxuICAgIC8vIHJlLXBhcmVudHMgb3IgdmlzdWFsbHkgc3VwcHJlc3NlcyBpdCB3ZSB0ZWFyIGl0IGRvd24gKG5vIGNsaWNrIGNhbiBsYW5kIG9uIGFcbiAgICAvLyBoaWRkZW4gQXBwcm92ZSkgYW5kIGVzY2FsYXRlIHRoZSBTQU1FIHBlbmRpbmcgcmVxdWVzdCB0byBhIHJlZHJlc3MtaW1tdW5lIHRhYi5cbiAgICBzdGFydFNoZWV0R3VhcmQoKTtcbn1cblxuZnVuY3Rpb24gbWluaW1pemVQZXJtaXNzaW9uU2hlZXQoKSB7XG4gICAgaWYgKCFwZXJtU2hlZXRIb3N0KSByZXR1cm47XG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICBwZXJtU2hlZXRIb3N0LnJlbW92ZSgpO1xuICAgIHBlcm1TaGVldEhvc3QgPSBudWxsO1xuICAgIHBlcm1TaGVldEVsID0gbnVsbDtcbiAgICBzaG93UGVybWlzc2lvbkZhYigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzaG93UGVybWlzc2lvbkZhYigpIHtcbiAgICBpZiAocGVybUZhYkVsIHx8ICFwZXJtU2hlZXRTcmMpIHJldHVybjtcbiAgICBjb25zdCBnZW4gPSArK25rUGVybUdlbjtcbiAgICBjb25zdCB7IHAsIHJlZHVjZU1vdGlvbiB9ID0gYXdhaXQgZ2V0TmtMb29rKCk7XG4gICAgaWYgKGdlbiAhPT0gbmtQZXJtR2VuKSByZXR1cm47IC8vIHN1cGVyc2VkZWQgd2hpbGUgd2UgYXdhaXRlZFxuICAgIGlmIChwZXJtRmFiRWwgfHwgIXBlcm1TaGVldFNyYykgcmV0dXJuO1xuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3QgZmFiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZmFiLmlkID0gJ25vc3Rya2V5LXBlcm0tZmFiJztcbiAgICBmYWIuaW5uZXJIVE1MID0gYFxuICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgeyBwb3NpdGlvbjogZml4ZWQ7IHJpZ2h0OiAxNnB4OyBib3R0b206IDE2cHg7IHotaW5kZXg6IDIxNDc0ODM2NDc7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmOyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWZhYiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4OyBwYWRkaW5nOiAxMnB4IDE2cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogOTk5cHg7IGN1cnNvcjogcG9pbnRlcjsgYm9yZGVyOiAxcHggc29saWQgJHtwLnNpZ25hbH07XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnBhbmVsfTsgY29sb3I6ICR7cC50ZXh0fTsgZm9udC1zaXplOiAxNHB4OyBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgNHB4IDE4cHggcmdiYSgwLDAsMCwuNCk7JHtyZWR1Y2VNb3Rpb24gPyAnJyA6ICcgYW5pbWF0aW9uOiBuay1mYWItcHVsc2UgMnMgZWFzZS1pbi1vdXQgaW5maW5pdGU7J31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZG90IHsgd2lkdGg6IDhweDsgaGVpZ2h0OiA4cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsgYmFja2dyb3VuZDogJHtwLnNpZ25hbH07IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZmFiLWNkIHsgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtczsgY29sb3I6ICR7cC5tdXRlZH07IGZvbnQtd2VpZ2h0OiA2MDA7IH1cbiAgICAgICAgICAgIEBrZXlmcmFtZXMgbmstZmFiLXB1bHNlIHsgMCUsMTAwJXsgYm94LXNoYWRvdzogMCA0cHggMThweCByZ2JhKDAsMCwwLC40KTt9IDUwJXsgYm94LXNoYWRvdzogMCA0cHggMjRweCAke3Auc2lnbmFsRGltfTt9IH1cbiAgICAgICAgICAgIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIC5uay1mYWIgeyBhbmltYXRpb246IG5vbmU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5rLWZhYlwiIHR5cGU9XCJidXR0b25cIj48c3BhbiBjbGFzcz1cIm5rLWRvdFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cIm5rLWZhYi1sYWJlbFwiPlJldmlldyBzaWduaW5nIHJlcXVlc3Q8L3NwYW4+PHNwYW4gY2xhc3M9XCJuay1mYWItY2RcIj48L3NwYW4+PC9idXR0b24+XG4gICAgYDtcbiAgICByb290LmFwcGVuZENoaWxkKGZhYik7XG4gICAgcGVybUZhYkhvc3QgPSBob3N0O1xuICAgIHBlcm1GYWJFbCA9IGZhYjtcbiAgICBmYWIucXVlcnlTZWxlY3RvcignLm5rLWZhYicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZiAocGVybVNoZWV0U3JjKSBzaG93UGVybWlzc2lvblNoZWV0KHBlcm1TaGVldFNyYyk7XG4gICAgICAgIGVsc2UgcmVtb3ZlUGVybWlzc2lvblVJKCk7IC8vIGV4cGlyZWQ6IHRoZXJlIGlzIG5vdGhpbmcgbGVmdCB0byByZXZpZXdcbiAgICB9KTtcbiAgICBzdGFydEZhYkNvdW50ZG93bihmYWIucXVlcnlTZWxlY3RvcignLm5rLWZhYi1jZCcpKTtcbn1cblxuLy8gQSBtaW5pbWl6ZWQgcmVxdWVzdCBrZWVwcyBjb3VudGluZyBkb3duOyBzdXJmYWNlIHRoZSByZW1haW5pbmcgdGltZSBvbiB0aGUgRkFCXG4vLyBzbyBpdCBkb2Vzbid0IHNpbGVudGx5IGV4cGlyZSB3aGlsZSB0dWNrZWQgYXdheS4gRGVhZGxpbmUgaXMgcmVhZCBmcm9tIHRoZVxuLy8gcGVuZGluZyBzaGVldCBVUkwgdGhhdCBiYWNrZ3JvdW5kIHN0YW1wZWQgKD9kZWFkbGluZT0pLlxubGV0IHBlcm1GYWJUaW1lciA9IG51bGw7XG5sZXQgcGVybUZhYkV4cGlyZWRUaW1lciA9IG51bGw7XG5cbi8vIEhvdyBsb25nIHRoZSBGQUIgc3RheXMgdXAgYWZ0ZXIgaXRzIHJlcXVlc3QgZXhwaXJlZCwgc28gc29tZW9uZSB3aG8gbG9va3MgYmFja1xuLy8gc2VlcyB3aGF0IGhhcHBlbmVkLiBXaXRoIHRoZSA0MCBzZWNvbmQgd2luZG93LCB0aGF0IGlzIGEgbWludXRlIG9mIGF0dGVudGlvbi5cbmNvbnN0IEZBQl9FWFBJUkVEX01TID0gMjBfMDAwO1xuXG4vLyBNaW5pbWl6aW5nIHJlbW92ZXMgdGhlIGlmcmFtZSB0aGF0IGtlZXBzIGEgc3VzcGVuZGFibGUgYmFja2dyb3VuZCBhd2FrZSB3aGlsZSBhXG4vLyByZXF1ZXN0IGlzIG9wZW4gKEhPTERfTk9URV9NUyBpbiBwZXJtaXNzaW9uLmpzKSwgc28gdGhlIEZBQiB0YWtlcyBvdmVyLiBUaGUgbm90ZVxuLy8gY2FycmllcyBubyBkZWNpc2lvbiBhbmQgbm8gcmVxdWVzdCBkYXRhLlxuY29uc3QgRkFCX0hPTERfTk9URV9NUyA9IDEwXzAwMDtcbmxldCBsYXN0RmFiSG9sZE5vdGUgPSAwO1xuXG5mdW5jdGlvbiBob2xkTWluaW1pemVkUmVxdWVzdCgpIHtcbiAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3RGYWJIb2xkTm90ZSA8IEZBQl9IT0xEX05PVEVfTVMpIHJldHVybjtcbiAgICBsYXN0RmFiSG9sZE5vdGUgPSBEYXRlLm5vdygpO1xuICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2hvbGRNaW5pbWl6ZWRQcm9tcHQnIH0pPy5jYXRjaD8uKCgpID0+IHt9KTtcbn1cblxuZnVuY3Rpb24gc3RhcnRGYWJDb3VudGRvd24oY2RFbCkge1xuICAgIHN0b3BGYWJDb3VudGRvd24oKTtcbiAgICBsYXN0RmFiSG9sZE5vdGUgPSAwOyAvLyB0aGUgaWZyYW1lJ3MgbGFzdCBub3RlIG1heSBiZSBuZWFybHkgMTAgc2Vjb25kcyBvbGRcbiAgICBjb25zdCBkZWFkbGluZSA9IHNoZWV0RGVhZGxpbmUoKTtcbiAgICBpZiAoIWRlYWRsaW5lIHx8ICFjZEVsKSByZXR1cm47XG4gICAgY29uc3QgdGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gZGVhZGxpbmUgLSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAocmVtYWluaW5nIDw9IDApIHsgc2hvd0ZhYkV4cGlyZWQoKTsgcmV0dXJuOyB9XG4gICAgICAgIGhvbGRNaW5pbWl6ZWRSZXF1ZXN0KCk7XG4gICAgICAgIGNkRWwudGV4dENvbnRlbnQgPSBgXHUwMEI3ICR7TWF0aC5jZWlsKHJlbWFpbmluZyAvIDEwMDApfXNgO1xuICAgIH07XG4gICAgdGljaygpO1xuICAgIHBlcm1GYWJUaW1lciA9IHNldEludGVydmFsKHRpY2ssIDI1MCk7XG59XG5mdW5jdGlvbiBzaGVldERlYWRsaW5lKCkge1xuICAgIHRyeSB7IHJldHVybiBOdW1iZXIobmV3IFVSTChwZXJtU2hlZXRTcmMpLnNlYXJjaFBhcmFtcy5nZXQoJ2RlYWRsaW5lJykpIHx8IDA7IH0gY2F0Y2ggKF8pIHsgcmV0dXJuIDA7IH1cbn1cblxuLyoqIFRoZSBGQUIncyByZXF1ZXN0IGhhcyBleHBpcmVkOiBzYXkgc28sIHN0b3Agb2ZmZXJpbmcgaXQsIGFuZCBsZWF2ZSBzaG9ydGx5LiAqL1xuZnVuY3Rpb24gc2hvd0ZhYkV4cGlyZWQoKSB7XG4gICAgc3RvcEZhYkNvdW50ZG93bigpO1xuICAgIHBlcm1TaGVldFNyYyA9IG51bGw7XG4gICAgY29uc3QgZmFiID0gcGVybUZhYkVsLnF1ZXJ5U2VsZWN0b3IoJy5uay1mYWInKTtcbiAgICBmYWIuc3R5bGUuYW5pbWF0aW9uID0gJ25vbmUnO1xuICAgIGZhYi5xdWVyeVNlbGVjdG9yKCcubmstZmFiLWxhYmVsJykudGV4dENvbnRlbnQgPSAnU2lnbmluZyByZXF1ZXN0IGV4cGlyZWQnO1xuICAgIGZhYi5xdWVyeVNlbGVjdG9yKCcubmstZmFiLWNkJykudGV4dENvbnRlbnQgPSAnJztcbiAgICBjbGVhclRpbWVvdXQocGVybUZhYkV4cGlyZWRUaW1lcik7XG4gICAgcGVybUZhYkV4cGlyZWRUaW1lciA9IHNldFRpbWVvdXQocmVtb3ZlUGVybWlzc2lvblVJLCBGQUJfRVhQSVJFRF9NUyk7XG59XG5cbi8qKlxuICogVGhlIGJhY2tncm91bmQgY2xvc2VzIHRoZSBVSSB3aGVuIGEgcmVxdWVzdCBlbmRzLiBBIG1pbmltaXplZCBGQUIgdGhhdCByZWFjaGVkXG4gKiBpdHMgZGVhZGxpbmUgc3RheXMgdXAgdG8gc2F5IGl0IGV4cGlyZWQuIEFueXRoaW5nIGVsc2UgY2xvc2VzIG5vdy5cbiAqL1xuZnVuY3Rpb24gY2xvc2VQZXJtaXNzaW9uVUkoKSB7XG4gICAgaWYgKHBlcm1GYWJFbCAmJiAhcGVybVNoZWV0U3JjKSByZXR1cm47IC8vIGFscmVhZHkgc2hvd2luZyB0aGF0IGl0IGV4cGlyZWRcbiAgICBjb25zdCBhdERlYWRsaW5lID0gcGVybUZhYkVsICYmIHNoZWV0RGVhZGxpbmUoKSAmJiBEYXRlLm5vdygpID49IHNoZWV0RGVhZGxpbmUoKSAtIDUwMDtcbiAgICBpZiAoYXREZWFkbGluZSkgc2hvd0ZhYkV4cGlyZWQoKTtcbiAgICBlbHNlIHJlbW92ZVBlcm1pc3Npb25VSSgpO1xufVxuXG5mdW5jdGlvbiBzdG9wRmFiQ291bnRkb3duKCkge1xuICAgIGlmIChwZXJtRmFiVGltZXIpIHsgY2xlYXJJbnRlcnZhbChwZXJtRmFiVGltZXIpOyBwZXJtRmFiVGltZXIgPSBudWxsOyB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVBlcm1pc3Npb25GYWIoKSB7XG4gICAgc3RvcEZhYkNvdW50ZG93bigpO1xuICAgIGNsZWFyVGltZW91dChwZXJtRmFiRXhwaXJlZFRpbWVyKTtcbiAgICBpZiAocGVybUZhYkhvc3QpIHsgcGVybUZhYkhvc3QucmVtb3ZlKCk7IHBlcm1GYWJIb3N0ID0gbnVsbDsgfVxuICAgIHBlcm1GYWJFbCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVBlcm1pc3Npb25VSSgpIHtcbiAgICBua1Blcm1HZW4rKzsgLy8gaW52YWxpZGF0ZSBhbnkgc2hvdyogc3RpbGwgYXdhaXRpbmcgaXRzIGFwcGVhcmFuY2UgcmVhZFxuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgaWYgKHBlcm1TaGVldEhvc3QpIHsgcGVybVNoZWV0SG9zdC5yZW1vdmUoKTsgcGVybVNoZWV0SG9zdCA9IG51bGw7IHBlcm1TaGVldEVsID0gbnVsbDsgfVxuICAgIHJlbW92ZVBlcm1pc3Npb25GYWIoKTtcbiAgICBwZXJtU2hlZXRTcmMgPSBudWxsO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgU2hlZXQgcmVkcmVzcyBndWFyZCAoZmFpbC1jbG9zZWQpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLy8gVGhlIGNvbnNlbnQgaWZyYW1lIGxpdmVzIGluIHBhZ2UgbGlnaHQgRE9NLCBzbyBhIHBhZ2Ugd2l0aCBET00td3JpdGUgYWNjZXNzIGNhblxuLy8gc3RpbGwgcmUtcGFyZW50IG91ciBob3N0IHVuZGVyIGEgdHJhbnNwYXJlbnQgZ3JvdXAgKG9wYWNpdHkvZmlsdGVyKSBvciBvdGhlcndpc2Vcbi8vIHN1cHByZXNzIGl0IHdoaWxlIGtlZXBpbmcgaXQgY2xpY2thYmxlIFx1MjAxNCBsdXJpbmcgYSBjbGljayBvbnRvIHRoZSByZWFsIEFwcHJvdmUuXG4vLyBUaGUgaW5saW5lIGhvc3QgcGlucyBjYW5ub3Qgb3B0IGEgc3VidHJlZSBvdXQgb2YgYW4gQU5DRVNUT1IgZ3JvdXAgZWZmZWN0LiBTbyB3ZVxuLy8gYWN0aXZlbHkgd2F0Y2g6IGlmIHRoZSBzdXJmYWNlIHN0b3BzIGJlaW5nIGZ1bGx5IHZpc2libGUgLyBjb3JyZWN0bHkgcGFyZW50ZWQsXG4vLyB3ZSBkZXN0cm95IGl0IChub3RoaW5nIGxlZnQgdG8gbWlzLWNsaWNrKSBhbmQgaGFuZCB0aGUgcmVxdWVzdCB0byB0aGUgdGFiLCB3aGljaFxuLy8gdGhlIHBhZ2UgY2Fubm90IHN0eWxlIGF0IGFsbC5cbmxldCBzaGVldEd1YXJkT2JzZXJ2ZXIgPSBudWxsO1xubGV0IHNoZWV0R3VhcmRUaW1lciA9IG51bGw7XG5cbmZ1bmN0aW9uIHN0eWxlU3VwcHJlc3Nlcyhjcykge1xuICAgIGlmICghY3MpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBwYXJzZUZsb2F0KGNzLm9wYWNpdHkpIDwgMC45XG4gICAgICAgIHx8IGNzLnZpc2liaWxpdHkgIT09ICd2aXNpYmxlJ1xuICAgICAgICB8fCBjcy5kaXNwbGF5ID09PSAnbm9uZSdcbiAgICAgICAgfHwgY3MucG9pbnRlckV2ZW50cyA9PT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLmZpbHRlciAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLnRyYW5zZm9ybSAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLm1peEJsZW5kTW9kZSAhPT0gJ25vcm1hbCdcbiAgICAgICAgfHwgY3MuY2xpcFBhdGggIT09ICdub25lJ1xuICAgICAgICB8fCBjcy5wZXJzcGVjdGl2ZSAhPT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLmNvbnRlbnRWaXNpYmlsaXR5ID09PSAnaGlkZGVuJ1xuICAgICAgICB8fCAoY3MubWFzayAmJiBjcy5tYXNrICE9PSAnbm9uZScpXG4gICAgICAgIHx8IChjcy53ZWJraXRNYXNrICYmIGNzLndlYmtpdE1hc2sgIT09ICdub25lJylcbiAgICAgICAgfHwgKGNzLmJhY2tkcm9wRmlsdGVyICYmIGNzLmJhY2tkcm9wRmlsdGVyICE9PSAnbm9uZScpO1xufVxuXG5mdW5jdGlvbiBzaGVldExvb2tzQ29tcHJvbWlzZWQoKSB7XG4gICAgY29uc3QgaG9zdCA9IHBlcm1TaGVldEhvc3Q7XG4gICAgaWYgKCFob3N0IHx8ICFob3N0LmlzQ29ubmVjdGVkKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaG9zdC5wYXJlbnROb2RlICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHJldHVybiB0cnVlOyAvLyByZS1wYXJlbnRlZFxuICAgIHRyeSB7XG4gICAgICAgIGlmIChzdHlsZVN1cHByZXNzZXMoZ2V0Q29tcHV0ZWRTdHlsZShob3N0KSkpIHJldHVybiB0cnVlOyAgICAgICAvLyBob3N0IGJveFxuICAgICAgICBpZiAoc3R5bGVTdXBwcmVzc2VzKGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSkpIHJldHVybiB0cnVlOyAvLyBzb2xlIGFuY2VzdG9yXG4gICAgICAgIGNvbnN0IGlmcmFtZSA9IHBlcm1TaGVldEVsICYmIHBlcm1TaGVldEVsLnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgICAgICBpZiAoIWlmcmFtZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGNvbnN0IGlmY3MgPSBnZXRDb21wdXRlZFN0eWxlKGlmcmFtZSk7XG4gICAgICAgIGlmIChwYXJzZUZsb2F0KGlmY3Mub3BhY2l0eSkgPCAwLjkgfHwgaWZjcy52aXNpYmlsaXR5ICE9PSAndmlzaWJsZScpIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIGlmIHdlIGNhbid0IHZlcmlmeSwgZmFpbCBjbG9zZWRcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvblNoZWV0Q29tcHJvbWlzZWQoKSB7XG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICByZW1vdmVQZXJtaXNzaW9uVUkoKTsgLy8gZGVzdHJveSB0aGUgaW4tcGFnZSBzdXJmYWNlIFx1MjAxNCBubyBoaWRkZW4gQXBwcm92ZSB0byBjbGlja1xuICAgIC8vIEFzayB0aGUgYmFja2dyb3VuZCB0byByZW9wZW4gdGhlIFNBTUUgcGVuZGluZyBwcm9tcHQgYXMgYSBkZWRpY2F0ZWQgdGFiLlxuICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Blcm1pc3Npb25TaGVldENvbXByb21pc2VkJyB9KS5jYXRjaCgoKSA9PiB7fSk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0U2hlZXRHdWFyZCgpIHtcbiAgICBzdG9wU2hlZXRHdWFyZCgpO1xuICAgIHRyeSB7XG4gICAgICAgIHNoZWV0R3VhcmRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChzaGVldExvb2tzQ29tcHJvbWlzZWQoKSkgb25TaGVldENvbXByb21pc2VkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBjaGlsZExpc3Qvc3VidHJlZSBjYXRjaGVzIHJlLXBhcmVudGluZzsgc3R5bGUvY2xhc3MgYXR0cnMgY2F0Y2ggYSBwYWdlXG4gICAgICAgIC8vIGRyb3BwaW5nIGEgZmlsdGVyL29wYWNpdHkgb250byA8aHRtbD4gb3Igd3JhcHBpbmcgb3VyIGhvc3QuXG4gICAgICAgIHNoZWV0R3VhcmRPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydzdHlsZScsICdjbGFzcyddLFxuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoXykgeyAvKiBvYnNlcnZlciB1bmF2YWlsYWJsZSBcdTIwMTQgcG9sbCBzdGlsbCBjb3ZlcnMgdXMgKi8gfVxuICAgIC8vIEJhY2tzdG9wIGZvciBlZmZlY3RzIGEgbXV0YXRpb24gY2FuJ3Qgc3VyZmFjZSAoc3R5bGVzaGVldCBzd2FwcywgOmhvdmVyIHJ1bGVzKS5cbiAgICBzaGVldEd1YXJkVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChzaGVldExvb2tzQ29tcHJvbWlzZWQoKSkgb25TaGVldENvbXByb21pc2VkKCk7XG4gICAgfSwgMjAwKTtcbn1cblxuZnVuY3Rpb24gc3RvcFNoZWV0R3VhcmQoKSB7XG4gICAgaWYgKHNoZWV0R3VhcmRPYnNlcnZlcikgeyBzaGVldEd1YXJkT2JzZXJ2ZXIuZGlzY29ubmVjdCgpOyBzaGVldEd1YXJkT2JzZXJ2ZXIgPSBudWxsOyB9XG4gICAgaWYgKHNoZWV0R3VhcmRUaW1lcikgeyBjbGVhckludGVydmFsKHNoZWV0R3VhcmRUaW1lcik7IHNoZWV0R3VhcmRUaW1lciA9IG51bGw7IH1cbn1cblxuLy8gTWluaW1pc2UgYW5kIGNsb3NlIHNpZ25hbHMgZnJvbSBpbnNpZGUgdGhlIHBlcm1pc3Npb24gaWZyYW1lIChleHRlbnNpb24gb3JpZ2luKS5cbi8vIFRoZXNlIGFyZSBoYXJtbGVzcyBVSSBhY3Rpb25zIChoaWRlIHRoZSBzaGVldCksIHNvIGNvbmZpcm1pbmcgdGhleSBjYW1lIGZyb20gT1VSXG4vLyBpZnJhbWUgaXMgZW5vdWdoIFx1MjAxNCBubyBjb25zZW50IGRlY2lzaW9uIHRyYXZlbHMgdGhpcyBjaGFubmVsLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXYpID0+IHtcbiAgICBpZiAoIXBlcm1TaGVldEVsKSByZXR1cm47XG4gICAgY29uc3QgaWZyYW1lID0gcGVybVNoZWV0RWwucXVlcnlTZWxlY3RvcignaWZyYW1lJyk7XG4gICAgaWYgKCFpZnJhbWUgfHwgZXYuc291cmNlICE9PSBpZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuICAgIGlmIChldi5kYXRhICYmIGV2LmRhdGEuX19ub3N0cmtleV9wZXJtID09PSAnbWluaW1pemUnKSBtaW5pbWl6ZVBlcm1pc3Npb25TaGVldCgpO1xuICAgIGlmIChldi5kYXRhICYmIGV2LmRhdGEuX19ub3N0cmtleV9wZXJtID09PSAnY2xvc2UnKSByZW1vdmVQZXJtaXNzaW9uVUkoKTtcbn0pO1xuXG4vLyBMaXN0ZW4gZm9yIHJlcXVlc3RzIGZyb20gYmFja2dyb3VuZFxuYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIC8vIE5PVEU6IGNvbnNlbnQgKEFsbG93L0RlbnkpIGlzIE5PVCByZW5kZXJlZCBpbiB0aGUgcGFnZSBET00uIEl0IGxpdmVzIGluIHRoZVxuICAgIC8vIGV4dGVuc2lvbi1vd25lZCBwZXJtaXNzaW9uIGlmcmFtZSAoc2VlIHNob3dQZXJtaXNzaW9uU2hlZXQpO1xuICAgIC8vIGEgd2ViIHBhZ2UgY2FuIG5laXRoZXIgc2NyaXB0IGludG8gaXQgbm9yIGNsaWNrIEFsbG93LlxuICAgIGlmIChtZXNzYWdlLmtpbmQgPT09ICdzaG93TG9ja2VkU2hlZXQnKSB7XG4gICAgICAgIHNob3dMb2NrZWRTaGVldChtZXNzYWdlLmZpcnN0VW5sb2NrIHx8IGZhbHNlKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uua2luZCA9PT0gJ3Nob3dQZXJtaXNzaW9uU2hlZXQnKSB7XG4gICAgICAgIHNob3dQZXJtaXNzaW9uU2hlZXQobWVzc2FnZS51cmwpO1xuICAgICAgICBzZW5kUmVzcG9uc2UodHJ1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnY2xvc2VQZXJtaXNzaW9uU2hlZXQnKSB7XG4gICAgICAgIGNsb3NlUGVybWlzc2lvblVJKCk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgYXN5bmMgbWVzc2FnZSA9PiB7XG4gICAgLy8gQzMgZml4OiBPbmx5IGFjY2VwdCBtZXNzYWdlcyBmcm9tIHRoZSB0b3AtbGV2ZWwgcGFnZSBjb250ZXh0XG4gICAgaWYgKG1lc3NhZ2Uuc291cmNlICE9PSB3aW5kb3cpIHJldHVybjtcblxuICAgIC8vIFBhZ2UtcmVhY2hhYmxlIG1ldGhvZHMgb25seS4gZXhwb3J0UHJvZmlsZSBhbmQgYnVua2VyU2VydmVyLiogYXJlXG4gICAgLy8gZGVsaWJlcmF0ZWx5IGV4Y2x1ZGVkIFx1MjAxNCB0aG9zZSBhcmUgcHJpdmlsZWdlZCBhbmQgbWF5IG9yaWdpbmF0ZSBPTkxZIGZyb21cbiAgICAvLyB0aGUgZXh0ZW5zaW9uIFVJLlxuICAgIGNvbnN0IHZhbGlkRXZlbnRzID0gW1xuICAgICAgICAnZ2V0UHViS2V5JyxcbiAgICAgICAgJ3NpZ25FdmVudCcsXG4gICAgICAgICdnZXRSZWxheXMnLFxuICAgICAgICAnYWRkUmVsYXknLFxuICAgICAgICAnbmlwMDQuZW5jcnlwdCcsXG4gICAgICAgICduaXAwNC5kZWNyeXB0JyxcbiAgICAgICAgJ25pcDQ0LmVuY3J5cHQnLFxuICAgICAgICAnbmlwNDQuZGVjcnlwdCcsXG4gICAgICAgICdyZXBsYWNlVVJMJyxcbiAgICBdO1xuICAgIGxldCB7IGtpbmQsIHJlcUlkLCBwYXlsb2FkIH0gPSBtZXNzYWdlLmRhdGE7XG4gICAgaWYgKCF2YWxpZEV2ZW50cy5pbmNsdWRlcyhraW5kKSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcGF5bG9hZCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgLy8gTkstMDM6IGtleSBwZXJtaXNzaW9uIGdyYW50cyBvbiB0aGUgZnVsbCBvcmlnaW4gKHNjaGVtZStob3N0Wzpwb3J0XSksXG4gICAgICAgICAgICAvLyBub3QgdGhlIGJhcmUgaG9zdCwgc28gaHR0cC9odHRwcyBhbmQgZGlmZmVyZW50IHBvcnRzIGRvbid0IHNoYXJlIGdyYW50cy5cbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4sXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBwYXlsb2FkID0geyBlcnJvcjogJ2Nvbm5lY3Rpb25fZXJyb3InIH07XG4gICAgfVxuXG4gICAgLy8gQSBmYWlsdXJlIHJlYWNoZXMgdGhlIHBhZ2UgYXMgaXRzIGNvZGUgb25seS4gV29ya2VyIHRleHQgKGEgcmVtb3RlIHNpZ25lcidzXG4gICAgLy8gb3duIGVycm9yLCBmb3Igb25lKSBuZXZlciBsZWF2ZXMgdGhlIGV4dGVuc2lvbi5cbiAgICBpZiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnICYmIHBheWxvYWQgIT09IG51bGwgJiYgdHlwZW9mIHBheWxvYWQuZXJyb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBheWxvYWQgPSB7IGVycm9yOiBwYXlsb2FkLmVycm9yIH07XG4gICAgfVxuXG4gICAga2luZCA9IGByZXR1cm5fJHtraW5kfWA7XG5cbiAgICAvLyBOSy01IC8gTkstNjogc3RhbXAgdGhlIHByaXZhdGUgY2hhbm5lbCB0b2tlbiBhbmQgdGFyZ2V0IHRoaXMgcGFnZSdzIG93blxuICAgIC8vIG9yaWdpbiBzbyBhIHNhbWUtcGFnZSBzY3JpcHQgY2FuJ3QgZm9yZ2Uvb2JzZXJ2ZSBjcm9zcy1vcmlnaW4uXG4gICAgd2luZG93LnBvc3RNZXNzYWdlKHsga2luZCwgcmVxSWQsIHBheWxvYWQsIHRva2VuOiBOS19DSEFOTkVMX1RPS0VOIH0sIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdC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
