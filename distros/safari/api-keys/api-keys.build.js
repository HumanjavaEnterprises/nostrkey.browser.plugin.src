(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
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

  // src/utilities/browser-polyfill.js
  init_process();
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

  // src/utilities/sync-manager.js
  init_process();

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
  var _memoryDeviceKey = null;
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
  async function getDeviceKey() {
    if (_deviceKeyPromise) return _deviceKeyPromise;
    _deviceKeyPromise = (async () => {
      if (!indexedDbAvailable()) {
        if (!_memoryDeviceKey) _memoryDeviceKey = await generateDeviceKey();
        return _memoryDeviceKey;
      }
      const { openDB: openDB2 } = await Promise.resolve().then(() => (init_build(), build_exports));
      const db = await openDB2(DEVICE_DB, 1, {
        upgrade(d) {
          if (!d.objectStoreNames.contains(DEVICE_STORE)) {
            d.createObjectStore(DEVICE_STORE);
          }
        }
      });
      let key = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
      if (!key) {
        key = await generateDeviceKey();
        await db.put(DEVICE_STORE, key, DEVICE_KEY_ID);
      }
      return key;
    })();
    return _deviceKeyPromise;
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
  async function decryptWithDeviceKey(encryptedData) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const key = await getDeviceKey();
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(base64ToAb(iv)) },
      key,
      base64ToAb(ciphertext)
    );
    return new TextDecoder().decode(plainBuf);
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
      return { ...key, secret: "" };
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
    for (const [id, key] of Object.entries(store.keys)) {
      keys[id] = await decryptKey(key);
    }
    return keys;
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
        const displaySecret = revealed ? escapeHtml(key.secret) : escapeHtml(maskSecret(key.secret));
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
    const keys = await exportStore();
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
    showToast("Exported");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2lkYi9idWlsZC9pbmRleC5qcyIsICIuLi8uLi8uLi9zcmMvYXBpLWtleXMvYXBpLWtleXMuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcbmltcG9ydCB7XG4gICAgZ2V0QXBpS2V5U3RvcmUsXG4gICAgc2F2ZUFwaUtleSxcbiAgICBkZWxldGVBcGlLZXksXG4gICAgbGlzdEFwaUtleXMsXG4gICAgc2V0U3luY0VuYWJsZWQsXG4gICAgaXNTeW5jRW5hYmxlZCxcbiAgICB1cGRhdGVTdG9yZVN5bmNTdGF0ZSxcbiAgICBleHBvcnRTdG9yZSxcbiAgICBpbXBvcnRTdG9yZSxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBrZXlzOiBbXSxcbiAgICBuZXdMYWJlbDogJycsXG4gICAgbmV3U2VjcmV0OiAnJyxcbiAgICBlZGl0aW5nSWQ6IG51bGwsXG4gICAgZWRpdExhYmVsOiAnJyxcbiAgICBlZGl0U2VjcmV0OiAnJyxcbiAgICBjb3BpZWRJZDogbnVsbCxcbiAgICByZXZlYWxlZElkOiBudWxsLFxuICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgdG9hc3Q6ICcnLFxuICAgIHJlbGF5SW5mbzogeyByZWFkOiBbXSwgd3JpdGU6IFtdIH0sXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gaGFzUmVsYXlzKCkge1xuICAgIHJldHVybiBzdGF0ZS5yZWxheUluZm8ucmVhZC5sZW5ndGggPiAwIHx8IHN0YXRlLnJlbGF5SW5mby53cml0ZS5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBzb3J0ZWRLZXlzKCkge1xuICAgIHJldHVybiBbLi4uc3RhdGUua2V5c10uc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBtYXNrU2VjcmV0KHNlY3JldCkge1xuICAgIGlmICghc2VjcmV0KSByZXR1cm4gJyc7XG4gICAgaWYgKHNlY3JldC5sZW5ndGggPD0gOCkgcmV0dXJuICdcXHUyMDIyJy5yZXBlYXQoc2VjcmV0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHNlY3JldC5zbGljZSgwLCA0KSArICdcXHUyMDIyJy5yZXBlYXQoNCkgKyBzZWNyZXQuc2xpY2UoLTQpO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuIHN0YXRlLnN5bmNFbmFibGVkID8gJ2xlZC0tZ3JlZW4nIDogJ2xlZC0tb2ZmJztcbiAgICBpZiAoc3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnbGVkLS1hbWJlciBhbmltYXRlLXB1bHNlJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnU3luY2VkJyA6ICdMb2NhbCBvbmx5Jztcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBzeW5jVG9nZ2xlID0gJCgnc3luYy10b2dnbGUnKTtcbiAgICBjb25zdCBrZXlDb3VudCA9ICQoJ2tleS1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGxlZCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKSB8fCAhc3RhdGUuc3luY0VuYWJsZWQ7XG4gICAgaWYgKHN5bmNUb2dnbGUpIHN5bmNUb2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcoc3RhdGUuc3luY0VuYWJsZWQpKTtcbiAgICBpZiAoa2V5Q291bnQpIGtleUNvdW50LnRleHRDb250ZW50ID0gc3RhdGUua2V5cy5sZW5ndGggKyAnIGtleScgKyAoc3RhdGUua2V5cy5sZW5ndGggIT09IDEgPyAncycgOiAnJyk7XG5cbiAgICAvLyBLZXkgdGFibGVcbiAgICBjb25zdCBrZXlUYWJsZUNvbnRhaW5lciA9ICQoJ2tleS10YWJsZS1jb250YWluZXInKTtcbiAgICBjb25zdCBub0tleXNNc2cgPSAkKCduby1rZXlzJyk7XG4gICAgY29uc3Qga2V5VGFibGVCb2R5ID0gJCgna2V5LXRhYmxlLWJvZHknKTtcblxuICAgIGlmIChrZXlUYWJsZUNvbnRhaW5lcikga2V5VGFibGVDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID4gMCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKG5vS2V5c01zZykgbm9LZXlzTXNnLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5rZXlzLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBpZiAoa2V5VGFibGVCb2R5KSB7XG4gICAgICAgIGNvbnN0IHNvcnRlZCA9IHNvcnRlZEtleXMoKTtcbiAgICAgICAga2V5VGFibGVCb2R5LmlubmVySFRNTCA9IHNvcnRlZC5tYXAoa2V5ID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5lZGl0aW5nSWQgPT09IGtleS5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUgaXMtbGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1oZWFkZXJcIj5FZGl0IGtleTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1ib2R5IGZsZXggZmxleC1jb2wgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucy1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJLZXkgbGFiZWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtbGFiZWw9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0TGFiZWwpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucy1pbnB1dCBtb25vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlbGxjaGVjaz1cImZhbHNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlNlY3JldCBrZXlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtc2VjcmV0PVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdFNlY3JldCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGdhcC0yIGp1c3RpZnktZW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1naG9zdCBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXByaW1hcnkgYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmV2ZWFsZWQgPSBzdGF0ZS5yZXZlYWxlZElkID09PSBrZXkuaWQ7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5U2VjcmV0ID0gcmV2ZWFsZWQgPyBlc2NhcGVIdG1sKGtleS5zZWNyZXQpIDogZXNjYXBlSHRtbChtYXNrU2VjcmV0KGtleS5zZWNyZXQpKTtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlMYWJlbCA9IHN0YXRlLmNvcGllZElkID09PSBrZXkuaWQgPyAnQ29waWVkIScgOiAnQ29weSc7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUke3JldmVhbGVkID8gJyBpcy1saXZlJyA6ICcnfVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicGF0Y2gtcG9pbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD1cIiR7cmV2ZWFsZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIiR7cmV2ZWFsZWQgPyAnSGlkZSBzZWNyZXQnIDogJ1JldmVhbCBzZWNyZXQnfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIiR7cmV2ZWFsZWQgPyAnSGlkZScgOiAnUmV2ZWFsJ30gc2VjcmV0IGZvciAke2VzY2FwZUF0dHIoa2V5LmxhYmVsKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwicGF0Y2gtamFja1wiPjwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0wLjUgbWluLXctMCBmbGV4LTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtc20gZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciBob3Zlcjp1bmRlcmxpbmVcIiBkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiIHRpdGxlPVwiRWRpdCBrZXlcIj4ke2VzY2FwZUh0bWwoa2V5LmxhYmVsKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtb25vIHRleHQteHMgJHtyZXZlYWxlZCA/ICcnIDogJ2lucy1tdXRlZCAnfWlucy10cnVuY2F0ZSBjdXJzb3ItcG9pbnRlclwiIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtkaXNwbGF5U2VjcmV0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyb3ctdmFsdWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJjb3B5LXNlY3JldFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtjb3B5TGFiZWx9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXNtIGJ0bi0tZGVzdHJ1Y3RpdmVcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj5EZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICB9KS5qb2luKCcnKTtcblxuICAgICAgICAvLyBCaW5kIHRhYmxlIGV2ZW50c1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic3RhcnQtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzdGFydEVkaXQoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXRlLnJldmVhbGVkSWQgPSBzdGF0ZS5yZXZlYWxlZElkID09PSBlbC5kYXRhc2V0LmtleUlkID8gbnVsbCA6IGVsLmRhdGFzZXQua2V5SWQ7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjb3B5LXNlY3JldFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBjb3B5U2VjcmV0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGRlbGV0ZUtleShlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic2F2ZS1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVFZGl0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYW5jZWxFZGl0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBlZGl0IGlucHV0IGV2ZW50c1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1sYWJlbF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuZWRpdExhYmVsID0gZS50YXJnZXQudmFsdWU7IH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgc2F2ZUVkaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBjYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1lZGl0LXNlY3JldF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuZWRpdFNlY3JldCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCBrZXkgZm9ybVxuICAgIGNvbnN0IG5ld0xhYmVsSW5wdXQgPSAkKCduZXctbGFiZWwnKTtcbiAgICBjb25zdCBuZXdTZWNyZXRJbnB1dCA9ICQoJ25ldy1zZWNyZXQnKTtcbiAgICBjb25zdCBhZGRLZXlCdG4gPSAkKCdhZGQta2V5LWJ0bicpO1xuXG4gICAgaWYgKG5ld0xhYmVsSW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3TGFiZWxJbnB1dCkgbmV3TGFiZWxJbnB1dC52YWx1ZSA9IHN0YXRlLm5ld0xhYmVsO1xuICAgIGlmIChuZXdTZWNyZXRJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBuZXdTZWNyZXRJbnB1dCkgbmV3U2VjcmV0SW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdTZWNyZXQ7XG4gICAgaWYgKGFkZEtleUJ0bikge1xuICAgICAgICBhZGRLZXlCdG4uZGlzYWJsZWQgPSBzdGF0ZS5zYXZpbmcgfHwgc3RhdGUubmV3TGFiZWwudHJpbSgpLmxlbmd0aCA9PT0gMCB8fCBzdGF0ZS5uZXdTZWNyZXQudHJpbSgpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgYWRkS2V5QnRuLnRleHRDb250ZW50ID0gc3RhdGUuc2F2aW5nID8gJ1NhdmluZy4uLicgOiAnU2F2ZSc7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbi8vIC0tLSBDUlVEIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBhZGRLZXkoKSB7XG4gICAgY29uc3QgbGFiZWwgPSBzdGF0ZS5uZXdMYWJlbC50cmltKCk7XG4gICAgY29uc3Qgc2VjcmV0ID0gc3RhdGUubmV3U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIHN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBjb25zdCBpZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgYXdhaXQgc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgc3RhdGUubmV3TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5uZXdTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHN0YXRlLnNhdmluZyA9IGZhbHNlO1xuICAgIHNob3dUb2FzdCgnS2V5IGFkZGVkJyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RWRpdChpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IGtleS5pZDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSBrZXkubGFiZWw7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9IGtleS5zZWNyZXQ7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVFZGl0KCkge1xuICAgIGlmICghc3RhdGUuZWRpdGluZ0lkKSByZXR1cm47XG4gICAgY29uc3QgbGFiZWwgPSBzdGF0ZS5lZGl0TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLmVkaXRTZWNyZXQudHJpbSgpO1xuICAgIGlmICghbGFiZWwgfHwgIXNlY3JldCkgcmV0dXJuO1xuXG4gICAgYXdhaXQgc2F2ZUFwaUtleShzdGF0ZS5lZGl0aW5nSWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdExhYmVsID0gJyc7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc2hvd1RvYXN0KCdLZXkgdXBkYXRlZCcpO1xufVxuXG5mdW5jdGlvbiBjYW5jZWxFZGl0KCkge1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdExhYmVsID0gJyc7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9ICcnO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVLZXkoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6IGBEZWxldGUgXCIke2tleS5sYWJlbH1cIj9gLCBib2R5OiAnVGhlIHN0b3JlZCBzZWNyZXQgaXMgcmVtb3ZlZCBmcm9tIHlvdXIgZW5jcnlwdGVkIHZhdWx0LicsIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZSBrZXknLCBkZXN0cnVjdGl2ZTogdHJ1ZSB9KSkpIHJldHVybjtcblxuICAgIGF3YWl0IGRlbGV0ZUFwaUtleShpZCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSBkZWxldGVkJyk7XG59XG5cbi8vIC0tLSBDbGlwYm9hcmQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlTZWNyZXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChrZXkuc2VjcmV0KTtcbiAgICBzdGF0ZS5jb3BpZWRJZCA9IGlkO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5jb3BpZWRJZCA9IG51bGw7IHJlbmRlcigpOyB9LCAyMDAwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoJycpLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9LCAzMDAwMCk7XG59XG5cbi8vIC0tLSBTeW5jIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoVG9SZWxheSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldEFwaUtleVN0b3JlKCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBrZXlzOiBzdG9yZS5rZXlzIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdhcGlrZXlzLmZldGNoJyB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IHN0b3JlLmtleXM7XG4gICAgICAgICAgICBjb25zdCBsb2NhbENvdW50ID0gT2JqZWN0LmtleXMobG9jYWxLZXlzKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChsb2NhbENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3RvcmUucmVsYXlDcmVhdGVkQXQgfHwgcmVzdWx0LmNyZWF0ZWRBdCA+IHN0b3JlLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVTeW5jKCkge1xuICAgIGF3YWl0IHNldFN5bmNFbmFibGVkKHN0YXRlLnN5bmNFbmFibGVkKTtcbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuLy8gLS0tIEltcG9ydCAvIEV4cG9ydCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gYXdhaXQgZXhwb3J0U3RvcmUoKTtcbiAgICBjb25zdCBwbGFpblRleHQgPSBKU09OLnN0cmluZ2lmeShrZXlzLCBudWxsLCAyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2FwaWtleXMuZW5jcnlwdCcsXG4gICAgICAgIHBheWxvYWQ6IHsgcGxhaW5UZXh0IH0sXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgIHNob3dUb2FzdCgnRXhwb3J0IGZhaWxlZDogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoXG4gICAgICAgIFtKU09OLnN0cmluZ2lmeSh7IGVuY3J5cHRlZDogdHJ1ZSwgZGF0YTogcmVzdWx0LmNpcGhlclRleHQgfSldLFxuICAgICAgICB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICk7XG4gICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuaHJlZiA9IHVybDtcbiAgICBhLmRvd25sb2FkID0gJ25vc3Rya2V5LWFwaS1rZXlzLWJhY2t1cC5qc29uJztcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIHNob3dUb2FzdCgnRXhwb3J0ZWQnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0S2V5cyhldmVudCkge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBmaWxlLnRleHQoKTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh0ZXh0KTtcblxuICAgICAgICBsZXQga2V5cztcbiAgICAgICAgaWYgKHBhcnNlZC5lbmNyeXB0ZWQgJiYgcGFyc2VkLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAnYXBpa2V5cy5kZWNyeXB0JyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGNpcGhlclRleHQ6IHBhcnNlZC5kYXRhIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzaG93VG9hc3QoJ0RlY3J5cHQgZmFpbGVkOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXlzID0gSlNPTi5wYXJzZShyZXN1bHQucGxhaW5UZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBwYXJzZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShrZXlzKTtcbiAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICAgICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnRlZCAnICsgT2JqZWN0LmtleXMoa2V5cykubGVuZ3RoICsgJyBrZXlzJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydCBmYWlsZWQ6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnO1xufVxuXG4vLyAtLS0gRXZlbnQgYmluZGluZyAtLS1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAkKCdzeW5jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN5bmNBbGwpO1xuICAgICQoJ2FkZC1rZXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYWRkS2V5KTtcbiAgICAkKCdleHBvcnQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXhwb3J0S2V5cyk7XG4gICAgJCgnaW1wb3J0LWZpbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgaW1wb3J0S2V5cyk7XG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xuXG4gICAgJCgnc3luYy10b2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHN0YXRlLnN5bmNFbmFibGVkID0gIXN0YXRlLnN5bmNFbmFibGVkO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgdG9nZ2xlU3luYygpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LWxhYmVsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubmV3TGFiZWwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCduZXctc2VjcmV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubmV3U2VjcmV0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzaG93R2F0ZShnYXRlLCBtYWluLCB7IHRpdGxlLCBtZXNzYWdlLCBidXR0b24gfSkge1xuICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgY29uc3QgdCA9ICQoJ2dhdGUtdGl0bGUnKTsgaWYgKHQgJiYgdGl0bGUpIHQudGV4dENvbnRlbnQgPSB0aXRsZTtcbiAgICBjb25zdCBtID0gJCgnZ2F0ZS1tZXNzYWdlJyk7IGlmIChtICYmIG1lc3NhZ2UpIG0udGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICAgIGNvbnN0IGIgPSAkKCdnYXRlLXNlY3VyaXR5LWJ0bicpOyBpZiAoYiAmJiBidXR0b24pIGIudGV4dENvbnRlbnQgPSBidXR0b247XG4gICAgYj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaS5ydW50aW1lLmdldFVSTCgnc2VjdXJpdHkvc2VjdXJpdHkuaHRtbCcpO1xuICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gR2F0ZTogcmVxdWlyZSBtYXN0ZXIgcGFzc3dvcmQgQU5EIGFuIHVubG9ja2VkIHNlc3Npb24gYmVmb3JlIHJlbmRlcmluZy5cbiAgICBjb25zdCBpc0VuY3J5cHRlZCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzRW5jcnlwdGVkJyB9KTtcbiAgICBjb25zdCBsb2NrZWQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdpc0xvY2tlZCcgfSk7XG4gICAgY29uc3QgZ2F0ZSA9ICQoJ3ZhdWx0LWxvY2tlZC1nYXRlJyk7XG4gICAgY29uc3QgbWFpbiA9ICQoJ3ZhdWx0LW1haW4tY29udGVudCcpO1xuXG4gICAgaWYgKCFpc0VuY3J5cHRlZCkge1xuICAgICAgICAvLyBObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IHlldCBcdTIwMTQgZGV2aWNlLWtleSBlbmNyeXB0aW9uIGlzIGFjdGl2ZSBidXQgdGhlXG4gICAgICAgIC8vIHZhdWx0IFVJIHN0aWxsIGFza3MgdGhlIHVzZXIgdG8gc2V0IGEgcGFzc3dvcmQgZmlyc3QuXG4gICAgICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgICAgICBzaG93R2F0ZShnYXRlLCBtYWluLCB7fSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobG9ja2VkKSB7XG4gICAgICAgIC8vIEY1OiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgcmVmdXNlIHRvIHJlYWQvcmVuZGVyIGFueSBBUEkta2V5IHNlY3JldC5cbiAgICAgICAgc2V0VW5sb2NrZWQoZmFsc2UpO1xuICAgICAgICBzaG93R2F0ZShnYXRlLCBtYWluLCB7XG4gICAgICAgICAgICB0aXRsZTogJ1ZhdWx0IExvY2tlZCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVW5sb2NrIE5vc3RyS2V5IHdpdGggeW91ciBtYXN0ZXIgcGFzc3dvcmQgdG8gdmlldyB5b3VyIEFQSSBrZXlzLicsXG4gICAgICAgICAgICBidXR0b246ICdVbmxvY2snLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICBjb25zdCByZWxheXMgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd2YXVsdC5nZXRSZWxheXMnIH0pO1xuICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgIi8qKlxuICogaW5zLWNvbmZpcm0uanMgXHUyMDE0IHRoZSBzaGFyZWQgY29uc2VudCBvdmVybGF5IGZvciBleHRlbnNpb24gcGFnZXMuXG4gKlxuICogT25lIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb25zZW50LXN1cmZhY2Ugc3RhbmRhcmQ6IGEgZGltbWVkIGJhY2tkcm9wIHBsdXNcbiAqIGVpdGhlciBhIGJvdHRvbSBTSEVFVCAoZGVmYXVsdDsgZGVzdHJ1Y3RpdmUgLyBpcnJldmVyc2libGUgYWN0cykgb3IgYVxuICogY2VudGVyZWQgUE9QT1ZFUiAobG93LXN0YWtlcywgcmV2ZXJzaWJsZSBhY3RzKS4gUmVwbGFjZXMgbmF0aXZlXG4gKiBjb25maXJtKCkvYWxlcnQoKSBvbiBldmVyeSBleHRlbnNpb24tcGFnZSBzdXJmYWNlLlxuICpcbiAqICAgaW5zQ29uZmlybSh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8Ym9vbGVhbj4gICAodHJ1ZSA9IGNvbmZpcm1lZDsgRXNjYXBlL2JhY2tkcm9wL2NhbmNlbCA9IGZhbHNlKVxuICogICBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsIH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTx2b2lkPlxuICpcbiAqIFN0eWxpbmcgY29tZXMgZW50aXJlbHkgZnJvbSBpbnN0cnVtZW50LmNzcyAoc2VjdGlvbiAxOCArIHRoZSAuYnRuIGZhbWlseSksXG4gKiBzbyBza2luIC8gbW9kZSAvIGNvbnRyYXN0IC8gZGVuc2l0eSAvIHRleHQtc2l6ZSBhcnJpdmUgdmlhIHRoZSBwYWdlJ3NcbiAqIHN0YW1wZWQgZGF0YS1pbnMtKiBhdHRyaWJ1dGVzIFx1MjAxNCBubyBzdG9yYWdlIGFjY2Vzcywgbm8gbWVzc2FnaW5nIGhlcmUuXG4gKlxuICogU2FmZXR5OiB0aXRsZS9ib2R5IG1heSBjb250YWluIHVzZXIgZGF0YSAoa2V5IGxhYmVscywgdmF1bHQgcGF0aHMpOyB0aGUgRE9NXG4gKiBpcyBidWlsdCB3aXRoIGNyZWF0ZUVsZW1lbnQgKyB0ZXh0Q29udGVudCBPTkxZIFx1MjAxNCBuZXZlciBpbm5lckhUTUwuXG4gKi9cblxuLy8gU2VyaWFsaXplIG92ZXJsYXBwaW5nIGNhbGxzIHNvIGEgc2Vjb25kIGRpYWxvZyBuZXZlciBkb3VibGUtcmVuZGVycyBvbiB0b3Bcbi8vIG9mIChvciBpbnRlcmxlYXZlcyB3aXRoKSBhbiBvcGVuIG9uZS5cbmxldCBxdWV1ZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5sZXQgaWRDb3VudGVyID0gMDtcblxuZnVuY3Rpb24gbW90aW9uT2ZmKCkge1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWlucy1tb3Rpb24nKSA9PT0gJ29mZicpIHJldHVybiB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKS5tYXRjaGVzO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBCdWlsZCwgc2hvdyBhbmQgc2V0dGxlIG9uZSBkaWFsb2cuIFJlc29sdmVzIHRydWUgKGNvbmZpcm0pIG9yIGZhbHNlXG4gKiAoY2FuY2VsIC8gRXNjYXBlIC8gYmFja2Ryb3AgY2xpY2spLlxuICovXG5mdW5jdGlvbiBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2UgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcm9vdC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtcm9vdCc7XG5cbiAgICAgICAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJhY2tkcm9wJztcblxuICAgICAgICBjb25zdCBpc1NoZWV0ID0gdmFyaWFudCAhPT0gJ3BvcG92ZXInO1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTmFtZSA9IGlzU2hlZXQgPyAnaW5zLWNvbnNlbnQtc2hlZXQnIDogJ2lucy1jb25zZW50LXBvcG92ZXInO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdyb2xlJywgKGRlc3RydWN0aXZlIHx8IG5vdGljZSkgPyAnYWxlcnRkaWFsb2cnIDogJ2RpYWxvZycpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgJ3RydWUnKTtcblxuICAgICAgICBpZiAoaXNTaGVldCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBoYW5kbGUuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWhhbmRsZSc7XG4gICAgICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoaGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVpZCA9ICsraWRDb3VudGVyO1xuICAgICAgICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGVFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtdGl0bGUnO1xuICAgICAgICB0aXRsZUVsLmlkID0gYGlucy1jb25zZW50LXRpdGxlLSR7dWlkfWA7XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCB0aXRsZUVsLmlkKTtcblxuICAgICAgICBjb25zdCBib2R5RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGJvZHlFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYm9keSc7XG4gICAgICAgIGJvZHlFbC5pZCA9IGBpbnMtY29uc2VudC1ib2R5LSR7dWlkfWA7XG4gICAgICAgIGJvZHlFbC50ZXh0Q29udGVudCA9IGJvZHkgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChib2R5RWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgYm9keUVsLmlkKTtcblxuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWFjdGlvbnMnO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgbGV0IGNhbmNlbEJ0biA9IG51bGw7XG4gICAgICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29uZmlybUJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNvbmZpcm1CdG4udGV4dENvbnRlbnQgPSBjb25maXJtTGFiZWw7XG4gICAgICAgIGlmIChub3RpY2UpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gJ2J0bic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBjYW5jZWxCdG4uY2xhc3NOYW1lID0gJ2J0biBidG4tLWdob3N0JztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IGNhbmNlbExhYmVsO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9IGRlc3RydWN0aXZlID8gJ2J0biBidG4tLWRlc3RydWN0aXZlJyA6ICdidG4gYnRuLS1wcmltYXJ5JztcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNvbmZpcm1CdG4pO1xuICAgICAgICBidXR0b25zLnB1c2goY29uZmlybUJ0bik7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcblxuICAgICAgICByb290LmFwcGVuZENoaWxkKGJhY2tkcm9wKTtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkaWFsb2cpO1xuXG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIHNldHRsZShyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKSByZXR1cm47XG4gICAgICAgICAgICBzZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Rm9jdXMgJiYgdHlwZW9mIHByZXZGb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJyAmJiBkb2N1bWVudC5jb250YWlucyhwcmV2Rm9jdXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogZm9jdXMgcmVzdG9yZSBpcyBiZXN0LWVmZm9ydCAqLyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtb3Rpb25PZmYoKSkgZmluaXNoKCk7XG4gICAgICAgICAgICBlbHNlIHNldFRpbWVvdXQoZmluaXNoLCAyNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25LZXlkb3duKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgc2V0dGxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnVGFiJykge1xuICAgICAgICAgICAgICAgIC8vIFRyYXAgZm9jdXMgYWNyb3NzIHRoZSBkaWFsb2cncyBidXR0b25zIG9ubHkuXG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBidXR0b25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlyID0gZXYuc2hpZnRLZXkgPyAtMSA6IDE7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1soaWR4ICsgZGlyICsgYnV0dG9ucy5sZW5ndGgpICUgYnV0dG9ucy5sZW5ndGhdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBiYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBpZiAoY2FuY2VsQnRuKSBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgY29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZSh0cnVlKSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocm9vdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgLy8gRGVzdHJ1Y3RpdmUgYWN0cyBzdGFydCBvbiBDYW5jZWwgc28gRW50ZXIgY2FuJ3QgcnVzaCB0aGUgZGVsZXRlO1xuICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlIHN0YXJ0cyBvbiB0aGUgY29uZmlybWluZyBhY3Rpb24uXG4gICAgICAgICAgICBjb25zdCBpbml0aWFsID0gbm90aWNlID8gY29uZmlybUJ0biA6IChkZXN0cnVjdGl2ZSA/IGNhbmNlbEJ0biA6IGNvbmZpcm1CdG4pO1xuICAgICAgICAgICAgKGluaXRpYWwgfHwgY29uZmlybUJ0bikuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNDb25maXJtKHtcbiAgICB0aXRsZSxcbiAgICBib2R5LFxuICAgIGNvbmZpcm1MYWJlbCA9ICdDb25maXJtJyxcbiAgICBjYW5jZWxMYWJlbCA9ICdDYW5jZWwnLFxuICAgIGRlc3RydWN0aXZlID0gZmFsc2UsXG4gICAgdmFyaWFudCA9ICdzaGVldCcsXG59ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZTogZmFsc2UgfSkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCA9ICdPSycgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGNvbmZpcm1MYWJlbDogZGlzbWlzc0xhYmVsLFxuICAgICAgICAgICAgY2FuY2VsTGFiZWw6ICcnLFxuICAgICAgICAgICAgZGVzdHJ1Y3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdmFyaWFudDogJ3NoZWV0JyxcbiAgICAgICAgICAgIG5vdGljZTogdHJ1ZSxcbiAgICAgICAgfSkudGhlbigoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIEFQSSBLZXkgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgQVBJIGtleXNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIGFwaUtleVZhdWx0OiB7XG4gKiAgICAga2V5czoge1xuICogICAgICAgXCI8dXVpZD5cIjogeyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQsIHByb2ZpbGVTY29wZSB9XG4gKiAgICAgfSxcbiAqICAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAqICAgICBldmVudElkOiBudWxsLFxuICogICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICogICAgIHN5bmNTdGF0dXM6IFwic3luY2VkXCIgICAgLy8gc3luY2VkIHwgbG9jYWwtb25seSB8IGNvbmZsaWN0XG4gKiAgIH1cbiAqXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0LCBpc0NpcGhlcnRleHQgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmNvbnN0IFNUT1JBR0VfS0VZID0gJ2FwaUtleVZhdWx0JztcblxuLyoqXG4gKiBEZWNyeXB0IGEga2V5J3MgYHNlY3JldGAgZmllbGQgZm9yIGNhbGxlcnMuIFJlLXRocm93cyBsb2NrIGVycm9ycyBzbyBhIGxvY2tlZFxuICogc2Vzc2lvbiBjYW5ub3QgcmVhZCBzZWNyZXRzIChGNSk7IHRvbGVyYXRlcyBnZW51aW5lIGRlY3J5cHQgZmFpbHVyZXMgKGUuZy4gYVxuICogZGV2aWNlLXdyYXBwZWQgdmFsdWUgc3luY2VkIGZyb20gYW5vdGhlciBkZXZpY2UpIGJ5IHJldHVybmluZyBhbiBlbXB0eSBzZWNyZXRcbiAqIFx1MjAxNCB0aGUgcmVsYXkgc3luYyByZXBvcHVsYXRlcyBpdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdEtleShrZXkpIHtcbiAgICBpZiAoIWtleSkgcmV0dXJuIGtleTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyAuLi5rZXksIHNlY3JldDogYXdhaXQgdW53cmFwU2VjcmV0KGtleS5zZWNyZXQpIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoU3RyaW5nKGUubWVzc2FnZSB8fCAnJykuc3RhcnRzV2l0aCgnbG9ja2VkJykpIHRocm93IGU7XG4gICAgICAgIHJldHVybiB7IC4uLmtleSwgc2VjcmV0OiAnJyB9O1xuICAgIH1cbn1cblxuY29uc3QgREVGQVVMVF9TVE9SRSA9IHtcbiAgICBrZXlzOiB7fSxcbiAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAgICBldmVudElkOiBudWxsLFxuICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICAgIHN5bmNTdGF0dXM6ICdzeW5jZWQnLFxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmUoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXTogREVGQVVMVF9TVE9SRSB9KTtcbiAgICByZXR1cm4geyAuLi5ERUZBVUxUX1NUT1JFLCAuLi5kYXRhW1NUT1JBR0VfS0VZXSB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRTdG9yZShzdG9yZSkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogc3RvcmUgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCBBUEkga2V5IHN0b3JlIG9iamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUtleVN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAga2V5c1tpZF0gPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgfVxuICAgIHJldHVybiB7IC4uLnN0b3JlLCBrZXlzIH07XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIEFQSSBrZXkgYnkgaWQgKHNlY3JldCBkZWNyeXB0ZWQpLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLmtleXNbaWRdID8gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSkgOiBudWxsO1xufVxuXG4vKipcbiAqIFVwc2VydCBhbiBBUEkga2V5LiBDcmVhdGVzIGlmIG5ldywgdXBkYXRlcyBpZiBleGlzdGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFVVSURcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFxuICogQHBhcmFtIHtzdHJpbmd9IHNlY3JldFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBjb25zdCBleGlzdGluZyA9IHN0b3JlLmtleXNbaWRdO1xuICAgIC8vIFQwLTQ6IGVuY3J5cHQgdGhlIHNlY3JldCBiZWZvcmUgaXQgdG91Y2hlcyBzdG9yYWdlLlxuICAgIHN0b3JlLmtleXNbaWRdID0ge1xuICAgICAgICBpZCxcbiAgICAgICAgbGFiZWwsXG4gICAgICAgIHNlY3JldDogYXdhaXQgd3JhcFNlY3JldChzZWNyZXQpLFxuICAgICAgICBjcmVhdGVkQXQ6IGV4aXN0aW5nPy5jcmVhdGVkQXQgfHwgbm93LFxuICAgICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICAgICAgcHJvZmlsZVNjb3BlOiBleGlzdGluZz8ucHJvZmlsZVNjb3BlID8/IG51bGwsXG4gICAgfTtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG4gICAgcmV0dXJuIGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhbiBBUEkga2V5IGJ5IGlkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGRlbGV0ZSBzdG9yZS5rZXlzW2lkXTtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgQVBJIGtleXMgc29ydGVkIGJ5IGxhYmVsIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RBcGlLZXlzKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHRLZXkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBNYXAgb2YgaWQgLT4ga2V5IGRhdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAga2V5c1tpZF0gPSBhd2FpdCBkZWNyeXB0S2V5KGtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIEltcG9ydCBrZXlzIGludG8gdGhlIHN0b3JlIChtZXJnZSBcdTIwMTQgZXhpc3Rpbmcga2V5cyB3aXRoIHNhbWUgaWQgYXJlIG92ZXJ3cml0dGVuKS5cbiAqIEluY29taW5nIHNlY3JldHMgYXJlIHBsYWludGV4dCAoZnJvbSBhIGRlY3J5cHRlZCBiYWNrdXAgb3IgYSByZWxheSBmZXRjaCkgYW5kXG4gKiBhcmUgcmUtd3JhcHBlZCB1bmRlciB0aGlzIGRldmljZSdzIGF0LXJlc3Qga2V5IGJlZm9yZSBzdG9yYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGtleXMgLSBNYXAgb2YgaWQgLT4geyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQgfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW1wb3J0U3RvcmUoa2V5cykge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhrZXlzKSkge1xuICAgICAgICBjb25zdCBzZWNyZXQgPSBpc0NpcGhlcnRleHQoa2V5LnNlY3JldCkgPyBrZXkuc2VjcmV0IDogYXdhaXQgd3JhcFNlY3JldChrZXkuc2VjcmV0KTtcbiAgICAgICAgc3RvcmUua2V5c1tpZF0gPSB7IC4uLmtleSwgc2VjcmV0IH07XG4gICAgfVxuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNDaXBoZXJ0ZXh0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBLZXlzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIHN5bmNlZFxuY29uc3QgRVhDTFVERURfS0VZUyA9IFtcbiAgICAnYnVua2VyU2Vzc2lvbnMnLFxuICAgICdpZ25vcmVJbnN0YWxsSG9vaycsXG4gICAgJ3Bhc3N3b3JkSGFzaCcsXG4gICAgJ3Bhc3N3b3JkU2FsdCcsXG5dO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIFAxX1BST0ZJTEVTOiAxLFxuICAgIFAyX1NFVFRJTkdTOiAyLFxuICAgIFAzX0FQSUtFWVM6IDMsXG4gICAgUDRfVkFVTFQ6IDQsXG59O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgc3luYyBwYXlsb2FkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBsb2NhbCBkYXRhIGFuZCBidWlsZCBhIHByaW9yaXRpc2VkIGxpc3Qgb2YgZW50cmllcyB0byBzeW5jLlxuICogUmV0dXJucyB7IGVudHJpZXM6IFt7IGtleSwganNvblN0cmluZywgcHJpb3JpdHksIHNpemUgfV0sIHRvdGFsU2l6ZSB9XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gVDAtNTogYSBzZWNyZXQgaXMgb25seSBldmVyIGVtaXR0ZWQgdG8gc3RvcmFnZS5zeW5jIChHb29nbGUvaUNsb3VkKSBpZiBpdFxuICAgIC8vIGlzIGFscmVhZHkgYW4gZW5jcnlwdGVkIGJsb2IuIEFueSB2YWx1ZSB0aGF0IGlzIE5PVCBjaXBoZXJ0ZXh0IGlzIHJlZnVzZWRcbiAgICAvLyAoZHJvcHBlZCkgc28gcGxhaW50ZXh0IHByaXZhdGUga2V5cyAvIEFQSSBzZWNyZXRzIC8gbm90ZXMgY2FuIG5ldmVyIGxlYXZlXG4gICAgLy8gdGhlIGRldmljZS4gYCcnYCAoZW1wdHkgLyBidW5rZXIpIGlzIGFsbG93ZWQgdGhyb3VnaCBhcyBub24tc2VjcmV0LlxuICAgIGNvbnN0IHNlY3JldE9rID0gdiA9PiAhdiB8fCBpc0NpcGhlcnRleHQodik7XG5cbiAgICAvLyBQMTogUHJvZmlsZXMgKHN0cmlwIGBob3N0c2AgdG8gc2F2ZSBzcGFjZSkgKyBwcm9maWxlSW5kZXggKyBlbmNyeXB0aW9uIHN0YXRlXG4gICAgaWYgKGFsbC5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBjbGVhblByb2ZpbGVzID0gYWxsLnByb2ZpbGVzLm1hcChwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaG9zdHMsIC4uLnJlc3QgfSA9IHA7XG4gICAgICAgICAgICBpZiAocmVzdC5wcml2S2V5ICYmICFzZWNyZXRPayhyZXN0LnByaXZLZXkpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHByaXZLZXkgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICByZXN0LnByaXZLZXkgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNsZWFuUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChhbGwucHJvZmlsZUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5wcm9maWxlSW5kZXgpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlSW5kZXgnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLmlzRW5jcnlwdGVkICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5pc0VuY3J5cHRlZCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2lzRW5jcnlwdGVkJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQMjogU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrIG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoYWxsW2tdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYWxsKSkge1xuICAgICAgICBpZiAoay5zdGFydHNXaXRoKCdmZWF0dXJlOicpKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFAzOiBBUEkga2V5IHZhdWx0IFx1MjAxNCBvbmx5IHN5bmMga2V5cyB3aG9zZSBzZWNyZXQgaXMgY2lwaGVydGV4dCAoVDAtNSlcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0ICYmIGFsbC5hcGlLZXlWYXVsdC5rZXlzKSB7XG4gICAgICAgIGNvbnN0IHNhZmVLZXlzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGFsbC5hcGlLZXlWYXVsdC5rZXlzKSkge1xuICAgICAgICAgICAgaWYgKHNlY3JldE9rKGtleS5zZWNyZXQpKSB7XG4gICAgICAgICAgICAgICAgc2FmZUtleXNbaWRdID0ga2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgQVBJIHNlY3JldCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYXVsdCA9IHsgLi4uYWxsLmFwaUtleVZhdWx0LCBrZXlzOiBzYWZlS2V5cyB9O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2FmZVZhdWx0KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnYXBpS2V5VmF1bHQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDNfQVBJS0VZUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDQ6IFZhdWx0IGRvY3MgKGluZGl2aWR1YWxseSwgbmV3ZXN0IGZpcnN0KSBcdTIwMTQgb25seSBpZiBjb250ZW50IGlzIGNpcGhlcnRleHRcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgaWYgKCFzZWNyZXRPayhkb2MuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgdmF1bHQgY29udGVudCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBzeW5jIHBheWxvYWQgcmVzcGVjdGluZyBidWRnZXRcbiAgICAgICAgbGV0IHVzZWRCeXRlcyA9IDA7XG4gICAgICAgIGxldCB1c2VkSXRlbXMgPSAwO1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBsZXQgYnVkZ2V0RXhoYXVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoYnVkZ2V0RXhoYXVzdGVkKSBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtWYWx1ZShlbnRyeS5rZXksIGVudHJ5Lmpzb25TdHJpbmcpO1xuICAgICAgICAgICAgbGV0IGVudHJ5U2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgZW50cnlTaXplICs9IGMua2V5Lmxlbmd0aCArICh0eXBlb2YgYy52YWx1ZSA9PT0gJ3N0cmluZycgPyBjLnZhbHVlLmxlbmd0aCA6IEpTT04uc3RyaW5naWZ5KGMudmFsdWUpLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VkQnl0ZXMgKyBlbnRyeVNpemUgPiBTWU5DX1FVT1RBIC0gNTAwIHx8IHVzZWRJdGVtcyArIGNodW5rcy5sZW5ndGggPiBNQVhfSVRFTVMgLSA1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LnByaW9yaXR5IDw9IFBSSU9SSVRZLlAzX0FQSUtFWVMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JpdGljYWwgZGF0YSBcdTIwMTQgdHJ5IGFueXdheSwgbGV0IHRoZSBBUEkgdGhyb3cgaWYgdHJ1bHkgb3ZlclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBCdWRnZXQgZXhoYXVzdGVkIGF0IHByaW9yaXR5ICR7ZW50cnkucHJpb3JpdHl9LCBza2lwcGluZyByZW1haW5pbmcgZW50cmllc2ApO1xuICAgICAgICAgICAgICAgICAgICBidWRnZXRFeGhhdXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBzeW5jUGF5bG9hZFtjLmtleV0gPSBjLnZhbHVlO1xuICAgICAgICAgICAgICAgIGFsbFN5bmNLZXlzLnB1c2goYy5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHN5bmMgbWV0YWRhdGFcbiAgICAgICAgY29uc3QgbWV0YSA9IHtcbiAgICAgICAgICAgIGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBrZXlzOiBhbGxTeW5jS2V5cyxcbiAgICAgICAgfTtcbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeShtZXRhKTtcblxuICAgICAgICAvLyBXcml0ZSB0byBzeW5jIHN0b3JhZ2VcbiAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQoc3luY1BheWxvYWQpO1xuXG4gICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVhZCBleGlzdGluZyBzeW5jIGtleXMgYW5kIHJlbW92ZSBhbnkgbm90IGluIG91ciBwYXlsb2FkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgIGsgIT09IFNZTkNfTUVUQV9LRVkgJiYgIWFsbFN5bmNLZXlzLmluY2x1ZGVzKGspXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKG9ycGhhbktleXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIE5vbi1jcml0aWNhbCBjbGVhbnVwXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHthbGxTeW5jS2V5cy5sZW5ndGh9IGVudHJpZXMgKCR7dXNlZEJ5dGVzfSBieXRlcykgdG8gc3luYyBzdG9yYWdlYCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1c2hUb1N5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIC8vIExvY2FsIHN0b3JhZ2UgaXMgdW5hZmZlY3RlZCBcdTIwMTQgZ3JhY2VmdWwgZGVncmFkYXRpb25cbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVsbCBmcm9tIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGRhdGEgZnJvbSBzeW5jIHN0b3JhZ2UgYW5kIHJldHVybiBhcyBhIHBsYWluIG9iamVjdCB3aXRoXG4gKiByZWFzc2VtYmxlZCBjaHVua2VkIHZhbHVlcy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHVsbEZyb21TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgaWYgKCFyYXcgfHwgT2JqZWN0LmtleXMocmF3KS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGFTdHIgPSByYXdbU1lOQ19NRVRBX0tFWV07XG4gICAgICAgIGlmICghbWV0YVN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG1ldGE7XG4gICAgICAgIHRyeSB7IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFTdHIpOyB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgLy8gQ29sbGVjdCB0aGUgbm9uLWNodW5rLCBub24tbWV0YSBrZXlzXG4gICAgICAgIGNvbnN0IGRhdGFLZXlzID0gbWV0YS5rZXlzLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoQ0hVTktfUFJFRklYKSAmJiBrICE9PSBTWU5DX01FVEFfS0VZKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgcmF3KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5fc3luY01ldGEgPSBtZXRhO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdWxsRnJvbVN5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXJnZSBsb2dpY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogTWVyZ2Ugc3luYyBkYXRhIGludG8gbG9jYWwgc3RvcmFnZSB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb24uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbG9jYWwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIC8vIERldGVjdCBmcmVzaCBpbnN0YWxsOiBubyBwcm9maWxlcywgb3IgYSBzaW5nbGUgdW50b3VjaGVkIGRlZmF1bHQgcHJvZmlsZS5cbiAgICAvLyAoRGVmYXVsdCBrZXlzIGFyZSBub3cgd3JhcHBlZCBhdCByZXN0LCBzbyBgcHJpdktleWAgaXMgdHJ1dGh5IGV2ZW4gb24gYVxuICAgIC8vIGZyZXNoIGluc3RhbGwgXHUyMDE0IGRldGVjdCB0aGUgdW50b3VjaGVkIGRlZmF1bHQgYnkgaXRzIG5hbWUgKyBhYnNlbmNlIG9mIGFueVxuICAgIC8vIHBlci1zaXRlIGdyYW50cyBpbnN0ZWFkLilcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkpIHx8XG4gICAgICAgIChsb25lICYmIGxvbmUubmFtZSA9PT0gJ0RlZmF1bHQgTm9zdHIgUHJvZmlsZScgJiZcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGxvbmUuaG9zdHMgfHwge30pLmxlbmd0aCA9PT0gMCk7XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGluc3RhbGwgXHUyMDE0IGFkb3B0IHN5bmMgcHJvZmlsZXMgZW50aXJlbHlcbiAgICAgICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcztcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAvLyBQZXItaW5kZXggdXBkYXRlZEF0IGNvbXBhcmlzb24gXHUyMDE0IG5ld2VyIHdpbnMsIGxvY2FsIHdpbnMgdGllc1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gWy4uLmxvY2FsLnByb2ZpbGVzXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3luY0RhdGEucHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzeW5jUHJvZmlsZSA9IHN5bmNEYXRhLnByb2ZpbGVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChpID49IG1lcmdlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTmV3IHByb2ZpbGUgZnJvbSBzeW5jXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZC5wdXNoKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzeW5jVGltZSA9IHN5bmNQcm9maWxlLnVwZGF0ZWRBdCB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFRpbWUgPSBsb2NhbFByb2ZpbGUudXBkYXRlZEF0IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeW5jVGltZSA+IGxvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgbWVyZ2UgYnV0IHByZXNlcnZlIGxvY2FsIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRbaV0gPSB7IC4uLnN5bmNQcm9maWxlLCBob3N0czogbG9jYWxQcm9maWxlLmhvc3RzIHx8IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB1cGRhdGVzLnByb2ZpbGVzID0gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGUgaW5kZXggKFAxKSAtLS1cbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZUluZGV4ICE9IG51bGwgJiYgaXNGcmVzaCkge1xuICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleDtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSBcdTIwMTQgbmV2ZXIgZG93bmdyYWRlIC0tLVxuICAgIGlmIChzeW5jRGF0YS5pc0VuY3J5cHRlZCA9PT0gdHJ1ZSAmJiAhbG9jYWwuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgdXBkYXRlcy5pc0VuY3J5cHRlZCA9IHRydWU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc3luY01ldGEgPSBzeW5jRGF0YS5fc3luY01ldGEgfHwge307XG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBoaWdoZXJcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIHN5bmNEYXRhLnZlcnNpb24gPD0gbG9jYWwudmVyc2lvbikgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEFQSSBLZXkgVmF1bHQgKFAzKSAtLS1cbiAgICBpZiAoc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgaWYgKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1lcmdlIGluZGl2aWR1YWwga2V5cyBieSB1cGRhdGVkQXRcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IGxvY2FsLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBzeW5jS2V5cyA9IHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSB7IC4uLmxvY2FsS2V5cyB9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIHN5bmNLZXldIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNLZXlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5ID0gbWVyZ2VkW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsS2V5IHx8IChzeW5jS2V5LnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbEtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkW2lkXSA9IHN5bmNLZXk7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4ubG9jYWwuYXBpS2V5VmF1bHQsIGtleXM6IG1lcmdlZCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCBsb2NhbERvY3MgPSBsb2NhbC52YXVsdERvY3MgfHwge307XG4gICAgbGV0IGRvY3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgbWVyZ2VkRG9jcyA9IHsgLi4ubG9jYWxEb2NzIH07XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbG9jYWxEb2MgPSBtZXJnZWREb2NzW2RvYy5wYXRoXTtcbiAgICAgICAgaWYgKCFsb2NhbERvYyB8fCAoZG9jLnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbERvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgIG1lcmdlZERvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgICAgICAgICAgZG9jc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBTZWNyZXQgVmF1bHQgXHUyMDE0IGF0LXJlc3QgZW5jcnlwdGlvbiBmb3IgcHJpdmF0ZSBrZXlzIGFuZCBhcHBsaWNhdGlvbiBzZWNyZXRzLlxuICpcbiAqIFRocmVhdCBtb2RlbCAoVDAtNCk6IHJhdyBzZWNyZXQgYnl0ZXMgbXVzdCBuZXZlciBzaXQgaW4gYnJvd3NlciBzdG9yYWdlIGluXG4gKiBjbGVhcnRleHQsIGV2ZW4gZm9yIHRoZSBERUZBVUxUIHBhc3N3b3JkbGVzcyB1c2VyLiBUaGlzIG1vZHVsZSBwcm92aWRlcyB0d29cbiAqIHdyYXBwaW5nIHN0cmF0ZWdpZXMgYmVoaW5kIG9uZSBgd3JhcFNlY3JldGAgLyBgdW53cmFwU2VjcmV0YCBpbnRlcmZhY2U6XG4gKlxuICogICAxLiBERVZJQ0UgS0VZIChkZWZhdWx0LCBubyBtYXN0ZXIgcGFzc3dvcmQpIFx1MjAxNCBhIG5vbi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTVxuICogICAgICBDcnlwdG9LZXkgZ2VuZXJhdGVkIHdpdGggYGV4dHJhY3RhYmxlOmZhbHNlYCBhbmQgcGVyc2lzdGVkIGFzIGEgQ3J5cHRvS2V5XG4gKiAgICAgICpoYW5kbGUqIGluIEluZGV4ZWREQi4gVGhlIHJhdyBrZXkgYnl0ZXMgbmV2ZXIgbGVhdmUgdGhlIGJyb3dzZXIncyBrZXlcbiAqICAgICAgc3RvcmUsIHNvIHN0b3JhZ2Ugb25seSBldmVyIGhvbGRzIGNpcGhlcnRleHQgKyBhIGhhbmRsZSB0aGF0IGNhbm5vdCBiZVxuICogICAgICBleHBvcnRlZC4gSW4gZW52aXJvbm1lbnRzIHdpdGhvdXQgSW5kZXhlZERCICh1bml0IHRlc3RzKSB0aGUga2V5IGlzIGhlbGRcbiAqICAgICAgaW4gbWVtb3J5IGZvciB0aGUgbGlmZSBvZiB0aGUgbW9kdWxlLlxuICpcbiAqICAgMi4gU0VTU0lPTiBLRVkgKG1hc3RlciBwYXNzd29yZCBzZXQgKyB1bmxvY2tlZCkgXHUyMDE0IHRoZSBBRVMtMjU2LUdDTSBrZXlcbiAqICAgICAgZGVyaXZlZCBmcm9tIHRoZSBwYXNzd29yZCAoc2VlIGNyeXB0by5qcykuIFNldCBieSB0aGUgYmFja2dyb3VuZCB3b3JrZXJcbiAqICAgICAgb24gdW5sb2NrIHZpYSBgc2V0U2Vzc2lvbktleWAsIGNsZWFyZWQgb24gbG9jayB2aWEgYGNsZWFyU2Vzc2lvbmAuXG4gKlxuICogQmxvYiBmb3JtYXRzIChib3RoIGFyZSBzZWxmLWRlc2NyaWJpbmcgSlNPTiBzdHJpbmdzKTpcbiAqICAgcGFzc3dvcmQgYmxvYiA6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfVxuICogICBkZXZpY2UgIGJsb2IgOiB7IHY6MSwgazpcImRldmljZVwiLCBpdiwgY2lwaGVydGV4dCB9XG4gKlxuICogYHVud3JhcFNlY3JldGAgcmVmdXNlcyB0byBkZWNyeXB0IHdoZW4gdGhlIHNlc3Npb24gaGFzIGJlZW4gZXhwbGljaXRseSBsb2NrZWRcbiAqIChGNS9GNikgc28gYSBsb2NrZWQgcGFnZSBjYW5ub3QgcmVhZCBzZWNyZXRzLlxuICovXG5cbmltcG9ydCB7IGVuY3J5cHRXaXRoS2V5LCBkZWNyeXB0V2l0aEtleSB9IGZyb20gJy4vY3J5cHRvJztcblxuY29uc3QgSVZfQllURVMgPSAxMjtcbmNvbnN0IERFVklDRV9EQiA9ICdub3N0cmtleS1zZWNyZXQtdmF1bHQnO1xuY29uc3QgREVWSUNFX1NUT1JFID0gJ2tleXMnO1xuY29uc3QgREVWSUNFX0tFWV9JRCA9ICdkZXZpY2Utd3JhcC1rZXktdjEnO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgKGtlcHQgbG9jYWwgc28gdGhpcyBtb2R1bGUgaGFzIG5vIGNyb3NzLWRlcHMpIC0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gYWJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VG9BYihiNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gU2Vzc2lvbiAocGFzc3dvcmQtZGVyaXZlZCkga2V5IHN0YXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9zZXNzaW9uS2V5ID0gbnVsbDsgICAvLyBDcnlwdG9LZXkgfCBudWxsXG5sZXQgX3Nlc3Npb25TYWx0ID0gbnVsbDsgIC8vIFVpbnQ4QXJyYXkgfCBudWxsXG4vLyBfdW5sb2NrZWQ6IG51bGwgPSBwYXNzd29yZGxlc3MgLyBub3QgYXBwbGljYWJsZSAobmV2ZXIgbG9ja2VkKSxcbi8vICAgICAgICAgICAgdHJ1ZSA9IHVubG9ja2VkLCBmYWxzZSA9IGxvY2tlZCAocmVmdXNlIHNlY3JldCByZWFkcykuXG5sZXQgX3VubG9ja2VkID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlc3Npb25LZXkoY3J5cHRvS2V5LCBzYWx0KSB7XG4gICAgX3Nlc3Npb25LZXkgPSBjcnlwdG9LZXk7XG4gICAgX3Nlc3Npb25TYWx0ID0gc2FsdDtcbiAgICBfdW5sb2NrZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuICAgIF9zZXNzaW9uS2V5ID0gbnVsbDtcbiAgICBfc2Vzc2lvblNhbHQgPSBudWxsO1xuICAgIF91bmxvY2tlZCA9IGZhbHNlO1xufVxuXG4vKiogRXhwbGljaXRseSBtYXJrIHRoZSBzZXNzaW9uIHVubG9ja2VkL2xvY2tlZCB3aXRob3V0IHByb3ZpZGluZyBhIGtleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVbmxvY2tlZCh2KSB7XG4gICAgX3VubG9ja2VkID0gdiA9PT0gbnVsbCA/IG51bGwgOiAhIXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZXNzaW9uS2V5KCkge1xuICAgIHJldHVybiAhIV9zZXNzaW9uS2V5O1xufVxuXG4vLyAtLS0gRGV2aWNlIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbmxldCBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDsgLy8gZmFsbGJhY2sgZm9yIGVudmlyb25tZW50cyB3aXRob3V0IEluZGV4ZWREQlxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURldmljZUtleSgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGU6IHJhdyBieXRlcyBjYW4gbmV2ZXIgYmUgcmVhZCBiYWNrIG91dFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWREYkF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5kZXhlZERCICE9PSBudWxsO1xufVxuXG4vKipcbiAqIEdldCAoY3JlYXRpbmcgb24gZmlyc3QgdXNlKSB0aGUgcGVyc2lzdGVudCBub24tZXh0cmFjdGFibGUgZGV2aWNlIGtleS5cbiAqIFBlcnNpc3RlZCBpbiBJbmRleGVkREIgYXMgYSBDcnlwdG9LZXkgaGFuZGxlIHZpYSBzdHJ1Y3R1cmVkIGNsb25lLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5KCkge1xuICAgIGlmIChfZGV2aWNlS2V5UHJvbWlzZSkgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgICAgICB9XG4gICAgICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICAgICAgY29uc3QgeyBvcGVuREIgfSA9IGF3YWl0IGltcG9ydCgnaWRiJyk7XG4gICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICAgICAgdXBncmFkZShkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREVWSUNFX1NUT1JFKSkge1xuICAgICAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGtleSA9IGF3YWl0IGdlbmVyYXRlRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBhd2FpdCBkYi5wdXQoREVWSUNFX1NUT1JFLCBrZXksIERFVklDRV9LRVlfSUQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBlbmMuZW5jb2RlKHBsYWludGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2OiAxLFxuICAgICAgICBrOiAnZGV2aWNlJyxcbiAgICAgICAgaXY6IGFiVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhYlRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhEZXZpY2VLZXkoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BYihpdikpIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgYmFzZTY0VG9BYihjaXBoZXJ0ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gQmxvYiBjbGFzc2lmaWNhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuc2FsdCAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCAmJiBwLmsgIT09ICdkZXZpY2UnKTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldmljZUtleUJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5rID09PSAnZGV2aWNlJyAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG4vKiogVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYWxyZWFkeSBjaXBoZXJ0ZXh0IChlaXRoZXIgd3JhcHBpbmcpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2lwaGVydGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkgfHwgaXNEZXZpY2VLZXlCbG9iKHZhbHVlKTtcbn1cblxuLy8gLS0tIFVuaWZpZWQgd3JhcCAvIHVud3JhcCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgc2VjcmV0IGZvciBhdC1yZXN0IHN0b3JhZ2UuIFByZWZlcnMgdGhlIHBhc3N3b3JkLWRlcml2ZWQgc2Vzc2lvblxuICoga2V5IHdoZW4gb25lIGlzIGF2YWlsYWJsZSBpbiB0aGlzIGNvbnRleHQgKGJhY2tncm91bmQsIHVubG9ja2VkKTsgb3RoZXJ3aXNlXG4gKiBmYWxscyBiYWNrIHRvIHRoZSBhbHdheXMtYXZhaWxhYmxlIGRldmljZSBrZXkuIE5ldmVyIHJldHVybnMgcGxhaW50ZXh0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59IEFFUy0yNTYtR0NNIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlS2V5J11cbiAgICApO1xuXG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQ6IHNhbHQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gc2FsdCA6IG5ldyBVaW50OEFycmF5KHNhbHQpLFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vLyAtLS0gRW5jcnlwdCB3aXRoIHByZS1kZXJpdmVkIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgYW5kIGl0cyBzYWx0LlxuICpcbiAqIFRoaXMgYXZvaWRzIGhvbGRpbmcgdGhlIHJhdyBwYXNzd29yZCBpbiBtZW1vcnkgXHUyMDE0IHRoZSBjYWxsZXIgZGVyaXZlcyB0aGVcbiAqIGtleSBvbmNlICh2aWEgZGVyaXZlS2V5KSBhbmQgcmV1c2VzIGl0IGZvciB0aGUgc2Vzc2lvbi4gIFRoZSBvdXRwdXRcbiAqIGZvcm1hdCBpcyBpZGVudGljYWwgdG8gZW5jcnlwdCgpLCBzbyBkZWNyeXB0KCkgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aFxuICogdGhlIG9yaWdpbmFsIHBhc3N3b3JkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgICAgICAgICAgLSBUaGUgZGF0YSB0byBlbmNyeXB0XG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5IGZyb20gZGVyaXZlS2V5KClcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdCAgICAgICAgICAgLSBUaGUgc2FsdCB0aGF0IHdhcyB1c2VkIHRvIGRlcml2ZSBga2V5YFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwga2V5LCBzYWx0KSB7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgLyBEZWNyeXB0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHdpdGggYSBwYXNzd29yZC5cbiAqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpLCBkZXJpdmVzIGFuXG4gKiBBRVMtMjU2LUdDTSBrZXkgdmlhIFBCS0RGMiwgYW5kIHJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nXG4gKiBiYXNlNjQtZW5jb2RlZCBzYWx0LCBpdiwgYW5kIGNpcGhlcnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAtIFRoZSBkYXRhIHRvIGVuY3J5cHQgKGUuZy4gaGV4IHByaXZhdGUga2V5KVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dCwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KTtcblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IChpZ25vcmVzIHRoZSBzYWx0IGVtYmVkZGVkIGluIHRoZVxuICogYmxvYiBcdTIwMTQgdGhlIGNhbGxlciBtdXN0IHN1cHBseSBhIGtleSB0aGF0IG1hdGNoZXMgaG93IHRoZSBibG9iIHdhcyBlbmNyeXB0ZWQpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KCkvZW5jcnlwdFdpdGhLZXkoKVxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoS2V5KGVuY3J5cHRlZERhdGEsIGtleSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB0aGF0IHdhcyBlbmNyeXB0ZWQgd2l0aCBgZW5jcnlwdCgpYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAgICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFzc3dvcmQgaXMgd3Jvbmcgb3IgZGF0YSBpcyB0YW1wZXJlZCB3aXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcblxuICAgIGNvbnN0IHNhbHRCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHRCdWYpO1xuXG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICByZXR1cm4gZGVjLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8vIC0tLSBQYXNzd29yZCBoYXNoaW5nIChmb3IgdmVyaWZpY2F0aW9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBIYXNoIGEgcGFzc3dvcmQgd2l0aCBQQktERjIgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIHByb2R1Y2VzIGEgc2VwYXJhdGUgaGFzaCAobm90IHRoZSBlbmNyeXB0aW9uIGtleSkgdGhhdCBjYW4gYmUgc3RvcmVkXG4gKiB0byB2ZXJpZnkgdGhlIHBhc3N3b3JkIHdpdGhvdXQgbmVlZGluZyB0byBhdHRlbXB0IGRlY3J5cHRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtVaW50OEFycmF5fSBbc2FsdF0gLSBPcHRpb25hbCBzYWx0OyBnZW5lcmF0ZWQgaWYgb21pdHRlZFxuICogQHJldHVybnMge1Byb21pc2U8eyBoYXNoOiBzdHJpbmcsIHNhbHQ6IHN0cmluZyB9Pn0gYmFzZTY0LWVuY29kZWQgaGFzaCBhbmQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBzYWx0ID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlQml0cyddXG4gICAgKTtcblxuICAgIGNvbnN0IGhhc2hCaXRzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIDI1NlxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBoYXNoOiBhcnJheUJ1ZmZlclRvQmFzZTY0KGhhc2hCaXRzKSxcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgYSBzdG9yZWQgaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAtIFRoZSBwYXNzd29yZCB0byB2ZXJpZnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRIYXNoIC0gYmFzZTY0LWVuY29kZWQgaGFzaCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkU2FsdCAtIGJhc2U2NC1lbmNvZGVkIHNhbHQgZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFRydWUgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRIYXNoLCBzdG9yZWRTYWx0KSB7XG4gICAgY29uc3QgeyBoYXNoIH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZFNhbHQpO1xuICAgIHJldHVybiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChoYXNoLCBzdG9yZWRIYXNoKTtcbn1cblxuLyoqXG4gKiBDb25zdGFudC10aW1lIGNvbXBhcmlzb24gb2YgdHdvIGJhc2U2NC1lbmNvZGVkIGJ5dGUgc3RyaW5ncy5cbiAqXG4gKiBEZWNvZGVzIGJvdGggdG8gcmF3IGJ5dGVzIGFuZCBjb21wYXJlcyB3aXRoIGFuIGFjY3VtdWxhdG9yIHNvIHRoZSBydW5uaW5nXG4gKiB0aW1lIGRvZXMgbm90IGRlcGVuZCBvbiB3aGVyZSB0aGUgZmlyc3QgbWlzbWF0Y2ggb2NjdXJzIFx1MjAxNCB0aGlzIGF2b2lkcyB0aGVcbiAqIHRpbWluZyBzaWRlLWNoYW5uZWwgb2YgYSBwbGFpbiBgPT09YCBzdHJpbmcgY29tcGFyZSAoVGllci0zIGNyeXB0by5qczoyMTMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoYSwgYikge1xuICAgIGxldCBiYSwgYmI7XG4gICAgdHJ5IHtcbiAgICAgICAgYmEgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGEpKTtcbiAgICAgICAgYmIgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGIpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBDb21wYXJlIHRoZSBtYXggbGVuZ3RoIHNvIGxlbmd0aCBkaWZmZXJlbmNlcyBkb24ndCBzaG9ydC1jaXJjdWl0IGVhcmx5LlxuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KGJhLmxlbmd0aCwgYmIubGVuZ3RoKTtcbiAgICBsZXQgZGlmZiA9IGJhLmxlbmd0aCBeIGJiLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRpZmYgfD0gKGJhW2ldIHx8IDApIF4gKGJiW2ldIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FB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Qy9CLFVBQU0sSUFBSSxFQUFFLFlBQVk7QUFBRyxRQUFJLEtBQUssTUFBTyxHQUFFLGNBQWM7QUFDM0QsVUFBTSxJQUFJLEVBQUUsY0FBYztBQUFHLFFBQUksS0FBSyxRQUFTLEdBQUUsY0FBYztBQUMvRCxVQUFNLElBQUksRUFBRSxtQkFBbUI7QUFBRyxRQUFJLEtBQUssT0FBUSxHQUFFLGNBQWM7QUFDbkUsT0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQy9CLFlBQU0sTUFBTSxJQUFJLFFBQVEsT0FBTyx3QkFBd0I7QUFDdkQsYUFBTyxLQUFLLEtBQUssa0JBQWtCO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFFQSxpQkFBZSxPQUFPO0FBRWxCLFVBQU0sY0FBYyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekUsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqRSxVQUFNLE9BQU8sRUFBRSxtQkFBbUI7QUFDbEMsVUFBTSxPQUFPLEVBQUUsb0JBQW9CO0FBRW5DLFFBQUksQ0FBQyxhQUFhO0FBR2Qsa0JBQVksSUFBSTtBQUNoQixlQUFTLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFDdkI7QUFBQSxJQUNKO0FBRUEsUUFBSSxRQUFRO0FBRVIsa0JBQVksS0FBSztBQUNqQixlQUFTLE1BQU0sTUFBTTtBQUFBLFFBQ2pCLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNaLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFFQSxnQkFBWSxJQUFJO0FBQ2hCLFFBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUMvQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFFL0IsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hFLFVBQU0sWUFBWSxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUU7QUFDbEQsVUFBTSxjQUFjLE1BQU1DLGVBQWM7QUFDeEMsVUFBTSxPQUFPLE1BQU0sWUFBWTtBQUUvQixlQUFXO0FBQ1gsV0FBTztBQUVQLFFBQUksTUFBTSxlQUFlLFVBQVUsR0FBRztBQUNsQyxZQUFNLFFBQVE7QUFBQSxJQUNsQjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsidGFyZ2V0IiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJJVl9CWVRFUyIsICJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiaXNTeW5jRW5hYmxlZCJdCn0K
