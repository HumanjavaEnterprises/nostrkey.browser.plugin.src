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
  async function deleteDocumentLocal(path, deletedAt = null) {
    const docs = await getDocs();
    delete docs[path];
    const deleted = await getDeletedDocs();
    const at = Number.isFinite(deletedAt) ? deletedAt : Math.floor(Date.now() / 1e3);
    if (deleted[path] == null || at > deleted[path]) deleted[path] = at;
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
      const held = await getVaultIndex();
      const result = await api.runtime.sendMessage({
        kind: "vault.fetch",
        payload: { paths: Object.keys(held) }
      });
      if (!result.success) {
        state.globalSyncStatus = "error";
        state.syncError = result.error || "Sync failed";
        render();
        return;
      }
      for (const [path, ts] of Object.entries(result.deleted || {})) {
        const local = held[path];
        if (!local || local.syncStatus === "local-only") continue;
        if ((local.relayCreatedAt || 0) > ts) continue;
        await deleteDocumentLocal(path, ts);
        if (state.selectedPath === path) state.selectedPath = null;
      }
      const localDocs = await getVaultIndex();
      const remoteByPath = {};
      for (const doc of result.documents) remoteByPath[doc.path] = doc;
      const { merged: remoteDocs } = mergeRemote({}, remoteByPath, await getDeletedDocs(), {
        timeOf: (d) => d.createdAt || 0
      });
      for (const remote of Object.values(remoteDocs)) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL25pcDc4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdmF1bHQtc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1lcmdlLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc2VjcmV0LXZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY3J5cHRvLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnVua2VyLXVybC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBNaW5pbWFsIHByb2Nlc3Mgc2hpbSBmb3IgYnJvd3NlciBjb250ZXh0LlxuICogTm9kZS5qcyBsaWJyYXJpZXMgYnVuZGxlZCB2aWEgbm9zdHItY3J5cHRvLXV0aWxzIChjcnlwdG8tYnJvd3NlcmlmeSxcbiAqIHJlYWRhYmxlLXN0cmVhbSwgZXRjLikgcmVmZXJlbmNlIHRoZSBnbG9iYWwgYHByb2Nlc3NgIG9iamVjdC5cbiAqIFRoaXMgcHJvdmlkZXMganVzdCBlbm91Z2ggZm9yIHRoZW0gdG8gd29yayBpbiBhIGJyb3dzZXIgZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgdmFyIHByb2Nlc3MgPSB7XG4gICAgZW52OiB7IE5PREVfRU5WOiAncHJvZHVjdGlvbicsIExPR19MRVZFTDogJ3dhcm4nIH0sXG4gICAgYnJvd3NlcjogdHJ1ZSxcbiAgICB2ZXJzaW9uOiAnJyxcbiAgICBzdGRvdXQ6IG51bGwsXG4gICAgc3RkZXJyOiBudWxsLFxuICAgIG5leHRUaWNrOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkobnVsbCwgYXJncyk7IH0pO1xuICAgIH0sXG59O1xuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zZXNzaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBNVjMgaW4tbWVtb3J5IGFyZWEgdGhhdCBzdXJ2aXZlcyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbiBidXQgbmV2ZXIgdG91Y2hlc1xuICAgIC8vIGRpc2suIE51bGwgb24gZW5naW5lcyB0aGF0IGRvbid0IGltcGxlbWVudCBpdCAoU2FmYXJpIGJhY2tncm91bmQgcGFnZSxcbiAgICAvLyBvbGRlciBGaXJlZm94KSBcdTIwMTQgY2FsbGVycyBtdXN0IGZlYXR1cmUtZGV0ZWN0IGFuZCBmYWxsIGJhY2suXG4gICAgc2Vzc2lvbjogX2Jyb3dzZXIuc3RvcmFnZT8uc2Vzc2lvbiA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRoZSBhcmVhIHRvIGV4dGVuc2lvbi1wcml2aWxlZ2VkIGNvbnRleHRzLiBDaHJvbWUtb25seTtcbiAgICAgICAgICogcmVzb2x2ZXMgaGFybWxlc3NseSB3aGVyZSB0aGUgbWV0aG9kIGlzIGFic2VudC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiY29uc3QgaW5zdGFuY2VPZkFueSA9IChvYmplY3QsIGNvbnN0cnVjdG9ycykgPT4gY29uc3RydWN0b3JzLnNvbWUoKGMpID0+IG9iamVjdCBpbnN0YW5jZW9mIGMpO1xuXG5sZXQgaWRiUHJveHlhYmxlVHlwZXM7XG5sZXQgY3Vyc29yQWR2YW5jZU1ldGhvZHM7XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldElkYlByb3h5YWJsZVR5cGVzKCkge1xuICAgIHJldHVybiAoaWRiUHJveHlhYmxlVHlwZXMgfHxcbiAgICAgICAgKGlkYlByb3h5YWJsZVR5cGVzID0gW1xuICAgICAgICAgICAgSURCRGF0YWJhc2UsXG4gICAgICAgICAgICBJREJPYmplY3RTdG9yZSxcbiAgICAgICAgICAgIElEQkluZGV4LFxuICAgICAgICAgICAgSURCQ3Vyc29yLFxuICAgICAgICAgICAgSURCVHJhbnNhY3Rpb24sXG4gICAgICAgIF0pKTtcbn1cbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKSB7XG4gICAgcmV0dXJuIChjdXJzb3JBZHZhbmNlTWV0aG9kcyB8fFxuICAgICAgICAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgPSBbXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmFkdmFuY2UsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZVByaW1hcnlLZXksXG4gICAgICAgIF0pKTtcbn1cbmNvbnN0IHRyYW5zYWN0aW9uRG9uZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCB0cmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHdyYXAocmVxdWVzdC5yZXN1bHQpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gVGhpcyBtYXBwaW5nIGV4aXN0cyBpbiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgYnV0IGRvZXNuJ3QgZXhpc3QgaW4gdHJhbnNmb3JtQ2FjaGUuIFRoaXNcbiAgICAvLyBpcyBiZWNhdXNlIHdlIGNyZWF0ZSBtYW55IHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdC5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb21pc2UsIHJlcXVlc3QpO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHR4KSB7XG4gICAgLy8gRWFybHkgYmFpbCBpZiB3ZSd2ZSBhbHJlYWR5IGNyZWF0ZWQgYSBkb25lIHByb21pc2UgZm9yIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgaWYgKHRyYW5zYWN0aW9uRG9uZU1hcC5oYXModHgpKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgZG9uZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QodHguZXJyb3IgfHwgbmV3IERPTUV4Y2VwdGlvbignQWJvcnRFcnJvcicsICdBYm9ydEVycm9yJykpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBDYWNoZSBpdCBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuICAgIHRyYW5zYWN0aW9uRG9uZU1hcC5zZXQodHgsIGRvbmUpO1xufVxubGV0IGlkYlByb3h5VHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciB0cmFuc2FjdGlvbi5kb25lLlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdkb25lJylcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25Eb25lTWFwLmdldCh0YXJnZXQpO1xuICAgICAgICAgICAgLy8gTWFrZSB0eC5zdG9yZSByZXR1cm4gdGhlIG9ubHkgc3RvcmUgaW4gdGhlIHRyYW5zYWN0aW9uLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG1hbnkuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ3N0b3JlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzFdXG4gICAgICAgICAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIDogcmVjZWl2ZXIub2JqZWN0U3RvcmUocmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSB0cmFuc2Zvcm0gd2hhdGV2ZXIgd2UgZ2V0IGJhY2suXG4gICAgICAgIHJldHVybiB3cmFwKHRhcmdldFtwcm9wXSk7XG4gICAgfSxcbiAgICBzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbiAmJlxuICAgICAgICAgICAgKHByb3AgPT09ICdkb25lJyB8fCBwcm9wID09PSAnc3RvcmUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0O1xuICAgIH0sXG59O1xuZnVuY3Rpb24gcmVwbGFjZVRyYXBzKGNhbGxiYWNrKSB7XG4gICAgaWRiUHJveHlUcmFwcyA9IGNhbGxiYWNrKGlkYlByb3h5VHJhcHMpO1xufVxuZnVuY3Rpb24gd3JhcEZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBEdWUgdG8gZXhwZWN0ZWQgb2JqZWN0IGVxdWFsaXR5ICh3aGljaCBpcyBlbmZvcmNlZCBieSB0aGUgY2FjaGluZyBpbiBgd3JhcGApLCB3ZVxuICAgIC8vIG9ubHkgY3JlYXRlIG9uZSBuZXcgZnVuYyBwZXIgZnVuYy5cbiAgICAvLyBDdXJzb3IgbWV0aG9kcyBhcmUgc3BlY2lhbCwgYXMgdGhlIGJlaGF2aW91ciBpcyBhIGxpdHRsZSBtb3JlIGRpZmZlcmVudCB0byBzdGFuZGFyZCBJREIuIEluXG4gICAgLy8gSURCLCB5b3UgYWR2YW5jZSB0aGUgY3Vyc29yIGFuZCB3YWl0IGZvciBhIG5ldyAnc3VjY2Vzcycgb24gdGhlIElEQlJlcXVlc3QgdGhhdCBnYXZlIHlvdSB0aGVcbiAgICAvLyBjdXJzb3IuIEl0J3Mga2luZGEgbGlrZSBhIHByb21pc2UgdGhhdCBjYW4gcmVzb2x2ZSB3aXRoIG1hbnkgdmFsdWVzLiBUaGF0IGRvZXNuJ3QgbWFrZSBzZW5zZVxuICAgIC8vIHdpdGggcmVhbCBwcm9taXNlcywgc28gZWFjaCBhZHZhbmNlIG1ldGhvZHMgcmV0dXJucyBhIG5ldyBwcm9taXNlIGZvciB0aGUgY3Vyc29yIG9iamVjdCwgb3JcbiAgICAvLyB1bmRlZmluZWQgaWYgdGhlIGVuZCBvZiB0aGUgY3Vyc29yIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgaWYgKGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkuaW5jbHVkZXMoZnVuYykpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICAgICAgZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIHdyYXAodGhpcy5yZXF1ZXN0KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgcmV0dXJuIHdyYXAoZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIHJldHVybiB3cmFwRnVuY3Rpb24odmFsdWUpO1xuICAgIC8vIFRoaXMgZG9lc24ndCByZXR1cm4sIGl0IGp1c3QgY3JlYXRlcyBhICdkb25lJyBwcm9taXNlIGZvciB0aGUgdHJhbnNhY3Rpb24sXG4gICAgLy8gd2hpY2ggaXMgbGF0ZXIgcmV0dXJuZWQgZm9yIHRyYW5zYWN0aW9uLmRvbmUgKHNlZSBpZGJPYmplY3RIYW5kbGVyKS5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbilcbiAgICAgICAgY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHZhbHVlKTtcbiAgICBpZiAoaW5zdGFuY2VPZkFueSh2YWx1ZSwgZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSkpXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkodmFsdWUsIGlkYlByb3h5VHJhcHMpO1xuICAgIC8vIFJldHVybiB0aGUgc2FtZSB2YWx1ZSBiYWNrIGlmIHdlJ3JlIG5vdCBnb2luZyB0byB0cmFuc2Zvcm0gaXQuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gd3JhcCh2YWx1ZSkge1xuICAgIC8vIFdlIHNvbWV0aW1lcyBnZW5lcmF0ZSBtdWx0aXBsZSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QgKGVnIHdoZW4gY3Vyc29yaW5nKSwgYmVjYXVzZVxuICAgIC8vIElEQiBpcyB3ZWlyZCBhbmQgYSBzaW5nbGUgSURCUmVxdWVzdCBjYW4geWllbGQgbWFueSByZXNwb25zZXMsIHNvIHRoZXNlIGNhbid0IGJlIGNhY2hlZC5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJSZXF1ZXN0KVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdCh2YWx1ZSk7XG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSB0cmFuc2Zvcm1lZCB0aGlzIHZhbHVlIGJlZm9yZSwgcmV1c2UgdGhlIHRyYW5zZm9ybWVkIHZhbHVlLlxuICAgIC8vIFRoaXMgaXMgZmFzdGVyLCBidXQgaXQgYWxzbyBwcm92aWRlcyBvYmplY3QgZXF1YWxpdHkuXG4gICAgaWYgKHRyYW5zZm9ybUNhY2hlLmhhcyh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSk7XG4gICAgLy8gTm90IGFsbCB0eXBlcyBhcmUgdHJhbnNmb3JtZWQuXG4gICAgLy8gVGhlc2UgbWF5IGJlIHByaW1pdGl2ZSB0eXBlcywgc28gdGhleSBjYW4ndCBiZSBXZWFrTWFwIGtleXMuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB0cmFuc2Zvcm1DYWNoZS5zZXQodmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChuZXdWYWx1ZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3VmFsdWU7XG59XG5jb25zdCB1bndyYXAgPSAodmFsdWUpID0+IHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuXG4vKipcbiAqIE9wZW4gYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqIEBwYXJhbSB2ZXJzaW9uIFNjaGVtYSB2ZXJzaW9uLlxuICogQHBhcmFtIGNhbGxiYWNrcyBBZGRpdGlvbmFsIGNhbGxiYWNrcy5cbiAqL1xuZnVuY3Rpb24gb3BlbkRCKG5hbWUsIHZlcnNpb24sIHsgYmxvY2tlZCwgdXBncmFkZSwgYmxvY2tpbmcsIHRlcm1pbmF0ZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKG5hbWUsIHZlcnNpb24pO1xuICAgIGNvbnN0IG9wZW5Qcm9taXNlID0gd3JhcChyZXF1ZXN0KTtcbiAgICBpZiAodXBncmFkZSkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZ3JhZGVuZWVkZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHVwZ3JhZGUod3JhcChyZXF1ZXN0LnJlc3VsdCksIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIHdyYXAocmVxdWVzdC50cmFuc2FjdGlvbiksIGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICBvcGVuUHJvbWlzZVxuICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgaWYgKHRlcm1pbmF0ZWQpXG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHRlcm1pbmF0ZWQoKSk7XG4gICAgICAgIGlmIChibG9ja2luZykge1xuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcigndmVyc2lvbmNoYW5nZScsIChldmVudCkgPT4gYmxvY2tpbmcoZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pO1xuICAgIHJldHVybiBvcGVuUHJvbWlzZTtcbn1cbi8qKlxuICogRGVsZXRlIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURCKG5hbWUsIHsgYmxvY2tlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLmRlbGV0ZURhdGFiYXNlKG5hbWUpO1xuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gd3JhcChyZXF1ZXN0KS50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG59XG5cbmNvbnN0IHJlYWRNZXRob2RzID0gWydnZXQnLCAnZ2V0S2V5JywgJ2dldEFsbCcsICdnZXRBbGxLZXlzJywgJ2NvdW50J107XG5jb25zdCB3cml0ZU1ldGhvZHMgPSBbJ3B1dCcsICdhZGQnLCAnZGVsZXRlJywgJ2NsZWFyJ107XG5jb25zdCBjYWNoZWRNZXRob2RzID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkge1xuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIElEQkRhdGFiYXNlICYmXG4gICAgICAgICEocHJvcCBpbiB0YXJnZXQpICYmXG4gICAgICAgIHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkTWV0aG9kcy5nZXQocHJvcCkpXG4gICAgICAgIHJldHVybiBjYWNoZWRNZXRob2RzLmdldChwcm9wKTtcbiAgICBjb25zdCB0YXJnZXRGdW5jTmFtZSA9IHByb3AucmVwbGFjZSgvRnJvbUluZGV4JC8sICcnKTtcbiAgICBjb25zdCB1c2VJbmRleCA9IHByb3AgIT09IHRhcmdldEZ1bmNOYW1lO1xuICAgIGNvbnN0IGlzV3JpdGUgPSB3cml0ZU1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpO1xuICAgIGlmIChcbiAgICAvLyBCYWlsIGlmIHRoZSB0YXJnZXQgZG9lc24ndCBleGlzdCBvbiB0aGUgdGFyZ2V0LiBFZywgZ2V0QWxsIGlzbid0IGluIEVkZ2UuXG4gICAgISh0YXJnZXRGdW5jTmFtZSBpbiAodXNlSW5kZXggPyBJREJJbmRleCA6IElEQk9iamVjdFN0b3JlKS5wcm90b3R5cGUpIHx8XG4gICAgICAgICEoaXNXcml0ZSB8fCByZWFkTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbWV0aG9kID0gYXN5bmMgZnVuY3Rpb24gKHN0b3JlTmFtZSwgLi4uYXJncykge1xuICAgICAgICAvLyBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiB1bmRlZmluZWQgZ3ppcHBzIGJldHRlciwgYnV0IGZhaWxzIGluIEVkZ2UgOihcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLnRyYW5zYWN0aW9uKHN0b3JlTmFtZSwgaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogJ3JlYWRvbmx5Jyk7XG4gICAgICAgIGxldCB0YXJnZXQgPSB0eC5zdG9yZTtcbiAgICAgICAgaWYgKHVzZUluZGV4KVxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmluZGV4KGFyZ3Muc2hpZnQoKSk7XG4gICAgICAgIC8vIE11c3QgcmVqZWN0IGlmIG9wIHJlamVjdHMuXG4gICAgICAgIC8vIElmIGl0J3MgYSB3cml0ZSBvcGVyYXRpb24sIG11c3QgcmVqZWN0IGlmIHR4LmRvbmUgcmVqZWN0cy5cbiAgICAgICAgLy8gTXVzdCByZWplY3Qgd2l0aCBvcCByZWplY3Rpb24gZmlyc3QuXG4gICAgICAgIC8vIE11c3QgcmVzb2x2ZSB3aXRoIG9wIHZhbHVlLlxuICAgICAgICAvLyBNdXN0IGhhbmRsZSBib3RoIHByb21pc2VzIChubyB1bmhhbmRsZWQgcmVqZWN0aW9ucylcbiAgICAgICAgcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0YXJnZXRbdGFyZ2V0RnVuY05hbWVdKC4uLmFyZ3MpLFxuICAgICAgICAgICAgaXNXcml0ZSAmJiB0eC5kb25lLFxuICAgICAgICBdKSlbMF07XG4gICAgfTtcbiAgICBjYWNoZWRNZXRob2RzLnNldChwcm9wLCBtZXRob2QpO1xuICAgIHJldHVybiBtZXRob2Q7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldDogKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSxcbiAgICBoYXM6ICh0YXJnZXQsIHByb3ApID0+ICEhZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCksXG59KSk7XG5cbmNvbnN0IGFkdmFuY2VNZXRob2RQcm9wcyA9IFsnY29udGludWUnLCAnY29udGludWVQcmltYXJ5S2V5JywgJ2FkdmFuY2UnXTtcbmNvbnN0IG1ldGhvZE1hcCA9IHt9O1xuY29uc3QgYWR2YW5jZVJlc3VsdHMgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgY3Vyc29ySXRlcmF0b3JUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICghYWR2YW5jZU1ldGhvZFByb3BzLmluY2x1ZGVzKHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgbGV0IGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF07XG4gICAgICAgIGlmICghY2FjaGVkRnVuYykge1xuICAgICAgICAgICAgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgYWR2YW5jZVJlc3VsdHMuc2V0KHRoaXMsIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LmdldCh0aGlzKVtwcm9wXSguLi5hcmdzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZWRGdW5jO1xuICAgIH0sXG59O1xuYXN5bmMgZnVuY3Rpb24qIGl0ZXJhdGUoLi4uYXJncykge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby10aGlzLWFzc2lnbm1lbnRcbiAgICBsZXQgY3Vyc29yID0gdGhpcztcbiAgICBpZiAoIShjdXJzb3IgaW5zdGFuY2VvZiBJREJDdXJzb3IpKSB7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5vcGVuQ3Vyc29yKC4uLmFyZ3MpO1xuICAgIH1cbiAgICBpZiAoIWN1cnNvcilcbiAgICAgICAgcmV0dXJuO1xuICAgIGN1cnNvciA9IGN1cnNvcjtcbiAgICBjb25zdCBwcm94aWVkQ3Vyc29yID0gbmV3IFByb3h5KGN1cnNvciwgY3Vyc29ySXRlcmF0b3JUcmFwcyk7XG4gICAgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuc2V0KHByb3hpZWRDdXJzb3IsIGN1cnNvcik7XG4gICAgLy8gTWFwIHRoaXMgZG91YmxlLXByb3h5IGJhY2sgdG8gdGhlIG9yaWdpbmFsLCBzbyBvdGhlciBjdXJzb3IgbWV0aG9kcyB3b3JrLlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJveGllZEN1cnNvciwgdW53cmFwKGN1cnNvcikpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgeWllbGQgcHJveGllZEN1cnNvcjtcbiAgICAgICAgLy8gSWYgb25lIG9mIHRoZSBhZHZhbmNpbmcgbWV0aG9kcyB3YXMgbm90IGNhbGxlZCwgY2FsbCBjb250aW51ZSgpLlxuICAgICAgICBjdXJzb3IgPSBhd2FpdCAoYWR2YW5jZVJlc3VsdHMuZ2V0KHByb3hpZWRDdXJzb3IpIHx8IGN1cnNvci5jb250aW51ZSgpKTtcbiAgICAgICAgYWR2YW5jZVJlc3VsdHMuZGVsZXRlKHByb3hpZWRDdXJzb3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkge1xuICAgIHJldHVybiAoKHByb3AgPT09IFN5bWJvbC5hc3luY0l0ZXJhdG9yICYmXG4gICAgICAgIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlLCBJREJDdXJzb3JdKSkgfHxcbiAgICAgICAgKHByb3AgPT09ICdpdGVyYXRlJyAmJiBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZV0pKSk7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmIChpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGU7XG4gICAgICAgIHJldHVybiBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIHJldHVybiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApO1xuICAgIH0sXG59KSk7XG5cbmV4cG9ydCB7IGRlbGV0ZURCLCBvcGVuREIsIHVud3JhcCwgd3JhcCB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGFza0dhdGUsIHN0YXJ0UGFnZSB9IGZyb20gJy4uL3V0aWxpdGllcy9wYWdlLWdhdGUnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcbmltcG9ydCB7IEFQSV9LRVlTX1BBVEggfSBmcm9tICcuLi91dGlsaXRpZXMvbmlwNzgnO1xuaW1wb3J0IHtcbiAgICBnZXRWYXVsdEluZGV4LFxuICAgIGdldERvY3VtZW50LFxuICAgIHNhdmVEb2N1bWVudExvY2FsLFxuICAgIGRlbGV0ZURvY3VtZW50TG9jYWwsXG4gICAgbGlzdERvY3VtZW50cyxcbiAgICB1cGRhdGVTeW5jU3RhdHVzLFxuICAgIGdldERlbGV0ZWREb2NzLFxufSBmcm9tICcuLi91dGlsaXRpZXMvdmF1bHQtc3RvcmUnO1xuaW1wb3J0IHsgbWVyZ2VSZW1vdGUgfSBmcm9tICcuLi91dGlsaXRpZXMvc3luYy1tZXJnZSc7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGRvY3VtZW50czogW10sXG4gICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgIHNlbGVjdGVkUGF0aDogbnVsbCxcbiAgICBlZGl0b3JUaXRsZTogJycsXG4gICAgZWRpdG9yQ29udGVudDogJycsXG4gICAgcHJpc3RpbmVUaXRsZTogJycsXG4gICAgcHJpc3RpbmVDb250ZW50OiAnJyxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsXG4gICAgc3luY0Vycm9yOiAnJyxcbiAgICBzYXZpbmc6IGZhbHNlLFxuICAgIGlzTmV3OiBmYWxzZSxcbiAgICB0b2FzdDogJycsXG4gICAgcmVsYXlJbmZvOiB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfSxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBoYXNSZWxheXMoKSB7XG4gICAgcmV0dXJuIHN0YXRlLnJlbGF5SW5mby5yZWFkLmxlbmd0aCA+IDAgfHwgc3RhdGUucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlcmVkRG9jdW1lbnRzKCkge1xuICAgIGlmICghc3RhdGUuc2VhcmNoUXVlcnkpIHJldHVybiBzdGF0ZS5kb2N1bWVudHM7XG4gICAgY29uc3QgcSA9IHN0YXRlLnNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHN0YXRlLmRvY3VtZW50cy5maWx0ZXIoZCA9PiBkLnBhdGgudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxKSk7XG59XG5cbmZ1bmN0aW9uIGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHN0YXRlLmVkaXRvckNvbnRlbnQgIT09IHN0YXRlLnByaXN0aW5lQ29udGVudCB8fCBzdGF0ZS5lZGl0b3JUaXRsZSAhPT0gc3RhdGUucHJpc3RpbmVUaXRsZTtcbn1cblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1zZykge1xuICAgIHN0YXRlLnRvYXN0ID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS50b2FzdCA9ICcnOyByZW5kZXIoKTsgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNDbGFzcyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiAnbGVkLS1ncmVlbic7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ2xlZC0tYW1iZXIgbGVkLXB1bHNlJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gJ1N5bmNlZCc7XG59XG5cbmZ1bmN0aW9uIGRvY1N5bmNDbGFzcyhzeW5jU3RhdHVzKSB7XG4gICAgaWYgKHN5bmNTdGF0dXMgPT09ICdzeW5jZWQnKSByZXR1cm4gJ2xlZC0tZ3JlZW4nO1xuICAgIGlmIChzeW5jU3RhdHVzID09PSAnbG9jYWwtb25seScpIHJldHVybiAnbGVkLS1hbWJlcic7XG4gICAgcmV0dXJuICdsZWQtLXJlZCc7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3QgZG9jQ291bnQgPSAkKCdkb2MtY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBsZWQgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCk7XG4gICAgaWYgKGRvY0NvdW50KSBkb2NDb3VudC50ZXh0Q29udGVudCA9IHN0YXRlLmRvY3VtZW50cy5sZW5ndGggKyAnIGRvYycgKyAoc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKTtcblxuICAgIC8vIEZpbGUgbGlzdFxuICAgIGNvbnN0IGZpbGVMaXN0ID0gJCgnZmlsZS1saXN0Jyk7XG4gICAgY29uc3QgZW1wdHlNc2cgPSAkKCduby1kb2N1bWVudHMnKTtcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGdldEZpbHRlcmVkRG9jdW1lbnRzKCk7XG5cbiAgICBpZiAoZmlsZUxpc3QpIHtcbiAgICAgICAgZmlsZUxpc3QuaW5uZXJIVE1MID0gZmlsdGVyZWQubWFwKGRvYyA9PiBgXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJkb2MtaXRlbSAke3N0YXRlLnNlbGVjdGVkUGF0aCA9PT0gZG9jLnBhdGggPyAnc2VsZWN0ZWQnIDogJyd9XCJcbiAgICAgICAgICAgICAgICBkYXRhLWRvYy1wYXRoPVwiJHtkb2MucGF0aH1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkb2MtcGF0aCBtb25vIGlucy10cnVuY2F0ZVwiPiR7ZG9jLnBhdGh9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRvYy1zeW5jIGxlZC1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlZCAke2RvYy51bmRlY3J5cHRhYmxlID8gJ2xlZC0tcmVkJyA6IGRvY1N5bmNDbGFzcyhkb2Muc3luY1N0YXR1cyl9XCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1vbm9cIj4ke2RvYy51bmRlY3J5cHRhYmxlID8gJ3VuZGVjcnlwdGFibGUnIDogZG9jLnN5bmNTdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpO1xuXG4gICAgICAgIGZpbGVMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWRvYy1wYXRoXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZWxlY3REb2N1bWVudChlbC5kYXRhc2V0LmRvY1BhdGgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbXB0eU1zZykgZW1wdHlNc2cuc3R5bGUuZGlzcGxheSA9IGZpbHRlcmVkLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICAvLyBFZGl0b3JcbiAgICBjb25zdCBlZGl0b3JQYW5lbCA9ICQoJ2VkaXRvci1wYW5lbCcpO1xuICAgIGNvbnN0IGVkaXRvckVtcHR5ID0gJCgnZWRpdG9yLWVtcHR5Jyk7XG4gICAgY29uc3Qgc2hvd0VkaXRvciA9IHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gbnVsbCB8fCBzdGF0ZS5pc05ldztcblxuICAgIGlmIChlZGl0b3JQYW5lbCkgZWRpdG9yUGFuZWwuc3R5bGUuZGlzcGxheSA9IHNob3dFZGl0b3IgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmIChlZGl0b3JFbXB0eSkgZWRpdG9yRW1wdHkuc3R5bGUuZGlzcGxheSA9IHNob3dFZGl0b3IgPyAnbm9uZScgOiAnYmxvY2snO1xuXG4gICAgaWYgKHNob3dFZGl0b3IpIHtcbiAgICAgICAgY29uc3QgdGl0bGVJbnB1dCA9ICQoJ2VkaXRvci10aXRsZScpO1xuICAgICAgICBjb25zdCBjb250ZW50QXJlYSA9ICQoJ2VkaXRvci1jb250ZW50Jyk7XG4gICAgICAgIGNvbnN0IHNhdmVCdG4gPSAkKCdzYXZlLWRvYy1idG4nKTtcbiAgICAgICAgY29uc3QgZGVsZXRlQnRuID0gJCgnZGVsZXRlLWRvYy1idG4nKTtcbiAgICAgICAgY29uc3QgZGlydHlMYWJlbCA9ICQoJ2RpcnR5LWxhYmVsJyk7XG5cbiAgICAgICAgaWYgKHRpdGxlSW5wdXQpIHRpdGxlSW5wdXQudmFsdWUgPSBzdGF0ZS5lZGl0b3JUaXRsZTtcbiAgICAgICAgaWYgKGNvbnRlbnRBcmVhKSBjb250ZW50QXJlYS52YWx1ZSA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgIGlmIChzYXZlQnRuKSB7XG4gICAgICAgICAgICBzYXZlQnRuLmRpc2FibGVkID0gc3RhdGUuc2F2aW5nIHx8IHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKS5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICBzYXZlQnRuLnRleHRDb250ZW50ID0gc3RhdGUuc2F2aW5nID8gJ1NhdmluZy4uLicgOiAnU2F2ZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlbGV0ZUJ0bikgZGVsZXRlQnRuLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IG51bGwgJiYgIXN0YXRlLmlzTmV3ID8gJ2lubGluZS1mbGV4JyA6ICdub25lJztcbiAgICAgICAgaWYgKGRpcnR5TGFiZWwpIGRpcnR5TGFiZWwuc3R5bGUuZGlzcGxheSA9IGlzRGlydHkoKSA/ICdpbmxpbmUnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFNlYXJjaFxuICAgIGNvbnN0IHNlYXJjaElucHV0ID0gJCgnc2VhcmNoLWlucHV0Jyk7XG4gICAgaWYgKHNlYXJjaElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHNlYXJjaElucHV0KSB7XG4gICAgICAgIHNlYXJjaElucHV0LnZhbHVlID0gc3RhdGUuc2VhcmNoUXVlcnk7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBuZXdEb2N1bWVudCgpIHtcbiAgICBzdGF0ZS5pc05ldyA9IHRydWU7XG4gICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChwYXRoKTtcbiAgICBpZiAoIWRvYykgcmV0dXJuO1xuICAgIGlmIChkb2MudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICAvLyBPcGVuaW5nIGl0IHdvdWxkIHNob3cgYW4gZW1wdHkgZWRpdG9yIGFuZCB0aGUgbmV4dCBTYXZlIHdvdWxkIHdyaXRlXG4gICAgICAgIC8vIHRoYXQgZW1wdGluZXNzIG92ZXIgdGhlIHN0b3JlZCBjaXBoZXJ0ZXh0LiBSZWZ1c2UsIGFuZCBzYXkgd2h5LlxuICAgICAgICBzaG93VG9hc3QoJ1RoaXMgbm90ZSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlIFx1MjAxNCBsZWZ0IHVudG91Y2hlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBwYXRoO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gZG9jLnBhdGg7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBkb2MuY29udGVudDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50KCkge1xuICAgIGNvbnN0IHRpdGxlID0gc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpO1xuICAgIGlmICghdGl0bGUpIHJldHVybjtcbiAgICBpZiAodGl0bGUgPT09IEFQSV9LRVlTX1BBVEgpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdOb3N0cktleSBrZWVwcyB0aGlzIG5hbWUgZm9yIGl0c2VsZi4gQ2hvb3NlIGFub3RoZXIgdGl0bGUuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ3ZhdWx0LnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBwYXRoOiB0aXRsZSwgY29udGVudDogc3RhdGUuZWRpdG9yQ29udGVudCB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggJiYgc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSB0aXRsZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGRlbGV0ZURvY3VtZW50TG9jYWwoc3RhdGUuc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHRpdGxlLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnU2F2ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHRpdGxlLCBzdGF0ZS5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCAmJiBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgICAgIHNob3dUb2FzdCgnU2F2ZWQgbG9jYWxseSAocmVsYXkgZXJyb3I6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykgKyAnKScpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCksIHN0YXRlLmVkaXRvckNvbnRlbnQsICdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKTtcbiAgICAgICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IHN0YXRlLmVkaXRvclRpdGxlO1xuICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgICAgIHNob3dUb2FzdCgnU2F2ZWQgbG9jYWxseSAob2ZmbGluZSknKTtcbiAgICB9XG5cbiAgICBzdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlRG9jdW1lbnQoKSB7XG4gICAgaWYgKCFzdGF0ZS5zZWxlY3RlZFBhdGgpIHJldHVybjtcbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6IGBEZWxldGUgXCIke3N0YXRlLnNlbGVjdGVkUGF0aH1cIj9gLCBib2R5OiAnVGhlIGRvY3VtZW50IGlzIHJlbW92ZWQgZnJvbSB5b3VyIHZhdWx0IGFuZCwgaWYgcHVibGlzaGVkLCBhIGRlbGV0ZSByZXF1ZXN0IGlzIHNlbnQgdG8geW91ciByZWxheXMuJywgY29uZmlybUxhYmVsOiAnRGVsZXRlIGRvY3VtZW50JywgZGVzdHJ1Y3RpdmU6IHRydWUgfSkpKSByZXR1cm47XG5cbiAgICBjb25zdCBkb2MgPSBhd2FpdCBnZXREb2N1bWVudChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuXG4gICAgaWYgKGRvYz8uZXZlbnRJZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5kZWxldGUnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgcGF0aDogc3RhdGUuc2VsZWN0ZWRQYXRoLCBldmVudElkOiBkb2MuZXZlbnRJZCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgfVxuXG4gICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IG51bGw7XG4gICAgc3RhdGUuaXNOZXcgPSBmYWxzZTtcbiAgICBzdGF0ZS5lZGl0b3JUaXRsZSA9ICcnO1xuICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgIHNob3dUb2FzdCgnRGVsZXRlZCcpO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBoZWxkID0gYXdhaXQgZ2V0VmF1bHRJbmRleCgpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAndmF1bHQuZmV0Y2gnLCBwYXlsb2FkOiB7IHBhdGhzOiBPYmplY3Qua2V5cyhoZWxkKSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBIGRvY3VtZW50IGRlbGV0ZWQgb24gYW5vdGhlciBkZXZpY2UgKGl0cyBvd24gc2lnbmVkIGtpbmQgNSBvbiB0aGVcbiAgICAgICAgLy8gcmVsYXkpIGlzIHJlbW92ZWQgaGVyZSB0b28sIHVubGVzcyB0aGlzIGRldmljZSBoYXMgYW4gdW5zZW50IGVkaXRcbiAgICAgICAgLy8gb3IgaG9sZHMgYSBjb3B5IG5ld2VyIHRoYW4gdGhlIGRlbGV0aW9uLlxuICAgICAgICBmb3IgKGNvbnN0IFtwYXRoLCB0c10gb2YgT2JqZWN0LmVudHJpZXMocmVzdWx0LmRlbGV0ZWQgfHwge30pKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbCA9IGhlbGRbcGF0aF07XG4gICAgICAgICAgICBpZiAoIWxvY2FsIHx8IGxvY2FsLnN5bmNTdGF0dXMgPT09ICdsb2NhbC1vbmx5JykgY29udGludWU7XG4gICAgICAgICAgICBpZiAoKGxvY2FsLnJlbGF5Q3JlYXRlZEF0IHx8IDApID4gdHMpIGNvbnRpbnVlO1xuICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChwYXRoLCB0cyk7XG4gICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoID09PSBwYXRoKSBzdGF0ZS5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9jYWxEb2NzID0gYXdhaXQgZ2V0VmF1bHRJbmRleCgpO1xuICAgICAgICAvLyBBIGRvY3VtZW50IGRlbGV0ZWQgaGVyZSBzdGF5cyBkZWxldGVkOiBkcm9wIGFueSByZWxheSBjb3B5IGRhdGVkIGF0XG4gICAgICAgIC8vIG9yIGJlZm9yZSBpdHMgbG9jYWwgZGVsZXRpb24uXG4gICAgICAgIGNvbnN0IHJlbW90ZUJ5UGF0aCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiByZXN1bHQuZG9jdW1lbnRzKSByZW1vdGVCeVBhdGhbZG9jLnBhdGhdID0gZG9jO1xuICAgICAgICBjb25zdCB7IG1lcmdlZDogcmVtb3RlRG9jcyB9ID0gbWVyZ2VSZW1vdGUoe30sIHJlbW90ZUJ5UGF0aCwgYXdhaXQgZ2V0RGVsZXRlZERvY3MoKSwge1xuICAgICAgICAgICAgdGltZU9mOiAoZCkgPT4gZC5jcmVhdGVkQXQgfHwgMCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChjb25zdCByZW1vdGUgb2YgT2JqZWN0LnZhbHVlcyhyZW1vdGVEb2NzKSkge1xuICAgICAgICAgICAgY29uc3QgbG9jYWwgPSBsb2NhbERvY3NbcmVtb3RlLnBhdGhdO1xuXG4gICAgICAgICAgICBpZiAoIWxvY2FsKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwocmVtb3RlLnBhdGgsIHJlbW90ZS5jb250ZW50LCAnc3luY2VkJywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5zeW5jU3RhdHVzID09PSAnbG9jYWwtb25seScpIHtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwuY29udGVudCAhPT0gcmVtb3RlLmNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3luY1N0YXR1cyhyZW1vdGUucGF0aCwgJ2NvbmZsaWN0JywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWxvY2FsLnJlbGF5Q3JlYXRlZEF0IHx8IHJlbW90ZS5jcmVhdGVkQXQgPiBsb2NhbC5yZWxheUNyZWF0ZWRBdCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHJlbW90ZS5wYXRoLCByZW1vdGUuY29udGVudCwgJ3N5bmNlZCcsIHJlbW90ZS5ldmVudElkLCByZW1vdGUuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoID09PSByZW1vdGUucGF0aCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gcmVtb3RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHJlbW90ZS5jb250ZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdpZGxlJztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICBzdGF0ZS5zeW5jRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAkKCduZXctZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG5ld0RvY3VtZW50KTtcbiAgICAkKCdzeW5jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHN5bmNBbGwpO1xuICAgICQoJ3NhdmUtZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVEb2N1bWVudCk7XG4gICAgJCgnZGVsZXRlLWRvYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWxldGVEb2N1bWVudCk7XG5cbiAgICAkKCdzZWFyY2gtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5zZWFyY2hRdWVyeSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ2VkaXRvci10aXRsZScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmVkaXRvclRpdGxlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnZWRpdG9yLWNvbnRlbnQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIC8vIEdhdGU6IHJlcXVpcmUgbWFzdGVyIHBhc3N3b3JkIGJlZm9yZSBhbGxvd2luZyB2YXVsdCBhY2Nlc3NcbiAgICBjb25zdCBpc0VuY3J5cHRlZCA9IGF3YWl0IGFza0dhdGUoJ2lzRW5jcnlwdGVkJyk7XG4gICAgY29uc3QgZ2F0ZSA9ICQoJ3ZhdWx0LWxvY2tlZC1nYXRlJyk7XG4gICAgY29uc3QgbWFpbiA9ICQoJ3ZhdWx0LW1haW4tY29udGVudCcpO1xuXG4gICAgaWYgKCFpc0VuY3J5cHRlZCkge1xuICAgICAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgJCgnZ2F0ZS1zZWN1cml0eS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBhcGkucnVudGltZS5nZXRVUkwoJ3NlY3VyaXR5L3NlY3VyaXR5Lmh0bWwnKTtcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ25vc3Rya2V5LW9wdGlvbnMnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVsYXlzID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZ2V0UmVsYXlzJyB9KTtcbiAgICAgICAgc3RhdGUucmVsYXlJbmZvID0gcmVsYXlzIHx8IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbdmF1bHRdIEZhaWxlZCB0byBsb2FkIHJlbGF5czonLCBlLm1lc3NhZ2UpO1xuICAgICAgICBzdGF0ZS5yZWxheUluZm8gPSB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbdmF1bHRdIEZhaWxlZCB0byBsb2FkIGRvY3VtZW50czonLCBlLm1lc3NhZ2UpO1xuICAgICAgICBzdGF0ZS5kb2N1bWVudHMgPSBbXTtcbiAgICB9XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBpZiAoaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHN5bmNBbGwoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdmF1bHRdIFN5bmMgZmFpbGVkOicsIGUubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiBzdGFydFBhZ2UoaW5pdCkpO1xuIiwgIi8qKlxuICogVGhlIHF1ZXN0aW9ucyBhIHBhZ2UgYXNrcyB0aGUgd29ya2VyIGJlZm9yZSBpdCBjYW4gZHJhdyBhbnl0aGluZy4gVGhlIHdvcmtlclxuICogY2FuIGFuc3dlciB0aGVtIHdpdGggYSByZWZ1c2FsIG9iamVjdCwgYW5kIGFuIG9iamVjdCBpcyB0cnV0aHksIHNvIGEgcGFnZSB0aGF0XG4gKiByZWFkcyBpdCBhcyBhIHllcyBzaG93cyB0aGUgd3Jvbmcgc2NyZWVuLiBQYWdlcyBhc2sgdGhyb3VnaCBhc2tHYXRlIGluc3RlYWQ6XG4gKiBhIHJlZnVzYWwgcmVwbGFjZXMgdGhlIHBhZ2Ugd2l0aCBhIHBsYWluIG1lc3NhZ2UgYW5kIHN0b3BzIGl0cyBzdGFydC11cC5cbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5leHBvcnQgY29uc3QgU1RBUlRfRVJST1IgPSAnTm9zdHJLZXkgY291bGQgbm90IHN0YXJ0IHRoaXMgcGFnZS4gUmVsb2FkIG9yIHJlaW5zdGFsbC4nO1xuXG5leHBvcnQgY2xhc3MgR2F0ZVJlZnVzZWQgZXh0ZW5kcyBFcnJvciB7fVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZ1c2VkKGFuc3dlcikge1xuICAgIHJldHVybiAhIWFuc3dlciAmJiB0eXBlb2YgYW5zd2VyID09PSAnb2JqZWN0JyAmJiBhbnN3ZXIuc3VjY2VzcyA9PT0gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93U3RhcnRFcnJvcigpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2FsZXJ0Jyk7XG4gICAgbWVzc2FnZS5kYXRhc2V0LnN0YXJ0RXJyb3IgPSAnJztcbiAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gU1RBUlRfRVJST1I7XG4gICAgbWVzc2FnZS5zdHlsZS5wYWRkaW5nID0gJzE2cHgnO1xuICAgIGRvY3VtZW50LmJvZHkucmVwbGFjZUNoaWxkcmVuKG1lc3NhZ2UpO1xufVxuXG4vKiogQXNrIHRoZSB3b3JrZXIuIE9uIGEgcmVmdXNhbCwgc2hvdyB0aGUgbWVzc2FnZSBhbmQgdGhyb3cgR2F0ZVJlZnVzZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNrR2F0ZShraW5kKSB7XG4gICAgY29uc3QgYW5zd2VyID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kIH0pO1xuICAgIGlmIChpc1JlZnVzZWQoYW5zd2VyKSkge1xuICAgICAgICBzaG93U3RhcnRFcnJvcigpO1xuICAgICAgICB0aHJvdyBuZXcgR2F0ZVJlZnVzZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGFuc3dlcjtcbn1cblxuLy8gQXQgbW9zdCBvbmUgbm90ZSBpbiB0aGlzIHRpbWUsIGhvd2V2ZXIgYnVzeSB0aGUgcGVyc29uIGlzLlxuY29uc3QgQUNUSVZJVFlfTk9URV9NUyA9IDMwXzAwMDtcblxuLyoqXG4gKiBVc2luZyBvbmUgb2YgTm9zdHJLZXkncyBvd24gcGFnZXMgY291bnRzIGFzIGFjdGl2aXR5IGZvciBhdXRvLWxvY2ssIGFzIGRvZXNcbiAqIGFuc3dlcmluZyBhIHJlcXVlc3Qgb3IgYSBzaXRlIHNpZ25pbmcgZnJvbSBhIHJlbWVtYmVyZWQgZ3JhbnQuXG4gKi9cbmZ1bmN0aW9uIHdhdGNoQWN0aXZpdHkoKSB7XG4gICAgbGV0IGxhc3ROb3RlID0gMDtcbiAgICBjb25zdCBub3RlID0gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGxhc3ROb3RlIDwgQUNUSVZJVFlfTk9URV9NUykgcmV0dXJuO1xuICAgICAgICBsYXN0Tm90ZSA9IERhdGUubm93KCk7XG4gICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Jlc2V0QXV0b0xvY2snIH0pPy5jYXRjaD8uKCgpID0+IHt9KTtcbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgbm90ZSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBub3RlLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSk7XG59XG5cbi8qKiBSdW4gYSBwYWdlJ3Mgc3RhcnQtdXAuIEEgcmVmdXNhbCBoYXMgYWxyZWFkeSBiZWVuIHNob3duLCBzbyBpdCBlbmRzIGhlcmUuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRQYWdlKGluaXQpIHtcbiAgICB3YXRjaEFjdGl2aXR5KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaW5pdCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEdhdGVSZWZ1c2VkKSkgdGhyb3cgZTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBpbnMtY29uZmlybS5qcyBcdTIwMTQgdGhlIHNoYXJlZCBjb25zZW50IG92ZXJsYXkgZm9yIGV4dGVuc2lvbiBwYWdlcy5cbiAqXG4gKiBPbmUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGNvbnNlbnQtc3VyZmFjZSBzdGFuZGFyZDogYSBkaW1tZWQgYmFja2Ryb3AgcGx1c1xuICogZWl0aGVyIGEgYm90dG9tIFNIRUVUIChkZWZhdWx0OyBkZXN0cnVjdGl2ZSAvIGlycmV2ZXJzaWJsZSBhY3RzKSBvciBhXG4gKiBjZW50ZXJlZCBQT1BPVkVSIChsb3ctc3Rha2VzLCByZXZlcnNpYmxlIGFjdHMpLiBSZXBsYWNlcyBuYXRpdmVcbiAqIGNvbmZpcm0oKS9hbGVydCgpIG9uIGV2ZXJ5IGV4dGVuc2lvbi1wYWdlIHN1cmZhY2UuXG4gKlxuICogICBpbnNDb25maXJtKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50IH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTxib29sZWFuPiAgICh0cnVlID0gY29uZmlybWVkOyBFc2NhcGUvYmFja2Ryb3AvY2FuY2VsID0gZmFsc2UpXG4gKiAgIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPHZvaWQ+XG4gKlxuICogU3R5bGluZyBjb21lcyBlbnRpcmVseSBmcm9tIGluc3RydW1lbnQuY3NzIChzZWN0aW9uIDE4ICsgdGhlIC5idG4gZmFtaWx5KSxcbiAqIHNvIHNraW4gLyBtb2RlIC8gY29udHJhc3QgLyBkZW5zaXR5IC8gdGV4dC1zaXplIGFycml2ZSB2aWEgdGhlIHBhZ2Unc1xuICogc3RhbXBlZCBkYXRhLWlucy0qIGF0dHJpYnV0ZXMgXHUyMDE0IG5vIHN0b3JhZ2UgYWNjZXNzLCBubyBtZXNzYWdpbmcgaGVyZS5cbiAqXG4gKiBTYWZldHk6IHRpdGxlL2JvZHkgbWF5IGNvbnRhaW4gdXNlciBkYXRhIChrZXkgbGFiZWxzLCB2YXVsdCBwYXRocyk7IHRoZSBET01cbiAqIGlzIGJ1aWx0IHdpdGggY3JlYXRlRWxlbWVudCArIHRleHRDb250ZW50IE9OTFkgXHUyMDE0IG5ldmVyIGlubmVySFRNTC5cbiAqL1xuXG4vLyBTZXJpYWxpemUgb3ZlcmxhcHBpbmcgY2FsbHMgc28gYSBzZWNvbmQgZGlhbG9nIG5ldmVyIGRvdWJsZS1yZW5kZXJzIG9uIHRvcFxuLy8gb2YgKG9yIGludGVybGVhdmVzIHdpdGgpIGFuIG9wZW4gb25lLlxubGV0IHF1ZXVlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbmxldCBpZENvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBtb3Rpb25PZmYoKSB7XG4gICAgaWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5zLW1vdGlvbicpID09PSAnb2ZmJykgcmV0dXJuIHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKScpLm1hdGNoZXM7XG4gICAgfSBjYXRjaCAoXykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEJ1aWxkLCBzaG93IGFuZCBzZXR0bGUgb25lIGRpYWxvZy4gUmVzb2x2ZXMgdHJ1ZSAoY29uZmlybSkgb3IgZmFsc2VcbiAqIChjYW5jZWwgLyBFc2NhcGUgLyBiYWNrZHJvcCBjbGljaykuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZSB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICByb290LmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1yb290JztcblxuICAgICAgICBjb25zdCBiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBiYWNrZHJvcC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYmFja2Ryb3AnO1xuXG4gICAgICAgIGNvbnN0IGlzU2hlZXQgPSB2YXJpYW50ICE9PSAncG9wb3Zlcic7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaWFsb2cuY2xhc3NOYW1lID0gaXNTaGVldCA/ICdpbnMtY29uc2VudC1zaGVldCcgOiAnaW5zLWNvbnNlbnQtcG9wb3Zlcic7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAoZGVzdHJ1Y3RpdmUgfHwgbm90aWNlKSA/ICdhbGVydGRpYWxvZycgOiAnZGlhbG9nJyk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuXG4gICAgICAgIGlmIChpc1NoZWV0KSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGhhbmRsZS5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtaGFuZGxlJztcbiAgICAgICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChoYW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdWlkID0gKytpZENvdW50ZXI7XG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICB0aXRsZUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC10aXRsZSc7XG4gICAgICAgIHRpdGxlRWwuaWQgPSBgaW5zLWNvbnNlbnQtdGl0bGUtJHt1aWR9YDtcbiAgICAgICAgdGl0bGVFbC50ZXh0Q29udGVudCA9IHRpdGxlIHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWxsZWRieScsIHRpdGxlRWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGJvZHlFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgYm9keUVsLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1ib2R5JztcbiAgICAgICAgYm9keUVsLmlkID0gYGlucy1jb25zZW50LWJvZHktJHt1aWR9YDtcbiAgICAgICAgYm9keUVsLnRleHRDb250ZW50ID0gYm9keSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGJvZHlFbCk7XG4gICAgICAgIGRpYWxvZy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCBib2R5RWwuaWQpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYWN0aW9ucy5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYWN0aW9ucyc7XG5cbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IFtdO1xuICAgICAgICBsZXQgY2FuY2VsQnRuID0gbnVsbDtcbiAgICAgICAgY29uc3QgY29uZmlybUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBjb25maXJtQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgY29uZmlybUJ0bi50ZXh0Q29udGVudCA9IGNvbmZpcm1MYWJlbDtcbiAgICAgICAgaWYgKG5vdGljZSkge1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSAnYnRuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbmNlbEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi5jbGFzc05hbWUgPSAnYnRuIGJ0bi0tZ2hvc3QnO1xuICAgICAgICAgICAgY2FuY2VsQnRuLnRleHRDb250ZW50ID0gY2FuY2VsTGFiZWw7XG4gICAgICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gZGVzdHJ1Y3RpdmUgPyAnYnRuIGJ0bi0tZGVzdHJ1Y3RpdmUnIDogJ2J0biBidG4tLXByaW1hcnknO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY29uZmlybUJ0bik7XG4gICAgICAgIGJ1dHRvbnMucHVzaChjb25maXJtQnRuKTtcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGFjdGlvbnMpO1xuXG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoYmFja2Ryb3ApO1xuICAgICAgICByb290LmFwcGVuZENoaWxkKGRpYWxvZyk7XG5cbiAgICAgICAgbGV0IHNldHRsZWQgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gc2V0dGxlKHJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKHNldHRsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHNldHRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgY29uc3QgZmluaXNoID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJvb3QucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZGb2N1cyAmJiB0eXBlb2YgcHJldkZvY3VzLmZvY3VzID09PSAnZnVuY3Rpb24nICYmIGRvY3VtZW50LmNvbnRhaW5zKHByZXZGb2N1cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZGb2N1cy5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoXykgeyAvKiBmb2N1cyByZXN0b3JlIGlzIGJlc3QtZWZmb3J0ICovIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG1vdGlvbk9mZigpKSBmaW5pc2goKTtcbiAgICAgICAgICAgIGVsc2Ugc2V0VGltZW91dChmaW5pc2gsIDI1MCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbktleWRvd24oZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzZXR0bGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldi5rZXkgPT09ICdUYWInKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJhcCBmb2N1cyBhY3Jvc3MgdGhlIGRpYWxvZydzIGJ1dHRvbnMgb25seS5cbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IGJ1dHRvbnMuaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXIgPSBldi5zaGlmdEtleSA/IC0xIDogMTtcbiAgICAgICAgICAgICAgICBidXR0b25zWyhpZHggKyBkaXIgKyBidXR0b25zLmxlbmd0aCkgJSBidXR0b25zLmxlbmd0aF0uZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJhY2tkcm9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGlmIChjYW5jZWxCdG4pIGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKHRydWUpKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93biwgdHJ1ZSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyb290KTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICAvLyBEZXN0cnVjdGl2ZSBhY3RzIHN0YXJ0IG9uIENhbmNlbCBzbyBFbnRlciBjYW4ndCBydXNoIHRoZSBkZWxldGU7XG4gICAgICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2Ugc3RhcnRzIG9uIHRoZSBjb25maXJtaW5nIGFjdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGluaXRpYWwgPSBub3RpY2UgPyBjb25maXJtQnRuIDogKGRlc3RydWN0aXZlID8gY2FuY2VsQnRuIDogY29uZmlybUJ0bik7XG4gICAgICAgICAgICAoaW5pdGlhbCB8fCBjb25maXJtQnRuKS5mb2N1cygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc0NvbmZpcm0oe1xuICAgIHRpdGxlLFxuICAgIGJvZHksXG4gICAgY29uZmlybUxhYmVsID0gJ0NvbmZpcm0nLFxuICAgIGNhbmNlbExhYmVsID0gJ0NhbmNlbCcsXG4gICAgZGVzdHJ1Y3RpdmUgPSBmYWxzZSxcbiAgICB2YXJpYW50ID0gJ3NoZWV0Jyxcbn0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlOiBmYWxzZSB9KSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsID0gJ09LJyB9ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgY29uZmlybUxhYmVsOiBkaXNtaXNzTGFiZWwsXG4gICAgICAgICAgICBjYW5jZWxMYWJlbDogJycsXG4gICAgICAgICAgICBkZXN0cnVjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICB2YXJpYW50OiAnc2hlZXQnLFxuICAgICAgICAgICAgbm90aWNlOiB0cnVlLFxuICAgICAgICB9KS50aGVuKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIiwgIi8qKlxuICogTklQLTc4IEVuY3J5cHRlZCBWYXVsdCBQcm90b2NvbFxuICpcbiAqIFB1cmUgZnVuY3Rpb25zIGZvciBidWlsZGluZy9wYXJzaW5nIGtpbmQgMzAwNzggKHBhcmFtZXRlcml6ZWQgcmVwbGFjZWFibGUpXG4gKiBldmVudHMgdXNlZCBhcyBhbiBlbmNyeXB0ZWQgbWFya2Rvd24gZG9jdW1lbnQgdmF1bHQuXG4gKlxuICogZC10YWcgcHJlZml4IFwibm9zdHJrZXk6XCIgbmFtZXNwYWNlcyBvdXIgdmF1bHQgaXRlbXMgZnJvbSBvdGhlciBOSVAtNzggYXBwcy5cbiAqIFJlbGF5cyBzZWUgZmlsZSBwYXRocyBidXQgbm90IGNvbnRlbnQgKE5JUC00NCBlbmNyeXB0ZWQgdG8gc2VsZikuXG4gKi9cblxuY29uc3QgS0lORF9BUFBfREFUQSA9IDMwMDc4O1xuY29uc3QgS0lORF9ERUxFVElPTiA9IDU7XG5jb25zdCBEVEFHX1BSRUZJWCA9ICdub3N0cmtleTonO1xuY29uc3QgQ0xJRU5UX1RBRyA9ICdub3N0cmtleSc7XG5cbi8qKiBUaGUgcGF0aCB0aGUgQVBJIGtleSBzdG9yZSB1c2VzLiBJdCBpcyBuZXZlciBhIHZhdWx0IGRvY3VtZW50LiAqL1xuZXhwb3J0IGNvbnN0IEFQSV9LRVlTX1BBVEggPSAndmF1bHQvYXBpLWtleXMnO1xuXG4vKipcbiAqIEJ1aWxkIGFuIHVuc2lnbmVkIGtpbmQgMzAwNzggdmF1bHQgZXZlbnQuXG4gKiBDYWxsZXIgbXVzdCBzaWduIChmaW5hbGl6ZUV2ZW50IG9yIGJ1bmtlciBzZXNzaW9uLnNpZ25FdmVudCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBEb2N1bWVudCBwYXRoIChlLmcuIFwibm90ZXMvdG9kby5tZFwiKVxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZENvbnRlbnQgLSBOSVAtNDQgZW5jcnlwdGVkIGNvbnRlbnQgc3RyaW5nXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBVbnNpZ25lZCBldmVudCB0ZW1wbGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRWYXVsdEV2ZW50KHBhdGgsIGVuY3J5cHRlZENvbnRlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBraW5kOiBLSU5EX0FQUF9EQVRBLFxuICAgICAgICBjb250ZW50OiBlbmNyeXB0ZWRDb250ZW50LFxuICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICBbJ2QnLCBgJHtEVEFHX1BSRUZJWH0ke3BhdGh9YF0sXG4gICAgICAgICAgICBbJ2NsaWVudCcsIENMSUVOVF9UQUddLFxuICAgICAgICBdLFxuICAgICAgICBjcmVhdGVkX2F0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICB9O1xufVxuXG4vKipcbiAqIEJ1aWxkIGFuIHVuc2lnbmVkIGtpbmQgNSBkZWxldGlvbiBldmVudCAoTklQLTA5KSBmb3IgYSB2YXVsdCBkb2N1bWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRJZCAtIFRoZSBldmVudCBpZCB0byBkZWxldGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gRG9jdW1lbnQgcGF0aCAoZm9yIHRoZSBhLXRhZyByZWZlcmVuY2UpXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVia2V5IC0gQXV0aG9yIGhleCBwdWJrZXkgKHBhcnQgb2YgdGhlIE5JUC0wOSBhLXRhZyBhZGRyZXNzKVxuICogQHJldHVybnMge29iamVjdH0gVW5zaWduZWQgZGVsZXRpb24gZXZlbnQgdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmF1bHREZWxldGlvbihldmVudElkLCBwYXRoLCBwdWJrZXkpIHtcbiAgICBpZiAodHlwZW9mIHB1YmtleSAhPT0gJ3N0cmluZycgfHwgIS9eWzAtOWEtZl17NjR9JC8udGVzdChwdWJrZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYnVpbGRWYXVsdERlbGV0aW9uIHJlcXVpcmVzIHRoZSBhdXRob3IgcHVia2V5Jyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGtpbmQ6IEtJTkRfREVMRVRJT04sXG4gICAgICAgIGNvbnRlbnQ6ICd2YXVsdCBkb2N1bWVudCBkZWxldGVkJyxcbiAgICAgICAgdGFnczogW1xuICAgICAgICAgICAgWydlJywgZXZlbnRJZF0sXG4gICAgICAgICAgICBbJ2EnLCBgJHtLSU5EX0FQUF9EQVRBfToke3B1YmtleX06JHtEVEFHX1BSRUZJWH0ke3BhdGh9YF0sXG4gICAgICAgIF0sXG4gICAgICAgIGNyZWF0ZWRfYXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxuICAgIH07XG59XG5cbi8qKlxuICogQnVpbGQgYSBSRVEgZmlsdGVyIGZvciBmZXRjaGluZyBhbGwgdmF1bHQgZG9jdW1lbnRzIGZvciBhIHB1YmtleS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVia2V5IC0gSGV4IHB1YmxpYyBrZXlcbiAqIEByZXR1cm5zIHtvYmplY3R9IE5vc3RyIFJFUSBmaWx0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmF1bHRGaWx0ZXIocHVia2V5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2luZHM6IFtLSU5EX0FQUF9EQVRBXSxcbiAgICAgICAgYXV0aG9yczogW3B1YmtleV0sXG4gICAgfTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIGtpbmQgMzAwNzggZXZlbnQgaW50byBhIHZhdWx0IGRvY3VtZW50IGRlc2NyaXB0b3IuXG4gKiBSZXR1cm5zIG51bGwgaWYgdGhlIGV2ZW50IGlzIG5vdCBhIG5vc3Rya2V5IHZhdWx0IGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudCAtIE5vc3RyIGV2ZW50XG4gKiBAcmV0dXJucyB7eyBwYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZywgY3JlYXRlZEF0OiBudW1iZXIsIGV2ZW50SWQ6IHN0cmluZyB9IHwgbnVsbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVmF1bHRFdmVudChldmVudCkge1xuICAgIGlmIChldmVudC5raW5kICE9PSBLSU5EX0FQUF9EQVRBKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRUYWcgPSBldmVudC50YWdzPy5maW5kKHQgPT4gdFswXSA9PT0gJ2QnKTtcbiAgICBpZiAoIWRUYWcgfHwgIWRUYWdbMV0/LnN0YXJ0c1dpdGgoRFRBR19QUkVGSVgpKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IHBhdGggPSBkVGFnWzFdLnNsaWNlKERUQUdfUFJFRklYLmxlbmd0aCk7XG4gICAgaWYgKCFwYXRoKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHBhdGgsXG4gICAgICAgIGNvbnRlbnQ6IGV2ZW50LmNvbnRlbnQsXG4gICAgICAgIGNyZWF0ZWRBdDogZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgICAgZXZlbnRJZDogZXZlbnQuaWQsXG4gICAgfTtcbn1cblxuLyoqIFRoZSBkLXRhZyBhIHZhdWx0IHBhdGggaXMgc3RvcmVkIHVuZGVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhdWx0RHRhZyhwYXRoKSB7XG4gICAgcmV0dXJuIGAke0RUQUdfUFJFRklYfSR7cGF0aH1gO1xufVxuIiwgIi8qKlxuICogVmF1bHQgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgdmF1bHQgZG9jdW1lbnRzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICB2YXVsdERvY3M6IHtcbiAqICAgICBcInBhdGgvdG8vZmlsZS5tZFwiOiB7XG4gKiAgICAgICBwYXRoLCBjb250ZW50LCB1cGRhdGVkQXQsIHN5bmNTdGF0dXMsIGV2ZW50SWQsIHJlbGF5Q3JlYXRlZEF0LFxuICogICAgICAgcHJvZmlsZVNjb3BlXG4gKiAgICAgfVxuICogICB9XG4gKlxuICogc3luY1N0YXR1czogXCJzeW5jZWRcIiB8IFwibG9jYWwtb25seVwiIHwgXCJjb25mbGljdFwiXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuaW1wb3J0IHsgQVBJX0tFWVNfUEFUSCB9IGZyb20gJy4vbmlwNzgnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICd2YXVsdERvY3MnO1xuLy8gRGVsZXRpb24gdG9tYnN0b25lcyBrZXllZCBieSBwYXRoIChpc3N1ZSAjMyk6IHsgPHBhdGg+OiBkZWxldGVkQXRTZWNvbmRzIH0uXG5jb25zdCBERUxFVEVEX0tFWSA9ICdkZWxldGVkRG9jcyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWxldGVkRG9jcygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbREVMRVRFRF9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtERUxFVEVEX0tFWV0gJiYgdHlwZW9mIGRhdGFbREVMRVRFRF9LRVldID09PSAnb2JqZWN0JyA/IGRhdGFbREVMRVRFRF9LRVldIDoge307XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERvY3MoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW1NUT1JBR0VfS0VZXToge30gfSk7XG4gICAgcmV0dXJuIGRhdGFbU1RPUkFHRV9LRVldIHx8IHt9O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkb2N1bWVudCdzIGBjb250ZW50YCBmb3IgY2FsbGVycy4gUmUtdGhyb3dzIGxvY2sgZXJyb3JzIHNvIGEgbG9ja2VkXG4gKiBzZXNzaW9uIGNhbm5vdCByZWFkIG5vdGVzIChGNikuXG4gKlxuICogQSBnZW51aW5lIGRlY3J5cHQgZmFpbHVyZSAoZS5nLiBhIHZhbHVlIHN5bmNlZCBmcm9tIGFub3RoZXIgZGV2aWNlLCBvciBhIGJsb2JcbiAqIHdob3NlIHdyYXBwaW5nIGtleSByb3RhdGVkIGF3YXkpIGlzIHJlcG9ydGVkIGFzIGB1bmRlY3J5cHRhYmxlOiB0cnVlYCB3aXRoXG4gKiBgY29udGVudDogbnVsbGAgXHUyMDE0IE5PVCBhcyBhbiBlbXB0eSBzdHJpbmcuIEVtcHR5IGNvbnRlbnQgaXMgaW5kaXN0aW5ndWlzaGFibGVcbiAqIGZyb20gYSByZWFsIGVtcHR5IG5vdGU6IHRoZSBlZGl0b3Igb3BlbmVkIGl0IGJsYW5rLCBhbmQgdGhlIG5leHQgU2F2ZSB3cm90ZVxuICogdGhhdCBibGFuayBvdmVyIHRoZSB1c2VyJ3Mgb25seSBjb3B5LiBgbnVsbGAgKyB0aGUgZmxhZyBsZXRzIGNhbGxlcnMgcmVmdXNlXG4gKiB0byBvcGVuIG9yIG92ZXJ3cml0ZSBpdCwgYW5kIGxlYXZlcyB0aGUgY2lwaGVydGV4dCBhdCByZXN0IHVudG91Y2hlZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERvYyhkb2MpIHtcbiAgICBpZiAoIWRvYykgcmV0dXJuIGRvYztcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyAuLi5kb2MsIGNvbnRlbnQ6IGF3YWl0IHVud3JhcFNlY3JldChkb2MuY29udGVudCkgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChTdHJpbmcoZS5tZXNzYWdlIHx8ICcnKS5zdGFydHNXaXRoKCdsb2NrZWQnKSkgdGhyb3cgZTtcbiAgICAgICAgcmV0dXJuIHsgLi4uZG9jLCBjb250ZW50OiBudWxsLCB1bmRlY3J5cHRhYmxlOiB0cnVlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZXREb2NzKGRvY3MpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IGRvY3MgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCB2YXVsdCBkb2NzIG9iamVjdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IE1hcCBvZiBwYXRoIC0+IGRvY1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmF1bHRJbmRleCgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGNvbnN0IG91dCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3BhdGgsIGRvY10gb2YgT2JqZWN0LmVudHJpZXMoZG9jcykpIHtcbiAgICAgICAgb3V0W3BhdGhdID0gYXdhaXQgZGVjcnlwdERvYyhkb2MpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBkb2N1bWVudCBieSBwYXRoIChjb250ZW50IGRlY3J5cHRlZCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fG51bGw+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RG9jdW1lbnQocGF0aCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgcmV0dXJuIGRvY3NbcGF0aF0gPyBkZWNyeXB0RG9jKGRvY3NbcGF0aF0pIDogbnVsbDtcbn1cblxuLyoqXG4gKiBTYXZlIG9yIHVwZGF0ZSBhIGRvY3VtZW50IGluIHRoZSBsb2NhbCBjYWNoZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVEb2N1bWVudExvY2FsKHBhdGgsIGNvbnRlbnQsIHN5bmNTdGF0dXMsIGV2ZW50SWQgPSBudWxsLCByZWxheUNyZWF0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gZG9jc1twYXRoXTtcbiAgICBkb2NzW3BhdGhdID0ge1xuICAgICAgICBwYXRoLFxuICAgICAgICBjb250ZW50OiBhd2FpdCB3cmFwU2VjcmV0KGNvbnRlbnQpLCAvLyBUMC00OiBlbmNyeXB0IG5vdGUgYm9keSBhdCByZXN0XG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgICAgIHN5bmNTdGF0dXMsXG4gICAgICAgIGV2ZW50SWQsXG4gICAgICAgIHJlbGF5Q3JlYXRlZEF0LFxuICAgICAgICBwcm9maWxlU2NvcGU6IGV4aXN0aW5nPy5wcm9maWxlU2NvcGUgPz8gbnVsbCxcbiAgICB9O1xuICAgIC8vIFJlY3JlYXRlIGNsZWFycyBhbnkgdG9tYnN0b25lIGZvciB0aGlzIHBhdGggKGlzc3VlICMzKSwgc28gdGhlIGZyZXNobHlcbiAgICAvLyBzYXZlZCBkb2MgaXMgbm8gbG9uZ2VyIHN1cHByZXNzZWQgZnJvbSB0aGUgc3luYyBwYXlsb2FkLlxuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkRG9jcygpO1xuICAgIGlmIChkZWxldGVkW3BhdGhdICE9IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIGRlbGV0ZWRbcGF0aF07XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcywgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IGRvY3MgfSk7XG4gICAgfVxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICByZXR1cm4gZGVjcnlwdERvYyhkb2NzW3BhdGhdKTtcbn1cblxuLyoqXG4gKiBEZWxldGUgYSBkb2N1bWVudCBmcm9tIHRoZSBsb2NhbCBjYWNoZSBhbmQgcmVjb3JkIGEgdG9tYnN0b25lIChpc3N1ZSAjMykgc29cbiAqIHRoZSBkZWxldGlvbiBwcm9wYWdhdGVzIHRocm91Z2ggc3RvcmFnZS5zeW5jIGFuZCBhIHN0YWxlIGNvcHkgb24gYW5vdGhlclxuICogZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgaXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVEb2N1bWVudExvY2FsKHBhdGgsIGRlbGV0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGRlbGV0ZSBkb2NzW3BhdGhdO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkRG9jcygpO1xuICAgIGNvbnN0IGF0ID0gTnVtYmVyLmlzRmluaXRlKGRlbGV0ZWRBdCkgPyBkZWxldGVkQXQgOiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgICBpZiAoZGVsZXRlZFtwYXRoXSA9PSBudWxsIHx8IGF0ID4gZGVsZXRlZFtwYXRoXSkgZGVsZXRlZFtwYXRoXSA9IGF0O1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcywgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgZG9jdW1lbnRzIHNvcnRlZCBieSB1cGRhdGVkQXQgZGVzY2VuZGluZy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gU29ydGVkIGFycmF5IG9mIGRvYyBtZXRhZGF0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdERvY3VtZW50cygpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGNvbnN0IGRlY3J5cHRlZCA9IFtdO1xuICAgIGZvciAoY29uc3QgZG9jIG9mIE9iamVjdC52YWx1ZXMoZG9jcykpIHtcbiAgICAgICAgaWYgKGRvYz8ucGF0aCA9PT0gQVBJX0tFWVNfUEFUSCkgY29udGludWU7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHREb2MoZG9jKSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT4gYi51cGRhdGVkQXQgLSBhLnVwZGF0ZWRBdCk7XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzeW5jIHN0YXR1cyAoYW5kIG9wdGlvbmFsbHkgZXZlbnRJZC9yZWxheUNyZWF0ZWRBdCkgZm9yIGEgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTeW5jU3RhdHVzKHBhdGgsIHN0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgaWYgKCFkb2NzW3BhdGhdKSByZXR1cm4gbnVsbDtcbiAgICBkb2NzW3BhdGhdLnN5bmNTdGF0dXMgPSBzdGF0dXM7XG4gICAgaWYgKGV2ZW50SWQgIT09IG51bGwpIGRvY3NbcGF0aF0uZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBkb2NzW3BhdGhdLnJlbGF5Q3JlYXRlZEF0ID0gcmVsYXlDcmVhdGVkQXQ7XG4gICAgYXdhaXQgc2V0RG9jcyhkb2NzKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXTtcbn1cbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBtZXJnZVJlbW90ZSB9IGZyb20gJy4vc3luYy1tZXJnZSc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNDaXBoZXJ0ZXh0LCBpc1Bhc3N3b3JkQmxvYiB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcbmltcG9ydCB7IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcywgcmVkYWN0UHJvZmlsZXMgfSBmcm9tICcuL2J1bmtlci11cmwuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIC8vIFRvbWJzdG9uZXMgKGRlbGV0aW9uIHJlY29yZHMpIGdldCB0aGUgZ3VhcmFudGVlZCB0b3Agc2xvdDogYSBkZWxldGlvbiBtdXN0XG4gICAgLy8gbmV2ZXIgbG9zZSBpdHMgYnVkZ2V0IHJhY2UgdG8gYnVsa3kgdmF1bHQgY29udGVudCwgb3IgdGhlIGRlbGV0ZWQgaXRlbVxuICAgIC8vIHJlc3VycmVjdHMgb24gdGhlIG5leHQgZGV2aWNlIHRoYXQgc3RpbGwgaGFzIGEgc3RhbGUgY29weSAoaXNzdWUgIzMpLlxuICAgIFAwX1RPTUJTVE9ORVM6IDAsXG4gICAgUDFfUFJPRklMRVM6IDEsXG4gICAgUDJfU0VUVElOR1M6IDIsXG4gICAgUDNfQVBJS0VZUzogMyxcbiAgICBQNF9WQVVMVDogNCxcbn07XG5cbi8vIFdhcm5pbmcgdGhyZXNob2xkcyBmb3IgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeSAodG9tYnN0b25lcyBhcmUga2VwdFxuLy8gZm9yZXZlciBzbyBhbiBvZmZsaW5lIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgYWJvdXQgYSBkZWxldGlvbiBjYW5ub3Rcbi8vIHJlc3VycmVjdCB0aGUgaXRlbSBcdTIwMTQgdGhlIGNvdW50IG9ubHkgZ3Jvd3MsIHNvIG51ZGdlIHRoZSB1c2VyIHRvIHRyaW0gaXQpLlxuY29uc3QgVE9NQlNUT05FX1dBUk5fR0VOVExFID0gODtcbmNvbnN0IFRPTUJTVE9ORV9XQVJOX1NUUk9ORyA9IDE2O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVmVyc2lvbiBjb21wYXJpc29uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBkb3R0ZWQgdmVyc2lvbiBzdHJpbmdzIG51bWVyaWNhbGx5LlxuICogUmV0dXJucyAxIGlmIGEgPiBiLCAtMSBpZiBhIDwgYiwgMCBpZiBlcXVhbC4gTWlzc2luZyAvIG5vbi1udW1lcmljXG4gKiBjb21wb25lbnRzIGFyZSB0cmVhdGVkIGFzIDAgc28gJzEuMTAuMCcgY29ycmVjdGx5IHNvcnRzIGFib3ZlICcxLjkuMCdcbiAqIChhIHBsYWluIHN0cmluZyBjb21wYXJlIHdvdWxkIHB1dCAnMS45LjAnIGZpcnN0KS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNlbXZlcihhLCBiKSB7XG4gICAgY29uc3QgcGEgPSBTdHJpbmcoYSkuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBwYiA9IFN0cmluZyhiKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KHBhLmxlbmd0aCwgcGIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHggPSBwYXJzZUludChwYVtpXSwgMTApIHx8IDA7XG4gICAgICAgIGNvbnN0IHkgPSBwYXJzZUludChwYltpXSwgMTApIHx8IDA7XG4gICAgICAgIGlmICh4ID4geSkgcmV0dXJuIDE7XG4gICAgICAgIGlmICh4IDwgeSkgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCBzeW5jIHBheWxvYWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGxvY2FsIGRhdGEgYW5kIGJ1aWxkIGEgcHJpb3JpdGlzZWQgbGlzdCBvZiBlbnRyaWVzIHRvIHN5bmMuXG4gKiBSZXR1cm5zIHsgZW50cmllczogW3sga2V5LCBqc29uU3RyaW5nLCBwcmlvcml0eSwgc2l6ZSB9XSwgdG90YWxTaXplIH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gVDAtNTogYSBzZWNyZXQgaXMgb25seSBldmVyIGVtaXR0ZWQgdG8gc3RvcmFnZS5zeW5jIChHb29nbGUvaUNsb3VkKSBpZiBpdFxuICAgIC8vIGlzIGFscmVhZHkgYW4gZW5jcnlwdGVkIGJsb2IuIEFueSB2YWx1ZSB0aGF0IGlzIE5PVCBjaXBoZXJ0ZXh0IGlzIHJlZnVzZWRcbiAgICAvLyAoZHJvcHBlZCkgc28gcGxhaW50ZXh0IHByaXZhdGUga2V5cyAvIEFQSSBzZWNyZXRzIC8gbm90ZXMgY2FuIG5ldmVyIGxlYXZlXG4gICAgLy8gdGhlIGRldmljZS4gYCcnYCAoZW1wdHkgLyBidW5rZXIpIGlzIGFsbG93ZWQgdGhyb3VnaCBhcyBub24tc2VjcmV0LlxuICAgIGNvbnN0IHNlY3JldE9rID0gdiA9PiAhdiB8fCBpc0NpcGhlcnRleHQodik7XG5cbiAgICAvLyBUb21ic3RvbmVzIChpc3N1ZSAjMykuIEEgZG9jL2tleSBpcyBzdXBwcmVzc2VkIGZyb20gdGhlIHBheWxvYWQgd2hlbiBhXG4gICAgLy8gdG9tYnN0b25lIGRhdGVkIGF0LW9yLWFmdGVyIGl0cyB1cGRhdGVkQXQgZXhpc3RzLCBzbyBhIHN0YWxlIGxvY2FsIGNvcHlcbiAgICAvLyBjYW5ub3QgcmUtcHVzaCBhIGRlbGV0ZWQgaXRlbSBiYWNrIGludG8gdGhlIG1pcnJvci5cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IChhbGwuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGFsbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWREb2NzIDoge307XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSAoYWxsLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBhbGwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkS2V5cyA6IHt9O1xuICAgIGNvbnN0IGRlbGV0ZWRQcm9maWxlcyA9IChhbGwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBhbGwuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZFByb2ZpbGVzIDoge307XG5cbiAgICAvLyBBIHByb2ZpbGUncyBzdGFibGUgaWRlbnRpdHkgZm9yIHRvbWJzdG9uZSAvIHJlY2VuY3kga2V5aW5nOiBpdHMgcHVia2V5LFxuICAgIC8vIGVsc2UgKGZvciBhIGJ1bmtlcikgaXRzIHJlbW90ZSBwdWJrZXkuIE1hdGNoZXMgbWVyZ2VJbnRvTG9jYWwncyBpZGVudGl0eU9mLlxuICAgIGNvbnN0IGlkZW50aXR5T2YgPSAocCkgPT4gKHAgJiYgKHAucHViS2V5IHx8IHAucmVtb3RlUHVia2V5KSkgfHwgbnVsbDtcblxuICAgIC8vIFAwOiBUb21ic3RvbmVzIFx1MjAxNCB0aGUgZ3VhcmFudGVlZCBzbG90IChlbWl0dGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlKS5cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZERvY3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWREb2NzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZERvY3MnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkS2V5cykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkS2V5cycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRQcm9maWxlcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZFByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZFByb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFAxOiBQcm9maWxlcyAoc3RyaXAgYGhvc3RzYCB0byBzYXZlIHNwYWNlKSArIHByb2ZpbGVJbmRleFxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IHJlZGFjdFByb2ZpbGVzKGFsbC5wcm9maWxlcylcbiAgICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBwcm9maWxlIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KSxcbiAgICAgICAgICAgICAgICAvLyBzbyBhIHN0YWxlIGxvY2FsIGNvcHkgY2Fubm90IHJlLXB1c2ggYSBkZWxldGVkIGlkZW50aXR5LlxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShpZCAhPSBudWxsICYmIGRlbGV0ZWRQcm9maWxlc1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdID49IChwLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm1hcChwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgICAgIGlmIChyZXN0LnByaXZLZXkgJiYgIXNlY3JldE9rKHJlc3QucHJpdktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHByaXZLZXkgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdC5wcml2S2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgLy8gTk9URTogYGlzRW5jcnlwdGVkYCAodGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGZsYWcpIGlzIGRlbGliZXJhdGVseSBOT1RcbiAgICAvLyBzeW5jZWQuIEl0IGlzIGEgcGVyLWRldmljZSBmYWN0IFx1MjAxNCBhIGRldmljZSBob2xkcyB0aGUgcGFzc3dvcmQgdmVyaWZpZXIgb3JcbiAgICAvLyBpdCBkb2VzIG5vdCBcdTIwMTQgYW5kIG1pcnJvcmluZyBpdCBvbmNlIGxhdGNoZWQgYSBwYXNzd29yZGxlc3MgZGV2aWNlIGludG8gYVxuICAgIC8vIGRlYWQtZW5kIGxvY2sgc2NyZWVuIGl0IGhhZCBubyBwYXNzd29yZCBmb3IuIFNlZSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkuXG5cbiAgICAvLyBQMjogU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrIG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoYWxsW2tdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYWxsKSkge1xuICAgICAgICBpZiAoay5zdGFydHNXaXRoKCdmZWF0dXJlOicpKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFAzOiBBUEkga2V5IHZhdWx0IFx1MjAxNCBvbmx5IHN5bmMga2V5cyB3aG9zZSBzZWNyZXQgaXMgY2lwaGVydGV4dCAoVDAtNSlcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0ICYmIGFsbC5hcGlLZXlWYXVsdC5rZXlzKSB7XG4gICAgICAgIGNvbnN0IHNhZmVLZXlzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGFsbC5hcGlLZXlWYXVsdC5rZXlzKSkge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBrZXkgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSAhPSBudWxsICYmIGRlbGV0ZWRLZXlzW2lkXSA+PSAoa2V5LnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlY3JldE9rKGtleS5zZWNyZXQpKSB7XG4gICAgICAgICAgICAgICAgc2FmZUtleXNbaWRdID0ga2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgQVBJIHNlY3JldCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYXVsdCA9IHsgLi4uYWxsLmFwaUtleVZhdWx0LCBrZXlzOiBzYWZlS2V5cyB9O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2FmZVZhdWx0KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnYXBpS2V5VmF1bHQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDNfQVBJS0VZUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDQ6IFZhdWx0IGRvY3MgKGluZGl2aWR1YWxseSwgbmV3ZXN0IGZpcnN0KSBcdTIwMTQgb25seSBpZiBjb250ZW50IGlzIGNpcGhlcnRleHRcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBkb2MgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWREb2NzW2RvYy5wYXRoXSAhPSBudWxsICYmIGRlbGV0ZWREb2NzW2RvYy5wYXRoXSA+PSAoZG9jLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzZWNyZXRPayhkb2MuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgdmF1bHQgY29udGVudCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFdyaXRlIGEgcHJpb3JpdGlzZWQsIHByZS1jaHVua2VkIHBheWxvYWQgdG8gc3RvcmFnZS5zeW5jLCByZXRyeWluZyBvbiBhblxuICogb3Zlci1xdW90YSByZWplY3Rpb24gYnkgZHJvcHBpbmcgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsIHByZXNlbnQgYW5kXG4gKiB0cnlpbmcgYWdhaW4uIFAwICh0b21ic3RvbmVzKSBhbmQgUDEgKHByb2ZpbGVzKSBhcmUgTkVWRVIgZHJvcHBlZCBcdTIwMTQgYSBmdWxsXG4gKiBiYXRjaCBmYWlsdXJlIHdvdWxkIHN0cmFuZCBhIGRlbGV0aW9uIG9yIGEga2V5LCBzbyB0aGUgaW1wb3J0YW50IHRpZXJzIHN5bmNcbiAqIGV2ZW4gd2hlbiB0aGUgYnVsa3kgb25lcyBjYW5ub3QuXG4gKlxuICogQHBhcmFtIHt7IHByaW9yaXR5OiBudW1iZXIsIGNodW5rczoge2tleTpzdHJpbmcsIHZhbHVlOnN0cmluZ31bXSB9W119IGluY2x1ZGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fSBudW1iZXIgb2YgZGF0YSBrZXlzIGFjdHVhbGx5IHdyaXR0ZW5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2V0U3luY1Jlc3BlY3RpbmdRdW90YShpbmNsdWRlZCkge1xuICAgIGxldCB0aWVycyA9IGluY2x1ZGVkLnNsaWNlKCk7XG4gICAgLy8gR3VhcmQgYWdhaW5zdCBhbiB1bmJvdW5kZWQgbG9vcDogYXQgbW9zdCBvbmUgcmV0cnkgcGVyIGRpc3RpbmN0IHByaW9yaXR5LlxuICAgIGZvciAobGV0IGF0dGVtcHQgPSAwOyA7IGF0dGVtcHQrKykge1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGllcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBpdGVtLmNodW5rcykge1xuICAgICAgICAgICAgICAgIHN5bmNQYXlsb2FkW2Mua2V5XSA9IGMudmFsdWU7XG4gICAgICAgICAgICAgICAgYWxsU3luY0tleXMucHVzaChjLmtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeSh7IGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksIGtleXM6IGFsbFN5bmNLZXlzIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChzeW5jUGF5bG9hZCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVtb3ZlIGFueSBleGlzdGluZyBzeW5jIGtleSBub3QgaW4gb3VyIHBheWxvYWQuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFsbFN5bmNLZXlzLmxlbmd0aDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gT3ZlciBxdW90YSAob3IgTUFYX0lURU1TKSBcdTIwMTQgZHJvcCB0aGUgbG93ZXN0LXByaW9yaXR5IHRpZXIgc3RpbGxcbiAgICAgICAgICAgIC8vIHByZXNlbnQgYW5kIHJldHJ5LiBOZXZlciBkcm9wIFAwL1AxLlxuICAgICAgICAgICAgY29uc3QgbWF4UHJpb3JpdHkgPSB0aWVycy5yZWR1Y2UoKG0sIHQpID0+IE1hdGgubWF4KG0sIHQucHJpb3JpdHkpLCAtMSk7XG4gICAgICAgICAgICBpZiAobWF4UHJpb3JpdHkgPD0gUFJJT1JJVFkuUDFfUFJPRklMRVMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlOyAvLyBub3RoaW5nIGRyb3BwYWJsZSBsZWZ0OyBQMC9QMSBtdXN0IHN1cnZpdmUgb3IgZmFpbCBsb3VkbHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IHRpZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpZXJzID0gdGllcnMuZmlsdGVyKHQgPT4gdC5wcmlvcml0eSA8IG1heFByaW9yaXR5KTtcbiAgICAgICAgICAgIGlmICh0aWVycy5sZW5ndGggPT09IGJlZm9yZSkgdGhyb3cgZTsgLy8gbm8gcHJvZ3Jlc3MgXHUyMDE0IGJhaWxcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBzeW5jLnNldCBvdmVyIHF1b3RhIFx1MjAxNCBkcm9wcGVkIHByaW9yaXR5ICR7bWF4UHJpb3JpdHl9IHRpZXIsIHJldHJ5aW5nYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIFB1bGwtbWVyZ2UgQkVGT1JFIGJ1aWxkaW5nOiBvcnBoYW4tY2xlYW51cCBiZWxvdyB3aXBlcyBhbnkgbWlycm9yIGtleVxuICAgICAgICAvLyBhYnNlbnQgZnJvbSB0aGlzIGRldmljZSdzIHBheWxvYWQsIHNvIHdlIG11c3QgZmlyc3QgYWJzb3JiIHJlbW90ZVxuICAgICAgICAvLyBzdGF0ZSAoZXNwZWNpYWxseSByZW1vdGUgdG9tYnN0b25lcywgd2hpY2ggdGhlbiBzdXBwcmVzcyB0aGUgbWF0Y2hpbmdcbiAgICAgICAgLy8gZG9jcy9rZXlzIGZyb20gdGhlIHBheWxvYWQgd2UgYXJlIGFib3V0IHRvIGJ1aWxkKS4gV2l0aG91dCB0aGlzIGFcbiAgICAgICAgLy8gZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIHdvdWxkIHJlLXB1c2ggdGhlIGl0ZW0uXG4gICAgICAgIGNvbnN0IHJlbW90ZSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAocmVtb3RlKSBhd2FpdCBtZXJnZUludG9Mb2NhbChyZW1vdGUpO1xuXG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBpbmNsdWRlZCBzZXQgcmVzcGVjdGluZyB0aGUgaW4tY29kZSBieXRlL2l0ZW0gYnVkZ2V0LlxuICAgICAgICBsZXQgdXNlZEJ5dGVzID0gMDtcbiAgICAgICAgbGV0IHVzZWRJdGVtcyA9IDA7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBidWRnZXRFeGhhdXN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmIChidWRnZXRFeGhhdXN0ZWQpIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1ZhbHVlKGVudHJ5LmtleSwgZW50cnkuanNvblN0cmluZyk7XG4gICAgICAgICAgICBsZXQgZW50cnlTaXplID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBlbnRyeVNpemUgKz0gYy5rZXkubGVuZ3RoICsgKHR5cGVvZiBjLnZhbHVlID09PSAnc3RyaW5nJyA/IGMudmFsdWUubGVuZ3RoIDogSlNPTi5zdHJpbmdpZnkoYy52YWx1ZSkubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVzZWRCeXRlcyArIGVudHJ5U2l6ZSA+IFNZTkNfUVVPVEEgLSA1MDAgfHwgdXNlZEl0ZW1zICsgY2h1bmtzLmxlbmd0aCA+IE1BWF9JVEVNUyAtIDUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkucHJpb3JpdHkgPD0gUFJJT1JJVFkuUDNfQVBJS0VZUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcml0aWNhbCBkYXRhIChpbmNsLiBQMCB0b21ic3RvbmVzKSBcdTIwMTQgaW5jbHVkZSBhbnl3YXk7IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBydW50aW1lIHF1b3RhIGZhbGxiYWNrIHdpbGwgc2hlZCBidWxreSB0aWVycyBpZiB0aGUgQVBJIHJlamVjdHMuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU3luY01hbmFnZXJdIEJ1ZGdldCBleGhhdXN0ZWQgYXQgcHJpb3JpdHkgJHtlbnRyeS5wcmlvcml0eX0sIHNraXBwaW5nIHJlbWFpbmluZyBlbnRyaWVzYCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldEV4aGF1c3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaCh7IHByaW9yaXR5OiBlbnRyeS5wcmlvcml0eSwgY2h1bmtzIH0pO1xuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHt3cml0dGVufSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsRnJvbVN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm4gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICBpZiAoIXJhdyB8fCBPYmplY3Qua2V5cyhyYXcpLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbWV0YVN0ciA9IHJhd1tTWU5DX01FVEFfS0VZXTtcbiAgICAgICAgaWYgKCFtZXRhU3RyKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQgbWV0YTtcbiAgICAgICAgdHJ5IHsgbWV0YSA9IEpTT04ucGFyc2UobWV0YVN0cik7IH0gY2F0Y2ggeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICAvLyBDb2xsZWN0IHRoZSBub24tY2h1bmssIG5vbi1tZXRhIGtleXNcbiAgICAgICAgY29uc3QgZGF0YUtleXMgPSBtZXRhLmtleXMuZmlsdGVyKGsgPT4gIWsuc3RhcnRzV2l0aChDSFVOS19QUkVGSVgpICYmIGsgIT09IFNZTkNfTUVUQV9LRVkpO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGFLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCByYXcpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0Ll9zeW5jTWV0YSA9IG1ldGE7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1bGxGcm9tU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1lcmdlIGxvZ2ljXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gVGhlIGJhY2tncm91bmQncyBvd24gd2F5IHRvIGhlYXIgb2YgbW92ZWQgcHJvZmlsZXMuIEEgd29ya2VyIGNhbm5vdCBtZXNzYWdlXG4vLyBpdHNlbGYsIHNvIGEgbWVyZ2UgcnVubmluZyB0aGVyZSBjYWxscyB0aGlzOyBhIHBhZ2Ugc2VuZHMgYSBtZXNzYWdlLlxubGV0IHByb2ZpbGVNb3ZlSGFuZGxlciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9maWxlTW92ZUhhbmRsZXIoaGFuZGxlcikge1xuICAgIHByb2ZpbGVNb3ZlSGFuZGxlciA9IGhhbmRsZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKSB7XG4gICAgaWYgKHByb2ZpbGVNb3ZlSGFuZGxlcikge1xuICAgICAgICBwcm9maWxlTW92ZUhhbmRsZXIobW92ZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Byb2ZpbGVzTW92ZWQnLCBwYXlsb2FkOiBtb3ZlcyB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmFja2dyb3VuZCB1bmF2YWlsYWJsZTogd2hhdCBpcyBrZXllZCBieSBpbmRleCBjaGVja3MgaXRzIGlkZW50aXR5ICovIH1cbn1cblxuLyoqXG4gKiBXaGVyZSBlYWNoIHByb2ZpbGUgd2VudC4gQW4gdW50b3VjaGVkIHJlY29yZCBpcyBmb3VuZCBhcyBpdHNlbGYsIGFuZCBvbmUgc3luY1xuICogcmVwbGFjZWQgaXMgZm91bmQgYnkgaWRlbnRpdHkuIEVhY2ggcGxhY2UgaXMgY2xhaW1lZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0W119IGJlZm9yZVxuICogQHBhcmFtIHtvYmplY3RbXX0gYWZ0ZXJcbiAqIEBwYXJhbSB7KHByb2ZpbGU6IG9iamVjdCkgPT4gP3N0cmluZ30gaWRlbnRpdHlPZlxuICogQHJldHVybnMge0FycmF5PFtudW1iZXIsID9udW1iZXJdPn0gW29sZCBpbmRleCwgbmV3IGluZGV4IG9yIG51bGwgaWYgZ29uZV0sIGNoYW5nZXMgb25seVxuICovXG5mdW5jdGlvbiBwcm9maWxlTW92ZXMoYmVmb3JlLCBhZnRlciwgaWRlbnRpdHlPZikge1xuICAgIGNvbnN0IHBsYWNlcyA9IGJlZm9yZS5tYXAocHJvZmlsZSA9PiBhZnRlci5pbmRleE9mKHByb2ZpbGUpKTtcbiAgICBjb25zdCBjbGFpbWVkID0gbmV3IFNldChwbGFjZXMpO1xuICAgIGJlZm9yZS5mb3JFYWNoKChwcm9maWxlLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwcm9maWxlKTtcbiAgICAgICAgaWYgKHBsYWNlc1tpXSA+PSAwIHx8ICFpZCkgcmV0dXJuO1xuICAgICAgICBwbGFjZXNbaV0gPSBhZnRlci5maW5kSW5kZXgoKG90aGVyLCBqKSA9PiAhY2xhaW1lZC5oYXMoaikgJiYgaWRlbnRpdHlPZihvdGhlcikgPT09IGlkKTtcbiAgICAgICAgY2xhaW1lZC5hZGQocGxhY2VzW2ldKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGxhY2VzLmZsYXRNYXAoKHBsYWNlLCBpKSA9PiAocGxhY2UgPT09IGkgPyBbXSA6IFtbaSwgcGxhY2UgPCAwID8gbnVsbCA6IHBsYWNlXV0pKTtcbn1cblxuLyoqXG4gKiBNZXJnZSBzeW5jIGRhdGEgaW50byBsb2NhbCBzdG9yYWdlIHdpdGggY29uZmxpY3QgcmVzb2x1dGlvbi5cbiAqXG4gKiBDT05ESVRJT04gMyAoaXNzdWUgIzMgbG9vcCBpbnZhcmlhbnQpOiBldmVyeSB3cml0ZSBoZXJlIGdvZXMgdGhyb3VnaCB0aGUgcmF3XG4gKiBtb2R1bGUtbGV2ZWwgYHN0b3JhZ2VgICg9IGFwaS5zdG9yYWdlLmxvY2FsKSB2aWEgYSBzaW5nbGUgYHN0b3JhZ2Uuc2V0YC4gSXRcbiAqIE1VU1QgTk9UIGNhbGwgdGhlIHN0b3JlLWxheWVyIGhlbHBlcnMgKGRlbGV0ZURvY3VtZW50TG9jYWwgLyBzYXZlRG9jdW1lbnRMb2NhbFxuICogLyBkZWxldGVBcGlLZXkgLyBzYXZlQXBpS2V5KSwgYmVjYXVzZSB0aG9zZSBjYWxsIHNjaGVkdWxlU3luY1B1c2goKSBcdTIwMTQgYSBtZXJnZVxuICogdGhhdCBzY2hlZHVsZWQgYSBwdXNoIHdvdWxkIHR1cm4gZXZlcnkgaW5jb21pbmcgc3luYyBpbnRvIGFuIG91dGdvaW5nIG9uZSBhbmRcbiAqIGxvb3AuIEEgcmVncmVzc2lvbiB0ZXN0IGFzc2VydHMgbWVyZ2VJbnRvTG9jYWwgbmV2ZXIgc2NoZWR1bGVzIGEgcHVzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBzeW5jRGF0YSA9IHsgLi4uc3luY0RhdGEsIHByb2ZpbGVzOiByZWRhY3RQcm9maWxlcyhzeW5jRGF0YS5wcm9maWxlcykgfTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZWN0IGZyZXNoIGluc3RhbGw6IG5vIHByb2ZpbGVzLCBvciBhIHNpbmdsZSB1bnRvdWNoZWQgZGVmYXVsdCBwcm9maWxlLlxuICAgIC8vIChEZWZhdWx0IGtleXMgYXJlIG5vdyB3cmFwcGVkIGF0IHJlc3QsIHNvIGBwcml2S2V5YCBpcyB0cnV0aHkgZXZlbiBvbiBhXG4gICAgLy8gZnJlc2ggaW5zdGFsbCBcdTIwMTQgZGV0ZWN0IHRoZSB1bnRvdWNoZWQgZGVmYXVsdCBieSBpdHMgbmFtZSArIGFic2VuY2Ugb2YgYW55XG4gICAgLy8gcGVyLXNpdGUgZ3JhbnRzIGluc3RlYWQuKVxuICAgIC8vXG4gICAgLy8gQzE6IGEgbG9uZSBwcm9maWxlIGlzIG9ubHkgXCJ1bnRvdWNoZWQvZnJlc2hcIiB3aGVuIGl0IGNhcnJpZXMgbm8gaWRlbnRpdHkuXG4gICAgLy8gQSBsb25lIEJVTktFUiBwcm9maWxlIGhhcyBwcml2S2V5OicnIGJ1dCBJUyBhIHJlYWwgaWRlbnRpdHkgKHR5cGUvYnVua2VyVXJsXG4gICAgLy8gL3JlbW90ZVB1YmtleSksIGFuZCBtdXN0IG5vdCBiZSB0cmVhdGVkIGFzIGZyZXNoIGFuZCB3aXBlZCBieSBhIHN5bmMgcHVsbC5cbiAgICBjb25zdCBoYXNJZGVudGl0eSA9IChwKSA9PiAhIShwICYmIChcbiAgICAgICAgcC5wcml2S2V5IHx8IHAucHViS2V5IHx8IHAudHlwZSA9PT0gJ2J1bmtlcicgfHwgcC5idW5rZXJVcmwgfHwgcC5yZW1vdGVQdWJrZXlcbiAgICApKTtcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkgJiYgIWhhc0lkZW50aXR5KGxvbmUpKSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gU3RhYmxlIGlkZW50aXR5IGZvciBwcm9maWxlIG1hdGNoaW5nIC8gdG9tYnN0b25lczogcHViS2V5LCBlbHNlIHRoZVxuICAgIC8vIGJ1bmtlcidzIHJlbW90ZVB1YmtleS4gTWF0Y2hlcyBidWlsZFN5bmNQYXlsb2FkJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBBQ1RJVkUgaWRlbnRpdHkgQkVGT1JFIGFueSByZW9yZGVyaW5nL3JlbW92YWwgc28gdGhlIGFjdGl2ZVxuICAgIC8vIGluZGV4IGNhbiBmb2xsb3cgdGhhdCBpZGVudGl0eSB0aHJvdWdoIHRoZSBtZXJnZSAoYSBrZXkgbWFuYWdlciBtdXN0IG5vdFxuICAgIC8vIHNpbGVudGx5IHN3aXRjaCB3aGljaCBpZGVudGl0eSBpcyBhY3RpdmUganVzdCBiZWNhdXNlIGEgcHJvZmlsZSBvcmRlcmVkXG4gICAgLy8gYmVmb3JlIGl0IHdhcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlKS5cbiAgICBjb25zdCBsb2NhbEFjdGl2ZUluZGV4ID0gKGxvY2FsLnByb2ZpbGVJbmRleCAhPSBudWxsKSA/IGxvY2FsLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgY29uc3QgYWN0aXZlSWQgPSAobG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgID8gaWRlbnRpdHlPZihsb2NhbC5wcm9maWxlc1tsb2NhbEFjdGl2ZUluZGV4XSlcbiAgICAgICAgOiBudWxsO1xuXG4gICAgLy8gLS0tIFByb2ZpbGUgdG9tYnN0b25lcyAoaXNzdWUgIzMpIFx1MjAxNCB1bmlvbiBsb2NhbCArIHJlbW90ZSwgbWF4IHBlciBpZGVudGl0eSAtLS1cbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSB7IC4uLihsb2NhbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkUHJvZmlsZXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRQcm9maWxlc1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRQcm9maWxlc1tpZF0pIGRlbGV0ZWRQcm9maWxlc1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlcyAoUDEpIFx1MjAxNCBwdWJrZXkta2V5ZWQgbWVyZ2UgKyB0b21ic3RvbmUgcmVtb3ZhbCAtLS1cbiAgICAvLyBNYXRjaCBieSBzdGFibGUgaWRlbnRpdHkgcmF0aGVyIHRoYW4gYXJyYXkgaW5kZXgsIHNvIGEgcmVvcmRlcmVkIG9yIHBhcnRpYWxcbiAgICAvLyBzeW5jIHBheWxvYWQgY2Fubm90IG92ZXJ3cml0ZSBvbmUgaWRlbnRpdHkncyBrZXkgbWF0ZXJpYWwgd2l0aCBhbm90aGVyJ3MuXG4gICAgbGV0IG1lcmdlZFByb2ZpbGVzID0gbG9jYWwucHJvZmlsZXMgPyBbLi4ubG9jYWwucHJvZmlsZXNdIDogbnVsbDtcbiAgICBsZXQgcHJvZmlsZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IHN5bmNEYXRhLnByb2ZpbGVzLnNsaWNlKCk7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleEJ5SWRlbnRpdHkgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiAhaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN5bmNQcm9maWxlIG9mIHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IGluZGV4QnlJZGVudGl0eS5nZXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFByb2ZpbGUgPSBtZXJnZWRQcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgYWRvcHQgaXQgYnV0IHByZXNlcnZlIGxvY2FsIHBlci1zaXRlIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlc1tpXSA9IHsgLi4uc3luY1Byb2ZpbGUsIGhvc3RzOiBsb2NhbFByb2ZpbGUuaG9zdHMgfHwge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZ2VudWluZWx5IG5ldyBpZGVudGl0eSBub3QgcHJlc2VudCBsb2NhbGx5IFx1MjAxNCBhcHBlbmQgaXQuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzLnB1c2goc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIGtleWxlc3MgcmVtb3RlIHByb2ZpbGUgY2Fubm90IGJlIHJlY29uY2lsZWQgdG8gYSBsb2NhbCBvbmVcbiAgICAgICAgICAgICAgICAvLyBzYWZlbHkgKG5vIGlkZW50aXR5IHRvIG1hdGNoIG9uKSwgc28gaXQgaXMgc2tpcHBlZC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGx5IHByb2ZpbGUgdG9tYnN0b25lczogcmVtb3ZlIGFueSBtZXJnZWQgcHJvZmlsZSB3aG9zZSBpZGVudGl0eSBoYXNcbiAgICAvLyAodXBkYXRlZEF0IDw9IGRlbGV0ZWRBdCkgXHUyMDE0IGRlbGV0aW9uIHdpbnMgdGllcywgY29uc2lzdGVudCB3aXRoIGRvY3Mva2V5cy5cbiAgICAvLyBBIHJlY3JlYXRlZCBwcm9maWxlICh1cGRhdGVkQXQgPiBkZWxldGVkQXQpIHN1cnZpdmVzLiBOZXZlciBwcnVuZSB0b21ic3RvbmVzLlxuICAgIGlmIChtZXJnZWRQcm9maWxlcyAmJiBPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qga2VwdCA9IG1lcmdlZFByb2ZpbGVzLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gaWQgIT0gbnVsbCA/IGRlbGV0ZWRQcm9maWxlc1tpZF0gOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuICEodHMgIT0gbnVsbCAmJiAocC51cGRhdGVkQXQgfHwgMCkgPD0gdHMpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2FmZXR5OiBuZXZlciBsZXQgYSBzeW5jIG1lcmdlIGxlYXZlIFpFUk8gcHJvZmlsZXMgKHRoYXQgd291bGQgb3JwaGFuXG4gICAgICAgIC8vIHRoZSBhY3RpdmUgaW5kZXggYW5kIGJyaWNrIHRoZSBVSSkuIElmIHJlbW92YWwgd291bGQgZW1wdHkgdGhlIGxpc3QsXG4gICAgICAgIC8vIGtlZXAgdGhlIHByb2ZpbGVzIGFzLWlzIFx1MjAxNCB0aGUgbG9jYWwgdXNlciBjYW4gc3RpbGwgZGVsZXRlIGRlbGliZXJhdGVseS5cbiAgICAgICAgLy8gRGVsaWJlcmF0ZSB0cmFkZS1vZmY6IGNyb3NzLWRldmljZSBkZWxldGlvbiBkb2VzIE5PVCBjb252ZXJnZSBvbiBhXG4gICAgICAgIC8vIGRldmljZSB3aGVyZSBhcHBseWluZyBpdCB3b3VsZCBsZWF2ZSB6ZXJvIHByb2ZpbGVzOyB0aGUgcHJvZmlsZSBzdGF5c1xuICAgICAgICAvLyB0b21ic3RvbmUtc3VwcHJlc3NlZCBvbiBlbWl0LCBzbyBpdCBkb2VzIG5vdCByZS1wcm9wYWdhdGUgdG8gb3RoZXJzLlxuICAgICAgICBpZiAoa2VwdC5sZW5ndGggIT09IG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAmJiBrZXB0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzID0ga2VwdDtcbiAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbW92ZXMgPSBbXTtcbiAgICBpZiAocHJvZmlsZXNDaGFuZ2VkICYmIG1lcmdlZFByb2ZpbGVzKSB7XG4gICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBtZXJnZWRQcm9maWxlcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdmVzID0gcHJvZmlsZU1vdmVzKGxvY2FsLnByb2ZpbGVzIHx8IFtdLCBtZXJnZWRQcm9maWxlcywgaWRlbnRpdHlPZik7XG4gICAgICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwICYmIGxvY2FsLmJ1bmtlclNlc3Npb25zKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmJ1bmtlclNlc3Npb25zID0gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGxvY2FsLmJ1bmtlclNlc3Npb25zLCBtb3Zlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIFx1MjAxNCBGT0xMT1cgVEhFIEFDVElWRSBJREVOVElUWSBhY3Jvc3MgdGhlIG1lcmdlIC0tLVxuICAgIC8vIFRoZSBhY3RpdmUgaW5kZXggdHJhY2tzIHRoZSBhY3RpdmUgaWRlbnRpdHksIG5vdCBhIHJhdyBzbG90OiBpZiBhIHByb2ZpbGVcbiAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgYWN0aXZlIG9uZSBpcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlLCB0aGUgaW5kZXhcbiAgICAvLyBzaGlmdHMgc28gdGhlIFNBTUUgaWRlbnRpdHkgc3RheXMgYWN0aXZlLiBUaGUgaW5kZXggb25seSBtb3ZlcyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGlkZW50aXR5IHdoZW4gdGhlIGFjdGl2ZSBvbmUgaXMgaXRzZWxmIGdvbmUgKHRvbWJzdG9uZWQpLCBvciBvbiBhXG4gICAgLy8gZnJlc2ggYWRvcHQgXHUyMDE0IHRoZW4gaXQgZmFsbHMgYmFjayB0byB0aGUgc2FmZSBjbGFtcC5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgZGVzaXJlZEluZGV4O1xuICAgICAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMgJiYgaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggYWRvcHQgXHUyMDE0IHRha2Ugc3luYydzIGFjdGl2ZSBpbmRleCwgY2xhbXBlZCBpbnRvIHJhbmdlLlxuICAgICAgICAgICAgY29uc3QgYmFzZSA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsID8gc3luY0RhdGEucHJvZmlsZUluZGV4IDogMDtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGJhc2UsIDApLCBtZXJnZWRQcm9maWxlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd2VkID0gYWN0aXZlSWQgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gbWVyZ2VkUHJvZmlsZXMuZmluZEluZGV4KHAgPT4gaWRlbnRpdHlPZihwKSA9PT0gYWN0aXZlSWQpXG4gICAgICAgICAgICAgICAgOiAtMTtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IGZvbGxvd2VkID49IDBcbiAgICAgICAgICAgICAgICA/IGZvbGxvd2VkXG4gICAgICAgICAgICAgICAgOiBNYXRoLm1pbihNYXRoLm1heChsb2NhbEFjdGl2ZUluZGV4LCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlc2lyZWRJbmRleCAhPT0gbG9jYWwucHJvZmlsZUluZGV4KSB7XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IGRlc2lyZWRJbmRleDtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSAtLS1cbiAgICAvLyBBMjogYGlzRW5jcnlwdGVkYCBpcyBOT1QgbWVyZ2VkLiBUaGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgaXMgYSBwZXItZGV2aWNlXG4gICAgLy8gZmFjdCBwcm92ZW4gYnkgdGhlIGxvY2FsIHZlcmlmaWVyOyBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzXG4gICAgLy8gZGV2aWNlIGludG8gYSBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gLS0tIFNldHRpbmdzIChQMikgXHUyMDE0IGxhc3Qtd3JpdGUtd2lucyAtLS1cbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChzeW5jRGF0YVtrZXldICE9IG51bGwgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgLy8gRm9yIHZlcnNpb24sIG9ubHkgYWNjZXB0IGEgbnVtZXJpY2FsbHktaGlnaGVyIG9uZSAoJzEuMTAuMCcgPiAnMS45LjAnKS5cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIGNvbXBhcmVTZW12ZXIoc3luY0RhdGEudmVyc2lvbiwgbG9jYWwudmVyc2lvbikgPD0gMCkgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBkZWxldGVkQXQgcGVyIGtleSAtLS1cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkRG9jcyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkRG9jcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1twYXRoXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZERvY3NbcGF0aF0pIGRlbGV0ZWREb2NzW3BhdGhdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSB7IC4uLihsb2NhbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZEtleXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRLZXlzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZEtleXNbaWRdKSBkZWxldGVkS2V5c1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgLy8gQnVpbGQgdGhlIG1lcmdlZCBrZXkgc2V0LCBmb2xkIGluIGFueSByZW1vdGUga2V5cywgdGhlbiBhcHBseSBrZXlcbiAgICAvLyB0b21ic3RvbmVzLiBSdW5zIGV2ZW4gd2hlbiB0aGUgcHVsbCBjYXJyaWVzIE5PIGFwaUtleVZhdWx0LCBzbyBhXG4gICAgLy8gZGVsZXRlLW9ubHkgcHVsbCBjYW4gc3RpbGwgcmVtb3ZlIGEgbG9jYWxseS1oZWxkIGtleS5cbiAgICB7XG4gICAgICAgIGxldCBiYXNlVmF1bHQgPSBsb2NhbC5hcGlLZXlWYXVsdCB8fCBudWxsO1xuICAgICAgICBsZXQgbG9jYWxLZXlzID0gKGxvY2FsLmFwaUtleVZhdWx0ICYmIGxvY2FsLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9O1xuICAgICAgICBsZXQgYXBpQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSAmJiBzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICAgICAgYmFzZVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBsb2NhbEtleXMgPSB7fTtcbiAgICAgICAgICAgIGFwaUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNoYXJlZCBtZXJnZSAoc3luYy1tZXJnZS5qcyk6IG5ld2VyIHJlbW90ZSB3aW5zLCBkZWxldGlvbiB3aW5zIHRpZXNcbiAgICAgICAgLy8gKGA8PWApLCB0b21ic3RvbmVzIGFyZSBORVZFUiBwcnVuZWQgaGVyZS4gVG9tYnN0b25lcyBhcmUgY2xlYXJlZCBvbmx5XG4gICAgICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5IHRoZSB1c2VyLlxuICAgICAgICBjb25zdCBrZXlNZXJnZSA9IG1lcmdlUmVtb3RlKGxvY2FsS2V5cywgKHN5bmNEYXRhLmFwaUtleVZhdWx0ICYmIHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9LCBkZWxldGVkS2V5cyk7XG4gICAgICAgIGNvbnN0IG1lcmdlZEtleXMgPSBrZXlNZXJnZS5tZXJnZWQ7XG4gICAgICAgIGlmIChrZXlNZXJnZS5jaGFuZ2VkKSBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGFwaUNoYW5nZWQgJiYgYmFzZVZhdWx0KSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0geyAuLi5iYXNlVmF1bHQsIGtleXM6IG1lcmdlZEtleXMgfTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCByZW1vdGVEb2NzID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgcmVtb3RlRG9jc1tkb2MucGF0aF0gPSBkb2M7XG4gICAgfVxuICAgIC8vIFNoYXJlZCBtZXJnZTogZGVsZXRpb24gd2lucyB0aWVzLCB0b21ic3RvbmVzIGFyZSBORVZFUiBwcnVuZWQgaGVyZS5cbiAgICBjb25zdCB7IG1lcmdlZDogbWVyZ2VkRG9jcywgY2hhbmdlZDogZG9jc0NoYW5nZWQgfSA9IG1lcmdlUmVtb3RlKGxvY2FsLnZhdWx0RG9jcyB8fCB7fSwgcmVtb3RlRG9jcywgZGVsZXRlZERvY3MpO1xuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFBlcnNpc3QgdGhlIHRvbWJzdG9uZSBzZXRzLiBUaGVzZSBhcmUgYSBQVVJFIFVOSU9OIChtYXggZGVsZXRlZEF0IHBlclxuICAgIC8vIGtleSkgXHUyMDE0IHRoZSBtZXJnZSBuZXZlciByZW1vdmVzIGEgdG9tYnN0b25lLCBzbyB0aGV5IGFyZSByZXRhaW5lZCBmb3JldmVyXG4gICAgLy8gYW5kIGFuIG9mZmxpbmUgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgYSBkZWxldGlvbi4gVGhleSBhcmUgY2xlYXJlZCBvbmx5XG4gICAgLy8gYXQgdGhlIHNvdXJjZSAoc2F2ZURvY3VtZW50TG9jYWwvc2F2ZUFwaUtleSBvbiBzYW1lLWRldmljZSByZWNyZWF0ZSkgb3IgYnlcbiAgICAvLyB0aGUgdXNlciB2aWEgY2xlYXJEZWxldGlvbkhpc3RvcnkuXG4gICAgLy9cbiAgICAvLyBSZXNpZHVhbCAoYWNjZXB0ZWQsIGRvY3VtZW50ZWQpOiBwdXJlIGNyb3NzLWRldmljZSBjbG9jayBza2V3IFx1MjAxNCBhIGxpdmVcbiAgICAvLyBjb3B5IHdob3NlIHVwZGF0ZWRBdCBpcyBnZW51aW5lbHkgTkVXRVIgdGhhbiB0aGUgZGVsZXRlJ3MgdGltZXN0YW1wIFx1MjAxNCB3aW5zXG4gICAgLy8gdW5kZXIgdGhlIGA8PWAgcnVsZSBhbmQgaXMga2VwdC4gVGhhdCBpcyBhbiBpbmhlcmVudCBsYXN0LXdyaXRlLXdpbnMgbGltaXRcbiAgICAvLyB0aGF0IHRvbWJzdG9uZXMgZG8gbm90IHJlc29sdmU7IFwiZml4aW5nXCIgaXQgYnkgcHJ1bmluZyB3b3VsZCByZWludHJvZHVjZVxuICAgIC8vIHRoZSBzYW1lLXNlY29uZCByZXN1cnJlY3Rpb24gYnVnLCBzbyBpdCBpcyBsZWZ0IGFzLWlzLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkRG9jcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWREb2NzIHx8IHt9KSkge1xuICAgICAgICB1cGRhdGVzLmRlbGV0ZWREb2NzID0gZGVsZXRlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkS2V5cyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkS2V5cyA9IGRlbGV0ZWRLZXlzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRQcm9maWxlcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWRQcm9maWxlcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkUHJvZmlsZXMgPSBkZWxldGVkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIC8vIFJhdyBsb2NhbCB3cml0ZSBPTkxZIFx1MjAxNCBuZXZlciBzY2hlZHVsZVN5bmNQdXNoIChsb29wIGludmFyaWFudCkuXG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbiAgICBpZiAobW92ZXMubGVuZ3RoID4gMCkgYXdhaXQgYW5ub3VuY2VQcm9maWxlTW92ZXMobW92ZXMpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlYm91bmNlZCBwdXNoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTY2hlZHVsZSBhIHN5bmMgcHVzaCB3aXRoIGEgMi1zZWNvbmQgZGVib3VuY2UuXG4gKiBFeHBvcnRlZCBmb3IgdXNlIGJ5IHN0b3JlcyBhbmQgdGhlIHN0b3JhZ2UgaW50ZXJjZXB0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZVN5bmNQdXNoKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuICAgIGlmIChwdXNoVGltZXIpIGNsZWFyVGltZW91dChwdXNoVGltZXIpO1xuICAgIHB1c2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdXNoVGltZXIgPSBudWxsO1xuICAgICAgICBwdXNoVG9TeW5jKCk7XG4gICAgfSwgMjAwMCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVsZXRpb24taGlzdG9yeSAodG9tYnN0b25lKSByZXRlbnRpb24gaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVG90YWwgbnVtYmVyIG9mIHJldGFpbmVkIGRlbGV0aW9uIHJlY29yZHMgKGRvY3MgKyBrZXlzKS4gR3Jvd3Mgb3ZlciB0aGUgbGlmZVxuICogb2YgdGhlIGluc3RhbGwgYmVjYXVzZSB0b21ic3RvbmVzIGFyZSBrZXB0IGZvcmV2ZXIgKGFuIG9mZmxpbmUgZGV2aWNlIHRoYXRcbiAqIG5ldmVyIGxlYXJuZWQgb2YgYSBkZWxldGlvbiBtdXN0IG5vdCBiZSBhYmxlIHRvIHJlc3VycmVjdCB0aGUgaXRlbSkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb21ic3RvbmVDb3VudCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBkZWxldGVkRG9jczoge30sIGRlbGV0ZWRLZXlzOiB7fSwgZGVsZXRlZFByb2ZpbGVzOiB7fSB9KTtcbiAgICBjb25zdCBkb2NzID0gZGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWREb2NzIDoge307XG4gICAgY29uc3Qga2V5cyA9IGRhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkS2V5cyA6IHt9O1xuICAgIGNvbnN0IHByb2ZpbGVzID0gZGF0YS5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZFByb2ZpbGVzIDoge307XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGRvY3MpLmxlbmd0aCArIE9iamVjdC5rZXlzKGtleXMpLmxlbmd0aCArIE9iamVjdC5rZXlzKHByb2ZpbGVzKS5sZW5ndGg7XG59XG5cbi8qKlxuICogV2FybmluZyBsZXZlbCBmb3IgYSBnaXZlbiByZXRhaW5lZC1kZWxldGlvbiBjb3VudDpcbiAqICAgMCA9IGZpbmUsIDEgPSBnZW50bGUgbnVkZ2UgKD49IDgpLCAyID0gc3Ryb25nZXIgd2FybmluZyAoPj0gMTYpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9tYnN0b25lV2FybmluZ0xldmVsKGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID49IFRPTUJTVE9ORV9XQVJOX1NUUk9ORykgcmV0dXJuIDI7XG4gICAgaWYgKGNvdW50ID49IFRPTUJTVE9ORV9XQVJOX0dFTlRMRSkgcmV0dXJuIDE7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQ2xlYXIgYWxsIHJldGFpbmVkIGRlbGV0aW9uIGhpc3RvcnkuIEluZm9ybWVkLXVzZXIgY2hvaWNlOiBhIGRldmljZSB0aGF0IGhhc1xuICogYmVlbiBvZmZsaW5lIHNpbmNlIGJlZm9yZSBvbmUgb2YgdGhlc2UgZGVsZXRpb25zIGNhbiwgb24gaXRzIG5leHQgc3luYyxcbiAqIHJlLWFkZCB0aGUgaXRlbSBcdTIwMTQgYmVjYXVzZSB0aGUgcmVjb3JkIHRoYXQgdG9sZCBldmVyeW9uZSBpdCB3YXMgZGVsZXRlZCBpc1xuICogbm93IGdvbmUuIFNjaGVkdWxlcyBhIHB1c2ggc28gdGhlIGNsZWFyZWQgc3RhdGUgcHJvcGFnYXRlcyB0byB0aGUgbWlycm9yLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJEZWxldGlvbkhpc3RvcnkoKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBkZWxldGVkRG9jczoge30sIGRlbGV0ZWRLZXlzOiB7fSwgZGVsZXRlZFByb2ZpbGVzOiB7fSB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRW5jcnlwdGlvbi1mbGFnIHNlbGYtaGVhbCAoQTIpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDbGVhciBhIGJvZ3VzIGBpc0VuY3J5cHRlZD10cnVlYCB3aGVuIHRoaXMgZGV2aWNlIGhvbGRzIG5vIGV2aWRlbmNlIG9mIHJlYWxcbiAqIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IG5vIHBhc3N3b3JkIHZlcmlmaWVyIChwYXNzd29yZEhhc2gpIEFORCBubyBwcm9maWxlIGtleVxuICogdGhhdCBpcyBhIFBBU1NXT1JEIGJsb2IuXG4gKlxuICogR2F0aW5nIGRldGFpbCAoY3JpdGljYWwpOiBldmlkZW5jZSBpcyBhIFBBU1NXT1JEIGJsb2IgKGlzUGFzc3dvcmRCbG9iKSwgTk9UIGFcbiAqIGRldmljZS1rZXkgYmxvYi4gU2luY2UgdjEuNy4wIGV2ZXJ5IGtleSBpcyB3cmFwcGVkIGF0IHJlc3QgZXZlbiBmb3IgdGhlXG4gKiBwYXNzd29yZGxlc3MgTGV2ZWwtMCB1c2VyLCBzbyBhIG5vcm1hbCBwYXNzd29yZGxlc3MgaW5zdGFsbCBpcyBmdWxsIG9mXG4gKiBkZXZpY2Uta2V5IGNpcGhlcnRleHQ7IGtleWluZyBvZmYgdGhhdCB3b3VsZCB3cm9uZ2x5IGtlZXAgdGhlIGZsYWcgbGF0Y2hlZC5cbiAqIE9ubHkgYSBwYXNzd29yZC1kZXJpdmVkIGJsb2IgKG9yIHRoZSB2ZXJpZmllcikgcHJvdmVzIGEgbWFzdGVyIHBhc3N3b3JkLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSB0cnVlIGlmIGEgYm9ndXMgZmxhZyB3YXMgY2xlYXJlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlLCBwYXNzd29yZEhhc2g6IG51bGwsIHByb2ZpbGVzOiBbXSB9KTtcbiAgICBpZiAoIWRhdGEuaXNFbmNyeXB0ZWQpIHJldHVybiBmYWxzZTsgICAvLyBub3RoaW5nIGxhdGNoZWQgXHUyMDE0IG5vdGhpbmcgdG8gaGVhbFxuICAgIGlmIChkYXRhLnBhc3N3b3JkSGFzaCkgcmV0dXJuIGZhbHNlOyAgIC8vIHJlYWwgdmVyaWZpZXIgcHJlc2VudCBcdTIwMTQga2VlcCB0aGUgZmxhZ1xuXG4gICAgY29uc3QgaGFzUGFzc3dvcmRCbG9iID0gQXJyYXkuaXNBcnJheShkYXRhLnByb2ZpbGVzKSAmJlxuICAgICAgICBkYXRhLnByb2ZpbGVzLnNvbWUocCA9PiBwICYmIGlzUGFzc3dvcmRCbG9iKHAucHJpdktleSkpO1xuICAgIGlmIChoYXNQYXNzd29yZEJsb2IpIHJldHVybiBmYWxzZTsgICAgIC8vIHBhc3N3b3JkLWVuY3J5cHRlZCBrZXkgbWF0ZXJpYWwgXHUyMDE0IGtlZXBcblxuICAgIC8vIEZsYWcgaXMgYm9ndXMgKGUuZy4gbWlycm9yZWQgaW4gZnJvbSBhbm90aGVyIGRldmljZSB0aGF0IERJRCBoYXZlIGFcbiAgICAvLyBwYXNzd29yZCkuIENsZWFyIGl0IHNvIHRoaXMgZGV2aWNlIGlzIG5vdCBzdHJhbmRlZCBhdCBhIGRlYWQtZW5kIHVubG9jay5cbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBDbGVhcmVkIGJvZ3VzIGlzRW5jcnlwdGVkIGZsYWcgKG5vIHBhc3N3b3JkIHZlcmlmaWVyL2Jsb2IpJyk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRW5hYmxlIC8gZGlzYWJsZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1N5bmNFbmFibGVkKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IHRydWUgfSk7XG4gICAgcmV0dXJuIGRhdGFbTE9DQUxfRU5BQkxFRF9LRVldO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3luY0VuYWJsZWQoZW5hYmxlZCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogZW5hYmxlZCB9KTtcbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlZHVjZSBldmVyeSBidW5rZXJVcmwgaW4gdGhlIGBwcm9maWxlc2AgbWlycm9yIHRvIGl0cyBhZGRyZXNzLiBXb3JrcyBvbiB0aGVcbiAqIHN0b3JlZCBkYXRhIGRpcmVjdGx5LCBzbyBpdCBkb2VzIG5vdCBkZXBlbmQgb24gc3luYyBiZWluZyBlbmFibGVkLCBhbmQgd3JpdGVzXG4gKiBub3RoaW5nIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBjaGFuZ2UuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzY3J1YlN5bmNlZFByb2ZpbGVzKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHByb2ZpbGVzID0gcmF3ID8gcmVhc3NlbWJsZUZyb21TeW5jRGF0YSgncHJvZmlsZXMnLCByYXcpIDogbnVsbDtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvZmlsZXMpKSByZXR1cm47XG4gICAgY29uc3QgY2xlYW4gPSByZWRhY3RQcm9maWxlcyhwcm9maWxlcyk7XG4gICAgaWYgKGNsZWFuID09PSBwcm9maWxlcykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW50cmllcyA9IGNodW5rVmFsdWUoJ3Byb2ZpbGVzJywgSlNPTi5zdHJpbmdpZnkoY2xlYW4pKTtcbiAgICBjb25zdCBwYXlsb2FkID0gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMubWFwKGUgPT4gW2Uua2V5LCBlLnZhbHVlXSkpO1xuICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHBheWxvYWQpO1xuICAgIGNvbnN0IHVudXNlZCA9IE9iamVjdC5rZXlzKHJhdykuZmlsdGVyKGsgPT5cbiAgICAgICAgay5zdGFydHNXaXRoKGAke0NIVU5LX1BSRUZJWH1wcm9maWxlczpgKSAmJiAhKGsgaW4gcGF5bG9hZClcbiAgICApO1xuICAgIGlmICh1bnVzZWQubGVuZ3RoID4gMCkgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5yZW1vdmUodW51c2VkKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgLy8gU2VsZi1oZWFsIGEgYm9ndXMgZW5jcnlwdGlvbiBmbGFnIGZpcnN0IFx1MjAxNCB0aGlzIG11c3QgcnVuIGV2ZW4gd2hlbiBzeW5jIGlzXG4gICAgLy8gdW5hdmFpbGFibGUgb3IgZGlzYWJsZWQsIGJlY2F1c2UgdGhlIGJhZCBzdGF0ZSBpdCBmaXhlcyBtYXkgaGF2ZSBiZWVuIGxlZnRcbiAgICAvLyBiZWhpbmQgYnkgYW4gZWFybGllciAobm93LXJlbW92ZWQpIGlzRW5jcnlwdGVkLXN5bmNpbmcgYnVpbGQuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gc3RvcmFnZS5zeW5jIG5vdCBhdmFpbGFibGUgXHUyMDE0IHNraXBwaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzY3J1YlN5bmNlZFByb2ZpbGVzKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHNjcnViU3luY2VkUHJvZmlsZXMgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFBsYXRmb3JtIHN5bmMgZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1bGwgKyBtZXJnZVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN5bmNEYXRhID0gYXdhaXQgcHVsbEZyb21TeW5jKCk7XG4gICAgICAgIGlmIChzeW5jRGF0YSkge1xuICAgICAgICAgICAgYXdhaXQgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsK21lcmdlIGNvbXBsZXRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBObyBzeW5jIGRhdGEgZm91bmQgXHUyMDE0IGZyZXNoIHN5bmMnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgcmVtb3RlIGNoYW5nZXNcbiAgICBpZiAoYXBpLnN0b3JhZ2Uub25DaGFuZ2VkKSB7XG4gICAgICAgIGFwaS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcigoY2hhbmdlcywgYXJlYU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmVhTmFtZSAhPT0gJ3N5bmMnKSByZXR1cm47XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBSZW1vdGUgc3luYyBjaGFuZ2UgZGV0ZWN0ZWQnKTtcbiAgICAgICAgICAgIC8vIFJlLXB1bGwgYW5kIG1lcmdlIHRoZSBmdWxsIHN5bmMgZGF0YSB0byBoYW5kbGUgY2h1bmtlZCB2YWx1ZXMgY29ycmVjdGx5XG4gICAgICAgICAgICBwdWxsRnJvbVN5bmMoKS50aGVuKHN5bmNEYXRhID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3luY0RhdGEpIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIG1lcmdlIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIERvIGFuIGluaXRpYWwgcHVzaCBzbyBsb2NhbCBkYXRhIGlzIG1pcnJvcmVkXG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuIiwgIi8qKlxuICogU2hhcmVkIHRvbWJzdG9uZS1hd2FyZSBtZXJnZS5cbiAqXG4gKiBPbmUgcnVsZSBmb3IgZXZlcnkgcGxhY2UgcmVtb3RlIGRhdGEgbWVldHMgbG9jYWwgZGF0YSAodGhlIHN0b3JhZ2Uuc3luY1xuICogbWlycm9yIGFuZCBib3RoIHJlbGF5IHB1bGxzLCB2YXVsdCBkb2N1bWVudHMgYW5kIEFQSSBrZXlzKTogYSByZW1vdGUgaXRlbSBpc1xuICogZHJvcHBlZCB3aGVuIGEgdG9tYnN0b25lIGZvciBpdHMga2V5IGlzIGRhdGVkIGF0IG9yIGFmdGVyIHRoZSByZW1vdGUgaXRlbSdzXG4gKiBvd24gdGltZXN0YW1wLiBEZWxldGlvbiB3aW5zIHRpZXMuIEEgY29weSB3cml0dGVuIGFmdGVyIHRoZSBkZWxldGlvbiAoYVxuICogcmUtY3JlYXRlKSBjYXJyaWVzIGEgbmV3ZXIgdGltZXN0YW1wIGFuZCBpcyBrZXB0LlxuICpcbiAqIFRvbWJzdG9uZXMgYXJlIG5ldmVyIHBydW5lZCBoZXJlLlxuICovXG5cbi8qKlxuICogSXMgYGl0ZW1gIHN1cGVyc2VkZWQgYnkgdGhlIHRvbWJzdG9uZSBmb3IgYGtleWA/XG4gKiBAcGFyYW0ge09iamVjdH0gdG9tYnN0b25lcyAtIHsga2V5OiBkZWxldGVkQXRTZWNvbmRzIH1cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIC0gdGhlIGl0ZW0ncyB0aW1lc3RhbXAgaW4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUb21ic3RvbmVkKHRvbWJzdG9uZXMsIGtleSwgdGltZSkge1xuICAgIGlmICghdG9tYnN0b25lcyB8fCB0eXBlb2YgdG9tYnN0b25lcyAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB0cyA9IHRvbWJzdG9uZXNba2V5XTtcbiAgICByZXR1cm4gdHMgIT0gbnVsbCAmJiAodGltZSB8fCAwKSA8PSB0cztcbn1cblxuLyoqXG4gKiBNZXJnZSBhIHJlbW90ZSBtYXAgaW50byBhIGxvY2FsIG1hcC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbG9jYWwgLSB7IGtleTogaXRlbSB9XG4gKiBAcGFyYW0ge09iamVjdH0gcmVtb3RlIC0geyBrZXk6IGl0ZW0gfVxuICogQHBhcmFtIHtPYmplY3R9IHRvbWJzdG9uZXMgLSB7IGtleTogZGVsZXRlZEF0U2Vjb25kcyB9XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHNdXG4gKiBAcGFyYW0geyhpdGVtOk9iamVjdCk9Pm51bWJlcn0gW29wdHMudGltZU9mXSAtIGl0ZW0gdGltZXN0YW1wIChkZWZhdWx0IHVwZGF0ZWRBdClcbiAqIEByZXR1cm5zIHt7IG1lcmdlZDogT2JqZWN0LCBjaGFuZ2VkOiBib29sZWFuIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVJlbW90ZShsb2NhbCwgcmVtb3RlLCB0b21ic3RvbmVzLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCB0aW1lT2YgPSBvcHRzLnRpbWVPZiB8fCAoKGl0ZW0pID0+IChpdGVtICYmIGl0ZW0udXBkYXRlZEF0KSB8fCAwKTtcbiAgICBjb25zdCBtZXJnZWQgPSB7IC4uLihsb2NhbCB8fCB7fSkgfTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgW2tleSwgaXRlbV0gb2YgT2JqZWN0LmVudHJpZXMocmVtb3RlIHx8IHt9KSkge1xuICAgICAgICBpZiAoIWl0ZW0pIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaXNUb21ic3RvbmVkKHRvbWJzdG9uZXMsIGtleSwgdGltZU9mKGl0ZW0pKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IG1pbmUgPSBtZXJnZWRba2V5XTtcbiAgICAgICAgaWYgKCFtaW5lIHx8IHRpbWVPZihpdGVtKSA+IHRpbWVPZihtaW5lKSkge1xuICAgICAgICAgICAgbWVyZ2VkW2tleV0gPSBpdGVtO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobWVyZ2VkKSkge1xuICAgICAgICBpZiAoaXNUb21ic3RvbmVkKHRvbWJzdG9uZXMsIGtleSwgdGltZU9mKG1lcmdlZFtrZXldKSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBtZXJnZWRba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IG1lcmdlZCwgY2hhbmdlZCB9O1xufVxuXG4vKipcbiAqIENvbGxlY3QgZGVsZXRpb24gdGltZXMgZnJvbSB0aGUgYXV0aG9yJ3Mgb3duIGtpbmQgNSBldmVudHMgKE5JUC0wOSkgZm9yIHRoZVxuICogZ2l2ZW4gZC10YWdzLiBBY2NlcHRzIGBhYCB0YWdzIGAzMDA3ODo8cHVia2V5Pjo8ZHRhZz5gLCBhbmQgdGhlIGVhcmxpZXJcbiAqIGAzMDA3ODo6PGR0YWc+YCBzaGFwZSB0aGlzIGV4dGVuc2lvbiB1c2VkIHRvIHdyaXRlICh0aGUgYXV0aG9yIGlzIGFscmVhZHlcbiAqIHZlcmlmaWVkIGJ5IHRoZSBjYWxsZXIpLiBBbHNvIG1hcHMgYGVgIHRhZ3MgdGhyb3VnaCBgZXZlbnRJZFRvRHRhZ2AuXG4gKlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBkZWxldGlvbnMgLSB2ZXJpZmllZCBraW5kIDUgZXZlbnRzIGJ5IGBwdWJrZXlgXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVia2V5XG4gKiBAcGFyYW0ge09iamVjdH0gW2V2ZW50SWRUb0R0YWddIC0geyBldmVudElkOiBkdGFnIH1cbiAqIEByZXR1cm5zIHtPYmplY3R9IHsgZHRhZzogbGF0ZXN0RGVsZXRpb25DcmVhdGVkQXQgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRpb25Ub21ic3RvbmVzKGRlbGV0aW9ucywgcHVia2V5LCBldmVudElkVG9EdGFnID0ge30pIHtcbiAgICBjb25zdCBvdXQgPSB7fTtcbiAgICBjb25zdCBub3RlID0gKGR0YWcsIHRzKSA9PiB7XG4gICAgICAgIGlmIChvdXRbZHRhZ10gPT0gbnVsbCB8fCB0cyA+IG91dFtkdGFnXSkgb3V0W2R0YWddID0gdHM7XG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIGRlbGV0aW9ucyB8fCBbXSkge1xuICAgICAgICBpZiAoIWV2IHx8IGV2LmtpbmQgIT09IDUgfHwgZXYucHVia2V5ICE9PSBwdWJrZXkpIGNvbnRpbnVlO1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBldi50YWdzIHx8IFtdKSB7XG4gICAgICAgICAgICBpZiAodGFnWzBdID09PSAnYScgJiYgdHlwZW9mIHRhZ1sxXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsID0gYDMwMDc4OiR7cHVia2V5fTpgO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZ2FjeSA9ICczMDA3ODo6JztcbiAgICAgICAgICAgICAgICBpZiAodGFnWzFdLnN0YXJ0c1dpdGgoZnVsbCkpIG5vdGUodGFnWzFdLnNsaWNlKGZ1bGwubGVuZ3RoKSwgZXYuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGFnWzFdLnN0YXJ0c1dpdGgobGVnYWN5KSkgbm90ZSh0YWdbMV0uc2xpY2UobGVnYWN5Lmxlbmd0aCksIGV2LmNyZWF0ZWRfYXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWdbMF0gPT09ICdlJyAmJiBldmVudElkVG9EdGFnW3RhZ1sxXV0pIHtcbiAgICAgICAgICAgICAgICBub3RlKGV2ZW50SWRUb0R0YWdbdGFnWzFdXSwgZXYuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsICIvKipcbiAqIFNlY3JldCBWYXVsdCBcdTIwMTQgYXQtcmVzdCBlbmNyeXB0aW9uIGZvciBwcml2YXRlIGtleXMgYW5kIGFwcGxpY2F0aW9uIHNlY3JldHMuXG4gKlxuICogVGhyZWF0IG1vZGVsIChUMC00KTogcmF3IHNlY3JldCBieXRlcyBtdXN0IG5ldmVyIHNpdCBpbiBicm93c2VyIHN0b3JhZ2UgaW5cbiAqIGNsZWFydGV4dCwgZXZlbiBmb3IgdGhlIERFRkFVTFQgcGFzc3dvcmRsZXNzIHVzZXIuIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHR3b1xuICogd3JhcHBpbmcgc3RyYXRlZ2llcyBiZWhpbmQgb25lIGB3cmFwU2VjcmV0YCAvIGB1bndyYXBTZWNyZXRgIGludGVyZmFjZTpcbiAqXG4gKiAgIDEuIERFVklDRSBLRVkgKGRlZmF1bHQsIG5vIG1hc3RlciBwYXNzd29yZCkgXHUyMDE0IGEgbm9uLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNXG4gKiAgICAgIENyeXB0b0tleS4gVGhyZWUgcGVyc2lzdGVuY2Ugc3RyYXRlZ2llcyBleGlzdCwgYW5kIGVhY2ggaXMgVkVSSUZJRURcbiAqICAgICAgKHJlYWQgYmFjayBhbmQgcm91bmQtdHJpcHBlZCB0aHJvdWdoIGVuY3J5cHQvZGVjcnlwdCkgYmVmb3JlIGl0IGlzXG4gKiAgICAgIHRydXN0ZWQ6XG4gKlxuICogICAgICAgIGEuIGBpZGJgICAgIFx1MjAxNCBhIENyeXB0b0tleSAqaGFuZGxlKiBpbiBJbmRleGVkREIuIE9ubHkgZXZlciBBRE9QVEVELFxuICogICAgICAgICAgICAgICAgICAgICAgbmV2ZXIgbWludGVkOiB3ZSB0cnVzdCBgaWRiYCBleGNsdXNpdmVseSB3aGVuIGRiLmdldCgpXG4gKiAgICAgICAgICAgICAgICAgICAgICBoYW5kcyBiYWNrIGEgUFJFLUVYSVNUSU5HIGtleSB0aGF0IHJvdW5kLXRyaXBzLCBiZWNhdXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGF0IFx1MjAxNCBhbmQgb25seSB0aGF0IFx1MjAxNCBwcm92ZXMgdGhlIGhhbmRsZSBzdXJ2aXZlZCBhXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyBjb250ZXh0LiBBIHNhbWUtY29udGV4dCBwdXRcdTIxOTJnZXQgcHJvYmUgY2Fubm90XG4gKiAgICAgICAgICAgICAgICAgICAgICBwcm92ZSBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlLiBLZWVwaW5nIHRoZSBhZG9wdCBwYXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZXMgZXZlcnkgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd3JpdHRlbiBiZWZvcmVcbiAqICAgICAgICAgICAgICAgICAgICAgIDEuOC4xLCB3aG9zZSBibG9icyBsaXZlIHVuZGVyIHRoaXMga2V5LlxuICogICAgICAgICAgICAgICAgICAgICAgKipORVZFUiB1c2VkIGFzIHRoZSB3cmFwcGluZyBrZXkgb24gU2FmYXJpLioqIE9uIFdlYktpdFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIHR3byBzdG9yYWdlIGFyZWFzIGRvIG5vdCBzaGFyZSBhIGxpZmV0aW1lIHRoZSB3YXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZXkgZG8gb24gQ2hyb21pdW0vR2Vja28sIHNvIGFuIGFkb3B0ZWQgSW5kZXhlZERCIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgaXMgbm90IGEgc2FmZSB3cmFwcGluZyBrZXkgdGhlcmUuIFNhZmFyaSB0aGVyZWZvcmUgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cml0ZXMgdW5kZXIgYHNlZWRgIChidW5kbGUtc2NvcGVkIGBzdG9yYWdlLmxvY2FsYCk7XG4gKiAgICAgICAgICAgICAgICAgICAgICBhZG9wdGVkIElEQiBrZXlzIGFyZSBkZWNyeXB0LW9ubHkgbGVnYWN5IG9uIFNhZmFyaSwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgYXQtcmVzdCBtaWdyYXRpb24gcmUtd3JhcHMgRVZFUlkgZGV2aWNlIGJsb2IgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24gc3RvcmVzIFx1MjAxNCBwcm9maWxlIHByaXZhdGUga2V5cywgQVBJLWtleVxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cywgdmF1bHQtbm90ZSBib2RpZXMsIGFuZCBOSVAtNDYgYnVua2VyIHNlc3Npb25cbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMgLyBzZXNzaW9uIHByaXZhdGUga2V5cyBcdTIwMTQgbm90IGp1c3QgcHJvZmlsZSBrZXlzLlxuICogICAgICAgICAgICAgICAgICAgICAgKFBlci1lbmdpbmUgc3RvcmFnZS1zY29waW5nIHJhdGlvbmFsZTogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgICAgICAgICAgICAgICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqICAgICAgICBiLiBgc2VlZGAgICBcdTIwMTQgMzIgcmFuZG9tIGJ5dGVzIGluIGBicm93c2VyLnN0b3JhZ2UubG9jYWxgIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgZGV2aWNlS2V5U2VlZGAsIGltcG9ydGVkIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ01cbiAqICAgICAgICAgICAgICAgICAgICAgIGtleSBhdCBsb2FkLiBUaGlzIGlzIHdoZXJlIEVWRVJZIG5ldyBkZXZpY2Uga2V5IGxhbmRzLFxuICogICAgICAgICAgICAgICAgICAgICAgb24gZXZlcnkgcGxhdGZvcm06IHdoZW4gbm8gcHJlLWV4aXN0aW5nIElEQiBrZXkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIHdlIGRvIG5vdCBtaW50IG9uZSwgd2Ugc2VlZC4gQ2hyb21lL0ZpcmVmb3ggZnJlc2hcbiAqICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxzIHRoZXJlZm9yZSB1c2UgYHNlZWRgIHRvbyBcdTIwMTQgb25lIGNvZGUgcGF0aCwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgb25seSBvbmUgd2hvc2UgcGVyc2lzdGVuY2Ugd2UgY2FuIGFjdHVhbGx5IHZlcmlmeS5cbiAqICAgICAgICBjLiBgbWVtb3J5YCBcdTIwMTQgbGFzdCByZXNvcnQgKHVuaXQgdGVzdHMsIHNhbmRib3hlZCBjb250ZXh0cykuIFNlY3JldHNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZWQgaGVyZSBkbyBub3Qgc3Vydml2ZSBhIHJlbG9hZC5cbiAqXG4gKiAgICAgIFRoZSByZXNvbHZlZCBzdHJhdGVneSBpcyBTVElDS1k6IGl0IGlzIHJlY29yZGVkIGluIHN0b3JhZ2UubG9jYWwgdW5kZXJcbiAqICAgICAgYGRldmljZUtleVN0cmF0ZWd5YCBhbmQgaG9ub3VyZWQgb24gbGF0ZXIgbG9hZHMsIHNvIGEgY29udGV4dCBjYW5ub3RcbiAqICAgICAgc2lsZW50bHkgZmxpcCBzdHJhdGVnaWVzIGFuZCBvcnBoYW4gdGhlIGJsb2JzIHdyaXR0ZW4gdW5kZXIgdGhlIG9sZFxuICogICAgICBvbmUuIERlY3J5cHRpb24gaXMgc3ltbWV0cmljIHJlZ2FyZGxlc3M6IGBkZWNyeXB0V2l0aERldmljZUtleWAgdHJpZXNcbiAqICAgICAgdGhlIGN1cnJlbnQga2V5LCB0aGVuIGV2ZXJ5IG90aGVyIGtleSB0aGlzIGluc3RhbGwgY291bGQgZXZlciBoYXZlIGhhZFxuICogICAgICAobGVnYWN5IElEQiBoYW5kbGUsIGV4aXN0aW5nIHNlZWQpLCBhbmQgY2FsbGVycyB1c2luZ1xuICogICAgICBgZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXBgIHJlLXdyYXAgdW5kZXIgdGhlIGN1cnJlbnQgc3RyYXRlZ3kuXG4gKlxuICogICAgICBUaHJlYXQgbW9kZWwsIGhvbmVzdGx5IHN0YXRlZDogdGhlIHBhc3N3b3JkbGVzcyBkZXZpY2UgdGllciBpcyBhdC1yZXN0XG4gKiAgICAgIHByb3RlY3Rpb24gYWdhaW5zdCBjYXN1YWwgaW5zcGVjdGlvbiBvZiBleHRlbnNpb24gc3RvcmFnZSwgTk9UIGEgZGVmZW5jZVxuICogICAgICBhZ2FpbnN0IGNvZGUgYWxyZWFkeSBleGVjdXRpbmcgaW4gdGhpcyBleHRlbnNpb24ncyBjb250ZXh0LiBUaGVcbiAqICAgICAgc3Ryb25nZXN0IHRpZXIgYXZhaWxhYmxlIHRvZGF5IGlzIGEgKiptYXN0ZXIgcGFzc3dvcmQqKiAoYmVsb3cpLCB3aGljaFxuICogICAgICBkZXJpdmVzIHRoZSB3cmFwcGluZyBrZXkgZnJvbSBhIHNlY3JldCB0aGF0IGlzIG5ldmVyIHN0b3JlZC4gVXNlcnNcbiAqICAgICAgaG9sZGluZyBoaWdoLXZhbHVlIGtleXMgc2hvdWxkIHNldCBvbmUuIEEgaGFyZHdhcmUtYmFja2VkIGRldmljZSBrZXkgaXNcbiAqICAgICAgZnV0dXJlIHdvcmsuIChUaWVyIHRyYWRlb2ZmcyBpbiBmdWxsOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKlxuICogICAyLiBTRVNTSU9OIEtFWSAobWFzdGVyIHBhc3N3b3JkIHNldCArIHVubG9ja2VkKSBcdTIwMTQgdGhlIEFFUy0yNTYtR0NNIGtleVxuICogICAgICBkZXJpdmVkIGZyb20gdGhlIHBhc3N3b3JkIChzZWUgY3J5cHRvLmpzKS4gU2V0IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlclxuICogICAgICBvbiB1bmxvY2sgdmlhIGBzZXRTZXNzaW9uS2V5YCwgY2xlYXJlZCBvbiBsb2NrIHZpYSBgY2xlYXJTZXNzaW9uYC5cbiAqXG4gKiBCbG9iIGZvcm1hdHMgKGJvdGggYXJlIHNlbGYtZGVzY3JpYmluZyBKU09OIHN0cmluZ3MpOlxuICogICBwYXNzd29yZCBibG9iIDogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9XG4gKiAgIGRldmljZSAgYmxvYiA6IHsgdjoxLCBrOlwiZGV2aWNlXCIsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqXG4gKiBgdW53cmFwU2VjcmV0YCByZWZ1c2VzIHRvIGRlY3J5cHQgd2hlbiB0aGUgc2Vzc2lvbiBoYXMgYmVlbiBleHBsaWNpdGx5IGxvY2tlZFxuICogKEY1L0Y2KSBzbyBhIGxvY2tlZCBwYWdlIGNhbm5vdCByZWFkIHNlY3JldHMuXG4gKi9cblxuaW1wb3J0IHsgZW5jcnlwdFdpdGhLZXksIGRlY3J5cHRXaXRoS2V5IH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuY29uc3QgREVWSUNFX0RCID0gJ25vc3Rya2V5LXNlY3JldC12YXVsdCc7XG5jb25zdCBERVZJQ0VfU1RPUkUgPSAna2V5cyc7XG5jb25zdCBERVZJQ0VfS0VZX0lEID0gJ2RldmljZS13cmFwLWtleS12MSc7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBiYXNlNjQgcmF3IHNlZWQgZm9yIHRoZSBgc2VlZGAgc3RyYXRlZ3kuXG5jb25zdCBERVZJQ0VfU0VFRF9LRVkgPSAnZGV2aWNlS2V5U2VlZCc7XG5jb25zdCBERVZJQ0VfU0VFRF9CWVRFUyA9IDMyO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgU1RJQ0tZIHJlc29sdmVkIHN0cmF0ZWd5ICgnaWRiJyB8ICdzZWVkJykuXG5jb25zdCBERVZJQ0VfU1RSQVRFR1lfS0VZID0gJ2RldmljZUtleVN0cmF0ZWd5JztcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIChrZXB0IGxvY2FsIHNvIHRoaXMgbW9kdWxlIGhhcyBubyBjcm9zcy1kZXBzKSAtLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGFiVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFRvQWIoYjY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIFNlc3Npb24gKHBhc3N3b3JkLWRlcml2ZWQpIGtleSBzdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfc2Vzc2lvbktleSA9IG51bGw7ICAgLy8gQ3J5cHRvS2V5IHwgbnVsbFxubGV0IF9zZXNzaW9uU2FsdCA9IG51bGw7ICAvLyBVaW50OEFycmF5IHwgbnVsbFxuLy8gX3VubG9ja2VkOiBudWxsID0gcGFzc3dvcmRsZXNzIC8gbm90IGFwcGxpY2FibGUgKG5ldmVyIGxvY2tlZCksXG4vLyAgICAgICAgICAgIHRydWUgPSB1bmxvY2tlZCwgZmFsc2UgPSBsb2NrZWQgKHJlZnVzZSBzZWNyZXQgcmVhZHMpLlxubGV0IF91bmxvY2tlZCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uS2V5KGNyeXB0b0tleSwgc2FsdCkge1xuICAgIF9zZXNzaW9uS2V5ID0gY3J5cHRvS2V5O1xuICAgIF9zZXNzaW9uU2FsdCA9IHNhbHQ7XG4gICAgX3VubG9ja2VkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcbiAgICBfc2Vzc2lvbktleSA9IG51bGw7XG4gICAgX3Nlc3Npb25TYWx0ID0gbnVsbDtcbiAgICBfdW5sb2NrZWQgPSBmYWxzZTtcbn1cblxuLyoqIEV4cGxpY2l0bHkgbWFyayB0aGUgc2Vzc2lvbiB1bmxvY2tlZC9sb2NrZWQgd2l0aG91dCBwcm92aWRpbmcgYSBrZXkuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VW5sb2NrZWQodikge1xuICAgIF91bmxvY2tlZCA9IHYgPT09IG51bGwgPyBudWxsIDogISF2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2Vzc2lvbktleSgpIHtcbiAgICByZXR1cm4gISFfc2Vzc2lvbktleTtcbn1cblxuLy8gLS0tIERldmljZSBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG5sZXQgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDsgICAvLyAnaWRiJyB8ICdzZWVkJyB8ICdtZW1vcnknIFx1MjAxNCBzZXQgb25jZSByZXNvbHZlZFxubGV0IF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsOyAgLy8gbGFzdC1yZXNvcnQga2V5IGZvciBjb250ZXh0cyB0aGF0IHBlcnNpc3Qgbm90aGluZ1xubGV0IF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiB0aGUgcHJlLTEuOC4xIElEQiBrZXlcbmxldCBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gYW4gZXhpc3Rpbmcgc2VlZCBrZXlcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZXZpY2VLZXkoKSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlOiByYXcgYnl0ZXMgY2FuIG5ldmVyIGJlIHJlYWQgYmFjayBvdXRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkRGJBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ZWREQiAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92ZSBhIGNhbmRpZGF0ZSBrZXkgaXMgYWN0dWFsbHkgdXNhYmxlIGJlZm9yZSB3ZSB0cnVzdCBhIHN0cmF0ZWd5IHdpdGggYVxuICogdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBBIHJlYWQtYmFjayBoYW5kbGUgdGhhdCBzdHJ1Y3R1cmVkLWNsb25lXG4gKiBtYW5nbGVkIChvciBhIHNlZWQgdGhhdCBjYW1lIGJhY2sgdHJ1bmNhdGVkKSBmYWlscyBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHlcbiAqIHByb2R1Y2luZyB1bmRlY3J5cHRhYmxlIGJsb2JzLlxuICovXG5hc3luYyBmdW5jdGlvbiBrZXlSb3VuZFRyaXBzKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgICAgIGNvbnN0IHByb2JlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdub3N0cmtleS1kZXZpY2UtcHJvYmUnKTtcbiAgICAgICAgY29uc3QgY3QgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgcHJvYmUpO1xuICAgICAgICBjb25zdCBwdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBjdCk7XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocHQpID09PSAnbm9zdHJrZXktZGV2aWNlLXByb2JlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRldmljZURiKCkge1xuICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICBjb25zdCB7IG9wZW5EQiB9ID0gYXdhaXQgaW1wb3J0KCdpZGInKTtcbiAgICByZXR1cm4gb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICB1cGdyYWRlKGQpIHtcbiAgICAgICAgICAgIGlmICghZC5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKERFVklDRV9TVE9SRSkpIHtcbiAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgKGEpOiBBRE9QVCBhIHByZS1leGlzdGluZyBub24tZXh0cmFjdGFibGUgQ3J5cHRvS2V5IGhhbmRsZSBmcm9tXG4gKiBJbmRleGVkREIuIE5ldmVyIG1pbnRzIG9uZS5cbiAqXG4gKiBBIGtleSB0aGF0IGRiLmdldCgpIGhhbmRzIGJhY2sgaXMgYSBrZXkgc29tZSBFQVJMSUVSIGNvbnRleHQgd3JvdGUsIHNvIGl0IGlzXG4gKiBwcm9vZiBvZiBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlIFx1MjAxNCB0aGUgb25lIHRoaW5nIGEgc2FtZS1jb250ZXh0XG4gKiBwdXRcdTIxOTJnZXRcdTIxOTJyb3VuZC10cmlwIHByb2JlIGNhbiBuZXZlciBlc3RhYmxpc2guIGlPUyBTYWZhcmkncyBJbmRleGVkREIgaXNcbiAqIGZ1bmN0aW9uYWwgYnV0IGVwaGVtZXJhbCBmb3IgdGhlIGV4dGVuc2lvbiBiYWNrZ3JvdW5kOiBpdCB3b3VsZCBoYXZlIHBhc3NlZFxuICogdGhlIHByb2JlIGFuZCB0aGVuIGxvc3QgdGhlIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gU286IG5vXG4gKiBwcmUtZXhpc3Rpbmcga2V5IG1lYW5zIG5vIGBpZGJgLCBhbmQgdGhlIGNhbGxlciBzZWVkcyBpbnN0ZWFkLlxuICpcbiAqIFJldHVybnMgbnVsbCAobmV2ZXIgdGhyb3dzKSB3aGVuIG5vdGhpbmcgdXNhYmxlIGlzIHRoZXJlLlxuICovXG5hc3luYyBmdW5jdGlvbiB0cnlJZGJEZXZpY2VLZXkoKSB7XG4gICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuIG51bGw7IC8vIGVtcHR5IHN0b3JlIFx1MjE5MiBzZWVkLCBkbyBOT1QgbWludCBoZXJlXG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhleGlzdGluZykpID8gZXhpc3RpbmcgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHN0b3JhZ2UgYXJlYSBiYWNraW5nIHRoZSBgc2VlZGAgc3RyYXRlZ3kuIEltcG9ydGVkIGxhemlseSBiZWNhdXNlXG4gKiBicm93c2VyLXBvbHlmaWxsIHRocm93cyBhdCBtb2R1bGUgbG9hZCB3aGVuIG5vIGV4dGVuc2lvbiBuYW1lc3BhY2UgZXhpc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWVkU3RvcmFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgcmV0dXJuIGFwaT8uc3RvcmFnZT8ubG9jYWwgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogU2lnbmFsIDI6IGEgV2ViS2l0IHVzZXIgYWdlbnQgd2l0aCBubyBDaHJvbWl1bSBtYXJrZXIgb24gaXQuICovXG5mdW5jdGlvbiBsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdWEgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgJyc7XG4gICAgICAgIHJldHVybiAvU2FmYXJpfEFwcGxlV2ViS2l0Ly50ZXN0KHVhKSAmJiAhL0Nocm9tKGV8aXVtKXxFZGdcXC98T1BSXFwvLy50ZXN0KHVhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcnVlIG9uIFNhZmFyaSAoaU9TICsgbWFjT1MpLCB3aGVyZSBJbmRleGVkREIgbXVzdCBORVZFUiBob2xkIHRoZSB3cmFwcGluZ1xuICoga2V5IFx1MjAxNCBzZWUgdGhlIG1vZHVsZSBoZWFkZXIncyBzdG9yYWdlLXNjb3BlIG5vdGUuXG4gKlxuICogRGV0ZWN0aW9uIGlzIG11bHRpLXNpZ25hbCBhbmQgQklBU0VEIFRPV0FSRCBTQUZBUkksIGJlY2F1c2UgdGhlIHR3byBlcnJvcnNcbiAqIGFyZSBub3Qgc3ltbWV0cmljOiBzZWVkaW5nIGEgQ2hyb21lIHZhdWx0IGNvc3RzIG5vdGhpbmcgKHNlZWQgaXMgYWxyZWFkeSB0aGVcbiAqIHN0cmF0ZWd5IGV2ZXJ5IGZyZXNoIGluc3RhbGwgbGFuZHMgb24pLCB3aGlsZSBhZG9wdGluZyBhbiBJREIga2V5IG9uIFNhZmFyaVxuICogaXMgdW5zYWZlLiBTbyBvbmx5IGEgUE9TSVRJVkVMWSBpZGVudGlmaWVkIENocm9tZS9GaXJlZm94IG9yaWdpbiBtYXkgYWRvcHQgYW5cbiAqIEluZGV4ZWREQiBrZXkgXHUyMDE0IGEgZ2V0VVJMIHRoYXQgaXMgbWlzc2luZywgdGhyb3dzLCByZXR1cm5zIGEgbm9uLXN0cmluZyxcbiAqIHJldHVybnMgJycgb3IgcmV0dXJucyBhIHNjaGVtZSB3ZSBkbyBub3QgcmVjb2duaXNlIGFsbCByZXNvbHZlIHRvIFNhZmFyaS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNTYWZhcmlFbmdpbmUoKSB7XG4gICAgbGV0IG9yaWdpbiA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaT8ucnVudGltZT8uZ2V0VVJMPy4oJycpO1xuICAgICAgICBvcmlnaW4gPSB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgfVxuICAgIC8vIFNpZ25hbCAxOiBhIHBvc2l0aXZlbHkgaWRlbnRpZmllZCBTYWZhcmkgb3JpZ2luLlxuICAgIGlmIChvcmlnaW4gJiYgb3JpZ2luLnN0YXJ0c1dpdGgoJ3NhZmFyaS13ZWItZXh0ZW5zaW9uOi8vJykpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAyOiBhIFdlYktpdC1vbmx5IFVBIG91dHJhbmtzIHRoZSBvcmlnaW4gXHUyMDE0IGEgU2FmYXJpIGJ1aWxkIHRoYXRcbiAgICAvLyByZXBvcnRlZCBhbiB1bmV4cGVjdGVkIG9yaWdpbiBzdGlsbCBtdXN0IG5vdCB0b3VjaCBJbmRleGVkREIuXG4gICAgaWYgKGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMzogb25seSB0aGVzZSB0d28gb3JpZ2lucyBlYXJuIHRoZSBJREIgYWRvcHQgcGF0aC5cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW4uc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8IG9yaWdpbi5zdGFydHNXaXRoKCdtb3otZXh0ZW5zaW9uOi8vJykpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7IC8vIGFtYmlndW91cyBcdTIxOTIgc2VlZFxufVxuXG4vKiogSW1wb3J0IHJhdyBzZWVkIGJ5dGVzIChiYXNlNjQpIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ00ga2V5LiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1wb3J0U2VlZEtleShzZWVkQjY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JywgYmFzZTY0VG9BYihzZWVkQjY0KSwgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZSBvbmNlIGltcG9ydGVkXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuLyoqIFJlYWQgdGhlIHN0aWNreSBzdHJhdGVneSByZWNvcmRlZCBieSBhIHByZXZpb3VzIHJlc29sdXRpb24gKG51bGwgaWYgbm9uZSkuICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3RpY2t5U3RyYXRlZ3koKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgcyA9IGdvdD8uW0RFVklDRV9TVFJBVEVHWV9LRVldO1xuICAgICAgICByZXR1cm4gKHMgPT09ICdpZGInIHx8IHMgPT09ICdzZWVkJykgPyBzIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogUmVjb3JkIHRoZSByZXNvbHZlZCBzdHJhdGVneSBzbyBsYXRlciBsb2FkcyBjYW5ub3Qgc2lsZW50bHkgZmxpcCBpdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlU3RpY2t5U3RyYXRlZ3koc3RyYXRlZ3kpIHtcbiAgICBpZiAoc3RyYXRlZ3kgIT09ICdpZGInICYmIHN0cmF0ZWd5ICE9PSAnc2VlZCcpIHJldHVybjsgLy8gJ21lbW9yeScgcGVyc2lzdHMgbm90aGluZ1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBzdHJhdGVneSB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmVzdCBlZmZvcnQgXHUyMDE0IHRoZSBzdHJhdGVneSBzdGlsbCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgKi8gfVxufVxuXG4vKiogU3RyYXRlZ3kgKGIpOiBhIHJhdyByYW5kb20gc2VlZCBpbiBzdG9yYWdlLmxvY2FsLCBpbXBvcnRlZCBub24tZXh0cmFjdGFibGUuICovXG5hc3luYyBmdW5jdGlvbiB0cnlTZWVkRGV2aWNlS2V5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgbGV0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgICAgIHNlZWQgPSBhYlRvQmFzZTY0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoREVWSUNFX1NFRURfQllURVMpKS5idWZmZXIpO1xuICAgICAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IHNlZWQgfSk7XG4gICAgICAgICAgICAvLyBWRVJJRlkgcGVyc2lzdGVuY2UgYmVmb3JlIGFueXRoaW5nIGlzIHdyYXBwZWQgdW5kZXIgaXQuXG4gICAgICAgICAgICBjb25zdCBjaGVjayA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3QgcGVyc2lzdGVkID0gY2hlY2s/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKHBlcnNpc3RlZCAhPT0gc2VlZCkge1xuICAgICAgICAgICAgICAgIC8vIEFub3RoZXIgY29udGV4dCAocG9wdXAgdnMgYmFja2dyb3VuZCBvbiBhIGZpcnN0IHJ1bikgbWludGVkXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdyb3RlIGl0cyBvd24gc2VlZCBiZXR3ZWVuIG91ciBzZXQoKSBhbmQgdGhpcyByZWFkLiBBRE9QVFxuICAgICAgICAgICAgICAgIC8vIFRIRSBXSU5ORVI6IGFueSBzZWVkIGFjdHVhbGx5IGluIHN0b3JhZ2UgaXMgZXhhY3RseSBhcyBnb29kIGFzXG4gICAgICAgICAgICAgICAgLy8gb3VycywgYW5kIGl0IGlzIHRoZSBvbmUgdGhlIG90aGVyIGNvbnRleHQgaXMgYWxyZWFkeSB3cmFwcGluZ1xuICAgICAgICAgICAgICAgIC8vIHVuZGVyLiBSZXR1cm5pbmcgbnVsbCBoZXJlIHdvdWxkIGRyb3AgdGhlIGNhbGxlciB0aHJvdWdoIHRvXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbW9yeSBrZXksIHdob3NlIGJsb2JzIGRpZSB3aXRoIHRoaXMgY29udGV4dCBcdTIwMTQgdGhlIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBsb3NzIHRoaXMgc3RyYXRlZ3kgZXhpc3RzIHRvIHByZXZlbnQuIE9ubHkgYSBnZW51aW5lbHkgYWJzZW50XG4gICAgICAgICAgICAgICAgLy8gb3IgdW51c2FibGUgdmFsdWUgaXMgYSBmYWlsdXJlLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGVyc2lzdGVkICE9PSAnc3RyaW5nJyB8fCBwZXJzaXN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWVkID0gcGVyc2lzdGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgKGNyZWF0aW5nIG9uIGZpcnN0IHVzZSkgdGhlIGRldmljZSB3cmFwIGtleS5cbiAqXG4gKiBSZXNvbHV0aW9uIG9yZGVyLCBvbmNlOiBob25vdXIgdGhlIHN0aWNreSBzdHJhdGVneSB0aGlzIGluc3RhbGwgYWxyZWFkeVxuICogcmVjb3JkZWQ7IG90aGVyd2lzZSBBRE9QVCBhIHByZS1leGlzdGluZyBJbmRleGVkREIga2V5IGlmIG9uZSBpcyB0aGVyZSwgYW5kXG4gKiBmYWlsaW5nIHRoYXQgc2VlZC4gV2hhdGV2ZXIgcmVzb2x2ZXMgaXMgd3JpdHRlbiBiYWNrIGFzIHRoZSBzdGlja3kgc3RyYXRlZ3kuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZXZpY2VLZXkoKSB7XG4gICAgaWYgKF9kZXZpY2VLZXlQcm9taXNlKSByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG4gICAgX2RldmljZUtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja3kgPSBhd2FpdCByZWFkU3RpY2t5U3RyYXRlZ3koKTtcblxuICAgICAgICAvLyBBIHZhdWx0IGFscmVhZHkgb24gYHNlZWRgIG5ldmVyIHJlLXByb2JlcyBJbmRleGVkREI6IGl0cyBibG9icyBhcmVcbiAgICAgICAgLy8gdW5kZXIgdGhlIHNlZWQga2V5LCBhbmQgYWRvcHRpbmcgYSBzdHJheSBJREIgaGFuZGxlIHdvdWxkIG9ycGhhbiB0aGVtLlxuICAgICAgICAvLyBPbiBTYWZhcmkgd2UgbmV2ZXIgV1JJVEUgdW5kZXIgYW4gSURCIGtleSBhdCBhbGwgKHNlZSBoZWFkZXIpOiBpdHNcbiAgICAgICAgLy8gcGVyLWVuZ2luZSBzdG9yYWdlIHNjb3BpbmcgbWFrZXMgYW4gYWRvcHRlZCBJREIgaGFuZGxlIHVuc2FmZSBhcyBhXG4gICAgICAgIC8vIHdyYXBwaW5nIGtleS4gRXhpc3RpbmcgSURCIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdFxuICAgICAgICAvLyBmYWxsYmFjayBhbmQgYXJlIHJlLXdyYXBwZWQgdW5kZXIgdGhlIHNlZWQgYnkgdGhlIGF0LXJlc3QgbWlncmF0aW9uLlxuICAgICAgICBpZiAoc3RpY2t5ICE9PSAnc2VlZCcgJiYgIShhd2FpdCBpc1NhZmFyaUVuZ2luZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgaWRiS2V5ID0gYXdhaXQgdHJ5SWRiRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBpZiAoaWRiS2V5KSB7XG4gICAgICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ2lkYic7XG4gICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnaWRiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkYktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCB0cnlTZWVkRGV2aWNlS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSB7XG4gICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnc2VlZCc7XG4gICAgICAgICAgICAvLyBBbHNvIGNvdmVycyB0aGUgZGVncmFkZSBjYXNlOiBzdGlja3kgd2FzICdpZGInIGJ1dCB0aGUgaGFuZGxlIGlzXG4gICAgICAgICAgICAvLyBnb25lLiBPbGQgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0IGZhbGxiYWNrIGJlbG93LlxuICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnc2VlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlZWRLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RoaW5nIHBlcnNpc3RzIGhlcmUuIEJldHRlciB0aGFuIHJlZnVzaW5nIHRvIGVuY3J5cHQsIGJ1dCBibG9ic1xuICAgICAgICAvLyB3cml0dGVuIHVuZGVyIHRoaXMga2V5IGRpZSB3aXRoIHRoZSBjb250ZXh0IFx1MjAxNCBzZWUgbW9kdWxlIGhlYWRlci5cbiAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ21lbW9yeSc7XG4gICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xufVxuXG4vKiogV2hpY2ggcGVyc2lzdGVuY2Ugc3RyYXRlZ3kgdGhlIGRldmljZSBrZXkgcmVzb2x2ZWQgdG8gKG51bGwgdW50aWwgcmVzb2x2ZWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZUtleVN0cmF0ZWd5KCkge1xuICAgIHJldHVybiBfZGV2aWNlU3RyYXRlZ3k7XG59XG5cbi8qKlxuICogRHJvcCBldmVyeSBtZW1vaXNlZCBkZXZpY2Uta2V5IGhhbmRsZS4gTVVTVCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYW55XG4gKiBgc3RvcmFnZS5jbGVhcigpYDogdGhlIHNlZWQgKGFuZCB0aGUgc3RpY2t5IHN0cmF0ZWd5KSBhcmUgZ29uZSBmcm9tIHN0b3JhZ2UsXG4gKiBzbyBhIGNhY2hlZCBwcm9taXNlIHdvdWxkIGtlZXAgaGFuZGluZyBvdXQgYSBrZXkgd2hvc2UgYmFja2luZyBtYXRlcmlhbCBub1xuICogbG9uZ2VyIGV4aXN0cyBcdTIwMTQgdGhlIG5leHQgZ2V0RGV2aWNlS2V5KCkgd291bGQgd3JhcCBzZWNyZXRzIHVuZGVyIGEga2V5IHRoYXRcbiAqIGRpZXMgd2l0aCB0aGlzIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldERldmljZUtleSgpIHtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDtcbiAgICBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGRldmljZSBrZXksIHVzZWQgb25seSBhcyBhXG4gKiBkZWNyeXB0IGZhbGxiYWNrIGZvciBibG9icyB3cml0dGVuIGJlZm9yZSB0aGlzIGNvbnRleHQgY2hhbmdlZCBzdHJhdGVneS5cbiAqIE5ldmVyIGNyZWF0ZXMgb25lLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRMZWdhY3lJZGJLZXkoKSB7XG4gICAgaWYgKF9sZWdhY3lJZGJLZXlQcm9taXNlKSByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIHRoZSBrZXkgYW4gRVhJU1RJTkcgYGRldmljZUtleVNlZWRgIGltcG9ydHMgdG8sIHVzZWQgb25seVxuICogYXMgYSBkZWNyeXB0IGZhbGxiYWNrLiBOZXZlciBtaW50cyBhIHNlZWQgKHRoYXQgaXMgdHJ5U2VlZERldmljZUtleSdzIGpvYikuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEV4aXN0aW5nU2VlZEtleSgpIHtcbiAgICBpZiAoX2V4aXN0aW5nU2VlZEtleVByb21pc2UpIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKCFzZWVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG59XG5cbi8qKlxuICogRXZlcnkgT1RIRVIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBoYXZlIHdyYXBwZWQgYSBkZXZpY2UgYmxvYiB1bmRlciwgaW5cbiAqIHByZWZlcmVuY2Ugb3JkZXIuIFN0cmF0ZWd5IGZsaXBzIChpZGJcdTIxOTJzZWVkIG9uIGRlZ3JhZGUsIHNlZWRcdTIxOTJpZGIgb24gYW5cbiAqIGFkb3B0ZWQgaGFuZGxlKSBtdXN0IG5ldmVyIG9ycGhhbiBhIGJsb2IsIHNvIHRoZSBmYWxsYmFjayBpcyBzeW1tZXRyaWM6IGFcbiAqIHNlZWQgYmxvYiBzdGF5cyByZWFkYWJsZSB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicgYW5kIHZpY2UgdmVyc2EuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZhbGxiYWNrRGV2aWNlS2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gW107XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ2lkYicpIHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gYXdhaXQgZ2V0TGVnYWN5SWRiS2V5KCk7XG4gICAgICAgIGlmIChsZWdhY3kpIGtleXMucHVzaChsZWdhY3kpO1xuICAgIH1cbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnc2VlZCcpIHtcbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IGdldEV4aXN0aW5nU2VlZEtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkga2V5cy5wdXNoKHNlZWRLZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2Igd2l0aCB0aGUgY3VycmVudCBrZXksIGZhbGxpbmcgYmFjayB0byBldmVyeSBvdGhlciBrZXlcbiAqIHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQuIFJldHVybnMgdGhlIHBsYWludGV4dCBwbHVzIHdoZXRoZXIgYSBmYWxsYmFjayBrZXlcbiAqIHdhcyBuZWVkZWQgKGkuZS4gdGhlIGJsb2IgaXMgc3RhbGUgYW5kIHdvcnRoIHJlLXdyYXBwaW5nKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSwgc3RhbGU6IGZhbHNlIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGZhbGxiYWNrIG9mIGF3YWl0IGZhbGxiYWNrRGV2aWNlS2V5cygpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGZhbGxiYWNrLCBpdiwgY2lwaGVydGV4dCksXG4gICAgICAgICAgICAgICAgICAgIHN0YWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogdHJ5IHRoZSBuZXh0IG9uZSAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTsgLy8gcmVwb3J0IHRoZSBDVVJSRU5UIGtleSdzIGZhaWx1cmUsIG5vdCB0aGUgbGFzdCBmYWxsYmFjaydzXG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgZW5jLmVuY29kZShwbGFpbnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdjogMSxcbiAgICAgICAgazogJ2RldmljZScsXG4gICAgICAgIGl2OiBhYlRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYWJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FiKGl2KSkgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBiYXNlNjRUb0FiKGNpcGhlcnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aERldmljZUtleShlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICAvLyBHQ00gYXV0aGVudGljYXRpb24gY2FuIGZhaWwgd2l0aCB0aGUgQ1VSUkVOVCBzdHJhdGVneSdzIGtleSBiZWNhdXNlIHRoZVxuICAgIC8vIGJsb2IgcHJlZGF0ZXMgYSBzdHJhdGVneSBjaGFuZ2UgKGEgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd2hvc2UgSURCIGhhbmRsZVxuICAgIC8vIGlzIHN0aWxsIHJlYWRhYmxlIHdoaWxlIHRoaXMgY29udGV4dCBzZXR0bGVkIG9uIHRoZSBzZWVkLCBvciB0aGUgcmV2ZXJzZSkuXG4gICAgLy8gVHJ5IGV2ZXJ5IGtleSB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkIGJlZm9yZSBkZWNsYXJpbmcgdGhlIHNlY3JldCBsb3N0LlxuICAgIGNvbnN0IHsgcGxhaW50ZXh0IH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHBsYWludGV4dDtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2IgYW5kLCB3aGVuIGl0IGNvdWxkIG9ubHkgYmUgcmVhZCB2aWEgYSBmYWxsYmFjayBrZXlcbiAqIChsZWdhY3kgSW5kZXhlZERCIGhhbmRsZSwgb3IgYW4gZXhpc3Rpbmcgc2VlZCB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicpLFxuICogaGFuZCBiYWNrIGEgcmVwbGFjZW1lbnQgYmxvYiB3cmFwcGVkIHVuZGVyIHRoZSBDVVJSRU5UIHN0cmF0ZWd5IHNvIHRoZSBjYWxsZXJcbiAqIGNhbiBwZXJzaXN0IHRoZSB1cGdyYWRlIG9wcG9ydHVuaXN0aWNhbGx5LlxuICogYHJld3JhcHBlZGAgaXMgbnVsbCB3aGVuIHRoZSBibG9iIGlzIGFscmVhZHkgY3VycmVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwKGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IHsgcGxhaW50ZXh0LCBzdGFsZSB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBsYWludGV4dCxcbiAgICAgICAgcmV3cmFwcGVkOiBzdGFsZSA/IGF3YWl0IGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkgOiBudWxsLFxuICAgIH07XG59XG5cbi8vIC0tLSBCbG9iIGNsYXNzaWZpY2F0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZnVuY3Rpb24gaXNQYXNzd29yZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5zYWx0ICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0ICYmIHAuayAhPT0gJ2RldmljZScpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLmsgPT09ICdkZXZpY2UnICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbi8qKiBUcnVlIGlmIHRoZSB2YWx1ZSBpcyBhbHJlYWR5IGNpcGhlcnRleHQgKGVpdGhlciB3cmFwcGluZykuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaXBoZXJ0ZXh0KHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB8fCBpc0RldmljZUtleUJsb2IodmFsdWUpO1xufVxuXG4vLyAtLS0gVW5pZmllZCB3cmFwIC8gdW53cmFwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBzZWNyZXQgZm9yIGF0LXJlc3Qgc3RvcmFnZS4gUHJlZmVycyB0aGUgcGFzc3dvcmQtZGVyaXZlZCBzZXNzaW9uXG4gKiBrZXkgd2hlbiBvbmUgaXMgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dCAoYmFja2dyb3VuZCwgdW5sb2NrZWQpOyBvdGhlcndpc2VcbiAqIGZhbGxzIGJhY2sgdG8gdGhlIGFsd2F5cy1hdmFpbGFibGUgZGV2aWNlIGtleS4gTmV2ZXIgcmV0dXJucyBwbGFpbnRleHQuXG4gKlxuICogVGhlIHRpZXIgaXMgdGhlcmVmb3JlIEFNQklFTlQgXHUyMDE0IGl0IGlzIHdoYXRldmVyIGBzZXRTZXNzaW9uS2V5YCAvIGBjbGVhclNlc3Npb25gXG4gKiBsYXN0IGRpZCBpbiB0aGlzIG1vZHVsZSwgd2hpY2ggbWF5IGhhdmUgYmVlbiBkb25lIGJ5IGEgZGlmZmVyZW50IGZpbGUuIE9ubHlcbiAqIGNhbGwgdGhpcyB3aGVyZSBlaXRoZXIgdGllciBpcyBnZW51aW5lbHkgYWNjZXB0YWJsZSAoYSB2YWx1ZSB0aGF0XG4gKiBgdW53cmFwU2VjcmV0YCBjYW4gb3BlbiB1bmRlciBib3RoKS4gQSBjYWxsZXIgdGhhdCBuZWVkcyBhIFNQRUNJRklDIHRpZXIgbXVzdFxuICogbmFtZSBpdDogYGVuY3J5cHRXaXRoRGV2aWNlS2V5YCBvciBgZW5jcnlwdFdpdGhLZXlgLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEBwYXJhbSB7e2V4dHJhY3RhYmxlPzogYm9vbGVhbn19IFtvcHRpb25zXSAtIGBleHRyYWN0YWJsZTogdHJ1ZWAgYWxsb3dzIHRoZVxuICogICAgICAgIHJhdyBieXRlcyB0byBiZSBleHBvcnRlZCBvbmNlIChzZWUgZXhwb3J0S2V5QmFzZTY0KS4gVXNlZCBieSB0aGVcbiAqICAgICAgICBiYWNrZ3JvdW5kIHdvcmtlciBzbyBhbiB1bmxvY2tlZCBzZXNzaW9uIGNhbiBiZSBwYXJrZWQgaW5cbiAqICAgICAgICBzdG9yYWdlLnNlc3Npb24gYW5kIGZ1bGx5IHJlc3RvcmVkIGFmdGVyIGFuIE1WMyBldmljdGlvbi4gRGVmYXVsdFxuICogICAgICAgIGZhbHNlOiB0aGUga2V5IGlzIG9wYXF1ZSBhbmQgY2Fubm90IGxlYXZlIHRoZSBjcnlwdG8gc3Vic3lzdGVtLlxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgICEhb3B0aW9ucy5leHRyYWN0YWJsZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKlxuICogRXhwb3J0IGFuIGV4dHJhY3RhYmxlIEFFUyBrZXkncyByYXcgYnl0ZXMgYXMgYmFzZTY0LlxuICogT25seSBldmVyIGNhbGxlZCBvbiBhIGtleSBkZXJpdmVkIHdpdGggYHsgZXh0cmFjdGFibGU6IHRydWUgfWAuXG4gKlxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gYmFzZTY0IHJhdyBrZXkgYnl0ZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleUJhc2U2NChrZXkpIHtcbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChhd2FpdCBjcnlwdG8uc3VidGxlLmV4cG9ydEtleSgncmF3Jywga2V5KSk7XG59XG5cbi8qKlxuICogSW1wb3J0IGJhc2U2NCByYXcgYnl0ZXMgYmFjayBpbnRvIGEgTk9OLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNIGtleS5cbiAqIFRoZSBjb3VudGVycGFydCBvZiBleHBvcnRLZXlCYXNlNjQ6IHdoYXRldmVyIHdlbnQgb3V0IGV4dHJhY3RhYmxlIGNvbWVzIGJhY2tcbiAqIG9wYXF1ZSwgc28gYSByZXN0b3JlZCBzZXNzaW9uIGtleSBjYW5ub3QgYmUgcmUtZXhwb3J0ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NCAtIHJhdyBrZXkgYnl0ZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlCYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKiBiYXNlNjQgXHUyMTk0IGJ5dGVzLCBleHBvcnRlZCBzbyBjYWxsZXJzIGNhbiByb3VuZC10cmlwIGEgc2FsdCB0aHJvdWdoIEpTT04uICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlcykge1xuICAgIC8vIGBuZXcgVWludDhBcnJheSh2aWV3KWAgaW5zaWRlIHRoZSBoZWxwZXIgY29waWVzIHRoZSBWSUVXLCBzbyBhIHNhbHQgdGhhdFxuICAgIC8vIGlzIGEgd2luZG93IGludG8gYSBsYXJnZXIgYnVmZmVyIHN0aWxsIGVuY29kZXMgY29ycmVjdGx5LlxuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ5dGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgKGlnbm9yZXMgdGhlIHNhbHQgZW1iZWRkZWQgaW4gdGhlXG4gKiBibG9iIFx1MjAxNCB0aGUgY2FsbGVyIG11c3Qgc3VwcGx5IGEga2V5IHRoYXQgbWF0Y2hlcyBob3cgdGhlIGJsb2Igd2FzIGVuY3J5cHRlZCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKS9lbmNyeXB0V2l0aEtleSgpXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAtIEFFUy0yNTYtR0NNIGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhLZXkoZW5jcnlwdGVkRGF0YSwga2V5KSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGhhc2gsIHN0b3JlZEhhc2gpO1xufVxuXG4vKipcbiAqIENvbnN0YW50LXRpbWUgY29tcGFyaXNvbiBvZiB0d28gYmFzZTY0LWVuY29kZWQgYnl0ZSBzdHJpbmdzLlxuICpcbiAqIERlY29kZXMgYm90aCB0byByYXcgYnl0ZXMgYW5kIGNvbXBhcmVzIHdpdGggYW4gYWNjdW11bGF0b3Igc28gdGhlIHJ1bm5pbmdcbiAqIHRpbWUgZG9lcyBub3QgZGVwZW5kIG9uIHdoZXJlIHRoZSBmaXJzdCBtaXNtYXRjaCBvY2N1cnMgXHUyMDE0IHRoaXMgYXZvaWRzIHRoZVxuICogdGltaW5nIHNpZGUtY2hhbm5lbCBvZiBhIHBsYWluIGA9PT1gIHN0cmluZyBjb21wYXJlIChUaWVyLTMgY3J5cHRvLmpzOjIxMykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChhLCBiKSB7XG4gICAgbGV0IGJhLCBiYjtcbiAgICB0cnkge1xuICAgICAgICBiYSA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYSkpO1xuICAgICAgICBiYiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYikpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgdGhlIG1heCBsZW5ndGggc28gbGVuZ3RoIGRpZmZlcmVuY2VzIGRvbid0IHNob3J0LWNpcmN1aXQgZWFybHkuXG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgoYmEubGVuZ3RoLCBiYi5sZW5ndGgpO1xuICAgIGxldCBkaWZmID0gYmEubGVuZ3RoIF4gYmIubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGlmZiB8PSAoYmFbaV0gfHwgMCkgXiAoYmJbaV0gfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkaWZmID09PSAwO1xufVxuIiwgIi8qKlxuICogYnVua2VyOi8vIGNvbm5lY3Rpb24gc3RyaW5ncy4gTm8gaW1wb3J0cywgc28gYW55dGhpbmcgdGhhdCBoYW5kbGVzIHByb2ZpbGVzXG4gKiBjYW4gdXNlIHRoaXMgd2l0aG91dCBsb2FkaW5nIHRoZSByZWxheSBjb2RlLlxuICpcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5cbi8qKlxuICogUGFyc2UgYSBidW5rZXI6Ly8gY29ubmVjdGlvbiBzdHJpbmdcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdW5rZXJVcmwodXJsKSB7XG4gICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnYnVua2VyOi8vJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgY29uc3QgcmVtb3RlUHVia2V5ID0gcGFyc2VkLmhvc3RuYW1lIHx8IHBhcnNlZC5wYXRobmFtZS5yZXBsYWNlKCcvLycsICcnKTtcblxuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBwdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5cyA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0QWxsKCdyZWxheScpO1xuICAgIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSByZWxheSBVUkxzXG4gICAgZm9yIChjb25zdCByZWxheSBvZiByZWxheXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgVVJMKHJlbGF5KTtcbiAgICAgICAgICAgIGlmIChyLnByb3RvY29sICE9PSAnd3NzOicgJiYgci5wcm90b2NvbCAhPT0gJ3dzOicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVsYXkgcHJvdG9jb2w6ICR7ci5wcm90b2NvbH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlbGF5IFVSTDogJHtyZWxheX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNlY3JldCA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0KCdzZWNyZXQnKSB8fCBudWxsO1xuXG4gICAgcmV0dXJuIHsgcmVtb3RlUHVia2V5LCByZWxheXMsIHNlY3JldCB9O1xufVxuXG4vKipcbiAqIEEgcmVsYXkgdmFsdWUgd2l0aG91dCBjcmVkZW50aWFsczogbm8gdXNlcmluZm8sIG5vIGBzZWNyZXRgIHBhcmFtLCBubyBmcmFnbWVudC5cbiAqIE90aGVyIHF1ZXJ5IHBhcmFtcyBzdGF5LiBBIHZhbHVlIHdpdGggbm9uZSBvZiB0aG9zZSBjb21lcyBiYWNrIHVuY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gY2xlYW5SZWxheShyZWxheSkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVsYXkpO1xuICAgIGNvbnN0IG5hbWVzID0gWy4uLnVybC5zZWFyY2hQYXJhbXMua2V5cygpXS5maWx0ZXIobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWNyZXQnKTtcbiAgICBpZiAoIXVybC51c2VybmFtZSAmJiAhdXJsLnBhc3N3b3JkICYmICF1cmwuaGFzaCAmJiBuYW1lcy5sZW5ndGggPT09IDApIHJldHVybiByZWxheTtcbiAgICB1cmwudXNlcm5hbWUgPSAnJztcbiAgICB1cmwucGFzc3dvcmQgPSAnJztcbiAgICB1cmwuaGFzaCA9ICcnO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUobmFtZSk7XG4gICAgcmV0dXJuIHVybC5ocmVmO1xufVxuXG4vKipcbiAqIERvZXMgdGhpcyBjb25uZWN0aW9uIHN0cmluZyBjYXJyeSBhIHNlY3JldCByZWRhY3RCdW5rZXJVcmwgd291bGQgcmVtb3ZlLCBpbiBpdHNcbiAqIGBzZWNyZXRgIHBhcmFtIG9yIGluc2lkZSBhIHJlbGF5IHZhbHVlPyBOZXZlciB0aHJvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJVcmxIYXNTZWNyZXQodXJsKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZWNyZXQsIHJlbGF5cyB9ID0gcGFyc2VCdW5rZXJVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuICEhc2VjcmV0IHx8IHJlbGF5cy5zb21lKHJlbGF5ID0+IGNsZWFuUmVsYXkocmVsYXkpICE9PSByZWxheSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmNvbnN0IGVuY29kZVJlbGF5ID0gKHJlbGF5KSA9PlxuICAgIGVuY29kZVVSSUNvbXBvbmVudChyZWxheSkucmVwbGFjZSgvJTNBL2csICc6JykucmVwbGFjZSgvJTJGL2csICcvJyk7XG5cbi8qKlxuICogVGhlIHNpZ25lcidzIGFkZHJlc3MgYWxvbmU6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PS4uLiZyZWxheT0uLi5cbiAqIFJlYnVpbHQgZnJvbSB0aGUgcGFyc2VkIGZpZWxkcywgc28gb2YgdGhlIGNvbm5lY3Rpb24gc3RyaW5nIG9ubHkgdGhlIHB1YmtleSBhbmRcbiAqIHRoZSByZWxheSB2YWx1ZXMgc3Vydml2ZS4gRWFjaCByZWxheSB2YWx1ZSBsb3NlcyBpdHMgdXNlcmluZm8sIGBzZWNyZXRgIHBhcmFtXG4gKiBhbmQgZnJhZ21lbnQsIGFuZCBrZWVwcyBhbnkgb3RoZXIgcXVlcnkgcGFyYW1zIGl0IGhhcy5cbiAqXG4gKiBAcGFyYW0geyp9IHVybCBhIGNvbm5lY3Rpb24gc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgYWRkcmVzcywgb3IgJycgaWYgYHVybGAgaXMgbm90IGEgdmFsaWQgY29ubmVjdGlvbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdEJ1bmtlclVybCh1cmwpIHtcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IHBhcnNlQnVua2VyVXJsKHVybCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY29uc3QgcmVsYXlzID0gcGFyc2VkLnJlbGF5cy5tYXAocmVsYXkgPT4gYHJlbGF5PSR7ZW5jb2RlUmVsYXkoY2xlYW5SZWxheShyZWxheSkpfWApLmpvaW4oJyYnKTtcbiAgICByZXR1cm4gYGJ1bmtlcjovLyR7cGFyc2VkLnJlbW90ZVB1YmtleX0/JHtyZWxheXN9YDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBwcm9maWxlIGxpc3Qgd2l0aCBlYWNoIGJ1bmtlclVybCByZWR1Y2VkIHRvIGl0cyBhZGRyZXNzLlxuICpcbiAqIEBwYXJhbSB7Kn0gcHJvZmlsZXMgYSBwcm9maWxlIGxpc3Q7IGFueXRoaW5nIGVsc2UgaXMgcmV0dXJuZWQgYXMgaXQgaXNcbiAqIEByZXR1cm5zIHRoZSBzYW1lIGxpc3Qgd2hlbiBub3RoaW5nIG5lZWRlZCBjaGFuZ2luZywgc28gYSBjYWxsZXIgY2FuIHNraXAgYVxuICogICAgICAgICAgd3JpdGUgYnkgY29tcGFyaW5nIHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuIHByb2ZpbGVzO1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgY2xlYW4gPSBwcm9maWxlcy5tYXAoKHByb2ZpbGUpID0+IHtcbiAgICAgICAgaWYgKCFwcm9maWxlPy5idW5rZXJVcmwpIHJldHVybiBwcm9maWxlO1xuICAgICAgICBjb25zdCBidW5rZXJVcmwgPSByZWRhY3RCdW5rZXJVcmwocHJvZmlsZS5idW5rZXJVcmwpO1xuICAgICAgICBpZiAoYnVua2VyVXJsID09PSBwcm9maWxlLmJ1bmtlclVybCkgcmV0dXJuIHByb2ZpbGU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4geyAuLi5wcm9maWxlLCBidW5rZXJVcmwgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2hhbmdlZCA/IGNsZWFuIDogcHJvZmlsZXM7XG59XG5cbi8qKlxuICogU3RvcmVkIHNlc3Npb25zIGFyZSBrZXllZCBieSBwcm9maWxlIHBvc2l0aW9uLiBSZW1vdmluZyBhIHByb2ZpbGUgdGFrZXMgaXRzXG4gKiBzZXNzaW9uIHdpdGggaXQgYW5kIG1vdmVzIGxhdGVyIHNlc3Npb25zIGRvd24gd2l0aCB0aGVpciBwcm9maWxlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsICo+fSBidW5rZXJTZXNzaW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IHJlbW92ZWRJbmRleFxuICogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyU2Vzc2lvbnNBZnRlckRlbGV0ZShidW5rZXJTZXNzaW9ucywgcmVtb3ZlZEluZGV4KSB7XG4gICAgY29uc3Qgc2hpZnRlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBpZiAoaW5kZXggPT09IHJlbW92ZWRJbmRleCkgY29udGludWU7XG4gICAgICAgIHNoaWZ0ZWRbaW5kZXggPiByZW1vdmVkSW5kZXggPyBpbmRleCAtIDEgOiBpbmRleF0gPSBzZXNzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gc2hpZnRlZDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSwgZm9yIGFueSBjaGFuZ2Ugb2YgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCAqPn0gYnVua2VyU2Vzc2lvbnNcbiAqIEBwYXJhbSB7QXJyYXk8W251bWJlciwgP251bWJlcl0+fSBtb3ZlcyBlYWNoIHByb2ZpbGUgdGhhdCBtb3ZlZCwgYW5kIHRvIHdoZXJlOyBudWxsIGlmIGdvbmVcbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcyhidW5rZXJTZXNzaW9ucywgbW92ZXMpIHtcbiAgICBjb25zdCBtb3ZlZCA9IG5ldyBNYXAobW92ZXMpO1xuICAgIGNvbnN0IHBsYWNlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBjb25zdCB0byA9IG1vdmVkLmhhcyhpbmRleCkgPyBtb3ZlZC5nZXQoaW5kZXgpIDogaW5kZXg7XG4gICAgICAgIGlmICh0byAhPT0gbnVsbCkgcGxhY2VkW3RvXSA9IHNlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBwbGFjZWQ7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUNBLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBOURBLE1BZ0JNLFVBYUEsVUF1Q0E7QUFwRU47QUFBQTtBQUFBO0FBZ0JBLE1BQU0s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
