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

  // src/vault/vault.js
  init_process();
  init_browser_polyfill();

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

  // src/utilities/vault-store.js
  init_process();
  init_browser_polyfill();

  // src/utilities/sync-manager.js
  init_process();
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

  // src/utilities/sync-manager.js
  var SYNC_QUOTA = 102400;
  var MAX_ITEM = 8192;
  var MAX_ITEMS = 512;
  var CHUNK_PREFIX = "_chunk:";
  var SYNC_META_KEY = "_sync_meta";
  var LOCAL_ENABLED_KEY = "platformSyncEnabled";
  var PRIORITY = {
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
  async function buildSyncPayload() {
    const all = await storage.get(null);
    const entries = [];
    const secretOk = (v) => !v || isCiphertext(v);
    if (all.profiles) {
      const cleanProfiles = all.profiles.map((p) => {
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
    if (all.isEncrypted != null) {
      const json = JSON.stringify(all.isEncrypted);
      entries.push({ key: "isEncrypted", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
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
  async function pushToSync() {
    if (!api.storage.sync) return;
    const enabled = await isSyncEnabled();
    if (!enabled) return;
    try {
      const entries = await buildSyncPayload();
      entries.sort((a, b) => a.priority - b.priority);
      let usedBytes = 0;
      let usedItems = 0;
      const syncPayload = {};
      const allSyncKeys = [];
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
        for (const c of chunks) {
          syncPayload[c.key] = c.value;
          allSyncKeys.push(c.key);
        }
        usedBytes += entrySize;
        usedItems += chunks.length;
      }
      const meta = {
        lastWrittenAt: Date.now(),
        keys: allSyncKeys
      };
      syncPayload[SYNC_META_KEY] = JSON.stringify(meta);
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
      console.log(`[SyncManager] Pushed ${allSyncKeys.length} entries (${usedBytes} bytes) to sync storage`);
    } catch (e) {
      console.error("[SyncManager] pushToSync error:", e);
    }
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

  // src/utilities/vault-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "vaultDocs";
  async function getDocs() {
    const data = await storage2.get({ [STORAGE_KEY]: {} });
    return data[STORAGE_KEY] || {};
  }
  async function decryptDoc(doc) {
    if (!doc) return doc;
    try {
      return { ...doc, content: await unwrapSecret(doc.content) };
    } catch (e) {
      if (String(e.message || "").startsWith("locked")) throw e;
      return { ...doc, content: null, undecryptable: true };
    }
  }
  async function setDocs(docs) {
    await storage2.set({ [STORAGE_KEY]: docs });
    scheduleSyncPush();
  }
  async function getVaultIndex() {
    const docs = await getDocs();
    const out = {};
    for (const [path, doc] of Object.entries(docs)) {
      out[path] = await decryptDoc(doc);
    }
    return out;
  }
  async function getDocument(path) {
    const docs = await getDocs();
    return docs[path] ? decryptDoc(docs[path]) : null;
  }
  async function saveDocumentLocal(path, content, syncStatus, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    const existing = docs[path];
    docs[path] = {
      path,
      content: await wrapSecret(content),
      // T0-4: encrypt note body at rest
      updatedAt: Math.floor(Date.now() / 1e3),
      syncStatus,
      eventId,
      relayCreatedAt,
      profileScope: existing?.profileScope ?? null
    };
    await setDocs(docs);
    return decryptDoc(docs[path]);
  }
  async function deleteDocumentLocal(path) {
    const docs = await getDocs();
    delete docs[path];
    await setDocs(docs);
  }
  async function listDocuments() {
    const docs = await getDocs();
    const decrypted = [];
    for (const doc of Object.values(docs)) {
      decrypted.push(await decryptDoc(doc));
    }
    return decrypted.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async function updateSyncStatus(path, status, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    if (!docs[path]) return null;
    docs[path].syncStatus = status;
    if (eventId !== null) docs[path].eventId = eventId;
    if (relayCreatedAt !== null) docs[path].relayCreatedAt = relayCreatedAt;
    await setDocs(docs);
    return docs[path];
  }

  // src/vault/vault.js
  var state = {
    documents: [],
    searchQuery: "",
    selectedPath: null,
    editorTitle: "",
    editorContent: "",
    pristineTitle: "",
    pristineContent: "",
    globalSyncStatus: "idle",
    syncError: "",
    saving: false,
    isNew: false,
    toast: "",
    relayInfo: { read: [], write: [] }
  };
  function $(id) {
    return document.getElementById(id);
  }
  function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
  }
  function getFilteredDocuments() {
    if (!state.searchQuery) return state.documents;
    const q = state.searchQuery.toLowerCase();
    return state.documents.filter((d) => d.path.toLowerCase().includes(q));
  }
  function isDirty() {
    return state.editorContent !== state.pristineContent || state.editorTitle !== state.pristineTitle;
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
    if (status === "idle") return "led--green";
    if (status === "syncing") return "led--amber led-pulse";
    return "led--red";
  }
  function syncStatusText() {
    if (state.globalSyncStatus === "syncing") return "Syncing...";
    if (state.globalSyncStatus === "error") return state.syncError;
    return "Synced";
  }
  function docSyncClass(syncStatus) {
    if (syncStatus === "synced") return "led--green";
    if (syncStatus === "local-only") return "led--amber";
    return "led--red";
  }
  function render() {
    const syncDot = $("sync-dot");
    const syncText = $("sync-text");
    const syncBtn = $("sync-btn");
    const docCount = $("doc-count");
    if (syncDot) syncDot.className = `led ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === "syncing" || !hasRelays();
    if (docCount) docCount.textContent = state.documents.length + " doc" + (state.documents.length !== 1 ? "s" : "");
    const fileList = $("file-list");
    const emptyMsg = $("no-documents");
    const filtered = getFilteredDocuments();
    if (fileList) {
      fileList.innerHTML = filtered.map((doc) => `
            <div
                class="doc-item ${state.selectedPath === doc.path ? "selected" : ""}"
                data-doc-path="${doc.path}"
            >
                <div class="doc-path mono ins-truncate">${doc.path}</div>
                <div class="doc-sync led-label">
                    <span class="led ${doc.undecryptable ? "led--red" : docSyncClass(doc.syncStatus)}"></span>
                    <span class="mono">${doc.undecryptable ? "undecryptable" : doc.syncStatus}</span>
                </div>
            </div>
        `).join("");
      fileList.querySelectorAll("[data-doc-path]").forEach((el) => {
        el.addEventListener("click", () => selectDocument(el.dataset.docPath));
      });
    }
    if (emptyMsg) emptyMsg.style.display = filtered.length === 0 ? "block" : "none";
    const editorPanel = $("editor-panel");
    const editorEmpty = $("editor-empty");
    const showEditor = state.selectedPath !== null || state.isNew;
    if (editorPanel) editorPanel.style.display = showEditor ? "block" : "none";
    if (editorEmpty) editorEmpty.style.display = showEditor ? "none" : "block";
    if (showEditor) {
      const titleInput = $("editor-title");
      const contentArea = $("editor-content");
      const saveBtn = $("save-doc-btn");
      const deleteBtn = $("delete-doc-btn");
      const dirtyLabel = $("dirty-label");
      if (titleInput) titleInput.value = state.editorTitle;
      if (contentArea) contentArea.value = state.editorContent;
      if (saveBtn) {
        saveBtn.disabled = state.saving || state.editorTitle.trim().length === 0;
        saveBtn.textContent = state.saving ? "Saving..." : "Save";
      }
      if (deleteBtn) deleteBtn.style.display = state.selectedPath !== null && !state.isNew ? "inline-flex" : "none";
      if (dirtyLabel) dirtyLabel.style.display = isDirty() ? "inline" : "none";
    }
    const searchInput = $("search-input");
    if (searchInput && document.activeElement !== searchInput) {
      searchInput.value = state.searchQuery;
    }
    const toast = $("toast");
    if (toast) {
      toast.textContent = state.toast;
      toast.style.display = state.toast ? "block" : "none";
    }
  }
  function newDocument() {
    state.isNew = true;
    state.selectedPath = null;
    state.editorTitle = "";
    state.editorContent = "";
    state.pristineTitle = "";
    state.pristineContent = "";
    render();
  }
  async function selectDocument(path) {
    const doc = await getDocument(path);
    if (!doc) return;
    if (doc.undecryptable) {
      showToast("This note could not be decrypted on this device \u2014 left untouched");
      return;
    }
    state.isNew = false;
    state.selectedPath = path;
    state.editorTitle = doc.path;
    state.editorContent = doc.content;
    state.pristineTitle = doc.path;
    state.pristineContent = doc.content;
    render();
  }
  async function saveDocument() {
    const title = state.editorTitle.trim();
    if (!title) return;
    state.saving = true;
    render();
    try {
      const result = await api.runtime.sendMessage({
        kind: "vault.publish",
        payload: { path: title, content: state.editorContent }
      });
      if (result.success) {
        if (state.selectedPath && state.selectedPath !== title) {
          await deleteDocumentLocal(state.selectedPath);
        }
        await saveDocumentLocal(title, state.editorContent, "synced", result.eventId, result.createdAt);
        state.selectedPath = title;
        state.isNew = false;
        state.pristineTitle = title;
        state.pristineContent = state.editorContent;
        state.documents = await listDocuments();
        showToast("Saved");
      } else {
        await saveDocumentLocal(title, state.editorContent, "local-only");
        if (state.selectedPath && state.selectedPath !== title) {
          await deleteDocumentLocal(state.selectedPath);
        }
        state.selectedPath = title;
        state.isNew = false;
        state.pristineTitle = title;
        state.pristineContent = state.editorContent;
        state.documents = await listDocuments();
        showToast("Saved locally (relay error: " + (result.error || "unknown") + ")");
      }
    } catch (e) {
      await saveDocumentLocal(state.editorTitle.trim(), state.editorContent, "local-only");
      state.selectedPath = state.editorTitle.trim();
      state.isNew = false;
      state.pristineTitle = state.editorTitle;
      state.pristineContent = state.editorContent;
      state.documents = await listDocuments();
      showToast("Saved locally (offline)");
    }
    state.saving = false;
    render();
  }
  async function deleteDocument() {
    if (!state.selectedPath) return;
    if (!await insConfirm({ title: `Delete "${state.selectedPath}"?`, body: "The document is removed from your vault and, if published, a delete request is sent to your relays.", confirmLabel: "Delete document", destructive: true })) return;
    const doc = await getDocument(state.selectedPath);
    if (doc?.eventId) {
      try {
        await api.runtime.sendMessage({
          kind: "vault.delete",
          payload: { path: state.selectedPath, eventId: doc.eventId }
        });
      } catch (_) {
      }
    }
    await deleteDocumentLocal(state.selectedPath);
    state.selectedPath = null;
    state.isNew = false;
    state.editorTitle = "";
    state.editorContent = "";
    state.pristineTitle = "";
    state.pristineContent = "";
    state.documents = await listDocuments();
    showToast("Deleted");
    render();
  }
  async function syncAll() {
    state.globalSyncStatus = "syncing";
    state.syncError = "";
    render();
    try {
      const result = await api.runtime.sendMessage({ kind: "vault.fetch" });
      if (!result.success) {
        state.globalSyncStatus = "error";
        state.syncError = result.error || "Sync failed";
        render();
        return;
      }
      const localDocs = await getVaultIndex();
      for (const remote of result.documents) {
        const local = localDocs[remote.path];
        if (!local) {
          await saveDocumentLocal(remote.path, remote.content, "synced", remote.eventId, remote.createdAt);
        } else if (local.syncStatus === "local-only") {
          if (local.content !== remote.content) {
            await updateSyncStatus(remote.path, "conflict", remote.eventId, remote.createdAt);
          }
        } else if (!local.relayCreatedAt || remote.createdAt > local.relayCreatedAt) {
          await saveDocumentLocal(remote.path, remote.content, "synced", remote.eventId, remote.createdAt);
          if (state.selectedPath === remote.path) {
            state.editorContent = remote.content;
            state.pristineContent = remote.content;
          }
        }
      }
      state.documents = await listDocuments();
      state.globalSyncStatus = "idle";
    } catch (e) {
      state.globalSyncStatus = "error";
      state.syncError = e.message || "Sync failed";
    }
    render();
  }
  function bindEvents() {
    $("new-doc-btn")?.addEventListener("click", newDocument);
    $("sync-btn")?.addEventListener("click", syncAll);
    $("save-doc-btn")?.addEventListener("click", saveDocument);
    $("delete-doc-btn")?.addEventListener("click", deleteDocument);
    $("search-input")?.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
    });
    $("editor-title")?.addEventListener("input", (e) => {
      state.editorTitle = e.target.value;
      render();
    });
    $("editor-content")?.addEventListener("input", (e) => {
      state.editorContent = e.target.value;
      render();
    });
    $("close-btn")?.addEventListener("click", () => window.close());
  }
  async function init() {
    const isEncrypted = await api.runtime.sendMessage({ kind: "isEncrypted" });
    const gate = $("vault-locked-gate");
    const main = $("vault-main-content");
    if (!isEncrypted) {
      if (gate) gate.style.display = "block";
      if (main) main.style.display = "none";
      $("gate-security-btn")?.addEventListener("click", () => {
        const url = api.runtime.getURL("security/security.html");
        window.open(url, "nostrkey-options");
      });
      return;
    }
    if (gate) gate.style.display = "none";
    if (main) main.style.display = "block";
    try {
      const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
      state.relayInfo = relays || { read: [], write: [] };
    } catch (e) {
      console.warn("[vault] Failed to load relays:", e.message);
      state.relayInfo = { read: [], write: [] };
    }
    try {
      state.documents = await listDocuments();
    } catch (e) {
      console.error("[vault] Failed to load documents:", e.message);
      state.documents = [];
    }
    bindEvents();
    render();
    if (hasRelays()) {
      try {
        await syncAll();
      } catch (e) {
        console.warn("[vault] Sync failed:", e.message);
      }
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3ZhdWx0LXN0b3JlLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc3luYy1tYW5hZ2VyLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc2VjcmV0LXZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY3J5cHRvLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnNlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE1WMyBpbi1tZW1vcnkgYXJlYSB0aGF0IHN1cnZpdmVzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uIGJ1dCBuZXZlciB0b3VjaGVzXG4gICAgLy8gZGlzay4gTnVsbCBvbiBlbmdpbmVzIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGl0IChTYWZhcmkgYmFja2dyb3VuZCBwYWdlLFxuICAgIC8vIG9sZGVyIEZpcmVmb3gpIFx1MjAxNCBjYWxsZXJzIG11c3QgZmVhdHVyZS1kZXRlY3QgYW5kIGZhbGwgYmFjay5cbiAgICBzZXNzaW9uOiBfYnJvd3Nlci5zdG9yYWdlPy5zZXNzaW9uID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdGhlIGFyZWEgdG8gZXh0ZW5zaW9uLXByaXZpbGVnZWQgY29udGV4dHMuIENocm9tZS1vbmx5O1xuICAgICAgICAgKiByZXNvbHZlcyBoYXJtbGVzc2x5IHdoZXJlIHRoZSBtZXRob2QgaXMgYWJzZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWNjZXNzTGV2ZWwoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcbmltcG9ydCB7XG4gICAgZ2V0VmF1bHRJbmRleCxcbiAgICBnZXREb2N1bWVudCxcbiAgICBzYXZlRG9jdW1lbnRMb2NhbCxcbiAgICBkZWxldGVEb2N1bWVudExvY2FsLFxuICAgIGxpc3REb2N1bWVudHMsXG4gICAgdXBkYXRlU3luY1N0YXR1cyxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL3ZhdWx0LXN0b3JlJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZG9jdW1lbnRzOiBbXSxcbiAgICBzZWFyY2hRdWVyeTogJycsXG4gICAgc2VsZWN0ZWRQYXRoOiBudWxsLFxuICAgIGVkaXRvclRpdGxlOiAnJyxcbiAgICBlZGl0b3JDb250ZW50OiAnJyxcbiAgICBwcmlzdGluZVRpdGxlOiAnJyxcbiAgICBwcmlzdGluZUNvbnRlbnQ6ICcnLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgaXNOZXc6IGZhbHNlLFxuICAgIHRvYXN0OiAnJyxcbiAgICByZWxheUluZm86IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9LFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGhhc1JlbGF5cygpIHtcbiAgICByZXR1cm4gc3RhdGUucmVsYXlJbmZvLnJlYWQubGVuZ3RoID4gMCB8fCBzdGF0ZS5yZWxheUluZm8ud3JpdGUubGVuZ3RoID4gMDtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyZWREb2N1bWVudHMoKSB7XG4gICAgaWYgKCFzdGF0ZS5zZWFyY2hRdWVyeSkgcmV0dXJuIHN0YXRlLmRvY3VtZW50cztcbiAgICBjb25zdCBxID0gc3RhdGUuc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gc3RhdGUuZG9jdW1lbnRzLmZpbHRlcihkID0+IGQucGF0aC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpKTtcbn1cblxuZnVuY3Rpb24gaXNEaXJ0eSgpIHtcbiAgICByZXR1cm4gc3RhdGUuZWRpdG9yQ29udGVudCAhPT0gc3RhdGUucHJpc3RpbmVDb250ZW50IHx8IHN0YXRlLmVkaXRvclRpdGxlICE9PSBzdGF0ZS5wcmlzdGluZVRpdGxlO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuICdsZWQtLWdyZWVuJztcbiAgICBpZiAoc3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnbGVkLS1hbWJlciBsZWQtcHVsc2UnO1xuICAgIHJldHVybiAnbGVkLS1yZWQnO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzVGV4dCgpIHtcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ1N5bmNpbmcuLi4nO1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnZXJyb3InKSByZXR1cm4gc3RhdGUuc3luY0Vycm9yO1xuICAgIHJldHVybiAnU3luY2VkJztcbn1cblxuZnVuY3Rpb24gZG9jU3luY0NsYXNzKHN5bmNTdGF0dXMpIHtcbiAgICBpZiAoc3luY1N0YXR1cyA9PT0gJ3N5bmNlZCcpIHJldHVybiAnbGVkLS1ncmVlbic7XG4gICAgaWYgKHN5bmNTdGF0dXMgPT09ICdsb2NhbC1vbmx5JykgcmV0dXJuICdsZWQtLWFtYmVyJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBkb2NDb3VudCA9ICQoJ2RvYy1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGxlZCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKTtcbiAgICBpZiAoZG9jQ291bnQpIGRvY0NvdW50LnRleHRDb250ZW50ID0gc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCArICcgZG9jJyArIChzdGF0ZS5kb2N1bWVudHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpO1xuXG4gICAgLy8gRmlsZSBsaXN0XG4gICAgY29uc3QgZmlsZUxpc3QgPSAkKCdmaWxlLWxpc3QnKTtcbiAgICBjb25zdCBlbXB0eU1zZyA9ICQoJ25vLWRvY3VtZW50cycpO1xuICAgIGNvbnN0IGZpbHRlcmVkID0gZ2V0RmlsdGVyZWREb2N1bWVudHMoKTtcblxuICAgIGlmIChmaWxlTGlzdCkge1xuICAgICAgICBmaWxlTGlzdC5pbm5lckhUTUwgPSBmaWx0ZXJlZC5tYXAoZG9jID0+IGBcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzcz1cImRvYy1pdGVtICR7c3RhdGUuc2VsZWN0ZWRQYXRoID09PSBkb2MucGF0aCA/ICdzZWxlY3RlZCcgOiAnJ31cIlxuICAgICAgICAgICAgICAgIGRhdGEtZG9jLXBhdGg9XCIke2RvYy5wYXRofVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRvYy1wYXRoIG1vbm8gaW5zLXRydW5jYXRlXCI+JHtkb2MucGF0aH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZG9jLXN5bmMgbGVkLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGVkICR7ZG9jLnVuZGVjcnlwdGFibGUgPyAnbGVkLS1yZWQnIDogZG9jU3luY0NsYXNzKGRvYy5zeW5jU3RhdHVzKX1cIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibW9ub1wiPiR7ZG9jLnVuZGVjcnlwdGFibGUgPyAndW5kZWNyeXB0YWJsZScgOiBkb2Muc3luY1N0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYCkuam9pbignJyk7XG5cbiAgICAgICAgZmlsZUxpc3QucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZG9jLXBhdGhdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNlbGVjdERvY3VtZW50KGVsLmRhdGFzZXQuZG9jUGF0aCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVtcHR5TXNnKSBlbXB0eU1zZy5zdHlsZS5kaXNwbGF5ID0gZmlsdGVyZWQubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIC8vIEVkaXRvclxuICAgIGNvbnN0IGVkaXRvclBhbmVsID0gJCgnZWRpdG9yLXBhbmVsJyk7XG4gICAgY29uc3QgZWRpdG9yRW1wdHkgPSAkKCdlZGl0b3ItZW1wdHknKTtcbiAgICBjb25zdCBzaG93RWRpdG9yID0gc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSBudWxsIHx8IHN0YXRlLmlzTmV3O1xuXG4gICAgaWYgKGVkaXRvclBhbmVsKSBlZGl0b3JQYW5lbC5zdHlsZS5kaXNwbGF5ID0gc2hvd0VkaXRvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKGVkaXRvckVtcHR5KSBlZGl0b3JFbXB0eS5zdHlsZS5kaXNwbGF5ID0gc2hvd0VkaXRvciA/ICdub25lJyA6ICdibG9jayc7XG5cbiAgICBpZiAoc2hvd0VkaXRvcikge1xuICAgICAgICBjb25zdCB0aXRsZUlucHV0ID0gJCgnZWRpdG9yLXRpdGxlJyk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRBcmVhID0gJCgnZWRpdG9yLWNvbnRlbnQnKTtcbiAgICAgICAgY29uc3Qgc2F2ZUJ0biA9ICQoJ3NhdmUtZG9jLWJ0bicpO1xuICAgICAgICBjb25zdCBkZWxldGVCdG4gPSAkKCdkZWxldGUtZG9jLWJ0bicpO1xuICAgICAgICBjb25zdCBkaXJ0eUxhYmVsID0gJCgnZGlydHktbGFiZWwnKTtcblxuICAgICAgICBpZiAodGl0bGVJbnB1dCkgdGl0bGVJbnB1dC52YWx1ZSA9IHN0YXRlLmVkaXRvclRpdGxlO1xuICAgICAgICBpZiAoY29udGVudEFyZWEpIGNvbnRlbnRBcmVhLnZhbHVlID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgaWYgKHNhdmVCdG4pIHtcbiAgICAgICAgICAgIHNhdmVCdG4uZGlzYWJsZWQgPSBzdGF0ZS5zYXZpbmcgfHwgc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIHNhdmVCdG4udGV4dENvbnRlbnQgPSBzdGF0ZS5zYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsZXRlQnRuKSBkZWxldGVCdG4uc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gbnVsbCAmJiAhc3RhdGUuaXNOZXcgPyAnaW5saW5lLWZsZXgnIDogJ25vbmUnO1xuICAgICAgICBpZiAoZGlydHlMYWJlbCkgZGlydHlMYWJlbC5zdHlsZS5kaXNwbGF5ID0gaXNEaXJ0eSgpID8gJ2lubGluZScgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoXG4gICAgY29uc3Qgc2VhcmNoSW5wdXQgPSAkKCdzZWFyY2gtaW5wdXQnKTtcbiAgICBpZiAoc2VhcmNoSW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgc2VhcmNoSW5wdXQudmFsdWUgPSBzdGF0ZS5zZWFyY2hRdWVyeTtcbiAgICB9XG5cbiAgICAvLyBUb2FzdFxuICAgIGNvbnN0IHRvYXN0ID0gJCgndG9hc3QnKTtcbiAgICBpZiAodG9hc3QpIHtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBzdGF0ZS50b2FzdDtcbiAgICAgICAgdG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLnRvYXN0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG5ld0RvY3VtZW50KCkge1xuICAgIHN0YXRlLmlzTmV3ID0gdHJ1ZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gJyc7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VsZWN0RG9jdW1lbnQocGF0aCkge1xuICAgIGNvbnN0IGRvYyA9IGF3YWl0IGdldERvY3VtZW50KHBhdGgpO1xuICAgIGlmICghZG9jKSByZXR1cm47XG4gICAgaWYgKGRvYy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIC8vIE9wZW5pbmcgaXQgd291bGQgc2hvdyBhbiBlbXB0eSBlZGl0b3IgYW5kIHRoZSBuZXh0IFNhdmUgd291bGQgd3JpdGVcbiAgICAgICAgLy8gdGhhdCBlbXB0aW5lc3Mgb3ZlciB0aGUgc3RvcmVkIGNpcGhlcnRleHQuIFJlZnVzZSwgYW5kIHNheSB3aHkuXG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBub3RlIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgb24gdGhpcyBkZXZpY2UgXHUyMDE0IGxlZnQgdW50b3VjaGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHBhdGg7XG4gICAgc3RhdGUuZWRpdG9yVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gZG9jLmNvbnRlbnQ7XG4gICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IGRvYy5wYXRoO1xuICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRG9jdW1lbnQoKSB7XG4gICAgY29uc3QgdGl0bGUgPSBzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCk7XG4gICAgaWYgKCF0aXRsZSkgcmV0dXJuO1xuXG4gICAgc3RhdGUuc2F2aW5nID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5wdWJsaXNoJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgcGF0aDogdGl0bGUsIGNvbnRlbnQ6IHN0YXRlLmVkaXRvckNvbnRlbnQgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoICYmIHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gdGl0bGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHN0YXRlLnNlbGVjdGVkUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbCh0aXRsZSwgc3RhdGUuZWRpdG9yQ29udGVudCwgJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgICAgICBzaG93VG9hc3QoJ1NhdmVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbCh0aXRsZSwgc3RhdGUuZWRpdG9yQ29udGVudCwgJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggJiYgc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSB0aXRsZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgICAgICBzaG93VG9hc3QoJ1NhdmVkIGxvY2FsbHkgKHJlbGF5IGVycm9yOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpICsgJyknKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwoc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCk7XG4gICAgICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSBzdGF0ZS5lZGl0b3JUaXRsZTtcbiAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICBzaG93VG9hc3QoJ1NhdmVkIGxvY2FsbHkgKG9mZmxpbmUpJyk7XG4gICAgfVxuXG4gICAgc3RhdGUuc2F2aW5nID0gZmFsc2U7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZURvY3VtZW50KCkge1xuICAgIGlmICghc3RhdGUuc2VsZWN0ZWRQYXRoKSByZXR1cm47XG4gICAgaWYgKCEoYXdhaXQgaW5zQ29uZmlybSh7IHRpdGxlOiBgRGVsZXRlIFwiJHtzdGF0ZS5zZWxlY3RlZFBhdGh9XCI/YCwgYm9keTogJ1RoZSBkb2N1bWVudCBpcyByZW1vdmVkIGZyb20geW91ciB2YXVsdCBhbmQsIGlmIHB1Ymxpc2hlZCwgYSBkZWxldGUgcmVxdWVzdCBpcyBzZW50IHRvIHlvdXIgcmVsYXlzLicsIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZSBkb2N1bWVudCcsIGRlc3RydWN0aXZlOiB0cnVlIH0pKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZG9jID0gYXdhaXQgZ2V0RG9jdW1lbnQoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcblxuICAgIGlmIChkb2M/LmV2ZW50SWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAndmF1bHQuZGVsZXRlJyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IHBhdGg6IHN0YXRlLnNlbGVjdGVkUGF0aCwgZXZlbnRJZDogZG9jLmV2ZW50SWQgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChfKSB7fVxuICAgIH1cblxuICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgc3RhdGUuZWRpdG9yVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICBzaG93VG9hc3QoJ0RlbGV0ZWQnKTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3luY0FsbCgpIHtcbiAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ3N5bmNpbmcnO1xuICAgIHN0YXRlLnN5bmNFcnJvciA9ICcnO1xuICAgIHJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZmV0Y2gnIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxvY2FsRG9jcyA9IGF3YWl0IGdldFZhdWx0SW5kZXgoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJlbW90ZSBvZiByZXN1bHQuZG9jdW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbCA9IGxvY2FsRG9jc1tyZW1vdGUucGF0aF07XG5cbiAgICAgICAgICAgIGlmICghbG9jYWwpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChyZW1vdGUucGF0aCwgcmVtb3RlLmNvbnRlbnQsICdzeW5jZWQnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnN5bmNTdGF0dXMgPT09ICdsb2NhbC1vbmx5Jykge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbC5jb250ZW50ICE9PSByZW1vdGUuY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB1cGRhdGVTeW5jU3RhdHVzKHJlbW90ZS5wYXRoLCAnY29uZmxpY3QnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghbG9jYWwucmVsYXlDcmVhdGVkQXQgfHwgcmVtb3RlLmNyZWF0ZWRBdCA+IGxvY2FsLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwocmVtb3RlLnBhdGgsIHJlbW90ZS5jb250ZW50LCAnc3luY2VkJywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggPT09IHJlbW90ZS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSByZW1vdGUuY29udGVudDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gcmVtb3RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgICQoJ25ldy1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmV3RG9jdW1lbnQpO1xuICAgICQoJ3N5bmMtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3luY0FsbCk7XG4gICAgJCgnc2F2ZS1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZURvY3VtZW50KTtcbiAgICAkKCdkZWxldGUtZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZURvY3VtZW50KTtcblxuICAgICQoJ3NlYXJjaC1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnNlYXJjaFF1ZXJ5ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnZWRpdG9yLXRpdGxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZWRpdG9yVGl0bGUgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdlZGl0b3ItY29udGVudCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gR2F0ZTogcmVxdWlyZSBtYXN0ZXIgcGFzc3dvcmQgYmVmb3JlIGFsbG93aW5nIHZhdWx0IGFjY2Vzc1xuICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCByZWxheXM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUucmVsYXlJbmZvID0geyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCBkb2N1bWVudHM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gW107XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKGhhc1JlbGF5cygpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBTeW5jIGZhaWxlZDonLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iLCAiLyoqXG4gKiBpbnMtY29uZmlybS5qcyBcdTIwMTQgdGhlIHNoYXJlZCBjb25zZW50IG92ZXJsYXkgZm9yIGV4dGVuc2lvbiBwYWdlcy5cbiAqXG4gKiBPbmUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGNvbnNlbnQtc3VyZmFjZSBzdGFuZGFyZDogYSBkaW1tZWQgYmFja2Ryb3AgcGx1c1xuICogZWl0aGVyIGEgYm90dG9tIFNIRUVUIChkZWZhdWx0OyBkZXN0cnVjdGl2ZSAvIGlycmV2ZXJzaWJsZSBhY3RzKSBvciBhXG4gKiBjZW50ZXJlZCBQT1BPVkVSIChsb3ctc3Rha2VzLCByZXZlcnNpYmxlIGFjdHMpLiBSZXBsYWNlcyBuYXRpdmVcbiAqIGNvbmZpcm0oKS9hbGVydCgpIG9uIGV2ZXJ5IGV4dGVuc2lvbi1wYWdlIHN1cmZhY2UuXG4gKlxuICogICBpbnNDb25maXJtKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50IH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTxib29sZWFuPiAgICh0cnVlID0gY29uZmlybWVkOyBFc2NhcGUvYmFja2Ryb3AvY2FuY2VsID0gZmFsc2UpXG4gKiAgIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPHZvaWQ+XG4gKlxuICogU3R5bGluZyBjb21lcyBlbnRpcmVseSBmcm9tIGluc3RydW1lbnQuY3NzIChzZWN0aW9uIDE4ICsgdGhlIC5idG4gZmFtaWx5KSxcbiAqIHNvIHNraW4gLyBtb2RlIC8gY29udHJhc3QgLyBkZW5zaXR5IC8gdGV4dC1zaXplIGFycml2ZSB2aWEgdGhlIHBhZ2Unc1xuICogc3RhbXBlZCBkYXRhLWlucy0qIGF0dHJpYnV0ZXMgXHUyMDE0IG5vIHN0b3JhZ2UgYWNjZXNzLCBubyBtZXNzYWdpbmcgaGVyZS5cbiAqXG4gKiBTYWZldHk6IHRpdGxlL2JvZHkgbWF5IGNvbnRhaW4gdXNlciBkYXRhIChrZXkgbGFiZWxzLCB2YXVsdCBwYXRocyk7IHRoZSBET01cbiAqIGlzIGJ1aWx0IHdpdGggY3JlYXRlRWxlbWVudCArIHRleHRDb250ZW50IE9OTFkgXHUyMDE0IG5ldmVyIGlubmVySFRNTC5cbiAqL1xuXG4vLyBTZXJpYWxpemUgb3ZlcmxhcHBpbmcgY2FsbHMgc28gYSBzZWNvbmQgZGlhbG9nIG5ldmVyIGRvdWJsZS1yZW5kZXJzIG9uIHRvcFxuLy8gb2YgKG9yIGludGVybGVhdmVzIHdpdGgpIGFuIG9wZW4gb25lLlxubGV0IHF1ZXVlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbmxldCBpZENvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBtb3Rpb25PZmYoKSB7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5zLW1vdGlvbicpID09PSAnb2ZmJykgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEJ1aWxkLCBzaG93IGFuZCBzZXR0bGUgb25lIGRpYWxvZy4gUmVzb2x2ZXMgdHJ1ZSAoY29uZmlybSkgb3IgZmFsc2VcbiAqIChjYW5jZWwgLyBFc2NhcGUgLyBiYWNrZHJvcCBjbGljaykuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZSB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByb290LmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1yb290JztcblxuICAgICAgICBjb25zdCBiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBiYWNrZHJvcC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYmFja2Ryb3AnO1xuXG4gICAgICAgIGNvbnN0IGlzU2hlZXQgPSB2YXJpYW50ICE9PSAncG9wb3Zlcic7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaWFsb2cuY2xhc3NOYW1lID0gaXNTaGVldCA/ICdpbnMtY29uc2VudC1zaGVldCcgOiAnaW5zLWNvbnNlbnQtcG9wb3Zlcic7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAoZGVzdHJ1Y3RpdmUgfHwgbm90aWNlKSA/ICdhbGVydGRpYWxvZycgOiAnZGlhbG9nJyk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuXG4gICAgICAgIGlmIChpc1NoZWV0KSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhhbmRsZS5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtaGFuZGxlJztcbiAgICAgICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChoYW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdWlkID0gKytpZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC10aXRsZSc7XG4gICAgICAgIHRpdGxlRWwuaWQgPSBgaW5zLWNvbnNlbnQtdGl0bGUtJHt1aWR9YDtcbiAgICAgICAgdGl0bGVFbC50ZXh0Q29udGVudCA9IHRpdGxlIHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIHRpdGxlRWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGJvZHlFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgYm9keUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1ib2R5JztcbiAgICAgICAgYm9keUVsLmlkID0gYGlucy1jb25zZW50LWJvZHktJHt1aWR9YDtcbiAgICAgICAgYm9keUVsLnRleHRDb250ZW50ID0gYm9keSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGJvZHlFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCBib2R5RWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYWN0aW9ucyc7XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IFtdO1xuICAgICAgICBsZXQgY2FuY2VsQnRuID0gbnVsbDtcbiAgICAgICAgY29uc3QgY29uZmlybUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjb25maXJtQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY29uZmlybUJ0bi50ZXh0Q29udGVudCA9IGNvbmZpcm1MYWJlbDtcbiAgICAgICAgaWYgKG5vdGljZSkge1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSAnYnRuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi5jbGFzc05hbWUgPSAnYnRuIGJ0bi0tZ2hvc3QnO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gY2FuY2VsTGFiZWw7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gZGVzdHJ1Y3RpdmUgPyAnYnRuIGJ0bi0tZGVzdHJ1Y3RpdmUnIDogJ2J0biBidG4tLXByaW1hcnknO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY29uZmlybUJ0bik7XG4gICAgICAgIGJ1dHRvbnMucHVzaChjb25maXJtQnRuKTtcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoYmFja2Ryb3ApO1xuICAgICAgICByb290LmFwcGVuZENoaWxkKGRpYWxvZyk7XG5cbiAgICAgICAgbGV0IHNldHRsZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gc2V0dGxlKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZGb2N1cyAmJiB0eXBlb2YgcHJldkZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nICYmIGRvY3VtZW50LmNvbnRhaW5zKHByZXZGb2N1cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZGb2N1cy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBmb2N1cyByZXN0b3JlIGlzIGJlc3QtZWZmb3J0ICovIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG1vdGlvbk9mZigpKSBmaW5pc2goKTtcbiAgICAgICAgICAgIGVsc2Ugc2V0VGltZW91dChmaW5pc2gsIDI1MCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbktleWRvd24oZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzZXR0bGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdUYWInKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJhcCBmb2N1cyBhY3Jvc3MgdGhlIGRpYWxvZydzIGJ1dHRvbnMgb25seS5cbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJ1dHRvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBldi5zaGlmdEtleSA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBidXR0b25zWyhpZHggKyBkaXIgKyBidXR0b25zLmxlbmd0aCkgJSBidXR0b25zLmxlbmd0aF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJhY2tkcm9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGlmIChjYW5jZWxCdG4pIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKHRydWUpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290KTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAvLyBEZXN0cnVjdGl2ZSBhY3RzIHN0YXJ0IG9uIENhbmNlbCBzbyBFbnRlciBjYW4ndCBydXNoIHRoZSBkZWxldGU7XG4gICAgICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2Ugc3RhcnRzIG9uIHRoZSBjb25maXJtaW5nIGFjdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWwgPSBub3RpY2UgPyBjb25maXJtQnRuIDogKGRlc3RydWN0aXZlID8gY2FuY2VsQnRuIDogY29uZmlybUJ0bik7XG4gICAgICAgICAgICAoaW5pdGlhbCB8fCBjb25maXJtQnRuKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc0NvbmZpcm0oe1xuICAgIHRpdGxlLFxuICAgIGJvZHksXG4gICAgY29uZmlybUxhYmVsID0gJ0NvbmZpcm0nLFxuICAgIGNhbmNlbExhYmVsID0gJ0NhbmNlbCcsXG4gICAgZGVzdHJ1Y3RpdmUgPSBmYWxzZSxcbiAgICB2YXJpYW50ID0gJ3NoZWV0Jyxcbn0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlOiBmYWxzZSB9KSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsID0gJ09LJyB9ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgY29uZmlybUxhYmVsOiBkaXNtaXNzTGFiZWwsXG4gICAgICAgICAgICBjYW5jZWxMYWJlbDogJycsXG4gICAgICAgICAgICBkZXN0cnVjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB2YXJpYW50OiAnc2hlZXQnLFxuICAgICAgICAgICAgbm90aWNlOiB0cnVlLFxuICAgICAgICB9KS50aGVuKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwgIi8qKlxuICogVmF1bHQgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgdmF1bHQgZG9jdW1lbnRzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICB2YXVsdERvY3M6IHtcbiAqICAgICBcInBhdGgvdG8vZmlsZS5tZFwiOiB7XG4gKiAgICAgICBwYXRoLCBjb250ZW50LCB1cGRhdGVkQXQsIHN5bmNTdGF0dXMsIGV2ZW50SWQsIHJlbGF5Q3JlYXRlZEF0LFxuICogICAgICAgcHJvZmlsZVNjb3BlXG4gKiAgICAgfVxuICogICB9XG4gKlxuICogc3luY1N0YXR1czogXCJzeW5jZWRcIiB8IFwibG9jYWwtb25seVwiIHwgXCJjb25mbGljdFwiXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICd2YXVsdERvY3MnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXREb2NzKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtTVE9SQUdFX0tFWV06IHt9IH0pO1xuICAgIHJldHVybiBkYXRhW1NUT1JBR0VfS0VZXSB8fCB7fTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZG9jdW1lbnQncyBgY29udGVudGAgZm9yIGNhbGxlcnMuIFJlLXRocm93cyBsb2NrIGVycm9ycyBzbyBhIGxvY2tlZFxuICogc2Vzc2lvbiBjYW5ub3QgcmVhZCBub3RlcyAoRjYpLlxuICpcbiAqIEEgZ2VudWluZSBkZWNyeXB0IGZhaWx1cmUgKGUuZy4gYSB2YWx1ZSBzeW5jZWQgZnJvbSBhbm90aGVyIGRldmljZSwgb3IgYSBibG9iXG4gKiB3aG9zZSB3cmFwcGluZyBrZXkgcm90YXRlZCBhd2F5KSBpcyByZXBvcnRlZCBhcyBgdW5kZWNyeXB0YWJsZTogdHJ1ZWAgd2l0aFxuICogYGNvbnRlbnQ6IG51bGxgIFx1MjAxNCBOT1QgYXMgYW4gZW1wdHkgc3RyaW5nLiBFbXB0eSBjb250ZW50IGlzIGluZGlzdGluZ3Vpc2hhYmxlXG4gKiBmcm9tIGEgcmVhbCBlbXB0eSBub3RlOiB0aGUgZWRpdG9yIG9wZW5lZCBpdCBibGFuaywgYW5kIHRoZSBuZXh0IFNhdmUgd3JvdGVcbiAqIHRoYXQgYmxhbmsgb3ZlciB0aGUgdXNlcidzIG9ubHkgY29weS4gYG51bGxgICsgdGhlIGZsYWcgbGV0cyBjYWxsZXJzIHJlZnVzZVxuICogdG8gb3BlbiBvciBvdmVyd3JpdGUgaXQsIGFuZCBsZWF2ZXMgdGhlIGNpcGhlcnRleHQgYXQgcmVzdCB1bnRvdWNoZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREb2MoZG9jKSB7XG4gICAgaWYgKCFkb2MpIHJldHVybiBkb2M7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgLi4uZG9jLCBjb250ZW50OiBhd2FpdCB1bndyYXBTZWNyZXQoZG9jLmNvbnRlbnQpIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoU3RyaW5nKGUubWVzc2FnZSB8fCAnJykuc3RhcnRzV2l0aCgnbG9ja2VkJykpIHRocm93IGU7XG4gICAgICAgIHJldHVybiB7IC4uLmRvYywgY29udGVudDogbnVsbCwgdW5kZWNyeXB0YWJsZTogdHJ1ZSB9O1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0RG9jcyhkb2NzKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBkb2NzIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZ1bGwgdmF1bHQgZG9jcyBvYmplY3QuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBNYXAgb2YgcGF0aCAtPiBkb2NcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZhdWx0SW5kZXgoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBjb25zdCBvdXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBkb2NdIG9mIE9iamVjdC5lbnRyaWVzKGRvY3MpKSB7XG4gICAgICAgIG91dFtwYXRoXSA9IGF3YWl0IGRlY3J5cHREb2MoZG9jKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZXQgYSBzaW5nbGUgZG9jdW1lbnQgYnkgcGF0aCAoY29udGVudCBkZWNyeXB0ZWQpLlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdHxudWxsPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIHJldHVybiBkb2NzW3BhdGhdID8gZGVjcnlwdERvYyhkb2NzW3BhdGhdKSA6IG51bGw7XG59XG5cbi8qKlxuICogU2F2ZSBvciB1cGRhdGUgYSBkb2N1bWVudCBpbiB0aGUgbG9jYWwgY2FjaGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlRG9jdW1lbnRMb2NhbChwYXRoLCBjb250ZW50LCBzeW5jU3RhdHVzLCBldmVudElkID0gbnVsbCwgcmVsYXlDcmVhdGVkQXQgPSBudWxsKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBjb25zdCBleGlzdGluZyA9IGRvY3NbcGF0aF07XG4gICAgZG9jc1twYXRoXSA9IHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgY29udGVudDogYXdhaXQgd3JhcFNlY3JldChjb250ZW50KSwgLy8gVDAtNDogZW5jcnlwdCBub3RlIGJvZHkgYXQgcmVzdFxuICAgICAgICB1cGRhdGVkQXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxuICAgICAgICBzeW5jU3RhdHVzLFxuICAgICAgICBldmVudElkLFxuICAgICAgICByZWxheUNyZWF0ZWRBdCxcbiAgICAgICAgcHJvZmlsZVNjb3BlOiBleGlzdGluZz8ucHJvZmlsZVNjb3BlID8/IG51bGwsXG4gICAgfTtcbiAgICBhd2FpdCBzZXREb2NzKGRvY3MpO1xuICAgIHJldHVybiBkZWNyeXB0RG9jKGRvY3NbcGF0aF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhIGRvY3VtZW50IGZyb20gdGhlIGxvY2FsIGNhY2hlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlRG9jdW1lbnRMb2NhbChwYXRoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBkZWxldGUgZG9jc1twYXRoXTtcbiAgICBhd2FpdCBzZXREb2NzKGRvY3MpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIGRvY3VtZW50cyBzb3J0ZWQgYnkgdXBkYXRlZEF0IGRlc2NlbmRpbmcuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59IFNvcnRlZCBhcnJheSBvZiBkb2MgbWV0YWRhdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3REb2N1bWVudHMoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGRvYyBvZiBPYmplY3QudmFsdWVzKGRvY3MpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHREb2MoZG9jKSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT4gYi51cGRhdGVkQXQgLSBhLnVwZGF0ZWRBdCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzeW5jIHN0YXR1cyAoYW5kIG9wdGlvbmFsbHkgZXZlbnRJZC9yZWxheUNyZWF0ZWRBdCkgZm9yIGEgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTeW5jU3RhdHVzKHBhdGgsIHN0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgaWYgKCFkb2NzW3BhdGhdKSByZXR1cm4gbnVsbDtcbiAgICBkb2NzW3BhdGhdLnN5bmNTdGF0dXMgPSBzdGF0dXM7XG4gICAgaWYgKGV2ZW50SWQgIT09IG51bGwpIGRvY3NbcGF0aF0uZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBkb2NzW3BhdGhdLnJlbGF5Q3JlYXRlZEF0ID0gcmVsYXlDcmVhdGVkQXQ7XG4gICAgYXdhaXQgc2V0RG9jcyhkb2NzKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXTtcbn1cbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNDaXBoZXJ0ZXh0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBLZXlzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIHN5bmNlZFxuY29uc3QgRVhDTFVERURfS0VZUyA9IFtcbiAgICAnYnVua2VyU2Vzc2lvbnMnLFxuICAgICdpZ25vcmVJbnN0YWxsSG9vaycsXG4gICAgJ3Bhc3N3b3JkSGFzaCcsXG4gICAgJ3Bhc3N3b3JkU2FsdCcsXG5dO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIFAxX1BST0ZJTEVTOiAxLFxuICAgIFAyX1NFVFRJTkdTOiAyLFxuICAgIFAzX0FQSUtFWVM6IDMsXG4gICAgUDRfVkFVTFQ6IDQsXG59O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgc3luYyBwYXlsb2FkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBsb2NhbCBkYXRhIGFuZCBidWlsZCBhIHByaW9yaXRpc2VkIGxpc3Qgb2YgZW50cmllcyB0byBzeW5jLlxuICogUmV0dXJucyB7IGVudHJpZXM6IFt7IGtleSwganNvblN0cmluZywgcHJpb3JpdHksIHNpemUgfV0sIHRvdGFsU2l6ZSB9XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gVDAtNTogYSBzZWNyZXQgaXMgb25seSBldmVyIGVtaXR0ZWQgdG8gc3RvcmFnZS5zeW5jIChHb29nbGUvaUNsb3VkKSBpZiBpdFxuICAgIC8vIGlzIGFscmVhZHkgYW4gZW5jcnlwdGVkIGJsb2IuIEFueSB2YWx1ZSB0aGF0IGlzIE5PVCBjaXBoZXJ0ZXh0IGlzIHJlZnVzZWRcbiAgICAvLyAoZHJvcHBlZCkgc28gcGxhaW50ZXh0IHByaXZhdGUga2V5cyAvIEFQSSBzZWNyZXRzIC8gbm90ZXMgY2FuIG5ldmVyIGxlYXZlXG4gICAgLy8gdGhlIGRldmljZS4gYCcnYCAoZW1wdHkgLyBidW5rZXIpIGlzIGFsbG93ZWQgdGhyb3VnaCBhcyBub24tc2VjcmV0LlxuICAgIGNvbnN0IHNlY3JldE9rID0gdiA9PiAhdiB8fCBpc0NpcGhlcnRleHQodik7XG5cbiAgICAvLyBQMTogUHJvZmlsZXMgKHN0cmlwIGBob3N0c2AgdG8gc2F2ZSBzcGFjZSkgKyBwcm9maWxlSW5kZXggKyBlbmNyeXB0aW9uIHN0YXRlXG4gICAgaWYgKGFsbC5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBjbGVhblByb2ZpbGVzID0gYWxsLnByb2ZpbGVzLm1hcChwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaG9zdHMsIC4uLnJlc3QgfSA9IHA7XG4gICAgICAgICAgICBpZiAocmVzdC5wcml2S2V5ICYmICFzZWNyZXRPayhyZXN0LnByaXZLZXkpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHByaXZLZXkgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICByZXN0LnByaXZLZXkgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNsZWFuUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChhbGwucHJvZmlsZUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5wcm9maWxlSW5kZXgpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlSW5kZXgnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLmlzRW5jcnlwdGVkICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5pc0VuY3J5cHRlZCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2lzRW5jcnlwdGVkJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQMjogU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrIG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoYWxsW2tdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYWxsKSkge1xuICAgICAgICBpZiAoay5zdGFydHNXaXRoKCdmZWF0dXJlOicpKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFAzOiBBUEkga2V5IHZhdWx0IFx1MjAxNCBvbmx5IHN5bmMga2V5cyB3aG9zZSBzZWNyZXQgaXMgY2lwaGVydGV4dCAoVDAtNSlcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0ICYmIGFsbC5hcGlLZXlWYXVsdC5rZXlzKSB7XG4gICAgICAgIGNvbnN0IHNhZmVLZXlzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGFsbC5hcGlLZXlWYXVsdC5rZXlzKSkge1xuICAgICAgICAgICAgaWYgKHNlY3JldE9rKGtleS5zZWNyZXQpKSB7XG4gICAgICAgICAgICAgICAgc2FmZUtleXNbaWRdID0ga2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgQVBJIHNlY3JldCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYXVsdCA9IHsgLi4uYWxsLmFwaUtleVZhdWx0LCBrZXlzOiBzYWZlS2V5cyB9O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2FmZVZhdWx0KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnYXBpS2V5VmF1bHQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDNfQVBJS0VZUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDQ6IFZhdWx0IGRvY3MgKGluZGl2aWR1YWxseSwgbmV3ZXN0IGZpcnN0KSBcdTIwMTQgb25seSBpZiBjb250ZW50IGlzIGNpcGhlcnRleHRcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgaWYgKCFzZWNyZXRPayhkb2MuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgdmF1bHQgY29udGVudCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBzeW5jIHBheWxvYWQgcmVzcGVjdGluZyBidWRnZXRcbiAgICAgICAgbGV0IHVzZWRCeXRlcyA9IDA7XG4gICAgICAgIGxldCB1c2VkSXRlbXMgPSAwO1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBsZXQgYnVkZ2V0RXhoYXVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoYnVkZ2V0RXhoYXVzdGVkKSBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtWYWx1ZShlbnRyeS5rZXksIGVudHJ5Lmpzb25TdHJpbmcpO1xuICAgICAgICAgICAgbGV0IGVudHJ5U2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgZW50cnlTaXplICs9IGMua2V5Lmxlbmd0aCArICh0eXBlb2YgYy52YWx1ZSA9PT0gJ3N0cmluZycgPyBjLnZhbHVlLmxlbmd0aCA6IEpTT04uc3RyaW5naWZ5KGMudmFsdWUpLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VkQnl0ZXMgKyBlbnRyeVNpemUgPiBTWU5DX1FVT1RBIC0gNTAwIHx8IHVzZWRJdGVtcyArIGNodW5rcy5sZW5ndGggPiBNQVhfSVRFTVMgLSA1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LnByaW9yaXR5IDw9IFBSSU9SSVRZLlAzX0FQSUtFWVMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JpdGljYWwgZGF0YSBcdTIwMTQgdHJ5IGFueXdheSwgbGV0IHRoZSBBUEkgdGhyb3cgaWYgdHJ1bHkgb3ZlclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBCdWRnZXQgZXhoYXVzdGVkIGF0IHByaW9yaXR5ICR7ZW50cnkucHJpb3JpdHl9LCBza2lwcGluZyByZW1haW5pbmcgZW50cmllc2ApO1xuICAgICAgICAgICAgICAgICAgICBidWRnZXRFeGhhdXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBzeW5jUGF5bG9hZFtjLmtleV0gPSBjLnZhbHVlO1xuICAgICAgICAgICAgICAgIGFsbFN5bmNLZXlzLnB1c2goYy5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHN5bmMgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgbWV0YSA9IHtcbiAgICAgICAgICAgIGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBrZXlzOiBhbGxTeW5jS2V5cyxcbiAgICAgICAgfTtcbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeShtZXRhKTtcblxuICAgICAgICAvLyBXcml0ZSB0byBzeW5jIHN0b3JhZ2VcbiAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQoc3luY1BheWxvYWQpO1xuXG4gICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVhZCBleGlzdGluZyBzeW5jIGtleXMgYW5kIHJlbW92ZSBhbnkgbm90IGluIG91ciBwYXlsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgIGsgIT09IFNZTkNfTUVUQV9LRVkgJiYgIWFsbFN5bmNLZXlzLmluY2x1ZGVzKGspXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKG9ycGhhbktleXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIE5vbi1jcml0aWNhbCBjbGVhbnVwXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHthbGxTeW5jS2V5cy5sZW5ndGh9IGVudHJpZXMgKCR7dXNlZEJ5dGVzfSBieXRlcykgdG8gc3luYyBzdG9yYWdlYCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1c2hUb1N5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIC8vIExvY2FsIHN0b3JhZ2UgaXMgdW5hZmZlY3RlZCBcdTIwMTQgZ3JhY2VmdWwgZGVncmFkYXRpb25cbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVsbCBmcm9tIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGRhdGEgZnJvbSBzeW5jIHN0b3JhZ2UgYW5kIHJldHVybiBhcyBhIHBsYWluIG9iamVjdCB3aXRoXG4gKiByZWFzc2VtYmxlZCBjaHVua2VkIHZhbHVlcy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHVsbEZyb21TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgaWYgKCFyYXcgfHwgT2JqZWN0LmtleXMocmF3KS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGFTdHIgPSByYXdbU1lOQ19NRVRBX0tFWV07XG4gICAgICAgIGlmICghbWV0YVN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG1ldGE7XG4gICAgICAgIHRyeSB7IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFTdHIpOyB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgLy8gQ29sbGVjdCB0aGUgbm9uLWNodW5rLCBub24tbWV0YSBrZXlzXG4gICAgICAgIGNvbnN0IGRhdGFLZXlzID0gbWV0YS5rZXlzLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoQ0hVTktfUFJFRklYKSAmJiBrICE9PSBTWU5DX01FVEFfS0VZKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgcmF3KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5fc3luY01ldGEgPSBtZXRhO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdWxsRnJvbVN5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXJnZSBsb2dpY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogTWVyZ2Ugc3luYyBkYXRhIGludG8gbG9jYWwgc3RvcmFnZSB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbG9jYWwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIC8vIERldGVjdCBmcmVzaCBpbnN0YWxsOiBubyBwcm9maWxlcywgb3IgYSBzaW5nbGUgdW50b3VjaGVkIGRlZmF1bHQgcHJvZmlsZS5cbiAgICAvLyAoRGVmYXVsdCBrZXlzIGFyZSBub3cgd3JhcHBlZCBhdCByZXN0LCBzbyBgcHJpdktleWAgaXMgdHJ1dGh5IGV2ZW4gb24gYVxuICAgIC8vIGZyZXNoIGluc3RhbGwgXHUyMDE0IGRldGVjdCB0aGUgdW50b3VjaGVkIGRlZmF1bHQgYnkgaXRzIG5hbWUgKyBhYnNlbmNlIG9mIGFueVxuICAgIC8vIHBlci1zaXRlIGdyYW50cyBpbnN0ZWFkLilcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkpIHx8XG4gICAgICAgIChsb25lICYmIGxvbmUubmFtZSA9PT0gJ0RlZmF1bHQgTm9zdHIgUHJvZmlsZScgJiZcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGxvbmUuaG9zdHMgfHwge30pLmxlbmd0aCA9PT0gMCk7XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGluc3RhbGwgXHUyMDE0IGFkb3B0IHN5bmMgcHJvZmlsZXMgZW50aXJlbHlcbiAgICAgICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcztcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAvLyBQZXItaW5kZXggdXBkYXRlZEF0IGNvbXBhcmlzb24gXHUyMDE0IG5ld2VyIHdpbnMsIGxvY2FsIHdpbnMgdGllc1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gWy4uLmxvY2FsLnByb2ZpbGVzXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3luY0RhdGEucHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzeW5jUHJvZmlsZSA9IHN5bmNEYXRhLnByb2ZpbGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChpID49IG1lcmdlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHByb2ZpbGUgZnJvbSBzeW5jXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZC5wdXNoKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzeW5jVGltZSA9IHN5bmNQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFRpbWUgPSBsb2NhbFByb2ZpbGUudXBkYXRlZEF0IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW5jVGltZSA+IGxvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgbWVyZ2UgYnV0IHByZXNlcnZlIGxvY2FsIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSB7IC4uLnN5bmNQcm9maWxlLCBob3N0czogbG9jYWxQcm9maWxlLmhvc3RzIHx8IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB1cGRhdGVzLnByb2ZpbGVzID0gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGUgaW5kZXggKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZUluZGV4ICE9IG51bGwgJiYgaXNGcmVzaCkge1xuICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleDtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSBcdTIwMTQgbmV2ZXIgZG93bmdyYWRlIC0tLVxuICAgIGlmIChzeW5jRGF0YS5pc0VuY3J5cHRlZCA9PT0gdHJ1ZSAmJiAhbG9jYWwuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgdXBkYXRlcy5pc0VuY3J5cHRlZCA9IHRydWU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc3luY01ldGEgPSBzeW5jRGF0YS5fc3luY01ldGEgfHwge307XG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBoaWdoZXJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIHN5bmNEYXRhLnZlcnNpb24gPD0gbG9jYWwudmVyc2lvbikgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEFQSSBLZXkgVmF1bHQgKFAzKSAtLS1cbiAgICBpZiAoc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgaWYgKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1lcmdlIGluZGl2aWR1YWwga2V5cyBieSB1cGRhdGVkQXRcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IGxvY2FsLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBzeW5jS2V5cyA9IHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLmxvY2FsS2V5cyB9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIHN5bmNLZXldIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNLZXlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5ID0gbWVyZ2VkW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsS2V5IHx8IChzeW5jS2V5LnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbEtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2lkXSA9IHN5bmNLZXk7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4ubG9jYWwuYXBpS2V5VmF1bHQsIGtleXM6IG1lcmdlZCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCBsb2NhbERvY3MgPSBsb2NhbC52YXVsdERvY3MgfHwge307XG4gICAgbGV0IGRvY3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgbWVyZ2VkRG9jcyA9IHsgLi4ubG9jYWxEb2NzIH07XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbG9jYWxEb2MgPSBtZXJnZWREb2NzW2RvYy5wYXRoXTtcbiAgICAgICAgaWYgKCFsb2NhbERvYyB8fCAoZG9jLnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbERvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgIG1lcmdlZERvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgICAgICAgICAgZG9jc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBTZWNyZXQgVmF1bHQgXHUyMDE0IGF0LXJlc3QgZW5jcnlwdGlvbiBmb3IgcHJpdmF0ZSBrZXlzIGFuZCBhcHBsaWNhdGlvbiBzZWNyZXRzLlxuICpcbiAqIFRocmVhdCBtb2RlbCAoVDAtNCk6IHJhdyBzZWNyZXQgYnl0ZXMgbXVzdCBuZXZlciBzaXQgaW4gYnJvd3NlciBzdG9yYWdlIGluXG4gKiBjbGVhcnRleHQsIGV2ZW4gZm9yIHRoZSBERUZBVUxUIHBhc3N3b3JkbGVzcyB1c2VyLiBUaGlzIG1vZHVsZSBwcm92aWRlcyB0d29cbiAqIHdyYXBwaW5nIHN0cmF0ZWdpZXMgYmVoaW5kIG9uZSBgd3JhcFNlY3JldGAgLyBgdW53cmFwU2VjcmV0YCBpbnRlcmZhY2U6XG4gKlxuICogICAxLiBERVZJQ0UgS0VZIChkZWZhdWx0LCBubyBtYXN0ZXIgcGFzc3dvcmQpIFx1MjAxNCBhIG5vbi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTVxuICogICAgICBDcnlwdG9LZXkuIFRocmVlIHBlcnNpc3RlbmNlIHN0cmF0ZWdpZXMgZXhpc3QsIGFuZCBlYWNoIGlzIFZFUklGSUVEXG4gKiAgICAgIChyZWFkIGJhY2sgYW5kIHJvdW5kLXRyaXBwZWQgdGhyb3VnaCBlbmNyeXB0L2RlY3J5cHQpIGJlZm9yZSBpdCBpc1xuICogICAgICB0cnVzdGVkOlxuICpcbiAqICAgICAgICBhLiBgaWRiYCAgICBcdTIwMTQgYSBDcnlwdG9LZXkgKmhhbmRsZSogaW4gSW5kZXhlZERCLiBPbmx5IGV2ZXIgQURPUFRFRCxcbiAqICAgICAgICAgICAgICAgICAgICAgIG5ldmVyIG1pbnRlZDogd2UgdHJ1c3QgYGlkYmAgZXhjbHVzaXZlbHkgd2hlbiBkYi5nZXQoKVxuICogICAgICAgICAgICAgICAgICAgICAgaGFuZHMgYmFjayBhIFBSRS1FWElTVElORyBrZXkgdGhhdCByb3VuZC10cmlwcywgYmVjYXVzZVxuICogICAgICAgICAgICAgICAgICAgICAgdGhhdCBcdTIwMTQgYW5kIG9ubHkgdGhhdCBcdTIwMTQgcHJvdmVzIHRoZSBoYW5kbGUgc3Vydml2ZWQgYVxuICogICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMgY29udGV4dC4gQSBzYW1lLWNvbnRleHQgcHV0XHUyMTkyZ2V0IHByb2JlIGNhbm5vdFxuICogICAgICAgICAgICAgICAgICAgICAgcHJvdmUgY3Jvc3MtY29udGV4dCBwZXJzaXN0ZW5jZS4gS2VlcGluZyB0aGUgYWRvcHQgcGF0aFxuICogICAgICAgICAgICAgICAgICAgICAgcHJlc2VydmVzIGV2ZXJ5IENocm9tZS9GaXJlZm94IHZhdWx0IHdyaXR0ZW4gYmVmb3JlXG4gKiAgICAgICAgICAgICAgICAgICAgICAxLjguMSwgd2hvc2UgYmxvYnMgbGl2ZSB1bmRlciB0aGlzIGtleS5cbiAqICAgICAgICAgICAgICAgICAgICAgICoqTkVWRVIgdXNlZCBhcyB0aGUgd3JhcHBpbmcga2V5IG9uIFNhZmFyaS4qKiBEZXZpY2VcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvcmVuc2ljcyBvbiBpUGFkT1MgMjYuMiAoMjAyNi0wOC0wNykgZm91bmQgdHdvXG4gKiAgICAgICAgICAgICAgICAgICAgICBJbmRleGVkREIgb3JpZ2luIGRpcmVjdG9yaWVzIGZvciBvbmUgZXh0ZW5zaW9uOiBXZWJLaXRcbiAqICAgICAgICAgICAgICAgICAgICAgIHNjb3BlcyBleHRlbnNpb24gSW5kZXhlZERCIGJ5IHRoZSBwZXItaW5zdGFsbFxuICogICAgICAgICAgICAgICAgICAgICAgYHNhZmFyaS13ZWItZXh0ZW5zaW9uOi8vPHV1aWQ+YCBPUklHSU4sIHdoaWNoIHJvdGF0ZXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGFjcm9zcyAocmUpaW5zdGFsbHMsIHdoaWxlIGBzdG9yYWdlLmxvY2FsYCBpcyBzY29wZWQgYnlcbiAqICAgICAgICAgICAgICAgICAgICAgIEJVTkRMRSBJRCBhbmQgc3Vydml2ZXMuIFNvIG9uIFNhZmFyaSBhIHZhdWx0IGNhbiBrZWVwXG4gKiAgICAgICAgICAgICAgICAgICAgICBpdHMgZGF0YSBhbmQgbG9zZSBpdHMgd3JhcHBpbmcga2V5IFx1MjAxNCB0aGUgZXhhY3QgMS44LjBcbiAqICAgICAgICAgICAgICAgICAgICAgIGRhdGEtbG9zcyBzaGFwZS4gU2FmYXJpIHRoZXJlZm9yZSBhbHdheXMgd3JpdGVzIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgc2VlZGA7IGFkb3B0ZWQgSURCIGtleXMgYXJlIGRlY3J5cHQtb25seSBsZWdhY3kgdGhlcmUsXG4gKiAgICAgICAgICAgICAgICAgICAgICBhbmQgdGhlIGF0LXJlc3QgbWlncmF0aW9uIHJlLXdyYXBzIEVWRVJZIGRldmljZSBibG9iIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uIHN0b3JlcyBcdTIwMTQgcHJvZmlsZSBwcml2YXRlIGtleXMsIEFQSS1rZXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMsIHZhdWx0LW5vdGUgYm9kaWVzLCBhbmQgTklQLTQ2IGJ1bmtlciBzZXNzaW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzIC8gc2Vzc2lvbiBwcml2YXRlIGtleXMgXHUyMDE0IG5vdCBqdXN0IHByb2ZpbGUga2V5cy5cbiAqICAgICAgICBiLiBgc2VlZGAgICBcdTIwMTQgMzIgcmFuZG9tIGJ5dGVzIGluIGBicm93c2VyLnN0b3JhZ2UubG9jYWxgIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgZGV2aWNlS2V5U2VlZGAsIGltcG9ydGVkIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ01cbiAqICAgICAgICAgICAgICAgICAgICAgIGtleSBhdCBsb2FkLiBUaGlzIGlzIHdoZXJlIEVWRVJZIG5ldyBkZXZpY2Uga2V5IGxhbmRzLFxuICogICAgICAgICAgICAgICAgICAgICAgb24gZXZlcnkgcGxhdGZvcm06IHdoZW4gbm8gcHJlLWV4aXN0aW5nIElEQiBrZXkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIHdlIGRvIG5vdCBtaW50IG9uZSwgd2Ugc2VlZC4gQ2hyb21lL0ZpcmVmb3ggZnJlc2hcbiAqICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxzIHRoZXJlZm9yZSB1c2UgYHNlZWRgIHRvbyBcdTIwMTQgb25lIGNvZGUgcGF0aCwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgb25seSBvbmUgd2hvc2UgcGVyc2lzdGVuY2Ugd2UgY2FuIGFjdHVhbGx5IHZlcmlmeS5cbiAqICAgICAgICBjLiBgbWVtb3J5YCBcdTIwMTQgbGFzdCByZXNvcnQgKHVuaXQgdGVzdHMsIHNhbmRib3hlZCBjb250ZXh0cykuIFNlY3JldHNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZWQgaGVyZSBkbyBub3Qgc3Vydml2ZSBhIHJlbG9hZC5cbiAqXG4gKiAgICAgIFRoZSByZXNvbHZlZCBzdHJhdGVneSBpcyBTVElDS1k6IGl0IGlzIHJlY29yZGVkIGluIHN0b3JhZ2UubG9jYWwgdW5kZXJcbiAqICAgICAgYGRldmljZUtleVN0cmF0ZWd5YCBhbmQgaG9ub3VyZWQgb24gbGF0ZXIgbG9hZHMsIHNvIGEgY29udGV4dCBjYW5ub3RcbiAqICAgICAgc2lsZW50bHkgZmxpcCBzdHJhdGVnaWVzIGFuZCBvcnBoYW4gdGhlIGJsb2JzIHdyaXR0ZW4gdW5kZXIgdGhlIG9sZFxuICogICAgICBvbmUuIERlY3J5cHRpb24gaXMgc3ltbWV0cmljIHJlZ2FyZGxlc3M6IGBkZWNyeXB0V2l0aERldmljZUtleWAgdHJpZXNcbiAqICAgICAgdGhlIGN1cnJlbnQga2V5LCB0aGVuIGV2ZXJ5IG90aGVyIGtleSB0aGlzIGluc3RhbGwgY291bGQgZXZlciBoYXZlIGhhZFxuICogICAgICAobGVnYWN5IElEQiBoYW5kbGUsIGV4aXN0aW5nIHNlZWQpLCBhbmQgY2FsbGVycyB1c2luZ1xuICogICAgICBgZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXBgIHJlLXdyYXAgdW5kZXIgdGhlIGN1cnJlbnQgc3RyYXRlZ3kuXG4gKlxuICogICAgICBUaHJlYXQgbW9kZWwsIGhvbmVzdGx5IHN0YXRlZDogdGhlIGBzZWVkYCBzdHJhdGVneSBwcm90ZWN0cyBhZ2FpbnN0XG4gKiAgICAgIGNhc3VhbCBpbnNwZWN0aW9uIG9mIGV4dGVuc2lvbiBzdG9yYWdlIG9uIGRpc2ssIE5PVCBhZ2FpbnN0IGFuIGF0dGFja2VyXG4gKiAgICAgIHdobyBhbHJlYWR5IGV4ZWN1dGVzIGluIHRoaXMgZXh0ZW5zaW9uJ3MgY29udGV4dCBcdTIwMTQgc3VjaCBhbiBhdHRhY2tlciBjYW5cbiAqICAgICAgcmVhZCB0aGUgc2VlZCBqdXN0IGFzIGl0IGNhbiByZWFkIGEgQ3J5cHRvS2V5IGhhbmRsZSdzIHBsYWludGV4dCBvdXRwdXQuXG4gKiAgICAgIEFuZCBvbiBTYWZhcmksIHdoZXJlIGBzZWVkYCBpcyB0aGUgT05MWSBzdHJhdGVneSwgdGhlIHNlZWQgYW5kIHRoZVxuICogICAgICBjaXBoZXJ0ZXh0IGl0IG9wZW5zIGxpdmUgc2lkZSBieSBzaWRlIGluIG9uZSBidW5kbGUtc2NvcGVkXG4gKiAgICAgIGBzdG9yYWdlLmxvY2FsYCBmaWxlIHRoYXQgaXMgc3dlcHQgaW50byBkZXZpY2UgYmFja3VwcyBcdTIwMTQgc28gdGhlXG4gKiAgICAgIHBhc3N3b3JkbGVzcyBkZXZpY2UgdGllciB0aGVyZSBpcyBvYmZ1c2NhdGlvbiwgbm90IHByb3RlY3Rpb24sIGFnYWluc3RcbiAqICAgICAgYW4gYXR0YWNrZXIgaG9sZGluZyB0aGF0IGZpbGUgb3IgYSBiYWNrdXAgZXh0cmFjdGVkIGZyb20gaXQuIEFcbiAqICAgICAgS2V5Y2hhaW4tYmFja2VkIGtleSBoYW5kZWQgaW4gYnkgdGhlIG5hdGl2ZSBjb250YWluZXIgaXMgdGhlIHJlYWwgZml4XG4gKiAgICAgIChmdXR1cmUgd29yayk7IGEgbWFzdGVyIHBhc3N3b3JkIGlzIHRoZSBkZWZlbmNlIGF2YWlsYWJsZSB0b2RheS5cbiAqXG4gKiAgIDIuIFNFU1NJT04gS0VZIChtYXN0ZXIgcGFzc3dvcmQgc2V0ICsgdW5sb2NrZWQpIFx1MjAxNCB0aGUgQUVTLTI1Ni1HQ00ga2V5XG4gKiAgICAgIGRlcml2ZWQgZnJvbSB0aGUgcGFzc3dvcmQgKHNlZSBjcnlwdG8uanMpLiBTZXQgYnkgdGhlIGJhY2tncm91bmQgd29ya2VyXG4gKiAgICAgIG9uIHVubG9jayB2aWEgYHNldFNlc3Npb25LZXlgLCBjbGVhcmVkIG9uIGxvY2sgdmlhIGBjbGVhclNlc3Npb25gLlxuICpcbiAqIEJsb2IgZm9ybWF0cyAoYm90aCBhcmUgc2VsZi1kZXNjcmliaW5nIEpTT04gc3RyaW5ncyk6XG4gKiAgIHBhc3N3b3JkIGJsb2IgOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqICAgZGV2aWNlICBibG9iIDogeyB2OjEsIGs6XCJkZXZpY2VcIiwgaXYsIGNpcGhlcnRleHQgfVxuICpcbiAqIGB1bndyYXBTZWNyZXRgIHJlZnVzZXMgdG8gZGVjcnlwdCB3aGVuIHRoZSBzZXNzaW9uIGhhcyBiZWVuIGV4cGxpY2l0bHkgbG9ja2VkXG4gKiAoRjUvRjYpIHNvIGEgbG9ja2VkIHBhZ2UgY2Fubm90IHJlYWQgc2VjcmV0cy5cbiAqL1xuXG5pbXBvcnQgeyBlbmNyeXB0V2l0aEtleSwgZGVjcnlwdFdpdGhLZXkgfSBmcm9tICcuL2NyeXB0byc7XG5cbmNvbnN0IElWX0JZVEVTID0gMTI7XG5jb25zdCBERVZJQ0VfREIgPSAnbm9zdHJrZXktc2VjcmV0LXZhdWx0JztcbmNvbnN0IERFVklDRV9TVE9SRSA9ICdrZXlzJztcbmNvbnN0IERFVklDRV9LRVlfSUQgPSAnZGV2aWNlLXdyYXAta2V5LXYxJztcbi8vIHN0b3JhZ2UubG9jYWwga2V5IGhvbGRpbmcgdGhlIGJhc2U2NCByYXcgc2VlZCBmb3IgdGhlIGBzZWVkYCBzdHJhdGVneS5cbmNvbnN0IERFVklDRV9TRUVEX0tFWSA9ICdkZXZpY2VLZXlTZWVkJztcbmNvbnN0IERFVklDRV9TRUVEX0JZVEVTID0gMzI7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBTVElDS1kgcmVzb2x2ZWQgc3RyYXRlZ3kgKCdpZGInIHwgJ3NlZWQnKS5cbmNvbnN0IERFVklDRV9TVFJBVEVHWV9LRVkgPSAnZGV2aWNlS2V5U3RyYXRlZ3knO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgKGtlcHQgbG9jYWwgc28gdGhpcyBtb2R1bGUgaGFzIG5vIGNyb3NzLWRlcHMpIC0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gYWJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VG9BYihiNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gU2Vzc2lvbiAocGFzc3dvcmQtZGVyaXZlZCkga2V5IHN0YXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9zZXNzaW9uS2V5ID0gbnVsbDsgICAvLyBDcnlwdG9LZXkgfCBudWxsXG5sZXQgX3Nlc3Npb25TYWx0ID0gbnVsbDsgIC8vIFVpbnQ4QXJyYXkgfCBudWxsXG4vLyBfdW5sb2NrZWQ6IG51bGwgPSBwYXNzd29yZGxlc3MgLyBub3QgYXBwbGljYWJsZSAobmV2ZXIgbG9ja2VkKSxcbi8vICAgICAgICAgICAgdHJ1ZSA9IHVubG9ja2VkLCBmYWxzZSA9IGxvY2tlZCAocmVmdXNlIHNlY3JldCByZWFkcykuXG5sZXQgX3VubG9ja2VkID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlc3Npb25LZXkoY3J5cHRvS2V5LCBzYWx0KSB7XG4gICAgX3Nlc3Npb25LZXkgPSBjcnlwdG9LZXk7XG4gICAgX3Nlc3Npb25TYWx0ID0gc2FsdDtcbiAgICBfdW5sb2NrZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuICAgIF9zZXNzaW9uS2V5ID0gbnVsbDtcbiAgICBfc2Vzc2lvblNhbHQgPSBudWxsO1xuICAgIF91bmxvY2tlZCA9IGZhbHNlO1xufVxuXG4vKiogRXhwbGljaXRseSBtYXJrIHRoZSBzZXNzaW9uIHVubG9ja2VkL2xvY2tlZCB3aXRob3V0IHByb3ZpZGluZyBhIGtleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVbmxvY2tlZCh2KSB7XG4gICAgX3VubG9ja2VkID0gdiA9PT0gbnVsbCA/IG51bGwgOiAhIXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZXNzaW9uS2V5KCkge1xuICAgIHJldHVybiAhIV9zZXNzaW9uS2V5O1xufVxuXG4vLyAtLS0gRGV2aWNlIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbmxldCBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsOyAgIC8vICdpZGInIHwgJ3NlZWQnIHwgJ21lbW9yeScgXHUyMDE0IHNldCBvbmNlIHJlc29sdmVkXG5sZXQgX21lbW9yeURldmljZUtleSA9IG51bGw7ICAvLyBsYXN0LXJlc29ydCBrZXkgZm9yIGNvbnRleHRzIHRoYXQgcGVyc2lzdCBub3RoaW5nXG5sZXQgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsOyAvLyByZWFkLW9ubHkgaGFuZGxlIG9uIHRoZSBwcmUtMS44LjEgSURCIGtleVxubGV0IF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiBhbiBleGlzdGluZyBzZWVkIGtleVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURldmljZUtleSgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGU6IHJhdyBieXRlcyBjYW4gbmV2ZXIgYmUgcmVhZCBiYWNrIG91dFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWREYkF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5kZXhlZERCICE9PSBudWxsO1xufVxuXG4vKipcbiAqIFByb3ZlIGEgY2FuZGlkYXRlIGtleSBpcyBhY3R1YWxseSB1c2FibGUgYmVmb3JlIHdlIHRydXN0IGEgc3RyYXRlZ3kgd2l0aCBhXG4gKiB1c2VyJ3Mgb25seSBjb3B5IG9mIGEgcHJpdmF0ZSBrZXkuIEEgcmVhZC1iYWNrIGhhbmRsZSB0aGF0IHN0cnVjdHVyZWQtY2xvbmVcbiAqIG1hbmdsZWQgKG9yIGEgc2VlZCB0aGF0IGNhbWUgYmFjayB0cnVuY2F0ZWQpIGZhaWxzIGhlcmUgaW5zdGVhZCBvZiBzaWxlbnRseVxuICogcHJvZHVjaW5nIHVuZGVjcnlwdGFibGUgYmxvYnMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGtleVJvdW5kVHJpcHMoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICAgICAgY29uc3QgcHJvYmUgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ25vc3Rya2V5LWRldmljZS1wcm9iZScpO1xuICAgICAgICBjb25zdCBjdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBwcm9iZSk7XG4gICAgICAgIGNvbnN0IHB0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGN0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwdCkgPT09ICdub3N0cmtleS1kZXZpY2UtcHJvYmUnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBvcGVuRGV2aWNlRGIoKSB7XG4gICAgLy8gTGF6eSBpbXBvcnQgc28gdGhlIG1vZHVsZSB3b3JrcyBpbiBjb250ZXh0cy90ZXN0cyB3aXRob3V0IGlkYiBidW5kbGVkLlxuICAgIGNvbnN0IHsgb3BlbkRCIH0gPSBhd2FpdCBpbXBvcnQoJ2lkYicpO1xuICAgIHJldHVybiBvcGVuREIoREVWSUNFX0RCLCAxLCB7XG4gICAgICAgIHVwZ3JhZGUoZCkge1xuICAgICAgICAgICAgaWYgKCFkLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREVWSUNFX1NUT1JFKSkge1xuICAgICAgICAgICAgICAgIGQuY3JlYXRlT2JqZWN0U3RvcmUoREVWSUNFX1NUT1JFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTdHJhdGVneSAoYSk6IEFET1BUIGEgcHJlLWV4aXN0aW5nIG5vbi1leHRyYWN0YWJsZSBDcnlwdG9LZXkgaGFuZGxlIGZyb21cbiAqIEluZGV4ZWREQi4gTmV2ZXIgbWludHMgb25lLlxuICpcbiAqIEEga2V5IHRoYXQgZGIuZ2V0KCkgaGFuZHMgYmFjayBpcyBhIGtleSBzb21lIEVBUkxJRVIgY29udGV4dCB3cm90ZSwgc28gaXQgaXNcbiAqIHByb29mIG9mIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UgXHUyMDE0IHRoZSBvbmUgdGhpbmcgYSBzYW1lLWNvbnRleHRcbiAqIHB1dFx1MjE5MmdldFx1MjE5MnJvdW5kLXRyaXAgcHJvYmUgY2FuIG5ldmVyIGVzdGFibGlzaC4gaU9TIFNhZmFyaSdzIEluZGV4ZWREQiBpc1xuICogZnVuY3Rpb25hbCBidXQgZXBoZW1lcmFsIGZvciB0aGUgZXh0ZW5zaW9uIGJhY2tncm91bmQ6IGl0IHdvdWxkIGhhdmUgcGFzc2VkXG4gKiB0aGUgcHJvYmUgYW5kIHRoZW4gbG9zdCB0aGUgdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBTbzogbm9cbiAqIHByZS1leGlzdGluZyBrZXkgbWVhbnMgbm8gYGlkYmAsIGFuZCB0aGUgY2FsbGVyIHNlZWRzIGluc3RlYWQuXG4gKlxuICogUmV0dXJucyBudWxsIChuZXZlciB0aHJvd3MpIHdoZW4gbm90aGluZyB1c2FibGUgaXMgdGhlcmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeUlkYkRldmljZUtleSgpIHtcbiAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nKSByZXR1cm4gbnVsbDsgLy8gZW1wdHkgc3RvcmUgXHUyMTkyIHNlZWQsIGRvIE5PVCBtaW50IGhlcmVcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGV4aXN0aW5nKSkgPyBleGlzdGluZyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgc3RvcmFnZSBhcmVhIGJhY2tpbmcgdGhlIGBzZWVkYCBzdHJhdGVneS4gSW1wb3J0ZWQgbGF6aWx5IGJlY2F1c2VcbiAqIGJyb3dzZXItcG9seWZpbGwgdGhyb3dzIGF0IG1vZHVsZSBsb2FkIHdoZW4gbm8gZXh0ZW5zaW9uIG5hbWVzcGFjZSBleGlzdHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlZWRTdG9yYWdlKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICByZXR1cm4gYXBpPy5zdG9yYWdlPy5sb2NhbCB8fCBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBTaWduYWwgMjogYSBXZWJLaXQgdXNlciBhZ2VudCB3aXRoIG5vIENocm9taXVtIG1hcmtlciBvbiBpdC4gKi9cbmZ1bmN0aW9uIGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB1YSA9ICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50KSB8fCAnJztcbiAgICAgICAgcmV0dXJuIC9TYWZhcml8QXBwbGVXZWJLaXQvLnRlc3QodWEpICYmICEvQ2hyb20oZXxpdW0pfEVkZ1xcL3xPUFJcXC8vLnRlc3QodWEpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFRydWUgb24gU2FmYXJpIChpT1MgKyBtYWNPUyksIHdoZXJlIEluZGV4ZWREQiBtdXN0IE5FVkVSIGhvbGQgdGhlIHdyYXBwaW5nXG4gKiBrZXkgXHUyMDE0IHNlZSB0aGUgbW9kdWxlIGhlYWRlcidzIHN0b3JhZ2Utc2NvcGUgbm90ZS5cbiAqXG4gKiBEZXRlY3Rpb24gaXMgbXVsdGktc2lnbmFsIGFuZCBCSUFTRUQgVE9XQVJEIFNBRkFSSSwgYmVjYXVzZSB0aGUgdHdvIGVycm9yc1xuICogYXJlIG5vdCBzeW1tZXRyaWM6IHNlZWRpbmcgYSBDaHJvbWUgdmF1bHQgY29zdHMgbm90aGluZyAoc2VlZCBpcyBhbHJlYWR5IHRoZVxuICogc3RyYXRlZ3kgZXZlcnkgZnJlc2ggaW5zdGFsbCBsYW5kcyBvbiksIHdoaWxlIElEQi13cmFwcGluZyBhIFNhZmFyaSB2YXVsdCBpc1xuICogdGhlIDEuOC4wIGRhdGEtbG9zcyBidWcuIFNvIG9ubHkgYSBQT1NJVElWRUxZIGlkZW50aWZpZWQgQ2hyb21lL0ZpcmVmb3hcbiAqIG9yaWdpbiBtYXkgYWRvcHQgYW4gSW5kZXhlZERCIGtleSBcdTIwMTQgYSBnZXRVUkwgdGhhdCBpcyBtaXNzaW5nLCB0aHJvd3MsIHJldHVybnNcbiAqIGEgbm9uLXN0cmluZywgcmV0dXJucyAnJyBvciByZXR1cm5zIGEgc2NoZW1lIHdlIGRvIG5vdCByZWNvZ25pc2UgYWxsIHJlc29sdmVcbiAqIHRvIFNhZmFyaS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNTYWZhcmlFbmdpbmUoKSB7XG4gICAgbGV0IG9yaWdpbiA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaT8ucnVudGltZT8uZ2V0VVJMPy4oJycpO1xuICAgICAgICBvcmlnaW4gPSB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgfVxuICAgIC8vIFNpZ25hbCAxOiBhIHBvc2l0aXZlbHkgaWRlbnRpZmllZCBTYWZhcmkgb3JpZ2luLlxuICAgIGlmIChvcmlnaW4gJiYgb3JpZ2luLnN0YXJ0c1dpdGgoJ3NhZmFyaS13ZWItZXh0ZW5zaW9uOi8vJykpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAyOiBhIFdlYktpdC1vbmx5IFVBIG91dHJhbmtzIHRoZSBvcmlnaW4gXHUyMDE0IGEgU2FmYXJpIGJ1aWxkIHRoYXRcbiAgICAvLyByZXBvcnRlZCBhbiB1bmV4cGVjdGVkIG9yaWdpbiBzdGlsbCBtdXN0IG5vdCB0b3VjaCBJbmRleGVkREIuXG4gICAgaWYgKGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMzogb25seSB0aGVzZSB0d28gb3JpZ2lucyBlYXJuIHRoZSBJREIgYWRvcHQgcGF0aC5cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW4uc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8IG9yaWdpbi5zdGFydHNXaXRoKCdtb3otZXh0ZW5zaW9uOi8vJykpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7IC8vIGFtYmlndW91cyBcdTIxOTIgc2VlZFxufVxuXG4vKiogSW1wb3J0IHJhdyBzZWVkIGJ5dGVzIChiYXNlNjQpIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ00ga2V5LiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1wb3J0U2VlZEtleShzZWVkQjY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JywgYmFzZTY0VG9BYihzZWVkQjY0KSwgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZSBvbmNlIGltcG9ydGVkXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuLyoqIFJlYWQgdGhlIHN0aWNreSBzdHJhdGVneSByZWNvcmRlZCBieSBhIHByZXZpb3VzIHJlc29sdXRpb24gKG51bGwgaWYgbm9uZSkuICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3RpY2t5U3RyYXRlZ3koKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgcyA9IGdvdD8uW0RFVklDRV9TVFJBVEVHWV9LRVldO1xuICAgICAgICByZXR1cm4gKHMgPT09ICdpZGInIHx8IHMgPT09ICdzZWVkJykgPyBzIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogUmVjb3JkIHRoZSByZXNvbHZlZCBzdHJhdGVneSBzbyBsYXRlciBsb2FkcyBjYW5ub3Qgc2lsZW50bHkgZmxpcCBpdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlU3RpY2t5U3RyYXRlZ3koc3RyYXRlZ3kpIHtcbiAgICBpZiAoc3RyYXRlZ3kgIT09ICdpZGInICYmIHN0cmF0ZWd5ICE9PSAnc2VlZCcpIHJldHVybjsgLy8gJ21lbW9yeScgcGVyc2lzdHMgbm90aGluZ1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBzdHJhdGVneSB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmVzdCBlZmZvcnQgXHUyMDE0IHRoZSBzdHJhdGVneSBzdGlsbCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgKi8gfVxufVxuXG4vKiogU3RyYXRlZ3kgKGIpOiBhIHJhdyByYW5kb20gc2VlZCBpbiBzdG9yYWdlLmxvY2FsLCBpbXBvcnRlZCBub24tZXh0cmFjdGFibGUuICovXG5hc3luYyBmdW5jdGlvbiB0cnlTZWVkRGV2aWNlS2V5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgbGV0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgICAgIHNlZWQgPSBhYlRvQmFzZTY0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoREVWSUNFX1NFRURfQllURVMpKS5idWZmZXIpO1xuICAgICAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IHNlZWQgfSk7XG4gICAgICAgICAgICAvLyBWRVJJRlkgcGVyc2lzdGVuY2UgYmVmb3JlIGFueXRoaW5nIGlzIHdyYXBwZWQgdW5kZXIgaXQuXG4gICAgICAgICAgICBjb25zdCBjaGVjayA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3QgcGVyc2lzdGVkID0gY2hlY2s/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKHBlcnNpc3RlZCAhPT0gc2VlZCkge1xuICAgICAgICAgICAgICAgIC8vIEFub3RoZXIgY29udGV4dCAocG9wdXAgdnMgYmFja2dyb3VuZCBvbiBhIGZpcnN0IHJ1bikgbWludGVkXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdyb3RlIGl0cyBvd24gc2VlZCBiZXR3ZWVuIG91ciBzZXQoKSBhbmQgdGhpcyByZWFkLiBBRE9QVFxuICAgICAgICAgICAgICAgIC8vIFRIRSBXSU5ORVI6IGFueSBzZWVkIGFjdHVhbGx5IGluIHN0b3JhZ2UgaXMgZXhhY3RseSBhcyBnb29kIGFzXG4gICAgICAgICAgICAgICAgLy8gb3VycywgYW5kIGl0IGlzIHRoZSBvbmUgdGhlIG90aGVyIGNvbnRleHQgaXMgYWxyZWFkeSB3cmFwcGluZ1xuICAgICAgICAgICAgICAgIC8vIHVuZGVyLiBSZXR1cm5pbmcgbnVsbCBoZXJlIHdvdWxkIGRyb3AgdGhlIGNhbGxlciB0aHJvdWdoIHRvXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbW9yeSBrZXksIHdob3NlIGJsb2JzIGRpZSB3aXRoIHRoaXMgY29udGV4dCBcdTIwMTQgdGhlIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBsb3NzIHRoaXMgc3RyYXRlZ3kgZXhpc3RzIHRvIHByZXZlbnQuIE9ubHkgYSBnZW51aW5lbHkgYWJzZW50XG4gICAgICAgICAgICAgICAgLy8gb3IgdW51c2FibGUgdmFsdWUgaXMgYSBmYWlsdXJlLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGVyc2lzdGVkICE9PSAnc3RyaW5nJyB8fCBwZXJzaXN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWVkID0gcGVyc2lzdGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgKGNyZWF0aW5nIG9uIGZpcnN0IHVzZSkgdGhlIGRldmljZSB3cmFwIGtleS5cbiAqXG4gKiBSZXNvbHV0aW9uIG9yZGVyLCBvbmNlOiBob25vdXIgdGhlIHN0aWNreSBzdHJhdGVneSB0aGlzIGluc3RhbGwgYWxyZWFkeVxuICogcmVjb3JkZWQ7IG90aGVyd2lzZSBBRE9QVCBhIHByZS1leGlzdGluZyBJbmRleGVkREIga2V5IGlmIG9uZSBpcyB0aGVyZSwgYW5kXG4gKiBmYWlsaW5nIHRoYXQgc2VlZC4gV2hhdGV2ZXIgcmVzb2x2ZXMgaXMgd3JpdHRlbiBiYWNrIGFzIHRoZSBzdGlja3kgc3RyYXRlZ3kuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZXZpY2VLZXkoKSB7XG4gICAgaWYgKF9kZXZpY2VLZXlQcm9taXNlKSByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG4gICAgX2RldmljZUtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja3kgPSBhd2FpdCByZWFkU3RpY2t5U3RyYXRlZ3koKTtcblxuICAgICAgICAvLyBBIHZhdWx0IGFscmVhZHkgb24gYHNlZWRgIG5ldmVyIHJlLXByb2JlcyBJbmRleGVkREI6IGl0cyBibG9icyBhcmVcbiAgICAgICAgLy8gdW5kZXIgdGhlIHNlZWQga2V5LCBhbmQgYWRvcHRpbmcgYSBzdHJheSBJREIgaGFuZGxlIHdvdWxkIG9ycGhhbiB0aGVtLlxuICAgICAgICAvLyBPbiBTYWZhcmkgd2UgbmV2ZXIgV1JJVEUgdW5kZXIgYW4gSURCIGtleSBhdCBhbGwgKHNlZSBoZWFkZXIpOiB0aGVcbiAgICAgICAgLy8gZXh0ZW5zaW9uJ3MgSW5kZXhlZERCIGlzIG9yaWdpbi1zY29wZWQgYW5kIHRoZSBvcmlnaW4gcm90YXRlcyBhY3Jvc3NcbiAgICAgICAgLy8gaW5zdGFsbHMsIHdoaWxlIHN0b3JhZ2UubG9jYWwgaXMgYnVuZGxlLXNjb3BlZCBhbmQgc3Vydml2ZXMuIEV4aXN0aW5nXG4gICAgICAgIC8vIElEQiBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHQgZmFsbGJhY2sgYW5kIGFyZSByZS13cmFwcGVkXG4gICAgICAgIC8vIHVuZGVyIHRoZSBzZWVkIGJ5IHRoZSBhdC1yZXN0IG1pZ3JhdGlvbi5cbiAgICAgICAgaWYgKHN0aWNreSAhPT0gJ3NlZWQnICYmICEoYXdhaXQgaXNTYWZhcmlFbmdpbmUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkYktleSA9IGF3YWl0IHRyeUlkYkRldmljZUtleSgpO1xuICAgICAgICAgICAgaWYgKGlkYktleSkge1xuICAgICAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdpZGInO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlU3RpY2t5U3RyYXRlZ3koJ2lkYicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGJLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgdHJ5U2VlZERldmljZUtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkge1xuICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ3NlZWQnO1xuICAgICAgICAgICAgLy8gQWxzbyBjb3ZlcnMgdGhlIGRlZ3JhZGUgY2FzZTogc3RpY2t5IHdhcyAnaWRiJyBidXQgdGhlIGhhbmRsZSBpc1xuICAgICAgICAgICAgLy8gZ29uZS4gT2xkIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdCBmYWxsYmFjayBiZWxvdy5cbiAgICAgICAgICAgIGF3YWl0IHdyaXRlU3RpY2t5U3RyYXRlZ3koJ3NlZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBzZWVkS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90aGluZyBwZXJzaXN0cyBoZXJlLiBCZXR0ZXIgdGhhbiByZWZ1c2luZyB0byBlbmNyeXB0LCBidXQgYmxvYnNcbiAgICAgICAgLy8gd3JpdHRlbiB1bmRlciB0aGlzIGtleSBkaWUgd2l0aCB0aGUgY29udGV4dCBcdTIwMTQgc2VlIG1vZHVsZSBoZWFkZXIuXG4gICAgICAgIGlmICghX21lbW9yeURldmljZUtleSkgX21lbW9yeURldmljZUtleSA9IGF3YWl0IGdlbmVyYXRlRGV2aWNlS2V5KCk7XG4gICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdtZW1vcnknO1xuICAgICAgICByZXR1cm4gX21lbW9yeURldmljZUtleTtcbiAgICB9KSgpO1xuICAgIHJldHVybiBfZGV2aWNlS2V5UHJvbWlzZTtcbn1cblxuLyoqIFdoaWNoIHBlcnNpc3RlbmNlIHN0cmF0ZWd5IHRoZSBkZXZpY2Uga2V5IHJlc29sdmVkIHRvIChudWxsIHVudGlsIHJlc29sdmVkKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXZpY2VLZXlTdHJhdGVneSgpIHtcbiAgICByZXR1cm4gX2RldmljZVN0cmF0ZWd5O1xufVxuXG4vKipcbiAqIERyb3AgZXZlcnkgbWVtb2lzZWQgZGV2aWNlLWtleSBoYW5kbGUuIE1VU1QgYmUgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIGFueVxuICogYHN0b3JhZ2UuY2xlYXIoKWA6IHRoZSBzZWVkIChhbmQgdGhlIHN0aWNreSBzdHJhdGVneSkgYXJlIGdvbmUgZnJvbSBzdG9yYWdlLFxuICogc28gYSBjYWNoZWQgcHJvbWlzZSB3b3VsZCBrZWVwIGhhbmRpbmcgb3V0IGEga2V5IHdob3NlIGJhY2tpbmcgbWF0ZXJpYWwgbm9cbiAqIGxvbmdlciBleGlzdHMgXHUyMDE0IHRoZSBuZXh0IGdldERldmljZUtleSgpIHdvdWxkIHdyYXAgc2VjcmV0cyB1bmRlciBhIGtleSB0aGF0XG4gKiBkaWVzIHdpdGggdGhpcyBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZXZpY2VLZXkoKSB7XG4gICAgX2RldmljZUtleVByb21pc2UgPSBudWxsO1xuICAgIF9kZXZpY2VTdHJhdGVneSA9IG51bGw7XG4gICAgX21lbW9yeURldmljZUtleSA9IG51bGw7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIGEgcHJlLWV4aXN0aW5nIEluZGV4ZWREQiBkZXZpY2Uga2V5LCB1c2VkIG9ubHkgYXMgYVxuICogZGVjcnlwdCBmYWxsYmFjayBmb3IgYmxvYnMgd3JpdHRlbiBiZWZvcmUgdGhpcyBjb250ZXh0IGNoYW5nZWQgc3RyYXRlZ3kuXG4gKiBOZXZlciBjcmVhdGVzIG9uZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0TGVnYWN5SWRiS2V5KCkge1xuICAgIGlmIChfbGVnYWN5SWRiS2V5UHJvbWlzZSkgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgZGIuZ2V0KERFVklDRV9TVE9SRSwgREVWSUNFX0tFWV9JRCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byB0aGUga2V5IGFuIEVYSVNUSU5HIGBkZXZpY2VLZXlTZWVkYCBpbXBvcnRzIHRvLCB1c2VkIG9ubHlcbiAqIGFzIGEgZGVjcnlwdCBmYWxsYmFjay4gTmV2ZXIgbWludHMgYSBzZWVkICh0aGF0IGlzIHRyeVNlZWREZXZpY2VLZXkncyBqb2IpLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRFeGlzdGluZ1NlZWRLZXkoKSB7XG4gICAgaWYgKF9leGlzdGluZ1NlZWRLZXlQcm9taXNlKSByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgICAgICBjb25zdCBzZWVkID0gZ290Py5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgICAgIGlmICghc2VlZCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbXBvcnRTZWVkS2V5KHNlZWQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIEV2ZXJ5IE9USEVSIGtleSB0aGlzIGluc3RhbGwgY291bGQgaGF2ZSB3cmFwcGVkIGEgZGV2aWNlIGJsb2IgdW5kZXIsIGluXG4gKiBwcmVmZXJlbmNlIG9yZGVyLiBTdHJhdGVneSBmbGlwcyAoaWRiXHUyMTkyc2VlZCBvbiBkZWdyYWRlLCBzZWVkXHUyMTkyaWRiIG9uIGFuXG4gKiBhZG9wdGVkIGhhbmRsZSkgbXVzdCBuZXZlciBvcnBoYW4gYSBibG9iLCBzbyB0aGUgZmFsbGJhY2sgaXMgc3ltbWV0cmljOiBhXG4gKiBzZWVkIGJsb2Igc3RheXMgcmVhZGFibGUgd2hpbGUgdGhlIHN0cmF0ZWd5IGlzICdpZGInIGFuZCB2aWNlIHZlcnNhLlxuICovXG5hc3luYyBmdW5jdGlvbiBmYWxsYmFja0RldmljZUtleXMoKSB7XG4gICAgY29uc3Qga2V5cyA9IFtdO1xuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdpZGInKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FjeSA9IGF3YWl0IGdldExlZ2FjeUlkYktleSgpO1xuICAgICAgICBpZiAobGVnYWN5KSBrZXlzLnB1c2gobGVnYWN5KTtcbiAgICB9XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ3NlZWQnKSB7XG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCBnZXRFeGlzdGluZ1NlZWRLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIGtleXMucHVzaChzZWVkS2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRldmljZSBibG9iIHdpdGggdGhlIGN1cnJlbnQga2V5LCBmYWxsaW5nIGJhY2sgdG8gZXZlcnkgb3RoZXIga2V5XG4gKiB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkLiBSZXR1cm5zIHRoZSBwbGFpbnRleHQgcGx1cyB3aGV0aGVyIGEgZmFsbGJhY2sga2V5XG4gKiB3YXMgbmVlZGVkIChpLmUuIHRoZSBibG9iIGlzIHN0YWxlIGFuZCB3b3J0aCByZS13cmFwcGluZykuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCksIHN0YWxlOiBmYWxzZSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZm9yIChjb25zdCBmYWxsYmFjayBvZiBhd2FpdCBmYWxsYmFja0RldmljZUtleXMoKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChmYWxsYmFjaywgaXYsIGNpcGhlcnRleHQpLFxuICAgICAgICAgICAgICAgICAgICBzdGFsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHRyeSB0aGUgbmV4dCBvbmUgKi8gfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7IC8vIHJlcG9ydCB0aGUgQ1VSUkVOVCBrZXkncyBmYWlsdXJlLCBub3QgdGhlIGxhc3QgZmFsbGJhY2snc1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGVuYy5lbmNvZGUocGxhaW50ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHY6IDEsXG4gICAgICAgIGs6ICdkZXZpY2UnLFxuICAgICAgICBpdjogYWJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFiVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSB7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BYihpdikpIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgYmFzZTY0VG9BYihjaXBoZXJ0ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhEZXZpY2VLZXkoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgLy8gR0NNIGF1dGhlbnRpY2F0aW9uIGNhbiBmYWlsIHdpdGggdGhlIENVUlJFTlQgc3RyYXRlZ3kncyBrZXkgYmVjYXVzZSB0aGVcbiAgICAvLyBibG9iIHByZWRhdGVzIGEgc3RyYXRlZ3kgY2hhbmdlIChhIENocm9tZS9GaXJlZm94IHZhdWx0IHdob3NlIElEQiBoYW5kbGVcbiAgICAvLyBpcyBzdGlsbCByZWFkYWJsZSB3aGlsZSB0aGlzIGNvbnRleHQgc2V0dGxlZCBvbiB0aGUgc2VlZCwgb3IgdGhlIHJldmVyc2UpLlxuICAgIC8vIFRyeSBldmVyeSBrZXkgdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZCBiZWZvcmUgZGVjbGFyaW5nIHRoZSBzZWNyZXQgbG9zdC5cbiAgICBjb25zdCB7IHBsYWludGV4dCB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiBwbGFpbnRleHQ7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRldmljZSBibG9iIGFuZCwgd2hlbiBpdCBjb3VsZCBvbmx5IGJlIHJlYWQgdmlhIGEgZmFsbGJhY2sga2V5XG4gKiAobGVnYWN5IEluZGV4ZWREQiBoYW5kbGUsIG9yIGFuIGV4aXN0aW5nIHNlZWQgd2hpbGUgdGhlIHN0cmF0ZWd5IGlzICdpZGInKSxcbiAqIGhhbmQgYmFjayBhIHJlcGxhY2VtZW50IGJsb2Igd3JhcHBlZCB1bmRlciB0aGUgQ1VSUkVOVCBzdHJhdGVneSBzbyB0aGUgY2FsbGVyXG4gKiBjYW4gcGVyc2lzdCB0aGUgdXBncmFkZSBvcHBvcnR1bmlzdGljYWxseS5cbiAqIGByZXdyYXBwZWRgIGlzIG51bGwgd2hlbiB0aGUgYmxvYiBpcyBhbHJlYWR5IGN1cnJlbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkZvclJld3JhcChlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCB7IHBsYWludGV4dCwgc3RhbGUgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwbGFpbnRleHQsXG4gICAgICAgIHJld3JhcHBlZDogc3RhbGUgPyBhd2FpdCBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIDogbnVsbCxcbiAgICB9O1xufVxuXG4vLyAtLS0gQmxvYiBjbGFzc2lmaWNhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuc2FsdCAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCAmJiBwLmsgIT09ICdkZXZpY2UnKTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldmljZUtleUJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5rID09PSAnZGV2aWNlJyAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG4vKiogVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYWxyZWFkeSBjaXBoZXJ0ZXh0IChlaXRoZXIgd3JhcHBpbmcpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2lwaGVydGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkgfHwgaXNEZXZpY2VLZXlCbG9iKHZhbHVlKTtcbn1cblxuLy8gLS0tIFVuaWZpZWQgd3JhcCAvIHVud3JhcCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgc2VjcmV0IGZvciBhdC1yZXN0IHN0b3JhZ2UuIFByZWZlcnMgdGhlIHBhc3N3b3JkLWRlcml2ZWQgc2Vzc2lvblxuICoga2V5IHdoZW4gb25lIGlzIGF2YWlsYWJsZSBpbiB0aGlzIGNvbnRleHQgKGJhY2tncm91bmQsIHVubG9ja2VkKTsgb3RoZXJ3aXNlXG4gKiBmYWxscyBiYWNrIHRvIHRoZSBhbHdheXMtYXZhaWxhYmxlIGRldmljZSBrZXkuIE5ldmVyIHJldHVybnMgcGxhaW50ZXh0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEBwYXJhbSB7e2V4dHJhY3RhYmxlPzogYm9vbGVhbn19IFtvcHRpb25zXSAtIGBleHRyYWN0YWJsZTogdHJ1ZWAgYWxsb3dzIHRoZVxuICogICAgICAgIHJhdyBieXRlcyB0byBiZSBleHBvcnRlZCBvbmNlIChzZWUgZXhwb3J0S2V5QmFzZTY0KS4gVXNlZCBieSB0aGVcbiAqICAgICAgICBiYWNrZ3JvdW5kIHdvcmtlciBzbyBhbiB1bmxvY2tlZCBzZXNzaW9uIGNhbiBiZSBwYXJrZWQgaW5cbiAqICAgICAgICBzdG9yYWdlLnNlc3Npb24gYW5kIGZ1bGx5IHJlc3RvcmVkIGFmdGVyIGFuIE1WMyBldmljdGlvbi4gRGVmYXVsdFxuICogICAgICAgIGZhbHNlOiB0aGUga2V5IGlzIG9wYXF1ZSBhbmQgY2Fubm90IGxlYXZlIHRoZSBjcnlwdG8gc3Vic3lzdGVtLlxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgICEhb3B0aW9ucy5leHRyYWN0YWJsZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKlxuICogRXhwb3J0IGFuIGV4dHJhY3RhYmxlIEFFUyBrZXkncyByYXcgYnl0ZXMgYXMgYmFzZTY0LlxuICogT25seSBldmVyIGNhbGxlZCBvbiBhIGtleSBkZXJpdmVkIHdpdGggYHsgZXh0cmFjdGFibGU6IHRydWUgfWAuXG4gKlxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gYmFzZTY0IHJhdyBrZXkgYnl0ZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleUJhc2U2NChrZXkpIHtcbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChhd2FpdCBjcnlwdG8uc3VidGxlLmV4cG9ydEtleSgncmF3Jywga2V5KSk7XG59XG5cbi8qKlxuICogSW1wb3J0IGJhc2U2NCByYXcgYnl0ZXMgYmFjayBpbnRvIGEgTk9OLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNIGtleS5cbiAqIFRoZSBjb3VudGVycGFydCBvZiBleHBvcnRLZXlCYXNlNjQ6IHdoYXRldmVyIHdlbnQgb3V0IGV4dHJhY3RhYmxlIGNvbWVzIGJhY2tcbiAqIG9wYXF1ZSwgc28gYSByZXN0b3JlZCBzZXNzaW9uIGtleSBjYW5ub3QgYmUgcmUtZXhwb3J0ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NCAtIHJhdyBrZXkgYnl0ZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlCYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKiBiYXNlNjQgXHUyMTk0IGJ5dGVzLCBleHBvcnRlZCBzbyBjYWxsZXJzIGNhbiByb3VuZC10cmlwIGEgc2FsdCB0aHJvdWdoIEpTT04uICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlcykge1xuICAgIC8vIGBuZXcgVWludDhBcnJheSh2aWV3KWAgaW5zaWRlIHRoZSBoZWxwZXIgY29waWVzIHRoZSBWSUVXLCBzbyBhIHNhbHQgdGhhdFxuICAgIC8vIGlzIGEgd2luZG93IGludG8gYSBsYXJnZXIgYnVmZmVyIHN0aWxsIGVuY29kZXMgY29ycmVjdGx5LlxuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ5dGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgKGlnbm9yZXMgdGhlIHNhbHQgZW1iZWRkZWQgaW4gdGhlXG4gKiBibG9iIFx1MjAxNCB0aGUgY2FsbGVyIG11c3Qgc3VwcGx5IGEga2V5IHRoYXQgbWF0Y2hlcyBob3cgdGhlIGJsb2Igd2FzIGVuY3J5cHRlZCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKS9lbmNyeXB0V2l0aEtleSgpXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAtIEFFUy0yNTYtR0NNIGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhLZXkoZW5jcnlwdGVkRGF0YSwga2V5KSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGhhc2gsIHN0b3JlZEhhc2gpO1xufVxuXG4vKipcbiAqIENvbnN0YW50LXRpbWUgY29tcGFyaXNvbiBvZiB0d28gYmFzZTY0LWVuY29kZWQgYnl0ZSBzdHJpbmdzLlxuICpcbiAqIERlY29kZXMgYm90aCB0byByYXcgYnl0ZXMgYW5kIGNvbXBhcmVzIHdpdGggYW4gYWNjdW11bGF0b3Igc28gdGhlIHJ1bm5pbmdcbiAqIHRpbWUgZG9lcyBub3QgZGVwZW5kIG9uIHdoZXJlIHRoZSBmaXJzdCBtaXNtYXRjaCBvY2N1cnMgXHUyMDE0IHRoaXMgYXZvaWRzIHRoZVxuICogdGltaW5nIHNpZGUtY2hhbm5lbCBvZiBhIHBsYWluIGA9PT1gIHN0cmluZyBjb21wYXJlIChUaWVyLTMgY3J5cHRvLmpzOjIxMykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChhLCBiKSB7XG4gICAgbGV0IGJhLCBiYjtcbiAgICB0cnkge1xuICAgICAgICBiYSA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYSkpO1xuICAgICAgICBiYiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYikpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgdGhlIG1heCBsZW5ndGggc28gbGVuZ3RoIGRpZmZlcmVuY2VzIGRvbid0IHNob3J0LWNpcmN1aXQgZWFybHkuXG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgoYmEubGVuZ3RoLCBiYi5sZW5ndGgpO1xuICAgIGxldCBkaWZmID0gYmEubGVuZ3RoIF4gYmIubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGlmZiB8PSAoYmFbaV0gfHwgMCkgXiAoYmJbaV0gfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkaWZmID09PSAwO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1DQSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsWUFDeEQsT0FBTztBQUNILHNCQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQU07QUFBQSxZQUNuRDtBQUFBLFVBQ0o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQTlEQSxNQWdCTSxVQWFBLFVBdUNBO0FBcEVOO0FBQUE7QUFBQTtBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixVQUFJLENBQUMsVUFBVTtBQUNYLGNBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLE1BQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQXVDckUsTUFBTSxNQUFNLENBQUM7QUFHYixVQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUlWLGVBQWUsTUFBTTtBQUNqQixjQUFJLENBQUMsVUFBVTtBQUNYLG1CQUFPLFNBQVMsUUFBUSxZQUFZLEdBQUcsSUFBSTtBQUFBLFVBQy9DO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxRQUM1RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBUUEsV0FBVyxTQUFTLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUs1QixPQUFPLE1BQU07QUFDVCxpQkFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsUUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtBLGtCQUFrQjtBQUNkLGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxRQUFRLGdCQUFnQjtBQUFBLFVBQzVDO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLFNBQVMsU0FBUyxRQUFRLGVBQWUsRUFBRTtBQUFBLFFBQ3pFO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFLQSxJQUFJLEtBQUs7QUFDTCxpQkFBTyxTQUFTLFFBQVE7QUFBQSxRQUM1QjtBQUFBLE1BQ0o7QUFHQSxVQUFJLFVBQVU7QUFBQSxRQUNWLE9BQU87QUFBQSxVQUNILE9BQU8sTUFBTTtBQUNULGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJO0FBQUEsWUFDN0M7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxVQUNoRjtBQUFBLFVBQ0EsT0FBTyxNQUFNO0FBQ1QsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxZQUM3QztBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ2hGO0FBQUEsVUFDQSxTQUFTLE1BQU07QUFDWCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEdBQUcsSUFBSTtBQUFBLFlBQy9DO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDbEY7QUFBQSxVQUNBLFVBQVUsTUFBTTtBQUNaLGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxNQUFNLE9BQU8sR0FBRyxJQUFJO0FBQUEsWUFDaEQ7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxVQUNuRjtBQUFBLFFBQ0o7QUFBQTtBQUFBO0FBQUEsUUFJQSxNQUFNLFNBQVMsU0FBUyxPQUFPO0FBQUEsVUFDM0IsT0FBTyxNQUFNO0FBQ1QsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxZQUM1QztBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQzlFO0FBQUEsVUFDQSxPQUFPLE1BQU07QUFDVCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLFlBQzVDO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDOUU7QUFBQSxVQUNBLFVBQVUsTUFBTTtBQUNaLGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsWUFDL0M7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxVQUNqRjtBQUFBLFVBQ0EsU0FBUyxNQUFNO0FBQ1gsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxZQUM5QztBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ2hGO0FBQUEsVUFDQSxpQkFBaUIsTUFBTTtBQUNuQixnQkFBSSxDQUFDLFNBQVMsUUFBUSxLQUFLLGVBQWU7QUFFdEMscUJBQU8sUUFBUSxRQUFRLENBQUM7QUFBQSxZQUM1QjtBQUNBLGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxLQUFLLGNBQWMsR0FBRyxJQUFJO0FBQUEsWUFDdEQ7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLGFBQWEsRUFBRSxHQUFHLElBQUk7QUFBQSxVQUN4RjtBQUFBLFFBQ0osSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFNSixTQUFTLFNBQVMsU0FBUyxVQUFVO0FBQUEsVUFDakMsT0FBTyxNQUFNO0FBQ1QsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLFFBQVEsSUFBSSxHQUFHLElBQUk7QUFBQSxZQUMvQztBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLFNBQVMsU0FBUyxRQUFRLFFBQVEsR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ3BGO0FBQUEsVUFDQSxPQUFPLE1BQU07QUFDVCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsUUFBUSxJQUFJLEdBQUcsSUFBSTtBQUFBLFlBQy9DO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsU0FBUyxTQUFTLFFBQVEsUUFBUSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDcEY7QUFBQSxVQUNBLFVBQVUsTUFBTTtBQUNaLGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxRQUFRLE9BQU8sR0FBRyxJQUFJO0FBQUEsWUFDbEQ7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxTQUFTLFNBQVMsUUFBUSxRQUFRLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxVQUN2RjtBQUFBLFVBQ0EsU0FBUyxNQUFNO0FBQ1gsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLFFBQVEsTUFBTSxHQUFHLElBQUk7QUFBQSxZQUNqRDtBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLFNBQVMsU0FBUyxRQUFRLFFBQVEsS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ3RGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUtBLGtCQUFrQixNQUFNO0FBQ3BCLGdCQUFJLENBQUMsU0FBUyxRQUFRLFFBQVEsZUFBZ0IsUUFBTyxRQUFRLFFBQVE7QUFDckUsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLFFBQVEsZUFBZSxHQUFHLElBQUk7QUFBQSxZQUMxRDtBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLFNBQVMsU0FBUyxRQUFRLFFBQVEsY0FBYyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQy9GO0FBQUEsUUFDSixJQUFJO0FBQUE7QUFBQSxRQUdKLFdBQVcsU0FBUyxTQUFTLGFBQWE7QUFBQSxNQUM5QztBQUdBLFVBQUksT0FBTztBQUFBLFFBQ1AsVUFBVSxNQUFNO0FBQ1osY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxVQUN2QztBQUNBLGlCQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDakU7QUFBQSxRQUNBLFNBQVMsTUFBTTtBQUNYLGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxLQUFLLE1BQU0sR0FBRyxJQUFJO0FBQUEsVUFDdEM7QUFDQSxpQkFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLFFBQ2hFO0FBQUEsUUFDQSxVQUFVLE1BQU07QUFDWixjQUFJLENBQUMsVUFBVTtBQUNYLG1CQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ3ZDO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxRQUNqRTtBQUFBLFFBQ0EsVUFBVSxNQUFNO0FBQ1osY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxVQUN2QztBQUNBLGlCQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDakU7QUFBQSxRQUNBLE9BQU8sTUFBTTtBQUNULGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxLQUFLLElBQUksR0FBRyxJQUFJO0FBQUEsVUFDcEM7QUFDQSxpQkFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLFFBQzlEO0FBQUEsUUFDQSxjQUFjLE1BQU07QUFDaEIsY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLEtBQUssV0FBVyxHQUFHLElBQUk7QUFBQSxVQUMzQztBQUNBLGlCQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxVQUFVLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDckU7QUFBQSxRQUNBLGVBQWUsTUFBTTtBQUNqQixjQUFJLENBQUMsVUFBVTtBQUNYLG1CQUFPLFNBQVMsS0FBSyxZQUFZLEdBQUcsSUFBSTtBQUFBLFVBQzVDO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFdBQVcsRUFBRSxHQUFHLElBQUk7QUFBQSxRQUN0RTtBQUFBLE1BQ0o7QUFJQSxVQUFJLFNBQVMsU0FBUyxTQUFTO0FBQUEsUUFDM0IsVUFBVSxNQUFNO0FBRVosZ0JBQU0sU0FBUyxTQUFTLE9BQU8sT0FBTyxHQUFHLElBQUk7QUFDN0MsaUJBQU8sVUFBVSxPQUFPLE9BQU8sU0FBUyxhQUFhLFNBQVMsUUFBUSxRQUFRO0FBQUEsUUFDbEY7QUFBQSxRQUNBLFNBQVMsTUFBTTtBQUNYLGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxPQUFPLE1BQU0sR0FBRyxJQUFJO0FBQUEsVUFDeEM7QUFDQSxpQkFBTyxVQUFVLFNBQVMsUUFBUSxTQUFTLE9BQU8sS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLFFBQ3BFO0FBQUEsUUFDQSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzdCLElBQUk7QUFBQTtBQUFBOzs7QUNsU0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLQSxXQUFTLHVCQUF1QjtBQUM1QixXQUFRLHNCQUNILG9CQUFvQjtBQUFBLE1BQ2pCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNSO0FBRUEsV0FBUywwQkFBMEI7QUFDL0IsV0FBUSx5QkFDSCx1QkFBdUI7QUFBQSxNQUNwQixVQUFVLFVBQVU7QUFBQSxNQUNwQixVQUFVLFVBQVU7QUFBQSxNQUNwQixVQUFVLFVBQVU7QUFBQSxJQUN4QjtBQUFBLEVBQ1I7QUFJQSxXQUFTLGlCQUFpQixTQUFTO0FBQy9CLFVBQU0sVUFBVSxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDN0MsWUFBTSxXQUFXLE1BQU07QUFDbkIsZ0JBQVEsb0JBQW9CLFdBQVcsT0FBTztBQUM5QyxnQkFBUSxvQkFBb0IsU0FBUyxLQUFLO0FBQUEsTUFDOUM7QUFDQSxZQUFNLFVBQVUsTUFBTTtBQUNsQixnQkFBUSxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQzVCLGlCQUFTO0FBQUEsTUFDYjtBQUNBLFlBQU0sUUFBUSxNQUFNO0FBQ2hCLGVBQU8sUUFBUSxLQUFLO0FBQ3BCLGlCQUFTO0FBQUEsTUFDYjtBQUNBLGNBQVEsaUJBQWlCLFdBQVcsT0FBTztBQUMzQyxjQUFRLGlCQUFpQixTQUFTLEtBQUs7QUFBQSxJQUMzQyxDQUFDO0FBR0QsMEJBQXNCLElBQUksU0FBUyxPQUFPO0FBQzFDLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUywrQkFBK0IsSUFBSTtBQUV4QyxRQUFJLG1CQUFtQixJQUFJLEVBQUU7QUFDekI7QUFDSixVQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQzFDLFlBQU0sV0FBVyxNQUFNO0FBQ25CLFdBQUcsb0JBQW9CLFlBQVksUUFBUTtBQUMzQyxXQUFHLG9CQUFvQixTQUFTLEtBQUs7QUFDckMsV0FBRyxvQkFBb0IsU0FBUyxLQUFLO0FBQUEsTUFDekM7QUFDQSxZQUFNLFdBQVcsTUFBTTtBQUNuQixnQkFBUTtBQUNSLGlCQUFTO0FBQUEsTUFDYjtBQUNBLFlBQU0sUUFBUSxNQUFNO0FBQ2hCLGVBQU8sR0FBRyxTQUFTLElBQUksYUFBYSxjQUFjLFlBQVksQ0FBQztBQUMvRCxpQkFBUztBQUFBLE1BQ2I7QUFDQSxTQUFHLGlCQUFpQixZQUFZLFFBQVE7QUFDeEMsU0FBRyxpQkFBaUIsU0FBUyxLQUFLO0FBQ2xDLFNBQUcsaUJBQWlCLFNBQVMsS0FBSztBQUFBLElBQ3RDLENBQUM7QUFFRCx1QkFBbUIsSUFBSSxJQUFJLElBQUk7QUFBQSxFQUNuQztBQTZCQSxXQUFTLGFBQWEsVUFBVTtBQUM1QixvQkFBZ0IsU0FBUyxhQUFhO0FBQUEsRUFDMUM7QUFDQSxXQUFTLGFBQWEsTUFBTTtBQVF4QixRQUFJLHdCQUF3QixFQUFFLFNBQVMsSUFBSSxHQUFHO0FBQzFDLGFBQU8sWUFBYSxNQUFNO0FBR3RCLGFBQUssTUFBTSxPQUFPLElBQUksR0FBRyxJQUFJO0FBQzdCLGVBQU8sS0FBSyxLQUFLLE9BQU87QUFBQSxNQUM1QjtBQUFBLElBQ0o7QUFDQSxXQUFPLFlBQWEsTUFBTTtBQUd0QixhQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztBQUFBLElBQzlDO0FBQUEsRUFDSjtBQUNBLFdBQVMsdUJBQXVCLE9BQU87QUFDbkMsUUFBSSxPQUFPLFVBQVU7QUFDakIsYUFBTyxhQUFhLEtBQUs7QUFHN0IsUUFBSSxpQkFBaUI7QUFDakIscUNBQStCLEtBQUs7QUFDeEMsUUFBSSxjQUFjLE9BQU8scUJBQXFCLENBQUM7QUFDM0MsYUFBTyxJQUFJLE1BQU0sT0FBTyxhQUFhO0FBRXpDLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyxLQUFLLE9BQU87QUFHakIsUUFBSSxpQkFBaUI7QUFDakIsYUFBTyxpQkFBaUIsS0FBSztBQUdqQyxRQUFJLGVBQWUsSUFBSSxLQUFLO0FBQ3hCLGFBQU8sZUFBZSxJQUFJLEtBQUs7QUFDbkMsVUFBTSxXQUFXLHVCQUF1QixLQUFLO0FBRzdDLFFBQUksYUFBYSxPQUFPO0FBQ3BCLHFCQUFlLElBQUksT0FBTyxRQUFRO0FBQ2xDLDRCQUFzQixJQUFJLFVBQVUsS0FBSztBQUFBLElBQzdDO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFVQSxXQUFTLE9BQU8sTUFBTSxTQUFTLEVBQUUsU0FBUyxTQUFTLFVBQVUsV0FBVyxJQUFJLENBQUMsR0FBRztBQUM1RSxVQUFNLFVBQVUsVUFBVSxLQUFLLE1BQU0sT0FBTztBQUM1QyxVQUFNLGNBQWMsS0FBSyxPQUFPO0FBQ2hDLFFBQUksU0FBUztBQUNULGNBQVEsaUJBQWlCLGlCQUFpQixDQUFDLFVBQVU7QUFDakQsZ0JBQVEsS0FBSyxRQUFRLE1BQU0sR0FBRyxNQUFNLFlBQVksTUFBTSxZQUFZLEtBQUssUUFBUSxXQUFXLEdBQUcsS0FBSztBQUFBLE1BQ3RHLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxTQUFTO0FBQ1QsY0FBUSxpQkFBaUIsV0FBVyxDQUFDLFVBQVU7QUFBQTtBQUFBLFFBRS9DLE1BQU07QUFBQSxRQUFZLE1BQU07QUFBQSxRQUFZO0FBQUEsTUFBSyxDQUFDO0FBQUEsSUFDOUM7QUFDQSxnQkFDSyxLQUFLLENBQUMsT0FBTztBQUNkLFVBQUk7QUFDQSxXQUFHLGlCQUFpQixTQUFTLE1BQU0sV0FBVyxDQUFDO0FBQ25ELFVBQUksVUFBVTtBQUNWLFdBQUcsaUJBQWlCLGlCQUFpQixDQUFDLFVBQVUsU0FBUyxNQUFNLFlBQVksTUFBTSxZQUFZLEtBQUssQ0FBQztBQUFBLE1BQ3ZHO0FBQUEsSUFDSixDQUFDLEVBQ0ksTUFBTSxNQUFNO0FBQUEsSUFBRSxDQUFDO0FBQ3BCLFdBQU87QUFBQSxFQUNYO0FBTUEsV0FBUyxTQUFTLE1BQU0sRUFBRSxRQUFRLElBQUksQ0FBQyxHQUFHO0FBQ3RDLFVBQU0sVUFBVSxVQUFVLGVBQWUsSUFBSTtBQUM3QyxRQUFJLFNBQVM7QUFDVCxjQUFRLGlCQUFpQixXQUFXLENBQUMsVUFBVTtBQUFBO0FBQUEsUUFFL0MsTUFBTTtBQUFBLFFBQVk7QUFBQSxNQUFLLENBQUM7QUFBQSxJQUM1QjtBQUNBLFdBQU8sS0FBSyxPQUFPLEVBQUUsS0FBSyxNQUFNLE1BQVM7QUFBQSxFQUM3QztBQUtBLFdBQVMsVUFBVSxRQUFRLE1BQU07QUFDN0IsUUFBSSxFQUFFLGtCQUFrQixlQUNwQixFQUFFLFFBQVEsV0FDVixPQUFPLFNBQVMsV0FBVztBQUMzQjtBQUFBLElBQ0o7QUFDQSxRQUFJLGNBQWMsSUFBSSxJQUFJO0FBQ3RCLGFBQU8sY0FBYyxJQUFJLElBQUk7QUFDakMsVUFBTSxpQkFBaUIsS0FBSyxRQUFRLGNBQWMsRUFBRTtBQUNwRCxVQUFNLFdBQVcsU0FBUztBQUMxQixVQUFNLFVBQVUsYUFBYSxTQUFTLGNBQWM7QUFDcEQ7QUFBQTtBQUFBLE1BRUEsRUFBRSxtQkFBbUIsV0FBVyxXQUFXLGdCQUFnQixjQUN2RCxFQUFFLFdBQVcsWUFBWSxTQUFTLGNBQWM7QUFBQSxNQUFJO0FBQ3BEO0FBQUEsSUFDSjtBQUNBLFVBQU0sU0FBUyxlQUFnQixjQUFjLE1BQU07QUFFL0MsWUFBTSxLQUFLLEtBQUssWUFBWSxXQUFXLFVBQVUsY0FBYyxVQUFVO0FBQ3pFLFVBQUlBLFVBQVMsR0FBRztBQUNoQixVQUFJO0FBQ0EsUUFBQUEsVUFBU0EsUUFBTyxNQUFNLEtBQUssTUFBTSxDQUFDO0FBTXRDLGNBQVEsTUFBTSxRQUFRLElBQUk7QUFBQSxRQUN0QkEsUUFBTyxjQUFjLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDOUIsV0FBVyxHQUFHO0FBQUEsTUFDbEIsQ0FBQyxHQUFHLENBQUM7QUFBQSxJQUNUO0FBQ0Esa0JBQWMsSUFBSSxNQUFNLE1BQU07QUFDOUIsV0FBTztBQUFBLEVBQ1g7QUF3QkEsa0JBQWdCLFdBQVcsTUFBTTtBQUU3QixRQUFJLFNBQVM7QUFDYixRQUFJLEVBQUUsa0JBQWtCLFlBQVk7QUFDaEMsZUFBUyxNQUFNLE9BQU8sV0FBVyxHQUFHLElBQUk7QUFBQSxJQUM1QztBQUNBLFFBQUksQ0FBQztBQUNEO0FBQ0osYUFBUztBQUNULFVBQU0sZ0JBQWdCLElBQUksTUFBTSxRQUFRLG1CQUFtQjtBQUMzRCxxQ0FBaUMsSUFBSSxlQUFlLE1BQU07QUFFMUQsMEJBQXNCLElBQUksZUFBZSxPQUFPLE1BQU0sQ0FBQztBQUN2RCxXQUFPLFFBQVE7QUFDWCxZQUFNO0FBRU4sZUFBUyxPQUFPLGVBQWUsSUFBSSxhQUFhLEtBQUssT0FBTyxTQUFTO0FBQ3JFLHFCQUFlLE9BQU8sYUFBYTtBQUFBLElBQ3ZDO0FBQUEsRUFDSjtBQUNBLFdBQVMsZUFBZSxRQUFRLE1BQU07QUFDbEMsV0FBUyxTQUFTLE9BQU8saUJBQ3JCLGNBQWMsUUFBUSxDQUFDLFVBQVUsZ0JBQWdCLFNBQVMsQ0FBQyxLQUMxRCxTQUFTLGFBQWEsY0FBYyxRQUFRLENBQUMsVUFBVSxjQUFjLENBQUM7QUFBQSxFQUMvRTtBQW5TQSxNQUFNLGVBRUYsbUJBQ0Esc0JBcUJFLG9CQUNBLGdCQUNBLHVCQWdERixlQW1GRSxRQWdEQSxhQUNBLGNBQ0EsZUEyQ0Esb0JBQ0EsV0FDQSxnQkFDQSxrQ0FDQTtBQTlQTjtBQUFBO0FBQUE7QUFBQSxNQUFNLGdCQUFnQixDQUFDLFFBQVEsaUJBQWlCLGFBQWEsS0FBSyxDQUFDLE1BQU0sa0JBQWtCLENBQUM7QUF3QjVGLE1BQU0scUJBQXFCLG9CQUFJLFFBQVE7QUFDdkMsTUFBTSxpQkFBaUIsb0JBQUksUUFBUTtBQUNuQyxNQUFNLHdCQUF3QixvQkFBSSxRQUFRO0FBZ0QxQyxNQUFJLGdCQUFnQjtBQUFBLFFBQ2hCLElBQUksUUFBUSxNQUFNLFVBQVU7QUFDeEIsY0FBSSxrQkFBa0IsZ0JBQWdCO0FBRWxDLGdCQUFJLFNBQVM7QUFDVCxxQkFBTyxtQkFBbUIsSUFBSSxNQUFNO0FBRXhDLGdCQUFJLFNBQVMsU0FBUztBQUNsQixxQkFBTyxTQUFTLGlCQUFpQixDQUFDLElBQzVCLFNBQ0EsU0FBUyxZQUFZLFNBQVMsaUJBQWlCLENBQUMsQ0FBQztBQUFBLFlBQzNEO0FBQUEsVUFDSjtBQUVBLGlCQUFPLEtBQUssT0FBTyxJQUFJLENBQUM7QUFBQSxRQUM1QjtBQUFBLFFBQ0EsSUFBSSxRQUFRLE1BQU0sT0FBTztBQUNyQixpQkFBTyxJQUFJLElBQUk7QUFDZixpQkFBTztBQUFBLFFBQ1g7QUFBQSxRQUNBLElBQUksUUFBUSxNQUFNO0FBQ2QsY0FBSSxrQkFBa0IsbUJBQ2pCLFNBQVMsVUFBVSxTQUFTLFVBQVU7QUFDdkMsbUJBQU87QUFBQSxVQUNYO0FBQ0EsaUJBQU8sUUFBUTtBQUFBLFFBQ25CO0FBQUEsTUFDSjtBQXdEQSxNQUFNLFNBQVMsQ0FBQyxVQUFVLHNCQUFzQixJQUFJLEtBQUs7QUFnRHpELE1BQU0sY0FBYyxDQUFDLE9BQU8sVUFBVSxVQUFVLGNBQWMsT0FBTztBQUNyRSxNQUFNLGVBQWUsQ0FBQyxPQUFPLE9BQU8sVUFBVSxPQUFPO0FBQ3JELE1BQU0sZ0JBQWdCLG9CQUFJLElBQUk7QUFxQzlCLG1CQUFhLENBQUMsY0FBYztBQUFBLFFBQ3hCLEdBQUc7QUFBQSxRQUNILEtBQUssQ0FBQyxRQUFRLE1BQU0sYUFBYSxVQUFVLFFBQVEsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLE1BQU0sUUFBUTtBQUFBLFFBQy9GLEtBQUssQ0FBQyxRQUFRLFNBQVMsQ0FBQyxDQUFDLFVBQVUsUUFBUSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsSUFBSTtBQUFBLE1BQ2pGLEVBQUU7QUFFRixNQUFNLHFCQUFxQixDQUFDLFlBQVksc0JBQXNCLFNBQVM7QUFDdkUsTUFBTSxZQUFZLENBQUM7QUFDbkIsTUFBTSxpQkFBaUIsb0JBQUksUUFBUTtBQUNuQyxNQUFNLG1DQUFtQyxvQkFBSSxRQUFRO0FBQ3JELE1BQU0sc0JBQXNCO0FBQUEsUUFDeEIsSUFBSSxRQUFRLE1BQU07QUFDZCxjQUFJLENBQUMsbUJBQW1CLFNBQVMsSUFBSTtBQUNqQyxtQkFBTyxPQUFPLElBQUk7QUFDdEIsY0FBSSxhQUFhLFVBQVUsSUFBSTtBQUMvQixjQUFJLENBQUMsWUFBWTtBQUNiLHlCQUFhLFVBQVUsSUFBSSxJQUFJLFlBQWEsTUFBTTtBQUM5Qyw2QkFBZSxJQUFJLE1BQU0saUNBQWlDLElBQUksSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztBQUFBLFlBQ3RGO0FBQUEsVUFDSjtBQUNBLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUEwQkEsbUJBQWEsQ0FBQyxjQUFjO0FBQUEsUUFDeEIsR0FBRztBQUFBLFFBQ0gsSUFBSSxRQUFRLE1BQU0sVUFBVTtBQUN4QixjQUFJLGVBQWUsUUFBUSxJQUFJO0FBQzNCLG1CQUFPO0FBQ1gsaUJBQU8sU0FBUyxJQUFJLFFBQVEsTUFBTSxRQUFRO0FBQUEsUUFDOUM7QUFBQSxRQUNBLElBQUksUUFBUSxNQUFNO0FBQ2QsaUJBQU8sZUFBZSxRQUFRLElBQUksS0FBSyxTQUFTLElBQUksUUFBUSxJQUFJO0FBQUEsUUFDcEU7QUFBQSxNQUNKLEVBQUU7QUFBQTtBQUFBOzs7QUM5U0Y7QUFBQTs7O0FDQUE7QUF1QkEsTUFBSSxRQUFRLFFBQVEsUUFBUTtBQUU1QixNQUFJLFlBQVk7QUFFaEIsV0FBUyxZQUFZO0FBQ2pCLFFBQUksU0FBUyxnQkFBZ0IsYUFBYSxpQkFBaUIsTUFBTSxNQUFPLFFBQU87QUFDL0UsUUFBSTtBQUNBLGFBQU8sT0FBTyxXQUFXLGtDQUFrQyxFQUFFO0FBQUEsSUFDakUsU0FBUyxHQUFHO0FBQ1IsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBTUEsV0FBUyxXQUFXLEVBQUUsT0FBTyxNQUFNLGNBQWMsYUFBYSxhQUFhLFNBQVMsT0FBTyxHQUFHO0FBQzFGLFdBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM1QixZQUFNLFlBQVksU0FBUztBQUUzQixZQUFNLE9BQU8sU0FBUyxjQUFjLEtBQUs7QUFDekMsV0FBSyxZQUFZO0FBRWpCLFlBQU0sV0FBVyxTQUFTLGNBQWMsS0FBSztBQUM3QyxlQUFTLFlBQVk7QUFFckIsWUFBTSxVQUFVLFlBQVk7QUFDNUIsWUFBTSxTQUFTLFNBQVMsY0FBYyxLQUFLO0FBQzNDLGFBQU8sWUFBWSxVQUFVLHNCQUFzQjtBQUNuRCxhQUFPLGFBQWEsUUFBUyxlQUFlLFNBQVUsZ0JBQWdCLFFBQVE7QUFDOUUsYUFBTyxhQUFhLGNBQWMsTUFBTTtBQUV4QyxVQUFJLFNBQVM7QUFDVCxjQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsZUFBTyxZQUFZO0FBQ25CLGVBQU8sWUFBWSxNQUFNO0FBQUEsTUFDN0I7QUFFQSxZQUFNLE1BQU0sRUFBRTtBQUNkLFlBQU0sVUFBVSxTQUFTLGNBQWMsSUFBSTtBQUMzQyxjQUFRLFlBQVk7QUFDcEIsY0FBUSxLQUFLLHFCQUFxQixHQUFHO0FBQ3JDLGNBQVEsY0FBYyxTQUFTO0FBQy9CLGFBQU8sWUFBWSxPQUFPO0FBQzFCLGFBQU8sYUFBYSxtQkFBbUIsUUFBUSxFQUFFO0FBRWpELFlBQU0sU0FBUyxTQUFTLGNBQWMsR0FBRztBQUN6QyxhQUFPLFlBQVk7QUFDbkIsYUFBTyxLQUFLLG9CQUFvQixHQUFHO0FBQ25DLGFBQU8sY0FBYyxRQUFRO0FBQzdCLGFBQU8sWUFBWSxNQUFNO0FBQ3pCLGFBQU8sYUFBYSxvQkFBb0IsT0FBTyxFQUFFO0FBRWpELFlBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxjQUFRLFlBQVk7QUFFcEIsWUFBTSxVQUFVLENBQUM7QUFDakIsVUFBSSxZQUFZO0FBQ2hCLFlBQU0sYUFBYSxTQUFTLGNBQWMsUUFBUTtBQUNsRCxpQkFBVyxPQUFPO0FBQ2xCLGlCQUFXLGNBQWM7QUFDekIsVUFBSSxRQUFRO0FBQ1IsbUJBQVcsWUFBWTtBQUFBLE1BQzNCLE9BQU87QUFDSCxvQkFBWSxTQUFTLGNBQWMsUUFBUTtBQUMzQyxrQkFBVSxPQUFPO0FBQ2pCLGtCQUFVLFlBQVk7QUFDdEIsa0JBQVUsY0FBYztBQUN4QixnQkFBUSxZQUFZLFNBQVM7QUFDN0IsZ0JBQVEsS0FBSyxTQUFTO0FBQ3RCLG1CQUFXLFlBQVksY0FBYyx5QkFBeUI7QUFBQSxNQUNsRTtBQUNBLGNBQVEsWUFBWSxVQUFVO0FBQzlCLGNBQVEsS0FBSyxVQUFVO0FBQ3ZCLGFBQU8sWUFBWSxPQUFPO0FBRTFCLFdBQUssWUFBWSxRQUFRO0FBQ3pCLFdBQUssWUFBWSxNQUFNO0FBRXZCLFVBQUksVUFBVTtBQUNkLGVBQVMsT0FBTyxRQUFRO0FBQ3BCLFlBQUksUUFBUztBQUNiLGtCQUFVO0FBQ1YsaUJBQVMsb0JBQW9CLFdBQVcsV0FBVyxJQUFJO0FBQ3ZELGlCQUFTLFVBQVUsT0FBTyxTQUFTO0FBQ25DLGVBQU8sVUFBVSxPQUFPLFNBQVM7QUFDakMsY0FBTSxTQUFTLE1BQU07QUFDakIsZUFBSyxPQUFPO0FBQ1osY0FBSTtBQUNBLGdCQUFJLGFBQWEsT0FBTyxVQUFVLFVBQVUsY0FBYyxTQUFTLFNBQVMsU0FBUyxHQUFHO0FBQ3BGLHdCQUFVLE1BQU07QUFBQSxZQUNwQjtBQUFBLFVBQ0osU0FBUyxHQUFHO0FBQUEsVUFBcUM7QUFDakQsa0JBQVEsTUFBTTtBQUFBLFFBQ2xCO0FBQ0EsWUFBSSxVQUFVLEVBQUcsUUFBTztBQUFBLFlBQ25CLFlBQVcsUUFBUSxHQUFHO0FBQUEsTUFDL0I7QUFFQSxlQUFTLFVBQVUsSUFBSTtBQUNuQixZQUFJLEdBQUcsUUFBUSxVQUFVO0FBQ3JCLGFBQUcsZUFBZTtBQUNsQixpQkFBTyxLQUFLO0FBQ1o7QUFBQSxRQUNKO0FBQ0EsWUFBSSxHQUFHLFFBQVEsT0FBTztBQUVsQixhQUFHLGVBQWU7QUFDbEIsZ0JBQU0sTUFBTSxRQUFRLFFBQVEsU0FBUyxhQUFhO0FBQ2xELGdCQUFNLE1BQU0sR0FBRyxXQUFXLEtBQUs7QUFDL0IsbUJBQVMsTUFBTSxNQUFNLFFBQVEsVUFBVSxRQUFRLE1BQU0sRUFBRSxNQUFNO0FBQUEsUUFDakU7QUFBQSxNQUNKO0FBRUEsZUFBUyxpQkFBaUIsU0FBUyxNQUFNLE9BQU8sS0FBSyxDQUFDO0FBQ3RELFVBQUksVUFBVyxXQUFVLGlCQUFpQixTQUFTLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFDdEUsaUJBQVcsaUJBQWlCLFNBQVMsTUFBTSxPQUFPLElBQUksQ0FBQztBQUN2RCxlQUFTLGlCQUFpQixXQUFXLFdBQVcsSUFBSTtBQUVwRCxlQUFTLEtBQUssWUFBWSxJQUFJO0FBQzlCLDRCQUFzQixNQUFNO0FBQ3hCLGlCQUFTLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLGVBQU8sVUFBVSxJQUFJLFNBQVM7QUFHOUIsY0FBTSxVQUFVLFNBQVMsYUFBYyxjQUFjLFlBQVk7QUFDakUsU0FBQyxXQUFXLFlBQVksTUFBTTtBQUFBLE1BQ2xDLENBQUM7QUFBQSxJQUNMLENBQUM7QUFBQSxFQUNMO0FBRU8sV0FBUyxXQUFXO0FBQUEsSUFDdkI7QUFBQSxJQUNBO0FBQUEsSUFDQSxlQUFlO0FBQUEsSUFDZixjQUFjO0FBQUEsSUFDZCxjQUFjO0FBQUEsSUFDZCxVQUFVO0FBQUEsRUFDZCxJQUFJLENBQUMsR0FBRztBQUNKLFVBQU0sU0FBUyxNQUFNLEtBQUssTUFDdEIsV0FBVyxFQUFFLE9BQU8sTUFBTSxjQUFjLGFBQWEsYUFBYSxTQUFTLFFBQVEsTUFBTSxDQUFDLENBQUM7QUFDL0YsWUFBUSxPQUFPLE1BQU0sTUFBTTtBQUFBLElBQUMsQ0FBQztBQUM3QixXQUFPO0FBQUEsRUFDWDs7O0FDdktBO0FBZUE7OztBQ2ZBO0FBV0E7OztBQ1hBOzs7QUNBQTtBQVlBLE1BQU0sV0FBVztBQUlqQixXQUFTLG9CQUFvQixRQUFRO0FBQ2pDLFVBQU0sUUFBUSxJQUFJLFdBQVcsTUFBTTtBQUNuQyxRQUFJLFNBQVM7QUFDYixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ25DLGdCQUFVLE9BQU8sYUFBYSxNQUFNLENBQUMsQ0FBQztBQUFBLElBQzFDO0FBQ0EsV0FBTyxLQUFLLE1BQU07QUFBQSxFQUN0QjtBQUVBLFdBQVMsb0JBQW9CLFFBQVE7QUFDakMsVUFBTSxTQUFTLEtBQUssTUFBTTtBQUMxQixVQUFNLFFBQVEsSUFBSSxXQUFXLE9BQU8sTUFBTTtBQUMxQyxhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3BDLFlBQU0sQ0FBQyxJQUFJLE9BQU8sV0FBVyxDQUFDO0FBQUEsSUFDbEM7QUFDQSxXQUFPLE1BQU07QUFBQSxFQUNqQjtBQStGQSxpQkFBc0IsZUFBZSxXQUFXLEtBQUssTUFBTTtBQUN2RCxVQUFNLEtBQUssT0FBTyxnQkFBZ0IsSUFBSSxXQUFXLFFBQVEsQ0FBQztBQUMxRCxVQUFNLE1BQU0sSUFBSSxZQUFZO0FBQzVCLFVBQU0sYUFBYSxNQUFNLE9BQU8sT0FBTztBQUFBLE1BQ25DLEVBQUUsTUFBTSxXQUFXLEdBQUc7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsSUFBSSxPQUFPLFNBQVM7QUFBQSxJQUN4QjtBQUVBLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTSxvQkFBb0IsSUFBSTtBQUFBLE1BQzlCLElBQUksb0JBQW9CLEVBQUU7QUFBQSxNQUMxQixZQUFZLG9CQUFvQixVQUFVO0FBQUEsSUFDOUMsQ0FBQztBQUFBLEVBQ0w7QUEwQ0EsaUJBQXNCLGVBQWUsZUFBZSxLQUFLO0FBQ3JELFVBQU0sRUFBRSxJQUFJLFdBQVcsSUFBSSxLQUFLLE1BQU0sYUFBYTtBQUNuRCxVQUFNLFFBQVEsSUFBSSxXQUFXLG9CQUFvQixFQUFFLENBQUM7QUFDcEQsVUFBTSxRQUFRLG9CQUFvQixVQUFVO0FBQzVDLFVBQU0sV0FBVyxNQUFNLE9BQU8sT0FBTztBQUFBLE1BQ2pDLEVBQUUsTUFBTSxXQUFXLElBQUksTUFBTTtBQUFBLE1BQzdCO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFDQSxXQUFPLElBQUksWUFBWSxFQUFFLE9BQU8sUUFBUTtBQUFBLEVBQzVDOzs7QURuSEEsTUFBTUMsWUFBVztBQUNqQixNQUFNLFlBQVk7QUFDbEIsTUFBTSxlQUFlO0FBQ3JCLE1BQU0sZ0JBQWdCO0FBRXRCLE1BQU0sa0JBQWtCO0FBQ3hCLE1BQU0sb0JBQW9CO0FBRTFCLE1BQU0sc0JBQXNCO0FBRzVCLFdBQVMsV0FBVyxRQUFRO0FBQ3hCLFVBQU0sUUFBUSxJQUFJLFdBQVcsTUFBTTtBQUNuQyxRQUFJLFNBQVM7QUFDYixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxJQUFLLFdBQVUsT0FBTyxhQUFhLE1BQU0sQ0FBQyxDQUFDO0FBQzdFLFdBQU8sS0FBSyxNQUFNO0FBQUEsRUFDdEI7QUFDQSxXQUFTLFdBQVcsS0FBSztBQUNyQixVQUFNLFNBQVMsS0FBSyxHQUFHO0FBQ3ZCLFVBQU0sUUFBUSxJQUFJLFdBQVcsT0FBTyxNQUFNO0FBQzFDLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLElBQUssT0FBTSxDQUFDLElBQUksT0FBTyxXQUFXLENBQUM7QUFDdEUsV0FBTyxNQUFNO0FBQUEsRUFDakI7QUFHQSxNQUFJLGNBQWM7QUFDbEIsTUFBSSxlQUFlO0FBR25CLE1BQUksWUFBWTtBQXdCaEIsTUFBSSxvQkFBb0I7QUFDeEIsTUFBSSxrQkFBa0I7QUFDdEIsTUFBSSxtQkFBbUI7QUFDdkIsTUFBSSx1QkFBdUI7QUFDM0IsTUFBSSwwQkFBMEI7QUFFOUIsaUJBQWUsb0JBQW9CO0FBQy9CLFdBQU8sT0FBTyxPQUFPO0FBQUEsTUFDakIsRUFBRSxNQUFNLFdBQVcsUUFBUSxJQUFJO0FBQUEsTUFDL0I7QUFBQTtBQUFBLE1BQ0EsQ0FBQyxXQUFXLFNBQVM7QUFBQSxJQUN6QjtBQUFBLEVBQ0o7QUFFQSxXQUFTLHFCQUFxQjtBQUMxQixXQUFPLE9BQU8sY0FBYyxlQUFlLGNBQWM7QUFBQSxFQUM3RDtBQVFBLGlCQUFlLGNBQWMsS0FBSztBQUM5QixRQUFJLENBQUMsSUFBSyxRQUFPO0FBQ2pCLFFBQUk7QUFDQSxZQUFNLEtBQUssT0FBTyxnQkFBZ0IsSUFBSSxXQUFXQyxTQUFRLENBQUM7QUFDMUQsWUFBTSxRQUFRLElBQUksWUFBWSxFQUFFLE9BQU8sdUJBQXVCO0FBQzlELFlBQU0sS0FBSyxNQUFNLE9BQU8sT0FBTyxRQUFRLEVBQUUsTUFBTSxXQUFXLEdBQUcsR0FBRyxLQUFLLEtBQUs7QUFDMUUsWUFBTSxLQUFLLE1BQU0sT0FBTyxPQUFPLFFBQVEsRUFBRSxNQUFNLFdBQVcsR0FBRyxHQUFHLEtBQUssRUFBRTtBQUN2RSxhQUFPLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNO0FBQUEsSUFDNUMsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUVBLGlCQUFlLGVBQWU7QUFFMUIsVUFBTSxFQUFFLFFBQUFDLFFBQU8sSUFBSSxNQUFNO0FBQ3pCLFdBQU9BLFFBQU8sV0FBVyxHQUFHO0FBQUEsTUFDeEIsUUFBUSxHQUFHO0FBQ1AsWUFBSSxDQUFDLEVBQUUsaUJBQWlCLFNBQVMsWUFBWSxHQUFHO0FBQzVDLFlBQUUsa0JBQWtCLFlBQVk7QUFBQSxRQUNwQztBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBZUEsaUJBQWUsa0JBQWtCO0FBQzdCLFFBQUksQ0FBQyxtQkFBbUIsRUFBRyxRQUFPO0FBQ2xDLFFBQUk7QUFDQSxZQUFNLEtBQUssTUFBTSxhQUFhO0FBQzlCLFlBQU0sV0FBVyxNQUFNLEdBQUcsSUFBSSxjQUFjLGFBQWE7QUFDekQsVUFBSSxDQUFDLFNBQVUsUUFBTztBQUN0QixhQUFRLE1BQU0sY0FBYyxRQUFRLElBQUssV0FBVztBQUFBLElBQ3hELFFBQVE7QUFDSixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFNQSxpQkFBZSxjQUFjO0FBQ3pCLFFBQUk7QUFDQSxZQUFNLEVBQUUsS0FBQUMsS0FBSSxJQUFJLE1BQU07QUFDdEIsYUFBT0EsTUFBSyxTQUFTLFNBQVM7QUFBQSxJQUNsQyxRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBR0EsV0FBUyx3QkFBd0I7QUFDN0IsUUFBSTtBQUNBLFlBQU0sS0FBTSxPQUFPLGNBQWMsZUFBZSxVQUFVLGFBQWM7QUFDeEUsYUFBTyxxQkFBcUIsS0FBSyxFQUFFLEtBQUssQ0FBQywyQkFBMkIsS0FBSyxFQUFFO0FBQUEsSUFDL0UsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQWNBLGlCQUFlLGlCQUFpQjtBQUM1QixRQUFJLFNBQVM7QUFDYixRQUFJO0FBQ0EsWUFBTSxFQUFFLEtBQUFBLEtBQUksSUFBSSxNQUFNO0FBQ3RCLFlBQU0sTUFBTUEsTUFBSyxTQUFTLFNBQVMsRUFBRTtBQUNyQyxlQUFTLE9BQU8sUUFBUSxXQUFXLE1BQU07QUFBQSxJQUM3QyxRQUFRO0FBQ0osZUFBUztBQUFBLElBQ2I7QUFFQSxRQUFJLFVBQVUsT0FBTyxXQUFXLHlCQUF5QixFQUFHLFFBQU87QUFHbkUsUUFBSSxzQkFBc0IsRUFBRyxRQUFPO0FBRXBDLFFBQUksV0FBVyxPQUFPLFdBQVcscUJBQXFCLEtBQUssT0FBTyxXQUFXLGtCQUFrQixJQUFJO0FBQy9GLGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFHQSxpQkFBZSxjQUFjLFNBQVM7QUFDbEMsV0FBTyxPQUFPLE9BQU87QUFBQSxNQUNqQjtBQUFBLE1BQU8sV0FBVyxPQUFPO0FBQUEsTUFBRyxFQUFFLE1BQU0sVUFBVTtBQUFBLE1BQzlDO0FBQUE7QUFBQSxNQUNBLENBQUMsV0FBVyxTQUFTO0FBQUEsSUFDekI7QUFBQSxFQUNKO0FBR0EsaUJBQWUscUJBQXFCO0FBQ2hDLFVBQU0sUUFBUSxNQUFNLFlBQVk7QUFDaEMsUUFBSSxDQUFDLE1BQU8sUUFBTztBQUNuQixRQUFJO0FBQ0EsWUFBTSxNQUFNLE1BQU0sTUFBTSxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFDM0QsWUFBTSxJQUFJLE1BQU0sbUJBQW1CO0FBQ25DLGFBQVEsTUFBTSxTQUFTLE1BQU0sU0FBVSxJQUFJO0FBQUEsSUFDL0MsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUdBLGlCQUFlLG9CQUFvQixVQUFVO0FBQ3pDLFFBQUksYUFBYSxTQUFTLGFBQWEsT0FBUTtBQUMvQyxVQUFNLFFBQVEsTUFBTSxZQUFZO0FBQ2hDLFFBQUksQ0FBQyxNQUFPO0FBQ1osUUFBSTtBQUNBLFlBQU0sTUFBTSxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7QUFBQSxJQUN2RCxRQUFRO0FBQUEsSUFBK0Q7QUFBQSxFQUMzRTtBQUdBLGlCQUFlLG1CQUFtQjtBQUM5QixVQUFNLFFBQVEsTUFBTSxZQUFZO0FBQ2hDLFFBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsUUFBSTtBQUNBLFlBQU0sTUFBTSxNQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztBQUN2RCxVQUFJLE9BQU8sTUFBTSxlQUFlO0FBQ2hDLFVBQUksQ0FBQyxNQUFNO0FBQ1AsZUFBTyxXQUFXLE9BQU8sZ0JBQWdCLElBQUksV0FBVyxpQkFBaUIsQ0FBQyxFQUFFLE1BQU07QUFDbEYsY0FBTSxNQUFNLElBQUksRUFBRSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFFM0MsY0FBTSxRQUFRLE1BQU0sTUFBTSxJQUFJLEVBQUUsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBQ3pELGNBQU0sWUFBWSxRQUFRLGVBQWU7QUFDekMsWUFBSSxjQUFjLE1BQU07QUFTcEIsY0FBSSxPQUFPLGNBQWMsWUFBWSxVQUFVLFdBQVcsRUFBRyxRQUFPO0FBQ3BFLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFDQSxZQUFNLE1BQU0sTUFBTSxjQUFjLElBQUk7QUFDcEMsYUFBUSxNQUFNLGNBQWMsR0FBRyxJQUFLLE1BQU07QUFBQSxJQUM5QyxRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBU0EsaUJBQXNCLGVBQWU7QUFDakMsUUFBSSxrQkFBbUIsUUFBTztBQUM5Qix5QkFBcUIsWUFBWTtBQUM3QixZQUFNLFNBQVMsTUFBTSxtQkFBbUI7QUFTeEMsVUFBSSxXQUFXLFVBQVUsQ0FBRSxNQUFNLGVBQWUsR0FBSTtBQUNoRCxjQUFNLFNBQVMsTUFBTSxnQkFBZ0I7QUFDckMsWUFBSSxRQUFRO0FBQ1IsNEJBQWtCO0FBQ2xCLGdCQUFNLG9CQUFvQixLQUFLO0FBQy9CLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFFQSxZQUFNLFVBQVUsTUFBTSxpQkFBaUI7QUFDdkMsVUFBSSxTQUFTO0FBQ1QsMEJBQWtCO0FBR2xCLGNBQU0sb0JBQW9CLE1BQU07QUFDaEMsZUFBTztBQUFBLE1BQ1g7QUFJQSxVQUFJLENBQUMsaUJBQWtCLG9CQUFtQixNQUFNLGtCQUFrQjtBQUNsRSx3QkFBa0I7QUFDbEIsYUFBTztBQUFBLElBQ1gsR0FBRztBQUNILFdBQU87QUFBQSxFQUNYO0FBMkJBLGlCQUFlLGtCQUFrQjtBQUM3QixRQUFJLHFCQUFzQixRQUFPO0FBQ2pDLDRCQUF3QixZQUFZO0FBQ2hDLFVBQUksQ0FBQyxtQkFBbUIsRUFBRyxRQUFPO0FBQ2xDLFVBQUk7QUFDQSxjQUFNLEtBQUssTUFBTSxhQUFhO0FBQzlCLGNBQU0sTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLGFBQWE7QUFDcEQsZUFBUSxNQUFNLGNBQWMsR0FBRyxJQUFLLE1BQU07QUFBQSxNQUM5QyxRQUFRO0FBQ0osZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKLEdBQUc7QUFDSCxXQUFPO0FBQUEsRUFDWDtBQU1BLGlCQUFlLHFCQUFxQjtBQUNoQyxRQUFJLHdCQUF5QixRQUFPO0FBQ3BDLCtCQUEyQixZQUFZO0FBQ25DLFlBQU0sUUFBUSxNQUFNLFlBQVk7QUFDaEMsVUFBSSxDQUFDLE1BQU8sUUFBTztBQUNuQixVQUFJO0FBQ0EsY0FBTSxNQUFNLE1BQU0sTUFBTSxJQUFJLEVBQUUsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBQ3ZELGNBQU0sT0FBTyxNQUFNLGVBQWU7QUFDbEMsWUFBSSxDQUFDLEtBQU0sUUFBTztBQUNsQixjQUFNLE1BQU0sTUFBTSxjQUFjLElBQUk7QUFDcEMsZUFBUSxNQUFNLGNBQWMsR0FBRyxJQUFLLE1BQU07QUFBQSxNQUM5QyxRQUFRO0FBQ0osZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKLEdBQUc7QUFDSCxXQUFPO0FBQUEsRUFDWDtBQVFBLGlCQUFlLHFCQUFxQjtBQUNoQyxVQUFNLE9BQU8sQ0FBQztBQUNkLFFBQUksb0JBQW9CLE9BQU87QUFDM0IsWUFBTSxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3JDLFVBQUksT0FBUSxNQUFLLEtBQUssTUFBTTtBQUFBLElBQ2hDO0FBQ0EsUUFBSSxvQkFBb0IsUUFBUTtBQUM1QixZQUFNLFVBQVUsTUFBTSxtQkFBbUI7QUFDekMsVUFBSSxRQUFTLE1BQUssS0FBSyxPQUFPO0FBQUEsSUFDbEM7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQU9BLGlCQUFlLHdCQUF3QixJQUFJLFlBQVk7QUFDbkQsVUFBTSxNQUFNLE1BQU0sYUFBYTtBQUMvQixRQUFJO0FBQ0EsYUFBTyxFQUFFLFdBQVcsTUFBTSxzQkFBc0IsS0FBSyxJQUFJLFVBQVUsR0FBRyxPQUFPLE1BQU07QUFBQSxJQUN2RixTQUFTLEdBQUc7QUFDUixpQkFBVyxZQUFZLE1BQU0sbUJBQW1CLEdBQUc7QUFDL0MsWUFBSTtBQUNBLGlCQUFPO0FBQUEsWUFDSCxXQUFXLE1BQU0sc0JBQXNCLFVBQVUsSUFBSSxVQUFVO0FBQUEsWUFDL0QsT0FBTztBQUFBLFVBQ1g7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUF5QjtBQUFBLE1BQ3JDO0FBQ0EsWUFBTTtBQUFBLElBQ1Y7QUFBQSxFQUNKO0FBRUEsaUJBQXNCLHFCQUFxQixXQUFXO0FBQ2xELFVBQU0sTUFBTSxNQUFNLGFBQWE7QUFDL0IsVUFBTSxLQUFLLE9BQU8sZ0JBQWdCLElBQUksV0FBV0MsU0FBUSxDQUFDO0FBQzFELFVBQU0sTUFBTSxJQUFJLFlBQVk7QUFDNUIsVUFBTSxhQUFhLE1BQU0sT0FBTyxPQUFPO0FBQUEsTUFDbkMsRUFBRSxNQUFNLFdBQVcsR0FBRztBQUFBLE1BQUc7QUFBQSxNQUFLLElBQUksT0FBTyxTQUFTO0FBQUEsSUFDdEQ7QUFDQSxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILElBQUksV0FBVyxFQUFFO0FBQUEsTUFDakIsWUFBWSxXQUFXLFVBQVU7QUFBQSxJQUNyQyxDQUFDO0FBQUEsRUFDTDtBQUVBLGlCQUFlLHNCQUFzQixLQUFLLElBQUksWUFBWTtBQUN0RCxVQUFNLFdBQVcsTUFBTSxPQUFPLE9BQU87QUFBQSxNQUNqQyxFQUFFLE1BQU0sV0FBVyxJQUFJLElBQUksV0FBVyxXQUFXLEVBQUUsQ0FBQyxFQUFFO0FBQUEsTUFDdEQ7QUFBQSxNQUNBLFdBQVcsVUFBVTtBQUFBLElBQ3pCO0FBQ0EsV0FBTyxJQUFJLFlBQVksRUFBRSxPQUFPLFFBQVE7QUFBQSxFQUM1QztBQUVBLGlCQUFzQixxQkFBcUIsZUFBZTtBQUN0RCxVQUFNLEVBQUUsSUFBSSxXQUFXLElBQUksS0FBSyxNQUFNLGFBQWE7QUFLbkQsVUFBTSxFQUFFLFVBQVUsSUFBSSxNQUFNLHdCQUF3QixJQUFJLFVBQVU7QUFDbEUsV0FBTztBQUFBLEVBQ1g7QUFtQk8sV0FBUyxlQUFlLE9BQU87QUFDbEMsUUFBSSxPQUFPLFVBQVUsU0FBVSxRQUFPO0FBQ3RDLFFBQUk7QUFDQSxZQUFNLElBQUksS0FBSyxNQUFNLEtBQUs7QUFDMUIsYUFBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLE1BQU07QUFBQSxJQUM3RCxRQUFRO0FBQUUsYUFBTztBQUFBLElBQU87QUFBQSxFQUM1QjtBQUVPLFdBQVMsZ0JBQWdCLE9BQU87QUFDbkMsUUFBSSxPQUFPLFVBQVUsU0FBVSxRQUFPO0FBQ3RDLFFBQUk7QUFDQSxZQUFNLElBQUksS0FBSyxNQUFNLEtBQUs7QUFDMUIsYUFBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxFQUFFLE1BQU0sRUFBRTtBQUFBLElBQ2pELFFBQVE7QUFBRSxhQUFPO0FBQUEsSUFBTztBQUFBLEVBQzVCO0FBR08sV0FBUyxhQUFhLE9BQU87QUFDaEMsV0FBTyxlQUFlLEtBQUssS0FBSyxnQkFBZ0IsS0FBSztBQUFBLEVBQ3pEO0FBU0EsaUJBQXNCLFdBQVcsV0FBVztBQUN4QyxRQUFJLE9BQU8sY0FBYyxZQUFZLFVBQVUsV0FBVyxFQUFHLFFBQU87QUFDcEUsUUFBSSxhQUFhLFNBQVMsRUFBRyxRQUFPO0FBQ3BDLFFBQUksYUFBYTtBQUNiLGFBQU8sZUFBZSxXQUFXLGFBQWEsWUFBWTtBQUFBLElBQzlEO0FBQ0EsV0FBTyxxQkFBcUIsU0FBUztBQUFBLEVBQ3pDO0FBT0EsaUJBQXNCLGFBQWEsT0FBTztBQUN0QyxRQUFJLE9BQU8sVUFBVSxZQUFZLE1BQU0sV0FBVyxFQUFHLFFBQU87QUFDNUQsUUFBSSxDQUFDLGFBQWEsS0FBSyxFQUFHLFFBQU87QUFDakMsUUFBSSxjQUFjLE9BQU87QUFDckIsWUFBTSxJQUFJLE1BQU0scURBQWdEO0FBQUEsSUFDcEU7QUFDQSxRQUFJLGdCQUFnQixLQUFLLEdBQUc7QUFDeEIsYUFBTyxxQkFBcUIsS0FBSztBQUFBLElBQ3JDO0FBRUEsUUFBSSxDQUFDLGFBQWE7QUFDZCxZQUFNLElBQUksTUFBTSxvREFBb0Q7QUFBQSxJQUN4RTtBQUNBLFdBQU8sZUFBZSxPQUFPLFdBQVc7QUFBQSxFQUM1Qzs7O0FEcmpCQSxNQUFNLGFBQWE7QUFDbkIsTUFBTSxXQUFXO0FBQ2pCLE1BQU0sWUFBWTtBQUNsQixNQUFNLGVBQWU7QUFDckIsTUFBTSxnQkFBZ0I7QUFDdEIsTUFBTSxvQkFBb0I7QUFXMUIsTUFBTSxXQUFXO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsRUFDZDtBQUVBLE1BQU0sVUFBVSxJQUFJLFFBQVE7QUFDNUIsTUFBSSxZQUFZO0FBVWhCLFdBQVMsV0FBVyxLQUFLLFlBQVk7QUFDakMsVUFBTSxTQUFTLENBQUM7QUFDaEIsYUFBUyxJQUFJLEdBQUcsSUFBSSxXQUFXLFFBQVEsS0FBSyxXQUFXLEtBQUs7QUFFeEQsYUFBTyxLQUFLLFdBQVcsTUFBTSxHQUFHLElBQUksV0FBVyxHQUFHLENBQUM7QUFBQSxJQUN2RDtBQUNBLFFBQUksT0FBTyxXQUFXLEdBQUc7QUFFckIsYUFBTyxDQUFDLEVBQUUsS0FBSyxPQUFPLFdBQVcsQ0FBQztBQUFBLElBQ3RDO0FBRUEsVUFBTSxVQUFVLENBQUM7QUFDakIsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztBQUNwQyxjQUFRLEtBQUssRUFBRSxLQUFLLEdBQUcsWUFBWSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsSUFDeEU7QUFFQSxZQUFRLEtBQUssRUFBRSxLQUFLLE9BQU8sS0FBSyxVQUFVLEVBQUUsV0FBVyxNQUFNLE9BQU8sT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQ3RGLFdBQU87QUFBQSxFQUNYO0FBaUNBLGlCQUFlLG1CQUFtQjtBQUM5QixVQUFNLE1BQU0sTUFBTSxRQUFRLElBQUksSUFBSTtBQUNsQyxVQUFNLFVBQVUsQ0FBQztBQU1qQixVQUFNLFdBQVcsT0FBSyxDQUFDLEtBQUssYUFBYSxDQUFDO0FBRzFDLFFBQUksSUFBSSxVQUFVO0FBQ2QsWUFBTSxnQkFBZ0IsSUFBSSxTQUFTLElBQUksT0FBSztBQUN4QyxjQUFNLEVBQUUsT0FBTyxHQUFHLEtBQUssSUFBSTtBQUMzQixZQUFJLEtBQUssV0FBVyxDQUFDLFNBQVMsS0FBSyxPQUFPLEdBQUc7QUFDekMsa0JBQVEsS0FBSyxpRUFBNEQ7QUFDekUsZUFBSyxVQUFVO0FBQUEsUUFDbkI7QUFDQSxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQ0QsWUFBTSxPQUFPLEtBQUssVUFBVSxhQUFhO0FBQ3pDLGNBQVEsS0FBSyxFQUFFLEtBQUssWUFBWSxZQUFZLE1BQU0sVUFBVSxTQUFTLGFBQWEsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLElBQ3pHO0FBQ0EsUUFBSSxJQUFJLGdCQUFnQixNQUFNO0FBQzFCLFlBQU0sT0FBTyxLQUFLLFVBQVUsSUFBSSxZQUFZO0FBQzVDLGNBQVEsS0FBSyxFQUFFLEtBQUssZ0JBQWdCLFlBQVksTUFBTSxVQUFVLFNBQVMsYUFBYSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsSUFDN0c7QUFDQSxRQUFJLElBQUksZUFBZSxNQUFNO0FBQ3pCLFlBQU0sT0FBTyxLQUFLLFVBQVUsSUFBSSxXQUFXO0FBQzNDLGNBQVEsS0FBSyxFQUFFLEtBQUssZUFBZSxZQUFZLE1BQU0sVUFBVSxTQUFTLGFBQWEsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLElBQzVHO0FBR0EsVUFBTSxlQUFlLENBQUMsbUJBQW1CLFdBQVcsb0JBQW9CLGlCQUFpQjtBQUN6RixlQUFXLEtBQUssY0FBYztBQUMxQixVQUFJLElBQUksQ0FBQyxLQUFLLE1BQU07QUFDaEIsY0FBTSxPQUFPLEtBQUssVUFBVSxJQUFJLENBQUMsQ0FBQztBQUNsQyxnQkFBUSxLQUFLLEVBQUUsS0FBSyxHQUFHLFlBQVksTUFBTSxVQUFVLFNBQVMsYUFBYSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsTUFDaEc7QUFBQSxJQUNKO0FBRUEsZUFBVyxLQUFLLE9BQU8sS0FBSyxHQUFHLEdBQUc7QUFDOUIsVUFBSSxFQUFFLFdBQVcsVUFBVSxHQUFHO0FBQzFCLGNBQU0sT0FBTyxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUM7QUFDbEMsZ0JBQVEsS0FBSyxFQUFFLEtBQUssR0FBRyxZQUFZLE1BQU0sVUFBVSxTQUFTLGFBQWEsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLE1BQ2hHO0FBQUEsSUFDSjtBQUdBLFFBQUksSUFBSSxlQUFlLElBQUksWUFBWSxNQUFNO0FBQ3pDLFlBQU0sV0FBVyxDQUFDO0FBQ2xCLGlCQUFXLENBQUMsSUFBSSxHQUFHLEtBQUssT0FBTyxRQUFRLElBQUksWUFBWSxJQUFJLEdBQUc7QUFDMUQsWUFBSSxTQUFTLElBQUksTUFBTSxHQUFHO0FBQ3RCLG1CQUFTLEVBQUUsSUFBSTtBQUFBLFFBQ25CLE9BQU87QUFDSCxrQkFBUSxLQUFLLG9FQUErRDtBQUFBLFFBQ2hGO0FBQUEsTUFDSjtBQUNBLFlBQU0sWUFBWSxFQUFFLEdBQUcsSUFBSSxhQUFhLE1BQU0sU0FBUztBQUN2RCxZQUFNLE9BQU8sS0FBSyxVQUFVLFNBQVM7QUFDckMsY0FBUSxLQUFLLEVBQUUsS0FBSyxlQUFlLFlBQVksTUFBTSxVQUFVLFNBQVMsWUFBWSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsSUFDM0c7QUFHQSxRQUFJLElBQUksYUFBYSxPQUFPLElBQUksY0FBYyxVQUFVO0FBQ3BELFlBQU0sT0FBTyxPQUFPLE9BQU8sSUFBSSxTQUFTLEVBQUUsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFLGFBQWEsTUFBTSxFQUFFLGFBQWEsRUFBRTtBQUNoRyxpQkFBVyxPQUFPLE1BQU07QUFDcEIsWUFBSSxDQUFDLFNBQVMsSUFBSSxPQUFPLEdBQUc7QUFDeEIsa0JBQVEsS0FBSyx1RUFBa0U7QUFDL0U7QUFBQSxRQUNKO0FBQ0EsY0FBTSxTQUFTLFlBQVksSUFBSSxJQUFJO0FBQ25DLGNBQU0sT0FBTyxLQUFLLFVBQVUsR0FBRztBQUMvQixnQkFBUSxLQUFLLEVBQUUsS0FBSyxRQUFRLFlBQVksTUFBTSxVQUFVLFNBQVMsVUFBVSxNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsTUFDbEc7QUFBQSxJQUNKO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFNQSxpQkFBZSxhQUFhO0FBQ3hCLFFBQUksQ0FBQyxJQUFJLFFBQVEsS0FBTTtBQUV2QixVQUFNLFVBQVUsTUFBTSxjQUFjO0FBQ3BDLFFBQUksQ0FBQyxRQUFTO0FBRWQsUUFBSTtBQUNBLFlBQU0sVUFBVSxNQUFNLGlCQUFpQjtBQUd2QyxjQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUc5QyxVQUFJLFlBQVk7QUFDaEIsVUFBSSxZQUFZO0FBQ2hCLFlBQU0sY0FBYyxDQUFDO0FBQ3JCLFlBQU0sY0FBYyxDQUFDO0FBQ3JCLFVBQUksa0JBQWtCO0FBRXRCLGlCQUFXLFNBQVMsU0FBUztBQUN6QixZQUFJLGdCQUFpQjtBQUVyQixjQUFNLFNBQVMsV0FBVyxNQUFNLEtBQUssTUFBTSxVQUFVO0FBQ3JELFlBQUksWUFBWTtBQUNoQixtQkFBVyxLQUFLLFFBQVE7QUFDcEIsdUJBQWEsRUFBRSxJQUFJLFVBQVUsT0FBTyxFQUFFLFVBQVUsV0FBVyxFQUFFLE1BQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxLQUFLLEVBQUU7QUFBQSxRQUN4RztBQUVBLFlBQUksWUFBWSxZQUFZLGFBQWEsT0FBTyxZQUFZLE9BQU8sU0FBUyxZQUFZLEdBQUc7QUFDdkYsY0FBSSxNQUFNLFlBQVksU0FBUyxZQUFZO0FBQUEsVUFFM0MsT0FBTztBQUNILG9CQUFRLEtBQUssOENBQThDLE1BQU0sUUFBUSw4QkFBOEI7QUFDdkcsOEJBQWtCO0FBQ2xCO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFFQSxtQkFBVyxLQUFLLFFBQVE7QUFDcEIsc0JBQVksRUFBRSxHQUFHLElBQUksRUFBRTtBQUN2QixzQkFBWSxLQUFLLEVBQUUsR0FBRztBQUFBLFFBQzFCO0FBQ0EscUJBQWE7QUFDYixxQkFBYSxPQUFPO0FBQUEsTUFDeEI7QUFHQSxZQUFNLE9BQU87QUFBQSxRQUNULGVBQWUsS0FBSyxJQUFJO0FBQUEsUUFDeEIsTUFBTTtBQUFBLE1BQ1Y7QUFDQSxrQkFBWSxhQUFhLElBQUksS0FBSyxVQUFVLElBQUk7QUFHaEQsWUFBTSxJQUFJLFFBQVEsS0FBSyxJQUFJLFdBQVc7QUFHdEMsVUFBSTtBQUNBLGNBQU0sV0FBVyxNQUFNLElBQUksUUFBUSxLQUFLLElBQUksSUFBSTtBQUNoRCxjQUFNLGFBQWEsT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUFBLFVBQU8sT0FDNUMsTUFBTSxpQkFBaUIsQ0FBQyxZQUFZLFNBQVMsQ0FBQztBQUFBLFFBQ2xEO0FBQ0EsWUFBSSxXQUFXLFNBQVMsR0FBRztBQUN2QixnQkFBTSxJQUFJLFFBQVEsS0FBSyxPQUFPLFVBQVU7QUFBQSxRQUM1QztBQUFBLE1BQ0osUUFBUTtBQUFBLE1BRVI7QUFFQSxjQUFRLElBQUksd0JBQXdCLFlBQVksTUFBTSxhQUFhLFNBQVMseUJBQXlCO0FBQUEsSUFDekcsU0FBUyxHQUFHO0FBQ1IsY0FBUSxNQUFNLG1DQUFtQyxDQUFDO0FBQUEsSUFFdEQ7QUFBQSxFQUNKO0FBd0xPLFdBQVMsbUJBQW1CO0FBQy9CLFFBQUksQ0FBQyxJQUFJLFFBQVEsS0FBTTtBQUN2QixRQUFJLFVBQVcsY0FBYSxTQUFTO0FBQ3JDLGdCQUFZLFdBQVcsTUFBTTtBQUN6QixrQkFBWTtBQUNaLGlCQUFXO0FBQUEsSUFDZixHQUFHLEdBQUk7QUFBQSxFQUNYO0FBTUEsaUJBQXNCLGdCQUFnQjtBQUNsQyxVQUFNLE9BQU8sTUFBTSxRQUFRLElBQUksRUFBRSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztBQUM1RCxXQUFPLEtBQUssaUJBQWlCO0FBQUEsRUFDakM7OztBRHpiQSxNQUFNQyxXQUFVLElBQUksUUFBUTtBQUM1QixNQUFNLGNBQWM7QUFFcEIsaUJBQWUsVUFBVTtBQUNyQixVQUFNLE9BQU8sTUFBTUEsU0FBUSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDcEQsV0FBTyxLQUFLLFdBQVcsS0FBSyxDQUFDO0FBQUEsRUFDakM7QUFhQSxpQkFBZSxXQUFXLEtBQUs7QUFDM0IsUUFBSSxDQUFDLElBQUssUUFBTztBQUNqQixRQUFJO0FBQ0EsYUFBTyxFQUFFLEdBQUcsS0FBSyxTQUFTLE1BQU0sYUFBYSxJQUFJLE9BQU8sRUFBRTtBQUFBLElBQzlELFNBQVMsR0FBRztBQUNSLFVBQUksT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLFdBQVcsUUFBUSxFQUFHLE9BQU07QUFDeEQsYUFBTyxFQUFFLEdBQUcsS0FBSyxTQUFTLE1BQU0sZUFBZSxLQUFLO0FBQUEsSUFDeEQ7QUFBQSxFQUNKO0FBRUEsaUJBQWUsUUFBUSxNQUFNO0FBQ3pCLFVBQU1BLFNBQVEsSUFBSSxFQUFFLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUN6QyxxQkFBaUI7QUFBQSxFQUNyQjtBQU1BLGlCQUFzQixnQkFBZ0I7QUFDbEMsVUFBTSxPQUFPLE1BQU0sUUFBUTtBQUMzQixVQUFNLE1BQU0sQ0FBQztBQUNiLGVBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxPQUFPLFFBQVEsSUFBSSxHQUFHO0FBQzVDLFVBQUksSUFBSSxJQUFJLE1BQU0sV0FBVyxHQUFHO0FBQUEsSUFDcEM7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQU9BLGlCQUFzQixZQUFZLE1BQU07QUFDcEMsVUFBTSxPQUFPLE1BQU0sUUFBUTtBQUMzQixXQUFPLEtBQUssSUFBSSxJQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsSUFBSTtBQUFBLEVBQ2pEO0FBS0EsaUJBQXNCLGtCQUFrQixNQUFNLFNBQVMsWUFBWSxVQUFVLE1BQU0saUJBQWlCLE1BQU07QUFDdEcsVUFBTSxPQUFPLE1BQU0sUUFBUTtBQUMzQixVQUFNLFdBQVcsS0FBSyxJQUFJO0FBQzFCLFNBQUssSUFBSSxJQUFJO0FBQUEsTUFDVDtBQUFBLE1BQ0EsU0FBUyxNQUFNLFdBQVcsT0FBTztBQUFBO0FBQUEsTUFDakMsV0FBVyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksR0FBSTtBQUFBLE1BQ3ZDO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLGNBQWMsVUFBVSxnQkFBZ0I7QUFBQSxJQUM1QztBQUNBLFVBQU0sUUFBUSxJQUFJO0FBQ2xCLFdBQU8sV0FBVyxLQUFLLElBQUksQ0FBQztBQUFBLEVBQ2hDO0FBS0EsaUJBQXNCLG9CQUFvQixNQUFNO0FBQzVDLFVBQU0sT0FBTyxNQUFNLFFBQVE7QUFDM0IsV0FBTyxLQUFLLElBQUk7QUFDaEIsVUFBTSxRQUFRLElBQUk7QUFBQSxFQUN0QjtBQU1BLGlCQUFzQixnQkFBZ0I7QUFDbEMsVUFBTSxPQUFPLE1BQU0sUUFBUTtBQUMzQixVQUFNLFlBQVksQ0FBQztBQUNuQixlQUFXLE9BQU8sT0FBTyxPQUFPLElBQUksR0FBRztBQUNuQyxnQkFBVSxLQUFLLE1BQU0sV0FBVyxHQUFHLENBQUM7QUFBQSxJQUN4QztBQUNBLFdBQU8sVUFBVSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVM7QUFBQSxFQUM3RDtBQUtBLGlCQUFzQixpQkFBaUIsTUFBTSxRQUFRLFVBQVUsTUFBTSxpQkFBaUIsTUFBTTtBQUN4RixVQUFNLE9BQU8sTUFBTSxRQUFRO0FBQzNCLFFBQUksQ0FBQyxLQUFLLElBQUksRUFBRyxRQUFPO0FBQ3hCLFNBQUssSUFBSSxFQUFFLGFBQWE7QUFDeEIsUUFBSSxZQUFZLEtBQU0sTUFBSyxJQUFJLEVBQUUsVUFBVTtBQUMzQyxRQUFJLG1CQUFtQixLQUFNLE1BQUssSUFBSSxFQUFFLGlCQUFpQjtBQUN6RCxVQUFNLFFBQVEsSUFBSTtBQUNsQixXQUFPLEtBQUssSUFBSTtBQUFBLEVBQ3BCOzs7QUZySEEsTUFBTSxRQUFRO0FBQUEsSUFDVixXQUFXLENBQUM7QUFBQSxJQUNaLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGlCQUFpQjtBQUFBLElBQ2pCLGtCQUFrQjtBQUFBLElBQ2xCLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFdBQVcsRUFBRSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRTtBQUFBLEVBQ3JDO0FBRUEsV0FBUyxFQUFFLElBQUk7QUFBRSxXQUFPLFNBQVMsZUFBZSxFQUFFO0FBQUEsRUFBRztBQUVyRCxXQUFTLFlBQVk7QUFDakIsV0FBTyxNQUFNLFVBQVUsS0FBSyxTQUFTLEtBQUssTUFBTSxVQUFVLE1BQU0sU0FBUztBQUFBLEVBQzdFO0FBRUEsV0FBUyx1QkFBdUI7QUFDNUIsUUFBSSxDQUFDLE1BQU0sWUFBYSxRQUFPLE1BQU07QUFDckMsVUFBTSxJQUFJLE1BQU0sWUFBWSxZQUFZO0FBQ3hDLFdBQU8sTUFBTSxVQUFVLE9BQU8sT0FBSyxFQUFFLEtBQUssWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQUEsRUFDdkU7QUFFQSxXQUFTLFVBQVU7QUFDZixXQUFPLE1BQU0sa0JBQWtCLE1BQU0sbUJBQW1CLE1BQU0sZ0JBQWdCLE1BQU07QUFBQSxFQUN4RjtBQUVBLFdBQVMsVUFBVSxLQUFLO0FBQ3BCLFVBQU0sUUFBUTtBQUNkLFdBQU87QUFDUCxlQUFXLE1BQU07QUFBRSxZQUFNLFFBQVE7QUFBSSxhQUFPO0FBQUEsSUFBRyxHQUFHLEdBQUk7QUFBQSxFQUMxRDtBQUVBLFdBQVMsZ0JBQWdCLFFBQVE7QUFDN0IsUUFBSSxXQUFXLE9BQVEsUUFBTztBQUM5QixRQUFJLFdBQVcsVUFBVyxRQUFPO0FBQ2pDLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxpQkFBaUI7QUFDdEIsUUFBSSxNQUFNLHFCQUFxQixVQUFXLFFBQU87QUFDakQsUUFBSSxNQUFNLHFCQUFxQixRQUFTLFFBQU8sTUFBTTtBQUNyRCxXQUFPO0FBQUEsRUFDWDtBQUVBLFdBQVMsYUFBYSxZQUFZO0FBQzlCLFFBQUksZUFBZSxTQUFVLFFBQU87QUFDcEMsUUFBSSxlQUFlLGFBQWMsUUFBTztBQUN4QyxXQUFPO0FBQUEsRUFDWDtBQUVBLFdBQVMsU0FBUztBQUVkLFVBQU0sVUFBVSxFQUFFLFVBQVU7QUFDNUIsVUFBTSxXQUFXLEVBQUUsV0FBVztBQUM5QixVQUFNLFVBQVUsRUFBRSxVQUFVO0FBQzVCLFVBQU0sV0FBVyxFQUFFLFdBQVc7QUFFOUIsUUFBSSxRQUFTLFNBQVEsWUFBWSxPQUFPLGdCQUFnQixNQUFNLGdCQUFnQixDQUFDO0FBQy9FLFFBQUksU0FBVSxVQUFTLGNBQWMsZUFBZTtBQUNwRCxRQUFJLFFBQVMsU0FBUSxXQUFXLE1BQU0scUJBQXFCLGFBQWEsQ0FBQyxVQUFVO0FBQ25GLFFBQUksU0FBVSxVQUFTLGNBQWMsTUFBTSxVQUFVLFNBQVMsVUFBVSxNQUFNLFVBQVUsV0FBVyxJQUFJLE1BQU07QUFHN0csVUFBTSxXQUFXLEVBQUUsV0FBVztBQUM5QixVQUFNLFdBQVcsRUFBRSxjQUFjO0FBQ2pDLFVBQU0sV0FBVyxxQkFBcUI7QUFFdEMsUUFBSSxVQUFVO0FBQ1YsZUFBUyxZQUFZLFNBQVMsSUFBSSxTQUFPO0FBQUE7QUFBQSxrQ0FFZixNQUFNLGlCQUFpQixJQUFJLE9BQU8sYUFBYSxFQUFFO0FBQUEsaUNBQ2xELElBQUksSUFBSTtBQUFBO0FBQUEsMERBRWlCLElBQUksSUFBSTtBQUFBO0FBQUEsdUNBRTNCLElBQUksZ0JBQWdCLGFBQWEsYUFBYSxJQUFJLFVBQVUsQ0FBQztBQUFBLHlDQUMzRCxJQUFJLGdCQUFnQixrQkFBa0IsSUFBSSxVQUFVO0FBQUE7QUFBQTtBQUFBLFNBR3BGLEVBQUUsS0FBSyxFQUFFO0FBRVYsZUFBUyxpQkFBaUIsaUJBQWlCLEVBQUUsUUFBUSxRQUFNO0FBQ3ZELFdBQUcsaUJBQWlCLFNBQVMsTUFBTSxlQUFlLEdBQUcsUUFBUSxPQUFPLENBQUM7QUFBQSxNQUN6RSxDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksU0FBVSxVQUFTLE1BQU0sVUFBVSxTQUFTLFdBQVcsSUFBSSxVQUFVO0FBR3pFLFVBQU0sY0FBYyxFQUFFLGNBQWM7QUFDcEMsVUFBTSxjQUFjLEVBQUUsY0FBYztBQUNwQyxVQUFNLGFBQWEsTUFBTSxpQkFBaUIsUUFBUSxNQUFNO0FBRXhELFFBQUksWUFBYSxhQUFZLE1BQU0sVUFBVSxhQUFhLFVBQVU7QUFDcEUsUUFBSSxZQUFhLGFBQVksTUFBTSxVQUFVLGFBQWEsU0FBUztBQUVuRSxRQUFJLFlBQVk7QUFDWixZQUFNLGFBQWEsRUFBRSxjQUFjO0FBQ25DLFlBQU0sY0FBYyxFQUFFLGdCQUFnQjtBQUN0QyxZQUFNLFVBQVUsRUFBRSxjQUFjO0FBQ2hDLFlBQU0sWUFBWSxFQUFFLGdCQUFnQjtBQUNwQyxZQUFNLGFBQWEsRUFBRSxhQUFhO0FBRWxDLFVBQUksV0FBWSxZQUFXLFFBQVEsTUFBTTtBQUN6QyxVQUFJLFlBQWEsYUFBWSxRQUFRLE1BQU07QUFDM0MsVUFBSSxTQUFTO0FBQ1QsZ0JBQVEsV0FBVyxNQUFNLFVBQVUsTUFBTSxZQUFZLEtBQUssRUFBRSxXQUFXO0FBQ3ZFLGdCQUFRLGNBQWMsTUFBTSxTQUFTLGNBQWM7QUFBQSxNQUN2RDtBQUNBLFVBQUksVUFBVyxXQUFVLE1BQU0sVUFBVSxNQUFNLGlCQUFpQixRQUFRLENBQUMsTUFBTSxRQUFRLGdCQUFnQjtBQUN2RyxVQUFJLFdBQVksWUFBVyxNQUFNLFVBQVUsUUFBUSxJQUFJLFdBQVc7QUFBQSxJQUN0RTtBQUdBLFVBQU0sY0FBYyxFQUFFLGNBQWM7QUFDcEMsUUFBSSxlQUFlLFNBQVMsa0JBQWtCLGFBQWE7QUFDdkQsa0JBQVksUUFBUSxNQUFNO0FBQUEsSUFDOUI7QUFHQSxVQUFNLFFBQVEsRUFBRSxPQUFPO0FBQ3ZCLFFBQUksT0FBTztBQUNQLFlBQU0sY0FBYyxNQUFNO0FBQzFCLFlBQU0sTUFBTSxVQUFVLE1BQU0sUUFBUSxVQUFVO0FBQUEsSUFDbEQ7QUFBQSxFQUNKO0FBRUEsV0FBUyxjQUFjO0FBQ25CLFVBQU0sUUFBUTtBQUNkLFVBQU0sZUFBZTtBQUNyQixVQUFNLGNBQWM7QUFDcEIsVUFBTSxnQkFBZ0I7QUFDdEIsVUFBTSxnQkFBZ0I7QUFDdEIsVUFBTSxrQkFBa0I7QUFDeEIsV0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBZSxlQUFlLE1BQU07QUFDaEMsVUFBTSxNQUFNLE1BQU0sWUFBWSxJQUFJO0FBQ2xDLFFBQUksQ0FBQyxJQUFLO0FBQ1YsUUFBSSxJQUFJLGVBQWU7QUFHbkIsZ0JBQVUsdUVBQWtFO0FBQzVFO0FBQUEsSUFDSjtBQUVBLFVBQU0sUUFBUTtBQUNkLFVBQU0sZUFBZTtBQUNyQixVQUFNLGNBQWMsSUFBSTtBQUN4QixVQUFNLGdCQUFnQixJQUFJO0FBQzFCLFVBQU0sZ0JBQWdCLElBQUk7QUFDMUIsVUFBTSxrQkFBa0IsSUFBSTtBQUM1QixXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFlLGVBQWU7QUFDMUIsVUFBTSxRQUFRLE1BQU0sWUFBWSxLQUFLO0FBQ3JDLFFBQUksQ0FBQyxNQUFPO0FBRVosVUFBTSxTQUFTO0FBQ2YsV0FBTztBQUVQLFFBQUk7QUFDQSxZQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWTtBQUFBLFFBQ3pDLE1BQU07QUFBQSxRQUNOLFNBQVMsRUFBRSxNQUFNLE9BQU8sU0FBUyxNQUFNLGNBQWM7QUFBQSxNQUN6RCxDQUFDO0FBRUQsVUFBSSxPQUFPLFNBQVM7QUFDaEIsWUFBSSxNQUFNLGdCQUFnQixNQUFNLGlCQUFpQixPQUFPO0FBQ3BELGdCQUFNLG9CQUFvQixNQUFNLFlBQVk7QUFBQSxRQUNoRDtBQUNBLGNBQU0sa0JBQWtCLE9BQU8sTUFBTSxlQUFlLFVBQVUsT0FBTyxTQUFTLE9BQU8sU0FBUztBQUM5RixjQUFNLGVBQWU7QUFDckIsY0FBTSxRQUFRO0FBQ2QsY0FBTSxnQkFBZ0I7QUFDdEIsY0FBTSxrQkFBa0IsTUFBTTtBQUM5QixjQUFNLFlBQVksTUFBTSxjQUFjO0FBQ3RDLGtCQUFVLE9BQU87QUFBQSxNQUNyQixPQUFPO0FBQ0gsY0FBTSxrQkFBa0IsT0FBTyxNQUFNLGVBQWUsWUFBWTtBQUNoRSxZQUFJLE1BQU0sZ0JBQWdCLE1BQU0saUJBQWlCLE9BQU87QUFDcEQsZ0JBQU0sb0JBQW9CLE1BQU0sWUFBWTtBQUFBLFFBQ2hEO0FBQ0EsY0FBTSxlQUFlO0FBQ3JCLGNBQU0sUUFBUTtBQUNkLGNBQU0sZ0JBQWdCO0FBQ3RCLGNBQU0sa0JBQWtCLE1BQU07QUFDOUIsY0FBTSxZQUFZLE1BQU0sY0FBYztBQUN0QyxrQkFBVSxrQ0FBa0MsT0FBTyxTQUFTLGFBQWEsR0FBRztBQUFBLE1BQ2hGO0FBQUEsSUFDSixTQUFTLEdBQUc7QUFDUixZQUFNLGtCQUFrQixNQUFNLFlBQVksS0FBSyxHQUFHLE1BQU0sZUFBZSxZQUFZO0FBQ25GLFlBQU0sZUFBZSxNQUFNLFlBQVksS0FBSztBQUM1QyxZQUFNLFFBQVE7QUFDZCxZQUFNLGdCQUFnQixNQUFNO0FBQzVCLFlBQU0sa0JBQWtCLE1BQU07QUFDOUIsWUFBTSxZQUFZLE1BQU0sY0FBYztBQUN0QyxnQkFBVSx5QkFBeUI7QUFBQSxJQUN2QztBQUVBLFVBQU0sU0FBUztBQUNmLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsaUJBQWlCO0FBQzVCLFFBQUksQ0FBQyxNQUFNLGFBQWM7QUFDekIsUUFBSSxDQUFFLE1BQU0sV0FBVyxFQUFFLE9BQU8sV0FBVyxNQUFNLFlBQVksTUFBTSxNQUFNLHVHQUF1RyxjQUFjLG1CQUFtQixhQUFhLEtBQUssQ0FBQyxFQUFJO0FBRXhPLFVBQU0sTUFBTSxNQUFNLFlBQVksTUFBTSxZQUFZO0FBRWhELFFBQUksS0FBSyxTQUFTO0FBQ2QsVUFBSTtBQUNBLGNBQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxVQUMxQixNQUFNO0FBQUEsVUFDTixTQUFTLEVBQUUsTUFBTSxNQUFNLGNBQWMsU0FBUyxJQUFJLFFBQVE7QUFBQSxRQUM5RCxDQUFDO0FBQUEsTUFDTCxTQUFTLEdBQUc7QUFBQSxNQUFDO0FBQUEsSUFDakI7QUFFQSxVQUFNLG9CQUFvQixNQUFNLFlBQVk7QUFDNUMsVUFBTSxlQUFlO0FBQ3JCLFVBQU0sUUFBUTtBQUNkLFVBQU0sY0FBYztBQUNwQixVQUFNLGdCQUFnQjtBQUN0QixVQUFNLGdCQUFnQjtBQUN0QixVQUFNLGtCQUFrQjtBQUN4QixVQUFNLFlBQVksTUFBTSxjQUFjO0FBQ3RDLGNBQVUsU0FBUztBQUNuQixXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFlLFVBQVU7QUFDckIsVUFBTSxtQkFBbUI7QUFDekIsVUFBTSxZQUFZO0FBQ2xCLFdBQU87QUFFUCxRQUFJO0FBQ0EsWUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVwRSxVQUFJLENBQUMsT0FBTyxTQUFTO0FBQ2pCLGNBQU0sbUJBQW1CO0FBQ3pCLGNBQU0sWUFBWSxPQUFPLFNBQVM7QUFDbEMsZUFBTztBQUNQO0FBQUEsTUFDSjtBQUVBLFlBQU0sWUFBWSxNQUFNLGNBQWM7QUFFdEMsaUJBQVcsVUFBVSxPQUFPLFdBQVc7QUFDbkMsY0FBTSxRQUFRLFVBQVUsT0FBTyxJQUFJO0FBRW5DLFlBQUksQ0FBQyxPQUFPO0FBQ1IsZ0JBQU0sa0JBQWtCLE9BQU8sTUFBTSxPQUFPLFNBQVMsVUFBVSxPQUFPLFNBQVMsT0FBTyxTQUFTO0FBQUEsUUFDbkcsV0FBVyxNQUFNLGVBQWUsY0FBYztBQUMxQyxjQUFJLE1BQU0sWUFBWSxPQUFPLFNBQVM7QUFDbEMsa0JBQU0saUJBQWlCLE9BQU8sTUFBTSxZQUFZLE9BQU8sU0FBUyxPQUFPLFNBQVM7QUFBQSxVQUNwRjtBQUFBLFFBQ0osV0FBVyxDQUFDLE1BQU0sa0JBQWtCLE9BQU8sWUFBWSxNQUFNLGdCQUFnQjtBQUN6RSxnQkFBTSxrQkFBa0IsT0FBTyxNQUFNLE9BQU8sU0FBUyxVQUFVLE9BQU8sU0FBUyxPQUFPLFNBQVM7QUFDL0YsY0FBSSxNQUFNLGlCQUFpQixPQUFPLE1BQU07QUFDcEMsa0JBQU0sZ0JBQWdCLE9BQU87QUFDN0Isa0JBQU0sa0JBQWtCLE9BQU87QUFBQSxVQUNuQztBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBRUEsWUFBTSxZQUFZLE1BQU0sY0FBYztBQUN0QyxZQUFNLG1CQUFtQjtBQUFBLElBQzdCLFNBQVMsR0FBRztBQUNSLFlBQU0sbUJBQW1CO0FBQ3pCLFlBQU0sWUFBWSxFQUFFLFdBQVc7QUFBQSxJQUNuQztBQUVBLFdBQU87QUFBQSxFQUNYO0FBRUEsV0FBUyxhQUFhO0FBQ2xCLE1BQUUsYUFBYSxHQUFHLGlCQUFpQixTQUFTLFdBQVc7QUFDdkQsTUFBRSxVQUFVLEdBQUcsaUJBQWlCLFNBQVMsT0FBTztBQUNoRCxNQUFFLGNBQWMsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQ3pELE1BQUUsZ0JBQWdCLEdBQUcsaUJBQWlCLFNBQVMsY0FBYztBQUU3RCxNQUFFLGNBQWMsR0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDaEQsWUFBTSxjQUFjLEVBQUUsT0FBTztBQUM3QixhQUFPO0FBQUEsSUFDWCxDQUFDO0FBRUQsTUFBRSxjQUFjLEdBQUcsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ2hELFlBQU0sY0FBYyxFQUFFLE9BQU87QUFDN0IsYUFBTztBQUFBLElBQ1gsQ0FBQztBQUVELE1BQUUsZ0JBQWdCLEdBQUcsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ2xELFlBQU0sZ0JBQWdCLEVBQUUsT0FBTztBQUMvQixhQUFPO0FBQUEsSUFDWCxDQUFDO0FBRUQsTUFBRSxXQUFXLEdBQUcsaUJBQWlCLFNBQVMsTUFBTSxPQUFPLE1BQU0sQ0FBQztBQUFBLEVBQ2xFO0FBRUEsaUJBQWUsT0FBTztBQUVsQixVQUFNLGNBQWMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pFLFVBQU0sT0FBTyxFQUFFLG1CQUFtQjtBQUNsQyxVQUFNLE9BQU8sRUFBRSxvQkFBb0I7QUFFbkMsUUFBSSxDQUFDLGFBQWE7QUFDZCxVQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsVUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBQy9CLFFBQUUsbUJBQW1CLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNwRCxjQUFNLE1BQU0sSUFBSSxRQUFRLE9BQU8sd0JBQXdCO0FBQ3ZELGVBQU8sS0FBSyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3ZDLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFFQSxRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBRS9CLFFBQUk7QUFDQSxZQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEUsWUFBTSxZQUFZLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RELFNBQVMsR0FBRztBQUNSLGNBQVEsS0FBSyxrQ0FBa0MsRUFBRSxPQUFPO0FBQ3hELFlBQU0sWUFBWSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDNUM7QUFFQSxRQUFJO0FBQ0EsWUFBTSxZQUFZLE1BQU0sY0FBYztBQUFBLElBQzFDLFNBQVMsR0FBRztBQUNSLGNBQVEsTUFBTSxxQ0FBcUMsRUFBRSxPQUFPO0FBQzVELFlBQU0sWUFBWSxDQUFDO0FBQUEsSUFDdkI7QUFFQSxlQUFXO0FBQ1gsV0FBTztBQUVQLFFBQUksVUFBVSxHQUFHO0FBQ2IsVUFBSTtBQUNBLGNBQU0sUUFBUTtBQUFBLE1BQ2xCLFNBQVMsR0FBRztBQUNSLGdCQUFRLEtBQUssd0JBQXdCLEVBQUUsT0FBTztBQUFBLE1BQ2xEO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsidGFyZ2V0IiwgIklWX0JZVEVTIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJhcGkiLCAiSVZfQllURVMiLCAic3RvcmFnZSJdCn0K
