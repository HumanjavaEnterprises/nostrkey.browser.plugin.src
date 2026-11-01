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

  // src/utilities/nip78.js
  init_process();
  var API_KEYS_PATH = "vault/api-keys";

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

  // src/utilities/vault-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "vaultDocs";
  var DELETED_KEY = "deletedDocs";
  async function getDeletedDocs() {
    const data = await storage2.get({ [DELETED_KEY]: {} });
    return data[DELETED_KEY] && typeof data[DELETED_KEY] === "object" ? data[DELETED_KEY] : {};
  }
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
    const deleted = await getDeletedDocs();
    if (deleted[path] != null) {
      delete deleted[path];
      await storage2.set({ [STORAGE_KEY]: docs, [DELETED_KEY]: deleted });
    } else {
      await storage2.set({ [STORAGE_KEY]: docs });
    }
    scheduleSyncPush();
    return decryptDoc(docs[path]);
  }
  async function deleteDocumentLocal(path) {
    const docs = await getDocs();
    delete docs[path];
    const deleted = await getDeletedDocs();
    deleted[path] = Math.floor(Date.now() / 1e3);
    await storage2.set({ [STORAGE_KEY]: docs, [DELETED_KEY]: deleted });
    scheduleSyncPush();
  }
  async function listDocuments() {
    const docs = await getDocs();
    const decrypted = [];
    for (const doc of Object.values(docs)) {
      if (doc?.path === API_KEYS_PATH) continue;
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
    if (title === API_KEYS_PATH) {
      showToast("NostrKey keeps this name for itself. Choose another title.");
      return;
    }
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
    const isEncrypted = await askGate("isEncrypted");
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
  document.addEventListener("DOMContentLoaded", () => startPage(init));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL25pcDc4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdmF1bHQtc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9idW5rZXItdXJsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnNlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE1WMyBpbi1tZW1vcnkgYXJlYSB0aGF0IHN1cnZpdmVzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uIGJ1dCBuZXZlciB0b3VjaGVzXG4gICAgLy8gZGlzay4gTnVsbCBvbiBlbmdpbmVzIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGl0IChTYWZhcmkgYmFja2dyb3VuZCBwYWdlLFxuICAgIC8vIG9sZGVyIEZpcmVmb3gpIFx1MjAxNCBjYWxsZXJzIG11c3QgZmVhdHVyZS1kZXRlY3QgYW5kIGZhbGwgYmFjay5cbiAgICBzZXNzaW9uOiBfYnJvd3Nlci5zdG9yYWdlPy5zZXNzaW9uID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdGhlIGFyZWEgdG8gZXh0ZW5zaW9uLXByaXZpbGVnZWQgY29udGV4dHMuIENocm9tZS1vbmx5O1xuICAgICAgICAgKiByZXNvbHZlcyBoYXJtbGVzc2x5IHdoZXJlIHRoZSBtZXRob2QgaXMgYWJzZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWNjZXNzTGV2ZWwoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgYXNrR2F0ZSwgc3RhcnRQYWdlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhZ2UtZ2F0ZSc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHsgQVBJX0tFWVNfUEFUSCB9IGZyb20gJy4uL3V0aWxpdGllcy9uaXA3OCc7XG5pbXBvcnQge1xuICAgIGdldFZhdWx0SW5kZXgsXG4gICAgZ2V0RG9jdW1lbnQsXG4gICAgc2F2ZURvY3VtZW50TG9jYWwsXG4gICAgZGVsZXRlRG9jdW1lbnRMb2NhbCxcbiAgICBsaXN0RG9jdW1lbnRzLFxuICAgIHVwZGF0ZVN5bmNTdGF0dXMsXG59IGZyb20gJy4uL3V0aWxpdGllcy92YXVsdC1zdG9yZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGRvY3VtZW50czogW10sXG4gICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgIHNlbGVjdGVkUGF0aDogbnVsbCxcbiAgICBlZGl0b3JUaXRsZTogJycsXG4gICAgZWRpdG9yQ29udGVudDogJycsXG4gICAgcHJpc3RpbmVUaXRsZTogJycsXG4gICAgcHJpc3RpbmVDb250ZW50OiAnJyxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsXG4gICAgc3luY0Vycm9yOiAnJyxcbiAgICBzYXZpbmc6IGZhbHNlLFxuICAgIGlzTmV3OiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlcmVkRG9jdW1lbnRzKCkge1xuICAgIGlmICghc3RhdGUuc2VhcmNoUXVlcnkpIHJldHVybiBzdGF0ZS5kb2N1bWVudHM7XG4gICAgY29uc3QgcSA9IHN0YXRlLnNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHN0YXRlLmRvY3VtZW50cy5maWx0ZXIoZCA9PiBkLnBhdGgudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHN0YXRlLmVkaXRvckNvbnRlbnQgIT09IHN0YXRlLnByaXN0aW5lQ29udGVudCB8fCBzdGF0ZS5lZGl0b3JUaXRsZSAhPT0gc3RhdGUucHJpc3RpbmVUaXRsZTtcbn1cblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1zZykge1xuICAgIHN0YXRlLnRvYXN0ID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS50b2FzdCA9ICcnOyByZW5kZXIoKTsgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNDbGFzcyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiAnbGVkLS1ncmVlbic7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ2xlZC0tYW1iZXIgbGVkLXB1bHNlJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gJ1N5bmNlZCc7XG59XG5cbmZ1bmN0aW9uIGRvY1N5bmNDbGFzcyhzeW5jU3RhdHVzKSB7XG4gICAgaWYgKHN5bmNTdGF0dXMgPT09ICdzeW5jZWQnKSByZXR1cm4gJ2xlZC0tZ3JlZW4nO1xuICAgIGlmIChzeW5jU3RhdHVzID09PSAnbG9jYWwtb25seScpIHJldHVybiAnbGVkLS1hbWJlcic7XG4gICAgcmV0dXJuICdsZWQtLXJlZCc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3QgZG9jQ291bnQgPSAkKCdkb2MtY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBsZWQgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCk7XG4gICAgaWYgKGRvY0NvdW50KSBkb2NDb3VudC50ZXh0Q29udGVudCA9IHN0YXRlLmRvY3VtZW50cy5sZW5ndGggKyAnIGRvYycgKyAoc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEZpbGUgbGlzdFxuICAgIGNvbnN0IGZpbGVMaXN0ID0gJCgnZmlsZS1saXN0Jyk7XG4gICAgY29uc3QgZW1wdHlNc2cgPSAkKCduby1kb2N1bWVudHMnKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGdldEZpbHRlcmVkRG9jdW1lbnRzKCk7XG5cbiAgICBpZiAoZmlsZUxpc3QpIHtcbiAgICAgICAgZmlsZUxpc3QuaW5uZXJIVE1MID0gZmlsdGVyZWQubWFwKGRvYyA9PiBgXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJkb2MtaXRlbSAke3N0YXRlLnNlbGVjdGVkUGF0aCA9PT0gZG9jLnBhdGggPyAnc2VsZWN0ZWQnIDogJyd9XCJcbiAgICAgICAgICAgICAgICBkYXRhLWRvYy1wYXRoPVwiJHtkb2MucGF0aH1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkb2MtcGF0aCBtb25vIGlucy10cnVuY2F0ZVwiPiR7ZG9jLnBhdGh9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRvYy1zeW5jIGxlZC1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlZCAke2RvYy51bmRlY3J5cHRhYmxlID8gJ2xlZC0tcmVkJyA6IGRvY1N5bmNDbGFzcyhkb2Muc3luY1N0YXR1cyl9XCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1vbm9cIj4ke2RvYy51bmRlY3J5cHRhYmxlID8gJ3VuZGVjcnlwdGFibGUnIDogZG9jLnN5bmNTdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpO1xuXG4gICAgICAgIGZpbGVMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWRvYy1wYXRoXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZWxlY3REb2N1bWVudChlbC5kYXRhc2V0LmRvY1BhdGgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbXB0eU1zZykgZW1wdHlNc2cuc3R5bGUuZGlzcGxheSA9IGZpbHRlcmVkLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBFZGl0b3JcbiAgICBjb25zdCBlZGl0b3JQYW5lbCA9ICQoJ2VkaXRvci1wYW5lbCcpO1xuICAgIGNvbnN0IGVkaXRvckVtcHR5ID0gJCgnZWRpdG9yLWVtcHR5Jyk7XG4gICAgY29uc3Qgc2hvd0VkaXRvciA9IHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gbnVsbCB8fCBzdGF0ZS5pc05ldztcblxuICAgIGlmIChlZGl0b3JQYW5lbCkgZWRpdG9yUGFuZWwuc3R5bGUuZGlzcGxheSA9IHNob3dFZGl0b3IgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmIChlZGl0b3JFbXB0eSkgZWRpdG9yRW1wdHkuc3R5bGUuZGlzcGxheSA9IHNob3dFZGl0b3IgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgaWYgKHNob3dFZGl0b3IpIHtcbiAgICAgICAgY29uc3QgdGl0bGVJbnB1dCA9ICQoJ2VkaXRvci10aXRsZScpO1xuICAgICAgICBjb25zdCBjb250ZW50QXJlYSA9ICQoJ2VkaXRvci1jb250ZW50Jyk7XG4gICAgICAgIGNvbnN0IHNhdmVCdG4gPSAkKCdzYXZlLWRvYy1idG4nKTtcbiAgICAgICAgY29uc3QgZGVsZXRlQnRuID0gJCgnZGVsZXRlLWRvYy1idG4nKTtcbiAgICAgICAgY29uc3QgZGlydHlMYWJlbCA9ICQoJ2RpcnR5LWxhYmVsJyk7XG5cbiAgICAgICAgaWYgKHRpdGxlSW5wdXQpIHRpdGxlSW5wdXQudmFsdWUgPSBzdGF0ZS5lZGl0b3JUaXRsZTtcbiAgICAgICAgaWYgKGNvbnRlbnRBcmVhKSBjb250ZW50QXJlYS52YWx1ZSA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgIGlmIChzYXZlQnRuKSB7XG4gICAgICAgICAgICBzYXZlQnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICBzYXZlQnRuLnRleHRDb250ZW50ID0gc3RhdGUuc2F2aW5nID8gJ1NhdmluZy4uLicgOiAnU2F2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlbGV0ZUJ0bikgZGVsZXRlQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IG51bGwgJiYgIXN0YXRlLmlzTmV3ID8gJ2lubGluZS1mbGV4JyA6ICdub25lJztcbiAgICAgICAgaWYgKGRpcnR5TGFiZWwpIGRpcnR5TGFiZWwuc3R5bGUuZGlzcGxheSA9IGlzRGlydHkoKSA/ICdpbmxpbmUnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFNlYXJjaFxuICAgIGNvbnN0IHNlYXJjaElucHV0ID0gJCgnc2VhcmNoLWlucHV0Jyk7XG4gICAgaWYgKHNlYXJjaElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHNlYXJjaElucHV0KSB7XG4gICAgICAgIHNlYXJjaElucHV0LnZhbHVlID0gc3RhdGUuc2VhcmNoUXVlcnk7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBuZXdEb2N1bWVudCgpIHtcbiAgICBzdGF0ZS5pc05ldyA9IHRydWU7XG4gICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChwYXRoKTtcbiAgICBpZiAoIWRvYykgcmV0dXJuO1xuICAgIGlmIChkb2MudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICAvLyBPcGVuaW5nIGl0IHdvdWxkIHNob3cgYW4gZW1wdHkgZWRpdG9yIGFuZCB0aGUgbmV4dCBTYXZlIHdvdWxkIHdyaXRlXG4gICAgICAgIC8vIHRoYXQgZW1wdGluZXNzIG92ZXIgdGhlIHN0b3JlZCBjaXBoZXJ0ZXh0LiBSZWZ1c2UsIGFuZCBzYXkgd2h5LlxuICAgICAgICBzaG93VG9hc3QoJ1RoaXMgbm90ZSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlIFx1MjAxNCBsZWZ0IHVudG91Y2hlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBwYXRoO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gZG9jLnBhdGg7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBkb2MuY29udGVudDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50KCkge1xuICAgIGNvbnN0IHRpdGxlID0gc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpO1xuICAgIGlmICghdGl0bGUpIHJldHVybjtcbiAgICBpZiAodGl0bGUgPT09IEFQSV9LRVlTX1BBVEgpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdOb3N0cktleSBrZWVwcyB0aGlzIG5hbWUgZm9yIGl0c2VsZi4gQ2hvb3NlIGFub3RoZXIgdGl0bGUuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3ZhdWx0LnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBwYXRoOiB0aXRsZSwgY29udGVudDogc3RhdGUuZWRpdG9yQ29udGVudCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggJiYgc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSB0aXRsZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHRpdGxlLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnU2F2ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHRpdGxlLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCAmJiBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnU2F2ZWQgbG9jYWxseSAocmVsYXkgZXJyb3I6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykgKyAnKScpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCksIHN0YXRlLmVkaXRvckNvbnRlbnQsICdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKTtcbiAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHN0YXRlLmVkaXRvclRpdGxlO1xuICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgIHNob3dUb2FzdCgnU2F2ZWQgbG9jYWxseSAob2ZmbGluZSknKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlRG9jdW1lbnQoKSB7XG4gICAgaWYgKCFzdGF0ZS5zZWxlY3RlZFBhdGgpIHJldHVybjtcbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6IGBEZWxldGUgXCIke3N0YXRlLnNlbGVjdGVkUGF0aH1cIj9gLCBib2R5OiAnVGhlIGRvY3VtZW50IGlzIHJlbW92ZWQgZnJvbSB5b3VyIHZhdWx0IGFuZCwgaWYgcHVibGlzaGVkLCBhIGRlbGV0ZSByZXF1ZXN0IGlzIHNlbnQgdG8geW91ciByZWxheXMuJywgY29uZmlybUxhYmVsOiAnRGVsZXRlIGRvY3VtZW50JywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSByZXR1cm47XG5cbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuXG4gICAgaWYgKGRvYz8uZXZlbnRJZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5kZWxldGUnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgcGF0aDogc3RhdGUuc2VsZWN0ZWRQYXRoLCBldmVudElkOiBkb2MuZXZlbnRJZCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgfVxuXG4gICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IG51bGw7XG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIHNob3dUb2FzdCgnRGVsZXRlZCcpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd2YXVsdC5mZXRjaCcgfSk7XG5cbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgICAgICBzdGF0ZS5zeW5jRXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9jYWxEb2NzID0gYXdhaXQgZ2V0VmF1bHRJbmRleCgpO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVtb3RlIG9mIHJlc3VsdC5kb2N1bWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsID0gbG9jYWxEb2NzW3JlbW90ZS5wYXRoXTtcblxuICAgICAgICAgICAgaWYgKCFsb2NhbCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHJlbW90ZS5wYXRoLCByZW1vdGUuY29udGVudCwgJ3N5bmNlZCcsIHJlbW90ZS5ldmVudElkLCByZW1vdGUuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobG9jYWwuc3luY1N0YXR1cyA9PT0gJ2xvY2FsLW9ubHknKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsLmNvbnRlbnQgIT09IHJlbW90ZS5jb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN5bmNTdGF0dXMocmVtb3RlLnBhdGgsICdjb25mbGljdCcsIHJlbW90ZS5ldmVudElkLCByZW1vdGUuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFsb2NhbC5yZWxheUNyZWF0ZWRBdCB8fCByZW1vdGUuY3JlYXRlZEF0ID4gbG9jYWwucmVsYXlDcmVhdGVkQXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChyZW1vdGUucGF0aCwgcmVtb3RlLmNvbnRlbnQsICdzeW5jZWQnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCA9PT0gcmVtb3RlLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IHJlbW90ZS5jb250ZW50O1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSByZW1vdGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnaWRsZSc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gZS5tZXNzYWdlIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgnbmV3LWRvYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuZXdEb2N1bWVudCk7XG4gICAgJCgnc3luYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzeW5jQWxsKTtcbiAgICAkKCdzYXZlLWRvYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlRG9jdW1lbnQpO1xuICAgICQoJ2RlbGV0ZS1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGVsZXRlRG9jdW1lbnQpO1xuXG4gICAgJCgnc2VhcmNoLWlucHV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuc2VhcmNoUXVlcnkgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdlZGl0b3ItdGl0bGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ2VkaXRvci1jb250ZW50Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBHYXRlOiByZXF1aXJlIG1hc3RlciBwYXNzd29yZCBiZWZvcmUgYWxsb3dpbmcgdmF1bHQgYWNjZXNzXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhc2tHYXRlKCdpc0VuY3J5cHRlZCcpO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCByZWxheXM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUucmVsYXlJbmZvID0geyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCBkb2N1bWVudHM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gW107XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKGhhc1JlbGF5cygpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBTeW5jIGZhaWxlZDonLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gc3RhcnRQYWdlKGluaXQpKTtcbiIsICIvKipcbiAqIFRoZSBxdWVzdGlvbnMgYSBwYWdlIGFza3MgdGhlIHdvcmtlciBiZWZvcmUgaXQgY2FuIGRyYXcgYW55dGhpbmcuIFRoZSB3b3JrZXJcbiAqIGNhbiBhbnN3ZXIgdGhlbSB3aXRoIGEgcmVmdXNhbCBvYmplY3QsIGFuZCBhbiBvYmplY3QgaXMgdHJ1dGh5LCBzbyBhIHBhZ2UgdGhhdFxuICogcmVhZHMgaXQgYXMgYSB5ZXMgc2hvd3MgdGhlIHdyb25nIHNjcmVlbi4gUGFnZXMgYXNrIHRocm91Z2ggYXNrR2F0ZSBpbnN0ZWFkOlxuICogYSByZWZ1c2FsIHJlcGxhY2VzIHRoZSBwYWdlIHdpdGggYSBwbGFpbiBtZXNzYWdlIGFuZCBzdG9wcyBpdHMgc3RhcnQtdXAuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuZXhwb3J0IGNvbnN0IFNUQVJUX0VSUk9SID0gJ05vc3RyS2V5IGNvdWxkIG5vdCBzdGFydCB0aGlzIHBhZ2UuIFJlbG9hZCBvciByZWluc3RhbGwuJztcblxuZXhwb3J0IGNsYXNzIEdhdGVSZWZ1c2VkIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmdXNlZChhbnN3ZXIpIHtcbiAgICByZXR1cm4gISFhbnN3ZXIgJiYgdHlwZW9mIGFuc3dlciA9PT0gJ29iamVjdCcgJiYgYW5zd2VyLnN1Y2Nlc3MgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1N0YXJ0RXJyb3IoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgncm9sZScsICdhbGVydCcpO1xuICAgIG1lc3NhZ2UuZGF0YXNldC5zdGFydEVycm9yID0gJyc7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFNUQVJUX0VSUk9SO1xuICAgIG1lc3NhZ2Uuc3R5bGUucGFkZGluZyA9ICcxNnB4JztcbiAgICBkb2N1bWVudC5ib2R5LnJlcGxhY2VDaGlsZHJlbihtZXNzYWdlKTtcbn1cblxuLyoqIEFzayB0aGUgd29ya2VyLiBPbiBhIHJlZnVzYWwsIHNob3cgdGhlIG1lc3NhZ2UgYW5kIHRocm93IEdhdGVSZWZ1c2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFza0dhdGUoa2luZCkge1xuICAgIGNvbnN0IGFuc3dlciA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZCB9KTtcbiAgICBpZiAoaXNSZWZ1c2VkKGFuc3dlcikpIHtcbiAgICAgICAgc2hvd1N0YXJ0RXJyb3IoKTtcbiAgICAgICAgdGhyb3cgbmV3IEdhdGVSZWZ1c2VkKCk7XG4gICAgfVxuICAgIHJldHVybiBhbnN3ZXI7XG59XG5cbi8qKiBSdW4gYSBwYWdlJ3Mgc3RhcnQtdXAuIEEgcmVmdXNhbCBoYXMgYWxyZWFkeSBiZWVuIHNob3duLCBzbyBpdCBlbmRzIGhlcmUuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRQYWdlKGluaXQpIHtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBpbml0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgR2F0ZVJlZnVzZWQpKSB0aHJvdyBlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiLyoqXG4gKiBOSVAtNzggRW5jcnlwdGVkIFZhdWx0IFByb3RvY29sXG4gKlxuICogUHVyZSBmdW5jdGlvbnMgZm9yIGJ1aWxkaW5nL3BhcnNpbmcga2luZCAzMDA3OCAocGFyYW1ldGVyaXplZCByZXBsYWNlYWJsZSlcbiAqIGV2ZW50cyB1c2VkIGFzIGFuIGVuY3J5cHRlZCBtYXJrZG93biBkb2N1bWVudCB2YXVsdC5cbiAqXG4gKiBkLXRhZyBwcmVmaXggXCJub3N0cmtleTpcIiBuYW1lc3BhY2VzIG91ciB2YXVsdCBpdGVtcyBmcm9tIG90aGVyIE5JUC03OCBhcHBzLlxuICogUmVsYXlzIHNlZSBmaWxlIHBhdGhzIGJ1dCBub3QgY29udGVudCAoTklQLTQ0IGVuY3J5cHRlZCB0byBzZWxmKS5cbiAqL1xuXG5jb25zdCBLSU5EX0FQUF9EQVRBID0gMzAwNzg7XG5jb25zdCBLSU5EX0RFTEVUSU9OID0gNTtcbmNvbnN0IERUQUdfUFJFRklYID0gJ25vc3Rya2V5Oic7XG5jb25zdCBDTElFTlRfVEFHID0gJ25vc3Rya2V5JztcblxuLyoqIFRoZSBwYXRoIHRoZSBBUEkga2V5IHN0b3JlIHVzZXMuIEl0IGlzIG5ldmVyIGEgdmF1bHQgZG9jdW1lbnQuICovXG5leHBvcnQgY29uc3QgQVBJX0tFWVNfUEFUSCA9ICd2YXVsdC9hcGkta2V5cyc7XG5cbi8qKlxuICogQnVpbGQgYW4gdW5zaWduZWQga2luZCAzMDA3OCB2YXVsdCBldmVudC5cbiAqIENhbGxlciBtdXN0IHNpZ24gKGZpbmFsaXplRXZlbnQgb3IgYnVua2VyIHNlc3Npb24uc2lnbkV2ZW50KS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIERvY3VtZW50IHBhdGggKGUuZy4gXCJub3Rlcy90b2RvLm1kXCIpXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkQ29udGVudCAtIE5JUC00NCBlbmNyeXB0ZWQgY29udGVudCBzdHJpbmdcbiAqIEByZXR1cm5zIHtvYmplY3R9IFVuc2lnbmVkIGV2ZW50IHRlbXBsYXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFZhdWx0RXZlbnQocGF0aCwgZW5jcnlwdGVkQ29udGVudCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGtpbmQ6IEtJTkRfQVBQX0RBVEEsXG4gICAgICAgIGNvbnRlbnQ6IGVuY3J5cHRlZENvbnRlbnQsXG4gICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgIFsnZCcsIGAke0RUQUdfUFJFRklYfSR7cGF0aH1gXSxcbiAgICAgICAgICAgIFsnY2xpZW50JywgQ0xJRU5UX1RBR10sXG4gICAgICAgIF0sXG4gICAgICAgIGNyZWF0ZWRfYXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxuICAgIH07XG59XG5cbi8qKlxuICogQnVpbGQgYW4gdW5zaWduZWQga2luZCA1IGRlbGV0aW9uIGV2ZW50IChOSVAtMDkpIGZvciBhIHZhdWx0IGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudElkIC0gVGhlIGV2ZW50IGlkIHRvIGRlbGV0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBEb2N1bWVudCBwYXRoIChmb3IgdGhlIGEtdGFnIHJlZmVyZW5jZSlcbiAqIEByZXR1cm5zIHtvYmplY3R9IFVuc2lnbmVkIGRlbGV0aW9uIGV2ZW50IHRlbXBsYXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFZhdWx0RGVsZXRpb24oZXZlbnRJZCwgcGF0aCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGtpbmQ6IEtJTkRfREVMRVRJT04sXG4gICAgICAgIGNvbnRlbnQ6ICd2YXVsdCBkb2N1bWVudCBkZWxldGVkJyxcbiAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgWydlJywgZXZlbnRJZF0sXG4gICAgICAgICAgICBbJ2EnLCBgJHtLSU5EX0FQUF9EQVRBfTo6JHtEVEFHX1BSRUZJWH0ke3BhdGh9YF0sXG4gICAgICAgIF0sXG4gICAgICAgIGNyZWF0ZWRfYXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxuICAgIH07XG59XG5cbi8qKlxuICogQnVpbGQgYSBSRVEgZmlsdGVyIGZvciBmZXRjaGluZyBhbGwgdmF1bHQgZG9jdW1lbnRzIGZvciBhIHB1YmtleS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVia2V5IC0gSGV4IHB1YmxpYyBrZXlcbiAqIEByZXR1cm5zIHtvYmplY3R9IE5vc3RyIFJFUSBmaWx0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmF1bHRGaWx0ZXIocHVia2V5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2luZHM6IFtLSU5EX0FQUF9EQVRBXSxcbiAgICAgICAgYXV0aG9yczogW3B1YmtleV0sXG4gICAgfTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIGtpbmQgMzAwNzggZXZlbnQgaW50byBhIHZhdWx0IGRvY3VtZW50IGRlc2NyaXB0b3IuXG4gKiBSZXR1cm5zIG51bGwgaWYgdGhlIGV2ZW50IGlzIG5vdCBhIG5vc3Rya2V5IHZhdWx0IGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIE5vc3RyIGV2ZW50XG4gKiBAcmV0dXJucyB7eyBwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgY3JlYXRlZEF0OiBudW1iZXIsIGV2ZW50SWQ6IHN0cmluZyB9IHwgbnVsbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVmF1bHRFdmVudChldmVudCkge1xuICAgIGlmIChldmVudC5raW5kICE9PSBLSU5EX0FQUF9EQVRBKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRUYWcgPSBldmVudC50YWdzPy5maW5kKHQgPT4gdFswXSA9PT0gJ2QnKTtcbiAgICBpZiAoIWRUYWcgfHwgIWRUYWdbMV0/LnN0YXJ0c1dpdGgoRFRBR19QUkVGSVgpKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IHBhdGggPSBkVGFnWzFdLnNsaWNlKERUQUdfUFJFRklYLmxlbmd0aCk7XG4gICAgaWYgKCFwYXRoKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHBhdGgsXG4gICAgICAgIGNvbnRlbnQ6IGV2ZW50LmNvbnRlbnQsXG4gICAgICAgIGNyZWF0ZWRBdDogZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgICAgZXZlbnRJZDogZXZlbnQuaWQsXG4gICAgfTtcbn1cbiIsICIvKipcbiAqIFZhdWx0IFN0b3JlIFx1MjAxNCBMb2NhbCBjYWNoZSBmb3IgZW5jcnlwdGVkIHZhdWx0IGRvY3VtZW50c1xuICpcbiAqIFN0b3JhZ2Ugc2NoZW1hIGluIGJyb3dzZXIuc3RvcmFnZS5sb2NhbDpcbiAqICAgdmF1bHREb2NzOiB7XG4gKiAgICAgXCJwYXRoL3RvL2ZpbGUubWRcIjoge1xuICogICAgICAgcGF0aCwgY29udGVudCwgdXBkYXRlZEF0LCBzeW5jU3RhdHVzLCBldmVudElkLCByZWxheUNyZWF0ZWRBdCxcbiAqICAgICAgIHByb2ZpbGVTY29wZVxuICogICAgIH1cbiAqICAgfVxuICpcbiAqIHN5bmNTdGF0dXM6IFwic3luY2VkXCIgfCBcImxvY2FsLW9ubHlcIiB8IFwiY29uZmxpY3RcIlxuICogcHJvZmlsZVNjb3BlOiBudWxsIChhbGwgcHJvZmlsZXMpIHwgbnVtYmVyW10gKHNwZWNpZmljIHByb2ZpbGUgaW5kaWNlcylcbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgc2NoZWR1bGVTeW5jUHVzaCB9IGZyb20gJy4vc3luYy1tYW5hZ2VyJztcbmltcG9ydCB7IHdyYXBTZWNyZXQsIHVud3JhcFNlY3JldCB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcbmltcG9ydCB7IEFQSV9LRVlTX1BBVEggfSBmcm9tICcuL25pcDc4JztcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuY29uc3QgU1RPUkFHRV9LRVkgPSAndmF1bHREb2NzJztcbi8vIERlbGV0aW9uIHRvbWJzdG9uZXMga2V5ZWQgYnkgcGF0aCAoaXNzdWUgIzMpOiB7IDxwYXRoPjogZGVsZXRlZEF0U2Vjb25kcyB9LlxuY29uc3QgREVMRVRFRF9LRVkgPSAnZGVsZXRlZERvY3MnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXREZWxldGVkRG9jcygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbREVMRVRFRF9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtERUxFVEVEX0tFWV0gJiYgdHlwZW9mIGRhdGFbREVMRVRFRF9LRVldID09PSAnb2JqZWN0JyA/IGRhdGFbREVMRVRFRF9LRVldIDoge307XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERvY3MoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXToge30gfSk7XG4gICAgcmV0dXJuIGRhdGFbU1RPUkFHRV9LRVldIHx8IHt9O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkb2N1bWVudCdzIGBjb250ZW50YCBmb3IgY2FsbGVycy4gUmUtdGhyb3dzIGxvY2sgZXJyb3JzIHNvIGEgbG9ja2VkXG4gKiBzZXNzaW9uIGNhbm5vdCByZWFkIG5vdGVzIChGNikuXG4gKlxuICogQSBnZW51aW5lIGRlY3J5cHQgZmFpbHVyZSAoZS5nLiBhIHZhbHVlIHN5bmNlZCBmcm9tIGFub3RoZXIgZGV2aWNlLCBvciBhIGJsb2JcbiAqIHdob3NlIHdyYXBwaW5nIGtleSByb3RhdGVkIGF3YXkpIGlzIHJlcG9ydGVkIGFzIGB1bmRlY3J5cHRhYmxlOiB0cnVlYCB3aXRoXG4gKiBgY29udGVudDogbnVsbGAgXHUyMDE0IE5PVCBhcyBhbiBlbXB0eSBzdHJpbmcuIEVtcHR5IGNvbnRlbnQgaXMgaW5kaXN0aW5ndWlzaGFibGVcbiAqIGZyb20gYSByZWFsIGVtcHR5IG5vdGU6IHRoZSBlZGl0b3Igb3BlbmVkIGl0IGJsYW5rLCBhbmQgdGhlIG5leHQgU2F2ZSB3cm90ZVxuICogdGhhdCBibGFuayBvdmVyIHRoZSB1c2VyJ3Mgb25seSBjb3B5LiBgbnVsbGAgKyB0aGUgZmxhZyBsZXRzIGNhbGxlcnMgcmVmdXNlXG4gKiB0byBvcGVuIG9yIG92ZXJ3cml0ZSBpdCwgYW5kIGxlYXZlcyB0aGUgY2lwaGVydGV4dCBhdCByZXN0IHVudG91Y2hlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERvYyhkb2MpIHtcbiAgICBpZiAoIWRvYykgcmV0dXJuIGRvYztcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyAuLi5kb2MsIGNvbnRlbnQ6IGF3YWl0IHVud3JhcFNlY3JldChkb2MuY29udGVudCkgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChTdHJpbmcoZS5tZXNzYWdlIHx8ICcnKS5zdGFydHNXaXRoKCdsb2NrZWQnKSkgdGhyb3cgZTtcbiAgICAgICAgcmV0dXJuIHsgLi4uZG9jLCBjb250ZW50OiBudWxsLCB1bmRlY3J5cHRhYmxlOiB0cnVlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZXREb2NzKGRvY3MpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IGRvY3MgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCB2YXVsdCBkb2NzIG9iamVjdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IE1hcCBvZiBwYXRoIC0+IGRvY1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmF1bHRJbmRleCgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGNvbnN0IG91dCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3BhdGgsIGRvY10gb2YgT2JqZWN0LmVudHJpZXMoZG9jcykpIHtcbiAgICAgICAgb3V0W3BhdGhdID0gYXdhaXQgZGVjcnlwdERvYyhkb2MpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBkb2N1bWVudCBieSBwYXRoIChjb250ZW50IGRlY3J5cHRlZCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fG51bGw+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RG9jdW1lbnQocGF0aCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgcmV0dXJuIGRvY3NbcGF0aF0gPyBkZWNyeXB0RG9jKGRvY3NbcGF0aF0pIDogbnVsbDtcbn1cblxuLyoqXG4gKiBTYXZlIG9yIHVwZGF0ZSBhIGRvY3VtZW50IGluIHRoZSBsb2NhbCBjYWNoZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVEb2N1bWVudExvY2FsKHBhdGgsIGNvbnRlbnQsIHN5bmNTdGF0dXMsIGV2ZW50SWQgPSBudWxsLCByZWxheUNyZWF0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jc1twYXRoXTtcbiAgICBkb2NzW3BhdGhdID0ge1xuICAgICAgICBwYXRoLFxuICAgICAgICBjb250ZW50OiBhd2FpdCB3cmFwU2VjcmV0KGNvbnRlbnQpLCAvLyBUMC00OiBlbmNyeXB0IG5vdGUgYm9keSBhdCByZXN0XG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgICAgIHN5bmNTdGF0dXMsXG4gICAgICAgIGV2ZW50SWQsXG4gICAgICAgIHJlbGF5Q3JlYXRlZEF0LFxuICAgICAgICBwcm9maWxlU2NvcGU6IGV4aXN0aW5nPy5wcm9maWxlU2NvcGUgPz8gbnVsbCxcbiAgICB9O1xuICAgIC8vIFJlY3JlYXRlIGNsZWFycyBhbnkgdG9tYnN0b25lIGZvciB0aGlzIHBhdGggKGlzc3VlICMzKSwgc28gdGhlIGZyZXNobHlcbiAgICAvLyBzYXZlZCBkb2MgaXMgbm8gbG9uZ2VyIHN1cHByZXNzZWQgZnJvbSB0aGUgc3luYyBwYXlsb2FkLlxuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkRG9jcygpO1xuICAgIGlmIChkZWxldGVkW3BhdGhdICE9IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIGRlbGV0ZWRbcGF0aF07XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcywgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IGRvY3MgfSk7XG4gICAgfVxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICByZXR1cm4gZGVjcnlwdERvYyhkb2NzW3BhdGhdKTtcbn1cblxuLyoqXG4gKiBEZWxldGUgYSBkb2N1bWVudCBmcm9tIHRoZSBsb2NhbCBjYWNoZSBhbmQgcmVjb3JkIGEgdG9tYnN0b25lIChpc3N1ZSAjMykgc29cbiAqIHRoZSBkZWxldGlvbiBwcm9wYWdhdGVzIHRocm91Z2ggc3RvcmFnZS5zeW5jIGFuZCBhIHN0YWxlIGNvcHkgb24gYW5vdGhlclxuICogZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgaXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVEb2N1bWVudExvY2FsKHBhdGgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGRlbGV0ZSBkb2NzW3BhdGhdO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkRG9jcygpO1xuICAgIGRlbGV0ZWRbcGF0aF0gPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IGRvY3MsIFtERUxFVEVEX0tFWV06IGRlbGV0ZWQgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIGRvY3VtZW50cyBzb3J0ZWQgYnkgdXBkYXRlZEF0IGRlc2NlbmRpbmcuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59IFNvcnRlZCBhcnJheSBvZiBkb2MgbWV0YWRhdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3REb2N1bWVudHMoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGRvYyBvZiBPYmplY3QudmFsdWVzKGRvY3MpKSB7XG4gICAgICAgIGlmIChkb2M/LnBhdGggPT09IEFQSV9LRVlTX1BBVEgpIGNvbnRpbnVlO1xuICAgICAgICBkZWNyeXB0ZWQucHVzaChhd2FpdCBkZWNyeXB0RG9jKGRvYykpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdGVkLnNvcnQoKGEsIGIpID0+IGIudXBkYXRlZEF0IC0gYS51cGRhdGVkQXQpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc3luYyBzdGF0dXMgKGFuZCBvcHRpb25hbGx5IGV2ZW50SWQvcmVsYXlDcmVhdGVkQXQpIGZvciBhIGRvY3VtZW50LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3luY1N0YXR1cyhwYXRoLCBzdGF0dXMsIGV2ZW50SWQgPSBudWxsLCByZWxheUNyZWF0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGlmICghZG9jc1twYXRoXSkgcmV0dXJuIG51bGw7XG4gICAgZG9jc1twYXRoXS5zeW5jU3RhdHVzID0gc3RhdHVzO1xuICAgIGlmIChldmVudElkICE9PSBudWxsKSBkb2NzW3BhdGhdLmV2ZW50SWQgPSBldmVudElkO1xuICAgIGlmIChyZWxheUNyZWF0ZWRBdCAhPT0gbnVsbCkgZG9jc1twYXRoXS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldERvY3MoZG9jcyk7XG4gICAgcmV0dXJuIGRvY3NbcGF0aF07XG59XG4iLCAiLyoqXG4gKiBTeW5jIE1hbmFnZXIgXHUyMDE0IFBsYXRmb3JtIHN5bmMgdmlhIHN0b3JhZ2Uuc3luYyAoQ2hyb21lIFx1MjE5MiBHb29nbGUsIFNhZmFyaSBcdTIxOTIgaUNsb3VkKVxuICpcbiAqIEFyY2hpdGVjdHVyZTpcbiAqICAgV3JpdGU6IGFwcCBcdTIxOTIgc3RvcmFnZS5sb2NhbCBcdTIxOTIgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjE5MiBzdG9yYWdlLnN5bmNcbiAqICAgUmVhZDogIHB1bGxGcm9tU3luYygpIG9uIHN0YXJ0dXAgXHUyMTkyIG1lcmdlIGludG8gc3RvcmFnZS5sb2NhbFxuICogICBMaXN0ZW46IHN0b3JhZ2Uub25DaGFuZ2VkKFwic3luY1wiKSBcdTIxOTIgbWVyZ2UgcmVtb3RlIGNoYW5nZXMgaW50byBsb2NhbFxuICpcbiAqIHN0b3JhZ2UubG9jYWwgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoLiBzdG9yYWdlLnN5bmMgaXMgYSBiZXN0LWVmZm9ydCBtaXJyb3IuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGlzQ2lwaGVydGV4dCwgaXNQYXNzd29yZEJsb2IgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5pbXBvcnQgeyBidW5rZXJTZXNzaW9uc0FmdGVyTW92ZXMsIHJlZGFjdFByb2ZpbGVzIH0gZnJvbSAnLi9idW5rZXItdXJsLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgU1lOQ19RVU9UQSA9IDEwMl80MDA7ICAgICAgIC8vIDEwMCBLQiB0b3RhbFxuY29uc3QgTUFYX0lURU0gPSA4XzE5MjsgICAgICAgICAgIC8vIDggS0IgcGVyIGl0ZW1cbmNvbnN0IE1BWF9JVEVNUyA9IDUxMjtcbmNvbnN0IENIVU5LX1BSRUZJWCA9ICdfY2h1bms6JztcbmNvbnN0IFNZTkNfTUVUQV9LRVkgPSAnX3N5bmNfbWV0YSc7XG5jb25zdCBMT0NBTF9FTkFCTEVEX0tFWSA9ICdwbGF0Zm9ybVN5bmNFbmFibGVkJztcblxuLy8gS2V5cyB0aGF0IHNob3VsZCBuZXZlciBiZSBzeW5jZWRcbmNvbnN0IEVYQ0xVREVEX0tFWVMgPSBbXG4gICAgJ2J1bmtlclNlc3Npb25zJyxcbiAgICAnaWdub3JlSW5zdGFsbEhvb2snLFxuICAgICdwYXNzd29yZEhhc2gnLFxuICAgICdwYXNzd29yZFNhbHQnLFxuXTtcblxuLy8gUHJpb3JpdHkgdGllcnMgZm9yIGJ1ZGdldCBhbGxvY2F0aW9uXG5jb25zdCBQUklPUklUWSA9IHtcbiAgICAvLyBUb21ic3RvbmVzIChkZWxldGlvbiByZWNvcmRzKSBnZXQgdGhlIGd1YXJhbnRlZWQgdG9wIHNsb3Q6IGEgZGVsZXRpb24gbXVzdFxuICAgIC8vIG5ldmVyIGxvc2UgaXRzIGJ1ZGdldCByYWNlIHRvIGJ1bGt5IHZhdWx0IGNvbnRlbnQsIG9yIHRoZSBkZWxldGVkIGl0ZW1cbiAgICAvLyByZXN1cnJlY3RzIG9uIHRoZSBuZXh0IGRldmljZSB0aGF0IHN0aWxsIGhhcyBhIHN0YWxlIGNvcHkgKGlzc3VlICMzKS5cbiAgICBQMF9UT01CU1RPTkVTOiAwLFxuICAgIFAxX1BST0ZJTEVTOiAxLFxuICAgIFAyX1NFVFRJTkdTOiAyLFxuICAgIFAzX0FQSUtFWVM6IDMsXG4gICAgUDRfVkFVTFQ6IDQsXG59O1xuXG4vLyBXYXJuaW5nIHRocmVzaG9sZHMgZm9yIHJldGFpbmVkIGRlbGV0aW9uIGhpc3RvcnkgKHRvbWJzdG9uZXMgYXJlIGtlcHRcbi8vIGZvcmV2ZXIgc28gYW4gb2ZmbGluZSBkZXZpY2UgdGhhdCBuZXZlciBsZWFybmVkIGFib3V0IGEgZGVsZXRpb24gY2Fubm90XG4vLyByZXN1cnJlY3QgdGhlIGl0ZW0gXHUyMDE0IHRoZSBjb3VudCBvbmx5IGdyb3dzLCBzbyBudWRnZSB0aGUgdXNlciB0byB0cmltIGl0KS5cbmNvbnN0IFRPTUJTVE9ORV9XQVJOX0dFTlRMRSA9IDg7XG5jb25zdCBUT01CU1RPTkVfV0FSTl9TVFJPTkcgPSAxNjtcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xubGV0IHB1c2hUaW1lciA9IG51bGw7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ2h1bmtpbmcgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU3BsaXQgYSBKU09OLXNlcmlhbGlzZWQgdmFsdWUgaW50byA8PThLQiBjaHVua3MuXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHsga2V5LCB2YWx1ZSB9IHBhaXJzIHJlYWR5IGZvciBzdG9yYWdlLnN5bmMuc2V0KCkuXG4gKi9cbmZ1bmN0aW9uIGNodW5rVmFsdWUoa2V5LCBqc29uU3RyaW5nKSB7XG4gICAgY29uc3QgY2h1bmtzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqc29uU3RyaW5nLmxlbmd0aDsgaSArPSBNQVhfSVRFTSAtIDEwMCkge1xuICAgICAgICAvLyBSZXNlcnZlIH4xMDAgYnl0ZXMgZm9yIHRoZSBrZXkgb3ZlcmhlYWQgaW4gdGhlIHN0b3JlZCBpdGVtXG4gICAgICAgIGNodW5rcy5wdXNoKGpzb25TdHJpbmcuc2xpY2UoaSwgaSArIE1BWF9JVEVNIC0gMTAwKSk7XG4gICAgfVxuICAgIGlmIChjaHVua3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpdHMgaW4gYSBzaW5nbGUgaXRlbSBcdTIwMTQgc3RvcmUgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIFt7IGtleSwgdmFsdWU6IGpzb25TdHJpbmcgfV07XG4gICAgfVxuICAgIC8vIE11bHRpcGxlIGNodW5rc1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWAsIHZhbHVlOiBjaHVua3NbaV0gfSk7XG4gICAgfVxuICAgIC8vIFN0b3JlIGEgbWV0YWRhdGEgZW50cnkgc28gd2Uga25vdyBob3cgbWFueSBjaHVua3MgdGhlcmUgYXJlXG4gICAgZW50cmllcy5wdXNoKHsga2V5LCB2YWx1ZTogSlNPTi5zdHJpbmdpZnkoeyBfX2NodW5rZWQ6IHRydWUsIGNvdW50OiBjaHVua3MubGVuZ3RoIH0pIH0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vKipcbiAqIFJlYXNzZW1ibGUgY2h1bmtlZCBkYXRhIGZyb20gYSBzeW5jIGRhdGEgb2JqZWN0LlxuICogUmV0dXJucyB0aGUgcGFyc2VkIEpTT04gdmFsdWUsIG9yIG51bGwgb24gZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCBzeW5jRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLl9fY2h1bmtlZCkge1xuICAgICAgICAgICAgLy8gTm90IGNodW5rZWQgXHUyMDE0IHBhcnNlIGRpcmVjdGx5XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbWJpbmVkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua0tleSA9IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWA7XG4gICAgICAgICAgICBpZiAoc3luY0RhdGFbY2h1bmtLZXldID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29tYmluZWQgKz0gc3luY0RhdGFbY2h1bmtLZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbWJpbmVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFZlcnNpb24gY29tcGFyaXNvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ29tcGFyZSB0d28gZG90dGVkIHZlcnNpb24gc3RyaW5ncyBudW1lcmljYWxseS5cbiAqIFJldHVybnMgMSBpZiBhID4gYiwgLTEgaWYgYSA8IGIsIDAgaWYgZXF1YWwuIE1pc3NpbmcgLyBub24tbnVtZXJpY1xuICogY29tcG9uZW50cyBhcmUgdHJlYXRlZCBhcyAwIHNvICcxLjEwLjAnIGNvcnJlY3RseSBzb3J0cyBhYm92ZSAnMS45LjAnXG4gKiAoYSBwbGFpbiBzdHJpbmcgY29tcGFyZSB3b3VsZCBwdXQgJzEuOS4wJyBmaXJzdCkuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVTZW12ZXIoYSwgYikge1xuICAgIGNvbnN0IHBhID0gU3RyaW5nKGEpLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgcGIgPSBTdHJpbmcoYikuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBsZW4gPSBNYXRoLm1heChwYS5sZW5ndGgsIHBiLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjb25zdCB4ID0gcGFyc2VJbnQocGFbaV0sIDEwKSB8fCAwO1xuICAgICAgICBjb25zdCB5ID0gcGFyc2VJbnQocGJbaV0sIDEwKSB8fCAwO1xuICAgICAgICBpZiAoeCA+IHkpIHJldHVybiAxO1xuICAgICAgICBpZiAoeCA8IHkpIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgc3luYyBwYXlsb2FkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBsb2NhbCBkYXRhIGFuZCBidWlsZCBhIHByaW9yaXRpc2VkIGxpc3Qgb2YgZW50cmllcyB0byBzeW5jLlxuICogUmV0dXJucyB7IGVudHJpZXM6IFt7IGtleSwganNvblN0cmluZywgcHJpb3JpdHksIHNpemUgfV0sIHRvdGFsU2l6ZSB9XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZFN5bmNQYXlsb2FkKCkge1xuICAgIGNvbnN0IGFsbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcblxuICAgIC8vIFQwLTU6IGEgc2VjcmV0IGlzIG9ubHkgZXZlciBlbWl0dGVkIHRvIHN0b3JhZ2Uuc3luYyAoR29vZ2xlL2lDbG91ZCkgaWYgaXRcbiAgICAvLyBpcyBhbHJlYWR5IGFuIGVuY3J5cHRlZCBibG9iLiBBbnkgdmFsdWUgdGhhdCBpcyBOT1QgY2lwaGVydGV4dCBpcyByZWZ1c2VkXG4gICAgLy8gKGRyb3BwZWQpIHNvIHBsYWludGV4dCBwcml2YXRlIGtleXMgLyBBUEkgc2VjcmV0cyAvIG5vdGVzIGNhbiBuZXZlciBsZWF2ZVxuICAgIC8vIHRoZSBkZXZpY2UuIGAnJ2AgKGVtcHR5IC8gYnVua2VyKSBpcyBhbGxvd2VkIHRocm91Z2ggYXMgbm9uLXNlY3JldC5cbiAgICBjb25zdCBzZWNyZXRPayA9IHYgPT4gIXYgfHwgaXNDaXBoZXJ0ZXh0KHYpO1xuXG4gICAgLy8gVG9tYnN0b25lcyAoaXNzdWUgIzMpLiBBIGRvYy9rZXkgaXMgc3VwcHJlc3NlZCBmcm9tIHRoZSBwYXlsb2FkIHdoZW4gYVxuICAgIC8vIHRvbWJzdG9uZSBkYXRlZCBhdC1vci1hZnRlciBpdHMgdXBkYXRlZEF0IGV4aXN0cywgc28gYSBzdGFsZSBsb2NhbCBjb3B5XG4gICAgLy8gY2Fubm90IHJlLXB1c2ggYSBkZWxldGVkIGl0ZW0gYmFjayBpbnRvIHRoZSBtaXJyb3IuXG4gICAgY29uc3QgZGVsZXRlZERvY3MgPSAoYWxsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBhbGwuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkRG9jcyA6IHt9O1xuICAgIGNvbnN0IGRlbGV0ZWRLZXlzID0gKGFsbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZEtleXMgOiB7fTtcbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSAoYWxsLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWRQcm9maWxlcyA6IHt9O1xuXG4gICAgLy8gQSBwcm9maWxlJ3Mgc3RhYmxlIGlkZW50aXR5IGZvciB0b21ic3RvbmUgLyByZWNlbmN5IGtleWluZzogaXRzIHB1YmtleSxcbiAgICAvLyBlbHNlIChmb3IgYSBidW5rZXIpIGl0cyByZW1vdGUgcHVia2V5LiBNYXRjaGVzIG1lcmdlSW50b0xvY2FsJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBQMDogVG9tYnN0b25lcyBcdTIwMTQgdGhlIGd1YXJhbnRlZWQgc2xvdCAoZW1pdHRlZCBiZWZvcmUgYW55dGhpbmcgZWxzZSkuXG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWREb2NzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkRG9jcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWREb2NzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZEtleXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRLZXlzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZEtleXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRQcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWRQcm9maWxlcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQMTogUHJvZmlsZXMgKHN0cmlwIGBob3N0c2AgdG8gc2F2ZSBzcGFjZSkgKyBwcm9maWxlSW5kZXhcbiAgICBpZiAoYWxsLnByb2ZpbGVzKSB7XG4gICAgICAgIGNvbnN0IGNsZWFuUHJvZmlsZXMgPSByZWRhY3RQcm9maWxlcyhhbGwucHJvZmlsZXMpXG4gICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFN1cHByZXNzIGEgcHJvZmlsZSBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCksXG4gICAgICAgICAgICAgICAgLy8gc28gYSBzdGFsZSBsb2NhbCBjb3B5IGNhbm5vdCByZS1wdXNoIGEgZGVsZXRlZCBpZGVudGl0eS5cbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEoaWQgIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdICE9IG51bGwgJiYgZGVsZXRlZFByb2ZpbGVzW2lkXSA+PSAocC51cGRhdGVkQXQgfHwgMCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBob3N0cywgLi4ucmVzdCB9ID0gcDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdC5wcml2S2V5ICYmICFzZWNyZXRPayhyZXN0LnByaXZLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBwcml2S2V5IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3QucHJpdktleSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY2xlYW5Qcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5wcm9maWxlSW5kZXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsLnByb2ZpbGVJbmRleCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVJbmRleCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIC8vIE5PVEU6IGBpc0VuY3J5cHRlZGAgKHRoZSBtYXN0ZXItcGFzc3dvcmQgbG9jayBmbGFnKSBpcyBkZWxpYmVyYXRlbHkgTk9UXG4gICAgLy8gc3luY2VkLiBJdCBpcyBhIHBlci1kZXZpY2UgZmFjdCBcdTIwMTQgYSBkZXZpY2UgaG9sZHMgdGhlIHBhc3N3b3JkIHZlcmlmaWVyIG9yXG4gICAgLy8gaXQgZG9lcyBub3QgXHUyMDE0IGFuZCBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzIGRldmljZSBpbnRvIGFcbiAgICAvLyBkZWFkLWVuZCBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gUDI6IFNldHRpbmdzXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3QgayBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKGFsbFtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGFsbCkpIHtcbiAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQMzogQVBJIGtleSB2YXVsdCBcdTIwMTQgb25seSBzeW5jIGtleXMgd2hvc2Ugc2VjcmV0IGlzIGNpcGhlcnRleHQgKFQwLTUpXG4gICAgaWYgKGFsbC5hcGlLZXlWYXVsdCAmJiBhbGwuYXBpS2V5VmF1bHQua2V5cykge1xuICAgICAgICBjb25zdCBzYWZlS2V5cyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhhbGwuYXBpS2V5VmF1bHQua2V5cykpIHtcbiAgICAgICAgICAgIC8vIFN1cHByZXNzIGEga2V5IGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KS5cbiAgICAgICAgICAgIGlmIChkZWxldGVkS2V5c1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkS2V5c1tpZF0gPj0gKGtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWNyZXRPayhrZXkuc2VjcmV0KSkge1xuICAgICAgICAgICAgICAgIHNhZmVLZXlzW2lkXSA9IGtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IEFQSSBzZWNyZXQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzYWZlVmF1bHQgPSB7IC4uLmFsbC5hcGlLZXlWYXVsdCwga2V5czogc2FmZUtleXMgfTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHNhZmVWYXVsdCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2FwaUtleVZhdWx0JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAzX0FQSUtFWVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFA0OiBWYXVsdCBkb2NzIChpbmRpdmlkdWFsbHksIG5ld2VzdCBmaXJzdCkgXHUyMDE0IG9ubHkgaWYgY29udGVudCBpcyBjaXBoZXJ0ZXh0XG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIC8vIFN1cHByZXNzIGEgZG9jIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KS5cbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1tkb2MucGF0aF0gIT0gbnVsbCAmJiBkZWxldGVkRG9jc1tkb2MucGF0aF0gPj0gKGRvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc2VjcmV0T2soZG9jLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHZhdWx0IGNvbnRlbnQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBXcml0ZSBhIHByaW9yaXRpc2VkLCBwcmUtY2h1bmtlZCBwYXlsb2FkIHRvIHN0b3JhZ2Uuc3luYywgcmV0cnlpbmcgb24gYW5cbiAqIG92ZXItcXVvdGEgcmVqZWN0aW9uIGJ5IGRyb3BwaW5nIHRoZSBsb3dlc3QtcHJpb3JpdHkgdGllciBzdGlsbCBwcmVzZW50IGFuZFxuICogdHJ5aW5nIGFnYWluLiBQMCAodG9tYnN0b25lcykgYW5kIFAxIChwcm9maWxlcykgYXJlIE5FVkVSIGRyb3BwZWQgXHUyMDE0IGEgZnVsbFxuICogYmF0Y2ggZmFpbHVyZSB3b3VsZCBzdHJhbmQgYSBkZWxldGlvbiBvciBhIGtleSwgc28gdGhlIGltcG9ydGFudCB0aWVycyBzeW5jXG4gKiBldmVuIHdoZW4gdGhlIGJ1bGt5IG9uZXMgY2Fubm90LlxuICpcbiAqIEBwYXJhbSB7eyBwcmlvcml0eTogbnVtYmVyLCBjaHVua3M6IHtrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmd9W10gfVtdfSBpbmNsdWRlZFxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPn0gbnVtYmVyIG9mIGRhdGEga2V5cyBhY3R1YWxseSB3cml0dGVuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpIHtcbiAgICBsZXQgdGllcnMgPSBpbmNsdWRlZC5zbGljZSgpO1xuICAgIC8vIEd1YXJkIGFnYWluc3QgYW4gdW5ib3VuZGVkIGxvb3A6IGF0IG1vc3Qgb25lIHJldHJ5IHBlciBkaXN0aW5jdCBwcmlvcml0eS5cbiAgICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgOyBhdHRlbXB0KyspIHtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRpZXJzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgaXRlbS5jaHVua3MpIHtcbiAgICAgICAgICAgICAgICBzeW5jUGF5bG9hZFtjLmtleV0gPSBjLnZhbHVlO1xuICAgICAgICAgICAgICAgIGFsbFN5bmNLZXlzLnB1c2goYy5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkoeyBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLCBrZXlzOiBhbGxTeW5jS2V5cyB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQoc3luY1BheWxvYWQpO1xuXG4gICAgICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3luYyBrZXkgbm90IGluIG91ciBwYXlsb2FkLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICAgICAgayAhPT0gU1lOQ19NRVRBX0tFWSAmJiAhYWxsU3luY0tleXMuaW5jbHVkZXMoaylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5yZW1vdmUob3JwaGFuS2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gTm9uLWNyaXRpY2FsIGNsZWFudXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhbGxTeW5jS2V5cy5sZW5ndGg7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE92ZXIgcXVvdGEgKG9yIE1BWF9JVEVNUykgXHUyMDE0IGRyb3AgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsXG4gICAgICAgICAgICAvLyBwcmVzZW50IGFuZCByZXRyeS4gTmV2ZXIgZHJvcCBQMC9QMS5cbiAgICAgICAgICAgIGNvbnN0IG1heFByaW9yaXR5ID0gdGllcnMucmVkdWNlKChtLCB0KSA9PiBNYXRoLm1heChtLCB0LnByaW9yaXR5KSwgLTEpO1xuICAgICAgICAgICAgaWYgKG1heFByaW9yaXR5IDw9IFBSSU9SSVRZLlAxX1BST0ZJTEVTKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTsgLy8gbm90aGluZyBkcm9wcGFibGUgbGVmdDsgUDAvUDEgbXVzdCBzdXJ2aXZlIG9yIGZhaWwgbG91ZGx5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBiZWZvcmUgPSB0aWVycy5sZW5ndGg7XG4gICAgICAgICAgICB0aWVycyA9IHRpZXJzLmZpbHRlcih0ID0+IHQucHJpb3JpdHkgPCBtYXhQcmlvcml0eSk7XG4gICAgICAgICAgICBpZiAodGllcnMubGVuZ3RoID09PSBiZWZvcmUpIHRocm93IGU7IC8vIG5vIHByb2dyZXNzIFx1MjAxNCBiYWlsXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gc3luYy5zZXQgb3ZlciBxdW90YSBcdTIwMTQgZHJvcHBlZCBwcmlvcml0eSAke21heFByaW9yaXR5fSB0aWVyLCByZXRyeWluZ2ApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBQdWxsLW1lcmdlIEJFRk9SRSBidWlsZGluZzogb3JwaGFuLWNsZWFudXAgYmVsb3cgd2lwZXMgYW55IG1pcnJvciBrZXlcbiAgICAgICAgLy8gYWJzZW50IGZyb20gdGhpcyBkZXZpY2UncyBwYXlsb2FkLCBzbyB3ZSBtdXN0IGZpcnN0IGFic29yYiByZW1vdGVcbiAgICAgICAgLy8gc3RhdGUgKGVzcGVjaWFsbHkgcmVtb3RlIHRvbWJzdG9uZXMsIHdoaWNoIHRoZW4gc3VwcHJlc3MgdGhlIG1hdGNoaW5nXG4gICAgICAgIC8vIGRvY3Mva2V5cyBmcm9tIHRoZSBwYXlsb2FkIHdlIGFyZSBhYm91dCB0byBidWlsZCkuIFdpdGhvdXQgdGhpcyBhXG4gICAgICAgIC8vIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgb2YgYSBkZWxldGlvbiB3b3VsZCByZS1wdXNoIHRoZSBpdGVtLlxuICAgICAgICBjb25zdCByZW1vdGUgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHJlbW90ZSkgYXdhaXQgbWVyZ2VJbnRvTG9jYWwocmVtb3RlKTtcblxuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgaW5jbHVkZWQgc2V0IHJlc3BlY3RpbmcgdGhlIGluLWNvZGUgYnl0ZS9pdGVtIGJ1ZGdldC5cbiAgICAgICAgbGV0IHVzZWRCeXRlcyA9IDA7XG4gICAgICAgIGxldCB1c2VkSXRlbXMgPSAwO1xuICAgICAgICBjb25zdCBpbmNsdWRlZCA9IFtdO1xuICAgICAgICBsZXQgYnVkZ2V0RXhoYXVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoYnVkZ2V0RXhoYXVzdGVkKSBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtWYWx1ZShlbnRyeS5rZXksIGVudHJ5Lmpzb25TdHJpbmcpO1xuICAgICAgICAgICAgbGV0IGVudHJ5U2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgZW50cnlTaXplICs9IGMua2V5Lmxlbmd0aCArICh0eXBlb2YgYy52YWx1ZSA9PT0gJ3N0cmluZycgPyBjLnZhbHVlLmxlbmd0aCA6IEpTT04uc3RyaW5naWZ5KGMudmFsdWUpLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VkQnl0ZXMgKyBlbnRyeVNpemUgPiBTWU5DX1FVT1RBIC0gNTAwIHx8IHVzZWRJdGVtcyArIGNodW5rcy5sZW5ndGggPiBNQVhfSVRFTVMgLSA1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LnByaW9yaXR5IDw9IFBSSU9SSVRZLlAzX0FQSUtFWVMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JpdGljYWwgZGF0YSAoaW5jbC4gUDAgdG9tYnN0b25lcykgXHUyMDE0IGluY2x1ZGUgYW55d2F5OyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gcnVudGltZSBxdW90YSBmYWxsYmFjayB3aWxsIHNoZWQgYnVsa3kgdGllcnMgaWYgdGhlIEFQSSByZWplY3RzLlxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBCdWRnZXQgZXhoYXVzdGVkIGF0IHByaW9yaXR5ICR7ZW50cnkucHJpb3JpdHl9LCBza2lwcGluZyByZW1haW5pbmcgZW50cmllc2ApO1xuICAgICAgICAgICAgICAgICAgICBidWRnZXRFeGhhdXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluY2x1ZGVkLnB1c2goeyBwcmlvcml0eTogZW50cnkucHJpb3JpdHksIGNodW5rcyB9KTtcbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdyaXR0ZW4gPSBhd2FpdCBzZXRTeW5jUmVzcGVjdGluZ1F1b3RhKGluY2x1ZGVkKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7d3JpdHRlbn0gZW50cmllcyAoJHt1c2VkQnl0ZXN9IGJ5dGVzKSB0byBzeW5jIHN0b3JhZ2VgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVzaFRvU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgLy8gTG9jYWwgc3RvcmFnZSBpcyB1bmFmZmVjdGVkIFx1MjAxNCBncmFjZWZ1bCBkZWdyYWRhdGlvblxuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdWxsIGZyb20gc3luY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgZGF0YSBmcm9tIHN5bmMgc3RvcmFnZSBhbmQgcmV0dXJuIGFzIGEgcGxhaW4gb2JqZWN0IHdpdGhcbiAqIHJlYXNzZW1ibGVkIGNodW5rZWQgdmFsdWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVsbEZyb21TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgaWYgKCFyYXcgfHwgT2JqZWN0LmtleXMocmF3KS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGFTdHIgPSByYXdbU1lOQ19NRVRBX0tFWV07XG4gICAgICAgIGlmICghbWV0YVN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG1ldGE7XG4gICAgICAgIHRyeSB7IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFTdHIpOyB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgLy8gQ29sbGVjdCB0aGUgbm9uLWNodW5rLCBub24tbWV0YSBrZXlzXG4gICAgICAgIGNvbnN0IGRhdGFLZXlzID0gbWV0YS5rZXlzLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoQ0hVTktfUFJFRklYKSAmJiBrICE9PSBTWU5DX01FVEFfS0VZKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgcmF3KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5fc3luY01ldGEgPSBtZXRhO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdWxsRnJvbVN5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXJnZSBsb2dpY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFRoZSBiYWNrZ3JvdW5kJ3Mgb3duIHdheSB0byBoZWFyIG9mIG1vdmVkIHByb2ZpbGVzLiBBIHdvcmtlciBjYW5ub3QgbWVzc2FnZVxuLy8gaXRzZWxmLCBzbyBhIG1lcmdlIHJ1bm5pbmcgdGhlcmUgY2FsbHMgdGhpczsgYSBwYWdlIHNlbmRzIGEgbWVzc2FnZS5cbmxldCBwcm9maWxlTW92ZUhhbmRsZXIgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvZmlsZU1vdmVIYW5kbGVyKGhhbmRsZXIpIHtcbiAgICBwcm9maWxlTW92ZUhhbmRsZXIgPSBoYW5kbGVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhbm5vdW5jZVByb2ZpbGVNb3Zlcyhtb3Zlcykge1xuICAgIGlmIChwcm9maWxlTW92ZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvZmlsZU1vdmVIYW5kbGVyKG1vdmVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdwcm9maWxlc01vdmVkJywgcGF5bG9hZDogbW92ZXMgfSk7XG4gICAgfSBjYXRjaCB7IC8qIGJhY2tncm91bmQgdW5hdmFpbGFibGU6IHdoYXQgaXMga2V5ZWQgYnkgaW5kZXggY2hlY2tzIGl0cyBpZGVudGl0eSAqLyB9XG59XG5cbi8qKlxuICogV2hlcmUgZWFjaCBwcm9maWxlIHdlbnQuIEFuIHVudG91Y2hlZCByZWNvcmQgaXMgZm91bmQgYXMgaXRzZWxmLCBhbmQgb25lIHN5bmNcbiAqIHJlcGxhY2VkIGlzIGZvdW5kIGJ5IGlkZW50aXR5LiBFYWNoIHBsYWNlIGlzIGNsYWltZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdFtdfSBiZWZvcmVcbiAqIEBwYXJhbSB7b2JqZWN0W119IGFmdGVyXG4gKiBAcGFyYW0geyhwcm9maWxlOiBvYmplY3QpID0+ID9zdHJpbmd9IGlkZW50aXR5T2ZcbiAqIEByZXR1cm5zIHtBcnJheTxbbnVtYmVyLCA/bnVtYmVyXT59IFtvbGQgaW5kZXgsIG5ldyBpbmRleCBvciBudWxsIGlmIGdvbmVdLCBjaGFuZ2VzIG9ubHlcbiAqL1xuZnVuY3Rpb24gcHJvZmlsZU1vdmVzKGJlZm9yZSwgYWZ0ZXIsIGlkZW50aXR5T2YpIHtcbiAgICBjb25zdCBwbGFjZXMgPSBiZWZvcmUubWFwKHByb2ZpbGUgPT4gYWZ0ZXIuaW5kZXhPZihwcm9maWxlKSk7XG4gICAgY29uc3QgY2xhaW1lZCA9IG5ldyBTZXQocGxhY2VzKTtcbiAgICBiZWZvcmUuZm9yRWFjaCgocHJvZmlsZSwgaSkgPT4ge1xuICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocHJvZmlsZSk7XG4gICAgICAgIGlmIChwbGFjZXNbaV0gPj0gMCB8fCAhaWQpIHJldHVybjtcbiAgICAgICAgcGxhY2VzW2ldID0gYWZ0ZXIuZmluZEluZGV4KChvdGhlciwgaikgPT4gIWNsYWltZWQuaGFzKGopICYmIGlkZW50aXR5T2Yob3RoZXIpID09PSBpZCk7XG4gICAgICAgIGNsYWltZWQuYWRkKHBsYWNlc1tpXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBsYWNlcy5mbGF0TWFwKChwbGFjZSwgaSkgPT4gKHBsYWNlID09PSBpID8gW10gOiBbW2ksIHBsYWNlIDwgMCA/IG51bGwgOiBwbGFjZV1dKSk7XG59XG5cbi8qKlxuICogTWVyZ2Ugc3luYyBkYXRhIGludG8gbG9jYWwgc3RvcmFnZSB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb24uXG4gKlxuICogQ09ORElUSU9OIDMgKGlzc3VlICMzIGxvb3AgaW52YXJpYW50KTogZXZlcnkgd3JpdGUgaGVyZSBnb2VzIHRocm91Z2ggdGhlIHJhd1xuICogbW9kdWxlLWxldmVsIGBzdG9yYWdlYCAoPSBhcGkuc3RvcmFnZS5sb2NhbCkgdmlhIGEgc2luZ2xlIGBzdG9yYWdlLnNldGAuIEl0XG4gKiBNVVNUIE5PVCBjYWxsIHRoZSBzdG9yZS1sYXllciBoZWxwZXJzIChkZWxldGVEb2N1bWVudExvY2FsIC8gc2F2ZURvY3VtZW50TG9jYWxcbiAqIC8gZGVsZXRlQXBpS2V5IC8gc2F2ZUFwaUtleSksIGJlY2F1c2UgdGhvc2UgY2FsbCBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMDE0IGEgbWVyZ2VcbiAqIHRoYXQgc2NoZWR1bGVkIGEgcHVzaCB3b3VsZCB0dXJuIGV2ZXJ5IGluY29taW5nIHN5bmMgaW50byBhbiBvdXRnb2luZyBvbmUgYW5kXG4gKiBsb29wLiBBIHJlZ3Jlc3Npb24gdGVzdCBhc3NlcnRzIG1lcmdlSW50b0xvY2FsIG5ldmVyIHNjaGVkdWxlcyBhIHB1c2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgc3luY0RhdGEgPSB7IC4uLnN5bmNEYXRhLCBwcm9maWxlczogcmVkYWN0UHJvZmlsZXMoc3luY0RhdGEucHJvZmlsZXMpIH07XG4gICAgfVxuXG4gICAgY29uc3QgbG9jYWwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIC8vIERldGVjdCBmcmVzaCBpbnN0YWxsOiBubyBwcm9maWxlcywgb3IgYSBzaW5nbGUgdW50b3VjaGVkIGRlZmF1bHQgcHJvZmlsZS5cbiAgICAvLyAoRGVmYXVsdCBrZXlzIGFyZSBub3cgd3JhcHBlZCBhdCByZXN0LCBzbyBgcHJpdktleWAgaXMgdHJ1dGh5IGV2ZW4gb24gYVxuICAgIC8vIGZyZXNoIGluc3RhbGwgXHUyMDE0IGRldGVjdCB0aGUgdW50b3VjaGVkIGRlZmF1bHQgYnkgaXRzIG5hbWUgKyBhYnNlbmNlIG9mIGFueVxuICAgIC8vIHBlci1zaXRlIGdyYW50cyBpbnN0ZWFkLilcbiAgICAvL1xuICAgIC8vIEMxOiBhIGxvbmUgcHJvZmlsZSBpcyBvbmx5IFwidW50b3VjaGVkL2ZyZXNoXCIgd2hlbiBpdCBjYXJyaWVzIG5vIGlkZW50aXR5LlxuICAgIC8vIEEgbG9uZSBCVU5LRVIgcHJvZmlsZSBoYXMgcHJpdktleTonJyBidXQgSVMgYSByZWFsIGlkZW50aXR5ICh0eXBlL2J1bmtlclVybFxuICAgIC8vIC9yZW1vdGVQdWJrZXkpLCBhbmQgbXVzdCBub3QgYmUgdHJlYXRlZCBhcyBmcmVzaCBhbmQgd2lwZWQgYnkgYSBzeW5jIHB1bGwuXG4gICAgY29uc3QgaGFzSWRlbnRpdHkgPSAocCkgPT4gISEocCAmJiAoXG4gICAgICAgIHAucHJpdktleSB8fCBwLnB1YktleSB8fCBwLnR5cGUgPT09ICdidW5rZXInIHx8IHAuYnVua2VyVXJsIHx8IHAucmVtb3RlUHVia2V5XG4gICAgKSk7XG4gICAgY29uc3QgbG9uZSA9IGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMSA/IGxvY2FsLnByb2ZpbGVzWzBdIDogbnVsbDtcbiAgICBjb25zdCBpc0ZyZXNoID0gIWxvY2FsLnByb2ZpbGVzIHx8XG4gICAgICAgIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAobG9uZSAmJiAhbG9uZS5wcml2S2V5ICYmICFoYXNJZGVudGl0eShsb25lKSkgfHxcbiAgICAgICAgKGxvbmUgJiYgbG9uZS5uYW1lID09PSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJyAmJlxuICAgICAgICAgICAgT2JqZWN0LmtleXMobG9uZS5ob3N0cyB8fCB7fSkubGVuZ3RoID09PSAwKTtcblxuICAgIC8vIFN0YWJsZSBpZGVudGl0eSBmb3IgcHJvZmlsZSBtYXRjaGluZyAvIHRvbWJzdG9uZXM6IHB1YktleSwgZWxzZSB0aGVcbiAgICAvLyBidW5rZXIncyByZW1vdGVQdWJrZXkuIE1hdGNoZXMgYnVpbGRTeW5jUGF5bG9hZCdzIGlkZW50aXR5T2YuXG4gICAgY29uc3QgaWRlbnRpdHlPZiA9IChwKSA9PiAocCAmJiAocC5wdWJLZXkgfHwgcC5yZW1vdGVQdWJrZXkpKSB8fCBudWxsO1xuXG4gICAgLy8gQ2FwdHVyZSB0aGUgQUNUSVZFIGlkZW50aXR5IEJFRk9SRSBhbnkgcmVvcmRlcmluZy9yZW1vdmFsIHNvIHRoZSBhY3RpdmVcbiAgICAvLyBpbmRleCBjYW4gZm9sbG93IHRoYXQgaWRlbnRpdHkgdGhyb3VnaCB0aGUgbWVyZ2UgKGEga2V5IG1hbmFnZXIgbXVzdCBub3RcbiAgICAvLyBzaWxlbnRseSBzd2l0Y2ggd2hpY2ggaWRlbnRpdHkgaXMgYWN0aXZlIGp1c3QgYmVjYXVzZSBhIHByb2ZpbGUgb3JkZXJlZFxuICAgIC8vIGJlZm9yZSBpdCB3YXMgcmVtb3ZlZCBvbiBhbm90aGVyIGRldmljZSkuXG4gICAgY29uc3QgbG9jYWxBY3RpdmVJbmRleCA9IChsb2NhbC5wcm9maWxlSW5kZXggIT0gbnVsbCkgPyBsb2NhbC5wcm9maWxlSW5kZXggOiAwO1xuICAgIGNvbnN0IGFjdGl2ZUlkID0gKGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzW2xvY2FsQWN0aXZlSW5kZXhdKVxuICAgICAgICA/IGlkZW50aXR5T2YobG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgIDogbnVsbDtcblxuICAgIC8vIC0tLSBQcm9maWxlIHRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBwZXIgaWRlbnRpdHkgLS0tXG4gICAgY29uc3QgZGVsZXRlZFByb2ZpbGVzID0geyAuLi4obG9jYWwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZFByb2ZpbGVzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkUHJvZmlsZXNbaWRdID09IG51bGwgfHwgdHMgPiBkZWxldGVkUHJvZmlsZXNbaWRdKSBkZWxldGVkUHJvZmlsZXNbaWRdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSBcdTIwMTQgcHVia2V5LWtleWVkIG1lcmdlICsgdG9tYnN0b25lIHJlbW92YWwgLS0tXG4gICAgLy8gTWF0Y2ggYnkgc3RhYmxlIGlkZW50aXR5IHJhdGhlciB0aGFuIGFycmF5IGluZGV4LCBzbyBhIHJlb3JkZXJlZCBvciBwYXJ0aWFsXG4gICAgLy8gc3luYyBwYXlsb2FkIGNhbm5vdCBvdmVyd3JpdGUgb25lIGlkZW50aXR5J3Mga2V5IG1hdGVyaWFsIHdpdGggYW5vdGhlcidzLlxuICAgIGxldCBtZXJnZWRQcm9maWxlcyA9IGxvY2FsLnByb2ZpbGVzID8gWy4uLmxvY2FsLnByb2ZpbGVzXSA6IG51bGw7XG4gICAgbGV0IHByb2ZpbGVzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBpZiAoaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggaW5zdGFsbCBcdTIwMTQgYWRvcHQgc3luYyBwcm9maWxlcyBlbnRpcmVseVxuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcy5zbGljZSgpO1xuICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5wcm9maWxlcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXhCeUlkZW50aXR5ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgIWluZGV4QnlJZGVudGl0eS5oYXMoaWQpKSBpbmRleEJ5SWRlbnRpdHkuc2V0KGlkLCBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzeW5jUHJvZmlsZSBvZiBzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlkICYmIGluZGV4QnlJZGVudGl0eS5oYXMoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBpbmRleEJ5SWRlbnRpdHkuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkUHJvZmlsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc3luY1Byb2ZpbGUudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN5bmMgaXMgbmV3ZXIgXHUyMDE0IGFkb3B0IGl0IGJ1dCBwcmVzZXJ2ZSBsb2NhbCBwZXItc2l0ZSBob3N0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXNbaV0gPSB7IC4uLnN5bmNQcm9maWxlLCBob3N0czogbG9jYWxQcm9maWxlLmhvc3RzIHx8IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGdlbnVpbmVseSBuZXcgaWRlbnRpdHkgbm90IHByZXNlbnQgbG9jYWxseSBcdTIwMTQgYXBwZW5kIGl0LlxuICAgICAgICAgICAgICAgICAgICBpbmRleEJ5SWRlbnRpdHkuc2V0KGlkLCBtZXJnZWRQcm9maWxlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5wdXNoKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQSBrZXlsZXNzIHJlbW90ZSBwcm9maWxlIGNhbm5vdCBiZSByZWNvbmNpbGVkIHRvIGEgbG9jYWwgb25lXG4gICAgICAgICAgICAgICAgLy8gc2FmZWx5IChubyBpZGVudGl0eSB0byBtYXRjaCBvbiksIHNvIGl0IGlzIHNraXBwZWQuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBseSBwcm9maWxlIHRvbWJzdG9uZXM6IHJlbW92ZSBhbnkgbWVyZ2VkIHByb2ZpbGUgd2hvc2UgaWRlbnRpdHkgaGFzXG4gICAgLy8gKHVwZGF0ZWRBdCA8PSBkZWxldGVkQXQpIFx1MjAxNCBkZWxldGlvbiB3aW5zIHRpZXMsIGNvbnNpc3RlbnQgd2l0aCBkb2NzL2tleXMuXG4gICAgLy8gQSByZWNyZWF0ZWQgcHJvZmlsZSAodXBkYXRlZEF0ID4gZGVsZXRlZEF0KSBzdXJ2aXZlcy4gTmV2ZXIgcHJ1bmUgdG9tYnN0b25lcy5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgT2JqZWN0LmtleXMoZGVsZXRlZFByb2ZpbGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGtlcHQgPSBtZXJnZWRQcm9maWxlcy5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGlkICE9IG51bGwgPyBkZWxldGVkUHJvZmlsZXNbaWRdIDogbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAhKHRzICE9IG51bGwgJiYgKHAudXBkYXRlZEF0IHx8IDApIDw9IHRzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNhZmV0eTogbmV2ZXIgbGV0IGEgc3luYyBtZXJnZSBsZWF2ZSBaRVJPIHByb2ZpbGVzICh0aGF0IHdvdWxkIG9ycGhhblxuICAgICAgICAvLyB0aGUgYWN0aXZlIGluZGV4IGFuZCBicmljayB0aGUgVUkpLiBJZiByZW1vdmFsIHdvdWxkIGVtcHR5IHRoZSBsaXN0LFxuICAgICAgICAvLyBrZWVwIHRoZSBwcm9maWxlcyBhcy1pcyBcdTIwMTQgdGhlIGxvY2FsIHVzZXIgY2FuIHN0aWxsIGRlbGV0ZSBkZWxpYmVyYXRlbHkuXG4gICAgICAgIC8vIERlbGliZXJhdGUgdHJhZGUtb2ZmOiBjcm9zcy1kZXZpY2UgZGVsZXRpb24gZG9lcyBOT1QgY29udmVyZ2Ugb24gYVxuICAgICAgICAvLyBkZXZpY2Ugd2hlcmUgYXBwbHlpbmcgaXQgd291bGQgbGVhdmUgemVybyBwcm9maWxlczsgdGhlIHByb2ZpbGUgc3RheXNcbiAgICAgICAgLy8gdG9tYnN0b25lLXN1cHByZXNzZWQgb24gZW1pdCwgc28gaXQgZG9lcyBub3QgcmUtcHJvcGFnYXRlIHRvIG90aGVycy5cbiAgICAgICAgaWYgKGtlcHQubGVuZ3RoICE9PSBtZXJnZWRQcm9maWxlcy5sZW5ndGggJiYga2VwdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IGtlcHQ7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IG1vdmVzID0gW107XG4gICAgaWYgKHByb2ZpbGVzQ2hhbmdlZCAmJiBtZXJnZWRQcm9maWxlcykge1xuICAgICAgICB1cGRhdGVzLnByb2ZpbGVzID0gbWVyZ2VkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3ZlcyA9IHByb2ZpbGVNb3Zlcyhsb2NhbC5wcm9maWxlcyB8fCBbXSwgbWVyZ2VkUHJvZmlsZXMsIGlkZW50aXR5T2YpO1xuICAgICAgICBpZiAobW92ZXMubGVuZ3RoID4gMCAmJiBsb2NhbC5idW5rZXJTZXNzaW9ucykge1xuICAgICAgICAgICAgdXBkYXRlcy5idW5rZXJTZXNzaW9ucyA9IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3Zlcyhsb2NhbC5idW5rZXJTZXNzaW9ucywgbW92ZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGUgaW5kZXggKFAxKSBcdTIwMTQgRk9MTE9XIFRIRSBBQ1RJVkUgSURFTlRJVFkgYWNyb3NzIHRoZSBtZXJnZSAtLS1cbiAgICAvLyBUaGUgYWN0aXZlIGluZGV4IHRyYWNrcyB0aGUgYWN0aXZlIGlkZW50aXR5LCBub3QgYSByYXcgc2xvdDogaWYgYSBwcm9maWxlXG4gICAgLy8gb3JkZXJlZCBiZWZvcmUgdGhlIGFjdGl2ZSBvbmUgaXMgcmVtb3ZlZCBvbiBhbm90aGVyIGRldmljZSwgdGhlIGluZGV4XG4gICAgLy8gc2hpZnRzIHNvIHRoZSBTQU1FIGlkZW50aXR5IHN0YXlzIGFjdGl2ZS4gVGhlIGluZGV4IG9ubHkgbW92ZXMgdG8gYVxuICAgIC8vIGRpZmZlcmVudCBpZGVudGl0eSB3aGVuIHRoZSBhY3RpdmUgb25lIGlzIGl0c2VsZiBnb25lICh0b21ic3RvbmVkKSwgb3Igb24gYVxuICAgIC8vIGZyZXNoIGFkb3B0IFx1MjAxNCB0aGVuIGl0IGZhbGxzIGJhY2sgdG8gdGhlIHNhZmUgY2xhbXAuXG4gICAgaWYgKG1lcmdlZFByb2ZpbGVzICYmIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGRlc2lyZWRJbmRleDtcbiAgICAgICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzICYmIGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGFkb3B0IFx1MjAxNCB0YWtlIHN5bmMncyBhY3RpdmUgaW5kZXgsIGNsYW1wZWQgaW50byByYW5nZS5cbiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSBzeW5jRGF0YS5wcm9maWxlSW5kZXggIT0gbnVsbCA/IHN5bmNEYXRhLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgICAgICAgICBkZXNpcmVkSW5kZXggPSBNYXRoLm1pbihNYXRoLm1heChiYXNlLCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmb2xsb3dlZCA9IGFjdGl2ZUlkICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IG1lcmdlZFByb2ZpbGVzLmZpbmRJbmRleChwID0+IGlkZW50aXR5T2YocCkgPT09IGFjdGl2ZUlkKVxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgICAgICBkZXNpcmVkSW5kZXggPSBmb2xsb3dlZCA+PSAwXG4gICAgICAgICAgICAgICAgPyBmb2xsb3dlZFxuICAgICAgICAgICAgICAgIDogTWF0aC5taW4oTWF0aC5tYXgobG9jYWxBY3RpdmVJbmRleCwgMCksIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZXNpcmVkSW5kZXggIT09IGxvY2FsLnByb2ZpbGVJbmRleCkge1xuICAgICAgICAgICAgdXBkYXRlcy5wcm9maWxlSW5kZXggPSBkZXNpcmVkSW5kZXg7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBFbmNyeXB0aW9uIHN0YXRlIChQMSkgLS0tXG4gICAgLy8gQTI6IGBpc0VuY3J5cHRlZGAgaXMgTk9UIG1lcmdlZC4gVGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGlzIGEgcGVyLWRldmljZVxuICAgIC8vIGZhY3QgcHJvdmVuIGJ5IHRoZSBsb2NhbCB2ZXJpZmllcjsgbWlycm9yaW5nIGl0IG9uY2UgbGF0Y2hlZCBhIHBhc3N3b3JkbGVzc1xuICAgIC8vIGRldmljZSBpbnRvIGEgbG9jayBzY3JlZW4gaXQgaGFkIG5vIHBhc3N3b3JkIGZvci4gU2VlIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKS5cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBhIG51bWVyaWNhbGx5LWhpZ2hlciBvbmUgKCcxLjEwLjAnID4gJzEuOS4wJykuXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAndmVyc2lvbicgJiYgbG9jYWwudmVyc2lvbiAmJiBjb21wYXJlU2VtdmVyKHN5bmNEYXRhLnZlcnNpb24sIGxvY2FsLnZlcnNpb24pIDw9IDApIGNvbnRpbnVlO1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdmZWF0dXJlOicpICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBUb21ic3RvbmVzIChpc3N1ZSAjMykgXHUyMDE0IHVuaW9uIGxvY2FsICsgcmVtb3RlLCBtYXggZGVsZXRlZEF0IHBlciBrZXkgLS0tXG4gICAgY29uc3QgZGVsZXRlZERvY3MgPSB7IC4uLihsb2NhbC5kZWxldGVkRG9jcyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZERvY3MgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtwYXRoLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZERvY3MpKSB7XG4gICAgICAgICAgICBpZiAoZGVsZXRlZERvY3NbcGF0aF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWREb2NzW3BhdGhdKSBkZWxldGVkRG9jc1twYXRoXSA9IHRzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRlbGV0ZWRLZXlzID0geyAuLi4obG9jYWwuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGxvY2FsLmRlbGV0ZWRLZXlzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkS2V5cykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkS2V5c1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRLZXlzW2lkXSkgZGVsZXRlZEtleXNbaWRdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gQVBJIEtleSBWYXVsdCAoUDMpIC0tLVxuICAgIC8vIEJ1aWxkIHRoZSBtZXJnZWQga2V5IHNldCwgZm9sZCBpbiBhbnkgcmVtb3RlIGtleXMsIHRoZW4gYXBwbHkga2V5XG4gICAgLy8gdG9tYnN0b25lcy4gUnVucyBldmVuIHdoZW4gdGhlIHB1bGwgY2FycmllcyBOTyBhcGlLZXlWYXVsdCwgc28gYVxuICAgIC8vIGRlbGV0ZS1vbmx5IHB1bGwgY2FuIHN0aWxsIHJlbW92ZSBhIGxvY2FsbHktaGVsZCBrZXkuXG4gICAge1xuICAgICAgICBsZXQgYmFzZVZhdWx0ID0gbG9jYWwuYXBpS2V5VmF1bHQgfHwgbnVsbDtcbiAgICAgICAgbGV0IG1lcmdlZEtleXMgPSB7IC4uLigobG9jYWwuYXBpS2V5VmF1bHQgJiYgbG9jYWwuYXBpS2V5VmF1bHQua2V5cykgfHwge30pIH07XG4gICAgICAgIGxldCBhcGlDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGlmICgoIWxvY2FsLmFwaUtleVZhdWx0IHx8IGlzRnJlc2gpICYmIHN5bmNEYXRhLmFwaUtleVZhdWx0KSB7XG4gICAgICAgICAgICBiYXNlVmF1bHQgPSBzeW5jRGF0YS5hcGlLZXlWYXVsdDtcbiAgICAgICAgICAgIG1lcmdlZEtleXMgPSB7IC4uLihzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9KSB9O1xuICAgICAgICAgICAgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHN5bmNLZXlzID0gc3luY0RhdGEuYXBpS2V5VmF1bHQua2V5cyB8fCB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBzeW5jS2V5XSBvZiBPYmplY3QuZW50cmllcyhzeW5jS2V5cykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbEtleSA9IG1lcmdlZEtleXNbaWRdO1xuICAgICAgICAgICAgICAgIGlmICghbG9jYWxLZXkgfHwgKHN5bmNLZXkudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsS2V5LnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRLZXlzW2lkXSA9IHN5bmNLZXk7XG4gICAgICAgICAgICAgICAgICAgIGFwaUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBcHBseSB0b21ic3RvbmVzLiBEZWxldGlvbiB3aW5zIHRpZXMgKGA8PWApLCBjb25zaXN0ZW50IHdpdGggdGhlXG4gICAgICAgIC8vIGVtaXQtc2lkZSBzdXBwcmVzc2lvbiAoYGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXRgKTogYSBrZXkgd2hvc2VcbiAgICAgICAgLy8gdXBkYXRlZEF0IGVxdWFscyB0aGUgdG9tYnN0b25lIHdhcyBkZWxldGVkIGluIHRoYXQgc2FtZSBzZWNvbmQsIHNvIGl0XG4gICAgICAgIC8vIG11c3QgTk9UIGJlIHJlLWFkZGVkIGZyb20gdGhlIG1pcnJvciBvbiB0aGUgZGVsZXRpbmcgZGV2aWNlLiBUaGVcbiAgICAgICAgLy8gdG9tYnN0b25lIGlzIE5FVkVSIHBydW5lZCBoZXJlIFx1MjAxNCBwcnVuaW5nIGl0IHdvdWxkIGxldCB0aGUgdmVyeSBjb3B5IGl0XG4gICAgICAgIC8vIGp1c3QgcmVtb3ZlZCByZXN1cnJlY3Qgb24gdGhlIG5leHQgbWVyZ2UuIFRvbWJzdG9uZXMgYXJlIGNsZWFyZWQgb25seVxuICAgICAgICAvLyBhdCB0aGUgc291cmNlIChzYXZlQXBpS2V5IG9uIHNhbWUtZGV2aWNlIHJlY3JlYXRlKSBvciBieSB0aGUgdXNlci5cbiAgICAgICAgZm9yIChjb25zdCBpZCBvZiBPYmplY3Qua2V5cyhtZXJnZWRLZXlzKSkge1xuICAgICAgICAgICAgY29uc3QgdHMgPSBkZWxldGVkS2V5c1tpZF07XG4gICAgICAgICAgICBpZiAodHMgIT0gbnVsbCAmJiAobWVyZ2VkS2V5c1tpZF0udXBkYXRlZEF0IHx8IDApIDw9IHRzKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG1lcmdlZEtleXNbaWRdO1xuICAgICAgICAgICAgICAgIGFwaUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhcGlDaGFuZ2VkICYmIGJhc2VWYXVsdCkge1xuICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4uYmFzZVZhdWx0LCBrZXlzOiBtZXJnZWRLZXlzIH07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBWYXVsdCBkb2NzIChQNCkgLS0tXG4gICAgY29uc3QgbWVyZ2VkRG9jcyA9IHsgLi4uKGxvY2FsLnZhdWx0RG9jcyB8fCB7fSkgfTtcbiAgICBsZXQgZG9jc0NoYW5nZWQgPSBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKCFrZXkuc3RhcnRzV2l0aCgndmF1bHREb2M6JykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkb2MgPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIWRvYyB8fCAhZG9jLnBhdGgpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBsb2NhbERvYyA9IG1lcmdlZERvY3NbZG9jLnBhdGhdO1xuICAgICAgICBpZiAoIWxvY2FsRG9jIHx8IChkb2MudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsRG9jLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgbWVyZ2VkRG9jc1tkb2MucGF0aF0gPSBkb2M7XG4gICAgICAgICAgICBkb2NzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQXBwbHkgZG9jIHRvbWJzdG9uZXMuIERlbGV0aW9uIHdpbnMgdGllcyAoYDw9YCksIGFuZCB0b21ic3RvbmVzIGFyZSBORVZFUlxuICAgIC8vIHBydW5lZCBoZXJlIFx1MjAxNCBzYW1lIHJhdGlvbmFsZSBhcyB0aGUgQVBJIGtleXMgYWJvdmUuXG4gICAgZm9yIChjb25zdCBwYXRoIG9mIE9iamVjdC5rZXlzKG1lcmdlZERvY3MpKSB7XG4gICAgICAgIGNvbnN0IHRzID0gZGVsZXRlZERvY3NbcGF0aF07XG4gICAgICAgIGlmICh0cyAhPSBudWxsICYmIChtZXJnZWREb2NzW3BhdGhdLnVwZGF0ZWRBdCB8fCAwKSA8PSB0cykge1xuICAgICAgICAgICAgZGVsZXRlIG1lcmdlZERvY3NbcGF0aF07XG4gICAgICAgICAgICBkb2NzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRvY3NDaGFuZ2VkKSB7XG4gICAgICAgIHVwZGF0ZXMudmF1bHREb2NzID0gbWVyZ2VkRG9jcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gUGVyc2lzdCB0aGUgdG9tYnN0b25lIHNldHMuIFRoZXNlIGFyZSBhIFBVUkUgVU5JT04gKG1heCBkZWxldGVkQXQgcGVyXG4gICAgLy8ga2V5KSBcdTIwMTQgdGhlIG1lcmdlIG5ldmVyIHJlbW92ZXMgYSB0b21ic3RvbmUsIHNvIHRoZXkgYXJlIHJldGFpbmVkIGZvcmV2ZXJcbiAgICAvLyBhbmQgYW4gb2ZmbGluZSBkZXZpY2UgY2Fubm90IHJlc3VycmVjdCBhIGRlbGV0aW9uLiBUaGV5IGFyZSBjbGVhcmVkIG9ubHlcbiAgICAvLyBhdCB0aGUgc291cmNlIChzYXZlRG9jdW1lbnRMb2NhbC9zYXZlQXBpS2V5IG9uIHNhbWUtZGV2aWNlIHJlY3JlYXRlKSBvciBieVxuICAgIC8vIHRoZSB1c2VyIHZpYSBjbGVhckRlbGV0aW9uSGlzdG9yeS5cbiAgICAvL1xuICAgIC8vIFJlc2lkdWFsIChhY2NlcHRlZCwgZG9jdW1lbnRlZCk6IHB1cmUgY3Jvc3MtZGV2aWNlIGNsb2NrIHNrZXcgXHUyMDE0IGEgbGl2ZVxuICAgIC8vIGNvcHkgd2hvc2UgdXBkYXRlZEF0IGlzIGdlbnVpbmVseSBORVdFUiB0aGFuIHRoZSBkZWxldGUncyB0aW1lc3RhbXAgXHUyMDE0IHdpbnNcbiAgICAvLyB1bmRlciB0aGUgYDw9YCBydWxlIGFuZCBpcyBrZXB0LiBUaGF0IGlzIGFuIGluaGVyZW50IGxhc3Qtd3JpdGUtd2lucyBsaW1pdFxuICAgIC8vIHRoYXQgdG9tYnN0b25lcyBkbyBub3QgcmVzb2x2ZTsgXCJmaXhpbmdcIiBpdCBieSBwcnVuaW5nIHdvdWxkIHJlaW50cm9kdWNlXG4gICAgLy8gdGhlIHNhbWUtc2Vjb25kIHJlc3VycmVjdGlvbiBidWcsIHNvIGl0IGlzIGxlZnQgYXMtaXMuXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWREb2NzKSAhPT0gSlNPTi5zdHJpbmdpZnkobG9jYWwuZGVsZXRlZERvY3MgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZERvY3MgPSBkZWxldGVkRG9jcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkS2V5cykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWRLZXlzIHx8IHt9KSkge1xuICAgICAgICB1cGRhdGVzLmRlbGV0ZWRLZXlzID0gZGVsZXRlZEtleXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZFByb2ZpbGVzKSAhPT0gSlNPTi5zdHJpbmdpZnkobG9jYWwuZGVsZXRlZFByb2ZpbGVzIHx8IHt9KSkge1xuICAgICAgICB1cGRhdGVzLmRlbGV0ZWRQcm9maWxlcyA9IGRlbGV0ZWRQcm9maWxlcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgICAgLy8gUmF3IGxvY2FsIHdyaXRlIE9OTFkgXHUyMDE0IG5ldmVyIHNjaGVkdWxlU3luY1B1c2ggKGxvb3AgaW52YXJpYW50KS5cbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQodXBkYXRlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE1lcmdlZCBzeW5jIGRhdGEgaW50byBsb2NhbDonLCBPYmplY3Qua2V5cyh1cGRhdGVzKSk7XG4gICAgfVxuICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwKSBhd2FpdCBhbm5vdW5jZVByb2ZpbGVNb3Zlcyhtb3Zlcyk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVib3VuY2VkIHB1c2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNjaGVkdWxlIGEgc3luYyBwdXNoIHdpdGggYSAyLXNlY29uZCBkZWJvdW5jZS5cbiAqIEV4cG9ydGVkIGZvciB1c2UgYnkgc3RvcmVzIGFuZCB0aGUgc3RvcmFnZSBpbnRlcmNlcHRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlU3luY1B1c2goKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgaWYgKHB1c2hUaW1lcikgY2xlYXJUaW1lb3V0KHB1c2hUaW1lcik7XG4gICAgcHVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1c2hUaW1lciA9IG51bGw7XG4gICAgICAgIHB1c2hUb1N5bmMoKTtcbiAgICB9LCAyMDAwKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWxldGlvbi1oaXN0b3J5ICh0b21ic3RvbmUpIHJldGVudGlvbiBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUb3RhbCBudW1iZXIgb2YgcmV0YWluZWQgZGVsZXRpb24gcmVjb3JkcyAoZG9jcyArIGtleXMpLiBHcm93cyBvdmVyIHRoZSBsaWZlXG4gKiBvZiB0aGUgaW5zdGFsbCBiZWNhdXNlIHRvbWJzdG9uZXMgYXJlIGtlcHQgZm9yZXZlciAoYW4gb2ZmbGluZSBkZXZpY2UgdGhhdFxuICogbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIG11c3Qgbm90IGJlIGFibGUgdG8gcmVzdXJyZWN0IHRoZSBpdGVtKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRvbWJzdG9uZUNvdW50KCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGRlbGV0ZWREb2NzOiB7fSwgZGVsZXRlZEtleXM6IHt9LCBkZWxldGVkUHJvZmlsZXM6IHt9IH0pO1xuICAgIGNvbnN0IGRvY3MgPSBkYXRhLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZERvY3MgOiB7fTtcbiAgICBjb25zdCBrZXlzID0gZGF0YS5kZWxldGVkS2V5cyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRLZXlzIDoge307XG4gICAgY29uc3QgcHJvZmlsZXMgPSBkYXRhLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkUHJvZmlsZXMgOiB7fTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZG9jcykubGVuZ3RoICsgT2JqZWN0LmtleXMoa2V5cykubGVuZ3RoICsgT2JqZWN0LmtleXMocHJvZmlsZXMpLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBXYXJuaW5nIGxldmVsIGZvciBhIGdpdmVuIHJldGFpbmVkLWRlbGV0aW9uIGNvdW50OlxuICogICAwID0gZmluZSwgMSA9IGdlbnRsZSBudWRnZSAoPj0gOCksIDIgPSBzdHJvbmdlciB3YXJuaW5nICg+PSAxNikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b21ic3RvbmVXYXJuaW5nTGV2ZWwoY291bnQpIHtcbiAgICBpZiAoY291bnQgPj0gVE9NQlNUT05FX1dBUk5fU1RST05HKSByZXR1cm4gMjtcbiAgICBpZiAoY291bnQgPj0gVE9NQlNUT05FX1dBUk5fR0VOVExFKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBDbGVhciBhbGwgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeS4gSW5mb3JtZWQtdXNlciBjaG9pY2U6IGEgZGV2aWNlIHRoYXQgaGFzXG4gKiBiZWVuIG9mZmxpbmUgc2luY2UgYmVmb3JlIG9uZSBvZiB0aGVzZSBkZWxldGlvbnMgY2FuLCBvbiBpdHMgbmV4dCBzeW5jLFxuICogcmUtYWRkIHRoZSBpdGVtIFx1MjAxNCBiZWNhdXNlIHRoZSByZWNvcmQgdGhhdCB0b2xkIGV2ZXJ5b25lIGl0IHdhcyBkZWxldGVkIGlzXG4gKiBub3cgZ29uZS4gU2NoZWR1bGVzIGEgcHVzaCBzbyB0aGUgY2xlYXJlZCBzdGF0ZSBwcm9wYWdhdGVzIHRvIHRoZSBtaXJyb3IuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRlbGV0aW9uSGlzdG9yeSgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGRlbGV0ZWREb2NzOiB7fSwgZGVsZXRlZEtleXM6IHt9LCBkZWxldGVkUHJvZmlsZXM6IHt9IH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmNyeXB0aW9uLWZsYWcgc2VsZi1oZWFsIChBMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENsZWFyIGEgYm9ndXMgYGlzRW5jcnlwdGVkPXRydWVgIHdoZW4gdGhpcyBkZXZpY2UgaG9sZHMgbm8gZXZpZGVuY2Ugb2YgcmVhbFxuICogcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgbm8gcGFzc3dvcmQgdmVyaWZpZXIgKHBhc3N3b3JkSGFzaCkgQU5EIG5vIHByb2ZpbGUga2V5XG4gKiB0aGF0IGlzIGEgUEFTU1dPUkQgYmxvYi5cbiAqXG4gKiBHYXRpbmcgZGV0YWlsIChjcml0aWNhbCk6IGV2aWRlbmNlIGlzIGEgUEFTU1dPUkQgYmxvYiAoaXNQYXNzd29yZEJsb2IpLCBOT1QgYVxuICogZGV2aWNlLWtleSBibG9iLiBTaW5jZSB2MS43LjAgZXZlcnkga2V5IGlzIHdyYXBwZWQgYXQgcmVzdCBldmVuIGZvciB0aGVcbiAqIHBhc3N3b3JkbGVzcyBMZXZlbC0wIHVzZXIsIHNvIGEgbm9ybWFsIHBhc3N3b3JkbGVzcyBpbnN0YWxsIGlzIGZ1bGwgb2ZcbiAqIGRldmljZS1rZXkgY2lwaGVydGV4dDsga2V5aW5nIG9mZiB0aGF0IHdvdWxkIHdyb25nbHkga2VlcCB0aGUgZmxhZyBsYXRjaGVkLlxuICogT25seSBhIHBhc3N3b3JkLWRlcml2ZWQgYmxvYiAob3IgdGhlIHZlcmlmaWVyKSBwcm92ZXMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IHRydWUgaWYgYSBib2d1cyBmbGFnIHdhcyBjbGVhcmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UsIHBhc3N3b3JkSGFzaDogbnVsbCwgcHJvZmlsZXM6IFtdIH0pO1xuICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkgcmV0dXJuIGZhbHNlOyAgIC8vIG5vdGhpbmcgbGF0Y2hlZCBcdTIwMTQgbm90aGluZyB0byBoZWFsXG4gICAgaWYgKGRhdGEucGFzc3dvcmRIYXNoKSByZXR1cm4gZmFsc2U7ICAgLy8gcmVhbCB2ZXJpZmllciBwcmVzZW50IFx1MjAxNCBrZWVwIHRoZSBmbGFnXG5cbiAgICBjb25zdCBoYXNQYXNzd29yZEJsb2IgPSBBcnJheS5pc0FycmF5KGRhdGEucHJvZmlsZXMpICYmXG4gICAgICAgIGRhdGEucHJvZmlsZXMuc29tZShwID0+IHAgJiYgaXNQYXNzd29yZEJsb2IocC5wcml2S2V5KSk7XG4gICAgaWYgKGhhc1Bhc3N3b3JkQmxvYikgcmV0dXJuIGZhbHNlOyAgICAgLy8gcGFzc3dvcmQtZW5jcnlwdGVkIGtleSBtYXRlcmlhbCBcdTIwMTQga2VlcFxuXG4gICAgLy8gRmxhZyBpcyBib2d1cyAoZS5nLiBtaXJyb3JlZCBpbiBmcm9tIGFub3RoZXIgZGV2aWNlIHRoYXQgRElEIGhhdmUgYVxuICAgIC8vIHBhc3N3b3JkKS4gQ2xlYXIgaXQgc28gdGhpcyBkZXZpY2UgaXMgbm90IHN0cmFuZGVkIGF0IGEgZGVhZC1lbmQgdW5sb2NrLlxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIENsZWFyZWQgYm9ndXMgaXNFbmNyeXB0ZWQgZmxhZyAobm8gcGFzc3dvcmQgdmVyaWZpZXIvYmxvYiknKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmFibGUgLyBkaXNhYmxlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gZGF0YVtMT0NBTF9FTkFCTEVEX0tFWV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiBlbmFibGVkIH0pO1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVkdWNlIGV2ZXJ5IGJ1bmtlclVybCBpbiB0aGUgYHByb2ZpbGVzYCBtaXJyb3IgdG8gaXRzIGFkZHJlc3MuIFdvcmtzIG9uIHRoZVxuICogc3RvcmVkIGRhdGEgZGlyZWN0bHksIHNvIGl0IGRvZXMgbm90IGRlcGVuZCBvbiBzeW5jIGJlaW5nIGVuYWJsZWQsIGFuZCB3cml0ZXNcbiAqIG5vdGhpbmcgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGNoYW5nZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNjcnViU3luY2VkUHJvZmlsZXMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgY29uc3QgcHJvZmlsZXMgPSByYXcgPyByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKCdwcm9maWxlcycsIHJhdykgOiBudWxsO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9maWxlcykpIHJldHVybjtcbiAgICBjb25zdCBjbGVhbiA9IHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKTtcbiAgICBpZiAoY2xlYW4gPT09IHByb2ZpbGVzKSByZXR1cm47XG5cbiAgICBjb25zdCBlbnRyaWVzID0gY2h1bmtWYWx1ZSgncHJvZmlsZXMnLCBKU09OLnN0cmluZ2lmeShjbGVhbikpO1xuICAgIGNvbnN0IHBheWxvYWQgPSBPYmplY3QuZnJvbUVudHJpZXMoZW50cmllcy5tYXAoZSA9PiBbZS5rZXksIGUudmFsdWVdKSk7XG4gICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQocGF5bG9hZCk7XG4gICAgY29uc3QgdW51c2VkID0gT2JqZWN0LmtleXMocmF3KS5maWx0ZXIoayA9PlxuICAgICAgICBrLnN0YXJ0c1dpdGgoYCR7Q0hVTktfUFJFRklYfXByb2ZpbGVzOmApICYmICEoayBpbiBwYXlsb2FkKVxuICAgICk7XG4gICAgaWYgKHVudXNlZC5sZW5ndGggPiAwKSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZSh1bnVzZWQpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEluaXRpYWxpc2F0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDYWxsZWQgb25jZSBvbiBzdGFydHVwIChmcm9tIGJhY2tncm91bmQuanMpLlxuICogUHVsbHMgZnJvbSBzeW5jLCBtZXJnZXMsIHRoZW4gbGlzdGVucyBmb3IgcmVtb3RlIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0U3luYygpIHtcbiAgICAvLyBTZWxmLWhlYWwgYSBib2d1cyBlbmNyeXB0aW9uIGZsYWcgZmlyc3QgXHUyMDE0IHRoaXMgbXVzdCBydW4gZXZlbiB3aGVuIHN5bmMgaXNcbiAgICAvLyB1bmF2YWlsYWJsZSBvciBkaXNhYmxlZCwgYmVjYXVzZSB0aGUgYmFkIHN0YXRlIGl0IGZpeGVzIG1heSBoYXZlIGJlZW4gbGVmdFxuICAgIC8vIGJlaGluZCBieSBhbiBlYXJsaWVyIChub3ctcmVtb3ZlZCkgaXNFbmNyeXB0ZWQtc3luY2luZyBidWlsZC5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBzdG9yYWdlLnN5bmMgbm90IGF2YWlsYWJsZSBcdTIwMTQgc2tpcHBpbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNjcnViU3luY2VkUHJvZmlsZXMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gc2NydWJTeW5jZWRQcm9maWxlcyBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBTZWNyZXQgVmF1bHQgXHUyMDE0IGF0LXJlc3QgZW5jcnlwdGlvbiBmb3IgcHJpdmF0ZSBrZXlzIGFuZCBhcHBsaWNhdGlvbiBzZWNyZXRzLlxuICpcbiAqIFRocmVhdCBtb2RlbCAoVDAtNCk6IHJhdyBzZWNyZXQgYnl0ZXMgbXVzdCBuZXZlciBzaXQgaW4gYnJvd3NlciBzdG9yYWdlIGluXG4gKiBjbGVhcnRleHQsIGV2ZW4gZm9yIHRoZSBERUZBVUxUIHBhc3N3b3JkbGVzcyB1c2VyLiBUaGlzIG1vZHVsZSBwcm92aWRlcyB0d29cbiAqIHdyYXBwaW5nIHN0cmF0ZWdpZXMgYmVoaW5kIG9uZSBgd3JhcFNlY3JldGAgLyBgdW53cmFwU2VjcmV0YCBpbnRlcmZhY2U6XG4gKlxuICogICAxLiBERVZJQ0UgS0VZIChkZWZhdWx0LCBubyBtYXN0ZXIgcGFzc3dvcmQpIFx1MjAxNCBhIG5vbi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTVxuICogICAgICBDcnlwdG9LZXkuIFRocmVlIHBlcnNpc3RlbmNlIHN0cmF0ZWdpZXMgZXhpc3QsIGFuZCBlYWNoIGlzIFZFUklGSUVEXG4gKiAgICAgIChyZWFkIGJhY2sgYW5kIHJvdW5kLXRyaXBwZWQgdGhyb3VnaCBlbmNyeXB0L2RlY3J5cHQpIGJlZm9yZSBpdCBpc1xuICogICAgICB0cnVzdGVkOlxuICpcbiAqICAgICAgICBhLiBgaWRiYCAgICBcdTIwMTQgYSBDcnlwdG9LZXkgKmhhbmRsZSogaW4gSW5kZXhlZERCLiBPbmx5IGV2ZXIgQURPUFRFRCxcbiAqICAgICAgICAgICAgICAgICAgICAgIG5ldmVyIG1pbnRlZDogd2UgdHJ1c3QgYGlkYmAgZXhjbHVzaXZlbHkgd2hlbiBkYi5nZXQoKVxuICogICAgICAgICAgICAgICAgICAgICAgaGFuZHMgYmFjayBhIFBSRS1FWElTVElORyBrZXkgdGhhdCByb3VuZC10cmlwcywgYmVjYXVzZVxuICogICAgICAgICAgICAgICAgICAgICAgdGhhdCBcdTIwMTQgYW5kIG9ubHkgdGhhdCBcdTIwMTQgcHJvdmVzIHRoZSBoYW5kbGUgc3Vydml2ZWQgYVxuICogICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMgY29udGV4dC4gQSBzYW1lLWNvbnRleHQgcHV0XHUyMTkyZ2V0IHByb2JlIGNhbm5vdFxuICogICAgICAgICAgICAgICAgICAgICAgcHJvdmUgY3Jvc3MtY29udGV4dCBwZXJzaXN0ZW5jZS4gS2VlcGluZyB0aGUgYWRvcHQgcGF0aFxuICogICAgICAgICAgICAgICAgICAgICAgcHJlc2VydmVzIGV2ZXJ5IENocm9tZS9GaXJlZm94IHZhdWx0IHdyaXR0ZW4gYmVmb3JlXG4gKiAgICAgICAgICAgICAgICAgICAgICAxLjguMSwgd2hvc2UgYmxvYnMgbGl2ZSB1bmRlciB0aGlzIGtleS5cbiAqICAgICAgICAgICAgICAgICAgICAgICoqTkVWRVIgdXNlZCBhcyB0aGUgd3JhcHBpbmcga2V5IG9uIFNhZmFyaS4qKiBPbiBXZWJLaXRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSB0d28gc3RvcmFnZSBhcmVhcyBkbyBub3Qgc2hhcmUgYSBsaWZldGltZSB0aGUgd2F5XG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGV5IGRvIG9uIENocm9taXVtL0dlY2tvLCBzbyBhbiBhZG9wdGVkIEluZGV4ZWREQiBrZXlcbiAqICAgICAgICAgICAgICAgICAgICAgIGlzIG5vdCBhIHNhZmUgd3JhcHBpbmcga2V5IHRoZXJlLiBTYWZhcmkgdGhlcmVmb3JlIGFsd2F5c1xuICogICAgICAgICAgICAgICAgICAgICAgd3JpdGVzIHVuZGVyIGBzZWVkYCAoYnVuZGxlLXNjb3BlZCBgc3RvcmFnZS5sb2NhbGApO1xuICogICAgICAgICAgICAgICAgICAgICAgYWRvcHRlZCBJREIga2V5cyBhcmUgZGVjcnlwdC1vbmx5IGxlZ2FjeSBvbiBTYWZhcmksIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIGF0LXJlc3QgbWlncmF0aW9uIHJlLXdyYXBzIEVWRVJZIGRldmljZSBibG9iIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uIHN0b3JlcyBcdTIwMTQgcHJvZmlsZSBwcml2YXRlIGtleXMsIEFQSS1rZXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMsIHZhdWx0LW5vdGUgYm9kaWVzLCBhbmQgTklQLTQ2IGJ1bmtlciBzZXNzaW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzIC8gc2Vzc2lvbiBwcml2YXRlIGtleXMgXHUyMDE0IG5vdCBqdXN0IHByb2ZpbGUga2V5cy5cbiAqICAgICAgICAgICAgICAgICAgICAgIChQZXItZW5naW5lIHN0b3JhZ2Utc2NvcGluZyByYXRpb25hbGU6IFBSSVZBVEUgYml6ZG9jc1xuICogICAgICAgICAgICAgICAgICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKiAgICAgICAgYi4gYHNlZWRgICAgXHUyMDE0IDMyIHJhbmRvbSBieXRlcyBpbiBgYnJvd3Nlci5zdG9yYWdlLmxvY2FsYCB1bmRlclxuICogICAgICAgICAgICAgICAgICAgICAgYGRldmljZUtleVNlZWRgLCBpbXBvcnRlZCBhcyBhIG5vbi1leHRyYWN0YWJsZSBBRVMtR0NNXG4gKiAgICAgICAgICAgICAgICAgICAgICBrZXkgYXQgbG9hZC4gVGhpcyBpcyB3aGVyZSBFVkVSWSBuZXcgZGV2aWNlIGtleSBsYW5kcyxcbiAqICAgICAgICAgICAgICAgICAgICAgIG9uIGV2ZXJ5IHBsYXRmb3JtOiB3aGVuIG5vIHByZS1leGlzdGluZyBJREIga2V5IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICBmb3VuZCB3ZSBkbyBub3QgbWludCBvbmUsIHdlIHNlZWQuIENocm9tZS9GaXJlZm94IGZyZXNoXG4gKiAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxscyB0aGVyZWZvcmUgdXNlIGBzZWVkYCB0b28gXHUyMDE0IG9uZSBjb2RlIHBhdGgsIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIG9ubHkgb25lIHdob3NlIHBlcnNpc3RlbmNlIHdlIGNhbiBhY3R1YWxseSB2ZXJpZnkuXG4gKiAgICAgICAgYy4gYG1lbW9yeWAgXHUyMDE0IGxhc3QgcmVzb3J0ICh1bml0IHRlc3RzLCBzYW5kYm94ZWQgY29udGV4dHMpLiBTZWNyZXRzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVkIGhlcmUgZG8gbm90IHN1cnZpdmUgYSByZWxvYWQuXG4gKlxuICogICAgICBUaGUgcmVzb2x2ZWQgc3RyYXRlZ3kgaXMgU1RJQ0tZOiBpdCBpcyByZWNvcmRlZCBpbiBzdG9yYWdlLmxvY2FsIHVuZGVyXG4gKiAgICAgIGBkZXZpY2VLZXlTdHJhdGVneWAgYW5kIGhvbm91cmVkIG9uIGxhdGVyIGxvYWRzLCBzbyBhIGNvbnRleHQgY2Fubm90XG4gKiAgICAgIHNpbGVudGx5IGZsaXAgc3RyYXRlZ2llcyBhbmQgb3JwaGFuIHRoZSBibG9icyB3cml0dGVuIHVuZGVyIHRoZSBvbGRcbiAqICAgICAgb25lLiBEZWNyeXB0aW9uIGlzIHN5bW1ldHJpYyByZWdhcmRsZXNzOiBgZGVjcnlwdFdpdGhEZXZpY2VLZXlgIHRyaWVzXG4gKiAgICAgIHRoZSBjdXJyZW50IGtleSwgdGhlbiBldmVyeSBvdGhlciBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGV2ZXIgaGF2ZSBoYWRcbiAqICAgICAgKGxlZ2FjeSBJREIgaGFuZGxlLCBleGlzdGluZyBzZWVkKSwgYW5kIGNhbGxlcnMgdXNpbmdcbiAqICAgICAgYGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwYCByZS13cmFwIHVuZGVyIHRoZSBjdXJyZW50IHN0cmF0ZWd5LlxuICpcbiAqICAgICAgVGhyZWF0IG1vZGVsLCBob25lc3RseSBzdGF0ZWQ6IHRoZSBwYXNzd29yZGxlc3MgZGV2aWNlIHRpZXIgaXMgYXQtcmVzdFxuICogICAgICBwcm90ZWN0aW9uIGFnYWluc3QgY2FzdWFsIGluc3BlY3Rpb24gb2YgZXh0ZW5zaW9uIHN0b3JhZ2UsIE5PVCBhIGRlZmVuY2VcbiAqICAgICAgYWdhaW5zdCBjb2RlIGFscmVhZHkgZXhlY3V0aW5nIGluIHRoaXMgZXh0ZW5zaW9uJ3MgY29udGV4dC4gVGhlXG4gKiAgICAgIHN0cm9uZ2VzdCB0aWVyIGF2YWlsYWJsZSB0b2RheSBpcyBhICoqbWFzdGVyIHBhc3N3b3JkKiogKGJlbG93KSwgd2hpY2hcbiAqICAgICAgZGVyaXZlcyB0aGUgd3JhcHBpbmcga2V5IGZyb20gYSBzZWNyZXQgdGhhdCBpcyBuZXZlciBzdG9yZWQuIFVzZXJzXG4gKiAgICAgIGhvbGRpbmcgaGlnaC12YWx1ZSBrZXlzIHNob3VsZCBzZXQgb25lLiBBIGhhcmR3YXJlLWJhY2tlZCBkZXZpY2Uga2V5IGlzXG4gKiAgICAgIGZ1dHVyZSB3b3JrLiAoVGllciB0cmFkZW9mZnMgaW4gZnVsbDogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgIGBhcmNoaXRlY3R1cmUvZGV2aWNlLWtleS1zdHJhdGVneS5tZGAuKVxuICpcbiAqICAgMi4gU0VTU0lPTiBLRVkgKG1hc3RlciBwYXNzd29yZCBzZXQgKyB1bmxvY2tlZCkgXHUyMDE0IHRoZSBBRVMtMjU2LUdDTSBrZXlcbiAqICAgICAgZGVyaXZlZCBmcm9tIHRoZSBwYXNzd29yZCAoc2VlIGNyeXB0by5qcykuIFNldCBieSB0aGUgYmFja2dyb3VuZCB3b3JrZXJcbiAqICAgICAgb24gdW5sb2NrIHZpYSBgc2V0U2Vzc2lvbktleWAsIGNsZWFyZWQgb24gbG9jayB2aWEgYGNsZWFyU2Vzc2lvbmAuXG4gKlxuICogQmxvYiBmb3JtYXRzIChib3RoIGFyZSBzZWxmLWRlc2NyaWJpbmcgSlNPTiBzdHJpbmdzKTpcbiAqICAgcGFzc3dvcmQgYmxvYiA6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfVxuICogICBkZXZpY2UgIGJsb2IgOiB7IHY6MSwgazpcImRldmljZVwiLCBpdiwgY2lwaGVydGV4dCB9XG4gKlxuICogYHVud3JhcFNlY3JldGAgcmVmdXNlcyB0byBkZWNyeXB0IHdoZW4gdGhlIHNlc3Npb24gaGFzIGJlZW4gZXhwbGljaXRseSBsb2NrZWRcbiAqIChGNS9GNikgc28gYSBsb2NrZWQgcGFnZSBjYW5ub3QgcmVhZCBzZWNyZXRzLlxuICovXG5cbmltcG9ydCB7IGVuY3J5cHRXaXRoS2V5LCBkZWNyeXB0V2l0aEtleSB9IGZyb20gJy4vY3J5cHRvJztcblxuY29uc3QgSVZfQllURVMgPSAxMjtcbmNvbnN0IERFVklDRV9EQiA9ICdub3N0cmtleS1zZWNyZXQtdmF1bHQnO1xuY29uc3QgREVWSUNFX1NUT1JFID0gJ2tleXMnO1xuY29uc3QgREVWSUNFX0tFWV9JRCA9ICdkZXZpY2Utd3JhcC1rZXktdjEnO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgYmFzZTY0IHJhdyBzZWVkIGZvciB0aGUgYHNlZWRgIHN0cmF0ZWd5LlxuY29uc3QgREVWSUNFX1NFRURfS0VZID0gJ2RldmljZUtleVNlZWQnO1xuY29uc3QgREVWSUNFX1NFRURfQllURVMgPSAzMjtcbi8vIHN0b3JhZ2UubG9jYWwga2V5IGhvbGRpbmcgdGhlIFNUSUNLWSByZXNvbHZlZCBzdHJhdGVneSAoJ2lkYicgfCAnc2VlZCcpLlxuY29uc3QgREVWSUNFX1NUUkFURUdZX0tFWSA9ICdkZXZpY2VLZXlTdHJhdGVneSc7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAoa2VwdCBsb2NhbCBzbyB0aGlzIG1vZHVsZSBoYXMgbm8gY3Jvc3MtZGVwcykgLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBhYlRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5mdW5jdGlvbiBiYXNlNjRUb0FiKGI2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYjY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBTZXNzaW9uIChwYXNzd29yZC1kZXJpdmVkKSBrZXkgc3RhdGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5sZXQgX3Nlc3Npb25LZXkgPSBudWxsOyAgIC8vIENyeXB0b0tleSB8IG51bGxcbmxldCBfc2Vzc2lvblNhbHQgPSBudWxsOyAgLy8gVWludDhBcnJheSB8IG51bGxcbi8vIF91bmxvY2tlZDogbnVsbCA9IHBhc3N3b3JkbGVzcyAvIG5vdCBhcHBsaWNhYmxlIChuZXZlciBsb2NrZWQpLFxuLy8gICAgICAgICAgICB0cnVlID0gdW5sb2NrZWQsIGZhbHNlID0gbG9ja2VkIChyZWZ1c2Ugc2VjcmV0IHJlYWRzKS5cbmxldCBfdW5sb2NrZWQgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2Vzc2lvbktleShjcnlwdG9LZXksIHNhbHQpIHtcbiAgICBfc2Vzc2lvbktleSA9IGNyeXB0b0tleTtcbiAgICBfc2Vzc2lvblNhbHQgPSBzYWx0O1xuICAgIF91bmxvY2tlZCA9IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclNlc3Npb24oKSB7XG4gICAgX3Nlc3Npb25LZXkgPSBudWxsO1xuICAgIF9zZXNzaW9uU2FsdCA9IG51bGw7XG4gICAgX3VubG9ja2VkID0gZmFsc2U7XG59XG5cbi8qKiBFeHBsaWNpdGx5IG1hcmsgdGhlIHNlc3Npb24gdW5sb2NrZWQvbG9ja2VkIHdpdGhvdXQgcHJvdmlkaW5nIGEga2V5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVubG9ja2VkKHYpIHtcbiAgICBfdW5sb2NrZWQgPSB2ID09PSBudWxsID8gbnVsbCA6ICEhdjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Nlc3Npb25LZXkoKSB7XG4gICAgcmV0dXJuICEhX3Nlc3Npb25LZXk7XG59XG5cbi8vIC0tLSBEZXZpY2Uga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5sZXQgX2RldmljZUtleVByb21pc2UgPSBudWxsO1xubGV0IF9kZXZpY2VTdHJhdGVneSA9IG51bGw7ICAgLy8gJ2lkYicgfCAnc2VlZCcgfCAnbWVtb3J5JyBcdTIwMTQgc2V0IG9uY2UgcmVzb2x2ZWRcbmxldCBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDsgIC8vIGxhc3QtcmVzb3J0IGtleSBmb3IgY29udGV4dHMgdGhhdCBwZXJzaXN0IG5vdGhpbmdcbmxldCBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gdGhlIHByZS0xLjguMSBJREIga2V5XG5sZXQgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsOyAvLyByZWFkLW9ubHkgaGFuZGxlIG9uIGFuIGV4aXN0aW5nIHNlZWQga2V5XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGV2aWNlS2V5KCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZTogcmF3IGJ5dGVzIGNhbiBuZXZlciBiZSByZWFkIGJhY2sgb3V0XG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhlZERiQXZhaWxhYmxlKCkge1xuICAgIHJldHVybiB0eXBlb2YgaW5kZXhlZERCICE9PSAndW5kZWZpbmVkJyAmJiBpbmRleGVkREIgIT09IG51bGw7XG59XG5cbi8qKlxuICogUHJvdmUgYSBjYW5kaWRhdGUga2V5IGlzIGFjdHVhbGx5IHVzYWJsZSBiZWZvcmUgd2UgdHJ1c3QgYSBzdHJhdGVneSB3aXRoIGFcbiAqIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gQSByZWFkLWJhY2sgaGFuZGxlIHRoYXQgc3RydWN0dXJlZC1jbG9uZVxuICogbWFuZ2xlZCAob3IgYSBzZWVkIHRoYXQgY2FtZSBiYWNrIHRydW5jYXRlZCkgZmFpbHMgaGVyZSBpbnN0ZWFkIG9mIHNpbGVudGx5XG4gKiBwcm9kdWNpbmcgdW5kZWNyeXB0YWJsZSBibG9icy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24ga2V5Um91bmRUcmlwcyhrZXkpIHtcbiAgICBpZiAoIWtleSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgICAgICBjb25zdCBwcm9iZSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnbm9zdHJrZXktZGV2aWNlLXByb2JlJyk7XG4gICAgICAgIGNvbnN0IGN0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIHByb2JlKTtcbiAgICAgICAgY29uc3QgcHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgY3QpO1xuICAgICAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHB0KSA9PT0gJ25vc3Rya2V5LWRldmljZS1wcm9iZSc7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5EZXZpY2VEYigpIHtcbiAgICAvLyBMYXp5IGltcG9ydCBzbyB0aGUgbW9kdWxlIHdvcmtzIGluIGNvbnRleHRzL3Rlc3RzIHdpdGhvdXQgaWRiIGJ1bmRsZWQuXG4gICAgY29uc3QgeyBvcGVuREIgfSA9IGF3YWl0IGltcG9ydCgnaWRiJyk7XG4gICAgcmV0dXJuIG9wZW5EQihERVZJQ0VfREIsIDEsIHtcbiAgICAgICAgdXBncmFkZShkKSB7XG4gICAgICAgICAgICBpZiAoIWQub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhERVZJQ0VfU1RPUkUpKSB7XG4gICAgICAgICAgICAgICAgZC5jcmVhdGVPYmplY3RTdG9yZShERVZJQ0VfU1RPUkUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFN0cmF0ZWd5IChhKTogQURPUFQgYSBwcmUtZXhpc3Rpbmcgbm9uLWV4dHJhY3RhYmxlIENyeXB0b0tleSBoYW5kbGUgZnJvbVxuICogSW5kZXhlZERCLiBOZXZlciBtaW50cyBvbmUuXG4gKlxuICogQSBrZXkgdGhhdCBkYi5nZXQoKSBoYW5kcyBiYWNrIGlzIGEga2V5IHNvbWUgRUFSTElFUiBjb250ZXh0IHdyb3RlLCBzbyBpdCBpc1xuICogcHJvb2Ygb2YgY3Jvc3MtY29udGV4dCBwZXJzaXN0ZW5jZSBcdTIwMTQgdGhlIG9uZSB0aGluZyBhIHNhbWUtY29udGV4dFxuICogcHV0XHUyMTkyZ2V0XHUyMTkycm91bmQtdHJpcCBwcm9iZSBjYW4gbmV2ZXIgZXN0YWJsaXNoLiBpT1MgU2FmYXJpJ3MgSW5kZXhlZERCIGlzXG4gKiBmdW5jdGlvbmFsIGJ1dCBlcGhlbWVyYWwgZm9yIHRoZSBleHRlbnNpb24gYmFja2dyb3VuZDogaXQgd291bGQgaGF2ZSBwYXNzZWRcbiAqIHRoZSBwcm9iZSBhbmQgdGhlbiBsb3N0IHRoZSB1c2VyJ3Mgb25seSBjb3B5IG9mIGEgcHJpdmF0ZSBrZXkuIFNvOiBub1xuICogcHJlLWV4aXN0aW5nIGtleSBtZWFucyBubyBgaWRiYCwgYW5kIHRoZSBjYWxsZXIgc2VlZHMgaW5zdGVhZC5cbiAqXG4gKiBSZXR1cm5zIG51bGwgKG5ldmVyIHRocm93cykgd2hlbiBub3RoaW5nIHVzYWJsZSBpcyB0aGVyZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdHJ5SWRiRGV2aWNlS2V5KCkge1xuICAgIGlmICghaW5kZXhlZERiQXZhaWxhYmxlKCkpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGIuZ2V0KERFVklDRV9TVE9SRSwgREVWSUNFX0tFWV9JRCk7XG4gICAgICAgIGlmICghZXhpc3RpbmcpIHJldHVybiBudWxsOyAvLyBlbXB0eSBzdG9yZSBcdTIxOTIgc2VlZCwgZG8gTk9UIG1pbnQgaGVyZVxuICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoZXhpc3RpbmcpKSA/IGV4aXN0aW5nIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoZSBzdG9yYWdlIGFyZWEgYmFja2luZyB0aGUgYHNlZWRgIHN0cmF0ZWd5LiBJbXBvcnRlZCBsYXppbHkgYmVjYXVzZVxuICogYnJvd3Nlci1wb2x5ZmlsbCB0aHJvd3MgYXQgbW9kdWxlIGxvYWQgd2hlbiBubyBleHRlbnNpb24gbmFtZXNwYWNlIGV4aXN0cy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VlZFN0b3JhZ2UoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIHJldHVybiBhcGk/LnN0b3JhZ2U/LmxvY2FsIHx8IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqIFNpZ25hbCAyOiBhIFdlYktpdCB1c2VyIGFnZW50IHdpdGggbm8gQ2hyb21pdW0gbWFya2VyIG9uIGl0LiAqL1xuZnVuY3Rpb24gbG9va3NMaWtlV2ViS2l0T25seVVhKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVhID0gKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQpIHx8ICcnO1xuICAgICAgICByZXR1cm4gL1NhZmFyaXxBcHBsZVdlYktpdC8udGVzdCh1YSkgJiYgIS9DaHJvbShlfGl1bSl8RWRnXFwvfE9QUlxcLy8udGVzdCh1YSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogVHJ1ZSBvbiBTYWZhcmkgKGlPUyArIG1hY09TKSwgd2hlcmUgSW5kZXhlZERCIG11c3QgTkVWRVIgaG9sZCB0aGUgd3JhcHBpbmdcbiAqIGtleSBcdTIwMTQgc2VlIHRoZSBtb2R1bGUgaGVhZGVyJ3Mgc3RvcmFnZS1zY29wZSBub3RlLlxuICpcbiAqIERldGVjdGlvbiBpcyBtdWx0aS1zaWduYWwgYW5kIEJJQVNFRCBUT1dBUkQgU0FGQVJJLCBiZWNhdXNlIHRoZSB0d28gZXJyb3JzXG4gKiBhcmUgbm90IHN5bW1ldHJpYzogc2VlZGluZyBhIENocm9tZSB2YXVsdCBjb3N0cyBub3RoaW5nIChzZWVkIGlzIGFscmVhZHkgdGhlXG4gKiBzdHJhdGVneSBldmVyeSBmcmVzaCBpbnN0YWxsIGxhbmRzIG9uKSwgd2hpbGUgYWRvcHRpbmcgYW4gSURCIGtleSBvbiBTYWZhcmlcbiAqIGlzIHVuc2FmZS4gU28gb25seSBhIFBPU0lUSVZFTFkgaWRlbnRpZmllZCBDaHJvbWUvRmlyZWZveCBvcmlnaW4gbWF5IGFkb3B0IGFuXG4gKiBJbmRleGVkREIga2V5IFx1MjAxNCBhIGdldFVSTCB0aGF0IGlzIG1pc3NpbmcsIHRocm93cywgcmV0dXJucyBhIG5vbi1zdHJpbmcsXG4gKiByZXR1cm5zICcnIG9yIHJldHVybnMgYSBzY2hlbWUgd2UgZG8gbm90IHJlY29nbmlzZSBhbGwgcmVzb2x2ZSB0byBTYWZhcmkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzU2FmYXJpRW5naW5lKCkge1xuICAgIGxldCBvcmlnaW4gPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICBjb25zdCB1cmwgPSBhcGk/LnJ1bnRpbWU/LmdldFVSTD8uKCcnKTtcbiAgICAgICAgb3JpZ2luID0gdHlwZW9mIHVybCA9PT0gJ3N0cmluZycgPyB1cmwgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBvcmlnaW4gPSBudWxsO1xuICAgIH1cbiAgICAvLyBTaWduYWwgMTogYSBwb3NpdGl2ZWx5IGlkZW50aWZpZWQgU2FmYXJpIG9yaWdpbi5cbiAgICBpZiAob3JpZ2luICYmIG9yaWdpbi5zdGFydHNXaXRoKCdzYWZhcmktd2ViLWV4dGVuc2lvbjovLycpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMjogYSBXZWJLaXQtb25seSBVQSBvdXRyYW5rcyB0aGUgb3JpZ2luIFx1MjAxNCBhIFNhZmFyaSBidWlsZCB0aGF0XG4gICAgLy8gcmVwb3J0ZWQgYW4gdW5leHBlY3RlZCBvcmlnaW4gc3RpbGwgbXVzdCBub3QgdG91Y2ggSW5kZXhlZERCLlxuICAgIGlmIChsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU2lnbmFsIDM6IG9ubHkgdGhlc2UgdHdvIG9yaWdpbnMgZWFybiB0aGUgSURCIGFkb3B0IHBhdGguXG4gICAgaWYgKG9yaWdpbiAmJiAob3JpZ2luLnN0YXJ0c1dpdGgoJ2Nocm9tZS1leHRlbnNpb246Ly8nKSB8fCBvcmlnaW4uc3RhcnRzV2l0aCgnbW96LWV4dGVuc2lvbjovLycpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlOyAvLyBhbWJpZ3VvdXMgXHUyMTkyIHNlZWRcbn1cblxuLyoqIEltcG9ydCByYXcgc2VlZCBieXRlcyAoYmFzZTY0KSBhcyBhIG5vbi1leHRyYWN0YWJsZSBBRVMtR0NNIGtleS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydFNlZWRLZXkoc2VlZEI2NCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsIGJhc2U2NFRvQWIoc2VlZEI2NCksIHsgbmFtZTogJ0FFUy1HQ00nIH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGUgb25jZSBpbXBvcnRlZFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbi8qKiBSZWFkIHRoZSBzdGlja3kgc3RyYXRlZ3kgcmVjb3JkZWQgYnkgYSBwcmV2aW91cyByZXNvbHV0aW9uIChudWxsIGlmIG5vbmUpLiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFN0aWNreVN0cmF0ZWd5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NUUkFURUdZX0tFWV06IG51bGwgfSk7XG4gICAgICAgIGNvbnN0IHMgPSBnb3Q/LltERVZJQ0VfU1RSQVRFR1lfS0VZXTtcbiAgICAgICAgcmV0dXJuIChzID09PSAnaWRiJyB8fCBzID09PSAnc2VlZCcpID8gcyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqIFJlY29yZCB0aGUgcmVzb2x2ZWQgc3RyYXRlZ3kgc28gbGF0ZXIgbG9hZHMgY2Fubm90IHNpbGVudGx5IGZsaXAgaXQuICovXG5hc3luYyBmdW5jdGlvbiB3cml0ZVN0aWNreVN0cmF0ZWd5KHN0cmF0ZWd5KSB7XG4gICAgaWYgKHN0cmF0ZWd5ICE9PSAnaWRiJyAmJiBzdHJhdGVneSAhPT0gJ3NlZWQnKSByZXR1cm47IC8vICdtZW1vcnknIHBlcnNpc3RzIG5vdGhpbmdcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHN0b3JlLnNldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogc3RyYXRlZ3kgfSk7XG4gICAgfSBjYXRjaCB7IC8qIGJlc3QgZWZmb3J0IFx1MjAxNCB0aGUgc3RyYXRlZ3kgc3RpbGwgcmVzb2x2ZXMgdGhlIHNhbWUgd2F5ICovIH1cbn1cblxuLyoqIFN0cmF0ZWd5IChiKTogYSByYXcgcmFuZG9tIHNlZWQgaW4gc3RvcmFnZS5sb2NhbCwgaW1wb3J0ZWQgbm9uLWV4dHJhY3RhYmxlLiAqL1xuYXN5bmMgZnVuY3Rpb24gdHJ5U2VlZERldmljZUtleSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgIGxldCBzZWVkID0gZ290Py5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgaWYgKCFzZWVkKSB7XG4gICAgICAgICAgICBzZWVkID0gYWJUb0Jhc2U2NChjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KERFVklDRV9TRUVEX0JZVEVTKSkuYnVmZmVyKTtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JlLnNldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBzZWVkIH0pO1xuICAgICAgICAgICAgLy8gVkVSSUZZIHBlcnNpc3RlbmNlIGJlZm9yZSBhbnl0aGluZyBpcyB3cmFwcGVkIHVuZGVyIGl0LlxuICAgICAgICAgICAgY29uc3QgY2hlY2sgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBlcnNpc3RlZCA9IGNoZWNrPy5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgICAgIGlmIChwZXJzaXN0ZWQgIT09IHNlZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBBbm90aGVyIGNvbnRleHQgKHBvcHVwIHZzIGJhY2tncm91bmQgb24gYSBmaXJzdCBydW4pIG1pbnRlZFxuICAgICAgICAgICAgICAgIC8vIGFuZCB3cm90ZSBpdHMgb3duIHNlZWQgYmV0d2VlbiBvdXIgc2V0KCkgYW5kIHRoaXMgcmVhZC4gQURPUFRcbiAgICAgICAgICAgICAgICAvLyBUSEUgV0lOTkVSOiBhbnkgc2VlZCBhY3R1YWxseSBpbiBzdG9yYWdlIGlzIGV4YWN0bHkgYXMgZ29vZCBhc1xuICAgICAgICAgICAgICAgIC8vIG91cnMsIGFuZCBpdCBpcyB0aGUgb25lIHRoZSBvdGhlciBjb250ZXh0IGlzIGFscmVhZHkgd3JhcHBpbmdcbiAgICAgICAgICAgICAgICAvLyB1bmRlci4gUmV0dXJuaW5nIG51bGwgaGVyZSB3b3VsZCBkcm9wIHRoZSBjYWxsZXIgdGhyb3VnaCB0b1xuICAgICAgICAgICAgICAgIC8vIHRoZSBtZW1vcnkga2V5LCB3aG9zZSBibG9icyBkaWUgd2l0aCB0aGlzIGNvbnRleHQgXHUyMDE0IHRoZSB2ZXJ5XG4gICAgICAgICAgICAgICAgLy8gbG9zcyB0aGlzIHN0cmF0ZWd5IGV4aXN0cyB0byBwcmV2ZW50LiBPbmx5IGEgZ2VudWluZWx5IGFic2VudFxuICAgICAgICAgICAgICAgIC8vIG9yIHVudXNhYmxlIHZhbHVlIGlzIGEgZmFpbHVyZS5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBlcnNpc3RlZCAhPT0gJ3N0cmluZycgfHwgcGVyc2lzdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgc2VlZCA9IHBlcnNpc3RlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbXBvcnRTZWVkS2V5KHNlZWQpO1xuICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0IChjcmVhdGluZyBvbiBmaXJzdCB1c2UpIHRoZSBkZXZpY2Ugd3JhcCBrZXkuXG4gKlxuICogUmVzb2x1dGlvbiBvcmRlciwgb25jZTogaG9ub3VyIHRoZSBzdGlja3kgc3RyYXRlZ3kgdGhpcyBpbnN0YWxsIGFscmVhZHlcbiAqIHJlY29yZGVkOyBvdGhlcndpc2UgQURPUFQgYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGtleSBpZiBvbmUgaXMgdGhlcmUsIGFuZFxuICogZmFpbGluZyB0aGF0IHNlZWQuIFdoYXRldmVyIHJlc29sdmVzIGlzIHdyaXR0ZW4gYmFjayBhcyB0aGUgc3RpY2t5IHN0cmF0ZWd5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5KCkge1xuICAgIGlmIChfZGV2aWNlS2V5UHJvbWlzZSkgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RpY2t5ID0gYXdhaXQgcmVhZFN0aWNreVN0cmF0ZWd5KCk7XG5cbiAgICAgICAgLy8gQSB2YXVsdCBhbHJlYWR5IG9uIGBzZWVkYCBuZXZlciByZS1wcm9iZXMgSW5kZXhlZERCOiBpdHMgYmxvYnMgYXJlXG4gICAgICAgIC8vIHVuZGVyIHRoZSBzZWVkIGtleSwgYW5kIGFkb3B0aW5nIGEgc3RyYXkgSURCIGhhbmRsZSB3b3VsZCBvcnBoYW4gdGhlbS5cbiAgICAgICAgLy8gT24gU2FmYXJpIHdlIG5ldmVyIFdSSVRFIHVuZGVyIGFuIElEQiBrZXkgYXQgYWxsIChzZWUgaGVhZGVyKTogaXRzXG4gICAgICAgIC8vIHBlci1lbmdpbmUgc3RvcmFnZSBzY29waW5nIG1ha2VzIGFuIGFkb3B0ZWQgSURCIGhhbmRsZSB1bnNhZmUgYXMgYVxuICAgICAgICAvLyB3cmFwcGluZyBrZXkuIEV4aXN0aW5nIElEQiBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHRcbiAgICAgICAgLy8gZmFsbGJhY2sgYW5kIGFyZSByZS13cmFwcGVkIHVuZGVyIHRoZSBzZWVkIGJ5IHRoZSBhdC1yZXN0IG1pZ3JhdGlvbi5cbiAgICAgICAgaWYgKHN0aWNreSAhPT0gJ3NlZWQnICYmICEoYXdhaXQgaXNTYWZhcmlFbmdpbmUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkYktleSA9IGF3YWl0IHRyeUlkYkRldmljZUtleSgpO1xuICAgICAgICAgICAgaWYgKGlkYktleSkge1xuICAgICAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdpZGInO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlU3RpY2t5U3RyYXRlZ3koJ2lkYicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGJLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgdHJ5U2VlZERldmljZUtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkge1xuICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ3NlZWQnO1xuICAgICAgICAgICAgLy8gQWxzbyBjb3ZlcnMgdGhlIGRlZ3JhZGUgY2FzZTogc3RpY2t5IHdhcyAnaWRiJyBidXQgdGhlIGhhbmRsZSBpc1xuICAgICAgICAgICAgLy8gZ29uZS4gT2xkIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdCBmYWxsYmFjayBiZWxvdy5cbiAgICAgICAgICAgIGF3YWl0IHdyaXRlU3RpY2t5U3RyYXRlZ3koJ3NlZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBzZWVkS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90aGluZyBwZXJzaXN0cyBoZXJlLiBCZXR0ZXIgdGhhbiByZWZ1c2luZyB0byBlbmNyeXB0LCBidXQgYmxvYnNcbiAgICAgICAgLy8gd3JpdHRlbiB1bmRlciB0aGlzIGtleSBkaWUgd2l0aCB0aGUgY29udGV4dCBcdTIwMTQgc2VlIG1vZHVsZSBoZWFkZXIuXG4gICAgICAgIGlmICghX21lbW9yeURldmljZUtleSkgX21lbW9yeURldmljZUtleSA9IGF3YWl0IGdlbmVyYXRlRGV2aWNlS2V5KCk7XG4gICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdtZW1vcnknO1xuICAgICAgICByZXR1cm4gX21lbW9yeURldmljZUtleTtcbiAgICB9KSgpO1xuICAgIHJldHVybiBfZGV2aWNlS2V5UHJvbWlzZTtcbn1cblxuLyoqIFdoaWNoIHBlcnNpc3RlbmNlIHN0cmF0ZWd5IHRoZSBkZXZpY2Uga2V5IHJlc29sdmVkIHRvIChudWxsIHVudGlsIHJlc29sdmVkKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXZpY2VLZXlTdHJhdGVneSgpIHtcbiAgICByZXR1cm4gX2RldmljZVN0cmF0ZWd5O1xufVxuXG4vKipcbiAqIERyb3AgZXZlcnkgbWVtb2lzZWQgZGV2aWNlLWtleSBoYW5kbGUuIE1VU1QgYmUgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIGFueVxuICogYHN0b3JhZ2UuY2xlYXIoKWA6IHRoZSBzZWVkIChhbmQgdGhlIHN0aWNreSBzdHJhdGVneSkgYXJlIGdvbmUgZnJvbSBzdG9yYWdlLFxuICogc28gYSBjYWNoZWQgcHJvbWlzZSB3b3VsZCBrZWVwIGhhbmRpbmcgb3V0IGEga2V5IHdob3NlIGJhY2tpbmcgbWF0ZXJpYWwgbm9cbiAqIGxvbmdlciBleGlzdHMgXHUyMDE0IHRoZSBuZXh0IGdldERldmljZUtleSgpIHdvdWxkIHdyYXAgc2VjcmV0cyB1bmRlciBhIGtleSB0aGF0XG4gKiBkaWVzIHdpdGggdGhpcyBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZXZpY2VLZXkoKSB7XG4gICAgX2RldmljZUtleVByb21pc2UgPSBudWxsO1xuICAgIF9kZXZpY2VTdHJhdGVneSA9IG51bGw7XG4gICAgX21lbW9yeURldmljZUtleSA9IG51bGw7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIGEgcHJlLWV4aXN0aW5nIEluZGV4ZWREQiBkZXZpY2Uga2V5LCB1c2VkIG9ubHkgYXMgYVxuICogZGVjcnlwdCBmYWxsYmFjayBmb3IgYmxvYnMgd3JpdHRlbiBiZWZvcmUgdGhpcyBjb250ZXh0IGNoYW5nZWQgc3RyYXRlZ3kuXG4gKiBOZXZlciBjcmVhdGVzIG9uZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0TGVnYWN5SWRiS2V5KCkge1xuICAgIGlmIChfbGVnYWN5SWRiS2V5UHJvbWlzZSkgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgZGIuZ2V0KERFVklDRV9TVE9SRSwgREVWSUNFX0tFWV9JRCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byB0aGUga2V5IGFuIEVYSVNUSU5HIGBkZXZpY2VLZXlTZWVkYCBpbXBvcnRzIHRvLCB1c2VkIG9ubHlcbiAqIGFzIGEgZGVjcnlwdCBmYWxsYmFjay4gTmV2ZXIgbWludHMgYSBzZWVkICh0aGF0IGlzIHRyeVNlZWREZXZpY2VLZXkncyBqb2IpLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRFeGlzdGluZ1NlZWRLZXkoKSB7XG4gICAgaWYgKF9leGlzdGluZ1NlZWRLZXlQcm9taXNlKSByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgICAgICBjb25zdCBzZWVkID0gZ290Py5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgICAgIGlmICghc2VlZCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbXBvcnRTZWVkS2V5KHNlZWQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIEV2ZXJ5IE9USEVSIGtleSB0aGlzIGluc3RhbGwgY291bGQgaGF2ZSB3cmFwcGVkIGEgZGV2aWNlIGJsb2IgdW5kZXIsIGluXG4gKiBwcmVmZXJlbmNlIG9yZGVyLiBTdHJhdGVneSBmbGlwcyAoaWRiXHUyMTkyc2VlZCBvbiBkZWdyYWRlLCBzZWVkXHUyMTkyaWRiIG9uIGFuXG4gKiBhZG9wdGVkIGhhbmRsZSkgbXVzdCBuZXZlciBvcnBoYW4gYSBibG9iLCBzbyB0aGUgZmFsbGJhY2sgaXMgc3ltbWV0cmljOiBhXG4gKiBzZWVkIGJsb2Igc3RheXMgcmVhZGFibGUgd2hpbGUgdGhlIHN0cmF0ZWd5IGlzICdpZGInIGFuZCB2aWNlIHZlcnNhLlxuICovXG5hc3luYyBmdW5jdGlvbiBmYWxsYmFja0RldmljZUtleXMoKSB7XG4gICAgY29uc3Qga2V5cyA9IFtdO1xuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdpZGInKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FjeSA9IGF3YWl0IGdldExlZ2FjeUlkYktleSgpO1xuICAgICAgICBpZiAobGVnYWN5KSBrZXlzLnB1c2gobGVnYWN5KTtcbiAgICB9XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ3NlZWQnKSB7XG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCBnZXRFeGlzdGluZ1NlZWRLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIGtleXMucHVzaChzZWVkS2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRldmljZSBibG9iIHdpdGggdGhlIGN1cnJlbnQga2V5LCBmYWxsaW5nIGJhY2sgdG8gZXZlcnkgb3RoZXIga2V5XG4gKiB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkLiBSZXR1cm5zIHRoZSBwbGFpbnRleHQgcGx1cyB3aGV0aGVyIGEgZmFsbGJhY2sga2V5XG4gKiB3YXMgbmVlZGVkIChpLmUuIHRoZSBibG9iIGlzIHN0YWxlIGFuZCB3b3J0aCByZS13cmFwcGluZykuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCksIHN0YWxlOiBmYWxzZSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZm9yIChjb25zdCBmYWxsYmFjayBvZiBhd2FpdCBmYWxsYmFja0RldmljZUtleXMoKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChmYWxsYmFjaywgaXYsIGNpcGhlcnRleHQpLFxuICAgICAgICAgICAgICAgICAgICBzdGFsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHRyeSB0aGUgbmV4dCBvbmUgKi8gfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7IC8vIHJlcG9ydCB0aGUgQ1VSUkVOVCBrZXkncyBmYWlsdXJlLCBub3QgdGhlIGxhc3QgZmFsbGJhY2snc1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGVuYy5lbmNvZGUocGxhaW50ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHY6IDEsXG4gICAgICAgIGs6ICdkZXZpY2UnLFxuICAgICAgICBpdjogYWJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFiVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSB7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BYihpdikpIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgYmFzZTY0VG9BYihjaXBoZXJ0ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhEZXZpY2VLZXkoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgLy8gR0NNIGF1dGhlbnRpY2F0aW9uIGNhbiBmYWlsIHdpdGggdGhlIENVUlJFTlQgc3RyYXRlZ3kncyBrZXkgYmVjYXVzZSB0aGVcbiAgICAvLyBibG9iIHByZWRhdGVzIGEgc3RyYXRlZ3kgY2hhbmdlIChhIENocm9tZS9GaXJlZm94IHZhdWx0IHdob3NlIElEQiBoYW5kbGVcbiAgICAvLyBpcyBzdGlsbCByZWFkYWJsZSB3aGlsZSB0aGlzIGNvbnRleHQgc2V0dGxlZCBvbiB0aGUgc2VlZCwgb3IgdGhlIHJldmVyc2UpLlxuICAgIC8vIFRyeSBldmVyeSBrZXkgdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZCBiZWZvcmUgZGVjbGFyaW5nIHRoZSBzZWNyZXQgbG9zdC5cbiAgICBjb25zdCB7IHBsYWludGV4dCB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiBwbGFpbnRleHQ7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRldmljZSBibG9iIGFuZCwgd2hlbiBpdCBjb3VsZCBvbmx5IGJlIHJlYWQgdmlhIGEgZmFsbGJhY2sga2V5XG4gKiAobGVnYWN5IEluZGV4ZWREQiBoYW5kbGUsIG9yIGFuIGV4aXN0aW5nIHNlZWQgd2hpbGUgdGhlIHN0cmF0ZWd5IGlzICdpZGInKSxcbiAqIGhhbmQgYmFjayBhIHJlcGxhY2VtZW50IGJsb2Igd3JhcHBlZCB1bmRlciB0aGUgQ1VSUkVOVCBzdHJhdGVneSBzbyB0aGUgY2FsbGVyXG4gKiBjYW4gcGVyc2lzdCB0aGUgdXBncmFkZSBvcHBvcnR1bmlzdGljYWxseS5cbiAqIGByZXdyYXBwZWRgIGlzIG51bGwgd2hlbiB0aGUgYmxvYiBpcyBhbHJlYWR5IGN1cnJlbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkZvclJld3JhcChlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCB7IHBsYWludGV4dCwgc3RhbGUgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwbGFpbnRleHQsXG4gICAgICAgIHJld3JhcHBlZDogc3RhbGUgPyBhd2FpdCBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIDogbnVsbCxcbiAgICB9O1xufVxuXG4vLyAtLS0gQmxvYiBjbGFzc2lmaWNhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuc2FsdCAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCAmJiBwLmsgIT09ICdkZXZpY2UnKTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldmljZUtleUJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5rID09PSAnZGV2aWNlJyAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG4vKiogVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYWxyZWFkeSBjaXBoZXJ0ZXh0IChlaXRoZXIgd3JhcHBpbmcpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2lwaGVydGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkgfHwgaXNEZXZpY2VLZXlCbG9iKHZhbHVlKTtcbn1cblxuLy8gLS0tIFVuaWZpZWQgd3JhcCAvIHVud3JhcCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgc2VjcmV0IGZvciBhdC1yZXN0IHN0b3JhZ2UuIFByZWZlcnMgdGhlIHBhc3N3b3JkLWRlcml2ZWQgc2Vzc2lvblxuICoga2V5IHdoZW4gb25lIGlzIGF2YWlsYWJsZSBpbiB0aGlzIGNvbnRleHQgKGJhY2tncm91bmQsIHVubG9ja2VkKTsgb3RoZXJ3aXNlXG4gKiBmYWxscyBiYWNrIHRvIHRoZSBhbHdheXMtYXZhaWxhYmxlIGRldmljZSBrZXkuIE5ldmVyIHJldHVybnMgcGxhaW50ZXh0LlxuICpcbiAqIFRoZSB0aWVyIGlzIHRoZXJlZm9yZSBBTUJJRU5UIFx1MjAxNCBpdCBpcyB3aGF0ZXZlciBgc2V0U2Vzc2lvbktleWAgLyBgY2xlYXJTZXNzaW9uYFxuICogbGFzdCBkaWQgaW4gdGhpcyBtb2R1bGUsIHdoaWNoIG1heSBoYXZlIGJlZW4gZG9uZSBieSBhIGRpZmZlcmVudCBmaWxlLiBPbmx5XG4gKiBjYWxsIHRoaXMgd2hlcmUgZWl0aGVyIHRpZXIgaXMgZ2VudWluZWx5IGFjY2VwdGFibGUgKGEgdmFsdWUgdGhhdFxuICogYHVud3JhcFNlY3JldGAgY2FuIG9wZW4gdW5kZXIgYm90aCkuIEEgY2FsbGVyIHRoYXQgbmVlZHMgYSBTUEVDSUZJQyB0aWVyIG11c3RcbiAqIG5hbWUgaXQ6IGBlbmNyeXB0V2l0aERldmljZUtleWAgb3IgYGVuY3J5cHRXaXRoS2V5YC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBTZWNyZXQocGxhaW50ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBwbGFpbnRleHQgIT09ICdzdHJpbmcnIHx8IHBsYWludGV4dC5sZW5ndGggPT09IDApIHJldHVybiBwbGFpbnRleHQ7XG4gICAgaWYgKGlzQ2lwaGVydGV4dChwbGFpbnRleHQpKSByZXR1cm4gcGxhaW50ZXh0OyAvLyBhbHJlYWR5IHdyYXBwZWQgXHUyMDE0IGRvbid0IGRvdWJsZS13cmFwXG4gICAgaWYgKF9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHJldHVybiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIF9zZXNzaW9uS2V5LCBfc2Vzc2lvblNhbHQpO1xuICAgIH1cbiAgICByZXR1cm4gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGFuIGF0LXJlc3Qgc2VjcmV0LiBSZWZ1c2VzIHdoZW4gdGhlIHNlc3Npb24gaXMgZXhwbGljaXRseSBsb2NrZWQuXG4gKiBMZWdhY3kgcGxhaW50ZXh0IHZhbHVlcyBhcmUgcmV0dXJuZWQgdW5jaGFuZ2VkICh0cmFuc2l0aW9uYWwgXHUyMDE0IGNhbGxlcnMgc2hvdWxkXG4gKiByZS13cmFwIG9uIG5leHQgd3JpdGU7IHNlZSBtaWdyYXRpb24gcGF0aHMpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdW53cmFwU2VjcmV0KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgdmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKCFpc0NpcGhlcnRleHQodmFsdWUpKSByZXR1cm4gdmFsdWU7IC8vIGxlZ2FjeSBwbGFpbnRleHQgcGFzc3Rocm91Z2hcbiAgICBpZiAoX3VubG9ja2VkID09PSBmYWxzZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2tlZDogc2Vzc2lvbiBpcyBsb2NrZWQgXHUyMDE0IGNhbm5vdCByZWFkIHNlY3JldCcpO1xuICAgIH1cbiAgICBpZiAoaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdFdpdGhEZXZpY2VLZXkodmFsdWUpO1xuICAgIH1cbiAgICAvLyBwYXNzd29yZCBibG9iXG4gICAgaWYgKCFfc2Vzc2lvbktleSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2tlZDogbm8gc2Vzc2lvbiBrZXkgYXZhaWxhYmxlIHRvIGRlY3J5cHQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0V2l0aEtleSh2YWx1ZSwgX3Nlc3Npb25LZXkpO1xufVxuIiwgIi8qKlxuICogRW5jcnlwdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5IG1hc3RlciBwYXNzd29yZCBmZWF0dXJlLlxuICpcbiAqIFVzZXMgV2ViIENyeXB0byBBUEkgKGNyeXB0by5zdWJ0bGUpIGV4Y2x1c2l2ZWx5IFx1MjAxNCBubyBleHRlcm5hbCBsaWJyYXJpZXMuXG4gKiAtIFBCS0RGMiB3aXRoIDYwMCwwMDAgaXRlcmF0aW9ucyAoT1dBU1AgMjAyMyByZWNvbW1lbmRhdGlvbilcbiAqIC0gQUVTLTI1Ni1HQ00gZm9yIGF1dGhlbnRpY2F0ZWQgZW5jcnlwdGlvblxuICogLSBSYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpIHBlciBvcGVyYXRpb25cbiAqIC0gQWxsIGJpbmFyeSBkYXRhIGVuY29kZWQgYXMgYmFzZTY0IGZvciBKU09OIHN0b3JhZ2UgY29tcGF0aWJpbGl0eVxuICovXG5cbmNvbnN0IFBCS0RGMl9JVEVSQVRJT05TID0gNjAwXzAwMDtcbmNvbnN0IFNBTFRfQllURVMgPSAxNjtcbmNvbnN0IElWX0JZVEVTID0gMTI7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBLZXkgZGVyaXZhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBEZXJpdmUgYW4gQUVTLTI1Ni1HQ00gQ3J5cHRvS2V5IGZyb20gYSBwYXNzd29yZCBhbmQgc2FsdCB1c2luZyBQQktERjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcnxVaW50OEFycmF5fSBzYWx0IC0gMTYtYnl0ZSBzYWx0XG4gKiBAcGFyYW0ge3tleHRyYWN0YWJsZT86IGJvb2xlYW59fSBbb3B0aW9uc10gLSBgZXh0cmFjdGFibGU6IHRydWVgIGFsbG93cyB0aGVcbiAqICAgICAgICByYXcgYnl0ZXMgdG8gYmUgZXhwb3J0ZWQgb25jZSAoc2VlIGV4cG9ydEtleUJhc2U2NCkuIFVzZWQgYnkgdGhlXG4gKiAgICAgICAgYmFja2dyb3VuZCB3b3JrZXIgc28gYW4gdW5sb2NrZWQgc2Vzc2lvbiBjYW4gYmUgcGFya2VkIGluXG4gKiAgICAgICAgc3RvcmFnZS5zZXNzaW9uIGFuZCBmdWxseSByZXN0b3JlZCBhZnRlciBhbiBNVjMgZXZpY3Rpb24uIERlZmF1bHRcbiAqICAgICAgICBmYWxzZTogdGhlIGtleSBpcyBvcGFxdWUgYW5kIGNhbm5vdCBsZWF2ZSB0aGUgY3J5cHRvIHN1YnN5c3RlbS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59IEFFUy0yNTYtR0NNIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0LCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVLZXknXVxuICAgICk7XG5cbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5kZXJpdmVLZXkoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdDogc2FsdCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBzYWx0IDogbmV3IFVpbnQ4QXJyYXkoc2FsdCksXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICAhIW9wdGlvbnMuZXh0cmFjdGFibGUsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vKipcbiAqIEV4cG9ydCBhbiBleHRyYWN0YWJsZSBBRVMga2V5J3MgcmF3IGJ5dGVzIGFzIGJhc2U2NC5cbiAqIE9ubHkgZXZlciBjYWxsZWQgb24gYSBrZXkgZGVyaXZlZCB3aXRoIGB7IGV4dHJhY3RhYmxlOiB0cnVlIH1gLlxuICpcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IGJhc2U2NCByYXcga2V5IGJ5dGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRLZXlCYXNlNjQoa2V5KSB7XG4gICAgcmV0dXJuIGFycmF5QnVmZmVyVG9CYXNlNjQoYXdhaXQgY3J5cHRvLnN1YnRsZS5leHBvcnRLZXkoJ3JhdycsIGtleSkpO1xufVxuXG4vKipcbiAqIEltcG9ydCBiYXNlNjQgcmF3IGJ5dGVzIGJhY2sgaW50byBhIE5PTi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTSBrZXkuXG4gKiBUaGUgY291bnRlcnBhcnQgb2YgZXhwb3J0S2V5QmFzZTY0OiB3aGF0ZXZlciB3ZW50IG91dCBleHRyYWN0YWJsZSBjb21lcyBiYWNrXG4gKiBvcGFxdWUsIHNvIGEgcmVzdG9yZWQgc2Vzc2lvbiBrZXkgY2Fubm90IGJlIHJlLWV4cG9ydGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlNjQgLSByYXcga2V5IGJ5dGVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW1wb3J0S2V5QmFzZTY0KGJhc2U2NCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vKiogYmFzZTY0IFx1MjE5NCBieXRlcywgZXhwb3J0ZWQgc28gY2FsbGVycyBjYW4gcm91bmQtdHJpcCBhIHNhbHQgdGhyb3VnaCBKU09OLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpIHtcbiAgICAvLyBgbmV3IFVpbnQ4QXJyYXkodmlldylgIGluc2lkZSB0aGUgaGVscGVyIGNvcGllcyB0aGUgVklFVywgc28gYSBzYWx0IHRoYXRcbiAgICAvLyBpcyBhIHdpbmRvdyBpbnRvIGEgbGFyZ2VyIGJ1ZmZlciBzdGlsbCBlbmNvZGVzIGNvcnJlY3RseS5cbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChieXRlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J5dGVzKGJhc2U2NCkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkpO1xufVxuXG4vLyAtLS0gRW5jcnlwdCB3aXRoIHByZS1kZXJpdmVkIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgYW5kIGl0cyBzYWx0LlxuICpcbiAqIFRoaXMgYXZvaWRzIGhvbGRpbmcgdGhlIHJhdyBwYXNzd29yZCBpbiBtZW1vcnkgXHUyMDE0IHRoZSBjYWxsZXIgZGVyaXZlcyB0aGVcbiAqIGtleSBvbmNlICh2aWEgZGVyaXZlS2V5KSBhbmQgcmV1c2VzIGl0IGZvciB0aGUgc2Vzc2lvbi4gIFRoZSBvdXRwdXRcbiAqIGZvcm1hdCBpcyBpZGVudGljYWwgdG8gZW5jcnlwdCgpLCBzbyBkZWNyeXB0KCkgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aFxuICogdGhlIG9yaWdpbmFsIHBhc3N3b3JkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgICAgICAgICAgLSBUaGUgZGF0YSB0byBlbmNyeXB0XG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5IGZyb20gZGVyaXZlS2V5KClcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdCAgICAgICAgICAgLSBUaGUgc2FsdCB0aGF0IHdhcyB1c2VkIHRvIGRlcml2ZSBga2V5YFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwga2V5LCBzYWx0KSB7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgLyBEZWNyeXB0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHdpdGggYSBwYXNzd29yZC5cbiAqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpLCBkZXJpdmVzIGFuXG4gKiBBRVMtMjU2LUdDTSBrZXkgdmlhIFBCS0RGMiwgYW5kIHJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nXG4gKiBiYXNlNjQtZW5jb2RlZCBzYWx0LCBpdiwgYW5kIGNpcGhlcnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAtIFRoZSBkYXRhIHRvIGVuY3J5cHQgKGUuZy4gaGV4IHByaXZhdGUga2V5KVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dCwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KTtcblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IChpZ25vcmVzIHRoZSBzYWx0IGVtYmVkZGVkIGluIHRoZVxuICogYmxvYiBcdTIwMTQgdGhlIGNhbGxlciBtdXN0IHN1cHBseSBhIGtleSB0aGF0IG1hdGNoZXMgaG93IHRoZSBibG9iIHdhcyBlbmNyeXB0ZWQpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KCkvZW5jcnlwdFdpdGhLZXkoKVxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoS2V5KGVuY3J5cHRlZERhdGEsIGtleSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB0aGF0IHdhcyBlbmNyeXB0ZWQgd2l0aCBgZW5jcnlwdCgpYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAgICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFzc3dvcmQgaXMgd3Jvbmcgb3IgZGF0YSBpcyB0YW1wZXJlZCB3aXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcblxuICAgIGNvbnN0IHNhbHRCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHRCdWYpO1xuXG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICByZXR1cm4gZGVjLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8vIC0tLSBQYXNzd29yZCBoYXNoaW5nIChmb3IgdmVyaWZpY2F0aW9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBIYXNoIGEgcGFzc3dvcmQgd2l0aCBQQktERjIgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIHByb2R1Y2VzIGEgc2VwYXJhdGUgaGFzaCAobm90IHRoZSBlbmNyeXB0aW9uIGtleSkgdGhhdCBjYW4gYmUgc3RvcmVkXG4gKiB0byB2ZXJpZnkgdGhlIHBhc3N3b3JkIHdpdGhvdXQgbmVlZGluZyB0byBhdHRlbXB0IGRlY3J5cHRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtVaW50OEFycmF5fSBbc2FsdF0gLSBPcHRpb25hbCBzYWx0OyBnZW5lcmF0ZWQgaWYgb21pdHRlZFxuICogQHJldHVybnMge1Byb21pc2U8eyBoYXNoOiBzdHJpbmcsIHNhbHQ6IHN0cmluZyB9Pn0gYmFzZTY0LWVuY29kZWQgaGFzaCBhbmQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBzYWx0ID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlQml0cyddXG4gICAgKTtcblxuICAgIGNvbnN0IGhhc2hCaXRzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIDI1NlxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBoYXNoOiBhcnJheUJ1ZmZlclRvQmFzZTY0KGhhc2hCaXRzKSxcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgYSBzdG9yZWQgaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAtIFRoZSBwYXNzd29yZCB0byB2ZXJpZnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRIYXNoIC0gYmFzZTY0LWVuY29kZWQgaGFzaCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkU2FsdCAtIGJhc2U2NC1lbmNvZGVkIHNhbHQgZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFRydWUgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRIYXNoLCBzdG9yZWRTYWx0KSB7XG4gICAgY29uc3QgeyBoYXNoIH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZFNhbHQpO1xuICAgIHJldHVybiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChoYXNoLCBzdG9yZWRIYXNoKTtcbn1cblxuLyoqXG4gKiBDb25zdGFudC10aW1lIGNvbXBhcmlzb24gb2YgdHdvIGJhc2U2NC1lbmNvZGVkIGJ5dGUgc3RyaW5ncy5cbiAqXG4gKiBEZWNvZGVzIGJvdGggdG8gcmF3IGJ5dGVzIGFuZCBjb21wYXJlcyB3aXRoIGFuIGFjY3VtdWxhdG9yIHNvIHRoZSBydW5uaW5nXG4gKiB0aW1lIGRvZXMgbm90IGRlcGVuZCBvbiB3aGVyZSB0aGUgZmlyc3QgbWlzbWF0Y2ggb2NjdXJzIFx1MjAxNCB0aGlzIGF2b2lkcyB0aGVcbiAqIHRpbWluZyBzaWRlLWNoYW5uZWwgb2YgYSBwbGFpbiBgPT09YCBzdHJpbmcgY29tcGFyZSAoVGllci0zIGNyeXB0by5qczoyMTMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoYSwgYikge1xuICAgIGxldCBiYSwgYmI7XG4gICAgdHJ5IHtcbiAgICAgICAgYmEgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGEpKTtcbiAgICAgICAgYmIgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGIpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBDb21wYXJlIHRoZSBtYXggbGVuZ3RoIHNvIGxlbmd0aCBkaWZmZXJlbmNlcyBkb24ndCBzaG9ydC1jaXJjdWl0IGVhcmx5LlxuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KGJhLmxlbmd0aCwgYmIubGVuZ3RoKTtcbiAgICBsZXQgZGlmZiA9IGJhLmxlbmd0aCBeIGJiLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRpZmYgfD0gKGJhW2ldIHx8IDApIF4gKGJiW2ldIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cbiIsICIvKipcbiAqIGJ1bmtlcjovLyBjb25uZWN0aW9uIHN0cmluZ3MuIE5vIGltcG9ydHMsIHNvIGFueXRoaW5nIHRoYXQgaGFuZGxlcyBwcm9maWxlc1xuICogY2FuIHVzZSB0aGlzIHdpdGhvdXQgbG9hZGluZyB0aGUgcmVsYXkgY29kZS5cbiAqXG4gKiBGb3JtYXQ6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PXdzczovLy4uLiZyZWxheT13c3M6Ly8uLi4mc2VjcmV0PTxvcHRpb25hbD5cbiAqL1xuXG4vKipcbiAqIFBhcnNlIGEgYnVua2VyOi8vIGNvbm5lY3Rpb24gc3RyaW5nXG4gKiBGb3JtYXQ6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PXdzczovLy4uLiZyZWxheT13c3M6Ly8uLi4mc2VjcmV0PTxvcHRpb25hbD5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQnVua2VyVXJsKHVybCkge1xuICAgIGlmICghdXJsLnN0YXJ0c1dpdGgoJ2J1bmtlcjovLycpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBtdXN0IHN0YXJ0IHdpdGggYnVua2VyOi8vJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIGNvbnN0IHJlbW90ZVB1YmtleSA9IHBhcnNlZC5ob3N0bmFtZSB8fCBwYXJzZWQucGF0aG5hbWUucmVwbGFjZSgnLy8nLCAnJyk7XG5cbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnVua2VyIFVSTDogcHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWxheXMgPSBwYXJzZWQuc2VhcmNoUGFyYW1zLmdldEFsbCgncmVsYXknKTtcbiAgICBpZiAocmVsYXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnVua2VyIFVSTDogYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgcmVsYXkgVVJMc1xuICAgIGZvciAoY29uc3QgcmVsYXkgb2YgcmVsYXlzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByID0gbmV3IFVSTChyZWxheSk7XG4gICAgICAgICAgICBpZiAoci5wcm90b2NvbCAhPT0gJ3dzczonICYmIHIucHJvdG9jb2wgIT09ICd3czonKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlbGF5IHByb3RvY29sOiAke3IucHJvdG9jb2x9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZWxheSBVUkw6ICR7cmVsYXl9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzZWNyZXQgPSBwYXJzZWQuc2VhcmNoUGFyYW1zLmdldCgnc2VjcmV0JykgfHwgbnVsbDtcblxuICAgIHJldHVybiB7IHJlbW90ZVB1YmtleSwgcmVsYXlzLCBzZWNyZXQgfTtcbn1cblxuLyoqXG4gKiBBIHJlbGF5IHZhbHVlIHdpdGhvdXQgY3JlZGVudGlhbHM6IG5vIHVzZXJpbmZvLCBubyBgc2VjcmV0YCBwYXJhbSwgbm8gZnJhZ21lbnQuXG4gKiBPdGhlciBxdWVyeSBwYXJhbXMgc3RheS4gQSB2YWx1ZSB3aXRoIG5vbmUgb2YgdGhvc2UgY29tZXMgYmFjayB1bmNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGNsZWFuUmVsYXkocmVsYXkpIHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlbGF5KTtcbiAgICBjb25zdCBuYW1lcyA9IFsuLi51cmwuc2VhcmNoUGFyYW1zLmtleXMoKV0uZmlsdGVyKG5hbWUgPT4gbmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VjcmV0Jyk7XG4gICAgaWYgKCF1cmwudXNlcm5hbWUgJiYgIXVybC5wYXNzd29yZCAmJiAhdXJsLmhhc2ggJiYgbmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm4gcmVsYXk7XG4gICAgdXJsLnVzZXJuYW1lID0gJyc7XG4gICAgdXJsLnBhc3N3b3JkID0gJyc7XG4gICAgdXJsLmhhc2ggPSAnJztcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKG5hbWUpO1xuICAgIHJldHVybiB1cmwuaHJlZjtcbn1cblxuLyoqXG4gKiBEb2VzIHRoaXMgY29ubmVjdGlvbiBzdHJpbmcgY2FycnkgYSBzZWNyZXQgcmVkYWN0QnVua2VyVXJsIHdvdWxkIHJlbW92ZSwgaW4gaXRzXG4gKiBgc2VjcmV0YCBwYXJhbSBvciBpbnNpZGUgYSByZWxheSB2YWx1ZT8gTmV2ZXIgdGhyb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyVXJsSGFzU2VjcmV0KHVybCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgc2VjcmV0LCByZWxheXMgfSA9IHBhcnNlQnVua2VyVXJsKHVybCk7XG4gICAgICAgIHJldHVybiAhIXNlY3JldCB8fCByZWxheXMuc29tZShyZWxheSA9PiBjbGVhblJlbGF5KHJlbGF5KSAhPT0gcmVsYXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5jb25zdCBlbmNvZGVSZWxheSA9IChyZWxheSkgPT5cbiAgICBlbmNvZGVVUklDb21wb25lbnQocmVsYXkpLnJlcGxhY2UoLyUzQS9nLCAnOicpLnJlcGxhY2UoLyUyRi9nLCAnLycpO1xuXG4vKipcbiAqIFRoZSBzaWduZXIncyBhZGRyZXNzIGFsb25lOiBidW5rZXI6Ly88cHVia2V5Pj9yZWxheT0uLi4mcmVsYXk9Li4uXG4gKiBSZWJ1aWx0IGZyb20gdGhlIHBhcnNlZCBmaWVsZHMsIHNvIG9mIHRoZSBjb25uZWN0aW9uIHN0cmluZyBvbmx5IHRoZSBwdWJrZXkgYW5kXG4gKiB0aGUgcmVsYXkgdmFsdWVzIHN1cnZpdmUuIEVhY2ggcmVsYXkgdmFsdWUgbG9zZXMgaXRzIHVzZXJpbmZvLCBgc2VjcmV0YCBwYXJhbVxuICogYW5kIGZyYWdtZW50LCBhbmQga2VlcHMgYW55IG90aGVyIHF1ZXJ5IHBhcmFtcyBpdCBoYXMuXG4gKlxuICogQHBhcmFtIHsqfSB1cmwgYSBjb25uZWN0aW9uIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxuICogQHJldHVybnMge3N0cmluZ30gdGhlIGFkZHJlc3MsIG9yICcnIGlmIGB1cmxgIGlzIG5vdCBhIHZhbGlkIGNvbm5lY3Rpb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWRhY3RCdW5rZXJVcmwodXJsKSB7XG4gICAgbGV0IHBhcnNlZDtcbiAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBwYXJzZUJ1bmtlclVybCh1cmwpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0IHJlbGF5cyA9IHBhcnNlZC5yZWxheXMubWFwKHJlbGF5ID0+IGByZWxheT0ke2VuY29kZVJlbGF5KGNsZWFuUmVsYXkocmVsYXkpKX1gKS5qb2luKCcmJyk7XG4gICAgcmV0dXJuIGBidW5rZXI6Ly8ke3BhcnNlZC5yZW1vdGVQdWJrZXl9PyR7cmVsYXlzfWA7XG59XG5cbi8qKlxuICogVGhlIHNhbWUgcHJvZmlsZSBsaXN0IHdpdGggZWFjaCBidW5rZXJVcmwgcmVkdWNlZCB0byBpdHMgYWRkcmVzcy5cbiAqXG4gKiBAcGFyYW0geyp9IHByb2ZpbGVzIGEgcHJvZmlsZSBsaXN0OyBhbnl0aGluZyBlbHNlIGlzIHJldHVybmVkIGFzIGl0IGlzXG4gKiBAcmV0dXJucyB0aGUgc2FtZSBsaXN0IHdoZW4gbm90aGluZyBuZWVkZWQgY2hhbmdpbmcsIHNvIGEgY2FsbGVyIGNhbiBza2lwIGFcbiAqICAgICAgICAgIHdyaXRlIGJ5IGNvbXBhcmluZyByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWRhY3RQcm9maWxlcyhwcm9maWxlcykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9maWxlcykpIHJldHVybiBwcm9maWxlcztcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGNsZWFuID0gcHJvZmlsZXMubWFwKChwcm9maWxlKSA9PiB7XG4gICAgICAgIGlmICghcHJvZmlsZT8uYnVua2VyVXJsKSByZXR1cm4gcHJvZmlsZTtcbiAgICAgICAgY29uc3QgYnVua2VyVXJsID0gcmVkYWN0QnVua2VyVXJsKHByb2ZpbGUuYnVua2VyVXJsKTtcbiAgICAgICAgaWYgKGJ1bmtlclVybCA9PT0gcHJvZmlsZS5idW5rZXJVcmwpIHJldHVybiBwcm9maWxlO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHsgLi4ucHJvZmlsZSwgYnVua2VyVXJsIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNoYW5nZWQgPyBjbGVhbiA6IHByb2ZpbGVzO1xufVxuXG4vKipcbiAqIFN0b3JlZCBzZXNzaW9ucyBhcmUga2V5ZWQgYnkgcHJvZmlsZSBwb3NpdGlvbi4gUmVtb3ZpbmcgYSBwcm9maWxlIHRha2VzIGl0c1xuICogc2Vzc2lvbiB3aXRoIGl0IGFuZCBtb3ZlcyBsYXRlciBzZXNzaW9ucyBkb3duIHdpdGggdGhlaXIgcHJvZmlsZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCAqPn0gYnVua2VyU2Vzc2lvbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSByZW1vdmVkSW5kZXhcbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclNlc3Npb25zQWZ0ZXJEZWxldGUoYnVua2VyU2Vzc2lvbnMsIHJlbW92ZWRJbmRleCkge1xuICAgIGNvbnN0IHNoaWZ0ZWQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtwb3NpdGlvbiwgc2Vzc2lvbl0gb2YgT2JqZWN0LmVudHJpZXMoYnVua2VyU2Vzc2lvbnMgfHwge30pKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyKHBvc2l0aW9uKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSByZW1vdmVkSW5kZXgpIGNvbnRpbnVlO1xuICAgICAgICBzaGlmdGVkW2luZGV4ID4gcmVtb3ZlZEluZGV4ID8gaW5kZXggLSAxIDogaW5kZXhdID0gc2Vzc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIHNoaWZ0ZWQ7XG59XG5cbi8qKlxuICogVGhlIHNhbWUsIGZvciBhbnkgY2hhbmdlIG9mIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0PHN0cmluZywgKj59IGJ1bmtlclNlc3Npb25zXG4gKiBAcGFyYW0ge0FycmF5PFtudW1iZXIsID9udW1iZXJdPn0gbW92ZXMgZWFjaCBwcm9maWxlIHRoYXQgbW92ZWQsIGFuZCB0byB3aGVyZTsgbnVsbCBpZiBnb25lXG4gKiBAcmV0dXJucyB7T2JqZWN0PHN0cmluZywgKj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJTZXNzaW9uc0FmdGVyTW92ZXMoYnVua2VyU2Vzc2lvbnMsIG1vdmVzKSB7XG4gICAgY29uc3QgbW92ZWQgPSBuZXcgTWFwKG1vdmVzKTtcbiAgICBjb25zdCBwbGFjZWQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtwb3NpdGlvbiwgc2Vzc2lvbl0gb2YgT2JqZWN0LmVudHJpZXMoYnVua2VyU2Vzc2lvbnMgfHwge30pKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyKHBvc2l0aW9uKTtcbiAgICAgICAgY29uc3QgdG8gPSBtb3ZlZC5oYXMoaW5kZXgpID8gbW92ZWQuZ2V0KGluZGV4KSA6IGluZGV4O1xuICAgICAgICBpZiAodG8gIT09IG51bGwpIHBsYWNlZFt0b10gPSBzZXNzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gcGxhY2VkO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1DQSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsWUFDeEQsT0FBTztBQUNILHNCQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQU07QUFBQSxZQUNuRDtBQUFBLFVBQ0o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQTlEQSxNQWdCTSxVQWFBLFVBdUNBO0FBcEVOO0FB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QUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNwRCxjQUFNLE1BQU0sSUFBSSxRQUFRLE9BQU8sd0JBQXdCO0FBQ3ZELGVBQU8sS0FBSyxLQUFLLGtCQUFrQjtBQUFBLE1BQ3ZDLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFFQSxRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBRS9CLFFBQUk7QUFDQSxZQUFNLFNBQVMsTUFBTSxJQUFJLFFBQVEsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDeEUsWUFBTSxZQUFZLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RELFNBQVMsR0FBRztBQUNSLGNBQVEsS0FBSyxrQ0FBa0MsRUFBRSxPQUFPO0FBQ3hELFlBQU0sWUFBWSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDNUM7QUFFQSxRQUFJO0FBQ0EsWUFBTSxZQUFZLE1BQU0sY0FBYztBQUFBLElBQzFDLFNBQVMsR0FBRztBQUNSLGNBQVEsTUFBTSxxQ0FBcUMsRUFBRSxPQUFPO0FBQzVELFlBQU0sWUFBWSxDQUFDO0FBQUEsSUFDdkI7QUFFQSxlQUFXO0FBQ1gsV0FBTztBQUVQLFFBQUksVUFBVSxHQUFHO0FBQ2IsVUFBSTtBQUNBLGNBQU0sUUFBUTtBQUFBLE1BQ2xCLFNBQVMsR0FBRztBQUNSLGdCQUFRLEtBQUssd0JBQXdCLEVBQUUsT0FBTztBQUFBLE1BQ2xEO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsTUFBTSxVQUFVLElBQUksQ0FBQzsiLAogICJuYW1lcyI6IFsidGFyZ2V0IiwgImluaXQiLCAiSVZfQllURVMiLCAiSVZfQllURVMiLCAib3BlbkRCIiwgImFwaSIsICJJVl9CWVRFUyIsICJzdG9yYWdlIl0KfQo=
