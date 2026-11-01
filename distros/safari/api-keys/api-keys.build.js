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
  async function startPage(init2) {
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
      let mergedKeys = { ...local.apiKeyVault && local.apiKeyVault.keys || {} };
      let apiChanged = false;
      if ((!local.apiKeyVault || isFresh) && syncData.apiKeyVault) {
        baseVault = syncData.apiKeyVault;
        mergedKeys = { ...syncData.apiKeyVault.keys || {} };
        apiChanged = true;
      } else if (syncData.apiKeyVault) {
        const syncKeys = syncData.apiKeyVault.keys || {};
        for (const [id, syncKey] of Object.entries(syncKeys)) {
          const localKey = mergedKeys[id];
          if (!localKey || (syncKey.updatedAt || 0) > (localKey.updatedAt || 0)) {
            mergedKeys[id] = syncKey;
            apiChanged = true;
          }
        }
      }
      for (const id of Object.keys(mergedKeys)) {
        const ts = deletedKeys[id];
        if (ts != null && (mergedKeys[id].updatedAt || 0) <= ts) {
          delete mergedKeys[id];
          apiChanged = true;
        }
      }
      if (apiChanged && baseVault) {
        updates.apiKeyVault = { ...baseVault, keys: mergedKeys };
        changed = true;
      }
    }
    const mergedDocs = { ...local.vaultDocs || {} };
    let docsChanged = false;
    for (const key of Object.keys(syncData)) {
      if (!key.startsWith("vaultDoc:")) continue;
      const doc = syncData[key];
      if (!doc || !doc.path) continue;
      const localDoc = mergedDocs[doc.path];
      if (!localDoc || (doc.updatedAt || 0) > (localDoc.updatedAt || 0)) {
        mergedDocs[doc.path] = doc;
        docsChanged = true;
      }
    }
    for (const path of Object.keys(mergedDocs)) {
      const ts = deletedDocs[path];
      if (ts != null && (mergedDocs[path].updatedAt || 0) <= ts) {
        delete mergedDocs[path];
        docsChanged = true;
      }
    }
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
    if (moves.length > 0) await announceProfileMoves(moves);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9idW5rZXItdXJsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnNlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE1WMyBpbi1tZW1vcnkgYXJlYSB0aGF0IHN1cnZpdmVzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uIGJ1dCBuZXZlciB0b3VjaGVzXG4gICAgLy8gZGlzay4gTnVsbCBvbiBlbmdpbmVzIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGl0IChTYWZhcmkgYmFja2dyb3VuZCBwYWdlLFxuICAgIC8vIG9sZGVyIEZpcmVmb3gpIFx1MjAxNCBjYWxsZXJzIG11c3QgZmVhdHVyZS1kZXRlY3QgYW5kIGZhbGwgYmFjay5cbiAgICBzZXNzaW9uOiBfYnJvd3Nlci5zdG9yYWdlPy5zZXNzaW9uID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdGhlIGFyZWEgdG8gZXh0ZW5zaW9uLXByaXZpbGVnZWQgY29udGV4dHMuIENocm9tZS1vbmx5O1xuICAgICAgICAgKiByZXNvbHZlcyBoYXJtbGVzc2x5IHdoZXJlIHRoZSBtZXRob2QgaXMgYWJzZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWNjZXNzTGV2ZWwoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgYXNrR2F0ZSwgc3RhcnRQYWdlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhZ2UtZ2F0ZSc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHtcbiAgICBnZXRBcGlLZXlTdG9yZSxcbiAgICBzYXZlQXBpS2V5LFxuICAgIGRlbGV0ZUFwaUtleSxcbiAgICBsaXN0QXBpS2V5cyxcbiAgICBzZXRTeW5jRW5hYmxlZCxcbiAgICBpc1N5bmNFbmFibGVkLFxuICAgIHVwZGF0ZVN0b3JlU3luY1N0YXRlLFxuICAgIGV4cG9ydFN0b3JlLFxuICAgIGltcG9ydFN0b3JlLFxuICAgIGtleXNGb3JSZWxheSxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUnO1xuaW1wb3J0IHsgc2V0VW5sb2NrZWQgfSBmcm9tICcuLi91dGlsaXRpZXMvc2VjcmV0LXZhdWx0JztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAga2V5czogW10sXG4gICAgbmV3TGFiZWw6ICcnLFxuICAgIG5ld1NlY3JldDogJycsXG4gICAgZWRpdGluZ0lkOiBudWxsLFxuICAgIGVkaXRMYWJlbDogJycsXG4gICAgZWRpdFNlY3JldDogJycsXG4gICAgY29waWVkSWQ6IG51bGwsXG4gICAgcmV2ZWFsZWRJZDogbnVsbCxcbiAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsXG4gICAgc3luY0Vycm9yOiAnJyxcbiAgICBzYXZpbmc6IGZhbHNlLFxuICAgIHRvYXN0OiAnJyxcbiAgICByZWxheUluZm86IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9LFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGhhc1JlbGF5cygpIHtcbiAgICByZXR1cm4gc3RhdGUucmVsYXlJbmZvLnJlYWQubGVuZ3RoID4gMCB8fCBzdGF0ZS5yZWxheUluZm8ud3JpdGUubGVuZ3RoID4gMDtcbn1cblxuZnVuY3Rpb24gc29ydGVkS2V5cygpIHtcbiAgICByZXR1cm4gWy4uLnN0YXRlLmtleXNdLnNvcnQoKGEsIGIpID0+XG4gICAgICAgIGEubGFiZWwudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIubGFiZWwudG9Mb3dlckNhc2UoKSksXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gbWFza1NlY3JldChzZWNyZXQpIHtcbiAgICBpZiAoIXNlY3JldCkgcmV0dXJuICcnO1xuICAgIGlmIChzZWNyZXQubGVuZ3RoIDw9IDgpIHJldHVybiAnXFx1MjAyMicucmVwZWF0KHNlY3JldC5sZW5ndGgpO1xuICAgIHJldHVybiBzZWNyZXQuc2xpY2UoMCwgNCkgKyAnXFx1MjAyMicucmVwZWF0KDQpICsgc2VjcmV0LnNsaWNlKC00KTtcbn1cblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1zZykge1xuICAgIHN0YXRlLnRvYXN0ID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS50b2FzdCA9ICcnOyByZW5kZXIoKTsgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNDbGFzcyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiBzdGF0ZS5zeW5jRW5hYmxlZCA/ICdsZWQtLWdyZWVuJyA6ICdsZWQtLW9mZic7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ2xlZC0tYW1iZXIgYW5pbWF0ZS1wdWxzZSc7XG4gICAgcmV0dXJuICdsZWQtLXJlZCc7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNUZXh0KCkge1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnU3luY2luZy4uLic7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdlcnJvcicpIHJldHVybiBzdGF0ZS5zeW5jRXJyb3I7XG4gICAgcmV0dXJuIHN0YXRlLnN5bmNFbmFibGVkID8gJ1N5bmNlZCcgOiAnTG9jYWwgb25seSc7XG59XG5cbi8vIC0tLSBSZW5kZXIgLS0tXG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3Qgc3luY1RvZ2dsZSA9ICQoJ3N5bmMtdG9nZ2xlJyk7XG4gICAgY29uc3Qga2V5Q291bnQgPSAkKCdrZXktY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBsZWQgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCkgfHwgIXN0YXRlLnN5bmNFbmFibGVkO1xuICAgIGlmIChzeW5jVG9nZ2xlKSBzeW5jVG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHN0YXRlLnN5bmNFbmFibGVkKSk7XG4gICAgaWYgKGtleUNvdW50KSBrZXlDb3VudC50ZXh0Q29udGVudCA9IHN0YXRlLmtleXMubGVuZ3RoICsgJyBrZXknICsgKHN0YXRlLmtleXMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpO1xuXG4gICAgLy8gS2V5IHRhYmxlXG4gICAgY29uc3Qga2V5VGFibGVDb250YWluZXIgPSAkKCdrZXktdGFibGUtY29udGFpbmVyJyk7XG4gICAgY29uc3Qgbm9LZXlzTXNnID0gJCgnbm8ta2V5cycpO1xuICAgIGNvbnN0IGtleVRhYmxlQm9keSA9ICQoJ2tleS10YWJsZS1ib2R5Jyk7XG5cbiAgICBpZiAoa2V5VGFibGVDb250YWluZXIpIGtleVRhYmxlQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5rZXlzLmxlbmd0aCA+IDAgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmIChub0tleXNNc2cpIG5vS2V5c01zZy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUua2V5cy5sZW5ndGggPT09IDAgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgaWYgKGtleVRhYmxlQm9keSkge1xuICAgICAgICBjb25zdCBzb3J0ZWQgPSBzb3J0ZWRLZXlzKCk7XG4gICAgICAgIGtleVRhYmxlQm9keS5pbm5lckhUTUwgPSBzb3J0ZWQubWFwKGtleSA9PiB7XG4gICAgICAgICAgICBpZiAoc3RhdGUuZWRpdGluZ0lkID09PSBrZXkuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlIGlzLWxpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUtaGVhZGVyXCI+RWRpdCBrZXk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUtYm9keSBmbGV4IGZsZXgtY29sIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbnMtaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiS2V5IGxhYmVsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1lZGl0LWxhYmVsPVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdExhYmVsKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbnMtaW5wdXQgbW9ub1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWxsY2hlY2s9XCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJTZWNyZXQga2V5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1lZGl0LXNlY3JldD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtlc2NhcGVBdHRyKHN0YXRlLmVkaXRTZWNyZXQpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBnYXAtMiBqdXN0aWZ5LWVuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tZ2hvc3QgYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImNhbmNlbC1lZGl0XCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1wcmltYXJ5IGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJzYXZlLWVkaXRcIj5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJldmVhbGVkID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0ga2V5LmlkO1xuICAgICAgICAgICAgLy8gQW4gdW5kZWNyeXB0YWJsZSBzZWNyZXQgbXVzdCByZWFkIGFzIGEgUFJPQkxFTSwgbmV2ZXIgYXMgYmxhbmsgXHUyMDE0XG4gICAgICAgICAgICAvLyBibGFuayBpcyB3aGF0IG1hZGUgdGhlIG9sZCBkYXRhIGxvc3MgaW52aXNpYmxlLlxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVNlY3JldCA9IGtleS51bmRlY3J5cHRhYmxlXG4gICAgICAgICAgICAgICAgPyAndW5yZWFkYWJsZSBvbiB0aGlzIGRldmljZSdcbiAgICAgICAgICAgICAgICA6IChyZXZlYWxlZCA/IGVzY2FwZUh0bWwoa2V5LnNlY3JldCkgOiBlc2NhcGVIdG1sKG1hc2tTZWNyZXQoa2V5LnNlY3JldCkpKTtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlMYWJlbCA9IHN0YXRlLmNvcGllZElkID09PSBrZXkuaWQgPyAnQ29waWVkIScgOiAnQ29weSc7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUke3JldmVhbGVkID8gJyBpcy1saXZlJyA6ICcnfVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicGF0Y2gtcG9pbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD1cIiR7cmV2ZWFsZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIiR7cmV2ZWFsZWQgPyAnSGlkZSBzZWNyZXQnIDogJ1JldmVhbCBzZWNyZXQnfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIiR7cmV2ZWFsZWQgPyAnSGlkZScgOiAnUmV2ZWFsJ30gc2VjcmV0IGZvciAke2VzY2FwZUF0dHIoa2V5LmxhYmVsKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwicGF0Y2gtamFja1wiPjwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0wLjUgbWluLXctMCBmbGV4LTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtc20gZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciBob3Zlcjp1bmRlcmxpbmVcIiBkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiIHRpdGxlPVwiRWRpdCBrZXlcIj4ke2VzY2FwZUh0bWwoa2V5LmxhYmVsKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtb25vIHRleHQteHMgJHtyZXZlYWxlZCA/ICcnIDogJ2lucy1tdXRlZCAnfWlucy10cnVuY2F0ZSBjdXJzb3ItcG9pbnRlclwiIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtkaXNwbGF5U2VjcmV0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyb3ctdmFsdWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJjb3B5LXNlY3JldFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtjb3B5TGFiZWx9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXNtIGJ0bi0tZGVzdHJ1Y3RpdmVcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj5EZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICB9KS5qb2luKCcnKTtcblxuICAgICAgICAvLyBCaW5kIHRhYmxlIGV2ZW50c1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic3RhcnQtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzdGFydEVkaXQoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXRlLnJldmVhbGVkSWQgPSBzdGF0ZS5yZXZlYWxlZElkID09PSBlbC5kYXRhc2V0LmtleUlkID8gbnVsbCA6IGVsLmRhdGFzZXQua2V5SWQ7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjb3B5LXNlY3JldFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBjb3B5U2VjcmV0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGRlbGV0ZUtleShlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic2F2ZS1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVFZGl0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYW5jZWxFZGl0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBlZGl0IGlucHV0IGV2ZW50c1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1sYWJlbF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuZWRpdExhYmVsID0gZS50YXJnZXQudmFsdWU7IH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgc2F2ZUVkaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBjYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1lZGl0LXNlY3JldF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuZWRpdFNlY3JldCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCBrZXkgZm9ybVxuICAgIGNvbnN0IG5ld0xhYmVsSW5wdXQgPSAkKCduZXctbGFiZWwnKTtcbiAgICBjb25zdCBuZXdTZWNyZXRJbnB1dCA9ICQoJ25ldy1zZWNyZXQnKTtcbiAgICBjb25zdCBhZGRLZXlCdG4gPSAkKCdhZGQta2V5LWJ0bicpO1xuXG4gICAgaWYgKG5ld0xhYmVsSW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3TGFiZWxJbnB1dCkgbmV3TGFiZWxJbnB1dC52YWx1ZSA9IHN0YXRlLm5ld0xhYmVsO1xuICAgIGlmIChuZXdTZWNyZXRJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBuZXdTZWNyZXRJbnB1dCkgbmV3U2VjcmV0SW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdTZWNyZXQ7XG4gICAgaWYgKGFkZEtleUJ0bikge1xuICAgICAgICBhZGRLZXlCdG4uZGlzYWJsZWQgPSBzdGF0ZS5zYXZpbmcgfHwgc3RhdGUubmV3TGFiZWwudHJpbSgpLmxlbmd0aCA9PT0gMCB8fCBzdGF0ZS5uZXdTZWNyZXQudHJpbSgpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgYWRkS2V5QnRuLnRleHRDb250ZW50ID0gc3RhdGUuc2F2aW5nID8gJ1NhdmluZy4uLicgOiAnU2F2ZSc7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbi8vIC0tLSBDUlVEIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBhZGRLZXkoKSB7XG4gICAgY29uc3QgbGFiZWwgPSBzdGF0ZS5uZXdMYWJlbC50cmltKCk7XG4gICAgY29uc3Qgc2VjcmV0ID0gc3RhdGUubmV3U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIHN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBjb25zdCBpZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgYXdhaXQgc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgc3RhdGUubmV3TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5uZXdTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHN0YXRlLnNhdmluZyA9IGZhbHNlO1xuICAgIHNob3dUb2FzdCgnS2V5IGFkZGVkJyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RWRpdChpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmIChrZXkudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICAvLyBPcGVuaW5nIGl0IHdvdWxkIHNlZWQgdGhlIGVkaXRvciB3aXRoIG5vdGhpbmcgYW5kIFNhdmUgd291bGQgd3JpdGVcbiAgICAgICAgLy8gdGhhdCBub3RoaW5nIG92ZXIgdGhlIHN0b3JlZCBjaXBoZXJ0ZXh0LlxuICAgICAgICBzaG93VG9hc3QoJ1RoaXMga2V5IGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgb24gdGhpcyBkZXZpY2UgXHUyMDE0IGl0IHdhcyBsZWZ0IHVudG91Y2hlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHN0YXRlLmVkaXRpbmdJZCA9IGtleS5pZDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSBrZXkubGFiZWw7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9IGtleS5zZWNyZXQ7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVFZGl0KCkge1xuICAgIGlmICghc3RhdGUuZWRpdGluZ0lkKSByZXR1cm47XG4gICAgY29uc3QgbGFiZWwgPSBzdGF0ZS5lZGl0TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLmVkaXRTZWNyZXQudHJpbSgpO1xuICAgIGlmICghbGFiZWwgfHwgIXNlY3JldCkgcmV0dXJuO1xuXG4gICAgYXdhaXQgc2F2ZUFwaUtleShzdGF0ZS5lZGl0aW5nSWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdExhYmVsID0gJyc7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc2hvd1RvYXN0KCdLZXkgdXBkYXRlZCcpO1xufVxuXG5mdW5jdGlvbiBjYW5jZWxFZGl0KCkge1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdExhYmVsID0gJyc7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9ICcnO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVLZXkoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6IGBEZWxldGUgXCIke2tleS5sYWJlbH1cIj9gLCBib2R5OiAnVGhlIHN0b3JlZCBzZWNyZXQgaXMgcmVtb3ZlZCBmcm9tIHlvdXIgZW5jcnlwdGVkIHZhdWx0LicsIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZSBrZXknLCBkZXN0cnVjdGl2ZTogdHJ1ZSB9KSkpIHJldHVybjtcblxuICAgIGF3YWl0IGRlbGV0ZUFwaUtleShpZCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSBkZWxldGVkJyk7XG59XG5cbi8vIC0tLSBDbGlwYm9hcmQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlTZWNyZXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoa2V5LnVuZGVjcnlwdGFibGUpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdUaGlzIGtleSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoa2V5LnNlY3JldCk7XG4gICAgc3RhdGUuY29waWVkSWQgPSBpZDtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuY29waWVkSWQgPSBudWxsOyByZW5kZXIoKTsgfSwgMjAwMCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KCcnKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgfSwgMzAwMDApO1xufVxuXG4vLyAtLS0gU3luYyAtLS1cblxuYXN5bmMgZnVuY3Rpb24gcHVibGlzaFRvUmVsYXkoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2FwaWtleXMucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGtleXM6IGF3YWl0IGtleXNGb3JSZWxheSgpIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdhcGlrZXlzLmZldGNoJyB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IHN0b3JlLmtleXM7XG4gICAgICAgICAgICBjb25zdCBsb2NhbENvdW50ID0gT2JqZWN0LmtleXMobG9jYWxLZXlzKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChsb2NhbENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3RvcmUucmVsYXlDcmVhdGVkQXQgfHwgcmVzdWx0LmNyZWF0ZWRBdCA+IHN0b3JlLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVTeW5jKCkge1xuICAgIGF3YWl0IHNldFN5bmNFbmFibGVkKHN0YXRlLnN5bmNFbmFibGVkKTtcbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuLy8gLS0tIEltcG9ydCAvIEV4cG9ydCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5cygpIHtcbiAgICBjb25zdCB7IGtleXMsIHVuZGVjcnlwdGFibGUgfSA9IGF3YWl0IGV4cG9ydFN0b3JlKCk7XG4gICAgY29uc3QgcGxhaW5UZXh0ID0gSlNPTi5zdHJpbmdpZnkoa2V5cywgbnVsbCwgMik7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdhcGlrZXlzLmVuY3J5cHQnLFxuICAgICAgICBwYXlsb2FkOiB7IHBsYWluVGV4dCB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBzaG93VG9hc3QoJ0V4cG9ydCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFxuICAgICAgICBbSlNPTi5zdHJpbmdpZnkoeyBlbmNyeXB0ZWQ6IHRydWUsIGRhdGE6IHJlc3VsdC5jaXBoZXJUZXh0IH0pXSxcbiAgICAgICAgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICApO1xuICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7XG4gICAgYS5kb3dubG9hZCA9ICdub3N0cmtleS1hcGkta2V5cy1iYWNrdXAuanNvbic7XG4gICAgYS5jbGljaygpO1xuICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICBzaG93VG9hc3QodW5kZWNyeXB0YWJsZS5sZW5ndGhcbiAgICAgICAgPyBgRXhwb3J0ZWQgXHUyMDE0ICR7dW5kZWNyeXB0YWJsZS5sZW5ndGh9IGtleShzKSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIGhlcmUgYW5kIHdlcmUgYmFja2VkIHVwIHN0aWxsLWVuY3J5cHRlZDogJHt1bmRlY3J5cHRhYmxlLmpvaW4oJywgJyl9YFxuICAgICAgICA6ICdFeHBvcnRlZCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlzKGV2ZW50KSB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdO1xuICAgIGlmICghZmlsZSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuXG4gICAgICAgIGxldCBrZXlzO1xuICAgICAgICBpZiAocGFyc2VkLmVuY3J5cHRlZCAmJiBwYXJzZWQuZGF0YSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLmRlY3J5cHQnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgY2lwaGVyVGV4dDogcGFyc2VkLmRhdGEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHNob3dUb2FzdCgnRGVjcnlwdCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleXMgPSBKU09OLnBhcnNlKHJlc3VsdC5wbGFpblRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IHBhcnNlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgaW1wb3J0ZWQgfSA9IGF3YWl0IGltcG9ydFN0b3JlKGtleXMpO1xuICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgICAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydGVkICcgKyBpbXBvcnRlZCArICcga2V5cycpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnQgZmFpbGVkOiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG5cbiAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbn1cblxuLy8gLS0tIEV2ZW50IGJpbmRpbmcgLS0tXG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgnc3luYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzeW5jQWxsKTtcbiAgICAkKCdhZGQta2V5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFkZEtleSk7XG4gICAgJCgnZXhwb3J0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cG9ydEtleXMpO1xuICAgICQoJ2ltcG9ydC1maWxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGltcG9ydEtleXMpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgICQoJ3N5bmMtdG9nZ2xlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHRvZ2dsZVN5bmMoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1sYWJlbCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld0xhYmVsID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LXNlY3JldCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld1NlY3JldCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0dhdGUoZ2F0ZSwgbWFpbiwgeyB0aXRsZSwgbWVzc2FnZSwgYnV0dG9uIH0pIHtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGNvbnN0IHQgPSAkKCdnYXRlLXRpdGxlJyk7IGlmICh0ICYmIHRpdGxlKSB0LnRleHRDb250ZW50ID0gdGl0bGU7XG4gICAgY29uc3QgbSA9ICQoJ2dhdGUtbWVzc2FnZScpOyBpZiAobSAmJiBtZXNzYWdlKSBtLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICBjb25zdCBiID0gJCgnZ2F0ZS1zZWN1cml0eS1idG4nKTsgaWYgKGIgJiYgYnV0dG9uKSBiLnRleHRDb250ZW50ID0gYnV0dG9uO1xuICAgIGI/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBhcGkucnVudGltZS5nZXRVUkwoJ3NlY3VyaXR5L3NlY3VyaXR5Lmh0bWwnKTtcbiAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnbm9zdHJrZXktb3B0aW9ucycpO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIC8vIEdhdGU6IHJlcXVpcmUgbWFzdGVyIHBhc3N3b3JkIEFORCBhbiB1bmxvY2tlZCBzZXNzaW9uIGJlZm9yZSByZW5kZXJpbmcuXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhc2tHYXRlKCdpc0VuY3J5cHRlZCcpO1xuICAgIGNvbnN0IGxvY2tlZCA9IGF3YWl0IGFza0dhdGUoJ2lzTG9ja2VkJyk7XG4gICAgY29uc3QgZ2F0ZSA9ICQoJ3ZhdWx0LWxvY2tlZC1nYXRlJyk7XG4gICAgY29uc3QgbWFpbiA9ICQoJ3ZhdWx0LW1haW4tY29udGVudCcpO1xuXG4gICAgaWYgKCFpc0VuY3J5cHRlZCkge1xuICAgICAgICAvLyBObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IHlldCBcdTIwMTQgZGV2aWNlLWtleSBlbmNyeXB0aW9uIGlzIGFjdGl2ZSBidXQgdGhlXG4gICAgICAgIC8vIHZhdWx0IFVJIHN0aWxsIGFza3MgdGhlIHVzZXIgdG8gc2V0IGEgcGFzc3dvcmQgZmlyc3QuXG4gICAgICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgICAgICBzaG93R2F0ZShnYXRlLCBtYWluLCB7fSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobG9ja2VkKSB7XG4gICAgICAgIC8vIEY1OiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgcmVmdXNlIHRvIHJlYWQvcmVuZGVyIGFueSBBUEkta2V5IHNlY3JldC5cbiAgICAgICAgc2V0VW5sb2NrZWQoZmFsc2UpO1xuICAgICAgICBzaG93R2F0ZShnYXRlLCBtYWluLCB7XG4gICAgICAgICAgICB0aXRsZTogJ1ZhdWx0IExvY2tlZCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVW5sb2NrIE5vc3RyS2V5IHdpdGggeW91ciBtYXN0ZXIgcGFzc3dvcmQgdG8gdmlldyB5b3VyIEFQSSBrZXlzLicsXG4gICAgICAgICAgICBidXR0b246ICdVbmxvY2snLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICBjb25zdCByZWxheXMgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd2YXVsdC5nZXRSZWxheXMnIH0pO1xuICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gc3RhcnRQYWdlKGluaXQpKTtcbiIsICIvKipcbiAqIFRoZSBxdWVzdGlvbnMgYSBwYWdlIGFza3MgdGhlIHdvcmtlciBiZWZvcmUgaXQgY2FuIGRyYXcgYW55dGhpbmcuIFRoZSB3b3JrZXJcbiAqIGNhbiBhbnN3ZXIgdGhlbSB3aXRoIGEgcmVmdXNhbCBvYmplY3QsIGFuZCBhbiBvYmplY3QgaXMgdHJ1dGh5LCBzbyBhIHBhZ2UgdGhhdFxuICogcmVhZHMgaXQgYXMgYSB5ZXMgc2hvd3MgdGhlIHdyb25nIHNjcmVlbi4gUGFnZXMgYXNrIHRocm91Z2ggYXNrR2F0ZSBpbnN0ZWFkOlxuICogYSByZWZ1c2FsIHJlcGxhY2VzIHRoZSBwYWdlIHdpdGggYSBwbGFpbiBtZXNzYWdlIGFuZCBzdG9wcyBpdHMgc3RhcnQtdXAuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuZXhwb3J0IGNvbnN0IFNUQVJUX0VSUk9SID0gJ05vc3RyS2V5IGNvdWxkIG5vdCBzdGFydCB0aGlzIHBhZ2UuIFJlbG9hZCBvciByZWluc3RhbGwuJztcblxuZXhwb3J0IGNsYXNzIEdhdGVSZWZ1c2VkIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmdXNlZChhbnN3ZXIpIHtcbiAgICByZXR1cm4gISFhbnN3ZXIgJiYgdHlwZW9mIGFuc3dlciA9PT0gJ29iamVjdCcgJiYgYW5zd2VyLnN1Y2Nlc3MgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1N0YXJ0RXJyb3IoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgncm9sZScsICdhbGVydCcpO1xuICAgIG1lc3NhZ2UuZGF0YXNldC5zdGFydEVycm9yID0gJyc7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFNUQVJUX0VSUk9SO1xuICAgIG1lc3NhZ2Uuc3R5bGUucGFkZGluZyA9ICcxNnB4JztcbiAgICBkb2N1bWVudC5ib2R5LnJlcGxhY2VDaGlsZHJlbihtZXNzYWdlKTtcbn1cblxuLyoqIEFzayB0aGUgd29ya2VyLiBPbiBhIHJlZnVzYWwsIHNob3cgdGhlIG1lc3NhZ2UgYW5kIHRocm93IEdhdGVSZWZ1c2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFza0dhdGUoa2luZCkge1xuICAgIGNvbnN0IGFuc3dlciA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZCB9KTtcbiAgICBpZiAoaXNSZWZ1c2VkKGFuc3dlcikpIHtcbiAgICAgICAgc2hvd1N0YXJ0RXJyb3IoKTtcbiAgICAgICAgdGhyb3cgbmV3IEdhdGVSZWZ1c2VkKCk7XG4gICAgfVxuICAgIHJldHVybiBhbnN3ZXI7XG59XG5cbi8qKiBSdW4gYSBwYWdlJ3Mgc3RhcnQtdXAuIEEgcmVmdXNhbCBoYXMgYWxyZWFkeSBiZWVuIHNob3duLCBzbyBpdCBlbmRzIGhlcmUuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRQYWdlKGluaXQpIHtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBpbml0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgR2F0ZVJlZnVzZWQpKSB0aHJvdyBlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiLyoqXG4gKiBBUEkgS2V5IFN0b3JlIFx1MjAxNCBMb2NhbCBjYWNoZSBmb3IgZW5jcnlwdGVkIEFQSSBrZXlzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICBhcGlLZXlWYXVsdDoge1xuICogICAgIGtleXM6IHtcbiAqICAgICAgIFwiPHV1aWQ+XCI6IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0LCBwcm9maWxlU2NvcGUgfVxuICogICAgIH0sXG4gKiAgICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gKiAgICAgZXZlbnRJZDogbnVsbCxcbiAqICAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAqICAgICBzeW5jU3RhdHVzOiBcInN5bmNlZFwiICAgIC8vIHN5bmNlZCB8IGxvY2FsLW9ubHkgfCBjb25mbGljdFxuICogICB9XG4gKlxuICogcHJvZmlsZVNjb3BlOiBudWxsIChhbGwgcHJvZmlsZXMpIHwgbnVtYmVyW10gKHNwZWNpZmljIHByb2ZpbGUgaW5kaWNlcylcbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgc2NoZWR1bGVTeW5jUHVzaCB9IGZyb20gJy4vc3luYy1tYW5hZ2VyJztcbmltcG9ydCB7IHdyYXBTZWNyZXQsIHVud3JhcFNlY3JldCwgaXNDaXBoZXJ0ZXh0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdhcGlLZXlWYXVsdCc7XG4vLyBEZWxldGlvbiB0b21ic3RvbmVzIGtleWVkIGJ5IGlkIChpc3N1ZSAjMyk6IHsgPGlkPjogZGVsZXRlZEF0U2Vjb25kcyB9LlxuY29uc3QgREVMRVRFRF9LRVkgPSAnZGVsZXRlZEtleXMnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXREZWxldGVkS2V5cygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbREVMRVRFRF9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtERUxFVEVEX0tFWV0gJiYgdHlwZW9mIGRhdGFbREVMRVRFRF9LRVldID09PSAnb2JqZWN0JyA/IGRhdGFbREVMRVRFRF9LRVldIDoge307XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGtleSdzIGBzZWNyZXRgIGZpZWxkIGZvciBjYWxsZXJzLiBSZS10aHJvd3MgbG9jayBlcnJvcnMgc28gYSBsb2NrZWRcbiAqIHNlc3Npb24gY2Fubm90IHJlYWQgc2VjcmV0cyAoRjUpLlxuICpcbiAqIEEgZ2VudWluZSBkZWNyeXB0IGZhaWx1cmUgKGUuZy4gYSBkZXZpY2Utd3JhcHBlZCB2YWx1ZSBzeW5jZWQgZnJvbSBhbm90aGVyXG4gKiBkZXZpY2UsIG9yIGEgYmxvYiB3aG9zZSB3cmFwcGluZyBrZXkgcm90YXRlZCBhd2F5KSBpcyByZXBvcnRlZCBhc1xuICogYHVuZGVjcnlwdGFibGU6IHRydWVgIHdpdGggYHNlY3JldDogbnVsbGAgXHUyMDE0IE5PVCBhcyBhbiBlbXB0eSBzdHJpbmcuIEFuIGVtcHR5XG4gKiBzdHJpbmcgaXMgaW5kaXN0aW5ndWlzaGFibGUgZnJvbSBhIHJlYWwgdmFsdWU6IHRoZSBVSSByZW5kZXJlZCBpdCBhcyBibGFua1xuICogYW5kIGV4cG9ydFN0b3JlKCkgd3JvdGUgaXQgaW50byB0aGUgdXNlcidzIGVuY3J5cHRlZCBiYWNrdXAsIHF1aWV0bHlcbiAqIHJlcGxhY2luZyB0aGUgb25seSBjb3B5IG9mIHRoZSBzZWNyZXQgd2l0aCBub3RoaW5nLiBgbnVsbGAgKyB0aGUgZmxhZyBtYWtlc1xuICogdGhlIGZhaWx1cmUgdmlzaWJsZSB0byBldmVyeSBjYWxsZXIsIGFuZCBleHBvcnRTdG9yZSgpIGNhcnJpZXMgdGhlIHVudG91Y2hlZFxuICogY2lwaGVydGV4dCBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0S2V5KGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4ga2V5O1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IC4uLmtleSwgc2VjcmV0OiBhd2FpdCB1bndyYXBTZWNyZXQoa2V5LnNlY3JldCkgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChTdHJpbmcoZS5tZXNzYWdlIHx8ICcnKS5zdGFydHNXaXRoKCdsb2NrZWQnKSkgdGhyb3cgZTtcbiAgICAgICAgcmV0dXJuIHsgLi4ua2V5LCBzZWNyZXQ6IG51bGwsIHVuZGVjcnlwdGFibGU6IHRydWUgfTtcbiAgICB9XG59XG5cbmNvbnN0IERFRkFVTFRfU1RPUkUgPSB7XG4gICAga2V5czoge30sXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZXZlbnRJZDogbnVsbCxcbiAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAgICBzeW5jU3RhdHVzOiAnc3luY2VkJyxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtTVE9SQUdFX0tFWV06IERFRkFVTFRfU1RPUkUgfSk7XG4gICAgcmV0dXJuIHsgLi4uREVGQVVMVF9TVE9SRSwgLi4uZGF0YVtTVE9SQUdFX0tFWV0gfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmUoc3RvcmUpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZ1bGwgQVBJIGtleSBzdG9yZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXlTdG9yZSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGtleXNbaWRdID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgIH1cbiAgICByZXR1cm4geyAuLi5zdG9yZSwga2V5cyB9O1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBBUEkga2V5IGJ5IGlkIChzZWNyZXQgZGVjcnlwdGVkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fG51bGw+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBzdG9yZS5rZXlzW2lkXSA/IGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pIDogbnVsbDtcbn1cblxuLyoqXG4gKiBVcHNlcnQgYW4gQVBJIGtleS4gQ3JlYXRlcyBpZiBuZXcsIHVwZGF0ZXMgaWYgZXhpc3RpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBVVUlEXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWNyZXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBzdG9yZS5rZXlzW2lkXTtcbiAgICAvLyBUMC00OiBlbmNyeXB0IHRoZSBzZWNyZXQgYmVmb3JlIGl0IHRvdWNoZXMgc3RvcmFnZS5cbiAgICBzdG9yZS5rZXlzW2lkXSA9IHtcbiAgICAgICAgaWQsXG4gICAgICAgIGxhYmVsLFxuICAgICAgICBzZWNyZXQ6IGF3YWl0IHdyYXBTZWNyZXQoc2VjcmV0KSxcbiAgICAgICAgY3JlYXRlZEF0OiBleGlzdGluZz8uY3JlYXRlZEF0IHx8IG5vdyxcbiAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgLy8gUmVjcmVhdGUgY2xlYXJzIGFueSB0b21ic3RvbmUgZm9yIHRoaXMgaWQgKGlzc3VlICMzKSBzbyB0aGUgZnJlc2hseSBzYXZlZFxuICAgIC8vIGtleSBpcyBubyBsb25nZXIgc3VwcHJlc3NlZCBmcm9tIHRoZSBzeW5jIHBheWxvYWQuXG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWRLZXlzKCk7XG4gICAgaWYgKGRlbGV0ZWRbaWRdICE9IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIGRlbGV0ZWRbaWRdO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgICAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSk7XG59XG5cbi8qKlxuICogRGVsZXRlIGFuIEFQSSBrZXkgYnkgaWQgYW5kIHJlY29yZCBhIHRvbWJzdG9uZSAoaXNzdWUgIzMpIHNvIHRoZSBkZWxldGlvblxuICogcHJvcGFnYXRlcyB0aHJvdWdoIHN0b3JhZ2Uuc3luYyBhbmQgYSBzdGFsZSB3aG9sZS1vYmplY3Qgb3ZlcndyaXRlIGZyb21cbiAqIGFub3RoZXIgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgaXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZGVsZXRlIHN0b3JlLmtleXNbaWRdO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkS2V5cygpO1xuICAgIGRlbGV0ZWRbaWRdID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBzdG9yZSwgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgQVBJIGtleXMgc29ydGVkIGJ5IGxhYmVsIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RBcGlLZXlzKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHRLZXkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKlxuICogQSBrZXkgdGhpcyBkZXZpY2UgY2Fubm90IGRlY3J5cHQgaXMgTkVWRVIgZXhwb3J0ZWQgd2l0aCBhbiBlbXB0eS9udWxsIHNlY3JldFxuICogXHUyMDE0IGEgYmxhbmsgd291bGQgb3ZlcndyaXRlIHRoZSByZWNvdmVyYWJsZSBjaXBoZXJ0ZXh0IHRoZSBuZXh0IHRpbWUgdGhlIGJhY2t1cFxuICogaXMgaW1wb3J0ZWQuIEl0IGlzIGV4cG9ydGVkIGFzIHRoZSBPUklHSU5BTCBDSVBIRVJURVhULFxuICogdW50b3VjaGVkOiB0aGF0IHByZXNlcnZlcyBzdHJpY3RseSBtb3JlIHVzZXIgZGF0YSB0aGFuIG9taXR0aW5nIGl0ICh0aGUgdmFsdWVcbiAqIGlzIHN0aWxsIHJlY292ZXJhYmxlIG9uIGEgZGV2aWNlIHRoYXQgaG9sZHMgdGhlIHdyYXBwaW5nIGtleSwgb3Igb25jZSB0aGUga2V5XG4gKiBpcyByZXN0b3JlZCksIGFuZCBpbXBvcnRTdG9yZSgpIGFscmVhZHkgcGFzc2VzIGNpcGhlcnRleHQgc3RyYWlnaHQgdGhyb3VnaFxuICogaW5zdGVhZCBvZiByZS13cmFwcGluZyBpdCwgc28gdGhlIHJvdW5kIHRyaXAgaXMgbG9zc2xlc3MuIFRoZSBpZHMgYXJlIGFsc29cbiAqIHJlcG9ydGVkIHNvIHRoZSBjYWxsZXIgY2FuIHRlbGwgdGhlIHVzZXIgd2hpY2gga2V5cyBjYW1lIHRocm91Z2ggdW5vcGVuZWQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e2tleXM6IE9iamVjdCwgdW5kZWNyeXB0YWJsZTogc3RyaW5nW119Pn0gTWFwIG9mIGlkIC0+IGtleVxuICogICAgICAgICAgZGF0YSwgcGx1cyB0aGUgbGFiZWxzL2lkcyB0aGF0IHdlcmUgZXhwb3J0ZWQgc3RpbGwtZW5jcnlwdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U3RvcmUoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBjb25zdCB1bmRlY3J5cHRhYmxlID0gW107XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoZGVjcnlwdGVkPy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgICAgICBrZXlzW2lkXSA9IHsgLi4ua2V5IH07ICAgICAgICAgICAgLy8gY2lwaGVydGV4dCBjYXJyaWVkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgICAgIHVuZGVjcnlwdGFibGUucHVzaChrZXkubGFiZWwgfHwgaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAga2V5c1tpZF0gPSBkZWNyeXB0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB7IGtleXMsIHVuZGVjcnlwdGFibGUgfTtcbn1cblxuLyoqXG4gKiBUaGUga2V5cyB0byBzZW5kIHRvIHRoZSByZWxheTogb25seSB0aG9zZSB0aGlzIGRldmljZSBjYW4gcmVhZC4gQSBrZXkgaXRcbiAqIGNhbm5vdCByZWFkIGlzIGxlZnQgb3V0LCBzbyB0aGUgY29weSBvbiB0aGUgZGV2aWNlIHRoYXQgY2FuIHJlYWQgaXQgc3RheXNcbiAqIHRoZSBnb29kIG9uZSB3aGVuIHRoYXQgZGV2aWNlIGltcG9ydHMgd2hhdCB3YXMgc2VudC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBNYXAgb2YgaWQgLT4ga2V5IGRhdGEgd2l0aCBwbGFpbnRleHQgc2VjcmV0c1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2V5c0ZvclJlbGF5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoaGFzVXNhYmxlU2VjcmV0KGRlY3J5cHRlZCkpIGtleXNbaWRdID0gZGVjcnlwdGVkO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gaGFzVXNhYmxlU2VjcmV0KGtleSkge1xuICAgIHJldHVybiAhIWtleSAmJiAha2V5LnVuZGVjcnlwdGFibGUgJiYgdHlwZW9mIGtleS5zZWNyZXQgPT09ICdzdHJpbmcnICYmIGtleS5zZWNyZXQgIT09ICcnO1xufVxuXG4vKipcbiAqIEltcG9ydCBrZXlzIGludG8gdGhlIHN0b3JlIChtZXJnZSBcdTIwMTQgZXhpc3Rpbmcga2V5cyB3aXRoIHNhbWUgaWQgYXJlIG92ZXJ3cml0dGVuKS5cbiAqIEluY29taW5nIHNlY3JldHMgYXJlIHBsYWludGV4dCAoZnJvbSBhIGRlY3J5cHRlZCBiYWNrdXAgb3IgYSByZWxheSBmZXRjaCkgYW5kXG4gKiBhcmUgcmUtd3JhcHBlZCBmb3IgdGhlIGF0LXJlc3QgdGllciB0aGlzIGNvbnRleHQgaXMgaW4gXHUyMDE0IHRoZSBkZXZpY2Uga2V5LCBvclxuICogdGhlIHBhc3N3b3JkIHNlc3Npb24ga2V5IHdoZW4gb25lIGlzIGxpdmUgXHUyMDE0IGJlZm9yZSBzdG9yYWdlLlxuICpcbiAqIEFuIGVudHJ5IHdpdGggbm8gdXNhYmxlIHNlY3JldCBpcyBza2lwcGVkLCBzbyBpdCBjYW4gbmVpdGhlciByZXBsYWNlIGEgZ29vZFxuICogc2VjcmV0IG5vciBhZGQgYSBrZXkgd2l0aCBub3RoaW5nIGluIGl0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBrZXlzIC0gTWFwIG9mIGlkIC0+IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IH1cbiAqIEByZXR1cm5zIHtQcm9taXNlPHtpbXBvcnRlZDogbnVtYmVyLCBza2lwcGVkOiBudW1iZXJ9Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydFN0b3JlKGtleXMpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgbGV0IGltcG9ydGVkID0gMDtcbiAgICBsZXQgc2tpcHBlZCA9IDA7XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoa2V5cykpIHtcbiAgICAgICAgaWYgKCFoYXNVc2FibGVTZWNyZXQoa2V5KSkge1xuICAgICAgICAgICAgc2tpcHBlZCsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VjcmV0ID0gaXNDaXBoZXJ0ZXh0KGtleS5zZWNyZXQpID8ga2V5LnNlY3JldCA6IGF3YWl0IHdyYXBTZWNyZXQoa2V5LnNlY3JldCk7XG4gICAgICAgIHN0b3JlLmtleXNbaWRdID0geyAuLi5rZXksIHNlY3JldCB9O1xuICAgICAgICBpbXBvcnRlZCsrO1xuICAgIH1cbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG4gICAgcmV0dXJuIHsgaW1wb3J0ZWQsIHNraXBwZWQgfTtcbn1cbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNDaXBoZXJ0ZXh0LCBpc1Bhc3N3b3JkQmxvYiB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcbmltcG9ydCB7IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcywgcmVkYWN0UHJvZmlsZXMgfSBmcm9tICcuL2J1bmtlci11cmwuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBLZXlzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIHN5bmNlZFxuY29uc3QgRVhDTFVERURfS0VZUyA9IFtcbiAgICAnYnVua2VyU2Vzc2lvbnMnLFxuICAgICdpZ25vcmVJbnN0YWxsSG9vaycsXG4gICAgJ3Bhc3N3b3JkSGFzaCcsXG4gICAgJ3Bhc3N3b3JkU2FsdCcsXG5dO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIC8vIFRvbWJzdG9uZXMgKGRlbGV0aW9uIHJlY29yZHMpIGdldCB0aGUgZ3VhcmFudGVlZCB0b3Agc2xvdDogYSBkZWxldGlvbiBtdXN0XG4gICAgLy8gbmV2ZXIgbG9zZSBpdHMgYnVkZ2V0IHJhY2UgdG8gYnVsa3kgdmF1bHQgY29udGVudCwgb3IgdGhlIGRlbGV0ZWQgaXRlbVxuICAgIC8vIHJlc3VycmVjdHMgb24gdGhlIG5leHQgZGV2aWNlIHRoYXQgc3RpbGwgaGFzIGEgc3RhbGUgY29weSAoaXNzdWUgIzMpLlxuICAgIFAwX1RPTUJTVE9ORVM6IDAsXG4gICAgUDFfUFJPRklMRVM6IDEsXG4gICAgUDJfU0VUVElOR1M6IDIsXG4gICAgUDNfQVBJS0VZUzogMyxcbiAgICBQNF9WQVVMVDogNCxcbn07XG5cbi8vIFdhcm5pbmcgdGhyZXNob2xkcyBmb3IgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeSAodG9tYnN0b25lcyBhcmUga2VwdFxuLy8gZm9yZXZlciBzbyBhbiBvZmZsaW5lIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgYWJvdXQgYSBkZWxldGlvbiBjYW5ub3Rcbi8vIHJlc3VycmVjdCB0aGUgaXRlbSBcdTIwMTQgdGhlIGNvdW50IG9ubHkgZ3Jvd3MsIHNvIG51ZGdlIHRoZSB1c2VyIHRvIHRyaW0gaXQpLlxuY29uc3QgVE9NQlNUT05FX1dBUk5fR0VOVExFID0gODtcbmNvbnN0IFRPTUJTVE9ORV9XQVJOX1NUUk9ORyA9IDE2O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVmVyc2lvbiBjb21wYXJpc29uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBkb3R0ZWQgdmVyc2lvbiBzdHJpbmdzIG51bWVyaWNhbGx5LlxuICogUmV0dXJucyAxIGlmIGEgPiBiLCAtMSBpZiBhIDwgYiwgMCBpZiBlcXVhbC4gTWlzc2luZyAvIG5vbi1udW1lcmljXG4gKiBjb21wb25lbnRzIGFyZSB0cmVhdGVkIGFzIDAgc28gJzEuMTAuMCcgY29ycmVjdGx5IHNvcnRzIGFib3ZlICcxLjkuMCdcbiAqIChhIHBsYWluIHN0cmluZyBjb21wYXJlIHdvdWxkIHB1dCAnMS45LjAnIGZpcnN0KS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNlbXZlcihhLCBiKSB7XG4gICAgY29uc3QgcGEgPSBTdHJpbmcoYSkuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBwYiA9IFN0cmluZyhiKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KHBhLmxlbmd0aCwgcGIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHggPSBwYXJzZUludChwYVtpXSwgMTApIHx8IDA7XG4gICAgICAgIGNvbnN0IHkgPSBwYXJzZUludChwYltpXSwgMTApIHx8IDA7XG4gICAgICAgIGlmICh4ID4geSkgcmV0dXJuIDE7XG4gICAgICAgIGlmICh4IDwgeSkgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCBzeW5jIHBheWxvYWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGxvY2FsIGRhdGEgYW5kIGJ1aWxkIGEgcHJpb3JpdGlzZWQgbGlzdCBvZiBlbnRyaWVzIHRvIHN5bmMuXG4gKiBSZXR1cm5zIHsgZW50cmllczogW3sga2V5LCBqc29uU3RyaW5nLCBwcmlvcml0eSwgc2l6ZSB9XSwgdG90YWxTaXplIH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gVDAtNTogYSBzZWNyZXQgaXMgb25seSBldmVyIGVtaXR0ZWQgdG8gc3RvcmFnZS5zeW5jIChHb29nbGUvaUNsb3VkKSBpZiBpdFxuICAgIC8vIGlzIGFscmVhZHkgYW4gZW5jcnlwdGVkIGJsb2IuIEFueSB2YWx1ZSB0aGF0IGlzIE5PVCBjaXBoZXJ0ZXh0IGlzIHJlZnVzZWRcbiAgICAvLyAoZHJvcHBlZCkgc28gcGxhaW50ZXh0IHByaXZhdGUga2V5cyAvIEFQSSBzZWNyZXRzIC8gbm90ZXMgY2FuIG5ldmVyIGxlYXZlXG4gICAgLy8gdGhlIGRldmljZS4gYCcnYCAoZW1wdHkgLyBidW5rZXIpIGlzIGFsbG93ZWQgdGhyb3VnaCBhcyBub24tc2VjcmV0LlxuICAgIGNvbnN0IHNlY3JldE9rID0gdiA9PiAhdiB8fCBpc0NpcGhlcnRleHQodik7XG5cbiAgICAvLyBUb21ic3RvbmVzIChpc3N1ZSAjMykuIEEgZG9jL2tleSBpcyBzdXBwcmVzc2VkIGZyb20gdGhlIHBheWxvYWQgd2hlbiBhXG4gICAgLy8gdG9tYnN0b25lIGRhdGVkIGF0LW9yLWFmdGVyIGl0cyB1cGRhdGVkQXQgZXhpc3RzLCBzbyBhIHN0YWxlIGxvY2FsIGNvcHlcbiAgICAvLyBjYW5ub3QgcmUtcHVzaCBhIGRlbGV0ZWQgaXRlbSBiYWNrIGludG8gdGhlIG1pcnJvci5cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IChhbGwuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGFsbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWREb2NzIDoge307XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSAoYWxsLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBhbGwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkS2V5cyA6IHt9O1xuICAgIGNvbnN0IGRlbGV0ZWRQcm9maWxlcyA9IChhbGwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBhbGwuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZFByb2ZpbGVzIDoge307XG5cbiAgICAvLyBBIHByb2ZpbGUncyBzdGFibGUgaWRlbnRpdHkgZm9yIHRvbWJzdG9uZSAvIHJlY2VuY3kga2V5aW5nOiBpdHMgcHVia2V5LFxuICAgIC8vIGVsc2UgKGZvciBhIGJ1bmtlcikgaXRzIHJlbW90ZSBwdWJrZXkuIE1hdGNoZXMgbWVyZ2VJbnRvTG9jYWwncyBpZGVudGl0eU9mLlxuICAgIGNvbnN0IGlkZW50aXR5T2YgPSAocCkgPT4gKHAgJiYgKHAucHViS2V5IHx8IHAucmVtb3RlUHVia2V5KSkgfHwgbnVsbDtcblxuICAgIC8vIFAwOiBUb21ic3RvbmVzIFx1MjAxNCB0aGUgZ3VhcmFudGVlZCBzbG90IChlbWl0dGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlKS5cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZERvY3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWREb2NzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZERvY3MnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkS2V5cykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkS2V5cycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRQcm9maWxlcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZFByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZFByb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFAxOiBQcm9maWxlcyAoc3RyaXAgYGhvc3RzYCB0byBzYXZlIHNwYWNlKSArIHByb2ZpbGVJbmRleFxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IHJlZGFjdFByb2ZpbGVzKGFsbC5wcm9maWxlcylcbiAgICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBwcm9maWxlIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KSxcbiAgICAgICAgICAgICAgICAvLyBzbyBhIHN0YWxlIGxvY2FsIGNvcHkgY2Fubm90IHJlLXB1c2ggYSBkZWxldGVkIGlkZW50aXR5LlxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShpZCAhPSBudWxsICYmIGRlbGV0ZWRQcm9maWxlc1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdID49IChwLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm1hcChwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgICAgIGlmIChyZXN0LnByaXZLZXkgJiYgIXNlY3JldE9rKHJlc3QucHJpdktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHByaXZLZXkgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdC5wcml2S2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgLy8gTk9URTogYGlzRW5jcnlwdGVkYCAodGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGZsYWcpIGlzIGRlbGliZXJhdGVseSBOT1RcbiAgICAvLyBzeW5jZWQuIEl0IGlzIGEgcGVyLWRldmljZSBmYWN0IFx1MjAxNCBhIGRldmljZSBob2xkcyB0aGUgcGFzc3dvcmQgdmVyaWZpZXIgb3JcbiAgICAvLyBpdCBkb2VzIG5vdCBcdTIwMTQgYW5kIG1pcnJvcmluZyBpdCBvbmNlIGxhdGNoZWQgYSBwYXNzd29yZGxlc3MgZGV2aWNlIGludG8gYVxuICAgIC8vIGRlYWQtZW5kIGxvY2sgc2NyZWVuIGl0IGhhZCBubyBwYXNzd29yZCBmb3IuIFNlZSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkuXG5cbiAgICAvLyBQMjogU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrIG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoYWxsW2tdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYWxsKSkge1xuICAgICAgICBpZiAoay5zdGFydHNXaXRoKCdmZWF0dXJlOicpKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFAzOiBBUEkga2V5IHZhdWx0IFx1MjAxNCBvbmx5IHN5bmMga2V5cyB3aG9zZSBzZWNyZXQgaXMgY2lwaGVydGV4dCAoVDAtNSlcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0ICYmIGFsbC5hcGlLZXlWYXVsdC5rZXlzKSB7XG4gICAgICAgIGNvbnN0IHNhZmVLZXlzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGFsbC5hcGlLZXlWYXVsdC5rZXlzKSkge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBrZXkgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSAhPSBudWxsICYmIGRlbGV0ZWRLZXlzW2lkXSA+PSAoa2V5LnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlY3JldE9rKGtleS5zZWNyZXQpKSB7XG4gICAgICAgICAgICAgICAgc2FmZUtleXNbaWRdID0ga2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgQVBJIHNlY3JldCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYXVsdCA9IHsgLi4uYWxsLmFwaUtleVZhdWx0LCBrZXlzOiBzYWZlS2V5cyB9O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2FmZVZhdWx0KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnYXBpS2V5VmF1bHQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDNfQVBJS0VZUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDQ6IFZhdWx0IGRvY3MgKGluZGl2aWR1YWxseSwgbmV3ZXN0IGZpcnN0KSBcdTIwMTQgb25seSBpZiBjb250ZW50IGlzIGNpcGhlcnRleHRcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBkb2MgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWREb2NzW2RvYy5wYXRoXSAhPSBudWxsICYmIGRlbGV0ZWREb2NzW2RvYy5wYXRoXSA+PSAoZG9jLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzZWNyZXRPayhkb2MuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgdmF1bHQgY29udGVudCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFdyaXRlIGEgcHJpb3JpdGlzZWQsIHByZS1jaHVua2VkIHBheWxvYWQgdG8gc3RvcmFnZS5zeW5jLCByZXRyeWluZyBvbiBhblxuICogb3Zlci1xdW90YSByZWplY3Rpb24gYnkgZHJvcHBpbmcgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsIHByZXNlbnQgYW5kXG4gKiB0cnlpbmcgYWdhaW4uIFAwICh0b21ic3RvbmVzKSBhbmQgUDEgKHByb2ZpbGVzKSBhcmUgTkVWRVIgZHJvcHBlZCBcdTIwMTQgYSBmdWxsXG4gKiBiYXRjaCBmYWlsdXJlIHdvdWxkIHN0cmFuZCBhIGRlbGV0aW9uIG9yIGEga2V5LCBzbyB0aGUgaW1wb3J0YW50IHRpZXJzIHN5bmNcbiAqIGV2ZW4gd2hlbiB0aGUgYnVsa3kgb25lcyBjYW5ub3QuXG4gKlxuICogQHBhcmFtIHt7IHByaW9yaXR5OiBudW1iZXIsIGNodW5rczoge2tleTpzdHJpbmcsIHZhbHVlOnN0cmluZ31bXSB9W119IGluY2x1ZGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fSBudW1iZXIgb2YgZGF0YSBrZXlzIGFjdHVhbGx5IHdyaXR0ZW5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2V0U3luY1Jlc3BlY3RpbmdRdW90YShpbmNsdWRlZCkge1xuICAgIGxldCB0aWVycyA9IGluY2x1ZGVkLnNsaWNlKCk7XG4gICAgLy8gR3VhcmQgYWdhaW5zdCBhbiB1bmJvdW5kZWQgbG9vcDogYXQgbW9zdCBvbmUgcmV0cnkgcGVyIGRpc3RpbmN0IHByaW9yaXR5LlxuICAgIGZvciAobGV0IGF0dGVtcHQgPSAwOyA7IGF0dGVtcHQrKykge1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGllcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBpdGVtLmNodW5rcykge1xuICAgICAgICAgICAgICAgIHN5bmNQYXlsb2FkW2Mua2V5XSA9IGMudmFsdWU7XG4gICAgICAgICAgICAgICAgYWxsU3luY0tleXMucHVzaChjLmtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeSh7IGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksIGtleXM6IGFsbFN5bmNLZXlzIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChzeW5jUGF5bG9hZCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVtb3ZlIGFueSBleGlzdGluZyBzeW5jIGtleSBub3QgaW4gb3VyIHBheWxvYWQuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFsbFN5bmNLZXlzLmxlbmd0aDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gT3ZlciBxdW90YSAob3IgTUFYX0lURU1TKSBcdTIwMTQgZHJvcCB0aGUgbG93ZXN0LXByaW9yaXR5IHRpZXIgc3RpbGxcbiAgICAgICAgICAgIC8vIHByZXNlbnQgYW5kIHJldHJ5LiBOZXZlciBkcm9wIFAwL1AxLlxuICAgICAgICAgICAgY29uc3QgbWF4UHJpb3JpdHkgPSB0aWVycy5yZWR1Y2UoKG0sIHQpID0+IE1hdGgubWF4KG0sIHQucHJpb3JpdHkpLCAtMSk7XG4gICAgICAgICAgICBpZiAobWF4UHJpb3JpdHkgPD0gUFJJT1JJVFkuUDFfUFJPRklMRVMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlOyAvLyBub3RoaW5nIGRyb3BwYWJsZSBsZWZ0OyBQMC9QMSBtdXN0IHN1cnZpdmUgb3IgZmFpbCBsb3VkbHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IHRpZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpZXJzID0gdGllcnMuZmlsdGVyKHQgPT4gdC5wcmlvcml0eSA8IG1heFByaW9yaXR5KTtcbiAgICAgICAgICAgIGlmICh0aWVycy5sZW5ndGggPT09IGJlZm9yZSkgdGhyb3cgZTsgLy8gbm8gcHJvZ3Jlc3MgXHUyMDE0IGJhaWxcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBzeW5jLnNldCBvdmVyIHF1b3RhIFx1MjAxNCBkcm9wcGVkIHByaW9yaXR5ICR7bWF4UHJpb3JpdHl9IHRpZXIsIHJldHJ5aW5nYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIFB1bGwtbWVyZ2UgQkVGT1JFIGJ1aWxkaW5nOiBvcnBoYW4tY2xlYW51cCBiZWxvdyB3aXBlcyBhbnkgbWlycm9yIGtleVxuICAgICAgICAvLyBhYnNlbnQgZnJvbSB0aGlzIGRldmljZSdzIHBheWxvYWQsIHNvIHdlIG11c3QgZmlyc3QgYWJzb3JiIHJlbW90ZVxuICAgICAgICAvLyBzdGF0ZSAoZXNwZWNpYWxseSByZW1vdGUgdG9tYnN0b25lcywgd2hpY2ggdGhlbiBzdXBwcmVzcyB0aGUgbWF0Y2hpbmdcbiAgICAgICAgLy8gZG9jcy9rZXlzIGZyb20gdGhlIHBheWxvYWQgd2UgYXJlIGFib3V0IHRvIGJ1aWxkKS4gV2l0aG91dCB0aGlzIGFcbiAgICAgICAgLy8gZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIHdvdWxkIHJlLXB1c2ggdGhlIGl0ZW0uXG4gICAgICAgIGNvbnN0IHJlbW90ZSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAocmVtb3RlKSBhd2FpdCBtZXJnZUludG9Mb2NhbChyZW1vdGUpO1xuXG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBpbmNsdWRlZCBzZXQgcmVzcGVjdGluZyB0aGUgaW4tY29kZSBieXRlL2l0ZW0gYnVkZ2V0LlxuICAgICAgICBsZXQgdXNlZEJ5dGVzID0gMDtcbiAgICAgICAgbGV0IHVzZWRJdGVtcyA9IDA7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBidWRnZXRFeGhhdXN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmIChidWRnZXRFeGhhdXN0ZWQpIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1ZhbHVlKGVudHJ5LmtleSwgZW50cnkuanNvblN0cmluZyk7XG4gICAgICAgICAgICBsZXQgZW50cnlTaXplID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBlbnRyeVNpemUgKz0gYy5rZXkubGVuZ3RoICsgKHR5cGVvZiBjLnZhbHVlID09PSAnc3RyaW5nJyA/IGMudmFsdWUubGVuZ3RoIDogSlNPTi5zdHJpbmdpZnkoYy52YWx1ZSkubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVzZWRCeXRlcyArIGVudHJ5U2l6ZSA+IFNZTkNfUVVPVEEgLSA1MDAgfHwgdXNlZEl0ZW1zICsgY2h1bmtzLmxlbmd0aCA+IE1BWF9JVEVNUyAtIDUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkucHJpb3JpdHkgPD0gUFJJT1JJVFkuUDNfQVBJS0VZUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcml0aWNhbCBkYXRhIChpbmNsLiBQMCB0b21ic3RvbmVzKSBcdTIwMTQgaW5jbHVkZSBhbnl3YXk7IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBydW50aW1lIHF1b3RhIGZhbGxiYWNrIHdpbGwgc2hlZCBidWxreSB0aWVycyBpZiB0aGUgQVBJIHJlamVjdHMuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU3luY01hbmFnZXJdIEJ1ZGdldCBleGhhdXN0ZWQgYXQgcHJpb3JpdHkgJHtlbnRyeS5wcmlvcml0eX0sIHNraXBwaW5nIHJlbWFpbmluZyBlbnRyaWVzYCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldEV4aGF1c3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaCh7IHByaW9yaXR5OiBlbnRyeS5wcmlvcml0eSwgY2h1bmtzIH0pO1xuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHt3cml0dGVufSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsRnJvbVN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm4gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICBpZiAoIXJhdyB8fCBPYmplY3Qua2V5cyhyYXcpLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbWV0YVN0ciA9IHJhd1tTWU5DX01FVEFfS0VZXTtcbiAgICAgICAgaWYgKCFtZXRhU3RyKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQgbWV0YTtcbiAgICAgICAgdHJ5IHsgbWV0YSA9IEpTT04ucGFyc2UobWV0YVN0cik7IH0gY2F0Y2ggeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICAvLyBDb2xsZWN0IHRoZSBub24tY2h1bmssIG5vbi1tZXRhIGtleXNcbiAgICAgICAgY29uc3QgZGF0YUtleXMgPSBtZXRhLmtleXMuZmlsdGVyKGsgPT4gIWsuc3RhcnRzV2l0aChDSFVOS19QUkVGSVgpICYmIGsgIT09IFNZTkNfTUVUQV9LRVkpO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGFLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCByYXcpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0Ll9zeW5jTWV0YSA9IG1ldGE7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1bGxGcm9tU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1lcmdlIGxvZ2ljXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gVGhlIGJhY2tncm91bmQncyBvd24gd2F5IHRvIGhlYXIgb2YgbW92ZWQgcHJvZmlsZXMuIEEgd29ya2VyIGNhbm5vdCBtZXNzYWdlXG4vLyBpdHNlbGYsIHNvIGEgbWVyZ2UgcnVubmluZyB0aGVyZSBjYWxscyB0aGlzOyBhIHBhZ2Ugc2VuZHMgYSBtZXNzYWdlLlxubGV0IHByb2ZpbGVNb3ZlSGFuZGxlciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9maWxlTW92ZUhhbmRsZXIoaGFuZGxlcikge1xuICAgIHByb2ZpbGVNb3ZlSGFuZGxlciA9IGhhbmRsZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKSB7XG4gICAgaWYgKHByb2ZpbGVNb3ZlSGFuZGxlcikge1xuICAgICAgICBwcm9maWxlTW92ZUhhbmRsZXIobW92ZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Byb2ZpbGVzTW92ZWQnLCBwYXlsb2FkOiBtb3ZlcyB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmFja2dyb3VuZCB1bmF2YWlsYWJsZTogd2hhdCBpcyBrZXllZCBieSBpbmRleCBjaGVja3MgaXRzIGlkZW50aXR5ICovIH1cbn1cblxuLyoqXG4gKiBXaGVyZSBlYWNoIHByb2ZpbGUgd2VudC4gQW4gdW50b3VjaGVkIHJlY29yZCBpcyBmb3VuZCBhcyBpdHNlbGYsIGFuZCBvbmUgc3luY1xuICogcmVwbGFjZWQgaXMgZm91bmQgYnkgaWRlbnRpdHkuIEVhY2ggcGxhY2UgaXMgY2xhaW1lZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0W119IGJlZm9yZVxuICogQHBhcmFtIHtvYmplY3RbXX0gYWZ0ZXJcbiAqIEBwYXJhbSB7KHByb2ZpbGU6IG9iamVjdCkgPT4gP3N0cmluZ30gaWRlbnRpdHlPZlxuICogQHJldHVybnMge0FycmF5PFtudW1iZXIsID9udW1iZXJdPn0gW29sZCBpbmRleCwgbmV3IGluZGV4IG9yIG51bGwgaWYgZ29uZV0sIGNoYW5nZXMgb25seVxuICovXG5mdW5jdGlvbiBwcm9maWxlTW92ZXMoYmVmb3JlLCBhZnRlciwgaWRlbnRpdHlPZikge1xuICAgIGNvbnN0IHBsYWNlcyA9IGJlZm9yZS5tYXAocHJvZmlsZSA9PiBhZnRlci5pbmRleE9mKHByb2ZpbGUpKTtcbiAgICBjb25zdCBjbGFpbWVkID0gbmV3IFNldChwbGFjZXMpO1xuICAgIGJlZm9yZS5mb3JFYWNoKChwcm9maWxlLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwcm9maWxlKTtcbiAgICAgICAgaWYgKHBsYWNlc1tpXSA+PSAwIHx8ICFpZCkgcmV0dXJuO1xuICAgICAgICBwbGFjZXNbaV0gPSBhZnRlci5maW5kSW5kZXgoKG90aGVyLCBqKSA9PiAhY2xhaW1lZC5oYXMoaikgJiYgaWRlbnRpdHlPZihvdGhlcikgPT09IGlkKTtcbiAgICAgICAgY2xhaW1lZC5hZGQocGxhY2VzW2ldKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGxhY2VzLmZsYXRNYXAoKHBsYWNlLCBpKSA9PiAocGxhY2UgPT09IGkgPyBbXSA6IFtbaSwgcGxhY2UgPCAwID8gbnVsbCA6IHBsYWNlXV0pKTtcbn1cblxuLyoqXG4gKiBNZXJnZSBzeW5jIGRhdGEgaW50byBsb2NhbCBzdG9yYWdlIHdpdGggY29uZmxpY3QgcmVzb2x1dGlvbi5cbiAqXG4gKiBDT05ESVRJT04gMyAoaXNzdWUgIzMgbG9vcCBpbnZhcmlhbnQpOiBldmVyeSB3cml0ZSBoZXJlIGdvZXMgdGhyb3VnaCB0aGUgcmF3XG4gKiBtb2R1bGUtbGV2ZWwgYHN0b3JhZ2VgICg9IGFwaS5zdG9yYWdlLmxvY2FsKSB2aWEgYSBzaW5nbGUgYHN0b3JhZ2Uuc2V0YC4gSXRcbiAqIE1VU1QgTk9UIGNhbGwgdGhlIHN0b3JlLWxheWVyIGhlbHBlcnMgKGRlbGV0ZURvY3VtZW50TG9jYWwgLyBzYXZlRG9jdW1lbnRMb2NhbFxuICogLyBkZWxldGVBcGlLZXkgLyBzYXZlQXBpS2V5KSwgYmVjYXVzZSB0aG9zZSBjYWxsIHNjaGVkdWxlU3luY1B1c2goKSBcdTIwMTQgYSBtZXJnZVxuICogdGhhdCBzY2hlZHVsZWQgYSBwdXNoIHdvdWxkIHR1cm4gZXZlcnkgaW5jb21pbmcgc3luYyBpbnRvIGFuIG91dGdvaW5nIG9uZSBhbmRcbiAqIGxvb3AuIEEgcmVncmVzc2lvbiB0ZXN0IGFzc2VydHMgbWVyZ2VJbnRvTG9jYWwgbmV2ZXIgc2NoZWR1bGVzIGEgcHVzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBzeW5jRGF0YSA9IHsgLi4uc3luY0RhdGEsIHByb2ZpbGVzOiByZWRhY3RQcm9maWxlcyhzeW5jRGF0YS5wcm9maWxlcykgfTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZWN0IGZyZXNoIGluc3RhbGw6IG5vIHByb2ZpbGVzLCBvciBhIHNpbmdsZSB1bnRvdWNoZWQgZGVmYXVsdCBwcm9maWxlLlxuICAgIC8vIChEZWZhdWx0IGtleXMgYXJlIG5vdyB3cmFwcGVkIGF0IHJlc3QsIHNvIGBwcml2S2V5YCBpcyB0cnV0aHkgZXZlbiBvbiBhXG4gICAgLy8gZnJlc2ggaW5zdGFsbCBcdTIwMTQgZGV0ZWN0IHRoZSB1bnRvdWNoZWQgZGVmYXVsdCBieSBpdHMgbmFtZSArIGFic2VuY2Ugb2YgYW55XG4gICAgLy8gcGVyLXNpdGUgZ3JhbnRzIGluc3RlYWQuKVxuICAgIC8vXG4gICAgLy8gQzE6IGEgbG9uZSBwcm9maWxlIGlzIG9ubHkgXCJ1bnRvdWNoZWQvZnJlc2hcIiB3aGVuIGl0IGNhcnJpZXMgbm8gaWRlbnRpdHkuXG4gICAgLy8gQSBsb25lIEJVTktFUiBwcm9maWxlIGhhcyBwcml2S2V5OicnIGJ1dCBJUyBhIHJlYWwgaWRlbnRpdHkgKHR5cGUvYnVua2VyVXJsXG4gICAgLy8gL3JlbW90ZVB1YmtleSksIGFuZCBtdXN0IG5vdCBiZSB0cmVhdGVkIGFzIGZyZXNoIGFuZCB3aXBlZCBieSBhIHN5bmMgcHVsbC5cbiAgICBjb25zdCBoYXNJZGVudGl0eSA9IChwKSA9PiAhIShwICYmIChcbiAgICAgICAgcC5wcml2S2V5IHx8IHAucHViS2V5IHx8IHAudHlwZSA9PT0gJ2J1bmtlcicgfHwgcC5idW5rZXJVcmwgfHwgcC5yZW1vdGVQdWJrZXlcbiAgICApKTtcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkgJiYgIWhhc0lkZW50aXR5KGxvbmUpKSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gU3RhYmxlIGlkZW50aXR5IGZvciBwcm9maWxlIG1hdGNoaW5nIC8gdG9tYnN0b25lczogcHViS2V5LCBlbHNlIHRoZVxuICAgIC8vIGJ1bmtlcidzIHJlbW90ZVB1YmtleS4gTWF0Y2hlcyBidWlsZFN5bmNQYXlsb2FkJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBBQ1RJVkUgaWRlbnRpdHkgQkVGT1JFIGFueSByZW9yZGVyaW5nL3JlbW92YWwgc28gdGhlIGFjdGl2ZVxuICAgIC8vIGluZGV4IGNhbiBmb2xsb3cgdGhhdCBpZGVudGl0eSB0aHJvdWdoIHRoZSBtZXJnZSAoYSBrZXkgbWFuYWdlciBtdXN0IG5vdFxuICAgIC8vIHNpbGVudGx5IHN3aXRjaCB3aGljaCBpZGVudGl0eSBpcyBhY3RpdmUganVzdCBiZWNhdXNlIGEgcHJvZmlsZSBvcmRlcmVkXG4gICAgLy8gYmVmb3JlIGl0IHdhcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlKS5cbiAgICBjb25zdCBsb2NhbEFjdGl2ZUluZGV4ID0gKGxvY2FsLnByb2ZpbGVJbmRleCAhPSBudWxsKSA/IGxvY2FsLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgY29uc3QgYWN0aXZlSWQgPSAobG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgID8gaWRlbnRpdHlPZihsb2NhbC5wcm9maWxlc1tsb2NhbEFjdGl2ZUluZGV4XSlcbiAgICAgICAgOiBudWxsO1xuXG4gICAgLy8gLS0tIFByb2ZpbGUgdG9tYnN0b25lcyAoaXNzdWUgIzMpIFx1MjAxNCB1bmlvbiBsb2NhbCArIHJlbW90ZSwgbWF4IHBlciBpZGVudGl0eSAtLS1cbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSB7IC4uLihsb2NhbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkUHJvZmlsZXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRQcm9maWxlc1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRQcm9maWxlc1tpZF0pIGRlbGV0ZWRQcm9maWxlc1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlcyAoUDEpIFx1MjAxNCBwdWJrZXkta2V5ZWQgbWVyZ2UgKyB0b21ic3RvbmUgcmVtb3ZhbCAtLS1cbiAgICAvLyBNYXRjaCBieSBzdGFibGUgaWRlbnRpdHkgcmF0aGVyIHRoYW4gYXJyYXkgaW5kZXgsIHNvIGEgcmVvcmRlcmVkIG9yIHBhcnRpYWxcbiAgICAvLyBzeW5jIHBheWxvYWQgY2Fubm90IG92ZXJ3cml0ZSBvbmUgaWRlbnRpdHkncyBrZXkgbWF0ZXJpYWwgd2l0aCBhbm90aGVyJ3MuXG4gICAgbGV0IG1lcmdlZFByb2ZpbGVzID0gbG9jYWwucHJvZmlsZXMgPyBbLi4ubG9jYWwucHJvZmlsZXNdIDogbnVsbDtcbiAgICBsZXQgcHJvZmlsZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IHN5bmNEYXRhLnByb2ZpbGVzLnNsaWNlKCk7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleEJ5SWRlbnRpdHkgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiAhaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN5bmNQcm9maWxlIG9mIHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IGluZGV4QnlJZGVudGl0eS5nZXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFByb2ZpbGUgPSBtZXJnZWRQcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgYWRvcHQgaXQgYnV0IHByZXNlcnZlIGxvY2FsIHBlci1zaXRlIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlc1tpXSA9IHsgLi4uc3luY1Byb2ZpbGUsIGhvc3RzOiBsb2NhbFByb2ZpbGUuaG9zdHMgfHwge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZ2VudWluZWx5IG5ldyBpZGVudGl0eSBub3QgcHJlc2VudCBsb2NhbGx5IFx1MjAxNCBhcHBlbmQgaXQuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzLnB1c2goc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIGtleWxlc3MgcmVtb3RlIHByb2ZpbGUgY2Fubm90IGJlIHJlY29uY2lsZWQgdG8gYSBsb2NhbCBvbmVcbiAgICAgICAgICAgICAgICAvLyBzYWZlbHkgKG5vIGlkZW50aXR5IHRvIG1hdGNoIG9uKSwgc28gaXQgaXMgc2tpcHBlZC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGx5IHByb2ZpbGUgdG9tYnN0b25lczogcmVtb3ZlIGFueSBtZXJnZWQgcHJvZmlsZSB3aG9zZSBpZGVudGl0eSBoYXNcbiAgICAvLyAodXBkYXRlZEF0IDw9IGRlbGV0ZWRBdCkgXHUyMDE0IGRlbGV0aW9uIHdpbnMgdGllcywgY29uc2lzdGVudCB3aXRoIGRvY3Mva2V5cy5cbiAgICAvLyBBIHJlY3JlYXRlZCBwcm9maWxlICh1cGRhdGVkQXQgPiBkZWxldGVkQXQpIHN1cnZpdmVzLiBOZXZlciBwcnVuZSB0b21ic3RvbmVzLlxuICAgIGlmIChtZXJnZWRQcm9maWxlcyAmJiBPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qga2VwdCA9IG1lcmdlZFByb2ZpbGVzLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gaWQgIT0gbnVsbCA/IGRlbGV0ZWRQcm9maWxlc1tpZF0gOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuICEodHMgIT0gbnVsbCAmJiAocC51cGRhdGVkQXQgfHwgMCkgPD0gdHMpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2FmZXR5OiBuZXZlciBsZXQgYSBzeW5jIG1lcmdlIGxlYXZlIFpFUk8gcHJvZmlsZXMgKHRoYXQgd291bGQgb3JwaGFuXG4gICAgICAgIC8vIHRoZSBhY3RpdmUgaW5kZXggYW5kIGJyaWNrIHRoZSBVSSkuIElmIHJlbW92YWwgd291bGQgZW1wdHkgdGhlIGxpc3QsXG4gICAgICAgIC8vIGtlZXAgdGhlIHByb2ZpbGVzIGFzLWlzIFx1MjAxNCB0aGUgbG9jYWwgdXNlciBjYW4gc3RpbGwgZGVsZXRlIGRlbGliZXJhdGVseS5cbiAgICAgICAgLy8gRGVsaWJlcmF0ZSB0cmFkZS1vZmY6IGNyb3NzLWRldmljZSBkZWxldGlvbiBkb2VzIE5PVCBjb252ZXJnZSBvbiBhXG4gICAgICAgIC8vIGRldmljZSB3aGVyZSBhcHBseWluZyBpdCB3b3VsZCBsZWF2ZSB6ZXJvIHByb2ZpbGVzOyB0aGUgcHJvZmlsZSBzdGF5c1xuICAgICAgICAvLyB0b21ic3RvbmUtc3VwcHJlc3NlZCBvbiBlbWl0LCBzbyBpdCBkb2VzIG5vdCByZS1wcm9wYWdhdGUgdG8gb3RoZXJzLlxuICAgICAgICBpZiAoa2VwdC5sZW5ndGggIT09IG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAmJiBrZXB0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzID0ga2VwdDtcbiAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbW92ZXMgPSBbXTtcbiAgICBpZiAocHJvZmlsZXNDaGFuZ2VkICYmIG1lcmdlZFByb2ZpbGVzKSB7XG4gICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBtZXJnZWRQcm9maWxlcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdmVzID0gcHJvZmlsZU1vdmVzKGxvY2FsLnByb2ZpbGVzIHx8IFtdLCBtZXJnZWRQcm9maWxlcywgaWRlbnRpdHlPZik7XG4gICAgICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwICYmIGxvY2FsLmJ1bmtlclNlc3Npb25zKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmJ1bmtlclNlc3Npb25zID0gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGxvY2FsLmJ1bmtlclNlc3Npb25zLCBtb3Zlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIFx1MjAxNCBGT0xMT1cgVEhFIEFDVElWRSBJREVOVElUWSBhY3Jvc3MgdGhlIG1lcmdlIC0tLVxuICAgIC8vIFRoZSBhY3RpdmUgaW5kZXggdHJhY2tzIHRoZSBhY3RpdmUgaWRlbnRpdHksIG5vdCBhIHJhdyBzbG90OiBpZiBhIHByb2ZpbGVcbiAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgYWN0aXZlIG9uZSBpcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlLCB0aGUgaW5kZXhcbiAgICAvLyBzaGlmdHMgc28gdGhlIFNBTUUgaWRlbnRpdHkgc3RheXMgYWN0aXZlLiBUaGUgaW5kZXggb25seSBtb3ZlcyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGlkZW50aXR5IHdoZW4gdGhlIGFjdGl2ZSBvbmUgaXMgaXRzZWxmIGdvbmUgKHRvbWJzdG9uZWQpLCBvciBvbiBhXG4gICAgLy8gZnJlc2ggYWRvcHQgXHUyMDE0IHRoZW4gaXQgZmFsbHMgYmFjayB0byB0aGUgc2FmZSBjbGFtcC5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgZGVzaXJlZEluZGV4O1xuICAgICAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMgJiYgaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggYWRvcHQgXHUyMDE0IHRha2Ugc3luYydzIGFjdGl2ZSBpbmRleCwgY2xhbXBlZCBpbnRvIHJhbmdlLlxuICAgICAgICAgICAgY29uc3QgYmFzZSA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsID8gc3luY0RhdGEucHJvZmlsZUluZGV4IDogMDtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGJhc2UsIDApLCBtZXJnZWRQcm9maWxlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd2VkID0gYWN0aXZlSWQgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gbWVyZ2VkUHJvZmlsZXMuZmluZEluZGV4KHAgPT4gaWRlbnRpdHlPZihwKSA9PT0gYWN0aXZlSWQpXG4gICAgICAgICAgICAgICAgOiAtMTtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IGZvbGxvd2VkID49IDBcbiAgICAgICAgICAgICAgICA/IGZvbGxvd2VkXG4gICAgICAgICAgICAgICAgOiBNYXRoLm1pbihNYXRoLm1heChsb2NhbEFjdGl2ZUluZGV4LCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlc2lyZWRJbmRleCAhPT0gbG9jYWwucHJvZmlsZUluZGV4KSB7XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IGRlc2lyZWRJbmRleDtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSAtLS1cbiAgICAvLyBBMjogYGlzRW5jcnlwdGVkYCBpcyBOT1QgbWVyZ2VkLiBUaGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgaXMgYSBwZXItZGV2aWNlXG4gICAgLy8gZmFjdCBwcm92ZW4gYnkgdGhlIGxvY2FsIHZlcmlmaWVyOyBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzXG4gICAgLy8gZGV2aWNlIGludG8gYSBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gLS0tIFNldHRpbmdzIChQMikgXHUyMDE0IGxhc3Qtd3JpdGUtd2lucyAtLS1cbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChzeW5jRGF0YVtrZXldICE9IG51bGwgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgLy8gRm9yIHZlcnNpb24sIG9ubHkgYWNjZXB0IGEgbnVtZXJpY2FsbHktaGlnaGVyIG9uZSAoJzEuMTAuMCcgPiAnMS45LjAnKS5cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIGNvbXBhcmVTZW12ZXIoc3luY0RhdGEudmVyc2lvbiwgbG9jYWwudmVyc2lvbikgPD0gMCkgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBkZWxldGVkQXQgcGVyIGtleSAtLS1cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkRG9jcyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkRG9jcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1twYXRoXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZERvY3NbcGF0aF0pIGRlbGV0ZWREb2NzW3BhdGhdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSB7IC4uLihsb2NhbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZEtleXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRLZXlzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZEtleXNbaWRdKSBkZWxldGVkS2V5c1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgLy8gQnVpbGQgdGhlIG1lcmdlZCBrZXkgc2V0LCBmb2xkIGluIGFueSByZW1vdGUga2V5cywgdGhlbiBhcHBseSBrZXlcbiAgICAvLyB0b21ic3RvbmVzLiBSdW5zIGV2ZW4gd2hlbiB0aGUgcHVsbCBjYXJyaWVzIE5PIGFwaUtleVZhdWx0LCBzbyBhXG4gICAgLy8gZGVsZXRlLW9ubHkgcHVsbCBjYW4gc3RpbGwgcmVtb3ZlIGEgbG9jYWxseS1oZWxkIGtleS5cbiAgICB7XG4gICAgICAgIGxldCBiYXNlVmF1bHQgPSBsb2NhbC5hcGlLZXlWYXVsdCB8fCBudWxsO1xuICAgICAgICBsZXQgbWVyZ2VkS2V5cyA9IHsgLi4uKChsb2NhbC5hcGlLZXlWYXVsdCAmJiBsb2NhbC5hcGlLZXlWYXVsdC5rZXlzKSB8fCB7fSkgfTtcbiAgICAgICAgbGV0IGFwaUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCghbG9jYWwuYXBpS2V5VmF1bHQgfHwgaXNGcmVzaCkgJiYgc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgICAgIGJhc2VWYXVsdCA9IHN5bmNEYXRhLmFwaUtleVZhdWx0O1xuICAgICAgICAgICAgbWVyZ2VkS2V5cyA9IHsgLi4uKHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge30pIH07XG4gICAgICAgICAgICBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICAgICAgY29uc3Qgc3luY0tleXMgPSBzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIHN5bmNLZXldIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNLZXlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5ID0gbWVyZ2VkS2V5c1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbEtleSB8fCAoc3luY0tleS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxLZXkudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZEtleXNbaWRdID0gc3luY0tleTtcbiAgICAgICAgICAgICAgICAgICAgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHRvbWJzdG9uZXMuIERlbGV0aW9uIHdpbnMgdGllcyAoYDw9YCksIGNvbnNpc3RlbnQgd2l0aCB0aGVcbiAgICAgICAgLy8gZW1pdC1zaWRlIHN1cHByZXNzaW9uIChgZGVsZXRlZEF0ID49IHVwZGF0ZWRBdGApOiBhIGtleSB3aG9zZVxuICAgICAgICAvLyB1cGRhdGVkQXQgZXF1YWxzIHRoZSB0b21ic3RvbmUgd2FzIGRlbGV0ZWQgaW4gdGhhdCBzYW1lIHNlY29uZCwgc28gaXRcbiAgICAgICAgLy8gbXVzdCBOT1QgYmUgcmUtYWRkZWQgZnJvbSB0aGUgbWlycm9yIG9uIHRoZSBkZWxldGluZyBkZXZpY2UuIFRoZVxuICAgICAgICAvLyB0b21ic3RvbmUgaXMgTkVWRVIgcHJ1bmVkIGhlcmUgXHUyMDE0IHBydW5pbmcgaXQgd291bGQgbGV0IHRoZSB2ZXJ5IGNvcHkgaXRcbiAgICAgICAgLy8ganVzdCByZW1vdmVkIHJlc3VycmVjdCBvbiB0aGUgbmV4dCBtZXJnZS4gVG9tYnN0b25lcyBhcmUgY2xlYXJlZCBvbmx5XG4gICAgICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5IHRoZSB1c2VyLlxuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIE9iamVjdC5rZXlzKG1lcmdlZEtleXMpKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGRlbGV0ZWRLZXlzW2lkXTtcbiAgICAgICAgICAgIGlmICh0cyAhPSBudWxsICYmIChtZXJnZWRLZXlzW2lkXS51cGRhdGVkQXQgfHwgMCkgPD0gdHMpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbWVyZ2VkS2V5c1tpZF07XG4gICAgICAgICAgICAgICAgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwaUNoYW5nZWQgJiYgYmFzZVZhdWx0KSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0geyAuLi5iYXNlVmF1bHQsIGtleXM6IG1lcmdlZEtleXMgfTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCBtZXJnZWREb2NzID0geyAuLi4obG9jYWwudmF1bHREb2NzIHx8IHt9KSB9O1xuICAgIGxldCBkb2NzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCd2YXVsdERvYzonKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRvYyA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghZG9jIHx8ICFkb2MucGF0aCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGxvY2FsRG9jID0gbWVyZ2VkRG9jc1tkb2MucGF0aF07XG4gICAgICAgIGlmICghbG9jYWxEb2MgfHwgKGRvYy51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxEb2MudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICBtZXJnZWREb2NzW2RvYy5wYXRoXSA9IGRvYztcbiAgICAgICAgICAgIGRvY3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBBcHBseSBkb2MgdG9tYnN0b25lcy4gRGVsZXRpb24gd2lucyB0aWVzIChgPD1gKSwgYW5kIHRvbWJzdG9uZXMgYXJlIE5FVkVSXG4gICAgLy8gcHJ1bmVkIGhlcmUgXHUyMDE0IHNhbWUgcmF0aW9uYWxlIGFzIHRoZSBBUEkga2V5cyBhYm92ZS5cbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgT2JqZWN0LmtleXMobWVyZ2VkRG9jcykpIHtcbiAgICAgICAgY29uc3QgdHMgPSBkZWxldGVkRG9jc1twYXRoXTtcbiAgICAgICAgaWYgKHRzICE9IG51bGwgJiYgKG1lcmdlZERvY3NbcGF0aF0udXBkYXRlZEF0IHx8IDApIDw9IHRzKSB7XG4gICAgICAgICAgICBkZWxldGUgbWVyZ2VkRG9jc1twYXRoXTtcbiAgICAgICAgICAgIGRvY3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9jc0NoYW5nZWQpIHtcbiAgICAgICAgdXBkYXRlcy52YXVsdERvY3MgPSBtZXJnZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBQZXJzaXN0IHRoZSB0b21ic3RvbmUgc2V0cy4gVGhlc2UgYXJlIGEgUFVSRSBVTklPTiAobWF4IGRlbGV0ZWRBdCBwZXJcbiAgICAvLyBrZXkpIFx1MjAxNCB0aGUgbWVyZ2UgbmV2ZXIgcmVtb3ZlcyBhIHRvbWJzdG9uZSwgc28gdGhleSBhcmUgcmV0YWluZWQgZm9yZXZlclxuICAgIC8vIGFuZCBhbiBvZmZsaW5lIGRldmljZSBjYW5ub3QgcmVzdXJyZWN0IGEgZGVsZXRpb24uIFRoZXkgYXJlIGNsZWFyZWQgb25seVxuICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVEb2N1bWVudExvY2FsL3NhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5XG4gICAgLy8gdGhlIHVzZXIgdmlhIGNsZWFyRGVsZXRpb25IaXN0b3J5LlxuICAgIC8vXG4gICAgLy8gUmVzaWR1YWwgKGFjY2VwdGVkLCBkb2N1bWVudGVkKTogcHVyZSBjcm9zcy1kZXZpY2UgY2xvY2sgc2tldyBcdTIwMTQgYSBsaXZlXG4gICAgLy8gY29weSB3aG9zZSB1cGRhdGVkQXQgaXMgZ2VudWluZWx5IE5FV0VSIHRoYW4gdGhlIGRlbGV0ZSdzIHRpbWVzdGFtcCBcdTIwMTQgd2luc1xuICAgIC8vIHVuZGVyIHRoZSBgPD1gIHJ1bGUgYW5kIGlzIGtlcHQuIFRoYXQgaXMgYW4gaW5oZXJlbnQgbGFzdC13cml0ZS13aW5zIGxpbWl0XG4gICAgLy8gdGhhdCB0b21ic3RvbmVzIGRvIG5vdCByZXNvbHZlOyBcImZpeGluZ1wiIGl0IGJ5IHBydW5pbmcgd291bGQgcmVpbnRyb2R1Y2VcbiAgICAvLyB0aGUgc2FtZS1zZWNvbmQgcmVzdXJyZWN0aW9uIGJ1Zywgc28gaXQgaXMgbGVmdCBhcy1pcy5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkRG9jcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkRG9jcyA9IGRlbGV0ZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRLZXlzKSAhPT0gSlNPTi5zdHJpbmdpZnkobG9jYWwuZGVsZXRlZEtleXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZEtleXMgPSBkZWxldGVkS2V5cztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkUHJvZmlsZXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZFByb2ZpbGVzID0gZGVsZXRlZFByb2ZpbGVzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAvLyBSYXcgbG9jYWwgd3JpdGUgT05MWSBcdTIwMTQgbmV2ZXIgc2NoZWR1bGVTeW5jUHVzaCAobG9vcCBpbnZhcmlhbnQpLlxuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG4gICAgaWYgKG1vdmVzLmxlbmd0aCA+IDApIGF3YWl0IGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlbGV0aW9uLWhpc3RvcnkgKHRvbWJzdG9uZSkgcmV0ZW50aW9uIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRvdGFsIG51bWJlciBvZiByZXRhaW5lZCBkZWxldGlvbiByZWNvcmRzIChkb2NzICsga2V5cykuIEdyb3dzIG92ZXIgdGhlIGxpZmVcbiAqIG9mIHRoZSBpbnN0YWxsIGJlY2F1c2UgdG9tYnN0b25lcyBhcmUga2VwdCBmb3JldmVyIChhbiBvZmZsaW5lIGRldmljZSB0aGF0XG4gKiBuZXZlciBsZWFybmVkIG9mIGEgZGVsZXRpb24gbXVzdCBub3QgYmUgYWJsZSB0byByZXN1cnJlY3QgdGhlIGl0ZW0pLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9tYnN0b25lQ291bnQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgY29uc3QgZG9jcyA9IGRhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkRG9jcyA6IHt9O1xuICAgIGNvbnN0IGtleXMgPSBkYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZEtleXMgOiB7fTtcbiAgICBjb25zdCBwcm9maWxlcyA9IGRhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRQcm9maWxlcyA6IHt9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhkb2NzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhrZXlzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhwcm9maWxlcykubGVuZ3RoO1xufVxuXG4vKipcbiAqIFdhcm5pbmcgbGV2ZWwgZm9yIGEgZ2l2ZW4gcmV0YWluZWQtZGVsZXRpb24gY291bnQ6XG4gKiAgIDAgPSBmaW5lLCAxID0gZ2VudGxlIG51ZGdlICg+PSA4KSwgMiA9IHN0cm9uZ2VyIHdhcm5pbmcgKD49IDE2KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbWJzdG9uZVdhcm5pbmdMZXZlbChjb3VudCkge1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9TVFJPTkcpIHJldHVybiAyO1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9HRU5UTEUpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5LiBJbmZvcm1lZC11c2VyIGNob2ljZTogYSBkZXZpY2UgdGhhdCBoYXNcbiAqIGJlZW4gb2ZmbGluZSBzaW5jZSBiZWZvcmUgb25lIG9mIHRoZXNlIGRlbGV0aW9ucyBjYW4sIG9uIGl0cyBuZXh0IHN5bmMsXG4gKiByZS1hZGQgdGhlIGl0ZW0gXHUyMDE0IGJlY2F1c2UgdGhlIHJlY29yZCB0aGF0IHRvbGQgZXZlcnlvbmUgaXQgd2FzIGRlbGV0ZWQgaXNcbiAqIG5vdyBnb25lLiBTY2hlZHVsZXMgYSBwdXNoIHNvIHRoZSBjbGVhcmVkIHN0YXRlIHByb3BhZ2F0ZXMgdG8gdGhlIG1pcnJvci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGVsZXRpb25IaXN0b3J5KCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuY3J5cHRpb24tZmxhZyBzZWxmLWhlYWwgKEEyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2xlYXIgYSBib2d1cyBgaXNFbmNyeXB0ZWQ9dHJ1ZWAgd2hlbiB0aGlzIGRldmljZSBob2xkcyBubyBldmlkZW5jZSBvZiByZWFsXG4gKiBwYXNzd29yZCBwcm90ZWN0aW9uIFx1MjAxNCBubyBwYXNzd29yZCB2ZXJpZmllciAocGFzc3dvcmRIYXNoKSBBTkQgbm8gcHJvZmlsZSBrZXlcbiAqIHRoYXQgaXMgYSBQQVNTV09SRCBibG9iLlxuICpcbiAqIEdhdGluZyBkZXRhaWwgKGNyaXRpY2FsKTogZXZpZGVuY2UgaXMgYSBQQVNTV09SRCBibG9iIChpc1Bhc3N3b3JkQmxvYiksIE5PVCBhXG4gKiBkZXZpY2Uta2V5IGJsb2IuIFNpbmNlIHYxLjcuMCBldmVyeSBrZXkgaXMgd3JhcHBlZCBhdCByZXN0IGV2ZW4gZm9yIHRoZVxuICogcGFzc3dvcmRsZXNzIExldmVsLTAgdXNlciwgc28gYSBub3JtYWwgcGFzc3dvcmRsZXNzIGluc3RhbGwgaXMgZnVsbCBvZlxuICogZGV2aWNlLWtleSBjaXBoZXJ0ZXh0OyBrZXlpbmcgb2ZmIHRoYXQgd291bGQgd3JvbmdseSBrZWVwIHRoZSBmbGFnIGxhdGNoZWQuXG4gKiBPbmx5IGEgcGFzc3dvcmQtZGVyaXZlZCBibG9iIChvciB0aGUgdmVyaWZpZXIpIHByb3ZlcyBhIG1hc3RlciBwYXNzd29yZC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gdHJ1ZSBpZiBhIGJvZ3VzIGZsYWcgd2FzIGNsZWFyZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKCFkYXRhLmlzRW5jcnlwdGVkKSByZXR1cm4gZmFsc2U7ICAgLy8gbm90aGluZyBsYXRjaGVkIFx1MjAxNCBub3RoaW5nIHRvIGhlYWxcbiAgICBpZiAoZGF0YS5wYXNzd29yZEhhc2gpIHJldHVybiBmYWxzZTsgICAvLyByZWFsIHZlcmlmaWVyIHByZXNlbnQgXHUyMDE0IGtlZXAgdGhlIGZsYWdcblxuICAgIGNvbnN0IGhhc1Bhc3N3b3JkQmxvYiA9IEFycmF5LmlzQXJyYXkoZGF0YS5wcm9maWxlcykgJiZcbiAgICAgICAgZGF0YS5wcm9maWxlcy5zb21lKHAgPT4gcCAmJiBpc1Bhc3N3b3JkQmxvYihwLnByaXZLZXkpKTtcbiAgICBpZiAoaGFzUGFzc3dvcmRCbG9iKSByZXR1cm4gZmFsc2U7ICAgICAvLyBwYXNzd29yZC1lbmNyeXB0ZWQga2V5IG1hdGVyaWFsIFx1MjAxNCBrZWVwXG5cbiAgICAvLyBGbGFnIGlzIGJvZ3VzIChlLmcuIG1pcnJvcmVkIGluIGZyb20gYW5vdGhlciBkZXZpY2UgdGhhdCBESUQgaGF2ZSBhXG4gICAgLy8gcGFzc3dvcmQpLiBDbGVhciBpdCBzbyB0aGlzIGRldmljZSBpcyBub3Qgc3RyYW5kZWQgYXQgYSBkZWFkLWVuZCB1bmxvY2suXG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gQ2xlYXJlZCBib2d1cyBpc0VuY3J5cHRlZCBmbGFnIChubyBwYXNzd29yZCB2ZXJpZmllci9ibG9iKScpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZWR1Y2UgZXZlcnkgYnVua2VyVXJsIGluIHRoZSBgcHJvZmlsZXNgIG1pcnJvciB0byBpdHMgYWRkcmVzcy4gV29ya3Mgb24gdGhlXG4gKiBzdG9yZWQgZGF0YSBkaXJlY3RseSwgc28gaXQgZG9lcyBub3QgZGVwZW5kIG9uIHN5bmMgYmVpbmcgZW5hYmxlZCwgYW5kIHdyaXRlc1xuICogbm90aGluZyB3aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gY2hhbmdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NydWJTeW5jZWRQcm9maWxlcygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICBjb25zdCBwcm9maWxlcyA9IHJhdyA/IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoJ3Byb2ZpbGVzJywgcmF3KSA6IG51bGw7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuO1xuICAgIGNvbnN0IGNsZWFuID0gcmVkYWN0UHJvZmlsZXMocHJvZmlsZXMpO1xuICAgIGlmIChjbGVhbiA9PT0gcHJvZmlsZXMpIHJldHVybjtcblxuICAgIGNvbnN0IGVudHJpZXMgPSBjaHVua1ZhbHVlKCdwcm9maWxlcycsIEpTT04uc3RyaW5naWZ5KGNsZWFuKSk7XG4gICAgY29uc3QgcGF5bG9hZCA9IE9iamVjdC5mcm9tRW50cmllcyhlbnRyaWVzLm1hcChlID0+IFtlLmtleSwgZS52YWx1ZV0pKTtcbiAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChwYXlsb2FkKTtcbiAgICBjb25zdCB1bnVzZWQgPSBPYmplY3Qua2V5cyhyYXcpLmZpbHRlcihrID0+XG4gICAgICAgIGsuc3RhcnRzV2l0aChgJHtDSFVOS19QUkVGSVh9cHJvZmlsZXM6YCkgJiYgIShrIGluIHBheWxvYWQpXG4gICAgKTtcbiAgICBpZiAodW51c2VkLmxlbmd0aCA+IDApIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKHVudXNlZCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5pdGlhbGlzYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENhbGxlZCBvbmNlIG9uIHN0YXJ0dXAgKGZyb20gYmFja2dyb3VuZC5qcykuXG4gKiBQdWxscyBmcm9tIHN5bmMsIG1lcmdlcywgdGhlbiBsaXN0ZW5zIGZvciByZW1vdGUgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRTeW5jKCkge1xuICAgIC8vIFNlbGYtaGVhbCBhIGJvZ3VzIGVuY3J5cHRpb24gZmxhZyBmaXJzdCBcdTIwMTQgdGhpcyBtdXN0IHJ1biBldmVuIHdoZW4gc3luYyBpc1xuICAgIC8vIHVuYXZhaWxhYmxlIG9yIGRpc2FibGVkLCBiZWNhdXNlIHRoZSBiYWQgc3RhdGUgaXQgZml4ZXMgbWF5IGhhdmUgYmVlbiBsZWZ0XG4gICAgLy8gYmVoaW5kIGJ5IGFuIGVhcmxpZXIgKG5vdy1yZW1vdmVkKSBpc0VuY3J5cHRlZC1zeW5jaW5nIGJ1aWxkLlxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gc2VsZkhlYWxFbmNyeXB0aW9uRmxhZyBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2NydWJTeW5jZWRQcm9maWxlcygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBzY3J1YlN5bmNlZFByb2ZpbGVzIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBQbGF0Zm9ybSBzeW5jIGRpc2FibGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdWxsICsgbWVyZ2VcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzeW5jRGF0YSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAoc3luY0RhdGEpIHtcbiAgICAgICAgICAgIGF3YWl0IG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCttZXJnZSBjb21wbGV0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTm8gc3luYyBkYXRhIGZvdW5kIFx1MjAxNCBmcmVzaCBzeW5jJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlbW90ZSBjaGFuZ2VzXG4gICAgaWYgKGFwaS5zdG9yYWdlLm9uQ2hhbmdlZCkge1xuICAgICAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWFOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJlYU5hbWUgIT09ICdzeW5jJykgcmV0dXJuO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIHN5bmMgY2hhbmdlIGRldGVjdGVkJyk7XG4gICAgICAgICAgICAvLyBSZS1wdWxsIGFuZCBtZXJnZSB0aGUgZnVsbCBzeW5jIGRhdGEgdG8gaGFuZGxlIGNodW5rZWQgdmFsdWVzIGNvcnJlY3RseVxuICAgICAgICAgICAgcHVsbEZyb21TeW5jKCkudGhlbihzeW5jRGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmNEYXRhKSBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIFJlbW90ZSBtZXJnZSBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEbyBhbiBpbml0aWFsIHB1c2ggc28gbG9jYWwgZGF0YSBpcyBtaXJyb3JlZFxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cbiIsICIvKipcbiAqIFNlY3JldCBWYXVsdCBcdTIwMTQgYXQtcmVzdCBlbmNyeXB0aW9uIGZvciBwcml2YXRlIGtleXMgYW5kIGFwcGxpY2F0aW9uIHNlY3JldHMuXG4gKlxuICogVGhyZWF0IG1vZGVsIChUMC00KTogcmF3IHNlY3JldCBieXRlcyBtdXN0IG5ldmVyIHNpdCBpbiBicm93c2VyIHN0b3JhZ2UgaW5cbiAqIGNsZWFydGV4dCwgZXZlbiBmb3IgdGhlIERFRkFVTFQgcGFzc3dvcmRsZXNzIHVzZXIuIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHR3b1xuICogd3JhcHBpbmcgc3RyYXRlZ2llcyBiZWhpbmQgb25lIGB3cmFwU2VjcmV0YCAvIGB1bndyYXBTZWNyZXRgIGludGVyZmFjZTpcbiAqXG4gKiAgIDEuIERFVklDRSBLRVkgKGRlZmF1bHQsIG5vIG1hc3RlciBwYXNzd29yZCkgXHUyMDE0IGEgbm9uLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNXG4gKiAgICAgIENyeXB0b0tleS4gVGhyZWUgcGVyc2lzdGVuY2Ugc3RyYXRlZ2llcyBleGlzdCwgYW5kIGVhY2ggaXMgVkVSSUZJRURcbiAqICAgICAgKHJlYWQgYmFjayBhbmQgcm91bmQtdHJpcHBlZCB0aHJvdWdoIGVuY3J5cHQvZGVjcnlwdCkgYmVmb3JlIGl0IGlzXG4gKiAgICAgIHRydXN0ZWQ6XG4gKlxuICogICAgICAgIGEuIGBpZGJgICAgIFx1MjAxNCBhIENyeXB0b0tleSAqaGFuZGxlKiBpbiBJbmRleGVkREIuIE9ubHkgZXZlciBBRE9QVEVELFxuICogICAgICAgICAgICAgICAgICAgICAgbmV2ZXIgbWludGVkOiB3ZSB0cnVzdCBgaWRiYCBleGNsdXNpdmVseSB3aGVuIGRiLmdldCgpXG4gKiAgICAgICAgICAgICAgICAgICAgICBoYW5kcyBiYWNrIGEgUFJFLUVYSVNUSU5HIGtleSB0aGF0IHJvdW5kLXRyaXBzLCBiZWNhdXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGF0IFx1MjAxNCBhbmQgb25seSB0aGF0IFx1MjAxNCBwcm92ZXMgdGhlIGhhbmRsZSBzdXJ2aXZlZCBhXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyBjb250ZXh0LiBBIHNhbWUtY29udGV4dCBwdXRcdTIxOTJnZXQgcHJvYmUgY2Fubm90XG4gKiAgICAgICAgICAgICAgICAgICAgICBwcm92ZSBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlLiBLZWVwaW5nIHRoZSBhZG9wdCBwYXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZXMgZXZlcnkgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd3JpdHRlbiBiZWZvcmVcbiAqICAgICAgICAgICAgICAgICAgICAgIDEuOC4xLCB3aG9zZSBibG9icyBsaXZlIHVuZGVyIHRoaXMga2V5LlxuICogICAgICAgICAgICAgICAgICAgICAgKipORVZFUiB1c2VkIGFzIHRoZSB3cmFwcGluZyBrZXkgb24gU2FmYXJpLioqIE9uIFdlYktpdFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIHR3byBzdG9yYWdlIGFyZWFzIGRvIG5vdCBzaGFyZSBhIGxpZmV0aW1lIHRoZSB3YXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZXkgZG8gb24gQ2hyb21pdW0vR2Vja28sIHNvIGFuIGFkb3B0ZWQgSW5kZXhlZERCIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgaXMgbm90IGEgc2FmZSB3cmFwcGluZyBrZXkgdGhlcmUuIFNhZmFyaSB0aGVyZWZvcmUgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cml0ZXMgdW5kZXIgYHNlZWRgIChidW5kbGUtc2NvcGVkIGBzdG9yYWdlLmxvY2FsYCk7XG4gKiAgICAgICAgICAgICAgICAgICAgICBhZG9wdGVkIElEQiBrZXlzIGFyZSBkZWNyeXB0LW9ubHkgbGVnYWN5IG9uIFNhZmFyaSwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgYXQtcmVzdCBtaWdyYXRpb24gcmUtd3JhcHMgRVZFUlkgZGV2aWNlIGJsb2IgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24gc3RvcmVzIFx1MjAxNCBwcm9maWxlIHByaXZhdGUga2V5cywgQVBJLWtleVxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cywgdmF1bHQtbm90ZSBib2RpZXMsIGFuZCBOSVAtNDYgYnVua2VyIHNlc3Npb25cbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMgLyBzZXNzaW9uIHByaXZhdGUga2V5cyBcdTIwMTQgbm90IGp1c3QgcHJvZmlsZSBrZXlzLlxuICogICAgICAgICAgICAgICAgICAgICAgKFBlci1lbmdpbmUgc3RvcmFnZS1zY29waW5nIHJhdGlvbmFsZTogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgICAgICAgICAgICAgICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqICAgICAgICBiLiBgc2VlZGAgICBcdTIwMTQgMzIgcmFuZG9tIGJ5dGVzIGluIGBicm93c2VyLnN0b3JhZ2UubG9jYWxgIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgZGV2aWNlS2V5U2VlZGAsIGltcG9ydGVkIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ01cbiAqICAgICAgICAgICAgICAgICAgICAgIGtleSBhdCBsb2FkLiBUaGlzIGlzIHdoZXJlIEVWRVJZIG5ldyBkZXZpY2Uga2V5IGxhbmRzLFxuICogICAgICAgICAgICAgICAgICAgICAgb24gZXZlcnkgcGxhdGZvcm06IHdoZW4gbm8gcHJlLWV4aXN0aW5nIElEQiBrZXkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIHdlIGRvIG5vdCBtaW50IG9uZSwgd2Ugc2VlZC4gQ2hyb21lL0ZpcmVmb3ggZnJlc2hcbiAqICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxzIHRoZXJlZm9yZSB1c2UgYHNlZWRgIHRvbyBcdTIwMTQgb25lIGNvZGUgcGF0aCwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgb25seSBvbmUgd2hvc2UgcGVyc2lzdGVuY2Ugd2UgY2FuIGFjdHVhbGx5IHZlcmlmeS5cbiAqICAgICAgICBjLiBgbWVtb3J5YCBcdTIwMTQgbGFzdCByZXNvcnQgKHVuaXQgdGVzdHMsIHNhbmRib3hlZCBjb250ZXh0cykuIFNlY3JldHNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZWQgaGVyZSBkbyBub3Qgc3Vydml2ZSBhIHJlbG9hZC5cbiAqXG4gKiAgICAgIFRoZSByZXNvbHZlZCBzdHJhdGVneSBpcyBTVElDS1k6IGl0IGlzIHJlY29yZGVkIGluIHN0b3JhZ2UubG9jYWwgdW5kZXJcbiAqICAgICAgYGRldmljZUtleVN0cmF0ZWd5YCBhbmQgaG9ub3VyZWQgb24gbGF0ZXIgbG9hZHMsIHNvIGEgY29udGV4dCBjYW5ub3RcbiAqICAgICAgc2lsZW50bHkgZmxpcCBzdHJhdGVnaWVzIGFuZCBvcnBoYW4gdGhlIGJsb2JzIHdyaXR0ZW4gdW5kZXIgdGhlIG9sZFxuICogICAgICBvbmUuIERlY3J5cHRpb24gaXMgc3ltbWV0cmljIHJlZ2FyZGxlc3M6IGBkZWNyeXB0V2l0aERldmljZUtleWAgdHJpZXNcbiAqICAgICAgdGhlIGN1cnJlbnQga2V5LCB0aGVuIGV2ZXJ5IG90aGVyIGtleSB0aGlzIGluc3RhbGwgY291bGQgZXZlciBoYXZlIGhhZFxuICogICAgICAobGVnYWN5IElEQiBoYW5kbGUsIGV4aXN0aW5nIHNlZWQpLCBhbmQgY2FsbGVycyB1c2luZ1xuICogICAgICBgZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXBgIHJlLXdyYXAgdW5kZXIgdGhlIGN1cnJlbnQgc3RyYXRlZ3kuXG4gKlxuICogICAgICBUaHJlYXQgbW9kZWwsIGhvbmVzdGx5IHN0YXRlZDogdGhlIHBhc3N3b3JkbGVzcyBkZXZpY2UgdGllciBpcyBhdC1yZXN0XG4gKiAgICAgIHByb3RlY3Rpb24gYWdhaW5zdCBjYXN1YWwgaW5zcGVjdGlvbiBvZiBleHRlbnNpb24gc3RvcmFnZSwgTk9UIGEgZGVmZW5jZVxuICogICAgICBhZ2FpbnN0IGNvZGUgYWxyZWFkeSBleGVjdXRpbmcgaW4gdGhpcyBleHRlbnNpb24ncyBjb250ZXh0LiBUaGVcbiAqICAgICAgc3Ryb25nZXN0IHRpZXIgYXZhaWxhYmxlIHRvZGF5IGlzIGEgKiptYXN0ZXIgcGFzc3dvcmQqKiAoYmVsb3cpLCB3aGljaFxuICogICAgICBkZXJpdmVzIHRoZSB3cmFwcGluZyBrZXkgZnJvbSBhIHNlY3JldCB0aGF0IGlzIG5ldmVyIHN0b3JlZC4gVXNlcnNcbiAqICAgICAgaG9sZGluZyBoaWdoLXZhbHVlIGtleXMgc2hvdWxkIHNldCBvbmUuIEEgaGFyZHdhcmUtYmFja2VkIGRldmljZSBrZXkgaXNcbiAqICAgICAgZnV0dXJlIHdvcmsuIChUaWVyIHRyYWRlb2ZmcyBpbiBmdWxsOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKlxuICogICAyLiBTRVNTSU9OIEtFWSAobWFzdGVyIHBhc3N3b3JkIHNldCArIHVubG9ja2VkKSBcdTIwMTQgdGhlIEFFUy0yNTYtR0NNIGtleVxuICogICAgICBkZXJpdmVkIGZyb20gdGhlIHBhc3N3b3JkIChzZWUgY3J5cHRvLmpzKS4gU2V0IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlclxuICogICAgICBvbiB1bmxvY2sgdmlhIGBzZXRTZXNzaW9uS2V5YCwgY2xlYXJlZCBvbiBsb2NrIHZpYSBgY2xlYXJTZXNzaW9uYC5cbiAqXG4gKiBCbG9iIGZvcm1hdHMgKGJvdGggYXJlIHNlbGYtZGVzY3JpYmluZyBKU09OIHN0cmluZ3MpOlxuICogICBwYXNzd29yZCBibG9iIDogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9XG4gKiAgIGRldmljZSAgYmxvYiA6IHsgdjoxLCBrOlwiZGV2aWNlXCIsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqXG4gKiBgdW53cmFwU2VjcmV0YCByZWZ1c2VzIHRvIGRlY3J5cHQgd2hlbiB0aGUgc2Vzc2lvbiBoYXMgYmVlbiBleHBsaWNpdGx5IGxvY2tlZFxuICogKEY1L0Y2KSBzbyBhIGxvY2tlZCBwYWdlIGNhbm5vdCByZWFkIHNlY3JldHMuXG4gKi9cblxuaW1wb3J0IHsgZW5jcnlwdFdpdGhLZXksIGRlY3J5cHRXaXRoS2V5IH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuY29uc3QgREVWSUNFX0RCID0gJ25vc3Rya2V5LXNlY3JldC12YXVsdCc7XG5jb25zdCBERVZJQ0VfU1RPUkUgPSAna2V5cyc7XG5jb25zdCBERVZJQ0VfS0VZX0lEID0gJ2RldmljZS13cmFwLWtleS12MSc7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBiYXNlNjQgcmF3IHNlZWQgZm9yIHRoZSBgc2VlZGAgc3RyYXRlZ3kuXG5jb25zdCBERVZJQ0VfU0VFRF9LRVkgPSAnZGV2aWNlS2V5U2VlZCc7XG5jb25zdCBERVZJQ0VfU0VFRF9CWVRFUyA9IDMyO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgU1RJQ0tZIHJlc29sdmVkIHN0cmF0ZWd5ICgnaWRiJyB8ICdzZWVkJykuXG5jb25zdCBERVZJQ0VfU1RSQVRFR1lfS0VZID0gJ2RldmljZUtleVN0cmF0ZWd5JztcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIChrZXB0IGxvY2FsIHNvIHRoaXMgbW9kdWxlIGhhcyBubyBjcm9zcy1kZXBzKSAtLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGFiVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFRvQWIoYjY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIFNlc3Npb24gKHBhc3N3b3JkLWRlcml2ZWQpIGtleSBzdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfc2Vzc2lvbktleSA9IG51bGw7ICAgLy8gQ3J5cHRvS2V5IHwgbnVsbFxubGV0IF9zZXNzaW9uU2FsdCA9IG51bGw7ICAvLyBVaW50OEFycmF5IHwgbnVsbFxuLy8gX3VubG9ja2VkOiBudWxsID0gcGFzc3dvcmRsZXNzIC8gbm90IGFwcGxpY2FibGUgKG5ldmVyIGxvY2tlZCksXG4vLyAgICAgICAgICAgIHRydWUgPSB1bmxvY2tlZCwgZmFsc2UgPSBsb2NrZWQgKHJlZnVzZSBzZWNyZXQgcmVhZHMpLlxubGV0IF91bmxvY2tlZCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uS2V5KGNyeXB0b0tleSwgc2FsdCkge1xuICAgIF9zZXNzaW9uS2V5ID0gY3J5cHRvS2V5O1xuICAgIF9zZXNzaW9uU2FsdCA9IHNhbHQ7XG4gICAgX3VubG9ja2VkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcbiAgICBfc2Vzc2lvbktleSA9IG51bGw7XG4gICAgX3Nlc3Npb25TYWx0ID0gbnVsbDtcbiAgICBfdW5sb2NrZWQgPSBmYWxzZTtcbn1cblxuLyoqIEV4cGxpY2l0bHkgbWFyayB0aGUgc2Vzc2lvbiB1bmxvY2tlZC9sb2NrZWQgd2l0aG91dCBwcm92aWRpbmcgYSBrZXkuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VW5sb2NrZWQodikge1xuICAgIF91bmxvY2tlZCA9IHYgPT09IG51bGwgPyBudWxsIDogISF2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2Vzc2lvbktleSgpIHtcbiAgICByZXR1cm4gISFfc2Vzc2lvbktleTtcbn1cblxuLy8gLS0tIERldmljZSBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG5sZXQgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDsgICAvLyAnaWRiJyB8ICdzZWVkJyB8ICdtZW1vcnknIFx1MjAxNCBzZXQgb25jZSByZXNvbHZlZFxubGV0IF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsOyAgLy8gbGFzdC1yZXNvcnQga2V5IGZvciBjb250ZXh0cyB0aGF0IHBlcnNpc3Qgbm90aGluZ1xubGV0IF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiB0aGUgcHJlLTEuOC4xIElEQiBrZXlcbmxldCBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gYW4gZXhpc3Rpbmcgc2VlZCBrZXlcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZXZpY2VLZXkoKSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlOiByYXcgYnl0ZXMgY2FuIG5ldmVyIGJlIHJlYWQgYmFjayBvdXRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkRGJBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ZWREQiAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92ZSBhIGNhbmRpZGF0ZSBrZXkgaXMgYWN0dWFsbHkgdXNhYmxlIGJlZm9yZSB3ZSB0cnVzdCBhIHN0cmF0ZWd5IHdpdGggYVxuICogdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBBIHJlYWQtYmFjayBoYW5kbGUgdGhhdCBzdHJ1Y3R1cmVkLWNsb25lXG4gKiBtYW5nbGVkIChvciBhIHNlZWQgdGhhdCBjYW1lIGJhY2sgdHJ1bmNhdGVkKSBmYWlscyBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHlcbiAqIHByb2R1Y2luZyB1bmRlY3J5cHRhYmxlIGJsb2JzLlxuICovXG5hc3luYyBmdW5jdGlvbiBrZXlSb3VuZFRyaXBzKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgICAgIGNvbnN0IHByb2JlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdub3N0cmtleS1kZXZpY2UtcHJvYmUnKTtcbiAgICAgICAgY29uc3QgY3QgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgcHJvYmUpO1xuICAgICAgICBjb25zdCBwdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBjdCk7XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocHQpID09PSAnbm9zdHJrZXktZGV2aWNlLXByb2JlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRldmljZURiKCkge1xuICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICBjb25zdCB7IG9wZW5EQiB9ID0gYXdhaXQgaW1wb3J0KCdpZGInKTtcbiAgICByZXR1cm4gb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICB1cGdyYWRlKGQpIHtcbiAgICAgICAgICAgIGlmICghZC5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKERFVklDRV9TVE9SRSkpIHtcbiAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgKGEpOiBBRE9QVCBhIHByZS1leGlzdGluZyBub24tZXh0cmFjdGFibGUgQ3J5cHRvS2V5IGhhbmRsZSBmcm9tXG4gKiBJbmRleGVkREIuIE5ldmVyIG1pbnRzIG9uZS5cbiAqXG4gKiBBIGtleSB0aGF0IGRiLmdldCgpIGhhbmRzIGJhY2sgaXMgYSBrZXkgc29tZSBFQVJMSUVSIGNvbnRleHQgd3JvdGUsIHNvIGl0IGlzXG4gKiBwcm9vZiBvZiBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlIFx1MjAxNCB0aGUgb25lIHRoaW5nIGEgc2FtZS1jb250ZXh0XG4gKiBwdXRcdTIxOTJnZXRcdTIxOTJyb3VuZC10cmlwIHByb2JlIGNhbiBuZXZlciBlc3RhYmxpc2guIGlPUyBTYWZhcmkncyBJbmRleGVkREIgaXNcbiAqIGZ1bmN0aW9uYWwgYnV0IGVwaGVtZXJhbCBmb3IgdGhlIGV4dGVuc2lvbiBiYWNrZ3JvdW5kOiBpdCB3b3VsZCBoYXZlIHBhc3NlZFxuICogdGhlIHByb2JlIGFuZCB0aGVuIGxvc3QgdGhlIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gU286IG5vXG4gKiBwcmUtZXhpc3Rpbmcga2V5IG1lYW5zIG5vIGBpZGJgLCBhbmQgdGhlIGNhbGxlciBzZWVkcyBpbnN0ZWFkLlxuICpcbiAqIFJldHVybnMgbnVsbCAobmV2ZXIgdGhyb3dzKSB3aGVuIG5vdGhpbmcgdXNhYmxlIGlzIHRoZXJlLlxuICovXG5hc3luYyBmdW5jdGlvbiB0cnlJZGJEZXZpY2VLZXkoKSB7XG4gICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuIG51bGw7IC8vIGVtcHR5IHN0b3JlIFx1MjE5MiBzZWVkLCBkbyBOT1QgbWludCBoZXJlXG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhleGlzdGluZykpID8gZXhpc3RpbmcgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHN0b3JhZ2UgYXJlYSBiYWNraW5nIHRoZSBgc2VlZGAgc3RyYXRlZ3kuIEltcG9ydGVkIGxhemlseSBiZWNhdXNlXG4gKiBicm93c2VyLXBvbHlmaWxsIHRocm93cyBhdCBtb2R1bGUgbG9hZCB3aGVuIG5vIGV4dGVuc2lvbiBuYW1lc3BhY2UgZXhpc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWVkU3RvcmFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgcmV0dXJuIGFwaT8uc3RvcmFnZT8ubG9jYWwgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogU2lnbmFsIDI6IGEgV2ViS2l0IHVzZXIgYWdlbnQgd2l0aCBubyBDaHJvbWl1bSBtYXJrZXIgb24gaXQuICovXG5mdW5jdGlvbiBsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdWEgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgJyc7XG4gICAgICAgIHJldHVybiAvU2FmYXJpfEFwcGxlV2ViS2l0Ly50ZXN0KHVhKSAmJiAhL0Nocm9tKGV8aXVtKXxFZGdcXC98T1BSXFwvLy50ZXN0KHVhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcnVlIG9uIFNhZmFyaSAoaU9TICsgbWFjT1MpLCB3aGVyZSBJbmRleGVkREIgbXVzdCBORVZFUiBob2xkIHRoZSB3cmFwcGluZ1xuICoga2V5IFx1MjAxNCBzZWUgdGhlIG1vZHVsZSBoZWFkZXIncyBzdG9yYWdlLXNjb3BlIG5vdGUuXG4gKlxuICogRGV0ZWN0aW9uIGlzIG11bHRpLXNpZ25hbCBhbmQgQklBU0VEIFRPV0FSRCBTQUZBUkksIGJlY2F1c2UgdGhlIHR3byBlcnJvcnNcbiAqIGFyZSBub3Qgc3ltbWV0cmljOiBzZWVkaW5nIGEgQ2hyb21lIHZhdWx0IGNvc3RzIG5vdGhpbmcgKHNlZWQgaXMgYWxyZWFkeSB0aGVcbiAqIHN0cmF0ZWd5IGV2ZXJ5IGZyZXNoIGluc3RhbGwgbGFuZHMgb24pLCB3aGlsZSBhZG9wdGluZyBhbiBJREIga2V5IG9uIFNhZmFyaVxuICogaXMgdW5zYWZlLiBTbyBvbmx5IGEgUE9TSVRJVkVMWSBpZGVudGlmaWVkIENocm9tZS9GaXJlZm94IG9yaWdpbiBtYXkgYWRvcHQgYW5cbiAqIEluZGV4ZWREQiBrZXkgXHUyMDE0IGEgZ2V0VVJMIHRoYXQgaXMgbWlzc2luZywgdGhyb3dzLCByZXR1cm5zIGEgbm9uLXN0cmluZyxcbiAqIHJldHVybnMgJycgb3IgcmV0dXJucyBhIHNjaGVtZSB3ZSBkbyBub3QgcmVjb2duaXNlIGFsbCByZXNvbHZlIHRvIFNhZmFyaS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNTYWZhcmlFbmdpbmUoKSB7XG4gICAgbGV0IG9yaWdpbiA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaT8ucnVudGltZT8uZ2V0VVJMPy4oJycpO1xuICAgICAgICBvcmlnaW4gPSB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgfVxuICAgIC8vIFNpZ25hbCAxOiBhIHBvc2l0aXZlbHkgaWRlbnRpZmllZCBTYWZhcmkgb3JpZ2luLlxuICAgIGlmIChvcmlnaW4gJiYgb3JpZ2luLnN0YXJ0c1dpdGgoJ3NhZmFyaS13ZWItZXh0ZW5zaW9uOi8vJykpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAyOiBhIFdlYktpdC1vbmx5IFVBIG91dHJhbmtzIHRoZSBvcmlnaW4gXHUyMDE0IGEgU2FmYXJpIGJ1aWxkIHRoYXRcbiAgICAvLyByZXBvcnRlZCBhbiB1bmV4cGVjdGVkIG9yaWdpbiBzdGlsbCBtdXN0IG5vdCB0b3VjaCBJbmRleGVkREIuXG4gICAgaWYgKGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMzogb25seSB0aGVzZSB0d28gb3JpZ2lucyBlYXJuIHRoZSBJREIgYWRvcHQgcGF0aC5cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW4uc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8IG9yaWdpbi5zdGFydHNXaXRoKCdtb3otZXh0ZW5zaW9uOi8vJykpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7IC8vIGFtYmlndW91cyBcdTIxOTIgc2VlZFxufVxuXG4vKiogSW1wb3J0IHJhdyBzZWVkIGJ5dGVzIChiYXNlNjQpIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ00ga2V5LiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1wb3J0U2VlZEtleShzZWVkQjY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JywgYmFzZTY0VG9BYihzZWVkQjY0KSwgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZSBvbmNlIGltcG9ydGVkXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuLyoqIFJlYWQgdGhlIHN0aWNreSBzdHJhdGVneSByZWNvcmRlZCBieSBhIHByZXZpb3VzIHJlc29sdXRpb24gKG51bGwgaWYgbm9uZSkuICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3RpY2t5U3RyYXRlZ3koKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgcyA9IGdvdD8uW0RFVklDRV9TVFJBVEVHWV9LRVldO1xuICAgICAgICByZXR1cm4gKHMgPT09ICdpZGInIHx8IHMgPT09ICdzZWVkJykgPyBzIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogUmVjb3JkIHRoZSByZXNvbHZlZCBzdHJhdGVneSBzbyBsYXRlciBsb2FkcyBjYW5ub3Qgc2lsZW50bHkgZmxpcCBpdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlU3RpY2t5U3RyYXRlZ3koc3RyYXRlZ3kpIHtcbiAgICBpZiAoc3RyYXRlZ3kgIT09ICdpZGInICYmIHN0cmF0ZWd5ICE9PSAnc2VlZCcpIHJldHVybjsgLy8gJ21lbW9yeScgcGVyc2lzdHMgbm90aGluZ1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBzdHJhdGVneSB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmVzdCBlZmZvcnQgXHUyMDE0IHRoZSBzdHJhdGVneSBzdGlsbCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgKi8gfVxufVxuXG4vKiogU3RyYXRlZ3kgKGIpOiBhIHJhdyByYW5kb20gc2VlZCBpbiBzdG9yYWdlLmxvY2FsLCBpbXBvcnRlZCBub24tZXh0cmFjdGFibGUuICovXG5hc3luYyBmdW5jdGlvbiB0cnlTZWVkRGV2aWNlS2V5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgbGV0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgICAgIHNlZWQgPSBhYlRvQmFzZTY0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoREVWSUNFX1NFRURfQllURVMpKS5idWZmZXIpO1xuICAgICAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IHNlZWQgfSk7XG4gICAgICAgICAgICAvLyBWRVJJRlkgcGVyc2lzdGVuY2UgYmVmb3JlIGFueXRoaW5nIGlzIHdyYXBwZWQgdW5kZXIgaXQuXG4gICAgICAgICAgICBjb25zdCBjaGVjayA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3QgcGVyc2lzdGVkID0gY2hlY2s/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKHBlcnNpc3RlZCAhPT0gc2VlZCkge1xuICAgICAgICAgICAgICAgIC8vIEFub3RoZXIgY29udGV4dCAocG9wdXAgdnMgYmFja2dyb3VuZCBvbiBhIGZpcnN0IHJ1bikgbWludGVkXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdyb3RlIGl0cyBvd24gc2VlZCBiZXR3ZWVuIG91ciBzZXQoKSBhbmQgdGhpcyByZWFkLiBBRE9QVFxuICAgICAgICAgICAgICAgIC8vIFRIRSBXSU5ORVI6IGFueSBzZWVkIGFjdHVhbGx5IGluIHN0b3JhZ2UgaXMgZXhhY3RseSBhcyBnb29kIGFzXG4gICAgICAgICAgICAgICAgLy8gb3VycywgYW5kIGl0IGlzIHRoZSBvbmUgdGhlIG90aGVyIGNvbnRleHQgaXMgYWxyZWFkeSB3cmFwcGluZ1xuICAgICAgICAgICAgICAgIC8vIHVuZGVyLiBSZXR1cm5pbmcgbnVsbCBoZXJlIHdvdWxkIGRyb3AgdGhlIGNhbGxlciB0aHJvdWdoIHRvXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbW9yeSBrZXksIHdob3NlIGJsb2JzIGRpZSB3aXRoIHRoaXMgY29udGV4dCBcdTIwMTQgdGhlIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBsb3NzIHRoaXMgc3RyYXRlZ3kgZXhpc3RzIHRvIHByZXZlbnQuIE9ubHkgYSBnZW51aW5lbHkgYWJzZW50XG4gICAgICAgICAgICAgICAgLy8gb3IgdW51c2FibGUgdmFsdWUgaXMgYSBmYWlsdXJlLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGVyc2lzdGVkICE9PSAnc3RyaW5nJyB8fCBwZXJzaXN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWVkID0gcGVyc2lzdGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgKGNyZWF0aW5nIG9uIGZpcnN0IHVzZSkgdGhlIGRldmljZSB3cmFwIGtleS5cbiAqXG4gKiBSZXNvbHV0aW9uIG9yZGVyLCBvbmNlOiBob25vdXIgdGhlIHN0aWNreSBzdHJhdGVneSB0aGlzIGluc3RhbGwgYWxyZWFkeVxuICogcmVjb3JkZWQ7IG90aGVyd2lzZSBBRE9QVCBhIHByZS1leGlzdGluZyBJbmRleGVkREIga2V5IGlmIG9uZSBpcyB0aGVyZSwgYW5kXG4gKiBmYWlsaW5nIHRoYXQgc2VlZC4gV2hhdGV2ZXIgcmVzb2x2ZXMgaXMgd3JpdHRlbiBiYWNrIGFzIHRoZSBzdGlja3kgc3RyYXRlZ3kuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZXZpY2VLZXkoKSB7XG4gICAgaWYgKF9kZXZpY2VLZXlQcm9taXNlKSByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG4gICAgX2RldmljZUtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja3kgPSBhd2FpdCByZWFkU3RpY2t5U3RyYXRlZ3koKTtcblxuICAgICAgICAvLyBBIHZhdWx0IGFscmVhZHkgb24gYHNlZWRgIG5ldmVyIHJlLXByb2JlcyBJbmRleGVkREI6IGl0cyBibG9icyBhcmVcbiAgICAgICAgLy8gdW5kZXIgdGhlIHNlZWQga2V5LCBhbmQgYWRvcHRpbmcgYSBzdHJheSBJREIgaGFuZGxlIHdvdWxkIG9ycGhhbiB0aGVtLlxuICAgICAgICAvLyBPbiBTYWZhcmkgd2UgbmV2ZXIgV1JJVEUgdW5kZXIgYW4gSURCIGtleSBhdCBhbGwgKHNlZSBoZWFkZXIpOiBpdHNcbiAgICAgICAgLy8gcGVyLWVuZ2luZSBzdG9yYWdlIHNjb3BpbmcgbWFrZXMgYW4gYWRvcHRlZCBJREIgaGFuZGxlIHVuc2FmZSBhcyBhXG4gICAgICAgIC8vIHdyYXBwaW5nIGtleS4gRXhpc3RpbmcgSURCIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdFxuICAgICAgICAvLyBmYWxsYmFjayBhbmQgYXJlIHJlLXdyYXBwZWQgdW5kZXIgdGhlIHNlZWQgYnkgdGhlIGF0LXJlc3QgbWlncmF0aW9uLlxuICAgICAgICBpZiAoc3RpY2t5ICE9PSAnc2VlZCcgJiYgIShhd2FpdCBpc1NhZmFyaUVuZ2luZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgaWRiS2V5ID0gYXdhaXQgdHJ5SWRiRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBpZiAoaWRiS2V5KSB7XG4gICAgICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ2lkYic7XG4gICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnaWRiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkYktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCB0cnlTZWVkRGV2aWNlS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSB7XG4gICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnc2VlZCc7XG4gICAgICAgICAgICAvLyBBbHNvIGNvdmVycyB0aGUgZGVncmFkZSBjYXNlOiBzdGlja3kgd2FzICdpZGInIGJ1dCB0aGUgaGFuZGxlIGlzXG4gICAgICAgICAgICAvLyBnb25lLiBPbGQgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0IGZhbGxiYWNrIGJlbG93LlxuICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnc2VlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlZWRLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RoaW5nIHBlcnNpc3RzIGhlcmUuIEJldHRlciB0aGFuIHJlZnVzaW5nIHRvIGVuY3J5cHQsIGJ1dCBibG9ic1xuICAgICAgICAvLyB3cml0dGVuIHVuZGVyIHRoaXMga2V5IGRpZSB3aXRoIHRoZSBjb250ZXh0IFx1MjAxNCBzZWUgbW9kdWxlIGhlYWRlci5cbiAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ21lbW9yeSc7XG4gICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xufVxuXG4vKiogV2hpY2ggcGVyc2lzdGVuY2Ugc3RyYXRlZ3kgdGhlIGRldmljZSBrZXkgcmVzb2x2ZWQgdG8gKG51bGwgdW50aWwgcmVzb2x2ZWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZUtleVN0cmF0ZWd5KCkge1xuICAgIHJldHVybiBfZGV2aWNlU3RyYXRlZ3k7XG59XG5cbi8qKlxuICogRHJvcCBldmVyeSBtZW1vaXNlZCBkZXZpY2Uta2V5IGhhbmRsZS4gTVVTVCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYW55XG4gKiBgc3RvcmFnZS5jbGVhcigpYDogdGhlIHNlZWQgKGFuZCB0aGUgc3RpY2t5IHN0cmF0ZWd5KSBhcmUgZ29uZSBmcm9tIHN0b3JhZ2UsXG4gKiBzbyBhIGNhY2hlZCBwcm9taXNlIHdvdWxkIGtlZXAgaGFuZGluZyBvdXQgYSBrZXkgd2hvc2UgYmFja2luZyBtYXRlcmlhbCBub1xuICogbG9uZ2VyIGV4aXN0cyBcdTIwMTQgdGhlIG5leHQgZ2V0RGV2aWNlS2V5KCkgd291bGQgd3JhcCBzZWNyZXRzIHVuZGVyIGEga2V5IHRoYXRcbiAqIGRpZXMgd2l0aCB0aGlzIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldERldmljZUtleSgpIHtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDtcbiAgICBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGRldmljZSBrZXksIHVzZWQgb25seSBhcyBhXG4gKiBkZWNyeXB0IGZhbGxiYWNrIGZvciBibG9icyB3cml0dGVuIGJlZm9yZSB0aGlzIGNvbnRleHQgY2hhbmdlZCBzdHJhdGVneS5cbiAqIE5ldmVyIGNyZWF0ZXMgb25lLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRMZWdhY3lJZGJLZXkoKSB7XG4gICAgaWYgKF9sZWdhY3lJZGJLZXlQcm9taXNlKSByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIHRoZSBrZXkgYW4gRVhJU1RJTkcgYGRldmljZUtleVNlZWRgIGltcG9ydHMgdG8sIHVzZWQgb25seVxuICogYXMgYSBkZWNyeXB0IGZhbGxiYWNrLiBOZXZlciBtaW50cyBhIHNlZWQgKHRoYXQgaXMgdHJ5U2VlZERldmljZUtleSdzIGpvYikuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEV4aXN0aW5nU2VlZEtleSgpIHtcbiAgICBpZiAoX2V4aXN0aW5nU2VlZEtleVByb21pc2UpIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKCFzZWVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG59XG5cbi8qKlxuICogRXZlcnkgT1RIRVIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBoYXZlIHdyYXBwZWQgYSBkZXZpY2UgYmxvYiB1bmRlciwgaW5cbiAqIHByZWZlcmVuY2Ugb3JkZXIuIFN0cmF0ZWd5IGZsaXBzIChpZGJcdTIxOTJzZWVkIG9uIGRlZ3JhZGUsIHNlZWRcdTIxOTJpZGIgb24gYW5cbiAqIGFkb3B0ZWQgaGFuZGxlKSBtdXN0IG5ldmVyIG9ycGhhbiBhIGJsb2IsIHNvIHRoZSBmYWxsYmFjayBpcyBzeW1tZXRyaWM6IGFcbiAqIHNlZWQgYmxvYiBzdGF5cyByZWFkYWJsZSB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicgYW5kIHZpY2UgdmVyc2EuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZhbGxiYWNrRGV2aWNlS2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gW107XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ2lkYicpIHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gYXdhaXQgZ2V0TGVnYWN5SWRiS2V5KCk7XG4gICAgICAgIGlmIChsZWdhY3kpIGtleXMucHVzaChsZWdhY3kpO1xuICAgIH1cbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnc2VlZCcpIHtcbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IGdldEV4aXN0aW5nU2VlZEtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkga2V5cy5wdXNoKHNlZWRLZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2Igd2l0aCB0aGUgY3VycmVudCBrZXksIGZhbGxpbmcgYmFjayB0byBldmVyeSBvdGhlciBrZXlcbiAqIHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQuIFJldHVybnMgdGhlIHBsYWludGV4dCBwbHVzIHdoZXRoZXIgYSBmYWxsYmFjayBrZXlcbiAqIHdhcyBuZWVkZWQgKGkuZS4gdGhlIGJsb2IgaXMgc3RhbGUgYW5kIHdvcnRoIHJlLXdyYXBwaW5nKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSwgc3RhbGU6IGZhbHNlIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGZhbGxiYWNrIG9mIGF3YWl0IGZhbGxiYWNrRGV2aWNlS2V5cygpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGZhbGxiYWNrLCBpdiwgY2lwaGVydGV4dCksXG4gICAgICAgICAgICAgICAgICAgIHN0YWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogdHJ5IHRoZSBuZXh0IG9uZSAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTsgLy8gcmVwb3J0IHRoZSBDVVJSRU5UIGtleSdzIGZhaWx1cmUsIG5vdCB0aGUgbGFzdCBmYWxsYmFjaydzXG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgZW5jLmVuY29kZShwbGFpbnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdjogMSxcbiAgICAgICAgazogJ2RldmljZScsXG4gICAgICAgIGl2OiBhYlRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYWJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FiKGl2KSkgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBiYXNlNjRUb0FiKGNpcGhlcnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aERldmljZUtleShlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICAvLyBHQ00gYXV0aGVudGljYXRpb24gY2FuIGZhaWwgd2l0aCB0aGUgQ1VSUkVOVCBzdHJhdGVneSdzIGtleSBiZWNhdXNlIHRoZVxuICAgIC8vIGJsb2IgcHJlZGF0ZXMgYSBzdHJhdGVneSBjaGFuZ2UgKGEgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd2hvc2UgSURCIGhhbmRsZVxuICAgIC8vIGlzIHN0aWxsIHJlYWRhYmxlIHdoaWxlIHRoaXMgY29udGV4dCBzZXR0bGVkIG9uIHRoZSBzZWVkLCBvciB0aGUgcmV2ZXJzZSkuXG4gICAgLy8gVHJ5IGV2ZXJ5IGtleSB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkIGJlZm9yZSBkZWNsYXJpbmcgdGhlIHNlY3JldCBsb3N0LlxuICAgIGNvbnN0IHsgcGxhaW50ZXh0IH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHBsYWludGV4dDtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2IgYW5kLCB3aGVuIGl0IGNvdWxkIG9ubHkgYmUgcmVhZCB2aWEgYSBmYWxsYmFjayBrZXlcbiAqIChsZWdhY3kgSW5kZXhlZERCIGhhbmRsZSwgb3IgYW4gZXhpc3Rpbmcgc2VlZCB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicpLFxuICogaGFuZCBiYWNrIGEgcmVwbGFjZW1lbnQgYmxvYiB3cmFwcGVkIHVuZGVyIHRoZSBDVVJSRU5UIHN0cmF0ZWd5IHNvIHRoZSBjYWxsZXJcbiAqIGNhbiBwZXJzaXN0IHRoZSB1cGdyYWRlIG9wcG9ydHVuaXN0aWNhbGx5LlxuICogYHJld3JhcHBlZGAgaXMgbnVsbCB3aGVuIHRoZSBibG9iIGlzIGFscmVhZHkgY3VycmVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwKGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IHsgcGxhaW50ZXh0LCBzdGFsZSB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBsYWludGV4dCxcbiAgICAgICAgcmV3cmFwcGVkOiBzdGFsZSA/IGF3YWl0IGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkgOiBudWxsLFxuICAgIH07XG59XG5cbi8vIC0tLSBCbG9iIGNsYXNzaWZpY2F0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZnVuY3Rpb24gaXNQYXNzd29yZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5zYWx0ICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0ICYmIHAuayAhPT0gJ2RldmljZScpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLmsgPT09ICdkZXZpY2UnICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbi8qKiBUcnVlIGlmIHRoZSB2YWx1ZSBpcyBhbHJlYWR5IGNpcGhlcnRleHQgKGVpdGhlciB3cmFwcGluZykuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaXBoZXJ0ZXh0KHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB8fCBpc0RldmljZUtleUJsb2IodmFsdWUpO1xufVxuXG4vLyAtLS0gVW5pZmllZCB3cmFwIC8gdW53cmFwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBzZWNyZXQgZm9yIGF0LXJlc3Qgc3RvcmFnZS4gUHJlZmVycyB0aGUgcGFzc3dvcmQtZGVyaXZlZCBzZXNzaW9uXG4gKiBrZXkgd2hlbiBvbmUgaXMgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dCAoYmFja2dyb3VuZCwgdW5sb2NrZWQpOyBvdGhlcndpc2VcbiAqIGZhbGxzIGJhY2sgdG8gdGhlIGFsd2F5cy1hdmFpbGFibGUgZGV2aWNlIGtleS4gTmV2ZXIgcmV0dXJucyBwbGFpbnRleHQuXG4gKlxuICogVGhlIHRpZXIgaXMgdGhlcmVmb3JlIEFNQklFTlQgXHUyMDE0IGl0IGlzIHdoYXRldmVyIGBzZXRTZXNzaW9uS2V5YCAvIGBjbGVhclNlc3Npb25gXG4gKiBsYXN0IGRpZCBpbiB0aGlzIG1vZHVsZSwgd2hpY2ggbWF5IGhhdmUgYmVlbiBkb25lIGJ5IGEgZGlmZmVyZW50IGZpbGUuIE9ubHlcbiAqIGNhbGwgdGhpcyB3aGVyZSBlaXRoZXIgdGllciBpcyBnZW51aW5lbHkgYWNjZXB0YWJsZSAoYSB2YWx1ZSB0aGF0XG4gKiBgdW53cmFwU2VjcmV0YCBjYW4gb3BlbiB1bmRlciBib3RoKS4gQSBjYWxsZXIgdGhhdCBuZWVkcyBhIFNQRUNJRklDIHRpZXIgbXVzdFxuICogbmFtZSBpdDogYGVuY3J5cHRXaXRoRGV2aWNlS2V5YCBvciBgZW5jcnlwdFdpdGhLZXlgLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEBwYXJhbSB7e2V4dHJhY3RhYmxlPzogYm9vbGVhbn19IFtvcHRpb25zXSAtIGBleHRyYWN0YWJsZTogdHJ1ZWAgYWxsb3dzIHRoZVxuICogICAgICAgIHJhdyBieXRlcyB0byBiZSBleHBvcnRlZCBvbmNlIChzZWUgZXhwb3J0S2V5QmFzZTY0KS4gVXNlZCBieSB0aGVcbiAqICAgICAgICBiYWNrZ3JvdW5kIHdvcmtlciBzbyBhbiB1bmxvY2tlZCBzZXNzaW9uIGNhbiBiZSBwYXJrZWQgaW5cbiAqICAgICAgICBzdG9yYWdlLnNlc3Npb24gYW5kIGZ1bGx5IHJlc3RvcmVkIGFmdGVyIGFuIE1WMyBldmljdGlvbi4gRGVmYXVsdFxuICogICAgICAgIGZhbHNlOiB0aGUga2V5IGlzIG9wYXF1ZSBhbmQgY2Fubm90IGxlYXZlIHRoZSBjcnlwdG8gc3Vic3lzdGVtLlxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgICEhb3B0aW9ucy5leHRyYWN0YWJsZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKlxuICogRXhwb3J0IGFuIGV4dHJhY3RhYmxlIEFFUyBrZXkncyByYXcgYnl0ZXMgYXMgYmFzZTY0LlxuICogT25seSBldmVyIGNhbGxlZCBvbiBhIGtleSBkZXJpdmVkIHdpdGggYHsgZXh0cmFjdGFibGU6IHRydWUgfWAuXG4gKlxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gYmFzZTY0IHJhdyBrZXkgYnl0ZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleUJhc2U2NChrZXkpIHtcbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChhd2FpdCBjcnlwdG8uc3VidGxlLmV4cG9ydEtleSgncmF3Jywga2V5KSk7XG59XG5cbi8qKlxuICogSW1wb3J0IGJhc2U2NCByYXcgYnl0ZXMgYmFjayBpbnRvIGEgTk9OLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNIGtleS5cbiAqIFRoZSBjb3VudGVycGFydCBvZiBleHBvcnRLZXlCYXNlNjQ6IHdoYXRldmVyIHdlbnQgb3V0IGV4dHJhY3RhYmxlIGNvbWVzIGJhY2tcbiAqIG9wYXF1ZSwgc28gYSByZXN0b3JlZCBzZXNzaW9uIGtleSBjYW5ub3QgYmUgcmUtZXhwb3J0ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NCAtIHJhdyBrZXkgYnl0ZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlCYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKiBiYXNlNjQgXHUyMTk0IGJ5dGVzLCBleHBvcnRlZCBzbyBjYWxsZXJzIGNhbiByb3VuZC10cmlwIGEgc2FsdCB0aHJvdWdoIEpTT04uICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlcykge1xuICAgIC8vIGBuZXcgVWludDhBcnJheSh2aWV3KWAgaW5zaWRlIHRoZSBoZWxwZXIgY29waWVzIHRoZSBWSUVXLCBzbyBhIHNhbHQgdGhhdFxuICAgIC8vIGlzIGEgd2luZG93IGludG8gYSBsYXJnZXIgYnVmZmVyIHN0aWxsIGVuY29kZXMgY29ycmVjdGx5LlxuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ5dGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgKGlnbm9yZXMgdGhlIHNhbHQgZW1iZWRkZWQgaW4gdGhlXG4gKiBibG9iIFx1MjAxNCB0aGUgY2FsbGVyIG11c3Qgc3VwcGx5IGEga2V5IHRoYXQgbWF0Y2hlcyBob3cgdGhlIGJsb2Igd2FzIGVuY3J5cHRlZCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKS9lbmNyeXB0V2l0aEtleSgpXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAtIEFFUy0yNTYtR0NNIGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhLZXkoZW5jcnlwdGVkRGF0YSwga2V5KSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGhhc2gsIHN0b3JlZEhhc2gpO1xufVxuXG4vKipcbiAqIENvbnN0YW50LXRpbWUgY29tcGFyaXNvbiBvZiB0d28gYmFzZTY0LWVuY29kZWQgYnl0ZSBzdHJpbmdzLlxuICpcbiAqIERlY29kZXMgYm90aCB0byByYXcgYnl0ZXMgYW5kIGNvbXBhcmVzIHdpdGggYW4gYWNjdW11bGF0b3Igc28gdGhlIHJ1bm5pbmdcbiAqIHRpbWUgZG9lcyBub3QgZGVwZW5kIG9uIHdoZXJlIHRoZSBmaXJzdCBtaXNtYXRjaCBvY2N1cnMgXHUyMDE0IHRoaXMgYXZvaWRzIHRoZVxuICogdGltaW5nIHNpZGUtY2hhbm5lbCBvZiBhIHBsYWluIGA9PT1gIHN0cmluZyBjb21wYXJlIChUaWVyLTMgY3J5cHRvLmpzOjIxMykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChhLCBiKSB7XG4gICAgbGV0IGJhLCBiYjtcbiAgICB0cnkge1xuICAgICAgICBiYSA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYSkpO1xuICAgICAgICBiYiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYikpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgdGhlIG1heCBsZW5ndGggc28gbGVuZ3RoIGRpZmZlcmVuY2VzIGRvbid0IHNob3J0LWNpcmN1aXQgZWFybHkuXG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgoYmEubGVuZ3RoLCBiYi5sZW5ndGgpO1xuICAgIGxldCBkaWZmID0gYmEubGVuZ3RoIF4gYmIubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGlmZiB8PSAoYmFbaV0gfHwgMCkgXiAoYmJbaV0gfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkaWZmID09PSAwO1xufVxuIiwgIi8qKlxuICogYnVua2VyOi8vIGNvbm5lY3Rpb24gc3RyaW5ncy4gTm8gaW1wb3J0cywgc28gYW55dGhpbmcgdGhhdCBoYW5kbGVzIHByb2ZpbGVzXG4gKiBjYW4gdXNlIHRoaXMgd2l0aG91dCBsb2FkaW5nIHRoZSByZWxheSBjb2RlLlxuICpcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5cbi8qKlxuICogUGFyc2UgYSBidW5rZXI6Ly8gY29ubmVjdGlvbiBzdHJpbmdcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdW5rZXJVcmwodXJsKSB7XG4gICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnYnVua2VyOi8vJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgY29uc3QgcmVtb3RlUHVia2V5ID0gcGFyc2VkLmhvc3RuYW1lIHx8IHBhcnNlZC5wYXRobmFtZS5yZXBsYWNlKCcvLycsICcnKTtcblxuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBwdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5cyA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0QWxsKCdyZWxheScpO1xuICAgIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSByZWxheSBVUkxzXG4gICAgZm9yIChjb25zdCByZWxheSBvZiByZWxheXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgVVJMKHJlbGF5KTtcbiAgICAgICAgICAgIGlmIChyLnByb3RvY29sICE9PSAnd3NzOicgJiYgci5wcm90b2NvbCAhPT0gJ3dzOicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVsYXkgcHJvdG9jb2w6ICR7ci5wcm90b2NvbH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlbGF5IFVSTDogJHtyZWxheX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNlY3JldCA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0KCdzZWNyZXQnKSB8fCBudWxsO1xuXG4gICAgcmV0dXJuIHsgcmVtb3RlUHVia2V5LCByZWxheXMsIHNlY3JldCB9O1xufVxuXG4vKipcbiAqIEEgcmVsYXkgdmFsdWUgd2l0aG91dCBjcmVkZW50aWFsczogbm8gdXNlcmluZm8sIG5vIGBzZWNyZXRgIHBhcmFtLCBubyBmcmFnbWVudC5cbiAqIE90aGVyIHF1ZXJ5IHBhcmFtcyBzdGF5LiBBIHZhbHVlIHdpdGggbm9uZSBvZiB0aG9zZSBjb21lcyBiYWNrIHVuY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gY2xlYW5SZWxheShyZWxheSkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVsYXkpO1xuICAgIGNvbnN0IG5hbWVzID0gWy4uLnVybC5zZWFyY2hQYXJhbXMua2V5cygpXS5maWx0ZXIobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWNyZXQnKTtcbiAgICBpZiAoIXVybC51c2VybmFtZSAmJiAhdXJsLnBhc3N3b3JkICYmICF1cmwuaGFzaCAmJiBuYW1lcy5sZW5ndGggPT09IDApIHJldHVybiByZWxheTtcbiAgICB1cmwudXNlcm5hbWUgPSAnJztcbiAgICB1cmwucGFzc3dvcmQgPSAnJztcbiAgICB1cmwuaGFzaCA9ICcnO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUobmFtZSk7XG4gICAgcmV0dXJuIHVybC5ocmVmO1xufVxuXG4vKipcbiAqIERvZXMgdGhpcyBjb25uZWN0aW9uIHN0cmluZyBjYXJyeSBhIHNlY3JldCByZWRhY3RCdW5rZXJVcmwgd291bGQgcmVtb3ZlLCBpbiBpdHNcbiAqIGBzZWNyZXRgIHBhcmFtIG9yIGluc2lkZSBhIHJlbGF5IHZhbHVlPyBOZXZlciB0aHJvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJVcmxIYXNTZWNyZXQodXJsKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZWNyZXQsIHJlbGF5cyB9ID0gcGFyc2VCdW5rZXJVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuICEhc2VjcmV0IHx8IHJlbGF5cy5zb21lKHJlbGF5ID0+IGNsZWFuUmVsYXkocmVsYXkpICE9PSByZWxheSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmNvbnN0IGVuY29kZVJlbGF5ID0gKHJlbGF5KSA9PlxuICAgIGVuY29kZVVSSUNvbXBvbmVudChyZWxheSkucmVwbGFjZSgvJTNBL2csICc6JykucmVwbGFjZSgvJTJGL2csICcvJyk7XG5cbi8qKlxuICogVGhlIHNpZ25lcidzIGFkZHJlc3MgYWxvbmU6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PS4uLiZyZWxheT0uLi5cbiAqIFJlYnVpbHQgZnJvbSB0aGUgcGFyc2VkIGZpZWxkcywgc28gb2YgdGhlIGNvbm5lY3Rpb24gc3RyaW5nIG9ubHkgdGhlIHB1YmtleSBhbmRcbiAqIHRoZSByZWxheSB2YWx1ZXMgc3Vydml2ZS4gRWFjaCByZWxheSB2YWx1ZSBsb3NlcyBpdHMgdXNlcmluZm8sIGBzZWNyZXRgIHBhcmFtXG4gKiBhbmQgZnJhZ21lbnQsIGFuZCBrZWVwcyBhbnkgb3RoZXIgcXVlcnkgcGFyYW1zIGl0IGhhcy5cbiAqXG4gKiBAcGFyYW0geyp9IHVybCBhIGNvbm5lY3Rpb24gc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgYWRkcmVzcywgb3IgJycgaWYgYHVybGAgaXMgbm90IGEgdmFsaWQgY29ubmVjdGlvbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdEJ1bmtlclVybCh1cmwpIHtcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IHBhcnNlQnVua2VyVXJsKHVybCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY29uc3QgcmVsYXlzID0gcGFyc2VkLnJlbGF5cy5tYXAocmVsYXkgPT4gYHJlbGF5PSR7ZW5jb2RlUmVsYXkoY2xlYW5SZWxheShyZWxheSkpfWApLmpvaW4oJyYnKTtcbiAgICByZXR1cm4gYGJ1bmtlcjovLyR7cGFyc2VkLnJlbW90ZVB1YmtleX0/JHtyZWxheXN9YDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBwcm9maWxlIGxpc3Qgd2l0aCBlYWNoIGJ1bmtlclVybCByZWR1Y2VkIHRvIGl0cyBhZGRyZXNzLlxuICpcbiAqIEBwYXJhbSB7Kn0gcHJvZmlsZXMgYSBwcm9maWxlIGxpc3Q7IGFueXRoaW5nIGVsc2UgaXMgcmV0dXJuZWQgYXMgaXQgaXNcbiAqIEByZXR1cm5zIHRoZSBzYW1lIGxpc3Qgd2hlbiBub3RoaW5nIG5lZWRlZCBjaGFuZ2luZywgc28gYSBjYWxsZXIgY2FuIHNraXAgYVxuICogICAgICAgICAgd3JpdGUgYnkgY29tcGFyaW5nIHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuIHByb2ZpbGVzO1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgY2xlYW4gPSBwcm9maWxlcy5tYXAoKHByb2ZpbGUpID0+IHtcbiAgICAgICAgaWYgKCFwcm9maWxlPy5idW5rZXJVcmwpIHJldHVybiBwcm9maWxlO1xuICAgICAgICBjb25zdCBidW5rZXJVcmwgPSByZWRhY3RCdW5rZXJVcmwocHJvZmlsZS5idW5rZXJVcmwpO1xuICAgICAgICBpZiAoYnVua2VyVXJsID09PSBwcm9maWxlLmJ1bmtlclVybCkgcmV0dXJuIHByb2ZpbGU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4geyAuLi5wcm9maWxlLCBidW5rZXJVcmwgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2hhbmdlZCA/IGNsZWFuIDogcHJvZmlsZXM7XG59XG5cbi8qKlxuICogU3RvcmVkIHNlc3Npb25zIGFyZSBrZXllZCBieSBwcm9maWxlIHBvc2l0aW9uLiBSZW1vdmluZyBhIHByb2ZpbGUgdGFrZXMgaXRzXG4gKiBzZXNzaW9uIHdpdGggaXQgYW5kIG1vdmVzIGxhdGVyIHNlc3Npb25zIGRvd24gd2l0aCB0aGVpciBwcm9maWxlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsICo+fSBidW5rZXJTZXNzaW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IHJlbW92ZWRJbmRleFxuICogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyU2Vzc2lvbnNBZnRlckRlbGV0ZShidW5rZXJTZXNzaW9ucywgcmVtb3ZlZEluZGV4KSB7XG4gICAgY29uc3Qgc2hpZnRlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBpZiAoaW5kZXggPT09IHJlbW92ZWRJbmRleCkgY29udGludWU7XG4gICAgICAgIHNoaWZ0ZWRbaW5kZXggPiByZW1vdmVkSW5kZXggPyBpbmRleCAtIDEgOiBpbmRleF0gPSBzZXNzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gc2hpZnRlZDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSwgZm9yIGFueSBjaGFuZ2Ugb2YgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCAqPn0gYnVua2VyU2Vzc2lvbnNcbiAqIEBwYXJhbSB7QXJyYXk8W251bWJlciwgP251bWJlcl0+fSBtb3ZlcyBlYWNoIHByb2ZpbGUgdGhhdCBtb3ZlZCwgYW5kIHRvIHdoZXJlOyBudWxsIGlmIGdvbmVcbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcyhidW5rZXJTZXNzaW9ucywgbW92ZXMpIHtcbiAgICBjb25zdCBtb3ZlZCA9IG5ldyBNYXAobW92ZXMpO1xuICAgIGNvbnN0IHBsYWNlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBjb25zdCB0byA9IG1vdmVkLmhhcyhpbmRleCkgPyBtb3ZlZC5nZXQoaW5kZXgpIDogaW5kZXg7XG4gICAgICAgIGlmICh0byAhPT0gbnVsbCkgcGxhY2VkW3RvXSA9IHNlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBwbGFjZWQ7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUNBLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gs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QkFBZSxPQUFPO0FBRWxCLFVBQU0sY0FBYyxNQUFNLFFBQVEsYUFBYTtBQUMvQyxVQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVU7QUFDdkMsVUFBTSxPQUFPLEVBQUUsbUJBQW1CO0FBQ2xDLFVBQU0sT0FBTyxFQUFFLG9CQUFvQjtBQUVuQyxRQUFJLENBQUMsYUFBYTtBQUdkLGtCQUFZLElBQUk7QUFDaEIsZUFBUyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCO0FBQUEsSUFDSjtBQUVBLFFBQUksUUFBUTtBQUVSLGtCQUFZLEtBQUs7QUFDakIsZUFBUyxNQUFNLE1BQU07QUFBQSxRQUNqQixPQUFPO0FBQUEsUUFDUCxTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsTUFDWixDQUFDO0FBQ0Q7QUFBQSxJQUNKO0FBRUEsZ0JBQVksSUFBSTtBQUNoQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBRS9CLFVBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RSxVQUFNLFlBQVksVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFO0FBQ2xELFVBQU0sY0FBYyxNQUFNQyxlQUFjO0FBQ3hDLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFFL0IsZUFBVztBQUNYLFdBQU87QUFFUCxRQUFJLE1BQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsWUFBTSxRQUFRO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBRUEsV0FBUyxpQkFBaUIsb0JBQW9CLE1BQU0sVUFBVSxJQUFJLENBQUM7IiwKICAibmFtZXMiOiBbInRhcmdldCIsICJpbml0IiwgIklWX0JZVEVTIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJhcGkiLCAiSVZfQllURVMiLCAic3RvcmFnZSIsICJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiaXNTeW5jRW5hYmxlZCJdCn0K
