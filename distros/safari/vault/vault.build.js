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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL25pcDc4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdmF1bHQtc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9idW5rZXItdXJsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnNlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE1WMyBpbi1tZW1vcnkgYXJlYSB0aGF0IHN1cnZpdmVzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uIGJ1dCBuZXZlciB0b3VjaGVzXG4gICAgLy8gZGlzay4gTnVsbCBvbiBlbmdpbmVzIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGl0IChTYWZhcmkgYmFja2dyb3VuZCBwYWdlLFxuICAgIC8vIG9sZGVyIEZpcmVmb3gpIFx1MjAxNCBjYWxsZXJzIG11c3QgZmVhdHVyZS1kZXRlY3QgYW5kIGZhbGwgYmFjay5cbiAgICBzZXNzaW9uOiBfYnJvd3Nlci5zdG9yYWdlPy5zZXNzaW9uID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdGhlIGFyZWEgdG8gZXh0ZW5zaW9uLXByaXZpbGVnZWQgY29udGV4dHMuIENocm9tZS1vbmx5O1xuICAgICAgICAgKiByZXNvbHZlcyBoYXJtbGVzc2x5IHdoZXJlIHRoZSBtZXRob2QgaXMgYWJzZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWNjZXNzTGV2ZWwoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgYXNrR2F0ZSwgc3RhcnRQYWdlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhZ2UtZ2F0ZSc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHsgQVBJX0tFWVNfUEFUSCB9IGZyb20gJy4uL3V0aWxpdGllcy9uaXA3OCc7XG5pbXBvcnQge1xuICAgIGdldFZhdWx0SW5kZXgsXG4gICAgZ2V0RG9jdW1lbnQsXG4gICAgc2F2ZURvY3VtZW50TG9jYWwsXG4gICAgZGVsZXRlRG9jdW1lbnRMb2NhbCxcbiAgICBsaXN0RG9jdW1lbnRzLFxuICAgIHVwZGF0ZVN5bmNTdGF0dXMsXG59IGZyb20gJy4uL3V0aWxpdGllcy92YXVsdC1zdG9yZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGRvY3VtZW50czogW10sXG4gICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgIHNlbGVjdGVkUGF0aDogbnVsbCxcbiAgICBlZGl0b3JUaXRsZTogJycsXG4gICAgZWRpdG9yQ29udGVudDogJycsXG4gICAgcHJpc3RpbmVUaXRsZTogJycsXG4gICAgcHJpc3RpbmVDb250ZW50OiAnJyxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsXG4gICAgc3luY0Vycm9yOiAnJyxcbiAgICBzYXZpbmc6IGZhbHNlLFxuICAgIGlzTmV3OiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlcmVkRG9jdW1lbnRzKCkge1xuICAgIGlmICghc3RhdGUuc2VhcmNoUXVlcnkpIHJldHVybiBzdGF0ZS5kb2N1bWVudHM7XG4gICAgY29uc3QgcSA9IHN0YXRlLnNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHN0YXRlLmRvY3VtZW50cy5maWx0ZXIoZCA9PiBkLnBhdGgudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHN0YXRlLmVkaXRvckNvbnRlbnQgIT09IHN0YXRlLnByaXN0aW5lQ29udGVudCB8fCBzdGF0ZS5lZGl0b3JUaXRsZSAhPT0gc3RhdGUucHJpc3RpbmVUaXRsZTtcbn1cblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1zZykge1xuICAgIHN0YXRlLnRvYXN0ID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS50b2FzdCA9ICcnOyByZW5kZXIoKTsgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNDbGFzcyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiAnbGVkLS1ncmVlbic7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ2xlZC0tYW1iZXIgbGVkLXB1bHNlJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gJ1N5bmNlZCc7XG59XG5cbmZ1bmN0aW9uIGRvY1N5bmNDbGFzcyhzeW5jU3RhdHVzKSB7XG4gICAgaWYgKHN5bmNTdGF0dXMgPT09ICdzeW5jZWQnKSByZXR1cm4gJ2xlZC0tZ3JlZW4nO1xuICAgIGlmIChzeW5jU3RhdHVzID09PSAnbG9jYWwtb25seScpIHJldHVybiAnbGVkLS1hbWJlcic7XG4gICAgcmV0dXJuICdsZWQtLXJlZCc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3QgZG9jQ291bnQgPSAkKCdkb2MtY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBsZWQgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCk7XG4gICAgaWYgKGRvY0NvdW50KSBkb2NDb3VudC50ZXh0Q29udGVudCA9IHN0YXRlLmRvY3VtZW50cy5sZW5ndGggKyAnIGRvYycgKyAoc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEZpbGUgbGlzdFxuICAgIGNvbnN0IGZpbGVMaXN0ID0gJCgnZmlsZS1saXN0Jyk7XG4gICAgY29uc3QgZW1wdHlNc2cgPSAkKCduby1kb2N1bWVudHMnKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGdldEZpbHRlcmVkRG9jdW1lbnRzKCk7XG5cbiAgICBpZiAoZmlsZUxpc3QpIHtcbiAgICAgICAgZmlsZUxpc3QuaW5uZXJIVE1MID0gZmlsdGVyZWQubWFwKGRvYyA9PiBgXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJkb2MtaXRlbSAke3N0YXRlLnNlbGVjdGVkUGF0aCA9PT0gZG9jLnBhdGggPyAnc2VsZWN0ZWQnIDogJyd9XCJcbiAgICAgICAgICAgICAgICBkYXRhLWRvYy1wYXRoPVwiJHtkb2MucGF0aH1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkb2MtcGF0aCBtb25vIGlucy10cnVuY2F0ZVwiPiR7ZG9jLnBhdGh9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRvYy1zeW5jIGxlZC1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlZCAke2RvYy51bmRlY3J5cHRhYmxlID8gJ2xlZC0tcmVkJyA6IGRvY1N5bmNDbGFzcyhkb2Muc3luY1N0YXR1cyl9XCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1vbm9cIj4ke2RvYy51bmRlY3J5cHRhYmxlID8gJ3VuZGVjcnlwdGFibGUnIDogZG9jLnN5bmNTdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpO1xuXG4gICAgICAgIGZpbGVMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWRvYy1wYXRoXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZWxlY3REb2N1bWVudChlbC5kYXRhc2V0LmRvY1BhdGgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbXB0eU1zZykgZW1wdHlNc2cuc3R5bGUuZGlzcGxheSA9IGZpbHRlcmVkLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBFZGl0b3JcbiAgICBjb25zdCBlZGl0b3JQYW5lbCA9ICQoJ2VkaXRvci1wYW5lbCcpO1xuICAgIGNvbnN0IGVkaXRvckVtcHR5ID0gJCgnZWRpdG9yLWVtcHR5Jyk7XG4gICAgY29uc3Qgc2hvd0VkaXRvciA9IHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gbnVsbCB8fCBzdGF0ZS5pc05ldztcblxuICAgIGlmIChlZGl0b3JQYW5lbCkgZWRpdG9yUGFuZWwuc3R5bGUuZGlzcGxheSA9IHNob3dFZGl0b3IgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmIChlZGl0b3JFbXB0eSkgZWRpdG9yRW1wdHkuc3R5bGUuZGlzcGxheSA9IHNob3dFZGl0b3IgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgaWYgKHNob3dFZGl0b3IpIHtcbiAgICAgICAgY29uc3QgdGl0bGVJbnB1dCA9ICQoJ2VkaXRvci10aXRsZScpO1xuICAgICAgICBjb25zdCBjb250ZW50QXJlYSA9ICQoJ2VkaXRvci1jb250ZW50Jyk7XG4gICAgICAgIGNvbnN0IHNhdmVCdG4gPSAkKCdzYXZlLWRvYy1idG4nKTtcbiAgICAgICAgY29uc3QgZGVsZXRlQnRuID0gJCgnZGVsZXRlLWRvYy1idG4nKTtcbiAgICAgICAgY29uc3QgZGlydHlMYWJlbCA9ICQoJ2RpcnR5LWxhYmVsJyk7XG5cbiAgICAgICAgaWYgKHRpdGxlSW5wdXQpIHRpdGxlSW5wdXQudmFsdWUgPSBzdGF0ZS5lZGl0b3JUaXRsZTtcbiAgICAgICAgaWYgKGNvbnRlbnRBcmVhKSBjb250ZW50QXJlYS52YWx1ZSA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgIGlmIChzYXZlQnRuKSB7XG4gICAgICAgICAgICBzYXZlQnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICBzYXZlQnRuLnRleHRDb250ZW50ID0gc3RhdGUuc2F2aW5nID8gJ1NhdmluZy4uLicgOiAnU2F2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlbGV0ZUJ0bikgZGVsZXRlQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IG51bGwgJiYgIXN0YXRlLmlzTmV3ID8gJ2lubGluZS1mbGV4JyA6ICdub25lJztcbiAgICAgICAgaWYgKGRpcnR5TGFiZWwpIGRpcnR5TGFiZWwuc3R5bGUuZGlzcGxheSA9IGlzRGlydHkoKSA/ICdpbmxpbmUnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFNlYXJjaFxuICAgIGNvbnN0IHNlYXJjaElucHV0ID0gJCgnc2VhcmNoLWlucHV0Jyk7XG4gICAgaWYgKHNlYXJjaElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHNlYXJjaElucHV0KSB7XG4gICAgICAgIHNlYXJjaElucHV0LnZhbHVlID0gc3RhdGUuc2VhcmNoUXVlcnk7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBuZXdEb2N1bWVudCgpIHtcbiAgICBzdGF0ZS5pc05ldyA9IHRydWU7XG4gICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChwYXRoKTtcbiAgICBpZiAoIWRvYykgcmV0dXJuO1xuICAgIGlmIChkb2MudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICAvLyBPcGVuaW5nIGl0IHdvdWxkIHNob3cgYW4gZW1wdHkgZWRpdG9yIGFuZCB0aGUgbmV4dCBTYXZlIHdvdWxkIHdyaXRlXG4gICAgICAgIC8vIHRoYXQgZW1wdGluZXNzIG92ZXIgdGhlIHN0b3JlZCBjaXBoZXJ0ZXh0LiBSZWZ1c2UsIGFuZCBzYXkgd2h5LlxuICAgICAgICBzaG93VG9hc3QoJ1RoaXMgbm90ZSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlIFx1MjAxNCBsZWZ0IHVudG91Y2hlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBwYXRoO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gZG9jLnBhdGg7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBkb2MuY29udGVudDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50KCkge1xuICAgIGNvbnN0IHRpdGxlID0gc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpO1xuICAgIGlmICghdGl0bGUpIHJldHVybjtcbiAgICBpZiAodGl0bGUgPT09IEFQSV9LRVlTX1BBVEgpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdOb3N0cktleSBrZWVwcyB0aGlzIG5hbWUgZm9yIGl0c2VsZi4gQ2hvb3NlIGFub3RoZXIgdGl0bGUuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3ZhdWx0LnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBwYXRoOiB0aXRsZSwgY29udGVudDogc3RhdGUuZWRpdG9yQ29udGVudCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggJiYgc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSB0aXRsZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHRpdGxlLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnU2F2ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHRpdGxlLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCAmJiBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnU2F2ZWQgbG9jYWxseSAocmVsYXkgZXJyb3I6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykgKyAnKScpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCksIHN0YXRlLmVkaXRvckNvbnRlbnQsICdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKTtcbiAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHN0YXRlLmVkaXRvclRpdGxlO1xuICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgIHNob3dUb2FzdCgnU2F2ZWQgbG9jYWxseSAob2ZmbGluZSknKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlRG9jdW1lbnQoKSB7XG4gICAgaWYgKCFzdGF0ZS5zZWxlY3RlZFBhdGgpIHJldHVybjtcbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6IGBEZWxldGUgXCIke3N0YXRlLnNlbGVjdGVkUGF0aH1cIj9gLCBib2R5OiAnVGhlIGRvY3VtZW50IGlzIHJlbW92ZWQgZnJvbSB5b3VyIHZhdWx0IGFuZCwgaWYgcHVibGlzaGVkLCBhIGRlbGV0ZSByZXF1ZXN0IGlzIHNlbnQgdG8geW91ciByZWxheXMuJywgY29uZmlybUxhYmVsOiAnRGVsZXRlIGRvY3VtZW50JywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSByZXR1cm47XG5cbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuXG4gICAgaWYgKGRvYz8uZXZlbnRJZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5kZWxldGUnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgcGF0aDogc3RhdGUuc2VsZWN0ZWRQYXRoLCBldmVudElkOiBkb2MuZXZlbnRJZCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgfVxuXG4gICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IG51bGw7XG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIHNob3dUb2FzdCgnRGVsZXRlZCcpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd2YXVsdC5mZXRjaCcgfSk7XG5cbiAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgICAgICBzdGF0ZS5zeW5jRXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9jYWxEb2NzID0gYXdhaXQgZ2V0VmF1bHRJbmRleCgpO1xuXG4gICAgICAgIGZvciAoY29uc3QgcmVtb3RlIG9mIHJlc3VsdC5kb2N1bWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsID0gbG9jYWxEb2NzW3JlbW90ZS5wYXRoXTtcblxuICAgICAgICAgICAgaWYgKCFsb2NhbCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHJlbW90ZS5wYXRoLCByZW1vdGUuY29udGVudCwgJ3N5bmNlZCcsIHJlbW90ZS5ldmVudElkLCByZW1vdGUuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobG9jYWwuc3luY1N0YXR1cyA9PT0gJ2xvY2FsLW9ubHknKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsLmNvbnRlbnQgIT09IHJlbW90ZS5jb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN5bmNTdGF0dXMocmVtb3RlLnBhdGgsICdjb25mbGljdCcsIHJlbW90ZS5ldmVudElkLCByZW1vdGUuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFsb2NhbC5yZWxheUNyZWF0ZWRBdCB8fCByZW1vdGUuY3JlYXRlZEF0ID4gbG9jYWwucmVsYXlDcmVhdGVkQXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChyZW1vdGUucGF0aCwgcmVtb3RlLmNvbnRlbnQsICdzeW5jZWQnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCA9PT0gcmVtb3RlLnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IHJlbW90ZS5jb250ZW50O1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSByZW1vdGUuY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnaWRsZSc7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gZS5tZXNzYWdlIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgnbmV3LWRvYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBuZXdEb2N1bWVudCk7XG4gICAgJCgnc3luYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzeW5jQWxsKTtcbiAgICAkKCdzYXZlLWRvYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlRG9jdW1lbnQpO1xuICAgICQoJ2RlbGV0ZS1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZGVsZXRlRG9jdW1lbnQpO1xuXG4gICAgJCgnc2VhcmNoLWlucHV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuc2VhcmNoUXVlcnkgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdlZGl0b3ItdGl0bGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ2VkaXRvci1jb250ZW50Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBHYXRlOiByZXF1aXJlIG1hc3RlciBwYXNzd29yZCBiZWZvcmUgYWxsb3dpbmcgdmF1bHQgYWNjZXNzXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhc2tHYXRlKCdpc0VuY3J5cHRlZCcpO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih1cmwsICdub3N0cmtleS1vcHRpb25zJyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCByZWxheXM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUucmVsYXlJbmZvID0geyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW3ZhdWx0XSBGYWlsZWQgdG8gbG9hZCBkb2N1bWVudHM6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gW107XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKGhhc1JlbGF5cygpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW3ZhdWx0XSBTeW5jIGZhaWxlZDonLCBlLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gc3RhcnRQYWdlKGluaXQpKTtcbiIsICIvKipcbiAqIFRoZSBxdWVzdGlvbnMgYSBwYWdlIGFza3MgdGhlIHdvcmtlciBiZWZvcmUgaXQgY2FuIGRyYXcgYW55dGhpbmcuIFRoZSB3b3JrZXJcbiAqIGNhbiBhbnN3ZXIgdGhlbSB3aXRoIGEgcmVmdXNhbCBvYmplY3QsIGFuZCBhbiBvYmplY3QgaXMgdHJ1dGh5LCBzbyBhIHBhZ2UgdGhhdFxuICogcmVhZHMgaXQgYXMgYSB5ZXMgc2hvd3MgdGhlIHdyb25nIHNjcmVlbi4gUGFnZXMgYXNrIHRocm91Z2ggYXNrR2F0ZSBpbnN0ZWFkOlxuICogYSByZWZ1c2FsIHJlcGxhY2VzIHRoZSBwYWdlIHdpdGggYSBwbGFpbiBtZXNzYWdlIGFuZCBzdG9wcyBpdHMgc3RhcnQtdXAuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuZXhwb3J0IGNvbnN0IFNUQVJUX0VSUk9SID0gJ05vc3RyS2V5IGNvdWxkIG5vdCBzdGFydCB0aGlzIHBhZ2UuIFJlbG9hZCBvciByZWluc3RhbGwuJztcblxuZXhwb3J0IGNsYXNzIEdhdGVSZWZ1c2VkIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmdXNlZChhbnN3ZXIpIHtcbiAgICByZXR1cm4gISFhbnN3ZXIgJiYgdHlwZW9mIGFuc3dlciA9PT0gJ29iamVjdCcgJiYgYW5zd2VyLnN1Y2Nlc3MgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1N0YXJ0RXJyb3IoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgncm9sZScsICdhbGVydCcpO1xuICAgIG1lc3NhZ2UuZGF0YXNldC5zdGFydEVycm9yID0gJyc7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFNUQVJUX0VSUk9SO1xuICAgIG1lc3NhZ2Uuc3R5bGUucGFkZGluZyA9ICcxNnB4JztcbiAgICBkb2N1bWVudC5ib2R5LnJlcGxhY2VDaGlsZHJlbihtZXNzYWdlKTtcbn1cblxuLyoqIEFzayB0aGUgd29ya2VyLiBPbiBhIHJlZnVzYWwsIHNob3cgdGhlIG1lc3NhZ2UgYW5kIHRocm93IEdhdGVSZWZ1c2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFza0dhdGUoa2luZCkge1xuICAgIGNvbnN0IGFuc3dlciA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZCB9KTtcbiAgICBpZiAoaXNSZWZ1c2VkKGFuc3dlcikpIHtcbiAgICAgICAgc2hvd1N0YXJ0RXJyb3IoKTtcbiAgICAgICAgdGhyb3cgbmV3IEdhdGVSZWZ1c2VkKCk7XG4gICAgfVxuICAgIHJldHVybiBhbnN3ZXI7XG59XG5cbi8vIEF0IG1vc3Qgb25lIG5vdGUgaW4gdGhpcyB0aW1lLCBob3dldmVyIGJ1c3kgdGhlIHBlcnNvbiBpcy5cbmNvbnN0IEFDVElWSVRZX05PVEVfTVMgPSAzMF8wMDA7XG5cbi8qKlxuICogVXNpbmcgb25lIG9mIE5vc3RyS2V5J3Mgb3duIHBhZ2VzIGNvdW50cyBhcyBhY3Rpdml0eSBmb3IgYXV0by1sb2NrLCBhcyBkb2VzXG4gKiBhbnN3ZXJpbmcgYSByZXF1ZXN0IG9yIGEgc2l0ZSBzaWduaW5nIGZyb20gYSByZW1lbWJlcmVkIGdyYW50LlxuICovXG5mdW5jdGlvbiB3YXRjaEFjdGl2aXR5KCkge1xuICAgIGxldCBsYXN0Tm90ZSA9IDA7XG4gICAgY29uc3Qgbm90ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0Tm90ZSA8IEFDVElWSVRZX05PVEVfTVMpIHJldHVybjtcbiAgICAgICAgbGFzdE5vdGUgPSBEYXRlLm5vdygpO1xuICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdyZXNldEF1dG9Mb2NrJyB9KT8uY2F0Y2g/LigoKSA9PiB7fSk7XG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG5vdGUsIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbm90ZSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pO1xufVxuXG4vKiogUnVuIGEgcGFnZSdzIHN0YXJ0LXVwLiBBIHJlZnVzYWwgaGFzIGFscmVhZHkgYmVlbiBzaG93biwgc28gaXQgZW5kcyBoZXJlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0UGFnZShpbml0KSB7XG4gICAgd2F0Y2hBY3Rpdml0eSgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGluaXQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBHYXRlUmVmdXNlZCkpIHRocm93IGU7XG4gICAgfVxufVxuIiwgIi8qKlxuICogaW5zLWNvbmZpcm0uanMgXHUyMDE0IHRoZSBzaGFyZWQgY29uc2VudCBvdmVybGF5IGZvciBleHRlbnNpb24gcGFnZXMuXG4gKlxuICogT25lIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb25zZW50LXN1cmZhY2Ugc3RhbmRhcmQ6IGEgZGltbWVkIGJhY2tkcm9wIHBsdXNcbiAqIGVpdGhlciBhIGJvdHRvbSBTSEVFVCAoZGVmYXVsdDsgZGVzdHJ1Y3RpdmUgLyBpcnJldmVyc2libGUgYWN0cykgb3IgYVxuICogY2VudGVyZWQgUE9QT1ZFUiAobG93LXN0YWtlcywgcmV2ZXJzaWJsZSBhY3RzKS4gUmVwbGFjZXMgbmF0aXZlXG4gKiBjb25maXJtKCkvYWxlcnQoKSBvbiBldmVyeSBleHRlbnNpb24tcGFnZSBzdXJmYWNlLlxuICpcbiAqICAgaW5zQ29uZmlybSh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8Ym9vbGVhbj4gICAodHJ1ZSA9IGNvbmZpcm1lZDsgRXNjYXBlL2JhY2tkcm9wL2NhbmNlbCA9IGZhbHNlKVxuICogICBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsIH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTx2b2lkPlxuICpcbiAqIFN0eWxpbmcgY29tZXMgZW50aXJlbHkgZnJvbSBpbnN0cnVtZW50LmNzcyAoc2VjdGlvbiAxOCArIHRoZSAuYnRuIGZhbWlseSksXG4gKiBzbyBza2luIC8gbW9kZSAvIGNvbnRyYXN0IC8gZGVuc2l0eSAvIHRleHQtc2l6ZSBhcnJpdmUgdmlhIHRoZSBwYWdlJ3NcbiAqIHN0YW1wZWQgZGF0YS1pbnMtKiBhdHRyaWJ1dGVzIFx1MjAxNCBubyBzdG9yYWdlIGFjY2Vzcywgbm8gbWVzc2FnaW5nIGhlcmUuXG4gKlxuICogU2FmZXR5OiB0aXRsZS9ib2R5IG1heSBjb250YWluIHVzZXIgZGF0YSAoa2V5IGxhYmVscywgdmF1bHQgcGF0aHMpOyB0aGUgRE9NXG4gKiBpcyBidWlsdCB3aXRoIGNyZWF0ZUVsZW1lbnQgKyB0ZXh0Q29udGVudCBPTkxZIFx1MjAxNCBuZXZlciBpbm5lckhUTUwuXG4gKi9cblxuLy8gU2VyaWFsaXplIG92ZXJsYXBwaW5nIGNhbGxzIHNvIGEgc2Vjb25kIGRpYWxvZyBuZXZlciBkb3VibGUtcmVuZGVycyBvbiB0b3Bcbi8vIG9mIChvciBpbnRlcmxlYXZlcyB3aXRoKSBhbiBvcGVuIG9uZS5cbmxldCBxdWV1ZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5sZXQgaWRDb3VudGVyID0gMDtcblxuZnVuY3Rpb24gbW90aW9uT2ZmKCkge1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWlucy1tb3Rpb24nKSA9PT0gJ29mZicpIHJldHVybiB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKS5tYXRjaGVzO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBCdWlsZCwgc2hvdyBhbmQgc2V0dGxlIG9uZSBkaWFsb2cuIFJlc29sdmVzIHRydWUgKGNvbmZpcm0pIG9yIGZhbHNlXG4gKiAoY2FuY2VsIC8gRXNjYXBlIC8gYmFja2Ryb3AgY2xpY2spLlxuICovXG5mdW5jdGlvbiBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2UgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcm9vdC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtcm9vdCc7XG5cbiAgICAgICAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJhY2tkcm9wJztcblxuICAgICAgICBjb25zdCBpc1NoZWV0ID0gdmFyaWFudCAhPT0gJ3BvcG92ZXInO1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTmFtZSA9IGlzU2hlZXQgPyAnaW5zLWNvbnNlbnQtc2hlZXQnIDogJ2lucy1jb25zZW50LXBvcG92ZXInO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdyb2xlJywgKGRlc3RydWN0aXZlIHx8IG5vdGljZSkgPyAnYWxlcnRkaWFsb2cnIDogJ2RpYWxvZycpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgJ3RydWUnKTtcblxuICAgICAgICBpZiAoaXNTaGVldCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBoYW5kbGUuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWhhbmRsZSc7XG4gICAgICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoaGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVpZCA9ICsraWRDb3VudGVyO1xuICAgICAgICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGVFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtdGl0bGUnO1xuICAgICAgICB0aXRsZUVsLmlkID0gYGlucy1jb25zZW50LXRpdGxlLSR7dWlkfWA7XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCB0aXRsZUVsLmlkKTtcblxuICAgICAgICBjb25zdCBib2R5RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGJvZHlFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYm9keSc7XG4gICAgICAgIGJvZHlFbC5pZCA9IGBpbnMtY29uc2VudC1ib2R5LSR7dWlkfWA7XG4gICAgICAgIGJvZHlFbC50ZXh0Q29udGVudCA9IGJvZHkgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChib2R5RWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgYm9keUVsLmlkKTtcblxuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWFjdGlvbnMnO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgbGV0IGNhbmNlbEJ0biA9IG51bGw7XG4gICAgICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29uZmlybUJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNvbmZpcm1CdG4udGV4dENvbnRlbnQgPSBjb25maXJtTGFiZWw7XG4gICAgICAgIGlmIChub3RpY2UpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gJ2J0bic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBjYW5jZWxCdG4uY2xhc3NOYW1lID0gJ2J0biBidG4tLWdob3N0JztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IGNhbmNlbExhYmVsO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9IGRlc3RydWN0aXZlID8gJ2J0biBidG4tLWRlc3RydWN0aXZlJyA6ICdidG4gYnRuLS1wcmltYXJ5JztcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNvbmZpcm1CdG4pO1xuICAgICAgICBidXR0b25zLnB1c2goY29uZmlybUJ0bik7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcblxuICAgICAgICByb290LmFwcGVuZENoaWxkKGJhY2tkcm9wKTtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkaWFsb2cpO1xuXG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIHNldHRsZShyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKSByZXR1cm47XG4gICAgICAgICAgICBzZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Rm9jdXMgJiYgdHlwZW9mIHByZXZGb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJyAmJiBkb2N1bWVudC5jb250YWlucyhwcmV2Rm9jdXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogZm9jdXMgcmVzdG9yZSBpcyBiZXN0LWVmZm9ydCAqLyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtb3Rpb25PZmYoKSkgZmluaXNoKCk7XG4gICAgICAgICAgICBlbHNlIHNldFRpbWVvdXQoZmluaXNoLCAyNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25LZXlkb3duKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgc2V0dGxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnVGFiJykge1xuICAgICAgICAgICAgICAgIC8vIFRyYXAgZm9jdXMgYWNyb3NzIHRoZSBkaWFsb2cncyBidXR0b25zIG9ubHkuXG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBidXR0b25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlyID0gZXYuc2hpZnRLZXkgPyAtMSA6IDE7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1soaWR4ICsgZGlyICsgYnV0dG9ucy5sZW5ndGgpICUgYnV0dG9ucy5sZW5ndGhdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBiYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBpZiAoY2FuY2VsQnRuKSBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgY29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZSh0cnVlKSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocm9vdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgLy8gRGVzdHJ1Y3RpdmUgYWN0cyBzdGFydCBvbiBDYW5jZWwgc28gRW50ZXIgY2FuJ3QgcnVzaCB0aGUgZGVsZXRlO1xuICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlIHN0YXJ0cyBvbiB0aGUgY29uZmlybWluZyBhY3Rpb24uXG4gICAgICAgICAgICBjb25zdCBpbml0aWFsID0gbm90aWNlID8gY29uZmlybUJ0biA6IChkZXN0cnVjdGl2ZSA/IGNhbmNlbEJ0biA6IGNvbmZpcm1CdG4pO1xuICAgICAgICAgICAgKGluaXRpYWwgfHwgY29uZmlybUJ0bikuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNDb25maXJtKHtcbiAgICB0aXRsZSxcbiAgICBib2R5LFxuICAgIGNvbmZpcm1MYWJlbCA9ICdDb25maXJtJyxcbiAgICBjYW5jZWxMYWJlbCA9ICdDYW5jZWwnLFxuICAgIGRlc3RydWN0aXZlID0gZmFsc2UsXG4gICAgdmFyaWFudCA9ICdzaGVldCcsXG59ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZTogZmFsc2UgfSkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCA9ICdPSycgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGNvbmZpcm1MYWJlbDogZGlzbWlzc0xhYmVsLFxuICAgICAgICAgICAgY2FuY2VsTGFiZWw6ICcnLFxuICAgICAgICAgICAgZGVzdHJ1Y3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdmFyaWFudDogJ3NoZWV0JyxcbiAgICAgICAgICAgIG5vdGljZTogdHJ1ZSxcbiAgICAgICAgfSkudGhlbigoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIE5JUC03OCBFbmNyeXB0ZWQgVmF1bHQgUHJvdG9jb2xcbiAqXG4gKiBQdXJlIGZ1bmN0aW9ucyBmb3IgYnVpbGRpbmcvcGFyc2luZyBraW5kIDMwMDc4IChwYXJhbWV0ZXJpemVkIHJlcGxhY2VhYmxlKVxuICogZXZlbnRzIHVzZWQgYXMgYW4gZW5jcnlwdGVkIG1hcmtkb3duIGRvY3VtZW50IHZhdWx0LlxuICpcbiAqIGQtdGFnIHByZWZpeCBcIm5vc3Rya2V5OlwiIG5hbWVzcGFjZXMgb3VyIHZhdWx0IGl0ZW1zIGZyb20gb3RoZXIgTklQLTc4IGFwcHMuXG4gKiBSZWxheXMgc2VlIGZpbGUgcGF0aHMgYnV0IG5vdCBjb250ZW50IChOSVAtNDQgZW5jcnlwdGVkIHRvIHNlbGYpLlxuICovXG5cbmNvbnN0IEtJTkRfQVBQX0RBVEEgPSAzMDA3ODtcbmNvbnN0IEtJTkRfREVMRVRJT04gPSA1O1xuY29uc3QgRFRBR19QUkVGSVggPSAnbm9zdHJrZXk6JztcbmNvbnN0IENMSUVOVF9UQUcgPSAnbm9zdHJrZXknO1xuXG4vKiogVGhlIHBhdGggdGhlIEFQSSBrZXkgc3RvcmUgdXNlcy4gSXQgaXMgbmV2ZXIgYSB2YXVsdCBkb2N1bWVudC4gKi9cbmV4cG9ydCBjb25zdCBBUElfS0VZU19QQVRIID0gJ3ZhdWx0L2FwaS1rZXlzJztcblxuLyoqXG4gKiBCdWlsZCBhbiB1bnNpZ25lZCBraW5kIDMwMDc4IHZhdWx0IGV2ZW50LlxuICogQ2FsbGVyIG11c3Qgc2lnbiAoZmluYWxpemVFdmVudCBvciBidW5rZXIgc2Vzc2lvbi5zaWduRXZlbnQpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gRG9jdW1lbnQgcGF0aCAoZS5nLiBcIm5vdGVzL3RvZG8ubWRcIilcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWRDb250ZW50IC0gTklQLTQ0IGVuY3J5cHRlZCBjb250ZW50IHN0cmluZ1xuICogQHJldHVybnMge29iamVjdH0gVW5zaWduZWQgZXZlbnQgdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmF1bHRFdmVudChwYXRoLCBlbmNyeXB0ZWRDb250ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogS0lORF9BUFBfREFUQSxcbiAgICAgICAgY29udGVudDogZW5jcnlwdGVkQ29udGVudCxcbiAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgWydkJywgYCR7RFRBR19QUkVGSVh9JHtwYXRofWBdLFxuICAgICAgICAgICAgWydjbGllbnQnLCBDTElFTlRfVEFHXSxcbiAgICAgICAgXSxcbiAgICAgICAgY3JlYXRlZF9hdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhbiB1bnNpZ25lZCBraW5kIDUgZGVsZXRpb24gZXZlbnQgKE5JUC0wOSkgZm9yIGEgdmF1bHQgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50SWQgLSBUaGUgZXZlbnQgaWQgdG8gZGVsZXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIERvY3VtZW50IHBhdGggKGZvciB0aGUgYS10YWcgcmVmZXJlbmNlKVxuICogQHJldHVybnMge29iamVjdH0gVW5zaWduZWQgZGVsZXRpb24gZXZlbnQgdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmF1bHREZWxldGlvbihldmVudElkLCBwYXRoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogS0lORF9ERUxFVElPTixcbiAgICAgICAgY29udGVudDogJ3ZhdWx0IGRvY3VtZW50IGRlbGV0ZWQnLFxuICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICBbJ2UnLCBldmVudElkXSxcbiAgICAgICAgICAgIFsnYScsIGAke0tJTkRfQVBQX0RBVEF9Ojoke0RUQUdfUFJFRklYfSR7cGF0aH1gXSxcbiAgICAgICAgXSxcbiAgICAgICAgY3JlYXRlZF9hdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFJFUSBmaWx0ZXIgZm9yIGZldGNoaW5nIGFsbCB2YXVsdCBkb2N1bWVudHMgZm9yIGEgcHVia2V5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJrZXkgLSBIZXggcHVibGljIGtleVxuICogQHJldHVybnMge29iamVjdH0gTm9zdHIgUkVRIGZpbHRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRWYXVsdEZpbHRlcihwdWJrZXkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBraW5kczogW0tJTkRfQVBQX0RBVEFdLFxuICAgICAgICBhdXRob3JzOiBbcHVia2V5XSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFBhcnNlIGEga2luZCAzMDA3OCBldmVudCBpbnRvIGEgdmF1bHQgZG9jdW1lbnQgZGVzY3JpcHRvci5cbiAqIFJldHVybnMgbnVsbCBpZiB0aGUgZXZlbnQgaXMgbm90IGEgbm9zdHJrZXkgdmF1bHQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gTm9zdHIgZXZlbnRcbiAqIEByZXR1cm5zIHt7IHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nLCBjcmVhdGVkQXQ6IG51bWJlciwgZXZlbnRJZDogc3RyaW5nIH0gfCBudWxsfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VWYXVsdEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmtpbmQgIT09IEtJTkRfQVBQX0RBVEEpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZFRhZyA9IGV2ZW50LnRhZ3M/LmZpbmQodCA9PiB0WzBdID09PSAnZCcpO1xuICAgIGlmICghZFRhZyB8fCAhZFRhZ1sxXT8uc3RhcnRzV2l0aChEVEFHX1BSRUZJWCkpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgcGF0aCA9IGRUYWdbMV0uc2xpY2UoRFRBR19QUkVGSVgubGVuZ3RoKTtcbiAgICBpZiAoIXBhdGgpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgY29udGVudDogZXZlbnQuY29udGVudCxcbiAgICAgICAgY3JlYXRlZEF0OiBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgICBldmVudElkOiBldmVudC5pZCxcbiAgICB9O1xufVxuIiwgIi8qKlxuICogVmF1bHQgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgdmF1bHQgZG9jdW1lbnRzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICB2YXVsdERvY3M6IHtcbiAqICAgICBcInBhdGgvdG8vZmlsZS5tZFwiOiB7XG4gKiAgICAgICBwYXRoLCBjb250ZW50LCB1cGRhdGVkQXQsIHN5bmNTdGF0dXMsIGV2ZW50SWQsIHJlbGF5Q3JlYXRlZEF0LFxuICogICAgICAgcHJvZmlsZVNjb3BlXG4gKiAgICAgfVxuICogICB9XG4gKlxuICogc3luY1N0YXR1czogXCJzeW5jZWRcIiB8IFwibG9jYWwtb25seVwiIHwgXCJjb25mbGljdFwiXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuaW1wb3J0IHsgQVBJX0tFWVNfUEFUSCB9IGZyb20gJy4vbmlwNzgnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICd2YXVsdERvY3MnO1xuLy8gRGVsZXRpb24gdG9tYnN0b25lcyBrZXllZCBieSBwYXRoIChpc3N1ZSAjMyk6IHsgPHBhdGg+OiBkZWxldGVkQXRTZWNvbmRzIH0uXG5jb25zdCBERUxFVEVEX0tFWSA9ICdkZWxldGVkRG9jcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERlbGV0ZWREb2NzKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtERUxFVEVEX0tFWV06IHt9IH0pO1xuICAgIHJldHVybiBkYXRhW0RFTEVURURfS0VZXSAmJiB0eXBlb2YgZGF0YVtERUxFVEVEX0tFWV0gPT09ICdvYmplY3QnID8gZGF0YVtERUxFVEVEX0tFWV0gOiB7fTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RG9jcygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbU1RPUkFHRV9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtTVE9SQUdFX0tFWV0gfHwge307XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRvY3VtZW50J3MgYGNvbnRlbnRgIGZvciBjYWxsZXJzLiBSZS10aHJvd3MgbG9jayBlcnJvcnMgc28gYSBsb2NrZWRcbiAqIHNlc3Npb24gY2Fubm90IHJlYWQgbm90ZXMgKEY2KS5cbiAqXG4gKiBBIGdlbnVpbmUgZGVjcnlwdCBmYWlsdXJlIChlLmcuIGEgdmFsdWUgc3luY2VkIGZyb20gYW5vdGhlciBkZXZpY2UsIG9yIGEgYmxvYlxuICogd2hvc2Ugd3JhcHBpbmcga2V5IHJvdGF0ZWQgYXdheSkgaXMgcmVwb3J0ZWQgYXMgYHVuZGVjcnlwdGFibGU6IHRydWVgIHdpdGhcbiAqIGBjb250ZW50OiBudWxsYCBcdTIwMTQgTk9UIGFzIGFuIGVtcHR5IHN0cmluZy4gRW1wdHkgY29udGVudCBpcyBpbmRpc3Rpbmd1aXNoYWJsZVxuICogZnJvbSBhIHJlYWwgZW1wdHkgbm90ZTogdGhlIGVkaXRvciBvcGVuZWQgaXQgYmxhbmssIGFuZCB0aGUgbmV4dCBTYXZlIHdyb3RlXG4gKiB0aGF0IGJsYW5rIG92ZXIgdGhlIHVzZXIncyBvbmx5IGNvcHkuIGBudWxsYCArIHRoZSBmbGFnIGxldHMgY2FsbGVycyByZWZ1c2VcbiAqIHRvIG9wZW4gb3Igb3ZlcndyaXRlIGl0LCBhbmQgbGVhdmVzIHRoZSBjaXBoZXJ0ZXh0IGF0IHJlc3QgdW50b3VjaGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RG9jKGRvYykge1xuICAgIGlmICghZG9jKSByZXR1cm4gZG9jO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IC4uLmRvYywgY29udGVudDogYXdhaXQgdW53cmFwU2VjcmV0KGRvYy5jb250ZW50KSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlLm1lc3NhZ2UgfHwgJycpLnN0YXJ0c1dpdGgoJ2xvY2tlZCcpKSB0aHJvdyBlO1xuICAgICAgICByZXR1cm4geyAuLi5kb2MsIGNvbnRlbnQ6IG51bGwsIHVuZGVjcnlwdGFibGU6IHRydWUgfTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldERvY3MoZG9jcykge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcyB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBmdWxsIHZhdWx0IGRvY3Mgb2JqZWN0LlxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gTWFwIG9mIHBhdGggLT4gZG9jXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWYXVsdEluZGV4KCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgY29uc3Qgb3V0ID0ge307XG4gICAgZm9yIChjb25zdCBbcGF0aCwgZG9jXSBvZiBPYmplY3QuZW50cmllcyhkb2NzKSkge1xuICAgICAgICBvdXRbcGF0aF0gPSBhd2FpdCBkZWNyeXB0RG9jKGRvYyk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIGRvY3VtZW50IGJ5IHBhdGggKGNvbnRlbnQgZGVjcnlwdGVkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREb2N1bWVudChwYXRoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXSA/IGRlY3J5cHREb2MoZG9jc1twYXRoXSkgOiBudWxsO1xufVxuXG4vKipcbiAqIFNhdmUgb3IgdXBkYXRlIGEgZG9jdW1lbnQgaW4gdGhlIGxvY2FsIGNhY2hlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50TG9jYWwocGF0aCwgY29udGVudCwgc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBkb2NzW3BhdGhdO1xuICAgIGRvY3NbcGF0aF0gPSB7XG4gICAgICAgIHBhdGgsXG4gICAgICAgIGNvbnRlbnQ6IGF3YWl0IHdyYXBTZWNyZXQoY29udGVudCksIC8vIFQwLTQ6IGVuY3J5cHQgbm90ZSBib2R5IGF0IHJlc3RcbiAgICAgICAgdXBkYXRlZEF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICAgICAgc3luY1N0YXR1cyxcbiAgICAgICAgZXZlbnRJZCxcbiAgICAgICAgcmVsYXlDcmVhdGVkQXQsXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgLy8gUmVjcmVhdGUgY2xlYXJzIGFueSB0b21ic3RvbmUgZm9yIHRoaXMgcGF0aCAoaXNzdWUgIzMpLCBzbyB0aGUgZnJlc2hseVxuICAgIC8vIHNhdmVkIGRvYyBpcyBubyBsb25nZXIgc3VwcHJlc3NlZCBmcm9tIHRoZSBzeW5jIHBheWxvYWQuXG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWREb2NzKCk7XG4gICAgaWYgKGRlbGV0ZWRbcGF0aF0gIT0gbnVsbCkge1xuICAgICAgICBkZWxldGUgZGVsZXRlZFtwYXRoXTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBkb2NzLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcyB9KTtcbiAgICB9XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIHJldHVybiBkZWNyeXB0RG9jKGRvY3NbcGF0aF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhIGRvY3VtZW50IGZyb20gdGhlIGxvY2FsIGNhY2hlIGFuZCByZWNvcmQgYSB0b21ic3RvbmUgKGlzc3VlICMzKSBzb1xuICogdGhlIGRlbGV0aW9uIHByb3BhZ2F0ZXMgdGhyb3VnaCBzdG9yYWdlLnN5bmMgYW5kIGEgc3RhbGUgY29weSBvbiBhbm90aGVyXG4gKiBkZXZpY2UgY2Fubm90IHJlc3VycmVjdCBpdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZURvY3VtZW50TG9jYWwocGF0aCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgZGVsZXRlIGRvY3NbcGF0aF07XG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWREb2NzKCk7XG4gICAgZGVsZXRlZFtwYXRoXSA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcywgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgZG9jdW1lbnRzIHNvcnRlZCBieSB1cGRhdGVkQXQgZGVzY2VuZGluZy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gU29ydGVkIGFycmF5IG9mIGRvYyBtZXRhZGF0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdERvY3VtZW50cygpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGNvbnN0IGRlY3J5cHRlZCA9IFtdO1xuICAgIGZvciAoY29uc3QgZG9jIG9mIE9iamVjdC52YWx1ZXMoZG9jcykpIHtcbiAgICAgICAgaWYgKGRvYz8ucGF0aCA9PT0gQVBJX0tFWVNfUEFUSCkgY29udGludWU7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHREb2MoZG9jKSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT4gYi51cGRhdGVkQXQgLSBhLnVwZGF0ZWRBdCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzeW5jIHN0YXR1cyAoYW5kIG9wdGlvbmFsbHkgZXZlbnRJZC9yZWxheUNyZWF0ZWRBdCkgZm9yIGEgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTeW5jU3RhdHVzKHBhdGgsIHN0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgaWYgKCFkb2NzW3BhdGhdKSByZXR1cm4gbnVsbDtcbiAgICBkb2NzW3BhdGhdLnN5bmNTdGF0dXMgPSBzdGF0dXM7XG4gICAgaWYgKGV2ZW50SWQgIT09IG51bGwpIGRvY3NbcGF0aF0uZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBkb2NzW3BhdGhdLnJlbGF5Q3JlYXRlZEF0ID0gcmVsYXlDcmVhdGVkQXQ7XG4gICAgYXdhaXQgc2V0RG9jcyhkb2NzKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXTtcbn1cbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNDaXBoZXJ0ZXh0LCBpc1Bhc3N3b3JkQmxvYiB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcbmltcG9ydCB7IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcywgcmVkYWN0UHJvZmlsZXMgfSBmcm9tICcuL2J1bmtlci11cmwuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBLZXlzIHRoYXQgc2hvdWxkIG5ldmVyIGJlIHN5bmNlZFxuY29uc3QgRVhDTFVERURfS0VZUyA9IFtcbiAgICAnYnVua2VyU2Vzc2lvbnMnLFxuICAgICdpZ25vcmVJbnN0YWxsSG9vaycsXG4gICAgJ3Bhc3N3b3JkSGFzaCcsXG4gICAgJ3Bhc3N3b3JkU2FsdCcsXG5dO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIC8vIFRvbWJzdG9uZXMgKGRlbGV0aW9uIHJlY29yZHMpIGdldCB0aGUgZ3VhcmFudGVlZCB0b3Agc2xvdDogYSBkZWxldGlvbiBtdXN0XG4gICAgLy8gbmV2ZXIgbG9zZSBpdHMgYnVkZ2V0IHJhY2UgdG8gYnVsa3kgdmF1bHQgY29udGVudCwgb3IgdGhlIGRlbGV0ZWQgaXRlbVxuICAgIC8vIHJlc3VycmVjdHMgb24gdGhlIG5leHQgZGV2aWNlIHRoYXQgc3RpbGwgaGFzIGEgc3RhbGUgY29weSAoaXNzdWUgIzMpLlxuICAgIFAwX1RPTUJTVE9ORVM6IDAsXG4gICAgUDFfUFJPRklMRVM6IDEsXG4gICAgUDJfU0VUVElOR1M6IDIsXG4gICAgUDNfQVBJS0VZUzogMyxcbiAgICBQNF9WQVVMVDogNCxcbn07XG5cbi8vIFdhcm5pbmcgdGhyZXNob2xkcyBmb3IgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeSAodG9tYnN0b25lcyBhcmUga2VwdFxuLy8gZm9yZXZlciBzbyBhbiBvZmZsaW5lIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgYWJvdXQgYSBkZWxldGlvbiBjYW5ub3Rcbi8vIHJlc3VycmVjdCB0aGUgaXRlbSBcdTIwMTQgdGhlIGNvdW50IG9ubHkgZ3Jvd3MsIHNvIG51ZGdlIHRoZSB1c2VyIHRvIHRyaW0gaXQpLlxuY29uc3QgVE9NQlNUT05FX1dBUk5fR0VOVExFID0gODtcbmNvbnN0IFRPTUJTVE9ORV9XQVJOX1NUUk9ORyA9IDE2O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVmVyc2lvbiBjb21wYXJpc29uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBkb3R0ZWQgdmVyc2lvbiBzdHJpbmdzIG51bWVyaWNhbGx5LlxuICogUmV0dXJucyAxIGlmIGEgPiBiLCAtMSBpZiBhIDwgYiwgMCBpZiBlcXVhbC4gTWlzc2luZyAvIG5vbi1udW1lcmljXG4gKiBjb21wb25lbnRzIGFyZSB0cmVhdGVkIGFzIDAgc28gJzEuMTAuMCcgY29ycmVjdGx5IHNvcnRzIGFib3ZlICcxLjkuMCdcbiAqIChhIHBsYWluIHN0cmluZyBjb21wYXJlIHdvdWxkIHB1dCAnMS45LjAnIGZpcnN0KS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNlbXZlcihhLCBiKSB7XG4gICAgY29uc3QgcGEgPSBTdHJpbmcoYSkuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBwYiA9IFN0cmluZyhiKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KHBhLmxlbmd0aCwgcGIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHggPSBwYXJzZUludChwYVtpXSwgMTApIHx8IDA7XG4gICAgICAgIGNvbnN0IHkgPSBwYXJzZUludChwYltpXSwgMTApIHx8IDA7XG4gICAgICAgIGlmICh4ID4geSkgcmV0dXJuIDE7XG4gICAgICAgIGlmICh4IDwgeSkgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCBzeW5jIHBheWxvYWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGxvY2FsIGRhdGEgYW5kIGJ1aWxkIGEgcHJpb3JpdGlzZWQgbGlzdCBvZiBlbnRyaWVzIHRvIHN5bmMuXG4gKiBSZXR1cm5zIHsgZW50cmllczogW3sga2V5LCBqc29uU3RyaW5nLCBwcmlvcml0eSwgc2l6ZSB9XSwgdG90YWxTaXplIH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gVDAtNTogYSBzZWNyZXQgaXMgb25seSBldmVyIGVtaXR0ZWQgdG8gc3RvcmFnZS5zeW5jIChHb29nbGUvaUNsb3VkKSBpZiBpdFxuICAgIC8vIGlzIGFscmVhZHkgYW4gZW5jcnlwdGVkIGJsb2IuIEFueSB2YWx1ZSB0aGF0IGlzIE5PVCBjaXBoZXJ0ZXh0IGlzIHJlZnVzZWRcbiAgICAvLyAoZHJvcHBlZCkgc28gcGxhaW50ZXh0IHByaXZhdGUga2V5cyAvIEFQSSBzZWNyZXRzIC8gbm90ZXMgY2FuIG5ldmVyIGxlYXZlXG4gICAgLy8gdGhlIGRldmljZS4gYCcnYCAoZW1wdHkgLyBidW5rZXIpIGlzIGFsbG93ZWQgdGhyb3VnaCBhcyBub24tc2VjcmV0LlxuICAgIGNvbnN0IHNlY3JldE9rID0gdiA9PiAhdiB8fCBpc0NpcGhlcnRleHQodik7XG5cbiAgICAvLyBUb21ic3RvbmVzIChpc3N1ZSAjMykuIEEgZG9jL2tleSBpcyBzdXBwcmVzc2VkIGZyb20gdGhlIHBheWxvYWQgd2hlbiBhXG4gICAgLy8gdG9tYnN0b25lIGRhdGVkIGF0LW9yLWFmdGVyIGl0cyB1cGRhdGVkQXQgZXhpc3RzLCBzbyBhIHN0YWxlIGxvY2FsIGNvcHlcbiAgICAvLyBjYW5ub3QgcmUtcHVzaCBhIGRlbGV0ZWQgaXRlbSBiYWNrIGludG8gdGhlIG1pcnJvci5cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IChhbGwuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGFsbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWREb2NzIDoge307XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSAoYWxsLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBhbGwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkS2V5cyA6IHt9O1xuICAgIGNvbnN0IGRlbGV0ZWRQcm9maWxlcyA9IChhbGwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBhbGwuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZFByb2ZpbGVzIDoge307XG5cbiAgICAvLyBBIHByb2ZpbGUncyBzdGFibGUgaWRlbnRpdHkgZm9yIHRvbWJzdG9uZSAvIHJlY2VuY3kga2V5aW5nOiBpdHMgcHVia2V5LFxuICAgIC8vIGVsc2UgKGZvciBhIGJ1bmtlcikgaXRzIHJlbW90ZSBwdWJrZXkuIE1hdGNoZXMgbWVyZ2VJbnRvTG9jYWwncyBpZGVudGl0eU9mLlxuICAgIGNvbnN0IGlkZW50aXR5T2YgPSAocCkgPT4gKHAgJiYgKHAucHViS2V5IHx8IHAucmVtb3RlUHVia2V5KSkgfHwgbnVsbDtcblxuICAgIC8vIFAwOiBUb21ic3RvbmVzIFx1MjAxNCB0aGUgZ3VhcmFudGVlZCBzbG90IChlbWl0dGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlKS5cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZERvY3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWREb2NzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZERvY3MnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkS2V5cykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkS2V5cycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRQcm9maWxlcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZFByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZFByb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFAxOiBQcm9maWxlcyAoc3RyaXAgYGhvc3RzYCB0byBzYXZlIHNwYWNlKSArIHByb2ZpbGVJbmRleFxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IHJlZGFjdFByb2ZpbGVzKGFsbC5wcm9maWxlcylcbiAgICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBwcm9maWxlIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KSxcbiAgICAgICAgICAgICAgICAvLyBzbyBhIHN0YWxlIGxvY2FsIGNvcHkgY2Fubm90IHJlLXB1c2ggYSBkZWxldGVkIGlkZW50aXR5LlxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShpZCAhPSBudWxsICYmIGRlbGV0ZWRQcm9maWxlc1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdID49IChwLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm1hcChwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgICAgIGlmIChyZXN0LnByaXZLZXkgJiYgIXNlY3JldE9rKHJlc3QucHJpdktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHByaXZLZXkgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdC5wcml2S2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgLy8gTk9URTogYGlzRW5jcnlwdGVkYCAodGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGZsYWcpIGlzIGRlbGliZXJhdGVseSBOT1RcbiAgICAvLyBzeW5jZWQuIEl0IGlzIGEgcGVyLWRldmljZSBmYWN0IFx1MjAxNCBhIGRldmljZSBob2xkcyB0aGUgcGFzc3dvcmQgdmVyaWZpZXIgb3JcbiAgICAvLyBpdCBkb2VzIG5vdCBcdTIwMTQgYW5kIG1pcnJvcmluZyBpdCBvbmNlIGxhdGNoZWQgYSBwYXNzd29yZGxlc3MgZGV2aWNlIGludG8gYVxuICAgIC8vIGRlYWQtZW5kIGxvY2sgc2NyZWVuIGl0IGhhZCBubyBwYXNzd29yZCBmb3IuIFNlZSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkuXG5cbiAgICAvLyBQMjogU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrIG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoYWxsW2tdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYWxsKSkge1xuICAgICAgICBpZiAoay5zdGFydHNXaXRoKCdmZWF0dXJlOicpKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFAzOiBBUEkga2V5IHZhdWx0IFx1MjAxNCBvbmx5IHN5bmMga2V5cyB3aG9zZSBzZWNyZXQgaXMgY2lwaGVydGV4dCAoVDAtNSlcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0ICYmIGFsbC5hcGlLZXlWYXVsdC5rZXlzKSB7XG4gICAgICAgIGNvbnN0IHNhZmVLZXlzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGFsbC5hcGlLZXlWYXVsdC5rZXlzKSkge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBrZXkgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSAhPSBudWxsICYmIGRlbGV0ZWRLZXlzW2lkXSA+PSAoa2V5LnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlY3JldE9rKGtleS5zZWNyZXQpKSB7XG4gICAgICAgICAgICAgICAgc2FmZUtleXNbaWRdID0ga2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgQVBJIHNlY3JldCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYXVsdCA9IHsgLi4uYWxsLmFwaUtleVZhdWx0LCBrZXlzOiBzYWZlS2V5cyB9O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2FmZVZhdWx0KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnYXBpS2V5VmF1bHQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDNfQVBJS0VZUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDQ6IFZhdWx0IGRvY3MgKGluZGl2aWR1YWxseSwgbmV3ZXN0IGZpcnN0KSBcdTIwMTQgb25seSBpZiBjb250ZW50IGlzIGNpcGhlcnRleHRcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBkb2MgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWREb2NzW2RvYy5wYXRoXSAhPSBudWxsICYmIGRlbGV0ZWREb2NzW2RvYy5wYXRoXSA+PSAoZG9jLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzZWNyZXRPayhkb2MuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgdmF1bHQgY29udGVudCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFdyaXRlIGEgcHJpb3JpdGlzZWQsIHByZS1jaHVua2VkIHBheWxvYWQgdG8gc3RvcmFnZS5zeW5jLCByZXRyeWluZyBvbiBhblxuICogb3Zlci1xdW90YSByZWplY3Rpb24gYnkgZHJvcHBpbmcgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsIHByZXNlbnQgYW5kXG4gKiB0cnlpbmcgYWdhaW4uIFAwICh0b21ic3RvbmVzKSBhbmQgUDEgKHByb2ZpbGVzKSBhcmUgTkVWRVIgZHJvcHBlZCBcdTIwMTQgYSBmdWxsXG4gKiBiYXRjaCBmYWlsdXJlIHdvdWxkIHN0cmFuZCBhIGRlbGV0aW9uIG9yIGEga2V5LCBzbyB0aGUgaW1wb3J0YW50IHRpZXJzIHN5bmNcbiAqIGV2ZW4gd2hlbiB0aGUgYnVsa3kgb25lcyBjYW5ub3QuXG4gKlxuICogQHBhcmFtIHt7IHByaW9yaXR5OiBudW1iZXIsIGNodW5rczoge2tleTpzdHJpbmcsIHZhbHVlOnN0cmluZ31bXSB9W119IGluY2x1ZGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fSBudW1iZXIgb2YgZGF0YSBrZXlzIGFjdHVhbGx5IHdyaXR0ZW5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2V0U3luY1Jlc3BlY3RpbmdRdW90YShpbmNsdWRlZCkge1xuICAgIGxldCB0aWVycyA9IGluY2x1ZGVkLnNsaWNlKCk7XG4gICAgLy8gR3VhcmQgYWdhaW5zdCBhbiB1bmJvdW5kZWQgbG9vcDogYXQgbW9zdCBvbmUgcmV0cnkgcGVyIGRpc3RpbmN0IHByaW9yaXR5LlxuICAgIGZvciAobGV0IGF0dGVtcHQgPSAwOyA7IGF0dGVtcHQrKykge1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGllcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBpdGVtLmNodW5rcykge1xuICAgICAgICAgICAgICAgIHN5bmNQYXlsb2FkW2Mua2V5XSA9IGMudmFsdWU7XG4gICAgICAgICAgICAgICAgYWxsU3luY0tleXMucHVzaChjLmtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeSh7IGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksIGtleXM6IGFsbFN5bmNLZXlzIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChzeW5jUGF5bG9hZCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVtb3ZlIGFueSBleGlzdGluZyBzeW5jIGtleSBub3QgaW4gb3VyIHBheWxvYWQuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFsbFN5bmNLZXlzLmxlbmd0aDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gT3ZlciBxdW90YSAob3IgTUFYX0lURU1TKSBcdTIwMTQgZHJvcCB0aGUgbG93ZXN0LXByaW9yaXR5IHRpZXIgc3RpbGxcbiAgICAgICAgICAgIC8vIHByZXNlbnQgYW5kIHJldHJ5LiBOZXZlciBkcm9wIFAwL1AxLlxuICAgICAgICAgICAgY29uc3QgbWF4UHJpb3JpdHkgPSB0aWVycy5yZWR1Y2UoKG0sIHQpID0+IE1hdGgubWF4KG0sIHQucHJpb3JpdHkpLCAtMSk7XG4gICAgICAgICAgICBpZiAobWF4UHJpb3JpdHkgPD0gUFJJT1JJVFkuUDFfUFJPRklMRVMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlOyAvLyBub3RoaW5nIGRyb3BwYWJsZSBsZWZ0OyBQMC9QMSBtdXN0IHN1cnZpdmUgb3IgZmFpbCBsb3VkbHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IHRpZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpZXJzID0gdGllcnMuZmlsdGVyKHQgPT4gdC5wcmlvcml0eSA8IG1heFByaW9yaXR5KTtcbiAgICAgICAgICAgIGlmICh0aWVycy5sZW5ndGggPT09IGJlZm9yZSkgdGhyb3cgZTsgLy8gbm8gcHJvZ3Jlc3MgXHUyMDE0IGJhaWxcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBzeW5jLnNldCBvdmVyIHF1b3RhIFx1MjAxNCBkcm9wcGVkIHByaW9yaXR5ICR7bWF4UHJpb3JpdHl9IHRpZXIsIHJldHJ5aW5nYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIFB1bGwtbWVyZ2UgQkVGT1JFIGJ1aWxkaW5nOiBvcnBoYW4tY2xlYW51cCBiZWxvdyB3aXBlcyBhbnkgbWlycm9yIGtleVxuICAgICAgICAvLyBhYnNlbnQgZnJvbSB0aGlzIGRldmljZSdzIHBheWxvYWQsIHNvIHdlIG11c3QgZmlyc3QgYWJzb3JiIHJlbW90ZVxuICAgICAgICAvLyBzdGF0ZSAoZXNwZWNpYWxseSByZW1vdGUgdG9tYnN0b25lcywgd2hpY2ggdGhlbiBzdXBwcmVzcyB0aGUgbWF0Y2hpbmdcbiAgICAgICAgLy8gZG9jcy9rZXlzIGZyb20gdGhlIHBheWxvYWQgd2UgYXJlIGFib3V0IHRvIGJ1aWxkKS4gV2l0aG91dCB0aGlzIGFcbiAgICAgICAgLy8gZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIHdvdWxkIHJlLXB1c2ggdGhlIGl0ZW0uXG4gICAgICAgIGNvbnN0IHJlbW90ZSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAocmVtb3RlKSBhd2FpdCBtZXJnZUludG9Mb2NhbChyZW1vdGUpO1xuXG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBpbmNsdWRlZCBzZXQgcmVzcGVjdGluZyB0aGUgaW4tY29kZSBieXRlL2l0ZW0gYnVkZ2V0LlxuICAgICAgICBsZXQgdXNlZEJ5dGVzID0gMDtcbiAgICAgICAgbGV0IHVzZWRJdGVtcyA9IDA7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBidWRnZXRFeGhhdXN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmIChidWRnZXRFeGhhdXN0ZWQpIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1ZhbHVlKGVudHJ5LmtleSwgZW50cnkuanNvblN0cmluZyk7XG4gICAgICAgICAgICBsZXQgZW50cnlTaXplID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBlbnRyeVNpemUgKz0gYy5rZXkubGVuZ3RoICsgKHR5cGVvZiBjLnZhbHVlID09PSAnc3RyaW5nJyA/IGMudmFsdWUubGVuZ3RoIDogSlNPTi5zdHJpbmdpZnkoYy52YWx1ZSkubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVzZWRCeXRlcyArIGVudHJ5U2l6ZSA+IFNZTkNfUVVPVEEgLSA1MDAgfHwgdXNlZEl0ZW1zICsgY2h1bmtzLmxlbmd0aCA+IE1BWF9JVEVNUyAtIDUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkucHJpb3JpdHkgPD0gUFJJT1JJVFkuUDNfQVBJS0VZUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcml0aWNhbCBkYXRhIChpbmNsLiBQMCB0b21ic3RvbmVzKSBcdTIwMTQgaW5jbHVkZSBhbnl3YXk7IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBydW50aW1lIHF1b3RhIGZhbGxiYWNrIHdpbGwgc2hlZCBidWxreSB0aWVycyBpZiB0aGUgQVBJIHJlamVjdHMuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU3luY01hbmFnZXJdIEJ1ZGdldCBleGhhdXN0ZWQgYXQgcHJpb3JpdHkgJHtlbnRyeS5wcmlvcml0eX0sIHNraXBwaW5nIHJlbWFpbmluZyBlbnRyaWVzYCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldEV4aGF1c3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaCh7IHByaW9yaXR5OiBlbnRyeS5wcmlvcml0eSwgY2h1bmtzIH0pO1xuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHt3cml0dGVufSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsRnJvbVN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm4gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICBpZiAoIXJhdyB8fCBPYmplY3Qua2V5cyhyYXcpLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbWV0YVN0ciA9IHJhd1tTWU5DX01FVEFfS0VZXTtcbiAgICAgICAgaWYgKCFtZXRhU3RyKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQgbWV0YTtcbiAgICAgICAgdHJ5IHsgbWV0YSA9IEpTT04ucGFyc2UobWV0YVN0cik7IH0gY2F0Y2ggeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICAvLyBDb2xsZWN0IHRoZSBub24tY2h1bmssIG5vbi1tZXRhIGtleXNcbiAgICAgICAgY29uc3QgZGF0YUtleXMgPSBtZXRhLmtleXMuZmlsdGVyKGsgPT4gIWsuc3RhcnRzV2l0aChDSFVOS19QUkVGSVgpICYmIGsgIT09IFNZTkNfTUVUQV9LRVkpO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGFLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCByYXcpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0Ll9zeW5jTWV0YSA9IG1ldGE7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1bGxGcm9tU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1lcmdlIGxvZ2ljXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gVGhlIGJhY2tncm91bmQncyBvd24gd2F5IHRvIGhlYXIgb2YgbW92ZWQgcHJvZmlsZXMuIEEgd29ya2VyIGNhbm5vdCBtZXNzYWdlXG4vLyBpdHNlbGYsIHNvIGEgbWVyZ2UgcnVubmluZyB0aGVyZSBjYWxscyB0aGlzOyBhIHBhZ2Ugc2VuZHMgYSBtZXNzYWdlLlxubGV0IHByb2ZpbGVNb3ZlSGFuZGxlciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9maWxlTW92ZUhhbmRsZXIoaGFuZGxlcikge1xuICAgIHByb2ZpbGVNb3ZlSGFuZGxlciA9IGhhbmRsZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKSB7XG4gICAgaWYgKHByb2ZpbGVNb3ZlSGFuZGxlcikge1xuICAgICAgICBwcm9maWxlTW92ZUhhbmRsZXIobW92ZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Byb2ZpbGVzTW92ZWQnLCBwYXlsb2FkOiBtb3ZlcyB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmFja2dyb3VuZCB1bmF2YWlsYWJsZTogd2hhdCBpcyBrZXllZCBieSBpbmRleCBjaGVja3MgaXRzIGlkZW50aXR5ICovIH1cbn1cblxuLyoqXG4gKiBXaGVyZSBlYWNoIHByb2ZpbGUgd2VudC4gQW4gdW50b3VjaGVkIHJlY29yZCBpcyBmb3VuZCBhcyBpdHNlbGYsIGFuZCBvbmUgc3luY1xuICogcmVwbGFjZWQgaXMgZm91bmQgYnkgaWRlbnRpdHkuIEVhY2ggcGxhY2UgaXMgY2xhaW1lZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0W119IGJlZm9yZVxuICogQHBhcmFtIHtvYmplY3RbXX0gYWZ0ZXJcbiAqIEBwYXJhbSB7KHByb2ZpbGU6IG9iamVjdCkgPT4gP3N0cmluZ30gaWRlbnRpdHlPZlxuICogQHJldHVybnMge0FycmF5PFtudW1iZXIsID9udW1iZXJdPn0gW29sZCBpbmRleCwgbmV3IGluZGV4IG9yIG51bGwgaWYgZ29uZV0sIGNoYW5nZXMgb25seVxuICovXG5mdW5jdGlvbiBwcm9maWxlTW92ZXMoYmVmb3JlLCBhZnRlciwgaWRlbnRpdHlPZikge1xuICAgIGNvbnN0IHBsYWNlcyA9IGJlZm9yZS5tYXAocHJvZmlsZSA9PiBhZnRlci5pbmRleE9mKHByb2ZpbGUpKTtcbiAgICBjb25zdCBjbGFpbWVkID0gbmV3IFNldChwbGFjZXMpO1xuICAgIGJlZm9yZS5mb3JFYWNoKChwcm9maWxlLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwcm9maWxlKTtcbiAgICAgICAgaWYgKHBsYWNlc1tpXSA+PSAwIHx8ICFpZCkgcmV0dXJuO1xuICAgICAgICBwbGFjZXNbaV0gPSBhZnRlci5maW5kSW5kZXgoKG90aGVyLCBqKSA9PiAhY2xhaW1lZC5oYXMoaikgJiYgaWRlbnRpdHlPZihvdGhlcikgPT09IGlkKTtcbiAgICAgICAgY2xhaW1lZC5hZGQocGxhY2VzW2ldKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGxhY2VzLmZsYXRNYXAoKHBsYWNlLCBpKSA9PiAocGxhY2UgPT09IGkgPyBbXSA6IFtbaSwgcGxhY2UgPCAwID8gbnVsbCA6IHBsYWNlXV0pKTtcbn1cblxuLyoqXG4gKiBNZXJnZSBzeW5jIGRhdGEgaW50byBsb2NhbCBzdG9yYWdlIHdpdGggY29uZmxpY3QgcmVzb2x1dGlvbi5cbiAqXG4gKiBDT05ESVRJT04gMyAoaXNzdWUgIzMgbG9vcCBpbnZhcmlhbnQpOiBldmVyeSB3cml0ZSBoZXJlIGdvZXMgdGhyb3VnaCB0aGUgcmF3XG4gKiBtb2R1bGUtbGV2ZWwgYHN0b3JhZ2VgICg9IGFwaS5zdG9yYWdlLmxvY2FsKSB2aWEgYSBzaW5nbGUgYHN0b3JhZ2Uuc2V0YC4gSXRcbiAqIE1VU1QgTk9UIGNhbGwgdGhlIHN0b3JlLWxheWVyIGhlbHBlcnMgKGRlbGV0ZURvY3VtZW50TG9jYWwgLyBzYXZlRG9jdW1lbnRMb2NhbFxuICogLyBkZWxldGVBcGlLZXkgLyBzYXZlQXBpS2V5KSwgYmVjYXVzZSB0aG9zZSBjYWxsIHNjaGVkdWxlU3luY1B1c2goKSBcdTIwMTQgYSBtZXJnZVxuICogdGhhdCBzY2hlZHVsZWQgYSBwdXNoIHdvdWxkIHR1cm4gZXZlcnkgaW5jb21pbmcgc3luYyBpbnRvIGFuIG91dGdvaW5nIG9uZSBhbmRcbiAqIGxvb3AuIEEgcmVncmVzc2lvbiB0ZXN0IGFzc2VydHMgbWVyZ2VJbnRvTG9jYWwgbmV2ZXIgc2NoZWR1bGVzIGEgcHVzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBzeW5jRGF0YSA9IHsgLi4uc3luY0RhdGEsIHByb2ZpbGVzOiByZWRhY3RQcm9maWxlcyhzeW5jRGF0YS5wcm9maWxlcykgfTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZWN0IGZyZXNoIGluc3RhbGw6IG5vIHByb2ZpbGVzLCBvciBhIHNpbmdsZSB1bnRvdWNoZWQgZGVmYXVsdCBwcm9maWxlLlxuICAgIC8vIChEZWZhdWx0IGtleXMgYXJlIG5vdyB3cmFwcGVkIGF0IHJlc3QsIHNvIGBwcml2S2V5YCBpcyB0cnV0aHkgZXZlbiBvbiBhXG4gICAgLy8gZnJlc2ggaW5zdGFsbCBcdTIwMTQgZGV0ZWN0IHRoZSB1bnRvdWNoZWQgZGVmYXVsdCBieSBpdHMgbmFtZSArIGFic2VuY2Ugb2YgYW55XG4gICAgLy8gcGVyLXNpdGUgZ3JhbnRzIGluc3RlYWQuKVxuICAgIC8vXG4gICAgLy8gQzE6IGEgbG9uZSBwcm9maWxlIGlzIG9ubHkgXCJ1bnRvdWNoZWQvZnJlc2hcIiB3aGVuIGl0IGNhcnJpZXMgbm8gaWRlbnRpdHkuXG4gICAgLy8gQSBsb25lIEJVTktFUiBwcm9maWxlIGhhcyBwcml2S2V5OicnIGJ1dCBJUyBhIHJlYWwgaWRlbnRpdHkgKHR5cGUvYnVua2VyVXJsXG4gICAgLy8gL3JlbW90ZVB1YmtleSksIGFuZCBtdXN0IG5vdCBiZSB0cmVhdGVkIGFzIGZyZXNoIGFuZCB3aXBlZCBieSBhIHN5bmMgcHVsbC5cbiAgICBjb25zdCBoYXNJZGVudGl0eSA9IChwKSA9PiAhIShwICYmIChcbiAgICAgICAgcC5wcml2S2V5IHx8IHAucHViS2V5IHx8IHAudHlwZSA9PT0gJ2J1bmtlcicgfHwgcC5idW5rZXJVcmwgfHwgcC5yZW1vdGVQdWJrZXlcbiAgICApKTtcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkgJiYgIWhhc0lkZW50aXR5KGxvbmUpKSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gU3RhYmxlIGlkZW50aXR5IGZvciBwcm9maWxlIG1hdGNoaW5nIC8gdG9tYnN0b25lczogcHViS2V5LCBlbHNlIHRoZVxuICAgIC8vIGJ1bmtlcidzIHJlbW90ZVB1YmtleS4gTWF0Y2hlcyBidWlsZFN5bmNQYXlsb2FkJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBBQ1RJVkUgaWRlbnRpdHkgQkVGT1JFIGFueSByZW9yZGVyaW5nL3JlbW92YWwgc28gdGhlIGFjdGl2ZVxuICAgIC8vIGluZGV4IGNhbiBmb2xsb3cgdGhhdCBpZGVudGl0eSB0aHJvdWdoIHRoZSBtZXJnZSAoYSBrZXkgbWFuYWdlciBtdXN0IG5vdFxuICAgIC8vIHNpbGVudGx5IHN3aXRjaCB3aGljaCBpZGVudGl0eSBpcyBhY3RpdmUganVzdCBiZWNhdXNlIGEgcHJvZmlsZSBvcmRlcmVkXG4gICAgLy8gYmVmb3JlIGl0IHdhcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlKS5cbiAgICBjb25zdCBsb2NhbEFjdGl2ZUluZGV4ID0gKGxvY2FsLnByb2ZpbGVJbmRleCAhPSBudWxsKSA/IGxvY2FsLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgY29uc3QgYWN0aXZlSWQgPSAobG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgID8gaWRlbnRpdHlPZihsb2NhbC5wcm9maWxlc1tsb2NhbEFjdGl2ZUluZGV4XSlcbiAgICAgICAgOiBudWxsO1xuXG4gICAgLy8gLS0tIFByb2ZpbGUgdG9tYnN0b25lcyAoaXNzdWUgIzMpIFx1MjAxNCB1bmlvbiBsb2NhbCArIHJlbW90ZSwgbWF4IHBlciBpZGVudGl0eSAtLS1cbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSB7IC4uLihsb2NhbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkUHJvZmlsZXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRQcm9maWxlc1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRQcm9maWxlc1tpZF0pIGRlbGV0ZWRQcm9maWxlc1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlcyAoUDEpIFx1MjAxNCBwdWJrZXkta2V5ZWQgbWVyZ2UgKyB0b21ic3RvbmUgcmVtb3ZhbCAtLS1cbiAgICAvLyBNYXRjaCBieSBzdGFibGUgaWRlbnRpdHkgcmF0aGVyIHRoYW4gYXJyYXkgaW5kZXgsIHNvIGEgcmVvcmRlcmVkIG9yIHBhcnRpYWxcbiAgICAvLyBzeW5jIHBheWxvYWQgY2Fubm90IG92ZXJ3cml0ZSBvbmUgaWRlbnRpdHkncyBrZXkgbWF0ZXJpYWwgd2l0aCBhbm90aGVyJ3MuXG4gICAgbGV0IG1lcmdlZFByb2ZpbGVzID0gbG9jYWwucHJvZmlsZXMgPyBbLi4ubG9jYWwucHJvZmlsZXNdIDogbnVsbDtcbiAgICBsZXQgcHJvZmlsZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IHN5bmNEYXRhLnByb2ZpbGVzLnNsaWNlKCk7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleEJ5SWRlbnRpdHkgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiAhaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN5bmNQcm9maWxlIG9mIHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IGluZGV4QnlJZGVudGl0eS5nZXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFByb2ZpbGUgPSBtZXJnZWRQcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgYWRvcHQgaXQgYnV0IHByZXNlcnZlIGxvY2FsIHBlci1zaXRlIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlc1tpXSA9IHsgLi4uc3luY1Byb2ZpbGUsIGhvc3RzOiBsb2NhbFByb2ZpbGUuaG9zdHMgfHwge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZ2VudWluZWx5IG5ldyBpZGVudGl0eSBub3QgcHJlc2VudCBsb2NhbGx5IFx1MjAxNCBhcHBlbmQgaXQuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzLnB1c2goc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIGtleWxlc3MgcmVtb3RlIHByb2ZpbGUgY2Fubm90IGJlIHJlY29uY2lsZWQgdG8gYSBsb2NhbCBvbmVcbiAgICAgICAgICAgICAgICAvLyBzYWZlbHkgKG5vIGlkZW50aXR5IHRvIG1hdGNoIG9uKSwgc28gaXQgaXMgc2tpcHBlZC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGx5IHByb2ZpbGUgdG9tYnN0b25lczogcmVtb3ZlIGFueSBtZXJnZWQgcHJvZmlsZSB3aG9zZSBpZGVudGl0eSBoYXNcbiAgICAvLyAodXBkYXRlZEF0IDw9IGRlbGV0ZWRBdCkgXHUyMDE0IGRlbGV0aW9uIHdpbnMgdGllcywgY29uc2lzdGVudCB3aXRoIGRvY3Mva2V5cy5cbiAgICAvLyBBIHJlY3JlYXRlZCBwcm9maWxlICh1cGRhdGVkQXQgPiBkZWxldGVkQXQpIHN1cnZpdmVzLiBOZXZlciBwcnVuZSB0b21ic3RvbmVzLlxuICAgIGlmIChtZXJnZWRQcm9maWxlcyAmJiBPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qga2VwdCA9IG1lcmdlZFByb2ZpbGVzLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gaWQgIT0gbnVsbCA/IGRlbGV0ZWRQcm9maWxlc1tpZF0gOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuICEodHMgIT0gbnVsbCAmJiAocC51cGRhdGVkQXQgfHwgMCkgPD0gdHMpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2FmZXR5OiBuZXZlciBsZXQgYSBzeW5jIG1lcmdlIGxlYXZlIFpFUk8gcHJvZmlsZXMgKHRoYXQgd291bGQgb3JwaGFuXG4gICAgICAgIC8vIHRoZSBhY3RpdmUgaW5kZXggYW5kIGJyaWNrIHRoZSBVSSkuIElmIHJlbW92YWwgd291bGQgZW1wdHkgdGhlIGxpc3QsXG4gICAgICAgIC8vIGtlZXAgdGhlIHByb2ZpbGVzIGFzLWlzIFx1MjAxNCB0aGUgbG9jYWwgdXNlciBjYW4gc3RpbGwgZGVsZXRlIGRlbGliZXJhdGVseS5cbiAgICAgICAgLy8gRGVsaWJlcmF0ZSB0cmFkZS1vZmY6IGNyb3NzLWRldmljZSBkZWxldGlvbiBkb2VzIE5PVCBjb252ZXJnZSBvbiBhXG4gICAgICAgIC8vIGRldmljZSB3aGVyZSBhcHBseWluZyBpdCB3b3VsZCBsZWF2ZSB6ZXJvIHByb2ZpbGVzOyB0aGUgcHJvZmlsZSBzdGF5c1xuICAgICAgICAvLyB0b21ic3RvbmUtc3VwcHJlc3NlZCBvbiBlbWl0LCBzbyBpdCBkb2VzIG5vdCByZS1wcm9wYWdhdGUgdG8gb3RoZXJzLlxuICAgICAgICBpZiAoa2VwdC5sZW5ndGggIT09IG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAmJiBrZXB0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzID0ga2VwdDtcbiAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbW92ZXMgPSBbXTtcbiAgICBpZiAocHJvZmlsZXNDaGFuZ2VkICYmIG1lcmdlZFByb2ZpbGVzKSB7XG4gICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBtZXJnZWRQcm9maWxlcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdmVzID0gcHJvZmlsZU1vdmVzKGxvY2FsLnByb2ZpbGVzIHx8IFtdLCBtZXJnZWRQcm9maWxlcywgaWRlbnRpdHlPZik7XG4gICAgICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwICYmIGxvY2FsLmJ1bmtlclNlc3Npb25zKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmJ1bmtlclNlc3Npb25zID0gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGxvY2FsLmJ1bmtlclNlc3Npb25zLCBtb3Zlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIFx1MjAxNCBGT0xMT1cgVEhFIEFDVElWRSBJREVOVElUWSBhY3Jvc3MgdGhlIG1lcmdlIC0tLVxuICAgIC8vIFRoZSBhY3RpdmUgaW5kZXggdHJhY2tzIHRoZSBhY3RpdmUgaWRlbnRpdHksIG5vdCBhIHJhdyBzbG90OiBpZiBhIHByb2ZpbGVcbiAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgYWN0aXZlIG9uZSBpcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlLCB0aGUgaW5kZXhcbiAgICAvLyBzaGlmdHMgc28gdGhlIFNBTUUgaWRlbnRpdHkgc3RheXMgYWN0aXZlLiBUaGUgaW5kZXggb25seSBtb3ZlcyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGlkZW50aXR5IHdoZW4gdGhlIGFjdGl2ZSBvbmUgaXMgaXRzZWxmIGdvbmUgKHRvbWJzdG9uZWQpLCBvciBvbiBhXG4gICAgLy8gZnJlc2ggYWRvcHQgXHUyMDE0IHRoZW4gaXQgZmFsbHMgYmFjayB0byB0aGUgc2FmZSBjbGFtcC5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgZGVzaXJlZEluZGV4O1xuICAgICAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMgJiYgaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggYWRvcHQgXHUyMDE0IHRha2Ugc3luYydzIGFjdGl2ZSBpbmRleCwgY2xhbXBlZCBpbnRvIHJhbmdlLlxuICAgICAgICAgICAgY29uc3QgYmFzZSA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsID8gc3luY0RhdGEucHJvZmlsZUluZGV4IDogMDtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGJhc2UsIDApLCBtZXJnZWRQcm9maWxlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd2VkID0gYWN0aXZlSWQgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gbWVyZ2VkUHJvZmlsZXMuZmluZEluZGV4KHAgPT4gaWRlbnRpdHlPZihwKSA9PT0gYWN0aXZlSWQpXG4gICAgICAgICAgICAgICAgOiAtMTtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IGZvbGxvd2VkID49IDBcbiAgICAgICAgICAgICAgICA/IGZvbGxvd2VkXG4gICAgICAgICAgICAgICAgOiBNYXRoLm1pbihNYXRoLm1heChsb2NhbEFjdGl2ZUluZGV4LCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlc2lyZWRJbmRleCAhPT0gbG9jYWwucHJvZmlsZUluZGV4KSB7XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IGRlc2lyZWRJbmRleDtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSAtLS1cbiAgICAvLyBBMjogYGlzRW5jcnlwdGVkYCBpcyBOT1QgbWVyZ2VkLiBUaGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgaXMgYSBwZXItZGV2aWNlXG4gICAgLy8gZmFjdCBwcm92ZW4gYnkgdGhlIGxvY2FsIHZlcmlmaWVyOyBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzXG4gICAgLy8gZGV2aWNlIGludG8gYSBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gLS0tIFNldHRpbmdzIChQMikgXHUyMDE0IGxhc3Qtd3JpdGUtd2lucyAtLS1cbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChzeW5jRGF0YVtrZXldICE9IG51bGwgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgLy8gRm9yIHZlcnNpb24sIG9ubHkgYWNjZXB0IGEgbnVtZXJpY2FsbHktaGlnaGVyIG9uZSAoJzEuMTAuMCcgPiAnMS45LjAnKS5cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIGNvbXBhcmVTZW12ZXIoc3luY0RhdGEudmVyc2lvbiwgbG9jYWwudmVyc2lvbikgPD0gMCkgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBkZWxldGVkQXQgcGVyIGtleSAtLS1cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkRG9jcyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkRG9jcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1twYXRoXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZERvY3NbcGF0aF0pIGRlbGV0ZWREb2NzW3BhdGhdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSB7IC4uLihsb2NhbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZEtleXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRLZXlzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZEtleXNbaWRdKSBkZWxldGVkS2V5c1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgLy8gQnVpbGQgdGhlIG1lcmdlZCBrZXkgc2V0LCBmb2xkIGluIGFueSByZW1vdGUga2V5cywgdGhlbiBhcHBseSBrZXlcbiAgICAvLyB0b21ic3RvbmVzLiBSdW5zIGV2ZW4gd2hlbiB0aGUgcHVsbCBjYXJyaWVzIE5PIGFwaUtleVZhdWx0LCBzbyBhXG4gICAgLy8gZGVsZXRlLW9ubHkgcHVsbCBjYW4gc3RpbGwgcmVtb3ZlIGEgbG9jYWxseS1oZWxkIGtleS5cbiAgICB7XG4gICAgICAgIGxldCBiYXNlVmF1bHQgPSBsb2NhbC5hcGlLZXlWYXVsdCB8fCBudWxsO1xuICAgICAgICBsZXQgbWVyZ2VkS2V5cyA9IHsgLi4uKChsb2NhbC5hcGlLZXlWYXVsdCAmJiBsb2NhbC5hcGlLZXlWYXVsdC5rZXlzKSB8fCB7fSkgfTtcbiAgICAgICAgbGV0IGFwaUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCghbG9jYWwuYXBpS2V5VmF1bHQgfHwgaXNGcmVzaCkgJiYgc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgICAgIGJhc2VWYXVsdCA9IHN5bmNEYXRhLmFwaUtleVZhdWx0O1xuICAgICAgICAgICAgbWVyZ2VkS2V5cyA9IHsgLi4uKHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge30pIH07XG4gICAgICAgICAgICBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICAgICAgY29uc3Qgc3luY0tleXMgPSBzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzIHx8IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIHN5bmNLZXldIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNLZXlzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5ID0gbWVyZ2VkS2V5c1tpZF07XG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbEtleSB8fCAoc3luY0tleS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxLZXkudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZEtleXNbaWRdID0gc3luY0tleTtcbiAgICAgICAgICAgICAgICAgICAgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHRvbWJzdG9uZXMuIERlbGV0aW9uIHdpbnMgdGllcyAoYDw9YCksIGNvbnNpc3RlbnQgd2l0aCB0aGVcbiAgICAgICAgLy8gZW1pdC1zaWRlIHN1cHByZXNzaW9uIChgZGVsZXRlZEF0ID49IHVwZGF0ZWRBdGApOiBhIGtleSB3aG9zZVxuICAgICAgICAvLyB1cGRhdGVkQXQgZXF1YWxzIHRoZSB0b21ic3RvbmUgd2FzIGRlbGV0ZWQgaW4gdGhhdCBzYW1lIHNlY29uZCwgc28gaXRcbiAgICAgICAgLy8gbXVzdCBOT1QgYmUgcmUtYWRkZWQgZnJvbSB0aGUgbWlycm9yIG9uIHRoZSBkZWxldGluZyBkZXZpY2UuIFRoZVxuICAgICAgICAvLyB0b21ic3RvbmUgaXMgTkVWRVIgcHJ1bmVkIGhlcmUgXHUyMDE0IHBydW5pbmcgaXQgd291bGQgbGV0IHRoZSB2ZXJ5IGNvcHkgaXRcbiAgICAgICAgLy8ganVzdCByZW1vdmVkIHJlc3VycmVjdCBvbiB0aGUgbmV4dCBtZXJnZS4gVG9tYnN0b25lcyBhcmUgY2xlYXJlZCBvbmx5XG4gICAgICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5IHRoZSB1c2VyLlxuICAgICAgICBmb3IgKGNvbnN0IGlkIG9mIE9iamVjdC5rZXlzKG1lcmdlZEtleXMpKSB7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGRlbGV0ZWRLZXlzW2lkXTtcbiAgICAgICAgICAgIGlmICh0cyAhPSBudWxsICYmIChtZXJnZWRLZXlzW2lkXS51cGRhdGVkQXQgfHwgMCkgPD0gdHMpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgbWVyZ2VkS2V5c1tpZF07XG4gICAgICAgICAgICAgICAgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwaUNoYW5nZWQgJiYgYmFzZVZhdWx0KSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0geyAuLi5iYXNlVmF1bHQsIGtleXM6IG1lcmdlZEtleXMgfTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCBtZXJnZWREb2NzID0geyAuLi4obG9jYWwudmF1bHREb2NzIHx8IHt9KSB9O1xuICAgIGxldCBkb2NzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCd2YXVsdERvYzonKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRvYyA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghZG9jIHx8ICFkb2MucGF0aCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGxvY2FsRG9jID0gbWVyZ2VkRG9jc1tkb2MucGF0aF07XG4gICAgICAgIGlmICghbG9jYWxEb2MgfHwgKGRvYy51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxEb2MudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICBtZXJnZWREb2NzW2RvYy5wYXRoXSA9IGRvYztcbiAgICAgICAgICAgIGRvY3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBBcHBseSBkb2MgdG9tYnN0b25lcy4gRGVsZXRpb24gd2lucyB0aWVzIChgPD1gKSwgYW5kIHRvbWJzdG9uZXMgYXJlIE5FVkVSXG4gICAgLy8gcHJ1bmVkIGhlcmUgXHUyMDE0IHNhbWUgcmF0aW9uYWxlIGFzIHRoZSBBUEkga2V5cyBhYm92ZS5cbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgT2JqZWN0LmtleXMobWVyZ2VkRG9jcykpIHtcbiAgICAgICAgY29uc3QgdHMgPSBkZWxldGVkRG9jc1twYXRoXTtcbiAgICAgICAgaWYgKHRzICE9IG51bGwgJiYgKG1lcmdlZERvY3NbcGF0aF0udXBkYXRlZEF0IHx8IDApIDw9IHRzKSB7XG4gICAgICAgICAgICBkZWxldGUgbWVyZ2VkRG9jc1twYXRoXTtcbiAgICAgICAgICAgIGRvY3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9jc0NoYW5nZWQpIHtcbiAgICAgICAgdXBkYXRlcy52YXVsdERvY3MgPSBtZXJnZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBQZXJzaXN0IHRoZSB0b21ic3RvbmUgc2V0cy4gVGhlc2UgYXJlIGEgUFVSRSBVTklPTiAobWF4IGRlbGV0ZWRBdCBwZXJcbiAgICAvLyBrZXkpIFx1MjAxNCB0aGUgbWVyZ2UgbmV2ZXIgcmVtb3ZlcyBhIHRvbWJzdG9uZSwgc28gdGhleSBhcmUgcmV0YWluZWQgZm9yZXZlclxuICAgIC8vIGFuZCBhbiBvZmZsaW5lIGRldmljZSBjYW5ub3QgcmVzdXJyZWN0IGEgZGVsZXRpb24uIFRoZXkgYXJlIGNsZWFyZWQgb25seVxuICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVEb2N1bWVudExvY2FsL3NhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5XG4gICAgLy8gdGhlIHVzZXIgdmlhIGNsZWFyRGVsZXRpb25IaXN0b3J5LlxuICAgIC8vXG4gICAgLy8gUmVzaWR1YWwgKGFjY2VwdGVkLCBkb2N1bWVudGVkKTogcHVyZSBjcm9zcy1kZXZpY2UgY2xvY2sgc2tldyBcdTIwMTQgYSBsaXZlXG4gICAgLy8gY29weSB3aG9zZSB1cGRhdGVkQXQgaXMgZ2VudWluZWx5IE5FV0VSIHRoYW4gdGhlIGRlbGV0ZSdzIHRpbWVzdGFtcCBcdTIwMTQgd2luc1xuICAgIC8vIHVuZGVyIHRoZSBgPD1gIHJ1bGUgYW5kIGlzIGtlcHQuIFRoYXQgaXMgYW4gaW5oZXJlbnQgbGFzdC13cml0ZS13aW5zIGxpbWl0XG4gICAgLy8gdGhhdCB0b21ic3RvbmVzIGRvIG5vdCByZXNvbHZlOyBcImZpeGluZ1wiIGl0IGJ5IHBydW5pbmcgd291bGQgcmVpbnRyb2R1Y2VcbiAgICAvLyB0aGUgc2FtZS1zZWNvbmQgcmVzdXJyZWN0aW9uIGJ1Zywgc28gaXQgaXMgbGVmdCBhcy1pcy5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkRG9jcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkRG9jcyA9IGRlbGV0ZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRLZXlzKSAhPT0gSlNPTi5zdHJpbmdpZnkobG9jYWwuZGVsZXRlZEtleXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZEtleXMgPSBkZWxldGVkS2V5cztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkUHJvZmlsZXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZFByb2ZpbGVzID0gZGVsZXRlZFByb2ZpbGVzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAvLyBSYXcgbG9jYWwgd3JpdGUgT05MWSBcdTIwMTQgbmV2ZXIgc2NoZWR1bGVTeW5jUHVzaCAobG9vcCBpbnZhcmlhbnQpLlxuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG4gICAgaWYgKG1vdmVzLmxlbmd0aCA+IDApIGF3YWl0IGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlbGV0aW9uLWhpc3RvcnkgKHRvbWJzdG9uZSkgcmV0ZW50aW9uIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRvdGFsIG51bWJlciBvZiByZXRhaW5lZCBkZWxldGlvbiByZWNvcmRzIChkb2NzICsga2V5cykuIEdyb3dzIG92ZXIgdGhlIGxpZmVcbiAqIG9mIHRoZSBpbnN0YWxsIGJlY2F1c2UgdG9tYnN0b25lcyBhcmUga2VwdCBmb3JldmVyIChhbiBvZmZsaW5lIGRldmljZSB0aGF0XG4gKiBuZXZlciBsZWFybmVkIG9mIGEgZGVsZXRpb24gbXVzdCBub3QgYmUgYWJsZSB0byByZXN1cnJlY3QgdGhlIGl0ZW0pLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9tYnN0b25lQ291bnQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgY29uc3QgZG9jcyA9IGRhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkRG9jcyA6IHt9O1xuICAgIGNvbnN0IGtleXMgPSBkYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZEtleXMgOiB7fTtcbiAgICBjb25zdCBwcm9maWxlcyA9IGRhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRQcm9maWxlcyA6IHt9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhkb2NzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhrZXlzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhwcm9maWxlcykubGVuZ3RoO1xufVxuXG4vKipcbiAqIFdhcm5pbmcgbGV2ZWwgZm9yIGEgZ2l2ZW4gcmV0YWluZWQtZGVsZXRpb24gY291bnQ6XG4gKiAgIDAgPSBmaW5lLCAxID0gZ2VudGxlIG51ZGdlICg+PSA4KSwgMiA9IHN0cm9uZ2VyIHdhcm5pbmcgKD49IDE2KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbWJzdG9uZVdhcm5pbmdMZXZlbChjb3VudCkge1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9TVFJPTkcpIHJldHVybiAyO1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9HRU5UTEUpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5LiBJbmZvcm1lZC11c2VyIGNob2ljZTogYSBkZXZpY2UgdGhhdCBoYXNcbiAqIGJlZW4gb2ZmbGluZSBzaW5jZSBiZWZvcmUgb25lIG9mIHRoZXNlIGRlbGV0aW9ucyBjYW4sIG9uIGl0cyBuZXh0IHN5bmMsXG4gKiByZS1hZGQgdGhlIGl0ZW0gXHUyMDE0IGJlY2F1c2UgdGhlIHJlY29yZCB0aGF0IHRvbGQgZXZlcnlvbmUgaXQgd2FzIGRlbGV0ZWQgaXNcbiAqIG5vdyBnb25lLiBTY2hlZHVsZXMgYSBwdXNoIHNvIHRoZSBjbGVhcmVkIHN0YXRlIHByb3BhZ2F0ZXMgdG8gdGhlIG1pcnJvci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGVsZXRpb25IaXN0b3J5KCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuY3J5cHRpb24tZmxhZyBzZWxmLWhlYWwgKEEyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2xlYXIgYSBib2d1cyBgaXNFbmNyeXB0ZWQ9dHJ1ZWAgd2hlbiB0aGlzIGRldmljZSBob2xkcyBubyBldmlkZW5jZSBvZiByZWFsXG4gKiBwYXNzd29yZCBwcm90ZWN0aW9uIFx1MjAxNCBubyBwYXNzd29yZCB2ZXJpZmllciAocGFzc3dvcmRIYXNoKSBBTkQgbm8gcHJvZmlsZSBrZXlcbiAqIHRoYXQgaXMgYSBQQVNTV09SRCBibG9iLlxuICpcbiAqIEdhdGluZyBkZXRhaWwgKGNyaXRpY2FsKTogZXZpZGVuY2UgaXMgYSBQQVNTV09SRCBibG9iIChpc1Bhc3N3b3JkQmxvYiksIE5PVCBhXG4gKiBkZXZpY2Uta2V5IGJsb2IuIFNpbmNlIHYxLjcuMCBldmVyeSBrZXkgaXMgd3JhcHBlZCBhdCByZXN0IGV2ZW4gZm9yIHRoZVxuICogcGFzc3dvcmRsZXNzIExldmVsLTAgdXNlciwgc28gYSBub3JtYWwgcGFzc3dvcmRsZXNzIGluc3RhbGwgaXMgZnVsbCBvZlxuICogZGV2aWNlLWtleSBjaXBoZXJ0ZXh0OyBrZXlpbmcgb2ZmIHRoYXQgd291bGQgd3JvbmdseSBrZWVwIHRoZSBmbGFnIGxhdGNoZWQuXG4gKiBPbmx5IGEgcGFzc3dvcmQtZGVyaXZlZCBibG9iIChvciB0aGUgdmVyaWZpZXIpIHByb3ZlcyBhIG1hc3RlciBwYXNzd29yZC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gdHJ1ZSBpZiBhIGJvZ3VzIGZsYWcgd2FzIGNsZWFyZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKCFkYXRhLmlzRW5jcnlwdGVkKSByZXR1cm4gZmFsc2U7ICAgLy8gbm90aGluZyBsYXRjaGVkIFx1MjAxNCBub3RoaW5nIHRvIGhlYWxcbiAgICBpZiAoZGF0YS5wYXNzd29yZEhhc2gpIHJldHVybiBmYWxzZTsgICAvLyByZWFsIHZlcmlmaWVyIHByZXNlbnQgXHUyMDE0IGtlZXAgdGhlIGZsYWdcblxuICAgIGNvbnN0IGhhc1Bhc3N3b3JkQmxvYiA9IEFycmF5LmlzQXJyYXkoZGF0YS5wcm9maWxlcykgJiZcbiAgICAgICAgZGF0YS5wcm9maWxlcy5zb21lKHAgPT4gcCAmJiBpc1Bhc3N3b3JkQmxvYihwLnByaXZLZXkpKTtcbiAgICBpZiAoaGFzUGFzc3dvcmRCbG9iKSByZXR1cm4gZmFsc2U7ICAgICAvLyBwYXNzd29yZC1lbmNyeXB0ZWQga2V5IG1hdGVyaWFsIFx1MjAxNCBrZWVwXG5cbiAgICAvLyBGbGFnIGlzIGJvZ3VzIChlLmcuIG1pcnJvcmVkIGluIGZyb20gYW5vdGhlciBkZXZpY2UgdGhhdCBESUQgaGF2ZSBhXG4gICAgLy8gcGFzc3dvcmQpLiBDbGVhciBpdCBzbyB0aGlzIGRldmljZSBpcyBub3Qgc3RyYW5kZWQgYXQgYSBkZWFkLWVuZCB1bmxvY2suXG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gQ2xlYXJlZCBib2d1cyBpc0VuY3J5cHRlZCBmbGFnIChubyBwYXNzd29yZCB2ZXJpZmllci9ibG9iKScpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZWR1Y2UgZXZlcnkgYnVua2VyVXJsIGluIHRoZSBgcHJvZmlsZXNgIG1pcnJvciB0byBpdHMgYWRkcmVzcy4gV29ya3Mgb24gdGhlXG4gKiBzdG9yZWQgZGF0YSBkaXJlY3RseSwgc28gaXQgZG9lcyBub3QgZGVwZW5kIG9uIHN5bmMgYmVpbmcgZW5hYmxlZCwgYW5kIHdyaXRlc1xuICogbm90aGluZyB3aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gY2hhbmdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NydWJTeW5jZWRQcm9maWxlcygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICBjb25zdCBwcm9maWxlcyA9IHJhdyA/IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoJ3Byb2ZpbGVzJywgcmF3KSA6IG51bGw7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuO1xuICAgIGNvbnN0IGNsZWFuID0gcmVkYWN0UHJvZmlsZXMocHJvZmlsZXMpO1xuICAgIGlmIChjbGVhbiA9PT0gcHJvZmlsZXMpIHJldHVybjtcblxuICAgIGNvbnN0IGVudHJpZXMgPSBjaHVua1ZhbHVlKCdwcm9maWxlcycsIEpTT04uc3RyaW5naWZ5KGNsZWFuKSk7XG4gICAgY29uc3QgcGF5bG9hZCA9IE9iamVjdC5mcm9tRW50cmllcyhlbnRyaWVzLm1hcChlID0+IFtlLmtleSwgZS52YWx1ZV0pKTtcbiAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChwYXlsb2FkKTtcbiAgICBjb25zdCB1bnVzZWQgPSBPYmplY3Qua2V5cyhyYXcpLmZpbHRlcihrID0+XG4gICAgICAgIGsuc3RhcnRzV2l0aChgJHtDSFVOS19QUkVGSVh9cHJvZmlsZXM6YCkgJiYgIShrIGluIHBheWxvYWQpXG4gICAgKTtcbiAgICBpZiAodW51c2VkLmxlbmd0aCA+IDApIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKHVudXNlZCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5pdGlhbGlzYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENhbGxlZCBvbmNlIG9uIHN0YXJ0dXAgKGZyb20gYmFja2dyb3VuZC5qcykuXG4gKiBQdWxscyBmcm9tIHN5bmMsIG1lcmdlcywgdGhlbiBsaXN0ZW5zIGZvciByZW1vdGUgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRTeW5jKCkge1xuICAgIC8vIFNlbGYtaGVhbCBhIGJvZ3VzIGVuY3J5cHRpb24gZmxhZyBmaXJzdCBcdTIwMTQgdGhpcyBtdXN0IHJ1biBldmVuIHdoZW4gc3luYyBpc1xuICAgIC8vIHVuYXZhaWxhYmxlIG9yIGRpc2FibGVkLCBiZWNhdXNlIHRoZSBiYWQgc3RhdGUgaXQgZml4ZXMgbWF5IGhhdmUgYmVlbiBsZWZ0XG4gICAgLy8gYmVoaW5kIGJ5IGFuIGVhcmxpZXIgKG5vdy1yZW1vdmVkKSBpc0VuY3J5cHRlZC1zeW5jaW5nIGJ1aWxkLlxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gc2VsZkhlYWxFbmNyeXB0aW9uRmxhZyBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2NydWJTeW5jZWRQcm9maWxlcygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBzY3J1YlN5bmNlZFByb2ZpbGVzIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBQbGF0Zm9ybSBzeW5jIGRpc2FibGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdWxsICsgbWVyZ2VcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzeW5jRGF0YSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAoc3luY0RhdGEpIHtcbiAgICAgICAgICAgIGF3YWl0IG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCttZXJnZSBjb21wbGV0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTm8gc3luYyBkYXRhIGZvdW5kIFx1MjAxNCBmcmVzaCBzeW5jJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlbW90ZSBjaGFuZ2VzXG4gICAgaWYgKGFwaS5zdG9yYWdlLm9uQ2hhbmdlZCkge1xuICAgICAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWFOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJlYU5hbWUgIT09ICdzeW5jJykgcmV0dXJuO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIHN5bmMgY2hhbmdlIGRldGVjdGVkJyk7XG4gICAgICAgICAgICAvLyBSZS1wdWxsIGFuZCBtZXJnZSB0aGUgZnVsbCBzeW5jIGRhdGEgdG8gaGFuZGxlIGNodW5rZWQgdmFsdWVzIGNvcnJlY3RseVxuICAgICAgICAgICAgcHVsbEZyb21TeW5jKCkudGhlbihzeW5jRGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmNEYXRhKSBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIFJlbW90ZSBtZXJnZSBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEbyBhbiBpbml0aWFsIHB1c2ggc28gbG9jYWwgZGF0YSBpcyBtaXJyb3JlZFxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cbiIsICIvKipcbiAqIFNlY3JldCBWYXVsdCBcdTIwMTQgYXQtcmVzdCBlbmNyeXB0aW9uIGZvciBwcml2YXRlIGtleXMgYW5kIGFwcGxpY2F0aW9uIHNlY3JldHMuXG4gKlxuICogVGhyZWF0IG1vZGVsIChUMC00KTogcmF3IHNlY3JldCBieXRlcyBtdXN0IG5ldmVyIHNpdCBpbiBicm93c2VyIHN0b3JhZ2UgaW5cbiAqIGNsZWFydGV4dCwgZXZlbiBmb3IgdGhlIERFRkFVTFQgcGFzc3dvcmRsZXNzIHVzZXIuIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHR3b1xuICogd3JhcHBpbmcgc3RyYXRlZ2llcyBiZWhpbmQgb25lIGB3cmFwU2VjcmV0YCAvIGB1bndyYXBTZWNyZXRgIGludGVyZmFjZTpcbiAqXG4gKiAgIDEuIERFVklDRSBLRVkgKGRlZmF1bHQsIG5vIG1hc3RlciBwYXNzd29yZCkgXHUyMDE0IGEgbm9uLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNXG4gKiAgICAgIENyeXB0b0tleS4gVGhyZWUgcGVyc2lzdGVuY2Ugc3RyYXRlZ2llcyBleGlzdCwgYW5kIGVhY2ggaXMgVkVSSUZJRURcbiAqICAgICAgKHJlYWQgYmFjayBhbmQgcm91bmQtdHJpcHBlZCB0aHJvdWdoIGVuY3J5cHQvZGVjcnlwdCkgYmVmb3JlIGl0IGlzXG4gKiAgICAgIHRydXN0ZWQ6XG4gKlxuICogICAgICAgIGEuIGBpZGJgICAgIFx1MjAxNCBhIENyeXB0b0tleSAqaGFuZGxlKiBpbiBJbmRleGVkREIuIE9ubHkgZXZlciBBRE9QVEVELFxuICogICAgICAgICAgICAgICAgICAgICAgbmV2ZXIgbWludGVkOiB3ZSB0cnVzdCBgaWRiYCBleGNsdXNpdmVseSB3aGVuIGRiLmdldCgpXG4gKiAgICAgICAgICAgICAgICAgICAgICBoYW5kcyBiYWNrIGEgUFJFLUVYSVNUSU5HIGtleSB0aGF0IHJvdW5kLXRyaXBzLCBiZWNhdXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGF0IFx1MjAxNCBhbmQgb25seSB0aGF0IFx1MjAxNCBwcm92ZXMgdGhlIGhhbmRsZSBzdXJ2aXZlZCBhXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyBjb250ZXh0LiBBIHNhbWUtY29udGV4dCBwdXRcdTIxOTJnZXQgcHJvYmUgY2Fubm90XG4gKiAgICAgICAgICAgICAgICAgICAgICBwcm92ZSBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlLiBLZWVwaW5nIHRoZSBhZG9wdCBwYXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZXMgZXZlcnkgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd3JpdHRlbiBiZWZvcmVcbiAqICAgICAgICAgICAgICAgICAgICAgIDEuOC4xLCB3aG9zZSBibG9icyBsaXZlIHVuZGVyIHRoaXMga2V5LlxuICogICAgICAgICAgICAgICAgICAgICAgKipORVZFUiB1c2VkIGFzIHRoZSB3cmFwcGluZyBrZXkgb24gU2FmYXJpLioqIE9uIFdlYktpdFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIHR3byBzdG9yYWdlIGFyZWFzIGRvIG5vdCBzaGFyZSBhIGxpZmV0aW1lIHRoZSB3YXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZXkgZG8gb24gQ2hyb21pdW0vR2Vja28sIHNvIGFuIGFkb3B0ZWQgSW5kZXhlZERCIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgaXMgbm90IGEgc2FmZSB3cmFwcGluZyBrZXkgdGhlcmUuIFNhZmFyaSB0aGVyZWZvcmUgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cml0ZXMgdW5kZXIgYHNlZWRgIChidW5kbGUtc2NvcGVkIGBzdG9yYWdlLmxvY2FsYCk7XG4gKiAgICAgICAgICAgICAgICAgICAgICBhZG9wdGVkIElEQiBrZXlzIGFyZSBkZWNyeXB0LW9ubHkgbGVnYWN5IG9uIFNhZmFyaSwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgYXQtcmVzdCBtaWdyYXRpb24gcmUtd3JhcHMgRVZFUlkgZGV2aWNlIGJsb2IgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24gc3RvcmVzIFx1MjAxNCBwcm9maWxlIHByaXZhdGUga2V5cywgQVBJLWtleVxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cywgdmF1bHQtbm90ZSBib2RpZXMsIGFuZCBOSVAtNDYgYnVua2VyIHNlc3Npb25cbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMgLyBzZXNzaW9uIHByaXZhdGUga2V5cyBcdTIwMTQgbm90IGp1c3QgcHJvZmlsZSBrZXlzLlxuICogICAgICAgICAgICAgICAgICAgICAgKFBlci1lbmdpbmUgc3RvcmFnZS1zY29waW5nIHJhdGlvbmFsZTogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgICAgICAgICAgICAgICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqICAgICAgICBiLiBgc2VlZGAgICBcdTIwMTQgMzIgcmFuZG9tIGJ5dGVzIGluIGBicm93c2VyLnN0b3JhZ2UubG9jYWxgIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgZGV2aWNlS2V5U2VlZGAsIGltcG9ydGVkIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ01cbiAqICAgICAgICAgICAgICAgICAgICAgIGtleSBhdCBsb2FkLiBUaGlzIGlzIHdoZXJlIEVWRVJZIG5ldyBkZXZpY2Uga2V5IGxhbmRzLFxuICogICAgICAgICAgICAgICAgICAgICAgb24gZXZlcnkgcGxhdGZvcm06IHdoZW4gbm8gcHJlLWV4aXN0aW5nIElEQiBrZXkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIHdlIGRvIG5vdCBtaW50IG9uZSwgd2Ugc2VlZC4gQ2hyb21lL0ZpcmVmb3ggZnJlc2hcbiAqICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxzIHRoZXJlZm9yZSB1c2UgYHNlZWRgIHRvbyBcdTIwMTQgb25lIGNvZGUgcGF0aCwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgb25seSBvbmUgd2hvc2UgcGVyc2lzdGVuY2Ugd2UgY2FuIGFjdHVhbGx5IHZlcmlmeS5cbiAqICAgICAgICBjLiBgbWVtb3J5YCBcdTIwMTQgbGFzdCByZXNvcnQgKHVuaXQgdGVzdHMsIHNhbmRib3hlZCBjb250ZXh0cykuIFNlY3JldHNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZWQgaGVyZSBkbyBub3Qgc3Vydml2ZSBhIHJlbG9hZC5cbiAqXG4gKiAgICAgIFRoZSByZXNvbHZlZCBzdHJhdGVneSBpcyBTVElDS1k6IGl0IGlzIHJlY29yZGVkIGluIHN0b3JhZ2UubG9jYWwgdW5kZXJcbiAqICAgICAgYGRldmljZUtleVN0cmF0ZWd5YCBhbmQgaG9ub3VyZWQgb24gbGF0ZXIgbG9hZHMsIHNvIGEgY29udGV4dCBjYW5ub3RcbiAqICAgICAgc2lsZW50bHkgZmxpcCBzdHJhdGVnaWVzIGFuZCBvcnBoYW4gdGhlIGJsb2JzIHdyaXR0ZW4gdW5kZXIgdGhlIG9sZFxuICogICAgICBvbmUuIERlY3J5cHRpb24gaXMgc3ltbWV0cmljIHJlZ2FyZGxlc3M6IGBkZWNyeXB0V2l0aERldmljZUtleWAgdHJpZXNcbiAqICAgICAgdGhlIGN1cnJlbnQga2V5LCB0aGVuIGV2ZXJ5IG90aGVyIGtleSB0aGlzIGluc3RhbGwgY291bGQgZXZlciBoYXZlIGhhZFxuICogICAgICAobGVnYWN5IElEQiBoYW5kbGUsIGV4aXN0aW5nIHNlZWQpLCBhbmQgY2FsbGVycyB1c2luZ1xuICogICAgICBgZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXBgIHJlLXdyYXAgdW5kZXIgdGhlIGN1cnJlbnQgc3RyYXRlZ3kuXG4gKlxuICogICAgICBUaHJlYXQgbW9kZWwsIGhvbmVzdGx5IHN0YXRlZDogdGhlIHBhc3N3b3JkbGVzcyBkZXZpY2UgdGllciBpcyBhdC1yZXN0XG4gKiAgICAgIHByb3RlY3Rpb24gYWdhaW5zdCBjYXN1YWwgaW5zcGVjdGlvbiBvZiBleHRlbnNpb24gc3RvcmFnZSwgTk9UIGEgZGVmZW5jZVxuICogICAgICBhZ2FpbnN0IGNvZGUgYWxyZWFkeSBleGVjdXRpbmcgaW4gdGhpcyBleHRlbnNpb24ncyBjb250ZXh0LiBUaGVcbiAqICAgICAgc3Ryb25nZXN0IHRpZXIgYXZhaWxhYmxlIHRvZGF5IGlzIGEgKiptYXN0ZXIgcGFzc3dvcmQqKiAoYmVsb3cpLCB3aGljaFxuICogICAgICBkZXJpdmVzIHRoZSB3cmFwcGluZyBrZXkgZnJvbSBhIHNlY3JldCB0aGF0IGlzIG5ldmVyIHN0b3JlZC4gVXNlcnNcbiAqICAgICAgaG9sZGluZyBoaWdoLXZhbHVlIGtleXMgc2hvdWxkIHNldCBvbmUuIEEgaGFyZHdhcmUtYmFja2VkIGRldmljZSBrZXkgaXNcbiAqICAgICAgZnV0dXJlIHdvcmsuIChUaWVyIHRyYWRlb2ZmcyBpbiBmdWxsOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKlxuICogICAyLiBTRVNTSU9OIEtFWSAobWFzdGVyIHBhc3N3b3JkIHNldCArIHVubG9ja2VkKSBcdTIwMTQgdGhlIEFFUy0yNTYtR0NNIGtleVxuICogICAgICBkZXJpdmVkIGZyb20gdGhlIHBhc3N3b3JkIChzZWUgY3J5cHRvLmpzKS4gU2V0IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlclxuICogICAgICBvbiB1bmxvY2sgdmlhIGBzZXRTZXNzaW9uS2V5YCwgY2xlYXJlZCBvbiBsb2NrIHZpYSBgY2xlYXJTZXNzaW9uYC5cbiAqXG4gKiBCbG9iIGZvcm1hdHMgKGJvdGggYXJlIHNlbGYtZGVzY3JpYmluZyBKU09OIHN0cmluZ3MpOlxuICogICBwYXNzd29yZCBibG9iIDogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9XG4gKiAgIGRldmljZSAgYmxvYiA6IHsgdjoxLCBrOlwiZGV2aWNlXCIsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqXG4gKiBgdW53cmFwU2VjcmV0YCByZWZ1c2VzIHRvIGRlY3J5cHQgd2hlbiB0aGUgc2Vzc2lvbiBoYXMgYmVlbiBleHBsaWNpdGx5IGxvY2tlZFxuICogKEY1L0Y2KSBzbyBhIGxvY2tlZCBwYWdlIGNhbm5vdCByZWFkIHNlY3JldHMuXG4gKi9cblxuaW1wb3J0IHsgZW5jcnlwdFdpdGhLZXksIGRlY3J5cHRXaXRoS2V5IH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuY29uc3QgREVWSUNFX0RCID0gJ25vc3Rya2V5LXNlY3JldC12YXVsdCc7XG5jb25zdCBERVZJQ0VfU1RPUkUgPSAna2V5cyc7XG5jb25zdCBERVZJQ0VfS0VZX0lEID0gJ2RldmljZS13cmFwLWtleS12MSc7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBiYXNlNjQgcmF3IHNlZWQgZm9yIHRoZSBgc2VlZGAgc3RyYXRlZ3kuXG5jb25zdCBERVZJQ0VfU0VFRF9LRVkgPSAnZGV2aWNlS2V5U2VlZCc7XG5jb25zdCBERVZJQ0VfU0VFRF9CWVRFUyA9IDMyO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgU1RJQ0tZIHJlc29sdmVkIHN0cmF0ZWd5ICgnaWRiJyB8ICdzZWVkJykuXG5jb25zdCBERVZJQ0VfU1RSQVRFR1lfS0VZID0gJ2RldmljZUtleVN0cmF0ZWd5JztcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIChrZXB0IGxvY2FsIHNvIHRoaXMgbW9kdWxlIGhhcyBubyBjcm9zcy1kZXBzKSAtLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGFiVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFRvQWIoYjY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIFNlc3Npb24gKHBhc3N3b3JkLWRlcml2ZWQpIGtleSBzdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfc2Vzc2lvbktleSA9IG51bGw7ICAgLy8gQ3J5cHRvS2V5IHwgbnVsbFxubGV0IF9zZXNzaW9uU2FsdCA9IG51bGw7ICAvLyBVaW50OEFycmF5IHwgbnVsbFxuLy8gX3VubG9ja2VkOiBudWxsID0gcGFzc3dvcmRsZXNzIC8gbm90IGFwcGxpY2FibGUgKG5ldmVyIGxvY2tlZCksXG4vLyAgICAgICAgICAgIHRydWUgPSB1bmxvY2tlZCwgZmFsc2UgPSBsb2NrZWQgKHJlZnVzZSBzZWNyZXQgcmVhZHMpLlxubGV0IF91bmxvY2tlZCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uS2V5KGNyeXB0b0tleSwgc2FsdCkge1xuICAgIF9zZXNzaW9uS2V5ID0gY3J5cHRvS2V5O1xuICAgIF9zZXNzaW9uU2FsdCA9IHNhbHQ7XG4gICAgX3VubG9ja2VkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcbiAgICBfc2Vzc2lvbktleSA9IG51bGw7XG4gICAgX3Nlc3Npb25TYWx0ID0gbnVsbDtcbiAgICBfdW5sb2NrZWQgPSBmYWxzZTtcbn1cblxuLyoqIEV4cGxpY2l0bHkgbWFyayB0aGUgc2Vzc2lvbiB1bmxvY2tlZC9sb2NrZWQgd2l0aG91dCBwcm92aWRpbmcgYSBrZXkuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VW5sb2NrZWQodikge1xuICAgIF91bmxvY2tlZCA9IHYgPT09IG51bGwgPyBudWxsIDogISF2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2Vzc2lvbktleSgpIHtcbiAgICByZXR1cm4gISFfc2Vzc2lvbktleTtcbn1cblxuLy8gLS0tIERldmljZSBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG5sZXQgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDsgICAvLyAnaWRiJyB8ICdzZWVkJyB8ICdtZW1vcnknIFx1MjAxNCBzZXQgb25jZSByZXNvbHZlZFxubGV0IF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsOyAgLy8gbGFzdC1yZXNvcnQga2V5IGZvciBjb250ZXh0cyB0aGF0IHBlcnNpc3Qgbm90aGluZ1xubGV0IF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiB0aGUgcHJlLTEuOC4xIElEQiBrZXlcbmxldCBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gYW4gZXhpc3Rpbmcgc2VlZCBrZXlcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZXZpY2VLZXkoKSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlOiByYXcgYnl0ZXMgY2FuIG5ldmVyIGJlIHJlYWQgYmFjayBvdXRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkRGJBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ZWREQiAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92ZSBhIGNhbmRpZGF0ZSBrZXkgaXMgYWN0dWFsbHkgdXNhYmxlIGJlZm9yZSB3ZSB0cnVzdCBhIHN0cmF0ZWd5IHdpdGggYVxuICogdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBBIHJlYWQtYmFjayBoYW5kbGUgdGhhdCBzdHJ1Y3R1cmVkLWNsb25lXG4gKiBtYW5nbGVkIChvciBhIHNlZWQgdGhhdCBjYW1lIGJhY2sgdHJ1bmNhdGVkKSBmYWlscyBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHlcbiAqIHByb2R1Y2luZyB1bmRlY3J5cHRhYmxlIGJsb2JzLlxuICovXG5hc3luYyBmdW5jdGlvbiBrZXlSb3VuZFRyaXBzKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgICAgIGNvbnN0IHByb2JlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdub3N0cmtleS1kZXZpY2UtcHJvYmUnKTtcbiAgICAgICAgY29uc3QgY3QgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgcHJvYmUpO1xuICAgICAgICBjb25zdCBwdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBjdCk7XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocHQpID09PSAnbm9zdHJrZXktZGV2aWNlLXByb2JlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRldmljZURiKCkge1xuICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICBjb25zdCB7IG9wZW5EQiB9ID0gYXdhaXQgaW1wb3J0KCdpZGInKTtcbiAgICByZXR1cm4gb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICB1cGdyYWRlKGQpIHtcbiAgICAgICAgICAgIGlmICghZC5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKERFVklDRV9TVE9SRSkpIHtcbiAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgKGEpOiBBRE9QVCBhIHByZS1leGlzdGluZyBub24tZXh0cmFjdGFibGUgQ3J5cHRvS2V5IGhhbmRsZSBmcm9tXG4gKiBJbmRleGVkREIuIE5ldmVyIG1pbnRzIG9uZS5cbiAqXG4gKiBBIGtleSB0aGF0IGRiLmdldCgpIGhhbmRzIGJhY2sgaXMgYSBrZXkgc29tZSBFQVJMSUVSIGNvbnRleHQgd3JvdGUsIHNvIGl0IGlzXG4gKiBwcm9vZiBvZiBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlIFx1MjAxNCB0aGUgb25lIHRoaW5nIGEgc2FtZS1jb250ZXh0XG4gKiBwdXRcdTIxOTJnZXRcdTIxOTJyb3VuZC10cmlwIHByb2JlIGNhbiBuZXZlciBlc3RhYmxpc2guIGlPUyBTYWZhcmkncyBJbmRleGVkREIgaXNcbiAqIGZ1bmN0aW9uYWwgYnV0IGVwaGVtZXJhbCBmb3IgdGhlIGV4dGVuc2lvbiBiYWNrZ3JvdW5kOiBpdCB3b3VsZCBoYXZlIHBhc3NlZFxuICogdGhlIHByb2JlIGFuZCB0aGVuIGxvc3QgdGhlIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gU286IG5vXG4gKiBwcmUtZXhpc3Rpbmcga2V5IG1lYW5zIG5vIGBpZGJgLCBhbmQgdGhlIGNhbGxlciBzZWVkcyBpbnN0ZWFkLlxuICpcbiAqIFJldHVybnMgbnVsbCAobmV2ZXIgdGhyb3dzKSB3aGVuIG5vdGhpbmcgdXNhYmxlIGlzIHRoZXJlLlxuICovXG5hc3luYyBmdW5jdGlvbiB0cnlJZGJEZXZpY2VLZXkoKSB7XG4gICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuIG51bGw7IC8vIGVtcHR5IHN0b3JlIFx1MjE5MiBzZWVkLCBkbyBOT1QgbWludCBoZXJlXG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhleGlzdGluZykpID8gZXhpc3RpbmcgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHN0b3JhZ2UgYXJlYSBiYWNraW5nIHRoZSBgc2VlZGAgc3RyYXRlZ3kuIEltcG9ydGVkIGxhemlseSBiZWNhdXNlXG4gKiBicm93c2VyLXBvbHlmaWxsIHRocm93cyBhdCBtb2R1bGUgbG9hZCB3aGVuIG5vIGV4dGVuc2lvbiBuYW1lc3BhY2UgZXhpc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWVkU3RvcmFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgcmV0dXJuIGFwaT8uc3RvcmFnZT8ubG9jYWwgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogU2lnbmFsIDI6IGEgV2ViS2l0IHVzZXIgYWdlbnQgd2l0aCBubyBDaHJvbWl1bSBtYXJrZXIgb24gaXQuICovXG5mdW5jdGlvbiBsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdWEgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgJyc7XG4gICAgICAgIHJldHVybiAvU2FmYXJpfEFwcGxlV2ViS2l0Ly50ZXN0KHVhKSAmJiAhL0Nocm9tKGV8aXVtKXxFZGdcXC98T1BSXFwvLy50ZXN0KHVhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcnVlIG9uIFNhZmFyaSAoaU9TICsgbWFjT1MpLCB3aGVyZSBJbmRleGVkREIgbXVzdCBORVZFUiBob2xkIHRoZSB3cmFwcGluZ1xuICoga2V5IFx1MjAxNCBzZWUgdGhlIG1vZHVsZSBoZWFkZXIncyBzdG9yYWdlLXNjb3BlIG5vdGUuXG4gKlxuICogRGV0ZWN0aW9uIGlzIG11bHRpLXNpZ25hbCBhbmQgQklBU0VEIFRPV0FSRCBTQUZBUkksIGJlY2F1c2UgdGhlIHR3byBlcnJvcnNcbiAqIGFyZSBub3Qgc3ltbWV0cmljOiBzZWVkaW5nIGEgQ2hyb21lIHZhdWx0IGNvc3RzIG5vdGhpbmcgKHNlZWQgaXMgYWxyZWFkeSB0aGVcbiAqIHN0cmF0ZWd5IGV2ZXJ5IGZyZXNoIGluc3RhbGwgbGFuZHMgb24pLCB3aGlsZSBhZG9wdGluZyBhbiBJREIga2V5IG9uIFNhZmFyaVxuICogaXMgdW5zYWZlLiBTbyBvbmx5IGEgUE9TSVRJVkVMWSBpZGVudGlmaWVkIENocm9tZS9GaXJlZm94IG9yaWdpbiBtYXkgYWRvcHQgYW5cbiAqIEluZGV4ZWREQiBrZXkgXHUyMDE0IGEgZ2V0VVJMIHRoYXQgaXMgbWlzc2luZywgdGhyb3dzLCByZXR1cm5zIGEgbm9uLXN0cmluZyxcbiAqIHJldHVybnMgJycgb3IgcmV0dXJucyBhIHNjaGVtZSB3ZSBkbyBub3QgcmVjb2duaXNlIGFsbCByZXNvbHZlIHRvIFNhZmFyaS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNTYWZhcmlFbmdpbmUoKSB7XG4gICAgbGV0IG9yaWdpbiA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaT8ucnVudGltZT8uZ2V0VVJMPy4oJycpO1xuICAgICAgICBvcmlnaW4gPSB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgfVxuICAgIC8vIFNpZ25hbCAxOiBhIHBvc2l0aXZlbHkgaWRlbnRpZmllZCBTYWZhcmkgb3JpZ2luLlxuICAgIGlmIChvcmlnaW4gJiYgb3JpZ2luLnN0YXJ0c1dpdGgoJ3NhZmFyaS13ZWItZXh0ZW5zaW9uOi8vJykpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAyOiBhIFdlYktpdC1vbmx5IFVBIG91dHJhbmtzIHRoZSBvcmlnaW4gXHUyMDE0IGEgU2FmYXJpIGJ1aWxkIHRoYXRcbiAgICAvLyByZXBvcnRlZCBhbiB1bmV4cGVjdGVkIG9yaWdpbiBzdGlsbCBtdXN0IG5vdCB0b3VjaCBJbmRleGVkREIuXG4gICAgaWYgKGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMzogb25seSB0aGVzZSB0d28gb3JpZ2lucyBlYXJuIHRoZSBJREIgYWRvcHQgcGF0aC5cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW4uc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8IG9yaWdpbi5zdGFydHNXaXRoKCdtb3otZXh0ZW5zaW9uOi8vJykpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7IC8vIGFtYmlndW91cyBcdTIxOTIgc2VlZFxufVxuXG4vKiogSW1wb3J0IHJhdyBzZWVkIGJ5dGVzIChiYXNlNjQpIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ00ga2V5LiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1wb3J0U2VlZEtleShzZWVkQjY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JywgYmFzZTY0VG9BYihzZWVkQjY0KSwgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZSBvbmNlIGltcG9ydGVkXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuLyoqIFJlYWQgdGhlIHN0aWNreSBzdHJhdGVneSByZWNvcmRlZCBieSBhIHByZXZpb3VzIHJlc29sdXRpb24gKG51bGwgaWYgbm9uZSkuICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3RpY2t5U3RyYXRlZ3koKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgcyA9IGdvdD8uW0RFVklDRV9TVFJBVEVHWV9LRVldO1xuICAgICAgICByZXR1cm4gKHMgPT09ICdpZGInIHx8IHMgPT09ICdzZWVkJykgPyBzIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogUmVjb3JkIHRoZSByZXNvbHZlZCBzdHJhdGVneSBzbyBsYXRlciBsb2FkcyBjYW5ub3Qgc2lsZW50bHkgZmxpcCBpdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlU3RpY2t5U3RyYXRlZ3koc3RyYXRlZ3kpIHtcbiAgICBpZiAoc3RyYXRlZ3kgIT09ICdpZGInICYmIHN0cmF0ZWd5ICE9PSAnc2VlZCcpIHJldHVybjsgLy8gJ21lbW9yeScgcGVyc2lzdHMgbm90aGluZ1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBzdHJhdGVneSB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmVzdCBlZmZvcnQgXHUyMDE0IHRoZSBzdHJhdGVneSBzdGlsbCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgKi8gfVxufVxuXG4vKiogU3RyYXRlZ3kgKGIpOiBhIHJhdyByYW5kb20gc2VlZCBpbiBzdG9yYWdlLmxvY2FsLCBpbXBvcnRlZCBub24tZXh0cmFjdGFibGUuICovXG5hc3luYyBmdW5jdGlvbiB0cnlTZWVkRGV2aWNlS2V5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgbGV0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgICAgIHNlZWQgPSBhYlRvQmFzZTY0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoREVWSUNFX1NFRURfQllURVMpKS5idWZmZXIpO1xuICAgICAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IHNlZWQgfSk7XG4gICAgICAgICAgICAvLyBWRVJJRlkgcGVyc2lzdGVuY2UgYmVmb3JlIGFueXRoaW5nIGlzIHdyYXBwZWQgdW5kZXIgaXQuXG4gICAgICAgICAgICBjb25zdCBjaGVjayA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3QgcGVyc2lzdGVkID0gY2hlY2s/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKHBlcnNpc3RlZCAhPT0gc2VlZCkge1xuICAgICAgICAgICAgICAgIC8vIEFub3RoZXIgY29udGV4dCAocG9wdXAgdnMgYmFja2dyb3VuZCBvbiBhIGZpcnN0IHJ1bikgbWludGVkXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdyb3RlIGl0cyBvd24gc2VlZCBiZXR3ZWVuIG91ciBzZXQoKSBhbmQgdGhpcyByZWFkLiBBRE9QVFxuICAgICAgICAgICAgICAgIC8vIFRIRSBXSU5ORVI6IGFueSBzZWVkIGFjdHVhbGx5IGluIHN0b3JhZ2UgaXMgZXhhY3RseSBhcyBnb29kIGFzXG4gICAgICAgICAgICAgICAgLy8gb3VycywgYW5kIGl0IGlzIHRoZSBvbmUgdGhlIG90aGVyIGNvbnRleHQgaXMgYWxyZWFkeSB3cmFwcGluZ1xuICAgICAgICAgICAgICAgIC8vIHVuZGVyLiBSZXR1cm5pbmcgbnVsbCBoZXJlIHdvdWxkIGRyb3AgdGhlIGNhbGxlciB0aHJvdWdoIHRvXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbW9yeSBrZXksIHdob3NlIGJsb2JzIGRpZSB3aXRoIHRoaXMgY29udGV4dCBcdTIwMTQgdGhlIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBsb3NzIHRoaXMgc3RyYXRlZ3kgZXhpc3RzIHRvIHByZXZlbnQuIE9ubHkgYSBnZW51aW5lbHkgYWJzZW50XG4gICAgICAgICAgICAgICAgLy8gb3IgdW51c2FibGUgdmFsdWUgaXMgYSBmYWlsdXJlLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGVyc2lzdGVkICE9PSAnc3RyaW5nJyB8fCBwZXJzaXN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWVkID0gcGVyc2lzdGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgKGNyZWF0aW5nIG9uIGZpcnN0IHVzZSkgdGhlIGRldmljZSB3cmFwIGtleS5cbiAqXG4gKiBSZXNvbHV0aW9uIG9yZGVyLCBvbmNlOiBob25vdXIgdGhlIHN0aWNreSBzdHJhdGVneSB0aGlzIGluc3RhbGwgYWxyZWFkeVxuICogcmVjb3JkZWQ7IG90aGVyd2lzZSBBRE9QVCBhIHByZS1leGlzdGluZyBJbmRleGVkREIga2V5IGlmIG9uZSBpcyB0aGVyZSwgYW5kXG4gKiBmYWlsaW5nIHRoYXQgc2VlZC4gV2hhdGV2ZXIgcmVzb2x2ZXMgaXMgd3JpdHRlbiBiYWNrIGFzIHRoZSBzdGlja3kgc3RyYXRlZ3kuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZXZpY2VLZXkoKSB7XG4gICAgaWYgKF9kZXZpY2VLZXlQcm9taXNlKSByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG4gICAgX2RldmljZUtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja3kgPSBhd2FpdCByZWFkU3RpY2t5U3RyYXRlZ3koKTtcblxuICAgICAgICAvLyBBIHZhdWx0IGFscmVhZHkgb24gYHNlZWRgIG5ldmVyIHJlLXByb2JlcyBJbmRleGVkREI6IGl0cyBibG9icyBhcmVcbiAgICAgICAgLy8gdW5kZXIgdGhlIHNlZWQga2V5LCBhbmQgYWRvcHRpbmcgYSBzdHJheSBJREIgaGFuZGxlIHdvdWxkIG9ycGhhbiB0aGVtLlxuICAgICAgICAvLyBPbiBTYWZhcmkgd2UgbmV2ZXIgV1JJVEUgdW5kZXIgYW4gSURCIGtleSBhdCBhbGwgKHNlZSBoZWFkZXIpOiBpdHNcbiAgICAgICAgLy8gcGVyLWVuZ2luZSBzdG9yYWdlIHNjb3BpbmcgbWFrZXMgYW4gYWRvcHRlZCBJREIgaGFuZGxlIHVuc2FmZSBhcyBhXG4gICAgICAgIC8vIHdyYXBwaW5nIGtleS4gRXhpc3RpbmcgSURCIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdFxuICAgICAgICAvLyBmYWxsYmFjayBhbmQgYXJlIHJlLXdyYXBwZWQgdW5kZXIgdGhlIHNlZWQgYnkgdGhlIGF0LXJlc3QgbWlncmF0aW9uLlxuICAgICAgICBpZiAoc3RpY2t5ICE9PSAnc2VlZCcgJiYgIShhd2FpdCBpc1NhZmFyaUVuZ2luZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgaWRiS2V5ID0gYXdhaXQgdHJ5SWRiRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBpZiAoaWRiS2V5KSB7XG4gICAgICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ2lkYic7XG4gICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnaWRiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkYktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCB0cnlTZWVkRGV2aWNlS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSB7XG4gICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnc2VlZCc7XG4gICAgICAgICAgICAvLyBBbHNvIGNvdmVycyB0aGUgZGVncmFkZSBjYXNlOiBzdGlja3kgd2FzICdpZGInIGJ1dCB0aGUgaGFuZGxlIGlzXG4gICAgICAgICAgICAvLyBnb25lLiBPbGQgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0IGZhbGxiYWNrIGJlbG93LlxuICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnc2VlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlZWRLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RoaW5nIHBlcnNpc3RzIGhlcmUuIEJldHRlciB0aGFuIHJlZnVzaW5nIHRvIGVuY3J5cHQsIGJ1dCBibG9ic1xuICAgICAgICAvLyB3cml0dGVuIHVuZGVyIHRoaXMga2V5IGRpZSB3aXRoIHRoZSBjb250ZXh0IFx1MjAxNCBzZWUgbW9kdWxlIGhlYWRlci5cbiAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ21lbW9yeSc7XG4gICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xufVxuXG4vKiogV2hpY2ggcGVyc2lzdGVuY2Ugc3RyYXRlZ3kgdGhlIGRldmljZSBrZXkgcmVzb2x2ZWQgdG8gKG51bGwgdW50aWwgcmVzb2x2ZWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZUtleVN0cmF0ZWd5KCkge1xuICAgIHJldHVybiBfZGV2aWNlU3RyYXRlZ3k7XG59XG5cbi8qKlxuICogRHJvcCBldmVyeSBtZW1vaXNlZCBkZXZpY2Uta2V5IGhhbmRsZS4gTVVTVCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYW55XG4gKiBgc3RvcmFnZS5jbGVhcigpYDogdGhlIHNlZWQgKGFuZCB0aGUgc3RpY2t5IHN0cmF0ZWd5KSBhcmUgZ29uZSBmcm9tIHN0b3JhZ2UsXG4gKiBzbyBhIGNhY2hlZCBwcm9taXNlIHdvdWxkIGtlZXAgaGFuZGluZyBvdXQgYSBrZXkgd2hvc2UgYmFja2luZyBtYXRlcmlhbCBub1xuICogbG9uZ2VyIGV4aXN0cyBcdTIwMTQgdGhlIG5leHQgZ2V0RGV2aWNlS2V5KCkgd291bGQgd3JhcCBzZWNyZXRzIHVuZGVyIGEga2V5IHRoYXRcbiAqIGRpZXMgd2l0aCB0aGlzIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldERldmljZUtleSgpIHtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDtcbiAgICBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGRldmljZSBrZXksIHVzZWQgb25seSBhcyBhXG4gKiBkZWNyeXB0IGZhbGxiYWNrIGZvciBibG9icyB3cml0dGVuIGJlZm9yZSB0aGlzIGNvbnRleHQgY2hhbmdlZCBzdHJhdGVneS5cbiAqIE5ldmVyIGNyZWF0ZXMgb25lLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRMZWdhY3lJZGJLZXkoKSB7XG4gICAgaWYgKF9sZWdhY3lJZGJLZXlQcm9taXNlKSByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIHRoZSBrZXkgYW4gRVhJU1RJTkcgYGRldmljZUtleVNlZWRgIGltcG9ydHMgdG8sIHVzZWQgb25seVxuICogYXMgYSBkZWNyeXB0IGZhbGxiYWNrLiBOZXZlciBtaW50cyBhIHNlZWQgKHRoYXQgaXMgdHJ5U2VlZERldmljZUtleSdzIGpvYikuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEV4aXN0aW5nU2VlZEtleSgpIHtcbiAgICBpZiAoX2V4aXN0aW5nU2VlZEtleVByb21pc2UpIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKCFzZWVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG59XG5cbi8qKlxuICogRXZlcnkgT1RIRVIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBoYXZlIHdyYXBwZWQgYSBkZXZpY2UgYmxvYiB1bmRlciwgaW5cbiAqIHByZWZlcmVuY2Ugb3JkZXIuIFN0cmF0ZWd5IGZsaXBzIChpZGJcdTIxOTJzZWVkIG9uIGRlZ3JhZGUsIHNlZWRcdTIxOTJpZGIgb24gYW5cbiAqIGFkb3B0ZWQgaGFuZGxlKSBtdXN0IG5ldmVyIG9ycGhhbiBhIGJsb2IsIHNvIHRoZSBmYWxsYmFjayBpcyBzeW1tZXRyaWM6IGFcbiAqIHNlZWQgYmxvYiBzdGF5cyByZWFkYWJsZSB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicgYW5kIHZpY2UgdmVyc2EuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZhbGxiYWNrRGV2aWNlS2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gW107XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ2lkYicpIHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gYXdhaXQgZ2V0TGVnYWN5SWRiS2V5KCk7XG4gICAgICAgIGlmIChsZWdhY3kpIGtleXMucHVzaChsZWdhY3kpO1xuICAgIH1cbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnc2VlZCcpIHtcbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IGdldEV4aXN0aW5nU2VlZEtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkga2V5cy5wdXNoKHNlZWRLZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2Igd2l0aCB0aGUgY3VycmVudCBrZXksIGZhbGxpbmcgYmFjayB0byBldmVyeSBvdGhlciBrZXlcbiAqIHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQuIFJldHVybnMgdGhlIHBsYWludGV4dCBwbHVzIHdoZXRoZXIgYSBmYWxsYmFjayBrZXlcbiAqIHdhcyBuZWVkZWQgKGkuZS4gdGhlIGJsb2IgaXMgc3RhbGUgYW5kIHdvcnRoIHJlLXdyYXBwaW5nKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSwgc3RhbGU6IGZhbHNlIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGZhbGxiYWNrIG9mIGF3YWl0IGZhbGxiYWNrRGV2aWNlS2V5cygpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGZhbGxiYWNrLCBpdiwgY2lwaGVydGV4dCksXG4gICAgICAgICAgICAgICAgICAgIHN0YWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogdHJ5IHRoZSBuZXh0IG9uZSAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTsgLy8gcmVwb3J0IHRoZSBDVVJSRU5UIGtleSdzIGZhaWx1cmUsIG5vdCB0aGUgbGFzdCBmYWxsYmFjaydzXG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgZW5jLmVuY29kZShwbGFpbnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdjogMSxcbiAgICAgICAgazogJ2RldmljZScsXG4gICAgICAgIGl2OiBhYlRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYWJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FiKGl2KSkgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBiYXNlNjRUb0FiKGNpcGhlcnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aERldmljZUtleShlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICAvLyBHQ00gYXV0aGVudGljYXRpb24gY2FuIGZhaWwgd2l0aCB0aGUgQ1VSUkVOVCBzdHJhdGVneSdzIGtleSBiZWNhdXNlIHRoZVxuICAgIC8vIGJsb2IgcHJlZGF0ZXMgYSBzdHJhdGVneSBjaGFuZ2UgKGEgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd2hvc2UgSURCIGhhbmRsZVxuICAgIC8vIGlzIHN0aWxsIHJlYWRhYmxlIHdoaWxlIHRoaXMgY29udGV4dCBzZXR0bGVkIG9uIHRoZSBzZWVkLCBvciB0aGUgcmV2ZXJzZSkuXG4gICAgLy8gVHJ5IGV2ZXJ5IGtleSB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkIGJlZm9yZSBkZWNsYXJpbmcgdGhlIHNlY3JldCBsb3N0LlxuICAgIGNvbnN0IHsgcGxhaW50ZXh0IH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHBsYWludGV4dDtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2IgYW5kLCB3aGVuIGl0IGNvdWxkIG9ubHkgYmUgcmVhZCB2aWEgYSBmYWxsYmFjayBrZXlcbiAqIChsZWdhY3kgSW5kZXhlZERCIGhhbmRsZSwgb3IgYW4gZXhpc3Rpbmcgc2VlZCB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicpLFxuICogaGFuZCBiYWNrIGEgcmVwbGFjZW1lbnQgYmxvYiB3cmFwcGVkIHVuZGVyIHRoZSBDVVJSRU5UIHN0cmF0ZWd5IHNvIHRoZSBjYWxsZXJcbiAqIGNhbiBwZXJzaXN0IHRoZSB1cGdyYWRlIG9wcG9ydHVuaXN0aWNhbGx5LlxuICogYHJld3JhcHBlZGAgaXMgbnVsbCB3aGVuIHRoZSBibG9iIGlzIGFscmVhZHkgY3VycmVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwKGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IHsgcGxhaW50ZXh0LCBzdGFsZSB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBsYWludGV4dCxcbiAgICAgICAgcmV3cmFwcGVkOiBzdGFsZSA/IGF3YWl0IGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkgOiBudWxsLFxuICAgIH07XG59XG5cbi8vIC0tLSBCbG9iIGNsYXNzaWZpY2F0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZnVuY3Rpb24gaXNQYXNzd29yZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5zYWx0ICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0ICYmIHAuayAhPT0gJ2RldmljZScpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLmsgPT09ICdkZXZpY2UnICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbi8qKiBUcnVlIGlmIHRoZSB2YWx1ZSBpcyBhbHJlYWR5IGNpcGhlcnRleHQgKGVpdGhlciB3cmFwcGluZykuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaXBoZXJ0ZXh0KHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB8fCBpc0RldmljZUtleUJsb2IodmFsdWUpO1xufVxuXG4vLyAtLS0gVW5pZmllZCB3cmFwIC8gdW53cmFwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBzZWNyZXQgZm9yIGF0LXJlc3Qgc3RvcmFnZS4gUHJlZmVycyB0aGUgcGFzc3dvcmQtZGVyaXZlZCBzZXNzaW9uXG4gKiBrZXkgd2hlbiBvbmUgaXMgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dCAoYmFja2dyb3VuZCwgdW5sb2NrZWQpOyBvdGhlcndpc2VcbiAqIGZhbGxzIGJhY2sgdG8gdGhlIGFsd2F5cy1hdmFpbGFibGUgZGV2aWNlIGtleS4gTmV2ZXIgcmV0dXJucyBwbGFpbnRleHQuXG4gKlxuICogVGhlIHRpZXIgaXMgdGhlcmVmb3JlIEFNQklFTlQgXHUyMDE0IGl0IGlzIHdoYXRldmVyIGBzZXRTZXNzaW9uS2V5YCAvIGBjbGVhclNlc3Npb25gXG4gKiBsYXN0IGRpZCBpbiB0aGlzIG1vZHVsZSwgd2hpY2ggbWF5IGhhdmUgYmVlbiBkb25lIGJ5IGEgZGlmZmVyZW50IGZpbGUuIE9ubHlcbiAqIGNhbGwgdGhpcyB3aGVyZSBlaXRoZXIgdGllciBpcyBnZW51aW5lbHkgYWNjZXB0YWJsZSAoYSB2YWx1ZSB0aGF0XG4gKiBgdW53cmFwU2VjcmV0YCBjYW4gb3BlbiB1bmRlciBib3RoKS4gQSBjYWxsZXIgdGhhdCBuZWVkcyBhIFNQRUNJRklDIHRpZXIgbXVzdFxuICogbmFtZSBpdDogYGVuY3J5cHRXaXRoRGV2aWNlS2V5YCBvciBgZW5jcnlwdFdpdGhLZXlgLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEBwYXJhbSB7e2V4dHJhY3RhYmxlPzogYm9vbGVhbn19IFtvcHRpb25zXSAtIGBleHRyYWN0YWJsZTogdHJ1ZWAgYWxsb3dzIHRoZVxuICogICAgICAgIHJhdyBieXRlcyB0byBiZSBleHBvcnRlZCBvbmNlIChzZWUgZXhwb3J0S2V5QmFzZTY0KS4gVXNlZCBieSB0aGVcbiAqICAgICAgICBiYWNrZ3JvdW5kIHdvcmtlciBzbyBhbiB1bmxvY2tlZCBzZXNzaW9uIGNhbiBiZSBwYXJrZWQgaW5cbiAqICAgICAgICBzdG9yYWdlLnNlc3Npb24gYW5kIGZ1bGx5IHJlc3RvcmVkIGFmdGVyIGFuIE1WMyBldmljdGlvbi4gRGVmYXVsdFxuICogICAgICAgIGZhbHNlOiB0aGUga2V5IGlzIG9wYXF1ZSBhbmQgY2Fubm90IGxlYXZlIHRoZSBjcnlwdG8gc3Vic3lzdGVtLlxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgICEhb3B0aW9ucy5leHRyYWN0YWJsZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKlxuICogRXhwb3J0IGFuIGV4dHJhY3RhYmxlIEFFUyBrZXkncyByYXcgYnl0ZXMgYXMgYmFzZTY0LlxuICogT25seSBldmVyIGNhbGxlZCBvbiBhIGtleSBkZXJpdmVkIHdpdGggYHsgZXh0cmFjdGFibGU6IHRydWUgfWAuXG4gKlxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gYmFzZTY0IHJhdyBrZXkgYnl0ZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleUJhc2U2NChrZXkpIHtcbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChhd2FpdCBjcnlwdG8uc3VidGxlLmV4cG9ydEtleSgncmF3Jywga2V5KSk7XG59XG5cbi8qKlxuICogSW1wb3J0IGJhc2U2NCByYXcgYnl0ZXMgYmFjayBpbnRvIGEgTk9OLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNIGtleS5cbiAqIFRoZSBjb3VudGVycGFydCBvZiBleHBvcnRLZXlCYXNlNjQ6IHdoYXRldmVyIHdlbnQgb3V0IGV4dHJhY3RhYmxlIGNvbWVzIGJhY2tcbiAqIG9wYXF1ZSwgc28gYSByZXN0b3JlZCBzZXNzaW9uIGtleSBjYW5ub3QgYmUgcmUtZXhwb3J0ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NCAtIHJhdyBrZXkgYnl0ZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlCYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKiBiYXNlNjQgXHUyMTk0IGJ5dGVzLCBleHBvcnRlZCBzbyBjYWxsZXJzIGNhbiByb3VuZC10cmlwIGEgc2FsdCB0aHJvdWdoIEpTT04uICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlcykge1xuICAgIC8vIGBuZXcgVWludDhBcnJheSh2aWV3KWAgaW5zaWRlIHRoZSBoZWxwZXIgY29waWVzIHRoZSBWSUVXLCBzbyBhIHNhbHQgdGhhdFxuICAgIC8vIGlzIGEgd2luZG93IGludG8gYSBsYXJnZXIgYnVmZmVyIHN0aWxsIGVuY29kZXMgY29ycmVjdGx5LlxuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ5dGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgKGlnbm9yZXMgdGhlIHNhbHQgZW1iZWRkZWQgaW4gdGhlXG4gKiBibG9iIFx1MjAxNCB0aGUgY2FsbGVyIG11c3Qgc3VwcGx5IGEga2V5IHRoYXQgbWF0Y2hlcyBob3cgdGhlIGJsb2Igd2FzIGVuY3J5cHRlZCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKS9lbmNyeXB0V2l0aEtleSgpXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAtIEFFUy0yNTYtR0NNIGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhLZXkoZW5jcnlwdGVkRGF0YSwga2V5KSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGhhc2gsIHN0b3JlZEhhc2gpO1xufVxuXG4vKipcbiAqIENvbnN0YW50LXRpbWUgY29tcGFyaXNvbiBvZiB0d28gYmFzZTY0LWVuY29kZWQgYnl0ZSBzdHJpbmdzLlxuICpcbiAqIERlY29kZXMgYm90aCB0byByYXcgYnl0ZXMgYW5kIGNvbXBhcmVzIHdpdGggYW4gYWNjdW11bGF0b3Igc28gdGhlIHJ1bm5pbmdcbiAqIHRpbWUgZG9lcyBub3QgZGVwZW5kIG9uIHdoZXJlIHRoZSBmaXJzdCBtaXNtYXRjaCBvY2N1cnMgXHUyMDE0IHRoaXMgYXZvaWRzIHRoZVxuICogdGltaW5nIHNpZGUtY2hhbm5lbCBvZiBhIHBsYWluIGA9PT1gIHN0cmluZyBjb21wYXJlIChUaWVyLTMgY3J5cHRvLmpzOjIxMykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChhLCBiKSB7XG4gICAgbGV0IGJhLCBiYjtcbiAgICB0cnkge1xuICAgICAgICBiYSA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYSkpO1xuICAgICAgICBiYiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYikpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgdGhlIG1heCBsZW5ndGggc28gbGVuZ3RoIGRpZmZlcmVuY2VzIGRvbid0IHNob3J0LWNpcmN1aXQgZWFybHkuXG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgoYmEubGVuZ3RoLCBiYi5sZW5ndGgpO1xuICAgIGxldCBkaWZmID0gYmEubGVuZ3RoIF4gYmIubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGlmZiB8PSAoYmFbaV0gfHwgMCkgXiAoYmJbaV0gfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkaWZmID09PSAwO1xufVxuIiwgIi8qKlxuICogYnVua2VyOi8vIGNvbm5lY3Rpb24gc3RyaW5ncy4gTm8gaW1wb3J0cywgc28gYW55dGhpbmcgdGhhdCBoYW5kbGVzIHByb2ZpbGVzXG4gKiBjYW4gdXNlIHRoaXMgd2l0aG91dCBsb2FkaW5nIHRoZSByZWxheSBjb2RlLlxuICpcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5cbi8qKlxuICogUGFyc2UgYSBidW5rZXI6Ly8gY29ubmVjdGlvbiBzdHJpbmdcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdW5rZXJVcmwodXJsKSB7XG4gICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnYnVua2VyOi8vJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgY29uc3QgcmVtb3RlUHVia2V5ID0gcGFyc2VkLmhvc3RuYW1lIHx8IHBhcnNlZC5wYXRobmFtZS5yZXBsYWNlKCcvLycsICcnKTtcblxuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBwdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5cyA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0QWxsKCdyZWxheScpO1xuICAgIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSByZWxheSBVUkxzXG4gICAgZm9yIChjb25zdCByZWxheSBvZiByZWxheXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgVVJMKHJlbGF5KTtcbiAgICAgICAgICAgIGlmIChyLnByb3RvY29sICE9PSAnd3NzOicgJiYgci5wcm90b2NvbCAhPT0gJ3dzOicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVsYXkgcHJvdG9jb2w6ICR7ci5wcm90b2NvbH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlbGF5IFVSTDogJHtyZWxheX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNlY3JldCA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0KCdzZWNyZXQnKSB8fCBudWxsO1xuXG4gICAgcmV0dXJuIHsgcmVtb3RlUHVia2V5LCByZWxheXMsIHNlY3JldCB9O1xufVxuXG4vKipcbiAqIEEgcmVsYXkgdmFsdWUgd2l0aG91dCBjcmVkZW50aWFsczogbm8gdXNlcmluZm8sIG5vIGBzZWNyZXRgIHBhcmFtLCBubyBmcmFnbWVudC5cbiAqIE90aGVyIHF1ZXJ5IHBhcmFtcyBzdGF5LiBBIHZhbHVlIHdpdGggbm9uZSBvZiB0aG9zZSBjb21lcyBiYWNrIHVuY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gY2xlYW5SZWxheShyZWxheSkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVsYXkpO1xuICAgIGNvbnN0IG5hbWVzID0gWy4uLnVybC5zZWFyY2hQYXJhbXMua2V5cygpXS5maWx0ZXIobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWNyZXQnKTtcbiAgICBpZiAoIXVybC51c2VybmFtZSAmJiAhdXJsLnBhc3N3b3JkICYmICF1cmwuaGFzaCAmJiBuYW1lcy5sZW5ndGggPT09IDApIHJldHVybiByZWxheTtcbiAgICB1cmwudXNlcm5hbWUgPSAnJztcbiAgICB1cmwucGFzc3dvcmQgPSAnJztcbiAgICB1cmwuaGFzaCA9ICcnO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUobmFtZSk7XG4gICAgcmV0dXJuIHVybC5ocmVmO1xufVxuXG4vKipcbiAqIERvZXMgdGhpcyBjb25uZWN0aW9uIHN0cmluZyBjYXJyeSBhIHNlY3JldCByZWRhY3RCdW5rZXJVcmwgd291bGQgcmVtb3ZlLCBpbiBpdHNcbiAqIGBzZWNyZXRgIHBhcmFtIG9yIGluc2lkZSBhIHJlbGF5IHZhbHVlPyBOZXZlciB0aHJvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJVcmxIYXNTZWNyZXQodXJsKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZWNyZXQsIHJlbGF5cyB9ID0gcGFyc2VCdW5rZXJVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuICEhc2VjcmV0IHx8IHJlbGF5cy5zb21lKHJlbGF5ID0+IGNsZWFuUmVsYXkocmVsYXkpICE9PSByZWxheSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmNvbnN0IGVuY29kZVJlbGF5ID0gKHJlbGF5KSA9PlxuICAgIGVuY29kZVVSSUNvbXBvbmVudChyZWxheSkucmVwbGFjZSgvJTNBL2csICc6JykucmVwbGFjZSgvJTJGL2csICcvJyk7XG5cbi8qKlxuICogVGhlIHNpZ25lcidzIGFkZHJlc3MgYWxvbmU6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PS4uLiZyZWxheT0uLi5cbiAqIFJlYnVpbHQgZnJvbSB0aGUgcGFyc2VkIGZpZWxkcywgc28gb2YgdGhlIGNvbm5lY3Rpb24gc3RyaW5nIG9ubHkgdGhlIHB1YmtleSBhbmRcbiAqIHRoZSByZWxheSB2YWx1ZXMgc3Vydml2ZS4gRWFjaCByZWxheSB2YWx1ZSBsb3NlcyBpdHMgdXNlcmluZm8sIGBzZWNyZXRgIHBhcmFtXG4gKiBhbmQgZnJhZ21lbnQsIGFuZCBrZWVwcyBhbnkgb3RoZXIgcXVlcnkgcGFyYW1zIGl0IGhhcy5cbiAqXG4gKiBAcGFyYW0geyp9IHVybCBhIGNvbm5lY3Rpb24gc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgYWRkcmVzcywgb3IgJycgaWYgYHVybGAgaXMgbm90IGEgdmFsaWQgY29ubmVjdGlvbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdEJ1bmtlclVybCh1cmwpIHtcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IHBhcnNlQnVua2VyVXJsKHVybCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY29uc3QgcmVsYXlzID0gcGFyc2VkLnJlbGF5cy5tYXAocmVsYXkgPT4gYHJlbGF5PSR7ZW5jb2RlUmVsYXkoY2xlYW5SZWxheShyZWxheSkpfWApLmpvaW4oJyYnKTtcbiAgICByZXR1cm4gYGJ1bmtlcjovLyR7cGFyc2VkLnJlbW90ZVB1YmtleX0/JHtyZWxheXN9YDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBwcm9maWxlIGxpc3Qgd2l0aCBlYWNoIGJ1bmtlclVybCByZWR1Y2VkIHRvIGl0cyBhZGRyZXNzLlxuICpcbiAqIEBwYXJhbSB7Kn0gcHJvZmlsZXMgYSBwcm9maWxlIGxpc3Q7IGFueXRoaW5nIGVsc2UgaXMgcmV0dXJuZWQgYXMgaXQgaXNcbiAqIEByZXR1cm5zIHRoZSBzYW1lIGxpc3Qgd2hlbiBub3RoaW5nIG5lZWRlZCBjaGFuZ2luZywgc28gYSBjYWxsZXIgY2FuIHNraXAgYVxuICogICAgICAgICAgd3JpdGUgYnkgY29tcGFyaW5nIHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuIHByb2ZpbGVzO1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgY2xlYW4gPSBwcm9maWxlcy5tYXAoKHByb2ZpbGUpID0+IHtcbiAgICAgICAgaWYgKCFwcm9maWxlPy5idW5rZXJVcmwpIHJldHVybiBwcm9maWxlO1xuICAgICAgICBjb25zdCBidW5rZXJVcmwgPSByZWRhY3RCdW5rZXJVcmwocHJvZmlsZS5idW5rZXJVcmwpO1xuICAgICAgICBpZiAoYnVua2VyVXJsID09PSBwcm9maWxlLmJ1bmtlclVybCkgcmV0dXJuIHByb2ZpbGU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4geyAuLi5wcm9maWxlLCBidW5rZXJVcmwgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2hhbmdlZCA/IGNsZWFuIDogcHJvZmlsZXM7XG59XG5cbi8qKlxuICogU3RvcmVkIHNlc3Npb25zIGFyZSBrZXllZCBieSBwcm9maWxlIHBvc2l0aW9uLiBSZW1vdmluZyBhIHByb2ZpbGUgdGFrZXMgaXRzXG4gKiBzZXNzaW9uIHdpdGggaXQgYW5kIG1vdmVzIGxhdGVyIHNlc3Npb25zIGRvd24gd2l0aCB0aGVpciBwcm9maWxlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsICo+fSBidW5rZXJTZXNzaW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IHJlbW92ZWRJbmRleFxuICogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyU2Vzc2lvbnNBZnRlckRlbGV0ZShidW5rZXJTZXNzaW9ucywgcmVtb3ZlZEluZGV4KSB7XG4gICAgY29uc3Qgc2hpZnRlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBpZiAoaW5kZXggPT09IHJlbW92ZWRJbmRleCkgY29udGludWU7XG4gICAgICAgIHNoaWZ0ZWRbaW5kZXggPiByZW1vdmVkSW5kZXggPyBpbmRleCAtIDEgOiBpbmRleF0gPSBzZXNzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gc2hpZnRlZDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSwgZm9yIGFueSBjaGFuZ2Ugb2YgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCAqPn0gYnVua2VyU2Vzc2lvbnNcbiAqIEBwYXJhbSB7QXJyYXk8W251bWJlciwgP251bWJlcl0+fSBtb3ZlcyBlYWNoIHByb2ZpbGUgdGhhdCBtb3ZlZCwgYW5kIHRvIHdoZXJlOyBudWxsIGlmIGdvbmVcbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcyhidW5rZXJTZXNzaW9ucywgbW92ZXMpIHtcbiAgICBjb25zdCBtb3ZlZCA9IG5ldyBNYXAobW92ZXMpO1xuICAgIGNvbnN0IHBsYWNlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBjb25zdCB0byA9IG1vdmVkLmhhcyhpbmRleCkgPyBtb3ZlZC5nZXQoaW5kZXgpIDogaW5kZXg7XG4gICAgICAgIGlmICh0byAhPT0gbnVsbCkgcGxhY2VkW3RvXSA9IHNlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBwbGFjZWQ7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUNBLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBOURBLE1BZ0JNLFVBYUEsVUF1Q0E7QUFwRU47QUFBQTtBQUFBO0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLFVBQUksQ0FBQyxVQUFVO0FBQ1gsY0FBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsTUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBdUNyRSxNQUFNLE1BQU0sQ0FBQztB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
