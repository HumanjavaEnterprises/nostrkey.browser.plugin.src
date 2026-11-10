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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3ZhdWx0L3ZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL25pcDc4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdmF1bHQtc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1lcmdlLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc2VjcmV0LXZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY3J5cHRvLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnVua2VyLXVybC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3Byb2ZpbGVzLXN0b3JlLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnNlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE1WMyBpbi1tZW1vcnkgYXJlYSB0aGF0IHN1cnZpdmVzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uIGJ1dCBuZXZlciB0b3VjaGVzXG4gICAgLy8gZGlzay4gTnVsbCBvbiBlbmdpbmVzIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGl0IChTYWZhcmkgYmFja2dyb3VuZCBwYWdlLFxuICAgIC8vIG9sZGVyIEZpcmVmb3gpIFx1MjAxNCBjYWxsZXJzIG11c3QgZmVhdHVyZS1kZXRlY3QgYW5kIGZhbGwgYmFjay5cbiAgICBzZXNzaW9uOiBfYnJvd3Nlci5zdG9yYWdlPy5zZXNzaW9uID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdGhlIGFyZWEgdG8gZXh0ZW5zaW9uLXByaXZpbGVnZWQgY29udGV4dHMuIENocm9tZS1vbmx5O1xuICAgICAgICAgKiByZXNvbHZlcyBoYXJtbGVzc2x5IHdoZXJlIHRoZSBtZXRob2QgaXMgYWJzZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWNjZXNzTGV2ZWwoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgYXNrR2F0ZSwgc3RhcnRQYWdlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhZ2UtZ2F0ZSc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHsgQVBJX0tFWVNfUEFUSCB9IGZyb20gJy4uL3V0aWxpdGllcy9uaXA3OCc7XG5pbXBvcnQge1xuICAgIGdldFZhdWx0SW5kZXgsXG4gICAgZ2V0RG9jdW1lbnQsXG4gICAgc2F2ZURvY3VtZW50TG9jYWwsXG4gICAgZGVsZXRlRG9jdW1lbnRMb2NhbCxcbiAgICBsaXN0RG9jdW1lbnRzLFxuICAgIHVwZGF0ZVN5bmNTdGF0dXMsXG4gICAgZ2V0RGVsZXRlZERvY3MsXG59IGZyb20gJy4uL3V0aWxpdGllcy92YXVsdC1zdG9yZSc7XG5pbXBvcnQgeyBtZXJnZVJlbW90ZSB9IGZyb20gJy4uL3V0aWxpdGllcy9zeW5jLW1lcmdlJztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZG9jdW1lbnRzOiBbXSxcbiAgICBzZWFyY2hRdWVyeTogJycsXG4gICAgc2VsZWN0ZWRQYXRoOiBudWxsLFxuICAgIGVkaXRvclRpdGxlOiAnJyxcbiAgICBlZGl0b3JDb250ZW50OiAnJyxcbiAgICBwcmlzdGluZVRpdGxlOiAnJyxcbiAgICBwcmlzdGluZUNvbnRlbnQ6ICcnLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgaXNOZXc6IGZhbHNlLFxuICAgIHRvYXN0OiAnJyxcbiAgICByZWxheUluZm86IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9LFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGhhc1JlbGF5cygpIHtcbiAgICByZXR1cm4gc3RhdGUucmVsYXlJbmZvLnJlYWQubGVuZ3RoID4gMCB8fCBzdGF0ZS5yZWxheUluZm8ud3JpdGUubGVuZ3RoID4gMDtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyZWREb2N1bWVudHMoKSB7XG4gICAgaWYgKCFzdGF0ZS5zZWFyY2hRdWVyeSkgcmV0dXJuIHN0YXRlLmRvY3VtZW50cztcbiAgICBjb25zdCBxID0gc3RhdGUuc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gc3RhdGUuZG9jdW1lbnRzLmZpbHRlcihkID0+IGQucGF0aC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpKTtcbn1cblxuZnVuY3Rpb24gaXNEaXJ0eSgpIHtcbiAgICByZXR1cm4gc3RhdGUuZWRpdG9yQ29udGVudCAhPT0gc3RhdGUucHJpc3RpbmVDb250ZW50IHx8IHN0YXRlLmVkaXRvclRpdGxlICE9PSBzdGF0ZS5wcmlzdGluZVRpdGxlO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuICdsZWQtLWdyZWVuJztcbiAgICBpZiAoc3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnbGVkLS1hbWJlciBsZWQtcHVsc2UnO1xuICAgIHJldHVybiAnbGVkLS1yZWQnO1xufVxuXG5mdW5jdGlvbiBzeW5jU3RhdHVzVGV4dCgpIHtcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ1N5bmNpbmcuLi4nO1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnZXJyb3InKSByZXR1cm4gc3RhdGUuc3luY0Vycm9yO1xuICAgIHJldHVybiAnU3luY2VkJztcbn1cblxuZnVuY3Rpb24gZG9jU3luY0NsYXNzKHN5bmNTdGF0dXMpIHtcbiAgICBpZiAoc3luY1N0YXR1cyA9PT0gJ3N5bmNlZCcpIHJldHVybiAnbGVkLS1ncmVlbic7XG4gICAgaWYgKHN5bmNTdGF0dXMgPT09ICdsb2NhbC1vbmx5JykgcmV0dXJuICdsZWQtLWFtYmVyJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBkb2NDb3VudCA9ICQoJ2RvYy1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGxlZCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKTtcbiAgICBpZiAoZG9jQ291bnQpIGRvY0NvdW50LnRleHRDb250ZW50ID0gc3RhdGUuZG9jdW1lbnRzLmxlbmd0aCArICcgZG9jJyArIChzdGF0ZS5kb2N1bWVudHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpO1xuXG4gICAgLy8gRmlsZSBsaXN0XG4gICAgY29uc3QgZmlsZUxpc3QgPSAkKCdmaWxlLWxpc3QnKTtcbiAgICBjb25zdCBlbXB0eU1zZyA9ICQoJ25vLWRvY3VtZW50cycpO1xuICAgIGNvbnN0IGZpbHRlcmVkID0gZ2V0RmlsdGVyZWREb2N1bWVudHMoKTtcblxuICAgIGlmIChmaWxlTGlzdCkge1xuICAgICAgICBmaWxlTGlzdC5pbm5lckhUTUwgPSBmaWx0ZXJlZC5tYXAoZG9jID0+IGBcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzcz1cImRvYy1pdGVtICR7c3RhdGUuc2VsZWN0ZWRQYXRoID09PSBkb2MucGF0aCA/ICdzZWxlY3RlZCcgOiAnJ31cIlxuICAgICAgICAgICAgICAgIGRhdGEtZG9jLXBhdGg9XCIke2RvYy5wYXRofVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRvYy1wYXRoIG1vbm8gaW5zLXRydW5jYXRlXCI+JHtkb2MucGF0aH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZG9jLXN5bmMgbGVkLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGVkICR7ZG9jLnVuZGVjcnlwdGFibGUgPyAnbGVkLS1yZWQnIDogZG9jU3luY0NsYXNzKGRvYy5zeW5jU3RhdHVzKX1cIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibW9ub1wiPiR7ZG9jLnVuZGVjcnlwdGFibGUgPyAndW5kZWNyeXB0YWJsZScgOiBkb2Muc3luY1N0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYCkuam9pbignJyk7XG5cbiAgICAgICAgZmlsZUxpc3QucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZG9jLXBhdGhdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNlbGVjdERvY3VtZW50KGVsLmRhdGFzZXQuZG9jUGF0aCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVtcHR5TXNnKSBlbXB0eU1zZy5zdHlsZS5kaXNwbGF5ID0gZmlsdGVyZWQubGVuZ3RoID09PSAwID8gJ2Jsb2NrJyA6ICdub25lJztcblxuICAgIC8vIEVkaXRvclxuICAgIGNvbnN0IGVkaXRvclBhbmVsID0gJCgnZWRpdG9yLXBhbmVsJyk7XG4gICAgY29uc3QgZWRpdG9yRW1wdHkgPSAkKCdlZGl0b3ItZW1wdHknKTtcbiAgICBjb25zdCBzaG93RWRpdG9yID0gc3RhdGUuc2VsZWN0ZWRQYXRoICE9PSBudWxsIHx8IHN0YXRlLmlzTmV3O1xuXG4gICAgaWYgKGVkaXRvclBhbmVsKSBlZGl0b3JQYW5lbC5zdHlsZS5kaXNwbGF5ID0gc2hvd0VkaXRvciA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKGVkaXRvckVtcHR5KSBlZGl0b3JFbXB0eS5zdHlsZS5kaXNwbGF5ID0gc2hvd0VkaXRvciA/ICdub25lJyA6ICdibG9jayc7XG5cbiAgICBpZiAoc2hvd0VkaXRvcikge1xuICAgICAgICBjb25zdCB0aXRsZUlucHV0ID0gJCgnZWRpdG9yLXRpdGxlJyk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRBcmVhID0gJCgnZWRpdG9yLWNvbnRlbnQnKTtcbiAgICAgICAgY29uc3Qgc2F2ZUJ0biA9ICQoJ3NhdmUtZG9jLWJ0bicpO1xuICAgICAgICBjb25zdCBkZWxldGVCdG4gPSAkKCdkZWxldGUtZG9jLWJ0bicpO1xuICAgICAgICBjb25zdCBkaXJ0eUxhYmVsID0gJCgnZGlydHktbGFiZWwnKTtcblxuICAgICAgICBpZiAodGl0bGVJbnB1dCkgdGl0bGVJbnB1dC52YWx1ZSA9IHN0YXRlLmVkaXRvclRpdGxlO1xuICAgICAgICBpZiAoY29udGVudEFyZWEpIGNvbnRlbnRBcmVhLnZhbHVlID0gc3RhdGUuZWRpdG9yQ29udGVudDtcbiAgICAgICAgaWYgKHNhdmVCdG4pIHtcbiAgICAgICAgICAgIHNhdmVCdG4uZGlzYWJsZWQgPSBzdGF0ZS5zYXZpbmcgfHwgc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIHNhdmVCdG4udGV4dENvbnRlbnQgPSBzdGF0ZS5zYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsZXRlQnRuKSBkZWxldGVCdG4uc3R5bGUuZGlzcGxheSA9IHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gbnVsbCAmJiAhc3RhdGUuaXNOZXcgPyAnaW5saW5lLWZsZXgnIDogJ25vbmUnO1xuICAgICAgICBpZiAoZGlydHlMYWJlbCkgZGlydHlMYWJlbC5zdHlsZS5kaXNwbGF5ID0gaXNEaXJ0eSgpID8gJ2lubGluZScgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoXG4gICAgY29uc3Qgc2VhcmNoSW5wdXQgPSAkKCdzZWFyY2gtaW5wdXQnKTtcbiAgICBpZiAoc2VhcmNoSW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgc2VhcmNoSW5wdXQudmFsdWUgPSBzdGF0ZS5zZWFyY2hRdWVyeTtcbiAgICB9XG5cbiAgICAvLyBUb2FzdFxuICAgIGNvbnN0IHRvYXN0ID0gJCgndG9hc3QnKTtcbiAgICBpZiAodG9hc3QpIHtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBzdGF0ZS50b2FzdDtcbiAgICAgICAgdG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLnRvYXN0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG5ld0RvY3VtZW50KCkge1xuICAgIHN0YXRlLmlzTmV3ID0gdHJ1ZTtcbiAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gJyc7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSAnJztcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VsZWN0RG9jdW1lbnQocGF0aCkge1xuICAgIGNvbnN0IGRvYyA9IGF3YWl0IGdldERvY3VtZW50KHBhdGgpO1xuICAgIGlmICghZG9jKSByZXR1cm47XG4gICAgaWYgKGRvYy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIC8vIE9wZW5pbmcgaXQgd291bGQgc2hvdyBhbiBlbXB0eSBlZGl0b3IgYW5kIHRoZSBuZXh0IFNhdmUgd291bGQgd3JpdGVcbiAgICAgICAgLy8gdGhhdCBlbXB0aW5lc3Mgb3ZlciB0aGUgc3RvcmVkIGNpcGhlcnRleHQuIFJlZnVzZSwgYW5kIHNheSB3aHkuXG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBub3RlIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgb24gdGhpcyBkZXZpY2UgXHUyMDE0IGxlZnQgdW50b3VjaGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgIHN0YXRlLnNlbGVjdGVkUGF0aCA9IHBhdGg7XG4gICAgc3RhdGUuZWRpdG9yVGl0bGUgPSBkb2MucGF0aDtcbiAgICBzdGF0ZS5lZGl0b3JDb250ZW50ID0gZG9jLmNvbnRlbnQ7XG4gICAgc3RhdGUucHJpc3RpbmVUaXRsZSA9IGRvYy5wYXRoO1xuICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlRG9jdW1lbnQoKSB7XG4gICAgY29uc3QgdGl0bGUgPSBzdGF0ZS5lZGl0b3JUaXRsZS50cmltKCk7XG4gICAgaWYgKCF0aXRsZSkgcmV0dXJuO1xuICAgIGlmICh0aXRsZSA9PT0gQVBJX0tFWVNfUEFUSCkge1xuICAgICAgICBzaG93VG9hc3QoJ05vc3RyS2V5IGtlZXBzIHRoaXMgbmFtZSBmb3IgaXRzZWxmLiBDaG9vc2UgYW5vdGhlciB0aXRsZS4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAndmF1bHQucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IHBhdGg6IHRpdGxlLCBjb250ZW50OiBzdGF0ZS5lZGl0b3JDb250ZW50IH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkUGF0aCAmJiBzdGF0ZS5zZWxlY3RlZFBhdGggIT09IHRpdGxlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbChzdGF0ZS5zZWxlY3RlZFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwodGl0bGUsIHN0YXRlLmVkaXRvckNvbnRlbnQsICdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgc2hvd1RvYXN0KCdTYXZlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwodGl0bGUsIHN0YXRlLmVkaXRvckNvbnRlbnQsICdsb2NhbC1vbmx5Jyk7XG4gICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRQYXRoICYmIHN0YXRlLnNlbGVjdGVkUGF0aCAhPT0gdGl0bGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHN0YXRlLnNlbGVjdGVkUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFBhdGggPSB0aXRsZTtcbiAgICAgICAgICAgIHN0YXRlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSBzdGF0ZS5lZGl0b3JDb250ZW50O1xuICAgICAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgc2hvd1RvYXN0KCdTYXZlZCBsb2NhbGx5IChyZWxheSBlcnJvcjogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSArICcpJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKHN0YXRlLmVkaXRvclRpdGxlLnRyaW0oKSwgc3RhdGUuZWRpdG9yQ29udGVudCwgJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gc3RhdGUuZWRpdG9yVGl0bGUudHJpbSgpO1xuICAgICAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5wcmlzdGluZVRpdGxlID0gc3RhdGUuZWRpdG9yVGl0bGU7XG4gICAgICAgIHN0YXRlLnByaXN0aW5lQ29udGVudCA9IHN0YXRlLmVkaXRvckNvbnRlbnQ7XG4gICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgc2hvd1RvYXN0KCdTYXZlZCBsb2NhbGx5IChvZmZsaW5lKScpO1xuICAgIH1cblxuICAgIHN0YXRlLnNhdmluZyA9IGZhbHNlO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVEb2N1bWVudCgpIHtcbiAgICBpZiAoIXN0YXRlLnNlbGVjdGVkUGF0aCkgcmV0dXJuO1xuICAgIGlmICghKGF3YWl0IGluc0NvbmZpcm0oeyB0aXRsZTogYERlbGV0ZSBcIiR7c3RhdGUuc2VsZWN0ZWRQYXRofVwiP2AsIGJvZHk6ICdUaGUgZG9jdW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHlvdXIgdmF1bHQgYW5kLCBpZiBwdWJsaXNoZWQsIGEgZGVsZXRlIHJlcXVlc3QgaXMgc2VudCB0byB5b3VyIHJlbGF5cy4nLCBjb25maXJtTGFiZWw6ICdEZWxldGUgZG9jdW1lbnQnLCBkZXN0cnVjdGl2ZTogdHJ1ZSB9KSkpIHJldHVybjtcblxuICAgIGNvbnN0IGRvYyA9IGF3YWl0IGdldERvY3VtZW50KHN0YXRlLnNlbGVjdGVkUGF0aCk7XG5cbiAgICBpZiAoZG9jPy5ldmVudElkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAga2luZDogJ3ZhdWx0LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgcGF5bG9hZDogeyBwYXRoOiBzdGF0ZS5zZWxlY3RlZFBhdGgsIGV2ZW50SWQ6IGRvYy5ldmVudElkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoXykge31cbiAgICB9XG5cbiAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHN0YXRlLnNlbGVjdGVkUGF0aCk7XG4gICAgc3RhdGUuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICBzdGF0ZS5pc05ldyA9IGZhbHNlO1xuICAgIHN0YXRlLmVkaXRvclRpdGxlID0gJyc7XG4gICAgc3RhdGUuZWRpdG9yQ29udGVudCA9ICcnO1xuICAgIHN0YXRlLnByaXN0aW5lVGl0bGUgPSAnJztcbiAgICBzdGF0ZS5wcmlzdGluZUNvbnRlbnQgPSAnJztcbiAgICBzdGF0ZS5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG4gICAgc2hvd1RvYXN0KCdEZWxldGVkJyk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNBbGwoKSB7XG4gICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdzeW5jaW5nJztcbiAgICBzdGF0ZS5zeW5jRXJyb3IgPSAnJztcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGhlbGQgPSBhd2FpdCBnZXRWYXVsdEluZGV4KCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5mZXRjaCcsIHBheWxvYWQ6IHsgcGF0aHM6IE9iamVjdC5rZXlzKGhlbGQpIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgZG9jdW1lbnQgZGVsZXRlZCBvbiBhbm90aGVyIGRldmljZSAoaXRzIG93biBzaWduZWQga2luZCA1IG9uIHRoZVxuICAgICAgICAvLyByZWxheSkgaXMgcmVtb3ZlZCBoZXJlIHRvbywgdW5sZXNzIHRoaXMgZGV2aWNlIGhhcyBhbiB1bnNlbnQgZWRpdFxuICAgICAgICAvLyBvciBob2xkcyBhIGNvcHkgbmV3ZXIgdGhhbiB0aGUgZGVsZXRpb24uXG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHRzXSBvZiBPYmplY3QuZW50cmllcyhyZXN1bHQuZGVsZXRlZCB8fCB7fSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsID0gaGVsZFtwYXRoXTtcbiAgICAgICAgICAgIGlmICghbG9jYWwgfHwgbG9jYWwuc3luY1N0YXR1cyA9PT0gJ2xvY2FsLW9ubHknKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICgobG9jYWwucmVsYXlDcmVhdGVkQXQgfHwgMCkgPiB0cykgY29udGludWU7XG4gICAgICAgICAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHBhdGgsIHRzKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggPT09IHBhdGgpIHN0YXRlLnNlbGVjdGVkUGF0aCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2NhbERvY3MgPSBhd2FpdCBnZXRWYXVsdEluZGV4KCk7XG4gICAgICAgIC8vIEEgZG9jdW1lbnQgZGVsZXRlZCBoZXJlIHN0YXlzIGRlbGV0ZWQ6IGRyb3AgYW55IHJlbGF5IGNvcHkgZGF0ZWQgYXRcbiAgICAgICAgLy8gb3IgYmVmb3JlIGl0cyBsb2NhbCBkZWxldGlvbi5cbiAgICAgICAgY29uc3QgcmVtb3RlQnlQYXRoID0ge307XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIHJlc3VsdC5kb2N1bWVudHMpIHJlbW90ZUJ5UGF0aFtkb2MucGF0aF0gPSBkb2M7XG4gICAgICAgIGNvbnN0IHsgbWVyZ2VkOiByZW1vdGVEb2NzIH0gPSBtZXJnZVJlbW90ZSh7fSwgcmVtb3RlQnlQYXRoLCBhd2FpdCBnZXREZWxldGVkRG9jcygpLCB7XG4gICAgICAgICAgICB0aW1lT2Y6IChkKSA9PiBkLmNyZWF0ZWRBdCB8fCAwLFxuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGNvbnN0IHJlbW90ZSBvZiBPYmplY3QudmFsdWVzKHJlbW90ZURvY3MpKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbCA9IGxvY2FsRG9jc1tyZW1vdGUucGF0aF07XG5cbiAgICAgICAgICAgIGlmICghbG9jYWwpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChyZW1vdGUucGF0aCwgcmVtb3RlLmNvbnRlbnQsICdzeW5jZWQnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnN5bmNTdGF0dXMgPT09ICdsb2NhbC1vbmx5Jykge1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbC5jb250ZW50ICE9PSByZW1vdGUuY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB1cGRhdGVTeW5jU3RhdHVzKHJlbW90ZS5wYXRoLCAnY29uZmxpY3QnLCByZW1vdGUuZXZlbnRJZCwgcmVtb3RlLmNyZWF0ZWRBdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghbG9jYWwucmVsYXlDcmVhdGVkQXQgfHwgcmVtb3RlLmNyZWF0ZWRBdCA+IGxvY2FsLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2F2ZURvY3VtZW50TG9jYWwocmVtb3RlLnBhdGgsIHJlbW90ZS5jb250ZW50LCAnc3luY2VkJywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFBhdGggPT09IHJlbW90ZS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSByZW1vdGUuY29udGVudDtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUucHJpc3RpbmVDb250ZW50ID0gcmVtb3RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgICQoJ25ldy1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmV3RG9jdW1lbnQpO1xuICAgICQoJ3N5bmMtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3luY0FsbCk7XG4gICAgJCgnc2F2ZS1kb2MtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZURvY3VtZW50KTtcbiAgICAkKCdkZWxldGUtZG9jLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZURvY3VtZW50KTtcblxuICAgICQoJ3NlYXJjaC1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnNlYXJjaFF1ZXJ5ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnZWRpdG9yLXRpdGxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZWRpdG9yVGl0bGUgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdlZGl0b3ItY29udGVudCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmVkaXRvckNvbnRlbnQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gR2F0ZTogcmVxdWlyZSBtYXN0ZXIgcGFzc3dvcmQgYmVmb3JlIGFsbG93aW5nIHZhdWx0IGFjY2Vzc1xuICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gYXdhaXQgYXNrR2F0ZSgnaXNFbmNyeXB0ZWQnKTtcbiAgICBjb25zdCBnYXRlID0gJCgndmF1bHQtbG9ja2VkLWdhdGUnKTtcbiAgICBjb25zdCBtYWluID0gJCgndmF1bHQtbWFpbi1jb250ZW50Jyk7XG5cbiAgICBpZiAoIWlzRW5jcnlwdGVkKSB7XG4gICAgICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAkKCdnYXRlLXNlY3VyaXR5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IGFwaS5ydW50aW1lLmdldFVSTCgnc2VjdXJpdHkvc2VjdXJpdHkuaHRtbCcpO1xuICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnbm9zdHJrZXktb3B0aW9ucycpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZWxheXMgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd2YXVsdC5nZXRSZWxheXMnIH0pO1xuICAgICAgICBzdGF0ZS5yZWxheUluZm8gPSByZWxheXMgfHwgeyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1t2YXVsdF0gRmFpbGVkIHRvIGxvYWQgcmVsYXlzOicsIGUubWVzc2FnZSk7XG4gICAgICAgIHN0YXRlLnJlbGF5SW5mbyA9IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t2YXVsdF0gRmFpbGVkIHRvIGxvYWQgZG9jdW1lbnRzOicsIGUubWVzc2FnZSk7XG4gICAgICAgIHN0YXRlLmRvY3VtZW50cyA9IFtdO1xuICAgIH1cblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIGlmIChoYXNSZWxheXMoKSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1t2YXVsdF0gU3luYyBmYWlsZWQ6JywgZS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHN0YXJ0UGFnZShpbml0KSk7XG4iLCAiLyoqXG4gKiBUaGUgcXVlc3Rpb25zIGEgcGFnZSBhc2tzIHRoZSB3b3JrZXIgYmVmb3JlIGl0IGNhbiBkcmF3IGFueXRoaW5nLiBUaGUgd29ya2VyXG4gKiBjYW4gYW5zd2VyIHRoZW0gd2l0aCBhIHJlZnVzYWwgb2JqZWN0LCBhbmQgYW4gb2JqZWN0IGlzIHRydXRoeSwgc28gYSBwYWdlIHRoYXRcbiAqIHJlYWRzIGl0IGFzIGEgeWVzIHNob3dzIHRoZSB3cm9uZyBzY3JlZW4uIFBhZ2VzIGFzayB0aHJvdWdoIGFza0dhdGUgaW5zdGVhZDpcbiAqIGEgcmVmdXNhbCByZXBsYWNlcyB0aGUgcGFnZSB3aXRoIGEgcGxhaW4gbWVzc2FnZSBhbmQgc3RvcHMgaXRzIHN0YXJ0LXVwLlxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmV4cG9ydCBjb25zdCBTVEFSVF9FUlJPUiA9ICdOb3N0cktleSBjb3VsZCBub3Qgc3RhcnQgdGhpcyBwYWdlLiBSZWxvYWQgb3IgcmVpbnN0YWxsLic7XG5cbmV4cG9ydCBjbGFzcyBHYXRlUmVmdXNlZCBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZnVzZWQoYW5zd2VyKSB7XG4gICAgcmV0dXJuICEhYW5zd2VyICYmIHR5cGVvZiBhbnN3ZXIgPT09ICdvYmplY3QnICYmIGFuc3dlci5zdWNjZXNzID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdGFydEVycm9yKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYWxlcnQnKTtcbiAgICBtZXNzYWdlLmRhdGFzZXQuc3RhcnRFcnJvciA9ICcnO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBTVEFSVF9FUlJPUjtcbiAgICBtZXNzYWdlLnN0eWxlLnBhZGRpbmcgPSAnMTZweCc7XG4gICAgZG9jdW1lbnQuYm9keS5yZXBsYWNlQ2hpbGRyZW4obWVzc2FnZSk7XG59XG5cbi8qKiBBc2sgdGhlIHdvcmtlci4gT24gYSByZWZ1c2FsLCBzaG93IHRoZSBtZXNzYWdlIGFuZCB0aHJvdyBHYXRlUmVmdXNlZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc2tHYXRlKGtpbmQpIHtcbiAgICBjb25zdCBhbnN3ZXIgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQgfSk7XG4gICAgaWYgKGlzUmVmdXNlZChhbnN3ZXIpKSB7XG4gICAgICAgIHNob3dTdGFydEVycm9yKCk7XG4gICAgICAgIHRocm93IG5ldyBHYXRlUmVmdXNlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gYW5zd2VyO1xufVxuXG4vLyBBdCBtb3N0IG9uZSBub3RlIGluIHRoaXMgdGltZSwgaG93ZXZlciBidXN5IHRoZSBwZXJzb24gaXMuXG5jb25zdCBBQ1RJVklUWV9OT1RFX01TID0gMzBfMDAwO1xuXG4vKipcbiAqIFVzaW5nIG9uZSBvZiBOb3N0cktleSdzIG93biBwYWdlcyBjb3VudHMgYXMgYWN0aXZpdHkgZm9yIGF1dG8tbG9jaywgYXMgZG9lc1xuICogYW5zd2VyaW5nIGEgcmVxdWVzdC4gU2l0ZSByZXF1ZXN0cywgZXZlbiBvbmVzIHNpZ25lZCB1bmRlciBhIHJlbWVtYmVyZWRcbiAqIGdyYW50LCBuZXZlciBjb3VudC5cbiAqL1xuZnVuY3Rpb24gd2F0Y2hBY3Rpdml0eSgpIHtcbiAgICBsZXQgbGFzdE5vdGUgPSAwO1xuICAgIGNvbnN0IG5vdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdE5vdGUgPCBBQ1RJVklUWV9OT1RFX01TKSByZXR1cm47XG4gICAgICAgIGxhc3ROb3RlID0gRGF0ZS5ub3coKTtcbiAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncmVzZXRBdXRvTG9jaycgfSk/LmNhdGNoPy4oKCkgPT4ge30pO1xuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBub3RlLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5vdGUsIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cblxuLyoqIFJ1biBhIHBhZ2UncyBzdGFydC11cC4gQSByZWZ1c2FsIGhhcyBhbHJlYWR5IGJlZW4gc2hvd24sIHNvIGl0IGVuZHMgaGVyZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydFBhZ2UoaW5pdCkge1xuICAgIHdhdGNoQWN0aXZpdHkoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBpbml0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgR2F0ZVJlZnVzZWQpKSB0aHJvdyBlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiLyoqXG4gKiBOSVAtNzggRW5jcnlwdGVkIFZhdWx0IFByb3RvY29sXG4gKlxuICogUHVyZSBmdW5jdGlvbnMgZm9yIGJ1aWxkaW5nL3BhcnNpbmcga2luZCAzMDA3OCAocGFyYW1ldGVyaXplZCByZXBsYWNlYWJsZSlcbiAqIGV2ZW50cyB1c2VkIGFzIGFuIGVuY3J5cHRlZCBtYXJrZG93biBkb2N1bWVudCB2YXVsdC5cbiAqXG4gKiBkLXRhZyBwcmVmaXggXCJub3N0cmtleTpcIiBuYW1lc3BhY2VzIG91ciB2YXVsdCBpdGVtcyBmcm9tIG90aGVyIE5JUC03OCBhcHBzLlxuICogUmVsYXlzIHNlZSBmaWxlIHBhdGhzIGJ1dCBub3QgY29udGVudCAoTklQLTQ0IGVuY3J5cHRlZCB0byBzZWxmKS5cbiAqL1xuXG5jb25zdCBLSU5EX0FQUF9EQVRBID0gMzAwNzg7XG5jb25zdCBLSU5EX0RFTEVUSU9OID0gNTtcbmNvbnN0IERUQUdfUFJFRklYID0gJ25vc3Rya2V5Oic7XG5jb25zdCBDTElFTlRfVEFHID0gJ25vc3Rya2V5JztcblxuLyoqIFRoZSBwYXRoIHRoZSBBUEkga2V5IHN0b3JlIHVzZXMuIEl0IGlzIG5ldmVyIGEgdmF1bHQgZG9jdW1lbnQuICovXG5leHBvcnQgY29uc3QgQVBJX0tFWVNfUEFUSCA9ICd2YXVsdC9hcGkta2V5cyc7XG5cbi8qKlxuICogQnVpbGQgYW4gdW5zaWduZWQga2luZCAzMDA3OCB2YXVsdCBldmVudC5cbiAqIENhbGxlciBtdXN0IHNpZ24gKGZpbmFsaXplRXZlbnQgb3IgYnVua2VyIHNlc3Npb24uc2lnbkV2ZW50KS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIERvY3VtZW50IHBhdGggKGUuZy4gXCJub3Rlcy90b2RvLm1kXCIpXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkQ29udGVudCAtIE5JUC00NCBlbmNyeXB0ZWQgY29udGVudCBzdHJpbmdcbiAqIEByZXR1cm5zIHtvYmplY3R9IFVuc2lnbmVkIGV2ZW50IHRlbXBsYXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFZhdWx0RXZlbnQocGF0aCwgZW5jcnlwdGVkQ29udGVudCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGtpbmQ6IEtJTkRfQVBQX0RBVEEsXG4gICAgICAgIGNvbnRlbnQ6IGVuY3J5cHRlZENvbnRlbnQsXG4gICAgICAgIHRhZ3M6IFtcbiAgICAgICAgICAgIFsnZCcsIGAke0RUQUdfUFJFRklYfSR7cGF0aH1gXSxcbiAgICAgICAgICAgIFsnY2xpZW50JywgQ0xJRU5UX1RBR10sXG4gICAgICAgIF0sXG4gICAgICAgIGNyZWF0ZWRfYXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxuICAgIH07XG59XG5cbi8qKlxuICogQnVpbGQgYW4gdW5zaWduZWQga2luZCA1IGRlbGV0aW9uIGV2ZW50IChOSVAtMDkpIGZvciBhIHZhdWx0IGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudElkIC0gVGhlIGV2ZW50IGlkIHRvIGRlbGV0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBEb2N1bWVudCBwYXRoIChmb3IgdGhlIGEtdGFnIHJlZmVyZW5jZSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJrZXkgLSBBdXRob3IgaGV4IHB1YmtleSAocGFydCBvZiB0aGUgTklQLTA5IGEtdGFnIGFkZHJlc3MpXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBVbnNpZ25lZCBkZWxldGlvbiBldmVudCB0ZW1wbGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRWYXVsdERlbGV0aW9uKGV2ZW50SWQsIHBhdGgsIHB1YmtleSkge1xuICAgIGlmICh0eXBlb2YgcHVia2V5ICE9PSAnc3RyaW5nJyB8fCAhL15bMC05YS1mXXs2NH0kLy50ZXN0KHB1YmtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdidWlsZFZhdWx0RGVsZXRpb24gcmVxdWlyZXMgdGhlIGF1dGhvciBwdWJrZXknKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2luZDogS0lORF9ERUxFVElPTixcbiAgICAgICAgY29udGVudDogJ3ZhdWx0IGRvY3VtZW50IGRlbGV0ZWQnLFxuICAgICAgICB0YWdzOiBbXG4gICAgICAgICAgICBbJ2UnLCBldmVudElkXSxcbiAgICAgICAgICAgIFsnYScsIGAke0tJTkRfQVBQX0RBVEF9OiR7cHVia2V5fToke0RUQUdfUFJFRklYfSR7cGF0aH1gXSxcbiAgICAgICAgXSxcbiAgICAgICAgY3JlYXRlZF9hdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFJFUSBmaWx0ZXIgZm9yIGZldGNoaW5nIGFsbCB2YXVsdCBkb2N1bWVudHMgZm9yIGEgcHVia2V5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJrZXkgLSBIZXggcHVibGljIGtleVxuICogQHJldHVybnMge29iamVjdH0gTm9zdHIgUkVRIGZpbHRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRWYXVsdEZpbHRlcihwdWJrZXkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBraW5kczogW0tJTkRfQVBQX0RBVEFdLFxuICAgICAgICBhdXRob3JzOiBbcHVia2V5XSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFBhcnNlIGEga2luZCAzMDA3OCBldmVudCBpbnRvIGEgdmF1bHQgZG9jdW1lbnQgZGVzY3JpcHRvci5cbiAqIFJldHVybnMgbnVsbCBpZiB0aGUgZXZlbnQgaXMgbm90IGEgbm9zdHJrZXkgdmF1bHQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gTm9zdHIgZXZlbnRcbiAqIEByZXR1cm5zIHt7IHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nLCBjcmVhdGVkQXQ6IG51bWJlciwgZXZlbnRJZDogc3RyaW5nIH0gfCBudWxsfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VWYXVsdEV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmtpbmQgIT09IEtJTkRfQVBQX0RBVEEpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZFRhZyA9IGV2ZW50LnRhZ3M/LmZpbmQodCA9PiB0WzBdID09PSAnZCcpO1xuICAgIGlmICghZFRhZyB8fCAhZFRhZ1sxXT8uc3RhcnRzV2l0aChEVEFHX1BSRUZJWCkpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgcGF0aCA9IGRUYWdbMV0uc2xpY2UoRFRBR19QUkVGSVgubGVuZ3RoKTtcbiAgICBpZiAoIXBhdGgpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aCxcbiAgICAgICAgY29udGVudDogZXZlbnQuY29udGVudCxcbiAgICAgICAgY3JlYXRlZEF0OiBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgICBldmVudElkOiBldmVudC5pZCxcbiAgICB9O1xufVxuXG4vKiogVGhlIGQtdGFnIGEgdmF1bHQgcGF0aCBpcyBzdG9yZWQgdW5kZXIuICovXG5leHBvcnQgZnVuY3Rpb24gdmF1bHREdGFnKHBhdGgpIHtcbiAgICByZXR1cm4gYCR7RFRBR19QUkVGSVh9JHtwYXRofWA7XG59XG4iLCAiLyoqXG4gKiBWYXVsdCBTdG9yZSBcdTIwMTQgTG9jYWwgY2FjaGUgZm9yIGVuY3J5cHRlZCB2YXVsdCBkb2N1bWVudHNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIHZhdWx0RG9jczoge1xuICogICAgIFwicGF0aC90by9maWxlLm1kXCI6IHtcbiAqICAgICAgIHBhdGgsIGNvbnRlbnQsIHVwZGF0ZWRBdCwgc3luY1N0YXR1cywgZXZlbnRJZCwgcmVsYXlDcmVhdGVkQXQsXG4gKiAgICAgICBwcm9maWxlU2NvcGVcbiAqICAgICB9XG4gKiAgIH1cbiAqXG4gKiBzeW5jU3RhdHVzOiBcInN5bmNlZFwiIHwgXCJsb2NhbC1vbmx5XCIgfCBcImNvbmZsaWN0XCJcbiAqIHByb2ZpbGVTY29wZTogbnVsbCAoYWxsIHByb2ZpbGVzKSB8IG51bWJlcltdIChzcGVjaWZpYyBwcm9maWxlIGluZGljZXMpXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IHNjaGVkdWxlU3luY1B1c2ggfSBmcm9tICcuL3N5bmMtbWFuYWdlcic7XG5pbXBvcnQgeyB3cmFwU2VjcmV0LCB1bndyYXBTZWNyZXQgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5pbXBvcnQgeyBBUElfS0VZU19QQVRIIH0gZnJvbSAnLi9uaXA3OCc7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmNvbnN0IFNUT1JBR0VfS0VZID0gJ3ZhdWx0RG9jcyc7XG4vLyBEZWxldGlvbiB0b21ic3RvbmVzIGtleWVkIGJ5IHBhdGggKGlzc3VlICMzKTogeyA8cGF0aD46IGRlbGV0ZWRBdFNlY29uZHMgfS5cbmNvbnN0IERFTEVURURfS0VZID0gJ2RlbGV0ZWREb2NzJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlbGV0ZWREb2NzKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtERUxFVEVEX0tFWV06IHt9IH0pO1xuICAgIHJldHVybiBkYXRhW0RFTEVURURfS0VZXSAmJiB0eXBlb2YgZGF0YVtERUxFVEVEX0tFWV0gPT09ICdvYmplY3QnID8gZGF0YVtERUxFVEVEX0tFWV0gOiB7fTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RG9jcygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbU1RPUkFHRV9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtTVE9SQUdFX0tFWV0gfHwge307XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRvY3VtZW50J3MgYGNvbnRlbnRgIGZvciBjYWxsZXJzLiBSZS10aHJvd3MgbG9jayBlcnJvcnMgc28gYSBsb2NrZWRcbiAqIHNlc3Npb24gY2Fubm90IHJlYWQgbm90ZXMgKEY2KS5cbiAqXG4gKiBBIGdlbnVpbmUgZGVjcnlwdCBmYWlsdXJlIChlLmcuIGEgdmFsdWUgc3luY2VkIGZyb20gYW5vdGhlciBkZXZpY2UsIG9yIGEgYmxvYlxuICogd2hvc2Ugd3JhcHBpbmcga2V5IHJvdGF0ZWQgYXdheSkgaXMgcmVwb3J0ZWQgYXMgYHVuZGVjcnlwdGFibGU6IHRydWVgIHdpdGhcbiAqIGBjb250ZW50OiBudWxsYCBcdTIwMTQgTk9UIGFzIGFuIGVtcHR5IHN0cmluZy4gRW1wdHkgY29udGVudCBpcyBpbmRpc3Rpbmd1aXNoYWJsZVxuICogZnJvbSBhIHJlYWwgZW1wdHkgbm90ZTogdGhlIGVkaXRvciBvcGVuZWQgaXQgYmxhbmssIGFuZCB0aGUgbmV4dCBTYXZlIHdyb3RlXG4gKiB0aGF0IGJsYW5rIG92ZXIgdGhlIHVzZXIncyBvbmx5IGNvcHkuIGBudWxsYCArIHRoZSBmbGFnIGxldHMgY2FsbGVycyByZWZ1c2VcbiAqIHRvIG9wZW4gb3Igb3ZlcndyaXRlIGl0LCBhbmQgbGVhdmVzIHRoZSBjaXBoZXJ0ZXh0IGF0IHJlc3QgdW50b3VjaGVkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RG9jKGRvYykge1xuICAgIGlmICghZG9jKSByZXR1cm4gZG9jO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IC4uLmRvYywgY29udGVudDogYXdhaXQgdW53cmFwU2VjcmV0KGRvYy5jb250ZW50KSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKFN0cmluZyhlLm1lc3NhZ2UgfHwgJycpLnN0YXJ0c1dpdGgoJ2xvY2tlZCcpKSB0aHJvdyBlO1xuICAgICAgICByZXR1cm4geyAuLi5kb2MsIGNvbnRlbnQ6IG51bGwsIHVuZGVjcnlwdGFibGU6IHRydWUgfTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldERvY3MoZG9jcykge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcyB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBmdWxsIHZhdWx0IGRvY3Mgb2JqZWN0LlxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gTWFwIG9mIHBhdGggLT4gZG9jXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWYXVsdEluZGV4KCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgY29uc3Qgb3V0ID0ge307XG4gICAgZm9yIChjb25zdCBbcGF0aCwgZG9jXSBvZiBPYmplY3QuZW50cmllcyhkb2NzKSkge1xuICAgICAgICBvdXRbcGF0aF0gPSBhd2FpdCBkZWNyeXB0RG9jKGRvYyk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0IGEgc2luZ2xlIGRvY3VtZW50IGJ5IHBhdGggKGNvbnRlbnQgZGVjcnlwdGVkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3R8bnVsbD59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREb2N1bWVudChwYXRoKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICByZXR1cm4gZG9jc1twYXRoXSA/IGRlY3J5cHREb2MoZG9jc1twYXRoXSkgOiBudWxsO1xufVxuXG4vKipcbiAqIFNhdmUgb3IgdXBkYXRlIGEgZG9jdW1lbnQgaW4gdGhlIGxvY2FsIGNhY2hlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZURvY3VtZW50TG9jYWwocGF0aCwgY29udGVudCwgc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBkb2NzW3BhdGhdO1xuICAgIGRvY3NbcGF0aF0gPSB7XG4gICAgICAgIHBhdGgsXG4gICAgICAgIGNvbnRlbnQ6IGF3YWl0IHdyYXBTZWNyZXQoY29udGVudCksIC8vIFQwLTQ6IGVuY3J5cHQgbm90ZSBib2R5IGF0IHJlc3RcbiAgICAgICAgdXBkYXRlZEF0OiBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSxcbiAgICAgICAgc3luY1N0YXR1cyxcbiAgICAgICAgZXZlbnRJZCxcbiAgICAgICAgcmVsYXlDcmVhdGVkQXQsXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgLy8gUmVjcmVhdGUgY2xlYXJzIGFueSB0b21ic3RvbmUgZm9yIHRoaXMgcGF0aCAoaXNzdWUgIzMpLCBzbyB0aGUgZnJlc2hseVxuICAgIC8vIHNhdmVkIGRvYyBpcyBubyBsb25nZXIgc3VwcHJlc3NlZCBmcm9tIHRoZSBzeW5jIHBheWxvYWQuXG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWREb2NzKCk7XG4gICAgaWYgKGRlbGV0ZWRbcGF0aF0gIT0gbnVsbCkge1xuICAgICAgICBkZWxldGUgZGVsZXRlZFtwYXRoXTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBkb2NzLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogZG9jcyB9KTtcbiAgICB9XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIHJldHVybiBkZWNyeXB0RG9jKGRvY3NbcGF0aF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhIGRvY3VtZW50IGZyb20gdGhlIGxvY2FsIGNhY2hlIGFuZCByZWNvcmQgYSB0b21ic3RvbmUgKGlzc3VlICMzKSBzb1xuICogdGhlIGRlbGV0aW9uIHByb3BhZ2F0ZXMgdGhyb3VnaCBzdG9yYWdlLnN5bmMgYW5kIGEgc3RhbGUgY29weSBvbiBhbm90aGVyXG4gKiBkZXZpY2UgY2Fubm90IHJlc3VycmVjdCBpdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZURvY3VtZW50TG9jYWwocGF0aCwgZGVsZXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgZGVsZXRlIGRvY3NbcGF0aF07XG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWREb2NzKCk7XG4gICAgY29uc3QgYXQgPSBOdW1iZXIuaXNGaW5pdGUoZGVsZXRlZEF0KSA/IGRlbGV0ZWRBdCA6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIGlmIChkZWxldGVkW3BhdGhdID09IG51bGwgfHwgYXQgPiBkZWxldGVkW3BhdGhdKSBkZWxldGVkW3BhdGhdID0gYXQ7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBkb2NzLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBMaXN0IGFsbCBkb2N1bWVudHMgc29ydGVkIGJ5IHVwZGF0ZWRBdCBkZXNjZW5kaW5nLlxuICogQHJldHVybnMge1Byb21pc2U8QXJyYXk+fSBTb3J0ZWQgYXJyYXkgb2YgZG9jIG1ldGFkYXRhXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0RG9jdW1lbnRzKCkge1xuICAgIGNvbnN0IGRvY3MgPSBhd2FpdCBnZXREb2NzKCk7XG4gICAgY29uc3QgZGVjcnlwdGVkID0gW107XG4gICAgZm9yIChjb25zdCBkb2Mgb2YgT2JqZWN0LnZhbHVlcyhkb2NzKSkge1xuICAgICAgICBpZiAoZG9jPy5wYXRoID09PSBBUElfS0VZU19QQVRIKSBjb250aW51ZTtcbiAgICAgICAgZGVjcnlwdGVkLnB1c2goYXdhaXQgZGVjcnlwdERvYyhkb2MpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRlZC5zb3J0KChhLCBiKSA9PiBiLnVwZGF0ZWRBdCAtIGEudXBkYXRlZEF0KTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIHN5bmMgc3RhdHVzIChhbmQgb3B0aW9uYWxseSBldmVudElkL3JlbGF5Q3JlYXRlZEF0KSBmb3IgYSBkb2N1bWVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVN5bmNTdGF0dXMocGF0aCwgc3RhdHVzLCBldmVudElkID0gbnVsbCwgcmVsYXlDcmVhdGVkQXQgPSBudWxsKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBpZiAoIWRvY3NbcGF0aF0pIHJldHVybiBudWxsO1xuICAgIGRvY3NbcGF0aF0uc3luY1N0YXR1cyA9IHN0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgZG9jc1twYXRoXS5ldmVudElkID0gZXZlbnRJZDtcbiAgICBpZiAocmVsYXlDcmVhdGVkQXQgIT09IG51bGwpIGRvY3NbcGF0aF0ucmVsYXlDcmVhdGVkQXQgPSByZWxheUNyZWF0ZWRBdDtcbiAgICBhd2FpdCBzZXREb2NzKGRvY3MpO1xuICAgIHJldHVybiBkb2NzW3BhdGhdO1xufVxuIiwgIi8qKlxuICogU3luYyBNYW5hZ2VyIFx1MjAxNCBQbGF0Zm9ybSBzeW5jIHZpYSBzdG9yYWdlLnN5bmMgKENocm9tZSBcdTIxOTIgR29vZ2xlLCBTYWZhcmkgXHUyMTkyIGlDbG91ZClcbiAqXG4gKiBBcmNoaXRlY3R1cmU6XG4gKiAgIFdyaXRlOiBhcHAgXHUyMTkyIHN0b3JhZ2UubG9jYWwgXHUyMTkyIHNjaGVkdWxlU3luY1B1c2goKSBcdTIxOTIgc3RvcmFnZS5zeW5jXG4gKiAgIFJlYWQ6ICBwdWxsRnJvbVN5bmMoKSBvbiBzdGFydHVwIFx1MjE5MiBtZXJnZSBpbnRvIHN0b3JhZ2UubG9jYWxcbiAqICAgTGlzdGVuOiBzdG9yYWdlLm9uQ2hhbmdlZChcInN5bmNcIikgXHUyMTkyIG1lcmdlIHJlbW90ZSBjaGFuZ2VzIGludG8gbG9jYWxcbiAqXG4gKiBzdG9yYWdlLmxvY2FsIHJlbWFpbnMgdGhlIHNvdXJjZSBvZiB0cnV0aC4gc3RvcmFnZS5zeW5jIGlzIGEgYmVzdC1lZmZvcnQgbWlycm9yLlxuICovXG5cbmltcG9ydCB7IG1lcmdlUmVtb3RlIH0gZnJvbSAnLi9zeW5jLW1lcmdlJztcbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBpc0NpcGhlcnRleHQsIGlzUGFzc3dvcmRCbG9iIH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuaW1wb3J0IHsgYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzLCByZWRhY3RQcm9maWxlcyB9IGZyb20gJy4vYnVua2VyLXVybC5qcyc7XG5pbXBvcnQgeyB3aXRoUHJvZmlsZXNMb2NrIH0gZnJvbSAnLi9wcm9maWxlcy1zdG9yZS5qcyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29uc3RhbnRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IFNZTkNfUVVPVEEgPSAxMDJfNDAwOyAgICAgICAvLyAxMDAgS0IgdG90YWxcbmNvbnN0IE1BWF9JVEVNID0gOF8xOTI7ICAgICAgICAgICAvLyA4IEtCIHBlciBpdGVtXG5jb25zdCBNQVhfSVRFTVMgPSA1MTI7XG5jb25zdCBDSFVOS19QUkVGSVggPSAnX2NodW5rOic7XG5jb25zdCBTWU5DX01FVEFfS0VZID0gJ19zeW5jX21ldGEnO1xuY29uc3QgTE9DQUxfRU5BQkxFRF9LRVkgPSAncGxhdGZvcm1TeW5jRW5hYmxlZCc7XG5cbi8vIFByaW9yaXR5IHRpZXJzIGZvciBidWRnZXQgYWxsb2NhdGlvblxuY29uc3QgUFJJT1JJVFkgPSB7XG4gICAgLy8gVG9tYnN0b25lcyAoZGVsZXRpb24gcmVjb3JkcykgZ2V0IHRoZSBndWFyYW50ZWVkIHRvcCBzbG90OiBhIGRlbGV0aW9uIG11c3RcbiAgICAvLyBuZXZlciBsb3NlIGl0cyBidWRnZXQgcmFjZSB0byBidWxreSB2YXVsdCBjb250ZW50LCBvciB0aGUgZGVsZXRlZCBpdGVtXG4gICAgLy8gcmVzdXJyZWN0cyBvbiB0aGUgbmV4dCBkZXZpY2UgdGhhdCBzdGlsbCBoYXMgYSBzdGFsZSBjb3B5IChpc3N1ZSAjMykuXG4gICAgUDBfVE9NQlNUT05FUzogMCxcbiAgICBQMV9QUk9GSUxFUzogMSxcbiAgICBQMl9TRVRUSU5HUzogMixcbiAgICBQM19BUElLRVlTOiAzLFxuICAgIFA0X1ZBVUxUOiA0LFxufTtcblxuLy8gV2FybmluZyB0aHJlc2hvbGRzIGZvciByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5ICh0b21ic3RvbmVzIGFyZSBrZXB0XG4vLyBmb3JldmVyIHNvIGFuIG9mZmxpbmUgZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBhYm91dCBhIGRlbGV0aW9uIGNhbm5vdFxuLy8gcmVzdXJyZWN0IHRoZSBpdGVtIFx1MjAxNCB0aGUgY291bnQgb25seSBncm93cywgc28gbnVkZ2UgdGhlIHVzZXIgdG8gdHJpbSBpdCkuXG5jb25zdCBUT01CU1RPTkVfV0FSTl9HRU5UTEUgPSA4O1xuY29uc3QgVE9NQlNUT05FX1dBUk5fU1RST05HID0gMTY7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmxldCBwdXNoVGltZXIgPSBudWxsO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENodW5raW5nIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNwbGl0IGEgSlNPTi1zZXJpYWxpc2VkIHZhbHVlIGludG8gPD04S0IgY2h1bmtzLlxuICogUmV0dXJucyBhbiBhcnJheSBvZiB7IGtleSwgdmFsdWUgfSBwYWlycyByZWFkeSBmb3Igc3RvcmFnZS5zeW5jLnNldCgpLlxuICovXG5mdW5jdGlvbiBjaHVua1ZhbHVlKGtleSwganNvblN0cmluZykge1xuICAgIGNvbnN0IGNodW5rcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwganNvblN0cmluZy5sZW5ndGg7IGkgKz0gTUFYX0lURU0gLSAxMDApIHtcbiAgICAgICAgLy8gUmVzZXJ2ZSB+MTAwIGJ5dGVzIGZvciB0aGUga2V5IG92ZXJoZWFkIGluIHRoZSBzdG9yZWQgaXRlbVxuICAgICAgICBjaHVua3MucHVzaChqc29uU3RyaW5nLnNsaWNlKGksIGkgKyBNQVhfSVRFTSAtIDEwMCkpO1xuICAgIH1cbiAgICBpZiAoY2h1bmtzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBGaXRzIGluIGEgc2luZ2xlIGl0ZW0gXHUyMDE0IHN0b3JlIGRpcmVjdGx5XG4gICAgICAgIHJldHVybiBbeyBrZXksIHZhbHVlOiBqc29uU3RyaW5nIH1dO1xuICAgIH1cbiAgICAvLyBNdWx0aXBsZSBjaHVua3NcbiAgICBjb25zdCBlbnRyaWVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBgJHtDSFVOS19QUkVGSVh9JHtrZXl9OiR7aX1gLCB2YWx1ZTogY2h1bmtzW2ldIH0pO1xuICAgIH1cbiAgICAvLyBTdG9yZSBhIG1ldGFkYXRhIGVudHJ5IHNvIHdlIGtub3cgaG93IG1hbnkgY2h1bmtzIHRoZXJlIGFyZVxuICAgIGVudHJpZXMucHVzaCh7IGtleSwgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHsgX19jaHVua2VkOiB0cnVlLCBjb3VudDogY2h1bmtzLmxlbmd0aCB9KSB9KTtcbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLyoqXG4gKiBSZWFzc2VtYmxlIGNodW5rZWQgZGF0YSBmcm9tIGEgc3luYyBkYXRhIG9iamVjdC5cbiAqIFJldHVybnMgdGhlIHBhcnNlZCBKU09OIHZhbHVlLCBvciBudWxsIG9uIGVycm9yLlxuICovXG5mdW5jdGlvbiByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgc3luY0RhdGEpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtZXRhID0gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghbWV0YSB8fCAhbWV0YS5fX2NodW5rZWQpIHtcbiAgICAgICAgICAgIC8vIE5vdCBjaHVua2VkIFx1MjAxNCBwYXJzZSBkaXJlY3RseVxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb21iaW5lZCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1ldGEuY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtLZXkgPSBgJHtDSFVOS19QUkVGSVh9JHtrZXl9OiR7aX1gO1xuICAgICAgICAgICAgaWYgKHN5bmNEYXRhW2NodW5rS2V5XSA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbWJpbmVkICs9IHN5bmNEYXRhW2NodW5rS2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb21iaW5lZCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBWZXJzaW9uIGNvbXBhcmlzb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIGRvdHRlZCB2ZXJzaW9uIHN0cmluZ3MgbnVtZXJpY2FsbHkuXG4gKiBSZXR1cm5zIDEgaWYgYSA+IGIsIC0xIGlmIGEgPCBiLCAwIGlmIGVxdWFsLiBNaXNzaW5nIC8gbm9uLW51bWVyaWNcbiAqIGNvbXBvbmVudHMgYXJlIHRyZWF0ZWQgYXMgMCBzbyAnMS4xMC4wJyBjb3JyZWN0bHkgc29ydHMgYWJvdmUgJzEuOS4wJ1xuICogKGEgcGxhaW4gc3RyaW5nIGNvbXBhcmUgd291bGQgcHV0ICcxLjkuMCcgZmlyc3QpLlxuICovXG5mdW5jdGlvbiBjb21wYXJlU2VtdmVyKGEsIGIpIHtcbiAgICBjb25zdCBwYSA9IFN0cmluZyhhKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IHBiID0gU3RyaW5nKGIpLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgocGEubGVuZ3RoLCBwYi5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgeCA9IHBhcnNlSW50KHBhW2ldLCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlSW50KHBiW2ldLCAxMCkgfHwgMDtcbiAgICAgICAgaWYgKHggPiB5KSByZXR1cm4gMTtcbiAgICAgICAgaWYgKHggPCB5KSByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHN5bmMgcGF5bG9hZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgbG9jYWwgZGF0YSBhbmQgYnVpbGQgYSBwcmlvcml0aXNlZCBsaXN0IG9mIGVudHJpZXMgdG8gc3luYy5cbiAqIFJldHVybnMgeyBlbnRyaWVzOiBbeyBrZXksIGpzb25TdHJpbmcsIHByaW9yaXR5LCBzaXplIH1dLCB0b3RhbFNpemUgfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRTeW5jUGF5bG9hZCgpIHtcbiAgICBjb25zdCBhbGwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCBlbnRyaWVzID0gW107XG5cbiAgICAvLyBUMC01OiBhIHNlY3JldCBpcyBvbmx5IGV2ZXIgZW1pdHRlZCB0byBzdG9yYWdlLnN5bmMgKEdvb2dsZS9pQ2xvdWQpIGlmIGl0XG4gICAgLy8gaXMgYWxyZWFkeSBhbiBlbmNyeXB0ZWQgYmxvYi4gQW55IHZhbHVlIHRoYXQgaXMgTk9UIGNpcGhlcnRleHQgaXMgcmVmdXNlZFxuICAgIC8vIChkcm9wcGVkKSBzbyBwbGFpbnRleHQgcHJpdmF0ZSBrZXlzIC8gQVBJIHNlY3JldHMgLyBub3RlcyBjYW4gbmV2ZXIgbGVhdmVcbiAgICAvLyB0aGUgZGV2aWNlLiBgJydgIChlbXB0eSAvIGJ1bmtlcikgaXMgYWxsb3dlZCB0aHJvdWdoIGFzIG5vbi1zZWNyZXQuXG4gICAgY29uc3Qgc2VjcmV0T2sgPSB2ID0+ICF2IHx8IGlzQ2lwaGVydGV4dCh2KTtcblxuICAgIC8vIFRvbWJzdG9uZXMgKGlzc3VlICMzKS4gQSBkb2Mva2V5IGlzIHN1cHByZXNzZWQgZnJvbSB0aGUgcGF5bG9hZCB3aGVuIGFcbiAgICAvLyB0b21ic3RvbmUgZGF0ZWQgYXQtb3ItYWZ0ZXIgaXRzIHVwZGF0ZWRBdCBleGlzdHMsIHNvIGEgc3RhbGUgbG9jYWwgY29weVxuICAgIC8vIGNhbm5vdCByZS1wdXNoIGEgZGVsZXRlZCBpdGVtIGJhY2sgaW50byB0aGUgbWlycm9yLlxuICAgIGNvbnN0IGRlbGV0ZWREb2NzID0gKGFsbC5kZWxldGVkRG9jcyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZERvY3MgOiB7fTtcbiAgICBjb25zdCBkZWxldGVkS2V5cyA9IChhbGwuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGFsbC5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWRLZXlzIDoge307XG4gICAgY29uc3QgZGVsZXRlZFByb2ZpbGVzID0gKGFsbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGFsbC5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkUHJvZmlsZXMgOiB7fTtcblxuICAgIC8vIEEgcHJvZmlsZSdzIHN0YWJsZSBpZGVudGl0eSBmb3IgdG9tYnN0b25lIC8gcmVjZW5jeSBrZXlpbmc6IGl0cyBwdWJrZXksXG4gICAgLy8gZWxzZSAoZm9yIGEgYnVua2VyKSBpdHMgcmVtb3RlIHB1YmtleS4gTWF0Y2hlcyBtZXJnZUludG9Mb2NhbCdzIGlkZW50aXR5T2YuXG4gICAgY29uc3QgaWRlbnRpdHlPZiA9IChwKSA9PiAocCAmJiAocC5wdWJLZXkgfHwgcC5yZW1vdGVQdWJrZXkpKSB8fCBudWxsO1xuXG4gICAgLy8gUDA6IFRvbWJzdG9uZXMgXHUyMDE0IHRoZSBndWFyYW50ZWVkIHNsb3QgKGVtaXR0ZWQgYmVmb3JlIGFueXRoaW5nIGVsc2UpLlxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkRG9jcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkRG9jcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRLZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkS2V5cyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWRLZXlzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZFByb2ZpbGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkUHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4XG4gICAgaWYgKGFsbC5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBjbGVhblByb2ZpbGVzID0gcmVkYWN0UHJvZmlsZXMoYWxsLnByb2ZpbGVzKVxuICAgICAgICAgICAgLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTdXBwcmVzcyBhIHByb2ZpbGUgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLFxuICAgICAgICAgICAgICAgIC8vIHNvIGEgc3RhbGUgbG9jYWwgY29weSBjYW5ub3QgcmUtcHVzaCBhIGRlbGV0ZWQgaWRlbnRpdHkuXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIHJldHVybiAhKGlkICE9IG51bGwgJiYgZGVsZXRlZFByb2ZpbGVzW2lkXSAhPSBudWxsICYmIGRlbGV0ZWRQcm9maWxlc1tpZF0gPj0gKHAudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAubWFwKHAgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgaG9zdHMsIC4uLnJlc3QgfSA9IHA7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3QucHJpdktleSAmJiAhc2VjcmV0T2socmVzdC5wcml2S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgcHJpdktleSBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXN0LnByaXZLZXkgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGNsZWFuUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChhbGwucHJvZmlsZUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbC5wcm9maWxlSW5kZXgpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdwcm9maWxlSW5kZXgnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICAvLyBOT1RFOiBgaXNFbmNyeXB0ZWRgICh0aGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgZmxhZykgaXMgZGVsaWJlcmF0ZWx5IE5PVFxuICAgIC8vIHN5bmNlZC4gSXQgaXMgYSBwZXItZGV2aWNlIGZhY3QgXHUyMDE0IGEgZGV2aWNlIGhvbGRzIHRoZSBwYXNzd29yZCB2ZXJpZmllciBvclxuICAgIC8vIGl0IGRvZXMgbm90IFx1MjAxNCBhbmQgbWlycm9yaW5nIGl0IG9uY2UgbGF0Y2hlZCBhIHBhc3N3b3JkbGVzcyBkZXZpY2UgaW50byBhXG4gICAgLy8gZGVhZC1lbmQgbG9jayBzY3JlZW4gaXQgaGFkIG5vIHBhc3N3b3JkIGZvci4gU2VlIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKS5cblxuICAgIC8vIFAyOiBTZXR0aW5nc1xuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGsgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChhbGxba10gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhhbGwpKSB7XG4gICAgICAgIGlmIChrLnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUDM6IEFQSSBrZXkgdmF1bHQgXHUyMDE0IG9ubHkgc3luYyBrZXlzIHdob3NlIHNlY3JldCBpcyBjaXBoZXJ0ZXh0IChUMC01KVxuICAgIGlmIChhbGwuYXBpS2V5VmF1bHQgJiYgYWxsLmFwaUtleVZhdWx0LmtleXMpIHtcbiAgICAgICAgY29uc3Qgc2FmZUtleXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoYWxsLmFwaUtleVZhdWx0LmtleXMpKSB7XG4gICAgICAgICAgICAvLyBTdXBwcmVzcyBhIGtleSBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCkuXG4gICAgICAgICAgICBpZiAoZGVsZXRlZEtleXNbaWRdICE9IG51bGwgJiYgZGVsZXRlZEtleXNbaWRdID49IChrZXkudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VjcmV0T2soa2V5LnNlY3JldCkpIHtcbiAgICAgICAgICAgICAgICBzYWZlS2V5c1tpZF0gPSBrZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBBUEkgc2VjcmV0IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2FmZVZhdWx0ID0geyAuLi5hbGwuYXBpS2V5VmF1bHQsIGtleXM6IHNhZmVLZXlzIH07XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShzYWZlVmF1bHQpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdhcGlLZXlWYXVsdCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QM19BUElLRVlTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQNDogVmF1bHQgZG9jcyAoaW5kaXZpZHVhbGx5LCBuZXdlc3QgZmlyc3QpIFx1MjAxNCBvbmx5IGlmIGNvbnRlbnQgaXMgY2lwaGVydGV4dFxuICAgIGlmIChhbGwudmF1bHREb2NzICYmIHR5cGVvZiBhbGwudmF1bHREb2NzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBjb25zdCBkb2NzID0gT2JqZWN0LnZhbHVlcyhhbGwudmF1bHREb2NzKS5zb3J0KChhLCBiKSA9PiAoYi51cGRhdGVkQXQgfHwgMCkgLSAoYS51cGRhdGVkQXQgfHwgMCkpO1xuICAgICAgICBmb3IgKGNvbnN0IGRvYyBvZiBkb2NzKSB7XG4gICAgICAgICAgICAvLyBTdXBwcmVzcyBhIGRvYyBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCkuXG4gICAgICAgICAgICBpZiAoZGVsZXRlZERvY3NbZG9jLnBhdGhdICE9IG51bGwgJiYgZGVsZXRlZERvY3NbZG9jLnBhdGhdID49IChkb2MudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXNlY3JldE9rKGRvYy5jb250ZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCB2YXVsdCBjb250ZW50IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkb2NLZXkgPSBgdmF1bHREb2M6JHtkb2MucGF0aH1gO1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRvYyk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGRvY0tleSwganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlA0X1ZBVUxULCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1c2ggdG8gc3luY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogV3JpdGUgYSBwcmlvcml0aXNlZCwgcHJlLWNodW5rZWQgcGF5bG9hZCB0byBzdG9yYWdlLnN5bmMsIHJldHJ5aW5nIG9uIGFuXG4gKiBvdmVyLXF1b3RhIHJlamVjdGlvbiBieSBkcm9wcGluZyB0aGUgbG93ZXN0LXByaW9yaXR5IHRpZXIgc3RpbGwgcHJlc2VudCBhbmRcbiAqIHRyeWluZyBhZ2Fpbi4gUDAgKHRvbWJzdG9uZXMpIGFuZCBQMSAocHJvZmlsZXMpIGFyZSBORVZFUiBkcm9wcGVkIFx1MjAxNCBhIGZ1bGxcbiAqIGJhdGNoIGZhaWx1cmUgd291bGQgc3RyYW5kIGEgZGVsZXRpb24gb3IgYSBrZXksIHNvIHRoZSBpbXBvcnRhbnQgdGllcnMgc3luY1xuICogZXZlbiB3aGVuIHRoZSBidWxreSBvbmVzIGNhbm5vdC5cbiAqXG4gKiBAcGFyYW0ge3sgcHJpb3JpdHk6IG51bWJlciwgY2h1bmtzOiB7a2V5OnN0cmluZywgdmFsdWU6c3RyaW5nfVtdIH1bXX0gaW5jbHVkZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59IG51bWJlciBvZiBkYXRhIGtleXMgYWN0dWFsbHkgd3JpdHRlblxuICovXG5hc3luYyBmdW5jdGlvbiBzZXRTeW5jUmVzcGVjdGluZ1F1b3RhKGluY2x1ZGVkKSB7XG4gICAgbGV0IHRpZXJzID0gaW5jbHVkZWQuc2xpY2UoKTtcbiAgICAvLyBHdWFyZCBhZ2FpbnN0IGFuIHVuYm91bmRlZCBsb29wOiBhdCBtb3N0IG9uZSByZXRyeSBwZXIgZGlzdGluY3QgcHJpb3JpdHkuXG4gICAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IDsgYXR0ZW1wdCsrKSB7XG4gICAgICAgIGNvbnN0IHN5bmNQYXlsb2FkID0ge307XG4gICAgICAgIGNvbnN0IGFsbFN5bmNLZXlzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiB0aWVycykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGl0ZW0uY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgc3luY1BheWxvYWRbYy5rZXldID0gYy52YWx1ZTtcbiAgICAgICAgICAgICAgICBhbGxTeW5jS2V5cy5wdXNoKGMua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzeW5jUGF5bG9hZFtTWU5DX01FVEFfS0VZXSA9IEpTT04uc3RyaW5naWZ5KHsgbGFzdFdyaXR0ZW5BdDogRGF0ZS5ub3coKSwga2V5czogYWxsU3luY0tleXMgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHN5bmNQYXlsb2FkKTtcblxuICAgICAgICAgICAgLy8gQ2xlYW4gb3JwaGFuZWQgY2h1bmtzOiByZW1vdmUgYW55IGV4aXN0aW5nIHN5bmMga2V5IG5vdCBpbiBvdXIgcGF5bG9hZC5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcnBoYW5LZXlzID0gT2JqZWN0LmtleXMoZXhpc3RpbmcpLmZpbHRlcihrID0+XG4gICAgICAgICAgICAgICAgICAgIGsgIT09IFNZTkNfTUVUQV9LRVkgJiYgIWFsbFN5bmNLZXlzLmluY2x1ZGVzKGspXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAob3JwaGFuS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKG9ycGhhbktleXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIC8vIE5vbi1jcml0aWNhbCBjbGVhbnVwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWxsU3luY0tleXMubGVuZ3RoO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBPdmVyIHF1b3RhIChvciBNQVhfSVRFTVMpIFx1MjAxNCBkcm9wIHRoZSBsb3dlc3QtcHJpb3JpdHkgdGllciBzdGlsbFxuICAgICAgICAgICAgLy8gcHJlc2VudCBhbmQgcmV0cnkuIE5ldmVyIGRyb3AgUDAvUDEuXG4gICAgICAgICAgICBjb25zdCBtYXhQcmlvcml0eSA9IHRpZXJzLnJlZHVjZSgobSwgdCkgPT4gTWF0aC5tYXgobSwgdC5wcmlvcml0eSksIC0xKTtcbiAgICAgICAgICAgIGlmIChtYXhQcmlvcml0eSA8PSBQUklPUklUWS5QMV9QUk9GSUxFUykge1xuICAgICAgICAgICAgICAgIHRocm93IGU7IC8vIG5vdGhpbmcgZHJvcHBhYmxlIGxlZnQ7IFAwL1AxIG11c3Qgc3Vydml2ZSBvciBmYWlsIGxvdWRseVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYmVmb3JlID0gdGllcnMubGVuZ3RoO1xuICAgICAgICAgICAgdGllcnMgPSB0aWVycy5maWx0ZXIodCA9PiB0LnByaW9yaXR5IDwgbWF4UHJpb3JpdHkpO1xuICAgICAgICAgICAgaWYgKHRpZXJzLmxlbmd0aCA9PT0gYmVmb3JlKSB0aHJvdyBlOyAvLyBubyBwcm9ncmVzcyBcdTIwMTQgYmFpbFxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU3luY01hbmFnZXJdIHN5bmMuc2V0IG92ZXIgcXVvdGEgXHUyMDE0IGRyb3BwZWQgcHJpb3JpdHkgJHttYXhQcmlvcml0eX0gdGllciwgcmV0cnlpbmdgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1c2hUb1N5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgLy8gUHVsbC1tZXJnZSBCRUZPUkUgYnVpbGRpbmc6IG9ycGhhbi1jbGVhbnVwIGJlbG93IHdpcGVzIGFueSBtaXJyb3Iga2V5XG4gICAgICAgIC8vIGFic2VudCBmcm9tIHRoaXMgZGV2aWNlJ3MgcGF5bG9hZCwgc28gd2UgbXVzdCBmaXJzdCBhYnNvcmIgcmVtb3RlXG4gICAgICAgIC8vIHN0YXRlIChlc3BlY2lhbGx5IHJlbW90ZSB0b21ic3RvbmVzLCB3aGljaCB0aGVuIHN1cHByZXNzIHRoZSBtYXRjaGluZ1xuICAgICAgICAvLyBkb2NzL2tleXMgZnJvbSB0aGUgcGF5bG9hZCB3ZSBhcmUgYWJvdXQgdG8gYnVpbGQpLiBXaXRob3V0IHRoaXMgYVxuICAgICAgICAvLyBkZXZpY2UgdGhhdCBuZXZlciBsZWFybmVkIG9mIGEgZGVsZXRpb24gd291bGQgcmUtcHVzaCB0aGUgaXRlbS5cbiAgICAgICAgY29uc3QgcmVtb3RlID0gYXdhaXQgcHVsbEZyb21TeW5jKCk7XG4gICAgICAgIGlmIChyZW1vdGUpIGF3YWl0IG1lcmdlSW50b0xvY2FsKHJlbW90ZSk7XG5cbiAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IGJ1aWxkU3luY1BheWxvYWQoKTtcblxuICAgICAgICAvLyBTb3J0IGJ5IHByaW9yaXR5IChhc2NlbmRpbmcgPSBtb3N0IGltcG9ydGFudCBmaXJzdClcbiAgICAgICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eSk7XG5cbiAgICAgICAgLy8gQnVpbGQgdGhlIGluY2x1ZGVkIHNldCByZXNwZWN0aW5nIHRoZSBpbi1jb2RlIGJ5dGUvaXRlbSBidWRnZXQuXG4gICAgICAgIGxldCB1c2VkQnl0ZXMgPSAwO1xuICAgICAgICBsZXQgdXNlZEl0ZW1zID0gMDtcbiAgICAgICAgY29uc3QgaW5jbHVkZWQgPSBbXTtcbiAgICAgICAgbGV0IGJ1ZGdldEV4aGF1c3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgaWYgKGJ1ZGdldEV4aGF1c3RlZCkgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IGNodW5rVmFsdWUoZW50cnkua2V5LCBlbnRyeS5qc29uU3RyaW5nKTtcbiAgICAgICAgICAgIGxldCBlbnRyeVNpemUgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjIG9mIGNodW5rcykge1xuICAgICAgICAgICAgICAgIGVudHJ5U2l6ZSArPSBjLmtleS5sZW5ndGggKyAodHlwZW9mIGMudmFsdWUgPT09ICdzdHJpbmcnID8gYy52YWx1ZS5sZW5ndGggOiBKU09OLnN0cmluZ2lmeShjLnZhbHVlKS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodXNlZEJ5dGVzICsgZW50cnlTaXplID4gU1lOQ19RVU9UQSAtIDUwMCB8fCB1c2VkSXRlbXMgKyBjaHVua3MubGVuZ3RoID4gTUFYX0lURU1TIC0gNSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5wcmlvcml0eSA8PSBQUklPUklUWS5QM19BUElLRVlTKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyaXRpY2FsIGRhdGEgKGluY2wuIFAwIHRvbWJzdG9uZXMpIFx1MjAxNCBpbmNsdWRlIGFueXdheTsgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHJ1bnRpbWUgcXVvdGEgZmFsbGJhY2sgd2lsbCBzaGVkIGJ1bGt5IHRpZXJzIGlmIHRoZSBBUEkgcmVqZWN0cy5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gQnVkZ2V0IGV4aGF1c3RlZCBhdCBwcmlvcml0eSAke2VudHJ5LnByaW9yaXR5fSwgc2tpcHBpbmcgcmVtYWluaW5nIGVudHJpZXNgKTtcbiAgICAgICAgICAgICAgICAgICAgYnVkZ2V0RXhoYXVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmNsdWRlZC5wdXNoKHsgcHJpb3JpdHk6IGVudHJ5LnByaW9yaXR5LCBjaHVua3MgfSk7XG4gICAgICAgICAgICB1c2VkQnl0ZXMgKz0gZW50cnlTaXplO1xuICAgICAgICAgICAgdXNlZEl0ZW1zICs9IGNodW5rcy5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cml0dGVuID0gYXdhaXQgc2V0U3luY1Jlc3BlY3RpbmdRdW90YShpbmNsdWRlZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbU3luY01hbmFnZXJdIFB1c2hlZCAke3dyaXR0ZW59IGVudHJpZXMgKCR7dXNlZEJ5dGVzfSBieXRlcykgdG8gc3luYyBzdG9yYWdlYCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1c2hUb1N5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIC8vIExvY2FsIHN0b3JhZ2UgaXMgdW5hZmZlY3RlZCBcdTIwMTQgZ3JhY2VmdWwgZGVncmFkYXRpb25cbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVsbCBmcm9tIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGRhdGEgZnJvbSBzeW5jIHN0b3JhZ2UgYW5kIHJldHVybiBhcyBhIHBsYWluIG9iamVjdCB3aXRoXG4gKiByZWFzc2VtYmxlZCBjaHVua2VkIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHB1bGxGcm9tU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgIGlmICghcmF3IHx8IE9iamVjdC5rZXlzKHJhdykubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBtZXRhU3RyID0gcmF3W1NZTkNfTUVUQV9LRVldO1xuICAgICAgICBpZiAoIW1ldGFTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBtZXRhO1xuICAgICAgICB0cnkgeyBtZXRhID0gSlNPTi5wYXJzZShtZXRhU3RyKTsgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIENvbGxlY3QgdGhlIG5vbi1jaHVuaywgbm9uLW1ldGEga2V5c1xuICAgICAgICBjb25zdCBkYXRhS2V5cyA9IG1ldGEua2V5cy5maWx0ZXIoayA9PiAhay5zdGFydHNXaXRoKENIVU5LX1BSRUZJWCkgJiYgayAhPT0gU1lOQ19NRVRBX0tFWSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZGF0YUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHJhdyk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQuX3N5bmNNZXRhID0gbWV0YTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVsbEZyb21TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWVyZ2UgbG9naWNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBUaGUgYmFja2dyb3VuZCdzIG93biB3YXkgdG8gaGVhciBvZiBtb3ZlZCBwcm9maWxlcy4gQSB3b3JrZXIgY2Fubm90IG1lc3NhZ2Vcbi8vIGl0c2VsZiwgc28gYSBtZXJnZSBydW5uaW5nIHRoZXJlIGNhbGxzIHRoaXM7IGEgcGFnZSBzZW5kcyBhIG1lc3NhZ2UuXG5sZXQgcHJvZmlsZU1vdmVIYW5kbGVyID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFByb2ZpbGVNb3ZlSGFuZGxlcihoYW5kbGVyKSB7XG4gICAgcHJvZmlsZU1vdmVIYW5kbGVyID0gaGFuZGxlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYW5ub3VuY2VQcm9maWxlTW92ZXMobW92ZXMpIHtcbiAgICBpZiAocHJvZmlsZU1vdmVIYW5kbGVyKSB7XG4gICAgICAgIHByb2ZpbGVNb3ZlSGFuZGxlcihtb3Zlcyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncHJvZmlsZXNNb3ZlZCcsIHBheWxvYWQ6IG1vdmVzIH0pO1xuICAgIH0gY2F0Y2ggeyAvKiBiYWNrZ3JvdW5kIHVuYXZhaWxhYmxlOiB3aGF0IGlzIGtleWVkIGJ5IGluZGV4IGNoZWNrcyBpdHMgaWRlbnRpdHkgKi8gfVxufVxuXG4vKipcbiAqIFdoZXJlIGVhY2ggcHJvZmlsZSB3ZW50LiBBbiB1bnRvdWNoZWQgcmVjb3JkIGlzIGZvdW5kIGFzIGl0c2VsZiwgYW5kIG9uZSBzeW5jXG4gKiByZXBsYWNlZCBpcyBmb3VuZCBieSBpZGVudGl0eS4gRWFjaCBwbGFjZSBpcyBjbGFpbWVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtvYmplY3RbXX0gYmVmb3JlXG4gKiBAcGFyYW0ge29iamVjdFtdfSBhZnRlclxuICogQHBhcmFtIHsocHJvZmlsZTogb2JqZWN0KSA9PiA/c3RyaW5nfSBpZGVudGl0eU9mXG4gKiBAcmV0dXJucyB7QXJyYXk8W251bWJlciwgP251bWJlcl0+fSBbb2xkIGluZGV4LCBuZXcgaW5kZXggb3IgbnVsbCBpZiBnb25lXSwgY2hhbmdlcyBvbmx5XG4gKi9cbmZ1bmN0aW9uIHByb2ZpbGVNb3ZlcyhiZWZvcmUsIGFmdGVyLCBpZGVudGl0eU9mKSB7XG4gICAgY29uc3QgcGxhY2VzID0gYmVmb3JlLm1hcChwcm9maWxlID0+IGFmdGVyLmluZGV4T2YocHJvZmlsZSkpO1xuICAgIGNvbnN0IGNsYWltZWQgPSBuZXcgU2V0KHBsYWNlcyk7XG4gICAgYmVmb3JlLmZvckVhY2goKHByb2ZpbGUsIGkpID0+IHtcbiAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHByb2ZpbGUpO1xuICAgICAgICBpZiAocGxhY2VzW2ldID49IDAgfHwgIWlkKSByZXR1cm47XG4gICAgICAgIHBsYWNlc1tpXSA9IGFmdGVyLmZpbmRJbmRleCgob3RoZXIsIGopID0+ICFjbGFpbWVkLmhhcyhqKSAmJiBpZGVudGl0eU9mKG90aGVyKSA9PT0gaWQpO1xuICAgICAgICBjbGFpbWVkLmFkZChwbGFjZXNbaV0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwbGFjZXMuZmxhdE1hcCgocGxhY2UsIGkpID0+IChwbGFjZSA9PT0gaSA/IFtdIDogW1tpLCBwbGFjZSA8IDAgPyBudWxsIDogcGxhY2VdXSkpO1xufVxuXG4vKipcbiAqIE1lcmdlIHN5bmMgZGF0YSBpbnRvIGxvY2FsIHN0b3JhZ2Ugd2l0aCBjb25mbGljdCByZXNvbHV0aW9uLlxuICpcbiAqIENPTkRJVElPTiAzIChpc3N1ZSAjMyBsb29wIGludmFyaWFudCk6IGV2ZXJ5IHdyaXRlIGhlcmUgZ29lcyB0aHJvdWdoIHRoZSByYXdcbiAqIG1vZHVsZS1sZXZlbCBgc3RvcmFnZWAgKD0gYXBpLnN0b3JhZ2UubG9jYWwpIHZpYSBhIHNpbmdsZSBgc3RvcmFnZS5zZXRgLiBJdFxuICogTVVTVCBOT1QgY2FsbCB0aGUgc3RvcmUtbGF5ZXIgaGVscGVycyAoZGVsZXRlRG9jdW1lbnRMb2NhbCAvIHNhdmVEb2N1bWVudExvY2FsXG4gKiAvIGRlbGV0ZUFwaUtleSAvIHNhdmVBcGlLZXkpLCBiZWNhdXNlIHRob3NlIGNhbGwgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjAxNCBhIG1lcmdlXG4gKiB0aGF0IHNjaGVkdWxlZCBhIHB1c2ggd291bGQgdHVybiBldmVyeSBpbmNvbWluZyBzeW5jIGludG8gYW4gb3V0Z29pbmcgb25lIGFuZFxuICogbG9vcC4gQSByZWdyZXNzaW9uIHRlc3QgYXNzZXJ0cyBtZXJnZUludG9Mb2NhbCBuZXZlciBzY2hlZHVsZXMgYSBwdXNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpIHtcbiAgICBpZiAoIXN5bmNEYXRhKSByZXR1cm47XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIHN5bmNEYXRhID0geyAuLi5zeW5jRGF0YSwgcHJvZmlsZXM6IHJlZGFjdFByb2ZpbGVzKHN5bmNEYXRhLnByb2ZpbGVzKSB9O1xuICAgIH1cblxuICAgIC8vIFRoZSByZWFkIGFuZCB0aGUgd3JpdGUgcnVuIHVuZGVyIHRoZSBwcm9maWxlcyBsb2NrLCBzbyBhIHByb2ZpbGVzIGNoYW5nZVxuICAgIC8vIG1hZGUgbWVhbndoaWxlIChhIHJldm9rZSwgYSByZWxheSBlZGl0KSBpcyBuZXZlciB3cml0dGVuIG92ZXIuXG4gICAgY29uc3QgbW92ZXMgPSBhd2FpdCB3aXRoUHJvZmlsZXNMb2NrKCgpID0+IG1lcmdlSW50b0xvY2FsTG9ja2VkKHN5bmNEYXRhKSk7XG4gICAgaWYgKG1vdmVzLmxlbmd0aCA+IDApIGF3YWl0IGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbWVyZ2VJbnRvTG9jYWxMb2NrZWQoc3luY0RhdGEpIHtcbiAgICBjb25zdCBsb2NhbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gRGV0ZWN0IGZyZXNoIGluc3RhbGw6IG5vIHByb2ZpbGVzLCBvciBhIHNpbmdsZSB1bnRvdWNoZWQgZGVmYXVsdCBwcm9maWxlLlxuICAgIC8vIChEZWZhdWx0IGtleXMgYXJlIG5vdyB3cmFwcGVkIGF0IHJlc3QsIHNvIGBwcml2S2V5YCBpcyB0cnV0aHkgZXZlbiBvbiBhXG4gICAgLy8gZnJlc2ggaW5zdGFsbCBcdTIwMTQgZGV0ZWN0IHRoZSB1bnRvdWNoZWQgZGVmYXVsdCBieSBpdHMgbmFtZSArIGFic2VuY2Ugb2YgYW55XG4gICAgLy8gcGVyLXNpdGUgZ3JhbnRzIGluc3RlYWQuKVxuICAgIC8vXG4gICAgLy8gQzE6IGEgbG9uZSBwcm9maWxlIGlzIG9ubHkgXCJ1bnRvdWNoZWQvZnJlc2hcIiB3aGVuIGl0IGNhcnJpZXMgbm8gaWRlbnRpdHkuXG4gICAgLy8gQSBsb25lIEJVTktFUiBwcm9maWxlIGhhcyBwcml2S2V5OicnIGJ1dCBJUyBhIHJlYWwgaWRlbnRpdHkgKHR5cGUvYnVua2VyVXJsXG4gICAgLy8gL3JlbW90ZVB1YmtleSksIGFuZCBtdXN0IG5vdCBiZSB0cmVhdGVkIGFzIGZyZXNoIGFuZCB3aXBlZCBieSBhIHN5bmMgcHVsbC5cbiAgICBjb25zdCBoYXNJZGVudGl0eSA9IChwKSA9PiAhIShwICYmIChcbiAgICAgICAgcC5wcml2S2V5IHx8IHAucHViS2V5IHx8IHAudHlwZSA9PT0gJ2J1bmtlcicgfHwgcC5idW5rZXJVcmwgfHwgcC5yZW1vdGVQdWJrZXlcbiAgICApKTtcbiAgICBjb25zdCBsb25lID0gbG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAxID8gbG9jYWwucHJvZmlsZXNbMF0gOiBudWxsO1xuICAgIGNvbnN0IGlzRnJlc2ggPSAhbG9jYWwucHJvZmlsZXMgfHxcbiAgICAgICAgbG9jYWwucHJvZmlsZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgIChsb25lICYmICFsb25lLnByaXZLZXkgJiYgIWhhc0lkZW50aXR5KGxvbmUpKSB8fFxuICAgICAgICAobG9uZSAmJiBsb25lLm5hbWUgPT09ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnICYmXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhsb25lLmhvc3RzIHx8IHt9KS5sZW5ndGggPT09IDApO1xuXG4gICAgLy8gU3RhYmxlIGlkZW50aXR5IGZvciBwcm9maWxlIG1hdGNoaW5nIC8gdG9tYnN0b25lczogcHViS2V5LCBlbHNlIHRoZVxuICAgIC8vIGJ1bmtlcidzIHJlbW90ZVB1YmtleS4gTWF0Y2hlcyBidWlsZFN5bmNQYXlsb2FkJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBBQ1RJVkUgaWRlbnRpdHkgQkVGT1JFIGFueSByZW9yZGVyaW5nL3JlbW92YWwgc28gdGhlIGFjdGl2ZVxuICAgIC8vIGluZGV4IGNhbiBmb2xsb3cgdGhhdCBpZGVudGl0eSB0aHJvdWdoIHRoZSBtZXJnZSAoYSBrZXkgbWFuYWdlciBtdXN0IG5vdFxuICAgIC8vIHNpbGVudGx5IHN3aXRjaCB3aGljaCBpZGVudGl0eSBpcyBhY3RpdmUganVzdCBiZWNhdXNlIGEgcHJvZmlsZSBvcmRlcmVkXG4gICAgLy8gYmVmb3JlIGl0IHdhcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlKS5cbiAgICBjb25zdCBsb2NhbEFjdGl2ZUluZGV4ID0gKGxvY2FsLnByb2ZpbGVJbmRleCAhPSBudWxsKSA/IGxvY2FsLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgY29uc3QgYWN0aXZlSWQgPSAobG9jYWwucHJvZmlsZXMgJiYgbG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgID8gaWRlbnRpdHlPZihsb2NhbC5wcm9maWxlc1tsb2NhbEFjdGl2ZUluZGV4XSlcbiAgICAgICAgOiBudWxsO1xuXG4gICAgLy8gLS0tIFByb2ZpbGUgdG9tYnN0b25lcyAoaXNzdWUgIzMpIFx1MjAxNCB1bmlvbiBsb2NhbCArIHJlbW90ZSwgbWF4IHBlciBpZGVudGl0eSAtLS1cbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSB7IC4uLihsb2NhbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkUHJvZmlsZXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRQcm9maWxlc1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRQcm9maWxlc1tpZF0pIGRlbGV0ZWRQcm9maWxlc1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBQcm9maWxlcyAoUDEpIFx1MjAxNCBwdWJrZXkta2V5ZWQgbWVyZ2UgKyB0b21ic3RvbmUgcmVtb3ZhbCAtLS1cbiAgICAvLyBNYXRjaCBieSBzdGFibGUgaWRlbnRpdHkgcmF0aGVyIHRoYW4gYXJyYXkgaW5kZXgsIHNvIGEgcmVvcmRlcmVkIG9yIHBhcnRpYWxcbiAgICAvLyBzeW5jIHBheWxvYWQgY2Fubm90IG92ZXJ3cml0ZSBvbmUgaWRlbnRpdHkncyBrZXkgbWF0ZXJpYWwgd2l0aCBhbm90aGVyJ3MuXG4gICAgbGV0IG1lcmdlZFByb2ZpbGVzID0gbG9jYWwucHJvZmlsZXMgPyBbLi4ubG9jYWwucHJvZmlsZXNdIDogbnVsbDtcbiAgICBsZXQgcHJvZmlsZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgIGlmIChpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBpbnN0YWxsIFx1MjAxNCBhZG9wdCBzeW5jIHByb2ZpbGVzIGVudGlyZWx5XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IHN5bmNEYXRhLnByb2ZpbGVzLnNsaWNlKCk7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleEJ5SWRlbnRpdHkgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiAhaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIGkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN5bmNQcm9maWxlIG9mIHN5bmNEYXRhLnByb2ZpbGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgaW5kZXhCeUlkZW50aXR5LmhhcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaSA9IGluZGV4QnlJZGVudGl0eS5nZXQoaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFByb2ZpbGUgPSBtZXJnZWRQcm9maWxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzeW5jUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkgPiAobG9jYWxQcm9maWxlLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3luYyBpcyBuZXdlciBcdTIwMTQgYWRvcHQgaXQgYnV0IHByZXNlcnZlIGxvY2FsIHBlci1zaXRlIGhvc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlc1tpXSA9IHsgLi4uc3luY1Byb2ZpbGUsIGhvc3RzOiBsb2NhbFByb2ZpbGUuaG9zdHMgfHwge30gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgZ2VudWluZWx5IG5ldyBpZGVudGl0eSBub3QgcHJlc2VudCBsb2NhbGx5IFx1MjAxNCBhcHBlbmQgaXQuXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnlJZGVudGl0eS5zZXQoaWQsIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzLnB1c2goc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBBIGtleWxlc3MgcmVtb3RlIHByb2ZpbGUgY2Fubm90IGJlIHJlY29uY2lsZWQgdG8gYSBsb2NhbCBvbmVcbiAgICAgICAgICAgICAgICAvLyBzYWZlbHkgKG5vIGlkZW50aXR5IHRvIG1hdGNoIG9uKSwgc28gaXQgaXMgc2tpcHBlZC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGx5IHByb2ZpbGUgdG9tYnN0b25lczogcmVtb3ZlIGFueSBtZXJnZWQgcHJvZmlsZSB3aG9zZSBpZGVudGl0eSBoYXNcbiAgICAvLyAodXBkYXRlZEF0IDw9IGRlbGV0ZWRBdCkgXHUyMDE0IGRlbGV0aW9uIHdpbnMgdGllcywgY29uc2lzdGVudCB3aXRoIGRvY3Mva2V5cy5cbiAgICAvLyBBIHJlY3JlYXRlZCBwcm9maWxlICh1cGRhdGVkQXQgPiBkZWxldGVkQXQpIHN1cnZpdmVzLiBOZXZlciBwcnVuZSB0b21ic3RvbmVzLlxuICAgIGlmIChtZXJnZWRQcm9maWxlcyAmJiBPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3Qga2VwdCA9IG1lcmdlZFByb2ZpbGVzLmZpbHRlcihwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gaWQgIT0gbnVsbCA/IGRlbGV0ZWRQcm9maWxlc1tpZF0gOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuICEodHMgIT0gbnVsbCAmJiAocC51cGRhdGVkQXQgfHwgMCkgPD0gdHMpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2FmZXR5OiBuZXZlciBsZXQgYSBzeW5jIG1lcmdlIGxlYXZlIFpFUk8gcHJvZmlsZXMgKHRoYXQgd291bGQgb3JwaGFuXG4gICAgICAgIC8vIHRoZSBhY3RpdmUgaW5kZXggYW5kIGJyaWNrIHRoZSBVSSkuIElmIHJlbW92YWwgd291bGQgZW1wdHkgdGhlIGxpc3QsXG4gICAgICAgIC8vIGtlZXAgdGhlIHByb2ZpbGVzIGFzLWlzIFx1MjAxNCB0aGUgbG9jYWwgdXNlciBjYW4gc3RpbGwgZGVsZXRlIGRlbGliZXJhdGVseS5cbiAgICAgICAgLy8gRGVsaWJlcmF0ZSB0cmFkZS1vZmY6IGNyb3NzLWRldmljZSBkZWxldGlvbiBkb2VzIE5PVCBjb252ZXJnZSBvbiBhXG4gICAgICAgIC8vIGRldmljZSB3aGVyZSBhcHBseWluZyBpdCB3b3VsZCBsZWF2ZSB6ZXJvIHByb2ZpbGVzOyB0aGUgcHJvZmlsZSBzdGF5c1xuICAgICAgICAvLyB0b21ic3RvbmUtc3VwcHJlc3NlZCBvbiBlbWl0LCBzbyBpdCBkb2VzIG5vdCByZS1wcm9wYWdhdGUgdG8gb3RoZXJzLlxuICAgICAgICBpZiAoa2VwdC5sZW5ndGggIT09IG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAmJiBrZXB0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzID0ga2VwdDtcbiAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbW92ZXMgPSBbXTtcbiAgICBpZiAocHJvZmlsZXNDaGFuZ2VkICYmIG1lcmdlZFByb2ZpbGVzKSB7XG4gICAgICAgIHVwZGF0ZXMucHJvZmlsZXMgPSBtZXJnZWRQcm9maWxlcztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdmVzID0gcHJvZmlsZU1vdmVzKGxvY2FsLnByb2ZpbGVzIHx8IFtdLCBtZXJnZWRQcm9maWxlcywgaWRlbnRpdHlPZik7XG4gICAgICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwICYmIGxvY2FsLmJ1bmtlclNlc3Npb25zKSB7XG4gICAgICAgICAgICB1cGRhdGVzLmJ1bmtlclNlc3Npb25zID0gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGxvY2FsLmJ1bmtlclNlc3Npb25zLCBtb3Zlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIFx1MjAxNCBGT0xMT1cgVEhFIEFDVElWRSBJREVOVElUWSBhY3Jvc3MgdGhlIG1lcmdlIC0tLVxuICAgIC8vIFRoZSBhY3RpdmUgaW5kZXggdHJhY2tzIHRoZSBhY3RpdmUgaWRlbnRpdHksIG5vdCBhIHJhdyBzbG90OiBpZiBhIHByb2ZpbGVcbiAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgYWN0aXZlIG9uZSBpcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlLCB0aGUgaW5kZXhcbiAgICAvLyBzaGlmdHMgc28gdGhlIFNBTUUgaWRlbnRpdHkgc3RheXMgYWN0aXZlLiBUaGUgaW5kZXggb25seSBtb3ZlcyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGlkZW50aXR5IHdoZW4gdGhlIGFjdGl2ZSBvbmUgaXMgaXRzZWxmIGdvbmUgKHRvbWJzdG9uZWQpLCBvciBvbiBhXG4gICAgLy8gZnJlc2ggYWRvcHQgXHUyMDE0IHRoZW4gaXQgZmFsbHMgYmFjayB0byB0aGUgc2FmZSBjbGFtcC5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgZGVzaXJlZEluZGV4O1xuICAgICAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMgJiYgaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggYWRvcHQgXHUyMDE0IHRha2Ugc3luYydzIGFjdGl2ZSBpbmRleCwgY2xhbXBlZCBpbnRvIHJhbmdlLlxuICAgICAgICAgICAgY29uc3QgYmFzZSA9IHN5bmNEYXRhLnByb2ZpbGVJbmRleCAhPSBudWxsID8gc3luY0RhdGEucHJvZmlsZUluZGV4IDogMDtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KGJhc2UsIDApLCBtZXJnZWRQcm9maWxlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd2VkID0gYWN0aXZlSWQgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gbWVyZ2VkUHJvZmlsZXMuZmluZEluZGV4KHAgPT4gaWRlbnRpdHlPZihwKSA9PT0gYWN0aXZlSWQpXG4gICAgICAgICAgICAgICAgOiAtMTtcbiAgICAgICAgICAgIGRlc2lyZWRJbmRleCA9IGZvbGxvd2VkID49IDBcbiAgICAgICAgICAgICAgICA/IGZvbGxvd2VkXG4gICAgICAgICAgICAgICAgOiBNYXRoLm1pbihNYXRoLm1heChsb2NhbEFjdGl2ZUluZGV4LCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlc2lyZWRJbmRleCAhPT0gbG9jYWwucHJvZmlsZUluZGV4KSB7XG4gICAgICAgICAgICB1cGRhdGVzLnByb2ZpbGVJbmRleCA9IGRlc2lyZWRJbmRleDtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEVuY3J5cHRpb24gc3RhdGUgKFAxKSAtLS1cbiAgICAvLyBBMjogYGlzRW5jcnlwdGVkYCBpcyBOT1QgbWVyZ2VkLiBUaGUgbWFzdGVyLXBhc3N3b3JkIGxvY2sgaXMgYSBwZXItZGV2aWNlXG4gICAgLy8gZmFjdCBwcm92ZW4gYnkgdGhlIGxvY2FsIHZlcmlmaWVyOyBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzXG4gICAgLy8gZGV2aWNlIGludG8gYSBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gLS0tIFNldHRpbmdzIChQMikgXHUyMDE0IGxhc3Qtd3JpdGUtd2lucyAtLS1cbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygc2V0dGluZ3NLZXlzKSB7XG4gICAgICAgIGlmIChzeW5jRGF0YVtrZXldICE9IG51bGwgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgLy8gRm9yIHZlcnNpb24sIG9ubHkgYWNjZXB0IGEgbnVtZXJpY2FsbHktaGlnaGVyIG9uZSAoJzEuMTAuMCcgPiAnMS45LjAnKS5cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICd2ZXJzaW9uJyAmJiBsb2NhbC52ZXJzaW9uICYmIGNvbXBhcmVTZW12ZXIoc3luY0RhdGEudmVyc2lvbiwgbG9jYWwudmVyc2lvbikgPD0gMCkgY29udGludWU7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gRmVhdHVyZSBmbGFnc1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ2ZlYXR1cmU6JykgJiYgc3luY0RhdGFba2V5XSAhPT0gbG9jYWxba2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBkZWxldGVkQXQgcGVyIGtleSAtLS1cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkRG9jcyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW3BhdGgsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkRG9jcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1twYXRoXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZERvY3NbcGF0aF0pIGRlbGV0ZWREb2NzW3BhdGhdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSB7IC4uLihsb2NhbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZEtleXMgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRLZXlzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZEtleXNbaWRdKSBkZWxldGVkS2V5c1tpZF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBBUEkgS2V5IFZhdWx0IChQMykgLS0tXG4gICAgLy8gQnVpbGQgdGhlIG1lcmdlZCBrZXkgc2V0LCBmb2xkIGluIGFueSByZW1vdGUga2V5cywgdGhlbiBhcHBseSBrZXlcbiAgICAvLyB0b21ic3RvbmVzLiBSdW5zIGV2ZW4gd2hlbiB0aGUgcHVsbCBjYXJyaWVzIE5PIGFwaUtleVZhdWx0LCBzbyBhXG4gICAgLy8gZGVsZXRlLW9ubHkgcHVsbCBjYW4gc3RpbGwgcmVtb3ZlIGEgbG9jYWxseS1oZWxkIGtleS5cbiAgICB7XG4gICAgICAgIGxldCBiYXNlVmF1bHQgPSBsb2NhbC5hcGlLZXlWYXVsdCB8fCBudWxsO1xuICAgICAgICBsZXQgbG9jYWxLZXlzID0gKGxvY2FsLmFwaUtleVZhdWx0ICYmIGxvY2FsLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9O1xuICAgICAgICBsZXQgYXBpQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSAmJiBzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICAgICAgYmFzZVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBsb2NhbEtleXMgPSB7fTtcbiAgICAgICAgICAgIGFwaUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNoYXJlZCBtZXJnZSAoc3luYy1tZXJnZS5qcyk6IG5ld2VyIHJlbW90ZSB3aW5zLCBkZWxldGlvbiB3aW5zIHRpZXNcbiAgICAgICAgLy8gKGA8PWApLCB0b21ic3RvbmVzIGFyZSBORVZFUiBwcnVuZWQgaGVyZS4gVG9tYnN0b25lcyBhcmUgY2xlYXJlZCBvbmx5XG4gICAgICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5IHRoZSB1c2VyLlxuICAgICAgICBjb25zdCBrZXlNZXJnZSA9IG1lcmdlUmVtb3RlKGxvY2FsS2V5cywgKHN5bmNEYXRhLmFwaUtleVZhdWx0ICYmIHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9LCBkZWxldGVkS2V5cyk7XG4gICAgICAgIGNvbnN0IG1lcmdlZEtleXMgPSBrZXlNZXJnZS5tZXJnZWQ7XG4gICAgICAgIGlmIChrZXlNZXJnZS5jaGFuZ2VkKSBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGFwaUNoYW5nZWQgJiYgYmFzZVZhdWx0KSB7XG4gICAgICAgICAgICB1cGRhdGVzLmFwaUtleVZhdWx0ID0geyAuLi5iYXNlVmF1bHQsIGtleXM6IG1lcmdlZEtleXMgfTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFZhdWx0IGRvY3MgKFA0KSAtLS1cbiAgICBjb25zdCByZW1vdGVEb2NzID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgcmVtb3RlRG9jc1tkb2MucGF0aF0gPSBkb2M7XG4gICAgfVxuICAgIC8vIFNoYXJlZCBtZXJnZTogZGVsZXRpb24gd2lucyB0aWVzLCB0b21ic3RvbmVzIGFyZSBORVZFUiBwcnVuZWQgaGVyZS5cbiAgICBjb25zdCB7IG1lcmdlZDogbWVyZ2VkRG9jcywgY2hhbmdlZDogZG9jc0NoYW5nZWQgfSA9IG1lcmdlUmVtb3RlKGxvY2FsLnZhdWx0RG9jcyB8fCB7fSwgcmVtb3RlRG9jcywgZGVsZXRlZERvY3MpO1xuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFBlcnNpc3QgdGhlIHRvbWJzdG9uZSBzZXRzLiBUaGVzZSBhcmUgYSBQVVJFIFVOSU9OIChtYXggZGVsZXRlZEF0IHBlclxuICAgIC8vIGtleSkgXHUyMDE0IHRoZSBtZXJnZSBuZXZlciByZW1vdmVzIGEgdG9tYnN0b25lLCBzbyB0aGV5IGFyZSByZXRhaW5lZCBmb3JldmVyXG4gICAgLy8gYW5kIGFuIG9mZmxpbmUgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgYSBkZWxldGlvbi4gVGhleSBhcmUgY2xlYXJlZCBvbmx5XG4gICAgLy8gYXQgdGhlIHNvdXJjZSAoc2F2ZURvY3VtZW50TG9jYWwvc2F2ZUFwaUtleSBvbiBzYW1lLWRldmljZSByZWNyZWF0ZSkgb3IgYnlcbiAgICAvLyB0aGUgdXNlciB2aWEgY2xlYXJEZWxldGlvbkhpc3RvcnkuXG4gICAgLy9cbiAgICAvLyBSZXNpZHVhbCAoYWNjZXB0ZWQsIGRvY3VtZW50ZWQpOiBwdXJlIGNyb3NzLWRldmljZSBjbG9jayBza2V3IFx1MjAxNCBhIGxpdmVcbiAgICAvLyBjb3B5IHdob3NlIHVwZGF0ZWRBdCBpcyBnZW51aW5lbHkgTkVXRVIgdGhhbiB0aGUgZGVsZXRlJ3MgdGltZXN0YW1wIFx1MjAxNCB3aW5zXG4gICAgLy8gdW5kZXIgdGhlIGA8PWAgcnVsZSBhbmQgaXMga2VwdC4gVGhhdCBpcyBhbiBpbmhlcmVudCBsYXN0LXdyaXRlLXdpbnMgbGltaXRcbiAgICAvLyB0aGF0IHRvbWJzdG9uZXMgZG8gbm90IHJlc29sdmU7IFwiZml4aW5nXCIgaXQgYnkgcHJ1bmluZyB3b3VsZCByZWludHJvZHVjZVxuICAgIC8vIHRoZSBzYW1lLXNlY29uZCByZXN1cnJlY3Rpb24gYnVnLCBzbyBpdCBpcyBsZWZ0IGFzLWlzLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkRG9jcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWREb2NzIHx8IHt9KSkge1xuICAgICAgICB1cGRhdGVzLmRlbGV0ZWREb2NzID0gZGVsZXRlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkS2V5cyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkS2V5cyA9IGRlbGV0ZWRLZXlzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRQcm9maWxlcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWRQcm9maWxlcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkUHJvZmlsZXMgPSBkZWxldGVkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIC8vIFJhdyBsb2NhbCB3cml0ZSBPTkxZIFx1MjAxNCBuZXZlciBzY2hlZHVsZVN5bmNQdXNoIChsb29wIGludmFyaWFudCkuXG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbiAgICByZXR1cm4gbW92ZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVib3VuY2VkIHB1c2hcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNjaGVkdWxlIGEgc3luYyBwdXNoIHdpdGggYSAyLXNlY29uZCBkZWJvdW5jZS5cbiAqIEV4cG9ydGVkIGZvciB1c2UgYnkgc3RvcmVzIGFuZCB0aGUgc3RvcmFnZSBpbnRlcmNlcHRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlU3luY1B1c2goKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgaWYgKHB1c2hUaW1lcikgY2xlYXJUaW1lb3V0KHB1c2hUaW1lcik7XG4gICAgcHVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHB1c2hUaW1lciA9IG51bGw7XG4gICAgICAgIHB1c2hUb1N5bmMoKTtcbiAgICB9LCAyMDAwKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWxldGlvbi1oaXN0b3J5ICh0b21ic3RvbmUpIHJldGVudGlvbiBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBUb3RhbCBudW1iZXIgb2YgcmV0YWluZWQgZGVsZXRpb24gcmVjb3JkcyAoZG9jcyArIGtleXMpLiBHcm93cyBvdmVyIHRoZSBsaWZlXG4gKiBvZiB0aGUgaW5zdGFsbCBiZWNhdXNlIHRvbWJzdG9uZXMgYXJlIGtlcHQgZm9yZXZlciAoYW4gb2ZmbGluZSBkZXZpY2UgdGhhdFxuICogbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIG11c3Qgbm90IGJlIGFibGUgdG8gcmVzdXJyZWN0IHRoZSBpdGVtKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRvbWJzdG9uZUNvdW50KCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGRlbGV0ZWREb2NzOiB7fSwgZGVsZXRlZEtleXM6IHt9LCBkZWxldGVkUHJvZmlsZXM6IHt9IH0pO1xuICAgIGNvbnN0IGRvY3MgPSBkYXRhLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZERvY3MgOiB7fTtcbiAgICBjb25zdCBrZXlzID0gZGF0YS5kZWxldGVkS2V5cyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRLZXlzIDoge307XG4gICAgY29uc3QgcHJvZmlsZXMgPSBkYXRhLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkUHJvZmlsZXMgOiB7fTtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZG9jcykubGVuZ3RoICsgT2JqZWN0LmtleXMoa2V5cykubGVuZ3RoICsgT2JqZWN0LmtleXMocHJvZmlsZXMpLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBXYXJuaW5nIGxldmVsIGZvciBhIGdpdmVuIHJldGFpbmVkLWRlbGV0aW9uIGNvdW50OlxuICogICAwID0gZmluZSwgMSA9IGdlbnRsZSBudWRnZSAoPj0gOCksIDIgPSBzdHJvbmdlciB3YXJuaW5nICg+PSAxNikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b21ic3RvbmVXYXJuaW5nTGV2ZWwoY291bnQpIHtcbiAgICBpZiAoY291bnQgPj0gVE9NQlNUT05FX1dBUk5fU1RST05HKSByZXR1cm4gMjtcbiAgICBpZiAoY291bnQgPj0gVE9NQlNUT05FX1dBUk5fR0VOVExFKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbn1cblxuLyoqXG4gKiBDbGVhciBhbGwgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeS4gSW5mb3JtZWQtdXNlciBjaG9pY2U6IGEgZGV2aWNlIHRoYXQgaGFzXG4gKiBiZWVuIG9mZmxpbmUgc2luY2UgYmVmb3JlIG9uZSBvZiB0aGVzZSBkZWxldGlvbnMgY2FuLCBvbiBpdHMgbmV4dCBzeW5jLFxuICogcmUtYWRkIHRoZSBpdGVtIFx1MjAxNCBiZWNhdXNlIHRoZSByZWNvcmQgdGhhdCB0b2xkIGV2ZXJ5b25lIGl0IHdhcyBkZWxldGVkIGlzXG4gKiBub3cgZ29uZS4gU2NoZWR1bGVzIGEgcHVzaCBzbyB0aGUgY2xlYXJlZCBzdGF0ZSBwcm9wYWdhdGVzIHRvIHRoZSBtaXJyb3IuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRlbGV0aW9uSGlzdG9yeSgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGRlbGV0ZWREb2NzOiB7fSwgZGVsZXRlZEtleXM6IHt9LCBkZWxldGVkUHJvZmlsZXM6IHt9IH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmNyeXB0aW9uLWZsYWcgc2VsZi1oZWFsIChBMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENsZWFyIGEgYm9ndXMgYGlzRW5jcnlwdGVkPXRydWVgIHdoZW4gdGhpcyBkZXZpY2UgaG9sZHMgbm8gZXZpZGVuY2Ugb2YgcmVhbFxuICogcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgbm8gcGFzc3dvcmQgdmVyaWZpZXIgKHBhc3N3b3JkSGFzaCkgQU5EIG5vIHByb2ZpbGUga2V5XG4gKiB0aGF0IGlzIGEgUEFTU1dPUkQgYmxvYi5cbiAqXG4gKiBHYXRpbmcgZGV0YWlsIChjcml0aWNhbCk6IGV2aWRlbmNlIGlzIGEgUEFTU1dPUkQgYmxvYiAoaXNQYXNzd29yZEJsb2IpLCBOT1QgYVxuICogZGV2aWNlLWtleSBibG9iLiBTaW5jZSB2MS43LjAgZXZlcnkga2V5IGlzIHdyYXBwZWQgYXQgcmVzdCBldmVuIGZvciB0aGVcbiAqIHBhc3N3b3JkbGVzcyBMZXZlbC0wIHVzZXIsIHNvIGEgbm9ybWFsIHBhc3N3b3JkbGVzcyBpbnN0YWxsIGlzIGZ1bGwgb2ZcbiAqIGRldmljZS1rZXkgY2lwaGVydGV4dDsga2V5aW5nIG9mZiB0aGF0IHdvdWxkIHdyb25nbHkga2VlcCB0aGUgZmxhZyBsYXRjaGVkLlxuICogT25seSBhIHBhc3N3b3JkLWRlcml2ZWQgYmxvYiAob3IgdGhlIHZlcmlmaWVyKSBwcm92ZXMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IHRydWUgaWYgYSBib2d1cyBmbGFnIHdhcyBjbGVhcmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UsIHBhc3N3b3JkSGFzaDogbnVsbCwgcHJvZmlsZXM6IFtdIH0pO1xuICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkgcmV0dXJuIGZhbHNlOyAgIC8vIG5vdGhpbmcgbGF0Y2hlZCBcdTIwMTQgbm90aGluZyB0byBoZWFsXG4gICAgaWYgKGRhdGEucGFzc3dvcmRIYXNoKSByZXR1cm4gZmFsc2U7ICAgLy8gcmVhbCB2ZXJpZmllciBwcmVzZW50IFx1MjAxNCBrZWVwIHRoZSBmbGFnXG5cbiAgICBjb25zdCBoYXNQYXNzd29yZEJsb2IgPSBBcnJheS5pc0FycmF5KGRhdGEucHJvZmlsZXMpICYmXG4gICAgICAgIGRhdGEucHJvZmlsZXMuc29tZShwID0+IHAgJiYgaXNQYXNzd29yZEJsb2IocC5wcml2S2V5KSk7XG4gICAgaWYgKGhhc1Bhc3N3b3JkQmxvYikgcmV0dXJuIGZhbHNlOyAgICAgLy8gcGFzc3dvcmQtZW5jcnlwdGVkIGtleSBtYXRlcmlhbCBcdTIwMTQga2VlcFxuXG4gICAgLy8gRmxhZyBpcyBib2d1cyAoZS5nLiBtaXJyb3JlZCBpbiBmcm9tIGFub3RoZXIgZGV2aWNlIHRoYXQgRElEIGhhdmUgYVxuICAgIC8vIHBhc3N3b3JkKS4gQ2xlYXIgaXQgc28gdGhpcyBkZXZpY2UgaXMgbm90IHN0cmFuZGVkIGF0IGEgZGVhZC1lbmQgdW5sb2NrLlxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIENsZWFyZWQgYm9ndXMgaXNFbmNyeXB0ZWQgZmxhZyAobm8gcGFzc3dvcmQgdmVyaWZpZXIvYmxvYiknKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFbmFibGUgLyBkaXNhYmxlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gZGF0YVtMT0NBTF9FTkFCTEVEX0tFWV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiBlbmFibGVkIH0pO1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVkdWNlIGV2ZXJ5IGJ1bmtlclVybCBpbiB0aGUgYHByb2ZpbGVzYCBtaXJyb3IgdG8gaXRzIGFkZHJlc3MuIFdvcmtzIG9uIHRoZVxuICogc3RvcmVkIGRhdGEgZGlyZWN0bHksIHNvIGl0IGRvZXMgbm90IGRlcGVuZCBvbiBzeW5jIGJlaW5nIGVuYWJsZWQsIGFuZCB3cml0ZXNcbiAqIG5vdGhpbmcgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGNoYW5nZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNjcnViU3luY2VkUHJvZmlsZXMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm47XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgY29uc3QgcHJvZmlsZXMgPSByYXcgPyByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKCdwcm9maWxlcycsIHJhdykgOiBudWxsO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9maWxlcykpIHJldHVybjtcbiAgICBjb25zdCBjbGVhbiA9IHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKTtcbiAgICBpZiAoY2xlYW4gPT09IHByb2ZpbGVzKSByZXR1cm47XG5cbiAgICBjb25zdCBlbnRyaWVzID0gY2h1bmtWYWx1ZSgncHJvZmlsZXMnLCBKU09OLnN0cmluZ2lmeShjbGVhbikpO1xuICAgIGNvbnN0IHBheWxvYWQgPSBPYmplY3QuZnJvbUVudHJpZXMoZW50cmllcy5tYXAoZSA9PiBbZS5rZXksIGUudmFsdWVdKSk7XG4gICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQocGF5bG9hZCk7XG4gICAgY29uc3QgdW51c2VkID0gT2JqZWN0LmtleXMocmF3KS5maWx0ZXIoayA9PlxuICAgICAgICBrLnN0YXJ0c1dpdGgoYCR7Q0hVTktfUFJFRklYfXByb2ZpbGVzOmApICYmICEoayBpbiBwYXlsb2FkKVxuICAgICk7XG4gICAgaWYgKHVudXNlZC5sZW5ndGggPiAwKSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZSh1bnVzZWQpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEluaXRpYWxpc2F0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDYWxsZWQgb25jZSBvbiBzdGFydHVwIChmcm9tIGJhY2tncm91bmQuanMpLlxuICogUHVsbHMgZnJvbSBzeW5jLCBtZXJnZXMsIHRoZW4gbGlzdGVucyBmb3IgcmVtb3RlIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0U3luYygpIHtcbiAgICAvLyBTZWxmLWhlYWwgYSBib2d1cyBlbmNyeXB0aW9uIGZsYWcgZmlyc3QgXHUyMDE0IHRoaXMgbXVzdCBydW4gZXZlbiB3aGVuIHN5bmMgaXNcbiAgICAvLyB1bmF2YWlsYWJsZSBvciBkaXNhYmxlZCwgYmVjYXVzZSB0aGUgYmFkIHN0YXRlIGl0IGZpeGVzIG1heSBoYXZlIGJlZW4gbGVmdFxuICAgIC8vIGJlaGluZCBieSBhbiBlYXJsaWVyIChub3ctcmVtb3ZlZCkgaXNFbmNyeXB0ZWQtc3luY2luZyBidWlsZC5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBzdG9yYWdlLnN5bmMgbm90IGF2YWlsYWJsZSBcdTIwMTQgc2tpcHBpbmcnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNjcnViU3luY2VkUHJvZmlsZXMoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gc2NydWJTeW5jZWRQcm9maWxlcyBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUGxhdGZvcm0gc3luYyBkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHVsbCArIG1lcmdlXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc3luY0RhdGEgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHN5bmNEYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwrbWVyZ2UgY29tcGxldGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIE5vIHN5bmMgZGF0YSBmb3VuZCBcdTIwMTQgZnJlc2ggc3luYycpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgLy8gTGlzdGVuIGZvciByZW1vdGUgY2hhbmdlc1xuICAgIGlmIChhcGkuc3RvcmFnZS5vbkNoYW5nZWQpIHtcbiAgICAgICAgYXBpLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZWFOYW1lICE9PSAnc3luYycpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFJlbW90ZSBzeW5jIGNoYW5nZSBkZXRlY3RlZCcpO1xuICAgICAgICAgICAgLy8gUmUtcHVsbCBhbmQgbWVyZ2UgdGhlIGZ1bGwgc3luYyBkYXRhIHRvIGhhbmRsZSBjaHVua2VkIHZhbHVlcyBjb3JyZWN0bHlcbiAgICAgICAgICAgIHB1bGxGcm9tU3luYygpLnRoZW4oc3luY0RhdGEgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzeW5jRGF0YSkgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBSZW1vdGUgbWVyZ2UgZXJyb3I6JywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRG8gYW4gaW5pdGlhbCBwdXNoIHNvIGxvY2FsIGRhdGEgaXMgbWlycm9yZWRcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG4iLCAiLyoqXG4gKiBTaGFyZWQgdG9tYnN0b25lLWF3YXJlIG1lcmdlLlxuICpcbiAqIE9uZSBydWxlIGZvciBldmVyeSBwbGFjZSByZW1vdGUgZGF0YSBtZWV0cyBsb2NhbCBkYXRhICh0aGUgc3RvcmFnZS5zeW5jXG4gKiBtaXJyb3IgYW5kIGJvdGggcmVsYXkgcHVsbHMsIHZhdWx0IGRvY3VtZW50cyBhbmQgQVBJIGtleXMpOiBhIHJlbW90ZSBpdGVtIGlzXG4gKiBkcm9wcGVkIHdoZW4gYSB0b21ic3RvbmUgZm9yIGl0cyBrZXkgaXMgZGF0ZWQgYXQgb3IgYWZ0ZXIgdGhlIHJlbW90ZSBpdGVtJ3NcbiAqIG93biB0aW1lc3RhbXAuIERlbGV0aW9uIHdpbnMgdGllcy4gQSBjb3B5IHdyaXR0ZW4gYWZ0ZXIgdGhlIGRlbGV0aW9uIChhXG4gKiByZS1jcmVhdGUpIGNhcnJpZXMgYSBuZXdlciB0aW1lc3RhbXAgYW5kIGlzIGtlcHQuXG4gKlxuICogVG9tYnN0b25lcyBhcmUgbmV2ZXIgcHJ1bmVkIGhlcmUuXG4gKi9cblxuLyoqXG4gKiBJcyBgaXRlbWAgc3VwZXJzZWRlZCBieSB0aGUgdG9tYnN0b25lIGZvciBga2V5YD9cbiAqIEBwYXJhbSB7T2JqZWN0fSB0b21ic3RvbmVzIC0geyBrZXk6IGRlbGV0ZWRBdFNlY29uZHMgfVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgLSB0aGUgaXRlbSdzIHRpbWVzdGFtcCBpbiBzZWNvbmRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1RvbWJzdG9uZWQodG9tYnN0b25lcywga2V5LCB0aW1lKSB7XG4gICAgaWYgKCF0b21ic3RvbmVzIHx8IHR5cGVvZiB0b21ic3RvbmVzICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHRzID0gdG9tYnN0b25lc1trZXldO1xuICAgIHJldHVybiB0cyAhPSBudWxsICYmICh0aW1lIHx8IDApIDw9IHRzO1xufVxuXG4vKipcbiAqIE1lcmdlIGEgcmVtb3RlIG1hcCBpbnRvIGEgbG9jYWwgbWFwLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbCAtIHsga2V5OiBpdGVtIH1cbiAqIEBwYXJhbSB7T2JqZWN0fSByZW1vdGUgLSB7IGtleTogaXRlbSB9XG4gKiBAcGFyYW0ge09iamVjdH0gdG9tYnN0b25lcyAtIHsga2V5OiBkZWxldGVkQXRTZWNvbmRzIH1cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0c11cbiAqIEBwYXJhbSB7KGl0ZW06T2JqZWN0KT0+bnVtYmVyfSBbb3B0cy50aW1lT2ZdIC0gaXRlbSB0aW1lc3RhbXAgKGRlZmF1bHQgdXBkYXRlZEF0KVxuICogQHJldHVybnMge3sgbWVyZ2VkOiBPYmplY3QsIGNoYW5nZWQ6IGJvb2xlYW4gfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlUmVtb3RlKGxvY2FsLCByZW1vdGUsIHRvbWJzdG9uZXMsIG9wdHMgPSB7fSkge1xuICAgIGNvbnN0IHRpbWVPZiA9IG9wdHMudGltZU9mIHx8ICgoaXRlbSkgPT4gKGl0ZW0gJiYgaXRlbS51cGRhdGVkQXQpIHx8IDApO1xuICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4uKGxvY2FsIHx8IHt9KSB9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBba2V5LCBpdGVtXSBvZiBPYmplY3QuZW50cmllcyhyZW1vdGUgfHwge30pKSB7XG4gICAgICAgIGlmICghaXRlbSkgY29udGludWU7XG4gICAgICAgIGlmIChpc1RvbWJzdG9uZWQodG9tYnN0b25lcywga2V5LCB0aW1lT2YoaXRlbSkpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbWluZSA9IG1lcmdlZFtrZXldO1xuICAgICAgICBpZiAoIW1pbmUgfHwgdGltZU9mKGl0ZW0pID4gdGltZU9mKG1pbmUpKSB7XG4gICAgICAgICAgICBtZXJnZWRba2V5XSA9IGl0ZW07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhtZXJnZWQpKSB7XG4gICAgICAgIGlmIChpc1RvbWJzdG9uZWQodG9tYnN0b25lcywga2V5LCB0aW1lT2YobWVyZ2VkW2tleV0pKSkge1xuICAgICAgICAgICAgZGVsZXRlIG1lcmdlZFtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgbWVyZ2VkLCBjaGFuZ2VkIH07XG59XG5cbi8qKlxuICogQ29sbGVjdCBkZWxldGlvbiB0aW1lcyBmcm9tIHRoZSBhdXRob3IncyBvd24ga2luZCA1IGV2ZW50cyAoTklQLTA5KSBmb3IgdGhlXG4gKiBnaXZlbiBkLXRhZ3MuIEFjY2VwdHMgYGFgIHRhZ3MgYDMwMDc4OjxwdWJrZXk+OjxkdGFnPmAsIGFuZCB0aGUgZWFybGllclxuICogYDMwMDc4Ojo8ZHRhZz5gIHNoYXBlIHRoaXMgZXh0ZW5zaW9uIHVzZWQgdG8gd3JpdGUgKHRoZSBhdXRob3IgaXMgYWxyZWFkeVxuICogdmVyaWZpZWQgYnkgdGhlIGNhbGxlcikuIEFsc28gbWFwcyBgZWAgdGFncyB0aHJvdWdoIGBldmVudElkVG9EdGFnYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGRlbGV0aW9ucyAtIHZlcmlmaWVkIGtpbmQgNSBldmVudHMgYnkgYHB1YmtleWBcbiAqIEBwYXJhbSB7c3RyaW5nfSBwdWJrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXZlbnRJZFRvRHRhZ10gLSB7IGV2ZW50SWQ6IGR0YWcgfVxuICogQHJldHVybnMge09iamVjdH0geyBkdGFnOiBsYXRlc3REZWxldGlvbkNyZWF0ZWRBdCB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGlvblRvbWJzdG9uZXMoZGVsZXRpb25zLCBwdWJrZXksIGV2ZW50SWRUb0R0YWcgPSB7fSkge1xuICAgIGNvbnN0IG91dCA9IHt9O1xuICAgIGNvbnN0IG5vdGUgPSAoZHRhZywgdHMpID0+IHtcbiAgICAgICAgaWYgKG91dFtkdGFnXSA9PSBudWxsIHx8IHRzID4gb3V0W2R0YWddKSBvdXRbZHRhZ10gPSB0cztcbiAgICB9O1xuICAgIGZvciAoY29uc3QgZXYgb2YgZGVsZXRpb25zIHx8IFtdKSB7XG4gICAgICAgIGlmICghZXYgfHwgZXYua2luZCAhPT0gNSB8fCBldi5wdWJrZXkgIT09IHB1YmtleSkgY29udGludWU7XG4gICAgICAgIGZvciAoY29uc3QgdGFnIG9mIGV2LnRhZ3MgfHwgW10pIHtcbiAgICAgICAgICAgIGlmICh0YWdbMF0gPT09ICdhJyAmJiB0eXBlb2YgdGFnWzFdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGwgPSBgMzAwNzg6JHtwdWJrZXl9OmA7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVnYWN5ID0gJzMwMDc4OjonO1xuICAgICAgICAgICAgICAgIGlmICh0YWdbMV0uc3RhcnRzV2l0aChmdWxsKSkgbm90ZSh0YWdbMV0uc2xpY2UoZnVsbC5sZW5ndGgpLCBldi5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0YWdbMV0uc3RhcnRzV2l0aChsZWdhY3kpKSBub3RlKHRhZ1sxXS5zbGljZShsZWdhY3kubGVuZ3RoKSwgZXYuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRhZ1swXSA9PT0gJ2UnICYmIGV2ZW50SWRUb0R0YWdbdGFnWzFdXSkge1xuICAgICAgICAgICAgICAgIG5vdGUoZXZlbnRJZFRvRHRhZ1t0YWdbMV1dLCBldi5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufVxuIiwgIi8qKlxuICogU2VjcmV0IFZhdWx0IFx1MjAxNCBhdC1yZXN0IGVuY3J5cHRpb24gZm9yIHByaXZhdGUga2V5cyBhbmQgYXBwbGljYXRpb24gc2VjcmV0cy5cbiAqXG4gKiBUaHJlYXQgbW9kZWwgKFQwLTQpOiByYXcgc2VjcmV0IGJ5dGVzIG11c3QgbmV2ZXIgc2l0IGluIGJyb3dzZXIgc3RvcmFnZSBpblxuICogY2xlYXJ0ZXh0LCBldmVuIGZvciB0aGUgREVGQVVMVCBwYXNzd29yZGxlc3MgdXNlci4gVGhpcyBtb2R1bGUgcHJvdmlkZXMgdHdvXG4gKiB3cmFwcGluZyBzdHJhdGVnaWVzIGJlaGluZCBvbmUgYHdyYXBTZWNyZXRgIC8gYHVud3JhcFNlY3JldGAgaW50ZXJmYWNlOlxuICpcbiAqICAgMS4gREVWSUNFIEtFWSAoZGVmYXVsdCwgbm8gbWFzdGVyIHBhc3N3b3JkKSBcdTIwMTQgYSBub24tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ01cbiAqICAgICAgQ3J5cHRvS2V5LiBUaHJlZSBwZXJzaXN0ZW5jZSBzdHJhdGVnaWVzIGV4aXN0LCBhbmQgZWFjaCBpcyBWRVJJRklFRFxuICogICAgICAocmVhZCBiYWNrIGFuZCByb3VuZC10cmlwcGVkIHRocm91Z2ggZW5jcnlwdC9kZWNyeXB0KSBiZWZvcmUgaXQgaXNcbiAqICAgICAgdHJ1c3RlZDpcbiAqXG4gKiAgICAgICAgYS4gYGlkYmAgICAgXHUyMDE0IGEgQ3J5cHRvS2V5ICpoYW5kbGUqIGluIEluZGV4ZWREQi4gT25seSBldmVyIEFET1BURUQsXG4gKiAgICAgICAgICAgICAgICAgICAgICBuZXZlciBtaW50ZWQ6IHdlIHRydXN0IGBpZGJgIGV4Y2x1c2l2ZWx5IHdoZW4gZGIuZ2V0KClcbiAqICAgICAgICAgICAgICAgICAgICAgIGhhbmRzIGJhY2sgYSBQUkUtRVhJU1RJTkcga2V5IHRoYXQgcm91bmQtdHJpcHMsIGJlY2F1c2VcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoYXQgXHUyMDE0IGFuZCBvbmx5IHRoYXQgXHUyMDE0IHByb3ZlcyB0aGUgaGFuZGxlIHN1cnZpdmVkIGFcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzIGNvbnRleHQuIEEgc2FtZS1jb250ZXh0IHB1dFx1MjE5MmdldCBwcm9iZSBjYW5ub3RcbiAqICAgICAgICAgICAgICAgICAgICAgIHByb3ZlIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UuIEtlZXBpbmcgdGhlIGFkb3B0IHBhdGhcbiAqICAgICAgICAgICAgICAgICAgICAgIHByZXNlcnZlcyBldmVyeSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3cml0dGVuIGJlZm9yZVxuICogICAgICAgICAgICAgICAgICAgICAgMS44LjEsIHdob3NlIGJsb2JzIGxpdmUgdW5kZXIgdGhpcyBrZXkuXG4gKiAgICAgICAgICAgICAgICAgICAgICAqKk5FVkVSIHVzZWQgYXMgdGhlIHdyYXBwaW5nIGtleSBvbiBTYWZhcmkuKiogT24gV2ViS2l0XG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgdHdvIHN0b3JhZ2UgYXJlYXMgZG8gbm90IHNoYXJlIGEgbGlmZXRpbWUgdGhlIHdheVxuICogICAgICAgICAgICAgICAgICAgICAgdGhleSBkbyBvbiBDaHJvbWl1bS9HZWNrbywgc28gYW4gYWRvcHRlZCBJbmRleGVkREIga2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBpcyBub3QgYSBzYWZlIHdyYXBwaW5nIGtleSB0aGVyZS4gU2FmYXJpIHRoZXJlZm9yZSBhbHdheXNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyaXRlcyB1bmRlciBgc2VlZGAgKGJ1bmRsZS1zY29wZWQgYHN0b3JhZ2UubG9jYWxgKTtcbiAqICAgICAgICAgICAgICAgICAgICAgIGFkb3B0ZWQgSURCIGtleXMgYXJlIGRlY3J5cHQtb25seSBsZWdhY3kgb24gU2FmYXJpLCBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBhdC1yZXN0IG1pZ3JhdGlvbiByZS13cmFwcyBFVkVSWSBkZXZpY2UgYmxvYiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbiBzdG9yZXMgXHUyMDE0IHByb2ZpbGUgcHJpdmF0ZSBrZXlzLCBBUEkta2V5XG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzLCB2YXVsdC1ub3RlIGJvZGllcywgYW5kIE5JUC00NiBidW5rZXIgc2Vzc2lvblxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cyAvIHNlc3Npb24gcHJpdmF0ZSBrZXlzIFx1MjAxNCBub3QganVzdCBwcm9maWxlIGtleXMuXG4gKiAgICAgICAgICAgICAgICAgICAgICAoUGVyLWVuZ2luZSBzdG9yYWdlLXNjb3BpbmcgcmF0aW9uYWxlOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgICAgICAgICAgICAgICAgIGBhcmNoaXRlY3R1cmUvZGV2aWNlLWtleS1zdHJhdGVneS5tZGAuKVxuICogICAgICAgIGIuIGBzZWVkYCAgIFx1MjAxNCAzMiByYW5kb20gYnl0ZXMgaW4gYGJyb3dzZXIuc3RvcmFnZS5sb2NhbGAgdW5kZXJcbiAqICAgICAgICAgICAgICAgICAgICAgIGBkZXZpY2VLZXlTZWVkYCwgaW1wb3J0ZWQgYXMgYSBub24tZXh0cmFjdGFibGUgQUVTLUdDTVxuICogICAgICAgICAgICAgICAgICAgICAga2V5IGF0IGxvYWQuIFRoaXMgaXMgd2hlcmUgRVZFUlkgbmV3IGRldmljZSBrZXkgbGFuZHMsXG4gKiAgICAgICAgICAgICAgICAgICAgICBvbiBldmVyeSBwbGF0Zm9ybTogd2hlbiBubyBwcmUtZXhpc3RpbmcgSURCIGtleSBpc1xuICogICAgICAgICAgICAgICAgICAgICAgZm91bmQgd2UgZG8gbm90IG1pbnQgb25lLCB3ZSBzZWVkLiBDaHJvbWUvRmlyZWZveCBmcmVzaFxuICogICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbHMgdGhlcmVmb3JlIHVzZSBgc2VlZGAgdG9vIFx1MjAxNCBvbmUgY29kZSBwYXRoLCBhbmRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSBvbmx5IG9uZSB3aG9zZSBwZXJzaXN0ZW5jZSB3ZSBjYW4gYWN0dWFsbHkgdmVyaWZ5LlxuICogICAgICAgIGMuIGBtZW1vcnlgIFx1MjAxNCBsYXN0IHJlc29ydCAodW5pdCB0ZXN0cywgc2FuZGJveGVkIGNvbnRleHRzKS4gU2VjcmV0c1xuICogICAgICAgICAgICAgICAgICAgICAgd3JhcHBlZCBoZXJlIGRvIG5vdCBzdXJ2aXZlIGEgcmVsb2FkLlxuICpcbiAqICAgICAgVGhlIHJlc29sdmVkIHN0cmF0ZWd5IGlzIFNUSUNLWTogaXQgaXMgcmVjb3JkZWQgaW4gc3RvcmFnZS5sb2NhbCB1bmRlclxuICogICAgICBgZGV2aWNlS2V5U3RyYXRlZ3lgIGFuZCBob25vdXJlZCBvbiBsYXRlciBsb2Fkcywgc28gYSBjb250ZXh0IGNhbm5vdFxuICogICAgICBzaWxlbnRseSBmbGlwIHN0cmF0ZWdpZXMgYW5kIG9ycGhhbiB0aGUgYmxvYnMgd3JpdHRlbiB1bmRlciB0aGUgb2xkXG4gKiAgICAgIG9uZS4gRGVjcnlwdGlvbiBpcyBzeW1tZXRyaWMgcmVnYXJkbGVzczogYGRlY3J5cHRXaXRoRGV2aWNlS2V5YCB0cmllc1xuICogICAgICB0aGUgY3VycmVudCBrZXksIHRoZW4gZXZlcnkgb3RoZXIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBldmVyIGhhdmUgaGFkXG4gKiAgICAgIChsZWdhY3kgSURCIGhhbmRsZSwgZXhpc3Rpbmcgc2VlZCksIGFuZCBjYWxsZXJzIHVzaW5nXG4gKiAgICAgIGBkZWNyeXB0RGV2aWNlQmxvYkZvclJld3JhcGAgcmUtd3JhcCB1bmRlciB0aGUgY3VycmVudCBzdHJhdGVneS5cbiAqXG4gKiAgICAgIFRocmVhdCBtb2RlbCwgaG9uZXN0bHkgc3RhdGVkOiB0aGUgcGFzc3dvcmRsZXNzIGRldmljZSB0aWVyIGlzIGF0LXJlc3RcbiAqICAgICAgcHJvdGVjdGlvbiBhZ2FpbnN0IGNhc3VhbCBpbnNwZWN0aW9uIG9mIGV4dGVuc2lvbiBzdG9yYWdlLCBOT1QgYSBkZWZlbmNlXG4gKiAgICAgIGFnYWluc3QgY29kZSBhbHJlYWR5IGV4ZWN1dGluZyBpbiB0aGlzIGV4dGVuc2lvbidzIGNvbnRleHQuIFRoZVxuICogICAgICBzdHJvbmdlc3QgdGllciBhdmFpbGFibGUgdG9kYXkgaXMgYSAqKm1hc3RlciBwYXNzd29yZCoqIChiZWxvdyksIHdoaWNoXG4gKiAgICAgIGRlcml2ZXMgdGhlIHdyYXBwaW5nIGtleSBmcm9tIGEgc2VjcmV0IHRoYXQgaXMgbmV2ZXIgc3RvcmVkLiBVc2Vyc1xuICogICAgICBob2xkaW5nIGhpZ2gtdmFsdWUga2V5cyBzaG91bGQgc2V0IG9uZS4gQSBoYXJkd2FyZS1iYWNrZWQgZGV2aWNlIGtleSBpc1xuICogICAgICBmdXR1cmUgd29yay4gKFRpZXIgdHJhZGVvZmZzIGluIGZ1bGw6IFBSSVZBVEUgYml6ZG9jc1xuICogICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqXG4gKiAgIDIuIFNFU1NJT04gS0VZIChtYXN0ZXIgcGFzc3dvcmQgc2V0ICsgdW5sb2NrZWQpIFx1MjAxNCB0aGUgQUVTLTI1Ni1HQ00ga2V5XG4gKiAgICAgIGRlcml2ZWQgZnJvbSB0aGUgcGFzc3dvcmQgKHNlZSBjcnlwdG8uanMpLiBTZXQgYnkgdGhlIGJhY2tncm91bmQgd29ya2VyXG4gKiAgICAgIG9uIHVubG9jayB2aWEgYHNldFNlc3Npb25LZXlgLCBjbGVhcmVkIG9uIGxvY2sgdmlhIGBjbGVhclNlc3Npb25gLlxuICpcbiAqIEJsb2IgZm9ybWF0cyAoYm90aCBhcmUgc2VsZi1kZXNjcmliaW5nIEpTT04gc3RyaW5ncyk6XG4gKiAgIHBhc3N3b3JkIGJsb2IgOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqICAgZGV2aWNlICBibG9iIDogeyB2OjEsIGs6XCJkZXZpY2VcIiwgaXYsIGNpcGhlcnRleHQgfVxuICpcbiAqIGB1bndyYXBTZWNyZXRgIHJlZnVzZXMgdG8gZGVjcnlwdCB3aGVuIHRoZSBzZXNzaW9uIGhhcyBiZWVuIGV4cGxpY2l0bHkgbG9ja2VkXG4gKiAoRjUvRjYpIHNvIGEgbG9ja2VkIHBhZ2UgY2Fubm90IHJlYWQgc2VjcmV0cy5cbiAqL1xuXG5pbXBvcnQgeyBlbmNyeXB0V2l0aEtleSwgZGVjcnlwdFdpdGhLZXkgfSBmcm9tICcuL2NyeXB0byc7XG5cbmNvbnN0IElWX0JZVEVTID0gMTI7XG5jb25zdCBERVZJQ0VfREIgPSAnbm9zdHJrZXktc2VjcmV0LXZhdWx0JztcbmNvbnN0IERFVklDRV9TVE9SRSA9ICdrZXlzJztcbmNvbnN0IERFVklDRV9LRVlfSUQgPSAnZGV2aWNlLXdyYXAta2V5LXYxJztcbi8vIHN0b3JhZ2UubG9jYWwga2V5IGhvbGRpbmcgdGhlIGJhc2U2NCByYXcgc2VlZCBmb3IgdGhlIGBzZWVkYCBzdHJhdGVneS5cbmNvbnN0IERFVklDRV9TRUVEX0tFWSA9ICdkZXZpY2VLZXlTZWVkJztcbmNvbnN0IERFVklDRV9TRUVEX0JZVEVTID0gMzI7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBTVElDS1kgcmVzb2x2ZWQgc3RyYXRlZ3kgKCdpZGInIHwgJ3NlZWQnKS5cbmNvbnN0IERFVklDRV9TVFJBVEVHWV9LRVkgPSAnZGV2aWNlS2V5U3RyYXRlZ3knO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgKGtlcHQgbG9jYWwgc28gdGhpcyBtb2R1bGUgaGFzIG5vIGNyb3NzLWRlcHMpIC0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gYWJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VG9BYihiNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gU2Vzc2lvbiAocGFzc3dvcmQtZGVyaXZlZCkga2V5IHN0YXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9zZXNzaW9uS2V5ID0gbnVsbDsgICAvLyBDcnlwdG9LZXkgfCBudWxsXG5sZXQgX3Nlc3Npb25TYWx0ID0gbnVsbDsgIC8vIFVpbnQ4QXJyYXkgfCBudWxsXG4vLyBfdW5sb2NrZWQ6IG51bGwgPSBwYXNzd29yZGxlc3MgLyBub3QgYXBwbGljYWJsZSAobmV2ZXIgbG9ja2VkKSxcbi8vICAgICAgICAgICAgdHJ1ZSA9IHVubG9ja2VkLCBmYWxzZSA9IGxvY2tlZCAocmVmdXNlIHNlY3JldCByZWFkcykuXG5sZXQgX3VubG9ja2VkID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlc3Npb25LZXkoY3J5cHRvS2V5LCBzYWx0KSB7XG4gICAgX3Nlc3Npb25LZXkgPSBjcnlwdG9LZXk7XG4gICAgX3Nlc3Npb25TYWx0ID0gc2FsdDtcbiAgICBfdW5sb2NrZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuICAgIF9zZXNzaW9uS2V5ID0gbnVsbDtcbiAgICBfc2Vzc2lvblNhbHQgPSBudWxsO1xuICAgIF91bmxvY2tlZCA9IGZhbHNlO1xufVxuXG4vKiogRXhwbGljaXRseSBtYXJrIHRoZSBzZXNzaW9uIHVubG9ja2VkL2xvY2tlZCB3aXRob3V0IHByb3ZpZGluZyBhIGtleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVbmxvY2tlZCh2KSB7XG4gICAgX3VubG9ja2VkID0gdiA9PT0gbnVsbCA/IG51bGwgOiAhIXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZXNzaW9uS2V5KCkge1xuICAgIHJldHVybiAhIV9zZXNzaW9uS2V5O1xufVxuXG4vLyAtLS0gRGV2aWNlIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbmxldCBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsOyAgIC8vICdpZGInIHwgJ3NlZWQnIHwgJ21lbW9yeScgXHUyMDE0IHNldCBvbmNlIHJlc29sdmVkXG5sZXQgX21lbW9yeURldmljZUtleSA9IG51bGw7ICAvLyBsYXN0LXJlc29ydCBrZXkgZm9yIGNvbnRleHRzIHRoYXQgcGVyc2lzdCBub3RoaW5nXG5sZXQgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsOyAvLyByZWFkLW9ubHkgaGFuZGxlIG9uIHRoZSBwcmUtMS44LjEgSURCIGtleVxubGV0IF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiBhbiBleGlzdGluZyBzZWVkIGtleVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURldmljZUtleSgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGU6IHJhdyBieXRlcyBjYW4gbmV2ZXIgYmUgcmVhZCBiYWNrIG91dFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWREYkF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5kZXhlZERCICE9PSBudWxsO1xufVxuXG4vKipcbiAqIFByb3ZlIGEgY2FuZGlkYXRlIGtleSBpcyBhY3R1YWxseSB1c2FibGUgYmVmb3JlIHdlIHRydXN0IGEgc3RyYXRlZ3kgd2l0aCBhXG4gKiB1c2VyJ3Mgb25seSBjb3B5IG9mIGEgcHJpdmF0ZSBrZXkuIEEgcmVhZC1iYWNrIGhhbmRsZSB0aGF0IHN0cnVjdHVyZWQtY2xvbmVcbiAqIG1hbmdsZWQgKG9yIGEgc2VlZCB0aGF0IGNhbWUgYmFjayB0cnVuY2F0ZWQpIGZhaWxzIGhlcmUgaW5zdGVhZCBvZiBzaWxlbnRseVxuICogcHJvZHVjaW5nIHVuZGVjcnlwdGFibGUgYmxvYnMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGtleVJvdW5kVHJpcHMoa2V5KSB7XG4gICAgaWYgKCFrZXkpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICAgICAgY29uc3QgcHJvYmUgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ25vc3Rya2V5LWRldmljZS1wcm9iZScpO1xuICAgICAgICBjb25zdCBjdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBwcm9iZSk7XG4gICAgICAgIGNvbnN0IHB0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGN0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwdCkgPT09ICdub3N0cmtleS1kZXZpY2UtcHJvYmUnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBvcGVuRGV2aWNlRGIoKSB7XG4gICAgLy8gTGF6eSBpbXBvcnQgc28gdGhlIG1vZHVsZSB3b3JrcyBpbiBjb250ZXh0cy90ZXN0cyB3aXRob3V0IGlkYiBidW5kbGVkLlxuICAgIGNvbnN0IHsgb3BlbkRCIH0gPSBhd2FpdCBpbXBvcnQoJ2lkYicpO1xuICAgIHJldHVybiBvcGVuREIoREVWSUNFX0RCLCAxLCB7XG4gICAgICAgIHVwZ3JhZGUoZCkge1xuICAgICAgICAgICAgaWYgKCFkLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREVWSUNFX1NUT1JFKSkge1xuICAgICAgICAgICAgICAgIGQuY3JlYXRlT2JqZWN0U3RvcmUoREVWSUNFX1NUT1JFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTdHJhdGVneSAoYSk6IEFET1BUIGEgcHJlLWV4aXN0aW5nIG5vbi1leHRyYWN0YWJsZSBDcnlwdG9LZXkgaGFuZGxlIGZyb21cbiAqIEluZGV4ZWREQi4gTmV2ZXIgbWludHMgb25lLlxuICpcbiAqIEEga2V5IHRoYXQgZGIuZ2V0KCkgaGFuZHMgYmFjayBpcyBhIGtleSBzb21lIEVBUkxJRVIgY29udGV4dCB3cm90ZSwgc28gaXQgaXNcbiAqIHByb29mIG9mIGNyb3NzLWNvbnRleHQgcGVyc2lzdGVuY2UgXHUyMDE0IHRoZSBvbmUgdGhpbmcgYSBzYW1lLWNvbnRleHRcbiAqIHB1dFx1MjE5MmdldFx1MjE5MnJvdW5kLXRyaXAgcHJvYmUgY2FuIG5ldmVyIGVzdGFibGlzaC4gaU9TIFNhZmFyaSdzIEluZGV4ZWREQiBpc1xuICogZnVuY3Rpb25hbCBidXQgZXBoZW1lcmFsIGZvciB0aGUgZXh0ZW5zaW9uIGJhY2tncm91bmQ6IGl0IHdvdWxkIGhhdmUgcGFzc2VkXG4gKiB0aGUgcHJvYmUgYW5kIHRoZW4gbG9zdCB0aGUgdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBTbzogbm9cbiAqIHByZS1leGlzdGluZyBrZXkgbWVhbnMgbm8gYGlkYmAsIGFuZCB0aGUgY2FsbGVyIHNlZWRzIGluc3RlYWQuXG4gKlxuICogUmV0dXJucyBudWxsIChuZXZlciB0aHJvd3MpIHdoZW4gbm90aGluZyB1c2FibGUgaXMgdGhlcmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeUlkYkRldmljZUtleSgpIHtcbiAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICBpZiAoIWV4aXN0aW5nKSByZXR1cm4gbnVsbDsgLy8gZW1wdHkgc3RvcmUgXHUyMTkyIHNlZWQsIGRvIE5PVCBtaW50IGhlcmVcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGV4aXN0aW5nKSkgPyBleGlzdGluZyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgc3RvcmFnZSBhcmVhIGJhY2tpbmcgdGhlIGBzZWVkYCBzdHJhdGVneS4gSW1wb3J0ZWQgbGF6aWx5IGJlY2F1c2VcbiAqIGJyb3dzZXItcG9seWZpbGwgdGhyb3dzIGF0IG1vZHVsZSBsb2FkIHdoZW4gbm8gZXh0ZW5zaW9uIG5hbWVzcGFjZSBleGlzdHMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNlZWRTdG9yYWdlKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICByZXR1cm4gYXBpPy5zdG9yYWdlPy5sb2NhbCB8fCBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBTaWduYWwgMjogYSBXZWJLaXQgdXNlciBhZ2VudCB3aXRoIG5vIENocm9taXVtIG1hcmtlciBvbiBpdC4gKi9cbmZ1bmN0aW9uIGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB1YSA9ICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50KSB8fCAnJztcbiAgICAgICAgcmV0dXJuIC9TYWZhcml8QXBwbGVXZWJLaXQvLnRlc3QodWEpICYmICEvQ2hyb20oZXxpdW0pfEVkZ1xcL3xPUFJcXC8vLnRlc3QodWEpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFRydWUgb24gU2FmYXJpIChpT1MgKyBtYWNPUyksIHdoZXJlIEluZGV4ZWREQiBtdXN0IE5FVkVSIGhvbGQgdGhlIHdyYXBwaW5nXG4gKiBrZXkgXHUyMDE0IHNlZSB0aGUgbW9kdWxlIGhlYWRlcidzIHN0b3JhZ2Utc2NvcGUgbm90ZS5cbiAqXG4gKiBEZXRlY3Rpb24gaXMgbXVsdGktc2lnbmFsIGFuZCBCSUFTRUQgVE9XQVJEIFNBRkFSSSwgYmVjYXVzZSB0aGUgdHdvIGVycm9yc1xuICogYXJlIG5vdCBzeW1tZXRyaWM6IHNlZWRpbmcgYSBDaHJvbWUgdmF1bHQgY29zdHMgbm90aGluZyAoc2VlZCBpcyBhbHJlYWR5IHRoZVxuICogc3RyYXRlZ3kgZXZlcnkgZnJlc2ggaW5zdGFsbCBsYW5kcyBvbiksIHdoaWxlIGFkb3B0aW5nIGFuIElEQiBrZXkgb24gU2FmYXJpXG4gKiBpcyB1bnNhZmUuIFNvIG9ubHkgYSBQT1NJVElWRUxZIGlkZW50aWZpZWQgQ2hyb21lL0ZpcmVmb3ggb3JpZ2luIG1heSBhZG9wdCBhblxuICogSW5kZXhlZERCIGtleSBcdTIwMTQgYSBnZXRVUkwgdGhhdCBpcyBtaXNzaW5nLCB0aHJvd3MsIHJldHVybnMgYSBub24tc3RyaW5nLFxuICogcmV0dXJucyAnJyBvciByZXR1cm5zIGEgc2NoZW1lIHdlIGRvIG5vdCByZWNvZ25pc2UgYWxsIHJlc29sdmUgdG8gU2FmYXJpLlxuICovXG5hc3luYyBmdW5jdGlvbiBpc1NhZmFyaUVuZ2luZSgpIHtcbiAgICBsZXQgb3JpZ2luID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgY29uc3QgdXJsID0gYXBpPy5ydW50aW1lPy5nZXRVUkw/LignJyk7XG4gICAgICAgIG9yaWdpbiA9IHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnID8gdXJsIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgb3JpZ2luID0gbnVsbDtcbiAgICB9XG4gICAgLy8gU2lnbmFsIDE6IGEgcG9zaXRpdmVseSBpZGVudGlmaWVkIFNhZmFyaSBvcmlnaW4uXG4gICAgaWYgKG9yaWdpbiAmJiBvcmlnaW4uc3RhcnRzV2l0aCgnc2FmYXJpLXdlYi1leHRlbnNpb246Ly8nKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU2lnbmFsIDI6IGEgV2ViS2l0LW9ubHkgVUEgb3V0cmFua3MgdGhlIG9yaWdpbiBcdTIwMTQgYSBTYWZhcmkgYnVpbGQgdGhhdFxuICAgIC8vIHJlcG9ydGVkIGFuIHVuZXhwZWN0ZWQgb3JpZ2luIHN0aWxsIG11c3Qgbm90IHRvdWNoIEluZGV4ZWREQi5cbiAgICBpZiAobG9va3NMaWtlV2ViS2l0T25seVVhKCkpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAzOiBvbmx5IHRoZXNlIHR3byBvcmlnaW5zIGVhcm4gdGhlIElEQiBhZG9wdCBwYXRoLlxuICAgIGlmIChvcmlnaW4gJiYgKG9yaWdpbi5zdGFydHNXaXRoKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJykgfHwgb3JpZ2luLnN0YXJ0c1dpdGgoJ21vei1leHRlbnNpb246Ly8nKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTsgLy8gYW1iaWd1b3VzIFx1MjE5MiBzZWVkXG59XG5cbi8qKiBJbXBvcnQgcmF3IHNlZWQgYnl0ZXMgKGJhc2U2NCkgYXMgYSBub24tZXh0cmFjdGFibGUgQUVTLUdDTSBrZXkuICovXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRTZWVkS2V5KHNlZWRCNjQpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLCBiYXNlNjRUb0FiKHNlZWRCNjQpLCB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlIG9uY2UgaW1wb3J0ZWRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG4vKiogUmVhZCB0aGUgc3RpY2t5IHN0cmF0ZWd5IHJlY29yZGVkIGJ5IGEgcHJldmlvdXMgcmVzb2x1dGlvbiAobnVsbCBpZiBub25lKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTdGlja3lTdHJhdGVneSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBzID0gZ290Py5bREVWSUNFX1NUUkFURUdZX0tFWV07XG4gICAgICAgIHJldHVybiAocyA9PT0gJ2lkYicgfHwgcyA9PT0gJ3NlZWQnKSA/IHMgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKiBSZWNvcmQgdGhlIHJlc29sdmVkIHN0cmF0ZWd5IHNvIGxhdGVyIGxvYWRzIGNhbm5vdCBzaWxlbnRseSBmbGlwIGl0LiAqL1xuYXN5bmMgZnVuY3Rpb24gd3JpdGVTdGlja3lTdHJhdGVneShzdHJhdGVneSkge1xuICAgIGlmIChzdHJhdGVneSAhPT0gJ2lkYicgJiYgc3RyYXRlZ3kgIT09ICdzZWVkJykgcmV0dXJuOyAvLyAnbWVtb3J5JyBwZXJzaXN0cyBub3RoaW5nXG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzdG9yZS5zZXQoeyBbREVWSUNFX1NUUkFURUdZX0tFWV06IHN0cmF0ZWd5IH0pO1xuICAgIH0gY2F0Y2ggeyAvKiBiZXN0IGVmZm9ydCBcdTIwMTQgdGhlIHN0cmF0ZWd5IHN0aWxsIHJlc29sdmVzIHRoZSBzYW1lIHdheSAqLyB9XG59XG5cbi8qKiBTdHJhdGVneSAoYik6IGEgcmF3IHJhbmRvbSBzZWVkIGluIHN0b3JhZ2UubG9jYWwsIGltcG9ydGVkIG5vbi1leHRyYWN0YWJsZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHRyeVNlZWREZXZpY2VLZXkoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICBsZXQgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgIGlmICghc2VlZCkge1xuICAgICAgICAgICAgc2VlZCA9IGFiVG9CYXNlNjQoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShERVZJQ0VfU0VFRF9CWVRFUykpLmJ1ZmZlcik7XG4gICAgICAgICAgICBhd2FpdCBzdG9yZS5zZXQoeyBbREVWSUNFX1NFRURfS0VZXTogc2VlZCB9KTtcbiAgICAgICAgICAgIC8vIFZFUklGWSBwZXJzaXN0ZW5jZSBiZWZvcmUgYW55dGhpbmcgaXMgd3JhcHBlZCB1bmRlciBpdC5cbiAgICAgICAgICAgIGNvbnN0IGNoZWNrID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgICAgICBjb25zdCBwZXJzaXN0ZWQgPSBjaGVjaz8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAocGVyc2lzdGVkICE9PSBzZWVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQW5vdGhlciBjb250ZXh0IChwb3B1cCB2cyBiYWNrZ3JvdW5kIG9uIGEgZmlyc3QgcnVuKSBtaW50ZWRcbiAgICAgICAgICAgICAgICAvLyBhbmQgd3JvdGUgaXRzIG93biBzZWVkIGJldHdlZW4gb3VyIHNldCgpIGFuZCB0aGlzIHJlYWQuIEFET1BUXG4gICAgICAgICAgICAgICAgLy8gVEhFIFdJTk5FUjogYW55IHNlZWQgYWN0dWFsbHkgaW4gc3RvcmFnZSBpcyBleGFjdGx5IGFzIGdvb2QgYXNcbiAgICAgICAgICAgICAgICAvLyBvdXJzLCBhbmQgaXQgaXMgdGhlIG9uZSB0aGUgb3RoZXIgY29udGV4dCBpcyBhbHJlYWR5IHdyYXBwaW5nXG4gICAgICAgICAgICAgICAgLy8gdW5kZXIuIFJldHVybmluZyBudWxsIGhlcmUgd291bGQgZHJvcCB0aGUgY2FsbGVyIHRocm91Z2ggdG9cbiAgICAgICAgICAgICAgICAvLyB0aGUgbWVtb3J5IGtleSwgd2hvc2UgYmxvYnMgZGllIHdpdGggdGhpcyBjb250ZXh0IFx1MjAxNCB0aGUgdmVyeVxuICAgICAgICAgICAgICAgIC8vIGxvc3MgdGhpcyBzdHJhdGVneSBleGlzdHMgdG8gcHJldmVudC4gT25seSBhIGdlbnVpbmVseSBhYnNlbnRcbiAgICAgICAgICAgICAgICAvLyBvciB1bnVzYWJsZSB2YWx1ZSBpcyBhIGZhaWx1cmUuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwZXJzaXN0ZWQgIT09ICdzdHJpbmcnIHx8IHBlcnNpc3RlZC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHNlZWQgPSBwZXJzaXN0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldCAoY3JlYXRpbmcgb24gZmlyc3QgdXNlKSB0aGUgZGV2aWNlIHdyYXAga2V5LlxuICpcbiAqIFJlc29sdXRpb24gb3JkZXIsIG9uY2U6IGhvbm91ciB0aGUgc3RpY2t5IHN0cmF0ZWd5IHRoaXMgaW5zdGFsbCBhbHJlYWR5XG4gKiByZWNvcmRlZDsgb3RoZXJ3aXNlIEFET1BUIGEgcHJlLWV4aXN0aW5nIEluZGV4ZWREQiBrZXkgaWYgb25lIGlzIHRoZXJlLCBhbmRcbiAqIGZhaWxpbmcgdGhhdCBzZWVkLiBXaGF0ZXZlciByZXNvbHZlcyBpcyB3cml0dGVuIGJhY2sgYXMgdGhlIHN0aWNreSBzdHJhdGVneS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERldmljZUtleSgpIHtcbiAgICBpZiAoX2RldmljZUtleVByb21pc2UpIHJldHVybiBfZGV2aWNlS2V5UHJvbWlzZTtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0aWNreSA9IGF3YWl0IHJlYWRTdGlja3lTdHJhdGVneSgpO1xuXG4gICAgICAgIC8vIEEgdmF1bHQgYWxyZWFkeSBvbiBgc2VlZGAgbmV2ZXIgcmUtcHJvYmVzIEluZGV4ZWREQjogaXRzIGJsb2JzIGFyZVxuICAgICAgICAvLyB1bmRlciB0aGUgc2VlZCBrZXksIGFuZCBhZG9wdGluZyBhIHN0cmF5IElEQiBoYW5kbGUgd291bGQgb3JwaGFuIHRoZW0uXG4gICAgICAgIC8vIE9uIFNhZmFyaSB3ZSBuZXZlciBXUklURSB1bmRlciBhbiBJREIga2V5IGF0IGFsbCAoc2VlIGhlYWRlcik6IGl0c1xuICAgICAgICAvLyBwZXItZW5naW5lIHN0b3JhZ2Ugc2NvcGluZyBtYWtlcyBhbiBhZG9wdGVkIElEQiBoYW5kbGUgdW5zYWZlIGFzIGFcbiAgICAgICAgLy8gd3JhcHBpbmcga2V5LiBFeGlzdGluZyBJREIgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0XG4gICAgICAgIC8vIGZhbGxiYWNrIGFuZCBhcmUgcmUtd3JhcHBlZCB1bmRlciB0aGUgc2VlZCBieSB0aGUgYXQtcmVzdCBtaWdyYXRpb24uXG4gICAgICAgIGlmIChzdGlja3kgIT09ICdzZWVkJyAmJiAhKGF3YWl0IGlzU2FmYXJpRW5naW5lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBpZGJLZXkgPSBhd2FpdCB0cnlJZGJEZXZpY2VLZXkoKTtcbiAgICAgICAgICAgIGlmIChpZGJLZXkpIHtcbiAgICAgICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnaWRiJztcbiAgICAgICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdpZGInKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWRiS2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IHRyeVNlZWREZXZpY2VLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIHtcbiAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdzZWVkJztcbiAgICAgICAgICAgIC8vIEFsc28gY292ZXJzIHRoZSBkZWdyYWRlIGNhc2U6IHN0aWNreSB3YXMgJ2lkYicgYnV0IHRoZSBoYW5kbGUgaXNcbiAgICAgICAgICAgIC8vIGdvbmUuIE9sZCBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHQgZmFsbGJhY2sgYmVsb3cuXG4gICAgICAgICAgICBhd2FpdCB3cml0ZVN0aWNreVN0cmF0ZWd5KCdzZWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gc2VlZEtleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGhpbmcgcGVyc2lzdHMgaGVyZS4gQmV0dGVyIHRoYW4gcmVmdXNpbmcgdG8gZW5jcnlwdCwgYnV0IGJsb2JzXG4gICAgICAgIC8vIHdyaXR0ZW4gdW5kZXIgdGhpcyBrZXkgZGllIHdpdGggdGhlIGNvbnRleHQgXHUyMDE0IHNlZSBtb2R1bGUgaGVhZGVyLlxuICAgICAgICBpZiAoIV9tZW1vcnlEZXZpY2VLZXkpIF9tZW1vcnlEZXZpY2VLZXkgPSBhd2FpdCBnZW5lcmF0ZURldmljZUtleSgpO1xuICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnbWVtb3J5JztcbiAgICAgICAgcmV0dXJuIF9tZW1vcnlEZXZpY2VLZXk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG59XG5cbi8qKiBXaGljaCBwZXJzaXN0ZW5jZSBzdHJhdGVneSB0aGUgZGV2aWNlIGtleSByZXNvbHZlZCB0byAobnVsbCB1bnRpbCByZXNvbHZlZCkuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5U3RyYXRlZ3koKSB7XG4gICAgcmV0dXJuIF9kZXZpY2VTdHJhdGVneTtcbn1cblxuLyoqXG4gKiBEcm9wIGV2ZXJ5IG1lbW9pc2VkIGRldmljZS1rZXkgaGFuZGxlLiBNVVNUIGJlIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBhbnlcbiAqIGBzdG9yYWdlLmNsZWFyKClgOiB0aGUgc2VlZCAoYW5kIHRoZSBzdGlja3kgc3RyYXRlZ3kpIGFyZSBnb25lIGZyb20gc3RvcmFnZSxcbiAqIHNvIGEgY2FjaGVkIHByb21pc2Ugd291bGQga2VlcCBoYW5kaW5nIG91dCBhIGtleSB3aG9zZSBiYWNraW5nIG1hdGVyaWFsIG5vXG4gKiBsb25nZXIgZXhpc3RzIFx1MjAxNCB0aGUgbmV4dCBnZXREZXZpY2VLZXkoKSB3b3VsZCB3cmFwIHNlY3JldHMgdW5kZXIgYSBrZXkgdGhhdFxuICogZGllcyB3aXRoIHRoaXMgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGV2aWNlS2V5KCkge1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZGV2aWNlU3RyYXRlZ3kgPSBudWxsO1xuICAgIF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byBhIHByZS1leGlzdGluZyBJbmRleGVkREIgZGV2aWNlIGtleSwgdXNlZCBvbmx5IGFzIGFcbiAqIGRlY3J5cHQgZmFsbGJhY2sgZm9yIGJsb2JzIHdyaXR0ZW4gYmVmb3JlIHRoaXMgY29udGV4dCBjaGFuZ2VkIHN0cmF0ZWd5LlxuICogTmV2ZXIgY3JlYXRlcyBvbmUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldExlZ2FjeUlkYktleSgpIHtcbiAgICBpZiAoX2xlZ2FjeUlkYktleVByb21pc2UpIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghaW5kZXhlZERiQXZhaWxhYmxlKCkpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGRiLmdldChERVZJQ0VfU1RPUkUsIERFVklDRV9LRVlfSUQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gdGhlIGtleSBhbiBFWElTVElORyBgZGV2aWNlS2V5U2VlZGAgaW1wb3J0cyB0bywgdXNlZCBvbmx5XG4gKiBhcyBhIGRlY3J5cHQgZmFsbGJhY2suIE5ldmVyIG1pbnRzIGEgc2VlZCAodGhhdCBpcyB0cnlTZWVkRGV2aWNlS2V5J3Mgam9iKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0RXhpc3RpbmdTZWVkS2V5KCkge1xuICAgIGlmIChfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSkgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgICAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3Qgc2VlZCA9IGdvdD8uW0RFVklDRV9TRUVEX0tFWV07XG4gICAgICAgICAgICBpZiAoIXNlZWQpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW1wb3J0U2VlZEtleShzZWVkKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBFdmVyeSBPVEhFUiBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGhhdmUgd3JhcHBlZCBhIGRldmljZSBibG9iIHVuZGVyLCBpblxuICogcHJlZmVyZW5jZSBvcmRlci4gU3RyYXRlZ3kgZmxpcHMgKGlkYlx1MjE5MnNlZWQgb24gZGVncmFkZSwgc2VlZFx1MjE5MmlkYiBvbiBhblxuICogYWRvcHRlZCBoYW5kbGUpIG11c3QgbmV2ZXIgb3JwaGFuIGEgYmxvYiwgc28gdGhlIGZhbGxiYWNrIGlzIHN5bW1ldHJpYzogYVxuICogc2VlZCBibG9iIHN0YXlzIHJlYWRhYmxlIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyBhbmQgdmljZSB2ZXJzYS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmFsbGJhY2tEZXZpY2VLZXlzKCkge1xuICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnaWRiJykge1xuICAgICAgICBjb25zdCBsZWdhY3kgPSBhd2FpdCBnZXRMZWdhY3lJZGJLZXkoKTtcbiAgICAgICAgaWYgKGxlZ2FjeSkga2V5cy5wdXNoKGxlZ2FjeSk7XG4gICAgfVxuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdzZWVkJykge1xuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgZ2V0RXhpc3RpbmdTZWVkS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSBrZXlzLnB1c2goc2VlZEtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiB3aXRoIHRoZSBjdXJyZW50IGtleSwgZmFsbGluZyBiYWNrIHRvIGV2ZXJ5IG90aGVyIGtleVxuICogdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZC4gUmV0dXJucyB0aGUgcGxhaW50ZXh0IHBsdXMgd2hldGhlciBhIGZhbGxiYWNrIGtleVxuICogd2FzIG5lZWRlZCAoaS5lLiB0aGUgYmxvYiBpcyBzdGFsZSBhbmQgd29ydGggcmUtd3JhcHBpbmcpLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpLCBzdGFsZTogZmFsc2UgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmFsbGJhY2sgb2YgYXdhaXQgZmFsbGJhY2tEZXZpY2VLZXlzKCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoZmFsbGJhY2ssIGl2LCBjaXBoZXJ0ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgc3RhbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiB0cnkgdGhlIG5leHQgb25lICovIH1cbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlOyAvLyByZXBvcnQgdGhlIENVUlJFTlQga2V5J3MgZmFpbHVyZSwgbm90IHRoZSBsYXN0IGZhbGxiYWNrJ3NcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBlbmMuZW5jb2RlKHBsYWludGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2OiAxLFxuICAgICAgICBrOiAnZGV2aWNlJyxcbiAgICAgICAgaXY6IGFiVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhYlRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCkge1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQWIoaXYpKSB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGJhc2U2NFRvQWIoY2lwaGVydGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoRGV2aWNlS2V5KGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIC8vIEdDTSBhdXRoZW50aWNhdGlvbiBjYW4gZmFpbCB3aXRoIHRoZSBDVVJSRU5UIHN0cmF0ZWd5J3Mga2V5IGJlY2F1c2UgdGhlXG4gICAgLy8gYmxvYiBwcmVkYXRlcyBhIHN0cmF0ZWd5IGNoYW5nZSAoYSBDaHJvbWUvRmlyZWZveCB2YXVsdCB3aG9zZSBJREIgaGFuZGxlXG4gICAgLy8gaXMgc3RpbGwgcmVhZGFibGUgd2hpbGUgdGhpcyBjb250ZXh0IHNldHRsZWQgb24gdGhlIHNlZWQsIG9yIHRoZSByZXZlcnNlKS5cbiAgICAvLyBUcnkgZXZlcnkga2V5IHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQgYmVmb3JlIGRlY2xhcmluZyB0aGUgc2VjcmV0IGxvc3QuXG4gICAgY29uc3QgeyBwbGFpbnRleHQgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4gcGxhaW50ZXh0O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBkZXZpY2UgYmxvYiBhbmQsIHdoZW4gaXQgY291bGQgb25seSBiZSByZWFkIHZpYSBhIGZhbGxiYWNrIGtleVxuICogKGxlZ2FjeSBJbmRleGVkREIgaGFuZGxlLCBvciBhbiBleGlzdGluZyBzZWVkIHdoaWxlIHRoZSBzdHJhdGVneSBpcyAnaWRiJyksXG4gKiBoYW5kIGJhY2sgYSByZXBsYWNlbWVudCBibG9iIHdyYXBwZWQgdW5kZXIgdGhlIENVUlJFTlQgc3RyYXRlZ3kgc28gdGhlIGNhbGxlclxuICogY2FuIHBlcnNpc3QgdGhlIHVwZ3JhZGUgb3Bwb3J0dW5pc3RpY2FsbHkuXG4gKiBgcmV3cmFwcGVkYCBpcyBudWxsIHdoZW4gdGhlIGJsb2IgaXMgYWxyZWFkeSBjdXJyZW50LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXAoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgeyBwbGFpbnRleHQsIHN0YWxlIH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGxhaW50ZXh0LFxuICAgICAgICByZXdyYXBwZWQ6IHN0YWxlID8gYXdhaXQgZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSA6IG51bGwsXG4gICAgfTtcbn1cblxuLy8gLS0tIEJsb2IgY2xhc3NpZmljYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBmdW5jdGlvbiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLnNhbHQgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQgJiYgcC5rICE9PSAnZGV2aWNlJyk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuayA9PT0gJ2RldmljZScgJiYgcC5pdiAmJiBwLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuLyoqIFRydWUgaWYgdGhlIHZhbHVlIGlzIGFscmVhZHkgY2lwaGVydGV4dCAoZWl0aGVyIHdyYXBwaW5nKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NpcGhlcnRleHQodmFsdWUpIHtcbiAgICByZXR1cm4gaXNQYXNzd29yZEJsb2IodmFsdWUpIHx8IGlzRGV2aWNlS2V5QmxvYih2YWx1ZSk7XG59XG5cbi8vIC0tLSBVbmlmaWVkIHdyYXAgLyB1bndyYXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHNlY3JldCBmb3IgYXQtcmVzdCBzdG9yYWdlLiBQcmVmZXJzIHRoZSBwYXNzd29yZC1kZXJpdmVkIHNlc3Npb25cbiAqIGtleSB3aGVuIG9uZSBpcyBhdmFpbGFibGUgaW4gdGhpcyBjb250ZXh0IChiYWNrZ3JvdW5kLCB1bmxvY2tlZCk7IG90aGVyd2lzZVxuICogZmFsbHMgYmFjayB0byB0aGUgYWx3YXlzLWF2YWlsYWJsZSBkZXZpY2Uga2V5LiBOZXZlciByZXR1cm5zIHBsYWludGV4dC5cbiAqXG4gKiBUaGUgdGllciBpcyB0aGVyZWZvcmUgQU1CSUVOVCBcdTIwMTQgaXQgaXMgd2hhdGV2ZXIgYHNldFNlc3Npb25LZXlgIC8gYGNsZWFyU2Vzc2lvbmBcbiAqIGxhc3QgZGlkIGluIHRoaXMgbW9kdWxlLCB3aGljaCBtYXkgaGF2ZSBiZWVuIGRvbmUgYnkgYSBkaWZmZXJlbnQgZmlsZS4gT25seVxuICogY2FsbCB0aGlzIHdoZXJlIGVpdGhlciB0aWVyIGlzIGdlbnVpbmVseSBhY2NlcHRhYmxlIChhIHZhbHVlIHRoYXRcbiAqIGB1bndyYXBTZWNyZXRgIGNhbiBvcGVuIHVuZGVyIGJvdGgpLiBBIGNhbGxlciB0aGF0IG5lZWRzIGEgU1BFQ0lGSUMgdGllciBtdXN0XG4gKiBuYW1lIGl0OiBgZW5jcnlwdFdpdGhEZXZpY2VLZXlgIG9yIGBlbmNyeXB0V2l0aEtleWAuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cmFwU2VjcmV0KHBsYWludGV4dCkge1xuICAgIGlmICh0eXBlb2YgcGxhaW50ZXh0ICE9PSAnc3RyaW5nJyB8fCBwbGFpbnRleHQubGVuZ3RoID09PSAwKSByZXR1cm4gcGxhaW50ZXh0O1xuICAgIGlmIChpc0NpcGhlcnRleHQocGxhaW50ZXh0KSkgcmV0dXJuIHBsYWludGV4dDsgLy8gYWxyZWFkeSB3cmFwcGVkIFx1MjAxNCBkb24ndCBkb3VibGUtd3JhcFxuICAgIGlmIChfc2Vzc2lvbktleSkge1xuICAgICAgICByZXR1cm4gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBfc2Vzc2lvbktleSwgX3Nlc3Npb25TYWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbiBhdC1yZXN0IHNlY3JldC4gUmVmdXNlcyB3aGVuIHRoZSBzZXNzaW9uIGlzIGV4cGxpY2l0bHkgbG9ja2VkLlxuICogTGVnYWN5IHBsYWludGV4dCB2YWx1ZXMgYXJlIHJldHVybmVkIHVuY2hhbmdlZCAodHJhbnNpdGlvbmFsIFx1MjAxNCBjYWxsZXJzIHNob3VsZFxuICogcmUtd3JhcCBvbiBuZXh0IHdyaXRlOyBzZWUgbWlncmF0aW9uIHBhdGhzKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVud3JhcFNlY3JldCh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnIHx8IHZhbHVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHZhbHVlO1xuICAgIGlmICghaXNDaXBoZXJ0ZXh0KHZhbHVlKSkgcmV0dXJuIHZhbHVlOyAvLyBsZWdhY3kgcGxhaW50ZXh0IHBhc3N0aHJvdWdoXG4gICAgaWYgKF91bmxvY2tlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NrZWQ6IHNlc3Npb24gaXMgbG9ja2VkIFx1MjAxNCBjYW5ub3QgcmVhZCBzZWNyZXQnKTtcbiAgICB9XG4gICAgaWYgKGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGRlY3J5cHRXaXRoRGV2aWNlS2V5KHZhbHVlKTtcbiAgICB9XG4gICAgLy8gcGFzc3dvcmQgYmxvYlxuICAgIGlmICghX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2NrZWQ6IG5vIHNlc3Npb24ga2V5IGF2YWlsYWJsZSB0byBkZWNyeXB0IHNlY3JldCcpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdFdpdGhLZXkodmFsdWUsIF9zZXNzaW9uS2V5KTtcbn1cbiIsICIvKipcbiAqIEVuY3J5cHRpb24gdXRpbGl0aWVzIGZvciBOb3N0cktleSBtYXN0ZXIgcGFzc3dvcmQgZmVhdHVyZS5cbiAqXG4gKiBVc2VzIFdlYiBDcnlwdG8gQVBJIChjcnlwdG8uc3VidGxlKSBleGNsdXNpdmVseSBcdTIwMTQgbm8gZXh0ZXJuYWwgbGlicmFyaWVzLlxuICogLSBQQktERjIgd2l0aCA2MDAsMDAwIGl0ZXJhdGlvbnMgKE9XQVNQIDIwMjMgcmVjb21tZW5kYXRpb24pXG4gKiAtIEFFUy0yNTYtR0NNIGZvciBhdXRoZW50aWNhdGVkIGVuY3J5cHRpb25cbiAqIC0gUmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSBwZXIgb3BlcmF0aW9uXG4gKiAtIEFsbCBiaW5hcnkgZGF0YSBlbmNvZGVkIGFzIGJhc2U2NCBmb3IgSlNPTiBzdG9yYWdlIGNvbXBhdGliaWxpdHlcbiAqL1xuXG5jb25zdCBQQktERjJfSVRFUkFUSU9OUyA9IDYwMF8wMDA7XG5jb25zdCBTQUxUX0JZVEVTID0gMTY7XG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gS2V5IGRlcml2YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRGVyaXZlIGFuIEFFUy0yNTYtR0NNIENyeXB0b0tleSBmcm9tIGEgcGFzc3dvcmQgYW5kIHNhbHQgdXNpbmcgUEJLREYyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8VWludDhBcnJheX0gc2FsdCAtIDE2LWJ5dGUgc2FsdFxuICogQHBhcmFtIHt7ZXh0cmFjdGFibGU/OiBib29sZWFufX0gW29wdGlvbnNdIC0gYGV4dHJhY3RhYmxlOiB0cnVlYCBhbGxvd3MgdGhlXG4gKiAgICAgICAgcmF3IGJ5dGVzIHRvIGJlIGV4cG9ydGVkIG9uY2UgKHNlZSBleHBvcnRLZXlCYXNlNjQpLiBVc2VkIGJ5IHRoZVxuICogICAgICAgIGJhY2tncm91bmQgd29ya2VyIHNvIGFuIHVubG9ja2VkIHNlc3Npb24gY2FuIGJlIHBhcmtlZCBpblxuICogICAgICAgIHN0b3JhZ2Uuc2Vzc2lvbiBhbmQgZnVsbHkgcmVzdG9yZWQgYWZ0ZXIgYW4gTVYzIGV2aWN0aW9uLiBEZWZhdWx0XG4gKiAgICAgICAgZmFsc2U6IHRoZSBrZXkgaXMgb3BhcXVlIGFuZCBjYW5ub3QgbGVhdmUgdGhlIGNyeXB0byBzdWJzeXN0ZW0uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fSBBRVMtMjU2LUdDTSBrZXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlS2V5J11cbiAgICApO1xuXG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQ6IHNhbHQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gc2FsdCA6IG5ldyBVaW50OEFycmF5KHNhbHQpLFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgISFvcHRpb25zLmV4dHJhY3RhYmxlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgYW4gZXh0cmFjdGFibGUgQUVTIGtleSdzIHJhdyBieXRlcyBhcyBiYXNlNjQuXG4gKiBPbmx5IGV2ZXIgY2FsbGVkIG9uIGEga2V5IGRlcml2ZWQgd2l0aCBgeyBleHRyYWN0YWJsZTogdHJ1ZSB9YC5cbiAqXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBiYXNlNjQgcmF3IGtleSBieXRlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5QmFzZTY0KGtleSkge1xuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGF3YWl0IGNyeXB0by5zdWJ0bGUuZXhwb3J0S2V5KCdyYXcnLCBrZXkpKTtcbn1cblxuLyoqXG4gKiBJbXBvcnQgYmFzZTY0IHJhdyBieXRlcyBiYWNrIGludG8gYSBOT04tZXh0cmFjdGFibGUgQUVTLTI1Ni1HQ00ga2V5LlxuICogVGhlIGNvdW50ZXJwYXJ0IG9mIGV4cG9ydEtleUJhc2U2NDogd2hhdGV2ZXIgd2VudCBvdXQgZXh0cmFjdGFibGUgY29tZXMgYmFja1xuICogb3BhcXVlLCBzbyBhIHJlc3RvcmVkIHNlc3Npb24ga2V5IGNhbm5vdCBiZSByZS1leHBvcnRlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZTY0IC0gcmF3IGtleSBieXRlc1xuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydEtleUJhc2U2NChiYXNlNjQpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCksXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nIH0sXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLyoqIGJhc2U2NCBcdTIxOTQgYnl0ZXMsIGV4cG9ydGVkIHNvIGNhbGxlcnMgY2FuIHJvdW5kLXRyaXAgYSBzYWx0IHRocm91Z2ggSlNPTi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvQmFzZTY0KGJ5dGVzKSB7XG4gICAgLy8gYG5ldyBVaW50OEFycmF5KHZpZXcpYCBpbnNpZGUgdGhlIGhlbHBlciBjb3BpZXMgdGhlIFZJRVcsIHNvIGEgc2FsdCB0aGF0XG4gICAgLy8gaXMgYSB3aW5kb3cgaW50byBhIGxhcmdlciBidWZmZXIgc3RpbGwgZW5jb2RlcyBjb3JyZWN0bHkuXG4gICAgcmV0dXJuIGFycmF5QnVmZmVyVG9CYXNlNjQoYnl0ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhiYXNlNjQpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpKTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgd2l0aCBwcmUtZGVyaXZlZCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IGFuZCBpdHMgc2FsdC5cbiAqXG4gKiBUaGlzIGF2b2lkcyBob2xkaW5nIHRoZSByYXcgcGFzc3dvcmQgaW4gbWVtb3J5IFx1MjAxNCB0aGUgY2FsbGVyIGRlcml2ZXMgdGhlXG4gKiBrZXkgb25jZSAodmlhIGRlcml2ZUtleSkgYW5kIHJldXNlcyBpdCBmb3IgdGhlIHNlc3Npb24uICBUaGUgb3V0cHV0XG4gKiBmb3JtYXQgaXMgaWRlbnRpY2FsIHRvIGVuY3J5cHQoKSwgc28gZGVjcnlwdCgpIGNhbiBzdGlsbCBiZSB1c2VkIHdpdGhcbiAqIHRoZSBvcmlnaW5hbCBwYXNzd29yZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0ICAgICAgICAgIC0gVGhlIGRhdGEgdG8gZW5jcnlwdFxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgICAgICAtIEFFUy0yNTYtR0NNIGtleSBmcm9tIGRlcml2ZUtleSgpXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHNhbHQgICAgICAgICAgIC0gVGhlIHNhbHQgdGhhdCB3YXMgdXNlZCB0byBkZXJpdmUgYGtleWBcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIGtleSwgc2FsdCkge1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IC8gRGVjcnlwdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB3aXRoIGEgcGFzc3dvcmQuXG4gKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSwgZGVyaXZlcyBhblxuICogQUVTLTI1Ni1HQ00ga2V5IHZpYSBQQktERjIsIGFuZCByZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZ1xuICogYmFzZTY0LWVuY29kZWQgc2FsdCwgaXYsIGFuZCBjaXBoZXJ0ZXh0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgLSBUaGUgZGF0YSB0byBlbmNyeXB0IChlLmcuIGhleCBwcml2YXRlIGtleSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQsIHBhc3N3b3JkKSB7XG4gICAgY29uc3Qgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCk7XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSAoaWdub3JlcyB0aGUgc2FsdCBlbWJlZGRlZCBpbiB0aGVcbiAqIGJsb2IgXHUyMDE0IHRoZSBjYWxsZXIgbXVzdCBzdXBwbHkgYSBrZXkgdGhhdCBtYXRjaGVzIGhvdyB0aGUgYmxvYiB3YXMgZW5jcnlwdGVkKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpL2VuY3J5cHRXaXRoS2V5KClcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aEtleShlbmNyeXB0ZWREYXRhLCBrZXkpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdGhhdCB3YXMgZW5jcnlwdGVkIHdpdGggYGVuY3J5cHQoKWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgICAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHBhc3N3b3JkIGlzIHdyb25nIG9yIGRhdGEgaXMgdGFtcGVyZWQgd2l0aFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG5cbiAgICBjb25zdCBzYWx0QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuXG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0QnVmKTtcblxuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuXG4gICAgY29uc3QgZGVjID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgcmV0dXJuIGRlYy5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gUGFzc3dvcmQgaGFzaGluZyAoZm9yIHZlcmlmaWNhdGlvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogSGFzaCBhIHBhc3N3b3JkIHdpdGggUEJLREYyIGZvciB2ZXJpZmljYXRpb24gcHVycG9zZXMuXG4gKlxuICogVGhpcyBwcm9kdWNlcyBhIHNlcGFyYXRlIGhhc2ggKG5vdCB0aGUgZW5jcnlwdGlvbiBrZXkpIHRoYXQgY2FuIGJlIHN0b3JlZFxuICogdG8gdmVyaWZ5IHRoZSBwYXNzd29yZCB3aXRob3V0IG5lZWRpbmcgdG8gYXR0ZW1wdCBkZWNyeXB0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gW3NhbHRdIC0gT3B0aW9uYWwgc2FsdDsgZ2VuZXJhdGVkIGlmIG9taXR0ZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHsgaGFzaDogc3RyaW5nLCBzYWx0OiBzdHJpbmcgfT59IGJhc2U2NC1lbmNvZGVkIGhhc2ggYW5kIHNhbHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhc2hQYXNzd29yZChwYXNzd29yZCwgc2FsdCkge1xuICAgIGlmICghc2FsdCkge1xuICAgICAgICBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2FsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2FsdCA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUJpdHMnXVxuICAgICk7XG5cbiAgICBjb25zdCBoYXNoQml0cyA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVyaXZlQml0cyhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0LFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICAyNTZcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogYXJyYXlCdWZmZXJUb0Jhc2U2NChoYXNoQml0cyksXG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IGEgc3RvcmVkIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgLSBUaGUgcGFzc3dvcmQgdG8gdmVyaWZ5XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkSGFzaCAtIGJhc2U2NC1lbmNvZGVkIGhhc2ggZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZFNhbHQgLSBiYXNlNjQtZW5jb2RlZCBzYWx0IGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHRoZSBwYXNzd29yZCBtYXRjaGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkSGFzaCwgc3RvcmVkU2FsdCkge1xuICAgIGNvbnN0IHsgaGFzaCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRTYWx0KTtcbiAgICByZXR1cm4gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoaGFzaCwgc3RvcmVkSGFzaCk7XG59XG5cbi8qKlxuICogQ29uc3RhbnQtdGltZSBjb21wYXJpc29uIG9mIHR3byBiYXNlNjQtZW5jb2RlZCBieXRlIHN0cmluZ3MuXG4gKlxuICogRGVjb2RlcyBib3RoIHRvIHJhdyBieXRlcyBhbmQgY29tcGFyZXMgd2l0aCBhbiBhY2N1bXVsYXRvciBzbyB0aGUgcnVubmluZ1xuICogdGltZSBkb2VzIG5vdCBkZXBlbmQgb24gd2hlcmUgdGhlIGZpcnN0IG1pc21hdGNoIG9jY3VycyBcdTIwMTQgdGhpcyBhdm9pZHMgdGhlXG4gKiB0aW1pbmcgc2lkZS1jaGFubmVsIG9mIGEgcGxhaW4gYD09PWAgc3RyaW5nIGNvbXBhcmUgKFRpZXItMyBjcnlwdG8uanM6MjEzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGEsIGIpIHtcbiAgICBsZXQgYmEsIGJiO1xuICAgIHRyeSB7XG4gICAgICAgIGJhID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihhKSk7XG4gICAgICAgIGJiID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiKSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQ29tcGFyZSB0aGUgbWF4IGxlbmd0aCBzbyBsZW5ndGggZGlmZmVyZW5jZXMgZG9uJ3Qgc2hvcnQtY2lyY3VpdCBlYXJseS5cbiAgICBjb25zdCBsZW4gPSBNYXRoLm1heChiYS5sZW5ndGgsIGJiLmxlbmd0aCk7XG4gICAgbGV0IGRpZmYgPSBiYS5sZW5ndGggXiBiYi5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkaWZmIHw9IChiYVtpXSB8fCAwKSBeIChiYltpXSB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpZmYgPT09IDA7XG59XG4iLCAiLyoqXG4gKiBidW5rZXI6Ly8gY29ubmVjdGlvbiBzdHJpbmdzLiBObyBpbXBvcnRzLCBzbyBhbnl0aGluZyB0aGF0IGhhbmRsZXMgcHJvZmlsZXNcbiAqIGNhbiB1c2UgdGhpcyB3aXRob3V0IGxvYWRpbmcgdGhlIHJlbGF5IGNvZGUuXG4gKlxuICogRm9ybWF0OiBidW5rZXI6Ly88cHVia2V5Pj9yZWxheT13c3M6Ly8uLi4mcmVsYXk9d3NzOi8vLi4uJnNlY3JldD08b3B0aW9uYWw+XG4gKi9cblxuLyoqXG4gKiBQYXJzZSBhIGJ1bmtlcjovLyBjb25uZWN0aW9uIHN0cmluZ1xuICogRm9ybWF0OiBidW5rZXI6Ly88cHVia2V5Pj9yZWxheT13c3M6Ly8uLi4mcmVsYXk9d3NzOi8vLi4uJnNlY3JldD08b3B0aW9uYWw+XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1bmtlclVybCh1cmwpIHtcbiAgICBpZiAoIXVybC5zdGFydHNXaXRoKCdidW5rZXI6Ly8nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnVua2VyIFVSTDogbXVzdCBzdGFydCB3aXRoIGJ1bmtlcjovLycpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBjb25zdCByZW1vdGVQdWJrZXkgPSBwYXJzZWQuaG9zdG5hbWUgfHwgcGFyc2VkLnBhdGhuYW1lLnJlcGxhY2UoJy8vJywgJycpO1xuXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IHB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXlzID0gcGFyc2VkLnNlYXJjaFBhcmFtcy5nZXRBbGwoJ3JlbGF5Jyk7XG4gICAgaWYgKHJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IGF0IGxlYXN0IG9uZSByZWxheSBpcyByZXF1aXJlZCcpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHJlbGF5IFVSTHNcbiAgICBmb3IgKGNvbnN0IHJlbGF5IG9mIHJlbGF5cykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgciA9IG5ldyBVUkwocmVsYXkpO1xuICAgICAgICAgICAgaWYgKHIucHJvdG9jb2wgIT09ICd3c3M6JyAmJiByLnByb3RvY29sICE9PSAnd3M6Jykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZWxheSBwcm90b2NvbDogJHtyLnByb3RvY29sfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVsYXkgVVJMOiAke3JlbGF5fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2VjcmV0ID0gcGFyc2VkLnNlYXJjaFBhcmFtcy5nZXQoJ3NlY3JldCcpIHx8IG51bGw7XG5cbiAgICByZXR1cm4geyByZW1vdGVQdWJrZXksIHJlbGF5cywgc2VjcmV0IH07XG59XG5cbi8qKlxuICogQSByZWxheSB2YWx1ZSB3aXRob3V0IGNyZWRlbnRpYWxzOiBubyB1c2VyaW5mbywgbm8gYHNlY3JldGAgcGFyYW0sIG5vIGZyYWdtZW50LlxuICogT3RoZXIgcXVlcnkgcGFyYW1zIHN0YXkuIEEgdmFsdWUgd2l0aCBub25lIG9mIHRob3NlIGNvbWVzIGJhY2sgdW5jaGFuZ2VkLlxuICovXG5mdW5jdGlvbiBjbGVhblJlbGF5KHJlbGF5KSB7XG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZWxheSk7XG4gICAgY29uc3QgbmFtZXMgPSBbLi4udXJsLnNlYXJjaFBhcmFtcy5rZXlzKCldLmZpbHRlcihuYW1lID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlY3JldCcpO1xuICAgIGlmICghdXJsLnVzZXJuYW1lICYmICF1cmwucGFzc3dvcmQgJiYgIXVybC5oYXNoICYmIG5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlbGF5O1xuICAgIHVybC51c2VybmFtZSA9ICcnO1xuICAgIHVybC5wYXNzd29yZCA9ICcnO1xuICAgIHVybC5oYXNoID0gJyc7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIG5hbWVzKSB1cmwuc2VhcmNoUGFyYW1zLmRlbGV0ZShuYW1lKTtcbiAgICByZXR1cm4gdXJsLmhyZWY7XG59XG5cbi8qKlxuICogRG9lcyB0aGlzIGNvbm5lY3Rpb24gc3RyaW5nIGNhcnJ5IGEgc2VjcmV0IHJlZGFjdEJ1bmtlclVybCB3b3VsZCByZW1vdmUsIGluIGl0c1xuICogYHNlY3JldGAgcGFyYW0gb3IgaW5zaWRlIGEgcmVsYXkgdmFsdWU/IE5ldmVyIHRocm93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclVybEhhc1NlY3JldCh1cmwpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHNlY3JldCwgcmVsYXlzIH0gPSBwYXJzZUJ1bmtlclVybCh1cmwpO1xuICAgICAgICByZXR1cm4gISFzZWNyZXQgfHwgcmVsYXlzLnNvbWUocmVsYXkgPT4gY2xlYW5SZWxheShyZWxheSkgIT09IHJlbGF5KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuY29uc3QgZW5jb2RlUmVsYXkgPSAocmVsYXkpID0+XG4gICAgZW5jb2RlVVJJQ29tcG9uZW50KHJlbGF5KS5yZXBsYWNlKC8lM0EvZywgJzonKS5yZXBsYWNlKC8lMkYvZywgJy8nKTtcblxuLyoqXG4gKiBUaGUgc2lnbmVyJ3MgYWRkcmVzcyBhbG9uZTogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9Li4uJnJlbGF5PS4uLlxuICogUmVidWlsdCBmcm9tIHRoZSBwYXJzZWQgZmllbGRzLCBzbyBvZiB0aGUgY29ubmVjdGlvbiBzdHJpbmcgb25seSB0aGUgcHVia2V5IGFuZFxuICogdGhlIHJlbGF5IHZhbHVlcyBzdXJ2aXZlLiBFYWNoIHJlbGF5IHZhbHVlIGxvc2VzIGl0cyB1c2VyaW5mbywgYHNlY3JldGAgcGFyYW1cbiAqIGFuZCBmcmFnbWVudCwgYW5kIGtlZXBzIGFueSBvdGhlciBxdWVyeSBwYXJhbXMgaXQgaGFzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdXJsIGEgY29ubmVjdGlvbiBzdHJpbmcsIG9yIGFueXRoaW5nIGVsc2VcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBhZGRyZXNzLCBvciAnJyBpZiBgdXJsYCBpcyBub3QgYSB2YWxpZCBjb25uZWN0aW9uIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVkYWN0QnVua2VyVXJsKHVybCkge1xuICAgIGxldCBwYXJzZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgcGFyc2VkID0gcGFyc2VCdW5rZXJVcmwodXJsKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb25zdCByZWxheXMgPSBwYXJzZWQucmVsYXlzLm1hcChyZWxheSA9PiBgcmVsYXk9JHtlbmNvZGVSZWxheShjbGVhblJlbGF5KHJlbGF5KSl9YCkuam9pbignJicpO1xuICAgIHJldHVybiBgYnVua2VyOi8vJHtwYXJzZWQucmVtb3RlUHVia2V5fT8ke3JlbGF5c31gO1xufVxuXG4vKipcbiAqIFRoZSBzYW1lIHByb2ZpbGUgbGlzdCB3aXRoIGVhY2ggYnVua2VyVXJsIHJlZHVjZWQgdG8gaXRzIGFkZHJlc3MuXG4gKlxuICogQHBhcmFtIHsqfSBwcm9maWxlcyBhIHByb2ZpbGUgbGlzdDsgYW55dGhpbmcgZWxzZSBpcyByZXR1cm5lZCBhcyBpdCBpc1xuICogQHJldHVybnMgdGhlIHNhbWUgbGlzdCB3aGVuIG5vdGhpbmcgbmVlZGVkIGNoYW5naW5nLCBzbyBhIGNhbGxlciBjYW4gc2tpcCBhXG4gKiAgICAgICAgICB3cml0ZSBieSBjb21wYXJpbmcgcmVmZXJlbmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVkYWN0UHJvZmlsZXMocHJvZmlsZXMpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvZmlsZXMpKSByZXR1cm4gcHJvZmlsZXM7XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICBjb25zdCBjbGVhbiA9IHByb2ZpbGVzLm1hcCgocHJvZmlsZSkgPT4ge1xuICAgICAgICBpZiAoIXByb2ZpbGU/LmJ1bmtlclVybCkgcmV0dXJuIHByb2ZpbGU7XG4gICAgICAgIGNvbnN0IGJ1bmtlclVybCA9IHJlZGFjdEJ1bmtlclVybChwcm9maWxlLmJ1bmtlclVybCk7XG4gICAgICAgIGlmIChidW5rZXJVcmwgPT09IHByb2ZpbGUuYnVua2VyVXJsKSByZXR1cm4gcHJvZmlsZTtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB7IC4uLnByb2ZpbGUsIGJ1bmtlclVybCB9O1xuICAgIH0pO1xuICAgIHJldHVybiBjaGFuZ2VkID8gY2xlYW4gOiBwcm9maWxlcztcbn1cblxuLyoqXG4gKiBTdG9yZWQgc2Vzc2lvbnMgYXJlIGtleWVkIGJ5IHByb2ZpbGUgcG9zaXRpb24uIFJlbW92aW5nIGEgcHJvZmlsZSB0YWtlcyBpdHNcbiAqIHNlc3Npb24gd2l0aCBpdCBhbmQgbW92ZXMgbGF0ZXIgc2Vzc2lvbnMgZG93biB3aXRoIHRoZWlyIHByb2ZpbGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0PHN0cmluZywgKj59IGJ1bmtlclNlc3Npb25zXG4gKiBAcGFyYW0ge251bWJlcn0gcmVtb3ZlZEluZGV4XG4gKiBAcmV0dXJucyB7T2JqZWN0PHN0cmluZywgKj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJTZXNzaW9uc0FmdGVyRGVsZXRlKGJ1bmtlclNlc3Npb25zLCByZW1vdmVkSW5kZXgpIHtcbiAgICBjb25zdCBzaGlmdGVkID0ge307XG4gICAgZm9yIChjb25zdCBbcG9zaXRpb24sIHNlc3Npb25dIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmtlclNlc3Npb25zIHx8IHt9KSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IE51bWJlcihwb3NpdGlvbik7XG4gICAgICAgIGlmIChpbmRleCA9PT0gcmVtb3ZlZEluZGV4KSBjb250aW51ZTtcbiAgICAgICAgc2hpZnRlZFtpbmRleCA+IHJlbW92ZWRJbmRleCA/IGluZGV4IC0gMSA6IGluZGV4XSA9IHNlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBzaGlmdGVkO1xufVxuXG4vKipcbiAqIFRoZSBzYW1lLCBmb3IgYW55IGNoYW5nZSBvZiBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsICo+fSBidW5rZXJTZXNzaW9uc1xuICogQHBhcmFtIHtBcnJheTxbbnVtYmVyLCA/bnVtYmVyXT59IG1vdmVzIGVhY2ggcHJvZmlsZSB0aGF0IG1vdmVkLCBhbmQgdG8gd2hlcmU7IG51bGwgaWYgZ29uZVxuICogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyU2Vzc2lvbnNBZnRlck1vdmVzKGJ1bmtlclNlc3Npb25zLCBtb3Zlcykge1xuICAgIGNvbnN0IG1vdmVkID0gbmV3IE1hcChtb3Zlcyk7XG4gICAgY29uc3QgcGxhY2VkID0ge307XG4gICAgZm9yIChjb25zdCBbcG9zaXRpb24sIHNlc3Npb25dIG9mIE9iamVjdC5lbnRyaWVzKGJ1bmtlclNlc3Npb25zIHx8IHt9KSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IE51bWJlcihwb3NpdGlvbik7XG4gICAgICAgIGNvbnN0IHRvID0gbW92ZWQuaGFzKGluZGV4KSA/IG1vdmVkLmdldChpbmRleCkgOiBpbmRleDtcbiAgICAgICAgaWYgKHRvICE9PSBudWxsKSBwbGFjZWRbdG9dID0gc2Vzc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIHBsYWNlZDtcbn1cbiIsICIvKipcbiAqIE9uZSBvcmRlcmVkIHdyaXRlIHBhdGggZm9yIHRoZSBgcHJvZmlsZXNgIGFycmF5IGluIHN0b3JhZ2UubG9jYWwuXG4gKlxuICogRXZlcnkgd3JpdGVyIHVzZWQgdG8gcmVhZCB0aGUgd2hvbGUgYXJyYXksIGF3YWl0IHNvbWV0aGluZyAoY3J5cHRvLCBhIHJlbGF5XG4gKiBmZXRjaCwgYW5vdGhlciBzdG9yYWdlIHJlYWQpIGFuZCB3cml0ZSB0aGUgd2hvbGUgYXJyYXkgYmFjay4gQSBzbG93IHdyaXRlclxuICogdGhlbiB3cm90ZSBhIHN0YWxlIGNvcHkgb3ZlciBhIG5ld2VyIG9uZTogYSByZWxheSBlZGl0IHZhbmlzaGVkLCBvciBhIHNpdGVcbiAqIHBlcm1pc3Npb24gdGhhdCBoYWQganVzdCBiZWVuIHJldm9rZWQgY2FtZSBiYWNrLlxuICpcbiAqIEhlcmUgZXZlcnkgY2hhbmdlIHJ1bnMgYXM6IHRha2UgdGhlIGxvY2ssIHJlYWQgYHByb2ZpbGVzYCBmcmVzaCwgYXBwbHkgYVxuICogU1lOQ0hST05PVVMgbXV0YXRvciB0aGF0IGNoYW5nZXMgb25seSB0aGUgZmllbGRzIGl0cyBjYWxsZXIgb3ducywgd3JpdGUsIGxldFxuICogZ28uIFNsb3cgd29yayBoYXBwZW5zIGJlZm9yZSB0aGUgY2FsbCwgbmV2ZXIgaW5zaWRlIHRoZSBsb2NrLlxuICpcbiAqIFRoZSBsb2NrIGlzIHRoZSBXZWIgTG9ja3MgQVBJIHdoZW4gdGhlIGNvbnRleHQgaGFzIGl0LiBUaGUgd29ya2VyIGFuZCBldmVyeVxuICogZXh0ZW5zaW9uIHBhZ2Ugc2hhcmUgb25lIG9yaWdpbiwgc28gb25lIG5hbWVkIGxvY2sgb3JkZXJzIHdyaXRlcyBhY3Jvc3MgYWxsXG4gKiBvZiB0aGVtIHdpdGhvdXQgYSBuZXcgbWVzc2FnZSBraW5kLiBFYWNoIGNvbnRleHQgYWxzbyBjaGFpbnMgaXRzIG93biBjYWxscyxcbiAqIHdoaWNoIGlzIHRoZSB3aG9sZSBsb2NrIHdoZXJlIFdlYiBMb2NrcyBhcmUgbWlzc2luZyAodGVzdHMsIG9sZGVyIGVuZ2luZXMpLlxuICovXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5jb25zdCBMT0NLX05BTUUgPSAnbm9zdHJrZXk6cHJvZmlsZXMnO1xubGV0IGxvY2FsQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblxuLyoqIFJ1biBgZm5gIHdpdGggdGhlIHByb2ZpbGVzIGxvY2sgaGVsZC4gTmV2ZXIgY2FsbCB0aGlzIGZyb20gaW5zaWRlIGBmbmAuICovXG5leHBvcnQgZnVuY3Rpb24gd2l0aFByb2ZpbGVzTG9jayhmbikge1xuICAgIGNvbnN0IGxvY2tzID0gZ2xvYmFsVGhpcy5uYXZpZ2F0b3I/LmxvY2tzO1xuICAgIGNvbnN0IHRhc2sgPSAobG9ja3MgJiYgdHlwZW9mIGxvY2tzLnJlcXVlc3QgPT09ICdmdW5jdGlvbicpXG4gICAgICAgID8gKCkgPT4gbG9ja3MucmVxdWVzdChMT0NLX05BTUUsICgpID0+IGZuKCkpXG4gICAgICAgIDogKCkgPT4gZm4oKTtcbiAgICBjb25zdCBydW4gPSBsb2NhbENoYWluLnRoZW4odGFzaywgdGFzayk7XG4gICAgbG9jYWxDaGFpbiA9IHJ1bi5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJ1bjtcbn1cblxuLyoqXG4gKiBSZWFkIGBwcm9maWxlc2AgZnJlc2gsIGFwcGx5IGBtdXRhdG9yKHByb2ZpbGVzLCBkYXRhKWAgYW5kIHdyaXRlIHRoZSByZXN1bHQuXG4gKlxuICogVGhlIG11dGF0b3IgbXVzdCBiZSBzeW5jaHJvbm91cy4gSXQgY2hhbmdlcyB0aGUgYXJyYXkgaW4gcGxhY2UgYW5kIHJldHVybnNcbiAqIGZhbHNlIHRvIHNraXAgdGhlIHdyaXRlLCBvciBhbiBvYmplY3Qgb2Ygb3RoZXIga2V5cyB0byB3cml0ZSBpbiB0aGUgc2FtZVxuICogc3RvcmFnZSB3cml0ZSwgb3Igbm90aGluZy4gYGtleXNgIG5hbWVzIG90aGVyIHN0b3JlZCB2YWx1ZXMgKHdpdGggZGVmYXVsdHMpXG4gKiB0aGUgbXV0YXRvciBuZWVkcyB0byByZWFkOyB0aGV5IGFycml2ZSBpbiBgZGF0YWAuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e3dyaXR0ZW46IGJvb2xlYW4sIHByb2ZpbGVzOiBBcnJheX0+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlUHJvZmlsZXMobXV0YXRvciwgeyBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWwsIGtleXMgPSB7fSB9ID0ge30pIHtcbiAgICByZXR1cm4gd2l0aFByb2ZpbGVzTG9jayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IC4uLmtleXMsIHByb2ZpbGVzOiBbXSB9KTtcbiAgICAgICAgY29uc3QgcHJvZmlsZXMgPSBBcnJheS5pc0FycmF5KGRhdGEucHJvZmlsZXMpID8gZGF0YS5wcm9maWxlcyA6IFtdO1xuICAgICAgICBjb25zdCBvdXQgPSBtdXRhdG9yKHByb2ZpbGVzLCBkYXRhKTtcbiAgICAgICAgaWYgKG91dCAmJiB0eXBlb2Ygb3V0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndXBkYXRlUHJvZmlsZXM6IHRoZSBtdXRhdG9yIG11c3QgYmUgc3luY2hyb25vdXMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3V0ID09PSBmYWxzZSkgcmV0dXJuIHsgd3JpdHRlbjogZmFsc2UsIHByb2ZpbGVzIH07XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgLi4uKG91dCB8fCB7fSksIHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4geyB3cml0dGVuOiB0cnVlLCBwcm9maWxlcyB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEFwcGx5IHByaXZhdGUta2V5IGNoYW5nZXMgd29ya2VkIG91dCBlYXJsaWVyLCBtYXRjaGVkIGJ5IHRoZSBzdG9yZWQgYmxvYlxuICogdGhleSByZXBsYWNlLCBzbyBhIHByb2ZpbGUgdGhhdCBtb3ZlZCBvciBjaGFuZ2VkIG1lYW53aGlsZSBpcyBuZXZlciB0b3VjaGVkXG4gKiBieSBtaXN0YWtlLiBgY2hhbmdlc2AgbWFwcyBhbiBvbGQgcHJpdktleSB0byBgeyBwcml2S2V5PywgcHViS2V5PyB9YDsgYVxuICogcHViS2V5IGlzIG9ubHkgZmlsbGVkIGluIHdoZXJlIG5vbmUgaXMgY2FjaGVkLiBSZXR1cm5zIHRoZSB1cGRhdGUgcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlLZXlDaGFuZ2VzKGNoYW5nZXMsIHsgc3RvcmFnZSwgZXh0cmEgPSBudWxsLCB3cml0ZUlmRW1wdHkgPSBmYWxzZSB9ID0ge30pIHtcbiAgICBpZiAoIShjaGFuZ2VzIGluc3RhbmNlb2YgTWFwKSB8fCAoY2hhbmdlcy5zaXplID09PSAwICYmICF3cml0ZUlmRW1wdHkpKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoeyB3cml0dGVuOiBmYWxzZSwgcHJvZmlsZXM6IG51bGwgfSk7XG4gICAgfVxuICAgIHJldHVybiB1cGRhdGVQcm9maWxlcygocHJvZmlsZXMpID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHByb2ZpbGVzKSB7XG4gICAgICAgICAgICBpZiAoIXAgfHwgIXAucHJpdktleSB8fCAhY2hhbmdlcy5oYXMocC5wcml2S2V5KSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBjID0gY2hhbmdlcy5nZXQocC5wcml2S2V5KTtcbiAgICAgICAgICAgIGlmIChjLnB1YktleSAmJiAhcC5wdWJLZXkpIHsgcC5wdWJLZXkgPSBjLnB1YktleTsgY2hhbmdlZCA9IHRydWU7IH1cbiAgICAgICAgICAgIGlmIChjLnByaXZLZXkgJiYgYy5wcml2S2V5ICE9PSBwLnByaXZLZXkpIHsgcC5wcml2S2V5ID0gYy5wcml2S2V5OyBjaGFuZ2VkID0gdHJ1ZTsgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY2hhbmdlZCAmJiAhd3JpdGVJZkVtcHR5KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBleHRyYSB8fCB1bmRlZmluZWQ7XG4gICAgfSwgeyBzdG9yYWdlIH0pO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1DQSxXQUFTLFVBQVUs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
