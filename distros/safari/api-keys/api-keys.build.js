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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHtcbiAgICBnZXRBcGlLZXlTdG9yZSxcbiAgICBzYXZlQXBpS2V5LFxuICAgIGRlbGV0ZUFwaUtleSxcbiAgICBsaXN0QXBpS2V5cyxcbiAgICBzZXRTeW5jRW5hYmxlZCxcbiAgICBpc1N5bmNFbmFibGVkLFxuICAgIHVwZGF0ZVN0b3JlU3luY1N0YXRlLFxuICAgIGV4cG9ydFN0b3JlLFxuICAgIGltcG9ydFN0b3JlLFxufSBmcm9tICcuLi91dGlsaXRpZXMvYXBpLWtleS1zdG9yZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGtleXM6IFtdLFxuICAgIG5ld0xhYmVsOiAnJyxcbiAgICBuZXdTZWNyZXQ6ICcnLFxuICAgIGVkaXRpbmdJZDogbnVsbCxcbiAgICBlZGl0TGFiZWw6ICcnLFxuICAgIGVkaXRTZWNyZXQ6ICcnLFxuICAgIGNvcGllZElkOiBudWxsLFxuICAgIHJldmVhbGVkSWQ6IG51bGwsXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZ2xvYmFsU3luY1N0YXR1czogJ2lkbGUnLFxuICAgIHN5bmNFcnJvcjogJycsXG4gICAgc2F2aW5nOiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIHNvcnRlZEtleXMoKSB7XG4gICAgcmV0dXJuIFsuLi5zdGF0ZS5rZXlzXS5zb3J0KChhLCBiKSA9PlxuICAgICAgICBhLmxhYmVsLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShiLmxhYmVsLnRvTG93ZXJDYXNlKCkpLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIG1hc2tTZWNyZXQoc2VjcmV0KSB7XG4gICAgaWYgKCFzZWNyZXQpIHJldHVybiAnJztcbiAgICBpZiAoc2VjcmV0Lmxlbmd0aCA8PSA4KSByZXR1cm4gJ1xcdTIwMjInLnJlcGVhdChzZWNyZXQubGVuZ3RoKTtcbiAgICByZXR1cm4gc2VjcmV0LnNsaWNlKDAsIDQpICsgJ1xcdTIwMjInLnJlcGVhdCg0KSArIHNlY3JldC5zbGljZSgtNCk7XG59XG5cbmZ1bmN0aW9uIHNob3dUb2FzdChtc2cpIHtcbiAgICBzdGF0ZS50b2FzdCA9IG1zZztcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUudG9hc3QgPSAnJzsgcmVuZGVyKCk7IH0sIDIwMDApO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzQ2xhc3Moc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ2lkbGUnKSByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnbGVkLS1ncmVlbicgOiAnbGVkLS1vZmYnO1xuICAgIGlmIChzdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdsZWQtLWFtYmVyIGFuaW1hdGUtcHVsc2UnO1xuICAgIHJldHVybiAnbGVkLS1yZWQnO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzVGV4dCgpIHtcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ1N5bmNpbmcuLi4nO1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnZXJyb3InKSByZXR1cm4gc3RhdGUuc3luY0Vycm9yO1xuICAgIHJldHVybiBzdGF0ZS5zeW5jRW5hYmxlZCA/ICdTeW5jZWQnIDogJ0xvY2FsIG9ubHknO1xufVxuXG4vLyAtLS0gUmVuZGVyIC0tLVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gU3luYyBiYXJcbiAgICBjb25zdCBzeW5jRG90ID0gJCgnc3luYy1kb3QnKTtcbiAgICBjb25zdCBzeW5jVGV4dCA9ICQoJ3N5bmMtdGV4dCcpO1xuICAgIGNvbnN0IHN5bmNCdG4gPSAkKCdzeW5jLWJ0bicpO1xuICAgIGNvbnN0IHN5bmNUb2dnbGUgPSAkKCdzeW5jLXRvZ2dsZScpO1xuICAgIGNvbnN0IGtleUNvdW50ID0gJCgna2V5LWNvdW50Jyk7XG5cbiAgICBpZiAoc3luY0RvdCkgc3luY0RvdC5jbGFzc05hbWUgPSBgbGVkICR7c3luY1N0YXR1c0NsYXNzKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMpfWA7XG4gICAgaWYgKHN5bmNUZXh0KSBzeW5jVGV4dC50ZXh0Q29udGVudCA9IHN5bmNTdGF0dXNUZXh0KCk7XG4gICAgaWYgKHN5bmNCdG4pIHN5bmNCdG4uZGlzYWJsZWQgPSBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycgfHwgIWhhc1JlbGF5cygpIHx8ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICBpZiAoc3luY1RvZ2dsZSkgc3luY1RvZ2dsZS5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIFN0cmluZyhzdGF0ZS5zeW5jRW5hYmxlZCkpO1xuICAgIGlmIChrZXlDb3VudCkga2V5Q291bnQudGV4dENvbnRlbnQgPSBzdGF0ZS5rZXlzLmxlbmd0aCArICcga2V5JyArIChzdGF0ZS5rZXlzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEtleSB0YWJsZVxuICAgIGNvbnN0IGtleVRhYmxlQ29udGFpbmVyID0gJCgna2V5LXRhYmxlLWNvbnRhaW5lcicpO1xuICAgIGNvbnN0IG5vS2V5c01zZyA9ICQoJ25vLWtleXMnKTtcbiAgICBjb25zdCBrZXlUYWJsZUJvZHkgPSAkKCdrZXktdGFibGUtYm9keScpO1xuXG4gICAgaWYgKGtleVRhYmxlQ29udGFpbmVyKSBrZXlUYWJsZUNvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gc3RhdGUua2V5cy5sZW5ndGggPiAwID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICBpZiAobm9LZXlzTXNnKSBub0tleXNNc2cuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIGlmIChrZXlUYWJsZUJvZHkpIHtcbiAgICAgICAgY29uc3Qgc29ydGVkID0gc29ydGVkS2V5cygpO1xuICAgICAgICBrZXlUYWJsZUJvZHkuaW5uZXJIVE1MID0gc29ydGVkLm1hcChrZXkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0YXRlLmVkaXRpbmdJZCA9PT0ga2V5LmlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZSBpcy1saXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLWhlYWRlclwiPkVkaXQga2V5PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLWJvZHkgZmxleCBmbGV4LWNvbCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5zLWlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIktleSBsYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1sYWJlbD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtlc2NhcGVBdHRyKHN0YXRlLmVkaXRMYWJlbCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaW5zLWlucHV0IG1vbm9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVsbGNoZWNrPVwiZmFsc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiU2VjcmV0IGtleVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZWRpdC1zZWNyZXQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0U2VjcmV0KX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZ2FwLTIganVzdGlmeS1lbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLWdob3N0IGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiPkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tcHJpbWFyeSBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwic2F2ZS1lZGl0XCI+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXZlYWxlZCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGtleS5pZDtcbiAgICAgICAgICAgIC8vIEFuIHVuZGVjcnlwdGFibGUgc2VjcmV0IG11c3QgcmVhZCBhcyBhIFBST0JMRU0sIG5ldmVyIGFzIGJsYW5rIFx1MjAxNFxuICAgICAgICAgICAgLy8gYmxhbmsgaXMgd2hhdCBtYWRlIHRoZSBvbGQgZGF0YSBsb3NzIGludmlzaWJsZS5cbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlTZWNyZXQgPSBrZXkudW5kZWNyeXB0YWJsZVxuICAgICAgICAgICAgICAgID8gJ3VucmVhZGFibGUgb24gdGhpcyBkZXZpY2UnXG4gICAgICAgICAgICAgICAgOiAocmV2ZWFsZWQgPyBlc2NhcGVIdG1sKGtleS5zZWNyZXQpIDogZXNjYXBlSHRtbChtYXNrU2VjcmV0KGtleS5zZWNyZXQpKSk7XG4gICAgICAgICAgICBjb25zdCBjb3B5TGFiZWwgPSBzdGF0ZS5jb3BpZWRJZCA9PT0ga2V5LmlkID8gJ0NvcGllZCEnIDogJ0NvcHknO1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlJHtyZXZlYWxlZCA/ICcgaXMtbGl2ZScgOiAnJ31cIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInBhdGNoLXBvaW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9XCIke3JldmVhbGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCIke3JldmVhbGVkID8gJ0hpZGUgc2VjcmV0JyA6ICdSZXZlYWwgc2VjcmV0J31cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCIke3JldmVhbGVkID8gJ0hpZGUnIDogJ1JldmVhbCd9IHNlY3JldCBmb3IgJHtlc2NhcGVBdHRyKGtleS5sYWJlbCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInBhdGNoLWphY2tcIj48L3NwYW4+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBnYXAtMC41IG1pbi13LTAgZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgaG92ZXI6dW5kZXJsaW5lXCIgZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIiB0aXRsZT1cIkVkaXQga2V5XCI+JHtlc2NhcGVIdG1sKGtleS5sYWJlbCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibW9ubyB0ZXh0LXhzICR7cmV2ZWFsZWQgPyAnJyA6ICdpbnMtbXV0ZWQgJ31pbnMtdHJ1bmNhdGUgY3Vyc29yLXBvaW50ZXJcIiBkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7ZGlzcGxheVNlY3JldH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicm93LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPiR7Y29weUxhYmVsfTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1zbSBidG4tLWRlc3RydWN0aXZlXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+RGVsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICAgICAgfSkuam9pbignJyk7XG5cbiAgICAgICAgLy8gQmluZCB0YWJsZSBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc3RhcnRFZGl0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5yZXZlYWxlZElkID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0gZWwuZGF0YXNldC5rZXlJZCA/IG51bGwgOiBlbC5kYXRhc2V0LmtleUlkO1xuICAgICAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY29weS1zZWNyZXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gY29weVNlY3JldChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiZGVsZXRlLWtleVwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBkZWxldGVLZXkoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlRWRpdCk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FuY2VsRWRpdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJpbmQgZWRpdCBpbnB1dCBldmVudHNcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtbGFiZWxdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRMYWJlbCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1zZWNyZXRdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7IHN0YXRlLmVkaXRTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQga2V5IGZvcm1cbiAgICBjb25zdCBuZXdMYWJlbElucHV0ID0gJCgnbmV3LWxhYmVsJyk7XG4gICAgY29uc3QgbmV3U2VjcmV0SW5wdXQgPSAkKCduZXctc2VjcmV0Jyk7XG4gICAgY29uc3QgYWRkS2V5QnRuID0gJCgnYWRkLWtleS1idG4nKTtcblxuICAgIGlmIChuZXdMYWJlbElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld0xhYmVsSW5wdXQpIG5ld0xhYmVsSW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdMYWJlbDtcbiAgICBpZiAobmV3U2VjcmV0SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3U2VjcmV0SW5wdXQpIG5ld1NlY3JldElucHV0LnZhbHVlID0gc3RhdGUubmV3U2VjcmV0O1xuICAgIGlmIChhZGRLZXlCdG4pIHtcbiAgICAgICAgYWRkS2V5QnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLm5ld0xhYmVsLnRyaW0oKS5sZW5ndGggPT09IDAgfHwgc3RhdGUubmV3U2VjcmV0LnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgIGFkZEtleUJ0bi50ZXh0Q29udGVudCA9IHN0YXRlLnNhdmluZyA/ICdTYXZpbmcuLi4nIDogJ1NhdmUnO1xuICAgIH1cblxuICAgIC8vIFRvYXN0XG4gICAgY29uc3QgdG9hc3QgPSAkKCd0b2FzdCcpO1xuICAgIGlmICh0b2FzdCkge1xuICAgICAgICB0b2FzdC50ZXh0Q29udGVudCA9IHN0YXRlLnRvYXN0O1xuICAgICAgICB0b2FzdC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudG9hc3QgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYudGV4dENvbnRlbnQgPSBzdHI7XG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuXG4vLyAtLS0gQ1JVRCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gYWRkS2V5KCkge1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUubmV3TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLm5ld1NlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgY29uc3QgaWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIGF3YWl0IHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLm5ld0xhYmVsID0gJyc7XG4gICAgc3RhdGUubmV3U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICBzaG93VG9hc3QoJ0tleSBhZGRlZCcpO1xufVxuXG5mdW5jdGlvbiBzdGFydEVkaXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoa2V5LnVuZGVjcnlwdGFibGUpIHtcbiAgICAgICAgLy8gT3BlbmluZyBpdCB3b3VsZCBzZWVkIHRoZSBlZGl0b3Igd2l0aCBub3RoaW5nIGFuZCBTYXZlIHdvdWxkIHdyaXRlXG4gICAgICAgIC8vIHRoYXQgbm90aGluZyBvdmVyIHRoZSBzdG9yZWQgY2lwaGVydGV4dC5cbiAgICAgICAgc2hvd1RvYXN0KCdUaGlzIGtleSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlIFx1MjAxNCBpdCB3YXMgbGVmdCB1bnRvdWNoZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBrZXkuaWQ7XG4gICAgc3RhdGUuZWRpdExhYmVsID0ga2V5LmxhYmVsO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSBrZXkuc2VjcmV0O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRWRpdCgpIHtcbiAgICBpZiAoIXN0YXRlLmVkaXRpbmdJZCkgcmV0dXJuO1xuICAgIGNvbnN0IGxhYmVsID0gc3RhdGUuZWRpdExhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5lZGl0U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIGF3YWl0IHNhdmVBcGlLZXkoc3RhdGUuZWRpdGluZ0lkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IHVwZGF0ZWQnKTtcbn1cblxuZnVuY3Rpb24gY2FuY2VsRWRpdCgpIHtcbiAgICBzdGF0ZS5lZGl0aW5nSWQgPSBudWxsO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9ICcnO1xuICAgIHN0YXRlLmVkaXRTZWNyZXQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlS2V5KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKCEoYXdhaXQgaW5zQ29uZmlybSh7IHRpdGxlOiBgRGVsZXRlIFwiJHtrZXkubGFiZWx9XCI/YCwgYm9keTogJ1RoZSBzdG9yZWQgc2VjcmV0IGlzIHJlbW92ZWQgZnJvbSB5b3VyIGVuY3J5cHRlZCB2YXVsdC4nLCBjb25maXJtTGFiZWw6ICdEZWxldGUga2V5JywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSByZXR1cm47XG5cbiAgICBhd2FpdCBkZWxldGVBcGlLZXkoaWQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc2hvd1RvYXN0KCdLZXkgZGVsZXRlZCcpO1xufVxuXG4vLyAtLS0gQ2xpcGJvYXJkIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5U2VjcmV0KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKGtleS51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBrZXkgY291bGQgbm90IGJlIGRlY3J5cHRlZCBvbiB0aGlzIGRldmljZScpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGtleS5zZWNyZXQpO1xuICAgIHN0YXRlLmNvcGllZElkID0gaWQ7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLmNvcGllZElkID0gbnVsbDsgcmVuZGVyKCk7IH0sIDIwMDApO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCgnJykuY2F0Y2goKCkgPT4ge30pO1xuICAgIH0sIDMwMDAwKTtcbn1cblxuLy8gLS0tIFN5bmMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIHB1Ymxpc2hUb1JlbGF5KCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2FwaWtleXMucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGtleXM6IHN0b3JlLmtleXMgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNBbGwoKSB7XG4gICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdzeW5jaW5nJztcbiAgICBzdGF0ZS5zeW5jRXJyb3IgPSAnJztcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2FwaWtleXMuZmV0Y2gnIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQua2V5cykge1xuICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRBcGlLZXlTdG9yZSgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxLZXlzID0gc3RvcmUua2V5cztcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQ291bnQgPSBPYmplY3Qua2V5cyhsb2NhbEtleXMpLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKGxvY2FsQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZXN1bHQua2V5cyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdG9yZS5yZWxheUNyZWF0ZWRBdCB8fCByZXN1bHQuY3JlYXRlZEF0ID4gc3RvcmUucmVsYXlDcmVhdGVkQXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZXN1bHQua2V5cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnaWRsZSc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gZS5tZXNzYWdlIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVN5bmMoKSB7XG4gICAgYXdhaXQgc2V0U3luY0VuYWJsZWQoc3RhdGUuc3luY0VuYWJsZWQpO1xuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG4vLyAtLS0gSW1wb3J0IC8gRXhwb3J0IC0tLVxuXG5hc3luYyBmdW5jdGlvbiBleHBvcnRLZXlzKCkge1xuICAgIGNvbnN0IHsga2V5cywgdW5kZWNyeXB0YWJsZSB9ID0gYXdhaXQgZXhwb3J0U3RvcmUoKTtcbiAgICBjb25zdCBwbGFpblRleHQgPSBKU09OLnN0cmluZ2lmeShrZXlzLCBudWxsLCAyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2FwaWtleXMuZW5jcnlwdCcsXG4gICAgICAgIHBheWxvYWQ6IHsgcGxhaW5UZXh0IH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHNob3dUb2FzdCgnRXhwb3J0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeSh7IGVuY3J5cHRlZDogdHJ1ZSwgZGF0YTogcmVzdWx0LmNpcGhlclRleHQgfSldLFxuICAgICAgICB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcbiAgICBhLmRvd25sb2FkID0gJ25vc3Rya2V5LWFwaS1rZXlzLWJhY2t1cC5qc29uJztcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIHNob3dUb2FzdCh1bmRlY3J5cHRhYmxlLmxlbmd0aFxuICAgICAgICA/IGBFeHBvcnRlZCBcdTIwMTQgJHt1bmRlY3J5cHRhYmxlLmxlbmd0aH0ga2V5KHMpIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgaGVyZSBhbmQgd2VyZSBiYWNrZWQgdXAgc3RpbGwtZW5jcnlwdGVkOiAke3VuZGVjcnlwdGFibGUuam9pbignLCAnKX1gXG4gICAgICAgIDogJ0V4cG9ydGVkJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydEtleXMoZXZlbnQpIHtcbiAgICBjb25zdCBmaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZmlsZS50ZXh0KCk7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodGV4dCk7XG5cbiAgICAgICAgbGV0IGtleXM7XG4gICAgICAgIGlmIChwYXJzZWQuZW5jcnlwdGVkICYmIHBhcnNlZC5kYXRhKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAga2luZDogJ2FwaWtleXMuZGVjcnlwdCcsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBjaXBoZXJUZXh0OiBwYXJzZWQuZGF0YSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2hvd1RvYXN0KCdEZWNyeXB0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5cyA9IEpTT04ucGFyc2UocmVzdWx0LnBsYWluVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gcGFyc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUoa2V5cyk7XG4gICAgICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dUb2FzdCgnSW1wb3J0ZWQgJyArIE9iamVjdC5rZXlzKGtleXMpLmxlbmd0aCArICcga2V5cycpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnQgZmFpbGVkOiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG5cbiAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbn1cblxuLy8gLS0tIEV2ZW50IGJpbmRpbmcgLS0tXG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgnc3luYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzeW5jQWxsKTtcbiAgICAkKCdhZGQta2V5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFkZEtleSk7XG4gICAgJCgnZXhwb3J0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cG9ydEtleXMpO1xuICAgICQoJ2ltcG9ydC1maWxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGltcG9ydEtleXMpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgICQoJ3N5bmMtdG9nZ2xlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHRvZ2dsZVN5bmMoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1sYWJlbCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld0xhYmVsID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LXNlY3JldCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld1NlY3JldCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0dhdGUoZ2F0ZSwgbWFpbiwgeyB0aXRsZSwgbWVzc2FnZSwgYnV0dG9uIH0pIHtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGNvbnN0IHQgPSAkKCdnYXRlLXRpdGxlJyk7IGlmICh0ICYmIHRpdGxlKSB0LnRleHRDb250ZW50ID0gdGl0bGU7XG4gICAgY29uc3QgbSA9ICQoJ2dhdGUtbWVzc2FnZScpOyBpZiAobSAmJiBtZXNzYWdlKSBtLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICBjb25zdCBiID0gJCgnZ2F0ZS1zZWN1cml0eS1idG4nKTsgaWYgKGIgJiYgYnV0dG9uKSBiLnRleHRDb250ZW50ID0gYnV0dG9uO1xuICAgIGI/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBhcGkucnVudGltZS5nZXRVUkwoJ3NlY3VyaXR5L3NlY3VyaXR5Lmh0bWwnKTtcbiAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnbm9zdHJrZXktb3B0aW9ucycpO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIC8vIEdhdGU6IHJlcXVpcmUgbWFzdGVyIHBhc3N3b3JkIEFORCBhbiB1bmxvY2tlZCBzZXNzaW9uIGJlZm9yZSByZW5kZXJpbmcuXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0VuY3J5cHRlZCcgfSk7XG4gICAgY29uc3QgbG9ja2VkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNMb2NrZWQnIH0pO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgLy8gTm8gbWFzdGVyIHBhc3N3b3JkIHNldCB5ZXQgXHUyMDE0IGRldmljZS1rZXkgZW5jcnlwdGlvbiBpcyBhY3RpdmUgYnV0IHRoZVxuICAgICAgICAvLyB2YXVsdCBVSSBzdGlsbCBhc2tzIHRoZSB1c2VyIHRvIHNldCBhIHBhc3N3b3JkIGZpcnN0LlxuICAgICAgICBzZXRVbmxvY2tlZCh0cnVlKTtcbiAgICAgICAgc2hvd0dhdGUoZ2F0ZSwgbWFpbiwge30pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGxvY2tlZCkge1xuICAgICAgICAvLyBGNTogc2Vzc2lvbiBpcyBsb2NrZWQgXHUyMDE0IHJlZnVzZSB0byByZWFkL3JlbmRlciBhbnkgQVBJLWtleSBzZWNyZXQuXG4gICAgICAgIHNldFVubG9ja2VkKGZhbHNlKTtcbiAgICAgICAgc2hvd0dhdGUoZ2F0ZSwgbWFpbiwge1xuICAgICAgICAgICAgdGl0bGU6ICdWYXVsdCBMb2NrZWQnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1VubG9jayBOb3N0cktleSB3aXRoIHlvdXIgbWFzdGVyIHBhc3N3b3JkIHRvIHZpZXcgeW91ciBBUEkga2V5cy4nLFxuICAgICAgICAgICAgYnV0dG9uOiAnVW5sb2NrJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRVbmxvY2tlZCh0cnVlKTtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgY29uc3QgcmVsYXlzID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZ2V0UmVsYXlzJyB9KTtcbiAgICBzdGF0ZS5yZWxheUluZm8gPSByZWxheXMgfHwgeyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgc3RhdGUuc3luY0VuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIiwgIi8qKlxuICogaW5zLWNvbmZpcm0uanMgXHUyMDE0IHRoZSBzaGFyZWQgY29uc2VudCBvdmVybGF5IGZvciBleHRlbnNpb24gcGFnZXMuXG4gKlxuICogT25lIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb25zZW50LXN1cmZhY2Ugc3RhbmRhcmQ6IGEgZGltbWVkIGJhY2tkcm9wIHBsdXNcbiAqIGVpdGhlciBhIGJvdHRvbSBTSEVFVCAoZGVmYXVsdDsgZGVzdHJ1Y3RpdmUgLyBpcnJldmVyc2libGUgYWN0cykgb3IgYVxuICogY2VudGVyZWQgUE9QT1ZFUiAobG93LXN0YWtlcywgcmV2ZXJzaWJsZSBhY3RzKS4gUmVwbGFjZXMgbmF0aXZlXG4gKiBjb25maXJtKCkvYWxlcnQoKSBvbiBldmVyeSBleHRlbnNpb24tcGFnZSBzdXJmYWNlLlxuICpcbiAqICAgaW5zQ29uZmlybSh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8Ym9vbGVhbj4gICAodHJ1ZSA9IGNvbmZpcm1lZDsgRXNjYXBlL2JhY2tkcm9wL2NhbmNlbCA9IGZhbHNlKVxuICogICBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsIH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTx2b2lkPlxuICpcbiAqIFN0eWxpbmcgY29tZXMgZW50aXJlbHkgZnJvbSBpbnN0cnVtZW50LmNzcyAoc2VjdGlvbiAxOCArIHRoZSAuYnRuIGZhbWlseSksXG4gKiBzbyBza2luIC8gbW9kZSAvIGNvbnRyYXN0IC8gZGVuc2l0eSAvIHRleHQtc2l6ZSBhcnJpdmUgdmlhIHRoZSBwYWdlJ3NcbiAqIHN0YW1wZWQgZGF0YS1pbnMtKiBhdHRyaWJ1dGVzIFx1MjAxNCBubyBzdG9yYWdlIGFjY2Vzcywgbm8gbWVzc2FnaW5nIGhlcmUuXG4gKlxuICogU2FmZXR5OiB0aXRsZS9ib2R5IG1heSBjb250YWluIHVzZXIgZGF0YSAoa2V5IGxhYmVscywgdmF1bHQgcGF0aHMpOyB0aGUgRE9NXG4gKiBpcyBidWlsdCB3aXRoIGNyZWF0ZUVsZW1lbnQgKyB0ZXh0Q29udGVudCBPTkxZIFx1MjAxNCBuZXZlciBpbm5lckhUTUwuXG4gKi9cblxuLy8gU2VyaWFsaXplIG92ZXJsYXBwaW5nIGNhbGxzIHNvIGEgc2Vjb25kIGRpYWxvZyBuZXZlciBkb3VibGUtcmVuZGVycyBvbiB0b3Bcbi8vIG9mIChvciBpbnRlcmxlYXZlcyB3aXRoKSBhbiBvcGVuIG9uZS5cbmxldCBxdWV1ZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5sZXQgaWRDb3VudGVyID0gMDtcblxuZnVuY3Rpb24gbW90aW9uT2ZmKCkge1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWlucy1tb3Rpb24nKSA9PT0gJ29mZicpIHJldHVybiB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKS5tYXRjaGVzO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBCdWlsZCwgc2hvdyBhbmQgc2V0dGxlIG9uZSBkaWFsb2cuIFJlc29sdmVzIHRydWUgKGNvbmZpcm0pIG9yIGZhbHNlXG4gKiAoY2FuY2VsIC8gRXNjYXBlIC8gYmFja2Ryb3AgY2xpY2spLlxuICovXG5mdW5jdGlvbiBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2UgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcm9vdC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtcm9vdCc7XG5cbiAgICAgICAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJhY2tkcm9wJztcblxuICAgICAgICBjb25zdCBpc1NoZWV0ID0gdmFyaWFudCAhPT0gJ3BvcG92ZXInO1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTmFtZSA9IGlzU2hlZXQgPyAnaW5zLWNvbnNlbnQtc2hlZXQnIDogJ2lucy1jb25zZW50LXBvcG92ZXInO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdyb2xlJywgKGRlc3RydWN0aXZlIHx8IG5vdGljZSkgPyAnYWxlcnRkaWFsb2cnIDogJ2RpYWxvZycpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgJ3RydWUnKTtcblxuICAgICAgICBpZiAoaXNTaGVldCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBoYW5kbGUuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWhhbmRsZSc7XG4gICAgICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoaGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVpZCA9ICsraWRDb3VudGVyO1xuICAgICAgICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGVFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtdGl0bGUnO1xuICAgICAgICB0aXRsZUVsLmlkID0gYGlucy1jb25zZW50LXRpdGxlLSR7dWlkfWA7XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCB0aXRsZUVsLmlkKTtcblxuICAgICAgICBjb25zdCBib2R5RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGJvZHlFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYm9keSc7XG4gICAgICAgIGJvZHlFbC5pZCA9IGBpbnMtY29uc2VudC1ib2R5LSR7dWlkfWA7XG4gICAgICAgIGJvZHlFbC50ZXh0Q29udGVudCA9IGJvZHkgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChib2R5RWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgYm9keUVsLmlkKTtcblxuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWFjdGlvbnMnO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgbGV0IGNhbmNlbEJ0biA9IG51bGw7XG4gICAgICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29uZmlybUJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNvbmZpcm1CdG4udGV4dENvbnRlbnQgPSBjb25maXJtTGFiZWw7XG4gICAgICAgIGlmIChub3RpY2UpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gJ2J0bic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBjYW5jZWxCdG4uY2xhc3NOYW1lID0gJ2J0biBidG4tLWdob3N0JztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IGNhbmNlbExhYmVsO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9IGRlc3RydWN0aXZlID8gJ2J0biBidG4tLWRlc3RydWN0aXZlJyA6ICdidG4gYnRuLS1wcmltYXJ5JztcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNvbmZpcm1CdG4pO1xuICAgICAgICBidXR0b25zLnB1c2goY29uZmlybUJ0bik7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcblxuICAgICAgICByb290LmFwcGVuZENoaWxkKGJhY2tkcm9wKTtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkaWFsb2cpO1xuXG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIHNldHRsZShyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKSByZXR1cm47XG4gICAgICAgICAgICBzZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Rm9jdXMgJiYgdHlwZW9mIHByZXZGb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJyAmJiBkb2N1bWVudC5jb250YWlucyhwcmV2Rm9jdXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogZm9jdXMgcmVzdG9yZSBpcyBiZXN0LWVmZm9ydCAqLyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtb3Rpb25PZmYoKSkgZmluaXNoKCk7XG4gICAgICAgICAgICBlbHNlIHNldFRpbWVvdXQoZmluaXNoLCAyNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25LZXlkb3duKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgc2V0dGxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnVGFiJykge1xuICAgICAgICAgICAgICAgIC8vIFRyYXAgZm9jdXMgYWNyb3NzIHRoZSBkaWFsb2cncyBidXR0b25zIG9ubHkuXG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBidXR0b25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlyID0gZXYuc2hpZnRLZXkgPyAtMSA6IDE7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1soaWR4ICsgZGlyICsgYnV0dG9ucy5sZW5ndGgpICUgYnV0dG9ucy5sZW5ndGhdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBiYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBpZiAoY2FuY2VsQnRuKSBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgY29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZSh0cnVlKSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocm9vdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgLy8gRGVzdHJ1Y3RpdmUgYWN0cyBzdGFydCBvbiBDYW5jZWwgc28gRW50ZXIgY2FuJ3QgcnVzaCB0aGUgZGVsZXRlO1xuICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlIHN0YXJ0cyBvbiB0aGUgY29uZmlybWluZyBhY3Rpb24uXG4gICAgICAgICAgICBjb25zdCBpbml0aWFsID0gbm90aWNlID8gY29uZmlybUJ0biA6IChkZXN0cnVjdGl2ZSA/IGNhbmNlbEJ0biA6IGNvbmZpcm1CdG4pO1xuICAgICAgICAgICAgKGluaXRpYWwgfHwgY29uZmlybUJ0bikuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNDb25maXJtKHtcbiAgICB0aXRsZSxcbiAgICBib2R5LFxuICAgIGNvbmZpcm1MYWJlbCA9ICdDb25maXJtJyxcbiAgICBjYW5jZWxMYWJlbCA9ICdDYW5jZWwnLFxuICAgIGRlc3RydWN0aXZlID0gZmFsc2UsXG4gICAgdmFyaWFudCA9ICdzaGVldCcsXG59ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZTogZmFsc2UgfSkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCA9ICdPSycgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGNvbmZpcm1MYWJlbDogZGlzbWlzc0xhYmVsLFxuICAgICAgICAgICAgY2FuY2VsTGFiZWw6ICcnLFxuICAgICAgICAgICAgZGVzdHJ1Y3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdmFyaWFudDogJ3NoZWV0JyxcbiAgICAgICAgICAgIG5vdGljZTogdHJ1ZSxcbiAgICAgICAgfSkudGhlbigoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIEFQSSBLZXkgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgQVBJIGtleXNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIGFwaUtleVZhdWx0OiB7XG4gKiAgICAga2V5czoge1xuICogICAgICAgXCI8dXVpZD5cIjogeyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQsIHByb2ZpbGVTY29wZSB9XG4gKiAgICAgfSxcbiAqICAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAqICAgICBldmVudElkOiBudWxsLFxuICogICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICogICAgIHN5bmNTdGF0dXM6IFwic3luY2VkXCIgICAgLy8gc3luY2VkIHwgbG9jYWwtb25seSB8IGNvbmZsaWN0XG4gKiAgIH1cbiAqXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0LCBpc0NpcGhlcnRleHQgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmNvbnN0IFNUT1JBR0VfS0VZID0gJ2FwaUtleVZhdWx0JztcblxuLyoqXG4gKiBEZWNyeXB0IGEga2V5J3MgYHNlY3JldGAgZmllbGQgZm9yIGNhbGxlcnMuIFJlLXRocm93cyBsb2NrIGVycm9ycyBzbyBhIGxvY2tlZFxuICogc2Vzc2lvbiBjYW5ub3QgcmVhZCBzZWNyZXRzIChGNSkuXG4gKlxuICogQSBnZW51aW5lIGRlY3J5cHQgZmFpbHVyZSAoZS5nLiBhIGRldmljZS13cmFwcGVkIHZhbHVlIHN5bmNlZCBmcm9tIGFub3RoZXJcbiAqIGRldmljZSwgb3IgYSBibG9iIHdob3NlIHdyYXBwaW5nIGtleSByb3RhdGVkIGF3YXkpIGlzIHJlcG9ydGVkIGFzXG4gKiBgdW5kZWNyeXB0YWJsZTogdHJ1ZWAgd2l0aCBgc2VjcmV0OiBudWxsYCBcdTIwMTQgTk9UIGFzIGFuIGVtcHR5IHN0cmluZy4gQW4gZW1wdHlcbiAqIHN0cmluZyBpcyBpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGEgcmVhbCB2YWx1ZTogdGhlIFVJIHJlbmRlcmVkIGl0IGFzIGJsYW5rXG4gKiBhbmQgZXhwb3J0U3RvcmUoKSB3cm90ZSBpdCBpbnRvIHRoZSB1c2VyJ3MgZW5jcnlwdGVkIGJhY2t1cCwgcXVpZXRseVxuICogcmVwbGFjaW5nIHRoZSBvbmx5IGNvcHkgb2YgdGhlIHNlY3JldCB3aXRoIG5vdGhpbmcuIGBudWxsYCArIHRoZSBmbGFnIG1ha2VzXG4gKiB0aGUgZmFpbHVyZSB2aXNpYmxlIHRvIGV2ZXJ5IGNhbGxlciwgYW5kIGV4cG9ydFN0b3JlKCkgY2FycmllcyB0aGUgdW50b3VjaGVkXG4gKiBjaXBoZXJ0ZXh0IGluc3RlYWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRLZXkoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBrZXk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgLi4ua2V5LCBzZWNyZXQ6IGF3YWl0IHVud3JhcFNlY3JldChrZXkuc2VjcmV0KSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlLm1lc3NhZ2UgfHwgJycpLnN0YXJ0c1dpdGgoJ2xvY2tlZCcpKSB0aHJvdyBlO1xuICAgICAgICByZXR1cm4geyAuLi5rZXksIHNlY3JldDogbnVsbCwgdW5kZWNyeXB0YWJsZTogdHJ1ZSB9O1xuICAgIH1cbn1cblxuY29uc3QgREVGQVVMVF9TVE9SRSA9IHtcbiAgICBrZXlzOiB7fSxcbiAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAgICBldmVudElkOiBudWxsLFxuICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICAgIHN5bmNTdGF0dXM6ICdzeW5jZWQnLFxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmUoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXTogREVGQVVMVF9TVE9SRSB9KTtcbiAgICByZXR1cm4geyAuLi5ERUZBVUxUX1NUT1JFLCAuLi5kYXRhW1NUT1JBR0VfS0VZXSB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRTdG9yZShzdG9yZSkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogc3RvcmUgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCBBUEkga2V5IHN0b3JlIG9iamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUtleVN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAga2V5c1tpZF0gPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgfVxuICAgIHJldHVybiB7IC4uLnN0b3JlLCBrZXlzIH07XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIEFQSSBrZXkgYnkgaWQgKHNlY3JldCBkZWNyeXB0ZWQpLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLmtleXNbaWRdID8gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSkgOiBudWxsO1xufVxuXG4vKipcbiAqIFVwc2VydCBhbiBBUEkga2V5LiBDcmVhdGVzIGlmIG5ldywgdXBkYXRlcyBpZiBleGlzdGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVVSURcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxuICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0b3JlLmtleXNbaWRdO1xuICAgIC8vIFQwLTQ6IGVuY3J5cHQgdGhlIHNlY3JldCBiZWZvcmUgaXQgdG91Y2hlcyBzdG9yYWdlLlxuICAgIHN0b3JlLmtleXNbaWRdID0ge1xuICAgICAgICBpZCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIHNlY3JldDogYXdhaXQgd3JhcFNlY3JldChzZWNyZXQpLFxuICAgICAgICBjcmVhdGVkQXQ6IGV4aXN0aW5nPy5jcmVhdGVkQXQgfHwgbm93LFxuICAgICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICAgICAgcHJvZmlsZVNjb3BlOiBleGlzdGluZz8ucHJvZmlsZVNjb3BlID8/IG51bGwsXG4gICAgfTtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG4gICAgcmV0dXJuIGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhbiBBUEkga2V5IGJ5IGlkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGRlbGV0ZSBzdG9yZS5rZXlzW2lkXTtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgQVBJIGtleXMgc29ydGVkIGJ5IGxhYmVsIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RBcGlLZXlzKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHRLZXkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKlxuICogQSBrZXkgdGhpcyBkZXZpY2UgY2Fubm90IGRlY3J5cHQgaXMgTkVWRVIgZXhwb3J0ZWQgd2l0aCBhbiBlbXB0eS9udWxsIHNlY3JldFxuICogXHUyMDE0IHRoYXQgdHVybnMgYSByZWNvdmVyYWJsZSBwcm9ibGVtIGludG8gcGVybWFuZW50LCBwcm9wYWdhdGluZyBsb3NzIHRoZSBuZXh0XG4gKiB0aW1lIHRoZSBiYWNrdXAgaXMgaW1wb3J0ZWQuIEl0IGlzIGV4cG9ydGVkIGFzIHRoZSBPUklHSU5BTCBDSVBIRVJURVhULFxuICogdW50b3VjaGVkOiB0aGF0IHByZXNlcnZlcyBzdHJpY3RseSBtb3JlIHVzZXIgZGF0YSB0aGFuIG9taXR0aW5nIGl0ICh0aGUgdmFsdWVcbiAqIGlzIHN0aWxsIHJlY292ZXJhYmxlIG9uIGEgZGV2aWNlIHRoYXQgaG9sZHMgdGhlIHdyYXBwaW5nIGtleSwgb3Igb25jZSB0aGUga2V5XG4gKiBpcyByZXN0b3JlZCksIGFuZCBpbXBvcnRTdG9yZSgpIGFscmVhZHkgcGFzc2VzIGNpcGhlcnRleHQgc3RyYWlnaHQgdGhyb3VnaFxuICogaW5zdGVhZCBvZiByZS13cmFwcGluZyBpdCwgc28gdGhlIHJvdW5kIHRyaXAgaXMgbG9zc2xlc3MuIFRoZSBpZHMgYXJlIGFsc29cbiAqIHJlcG9ydGVkIHNvIHRoZSBjYWxsZXIgY2FuIHRlbGwgdGhlIHVzZXIgd2hpY2gga2V5cyBjYW1lIHRocm91Z2ggdW5vcGVuZWQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e2tleXM6IE9iamVjdCwgdW5kZWNyeXB0YWJsZTogc3RyaW5nW119Pn0gTWFwIG9mIGlkIC0+IGtleVxuICogICAgICAgICAgZGF0YSwgcGx1cyB0aGUgbGFiZWxzL2lkcyB0aGF0IHdlcmUgZXhwb3J0ZWQgc3RpbGwtZW5jcnlwdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U3RvcmUoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBjb25zdCB1bmRlY3J5cHRhYmxlID0gW107XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoZGVjcnlwdGVkPy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgICAgICBrZXlzW2lkXSA9IHsgLi4ua2V5IH07ICAgICAgICAgICAgLy8gY2lwaGVydGV4dCBjYXJyaWVkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgICAgIHVuZGVjcnlwdGFibGUucHVzaChrZXkubGFiZWwgfHwgaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAga2V5c1tpZF0gPSBkZWNyeXB0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB7IGtleXMsIHVuZGVjcnlwdGFibGUgfTtcbn1cblxuLyoqXG4gKiBJbXBvcnQga2V5cyBpbnRvIHRoZSBzdG9yZSAobWVyZ2UgXHUyMDE0IGV4aXN0aW5nIGtleXMgd2l0aCBzYW1lIGlkIGFyZSBvdmVyd3JpdHRlbikuXG4gKiBJbmNvbWluZyBzZWNyZXRzIGFyZSBwbGFpbnRleHQgKGZyb20gYSBkZWNyeXB0ZWQgYmFja3VwIG9yIGEgcmVsYXkgZmV0Y2gpIGFuZFxuICogYXJlIHJlLXdyYXBwZWQgdW5kZXIgdGhpcyBkZXZpY2UncyBhdC1yZXN0IGtleSBiZWZvcmUgc3RvcmFnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBrZXlzIC0gTWFwIG9mIGlkIC0+IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydFN0b3JlKGtleXMpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoa2V5cykpIHtcbiAgICAgICAgY29uc3Qgc2VjcmV0ID0gaXNDaXBoZXJ0ZXh0KGtleS5zZWNyZXQpID8ga2V5LnNlY3JldCA6IGF3YWl0IHdyYXBTZWNyZXQoa2V5LnNlY3JldCk7XG4gICAgICAgIHN0b3JlLmtleXNbaWRdID0geyAuLi5rZXksIHNlY3JldCB9O1xuICAgIH1cbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG4iLCAiLyoqXG4gKiBTeW5jIE1hbmFnZXIgXHUyMDE0IFBsYXRmb3JtIHN5bmMgdmlhIHN0b3JhZ2Uuc3luYyAoQ2hyb21lIFx1MjE5MiBHb29nbGUsIFNhZmFyaSBcdTIxOTIgaUNsb3VkKVxuICpcbiAqIEFyY2hpdGVjdHVyZTpcbiAqICAgV3JpdGU6IGFwcCBcdTIxOTIgc3RvcmFnZS5sb2NhbCBcdTIxOTIgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjE5MiBzdG9yYWdlLnN5bmNcbiAqICAgUmVhZDogIHB1bGxGcm9tU3luYygpIG9uIHN0YXJ0dXAgXHUyMTkyIG1lcmdlIGludG8gc3RvcmFnZS5sb2NhbFxuICogICBMaXN0ZW46IHN0b3JhZ2Uub25DaGFuZ2VkKFwic3luY1wiKSBcdTIxOTIgbWVyZ2UgcmVtb3RlIGNoYW5nZXMgaW50byBsb2NhbFxuICpcbiAqIHN0b3JhZ2UubG9jYWwgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoLiBzdG9yYWdlLnN5bmMgaXMgYSBiZXN0LWVmZm9ydCBtaXJyb3IuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGlzQ2lwaGVydGV4dCB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgU1lOQ19RVU9UQSA9IDEwMl80MDA7ICAgICAgIC8vIDEwMCBLQiB0b3RhbFxuY29uc3QgTUFYX0lURU0gPSA4XzE5MjsgICAgICAgICAgIC8vIDggS0IgcGVyIGl0ZW1cbmNvbnN0IE1BWF9JVEVNUyA9IDUxMjtcbmNvbnN0IENIVU5LX1BSRUZJWCA9ICdfY2h1bms6JztcbmNvbnN0IFNZTkNfTUVUQV9LRVkgPSAnX3N5bmNfbWV0YSc7XG5jb25zdCBMT0NBTF9FTkFCTEVEX0tFWSA9ICdwbGF0Zm9ybVN5bmNFbmFibGVkJztcblxuLy8gS2V5cyB0aGF0IHNob3VsZCBuZXZlciBiZSBzeW5jZWRcbmNvbnN0IEVYQ0xVREVEX0tFWVMgPSBbXG4gICAgJ2J1bmtlclNlc3Npb25zJyxcbiAgICAnaWdub3JlSW5zdGFsbEhvb2snLFxuICAgICdwYXNzd29yZEhhc2gnLFxuICAgICdwYXNzd29yZFNhbHQnLFxuXTtcblxuLy8gUHJpb3JpdHkgdGllcnMgZm9yIGJ1ZGdldCBhbGxvY2F0aW9uXG5jb25zdCBQUklPUklUWSA9IHtcbiAgICBQMV9QUk9GSUxFUzogMSxcbiAgICBQMl9TRVRUSU5HUzogMixcbiAgICBQM19BUElLRVlTOiAzLFxuICAgIFA0X1ZBVUxUOiA0LFxufTtcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xubGV0IHB1c2hUaW1lciA9IG51bGw7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ2h1bmtpbmcgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU3BsaXQgYSBKU09OLXNlcmlhbGlzZWQgdmFsdWUgaW50byA8PThLQiBjaHVua3MuXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHsga2V5LCB2YWx1ZSB9IHBhaXJzIHJlYWR5IGZvciBzdG9yYWdlLnN5bmMuc2V0KCkuXG4gKi9cbmZ1bmN0aW9uIGNodW5rVmFsdWUoa2V5LCBqc29uU3RyaW5nKSB7XG4gICAgY29uc3QgY2h1bmtzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqc29uU3RyaW5nLmxlbmd0aDsgaSArPSBNQVhfSVRFTSAtIDEwMCkge1xuICAgICAgICAvLyBSZXNlcnZlIH4xMDAgYnl0ZXMgZm9yIHRoZSBrZXkgb3ZlcmhlYWQgaW4gdGhlIHN0b3JlZCBpdGVtXG4gICAgICAgIGNodW5rcy5wdXNoKGpzb25TdHJpbmcuc2xpY2UoaSwgaSArIE1BWF9JVEVNIC0gMTAwKSk7XG4gICAgfVxuICAgIGlmIChjaHVua3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpdHMgaW4gYSBzaW5nbGUgaXRlbSBcdTIwMTQgc3RvcmUgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIFt7IGtleSwgdmFsdWU6IGpzb25TdHJpbmcgfV07XG4gICAgfVxuICAgIC8vIE11bHRpcGxlIGNodW5rc1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWAsIHZhbHVlOiBjaHVua3NbaV0gfSk7XG4gICAgfVxuICAgIC8vIFN0b3JlIGEgbWV0YWRhdGEgZW50cnkgc28gd2Uga25vdyBob3cgbWFueSBjaHVua3MgdGhlcmUgYXJlXG4gICAgZW50cmllcy5wdXNoKHsga2V5LCB2YWx1ZTogSlNPTi5zdHJpbmdpZnkoeyBfX2NodW5rZWQ6IHRydWUsIGNvdW50OiBjaHVua3MubGVuZ3RoIH0pIH0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vKipcbiAqIFJlYXNzZW1ibGUgY2h1bmtlZCBkYXRhIGZyb20gYSBzeW5jIGRhdGEgb2JqZWN0LlxuICogUmV0dXJucyB0aGUgcGFyc2VkIEpTT04gdmFsdWUsIG9yIG51bGwgb24gZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCBzeW5jRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLl9fY2h1bmtlZCkge1xuICAgICAgICAgICAgLy8gTm90IGNodW5rZWQgXHUyMDE0IHBhcnNlIGRpcmVjdGx5XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbWJpbmVkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua0tleSA9IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWA7XG4gICAgICAgICAgICBpZiAoc3luY0RhdGFbY2h1bmtLZXldID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29tYmluZWQgKz0gc3luY0RhdGFbY2h1bmtLZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbWJpbmVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHN5bmMgcGF5bG9hZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgbG9jYWwgZGF0YSBhbmQgYnVpbGQgYSBwcmlvcml0aXNlZCBsaXN0IG9mIGVudHJpZXMgdG8gc3luYy5cbiAqIFJldHVybnMgeyBlbnRyaWVzOiBbeyBrZXksIGpzb25TdHJpbmcsIHByaW9yaXR5LCBzaXplIH1dLCB0b3RhbFNpemUgfVxuICovXG5hc3luYyBmdW5jdGlvbiBidWlsZFN5bmNQYXlsb2FkKCkge1xuICAgIGNvbnN0IGFsbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcblxuICAgIC8vIFQwLTU6IGEgc2VjcmV0IGlzIG9ubHkgZXZlciBlbWl0dGVkIHRvIHN0b3JhZ2Uuc3luYyAoR29vZ2xlL2lDbG91ZCkgaWYgaXRcbiAgICAvLyBpcyBhbHJlYWR5IGFuIGVuY3J5cHRlZCBibG9iLiBBbnkgdmFsdWUgdGhhdCBpcyBOT1QgY2lwaGVydGV4dCBpcyByZWZ1c2VkXG4gICAgLy8gKGRyb3BwZWQpIHNvIHBsYWludGV4dCBwcml2YXRlIGtleXMgLyBBUEkgc2VjcmV0cyAvIG5vdGVzIGNhbiBuZXZlciBsZWF2ZVxuICAgIC8vIHRoZSBkZXZpY2UuIGAnJ2AgKGVtcHR5IC8gYnVua2VyKSBpcyBhbGxvd2VkIHRocm91Z2ggYXMgbm9uLXNlY3JldC5cbiAgICBjb25zdCBzZWNyZXRPayA9IHYgPT4gIXYgfHwgaXNDaXBoZXJ0ZXh0KHYpO1xuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4ICsgZW5jcnlwdGlvbiBzdGF0ZVxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IGFsbC5wcm9maWxlcy5tYXAocCA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgaWYgKHJlc3QucHJpdktleSAmJiAhc2VjcmV0T2socmVzdC5wcml2S2V5KSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBwcml2S2V5IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgcmVzdC5wcml2S2V5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5pc0VuY3J5cHRlZCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwuaXNFbmNyeXB0ZWQpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdpc0VuY3J5cHRlZCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDI6IFNldHRpbmdzXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3QgayBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKGFsbFtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGFsbCkpIHtcbiAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQMzogQVBJIGtleSB2YXVsdCBcdTIwMTQgb25seSBzeW5jIGtleXMgd2hvc2Ugc2VjcmV0IGlzIGNpcGhlcnRleHQgKFQwLTUpXG4gICAgaWYgKGFsbC5hcGlLZXlWYXVsdCAmJiBhbGwuYXBpS2V5VmF1bHQua2V5cykge1xuICAgICAgICBjb25zdCBzYWZlS2V5cyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhhbGwuYXBpS2V5VmF1bHQua2V5cykpIHtcbiAgICAgICAgICAgIGlmIChzZWNyZXRPayhrZXkuc2VjcmV0KSkge1xuICAgICAgICAgICAgICAgIHNhZmVLZXlzW2lkXSA9IGtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IEFQSSBzZWNyZXQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzYWZlVmF1bHQgPSB7IC4uLmFsbC5hcGlLZXlWYXVsdCwga2V5czogc2FmZUtleXMgfTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHNhZmVWYXVsdCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2FwaUtleVZhdWx0JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAzX0FQSUtFWVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFA0OiBWYXVsdCBkb2NzIChpbmRpdmlkdWFsbHksIG5ld2VzdCBmaXJzdCkgXHUyMDE0IG9ubHkgaWYgY29udGVudCBpcyBjaXBoZXJ0ZXh0XG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIGlmICghc2VjcmV0T2soZG9jLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHZhdWx0IGNvbnRlbnQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgc3luYyBwYXlsb2FkIHJlc3BlY3RpbmcgYnVkZ2V0XG4gICAgICAgIGxldCB1c2VkQnl0ZXMgPSAwO1xuICAgICAgICBsZXQgdXNlZEl0ZW1zID0gMDtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgbGV0IGJ1ZGdldEV4aGF1c3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKGJ1ZGdldEV4aGF1c3RlZCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVmFsdWUoZW50cnkua2V5LCBlbnRyeS5qc29uU3RyaW5nKTtcbiAgICAgICAgICAgIGxldCBlbnRyeVNpemUgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgIGVudHJ5U2l6ZSArPSBjLmtleS5sZW5ndGggKyAodHlwZW9mIGMudmFsdWUgPT09ICdzdHJpbmcnID8gYy52YWx1ZS5sZW5ndGggOiBKU09OLnN0cmluZ2lmeShjLnZhbHVlKS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodXNlZEJ5dGVzICsgZW50cnlTaXplID4gU1lOQ19RVU9UQSAtIDUwMCB8fCB1c2VkSXRlbXMgKyBjaHVua3MubGVuZ3RoID4gTUFYX0lURU1TIC0gNSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5wcmlvcml0eSA8PSBQUklPUklUWS5QM19BUElLRVlTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyaXRpY2FsIGRhdGEgXHUyMDE0IHRyeSBhbnl3YXksIGxldCB0aGUgQVBJIHRocm93IGlmIHRydWx5IG92ZXJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gQnVkZ2V0IGV4aGF1c3RlZCBhdCBwcmlvcml0eSAke2VudHJ5LnByaW9yaXR5fSwgc2tpcHBpbmcgcmVtYWluaW5nIGVudHJpZXNgKTtcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0RXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgc3luY1BheWxvYWRbYy5rZXldID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgICBhbGxTeW5jS2V5cy5wdXNoKGMua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBzeW5jIG1ldGFkYXRhXG4gICAgICAgIGNvbnN0IG1ldGEgPSB7XG4gICAgICAgICAgICBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAga2V5czogYWxsU3luY0tleXMsXG4gICAgICAgIH07XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkobWV0YSk7XG5cbiAgICAgICAgLy8gV3JpdGUgdG8gc3luYyBzdG9yYWdlXG4gICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHN5bmNQYXlsb2FkKTtcblxuICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlYWQgZXhpc3Rpbmcgc3luYyBrZXlzIGFuZCByZW1vdmUgYW55IG5vdCBpbiBvdXIgcGF5bG9hZFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7YWxsU3luY0tleXMubGVuZ3RofSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgIGlmICghcmF3IHx8IE9iamVjdC5rZXlzKHJhdykubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXRhU3RyID0gcmF3W1NZTkNfTUVUQV9LRVldO1xuICAgICAgICBpZiAoIW1ldGFTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBtZXRhO1xuICAgICAgICB0cnkgeyBtZXRhID0gSlNPTi5wYXJzZShtZXRhU3RyKTsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIG5vbi1jaHVuaywgbm9uLW1ldGEga2V5c1xuICAgICAgICBjb25zdCBkYXRhS2V5cyA9IG1ldGEua2V5cy5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKENIVU5LX1BSRUZJWCkgJiYgayAhPT0gU1lOQ19NRVRBX0tFWSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHJhdyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQuX3N5bmNNZXRhID0gbWV0YTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVsbEZyb21TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWVyZ2UgbG9naWNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIE1lcmdlIHN5bmMgZGF0YSBpbnRvIGxvY2FsIHN0b3JhZ2Ugd2l0aCBjb25mbGljdCByZXNvbHV0aW9uLlxuICovXG5hc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgdXBkYXRlcyA9IHt9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlY3QgZnJlc2ggaW5zdGFsbDogbm8gcHJvZmlsZXMsIG9yIGEgc2luZ2xlIHVudG91Y2hlZCBkZWZhdWx0IHByb2ZpbGUuXG4gICAgLy8gKERlZmF1bHQga2V5cyBhcmUgbm93IHdyYXBwZWQgYXQgcmVzdCwgc28gYHByaXZLZXlgIGlzIHRydXRoeSBldmVuIG9uIGFcbiAgICAvLyBmcmVzaCBpbnN0YWxsIFx1MjAxNCBkZXRlY3QgdGhlIHVudG91Y2hlZCBkZWZhdWx0IGJ5IGl0cyBuYW1lICsgYWJzZW5jZSBvZiBhbnlcbiAgICAvLyBwZXItc2l0ZSBncmFudHMgaW5zdGVhZC4pXG4gICAgY29uc3QgbG9uZSA9IGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMSA/IGxvY2FsLnByb2ZpbGVzWzBdIDogbnVsbDtcbiAgICBjb25zdCBpc0ZyZXNoID0gIWxvY2FsLnByb2ZpbGVzIHx8XG4gICAgICAgIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAobG9uZSAmJiAhbG9uZS5wcml2S2V5KSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gLS0tIFByb2ZpbGVzIChQMSkgLS0tXG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVzID0gc3luY0RhdGEucHJvZmlsZXM7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5wcm9maWxlcykge1xuICAgICAgICAgICAgLy8gUGVyLWluZGV4IHVwZGF0ZWRBdCBjb21wYXJpc29uIFx1MjAxNCBuZXdlciB3aW5zLCBsb2NhbCB3aW5zIHRpZXNcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IFsuLi5sb2NhbC5wcm9maWxlc107XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN5bmNEYXRhLnByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3luY1Byb2ZpbGUgPSBzeW5jRGF0YS5wcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoaSA+PSBtZXJnZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5ldyBwcm9maWxlIGZyb20gc3luY1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWQucHVzaChzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsUHJvZmlsZSA9IG1lcmdlZFtpXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3luY1RpbWUgPSBzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxUaW1lID0gbG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3luY1RpbWUgPiBsb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN5bmMgaXMgbmV3ZXIgXHUyMDE0IG1lcmdlIGJ1dCBwcmVzZXJ2ZSBsb2NhbCBob3N0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0geyAuLi5zeW5jUHJvZmlsZSwgaG9zdHM6IGxvY2FsUHJvZmlsZS5ob3N0cyB8fCB7fSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkgdXBkYXRlcy5wcm9maWxlcyA9IG1lcmdlZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlIGluZGV4IChQMSkgLS0tXG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsICYmIGlzRnJlc2gpIHtcbiAgICAgICAgdXBkYXRlcy5wcm9maWxlSW5kZXggPSBzeW5jRGF0YS5wcm9maWxlSW5kZXg7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIC0tLSBFbmNyeXB0aW9uIHN0YXRlIChQMSkgXHUyMDE0IG5ldmVyIGRvd25ncmFkZSAtLS1cbiAgICBpZiAoc3luY0RhdGEuaXNFbmNyeXB0ZWQgPT09IHRydWUgJiYgIWxvY2FsLmlzRW5jcnlwdGVkKSB7XG4gICAgICAgIHVwZGF0ZXMuaXNFbmNyeXB0ZWQgPSB0cnVlO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAtLS0gU2V0dGluZ3MgKFAyKSBcdTIwMTQgbGFzdC13cml0ZS13aW5zIC0tLVxuICAgIGNvbnN0IHN5bmNNZXRhID0gc3luY0RhdGEuX3N5bmNNZXRhIHx8IHt9O1xuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKHN5bmNEYXRhW2tleV0gIT0gbnVsbCAmJiBzeW5jRGF0YVtrZXldICE9PSBsb2NhbFtrZXldKSB7XG4gICAgICAgICAgICAvLyBGb3IgdmVyc2lvbiwgb25seSBhY2NlcHQgaGlnaGVyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAndmVyc2lvbicgJiYgbG9jYWwudmVyc2lvbiAmJiBzeW5jRGF0YS52ZXJzaW9uIDw9IGxvY2FsLnZlcnNpb24pIGNvbnRpbnVlO1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdmZWF0dXJlOicpICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgaWYgKHN5bmNEYXRhLmFwaUtleVZhdWx0KSB7XG4gICAgICAgIGlmICghbG9jYWwuYXBpS2V5VmF1bHQgfHwgaXNGcmVzaCkge1xuICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHN5bmNEYXRhLmFwaUtleVZhdWx0O1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBNZXJnZSBpbmRpdmlkdWFsIGtleXMgYnkgdXBkYXRlZEF0XG4gICAgICAgICAgICBjb25zdCBsb2NhbEtleXMgPSBsb2NhbC5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9O1xuICAgICAgICAgICAgY29uc3Qgc3luY0tleXMgPSBzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5sb2NhbEtleXMgfTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBzeW5jS2V5XSBvZiBPYmplY3QuZW50cmllcyhzeW5jS2V5cykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbEtleSA9IG1lcmdlZFtpZF07XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbEtleSB8fCAoc3luY0tleS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxLZXkudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFtpZF0gPSBzeW5jS2V5O1xuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZXMuYXBpS2V5VmF1bHQgPSB7IC4uLmxvY2FsLmFwaUtleVZhdWx0LCBrZXlzOiBtZXJnZWQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBWYXVsdCBkb2NzIChQNCkgLS0tXG4gICAgY29uc3QgbG9jYWxEb2NzID0gbG9jYWwudmF1bHREb2NzIHx8IHt9O1xuICAgIGxldCBkb2NzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG1lcmdlZERvY3MgPSB7IC4uLmxvY2FsRG9jcyB9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCd2YXVsdERvYzonKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRvYyA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghZG9jIHx8ICFkb2MucGF0aCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGxvY2FsRG9jID0gbWVyZ2VkRG9jc1tkb2MucGF0aF07XG4gICAgICAgIGlmICghbG9jYWxEb2MgfHwgKGRvYy51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxEb2MudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICBtZXJnZWREb2NzW2RvYy5wYXRoXSA9IGRvYztcbiAgICAgICAgICAgIGRvY3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9jc0NoYW5nZWQpIHtcbiAgICAgICAgdXBkYXRlcy52YXVsdERvY3MgPSBtZXJnZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVib3VuY2VkIHB1c2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNjaGVkdWxlIGEgc3luYyBwdXNoIHdpdGggYSAyLXNlY29uZCBkZWJvdW5jZS5cbiAqIEV4cG9ydGVkIGZvciB1c2UgYnkgc3RvcmVzIGFuZCB0aGUgc3RvcmFnZSBpbnRlcmNlcHRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlU3luY1B1c2goKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgaWYgKHB1c2hUaW1lcikgY2xlYXJUaW1lb3V0KHB1c2hUaW1lcik7XG4gICAgcHVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1c2hUaW1lciA9IG51bGw7XG4gICAgICAgIHB1c2hUb1N5bmMoKTtcbiAgICB9LCAyMDAwKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmFibGUgLyBkaXNhYmxlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gZGF0YVtMT0NBTF9FTkFCTEVEX0tFWV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiBlbmFibGVkIH0pO1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5pdGlhbGlzYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENhbGxlZCBvbmNlIG9uIHN0YXJ0dXAgKGZyb20gYmFja2dyb3VuZC5qcykuXG4gKiBQdWxscyBmcm9tIHN5bmMsIG1lcmdlcywgdGhlbiBsaXN0ZW5zIGZvciByZW1vdGUgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRTeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBzdG9yYWdlLnN5bmMgbm90IGF2YWlsYWJsZSBcdTIwMTQgc2tpcHBpbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFBsYXRmb3JtIHN5bmMgZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1bGwgKyBtZXJnZVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN5bmNEYXRhID0gYXdhaXQgcHVsbEZyb21TeW5jKCk7XG4gICAgICAgIGlmIChzeW5jRGF0YSkge1xuICAgICAgICAgICAgYXdhaXQgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsK21lcmdlIGNvbXBsZXRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBObyBzeW5jIGRhdGEgZm91bmQgXHUyMDE0IGZyZXNoIHN5bmMnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgcmVtb3RlIGNoYW5nZXNcbiAgICBpZiAoYXBpLnN0b3JhZ2Uub25DaGFuZ2VkKSB7XG4gICAgICAgIGFwaS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcigoY2hhbmdlcywgYXJlYU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmVhTmFtZSAhPT0gJ3N5bmMnKSByZXR1cm47XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBSZW1vdGUgc3luYyBjaGFuZ2UgZGV0ZWN0ZWQnKTtcbiAgICAgICAgICAgIC8vIFJlLXB1bGwgYW5kIG1lcmdlIHRoZSBmdWxsIHN5bmMgZGF0YSB0byBoYW5kbGUgY2h1bmtlZCB2YWx1ZXMgY29ycmVjdGx5XG4gICAgICAgICAgICBwdWxsRnJvbVN5bmMoKS50aGVuKHN5bmNEYXRhID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3luY0RhdGEpIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIG1lcmdlIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIERvIGFuIGluaXRpYWwgcHVzaCBzbyBsb2NhbCBkYXRhIGlzIG1pcnJvcmVkXG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuIiwgIi8qKlxuICogU2VjcmV0IFZhdWx0IFx1MjAxNCBhdC1yZXN0IGVuY3J5cHRpb24gZm9yIHByaXZhdGUga2V5cyBhbmQgYXBwbGljYXRpb24gc2VjcmV0cy5cbiAqXG4gKiBUaHJlYXQgbW9kZWwgKFQwLTQpOiByYXcgc2VjcmV0IGJ5dGVzIG11c3QgbmV2ZXIgc2l0IGluIGJyb3dzZXIgc3RvcmFnZSBpblxuICogY2xlYXJ0ZXh0LCBldmVuIGZvciB0aGUgREVGQVVMVCBwYXNzd29yZGxlc3MgdXNlci4gVGhpcyBtb2R1bGUgcHJvdmlkZXMgdHdvXG4gKiB3cmFwcGluZyBzdHJhdGVnaWVzIGJlaGluZCBvbmUgYHdyYXBTZWNyZXRgIC8gYHVud3JhcFNlY3JldGAgaW50ZXJmYWNlOlxuICpcbiAqICAgMS4gREVWSUNFIEtFWSAoZGVmYXVsdCwgbm8gbWFzdGVyIHBhc3N3b3JkKSBcdTIwMTQgYSBub24tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ01cbiAqICAgICAgQ3J5cHRvS2V5LiBUaHJlZSBwZXJzaXN0ZW5jZSBzdHJhdGVnaWVzIGV4aXN0LCBhbmQgZWFjaCBpcyBWRVJJRklFRFxuICogICAgICAocmVhZCBiYWNrIGFuZCByb3VuZC10cmlwcGVkIHRocm91Z2ggZW5jcnlwdC9kZWNyeXB0KSBiZWZvcmUgaXQgaXNcbiAqICAgICAgdHJ1c3RlZDpcbiAqXG4gKiAgICAgICAgYS4gYGlkYmAgICAgXHUyMDE0IGEgQ3J5cHRvS2V5ICpoYW5kbGUqIGluIEluZGV4ZWREQi4gT25seSBldmVyIEFET1BURUQsXG4gKiAgICAgICAgICAgICAgICAgICAgICBuZXZlciBtaW50ZWQ6IHdlIHRydXN0IGBpZGJgIGV4Y2x1c2l2ZWx5IHdoZW4gZGIuZ2V0KClcbiAqICAgICAgICAgICAgICAgICAgICAgIGhhbmRzIGJhY2sgYSBQUkUtRVhJU1RJTkcga2V5IHRoYXQgcm91bmQtdHJpcHMsIGJlY2F1c2VcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoYXQgXHUyMDE0IGFuZCBvbmx5IHRoYXQgXHUyMDE0IHByb3ZlcyB0aGUgaGFuZGxlIHN1cnZpdmVkIGFcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzIGNvbnRleHQuIEEgc2FtZS1jb250ZXh0IHB1dFx1MjE5MmdldCBwcm9iZSBjYW5ub3RcbiAqICAgICAgICAgICAgICAgICAgICAgIHByb3ZlIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UuIEtlZXBpbmcgdGhlIGFkb3B0IHBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXNlcnZlcyBldmVyeSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3cml0dGVuIGJlZm9yZVxuICogICAgICAgICAgICAgICAgICAgICAgMS44LjEsIHdob3NlIGJsb2JzIGxpdmUgdW5kZXIgdGhpcyBrZXkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAqKk5FVkVSIHVzZWQgYXMgdGhlIHdyYXBwaW5nIGtleSBvbiBTYWZhcmkuKiogRGV2aWNlXG4gKiAgICAgICAgICAgICAgICAgICAgICBmb3JlbnNpY3Mgb24gaVBhZE9TIDI2LjIgKDIwMjYtMDgtMDcpIGZvdW5kIHR3b1xuICogICAgICAgICAgICAgICAgICAgICAgSW5kZXhlZERCIG9yaWdpbiBkaXJlY3RvcmllcyBmb3Igb25lIGV4dGVuc2lvbjogV2ViS2l0XG4gKiAgICAgICAgICAgICAgICAgICAgICBzY29wZXMgZXh0ZW5zaW9uIEluZGV4ZWREQiBieSB0aGUgcGVyLWluc3RhbGxcbiAqICAgICAgICAgICAgICAgICAgICAgIGBzYWZhcmktd2ViLWV4dGVuc2lvbjovLzx1dWlkPmAgT1JJR0lOLCB3aGljaCByb3RhdGVzXG4gKiAgICAgICAgICAgICAgICAgICAgICBhY3Jvc3MgKHJlKWluc3RhbGxzLCB3aGlsZSBgc3RvcmFnZS5sb2NhbGAgaXMgc2NvcGVkIGJ5XG4gKiAgICAgICAgICAgICAgICAgICAgICBCVU5ETEUgSUQgYW5kIHN1cnZpdmVzLiBTbyBvbiBTYWZhcmkgYSB2YXVsdCBjYW4ga2VlcFxuICogICAgICAgICAgICAgICAgICAgICAgaXRzIGRhdGEgYW5kIGxvc2UgaXRzIHdyYXBwaW5nIGtleSBcdTIwMTQgdGhlIGV4YWN0IDEuOC4wXG4gKiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWxvc3Mgc2hhcGUuIFNhZmFyaSB0aGVyZWZvcmUgYWx3YXlzIHdyaXRlcyB1bmRlclxuICogICAgICAgICAgICAgICAgICAgICAgYHNlZWRgOyBhZG9wdGVkIElEQiBrZXlzIGFyZSBkZWNyeXB0LW9ubHkgbGVnYWN5IHRoZXJlLFxuICogICAgICAgICAgICAgICAgICAgICAgYW5kIHRoZSBhdC1yZXN0IG1pZ3JhdGlvbiByZS13cmFwcyBFVkVSWSBkZXZpY2UgYmxvYiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbiBzdG9yZXMgXHUyMDE0IHByb2ZpbGUgcHJpdmF0ZSBrZXlzLCBBUEkta2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzLCB2YXVsdC1ub3RlIGJvZGllcywgYW5kIE5JUC00NiBidW5rZXIgc2Vzc2lvblxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cyAvIHNlc3Npb24gcHJpdmF0ZSBrZXlzIFx1MjAxNCBub3QganVzdCBwcm9maWxlIGtleXMuXG4gKiAgICAgICAgYi4gYHNlZWRgICAgXHUyMDE0IDMyIHJhbmRvbSBieXRlcyBpbiBgYnJvd3Nlci5zdG9yYWdlLmxvY2FsYCB1bmRlclxuICogICAgICAgICAgICAgICAgICAgICAgYGRldmljZUtleVNlZWRgLCBpbXBvcnRlZCBhcyBhIG5vbi1leHRyYWN0YWJsZSBBRVMtR0NNXG4gKiAgICAgICAgICAgICAgICAgICAgICBrZXkgYXQgbG9hZC4gVGhpcyBpcyB3aGVyZSBFVkVSWSBuZXcgZGV2aWNlIGtleSBsYW5kcyxcbiAqICAgICAgICAgICAgICAgICAgICAgIG9uIGV2ZXJ5IHBsYXRmb3JtOiB3aGVuIG5vIHByZS1leGlzdGluZyBJREIga2V5IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICBmb3VuZCB3ZSBkbyBub3QgbWludCBvbmUsIHdlIHNlZWQuIENocm9tZS9GaXJlZm94IGZyZXNoXG4gKiAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxscyB0aGVyZWZvcmUgdXNlIGBzZWVkYCB0b28gXHUyMDE0IG9uZSBjb2RlIHBhdGgsIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIG9ubHkgb25lIHdob3NlIHBlcnNpc3RlbmNlIHdlIGNhbiBhY3R1YWxseSB2ZXJpZnkuXG4gKiAgICAgICAgYy4gYG1lbW9yeWAgXHUyMDE0IGxhc3QgcmVzb3J0ICh1bml0IHRlc3RzLCBzYW5kYm94ZWQgY29udGV4dHMpLiBTZWNyZXRzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVkIGhlcmUgZG8gbm90IHN1cnZpdmUgYSByZWxvYWQuXG4gKlxuICogICAgICBUaGUgcmVzb2x2ZWQgc3RyYXRlZ3kgaXMgU1RJQ0tZOiBpdCBpcyByZWNvcmRlZCBpbiBzdG9yYWdlLmxvY2FsIHVuZGVyXG4gKiAgICAgIGBkZXZpY2VLZXlTdHJhdGVneWAgYW5kIGhvbm91cmVkIG9uIGxhdGVyIGxvYWRzLCBzbyBhIGNvbnRleHQgY2Fubm90XG4gKiAgICAgIHNpbGVudGx5IGZsaXAgc3RyYXRlZ2llcyBhbmQgb3JwaGFuIHRoZSBibG9icyB3cml0dGVuIHVuZGVyIHRoZSBvbGRcbiAqICAgICAgb25lLiBEZWNyeXB0aW9uIGlzIHN5bW1ldHJpYyByZWdhcmRsZXNzOiBgZGVjcnlwdFdpdGhEZXZpY2VLZXlgIHRyaWVzXG4gKiAgICAgIHRoZSBjdXJyZW50IGtleSwgdGhlbiBldmVyeSBvdGhlciBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGV2ZXIgaGF2ZSBoYWRcbiAqICAgICAgKGxlZ2FjeSBJREIgaGFuZGxlLCBleGlzdGluZyBzZWVkKSwgYW5kIGNhbGxlcnMgdXNpbmdcbiAqICAgICAgYGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwYCByZS13cmFwIHVuZGVyIHRoZSBjdXJyZW50IHN0cmF0ZWd5LlxuICpcbiAqICAgICAgVGhyZWF0IG1vZGVsLCBob25lc3RseSBzdGF0ZWQ6IHRoZSBgc2VlZGAgc3RyYXRlZ3kgcHJvdGVjdHMgYWdhaW5zdFxuICogICAgICBjYXN1YWwgaW5zcGVjdGlvbiBvZiBleHRlbnNpb24gc3RvcmFnZSBvbiBkaXNrLCBOT1QgYWdhaW5zdCBhbiBhdHRhY2tlclxuICogICAgICB3aG8gYWxyZWFkeSBleGVjdXRlcyBpbiB0aGlzIGV4dGVuc2lvbidzIGNvbnRleHQgXHUyMDE0IHN1Y2ggYW4gYXR0YWNrZXIgY2FuXG4gKiAgICAgIHJlYWQgdGhlIHNlZWQganVzdCBhcyBpdCBjYW4gcmVhZCBhIENyeXB0b0tleSBoYW5kbGUncyBwbGFpbnRleHQgb3V0cHV0LlxuICogICAgICBBbmQgb24gU2FmYXJpLCB3aGVyZSBgc2VlZGAgaXMgdGhlIE9OTFkgc3RyYXRlZ3ksIHRoZSBzZWVkIGFuZCB0aGVcbiAqICAgICAgY2lwaGVydGV4dCBpdCBvcGVucyBsaXZlIHNpZGUgYnkgc2lkZSBpbiBvbmUgYnVuZGxlLXNjb3BlZFxuICogICAgICBgc3RvcmFnZS5sb2NhbGAgZmlsZSB0aGF0IGlzIHN3ZXB0IGludG8gZGV2aWNlIGJhY2t1cHMgXHUyMDE0IHNvIHRoZVxuICogICAgICBwYXNzd29yZGxlc3MgZGV2aWNlIHRpZXIgdGhlcmUgaXMgb2JmdXNjYXRpb24sIG5vdCBwcm90ZWN0aW9uLCBhZ2FpbnN0XG4gKiAgICAgIGFuIGF0dGFja2VyIGhvbGRpbmcgdGhhdCBmaWxlIG9yIGEgYmFja3VwIGV4dHJhY3RlZCBmcm9tIGl0LiBBXG4gKiAgICAgIEtleWNoYWluLWJhY2tlZCBrZXkgaGFuZGVkIGluIGJ5IHRoZSBuYXRpdmUgY29udGFpbmVyIGlzIHRoZSByZWFsIGZpeFxuICogICAgICAoZnV0dXJlIHdvcmspOyBhIG1hc3RlciBwYXNzd29yZCBpcyB0aGUgZGVmZW5jZSBhdmFpbGFibGUgdG9kYXkuXG4gKlxuICogICAyLiBTRVNTSU9OIEtFWSAobWFzdGVyIHBhc3N3b3JkIHNldCArIHVubG9ja2VkKSBcdTIwMTQgdGhlIEFFUy0yNTYtR0NNIGtleVxuICogICAgICBkZXJpdmVkIGZyb20gdGhlIHBhc3N3b3JkIChzZWUgY3J5cHRvLmpzKS4gU2V0IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlclxuICogICAgICBvbiB1bmxvY2sgdmlhIGBzZXRTZXNzaW9uS2V5YCwgY2xlYXJlZCBvbiBsb2NrIHZpYSBgY2xlYXJTZXNzaW9uYC5cbiAqXG4gKiBCbG9iIGZvcm1hdHMgKGJvdGggYXJlIHNlbGYtZGVzY3JpYmluZyBKU09OIHN0cmluZ3MpOlxuICogICBwYXNzd29yZCBibG9iIDogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9XG4gKiAgIGRldmljZSAgYmxvYiA6IHsgdjoxLCBrOlwiZGV2aWNlXCIsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqXG4gKiBgdW53cmFwU2VjcmV0YCByZWZ1c2VzIHRvIGRlY3J5cHQgd2hlbiB0aGUgc2Vzc2lvbiBoYXMgYmVlbiBleHBsaWNpdGx5IGxvY2tlZFxuICogKEY1L0Y2KSBzbyBhIGxvY2tlZCBwYWdlIGNhbm5vdCByZWFkIHNlY3JldHMuXG4gKi9cblxuaW1wb3J0IHsgZW5jcnlwdFdpdGhLZXksIGRlY3J5cHRXaXRoS2V5IH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuY29uc3QgREVWSUNFX0RCID0gJ25vc3Rya2V5LXNlY3JldC12YXVsdCc7XG5jb25zdCBERVZJQ0VfU1RPUkUgPSAna2V5cyc7XG5jb25zdCBERVZJQ0VfS0VZX0lEID0gJ2RldmljZS13cmFwLWtleS12MSc7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBiYXNlNjQgcmF3IHNlZWQgZm9yIHRoZSBgc2VlZGAgc3RyYXRlZ3kuXG5jb25zdCBERVZJQ0VfU0VFRF9LRVkgPSAnZGV2aWNlS2V5U2VlZCc7XG5jb25zdCBERVZJQ0VfU0VFRF9CWVRFUyA9IDMyO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgU1RJQ0tZIHJlc29sdmVkIHN0cmF0ZWd5ICgnaWRiJyB8ICdzZWVkJykuXG5jb25zdCBERVZJQ0VfU1RSQVRFR1lfS0VZID0gJ2RldmljZUtleVN0cmF0ZWd5JztcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIChrZXB0IGxvY2FsIHNvIHRoaXMgbW9kdWxlIGhhcyBubyBjcm9zcy1kZXBzKSAtLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGFiVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFRvQWIoYjY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIFNlc3Npb24gKHBhc3N3b3JkLWRlcml2ZWQpIGtleSBzdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfc2Vzc2lvbktleSA9IG51bGw7ICAgLy8gQ3J5cHRvS2V5IHwgbnVsbFxubGV0IF9zZXNzaW9uU2FsdCA9IG51bGw7ICAvLyBVaW50OEFycmF5IHwgbnVsbFxuLy8gX3VubG9ja2VkOiBudWxsID0gcGFzc3dvcmRsZXNzIC8gbm90IGFwcGxpY2FibGUgKG5ldmVyIGxvY2tlZCksXG4vLyAgICAgICAgICAgIHRydWUgPSB1bmxvY2tlZCwgZmFsc2UgPSBsb2NrZWQgKHJlZnVzZSBzZWNyZXQgcmVhZHMpLlxubGV0IF91bmxvY2tlZCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uS2V5KGNyeXB0b0tleSwgc2FsdCkge1xuICAgIF9zZXNzaW9uS2V5ID0gY3J5cHRvS2V5O1xuICAgIF9zZXNzaW9uU2FsdCA9IHNhbHQ7XG4gICAgX3VubG9ja2VkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcbiAgICBfc2Vzc2lvbktleSA9IG51bGw7XG4gICAgX3Nlc3Npb25TYWx0ID0gbnVsbDtcbiAgICBfdW5sb2NrZWQgPSBmYWxzZTtcbn1cblxuLyoqIEV4cGxpY2l0bHkgbWFyayB0aGUgc2Vzc2lvbiB1bmxvY2tlZC9sb2NrZWQgd2l0aG91dCBwcm92aWRpbmcgYSBrZXkuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VW5sb2NrZWQodikge1xuICAgIF91bmxvY2tlZCA9IHYgPT09IG51bGwgPyBudWxsIDogISF2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2Vzc2lvbktleSgpIHtcbiAgICByZXR1cm4gISFfc2Vzc2lvbktleTtcbn1cblxuLy8gLS0tIERldmljZSBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG5sZXQgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDsgICAvLyAnaWRiJyB8ICdzZWVkJyB8ICdtZW1vcnknIFx1MjAxNCBzZXQgb25jZSByZXNvbHZlZFxubGV0IF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsOyAgLy8gbGFzdC1yZXNvcnQga2V5IGZvciBjb250ZXh0cyB0aGF0IHBlcnNpc3Qgbm90aGluZ1xubGV0IF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiB0aGUgcHJlLTEuOC4xIElEQiBrZXlcbmxldCBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gYW4gZXhpc3Rpbmcgc2VlZCBrZXlcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZXZpY2VLZXkoKSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlOiByYXcgYnl0ZXMgY2FuIG5ldmVyIGJlIHJlYWQgYmFjayBvdXRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkRGJBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ZWREQiAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92ZSBhIGNhbmRpZGF0ZSBrZXkgaXMgYWN0dWFsbHkgdXNhYmxlIGJlZm9yZSB3ZSB0cnVzdCBhIHN0cmF0ZWd5IHdpdGggYVxuICogdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBBIHJlYWQtYmFjayBoYW5kbGUgdGhhdCBzdHJ1Y3R1cmVkLWNsb25lXG4gKiBtYW5nbGVkIChvciBhIHNlZWQgdGhhdCBjYW1lIGJhY2sgdHJ1bmNhdGVkKSBmYWlscyBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHlcbiAqIHByb2R1Y2luZyB1bmRlY3J5cHRhYmxlIGJsb2JzLlxuICovXG5hc3luYyBmdW5jdGlvbiBrZXlSb3VuZFRyaXBzKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgICAgIGNvbnN0IHByb2JlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdub3N0cmtleS1kZXZpY2UtcHJvYmUnKTtcbiAgICAgICAgY29uc3QgY3QgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgcHJvYmUpO1xuICAgICAgICBjb25zdCBwdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBjdCk7XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocHQpID09PSAnbm9zdHJrZXktZGV2aWNlLXByb2JlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRldmljZURiKCkge1xuICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICBjb25zdCB7IG9wZW5EQiB9ID0gYXdhaXQgaW1wb3J0KCdpZGInKTtcbiAgICByZXR1cm4gb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICB1cGdyYWRlKGQpIHtcbiAgICAgICAgICAgIGlmICghZC5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKERFVklDRV9TVE9SRSkpIHtcbiAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgKGEpOiBBRE9QVCBhIHByZS1leGlzdGluZyBub24tZXh0cmFjdGFibGUgQ3J5cHRvS2V5IGhhbmRsZSBmcm9tXG4gKiBJbmRleGVkREIuIE5ldmVyIG1pbnRzIG9uZS5cbiAqXG4gKiBBIGtleSB0aGF0IGRiLmdldCgpIGhhbmRzIGJhY2sgaXMgYSBrZXkgc29tZSBFQVJMSUVSIGNvbnRleHQgd3JvdGUsIHNvIGl0IGlzXG4gKiBwcm9vZiBvZiBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlIFx1MjAxNCB0aGUgb25lIHRoaW5nIGEgc2FtZS1jb250ZXh0XG4gKiBwdXRcdTIxOTJnZXRcdTIxOTJyb3VuZC10cmlwIHByb2JlIGNhbiBuZXZlciBlc3RhYmxpc2guIGlPUyBTYWZhcmkncyBJbmRleGVkREIgaXNcbiAqIGZ1bmN0aW9uYWwgYnV0IGVwaGVtZXJhbCBmb3IgdGhlIGV4dGVuc2lvbiBiYWNrZ3JvdW5kOiBpdCB3b3VsZCBoYXZlIHBhc3NlZFxuICogdGhlIHByb2JlIGFuZCB0aGVuIGxvc3QgdGhlIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gU286IG5vXG4gKiBwcmUtZXhpc3Rpbmcga2V5IG1lYW5zIG5vIGBpZGJgLCBhbmQgdGhlIGNhbGxlciBzZWVkcyBpbnN0ZWFkLlxuICpcbiAqIFJldHVybnMgbnVsbCAobmV2ZXIgdGhyb3dzKSB3aGVuIG5vdGhpbmcgdXNhYmxlIGlzIHRoZXJlLlxuICovXG5hc3luYyBmdW5jdGlvbiB0cnlJZGJEZXZpY2VLZXkoKSB7XG4gICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuIG51bGw7IC8vIGVtcHR5IHN0b3JlIFx1MjE5MiBzZWVkLCBkbyBOT1QgbWludCBoZXJlXG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhleGlzdGluZykpID8gZXhpc3RpbmcgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHN0b3JhZ2UgYXJlYSBiYWNraW5nIHRoZSBgc2VlZGAgc3RyYXRlZ3kuIEltcG9ydGVkIGxhemlseSBiZWNhdXNlXG4gKiBicm93c2VyLXBvbHlmaWxsIHRocm93cyBhdCBtb2R1bGUgbG9hZCB3aGVuIG5vIGV4dGVuc2lvbiBuYW1lc3BhY2UgZXhpc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWVkU3RvcmFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgcmV0dXJuIGFwaT8uc3RvcmFnZT8ubG9jYWwgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogU2lnbmFsIDI6IGEgV2ViS2l0IHVzZXIgYWdlbnQgd2l0aCBubyBDaHJvbWl1bSBtYXJrZXIgb24gaXQuICovXG5mdW5jdGlvbiBsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdWEgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgJyc7XG4gICAgICAgIHJldHVybiAvU2FmYXJpfEFwcGxlV2ViS2l0Ly50ZXN0KHVhKSAmJiAhL0Nocm9tKGV8aXVtKXxFZGdcXC98T1BSXFwvLy50ZXN0KHVhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcnVlIG9uIFNhZmFyaSAoaU9TICsgbWFjT1MpLCB3aGVyZSBJbmRleGVkREIgbXVzdCBORVZFUiBob2xkIHRoZSB3cmFwcGluZ1xuICoga2V5IFx1MjAxNCBzZWUgdGhlIG1vZHVsZSBoZWFkZXIncyBzdG9yYWdlLXNjb3BlIG5vdGUuXG4gKlxuICogRGV0ZWN0aW9uIGlzIG11bHRpLXNpZ25hbCBhbmQgQklBU0VEIFRPV0FSRCBTQUZBUkksIGJlY2F1c2UgdGhlIHR3byBlcnJvcnNcbiAqIGFyZSBub3Qgc3ltbWV0cmljOiBzZWVkaW5nIGEgQ2hyb21lIHZhdWx0IGNvc3RzIG5vdGhpbmcgKHNlZWQgaXMgYWxyZWFkeSB0aGVcbiAqIHN0cmF0ZWd5IGV2ZXJ5IGZyZXNoIGluc3RhbGwgbGFuZHMgb24pLCB3aGlsZSBJREItd3JhcHBpbmcgYSBTYWZhcmkgdmF1bHQgaXNcbiAqIHRoZSAxLjguMCBkYXRhLWxvc3MgYnVnLiBTbyBvbmx5IGEgUE9TSVRJVkVMWSBpZGVudGlmaWVkIENocm9tZS9GaXJlZm94XG4gKiBvcmlnaW4gbWF5IGFkb3B0IGFuIEluZGV4ZWREQiBrZXkgXHUyMDE0IGEgZ2V0VVJMIHRoYXQgaXMgbWlzc2luZywgdGhyb3dzLCByZXR1cm5zXG4gKiBhIG5vbi1zdHJpbmcsIHJldHVybnMgJycgb3IgcmV0dXJucyBhIHNjaGVtZSB3ZSBkbyBub3QgcmVjb2duaXNlIGFsbCByZXNvbHZlXG4gKiB0byBTYWZhcmkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzU2FmYXJpRW5naW5lKCkge1xuICAgIGxldCBvcmlnaW4gPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICBjb25zdCB1cmwgPSBhcGk/LnJ1bnRpbWU/LmdldFVSTD8uKCcnKTtcbiAgICAgICAgb3JpZ2luID0gdHlwZW9mIHVybCA9PT0gJ3N0cmluZycgPyB1cmwgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBvcmlnaW4gPSBudWxsO1xuICAgIH1cbiAgICAvLyBTaWduYWwgMTogYSBwb3NpdGl2ZWx5IGlkZW50aWZpZWQgU2FmYXJpIG9yaWdpbi5cbiAgICBpZiAob3JpZ2luICYmIG9yaWdpbi5zdGFydHNXaXRoKCdzYWZhcmktd2ViLWV4dGVuc2lvbjovLycpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMjogYSBXZWJLaXQtb25seSBVQSBvdXRyYW5rcyB0aGUgb3JpZ2luIFx1MjAxNCBhIFNhZmFyaSBidWlsZCB0aGF0XG4gICAgLy8gcmVwb3J0ZWQgYW4gdW5leHBlY3RlZCBvcmlnaW4gc3RpbGwgbXVzdCBub3QgdG91Y2ggSW5kZXhlZERCLlxuICAgIGlmIChsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU2lnbmFsIDM6IG9ubHkgdGhlc2UgdHdvIG9yaWdpbnMgZWFybiB0aGUgSURCIGFkb3B0IHBhdGguXG4gICAgaWYgKG9yaWdpbiAmJiAob3JpZ2luLnN0YXJ0c1dpdGgoJ2Nocm9tZS1leHRlbnNpb246Ly8nKSB8fCBvcmlnaW4uc3RhcnRzV2l0aCgnbW96LWV4dGVuc2lvbjovLycpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlOyAvLyBhbWJpZ3VvdXMgXHUyMTkyIHNlZWRcbn1cblxuLyoqIEltcG9ydCByYXcgc2VlZCBieXRlcyAoYmFzZTY0KSBhcyBhIG5vbi1leHRyYWN0YWJsZSBBRVMtR0NNIGtleS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydFNlZWRLZXkoc2VlZEI2NCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsIGJhc2U2NFRvQWIoc2VlZEI2NCksIHsgbmFtZTogJ0FFUy1HQ00nIH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGUgb25jZSBpbXBvcnRlZFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbi8qKiBSZWFkIHRoZSBzdGlja3kgc3RyYXRlZ3kgcmVjb3JkZWQgYnkgYSBwcmV2aW91cyByZXNvbHV0aW9uIChudWxsIGlmIG5vbmUpLiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFN0aWNreVN0cmF0ZWd5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NUUkFURUdZX0tFWV06IG51bGwgfSk7XG4gICAgICAgIGNvbnN0IHMgPSBnb3Q/LltERVZJQ0VfU1RSQVRFR1lfS0VZXTtcbiAgICAgICAgcmV0dXJuIChzID09PSAnaWRiJyB8fCBzID09PSAnc2VlZCcpID8gcyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqIFJlY29yZCB0aGUgcmVzb2x2ZWQgc3RyYXRlZ3kgc28gbGF0ZXIgbG9hZHMgY2Fubm90IHNpbGVudGx5IGZsaXAgaXQuICovXG5hc3luYyBmdW5jdGlvbiB3cml0ZVN0aWNreVN0cmF0ZWd5KHN0cmF0ZWd5KSB7XG4gICAgaWYgKHN0cmF0ZWd5ICE9PSAnaWRiJyAmJiBzdHJhdGVneSAhPT0gJ3NlZWQnKSByZXR1cm47IC8vICdtZW1vcnknIHBlcnNpc3RzIG5vdGhpbmdcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHN0b3JlLnNldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogc3RyYXRlZ3kgfSk7XG4gICAgfSBjYXRjaCB7IC8qIGJlc3QgZWZmb3J0IFx1MjAxNCB0aGUgc3RyYXRlZ3kgc3RpbGwgcmVzb2x2ZXMgdGhlIHNhbWUgd2F5ICovIH1cbn1cblxuLyoqIFN0cmF0ZWd5IChiKTogYSByYXcgcmFuZG9tIHNlZWQgaW4gc3RvcmFnZS5sb2NhbCwgaW1wb3J0ZWQgbm9uLWV4dHJhY3RhYmxlLiAqL1xuYXN5bmMgZnVuY3Rpb24gdHJ5U2VlZERldmljZUtleSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgIGxldCBzZWVkID0gZ290Py5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgaWYgKCFzZWVkKSB7XG4gICAgICAgICAgICBzZWVkID0gYWJUb0Jhc2U2NChjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KERFVklDRV9TRUVEX0JZVEVTKSkuYnVmZmVyKTtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JlLnNldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBzZWVkIH0pO1xuICAgICAgICAgICAgLy8gVkVSSUZZIHBlcnNpc3RlbmNlIGJlZm9yZSBhbnl0aGluZyBpcyB3cmFwcGVkIHVuZGVyIGl0LlxuICAgICAgICAgICAgY29uc3QgY2hlY2sgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBlcnNpc3RlZCA9IGNoZWNrPy5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgICAgIGlmIChwZXJzaXN0ZWQgIT09IHNlZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBBbm90aGVyIGNvbnRleHQgKHBvcHVwIHZzIGJhY2tncm91bmQgb24gYSBmaXJzdCBydW4pIG1pbnRlZFxuICAgICAgICAgICAgICAgIC8vIGFuZCB3cm90ZSBpdHMgb3duIHNlZWQgYmV0d2VlbiBvdXIgc2V0KCkgYW5kIHRoaXMgcmVhZC4gQURPUFRcbiAgICAgICAgICAgICAgICAvLyBUSEUgV0lOTkVSOiBhbnkgc2VlZCBhY3R1YWxseSBpbiBzdG9yYWdlIGlzIGV4YWN0bHkgYXMgZ29vZCBhc1xuICAgICAgICAgICAgICAgIC8vIG91cnMsIGFuZCBpdCBpcyB0aGUgb25lIHRoZSBvdGhlciBjb250ZXh0IGlzIGFscmVhZHkgd3JhcHBpbmdcbiAgICAgICAgICAgICAgICAvLyB1bmRlci4gUmV0dXJuaW5nIG51bGwgaGVyZSB3b3VsZCBkcm9wIHRoZSBjYWxsZXIgdGhyb3VnaCB0b1xuICAgICAgICAgICAgICAgIC8vIHRoZSBtZW1vcnkga2V5LCB3aG9zZSBibG9icyBkaWUgd2l0aCB0aGlzIGNvbnRleHQgXHUyMDE0IHRoZSB2ZXJ5XG4gICAgICAgICAgICAgICAgLy8gbG9zcyB0aGlzIHN0cmF0ZWd5IGV4aXN0cyB0byBwcmV2ZW50LiBPbmx5IGEgZ2VudWluZWx5IGFic2VudFxuICAgICAgICAgICAgICAgIC8vIG9yIHVudXNhYmxlIHZhbHVlIGlzIGEgZmFpbHVyZS5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBlcnNpc3RlZCAhPT0gJ3N0cmluZycgfHwgcGVyc2lzdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgc2VlZCA9IHBlcnNpc3RlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbXBvcnRTZWVkS2V5KHNlZWQpO1xuICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0IChjcmVhdGluZyBvbiBmaXJzdCB1c2UpIHRoZSBkZXZpY2Ugd3JhcCBrZXkuXG4gKlxuICogUmVzb2x1dGlvbiBvcmRlciwgb25jZTogaG9ub3VyIHRoZSBzdGlja3kgc3RyYXRlZ3kgdGhpcyBpbnN0YWxsIGFscmVhZHlcbiAqIHJlY29yZGVkOyBvdGhlcndpc2UgQURPUFQgYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGtleSBpZiBvbmUgaXMgdGhlcmUsIGFuZFxuICogZmFpbGluZyB0aGF0IHNlZWQuIFdoYXRldmVyIHJlc29sdmVzIGlzIHdyaXR0ZW4gYmFjayBhcyB0aGUgc3RpY2t5IHN0cmF0ZWd5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5KCkge1xuICAgIGlmIChfZGV2aWNlS2V5UHJvbWlzZSkgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RpY2t5ID0gYXdhaXQgcmVhZFN0aWNreVN0cmF0ZWd5KCk7XG5cbiAgICAgICAgLy8gQSB2YXVsdCBhbHJlYWR5IG9uIGBzZWVkYCBuZXZlciByZS1wcm9iZXMgSW5kZXhlZERCOiBpdHMgYmxvYnMgYXJlXG4gICAgICAgIC8vIHVuZGVyIHRoZSBzZWVkIGtleSwgYW5kIGFkb3B0aW5nIGEgc3RyYXkgSURCIGhhbmRsZSB3b3VsZCBvcnBoYW4gdGhlbS5cbiAgICAgICAgLy8gT24gU2FmYXJpIHdlIG5ldmVyIFdSSVRFIHVuZGVyIGFuIElEQiBrZXkgYXQgYWxsIChzZWUgaGVhZGVyKTogdGhlXG4gICAgICAgIC8vIGV4dGVuc2lvbidzIEluZGV4ZWREQiBpcyBvcmlnaW4tc2NvcGVkIGFuZCB0aGUgb3JpZ2luIHJvdGF0ZXMgYWNyb3NzXG4gICAgICAgIC8vIGluc3RhbGxzLCB3aGlsZSBzdG9yYWdlLmxvY2FsIGlzIGJ1bmRsZS1zY29wZWQgYW5kIHN1cnZpdmVzLiBFeGlzdGluZ1xuICAgICAgICAvLyBJREIgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0IGZhbGxiYWNrIGFuZCBhcmUgcmUtd3JhcHBlZFxuICAgICAgICAvLyB1bmRlciB0aGUgc2VlZCBieSB0aGUgYXQtcmVzdCBtaWdyYXRpb24uXG4gICAgICAgIGlmIChzdGlja3kgIT09ICdzZWVkJyAmJiAhKGF3YWl0IGlzU2FmYXJpRW5naW5lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBpZGJLZXkgPSBhd2FpdCB0cnlJZGJEZXZpY2VLZXkoKTtcbiAgICAgICAgICAgIGlmIChpZGJLZXkpIHtcbiAgICAgICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnaWRiJztcbiAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdpZGInKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWRiS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IHRyeVNlZWREZXZpY2VLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIHtcbiAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdzZWVkJztcbiAgICAgICAgICAgIC8vIEFsc28gY292ZXJzIHRoZSBkZWdyYWRlIGNhc2U6IHN0aWNreSB3YXMgJ2lkYicgYnV0IHRoZSBoYW5kbGUgaXNcbiAgICAgICAgICAgIC8vIGdvbmUuIE9sZCBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHQgZmFsbGJhY2sgYmVsb3cuXG4gICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdzZWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc2VlZEtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGhpbmcgcGVyc2lzdHMgaGVyZS4gQmV0dGVyIHRoYW4gcmVmdXNpbmcgdG8gZW5jcnlwdCwgYnV0IGJsb2JzXG4gICAgICAgIC8vIHdyaXR0ZW4gdW5kZXIgdGhpcyBrZXkgZGllIHdpdGggdGhlIGNvbnRleHQgXHUyMDE0IHNlZSBtb2R1bGUgaGVhZGVyLlxuICAgICAgICBpZiAoIV9tZW1vcnlEZXZpY2VLZXkpIF9tZW1vcnlEZXZpY2VLZXkgPSBhd2FpdCBnZW5lcmF0ZURldmljZUtleSgpO1xuICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnbWVtb3J5JztcbiAgICAgICAgcmV0dXJuIF9tZW1vcnlEZXZpY2VLZXk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG59XG5cbi8qKiBXaGljaCBwZXJzaXN0ZW5jZSBzdHJhdGVneSB0aGUgZGV2aWNlIGtleSByZXNvbHZlZCB0byAobnVsbCB1bnRpbCByZXNvbHZlZCkuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5U3RyYXRlZ3koKSB7XG4gICAgcmV0dXJuIF9kZXZpY2VTdHJhdGVneTtcbn1cblxuLyoqXG4gKiBEcm9wIGV2ZXJ5IG1lbW9pc2VkIGRldmljZS1rZXkgaGFuZGxlLiBNVVNUIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBhbnlcbiAqIGBzdG9yYWdlLmNsZWFyKClgOiB0aGUgc2VlZCAoYW5kIHRoZSBzdGlja3kgc3RyYXRlZ3kpIGFyZSBnb25lIGZyb20gc3RvcmFnZSxcbiAqIHNvIGEgY2FjaGVkIHByb21pc2Ugd291bGQga2VlcCBoYW5kaW5nIG91dCBhIGtleSB3aG9zZSBiYWNraW5nIG1hdGVyaWFsIG5vXG4gKiBsb25nZXIgZXhpc3RzIFx1MjAxNCB0aGUgbmV4dCBnZXREZXZpY2VLZXkoKSB3b3VsZCB3cmFwIHNlY3JldHMgdW5kZXIgYSBrZXkgdGhhdFxuICogZGllcyB3aXRoIHRoaXMgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGV2aWNlS2V5KCkge1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsO1xuICAgIF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byBhIHByZS1leGlzdGluZyBJbmRleGVkREIgZGV2aWNlIGtleSwgdXNlZCBvbmx5IGFzIGFcbiAqIGRlY3J5cHQgZmFsbGJhY2sgZm9yIGJsb2JzIHdyaXR0ZW4gYmVmb3JlIHRoaXMgY29udGV4dCBjaGFuZ2VkIHN0cmF0ZWd5LlxuICogTmV2ZXIgY3JlYXRlcyBvbmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldExlZ2FjeUlkYktleSgpIHtcbiAgICBpZiAoX2xlZ2FjeUlkYktleVByb21pc2UpIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghaW5kZXhlZERiQXZhaWxhYmxlKCkpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gdGhlIGtleSBhbiBFWElTVElORyBgZGV2aWNlS2V5U2VlZGAgaW1wb3J0cyB0bywgdXNlZCBvbmx5XG4gKiBhcyBhIGRlY3J5cHQgZmFsbGJhY2suIE5ldmVyIG1pbnRzIGEgc2VlZCAodGhhdCBpcyB0cnlTZWVkRGV2aWNlS2V5J3Mgam9iKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0RXhpc3RpbmdTZWVkS2V5KCkge1xuICAgIGlmIChfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSkgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgICAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3Qgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAoIXNlZWQpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBFdmVyeSBPVEhFUiBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGhhdmUgd3JhcHBlZCBhIGRldmljZSBibG9iIHVuZGVyLCBpblxuICogcHJlZmVyZW5jZSBvcmRlci4gU3RyYXRlZ3kgZmxpcHMgKGlkYlx1MjE5MnNlZWQgb24gZGVncmFkZSwgc2VlZFx1MjE5MmlkYiBvbiBhblxuICogYWRvcHRlZCBoYW5kbGUpIG11c3QgbmV2ZXIgb3JwaGFuIGEgYmxvYiwgc28gdGhlIGZhbGxiYWNrIGlzIHN5bW1ldHJpYzogYVxuICogc2VlZCBibG9iIHN0YXlzIHJlYWRhYmxlIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyBhbmQgdmljZSB2ZXJzYS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmFsbGJhY2tEZXZpY2VLZXlzKCkge1xuICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnaWRiJykge1xuICAgICAgICBjb25zdCBsZWdhY3kgPSBhd2FpdCBnZXRMZWdhY3lJZGJLZXkoKTtcbiAgICAgICAgaWYgKGxlZ2FjeSkga2V5cy5wdXNoKGxlZ2FjeSk7XG4gICAgfVxuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdzZWVkJykge1xuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgZ2V0RXhpc3RpbmdTZWVkS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSBrZXlzLnB1c2goc2VlZEtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiB3aXRoIHRoZSBjdXJyZW50IGtleSwgZmFsbGluZyBiYWNrIHRvIGV2ZXJ5IG90aGVyIGtleVxuICogdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZC4gUmV0dXJucyB0aGUgcGxhaW50ZXh0IHBsdXMgd2hldGhlciBhIGZhbGxiYWNrIGtleVxuICogd2FzIG5lZWRlZCAoaS5lLiB0aGUgYmxvYiBpcyBzdGFsZSBhbmQgd29ydGggcmUtd3JhcHBpbmcpLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpLCBzdGFsZTogZmFsc2UgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmFsbGJhY2sgb2YgYXdhaXQgZmFsbGJhY2tEZXZpY2VLZXlzKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoZmFsbGJhY2ssIGl2LCBjaXBoZXJ0ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgc3RhbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiB0cnkgdGhlIG5leHQgb25lICovIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlOyAvLyByZXBvcnQgdGhlIENVUlJFTlQga2V5J3MgZmFpbHVyZSwgbm90IHRoZSBsYXN0IGZhbGxiYWNrJ3NcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBlbmMuZW5jb2RlKHBsYWludGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2OiAxLFxuICAgICAgICBrOiAnZGV2aWNlJyxcbiAgICAgICAgaXY6IGFiVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhYlRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQWIoaXYpKSB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGJhc2U2NFRvQWIoY2lwaGVydGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoRGV2aWNlS2V5KGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIC8vIEdDTSBhdXRoZW50aWNhdGlvbiBjYW4gZmFpbCB3aXRoIHRoZSBDVVJSRU5UIHN0cmF0ZWd5J3Mga2V5IGJlY2F1c2UgdGhlXG4gICAgLy8gYmxvYiBwcmVkYXRlcyBhIHN0cmF0ZWd5IGNoYW5nZSAoYSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3aG9zZSBJREIgaGFuZGxlXG4gICAgLy8gaXMgc3RpbGwgcmVhZGFibGUgd2hpbGUgdGhpcyBjb250ZXh0IHNldHRsZWQgb24gdGhlIHNlZWQsIG9yIHRoZSByZXZlcnNlKS5cbiAgICAvLyBUcnkgZXZlcnkga2V5IHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQgYmVmb3JlIGRlY2xhcmluZyB0aGUgc2VjcmV0IGxvc3QuXG4gICAgY29uc3QgeyBwbGFpbnRleHQgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4gcGxhaW50ZXh0O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiBhbmQsIHdoZW4gaXQgY291bGQgb25seSBiZSByZWFkIHZpYSBhIGZhbGxiYWNrIGtleVxuICogKGxlZ2FjeSBJbmRleGVkREIgaGFuZGxlLCBvciBhbiBleGlzdGluZyBzZWVkIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyksXG4gKiBoYW5kIGJhY2sgYSByZXBsYWNlbWVudCBibG9iIHdyYXBwZWQgdW5kZXIgdGhlIENVUlJFTlQgc3RyYXRlZ3kgc28gdGhlIGNhbGxlclxuICogY2FuIHBlcnNpc3QgdGhlIHVwZ3JhZGUgb3Bwb3J0dW5pc3RpY2FsbHkuXG4gKiBgcmV3cmFwcGVkYCBpcyBudWxsIHdoZW4gdGhlIGJsb2IgaXMgYWxyZWFkeSBjdXJyZW50LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXAoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgeyBwbGFpbnRleHQsIHN0YWxlIH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGxhaW50ZXh0LFxuICAgICAgICByZXdyYXBwZWQ6IHN0YWxlID8gYXdhaXQgZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSA6IG51bGwsXG4gICAgfTtcbn1cblxuLy8gLS0tIEJsb2IgY2xhc3NpZmljYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBmdW5jdGlvbiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLnNhbHQgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQgJiYgcC5rICE9PSAnZGV2aWNlJyk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuayA9PT0gJ2RldmljZScgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuLyoqIFRydWUgaWYgdGhlIHZhbHVlIGlzIGFscmVhZHkgY2lwaGVydGV4dCAoZWl0aGVyIHdyYXBwaW5nKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NpcGhlcnRleHQodmFsdWUpIHtcbiAgICByZXR1cm4gaXNQYXNzd29yZEJsb2IodmFsdWUpIHx8IGlzRGV2aWNlS2V5QmxvYih2YWx1ZSk7XG59XG5cbi8vIC0tLSBVbmlmaWVkIHdyYXAgLyB1bndyYXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHNlY3JldCBmb3IgYXQtcmVzdCBzdG9yYWdlLiBQcmVmZXJzIHRoZSBwYXNzd29yZC1kZXJpdmVkIHNlc3Npb25cbiAqIGtleSB3aGVuIG9uZSBpcyBhdmFpbGFibGUgaW4gdGhpcyBjb250ZXh0IChiYWNrZ3JvdW5kLCB1bmxvY2tlZCk7IG90aGVyd2lzZVxuICogZmFsbHMgYmFjayB0byB0aGUgYWx3YXlzLWF2YWlsYWJsZSBkZXZpY2Uga2V5LiBOZXZlciByZXR1cm5zIHBsYWludGV4dC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBTZWNyZXQocGxhaW50ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBwbGFpbnRleHQgIT09ICdzdHJpbmcnIHx8IHBsYWludGV4dC5sZW5ndGggPT09IDApIHJldHVybiBwbGFpbnRleHQ7XG4gICAgaWYgKGlzQ2lwaGVydGV4dChwbGFpbnRleHQpKSByZXR1cm4gcGxhaW50ZXh0OyAvLyBhbHJlYWR5IHdyYXBwZWQgXHUyMDE0IGRvbid0IGRvdWJsZS13cmFwXG4gICAgaWYgKF9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHJldHVybiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIF9zZXNzaW9uS2V5LCBfc2Vzc2lvblNhbHQpO1xuICAgIH1cbiAgICByZXR1cm4gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGFuIGF0LXJlc3Qgc2VjcmV0LiBSZWZ1c2VzIHdoZW4gdGhlIHNlc3Npb24gaXMgZXhwbGljaXRseSBsb2NrZWQuXG4gKiBMZWdhY3kgcGxhaW50ZXh0IHZhbHVlcyBhcmUgcmV0dXJuZWQgdW5jaGFuZ2VkICh0cmFuc2l0aW9uYWwgXHUyMDE0IGNhbGxlcnMgc2hvdWxkXG4gKiByZS13cmFwIG9uIG5leHQgd3JpdGU7IHNlZSBtaWdyYXRpb24gcGF0aHMpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdW53cmFwU2VjcmV0KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgdmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKCFpc0NpcGhlcnRleHQodmFsdWUpKSByZXR1cm4gdmFsdWU7IC8vIGxlZ2FjeSBwbGFpbnRleHQgcGFzc3Rocm91Z2hcbiAgICBpZiAoX3VubG9ja2VkID09PSBmYWxzZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2tlZDogc2Vzc2lvbiBpcyBsb2NrZWQgXHUyMDE0IGNhbm5vdCByZWFkIHNlY3JldCcpO1xuICAgIH1cbiAgICBpZiAoaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdFdpdGhEZXZpY2VLZXkodmFsdWUpO1xuICAgIH1cbiAgICAvLyBwYXNzd29yZCBibG9iXG4gICAgaWYgKCFfc2Vzc2lvbktleSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2tlZDogbm8gc2Vzc2lvbiBrZXkgYXZhaWxhYmxlIHRvIGRlY3J5cHQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0V2l0aEtleSh2YWx1ZSwgX3Nlc3Npb25LZXkpO1xufVxuIiwgIi8qKlxuICogRW5jcnlwdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5IG1hc3RlciBwYXNzd29yZCBmZWF0dXJlLlxuICpcbiAqIFVzZXMgV2ViIENyeXB0byBBUEkgKGNyeXB0by5zdWJ0bGUpIGV4Y2x1c2l2ZWx5IFx1MjAxNCBubyBleHRlcm5hbCBsaWJyYXJpZXMuXG4gKiAtIFBCS0RGMiB3aXRoIDYwMCwwMDAgaXRlcmF0aW9ucyAoT1dBU1AgMjAyMyByZWNvbW1lbmRhdGlvbilcbiAqIC0gQUVTLTI1Ni1HQ00gZm9yIGF1dGhlbnRpY2F0ZWQgZW5jcnlwdGlvblxuICogLSBSYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpIHBlciBvcGVyYXRpb25cbiAqIC0gQWxsIGJpbmFyeSBkYXRhIGVuY29kZWQgYXMgYmFzZTY0IGZvciBKU09OIHN0b3JhZ2UgY29tcGF0aWJpbGl0eVxuICovXG5cbmNvbnN0IFBCS0RGMl9JVEVSQVRJT05TID0gNjAwXzAwMDtcbmNvbnN0IFNBTFRfQllURVMgPSAxNjtcbmNvbnN0IElWX0JZVEVTID0gMTI7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBLZXkgZGVyaXZhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBEZXJpdmUgYW4gQUVTLTI1Ni1HQ00gQ3J5cHRvS2V5IGZyb20gYSBwYXNzd29yZCBhbmQgc2FsdCB1c2luZyBQQktERjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcnxVaW50OEFycmF5fSBzYWx0IC0gMTYtYnl0ZSBzYWx0XG4gKiBAcGFyYW0ge3tleHRyYWN0YWJsZT86IGJvb2xlYW59fSBbb3B0aW9uc10gLSBgZXh0cmFjdGFibGU6IHRydWVgIGFsbG93cyB0aGVcbiAqICAgICAgICByYXcgYnl0ZXMgdG8gYmUgZXhwb3J0ZWQgb25jZSAoc2VlIGV4cG9ydEtleUJhc2U2NCkuIFVzZWQgYnkgdGhlXG4gKiAgICAgICAgYmFja2dyb3VuZCB3b3JrZXIgc28gYW4gdW5sb2NrZWQgc2Vzc2lvbiBjYW4gYmUgcGFya2VkIGluXG4gKiAgICAgICAgc3RvcmFnZS5zZXNzaW9uIGFuZCBmdWxseSByZXN0b3JlZCBhZnRlciBhbiBNVjMgZXZpY3Rpb24uIERlZmF1bHRcbiAqICAgICAgICBmYWxzZTogdGhlIGtleSBpcyBvcGFxdWUgYW5kIGNhbm5vdCBsZWF2ZSB0aGUgY3J5cHRvIHN1YnN5c3RlbS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59IEFFUy0yNTYtR0NNIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0LCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVLZXknXVxuICAgICk7XG5cbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5kZXJpdmVLZXkoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdDogc2FsdCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBzYWx0IDogbmV3IFVpbnQ4QXJyYXkoc2FsdCksXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICAhIW9wdGlvbnMuZXh0cmFjdGFibGUsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vKipcbiAqIEV4cG9ydCBhbiBleHRyYWN0YWJsZSBBRVMga2V5J3MgcmF3IGJ5dGVzIGFzIGJhc2U2NC5cbiAqIE9ubHkgZXZlciBjYWxsZWQgb24gYSBrZXkgZGVyaXZlZCB3aXRoIGB7IGV4dHJhY3RhYmxlOiB0cnVlIH1gLlxuICpcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IGJhc2U2NCByYXcga2V5IGJ5dGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRLZXlCYXNlNjQoa2V5KSB7XG4gICAgcmV0dXJuIGFycmF5QnVmZmVyVG9CYXNlNjQoYXdhaXQgY3J5cHRvLnN1YnRsZS5leHBvcnRLZXkoJ3JhdycsIGtleSkpO1xufVxuXG4vKipcbiAqIEltcG9ydCBiYXNlNjQgcmF3IGJ5dGVzIGJhY2sgaW50byBhIE5PTi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTSBrZXkuXG4gKiBUaGUgY291bnRlcnBhcnQgb2YgZXhwb3J0S2V5QmFzZTY0OiB3aGF0ZXZlciB3ZW50IG91dCBleHRyYWN0YWJsZSBjb21lcyBiYWNrXG4gKiBvcGFxdWUsIHNvIGEgcmVzdG9yZWQgc2Vzc2lvbiBrZXkgY2Fubm90IGJlIHJlLWV4cG9ydGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlNjQgLSByYXcga2V5IGJ5dGVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW1wb3J0S2V5QmFzZTY0KGJhc2U2NCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vKiogYmFzZTY0IFx1MjE5NCBieXRlcywgZXhwb3J0ZWQgc28gY2FsbGVycyBjYW4gcm91bmQtdHJpcCBhIHNhbHQgdGhyb3VnaCBKU09OLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpIHtcbiAgICAvLyBgbmV3IFVpbnQ4QXJyYXkodmlldylgIGluc2lkZSB0aGUgaGVscGVyIGNvcGllcyB0aGUgVklFVywgc28gYSBzYWx0IHRoYXRcbiAgICAvLyBpcyBhIHdpbmRvdyBpbnRvIGEgbGFyZ2VyIGJ1ZmZlciBzdGlsbCBlbmNvZGVzIGNvcnJlY3RseS5cbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChieXRlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J5dGVzKGJhc2U2NCkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkpO1xufVxuXG4vLyAtLS0gRW5jcnlwdCB3aXRoIHByZS1kZXJpdmVkIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgYW5kIGl0cyBzYWx0LlxuICpcbiAqIFRoaXMgYXZvaWRzIGhvbGRpbmcgdGhlIHJhdyBwYXNzd29yZCBpbiBtZW1vcnkgXHUyMDE0IHRoZSBjYWxsZXIgZGVyaXZlcyB0aGVcbiAqIGtleSBvbmNlICh2aWEgZGVyaXZlS2V5KSBhbmQgcmV1c2VzIGl0IGZvciB0aGUgc2Vzc2lvbi4gIFRoZSBvdXRwdXRcbiAqIGZvcm1hdCBpcyBpZGVudGljYWwgdG8gZW5jcnlwdCgpLCBzbyBkZWNyeXB0KCkgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aFxuICogdGhlIG9yaWdpbmFsIHBhc3N3b3JkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgICAgICAgICAgLSBUaGUgZGF0YSB0byBlbmNyeXB0XG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5IGZyb20gZGVyaXZlS2V5KClcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdCAgICAgICAgICAgLSBUaGUgc2FsdCB0aGF0IHdhcyB1c2VkIHRvIGRlcml2ZSBga2V5YFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwga2V5LCBzYWx0KSB7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgLyBEZWNyeXB0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHdpdGggYSBwYXNzd29yZC5cbiAqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpLCBkZXJpdmVzIGFuXG4gKiBBRVMtMjU2LUdDTSBrZXkgdmlhIFBCS0RGMiwgYW5kIHJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nXG4gKiBiYXNlNjQtZW5jb2RlZCBzYWx0LCBpdiwgYW5kIGNpcGhlcnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAtIFRoZSBkYXRhIHRvIGVuY3J5cHQgKGUuZy4gaGV4IHByaXZhdGUga2V5KVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dCwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KTtcblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IChpZ25vcmVzIHRoZSBzYWx0IGVtYmVkZGVkIGluIHRoZVxuICogYmxvYiBcdTIwMTQgdGhlIGNhbGxlciBtdXN0IHN1cHBseSBhIGtleSB0aGF0IG1hdGNoZXMgaG93IHRoZSBibG9iIHdhcyBlbmNyeXB0ZWQpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KCkvZW5jcnlwdFdpdGhLZXkoKVxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoS2V5KGVuY3J5cHRlZERhdGEsIGtleSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB0aGF0IHdhcyBlbmNyeXB0ZWQgd2l0aCBgZW5jcnlwdCgpYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAgICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFzc3dvcmQgaXMgd3Jvbmcgb3IgZGF0YSBpcyB0YW1wZXJlZCB3aXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcblxuICAgIGNvbnN0IHNhbHRCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHRCdWYpO1xuXG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICByZXR1cm4gZGVjLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8vIC0tLSBQYXNzd29yZCBoYXNoaW5nIChmb3IgdmVyaWZpY2F0aW9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBIYXNoIGEgcGFzc3dvcmQgd2l0aCBQQktERjIgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIHByb2R1Y2VzIGEgc2VwYXJhdGUgaGFzaCAobm90IHRoZSBlbmNyeXB0aW9uIGtleSkgdGhhdCBjYW4gYmUgc3RvcmVkXG4gKiB0byB2ZXJpZnkgdGhlIHBhc3N3b3JkIHdpdGhvdXQgbmVlZGluZyB0byBhdHRlbXB0IGRlY3J5cHRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtVaW50OEFycmF5fSBbc2FsdF0gLSBPcHRpb25hbCBzYWx0OyBnZW5lcmF0ZWQgaWYgb21pdHRlZFxuICogQHJldHVybnMge1Byb21pc2U8eyBoYXNoOiBzdHJpbmcsIHNhbHQ6IHN0cmluZyB9Pn0gYmFzZTY0LWVuY29kZWQgaGFzaCBhbmQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBzYWx0ID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlQml0cyddXG4gICAgKTtcblxuICAgIGNvbnN0IGhhc2hCaXRzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIDI1NlxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBoYXNoOiBhcnJheUJ1ZmZlclRvQmFzZTY0KGhhc2hCaXRzKSxcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgYSBzdG9yZWQgaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAtIFRoZSBwYXNzd29yZCB0byB2ZXJpZnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRIYXNoIC0gYmFzZTY0LWVuY29kZWQgaGFzaCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkU2FsdCAtIGJhc2U2NC1lbmNvZGVkIHNhbHQgZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFRydWUgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRIYXNoLCBzdG9yZWRTYWx0KSB7XG4gICAgY29uc3QgeyBoYXNoIH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZFNhbHQpO1xuICAgIHJldHVybiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChoYXNoLCBzdG9yZWRIYXNoKTtcbn1cblxuLyoqXG4gKiBDb25zdGFudC10aW1lIGNvbXBhcmlzb24gb2YgdHdvIGJhc2U2NC1lbmNvZGVkIGJ5dGUgc3RyaW5ncy5cbiAqXG4gKiBEZWNvZGVzIGJvdGggdG8gcmF3IGJ5dGVzIGFuZCBjb21wYXJlcyB3aXRoIGFuIGFjY3VtdWxhdG9yIHNvIHRoZSBydW5uaW5nXG4gKiB0aW1lIGRvZXMgbm90IGRlcGVuZCBvbiB3aGVyZSB0aGUgZmlyc3QgbWlzbWF0Y2ggb2NjdXJzIFx1MjAxNCB0aGlzIGF2b2lkcyB0aGVcbiAqIHRpbWluZyBzaWRlLWNoYW5uZWwgb2YgYSBwbGFpbiBgPT09YCBzdHJpbmcgY29tcGFyZSAoVGllci0zIGNyeXB0by5qczoyMTMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoYSwgYikge1xuICAgIGxldCBiYSwgYmI7XG4gICAgdHJ5IHtcbiAgICAgICAgYmEgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGEpKTtcbiAgICAgICAgYmIgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGIpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBDb21wYXJlIHRoZSBtYXggbGVuZ3RoIHNvIGxlbmd0aCBkaWZmZXJlbmNlcyBkb24ndCBzaG9ydC1jaXJjdWl0IGVhcmx5LlxuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KGJhLmxlbmd0aCwgYmIubGVuZ3RoKTtcbiAgICBsZXQgZGlmZiA9IGJhLmxlbmd0aCBeIGJiLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRpZmYgfD0gKGJhW2ldIHx8IDApIF4gKGJiW2ldIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQ0EsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FB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QUFLLFFBQVMsR0FBRSxjQUFjO0FBQy9ELFVBQU0sSUFBSSxFQUFFLG1CQUFtQjtBQUFHLFFBQUksS0FBSyxPQUFRLEdBQUUsY0FBYztBQUNuRSxPQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDL0IsWUFBTSxNQUFNLElBQUksUUFBUSxPQUFPLHdCQUF3QjtBQUN2RCxhQUFPLEtBQUssS0FBSyxrQkFBa0I7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUVBLGlCQUFlLE9BQU87QUFFbEIsVUFBTSxjQUFjLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN6RSxVQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2pFLFVBQU0sT0FBTyxFQUFFLG1CQUFtQjtBQUNsQyxVQUFNLE9BQU8sRUFBRSxvQkFBb0I7QUFFbkMsUUFBSSxDQUFDLGFBQWE7QUFHZCxrQkFBWSxJQUFJO0FBQ2hCLGVBQVMsTUFBTSxNQUFNLENBQUMsQ0FBQztBQUN2QjtBQUFBLElBQ0o7QUFFQSxRQUFJLFFBQVE7QUFFUixrQkFBWSxLQUFLO0FBQ2pCLGVBQVMsTUFBTSxNQUFNO0FBQUEsUUFDakIsT0FBTztBQUFBLFFBQ1AsU0FBUztBQUFBLFFBQ1QsUUFBUTtBQUFBLE1BQ1osQ0FBQztBQUNEO0FBQUEsSUFDSjtBQUVBLGdCQUFZLElBQUk7QUFDaEIsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBQy9CLFFBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUUvQixVQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEUsVUFBTSxZQUFZLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRTtBQUNsRCxVQUFNLGNBQWMsTUFBTUMsZUFBYztBQUN4QyxVQUFNLE9BQU8sTUFBTSxZQUFZO0FBRS9CLGVBQVc7QUFDWCxXQUFPO0FBRVAsUUFBSSxNQUFNLGVBQWUsVUFBVSxHQUFHO0FBQ2xDLFlBQU0sUUFBUTtBQUFBLElBQ2xCO0FBQUEsRUFDSjtBQUVBLFdBQVMsaUJBQWlCLG9CQUFvQixJQUFJOyIsCiAgIm5hbWVzIjogWyJ0YXJnZXQiLCAiSVZfQllURVMiLCAiSVZfQllURVMiLCAib3BlbkRCIiwgImFwaSIsICJJVl9CWVRFUyIsICJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiaXNTeW5jRW5hYmxlZCJdCn0K
