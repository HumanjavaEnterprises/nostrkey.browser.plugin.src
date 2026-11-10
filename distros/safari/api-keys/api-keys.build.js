(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/shims/process.js
  var init_process = __esm({
    "src/shims/process.js"() {
    }
  });

  // src/utilities/browser-polyfill.js
  var browser_polyfill_exports = {};
  __export(browser_polyfill_exports, {
    api: () => api,
    isChrome: () => isChrome
  });
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
  var _browser, isChrome, api;
  var init_browser_polyfill = __esm({
    "src/utilities/browser-polyfill.js"() {
      init_process();
      _browser = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
      if (!_browser) {
        throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");
      }
      isChrome = typeof browser === "undefined" && typeof chrome !== "undefined";
      api = {};
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
    }
  });

  // node_modules/idb/build/index.js
  var build_exports = {};
  __export(build_exports, {
    deleteDB: () => deleteDB,
    openDB: () => openDB,
    unwrap: () => unwrap,
    wrap: () => wrap
  });
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBDatabase,
      IDBObjectStore,
      IDBIndex,
      IDBCursor,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey
    ]);
  }
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error);
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error);
        tx.removeEventListener("abort", error);
      };
      const complete = () => {
        resolve();
        unlisten();
      };
      const error = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error);
      tx.addEventListener("abort", error);
    });
    transactionDoneMap.set(tx, done);
  }
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(this.request);
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (newValue !== value) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  function deleteDB(name, { blocked } = {}) {
    const request = indexedDB.deleteDatabase(name);
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event
      ));
    }
    return wrap(request).then(() => void 0);
  }
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods.get(prop))
      return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
  }
  async function* iterate(...args) {
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) {
      cursor = await cursor.openCursor(...args);
    }
    if (!cursor)
      return;
    cursor = cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while (cursor) {
      yield proxiedCursor;
      cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
      advanceResults.delete(proxiedCursor);
    }
  }
  function isIteratorProp(target, prop) {
    return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
  }
  var instanceOfAny, idbProxyableTypes, cursorAdvanceMethods, transactionDoneMap, transformCache, reverseTransformCache, idbProxyTraps, unwrap, readMethods, writeMethods, cachedMethods, advanceMethodProps, methodMap, advanceResults, ittrProxiedCursorToOriginalProxy, cursorIteratorTraps;
  var init_build = __esm({
    "node_modules/idb/build/index.js"() {
      init_process();
      instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
      transactionDoneMap = /* @__PURE__ */ new WeakMap();
      transformCache = /* @__PURE__ */ new WeakMap();
      reverseTransformCache = /* @__PURE__ */ new WeakMap();
      idbProxyTraps = {
        get(target, prop, receiver) {
          if (target instanceof IDBTransaction) {
            if (prop === "done")
              return transactionDoneMap.get(target);
            if (prop === "store") {
              return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
            }
          }
          return wrap(target[prop]);
        },
        set(target, prop, value) {
          target[prop] = value;
          return true;
        },
        has(target, prop) {
          if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
            return true;
          }
          return prop in target;
        }
      };
      unwrap = (value) => reverseTransformCache.get(value);
      readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
      writeMethods = ["put", "add", "delete", "clear"];
      cachedMethods = /* @__PURE__ */ new Map();
      replaceTraps((oldTraps) => ({
        ...oldTraps,
        get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
      }));
      advanceMethodProps = ["continue", "continuePrimaryKey", "advance"];
      methodMap = {};
      advanceResults = /* @__PURE__ */ new WeakMap();
      ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
      cursorIteratorTraps = {
        get(target, prop) {
          if (!advanceMethodProps.includes(prop))
            return target[prop];
          let cachedFunc = methodMap[prop];
          if (!cachedFunc) {
            cachedFunc = methodMap[prop] = function(...args) {
              advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
            };
          }
          return cachedFunc;
        }
      };
      replaceTraps((oldTraps) => ({
        ...oldTraps,
        get(target, prop, receiver) {
          if (isIteratorProp(target, prop))
            return iterate;
          return oldTraps.get(target, prop, receiver);
        },
        has(target, prop) {
          return isIteratorProp(target, prop) || oldTraps.has(target, prop);
        }
      }));
    }
  });

  // src/api-keys/api-keys.js
  init_process();

  // src/utilities/copy-secret.js
  init_process();
  var SECRET_CLEAR_MS = 6e4;
  var pendingClear = null;
  async function copySecret(text, opts = {}) {
    const clipboard = opts.clipboard || (typeof navigator !== "undefined" ? navigator.clipboard : void 0);
    if (!clipboard?.writeText) throw new Error("Clipboard unavailable");
    await clipboard.writeText(text);
    if (pendingClear) clearTimeout(pendingClear);
    pendingClear = setTimeout(() => {
      pendingClear = null;
      try {
        Promise.resolve(clipboard.writeText("")).catch(() => {
        });
      } catch (_) {
      }
    }, opts.delayMs ?? SECRET_CLEAR_MS);
  }

  // src/api-keys/api-keys.js
  init_browser_polyfill();

  // src/utilities/page-gate.js
  init_process();
  init_browser_polyfill();
  var START_ERROR = "NostrKey could not start this page. Reload or reinstall.";
  var GateRefused = class extends Error {
  };
  function isRefused(answer) {
    return !!answer && typeof answer === "object" && answer.success === false;
  }
  function showStartError() {
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.dataset.startError = "";
    message.textContent = START_ERROR;
    message.style.padding = "16px";
    document.body.replaceChildren(message);
  }
  async function askGate(kind) {
    const answer = await api.runtime.sendMessage({ kind });
    if (isRefused(answer)) {
      showStartError();
      throw new GateRefused();
    }
    return answer;
  }
  var ACTIVITY_NOTE_MS = 3e4;
  function watchActivity() {
    let lastNote = 0;
    const note = () => {
      if (Date.now() - lastNote < ACTIVITY_NOTE_MS) return;
      lastNote = Date.now();
      api.runtime.sendMessage({ kind: "resetAutoLock" })?.catch?.(() => {
      });
    };
    document.addEventListener("pointerdown", note, { capture: true, passive: true });
    document.addEventListener("keydown", note, { capture: true, passive: true });
  }
  async function startPage(init2) {
    watchActivity();
    try {
      await init2();
    } catch (e) {
      if (!(e instanceof GateRefused)) throw e;
    }
  }

  // src/ins-confirm.js
  init_process();
  var queue = Promise.resolve();
  var idCounter = 0;
  function motionOff() {
    if (document.documentElement.getAttribute("data-ins-motion") === "off") return true;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }
  function openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice }) {
    return new Promise((resolve) => {
      const prevFocus = document.activeElement;
      const root = document.createElement("div");
      root.className = "ins-consent-root";
      const backdrop = document.createElement("div");
      backdrop.className = "ins-consent-backdrop";
      const isSheet = variant !== "popover";
      const dialog = document.createElement("div");
      dialog.className = isSheet ? "ins-consent-sheet" : "ins-consent-popover";
      dialog.setAttribute("role", destructive || notice ? "alertdialog" : "dialog");
      dialog.setAttribute("aria-modal", "true");
      if (isSheet) {
        const handle = document.createElement("div");
        handle.className = "ins-consent-handle";
        dialog.appendChild(handle);
      }
      const uid = ++idCounter;
      const titleEl = document.createElement("h2");
      titleEl.className = "ins-consent-title";
      titleEl.id = `ins-consent-title-${uid}`;
      titleEl.textContent = title || "";
      dialog.appendChild(titleEl);
      dialog.setAttribute("aria-labelledby", titleEl.id);
      const bodyEl = document.createElement("p");
      bodyEl.className = "ins-consent-body";
      bodyEl.id = `ins-consent-body-${uid}`;
      bodyEl.textContent = body || "";
      dialog.appendChild(bodyEl);
      dialog.setAttribute("aria-describedby", bodyEl.id);
      const actions = document.createElement("div");
      actions.className = "ins-consent-actions";
      const buttons = [];
      let cancelBtn = null;
      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.textContent = confirmLabel;
      if (notice) {
        confirmBtn.className = "btn";
      } else {
        cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "btn btn--ghost";
        cancelBtn.textContent = cancelLabel;
        actions.appendChild(cancelBtn);
        buttons.push(cancelBtn);
        confirmBtn.className = destructive ? "btn btn--destructive" : "btn btn--primary";
      }
      actions.appendChild(confirmBtn);
      buttons.push(confirmBtn);
      dialog.appendChild(actions);
      root.appendChild(backdrop);
      root.appendChild(dialog);
      let settled = false;
      function settle(result) {
        if (settled) return;
        settled = true;
        document.removeEventListener("keydown", onKeydown, true);
        backdrop.classList.remove("is-open");
        dialog.classList.remove("is-open");
        const finish = () => {
          root.remove();
          try {
            if (prevFocus && typeof prevFocus.focus === "function" && document.contains(prevFocus)) {
              prevFocus.focus();
            }
          } catch (_) {
          }
          resolve(result);
        };
        if (motionOff()) finish();
        else setTimeout(finish, 250);
      }
      function onKeydown(ev) {
        if (ev.key === "Escape") {
          ev.preventDefault();
          settle(false);
          return;
        }
        if (ev.key === "Tab") {
          ev.preventDefault();
          const idx = buttons.indexOf(document.activeElement);
          const dir = ev.shiftKey ? -1 : 1;
          buttons[(idx + dir + buttons.length) % buttons.length].focus();
        }
      }
      backdrop.addEventListener("click", () => settle(false));
      if (cancelBtn) cancelBtn.addEventListener("click", () => settle(false));
      confirmBtn.addEventListener("click", () => settle(true));
      document.addEventListener("keydown", onKeydown, true);
      document.body.appendChild(root);
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        dialog.classList.add("is-open");
        const initial = notice ? confirmBtn : destructive ? cancelBtn : confirmBtn;
        (initial || confirmBtn).focus();
      });
    });
  }
  function insConfirm({
    title,
    body,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    variant = "sheet"
  } = {}) {
    const result = queue.then(() => openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice: false }));
    queue = result.catch(() => {
    });
    return result;
  }

  // src/utilities/api-key-store.js
  init_process();
  init_browser_polyfill();

  // src/utilities/sync-manager.js
  init_process();

  // src/utilities/sync-merge.js
  init_process();
  function isTombstoned(tombstones, key, time) {
    if (!tombstones || typeof tombstones !== "object") return false;
    const ts = tombstones[key];
    return ts != null && (time || 0) <= ts;
  }
  function mergeRemote(local, remote, tombstones, opts = {}) {
    const timeOf = opts.timeOf || ((item) => item && item.updatedAt || 0);
    const merged = { ...local || {} };
    let changed = false;
    for (const [key, item] of Object.entries(remote || {})) {
      if (!item) continue;
      if (isTombstoned(tombstones, key, timeOf(item))) continue;
      const mine = merged[key];
      if (!mine || timeOf(item) > timeOf(mine)) {
        merged[key] = item;
        changed = true;
      }
    }
    for (const key of Object.keys(merged)) {
      if (isTombstoned(tombstones, key, timeOf(merged[key]))) {
        delete merged[key];
        changed = true;
      }
    }
    return { merged, changed };
  }

  // src/utilities/sync-manager.js
  init_browser_polyfill();

  // src/utilities/secret-vault.js
  init_process();

  // src/utilities/crypto.js
  init_process();
  var IV_BYTES = 12;
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  async function encryptWithKey(plaintext, key, salt) {
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plaintext)
    );
    return JSON.stringify({
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext)
    });
  }
  async function decryptWithKey(encryptedData, key) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const ivBuf = new Uint8Array(base64ToArrayBuffer(iv));
    const ctBuf = base64ToArrayBuffer(ciphertext);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      key,
      ctBuf
    );
    return new TextDecoder().decode(plainBuf);
  }

  // src/utilities/secret-vault.js
  var IV_BYTES2 = 12;
  var DEVICE_DB = "nostrkey-secret-vault";
  var DEVICE_STORE = "keys";
  var DEVICE_KEY_ID = "device-wrap-key-v1";
  var DEVICE_SEED_KEY = "deviceKeySeed";
  var DEVICE_SEED_BYTES = 32;
  var DEVICE_STRATEGY_KEY = "deviceKeyStrategy";
  function abToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function base64ToAb(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  var _sessionKey = null;
  var _sessionSalt = null;
  var _unlocked = null;
  function setUnlocked(v) {
    _unlocked = v === null ? null : !!v;
  }
  var _deviceKeyPromise = null;
  var _deviceStrategy = null;
  var _memoryDeviceKey = null;
  var _legacyIdbKeyPromise = null;
  var _existingSeedKeyPromise = null;
  async function generateDeviceKey() {
    return crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      // NON-extractable: raw bytes can never be read back out
      ["encrypt", "decrypt"]
    );
  }
  function indexedDbAvailable() {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  }
  async function keyRoundTrips(key) {
    if (!key) return false;
    try {
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES2));
      const probe = new TextEncoder().encode("nostrkey-device-probe");
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, probe);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      return new TextDecoder().decode(pt) === "nostrkey-device-probe";
    } catch {
      return false;
    }
  }
  async function openDeviceDb() {
    const { openDB: openDB2 } = await Promise.resolve().then(() => (init_build(), build_exports));
    return openDB2(DEVICE_DB, 1, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(DEVICE_STORE)) {
          d.createObjectStore(DEVICE_STORE);
        }
      }
    });
  }
  async function tryIdbDeviceKey() {
    if (!indexedDbAvailable()) return null;
    try {
      const db = await openDeviceDb();
      const existing = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
      if (!existing) return null;
      return await keyRoundTrips(existing) ? existing : null;
    } catch {
      return null;
    }
  }
  async function seedStorage() {
    try {
      const { api: api2 } = await Promise.resolve().then(() => (init_browser_polyfill(), browser_polyfill_exports));
      return api2?.storage?.local || null;
    } catch {
      return null;
    }
  }
  function looksLikeWebKitOnlyUa() {
    try {
      const ua = typeof navigator !== "undefined" && navigator.userAgent || "";
      return /Safari|AppleWebKit/.test(ua) && !/Chrom(e|ium)|Edg\/|OPR\//.test(ua);
    } catch {
      return false;
    }
  }
  async function isSafariEngine() {
    let origin = null;
    try {
      const { api: api2 } = await Promise.resolve().then(() => (init_browser_polyfill(), browser_polyfill_exports));
      const url = api2?.runtime?.getURL?.("");
      origin = typeof url === "string" ? url : null;
    } catch {
      origin = null;
    }
    if (origin && origin.startsWith("safari-web-extension://")) return true;
    if (looksLikeWebKitOnlyUa()) return true;
    if (origin && (origin.startsWith("chrome-extension://") || origin.startsWith("moz-extension://"))) {
      return false;
    }
    return true;
  }
  async function importSeedKey(seedB64) {
    return crypto.subtle.importKey(
      "raw",
      base64ToAb(seedB64),
      { name: "AES-GCM" },
      false,
      // NON-extractable once imported
      ["encrypt", "decrypt"]
    );
  }
  async function readStickyStrategy() {
    const store = await seedStorage();
    if (!store) return null;
    try {
      const got = await store.get({ [DEVICE_STRATEGY_KEY]: null });
      const s = got?.[DEVICE_STRATEGY_KEY];
      return s === "idb" || s === "seed" ? s : null;
    } catch {
      return null;
    }
  }
  async function writeStickyStrategy(strategy) {
    if (strategy !== "idb" && strategy !== "seed") return;
    const store = await seedStorage();
    if (!store) return;
    try {
      await store.set({ [DEVICE_STRATEGY_KEY]: strategy });
    } catch {
    }
  }
  async function trySeedDeviceKey() {
    const store = await seedStorage();
    if (!store) return null;
    try {
      const got = await store.get({ [DEVICE_SEED_KEY]: null });
      let seed = got?.[DEVICE_SEED_KEY];
      if (!seed) {
        seed = abToBase64(crypto.getRandomValues(new Uint8Array(DEVICE_SEED_BYTES)).buffer);
        await store.set({ [DEVICE_SEED_KEY]: seed });
        const check = await store.get({ [DEVICE_SEED_KEY]: null });
        const persisted = check?.[DEVICE_SEED_KEY];
        if (persisted !== seed) {
          if (typeof persisted !== "string" || persisted.length === 0) return null;
          seed = persisted;
        }
      }
      const key = await importSeedKey(seed);
      return await keyRoundTrips(key) ? key : null;
    } catch {
      return null;
    }
  }
  async function getDeviceKey() {
    if (_deviceKeyPromise) return _deviceKeyPromise;
    _deviceKeyPromise = (async () => {
      const sticky = await readStickyStrategy();
      if (sticky !== "seed" && !await isSafariEngine()) {
        const idbKey = await tryIdbDeviceKey();
        if (idbKey) {
          _deviceStrategy = "idb";
          await writeStickyStrategy("idb");
          return idbKey;
        }
      }
      const seedKey = await trySeedDeviceKey();
      if (seedKey) {
        _deviceStrategy = "seed";
        await writeStickyStrategy("seed");
        return seedKey;
      }
      if (!_memoryDeviceKey) _memoryDeviceKey = await generateDeviceKey();
      _deviceStrategy = "memory";
      return _memoryDeviceKey;
    })();
    return _deviceKeyPromise;
  }
  async function getLegacyIdbKey() {
    if (_legacyIdbKeyPromise) return _legacyIdbKeyPromise;
    _legacyIdbKeyPromise = (async () => {
      if (!indexedDbAvailable()) return null;
      try {
        const db = await openDeviceDb();
        const key = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
        return await keyRoundTrips(key) ? key : null;
      } catch {
        return null;
      }
    })();
    return _legacyIdbKeyPromise;
  }
  async function getExistingSeedKey() {
    if (_existingSeedKeyPromise) return _existingSeedKeyPromise;
    _existingSeedKeyPromise = (async () => {
      const store = await seedStorage();
      if (!store) return null;
      try {
        const got = await store.get({ [DEVICE_SEED_KEY]: null });
        const seed = got?.[DEVICE_SEED_KEY];
        if (!seed) return null;
        const key = await importSeedKey(seed);
        return await keyRoundTrips(key) ? key : null;
      } catch {
        return null;
      }
    })();
    return _existingSeedKeyPromise;
  }
  async function fallbackDeviceKeys() {
    const keys = [];
    if (_deviceStrategy !== "idb") {
      const legacy = await getLegacyIdbKey();
      if (legacy) keys.push(legacy);
    }
    if (_deviceStrategy !== "seed") {
      const seedKey = await getExistingSeedKey();
      if (seedKey) keys.push(seedKey);
    }
    return keys;
  }
  async function decryptDeviceBlobAnyKey(iv, ciphertext) {
    const key = await getDeviceKey();
    try {
      return { plaintext: await decryptDeviceBlobWith(key, iv, ciphertext), stale: false };
    } catch (e) {
      for (const fallback of await fallbackDeviceKeys()) {
        try {
          return {
            plaintext: await decryptDeviceBlobWith(fallback, iv, ciphertext),
            stale: true
          };
        } catch {
        }
      }
      throw e;
    }
  }
  async function encryptWithDeviceKey(plaintext) {
    const key = await getDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES2));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plaintext)
    );
    return JSON.stringify({
      v: 1,
      k: "device",
      iv: abToBase64(iv),
      ciphertext: abToBase64(ciphertext)
    });
  }
  async function decryptDeviceBlobWith(key, iv, ciphertext) {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(base64ToAb(iv)) },
      key,
      base64ToAb(ciphertext)
    );
    return new TextDecoder().decode(plainBuf);
  }
  async function decryptWithDeviceKey(encryptedData) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const { plaintext } = await decryptDeviceBlobAnyKey(iv, ciphertext);
    return plaintext;
  }
  function isPasswordBlob(value) {
    if (typeof value !== "string") return false;
    try {
      const p = JSON.parse(value);
      return !!(p && p.salt && p.iv && p.ciphertext && p.k !== "device");
    } catch {
      return false;
    }
  }
  function isDeviceKeyBlob(value) {
    if (typeof value !== "string") return false;
    try {
      const p = JSON.parse(value);
      return !!(p && p.k === "device" && p.iv && p.ciphertext);
    } catch {
      return false;
    }
  }
  function isCiphertext(value) {
    return isPasswordBlob(value) || isDeviceKeyBlob(value);
  }
  async function wrapSecret(plaintext) {
    if (typeof plaintext !== "string" || plaintext.length === 0) return plaintext;
    if (isCiphertext(plaintext)) return plaintext;
    if (_sessionKey) {
      return encryptWithKey(plaintext, _sessionKey, _sessionSalt);
    }
    return encryptWithDeviceKey(plaintext);
  }
  async function unwrapSecret(value) {
    if (typeof value !== "string" || value.length === 0) return value;
    if (!isCiphertext(value)) return value;
    if (_unlocked === false) {
      throw new Error("locked: session is locked \u2014 cannot read secret");
    }
    if (isDeviceKeyBlob(value)) {
      return decryptWithDeviceKey(value);
    }
    if (!_sessionKey) {
      throw new Error("locked: no session key available to decrypt secret");
    }
    return decryptWithKey(value, _sessionKey);
  }

  // src/utilities/bunker-url.js
  init_process();
  function parseBunkerUrl(url) {
    if (!url.startsWith("bunker://")) {
      throw new Error("Invalid bunker URL: must start with bunker://");
    }
    const parsed = new URL(url);
    const remotePubkey = parsed.hostname || parsed.pathname.replace("//", "");
    if (!/^[0-9a-f]{64}$/i.test(remotePubkey)) {
      throw new Error("Invalid bunker URL: pubkey must be 64 hex characters");
    }
    const relays = parsed.searchParams.getAll("relay");
    if (relays.length === 0) {
      throw new Error("Invalid bunker URL: at least one relay is required");
    }
    for (const relay of relays) {
      try {
        const r = new URL(relay);
        if (r.protocol !== "wss:" && r.protocol !== "ws:") {
          throw new Error(`Invalid relay protocol: ${r.protocol}`);
        }
      } catch (e) {
        throw new Error(`Invalid relay URL: ${relay}`);
      }
    }
    const secret = parsed.searchParams.get("secret") || null;
    return { remotePubkey, relays, secret };
  }
  function cleanRelay(relay) {
    const url = new URL(relay);
    const names = [...url.searchParams.keys()].filter((name) => name.toLowerCase() === "secret");
    if (!url.username && !url.password && !url.hash && names.length === 0) return relay;
    url.username = "";
    url.password = "";
    url.hash = "";
    for (const name of names) url.searchParams.delete(name);
    return url.href;
  }
  var encodeRelay = (relay) => encodeURIComponent(relay).replace(/%3A/g, ":").replace(/%2F/g, "/");
  function redactBunkerUrl(url) {
    let parsed;
    try {
      parsed = parseBunkerUrl(url);
    } catch {
      return "";
    }
    const relays = parsed.relays.map((relay) => `relay=${encodeRelay(cleanRelay(relay))}`).join("&");
    return `bunker://${parsed.remotePubkey}?${relays}`;
  }
  function redactProfiles(profiles) {
    if (!Array.isArray(profiles)) return profiles;
    let changed = false;
    const clean = profiles.map((profile) => {
      if (!profile?.bunkerUrl) return profile;
      const bunkerUrl = redactBunkerUrl(profile.bunkerUrl);
      if (bunkerUrl === profile.bunkerUrl) return profile;
      changed = true;
      return { ...profile, bunkerUrl };
    });
    return changed ? clean : profiles;
  }
  function bunkerSessionsAfterMoves(bunkerSessions, moves) {
    const moved = new Map(moves);
    const placed = {};
    for (const [position, session] of Object.entries(bunkerSessions || {})) {
      const index = Number(position);
      const to = moved.has(index) ? moved.get(index) : index;
      if (to !== null) placed[to] = session;
    }
    return placed;
  }

  // src/utilities/profiles-store.js
  init_process();
  init_browser_polyfill();
  var LOCK_NAME = "nostrkey:profiles";
  var localChain = Promise.resolve();
  function withProfilesLock(fn) {
    const locks = globalThis.navigator?.locks;
    const task = locks && typeof locks.request === "function" ? () => locks.request(LOCK_NAME, () => fn()) : () => fn();
    const run = localChain.then(task, task);
    localChain = run.catch(() => {
    });
    return run;
  }

  // src/utilities/sync-manager.js
  var SYNC_QUOTA = 102400;
  var MAX_ITEM = 8192;
  var MAX_ITEMS = 512;
  var CHUNK_PREFIX = "_chunk:";
  var SYNC_META_KEY = "_sync_meta";
  var LOCAL_ENABLED_KEY = "platformSyncEnabled";
  var PRIORITY = {
    // Tombstones (deletion records) get the guaranteed top slot: a deletion must
    // never lose its budget race to bulky vault content, or the deleted item
    // resurrects on the next device that still has a stale copy (issue #3).
    P0_TOMBSTONES: 0,
    P1_PROFILES: 1,
    P2_SETTINGS: 2,
    P3_APIKEYS: 3,
    P4_VAULT: 4
  };
  var storage = api.storage.local;
  var pushTimer = null;
  function chunkValue(key, jsonString) {
    const chunks = [];
    for (let i = 0; i < jsonString.length; i += MAX_ITEM - 100) {
      chunks.push(jsonString.slice(i, i + MAX_ITEM - 100));
    }
    if (chunks.length === 1) {
      return [{ key, value: jsonString }];
    }
    const entries = [];
    for (let i = 0; i < chunks.length; i++) {
      entries.push({ key: `${CHUNK_PREFIX}${key}:${i}`, value: chunks[i] });
    }
    entries.push({ key, value: JSON.stringify({ __chunked: true, count: chunks.length }) });
    return entries;
  }
  function reassembleFromSyncData(key, syncData) {
    try {
      const meta = typeof syncData[key] === "string" ? JSON.parse(syncData[key]) : syncData[key];
      if (!meta || !meta.__chunked) {
        return typeof syncData[key] === "string" ? JSON.parse(syncData[key]) : syncData[key];
      }
      let combined = "";
      for (let i = 0; i < meta.count; i++) {
        const chunkKey = `${CHUNK_PREFIX}${key}:${i}`;
        if (syncData[chunkKey] == null) return null;
        combined += syncData[chunkKey];
      }
      return JSON.parse(combined);
    } catch {
      return null;
    }
  }
  function compareSemver(a, b) {
    const pa = String(a).split(".");
    const pb = String(b).split(".");
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const x = parseInt(pa[i], 10) || 0;
      const y = parseInt(pb[i], 10) || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }
    return 0;
  }
  async function buildSyncPayload() {
    const all = await storage.get(null);
    const entries = [];
    const secretOk = (v) => !v || isCiphertext(v);
    const deletedDocs = all.deletedDocs && typeof all.deletedDocs === "object" ? all.deletedDocs : {};
    const deletedKeys = all.deletedKeys && typeof all.deletedKeys === "object" ? all.deletedKeys : {};
    const deletedProfiles = all.deletedProfiles && typeof all.deletedProfiles === "object" ? all.deletedProfiles : {};
    const identityOf = (p) => p && (p.pubKey || p.remotePubkey) || null;
    if (Object.keys(deletedDocs).length > 0) {
      const json = JSON.stringify(deletedDocs);
      entries.push({ key: "deletedDocs", jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (Object.keys(deletedKeys).length > 0) {
      const json = JSON.stringify(deletedKeys);
      entries.push({ key: "deletedKeys", jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (Object.keys(deletedProfiles).length > 0) {
      const json = JSON.stringify(deletedProfiles);
      entries.push({ key: "deletedProfiles", jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (all.profiles) {
      const cleanProfiles = redactProfiles(all.profiles).filter((p) => {
        const id = identityOf(p);
        return !(id != null && deletedProfiles[id] != null && deletedProfiles[id] >= (p.updatedAt || 0));
      }).map((p) => {
        const { hosts, ...rest } = p;
        if (rest.privKey && !secretOk(rest.privKey)) {
          console.warn("[SyncManager] Refusing to sync plaintext privKey \u2014 dropped");
          rest.privKey = "";
        }
        return rest;
      });
      const json = JSON.stringify(cleanProfiles);
      entries.push({ key: "profiles", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    if (all.profileIndex != null) {
      const json = JSON.stringify(all.profileIndex);
      entries.push({ key: "profileIndex", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    const settingsKeys = ["autoLockMinutes", "version", "protocol_handler", LOCAL_ENABLED_KEY];
    for (const k of settingsKeys) {
      if (all[k] != null) {
        const json = JSON.stringify(all[k]);
        entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
      }
    }
    for (const k of Object.keys(all)) {
      if (k.startsWith("feature:")) {
        const json = JSON.stringify(all[k]);
        entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
      }
    }
    if (all.apiKeyVault && all.apiKeyVault.keys) {
      const safeKeys = {};
      for (const [id, key] of Object.entries(all.apiKeyVault.keys)) {
        if (deletedKeys[id] != null && deletedKeys[id] >= (key.updatedAt || 0)) {
          continue;
        }
        if (secretOk(key.secret)) {
          safeKeys[id] = key;
        } else {
          console.warn("[SyncManager] Refusing to sync plaintext API secret \u2014 dropped");
        }
      }
      const safeVault = { ...all.apiKeyVault, keys: safeKeys };
      const json = JSON.stringify(safeVault);
      entries.push({ key: "apiKeyVault", jsonString: json, priority: PRIORITY.P3_APIKEYS, size: json.length });
    }
    if (all.vaultDocs && typeof all.vaultDocs === "object") {
      const docs = Object.values(all.vaultDocs).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      for (const doc of docs) {
        if (deletedDocs[doc.path] != null && deletedDocs[doc.path] >= (doc.updatedAt || 0)) {
          continue;
        }
        if (!secretOk(doc.content)) {
          console.warn("[SyncManager] Refusing to sync plaintext vault content \u2014 dropped");
          continue;
        }
        const docKey = `vaultDoc:${doc.path}`;
        const json = JSON.stringify(doc);
        entries.push({ key: docKey, jsonString: json, priority: PRIORITY.P4_VAULT, size: json.length });
      }
    }
    return entries;
  }
  async function setSyncRespectingQuota(included) {
    let tiers = included.slice();
    for (let attempt = 0; ; attempt++) {
      const syncPayload = {};
      const allSyncKeys = [];
      for (const item of tiers) {
        for (const c of item.chunks) {
          syncPayload[c.key] = c.value;
          allSyncKeys.push(c.key);
        }
      }
      syncPayload[SYNC_META_KEY] = JSON.stringify({ lastWrittenAt: Date.now(), keys: allSyncKeys });
      try {
        await api.storage.sync.set(syncPayload);
        try {
          const existing = await api.storage.sync.get(null);
          const orphanKeys = Object.keys(existing).filter(
            (k) => k !== SYNC_META_KEY && !allSyncKeys.includes(k)
          );
          if (orphanKeys.length > 0) {
            await api.storage.sync.remove(orphanKeys);
          }
        } catch {
        }
        return allSyncKeys.length;
      } catch (e) {
        const maxPriority = tiers.reduce((m, t) => Math.max(m, t.priority), -1);
        if (maxPriority <= PRIORITY.P1_PROFILES) {
          throw e;
        }
        const before = tiers.length;
        tiers = tiers.filter((t) => t.priority < maxPriority);
        if (tiers.length === before) throw e;
        console.warn(`[SyncManager] sync.set over quota \u2014 dropped priority ${maxPriority} tier, retrying`);
      }
    }
  }
  async function pushToSync() {
    if (!api.storage.sync) return;
    const enabled = await isSyncEnabled();
    if (!enabled) return;
    try {
      const remote = await pullFromSync();
      if (remote) await mergeIntoLocal(remote);
      const entries = await buildSyncPayload();
      entries.sort((a, b) => a.priority - b.priority);
      let usedBytes = 0;
      let usedItems = 0;
      const included = [];
      let budgetExhausted = false;
      for (const entry of entries) {
        if (budgetExhausted) break;
        const chunks = chunkValue(entry.key, entry.jsonString);
        let entrySize = 0;
        for (const c of chunks) {
          entrySize += c.key.length + (typeof c.value === "string" ? c.value.length : JSON.stringify(c.value).length);
        }
        if (usedBytes + entrySize > SYNC_QUOTA - 500 || usedItems + chunks.length > MAX_ITEMS - 5) {
          if (entry.priority <= PRIORITY.P3_APIKEYS) {
          } else {
            console.warn(`[SyncManager] Budget exhausted at priority ${entry.priority}, skipping remaining entries`);
            budgetExhausted = true;
            break;
          }
        }
        included.push({ priority: entry.priority, chunks });
        usedBytes += entrySize;
        usedItems += chunks.length;
      }
      const written = await setSyncRespectingQuota(included);
      console.log(`[SyncManager] Pushed ${written} entries (${usedBytes} bytes) to sync storage`);
    } catch (e) {
      console.error("[SyncManager] pushToSync error:", e);
    }
  }
  async function pullFromSync() {
    if (!api.storage.sync) return null;
    try {
      const raw = await api.storage.sync.get(null);
      if (!raw || Object.keys(raw).length === 0) return null;
      const metaStr = raw[SYNC_META_KEY];
      if (!metaStr) return null;
      let meta;
      try {
        meta = JSON.parse(metaStr);
      } catch {
        return null;
      }
      const result = {};
      const dataKeys = meta.keys.filter((k) => !k.startsWith(CHUNK_PREFIX) && k !== SYNC_META_KEY);
      for (const key of dataKeys) {
        const value = reassembleFromSyncData(key, raw);
        if (value != null) {
          result[key] = value;
        }
      }
      result._syncMeta = meta;
      return result;
    } catch (e) {
      console.error("[SyncManager] pullFromSync error:", e);
      return null;
    }
  }
  var profileMoveHandler = null;
  async function announceProfileMoves(moves) {
    if (profileMoveHandler) {
      profileMoveHandler(moves);
      return;
    }
    try {
      await api.runtime.sendMessage({ kind: "profilesMoved", payload: moves });
    } catch {
    }
  }
  function profileMoves(before, after, identityOf) {
    const places = before.map((profile) => after.indexOf(profile));
    const claimed = new Set(places);
    before.forEach((profile, i) => {
      const id = identityOf(profile);
      if (places[i] >= 0 || !id) return;
      places[i] = after.findIndex((other, j) => !claimed.has(j) && identityOf(other) === id);
      claimed.add(places[i]);
    });
    return places.flatMap((place, i) => place === i ? [] : [[i, place < 0 ? null : place]]);
  }
  async function mergeIntoLocal(syncData) {
    if (!syncData) return;
    if (syncData.profiles) {
      syncData = { ...syncData, profiles: redactProfiles(syncData.profiles) };
    }
    const moves = await withProfilesLock(() => mergeIntoLocalLocked(syncData));
    if (moves.length > 0) await announceProfileMoves(moves);
  }
  async function mergeIntoLocalLocked(syncData) {
    const local = await storage.get(null);
    const updates = {};
    let changed = false;
    const hasIdentity = (p) => !!(p && (p.privKey || p.pubKey || p.type === "bunker" || p.bunkerUrl || p.remotePubkey));
    const lone = local.profiles && local.profiles.length === 1 ? local.profiles[0] : null;
    const isFresh = !local.profiles || local.profiles.length === 0 || lone && !lone.privKey && !hasIdentity(lone) || lone && lone.name === "Default Nostr Profile" && Object.keys(lone.hosts || {}).length === 0;
    const identityOf = (p) => p && (p.pubKey || p.remotePubkey) || null;
    const localActiveIndex = local.profileIndex != null ? local.profileIndex : 0;
    const activeId = local.profiles && local.profiles[localActiveIndex] ? identityOf(local.profiles[localActiveIndex]) : null;
    const deletedProfiles = { ...local.deletedProfiles && typeof local.deletedProfiles === "object" ? local.deletedProfiles : {} };
    if (syncData.deletedProfiles && typeof syncData.deletedProfiles === "object") {
      for (const [id, ts] of Object.entries(syncData.deletedProfiles)) {
        if (deletedProfiles[id] == null || ts > deletedProfiles[id]) deletedProfiles[id] = ts;
      }
    }
    let mergedProfiles = local.profiles ? [...local.profiles] : null;
    let profilesChanged = false;
    if (syncData.profiles) {
      if (isFresh) {
        mergedProfiles = syncData.profiles.slice();
        profilesChanged = true;
      } else if (local.profiles) {
        const indexByIdentity = /* @__PURE__ */ new Map();
        mergedProfiles.forEach((p, i) => {
          const id = identityOf(p);
          if (id && !indexByIdentity.has(id)) indexByIdentity.set(id, i);
        });
        for (const syncProfile of syncData.profiles) {
          const id = identityOf(syncProfile);
          if (id && indexByIdentity.has(id)) {
            const i = indexByIdentity.get(id);
            const localProfile = mergedProfiles[i];
            if ((syncProfile.updatedAt || 0) > (localProfile.updatedAt || 0)) {
              mergedProfiles[i] = { ...syncProfile, hosts: localProfile.hosts || {} };
              profilesChanged = true;
            }
          } else if (id) {
            indexByIdentity.set(id, mergedProfiles.length);
            mergedProfiles.push(syncProfile);
            profilesChanged = true;
          }
        }
      }
    }
    if (mergedProfiles && Object.keys(deletedProfiles).length > 0) {
      const kept = mergedProfiles.filter((p) => {
        const id = identityOf(p);
        const ts = id != null ? deletedProfiles[id] : null;
        return !(ts != null && (p.updatedAt || 0) <= ts);
      });
      if (kept.length !== mergedProfiles.length && kept.length > 0) {
        mergedProfiles = kept;
        profilesChanged = true;
      }
    }
    let moves = [];
    if (profilesChanged && mergedProfiles) {
      updates.profiles = mergedProfiles;
      changed = true;
      moves = profileMoves(local.profiles || [], mergedProfiles, identityOf);
      if (moves.length > 0 && local.bunkerSessions) {
        updates.bunkerSessions = bunkerSessionsAfterMoves(local.bunkerSessions, moves);
      }
    }
    if (mergedProfiles && mergedProfiles.length > 0) {
      let desiredIndex;
      if (syncData.profiles && isFresh) {
        const base = syncData.profileIndex != null ? syncData.profileIndex : 0;
        desiredIndex = Math.min(Math.max(base, 0), mergedProfiles.length - 1);
      } else {
        const followed = activeId != null ? mergedProfiles.findIndex((p) => identityOf(p) === activeId) : -1;
        desiredIndex = followed >= 0 ? followed : Math.min(Math.max(localActiveIndex, 0), mergedProfiles.length - 1);
      }
      if (desiredIndex !== local.profileIndex) {
        updates.profileIndex = desiredIndex;
        changed = true;
      }
    }
    const settingsKeys = ["autoLockMinutes", "version", "protocol_handler", LOCAL_ENABLED_KEY];
    for (const key of settingsKeys) {
      if (syncData[key] != null && syncData[key] !== local[key]) {
        if (key === "version" && local.version && compareSemver(syncData.version, local.version) <= 0) continue;
        updates[key] = syncData[key];
        changed = true;
      }
    }
    for (const key of Object.keys(syncData)) {
      if (key.startsWith("feature:") && syncData[key] !== local[key]) {
        updates[key] = syncData[key];
        changed = true;
      }
    }
    const deletedDocs = { ...local.deletedDocs && typeof local.deletedDocs === "object" ? local.deletedDocs : {} };
    if (syncData.deletedDocs && typeof syncData.deletedDocs === "object") {
      for (const [path, ts] of Object.entries(syncData.deletedDocs)) {
        if (deletedDocs[path] == null || ts > deletedDocs[path]) deletedDocs[path] = ts;
      }
    }
    const deletedKeys = { ...local.deletedKeys && typeof local.deletedKeys === "object" ? local.deletedKeys : {} };
    if (syncData.deletedKeys && typeof syncData.deletedKeys === "object") {
      for (const [id, ts] of Object.entries(syncData.deletedKeys)) {
        if (deletedKeys[id] == null || ts > deletedKeys[id]) deletedKeys[id] = ts;
      }
    }
    {
      let baseVault = local.apiKeyVault || null;
      let localKeys = local.apiKeyVault && local.apiKeyVault.keys || {};
      let apiChanged = false;
      if ((!local.apiKeyVault || isFresh) && syncData.apiKeyVault) {
        baseVault = syncData.apiKeyVault;
        localKeys = {};
        apiChanged = true;
      }
      const keyMerge = mergeRemote(localKeys, syncData.apiKeyVault && syncData.apiKeyVault.keys || {}, deletedKeys);
      const mergedKeys = keyMerge.merged;
      if (keyMerge.changed) apiChanged = true;
      if (apiChanged && baseVault) {
        updates.apiKeyVault = { ...baseVault, keys: mergedKeys };
        changed = true;
      }
    }
    const remoteDocs = {};
    for (const key of Object.keys(syncData)) {
      if (!key.startsWith("vaultDoc:")) continue;
      const doc = syncData[key];
      if (!doc || !doc.path) continue;
      remoteDocs[doc.path] = doc;
    }
    const { merged: mergedDocs, changed: docsChanged } = mergeRemote(local.vaultDocs || {}, remoteDocs, deletedDocs);
    if (docsChanged) {
      updates.vaultDocs = mergedDocs;
      changed = true;
    }
    if (JSON.stringify(deletedDocs) !== JSON.stringify(local.deletedDocs || {})) {
      updates.deletedDocs = deletedDocs;
      changed = true;
    }
    if (JSON.stringify(deletedKeys) !== JSON.stringify(local.deletedKeys || {})) {
      updates.deletedKeys = deletedKeys;
      changed = true;
    }
    if (JSON.stringify(deletedProfiles) !== JSON.stringify(local.deletedProfiles || {})) {
      updates.deletedProfiles = deletedProfiles;
      changed = true;
    }
    if (changed) {
      await storage.set(updates);
      console.log("[SyncManager] Merged sync data into local:", Object.keys(updates));
    }
    return moves;
  }
  function scheduleSyncPush() {
    if (!api.storage.sync) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      pushTimer = null;
      pushToSync();
    }, 2e3);
  }
  async function isSyncEnabled() {
    const data = await storage.get({ [LOCAL_ENABLED_KEY]: true });
    return data[LOCAL_ENABLED_KEY];
  }

  // src/utilities/api-key-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "apiKeyVault";
  var DELETED_KEY = "deletedKeys";
  async function getDeletedKeys() {
    const data = await storage2.get({ [DELETED_KEY]: {} });
    return data[DELETED_KEY] && typeof data[DELETED_KEY] === "object" ? data[DELETED_KEY] : {};
  }
  async function decryptKey(key) {
    if (!key) return key;
    try {
      return { ...key, secret: await unwrapSecret(key.secret) };
    } catch (e) {
      if (String(e.message || "").startsWith("locked")) throw e;
      return { ...key, secret: null, undecryptable: true };
    }
  }
  var DEFAULT_STORE = {
    keys: {},
    syncEnabled: true,
    eventId: null,
    relayCreatedAt: null,
    syncStatus: "synced"
  };
  async function getStore() {
    const data = await storage2.get({ [STORAGE_KEY]: DEFAULT_STORE });
    return { ...DEFAULT_STORE, ...data[STORAGE_KEY] };
  }
  async function setStore(store) {
    await storage2.set({ [STORAGE_KEY]: store });
    scheduleSyncPush();
  }
  async function getApiKeyStore() {
    const store = await getStore();
    const keys = {};
    for (const [id, key] of Object.entries(store.keys)) {
      keys[id] = await decryptKey(key);
    }
    return { ...store, keys };
  }
  async function saveApiKey(id, label, secret) {
    const store = await getStore();
    const now = Math.floor(Date.now() / 1e3);
    const existing = store.keys[id];
    store.keys[id] = {
      id,
      label,
      secret: await wrapSecret(secret),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      profileScope: existing?.profileScope ?? null
    };
    const deleted = await getDeletedKeys();
    if (deleted[id] != null) {
      delete deleted[id];
      await storage2.set({ [STORAGE_KEY]: store, [DELETED_KEY]: deleted });
      scheduleSyncPush();
    } else {
      await setStore(store);
    }
    return decryptKey(store.keys[id]);
  }
  async function deleteApiKey(id) {
    const store = await getStore();
    delete store.keys[id];
    const deleted = await getDeletedKeys();
    deleted[id] = Math.floor(Date.now() / 1e3);
    await storage2.set({ [STORAGE_KEY]: store, [DELETED_KEY]: deleted });
    scheduleSyncPush();
  }
  async function listApiKeys() {
    const store = await getStore();
    const decrypted = [];
    for (const key of Object.values(store.keys)) {
      decrypted.push(await decryptKey(key));
    }
    return decrypted.sort(
      (a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  }
  async function setSyncEnabled(enabled) {
    const store = await getStore();
    store.syncEnabled = enabled;
    await setStore(store);
  }
  async function isSyncEnabled2() {
    const store = await getStore();
    return store.syncEnabled;
  }
  async function updateStoreSyncState(syncStatus, eventId = null, relayCreatedAt = null) {
    const store = await getStore();
    store.syncStatus = syncStatus;
    if (eventId !== null) store.eventId = eventId;
    if (relayCreatedAt !== null) store.relayCreatedAt = relayCreatedAt;
    await setStore(store);
  }
  async function exportStore() {
    const store = await getStore();
    const keys = {};
    const undecryptable = [];
    for (const [id, key] of Object.entries(store.keys)) {
      const decrypted = await decryptKey(key);
      if (decrypted?.undecryptable) {
        keys[id] = { ...key };
        undecryptable.push(key.label || id);
        continue;
      }
      keys[id] = decrypted;
    }
    return { keys, undecryptable };
  }
  async function keysForRelay() {
    const store = await getStore();
    const keys = {};
    for (const [id, key] of Object.entries(store.keys)) {
      const decrypted = await decryptKey(key);
      if (hasUsableSecret(decrypted)) keys[id] = decrypted;
    }
    return keys;
  }
  function hasUsableSecret(key) {
    return !!key && !key.undecryptable && typeof key.secret === "string" && key.secret !== "";
  }
  async function importStore(keys) {
    const store = await getStore();
    let imported = 0;
    let skipped = 0;
    for (const [id, key] of Object.entries(keys)) {
      if (!hasUsableSecret(key)) {
        skipped++;
        continue;
      }
      const secret = isCiphertext(key.secret) ? key.secret : await wrapSecret(key.secret);
      store.keys[id] = { ...key, secret };
      imported++;
    }
    await setStore(store);
    return { imported, skipped };
  }

  // src/api-keys/api-keys.js
  var state = {
    keys: [],
    newLabel: "",
    newSecret: "",
    editingId: null,
    editLabel: "",
    editSecret: "",
    copiedId: null,
    revealedId: null,
    syncEnabled: true,
    globalSyncStatus: "idle",
    syncError: "",
    saving: false,
    toast: "",
    relayInfo: { read: [], write: [] }
  };
  function $(id) {
    return document.getElementById(id);
  }
  function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
  }
  function sortedKeys() {
    return [...state.keys].sort(
      (a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  }
  function maskSecret(secret) {
    if (!secret) return "";
    if (secret.length <= 8) return "\u2022".repeat(secret.length);
    return secret.slice(0, 4) + "\u2022".repeat(4) + secret.slice(-4);
  }
  function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      state.toast = "";
      render();
    }, 2e3);
  }
  function syncStatusClass(status) {
    if (status === "idle") return state.syncEnabled ? "led--green" : "led--off";
    if (status === "syncing") return "led--amber animate-pulse";
    return "led--red";
  }
  function syncStatusText() {
    if (state.globalSyncStatus === "syncing") return "Syncing...";
    if (state.globalSyncStatus === "error") return state.syncError;
    return state.syncEnabled ? "Synced" : "Local only";
  }
  function render() {
    const syncDot = $("sync-dot");
    const syncText = $("sync-text");
    const syncBtn = $("sync-btn");
    const syncToggle = $("sync-toggle");
    const keyCount = $("key-count");
    if (syncDot) syncDot.className = `led ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === "syncing" || !hasRelays() || !state.syncEnabled;
    if (syncToggle) syncToggle.setAttribute("aria-pressed", String(state.syncEnabled));
    if (keyCount) keyCount.textContent = state.keys.length + " key" + (state.keys.length !== 1 ? "s" : "");
    const keyTableContainer = $("key-table-container");
    const noKeysMsg = $("no-keys");
    const keyTableBody = $("key-table-body");
    if (keyTableContainer) keyTableContainer.style.display = state.keys.length > 0 ? "block" : "none";
    if (noKeysMsg) noKeysMsg.style.display = state.keys.length === 0 ? "block" : "none";
    if (keyTableBody) {
      const sorted = sortedKeys();
      keyTableBody.innerHTML = sorted.map((key) => {
        if (state.editingId === key.id) {
          return `
                    <div class="module is-live">
                        <div class="module-header">Edit key</div>
                        <div class="module-body flex flex-col gap-2">
                            <input
                                type="text"
                                class="ins-input"
                                autocomplete="off"
                                aria-label="Key label"
                                data-edit-label="${key.id}"
                                value="${escapeAttr(state.editLabel)}"
                            />
                            <input
                                type="text"
                                class="ins-input mono"
                                autocomplete="off"
                                spellcheck="false"
                                aria-label="Secret key"
                                data-edit-secret="${key.id}"
                                value="${escapeAttr(state.editSecret)}"
                            />
                            <div class="flex gap-2 justify-end">
                                <button class="btn btn--ghost btn--sm" type="button" data-action="cancel-edit">Cancel</button>
                                <button class="btn btn--primary btn--sm" type="button" data-action="save-edit">Save</button>
                            </div>
                        </div>
                    </div>
                `;
        }
        const revealed = state.revealedId === key.id;
        const displaySecret = key.undecryptable ? "unreadable on this device" : revealed ? escapeHtml(key.secret) : escapeHtml(maskSecret(key.secret));
        const copyLabel = state.copiedId === key.id ? "Copied!" : "Copy";
        return `
                <div class="module${revealed ? " is-live" : ""}">
                    <div class="module-row">
                        <button
                            class="patch-point"
                            type="button"
                            data-action="toggle-reveal"
                            data-key-id="${key.id}"
                            aria-pressed="${revealed}"
                            title="${revealed ? "Hide secret" : "Reveal secret"}"
                            aria-label="${revealed ? "Hide" : "Reveal"} secret for ${escapeAttr(key.label)}"
                        ><span class="patch-jack"></span></button>
                        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span class="text-sm font-semibold cursor-pointer hover:underline" data-action="start-edit" data-key-id="${key.id}" title="Edit key">${escapeHtml(key.label)}</span>
                            <span class="mono text-xs ${revealed ? "" : "ins-muted "}ins-truncate cursor-pointer" data-action="toggle-reveal" data-key-id="${key.id}">${displaySecret}</span>
                        </div>
                        <span class="row-value">
                            <button class="btn btn--sm" type="button" data-action="copy-secret" data-key-id="${key.id}">${copyLabel}</button>
                            <button class="btn btn--sm btn--destructive" type="button" data-action="delete-key" data-key-id="${key.id}">Del</button>
                        </span>
                    </div>
                </div>
            `;
      }).join("");
      keyTableBody.querySelectorAll('[data-action="start-edit"]').forEach((el) => {
        el.addEventListener("click", () => startEdit(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="toggle-reveal"]').forEach((el) => {
        el.addEventListener("click", () => {
          state.revealedId = state.revealedId === el.dataset.keyId ? null : el.dataset.keyId;
          render();
        });
      });
      keyTableBody.querySelectorAll('[data-action="copy-secret"]').forEach((el) => {
        el.addEventListener("click", () => copySecret2(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="delete-key"]').forEach((el) => {
        el.addEventListener("click", () => deleteKey(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="save-edit"]').forEach((el) => {
        el.addEventListener("click", saveEdit);
      });
      keyTableBody.querySelectorAll('[data-action="cancel-edit"]').forEach((el) => {
        el.addEventListener("click", cancelEdit);
      });
      keyTableBody.querySelectorAll("[data-edit-label]").forEach((el) => {
        el.addEventListener("input", (e) => {
          state.editLabel = e.target.value;
        });
        el.addEventListener("keyup", (e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        });
      });
      keyTableBody.querySelectorAll("[data-edit-secret]").forEach((el) => {
        el.addEventListener("input", (e) => {
          state.editSecret = e.target.value;
        });
        el.addEventListener("keyup", (e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        });
      });
    }
    const newLabelInput = $("new-label");
    const newSecretInput = $("new-secret");
    const addKeyBtn = $("add-key-btn");
    if (newLabelInput && document.activeElement !== newLabelInput) newLabelInput.value = state.newLabel;
    if (newSecretInput && document.activeElement !== newSecretInput) newSecretInput.value = state.newSecret;
    if (addKeyBtn) {
      addKeyBtn.disabled = state.saving || state.newLabel.trim().length === 0 || state.newSecret.trim().length === 0;
      addKeyBtn.textContent = state.saving ? "Saving..." : "Save";
    }
    const toast = $("toast");
    if (toast) {
      toast.textContent = state.toast;
      toast.style.display = state.toast ? "block" : "none";
    }
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  async function addKey() {
    const label = state.newLabel.trim();
    const secret = state.newSecret.trim();
    if (!label || !secret) return;
    state.saving = true;
    render();
    const id = crypto.randomUUID();
    await saveApiKey(id, label, secret);
    state.keys = await listApiKeys();
    state.newLabel = "";
    state.newSecret = "";
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    state.saving = false;
    showToast("Key added");
  }
  function startEdit(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
      showToast("This key could not be decrypted on this device \u2014 it was left untouched");
      return;
    }
    state.editingId = key.id;
    state.editLabel = key.label;
    state.editSecret = key.secret;
    render();
  }
  async function saveEdit() {
    if (!state.editingId) return;
    const label = state.editLabel.trim();
    const secret = state.editSecret.trim();
    if (!label || !secret) return;
    await saveApiKey(state.editingId, label, secret);
    state.keys = await listApiKeys();
    state.editingId = null;
    state.editLabel = "";
    state.editSecret = "";
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    showToast("Key updated");
  }
  function cancelEdit() {
    state.editingId = null;
    state.editLabel = "";
    state.editSecret = "";
    render();
  }
  async function deleteKey(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (!await insConfirm({ title: `Delete "${key.label}"?`, body: "The stored secret is removed from your encrypted vault.", confirmLabel: "Delete key", destructive: true })) return;
    await deleteApiKey(id);
    state.keys = await listApiKeys();
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    showToast("Key deleted");
  }
  async function copySecret2(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
      showToast("This key could not be decrypted on this device");
      return;
    }
    await copySecret(key.secret);
    state.copiedId = id;
    render();
    setTimeout(() => {
      state.copiedId = null;
      render();
    }, 2e3);
  }
  async function publishToRelay() {
    try {
      const result = await api.runtime.sendMessage({
        kind: "apikeys.publish",
        payload: { keys: await keysForRelay() }
      });
      if (result.success) {
        await updateStoreSyncState("synced", result.eventId, result.createdAt);
      }
      return result;
    } catch (e) {
      await updateStoreSyncState("local-only");
      return { success: false, error: e.message };
    }
  }
  async function syncAll() {
    state.globalSyncStatus = "syncing";
    state.syncError = "";
    render();
    try {
      const result = await api.runtime.sendMessage({ kind: "apikeys.fetch" });
      if (!result.success) {
        state.globalSyncStatus = "error";
        state.syncError = result.error || "Sync failed";
        render();
        return;
      }
      if (result.keys) {
        const { merged: remoteKeys } = mergeRemote({}, result.keys, await getDeletedKeys(), {
          timeOf: (k) => k && k.updatedAt || result.createdAt || 0
        });
        const store = await getApiKeyStore();
        const localKeys = store.keys;
        const localCount = Object.keys(localKeys).length;
        if (localCount === 0) {
          await importStore(remoteKeys);
        } else if (!store.relayCreatedAt || result.createdAt > store.relayCreatedAt) {
          await importStore(remoteKeys);
        }
        await updateStoreSyncState("synced", result.eventId, result.createdAt);
        state.keys = await listApiKeys();
      }
      state.globalSyncStatus = "idle";
    } catch (e) {
      state.globalSyncStatus = "error";
      state.syncError = e.message || "Sync failed";
    }
    render();
  }
  async function toggleSync() {
    await setSyncEnabled(state.syncEnabled);
    if (state.syncEnabled && hasRelays()) {
      await syncAll();
    }
  }
  async function exportKeys() {
    const { keys, undecryptable } = await exportStore();
    const plainText = JSON.stringify(keys, null, 2);
    const result = await api.runtime.sendMessage({
      kind: "apikeys.encrypt",
      payload: { plainText }
    });
    if (!result.success) {
      showToast("Export failed: " + (result.error || "unknown"));
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ encrypted: true, data: result.cipherText })],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nostrkey-api-keys-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast(undecryptable.length ? `Exported \u2014 ${undecryptable.length} key(s) could not be decrypted here and were backed up still-encrypted: ${undecryptable.join(", ")}` : "Exported");
  }
  async function importKeys(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let keys;
      if (parsed.encrypted && parsed.data) {
        const result = await api.runtime.sendMessage({
          kind: "apikeys.decrypt",
          payload: { cipherText: parsed.data }
        });
        if (!result.success) {
          showToast("Decrypt failed: " + (result.error || "unknown"));
          return;
        }
        keys = JSON.parse(result.plainText);
      } else {
        keys = parsed;
      }
      const { imported } = await importStore(keys);
      state.keys = await listApiKeys();
      if (state.syncEnabled && hasRelays()) {
        await publishToRelay();
      }
      showToast("Imported " + imported + " keys");
    } catch (e) {
      showToast("Import failed: " + e.message);
    }
    event.target.value = "";
  }
  function bindEvents() {
    $("sync-btn")?.addEventListener("click", syncAll);
    $("add-key-btn")?.addEventListener("click", addKey);
    $("export-btn")?.addEventListener("click", exportKeys);
    $("import-file")?.addEventListener("change", importKeys);
    $("close-btn")?.addEventListener("click", () => window.close());
    $("sync-toggle")?.addEventListener("click", () => {
      state.syncEnabled = !state.syncEnabled;
      render();
      toggleSync();
    });
    $("new-label")?.addEventListener("input", (e) => {
      state.newLabel = e.target.value;
      render();
    });
    $("new-secret")?.addEventListener("input", (e) => {
      state.newSecret = e.target.value;
      render();
    });
  }
  function showGate(gate, main, { title, message, button }) {
    if (gate) gate.style.display = "block";
    if (main) main.style.display = "none";
    const t = $("gate-title");
    if (t && title) t.textContent = title;
    const m = $("gate-message");
    if (m && message) m.textContent = message;
    const b = $("gate-security-btn");
    if (b && button) b.textContent = button;
    b?.addEventListener("click", () => {
      const url = api.runtime.getURL("security/security.html");
      window.open(url, "nostrkey-options");
    });
  }
  async function init() {
    const isEncrypted = await askGate("isEncrypted");
    const locked = await askGate("isLocked");
    const gate = $("vault-locked-gate");
    const main = $("vault-main-content");
    if (!isEncrypted) {
      setUnlocked(true);
      showGate(gate, main, {});
      return;
    }
    if (locked) {
      setUnlocked(false);
      showGate(gate, main, {
        title: "Vault Locked",
        message: "Unlock NostrKey with your master password to view your API keys.",
        button: "Unlock"
      });
      return;
    }
    setUnlocked(true);
    if (gate) gate.style.display = "none";
    if (main) main.style.display = "block";
    const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
    state.relayInfo = relays || { read: [], write: [] };
    state.syncEnabled = await isSyncEnabled2();
    state.keys = await listApiKeys();
    bindEvents();
    render();
    if (state.syncEnabled && hasRelays()) {
      await syncAll();
    }
  }
  document.addEventListener("DOMContentLoaded", () => startPage(init));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY29weS1zZWNyZXQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9wYWdlLWdhdGUuanMiLCAiLi4vLi4vLi4vc3JjL2lucy1jb25maXJtLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYXBpLWtleS1zdG9yZS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3N5bmMtbWFuYWdlci5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3N5bmMtbWVyZ2UuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9idW5rZXItdXJsLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcHJvZmlsZXMtc3RvcmUuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBjb3B5U2VjcmV0IGFzIGNvcHlTZWNyZXRUb0NsaXBib2FyZCB9IGZyb20gJy4uL3V0aWxpdGllcy9jb3B5LXNlY3JldC5qcyc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBhc2tHYXRlLCBzdGFydFBhZ2UgfSBmcm9tICcuLi91dGlsaXRpZXMvcGFnZS1nYXRlJztcbmltcG9ydCB7IGluc0NvbmZpcm0gfSBmcm9tICcuLi9pbnMtY29uZmlybS5qcyc7XG5pbXBvcnQge1xuICAgIGdldEFwaUtleVN0b3JlLFxuICAgIHNhdmVBcGlLZXksXG4gICAgZGVsZXRlQXBpS2V5LFxuICAgIGxpc3RBcGlLZXlzLFxuICAgIHNldFN5bmNFbmFibGVkLFxuICAgIGlzU3luY0VuYWJsZWQsXG4gICAgdXBkYXRlU3RvcmVTeW5jU3RhdGUsXG4gICAgZXhwb3J0U3RvcmUsXG4gICAgaW1wb3J0U3RvcmUsXG4gICAga2V5c0ZvclJlbGF5LFxuICAgIGdldERlbGV0ZWRLZXlzLFxufSBmcm9tICcuLi91dGlsaXRpZXMvYXBpLWtleS1zdG9yZSc7XG5pbXBvcnQgeyBtZXJnZVJlbW90ZSB9IGZyb20gJy4uL3V0aWxpdGllcy9zeW5jLW1lcmdlJztcbmltcG9ydCB7IHNldFVubG9ja2VkIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3NlY3JldC12YXVsdCc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGtleXM6IFtdLFxuICAgIG5ld0xhYmVsOiAnJyxcbiAgICBuZXdTZWNyZXQ6ICcnLFxuICAgIGVkaXRpbmdJZDogbnVsbCxcbiAgICBlZGl0TGFiZWw6ICcnLFxuICAgIGVkaXRTZWNyZXQ6ICcnLFxuICAgIGNvcGllZElkOiBudWxsLFxuICAgIHJldmVhbGVkSWQ6IG51bGwsXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZ2xvYmFsU3luY1N0YXR1czogJ2lkbGUnLFxuICAgIHN5bmNFcnJvcjogJycsXG4gICAgc2F2aW5nOiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIHNvcnRlZEtleXMoKSB7XG4gICAgcmV0dXJuIFsuLi5zdGF0ZS5rZXlzXS5zb3J0KChhLCBiKSA9PlxuICAgICAgICBhLmxhYmVsLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmxhYmVsLnRvTG93ZXJDYXNlKCkpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1hc2tTZWNyZXQoc2VjcmV0KSB7XG4gICAgaWYgKCFzZWNyZXQpIHJldHVybiAnJztcbiAgICBpZiAoc2VjcmV0Lmxlbmd0aCA8PSA4KSByZXR1cm4gJ1xcdTIwMjInLnJlcGVhdChzZWNyZXQubGVuZ3RoKTtcbiAgICByZXR1cm4gc2VjcmV0LnNsaWNlKDAsIDQpICsgJ1xcdTIwMjInLnJlcGVhdCg0KSArIHNlY3JldC5zbGljZSgtNCk7XG59XG5cbmZ1bmN0aW9uIHNob3dUb2FzdChtc2cpIHtcbiAgICBzdGF0ZS50b2FzdCA9IG1zZztcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUudG9hc3QgPSAnJzsgcmVuZGVyKCk7IH0sIDIwMDApO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzQ2xhc3Moc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ2lkbGUnKSByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnbGVkLS1ncmVlbicgOiAnbGVkLS1vZmYnO1xuICAgIGlmIChzdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdsZWQtLWFtYmVyIGFuaW1hdGUtcHVsc2UnO1xuICAgIHJldHVybiAnbGVkLS1yZWQnO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzVGV4dCgpIHtcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ1N5bmNpbmcuLi4nO1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnZXJyb3InKSByZXR1cm4gc3RhdGUuc3luY0Vycm9yO1xuICAgIHJldHVybiBzdGF0ZS5zeW5jRW5hYmxlZCA/ICdTeW5jZWQnIDogJ0xvY2FsIG9ubHknO1xufVxuXG4vLyAtLS0gUmVuZGVyIC0tLVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gU3luYyBiYXJcbiAgICBjb25zdCBzeW5jRG90ID0gJCgnc3luYy1kb3QnKTtcbiAgICBjb25zdCBzeW5jVGV4dCA9ICQoJ3N5bmMtdGV4dCcpO1xuICAgIGNvbnN0IHN5bmNCdG4gPSAkKCdzeW5jLWJ0bicpO1xuICAgIGNvbnN0IHN5bmNUb2dnbGUgPSAkKCdzeW5jLXRvZ2dsZScpO1xuICAgIGNvbnN0IGtleUNvdW50ID0gJCgna2V5LWNvdW50Jyk7XG5cbiAgICBpZiAoc3luY0RvdCkgc3luY0RvdC5jbGFzc05hbWUgPSBgbGVkICR7c3luY1N0YXR1c0NsYXNzKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMpfWA7XG4gICAgaWYgKHN5bmNUZXh0KSBzeW5jVGV4dC50ZXh0Q29udGVudCA9IHN5bmNTdGF0dXNUZXh0KCk7XG4gICAgaWYgKHN5bmNCdG4pIHN5bmNCdG4uZGlzYWJsZWQgPSBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycgfHwgIWhhc1JlbGF5cygpIHx8ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICBpZiAoc3luY1RvZ2dsZSkgc3luY1RvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhzdGF0ZS5zeW5jRW5hYmxlZCkpO1xuICAgIGlmIChrZXlDb3VudCkga2V5Q291bnQudGV4dENvbnRlbnQgPSBzdGF0ZS5rZXlzLmxlbmd0aCArICcga2V5JyArIChzdGF0ZS5rZXlzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEtleSB0YWJsZVxuICAgIGNvbnN0IGtleVRhYmxlQ29udGFpbmVyID0gJCgna2V5LXRhYmxlLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IG5vS2V5c01zZyA9ICQoJ25vLWtleXMnKTtcbiAgICBjb25zdCBrZXlUYWJsZUJvZHkgPSAkKCdrZXktdGFibGUtYm9keScpO1xuXG4gICAgaWYgKGtleVRhYmxlQ29udGFpbmVyKSBrZXlUYWJsZUNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUua2V5cy5sZW5ndGggPiAwID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAobm9LZXlzTXNnKSBub0tleXNNc2cuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIGlmIChrZXlUYWJsZUJvZHkpIHtcbiAgICAgICAgY29uc3Qgc29ydGVkID0gc29ydGVkS2V5cygpO1xuICAgICAgICBrZXlUYWJsZUJvZHkuaW5uZXJIVE1MID0gc29ydGVkLm1hcChrZXkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmVkaXRpbmdJZCA9PT0ga2V5LmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZSBpcy1saXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLWhlYWRlclwiPkVkaXQga2V5PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLWJvZHkgZmxleCBmbGV4LWNvbCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5zLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIktleSBsYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1sYWJlbD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtlc2NhcGVBdHRyKHN0YXRlLmVkaXRMYWJlbCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5zLWlucHV0IG1vbm9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVsbGNoZWNrPVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiU2VjcmV0IGtleVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1zZWNyZXQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0U2VjcmV0KX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZ2FwLTIganVzdGlmeS1lbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLWdob3N0IGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tcHJpbWFyeSBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwic2F2ZS1lZGl0XCI+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXZlYWxlZCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGtleS5pZDtcbiAgICAgICAgICAgIC8vIEFuIHVuZGVjcnlwdGFibGUgc2VjcmV0IG11c3QgcmVhZCBhcyBhIFBST0JMRU0sIG5ldmVyIGFzIGJsYW5rIFx1MjAxNFxuICAgICAgICAgICAgLy8gYmxhbmsgaXMgd2hhdCBtYWRlIHRoZSBvbGQgZGF0YSBsb3NzIGludmlzaWJsZS5cbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlTZWNyZXQgPSBrZXkudW5kZWNyeXB0YWJsZVxuICAgICAgICAgICAgICAgID8gJ3VucmVhZGFibGUgb24gdGhpcyBkZXZpY2UnXG4gICAgICAgICAgICAgICAgOiAocmV2ZWFsZWQgPyBlc2NhcGVIdG1sKGtleS5zZWNyZXQpIDogZXNjYXBlSHRtbChtYXNrU2VjcmV0KGtleS5zZWNyZXQpKSk7XG4gICAgICAgICAgICBjb25zdCBjb3B5TGFiZWwgPSBzdGF0ZS5jb3BpZWRJZCA9PT0ga2V5LmlkID8gJ0NvcGllZCEnIDogJ0NvcHknO1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlJHtyZXZlYWxlZCA/ICcgaXMtbGl2ZScgOiAnJ31cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInBhdGNoLXBvaW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9XCIke3JldmVhbGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCIke3JldmVhbGVkID8gJ0hpZGUgc2VjcmV0JyA6ICdSZXZlYWwgc2VjcmV0J31cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCIke3JldmVhbGVkID8gJ0hpZGUnIDogJ1JldmVhbCd9IHNlY3JldCBmb3IgJHtlc2NhcGVBdHRyKGtleS5sYWJlbCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInBhdGNoLWphY2tcIj48L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMC41IG1pbi13LTAgZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgaG92ZXI6dW5kZXJsaW5lXCIgZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIiB0aXRsZT1cIkVkaXQga2V5XCI+JHtlc2NhcGVIdG1sKGtleS5sYWJlbCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibW9ubyB0ZXh0LXhzICR7cmV2ZWFsZWQgPyAnJyA6ICdpbnMtbXV0ZWQgJ31pbnMtdHJ1bmNhdGUgY3Vyc29yLXBvaW50ZXJcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7ZGlzcGxheVNlY3JldH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicm93LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7Y29weUxhYmVsfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1zbSBidG4tLWRlc3RydWN0aXZlXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+RGVsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICAgICAgfSkuam9pbignJyk7XG5cbiAgICAgICAgLy8gQmluZCB0YWJsZSBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc3RhcnRFZGl0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXZlYWxlZElkID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0gZWwuZGF0YXNldC5rZXlJZCA/IG51bGwgOiBlbC5kYXRhc2V0LmtleUlkO1xuICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gY29weVNlY3JldChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBkZWxldGVLZXkoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlRWRpdCk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsRWRpdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJpbmQgZWRpdCBpbnB1dCBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtbGFiZWxdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRMYWJlbCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1zZWNyZXRdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQga2V5IGZvcm1cbiAgICBjb25zdCBuZXdMYWJlbElucHV0ID0gJCgnbmV3LWxhYmVsJyk7XG4gICAgY29uc3QgbmV3U2VjcmV0SW5wdXQgPSAkKCduZXctc2VjcmV0Jyk7XG4gICAgY29uc3QgYWRkS2V5QnRuID0gJCgnYWRkLWtleS1idG4nKTtcblxuICAgIGlmIChuZXdMYWJlbElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld0xhYmVsSW5wdXQpIG5ld0xhYmVsSW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdMYWJlbDtcbiAgICBpZiAobmV3U2VjcmV0SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3U2VjcmV0SW5wdXQpIG5ld1NlY3JldElucHV0LnZhbHVlID0gc3RhdGUubmV3U2VjcmV0O1xuICAgIGlmIChhZGRLZXlCdG4pIHtcbiAgICAgICAgYWRkS2V5QnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLm5ld0xhYmVsLnRyaW0oKS5sZW5ndGggPT09IDAgfHwgc3RhdGUubmV3U2VjcmV0LnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGFkZEtleUJ0bi50ZXh0Q29udGVudCA9IHN0YXRlLnNhdmluZyA/ICdTYXZpbmcuLi4nIDogJ1NhdmUnO1xuICAgIH1cblxuICAgIC8vIFRvYXN0XG4gICAgY29uc3QgdG9hc3QgPSAkKCd0b2FzdCcpO1xuICAgIGlmICh0b2FzdCkge1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9IHN0YXRlLnRvYXN0O1xuICAgICAgICB0b2FzdC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudG9hc3QgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBzdHI7XG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG4vLyAtLS0gQ1JVRCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gYWRkS2V5KCkge1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUubmV3TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLm5ld1NlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgY29uc3QgaWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIGF3YWl0IHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLm5ld0xhYmVsID0gJyc7XG4gICAgc3RhdGUubmV3U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICBzaG93VG9hc3QoJ0tleSBhZGRlZCcpO1xufVxuXG5mdW5jdGlvbiBzdGFydEVkaXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoa2V5LnVuZGVjcnlwdGFibGUpIHtcbiAgICAgICAgLy8gT3BlbmluZyBpdCB3b3VsZCBzZWVkIHRoZSBlZGl0b3Igd2l0aCBub3RoaW5nIGFuZCBTYXZlIHdvdWxkIHdyaXRlXG4gICAgICAgIC8vIHRoYXQgbm90aGluZyBvdmVyIHRoZSBzdG9yZWQgY2lwaGVydGV4dC5cbiAgICAgICAgc2hvd1RvYXN0KCdUaGlzIGtleSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlIFx1MjAxNCBpdCB3YXMgbGVmdCB1bnRvdWNoZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBrZXkuaWQ7XG4gICAgc3RhdGUuZWRpdExhYmVsID0ga2V5LmxhYmVsO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSBrZXkuc2VjcmV0O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRWRpdCgpIHtcbiAgICBpZiAoIXN0YXRlLmVkaXRpbmdJZCkgcmV0dXJuO1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUuZWRpdExhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5lZGl0U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIGF3YWl0IHNhdmVBcGlLZXkoc3RhdGUuZWRpdGluZ0lkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IHVwZGF0ZWQnKTtcbn1cblxuZnVuY3Rpb24gY2FuY2VsRWRpdCgpIHtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlS2V5KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKCEoYXdhaXQgaW5zQ29uZmlybSh7IHRpdGxlOiBgRGVsZXRlIFwiJHtrZXkubGFiZWx9XCI/YCwgYm9keTogJ1RoZSBzdG9yZWQgc2VjcmV0IGlzIHJlbW92ZWQgZnJvbSB5b3VyIGVuY3J5cHRlZCB2YXVsdC4nLCBjb25maXJtTGFiZWw6ICdEZWxldGUga2V5JywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSByZXR1cm47XG5cbiAgICBhd2FpdCBkZWxldGVBcGlLZXkoaWQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc2hvd1RvYXN0KCdLZXkgZGVsZXRlZCcpO1xufVxuXG4vLyAtLS0gQ2xpcGJvYXJkIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5U2VjcmV0KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKGtleS51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBrZXkgY291bGQgbm90IGJlIGRlY3J5cHRlZCBvbiB0aGlzIGRldmljZScpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IGNvcHlTZWNyZXRUb0NsaXBib2FyZChrZXkuc2VjcmV0KTtcbiAgICBzdGF0ZS5jb3BpZWRJZCA9IGlkO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5jb3BpZWRJZCA9IG51bGw7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuLy8gLS0tIFN5bmMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIHB1Ymxpc2hUb1JlbGF5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBrZXlzOiBhd2FpdCBrZXlzRm9yUmVsYXkoKSB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnbG9jYWwtb25seScpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9O1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc3luY0FsbCgpIHtcbiAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ3N5bmNpbmcnO1xuICAgIHN0YXRlLnN5bmNFcnJvciA9ICcnO1xuICAgIHJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnYXBpa2V5cy5mZXRjaCcgfSk7XG5cbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgICAgICBzdGF0ZS5zeW5jRXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5rZXlzKSB7XG4gICAgICAgICAgICAvLyBBIGtleSBkZWxldGVkIGhlcmUgc3RheXMgZGVsZXRlZDogZHJvcCBhbnkgcmVsYXkgY29weSBkYXRlZCBhdCBvclxuICAgICAgICAgICAgLy8gYmVmb3JlIGl0cyBsb2NhbCBkZWxldGlvbi5cbiAgICAgICAgICAgIGNvbnN0IHsgbWVyZ2VkOiByZW1vdGVLZXlzIH0gPSBtZXJnZVJlbW90ZSh7fSwgcmVzdWx0LmtleXMsIGF3YWl0IGdldERlbGV0ZWRLZXlzKCksIHtcbiAgICAgICAgICAgICAgICB0aW1lT2Y6IChrKSA9PiAoayAmJiBrLnVwZGF0ZWRBdCkgfHwgcmVzdWx0LmNyZWF0ZWRBdCB8fCAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldEFwaUtleVN0b3JlKCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbEtleXMgPSBzdG9yZS5rZXlzO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxDb3VudCA9IE9iamVjdC5rZXlzKGxvY2FsS2V5cykubGVuZ3RoO1xuXG4gICAgICAgICAgICBpZiAobG9jYWxDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGltcG9ydFN0b3JlKHJlbW90ZUtleXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3RvcmUucmVsYXlDcmVhdGVkQXQgfHwgcmVzdWx0LmNyZWF0ZWRBdCA+IHN0b3JlLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVtb3RlS2V5cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnaWRsZSc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gZS5tZXNzYWdlIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVN5bmMoKSB7XG4gICAgYXdhaXQgc2V0U3luY0VuYWJsZWQoc3RhdGUuc3luY0VuYWJsZWQpO1xuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG4vLyAtLS0gSW1wb3J0IC8gRXhwb3J0IC0tLVxuXG5hc3luYyBmdW5jdGlvbiBleHBvcnRLZXlzKCkge1xuICAgIGNvbnN0IHsga2V5cywgdW5kZWNyeXB0YWJsZSB9ID0gYXdhaXQgZXhwb3J0U3RvcmUoKTtcbiAgICBjb25zdCBwbGFpblRleHQgPSBKU09OLnN0cmluZ2lmeShrZXlzLCBudWxsLCAyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2FwaWtleXMuZW5jcnlwdCcsXG4gICAgICAgIHBheWxvYWQ6IHsgcGxhaW5UZXh0IH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHNob3dUb2FzdCgnRXhwb3J0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeSh7IGVuY3J5cHRlZDogdHJ1ZSwgZGF0YTogcmVzdWx0LmNpcGhlclRleHQgfSldLFxuICAgICAgICB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcbiAgICBhLmRvd25sb2FkID0gJ25vc3Rya2V5LWFwaS1rZXlzLWJhY2t1cC5qc29uJztcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIHNob3dUb2FzdCh1bmRlY3J5cHRhYmxlLmxlbmd0aFxuICAgICAgICA/IGBFeHBvcnRlZCBcdTIwMTQgJHt1bmRlY3J5cHRhYmxlLmxlbmd0aH0ga2V5KHMpIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgaGVyZSBhbmQgd2VyZSBiYWNrZWQgdXAgc3RpbGwtZW5jcnlwdGVkOiAke3VuZGVjcnlwdGFibGUuam9pbignLCAnKX1gXG4gICAgICAgIDogJ0V4cG9ydGVkJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydEtleXMoZXZlbnQpIHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZmlsZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodGV4dCk7XG5cbiAgICAgICAgbGV0IGtleXM7XG4gICAgICAgIGlmIChwYXJzZWQuZW5jcnlwdGVkICYmIHBhcnNlZC5kYXRhKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAga2luZDogJ2FwaWtleXMuZGVjcnlwdCcsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBjaXBoZXJUZXh0OiBwYXJzZWQuZGF0YSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2hvd1RvYXN0KCdEZWNyeXB0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5cyA9IEpTT04ucGFyc2UocmVzdWx0LnBsYWluVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gcGFyc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyBpbXBvcnRlZCB9ID0gYXdhaXQgaW1wb3J0U3RvcmUoa2V5cyk7XG4gICAgICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dUb2FzdCgnSW1wb3J0ZWQgJyArIGltcG9ydGVkICsgJyBrZXlzJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydCBmYWlsZWQ6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnO1xufVxuXG4vLyAtLS0gRXZlbnQgYmluZGluZyAtLS1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAkKCdzeW5jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN5bmNBbGwpO1xuICAgICQoJ2FkZC1rZXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYWRkS2V5KTtcbiAgICAkKCdleHBvcnQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXhwb3J0S2V5cyk7XG4gICAgJCgnaW1wb3J0LWZpbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaW1wb3J0S2V5cyk7XG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xuXG4gICAgJCgnc3luYy10b2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHN0YXRlLnN5bmNFbmFibGVkID0gIXN0YXRlLnN5bmNFbmFibGVkO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgdG9nZ2xlU3luYygpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LWxhYmVsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubmV3TGFiZWwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCduZXctc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubmV3U2VjcmV0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzaG93R2F0ZShnYXRlLCBtYWluLCB7IHRpdGxlLCBtZXNzYWdlLCBidXR0b24gfSkge1xuICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgY29uc3QgdCA9ICQoJ2dhdGUtdGl0bGUnKTsgaWYgKHQgJiYgdGl0bGUpIHQudGV4dENvbnRlbnQgPSB0aXRsZTtcbiAgICBjb25zdCBtID0gJCgnZ2F0ZS1tZXNzYWdlJyk7IGlmIChtICYmIG1lc3NhZ2UpIG0udGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICAgIGNvbnN0IGIgPSAkKCdnYXRlLXNlY3VyaXR5LWJ0bicpOyBpZiAoYiAmJiBidXR0b24pIGIudGV4dENvbnRlbnQgPSBidXR0b247XG4gICAgYj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaS5ydW50aW1lLmdldFVSTCgnc2VjdXJpdHkvc2VjdXJpdHkuaHRtbCcpO1xuICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gR2F0ZTogcmVxdWlyZSBtYXN0ZXIgcGFzc3dvcmQgQU5EIGFuIHVubG9ja2VkIHNlc3Npb24gYmVmb3JlIHJlbmRlcmluZy5cbiAgICBjb25zdCBpc0VuY3J5cHRlZCA9IGF3YWl0IGFza0dhdGUoJ2lzRW5jcnlwdGVkJyk7XG4gICAgY29uc3QgbG9ja2VkID0gYXdhaXQgYXNrR2F0ZSgnaXNMb2NrZWQnKTtcbiAgICBjb25zdCBnYXRlID0gJCgndmF1bHQtbG9ja2VkLWdhdGUnKTtcbiAgICBjb25zdCBtYWluID0gJCgndmF1bHQtbWFpbi1jb250ZW50Jyk7XG5cbiAgICBpZiAoIWlzRW5jcnlwdGVkKSB7XG4gICAgICAgIC8vIE5vIG1hc3RlciBwYXNzd29yZCBzZXQgeWV0IFx1MjAxNCBkZXZpY2Uta2V5IGVuY3J5cHRpb24gaXMgYWN0aXZlIGJ1dCB0aGVcbiAgICAgICAgLy8gdmF1bHQgVUkgc3RpbGwgYXNrcyB0aGUgdXNlciB0byBzZXQgYSBwYXNzd29yZCBmaXJzdC5cbiAgICAgICAgc2V0VW5sb2NrZWQodHJ1ZSk7XG4gICAgICAgIHNob3dHYXRlKGdhdGUsIG1haW4sIHt9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsb2NrZWQpIHtcbiAgICAgICAgLy8gRjU6IHNlc3Npb24gaXMgbG9ja2VkIFx1MjAxNCByZWZ1c2UgdG8gcmVhZC9yZW5kZXIgYW55IEFQSS1rZXkgc2VjcmV0LlxuICAgICAgICBzZXRVbmxvY2tlZChmYWxzZSk7XG4gICAgICAgIHNob3dHYXRlKGdhdGUsIG1haW4sIHtcbiAgICAgICAgICAgIHRpdGxlOiAnVmF1bHQgTG9ja2VkJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdVbmxvY2sgTm9zdHJLZXkgd2l0aCB5b3VyIG1hc3RlciBwYXNzd29yZCB0byB2aWV3IHlvdXIgQVBJIGtleXMuJyxcbiAgICAgICAgICAgIGJ1dHRvbjogJ1VubG9jaycsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VW5sb2NrZWQodHJ1ZSk7XG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgc3RhdGUucmVsYXlJbmZvID0gcmVsYXlzIHx8IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuICAgIHN0YXRlLnN5bmNFbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHN5bmNBbGwoKTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBzdGFydFBhZ2UoaW5pdCkpO1xuIiwgIi8qKlxuICogY29weS1zZWNyZXQuanMgXHUyMDE0IGNvcHkgYSBzZWNyZXQgKG5zZWMsIHNlZWQgcGhyYXNlLCBidW5rZXIgVVJJIHdpdGggYVxuICogc2VjcmV0LCBBUEkga2V5IHNlY3JldCkgYW5kIGNsZWFyIHRoZSBjbGlwYm9hcmQgYWZ0ZXIgNjAgc2Vjb25kcy5cbiAqXG4gKiBUaGUgY2xlYXIgcnVucyBvbmx5IHdoaWxlIHRoZSBwYWdlIHRoYXQgY29waWVkIGlzIHN0aWxsIG9wZW46IG5vXG4gKiBvZmZzY3JlZW4gZG9jdW1lbnQsIG5vIG5ldyBwZXJtaXNzaW9ucy4gQ2xlYXJpbmcgaXMgYmVzdCBlZmZvcnQ7IGlmIHRoZVxuICogY2xpcGJvYXJkIHJlZnVzZXMgdGhlIHdyaXRlLCBub3RoaW5nIGlzIHRocm93bi5cbiAqXG4gKiBQdWJsaWMgdmFsdWVzIChucHViLCBoZXggcHVia2V5KSB1c2UgYSBwbGFpbiBjbGlwYm9hcmQgd3JpdGUsIG5vdCB0aGlzLlxuICovXG5cbmV4cG9ydCBjb25zdCBTRUNSRVRfQ0xFQVJfTVMgPSA2MDAwMDtcblxubGV0IHBlbmRpbmdDbGVhciA9IG51bGw7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEBwYXJhbSB7eyBjbGlwYm9hcmQ/OiB7IHdyaXRlVGV4dChzOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IH0sIGRlbGF5TXM/OiBudW1iZXIgfX0gW29wdHNdXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gcmVzb2x2ZXMgb25jZSBjb3BpZWQ7IHJlamVjdHMgaWYgdGhlIGNvcHkgZmFpbHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcHlTZWNyZXQodGV4dCwgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgY2xpcGJvYXJkID0gb3B0cy5jbGlwYm9hcmRcbiAgICAgICAgfHwgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yLmNsaXBib2FyZCA6IHVuZGVmaW5lZCk7XG4gICAgaWYgKCFjbGlwYm9hcmQ/LndyaXRlVGV4dCkgdGhyb3cgbmV3IEVycm9yKCdDbGlwYm9hcmQgdW5hdmFpbGFibGUnKTtcbiAgICBhd2FpdCBjbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgIGlmIChwZW5kaW5nQ2xlYXIpIGNsZWFyVGltZW91dChwZW5kaW5nQ2xlYXIpO1xuICAgIHBlbmRpbmdDbGVhciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwZW5kaW5nQ2xlYXIgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGNsaXBib2FyZC53cml0ZVRleHQoJycpKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogYmVzdCBlZmZvcnQgKi8gfVxuICAgIH0sIG9wdHMuZGVsYXlNcyA/PyBTRUNSRVRfQ0xFQVJfTVMpO1xufVxuIiwgIi8qKlxuICogVGhlIHF1ZXN0aW9ucyBhIHBhZ2UgYXNrcyB0aGUgd29ya2VyIGJlZm9yZSBpdCBjYW4gZHJhdyBhbnl0aGluZy4gVGhlIHdvcmtlclxuICogY2FuIGFuc3dlciB0aGVtIHdpdGggYSByZWZ1c2FsIG9iamVjdCwgYW5kIGFuIG9iamVjdCBpcyB0cnV0aHksIHNvIGEgcGFnZSB0aGF0XG4gKiByZWFkcyBpdCBhcyBhIHllcyBzaG93cyB0aGUgd3Jvbmcgc2NyZWVuLiBQYWdlcyBhc2sgdGhyb3VnaCBhc2tHYXRlIGluc3RlYWQ6XG4gKiBhIHJlZnVzYWwgcmVwbGFjZXMgdGhlIHBhZ2Ugd2l0aCBhIHBsYWluIG1lc3NhZ2UgYW5kIHN0b3BzIGl0cyBzdGFydC11cC5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5leHBvcnQgY29uc3QgU1RBUlRfRVJST1IgPSAnTm9zdHJLZXkgY291bGQgbm90IHN0YXJ0IHRoaXMgcGFnZS4gUmVsb2FkIG9yIHJlaW5zdGFsbC4nO1xuXG5leHBvcnQgY2xhc3MgR2F0ZVJlZnVzZWQgZXh0ZW5kcyBFcnJvciB7fVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZ1c2VkKGFuc3dlcikge1xuICAgIHJldHVybiAhIWFuc3dlciAmJiB0eXBlb2YgYW5zd2VyID09PSAnb2JqZWN0JyAmJiBhbnN3ZXIuc3VjY2VzcyA9PT0gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93U3RhcnRFcnJvcigpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2FsZXJ0Jyk7XG4gICAgbWVzc2FnZS5kYXRhc2V0LnN0YXJ0RXJyb3IgPSAnJztcbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gU1RBUlRfRVJST1I7XG4gICAgbWVzc2FnZS5zdHlsZS5wYWRkaW5nID0gJzE2cHgnO1xuICAgIGRvY3VtZW50LmJvZHkucmVwbGFjZUNoaWxkcmVuKG1lc3NhZ2UpO1xufVxuXG4vKiogQXNrIHRoZSB3b3JrZXIuIE9uIGEgcmVmdXNhbCwgc2hvdyB0aGUgbWVzc2FnZSBhbmQgdGhyb3cgR2F0ZVJlZnVzZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNrR2F0ZShraW5kKSB7XG4gICAgY29uc3QgYW5zd2VyID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kIH0pO1xuICAgIGlmIChpc1JlZnVzZWQoYW5zd2VyKSkge1xuICAgICAgICBzaG93U3RhcnRFcnJvcigpO1xuICAgICAgICB0aHJvdyBuZXcgR2F0ZVJlZnVzZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGFuc3dlcjtcbn1cblxuLy8gQXQgbW9zdCBvbmUgbm90ZSBpbiB0aGlzIHRpbWUsIGhvd2V2ZXIgYnVzeSB0aGUgcGVyc29uIGlzLlxuY29uc3QgQUNUSVZJVFlfTk9URV9NUyA9IDMwXzAwMDtcblxuLyoqXG4gKiBVc2luZyBvbmUgb2YgTm9zdHJLZXkncyBvd24gcGFnZXMgY291bnRzIGFzIGFjdGl2aXR5IGZvciBhdXRvLWxvY2ssIGFzIGRvZXNcbiAqIGFuc3dlcmluZyBhIHJlcXVlc3QuIFNpdGUgcmVxdWVzdHMsIGV2ZW4gb25lcyBzaWduZWQgdW5kZXIgYSByZW1lbWJlcmVkXG4gKiBncmFudCwgbmV2ZXIgY291bnQuXG4gKi9cbmZ1bmN0aW9uIHdhdGNoQWN0aXZpdHkoKSB7XG4gICAgbGV0IGxhc3ROb3RlID0gMDtcbiAgICBjb25zdCBub3RlID0gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3ROb3RlIDwgQUNUSVZJVFlfTk9URV9NUykgcmV0dXJuO1xuICAgICAgICBsYXN0Tm90ZSA9IERhdGUubm93KCk7XG4gICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QXV0b0xvY2snIH0pPy5jYXRjaD8uKCgpID0+IHt9KTtcbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgbm90ZSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBub3RlLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSk7XG59XG5cbi8qKiBSdW4gYSBwYWdlJ3Mgc3RhcnQtdXAuIEEgcmVmdXNhbCBoYXMgYWxyZWFkeSBiZWVuIHNob3duLCBzbyBpdCBlbmRzIGhlcmUuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRQYWdlKGluaXQpIHtcbiAgICB3YXRjaEFjdGl2aXR5KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaW5pdCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEdhdGVSZWZ1c2VkKSkgdGhyb3cgZTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBpbnMtY29uZmlybS5qcyBcdTIwMTQgdGhlIHNoYXJlZCBjb25zZW50IG92ZXJsYXkgZm9yIGV4dGVuc2lvbiBwYWdlcy5cbiAqXG4gKiBPbmUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGNvbnNlbnQtc3VyZmFjZSBzdGFuZGFyZDogYSBkaW1tZWQgYmFja2Ryb3AgcGx1c1xuICogZWl0aGVyIGEgYm90dG9tIFNIRUVUIChkZWZhdWx0OyBkZXN0cnVjdGl2ZSAvIGlycmV2ZXJzaWJsZSBhY3RzKSBvciBhXG4gKiBjZW50ZXJlZCBQT1BPVkVSIChsb3ctc3Rha2VzLCByZXZlcnNpYmxlIGFjdHMpLiBSZXBsYWNlcyBuYXRpdmVcbiAqIGNvbmZpcm0oKS9hbGVydCgpIG9uIGV2ZXJ5IGV4dGVuc2lvbi1wYWdlIHN1cmZhY2UuXG4gKlxuICogICBpbnNDb25maXJtKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50IH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTxib29sZWFuPiAgICh0cnVlID0gY29uZmlybWVkOyBFc2NhcGUvYmFja2Ryb3AvY2FuY2VsID0gZmFsc2UpXG4gKiAgIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPHZvaWQ+XG4gKlxuICogU3R5bGluZyBjb21lcyBlbnRpcmVseSBmcm9tIGluc3RydW1lbnQuY3NzIChzZWN0aW9uIDE4ICsgdGhlIC5idG4gZmFtaWx5KSxcbiAqIHNvIHNraW4gLyBtb2RlIC8gY29udHJhc3QgLyBkZW5zaXR5IC8gdGV4dC1zaXplIGFycml2ZSB2aWEgdGhlIHBhZ2Unc1xuICogc3RhbXBlZCBkYXRhLWlucy0qIGF0dHJpYnV0ZXMgXHUyMDE0IG5vIHN0b3JhZ2UgYWNjZXNzLCBubyBtZXNzYWdpbmcgaGVyZS5cbiAqXG4gKiBTYWZldHk6IHRpdGxlL2JvZHkgbWF5IGNvbnRhaW4gdXNlciBkYXRhIChrZXkgbGFiZWxzLCB2YXVsdCBwYXRocyk7IHRoZSBET01cbiAqIGlzIGJ1aWx0IHdpdGggY3JlYXRlRWxlbWVudCArIHRleHRDb250ZW50IE9OTFkgXHUyMDE0IG5ldmVyIGlubmVySFRNTC5cbiAqL1xuXG4vLyBTZXJpYWxpemUgb3ZlcmxhcHBpbmcgY2FsbHMgc28gYSBzZWNvbmQgZGlhbG9nIG5ldmVyIGRvdWJsZS1yZW5kZXJzIG9uIHRvcFxuLy8gb2YgKG9yIGludGVybGVhdmVzIHdpdGgpIGFuIG9wZW4gb25lLlxubGV0IHF1ZXVlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbmxldCBpZENvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBtb3Rpb25PZmYoKSB7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5zLW1vdGlvbicpID09PSAnb2ZmJykgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEJ1aWxkLCBzaG93IGFuZCBzZXR0bGUgb25lIGRpYWxvZy4gUmVzb2x2ZXMgdHJ1ZSAoY29uZmlybSkgb3IgZmFsc2VcbiAqIChjYW5jZWwgLyBFc2NhcGUgLyBiYWNrZHJvcCBjbGljaykuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZSB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByb290LmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1yb290JztcblxuICAgICAgICBjb25zdCBiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBiYWNrZHJvcC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYmFja2Ryb3AnO1xuXG4gICAgICAgIGNvbnN0IGlzU2hlZXQgPSB2YXJpYW50ICE9PSAncG9wb3Zlcic7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaWFsb2cuY2xhc3NOYW1lID0gaXNTaGVldCA/ICdpbnMtY29uc2VudC1zaGVldCcgOiAnaW5zLWNvbnNlbnQtcG9wb3Zlcic7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAoZGVzdHJ1Y3RpdmUgfHwgbm90aWNlKSA/ICdhbGVydGRpYWxvZycgOiAnZGlhbG9nJyk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuXG4gICAgICAgIGlmIChpc1NoZWV0KSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhhbmRsZS5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtaGFuZGxlJztcbiAgICAgICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChoYW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdWlkID0gKytpZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC10aXRsZSc7XG4gICAgICAgIHRpdGxlRWwuaWQgPSBgaW5zLWNvbnNlbnQtdGl0bGUtJHt1aWR9YDtcbiAgICAgICAgdGl0bGVFbC50ZXh0Q29udGVudCA9IHRpdGxlIHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIHRpdGxlRWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGJvZHlFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgYm9keUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1ib2R5JztcbiAgICAgICAgYm9keUVsLmlkID0gYGlucy1jb25zZW50LWJvZHktJHt1aWR9YDtcbiAgICAgICAgYm9keUVsLnRleHRDb250ZW50ID0gYm9keSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGJvZHlFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCBib2R5RWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYWN0aW9ucyc7XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IFtdO1xuICAgICAgICBsZXQgY2FuY2VsQnRuID0gbnVsbDtcbiAgICAgICAgY29uc3QgY29uZmlybUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjb25maXJtQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY29uZmlybUJ0bi50ZXh0Q29udGVudCA9IGNvbmZpcm1MYWJlbDtcbiAgICAgICAgaWYgKG5vdGljZSkge1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSAnYnRuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi5jbGFzc05hbWUgPSAnYnRuIGJ0bi0tZ2hvc3QnO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gY2FuY2VsTGFiZWw7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gZGVzdHJ1Y3RpdmUgPyAnYnRuIGJ0bi0tZGVzdHJ1Y3RpdmUnIDogJ2J0biBidG4tLXByaW1hcnknO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY29uZmlybUJ0bik7XG4gICAgICAgIGJ1dHRvbnMucHVzaChjb25maXJtQnRuKTtcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoYmFja2Ryb3ApO1xuICAgICAgICByb290LmFwcGVuZENoaWxkKGRpYWxvZyk7XG5cbiAgICAgICAgbGV0IHNldHRsZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gc2V0dGxlKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZGb2N1cyAmJiB0eXBlb2YgcHJldkZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nICYmIGRvY3VtZW50LmNvbnRhaW5zKHByZXZGb2N1cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZGb2N1cy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBmb2N1cyByZXN0b3JlIGlzIGJlc3QtZWZmb3J0ICovIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG1vdGlvbk9mZigpKSBmaW5pc2goKTtcbiAgICAgICAgICAgIGVsc2Ugc2V0VGltZW91dChmaW5pc2gsIDI1MCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbktleWRvd24oZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzZXR0bGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdUYWInKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJhcCBmb2N1cyBhY3Jvc3MgdGhlIGRpYWxvZydzIGJ1dHRvbnMgb25seS5cbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJ1dHRvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBldi5zaGlmdEtleSA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBidXR0b25zWyhpZHggKyBkaXIgKyBidXR0b25zLmxlbmd0aCkgJSBidXR0b25zLmxlbmd0aF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJhY2tkcm9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGlmIChjYW5jZWxCdG4pIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKHRydWUpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290KTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAvLyBEZXN0cnVjdGl2ZSBhY3RzIHN0YXJ0IG9uIENhbmNlbCBzbyBFbnRlciBjYW4ndCBydXNoIHRoZSBkZWxldGU7XG4gICAgICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2Ugc3RhcnRzIG9uIHRoZSBjb25maXJtaW5nIGFjdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWwgPSBub3RpY2UgPyBjb25maXJtQnRuIDogKGRlc3RydWN0aXZlID8gY2FuY2VsQnRuIDogY29uZmlybUJ0bik7XG4gICAgICAgICAgICAoaW5pdGlhbCB8fCBjb25maXJtQnRuKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc0NvbmZpcm0oe1xuICAgIHRpdGxlLFxuICAgIGJvZHksXG4gICAgY29uZmlybUxhYmVsID0gJ0NvbmZpcm0nLFxuICAgIGNhbmNlbExhYmVsID0gJ0NhbmNlbCcsXG4gICAgZGVzdHJ1Y3RpdmUgPSBmYWxzZSxcbiAgICB2YXJpYW50ID0gJ3NoZWV0Jyxcbn0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlOiBmYWxzZSB9KSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsID0gJ09LJyB9ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgY29uZmlybUxhYmVsOiBkaXNtaXNzTGFiZWwsXG4gICAgICAgICAgICBjYW5jZWxMYWJlbDogJycsXG4gICAgICAgICAgICBkZXN0cnVjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB2YXJpYW50OiAnc2hlZXQnLFxuICAgICAgICAgICAgbm90aWNlOiB0cnVlLFxuICAgICAgICB9KS50aGVuKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwgIi8qKlxuICogQVBJIEtleSBTdG9yZSBcdTIwMTQgTG9jYWwgY2FjaGUgZm9yIGVuY3J5cHRlZCBBUEkga2V5c1xuICpcbiAqIFN0b3JhZ2Ugc2NoZW1hIGluIGJyb3dzZXIuc3RvcmFnZS5sb2NhbDpcbiAqICAgYXBpS2V5VmF1bHQ6IHtcbiAqICAgICBrZXlzOiB7XG4gKiAgICAgICBcIjx1dWlkPlwiOiB7IGlkLCBsYWJlbCwgc2VjcmV0LCBjcmVhdGVkQXQsIHVwZGF0ZWRBdCwgcHJvZmlsZVNjb3BlIH1cbiAqICAgICB9LFxuICogICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICogICAgIGV2ZW50SWQ6IG51bGwsXG4gKiAgICAgcmVsYXlDcmVhdGVkQXQ6IG51bGwsXG4gKiAgICAgc3luY1N0YXR1czogXCJzeW5jZWRcIiAgICAvLyBzeW5jZWQgfCBsb2NhbC1vbmx5IHwgY29uZmxpY3RcbiAqICAgfVxuICpcbiAqIHByb2ZpbGVTY29wZTogbnVsbCAoYWxsIHByb2ZpbGVzKSB8IG51bWJlcltdIChzcGVjaWZpYyBwcm9maWxlIGluZGljZXMpXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IHNjaGVkdWxlU3luY1B1c2ggfSBmcm9tICcuL3N5bmMtbWFuYWdlcic7XG5pbXBvcnQgeyB3cmFwU2VjcmV0LCB1bndyYXBTZWNyZXQsIGlzQ2lwaGVydGV4dCB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuY29uc3QgU1RPUkFHRV9LRVkgPSAnYXBpS2V5VmF1bHQnO1xuLy8gRGVsZXRpb24gdG9tYnN0b25lcyBrZXllZCBieSBpZCAoaXNzdWUgIzMpOiB7IDxpZD46IGRlbGV0ZWRBdFNlY29uZHMgfS5cbmNvbnN0IERFTEVURURfS0VZID0gJ2RlbGV0ZWRLZXlzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlbGV0ZWRLZXlzKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtERUxFVEVEX0tFWV06IHt9IH0pO1xuICAgIHJldHVybiBkYXRhW0RFTEVURURfS0VZXSAmJiB0eXBlb2YgZGF0YVtERUxFVEVEX0tFWV0gPT09ICdvYmplY3QnID8gZGF0YVtERUxFVEVEX0tFWV0gOiB7fTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEga2V5J3MgYHNlY3JldGAgZmllbGQgZm9yIGNhbGxlcnMuIFJlLXRocm93cyBsb2NrIGVycm9ycyBzbyBhIGxvY2tlZFxuICogc2Vzc2lvbiBjYW5ub3QgcmVhZCBzZWNyZXRzIChGNSkuXG4gKlxuICogQSBnZW51aW5lIGRlY3J5cHQgZmFpbHVyZSAoZS5nLiBhIGRldmljZS13cmFwcGVkIHZhbHVlIHN5bmNlZCBmcm9tIGFub3RoZXJcbiAqIGRldmljZSwgb3IgYSBibG9iIHdob3NlIHdyYXBwaW5nIGtleSByb3RhdGVkIGF3YXkpIGlzIHJlcG9ydGVkIGFzXG4gKiBgdW5kZWNyeXB0YWJsZTogdHJ1ZWAgd2l0aCBgc2VjcmV0OiBudWxsYCBcdTIwMTQgTk9UIGFzIGFuIGVtcHR5IHN0cmluZy4gQW4gZW1wdHlcbiAqIHN0cmluZyBpcyBpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGEgcmVhbCB2YWx1ZTogdGhlIFVJIHJlbmRlcmVkIGl0IGFzIGJsYW5rXG4gKiBhbmQgZXhwb3J0U3RvcmUoKSB3cm90ZSBpdCBpbnRvIHRoZSB1c2VyJ3MgZW5jcnlwdGVkIGJhY2t1cCwgcXVpZXRseVxuICogcmVwbGFjaW5nIHRoZSBvbmx5IGNvcHkgb2YgdGhlIHNlY3JldCB3aXRoIG5vdGhpbmcuIGBudWxsYCArIHRoZSBmbGFnIG1ha2VzXG4gKiB0aGUgZmFpbHVyZSB2aXNpYmxlIHRvIGV2ZXJ5IGNhbGxlciwgYW5kIGV4cG9ydFN0b3JlKCkgY2FycmllcyB0aGUgdW50b3VjaGVkXG4gKiBjaXBoZXJ0ZXh0IGluc3RlYWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRLZXkoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBrZXk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgLi4ua2V5LCBzZWNyZXQ6IGF3YWl0IHVud3JhcFNlY3JldChrZXkuc2VjcmV0KSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlLm1lc3NhZ2UgfHwgJycpLnN0YXJ0c1dpdGgoJ2xvY2tlZCcpKSB0aHJvdyBlO1xuICAgICAgICByZXR1cm4geyAuLi5rZXksIHNlY3JldDogbnVsbCwgdW5kZWNyeXB0YWJsZTogdHJ1ZSB9O1xuICAgIH1cbn1cblxuY29uc3QgREVGQVVMVF9TVE9SRSA9IHtcbiAgICBrZXlzOiB7fSxcbiAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAgICBldmVudElkOiBudWxsLFxuICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICAgIHN5bmNTdGF0dXM6ICdzeW5jZWQnLFxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmUoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXTogREVGQVVMVF9TVE9SRSB9KTtcbiAgICByZXR1cm4geyAuLi5ERUZBVUxUX1NUT1JFLCAuLi5kYXRhW1NUT1JBR0VfS0VZXSB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRTdG9yZShzdG9yZSkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogc3RvcmUgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCBBUEkga2V5IHN0b3JlIG9iamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUtleVN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAga2V5c1tpZF0gPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgfVxuICAgIHJldHVybiB7IC4uLnN0b3JlLCBrZXlzIH07XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIEFQSSBrZXkgYnkgaWQgKHNlY3JldCBkZWNyeXB0ZWQpLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLmtleXNbaWRdID8gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSkgOiBudWxsO1xufVxuXG4vKipcbiAqIFVwc2VydCBhbiBBUEkga2V5LiBDcmVhdGVzIGlmIG5ldywgdXBkYXRlcyBpZiBleGlzdGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVVSURcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxuICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0b3JlLmtleXNbaWRdO1xuICAgIC8vIFQwLTQ6IGVuY3J5cHQgdGhlIHNlY3JldCBiZWZvcmUgaXQgdG91Y2hlcyBzdG9yYWdlLlxuICAgIHN0b3JlLmtleXNbaWRdID0ge1xuICAgICAgICBpZCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIHNlY3JldDogYXdhaXQgd3JhcFNlY3JldChzZWNyZXQpLFxuICAgICAgICBjcmVhdGVkQXQ6IGV4aXN0aW5nPy5jcmVhdGVkQXQgfHwgbm93LFxuICAgICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICAgICAgcHJvZmlsZVNjb3BlOiBleGlzdGluZz8ucHJvZmlsZVNjb3BlID8/IG51bGwsXG4gICAgfTtcbiAgICAvLyBSZWNyZWF0ZSBjbGVhcnMgYW55IHRvbWJzdG9uZSBmb3IgdGhpcyBpZCAoaXNzdWUgIzMpIHNvIHRoZSBmcmVzaGx5IHNhdmVkXG4gICAgLy8ga2V5IGlzIG5vIGxvbmdlciBzdXBwcmVzc2VkIGZyb20gdGhlIHN5bmMgcGF5bG9hZC5cbiAgICBjb25zdCBkZWxldGVkID0gYXdhaXQgZ2V0RGVsZXRlZEtleXMoKTtcbiAgICBpZiAoZGVsZXRlZFtpZF0gIT0gbnVsbCkge1xuICAgICAgICBkZWxldGUgZGVsZXRlZFtpZF07XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogc3RvcmUsIFtERUxFVEVEX0tFWV06IGRlbGV0ZWQgfSk7XG4gICAgICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0S2V5KHN0b3JlLmtleXNbaWRdKTtcbn1cblxuLyoqXG4gKiBEZWxldGUgYW4gQVBJIGtleSBieSBpZCBhbmQgcmVjb3JkIGEgdG9tYnN0b25lIChpc3N1ZSAjMykgc28gdGhlIGRlbGV0aW9uXG4gKiBwcm9wYWdhdGVzIHRocm91Z2ggc3RvcmFnZS5zeW5jIGFuZCBhIHN0YWxlIHdob2xlLW9iamVjdCBvdmVyd3JpdGUgZnJvbVxuICogYW5vdGhlciBkZXZpY2UgY2Fubm90IHJlc3VycmVjdCBpdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUFwaUtleShpZCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBkZWxldGUgc3RvcmUua2V5c1tpZF07XG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWRLZXlzKCk7XG4gICAgZGVsZXRlZFtpZF0gPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBMaXN0IGFsbCBBUEkga2V5cyBzb3J0ZWQgYnkgbGFiZWwgKGNhc2UtaW5zZW5zaXRpdmUpLlxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdEFwaUtleXMoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGRlY3J5cHRlZCA9IFtdO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC52YWx1ZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgZGVjcnlwdGVkLnB1c2goYXdhaXQgZGVjcnlwdEtleShrZXkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRlZC5zb3J0KChhLCBiKSA9PlxuICAgICAgICBhLmxhYmVsLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmxhYmVsLnRvTG93ZXJDYXNlKCkpLFxuICAgICk7XG59XG5cbi8qKlxuICogU2V0IHRoZSByZWxheSBzeW5jIHRvZ2dsZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgc3RvcmUuc3luY0VuYWJsZWQgPSBlbmFibGVkO1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiByZWxheSBzeW5jIGlzIGVuYWJsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1N5bmNFbmFibGVkKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICByZXR1cm4gc3RvcmUuc3luY0VuYWJsZWQ7XG59XG5cbi8qKlxuICogVXBkYXRlIHN5bmMgc3RhdGUgYWZ0ZXIgYSByZWxheSBvcGVyYXRpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTdG9yZVN5bmNTdGF0ZShzeW5jU3RhdHVzLCBldmVudElkID0gbnVsbCwgcmVsYXlDcmVhdGVkQXQgPSBudWxsKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNTdGF0dXMgPSBzeW5jU3RhdHVzO1xuICAgIGlmIChldmVudElkICE9PSBudWxsKSBzdG9yZS5ldmVudElkID0gZXZlbnRJZDtcbiAgICBpZiAocmVsYXlDcmVhdGVkQXQgIT09IG51bGwpIHN0b3JlLnJlbGF5Q3JlYXRlZEF0ID0gcmVsYXlDcmVhdGVkQXQ7XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xufVxuXG4vKipcbiAqIEV4cG9ydCB0aGUga2V5cyBvYmplY3QgKGZvciBlbmNyeXB0ZWQgYmFja3VwKS5cbiAqXG4gKiBBIGtleSB0aGlzIGRldmljZSBjYW5ub3QgZGVjcnlwdCBpcyBORVZFUiBleHBvcnRlZCB3aXRoIGFuIGVtcHR5L251bGwgc2VjcmV0XG4gKiBcdTIwMTQgYSBibGFuayB3b3VsZCBvdmVyd3JpdGUgdGhlIHJlY292ZXJhYmxlIGNpcGhlcnRleHQgdGhlIG5leHQgdGltZSB0aGUgYmFja3VwXG4gKiBpcyBpbXBvcnRlZC4gSXQgaXMgZXhwb3J0ZWQgYXMgdGhlIE9SSUdJTkFMIENJUEhFUlRFWFQsXG4gKiB1bnRvdWNoZWQ6IHRoYXQgcHJlc2VydmVzIHN0cmljdGx5IG1vcmUgdXNlciBkYXRhIHRoYW4gb21pdHRpbmcgaXQgKHRoZSB2YWx1ZVxuICogaXMgc3RpbGwgcmVjb3ZlcmFibGUgb24gYSBkZXZpY2UgdGhhdCBob2xkcyB0aGUgd3JhcHBpbmcga2V5LCBvciBvbmNlIHRoZSBrZXlcbiAqIGlzIHJlc3RvcmVkKSwgYW5kIGltcG9ydFN0b3JlKCkgYWxyZWFkeSBwYXNzZXMgY2lwaGVydGV4dCBzdHJhaWdodCB0aHJvdWdoXG4gKiBpbnN0ZWFkIG9mIHJlLXdyYXBwaW5nIGl0LCBzbyB0aGUgcm91bmQgdHJpcCBpcyBsb3NzbGVzcy4gVGhlIGlkcyBhcmUgYWxzb1xuICogcmVwb3J0ZWQgc28gdGhlIGNhbGxlciBjYW4gdGVsbCB0aGUgdXNlciB3aGljaCBrZXlzIGNhbWUgdGhyb3VnaCB1bm9wZW5lZC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7a2V5czogT2JqZWN0LCB1bmRlY3J5cHRhYmxlOiBzdHJpbmdbXX0+fSBNYXAgb2YgaWQgLT4ga2V5XG4gKiAgICAgICAgICBkYXRhLCBwbHVzIHRoZSBsYWJlbHMvaWRzIHRoYXQgd2VyZSBleHBvcnRlZCBzdGlsbC1lbmNyeXB0ZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTdG9yZSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGNvbnN0IHVuZGVjcnlwdGFibGUgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhzdG9yZS5rZXlzKSkge1xuICAgICAgICBjb25zdCBkZWNyeXB0ZWQgPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgICAgIGlmIChkZWNyeXB0ZWQ/LnVuZGVjcnlwdGFibGUpIHtcbiAgICAgICAgICAgIGtleXNbaWRdID0geyAuLi5rZXkgfTsgICAgICAgICAgICAvLyBjaXBoZXJ0ZXh0IGNhcnJpZWQgdGhyb3VnaCBhcy1pc1xuICAgICAgICAgICAgdW5kZWNyeXB0YWJsZS5wdXNoKGtleS5sYWJlbCB8fCBpZCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBrZXlzW2lkXSA9IGRlY3J5cHRlZDtcbiAgICB9XG4gICAgcmV0dXJuIHsga2V5cywgdW5kZWNyeXB0YWJsZSB9O1xufVxuXG4vKipcbiAqIFRoZSBrZXlzIHRvIHNlbmQgdG8gdGhlIHJlbGF5OiBvbmx5IHRob3NlIHRoaXMgZGV2aWNlIGNhbiByZWFkLiBBIGtleSBpdFxuICogY2Fubm90IHJlYWQgaXMgbGVmdCBvdXQsIHNvIHRoZSBjb3B5IG9uIHRoZSBkZXZpY2UgdGhhdCBjYW4gcmVhZCBpdCBzdGF5c1xuICogdGhlIGdvb2Qgb25lIHdoZW4gdGhhdCBkZXZpY2UgaW1wb3J0cyB3aGF0IHdhcyBzZW50LlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IE1hcCBvZiBpZCAtPiBrZXkgZGF0YSB3aXRoIHBsYWludGV4dCBzZWNyZXRzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBrZXlzRm9yUmVsYXkoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhzdG9yZS5rZXlzKSkge1xuICAgICAgICBjb25zdCBkZWNyeXB0ZWQgPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgICAgIGlmIChoYXNVc2FibGVTZWNyZXQoZGVjcnlwdGVkKSkga2V5c1tpZF0gPSBkZWNyeXB0ZWQ7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBoYXNVc2FibGVTZWNyZXQoa2V5KSB7XG4gICAgcmV0dXJuICEha2V5ICYmICFrZXkudW5kZWNyeXB0YWJsZSAmJiB0eXBlb2Yga2V5LnNlY3JldCA9PT0gJ3N0cmluZycgJiYga2V5LnNlY3JldCAhPT0gJyc7XG59XG5cbi8qKlxuICogSW1wb3J0IGtleXMgaW50byB0aGUgc3RvcmUgKG1lcmdlIFx1MjAxNCBleGlzdGluZyBrZXlzIHdpdGggc2FtZSBpZCBhcmUgb3ZlcndyaXR0ZW4pLlxuICogSW5jb21pbmcgc2VjcmV0cyBhcmUgcGxhaW50ZXh0IChmcm9tIGEgZGVjcnlwdGVkIGJhY2t1cCBvciBhIHJlbGF5IGZldGNoKSBhbmRcbiAqIGFyZSByZS13cmFwcGVkIGZvciB0aGUgYXQtcmVzdCB0aWVyIHRoaXMgY29udGV4dCBpcyBpbiBcdTIwMTQgdGhlIGRldmljZSBrZXksIG9yXG4gKiB0aGUgcGFzc3dvcmQgc2Vzc2lvbiBrZXkgd2hlbiBvbmUgaXMgbGl2ZSBcdTIwMTQgYmVmb3JlIHN0b3JhZ2UuXG4gKlxuICogQW4gZW50cnkgd2l0aCBubyB1c2FibGUgc2VjcmV0IGlzIHNraXBwZWQsIHNvIGl0IGNhbiBuZWl0aGVyIHJlcGxhY2UgYSBnb29kXG4gKiBzZWNyZXQgbm9yIGFkZCBhIGtleSB3aXRoIG5vdGhpbmcgaW4gaXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGtleXMgLSBNYXAgb2YgaWQgLT4geyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQgfVxuICogQHJldHVybnMge1Byb21pc2U8e2ltcG9ydGVkOiBudW1iZXIsIHNraXBwZWQ6IG51bWJlcn0+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW1wb3J0U3RvcmUoa2V5cykge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBsZXQgaW1wb3J0ZWQgPSAwO1xuICAgIGxldCBza2lwcGVkID0gMDtcbiAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhrZXlzKSkge1xuICAgICAgICBpZiAoIWhhc1VzYWJsZVNlY3JldChrZXkpKSB7XG4gICAgICAgICAgICBza2lwcGVkKys7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWNyZXQgPSBpc0NpcGhlcnRleHQoa2V5LnNlY3JldCkgPyBrZXkuc2VjcmV0IDogYXdhaXQgd3JhcFNlY3JldChrZXkuc2VjcmV0KTtcbiAgICAgICAgc3RvcmUua2V5c1tpZF0gPSB7IC4uLmtleSwgc2VjcmV0IH07XG4gICAgICAgIGltcG9ydGVkKys7XG4gICAgfVxuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbiAgICByZXR1cm4geyBpbXBvcnRlZCwgc2tpcHBlZCB9O1xufVxuIiwgIi8qKlxuICogU3luYyBNYW5hZ2VyIFx1MjAxNCBQbGF0Zm9ybSBzeW5jIHZpYSBzdG9yYWdlLnN5bmMgKENocm9tZSBcdTIxOTIgR29vZ2xlLCBTYWZhcmkgXHUyMTkyIGlDbG91ZClcbiAqXG4gKiBBcmNoaXRlY3R1cmU6XG4gKiAgIFdyaXRlOiBhcHAgXHUyMTkyIHN0b3JhZ2UubG9jYWwgXHUyMTkyIHNjaGVkdWxlU3luY1B1c2goKSBcdTIxOTIgc3RvcmFnZS5zeW5jXG4gKiAgIFJlYWQ6ICBwdWxsRnJvbVN5bmMoKSBvbiBzdGFydHVwIFx1MjE5MiBtZXJnZSBpbnRvIHN0b3JhZ2UubG9jYWxcbiAqICAgTGlzdGVuOiBzdG9yYWdlLm9uQ2hhbmdlZChcInN5bmNcIikgXHUyMTkyIG1lcmdlIHJlbW90ZSBjaGFuZ2VzIGludG8gbG9jYWxcbiAqXG4gKiBzdG9yYWdlLmxvY2FsIHJlbWFpbnMgdGhlIHNvdXJjZSBvZiB0cnV0aC4gc3RvcmFnZS5zeW5jIGlzIGEgYmVzdC1lZmZvcnQgbWlycm9yLlxuICovXG5cbmltcG9ydCB7IG1lcmdlUmVtb3RlIH0gZnJvbSAnLi9zeW5jLW1lcmdlJztcbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBpc0NpcGhlcnRleHQsIGlzUGFzc3dvcmRCbG9iIH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuaW1wb3J0IHsgYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzLCByZWRhY3RQcm9maWxlcyB9IGZyb20gJy4vYnVua2VyLXVybC5qcyc7XG5pbXBvcnQgeyB3aXRoUHJvZmlsZXNMb2NrIH0gZnJvbSAnLi9wcm9maWxlcy1zdG9yZS5qcyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29uc3RhbnRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IFNZTkNfUVVPVEEgPSAxMDJfNDAwOyAgICAgICAvLyAxMDAgS0IgdG90YWxcbmNvbnN0IE1BWF9JVEVNID0gOF8xOTI7ICAgICAgICAgICAvLyA4IEtCIHBlciBpdGVtXG5jb25zdCBNQVhfSVRFTVMgPSA1MTI7XG5jb25zdCBDSFVOS19QUkVGSVggPSAnX2NodW5rOic7XG5jb25zdCBTWU5DX01FVEFfS0VZID0gJ19zeW5jX21ldGEnO1xuY29uc3QgTE9DQUxfRU5BQkxFRF9LRVkgPSAncGxhdGZvcm1TeW5jRW5hYmxlZCc7XG5cbi8vIFByaW9yaXR5IHRpZXJzIGZvciBidWRnZXQgYWxsb2NhdGlvblxuY29uc3QgUFJJT1JJVFkgPSB7XG4gICAgLy8gVG9tYnN0b25lcyAoZGVsZXRpb24gcmVjb3JkcykgZ2V0IHRoZSBndWFyYW50ZWVkIHRvcCBzbG90OiBhIGRlbGV0aW9uIG11c3RcbiAgICAvLyBuZXZlciBsb3NlIGl0cyBidWRnZXQgcmFjZSB0byBidWxreSB2YXVsdCBjb250ZW50LCBvciB0aGUgZGVsZXRlZCBpdGVtXG4gICAgLy8gcmVzdXJyZWN0cyBvbiB0aGUgbmV4dCBkZXZpY2UgdGhhdCBzdGlsbCBoYXMgYSBzdGFsZSBjb3B5IChpc3N1ZSAjMykuXG4gICAgUDBfVE9NQlNUT05FUzogMCxcbiAgICBQMV9QUk9GSUxFUzogMSxcbiAgICBQMl9TRVRUSU5HUzogMixcbiAgICBQM19BUElLRVlTOiAzLFxuICAgIFA0X1ZBVUxUOiA0LFxufTtcblxuLy8gV2FybmluZyB0aHJlc2hvbGRzIGZvciByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5ICh0b21ic3RvbmVzIGFyZSBrZXB0XG4vLyBmb3JldmVyIHNvIGFuIG9mZmxpbmUgZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBhYm91dCBhIGRlbGV0aW9uIGNhbm5vdFxuLy8gcmVzdXJyZWN0IHRoZSBpdGVtIFx1MjAxNCB0aGUgY291bnQgb25seSBncm93cywgc28gbnVkZ2UgdGhlIHVzZXIgdG8gdHJpbSBpdCkuXG5jb25zdCBUT01CU1RPTkVfV0FSTl9HRU5UTEUgPSA4O1xuY29uc3QgVE9NQlNUT05FX1dBUk5fU1RST05HID0gMTY7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmxldCBwdXNoVGltZXIgPSBudWxsO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENodW5raW5nIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNwbGl0IGEgSlNPTi1zZXJpYWxpc2VkIHZhbHVlIGludG8gPD04S0IgY2h1bmtzLlxuICogUmV0dXJucyBhbiBhcnJheSBvZiB7IGtleSwgdmFsdWUgfSBwYWlycyByZWFkeSBmb3Igc3RvcmFnZS5zeW5jLnNldCgpLlxuICovXG5mdW5jdGlvbiBjaHVua1ZhbHVlKGtleSwganNvblN0cmluZykge1xuICAgIGNvbnN0IGNodW5rcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwganNvblN0cmluZy5sZW5ndGg7IGkgKz0gTUFYX0lURU0gLSAxMDApIHtcbiAgICAgICAgLy8gUmVzZXJ2ZSB+MTAwIGJ5dGVzIGZvciB0aGUga2V5IG92ZXJoZWFkIGluIHRoZSBzdG9yZWQgaXRlbVxuICAgICAgICBjaHVua3MucHVzaChqc29uU3RyaW5nLnNsaWNlKGksIGkgKyBNQVhfSVRFTSAtIDEwMCkpO1xuICAgIH1cbiAgICBpZiAoY2h1bmtzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBGaXRzIGluIGEgc2luZ2xlIGl0ZW0gXHUyMDE0IHN0b3JlIGRpcmVjdGx5XG4gICAgICAgIHJldHVybiBbeyBrZXksIHZhbHVlOiBqc29uU3RyaW5nIH1dO1xuICAgIH1cbiAgICAvLyBNdWx0aXBsZSBjaHVua3NcbiAgICBjb25zdCBlbnRyaWVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBgJHtDSFVOS19QUkVGSVh9JHtrZXl9OiR7aX1gLCB2YWx1ZTogY2h1bmtzW2ldIH0pO1xuICAgIH1cbiAgICAvLyBTdG9yZSBhIG1ldGFkYXRhIGVudHJ5IHNvIHdlIGtub3cgaG93IG1hbnkgY2h1bmtzIHRoZXJlIGFyZVxuICAgIGVudHJpZXMucHVzaCh7IGtleSwgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHsgX19jaHVua2VkOiB0cnVlLCBjb3VudDogY2h1bmtzLmxlbmd0aCB9KSB9KTtcbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLyoqXG4gKiBSZWFzc2VtYmxlIGNodW5rZWQgZGF0YSBmcm9tIGEgc3luYyBkYXRhIG9iamVjdC5cbiAqIFJldHVybnMgdGhlIHBhcnNlZCBKU09OIHZhbHVlLCBvciBudWxsIG9uIGVycm9yLlxuICovXG5mdW5jdGlvbiByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgc3luY0RhdGEpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtZXRhID0gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghbWV0YSB8fCAhbWV0YS5fX2NodW5rZWQpIHtcbiAgICAgICAgICAgIC8vIE5vdCBjaHVua2VkIFx1MjAxNCBwYXJzZSBkaXJlY3RseVxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb21iaW5lZCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1ldGEuY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtLZXkgPSBgJHtDSFVOS19QUkVGSVh9JHtrZXl9OiR7aX1gO1xuICAgICAgICAgICAgaWYgKHN5bmNEYXRhW2NodW5rS2V5XSA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbWJpbmVkICs9IHN5bmNEYXRhW2NodW5rS2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb21iaW5lZCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBWZXJzaW9uIGNvbXBhcmlzb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIGRvdHRlZCB2ZXJzaW9uIHN0cmluZ3MgbnVtZXJpY2FsbHkuXG4gKiBSZXR1cm5zIDEgaWYgYSA+IGIsIC0xIGlmIGEgPCBiLCAwIGlmIGVxdWFsLiBNaXNzaW5nIC8gbm9uLW51bWVyaWNcbiAqIGNvbXBvbmVudHMgYXJlIHRyZWF0ZWQgYXMgMCBzbyAnMS4xMC4wJyBjb3JyZWN0bHkgc29ydHMgYWJvdmUgJzEuOS4wJ1xuICogKGEgcGxhaW4gc3RyaW5nIGNvbXBhcmUgd291bGQgcHV0ICcxLjkuMCcgZmlyc3QpLlxuICovXG5mdW5jdGlvbiBjb21wYXJlU2VtdmVyKGEsIGIpIHtcbiAgICBjb25zdCBwYSA9IFN0cmluZyhhKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IHBiID0gU3RyaW5nKGIpLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgocGEubGVuZ3RoLCBwYi5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgeCA9IHBhcnNlSW50KHBhW2ldLCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlSW50KHBiW2ldLCAxMCkgfHwgMDtcbiAgICAgICAgaWYgKHggPiB5KSByZXR1cm4gMTtcbiAgICAgICAgaWYgKHggPCB5KSByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHN5bmMgcGF5bG9hZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgbG9jYWwgZGF0YSBhbmQgYnVpbGQgYSBwcmlvcml0aXNlZCBsaXN0IG9mIGVudHJpZXMgdG8gc3luYy5cbiAqIFJldHVybnMgeyBlbnRyaWVzOiBbeyBrZXksIGpzb25TdHJpbmcsIHByaW9yaXR5LCBzaXplIH1dLCB0b3RhbFNpemUgfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRTeW5jUGF5bG9hZCgpIHtcbiAgICBjb25zdCBhbGwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCBlbnRyaWVzID0gW107XG5cbiAgICAvLyBUMC01OiBhIHNlY3JldCBpcyBvbmx5IGV2ZXIgZW1pdHRlZCB0byBzdG9yYWdlLnN5bmMgKEdvb2dsZS9pQ2xvdWQpIGlmIGl0XG4gICAgLy8gaXMgYWxyZWFkeSBhbiBlbmNyeXB0ZWQgYmxvYi4gQW55IHZhbHVlIHRoYXQgaXMgTk9UIGNpcGhlcnRleHQgaXMgcmVmdXNlZFxuICAgIC8vIChkcm9wcGVkKSBzbyBwbGFpbnRleHQgcHJpdmF0ZSBrZXlzIC8gQVBJIHNlY3JldHMgLyBub3RlcyBjYW4gbmV2ZXIgbGVhdmVcbiAgICAvLyB0aGUgZGV2aWNlLiBgJydgIChlbXB0eSAvIGJ1bmtlcikgaXMgYWxsb3dlZCB0aHJvdWdoIGFzIG5vbi1zZWNyZXQuXG4gICAgY29uc3Qgc2VjcmV0T2sgPSB2ID0+ICF2IHx8IGlzQ2lwaGVydGV4dCh2KTtcblxuICAgIC8vIFRvbWJzdG9uZXMgKGlzc3VlICMzKS4gQSBkb2Mva2V5IGlzIHN1cHByZXNzZWQgZnJvbSB0aGUgcGF5bG9hZCB3aGVuIGFcbiAgICAvLyB0b21ic3RvbmUgZGF0ZWQgYXQtb3ItYWZ0ZXIgaXRzIHVwZGF0ZWRBdCBleGlzdHMsIHNvIGEgc3RhbGUgbG9jYWwgY29weVxuICAgIC8vIGNhbm5vdCByZS1wdXNoIGEgZGVsZXRlZCBpdGVtIGJhY2sgaW50byB0aGUgbWlycm9yLlxuICAgIGNvbnN0IGRlbGV0ZWREb2NzID0gKGFsbC5kZWxldGVkRG9jcyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZERvY3MgOiB7fTtcbiAgICBjb25zdCBkZWxldGVkS2V5cyA9IChhbGwuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGFsbC5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWRLZXlzIDoge307XG4gICAgY29uc3QgZGVsZXRlZFByb2ZpbGVzID0gKGFsbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGFsbC5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkUHJvZmlsZXMgOiB7fTtcblxuICAgIC8vIEEgcHJvZmlsZSdzIHN0YWJsZSBpZGVudGl0eSBmb3IgdG9tYnN0b25lIC8gcmVjZW5jeSBrZXlpbmc6IGl0cyBwdWJrZXksXG4gICAgLy8gZWxzZSAoZm9yIGEgYnVua2VyKSBpdHMgcmVtb3RlIHB1YmtleS4gTWF0Y2hlcyBtZXJnZUludG9Mb2NhbCdzIGlkZW50aXR5T2YuXG4gICAgY29uc3QgaWRlbnRpdHlPZiA9IChwKSA9PiAocCAmJiAocC5wdWJLZXkgfHwgcC5yZW1vdGVQdWJrZXkpKSB8fCBudWxsO1xuXG4gICAgLy8gUDA6IFRvbWJzdG9uZXMgXHUyMDE0IHRoZSBndWFyYW50ZWVkIHNsb3QgKGVtaXR0ZWQgYmVmb3JlIGFueXRoaW5nIGVsc2UpLlxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkRG9jcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkRG9jcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRLZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkS2V5cyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWRLZXlzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZFByb2ZpbGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkUHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4XG4gICAgaWYgKGFsbC5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBjbGVhblByb2ZpbGVzID0gcmVkYWN0UHJvZmlsZXMoYWxsLnByb2ZpbGVzKVxuICAgICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTdXBwcmVzcyBhIHByb2ZpbGUgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLFxuICAgICAgICAgICAgICAgIC8vIHNvIGEgc3RhbGUgbG9jYWwgY29weSBjYW5ub3QgcmUtcHVzaCBhIGRlbGV0ZWQgaWRlbnRpdHkuXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIHJldHVybiAhKGlkICE9IG51bGwgJiYgZGVsZXRlZFByb2ZpbGVzW2lkXSAhPSBudWxsICYmIGRlbGV0ZWRQcm9maWxlc1tpZF0gPj0gKHAudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAubWFwKHAgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgaG9zdHMsIC4uLnJlc3QgfSA9IHA7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3QucHJpdktleSAmJiAhc2VjcmV0T2socmVzdC5wcml2S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgcHJpdktleSBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXN0LnByaXZLZXkgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNsZWFuUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChhbGwucHJvZmlsZUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5wcm9maWxlSW5kZXgpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlSW5kZXgnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICAvLyBOT1RFOiBgaXNFbmNyeXB0ZWRgICh0aGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgZmxhZykgaXMgZGVsaWJlcmF0ZWx5IE5PVFxuICAgIC8vIHN5bmNlZC4gSXQgaXMgYSBwZXItZGV2aWNlIGZhY3QgXHUyMDE0IGEgZGV2aWNlIGhvbGRzIHRoZSBwYXNzd29yZCB2ZXJpZmllciBvclxuICAgIC8vIGl0IGRvZXMgbm90IFx1MjAxNCBhbmQgbWlycm9yaW5nIGl0IG9uY2UgbGF0Y2hlZCBhIHBhc3N3b3JkbGVzcyBkZXZpY2UgaW50byBhXG4gICAgLy8gZGVhZC1lbmQgbG9jayBzY3JlZW4gaXQgaGFkIG5vIHBhc3N3b3JkIGZvci4gU2VlIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKS5cblxuICAgIC8vIFAyOiBTZXR0aW5nc1xuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGsgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChhbGxba10gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhhbGwpKSB7XG4gICAgICAgIGlmIChrLnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUDM6IEFQSSBrZXkgdmF1bHQgXHUyMDE0IG9ubHkgc3luYyBrZXlzIHdob3NlIHNlY3JldCBpcyBjaXBoZXJ0ZXh0IChUMC01KVxuICAgIGlmIChhbGwuYXBpS2V5VmF1bHQgJiYgYWxsLmFwaUtleVZhdWx0LmtleXMpIHtcbiAgICAgICAgY29uc3Qgc2FmZUtleXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoYWxsLmFwaUtleVZhdWx0LmtleXMpKSB7XG4gICAgICAgICAgICAvLyBTdXBwcmVzcyBhIGtleSBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCkuXG4gICAgICAgICAgICBpZiAoZGVsZXRlZEtleXNbaWRdICE9IG51bGwgJiYgZGVsZXRlZEtleXNbaWRdID49IChrZXkudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VjcmV0T2soa2V5LnNlY3JldCkpIHtcbiAgICAgICAgICAgICAgICBzYWZlS2V5c1tpZF0gPSBrZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBBUEkgc2VjcmV0IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2FmZVZhdWx0ID0geyAuLi5hbGwuYXBpS2V5VmF1bHQsIGtleXM6IHNhZmVLZXlzIH07XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShzYWZlVmF1bHQpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdhcGlLZXlWYXVsdCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QM19BUElLRVlTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQNDogVmF1bHQgZG9jcyAoaW5kaXZpZHVhbGx5LCBuZXdlc3QgZmlyc3QpIFx1MjAxNCBvbmx5IGlmIGNvbnRlbnQgaXMgY2lwaGVydGV4dFxuICAgIGlmIChhbGwudmF1bHREb2NzICYmIHR5cGVvZiBhbGwudmF1bHREb2NzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zdCBkb2NzID0gT2JqZWN0LnZhbHVlcyhhbGwudmF1bHREb2NzKS5zb3J0KChhLCBiKSA9PiAoYi51cGRhdGVkQXQgfHwgMCkgLSAoYS51cGRhdGVkQXQgfHwgMCkpO1xuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2NzKSB7XG4gICAgICAgICAgICAvLyBTdXBwcmVzcyBhIGRvYyBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCkuXG4gICAgICAgICAgICBpZiAoZGVsZXRlZERvY3NbZG9jLnBhdGhdICE9IG51bGwgJiYgZGVsZXRlZERvY3NbZG9jLnBhdGhdID49IChkb2MudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXNlY3JldE9rKGRvYy5jb250ZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCB2YXVsdCBjb250ZW50IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkb2NLZXkgPSBgdmF1bHREb2M6JHtkb2MucGF0aH1gO1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRvYyk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGRvY0tleSwganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlA0X1ZBVUxULCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1c2ggdG8gc3luY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogV3JpdGUgYSBwcmlvcml0aXNlZCwgcHJlLWNodW5rZWQgcGF5bG9hZCB0byBzdG9yYWdlLnN5bmMsIHJldHJ5aW5nIG9uIGFuXG4gKiBvdmVyLXF1b3RhIHJlamVjdGlvbiBieSBkcm9wcGluZyB0aGUgbG93ZXN0LXByaW9yaXR5IHRpZXIgc3RpbGwgcHJlc2VudCBhbmRcbiAqIHRyeWluZyBhZ2Fpbi4gUDAgKHRvbWJzdG9uZXMpIGFuZCBQMSAocHJvZmlsZXMpIGFyZSBORVZFUiBkcm9wcGVkIFx1MjAxNCBhIGZ1bGxcbiAqIGJhdGNoIGZhaWx1cmUgd291bGQgc3RyYW5kIGEgZGVsZXRpb24gb3IgYSBrZXksIHNvIHRoZSBpbXBvcnRhbnQgdGllcnMgc3luY1xuICogZXZlbiB3aGVuIHRoZSBidWxreSBvbmVzIGNhbm5vdC5cbiAqXG4gKiBAcGFyYW0ge3sgcHJpb3JpdHk6IG51bWJlciwgY2h1bmtzOiB7a2V5OnN0cmluZywgdmFsdWU6c3RyaW5nfVtdIH1bXX0gaW5jbHVkZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59IG51bWJlciBvZiBkYXRhIGtleXMgYWN0dWFsbHkgd3JpdHRlblxuICovXG5hc3luYyBmdW5jdGlvbiBzZXRTeW5jUmVzcGVjdGluZ1F1b3RhKGluY2x1ZGVkKSB7XG4gICAgbGV0IHRpZXJzID0gaW5jbHVkZWQuc2xpY2UoKTtcbiAgICAvLyBHdWFyZCBhZ2FpbnN0IGFuIHVuYm91bmRlZCBsb29wOiBhdCBtb3N0IG9uZSByZXRyeSBwZXIgZGlzdGluY3QgcHJpb3JpdHkuXG4gICAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IDsgYXR0ZW1wdCsrKSB7XG4gICAgICAgIGNvbnN0IHN5bmNQYXlsb2FkID0ge307XG4gICAgICAgIGNvbnN0IGFsbFN5bmNLZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aWVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGl0ZW0uY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgc3luY1BheWxvYWRbYy5rZXldID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgICBhbGxTeW5jS2V5cy5wdXNoKGMua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzeW5jUGF5bG9hZFtTWU5DX01FVEFfS0VZXSA9IEpTT04uc3RyaW5naWZ5KHsgbGFzdFdyaXR0ZW5BdDogRGF0ZS5ub3coKSwga2V5czogYWxsU3luY0tleXMgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHN5bmNQYXlsb2FkKTtcblxuICAgICAgICAgICAgLy8gQ2xlYW4gb3JwaGFuZWQgY2h1bmtzOiByZW1vdmUgYW55IGV4aXN0aW5nIHN5bmMga2V5IG5vdCBpbiBvdXIgcGF5bG9hZC5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcnBoYW5LZXlzID0gT2JqZWN0LmtleXMoZXhpc3RpbmcpLmZpbHRlcihrID0+XG4gICAgICAgICAgICAgICAgICAgIGsgIT09IFNZTkNfTUVUQV9LRVkgJiYgIWFsbFN5bmNLZXlzLmluY2x1ZGVzKGspXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAob3JwaGFuS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKG9ycGhhbktleXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIE5vbi1jcml0aWNhbCBjbGVhbnVwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWxsU3luY0tleXMubGVuZ3RoO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBPdmVyIHF1b3RhIChvciBNQVhfSVRFTVMpIFx1MjAxNCBkcm9wIHRoZSBsb3dlc3QtcHJpb3JpdHkgdGllciBzdGlsbFxuICAgICAgICAgICAgLy8gcHJlc2VudCBhbmQgcmV0cnkuIE5ldmVyIGRyb3AgUDAvUDEuXG4gICAgICAgICAgICBjb25zdCBtYXhQcmlvcml0eSA9IHRpZXJzLnJlZHVjZSgobSwgdCkgPT4gTWF0aC5tYXgobSwgdC5wcmlvcml0eSksIC0xKTtcbiAgICAgICAgICAgIGlmIChtYXhQcmlvcml0eSA8PSBQUklPUklUWS5QMV9QUk9GSUxFUykge1xuICAgICAgICAgICAgICAgIHRocm93IGU7IC8vIG5vdGhpbmcgZHJvcHBhYmxlIGxlZnQ7IFAwL1AxIG11c3Qgc3Vydml2ZSBvciBmYWlsIGxvdWRseVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYmVmb3JlID0gdGllcnMubGVuZ3RoO1xuICAgICAgICAgICAgdGllcnMgPSB0aWVycy5maWx0ZXIodCA9PiB0LnByaW9yaXR5IDwgbWF4UHJpb3JpdHkpO1xuICAgICAgICAgICAgaWYgKHRpZXJzLmxlbmd0aCA9PT0gYmVmb3JlKSB0aHJvdyBlOyAvLyBubyBwcm9ncmVzcyBcdTIwMTQgYmFpbFxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU3luY01hbmFnZXJdIHN5bmMuc2V0IG92ZXIgcXVvdGEgXHUyMDE0IGRyb3BwZWQgcHJpb3JpdHkgJHttYXhQcmlvcml0eX0gdGllciwgcmV0cnlpbmdgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1c2hUb1N5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gUHVsbC1tZXJnZSBCRUZPUkUgYnVpbGRpbmc6IG9ycGhhbi1jbGVhbnVwIGJlbG93IHdpcGVzIGFueSBtaXJyb3Iga2V5XG4gICAgICAgIC8vIGFic2VudCBmcm9tIHRoaXMgZGV2aWNlJ3MgcGF5bG9hZCwgc28gd2UgbXVzdCBmaXJzdCBhYnNvcmIgcmVtb3RlXG4gICAgICAgIC8vIHN0YXRlIChlc3BlY2lhbGx5IHJlbW90ZSB0b21ic3RvbmVzLCB3aGljaCB0aGVuIHN1cHByZXNzIHRoZSBtYXRjaGluZ1xuICAgICAgICAvLyBkb2NzL2tleXMgZnJvbSB0aGUgcGF5bG9hZCB3ZSBhcmUgYWJvdXQgdG8gYnVpbGQpLiBXaXRob3V0IHRoaXMgYVxuICAgICAgICAvLyBkZXZpY2UgdGhhdCBuZXZlciBsZWFybmVkIG9mIGEgZGVsZXRpb24gd291bGQgcmUtcHVzaCB0aGUgaXRlbS5cbiAgICAgICAgY29uc3QgcmVtb3RlID0gYXdhaXQgcHVsbEZyb21TeW5jKCk7XG4gICAgICAgIGlmIChyZW1vdGUpIGF3YWl0IG1lcmdlSW50b0xvY2FsKHJlbW90ZSk7XG5cbiAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGJ1aWxkU3luY1BheWxvYWQoKTtcblxuICAgICAgICAvLyBTb3J0IGJ5IHByaW9yaXR5IChhc2NlbmRpbmcgPSBtb3N0IGltcG9ydGFudCBmaXJzdClcbiAgICAgICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eSk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIGluY2x1ZGVkIHNldCByZXNwZWN0aW5nIHRoZSBpbi1jb2RlIGJ5dGUvaXRlbSBidWRnZXQuXG4gICAgICAgIGxldCB1c2VkQnl0ZXMgPSAwO1xuICAgICAgICBsZXQgdXNlZEl0ZW1zID0gMDtcbiAgICAgICAgY29uc3QgaW5jbHVkZWQgPSBbXTtcbiAgICAgICAgbGV0IGJ1ZGdldEV4aGF1c3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKGJ1ZGdldEV4aGF1c3RlZCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVmFsdWUoZW50cnkua2V5LCBlbnRyeS5qc29uU3RyaW5nKTtcbiAgICAgICAgICAgIGxldCBlbnRyeVNpemUgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgIGVudHJ5U2l6ZSArPSBjLmtleS5sZW5ndGggKyAodHlwZW9mIGMudmFsdWUgPT09ICdzdHJpbmcnID8gYy52YWx1ZS5sZW5ndGggOiBKU09OLnN0cmluZ2lmeShjLnZhbHVlKS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodXNlZEJ5dGVzICsgZW50cnlTaXplID4gU1lOQ19RVU9UQSAtIDUwMCB8fCB1c2VkSXRlbXMgKyBjaHVua3MubGVuZ3RoID4gTUFYX0lURU1TIC0gNSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5wcmlvcml0eSA8PSBQUklPUklUWS5QM19BUElLRVlTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyaXRpY2FsIGRhdGEgKGluY2wuIFAwIHRvbWJzdG9uZXMpIFx1MjAxNCBpbmNsdWRlIGFueXdheTsgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHJ1bnRpbWUgcXVvdGEgZmFsbGJhY2sgd2lsbCBzaGVkIGJ1bGt5IHRpZXJzIGlmIHRoZSBBUEkgcmVqZWN0cy5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gQnVkZ2V0IGV4aGF1c3RlZCBhdCBwcmlvcml0eSAke2VudHJ5LnByaW9yaXR5fSwgc2tpcHBpbmcgcmVtYWluaW5nIGVudHJpZXNgKTtcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0RXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmNsdWRlZC5wdXNoKHsgcHJpb3JpdHk6IGVudHJ5LnByaW9yaXR5LCBjaHVua3MgfSk7XG4gICAgICAgICAgICB1c2VkQnl0ZXMgKz0gZW50cnlTaXplO1xuICAgICAgICAgICAgdXNlZEl0ZW1zICs9IGNodW5rcy5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cml0dGVuID0gYXdhaXQgc2V0U3luY1Jlc3BlY3RpbmdRdW90YShpbmNsdWRlZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU3luY01hbmFnZXJdIFB1c2hlZCAke3dyaXR0ZW59IGVudHJpZXMgKCR7dXNlZEJ5dGVzfSBieXRlcykgdG8gc3luYyBzdG9yYWdlYCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1c2hUb1N5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIC8vIExvY2FsIHN0b3JhZ2UgaXMgdW5hZmZlY3RlZCBcdTIwMTQgZ3JhY2VmdWwgZGVncmFkYXRpb25cbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVsbCBmcm9tIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGRhdGEgZnJvbSBzeW5jIHN0b3JhZ2UgYW5kIHJldHVybiBhcyBhIHBsYWluIG9iamVjdCB3aXRoXG4gKiByZWFzc2VtYmxlZCBjaHVua2VkIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgIGlmICghcmF3IHx8IE9iamVjdC5rZXlzKHJhdykubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXRhU3RyID0gcmF3W1NZTkNfTUVUQV9LRVldO1xuICAgICAgICBpZiAoIW1ldGFTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBtZXRhO1xuICAgICAgICB0cnkgeyBtZXRhID0gSlNPTi5wYXJzZShtZXRhU3RyKTsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIG5vbi1jaHVuaywgbm9uLW1ldGEga2V5c1xuICAgICAgICBjb25zdCBkYXRhS2V5cyA9IG1ldGEua2V5cy5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKENIVU5LX1BSRUZJWCkgJiYgayAhPT0gU1lOQ19NRVRBX0tFWSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHJhdyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQuX3N5bmNNZXRhID0gbWV0YTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVsbEZyb21TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWVyZ2UgbG9naWNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBUaGUgYmFja2dyb3VuZCdzIG93biB3YXkgdG8gaGVhciBvZiBtb3ZlZCBwcm9maWxlcy4gQSB3b3JrZXIgY2Fubm90IG1lc3NhZ2Vcbi8vIGl0c2VsZiwgc28gYSBtZXJnZSBydW5uaW5nIHRoZXJlIGNhbGxzIHRoaXM7IGEgcGFnZSBzZW5kcyBhIG1lc3NhZ2UuXG5sZXQgcHJvZmlsZU1vdmVIYW5kbGVyID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb2ZpbGVNb3ZlSGFuZGxlcihoYW5kbGVyKSB7XG4gICAgcHJvZmlsZU1vdmVIYW5kbGVyID0gaGFuZGxlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYW5ub3VuY2VQcm9maWxlTW92ZXMobW92ZXMpIHtcbiAgICBpZiAocHJvZmlsZU1vdmVIYW5kbGVyKSB7XG4gICAgICAgIHByb2ZpbGVNb3ZlSGFuZGxlcihtb3Zlcyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncHJvZmlsZXNNb3ZlZCcsIHBheWxvYWQ6IG1vdmVzIH0pO1xuICAgIH0gY2F0Y2ggeyAvKiBiYWNrZ3JvdW5kIHVuYXZhaWxhYmxlOiB3aGF0IGlzIGtleWVkIGJ5IGluZGV4IGNoZWNrcyBpdHMgaWRlbnRpdHkgKi8gfVxufVxuXG4vKipcbiAqIFdoZXJlIGVhY2ggcHJvZmlsZSB3ZW50LiBBbiB1bnRvdWNoZWQgcmVjb3JkIGlzIGZvdW5kIGFzIGl0c2VsZiwgYW5kIG9uZSBzeW5jXG4gKiByZXBsYWNlZCBpcyBmb3VuZCBieSBpZGVudGl0eS4gRWFjaCBwbGFjZSBpcyBjbGFpbWVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtvYmplY3RbXX0gYmVmb3JlXG4gKiBAcGFyYW0ge29iamVjdFtdfSBhZnRlclxuICogQHBhcmFtIHsocHJvZmlsZTogb2JqZWN0KSA9PiA/c3RyaW5nfSBpZGVudGl0eU9mXG4gKiBAcmV0dXJucyB7QXJyYXk8W251bWJlciwgP251bWJlcl0+fSBbb2xkIGluZGV4LCBuZXcgaW5kZXggb3IgbnVsbCBpZiBnb25lXSwgY2hhbmdlcyBvbmx5XG4gKi9cbmZ1bmN0aW9uIHByb2ZpbGVNb3ZlcyhiZWZvcmUsIGFmdGVyLCBpZGVudGl0eU9mKSB7XG4gICAgY29uc3QgcGxhY2VzID0gYmVmb3JlLm1hcChwcm9maWxlID0+IGFmdGVyLmluZGV4T2YocHJvZmlsZSkpO1xuICAgIGNvbnN0IGNsYWltZWQgPSBuZXcgU2V0KHBsYWNlcyk7XG4gICAgYmVmb3JlLmZvckVhY2goKHByb2ZpbGUsIGkpID0+IHtcbiAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHByb2ZpbGUpO1xuICAgICAgICBpZiAocGxhY2VzW2ldID49IDAgfHwgIWlkKSByZXR1cm47XG4gICAgICAgIHBsYWNlc1tpXSA9IGFmdGVyLmZpbmRJbmRleCgob3RoZXIsIGopID0+ICFjbGFpbWVkLmhhcyhqKSAmJiBpZGVudGl0eU9mKG90aGVyKSA9PT0gaWQpO1xuICAgICAgICBjbGFpbWVkLmFkZChwbGFjZXNbaV0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwbGFjZXMuZmxhdE1hcCgocGxhY2UsIGkpID0+IChwbGFjZSA9PT0gaSA/IFtdIDogW1tpLCBwbGFjZSA8IDAgPyBudWxsIDogcGxhY2VdXSkpO1xufVxuXG4vKipcbiAqIE1lcmdlIHN5bmMgZGF0YSBpbnRvIGxvY2FsIHN0b3JhZ2Ugd2l0aCBjb25mbGljdCByZXNvbHV0aW9uLlxuICpcbiAqIENPTkRJVElPTiAzIChpc3N1ZSAjMyBsb29wIGludmFyaWFudCk6IGV2ZXJ5IHdyaXRlIGhlcmUgZ29lcyB0aHJvdWdoIHRoZSByYXdcbiAqIG1vZHVsZS1sZXZlbCBgc3RvcmFnZWAgKD0gYXBpLnN0b3JhZ2UubG9jYWwpIHZpYSBhIHNpbmdsZSBgc3RvcmFnZS5zZXRgLiBJdFxuICogTVVTVCBOT1QgY2FsbCB0aGUgc3RvcmUtbGF5ZXIgaGVscGVycyAoZGVsZXRlRG9jdW1lbnRMb2NhbCAvIHNhdmVEb2N1bWVudExvY2FsXG4gKiAvIGRlbGV0ZUFwaUtleSAvIHNhdmVBcGlLZXkpLCBiZWNhdXNlIHRob3NlIGNhbGwgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjAxNCBhIG1lcmdlXG4gKiB0aGF0IHNjaGVkdWxlZCBhIHB1c2ggd291bGQgdHVybiBldmVyeSBpbmNvbWluZyBzeW5jIGludG8gYW4gb3V0Z29pbmcgb25lIGFuZFxuICogbG9vcC4gQSByZWdyZXNzaW9uIHRlc3QgYXNzZXJ0cyBtZXJnZUludG9Mb2NhbCBuZXZlciBzY2hlZHVsZXMgYSBwdXNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpIHtcbiAgICBpZiAoIXN5bmNEYXRhKSByZXR1cm47XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIHN5bmNEYXRhID0geyAuLi5zeW5jRGF0YSwgcHJvZmlsZXM6IHJlZGFjdFByb2ZpbGVzKHN5bmNEYXRhLnByb2ZpbGVzKSB9O1xuICAgIH1cblxuICAgIC8vIFRoZSByZWFkIGFuZCB0aGUgd3JpdGUgcnVuIHVuZGVyIHRoZSBwcm9maWxlcyBsb2NrLCBzbyBhIHByb2ZpbGVzIGNoYW5nZVxuICAgIC8vIG1hZGUgbWVhbndoaWxlIChhIHJldm9rZSwgYSByZWxheSBlZGl0KSBpcyBuZXZlciB3cml0dGVuIG92ZXIuXG4gICAgY29uc3QgbW92ZXMgPSBhd2FpdCB3aXRoUHJvZmlsZXNMb2NrKCgpID0+IG1lcmdlSW50b0xvY2FsTG9ja2VkKHN5bmNEYXRhKSk7XG4gICAgaWYgKG1vdmVzLmxlbmd0aCA+IDApIGF3YWl0IGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbWVyZ2VJbnRvTG9jYWxMb2NrZWQoc3luY0RhdGEpIHtcbiAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZWN0IGZyZXNoIGluc3RhbGw6IG5vIHByb2ZpbGVzLCBvciBhIHNpbmdsZSB1bnRvdWNoZWQgZGVmYXVsdCBwcm9maWxlLlxuICAgIC8vIChEZWZhdWx0IGtleXMgYXJlIG5vdyB3cmFwcGVkIGF0IHJlc3QsIHNvIGBwcml2S2V5YCBpcyB0cnV0aHkgZXZlbiBvbiBhXG4gICAgLy8gZnJlc2ggaW5zdGFsbCBcdTIwMTQgZGV0ZWN0IHRoZSB1bnRvdWNoZWQgZGVmYXVsdCBieSBpdHMgbmFtZSArIGFic2VuY2Ugb2YgYW55XG4gICAgLy8gcGVyLXNpdGUgZ3JhbnRzIGluc3RlYWQuKVxuICAgIC8vXG4gICAgLy8gQzE6IGEgbG9uZSBwcm9maWxlIGlzIG9ubHkgXCJ1bnRvdWNoZWQvZnJlc2hcIiB3aGVuIGl0IGNhcnJpZXMgbm8gaWRlbnRpdHkuXG4gICAgLy8gQSBsb25lIEJVTktFUiBwcm9maWxlIGhhcyBwcml2S2V5OicnIGJ1dCBJUyBhIHJlYWwgaWRlbnRpdHkgKHR5cGUvYnVua2VyVXJsXG4gICAgLy8gL3JlbW90ZVB1YmtleSksIGFuZCBtdXN0IG5vdCBiZSB0cmVhdGVkIGFzIGZyZXNoIGFuZCB3aXBlZCBieSBhIHN5bmMgcHVsbC5cbiAgICBjb25zdCBoYXNJZGVudGl0eSA9IChwKSA9PiAhIShwICYmIChcbiAgICAgICAgcC5wcml2S2V5IHx8IHAucHViS2V5IHx8IHAudHlwZSA9PT0gJ2J1bmtlcicgfHwgcC5idW5rZXJVcmwgfHwgcC5yZW1vdGVQdWJrZXlcbiAgICApKTtcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkgJiYgIWhhc0lkZW50aXR5KGxvbmUpKSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gU3RhYmxlIGlkZW50aXR5IGZvciBwcm9maWxlIG1hdGNoaW5nIC8gdG9tYnN0b25lczogcHViS2V5LCBlbHNlIHRoZVxuICAgIC8vIGJ1bmtlcidzIHJlbW90ZVB1YmtleS4gTWF0Y2hlcyBidWlsZFN5bmNQYXlsb2FkJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBBQ1RJVkUgaWRlbnRpdHkgQkVGT1JFIGFueSByZW9yZGVyaW5nL3JlbW92YWwgc28gdGhlIGFjdGl2ZVxuICAgIC8vIGluZGV4IGNhbiBmb2xsb3cgdGhhdCBpZGVudGl0eSB0aHJvdWdoIHRoZSBtZXJnZSAoYSBrZXkgbWFuYWdlciBtdXN0IG5vdFxuICAgIC8vIHNpbGVudGx5IHN3aXRjaCB3aGljaCBpZGVudGl0eSBpcyBhY3RpdmUganVzdCBiZWNhdXNlIGEgcHJvZmlsZSBvcmRlcmVkXG4gICAgLy8gYmVmb3JlIGl0IHdhcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlKS5cbiAgICBjb25zdCBsb2NhbEFjdGl2ZUluZGV4ID0gKGxvY2FsLnByb2ZpbGVJbmRleCAhPSBudWxsKSA/IGxvY2FsLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgY29uc3QgYWN0aXZlSWQgPSAobG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgID8gaWRlbnRpdHlPZihsb2NhbC5wcm9maWxlc1tsb2NhbEFjdGl2ZUluZGV4XSlcbiAgICAgICAgOiBudWxsO1xuXG4gICAgLy8gLS0tIFByb2ZpbGUgdG9tYnN0b25lcyAoaXNzdWUgIzMpIFx1MjAxNCB1bmlvbiBsb2NhbCArIHJlbW90ZSwgbWF4IHBlciBpZGVudGl0eSAtLS1cbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSB7IC4uLihsb2NhbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkUHJvZmlsZXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRQcm9maWxlc1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRQcm9maWxlc1tpZF0pIGRlbGV0ZWRQcm9maWxlc1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlcyAoUDEpIFx1MjAxNCBwdWJrZXkta2V5ZWQgbWVyZ2UgKyB0b21ic3RvbmUgcmVtb3ZhbCAtLS1cbiAgICAvLyBNYXRjaCBieSBzdGFibGUgaWRlbnRpdHkgcmF0aGVyIHRoYW4gYXJyYXkgaW5kZXgsIHNvIGEgcmVvcmRlcmVkIG9yIHBhcnRpYWxcbiAgICAvLyBzeW5jIHBheWxvYWQgY2Fubm90IG92ZXJ3cml0ZSBvbmUgaWRlbnRpdHkncyBrZXkgbWF0ZXJpYWwgd2l0aCBhbm90aGVyJ3MuXG4gICAgbGV0IG1lcmdlZFByb2ZpbGVzID0gbG9jYWwucHJvZmlsZXMgPyBbLi4ubG9jYWwucHJvZmlsZXNdIDogbnVsbDtcbiAgICBsZXQgcHJvZmlsZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IHN5bmNEYXRhLnByb2ZpbGVzLnNsaWNlKCk7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleEJ5SWRlbnRpdHkgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiAhaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN5bmNQcm9maWxlIG9mIHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IGluZGV4QnlJZGVudGl0eS5nZXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFByb2ZpbGUgPSBtZXJnZWRQcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgYWRvcHQgaXQgYnV0IHByZXNlcnZlIGxvY2FsIHBlci1zaXRlIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlc1tpXSA9IHsgLi4uc3luY1Byb2ZpbGUsIGhvc3RzOiBsb2NhbFByb2ZpbGUuaG9zdHMgfHwge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZ2VudWluZWx5IG5ldyBpZGVudGl0eSBub3QgcHJlc2VudCBsb2NhbGx5IFx1MjAxNCBhcHBlbmQgaXQuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzLnB1c2goc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIGtleWxlc3MgcmVtb3RlIHByb2ZpbGUgY2Fubm90IGJlIHJlY29uY2lsZWQgdG8gYSBsb2NhbCBvbmVcbiAgICAgICAgICAgICAgICAvLyBzYWZlbHkgKG5vIGlkZW50aXR5IHRvIG1hdGNoIG9uKSwgc28gaXQgaXMgc2tpcHBlZC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGx5IHByb2ZpbGUgdG9tYnN0b25lczogcmVtb3ZlIGFueSBtZXJnZWQgcHJvZmlsZSB3aG9zZSBpZGVudGl0eSBoYXNcbiAgICAvLyAodXBkYXRlZEF0IDw9IGRlbGV0ZWRBdCkgXHUyMDE0IGRlbGV0aW9uIHdpbnMgdGllcywgY29uc2lzdGVudCB3aXRoIGRvY3Mva2V5cy5cbiAgICAvLyBBIHJlY3JlYXRlZCBwcm9maWxlICh1cGRhdGVkQXQgPiBkZWxldGVkQXQpIHN1cnZpdmVzLiBOZXZlciBwcnVuZSB0b21ic3RvbmVzLlxuICAgIGlmIChtZXJnZWRQcm9maWxlcyAmJiBPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qga2VwdCA9IG1lcmdlZFByb2ZpbGVzLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gaWQgIT0gbnVsbCA/IGRlbGV0ZWRQcm9maWxlc1tpZF0gOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuICEodHMgIT0gbnVsbCAmJiAocC51cGRhdGVkQXQgfHwgMCkgPD0gdHMpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2FmZXR5OiBuZXZlciBsZXQgYSBzeW5jIG1lcmdlIGxlYXZlIFpFUk8gcHJvZmlsZXMgKHRoYXQgd291bGQgb3JwaGFuXG4gICAgICAgIC8vIHRoZSBhY3RpdmUgaW5kZXggYW5kIGJyaWNrIHRoZSBVSSkuIElmIHJlbW92YWwgd291bGQgZW1wdHkgdGhlIGxpc3QsXG4gICAgICAgIC8vIGtlZXAgdGhlIHByb2ZpbGVzIGFzLWlzIFx1MjAxNCB0aGUgbG9jYWwgdXNlciBjYW4gc3RpbGwgZGVsZXRlIGRlbGliZXJhdGVseS5cbiAgICAgICAgLy8gRGVsaWJlcmF0ZSB0cmFkZS1vZmY6IGNyb3NzLWRldmljZSBkZWxldGlvbiBkb2VzIE5PVCBjb252ZXJnZSBvbiBhXG4gICAgICAgIC8vIGRldmljZSB3aGVyZSBhcHBseWluZyBpdCB3b3VsZCBsZWF2ZSB6ZXJvIHByb2ZpbGVzOyB0aGUgcHJvZmlsZSBzdGF5c1xuICAgICAgICAvLyB0b21ic3RvbmUtc3VwcHJlc3NlZCBvbiBlbWl0LCBzbyBpdCBkb2VzIG5vdCByZS1wcm9wYWdhdGUgdG8gb3RoZXJzLlxuICAgICAgICBpZiAoa2VwdC5sZW5ndGggIT09IG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAmJiBrZXB0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzID0ga2VwdDtcbiAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbW92ZXMgPSBbXTtcbiAgICBpZiAocHJvZmlsZXNDaGFuZ2VkICYmIG1lcmdlZFByb2ZpbGVzKSB7XG4gICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBtZXJnZWRQcm9maWxlcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdmVzID0gcHJvZmlsZU1vdmVzKGxvY2FsLnByb2ZpbGVzIHx8IFtdLCBtZXJnZWRQcm9maWxlcywgaWRlbnRpdHlPZik7XG4gICAgICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwICYmIGxvY2FsLmJ1bmtlclNlc3Npb25zKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmJ1bmtlclNlc3Npb25zID0gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGxvY2FsLmJ1bmtlclNlc3Npb25zLCBtb3Zlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIFx1MjAxNCBGT0xMT1cgVEhFIEFDVElWRSBJREVOVElUWSBhY3Jvc3MgdGhlIG1lcmdlIC0tLVxuICAgIC8vIFRoZSBhY3RpdmUgaW5kZXggdHJhY2tzIHRoZSBhY3RpdmUgaWRlbnRpdHksIG5vdCBhIHJhdyBzbG90OiBpZiBhIHByb2ZpbGVcbiAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgYWN0aXZlIG9uZSBpcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlLCB0aGUgaW5kZXhcbiAgICAvLyBzaGlmdHMgc28gdGhlIFNBTUUgaWRlbnRpdHkgc3RheXMgYWN0aXZlLiBUaGUgaW5kZXggb25seSBtb3ZlcyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGlkZW50aXR5IHdoZW4gdGhlIGFjdGl2ZSBvbmUgaXMgaXRzZWxmIGdvbmUgKHRvbWJzdG9uZWQpLCBvciBvbiBhXG4gICAgLy8gZnJlc2ggYWRvcHQgXHUyMDE0IHRoZW4gaXQgZmFsbHMgYmFjayB0byB0aGUgc2FmZSBjbGFtcC5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgZGVzaXJlZEluZGV4O1xuICAgICAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMgJiYgaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggYWRvcHQgXHUyMDE0IHRha2Ugc3luYydzIGFjdGl2ZSBpbmRleCwgY2xhbXBlZCBpbnRvIHJhbmdlLlxuICAgICAgICAgICAgY29uc3QgYmFzZSA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsID8gc3luY0RhdGEucHJvZmlsZUluZGV4IDogMDtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGJhc2UsIDApLCBtZXJnZWRQcm9maWxlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd2VkID0gYWN0aXZlSWQgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gbWVyZ2VkUHJvZmlsZXMuZmluZEluZGV4KHAgPT4gaWRlbnRpdHlPZihwKSA9PT0gYWN0aXZlSWQpXG4gICAgICAgICAgICAgICAgOiAtMTtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IGZvbGxvd2VkID49IDBcbiAgICAgICAgICAgICAgICA/IGZvbGxvd2VkXG4gICAgICAgICAgICAgICAgOiBNYXRoLm1pbihNYXRoLm1heChsb2NhbEFjdGl2ZUluZGV4LCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlc2lyZWRJbmRleCAhPT0gbG9jYWwucHJvZmlsZUluZGV4KSB7XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IGRlc2lyZWRJbmRleDtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSAtLS1cbiAgICAvLyBBMjogYGlzRW5jcnlwdGVkYCBpcyBOT1QgbWVyZ2VkLiBUaGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgaXMgYSBwZXItZGV2aWNlXG4gICAgLy8gZmFjdCBwcm92ZW4gYnkgdGhlIGxvY2FsIHZlcmlmaWVyOyBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzXG4gICAgLy8gZGV2aWNlIGludG8gYSBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gLS0tIFNldHRpbmdzIChQMikgXHUyMDE0IGxhc3Qtd3JpdGUtd2lucyAtLS1cbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChzeW5jRGF0YVtrZXldICE9IG51bGwgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgLy8gRm9yIHZlcnNpb24sIG9ubHkgYWNjZXB0IGEgbnVtZXJpY2FsbHktaGlnaGVyIG9uZSAoJzEuMTAuMCcgPiAnMS45LjAnKS5cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIGNvbXBhcmVTZW12ZXIoc3luY0RhdGEudmVyc2lvbiwgbG9jYWwudmVyc2lvbikgPD0gMCkgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBkZWxldGVkQXQgcGVyIGtleSAtLS1cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkRG9jcyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkRG9jcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1twYXRoXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZERvY3NbcGF0aF0pIGRlbGV0ZWREb2NzW3BhdGhdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSB7IC4uLihsb2NhbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZEtleXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRLZXlzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZEtleXNbaWRdKSBkZWxldGVkS2V5c1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgLy8gQnVpbGQgdGhlIG1lcmdlZCBrZXkgc2V0LCBmb2xkIGluIGFueSByZW1vdGUga2V5cywgdGhlbiBhcHBseSBrZXlcbiAgICAvLyB0b21ic3RvbmVzLiBSdW5zIGV2ZW4gd2hlbiB0aGUgcHVsbCBjYXJyaWVzIE5PIGFwaUtleVZhdWx0LCBzbyBhXG4gICAgLy8gZGVsZXRlLW9ubHkgcHVsbCBjYW4gc3RpbGwgcmVtb3ZlIGEgbG9jYWxseS1oZWxkIGtleS5cbiAgICB7XG4gICAgICAgIGxldCBiYXNlVmF1bHQgPSBsb2NhbC5hcGlLZXlWYXVsdCB8fCBudWxsO1xuICAgICAgICBsZXQgbG9jYWxLZXlzID0gKGxvY2FsLmFwaUtleVZhdWx0ICYmIGxvY2FsLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9O1xuICAgICAgICBsZXQgYXBpQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSAmJiBzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICAgICAgYmFzZVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBsb2NhbEtleXMgPSB7fTtcbiAgICAgICAgICAgIGFwaUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNoYXJlZCBtZXJnZSAoc3luYy1tZXJnZS5qcyk6IG5ld2VyIHJlbW90ZSB3aW5zLCBkZWxldGlvbiB3aW5zIHRpZXNcbiAgICAgICAgLy8gKGA8PWApLCB0b21ic3RvbmVzIGFyZSBORVZFUiBwcnVuZWQgaGVyZS4gVG9tYnN0b25lcyBhcmUgY2xlYXJlZCBvbmx5XG4gICAgICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5IHRoZSB1c2VyLlxuICAgICAgICBjb25zdCBrZXlNZXJnZSA9IG1lcmdlUmVtb3RlKGxvY2FsS2V5cywgKHN5bmNEYXRhLmFwaUtleVZhdWx0ICYmIHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9LCBkZWxldGVkS2V5cyk7XG4gICAgICAgIGNvbnN0IG1lcmdlZEtleXMgPSBrZXlNZXJnZS5tZXJnZWQ7XG4gICAgICAgIGlmIChrZXlNZXJnZS5jaGFuZ2VkKSBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGFwaUNoYW5nZWQgJiYgYmFzZVZhdWx0KSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0geyAuLi5iYXNlVmF1bHQsIGtleXM6IG1lcmdlZEtleXMgfTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCByZW1vdGVEb2NzID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgcmVtb3RlRG9jc1tkb2MucGF0aF0gPSBkb2M7XG4gICAgfVxuICAgIC8vIFNoYXJlZCBtZXJnZTogZGVsZXRpb24gd2lucyB0aWVzLCB0b21ic3RvbmVzIGFyZSBORVZFUiBwcnVuZWQgaGVyZS5cbiAgICBjb25zdCB7IG1lcmdlZDogbWVyZ2VkRG9jcywgY2hhbmdlZDogZG9jc0NoYW5nZWQgfSA9IG1lcmdlUmVtb3RlKGxvY2FsLnZhdWx0RG9jcyB8fCB7fSwgcmVtb3RlRG9jcywgZGVsZXRlZERvY3MpO1xuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFBlcnNpc3QgdGhlIHRvbWJzdG9uZSBzZXRzLiBUaGVzZSBhcmUgYSBQVVJFIFVOSU9OIChtYXggZGVsZXRlZEF0IHBlclxuICAgIC8vIGtleSkgXHUyMDE0IHRoZSBtZXJnZSBuZXZlciByZW1vdmVzIGEgdG9tYnN0b25lLCBzbyB0aGV5IGFyZSByZXRhaW5lZCBmb3JldmVyXG4gICAgLy8gYW5kIGFuIG9mZmxpbmUgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgYSBkZWxldGlvbi4gVGhleSBhcmUgY2xlYXJlZCBvbmx5XG4gICAgLy8gYXQgdGhlIHNvdXJjZSAoc2F2ZURvY3VtZW50TG9jYWwvc2F2ZUFwaUtleSBvbiBzYW1lLWRldmljZSByZWNyZWF0ZSkgb3IgYnlcbiAgICAvLyB0aGUgdXNlciB2aWEgY2xlYXJEZWxldGlvbkhpc3RvcnkuXG4gICAgLy9cbiAgICAvLyBSZXNpZHVhbCAoYWNjZXB0ZWQsIGRvY3VtZW50ZWQpOiBwdXJlIGNyb3NzLWRldmljZSBjbG9jayBza2V3IFx1MjAxNCBhIGxpdmVcbiAgICAvLyBjb3B5IHdob3NlIHVwZGF0ZWRBdCBpcyBnZW51aW5lbHkgTkVXRVIgdGhhbiB0aGUgZGVsZXRlJ3MgdGltZXN0YW1wIFx1MjAxNCB3aW5zXG4gICAgLy8gdW5kZXIgdGhlIGA8PWAgcnVsZSBhbmQgaXMga2VwdC4gVGhhdCBpcyBhbiBpbmhlcmVudCBsYXN0LXdyaXRlLXdpbnMgbGltaXRcbiAgICAvLyB0aGF0IHRvbWJzdG9uZXMgZG8gbm90IHJlc29sdmU7IFwiZml4aW5nXCIgaXQgYnkgcHJ1bmluZyB3b3VsZCByZWludHJvZHVjZVxuICAgIC8vIHRoZSBzYW1lLXNlY29uZCByZXN1cnJlY3Rpb24gYnVnLCBzbyBpdCBpcyBsZWZ0IGFzLWlzLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkRG9jcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWREb2NzIHx8IHt9KSkge1xuICAgICAgICB1cGRhdGVzLmRlbGV0ZWREb2NzID0gZGVsZXRlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkS2V5cyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkS2V5cyA9IGRlbGV0ZWRLZXlzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRQcm9maWxlcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWRQcm9maWxlcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkUHJvZmlsZXMgPSBkZWxldGVkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIC8vIFJhdyBsb2NhbCB3cml0ZSBPTkxZIFx1MjAxNCBuZXZlciBzY2hlZHVsZVN5bmNQdXNoIChsb29wIGludmFyaWFudCkuXG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbiAgICByZXR1cm4gbW92ZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVib3VuY2VkIHB1c2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNjaGVkdWxlIGEgc3luYyBwdXNoIHdpdGggYSAyLXNlY29uZCBkZWJvdW5jZS5cbiAqIEV4cG9ydGVkIGZvciB1c2UgYnkgc3RvcmVzIGFuZCB0aGUgc3RvcmFnZSBpbnRlcmNlcHRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlU3luY1B1c2goKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgaWYgKHB1c2hUaW1lcikgY2xlYXJUaW1lb3V0KHB1c2hUaW1lcik7XG4gICAgcHVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1c2hUaW1lciA9IG51bGw7XG4gICAgICAgIHB1c2hUb1N5bmMoKTtcbiAgICB9LCAyMDAwKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWxldGlvbi1oaXN0b3J5ICh0b21ic3RvbmUpIHJldGVudGlvbiBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUb3RhbCBudW1iZXIgb2YgcmV0YWluZWQgZGVsZXRpb24gcmVjb3JkcyAoZG9jcyArIGtleXMpLiBHcm93cyBvdmVyIHRoZSBsaWZlXG4gKiBvZiB0aGUgaW5zdGFsbCBiZWNhdXNlIHRvbWJzdG9uZXMgYXJlIGtlcHQgZm9yZXZlciAoYW4gb2ZmbGluZSBkZXZpY2UgdGhhdFxuICogbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIG11c3Qgbm90IGJlIGFibGUgdG8gcmVzdXJyZWN0IHRoZSBpdGVtKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRvbWJzdG9uZUNvdW50KCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGRlbGV0ZWREb2NzOiB7fSwgZGVsZXRlZEtleXM6IHt9LCBkZWxldGVkUHJvZmlsZXM6IHt9IH0pO1xuICAgIGNvbnN0IGRvY3MgPSBkYXRhLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZERvY3MgOiB7fTtcbiAgICBjb25zdCBrZXlzID0gZGF0YS5kZWxldGVkS2V5cyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRLZXlzIDoge307XG4gICAgY29uc3QgcHJvZmlsZXMgPSBkYXRhLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkUHJvZmlsZXMgOiB7fTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZG9jcykubGVuZ3RoICsgT2JqZWN0LmtleXMoa2V5cykubGVuZ3RoICsgT2JqZWN0LmtleXMocHJvZmlsZXMpLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBXYXJuaW5nIGxldmVsIGZvciBhIGdpdmVuIHJldGFpbmVkLWRlbGV0aW9uIGNvdW50OlxuICogICAwID0gZmluZSwgMSA9IGdlbnRsZSBudWRnZSAoPj0gOCksIDIgPSBzdHJvbmdlciB3YXJuaW5nICg+PSAxNikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b21ic3RvbmVXYXJuaW5nTGV2ZWwoY291bnQpIHtcbiAgICBpZiAoY291bnQgPj0gVE9NQlNUT05FX1dBUk5fU1RST05HKSByZXR1cm4gMjtcbiAgICBpZiAoY291bnQgPj0gVE9NQlNUT05FX1dBUk5fR0VOVExFKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBDbGVhciBhbGwgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeS4gSW5mb3JtZWQtdXNlciBjaG9pY2U6IGEgZGV2aWNlIHRoYXQgaGFzXG4gKiBiZWVuIG9mZmxpbmUgc2luY2UgYmVmb3JlIG9uZSBvZiB0aGVzZSBkZWxldGlvbnMgY2FuLCBvbiBpdHMgbmV4dCBzeW5jLFxuICogcmUtYWRkIHRoZSBpdGVtIFx1MjAxNCBiZWNhdXNlIHRoZSByZWNvcmQgdGhhdCB0b2xkIGV2ZXJ5b25lIGl0IHdhcyBkZWxldGVkIGlzXG4gKiBub3cgZ29uZS4gU2NoZWR1bGVzIGEgcHVzaCBzbyB0aGUgY2xlYXJlZCBzdGF0ZSBwcm9wYWdhdGVzIHRvIHRoZSBtaXJyb3IuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRlbGV0aW9uSGlzdG9yeSgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGRlbGV0ZWREb2NzOiB7fSwgZGVsZXRlZEtleXM6IHt9LCBkZWxldGVkUHJvZmlsZXM6IHt9IH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmNyeXB0aW9uLWZsYWcgc2VsZi1oZWFsIChBMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENsZWFyIGEgYm9ndXMgYGlzRW5jcnlwdGVkPXRydWVgIHdoZW4gdGhpcyBkZXZpY2UgaG9sZHMgbm8gZXZpZGVuY2Ugb2YgcmVhbFxuICogcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgbm8gcGFzc3dvcmQgdmVyaWZpZXIgKHBhc3N3b3JkSGFzaCkgQU5EIG5vIHByb2ZpbGUga2V5XG4gKiB0aGF0IGlzIGEgUEFTU1dPUkQgYmxvYi5cbiAqXG4gKiBHYXRpbmcgZGV0YWlsIChjcml0aWNhbCk6IGV2aWRlbmNlIGlzIGEgUEFTU1dPUkQgYmxvYiAoaXNQYXNzd29yZEJsb2IpLCBOT1QgYVxuICogZGV2aWNlLWtleSBibG9iLiBTaW5jZSB2MS43LjAgZXZlcnkga2V5IGlzIHdyYXBwZWQgYXQgcmVzdCBldmVuIGZvciB0aGVcbiAqIHBhc3N3b3JkbGVzcyBMZXZlbC0wIHVzZXIsIHNvIGEgbm9ybWFsIHBhc3N3b3JkbGVzcyBpbnN0YWxsIGlzIGZ1bGwgb2ZcbiAqIGRldmljZS1rZXkgY2lwaGVydGV4dDsga2V5aW5nIG9mZiB0aGF0IHdvdWxkIHdyb25nbHkga2VlcCB0aGUgZmxhZyBsYXRjaGVkLlxuICogT25seSBhIHBhc3N3b3JkLWRlcml2ZWQgYmxvYiAob3IgdGhlIHZlcmlmaWVyKSBwcm92ZXMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IHRydWUgaWYgYSBib2d1cyBmbGFnIHdhcyBjbGVhcmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UsIHBhc3N3b3JkSGFzaDogbnVsbCwgcHJvZmlsZXM6IFtdIH0pO1xuICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkgcmV0dXJuIGZhbHNlOyAgIC8vIG5vdGhpbmcgbGF0Y2hlZCBcdTIwMTQgbm90aGluZyB0byBoZWFsXG4gICAgaWYgKGRhdGEucGFzc3dvcmRIYXNoKSByZXR1cm4gZmFsc2U7ICAgLy8gcmVhbCB2ZXJpZmllciBwcmVzZW50IFx1MjAxNCBrZWVwIHRoZSBmbGFnXG5cbiAgICBjb25zdCBoYXNQYXNzd29yZEJsb2IgPSBBcnJheS5pc0FycmF5KGRhdGEucHJvZmlsZXMpICYmXG4gICAgICAgIGRhdGEucHJvZmlsZXMuc29tZShwID0+IHAgJiYgaXNQYXNzd29yZEJsb2IocC5wcml2S2V5KSk7XG4gICAgaWYgKGhhc1Bhc3N3b3JkQmxvYikgcmV0dXJuIGZhbHNlOyAgICAgLy8gcGFzc3dvcmQtZW5jcnlwdGVkIGtleSBtYXRlcmlhbCBcdTIwMTQga2VlcFxuXG4gICAgLy8gRmxhZyBpcyBib2d1cyAoZS5nLiBtaXJyb3JlZCBpbiBmcm9tIGFub3RoZXIgZGV2aWNlIHRoYXQgRElEIGhhdmUgYVxuICAgIC8vIHBhc3N3b3JkKS4gQ2xlYXIgaXQgc28gdGhpcyBkZXZpY2UgaXMgbm90IHN0cmFuZGVkIGF0IGEgZGVhZC1lbmQgdW5sb2NrLlxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIENsZWFyZWQgYm9ndXMgaXNFbmNyeXB0ZWQgZmxhZyAobm8gcGFzc3dvcmQgdmVyaWZpZXIvYmxvYiknKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmFibGUgLyBkaXNhYmxlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gZGF0YVtMT0NBTF9FTkFCTEVEX0tFWV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiBlbmFibGVkIH0pO1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVkdWNlIGV2ZXJ5IGJ1bmtlclVybCBpbiB0aGUgYHByb2ZpbGVzYCBtaXJyb3IgdG8gaXRzIGFkZHJlc3MuIFdvcmtzIG9uIHRoZVxuICogc3RvcmVkIGRhdGEgZGlyZWN0bHksIHNvIGl0IGRvZXMgbm90IGRlcGVuZCBvbiBzeW5jIGJlaW5nIGVuYWJsZWQsIGFuZCB3cml0ZXNcbiAqIG5vdGhpbmcgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGNoYW5nZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNjcnViU3luY2VkUHJvZmlsZXMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgY29uc3QgcHJvZmlsZXMgPSByYXcgPyByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKCdwcm9maWxlcycsIHJhdykgOiBudWxsO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9maWxlcykpIHJldHVybjtcbiAgICBjb25zdCBjbGVhbiA9IHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKTtcbiAgICBpZiAoY2xlYW4gPT09IHByb2ZpbGVzKSByZXR1cm47XG5cbiAgICBjb25zdCBlbnRyaWVzID0gY2h1bmtWYWx1ZSgncHJvZmlsZXMnLCBKU09OLnN0cmluZ2lmeShjbGVhbikpO1xuICAgIGNvbnN0IHBheWxvYWQgPSBPYmplY3QuZnJvbUVudHJpZXMoZW50cmllcy5tYXAoZSA9PiBbZS5rZXksIGUudmFsdWVdKSk7XG4gICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQocGF5bG9hZCk7XG4gICAgY29uc3QgdW51c2VkID0gT2JqZWN0LmtleXMocmF3KS5maWx0ZXIoayA9PlxuICAgICAgICBrLnN0YXJ0c1dpdGgoYCR7Q0hVTktfUFJFRklYfXByb2ZpbGVzOmApICYmICEoayBpbiBwYXlsb2FkKVxuICAgICk7XG4gICAgaWYgKHVudXNlZC5sZW5ndGggPiAwKSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZSh1bnVzZWQpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEluaXRpYWxpc2F0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDYWxsZWQgb25jZSBvbiBzdGFydHVwIChmcm9tIGJhY2tncm91bmQuanMpLlxuICogUHVsbHMgZnJvbSBzeW5jLCBtZXJnZXMsIHRoZW4gbGlzdGVucyBmb3IgcmVtb3RlIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0U3luYygpIHtcbiAgICAvLyBTZWxmLWhlYWwgYSBib2d1cyBlbmNyeXB0aW9uIGZsYWcgZmlyc3QgXHUyMDE0IHRoaXMgbXVzdCBydW4gZXZlbiB3aGVuIHN5bmMgaXNcbiAgICAvLyB1bmF2YWlsYWJsZSBvciBkaXNhYmxlZCwgYmVjYXVzZSB0aGUgYmFkIHN0YXRlIGl0IGZpeGVzIG1heSBoYXZlIGJlZW4gbGVmdFxuICAgIC8vIGJlaGluZCBieSBhbiBlYXJsaWVyIChub3ctcmVtb3ZlZCkgaXNFbmNyeXB0ZWQtc3luY2luZyBidWlsZC5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBzdG9yYWdlLnN5bmMgbm90IGF2YWlsYWJsZSBcdTIwMTQgc2tpcHBpbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNjcnViU3luY2VkUHJvZmlsZXMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gc2NydWJTeW5jZWRQcm9maWxlcyBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBTaGFyZWQgdG9tYnN0b25lLWF3YXJlIG1lcmdlLlxuICpcbiAqIE9uZSBydWxlIGZvciBldmVyeSBwbGFjZSByZW1vdGUgZGF0YSBtZWV0cyBsb2NhbCBkYXRhICh0aGUgc3RvcmFnZS5zeW5jXG4gKiBtaXJyb3IgYW5kIGJvdGggcmVsYXkgcHVsbHMsIHZhdWx0IGRvY3VtZW50cyBhbmQgQVBJIGtleXMpOiBhIHJlbW90ZSBpdGVtIGlzXG4gKiBkcm9wcGVkIHdoZW4gYSB0b21ic3RvbmUgZm9yIGl0cyBrZXkgaXMgZGF0ZWQgYXQgb3IgYWZ0ZXIgdGhlIHJlbW90ZSBpdGVtJ3NcbiAqIG93biB0aW1lc3RhbXAuIERlbGV0aW9uIHdpbnMgdGllcy4gQSBjb3B5IHdyaXR0ZW4gYWZ0ZXIgdGhlIGRlbGV0aW9uIChhXG4gKiByZS1jcmVhdGUpIGNhcnJpZXMgYSBuZXdlciB0aW1lc3RhbXAgYW5kIGlzIGtlcHQuXG4gKlxuICogVG9tYnN0b25lcyBhcmUgbmV2ZXIgcHJ1bmVkIGhlcmUuXG4gKi9cblxuLyoqXG4gKiBJcyBgaXRlbWAgc3VwZXJzZWRlZCBieSB0aGUgdG9tYnN0b25lIGZvciBga2V5YD9cbiAqIEBwYXJhbSB7T2JqZWN0fSB0b21ic3RvbmVzIC0geyBrZXk6IGRlbGV0ZWRBdFNlY29uZHMgfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSB0aGUgaXRlbSdzIHRpbWVzdGFtcCBpbiBzZWNvbmRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1RvbWJzdG9uZWQodG9tYnN0b25lcywga2V5LCB0aW1lKSB7XG4gICAgaWYgKCF0b21ic3RvbmVzIHx8IHR5cGVvZiB0b21ic3RvbmVzICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHRzID0gdG9tYnN0b25lc1trZXldO1xuICAgIHJldHVybiB0cyAhPSBudWxsICYmICh0aW1lIHx8IDApIDw9IHRzO1xufVxuXG4vKipcbiAqIE1lcmdlIGEgcmVtb3RlIG1hcCBpbnRvIGEgbG9jYWwgbWFwLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbCAtIHsga2V5OiBpdGVtIH1cbiAqIEBwYXJhbSB7T2JqZWN0fSByZW1vdGUgLSB7IGtleTogaXRlbSB9XG4gKiBAcGFyYW0ge09iamVjdH0gdG9tYnN0b25lcyAtIHsga2V5OiBkZWxldGVkQXRTZWNvbmRzIH1cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0c11cbiAqIEBwYXJhbSB7KGl0ZW06T2JqZWN0KT0+bnVtYmVyfSBbb3B0cy50aW1lT2ZdIC0gaXRlbSB0aW1lc3RhbXAgKGRlZmF1bHQgdXBkYXRlZEF0KVxuICogQHJldHVybnMge3sgbWVyZ2VkOiBPYmplY3QsIGNoYW5nZWQ6IGJvb2xlYW4gfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlUmVtb3RlKGxvY2FsLCByZW1vdGUsIHRvbWJzdG9uZXMsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IHRpbWVPZiA9IG9wdHMudGltZU9mIHx8ICgoaXRlbSkgPT4gKGl0ZW0gJiYgaXRlbS51cGRhdGVkQXQpIHx8IDApO1xuICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4uKGxvY2FsIHx8IHt9KSB9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBba2V5LCBpdGVtXSBvZiBPYmplY3QuZW50cmllcyhyZW1vdGUgfHwge30pKSB7XG4gICAgICAgIGlmICghaXRlbSkgY29udGludWU7XG4gICAgICAgIGlmIChpc1RvbWJzdG9uZWQodG9tYnN0b25lcywga2V5LCB0aW1lT2YoaXRlbSkpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbWluZSA9IG1lcmdlZFtrZXldO1xuICAgICAgICBpZiAoIW1pbmUgfHwgdGltZU9mKGl0ZW0pID4gdGltZU9mKG1pbmUpKSB7XG4gICAgICAgICAgICBtZXJnZWRba2V5XSA9IGl0ZW07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhtZXJnZWQpKSB7XG4gICAgICAgIGlmIChpc1RvbWJzdG9uZWQodG9tYnN0b25lcywga2V5LCB0aW1lT2YobWVyZ2VkW2tleV0pKSkge1xuICAgICAgICAgICAgZGVsZXRlIG1lcmdlZFtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgbWVyZ2VkLCBjaGFuZ2VkIH07XG59XG5cbi8qKlxuICogQ29sbGVjdCBkZWxldGlvbiB0aW1lcyBmcm9tIHRoZSBhdXRob3IncyBvd24ga2luZCA1IGV2ZW50cyAoTklQLTA5KSBmb3IgdGhlXG4gKiBnaXZlbiBkLXRhZ3MuIEFjY2VwdHMgYGFgIHRhZ3MgYDMwMDc4OjxwdWJrZXk+OjxkdGFnPmAsIGFuZCB0aGUgZWFybGllclxuICogYDMwMDc4Ojo8ZHRhZz5gIHNoYXBlIHRoaXMgZXh0ZW5zaW9uIHVzZWQgdG8gd3JpdGUgKHRoZSBhdXRob3IgaXMgYWxyZWFkeVxuICogdmVyaWZpZWQgYnkgdGhlIGNhbGxlcikuIEFsc28gbWFwcyBgZWAgdGFncyB0aHJvdWdoIGBldmVudElkVG9EdGFnYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGRlbGV0aW9ucyAtIHZlcmlmaWVkIGtpbmQgNSBldmVudHMgYnkgYHB1YmtleWBcbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXZlbnRJZFRvRHRhZ10gLSB7IGV2ZW50SWQ6IGR0YWcgfVxuICogQHJldHVybnMge09iamVjdH0geyBkdGFnOiBsYXRlc3REZWxldGlvbkNyZWF0ZWRBdCB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGlvblRvbWJzdG9uZXMoZGVsZXRpb25zLCBwdWJrZXksIGV2ZW50SWRUb0R0YWcgPSB7fSkge1xuICAgIGNvbnN0IG91dCA9IHt9O1xuICAgIGNvbnN0IG5vdGUgPSAoZHRhZywgdHMpID0+IHtcbiAgICAgICAgaWYgKG91dFtkdGFnXSA9PSBudWxsIHx8IHRzID4gb3V0W2R0YWddKSBvdXRbZHRhZ10gPSB0cztcbiAgICB9O1xuICAgIGZvciAoY29uc3QgZXYgb2YgZGVsZXRpb25zIHx8IFtdKSB7XG4gICAgICAgIGlmICghZXYgfHwgZXYua2luZCAhPT0gNSB8fCBldi5wdWJrZXkgIT09IHB1YmtleSkgY29udGludWU7XG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGV2LnRhZ3MgfHwgW10pIHtcbiAgICAgICAgICAgIGlmICh0YWdbMF0gPT09ICdhJyAmJiB0eXBlb2YgdGFnWzFdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGwgPSBgMzAwNzg6JHtwdWJrZXl9OmA7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVnYWN5ID0gJzMwMDc4OjonO1xuICAgICAgICAgICAgICAgIGlmICh0YWdbMV0uc3RhcnRzV2l0aChmdWxsKSkgbm90ZSh0YWdbMV0uc2xpY2UoZnVsbC5sZW5ndGgpLCBldi5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0YWdbMV0uc3RhcnRzV2l0aChsZWdhY3kpKSBub3RlKHRhZ1sxXS5zbGljZShsZWdhY3kubGVuZ3RoKSwgZXYuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRhZ1swXSA9PT0gJ2UnICYmIGV2ZW50SWRUb0R0YWdbdGFnWzFdXSkge1xuICAgICAgICAgICAgICAgIG5vdGUoZXZlbnRJZFRvRHRhZ1t0YWdbMV1dLCBldi5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuIiwgIi8qKlxuICogU2VjcmV0IFZhdWx0IFx1MjAxNCBhdC1yZXN0IGVuY3J5cHRpb24gZm9yIHByaXZhdGUga2V5cyBhbmQgYXBwbGljYXRpb24gc2VjcmV0cy5cbiAqXG4gKiBUaHJlYXQgbW9kZWwgKFQwLTQpOiByYXcgc2VjcmV0IGJ5dGVzIG11c3QgbmV2ZXIgc2l0IGluIGJyb3dzZXIgc3RvcmFnZSBpblxuICogY2xlYXJ0ZXh0LCBldmVuIGZvciB0aGUgREVGQVVMVCBwYXNzd29yZGxlc3MgdXNlci4gVGhpcyBtb2R1bGUgcHJvdmlkZXMgdHdvXG4gKiB3cmFwcGluZyBzdHJhdGVnaWVzIGJlaGluZCBvbmUgYHdyYXBTZWNyZXRgIC8gYHVud3JhcFNlY3JldGAgaW50ZXJmYWNlOlxuICpcbiAqICAgMS4gREVWSUNFIEtFWSAoZGVmYXVsdCwgbm8gbWFzdGVyIHBhc3N3b3JkKSBcdTIwMTQgYSBub24tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ01cbiAqICAgICAgQ3J5cHRvS2V5LiBUaHJlZSBwZXJzaXN0ZW5jZSBzdHJhdGVnaWVzIGV4aXN0LCBhbmQgZWFjaCBpcyBWRVJJRklFRFxuICogICAgICAocmVhZCBiYWNrIGFuZCByb3VuZC10cmlwcGVkIHRocm91Z2ggZW5jcnlwdC9kZWNyeXB0KSBiZWZvcmUgaXQgaXNcbiAqICAgICAgdHJ1c3RlZDpcbiAqXG4gKiAgICAgICAgYS4gYGlkYmAgICAgXHUyMDE0IGEgQ3J5cHRvS2V5ICpoYW5kbGUqIGluIEluZGV4ZWREQi4gT25seSBldmVyIEFET1BURUQsXG4gKiAgICAgICAgICAgICAgICAgICAgICBuZXZlciBtaW50ZWQ6IHdlIHRydXN0IGBpZGJgIGV4Y2x1c2l2ZWx5IHdoZW4gZGIuZ2V0KClcbiAqICAgICAgICAgICAgICAgICAgICAgIGhhbmRzIGJhY2sgYSBQUkUtRVhJU1RJTkcga2V5IHRoYXQgcm91bmQtdHJpcHMsIGJlY2F1c2VcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoYXQgXHUyMDE0IGFuZCBvbmx5IHRoYXQgXHUyMDE0IHByb3ZlcyB0aGUgaGFuZGxlIHN1cnZpdmVkIGFcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzIGNvbnRleHQuIEEgc2FtZS1jb250ZXh0IHB1dFx1MjE5MmdldCBwcm9iZSBjYW5ub3RcbiAqICAgICAgICAgICAgICAgICAgICAgIHByb3ZlIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UuIEtlZXBpbmcgdGhlIGFkb3B0IHBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXNlcnZlcyBldmVyeSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3cml0dGVuIGJlZm9yZVxuICogICAgICAgICAgICAgICAgICAgICAgMS44LjEsIHdob3NlIGJsb2JzIGxpdmUgdW5kZXIgdGhpcyBrZXkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAqKk5FVkVSIHVzZWQgYXMgdGhlIHdyYXBwaW5nIGtleSBvbiBTYWZhcmkuKiogT24gV2ViS2l0XG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgdHdvIHN0b3JhZ2UgYXJlYXMgZG8gbm90IHNoYXJlIGEgbGlmZXRpbWUgdGhlIHdheVxuICogICAgICAgICAgICAgICAgICAgICAgdGhleSBkbyBvbiBDaHJvbWl1bS9HZWNrbywgc28gYW4gYWRvcHRlZCBJbmRleGVkREIga2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBpcyBub3QgYSBzYWZlIHdyYXBwaW5nIGtleSB0aGVyZS4gU2FmYXJpIHRoZXJlZm9yZSBhbHdheXNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyaXRlcyB1bmRlciBgc2VlZGAgKGJ1bmRsZS1zY29wZWQgYHN0b3JhZ2UubG9jYWxgKTtcbiAqICAgICAgICAgICAgICAgICAgICAgIGFkb3B0ZWQgSURCIGtleXMgYXJlIGRlY3J5cHQtb25seSBsZWdhY3kgb24gU2FmYXJpLCBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBhdC1yZXN0IG1pZ3JhdGlvbiByZS13cmFwcyBFVkVSWSBkZXZpY2UgYmxvYiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbiBzdG9yZXMgXHUyMDE0IHByb2ZpbGUgcHJpdmF0ZSBrZXlzLCBBUEkta2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzLCB2YXVsdC1ub3RlIGJvZGllcywgYW5kIE5JUC00NiBidW5rZXIgc2Vzc2lvblxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cyAvIHNlc3Npb24gcHJpdmF0ZSBrZXlzIFx1MjAxNCBub3QganVzdCBwcm9maWxlIGtleXMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAoUGVyLWVuZ2luZSBzdG9yYWdlLXNjb3BpbmcgcmF0aW9uYWxlOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgICAgICAgICAgICAgICAgIGBhcmNoaXRlY3R1cmUvZGV2aWNlLWtleS1zdHJhdGVneS5tZGAuKVxuICogICAgICAgIGIuIGBzZWVkYCAgIFx1MjAxNCAzMiByYW5kb20gYnl0ZXMgaW4gYGJyb3dzZXIuc3RvcmFnZS5sb2NhbGAgdW5kZXJcbiAqICAgICAgICAgICAgICAgICAgICAgIGBkZXZpY2VLZXlTZWVkYCwgaW1wb3J0ZWQgYXMgYSBub24tZXh0cmFjdGFibGUgQUVTLUdDTVxuICogICAgICAgICAgICAgICAgICAgICAga2V5IGF0IGxvYWQuIFRoaXMgaXMgd2hlcmUgRVZFUlkgbmV3IGRldmljZSBrZXkgbGFuZHMsXG4gKiAgICAgICAgICAgICAgICAgICAgICBvbiBldmVyeSBwbGF0Zm9ybTogd2hlbiBubyBwcmUtZXhpc3RpbmcgSURCIGtleSBpc1xuICogICAgICAgICAgICAgICAgICAgICAgZm91bmQgd2UgZG8gbm90IG1pbnQgb25lLCB3ZSBzZWVkLiBDaHJvbWUvRmlyZWZveCBmcmVzaFxuICogICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbHMgdGhlcmVmb3JlIHVzZSBgc2VlZGAgdG9vIFx1MjAxNCBvbmUgY29kZSBwYXRoLCBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBvbmx5IG9uZSB3aG9zZSBwZXJzaXN0ZW5jZSB3ZSBjYW4gYWN0dWFsbHkgdmVyaWZ5LlxuICogICAgICAgIGMuIGBtZW1vcnlgIFx1MjAxNCBsYXN0IHJlc29ydCAodW5pdCB0ZXN0cywgc2FuZGJveGVkIGNvbnRleHRzKS4gU2VjcmV0c1xuICogICAgICAgICAgICAgICAgICAgICAgd3JhcHBlZCBoZXJlIGRvIG5vdCBzdXJ2aXZlIGEgcmVsb2FkLlxuICpcbiAqICAgICAgVGhlIHJlc29sdmVkIHN0cmF0ZWd5IGlzIFNUSUNLWTogaXQgaXMgcmVjb3JkZWQgaW4gc3RvcmFnZS5sb2NhbCB1bmRlclxuICogICAgICBgZGV2aWNlS2V5U3RyYXRlZ3lgIGFuZCBob25vdXJlZCBvbiBsYXRlciBsb2Fkcywgc28gYSBjb250ZXh0IGNhbm5vdFxuICogICAgICBzaWxlbnRseSBmbGlwIHN0cmF0ZWdpZXMgYW5kIG9ycGhhbiB0aGUgYmxvYnMgd3JpdHRlbiB1bmRlciB0aGUgb2xkXG4gKiAgICAgIG9uZS4gRGVjcnlwdGlvbiBpcyBzeW1tZXRyaWMgcmVnYXJkbGVzczogYGRlY3J5cHRXaXRoRGV2aWNlS2V5YCB0cmllc1xuICogICAgICB0aGUgY3VycmVudCBrZXksIHRoZW4gZXZlcnkgb3RoZXIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBldmVyIGhhdmUgaGFkXG4gKiAgICAgIChsZWdhY3kgSURCIGhhbmRsZSwgZXhpc3Rpbmcgc2VlZCksIGFuZCBjYWxsZXJzIHVzaW5nXG4gKiAgICAgIGBkZWNyeXB0RGV2aWNlQmxvYkZvclJld3JhcGAgcmUtd3JhcCB1bmRlciB0aGUgY3VycmVudCBzdHJhdGVneS5cbiAqXG4gKiAgICAgIFRocmVhdCBtb2RlbCwgaG9uZXN0bHkgc3RhdGVkOiB0aGUgcGFzc3dvcmRsZXNzIGRldmljZSB0aWVyIGlzIGF0LXJlc3RcbiAqICAgICAgcHJvdGVjdGlvbiBhZ2FpbnN0IGNhc3VhbCBpbnNwZWN0aW9uIG9mIGV4dGVuc2lvbiBzdG9yYWdlLCBOT1QgYSBkZWZlbmNlXG4gKiAgICAgIGFnYWluc3QgY29kZSBhbHJlYWR5IGV4ZWN1dGluZyBpbiB0aGlzIGV4dGVuc2lvbidzIGNvbnRleHQuIFRoZVxuICogICAgICBzdHJvbmdlc3QgdGllciBhdmFpbGFibGUgdG9kYXkgaXMgYSAqKm1hc3RlciBwYXNzd29yZCoqIChiZWxvdyksIHdoaWNoXG4gKiAgICAgIGRlcml2ZXMgdGhlIHdyYXBwaW5nIGtleSBmcm9tIGEgc2VjcmV0IHRoYXQgaXMgbmV2ZXIgc3RvcmVkLiBVc2Vyc1xuICogICAgICBob2xkaW5nIGhpZ2gtdmFsdWUga2V5cyBzaG91bGQgc2V0IG9uZS4gQSBoYXJkd2FyZS1iYWNrZWQgZGV2aWNlIGtleSBpc1xuICogICAgICBmdXR1cmUgd29yay4gKFRpZXIgdHJhZGVvZmZzIGluIGZ1bGw6IFBSSVZBVEUgYml6ZG9jc1xuICogICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqXG4gKiAgIDIuIFNFU1NJT04gS0VZIChtYXN0ZXIgcGFzc3dvcmQgc2V0ICsgdW5sb2NrZWQpIFx1MjAxNCB0aGUgQUVTLTI1Ni1HQ00ga2V5XG4gKiAgICAgIGRlcml2ZWQgZnJvbSB0aGUgcGFzc3dvcmQgKHNlZSBjcnlwdG8uanMpLiBTZXQgYnkgdGhlIGJhY2tncm91bmQgd29ya2VyXG4gKiAgICAgIG9uIHVubG9jayB2aWEgYHNldFNlc3Npb25LZXlgLCBjbGVhcmVkIG9uIGxvY2sgdmlhIGBjbGVhclNlc3Npb25gLlxuICpcbiAqIEJsb2IgZm9ybWF0cyAoYm90aCBhcmUgc2VsZi1kZXNjcmliaW5nIEpTT04gc3RyaW5ncyk6XG4gKiAgIHBhc3N3b3JkIGJsb2IgOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqICAgZGV2aWNlICBibG9iIDogeyB2OjEsIGs6XCJkZXZpY2VcIiwgaXYsIGNpcGhlcnRleHQgfVxuICpcbiAqIGB1bndyYXBTZWNyZXRgIHJlZnVzZXMgdG8gZGVjcnlwdCB3aGVuIHRoZSBzZXNzaW9uIGhhcyBiZWVuIGV4cGxpY2l0bHkgbG9ja2VkXG4gKiAoRjUvRjYpIHNvIGEgbG9ja2VkIHBhZ2UgY2Fubm90IHJlYWQgc2VjcmV0cy5cbiAqL1xuXG5pbXBvcnQgeyBlbmNyeXB0V2l0aEtleSwgZGVjcnlwdFdpdGhLZXkgfSBmcm9tICcuL2NyeXB0byc7XG5cbmNvbnN0IElWX0JZVEVTID0gMTI7XG5jb25zdCBERVZJQ0VfREIgPSAnbm9zdHJrZXktc2VjcmV0LXZhdWx0JztcbmNvbnN0IERFVklDRV9TVE9SRSA9ICdrZXlzJztcbmNvbnN0IERFVklDRV9LRVlfSUQgPSAnZGV2aWNlLXdyYXAta2V5LXYxJztcbi8vIHN0b3JhZ2UubG9jYWwga2V5IGhvbGRpbmcgdGhlIGJhc2U2NCByYXcgc2VlZCBmb3IgdGhlIGBzZWVkYCBzdHJhdGVneS5cbmNvbnN0IERFVklDRV9TRUVEX0tFWSA9ICdkZXZpY2VLZXlTZWVkJztcbmNvbnN0IERFVklDRV9TRUVEX0JZVEVTID0gMzI7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBTVElDS1kgcmVzb2x2ZWQgc3RyYXRlZ3kgKCdpZGInIHwgJ3NlZWQnKS5cbmNvbnN0IERFVklDRV9TVFJBVEVHWV9LRVkgPSAnZGV2aWNlS2V5U3RyYXRlZ3knO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgKGtlcHQgbG9jYWwgc28gdGhpcyBtb2R1bGUgaGFzIG5vIGNyb3NzLWRlcHMpIC0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gYWJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VG9BYihiNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gU2Vzc2lvbiAocGFzc3dvcmQtZGVyaXZlZCkga2V5IHN0YXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9zZXNzaW9uS2V5ID0gbnVsbDsgICAvLyBDcnlwdG9LZXkgfCBudWxsXG5sZXQgX3Nlc3Npb25TYWx0ID0gbnVsbDsgIC8vIFVpbnQ4QXJyYXkgfCBudWxsXG4vLyBfdW5sb2NrZWQ6IG51bGwgPSBwYXNzd29yZGxlc3MgLyBub3QgYXBwbGljYWJsZSAobmV2ZXIgbG9ja2VkKSxcbi8vICAgICAgICAgICAgdHJ1ZSA9IHVubG9ja2VkLCBmYWxzZSA9IGxvY2tlZCAocmVmdXNlIHNlY3JldCByZWFkcykuXG5sZXQgX3VubG9ja2VkID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlc3Npb25LZXkoY3J5cHRvS2V5LCBzYWx0KSB7XG4gICAgX3Nlc3Npb25LZXkgPSBjcnlwdG9LZXk7XG4gICAgX3Nlc3Npb25TYWx0ID0gc2FsdDtcbiAgICBfdW5sb2NrZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuICAgIF9zZXNzaW9uS2V5ID0gbnVsbDtcbiAgICBfc2Vzc2lvblNhbHQgPSBudWxsO1xuICAgIF91bmxvY2tlZCA9IGZhbHNlO1xufVxuXG4vKiogRXhwbGljaXRseSBtYXJrIHRoZSBzZXNzaW9uIHVubG9ja2VkL2xvY2tlZCB3aXRob3V0IHByb3ZpZGluZyBhIGtleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVbmxvY2tlZCh2KSB7XG4gICAgX3VubG9ja2VkID0gdiA9PT0gbnVsbCA/IG51bGwgOiAhIXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZXNzaW9uS2V5KCkge1xuICAgIHJldHVybiAhIV9zZXNzaW9uS2V5O1xufVxuXG4vLyAtLS0gRGV2aWNlIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbmxldCBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsOyAgIC8vICdpZGInIHwgJ3NlZWQnIHwgJ21lbW9yeScgXHUyMDE0IHNldCBvbmNlIHJlc29sdmVkXG5sZXQgX21lbW9yeURldmljZUtleSA9IG51bGw7ICAvLyBsYXN0LXJlc29ydCBrZXkgZm9yIGNvbnRleHRzIHRoYXQgcGVyc2lzdCBub3RoaW5nXG5sZXQgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsOyAvLyByZWFkLW9ubHkgaGFuZGxlIG9uIHRoZSBwcmUtMS44LjEgSURCIGtleVxubGV0IF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiBhbiBleGlzdGluZyBzZWVkIGtleVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURldmljZUtleSgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGU6IHJhdyBieXRlcyBjYW4gbmV2ZXIgYmUgcmVhZCBiYWNrIG91dFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWREYkF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5kZXhlZERCICE9PSBudWxsO1xufVxuXG4vKipcbiAqIFByb3ZlIGEgY2FuZGlkYXRlIGtleSBpcyBhY3R1YWxseSB1c2FibGUgYmVmb3JlIHdlIHRydXN0IGEgc3RyYXRlZ3kgd2l0aCBhXG4gKiB1c2VyJ3Mgb25seSBjb3B5IG9mIGEgcHJpdmF0ZSBrZXkuIEEgcmVhZC1iYWNrIGhhbmRsZSB0aGF0IHN0cnVjdHVyZWQtY2xvbmVcbiAqIG1hbmdsZWQgKG9yIGEgc2VlZCB0aGF0IGNhbWUgYmFjayB0cnVuY2F0ZWQpIGZhaWxzIGhlcmUgaW5zdGVhZCBvZiBzaWxlbnRseVxuICogcHJvZHVjaW5nIHVuZGVjcnlwdGFibGUgYmxvYnMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGtleVJvdW5kVHJpcHMoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICAgICAgY29uc3QgcHJvYmUgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ25vc3Rya2V5LWRldmljZS1wcm9iZScpO1xuICAgICAgICBjb25zdCBjdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBwcm9iZSk7XG4gICAgICAgIGNvbnN0IHB0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGN0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwdCkgPT09ICdub3N0cmtleS1kZXZpY2UtcHJvYmUnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBvcGVuRGV2aWNlRGIoKSB7XG4gICAgLy8gTGF6eSBpbXBvcnQgc28gdGhlIG1vZHVsZSB3b3JrcyBpbiBjb250ZXh0cy90ZXN0cyB3aXRob3V0IGlkYiBidW5kbGVkLlxuICAgIGNvbnN0IHsgb3BlbkRCIH0gPSBhd2FpdCBpbXBvcnQoJ2lkYicpO1xuICAgIHJldHVybiBvcGVuREIoREVWSUNFX0RCLCAxLCB7XG4gICAgICAgIHVwZ3JhZGUoZCkge1xuICAgICAgICAgICAgaWYgKCFkLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREVWSUNFX1NUT1JFKSkge1xuICAgICAgICAgICAgICAgIGQuY3JlYXRlT2JqZWN0U3RvcmUoREVWSUNFX1NUT1JFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTdHJhdGVneSAoYSk6IEFET1BUIGEgcHJlLWV4aXN0aW5nIG5vbi1leHRyYWN0YWJsZSBDcnlwdG9LZXkgaGFuZGxlIGZyb21cbiAqIEluZGV4ZWREQi4gTmV2ZXIgbWludHMgb25lLlxuICpcbiAqIEEga2V5IHRoYXQgZGIuZ2V0KCkgaGFuZHMgYmFjayBpcyBhIGtleSBzb21lIEVBUkxJRVIgY29udGV4dCB3cm90ZSwgc28gaXQgaXNcbiAqIHByb29mIG9mIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UgXHUyMDE0IHRoZSBvbmUgdGhpbmcgYSBzYW1lLWNvbnRleHRcbiAqIHB1dFx1MjE5MmdldFx1MjE5MnJvdW5kLXRyaXAgcHJvYmUgY2FuIG5ldmVyIGVzdGFibGlzaC4gaU9TIFNhZmFyaSdzIEluZGV4ZWREQiBpc1xuICogZnVuY3Rpb25hbCBidXQgZXBoZW1lcmFsIGZvciB0aGUgZXh0ZW5zaW9uIGJhY2tncm91bmQ6IGl0IHdvdWxkIGhhdmUgcGFzc2VkXG4gKiB0aGUgcHJvYmUgYW5kIHRoZW4gbG9zdCB0aGUgdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBTbzogbm9cbiAqIHByZS1leGlzdGluZyBrZXkgbWVhbnMgbm8gYGlkYmAsIGFuZCB0aGUgY2FsbGVyIHNlZWRzIGluc3RlYWQuXG4gKlxuICogUmV0dXJucyBudWxsIChuZXZlciB0aHJvd3MpIHdoZW4gbm90aGluZyB1c2FibGUgaXMgdGhlcmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeUlkYkRldmljZUtleSgpIHtcbiAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nKSByZXR1cm4gbnVsbDsgLy8gZW1wdHkgc3RvcmUgXHUyMTkyIHNlZWQsIGRvIE5PVCBtaW50IGhlcmVcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGV4aXN0aW5nKSkgPyBleGlzdGluZyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgc3RvcmFnZSBhcmVhIGJhY2tpbmcgdGhlIGBzZWVkYCBzdHJhdGVneS4gSW1wb3J0ZWQgbGF6aWx5IGJlY2F1c2VcbiAqIGJyb3dzZXItcG9seWZpbGwgdGhyb3dzIGF0IG1vZHVsZSBsb2FkIHdoZW4gbm8gZXh0ZW5zaW9uIG5hbWVzcGFjZSBleGlzdHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlZWRTdG9yYWdlKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICByZXR1cm4gYXBpPy5zdG9yYWdlPy5sb2NhbCB8fCBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBTaWduYWwgMjogYSBXZWJLaXQgdXNlciBhZ2VudCB3aXRoIG5vIENocm9taXVtIG1hcmtlciBvbiBpdC4gKi9cbmZ1bmN0aW9uIGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB1YSA9ICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50KSB8fCAnJztcbiAgICAgICAgcmV0dXJuIC9TYWZhcml8QXBwbGVXZWJLaXQvLnRlc3QodWEpICYmICEvQ2hyb20oZXxpdW0pfEVkZ1xcL3xPUFJcXC8vLnRlc3QodWEpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFRydWUgb24gU2FmYXJpIChpT1MgKyBtYWNPUyksIHdoZXJlIEluZGV4ZWREQiBtdXN0IE5FVkVSIGhvbGQgdGhlIHdyYXBwaW5nXG4gKiBrZXkgXHUyMDE0IHNlZSB0aGUgbW9kdWxlIGhlYWRlcidzIHN0b3JhZ2Utc2NvcGUgbm90ZS5cbiAqXG4gKiBEZXRlY3Rpb24gaXMgbXVsdGktc2lnbmFsIGFuZCBCSUFTRUQgVE9XQVJEIFNBRkFSSSwgYmVjYXVzZSB0aGUgdHdvIGVycm9yc1xuICogYXJlIG5vdCBzeW1tZXRyaWM6IHNlZWRpbmcgYSBDaHJvbWUgdmF1bHQgY29zdHMgbm90aGluZyAoc2VlZCBpcyBhbHJlYWR5IHRoZVxuICogc3RyYXRlZ3kgZXZlcnkgZnJlc2ggaW5zdGFsbCBsYW5kcyBvbiksIHdoaWxlIGFkb3B0aW5nIGFuIElEQiBrZXkgb24gU2FmYXJpXG4gKiBpcyB1bnNhZmUuIFNvIG9ubHkgYSBQT1NJVElWRUxZIGlkZW50aWZpZWQgQ2hyb21lL0ZpcmVmb3ggb3JpZ2luIG1heSBhZG9wdCBhblxuICogSW5kZXhlZERCIGtleSBcdTIwMTQgYSBnZXRVUkwgdGhhdCBpcyBtaXNzaW5nLCB0aHJvd3MsIHJldHVybnMgYSBub24tc3RyaW5nLFxuICogcmV0dXJucyAnJyBvciByZXR1cm5zIGEgc2NoZW1lIHdlIGRvIG5vdCByZWNvZ25pc2UgYWxsIHJlc29sdmUgdG8gU2FmYXJpLlxuICovXG5hc3luYyBmdW5jdGlvbiBpc1NhZmFyaUVuZ2luZSgpIHtcbiAgICBsZXQgb3JpZ2luID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgY29uc3QgdXJsID0gYXBpPy5ydW50aW1lPy5nZXRVUkw/LignJyk7XG4gICAgICAgIG9yaWdpbiA9IHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnID8gdXJsIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgb3JpZ2luID0gbnVsbDtcbiAgICB9XG4gICAgLy8gU2lnbmFsIDE6IGEgcG9zaXRpdmVseSBpZGVudGlmaWVkIFNhZmFyaSBvcmlnaW4uXG4gICAgaWYgKG9yaWdpbiAmJiBvcmlnaW4uc3RhcnRzV2l0aCgnc2FmYXJpLXdlYi1leHRlbnNpb246Ly8nKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU2lnbmFsIDI6IGEgV2ViS2l0LW9ubHkgVUEgb3V0cmFua3MgdGhlIG9yaWdpbiBcdTIwMTQgYSBTYWZhcmkgYnVpbGQgdGhhdFxuICAgIC8vIHJlcG9ydGVkIGFuIHVuZXhwZWN0ZWQgb3JpZ2luIHN0aWxsIG11c3Qgbm90IHRvdWNoIEluZGV4ZWREQi5cbiAgICBpZiAobG9va3NMaWtlV2ViS2l0T25seVVhKCkpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAzOiBvbmx5IHRoZXNlIHR3byBvcmlnaW5zIGVhcm4gdGhlIElEQiBhZG9wdCBwYXRoLlxuICAgIGlmIChvcmlnaW4gJiYgKG9yaWdpbi5zdGFydHNXaXRoKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJykgfHwgb3JpZ2luLnN0YXJ0c1dpdGgoJ21vei1leHRlbnNpb246Ly8nKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTsgLy8gYW1iaWd1b3VzIFx1MjE5MiBzZWVkXG59XG5cbi8qKiBJbXBvcnQgcmF3IHNlZWQgYnl0ZXMgKGJhc2U2NCkgYXMgYSBub24tZXh0cmFjdGFibGUgQUVTLUdDTSBrZXkuICovXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRTZWVkS2V5KHNlZWRCNjQpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLCBiYXNlNjRUb0FiKHNlZWRCNjQpLCB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlIG9uY2UgaW1wb3J0ZWRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG4vKiogUmVhZCB0aGUgc3RpY2t5IHN0cmF0ZWd5IHJlY29yZGVkIGJ5IGEgcHJldmlvdXMgcmVzb2x1dGlvbiAobnVsbCBpZiBub25lKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTdGlja3lTdHJhdGVneSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBzID0gZ290Py5bREVWSUNFX1NUUkFURUdZX0tFWV07XG4gICAgICAgIHJldHVybiAocyA9PT0gJ2lkYicgfHwgcyA9PT0gJ3NlZWQnKSA/IHMgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBSZWNvcmQgdGhlIHJlc29sdmVkIHN0cmF0ZWd5IHNvIGxhdGVyIGxvYWRzIGNhbm5vdCBzaWxlbnRseSBmbGlwIGl0LiAqL1xuYXN5bmMgZnVuY3Rpb24gd3JpdGVTdGlja3lTdHJhdGVneShzdHJhdGVneSkge1xuICAgIGlmIChzdHJhdGVneSAhPT0gJ2lkYicgJiYgc3RyYXRlZ3kgIT09ICdzZWVkJykgcmV0dXJuOyAvLyAnbWVtb3J5JyBwZXJzaXN0cyBub3RoaW5nXG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzdG9yZS5zZXQoeyBbREVWSUNFX1NUUkFURUdZX0tFWV06IHN0cmF0ZWd5IH0pO1xuICAgIH0gY2F0Y2ggeyAvKiBiZXN0IGVmZm9ydCBcdTIwMTQgdGhlIHN0cmF0ZWd5IHN0aWxsIHJlc29sdmVzIHRoZSBzYW1lIHdheSAqLyB9XG59XG5cbi8qKiBTdHJhdGVneSAoYik6IGEgcmF3IHJhbmRvbSBzZWVkIGluIHN0b3JhZ2UubG9jYWwsIGltcG9ydGVkIG5vbi1leHRyYWN0YWJsZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeVNlZWREZXZpY2VLZXkoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICBsZXQgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgIGlmICghc2VlZCkge1xuICAgICAgICAgICAgc2VlZCA9IGFiVG9CYXNlNjQoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShERVZJQ0VfU0VFRF9CWVRFUykpLmJ1ZmZlcik7XG4gICAgICAgICAgICBhd2FpdCBzdG9yZS5zZXQoeyBbREVWSUNFX1NFRURfS0VZXTogc2VlZCB9KTtcbiAgICAgICAgICAgIC8vIFZFUklGWSBwZXJzaXN0ZW5jZSBiZWZvcmUgYW55dGhpbmcgaXMgd3JhcHBlZCB1bmRlciBpdC5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgICAgICBjb25zdCBwZXJzaXN0ZWQgPSBjaGVjaz8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAocGVyc2lzdGVkICE9PSBzZWVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQW5vdGhlciBjb250ZXh0IChwb3B1cCB2cyBiYWNrZ3JvdW5kIG9uIGEgZmlyc3QgcnVuKSBtaW50ZWRcbiAgICAgICAgICAgICAgICAvLyBhbmQgd3JvdGUgaXRzIG93biBzZWVkIGJldHdlZW4gb3VyIHNldCgpIGFuZCB0aGlzIHJlYWQuIEFET1BUXG4gICAgICAgICAgICAgICAgLy8gVEhFIFdJTk5FUjogYW55IHNlZWQgYWN0dWFsbHkgaW4gc3RvcmFnZSBpcyBleGFjdGx5IGFzIGdvb2QgYXNcbiAgICAgICAgICAgICAgICAvLyBvdXJzLCBhbmQgaXQgaXMgdGhlIG9uZSB0aGUgb3RoZXIgY29udGV4dCBpcyBhbHJlYWR5IHdyYXBwaW5nXG4gICAgICAgICAgICAgICAgLy8gdW5kZXIuIFJldHVybmluZyBudWxsIGhlcmUgd291bGQgZHJvcCB0aGUgY2FsbGVyIHRocm91Z2ggdG9cbiAgICAgICAgICAgICAgICAvLyB0aGUgbWVtb3J5IGtleSwgd2hvc2UgYmxvYnMgZGllIHdpdGggdGhpcyBjb250ZXh0IFx1MjAxNCB0aGUgdmVyeVxuICAgICAgICAgICAgICAgIC8vIGxvc3MgdGhpcyBzdHJhdGVneSBleGlzdHMgdG8gcHJldmVudC4gT25seSBhIGdlbnVpbmVseSBhYnNlbnRcbiAgICAgICAgICAgICAgICAvLyBvciB1bnVzYWJsZSB2YWx1ZSBpcyBhIGZhaWx1cmUuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwZXJzaXN0ZWQgIT09ICdzdHJpbmcnIHx8IHBlcnNpc3RlZC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHNlZWQgPSBwZXJzaXN0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldCAoY3JlYXRpbmcgb24gZmlyc3QgdXNlKSB0aGUgZGV2aWNlIHdyYXAga2V5LlxuICpcbiAqIFJlc29sdXRpb24gb3JkZXIsIG9uY2U6IGhvbm91ciB0aGUgc3RpY2t5IHN0cmF0ZWd5IHRoaXMgaW5zdGFsbCBhbHJlYWR5XG4gKiByZWNvcmRlZDsgb3RoZXJ3aXNlIEFET1BUIGEgcHJlLWV4aXN0aW5nIEluZGV4ZWREQiBrZXkgaWYgb25lIGlzIHRoZXJlLCBhbmRcbiAqIGZhaWxpbmcgdGhhdCBzZWVkLiBXaGF0ZXZlciByZXNvbHZlcyBpcyB3cml0dGVuIGJhY2sgYXMgdGhlIHN0aWNreSBzdHJhdGVneS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERldmljZUtleSgpIHtcbiAgICBpZiAoX2RldmljZUtleVByb21pc2UpIHJldHVybiBfZGV2aWNlS2V5UHJvbWlzZTtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0aWNreSA9IGF3YWl0IHJlYWRTdGlja3lTdHJhdGVneSgpO1xuXG4gICAgICAgIC8vIEEgdmF1bHQgYWxyZWFkeSBvbiBgc2VlZGAgbmV2ZXIgcmUtcHJvYmVzIEluZGV4ZWREQjogaXRzIGJsb2JzIGFyZVxuICAgICAgICAvLyB1bmRlciB0aGUgc2VlZCBrZXksIGFuZCBhZG9wdGluZyBhIHN0cmF5IElEQiBoYW5kbGUgd291bGQgb3JwaGFuIHRoZW0uXG4gICAgICAgIC8vIE9uIFNhZmFyaSB3ZSBuZXZlciBXUklURSB1bmRlciBhbiBJREIga2V5IGF0IGFsbCAoc2VlIGhlYWRlcik6IGl0c1xuICAgICAgICAvLyBwZXItZW5naW5lIHN0b3JhZ2Ugc2NvcGluZyBtYWtlcyBhbiBhZG9wdGVkIElEQiBoYW5kbGUgdW5zYWZlIGFzIGFcbiAgICAgICAgLy8gd3JhcHBpbmcga2V5LiBFeGlzdGluZyBJREIgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0XG4gICAgICAgIC8vIGZhbGxiYWNrIGFuZCBhcmUgcmUtd3JhcHBlZCB1bmRlciB0aGUgc2VlZCBieSB0aGUgYXQtcmVzdCBtaWdyYXRpb24uXG4gICAgICAgIGlmIChzdGlja3kgIT09ICdzZWVkJyAmJiAhKGF3YWl0IGlzU2FmYXJpRW5naW5lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBpZGJLZXkgPSBhd2FpdCB0cnlJZGJEZXZpY2VLZXkoKTtcbiAgICAgICAgICAgIGlmIChpZGJLZXkpIHtcbiAgICAgICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnaWRiJztcbiAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdpZGInKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWRiS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IHRyeVNlZWREZXZpY2VLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIHtcbiAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdzZWVkJztcbiAgICAgICAgICAgIC8vIEFsc28gY292ZXJzIHRoZSBkZWdyYWRlIGNhc2U6IHN0aWNreSB3YXMgJ2lkYicgYnV0IHRoZSBoYW5kbGUgaXNcbiAgICAgICAgICAgIC8vIGdvbmUuIE9sZCBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHQgZmFsbGJhY2sgYmVsb3cuXG4gICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdzZWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc2VlZEtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGhpbmcgcGVyc2lzdHMgaGVyZS4gQmV0dGVyIHRoYW4gcmVmdXNpbmcgdG8gZW5jcnlwdCwgYnV0IGJsb2JzXG4gICAgICAgIC8vIHdyaXR0ZW4gdW5kZXIgdGhpcyBrZXkgZGllIHdpdGggdGhlIGNvbnRleHQgXHUyMDE0IHNlZSBtb2R1bGUgaGVhZGVyLlxuICAgICAgICBpZiAoIV9tZW1vcnlEZXZpY2VLZXkpIF9tZW1vcnlEZXZpY2VLZXkgPSBhd2FpdCBnZW5lcmF0ZURldmljZUtleSgpO1xuICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnbWVtb3J5JztcbiAgICAgICAgcmV0dXJuIF9tZW1vcnlEZXZpY2VLZXk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG59XG5cbi8qKiBXaGljaCBwZXJzaXN0ZW5jZSBzdHJhdGVneSB0aGUgZGV2aWNlIGtleSByZXNvbHZlZCB0byAobnVsbCB1bnRpbCByZXNvbHZlZCkuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5U3RyYXRlZ3koKSB7XG4gICAgcmV0dXJuIF9kZXZpY2VTdHJhdGVneTtcbn1cblxuLyoqXG4gKiBEcm9wIGV2ZXJ5IG1lbW9pc2VkIGRldmljZS1rZXkgaGFuZGxlLiBNVVNUIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBhbnlcbiAqIGBzdG9yYWdlLmNsZWFyKClgOiB0aGUgc2VlZCAoYW5kIHRoZSBzdGlja3kgc3RyYXRlZ3kpIGFyZSBnb25lIGZyb20gc3RvcmFnZSxcbiAqIHNvIGEgY2FjaGVkIHByb21pc2Ugd291bGQga2VlcCBoYW5kaW5nIG91dCBhIGtleSB3aG9zZSBiYWNraW5nIG1hdGVyaWFsIG5vXG4gKiBsb25nZXIgZXhpc3RzIFx1MjAxNCB0aGUgbmV4dCBnZXREZXZpY2VLZXkoKSB3b3VsZCB3cmFwIHNlY3JldHMgdW5kZXIgYSBrZXkgdGhhdFxuICogZGllcyB3aXRoIHRoaXMgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGV2aWNlS2V5KCkge1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsO1xuICAgIF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byBhIHByZS1leGlzdGluZyBJbmRleGVkREIgZGV2aWNlIGtleSwgdXNlZCBvbmx5IGFzIGFcbiAqIGRlY3J5cHQgZmFsbGJhY2sgZm9yIGJsb2JzIHdyaXR0ZW4gYmVmb3JlIHRoaXMgY29udGV4dCBjaGFuZ2VkIHN0cmF0ZWd5LlxuICogTmV2ZXIgY3JlYXRlcyBvbmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldExlZ2FjeUlkYktleSgpIHtcbiAgICBpZiAoX2xlZ2FjeUlkYktleVByb21pc2UpIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghaW5kZXhlZERiQXZhaWxhYmxlKCkpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gdGhlIGtleSBhbiBFWElTVElORyBgZGV2aWNlS2V5U2VlZGAgaW1wb3J0cyB0bywgdXNlZCBvbmx5XG4gKiBhcyBhIGRlY3J5cHQgZmFsbGJhY2suIE5ldmVyIG1pbnRzIGEgc2VlZCAodGhhdCBpcyB0cnlTZWVkRGV2aWNlS2V5J3Mgam9iKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0RXhpc3RpbmdTZWVkS2V5KCkge1xuICAgIGlmIChfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSkgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgICAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3Qgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAoIXNlZWQpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBFdmVyeSBPVEhFUiBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGhhdmUgd3JhcHBlZCBhIGRldmljZSBibG9iIHVuZGVyLCBpblxuICogcHJlZmVyZW5jZSBvcmRlci4gU3RyYXRlZ3kgZmxpcHMgKGlkYlx1MjE5MnNlZWQgb24gZGVncmFkZSwgc2VlZFx1MjE5MmlkYiBvbiBhblxuICogYWRvcHRlZCBoYW5kbGUpIG11c3QgbmV2ZXIgb3JwaGFuIGEgYmxvYiwgc28gdGhlIGZhbGxiYWNrIGlzIHN5bW1ldHJpYzogYVxuICogc2VlZCBibG9iIHN0YXlzIHJlYWRhYmxlIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyBhbmQgdmljZSB2ZXJzYS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmFsbGJhY2tEZXZpY2VLZXlzKCkge1xuICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnaWRiJykge1xuICAgICAgICBjb25zdCBsZWdhY3kgPSBhd2FpdCBnZXRMZWdhY3lJZGJLZXkoKTtcbiAgICAgICAgaWYgKGxlZ2FjeSkga2V5cy5wdXNoKGxlZ2FjeSk7XG4gICAgfVxuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdzZWVkJykge1xuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgZ2V0RXhpc3RpbmdTZWVkS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSBrZXlzLnB1c2goc2VlZEtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiB3aXRoIHRoZSBjdXJyZW50IGtleSwgZmFsbGluZyBiYWNrIHRvIGV2ZXJ5IG90aGVyIGtleVxuICogdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZC4gUmV0dXJucyB0aGUgcGxhaW50ZXh0IHBsdXMgd2hldGhlciBhIGZhbGxiYWNrIGtleVxuICogd2FzIG5lZWRlZCAoaS5lLiB0aGUgYmxvYiBpcyBzdGFsZSBhbmQgd29ydGggcmUtd3JhcHBpbmcpLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpLCBzdGFsZTogZmFsc2UgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmFsbGJhY2sgb2YgYXdhaXQgZmFsbGJhY2tEZXZpY2VLZXlzKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoZmFsbGJhY2ssIGl2LCBjaXBoZXJ0ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgc3RhbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiB0cnkgdGhlIG5leHQgb25lICovIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlOyAvLyByZXBvcnQgdGhlIENVUlJFTlQga2V5J3MgZmFpbHVyZSwgbm90IHRoZSBsYXN0IGZhbGxiYWNrJ3NcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBlbmMuZW5jb2RlKHBsYWludGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2OiAxLFxuICAgICAgICBrOiAnZGV2aWNlJyxcbiAgICAgICAgaXY6IGFiVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhYlRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQWIoaXYpKSB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGJhc2U2NFRvQWIoY2lwaGVydGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoRGV2aWNlS2V5KGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIC8vIEdDTSBhdXRoZW50aWNhdGlvbiBjYW4gZmFpbCB3aXRoIHRoZSBDVVJSRU5UIHN0cmF0ZWd5J3Mga2V5IGJlY2F1c2UgdGhlXG4gICAgLy8gYmxvYiBwcmVkYXRlcyBhIHN0cmF0ZWd5IGNoYW5nZSAoYSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3aG9zZSBJREIgaGFuZGxlXG4gICAgLy8gaXMgc3RpbGwgcmVhZGFibGUgd2hpbGUgdGhpcyBjb250ZXh0IHNldHRsZWQgb24gdGhlIHNlZWQsIG9yIHRoZSByZXZlcnNlKS5cbiAgICAvLyBUcnkgZXZlcnkga2V5IHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQgYmVmb3JlIGRlY2xhcmluZyB0aGUgc2VjcmV0IGxvc3QuXG4gICAgY29uc3QgeyBwbGFpbnRleHQgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4gcGxhaW50ZXh0O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiBhbmQsIHdoZW4gaXQgY291bGQgb25seSBiZSByZWFkIHZpYSBhIGZhbGxiYWNrIGtleVxuICogKGxlZ2FjeSBJbmRleGVkREIgaGFuZGxlLCBvciBhbiBleGlzdGluZyBzZWVkIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyksXG4gKiBoYW5kIGJhY2sgYSByZXBsYWNlbWVudCBibG9iIHdyYXBwZWQgdW5kZXIgdGhlIENVUlJFTlQgc3RyYXRlZ3kgc28gdGhlIGNhbGxlclxuICogY2FuIHBlcnNpc3QgdGhlIHVwZ3JhZGUgb3Bwb3J0dW5pc3RpY2FsbHkuXG4gKiBgcmV3cmFwcGVkYCBpcyBudWxsIHdoZW4gdGhlIGJsb2IgaXMgYWxyZWFkeSBjdXJyZW50LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXAoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgeyBwbGFpbnRleHQsIHN0YWxlIH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGxhaW50ZXh0LFxuICAgICAgICByZXdyYXBwZWQ6IHN0YWxlID8gYXdhaXQgZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSA6IG51bGwsXG4gICAgfTtcbn1cblxuLy8gLS0tIEJsb2IgY2xhc3NpZmljYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBmdW5jdGlvbiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLnNhbHQgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQgJiYgcC5rICE9PSAnZGV2aWNlJyk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuayA9PT0gJ2RldmljZScgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuLyoqIFRydWUgaWYgdGhlIHZhbHVlIGlzIGFscmVhZHkgY2lwaGVydGV4dCAoZWl0aGVyIHdyYXBwaW5nKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NpcGhlcnRleHQodmFsdWUpIHtcbiAgICByZXR1cm4gaXNQYXNzd29yZEJsb2IodmFsdWUpIHx8IGlzRGV2aWNlS2V5QmxvYih2YWx1ZSk7XG59XG5cbi8vIC0tLSBVbmlmaWVkIHdyYXAgLyB1bndyYXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHNlY3JldCBmb3IgYXQtcmVzdCBzdG9yYWdlLiBQcmVmZXJzIHRoZSBwYXNzd29yZC1kZXJpdmVkIHNlc3Npb25cbiAqIGtleSB3aGVuIG9uZSBpcyBhdmFpbGFibGUgaW4gdGhpcyBjb250ZXh0IChiYWNrZ3JvdW5kLCB1bmxvY2tlZCk7IG90aGVyd2lzZVxuICogZmFsbHMgYmFjayB0byB0aGUgYWx3YXlzLWF2YWlsYWJsZSBkZXZpY2Uga2V5LiBOZXZlciByZXR1cm5zIHBsYWludGV4dC5cbiAqXG4gKiBUaGUgdGllciBpcyB0aGVyZWZvcmUgQU1CSUVOVCBcdTIwMTQgaXQgaXMgd2hhdGV2ZXIgYHNldFNlc3Npb25LZXlgIC8gYGNsZWFyU2Vzc2lvbmBcbiAqIGxhc3QgZGlkIGluIHRoaXMgbW9kdWxlLCB3aGljaCBtYXkgaGF2ZSBiZWVuIGRvbmUgYnkgYSBkaWZmZXJlbnQgZmlsZS4gT25seVxuICogY2FsbCB0aGlzIHdoZXJlIGVpdGhlciB0aWVyIGlzIGdlbnVpbmVseSBhY2NlcHRhYmxlIChhIHZhbHVlIHRoYXRcbiAqIGB1bndyYXBTZWNyZXRgIGNhbiBvcGVuIHVuZGVyIGJvdGgpLiBBIGNhbGxlciB0aGF0IG5lZWRzIGEgU1BFQ0lGSUMgdGllciBtdXN0XG4gKiBuYW1lIGl0OiBgZW5jcnlwdFdpdGhEZXZpY2VLZXlgIG9yIGBlbmNyeXB0V2l0aEtleWAuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cmFwU2VjcmV0KHBsYWludGV4dCkge1xuICAgIGlmICh0eXBlb2YgcGxhaW50ZXh0ICE9PSAnc3RyaW5nJyB8fCBwbGFpbnRleHQubGVuZ3RoID09PSAwKSByZXR1cm4gcGxhaW50ZXh0O1xuICAgIGlmIChpc0NpcGhlcnRleHQocGxhaW50ZXh0KSkgcmV0dXJuIHBsYWludGV4dDsgLy8gYWxyZWFkeSB3cmFwcGVkIFx1MjAxNCBkb24ndCBkb3VibGUtd3JhcFxuICAgIGlmIChfc2Vzc2lvbktleSkge1xuICAgICAgICByZXR1cm4gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBfc2Vzc2lvbktleSwgX3Nlc3Npb25TYWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbiBhdC1yZXN0IHNlY3JldC4gUmVmdXNlcyB3aGVuIHRoZSBzZXNzaW9uIGlzIGV4cGxpY2l0bHkgbG9ja2VkLlxuICogTGVnYWN5IHBsYWludGV4dCB2YWx1ZXMgYXJlIHJldHVybmVkIHVuY2hhbmdlZCAodHJhbnNpdGlvbmFsIFx1MjAxNCBjYWxsZXJzIHNob3VsZFxuICogcmUtd3JhcCBvbiBuZXh0IHdyaXRlOyBzZWUgbWlncmF0aW9uIHBhdGhzKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVud3JhcFNlY3JldCh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHZhbHVlO1xuICAgIGlmICghaXNDaXBoZXJ0ZXh0KHZhbHVlKSkgcmV0dXJuIHZhbHVlOyAvLyBsZWdhY3kgcGxhaW50ZXh0IHBhc3N0aHJvdWdoXG4gICAgaWYgKF91bmxvY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NrZWQ6IHNlc3Npb24gaXMgbG9ja2VkIFx1MjAxNCBjYW5ub3QgcmVhZCBzZWNyZXQnKTtcbiAgICB9XG4gICAgaWYgKGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGRlY3J5cHRXaXRoRGV2aWNlS2V5KHZhbHVlKTtcbiAgICB9XG4gICAgLy8gcGFzc3dvcmQgYmxvYlxuICAgIGlmICghX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NrZWQ6IG5vIHNlc3Npb24ga2V5IGF2YWlsYWJsZSB0byBkZWNyeXB0IHNlY3JldCcpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdFdpdGhLZXkodmFsdWUsIF9zZXNzaW9uS2V5KTtcbn1cbiIsICIvKipcbiAqIEVuY3J5cHRpb24gdXRpbGl0aWVzIGZvciBOb3N0cktleSBtYXN0ZXIgcGFzc3dvcmQgZmVhdHVyZS5cbiAqXG4gKiBVc2VzIFdlYiBDcnlwdG8gQVBJIChjcnlwdG8uc3VidGxlKSBleGNsdXNpdmVseSBcdTIwMTQgbm8gZXh0ZXJuYWwgbGlicmFyaWVzLlxuICogLSBQQktERjIgd2l0aCA2MDAsMDAwIGl0ZXJhdGlvbnMgKE9XQVNQIDIwMjMgcmVjb21tZW5kYXRpb24pXG4gKiAtIEFFUy0yNTYtR0NNIGZvciBhdXRoZW50aWNhdGVkIGVuY3J5cHRpb25cbiAqIC0gUmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSBwZXIgb3BlcmF0aW9uXG4gKiAtIEFsbCBiaW5hcnkgZGF0YSBlbmNvZGVkIGFzIGJhc2U2NCBmb3IgSlNPTiBzdG9yYWdlIGNvbXBhdGliaWxpdHlcbiAqL1xuXG5jb25zdCBQQktERjJfSVRFUkFUSU9OUyA9IDYwMF8wMDA7XG5jb25zdCBTQUxUX0JZVEVTID0gMTY7XG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gS2V5IGRlcml2YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRGVyaXZlIGFuIEFFUy0yNTYtR0NNIENyeXB0b0tleSBmcm9tIGEgcGFzc3dvcmQgYW5kIHNhbHQgdXNpbmcgUEJLREYyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8VWludDhBcnJheX0gc2FsdCAtIDE2LWJ5dGUgc2FsdFxuICogQHBhcmFtIHt7ZXh0cmFjdGFibGU/OiBib29sZWFufX0gW29wdGlvbnNdIC0gYGV4dHJhY3RhYmxlOiB0cnVlYCBhbGxvd3MgdGhlXG4gKiAgICAgICAgcmF3IGJ5dGVzIHRvIGJlIGV4cG9ydGVkIG9uY2UgKHNlZSBleHBvcnRLZXlCYXNlNjQpLiBVc2VkIGJ5IHRoZVxuICogICAgICAgIGJhY2tncm91bmQgd29ya2VyIHNvIGFuIHVubG9ja2VkIHNlc3Npb24gY2FuIGJlIHBhcmtlZCBpblxuICogICAgICAgIHN0b3JhZ2Uuc2Vzc2lvbiBhbmQgZnVsbHkgcmVzdG9yZWQgYWZ0ZXIgYW4gTVYzIGV2aWN0aW9uLiBEZWZhdWx0XG4gKiAgICAgICAgZmFsc2U6IHRoZSBrZXkgaXMgb3BhcXVlIGFuZCBjYW5ub3QgbGVhdmUgdGhlIGNyeXB0byBzdWJzeXN0ZW0uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fSBBRVMtMjU2LUdDTSBrZXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlS2V5J11cbiAgICApO1xuXG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQ6IHNhbHQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gc2FsdCA6IG5ldyBVaW50OEFycmF5KHNhbHQpLFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgISFvcHRpb25zLmV4dHJhY3RhYmxlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgYW4gZXh0cmFjdGFibGUgQUVTIGtleSdzIHJhdyBieXRlcyBhcyBiYXNlNjQuXG4gKiBPbmx5IGV2ZXIgY2FsbGVkIG9uIGEga2V5IGRlcml2ZWQgd2l0aCBgeyBleHRyYWN0YWJsZTogdHJ1ZSB9YC5cbiAqXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBiYXNlNjQgcmF3IGtleSBieXRlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5QmFzZTY0KGtleSkge1xuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGF3YWl0IGNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KCdyYXcnLCBrZXkpKTtcbn1cblxuLyoqXG4gKiBJbXBvcnQgYmFzZTY0IHJhdyBieXRlcyBiYWNrIGludG8gYSBOT04tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ00ga2V5LlxuICogVGhlIGNvdW50ZXJwYXJ0IG9mIGV4cG9ydEtleUJhc2U2NDogd2hhdGV2ZXIgd2VudCBvdXQgZXh0cmFjdGFibGUgY29tZXMgYmFja1xuICogb3BhcXVlLCBzbyBhIHJlc3RvcmVkIHNlc3Npb24ga2V5IGNhbm5vdCBiZSByZS1leHBvcnRlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZTY0IC0gcmF3IGtleSBieXRlc1xuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydEtleUJhc2U2NChiYXNlNjQpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCksXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nIH0sXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLyoqIGJhc2U2NCBcdTIxOTQgYnl0ZXMsIGV4cG9ydGVkIHNvIGNhbGxlcnMgY2FuIHJvdW5kLXRyaXAgYSBzYWx0IHRocm91Z2ggSlNPTi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvQmFzZTY0KGJ5dGVzKSB7XG4gICAgLy8gYG5ldyBVaW50OEFycmF5KHZpZXcpYCBpbnNpZGUgdGhlIGhlbHBlciBjb3BpZXMgdGhlIFZJRVcsIHNvIGEgc2FsdCB0aGF0XG4gICAgLy8gaXMgYSB3aW5kb3cgaW50byBhIGxhcmdlciBidWZmZXIgc3RpbGwgZW5jb2RlcyBjb3JyZWN0bHkuXG4gICAgcmV0dXJuIGFycmF5QnVmZmVyVG9CYXNlNjQoYnl0ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhiYXNlNjQpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpKTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgd2l0aCBwcmUtZGVyaXZlZCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IGFuZCBpdHMgc2FsdC5cbiAqXG4gKiBUaGlzIGF2b2lkcyBob2xkaW5nIHRoZSByYXcgcGFzc3dvcmQgaW4gbWVtb3J5IFx1MjAxNCB0aGUgY2FsbGVyIGRlcml2ZXMgdGhlXG4gKiBrZXkgb25jZSAodmlhIGRlcml2ZUtleSkgYW5kIHJldXNlcyBpdCBmb3IgdGhlIHNlc3Npb24uICBUaGUgb3V0cHV0XG4gKiBmb3JtYXQgaXMgaWRlbnRpY2FsIHRvIGVuY3J5cHQoKSwgc28gZGVjcnlwdCgpIGNhbiBzdGlsbCBiZSB1c2VkIHdpdGhcbiAqIHRoZSBvcmlnaW5hbCBwYXNzd29yZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0ICAgICAgICAgIC0gVGhlIGRhdGEgdG8gZW5jcnlwdFxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgICAgICAtIEFFUy0yNTYtR0NNIGtleSBmcm9tIGRlcml2ZUtleSgpXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHNhbHQgICAgICAgICAgIC0gVGhlIHNhbHQgdGhhdCB3YXMgdXNlZCB0byBkZXJpdmUgYGtleWBcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIGtleSwgc2FsdCkge1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IC8gRGVjcnlwdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB3aXRoIGEgcGFzc3dvcmQuXG4gKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSwgZGVyaXZlcyBhblxuICogQUVTLTI1Ni1HQ00ga2V5IHZpYSBQQktERjIsIGFuZCByZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZ1xuICogYmFzZTY0LWVuY29kZWQgc2FsdCwgaXYsIGFuZCBjaXBoZXJ0ZXh0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgLSBUaGUgZGF0YSB0byBlbmNyeXB0IChlLmcuIGhleCBwcml2YXRlIGtleSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQsIHBhc3N3b3JkKSB7XG4gICAgY29uc3Qgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCk7XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSAoaWdub3JlcyB0aGUgc2FsdCBlbWJlZGRlZCBpbiB0aGVcbiAqIGJsb2IgXHUyMDE0IHRoZSBjYWxsZXIgbXVzdCBzdXBwbHkgYSBrZXkgdGhhdCBtYXRjaGVzIGhvdyB0aGUgYmxvYiB3YXMgZW5jcnlwdGVkKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpL2VuY3J5cHRXaXRoS2V5KClcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aEtleShlbmNyeXB0ZWREYXRhLCBrZXkpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdGhhdCB3YXMgZW5jcnlwdGVkIHdpdGggYGVuY3J5cHQoKWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgICAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHBhc3N3b3JkIGlzIHdyb25nIG9yIGRhdGEgaXMgdGFtcGVyZWQgd2l0aFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG5cbiAgICBjb25zdCBzYWx0QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuXG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0QnVmKTtcblxuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuXG4gICAgY29uc3QgZGVjID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgcmV0dXJuIGRlYy5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gUGFzc3dvcmQgaGFzaGluZyAoZm9yIHZlcmlmaWNhdGlvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogSGFzaCBhIHBhc3N3b3JkIHdpdGggUEJLREYyIGZvciB2ZXJpZmljYXRpb24gcHVycG9zZXMuXG4gKlxuICogVGhpcyBwcm9kdWNlcyBhIHNlcGFyYXRlIGhhc2ggKG5vdCB0aGUgZW5jcnlwdGlvbiBrZXkpIHRoYXQgY2FuIGJlIHN0b3JlZFxuICogdG8gdmVyaWZ5IHRoZSBwYXNzd29yZCB3aXRob3V0IG5lZWRpbmcgdG8gYXR0ZW1wdCBkZWNyeXB0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gW3NhbHRdIC0gT3B0aW9uYWwgc2FsdDsgZ2VuZXJhdGVkIGlmIG9taXR0ZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHsgaGFzaDogc3RyaW5nLCBzYWx0OiBzdHJpbmcgfT59IGJhc2U2NC1lbmNvZGVkIGhhc2ggYW5kIHNhbHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhc2hQYXNzd29yZChwYXNzd29yZCwgc2FsdCkge1xuICAgIGlmICghc2FsdCkge1xuICAgICAgICBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2FsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2FsdCA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUJpdHMnXVxuICAgICk7XG5cbiAgICBjb25zdCBoYXNoQml0cyA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVyaXZlQml0cyhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0LFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICAyNTZcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogYXJyYXlCdWZmZXJUb0Jhc2U2NChoYXNoQml0cyksXG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IGEgc3RvcmVkIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgLSBUaGUgcGFzc3dvcmQgdG8gdmVyaWZ5XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkSGFzaCAtIGJhc2U2NC1lbmNvZGVkIGhhc2ggZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZFNhbHQgLSBiYXNlNjQtZW5jb2RlZCBzYWx0IGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHRoZSBwYXNzd29yZCBtYXRjaGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkSGFzaCwgc3RvcmVkU2FsdCkge1xuICAgIGNvbnN0IHsgaGFzaCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRTYWx0KTtcbiAgICByZXR1cm4gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoaGFzaCwgc3RvcmVkSGFzaCk7XG59XG5cbi8qKlxuICogQ29uc3RhbnQtdGltZSBjb21wYXJpc29uIG9mIHR3byBiYXNlNjQtZW5jb2RlZCBieXRlIHN0cmluZ3MuXG4gKlxuICogRGVjb2RlcyBib3RoIHRvIHJhdyBieXRlcyBhbmQgY29tcGFyZXMgd2l0aCBhbiBhY2N1bXVsYXRvciBzbyB0aGUgcnVubmluZ1xuICogdGltZSBkb2VzIG5vdCBkZXBlbmQgb24gd2hlcmUgdGhlIGZpcnN0IG1pc21hdGNoIG9jY3VycyBcdTIwMTQgdGhpcyBhdm9pZHMgdGhlXG4gKiB0aW1pbmcgc2lkZS1jaGFubmVsIG9mIGEgcGxhaW4gYD09PWAgc3RyaW5nIGNvbXBhcmUgKFRpZXItMyBjcnlwdG8uanM6MjEzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGEsIGIpIHtcbiAgICBsZXQgYmEsIGJiO1xuICAgIHRyeSB7XG4gICAgICAgIGJhID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihhKSk7XG4gICAgICAgIGJiID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiKSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQ29tcGFyZSB0aGUgbWF4IGxlbmd0aCBzbyBsZW5ndGggZGlmZmVyZW5jZXMgZG9uJ3Qgc2hvcnQtY2lyY3VpdCBlYXJseS5cbiAgICBjb25zdCBsZW4gPSBNYXRoLm1heChiYS5sZW5ndGgsIGJiLmxlbmd0aCk7XG4gICAgbGV0IGRpZmYgPSBiYS5sZW5ndGggXiBiYi5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkaWZmIHw9IChiYVtpXSB8fCAwKSBeIChiYltpXSB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpZmYgPT09IDA7XG59XG4iLCAiLyoqXG4gKiBidW5rZXI6Ly8gY29ubmVjdGlvbiBzdHJpbmdzLiBObyBpbXBvcnRzLCBzbyBhbnl0aGluZyB0aGF0IGhhbmRsZXMgcHJvZmlsZXNcbiAqIGNhbiB1c2UgdGhpcyB3aXRob3V0IGxvYWRpbmcgdGhlIHJlbGF5IGNvZGUuXG4gKlxuICogRm9ybWF0OiBidW5rZXI6Ly88cHVia2V5Pj9yZWxheT13c3M6Ly8uLi4mcmVsYXk9d3NzOi8vLi4uJnNlY3JldD08b3B0aW9uYWw+XG4gKi9cblxuLyoqXG4gKiBQYXJzZSBhIGJ1bmtlcjovLyBjb25uZWN0aW9uIHN0cmluZ1xuICogRm9ybWF0OiBidW5rZXI6Ly88cHVia2V5Pj9yZWxheT13c3M6Ly8uLi4mcmVsYXk9d3NzOi8vLi4uJnNlY3JldD08b3B0aW9uYWw+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1bmtlclVybCh1cmwpIHtcbiAgICBpZiAoIXVybC5zdGFydHNXaXRoKCdidW5rZXI6Ly8nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnVua2VyIFVSTDogbXVzdCBzdGFydCB3aXRoIGJ1bmtlcjovLycpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBjb25zdCByZW1vdGVQdWJrZXkgPSBwYXJzZWQuaG9zdG5hbWUgfHwgcGFyc2VkLnBhdGhuYW1lLnJlcGxhY2UoJy8vJywgJycpO1xuXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IHB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXlzID0gcGFyc2VkLnNlYXJjaFBhcmFtcy5nZXRBbGwoJ3JlbGF5Jyk7XG4gICAgaWYgKHJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IGF0IGxlYXN0IG9uZSByZWxheSBpcyByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHJlbGF5IFVSTHNcbiAgICBmb3IgKGNvbnN0IHJlbGF5IG9mIHJlbGF5cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgciA9IG5ldyBVUkwocmVsYXkpO1xuICAgICAgICAgICAgaWYgKHIucHJvdG9jb2wgIT09ICd3c3M6JyAmJiByLnByb3RvY29sICE9PSAnd3M6Jykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZWxheSBwcm90b2NvbDogJHtyLnByb3RvY29sfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVsYXkgVVJMOiAke3JlbGF5fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2VjcmV0ID0gcGFyc2VkLnNlYXJjaFBhcmFtcy5nZXQoJ3NlY3JldCcpIHx8IG51bGw7XG5cbiAgICByZXR1cm4geyByZW1vdGVQdWJrZXksIHJlbGF5cywgc2VjcmV0IH07XG59XG5cbi8qKlxuICogQSByZWxheSB2YWx1ZSB3aXRob3V0IGNyZWRlbnRpYWxzOiBubyB1c2VyaW5mbywgbm8gYHNlY3JldGAgcGFyYW0sIG5vIGZyYWdtZW50LlxuICogT3RoZXIgcXVlcnkgcGFyYW1zIHN0YXkuIEEgdmFsdWUgd2l0aCBub25lIG9mIHRob3NlIGNvbWVzIGJhY2sgdW5jaGFuZ2VkLlxuICovXG5mdW5jdGlvbiBjbGVhblJlbGF5KHJlbGF5KSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZWxheSk7XG4gICAgY29uc3QgbmFtZXMgPSBbLi4udXJsLnNlYXJjaFBhcmFtcy5rZXlzKCldLmZpbHRlcihuYW1lID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlY3JldCcpO1xuICAgIGlmICghdXJsLnVzZXJuYW1lICYmICF1cmwucGFzc3dvcmQgJiYgIXVybC5oYXNoICYmIG5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlbGF5O1xuICAgIHVybC51c2VybmFtZSA9ICcnO1xuICAgIHVybC5wYXNzd29yZCA9ICcnO1xuICAgIHVybC5oYXNoID0gJyc7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG5hbWVzKSB1cmwuc2VhcmNoUGFyYW1zLmRlbGV0ZShuYW1lKTtcbiAgICByZXR1cm4gdXJsLmhyZWY7XG59XG5cbi8qKlxuICogRG9lcyB0aGlzIGNvbm5lY3Rpb24gc3RyaW5nIGNhcnJ5IGEgc2VjcmV0IHJlZGFjdEJ1bmtlclVybCB3b3VsZCByZW1vdmUsIGluIGl0c1xuICogYHNlY3JldGAgcGFyYW0gb3IgaW5zaWRlIGEgcmVsYXkgdmFsdWU/IE5ldmVyIHRocm93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclVybEhhc1NlY3JldCh1cmwpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHNlY3JldCwgcmVsYXlzIH0gPSBwYXJzZUJ1bmtlclVybCh1cmwpO1xuICAgICAgICByZXR1cm4gISFzZWNyZXQgfHwgcmVsYXlzLnNvbWUocmVsYXkgPT4gY2xlYW5SZWxheShyZWxheSkgIT09IHJlbGF5KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuY29uc3QgZW5jb2RlUmVsYXkgPSAocmVsYXkpID0+XG4gICAgZW5jb2RlVVJJQ29tcG9uZW50KHJlbGF5KS5yZXBsYWNlKC8lM0EvZywgJzonKS5yZXBsYWNlKC8lMkYvZywgJy8nKTtcblxuLyoqXG4gKiBUaGUgc2lnbmVyJ3MgYWRkcmVzcyBhbG9uZTogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9Li4uJnJlbGF5PS4uLlxuICogUmVidWlsdCBmcm9tIHRoZSBwYXJzZWQgZmllbGRzLCBzbyBvZiB0aGUgY29ubmVjdGlvbiBzdHJpbmcgb25seSB0aGUgcHVia2V5IGFuZFxuICogdGhlIHJlbGF5IHZhbHVlcyBzdXJ2aXZlLiBFYWNoIHJlbGF5IHZhbHVlIGxvc2VzIGl0cyB1c2VyaW5mbywgYHNlY3JldGAgcGFyYW1cbiAqIGFuZCBmcmFnbWVudCwgYW5kIGtlZXBzIGFueSBvdGhlciBxdWVyeSBwYXJhbXMgaXQgaGFzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdXJsIGEgY29ubmVjdGlvbiBzdHJpbmcsIG9yIGFueXRoaW5nIGVsc2VcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBhZGRyZXNzLCBvciAnJyBpZiBgdXJsYCBpcyBub3QgYSB2YWxpZCBjb25uZWN0aW9uIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVkYWN0QnVua2VyVXJsKHVybCkge1xuICAgIGxldCBwYXJzZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcGFyc2VkID0gcGFyc2VCdW5rZXJVcmwodXJsKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb25zdCByZWxheXMgPSBwYXJzZWQucmVsYXlzLm1hcChyZWxheSA9PiBgcmVsYXk9JHtlbmNvZGVSZWxheShjbGVhblJlbGF5KHJlbGF5KSl9YCkuam9pbignJicpO1xuICAgIHJldHVybiBgYnVua2VyOi8vJHtwYXJzZWQucmVtb3RlUHVia2V5fT8ke3JlbGF5c31gO1xufVxuXG4vKipcbiAqIFRoZSBzYW1lIHByb2ZpbGUgbGlzdCB3aXRoIGVhY2ggYnVua2VyVXJsIHJlZHVjZWQgdG8gaXRzIGFkZHJlc3MuXG4gKlxuICogQHBhcmFtIHsqfSBwcm9maWxlcyBhIHByb2ZpbGUgbGlzdDsgYW55dGhpbmcgZWxzZSBpcyByZXR1cm5lZCBhcyBpdCBpc1xuICogQHJldHVybnMgdGhlIHNhbWUgbGlzdCB3aGVuIG5vdGhpbmcgbmVlZGVkIGNoYW5naW5nLCBzbyBhIGNhbGxlciBjYW4gc2tpcCBhXG4gKiAgICAgICAgICB3cml0ZSBieSBjb21wYXJpbmcgcmVmZXJlbmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVkYWN0UHJvZmlsZXMocHJvZmlsZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvZmlsZXMpKSByZXR1cm4gcHJvZmlsZXM7XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICBjb25zdCBjbGVhbiA9IHByb2ZpbGVzLm1hcCgocHJvZmlsZSkgPT4ge1xuICAgICAgICBpZiAoIXByb2ZpbGU/LmJ1bmtlclVybCkgcmV0dXJuIHByb2ZpbGU7XG4gICAgICAgIGNvbnN0IGJ1bmtlclVybCA9IHJlZGFjdEJ1bmtlclVybChwcm9maWxlLmJ1bmtlclVybCk7XG4gICAgICAgIGlmIChidW5rZXJVcmwgPT09IHByb2ZpbGUuYnVua2VyVXJsKSByZXR1cm4gcHJvZmlsZTtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB7IC4uLnByb2ZpbGUsIGJ1bmtlclVybCB9O1xuICAgIH0pO1xuICAgIHJldHVybiBjaGFuZ2VkID8gY2xlYW4gOiBwcm9maWxlcztcbn1cblxuLyoqXG4gKiBTdG9yZWQgc2Vzc2lvbnMgYXJlIGtleWVkIGJ5IHByb2ZpbGUgcG9zaXRpb24uIFJlbW92aW5nIGEgcHJvZmlsZSB0YWtlcyBpdHNcbiAqIHNlc3Npb24gd2l0aCBpdCBhbmQgbW92ZXMgbGF0ZXIgc2Vzc2lvbnMgZG93biB3aXRoIHRoZWlyIHByb2ZpbGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0PHN0cmluZywgKj59IGJ1bmtlclNlc3Npb25zXG4gKiBAcGFyYW0ge251bWJlcn0gcmVtb3ZlZEluZGV4XG4gKiBAcmV0dXJucyB7T2JqZWN0PHN0cmluZywgKj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJTZXNzaW9uc0FmdGVyRGVsZXRlKGJ1bmtlclNlc3Npb25zLCByZW1vdmVkSW5kZXgpIHtcbiAgICBjb25zdCBzaGlmdGVkID0ge307XG4gICAgZm9yIChjb25zdCBbcG9zaXRpb24sIHNlc3Npb25dIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmtlclNlc3Npb25zIHx8IHt9KSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IE51bWJlcihwb3NpdGlvbik7XG4gICAgICAgIGlmIChpbmRleCA9PT0gcmVtb3ZlZEluZGV4KSBjb250aW51ZTtcbiAgICAgICAgc2hpZnRlZFtpbmRleCA+IHJlbW92ZWRJbmRleCA/IGluZGV4IC0gMSA6IGluZGV4XSA9IHNlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBzaGlmdGVkO1xufVxuXG4vKipcbiAqIFRoZSBzYW1lLCBmb3IgYW55IGNoYW5nZSBvZiBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsICo+fSBidW5rZXJTZXNzaW9uc1xuICogQHBhcmFtIHtBcnJheTxbbnVtYmVyLCA/bnVtYmVyXT59IG1vdmVzIGVhY2ggcHJvZmlsZSB0aGF0IG1vdmVkLCBhbmQgdG8gd2hlcmU7IG51bGwgaWYgZ29uZVxuICogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGJ1bmtlclNlc3Npb25zLCBtb3Zlcykge1xuICAgIGNvbnN0IG1vdmVkID0gbmV3IE1hcChtb3Zlcyk7XG4gICAgY29uc3QgcGxhY2VkID0ge307XG4gICAgZm9yIChjb25zdCBbcG9zaXRpb24sIHNlc3Npb25dIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmtlclNlc3Npb25zIHx8IHt9KSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IE51bWJlcihwb3NpdGlvbik7XG4gICAgICAgIGNvbnN0IHRvID0gbW92ZWQuaGFzKGluZGV4KSA/IG1vdmVkLmdldChpbmRleCkgOiBpbmRleDtcbiAgICAgICAgaWYgKHRvICE9PSBudWxsKSBwbGFjZWRbdG9dID0gc2Vzc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIHBsYWNlZDtcbn1cbiIsICIvKipcbiAqIE9uZSBvcmRlcmVkIHdyaXRlIHBhdGggZm9yIHRoZSBgcHJvZmlsZXNgIGFycmF5IGluIHN0b3JhZ2UubG9jYWwuXG4gKlxuICogRXZlcnkgd3JpdGVyIHVzZWQgdG8gcmVhZCB0aGUgd2hvbGUgYXJyYXksIGF3YWl0IHNvbWV0aGluZyAoY3J5cHRvLCBhIHJlbGF5XG4gKiBmZXRjaCwgYW5vdGhlciBzdG9yYWdlIHJlYWQpIGFuZCB3cml0ZSB0aGUgd2hvbGUgYXJyYXkgYmFjay4gQSBzbG93IHdyaXRlclxuICogdGhlbiB3cm90ZSBhIHN0YWxlIGNvcHkgb3ZlciBhIG5ld2VyIG9uZTogYSByZWxheSBlZGl0IHZhbmlzaGVkLCBvciBhIHNpdGVcbiAqIHBlcm1pc3Npb24gdGhhdCBoYWQganVzdCBiZWVuIHJldm9rZWQgY2FtZSBiYWNrLlxuICpcbiAqIEhlcmUgZXZlcnkgY2hhbmdlIHJ1bnMgYXM6IHRha2UgdGhlIGxvY2ssIHJlYWQgYHByb2ZpbGVzYCBmcmVzaCwgYXBwbHkgYVxuICogU1lOQ0hST05PVVMgbXV0YXRvciB0aGF0IGNoYW5nZXMgb25seSB0aGUgZmllbGRzIGl0cyBjYWxsZXIgb3ducywgd3JpdGUsIGxldFxuICogZ28uIFNsb3cgd29yayBoYXBwZW5zIGJlZm9yZSB0aGUgY2FsbCwgbmV2ZXIgaW5zaWRlIHRoZSBsb2NrLlxuICpcbiAqIFRoZSBsb2NrIGlzIHRoZSBXZWIgTG9ja3MgQVBJIHdoZW4gdGhlIGNvbnRleHQgaGFzIGl0LiBUaGUgd29ya2VyIGFuZCBldmVyeVxuICogZXh0ZW5zaW9uIHBhZ2Ugc2hhcmUgb25lIG9yaWdpbiwgc28gb25lIG5hbWVkIGxvY2sgb3JkZXJzIHdyaXRlcyBhY3Jvc3MgYWxsXG4gKiBvZiB0aGVtIHdpdGhvdXQgYSBuZXcgbWVzc2FnZSBraW5kLiBFYWNoIGNvbnRleHQgYWxzbyBjaGFpbnMgaXRzIG93biBjYWxscyxcbiAqIHdoaWNoIGlzIHRoZSB3aG9sZSBsb2NrIHdoZXJlIFdlYiBMb2NrcyBhcmUgbWlzc2luZyAodGVzdHMsIG9sZGVyIGVuZ2luZXMpLlxuICovXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5jb25zdCBMT0NLX05BTUUgPSAnbm9zdHJrZXk6cHJvZmlsZXMnO1xubGV0IGxvY2FsQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblxuLyoqIFJ1biBgZm5gIHdpdGggdGhlIHByb2ZpbGVzIGxvY2sgaGVsZC4gTmV2ZXIgY2FsbCB0aGlzIGZyb20gaW5zaWRlIGBmbmAuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aFByb2ZpbGVzTG9jayhmbikge1xuICAgIGNvbnN0IGxvY2tzID0gZ2xvYmFsVGhpcy5uYXZpZ2F0b3I/LmxvY2tzO1xuICAgIGNvbnN0IHRhc2sgPSAobG9ja3MgJiYgdHlwZW9mIGxvY2tzLnJlcXVlc3QgPT09ICdmdW5jdGlvbicpXG4gICAgICAgID8gKCkgPT4gbG9ja3MucmVxdWVzdChMT0NLX05BTUUsICgpID0+IGZuKCkpXG4gICAgICAgIDogKCkgPT4gZm4oKTtcbiAgICBjb25zdCBydW4gPSBsb2NhbENoYWluLnRoZW4odGFzaywgdGFzayk7XG4gICAgbG9jYWxDaGFpbiA9IHJ1bi5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJ1bjtcbn1cblxuLyoqXG4gKiBSZWFkIGBwcm9maWxlc2AgZnJlc2gsIGFwcGx5IGBtdXRhdG9yKHByb2ZpbGVzLCBkYXRhKWAgYW5kIHdyaXRlIHRoZSByZXN1bHQuXG4gKlxuICogVGhlIG11dGF0b3IgbXVzdCBiZSBzeW5jaHJvbm91cy4gSXQgY2hhbmdlcyB0aGUgYXJyYXkgaW4gcGxhY2UgYW5kIHJldHVybnNcbiAqIGZhbHNlIHRvIHNraXAgdGhlIHdyaXRlLCBvciBhbiBvYmplY3Qgb2Ygb3RoZXIga2V5cyB0byB3cml0ZSBpbiB0aGUgc2FtZVxuICogc3RvcmFnZSB3cml0ZSwgb3Igbm90aGluZy4gYGtleXNgIG5hbWVzIG90aGVyIHN0b3JlZCB2YWx1ZXMgKHdpdGggZGVmYXVsdHMpXG4gKiB0aGUgbXV0YXRvciBuZWVkcyB0byByZWFkOyB0aGV5IGFycml2ZSBpbiBgZGF0YWAuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e3dyaXR0ZW46IGJvb2xlYW4sIHByb2ZpbGVzOiBBcnJheX0+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUHJvZmlsZXMobXV0YXRvciwgeyBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWwsIGtleXMgPSB7fSB9ID0ge30pIHtcbiAgICByZXR1cm4gd2l0aFByb2ZpbGVzTG9jayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IC4uLmtleXMsIHByb2ZpbGVzOiBbXSB9KTtcbiAgICAgICAgY29uc3QgcHJvZmlsZXMgPSBBcnJheS5pc0FycmF5KGRhdGEucHJvZmlsZXMpID8gZGF0YS5wcm9maWxlcyA6IFtdO1xuICAgICAgICBjb25zdCBvdXQgPSBtdXRhdG9yKHByb2ZpbGVzLCBkYXRhKTtcbiAgICAgICAgaWYgKG91dCAmJiB0eXBlb2Ygb3V0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndXBkYXRlUHJvZmlsZXM6IHRoZSBtdXRhdG9yIG11c3QgYmUgc3luY2hyb25vdXMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0ID09PSBmYWxzZSkgcmV0dXJuIHsgd3JpdHRlbjogZmFsc2UsIHByb2ZpbGVzIH07XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgLi4uKG91dCB8fCB7fSksIHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4geyB3cml0dGVuOiB0cnVlLCBwcm9maWxlcyB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEFwcGx5IHByaXZhdGUta2V5IGNoYW5nZXMgd29ya2VkIG91dCBlYXJsaWVyLCBtYXRjaGVkIGJ5IHRoZSBzdG9yZWQgYmxvYlxuICogdGhleSByZXBsYWNlLCBzbyBhIHByb2ZpbGUgdGhhdCBtb3ZlZCBvciBjaGFuZ2VkIG1lYW53aGlsZSBpcyBuZXZlciB0b3VjaGVkXG4gKiBieSBtaXN0YWtlLiBgY2hhbmdlc2AgbWFwcyBhbiBvbGQgcHJpdktleSB0byBgeyBwcml2S2V5PywgcHViS2V5PyB9YDsgYVxuICogcHViS2V5IGlzIG9ubHkgZmlsbGVkIGluIHdoZXJlIG5vbmUgaXMgY2FjaGVkLiBSZXR1cm5zIHRoZSB1cGRhdGUgcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlLZXlDaGFuZ2VzKGNoYW5nZXMsIHsgc3RvcmFnZSwgZXh0cmEgPSBudWxsLCB3cml0ZUlmRW1wdHkgPSBmYWxzZSB9ID0ge30pIHtcbiAgICBpZiAoIShjaGFuZ2VzIGluc3RhbmNlb2YgTWFwKSB8fCAoY2hhbmdlcy5zaXplID09PSAwICYmICF3cml0ZUlmRW1wdHkpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyB3cml0dGVuOiBmYWxzZSwgcHJvZmlsZXM6IG51bGwgfSk7XG4gICAgfVxuICAgIHJldHVybiB1cGRhdGVQcm9maWxlcygocHJvZmlsZXMpID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHByb2ZpbGVzKSB7XG4gICAgICAgICAgICBpZiAoIXAgfHwgIXAucHJpdktleSB8fCAhY2hhbmdlcy5oYXMocC5wcml2S2V5KSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBjID0gY2hhbmdlcy5nZXQocC5wcml2S2V5KTtcbiAgICAgICAgICAgIGlmIChjLnB1YktleSAmJiAhcC5wdWJLZXkpIHsgcC5wdWJLZXkgPSBjLnB1YktleTsgY2hhbmdlZCA9IHRydWU7IH1cbiAgICAgICAgICAgIGlmIChjLnByaXZLZXkgJiYgYy5wcml2S2V5ICE9PSBwLnByaXZLZXkpIHsgcC5wcml2S2V5ID0gYy5wcml2S2V5OyBjaGFuZ2VkID0gdHJ1ZTsgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2hhbmdlZCAmJiAhd3JpdGVJZkVtcHR5KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBleHRyYSB8fCB1bmRlZmluZWQ7XG4gICAgfSwgeyBzdG9yYWdlIH0pO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1DQSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsWUFDeEQsT0FBTztBQUNILHNCQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQU07QUFBQSxZQUNuRDtBQUFBLFVBQ0o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQTlEQSxNQWdCTSxVQWFBLFVBdUNBO0FBcEVOO0FBQUE7QUFBQTtBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixVQUFJLENBQUMsVUFBVTtBQUNYLGNBQU0sSUFBSSxNQUFNLGtG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QVEsT0FBTyx3QkFBd0I7QUFDdkQsYUFBTyxLQUFLLEtBQUssa0JBQWtCO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFFQSxpQkFBZSxPQUFPO0FBRWxCLFVBQU0sY0FBYyxNQUFNLFFBQVEsYUFBYTtBQUMvQyxVQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVU7QUFDdkMsVUFBTSxPQUFPLEVBQUUsbUJBQW1CO0FBQ2xDLFVBQU0sT0FBTyxFQUFFLG9CQUFvQjtBQUVuQyxRQUFJLENBQUMsYUFBYTtBQUdkLGtCQUFZLElBQUk7QUFDaEIsZUFBUyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCO0FBQUEsSUFDSjtBQUVBLFFBQUksUUFBUTtBQUVSLGtCQUFZLEtBQUs7QUFDakIsZUFBUyxNQUFNLE1BQU07QUFBQSxRQUNqQixPQUFPO0FBQUEsUUFDUCxTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsTUFDWixDQUFDO0FBQ0Q7QUFBQSxJQUNKO0FBRUEsZ0JBQVksSUFBSTtBQUNoQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBRS9CLFVBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RSxVQUFNLFlBQVksVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFO0FBQ2xELFVBQU0sY0FBYyxNQUFNQyxlQUFjO0FBQ3hDLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFFL0IsZUFBVztBQUNYLFdBQU87QUFFUCxRQUFJLE1BQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsWUFBTSxRQUFRO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBRUEsV0FBUyxpQkFBaUIsb0JBQW9CLE1BQU0sVUFBVSxJQUFJLENBQUM7IiwKICAibmFtZXMiOiBbInRhcmdldCIsICJpbml0IiwgIklWX0JZVEVTIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJhcGkiLCAiSVZfQllURVMiLCAic3RvcmFnZSIsICJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiY29weVNlY3JldCIsICJpc1N5bmNFbmFibGVkIl0KfQo=
