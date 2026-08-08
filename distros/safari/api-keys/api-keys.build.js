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

  // src/utilities/api-key-store.js
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

  // src/utilities/api-key-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "apiKeyVault";
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
    await setStore(store);
    return decryptKey(store.keys[id]);
  }
  async function deleteApiKey(id) {
    const store = await getStore();
    delete store.keys[id];
    await setStore(store);
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
  async function importStore(keys) {
    const store = await getStore();
    for (const [id, key] of Object.entries(keys)) {
      const secret = isCiphertext(key.secret) ? key.secret : await wrapSecret(key.secret);
      store.keys[id] = { ...key, secret };
    }
    await setStore(store);
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
        el.addEventListener("click", () => copySecret(el.dataset.keyId));
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
  async function copySecret(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
      showToast("This key could not be decrypted on this device");
      return;
    }
    await navigator.clipboard.writeText(key.secret);
    state.copiedId = id;
    render();
    setTimeout(() => {
      state.copiedId = null;
      render();
    }, 2e3);
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => {
      });
    }, 3e4);
  }
  async function publishToRelay() {
    try {
      const store = await getApiKeyStore();
      const result = await api.runtime.sendMessage({
        kind: "apikeys.publish",
        payload: { keys: store.keys }
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
        const store = await getApiKeyStore();
        const localKeys = store.keys;
        const localCount = Object.keys(localKeys).length;
        if (localCount === 0) {
          await importStore(result.keys);
        } else if (!store.relayCreatedAt || result.createdAt > store.relayCreatedAt) {
          await importStore(result.keys);
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
      await importStore(keys);
      state.keys = await listApiKeys();
      if (state.syncEnabled && hasRelays()) {
        await publishToRelay();
      }
      showToast("Imported " + Object.keys(keys).length + " keys");
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
    const isEncrypted = await api.runtime.sendMessage({ kind: "isEncrypted" });
    const locked = await api.runtime.sendMessage({ kind: "isLocked" });
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
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHtcbiAgICBnZXRBcGlLZXlTdG9yZSxcbiAgICBzYXZlQXBpS2V5LFxuICAgIGRlbGV0ZUFwaUtleSxcbiAgICBsaXN0QXBpS2V5cyxcbiAgICBzZXRTeW5jRW5hYmxlZCxcbiAgICBpc1N5bmNFbmFibGVkLFxuICAgIHVwZGF0ZVN0b3JlU3luY1N0YXRlLFxuICAgIGV4cG9ydFN0b3JlLFxuICAgIGltcG9ydFN0b3JlLFxufSBmcm9tICcuLi91dGlsaXRpZXMvYXBpLWtleS1zdG9yZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGtleXM6IFtdLFxuICAgIG5ld0xhYmVsOiAnJyxcbiAgICBuZXdTZWNyZXQ6ICcnLFxuICAgIGVkaXRpbmdJZDogbnVsbCxcbiAgICBlZGl0TGFiZWw6ICcnLFxuICAgIGVkaXRTZWNyZXQ6ICcnLFxuICAgIGNvcGllZElkOiBudWxsLFxuICAgIHJldmVhbGVkSWQ6IG51bGwsXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZ2xvYmFsU3luY1N0YXR1czogJ2lkbGUnLFxuICAgIHN5bmNFcnJvcjogJycsXG4gICAgc2F2aW5nOiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIHNvcnRlZEtleXMoKSB7XG4gICAgcmV0dXJuIFsuLi5zdGF0ZS5rZXlzXS5zb3J0KChhLCBiKSA9PlxuICAgICAgICBhLmxhYmVsLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmxhYmVsLnRvTG93ZXJDYXNlKCkpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1hc2tTZWNyZXQoc2VjcmV0KSB7XG4gICAgaWYgKCFzZWNyZXQpIHJldHVybiAnJztcbiAgICBpZiAoc2VjcmV0Lmxlbmd0aCA8PSA4KSByZXR1cm4gJ1xcdTIwMjInLnJlcGVhdChzZWNyZXQubGVuZ3RoKTtcbiAgICByZXR1cm4gc2VjcmV0LnNsaWNlKDAsIDQpICsgJ1xcdTIwMjInLnJlcGVhdCg0KSArIHNlY3JldC5zbGljZSgtNCk7XG59XG5cbmZ1bmN0aW9uIHNob3dUb2FzdChtc2cpIHtcbiAgICBzdGF0ZS50b2FzdCA9IG1zZztcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUudG9hc3QgPSAnJzsgcmVuZGVyKCk7IH0sIDIwMDApO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzQ2xhc3Moc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ2lkbGUnKSByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnbGVkLS1ncmVlbicgOiAnbGVkLS1vZmYnO1xuICAgIGlmIChzdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdsZWQtLWFtYmVyIGFuaW1hdGUtcHVsc2UnO1xuICAgIHJldHVybiAnbGVkLS1yZWQnO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzVGV4dCgpIHtcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ1N5bmNpbmcuLi4nO1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnZXJyb3InKSByZXR1cm4gc3RhdGUuc3luY0Vycm9yO1xuICAgIHJldHVybiBzdGF0ZS5zeW5jRW5hYmxlZCA/ICdTeW5jZWQnIDogJ0xvY2FsIG9ubHknO1xufVxuXG4vLyAtLS0gUmVuZGVyIC0tLVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gU3luYyBiYXJcbiAgICBjb25zdCBzeW5jRG90ID0gJCgnc3luYy1kb3QnKTtcbiAgICBjb25zdCBzeW5jVGV4dCA9ICQoJ3N5bmMtdGV4dCcpO1xuICAgIGNvbnN0IHN5bmNCdG4gPSAkKCdzeW5jLWJ0bicpO1xuICAgIGNvbnN0IHN5bmNUb2dnbGUgPSAkKCdzeW5jLXRvZ2dsZScpO1xuICAgIGNvbnN0IGtleUNvdW50ID0gJCgna2V5LWNvdW50Jyk7XG5cbiAgICBpZiAoc3luY0RvdCkgc3luY0RvdC5jbGFzc05hbWUgPSBgbGVkICR7c3luY1N0YXR1c0NsYXNzKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMpfWA7XG4gICAgaWYgKHN5bmNUZXh0KSBzeW5jVGV4dC50ZXh0Q29udGVudCA9IHN5bmNTdGF0dXNUZXh0KCk7XG4gICAgaWYgKHN5bmNCdG4pIHN5bmNCdG4uZGlzYWJsZWQgPSBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycgfHwgIWhhc1JlbGF5cygpIHx8ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICBpZiAoc3luY1RvZ2dsZSkgc3luY1RvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhzdGF0ZS5zeW5jRW5hYmxlZCkpO1xuICAgIGlmIChrZXlDb3VudCkga2V5Q291bnQudGV4dENvbnRlbnQgPSBzdGF0ZS5rZXlzLmxlbmd0aCArICcga2V5JyArIChzdGF0ZS5rZXlzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEtleSB0YWJsZVxuICAgIGNvbnN0IGtleVRhYmxlQ29udGFpbmVyID0gJCgna2V5LXRhYmxlLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IG5vS2V5c01zZyA9ICQoJ25vLWtleXMnKTtcbiAgICBjb25zdCBrZXlUYWJsZUJvZHkgPSAkKCdrZXktdGFibGUtYm9keScpO1xuXG4gICAgaWYgKGtleVRhYmxlQ29udGFpbmVyKSBrZXlUYWJsZUNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUua2V5cy5sZW5ndGggPiAwID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAobm9LZXlzTXNnKSBub0tleXNNc2cuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIGlmIChrZXlUYWJsZUJvZHkpIHtcbiAgICAgICAgY29uc3Qgc29ydGVkID0gc29ydGVkS2V5cygpO1xuICAgICAgICBrZXlUYWJsZUJvZHkuaW5uZXJIVE1MID0gc29ydGVkLm1hcChrZXkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmVkaXRpbmdJZCA9PT0ga2V5LmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZSBpcy1saXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLWhlYWRlclwiPkVkaXQga2V5PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLWJvZHkgZmxleCBmbGV4LWNvbCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5zLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIktleSBsYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1sYWJlbD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtlc2NhcGVBdHRyKHN0YXRlLmVkaXRMYWJlbCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5zLWlucHV0IG1vbm9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVsbGNoZWNrPVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiU2VjcmV0IGtleVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1zZWNyZXQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0U2VjcmV0KX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZ2FwLTIganVzdGlmeS1lbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLWdob3N0IGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tcHJpbWFyeSBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwic2F2ZS1lZGl0XCI+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXZlYWxlZCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGtleS5pZDtcbiAgICAgICAgICAgIC8vIEFuIHVuZGVjcnlwdGFibGUgc2VjcmV0IG11c3QgcmVhZCBhcyBhIFBST0JMRU0sIG5ldmVyIGFzIGJsYW5rIFx1MjAxNFxuICAgICAgICAgICAgLy8gYmxhbmsgaXMgd2hhdCBtYWRlIHRoZSBvbGQgZGF0YSBsb3NzIGludmlzaWJsZS5cbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlTZWNyZXQgPSBrZXkudW5kZWNyeXB0YWJsZVxuICAgICAgICAgICAgICAgID8gJ3VucmVhZGFibGUgb24gdGhpcyBkZXZpY2UnXG4gICAgICAgICAgICAgICAgOiAocmV2ZWFsZWQgPyBlc2NhcGVIdG1sKGtleS5zZWNyZXQpIDogZXNjYXBlSHRtbChtYXNrU2VjcmV0KGtleS5zZWNyZXQpKSk7XG4gICAgICAgICAgICBjb25zdCBjb3B5TGFiZWwgPSBzdGF0ZS5jb3BpZWRJZCA9PT0ga2V5LmlkID8gJ0NvcGllZCEnIDogJ0NvcHknO1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlJHtyZXZlYWxlZCA/ICcgaXMtbGl2ZScgOiAnJ31cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInBhdGNoLXBvaW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9XCIke3JldmVhbGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCIke3JldmVhbGVkID8gJ0hpZGUgc2VjcmV0JyA6ICdSZXZlYWwgc2VjcmV0J31cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCIke3JldmVhbGVkID8gJ0hpZGUnIDogJ1JldmVhbCd9IHNlY3JldCBmb3IgJHtlc2NhcGVBdHRyKGtleS5sYWJlbCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInBhdGNoLWphY2tcIj48L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMC41IG1pbi13LTAgZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgaG92ZXI6dW5kZXJsaW5lXCIgZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIiB0aXRsZT1cIkVkaXQga2V5XCI+JHtlc2NhcGVIdG1sKGtleS5sYWJlbCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibW9ubyB0ZXh0LXhzICR7cmV2ZWFsZWQgPyAnJyA6ICdpbnMtbXV0ZWQgJ31pbnMtdHJ1bmNhdGUgY3Vyc29yLXBvaW50ZXJcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7ZGlzcGxheVNlY3JldH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicm93LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7Y29weUxhYmVsfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1zbSBidG4tLWRlc3RydWN0aXZlXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+RGVsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICAgICAgfSkuam9pbignJyk7XG5cbiAgICAgICAgLy8gQmluZCB0YWJsZSBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc3RhcnRFZGl0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXZlYWxlZElkID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0gZWwuZGF0YXNldC5rZXlJZCA/IG51bGwgOiBlbC5kYXRhc2V0LmtleUlkO1xuICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gY29weVNlY3JldChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBkZWxldGVLZXkoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlRWRpdCk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsRWRpdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJpbmQgZWRpdCBpbnB1dCBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtbGFiZWxdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRMYWJlbCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1zZWNyZXRdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQga2V5IGZvcm1cbiAgICBjb25zdCBuZXdMYWJlbElucHV0ID0gJCgnbmV3LWxhYmVsJyk7XG4gICAgY29uc3QgbmV3U2VjcmV0SW5wdXQgPSAkKCduZXctc2VjcmV0Jyk7XG4gICAgY29uc3QgYWRkS2V5QnRuID0gJCgnYWRkLWtleS1idG4nKTtcblxuICAgIGlmIChuZXdMYWJlbElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld0xhYmVsSW5wdXQpIG5ld0xhYmVsSW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdMYWJlbDtcbiAgICBpZiAobmV3U2VjcmV0SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3U2VjcmV0SW5wdXQpIG5ld1NlY3JldElucHV0LnZhbHVlID0gc3RhdGUubmV3U2VjcmV0O1xuICAgIGlmIChhZGRLZXlCdG4pIHtcbiAgICAgICAgYWRkS2V5QnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLm5ld0xhYmVsLnRyaW0oKS5sZW5ndGggPT09IDAgfHwgc3RhdGUubmV3U2VjcmV0LnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGFkZEtleUJ0bi50ZXh0Q29udGVudCA9IHN0YXRlLnNhdmluZyA/ICdTYXZpbmcuLi4nIDogJ1NhdmUnO1xuICAgIH1cblxuICAgIC8vIFRvYXN0XG4gICAgY29uc3QgdG9hc3QgPSAkKCd0b2FzdCcpO1xuICAgIGlmICh0b2FzdCkge1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9IHN0YXRlLnRvYXN0O1xuICAgICAgICB0b2FzdC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudG9hc3QgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBzdHI7XG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG4vLyAtLS0gQ1JVRCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gYWRkS2V5KCkge1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUubmV3TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLm5ld1NlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgY29uc3QgaWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIGF3YWl0IHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLm5ld0xhYmVsID0gJyc7XG4gICAgc3RhdGUubmV3U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICBzaG93VG9hc3QoJ0tleSBhZGRlZCcpO1xufVxuXG5mdW5jdGlvbiBzdGFydEVkaXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoa2V5LnVuZGVjcnlwdGFibGUpIHtcbiAgICAgICAgLy8gT3BlbmluZyBpdCB3b3VsZCBzZWVkIHRoZSBlZGl0b3Igd2l0aCBub3RoaW5nIGFuZCBTYXZlIHdvdWxkIHdyaXRlXG4gICAgICAgIC8vIHRoYXQgbm90aGluZyBvdmVyIHRoZSBzdG9yZWQgY2lwaGVydGV4dC5cbiAgICAgICAgc2hvd1RvYXN0KCdUaGlzIGtleSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlIFx1MjAxNCBpdCB3YXMgbGVmdCB1bnRvdWNoZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBrZXkuaWQ7XG4gICAgc3RhdGUuZWRpdExhYmVsID0ga2V5LmxhYmVsO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSBrZXkuc2VjcmV0O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRWRpdCgpIHtcbiAgICBpZiAoIXN0YXRlLmVkaXRpbmdJZCkgcmV0dXJuO1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUuZWRpdExhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5lZGl0U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIGF3YWl0IHNhdmVBcGlLZXkoc3RhdGUuZWRpdGluZ0lkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IHVwZGF0ZWQnKTtcbn1cblxuZnVuY3Rpb24gY2FuY2VsRWRpdCgpIHtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlS2V5KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKCEoYXdhaXQgaW5zQ29uZmlybSh7IHRpdGxlOiBgRGVsZXRlIFwiJHtrZXkubGFiZWx9XCI/YCwgYm9keTogJ1RoZSBzdG9yZWQgc2VjcmV0IGlzIHJlbW92ZWQgZnJvbSB5b3VyIGVuY3J5cHRlZCB2YXVsdC4nLCBjb25maXJtTGFiZWw6ICdEZWxldGUga2V5JywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSByZXR1cm47XG5cbiAgICBhd2FpdCBkZWxldGVBcGlLZXkoaWQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc2hvd1RvYXN0KCdLZXkgZGVsZXRlZCcpO1xufVxuXG4vLyAtLS0gQ2xpcGJvYXJkIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5U2VjcmV0KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKGtleS51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBrZXkgY291bGQgbm90IGJlIGRlY3J5cHRlZCBvbiB0aGlzIGRldmljZScpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGtleS5zZWNyZXQpO1xuICAgIHN0YXRlLmNvcGllZElkID0gaWQ7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLmNvcGllZElkID0gbnVsbDsgcmVuZGVyKCk7IH0sIDIwMDApO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCgnJykuY2F0Y2goKCkgPT4ge30pO1xuICAgIH0sIDMwMDAwKTtcbn1cblxuLy8gLS0tIFN5bmMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIHB1Ymxpc2hUb1JlbGF5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2FwaWtleXMucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGtleXM6IHN0b3JlLmtleXMgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNBbGwoKSB7XG4gICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdzeW5jaW5nJztcbiAgICBzdGF0ZS5zeW5jRXJyb3IgPSAnJztcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2FwaWtleXMuZmV0Y2gnIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQua2V5cykge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRBcGlLZXlTdG9yZSgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxLZXlzID0gc3RvcmUua2V5cztcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQ291bnQgPSBPYmplY3Qua2V5cyhsb2NhbEtleXMpLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKGxvY2FsQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZXN1bHQua2V5cyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdG9yZS5yZWxheUNyZWF0ZWRBdCB8fCByZXN1bHQuY3JlYXRlZEF0ID4gc3RvcmUucmVsYXlDcmVhdGVkQXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZXN1bHQua2V5cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnaWRsZSc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gZS5tZXNzYWdlIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVN5bmMoKSB7XG4gICAgYXdhaXQgc2V0U3luY0VuYWJsZWQoc3RhdGUuc3luY0VuYWJsZWQpO1xuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG4vLyAtLS0gSW1wb3J0IC8gRXhwb3J0IC0tLVxuXG5hc3luYyBmdW5jdGlvbiBleHBvcnRLZXlzKCkge1xuICAgIGNvbnN0IHsga2V5cywgdW5kZWNyeXB0YWJsZSB9ID0gYXdhaXQgZXhwb3J0U3RvcmUoKTtcbiAgICBjb25zdCBwbGFpblRleHQgPSBKU09OLnN0cmluZ2lmeShrZXlzLCBudWxsLCAyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2FwaWtleXMuZW5jcnlwdCcsXG4gICAgICAgIHBheWxvYWQ6IHsgcGxhaW5UZXh0IH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHNob3dUb2FzdCgnRXhwb3J0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeSh7IGVuY3J5cHRlZDogdHJ1ZSwgZGF0YTogcmVzdWx0LmNpcGhlclRleHQgfSldLFxuICAgICAgICB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcbiAgICBhLmRvd25sb2FkID0gJ25vc3Rya2V5LWFwaS1rZXlzLWJhY2t1cC5qc29uJztcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIHNob3dUb2FzdCh1bmRlY3J5cHRhYmxlLmxlbmd0aFxuICAgICAgICA/IGBFeHBvcnRlZCBcdTIwMTQgJHt1bmRlY3J5cHRhYmxlLmxlbmd0aH0ga2V5KHMpIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgaGVyZSBhbmQgd2VyZSBiYWNrZWQgdXAgc3RpbGwtZW5jcnlwdGVkOiAke3VuZGVjcnlwdGFibGUuam9pbignLCAnKX1gXG4gICAgICAgIDogJ0V4cG9ydGVkJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydEtleXMoZXZlbnQpIHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZmlsZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodGV4dCk7XG5cbiAgICAgICAgbGV0IGtleXM7XG4gICAgICAgIGlmIChwYXJzZWQuZW5jcnlwdGVkICYmIHBhcnNlZC5kYXRhKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAga2luZDogJ2FwaWtleXMuZGVjcnlwdCcsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBjaXBoZXJUZXh0OiBwYXJzZWQuZGF0YSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2hvd1RvYXN0KCdEZWNyeXB0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5cyA9IEpTT04ucGFyc2UocmVzdWx0LnBsYWluVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gcGFyc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUoa2V5cyk7XG4gICAgICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dUb2FzdCgnSW1wb3J0ZWQgJyArIE9iamVjdC5rZXlzKGtleXMpLmxlbmd0aCArICcga2V5cycpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnQgZmFpbGVkOiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG5cbiAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbn1cblxuLy8gLS0tIEV2ZW50IGJpbmRpbmcgLS0tXG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgnc3luYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzeW5jQWxsKTtcbiAgICAkKCdhZGQta2V5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFkZEtleSk7XG4gICAgJCgnZXhwb3J0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cG9ydEtleXMpO1xuICAgICQoJ2ltcG9ydC1maWxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGltcG9ydEtleXMpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgICQoJ3N5bmMtdG9nZ2xlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHRvZ2dsZVN5bmMoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1sYWJlbCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld0xhYmVsID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LXNlY3JldCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld1NlY3JldCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0dhdGUoZ2F0ZSwgbWFpbiwgeyB0aXRsZSwgbWVzc2FnZSwgYnV0dG9uIH0pIHtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGNvbnN0IHQgPSAkKCdnYXRlLXRpdGxlJyk7IGlmICh0ICYmIHRpdGxlKSB0LnRleHRDb250ZW50ID0gdGl0bGU7XG4gICAgY29uc3QgbSA9ICQoJ2dhdGUtbWVzc2FnZScpOyBpZiAobSAmJiBtZXNzYWdlKSBtLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICBjb25zdCBiID0gJCgnZ2F0ZS1zZWN1cml0eS1idG4nKTsgaWYgKGIgJiYgYnV0dG9uKSBiLnRleHRDb250ZW50ID0gYnV0dG9uO1xuICAgIGI/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBhcGkucnVudGltZS5nZXRVUkwoJ3NlY3VyaXR5L3NlY3VyaXR5Lmh0bWwnKTtcbiAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnbm9zdHJrZXktb3B0aW9ucycpO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIC8vIEdhdGU6IHJlcXVpcmUgbWFzdGVyIHBhc3N3b3JkIEFORCBhbiB1bmxvY2tlZCBzZXNzaW9uIGJlZm9yZSByZW5kZXJpbmcuXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSk7XG4gICAgY29uc3QgbG9ja2VkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNMb2NrZWQnIH0pO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgLy8gTm8gbWFzdGVyIHBhc3N3b3JkIHNldCB5ZXQgXHUyMDE0IGRldmljZS1rZXkgZW5jcnlwdGlvbiBpcyBhY3RpdmUgYnV0IHRoZVxuICAgICAgICAvLyB2YXVsdCBVSSBzdGlsbCBhc2tzIHRoZSB1c2VyIHRvIHNldCBhIHBhc3N3b3JkIGZpcnN0LlxuICAgICAgICBzZXRVbmxvY2tlZCh0cnVlKTtcbiAgICAgICAgc2hvd0dhdGUoZ2F0ZSwgbWFpbiwge30pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGxvY2tlZCkge1xuICAgICAgICAvLyBGNTogc2Vzc2lvbiBpcyBsb2NrZWQgXHUyMDE0IHJlZnVzZSB0byByZWFkL3JlbmRlciBhbnkgQVBJLWtleSBzZWNyZXQuXG4gICAgICAgIHNldFVubG9ja2VkKGZhbHNlKTtcbiAgICAgICAgc2hvd0dhdGUoZ2F0ZSwgbWFpbiwge1xuICAgICAgICAgICAgdGl0bGU6ICdWYXVsdCBMb2NrZWQnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1VubG9jayBOb3N0cktleSB3aXRoIHlvdXIgbWFzdGVyIHBhc3N3b3JkIHRvIHZpZXcgeW91ciBBUEkga2V5cy4nLFxuICAgICAgICAgICAgYnV0dG9uOiAnVW5sb2NrJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRVbmxvY2tlZCh0cnVlKTtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgY29uc3QgcmVsYXlzID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZ2V0UmVsYXlzJyB9KTtcbiAgICBzdGF0ZS5yZWxheUluZm8gPSByZWxheXMgfHwgeyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgc3RhdGUuc3luY0VuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIiwgIi8qKlxuICogaW5zLWNvbmZpcm0uanMgXHUyMDE0IHRoZSBzaGFyZWQgY29uc2VudCBvdmVybGF5IGZvciBleHRlbnNpb24gcGFnZXMuXG4gKlxuICogT25lIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb25zZW50LXN1cmZhY2Ugc3RhbmRhcmQ6IGEgZGltbWVkIGJhY2tkcm9wIHBsdXNcbiAqIGVpdGhlciBhIGJvdHRvbSBTSEVFVCAoZGVmYXVsdDsgZGVzdHJ1Y3RpdmUgLyBpcnJldmVyc2libGUgYWN0cykgb3IgYVxuICogY2VudGVyZWQgUE9QT1ZFUiAobG93LXN0YWtlcywgcmV2ZXJzaWJsZSBhY3RzKS4gUmVwbGFjZXMgbmF0aXZlXG4gKiBjb25maXJtKCkvYWxlcnQoKSBvbiBldmVyeSBleHRlbnNpb24tcGFnZSBzdXJmYWNlLlxuICpcbiAqICAgaW5zQ29uZmlybSh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8Ym9vbGVhbj4gICAodHJ1ZSA9IGNvbmZpcm1lZDsgRXNjYXBlL2JhY2tkcm9wL2NhbmNlbCA9IGZhbHNlKVxuICogICBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsIH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTx2b2lkPlxuICpcbiAqIFN0eWxpbmcgY29tZXMgZW50aXJlbHkgZnJvbSBpbnN0cnVtZW50LmNzcyAoc2VjdGlvbiAxOCArIHRoZSAuYnRuIGZhbWlseSksXG4gKiBzbyBza2luIC8gbW9kZSAvIGNvbnRyYXN0IC8gZGVuc2l0eSAvIHRleHQtc2l6ZSBhcnJpdmUgdmlhIHRoZSBwYWdlJ3NcbiAqIHN0YW1wZWQgZGF0YS1pbnMtKiBhdHRyaWJ1dGVzIFx1MjAxNCBubyBzdG9yYWdlIGFjY2Vzcywgbm8gbWVzc2FnaW5nIGhlcmUuXG4gKlxuICogU2FmZXR5OiB0aXRsZS9ib2R5IG1heSBjb250YWluIHVzZXIgZGF0YSAoa2V5IGxhYmVscywgdmF1bHQgcGF0aHMpOyB0aGUgRE9NXG4gKiBpcyBidWlsdCB3aXRoIGNyZWF0ZUVsZW1lbnQgKyB0ZXh0Q29udGVudCBPTkxZIFx1MjAxNCBuZXZlciBpbm5lckhUTUwuXG4gKi9cblxuLy8gU2VyaWFsaXplIG92ZXJsYXBwaW5nIGNhbGxzIHNvIGEgc2Vjb25kIGRpYWxvZyBuZXZlciBkb3VibGUtcmVuZGVycyBvbiB0b3Bcbi8vIG9mIChvciBpbnRlcmxlYXZlcyB3aXRoKSBhbiBvcGVuIG9uZS5cbmxldCBxdWV1ZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5sZXQgaWRDb3VudGVyID0gMDtcblxuZnVuY3Rpb24gbW90aW9uT2ZmKCkge1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWlucy1tb3Rpb24nKSA9PT0gJ29mZicpIHJldHVybiB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKS5tYXRjaGVzO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBCdWlsZCwgc2hvdyBhbmQgc2V0dGxlIG9uZSBkaWFsb2cuIFJlc29sdmVzIHRydWUgKGNvbmZpcm0pIG9yIGZhbHNlXG4gKiAoY2FuY2VsIC8gRXNjYXBlIC8gYmFja2Ryb3AgY2xpY2spLlxuICovXG5mdW5jdGlvbiBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2UgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcm9vdC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtcm9vdCc7XG5cbiAgICAgICAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJhY2tkcm9wJztcblxuICAgICAgICBjb25zdCBpc1NoZWV0ID0gdmFyaWFudCAhPT0gJ3BvcG92ZXInO1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTmFtZSA9IGlzU2hlZXQgPyAnaW5zLWNvbnNlbnQtc2hlZXQnIDogJ2lucy1jb25zZW50LXBvcG92ZXInO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdyb2xlJywgKGRlc3RydWN0aXZlIHx8IG5vdGljZSkgPyAnYWxlcnRkaWFsb2cnIDogJ2RpYWxvZycpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgJ3RydWUnKTtcblxuICAgICAgICBpZiAoaXNTaGVldCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBoYW5kbGUuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWhhbmRsZSc7XG4gICAgICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoaGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVpZCA9ICsraWRDb3VudGVyO1xuICAgICAgICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGVFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtdGl0bGUnO1xuICAgICAgICB0aXRsZUVsLmlkID0gYGlucy1jb25zZW50LXRpdGxlLSR7dWlkfWA7XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCB0aXRsZUVsLmlkKTtcblxuICAgICAgICBjb25zdCBib2R5RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGJvZHlFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYm9keSc7XG4gICAgICAgIGJvZHlFbC5pZCA9IGBpbnMtY29uc2VudC1ib2R5LSR7dWlkfWA7XG4gICAgICAgIGJvZHlFbC50ZXh0Q29udGVudCA9IGJvZHkgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChib2R5RWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgYm9keUVsLmlkKTtcblxuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWFjdGlvbnMnO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgbGV0IGNhbmNlbEJ0biA9IG51bGw7XG4gICAgICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29uZmlybUJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNvbmZpcm1CdG4udGV4dENvbnRlbnQgPSBjb25maXJtTGFiZWw7XG4gICAgICAgIGlmIChub3RpY2UpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gJ2J0bic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBjYW5jZWxCdG4uY2xhc3NOYW1lID0gJ2J0biBidG4tLWdob3N0JztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IGNhbmNlbExhYmVsO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9IGRlc3RydWN0aXZlID8gJ2J0biBidG4tLWRlc3RydWN0aXZlJyA6ICdidG4gYnRuLS1wcmltYXJ5JztcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNvbmZpcm1CdG4pO1xuICAgICAgICBidXR0b25zLnB1c2goY29uZmlybUJ0bik7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcblxuICAgICAgICByb290LmFwcGVuZENoaWxkKGJhY2tkcm9wKTtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkaWFsb2cpO1xuXG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIHNldHRsZShyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKSByZXR1cm47XG4gICAgICAgICAgICBzZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Rm9jdXMgJiYgdHlwZW9mIHByZXZGb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJyAmJiBkb2N1bWVudC5jb250YWlucyhwcmV2Rm9jdXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogZm9jdXMgcmVzdG9yZSBpcyBiZXN0LWVmZm9ydCAqLyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtb3Rpb25PZmYoKSkgZmluaXNoKCk7XG4gICAgICAgICAgICBlbHNlIHNldFRpbWVvdXQoZmluaXNoLCAyNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25LZXlkb3duKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgc2V0dGxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnVGFiJykge1xuICAgICAgICAgICAgICAgIC8vIFRyYXAgZm9jdXMgYWNyb3NzIHRoZSBkaWFsb2cncyBidXR0b25zIG9ubHkuXG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBidXR0b25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlyID0gZXYuc2hpZnRLZXkgPyAtMSA6IDE7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1soaWR4ICsgZGlyICsgYnV0dG9ucy5sZW5ndGgpICUgYnV0dG9ucy5sZW5ndGhdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBiYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBpZiAoY2FuY2VsQnRuKSBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgY29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZSh0cnVlKSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocm9vdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgLy8gRGVzdHJ1Y3RpdmUgYWN0cyBzdGFydCBvbiBDYW5jZWwgc28gRW50ZXIgY2FuJ3QgcnVzaCB0aGUgZGVsZXRlO1xuICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlIHN0YXJ0cyBvbiB0aGUgY29uZmlybWluZyBhY3Rpb24uXG4gICAgICAgICAgICBjb25zdCBpbml0aWFsID0gbm90aWNlID8gY29uZmlybUJ0biA6IChkZXN0cnVjdGl2ZSA/IGNhbmNlbEJ0biA6IGNvbmZpcm1CdG4pO1xuICAgICAgICAgICAgKGluaXRpYWwgfHwgY29uZmlybUJ0bikuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNDb25maXJtKHtcbiAgICB0aXRsZSxcbiAgICBib2R5LFxuICAgIGNvbmZpcm1MYWJlbCA9ICdDb25maXJtJyxcbiAgICBjYW5jZWxMYWJlbCA9ICdDYW5jZWwnLFxuICAgIGRlc3RydWN0aXZlID0gZmFsc2UsXG4gICAgdmFyaWFudCA9ICdzaGVldCcsXG59ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZTogZmFsc2UgfSkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCA9ICdPSycgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGNvbmZpcm1MYWJlbDogZGlzbWlzc0xhYmVsLFxuICAgICAgICAgICAgY2FuY2VsTGFiZWw6ICcnLFxuICAgICAgICAgICAgZGVzdHJ1Y3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdmFyaWFudDogJ3NoZWV0JyxcbiAgICAgICAgICAgIG5vdGljZTogdHJ1ZSxcbiAgICAgICAgfSkudGhlbigoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIEFQSSBLZXkgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgQVBJIGtleXNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIGFwaUtleVZhdWx0OiB7XG4gKiAgICAga2V5czoge1xuICogICAgICAgXCI8dXVpZD5cIjogeyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQsIHByb2ZpbGVTY29wZSB9XG4gKiAgICAgfSxcbiAqICAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAqICAgICBldmVudElkOiBudWxsLFxuICogICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICogICAgIHN5bmNTdGF0dXM6IFwic3luY2VkXCIgICAgLy8gc3luY2VkIHwgbG9jYWwtb25seSB8IGNvbmZsaWN0XG4gKiAgIH1cbiAqXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0LCBpc0NpcGhlcnRleHQgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmNvbnN0IFNUT1JBR0VfS0VZID0gJ2FwaUtleVZhdWx0JztcblxuLyoqXG4gKiBEZWNyeXB0IGEga2V5J3MgYHNlY3JldGAgZmllbGQgZm9yIGNhbGxlcnMuIFJlLXRocm93cyBsb2NrIGVycm9ycyBzbyBhIGxvY2tlZFxuICogc2Vzc2lvbiBjYW5ub3QgcmVhZCBzZWNyZXRzIChGNSkuXG4gKlxuICogQSBnZW51aW5lIGRlY3J5cHQgZmFpbHVyZSAoZS5nLiBhIGRldmljZS13cmFwcGVkIHZhbHVlIHN5bmNlZCBmcm9tIGFub3RoZXJcbiAqIGRldmljZSwgb3IgYSBibG9iIHdob3NlIHdyYXBwaW5nIGtleSByb3RhdGVkIGF3YXkpIGlzIHJlcG9ydGVkIGFzXG4gKiBgdW5kZWNyeXB0YWJsZTogdHJ1ZWAgd2l0aCBgc2VjcmV0OiBudWxsYCBcdTIwMTQgTk9UIGFzIGFuIGVtcHR5IHN0cmluZy4gQW4gZW1wdHlcbiAqIHN0cmluZyBpcyBpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGEgcmVhbCB2YWx1ZTogdGhlIFVJIHJlbmRlcmVkIGl0IGFzIGJsYW5rXG4gKiBhbmQgZXhwb3J0U3RvcmUoKSB3cm90ZSBpdCBpbnRvIHRoZSB1c2VyJ3MgZW5jcnlwdGVkIGJhY2t1cCwgcXVpZXRseVxuICogcmVwbGFjaW5nIHRoZSBvbmx5IGNvcHkgb2YgdGhlIHNlY3JldCB3aXRoIG5vdGhpbmcuIGBudWxsYCArIHRoZSBmbGFnIG1ha2VzXG4gKiB0aGUgZmFpbHVyZSB2aXNpYmxlIHRvIGV2ZXJ5IGNhbGxlciwgYW5kIGV4cG9ydFN0b3JlKCkgY2FycmllcyB0aGUgdW50b3VjaGVkXG4gKiBjaXBoZXJ0ZXh0IGluc3RlYWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRLZXkoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBrZXk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgLi4ua2V5LCBzZWNyZXQ6IGF3YWl0IHVud3JhcFNlY3JldChrZXkuc2VjcmV0KSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlLm1lc3NhZ2UgfHwgJycpLnN0YXJ0c1dpdGgoJ2xvY2tlZCcpKSB0aHJvdyBlO1xuICAgICAgICByZXR1cm4geyAuLi5rZXksIHNlY3JldDogbnVsbCwgdW5kZWNyeXB0YWJsZTogdHJ1ZSB9O1xuICAgIH1cbn1cblxuY29uc3QgREVGQVVMVF9TVE9SRSA9IHtcbiAgICBrZXlzOiB7fSxcbiAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAgICBldmVudElkOiBudWxsLFxuICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICAgIHN5bmNTdGF0dXM6ICdzeW5jZWQnLFxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmUoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXTogREVGQVVMVF9TVE9SRSB9KTtcbiAgICByZXR1cm4geyAuLi5ERUZBVUxUX1NUT1JFLCAuLi5kYXRhW1NUT1JBR0VfS0VZXSB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRTdG9yZShzdG9yZSkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogc3RvcmUgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCBBUEkga2V5IHN0b3JlIG9iamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUtleVN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAga2V5c1tpZF0gPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgfVxuICAgIHJldHVybiB7IC4uLnN0b3JlLCBrZXlzIH07XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIEFQSSBrZXkgYnkgaWQgKHNlY3JldCBkZWNyeXB0ZWQpLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLmtleXNbaWRdID8gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSkgOiBudWxsO1xufVxuXG4vKipcbiAqIFVwc2VydCBhbiBBUEkga2V5LiBDcmVhdGVzIGlmIG5ldywgdXBkYXRlcyBpZiBleGlzdGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVVSURcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxuICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0b3JlLmtleXNbaWRdO1xuICAgIC8vIFQwLTQ6IGVuY3J5cHQgdGhlIHNlY3JldCBiZWZvcmUgaXQgdG91Y2hlcyBzdG9yYWdlLlxuICAgIHN0b3JlLmtleXNbaWRdID0ge1xuICAgICAgICBpZCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIHNlY3JldDogYXdhaXQgd3JhcFNlY3JldChzZWNyZXQpLFxuICAgICAgICBjcmVhdGVkQXQ6IGV4aXN0aW5nPy5jcmVhdGVkQXQgfHwgbm93LFxuICAgICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICAgICAgcHJvZmlsZVNjb3BlOiBleGlzdGluZz8ucHJvZmlsZVNjb3BlID8/IG51bGwsXG4gICAgfTtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG4gICAgcmV0dXJuIGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhbiBBUEkga2V5IGJ5IGlkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGRlbGV0ZSBzdG9yZS5rZXlzW2lkXTtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgQVBJIGtleXMgc29ydGVkIGJ5IGxhYmVsIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RBcGlLZXlzKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHRLZXkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKlxuICogQSBrZXkgdGhpcyBkZXZpY2UgY2Fubm90IGRlY3J5cHQgaXMgTkVWRVIgZXhwb3J0ZWQgd2l0aCBhbiBlbXB0eS9udWxsIHNlY3JldFxuICogXHUyMDE0IGEgYmxhbmsgd291bGQgb3ZlcndyaXRlIHRoZSByZWNvdmVyYWJsZSBjaXBoZXJ0ZXh0IHRoZSBuZXh0IHRpbWUgdGhlIGJhY2t1cFxuICogaXMgaW1wb3J0ZWQuIEl0IGlzIGV4cG9ydGVkIGFzIHRoZSBPUklHSU5BTCBDSVBIRVJURVhULFxuICogdW50b3VjaGVkOiB0aGF0IHByZXNlcnZlcyBzdHJpY3RseSBtb3JlIHVzZXIgZGF0YSB0aGFuIG9taXR0aW5nIGl0ICh0aGUgdmFsdWVcbiAqIGlzIHN0aWxsIHJlY292ZXJhYmxlIG9uIGEgZGV2aWNlIHRoYXQgaG9sZHMgdGhlIHdyYXBwaW5nIGtleSwgb3Igb25jZSB0aGUga2V5XG4gKiBpcyByZXN0b3JlZCksIGFuZCBpbXBvcnRTdG9yZSgpIGFscmVhZHkgcGFzc2VzIGNpcGhlcnRleHQgc3RyYWlnaHQgdGhyb3VnaFxuICogaW5zdGVhZCBvZiByZS13cmFwcGluZyBpdCwgc28gdGhlIHJvdW5kIHRyaXAgaXMgbG9zc2xlc3MuIFRoZSBpZHMgYXJlIGFsc29cbiAqIHJlcG9ydGVkIHNvIHRoZSBjYWxsZXIgY2FuIHRlbGwgdGhlIHVzZXIgd2hpY2gga2V5cyBjYW1lIHRocm91Z2ggdW5vcGVuZWQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e2tleXM6IE9iamVjdCwgdW5kZWNyeXB0YWJsZTogc3RyaW5nW119Pn0gTWFwIG9mIGlkIC0+IGtleVxuICogICAgICAgICAgZGF0YSwgcGx1cyB0aGUgbGFiZWxzL2lkcyB0aGF0IHdlcmUgZXhwb3J0ZWQgc3RpbGwtZW5jcnlwdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U3RvcmUoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBjb25zdCB1bmRlY3J5cHRhYmxlID0gW107XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoZGVjcnlwdGVkPy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgICAgICBrZXlzW2lkXSA9IHsgLi4ua2V5IH07ICAgICAgICAgICAgLy8gY2lwaGVydGV4dCBjYXJyaWVkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgICAgIHVuZGVjcnlwdGFibGUucHVzaChrZXkubGFiZWwgfHwgaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAga2V5c1tpZF0gPSBkZWNyeXB0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB7IGtleXMsIHVuZGVjcnlwdGFibGUgfTtcbn1cblxuLyoqXG4gKiBJbXBvcnQga2V5cyBpbnRvIHRoZSBzdG9yZSAobWVyZ2UgXHUyMDE0IGV4aXN0aW5nIGtleXMgd2l0aCBzYW1lIGlkIGFyZSBvdmVyd3JpdHRlbikuXG4gKiBJbmNvbWluZyBzZWNyZXRzIGFyZSBwbGFpbnRleHQgKGZyb20gYSBkZWNyeXB0ZWQgYmFja3VwIG9yIGEgcmVsYXkgZmV0Y2gpIGFuZFxuICogYXJlIHJlLXdyYXBwZWQgZm9yIHRoZSBhdC1yZXN0IHRpZXIgdGhpcyBjb250ZXh0IGlzIGluIFx1MjAxNCB0aGUgZGV2aWNlIGtleSwgb3JcbiAqIHRoZSBwYXNzd29yZCBzZXNzaW9uIGtleSB3aGVuIG9uZSBpcyBsaXZlIFx1MjAxNCBiZWZvcmUgc3RvcmFnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBrZXlzIC0gTWFwIG9mIGlkIC0+IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydFN0b3JlKGtleXMpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoa2V5cykpIHtcbiAgICAgICAgY29uc3Qgc2VjcmV0ID0gaXNDaXBoZXJ0ZXh0KGtleS5zZWNyZXQpID8ga2V5LnNlY3JldCA6IGF3YWl0IHdyYXBTZWNyZXQoa2V5LnNlY3JldCk7XG4gICAgICAgIHN0b3JlLmtleXNbaWRdID0geyAuLi5rZXksIHNlY3JldCB9O1xuICAgIH1cbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG4iLCAiLyoqXG4gKiBTeW5jIE1hbmFnZXIgXHUyMDE0IFBsYXRmb3JtIHN5bmMgdmlhIHN0b3JhZ2Uuc3luYyAoQ2hyb21lIFx1MjE5MiBHb29nbGUsIFNhZmFyaSBcdTIxOTIgaUNsb3VkKVxuICpcbiAqIEFyY2hpdGVjdHVyZTpcbiAqICAgV3JpdGU6IGFwcCBcdTIxOTIgc3RvcmFnZS5sb2NhbCBcdTIxOTIgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjE5MiBzdG9yYWdlLnN5bmNcbiAqICAgUmVhZDogIHB1bGxGcm9tU3luYygpIG9uIHN0YXJ0dXAgXHUyMTkyIG1lcmdlIGludG8gc3RvcmFnZS5sb2NhbFxuICogICBMaXN0ZW46IHN0b3JhZ2Uub25DaGFuZ2VkKFwic3luY1wiKSBcdTIxOTIgbWVyZ2UgcmVtb3RlIGNoYW5nZXMgaW50byBsb2NhbFxuICpcbiAqIHN0b3JhZ2UubG9jYWwgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoLiBzdG9yYWdlLnN5bmMgaXMgYSBiZXN0LWVmZm9ydCBtaXJyb3IuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGlzQ2lwaGVydGV4dCB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgU1lOQ19RVU9UQSA9IDEwMl80MDA7ICAgICAgIC8vIDEwMCBLQiB0b3RhbFxuY29uc3QgTUFYX0lURU0gPSA4XzE5MjsgICAgICAgICAgIC8vIDggS0IgcGVyIGl0ZW1cbmNvbnN0IE1BWF9JVEVNUyA9IDUxMjtcbmNvbnN0IENIVU5LX1BSRUZJWCA9ICdfY2h1bms6JztcbmNvbnN0IFNZTkNfTUVUQV9LRVkgPSAnX3N5bmNfbWV0YSc7XG5jb25zdCBMT0NBTF9FTkFCTEVEX0tFWSA9ICdwbGF0Zm9ybVN5bmNFbmFibGVkJztcblxuLy8gS2V5cyB0aGF0IHNob3VsZCBuZXZlciBiZSBzeW5jZWRcbmNvbnN0IEVYQ0xVREVEX0tFWVMgPSBbXG4gICAgJ2J1bmtlclNlc3Npb25zJyxcbiAgICAnaWdub3JlSW5zdGFsbEhvb2snLFxuICAgICdwYXNzd29yZEhhc2gnLFxuICAgICdwYXNzd29yZFNhbHQnLFxuXTtcblxuLy8gUHJpb3JpdHkgdGllcnMgZm9yIGJ1ZGdldCBhbGxvY2F0aW9uXG5jb25zdCBQUklPUklUWSA9IHtcbiAgICBQMV9QUk9GSUxFUzogMSxcbiAgICBQMl9TRVRUSU5HUzogMixcbiAgICBQM19BUElLRVlTOiAzLFxuICAgIFA0X1ZBVUxUOiA0LFxufTtcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xubGV0IHB1c2hUaW1lciA9IG51bGw7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ2h1bmtpbmcgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU3BsaXQgYSBKU09OLXNlcmlhbGlzZWQgdmFsdWUgaW50byA8PThLQiBjaHVua3MuXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHsga2V5LCB2YWx1ZSB9IHBhaXJzIHJlYWR5IGZvciBzdG9yYWdlLnN5bmMuc2V0KCkuXG4gKi9cbmZ1bmN0aW9uIGNodW5rVmFsdWUoa2V5LCBqc29uU3RyaW5nKSB7XG4gICAgY29uc3QgY2h1bmtzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqc29uU3RyaW5nLmxlbmd0aDsgaSArPSBNQVhfSVRFTSAtIDEwMCkge1xuICAgICAgICAvLyBSZXNlcnZlIH4xMDAgYnl0ZXMgZm9yIHRoZSBrZXkgb3ZlcmhlYWQgaW4gdGhlIHN0b3JlZCBpdGVtXG4gICAgICAgIGNodW5rcy5wdXNoKGpzb25TdHJpbmcuc2xpY2UoaSwgaSArIE1BWF9JVEVNIC0gMTAwKSk7XG4gICAgfVxuICAgIGlmIChjaHVua3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpdHMgaW4gYSBzaW5nbGUgaXRlbSBcdTIwMTQgc3RvcmUgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIFt7IGtleSwgdmFsdWU6IGpzb25TdHJpbmcgfV07XG4gICAgfVxuICAgIC8vIE11bHRpcGxlIGNodW5rc1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWAsIHZhbHVlOiBjaHVua3NbaV0gfSk7XG4gICAgfVxuICAgIC8vIFN0b3JlIGEgbWV0YWRhdGEgZW50cnkgc28gd2Uga25vdyBob3cgbWFueSBjaHVua3MgdGhlcmUgYXJlXG4gICAgZW50cmllcy5wdXNoKHsga2V5LCB2YWx1ZTogSlNPTi5zdHJpbmdpZnkoeyBfX2NodW5rZWQ6IHRydWUsIGNvdW50OiBjaHVua3MubGVuZ3RoIH0pIH0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vKipcbiAqIFJlYXNzZW1ibGUgY2h1bmtlZCBkYXRhIGZyb20gYSBzeW5jIGRhdGEgb2JqZWN0LlxuICogUmV0dXJucyB0aGUgcGFyc2VkIEpTT04gdmFsdWUsIG9yIG51bGwgb24gZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCBzeW5jRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLl9fY2h1bmtlZCkge1xuICAgICAgICAgICAgLy8gTm90IGNodW5rZWQgXHUyMDE0IHBhcnNlIGRpcmVjdGx5XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbWJpbmVkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua0tleSA9IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWA7XG4gICAgICAgICAgICBpZiAoc3luY0RhdGFbY2h1bmtLZXldID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29tYmluZWQgKz0gc3luY0RhdGFbY2h1bmtLZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbWJpbmVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHN5bmMgcGF5bG9hZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgbG9jYWwgZGF0YSBhbmQgYnVpbGQgYSBwcmlvcml0aXNlZCBsaXN0IG9mIGVudHJpZXMgdG8gc3luYy5cbiAqIFJldHVybnMgeyBlbnRyaWVzOiBbeyBrZXksIGpzb25TdHJpbmcsIHByaW9yaXR5LCBzaXplIH1dLCB0b3RhbFNpemUgfVxuICovXG5hc3luYyBmdW5jdGlvbiBidWlsZFN5bmNQYXlsb2FkKCkge1xuICAgIGNvbnN0IGFsbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcblxuICAgIC8vIFQwLTU6IGEgc2VjcmV0IGlzIG9ubHkgZXZlciBlbWl0dGVkIHRvIHN0b3JhZ2Uuc3luYyAoR29vZ2xlL2lDbG91ZCkgaWYgaXRcbiAgICAvLyBpcyBhbHJlYWR5IGFuIGVuY3J5cHRlZCBibG9iLiBBbnkgdmFsdWUgdGhhdCBpcyBOT1QgY2lwaGVydGV4dCBpcyByZWZ1c2VkXG4gICAgLy8gKGRyb3BwZWQpIHNvIHBsYWludGV4dCBwcml2YXRlIGtleXMgLyBBUEkgc2VjcmV0cyAvIG5vdGVzIGNhbiBuZXZlciBsZWF2ZVxuICAgIC8vIHRoZSBkZXZpY2UuIGAnJ2AgKGVtcHR5IC8gYnVua2VyKSBpcyBhbGxvd2VkIHRocm91Z2ggYXMgbm9uLXNlY3JldC5cbiAgICBjb25zdCBzZWNyZXRPayA9IHYgPT4gIXYgfHwgaXNDaXBoZXJ0ZXh0KHYpO1xuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4ICsgZW5jcnlwdGlvbiBzdGF0ZVxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IGFsbC5wcm9maWxlcy5tYXAocCA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgaWYgKHJlc3QucHJpdktleSAmJiAhc2VjcmV0T2socmVzdC5wcml2S2V5KSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBwcml2S2V5IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgcmVzdC5wcml2S2V5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5pc0VuY3J5cHRlZCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwuaXNFbmNyeXB0ZWQpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdpc0VuY3J5cHRlZCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDI6IFNldHRpbmdzXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3QgayBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKGFsbFtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGFsbCkpIHtcbiAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQMzogQVBJIGtleSB2YXVsdCBcdTIwMTQgb25seSBzeW5jIGtleXMgd2hvc2Ugc2VjcmV0IGlzIGNpcGhlcnRleHQgKFQwLTUpXG4gICAgaWYgKGFsbC5hcGlLZXlWYXVsdCAmJiBhbGwuYXBpS2V5VmF1bHQua2V5cykge1xuICAgICAgICBjb25zdCBzYWZlS2V5cyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhhbGwuYXBpS2V5VmF1bHQua2V5cykpIHtcbiAgICAgICAgICAgIGlmIChzZWNyZXRPayhrZXkuc2VjcmV0KSkge1xuICAgICAgICAgICAgICAgIHNhZmVLZXlzW2lkXSA9IGtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IEFQSSBzZWNyZXQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzYWZlVmF1bHQgPSB7IC4uLmFsbC5hcGlLZXlWYXVsdCwga2V5czogc2FmZUtleXMgfTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHNhZmVWYXVsdCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2FwaUtleVZhdWx0JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAzX0FQSUtFWVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFA0OiBWYXVsdCBkb2NzIChpbmRpdmlkdWFsbHksIG5ld2VzdCBmaXJzdCkgXHUyMDE0IG9ubHkgaWYgY29udGVudCBpcyBjaXBoZXJ0ZXh0XG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGlmICghc2VjcmV0T2soZG9jLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHZhdWx0IGNvbnRlbnQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgc3luYyBwYXlsb2FkIHJlc3BlY3RpbmcgYnVkZ2V0XG4gICAgICAgIGxldCB1c2VkQnl0ZXMgPSAwO1xuICAgICAgICBsZXQgdXNlZEl0ZW1zID0gMDtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgbGV0IGJ1ZGdldEV4aGF1c3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKGJ1ZGdldEV4aGF1c3RlZCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVmFsdWUoZW50cnkua2V5LCBlbnRyeS5qc29uU3RyaW5nKTtcbiAgICAgICAgICAgIGxldCBlbnRyeVNpemUgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgIGVudHJ5U2l6ZSArPSBjLmtleS5sZW5ndGggKyAodHlwZW9mIGMudmFsdWUgPT09ICdzdHJpbmcnID8gYy52YWx1ZS5sZW5ndGggOiBKU09OLnN0cmluZ2lmeShjLnZhbHVlKS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodXNlZEJ5dGVzICsgZW50cnlTaXplID4gU1lOQ19RVU9UQSAtIDUwMCB8fCB1c2VkSXRlbXMgKyBjaHVua3MubGVuZ3RoID4gTUFYX0lURU1TIC0gNSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5wcmlvcml0eSA8PSBQUklPUklUWS5QM19BUElLRVlTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyaXRpY2FsIGRhdGEgXHUyMDE0IHRyeSBhbnl3YXksIGxldCB0aGUgQVBJIHRocm93IGlmIHRydWx5IG92ZXJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gQnVkZ2V0IGV4aGF1c3RlZCBhdCBwcmlvcml0eSAke2VudHJ5LnByaW9yaXR5fSwgc2tpcHBpbmcgcmVtYWluaW5nIGVudHJpZXNgKTtcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0RXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgc3luY1BheWxvYWRbYy5rZXldID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgICBhbGxTeW5jS2V5cy5wdXNoKGMua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBzeW5jIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XG4gICAgICAgICAgICBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAga2V5czogYWxsU3luY0tleXMsXG4gICAgICAgIH07XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkobWV0YSk7XG5cbiAgICAgICAgLy8gV3JpdGUgdG8gc3luYyBzdG9yYWdlXG4gICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHN5bmNQYXlsb2FkKTtcblxuICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlYWQgZXhpc3Rpbmcgc3luYyBrZXlzIGFuZCByZW1vdmUgYW55IG5vdCBpbiBvdXIgcGF5bG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7YWxsU3luY0tleXMubGVuZ3RofSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgIGlmICghcmF3IHx8IE9iamVjdC5rZXlzKHJhdykubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXRhU3RyID0gcmF3W1NZTkNfTUVUQV9LRVldO1xuICAgICAgICBpZiAoIW1ldGFTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBtZXRhO1xuICAgICAgICB0cnkgeyBtZXRhID0gSlNPTi5wYXJzZShtZXRhU3RyKTsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIG5vbi1jaHVuaywgbm9uLW1ldGEga2V5c1xuICAgICAgICBjb25zdCBkYXRhS2V5cyA9IG1ldGEua2V5cy5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKENIVU5LX1BSRUZJWCkgJiYgayAhPT0gU1lOQ19NRVRBX0tFWSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHJhdyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQuX3N5bmNNZXRhID0gbWV0YTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVsbEZyb21TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWVyZ2UgbG9naWNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIE1lcmdlIHN5bmMgZGF0YSBpbnRvIGxvY2FsIHN0b3JhZ2Ugd2l0aCBjb25mbGljdCByZXNvbHV0aW9uLlxuICovXG5hc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgdXBkYXRlcyA9IHt9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlY3QgZnJlc2ggaW5zdGFsbDogbm8gcHJvZmlsZXMsIG9yIGEgc2luZ2xlIHVudG91Y2hlZCBkZWZhdWx0IHByb2ZpbGUuXG4gICAgLy8gKERlZmF1bHQga2V5cyBhcmUgbm93IHdyYXBwZWQgYXQgcmVzdCwgc28gYHByaXZLZXlgIGlzIHRydXRoeSBldmVuIG9uIGFcbiAgICAvLyBmcmVzaCBpbnN0YWxsIFx1MjAxNCBkZXRlY3QgdGhlIHVudG91Y2hlZCBkZWZhdWx0IGJ5IGl0cyBuYW1lICsgYWJzZW5jZSBvZiBhbnlcbiAgICAvLyBwZXItc2l0ZSBncmFudHMgaW5zdGVhZC4pXG4gICAgY29uc3QgbG9uZSA9IGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMSA/IGxvY2FsLnByb2ZpbGVzWzBdIDogbnVsbDtcbiAgICBjb25zdCBpc0ZyZXNoID0gIWxvY2FsLnByb2ZpbGVzIHx8XG4gICAgICAgIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAobG9uZSAmJiAhbG9uZS5wcml2S2V5KSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gLS0tIFByb2ZpbGVzIChQMSkgLS0tXG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVzID0gc3luY0RhdGEucHJvZmlsZXM7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5wcm9maWxlcykge1xuICAgICAgICAgICAgLy8gUGVyLWluZGV4IHVwZGF0ZWRBdCBjb21wYXJpc29uIFx1MjAxNCBuZXdlciB3aW5zLCBsb2NhbCB3aW5zIHRpZXNcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFsuLi5sb2NhbC5wcm9maWxlc107XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN5bmNEYXRhLnByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3luY1Byb2ZpbGUgPSBzeW5jRGF0YS5wcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoaSA+PSBtZXJnZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5ldyBwcm9maWxlIGZyb20gc3luY1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWQucHVzaChzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsUHJvZmlsZSA9IG1lcmdlZFtpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3luY1RpbWUgPSBzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxUaW1lID0gbG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3luY1RpbWUgPiBsb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN5bmMgaXMgbmV3ZXIgXHUyMDE0IG1lcmdlIGJ1dCBwcmVzZXJ2ZSBsb2NhbCBob3N0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0geyAuLi5zeW5jUHJvZmlsZSwgaG9zdHM6IGxvY2FsUHJvZmlsZS5ob3N0cyB8fCB7fSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkgdXBkYXRlcy5wcm9maWxlcyA9IG1lcmdlZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlIGluZGV4IChQMSkgLS0tXG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsICYmIGlzRnJlc2gpIHtcbiAgICAgICAgdXBkYXRlcy5wcm9maWxlSW5kZXggPSBzeW5jRGF0YS5wcm9maWxlSW5kZXg7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIC0tLSBFbmNyeXB0aW9uIHN0YXRlIChQMSkgXHUyMDE0IG5ldmVyIGRvd25ncmFkZSAtLS1cbiAgICBpZiAoc3luY0RhdGEuaXNFbmNyeXB0ZWQgPT09IHRydWUgJiYgIWxvY2FsLmlzRW5jcnlwdGVkKSB7XG4gICAgICAgIHVwZGF0ZXMuaXNFbmNyeXB0ZWQgPSB0cnVlO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAtLS0gU2V0dGluZ3MgKFAyKSBcdTIwMTQgbGFzdC13cml0ZS13aW5zIC0tLVxuICAgIGNvbnN0IHN5bmNNZXRhID0gc3luY0RhdGEuX3N5bmNNZXRhIHx8IHt9O1xuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKHN5bmNEYXRhW2tleV0gIT0gbnVsbCAmJiBzeW5jRGF0YVtrZXldICE9PSBsb2NhbFtrZXldKSB7XG4gICAgICAgICAgICAvLyBGb3IgdmVyc2lvbiwgb25seSBhY2NlcHQgaGlnaGVyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAndmVyc2lvbicgJiYgbG9jYWwudmVyc2lvbiAmJiBzeW5jRGF0YS52ZXJzaW9uIDw9IGxvY2FsLnZlcnNpb24pIGNvbnRpbnVlO1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdmZWF0dXJlOicpICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgaWYgKHN5bmNEYXRhLmFwaUtleVZhdWx0KSB7XG4gICAgICAgIGlmICghbG9jYWwuYXBpS2V5VmF1bHQgfHwgaXNGcmVzaCkge1xuICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHN5bmNEYXRhLmFwaUtleVZhdWx0O1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBNZXJnZSBpbmRpdmlkdWFsIGtleXMgYnkgdXBkYXRlZEF0XG4gICAgICAgICAgICBjb25zdCBsb2NhbEtleXMgPSBsb2NhbC5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9O1xuICAgICAgICAgICAgY29uc3Qgc3luY0tleXMgPSBzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5sb2NhbEtleXMgfTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBzeW5jS2V5XSBvZiBPYmplY3QuZW50cmllcyhzeW5jS2V5cykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbEtleSA9IG1lcmdlZFtpZF07XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbEtleSB8fCAoc3luY0tleS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxLZXkudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFtpZF0gPSBzeW5jS2V5O1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZXMuYXBpS2V5VmF1bHQgPSB7IC4uLmxvY2FsLmFwaUtleVZhdWx0LCBrZXlzOiBtZXJnZWQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBWYXVsdCBkb2NzIChQNCkgLS0tXG4gICAgY29uc3QgbG9jYWxEb2NzID0gbG9jYWwudmF1bHREb2NzIHx8IHt9O1xuICAgIGxldCBkb2NzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG1lcmdlZERvY3MgPSB7IC4uLmxvY2FsRG9jcyB9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCd2YXVsdERvYzonKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRvYyA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghZG9jIHx8ICFkb2MucGF0aCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGxvY2FsRG9jID0gbWVyZ2VkRG9jc1tkb2MucGF0aF07XG4gICAgICAgIGlmICghbG9jYWxEb2MgfHwgKGRvYy51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxEb2MudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICBtZXJnZWREb2NzW2RvYy5wYXRoXSA9IGRvYztcbiAgICAgICAgICAgIGRvY3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9jc0NoYW5nZWQpIHtcbiAgICAgICAgdXBkYXRlcy52YXVsdERvY3MgPSBtZXJnZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVib3VuY2VkIHB1c2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNjaGVkdWxlIGEgc3luYyBwdXNoIHdpdGggYSAyLXNlY29uZCBkZWJvdW5jZS5cbiAqIEV4cG9ydGVkIGZvciB1c2UgYnkgc3RvcmVzIGFuZCB0aGUgc3RvcmFnZSBpbnRlcmNlcHRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlU3luY1B1c2goKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgaWYgKHB1c2hUaW1lcikgY2xlYXJUaW1lb3V0KHB1c2hUaW1lcik7XG4gICAgcHVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1c2hUaW1lciA9IG51bGw7XG4gICAgICAgIHB1c2hUb1N5bmMoKTtcbiAgICB9LCAyMDAwKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmFibGUgLyBkaXNhYmxlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gZGF0YVtMT0NBTF9FTkFCTEVEX0tFWV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiBlbmFibGVkIH0pO1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5pdGlhbGlzYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENhbGxlZCBvbmNlIG9uIHN0YXJ0dXAgKGZyb20gYmFja2dyb3VuZC5qcykuXG4gKiBQdWxscyBmcm9tIHN5bmMsIG1lcmdlcywgdGhlbiBsaXN0ZW5zIGZvciByZW1vdGUgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRTeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBzdG9yYWdlLnN5bmMgbm90IGF2YWlsYWJsZSBcdTIwMTQgc2tpcHBpbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFBsYXRmb3JtIHN5bmMgZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1bGwgKyBtZXJnZVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN5bmNEYXRhID0gYXdhaXQgcHVsbEZyb21TeW5jKCk7XG4gICAgICAgIGlmIChzeW5jRGF0YSkge1xuICAgICAgICAgICAgYXdhaXQgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsK21lcmdlIGNvbXBsZXRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBObyBzeW5jIGRhdGEgZm91bmQgXHUyMDE0IGZyZXNoIHN5bmMnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgcmVtb3RlIGNoYW5nZXNcbiAgICBpZiAoYXBpLnN0b3JhZ2Uub25DaGFuZ2VkKSB7XG4gICAgICAgIGFwaS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcigoY2hhbmdlcywgYXJlYU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmVhTmFtZSAhPT0gJ3N5bmMnKSByZXR1cm47XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBSZW1vdGUgc3luYyBjaGFuZ2UgZGV0ZWN0ZWQnKTtcbiAgICAgICAgICAgIC8vIFJlLXB1bGwgYW5kIG1lcmdlIHRoZSBmdWxsIHN5bmMgZGF0YSB0byBoYW5kbGUgY2h1bmtlZCB2YWx1ZXMgY29ycmVjdGx5XG4gICAgICAgICAgICBwdWxsRnJvbVN5bmMoKS50aGVuKHN5bmNEYXRhID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3luY0RhdGEpIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIG1lcmdlIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIERvIGFuIGluaXRpYWwgcHVzaCBzbyBsb2NhbCBkYXRhIGlzIG1pcnJvcmVkXG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuIiwgIi8qKlxuICogU2VjcmV0IFZhdWx0IFx1MjAxNCBhdC1yZXN0IGVuY3J5cHRpb24gZm9yIHByaXZhdGUga2V5cyBhbmQgYXBwbGljYXRpb24gc2VjcmV0cy5cbiAqXG4gKiBUaHJlYXQgbW9kZWwgKFQwLTQpOiByYXcgc2VjcmV0IGJ5dGVzIG11c3QgbmV2ZXIgc2l0IGluIGJyb3dzZXIgc3RvcmFnZSBpblxuICogY2xlYXJ0ZXh0LCBldmVuIGZvciB0aGUgREVGQVVMVCBwYXNzd29yZGxlc3MgdXNlci4gVGhpcyBtb2R1bGUgcHJvdmlkZXMgdHdvXG4gKiB3cmFwcGluZyBzdHJhdGVnaWVzIGJlaGluZCBvbmUgYHdyYXBTZWNyZXRgIC8gYHVud3JhcFNlY3JldGAgaW50ZXJmYWNlOlxuICpcbiAqICAgMS4gREVWSUNFIEtFWSAoZGVmYXVsdCwgbm8gbWFzdGVyIHBhc3N3b3JkKSBcdTIwMTQgYSBub24tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ01cbiAqICAgICAgQ3J5cHRvS2V5LiBUaHJlZSBwZXJzaXN0ZW5jZSBzdHJhdGVnaWVzIGV4aXN0LCBhbmQgZWFjaCBpcyBWRVJJRklFRFxuICogICAgICAocmVhZCBiYWNrIGFuZCByb3VuZC10cmlwcGVkIHRocm91Z2ggZW5jcnlwdC9kZWNyeXB0KSBiZWZvcmUgaXQgaXNcbiAqICAgICAgdHJ1c3RlZDpcbiAqXG4gKiAgICAgICAgYS4gYGlkYmAgICAgXHUyMDE0IGEgQ3J5cHRvS2V5ICpoYW5kbGUqIGluIEluZGV4ZWREQi4gT25seSBldmVyIEFET1BURUQsXG4gKiAgICAgICAgICAgICAgICAgICAgICBuZXZlciBtaW50ZWQ6IHdlIHRydXN0IGBpZGJgIGV4Y2x1c2l2ZWx5IHdoZW4gZGIuZ2V0KClcbiAqICAgICAgICAgICAgICAgICAgICAgIGhhbmRzIGJhY2sgYSBQUkUtRVhJU1RJTkcga2V5IHRoYXQgcm91bmQtdHJpcHMsIGJlY2F1c2VcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoYXQgXHUyMDE0IGFuZCBvbmx5IHRoYXQgXHUyMDE0IHByb3ZlcyB0aGUgaGFuZGxlIHN1cnZpdmVkIGFcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzIGNvbnRleHQuIEEgc2FtZS1jb250ZXh0IHB1dFx1MjE5MmdldCBwcm9iZSBjYW5ub3RcbiAqICAgICAgICAgICAgICAgICAgICAgIHByb3ZlIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UuIEtlZXBpbmcgdGhlIGFkb3B0IHBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXNlcnZlcyBldmVyeSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3cml0dGVuIGJlZm9yZVxuICogICAgICAgICAgICAgICAgICAgICAgMS44LjEsIHdob3NlIGJsb2JzIGxpdmUgdW5kZXIgdGhpcyBrZXkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAqKk5FVkVSIHVzZWQgYXMgdGhlIHdyYXBwaW5nIGtleSBvbiBTYWZhcmkuKiogT24gV2ViS2l0XG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgdHdvIHN0b3JhZ2UgYXJlYXMgZG8gbm90IHNoYXJlIGEgbGlmZXRpbWUgdGhlIHdheVxuICogICAgICAgICAgICAgICAgICAgICAgdGhleSBkbyBvbiBDaHJvbWl1bS9HZWNrbywgc28gYW4gYWRvcHRlZCBJbmRleGVkREIga2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBpcyBub3QgYSBzYWZlIHdyYXBwaW5nIGtleSB0aGVyZS4gU2FmYXJpIHRoZXJlZm9yZSBhbHdheXNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyaXRlcyB1bmRlciBgc2VlZGAgKGJ1bmRsZS1zY29wZWQgYHN0b3JhZ2UubG9jYWxgKTtcbiAqICAgICAgICAgICAgICAgICAgICAgIGFkb3B0ZWQgSURCIGtleXMgYXJlIGRlY3J5cHQtb25seSBsZWdhY3kgb24gU2FmYXJpLCBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBhdC1yZXN0IG1pZ3JhdGlvbiByZS13cmFwcyBFVkVSWSBkZXZpY2UgYmxvYiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbiBzdG9yZXMgXHUyMDE0IHByb2ZpbGUgcHJpdmF0ZSBrZXlzLCBBUEkta2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzLCB2YXVsdC1ub3RlIGJvZGllcywgYW5kIE5JUC00NiBidW5rZXIgc2Vzc2lvblxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cyAvIHNlc3Npb24gcHJpdmF0ZSBrZXlzIFx1MjAxNCBub3QganVzdCBwcm9maWxlIGtleXMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAoUGVyLWVuZ2luZSBzdG9yYWdlLXNjb3BpbmcgcmF0aW9uYWxlOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgICAgICAgICAgICAgICAgIGBhcmNoaXRlY3R1cmUvZGV2aWNlLWtleS1zdHJhdGVneS5tZGAuKVxuICogICAgICAgIGIuIGBzZWVkYCAgIFx1MjAxNCAzMiByYW5kb20gYnl0ZXMgaW4gYGJyb3dzZXIuc3RvcmFnZS5sb2NhbGAgdW5kZXJcbiAqICAgICAgICAgICAgICAgICAgICAgIGBkZXZpY2VLZXlTZWVkYCwgaW1wb3J0ZWQgYXMgYSBub24tZXh0cmFjdGFibGUgQUVTLUdDTVxuICogICAgICAgICAgICAgICAgICAgICAga2V5IGF0IGxvYWQuIFRoaXMgaXMgd2hlcmUgRVZFUlkgbmV3IGRldmljZSBrZXkgbGFuZHMsXG4gKiAgICAgICAgICAgICAgICAgICAgICBvbiBldmVyeSBwbGF0Zm9ybTogd2hlbiBubyBwcmUtZXhpc3RpbmcgSURCIGtleSBpc1xuICogICAgICAgICAgICAgICAgICAgICAgZm91bmQgd2UgZG8gbm90IG1pbnQgb25lLCB3ZSBzZWVkLiBDaHJvbWUvRmlyZWZveCBmcmVzaFxuICogICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbHMgdGhlcmVmb3JlIHVzZSBgc2VlZGAgdG9vIFx1MjAxNCBvbmUgY29kZSBwYXRoLCBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBvbmx5IG9uZSB3aG9zZSBwZXJzaXN0ZW5jZSB3ZSBjYW4gYWN0dWFsbHkgdmVyaWZ5LlxuICogICAgICAgIGMuIGBtZW1vcnlgIFx1MjAxNCBsYXN0IHJlc29ydCAodW5pdCB0ZXN0cywgc2FuZGJveGVkIGNvbnRleHRzKS4gU2VjcmV0c1xuICogICAgICAgICAgICAgICAgICAgICAgd3JhcHBlZCBoZXJlIGRvIG5vdCBzdXJ2aXZlIGEgcmVsb2FkLlxuICpcbiAqICAgICAgVGhlIHJlc29sdmVkIHN0cmF0ZWd5IGlzIFNUSUNLWTogaXQgaXMgcmVjb3JkZWQgaW4gc3RvcmFnZS5sb2NhbCB1bmRlclxuICogICAgICBgZGV2aWNlS2V5U3RyYXRlZ3lgIGFuZCBob25vdXJlZCBvbiBsYXRlciBsb2Fkcywgc28gYSBjb250ZXh0IGNhbm5vdFxuICogICAgICBzaWxlbnRseSBmbGlwIHN0cmF0ZWdpZXMgYW5kIG9ycGhhbiB0aGUgYmxvYnMgd3JpdHRlbiB1bmRlciB0aGUgb2xkXG4gKiAgICAgIG9uZS4gRGVjcnlwdGlvbiBpcyBzeW1tZXRyaWMgcmVnYXJkbGVzczogYGRlY3J5cHRXaXRoRGV2aWNlS2V5YCB0cmllc1xuICogICAgICB0aGUgY3VycmVudCBrZXksIHRoZW4gZXZlcnkgb3RoZXIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBldmVyIGhhdmUgaGFkXG4gKiAgICAgIChsZWdhY3kgSURCIGhhbmRsZSwgZXhpc3Rpbmcgc2VlZCksIGFuZCBjYWxsZXJzIHVzaW5nXG4gKiAgICAgIGBkZWNyeXB0RGV2aWNlQmxvYkZvclJld3JhcGAgcmUtd3JhcCB1bmRlciB0aGUgY3VycmVudCBzdHJhdGVneS5cbiAqXG4gKiAgICAgIFRocmVhdCBtb2RlbCwgaG9uZXN0bHkgc3RhdGVkOiB0aGUgcGFzc3dvcmRsZXNzIGRldmljZSB0aWVyIGlzIGF0LXJlc3RcbiAqICAgICAgcHJvdGVjdGlvbiBhZ2FpbnN0IGNhc3VhbCBpbnNwZWN0aW9uIG9mIGV4dGVuc2lvbiBzdG9yYWdlLCBOT1QgYSBkZWZlbmNlXG4gKiAgICAgIGFnYWluc3QgY29kZSBhbHJlYWR5IGV4ZWN1dGluZyBpbiB0aGlzIGV4dGVuc2lvbidzIGNvbnRleHQuIFRoZVxuICogICAgICBzdHJvbmdlc3QgdGllciBhdmFpbGFibGUgdG9kYXkgaXMgYSAqKm1hc3RlciBwYXNzd29yZCoqIChiZWxvdyksIHdoaWNoXG4gKiAgICAgIGRlcml2ZXMgdGhlIHdyYXBwaW5nIGtleSBmcm9tIGEgc2VjcmV0IHRoYXQgaXMgbmV2ZXIgc3RvcmVkLiBVc2Vyc1xuICogICAgICBob2xkaW5nIGhpZ2gtdmFsdWUga2V5cyBzaG91bGQgc2V0IG9uZS4gQSBoYXJkd2FyZS1iYWNrZWQgZGV2aWNlIGtleSBpc1xuICogICAgICBmdXR1cmUgd29yay4gKFRpZXIgdHJhZGVvZmZzIGluIGZ1bGw6IFBSSVZBVEUgYml6ZG9jc1xuICogICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqXG4gKiAgIDIuIFNFU1NJT04gS0VZIChtYXN0ZXIgcGFzc3dvcmQgc2V0ICsgdW5sb2NrZWQpIFx1MjAxNCB0aGUgQUVTLTI1Ni1HQ00ga2V5XG4gKiAgICAgIGRlcml2ZWQgZnJvbSB0aGUgcGFzc3dvcmQgKHNlZSBjcnlwdG8uanMpLiBTZXQgYnkgdGhlIGJhY2tncm91bmQgd29ya2VyXG4gKiAgICAgIG9uIHVubG9jayB2aWEgYHNldFNlc3Npb25LZXlgLCBjbGVhcmVkIG9uIGxvY2sgdmlhIGBjbGVhclNlc3Npb25gLlxuICpcbiAqIEJsb2IgZm9ybWF0cyAoYm90aCBhcmUgc2VsZi1kZXNjcmliaW5nIEpTT04gc3RyaW5ncyk6XG4gKiAgIHBhc3N3b3JkIGJsb2IgOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqICAgZGV2aWNlICBibG9iIDogeyB2OjEsIGs6XCJkZXZpY2VcIiwgaXYsIGNpcGhlcnRleHQgfVxuICpcbiAqIGB1bndyYXBTZWNyZXRgIHJlZnVzZXMgdG8gZGVjcnlwdCB3aGVuIHRoZSBzZXNzaW9uIGhhcyBiZWVuIGV4cGxpY2l0bHkgbG9ja2VkXG4gKiAoRjUvRjYpIHNvIGEgbG9ja2VkIHBhZ2UgY2Fubm90IHJlYWQgc2VjcmV0cy5cbiAqL1xuXG5pbXBvcnQgeyBlbmNyeXB0V2l0aEtleSwgZGVjcnlwdFdpdGhLZXkgfSBmcm9tICcuL2NyeXB0byc7XG5cbmNvbnN0IElWX0JZVEVTID0gMTI7XG5jb25zdCBERVZJQ0VfREIgPSAnbm9zdHJrZXktc2VjcmV0LXZhdWx0JztcbmNvbnN0IERFVklDRV9TVE9SRSA9ICdrZXlzJztcbmNvbnN0IERFVklDRV9LRVlfSUQgPSAnZGV2aWNlLXdyYXAta2V5LXYxJztcbi8vIHN0b3JhZ2UubG9jYWwga2V5IGhvbGRpbmcgdGhlIGJhc2U2NCByYXcgc2VlZCBmb3IgdGhlIGBzZWVkYCBzdHJhdGVneS5cbmNvbnN0IERFVklDRV9TRUVEX0tFWSA9ICdkZXZpY2VLZXlTZWVkJztcbmNvbnN0IERFVklDRV9TRUVEX0JZVEVTID0gMzI7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBTVElDS1kgcmVzb2x2ZWQgc3RyYXRlZ3kgKCdpZGInIHwgJ3NlZWQnKS5cbmNvbnN0IERFVklDRV9TVFJBVEVHWV9LRVkgPSAnZGV2aWNlS2V5U3RyYXRlZ3knO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgKGtlcHQgbG9jYWwgc28gdGhpcyBtb2R1bGUgaGFzIG5vIGNyb3NzLWRlcHMpIC0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gYWJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VG9BYihiNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gU2Vzc2lvbiAocGFzc3dvcmQtZGVyaXZlZCkga2V5IHN0YXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9zZXNzaW9uS2V5ID0gbnVsbDsgICAvLyBDcnlwdG9LZXkgfCBudWxsXG5sZXQgX3Nlc3Npb25TYWx0ID0gbnVsbDsgIC8vIFVpbnQ4QXJyYXkgfCBudWxsXG4vLyBfdW5sb2NrZWQ6IG51bGwgPSBwYXNzd29yZGxlc3MgLyBub3QgYXBwbGljYWJsZSAobmV2ZXIgbG9ja2VkKSxcbi8vICAgICAgICAgICAgdHJ1ZSA9IHVubG9ja2VkLCBmYWxzZSA9IGxvY2tlZCAocmVmdXNlIHNlY3JldCByZWFkcykuXG5sZXQgX3VubG9ja2VkID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlc3Npb25LZXkoY3J5cHRvS2V5LCBzYWx0KSB7XG4gICAgX3Nlc3Npb25LZXkgPSBjcnlwdG9LZXk7XG4gICAgX3Nlc3Npb25TYWx0ID0gc2FsdDtcbiAgICBfdW5sb2NrZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuICAgIF9zZXNzaW9uS2V5ID0gbnVsbDtcbiAgICBfc2Vzc2lvblNhbHQgPSBudWxsO1xuICAgIF91bmxvY2tlZCA9IGZhbHNlO1xufVxuXG4vKiogRXhwbGljaXRseSBtYXJrIHRoZSBzZXNzaW9uIHVubG9ja2VkL2xvY2tlZCB3aXRob3V0IHByb3ZpZGluZyBhIGtleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVbmxvY2tlZCh2KSB7XG4gICAgX3VubG9ja2VkID0gdiA9PT0gbnVsbCA/IG51bGwgOiAhIXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZXNzaW9uS2V5KCkge1xuICAgIHJldHVybiAhIV9zZXNzaW9uS2V5O1xufVxuXG4vLyAtLS0gRGV2aWNlIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbmxldCBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsOyAgIC8vICdpZGInIHwgJ3NlZWQnIHwgJ21lbW9yeScgXHUyMDE0IHNldCBvbmNlIHJlc29sdmVkXG5sZXQgX21lbW9yeURldmljZUtleSA9IG51bGw7ICAvLyBsYXN0LXJlc29ydCBrZXkgZm9yIGNvbnRleHRzIHRoYXQgcGVyc2lzdCBub3RoaW5nXG5sZXQgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsOyAvLyByZWFkLW9ubHkgaGFuZGxlIG9uIHRoZSBwcmUtMS44LjEgSURCIGtleVxubGV0IF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiBhbiBleGlzdGluZyBzZWVkIGtleVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURldmljZUtleSgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGU6IHJhdyBieXRlcyBjYW4gbmV2ZXIgYmUgcmVhZCBiYWNrIG91dFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWREYkF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5kZXhlZERCICE9PSBudWxsO1xufVxuXG4vKipcbiAqIFByb3ZlIGEgY2FuZGlkYXRlIGtleSBpcyBhY3R1YWxseSB1c2FibGUgYmVmb3JlIHdlIHRydXN0IGEgc3RyYXRlZ3kgd2l0aCBhXG4gKiB1c2VyJ3Mgb25seSBjb3B5IG9mIGEgcHJpdmF0ZSBrZXkuIEEgcmVhZC1iYWNrIGhhbmRsZSB0aGF0IHN0cnVjdHVyZWQtY2xvbmVcbiAqIG1hbmdsZWQgKG9yIGEgc2VlZCB0aGF0IGNhbWUgYmFjayB0cnVuY2F0ZWQpIGZhaWxzIGhlcmUgaW5zdGVhZCBvZiBzaWxlbnRseVxuICogcHJvZHVjaW5nIHVuZGVjcnlwdGFibGUgYmxvYnMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGtleVJvdW5kVHJpcHMoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICAgICAgY29uc3QgcHJvYmUgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ25vc3Rya2V5LWRldmljZS1wcm9iZScpO1xuICAgICAgICBjb25zdCBjdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBwcm9iZSk7XG4gICAgICAgIGNvbnN0IHB0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGN0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwdCkgPT09ICdub3N0cmtleS1kZXZpY2UtcHJvYmUnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBvcGVuRGV2aWNlRGIoKSB7XG4gICAgLy8gTGF6eSBpbXBvcnQgc28gdGhlIG1vZHVsZSB3b3JrcyBpbiBjb250ZXh0cy90ZXN0cyB3aXRob3V0IGlkYiBidW5kbGVkLlxuICAgIGNvbnN0IHsgb3BlbkRCIH0gPSBhd2FpdCBpbXBvcnQoJ2lkYicpO1xuICAgIHJldHVybiBvcGVuREIoREVWSUNFX0RCLCAxLCB7XG4gICAgICAgIHVwZ3JhZGUoZCkge1xuICAgICAgICAgICAgaWYgKCFkLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREVWSUNFX1NUT1JFKSkge1xuICAgICAgICAgICAgICAgIGQuY3JlYXRlT2JqZWN0U3RvcmUoREVWSUNFX1NUT1JFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTdHJhdGVneSAoYSk6IEFET1BUIGEgcHJlLWV4aXN0aW5nIG5vbi1leHRyYWN0YWJsZSBDcnlwdG9LZXkgaGFuZGxlIGZyb21cbiAqIEluZGV4ZWREQi4gTmV2ZXIgbWludHMgb25lLlxuICpcbiAqIEEga2V5IHRoYXQgZGIuZ2V0KCkgaGFuZHMgYmFjayBpcyBhIGtleSBzb21lIEVBUkxJRVIgY29udGV4dCB3cm90ZSwgc28gaXQgaXNcbiAqIHByb29mIG9mIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UgXHUyMDE0IHRoZSBvbmUgdGhpbmcgYSBzYW1lLWNvbnRleHRcbiAqIHB1dFx1MjE5MmdldFx1MjE5MnJvdW5kLXRyaXAgcHJvYmUgY2FuIG5ldmVyIGVzdGFibGlzaC4gaU9TIFNhZmFyaSdzIEluZGV4ZWREQiBpc1xuICogZnVuY3Rpb25hbCBidXQgZXBoZW1lcmFsIGZvciB0aGUgZXh0ZW5zaW9uIGJhY2tncm91bmQ6IGl0IHdvdWxkIGhhdmUgcGFzc2VkXG4gKiB0aGUgcHJvYmUgYW5kIHRoZW4gbG9zdCB0aGUgdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBTbzogbm9cbiAqIHByZS1leGlzdGluZyBrZXkgbWVhbnMgbm8gYGlkYmAsIGFuZCB0aGUgY2FsbGVyIHNlZWRzIGluc3RlYWQuXG4gKlxuICogUmV0dXJucyBudWxsIChuZXZlciB0aHJvd3MpIHdoZW4gbm90aGluZyB1c2FibGUgaXMgdGhlcmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeUlkYkRldmljZUtleSgpIHtcbiAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nKSByZXR1cm4gbnVsbDsgLy8gZW1wdHkgc3RvcmUgXHUyMTkyIHNlZWQsIGRvIE5PVCBtaW50IGhlcmVcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGV4aXN0aW5nKSkgPyBleGlzdGluZyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgc3RvcmFnZSBhcmVhIGJhY2tpbmcgdGhlIGBzZWVkYCBzdHJhdGVneS4gSW1wb3J0ZWQgbGF6aWx5IGJlY2F1c2VcbiAqIGJyb3dzZXItcG9seWZpbGwgdGhyb3dzIGF0IG1vZHVsZSBsb2FkIHdoZW4gbm8gZXh0ZW5zaW9uIG5hbWVzcGFjZSBleGlzdHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlZWRTdG9yYWdlKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICByZXR1cm4gYXBpPy5zdG9yYWdlPy5sb2NhbCB8fCBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBTaWduYWwgMjogYSBXZWJLaXQgdXNlciBhZ2VudCB3aXRoIG5vIENocm9taXVtIG1hcmtlciBvbiBpdC4gKi9cbmZ1bmN0aW9uIGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB1YSA9ICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50KSB8fCAnJztcbiAgICAgICAgcmV0dXJuIC9TYWZhcml8QXBwbGVXZWJLaXQvLnRlc3QodWEpICYmICEvQ2hyb20oZXxpdW0pfEVkZ1xcL3xPUFJcXC8vLnRlc3QodWEpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFRydWUgb24gU2FmYXJpIChpT1MgKyBtYWNPUyksIHdoZXJlIEluZGV4ZWREQiBtdXN0IE5FVkVSIGhvbGQgdGhlIHdyYXBwaW5nXG4gKiBrZXkgXHUyMDE0IHNlZSB0aGUgbW9kdWxlIGhlYWRlcidzIHN0b3JhZ2Utc2NvcGUgbm90ZS5cbiAqXG4gKiBEZXRlY3Rpb24gaXMgbXVsdGktc2lnbmFsIGFuZCBCSUFTRUQgVE9XQVJEIFNBRkFSSSwgYmVjYXVzZSB0aGUgdHdvIGVycm9yc1xuICogYXJlIG5vdCBzeW1tZXRyaWM6IHNlZWRpbmcgYSBDaHJvbWUgdmF1bHQgY29zdHMgbm90aGluZyAoc2VlZCBpcyBhbHJlYWR5IHRoZVxuICogc3RyYXRlZ3kgZXZlcnkgZnJlc2ggaW5zdGFsbCBsYW5kcyBvbiksIHdoaWxlIGFkb3B0aW5nIGFuIElEQiBrZXkgb24gU2FmYXJpXG4gKiBpcyB1bnNhZmUuIFNvIG9ubHkgYSBQT1NJVElWRUxZIGlkZW50aWZpZWQgQ2hyb21lL0ZpcmVmb3ggb3JpZ2luIG1heSBhZG9wdCBhblxuICogSW5kZXhlZERCIGtleSBcdTIwMTQgYSBnZXRVUkwgdGhhdCBpcyBtaXNzaW5nLCB0aHJvd3MsIHJldHVybnMgYSBub24tc3RyaW5nLFxuICogcmV0dXJucyAnJyBvciByZXR1cm5zIGEgc2NoZW1lIHdlIGRvIG5vdCByZWNvZ25pc2UgYWxsIHJlc29sdmUgdG8gU2FmYXJpLlxuICovXG5hc3luYyBmdW5jdGlvbiBpc1NhZmFyaUVuZ2luZSgpIHtcbiAgICBsZXQgb3JpZ2luID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgY29uc3QgdXJsID0gYXBpPy5ydW50aW1lPy5nZXRVUkw/LignJyk7XG4gICAgICAgIG9yaWdpbiA9IHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnID8gdXJsIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgb3JpZ2luID0gbnVsbDtcbiAgICB9XG4gICAgLy8gU2lnbmFsIDE6IGEgcG9zaXRpdmVseSBpZGVudGlmaWVkIFNhZmFyaSBvcmlnaW4uXG4gICAgaWYgKG9yaWdpbiAmJiBvcmlnaW4uc3RhcnRzV2l0aCgnc2FmYXJpLXdlYi1leHRlbnNpb246Ly8nKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU2lnbmFsIDI6IGEgV2ViS2l0LW9ubHkgVUEgb3V0cmFua3MgdGhlIG9yaWdpbiBcdTIwMTQgYSBTYWZhcmkgYnVpbGQgdGhhdFxuICAgIC8vIHJlcG9ydGVkIGFuIHVuZXhwZWN0ZWQgb3JpZ2luIHN0aWxsIG11c3Qgbm90IHRvdWNoIEluZGV4ZWREQi5cbiAgICBpZiAobG9va3NMaWtlV2ViS2l0T25seVVhKCkpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAzOiBvbmx5IHRoZXNlIHR3byBvcmlnaW5zIGVhcm4gdGhlIElEQiBhZG9wdCBwYXRoLlxuICAgIGlmIChvcmlnaW4gJiYgKG9yaWdpbi5zdGFydHNXaXRoKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJykgfHwgb3JpZ2luLnN0YXJ0c1dpdGgoJ21vei1leHRlbnNpb246Ly8nKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTsgLy8gYW1iaWd1b3VzIFx1MjE5MiBzZWVkXG59XG5cbi8qKiBJbXBvcnQgcmF3IHNlZWQgYnl0ZXMgKGJhc2U2NCkgYXMgYSBub24tZXh0cmFjdGFibGUgQUVTLUdDTSBrZXkuICovXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRTZWVkS2V5KHNlZWRCNjQpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLCBiYXNlNjRUb0FiKHNlZWRCNjQpLCB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlIG9uY2UgaW1wb3J0ZWRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG4vKiogUmVhZCB0aGUgc3RpY2t5IHN0cmF0ZWd5IHJlY29yZGVkIGJ5IGEgcHJldmlvdXMgcmVzb2x1dGlvbiAobnVsbCBpZiBub25lKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTdGlja3lTdHJhdGVneSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBzID0gZ290Py5bREVWSUNFX1NUUkFURUdZX0tFWV07XG4gICAgICAgIHJldHVybiAocyA9PT0gJ2lkYicgfHwgcyA9PT0gJ3NlZWQnKSA/IHMgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBSZWNvcmQgdGhlIHJlc29sdmVkIHN0cmF0ZWd5IHNvIGxhdGVyIGxvYWRzIGNhbm5vdCBzaWxlbnRseSBmbGlwIGl0LiAqL1xuYXN5bmMgZnVuY3Rpb24gd3JpdGVTdGlja3lTdHJhdGVneShzdHJhdGVneSkge1xuICAgIGlmIChzdHJhdGVneSAhPT0gJ2lkYicgJiYgc3RyYXRlZ3kgIT09ICdzZWVkJykgcmV0dXJuOyAvLyAnbWVtb3J5JyBwZXJzaXN0cyBub3RoaW5nXG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzdG9yZS5zZXQoeyBbREVWSUNFX1NUUkFURUdZX0tFWV06IHN0cmF0ZWd5IH0pO1xuICAgIH0gY2F0Y2ggeyAvKiBiZXN0IGVmZm9ydCBcdTIwMTQgdGhlIHN0cmF0ZWd5IHN0aWxsIHJlc29sdmVzIHRoZSBzYW1lIHdheSAqLyB9XG59XG5cbi8qKiBTdHJhdGVneSAoYik6IGEgcmF3IHJhbmRvbSBzZWVkIGluIHN0b3JhZ2UubG9jYWwsIGltcG9ydGVkIG5vbi1leHRyYWN0YWJsZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeVNlZWREZXZpY2VLZXkoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICBsZXQgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgIGlmICghc2VlZCkge1xuICAgICAgICAgICAgc2VlZCA9IGFiVG9CYXNlNjQoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShERVZJQ0VfU0VFRF9CWVRFUykpLmJ1ZmZlcik7XG4gICAgICAgICAgICBhd2FpdCBzdG9yZS5zZXQoeyBbREVWSUNFX1NFRURfS0VZXTogc2VlZCB9KTtcbiAgICAgICAgICAgIC8vIFZFUklGWSBwZXJzaXN0ZW5jZSBiZWZvcmUgYW55dGhpbmcgaXMgd3JhcHBlZCB1bmRlciBpdC5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgICAgICBjb25zdCBwZXJzaXN0ZWQgPSBjaGVjaz8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAocGVyc2lzdGVkICE9PSBzZWVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQW5vdGhlciBjb250ZXh0IChwb3B1cCB2cyBiYWNrZ3JvdW5kIG9uIGEgZmlyc3QgcnVuKSBtaW50ZWRcbiAgICAgICAgICAgICAgICAvLyBhbmQgd3JvdGUgaXRzIG93biBzZWVkIGJldHdlZW4gb3VyIHNldCgpIGFuZCB0aGlzIHJlYWQuIEFET1BUXG4gICAgICAgICAgICAgICAgLy8gVEhFIFdJTk5FUjogYW55IHNlZWQgYWN0dWFsbHkgaW4gc3RvcmFnZSBpcyBleGFjdGx5IGFzIGdvb2QgYXNcbiAgICAgICAgICAgICAgICAvLyBvdXJzLCBhbmQgaXQgaXMgdGhlIG9uZSB0aGUgb3RoZXIgY29udGV4dCBpcyBhbHJlYWR5IHdyYXBwaW5nXG4gICAgICAgICAgICAgICAgLy8gdW5kZXIuIFJldHVybmluZyBudWxsIGhlcmUgd291bGQgZHJvcCB0aGUgY2FsbGVyIHRocm91Z2ggdG9cbiAgICAgICAgICAgICAgICAvLyB0aGUgbWVtb3J5IGtleSwgd2hvc2UgYmxvYnMgZGllIHdpdGggdGhpcyBjb250ZXh0IFx1MjAxNCB0aGUgdmVyeVxuICAgICAgICAgICAgICAgIC8vIGxvc3MgdGhpcyBzdHJhdGVneSBleGlzdHMgdG8gcHJldmVudC4gT25seSBhIGdlbnVpbmVseSBhYnNlbnRcbiAgICAgICAgICAgICAgICAvLyBvciB1bnVzYWJsZSB2YWx1ZSBpcyBhIGZhaWx1cmUuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwZXJzaXN0ZWQgIT09ICdzdHJpbmcnIHx8IHBlcnNpc3RlZC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHNlZWQgPSBwZXJzaXN0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldCAoY3JlYXRpbmcgb24gZmlyc3QgdXNlKSB0aGUgZGV2aWNlIHdyYXAga2V5LlxuICpcbiAqIFJlc29sdXRpb24gb3JkZXIsIG9uY2U6IGhvbm91ciB0aGUgc3RpY2t5IHN0cmF0ZWd5IHRoaXMgaW5zdGFsbCBhbHJlYWR5XG4gKiByZWNvcmRlZDsgb3RoZXJ3aXNlIEFET1BUIGEgcHJlLWV4aXN0aW5nIEluZGV4ZWREQiBrZXkgaWYgb25lIGlzIHRoZXJlLCBhbmRcbiAqIGZhaWxpbmcgdGhhdCBzZWVkLiBXaGF0ZXZlciByZXNvbHZlcyBpcyB3cml0dGVuIGJhY2sgYXMgdGhlIHN0aWNreSBzdHJhdGVneS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERldmljZUtleSgpIHtcbiAgICBpZiAoX2RldmljZUtleVByb21pc2UpIHJldHVybiBfZGV2aWNlS2V5UHJvbWlzZTtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0aWNreSA9IGF3YWl0IHJlYWRTdGlja3lTdHJhdGVneSgpO1xuXG4gICAgICAgIC8vIEEgdmF1bHQgYWxyZWFkeSBvbiBgc2VlZGAgbmV2ZXIgcmUtcHJvYmVzIEluZGV4ZWREQjogaXRzIGJsb2JzIGFyZVxuICAgICAgICAvLyB1bmRlciB0aGUgc2VlZCBrZXksIGFuZCBhZG9wdGluZyBhIHN0cmF5IElEQiBoYW5kbGUgd291bGQgb3JwaGFuIHRoZW0uXG4gICAgICAgIC8vIE9uIFNhZmFyaSB3ZSBuZXZlciBXUklURSB1bmRlciBhbiBJREIga2V5IGF0IGFsbCAoc2VlIGhlYWRlcik6IGl0c1xuICAgICAgICAvLyBwZXItZW5naW5lIHN0b3JhZ2Ugc2NvcGluZyBtYWtlcyBhbiBhZG9wdGVkIElEQiBoYW5kbGUgdW5zYWZlIGFzIGFcbiAgICAgICAgLy8gd3JhcHBpbmcga2V5LiBFeGlzdGluZyBJREIgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0XG4gICAgICAgIC8vIGZhbGxiYWNrIGFuZCBhcmUgcmUtd3JhcHBlZCB1bmRlciB0aGUgc2VlZCBieSB0aGUgYXQtcmVzdCBtaWdyYXRpb24uXG4gICAgICAgIGlmIChzdGlja3kgIT09ICdzZWVkJyAmJiAhKGF3YWl0IGlzU2FmYXJpRW5naW5lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBpZGJLZXkgPSBhd2FpdCB0cnlJZGJEZXZpY2VLZXkoKTtcbiAgICAgICAgICAgIGlmIChpZGJLZXkpIHtcbiAgICAgICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnaWRiJztcbiAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdpZGInKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWRiS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IHRyeVNlZWREZXZpY2VLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIHtcbiAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdzZWVkJztcbiAgICAgICAgICAgIC8vIEFsc28gY292ZXJzIHRoZSBkZWdyYWRlIGNhc2U6IHN0aWNreSB3YXMgJ2lkYicgYnV0IHRoZSBoYW5kbGUgaXNcbiAgICAgICAgICAgIC8vIGdvbmUuIE9sZCBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHQgZmFsbGJhY2sgYmVsb3cuXG4gICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdzZWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc2VlZEtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGhpbmcgcGVyc2lzdHMgaGVyZS4gQmV0dGVyIHRoYW4gcmVmdXNpbmcgdG8gZW5jcnlwdCwgYnV0IGJsb2JzXG4gICAgICAgIC8vIHdyaXR0ZW4gdW5kZXIgdGhpcyBrZXkgZGllIHdpdGggdGhlIGNvbnRleHQgXHUyMDE0IHNlZSBtb2R1bGUgaGVhZGVyLlxuICAgICAgICBpZiAoIV9tZW1vcnlEZXZpY2VLZXkpIF9tZW1vcnlEZXZpY2VLZXkgPSBhd2FpdCBnZW5lcmF0ZURldmljZUtleSgpO1xuICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnbWVtb3J5JztcbiAgICAgICAgcmV0dXJuIF9tZW1vcnlEZXZpY2VLZXk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG59XG5cbi8qKiBXaGljaCBwZXJzaXN0ZW5jZSBzdHJhdGVneSB0aGUgZGV2aWNlIGtleSByZXNvbHZlZCB0byAobnVsbCB1bnRpbCByZXNvbHZlZCkuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5U3RyYXRlZ3koKSB7XG4gICAgcmV0dXJuIF9kZXZpY2VTdHJhdGVneTtcbn1cblxuLyoqXG4gKiBEcm9wIGV2ZXJ5IG1lbW9pc2VkIGRldmljZS1rZXkgaGFuZGxlLiBNVVNUIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBhbnlcbiAqIGBzdG9yYWdlLmNsZWFyKClgOiB0aGUgc2VlZCAoYW5kIHRoZSBzdGlja3kgc3RyYXRlZ3kpIGFyZSBnb25lIGZyb20gc3RvcmFnZSxcbiAqIHNvIGEgY2FjaGVkIHByb21pc2Ugd291bGQga2VlcCBoYW5kaW5nIG91dCBhIGtleSB3aG9zZSBiYWNraW5nIG1hdGVyaWFsIG5vXG4gKiBsb25nZXIgZXhpc3RzIFx1MjAxNCB0aGUgbmV4dCBnZXREZXZpY2VLZXkoKSB3b3VsZCB3cmFwIHNlY3JldHMgdW5kZXIgYSBrZXkgdGhhdFxuICogZGllcyB3aXRoIHRoaXMgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGV2aWNlS2V5KCkge1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsO1xuICAgIF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byBhIHByZS1leGlzdGluZyBJbmRleGVkREIgZGV2aWNlIGtleSwgdXNlZCBvbmx5IGFzIGFcbiAqIGRlY3J5cHQgZmFsbGJhY2sgZm9yIGJsb2JzIHdyaXR0ZW4gYmVmb3JlIHRoaXMgY29udGV4dCBjaGFuZ2VkIHN0cmF0ZWd5LlxuICogTmV2ZXIgY3JlYXRlcyBvbmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldExlZ2FjeUlkYktleSgpIHtcbiAgICBpZiAoX2xlZ2FjeUlkYktleVByb21pc2UpIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghaW5kZXhlZERiQXZhaWxhYmxlKCkpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gdGhlIGtleSBhbiBFWElTVElORyBgZGV2aWNlS2V5U2VlZGAgaW1wb3J0cyB0bywgdXNlZCBvbmx5XG4gKiBhcyBhIGRlY3J5cHQgZmFsbGJhY2suIE5ldmVyIG1pbnRzIGEgc2VlZCAodGhhdCBpcyB0cnlTZWVkRGV2aWNlS2V5J3Mgam9iKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0RXhpc3RpbmdTZWVkS2V5KCkge1xuICAgIGlmIChfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSkgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgICAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3Qgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAoIXNlZWQpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBFdmVyeSBPVEhFUiBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGhhdmUgd3JhcHBlZCBhIGRldmljZSBibG9iIHVuZGVyLCBpblxuICogcHJlZmVyZW5jZSBvcmRlci4gU3RyYXRlZ3kgZmxpcHMgKGlkYlx1MjE5MnNlZWQgb24gZGVncmFkZSwgc2VlZFx1MjE5MmlkYiBvbiBhblxuICogYWRvcHRlZCBoYW5kbGUpIG11c3QgbmV2ZXIgb3JwaGFuIGEgYmxvYiwgc28gdGhlIGZhbGxiYWNrIGlzIHN5bW1ldHJpYzogYVxuICogc2VlZCBibG9iIHN0YXlzIHJlYWRhYmxlIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyBhbmQgdmljZSB2ZXJzYS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmFsbGJhY2tEZXZpY2VLZXlzKCkge1xuICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnaWRiJykge1xuICAgICAgICBjb25zdCBsZWdhY3kgPSBhd2FpdCBnZXRMZWdhY3lJZGJLZXkoKTtcbiAgICAgICAgaWYgKGxlZ2FjeSkga2V5cy5wdXNoKGxlZ2FjeSk7XG4gICAgfVxuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdzZWVkJykge1xuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgZ2V0RXhpc3RpbmdTZWVkS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSBrZXlzLnB1c2goc2VlZEtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiB3aXRoIHRoZSBjdXJyZW50IGtleSwgZmFsbGluZyBiYWNrIHRvIGV2ZXJ5IG90aGVyIGtleVxuICogdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZC4gUmV0dXJucyB0aGUgcGxhaW50ZXh0IHBsdXMgd2hldGhlciBhIGZhbGxiYWNrIGtleVxuICogd2FzIG5lZWRlZCAoaS5lLiB0aGUgYmxvYiBpcyBzdGFsZSBhbmQgd29ydGggcmUtd3JhcHBpbmcpLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpLCBzdGFsZTogZmFsc2UgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmFsbGJhY2sgb2YgYXdhaXQgZmFsbGJhY2tEZXZpY2VLZXlzKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoZmFsbGJhY2ssIGl2LCBjaXBoZXJ0ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgc3RhbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiB0cnkgdGhlIG5leHQgb25lICovIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlOyAvLyByZXBvcnQgdGhlIENVUlJFTlQga2V5J3MgZmFpbHVyZSwgbm90IHRoZSBsYXN0IGZhbGxiYWNrJ3NcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBlbmMuZW5jb2RlKHBsYWludGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2OiAxLFxuICAgICAgICBrOiAnZGV2aWNlJyxcbiAgICAgICAgaXY6IGFiVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhYlRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQWIoaXYpKSB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGJhc2U2NFRvQWIoY2lwaGVydGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoRGV2aWNlS2V5KGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIC8vIEdDTSBhdXRoZW50aWNhdGlvbiBjYW4gZmFpbCB3aXRoIHRoZSBDVVJSRU5UIHN0cmF0ZWd5J3Mga2V5IGJlY2F1c2UgdGhlXG4gICAgLy8gYmxvYiBwcmVkYXRlcyBhIHN0cmF0ZWd5IGNoYW5nZSAoYSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3aG9zZSBJREIgaGFuZGxlXG4gICAgLy8gaXMgc3RpbGwgcmVhZGFibGUgd2hpbGUgdGhpcyBjb250ZXh0IHNldHRsZWQgb24gdGhlIHNlZWQsIG9yIHRoZSByZXZlcnNlKS5cbiAgICAvLyBUcnkgZXZlcnkga2V5IHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQgYmVmb3JlIGRlY2xhcmluZyB0aGUgc2VjcmV0IGxvc3QuXG4gICAgY29uc3QgeyBwbGFpbnRleHQgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4gcGxhaW50ZXh0O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiBhbmQsIHdoZW4gaXQgY291bGQgb25seSBiZSByZWFkIHZpYSBhIGZhbGxiYWNrIGtleVxuICogKGxlZ2FjeSBJbmRleGVkREIgaGFuZGxlLCBvciBhbiBleGlzdGluZyBzZWVkIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyksXG4gKiBoYW5kIGJhY2sgYSByZXBsYWNlbWVudCBibG9iIHdyYXBwZWQgdW5kZXIgdGhlIENVUlJFTlQgc3RyYXRlZ3kgc28gdGhlIGNhbGxlclxuICogY2FuIHBlcnNpc3QgdGhlIHVwZ3JhZGUgb3Bwb3J0dW5pc3RpY2FsbHkuXG4gKiBgcmV3cmFwcGVkYCBpcyBudWxsIHdoZW4gdGhlIGJsb2IgaXMgYWxyZWFkeSBjdXJyZW50LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXAoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgeyBwbGFpbnRleHQsIHN0YWxlIH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGxhaW50ZXh0LFxuICAgICAgICByZXdyYXBwZWQ6IHN0YWxlID8gYXdhaXQgZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSA6IG51bGwsXG4gICAgfTtcbn1cblxuLy8gLS0tIEJsb2IgY2xhc3NpZmljYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBmdW5jdGlvbiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLnNhbHQgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQgJiYgcC5rICE9PSAnZGV2aWNlJyk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuayA9PT0gJ2RldmljZScgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuLyoqIFRydWUgaWYgdGhlIHZhbHVlIGlzIGFscmVhZHkgY2lwaGVydGV4dCAoZWl0aGVyIHdyYXBwaW5nKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NpcGhlcnRleHQodmFsdWUpIHtcbiAgICByZXR1cm4gaXNQYXNzd29yZEJsb2IodmFsdWUpIHx8IGlzRGV2aWNlS2V5QmxvYih2YWx1ZSk7XG59XG5cbi8vIC0tLSBVbmlmaWVkIHdyYXAgLyB1bndyYXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHNlY3JldCBmb3IgYXQtcmVzdCBzdG9yYWdlLiBQcmVmZXJzIHRoZSBwYXNzd29yZC1kZXJpdmVkIHNlc3Npb25cbiAqIGtleSB3aGVuIG9uZSBpcyBhdmFpbGFibGUgaW4gdGhpcyBjb250ZXh0IChiYWNrZ3JvdW5kLCB1bmxvY2tlZCk7IG90aGVyd2lzZVxuICogZmFsbHMgYmFjayB0byB0aGUgYWx3YXlzLWF2YWlsYWJsZSBkZXZpY2Uga2V5LiBOZXZlciByZXR1cm5zIHBsYWludGV4dC5cbiAqXG4gKiBUaGUgdGllciBpcyB0aGVyZWZvcmUgQU1CSUVOVCBcdTIwMTQgaXQgaXMgd2hhdGV2ZXIgYHNldFNlc3Npb25LZXlgIC8gYGNsZWFyU2Vzc2lvbmBcbiAqIGxhc3QgZGlkIGluIHRoaXMgbW9kdWxlLCB3aGljaCBtYXkgaGF2ZSBiZWVuIGRvbmUgYnkgYSBkaWZmZXJlbnQgZmlsZS4gT25seVxuICogY2FsbCB0aGlzIHdoZXJlIGVpdGhlciB0aWVyIGlzIGdlbnVpbmVseSBhY2NlcHRhYmxlIChhIHZhbHVlIHRoYXRcbiAqIGB1bndyYXBTZWNyZXRgIGNhbiBvcGVuIHVuZGVyIGJvdGgpLiBBIGNhbGxlciB0aGF0IG5lZWRzIGEgU1BFQ0lGSUMgdGllciBtdXN0XG4gKiBuYW1lIGl0OiBgZW5jcnlwdFdpdGhEZXZpY2VLZXlgIG9yIGBlbmNyeXB0V2l0aEtleWAuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cmFwU2VjcmV0KHBsYWludGV4dCkge1xuICAgIGlmICh0eXBlb2YgcGxhaW50ZXh0ICE9PSAnc3RyaW5nJyB8fCBwbGFpbnRleHQubGVuZ3RoID09PSAwKSByZXR1cm4gcGxhaW50ZXh0O1xuICAgIGlmIChpc0NpcGhlcnRleHQocGxhaW50ZXh0KSkgcmV0dXJuIHBsYWludGV4dDsgLy8gYWxyZWFkeSB3cmFwcGVkIFx1MjAxNCBkb24ndCBkb3VibGUtd3JhcFxuICAgIGlmIChfc2Vzc2lvbktleSkge1xuICAgICAgICByZXR1cm4gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBfc2Vzc2lvbktleSwgX3Nlc3Npb25TYWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbiBhdC1yZXN0IHNlY3JldC4gUmVmdXNlcyB3aGVuIHRoZSBzZXNzaW9uIGlzIGV4cGxpY2l0bHkgbG9ja2VkLlxuICogTGVnYWN5IHBsYWludGV4dCB2YWx1ZXMgYXJlIHJldHVybmVkIHVuY2hhbmdlZCAodHJhbnNpdGlvbmFsIFx1MjAxNCBjYWxsZXJzIHNob3VsZFxuICogcmUtd3JhcCBvbiBuZXh0IHdyaXRlOyBzZWUgbWlncmF0aW9uIHBhdGhzKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVud3JhcFNlY3JldCh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHZhbHVlO1xuICAgIGlmICghaXNDaXBoZXJ0ZXh0KHZhbHVlKSkgcmV0dXJuIHZhbHVlOyAvLyBsZWdhY3kgcGxhaW50ZXh0IHBhc3N0aHJvdWdoXG4gICAgaWYgKF91bmxvY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NrZWQ6IHNlc3Npb24gaXMgbG9ja2VkIFx1MjAxNCBjYW5ub3QgcmVhZCBzZWNyZXQnKTtcbiAgICB9XG4gICAgaWYgKGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGRlY3J5cHRXaXRoRGV2aWNlS2V5KHZhbHVlKTtcbiAgICB9XG4gICAgLy8gcGFzc3dvcmQgYmxvYlxuICAgIGlmICghX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NrZWQ6IG5vIHNlc3Npb24ga2V5IGF2YWlsYWJsZSB0byBkZWNyeXB0IHNlY3JldCcpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdFdpdGhLZXkodmFsdWUsIF9zZXNzaW9uS2V5KTtcbn1cbiIsICIvKipcbiAqIEVuY3J5cHRpb24gdXRpbGl0aWVzIGZvciBOb3N0cktleSBtYXN0ZXIgcGFzc3dvcmQgZmVhdHVyZS5cbiAqXG4gKiBVc2VzIFdlYiBDcnlwdG8gQVBJIChjcnlwdG8uc3VidGxlKSBleGNsdXNpdmVseSBcdTIwMTQgbm8gZXh0ZXJuYWwgbGlicmFyaWVzLlxuICogLSBQQktERjIgd2l0aCA2MDAsMDAwIGl0ZXJhdGlvbnMgKE9XQVNQIDIwMjMgcmVjb21tZW5kYXRpb24pXG4gKiAtIEFFUy0yNTYtR0NNIGZvciBhdXRoZW50aWNhdGVkIGVuY3J5cHRpb25cbiAqIC0gUmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSBwZXIgb3BlcmF0aW9uXG4gKiAtIEFsbCBiaW5hcnkgZGF0YSBlbmNvZGVkIGFzIGJhc2U2NCBmb3IgSlNPTiBzdG9yYWdlIGNvbXBhdGliaWxpdHlcbiAqL1xuXG5jb25zdCBQQktERjJfSVRFUkFUSU9OUyA9IDYwMF8wMDA7XG5jb25zdCBTQUxUX0JZVEVTID0gMTY7XG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gS2V5IGRlcml2YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRGVyaXZlIGFuIEFFUy0yNTYtR0NNIENyeXB0b0tleSBmcm9tIGEgcGFzc3dvcmQgYW5kIHNhbHQgdXNpbmcgUEJLREYyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8VWludDhBcnJheX0gc2FsdCAtIDE2LWJ5dGUgc2FsdFxuICogQHBhcmFtIHt7ZXh0cmFjdGFibGU/OiBib29sZWFufX0gW29wdGlvbnNdIC0gYGV4dHJhY3RhYmxlOiB0cnVlYCBhbGxvd3MgdGhlXG4gKiAgICAgICAgcmF3IGJ5dGVzIHRvIGJlIGV4cG9ydGVkIG9uY2UgKHNlZSBleHBvcnRLZXlCYXNlNjQpLiBVc2VkIGJ5IHRoZVxuICogICAgICAgIGJhY2tncm91bmQgd29ya2VyIHNvIGFuIHVubG9ja2VkIHNlc3Npb24gY2FuIGJlIHBhcmtlZCBpblxuICogICAgICAgIHN0b3JhZ2Uuc2Vzc2lvbiBhbmQgZnVsbHkgcmVzdG9yZWQgYWZ0ZXIgYW4gTVYzIGV2aWN0aW9uLiBEZWZhdWx0XG4gKiAgICAgICAgZmFsc2U6IHRoZSBrZXkgaXMgb3BhcXVlIGFuZCBjYW5ub3QgbGVhdmUgdGhlIGNyeXB0byBzdWJzeXN0ZW0uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fSBBRVMtMjU2LUdDTSBrZXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlS2V5J11cbiAgICApO1xuXG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQ6IHNhbHQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gc2FsdCA6IG5ldyBVaW50OEFycmF5KHNhbHQpLFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgISFvcHRpb25zLmV4dHJhY3RhYmxlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgYW4gZXh0cmFjdGFibGUgQUVTIGtleSdzIHJhdyBieXRlcyBhcyBiYXNlNjQuXG4gKiBPbmx5IGV2ZXIgY2FsbGVkIG9uIGEga2V5IGRlcml2ZWQgd2l0aCBgeyBleHRyYWN0YWJsZTogdHJ1ZSB9YC5cbiAqXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBiYXNlNjQgcmF3IGtleSBieXRlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5QmFzZTY0KGtleSkge1xuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGF3YWl0IGNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KCdyYXcnLCBrZXkpKTtcbn1cblxuLyoqXG4gKiBJbXBvcnQgYmFzZTY0IHJhdyBieXRlcyBiYWNrIGludG8gYSBOT04tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ00ga2V5LlxuICogVGhlIGNvdW50ZXJwYXJ0IG9mIGV4cG9ydEtleUJhc2U2NDogd2hhdGV2ZXIgd2VudCBvdXQgZXh0cmFjdGFibGUgY29tZXMgYmFja1xuICogb3BhcXVlLCBzbyBhIHJlc3RvcmVkIHNlc3Npb24ga2V5IGNhbm5vdCBiZSByZS1leHBvcnRlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZTY0IC0gcmF3IGtleSBieXRlc1xuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydEtleUJhc2U2NChiYXNlNjQpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCksXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nIH0sXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLyoqIGJhc2U2NCBcdTIxOTQgYnl0ZXMsIGV4cG9ydGVkIHNvIGNhbGxlcnMgY2FuIHJvdW5kLXRyaXAgYSBzYWx0IHRocm91Z2ggSlNPTi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvQmFzZTY0KGJ5dGVzKSB7XG4gICAgLy8gYG5ldyBVaW50OEFycmF5KHZpZXcpYCBpbnNpZGUgdGhlIGhlbHBlciBjb3BpZXMgdGhlIFZJRVcsIHNvIGEgc2FsdCB0aGF0XG4gICAgLy8gaXMgYSB3aW5kb3cgaW50byBhIGxhcmdlciBidWZmZXIgc3RpbGwgZW5jb2RlcyBjb3JyZWN0bHkuXG4gICAgcmV0dXJuIGFycmF5QnVmZmVyVG9CYXNlNjQoYnl0ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhiYXNlNjQpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpKTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgd2l0aCBwcmUtZGVyaXZlZCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IGFuZCBpdHMgc2FsdC5cbiAqXG4gKiBUaGlzIGF2b2lkcyBob2xkaW5nIHRoZSByYXcgcGFzc3dvcmQgaW4gbWVtb3J5IFx1MjAxNCB0aGUgY2FsbGVyIGRlcml2ZXMgdGhlXG4gKiBrZXkgb25jZSAodmlhIGRlcml2ZUtleSkgYW5kIHJldXNlcyBpdCBmb3IgdGhlIHNlc3Npb24uICBUaGUgb3V0cHV0XG4gKiBmb3JtYXQgaXMgaWRlbnRpY2FsIHRvIGVuY3J5cHQoKSwgc28gZGVjcnlwdCgpIGNhbiBzdGlsbCBiZSB1c2VkIHdpdGhcbiAqIHRoZSBvcmlnaW5hbCBwYXNzd29yZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0ICAgICAgICAgIC0gVGhlIGRhdGEgdG8gZW5jcnlwdFxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgICAgICAtIEFFUy0yNTYtR0NNIGtleSBmcm9tIGRlcml2ZUtleSgpXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHNhbHQgICAgICAgICAgIC0gVGhlIHNhbHQgdGhhdCB3YXMgdXNlZCB0byBkZXJpdmUgYGtleWBcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIGtleSwgc2FsdCkge1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IC8gRGVjcnlwdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB3aXRoIGEgcGFzc3dvcmQuXG4gKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSwgZGVyaXZlcyBhblxuICogQUVTLTI1Ni1HQ00ga2V5IHZpYSBQQktERjIsIGFuZCByZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZ1xuICogYmFzZTY0LWVuY29kZWQgc2FsdCwgaXYsIGFuZCBjaXBoZXJ0ZXh0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgLSBUaGUgZGF0YSB0byBlbmNyeXB0IChlLmcuIGhleCBwcml2YXRlIGtleSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQsIHBhc3N3b3JkKSB7XG4gICAgY29uc3Qgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCk7XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSAoaWdub3JlcyB0aGUgc2FsdCBlbWJlZGRlZCBpbiB0aGVcbiAqIGJsb2IgXHUyMDE0IHRoZSBjYWxsZXIgbXVzdCBzdXBwbHkgYSBrZXkgdGhhdCBtYXRjaGVzIGhvdyB0aGUgYmxvYiB3YXMgZW5jcnlwdGVkKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpL2VuY3J5cHRXaXRoS2V5KClcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aEtleShlbmNyeXB0ZWREYXRhLCBrZXkpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdGhhdCB3YXMgZW5jcnlwdGVkIHdpdGggYGVuY3J5cHQoKWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgICAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHBhc3N3b3JkIGlzIHdyb25nIG9yIGRhdGEgaXMgdGFtcGVyZWQgd2l0aFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG5cbiAgICBjb25zdCBzYWx0QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuXG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0QnVmKTtcblxuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuXG4gICAgY29uc3QgZGVjID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgcmV0dXJuIGRlYy5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gUGFzc3dvcmQgaGFzaGluZyAoZm9yIHZlcmlmaWNhdGlvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogSGFzaCBhIHBhc3N3b3JkIHdpdGggUEJLREYyIGZvciB2ZXJpZmljYXRpb24gcHVycG9zZXMuXG4gKlxuICogVGhpcyBwcm9kdWNlcyBhIHNlcGFyYXRlIGhhc2ggKG5vdCB0aGUgZW5jcnlwdGlvbiBrZXkpIHRoYXQgY2FuIGJlIHN0b3JlZFxuICogdG8gdmVyaWZ5IHRoZSBwYXNzd29yZCB3aXRob3V0IG5lZWRpbmcgdG8gYXR0ZW1wdCBkZWNyeXB0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gW3NhbHRdIC0gT3B0aW9uYWwgc2FsdDsgZ2VuZXJhdGVkIGlmIG9taXR0ZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHsgaGFzaDogc3RyaW5nLCBzYWx0OiBzdHJpbmcgfT59IGJhc2U2NC1lbmNvZGVkIGhhc2ggYW5kIHNhbHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhc2hQYXNzd29yZChwYXNzd29yZCwgc2FsdCkge1xuICAgIGlmICghc2FsdCkge1xuICAgICAgICBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2FsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2FsdCA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUJpdHMnXVxuICAgICk7XG5cbiAgICBjb25zdCBoYXNoQml0cyA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVyaXZlQml0cyhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0LFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICAyNTZcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogYXJyYXlCdWZmZXJUb0Jhc2U2NChoYXNoQml0cyksXG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IGEgc3RvcmVkIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgLSBUaGUgcGFzc3dvcmQgdG8gdmVyaWZ5XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkSGFzaCAtIGJhc2U2NC1lbmNvZGVkIGhhc2ggZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZFNhbHQgLSBiYXNlNjQtZW5jb2RlZCBzYWx0IGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHRoZSBwYXNzd29yZCBtYXRjaGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkSGFzaCwgc3RvcmVkU2FsdCkge1xuICAgIGNvbnN0IHsgaGFzaCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRTYWx0KTtcbiAgICByZXR1cm4gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoaGFzaCwgc3RvcmVkSGFzaCk7XG59XG5cbi8qKlxuICogQ29uc3RhbnQtdGltZSBjb21wYXJpc29uIG9mIHR3byBiYXNlNjQtZW5jb2RlZCBieXRlIHN0cmluZ3MuXG4gKlxuICogRGVjb2RlcyBib3RoIHRvIHJhdyBieXRlcyBhbmQgY29tcGFyZXMgd2l0aCBhbiBhY2N1bXVsYXRvciBzbyB0aGUgcnVubmluZ1xuICogdGltZSBkb2VzIG5vdCBkZXBlbmQgb24gd2hlcmUgdGhlIGZpcnN0IG1pc21hdGNoIG9jY3VycyBcdTIwMTQgdGhpcyBhdm9pZHMgdGhlXG4gKiB0aW1pbmcgc2lkZS1jaGFubmVsIG9mIGEgcGxhaW4gYD09PWAgc3RyaW5nIGNvbXBhcmUgKFRpZXItMyBjcnlwdG8uanM6MjEzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGEsIGIpIHtcbiAgICBsZXQgYmEsIGJiO1xuICAgIHRyeSB7XG4gICAgICAgIGJhID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihhKSk7XG4gICAgICAgIGJiID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiKSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQ29tcGFyZSB0aGUgbWF4IGxlbmd0aCBzbyBsZW5ndGggZGlmZmVyZW5jZXMgZG9uJ3Qgc2hvcnQtY2lyY3VpdCBlYXJseS5cbiAgICBjb25zdCBsZW4gPSBNYXRoLm1heChiYS5sZW5ndGgsIGJiLmxlbmd0aCk7XG4gICAgbGV0IGRpZmYgPSBiYS5sZW5ndGggXiBiYi5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkaWZmIHw9IChiYVtpXSB8fCAwKSBeIChiYltpXSB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpZmYgPT09IDA7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUNBLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBOURBLE1BZ0JNLFVBYUEsVUF1Q0E7QUFwRU47QUFBQTtBQUFBO0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLFVBQUksQ0FBQyxVQUFVO0FBQ1gsY0FBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsTUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBdUNyRSxNQUFNLE1BQU0sQ0FBQztBQUdiLFVBQUksVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSVYsZUFBZSxNQUFNO0FBQ2pCLGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsVUFDL0M7QUFDQSxpQkFBTyxVQUFVLFNBQVMsU0FBUyxTQUFTLFFBQVEsV0FBVyxFQUFFLEdBQUcsSUFBSTtBQUFBLFFBQzVFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFRQSxXQUFXLFNBQVMsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSzVCLE9BQU8sTUFBTTtBQUNULGlCQUFPLFNBQVMsUUFBUSxPQUFPLElBQUk7QUFBQSxRQUN2QztBQUFBO0FBQUE7QUFBQTtBQUFBLFFBS0Esa0JBQWtCO0FBQ2QsY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsVUFDNUM7QUFDQSxpQkFBTyxVQUFVLFNBQVMsU0FBUyxTQUFTLFFBQVEsZUFBZSxFQUFFO0FBQUEsUUFDekU7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUtBLElBQUksS0FBSztBQUNMLGlCQUFPLFNBQVMsUUFBUTtBQUFBLFFBQzVCO0FBQUEsTUFDSjtBQUdBLFVBQUksVUFBVTtBQUFBLFFBQ1YsT0FBTztBQUFBLFVBQ0gsT0FBTyxNQUFNO0FBQ1QsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxZQUM3QztBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ2hGO0FBQUEsVUFDQSxPQUFPLE1BQU07QUFDVCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsTUFBTSxJQUFJLEdBQUcsSUFBSTtBQUFBLFlBQzdDO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDaEY7QUFBQSxVQUNBLFNBQVMsTUFBTTtBQUNYLGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxNQUFNLE1BQU0sR0FBRyxJQUFJO0FBQUEsWUFDL0M7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxPQUFPLFNBQVMsUUFBUSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUk7QUFBQSxVQUNsRjtBQUFBLFVBQ0EsVUFBVSxNQUFNO0FBQ1osZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxZQUNoRDtBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ25GO0FBQUEsUUFDSjtBQUFBO0FBQUE7QUFBQSxRQUlBLE1BQU0sU0FBUyxTQUFTLE9BQU87QUFBQSxVQUMzQixPQUFPLE1BQU07QUFDVCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLFlBQzVDO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDOUU7QUFBQSxVQUNBLE9BQU8sTUFBTTtBQUNULGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQUEsWUFDNUM7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxVQUM5RTtBQUFBLFVBQ0EsVUFBVSxNQUFNO0FBQ1osZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxZQUMvQztBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ2pGO0FBQUEsVUFDQSxTQUFTLE1BQU07QUFDWCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLFlBQzlDO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDaEY7QUFBQSxVQUNBLGlCQUFpQixNQUFNO0FBQ25CLGdCQUFJLENBQUMsU0FBUyxRQUFRLEtBQUssZUFBZTtBQUV0QyxxQkFBTyxRQUFRLFFBQVEsQ0FBQztBQUFBLFlBQzVCO0FBQ0EsZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLEtBQUssY0FBYyxHQUFHLElBQUk7QUFBQSxZQUN0RDtBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssYUFBYSxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ3hGO0FBQUEsUUFDSixJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQU1KLFNBQVMsU0FBUyxTQUFTLFVBQVU7QUFBQSxVQUNqQyxPQUFPLE1BQU07QUFDVCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsUUFBUSxJQUFJLEdBQUcsSUFBSTtBQUFBLFlBQy9DO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsU0FBUyxTQUFTLFFBQVEsUUFBUSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDcEY7QUFBQSxVQUNBLE9BQU8sTUFBTTtBQUNULGdCQUFJLENBQUMsVUFBVTtBQUNYLHFCQUFPLFNBQVMsUUFBUSxRQUFRLElBQUksR0FBRyxJQUFJO0FBQUEsWUFDL0M7QUFDQSxtQkFBTyxVQUFVLFNBQVMsUUFBUSxTQUFTLFNBQVMsUUFBUSxRQUFRLEdBQUcsRUFBRSxHQUFHLElBQUk7QUFBQSxVQUNwRjtBQUFBLFVBQ0EsVUFBVSxNQUFNO0FBQ1osZ0JBQUksQ0FBQyxVQUFVO0FBQ1gscUJBQU8sU0FBUyxRQUFRLFFBQVEsT0FBTyxHQUFHLElBQUk7QUFBQSxZQUNsRDtBQUNBLG1CQUFPLFVBQVUsU0FBUyxRQUFRLFNBQVMsU0FBUyxRQUFRLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLFVBQ3ZGO0FBQUEsVUFDQSxTQUFTLE1BQU07QUFDWCxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsUUFBUSxNQUFNLEdBQUcsSUFBSTtBQUFBLFlBQ2pEO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsU0FBUyxTQUFTLFFBQVEsUUFBUSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDdEY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS0Esa0JBQWtCLE1BQU07QUFDcEIsZ0JBQUksQ0FBQyxTQUFTLFFBQVEsUUFBUSxlQUFnQixRQUFPLFFBQVEsUUFBUTtBQUNyRSxnQkFBSSxDQUFDLFVBQVU7QUFDWCxxQkFBTyxTQUFTLFFBQVEsUUFBUSxlQUFlLEdBQUcsSUFBSTtBQUFBLFlBQzFEO0FBQ0EsbUJBQU8sVUFBVSxTQUFTLFFBQVEsU0FBUyxTQUFTLFFBQVEsUUFBUSxjQUFjLEVBQUUsR0FBRyxJQUFJO0FBQUEsVUFDL0Y7QUFBQSxRQUNKLElBQUk7QUFBQTtBQUFBLFFBR0osV0FBVyxTQUFTLFNBQVMsYUFBYTtBQUFBLE1BQzlDO0FBR0EsVUFBSSxPQUFPO0FBQUEsUUFDUCxVQUFVLE1BQU07QUFDWixjQUFJLENBQUMsVUFBVTtBQUNYLG1CQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ3ZDO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxRQUNqRTtBQUFBLFFBQ0EsU0FBUyxNQUFNO0FBQ1gsY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxVQUN0QztBQUNBLGlCQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDaEU7QUFBQSxRQUNBLFVBQVUsTUFBTTtBQUNaLGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsVUFDdkM7QUFDQSxpQkFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLFFBQ2pFO0FBQUEsUUFDQSxVQUFVLE1BQU07QUFDWixjQUFJLENBQUMsVUFBVTtBQUNYLG1CQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ3ZDO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxRQUNqRTtBQUFBLFFBQ0EsT0FBTyxNQUFNO0FBQ1QsY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxVQUNwQztBQUNBLGlCQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDOUQ7QUFBQSxRQUNBLGNBQWMsTUFBTTtBQUNoQixjQUFJLENBQUMsVUFBVTtBQUNYLG1CQUFPLFNBQVMsS0FBSyxXQUFXLEdBQUcsSUFBSTtBQUFBLFVBQzNDO0FBQ0EsaUJBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxHQUFHLElBQUk7QUFBQSxRQUNyRTtBQUFBLFFBQ0EsZUFBZSxNQUFNO0FBQ2pCLGNBQUksQ0FBQyxVQUFVO0FBQ1gsbUJBQU8sU0FBUyxLQUFLLFlBQVksR0FBRyxJQUFJO0FBQUEsVUFDNUM7QUFDQSxpQkFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssV0FBVyxFQUFFLEdBQUcsSUFBSTtBQUFBLFFBQ3RFO0FBQUEsTUFDSjtBQUlBLFVBQUksU0FBUyxTQUFTLFNBQVM7QUFBQSxRQUMzQixVQUFVLE1BQU07QUFFWixnQkFBTSxTQUFTLFNBQVMsT0FBTyxPQUFPLEdBQUcsSUFBSTtBQUM3QyxpQkFBTyxVQUFVLE9BQU8sT0FBTyxTQUFTLGFBQWEsU0FBUyxRQUFRLFFBQVE7QUFBQSxRQUNsRjtBQUFBLFFBQ0EsU0FBUyxNQUFNO0FBQ1gsY0FBSSxDQUFDLFVBQVU7QUFDWCxtQkFBTyxTQUFTLE9BQU8sTUFBTSxHQUFHLElBQUk7QUFBQSxVQUN4QztBQUNBLGlCQUFPLFVBQVUsU0FBUyxRQUFRLFNBQVMsT0FBTyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDcEU7QUFBQSxRQUNBLFNBQVMsU0FBUyxPQUFPO0FBQUEsTUFDN0IsSUFBSTtBQUFBO0FBQUE7OztBQ2xTSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBLFdBQVMsdUJBQXVCO0FBQzVCLFdBQVEsc0JBQ0gsb0JBQW9CO0FBQUEsTUFDakI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ1I7QUFFQSxXQUFTLDBCQUEwQjtBQUMvQixXQUFRLHlCQUNILHVCQUF1QjtBQUFBLE1BQ3BCLFVBQVUsVUFBVTtBQUFBLE1BQ3BCLFVBQVUsVUFBVTtBQUFBLE1BQ3BCLFVBQVUsVUFBVTtBQUFBLElBQ3hCO0FBQUEsRUFDUjtBQUlBLFdBQVMsaUJBQWlCLFNBQVM7QUFDL0IsVUFBTSxVQUFVLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUM3QyxZQUFNLFdBQVcsTUFBTTtBQUNuQixnQkFBUSxvQkFBb0IsV0FBVyxPQUFPO0FBQzlDLGdCQUFRLG9CQUFvQixTQUFTLEtBQUs7QUFBQSxNQUM5QztBQUNBLFlBQU0sVUFBVSxNQUFNO0FBQ2xCLGdCQUFRLEtBQUssUUFBUSxNQUFNLENBQUM7QUFDNUIsaUJBQVM7QUFBQSxNQUNiO0FBQ0EsWUFBTSxRQUFRLE1BQU07QUFDaEIsZUFBTyxRQUFRLEtBQUs7QUFDcEIsaUJBQVM7QUFBQSxNQUNiO0FBQ0EsY0FBUSxpQkFBaUIsV0FBVyxPQUFPO0FBQzNDLGNBQVEsaUJBQWlCLFNBQVMsS0FBSztBQUFBLElBQzNDLENBQUM7QUFHRCwwQkFBc0IsSUFBSSxTQUFTLE9BQU87QUFDMUMsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLCtCQUErQixJQUFJO0FBRXhDLFFBQUksbUJBQW1CLElBQUksRUFBRTtBQUN6QjtBQUNKLFVBQU0sT0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDMUMsWUFBTSxXQUFXLE1BQU07QUFDbkIsV0FBRyxvQkFBb0IsWUFBWSxRQUFRO0FBQzNDLFdBQUcsb0JBQW9CLFNBQVMsS0FBSztBQUNyQyxXQUFHLG9CQUFvQixTQUFTLEtBQUs7QUFBQSxNQUN6QztBQUNBLFlBQU0sV0FBVyxNQUFNO0FBQ25CLGdCQUFRO0FBQ1IsaUJBQVM7QUFBQSxNQUNiO0FBQ0EsWUFBTSxRQUFRLE1BQU07QUFDaEIsZUFBTyxHQUFHLFNBQVMsSUFBSSxhQUFhLGNBQWMsWUFBWSxDQUFDO0FBQy9ELGlCQUFTO0FBQUEsTUFDYjtBQUNBLFNBQUcsaUJBQWlCLFlBQVksUUFBUTtBQUN4QyxTQUFHLGlCQUFpQixTQUFTLEtBQUs7QUFDbEMsU0FBRyxpQkFBaUIsU0FBUyxLQUFLO0FBQUEsSUFDdEMsQ0FBQztBQUVELHVCQUFtQixJQUFJLElBQUksSUFBSTtBQUFBLEVBQ25DO0FBNkJBLFdBQVMsYUFBYSxVQUFVO0FBQzVCLG9CQUFnQixTQUFTLGFBQWE7QUFBQSxFQUMxQztBQUNBLFdBQVMsYUFBYSxNQUFNO0FBUXhCLFFBQUksd0JBQXdCLEVBQUUsU0FBUyxJQUFJLEdBQUc7QUFDMUMsYUFBTyxZQUFhLE1BQU07QUFHdEIsYUFBSyxNQUFNLE9BQU8sSUFBSSxHQUFHLElBQUk7QUFDN0IsZUFBTyxLQUFLLEtBQUssT0FBTztBQUFBLE1BQzVCO0FBQUEsSUFDSjtBQUNBLFdBQU8sWUFBYSxNQUFNO0FBR3RCLGFBQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQUEsSUFDOUM7QUFBQSxFQUNKO0FBQ0EsV0FBUyx1QkFBdUIsT0FBTztBQUNuQyxRQUFJLE9BQU8sVUFBVTtBQUNqQixhQUFPLGFBQWEsS0FBSztBQUc3QixRQUFJLGlCQUFpQjtBQUNqQixxQ0FBK0IsS0FBSztBQUN4QyxRQUFJLGNBQWMsT0FBTyxxQkFBcUIsQ0FBQztBQUMzQyxhQUFPLElBQUksTUFBTSxPQUFPLGFBQWE7QUFFekMsV0FBTztBQUFBLEVBQ1g7QUFDQSxXQUFTLEtBQUssT0FBTztBQUdqQixRQUFJLGlCQUFpQjtBQUNqQixhQUFPLGlCQUFpQixLQUFLO0FBR2pDLFFBQUksZUFBZSxJQUFJLEtBQUs7QUFDeEIsYUFBTyxlQUFlLElBQUksS0FBSztBQUNuQyxVQUFNLFdBQVcsdUJBQXVCLEtBQUs7QUFHN0MsUUFBSSxhQUFhLE9BQU87QUFDcEIscUJBQWUsSUFBSSxPQUFPLFFBQVE7QUFDbEMsNEJBQXNCLElBQUksVUFBVSxLQUFLO0FBQUEsSUFDN0M7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQVVBLFdBQVMsT0FBTyxNQUFNLFNBQVMsRUFBRSxTQUFTLFNBQVMsVUFBVSxXQUFXLElBQUksQ0FBQyxHQUFHO0FBQzVFLFVBQU0sVUFBVSxVQUFVLEtBQUssTUFBTSxPQUFPO0FBQzVDLFVBQU0sY0FBYyxLQUFLLE9BQU87QUFDaEMsUUFBSSxTQUFTO0FBQ1QsY0FBUSxpQkFBaUIsaUJBQWlCLENBQUMsVUFBVTtBQUNqRCxnQkFBUSxLQUFLLFFBQVEsTUFBTSxHQUFHLE1BQU0sWUFBWSxNQUFNLFlBQVksS0FBSyxRQUFRLFdBQVcsR0FBRyxLQUFLO0FBQUEsTUFDdEcsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLFNBQVM7QUFDVCxjQUFRLGlCQUFpQixXQUFXLENBQUMsVUFBVTtBQUFBO0FBQUEsUUFFL0MsTUFBTTtBQUFBLFFBQVksTUFBTTtBQUFBLFFBQVk7QUFBQSxNQUFLLENBQUM7QUFBQSxJQUM5QztBQUNBLGdCQUNLLEtBQUssQ0FBQyxPQUFPO0FBQ2QsVUFBSTtBQUNBLFdBQUcsaUJBQWlCLFNBQVMsTUFBTSxXQUFXLENBQUM7QUFDbkQsVUFBSSxVQUFVO0FBQ1YsV0FBRyxpQkFBaUIsaUJBQWlCLENBQUMsVUFBVSxTQUFTLE1BQU0sWUFBWSxNQUFNLFlBQVksS0FBSyxDQUFDO0FBQUEsTUFDdkc7QUFBQSxJQUNKLENBQUMsRUFDSSxNQUFNLE1BQU07QUFBQSxJQUFFLENBQUM7QUFDcEIsV0FBTztBQUFBLEVBQ1g7QUFNQSxXQUFTLFNBQVMsTUFBTSxFQUFFLFFBQVEsSUFBSSxDQUFDLEdBQUc7QUFDdEMsVUFBTSxVQUFVLFVBQVUsZUFBZSxJQUFJO0FBQzdDLFFBQUksU0FBUztBQUNULGNBQVEsaUJBQWlCLFdBQVcsQ0FBQyxVQUFVO0FBQUE7QUFBQSxRQUUvQyxNQUFNO0FBQUEsUUFBWTtBQUFBLE1BQUssQ0FBQztBQUFBLElBQzVCO0FBQ0EsV0FBTyxLQUFLLE9BQU8sRUFBRSxLQUFLLE1BQU0sTUFBUztBQUFBLEVBQzdDO0FBS0EsV0FBUyxVQUFVLFFBQVEsTUFBTTtBQUM3QixRQUFJLEVBQUUsa0JBQWtCLGVBQ3BCLEVBQUUsUUFBUSxXQUNWLE9BQU8sU0FBUyxXQUFXO0FBQzNCO0FBQUEsSUFDSjtBQUNBLFFBQUksY0FBYyxJQUFJLElBQUk7QUFDdEIsYUFBTyxjQUFjLElBQUksSUFBSTtBQUNqQyxVQUFNLGlCQUFpQixLQUFLLFFBQVEsY0FBYyxFQUFFO0FBQ3BELFVBQU0sV0FBVyxTQUFTO0FBQzFCLFVBQU0sVUFBVSxhQUFhLFNBQVMsY0FBYztBQUNwRDtBQUFBO0FBQUEsTUFFQSxFQUFFLG1CQUFtQixXQUFXLFdBQVcsZ0JBQWdCLGNBQ3ZELEVBQUUsV0FBVyxZQUFZLFNBQVMsY0FBYztBQUFBLE1BQUk7QUFDcEQ7QUFBQSxJQUNKO0FBQ0EsVUFBTSxTQUFTLGVBQWdCLGNBQWMsTUFBTTtBQUUvQyxZQUFNLEtBQUssS0FBSyxZQUFZLFdBQVcsVUFBVSxjQUFjLFVBQVU7QUFDekUsVUFBSUEsVUFBUyxHQUFHO0FBQ2hCLFVBQUk7QUFDQSxRQUFBQSxVQUFTQSxRQUFPLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFNdEMsY0FBUSxNQUFNLFFBQVEsSUFBSTtBQUFBLFFBQ3RCQSxRQUFPLGNBQWMsRUFBRSxHQUFHLElBQUk7QUFBQSxRQUM5QixXQUFXLEdBQUc7QUFBQSxNQUNsQixDQUFDLEdBQUcsQ0FBQztBQUFBLElBQ1Q7QUFDQSxrQkFBYyxJQUFJLE1BQU0sTUFBTTtBQUM5QixXQUFPO0FBQUEsRUFDWDtBQXdCQSxrQkFBZ0IsV0FBVyxNQUFNO0FBRTdCLFFBQUksU0FBUztBQUNiLFFBQUksRUFBRSxrQkFBa0IsWUFBWTtBQUNoQyxlQUFTLE1BQU0sT0FBTyxXQUFXLEdBQUcsSUFBSTtBQUFBLElBQzVDO0FBQ0EsUUFBSSxDQUFDO0FBQ0Q7QUFDSixhQUFTO0FBQ1QsVUFBTSxnQkFBZ0IsSUFBSSxNQUFNLFFBQVEsbUJBQW1CO0FBQzNELHFDQUFpQyxJQUFJLGVBQWUsTUFBTTtBQUUxRCwwQkFBc0IsSUFBSSxlQUFlLE9BQU8sTUFBTSxDQUFDO0FBQ3ZELFdBQU8sUUFBUTtBQUNYLFlBQU07QUFFTixlQUFTLE9BQU8sZUFBZSxJQUFJLGFBQWEsS0FBSyxPQUFPLFNBQVM7QUFDckUscUJBQWUsT0FBTyxhQUFhO0FBQUEsSUFDdkM7QUFBQSxFQUNKO0FBQ0EsV0FBUyxlQUFlLFFBQVEsTUFBTTtBQUNsQyxXQUFTLFNBQVMsT0FBTyxpQkFDckIsY0FBYyxRQUFRLENBQUMsVUFBVSxnQkFBZ0IsU0FBUyxDQUFDLEtBQzFELFNBQVMsYUFBYSxjQUFjLFFBQVEsQ0FBQyxVQUFVLGNBQWMsQ0FBQztBQUFBLEVBQy9FO0FBblNBLE1BQU0sZUFFRixtQkFDQSxzQkFxQkUsb0JBQ0EsZ0JBQ0EsdUJBZ0RGLGVBbUZFLFFBZ0RBLGFBQ0EsY0FDQSxlQTJDQSxvQkFDQSxXQUNBLGdCQUNBLGtDQUNBO0FBOVBOO0FBQUE7QUFBQTtBQUFBLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxpQkFBaUIsYUFBYSxLQUFLLENBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQXdCNUYsTUFBTSxxQkFBcUIsb0JBQUksUUFBUTtBQUN2QyxNQUFNLGlCQUFpQixvQkFBSSxRQUFRO0FBQ25DLE1BQU0sd0JBQXdCLG9CQUFJLFFBQVE7QUFnRDFDLE1BQUksZ0JBQWdCO0FBQUEsUUFDaEIsSUFBSSxRQUFRLE1BQU0sVUFBVTtBQUN4QixjQUFJLGtCQUFrQixnQkFBZ0I7QUFFbEMsZ0JBQUksU0FBUztBQUNULHFCQUFPLG1CQUFtQixJQUFJLE1BQU07QUFFeEMsZ0JBQUksU0FBUyxTQUFTO0FBQ2xCLHFCQUFPLFNBQVMsaUJBQWlCLENBQUMsSUFDNUIsU0FDQSxTQUFTLFlBQVksU0FBUyxpQkFBaUIsQ0FBQyxDQUFDO0FBQUEsWUFDM0Q7QUFBQSxVQUNKO0FBRUEsaUJBQU8sS0FBSyxPQUFPLElBQUksQ0FBQztBQUFBLFFBQzVCO0FBQUEsUUFDQSxJQUFJLFFBQVEsTUFBTSxPQUFPO0FBQ3JCLGlCQUFPLElBQUksSUFBSTtBQUNmLGlCQUFPO0FBQUEsUUFDWDtBQUFBLFFBQ0EsSUFBSSxRQUFRLE1BQU07QUFDZCxjQUFJLGtCQUFrQixtQkFDakIsU0FBUyxVQUFVLFNBQVMsVUFBVTtBQUN2QyxtQkFBTztBQUFBLFVBQ1g7QUFDQSxpQkFBTyxRQUFRO0FBQUEsUUFDbkI7QUFBQSxNQUNKO0FBd0RBLE1BQU0sU0FBUyxDQUFDLFVBQVUsc0JBQXNCLElBQUksS0FBSztBQWdEekQsTUFBTSxjQUFjLENBQUMsT0FBTyxVQUFVLFVBQVUsY0FBYyxPQUFPO0FBQ3JFLE1BQU0sZUFBZSxDQUFDLE9BQU8sT0FBTyxVQUFVLE9BQU87QUFDckQsTUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQXFDOUIsbUJBQWEsQ0FBQyxjQUFjO0FBQUEsUUFDeEIsR0FBRztBQUFBLFFBQ0gsS0FBSyxDQUFDLFFBQVEsTUFBTSxhQUFhLFVBQVUsUUFBUSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsTUFBTSxRQUFRO0FBQUEsUUFDL0YsS0FBSyxDQUFDLFFBQVEsU0FBUyxDQUFDLENBQUMsVUFBVSxRQUFRLElBQUksS0FBSyxTQUFTLElBQUksUUFBUSxJQUFJO0FBQUEsTUFDakYsRUFBRTtBQUVGLE1BQU0scUJBQXFCLENBQUMsWUFBWSxzQkFBc0IsU0FBUztBQUN2RSxNQUFNLFlBQVksQ0FBQztBQUNuQixNQUFNLGlCQUFpQixvQkFBSSxRQUFRO0FBQ25DLE1BQU0sbUNBQW1DLG9CQUFJLFFBQVE7QUFDckQsTUFBTSxzQkFBc0I7QUFBQSxRQUN4QixJQUFJLFFBQVEsTUFBTTtBQUNkLGNBQUksQ0FBQyxtQkFBbUIsU0FBUyxJQUFJO0FBQ2pDLG1CQUFPLE9BQU8sSUFBSTtBQUN0QixjQUFJLGFBQWEsVUFBVSxJQUFJO0FBQy9CLGNBQUksQ0FBQyxZQUFZO0FBQ2IseUJBQWEsVUFBVSxJQUFJLElBQUksWUFBYSxNQUFNO0FBQzlDLDZCQUFlLElBQUksTUFBTSxpQ0FBaUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQUEsWUFDdEY7QUFBQSxVQUNKO0FBQ0EsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSjtBQTBCQSxtQkFBYSxDQUFDLGNBQWM7QUFBQSxRQUN4QixHQUFHO0FBQUEsUUFDSCxJQUFJLFFBQVEsTUFBTSxVQUFVO0FBQ3hCLGNBQUksZUFBZSxRQUFRLElBQUk7QUFDM0IsbUJBQU87QUFDWCxpQkFBTyxTQUFTLElBQUksUUFBUSxNQUFNLFFBQVE7QUFBQSxRQUM5QztBQUFBLFFBQ0EsSUFBSSxRQUFRLE1BQU07QUFDZCxpQkFBTyxlQUFlLFFBQVEsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLElBQUk7QUFBQSxRQUNwRTtBQUFBLE1BQ0osRUFBRTtBQUFBO0FBQUE7OztBQzlTRjtBQUFBOzs7QUNBQTtBQXVCQSxNQUFJLFFBQVEsUUFBUSxRQUFRO0FBRTVCLE1BQUksWUFBWTtBQUVoQixXQUFTLFlBQVk7QUFDakIsUUFBSSxTQUFTLGdCQUFnQixhQUFhLGlCQUFpQixNQUFNLE1BQU8sUUFBTztBQUMvRSxRQUFJO0FBQ0EsYUFBTyxPQUFPLFdBQVcsa0NBQWtDLEVBQUU7QUFBQSxJQUNqRSxTQUFTLEdBQUc7QUFDUixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFNQSxXQUFTLFdBQVcsRUFBRSxPQUFPLE1BQU0sY0FBYyxhQUFhLGFBQWEsU0FBUyxPQUFPLEdBQUc7QUFDMUYsV0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZO0FBQzVCLFlBQU0sWUFBWSxTQUFTO0FBRTNCLFlBQU0sT0FBTyxTQUFTLGNBQWMsS0FBSztBQUN6QyxXQUFLLFlBQVk7QUFFakIsWUFBTSxXQUFXLFNBQVMsY0FBYyxLQUFLO0FBQzdDLGVBQVMsWUFBWTtBQUVyQixZQUFNLFVBQVUsWUFBWTtBQUM1QixZQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsYUFBTyxZQUFZLFVBQVUsc0JBQXNCO0FBQ25ELGFBQU8sYUFBYSxRQUFTLGVBQWUsU0FBVSxnQkFBZ0IsUUFBUTtBQUM5RSxhQUFPLGFBQWEsY0FBYyxNQUFNO0FBRXhDLFVBQUksU0FBUztBQUNULGNBQU0sU0FBUyxTQUFTLGNBQWMsS0FBSztBQUMzQyxlQUFPLFlBQVk7QUFDbkIsZUFBTyxZQUFZLE1BQU07QUFBQSxNQUM3QjtBQUVBLFlBQU0sTUFBTSxFQUFFO0FBQ2QsWUFBTSxVQUFVLFNBQVMsY0FBYyxJQUFJO0FBQzNDLGNBQVEsWUFBWTtBQUNwQixjQUFRLEtBQUsscUJBQXFCLEdBQUc7QUFDckMsY0FBUSxjQUFjLFNBQVM7QUFDL0IsYUFBTyxZQUFZLE9BQU87QUFDMUIsYUFBTyxhQUFhLG1CQUFtQixRQUFRLEVBQUU7QUFFakQsWUFBTSxTQUFTLFNBQVMsY0FBYyxHQUFHO0FBQ3pDLGFBQU8sWUFBWTtBQUNuQixhQUFPLEtBQUssb0JBQW9CLEdBQUc7QUFDbkMsYUFBTyxjQUFjLFFBQVE7QUFDN0IsYUFBTyxZQUFZLE1BQU07QUFDekIsYUFBTyxhQUFhLG9CQUFvQixPQUFPLEVBQUU7QUFFakQsWUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLGNBQVEsWUFBWTtBQUVwQixZQUFNLFVBQVUsQ0FBQztBQUNqQixVQUFJLFlBQVk7QUFDaEIsWUFBTSxhQUFhLFNBQVMsY0FBYyxRQUFRO0FBQ2xELGlCQUFXLE9BQU87QUFDbEIsaUJBQVcsY0FBYztBQUN6QixVQUFJLFFBQVE7QUFDUixtQkFBVyxZQUFZO0FBQUEsTUFDM0IsT0FBTztBQUNILG9CQUFZLFNBQVMsY0FBYyxRQUFRO0FBQzNDLGtCQUFVLE9BQU87QUFDakIsa0JBQVUsWUFBWTtBQUN0QixrQkFBVSxjQUFjO0FBQ3hCLGdCQUFRLFlBQVksU0FBUztBQUM3QixnQkFBUSxLQUFLLFNBQVM7QUFDdEIsbUJBQVcsWUFBWSxjQUFjLHlCQUF5QjtBQUFBLE1BQ2xFO0FBQ0EsY0FBUSxZQUFZLFVBQVU7QUFDOUIsY0FBUSxLQUFLLFVBQVU7QUFDdkIsYUFBTyxZQUFZLE9BQU87QUFFMUIsV0FBSyxZQUFZLFFBQVE7QUFDekIsV0FBSyxZQUFZLE1BQU07QUFFdkIsVUFBSSxVQUFVO0FBQ2QsZUFBUyxPQUFPLFFBQVE7QUFDcEIsWUFBSSxRQUFTO0FBQ2Isa0JBQVU7QUFDVixpQkFBUyxvQkFBb0IsV0FBVyxXQUFXLElBQUk7QUFDdkQsaUJBQVMsVUFBVSxPQUFPLFNBQVM7QUFDbkMsZUFBTyxVQUFVLE9BQU8sU0FBUztBQUNqQyxjQUFNLFNBQVMsTUFBTTtBQUNqQixlQUFLLE9BQU87QUFDWixjQUFJO0FBQ0EsZ0JBQUksYUFBYSxPQUFPLFVBQVUsVUFBVSxjQUFjLFNBQVMsU0FBUyxTQUFTLEdBQUc7QUFDcEYsd0JBQVUsTUFBTTtBQUFBLFlBQ3BCO0FBQUEsVUFDSixTQUFTLEdBQUc7QUFBQSxVQUFxQztBQUNqRCxrQkFBUSxNQUFNO0FBQUEsUUFDbEI7QUFDQSxZQUFJLFVBQVUsRUFBRyxRQUFPO0FBQUEsWUFDbkIsWUFBVyxRQUFRLEdBQUc7QUFBQSxNQUMvQjtBQUVBLGVBQVMsVUFBVSxJQUFJO0FBQ25CLFlBQUksR0FBRyxRQUFRLFVBQVU7QUFDckIsYUFBRyxlQUFlO0FBQ2xCLGlCQUFPLEtBQUs7QUFDWjtBQUFBLFFBQ0o7QUFDQSxZQUFJLEdBQUcsUUFBUSxPQUFPO0FBRWxCLGFBQUcsZUFBZTtBQUNsQixnQkFBTSxNQUFNLFFBQVEsUUFBUSxTQUFTLGFBQWE7QUFDbEQsZ0JBQU0sTUFBTSxHQUFHLFdBQVcsS0FBSztBQUMvQixtQkFBUyxNQUFNLE1BQU0sUUFBUSxVQUFVLFFBQVEsTUFBTSxFQUFFLE1BQU07QUFBQSxRQUNqRTtBQUFBLE1BQ0o7QUFFQSxlQUFTLGlCQUFpQixTQUFTLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFDdEQsVUFBSSxVQUFXLFdBQVUsaUJBQWlCLFNBQVMsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUN0RSxpQkFBVyxpQkFBaUIsU0FBUyxNQUFNLE9BQU8sSUFBSSxDQUFDO0FBQ3ZELGVBQVMsaUJBQWlCLFdBQVcsV0FBVyxJQUFJO0FBRXBELGVBQVMsS0FBSyxZQUFZLElBQUk7QUFDOUIsNEJBQXNCLE1BQU07QUFDeEIsaUJBQVMsVUFBVSxJQUFJLFNBQVM7QUFDaEMsZUFBTyxVQUFVLElBQUksU0FBUztBQUc5QixjQUFNLFVBQVUsU0FBUyxhQUFjLGNBQWMsWUFBWTtBQUNqRSxTQUFDLFdBQVcsWUFBWSxNQUFNO0FBQUEsTUFDbEMsQ0FBQztBQUFBLElBQ0wsQ0FBQztBQUFBLEVBQ0w7QUFFTyxXQUFTLFdBQVc7QUFBQSxJQUN2QjtBQUFBLElBQ0E7QUFBQSxJQUNBLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxFQUNkLElBQUksQ0FBQyxHQUFHO0FBQ0osVUFBTSxTQUFTLE1BQU0sS0FBSyxNQUN0QixXQUFXLEVBQUUsT0FBTyxNQUFNLGNBQWMsYUFBYSxhQUFhLFNBQVMsUUFBUSxNQUFNLENBQUMsQ0FBQztBQUMvRixZQUFRLE9BQU8sTUFBTSxNQUFNO0FBQUEsSUFBQyxDQUFDO0FBQzdCLFdBQU87QUFBQSxFQUNYOzs7QUN2S0E7QUFpQkE7OztBQ2pCQTtBQVdBOzs7QUNYQTs7O0FDQUE7QUFZQSxNQUFNLFdBQVc7QUFJakIsV0FBUyxvQkFBb0IsUUFBUTtBQUNqQyxVQUFNLFFBQVEsSUFBSSxXQUFXLE1BQU07QUFDbkMsUUFBSSxTQUFTO0FBQ2IsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNuQyxnQkFBVSxPQUFPLGFBQWEsTUFBTSxDQUFDLENBQUM7QUFBQSxJQUMxQztBQUNBLFdBQU8sS0FBSyxNQUFNO0FBQUEsRUFDdEI7QUFFQSxXQUFTLG9CQUFvQixRQUFRO0FBQ2pDLFVBQU0sU0FBUyxLQUFLLE1BQU07QUFDMUIsVUFBTSxRQUFRLElBQUksV0FBVyxPQUFPLE1BQU07QUFDMUMsYUFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsS0FBSztBQUNwQyxZQUFNLENBQUMsSUFBSSxPQUFPLFdBQVcsQ0FBQztBQUFBLElBQ2xDO0FBQ0EsV0FBTyxNQUFNO0FBQUEsRUFDakI7QUErRkEsaUJBQXNCLGVBQWUsV0FBVyxLQUFLLE1BQU07QUFDdkQsVUFBTSxLQUFLLE9BQU8sZ0JBQWdCLElBQUksV0FBVyxRQUFRLENBQUM7QUFDMUQsVUFBTSxNQUFNLElBQUksWUFBWTtBQUM1QixVQUFNLGFBQWEsTUFBTSxPQUFPLE9BQU87QUFBQSxNQUNuQyxFQUFFLE1BQU0sV0FBVyxHQUFHO0FBQUEsTUFDdEI7QUFBQSxNQUNBLElBQUksT0FBTyxTQUFTO0FBQUEsSUFDeEI7QUFFQSxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU0sb0JBQW9CLElBQUk7QUFBQSxNQUM5QixJQUFJLG9CQUFvQixFQUFFO0FBQUEsTUFDMUIsWUFBWSxvQkFBb0IsVUFBVTtBQUFBLElBQzlDLENBQUM7QUFBQSxFQUNMO0FBMENBLGlCQUFzQixlQUFlLGVBQWUsS0FBSztBQUNyRCxVQUFNLEVBQUUsSUFBSSxXQUFXLElBQUksS0FBSyxNQUFNLGFBQWE7QUFDbkQsVUFBTSxRQUFRLElBQUksV0FBVyxvQkFBb0IsRUFBRSxDQUFDO0FBQ3BELFVBQU0sUUFBUSxvQkFBb0IsVUFBVTtBQUM1QyxVQUFNLFdBQVcsTUFBTSxPQUFPLE9BQU87QUFBQSxNQUNqQyxFQUFFLE1BQU0sV0FBVyxJQUFJLE1BQU07QUFBQSxNQUM3QjtBQUFBLE1BQ0E7QUFBQSxJQUNKO0FBQ0EsV0FBTyxJQUFJLFlBQVksRUFBRSxPQUFPLFFBQVE7QUFBQSxFQUM1Qzs7O0FEeEhBLE1BQU1DLFlBQVc7QUFDakIsTUFBTSxZQUFZO0FBQ2xCLE1BQU0sZUFBZTtBQUNyQixNQUFNLGdCQUFnQjtBQUV0QixNQUFNLGtCQUFrQjtBQUN4QixNQUFNLG9CQUFvQjtBQUUxQixNQUFNLHNCQUFzQjtBQUc1QixXQUFTLFdBQVcsUUFBUTtBQUN4QixVQUFNLFFBQVEsSUFBSSxXQUFXLE1BQU07QUFDbkMsUUFBSSxTQUFTO0FBQ2IsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsSUFBSyxXQUFVLE9BQU8sYUFBYSxNQUFNLENBQUMsQ0FBQztBQUM3RSxXQUFPLEtBQUssTUFBTTtBQUFBLEVBQ3RCO0FBQ0EsV0FBUyxXQUFXLEtBQUs7QUFDckIsVUFBTSxTQUFTLEtBQUssR0FBRztBQUN2QixVQUFNLFFBQVEsSUFBSSxXQUFXLE9BQU8sTUFBTTtBQUMxQyxhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxJQUFLLE9BQU0sQ0FBQyxJQUFJLE9BQU8sV0FBVyxDQUFDO0FBQ3RFLFdBQU8sTUFBTTtBQUFBLEVBQ2pCO0FBR0EsTUFBSSxjQUFjO0FBQ2xCLE1BQUksZUFBZTtBQUduQixNQUFJLFlBQVk7QUF3QmhCLE1BQUksb0JBQW9CO0FBQ3hCLE1BQUksa0JBQWtCO0FBQ3RCLE1BQUksbUJBQW1CO0FBQ3ZCLE1BQUksdUJBQXVCO0FBQzNCLE1BQUksMEJBQTBCO0FBRTlCLGlCQUFlLG9CQUFvQjtBQUMvQixXQUFPLE9BQU8sT0FBTztBQUFBLE1BQ2pCLEVBQUUsTUFBTSxXQUFXLFFBQVEsSUFBSTtBQUFBLE1BQy9CO0FBQUE7QUFBQSxNQUNBLENBQUMsV0FBVyxTQUFTO0FBQUEsSUFDekI7QUFBQSxFQUNKO0FBRUEsV0FBUyxxQkFBcUI7QUFDMUIsV0FBTyxPQUFPLGNBQWMsZUFBZSxjQUFjO0FBQUEsRUFDN0Q7QUFRQSxpQkFBZSxjQUFjLEtBQUs7QUFDOUIsUUFBSSxDQUFDLElBQUssUUFBTztBQUNqQixRQUFJO0FBQ0EsWUFBTSxLQUFLLE9BQU8sZ0JBQWdCLElBQUksV0FBV0MsU0FBUSxDQUFDO0FBQzFELFlBQU0sUUFBUSxJQUFJLFlBQVksRUFBRSxPQUFPLHVCQUF1QjtBQUM5RCxZQUFNLEtBQUssTUFBTSxPQUFPLE9BQU8sUUFBUSxFQUFFLE1BQU0sV0FBVyxHQUFHLEdBQUcsS0FBSyxLQUFLO0FBQzFFLFlBQU0sS0FBSyxNQUFNLE9BQU8sT0FBTyxRQUFRLEVBQUUsTUFBTSxXQUFXLEdBQUcsR0FBRyxLQUFLLEVBQUU7QUFDdkUsYUFBTyxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTTtBQUFBLElBQzVDLFFBQVE7QUFDSixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFFQSxpQkFBZSxlQUFlO0FBRTFCLFVBQU0sRUFBRSxRQUFBQyxRQUFPLElBQUksTUFBTTtBQUN6QixXQUFPQSxRQUFPLFdBQVcsR0FBRztBQUFBLE1BQ3hCLFFBQVEsR0FBRztBQUNQLFlBQUksQ0FBQyxFQUFFLGlCQUFpQixTQUFTLFlBQVksR0FBRztBQUM1QyxZQUFFLGtCQUFrQixZQUFZO0FBQUEsUUFDcEM7QUFBQSxNQUNKO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQWVBLGlCQUFlLGtCQUFrQjtBQUM3QixRQUFJLENBQUMsbUJBQW1CLEVBQUcsUUFBTztBQUNsQyxRQUFJO0FBQ0EsWUFBTSxLQUFLLE1BQU0sYUFBYTtBQUM5QixZQUFNLFdBQVcsTUFBTSxHQUFHLElBQUksY0FBYyxhQUFhO0FBQ3pELFVBQUksQ0FBQyxTQUFVLFFBQU87QUFDdEIsYUFBUSxNQUFNLGNBQWMsUUFBUSxJQUFLLFdBQVc7QUFBQSxJQUN4RCxRQUFRO0FBQ0osYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBTUEsaUJBQWUsY0FBYztBQUN6QixRQUFJO0FBQ0EsWUFBTSxFQUFFLEtBQUFDLEtBQUksSUFBSSxNQUFNO0FBQ3RCLGFBQU9BLE1BQUssU0FBUyxTQUFTO0FBQUEsSUFDbEMsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUdBLFdBQVMsd0JBQXdCO0FBQzdCLFFBQUk7QUFDQSxZQUFNLEtBQU0sT0FBTyxjQUFjLGVBQWUsVUFBVSxhQUFjO0FBQ3hFLGFBQU8scUJBQXFCLEtBQUssRUFBRSxLQUFLLENBQUMsMkJBQTJCLEtBQUssRUFBRTtBQUFBLElBQy9FLFFBQVE7QUFDSixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFhQSxpQkFBZSxpQkFBaUI7QUFDNUIsUUFBSSxTQUFTO0FBQ2IsUUFBSTtBQUNBLFlBQU0sRUFBRSxLQUFBQSxLQUFJLElBQUksTUFBTTtBQUN0QixZQUFNLE1BQU1BLE1BQUssU0FBUyxTQUFTLEVBQUU7QUFDckMsZUFBUyxPQUFPLFFBQVEsV0FBVyxNQUFNO0FBQUEsSUFDN0MsUUFBUTtBQUNKLGVBQVM7QUFBQSxJQUNiO0FBRUEsUUFBSSxVQUFVLE9BQU8sV0FBVyx5QkFBeUIsRUFBRyxRQUFPO0FBR25FLFFBQUksc0JBQXNCLEVBQUcsUUFBTztBQUVwQyxRQUFJLFdBQVcsT0FBTyxXQUFXLHFCQUFxQixLQUFLLE9BQU8sV0FBVyxrQkFBa0IsSUFBSTtBQUMvRixhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU87QUFBQSxFQUNYO0FBR0EsaUJBQWUsY0FBYyxTQUFTO0FBQ2xDLFdBQU8sT0FBTyxPQUFPO0FBQUEsTUFDakI7QUFBQSxNQUFPLFdBQVcsT0FBTztBQUFBLE1BQUcsRUFBRSxNQUFNLFVBQVU7QUFBQSxNQUM5QztBQUFBO0FBQUEsTUFDQSxDQUFDLFdBQVcsU0FBUztBQUFBLElBQ3pCO0FBQUEsRUFDSjtBQUdBLGlCQUFlLHFCQUFxQjtBQUNoQyxVQUFNLFFBQVEsTUFBTSxZQUFZO0FBQ2hDLFFBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsUUFBSTtBQUNBLFlBQU0sTUFBTSxNQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0FBQzNELFlBQU0sSUFBSSxNQUFNLG1CQUFtQjtBQUNuQyxhQUFRLE1BQU0sU0FBUyxNQUFNLFNBQVUsSUFBSTtBQUFBLElBQy9DLFFBQVE7QUFDSixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFHQSxpQkFBZSxvQkFBb0IsVUFBVTtBQUN6QyxRQUFJLGFBQWEsU0FBUyxhQUFhLE9BQVE7QUFDL0MsVUFBTSxRQUFRLE1BQU0sWUFBWTtBQUNoQyxRQUFJLENBQUMsTUFBTztBQUNaLFFBQUk7QUFDQSxZQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO0FBQUEsSUFDdkQsUUFBUTtBQUFBLElBQStEO0FBQUEsRUFDM0U7QUFHQSxpQkFBZSxtQkFBbUI7QUFDOUIsVUFBTSxRQUFRLE1BQU0sWUFBWTtBQUNoQyxRQUFJLENBQUMsTUFBTyxRQUFPO0FBQ25CLFFBQUk7QUFDQSxZQUFNLE1BQU0sTUFBTSxNQUFNLElBQUksRUFBRSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7QUFDdkQsVUFBSSxPQUFPLE1BQU0sZUFBZTtBQUNoQyxVQUFJLENBQUMsTUFBTTtBQUNQLGVBQU8sV0FBVyxPQUFPLGdCQUFnQixJQUFJLFdBQVcsaUJBQWlCLENBQUMsRUFBRSxNQUFNO0FBQ2xGLGNBQU0sTUFBTSxJQUFJLEVBQUUsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBRTNDLGNBQU0sUUFBUSxNQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztBQUN6RCxjQUFNLFlBQVksUUFBUSxlQUFlO0FBQ3pDLFlBQUksY0FBYyxNQUFNO0FBU3BCLGNBQUksT0FBTyxjQUFjLFlBQVksVUFBVSxXQUFXLEVBQUcsUUFBTztBQUNwRSxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKO0FBQ0EsWUFBTSxNQUFNLE1BQU0sY0FBYyxJQUFJO0FBQ3BDLGFBQVEsTUFBTSxjQUFjLEdBQUcsSUFBSyxNQUFNO0FBQUEsSUFDOUMsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQVNBLGlCQUFzQixlQUFlO0FBQ2pDLFFBQUksa0JBQW1CLFFBQU87QUFDOUIseUJBQXFCLFlBQVk7QUFDN0IsWUFBTSxTQUFTLE1BQU0sbUJBQW1CO0FBUXhDLFVBQUksV0FBVyxVQUFVLENBQUUsTUFBTSxlQUFlLEdBQUk7QUFDaEQsY0FBTSxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3JDLFlBQUksUUFBUTtBQUNSLDRCQUFrQjtBQUNsQixnQkFBTSxvQkFBb0IsS0FBSztBQUMvQixpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKO0FBRUEsWUFBTSxVQUFVLE1BQU0saUJBQWlCO0FBQ3ZDLFVBQUksU0FBUztBQUNULDBCQUFrQjtBQUdsQixjQUFNLG9CQUFvQixNQUFNO0FBQ2hDLGVBQU87QUFBQSxNQUNYO0FBSUEsVUFBSSxDQUFDLGlCQUFrQixvQkFBbUIsTUFBTSxrQkFBa0I7QUFDbEUsd0JBQWtCO0FBQ2xCLGFBQU87QUFBQSxJQUNYLEdBQUc7QUFDSCxXQUFPO0FBQUEsRUFDWDtBQTJCQSxpQkFBZSxrQkFBa0I7QUFDN0IsUUFBSSxxQkFBc0IsUUFBTztBQUNqQyw0QkFBd0IsWUFBWTtBQUNoQyxVQUFJLENBQUMsbUJBQW1CLEVBQUcsUUFBTztBQUNsQyxVQUFJO0FBQ0EsY0FBTSxLQUFLLE1BQU0sYUFBYTtBQUM5QixjQUFNLE1BQU0sTUFBTSxHQUFHLElBQUksY0FBYyxhQUFhO0FBQ3BELGVBQVEsTUFBTSxjQUFjLEdBQUcsSUFBSyxNQUFNO0FBQUEsTUFDOUMsUUFBUTtBQUNKLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSixHQUFHO0FBQ0gsV0FBTztBQUFBLEVBQ1g7QUFNQSxpQkFBZSxxQkFBcUI7QUFDaEMsUUFBSSx3QkFBeUIsUUFBTztBQUNwQywrQkFBMkIsWUFBWTtBQUNuQyxZQUFNLFFBQVEsTUFBTSxZQUFZO0FBQ2hDLFVBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsVUFBSTtBQUNBLGNBQU0sTUFBTSxNQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztBQUN2RCxjQUFNLE9BQU8sTUFBTSxlQUFlO0FBQ2xDLFlBQUksQ0FBQyxLQUFNLFFBQU87QUFDbEIsY0FBTSxNQUFNLE1BQU0sY0FBYyxJQUFJO0FBQ3BDLGVBQVEsTUFBTSxjQUFjLEdBQUcsSUFBSyxNQUFNO0FBQUEsTUFDOUMsUUFBUTtBQUNKLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSixHQUFHO0FBQ0gsV0FBTztBQUFBLEVBQ1g7QUFRQSxpQkFBZSxxQkFBcUI7QUFDaEMsVUFBTSxPQUFPLENBQUM7QUFDZCxRQUFJLG9CQUFvQixPQUFPO0FBQzNCLFlBQU0sU0FBUyxNQUFNLGdCQUFnQjtBQUNyQyxVQUFJLE9BQVEsTUFBSyxLQUFLLE1BQU07QUFBQSxJQUNoQztBQUNBLFFBQUksb0JBQW9CLFFBQVE7QUFDNUIsWUFBTSxVQUFVLE1BQU0sbUJBQW1CO0FBQ3pDLFVBQUksUUFBUyxNQUFLLEtBQUssT0FBTztBQUFBLElBQ2xDO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFPQSxpQkFBZSx3QkFBd0IsSUFBSSxZQUFZO0FBQ25ELFVBQU0sTUFBTSxNQUFNLGFBQWE7QUFDL0IsUUFBSTtBQUNBLGFBQU8sRUFBRSxXQUFXLE1BQU0sc0JBQXNCLEtBQUssSUFBSSxVQUFVLEdBQUcsT0FBTyxNQUFNO0FBQUEsSUFDdkYsU0FBUyxHQUFHO0FBQ1IsaUJBQVcsWUFBWSxNQUFNLG1CQUFtQixHQUFHO0FBQy9DLFlBQUk7QUFDQSxpQkFBTztBQUFBLFlBQ0gsV0FBVyxNQUFNLHNCQUFzQixVQUFVLElBQUksVUFBVTtBQUFBLFlBQy9ELE9BQU87QUFBQSxVQUNYO0FBQUEsUUFDSixRQUFRO0FBQUEsUUFBeUI7QUFBQSxNQUNyQztBQUNBLFlBQU07QUFBQSxJQUNWO0FBQUEsRUFDSjtBQUVBLGlCQUFzQixxQkFBcUIsV0FBVztBQUNsRCxVQUFNLE1BQU0sTUFBTSxhQUFhO0FBQy9CLFVBQU0sS0FBSyxPQUFPLGdCQUFnQixJQUFJLFdBQVdDLFNBQVEsQ0FBQztBQUMxRCxVQUFNLE1BQU0sSUFBSSxZQUFZO0FBQzVCLFVBQU0sYUFBYSxNQUFNLE9BQU8sT0FBTztBQUFBLE1BQ25DLEVBQUUsTUFBTSxXQUFXLEdBQUc7QUFBQSxNQUFHO0FBQUEsTUFBSyxJQUFJLE9BQU8sU0FBUztBQUFBLElBQ3REO0FBQ0EsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxJQUFJLFdBQVcsRUFBRTtBQUFBLE1BQ2pCLFlBQVksV0FBVyxVQUFVO0FBQUEsSUFDckMsQ0FBQztBQUFBLEVBQ0w7QUFFQSxpQkFBZSxzQkFBc0IsS0FBSyxJQUFJLFlBQVk7QUFDdEQsVUFBTSxXQUFXLE1BQU0sT0FBTyxPQUFPO0FBQUEsTUFDakMsRUFBRSxNQUFNLFdBQVcsSUFBSSxJQUFJLFdBQVcsV0FBVyxFQUFFLENBQUMsRUFBRTtBQUFBLE1BQ3REO0FBQUEsTUFDQSxXQUFXLFVBQVU7QUFBQSxJQUN6QjtBQUNBLFdBQU8sSUFBSSxZQUFZLEVBQUUsT0FBTyxRQUFRO0FBQUEsRUFDNUM7QUFFQSxpQkFBc0IscUJBQXFCLGVBQWU7QUFDdEQsVUFBTSxFQUFFLElBQUksV0FBVyxJQUFJLEtBQUssTUFBTSxhQUFhO0FBS25ELFVBQU0sRUFBRSxVQUFVLElBQUksTUFBTSx3QkFBd0IsSUFBSSxVQUFVO0FBQ2xFLFdBQU87QUFBQSxFQUNYO0FBbUJPLFdBQVMsZUFBZSxPQUFPO0FBQ2xDLFFBQUksT0FBTyxVQUFVLFNBQVUsUUFBTztBQUN0QyxRQUFJO0FBQ0EsWUFBTSxJQUFJLEtBQUssTUFBTSxLQUFLO0FBQzFCLGFBQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxNQUFNO0FBQUEsSUFDN0QsUUFBUTtBQUFFLGFBQU87QUFBQSxJQUFPO0FBQUEsRUFDNUI7QUFFTyxXQUFTLGdCQUFnQixPQUFPO0FBQ25DLFFBQUksT0FBTyxVQUFVLFNBQVUsUUFBTztBQUN0QyxRQUFJO0FBQ0EsWUFBTSxJQUFJLEtBQUssTUFBTSxLQUFLO0FBQzFCLGFBQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksRUFBRSxNQUFNLEVBQUU7QUFBQSxJQUNqRCxRQUFRO0FBQUUsYUFBTztBQUFBLElBQU87QUFBQSxFQUM1QjtBQUdPLFdBQVMsYUFBYSxPQUFPO0FBQ2hDLFdBQU8sZUFBZSxLQUFLLEtBQUssZ0JBQWdCLEtBQUs7QUFBQSxFQUN6RDtBQWVBLGlCQUFzQixXQUFXLFdBQVc7QUFDeEMsUUFBSSxPQUFPLGNBQWMsWUFBWSxVQUFVLFdBQVcsRUFBRyxRQUFPO0FBQ3BFLFFBQUksYUFBYSxTQUFTLEVBQUcsUUFBTztBQUNwQyxRQUFJLGFBQWE7QUFDYixhQUFPLGVBQWUsV0FBVyxhQUFhLFlBQVk7QUFBQSxJQUM5RDtBQUNBLFdBQU8scUJBQXFCLFNBQVM7QUFBQSxFQUN6QztBQU9BLGlCQUFzQixhQUFhLE9BQU87QUFDdEMsUUFBSSxPQUFPLFVBQVUsWUFBWSxNQUFNLFdBQVcsRUFBRyxRQUFPO0FBQzVELFFBQUksQ0FBQyxhQUFhLEtBQUssRUFBRyxRQUFPO0FBQ2pDLFFBQUksY0FBYyxPQUFPO0FBQ3JCLFlBQU0sSUFBSSxNQUFNLHFEQUFnRDtBQUFBLElBQ3BFO0FBQ0EsUUFBSSxnQkFBZ0IsS0FBSyxHQUFHO0FBQ3hCLGFBQU8scUJBQXFCLEtBQUs7QUFBQSxJQUNyQztBQUVBLFFBQUksQ0FBQyxhQUFhO0FBQ2QsWUFBTSxJQUFJLE1BQU0sb0RBQW9EO0FBQUEsSUFDeEU7QUFDQSxXQUFPLGVBQWUsT0FBTyxXQUFXO0FBQUEsRUFDNUM7OztBRHBqQkEsTUFBTSxhQUFhO0FBQ25CLE1BQU0sV0FBVztBQUNqQixNQUFNLFlBQVk7QUFDbEIsTUFBTSxlQUFlO0FBQ3JCLE1BQU0sZ0JBQWdCO0FBQ3RCLE1BQU0sb0JBQW9CO0FBVzFCLE1BQU0sV0FBVztBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLEVBQ2Q7QUFFQSxNQUFNLFVBQVUsSUFBSSxRQUFRO0FBQzVCLE1BQUksWUFBWTtBQVVoQixXQUFTLFdBQVcsS0FBSyxZQUFZO0FBQ2pDLFVBQU0sU0FBUyxDQUFDO0FBQ2hCLGFBQVMsSUFBSSxHQUFHLElBQUksV0FBVyxRQUFRLEtBQUssV0FBVyxLQUFLO0FBRXhELGFBQU8sS0FBSyxXQUFXLE1BQU0sR0FBRyxJQUFJLFdBQVcsR0FBRyxDQUFDO0FBQUEsSUFDdkQ7QUFDQSxRQUFJLE9BQU8sV0FBVyxHQUFHO0FBRXJCLGFBQU8sQ0FBQyxFQUFFLEtBQUssT0FBTyxXQUFXLENBQUM7QUFBQSxJQUN0QztBQUVBLFVBQU0sVUFBVSxDQUFDO0FBQ2pCLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEtBQUs7QUFDcEMsY0FBUSxLQUFLLEVBQUUsS0FBSyxHQUFHLFlBQVksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUFBLElBQ3hFO0FBRUEsWUFBUSxLQUFLLEVBQUUsS0FBSyxPQUFPLEtBQUssVUFBVSxFQUFFLFdBQVcsTUFBTSxPQUFPLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUN0RixXQUFPO0FBQUEsRUFDWDtBQWlDQSxpQkFBZSxtQkFBbUI7QUFDOUIsVUFBTSxNQUFNLE1BQU0sUUFBUSxJQUFJLElBQUk7QUFDbEMsVUFBTSxVQUFVLENBQUM7QUFNakIsVUFBTSxXQUFXLE9BQUssQ0FBQyxLQUFLLGFBQWEsQ0FBQztBQUcxQyxRQUFJLElBQUksVUFBVTtBQUNkLFlBQU0sZ0JBQWdCLElBQUksU0FBUyxJQUFJLE9BQUs7QUFDeEMsY0FBTSxFQUFFLE9BQU8sR0FBRyxLQUFLLElBQUk7QUFDM0IsWUFBSSxLQUFLLFdBQVcsQ0FBQyxTQUFTLEtBQUssT0FBTyxHQUFHO0FBQ3pDLGtCQUFRLEtBQUssaUVBQTREO0FBQ3pFLGVBQUssVUFBVTtBQUFBLFFBQ25CO0FBQ0EsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUNELFlBQU0sT0FBTyxLQUFLLFVBQVUsYUFBYTtBQUN6QyxjQUFRLEtBQUssRUFBRSxLQUFLLFlBQVksWUFBWSxNQUFNLFVBQVUsU0FBUyxhQUFhLE1BQU0sS0FBSyxPQUFPLENBQUM7QUFBQSxJQUN6RztBQUNBLFFBQUksSUFBSSxnQkFBZ0IsTUFBTTtBQUMxQixZQUFNLE9BQU8sS0FBSyxVQUFVLElBQUksWUFBWTtBQUM1QyxjQUFRLEtBQUssRUFBRSxLQUFLLGdCQUFnQixZQUFZLE1BQU0sVUFBVSxTQUFTLGFBQWEsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLElBQzdHO0FBQ0EsUUFBSSxJQUFJLGVBQWUsTUFBTTtBQUN6QixZQUFNLE9BQU8sS0FBSyxVQUFVLElBQUksV0FBVztBQUMzQyxjQUFRLEtBQUssRUFBRSxLQUFLLGVBQWUsWUFBWSxNQUFNLFVBQVUsU0FBUyxhQUFhLE1BQU0sS0FBSyxPQUFPLENBQUM7QUFBQSxJQUM1RztBQUdBLFVBQU0sZUFBZSxDQUFDLG1CQUFtQixXQUFXLG9CQUFvQixpQkFBaUI7QUFDekYsZUFBVyxLQUFLLGNBQWM7QUFDMUIsVUFBSSxJQUFJLENBQUMsS0FBSyxNQUFNO0FBQ2hCLGNBQU0sT0FBTyxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUM7QUFDbEMsZ0JBQVEsS0FBSyxFQUFFLEtBQUssR0FBRyxZQUFZLE1BQU0sVUFBVSxTQUFTLGFBQWEsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLE1BQ2hHO0FBQUEsSUFDSjtBQUVBLGVBQVcsS0FBSyxPQUFPLEtBQUssR0FBRyxHQUFHO0FBQzlCLFVBQUksRUFBRSxXQUFXLFVBQVUsR0FBRztBQUMxQixjQUFNLE9BQU8sS0FBSyxVQUFVLElBQUksQ0FBQyxDQUFDO0FBQ2xDLGdCQUFRLEtBQUssRUFBRSxLQUFLLEdBQUcsWUFBWSxNQUFNLFVBQVUsU0FBUyxhQUFhLE1BQU0sS0FBSyxPQUFPLENBQUM7QUFBQSxNQUNoRztBQUFBLElBQ0o7QUFHQSxRQUFJLElBQUksZUFBZSxJQUFJLFlBQVksTUFBTTtBQUN6QyxZQUFNLFdBQVcsQ0FBQztBQUNsQixpQkFBVyxDQUFDLElBQUksR0FBRyxLQUFLLE9BQU8sUUFBUSxJQUFJLFlBQVksSUFBSSxHQUFHO0FBQzFELFlBQUksU0FBUyxJQUFJLE1BQU0sR0FBRztBQUN0QixtQkFBUyxFQUFFLElBQUk7QUFBQSxRQUNuQixPQUFPO0FBQ0gsa0JBQVEsS0FBSyxvRUFBK0Q7QUFBQSxRQUNoRjtBQUFBLE1BQ0o7QUFDQSxZQUFNLFlBQVksRUFBRSxHQUFHLElBQUksYUFBYSxNQUFNLFNBQVM7QUFDdkQsWUFBTSxPQUFPLEtBQUssVUFBVSxTQUFTO0FBQ3JDLGNBQVEsS0FBSyxFQUFFLEtBQUssZUFBZSxZQUFZLE1BQU0sVUFBVSxTQUFTLFlBQVksTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLElBQzNHO0FBR0EsUUFBSSxJQUFJLGFBQWEsT0FBTyxJQUFJLGNBQWMsVUFBVTtBQUNwRCxZQUFNLE9BQU8sT0FBTyxPQUFPLElBQUksU0FBUyxFQUFFLEtBQUssQ0FBQyxHQUFHLE9BQU8sRUFBRSxhQUFhLE1BQU0sRUFBRSxhQUFhLEVBQUU7QUFDaEcsaUJBQVcsT0FBTyxNQUFNO0FBQ3BCLFlBQUksQ0FBQyxTQUFTLElBQUksT0FBTyxHQUFHO0FBQ3hCLGtCQUFRLEtBQUssdUVBQWtFO0FBQy9FO0FBQUEsUUFDSjtBQUNBLGNBQU0sU0FBUyxZQUFZLElBQUksSUFBSTtBQUNuQyxjQUFNLE9BQU8sS0FBSyxVQUFVLEdBQUc7QUFDL0IsZ0JBQVEsS0FBSyxFQUFFLEtBQUssUUFBUSxZQUFZLE1BQU0sVUFBVSxTQUFTLFVBQVUsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLE1BQ2xHO0FBQUEsSUFDSjtBQUVBLFdBQU87QUFBQSxFQUNYO0FBTUEsaUJBQWUsYUFBYTtBQUN4QixRQUFJLENBQUMsSUFBSSxRQUFRLEtBQU07QUFFdkIsVUFBTSxVQUFVLE1BQU0sY0FBYztBQUNwQyxRQUFJLENBQUMsUUFBUztBQUVkLFFBQUk7QUFDQSxZQUFNLFVBQVUsTUFBTSxpQkFBaUI7QUFHdkMsY0FBUSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFHOUMsVUFBSSxZQUFZO0FBQ2hCLFVBQUksWUFBWTtBQUNoQixZQUFNLGNBQWMsQ0FBQztBQUNyQixZQUFNLGNBQWMsQ0FBQztBQUNyQixVQUFJLGtCQUFrQjtBQUV0QixpQkFBVyxTQUFTLFNBQVM7QUFDekIsWUFBSSxnQkFBaUI7QUFFckIsY0FBTSxTQUFTLFdBQVcsTUFBTSxLQUFLLE1BQU0sVUFBVTtBQUNyRCxZQUFJLFlBQVk7QUFDaEIsbUJBQVcsS0FBSyxRQUFRO0FBQ3BCLHVCQUFhLEVBQUUsSUFBSSxVQUFVLE9BQU8sRUFBRSxVQUFVLFdBQVcsRUFBRSxNQUFNLFNBQVMsS0FBSyxVQUFVLEVBQUUsS0FBSyxFQUFFO0FBQUEsUUFDeEc7QUFFQSxZQUFJLFlBQVksWUFBWSxhQUFhLE9BQU8sWUFBWSxPQUFPLFNBQVMsWUFBWSxHQUFHO0FBQ3ZGLGNBQUksTUFBTSxZQUFZLFNBQVMsWUFBWTtBQUFBLFVBRTNDLE9BQU87QUFDSCxvQkFBUSxLQUFLLDhDQUE4QyxNQUFNLFFBQVEsOEJBQThCO0FBQ3ZHLDhCQUFrQjtBQUNsQjtBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBRUEsbUJBQVcsS0FBSyxRQUFRO0FBQ3BCLHNCQUFZLEVBQUUsR0FBRyxJQUFJLEVBQUU7QUFDdkIsc0JBQVksS0FBSyxFQUFFLEdBQUc7QUFBQSxRQUMxQjtBQUNBLHFCQUFhO0FBQ2IscUJBQWEsT0FBTztBQUFBLE1BQ3hCO0FBR0EsWUFBTSxPQUFPO0FBQUEsUUFDVCxlQUFlLEtBQUssSUFBSTtBQUFBLFFBQ3hCLE1BQU07QUFBQSxNQUNWO0FBQ0Esa0JBQVksYUFBYSxJQUFJLEtBQUssVUFBVSxJQUFJO0FBR2hELFlBQU0sSUFBSSxRQUFRLEtBQUssSUFBSSxXQUFXO0FBR3RDLFVBQUk7QUFDQSxjQUFNLFdBQVcsTUFBTSxJQUFJLFFBQVEsS0FBSyxJQUFJLElBQUk7QUFDaEQsY0FBTSxhQUFhLE9BQU8sS0FBSyxRQUFRLEVBQUU7QUFBQSxVQUFPLE9BQzVDLE1BQU0saUJBQWlCLENBQUMsWUFBWSxTQUFTLENBQUM7QUFBQSxRQUNsRDtBQUNBLFlBQUksV0FBVyxTQUFTLEdBQUc7QUFDdkIsZ0JBQU0sSUFBSSxRQUFRLEtBQUssT0FBTyxVQUFVO0FBQUEsUUFDNUM7QUFBQSxNQUNKLFFBQVE7QUFBQSxNQUVSO0FBRUEsY0FBUSxJQUFJLHdCQUF3QixZQUFZLE1BQU0sYUFBYSxTQUFTLHlCQUF5QjtBQUFBLElBQ3pHLFNBQVMsR0FBRztBQUNSLGNBQVEsTUFBTSxtQ0FBbUMsQ0FBQztBQUFBLElBRXREO0FBQUEsRUFDSjtBQXdMTyxXQUFTLG1CQUFtQjtBQUMvQixRQUFJLENBQUMsSUFBSSxRQUFRLEtBQU07QUFDdkIsUUFBSSxVQUFXLGNBQWEsU0FBUztBQUNyQyxnQkFBWSxXQUFXLE1BQU07QUFDekIsa0JBQVk7QUFDWixpQkFBVztBQUFBLElBQ2YsR0FBRyxHQUFJO0FBQUEsRUFDWDtBQU1BLGlCQUFzQixnQkFBZ0I7QUFDbEMsVUFBTSxPQUFPLE1BQU0sUUFBUSxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7QUFDNUQsV0FBTyxLQUFLLGlCQUFpQjtBQUFBLEVBQ2pDOzs7QUR2YkEsTUFBTUMsV0FBVSxJQUFJLFFBQVE7QUFDNUIsTUFBTSxjQUFjO0FBZXBCLGlCQUFlLFdBQVcsS0FBSztBQUMzQixRQUFJLENBQUMsSUFBSyxRQUFPO0FBQ2pCLFFBQUk7QUFDQSxhQUFPLEVBQUUsR0FBRyxLQUFLLFFBQVEsTUFBTSxhQUFhLElBQUksTUFBTSxFQUFFO0FBQUEsSUFDNUQsU0FBUyxHQUFHO0FBQ1IsVUFBSSxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsV0FBVyxRQUFRLEVBQUcsT0FBTTtBQUN4RCxhQUFPLEVBQUUsR0FBRyxLQUFLLFFBQVEsTUFBTSxlQUFlLEtBQUs7QUFBQSxJQUN2RDtBQUFBLEVBQ0o7QUFFQSxNQUFNLGdCQUFnQjtBQUFBLElBQ2xCLE1BQU0sQ0FBQztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsZ0JBQWdCO0FBQUEsSUFDaEIsWUFBWTtBQUFBLEVBQ2hCO0FBRUEsaUJBQWUsV0FBVztBQUN0QixVQUFNLE9BQU8sTUFBTUEsU0FBUSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBQy9ELFdBQU8sRUFBRSxHQUFHLGVBQWUsR0FBRyxLQUFLLFdBQVcsRUFBRTtBQUFBLEVBQ3BEO0FBRUEsaUJBQWUsU0FBUyxPQUFPO0FBQzNCLFVBQU1BLFNBQVEsSUFBSSxFQUFFLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUMxQyxxQkFBaUI7QUFBQSxFQUNyQjtBQUtBLGlCQUFzQixpQkFBaUI7QUFDbkMsVUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixVQUFNLE9BQU8sQ0FBQztBQUNkLGVBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxPQUFPLFFBQVEsTUFBTSxJQUFJLEdBQUc7QUFDaEQsV0FBSyxFQUFFLElBQUksTUFBTSxXQUFXLEdBQUc7QUFBQSxJQUNuQztBQUNBLFdBQU8sRUFBRSxHQUFHLE9BQU8sS0FBSztBQUFBLEVBQzVCO0FBa0JBLGlCQUFzQixXQUFXLElBQUksT0FBTyxRQUFRO0FBQ2hELFVBQU0sUUFBUSxNQUFNLFNBQVM7QUFDN0IsVUFBTSxNQUFNLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxHQUFJO0FBQ3hDLFVBQU0sV0FBVyxNQUFNLEtBQUssRUFBRTtBQUU5QixVQUFNLEtBQUssRUFBRSxJQUFJO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFFBQVEsTUFBTSxXQUFXLE1BQU07QUFBQSxNQUMvQixXQUFXLFVBQVUsYUFBYTtBQUFBLE1BQ2xDLFdBQVc7QUFBQSxNQUNYLGNBQWMsVUFBVSxnQkFBZ0I7QUFBQSxJQUM1QztBQUNBLFVBQU0sU0FBUyxLQUFLO0FBQ3BCLFdBQU8sV0FBVyxNQUFNLEtBQUssRUFBRSxDQUFDO0FBQUEsRUFDcEM7QUFLQSxpQkFBc0IsYUFBYSxJQUFJO0FBQ25DLFVBQU0sUUFBUSxNQUFNLFNBQVM7QUFDN0IsV0FBTyxNQUFNLEtBQUssRUFBRTtBQUNwQixVQUFNLFNBQVMsS0FBSztBQUFBLEVBQ3hCO0FBTUEsaUJBQXNCLGNBQWM7QUFDaEMsVUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixVQUFNLFlBQVksQ0FBQztBQUNuQixlQUFXLE9BQU8sT0FBTyxPQUFPLE1BQU0sSUFBSSxHQUFHO0FBQ3pDLGdCQUFVLEtBQUssTUFBTSxXQUFXLEdBQUcsQ0FBQztBQUFBLElBQ3hDO0FBQ0EsV0FBTyxVQUFVO0FBQUEsTUFBSyxDQUFDLEdBQUcsTUFDdEIsRUFBRSxNQUFNLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFBQSxJQUM3RDtBQUFBLEVBQ0o7QUFLQSxpQkFBc0IsZUFBZSxTQUFTO0FBQzFDLFVBQU0sUUFBUSxNQUFNLFNBQVM7QUFDN0IsVUFBTSxjQUFjO0FBQ3BCLFVBQU0sU0FBUyxLQUFLO0FBQUEsRUFDeEI7QUFLQSxpQkFBc0JDLGlCQUFnQjtBQUNsQyxVQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLFdBQU8sTUFBTTtBQUFBLEVBQ2pCO0FBS0EsaUJBQXNCLHFCQUFxQixZQUFZLFVBQVUsTUFBTSxpQkFBaUIsTUFBTTtBQUMxRixVQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLFVBQU0sYUFBYTtBQUNuQixRQUFJLFlBQVksS0FBTSxPQUFNLFVBQVU7QUFDdEMsUUFBSSxtQkFBbUIsS0FBTSxPQUFNLGlCQUFpQjtBQUNwRCxVQUFNLFNBQVMsS0FBSztBQUFBLEVBQ3hCO0FBaUJBLGlCQUFzQixjQUFjO0FBQ2hDLFVBQU0sUUFBUSxNQUFNLFNBQVM7QUFDN0IsVUFBTSxPQUFPLENBQUM7QUFDZCxVQUFNLGdCQUFnQixDQUFDO0FBQ3ZCLGVBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxPQUFPLFFBQVEsTUFBTSxJQUFJLEdBQUc7QUFDaEQsWUFBTSxZQUFZLE1BQU0sV0FBVyxHQUFHO0FBQ3RDLFVBQUksV0FBVyxlQUFlO0FBQzFCLGFBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJO0FBQ3BCLHNCQUFjLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDbEM7QUFBQSxNQUNKO0FBQ0EsV0FBSyxFQUFFLElBQUk7QUFBQSxJQUNmO0FBQ0EsV0FBTyxFQUFFLE1BQU0sY0FBYztBQUFBLEVBQ2pDO0FBU0EsaUJBQXNCLFlBQVksTUFBTTtBQUNwQyxVQUFNLFFBQVEsTUFBTSxTQUFTO0FBQzdCLGVBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxPQUFPLFFBQVEsSUFBSSxHQUFHO0FBQzFDLFlBQU0sU0FBUyxhQUFhLElBQUksTUFBTSxJQUFJLElBQUksU0FBUyxNQUFNLFdBQVcsSUFBSSxNQUFNO0FBQ2xGLFlBQU0sS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEtBQUssT0FBTztBQUFBLElBQ3RDO0FBQ0EsVUFBTSxTQUFTLEtBQUs7QUFBQSxFQUN4Qjs7O0FGak1BLE1BQU0sUUFBUTtBQUFBLElBQ1YsTUFBTSxDQUFDO0FBQUEsSUFDUCxVQUFVO0FBQUEsSUFDVixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixVQUFVO0FBQUEsSUFDVixZQUFZO0FBQUEsSUFDWixhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsSUFDUCxXQUFXLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUU7QUFBQSxFQUNyQztBQUVBLFdBQVMsRUFBRSxJQUFJO0FBQUUsV0FBTyxTQUFTLGVBQWUsRUFBRTtBQUFBLEVBQUc7QUFFckQsV0FBUyxZQUFZO0FBQ2pCLFdBQU8sTUFBTSxVQUFVLEtBQUssU0FBUyxLQUFLLE1BQU0sVUFBVSxNQUFNLFNBQVM7QUFBQSxFQUM3RTtBQUVBLFdBQVMsYUFBYTtBQUNsQixXQUFPLENBQUMsR0FBRyxNQUFNLElBQUksRUFBRTtBQUFBLE1BQUssQ0FBQyxHQUFHLE1BQzVCLEVBQUUsTUFBTSxZQUFZLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQUEsSUFDN0Q7QUFBQSxFQUNKO0FBRUEsV0FBUyxXQUFXLFFBQVE7QUFDeEIsUUFBSSxDQUFDLE9BQVEsUUFBTztBQUNwQixRQUFJLE9BQU8sVUFBVSxFQUFHLFFBQU8sU0FBUyxPQUFPLE9BQU8sTUFBTTtBQUM1RCxXQUFPLE9BQU8sTUFBTSxHQUFHLENBQUMsSUFBSSxTQUFTLE9BQU8sQ0FBQyxJQUFJLE9BQU8sTUFBTSxFQUFFO0FBQUEsRUFDcEU7QUFFQSxXQUFTLFVBQVUsS0FBSztBQUNwQixVQUFNLFFBQVE7QUFDZCxXQUFPO0FBQ1AsZUFBVyxNQUFNO0FBQUUsWUFBTSxRQUFRO0FBQUksYUFBTztBQUFBLElBQUcsR0FBRyxHQUFJO0FBQUEsRUFDMUQ7QUFFQSxXQUFTLGdCQUFnQixRQUFRO0FBQzdCLFFBQUksV0FBVyxPQUFRLFFBQU8sTUFBTSxjQUFjLGVBQWU7QUFDakUsUUFBSSxXQUFXLFVBQVcsUUFBTztBQUNqQyxXQUFPO0FBQUEsRUFDWDtBQUVBLFdBQVMsaUJBQWlCO0FBQ3RCLFFBQUksTUFBTSxxQkFBcUIsVUFBVyxRQUFPO0FBQ2pELFFBQUksTUFBTSxxQkFBcUIsUUFBUyxRQUFPLE1BQU07QUFDckQsV0FBTyxNQUFNLGNBQWMsV0FBVztBQUFBLEVBQzFDO0FBSUEsV0FBUyxTQUFTO0FBRWQsVUFBTSxVQUFVLEVBQUUsVUFBVTtBQUM1QixVQUFNLFdBQVcsRUFBRSxXQUFXO0FBQzlCLFVBQU0sVUFBVSxFQUFFLFVBQVU7QUFDNUIsVUFBTSxhQUFhLEVBQUUsYUFBYTtBQUNsQyxVQUFNLFdBQVcsRUFBRSxXQUFXO0FBRTlCLFFBQUksUUFBUyxTQUFRLFlBQVksT0FBTyxnQkFBZ0IsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvRSxRQUFJLFNBQVUsVUFBUyxjQUFjLGVBQWU7QUFDcEQsUUFBSSxRQUFTLFNBQVEsV0FBVyxNQUFNLHFCQUFxQixhQUFhLENBQUMsVUFBVSxLQUFLLENBQUMsTUFBTTtBQUMvRixRQUFJLFdBQVksWUFBVyxhQUFhLGdCQUFnQixPQUFPLE1BQU0sV0FBVyxDQUFDO0FBQ2pGLFFBQUksU0FBVSxVQUFTLGNBQWMsTUFBTSxLQUFLLFNBQVMsVUFBVSxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU07QUFHbkcsVUFBTSxvQkFBb0IsRUFBRSxxQkFBcUI7QUFDakQsVUFBTSxZQUFZLEVBQUUsU0FBUztBQUM3QixVQUFNLGVBQWUsRUFBRSxnQkFBZ0I7QUFFdkMsUUFBSSxrQkFBbUIsbUJBQWtCLE1BQU0sVUFBVSxNQUFNLEtBQUssU0FBUyxJQUFJLFVBQVU7QUFDM0YsUUFBSSxVQUFXLFdBQVUsTUFBTSxVQUFVLE1BQU0sS0FBSyxXQUFXLElBQUksVUFBVTtBQUU3RSxRQUFJLGNBQWM7QUFDZCxZQUFNLFNBQVMsV0FBVztBQUMxQixtQkFBYSxZQUFZLE9BQU8sSUFBSSxTQUFPO0FBQ3ZDLFlBQUksTUFBTSxjQUFjLElBQUksSUFBSTtBQUM1QixpQkFBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtREFTNEIsSUFBSSxFQUFFO0FBQUEseUNBQ2hCLFdBQVcsTUFBTSxTQUFTLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG9EQVFoQixJQUFJLEVBQUU7QUFBQSx5Q0FDakIsV0FBVyxNQUFNLFVBQVUsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQVN6RDtBQUNBLGNBQU0sV0FBVyxNQUFNLGVBQWUsSUFBSTtBQUcxQyxjQUFNLGdCQUFnQixJQUFJLGdCQUNwQiw4QkFDQyxXQUFXLFdBQVcsSUFBSSxNQUFNLElBQUksV0FBVyxXQUFXLElBQUksTUFBTSxDQUFDO0FBQzVFLGNBQU0sWUFBWSxNQUFNLGFBQWEsSUFBSSxLQUFLLFlBQVk7QUFDMUQsZUFBTztBQUFBLG9DQUNpQixXQUFXLGFBQWEsRUFBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQ0FNbkIsSUFBSSxFQUFFO0FBQUEsNENBQ0wsUUFBUTtBQUFBLHFDQUNmLFdBQVcsZ0JBQWdCLGVBQWU7QUFBQSwwQ0FDckMsV0FBVyxTQUFTLFFBQVEsZUFBZSxXQUFXLElBQUksS0FBSyxDQUFDO0FBQUE7QUFBQTtBQUFBLHVJQUc2QixJQUFJLEVBQUUsc0JBQXNCLFdBQVcsSUFBSSxLQUFLLENBQUM7QUFBQSx3REFDaEksV0FBVyxLQUFLLFlBQVkseUVBQXlFLElBQUksRUFBRSxLQUFLLGFBQWE7QUFBQTtBQUFBO0FBQUEsK0dBR3RFLElBQUksRUFBRSxLQUFLLFNBQVM7QUFBQSwrSEFDSixJQUFJLEVBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSzdILENBQUMsRUFBRSxLQUFLLEVBQUU7QUFHVixtQkFBYSxpQkFBaUIsNEJBQTRCLEVBQUUsUUFBUSxRQUFNO0FBQ3RFLFdBQUcsaUJBQWlCLFNBQVMsTUFBTSxVQUFVLEdBQUcsUUFBUSxLQUFLLENBQUM7QUFBQSxNQUNsRSxDQUFDO0FBQ0QsbUJBQWEsaUJBQWlCLCtCQUErQixFQUFFLFFBQVEsUUFBTTtBQUN6RSxXQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDL0IsZ0JBQU0sYUFBYSxNQUFNLGVBQWUsR0FBRyxRQUFRLFFBQVEsT0FBTyxHQUFHLFFBQVE7QUFDN0UsaUJBQU87QUFBQSxRQUNYLENBQUM7QUFBQSxNQUNMLENBQUM7QUFDRCxtQkFBYSxpQkFBaUIsNkJBQTZCLEVBQUUsUUFBUSxRQUFNO0FBQ3ZFLFdBQUcsaUJBQWlCLFNBQVMsTUFBTSxXQUFXLEdBQUcsUUFBUSxLQUFLLENBQUM7QUFBQSxNQUNuRSxDQUFDO0FBQ0QsbUJBQWEsaUJBQWlCLDRCQUE0QixFQUFFLFFBQVEsUUFBTTtBQUN0RSxXQUFHLGlCQUFpQixTQUFTLE1BQU0sVUFBVSxHQUFHLFFBQVEsS0FBSyxDQUFDO0FBQUEsTUFDbEUsQ0FBQztBQUNELG1CQUFhLGlCQUFpQiwyQkFBMkIsRUFBRSxRQUFRLFFBQU07QUFDckUsV0FBRyxpQkFBaUIsU0FBUyxRQUFRO0FBQUEsTUFDekMsQ0FBQztBQUNELG1CQUFhLGlCQUFpQiw2QkFBNkIsRUFBRSxRQUFRLFFBQU07QUFDdkUsV0FBRyxpQkFBaUIsU0FBUyxVQUFVO0FBQUEsTUFDM0MsQ0FBQztBQUdELG1CQUFhLGlCQUFpQixtQkFBbUIsRUFBRSxRQUFRLFFBQU07QUFDN0QsV0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFBRSxnQkFBTSxZQUFZLEVBQUUsT0FBTztBQUFBLFFBQU8sQ0FBQztBQUN6RSxXQUFHLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNoQyxjQUFJLEVBQUUsUUFBUSxRQUFTLFVBQVM7QUFDaEMsY0FBSSxFQUFFLFFBQVEsU0FBVSxZQUFXO0FBQUEsUUFDdkMsQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUNELG1CQUFhLGlCQUFpQixvQkFBb0IsRUFBRSxRQUFRLFFBQU07QUFDOUQsV0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFBRSxnQkFBTSxhQUFhLEVBQUUsT0FBTztBQUFBLFFBQU8sQ0FBQztBQUMxRSxXQUFHLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNoQyxjQUFJLEVBQUUsUUFBUSxRQUFTLFVBQVM7QUFDaEMsY0FBSSxFQUFFLFFBQVEsU0FBVSxZQUFXO0FBQUEsUUFDdkMsQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFHQSxVQUFNLGdCQUFnQixFQUFFLFdBQVc7QUFDbkMsVUFBTSxpQkFBaUIsRUFBRSxZQUFZO0FBQ3JDLFVBQU0sWUFBWSxFQUFFLGFBQWE7QUFFakMsUUFBSSxpQkFBaUIsU0FBUyxrQkFBa0IsY0FBZSxlQUFjLFFBQVEsTUFBTTtBQUMzRixRQUFJLGtCQUFrQixTQUFTLGtCQUFrQixlQUFnQixnQkFBZSxRQUFRLE1BQU07QUFDOUYsUUFBSSxXQUFXO0FBQ1gsZ0JBQVUsV0FBVyxNQUFNLFVBQVUsTUFBTSxTQUFTLEtBQUssRUFBRSxXQUFXLEtBQUssTUFBTSxVQUFVLEtBQUssRUFBRSxXQUFXO0FBQzdHLGdCQUFVLGNBQWMsTUFBTSxTQUFTLGNBQWM7QUFBQSxJQUN6RDtBQUdBLFVBQU0sUUFBUSxFQUFFLE9BQU87QUFDdkIsUUFBSSxPQUFPO0FBQ1AsWUFBTSxjQUFjLE1BQU07QUFDMUIsWUFBTSxNQUFNLFVBQVUsTUFBTSxRQUFRLFVBQVU7QUFBQSxJQUNsRDtBQUFBLEVBQ0o7QUFFQSxXQUFTLFdBQVcsS0FBSztBQUNyQixVQUFNLE1BQU0sU0FBUyxjQUFjLEtBQUs7QUFDeEMsUUFBSSxjQUFjO0FBQ2xCLFdBQU8sSUFBSTtBQUFBLEVBQ2Y7QUFFQSxXQUFTLFdBQVcsS0FBSztBQUNyQixXQUFPLElBQUksUUFBUSxNQUFNLE9BQU8sRUFBRSxRQUFRLE1BQU0sUUFBUSxFQUFFLFFBQVEsTUFBTSxNQUFNLEVBQUUsUUFBUSxNQUFNLE1BQU07QUFBQSxFQUN4RztBQUlBLGlCQUFlLFNBQVM7QUFDcEIsVUFBTSxRQUFRLE1BQU0sU0FBUyxLQUFLO0FBQ2xDLFVBQU0sU0FBUyxNQUFNLFVBQVUsS0FBSztBQUNwQyxRQUFJLENBQUMsU0FBUyxDQUFDLE9BQVE7QUFFdkIsVUFBTSxTQUFTO0FBQ2YsV0FBTztBQUVQLFVBQU0sS0FBSyxPQUFPLFdBQVc7QUFDN0IsVUFBTSxXQUFXLElBQUksT0FBTyxNQUFNO0FBQ2xDLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFDL0IsVUFBTSxXQUFXO0FBQ2pCLFVBQU0sWUFBWTtBQUVsQixRQUFJLE1BQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsWUFBTSxlQUFlO0FBQUEsSUFDekI7QUFFQSxVQUFNLFNBQVM7QUFDZixjQUFVLFdBQVc7QUFBQSxFQUN6QjtBQUVBLFdBQVMsVUFBVSxJQUFJO0FBQ25CLFVBQU0sTUFBTSxNQUFNLEtBQUssS0FBSyxPQUFLLEVBQUUsT0FBTyxFQUFFO0FBQzVDLFFBQUksQ0FBQyxJQUFLO0FBQ1YsUUFBSSxJQUFJLGVBQWU7QUFHbkIsZ0JBQVUsNkVBQXdFO0FBQ2xGO0FBQUEsSUFDSjtBQUNBLFVBQU0sWUFBWSxJQUFJO0FBQ3RCLFVBQU0sWUFBWSxJQUFJO0FBQ3RCLFVBQU0sYUFBYSxJQUFJO0FBQ3ZCLFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQWUsV0FBVztBQUN0QixRQUFJLENBQUMsTUFBTSxVQUFXO0FBQ3RCLFVBQU0sUUFBUSxNQUFNLFVBQVUsS0FBSztBQUNuQyxVQUFNLFNBQVMsTUFBTSxXQUFXLEtBQUs7QUFDckMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFRO0FBRXZCLFVBQU0sV0FBVyxNQUFNLFdBQVcsT0FBTyxNQUFNO0FBQy9DLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFDL0IsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sWUFBWTtBQUNsQixVQUFNLGFBQWE7QUFFbkIsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sZUFBZTtBQUFBLElBQ3pCO0FBRUEsY0FBVSxhQUFhO0FBQUEsRUFDM0I7QUFFQSxXQUFTLGFBQWE7QUFDbEIsVUFBTSxZQUFZO0FBQ2xCLFVBQU0sWUFBWTtBQUNsQixVQUFNLGFBQWE7QUFDbkIsV0FBTztBQUFBLEVBQ1g7QUFFQSxpQkFBZSxVQUFVLElBQUk7QUFDekIsVUFBTSxNQUFNLE1BQU0sS0FBSyxLQUFLLE9BQUssRUFBRSxPQUFPLEVBQUU7QUFDNUMsUUFBSSxDQUFDLElBQUs7QUFDVixRQUFJLENBQUUsTUFBTSxXQUFXLEVBQUUsT0FBTyxXQUFXLElBQUksS0FBSyxNQUFNLE1BQU0sMkRBQTJELGNBQWMsY0FBYyxhQUFhLEtBQUssQ0FBQyxFQUFJO0FBRTlLLFVBQU0sYUFBYSxFQUFFO0FBQ3JCLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFFL0IsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sZUFBZTtBQUFBLElBQ3pCO0FBRUEsY0FBVSxhQUFhO0FBQUEsRUFDM0I7QUFJQSxpQkFBZSxXQUFXLElBQUk7QUFDMUIsVUFBTSxNQUFNLE1BQU0sS0FBSyxLQUFLLE9BQUssRUFBRSxPQUFPLEVBQUU7QUFDNUMsUUFBSSxDQUFDLElBQUs7QUFDVixRQUFJLElBQUksZUFBZTtBQUNuQixnQkFBVSxnREFBZ0Q7QUFDMUQ7QUFBQSxJQUNKO0FBQ0EsVUFBTSxVQUFVLFVBQVUsVUFBVSxJQUFJLE1BQU07QUFDOUMsVUFBTSxXQUFXO0FBQ2pCLFdBQU87QUFDUCxlQUFXLE1BQU07QUFBRSxZQUFNLFdBQVc7QUFBTSxhQUFPO0FBQUEsSUFBRyxHQUFHLEdBQUk7QUFDM0QsZUFBVyxNQUFNO0FBQ2IsZ0JBQVUsVUFBVSxVQUFVLEVBQUUsRUFBRSxNQUFNLE1BQU07QUFBQSxNQUFDLENBQUM7QUFBQSxJQUNwRCxHQUFHLEdBQUs7QUFBQSxFQUNaO0FBSUEsaUJBQWUsaUJBQWlCO0FBQzVCLFFBQUk7QUFDQSxZQUFNLFFBQVEsTUFBTSxlQUFlO0FBQ25DLFlBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsUUFDekMsTUFBTTtBQUFBLFFBQ04sU0FBUyxFQUFFLE1BQU0sTUFBTSxLQUFLO0FBQUEsTUFDaEMsQ0FBQztBQUNELFVBQUksT0FBTyxTQUFTO0FBQ2hCLGNBQU0scUJBQXFCLFVBQVUsT0FBTyxTQUFTLE9BQU8sU0FBUztBQUFBLE1BQ3pFO0FBQ0EsYUFBTztBQUFBLElBQ1gsU0FBUyxHQUFHO0FBQ1IsWUFBTSxxQkFBcUIsWUFBWTtBQUN2QyxhQUFPLEVBQUUsU0FBUyxPQUFPLE9BQU8sRUFBRSxRQUFRO0FBQUEsSUFDOUM7QUFBQSxFQUNKO0FBRUEsaUJBQWUsVUFBVTtBQUNyQixVQUFNLG1CQUFtQjtBQUN6QixVQUFNLFlBQVk7QUFDbEIsV0FBTztBQUVQLFFBQUk7QUFDQSxZQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFdEUsVUFBSSxDQUFDLE9BQU8sU0FBUztBQUNqQixjQUFNLG1CQUFtQjtBQUN6QixjQUFNLFlBQVksT0FBTyxTQUFTO0FBQ2xDLGVBQU87QUFDUDtBQUFBLE1BQ0o7QUFFQSxVQUFJLE9BQU8sTUFBTTtBQUNiLGNBQU0sUUFBUSxNQUFNLGVBQWU7QUFDbkMsY0FBTSxZQUFZLE1BQU07QUFDeEIsY0FBTSxhQUFhLE9BQU8sS0FBSyxTQUFTLEVBQUU7QUFFMUMsWUFBSSxlQUFlLEdBQUc7QUFDbEIsZ0JBQU0sWUFBWSxPQUFPLElBQUk7QUFBQSxRQUNqQyxXQUFXLENBQUMsTUFBTSxrQkFBa0IsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCO0FBQ3pFLGdCQUFNLFlBQVksT0FBTyxJQUFJO0FBQUEsUUFDakM7QUFFQSxjQUFNLHFCQUFxQixVQUFVLE9BQU8sU0FBUyxPQUFPLFNBQVM7QUFDckUsY0FBTSxPQUFPLE1BQU0sWUFBWTtBQUFBLE1BQ25DO0FBRUEsWUFBTSxtQkFBbUI7QUFBQSxJQUM3QixTQUFTLEdBQUc7QUFDUixZQUFNLG1CQUFtQjtBQUN6QixZQUFNLFlBQVksRUFBRSxXQUFXO0FBQUEsSUFDbkM7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFlLGFBQWE7QUFDeEIsVUFBTSxlQUFlLE1BQU0sV0FBVztBQUN0QyxRQUFJLE1BQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsWUFBTSxRQUFRO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBSUEsaUJBQWUsYUFBYTtBQUN4QixVQUFNLEVBQUUsTUFBTSxjQUFjLElBQUksTUFBTSxZQUFZO0FBQ2xELFVBQU0sWUFBWSxLQUFLLFVBQVUsTUFBTSxNQUFNLENBQUM7QUFFOUMsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVk7QUFBQSxNQUN6QyxNQUFNO0FBQUEsTUFDTixTQUFTLEVBQUUsVUFBVTtBQUFBLElBQ3pCLENBQUM7QUFFRCxRQUFJLENBQUMsT0FBTyxTQUFTO0FBQ2pCLGdCQUFVLHFCQUFxQixPQUFPLFNBQVMsVUFBVTtBQUN6RDtBQUFBLElBQ0o7QUFFQSxVQUFNLE9BQU8sSUFBSTtBQUFBLE1BQ2IsQ0FBQyxLQUFLLFVBQVUsRUFBRSxXQUFXLE1BQU0sTUFBTSxPQUFPLFdBQVcsQ0FBQyxDQUFDO0FBQUEsTUFDN0QsRUFBRSxNQUFNLG1CQUFtQjtBQUFBLElBQy9CO0FBQ0EsVUFBTSxNQUFNLElBQUksZ0JBQWdCLElBQUk7QUFDcEMsVUFBTSxJQUFJLFNBQVMsY0FBYyxHQUFHO0FBQ3BDLE1BQUUsT0FBTztBQUNULE1BQUUsV0FBVztBQUNiLE1BQUUsTUFBTTtBQUNSLFFBQUksZ0JBQWdCLEdBQUc7QUFDdkIsY0FBVSxjQUFjLFNBQ2xCLG1CQUFjLGNBQWMsTUFBTSwyRUFBMkUsY0FBYyxLQUFLLElBQUksQ0FBQyxLQUNySSxVQUFVO0FBQUEsRUFDcEI7QUFFQSxpQkFBZSxXQUFXLE9BQU87QUFDN0IsVUFBTSxPQUFPLE1BQU0sT0FBTyxRQUFRLENBQUM7QUFDbkMsUUFBSSxDQUFDLEtBQU07QUFFWCxRQUFJO0FBQ0EsWUFBTSxPQUFPLE1BQU0sS0FBSyxLQUFLO0FBQzdCLFlBQU0sU0FBUyxLQUFLLE1BQU0sSUFBSTtBQUU5QixVQUFJO0FBQ0osVUFBSSxPQUFPLGFBQWEsT0FBTyxNQUFNO0FBQ2pDLGNBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsVUFDekMsTUFBTTtBQUFBLFVBQ04sU0FBUyxFQUFFLFlBQVksT0FBTyxLQUFLO0FBQUEsUUFDdkMsQ0FBQztBQUNELFlBQUksQ0FBQyxPQUFPLFNBQVM7QUFDakIsb0JBQVUsc0JBQXNCLE9BQU8sU0FBUyxVQUFVO0FBQzFEO0FBQUEsUUFDSjtBQUNBLGVBQU8sS0FBSyxNQUFNLE9BQU8sU0FBUztBQUFBLE1BQ3RDLE9BQU87QUFDSCxlQUFPO0FBQUEsTUFDWDtBQUVBLFlBQU0sWUFBWSxJQUFJO0FBQ3RCLFlBQU0sT0FBTyxNQUFNLFlBQVk7QUFFL0IsVUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLGNBQU0sZUFBZTtBQUFBLE1BQ3pCO0FBRUEsZ0JBQVUsY0FBYyxPQUFPLEtBQUssSUFBSSxFQUFFLFNBQVMsT0FBTztBQUFBLElBQzlELFNBQVMsR0FBRztBQUNSLGdCQUFVLG9CQUFvQixFQUFFLE9BQU87QUFBQSxJQUMzQztBQUVBLFVBQU0sT0FBTyxRQUFRO0FBQUEsRUFDekI7QUFJQSxXQUFTLGFBQWE7QUFDbEIsTUFBRSxVQUFVLEdBQUcsaUJBQWlCLFNBQVMsT0FBTztBQUNoRCxNQUFFLGFBQWEsR0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ2xELE1BQUUsWUFBWSxHQUFHLGlCQUFpQixTQUFTLFVBQVU7QUFDckQsTUFBRSxhQUFhLEdBQUcsaUJBQWlCLFVBQVUsVUFBVTtBQUN2RCxNQUFFLFdBQVcsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBRTlELE1BQUUsYUFBYSxHQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDOUMsWUFBTSxjQUFjLENBQUMsTUFBTTtBQUMzQixhQUFPO0FBQ1AsaUJBQVc7QUFBQSxJQUNmLENBQUM7QUFFRCxNQUFFLFdBQVcsR0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDN0MsWUFBTSxXQUFXLEVBQUUsT0FBTztBQUMxQixhQUFPO0FBQUEsSUFDWCxDQUFDO0FBRUQsTUFBRSxZQUFZLEdBQUcsaUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQzlDLFlBQU0sWUFBWSxFQUFFLE9BQU87QUFDM0IsYUFBTztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0w7QUFFQSxXQUFTLFNBQVMsTUFBTSxNQUFNLEVBQUUsT0FBTyxTQUFTLE9BQU8sR0FBRztBQUN0RCxRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBQy9CLFVBQU0sSUFBSSxFQUFFLFlBQVk7QUFBRyxRQUFJLEtBQUssTUFBTyxHQUFFLGNBQWM7QUFDM0QsVUFBTSxJQUFJLEVBQUUsY0FBYztBQUFHLFFBQUksS0FBSyxRQUFTLEdBQUUsY0FBYztBQUMvRCxVQUFNLElBQUksRUFBRSxtQkFBbUI7QUFBRyxRQUFJLEtBQUssT0FBUSxHQUFFLGNBQWM7QUFDbkUsT0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQy9CLFlBQU0sTUFBTSxJQUFJLFFBQVEsT0FBTyx3QkFBd0I7QUFDdkQsYUFBTyxLQUFLLEtBQUssa0JBQWtCO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFFQSxpQkFBZSxPQUFPO0FBRWxCLFVBQU0sY0FBYyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekUsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqRSxVQUFNLE9BQU8sRUFBRSxtQkFBbUI7QUFDbEMsVUFBTSxPQUFPLEVBQUUsb0JBQW9CO0FBRW5DLFFBQUksQ0FBQyxhQUFhO0FBR2Qsa0JBQVksSUFBSTtBQUNoQixlQUFTLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFDdkI7QUFBQSxJQUNKO0FBRUEsUUFBSSxRQUFRO0FBRVIsa0JBQVksS0FBSztBQUNqQixlQUFTLE1BQU0sTUFBTTtBQUFBLFFBQ2pCLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNaLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFFQSxnQkFBWSxJQUFJO0FBQ2hCLFFBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUMvQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFFL0IsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hFLFVBQU0sWUFBWSxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUU7QUFDbEQsVUFBTSxjQUFjLE1BQU1DLGVBQWM7QUFDeEMsVUFBTSxPQUFPLE1BQU0sWUFBWTtBQUUvQixlQUFXO0FBQ1gsV0FBTztBQUVQLFFBQUksTUFBTSxlQUFlLFVBQVUsR0FBRztBQUNsQyxZQUFNLFFBQVE7QUFBQSxJQUNsQjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsidGFyZ2V0IiwgIklWX0JZVEVTIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJhcGkiLCAiSVZfQllURVMiLCAic3RvcmFnZSIsICJpc1N5bmNFbmFibGVkIiwgImlzU3luY0VuYWJsZWQiXQp9Cg==
