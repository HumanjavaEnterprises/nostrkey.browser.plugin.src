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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1lcmdlLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc2VjcmV0LXZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY3J5cHRvLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnVua2VyLXVybC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBNaW5pbWFsIHByb2Nlc3Mgc2hpbSBmb3IgYnJvd3NlciBjb250ZXh0LlxuICogTm9kZS5qcyBsaWJyYXJpZXMgYnVuZGxlZCB2aWEgbm9zdHItY3J5cHRvLXV0aWxzIChjcnlwdG8tYnJvd3NlcmlmeSxcbiAqIHJlYWRhYmxlLXN0cmVhbSwgZXRjLikgcmVmZXJlbmNlIHRoZSBnbG9iYWwgYHByb2Nlc3NgIG9iamVjdC5cbiAqIFRoaXMgcHJvdmlkZXMganVzdCBlbm91Z2ggZm9yIHRoZW0gdG8gd29yayBpbiBhIGJyb3dzZXIgZXh0ZW5zaW9uLlxuICovXG5leHBvcnQgdmFyIHByb2Nlc3MgPSB7XG4gICAgZW52OiB7IE5PREVfRU5WOiAncHJvZHVjdGlvbicsIExPR19MRVZFTDogJ3dhcm4nIH0sXG4gICAgYnJvd3NlcjogdHJ1ZSxcbiAgICB2ZXJzaW9uOiAnJyxcbiAgICBzdGRvdXQ6IG51bGwsXG4gICAgc3RkZXJyOiBudWxsLFxuICAgIG5leHRUaWNrOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkobnVsbCwgYXJncyk7IH0pO1xuICAgIH0sXG59O1xuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zZXNzaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBNVjMgaW4tbWVtb3J5IGFyZWEgdGhhdCBzdXJ2aXZlcyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbiBidXQgbmV2ZXIgdG91Y2hlc1xuICAgIC8vIGRpc2suIE51bGwgb24gZW5naW5lcyB0aGF0IGRvbid0IGltcGxlbWVudCBpdCAoU2FmYXJpIGJhY2tncm91bmQgcGFnZSxcbiAgICAvLyBvbGRlciBGaXJlZm94KSBcdTIwMTQgY2FsbGVycyBtdXN0IGZlYXR1cmUtZGV0ZWN0IGFuZCBmYWxsIGJhY2suXG4gICAgc2Vzc2lvbjogX2Jyb3dzZXIuc3RvcmFnZT8uc2Vzc2lvbiA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3RyaWN0IHRoZSBhcmVhIHRvIGV4dGVuc2lvbi1wcml2aWxlZ2VkIGNvbnRleHRzLiBDaHJvbWUtb25seTtcbiAgICAgICAgICogcmVzb2x2ZXMgaGFybWxlc3NseSB3aGVyZSB0aGUgbWV0aG9kIGlzIGFic2VudC5cbiAgICAgICAgICovXG4gICAgICAgIHNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiY29uc3QgaW5zdGFuY2VPZkFueSA9IChvYmplY3QsIGNvbnN0cnVjdG9ycykgPT4gY29uc3RydWN0b3JzLnNvbWUoKGMpID0+IG9iamVjdCBpbnN0YW5jZW9mIGMpO1xuXG5sZXQgaWRiUHJveHlhYmxlVHlwZXM7XG5sZXQgY3Vyc29yQWR2YW5jZU1ldGhvZHM7XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldElkYlByb3h5YWJsZVR5cGVzKCkge1xuICAgIHJldHVybiAoaWRiUHJveHlhYmxlVHlwZXMgfHxcbiAgICAgICAgKGlkYlByb3h5YWJsZVR5cGVzID0gW1xuICAgICAgICAgICAgSURCRGF0YWJhc2UsXG4gICAgICAgICAgICBJREJPYmplY3RTdG9yZSxcbiAgICAgICAgICAgIElEQkluZGV4LFxuICAgICAgICAgICAgSURCQ3Vyc29yLFxuICAgICAgICAgICAgSURCVHJhbnNhY3Rpb24sXG4gICAgICAgIF0pKTtcbn1cbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKSB7XG4gICAgcmV0dXJuIChjdXJzb3JBZHZhbmNlTWV0aG9kcyB8fFxuICAgICAgICAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgPSBbXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmFkdmFuY2UsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZVByaW1hcnlLZXksXG4gICAgICAgIF0pKTtcbn1cbmNvbnN0IHRyYW5zYWN0aW9uRG9uZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCB0cmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHdyYXAocmVxdWVzdC5yZXN1bHQpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gVGhpcyBtYXBwaW5nIGV4aXN0cyBpbiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgYnV0IGRvZXNuJ3QgZXhpc3QgaW4gdHJhbnNmb3JtQ2FjaGUuIFRoaXNcbiAgICAvLyBpcyBiZWNhdXNlIHdlIGNyZWF0ZSBtYW55IHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdC5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb21pc2UsIHJlcXVlc3QpO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHR4KSB7XG4gICAgLy8gRWFybHkgYmFpbCBpZiB3ZSd2ZSBhbHJlYWR5IGNyZWF0ZWQgYSBkb25lIHByb21pc2UgZm9yIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgaWYgKHRyYW5zYWN0aW9uRG9uZU1hcC5oYXModHgpKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgZG9uZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QodHguZXJyb3IgfHwgbmV3IERPTUV4Y2VwdGlvbignQWJvcnRFcnJvcicsICdBYm9ydEVycm9yJykpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBDYWNoZSBpdCBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuICAgIHRyYW5zYWN0aW9uRG9uZU1hcC5zZXQodHgsIGRvbmUpO1xufVxubGV0IGlkYlByb3h5VHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciB0cmFuc2FjdGlvbi5kb25lLlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdkb25lJylcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25Eb25lTWFwLmdldCh0YXJnZXQpO1xuICAgICAgICAgICAgLy8gTWFrZSB0eC5zdG9yZSByZXR1cm4gdGhlIG9ubHkgc3RvcmUgaW4gdGhlIHRyYW5zYWN0aW9uLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG1hbnkuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ3N0b3JlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzFdXG4gICAgICAgICAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIDogcmVjZWl2ZXIub2JqZWN0U3RvcmUocmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSB0cmFuc2Zvcm0gd2hhdGV2ZXIgd2UgZ2V0IGJhY2suXG4gICAgICAgIHJldHVybiB3cmFwKHRhcmdldFtwcm9wXSk7XG4gICAgfSxcbiAgICBzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbiAmJlxuICAgICAgICAgICAgKHByb3AgPT09ICdkb25lJyB8fCBwcm9wID09PSAnc3RvcmUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0O1xuICAgIH0sXG59O1xuZnVuY3Rpb24gcmVwbGFjZVRyYXBzKGNhbGxiYWNrKSB7XG4gICAgaWRiUHJveHlUcmFwcyA9IGNhbGxiYWNrKGlkYlByb3h5VHJhcHMpO1xufVxuZnVuY3Rpb24gd3JhcEZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBEdWUgdG8gZXhwZWN0ZWQgb2JqZWN0IGVxdWFsaXR5ICh3aGljaCBpcyBlbmZvcmNlZCBieSB0aGUgY2FjaGluZyBpbiBgd3JhcGApLCB3ZVxuICAgIC8vIG9ubHkgY3JlYXRlIG9uZSBuZXcgZnVuYyBwZXIgZnVuYy5cbiAgICAvLyBDdXJzb3IgbWV0aG9kcyBhcmUgc3BlY2lhbCwgYXMgdGhlIGJlaGF2aW91ciBpcyBhIGxpdHRsZSBtb3JlIGRpZmZlcmVudCB0byBzdGFuZGFyZCBJREIuIEluXG4gICAgLy8gSURCLCB5b3UgYWR2YW5jZSB0aGUgY3Vyc29yIGFuZCB3YWl0IGZvciBhIG5ldyAnc3VjY2Vzcycgb24gdGhlIElEQlJlcXVlc3QgdGhhdCBnYXZlIHlvdSB0aGVcbiAgICAvLyBjdXJzb3IuIEl0J3Mga2luZGEgbGlrZSBhIHByb21pc2UgdGhhdCBjYW4gcmVzb2x2ZSB3aXRoIG1hbnkgdmFsdWVzLiBUaGF0IGRvZXNuJ3QgbWFrZSBzZW5zZVxuICAgIC8vIHdpdGggcmVhbCBwcm9taXNlcywgc28gZWFjaCBhZHZhbmNlIG1ldGhvZHMgcmV0dXJucyBhIG5ldyBwcm9taXNlIGZvciB0aGUgY3Vyc29yIG9iamVjdCwgb3JcbiAgICAvLyB1bmRlZmluZWQgaWYgdGhlIGVuZCBvZiB0aGUgY3Vyc29yIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgaWYgKGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkuaW5jbHVkZXMoZnVuYykpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICAgICAgZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIHdyYXAodGhpcy5yZXF1ZXN0KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgcmV0dXJuIHdyYXAoZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIHJldHVybiB3cmFwRnVuY3Rpb24odmFsdWUpO1xuICAgIC8vIFRoaXMgZG9lc24ndCByZXR1cm4sIGl0IGp1c3QgY3JlYXRlcyBhICdkb25lJyBwcm9taXNlIGZvciB0aGUgdHJhbnNhY3Rpb24sXG4gICAgLy8gd2hpY2ggaXMgbGF0ZXIgcmV0dXJuZWQgZm9yIHRyYW5zYWN0aW9uLmRvbmUgKHNlZSBpZGJPYmplY3RIYW5kbGVyKS5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbilcbiAgICAgICAgY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHZhbHVlKTtcbiAgICBpZiAoaW5zdGFuY2VPZkFueSh2YWx1ZSwgZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSkpXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkodmFsdWUsIGlkYlByb3h5VHJhcHMpO1xuICAgIC8vIFJldHVybiB0aGUgc2FtZSB2YWx1ZSBiYWNrIGlmIHdlJ3JlIG5vdCBnb2luZyB0byB0cmFuc2Zvcm0gaXQuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gd3JhcCh2YWx1ZSkge1xuICAgIC8vIFdlIHNvbWV0aW1lcyBnZW5lcmF0ZSBtdWx0aXBsZSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QgKGVnIHdoZW4gY3Vyc29yaW5nKSwgYmVjYXVzZVxuICAgIC8vIElEQiBpcyB3ZWlyZCBhbmQgYSBzaW5nbGUgSURCUmVxdWVzdCBjYW4geWllbGQgbWFueSByZXNwb25zZXMsIHNvIHRoZXNlIGNhbid0IGJlIGNhY2hlZC5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJSZXF1ZXN0KVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdCh2YWx1ZSk7XG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSB0cmFuc2Zvcm1lZCB0aGlzIHZhbHVlIGJlZm9yZSwgcmV1c2UgdGhlIHRyYW5zZm9ybWVkIHZhbHVlLlxuICAgIC8vIFRoaXMgaXMgZmFzdGVyLCBidXQgaXQgYWxzbyBwcm92aWRlcyBvYmplY3QgZXF1YWxpdHkuXG4gICAgaWYgKHRyYW5zZm9ybUNhY2hlLmhhcyh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSk7XG4gICAgLy8gTm90IGFsbCB0eXBlcyBhcmUgdHJhbnNmb3JtZWQuXG4gICAgLy8gVGhlc2UgbWF5IGJlIHByaW1pdGl2ZSB0eXBlcywgc28gdGhleSBjYW4ndCBiZSBXZWFrTWFwIGtleXMuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB0cmFuc2Zvcm1DYWNoZS5zZXQodmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChuZXdWYWx1ZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3VmFsdWU7XG59XG5jb25zdCB1bndyYXAgPSAodmFsdWUpID0+IHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuXG4vKipcbiAqIE9wZW4gYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqIEBwYXJhbSB2ZXJzaW9uIFNjaGVtYSB2ZXJzaW9uLlxuICogQHBhcmFtIGNhbGxiYWNrcyBBZGRpdGlvbmFsIGNhbGxiYWNrcy5cbiAqL1xuZnVuY3Rpb24gb3BlbkRCKG5hbWUsIHZlcnNpb24sIHsgYmxvY2tlZCwgdXBncmFkZSwgYmxvY2tpbmcsIHRlcm1pbmF0ZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKG5hbWUsIHZlcnNpb24pO1xuICAgIGNvbnN0IG9wZW5Qcm9taXNlID0gd3JhcChyZXF1ZXN0KTtcbiAgICBpZiAodXBncmFkZSkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZ3JhZGVuZWVkZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHVwZ3JhZGUod3JhcChyZXF1ZXN0LnJlc3VsdCksIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIHdyYXAocmVxdWVzdC50cmFuc2FjdGlvbiksIGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICBvcGVuUHJvbWlzZVxuICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgaWYgKHRlcm1pbmF0ZWQpXG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHRlcm1pbmF0ZWQoKSk7XG4gICAgICAgIGlmIChibG9ja2luZykge1xuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcigndmVyc2lvbmNoYW5nZScsIChldmVudCkgPT4gYmxvY2tpbmcoZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pO1xuICAgIHJldHVybiBvcGVuUHJvbWlzZTtcbn1cbi8qKlxuICogRGVsZXRlIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURCKG5hbWUsIHsgYmxvY2tlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLmRlbGV0ZURhdGFiYXNlKG5hbWUpO1xuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gd3JhcChyZXF1ZXN0KS50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG59XG5cbmNvbnN0IHJlYWRNZXRob2RzID0gWydnZXQnLCAnZ2V0S2V5JywgJ2dldEFsbCcsICdnZXRBbGxLZXlzJywgJ2NvdW50J107XG5jb25zdCB3cml0ZU1ldGhvZHMgPSBbJ3B1dCcsICdhZGQnLCAnZGVsZXRlJywgJ2NsZWFyJ107XG5jb25zdCBjYWNoZWRNZXRob2RzID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkge1xuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIElEQkRhdGFiYXNlICYmXG4gICAgICAgICEocHJvcCBpbiB0YXJnZXQpICYmXG4gICAgICAgIHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkTWV0aG9kcy5nZXQocHJvcCkpXG4gICAgICAgIHJldHVybiBjYWNoZWRNZXRob2RzLmdldChwcm9wKTtcbiAgICBjb25zdCB0YXJnZXRGdW5jTmFtZSA9IHByb3AucmVwbGFjZSgvRnJvbUluZGV4JC8sICcnKTtcbiAgICBjb25zdCB1c2VJbmRleCA9IHByb3AgIT09IHRhcmdldEZ1bmNOYW1lO1xuICAgIGNvbnN0IGlzV3JpdGUgPSB3cml0ZU1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpO1xuICAgIGlmIChcbiAgICAvLyBCYWlsIGlmIHRoZSB0YXJnZXQgZG9lc24ndCBleGlzdCBvbiB0aGUgdGFyZ2V0LiBFZywgZ2V0QWxsIGlzbid0IGluIEVkZ2UuXG4gICAgISh0YXJnZXRGdW5jTmFtZSBpbiAodXNlSW5kZXggPyBJREJJbmRleCA6IElEQk9iamVjdFN0b3JlKS5wcm90b3R5cGUpIHx8XG4gICAgICAgICEoaXNXcml0ZSB8fCByZWFkTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbWV0aG9kID0gYXN5bmMgZnVuY3Rpb24gKHN0b3JlTmFtZSwgLi4uYXJncykge1xuICAgICAgICAvLyBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiB1bmRlZmluZWQgZ3ppcHBzIGJldHRlciwgYnV0IGZhaWxzIGluIEVkZ2UgOihcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLnRyYW5zYWN0aW9uKHN0b3JlTmFtZSwgaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogJ3JlYWRvbmx5Jyk7XG4gICAgICAgIGxldCB0YXJnZXQgPSB0eC5zdG9yZTtcbiAgICAgICAgaWYgKHVzZUluZGV4KVxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmluZGV4KGFyZ3Muc2hpZnQoKSk7XG4gICAgICAgIC8vIE11c3QgcmVqZWN0IGlmIG9wIHJlamVjdHMuXG4gICAgICAgIC8vIElmIGl0J3MgYSB3cml0ZSBvcGVyYXRpb24sIG11c3QgcmVqZWN0IGlmIHR4LmRvbmUgcmVqZWN0cy5cbiAgICAgICAgLy8gTXVzdCByZWplY3Qgd2l0aCBvcCByZWplY3Rpb24gZmlyc3QuXG4gICAgICAgIC8vIE11c3QgcmVzb2x2ZSB3aXRoIG9wIHZhbHVlLlxuICAgICAgICAvLyBNdXN0IGhhbmRsZSBib3RoIHByb21pc2VzIChubyB1bmhhbmRsZWQgcmVqZWN0aW9ucylcbiAgICAgICAgcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0YXJnZXRbdGFyZ2V0RnVuY05hbWVdKC4uLmFyZ3MpLFxuICAgICAgICAgICAgaXNXcml0ZSAmJiB0eC5kb25lLFxuICAgICAgICBdKSlbMF07XG4gICAgfTtcbiAgICBjYWNoZWRNZXRob2RzLnNldChwcm9wLCBtZXRob2QpO1xuICAgIHJldHVybiBtZXRob2Q7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldDogKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSxcbiAgICBoYXM6ICh0YXJnZXQsIHByb3ApID0+ICEhZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCksXG59KSk7XG5cbmNvbnN0IGFkdmFuY2VNZXRob2RQcm9wcyA9IFsnY29udGludWUnLCAnY29udGludWVQcmltYXJ5S2V5JywgJ2FkdmFuY2UnXTtcbmNvbnN0IG1ldGhvZE1hcCA9IHt9O1xuY29uc3QgYWR2YW5jZVJlc3VsdHMgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgY3Vyc29ySXRlcmF0b3JUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICghYWR2YW5jZU1ldGhvZFByb3BzLmluY2x1ZGVzKHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgbGV0IGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF07XG4gICAgICAgIGlmICghY2FjaGVkRnVuYykge1xuICAgICAgICAgICAgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgYWR2YW5jZVJlc3VsdHMuc2V0KHRoaXMsIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LmdldCh0aGlzKVtwcm9wXSguLi5hcmdzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZWRGdW5jO1xuICAgIH0sXG59O1xuYXN5bmMgZnVuY3Rpb24qIGl0ZXJhdGUoLi4uYXJncykge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby10aGlzLWFzc2lnbm1lbnRcbiAgICBsZXQgY3Vyc29yID0gdGhpcztcbiAgICBpZiAoIShjdXJzb3IgaW5zdGFuY2VvZiBJREJDdXJzb3IpKSB7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5vcGVuQ3Vyc29yKC4uLmFyZ3MpO1xuICAgIH1cbiAgICBpZiAoIWN1cnNvcilcbiAgICAgICAgcmV0dXJuO1xuICAgIGN1cnNvciA9IGN1cnNvcjtcbiAgICBjb25zdCBwcm94aWVkQ3Vyc29yID0gbmV3IFByb3h5KGN1cnNvciwgY3Vyc29ySXRlcmF0b3JUcmFwcyk7XG4gICAgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuc2V0KHByb3hpZWRDdXJzb3IsIGN1cnNvcik7XG4gICAgLy8gTWFwIHRoaXMgZG91YmxlLXByb3h5IGJhY2sgdG8gdGhlIG9yaWdpbmFsLCBzbyBvdGhlciBjdXJzb3IgbWV0aG9kcyB3b3JrLlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJveGllZEN1cnNvciwgdW53cmFwKGN1cnNvcikpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgeWllbGQgcHJveGllZEN1cnNvcjtcbiAgICAgICAgLy8gSWYgb25lIG9mIHRoZSBhZHZhbmNpbmcgbWV0aG9kcyB3YXMgbm90IGNhbGxlZCwgY2FsbCBjb250aW51ZSgpLlxuICAgICAgICBjdXJzb3IgPSBhd2FpdCAoYWR2YW5jZVJlc3VsdHMuZ2V0KHByb3hpZWRDdXJzb3IpIHx8IGN1cnNvci5jb250aW51ZSgpKTtcbiAgICAgICAgYWR2YW5jZVJlc3VsdHMuZGVsZXRlKHByb3hpZWRDdXJzb3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkge1xuICAgIHJldHVybiAoKHByb3AgPT09IFN5bWJvbC5hc3luY0l0ZXJhdG9yICYmXG4gICAgICAgIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlLCBJREJDdXJzb3JdKSkgfHxcbiAgICAgICAgKHByb3AgPT09ICdpdGVyYXRlJyAmJiBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZV0pKSk7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmIChpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGU7XG4gICAgICAgIHJldHVybiBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIHJldHVybiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApO1xuICAgIH0sXG59KSk7XG5cbmV4cG9ydCB7IGRlbGV0ZURCLCBvcGVuREIsIHVud3JhcCwgd3JhcCB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGFza0dhdGUsIHN0YXJ0UGFnZSB9IGZyb20gJy4uL3V0aWxpdGllcy9wYWdlLWdhdGUnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcbmltcG9ydCB7XG4gICAgZ2V0QXBpS2V5U3RvcmUsXG4gICAgc2F2ZUFwaUtleSxcbiAgICBkZWxldGVBcGlLZXksXG4gICAgbGlzdEFwaUtleXMsXG4gICAgc2V0U3luY0VuYWJsZWQsXG4gICAgaXNTeW5jRW5hYmxlZCxcbiAgICB1cGRhdGVTdG9yZVN5bmNTdGF0ZSxcbiAgICBleHBvcnRTdG9yZSxcbiAgICBpbXBvcnRTdG9yZSxcbiAgICBrZXlzRm9yUmVsYXksXG4gICAgZ2V0RGVsZXRlZEtleXMsXG59IGZyb20gJy4uL3V0aWxpdGllcy9hcGkta2V5LXN0b3JlJztcbmltcG9ydCB7IG1lcmdlUmVtb3RlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3N5bmMtbWVyZ2UnO1xuaW1wb3J0IHsgc2V0VW5sb2NrZWQgfSBmcm9tICcuLi91dGlsaXRpZXMvc2VjcmV0LXZhdWx0JztcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAga2V5czogW10sXG4gICAgbmV3TGFiZWw6ICcnLFxuICAgIG5ld1NlY3JldDogJycsXG4gICAgZWRpdGluZ0lkOiBudWxsLFxuICAgIGVkaXRMYWJlbDogJycsXG4gICAgZWRpdFNlY3JldDogJycsXG4gICAgY29waWVkSWQ6IG51bGwsXG4gICAgcmV2ZWFsZWRJZDogbnVsbCxcbiAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsXG4gICAgc3luY0Vycm9yOiAnJyxcbiAgICBzYXZpbmc6IGZhbHNlLFxuICAgIHRvYXN0OiAnJyxcbiAgICByZWxheUluZm86IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9LFxufTtcblxuZnVuY3Rpb24gJChpZCkgeyByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOyB9XG5cbmZ1bmN0aW9uIGhhc1JlbGF5cygpIHtcbiAgICByZXR1cm4gc3RhdGUucmVsYXlJbmZvLnJlYWQubGVuZ3RoID4gMCB8fCBzdGF0ZS5yZWxheUluZm8ud3JpdGUubGVuZ3RoID4gMDtcbn1cblxuZnVuY3Rpb24gc29ydGVkS2V5cygpIHtcbiAgICByZXR1cm4gWy4uLnN0YXRlLmtleXNdLnNvcnQoKGEsIGIpID0+XG4gICAgICAgIGEubGFiZWwudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIubGFiZWwudG9Mb3dlckNhc2UoKSksXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gbWFza1NlY3JldChzZWNyZXQpIHtcbiAgICBpZiAoIXNlY3JldCkgcmV0dXJuICcnO1xuICAgIGlmIChzZWNyZXQubGVuZ3RoIDw9IDgpIHJldHVybiAnXFx1MjAyMicucmVwZWF0KHNlY3JldC5sZW5ndGgpO1xuICAgIHJldHVybiBzZWNyZXQuc2xpY2UoMCwgNCkgKyAnXFx1MjAyMicucmVwZWF0KDQpICsgc2VjcmV0LnNsaWNlKC00KTtcbn1cblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1zZykge1xuICAgIHN0YXRlLnRvYXN0ID0gbXNnO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS50b2FzdCA9ICcnOyByZW5kZXIoKTsgfSwgMjAwMCk7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNDbGFzcyhzdGF0dXMpIHtcbiAgICBpZiAoc3RhdHVzID09PSAnaWRsZScpIHJldHVybiBzdGF0ZS5zeW5jRW5hYmxlZCA/ICdsZWQtLWdyZWVuJyA6ICdsZWQtLW9mZic7XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N5bmNpbmcnKSByZXR1cm4gJ2xlZC0tYW1iZXIgYW5pbWF0ZS1wdWxzZSc7XG4gICAgcmV0dXJuICdsZWQtLXJlZCc7XG59XG5cbmZ1bmN0aW9uIHN5bmNTdGF0dXNUZXh0KCkge1xuICAgIGlmIChzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnU3luY2luZy4uLic7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdlcnJvcicpIHJldHVybiBzdGF0ZS5zeW5jRXJyb3I7XG4gICAgcmV0dXJuIHN0YXRlLnN5bmNFbmFibGVkID8gJ1N5bmNlZCcgOiAnTG9jYWwgb25seSc7XG59XG5cbi8vIC0tLSBSZW5kZXIgLS0tXG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAvLyBTeW5jIGJhclxuICAgIGNvbnN0IHN5bmNEb3QgPSAkKCdzeW5jLWRvdCcpO1xuICAgIGNvbnN0IHN5bmNUZXh0ID0gJCgnc3luYy10ZXh0Jyk7XG4gICAgY29uc3Qgc3luY0J0biA9ICQoJ3N5bmMtYnRuJyk7XG4gICAgY29uc3Qgc3luY1RvZ2dsZSA9ICQoJ3N5bmMtdG9nZ2xlJyk7XG4gICAgY29uc3Qga2V5Q291bnQgPSAkKCdrZXktY291bnQnKTtcblxuICAgIGlmIChzeW5jRG90KSBzeW5jRG90LmNsYXNzTmFtZSA9IGBsZWQgJHtzeW5jU3RhdHVzQ2xhc3Moc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyl9YDtcbiAgICBpZiAoc3luY1RleHQpIHN5bmNUZXh0LnRleHRDb250ZW50ID0gc3luY1N0YXR1c1RleHQoKTtcbiAgICBpZiAoc3luY0J0bikgc3luY0J0bi5kaXNhYmxlZCA9IHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJyB8fCAhaGFzUmVsYXlzKCkgfHwgIXN0YXRlLnN5bmNFbmFibGVkO1xuICAgIGlmIChzeW5jVG9nZ2xlKSBzeW5jVG9nZ2xlLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgU3RyaW5nKHN0YXRlLnN5bmNFbmFibGVkKSk7XG4gICAgaWYgKGtleUNvdW50KSBrZXlDb3VudC50ZXh0Q29udGVudCA9IHN0YXRlLmtleXMubGVuZ3RoICsgJyBrZXknICsgKHN0YXRlLmtleXMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpO1xuXG4gICAgLy8gS2V5IHRhYmxlXG4gICAgY29uc3Qga2V5VGFibGVDb250YWluZXIgPSAkKCdrZXktdGFibGUtY29udGFpbmVyJyk7XG4gICAgY29uc3Qgbm9LZXlzTXNnID0gJCgnbm8ta2V5cycpO1xuICAgIGNvbnN0IGtleVRhYmxlQm9keSA9ICQoJ2tleS10YWJsZS1ib2R5Jyk7XG5cbiAgICBpZiAoa2V5VGFibGVDb250YWluZXIpIGtleVRhYmxlQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5rZXlzLmxlbmd0aCA+IDAgPyAnYmxvY2snIDogJ25vbmUnO1xuICAgIGlmIChub0tleXNNc2cpIG5vS2V5c01zZy5zdHlsZS5kaXNwbGF5ID0gc3RhdGUua2V5cy5sZW5ndGggPT09IDAgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gICAgaWYgKGtleVRhYmxlQm9keSkge1xuICAgICAgICBjb25zdCBzb3J0ZWQgPSBzb3J0ZWRLZXlzKCk7XG4gICAgICAgIGtleVRhYmxlQm9keS5pbm5lckhUTUwgPSBzb3J0ZWQubWFwKGtleSA9PiB7XG4gICAgICAgICAgICBpZiAoc3RhdGUuZWRpdGluZ0lkID09PSBrZXkuaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlIGlzLWxpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUtaGVhZGVyXCI+RWRpdCBrZXk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUtYm9keSBmbGV4IGZsZXgtY29sIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbnMtaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiS2V5IGxhYmVsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1lZGl0LWxhYmVsPVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdExhYmVsKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpbnMtaW5wdXQgbW9ub1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWxsY2hlY2s9XCJmYWxzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJTZWNyZXQga2V5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1lZGl0LXNlY3JldD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtlc2NhcGVBdHRyKHN0YXRlLmVkaXRTZWNyZXQpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBnYXAtMiBqdXN0aWZ5LWVuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tZ2hvc3QgYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImNhbmNlbC1lZGl0XCI+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1wcmltYXJ5IGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJzYXZlLWVkaXRcIj5TYXZlPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJldmVhbGVkID0gc3RhdGUucmV2ZWFsZWRJZCA9PT0ga2V5LmlkO1xuICAgICAgICAgICAgLy8gQW4gdW5kZWNyeXB0YWJsZSBzZWNyZXQgbXVzdCByZWFkIGFzIGEgUFJPQkxFTSwgbmV2ZXIgYXMgYmxhbmsgXHUyMDE0XG4gICAgICAgICAgICAvLyBibGFuayBpcyB3aGF0IG1hZGUgdGhlIG9sZCBkYXRhIGxvc3MgaW52aXNpYmxlLlxuICAgICAgICAgICAgY29uc3QgZGlzcGxheVNlY3JldCA9IGtleS51bmRlY3J5cHRhYmxlXG4gICAgICAgICAgICAgICAgPyAndW5yZWFkYWJsZSBvbiB0aGlzIGRldmljZSdcbiAgICAgICAgICAgICAgICA6IChyZXZlYWxlZCA/IGVzY2FwZUh0bWwoa2V5LnNlY3JldCkgOiBlc2NhcGVIdG1sKG1hc2tTZWNyZXQoa2V5LnNlY3JldCkpKTtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlMYWJlbCA9IHN0YXRlLmNvcGllZElkID09PSBrZXkuaWQgPyAnQ29waWVkIScgOiAnQ29weSc7XG4gICAgICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUke3JldmVhbGVkID8gJyBpcy1saXZlJyA6ICcnfVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kdWxlLXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicGF0Y2gtcG9pbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD1cIiR7cmV2ZWFsZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIiR7cmV2ZWFsZWQgPyAnSGlkZSBzZWNyZXQnIDogJ1JldmVhbCBzZWNyZXQnfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIiR7cmV2ZWFsZWQgPyAnSGlkZScgOiAnUmV2ZWFsJ30gc2VjcmV0IGZvciAke2VzY2FwZUF0dHIoa2V5LmxhYmVsKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwicGF0Y2gtamFja1wiPjwvc3Bhbj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGdhcC0wLjUgbWluLXctMCBmbGV4LTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtc20gZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciBob3Zlcjp1bmRlcmxpbmVcIiBkYXRhLWFjdGlvbj1cInN0YXJ0LWVkaXRcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiIHRpdGxlPVwiRWRpdCBrZXlcIj4ke2VzY2FwZUh0bWwoa2V5LmxhYmVsKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtb25vIHRleHQteHMgJHtyZXZlYWxlZCA/ICcnIDogJ2lucy1tdXRlZCAnfWlucy10cnVuY2F0ZSBjdXJzb3ItcG9pbnRlclwiIGRhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtkaXNwbGF5U2VjcmV0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJyb3ctdmFsdWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tc21cIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJjb3B5LXNlY3JldFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCI+JHtjb3B5TGFiZWx9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXNtIGJ0bi0tZGVzdHJ1Y3RpdmVcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj5EZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICB9KS5qb2luKCcnKTtcblxuICAgICAgICAvLyBCaW5kIHRhYmxlIGV2ZW50c1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic3RhcnQtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzdGFydEVkaXQoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1yZXZlYWxcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXRlLnJldmVhbGVkSWQgPSBzdGF0ZS5yZXZlYWxlZElkID09PSBlbC5kYXRhc2V0LmtleUlkID8gbnVsbCA6IGVsLmRhdGFzZXQua2V5SWQ7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjb3B5LXNlY3JldFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBjb3B5U2VjcmV0KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJkZWxldGUta2V5XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGRlbGV0ZUtleShlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic2F2ZS1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNhdmVFZGl0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjYW5jZWwtZWRpdFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYW5jZWxFZGl0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBlZGl0IGlucHV0IGV2ZW50c1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZWRpdC1sYWJlbF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuZWRpdExhYmVsID0gZS50YXJnZXQudmFsdWU7IH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgc2F2ZUVkaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBjYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1lZGl0LXNlY3JldF0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHsgc3RhdGUuZWRpdFNlY3JldCA9IGUudGFyZ2V0LnZhbHVlOyB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHNhdmVFZGl0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCBrZXkgZm9ybVxuICAgIGNvbnN0IG5ld0xhYmVsSW5wdXQgPSAkKCduZXctbGFiZWwnKTtcbiAgICBjb25zdCBuZXdTZWNyZXRJbnB1dCA9ICQoJ25ldy1zZWNyZXQnKTtcbiAgICBjb25zdCBhZGRLZXlCdG4gPSAkKCdhZGQta2V5LWJ0bicpO1xuXG4gICAgaWYgKG5ld0xhYmVsSW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbmV3TGFiZWxJbnB1dCkgbmV3TGFiZWxJbnB1dC52YWx1ZSA9IHN0YXRlLm5ld0xhYmVsO1xuICAgIGlmIChuZXdTZWNyZXRJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBuZXdTZWNyZXRJbnB1dCkgbmV3U2VjcmV0SW5wdXQudmFsdWUgPSBzdGF0ZS5uZXdTZWNyZXQ7XG4gICAgaWYgKGFkZEtleUJ0bikge1xuICAgICAgICBhZGRLZXlCdG4uZGlzYWJsZWQgPSBzdGF0ZS5zYXZpbmcgfHwgc3RhdGUubmV3TGFiZWwudHJpbSgpLmxlbmd0aCA9PT0gMCB8fCBzdGF0ZS5uZXdTZWNyZXQudHJpbSgpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgYWRkS2V5QnRuLnRleHRDb250ZW50ID0gc3RhdGUuc2F2aW5nID8gJ1NhdmluZy4uLicgOiAnU2F2ZSc7XG4gICAgfVxuXG4gICAgLy8gVG9hc3RcbiAgICBjb25zdCB0b2FzdCA9ICQoJ3RvYXN0Jyk7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICAgIHRvYXN0LnRleHRDb250ZW50ID0gc3RhdGUudG9hc3Q7XG4gICAgICAgIHRvYXN0LnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS50b2FzdCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cihzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG5cbi8vIC0tLSBDUlVEIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBhZGRLZXkoKSB7XG4gICAgY29uc3QgbGFiZWwgPSBzdGF0ZS5uZXdMYWJlbC50cmltKCk7XG4gICAgY29uc3Qgc2VjcmV0ID0gc3RhdGUubmV3U2VjcmV0LnRyaW0oKTtcbiAgICBpZiAoIWxhYmVsIHx8ICFzZWNyZXQpIHJldHVybjtcblxuICAgIHN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBjb25zdCBpZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgYXdhaXQgc2F2ZUFwaUtleShpZCwgbGFiZWwsIHNlY3JldCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgc3RhdGUubmV3TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5uZXdTZWNyZXQgPSAnJztcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHN0YXRlLnNhdmluZyA9IGZhbHNlO1xuICAgIHNob3dUb2FzdCgnS2V5IGFkZGVkJyk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RWRpdChpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmIChrZXkudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICAvLyBPcGVuaW5nIGl0IHdvdWxkIHNlZWQgdGhlIGVkaXRvciB3aXRoIG5vdGhpbmcgYW5kIFNhdmUgd291bGQgd3JpdGVcbiAgICAgICAgLy8gdGhhdCBub3RoaW5nIG92ZXIgdGhlIHN0b3JlZCBjaXBoZXJ0ZXh0LlxuICAgICAgICBzaG93VG9hc3QoJ1RoaXMga2V5IGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgb24gdGhpcyBkZXZpY2UgXHUyMDE0IGl0IHdhcyBsZWZ0IHVudG91Y2hlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHN0YXRlLmVkaXRpbmdJZCA9IGtleS5pZDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSBrZXkubGFiZWw7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9IGtleS5zZWNyZXQ7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVFZGl0KCkge1xuICAgIGlmICghc3RhdGUuZWRpdGluZ0lkKSByZXR1cm47XG4gICAgY29uc3QgbGFiZWwgPSBzdGF0ZS5lZGl0TGFiZWwudHJpbSgpO1xuICAgIGNvbnN0IHNlY3JldCA9IHN0YXRlLmVkaXRTZWNyZXQudHJpbSgpO1xuICAgIGlmICghbGFiZWwgfHwgIXNlY3JldCkgcmV0dXJuO1xuXG4gICAgYXdhaXQgc2F2ZUFwaUtleShzdGF0ZS5lZGl0aW5nSWQsIGxhYmVsLCBzZWNyZXQpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdExhYmVsID0gJyc7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc2hvd1RvYXN0KCdLZXkgdXBkYXRlZCcpO1xufVxuXG5mdW5jdGlvbiBjYW5jZWxFZGl0KCkge1xuICAgIHN0YXRlLmVkaXRpbmdJZCA9IG51bGw7XG4gICAgc3RhdGUuZWRpdExhYmVsID0gJyc7XG4gICAgc3RhdGUuZWRpdFNlY3JldCA9ICcnO1xuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVLZXkoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoIShhd2FpdCBpbnNDb25maXJtKHsgdGl0bGU6IGBEZWxldGUgXCIke2tleS5sYWJlbH1cIj9gLCBib2R5OiAnVGhlIHN0b3JlZCBzZWNyZXQgaXMgcmVtb3ZlZCBmcm9tIHlvdXIgZW5jcnlwdGVkIHZhdWx0LicsIGNvbmZpcm1MYWJlbDogJ0RlbGV0ZSBrZXknLCBkZXN0cnVjdGl2ZTogdHJ1ZSB9KSkpIHJldHVybjtcblxuICAgIGF3YWl0IGRlbGV0ZUFwaUtleShpZCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSBkZWxldGVkJyk7XG59XG5cbi8vIC0tLSBDbGlwYm9hcmQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlTZWNyZXQoaWQpIHtcbiAgICBjb25zdCBrZXkgPSBzdGF0ZS5rZXlzLmZpbmQoayA9PiBrLmlkID09PSBpZCk7XG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAoa2V5LnVuZGVjcnlwdGFibGUpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdUaGlzIGtleSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIG9uIHRoaXMgZGV2aWNlJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoa2V5LnNlY3JldCk7XG4gICAgc3RhdGUuY29waWVkSWQgPSBpZDtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuY29waWVkSWQgPSBudWxsOyByZW5kZXIoKTsgfSwgMjAwMCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KCcnKS5jYXRjaCgoKSA9PiB7fSk7XG4gICAgfSwgMzAwMDApO1xufVxuXG4vLyAtLS0gU3luYyAtLS1cblxuYXN5bmMgZnVuY3Rpb24gcHVibGlzaFRvUmVsYXkoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAga2luZDogJ2FwaWtleXMucHVibGlzaCcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7IGtleXM6IGF3YWl0IGtleXNGb3JSZWxheSgpIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdhcGlrZXlzLmZldGNoJyB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmtleXMpIHtcbiAgICAgICAgICAgIC8vIEEga2V5IGRlbGV0ZWQgaGVyZSBzdGF5cyBkZWxldGVkOiBkcm9wIGFueSByZWxheSBjb3B5IGRhdGVkIGF0IG9yXG4gICAgICAgICAgICAvLyBiZWZvcmUgaXRzIGxvY2FsIGRlbGV0aW9uLlxuICAgICAgICAgICAgY29uc3QgeyBtZXJnZWQ6IHJlbW90ZUtleXMgfSA9IG1lcmdlUmVtb3RlKHt9LCByZXN1bHQua2V5cywgYXdhaXQgZ2V0RGVsZXRlZEtleXMoKSwge1xuICAgICAgICAgICAgICAgIHRpbWVPZjogKGspID0+IChrICYmIGsudXBkYXRlZEF0KSB8fCByZXN1bHQuY3JlYXRlZEF0IHx8IDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IHN0b3JlLmtleXM7XG4gICAgICAgICAgICBjb25zdCBsb2NhbENvdW50ID0gT2JqZWN0LmtleXMobG9jYWxLZXlzKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChsb2NhbENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVtb3RlS2V5cyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdG9yZS5yZWxheUNyZWF0ZWRBdCB8fCByZXN1bHQuY3JlYXRlZEF0ID4gc3RvcmUucmVsYXlDcmVhdGVkQXQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZW1vdGVLZXlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdpZGxlJztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICBzdGF0ZS5zeW5jRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICB9XG5cbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlU3luYygpIHtcbiAgICBhd2FpdCBzZXRTeW5jRW5hYmxlZChzdGF0ZS5zeW5jRW5hYmxlZCk7XG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHN5bmNBbGwoKTtcbiAgICB9XG59XG5cbi8vIC0tLSBJbXBvcnQgLyBFeHBvcnQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleXMoKSB7XG4gICAgY29uc3QgeyBrZXlzLCB1bmRlY3J5cHRhYmxlIH0gPSBhd2FpdCBleHBvcnRTdG9yZSgpO1xuICAgIGNvbnN0IHBsYWluVGV4dCA9IEpTT04uc3RyaW5naWZ5KGtleXMsIG51bGwsIDIpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnYXBpa2V5cy5lbmNyeXB0JyxcbiAgICAgICAgcGF5bG9hZDogeyBwbGFpblRleHQgfSxcbiAgICB9KTtcblxuICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdFeHBvcnQgZmFpbGVkOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihcbiAgICAgICAgW0pTT04uc3RyaW5naWZ5KHsgZW5jcnlwdGVkOiB0cnVlLCBkYXRhOiByZXN1bHQuY2lwaGVyVGV4dCB9KV0sXG4gICAgICAgIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgKTtcbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIGEuZG93bmxvYWQgPSAnbm9zdHJrZXktYXBpLWtleXMtYmFja3VwLmpzb24nO1xuICAgIGEuY2xpY2soKTtcbiAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgc2hvd1RvYXN0KHVuZGVjcnlwdGFibGUubGVuZ3RoXG4gICAgICAgID8gYEV4cG9ydGVkIFx1MjAxNCAke3VuZGVjcnlwdGFibGUubGVuZ3RofSBrZXkocykgY291bGQgbm90IGJlIGRlY3J5cHRlZCBoZXJlIGFuZCB3ZXJlIGJhY2tlZCB1cCBzdGlsbC1lbmNyeXB0ZWQ6ICR7dW5kZWNyeXB0YWJsZS5qb2luKCcsICcpfWBcbiAgICAgICAgOiAnRXhwb3J0ZWQnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0S2V5cyhldmVudCkge1xuICAgIGNvbnN0IGZpbGUgPSBldmVudC50YXJnZXQuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBmaWxlLnRleHQoKTtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh0ZXh0KTtcblxuICAgICAgICBsZXQga2V5cztcbiAgICAgICAgaWYgKHBhcnNlZC5lbmNyeXB0ZWQgJiYgcGFyc2VkLmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICBraW5kOiAnYXBpa2V5cy5kZWNyeXB0JyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IGNpcGhlclRleHQ6IHBhcnNlZC5kYXRhIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzaG93VG9hc3QoJ0RlY3J5cHQgZmFpbGVkOiAnICsgKHJlc3VsdC5lcnJvciB8fCAndW5rbm93bicpKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXlzID0gSlNPTi5wYXJzZShyZXN1bHQucGxhaW5UZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBwYXJzZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IGltcG9ydGVkIH0gPSBhd2FpdCBpbXBvcnRTdG9yZShrZXlzKTtcbiAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICAgICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnRlZCAnICsgaW1wb3J0ZWQgKyAnIGtleXMnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNob3dUb2FzdCgnSW1wb3J0IGZhaWxlZDogJyArIGUubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG59XG5cbi8vIC0tLSBFdmVudCBiaW5kaW5nIC0tLVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgICQoJ3N5bmMtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3luY0FsbCk7XG4gICAgJCgnYWRkLWtleS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRLZXkpO1xuICAgICQoJ2V4cG9ydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBleHBvcnRLZXlzKTtcbiAgICAkKCdpbXBvcnQtZmlsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBpbXBvcnRLZXlzKTtcbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG5cbiAgICAkKCdzeW5jLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc3RhdGUuc3luY0VuYWJsZWQgPSAhc3RhdGUuc3luY0VuYWJsZWQ7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICB0b2dnbGVTeW5jKCk7XG4gICAgfSk7XG5cbiAgICAkKCduZXctbGFiZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5uZXdMYWJlbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5uZXdTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dHYXRlKGdhdGUsIG1haW4sIHsgdGl0bGUsIG1lc3NhZ2UsIGJ1dHRvbiB9KSB7XG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBjb25zdCB0ID0gJCgnZ2F0ZS10aXRsZScpOyBpZiAodCAmJiB0aXRsZSkgdC50ZXh0Q29udGVudCA9IHRpdGxlO1xuICAgIGNvbnN0IG0gPSAkKCdnYXRlLW1lc3NhZ2UnKTsgaWYgKG0gJiYgbWVzc2FnZSkgbS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgY29uc3QgYiA9ICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk7IGlmIChiICYmIGJ1dHRvbikgYi50ZXh0Q29udGVudCA9IGJ1dHRvbjtcbiAgICBiPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ25vc3Rya2V5LW9wdGlvbnMnKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBHYXRlOiByZXF1aXJlIG1hc3RlciBwYXNzd29yZCBBTkQgYW4gdW5sb2NrZWQgc2Vzc2lvbiBiZWZvcmUgcmVuZGVyaW5nLlxuICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gYXdhaXQgYXNrR2F0ZSgnaXNFbmNyeXB0ZWQnKTtcbiAgICBjb25zdCBsb2NrZWQgPSBhd2FpdCBhc2tHYXRlKCdpc0xvY2tlZCcpO1xuICAgIGNvbnN0IGdhdGUgPSAkKCd2YXVsdC1sb2NrZWQtZ2F0ZScpO1xuICAgIGNvbnN0IG1haW4gPSAkKCd2YXVsdC1tYWluLWNvbnRlbnQnKTtcblxuICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgLy8gTm8gbWFzdGVyIHBhc3N3b3JkIHNldCB5ZXQgXHUyMDE0IGRldmljZS1rZXkgZW5jcnlwdGlvbiBpcyBhY3RpdmUgYnV0IHRoZVxuICAgICAgICAvLyB2YXVsdCBVSSBzdGlsbCBhc2tzIHRoZSB1c2VyIHRvIHNldCBhIHBhc3N3b3JkIGZpcnN0LlxuICAgICAgICBzZXRVbmxvY2tlZCh0cnVlKTtcbiAgICAgICAgc2hvd0dhdGUoZ2F0ZSwgbWFpbiwge30pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGxvY2tlZCkge1xuICAgICAgICAvLyBGNTogc2Vzc2lvbiBpcyBsb2NrZWQgXHUyMDE0IHJlZnVzZSB0byByZWFkL3JlbmRlciBhbnkgQVBJLWtleSBzZWNyZXQuXG4gICAgICAgIHNldFVubG9ja2VkKGZhbHNlKTtcbiAgICAgICAgc2hvd0dhdGUoZ2F0ZSwgbWFpbiwge1xuICAgICAgICAgICAgdGl0bGU6ICdWYXVsdCBMb2NrZWQnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1VubG9jayBOb3N0cktleSB3aXRoIHlvdXIgbWFzdGVyIHBhc3N3b3JkIHRvIHZpZXcgeW91ciBBUEkga2V5cy4nLFxuICAgICAgICAgICAgYnV0dG9uOiAnVW5sb2NrJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZXRVbmxvY2tlZCh0cnVlKTtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmIChtYWluKSBtYWluLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgY29uc3QgcmVsYXlzID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAndmF1bHQuZ2V0UmVsYXlzJyB9KTtcbiAgICBzdGF0ZS5yZWxheUluZm8gPSByZWxheXMgfHwgeyByZWFkOiBbXSwgd3JpdGU6IFtdIH07XG4gICAgc3RhdGUuc3luY0VuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG5cbiAgICBiaW5kRXZlbnRzKCk7XG4gICAgcmVuZGVyKCk7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHN0YXJ0UGFnZShpbml0KSk7XG4iLCAiLyoqXG4gKiBUaGUgcXVlc3Rpb25zIGEgcGFnZSBhc2tzIHRoZSB3b3JrZXIgYmVmb3JlIGl0IGNhbiBkcmF3IGFueXRoaW5nLiBUaGUgd29ya2VyXG4gKiBjYW4gYW5zd2VyIHRoZW0gd2l0aCBhIHJlZnVzYWwgb2JqZWN0LCBhbmQgYW4gb2JqZWN0IGlzIHRydXRoeSwgc28gYSBwYWdlIHRoYXRcbiAqIHJlYWRzIGl0IGFzIGEgeWVzIHNob3dzIHRoZSB3cm9uZyBzY3JlZW4uIFBhZ2VzIGFzayB0aHJvdWdoIGFza0dhdGUgaW5zdGVhZDpcbiAqIGEgcmVmdXNhbCByZXBsYWNlcyB0aGUgcGFnZSB3aXRoIGEgcGxhaW4gbWVzc2FnZSBhbmQgc3RvcHMgaXRzIHN0YXJ0LXVwLlxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmV4cG9ydCBjb25zdCBTVEFSVF9FUlJPUiA9ICdOb3N0cktleSBjb3VsZCBub3Qgc3RhcnQgdGhpcyBwYWdlLiBSZWxvYWQgb3IgcmVpbnN0YWxsLic7XG5cbmV4cG9ydCBjbGFzcyBHYXRlUmVmdXNlZCBleHRlbmRzIEVycm9yIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZnVzZWQoYW5zd2VyKSB7XG4gICAgcmV0dXJuICEhYW5zd2VyICYmIHR5cGVvZiBhbnN3ZXIgPT09ICdvYmplY3QnICYmIGFuc3dlci5zdWNjZXNzID09PSBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTdGFydEVycm9yKCkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgbWVzc2FnZS5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYWxlcnQnKTtcbiAgICBtZXNzYWdlLmRhdGFzZXQuc3RhcnRFcnJvciA9ICcnO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBTVEFSVF9FUlJPUjtcbiAgICBtZXNzYWdlLnN0eWxlLnBhZGRpbmcgPSAnMTZweCc7XG4gICAgZG9jdW1lbnQuYm9keS5yZXBsYWNlQ2hpbGRyZW4obWVzc2FnZSk7XG59XG5cbi8qKiBBc2sgdGhlIHdvcmtlci4gT24gYSByZWZ1c2FsLCBzaG93IHRoZSBtZXNzYWdlIGFuZCB0aHJvdyBHYXRlUmVmdXNlZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc2tHYXRlKGtpbmQpIHtcbiAgICBjb25zdCBhbnN3ZXIgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQgfSk7XG4gICAgaWYgKGlzUmVmdXNlZChhbnN3ZXIpKSB7XG4gICAgICAgIHNob3dTdGFydEVycm9yKCk7XG4gICAgICAgIHRocm93IG5ldyBHYXRlUmVmdXNlZCgpO1xuICAgIH1cbiAgICByZXR1cm4gYW5zd2VyO1xufVxuXG4vLyBBdCBtb3N0IG9uZSBub3RlIGluIHRoaXMgdGltZSwgaG93ZXZlciBidXN5IHRoZSBwZXJzb24gaXMuXG5jb25zdCBBQ1RJVklUWV9OT1RFX01TID0gMzBfMDAwO1xuXG4vKipcbiAqIFVzaW5nIG9uZSBvZiBOb3N0cktleSdzIG93biBwYWdlcyBjb3VudHMgYXMgYWN0aXZpdHkgZm9yIGF1dG8tbG9jaywgYXMgZG9lc1xuICogYW5zd2VyaW5nIGEgcmVxdWVzdC4gU2l0ZSByZXF1ZXN0cywgZXZlbiBvbmVzIHNpZ25lZCB1bmRlciBhIHJlbWVtYmVyZWRcbiAqIGdyYW50LCBuZXZlciBjb3VudC5cbiAqL1xuZnVuY3Rpb24gd2F0Y2hBY3Rpdml0eSgpIHtcbiAgICBsZXQgbGFzdE5vdGUgPSAwO1xuICAgIGNvbnN0IG5vdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gbGFzdE5vdGUgPCBBQ1RJVklUWV9OT1RFX01TKSByZXR1cm47XG4gICAgICAgIGxhc3ROb3RlID0gRGF0ZS5ub3coKTtcbiAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAncmVzZXRBdXRvTG9jaycgfSk/LmNhdGNoPy4oKCkgPT4ge30pO1xuICAgIH07XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBub3RlLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5vdGUsIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KTtcbn1cblxuLyoqIFJ1biBhIHBhZ2UncyBzdGFydC11cC4gQSByZWZ1c2FsIGhhcyBhbHJlYWR5IGJlZW4gc2hvd24sIHNvIGl0IGVuZHMgaGVyZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydFBhZ2UoaW5pdCkge1xuICAgIHdhdGNoQWN0aXZpdHkoKTtcbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBpbml0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoIShlIGluc3RhbmNlb2YgR2F0ZVJlZnVzZWQpKSB0aHJvdyBlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiLyoqXG4gKiBBUEkgS2V5IFN0b3JlIFx1MjAxNCBMb2NhbCBjYWNoZSBmb3IgZW5jcnlwdGVkIEFQSSBrZXlzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICBhcGlLZXlWYXVsdDoge1xuICogICAgIGtleXM6IHtcbiAqICAgICAgIFwiPHV1aWQ+XCI6IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0LCBwcm9maWxlU2NvcGUgfVxuICogICAgIH0sXG4gKiAgICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gKiAgICAgZXZlbnRJZDogbnVsbCxcbiAqICAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAqICAgICBzeW5jU3RhdHVzOiBcInN5bmNlZFwiICAgIC8vIHN5bmNlZCB8IGxvY2FsLW9ubHkgfCBjb25mbGljdFxuICogICB9XG4gKlxuICogcHJvZmlsZVNjb3BlOiBudWxsIChhbGwgcHJvZmlsZXMpIHwgbnVtYmVyW10gKHNwZWNpZmljIHByb2ZpbGUgaW5kaWNlcylcbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgc2NoZWR1bGVTeW5jUHVzaCB9IGZyb20gJy4vc3luYy1tYW5hZ2VyJztcbmltcG9ydCB7IHdyYXBTZWNyZXQsIHVud3JhcFNlY3JldCwgaXNDaXBoZXJ0ZXh0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdhcGlLZXlWYXVsdCc7XG4vLyBEZWxldGlvbiB0b21ic3RvbmVzIGtleWVkIGJ5IGlkIChpc3N1ZSAjMyk6IHsgPGlkPjogZGVsZXRlZEF0U2Vjb25kcyB9LlxuY29uc3QgREVMRVRFRF9LRVkgPSAnZGVsZXRlZEtleXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVsZXRlZEtleXMoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgW0RFTEVURURfS0VZXToge30gfSk7XG4gICAgcmV0dXJuIGRhdGFbREVMRVRFRF9LRVldICYmIHR5cGVvZiBkYXRhW0RFTEVURURfS0VZXSA9PT0gJ29iamVjdCcgPyBkYXRhW0RFTEVURURfS0VZXSA6IHt9O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBrZXkncyBgc2VjcmV0YCBmaWVsZCBmb3IgY2FsbGVycy4gUmUtdGhyb3dzIGxvY2sgZXJyb3JzIHNvIGEgbG9ja2VkXG4gKiBzZXNzaW9uIGNhbm5vdCByZWFkIHNlY3JldHMgKEY1KS5cbiAqXG4gKiBBIGdlbnVpbmUgZGVjcnlwdCBmYWlsdXJlIChlLmcuIGEgZGV2aWNlLXdyYXBwZWQgdmFsdWUgc3luY2VkIGZyb20gYW5vdGhlclxuICogZGV2aWNlLCBvciBhIGJsb2Igd2hvc2Ugd3JhcHBpbmcga2V5IHJvdGF0ZWQgYXdheSkgaXMgcmVwb3J0ZWQgYXNcbiAqIGB1bmRlY3J5cHRhYmxlOiB0cnVlYCB3aXRoIGBzZWNyZXQ6IG51bGxgIFx1MjAxNCBOT1QgYXMgYW4gZW1wdHkgc3RyaW5nLiBBbiBlbXB0eVxuICogc3RyaW5nIGlzIGluZGlzdGluZ3Vpc2hhYmxlIGZyb20gYSByZWFsIHZhbHVlOiB0aGUgVUkgcmVuZGVyZWQgaXQgYXMgYmxhbmtcbiAqIGFuZCBleHBvcnRTdG9yZSgpIHdyb3RlIGl0IGludG8gdGhlIHVzZXIncyBlbmNyeXB0ZWQgYmFja3VwLCBxdWlldGx5XG4gKiByZXBsYWNpbmcgdGhlIG9ubHkgY29weSBvZiB0aGUgc2VjcmV0IHdpdGggbm90aGluZy4gYG51bGxgICsgdGhlIGZsYWcgbWFrZXNcbiAqIHRoZSBmYWlsdXJlIHZpc2libGUgdG8gZXZlcnkgY2FsbGVyLCBhbmQgZXhwb3J0U3RvcmUoKSBjYXJyaWVzIHRoZSB1bnRvdWNoZWRcbiAqIGNpcGhlcnRleHQgaW5zdGVhZC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdEtleShrZXkpIHtcbiAgICBpZiAoIWtleSkgcmV0dXJuIGtleTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyAuLi5rZXksIHNlY3JldDogYXdhaXQgdW53cmFwU2VjcmV0KGtleS5zZWNyZXQpIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoU3RyaW5nKGUubWVzc2FnZSB8fCAnJykuc3RhcnRzV2l0aCgnbG9ja2VkJykpIHRocm93IGU7XG4gICAgICAgIHJldHVybiB7IC4uLmtleSwgc2VjcmV0OiBudWxsLCB1bmRlY3J5cHRhYmxlOiB0cnVlIH07XG4gICAgfVxufVxuXG5jb25zdCBERUZBVUxUX1NUT1JFID0ge1xuICAgIGtleXM6IHt9LFxuICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICAgIGV2ZW50SWQ6IG51bGwsXG4gICAgcmVsYXlDcmVhdGVkQXQ6IG51bGwsXG4gICAgc3luY1N0YXR1czogJ3N5bmNlZCcsXG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRTdG9yZSgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbU1RPUkFHRV9LRVldOiBERUZBVUxUX1NUT1JFIH0pO1xuICAgIHJldHVybiB7IC4uLkRFRkFVTFRfU1RPUkUsIC4uLmRhdGFbU1RPUkFHRV9LRVldIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldFN0b3JlKHN0b3JlKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBzdG9yZSB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBmdWxsIEFQSSBrZXkgc3RvcmUgb2JqZWN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpS2V5U3RvcmUoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhzdG9yZS5rZXlzKSkge1xuICAgICAgICBrZXlzW2lkXSA9IGF3YWl0IGRlY3J5cHRLZXkoa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgLi4uc3RvcmUsIGtleXMgfTtcbn1cblxuLyoqXG4gKiBHZXQgYSBzaW5nbGUgQVBJIGtleSBieSBpZCAoc2VjcmV0IGRlY3J5cHRlZCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdHxudWxsPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFwaUtleShpZCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICByZXR1cm4gc3RvcmUua2V5c1tpZF0gPyBkZWNyeXB0S2V5KHN0b3JlLmtleXNbaWRdKSA6IG51bGw7XG59XG5cbi8qKlxuICogVXBzZXJ0IGFuIEFQSSBrZXkuIENyZWF0ZXMgaWYgbmV3LCB1cGRhdGVzIGlmIGV4aXN0aW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVVVJRFxuICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VjcmV0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlQXBpS2V5KGlkLCBsYWJlbCwgc2VjcmV0KSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IG5vdyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gc3RvcmUua2V5c1tpZF07XG4gICAgLy8gVDAtNDogZW5jcnlwdCB0aGUgc2VjcmV0IGJlZm9yZSBpdCB0b3VjaGVzIHN0b3JhZ2UuXG4gICAgc3RvcmUua2V5c1tpZF0gPSB7XG4gICAgICAgIGlkLFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgc2VjcmV0OiBhd2FpdCB3cmFwU2VjcmV0KHNlY3JldCksXG4gICAgICAgIGNyZWF0ZWRBdDogZXhpc3Rpbmc/LmNyZWF0ZWRBdCB8fCBub3csXG4gICAgICAgIHVwZGF0ZWRBdDogbm93LFxuICAgICAgICBwcm9maWxlU2NvcGU6IGV4aXN0aW5nPy5wcm9maWxlU2NvcGUgPz8gbnVsbCxcbiAgICB9O1xuICAgIC8vIFJlY3JlYXRlIGNsZWFycyBhbnkgdG9tYnN0b25lIGZvciB0aGlzIGlkIChpc3N1ZSAjMykgc28gdGhlIGZyZXNobHkgc2F2ZWRcbiAgICAvLyBrZXkgaXMgbm8gbG9uZ2VyIHN1cHByZXNzZWQgZnJvbSB0aGUgc3luYyBwYXlsb2FkLlxuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkS2V5cygpO1xuICAgIGlmIChkZWxldGVkW2lkXSAhPSBudWxsKSB7XG4gICAgICAgIGRlbGV0ZSBkZWxldGVkW2lkXTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBzdG9yZSwgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pO1xufVxuXG4vKipcbiAqIERlbGV0ZSBhbiBBUEkga2V5IGJ5IGlkIGFuZCByZWNvcmQgYSB0b21ic3RvbmUgKGlzc3VlICMzKSBzbyB0aGUgZGVsZXRpb25cbiAqIHByb3BhZ2F0ZXMgdGhyb3VnaCBzdG9yYWdlLnN5bmMgYW5kIGEgc3RhbGUgd2hvbGUtb2JqZWN0IG92ZXJ3cml0ZSBmcm9tXG4gKiBhbm90aGVyIGRldmljZSBjYW5ub3QgcmVzdXJyZWN0IGl0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGRlbGV0ZSBzdG9yZS5rZXlzW2lkXTtcbiAgICBjb25zdCBkZWxldGVkID0gYXdhaXQgZ2V0RGVsZXRlZEtleXMoKTtcbiAgICBkZWxldGVkW2lkXSA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW1NUT1JBR0VfS0VZXTogc3RvcmUsIFtERUxFVEVEX0tFWV06IGRlbGV0ZWQgfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vKipcbiAqIExpc3QgYWxsIEFQSSBrZXlzIHNvcnRlZCBieSBsYWJlbCAoY2FzZS1pbnNlbnNpdGl2ZSkuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxBcnJheT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsaXN0QXBpS2V5cygpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3QgZGVjcnlwdGVkID0gW107XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LnZhbHVlcyhzdG9yZS5rZXlzKSkge1xuICAgICAgICBkZWNyeXB0ZWQucHVzaChhd2FpdCBkZWNyeXB0S2V5KGtleSkpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdGVkLnNvcnQoKGEsIGIpID0+XG4gICAgICAgIGEubGFiZWwudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIubGFiZWwudG9Mb3dlckNhc2UoKSksXG4gICAgKTtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIHJlbGF5IHN5bmMgdG9nZ2xlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3luY0VuYWJsZWQoZW5hYmxlZCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHJlbGF5IHN5bmMgaXMgZW5hYmxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzU3luY0VuYWJsZWQoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBzdG9yZS5zeW5jRW5hYmxlZDtcbn1cblxuLyoqXG4gKiBVcGRhdGUgc3luYyBzdGF0ZSBhZnRlciBhIHJlbGF5IG9wZXJhdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVN0b3JlU3luY1N0YXRlKHN5bmNTdGF0dXMsIGV2ZW50SWQgPSBudWxsLCByZWxheUNyZWF0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgc3RvcmUuc3luY1N0YXR1cyA9IHN5bmNTdGF0dXM7XG4gICAgaWYgKGV2ZW50SWQgIT09IG51bGwpIHN0b3JlLmV2ZW50SWQgPSBldmVudElkO1xuICAgIGlmIChyZWxheUNyZWF0ZWRBdCAhPT0gbnVsbCkgc3RvcmUucmVsYXlDcmVhdGVkQXQgPSByZWxheUNyZWF0ZWRBdDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogRXhwb3J0IHRoZSBrZXlzIG9iamVjdCAoZm9yIGVuY3J5cHRlZCBiYWNrdXApLlxuICpcbiAqIEEga2V5IHRoaXMgZGV2aWNlIGNhbm5vdCBkZWNyeXB0IGlzIE5FVkVSIGV4cG9ydGVkIHdpdGggYW4gZW1wdHkvbnVsbCBzZWNyZXRcbiAqIFx1MjAxNCBhIGJsYW5rIHdvdWxkIG92ZXJ3cml0ZSB0aGUgcmVjb3ZlcmFibGUgY2lwaGVydGV4dCB0aGUgbmV4dCB0aW1lIHRoZSBiYWNrdXBcbiAqIGlzIGltcG9ydGVkLiBJdCBpcyBleHBvcnRlZCBhcyB0aGUgT1JJR0lOQUwgQ0lQSEVSVEVYVCxcbiAqIHVudG91Y2hlZDogdGhhdCBwcmVzZXJ2ZXMgc3RyaWN0bHkgbW9yZSB1c2VyIGRhdGEgdGhhbiBvbWl0dGluZyBpdCAodGhlIHZhbHVlXG4gKiBpcyBzdGlsbCByZWNvdmVyYWJsZSBvbiBhIGRldmljZSB0aGF0IGhvbGRzIHRoZSB3cmFwcGluZyBrZXksIG9yIG9uY2UgdGhlIGtleVxuICogaXMgcmVzdG9yZWQpLCBhbmQgaW1wb3J0U3RvcmUoKSBhbHJlYWR5IHBhc3NlcyBjaXBoZXJ0ZXh0IHN0cmFpZ2h0IHRocm91Z2hcbiAqIGluc3RlYWQgb2YgcmUtd3JhcHBpbmcgaXQsIHNvIHRoZSByb3VuZCB0cmlwIGlzIGxvc3NsZXNzLiBUaGUgaWRzIGFyZSBhbHNvXG4gKiByZXBvcnRlZCBzbyB0aGUgY2FsbGVyIGNhbiB0ZWxsIHRoZSB1c2VyIHdoaWNoIGtleXMgY2FtZSB0aHJvdWdoIHVub3BlbmVkLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPHtrZXlzOiBPYmplY3QsIHVuZGVjcnlwdGFibGU6IHN0cmluZ1tdfT59IE1hcCBvZiBpZCAtPiBrZXlcbiAqICAgICAgICAgIGRhdGEsIHBsdXMgdGhlIGxhYmVscy9pZHMgdGhhdCB3ZXJlIGV4cG9ydGVkIHN0aWxsLWVuY3J5cHRlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFN0b3JlKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgY29uc3QgdW5kZWNyeXB0YWJsZSA9IFtdO1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGRlY3J5cHRLZXkoa2V5KTtcbiAgICAgICAgaWYgKGRlY3J5cHRlZD8udW5kZWNyeXB0YWJsZSkge1xuICAgICAgICAgICAga2V5c1tpZF0gPSB7IC4uLmtleSB9OyAgICAgICAgICAgIC8vIGNpcGhlcnRleHQgY2FycmllZCB0aHJvdWdoIGFzLWlzXG4gICAgICAgICAgICB1bmRlY3J5cHRhYmxlLnB1c2goa2V5LmxhYmVsIHx8IGlkKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGtleXNbaWRdID0gZGVjcnlwdGVkO1xuICAgIH1cbiAgICByZXR1cm4geyBrZXlzLCB1bmRlY3J5cHRhYmxlIH07XG59XG5cbi8qKlxuICogVGhlIGtleXMgdG8gc2VuZCB0byB0aGUgcmVsYXk6IG9ubHkgdGhvc2UgdGhpcyBkZXZpY2UgY2FuIHJlYWQuIEEga2V5IGl0XG4gKiBjYW5ub3QgcmVhZCBpcyBsZWZ0IG91dCwgc28gdGhlIGNvcHkgb24gdGhlIGRldmljZSB0aGF0IGNhbiByZWFkIGl0IHN0YXlzXG4gKiB0aGUgZ29vZCBvbmUgd2hlbiB0aGF0IGRldmljZSBpbXBvcnRzIHdoYXQgd2FzIHNlbnQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gTWFwIG9mIGlkIC0+IGtleSBkYXRhIHdpdGggcGxhaW50ZXh0IHNlY3JldHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGtleXNGb3JSZWxheSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGRlY3J5cHRLZXkoa2V5KTtcbiAgICAgICAgaWYgKGhhc1VzYWJsZVNlY3JldChkZWNyeXB0ZWQpKSBrZXlzW2lkXSA9IGRlY3J5cHRlZDtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIGhhc1VzYWJsZVNlY3JldChrZXkpIHtcbiAgICByZXR1cm4gISFrZXkgJiYgIWtleS51bmRlY3J5cHRhYmxlICYmIHR5cGVvZiBrZXkuc2VjcmV0ID09PSAnc3RyaW5nJyAmJiBrZXkuc2VjcmV0ICE9PSAnJztcbn1cblxuLyoqXG4gKiBJbXBvcnQga2V5cyBpbnRvIHRoZSBzdG9yZSAobWVyZ2UgXHUyMDE0IGV4aXN0aW5nIGtleXMgd2l0aCBzYW1lIGlkIGFyZSBvdmVyd3JpdHRlbikuXG4gKiBJbmNvbWluZyBzZWNyZXRzIGFyZSBwbGFpbnRleHQgKGZyb20gYSBkZWNyeXB0ZWQgYmFja3VwIG9yIGEgcmVsYXkgZmV0Y2gpIGFuZFxuICogYXJlIHJlLXdyYXBwZWQgZm9yIHRoZSBhdC1yZXN0IHRpZXIgdGhpcyBjb250ZXh0IGlzIGluIFx1MjAxNCB0aGUgZGV2aWNlIGtleSwgb3JcbiAqIHRoZSBwYXNzd29yZCBzZXNzaW9uIGtleSB3aGVuIG9uZSBpcyBsaXZlIFx1MjAxNCBiZWZvcmUgc3RvcmFnZS5cbiAqXG4gKiBBbiBlbnRyeSB3aXRoIG5vIHVzYWJsZSBzZWNyZXQgaXMgc2tpcHBlZCwgc28gaXQgY2FuIG5laXRoZXIgcmVwbGFjZSBhIGdvb2RcbiAqIHNlY3JldCBub3IgYWRkIGEga2V5IHdpdGggbm90aGluZyBpbiBpdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0ga2V5cyAtIE1hcCBvZiBpZCAtPiB7IGlkLCBsYWJlbCwgc2VjcmV0LCBjcmVhdGVkQXQsIHVwZGF0ZWRBdCB9XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7aW1wb3J0ZWQ6IG51bWJlciwgc2tpcHBlZDogbnVtYmVyfT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRTdG9yZShrZXlzKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGxldCBpbXBvcnRlZCA9IDA7XG4gICAgbGV0IHNraXBwZWQgPSAwO1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGtleXMpKSB7XG4gICAgICAgIGlmICghaGFzVXNhYmxlU2VjcmV0KGtleSkpIHtcbiAgICAgICAgICAgIHNraXBwZWQrKztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlY3JldCA9IGlzQ2lwaGVydGV4dChrZXkuc2VjcmV0KSA/IGtleS5zZWNyZXQgOiBhd2FpdCB3cmFwU2VjcmV0KGtleS5zZWNyZXQpO1xuICAgICAgICBzdG9yZS5rZXlzW2lkXSA9IHsgLi4ua2V5LCBzZWNyZXQgfTtcbiAgICAgICAgaW1wb3J0ZWQrKztcbiAgICB9XG4gICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xuICAgIHJldHVybiB7IGltcG9ydGVkLCBza2lwcGVkIH07XG59XG4iLCAiLyoqXG4gKiBTeW5jIE1hbmFnZXIgXHUyMDE0IFBsYXRmb3JtIHN5bmMgdmlhIHN0b3JhZ2Uuc3luYyAoQ2hyb21lIFx1MjE5MiBHb29nbGUsIFNhZmFyaSBcdTIxOTIgaUNsb3VkKVxuICpcbiAqIEFyY2hpdGVjdHVyZTpcbiAqICAgV3JpdGU6IGFwcCBcdTIxOTIgc3RvcmFnZS5sb2NhbCBcdTIxOTIgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjE5MiBzdG9yYWdlLnN5bmNcbiAqICAgUmVhZDogIHB1bGxGcm9tU3luYygpIG9uIHN0YXJ0dXAgXHUyMTkyIG1lcmdlIGludG8gc3RvcmFnZS5sb2NhbFxuICogICBMaXN0ZW46IHN0b3JhZ2Uub25DaGFuZ2VkKFwic3luY1wiKSBcdTIxOTIgbWVyZ2UgcmVtb3RlIGNoYW5nZXMgaW50byBsb2NhbFxuICpcbiAqIHN0b3JhZ2UubG9jYWwgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoLiBzdG9yYWdlLnN5bmMgaXMgYSBiZXN0LWVmZm9ydCBtaXJyb3IuXG4gKi9cblxuaW1wb3J0IHsgbWVyZ2VSZW1vdGUgfSBmcm9tICcuL3N5bmMtbWVyZ2UnO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGlzQ2lwaGVydGV4dCwgaXNQYXNzd29yZEJsb2IgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5pbXBvcnQgeyBidW5rZXJTZXNzaW9uc0FmdGVyTW92ZXMsIHJlZGFjdFByb2ZpbGVzIH0gZnJvbSAnLi9idW5rZXItdXJsLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb25zdGFudHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY29uc3QgU1lOQ19RVU9UQSA9IDEwMl80MDA7ICAgICAgIC8vIDEwMCBLQiB0b3RhbFxuY29uc3QgTUFYX0lURU0gPSA4XzE5MjsgICAgICAgICAgIC8vIDggS0IgcGVyIGl0ZW1cbmNvbnN0IE1BWF9JVEVNUyA9IDUxMjtcbmNvbnN0IENIVU5LX1BSRUZJWCA9ICdfY2h1bms6JztcbmNvbnN0IFNZTkNfTUVUQV9LRVkgPSAnX3N5bmNfbWV0YSc7XG5jb25zdCBMT0NBTF9FTkFCTEVEX0tFWSA9ICdwbGF0Zm9ybVN5bmNFbmFibGVkJztcblxuLy8gUHJpb3JpdHkgdGllcnMgZm9yIGJ1ZGdldCBhbGxvY2F0aW9uXG5jb25zdCBQUklPUklUWSA9IHtcbiAgICAvLyBUb21ic3RvbmVzIChkZWxldGlvbiByZWNvcmRzKSBnZXQgdGhlIGd1YXJhbnRlZWQgdG9wIHNsb3Q6IGEgZGVsZXRpb24gbXVzdFxuICAgIC8vIG5ldmVyIGxvc2UgaXRzIGJ1ZGdldCByYWNlIHRvIGJ1bGt5IHZhdWx0IGNvbnRlbnQsIG9yIHRoZSBkZWxldGVkIGl0ZW1cbiAgICAvLyByZXN1cnJlY3RzIG9uIHRoZSBuZXh0IGRldmljZSB0aGF0IHN0aWxsIGhhcyBhIHN0YWxlIGNvcHkgKGlzc3VlICMzKS5cbiAgICBQMF9UT01CU1RPTkVTOiAwLFxuICAgIFAxX1BST0ZJTEVTOiAxLFxuICAgIFAyX1NFVFRJTkdTOiAyLFxuICAgIFAzX0FQSUtFWVM6IDMsXG4gICAgUDRfVkFVTFQ6IDQsXG59O1xuXG4vLyBXYXJuaW5nIHRocmVzaG9sZHMgZm9yIHJldGFpbmVkIGRlbGV0aW9uIGhpc3RvcnkgKHRvbWJzdG9uZXMgYXJlIGtlcHRcbi8vIGZvcmV2ZXIgc28gYW4gb2ZmbGluZSBkZXZpY2UgdGhhdCBuZXZlciBsZWFybmVkIGFib3V0IGEgZGVsZXRpb24gY2Fubm90XG4vLyByZXN1cnJlY3QgdGhlIGl0ZW0gXHUyMDE0IHRoZSBjb3VudCBvbmx5IGdyb3dzLCBzbyBudWRnZSB0aGUgdXNlciB0byB0cmltIGl0KS5cbmNvbnN0IFRPTUJTVE9ORV9XQVJOX0dFTlRMRSA9IDg7XG5jb25zdCBUT01CU1RPTkVfV0FSTl9TVFJPTkcgPSAxNjtcblxuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xubGV0IHB1c2hUaW1lciA9IG51bGw7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ2h1bmtpbmcgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU3BsaXQgYSBKU09OLXNlcmlhbGlzZWQgdmFsdWUgaW50byA8PThLQiBjaHVua3MuXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHsga2V5LCB2YWx1ZSB9IHBhaXJzIHJlYWR5IGZvciBzdG9yYWdlLnN5bmMuc2V0KCkuXG4gKi9cbmZ1bmN0aW9uIGNodW5rVmFsdWUoa2V5LCBqc29uU3RyaW5nKSB7XG4gICAgY29uc3QgY2h1bmtzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBqc29uU3RyaW5nLmxlbmd0aDsgaSArPSBNQVhfSVRFTSAtIDEwMCkge1xuICAgICAgICAvLyBSZXNlcnZlIH4xMDAgYnl0ZXMgZm9yIHRoZSBrZXkgb3ZlcmhlYWQgaW4gdGhlIHN0b3JlZCBpdGVtXG4gICAgICAgIGNodW5rcy5wdXNoKGpzb25TdHJpbmcuc2xpY2UoaSwgaSArIE1BWF9JVEVNIC0gMTAwKSk7XG4gICAgfVxuICAgIGlmIChjaHVua3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpdHMgaW4gYSBzaW5nbGUgaXRlbSBcdTIwMTQgc3RvcmUgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIFt7IGtleSwgdmFsdWU6IGpzb25TdHJpbmcgfV07XG4gICAgfVxuICAgIC8vIE11bHRpcGxlIGNodW5rc1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWAsIHZhbHVlOiBjaHVua3NbaV0gfSk7XG4gICAgfVxuICAgIC8vIFN0b3JlIGEgbWV0YWRhdGEgZW50cnkgc28gd2Uga25vdyBob3cgbWFueSBjaHVua3MgdGhlcmUgYXJlXG4gICAgZW50cmllcy5wdXNoKHsga2V5LCB2YWx1ZTogSlNPTi5zdHJpbmdpZnkoeyBfX2NodW5rZWQ6IHRydWUsIGNvdW50OiBjaHVua3MubGVuZ3RoIH0pIH0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xufVxuXG4vKipcbiAqIFJlYXNzZW1ibGUgY2h1bmtlZCBkYXRhIGZyb20gYSBzeW5jIGRhdGEgb2JqZWN0LlxuICogUmV0dXJucyB0aGUgcGFyc2VkIEpTT04gdmFsdWUsIG9yIG51bGwgb24gZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCBzeW5jRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1ldGEgPSB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFtZXRhIHx8ICFtZXRhLl9fY2h1bmtlZCkge1xuICAgICAgICAgICAgLy8gTm90IGNodW5rZWQgXHUyMDE0IHBhcnNlIGRpcmVjdGx5XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvbWJpbmVkID0gJyc7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVua0tleSA9IGAke0NIVU5LX1BSRUZJWH0ke2tleX06JHtpfWA7XG4gICAgICAgICAgICBpZiAoc3luY0RhdGFbY2h1bmtLZXldID09IG51bGwpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY29tYmluZWQgKz0gc3luY0RhdGFbY2h1bmtLZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGNvbWJpbmVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFZlcnNpb24gY29tcGFyaXNvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ29tcGFyZSB0d28gZG90dGVkIHZlcnNpb24gc3RyaW5ncyBudW1lcmljYWxseS5cbiAqIFJldHVybnMgMSBpZiBhID4gYiwgLTEgaWYgYSA8IGIsIDAgaWYgZXF1YWwuIE1pc3NpbmcgLyBub24tbnVtZXJpY1xuICogY29tcG9uZW50cyBhcmUgdHJlYXRlZCBhcyAwIHNvICcxLjEwLjAnIGNvcnJlY3RseSBzb3J0cyBhYm92ZSAnMS45LjAnXG4gKiAoYSBwbGFpbiBzdHJpbmcgY29tcGFyZSB3b3VsZCBwdXQgJzEuOS4wJyBmaXJzdCkuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVTZW12ZXIoYSwgYikge1xuICAgIGNvbnN0IHBhID0gU3RyaW5nKGEpLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgcGIgPSBTdHJpbmcoYikuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBsZW4gPSBNYXRoLm1heChwYS5sZW5ndGgsIHBiLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjb25zdCB4ID0gcGFyc2VJbnQocGFbaV0sIDEwKSB8fCAwO1xuICAgICAgICBjb25zdCB5ID0gcGFyc2VJbnQocGJbaV0sIDEwKSB8fCAwO1xuICAgICAgICBpZiAoeCA+IHkpIHJldHVybiAxO1xuICAgICAgICBpZiAoeCA8IHkpIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgc3luYyBwYXlsb2FkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBsb2NhbCBkYXRhIGFuZCBidWlsZCBhIHByaW9yaXRpc2VkIGxpc3Qgb2YgZW50cmllcyB0byBzeW5jLlxuICogUmV0dXJucyB7IGVudHJpZXM6IFt7IGtleSwganNvblN0cmluZywgcHJpb3JpdHksIHNpemUgfV0sIHRvdGFsU2l6ZSB9XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZFN5bmNQYXlsb2FkKCkge1xuICAgIGNvbnN0IGFsbCA9IGF3YWl0IHN0b3JhZ2UuZ2V0KG51bGwpO1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcblxuICAgIC8vIFQwLTU6IGEgc2VjcmV0IGlzIG9ubHkgZXZlciBlbWl0dGVkIHRvIHN0b3JhZ2Uuc3luYyAoR29vZ2xlL2lDbG91ZCkgaWYgaXRcbiAgICAvLyBpcyBhbHJlYWR5IGFuIGVuY3J5cHRlZCBibG9iLiBBbnkgdmFsdWUgdGhhdCBpcyBOT1QgY2lwaGVydGV4dCBpcyByZWZ1c2VkXG4gICAgLy8gKGRyb3BwZWQpIHNvIHBsYWludGV4dCBwcml2YXRlIGtleXMgLyBBUEkgc2VjcmV0cyAvIG5vdGVzIGNhbiBuZXZlciBsZWF2ZVxuICAgIC8vIHRoZSBkZXZpY2UuIGAnJ2AgKGVtcHR5IC8gYnVua2VyKSBpcyBhbGxvd2VkIHRocm91Z2ggYXMgbm9uLXNlY3JldC5cbiAgICBjb25zdCBzZWNyZXRPayA9IHYgPT4gIXYgfHwgaXNDaXBoZXJ0ZXh0KHYpO1xuXG4gICAgLy8gVG9tYnN0b25lcyAoaXNzdWUgIzMpLiBBIGRvYy9rZXkgaXMgc3VwcHJlc3NlZCBmcm9tIHRoZSBwYXlsb2FkIHdoZW4gYVxuICAgIC8vIHRvbWJzdG9uZSBkYXRlZCBhdC1vci1hZnRlciBpdHMgdXBkYXRlZEF0IGV4aXN0cywgc28gYSBzdGFsZSBsb2NhbCBjb3B5XG4gICAgLy8gY2Fubm90IHJlLXB1c2ggYSBkZWxldGVkIGl0ZW0gYmFjayBpbnRvIHRoZSBtaXJyb3IuXG4gICAgY29uc3QgZGVsZXRlZERvY3MgPSAoYWxsLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBhbGwuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkRG9jcyA6IHt9O1xuICAgIGNvbnN0IGRlbGV0ZWRLZXlzID0gKGFsbC5kZWxldGVkS2V5cyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZEtleXMgOiB7fTtcbiAgICBjb25zdCBkZWxldGVkUHJvZmlsZXMgPSAoYWxsLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWRQcm9maWxlcyA6IHt9O1xuXG4gICAgLy8gQSBwcm9maWxlJ3Mgc3RhYmxlIGlkZW50aXR5IGZvciB0b21ic3RvbmUgLyByZWNlbmN5IGtleWluZzogaXRzIHB1YmtleSxcbiAgICAvLyBlbHNlIChmb3IgYSBidW5rZXIpIGl0cyByZW1vdGUgcHVia2V5LiBNYXRjaGVzIG1lcmdlSW50b0xvY2FsJ3MgaWRlbnRpdHlPZi5cbiAgICBjb25zdCBpZGVudGl0eU9mID0gKHApID0+IChwICYmIChwLnB1YktleSB8fCBwLnJlbW90ZVB1YmtleSkpIHx8IG51bGw7XG5cbiAgICAvLyBQMDogVG9tYnN0b25lcyBcdTIwMTQgdGhlIGd1YXJhbnRlZWQgc2xvdCAoZW1pdHRlZCBiZWZvcmUgYW55dGhpbmcgZWxzZSkuXG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWREb2NzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkRG9jcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWREb2NzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZEtleXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRLZXlzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZEtleXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkUHJvZmlsZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRQcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWRQcm9maWxlcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICAvLyBQMTogUHJvZmlsZXMgKHN0cmlwIGBob3N0c2AgdG8gc2F2ZSBzcGFjZSkgKyBwcm9maWxlSW5kZXhcbiAgICBpZiAoYWxsLnByb2ZpbGVzKSB7XG4gICAgICAgIGNvbnN0IGNsZWFuUHJvZmlsZXMgPSByZWRhY3RQcm9maWxlcyhhbGwucHJvZmlsZXMpXG4gICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFN1cHByZXNzIGEgcHJvZmlsZSBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCksXG4gICAgICAgICAgICAgICAgLy8gc28gYSBzdGFsZSBsb2NhbCBjb3B5IGNhbm5vdCByZS1wdXNoIGEgZGVsZXRlZCBpZGVudGl0eS5cbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEoaWQgIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdICE9IG51bGwgJiYgZGVsZXRlZFByb2ZpbGVzW2lkXSA+PSAocC51cGRhdGVkQXQgfHwgMCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBob3N0cywgLi4ucmVzdCB9ID0gcDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdC5wcml2S2V5ICYmICFzZWNyZXRPayhyZXN0LnByaXZLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBwcml2S2V5IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3QucHJpdktleSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY2xlYW5Qcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5wcm9maWxlSW5kZXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsLnByb2ZpbGVJbmRleCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVJbmRleCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIC8vIE5PVEU6IGBpc0VuY3J5cHRlZGAgKHRoZSBtYXN0ZXItcGFzc3dvcmQgbG9jayBmbGFnKSBpcyBkZWxpYmVyYXRlbHkgTk9UXG4gICAgLy8gc3luY2VkLiBJdCBpcyBhIHBlci1kZXZpY2UgZmFjdCBcdTIwMTQgYSBkZXZpY2UgaG9sZHMgdGhlIHBhc3N3b3JkIHZlcmlmaWVyIG9yXG4gICAgLy8gaXQgZG9lcyBub3QgXHUyMDE0IGFuZCBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzIGRldmljZSBpbnRvIGFcbiAgICAvLyBkZWFkLWVuZCBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gUDI6IFNldHRpbmdzXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3QgayBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKGFsbFtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGFsbCkpIHtcbiAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQMzogQVBJIGtleSB2YXVsdCBcdTIwMTQgb25seSBzeW5jIGtleXMgd2hvc2Ugc2VjcmV0IGlzIGNpcGhlcnRleHQgKFQwLTUpXG4gICAgaWYgKGFsbC5hcGlLZXlWYXVsdCAmJiBhbGwuYXBpS2V5VmF1bHQua2V5cykge1xuICAgICAgICBjb25zdCBzYWZlS2V5cyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhhbGwuYXBpS2V5VmF1bHQua2V5cykpIHtcbiAgICAgICAgICAgIC8vIFN1cHByZXNzIGEga2V5IGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KS5cbiAgICAgICAgICAgIGlmIChkZWxldGVkS2V5c1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkS2V5c1tpZF0gPj0gKGtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWNyZXRPayhrZXkuc2VjcmV0KSkge1xuICAgICAgICAgICAgICAgIHNhZmVLZXlzW2lkXSA9IGtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IEFQSSBzZWNyZXQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzYWZlVmF1bHQgPSB7IC4uLmFsbC5hcGlLZXlWYXVsdCwga2V5czogc2FmZUtleXMgfTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHNhZmVWYXVsdCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2FwaUtleVZhdWx0JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAzX0FQSUtFWVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFA0OiBWYXVsdCBkb2NzIChpbmRpdmlkdWFsbHksIG5ld2VzdCBmaXJzdCkgXHUyMDE0IG9ubHkgaWYgY29udGVudCBpcyBjaXBoZXJ0ZXh0XG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIC8vIFN1cHByZXNzIGEgZG9jIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KS5cbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1tkb2MucGF0aF0gIT0gbnVsbCAmJiBkZWxldGVkRG9jc1tkb2MucGF0aF0gPj0gKGRvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc2VjcmV0T2soZG9jLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHZhdWx0IGNvbnRlbnQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBXcml0ZSBhIHByaW9yaXRpc2VkLCBwcmUtY2h1bmtlZCBwYXlsb2FkIHRvIHN0b3JhZ2Uuc3luYywgcmV0cnlpbmcgb24gYW5cbiAqIG92ZXItcXVvdGEgcmVqZWN0aW9uIGJ5IGRyb3BwaW5nIHRoZSBsb3dlc3QtcHJpb3JpdHkgdGllciBzdGlsbCBwcmVzZW50IGFuZFxuICogdHJ5aW5nIGFnYWluLiBQMCAodG9tYnN0b25lcykgYW5kIFAxIChwcm9maWxlcykgYXJlIE5FVkVSIGRyb3BwZWQgXHUyMDE0IGEgZnVsbFxuICogYmF0Y2ggZmFpbHVyZSB3b3VsZCBzdHJhbmQgYSBkZWxldGlvbiBvciBhIGtleSwgc28gdGhlIGltcG9ydGFudCB0aWVycyBzeW5jXG4gKiBldmVuIHdoZW4gdGhlIGJ1bGt5IG9uZXMgY2Fubm90LlxuICpcbiAqIEBwYXJhbSB7eyBwcmlvcml0eTogbnVtYmVyLCBjaHVua3M6IHtrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmd9W10gfVtdfSBpbmNsdWRlZFxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPn0gbnVtYmVyIG9mIGRhdGEga2V5cyBhY3R1YWxseSB3cml0dGVuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpIHtcbiAgICBsZXQgdGllcnMgPSBpbmNsdWRlZC5zbGljZSgpO1xuICAgIC8vIEd1YXJkIGFnYWluc3QgYW4gdW5ib3VuZGVkIGxvb3A6IGF0IG1vc3Qgb25lIHJldHJ5IHBlciBkaXN0aW5jdCBwcmlvcml0eS5cbiAgICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgOyBhdHRlbXB0KyspIHtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRpZXJzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgaXRlbS5jaHVua3MpIHtcbiAgICAgICAgICAgICAgICBzeW5jUGF5bG9hZFtjLmtleV0gPSBjLnZhbHVlO1xuICAgICAgICAgICAgICAgIGFsbFN5bmNLZXlzLnB1c2goYy5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkoeyBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLCBrZXlzOiBhbGxTeW5jS2V5cyB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQoc3luY1BheWxvYWQpO1xuXG4gICAgICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3luYyBrZXkgbm90IGluIG91ciBwYXlsb2FkLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICAgICAgayAhPT0gU1lOQ19NRVRBX0tFWSAmJiAhYWxsU3luY0tleXMuaW5jbHVkZXMoaylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5yZW1vdmUob3JwaGFuS2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gTm9uLWNyaXRpY2FsIGNsZWFudXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhbGxTeW5jS2V5cy5sZW5ndGg7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE92ZXIgcXVvdGEgKG9yIE1BWF9JVEVNUykgXHUyMDE0IGRyb3AgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsXG4gICAgICAgICAgICAvLyBwcmVzZW50IGFuZCByZXRyeS4gTmV2ZXIgZHJvcCBQMC9QMS5cbiAgICAgICAgICAgIGNvbnN0IG1heFByaW9yaXR5ID0gdGllcnMucmVkdWNlKChtLCB0KSA9PiBNYXRoLm1heChtLCB0LnByaW9yaXR5KSwgLTEpO1xuICAgICAgICAgICAgaWYgKG1heFByaW9yaXR5IDw9IFBSSU9SSVRZLlAxX1BST0ZJTEVTKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTsgLy8gbm90aGluZyBkcm9wcGFibGUgbGVmdDsgUDAvUDEgbXVzdCBzdXJ2aXZlIG9yIGZhaWwgbG91ZGx5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBiZWZvcmUgPSB0aWVycy5sZW5ndGg7XG4gICAgICAgICAgICB0aWVycyA9IHRpZXJzLmZpbHRlcih0ID0+IHQucHJpb3JpdHkgPCBtYXhQcmlvcml0eSk7XG4gICAgICAgICAgICBpZiAodGllcnMubGVuZ3RoID09PSBiZWZvcmUpIHRocm93IGU7IC8vIG5vIHByb2dyZXNzIFx1MjAxNCBiYWlsXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gc3luYy5zZXQgb3ZlciBxdW90YSBcdTIwMTQgZHJvcHBlZCBwcmlvcml0eSAke21heFByaW9yaXR5fSB0aWVyLCByZXRyeWluZ2ApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBQdWxsLW1lcmdlIEJFRk9SRSBidWlsZGluZzogb3JwaGFuLWNsZWFudXAgYmVsb3cgd2lwZXMgYW55IG1pcnJvciBrZXlcbiAgICAgICAgLy8gYWJzZW50IGZyb20gdGhpcyBkZXZpY2UncyBwYXlsb2FkLCBzbyB3ZSBtdXN0IGZpcnN0IGFic29yYiByZW1vdGVcbiAgICAgICAgLy8gc3RhdGUgKGVzcGVjaWFsbHkgcmVtb3RlIHRvbWJzdG9uZXMsIHdoaWNoIHRoZW4gc3VwcHJlc3MgdGhlIG1hdGNoaW5nXG4gICAgICAgIC8vIGRvY3Mva2V5cyBmcm9tIHRoZSBwYXlsb2FkIHdlIGFyZSBhYm91dCB0byBidWlsZCkuIFdpdGhvdXQgdGhpcyBhXG4gICAgICAgIC8vIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgb2YgYSBkZWxldGlvbiB3b3VsZCByZS1wdXNoIHRoZSBpdGVtLlxuICAgICAgICBjb25zdCByZW1vdGUgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHJlbW90ZSkgYXdhaXQgbWVyZ2VJbnRvTG9jYWwocmVtb3RlKTtcblxuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgaW5jbHVkZWQgc2V0IHJlc3BlY3RpbmcgdGhlIGluLWNvZGUgYnl0ZS9pdGVtIGJ1ZGdldC5cbiAgICAgICAgbGV0IHVzZWRCeXRlcyA9IDA7XG4gICAgICAgIGxldCB1c2VkSXRlbXMgPSAwO1xuICAgICAgICBjb25zdCBpbmNsdWRlZCA9IFtdO1xuICAgICAgICBsZXQgYnVkZ2V0RXhoYXVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoYnVkZ2V0RXhoYXVzdGVkKSBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtWYWx1ZShlbnRyeS5rZXksIGVudHJ5Lmpzb25TdHJpbmcpO1xuICAgICAgICAgICAgbGV0IGVudHJ5U2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgZW50cnlTaXplICs9IGMua2V5Lmxlbmd0aCArICh0eXBlb2YgYy52YWx1ZSA9PT0gJ3N0cmluZycgPyBjLnZhbHVlLmxlbmd0aCA6IEpTT04uc3RyaW5naWZ5KGMudmFsdWUpLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VkQnl0ZXMgKyBlbnRyeVNpemUgPiBTWU5DX1FVT1RBIC0gNTAwIHx8IHVzZWRJdGVtcyArIGNodW5rcy5sZW5ndGggPiBNQVhfSVRFTVMgLSA1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LnByaW9yaXR5IDw9IFBSSU9SSVRZLlAzX0FQSUtFWVMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JpdGljYWwgZGF0YSAoaW5jbC4gUDAgdG9tYnN0b25lcykgXHUyMDE0IGluY2x1ZGUgYW55d2F5OyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gcnVudGltZSBxdW90YSBmYWxsYmFjayB3aWxsIHNoZWQgYnVsa3kgdGllcnMgaWYgdGhlIEFQSSByZWplY3RzLlxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBCdWRnZXQgZXhoYXVzdGVkIGF0IHByaW9yaXR5ICR7ZW50cnkucHJpb3JpdHl9LCBza2lwcGluZyByZW1haW5pbmcgZW50cmllc2ApO1xuICAgICAgICAgICAgICAgICAgICBidWRnZXRFeGhhdXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluY2x1ZGVkLnB1c2goeyBwcmlvcml0eTogZW50cnkucHJpb3JpdHksIGNodW5rcyB9KTtcbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdyaXR0ZW4gPSBhd2FpdCBzZXRTeW5jUmVzcGVjdGluZ1F1b3RhKGluY2x1ZGVkKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7d3JpdHRlbn0gZW50cmllcyAoJHt1c2VkQnl0ZXN9IGJ5dGVzKSB0byBzeW5jIHN0b3JhZ2VgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVzaFRvU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgLy8gTG9jYWwgc3RvcmFnZSBpcyB1bmFmZmVjdGVkIFx1MjAxNCBncmFjZWZ1bCBkZWdyYWRhdGlvblxuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdWxsIGZyb20gc3luY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgZGF0YSBmcm9tIHN5bmMgc3RvcmFnZSBhbmQgcmV0dXJuIGFzIGEgcGxhaW4gb2JqZWN0IHdpdGhcbiAqIHJlYXNzZW1ibGVkIGNodW5rZWQgdmFsdWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVsbEZyb21TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgaWYgKCFyYXcgfHwgT2JqZWN0LmtleXMocmF3KS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGFTdHIgPSByYXdbU1lOQ19NRVRBX0tFWV07XG4gICAgICAgIGlmICghbWV0YVN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG1ldGE7XG4gICAgICAgIHRyeSB7IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFTdHIpOyB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgLy8gQ29sbGVjdCB0aGUgbm9uLWNodW5rLCBub24tbWV0YSBrZXlzXG4gICAgICAgIGNvbnN0IGRhdGFLZXlzID0gbWV0YS5rZXlzLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoQ0hVTktfUFJFRklYKSAmJiBrICE9PSBTWU5DX01FVEFfS0VZKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgcmF3KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5fc3luY01ldGEgPSBtZXRhO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdWxsRnJvbVN5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXJnZSBsb2dpY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFRoZSBiYWNrZ3JvdW5kJ3Mgb3duIHdheSB0byBoZWFyIG9mIG1vdmVkIHByb2ZpbGVzLiBBIHdvcmtlciBjYW5ub3QgbWVzc2FnZVxuLy8gaXRzZWxmLCBzbyBhIG1lcmdlIHJ1bm5pbmcgdGhlcmUgY2FsbHMgdGhpczsgYSBwYWdlIHNlbmRzIGEgbWVzc2FnZS5cbmxldCBwcm9maWxlTW92ZUhhbmRsZXIgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvZmlsZU1vdmVIYW5kbGVyKGhhbmRsZXIpIHtcbiAgICBwcm9maWxlTW92ZUhhbmRsZXIgPSBoYW5kbGVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhbm5vdW5jZVByb2ZpbGVNb3Zlcyhtb3Zlcykge1xuICAgIGlmIChwcm9maWxlTW92ZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvZmlsZU1vdmVIYW5kbGVyKG1vdmVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdwcm9maWxlc01vdmVkJywgcGF5bG9hZDogbW92ZXMgfSk7XG4gICAgfSBjYXRjaCB7IC8qIGJhY2tncm91bmQgdW5hdmFpbGFibGU6IHdoYXQgaXMga2V5ZWQgYnkgaW5kZXggY2hlY2tzIGl0cyBpZGVudGl0eSAqLyB9XG59XG5cbi8qKlxuICogV2hlcmUgZWFjaCBwcm9maWxlIHdlbnQuIEFuIHVudG91Y2hlZCByZWNvcmQgaXMgZm91bmQgYXMgaXRzZWxmLCBhbmQgb25lIHN5bmNcbiAqIHJlcGxhY2VkIGlzIGZvdW5kIGJ5IGlkZW50aXR5LiBFYWNoIHBsYWNlIGlzIGNsYWltZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdFtdfSBiZWZvcmVcbiAqIEBwYXJhbSB7b2JqZWN0W119IGFmdGVyXG4gKiBAcGFyYW0geyhwcm9maWxlOiBvYmplY3QpID0+ID9zdHJpbmd9IGlkZW50aXR5T2ZcbiAqIEByZXR1cm5zIHtBcnJheTxbbnVtYmVyLCA/bnVtYmVyXT59IFtvbGQgaW5kZXgsIG5ldyBpbmRleCBvciBudWxsIGlmIGdvbmVdLCBjaGFuZ2VzIG9ubHlcbiAqL1xuZnVuY3Rpb24gcHJvZmlsZU1vdmVzKGJlZm9yZSwgYWZ0ZXIsIGlkZW50aXR5T2YpIHtcbiAgICBjb25zdCBwbGFjZXMgPSBiZWZvcmUubWFwKHByb2ZpbGUgPT4gYWZ0ZXIuaW5kZXhPZihwcm9maWxlKSk7XG4gICAgY29uc3QgY2xhaW1lZCA9IG5ldyBTZXQocGxhY2VzKTtcbiAgICBiZWZvcmUuZm9yRWFjaCgocHJvZmlsZSwgaSkgPT4ge1xuICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocHJvZmlsZSk7XG4gICAgICAgIGlmIChwbGFjZXNbaV0gPj0gMCB8fCAhaWQpIHJldHVybjtcbiAgICAgICAgcGxhY2VzW2ldID0gYWZ0ZXIuZmluZEluZGV4KChvdGhlciwgaikgPT4gIWNsYWltZWQuaGFzKGopICYmIGlkZW50aXR5T2Yob3RoZXIpID09PSBpZCk7XG4gICAgICAgIGNsYWltZWQuYWRkKHBsYWNlc1tpXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBsYWNlcy5mbGF0TWFwKChwbGFjZSwgaSkgPT4gKHBsYWNlID09PSBpID8gW10gOiBbW2ksIHBsYWNlIDwgMCA/IG51bGwgOiBwbGFjZV1dKSk7XG59XG5cbi8qKlxuICogTWVyZ2Ugc3luYyBkYXRhIGludG8gbG9jYWwgc3RvcmFnZSB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb24uXG4gKlxuICogQ09ORElUSU9OIDMgKGlzc3VlICMzIGxvb3AgaW52YXJpYW50KTogZXZlcnkgd3JpdGUgaGVyZSBnb2VzIHRocm91Z2ggdGhlIHJhd1xuICogbW9kdWxlLWxldmVsIGBzdG9yYWdlYCAoPSBhcGkuc3RvcmFnZS5sb2NhbCkgdmlhIGEgc2luZ2xlIGBzdG9yYWdlLnNldGAuIEl0XG4gKiBNVVNUIE5PVCBjYWxsIHRoZSBzdG9yZS1sYXllciBoZWxwZXJzIChkZWxldGVEb2N1bWVudExvY2FsIC8gc2F2ZURvY3VtZW50TG9jYWxcbiAqIC8gZGVsZXRlQXBpS2V5IC8gc2F2ZUFwaUtleSksIGJlY2F1c2UgdGhvc2UgY2FsbCBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMDE0IGEgbWVyZ2VcbiAqIHRoYXQgc2NoZWR1bGVkIGEgcHVzaCB3b3VsZCB0dXJuIGV2ZXJ5IGluY29taW5nIHN5bmMgaW50byBhbiBvdXRnb2luZyBvbmUgYW5kXG4gKiBsb29wLiBBIHJlZ3Jlc3Npb24gdGVzdCBhc3NlcnRzIG1lcmdlSW50b0xvY2FsIG5ldmVyIHNjaGVkdWxlcyBhIHB1c2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgc3luY0RhdGEgPSB7IC4uLnN5bmNEYXRhLCBwcm9maWxlczogcmVkYWN0UHJvZmlsZXMoc3luY0RhdGEucHJvZmlsZXMpIH07XG4gICAgfVxuXG4gICAgY29uc3QgbG9jYWwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIC8vIERldGVjdCBmcmVzaCBpbnN0YWxsOiBubyBwcm9maWxlcywgb3IgYSBzaW5nbGUgdW50b3VjaGVkIGRlZmF1bHQgcHJvZmlsZS5cbiAgICAvLyAoRGVmYXVsdCBrZXlzIGFyZSBub3cgd3JhcHBlZCBhdCByZXN0LCBzbyBgcHJpdktleWAgaXMgdHJ1dGh5IGV2ZW4gb24gYVxuICAgIC8vIGZyZXNoIGluc3RhbGwgXHUyMDE0IGRldGVjdCB0aGUgdW50b3VjaGVkIGRlZmF1bHQgYnkgaXRzIG5hbWUgKyBhYnNlbmNlIG9mIGFueVxuICAgIC8vIHBlci1zaXRlIGdyYW50cyBpbnN0ZWFkLilcbiAgICAvL1xuICAgIC8vIEMxOiBhIGxvbmUgcHJvZmlsZSBpcyBvbmx5IFwidW50b3VjaGVkL2ZyZXNoXCIgd2hlbiBpdCBjYXJyaWVzIG5vIGlkZW50aXR5LlxuICAgIC8vIEEgbG9uZSBCVU5LRVIgcHJvZmlsZSBoYXMgcHJpdktleTonJyBidXQgSVMgYSByZWFsIGlkZW50aXR5ICh0eXBlL2J1bmtlclVybFxuICAgIC8vIC9yZW1vdGVQdWJrZXkpLCBhbmQgbXVzdCBub3QgYmUgdHJlYXRlZCBhcyBmcmVzaCBhbmQgd2lwZWQgYnkgYSBzeW5jIHB1bGwuXG4gICAgY29uc3QgaGFzSWRlbnRpdHkgPSAocCkgPT4gISEocCAmJiAoXG4gICAgICAgIHAucHJpdktleSB8fCBwLnB1YktleSB8fCBwLnR5cGUgPT09ICdidW5rZXInIHx8IHAuYnVua2VyVXJsIHx8IHAucmVtb3RlUHVia2V5XG4gICAgKSk7XG4gICAgY29uc3QgbG9uZSA9IGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMSA/IGxvY2FsLnByb2ZpbGVzWzBdIDogbnVsbDtcbiAgICBjb25zdCBpc0ZyZXNoID0gIWxvY2FsLnByb2ZpbGVzIHx8XG4gICAgICAgIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAobG9uZSAmJiAhbG9uZS5wcml2S2V5ICYmICFoYXNJZGVudGl0eShsb25lKSkgfHxcbiAgICAgICAgKGxvbmUgJiYgbG9uZS5uYW1lID09PSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJyAmJlxuICAgICAgICAgICAgT2JqZWN0LmtleXMobG9uZS5ob3N0cyB8fCB7fSkubGVuZ3RoID09PSAwKTtcblxuICAgIC8vIFN0YWJsZSBpZGVudGl0eSBmb3IgcHJvZmlsZSBtYXRjaGluZyAvIHRvbWJzdG9uZXM6IHB1YktleSwgZWxzZSB0aGVcbiAgICAvLyBidW5rZXIncyByZW1vdGVQdWJrZXkuIE1hdGNoZXMgYnVpbGRTeW5jUGF5bG9hZCdzIGlkZW50aXR5T2YuXG4gICAgY29uc3QgaWRlbnRpdHlPZiA9IChwKSA9PiAocCAmJiAocC5wdWJLZXkgfHwgcC5yZW1vdGVQdWJrZXkpKSB8fCBudWxsO1xuXG4gICAgLy8gQ2FwdHVyZSB0aGUgQUNUSVZFIGlkZW50aXR5IEJFRk9SRSBhbnkgcmVvcmRlcmluZy9yZW1vdmFsIHNvIHRoZSBhY3RpdmVcbiAgICAvLyBpbmRleCBjYW4gZm9sbG93IHRoYXQgaWRlbnRpdHkgdGhyb3VnaCB0aGUgbWVyZ2UgKGEga2V5IG1hbmFnZXIgbXVzdCBub3RcbiAgICAvLyBzaWxlbnRseSBzd2l0Y2ggd2hpY2ggaWRlbnRpdHkgaXMgYWN0aXZlIGp1c3QgYmVjYXVzZSBhIHByb2ZpbGUgb3JkZXJlZFxuICAgIC8vIGJlZm9yZSBpdCB3YXMgcmVtb3ZlZCBvbiBhbm90aGVyIGRldmljZSkuXG4gICAgY29uc3QgbG9jYWxBY3RpdmVJbmRleCA9IChsb2NhbC5wcm9maWxlSW5kZXggIT0gbnVsbCkgPyBsb2NhbC5wcm9maWxlSW5kZXggOiAwO1xuICAgIGNvbnN0IGFjdGl2ZUlkID0gKGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzW2xvY2FsQWN0aXZlSW5kZXhdKVxuICAgICAgICA/IGlkZW50aXR5T2YobG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgIDogbnVsbDtcblxuICAgIC8vIC0tLSBQcm9maWxlIHRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBwZXIgaWRlbnRpdHkgLS0tXG4gICAgY29uc3QgZGVsZXRlZFByb2ZpbGVzID0geyAuLi4obG9jYWwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZFByb2ZpbGVzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkUHJvZmlsZXNbaWRdID09IG51bGwgfHwgdHMgPiBkZWxldGVkUHJvZmlsZXNbaWRdKSBkZWxldGVkUHJvZmlsZXNbaWRdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSBcdTIwMTQgcHVia2V5LWtleWVkIG1lcmdlICsgdG9tYnN0b25lIHJlbW92YWwgLS0tXG4gICAgLy8gTWF0Y2ggYnkgc3RhYmxlIGlkZW50aXR5IHJhdGhlciB0aGFuIGFycmF5IGluZGV4LCBzbyBhIHJlb3JkZXJlZCBvciBwYXJ0aWFsXG4gICAgLy8gc3luYyBwYXlsb2FkIGNhbm5vdCBvdmVyd3JpdGUgb25lIGlkZW50aXR5J3Mga2V5IG1hdGVyaWFsIHdpdGggYW5vdGhlcidzLlxuICAgIGxldCBtZXJnZWRQcm9maWxlcyA9IGxvY2FsLnByb2ZpbGVzID8gWy4uLmxvY2FsLnByb2ZpbGVzXSA6IG51bGw7XG4gICAgbGV0IHByb2ZpbGVzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBpZiAoaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggaW5zdGFsbCBcdTIwMTQgYWRvcHQgc3luYyBwcm9maWxlcyBlbnRpcmVseVxuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcy5zbGljZSgpO1xuICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5wcm9maWxlcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXhCeUlkZW50aXR5ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgIWluZGV4QnlJZGVudGl0eS5oYXMoaWQpKSBpbmRleEJ5SWRlbnRpdHkuc2V0KGlkLCBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzeW5jUHJvZmlsZSBvZiBzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlkICYmIGluZGV4QnlJZGVudGl0eS5oYXMoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBpbmRleEJ5SWRlbnRpdHkuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkUHJvZmlsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc3luY1Byb2ZpbGUudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN5bmMgaXMgbmV3ZXIgXHUyMDE0IGFkb3B0IGl0IGJ1dCBwcmVzZXJ2ZSBsb2NhbCBwZXItc2l0ZSBob3N0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXNbaV0gPSB7IC4uLnN5bmNQcm9maWxlLCBob3N0czogbG9jYWxQcm9maWxlLmhvc3RzIHx8IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGdlbnVpbmVseSBuZXcgaWRlbnRpdHkgbm90IHByZXNlbnQgbG9jYWxseSBcdTIwMTQgYXBwZW5kIGl0LlxuICAgICAgICAgICAgICAgICAgICBpbmRleEJ5SWRlbnRpdHkuc2V0KGlkLCBtZXJnZWRQcm9maWxlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5wdXNoKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQSBrZXlsZXNzIHJlbW90ZSBwcm9maWxlIGNhbm5vdCBiZSByZWNvbmNpbGVkIHRvIGEgbG9jYWwgb25lXG4gICAgICAgICAgICAgICAgLy8gc2FmZWx5IChubyBpZGVudGl0eSB0byBtYXRjaCBvbiksIHNvIGl0IGlzIHNraXBwZWQuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBseSBwcm9maWxlIHRvbWJzdG9uZXM6IHJlbW92ZSBhbnkgbWVyZ2VkIHByb2ZpbGUgd2hvc2UgaWRlbnRpdHkgaGFzXG4gICAgLy8gKHVwZGF0ZWRBdCA8PSBkZWxldGVkQXQpIFx1MjAxNCBkZWxldGlvbiB3aW5zIHRpZXMsIGNvbnNpc3RlbnQgd2l0aCBkb2NzL2tleXMuXG4gICAgLy8gQSByZWNyZWF0ZWQgcHJvZmlsZSAodXBkYXRlZEF0ID4gZGVsZXRlZEF0KSBzdXJ2aXZlcy4gTmV2ZXIgcHJ1bmUgdG9tYnN0b25lcy5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgT2JqZWN0LmtleXMoZGVsZXRlZFByb2ZpbGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGtlcHQgPSBtZXJnZWRQcm9maWxlcy5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGlkICE9IG51bGwgPyBkZWxldGVkUHJvZmlsZXNbaWRdIDogbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAhKHRzICE9IG51bGwgJiYgKHAudXBkYXRlZEF0IHx8IDApIDw9IHRzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNhZmV0eTogbmV2ZXIgbGV0IGEgc3luYyBtZXJnZSBsZWF2ZSBaRVJPIHByb2ZpbGVzICh0aGF0IHdvdWxkIG9ycGhhblxuICAgICAgICAvLyB0aGUgYWN0aXZlIGluZGV4IGFuZCBicmljayB0aGUgVUkpLiBJZiByZW1vdmFsIHdvdWxkIGVtcHR5IHRoZSBsaXN0LFxuICAgICAgICAvLyBrZWVwIHRoZSBwcm9maWxlcyBhcy1pcyBcdTIwMTQgdGhlIGxvY2FsIHVzZXIgY2FuIHN0aWxsIGRlbGV0ZSBkZWxpYmVyYXRlbHkuXG4gICAgICAgIC8vIERlbGliZXJhdGUgdHJhZGUtb2ZmOiBjcm9zcy1kZXZpY2UgZGVsZXRpb24gZG9lcyBOT1QgY29udmVyZ2Ugb24gYVxuICAgICAgICAvLyBkZXZpY2Ugd2hlcmUgYXBwbHlpbmcgaXQgd291bGQgbGVhdmUgemVybyBwcm9maWxlczsgdGhlIHByb2ZpbGUgc3RheXNcbiAgICAgICAgLy8gdG9tYnN0b25lLXN1cHByZXNzZWQgb24gZW1pdCwgc28gaXQgZG9lcyBub3QgcmUtcHJvcGFnYXRlIHRvIG90aGVycy5cbiAgICAgICAgaWYgKGtlcHQubGVuZ3RoICE9PSBtZXJnZWRQcm9maWxlcy5sZW5ndGggJiYga2VwdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IGtlcHQ7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IG1vdmVzID0gW107XG4gICAgaWYgKHByb2ZpbGVzQ2hhbmdlZCAmJiBtZXJnZWRQcm9maWxlcykge1xuICAgICAgICB1cGRhdGVzLnByb2ZpbGVzID0gbWVyZ2VkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3ZlcyA9IHByb2ZpbGVNb3Zlcyhsb2NhbC5wcm9maWxlcyB8fCBbXSwgbWVyZ2VkUHJvZmlsZXMsIGlkZW50aXR5T2YpO1xuICAgICAgICBpZiAobW92ZXMubGVuZ3RoID4gMCAmJiBsb2NhbC5idW5rZXJTZXNzaW9ucykge1xuICAgICAgICAgICAgdXBkYXRlcy5idW5rZXJTZXNzaW9ucyA9IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3Zlcyhsb2NhbC5idW5rZXJTZXNzaW9ucywgbW92ZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGUgaW5kZXggKFAxKSBcdTIwMTQgRk9MTE9XIFRIRSBBQ1RJVkUgSURFTlRJVFkgYWNyb3NzIHRoZSBtZXJnZSAtLS1cbiAgICAvLyBUaGUgYWN0aXZlIGluZGV4IHRyYWNrcyB0aGUgYWN0aXZlIGlkZW50aXR5LCBub3QgYSByYXcgc2xvdDogaWYgYSBwcm9maWxlXG4gICAgLy8gb3JkZXJlZCBiZWZvcmUgdGhlIGFjdGl2ZSBvbmUgaXMgcmVtb3ZlZCBvbiBhbm90aGVyIGRldmljZSwgdGhlIGluZGV4XG4gICAgLy8gc2hpZnRzIHNvIHRoZSBTQU1FIGlkZW50aXR5IHN0YXlzIGFjdGl2ZS4gVGhlIGluZGV4IG9ubHkgbW92ZXMgdG8gYVxuICAgIC8vIGRpZmZlcmVudCBpZGVudGl0eSB3aGVuIHRoZSBhY3RpdmUgb25lIGlzIGl0c2VsZiBnb25lICh0b21ic3RvbmVkKSwgb3Igb24gYVxuICAgIC8vIGZyZXNoIGFkb3B0IFx1MjAxNCB0aGVuIGl0IGZhbGxzIGJhY2sgdG8gdGhlIHNhZmUgY2xhbXAuXG4gICAgaWYgKG1lcmdlZFByb2ZpbGVzICYmIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGRlc2lyZWRJbmRleDtcbiAgICAgICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzICYmIGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGFkb3B0IFx1MjAxNCB0YWtlIHN5bmMncyBhY3RpdmUgaW5kZXgsIGNsYW1wZWQgaW50byByYW5nZS5cbiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSBzeW5jRGF0YS5wcm9maWxlSW5kZXggIT0gbnVsbCA/IHN5bmNEYXRhLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgICAgICAgICBkZXNpcmVkSW5kZXggPSBNYXRoLm1pbihNYXRoLm1heChiYXNlLCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmb2xsb3dlZCA9IGFjdGl2ZUlkICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IG1lcmdlZFByb2ZpbGVzLmZpbmRJbmRleChwID0+IGlkZW50aXR5T2YocCkgPT09IGFjdGl2ZUlkKVxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgICAgICBkZXNpcmVkSW5kZXggPSBmb2xsb3dlZCA+PSAwXG4gICAgICAgICAgICAgICAgPyBmb2xsb3dlZFxuICAgICAgICAgICAgICAgIDogTWF0aC5taW4oTWF0aC5tYXgobG9jYWxBY3RpdmVJbmRleCwgMCksIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZXNpcmVkSW5kZXggIT09IGxvY2FsLnByb2ZpbGVJbmRleCkge1xuICAgICAgICAgICAgdXBkYXRlcy5wcm9maWxlSW5kZXggPSBkZXNpcmVkSW5kZXg7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBFbmNyeXB0aW9uIHN0YXRlIChQMSkgLS0tXG4gICAgLy8gQTI6IGBpc0VuY3J5cHRlZGAgaXMgTk9UIG1lcmdlZC4gVGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGlzIGEgcGVyLWRldmljZVxuICAgIC8vIGZhY3QgcHJvdmVuIGJ5IHRoZSBsb2NhbCB2ZXJpZmllcjsgbWlycm9yaW5nIGl0IG9uY2UgbGF0Y2hlZCBhIHBhc3N3b3JkbGVzc1xuICAgIC8vIGRldmljZSBpbnRvIGEgbG9jayBzY3JlZW4gaXQgaGFkIG5vIHBhc3N3b3JkIGZvci4gU2VlIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKS5cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBhIG51bWVyaWNhbGx5LWhpZ2hlciBvbmUgKCcxLjEwLjAnID4gJzEuOS4wJykuXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAndmVyc2lvbicgJiYgbG9jYWwudmVyc2lvbiAmJiBjb21wYXJlU2VtdmVyKHN5bmNEYXRhLnZlcnNpb24sIGxvY2FsLnZlcnNpb24pIDw9IDApIGNvbnRpbnVlO1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdmZWF0dXJlOicpICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBUb21ic3RvbmVzIChpc3N1ZSAjMykgXHUyMDE0IHVuaW9uIGxvY2FsICsgcmVtb3RlLCBtYXggZGVsZXRlZEF0IHBlciBrZXkgLS0tXG4gICAgY29uc3QgZGVsZXRlZERvY3MgPSB7IC4uLihsb2NhbC5kZWxldGVkRG9jcyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZERvY3MgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtwYXRoLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZERvY3MpKSB7XG4gICAgICAgICAgICBpZiAoZGVsZXRlZERvY3NbcGF0aF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWREb2NzW3BhdGhdKSBkZWxldGVkRG9jc1twYXRoXSA9IHRzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRlbGV0ZWRLZXlzID0geyAuLi4obG9jYWwuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGxvY2FsLmRlbGV0ZWRLZXlzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkS2V5cykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkS2V5c1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRLZXlzW2lkXSkgZGVsZXRlZEtleXNbaWRdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gQVBJIEtleSBWYXVsdCAoUDMpIC0tLVxuICAgIC8vIEJ1aWxkIHRoZSBtZXJnZWQga2V5IHNldCwgZm9sZCBpbiBhbnkgcmVtb3RlIGtleXMsIHRoZW4gYXBwbHkga2V5XG4gICAgLy8gdG9tYnN0b25lcy4gUnVucyBldmVuIHdoZW4gdGhlIHB1bGwgY2FycmllcyBOTyBhcGlLZXlWYXVsdCwgc28gYVxuICAgIC8vIGRlbGV0ZS1vbmx5IHB1bGwgY2FuIHN0aWxsIHJlbW92ZSBhIGxvY2FsbHktaGVsZCBrZXkuXG4gICAge1xuICAgICAgICBsZXQgYmFzZVZhdWx0ID0gbG9jYWwuYXBpS2V5VmF1bHQgfHwgbnVsbDtcbiAgICAgICAgbGV0IGxvY2FsS2V5cyA9IChsb2NhbC5hcGlLZXlWYXVsdCAmJiBsb2NhbC5hcGlLZXlWYXVsdC5rZXlzKSB8fCB7fTtcbiAgICAgICAgbGV0IGFwaUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCghbG9jYWwuYXBpS2V5VmF1bHQgfHwgaXNGcmVzaCkgJiYgc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgICAgIGJhc2VWYXVsdCA9IHN5bmNEYXRhLmFwaUtleVZhdWx0O1xuICAgICAgICAgICAgbG9jYWxLZXlzID0ge307XG4gICAgICAgICAgICBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaGFyZWQgbWVyZ2UgKHN5bmMtbWVyZ2UuanMpOiBuZXdlciByZW1vdGUgd2lucywgZGVsZXRpb24gd2lucyB0aWVzXG4gICAgICAgIC8vIChgPD1gKSwgdG9tYnN0b25lcyBhcmUgTkVWRVIgcHJ1bmVkIGhlcmUuIFRvbWJzdG9uZXMgYXJlIGNsZWFyZWQgb25seVxuICAgICAgICAvLyBhdCB0aGUgc291cmNlIChzYXZlQXBpS2V5IG9uIHNhbWUtZGV2aWNlIHJlY3JlYXRlKSBvciBieSB0aGUgdXNlci5cbiAgICAgICAgY29uc3Qga2V5TWVyZ2UgPSBtZXJnZVJlbW90ZShsb2NhbEtleXMsIChzeW5jRGF0YS5hcGlLZXlWYXVsdCAmJiBzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzKSB8fCB7fSwgZGVsZXRlZEtleXMpO1xuICAgICAgICBjb25zdCBtZXJnZWRLZXlzID0ga2V5TWVyZ2UubWVyZ2VkO1xuICAgICAgICBpZiAoa2V5TWVyZ2UuY2hhbmdlZCkgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGlmIChhcGlDaGFuZ2VkICYmIGJhc2VWYXVsdCkge1xuICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4uYmFzZVZhdWx0LCBrZXlzOiBtZXJnZWRLZXlzIH07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBWYXVsdCBkb2NzIChQNCkgLS0tXG4gICAgY29uc3QgcmVtb3RlRG9jcyA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCd2YXVsdERvYzonKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRvYyA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghZG9jIHx8ICFkb2MucGF0aCkgY29udGludWU7XG4gICAgICAgIHJlbW90ZURvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgIH1cbiAgICAvLyBTaGFyZWQgbWVyZ2U6IGRlbGV0aW9uIHdpbnMgdGllcywgdG9tYnN0b25lcyBhcmUgTkVWRVIgcHJ1bmVkIGhlcmUuXG4gICAgY29uc3QgeyBtZXJnZWQ6IG1lcmdlZERvY3MsIGNoYW5nZWQ6IGRvY3NDaGFuZ2VkIH0gPSBtZXJnZVJlbW90ZShsb2NhbC52YXVsdERvY3MgfHwge30sIHJlbW90ZURvY3MsIGRlbGV0ZWREb2NzKTtcbiAgICBpZiAoZG9jc0NoYW5nZWQpIHtcbiAgICAgICAgdXBkYXRlcy52YXVsdERvY3MgPSBtZXJnZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBQZXJzaXN0IHRoZSB0b21ic3RvbmUgc2V0cy4gVGhlc2UgYXJlIGEgUFVSRSBVTklPTiAobWF4IGRlbGV0ZWRBdCBwZXJcbiAgICAvLyBrZXkpIFx1MjAxNCB0aGUgbWVyZ2UgbmV2ZXIgcmVtb3ZlcyBhIHRvbWJzdG9uZSwgc28gdGhleSBhcmUgcmV0YWluZWQgZm9yZXZlclxuICAgIC8vIGFuZCBhbiBvZmZsaW5lIGRldmljZSBjYW5ub3QgcmVzdXJyZWN0IGEgZGVsZXRpb24uIFRoZXkgYXJlIGNsZWFyZWQgb25seVxuICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVEb2N1bWVudExvY2FsL3NhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5XG4gICAgLy8gdGhlIHVzZXIgdmlhIGNsZWFyRGVsZXRpb25IaXN0b3J5LlxuICAgIC8vXG4gICAgLy8gUmVzaWR1YWwgKGFjY2VwdGVkLCBkb2N1bWVudGVkKTogcHVyZSBjcm9zcy1kZXZpY2UgY2xvY2sgc2tldyBcdTIwMTQgYSBsaXZlXG4gICAgLy8gY29weSB3aG9zZSB1cGRhdGVkQXQgaXMgZ2VudWluZWx5IE5FV0VSIHRoYW4gdGhlIGRlbGV0ZSdzIHRpbWVzdGFtcCBcdTIwMTQgd2luc1xuICAgIC8vIHVuZGVyIHRoZSBgPD1gIHJ1bGUgYW5kIGlzIGtlcHQuIFRoYXQgaXMgYW4gaW5oZXJlbnQgbGFzdC13cml0ZS13aW5zIGxpbWl0XG4gICAgLy8gdGhhdCB0b21ic3RvbmVzIGRvIG5vdCByZXNvbHZlOyBcImZpeGluZ1wiIGl0IGJ5IHBydW5pbmcgd291bGQgcmVpbnRyb2R1Y2VcbiAgICAvLyB0aGUgc2FtZS1zZWNvbmQgcmVzdXJyZWN0aW9uIGJ1Zywgc28gaXQgaXMgbGVmdCBhcy1pcy5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkRG9jcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkRG9jcyA9IGRlbGV0ZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRLZXlzKSAhPT0gSlNPTi5zdHJpbmdpZnkobG9jYWwuZGVsZXRlZEtleXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZEtleXMgPSBkZWxldGVkS2V5cztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkUHJvZmlsZXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZFByb2ZpbGVzID0gZGVsZXRlZFByb2ZpbGVzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAvLyBSYXcgbG9jYWwgd3JpdGUgT05MWSBcdTIwMTQgbmV2ZXIgc2NoZWR1bGVTeW5jUHVzaCAobG9vcCBpbnZhcmlhbnQpLlxuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG4gICAgaWYgKG1vdmVzLmxlbmd0aCA+IDApIGF3YWl0IGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlbGV0aW9uLWhpc3RvcnkgKHRvbWJzdG9uZSkgcmV0ZW50aW9uIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRvdGFsIG51bWJlciBvZiByZXRhaW5lZCBkZWxldGlvbiByZWNvcmRzIChkb2NzICsga2V5cykuIEdyb3dzIG92ZXIgdGhlIGxpZmVcbiAqIG9mIHRoZSBpbnN0YWxsIGJlY2F1c2UgdG9tYnN0b25lcyBhcmUga2VwdCBmb3JldmVyIChhbiBvZmZsaW5lIGRldmljZSB0aGF0XG4gKiBuZXZlciBsZWFybmVkIG9mIGEgZGVsZXRpb24gbXVzdCBub3QgYmUgYWJsZSB0byByZXN1cnJlY3QgdGhlIGl0ZW0pLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9tYnN0b25lQ291bnQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgY29uc3QgZG9jcyA9IGRhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkRG9jcyA6IHt9O1xuICAgIGNvbnN0IGtleXMgPSBkYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZEtleXMgOiB7fTtcbiAgICBjb25zdCBwcm9maWxlcyA9IGRhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRQcm9maWxlcyA6IHt9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhkb2NzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhrZXlzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhwcm9maWxlcykubGVuZ3RoO1xufVxuXG4vKipcbiAqIFdhcm5pbmcgbGV2ZWwgZm9yIGEgZ2l2ZW4gcmV0YWluZWQtZGVsZXRpb24gY291bnQ6XG4gKiAgIDAgPSBmaW5lLCAxID0gZ2VudGxlIG51ZGdlICg+PSA4KSwgMiA9IHN0cm9uZ2VyIHdhcm5pbmcgKD49IDE2KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbWJzdG9uZVdhcm5pbmdMZXZlbChjb3VudCkge1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9TVFJPTkcpIHJldHVybiAyO1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9HRU5UTEUpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5LiBJbmZvcm1lZC11c2VyIGNob2ljZTogYSBkZXZpY2UgdGhhdCBoYXNcbiAqIGJlZW4gb2ZmbGluZSBzaW5jZSBiZWZvcmUgb25lIG9mIHRoZXNlIGRlbGV0aW9ucyBjYW4sIG9uIGl0cyBuZXh0IHN5bmMsXG4gKiByZS1hZGQgdGhlIGl0ZW0gXHUyMDE0IGJlY2F1c2UgdGhlIHJlY29yZCB0aGF0IHRvbGQgZXZlcnlvbmUgaXQgd2FzIGRlbGV0ZWQgaXNcbiAqIG5vdyBnb25lLiBTY2hlZHVsZXMgYSBwdXNoIHNvIHRoZSBjbGVhcmVkIHN0YXRlIHByb3BhZ2F0ZXMgdG8gdGhlIG1pcnJvci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGVsZXRpb25IaXN0b3J5KCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuY3J5cHRpb24tZmxhZyBzZWxmLWhlYWwgKEEyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2xlYXIgYSBib2d1cyBgaXNFbmNyeXB0ZWQ9dHJ1ZWAgd2hlbiB0aGlzIGRldmljZSBob2xkcyBubyBldmlkZW5jZSBvZiByZWFsXG4gKiBwYXNzd29yZCBwcm90ZWN0aW9uIFx1MjAxNCBubyBwYXNzd29yZCB2ZXJpZmllciAocGFzc3dvcmRIYXNoKSBBTkQgbm8gcHJvZmlsZSBrZXlcbiAqIHRoYXQgaXMgYSBQQVNTV09SRCBibG9iLlxuICpcbiAqIEdhdGluZyBkZXRhaWwgKGNyaXRpY2FsKTogZXZpZGVuY2UgaXMgYSBQQVNTV09SRCBibG9iIChpc1Bhc3N3b3JkQmxvYiksIE5PVCBhXG4gKiBkZXZpY2Uta2V5IGJsb2IuIFNpbmNlIHYxLjcuMCBldmVyeSBrZXkgaXMgd3JhcHBlZCBhdCByZXN0IGV2ZW4gZm9yIHRoZVxuICogcGFzc3dvcmRsZXNzIExldmVsLTAgdXNlciwgc28gYSBub3JtYWwgcGFzc3dvcmRsZXNzIGluc3RhbGwgaXMgZnVsbCBvZlxuICogZGV2aWNlLWtleSBjaXBoZXJ0ZXh0OyBrZXlpbmcgb2ZmIHRoYXQgd291bGQgd3JvbmdseSBrZWVwIHRoZSBmbGFnIGxhdGNoZWQuXG4gKiBPbmx5IGEgcGFzc3dvcmQtZGVyaXZlZCBibG9iIChvciB0aGUgdmVyaWZpZXIpIHByb3ZlcyBhIG1hc3RlciBwYXNzd29yZC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gdHJ1ZSBpZiBhIGJvZ3VzIGZsYWcgd2FzIGNsZWFyZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKCFkYXRhLmlzRW5jcnlwdGVkKSByZXR1cm4gZmFsc2U7ICAgLy8gbm90aGluZyBsYXRjaGVkIFx1MjAxNCBub3RoaW5nIHRvIGhlYWxcbiAgICBpZiAoZGF0YS5wYXNzd29yZEhhc2gpIHJldHVybiBmYWxzZTsgICAvLyByZWFsIHZlcmlmaWVyIHByZXNlbnQgXHUyMDE0IGtlZXAgdGhlIGZsYWdcblxuICAgIGNvbnN0IGhhc1Bhc3N3b3JkQmxvYiA9IEFycmF5LmlzQXJyYXkoZGF0YS5wcm9maWxlcykgJiZcbiAgICAgICAgZGF0YS5wcm9maWxlcy5zb21lKHAgPT4gcCAmJiBpc1Bhc3N3b3JkQmxvYihwLnByaXZLZXkpKTtcbiAgICBpZiAoaGFzUGFzc3dvcmRCbG9iKSByZXR1cm4gZmFsc2U7ICAgICAvLyBwYXNzd29yZC1lbmNyeXB0ZWQga2V5IG1hdGVyaWFsIFx1MjAxNCBrZWVwXG5cbiAgICAvLyBGbGFnIGlzIGJvZ3VzIChlLmcuIG1pcnJvcmVkIGluIGZyb20gYW5vdGhlciBkZXZpY2UgdGhhdCBESUQgaGF2ZSBhXG4gICAgLy8gcGFzc3dvcmQpLiBDbGVhciBpdCBzbyB0aGlzIGRldmljZSBpcyBub3Qgc3RyYW5kZWQgYXQgYSBkZWFkLWVuZCB1bmxvY2suXG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gQ2xlYXJlZCBib2d1cyBpc0VuY3J5cHRlZCBmbGFnIChubyBwYXNzd29yZCB2ZXJpZmllci9ibG9iKScpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZWR1Y2UgZXZlcnkgYnVua2VyVXJsIGluIHRoZSBgcHJvZmlsZXNgIG1pcnJvciB0byBpdHMgYWRkcmVzcy4gV29ya3Mgb24gdGhlXG4gKiBzdG9yZWQgZGF0YSBkaXJlY3RseSwgc28gaXQgZG9lcyBub3QgZGVwZW5kIG9uIHN5bmMgYmVpbmcgZW5hYmxlZCwgYW5kIHdyaXRlc1xuICogbm90aGluZyB3aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gY2hhbmdlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NydWJTeW5jZWRQcm9maWxlcygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICBjb25zdCBwcm9maWxlcyA9IHJhdyA/IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoJ3Byb2ZpbGVzJywgcmF3KSA6IG51bGw7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuO1xuICAgIGNvbnN0IGNsZWFuID0gcmVkYWN0UHJvZmlsZXMocHJvZmlsZXMpO1xuICAgIGlmIChjbGVhbiA9PT0gcHJvZmlsZXMpIHJldHVybjtcblxuICAgIGNvbnN0IGVudHJpZXMgPSBjaHVua1ZhbHVlKCdwcm9maWxlcycsIEpTT04uc3RyaW5naWZ5KGNsZWFuKSk7XG4gICAgY29uc3QgcGF5bG9hZCA9IE9iamVjdC5mcm9tRW50cmllcyhlbnRyaWVzLm1hcChlID0+IFtlLmtleSwgZS52YWx1ZV0pKTtcbiAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChwYXlsb2FkKTtcbiAgICBjb25zdCB1bnVzZWQgPSBPYmplY3Qua2V5cyhyYXcpLmZpbHRlcihrID0+XG4gICAgICAgIGsuc3RhcnRzV2l0aChgJHtDSFVOS19QUkVGSVh9cHJvZmlsZXM6YCkgJiYgIShrIGluIHBheWxvYWQpXG4gICAgKTtcbiAgICBpZiAodW51c2VkLmxlbmd0aCA+IDApIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMucmVtb3ZlKHVudXNlZCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5pdGlhbGlzYXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENhbGxlZCBvbmNlIG9uIHN0YXJ0dXAgKGZyb20gYmFja2dyb3VuZC5qcykuXG4gKiBQdWxscyBmcm9tIHN5bmMsIG1lcmdlcywgdGhlbiBsaXN0ZW5zIGZvciByZW1vdGUgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRTeW5jKCkge1xuICAgIC8vIFNlbGYtaGVhbCBhIGJvZ3VzIGVuY3J5cHRpb24gZmxhZyBmaXJzdCBcdTIwMTQgdGhpcyBtdXN0IHJ1biBldmVuIHdoZW4gc3luYyBpc1xuICAgIC8vIHVuYXZhaWxhYmxlIG9yIGRpc2FibGVkLCBiZWNhdXNlIHRoZSBiYWQgc3RhdGUgaXQgZml4ZXMgbWF5IGhhdmUgYmVlbiBsZWZ0XG4gICAgLy8gYmVoaW5kIGJ5IGFuIGVhcmxpZXIgKG5vdy1yZW1vdmVkKSBpc0VuY3J5cHRlZC1zeW5jaW5nIGJ1aWxkLlxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gc2VsZkhlYWxFbmNyeXB0aW9uRmxhZyBmYWlsZWQ6JywgZSk7XG4gICAgfVxuXG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIHN0b3JhZ2Uuc3luYyBub3QgYXZhaWxhYmxlIFx1MjAxNCBza2lwcGluZycpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2NydWJTeW5jZWRQcm9maWxlcygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBzY3J1YlN5bmNlZFByb2ZpbGVzIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBQbGF0Zm9ybSBzeW5jIGRpc2FibGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdWxsICsgbWVyZ2VcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzeW5jRGF0YSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAoc3luY0RhdGEpIHtcbiAgICAgICAgICAgIGF3YWl0IG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCttZXJnZSBjb21wbGV0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTm8gc3luYyBkYXRhIGZvdW5kIFx1MjAxNCBmcmVzaCBzeW5jJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlbW90ZSBjaGFuZ2VzXG4gICAgaWYgKGFwaS5zdG9yYWdlLm9uQ2hhbmdlZCkge1xuICAgICAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWFOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJlYU5hbWUgIT09ICdzeW5jJykgcmV0dXJuO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIHN5bmMgY2hhbmdlIGRldGVjdGVkJyk7XG4gICAgICAgICAgICAvLyBSZS1wdWxsIGFuZCBtZXJnZSB0aGUgZnVsbCBzeW5jIGRhdGEgdG8gaGFuZGxlIGNodW5rZWQgdmFsdWVzIGNvcnJlY3RseVxuICAgICAgICAgICAgcHVsbEZyb21TeW5jKCkudGhlbihzeW5jRGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmNEYXRhKSBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIFJlbW90ZSBtZXJnZSBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEbyBhbiBpbml0aWFsIHB1c2ggc28gbG9jYWwgZGF0YSBpcyBtaXJyb3JlZFxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cbiIsICIvKipcbiAqIFNoYXJlZCB0b21ic3RvbmUtYXdhcmUgbWVyZ2UuXG4gKlxuICogT25lIHJ1bGUgZm9yIGV2ZXJ5IHBsYWNlIHJlbW90ZSBkYXRhIG1lZXRzIGxvY2FsIGRhdGEgKHRoZSBzdG9yYWdlLnN5bmNcbiAqIG1pcnJvciBhbmQgYm90aCByZWxheSBwdWxscywgdmF1bHQgZG9jdW1lbnRzIGFuZCBBUEkga2V5cyk6IGEgcmVtb3RlIGl0ZW0gaXNcbiAqIGRyb3BwZWQgd2hlbiBhIHRvbWJzdG9uZSBmb3IgaXRzIGtleSBpcyBkYXRlZCBhdCBvciBhZnRlciB0aGUgcmVtb3RlIGl0ZW0nc1xuICogb3duIHRpbWVzdGFtcC4gRGVsZXRpb24gd2lucyB0aWVzLiBBIGNvcHkgd3JpdHRlbiBhZnRlciB0aGUgZGVsZXRpb24gKGFcbiAqIHJlLWNyZWF0ZSkgY2FycmllcyBhIG5ld2VyIHRpbWVzdGFtcCBhbmQgaXMga2VwdC5cbiAqXG4gKiBUb21ic3RvbmVzIGFyZSBuZXZlciBwcnVuZWQgaGVyZS5cbiAqL1xuXG4vKipcbiAqIElzIGBpdGVtYCBzdXBlcnNlZGVkIGJ5IHRoZSB0b21ic3RvbmUgZm9yIGBrZXlgP1xuICogQHBhcmFtIHtPYmplY3R9IHRvbWJzdG9uZXMgLSB7IGtleTogZGVsZXRlZEF0U2Vjb25kcyB9XG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge251bWJlcn0gdGltZSAtIHRoZSBpdGVtJ3MgdGltZXN0YW1wIGluIHNlY29uZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVG9tYnN0b25lZCh0b21ic3RvbmVzLCBrZXksIHRpbWUpIHtcbiAgICBpZiAoIXRvbWJzdG9uZXMgfHwgdHlwZW9mIHRvbWJzdG9uZXMgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdHMgPSB0b21ic3RvbmVzW2tleV07XG4gICAgcmV0dXJuIHRzICE9IG51bGwgJiYgKHRpbWUgfHwgMCkgPD0gdHM7XG59XG5cbi8qKlxuICogTWVyZ2UgYSByZW1vdGUgbWFwIGludG8gYSBsb2NhbCBtYXAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxvY2FsIC0geyBrZXk6IGl0ZW0gfVxuICogQHBhcmFtIHtPYmplY3R9IHJlbW90ZSAtIHsga2V5OiBpdGVtIH1cbiAqIEBwYXJhbSB7T2JqZWN0fSB0b21ic3RvbmVzIC0geyBrZXk6IGRlbGV0ZWRBdFNlY29uZHMgfVxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRzXVxuICogQHBhcmFtIHsoaXRlbTpPYmplY3QpPT5udW1iZXJ9IFtvcHRzLnRpbWVPZl0gLSBpdGVtIHRpbWVzdGFtcCAoZGVmYXVsdCB1cGRhdGVkQXQpXG4gKiBAcmV0dXJucyB7eyBtZXJnZWQ6IE9iamVjdCwgY2hhbmdlZDogYm9vbGVhbiB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VSZW1vdGUobG9jYWwsIHJlbW90ZSwgdG9tYnN0b25lcywgb3B0cyA9IHt9KSB7XG4gICAgY29uc3QgdGltZU9mID0gb3B0cy50aW1lT2YgfHwgKChpdGVtKSA9PiAoaXRlbSAmJiBpdGVtLnVwZGF0ZWRBdCkgfHwgMCk7XG4gICAgY29uc3QgbWVyZ2VkID0geyAuLi4obG9jYWwgfHwge30pIH07XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIGl0ZW1dIG9mIE9iamVjdC5lbnRyaWVzKHJlbW90ZSB8fCB7fSkpIHtcbiAgICAgICAgaWYgKCFpdGVtKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlzVG9tYnN0b25lZCh0b21ic3RvbmVzLCBrZXksIHRpbWVPZihpdGVtKSkpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBtaW5lID0gbWVyZ2VkW2tleV07XG4gICAgICAgIGlmICghbWluZSB8fCB0aW1lT2YoaXRlbSkgPiB0aW1lT2YobWluZSkpIHtcbiAgICAgICAgICAgIG1lcmdlZFtrZXldID0gaXRlbTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG1lcmdlZCkpIHtcbiAgICAgICAgaWYgKGlzVG9tYnN0b25lZCh0b21ic3RvbmVzLCBrZXksIHRpbWVPZihtZXJnZWRba2V5XSkpKSB7XG4gICAgICAgICAgICBkZWxldGUgbWVyZ2VkW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBtZXJnZWQsIGNoYW5nZWQgfTtcbn1cblxuLyoqXG4gKiBDb2xsZWN0IGRlbGV0aW9uIHRpbWVzIGZyb20gdGhlIGF1dGhvcidzIG93biBraW5kIDUgZXZlbnRzIChOSVAtMDkpIGZvciB0aGVcbiAqIGdpdmVuIGQtdGFncy4gQWNjZXB0cyBgYWAgdGFncyBgMzAwNzg6PHB1YmtleT46PGR0YWc+YCwgYW5kIHRoZSBlYXJsaWVyXG4gKiBgMzAwNzg6OjxkdGFnPmAgc2hhcGUgdGhpcyBleHRlbnNpb24gdXNlZCB0byB3cml0ZSAodGhlIGF1dGhvciBpcyBhbHJlYWR5XG4gKiB2ZXJpZmllZCBieSB0aGUgY2FsbGVyKS4gQWxzbyBtYXBzIGBlYCB0YWdzIHRocm91Z2ggYGV2ZW50SWRUb0R0YWdgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gZGVsZXRpb25zIC0gdmVyaWZpZWQga2luZCA1IGV2ZW50cyBieSBgcHVia2V5YFxuICogQHBhcmFtIHtzdHJpbmd9IHB1YmtleVxuICogQHBhcmFtIHtPYmplY3R9IFtldmVudElkVG9EdGFnXSAtIHsgZXZlbnRJZDogZHRhZyB9XG4gKiBAcmV0dXJucyB7T2JqZWN0fSB7IGR0YWc6IGxhdGVzdERlbGV0aW9uQ3JlYXRlZEF0IH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0aW9uVG9tYnN0b25lcyhkZWxldGlvbnMsIHB1YmtleSwgZXZlbnRJZFRvRHRhZyA9IHt9KSB7XG4gICAgY29uc3Qgb3V0ID0ge307XG4gICAgY29uc3Qgbm90ZSA9IChkdGFnLCB0cykgPT4ge1xuICAgICAgICBpZiAob3V0W2R0YWddID09IG51bGwgfHwgdHMgPiBvdXRbZHRhZ10pIG91dFtkdGFnXSA9IHRzO1xuICAgIH07XG4gICAgZm9yIChjb25zdCBldiBvZiBkZWxldGlvbnMgfHwgW10pIHtcbiAgICAgICAgaWYgKCFldiB8fCBldi5raW5kICE9PSA1IHx8IGV2LnB1YmtleSAhPT0gcHVia2V5KSBjb250aW51ZTtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgZXYudGFncyB8fCBbXSkge1xuICAgICAgICAgICAgaWYgKHRhZ1swXSA9PT0gJ2EnICYmIHR5cGVvZiB0YWdbMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbCA9IGAzMDA3ODoke3B1YmtleX06YDtcbiAgICAgICAgICAgICAgICBjb25zdCBsZWdhY3kgPSAnMzAwNzg6Oic7XG4gICAgICAgICAgICAgICAgaWYgKHRhZ1sxXS5zdGFydHNXaXRoKGZ1bGwpKSBub3RlKHRhZ1sxXS5zbGljZShmdWxsLmxlbmd0aCksIGV2LmNyZWF0ZWRfYXQpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRhZ1sxXS5zdGFydHNXaXRoKGxlZ2FjeSkpIG5vdGUodGFnWzFdLnNsaWNlKGxlZ2FjeS5sZW5ndGgpLCBldi5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFnWzBdID09PSAnZScgJiYgZXZlbnRJZFRvRHRhZ1t0YWdbMV1dKSB7XG4gICAgICAgICAgICAgICAgbm90ZShldmVudElkVG9EdGFnW3RhZ1sxXV0sIGV2LmNyZWF0ZWRfYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59XG4iLCAiLyoqXG4gKiBTZWNyZXQgVmF1bHQgXHUyMDE0IGF0LXJlc3QgZW5jcnlwdGlvbiBmb3IgcHJpdmF0ZSBrZXlzIGFuZCBhcHBsaWNhdGlvbiBzZWNyZXRzLlxuICpcbiAqIFRocmVhdCBtb2RlbCAoVDAtNCk6IHJhdyBzZWNyZXQgYnl0ZXMgbXVzdCBuZXZlciBzaXQgaW4gYnJvd3NlciBzdG9yYWdlIGluXG4gKiBjbGVhcnRleHQsIGV2ZW4gZm9yIHRoZSBERUZBVUxUIHBhc3N3b3JkbGVzcyB1c2VyLiBUaGlzIG1vZHVsZSBwcm92aWRlcyB0d29cbiAqIHdyYXBwaW5nIHN0cmF0ZWdpZXMgYmVoaW5kIG9uZSBgd3JhcFNlY3JldGAgLyBgdW53cmFwU2VjcmV0YCBpbnRlcmZhY2U6XG4gKlxuICogICAxLiBERVZJQ0UgS0VZIChkZWZhdWx0LCBubyBtYXN0ZXIgcGFzc3dvcmQpIFx1MjAxNCBhIG5vbi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTVxuICogICAgICBDcnlwdG9LZXkuIFRocmVlIHBlcnNpc3RlbmNlIHN0cmF0ZWdpZXMgZXhpc3QsIGFuZCBlYWNoIGlzIFZFUklGSUVEXG4gKiAgICAgIChyZWFkIGJhY2sgYW5kIHJvdW5kLXRyaXBwZWQgdGhyb3VnaCBlbmNyeXB0L2RlY3J5cHQpIGJlZm9yZSBpdCBpc1xuICogICAgICB0cnVzdGVkOlxuICpcbiAqICAgICAgICBhLiBgaWRiYCAgICBcdTIwMTQgYSBDcnlwdG9LZXkgKmhhbmRsZSogaW4gSW5kZXhlZERCLiBPbmx5IGV2ZXIgQURPUFRFRCxcbiAqICAgICAgICAgICAgICAgICAgICAgIG5ldmVyIG1pbnRlZDogd2UgdHJ1c3QgYGlkYmAgZXhjbHVzaXZlbHkgd2hlbiBkYi5nZXQoKVxuICogICAgICAgICAgICAgICAgICAgICAgaGFuZHMgYmFjayBhIFBSRS1FWElTVElORyBrZXkgdGhhdCByb3VuZC10cmlwcywgYmVjYXVzZVxuICogICAgICAgICAgICAgICAgICAgICAgdGhhdCBcdTIwMTQgYW5kIG9ubHkgdGhhdCBcdTIwMTQgcHJvdmVzIHRoZSBoYW5kbGUgc3Vydml2ZWQgYVxuICogICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMgY29udGV4dC4gQSBzYW1lLWNvbnRleHQgcHV0XHUyMTkyZ2V0IHByb2JlIGNhbm5vdFxuICogICAgICAgICAgICAgICAgICAgICAgcHJvdmUgY3Jvc3MtY29udGV4dCBwZXJzaXN0ZW5jZS4gS2VlcGluZyB0aGUgYWRvcHQgcGF0aFxuICogICAgICAgICAgICAgICAgICAgICAgcHJlc2VydmVzIGV2ZXJ5IENocm9tZS9GaXJlZm94IHZhdWx0IHdyaXR0ZW4gYmVmb3JlXG4gKiAgICAgICAgICAgICAgICAgICAgICAxLjguMSwgd2hvc2UgYmxvYnMgbGl2ZSB1bmRlciB0aGlzIGtleS5cbiAqICAgICAgICAgICAgICAgICAgICAgICoqTkVWRVIgdXNlZCBhcyB0aGUgd3JhcHBpbmcga2V5IG9uIFNhZmFyaS4qKiBPbiBXZWJLaXRcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZSB0d28gc3RvcmFnZSBhcmVhcyBkbyBub3Qgc2hhcmUgYSBsaWZldGltZSB0aGUgd2F5XG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGV5IGRvIG9uIENocm9taXVtL0dlY2tvLCBzbyBhbiBhZG9wdGVkIEluZGV4ZWREQiBrZXlcbiAqICAgICAgICAgICAgICAgICAgICAgIGlzIG5vdCBhIHNhZmUgd3JhcHBpbmcga2V5IHRoZXJlLiBTYWZhcmkgdGhlcmVmb3JlIGFsd2F5c1xuICogICAgICAgICAgICAgICAgICAgICAgd3JpdGVzIHVuZGVyIGBzZWVkYCAoYnVuZGxlLXNjb3BlZCBgc3RvcmFnZS5sb2NhbGApO1xuICogICAgICAgICAgICAgICAgICAgICAgYWRvcHRlZCBJREIga2V5cyBhcmUgZGVjcnlwdC1vbmx5IGxlZ2FjeSBvbiBTYWZhcmksIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIGF0LXJlc3QgbWlncmF0aW9uIHJlLXdyYXBzIEVWRVJZIGRldmljZSBibG9iIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uIHN0b3JlcyBcdTIwMTQgcHJvZmlsZSBwcml2YXRlIGtleXMsIEFQSS1rZXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMsIHZhdWx0LW5vdGUgYm9kaWVzLCBhbmQgTklQLTQ2IGJ1bmtlciBzZXNzaW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICBzZWNyZXRzIC8gc2Vzc2lvbiBwcml2YXRlIGtleXMgXHUyMDE0IG5vdCBqdXN0IHByb2ZpbGUga2V5cy5cbiAqICAgICAgICAgICAgICAgICAgICAgIChQZXItZW5naW5lIHN0b3JhZ2Utc2NvcGluZyByYXRpb25hbGU6IFBSSVZBVEUgYml6ZG9jc1xuICogICAgICAgICAgICAgICAgICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKiAgICAgICAgYi4gYHNlZWRgICAgXHUyMDE0IDMyIHJhbmRvbSBieXRlcyBpbiBgYnJvd3Nlci5zdG9yYWdlLmxvY2FsYCB1bmRlclxuICogICAgICAgICAgICAgICAgICAgICAgYGRldmljZUtleVNlZWRgLCBpbXBvcnRlZCBhcyBhIG5vbi1leHRyYWN0YWJsZSBBRVMtR0NNXG4gKiAgICAgICAgICAgICAgICAgICAgICBrZXkgYXQgbG9hZC4gVGhpcyBpcyB3aGVyZSBFVkVSWSBuZXcgZGV2aWNlIGtleSBsYW5kcyxcbiAqICAgICAgICAgICAgICAgICAgICAgIG9uIGV2ZXJ5IHBsYXRmb3JtOiB3aGVuIG5vIHByZS1leGlzdGluZyBJREIga2V5IGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICBmb3VuZCB3ZSBkbyBub3QgbWludCBvbmUsIHdlIHNlZWQuIENocm9tZS9GaXJlZm94IGZyZXNoXG4gKiAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxscyB0aGVyZWZvcmUgdXNlIGBzZWVkYCB0b28gXHUyMDE0IG9uZSBjb2RlIHBhdGgsIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIG9ubHkgb25lIHdob3NlIHBlcnNpc3RlbmNlIHdlIGNhbiBhY3R1YWxseSB2ZXJpZnkuXG4gKiAgICAgICAgYy4gYG1lbW9yeWAgXHUyMDE0IGxhc3QgcmVzb3J0ICh1bml0IHRlc3RzLCBzYW5kYm94ZWQgY29udGV4dHMpLiBTZWNyZXRzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVkIGhlcmUgZG8gbm90IHN1cnZpdmUgYSByZWxvYWQuXG4gKlxuICogICAgICBUaGUgcmVzb2x2ZWQgc3RyYXRlZ3kgaXMgU1RJQ0tZOiBpdCBpcyByZWNvcmRlZCBpbiBzdG9yYWdlLmxvY2FsIHVuZGVyXG4gKiAgICAgIGBkZXZpY2VLZXlTdHJhdGVneWAgYW5kIGhvbm91cmVkIG9uIGxhdGVyIGxvYWRzLCBzbyBhIGNvbnRleHQgY2Fubm90XG4gKiAgICAgIHNpbGVudGx5IGZsaXAgc3RyYXRlZ2llcyBhbmQgb3JwaGFuIHRoZSBibG9icyB3cml0dGVuIHVuZGVyIHRoZSBvbGRcbiAqICAgICAgb25lLiBEZWNyeXB0aW9uIGlzIHN5bW1ldHJpYyByZWdhcmRsZXNzOiBgZGVjcnlwdFdpdGhEZXZpY2VLZXlgIHRyaWVzXG4gKiAgICAgIHRoZSBjdXJyZW50IGtleSwgdGhlbiBldmVyeSBvdGhlciBrZXkgdGhpcyBpbnN0YWxsIGNvdWxkIGV2ZXIgaGF2ZSBoYWRcbiAqICAgICAgKGxlZ2FjeSBJREIgaGFuZGxlLCBleGlzdGluZyBzZWVkKSwgYW5kIGNhbGxlcnMgdXNpbmdcbiAqICAgICAgYGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwYCByZS13cmFwIHVuZGVyIHRoZSBjdXJyZW50IHN0cmF0ZWd5LlxuICpcbiAqICAgICAgVGhyZWF0IG1vZGVsLCBob25lc3RseSBzdGF0ZWQ6IHRoZSBwYXNzd29yZGxlc3MgZGV2aWNlIHRpZXIgaXMgYXQtcmVzdFxuICogICAgICBwcm90ZWN0aW9uIGFnYWluc3QgY2FzdWFsIGluc3BlY3Rpb24gb2YgZXh0ZW5zaW9uIHN0b3JhZ2UsIE5PVCBhIGRlZmVuY2VcbiAqICAgICAgYWdhaW5zdCBjb2RlIGFscmVhZHkgZXhlY3V0aW5nIGluIHRoaXMgZXh0ZW5zaW9uJ3MgY29udGV4dC4gVGhlXG4gKiAgICAgIHN0cm9uZ2VzdCB0aWVyIGF2YWlsYWJsZSB0b2RheSBpcyBhICoqbWFzdGVyIHBhc3N3b3JkKiogKGJlbG93KSwgd2hpY2hcbiAqICAgICAgZGVyaXZlcyB0aGUgd3JhcHBpbmcga2V5IGZyb20gYSBzZWNyZXQgdGhhdCBpcyBuZXZlciBzdG9yZWQuIFVzZXJzXG4gKiAgICAgIGhvbGRpbmcgaGlnaC12YWx1ZSBrZXlzIHNob3VsZCBzZXQgb25lLiBBIGhhcmR3YXJlLWJhY2tlZCBkZXZpY2Uga2V5IGlzXG4gKiAgICAgIGZ1dHVyZSB3b3JrLiAoVGllciB0cmFkZW9mZnMgaW4gZnVsbDogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgIGBhcmNoaXRlY3R1cmUvZGV2aWNlLWtleS1zdHJhdGVneS5tZGAuKVxuICpcbiAqICAgMi4gU0VTU0lPTiBLRVkgKG1hc3RlciBwYXNzd29yZCBzZXQgKyB1bmxvY2tlZCkgXHUyMDE0IHRoZSBBRVMtMjU2LUdDTSBrZXlcbiAqICAgICAgZGVyaXZlZCBmcm9tIHRoZSBwYXNzd29yZCAoc2VlIGNyeXB0by5qcykuIFNldCBieSB0aGUgYmFja2dyb3VuZCB3b3JrZXJcbiAqICAgICAgb24gdW5sb2NrIHZpYSBgc2V0U2Vzc2lvbktleWAsIGNsZWFyZWQgb24gbG9jayB2aWEgYGNsZWFyU2Vzc2lvbmAuXG4gKlxuICogQmxvYiBmb3JtYXRzIChib3RoIGFyZSBzZWxmLWRlc2NyaWJpbmcgSlNPTiBzdHJpbmdzKTpcbiAqICAgcGFzc3dvcmQgYmxvYiA6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfVxuICogICBkZXZpY2UgIGJsb2IgOiB7IHY6MSwgazpcImRldmljZVwiLCBpdiwgY2lwaGVydGV4dCB9XG4gKlxuICogYHVud3JhcFNlY3JldGAgcmVmdXNlcyB0byBkZWNyeXB0IHdoZW4gdGhlIHNlc3Npb24gaGFzIGJlZW4gZXhwbGljaXRseSBsb2NrZWRcbiAqIChGNS9GNikgc28gYSBsb2NrZWQgcGFnZSBjYW5ub3QgcmVhZCBzZWNyZXRzLlxuICovXG5cbmltcG9ydCB7IGVuY3J5cHRXaXRoS2V5LCBkZWNyeXB0V2l0aEtleSB9IGZyb20gJy4vY3J5cHRvJztcblxuY29uc3QgSVZfQllURVMgPSAxMjtcbmNvbnN0IERFVklDRV9EQiA9ICdub3N0cmtleS1zZWNyZXQtdmF1bHQnO1xuY29uc3QgREVWSUNFX1NUT1JFID0gJ2tleXMnO1xuY29uc3QgREVWSUNFX0tFWV9JRCA9ICdkZXZpY2Utd3JhcC1rZXktdjEnO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgYmFzZTY0IHJhdyBzZWVkIGZvciB0aGUgYHNlZWRgIHN0cmF0ZWd5LlxuY29uc3QgREVWSUNFX1NFRURfS0VZID0gJ2RldmljZUtleVNlZWQnO1xuY29uc3QgREVWSUNFX1NFRURfQllURVMgPSAzMjtcbi8vIHN0b3JhZ2UubG9jYWwga2V5IGhvbGRpbmcgdGhlIFNUSUNLWSByZXNvbHZlZCBzdHJhdGVneSAoJ2lkYicgfCAnc2VlZCcpLlxuY29uc3QgREVWSUNFX1NUUkFURUdZX0tFWSA9ICdkZXZpY2VLZXlTdHJhdGVneSc7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAoa2VwdCBsb2NhbCBzbyB0aGlzIG1vZHVsZSBoYXMgbm8gY3Jvc3MtZGVwcykgLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBhYlRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5mdW5jdGlvbiBiYXNlNjRUb0FiKGI2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYjY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBTZXNzaW9uIChwYXNzd29yZC1kZXJpdmVkKSBrZXkgc3RhdGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5sZXQgX3Nlc3Npb25LZXkgPSBudWxsOyAgIC8vIENyeXB0b0tleSB8IG51bGxcbmxldCBfc2Vzc2lvblNhbHQgPSBudWxsOyAgLy8gVWludDhBcnJheSB8IG51bGxcbi8vIF91bmxvY2tlZDogbnVsbCA9IHBhc3N3b3JkbGVzcyAvIG5vdCBhcHBsaWNhYmxlIChuZXZlciBsb2NrZWQpLFxuLy8gICAgICAgICAgICB0cnVlID0gdW5sb2NrZWQsIGZhbHNlID0gbG9ja2VkIChyZWZ1c2Ugc2VjcmV0IHJlYWRzKS5cbmxldCBfdW5sb2NrZWQgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2Vzc2lvbktleShjcnlwdG9LZXksIHNhbHQpIHtcbiAgICBfc2Vzc2lvbktleSA9IGNyeXB0b0tleTtcbiAgICBfc2Vzc2lvblNhbHQgPSBzYWx0O1xuICAgIF91bmxvY2tlZCA9IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclNlc3Npb24oKSB7XG4gICAgX3Nlc3Npb25LZXkgPSBudWxsO1xuICAgIF9zZXNzaW9uU2FsdCA9IG51bGw7XG4gICAgX3VubG9ja2VkID0gZmFsc2U7XG59XG5cbi8qKiBFeHBsaWNpdGx5IG1hcmsgdGhlIHNlc3Npb24gdW5sb2NrZWQvbG9ja2VkIHdpdGhvdXQgcHJvdmlkaW5nIGEga2V5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFVubG9ja2VkKHYpIHtcbiAgICBfdW5sb2NrZWQgPSB2ID09PSBudWxsID8gbnVsbCA6ICEhdjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1Nlc3Npb25LZXkoKSB7XG4gICAgcmV0dXJuICEhX3Nlc3Npb25LZXk7XG59XG5cbi8vIC0tLSBEZXZpY2Uga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5sZXQgX2RldmljZUtleVByb21pc2UgPSBudWxsO1xubGV0IF9kZXZpY2VTdHJhdGVneSA9IG51bGw7ICAgLy8gJ2lkYicgfCAnc2VlZCcgfCAnbWVtb3J5JyBcdTIwMTQgc2V0IG9uY2UgcmVzb2x2ZWRcbmxldCBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDsgIC8vIGxhc3QtcmVzb3J0IGtleSBmb3IgY29udGV4dHMgdGhhdCBwZXJzaXN0IG5vdGhpbmdcbmxldCBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gdGhlIHByZS0xLjguMSBJREIga2V5XG5sZXQgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsOyAvLyByZWFkLW9ubHkgaGFuZGxlIG9uIGFuIGV4aXN0aW5nIHNlZWQga2V5XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRGV2aWNlS2V5KCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmdlbmVyYXRlS2V5KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZTogcmF3IGJ5dGVzIGNhbiBuZXZlciBiZSByZWFkIGJhY2sgb3V0XG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhlZERiQXZhaWxhYmxlKCkge1xuICAgIHJldHVybiB0eXBlb2YgaW5kZXhlZERCICE9PSAndW5kZWZpbmVkJyAmJiBpbmRleGVkREIgIT09IG51bGw7XG59XG5cbi8qKlxuICogUHJvdmUgYSBjYW5kaWRhdGUga2V5IGlzIGFjdHVhbGx5IHVzYWJsZSBiZWZvcmUgd2UgdHJ1c3QgYSBzdHJhdGVneSB3aXRoIGFcbiAqIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gQSByZWFkLWJhY2sgaGFuZGxlIHRoYXQgc3RydWN0dXJlZC1jbG9uZVxuICogbWFuZ2xlZCAob3IgYSBzZWVkIHRoYXQgY2FtZSBiYWNrIHRydW5jYXRlZCkgZmFpbHMgaGVyZSBpbnN0ZWFkIG9mIHNpbGVudGx5XG4gKiBwcm9kdWNpbmcgdW5kZWNyeXB0YWJsZSBibG9icy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24ga2V5Um91bmRUcmlwcyhrZXkpIHtcbiAgICBpZiAoIWtleSkgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgICAgICBjb25zdCBwcm9iZSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnbm9zdHJrZXktZGV2aWNlLXByb2JlJyk7XG4gICAgICAgIGNvbnN0IGN0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIHByb2JlKTtcbiAgICAgICAgY29uc3QgcHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgY3QpO1xuICAgICAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHB0KSA9PT0gJ25vc3Rya2V5LWRldmljZS1wcm9iZSc7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5EZXZpY2VEYigpIHtcbiAgICAvLyBMYXp5IGltcG9ydCBzbyB0aGUgbW9kdWxlIHdvcmtzIGluIGNvbnRleHRzL3Rlc3RzIHdpdGhvdXQgaWRiIGJ1bmRsZWQuXG4gICAgY29uc3QgeyBvcGVuREIgfSA9IGF3YWl0IGltcG9ydCgnaWRiJyk7XG4gICAgcmV0dXJuIG9wZW5EQihERVZJQ0VfREIsIDEsIHtcbiAgICAgICAgdXBncmFkZShkKSB7XG4gICAgICAgICAgICBpZiAoIWQub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhERVZJQ0VfU1RPUkUpKSB7XG4gICAgICAgICAgICAgICAgZC5jcmVhdGVPYmplY3RTdG9yZShERVZJQ0VfU1RPUkUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFN0cmF0ZWd5IChhKTogQURPUFQgYSBwcmUtZXhpc3Rpbmcgbm9uLWV4dHJhY3RhYmxlIENyeXB0b0tleSBoYW5kbGUgZnJvbVxuICogSW5kZXhlZERCLiBOZXZlciBtaW50cyBvbmUuXG4gKlxuICogQSBrZXkgdGhhdCBkYi5nZXQoKSBoYW5kcyBiYWNrIGlzIGEga2V5IHNvbWUgRUFSTElFUiBjb250ZXh0IHdyb3RlLCBzbyBpdCBpc1xuICogcHJvb2Ygb2YgY3Jvc3MtY29udGV4dCBwZXJzaXN0ZW5jZSBcdTIwMTQgdGhlIG9uZSB0aGluZyBhIHNhbWUtY29udGV4dFxuICogcHV0XHUyMTkyZ2V0XHUyMTkycm91bmQtdHJpcCBwcm9iZSBjYW4gbmV2ZXIgZXN0YWJsaXNoLiBpT1MgU2FmYXJpJ3MgSW5kZXhlZERCIGlzXG4gKiBmdW5jdGlvbmFsIGJ1dCBlcGhlbWVyYWwgZm9yIHRoZSBleHRlbnNpb24gYmFja2dyb3VuZDogaXQgd291bGQgaGF2ZSBwYXNzZWRcbiAqIHRoZSBwcm9iZSBhbmQgdGhlbiBsb3N0IHRoZSB1c2VyJ3Mgb25seSBjb3B5IG9mIGEgcHJpdmF0ZSBrZXkuIFNvOiBub1xuICogcHJlLWV4aXN0aW5nIGtleSBtZWFucyBubyBgaWRiYCwgYW5kIHRoZSBjYWxsZXIgc2VlZHMgaW5zdGVhZC5cbiAqXG4gKiBSZXR1cm5zIG51bGwgKG5ldmVyIHRocm93cykgd2hlbiBub3RoaW5nIHVzYWJsZSBpcyB0aGVyZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdHJ5SWRiRGV2aWNlS2V5KCkge1xuICAgIGlmICghaW5kZXhlZERiQXZhaWxhYmxlKCkpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgZGIuZ2V0KERFVklDRV9TVE9SRSwgREVWSUNFX0tFWV9JRCk7XG4gICAgICAgIGlmICghZXhpc3RpbmcpIHJldHVybiBudWxsOyAvLyBlbXB0eSBzdG9yZSBcdTIxOTIgc2VlZCwgZG8gTk9UIG1pbnQgaGVyZVxuICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoZXhpc3RpbmcpKSA/IGV4aXN0aW5nIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoZSBzdG9yYWdlIGFyZWEgYmFja2luZyB0aGUgYHNlZWRgIHN0cmF0ZWd5LiBJbXBvcnRlZCBsYXppbHkgYmVjYXVzZVxuICogYnJvd3Nlci1wb2x5ZmlsbCB0aHJvd3MgYXQgbW9kdWxlIGxvYWQgd2hlbiBubyBleHRlbnNpb24gbmFtZXNwYWNlIGV4aXN0cy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VlZFN0b3JhZ2UoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIHJldHVybiBhcGk/LnN0b3JhZ2U/LmxvY2FsIHx8IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqIFNpZ25hbCAyOiBhIFdlYktpdCB1c2VyIGFnZW50IHdpdGggbm8gQ2hyb21pdW0gbWFya2VyIG9uIGl0LiAqL1xuZnVuY3Rpb24gbG9va3NMaWtlV2ViS2l0T25seVVhKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHVhID0gKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQpIHx8ICcnO1xuICAgICAgICByZXR1cm4gL1NhZmFyaXxBcHBsZVdlYktpdC8udGVzdCh1YSkgJiYgIS9DaHJvbShlfGl1bSl8RWRnXFwvfE9QUlxcLy8udGVzdCh1YSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogVHJ1ZSBvbiBTYWZhcmkgKGlPUyArIG1hY09TKSwgd2hlcmUgSW5kZXhlZERCIG11c3QgTkVWRVIgaG9sZCB0aGUgd3JhcHBpbmdcbiAqIGtleSBcdTIwMTQgc2VlIHRoZSBtb2R1bGUgaGVhZGVyJ3Mgc3RvcmFnZS1zY29wZSBub3RlLlxuICpcbiAqIERldGVjdGlvbiBpcyBtdWx0aS1zaWduYWwgYW5kIEJJQVNFRCBUT1dBUkQgU0FGQVJJLCBiZWNhdXNlIHRoZSB0d28gZXJyb3JzXG4gKiBhcmUgbm90IHN5bW1ldHJpYzogc2VlZGluZyBhIENocm9tZSB2YXVsdCBjb3N0cyBub3RoaW5nIChzZWVkIGlzIGFscmVhZHkgdGhlXG4gKiBzdHJhdGVneSBldmVyeSBmcmVzaCBpbnN0YWxsIGxhbmRzIG9uKSwgd2hpbGUgYWRvcHRpbmcgYW4gSURCIGtleSBvbiBTYWZhcmlcbiAqIGlzIHVuc2FmZS4gU28gb25seSBhIFBPU0lUSVZFTFkgaWRlbnRpZmllZCBDaHJvbWUvRmlyZWZveCBvcmlnaW4gbWF5IGFkb3B0IGFuXG4gKiBJbmRleGVkREIga2V5IFx1MjAxNCBhIGdldFVSTCB0aGF0IGlzIG1pc3NpbmcsIHRocm93cywgcmV0dXJucyBhIG5vbi1zdHJpbmcsXG4gKiByZXR1cm5zICcnIG9yIHJldHVybnMgYSBzY2hlbWUgd2UgZG8gbm90IHJlY29nbmlzZSBhbGwgcmVzb2x2ZSB0byBTYWZhcmkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzU2FmYXJpRW5naW5lKCkge1xuICAgIGxldCBvcmlnaW4gPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgYXBpIH0gPSBhd2FpdCBpbXBvcnQoJy4vYnJvd3Nlci1wb2x5ZmlsbCcpO1xuICAgICAgICBjb25zdCB1cmwgPSBhcGk/LnJ1bnRpbWU/LmdldFVSTD8uKCcnKTtcbiAgICAgICAgb3JpZ2luID0gdHlwZW9mIHVybCA9PT0gJ3N0cmluZycgPyB1cmwgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICBvcmlnaW4gPSBudWxsO1xuICAgIH1cbiAgICAvLyBTaWduYWwgMTogYSBwb3NpdGl2ZWx5IGlkZW50aWZpZWQgU2FmYXJpIG9yaWdpbi5cbiAgICBpZiAob3JpZ2luICYmIG9yaWdpbi5zdGFydHNXaXRoKCdzYWZhcmktd2ViLWV4dGVuc2lvbjovLycpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMjogYSBXZWJLaXQtb25seSBVQSBvdXRyYW5rcyB0aGUgb3JpZ2luIFx1MjAxNCBhIFNhZmFyaSBidWlsZCB0aGF0XG4gICAgLy8gcmVwb3J0ZWQgYW4gdW5leHBlY3RlZCBvcmlnaW4gc3RpbGwgbXVzdCBub3QgdG91Y2ggSW5kZXhlZERCLlxuICAgIGlmIChsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU2lnbmFsIDM6IG9ubHkgdGhlc2UgdHdvIG9yaWdpbnMgZWFybiB0aGUgSURCIGFkb3B0IHBhdGguXG4gICAgaWYgKG9yaWdpbiAmJiAob3JpZ2luLnN0YXJ0c1dpdGgoJ2Nocm9tZS1leHRlbnNpb246Ly8nKSB8fCBvcmlnaW4uc3RhcnRzV2l0aCgnbW96LWV4dGVuc2lvbjovLycpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlOyAvLyBhbWJpZ3VvdXMgXHUyMTkyIHNlZWRcbn1cblxuLyoqIEltcG9ydCByYXcgc2VlZCBieXRlcyAoYmFzZTY0KSBhcyBhIG5vbi1leHRyYWN0YWJsZSBBRVMtR0NNIGtleS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGltcG9ydFNlZWRLZXkoc2VlZEI2NCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsIGJhc2U2NFRvQWIoc2VlZEI2NCksIHsgbmFtZTogJ0FFUy1HQ00nIH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGUgb25jZSBpbXBvcnRlZFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbi8qKiBSZWFkIHRoZSBzdGlja3kgc3RyYXRlZ3kgcmVjb3JkZWQgYnkgYSBwcmV2aW91cyByZXNvbHV0aW9uIChudWxsIGlmIG5vbmUpLiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZFN0aWNreVN0cmF0ZWd5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NUUkFURUdZX0tFWV06IG51bGwgfSk7XG4gICAgICAgIGNvbnN0IHMgPSBnb3Q/LltERVZJQ0VfU1RSQVRFR1lfS0VZXTtcbiAgICAgICAgcmV0dXJuIChzID09PSAnaWRiJyB8fCBzID09PSAnc2VlZCcpID8gcyA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqIFJlY29yZCB0aGUgcmVzb2x2ZWQgc3RyYXRlZ3kgc28gbGF0ZXIgbG9hZHMgY2Fubm90IHNpbGVudGx5IGZsaXAgaXQuICovXG5hc3luYyBmdW5jdGlvbiB3cml0ZVN0aWNreVN0cmF0ZWd5KHN0cmF0ZWd5KSB7XG4gICAgaWYgKHN0cmF0ZWd5ICE9PSAnaWRiJyAmJiBzdHJhdGVneSAhPT0gJ3NlZWQnKSByZXR1cm47IC8vICdtZW1vcnknIHBlcnNpc3RzIG5vdGhpbmdcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHN0b3JlLnNldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogc3RyYXRlZ3kgfSk7XG4gICAgfSBjYXRjaCB7IC8qIGJlc3QgZWZmb3J0IFx1MjAxNCB0aGUgc3RyYXRlZ3kgc3RpbGwgcmVzb2x2ZXMgdGhlIHNhbWUgd2F5ICovIH1cbn1cblxuLyoqIFN0cmF0ZWd5IChiKTogYSByYXcgcmFuZG9tIHNlZWQgaW4gc3RvcmFnZS5sb2NhbCwgaW1wb3J0ZWQgbm9uLWV4dHJhY3RhYmxlLiAqL1xuYXN5bmMgZnVuY3Rpb24gdHJ5U2VlZERldmljZUtleSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgIGxldCBzZWVkID0gZ290Py5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgaWYgKCFzZWVkKSB7XG4gICAgICAgICAgICBzZWVkID0gYWJUb0Jhc2U2NChjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KERFVklDRV9TRUVEX0JZVEVTKSkuYnVmZmVyKTtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JlLnNldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBzZWVkIH0pO1xuICAgICAgICAgICAgLy8gVkVSSUZZIHBlcnNpc3RlbmNlIGJlZm9yZSBhbnl0aGluZyBpcyB3cmFwcGVkIHVuZGVyIGl0LlxuICAgICAgICAgICAgY29uc3QgY2hlY2sgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHBlcnNpc3RlZCA9IGNoZWNrPy5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgICAgIGlmIChwZXJzaXN0ZWQgIT09IHNlZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBBbm90aGVyIGNvbnRleHQgKHBvcHVwIHZzIGJhY2tncm91bmQgb24gYSBmaXJzdCBydW4pIG1pbnRlZFxuICAgICAgICAgICAgICAgIC8vIGFuZCB3cm90ZSBpdHMgb3duIHNlZWQgYmV0d2VlbiBvdXIgc2V0KCkgYW5kIHRoaXMgcmVhZC4gQURPUFRcbiAgICAgICAgICAgICAgICAvLyBUSEUgV0lOTkVSOiBhbnkgc2VlZCBhY3R1YWxseSBpbiBzdG9yYWdlIGlzIGV4YWN0bHkgYXMgZ29vZCBhc1xuICAgICAgICAgICAgICAgIC8vIG91cnMsIGFuZCBpdCBpcyB0aGUgb25lIHRoZSBvdGhlciBjb250ZXh0IGlzIGFscmVhZHkgd3JhcHBpbmdcbiAgICAgICAgICAgICAgICAvLyB1bmRlci4gUmV0dXJuaW5nIG51bGwgaGVyZSB3b3VsZCBkcm9wIHRoZSBjYWxsZXIgdGhyb3VnaCB0b1xuICAgICAgICAgICAgICAgIC8vIHRoZSBtZW1vcnkga2V5LCB3aG9zZSBibG9icyBkaWUgd2l0aCB0aGlzIGNvbnRleHQgXHUyMDE0IHRoZSB2ZXJ5XG4gICAgICAgICAgICAgICAgLy8gbG9zcyB0aGlzIHN0cmF0ZWd5IGV4aXN0cyB0byBwcmV2ZW50LiBPbmx5IGEgZ2VudWluZWx5IGFic2VudFxuICAgICAgICAgICAgICAgIC8vIG9yIHVudXNhYmxlIHZhbHVlIGlzIGEgZmFpbHVyZS5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBlcnNpc3RlZCAhPT0gJ3N0cmluZycgfHwgcGVyc2lzdGVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgc2VlZCA9IHBlcnNpc3RlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbXBvcnRTZWVkS2V5KHNlZWQpO1xuICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0IChjcmVhdGluZyBvbiBmaXJzdCB1c2UpIHRoZSBkZXZpY2Ugd3JhcCBrZXkuXG4gKlxuICogUmVzb2x1dGlvbiBvcmRlciwgb25jZTogaG9ub3VyIHRoZSBzdGlja3kgc3RyYXRlZ3kgdGhpcyBpbnN0YWxsIGFscmVhZHlcbiAqIHJlY29yZGVkOyBvdGhlcndpc2UgQURPUFQgYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGtleSBpZiBvbmUgaXMgdGhlcmUsIGFuZFxuICogZmFpbGluZyB0aGF0IHNlZWQuIFdoYXRldmVyIHJlc29sdmVzIGlzIHdyaXR0ZW4gYmFjayBhcyB0aGUgc3RpY2t5IHN0cmF0ZWd5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5KCkge1xuICAgIGlmIChfZGV2aWNlS2V5UHJvbWlzZSkgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RpY2t5ID0gYXdhaXQgcmVhZFN0aWNreVN0cmF0ZWd5KCk7XG5cbiAgICAgICAgLy8gQSB2YXVsdCBhbHJlYWR5IG9uIGBzZWVkYCBuZXZlciByZS1wcm9iZXMgSW5kZXhlZERCOiBpdHMgYmxvYnMgYXJlXG4gICAgICAgIC8vIHVuZGVyIHRoZSBzZWVkIGtleSwgYW5kIGFkb3B0aW5nIGEgc3RyYXkgSURCIGhhbmRsZSB3b3VsZCBvcnBoYW4gdGhlbS5cbiAgICAgICAgLy8gT24gU2FmYXJpIHdlIG5ldmVyIFdSSVRFIHVuZGVyIGFuIElEQiBrZXkgYXQgYWxsIChzZWUgaGVhZGVyKTogaXRzXG4gICAgICAgIC8vIHBlci1lbmdpbmUgc3RvcmFnZSBzY29waW5nIG1ha2VzIGFuIGFkb3B0ZWQgSURCIGhhbmRsZSB1bnNhZmUgYXMgYVxuICAgICAgICAvLyB3cmFwcGluZyBrZXkuIEV4aXN0aW5nIElEQiBibG9icyBzdGF5IHJlYWRhYmxlIHRocm91Z2ggdGhlIGRlY3J5cHRcbiAgICAgICAgLy8gZmFsbGJhY2sgYW5kIGFyZSByZS13cmFwcGVkIHVuZGVyIHRoZSBzZWVkIGJ5IHRoZSBhdC1yZXN0IG1pZ3JhdGlvbi5cbiAgICAgICAgaWYgKHN0aWNreSAhPT0gJ3NlZWQnICYmICEoYXdhaXQgaXNTYWZhcmlFbmdpbmUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkYktleSA9IGF3YWl0IHRyeUlkYkRldmljZUtleSgpO1xuICAgICAgICAgICAgaWYgKGlkYktleSkge1xuICAgICAgICAgICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdpZGInO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdyaXRlU3RpY2t5U3RyYXRlZ3koJ2lkYicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpZGJLZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWVkS2V5ID0gYXdhaXQgdHJ5U2VlZERldmljZUtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkge1xuICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ3NlZWQnO1xuICAgICAgICAgICAgLy8gQWxzbyBjb3ZlcnMgdGhlIGRlZ3JhZGUgY2FzZTogc3RpY2t5IHdhcyAnaWRiJyBidXQgdGhlIGhhbmRsZSBpc1xuICAgICAgICAgICAgLy8gZ29uZS4gT2xkIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdCBmYWxsYmFjayBiZWxvdy5cbiAgICAgICAgICAgIGF3YWl0IHdyaXRlU3RpY2t5U3RyYXRlZ3koJ3NlZWQnKTtcbiAgICAgICAgICAgIHJldHVybiBzZWVkS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90aGluZyBwZXJzaXN0cyBoZXJlLiBCZXR0ZXIgdGhhbiByZWZ1c2luZyB0byBlbmNyeXB0LCBidXQgYmxvYnNcbiAgICAgICAgLy8gd3JpdHRlbiB1bmRlciB0aGlzIGtleSBkaWUgd2l0aCB0aGUgY29udGV4dCBcdTIwMTQgc2VlIG1vZHVsZSBoZWFkZXIuXG4gICAgICAgIGlmICghX21lbW9yeURldmljZUtleSkgX21lbW9yeURldmljZUtleSA9IGF3YWl0IGdlbmVyYXRlRGV2aWNlS2V5KCk7XG4gICAgICAgIF9kZXZpY2VTdHJhdGVneSA9ICdtZW1vcnknO1xuICAgICAgICByZXR1cm4gX21lbW9yeURldmljZUtleTtcbiAgICB9KSgpO1xuICAgIHJldHVybiBfZGV2aWNlS2V5UHJvbWlzZTtcbn1cblxuLyoqIFdoaWNoIHBlcnNpc3RlbmNlIHN0cmF0ZWd5IHRoZSBkZXZpY2Uga2V5IHJlc29sdmVkIHRvIChudWxsIHVudGlsIHJlc29sdmVkKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXZpY2VLZXlTdHJhdGVneSgpIHtcbiAgICByZXR1cm4gX2RldmljZVN0cmF0ZWd5O1xufVxuXG4vKipcbiAqIERyb3AgZXZlcnkgbWVtb2lzZWQgZGV2aWNlLWtleSBoYW5kbGUuIE1VU1QgYmUgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIGFueVxuICogYHN0b3JhZ2UuY2xlYXIoKWA6IHRoZSBzZWVkIChhbmQgdGhlIHN0aWNreSBzdHJhdGVneSkgYXJlIGdvbmUgZnJvbSBzdG9yYWdlLFxuICogc28gYSBjYWNoZWQgcHJvbWlzZSB3b3VsZCBrZWVwIGhhbmRpbmcgb3V0IGEga2V5IHdob3NlIGJhY2tpbmcgbWF0ZXJpYWwgbm9cbiAqIGxvbmdlciBleGlzdHMgXHUyMDE0IHRoZSBuZXh0IGdldERldmljZUtleSgpIHdvdWxkIHdyYXAgc2VjcmV0cyB1bmRlciBhIGtleSB0aGF0XG4gKiBkaWVzIHdpdGggdGhpcyBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZXZpY2VLZXkoKSB7XG4gICAgX2RldmljZUtleVByb21pc2UgPSBudWxsO1xuICAgIF9kZXZpY2VTdHJhdGVneSA9IG51bGw7XG4gICAgX21lbW9yeURldmljZUtleSA9IG51bGw7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSBudWxsO1xuICAgIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlID0gbnVsbDtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIGEgcHJlLWV4aXN0aW5nIEluZGV4ZWREQiBkZXZpY2Uga2V5LCB1c2VkIG9ubHkgYXMgYVxuICogZGVjcnlwdCBmYWxsYmFjayBmb3IgYmxvYnMgd3JpdHRlbiBiZWZvcmUgdGhpcyBjb250ZXh0IGNoYW5nZWQgc3RyYXRlZ3kuXG4gKiBOZXZlciBjcmVhdGVzIG9uZS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0TGVnYWN5SWRiS2V5KCkge1xuICAgIGlmIChfbGVnYWN5SWRiS2V5UHJvbWlzZSkgcmV0dXJuIF9sZWdhY3lJZGJLZXlQcm9taXNlO1xuICAgIF9sZWdhY3lJZGJLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBkYiA9IGF3YWl0IG9wZW5EZXZpY2VEYigpO1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgZGIuZ2V0KERFVklDRV9TVE9SRSwgREVWSUNFX0tFWV9JRCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG59XG5cbi8qKlxuICogUmVhZC1vbmx5IGFjY2VzcyB0byB0aGUga2V5IGFuIEVYSVNUSU5HIGBkZXZpY2VLZXlTZWVkYCBpbXBvcnRzIHRvLCB1c2VkIG9ubHlcbiAqIGFzIGEgZGVjcnlwdCBmYWxsYmFjay4gTmV2ZXIgbWludHMgYSBzZWVkICh0aGF0IGlzIHRyeVNlZWREZXZpY2VLZXkncyBqb2IpLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRFeGlzdGluZ1NlZWRLZXkoKSB7XG4gICAgaWYgKF9leGlzdGluZ1NlZWRLZXlQcm9taXNlKSByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IHNlZWRTdG9yYWdlKCk7XG4gICAgICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZ290ID0gYXdhaXQgc3RvcmUuZ2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IG51bGwgfSk7XG4gICAgICAgICAgICBjb25zdCBzZWVkID0gZ290Py5bREVWSUNFX1NFRURfS0VZXTtcbiAgICAgICAgICAgIGlmICghc2VlZCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBpbXBvcnRTZWVkS2V5KHNlZWQpO1xuICAgICAgICAgICAgcmV0dXJuIChhd2FpdCBrZXlSb3VuZFRyaXBzKGtleSkpID8ga2V5IDogbnVsbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9leGlzdGluZ1NlZWRLZXlQcm9taXNlO1xufVxuXG4vKipcbiAqIEV2ZXJ5IE9USEVSIGtleSB0aGlzIGluc3RhbGwgY291bGQgaGF2ZSB3cmFwcGVkIGEgZGV2aWNlIGJsb2IgdW5kZXIsIGluXG4gKiBwcmVmZXJlbmNlIG9yZGVyLiBTdHJhdGVneSBmbGlwcyAoaWRiXHUyMTkyc2VlZCBvbiBkZWdyYWRlLCBzZWVkXHUyMTkyaWRiIG9uIGFuXG4gKiBhZG9wdGVkIGhhbmRsZSkgbXVzdCBuZXZlciBvcnBoYW4gYSBibG9iLCBzbyB0aGUgZmFsbGJhY2sgaXMgc3ltbWV0cmljOiBhXG4gKiBzZWVkIGJsb2Igc3RheXMgcmVhZGFibGUgd2hpbGUgdGhlIHN0cmF0ZWd5IGlzICdpZGInIGFuZCB2aWNlIHZlcnNhLlxuICovXG5hc3luYyBmdW5jdGlvbiBmYWxsYmFja0RldmljZUtleXMoKSB7XG4gICAgY29uc3Qga2V5cyA9IFtdO1xuICAgIGlmIChfZGV2aWNlU3RyYXRlZ3kgIT09ICdpZGInKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FjeSA9IGF3YWl0IGdldExlZ2FjeUlkYktleSgpO1xuICAgICAgICBpZiAobGVnYWN5KSBrZXlzLnB1c2gobGVnYWN5KTtcbiAgICB9XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ3NlZWQnKSB7XG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCBnZXRFeGlzdGluZ1NlZWRLZXkoKTtcbiAgICAgICAgaWYgKHNlZWRLZXkpIGtleXMucHVzaChzZWVkS2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRldmljZSBibG9iIHdpdGggdGhlIGN1cnJlbnQga2V5LCBmYWxsaW5nIGJhY2sgdG8gZXZlcnkgb3RoZXIga2V5XG4gKiB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkLiBSZXR1cm5zIHRoZSBwbGFpbnRleHQgcGx1cyB3aGV0aGVyIGEgZmFsbGJhY2sga2V5XG4gKiB3YXMgbmVlZGVkIChpLmUuIHRoZSBibG9iIGlzIHN0YWxlIGFuZCB3b3J0aCByZS13cmFwcGluZykuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHsgcGxhaW50ZXh0OiBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYldpdGgoa2V5LCBpdiwgY2lwaGVydGV4dCksIHN0YWxlOiBmYWxzZSB9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZm9yIChjb25zdCBmYWxsYmFjayBvZiBhd2FpdCBmYWxsYmFja0RldmljZUtleXMoKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChmYWxsYmFjaywgaXYsIGNpcGhlcnRleHQpLFxuICAgICAgICAgICAgICAgICAgICBzdGFsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjYXRjaCB7IC8qIHRyeSB0aGUgbmV4dCBvbmUgKi8gfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7IC8vIHJlcG9ydCB0aGUgQ1VSUkVOVCBrZXkncyBmYWlsdXJlLCBub3QgdGhlIGxhc3QgZmFsbGJhY2snc1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkge1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGdldERldmljZUtleSgpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LCBrZXksIGVuYy5lbmNvZGUocGxhaW50ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHY6IDEsXG4gICAgICAgIGs6ICdkZXZpY2UnLFxuICAgICAgICBpdjogYWJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFiVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSB7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BYihpdikpIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgYmFzZTY0VG9BYihjaXBoZXJ0ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhEZXZpY2VLZXkoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgLy8gR0NNIGF1dGhlbnRpY2F0aW9uIGNhbiBmYWlsIHdpdGggdGhlIENVUlJFTlQgc3RyYXRlZ3kncyBrZXkgYmVjYXVzZSB0aGVcbiAgICAvLyBibG9iIHByZWRhdGVzIGEgc3RyYXRlZ3kgY2hhbmdlIChhIENocm9tZS9GaXJlZm94IHZhdWx0IHdob3NlIElEQiBoYW5kbGVcbiAgICAvLyBpcyBzdGlsbCByZWFkYWJsZSB3aGlsZSB0aGlzIGNvbnRleHQgc2V0dGxlZCBvbiB0aGUgc2VlZCwgb3IgdGhlIHJldmVyc2UpLlxuICAgIC8vIFRyeSBldmVyeSBrZXkgdGhpcyBpbnN0YWxsIGhhcyBldmVyIGhhZCBiZWZvcmUgZGVjbGFyaW5nIHRoZSBzZWNyZXQgbG9zdC5cbiAgICBjb25zdCB7IHBsYWludGV4dCB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiBwbGFpbnRleHQ7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGRldmljZSBibG9iIGFuZCwgd2hlbiBpdCBjb3VsZCBvbmx5IGJlIHJlYWQgdmlhIGEgZmFsbGJhY2sga2V5XG4gKiAobGVnYWN5IEluZGV4ZWREQiBoYW5kbGUsIG9yIGFuIGV4aXN0aW5nIHNlZWQgd2hpbGUgdGhlIHN0cmF0ZWd5IGlzICdpZGInKSxcbiAqIGhhbmQgYmFjayBhIHJlcGxhY2VtZW50IGJsb2Igd3JhcHBlZCB1bmRlciB0aGUgQ1VSUkVOVCBzdHJhdGVneSBzbyB0aGUgY2FsbGVyXG4gKiBjYW4gcGVyc2lzdCB0aGUgdXBncmFkZSBvcHBvcnR1bmlzdGljYWxseS5cbiAqIGByZXdyYXBwZWRgIGlzIG51bGwgd2hlbiB0aGUgYmxvYiBpcyBhbHJlYWR5IGN1cnJlbnQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0RGV2aWNlQmxvYkZvclJld3JhcChlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCB7IHBsYWludGV4dCwgc3RhbGUgfSA9IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iQW55S2V5KGl2LCBjaXBoZXJ0ZXh0KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwbGFpbnRleHQsXG4gICAgICAgIHJld3JhcHBlZDogc3RhbGUgPyBhd2FpdCBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIDogbnVsbCxcbiAgICB9O1xufVxuXG4vLyAtLS0gQmxvYiBjbGFzc2lmaWNhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuc2FsdCAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCAmJiBwLmsgIT09ICdkZXZpY2UnKTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldmljZUtleUJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5rID09PSAnZGV2aWNlJyAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG4vKiogVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYWxyZWFkeSBjaXBoZXJ0ZXh0IChlaXRoZXIgd3JhcHBpbmcpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2lwaGVydGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkgfHwgaXNEZXZpY2VLZXlCbG9iKHZhbHVlKTtcbn1cblxuLy8gLS0tIFVuaWZpZWQgd3JhcCAvIHVud3JhcCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgc2VjcmV0IGZvciBhdC1yZXN0IHN0b3JhZ2UuIFByZWZlcnMgdGhlIHBhc3N3b3JkLWRlcml2ZWQgc2Vzc2lvblxuICoga2V5IHdoZW4gb25lIGlzIGF2YWlsYWJsZSBpbiB0aGlzIGNvbnRleHQgKGJhY2tncm91bmQsIHVubG9ja2VkKTsgb3RoZXJ3aXNlXG4gKiBmYWxscyBiYWNrIHRvIHRoZSBhbHdheXMtYXZhaWxhYmxlIGRldmljZSBrZXkuIE5ldmVyIHJldHVybnMgcGxhaW50ZXh0LlxuICpcbiAqIFRoZSB0aWVyIGlzIHRoZXJlZm9yZSBBTUJJRU5UIFx1MjAxNCBpdCBpcyB3aGF0ZXZlciBgc2V0U2Vzc2lvbktleWAgLyBgY2xlYXJTZXNzaW9uYFxuICogbGFzdCBkaWQgaW4gdGhpcyBtb2R1bGUsIHdoaWNoIG1heSBoYXZlIGJlZW4gZG9uZSBieSBhIGRpZmZlcmVudCBmaWxlLiBPbmx5XG4gKiBjYWxsIHRoaXMgd2hlcmUgZWl0aGVyIHRpZXIgaXMgZ2VudWluZWx5IGFjY2VwdGFibGUgKGEgdmFsdWUgdGhhdFxuICogYHVud3JhcFNlY3JldGAgY2FuIG9wZW4gdW5kZXIgYm90aCkuIEEgY2FsbGVyIHRoYXQgbmVlZHMgYSBTUEVDSUZJQyB0aWVyIG11c3RcbiAqIG5hbWUgaXQ6IGBlbmNyeXB0V2l0aERldmljZUtleWAgb3IgYGVuY3J5cHRXaXRoS2V5YC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBTZWNyZXQocGxhaW50ZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBwbGFpbnRleHQgIT09ICdzdHJpbmcnIHx8IHBsYWludGV4dC5sZW5ndGggPT09IDApIHJldHVybiBwbGFpbnRleHQ7XG4gICAgaWYgKGlzQ2lwaGVydGV4dChwbGFpbnRleHQpKSByZXR1cm4gcGxhaW50ZXh0OyAvLyBhbHJlYWR5IHdyYXBwZWQgXHUyMDE0IGRvbid0IGRvdWJsZS13cmFwXG4gICAgaWYgKF9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHJldHVybiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIF9zZXNzaW9uS2V5LCBfc2Vzc2lvblNhbHQpO1xuICAgIH1cbiAgICByZXR1cm4gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGFuIGF0LXJlc3Qgc2VjcmV0LiBSZWZ1c2VzIHdoZW4gdGhlIHNlc3Npb24gaXMgZXhwbGljaXRseSBsb2NrZWQuXG4gKiBMZWdhY3kgcGxhaW50ZXh0IHZhbHVlcyBhcmUgcmV0dXJuZWQgdW5jaGFuZ2VkICh0cmFuc2l0aW9uYWwgXHUyMDE0IGNhbGxlcnMgc2hvdWxkXG4gKiByZS13cmFwIG9uIG5leHQgd3JpdGU7IHNlZSBtaWdyYXRpb24gcGF0aHMpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdW53cmFwU2VjcmV0KHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgdmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKCFpc0NpcGhlcnRleHQodmFsdWUpKSByZXR1cm4gdmFsdWU7IC8vIGxlZ2FjeSBwbGFpbnRleHQgcGFzc3Rocm91Z2hcbiAgICBpZiAoX3VubG9ja2VkID09PSBmYWxzZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2tlZDogc2Vzc2lvbiBpcyBsb2NrZWQgXHUyMDE0IGNhbm5vdCByZWFkIHNlY3JldCcpO1xuICAgIH1cbiAgICBpZiAoaXNEZXZpY2VLZXlCbG9iKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdFdpdGhEZXZpY2VLZXkodmFsdWUpO1xuICAgIH1cbiAgICAvLyBwYXNzd29yZCBibG9iXG4gICAgaWYgKCFfc2Vzc2lvbktleSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvY2tlZDogbm8gc2Vzc2lvbiBrZXkgYXZhaWxhYmxlIHRvIGRlY3J5cHQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0V2l0aEtleSh2YWx1ZSwgX3Nlc3Npb25LZXkpO1xufVxuIiwgIi8qKlxuICogRW5jcnlwdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5IG1hc3RlciBwYXNzd29yZCBmZWF0dXJlLlxuICpcbiAqIFVzZXMgV2ViIENyeXB0byBBUEkgKGNyeXB0by5zdWJ0bGUpIGV4Y2x1c2l2ZWx5IFx1MjAxNCBubyBleHRlcm5hbCBsaWJyYXJpZXMuXG4gKiAtIFBCS0RGMiB3aXRoIDYwMCwwMDAgaXRlcmF0aW9ucyAoT1dBU1AgMjAyMyByZWNvbW1lbmRhdGlvbilcbiAqIC0gQUVTLTI1Ni1HQ00gZm9yIGF1dGhlbnRpY2F0ZWQgZW5jcnlwdGlvblxuICogLSBSYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpIHBlciBvcGVyYXRpb25cbiAqIC0gQWxsIGJpbmFyeSBkYXRhIGVuY29kZWQgYXMgYmFzZTY0IGZvciBKU09OIHN0b3JhZ2UgY29tcGF0aWJpbGl0eVxuICovXG5cbmNvbnN0IFBCS0RGMl9JVEVSQVRJT05TID0gNjAwXzAwMDtcbmNvbnN0IFNBTFRfQllURVMgPSAxNjtcbmNvbnN0IElWX0JZVEVTID0gMTI7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBLZXkgZGVyaXZhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBEZXJpdmUgYW4gQUVTLTI1Ni1HQ00gQ3J5cHRvS2V5IGZyb20gYSBwYXNzd29yZCBhbmQgc2FsdCB1c2luZyBQQktERjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcnxVaW50OEFycmF5fSBzYWx0IC0gMTYtYnl0ZSBzYWx0XG4gKiBAcGFyYW0ge3tleHRyYWN0YWJsZT86IGJvb2xlYW59fSBbb3B0aW9uc10gLSBgZXh0cmFjdGFibGU6IHRydWVgIGFsbG93cyB0aGVcbiAqICAgICAgICByYXcgYnl0ZXMgdG8gYmUgZXhwb3J0ZWQgb25jZSAoc2VlIGV4cG9ydEtleUJhc2U2NCkuIFVzZWQgYnkgdGhlXG4gKiAgICAgICAgYmFja2dyb3VuZCB3b3JrZXIgc28gYW4gdW5sb2NrZWQgc2Vzc2lvbiBjYW4gYmUgcGFya2VkIGluXG4gKiAgICAgICAgc3RvcmFnZS5zZXNzaW9uIGFuZCBmdWxseSByZXN0b3JlZCBhZnRlciBhbiBNVjMgZXZpY3Rpb24uIERlZmF1bHRcbiAqICAgICAgICBmYWxzZTogdGhlIGtleSBpcyBvcGFxdWUgYW5kIGNhbm5vdCBsZWF2ZSB0aGUgY3J5cHRvIHN1YnN5c3RlbS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59IEFFUy0yNTYtR0NNIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0LCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVLZXknXVxuICAgICk7XG5cbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5kZXJpdmVLZXkoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdDogc2FsdCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBzYWx0IDogbmV3IFVpbnQ4QXJyYXkoc2FsdCksXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICAhIW9wdGlvbnMuZXh0cmFjdGFibGUsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vKipcbiAqIEV4cG9ydCBhbiBleHRyYWN0YWJsZSBBRVMga2V5J3MgcmF3IGJ5dGVzIGFzIGJhc2U2NC5cbiAqIE9ubHkgZXZlciBjYWxsZWQgb24gYSBrZXkgZGVyaXZlZCB3aXRoIGB7IGV4dHJhY3RhYmxlOiB0cnVlIH1gLlxuICpcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IGJhc2U2NCByYXcga2V5IGJ5dGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRLZXlCYXNlNjQoa2V5KSB7XG4gICAgcmV0dXJuIGFycmF5QnVmZmVyVG9CYXNlNjQoYXdhaXQgY3J5cHRvLnN1YnRsZS5leHBvcnRLZXkoJ3JhdycsIGtleSkpO1xufVxuXG4vKipcbiAqIEltcG9ydCBiYXNlNjQgcmF3IGJ5dGVzIGJhY2sgaW50byBhIE5PTi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTSBrZXkuXG4gKiBUaGUgY291bnRlcnBhcnQgb2YgZXhwb3J0S2V5QmFzZTY0OiB3aGF0ZXZlciB3ZW50IG91dCBleHRyYWN0YWJsZSBjb21lcyBiYWNrXG4gKiBvcGFxdWUsIHNvIGEgcmVzdG9yZWQgc2Vzc2lvbiBrZXkgY2Fubm90IGJlIHJlLWV4cG9ydGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlNjQgLSByYXcga2V5IGJ5dGVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW1wb3J0S2V5QmFzZTY0KGJhc2U2NCkge1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vKiogYmFzZTY0IFx1MjE5NCBieXRlcywgZXhwb3J0ZWQgc28gY2FsbGVycyBjYW4gcm91bmQtdHJpcCBhIHNhbHQgdGhyb3VnaCBKU09OLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpIHtcbiAgICAvLyBgbmV3IFVpbnQ4QXJyYXkodmlldylgIGluc2lkZSB0aGUgaGVscGVyIGNvcGllcyB0aGUgVklFVywgc28gYSBzYWx0IHRoYXRcbiAgICAvLyBpcyBhIHdpbmRvdyBpbnRvIGEgbGFyZ2VyIGJ1ZmZlciBzdGlsbCBlbmNvZGVzIGNvcnJlY3RseS5cbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChieXRlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J5dGVzKGJhc2U2NCkge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkpO1xufVxuXG4vLyAtLS0gRW5jcnlwdCB3aXRoIHByZS1kZXJpdmVkIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgYW5kIGl0cyBzYWx0LlxuICpcbiAqIFRoaXMgYXZvaWRzIGhvbGRpbmcgdGhlIHJhdyBwYXNzd29yZCBpbiBtZW1vcnkgXHUyMDE0IHRoZSBjYWxsZXIgZGVyaXZlcyB0aGVcbiAqIGtleSBvbmNlICh2aWEgZGVyaXZlS2V5KSBhbmQgcmV1c2VzIGl0IGZvciB0aGUgc2Vzc2lvbi4gIFRoZSBvdXRwdXRcbiAqIGZvcm1hdCBpcyBpZGVudGljYWwgdG8gZW5jcnlwdCgpLCBzbyBkZWNyeXB0KCkgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aFxuICogdGhlIG9yaWdpbmFsIHBhc3N3b3JkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgICAgICAgICAgLSBUaGUgZGF0YSB0byBlbmNyeXB0XG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5IGZyb20gZGVyaXZlS2V5KClcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdCAgICAgICAgICAgLSBUaGUgc2FsdCB0aGF0IHdhcyB1c2VkIHRvIGRlcml2ZSBga2V5YFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwga2V5LCBzYWx0KSB7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgLyBEZWNyeXB0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHdpdGggYSBwYXNzd29yZC5cbiAqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpLCBkZXJpdmVzIGFuXG4gKiBBRVMtMjU2LUdDTSBrZXkgdmlhIFBCS0RGMiwgYW5kIHJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nXG4gKiBiYXNlNjQtZW5jb2RlZCBzYWx0LCBpdiwgYW5kIGNpcGhlcnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAtIFRoZSBkYXRhIHRvIGVuY3J5cHQgKGUuZy4gaGV4IHByaXZhdGUga2V5KVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dCwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KTtcblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IChpZ25vcmVzIHRoZSBzYWx0IGVtYmVkZGVkIGluIHRoZVxuICogYmxvYiBcdTIwMTQgdGhlIGNhbGxlciBtdXN0IHN1cHBseSBhIGtleSB0aGF0IG1hdGNoZXMgaG93IHRoZSBibG9iIHdhcyBlbmNyeXB0ZWQpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KCkvZW5jcnlwdFdpdGhLZXkoKVxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRXaXRoS2V5KGVuY3J5cHRlZERhdGEsIGtleSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB0aGF0IHdhcyBlbmNyeXB0ZWQgd2l0aCBgZW5jcnlwdCgpYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAgICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFzc3dvcmQgaXMgd3Jvbmcgb3IgZGF0YSBpcyB0YW1wZXJlZCB3aXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcblxuICAgIGNvbnN0IHNhbHRCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHRCdWYpO1xuXG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICByZXR1cm4gZGVjLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8vIC0tLSBQYXNzd29yZCBoYXNoaW5nIChmb3IgdmVyaWZpY2F0aW9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBIYXNoIGEgcGFzc3dvcmQgd2l0aCBQQktERjIgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIHByb2R1Y2VzIGEgc2VwYXJhdGUgaGFzaCAobm90IHRoZSBlbmNyeXB0aW9uIGtleSkgdGhhdCBjYW4gYmUgc3RvcmVkXG4gKiB0byB2ZXJpZnkgdGhlIHBhc3N3b3JkIHdpdGhvdXQgbmVlZGluZyB0byBhdHRlbXB0IGRlY3J5cHRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtVaW50OEFycmF5fSBbc2FsdF0gLSBPcHRpb25hbCBzYWx0OyBnZW5lcmF0ZWQgaWYgb21pdHRlZFxuICogQHJldHVybnMge1Byb21pc2U8eyBoYXNoOiBzdHJpbmcsIHNhbHQ6IHN0cmluZyB9Pn0gYmFzZTY0LWVuY29kZWQgaGFzaCBhbmQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBzYWx0ID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlQml0cyddXG4gICAgKTtcblxuICAgIGNvbnN0IGhhc2hCaXRzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIDI1NlxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBoYXNoOiBhcnJheUJ1ZmZlclRvQmFzZTY0KGhhc2hCaXRzKSxcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgYSBzdG9yZWQgaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAtIFRoZSBwYXNzd29yZCB0byB2ZXJpZnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRIYXNoIC0gYmFzZTY0LWVuY29kZWQgaGFzaCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkU2FsdCAtIGJhc2U2NC1lbmNvZGVkIHNhbHQgZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFRydWUgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRIYXNoLCBzdG9yZWRTYWx0KSB7XG4gICAgY29uc3QgeyBoYXNoIH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZFNhbHQpO1xuICAgIHJldHVybiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChoYXNoLCBzdG9yZWRIYXNoKTtcbn1cblxuLyoqXG4gKiBDb25zdGFudC10aW1lIGNvbXBhcmlzb24gb2YgdHdvIGJhc2U2NC1lbmNvZGVkIGJ5dGUgc3RyaW5ncy5cbiAqXG4gKiBEZWNvZGVzIGJvdGggdG8gcmF3IGJ5dGVzIGFuZCBjb21wYXJlcyB3aXRoIGFuIGFjY3VtdWxhdG9yIHNvIHRoZSBydW5uaW5nXG4gKiB0aW1lIGRvZXMgbm90IGRlcGVuZCBvbiB3aGVyZSB0aGUgZmlyc3QgbWlzbWF0Y2ggb2NjdXJzIFx1MjAxNCB0aGlzIGF2b2lkcyB0aGVcbiAqIHRpbWluZyBzaWRlLWNoYW5uZWwgb2YgYSBwbGFpbiBgPT09YCBzdHJpbmcgY29tcGFyZSAoVGllci0zIGNyeXB0by5qczoyMTMpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoYSwgYikge1xuICAgIGxldCBiYSwgYmI7XG4gICAgdHJ5IHtcbiAgICAgICAgYmEgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGEpKTtcbiAgICAgICAgYmIgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGIpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBDb21wYXJlIHRoZSBtYXggbGVuZ3RoIHNvIGxlbmd0aCBkaWZmZXJlbmNlcyBkb24ndCBzaG9ydC1jaXJjdWl0IGVhcmx5LlxuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KGJhLmxlbmd0aCwgYmIubGVuZ3RoKTtcbiAgICBsZXQgZGlmZiA9IGJhLmxlbmd0aCBeIGJiLmxlbmd0aDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGRpZmYgfD0gKGJhW2ldIHx8IDApIF4gKGJiW2ldIHx8IDApO1xuICAgIH1cbiAgICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cbiIsICIvKipcbiAqIGJ1bmtlcjovLyBjb25uZWN0aW9uIHN0cmluZ3MuIE5vIGltcG9ydHMsIHNvIGFueXRoaW5nIHRoYXQgaGFuZGxlcyBwcm9maWxlc1xuICogY2FuIHVzZSB0aGlzIHdpdGhvdXQgbG9hZGluZyB0aGUgcmVsYXkgY29kZS5cbiAqXG4gKiBGb3JtYXQ6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PXdzczovLy4uLiZyZWxheT13c3M6Ly8uLi4mc2VjcmV0PTxvcHRpb25hbD5cbiAqL1xuXG4vKipcbiAqIFBhcnNlIGEgYnVua2VyOi8vIGNvbm5lY3Rpb24gc3RyaW5nXG4gKiBGb3JtYXQ6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PXdzczovLy4uLiZyZWxheT13c3M6Ly8uLi4mc2VjcmV0PTxvcHRpb25hbD5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQnVua2VyVXJsKHVybCkge1xuICAgIGlmICghdXJsLnN0YXJ0c1dpdGgoJ2J1bmtlcjovLycpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBtdXN0IHN0YXJ0IHdpdGggYnVua2VyOi8vJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIGNvbnN0IHJlbW90ZVB1YmtleSA9IHBhcnNlZC5ob3N0bmFtZSB8fCBwYXJzZWQucGF0aG5hbWUucmVwbGFjZSgnLy8nLCAnJyk7XG5cbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnVua2VyIFVSTDogcHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgICB9XG5cbiAgICBjb25zdCByZWxheXMgPSBwYXJzZWQuc2VhcmNoUGFyYW1zLmdldEFsbCgncmVsYXknKTtcbiAgICBpZiAocmVsYXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYnVua2VyIFVSTDogYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgcmVsYXkgVVJMc1xuICAgIGZvciAoY29uc3QgcmVsYXkgb2YgcmVsYXlzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByID0gbmV3IFVSTChyZWxheSk7XG4gICAgICAgICAgICBpZiAoci5wcm90b2NvbCAhPT0gJ3dzczonICYmIHIucHJvdG9jb2wgIT09ICd3czonKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlbGF5IHByb3RvY29sOiAke3IucHJvdG9jb2x9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZWxheSBVUkw6ICR7cmVsYXl9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzZWNyZXQgPSBwYXJzZWQuc2VhcmNoUGFyYW1zLmdldCgnc2VjcmV0JykgfHwgbnVsbDtcblxuICAgIHJldHVybiB7IHJlbW90ZVB1YmtleSwgcmVsYXlzLCBzZWNyZXQgfTtcbn1cblxuLyoqXG4gKiBBIHJlbGF5IHZhbHVlIHdpdGhvdXQgY3JlZGVudGlhbHM6IG5vIHVzZXJpbmZvLCBubyBgc2VjcmV0YCBwYXJhbSwgbm8gZnJhZ21lbnQuXG4gKiBPdGhlciBxdWVyeSBwYXJhbXMgc3RheS4gQSB2YWx1ZSB3aXRoIG5vbmUgb2YgdGhvc2UgY29tZXMgYmFjayB1bmNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGNsZWFuUmVsYXkocmVsYXkpIHtcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlbGF5KTtcbiAgICBjb25zdCBuYW1lcyA9IFsuLi51cmwuc2VhcmNoUGFyYW1zLmtleXMoKV0uZmlsdGVyKG5hbWUgPT4gbmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VjcmV0Jyk7XG4gICAgaWYgKCF1cmwudXNlcm5hbWUgJiYgIXVybC5wYXNzd29yZCAmJiAhdXJsLmhhc2ggJiYgbmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm4gcmVsYXk7XG4gICAgdXJsLnVzZXJuYW1lID0gJyc7XG4gICAgdXJsLnBhc3N3b3JkID0gJyc7XG4gICAgdXJsLmhhc2ggPSAnJztcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgbmFtZXMpIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKG5hbWUpO1xuICAgIHJldHVybiB1cmwuaHJlZjtcbn1cblxuLyoqXG4gKiBEb2VzIHRoaXMgY29ubmVjdGlvbiBzdHJpbmcgY2FycnkgYSBzZWNyZXQgcmVkYWN0QnVua2VyVXJsIHdvdWxkIHJlbW92ZSwgaW4gaXRzXG4gKiBgc2VjcmV0YCBwYXJhbSBvciBpbnNpZGUgYSByZWxheSB2YWx1ZT8gTmV2ZXIgdGhyb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyVXJsSGFzU2VjcmV0KHVybCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgc2VjcmV0LCByZWxheXMgfSA9IHBhcnNlQnVua2VyVXJsKHVybCk7XG4gICAgICAgIHJldHVybiAhIXNlY3JldCB8fCByZWxheXMuc29tZShyZWxheSA9PiBjbGVhblJlbGF5KHJlbGF5KSAhPT0gcmVsYXkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5jb25zdCBlbmNvZGVSZWxheSA9IChyZWxheSkgPT5cbiAgICBlbmNvZGVVUklDb21wb25lbnQocmVsYXkpLnJlcGxhY2UoLyUzQS9nLCAnOicpLnJlcGxhY2UoLyUyRi9nLCAnLycpO1xuXG4vKipcbiAqIFRoZSBzaWduZXIncyBhZGRyZXNzIGFsb25lOiBidW5rZXI6Ly88cHVia2V5Pj9yZWxheT0uLi4mcmVsYXk9Li4uXG4gKiBSZWJ1aWx0IGZyb20gdGhlIHBhcnNlZCBmaWVsZHMsIHNvIG9mIHRoZSBjb25uZWN0aW9uIHN0cmluZyBvbmx5IHRoZSBwdWJrZXkgYW5kXG4gKiB0aGUgcmVsYXkgdmFsdWVzIHN1cnZpdmUuIEVhY2ggcmVsYXkgdmFsdWUgbG9zZXMgaXRzIHVzZXJpbmZvLCBgc2VjcmV0YCBwYXJhbVxuICogYW5kIGZyYWdtZW50LCBhbmQga2VlcHMgYW55IG90aGVyIHF1ZXJ5IHBhcmFtcyBpdCBoYXMuXG4gKlxuICogQHBhcmFtIHsqfSB1cmwgYSBjb25uZWN0aW9uIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxuICogQHJldHVybnMge3N0cmluZ30gdGhlIGFkZHJlc3MsIG9yICcnIGlmIGB1cmxgIGlzIG5vdCBhIHZhbGlkIGNvbm5lY3Rpb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWRhY3RCdW5rZXJVcmwodXJsKSB7XG4gICAgbGV0IHBhcnNlZDtcbiAgICB0cnkge1xuICAgICAgICBwYXJzZWQgPSBwYXJzZUJ1bmtlclVybCh1cmwpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0IHJlbGF5cyA9IHBhcnNlZC5yZWxheXMubWFwKHJlbGF5ID0+IGByZWxheT0ke2VuY29kZVJlbGF5KGNsZWFuUmVsYXkocmVsYXkpKX1gKS5qb2luKCcmJyk7XG4gICAgcmV0dXJuIGBidW5rZXI6Ly8ke3BhcnNlZC5yZW1vdGVQdWJrZXl9PyR7cmVsYXlzfWA7XG59XG5cbi8qKlxuICogVGhlIHNhbWUgcHJvZmlsZSBsaXN0IHdpdGggZWFjaCBidW5rZXJVcmwgcmVkdWNlZCB0byBpdHMgYWRkcmVzcy5cbiAqXG4gKiBAcGFyYW0geyp9IHByb2ZpbGVzIGEgcHJvZmlsZSBsaXN0OyBhbnl0aGluZyBlbHNlIGlzIHJldHVybmVkIGFzIGl0IGlzXG4gKiBAcmV0dXJucyB0aGUgc2FtZSBsaXN0IHdoZW4gbm90aGluZyBuZWVkZWQgY2hhbmdpbmcsIHNvIGEgY2FsbGVyIGNhbiBza2lwIGFcbiAqICAgICAgICAgIHdyaXRlIGJ5IGNvbXBhcmluZyByZWZlcmVuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWRhY3RQcm9maWxlcyhwcm9maWxlcykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9maWxlcykpIHJldHVybiBwcm9maWxlcztcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGNsZWFuID0gcHJvZmlsZXMubWFwKChwcm9maWxlKSA9PiB7XG4gICAgICAgIGlmICghcHJvZmlsZT8uYnVua2VyVXJsKSByZXR1cm4gcHJvZmlsZTtcbiAgICAgICAgY29uc3QgYnVua2VyVXJsID0gcmVkYWN0QnVua2VyVXJsKHByb2ZpbGUuYnVua2VyVXJsKTtcbiAgICAgICAgaWYgKGJ1bmtlclVybCA9PT0gcHJvZmlsZS5idW5rZXJVcmwpIHJldHVybiBwcm9maWxlO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHsgLi4ucHJvZmlsZSwgYnVua2VyVXJsIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNoYW5nZWQgPyBjbGVhbiA6IHByb2ZpbGVzO1xufVxuXG4vKipcbiAqIFN0b3JlZCBzZXNzaW9ucyBhcmUga2V5ZWQgYnkgcHJvZmlsZSBwb3NpdGlvbi4gUmVtb3ZpbmcgYSBwcm9maWxlIHRha2VzIGl0c1xuICogc2Vzc2lvbiB3aXRoIGl0IGFuZCBtb3ZlcyBsYXRlciBzZXNzaW9ucyBkb3duIHdpdGggdGhlaXIgcHJvZmlsZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCAqPn0gYnVua2VyU2Vzc2lvbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSByZW1vdmVkSW5kZXhcbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclNlc3Npb25zQWZ0ZXJEZWxldGUoYnVua2VyU2Vzc2lvbnMsIHJlbW92ZWRJbmRleCkge1xuICAgIGNvbnN0IHNoaWZ0ZWQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtwb3NpdGlvbiwgc2Vzc2lvbl0gb2YgT2JqZWN0LmVudHJpZXMoYnVua2VyU2Vzc2lvbnMgfHwge30pKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyKHBvc2l0aW9uKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSByZW1vdmVkSW5kZXgpIGNvbnRpbnVlO1xuICAgICAgICBzaGlmdGVkW2luZGV4ID4gcmVtb3ZlZEluZGV4ID8gaW5kZXggLSAxIDogaW5kZXhdID0gc2Vzc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIHNoaWZ0ZWQ7XG59XG5cbi8qKlxuICogVGhlIHNhbWUsIGZvciBhbnkgY2hhbmdlIG9mIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0PHN0cmluZywgKj59IGJ1bmtlclNlc3Npb25zXG4gKiBAcGFyYW0ge0FycmF5PFtudW1iZXIsID9udW1iZXJdPn0gbW92ZXMgZWFjaCBwcm9maWxlIHRoYXQgbW92ZWQsIGFuZCB0byB3aGVyZTsgbnVsbCBpZiBnb25lXG4gKiBAcmV0dXJucyB7T2JqZWN0PHN0cmluZywgKj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJTZXNzaW9uc0FmdGVyTW92ZXMoYnVua2VyU2Vzc2lvbnMsIG1vdmVzKSB7XG4gICAgY29uc3QgbW92ZWQgPSBuZXcgTWFwKG1vdmVzKTtcbiAgICBjb25zdCBwbGFjZWQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtwb3NpdGlvbiwgc2Vzc2lvbl0gb2YgT2JqZWN0LmVudHJpZXMoYnVua2VyU2Vzc2lvbnMgfHwge30pKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyKHBvc2l0aW9uKTtcbiAgICAgICAgY29uc3QgdG8gPSBtb3ZlZC5oYXMoaW5kZXgpID8gbW92ZWQuZ2V0KGluZGV4KSA6IGluZGV4O1xuICAgICAgICBpZiAodG8gIT09IG51bGwpIHBsYWNlZFt0b10gPSBzZXNzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gcGxhY2VkO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1DQSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsWUFDeEQsT0FBTztBQUNILHNCQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQU07QUFBQSxZQUNuRDtBQUFBLFVBQ0o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQTlEQSxNQWdCTSxVQWFBLFVBdUNBO0FBcEVOO0FBQUE7QUFBQTtBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixVQUFJLENBQUMsVUFBVTtBQUNYLGNBQU0sSUFBSSxNQUFNLGtGQUFrRjtB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QUFJLEtBQUssTUFBTyxHQUFFLGNBQWM7QUFDM0QsVUFBTSxJQUFJLEVBQUUsY0FBYztBQUFHLFFBQUksS0FBSyxRQUFTLEdBQUUsY0FBYztBQUMvRCxVQUFNLElBQUksRUFBRSxtQkFBbUI7QUFBRyxRQUFJLEtBQUssT0FBUSxHQUFFLGNBQWM7QUFDbkUsT0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQy9CLFlBQU0sTUFBTSxJQUFJLFFBQVEsT0FBTyx3QkFBd0I7QUFDdkQsYUFBTyxLQUFLLEtBQUssa0JBQWtCO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFFQSxpQkFBZSxPQUFPO0FBRWxCLFVBQU0sY0FBYyxNQUFNLFFBQVEsYUFBYTtBQUMvQyxVQUFNLFNBQVMsTUFBTSxRQUFRLFVBQVU7QUFDdkMsVUFBTSxPQUFPLEVBQUUsbUJBQW1CO0FBQ2xDLFVBQU0sT0FBTyxFQUFFLG9CQUFvQjtBQUVuQyxRQUFJLENBQUMsYUFBYTtBQUdkLGtCQUFZLElBQUk7QUFDaEIsZUFBUyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCO0FBQUEsSUFDSjtBQUVBLFFBQUksUUFBUTtBQUVSLGtCQUFZLEtBQUs7QUFDakIsZUFBUyxNQUFNLE1BQU07QUFBQSxRQUNqQixPQUFPO0FBQUEsUUFDUCxTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsTUFDWixDQUFDO0FBQ0Q7QUFBQSxJQUNKO0FBRUEsZ0JBQVksSUFBSTtBQUNoQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBRS9CLFVBQU0sU0FBUyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN4RSxVQUFNLFlBQVksVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFO0FBQ2xELFVBQU0sY0FBYyxNQUFNQyxlQUFjO0FBQ3hDLFVBQU0sT0FBTyxNQUFNLFlBQVk7QUFFL0IsZUFBVztBQUNYLFdBQU87QUFFUCxRQUFJLE1BQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsWUFBTSxRQUFRO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBRUEsV0FBUyxpQkFBaUIsb0JBQW9CLE1BQU0sVUFBVSxJQUFJLENBQUM7IiwKICAibmFtZXMiOiBbInRhcmdldCIsICJpbml0IiwgIklWX0JZVEVTIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJhcGkiLCAiSVZfQllURVMiLCAic3RvcmFnZSIsICJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiaXNTeW5jRW5hYmxlZCJdCn0K
