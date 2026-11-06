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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uL3NyYy9jb250ZW50LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5hc3luYyBmdW5jdGlvbiBzaG91bGRJbmplY3QoKSB7XG4gICAgaWYgKHdpbmRvdyA9PT0gd2luZG93LnRvcCkgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IGJsb2NrQ3Jvc3NPcmlnaW5GcmFtZXM6IHRydWUgfSk7XG4gICAgICAgIGlmICghZGF0YS5ibG9ja0Nyb3NzT3JpZ2luRnJhbWVzKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICB2b2lkIHdpbmRvdy50b3AubG9jYXRpb24uaHJlZjsgLy8gdGhyb3dzIGZvciBjcm9zcy1vcmlnaW4gZnJhbWVzXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vLyBOSy01OiBwZXItcGFnZS1sb2FkIGNoYW5uZWwgdG9rZW4gc2hhcmVkIHByaXZhdGVseSB3aXRoIHRoZSBpbmplY3RlZFxuLy8gcGFnZS13b3JsZCBzY3JpcHQuIFBhc3NlZCB2aWEgYSBkYXRhIGF0dHJpYnV0ZSB0aGF0IHRoZSBpbmplY3RlZCBzY3JpcHRcbi8vIHJlYWRzIGFuZCBzdHJpcHMgc3luY2hyb25vdXNseSBvbiBsb2FkLiBFdmVyeSByZXNwb25zZSB3ZSBwb3N0IGJhY2sgdG8gdGhlXG4vLyBwYWdlIGNhcnJpZXMgdGhpcyB0b2tlbiBzbyBhIHNhbWUtcGFnZSBzY3JpcHQgdGhhdCBvbmx5IHNhdyB0aGUgcmVxdWVzdFxuLy8gYnJvYWRjYXN0IGNhbm5vdCBmb3JnZSBhIHJlc3BvbnNlLlxuY29uc3QgTktfQ0hBTk5FTF9UT0tFTiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG5cbnNob3VsZEluamVjdCgpLnRoZW4oaW5qZWN0ID0+IHtcbiAgICBpZiAoIWluamVjdCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBhcGkucnVudGltZS5nZXRVUkwoJ25vc3RyLmJ1aWxkLmpzJykpO1xuICAgIHNjcmlwdC5kYXRhc2V0Lm5rVG9rZW4gPSBOS19DSEFOTkVMX1RPS0VOO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn0pO1xuXG4vLyBcdTI1MDBcdTI1MDAgQXBwZWFyYW5jZSBmb3IgaW5qZWN0ZWQgY2hyb21lIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLy8gVGhlIGluamVjdGVkIGNvbnNlbnQgY2hyb21lIChsb2NrZWQgc2hlZXQsIHBlcm1pc3Npb24tc2hlZXQgd3JhcHBlciwgRkFCKVxuLy8gZm9sbG93cyB0aGUgdXNlcidzIEFwcGVhcmFuY2UgcHJlZnMgKGExMXlfcHJlZnMgXHUyMTkyIExPT0sgXHUwMEQ3IE1PREUgKyByZWR1Y2Vcbi8vIG1vdGlvbikuIFNFQ1VSSVRZOiBzdG9yYWdlIHZhbHVlcyBvbmx5IGV2ZXIgU0VMRUNUIG9uZSBvZiB0aGVzZSBoYXJkY29kZWRcbi8vIGxpdGVyYWwgcGFsZXR0ZXMgXHUyMDE0IG5vIHN0b3JhZ2UtZGVyaXZlZCBzdHJpbmcgaXMgaW50ZXJwb2xhdGVkIGludG8gaW5qZWN0ZWRcbi8vIG1hcmt1cC4gVmFsdWVzIGNvcGllZCB2ZXJiYXRpbSBmcm9tIGluc3RydW1lbnQuY3NzIHNraW4gdG9rZW5zLlxuY29uc3QgTktfUEFMRVRURVMgPSB7XG4gICAgJ2luc3RydW1lbnQtZGFyayc6ICB7IGJhc2U6ICcjMEUwRjEzJywgcGFuZWw6ICcjMTYxODFEJywgaGFpcjogJyMyQTJFMzcnLCB0ZXh0OiAnI0U3RTlFRScsIG11dGVkOiAnIzhBOTBBMCcsIHNpZ25hbDogJyNjMDg0ZmMnLCBzaWduYWxEaW06ICdyZ2JhKDE5MiwxMzIsMjUyLDAuMTYpJyB9LFxuICAgICdpbnN0cnVtZW50LWxpZ2h0JzogeyBiYXNlOiAnI0Y0RjVGNycsIHBhbmVsOiAnI0ZGRkZGRicsIGhhaXI6ICcjRENERkU2JywgdGV4dDogJyMxOTFCMjInLCBtdXRlZDogJyM2MjY4NzgnLCBzaWduYWw6ICcjN0MzQUVEJywgc2lnbmFsRGltOiAncmdiYSgxMjQsNTgsMjM3LDAuMTIpJyB9LFxuICAgICdhbmFsb2ctZGFyayc6ICAgICAgeyBiYXNlOiAnIzE0MTIxMCcsIHBhbmVsOiAnIzFDMTgxNScsIGhhaXI6ICcjMzUyRTI1JywgdGV4dDogJyNFREU2REEnLCBtdXRlZDogJyNBMjkzN0MnLCBzaWduYWw6ICcjZmJiZjI0Jywgc2lnbmFsRGltOiAncmdiYSgyNTEsMTkxLDM2LDAuMTQpJyB9LFxuICAgICdhbmFsb2ctbGlnaHQnOiAgICAgeyBiYXNlOiAnI0Y0RUFENicsIHBhbmVsOiAnI0ZDRjZFOCcsIGhhaXI6ICcjREJDQUE0JywgdGV4dDogJyMzMzI2MEYnLCBtdXRlZDogJyM3MjYxM0EnLCBzaWduYWw6ICcjOTg0RTA5Jywgc2lnbmFsRGltOiAncmdiYSgxNTIsNzgsOSwwLjEyKScgfSxcbiAgICAnY29uc29sZS1kYXJrJzogICAgIHsgYmFzZTogJyMwQjEyMjAnLCBwYW5lbDogJyMxMTFBMkInLCBoYWlyOiAnIzI0MzE0QScsIHRleHQ6ICcjRTZFREY2JywgbXV0ZWQ6ICcjODM5MUE4Jywgc2lnbmFsOiAnIzJkZDRiZicsIHNpZ25hbERpbTogJ3JnYmEoNDUsMjEyLDE5MSwwLjE1KScgfSxcbiAgICAnY29uc29sZS1saWdodCc6ICAgIHsgYmFzZTogJyNGMUY1RjknLCBwYW5lbDogJyNGRkZGRkYnLCBoYWlyOiAnI0QyREJFNicsIHRleHQ6ICcjMEYxNzJBJywgbXV0ZWQ6ICcjNUI2ODc5Jywgc2lnbmFsOiAnIzBBNzY2QycsIHNpZ25hbERpbTogJ3JnYmEoMTAsMTE4LDEwOCwwLjEyKScgfSxcbn07XG5cbmxldCBua0xvb2tQcm9taXNlID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gcmVhZE5rTG9vaygpIHtcbiAgICBsZXQgcHJlZnMgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldCgnYTExeV9wcmVmcycpO1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmExMXlfcHJlZnMgJiYgdHlwZW9mIGRhdGEuYTExeV9wcmVmcyA9PT0gJ29iamVjdCcpIHByZWZzID0gZGF0YS5hMTF5X3ByZWZzO1xuICAgIH0gY2F0Y2ggKF8pIHsgLyogc3luYyB1bmF2YWlsYWJsZSBcdTIwMTQgZmFsbCB0aHJvdWdoICovIH1cbiAgICBpZiAoIXByZWZzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KCdhMTF5X3ByZWZzJyk7XG4gICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmExMXlfcHJlZnMgJiYgdHlwZW9mIGRhdGEuYTExeV9wcmVmcyA9PT0gJ29iamVjdCcpIHByZWZzID0gZGF0YS5hMTF5X3ByZWZzO1xuICAgICAgICB9IGNhdGNoIChfKSB7IC8qIHN0b3JhZ2UgdW5hdmFpbGFibGUgXHUyMDE0IGRlZmF1bHRzIGJlbG93ICovIH1cbiAgICB9XG4gICAgcHJlZnMgPSBwcmVmcyB8fCB7fTtcbiAgICAvLyBNaXJyb3JzIGExMXkuanMgc2FuaXRpemUoKTogdW5rbm93biB2YWx1ZXMgZmFsbCBiYWNrIHRvIGRlZmF1bHRzLlxuICAgIGNvbnN0IHRoZW1lID0gWydpbnN0cnVtZW50JywgJ2FuYWxvZycsICdjb25zb2xlJ10uaW5jbHVkZXMocHJlZnMudGhlbWUpID8gcHJlZnMudGhlbWUgOiAnY29uc29sZSc7XG4gICAgbGV0IG1vZGUgPSBbJ2RhcmsnLCAnbGlnaHQnLCAnc3lzdGVtJ10uaW5jbHVkZXMocHJlZnMubW9kZSkgPyBwcmVmcy5tb2RlIDogJ2RhcmsnO1xuICAgIGlmIChtb2RlID09PSAnc3lzdGVtJykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbW9kZSA9IHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1jb2xvci1zY2hlbWU6IGxpZ2h0KScpLm1hdGNoZXMgPyAnbGlnaHQnIDogJ2RhcmsnO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICBtb2RlID0gJ2RhcmsnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHA6IE5LX1BBTEVUVEVTW3RoZW1lICsgJy0nICsgbW9kZV0gfHwgTktfUEFMRVRURVNbJ2NvbnNvbGUtZGFyayddLFxuICAgICAgICByZWR1Y2VNb3Rpb246IHByZWZzLnJlZHVjZU1vdGlvbiA9PT0gdHJ1ZSxcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBnZXROa0xvb2soKSB7XG4gICAgaWYgKCFua0xvb2tQcm9taXNlKSBua0xvb2tQcm9taXNlID0gcmVhZE5rTG9vaygpO1xuICAgIHJldHVybiBua0xvb2tQcm9taXNlO1xufVxuXG4vLyBSZS1yZXNvbHZlIG9uIHByZWYgY2hhbmdlcyAoQXBwZWFyYW5jZSBlZGl0ZWQgaW4gYW5vdGhlciBzdXJmYWNlKS5cbnRyeSB7XG4gICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhKSA9PiB7XG4gICAgICAgIGlmICgoYXJlYSA9PT0gJ3N5bmMnIHx8IGFyZWEgPT09ICdsb2NhbCcpICYmIGNoYW5nZXMuYTExeV9wcmVmcykgbmtMb29rUHJvbWlzZSA9IG51bGw7XG4gICAgfSk7XG59IGNhdGNoIChfKSB7IC8qIG9uQ2hhbmdlZCB1bmF2YWlsYWJsZSBcdTIwMTQgY2FjaGUgc2ltcGx5IHBlcnNpc3RzICovIH1cblxuLy8gXHUyNTAwXHUyNTAwIEluamVjdGVkLXN1cmZhY2UgaXNvbGF0aW9uIChjbGlja2phY2tpbmcgLyBVSS1yZWRyZXNzIGRlZmVuc2UpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLy8gRXZlcnkgaW5qZWN0ZWQgb3ZlcmxheSAobG9ja2VkIHNoZWV0LCBwZXJtaXNzaW9uIGNvbnNlbnQgc2hlZXQsIEZBQikgbW91bnRzXG4vLyBpbnNpZGUgYSBDTE9TRUQgc2hhZG93IHJvb3Qgb24gYSBoYXJkZW5lZCBob3N0LiBUd28gdGhpbmdzIHRoaXMgYnV5cyB1czpcbi8vICAgMS4gUGFnZSBDU1Mgc2VsZWN0b3JzIGNhbm5vdCByZWFjaCB0aGUgaW50ZXJuYWwgbm9kZXMgKG5vIHJlc3R5bGluZyB0aGVcbi8vICAgICAgY29uc2VudCBpZnJhbWUgXHUyMDE0IGUuZy4gdGhlIGNsYXNzaWMgb3BhY2l0eTouMDIhaW1wb3J0YW50IHJlZHJlc3MgYXR0YWNrKS5cbi8vICAgMi4gVGhlIGhvc3QgbGl2ZXMgaW4gdGhlIHBhZ2UncyBsaWdodCBET00uIFBpbm5pbmcgdGhlIGhvc3QncyBPV05cbi8vICAgICAgY29tcG9zaXRpbmcgcHJvcGVydGllcyBpbmxpbmUgd2l0aCAhaW1wb3J0YW50IGJlYXRzIGFueSBhdXRob3Igc3R5bGVzaGVldFxuLy8gICAgICAhaW1wb3J0YW50LCBzbyB0aGUgcGFnZSBjYW5ub3QgcmVzdHlsZSB0aGUgaG9zdCBpdHNlbGYgdHJhbnNwYXJlbnQgL1xuLy8gICAgICB0cmFuc2Zvcm1lZCAvIGZpbHRlcmVkLlxuLy8gTElNSVRTIFx1MjAxNCByZWFkIGJlZm9yZSB0cnVzdGluZyB0aGlzIGFzIGFudGktY2xpY2tqYWNraW5nIChpdCBpcyBOT1Qgc3VmZmljaWVudCk6XG4vLyAgIFx1MjAyMiBJbmxpbmUgcGlucyBvbmx5IGdvdmVybiB0aGUgaG9zdCdzIG93biBib3guIFRoZXkgZG8gTk9UIGRlZmVuZCBhZ2FpbnN0IGFuXG4vLyAgICAgQU5DRVNUT1IgZWZmZWN0OiBiZWNhdXNlIHRoZSBwYWdlIGhhcyBET00gd3JpdGUgYWNjZXNzIHRvIGRvY3VtZW50LmJvZHksXG4vLyAgICAgaXQgY2FuIHdyYXAgb3IgcmUtcGFyZW50IG91ciBob3N0IHVuZGVyIGFuIGF0dGFja2VyIGVsZW1lbnQgd2l0aFxuLy8gICAgIG9wYWNpdHk8MSAvIGZpbHRlciAvIHRyYW5zZm9ybS4gR3JvdXAvY29tcG9zaXRpbmcgZWZmZWN0cyBhcHBseSB0byB0aGVcbi8vICAgICB3aG9sZSBzdWJ0cmVlIGFuZCBhIGRlc2NlbmRhbnQgY2Fubm90IG9wdCBvdXQgXHUyMDE0IHNvIHRoZSBob3N0IGNhbiBzdGlsbCBiZVxuLy8gICAgIHJlbmRlcmVkIH50cmFuc3BhcmVudC1idXQtY2xpY2thYmxlIGFuZCBhIGNsaWNrIGx1cmVkIG9udG8gdGhlIHJlYWwgQWxsb3cuXG4vLyAgIFx1MjAyMiBBIHBhZ2UgY2FuIGFsc28gcGFpbnQgaXRzIE9XTiBkZWNveSBhdCB0aGUgc2FtZSBtYXggei1pbmRleCBvdmVyIHRoZSBzaGVldC5cbi8vIEluLXBhZ2UgY29uc2VudCBlbWJlZGRlZCBieSBhbiB1bnRydXN0ZWQgcGFnZSBpcyBJTkhFUkVOVExZIHJlZHJlc3MtZXhwb3NlZDtcbi8vIG9ubHkgdGhlIHRhYiBmYWxsYmFjayAoY2hyb21lOi8vLCBQREYsIGJ1bmtlcikgaXMgZnVsbHkgcmVkcmVzcy1pbW11bmUuIFRoZVxuLy8gc2hhZG93IHJvb3QgKyBob3N0IHBpbnMgY2xvc2UgdGhlIHRyaXZpYWwgcGFnZS1DU1MgcmVzdHlsZSwgbm90IHJlLXBhcmVudGluZy5cbi8vIFRoaXMgc3RpbGwgaG9sZHMgcmVnYXJkbGVzcyBcdTIwMTQgdGhlIEFsbG93IHZlcmIgbmV2ZXIgbGl2ZXMgaW4gcGFnZSBET00sIHNvIHRoaXNcbi8vIGlzIGEgZGVmZWF0LXRoZS1odW1hbiByaXNrLCBub3QgYSBmb3JnZS1jb25zZW50LXdpdGhvdXQtYS1jbGljayBvbmUuXG5mdW5jdGlvbiBtb3VudFNoYWRvd0hvc3QoKSB7XG4gICAgY29uc3QgaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IHBpbiA9IChwcm9wLCB2YWwpID0+IGhvc3Quc3R5bGUuc2V0UHJvcGVydHkocHJvcCwgdmFsLCAnaW1wb3J0YW50Jyk7XG4gICAgcGluKCdhbGwnLCAnaW5pdGlhbCcpO1xuICAgIHBpbigncG9zaXRpb24nLCAnZml4ZWQnKTtcbiAgICBwaW4oJ3RvcCcsICcwJyk7XG4gICAgcGluKCdsZWZ0JywgJzAnKTtcbiAgICBwaW4oJ3dpZHRoJywgJzAnKTtcbiAgICBwaW4oJ2hlaWdodCcsICcwJyk7XG4gICAgcGluKCd6LWluZGV4JywgJzIxNDc0ODM2NDcnKTtcbiAgICBwaW4oJ29wYWNpdHknLCAnMScpO1xuICAgIHBpbigndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgcGluKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgcGluKCd0cmFuc2Zvcm0nLCAnbm9uZScpO1xuICAgIHBpbignZmlsdGVyJywgJ25vbmUnKTtcbiAgICBwaW4oJ21peC1ibGVuZC1tb2RlJywgJ25vcm1hbCcpO1xuICAgIHBpbigncG9pbnRlci1ldmVudHMnLCAnYXV0bycpO1xuICAgIGNvbnN0IHJvb3QgPSBob3N0LmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdjbG9zZWQnIH0pO1xuICAgIC8vIE1vdW50IG9uIDxodG1sPiwgbm90IDxib2R5PjogdGhpcyBtYWtlcyA8aHRtbD4gdGhlIE9OTFkgYW5jZXN0b3IsIHNocmlua2luZ1xuICAgIC8vIHRoZSBzdXJmYWNlIGZvciBhbiBhbmNlc3RvciBncm91cC1lZmZlY3QgKG9wYWNpdHkvZmlsdGVyL3RyYW5zZm9ybSkgcmVkcmVzc1xuICAgIC8vIHRvIGEgc2luZ2xlIGVsZW1lbnQgdGhlIHNoZWV0IGd1YXJkIHdhdGNoZXMuXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKGhvc3QpO1xuICAgIHJldHVybiB7IGhvc3QsIHJvb3QgfTtcbn1cblxuLy8gTG9ja2VkIG5vdGlmaWNhdGlvbiBzaGVldCBcdTIwMTQgc2hvd24gd2hlbiBhIHNpdGUgbmVlZHMgdGhlIHByaXZhdGUga2V5XG4vLyBidXQgdGhlIGV4dGVuc2lvbiBpcyBsb2NrZWQuIFNob3dzIGV2ZXJ5IHRpbWUgdW50aWwgdW5sb2NrZWQuXG5sZXQgbG9ja2VkU2hlZXRIb3N0ID0gbnVsbDtcbmxldCBsb2NrZWRTaGVldEVsID0gbnVsbDtcbmxldCBsb2NrZWRTaGVldFRpbWVyID0gbnVsbDtcblxuYXN5bmMgZnVuY3Rpb24gc2hvd0xvY2tlZFNoZWV0KGZpcnN0VW5sb2NrKSB7XG4gICAgLy8gSWYgYWxyZWFkeSB2aXNpYmxlLCByZXNldCB0aGUgYXV0by1kaXNtaXNzIHRpbWVyXG4gICAgaWYgKGxvY2tlZFNoZWV0RWwgJiYgbG9ja2VkU2hlZXRFbC5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgICAgIGlmIChsb2NrZWRTaGVldFRpbWVyKSBjbGVhclRpbWVvdXQobG9ja2VkU2hlZXRUaW1lcik7XG4gICAgICAgIGxvY2tlZFNoZWV0VGltZXIgPSBzZXRUaW1lb3V0KGRpc21pc3NMb2NrZWRTaGVldCwgNTAwMCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IHAsIHJlZHVjZU1vdGlvbiB9ID0gYXdhaXQgZ2V0TmtMb29rKCk7XG5cbiAgICAvLyBSZW1vdmUgYW55IHN0YWxlIHNoZWV0IChpbmNsdWRpbmcgb25lIGNyZWF0ZWQgd2hpbGUgd2UgYXdhaXRlZClcbiAgICBpZiAobG9ja2VkU2hlZXRIb3N0KSBsb2NrZWRTaGVldEhvc3QucmVtb3ZlKCk7XG5cbiAgICBjb25zdCB7IGhvc3QsIHJvb3QgfSA9IG1vdW50U2hhZG93SG9zdCgpO1xuICAgIGNvbnN0IHNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2hlZXQuaWQgPSAnbm9zdHJrZXktbG9ja2VkLXNoZWV0JztcbiAgICBzaGVldC5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgICAgICAgICBib3R0b206IDA7XG4gICAgICAgICAgICAgICAgbGVmdDogMDtcbiAgICAgICAgICAgICAgICByaWdodDogMDtcbiAgICAgICAgICAgICAgICB6LWluZGV4OiAyMTQ3NDgzNjQ3O1xuICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjtcbiAgICAgICAgICAgICAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICAgICAgICAgaW5zZXQ6IDA7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwwLjUpO1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDA7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzIGVhc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0LmFjdGl2ZSAubmstYmFja2Ryb3Age1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1zaGVldCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICR7cC5wYW5lbH07XG4gICAgICAgICAgICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICR7cC5oYWlyfTtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAxNnB4IDE2cHggMCAwO1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDI0cHg7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpO1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjNzIGVhc2U7XG4gICAgICAgICAgICAgICAgYm94LXNoYWRvdzogMCAtNHB4IDIwcHggcmdiYSgwLDAsMCwwLjMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldC5hY3RpdmUgLm5rLXNoZWV0IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1oYW5kbGUge1xuICAgICAgICAgICAgICAgIHdpZHRoOiA0MHB4O1xuICAgICAgICAgICAgICAgIGhlaWdodDogNHB4O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICR7cC5oYWlyfTtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAwIGF1dG8gMTZweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWljb24ge1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMzJweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXRpdGxlIHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLnRleHR9O1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMThweDtcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNjAwO1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA4cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay10ZXh0IHtcbiAgICAgICAgICAgICAgICBjb2xvcjogJHtwLnRleHR9O1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNTtcbiAgICAgICAgICAgICAgICBtYXJnaW4tYm90dG9tOiA0cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1tdXRlZCB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICR7cC5tdXRlZH07XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxM3B4O1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJ0biB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMTRweDtcbiAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA4cHg7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgJHtwLnNpZ25hbH07XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnNpZ25hbERpbX07XG4gICAgICAgICAgICAgICAgY29sb3I6ICR7cC5zaWduYWx9O1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgICAgICAgICAgICBmb250LXdlaWdodDogNTAwO1xuICAgICAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICAgICAgICBtYXJnaW4tdG9wOiAyMHB4O1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQgMC4xNXMgZWFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLWJ0bjpob3ZlciB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHtwLnNpZ25hbERpbX07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAke3JlZHVjZU1vdGlvbiA/IGAjbm9zdHJrZXktbG9ja2VkLXNoZWV0IC5uay1iYWNrZHJvcCxcbiAgICAgICAgICAgICNub3N0cmtleS1sb2NrZWQtc2hlZXQgLm5rLXNoZWV0IHsgdHJhbnNpdGlvbjogbm9uZTsgfWAgOiAnJ31cbiAgICAgICAgICAgIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstYmFja2Ryb3AsXG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LWxvY2tlZC1zaGVldCAubmstc2hlZXQgeyB0cmFuc2l0aW9uOiBub25lOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJuay1iYWNrZHJvcFwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstc2hlZXRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1oYW5kbGVcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuay1pY29uXCI+JiN4MUY1MTI7PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstdGl0bGVcIj4ke2ZpcnN0VW5sb2NrID8gJ05vc3RyS2V5IE5lZWRzIHRvIERlY3J5cHQgWW91ciBLZXlzJyA6ICdOb3N0cktleSBpcyBMb2NrZWQnfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5rLXRleHRcIj4ke2ZpcnN0VW5sb2NrXG4gICAgICAgICAgICAgICAgPyAnVGhpcyBzaXRlIGlzIHJlcXVlc3RpbmcgeW91ciBOb3N0ciBpZGVudGl0eS4gRW50ZXIgeW91ciBtYXN0ZXIgcGFzc3dvcmQgdG8gZGVjcnlwdCB5b3VyIGtleSB2YXVsdCBmb3IgdGhpcyBzZXNzaW9uLidcbiAgICAgICAgICAgICAgICA6ICdUaGlzIHNpdGUgbmVlZHMgeW91ciBrZXkgdG8gc2lnbiBvciBlbmNyeXB0Lid9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmstbXV0ZWRcIj5DbGljayB0aGUgTm9zdHJLZXkgaWNvbiBpbiB5b3VyIHRvb2xiYXIgYW5kIGVudGVyIHlvdXIgbWFzdGVyIHBhc3N3b3JkLjwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm5rLWJ0blwiPkdvdCBpdDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICBgO1xuICAgIHJvb3QuYXBwZW5kQ2hpbGQoc2hlZXQpO1xuICAgIGxvY2tlZFNoZWV0SG9zdCA9IGhvc3Q7XG4gICAgbG9ja2VkU2hlZXRFbCA9IHNoZWV0O1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBzaGVldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKSk7XG5cbiAgICBzaGVldC5xdWVyeVNlbGVjdG9yKCcubmstYnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkaXNtaXNzTG9ja2VkU2hlZXQpO1xuICAgIHNoZWV0LnF1ZXJ5U2VsZWN0b3IoJy5uay1iYWNrZHJvcCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGlzbWlzc0xvY2tlZFNoZWV0KTtcblxuICAgIC8vIEF1dG8tZGlzbWlzcyBhZnRlciA1IHNlY29uZHNcbiAgICBsb2NrZWRTaGVldFRpbWVyID0gc2V0VGltZW91dChkaXNtaXNzTG9ja2VkU2hlZXQsIDUwMDApO1xufVxuXG5mdW5jdGlvbiBkaXNtaXNzTG9ja2VkU2hlZXQoKSB7XG4gICAgaWYgKGxvY2tlZFNoZWV0VGltZXIpIHsgY2xlYXJUaW1lb3V0KGxvY2tlZFNoZWV0VGltZXIpOyBsb2NrZWRTaGVldFRpbWVyID0gbnVsbDsgfVxuICAgIGlmICghbG9ja2VkU2hlZXRFbCkgcmV0dXJuO1xuICAgIGxvY2tlZFNoZWV0RWwuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgY29uc3QgaG9zdCA9IGxvY2tlZFNoZWV0SG9zdDtcbiAgICBsb2NrZWRTaGVldEVsID0gbnVsbDtcbiAgICBsb2NrZWRTaGVldEhvc3QgPSBudWxsO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gaG9zdCAmJiBob3N0LnJlbW92ZSgpLCAzMDApO1xufVxuXG4vLyBcdTI1MDBcdTI1MDAgUGVybWlzc2lvbiBjb25zZW50IHNoZWV0IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuLy8gVGhlIEFsbG93L0RlbnkgVUkgaXMgYW4gRVhURU5TSU9OLU9XTkVEIGlmcmFtZSAocGVybWlzc2lvbi9wZXJtaXNzaW9uLmh0bWwpXG4vLyBpbmplY3RlZCBhcyBhIGRpbW1lZCBib3R0b20gc2hlZXQsIHNvIHRoZSB1c2VyIGtlZXBzIHRoZSBzaXRlIGluIHZpZXcgZm9yXG4vLyBpbmZvcm1lZCBjb25zZW50LiBCZWNhdXNlIHRoZSBpZnJhbWUgaXMgYSBjcm9zcy1vcmlnaW4gZXh0ZW5zaW9uIHBhZ2UsIHRoZVxuLy8gd2ViIHBhZ2UgQ0FOTk9UIHNjcmlwdCBpbnRvIGl0IG9yIGNsaWNrIEFsbG93IFx1MjAxNCB0aGUgcHJvdGVjdGlvbiBob2xkcy5cbi8vIFRoZSBiYWNrZHJvcCBhbmQgdGhlIG1pbmltaXplZCBGQUIgKHRoaXMgZmlsZSwgcGFnZSBET00pIGNhcnJ5IE5PIGNvbnNlbnRcbi8vIGFjdGlvbjsgdGhleSBvbmx5IHNob3cvaGlkZSB0aGUgc2hlZXQsIHNvIHRoZXkgYXJlIHNhZmUgdG8gbGl2ZSBpbiB0aGUgcGFnZS5cbmxldCBwZXJtU2hlZXRIb3N0ID0gbnVsbDtcbmxldCBwZXJtU2hlZXRFbCA9IG51bGw7XG5sZXQgcGVybUZhYkhvc3QgPSBudWxsO1xubGV0IHBlcm1GYWJFbCA9IG51bGw7XG5sZXQgcGVybVNoZWV0U3JjID0gbnVsbDtcblxuLy8gR2VuZXJhdGlvbiBjb3VudGVyIGd1YXJkaW5nIHRoZSBhc3luYyBnYXAgaW4gc2hvd1Blcm1pc3Npb25TaGVldCAvXG4vLyBzaG93UGVybWlzc2lvbkZhYjogYSBjbG9zZVBlcm1pc3Npb25TaGVldCAob3IgYSBuZXdlciBzaG93KSBhcnJpdmluZyB3aGlsZVxuLy8gdGhlIGFwcGVhcmFuY2UgcmVhZCBpcyBpbiBmbGlnaHQgYnVtcHMgdGhlIGNvdW50ZXIsIHNvIHRoZSBzdGFsZSBjYWxsIGJhaWxzXG4vLyBpbnN0ZWFkIG9mIHJlc3VycmVjdGluZyBhIHNoZWV0IHRoZSBiYWNrZ3JvdW5kIGFscmVhZHkgY2xvc2VkLlxubGV0IG5rUGVybUdlbiA9IDA7XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3dQZXJtaXNzaW9uU2hlZXQoc3JjKSB7XG4gICAgY2xlYXJUaW1lb3V0KHBlcm1GYWJFeHBpcmVkVGltZXIpOyAvLyBhIG5ldyByZXF1ZXN0IHJlcGxhY2VzIGFuIGV4cGlyZWQgRkFCXG4gICAgcGVybVNoZWV0U3JjID0gc3JjO1xuICAgIGNvbnN0IGdlbiA9ICsrbmtQZXJtR2VuO1xuICAgIGNvbnN0IHsgcCwgcmVkdWNlTW90aW9uIH0gPSBhd2FpdCBnZXROa0xvb2soKTtcbiAgICBpZiAoZ2VuICE9PSBua1Blcm1HZW4pIHJldHVybjsgLy8gc3VwZXJzZWRlZCB3aGlsZSB3ZSBhd2FpdGVkXG4gICAgcmVtb3ZlUGVybWlzc2lvbkZhYigpO1xuICAgIGlmIChwZXJtU2hlZXRIb3N0KSBwZXJtU2hlZXRIb3N0LnJlbW92ZSgpO1xuICAgIGNvbnN0IHsgaG9zdCwgcm9vdCB9ID0gbW91bnRTaGFkb3dIb3N0KCk7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbC5pZCA9ICdub3N0cmtleS1wZXJtLXNoZWV0JztcbiAgICBlbC5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IHsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgei1pbmRleDogMjE0NzQ4MzY0NzsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWJhY2tkcm9wIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogZml4ZWQ7IGluc2V0OiAwOyBiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLDAuNSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMDske3JlZHVjZU1vdGlvbiA/ICcnIDogJyB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycyBlYXNlOyd9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldC5hY3RpdmUgLm5rLWJhY2tkcm9wIHsgb3BhY2l0eTogMTsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWZyYW1lLXdyYXAge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaXhlZDsgbGVmdDogMDsgcmlnaHQ6IDA7IGJvdHRvbTogMDtcbiAgICAgICAgICAgICAgICBtYXgtd2lkdGg6IDQ2MHB4OyBtYXJnaW46IDAgYXV0bztcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTAwJSk7JHtyZWR1Y2VNb3Rpb24gPyAnJyA6ICcgdHJhbnNpdGlvbjogdHJhbnNmb3JtIC4zcyBlYXNlOyd9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldC5hY3RpdmUgLm5rLWZyYW1lLXdyYXAgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7IH1cbiAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IGlmcmFtZSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDcydmg7IG1heC1oZWlnaHQ6IDY0MHB4O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogMDsgYm9yZGVyLXJhZGl1czogMTZweCAxNnB4IDAgMDtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIC02cHggMjhweCByZ2JhKDAsMCwwLC40NSk7IGJhY2tncm91bmQ6ICR7cC5iYXNlfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEBtZWRpYSAobWF4LWhlaWdodDogNDIwcHgpIHtcbiAgICAgICAgICAgICAgICAjbm9zdHJrZXktcGVybS1zaGVldCBpZnJhbWUgeyBoZWlnaHQ6IDkydmg7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIEBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7XG4gICAgICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tc2hlZXQgLm5rLWJhY2tkcm9wLFxuICAgICAgICAgICAgICAgICNub3N0cmtleS1wZXJtLXNoZWV0IC5uay1mcmFtZS13cmFwIHsgdHJhbnNpdGlvbjogbm9uZTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibmstYmFja2Ryb3BcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm5rLWZyYW1lLXdyYXBcIj48aWZyYW1lIHRpdGxlPVwiTm9zdHJLZXkgcGVybWlzc2lvbiByZXF1ZXN0XCI+PC9pZnJhbWU+PC9kaXY+XG4gICAgYDtcbiAgICBlbC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKS5zcmMgPSBzcmM7IC8vIHNldCB2aWEgcHJvcGVydHksIG5vdCBIVE1MIGludGVycG9sYXRpb25cbiAgICByb290LmFwcGVuZENoaWxkKGVsKTtcbiAgICBwZXJtU2hlZXRIb3N0ID0gaG9zdDtcbiAgICBwZXJtU2hlZXRFbCA9IGVsO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiBlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKSk7XG4gICAgLy8gQmFja2Ryb3AgY2xpY2sgTUlOSU1JU0VTIChyZXF1ZXN0IHN0YXlzIHBlbmRpbmcpIHJhdGhlciB0aGFuIGRpc21pc3NpbmcuXG4gICAgZWwucXVlcnlTZWxlY3RvcignLm5rLWJhY2tkcm9wJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBtaW5pbWl6ZVBlcm1pc3Npb25TaGVldCk7XG4gICAgLy8gRmFpbC1jbG9zZWQgcmVkcmVzcyBndWFyZDogdGhpcyBpcyB0aGUgYWN0dWFsIGNvbnNlbnQgc3VyZmFjZSwgc28gaWYgdGhlIHBhZ2VcbiAgICAvLyByZS1wYXJlbnRzIG9yIHZpc3VhbGx5IHN1cHByZXNzZXMgaXQgd2UgdGVhciBpdCBkb3duIChubyBjbGljayBjYW4gbGFuZCBvbiBhXG4gICAgLy8gaGlkZGVuIEFwcHJvdmUpIGFuZCBlc2NhbGF0ZSB0aGUgU0FNRSBwZW5kaW5nIHJlcXVlc3QgdG8gYSByZWRyZXNzLWltbXVuZSB0YWIuXG4gICAgc3RhcnRTaGVldEd1YXJkKCk7XG59XG5cbmZ1bmN0aW9uIG1pbmltaXplUGVybWlzc2lvblNoZWV0KCkge1xuICAgIGlmICghcGVybVNoZWV0SG9zdCkgcmV0dXJuO1xuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgcGVybVNoZWV0SG9zdC5yZW1vdmUoKTtcbiAgICBwZXJtU2hlZXRIb3N0ID0gbnVsbDtcbiAgICBwZXJtU2hlZXRFbCA9IG51bGw7XG4gICAgc2hvd1Blcm1pc3Npb25GYWIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2hvd1Blcm1pc3Npb25GYWIoKSB7XG4gICAgaWYgKHBlcm1GYWJFbCB8fCAhcGVybVNoZWV0U3JjKSByZXR1cm47XG4gICAgY29uc3QgZ2VuID0gKytua1Blcm1HZW47XG4gICAgY29uc3QgeyBwLCByZWR1Y2VNb3Rpb24gfSA9IGF3YWl0IGdldE5rTG9vaygpO1xuICAgIGlmIChnZW4gIT09IG5rUGVybUdlbikgcmV0dXJuOyAvLyBzdXBlcnNlZGVkIHdoaWxlIHdlIGF3YWl0ZWRcbiAgICBpZiAocGVybUZhYkVsIHx8ICFwZXJtU2hlZXRTcmMpIHJldHVybjtcbiAgICBjb25zdCB7IGhvc3QsIHJvb3QgfSA9IG1vdW50U2hhZG93SG9zdCgpO1xuICAgIGNvbnN0IGZhYiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZhYi5pZCA9ICdub3N0cmtleS1wZXJtLWZhYic7XG4gICAgZmFiLmlubmVySFRNTCA9IGBcbiAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIHsgcG9zaXRpb246IGZpeGVkOyByaWdodDogMTZweDsgYm90dG9tOiAxNnB4OyB6LWluZGV4OiAyMTQ3NDgzNjQ3O1xuICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZjsgfVxuICAgICAgICAgICAgI25vc3Rya2V5LXBlcm0tZmFiIC5uay1mYWIge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDsgcGFkZGluZzogMTJweCAxNnB4O1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OyBjdXJzb3I6IHBvaW50ZXI7IGJvcmRlcjogMXB4IHNvbGlkICR7cC5zaWduYWx9O1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICR7cC5wYW5lbH07IGNvbG9yOiAke3AudGV4dH07IGZvbnQtc2l6ZTogMTRweDsgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIDRweCAxOHB4IHJnYmEoMCwwLDAsLjQpOyR7cmVkdWNlTW90aW9uID8gJycgOiAnIGFuaW1hdGlvbjogbmstZmFiLXB1bHNlIDJzIGVhc2UtaW4tb3V0IGluZmluaXRlOyd9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWRvdCB7IHdpZHRoOiA4cHg7IGhlaWdodDogOHB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6ICR7cC5zaWduYWx9OyB9XG4gICAgICAgICAgICAjbm9zdHJrZXktcGVybS1mYWIgLm5rLWZhYi1jZCB7IGZvbnQtdmFyaWFudC1udW1lcmljOiB0YWJ1bGFyLW51bXM7IGNvbG9yOiAke3AubXV0ZWR9OyBmb250LXdlaWdodDogNjAwOyB9XG4gICAgICAgICAgICBAa2V5ZnJhbWVzIG5rLWZhYi1wdWxzZSB7IDAlLDEwMCV7IGJveC1zaGFkb3c6IDAgNHB4IDE4cHggcmdiYSgwLDAsMCwuNCk7fSA1MCV7IGJveC1zaGFkb3c6IDAgNHB4IDI0cHggJHtwLnNpZ25hbERpbX07fSB9XG4gICAgICAgICAgICBAbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAgICAgICAgICAgICAgICNub3N0cmtleS1wZXJtLWZhYiAubmstZmFiIHsgYW5pbWF0aW9uOiBub25lOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJuay1mYWJcIiB0eXBlPVwiYnV0dG9uXCI+PHNwYW4gY2xhc3M9XCJuay1kb3RcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJuay1mYWItbGFiZWxcIj5SZXZpZXcgc2lnbmluZyByZXF1ZXN0PC9zcGFuPjxzcGFuIGNsYXNzPVwibmstZmFiLWNkXCI+PC9zcGFuPjwvYnV0dG9uPlxuICAgIGA7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChmYWIpO1xuICAgIHBlcm1GYWJIb3N0ID0gaG9zdDtcbiAgICBwZXJtRmFiRWwgPSBmYWI7XG4gICAgZmFiLnF1ZXJ5U2VsZWN0b3IoJy5uay1mYWInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKHBlcm1TaGVldFNyYykgc2hvd1Blcm1pc3Npb25TaGVldChwZXJtU2hlZXRTcmMpO1xuICAgICAgICBlbHNlIHJlbW92ZVBlcm1pc3Npb25VSSgpOyAvLyBleHBpcmVkOiB0aGVyZSBpcyBub3RoaW5nIGxlZnQgdG8gcmV2aWV3XG4gICAgfSk7XG4gICAgc3RhcnRGYWJDb3VudGRvd24oZmFiLnF1ZXJ5U2VsZWN0b3IoJy5uay1mYWItY2QnKSk7XG59XG5cbi8vIEEgbWluaW1pemVkIHJlcXVlc3Qga2VlcHMgY291bnRpbmcgZG93bjsgc3VyZmFjZSB0aGUgcmVtYWluaW5nIHRpbWUgb24gdGhlIEZBQlxuLy8gc28gaXQgZG9lc24ndCBzaWxlbnRseSBleHBpcmUgd2hpbGUgdHVja2VkIGF3YXkuIERlYWRsaW5lIGlzIHJlYWQgZnJvbSB0aGVcbi8vIHBlbmRpbmcgc2hlZXQgVVJMIHRoYXQgYmFja2dyb3VuZCBzdGFtcGVkICg/ZGVhZGxpbmU9KS5cbmxldCBwZXJtRmFiVGltZXIgPSBudWxsO1xubGV0IHBlcm1GYWJFeHBpcmVkVGltZXIgPSBudWxsO1xuXG4vLyBIb3cgbG9uZyB0aGUgRkFCIHN0YXlzIHVwIGFmdGVyIGl0cyByZXF1ZXN0IGV4cGlyZWQsIHNvIHNvbWVvbmUgd2hvIGxvb2tzIGJhY2tcbi8vIHNlZXMgd2hhdCBoYXBwZW5lZC4gV2l0aCB0aGUgNDAgc2Vjb25kIHdpbmRvdywgdGhhdCBpcyBhIG1pbnV0ZSBvZiBhdHRlbnRpb24uXG5jb25zdCBGQUJfRVhQSVJFRF9NUyA9IDIwXzAwMDtcblxuLy8gTWluaW1pemluZyByZW1vdmVzIHRoZSBpZnJhbWUgdGhhdCBrZWVwcyBhIHN1c3BlbmRhYmxlIGJhY2tncm91bmQgYXdha2Ugd2hpbGUgYVxuLy8gcmVxdWVzdCBpcyBvcGVuIChIT0xEX05PVEVfTVMgaW4gcGVybWlzc2lvbi5qcyksIHNvIHRoZSBGQUIgdGFrZXMgb3Zlci4gVGhlIG5vdGVcbi8vIGNhcnJpZXMgbm8gZGVjaXNpb24gYW5kIG5vIHJlcXVlc3QgZGF0YS5cbmNvbnN0IEZBQl9IT0xEX05PVEVfTVMgPSAxMF8wMDA7XG5sZXQgbGFzdEZhYkhvbGROb3RlID0gMDtcblxuZnVuY3Rpb24gaG9sZE1pbmltaXplZFJlcXVlc3QoKSB7XG4gICAgaWYgKERhdGUubm93KCkgLSBsYXN0RmFiSG9sZE5vdGUgPCBGQUJfSE9MRF9OT1RFX01TKSByZXR1cm47XG4gICAgbGFzdEZhYkhvbGROb3RlID0gRGF0ZS5ub3coKTtcbiAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdob2xkTWluaW1pemVkUHJvbXB0JyB9KT8uY2F0Y2g/LigoKSA9PiB7fSk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RmFiQ291bnRkb3duKGNkRWwpIHtcbiAgICBzdG9wRmFiQ291bnRkb3duKCk7XG4gICAgbGFzdEZhYkhvbGROb3RlID0gMDsgLy8gdGhlIGlmcmFtZSdzIGxhc3Qgbm90ZSBtYXkgYmUgbmVhcmx5IDEwIHNlY29uZHMgb2xkXG4gICAgY29uc3QgZGVhZGxpbmUgPSBzaGVldERlYWRsaW5lKCk7XG4gICAgaWYgKCFkZWFkbGluZSB8fCAhY2RFbCkgcmV0dXJuO1xuICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGRlYWRsaW5lIC0gRGF0ZS5ub3coKTtcbiAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7IHNob3dGYWJFeHBpcmVkKCk7IHJldHVybjsgfVxuICAgICAgICBob2xkTWluaW1pemVkUmVxdWVzdCgpO1xuICAgICAgICBjZEVsLnRleHRDb250ZW50ID0gYFx1MDBCNyAke01hdGguY2VpbChyZW1haW5pbmcgLyAxMDAwKX1zYDtcbiAgICB9O1xuICAgIHRpY2soKTtcbiAgICBwZXJtRmFiVGltZXIgPSBzZXRJbnRlcnZhbCh0aWNrLCAyNTApO1xufVxuZnVuY3Rpb24gc2hlZXREZWFkbGluZSgpIHtcbiAgICB0cnkgeyByZXR1cm4gTnVtYmVyKG5ldyBVUkwocGVybVNoZWV0U3JjKS5zZWFyY2hQYXJhbXMuZ2V0KCdkZWFkbGluZScpKSB8fCAwOyB9IGNhdGNoIChfKSB7IHJldHVybiAwOyB9XG59XG5cbi8qKiBUaGUgRkFCJ3MgcmVxdWVzdCBoYXMgZXhwaXJlZDogc2F5IHNvLCBzdG9wIG9mZmVyaW5nIGl0LCBhbmQgbGVhdmUgc2hvcnRseS4gKi9cbmZ1bmN0aW9uIHNob3dGYWJFeHBpcmVkKCkge1xuICAgIHN0b3BGYWJDb3VudGRvd24oKTtcbiAgICBwZXJtU2hlZXRTcmMgPSBudWxsO1xuICAgIGNvbnN0IGZhYiA9IHBlcm1GYWJFbC5xdWVyeVNlbGVjdG9yKCcubmstZmFiJyk7XG4gICAgZmFiLnN0eWxlLmFuaW1hdGlvbiA9ICdub25lJztcbiAgICBmYWIucXVlcnlTZWxlY3RvcignLm5rLWZhYi1sYWJlbCcpLnRleHRDb250ZW50ID0gJ1NpZ25pbmcgcmVxdWVzdCBleHBpcmVkJztcbiAgICBmYWIucXVlcnlTZWxlY3RvcignLm5rLWZhYi1jZCcpLnRleHRDb250ZW50ID0gJyc7XG4gICAgY2xlYXJUaW1lb3V0KHBlcm1GYWJFeHBpcmVkVGltZXIpO1xuICAgIHBlcm1GYWJFeHBpcmVkVGltZXIgPSBzZXRUaW1lb3V0KHJlbW92ZVBlcm1pc3Npb25VSSwgRkFCX0VYUElSRURfTVMpO1xufVxuXG4vKipcbiAqIFRoZSBiYWNrZ3JvdW5kIGNsb3NlcyB0aGUgVUkgd2hlbiBhIHJlcXVlc3QgZW5kcy4gQSBtaW5pbWl6ZWQgRkFCIHRoYXQgcmVhY2hlZFxuICogaXRzIGRlYWRsaW5lIHN0YXlzIHVwIHRvIHNheSBpdCBleHBpcmVkLiBBbnl0aGluZyBlbHNlIGNsb3NlcyBub3cuXG4gKi9cbmZ1bmN0aW9uIGNsb3NlUGVybWlzc2lvblVJKCkge1xuICAgIGlmIChwZXJtRmFiRWwgJiYgIXBlcm1TaGVldFNyYykgcmV0dXJuOyAvLyBhbHJlYWR5IHNob3dpbmcgdGhhdCBpdCBleHBpcmVkXG4gICAgY29uc3QgYXREZWFkbGluZSA9IHBlcm1GYWJFbCAmJiBzaGVldERlYWRsaW5lKCkgJiYgRGF0ZS5ub3coKSA+PSBzaGVldERlYWRsaW5lKCkgLSA1MDA7XG4gICAgaWYgKGF0RGVhZGxpbmUpIHNob3dGYWJFeHBpcmVkKCk7XG4gICAgZWxzZSByZW1vdmVQZXJtaXNzaW9uVUkoKTtcbn1cblxuZnVuY3Rpb24gc3RvcEZhYkNvdW50ZG93bigpIHtcbiAgICBpZiAocGVybUZhYlRpbWVyKSB7IGNsZWFySW50ZXJ2YWwocGVybUZhYlRpbWVyKTsgcGVybUZhYlRpbWVyID0gbnVsbDsgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVQZXJtaXNzaW9uRmFiKCkge1xuICAgIHN0b3BGYWJDb3VudGRvd24oKTtcbiAgICBjbGVhclRpbWVvdXQocGVybUZhYkV4cGlyZWRUaW1lcik7XG4gICAgaWYgKHBlcm1GYWJIb3N0KSB7IHBlcm1GYWJIb3N0LnJlbW92ZSgpOyBwZXJtRmFiSG9zdCA9IG51bGw7IH1cbiAgICBwZXJtRmFiRWwgPSBudWxsO1xufVxuXG5mdW5jdGlvbiByZW1vdmVQZXJtaXNzaW9uVUkoKSB7XG4gICAgbmtQZXJtR2VuKys7IC8vIGludmFsaWRhdGUgYW55IHNob3cqIHN0aWxsIGF3YWl0aW5nIGl0cyBhcHBlYXJhbmNlIHJlYWRcbiAgICBzdG9wU2hlZXRHdWFyZCgpO1xuICAgIGlmIChwZXJtU2hlZXRIb3N0KSB7IHBlcm1TaGVldEhvc3QucmVtb3ZlKCk7IHBlcm1TaGVldEhvc3QgPSBudWxsOyBwZXJtU2hlZXRFbCA9IG51bGw7IH1cbiAgICByZW1vdmVQZXJtaXNzaW9uRmFiKCk7XG4gICAgcGVybVNoZWV0U3JjID0gbnVsbDtcbn1cblxuLy8gXHUyNTAwXHUyNTAwIFNoZWV0IHJlZHJlc3MgZ3VhcmQgKGZhaWwtY2xvc2VkKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8vIFRoZSBjb25zZW50IGlmcmFtZSBsaXZlcyBpbiBwYWdlIGxpZ2h0IERPTSwgc28gYSBwYWdlIHdpdGggRE9NLXdyaXRlIGFjY2VzcyBjYW5cbi8vIHN0aWxsIHJlLXBhcmVudCBvdXIgaG9zdCB1bmRlciBhIHRyYW5zcGFyZW50IGdyb3VwIChvcGFjaXR5L2ZpbHRlcikgb3Igb3RoZXJ3aXNlXG4vLyBzdXBwcmVzcyBpdCB3aGlsZSBrZWVwaW5nIGl0IGNsaWNrYWJsZSBcdTIwMTQgbHVyaW5nIGEgY2xpY2sgb250byB0aGUgcmVhbCBBcHByb3ZlLlxuLy8gVGhlIGlubGluZSBob3N0IHBpbnMgY2Fubm90IG9wdCBhIHN1YnRyZWUgb3V0IG9mIGFuIEFOQ0VTVE9SIGdyb3VwIGVmZmVjdC4gU28gd2Vcbi8vIGFjdGl2ZWx5IHdhdGNoOiBpZiB0aGUgc3VyZmFjZSBzdG9wcyBiZWluZyBmdWxseSB2aXNpYmxlIC8gY29ycmVjdGx5IHBhcmVudGVkLFxuLy8gd2UgZGVzdHJveSBpdCAobm90aGluZyBsZWZ0IHRvIG1pcy1jbGljaykgYW5kIGhhbmQgdGhlIHJlcXVlc3QgdG8gdGhlIHRhYiwgd2hpY2hcbi8vIHRoZSBwYWdlIGNhbm5vdCBzdHlsZSBhdCBhbGwuXG5sZXQgc2hlZXRHdWFyZE9ic2VydmVyID0gbnVsbDtcbmxldCBzaGVldEd1YXJkVGltZXIgPSBudWxsO1xuXG5mdW5jdGlvbiBzdHlsZVN1cHByZXNzZXMoY3MpIHtcbiAgICBpZiAoIWNzKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChjcy5vcGFjaXR5KSA8IDAuOVxuICAgICAgICB8fCBjcy52aXNpYmlsaXR5ICE9PSAndmlzaWJsZSdcbiAgICAgICAgfHwgY3MuZGlzcGxheSA9PT0gJ25vbmUnXG4gICAgICAgIHx8IGNzLnBvaW50ZXJFdmVudHMgPT09ICdub25lJ1xuICAgICAgICB8fCBjcy5maWx0ZXIgIT09ICdub25lJ1xuICAgICAgICB8fCBjcy50cmFuc2Zvcm0gIT09ICdub25lJ1xuICAgICAgICB8fCBjcy5taXhCbGVuZE1vZGUgIT09ICdub3JtYWwnXG4gICAgICAgIHx8IGNzLmNsaXBQYXRoICE9PSAnbm9uZSdcbiAgICAgICAgfHwgY3MucGVyc3BlY3RpdmUgIT09ICdub25lJ1xuICAgICAgICB8fCBjcy5jb250ZW50VmlzaWJpbGl0eSA9PT0gJ2hpZGRlbidcbiAgICAgICAgfHwgKGNzLm1hc2sgJiYgY3MubWFzayAhPT0gJ25vbmUnKVxuICAgICAgICB8fCAoY3Mud2Via2l0TWFzayAmJiBjcy53ZWJraXRNYXNrICE9PSAnbm9uZScpXG4gICAgICAgIHx8IChjcy5iYWNrZHJvcEZpbHRlciAmJiBjcy5iYWNrZHJvcEZpbHRlciAhPT0gJ25vbmUnKTtcbn1cblxuZnVuY3Rpb24gc2hlZXRMb29rc0NvbXByb21pc2VkKCkge1xuICAgIGNvbnN0IGhvc3QgPSBwZXJtU2hlZXRIb3N0O1xuICAgIGlmICghaG9zdCB8fCAhaG9zdC5pc0Nvbm5lY3RlZCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGhvc3QucGFyZW50Tm9kZSAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSByZXR1cm4gdHJ1ZTsgLy8gcmUtcGFyZW50ZWRcbiAgICB0cnkge1xuICAgICAgICBpZiAoc3R5bGVTdXBwcmVzc2VzKGdldENvbXB1dGVkU3R5bGUoaG9zdCkpKSByZXR1cm4gdHJ1ZTsgICAgICAgLy8gaG9zdCBib3hcbiAgICAgICAgaWYgKHN0eWxlU3VwcHJlc3NlcyhnZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkpKSByZXR1cm4gdHJ1ZTsgLy8gc29sZSBhbmNlc3RvclxuICAgICAgICBjb25zdCBpZnJhbWUgPSBwZXJtU2hlZXRFbCAmJiBwZXJtU2hlZXRFbC5xdWVyeVNlbGVjdG9yKCdpZnJhbWUnKTtcbiAgICAgICAgaWYgKCFpZnJhbWUpIHJldHVybiB0cnVlO1xuICAgICAgICBjb25zdCBpZmNzID0gZ2V0Q29tcHV0ZWRTdHlsZShpZnJhbWUpO1xuICAgICAgICBpZiAocGFyc2VGbG9hdChpZmNzLm9wYWNpdHkpIDwgMC45IHx8IGlmY3MudmlzaWJpbGl0eSAhPT0gJ3Zpc2libGUnKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBpZiB3ZSBjYW4ndCB2ZXJpZnksIGZhaWwgY2xvc2VkXG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gb25TaGVldENvbXByb21pc2VkKCkge1xuICAgIHN0b3BTaGVldEd1YXJkKCk7XG4gICAgcmVtb3ZlUGVybWlzc2lvblVJKCk7IC8vIGRlc3Ryb3kgdGhlIGluLXBhZ2Ugc3VyZmFjZSBcdTIwMTQgbm8gaGlkZGVuIEFwcHJvdmUgdG8gY2xpY2tcbiAgICAvLyBBc2sgdGhlIGJhY2tncm91bmQgdG8gcmVvcGVuIHRoZSBTQU1FIHBlbmRpbmcgcHJvbXB0IGFzIGEgZGVkaWNhdGVkIHRhYi5cbiAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdwZXJtaXNzaW9uU2hlZXRDb21wcm9taXNlZCcgfSkuY2F0Y2goKCkgPT4ge30pO1xufVxuXG5mdW5jdGlvbiBzdGFydFNoZWV0R3VhcmQoKSB7XG4gICAgc3RvcFNoZWV0R3VhcmQoKTtcbiAgICB0cnkge1xuICAgICAgICBzaGVldEd1YXJkT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2hlZXRMb29rc0NvbXByb21pc2VkKCkpIG9uU2hlZXRDb21wcm9taXNlZCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gY2hpbGRMaXN0L3N1YnRyZWUgY2F0Y2hlcyByZS1wYXJlbnRpbmc7IHN0eWxlL2NsYXNzIGF0dHJzIGNhdGNoIGEgcGFnZVxuICAgICAgICAvLyBkcm9wcGluZyBhIGZpbHRlci9vcGFjaXR5IG9udG8gPGh0bWw+IG9yIHdyYXBwaW5nIG91ciBob3N0LlxuICAgICAgICBzaGVldEd1YXJkT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsnc3R5bGUnLCAnY2xhc3MnXSxcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKF8pIHsgLyogb2JzZXJ2ZXIgdW5hdmFpbGFibGUgXHUyMDE0IHBvbGwgc3RpbGwgY292ZXJzIHVzICovIH1cbiAgICAvLyBCYWNrc3RvcCBmb3IgZWZmZWN0cyBhIG11dGF0aW9uIGNhbid0IHN1cmZhY2UgKHN0eWxlc2hlZXQgc3dhcHMsIDpob3ZlciBydWxlcykuXG4gICAgc2hlZXRHdWFyZFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoc2hlZXRMb29rc0NvbXByb21pc2VkKCkpIG9uU2hlZXRDb21wcm9taXNlZCgpO1xuICAgIH0sIDIwMCk7XG59XG5cbmZ1bmN0aW9uIHN0b3BTaGVldEd1YXJkKCkge1xuICAgIGlmIChzaGVldEd1YXJkT2JzZXJ2ZXIpIHsgc2hlZXRHdWFyZE9ic2VydmVyLmRpc2Nvbm5lY3QoKTsgc2hlZXRHdWFyZE9ic2VydmVyID0gbnVsbDsgfVxuICAgIGlmIChzaGVldEd1YXJkVGltZXIpIHsgY2xlYXJJbnRlcnZhbChzaGVldEd1YXJkVGltZXIpOyBzaGVldEd1YXJkVGltZXIgPSBudWxsOyB9XG59XG5cbi8vIE1pbmltaXNlIGFuZCBjbG9zZSBzaWduYWxzIGZyb20gaW5zaWRlIHRoZSBwZXJtaXNzaW9uIGlmcmFtZSAoZXh0ZW5zaW9uIG9yaWdpbikuXG4vLyBUaGVzZSBhcmUgaGFybWxlc3MgVUkgYWN0aW9ucyAoaGlkZSB0aGUgc2hlZXQpLCBzbyBjb25maXJtaW5nIHRoZXkgY2FtZSBmcm9tIE9VUlxuLy8gaWZyYW1lIGlzIGVub3VnaCBcdTIwMTQgbm8gY29uc2VudCBkZWNpc2lvbiB0cmF2ZWxzIHRoaXMgY2hhbm5lbC5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2KSA9PiB7XG4gICAgaWYgKCFwZXJtU2hlZXRFbCkgcmV0dXJuO1xuICAgIGNvbnN0IGlmcmFtZSA9IHBlcm1TaGVldEVsLnF1ZXJ5U2VsZWN0b3IoJ2lmcmFtZScpO1xuICAgIGlmICghaWZyYW1lIHx8IGV2LnNvdXJjZSAhPT0gaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHJldHVybjtcbiAgICBpZiAoZXYuZGF0YSAmJiBldi5kYXRhLl9fbm9zdHJrZXlfcGVybSA9PT0gJ21pbmltaXplJykgbWluaW1pemVQZXJtaXNzaW9uU2hlZXQoKTtcbiAgICBpZiAoZXYuZGF0YSAmJiBldi5kYXRhLl9fbm9zdHJrZXlfcGVybSA9PT0gJ2Nsb3NlJykgcmVtb3ZlUGVybWlzc2lvblVJKCk7XG59KTtcblxuLy8gTGlzdGVuIGZvciByZXF1ZXN0cyBmcm9tIGJhY2tncm91bmRcbmFwaS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICAvLyBOT1RFOiBjb25zZW50IChBbGxvdy9EZW55KSBpcyBOT1QgcmVuZGVyZWQgaW4gdGhlIHBhZ2UgRE9NLiBJdCBsaXZlcyBpbiB0aGVcbiAgICAvLyBleHRlbnNpb24tb3duZWQgcGVybWlzc2lvbiBpZnJhbWUgKHNlZSBzaG93UGVybWlzc2lvblNoZWV0KTtcbiAgICAvLyBhIHdlYiBwYWdlIGNhbiBuZWl0aGVyIHNjcmlwdCBpbnRvIGl0IG5vciBjbGljayBBbGxvdy5cbiAgICBpZiAobWVzc2FnZS5raW5kID09PSAnc2hvd0xvY2tlZFNoZWV0Jykge1xuICAgICAgICBzaG93TG9ja2VkU2hlZXQobWVzc2FnZS5maXJzdFVubG9jayB8fCBmYWxzZSk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChtZXNzYWdlLmtpbmQgPT09ICdzaG93UGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICBzaG93UGVybWlzc2lvblNoZWV0KG1lc3NhZ2UudXJsKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHRydWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG1lc3NhZ2Uua2luZCA9PT0gJ2Nsb3NlUGVybWlzc2lvblNoZWV0Jykge1xuICAgICAgICBjbG9zZVBlcm1pc3Npb25VSSgpO1xuICAgICAgICBzZW5kUmVzcG9uc2UodHJ1ZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn0pO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGFzeW5jIG1lc3NhZ2UgPT4ge1xuICAgIC8vIEMzIGZpeDogT25seSBhY2NlcHQgbWVzc2FnZXMgZnJvbSB0aGUgdG9wLWxldmVsIHBhZ2UgY29udGV4dFxuICAgIGlmIChtZXNzYWdlLnNvdXJjZSAhPT0gd2luZG93KSByZXR1cm47XG5cbiAgICAvLyBQYWdlLXJlYWNoYWJsZSBtZXRob2RzIG9ubHkuIGV4cG9ydFByb2ZpbGUgYW5kIGJ1bmtlclNlcnZlci4qIGFyZVxuICAgIC8vIGRlbGliZXJhdGVseSBleGNsdWRlZCBcdTIwMTQgdGhvc2UgYXJlIHByaXZpbGVnZWQgYW5kIG1heSBvcmlnaW5hdGUgT05MWSBmcm9tXG4gICAgLy8gdGhlIGV4dGVuc2lvbiBVSS5cbiAgICBjb25zdCB2YWxpZEV2ZW50cyA9IFtcbiAgICAgICAgJ2dldFB1YktleScsXG4gICAgICAgICdzaWduRXZlbnQnLFxuICAgICAgICAnZ2V0UmVsYXlzJyxcbiAgICAgICAgJ2FkZFJlbGF5JyxcbiAgICAgICAgJ25pcDA0LmVuY3J5cHQnLFxuICAgICAgICAnbmlwMDQuZGVjcnlwdCcsXG4gICAgICAgICduaXA0NC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDQ0LmRlY3J5cHQnLFxuICAgICAgICAncmVwbGFjZVVSTCcsXG4gICAgXTtcbiAgICBsZXQgeyBraW5kLCByZXFJZCwgcGF5bG9hZCB9ID0gbWVzc2FnZS5kYXRhO1xuICAgIGlmICghdmFsaWRFdmVudHMuaW5jbHVkZXMoa2luZCkpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIHBheWxvYWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgICAgIC8vIE5LLTAzOiBrZXkgcGVybWlzc2lvbiBncmFudHMgb24gdGhlIGZ1bGwgb3JpZ2luIChzY2hlbWUraG9zdFs6cG9ydF0pLFxuICAgICAgICAgICAgLy8gbm90IHRoZSBiYXJlIGhvc3QsIHNvIGh0dHAvaHR0cHMgYW5kIGRpZmZlcmVudCBwb3J0cyBkb24ndCBzaGFyZSBncmFudHMuXG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcGF5bG9hZCA9IHsgZXJyb3I6ICdjb25uZWN0aW9uX2Vycm9yJyB9O1xuICAgIH1cblxuICAgIC8vIEEgZmFpbHVyZSByZWFjaGVzIHRoZSBwYWdlIGFzIGl0cyBjb2RlIG9ubHkuIFdvcmtlciB0ZXh0IChhIHJlbW90ZSBzaWduZXInc1xuICAgIC8vIG93biBlcnJvciwgZm9yIG9uZSkgbmV2ZXIgbGVhdmVzIHRoZSBleHRlbnNpb24uXG4gICAgaWYgKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JyAmJiBwYXlsb2FkICE9PSBudWxsICYmIHR5cGVvZiBwYXlsb2FkLmVycm9yID09PSAnc3RyaW5nJykge1xuICAgICAgICBwYXlsb2FkID0geyBlcnJvcjogcGF5bG9hZC5lcnJvciB9O1xuICAgIH1cblxuICAgIGtpbmQgPSBgcmV0dXJuXyR7a2luZH1gO1xuXG4gICAgLy8gTkstNSAvIE5LLTY6IHN0YW1wIHRoZSBwcml2YXRlIGNoYW5uZWwgdG9rZW4gYW5kIHRhcmdldCB0aGlzIHBhZ2UncyBvd25cbiAgICAvLyBvcmlnaW4gc28gYSBzYW1lLXBhZ2Ugc2NyaXB0IGNhbid0IGZvcmdlL29ic2VydmUgY3Jvc3Mtb3JpZ2luLlxuICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7IGtpbmQsIHJlcUlkLCBwYXlsb2FkLCB0b2tlbjogTktfQ0hBTk5FTF9UT0tFTiB9LCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFD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
