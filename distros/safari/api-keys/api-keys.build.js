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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvcGFnZS1nYXRlLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1lcmdlLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvc2VjcmV0LXZhdWx0LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvY3J5cHRvLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnVua2VyLXVybC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3Byb2ZpbGVzLXN0b3JlLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIE1pbmltYWwgcHJvY2VzcyBzaGltIGZvciBicm93c2VyIGNvbnRleHQuXG4gKiBOb2RlLmpzIGxpYnJhcmllcyBidW5kbGVkIHZpYSBub3N0ci1jcnlwdG8tdXRpbHMgKGNyeXB0by1icm93c2VyaWZ5LFxuICogcmVhZGFibGUtc3RyZWFtLCBldGMuKSByZWZlcmVuY2UgdGhlIGdsb2JhbCBgcHJvY2Vzc2Agb2JqZWN0LlxuICogVGhpcyBwcm92aWRlcyBqdXN0IGVub3VnaCBmb3IgdGhlbSB0byB3b3JrIGluIGEgYnJvd3NlciBleHRlbnNpb24uXG4gKi9cbmV4cG9ydCB2YXIgcHJvY2VzcyA9IHtcbiAgICBlbnY6IHsgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJywgTE9HX0xFVkVMOiAnd2FybicgfSxcbiAgICBicm93c2VyOiB0cnVlLFxuICAgIHZlcnNpb246ICcnLFxuICAgIHN0ZG91dDogbnVsbCxcbiAgICBzdGRlcnI6IG51bGwsXG4gICAgbmV4dFRpY2s6IGZ1bmN0aW9uIChmbikge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkgeyBmbi5hcHBseShudWxsLCBhcmdzKTsgfSk7XG4gICAgfSxcbn07XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnNlc3Npb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE1WMyBpbi1tZW1vcnkgYXJlYSB0aGF0IHN1cnZpdmVzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uIGJ1dCBuZXZlciB0b3VjaGVzXG4gICAgLy8gZGlzay4gTnVsbCBvbiBlbmdpbmVzIHRoYXQgZG9uJ3QgaW1wbGVtZW50IGl0IChTYWZhcmkgYmFja2dyb3VuZCBwYWdlLFxuICAgIC8vIG9sZGVyIEZpcmVmb3gpIFx1MjAxNCBjYWxsZXJzIG11c3QgZmVhdHVyZS1kZXRlY3QgYW5kIGZhbGwgYmFjay5cbiAgICBzZXNzaW9uOiBfYnJvd3Nlci5zdG9yYWdlPy5zZXNzaW9uID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24ucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLCBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzdHJpY3QgdGhlIGFyZWEgdG8gZXh0ZW5zaW9uLXByaXZpbGVnZWQgY29udGV4dHMuIENocm9tZS1vbmx5O1xuICAgICAgICAgKiByZXNvbHZlcyBoYXJtbGVzc2x5IHdoZXJlIHRoZSBtZXRob2QgaXMgYWJzZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWNjZXNzTGV2ZWwoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJjb25zdCBpbnN0YW5jZU9mQW55ID0gKG9iamVjdCwgY29uc3RydWN0b3JzKSA9PiBjb25zdHJ1Y3RvcnMuc29tZSgoYykgPT4gb2JqZWN0IGluc3RhbmNlb2YgYyk7XG5cbmxldCBpZGJQcm94eWFibGVUeXBlcztcbmxldCBjdXJzb3JBZHZhbmNlTWV0aG9kcztcbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSB7XG4gICAgcmV0dXJuIChpZGJQcm94eWFibGVUeXBlcyB8fFxuICAgICAgICAoaWRiUHJveHlhYmxlVHlwZXMgPSBbXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQk9iamVjdFN0b3JlLFxuICAgICAgICAgICAgSURCSW5kZXgsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJUcmFuc2FjdGlvbixcbiAgICAgICAgXSkpO1xufVxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpIHtcbiAgICByZXR1cm4gKGN1cnNvckFkdmFuY2VNZXRob2RzIHx8XG4gICAgICAgIChjdXJzb3JBZHZhbmNlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuYWR2YW5jZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWUsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlUHJpbWFyeUtleSxcbiAgICAgICAgXSkpO1xufVxuY29uc3QgdHJhbnNhY3Rpb25Eb25lTWFwID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IHJldmVyc2VUcmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBwcm9taXNpZnlSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUod3JhcChyZXF1ZXN0LnJlc3VsdCkpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QocmVxdWVzdC5lcnJvcik7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBUaGlzIG1hcHBpbmcgZXhpc3RzIGluIHJldmVyc2VUcmFuc2Zvcm1DYWNoZSBidXQgZG9lc24ndCBleGlzdCBpbiB0cmFuc2Zvcm1DYWNoZS4gVGhpc1xuICAgIC8vIGlzIGJlY2F1c2Ugd2UgY3JlYXRlIG1hbnkgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0LlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJvbWlzZSwgcmVxdWVzdCk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odHgpIHtcbiAgICAvLyBFYXJseSBiYWlsIGlmIHdlJ3ZlIGFscmVhZHkgY3JlYXRlZCBhIGRvbmUgcHJvbWlzZSBmb3IgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICBpZiAodHJhbnNhY3Rpb25Eb25lTWFwLmhhcyh0eCkpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBkb25lID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB1bmxpc3RlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCh0eC5lcnJvciB8fCBuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydEVycm9yJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIENhY2hlIGl0IGZvciBsYXRlciByZXRyaWV2YWwuXG4gICAgdHJhbnNhY3Rpb25Eb25lTWFwLnNldCh0eCwgZG9uZSk7XG59XG5sZXQgaWRiUHJveHlUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHRyYW5zYWN0aW9uLmRvbmUuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2RvbmUnKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2FjdGlvbkRvbmVNYXAuZ2V0KHRhcmdldCk7XG4gICAgICAgICAgICAvLyBNYWtlIHR4LnN0b3JlIHJldHVybiB0aGUgb25seSBzdG9yZSBpbiB0aGUgdHJhbnNhY3Rpb24sIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbWFueS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMV1cbiAgICAgICAgICAgICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgOiByZWNlaXZlci5vYmplY3RTdG9yZShyZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBFbHNlIHRyYW5zZm9ybSB3aGF0ZXZlciB3ZSBnZXQgYmFjay5cbiAgICAgICAgcmV0dXJuIHdyYXAodGFyZ2V0W3Byb3BdKTtcbiAgICB9LFxuICAgIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uICYmXG4gICAgICAgICAgICAocHJvcCA9PT0gJ2RvbmUnIHx8IHByb3AgPT09ICdzdG9yZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcCBpbiB0YXJnZXQ7XG4gICAgfSxcbn07XG5mdW5jdGlvbiByZXBsYWNlVHJhcHMoY2FsbGJhY2spIHtcbiAgICBpZGJQcm94eVRyYXBzID0gY2FsbGJhY2soaWRiUHJveHlUcmFwcyk7XG59XG5mdW5jdGlvbiB3cmFwRnVuY3Rpb24oZnVuYykge1xuICAgIC8vIER1ZSB0byBleHBlY3RlZCBvYmplY3QgZXF1YWxpdHkgKHdoaWNoIGlzIGVuZm9yY2VkIGJ5IHRoZSBjYWNoaW5nIGluIGB3cmFwYCksIHdlXG4gICAgLy8gb25seSBjcmVhdGUgb25lIG5ldyBmdW5jIHBlciBmdW5jLlxuICAgIC8vIEN1cnNvciBtZXRob2RzIGFyZSBzcGVjaWFsLCBhcyB0aGUgYmVoYXZpb3VyIGlzIGEgbGl0dGxlIG1vcmUgZGlmZmVyZW50IHRvIHN0YW5kYXJkIElEQi4gSW5cbiAgICAvLyBJREIsIHlvdSBhZHZhbmNlIHRoZSBjdXJzb3IgYW5kIHdhaXQgZm9yIGEgbmV3ICdzdWNjZXNzJyBvbiB0aGUgSURCUmVxdWVzdCB0aGF0IGdhdmUgeW91IHRoZVxuICAgIC8vIGN1cnNvci4gSXQncyBraW5kYSBsaWtlIGEgcHJvbWlzZSB0aGF0IGNhbiByZXNvbHZlIHdpdGggbWFueSB2YWx1ZXMuIFRoYXQgZG9lc24ndCBtYWtlIHNlbnNlXG4gICAgLy8gd2l0aCByZWFsIHByb21pc2VzLCBzbyBlYWNoIGFkdmFuY2UgbWV0aG9kcyByZXR1cm5zIGEgbmV3IHByb21pc2UgZm9yIHRoZSBjdXJzb3Igb2JqZWN0LCBvclxuICAgIC8vIHVuZGVmaW5lZCBpZiB0aGUgZW5kIG9mIHRoZSBjdXJzb3IgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICBpZiAoZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKS5pbmNsdWRlcyhmdW5jKSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm4gd3JhcCh0aGlzLnJlcXVlc3QpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4gd3JhcChmdW5jLmFwcGx5KHVud3JhcCh0aGlzKSwgYXJncykpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgcmV0dXJuIHdyYXBGdW5jdGlvbih2YWx1ZSk7XG4gICAgLy8gVGhpcyBkb2Vzbid0IHJldHVybiwgaXQganVzdCBjcmVhdGVzIGEgJ2RvbmUnIHByb21pc2UgZm9yIHRoZSB0cmFuc2FjdGlvbixcbiAgICAvLyB3aGljaCBpcyBsYXRlciByZXR1cm5lZCBmb3IgdHJhbnNhY3Rpb24uZG9uZSAoc2VlIGlkYk9iamVjdEhhbmRsZXIpLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKVxuICAgICAgICBjYWNoZURvbmVQcm9taXNlRm9yVHJhbnNhY3Rpb24odmFsdWUpO1xuICAgIGlmIChpbnN0YW5jZU9mQW55KHZhbHVlLCBnZXRJZGJQcm94eWFibGVUeXBlcygpKSlcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eSh2YWx1ZSwgaWRiUHJveHlUcmFwcyk7XG4gICAgLy8gUmV0dXJuIHRoZSBzYW1lIHZhbHVlIGJhY2sgaWYgd2UncmUgbm90IGdvaW5nIHRvIHRyYW5zZm9ybSBpdC5cbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgLy8gV2Ugc29tZXRpbWVzIGdlbmVyYXRlIG11bHRpcGxlIHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdCAoZWcgd2hlbiBjdXJzb3JpbmcpLCBiZWNhdXNlXG4gICAgLy8gSURCIGlzIHdlaXJkIGFuZCBhIHNpbmdsZSBJREJSZXF1ZXN0IGNhbiB5aWVsZCBtYW55IHJlc3BvbnNlcywgc28gdGhlc2UgY2FuJ3QgYmUgY2FjaGVkLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElEQlJlcXVlc3QpXG4gICAgICAgIHJldHVybiBwcm9taXNpZnlSZXF1ZXN0KHZhbHVlKTtcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IHRyYW5zZm9ybWVkIHRoaXMgdmFsdWUgYmVmb3JlLCByZXVzZSB0aGUgdHJhbnNmb3JtZWQgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIsIGJ1dCBpdCBhbHNvIHByb3ZpZGVzIG9iamVjdCBlcXVhbGl0eS5cbiAgICBpZiAodHJhbnNmb3JtQ2FjaGUuaGFzKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB0cmFuc2Zvcm1DYWNoYWJsZVZhbHVlKHZhbHVlKTtcbiAgICAvLyBOb3QgYWxsIHR5cGVzIGFyZSB0cmFuc2Zvcm1lZC5cbiAgICAvLyBUaGVzZSBtYXkgYmUgcHJpbWl0aXZlIHR5cGVzLCBzbyB0aGV5IGNhbid0IGJlIFdlYWtNYXAga2V5cy5cbiAgICBpZiAobmV3VmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgIHRyYW5zZm9ybUNhY2hlLnNldCh2YWx1ZSwgbmV3VmFsdWUpO1xuICAgICAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KG5ld1ZhbHVlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdWYWx1ZTtcbn1cbmNvbnN0IHVud3JhcCA9ICh2YWx1ZSkgPT4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLmdldCh2YWx1ZSk7XG5cbi8qKlxuICogT3BlbiBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICogQHBhcmFtIHZlcnNpb24gU2NoZW1hIHZlcnNpb24uXG4gKiBAcGFyYW0gY2FsbGJhY2tzIEFkZGl0aW9uYWwgY2FsbGJhY2tzLlxuICovXG5mdW5jdGlvbiBvcGVuREIobmFtZSwgdmVyc2lvbiwgeyBibG9ja2VkLCB1cGdyYWRlLCBibG9ja2luZywgdGVybWluYXRlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3Qgb3BlblByb21pc2UgPSB3cmFwKHJlcXVlc3QpO1xuICAgIGlmICh1cGdyYWRlKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigndXBncmFkZW5lZWRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdXBncmFkZSh3cmFwKHJlcXVlc3QucmVzdWx0KSwgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgd3JhcChyZXF1ZXN0LnRyYW5zYWN0aW9uKSwgZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIG9wZW5Qcm9taXNlXG4gICAgICAgIC50aGVuKChkYikgPT4ge1xuICAgICAgICBpZiAodGVybWluYXRlZClcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4gdGVybWluYXRlZCgpKTtcbiAgICAgICAgaWYgKGJsb2NraW5nKSB7XG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCd2ZXJzaW9uY2hhbmdlJywgKGV2ZW50KSA9PiBibG9ja2luZyhldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHsgfSk7XG4gICAgcmV0dXJuIG9wZW5Qcm9taXNlO1xufVxuLyoqXG4gKiBEZWxldGUgYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqL1xuZnVuY3Rpb24gZGVsZXRlREIobmFtZSwgeyBibG9ja2VkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UobmFtZSk7XG4gICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdibG9ja2VkJywgKGV2ZW50KSA9PiBibG9ja2VkKFxuICAgICAgICAvLyBDYXN0aW5nIGR1ZSB0byBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC8xNDA1XG4gICAgICAgIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50KSk7XG4gICAgfVxuICAgIHJldHVybiB3cmFwKHJlcXVlc3QpLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbn1cblxuY29uc3QgcmVhZE1ldGhvZHMgPSBbJ2dldCcsICdnZXRLZXknLCAnZ2V0QWxsJywgJ2dldEFsbEtleXMnLCAnY291bnQnXTtcbmNvbnN0IHdyaXRlTWV0aG9kcyA9IFsncHV0JywgJ2FkZCcsICdkZWxldGUnLCAnY2xlYXInXTtcbmNvbnN0IGNhY2hlZE1ldGhvZHMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKCEodGFyZ2V0IGluc3RhbmNlb2YgSURCRGF0YWJhc2UgJiZcbiAgICAgICAgIShwcm9wIGluIHRhcmdldCkgJiZcbiAgICAgICAgdHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjYWNoZWRNZXRob2RzLmdldChwcm9wKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApO1xuICAgIGNvbnN0IHRhcmdldEZ1bmNOYW1lID0gcHJvcC5yZXBsYWNlKC9Gcm9tSW5kZXgkLywgJycpO1xuICAgIGNvbnN0IHVzZUluZGV4ID0gcHJvcCAhPT0gdGFyZ2V0RnVuY05hbWU7XG4gICAgY29uc3QgaXNXcml0ZSA9IHdyaXRlTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSk7XG4gICAgaWYgKFxuICAgIC8vIEJhaWwgaWYgdGhlIHRhcmdldCBkb2Vzbid0IGV4aXN0IG9uIHRoZSB0YXJnZXQuIEVnLCBnZXRBbGwgaXNuJ3QgaW4gRWRnZS5cbiAgICAhKHRhcmdldEZ1bmNOYW1lIGluICh1c2VJbmRleCA/IElEQkluZGV4IDogSURCT2JqZWN0U3RvcmUpLnByb3RvdHlwZSkgfHxcbiAgICAgICAgIShpc1dyaXRlIHx8IHJlYWRNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2QgPSBhc3luYyBmdW5jdGlvbiAoc3RvcmVOYW1lLCAuLi5hcmdzKSB7XG4gICAgICAgIC8vIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6IHVuZGVmaW5lZCBnemlwcHMgYmV0dGVyLCBidXQgZmFpbHMgaW4gRWRnZSA6KFxuICAgICAgICBjb25zdCB0eCA9IHRoaXMudHJhbnNhY3Rpb24oc3RvcmVOYW1lLCBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiAncmVhZG9ubHknKTtcbiAgICAgICAgbGV0IHRhcmdldCA9IHR4LnN0b3JlO1xuICAgICAgICBpZiAodXNlSW5kZXgpXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuaW5kZXgoYXJncy5zaGlmdCgpKTtcbiAgICAgICAgLy8gTXVzdCByZWplY3QgaWYgb3AgcmVqZWN0cy5cbiAgICAgICAgLy8gSWYgaXQncyBhIHdyaXRlIG9wZXJhdGlvbiwgbXVzdCByZWplY3QgaWYgdHguZG9uZSByZWplY3RzLlxuICAgICAgICAvLyBNdXN0IHJlamVjdCB3aXRoIG9wIHJlamVjdGlvbiBmaXJzdC5cbiAgICAgICAgLy8gTXVzdCByZXNvbHZlIHdpdGggb3AgdmFsdWUuXG4gICAgICAgIC8vIE11c3QgaGFuZGxlIGJvdGggcHJvbWlzZXMgKG5vIHVuaGFuZGxlZCByZWplY3Rpb25zKVxuICAgICAgICByZXR1cm4gKGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIHRhcmdldFt0YXJnZXRGdW5jTmFtZV0oLi4uYXJncyksXG4gICAgICAgICAgICBpc1dyaXRlICYmIHR4LmRvbmUsXG4gICAgICAgIF0pKVswXTtcbiAgICB9O1xuICAgIGNhY2hlZE1ldGhvZHMuc2V0KHByb3AsIG1ldGhvZCk7XG4gICAgcmV0dXJuIG1ldGhvZDtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydjb250aW51ZScsICdjb250aW51ZVByaW1hcnlLZXknLCAnYWR2YW5jZSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgYXNrR2F0ZSwgc3RhcnRQYWdlIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3BhZ2UtZ2F0ZSc7XG5pbXBvcnQgeyBpbnNDb25maXJtIH0gZnJvbSAnLi4vaW5zLWNvbmZpcm0uanMnO1xuaW1wb3J0IHtcbiAgICBnZXRBcGlLZXlTdG9yZSxcbiAgICBzYXZlQXBpS2V5LFxuICAgIGRlbGV0ZUFwaUtleSxcbiAgICBsaXN0QXBpS2V5cyxcbiAgICBzZXRTeW5jRW5hYmxlZCxcbiAgICBpc1N5bmNFbmFibGVkLFxuICAgIHVwZGF0ZVN0b3JlU3luY1N0YXRlLFxuICAgIGV4cG9ydFN0b3JlLFxuICAgIGltcG9ydFN0b3JlLFxuICAgIGtleXNGb3JSZWxheSxcbiAgICBnZXREZWxldGVkS2V5cyxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUnO1xuaW1wb3J0IHsgbWVyZ2VSZW1vdGUgfSBmcm9tICcuLi91dGlsaXRpZXMvc3luYy1tZXJnZSc7XG5pbXBvcnQgeyBzZXRVbmxvY2tlZCB9IGZyb20gJy4uL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBrZXlzOiBbXSxcbiAgICBuZXdMYWJlbDogJycsXG4gICAgbmV3U2VjcmV0OiAnJyxcbiAgICBlZGl0aW5nSWQ6IG51bGwsXG4gICAgZWRpdExhYmVsOiAnJyxcbiAgICBlZGl0U2VjcmV0OiAnJyxcbiAgICBjb3BpZWRJZDogbnVsbCxcbiAgICByZXZlYWxlZElkOiBudWxsLFxuICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgdG9hc3Q6ICcnLFxuICAgIHJlbGF5SW5mbzogeyByZWFkOiBbXSwgd3JpdGU6IFtdIH0sXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gaGFzUmVsYXlzKCkge1xuICAgIHJldHVybiBzdGF0ZS5yZWxheUluZm8ucmVhZC5sZW5ndGggPiAwIHx8IHN0YXRlLnJlbGF5SW5mby53cml0ZS5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBzb3J0ZWRLZXlzKCkge1xuICAgIHJldHVybiBbLi4uc3RhdGUua2V5c10uc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBtYXNrU2VjcmV0KHNlY3JldCkge1xuICAgIGlmICghc2VjcmV0KSByZXR1cm4gJyc7XG4gICAgaWYgKHNlY3JldC5sZW5ndGggPD0gOCkgcmV0dXJuICdcXHUyMDIyJy5yZXBlYXQoc2VjcmV0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHNlY3JldC5zbGljZSgwLCA0KSArICdcXHUyMDIyJy5yZXBlYXQoNCkgKyBzZWNyZXQuc2xpY2UoLTQpO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuIHN0YXRlLnN5bmNFbmFibGVkID8gJ2xlZC0tZ3JlZW4nIDogJ2xlZC0tb2ZmJztcbiAgICBpZiAoc3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnbGVkLS1hbWJlciBhbmltYXRlLXB1bHNlJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnU3luY2VkJyA6ICdMb2NhbCBvbmx5Jztcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBzeW5jVG9nZ2xlID0gJCgnc3luYy10b2dnbGUnKTtcbiAgICBjb25zdCBrZXlDb3VudCA9ICQoJ2tleS1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGxlZCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKSB8fCAhc3RhdGUuc3luY0VuYWJsZWQ7XG4gICAgaWYgKHN5bmNUb2dnbGUpIHN5bmNUb2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcoc3RhdGUuc3luY0VuYWJsZWQpKTtcbiAgICBpZiAoa2V5Q291bnQpIGtleUNvdW50LnRleHRDb250ZW50ID0gc3RhdGUua2V5cy5sZW5ndGggKyAnIGtleScgKyAoc3RhdGUua2V5cy5sZW5ndGggIT09IDEgPyAncycgOiAnJyk7XG5cbiAgICAvLyBLZXkgdGFibGVcbiAgICBjb25zdCBrZXlUYWJsZUNvbnRhaW5lciA9ICQoJ2tleS10YWJsZS1jb250YWluZXInKTtcbiAgICBjb25zdCBub0tleXNNc2cgPSAkKCduby1rZXlzJyk7XG4gICAgY29uc3Qga2V5VGFibGVCb2R5ID0gJCgna2V5LXRhYmxlLWJvZHknKTtcblxuICAgIGlmIChrZXlUYWJsZUNvbnRhaW5lcikga2V5VGFibGVDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID4gMCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKG5vS2V5c01zZykgbm9LZXlzTXNnLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5rZXlzLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBpZiAoa2V5VGFibGVCb2R5KSB7XG4gICAgICAgIGNvbnN0IHNvcnRlZCA9IHNvcnRlZEtleXMoKTtcbiAgICAgICAga2V5VGFibGVCb2R5LmlubmVySFRNTCA9IHNvcnRlZC5tYXAoa2V5ID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5lZGl0aW5nSWQgPT09IGtleS5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUgaXMtbGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1oZWFkZXJcIj5FZGl0IGtleTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1ib2R5IGZsZXggZmxleC1jb2wgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucy1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJLZXkgbGFiZWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtbGFiZWw9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0TGFiZWwpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucy1pbnB1dCBtb25vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlbGxjaGVjaz1cImZhbHNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlNlY3JldCBrZXlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtc2VjcmV0PVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdFNlY3JldCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGdhcC0yIGp1c3RpZnktZW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1naG9zdCBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXByaW1hcnkgYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmV2ZWFsZWQgPSBzdGF0ZS5yZXZlYWxlZElkID09PSBrZXkuaWQ7XG4gICAgICAgICAgICAvLyBBbiB1bmRlY3J5cHRhYmxlIHNlY3JldCBtdXN0IHJlYWQgYXMgYSBQUk9CTEVNLCBuZXZlciBhcyBibGFuayBcdTIwMTRcbiAgICAgICAgICAgIC8vIGJsYW5rIGlzIHdoYXQgbWFkZSB0aGUgb2xkIGRhdGEgbG9zcyBpbnZpc2libGUuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5U2VjcmV0ID0ga2V5LnVuZGVjcnlwdGFibGVcbiAgICAgICAgICAgICAgICA/ICd1bnJlYWRhYmxlIG9uIHRoaXMgZGV2aWNlJ1xuICAgICAgICAgICAgICAgIDogKHJldmVhbGVkID8gZXNjYXBlSHRtbChrZXkuc2VjcmV0KSA6IGVzY2FwZUh0bWwobWFza1NlY3JldChrZXkuc2VjcmV0KSkpO1xuICAgICAgICAgICAgY29uc3QgY29weUxhYmVsID0gc3RhdGUuY29waWVkSWQgPT09IGtleS5pZCA/ICdDb3BpZWQhJyA6ICdDb3B5JztcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZSR7cmV2ZWFsZWQgPyAnIGlzLWxpdmUnIDogJyd9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJwYXRjaC1wb2ludFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1wcmVzc2VkPVwiJHtyZXZlYWxlZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiJHtyZXZlYWxlZCA/ICdIaWRlIHNlY3JldCcgOiAnUmV2ZWFsIHNlY3JldCd9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiJHtyZXZlYWxlZCA/ICdIaWRlJyA6ICdSZXZlYWwnfSBzZWNyZXQgZm9yICR7ZXNjYXBlQXR0cihrZXkubGFiZWwpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+PHNwYW4gY2xhc3M9XCJwYXRjaC1qYWNrXCI+PC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTAuNSBtaW4tdy0wIGZsZXgtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1zbSBmb250LXNlbWlib2xkIGN1cnNvci1wb2ludGVyIGhvdmVyOnVuZGVybGluZVwiIGRhdGEtYWN0aW9uPVwic3RhcnQtZWRpdFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCIgdGl0bGU9XCJFZGl0IGtleVwiPiR7ZXNjYXBlSHRtbChrZXkubGFiZWwpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1vbm8gdGV4dC14cyAke3JldmVhbGVkID8gJycgOiAnaW5zLW11dGVkICd9aW5zLXRydW5jYXRlIGN1cnNvci1wb2ludGVyXCIgZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj4ke2Rpc3BsYXlTZWNyZXR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInJvdy12YWx1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImNvcHktc2VjcmV0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj4ke2NvcHlMYWJlbH08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tc20gYnRuLS1kZXN0cnVjdGl2ZVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImRlbGV0ZS1rZXlcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPkRlbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGA7XG4gICAgICAgIH0pLmpvaW4oJycpO1xuXG4gICAgICAgIC8vIEJpbmQgdGFibGUgZXZlbnRzXG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHN0YXJ0RWRpdChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhdGUucmV2ZWFsZWRJZCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGVsLmRhdGFzZXQua2V5SWQgPyBudWxsIDogZWwuZGF0YXNldC5rZXlJZDtcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNvcHktc2VjcmV0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGNvcHlTZWNyZXQoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImRlbGV0ZS1rZXlcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZGVsZXRlS2V5KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJzYXZlLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUVkaXQpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNhbmNlbC1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbEVkaXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCaW5kIGVkaXQgaW5wdXQgZXZlbnRzXG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1lZGl0LWxhYmVsXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5lZGl0TGFiZWwgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtc2VjcmV0XScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5lZGl0U2VjcmV0ID0gZS50YXJnZXQudmFsdWU7IH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgc2F2ZUVkaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBjYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGtleSBmb3JtXG4gICAgY29uc3QgbmV3TGFiZWxJbnB1dCA9ICQoJ25ldy1sYWJlbCcpO1xuICAgIGNvbnN0IG5ld1NlY3JldElucHV0ID0gJCgnbmV3LXNlY3JldCcpO1xuICAgIGNvbnN0IGFkZEtleUJ0biA9ICQoJ2FkZC1rZXktYnRuJyk7XG5cbiAgICBpZiAobmV3TGFiZWxJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBuZXdMYWJlbElucHV0KSBuZXdMYWJlbElucHV0LnZhbHVlID0gc3RhdGUubmV3TGFiZWw7XG4gICAgaWYgKG5ld1NlY3JldElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld1NlY3JldElucHV0KSBuZXdTZWNyZXRJbnB1dC52YWx1ZSA9IHN0YXRlLm5ld1NlY3JldDtcbiAgICBpZiAoYWRkS2V5QnRuKSB7XG4gICAgICAgIGFkZEtleUJ0bi5kaXNhYmxlZCA9IHN0YXRlLnNhdmluZyB8fCBzdGF0ZS5uZXdMYWJlbC50cmltKCkubGVuZ3RoID09PSAwIHx8IHN0YXRlLm5ld1NlY3JldC50cmltKCkubGVuZ3RoID09PSAwO1xuICAgICAgICBhZGRLZXlCdG4udGV4dENvbnRlbnQgPSBzdGF0ZS5zYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlJztcbiAgICB9XG5cbiAgICAvLyBUb2FzdFxuICAgIGNvbnN0IHRvYXN0ID0gJCgndG9hc3QnKTtcbiAgICBpZiAodG9hc3QpIHtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBzdGF0ZS50b2FzdDtcbiAgICAgICAgdG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLnRvYXN0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LnRleHRDb250ZW50ID0gc3RyO1xuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuLy8gLS0tIENSVUQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGFkZEtleSgpIHtcbiAgICBjb25zdCBsYWJlbCA9IHN0YXRlLm5ld0xhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5uZXdTZWNyZXQudHJpbSgpO1xuICAgIGlmICghbGFiZWwgfHwgIXNlY3JldCkgcmV0dXJuO1xuXG4gICAgc3RhdGUuc2F2aW5nID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcblxuICAgIGNvbnN0IGlkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICBhd2FpdCBzYXZlQXBpS2V5KGlkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5uZXdMYWJlbCA9ICcnO1xuICAgIHN0YXRlLm5ld1NlY3JldCA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc3RhdGUuc2F2aW5nID0gZmFsc2U7XG4gICAgc2hvd1RvYXN0KCdLZXkgYWRkZWQnKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRFZGl0KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKGtleS51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIC8vIE9wZW5pbmcgaXQgd291bGQgc2VlZCB0aGUgZWRpdG9yIHdpdGggbm90aGluZyBhbmQgU2F2ZSB3b3VsZCB3cml0ZVxuICAgICAgICAvLyB0aGF0IG5vdGhpbmcgb3ZlciB0aGUgc3RvcmVkIGNpcGhlcnRleHQuXG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBrZXkgY291bGQgbm90IGJlIGRlY3J5cHRlZCBvbiB0aGlzIGRldmljZSBcdTIwMTQgaXQgd2FzIGxlZnQgdW50b3VjaGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3RhdGUuZWRpdGluZ0lkID0ga2V5LmlkO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9IGtleS5sYWJlbDtcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0ga2V5LnNlY3JldDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZUVkaXQoKSB7XG4gICAgaWYgKCFzdGF0ZS5lZGl0aW5nSWQpIHJldHVybjtcbiAgICBjb25zdCBsYWJlbCA9IHN0YXRlLmVkaXRMYWJlbC50cmltKCk7XG4gICAgY29uc3Qgc2VjcmV0ID0gc3RhdGUuZWRpdFNlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBhd2FpdCBzYXZlQXBpS2V5KHN0YXRlLmVkaXRpbmdJZCwgbGFiZWwsIHNlY3JldCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgc3RhdGUuZWRpdGluZ0lkID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSB1cGRhdGVkJyk7XG59XG5cbmZ1bmN0aW9uIGNhbmNlbEVkaXQoKSB7XG4gICAgc3RhdGUuZWRpdGluZ0lkID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUtleShpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmICghKGF3YWl0IGluc0NvbmZpcm0oeyB0aXRsZTogYERlbGV0ZSBcIiR7a2V5LmxhYmVsfVwiP2AsIGJvZHk6ICdUaGUgc3RvcmVkIHNlY3JldCBpcyByZW1vdmVkIGZyb20geW91ciBlbmNyeXB0ZWQgdmF1bHQuJywgY29uZmlybUxhYmVsOiAnRGVsZXRlIGtleScsIGRlc3RydWN0aXZlOiB0cnVlIH0pKSkgcmV0dXJuO1xuXG4gICAgYXdhaXQgZGVsZXRlQXBpS2V5KGlkKTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IGRlbGV0ZWQnKTtcbn1cblxuLy8gLS0tIENsaXBib2FyZCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gY29weVNlY3JldChpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmIChrZXkudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICBzaG93VG9hc3QoJ1RoaXMga2V5IGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgb24gdGhpcyBkZXZpY2UnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChrZXkuc2VjcmV0KTtcbiAgICBzdGF0ZS5jb3BpZWRJZCA9IGlkO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5jb3BpZWRJZCA9IG51bGw7IHJlbmRlcigpOyB9LCAyMDAwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoJycpLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9LCAzMDAwMCk7XG59XG5cbi8vIC0tLSBTeW5jIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoVG9SZWxheSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICBraW5kOiAnYXBpa2V5cy5wdWJsaXNoJyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHsga2V5czogYXdhaXQga2V5c0ZvclJlbGF5KCkgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ3N5bmNlZCcsIHJlc3VsdC5ldmVudElkLCByZXN1bHQuY3JlYXRlZEF0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgYXdhaXQgdXBkYXRlU3RvcmVTeW5jU3RhdGUoJ2xvY2FsLW9ubHknKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN5bmNBbGwoKSB7XG4gICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdzeW5jaW5nJztcbiAgICBzdGF0ZS5zeW5jRXJyb3IgPSAnJztcbiAgICByZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2FwaWtleXMuZmV0Y2gnIH0pO1xuXG4gICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgc3RhdGUuc3luY0Vycm9yID0gcmVzdWx0LmVycm9yIHx8ICdTeW5jIGZhaWxlZCc7XG4gICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQua2V5cykge1xuICAgICAgICAgICAgLy8gQSBrZXkgZGVsZXRlZCBoZXJlIHN0YXlzIGRlbGV0ZWQ6IGRyb3AgYW55IHJlbGF5IGNvcHkgZGF0ZWQgYXQgb3JcbiAgICAgICAgICAgIC8vIGJlZm9yZSBpdHMgbG9jYWwgZGVsZXRpb24uXG4gICAgICAgICAgICBjb25zdCB7IG1lcmdlZDogcmVtb3RlS2V5cyB9ID0gbWVyZ2VSZW1vdGUoe30sIHJlc3VsdC5rZXlzLCBhd2FpdCBnZXREZWxldGVkS2V5cygpLCB7XG4gICAgICAgICAgICAgICAgdGltZU9mOiAoaykgPT4gKGsgJiYgay51cGRhdGVkQXQpIHx8IHJlc3VsdC5jcmVhdGVkQXQgfHwgMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRBcGlLZXlTdG9yZSgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxLZXlzID0gc3RvcmUua2V5cztcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsQ291bnQgPSBPYmplY3Qua2V5cyhsb2NhbEtleXMpLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKGxvY2FsQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBpbXBvcnRTdG9yZShyZW1vdGVLZXlzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXN0b3JlLnJlbGF5Q3JlYXRlZEF0IHx8IHJlc3VsdC5jcmVhdGVkQXQgPiBzdG9yZS5yZWxheUNyZWF0ZWRBdCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGltcG9ydFN0b3JlKHJlbW90ZUtleXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVTeW5jKCkge1xuICAgIGF3YWl0IHNldFN5bmNFbmFibGVkKHN0YXRlLnN5bmNFbmFibGVkKTtcbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuLy8gLS0tIEltcG9ydCAvIEV4cG9ydCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5cygpIHtcbiAgICBjb25zdCB7IGtleXMsIHVuZGVjcnlwdGFibGUgfSA9IGF3YWl0IGV4cG9ydFN0b3JlKCk7XG4gICAgY29uc3QgcGxhaW5UZXh0ID0gSlNPTi5zdHJpbmdpZnkoa2V5cywgbnVsbCwgMik7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdhcGlrZXlzLmVuY3J5cHQnLFxuICAgICAgICBwYXlsb2FkOiB7IHBsYWluVGV4dCB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBzaG93VG9hc3QoJ0V4cG9ydCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFxuICAgICAgICBbSlNPTi5zdHJpbmdpZnkoeyBlbmNyeXB0ZWQ6IHRydWUsIGRhdGE6IHJlc3VsdC5jaXBoZXJUZXh0IH0pXSxcbiAgICAgICAgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICApO1xuICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7XG4gICAgYS5kb3dubG9hZCA9ICdub3N0cmtleS1hcGkta2V5cy1iYWNrdXAuanNvbic7XG4gICAgYS5jbGljaygpO1xuICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICBzaG93VG9hc3QodW5kZWNyeXB0YWJsZS5sZW5ndGhcbiAgICAgICAgPyBgRXhwb3J0ZWQgXHUyMDE0ICR7dW5kZWNyeXB0YWJsZS5sZW5ndGh9IGtleShzKSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIGhlcmUgYW5kIHdlcmUgYmFja2VkIHVwIHN0aWxsLWVuY3J5cHRlZDogJHt1bmRlY3J5cHRhYmxlLmpvaW4oJywgJyl9YFxuICAgICAgICA6ICdFeHBvcnRlZCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlzKGV2ZW50KSB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdO1xuICAgIGlmICghZmlsZSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuXG4gICAgICAgIGxldCBrZXlzO1xuICAgICAgICBpZiAocGFyc2VkLmVuY3J5cHRlZCAmJiBwYXJzZWQuZGF0YSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLmRlY3J5cHQnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgY2lwaGVyVGV4dDogcGFyc2VkLmRhdGEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHNob3dUb2FzdCgnRGVjcnlwdCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleXMgPSBKU09OLnBhcnNlKHJlc3VsdC5wbGFpblRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IHBhcnNlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgaW1wb3J0ZWQgfSA9IGF3YWl0IGltcG9ydFN0b3JlKGtleXMpO1xuICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgICAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydGVkICcgKyBpbXBvcnRlZCArICcga2V5cycpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2hvd1RvYXN0KCdJbXBvcnQgZmFpbGVkOiAnICsgZS5tZXNzYWdlKTtcbiAgICB9XG5cbiAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbn1cblxuLy8gLS0tIEV2ZW50IGJpbmRpbmcgLS0tXG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgnc3luYy1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzeW5jQWxsKTtcbiAgICAkKCdhZGQta2V5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFkZEtleSk7XG4gICAgJCgnZXhwb3J0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV4cG9ydEtleXMpO1xuICAgICQoJ2ltcG9ydC1maWxlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGltcG9ydEtleXMpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcblxuICAgICQoJ3N5bmMtdG9nZ2xlJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9ICFzdGF0ZS5zeW5jRW5hYmxlZDtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHRvZ2dsZVN5bmMoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1sYWJlbCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld0xhYmVsID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbmV3LXNlY3JldCcpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLm5ld1NlY3JldCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0dhdGUoZ2F0ZSwgbWFpbiwgeyB0aXRsZSwgbWVzc2FnZSwgYnV0dG9uIH0pIHtcbiAgICBpZiAoZ2F0ZSkgZ2F0ZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGNvbnN0IHQgPSAkKCdnYXRlLXRpdGxlJyk7IGlmICh0ICYmIHRpdGxlKSB0LnRleHRDb250ZW50ID0gdGl0bGU7XG4gICAgY29uc3QgbSA9ICQoJ2dhdGUtbWVzc2FnZScpOyBpZiAobSAmJiBtZXNzYWdlKSBtLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICBjb25zdCBiID0gJCgnZ2F0ZS1zZWN1cml0eS1idG4nKTsgaWYgKGIgJiYgYnV0dG9uKSBiLnRleHRDb250ZW50ID0gYnV0dG9uO1xuICAgIGI/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBhcGkucnVudGltZS5nZXRVUkwoJ3NlY3VyaXR5L3NlY3VyaXR5Lmh0bWwnKTtcbiAgICAgICAgd2luZG93Lm9wZW4odXJsLCAnbm9zdHJrZXktb3B0aW9ucycpO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIC8vIEdhdGU6IHJlcXVpcmUgbWFzdGVyIHBhc3N3b3JkIEFORCBhbiB1bmxvY2tlZCBzZXNzaW9uIGJlZm9yZSByZW5kZXJpbmcuXG4gICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBhd2FpdCBhc2tHYXRlKCdpc0VuY3J5cHRlZCcpO1xuICAgIGNvbnN0IGxvY2tlZCA9IGF3YWl0IGFza0dhdGUoJ2lzTG9ja2VkJyk7XG4gICAgY29uc3QgZ2F0ZSA9ICQoJ3ZhdWx0LWxvY2tlZC1nYXRlJyk7XG4gICAgY29uc3QgbWFpbiA9ICQoJ3ZhdWx0LW1haW4tY29udGVudCcpO1xuXG4gICAgaWYgKCFpc0VuY3J5cHRlZCkge1xuICAgICAgICAvLyBObyBtYXN0ZXIgcGFzc3dvcmQgc2V0IHlldCBcdTIwMTQgZGV2aWNlLWtleSBlbmNyeXB0aW9uIGlzIGFjdGl2ZSBidXQgdGhlXG4gICAgICAgIC8vIHZhdWx0IFVJIHN0aWxsIGFza3MgdGhlIHVzZXIgdG8gc2V0IGEgcGFzc3dvcmQgZmlyc3QuXG4gICAgICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgICAgICBzaG93R2F0ZShnYXRlLCBtYWluLCB7fSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobG9ja2VkKSB7XG4gICAgICAgIC8vIEY1OiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgcmVmdXNlIHRvIHJlYWQvcmVuZGVyIGFueSBBUEkta2V5IHNlY3JldC5cbiAgICAgICAgc2V0VW5sb2NrZWQoZmFsc2UpO1xuICAgICAgICBzaG93R2F0ZShnYXRlLCBtYWluLCB7XG4gICAgICAgICAgICB0aXRsZTogJ1ZhdWx0IExvY2tlZCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnVW5sb2NrIE5vc3RyS2V5IHdpdGggeW91ciBtYXN0ZXIgcGFzc3dvcmQgdG8gdmlldyB5b3VyIEFQSSBrZXlzLicsXG4gICAgICAgICAgICBidXR0b246ICdVbmxvY2snLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFVubG9ja2VkKHRydWUpO1xuICAgIGlmIChnYXRlKSBnYXRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICBjb25zdCByZWxheXMgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICd2YXVsdC5nZXRSZWxheXMnIH0pO1xuICAgIHN0YXRlLnJlbGF5SW5mbyA9IHJlbGF5cyB8fCB7IHJlYWQ6IFtdLCB3cml0ZTogW10gfTtcbiAgICBzdGF0ZS5zeW5jRW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICByZW5kZXIoKTtcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBzeW5jQWxsKCk7XG4gICAgfVxufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gc3RhcnRQYWdlKGluaXQpKTtcbiIsICIvKipcbiAqIFRoZSBxdWVzdGlvbnMgYSBwYWdlIGFza3MgdGhlIHdvcmtlciBiZWZvcmUgaXQgY2FuIGRyYXcgYW55dGhpbmcuIFRoZSB3b3JrZXJcbiAqIGNhbiBhbnN3ZXIgdGhlbSB3aXRoIGEgcmVmdXNhbCBvYmplY3QsIGFuZCBhbiBvYmplY3QgaXMgdHJ1dGh5LCBzbyBhIHBhZ2UgdGhhdFxuICogcmVhZHMgaXQgYXMgYSB5ZXMgc2hvd3MgdGhlIHdyb25nIHNjcmVlbi4gUGFnZXMgYXNrIHRocm91Z2ggYXNrR2F0ZSBpbnN0ZWFkOlxuICogYSByZWZ1c2FsIHJlcGxhY2VzIHRoZSBwYWdlIHdpdGggYSBwbGFpbiBtZXNzYWdlIGFuZCBzdG9wcyBpdHMgc3RhcnQtdXAuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuZXhwb3J0IGNvbnN0IFNUQVJUX0VSUk9SID0gJ05vc3RyS2V5IGNvdWxkIG5vdCBzdGFydCB0aGlzIHBhZ2UuIFJlbG9hZCBvciByZWluc3RhbGwuJztcblxuZXhwb3J0IGNsYXNzIEdhdGVSZWZ1c2VkIGV4dGVuZHMgRXJyb3Ige31cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmdXNlZChhbnN3ZXIpIHtcbiAgICByZXR1cm4gISFhbnN3ZXIgJiYgdHlwZW9mIGFuc3dlciA9PT0gJ29iamVjdCcgJiYgYW5zd2VyLnN1Y2Nlc3MgPT09IGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd1N0YXJ0RXJyb3IoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBtZXNzYWdlLnNldEF0dHJpYnV0ZSgncm9sZScsICdhbGVydCcpO1xuICAgIG1lc3NhZ2UuZGF0YXNldC5zdGFydEVycm9yID0gJyc7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFNUQVJUX0VSUk9SO1xuICAgIG1lc3NhZ2Uuc3R5bGUucGFkZGluZyA9ICcxNnB4JztcbiAgICBkb2N1bWVudC5ib2R5LnJlcGxhY2VDaGlsZHJlbihtZXNzYWdlKTtcbn1cblxuLyoqIEFzayB0aGUgd29ya2VyLiBPbiBhIHJlZnVzYWwsIHNob3cgdGhlIG1lc3NhZ2UgYW5kIHRocm93IEdhdGVSZWZ1c2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFza0dhdGUoa2luZCkge1xuICAgIGNvbnN0IGFuc3dlciA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZCB9KTtcbiAgICBpZiAoaXNSZWZ1c2VkKGFuc3dlcikpIHtcbiAgICAgICAgc2hvd1N0YXJ0RXJyb3IoKTtcbiAgICAgICAgdGhyb3cgbmV3IEdhdGVSZWZ1c2VkKCk7XG4gICAgfVxuICAgIHJldHVybiBhbnN3ZXI7XG59XG5cbi8vIEF0IG1vc3Qgb25lIG5vdGUgaW4gdGhpcyB0aW1lLCBob3dldmVyIGJ1c3kgdGhlIHBlcnNvbiBpcy5cbmNvbnN0IEFDVElWSVRZX05PVEVfTVMgPSAzMF8wMDA7XG5cbi8qKlxuICogVXNpbmcgb25lIG9mIE5vc3RyS2V5J3Mgb3duIHBhZ2VzIGNvdW50cyBhcyBhY3Rpdml0eSBmb3IgYXV0by1sb2NrLCBhcyBkb2VzXG4gKiBhbnN3ZXJpbmcgYSByZXF1ZXN0LiBTaXRlIHJlcXVlc3RzLCBldmVuIG9uZXMgc2lnbmVkIHVuZGVyIGEgcmVtZW1iZXJlZFxuICogZ3JhbnQsIG5ldmVyIGNvdW50LlxuICovXG5mdW5jdGlvbiB3YXRjaEFjdGl2aXR5KCkge1xuICAgIGxldCBsYXN0Tm90ZSA9IDA7XG4gICAgY29uc3Qgbm90ZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSBsYXN0Tm90ZSA8IEFDVElWSVRZX05PVEVfTVMpIHJldHVybjtcbiAgICAgICAgbGFzdE5vdGUgPSBEYXRlLm5vdygpO1xuICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdyZXNldEF1dG9Mb2NrJyB9KT8uY2F0Y2g/LigoKSA9PiB7fSk7XG4gICAgfTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG5vdGUsIHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbm90ZSwgeyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH0pO1xufVxuXG4vKiogUnVuIGEgcGFnZSdzIHN0YXJ0LXVwLiBBIHJlZnVzYWwgaGFzIGFscmVhZHkgYmVlbiBzaG93biwgc28gaXQgZW5kcyBoZXJlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0UGFnZShpbml0KSB7XG4gICAgd2F0Y2hBY3Rpdml0eSgpO1xuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGluaXQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBHYXRlUmVmdXNlZCkpIHRocm93IGU7XG4gICAgfVxufVxuIiwgIi8qKlxuICogaW5zLWNvbmZpcm0uanMgXHUyMDE0IHRoZSBzaGFyZWQgY29uc2VudCBvdmVybGF5IGZvciBleHRlbnNpb24gcGFnZXMuXG4gKlxuICogT25lIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb25zZW50LXN1cmZhY2Ugc3RhbmRhcmQ6IGEgZGltbWVkIGJhY2tkcm9wIHBsdXNcbiAqIGVpdGhlciBhIGJvdHRvbSBTSEVFVCAoZGVmYXVsdDsgZGVzdHJ1Y3RpdmUgLyBpcnJldmVyc2libGUgYWN0cykgb3IgYVxuICogY2VudGVyZWQgUE9QT1ZFUiAobG93LXN0YWtlcywgcmV2ZXJzaWJsZSBhY3RzKS4gUmVwbGFjZXMgbmF0aXZlXG4gKiBjb25maXJtKCkvYWxlcnQoKSBvbiBldmVyeSBleHRlbnNpb24tcGFnZSBzdXJmYWNlLlxuICpcbiAqICAgaW5zQ29uZmlybSh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8Ym9vbGVhbj4gICAodHJ1ZSA9IGNvbmZpcm1lZDsgRXNjYXBlL2JhY2tkcm9wL2NhbmNlbCA9IGZhbHNlKVxuICogICBpbnNOb3RpY2UoeyB0aXRsZSwgYm9keSwgZGlzbWlzc0xhYmVsIH0pXG4gKiAgICAgICBcdTIxOTIgUHJvbWlzZTx2b2lkPlxuICpcbiAqIFN0eWxpbmcgY29tZXMgZW50aXJlbHkgZnJvbSBpbnN0cnVtZW50LmNzcyAoc2VjdGlvbiAxOCArIHRoZSAuYnRuIGZhbWlseSksXG4gKiBzbyBza2luIC8gbW9kZSAvIGNvbnRyYXN0IC8gZGVuc2l0eSAvIHRleHQtc2l6ZSBhcnJpdmUgdmlhIHRoZSBwYWdlJ3NcbiAqIHN0YW1wZWQgZGF0YS1pbnMtKiBhdHRyaWJ1dGVzIFx1MjAxNCBubyBzdG9yYWdlIGFjY2Vzcywgbm8gbWVzc2FnaW5nIGhlcmUuXG4gKlxuICogU2FmZXR5OiB0aXRsZS9ib2R5IG1heSBjb250YWluIHVzZXIgZGF0YSAoa2V5IGxhYmVscywgdmF1bHQgcGF0aHMpOyB0aGUgRE9NXG4gKiBpcyBidWlsdCB3aXRoIGNyZWF0ZUVsZW1lbnQgKyB0ZXh0Q29udGVudCBPTkxZIFx1MjAxNCBuZXZlciBpbm5lckhUTUwuXG4gKi9cblxuLy8gU2VyaWFsaXplIG92ZXJsYXBwaW5nIGNhbGxzIHNvIGEgc2Vjb25kIGRpYWxvZyBuZXZlciBkb3VibGUtcmVuZGVycyBvbiB0b3Bcbi8vIG9mIChvciBpbnRlcmxlYXZlcyB3aXRoKSBhbiBvcGVuIG9uZS5cbmxldCBxdWV1ZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5sZXQgaWRDb3VudGVyID0gMDtcblxuZnVuY3Rpb24gbW90aW9uT2ZmKCkge1xuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWlucy1tb3Rpb24nKSA9PT0gJ29mZicpIHJldHVybiB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSknKS5tYXRjaGVzO1xuICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBCdWlsZCwgc2hvdyBhbmQgc2V0dGxlIG9uZSBkaWFsb2cuIFJlc29sdmVzIHRydWUgKGNvbmZpcm0pIG9yIGZhbHNlXG4gKiAoY2FuY2VsIC8gRXNjYXBlIC8gYmFja2Ryb3AgY2xpY2spLlxuICovXG5mdW5jdGlvbiBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2UgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2Rm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcm9vdC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtcm9vdCc7XG5cbiAgICAgICAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJhY2tkcm9wJztcblxuICAgICAgICBjb25zdCBpc1NoZWV0ID0gdmFyaWFudCAhPT0gJ3BvcG92ZXInO1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTmFtZSA9IGlzU2hlZXQgPyAnaW5zLWNvbnNlbnQtc2hlZXQnIDogJ2lucy1jb25zZW50LXBvcG92ZXInO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdyb2xlJywgKGRlc3RydWN0aXZlIHx8IG5vdGljZSkgPyAnYWxlcnRkaWFsb2cnIDogJ2RpYWxvZycpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgJ3RydWUnKTtcblxuICAgICAgICBpZiAoaXNTaGVldCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBoYW5kbGUuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWhhbmRsZSc7XG4gICAgICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoaGFuZGxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVpZCA9ICsraWRDb3VudGVyO1xuICAgICAgICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGl0bGVFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtdGl0bGUnO1xuICAgICAgICB0aXRsZUVsLmlkID0gYGlucy1jb25zZW50LXRpdGxlLSR7dWlkfWA7XG4gICAgICAgIHRpdGxlRWwudGV4dENvbnRlbnQgPSB0aXRsZSB8fCAnJztcbiAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKHRpdGxlRWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknLCB0aXRsZUVsLmlkKTtcblxuICAgICAgICBjb25zdCBib2R5RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGJvZHlFbC5jbGFzc05hbWUgPSAnaW5zLWNvbnNlbnQtYm9keSc7XG4gICAgICAgIGJvZHlFbC5pZCA9IGBpbnMtY29uc2VudC1ib2R5LSR7dWlkfWA7XG4gICAgICAgIGJvZHlFbC50ZXh0Q29udGVudCA9IGJvZHkgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChib2R5RWwpO1xuICAgICAgICBkaWFsb2cuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgYm9keUVsLmlkKTtcblxuICAgICAgICBjb25zdCBhY3Rpb25zID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGFjdGlvbnMuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWFjdGlvbnMnO1xuXG4gICAgICAgIGNvbnN0IGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgbGV0IGNhbmNlbEJ0biA9IG51bGw7XG4gICAgICAgIGNvbnN0IGNvbmZpcm1CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgY29uZmlybUJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGNvbmZpcm1CdG4udGV4dENvbnRlbnQgPSBjb25maXJtTGFiZWw7XG4gICAgICAgIGlmIChub3RpY2UpIHtcbiAgICAgICAgICAgIGNvbmZpcm1CdG4uY2xhc3NOYW1lID0gJ2J0bic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5jZWxCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgICAgICBjYW5jZWxCdG4uY2xhc3NOYW1lID0gJ2J0biBidG4tLWdob3N0JztcbiAgICAgICAgICAgIGNhbmNlbEJ0bi50ZXh0Q29udGVudCA9IGNhbmNlbExhYmVsO1xuICAgICAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGNhbmNlbEJ0bik7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9IGRlc3RydWN0aXZlID8gJ2J0biBidG4tLWRlc3RydWN0aXZlJyA6ICdidG4gYnRuLS1wcmltYXJ5JztcbiAgICAgICAgfVxuICAgICAgICBhY3Rpb25zLmFwcGVuZENoaWxkKGNvbmZpcm1CdG4pO1xuICAgICAgICBidXR0b25zLnB1c2goY29uZmlybUJ0bik7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZChhY3Rpb25zKTtcblxuICAgICAgICByb290LmFwcGVuZENoaWxkKGJhY2tkcm9wKTtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChkaWFsb2cpO1xuXG4gICAgICAgIGxldCBzZXR0bGVkID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIHNldHRsZShyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0bGVkKSByZXR1cm47XG4gICAgICAgICAgICBzZXR0bGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByb290LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Rm9jdXMgJiYgdHlwZW9mIHByZXZGb2N1cy5mb2N1cyA9PT0gJ2Z1bmN0aW9uJyAmJiBkb2N1bWVudC5jb250YWlucyhwcmV2Rm9jdXMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHsgLyogZm9jdXMgcmVzdG9yZSBpcyBiZXN0LWVmZm9ydCAqLyB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChtb3Rpb25PZmYoKSkgZmluaXNoKCk7XG4gICAgICAgICAgICBlbHNlIHNldFRpbWVvdXQoZmluaXNoLCAyNTApO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gb25LZXlkb3duKGV2KSB7XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgc2V0dGxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXYua2V5ID09PSAnVGFiJykge1xuICAgICAgICAgICAgICAgIC8vIFRyYXAgZm9jdXMgYWNyb3NzIHRoZSBkaWFsb2cncyBidXR0b25zIG9ubHkuXG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBidXR0b25zLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlyID0gZXYuc2hpZnRLZXkgPyAtMSA6IDE7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1soaWR4ICsgZGlyICsgYnV0dG9ucy5sZW5ndGgpICUgYnV0dG9ucy5sZW5ndGhdLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBiYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZShmYWxzZSkpO1xuICAgICAgICBpZiAoY2FuY2VsQnRuKSBjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgY29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHNldHRsZSh0cnVlKSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24sIHRydWUpO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocm9vdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgLy8gRGVzdHJ1Y3RpdmUgYWN0cyBzdGFydCBvbiBDYW5jZWwgc28gRW50ZXIgY2FuJ3QgcnVzaCB0aGUgZGVsZXRlO1xuICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBlbHNlIHN0YXJ0cyBvbiB0aGUgY29uZmlybWluZyBhY3Rpb24uXG4gICAgICAgICAgICBjb25zdCBpbml0aWFsID0gbm90aWNlID8gY29uZmlybUJ0biA6IChkZXN0cnVjdGl2ZSA/IGNhbmNlbEJ0biA6IGNvbmZpcm1CdG4pO1xuICAgICAgICAgICAgKGluaXRpYWwgfHwgY29uZmlybUJ0bikuZm9jdXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNDb25maXJtKHtcbiAgICB0aXRsZSxcbiAgICBib2R5LFxuICAgIGNvbmZpcm1MYWJlbCA9ICdDb25maXJtJyxcbiAgICBjYW5jZWxMYWJlbCA9ICdDYW5jZWwnLFxuICAgIGRlc3RydWN0aXZlID0gZmFsc2UsXG4gICAgdmFyaWFudCA9ICdzaGVldCcsXG59ID0ge30pIHtcbiAgICBjb25zdCByZXN1bHQgPSBxdWV1ZS50aGVuKCgpID0+XG4gICAgICAgIG9wZW5EaWFsb2coeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQsIG5vdGljZTogZmFsc2UgfSkpO1xuICAgIHF1ZXVlID0gcmVzdWx0LmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCA9ICdPSycgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGNvbmZpcm1MYWJlbDogZGlzbWlzc0xhYmVsLFxuICAgICAgICAgICAgY2FuY2VsTGFiZWw6ICcnLFxuICAgICAgICAgICAgZGVzdHJ1Y3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgdmFyaWFudDogJ3NoZWV0JyxcbiAgICAgICAgICAgIG5vdGljZTogdHJ1ZSxcbiAgICAgICAgfSkudGhlbigoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIEFQSSBLZXkgU3RvcmUgXHUyMDE0IExvY2FsIGNhY2hlIGZvciBlbmNyeXB0ZWQgQVBJIGtleXNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIGFwaUtleVZhdWx0OiB7XG4gKiAgICAga2V5czoge1xuICogICAgICAgXCI8dXVpZD5cIjogeyBpZCwgbGFiZWwsIHNlY3JldCwgY3JlYXRlZEF0LCB1cGRhdGVkQXQsIHByb2ZpbGVTY29wZSB9XG4gKiAgICAgfSxcbiAqICAgICBzeW5jRW5hYmxlZDogdHJ1ZSxcbiAqICAgICBldmVudElkOiBudWxsLFxuICogICAgIHJlbGF5Q3JlYXRlZEF0OiBudWxsLFxuICogICAgIHN5bmNTdGF0dXM6IFwic3luY2VkXCIgICAgLy8gc3luY2VkIHwgbG9jYWwtb25seSB8IGNvbmZsaWN0XG4gKiAgIH1cbiAqXG4gKiBwcm9maWxlU2NvcGU6IG51bGwgKGFsbCBwcm9maWxlcykgfCBudW1iZXJbXSAoc3BlY2lmaWMgcHJvZmlsZSBpbmRpY2VzKVxuICovXG5cbmltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBzY2hlZHVsZVN5bmNQdXNoIH0gZnJvbSAnLi9zeW5jLW1hbmFnZXInO1xuaW1wb3J0IHsgd3JhcFNlY3JldCwgdW53cmFwU2VjcmV0LCBpc0NpcGhlcnRleHQgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmNvbnN0IFNUT1JBR0VfS0VZID0gJ2FwaUtleVZhdWx0Jztcbi8vIERlbGV0aW9uIHRvbWJzdG9uZXMga2V5ZWQgYnkgaWQgKGlzc3VlICMzKTogeyA8aWQ+OiBkZWxldGVkQXRTZWNvbmRzIH0uXG5jb25zdCBERUxFVEVEX0tFWSA9ICdkZWxldGVkS2V5cyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWxldGVkS2V5cygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbREVMRVRFRF9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtERUxFVEVEX0tFWV0gJiYgdHlwZW9mIGRhdGFbREVMRVRFRF9LRVldID09PSAnb2JqZWN0JyA/IGRhdGFbREVMRVRFRF9LRVldIDoge307XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGtleSdzIGBzZWNyZXRgIGZpZWxkIGZvciBjYWxsZXJzLiBSZS10aHJvd3MgbG9jayBlcnJvcnMgc28gYSBsb2NrZWRcbiAqIHNlc3Npb24gY2Fubm90IHJlYWQgc2VjcmV0cyAoRjUpLlxuICpcbiAqIEEgZ2VudWluZSBkZWNyeXB0IGZhaWx1cmUgKGUuZy4gYSBkZXZpY2Utd3JhcHBlZCB2YWx1ZSBzeW5jZWQgZnJvbSBhbm90aGVyXG4gKiBkZXZpY2UsIG9yIGEgYmxvYiB3aG9zZSB3cmFwcGluZyBrZXkgcm90YXRlZCBhd2F5KSBpcyByZXBvcnRlZCBhc1xuICogYHVuZGVjcnlwdGFibGU6IHRydWVgIHdpdGggYHNlY3JldDogbnVsbGAgXHUyMDE0IE5PVCBhcyBhbiBlbXB0eSBzdHJpbmcuIEFuIGVtcHR5XG4gKiBzdHJpbmcgaXMgaW5kaXN0aW5ndWlzaGFibGUgZnJvbSBhIHJlYWwgdmFsdWU6IHRoZSBVSSByZW5kZXJlZCBpdCBhcyBibGFua1xuICogYW5kIGV4cG9ydFN0b3JlKCkgd3JvdGUgaXQgaW50byB0aGUgdXNlcidzIGVuY3J5cHRlZCBiYWNrdXAsIHF1aWV0bHlcbiAqIHJlcGxhY2luZyB0aGUgb25seSBjb3B5IG9mIHRoZSBzZWNyZXQgd2l0aCBub3RoaW5nLiBgbnVsbGAgKyB0aGUgZmxhZyBtYWtlc1xuICogdGhlIGZhaWx1cmUgdmlzaWJsZSB0byBldmVyeSBjYWxsZXIsIGFuZCBleHBvcnRTdG9yZSgpIGNhcnJpZXMgdGhlIHVudG91Y2hlZFxuICogY2lwaGVydGV4dCBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0S2V5KGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4ga2V5O1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IC4uLmtleSwgc2VjcmV0OiBhd2FpdCB1bndyYXBTZWNyZXQoa2V5LnNlY3JldCkgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChTdHJpbmcoZS5tZXNzYWdlIHx8ICcnKS5zdGFydHNXaXRoKCdsb2NrZWQnKSkgdGhyb3cgZTtcbiAgICAgICAgcmV0dXJuIHsgLi4ua2V5LCBzZWNyZXQ6IG51bGwsIHVuZGVjcnlwdGFibGU6IHRydWUgfTtcbiAgICB9XG59XG5cbmNvbnN0IERFRkFVTFRfU1RPUkUgPSB7XG4gICAga2V5czoge30sXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZXZlbnRJZDogbnVsbCxcbiAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAgICBzeW5jU3RhdHVzOiAnc3luY2VkJyxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtTVE9SQUdFX0tFWV06IERFRkFVTFRfU1RPUkUgfSk7XG4gICAgcmV0dXJuIHsgLi4uREVGQVVMVF9TVE9SRSwgLi4uZGF0YVtTVE9SQUdFX0tFWV0gfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmUoc3RvcmUpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZ1bGwgQVBJIGtleSBzdG9yZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXlTdG9yZSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGtleXNbaWRdID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgIH1cbiAgICByZXR1cm4geyAuLi5zdG9yZSwga2V5cyB9O1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBBUEkga2V5IGJ5IGlkIChzZWNyZXQgZGVjcnlwdGVkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fG51bGw+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBzdG9yZS5rZXlzW2lkXSA/IGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pIDogbnVsbDtcbn1cblxuLyoqXG4gKiBVcHNlcnQgYW4gQVBJIGtleS4gQ3JlYXRlcyBpZiBuZXcsIHVwZGF0ZXMgaWYgZXhpc3RpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBVVUlEXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWNyZXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBzdG9yZS5rZXlzW2lkXTtcbiAgICAvLyBUMC00OiBlbmNyeXB0IHRoZSBzZWNyZXQgYmVmb3JlIGl0IHRvdWNoZXMgc3RvcmFnZS5cbiAgICBzdG9yZS5rZXlzW2lkXSA9IHtcbiAgICAgICAgaWQsXG4gICAgICAgIGxhYmVsLFxuICAgICAgICBzZWNyZXQ6IGF3YWl0IHdyYXBTZWNyZXQoc2VjcmV0KSxcbiAgICAgICAgY3JlYXRlZEF0OiBleGlzdGluZz8uY3JlYXRlZEF0IHx8IG5vdyxcbiAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgLy8gUmVjcmVhdGUgY2xlYXJzIGFueSB0b21ic3RvbmUgZm9yIHRoaXMgaWQgKGlzc3VlICMzKSBzbyB0aGUgZnJlc2hseSBzYXZlZFxuICAgIC8vIGtleSBpcyBubyBsb25nZXIgc3VwcHJlc3NlZCBmcm9tIHRoZSBzeW5jIHBheWxvYWQuXG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWRLZXlzKCk7XG4gICAgaWYgKGRlbGV0ZWRbaWRdICE9IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIGRlbGV0ZWRbaWRdO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgICAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSk7XG59XG5cbi8qKlxuICogRGVsZXRlIGFuIEFQSSBrZXkgYnkgaWQgYW5kIHJlY29yZCBhIHRvbWJzdG9uZSAoaXNzdWUgIzMpIHNvIHRoZSBkZWxldGlvblxuICogcHJvcGFnYXRlcyB0aHJvdWdoIHN0b3JhZ2Uuc3luYyBhbmQgYSBzdGFsZSB3aG9sZS1vYmplY3Qgb3ZlcndyaXRlIGZyb21cbiAqIGFub3RoZXIgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgaXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZGVsZXRlIHN0b3JlLmtleXNbaWRdO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkS2V5cygpO1xuICAgIGRlbGV0ZWRbaWRdID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBzdG9yZSwgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgQVBJIGtleXMgc29ydGVkIGJ5IGxhYmVsIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RBcGlLZXlzKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHRLZXkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKlxuICogQSBrZXkgdGhpcyBkZXZpY2UgY2Fubm90IGRlY3J5cHQgaXMgTkVWRVIgZXhwb3J0ZWQgd2l0aCBhbiBlbXB0eS9udWxsIHNlY3JldFxuICogXHUyMDE0IGEgYmxhbmsgd291bGQgb3ZlcndyaXRlIHRoZSByZWNvdmVyYWJsZSBjaXBoZXJ0ZXh0IHRoZSBuZXh0IHRpbWUgdGhlIGJhY2t1cFxuICogaXMgaW1wb3J0ZWQuIEl0IGlzIGV4cG9ydGVkIGFzIHRoZSBPUklHSU5BTCBDSVBIRVJURVhULFxuICogdW50b3VjaGVkOiB0aGF0IHByZXNlcnZlcyBzdHJpY3RseSBtb3JlIHVzZXIgZGF0YSB0aGFuIG9taXR0aW5nIGl0ICh0aGUgdmFsdWVcbiAqIGlzIHN0aWxsIHJlY292ZXJhYmxlIG9uIGEgZGV2aWNlIHRoYXQgaG9sZHMgdGhlIHdyYXBwaW5nIGtleSwgb3Igb25jZSB0aGUga2V5XG4gKiBpcyByZXN0b3JlZCksIGFuZCBpbXBvcnRTdG9yZSgpIGFscmVhZHkgcGFzc2VzIGNpcGhlcnRleHQgc3RyYWlnaHQgdGhyb3VnaFxuICogaW5zdGVhZCBvZiByZS13cmFwcGluZyBpdCwgc28gdGhlIHJvdW5kIHRyaXAgaXMgbG9zc2xlc3MuIFRoZSBpZHMgYXJlIGFsc29cbiAqIHJlcG9ydGVkIHNvIHRoZSBjYWxsZXIgY2FuIHRlbGwgdGhlIHVzZXIgd2hpY2gga2V5cyBjYW1lIHRocm91Z2ggdW5vcGVuZWQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e2tleXM6IE9iamVjdCwgdW5kZWNyeXB0YWJsZTogc3RyaW5nW119Pn0gTWFwIG9mIGlkIC0+IGtleVxuICogICAgICAgICAgZGF0YSwgcGx1cyB0aGUgbGFiZWxzL2lkcyB0aGF0IHdlcmUgZXhwb3J0ZWQgc3RpbGwtZW5jcnlwdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U3RvcmUoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBjb25zdCB1bmRlY3J5cHRhYmxlID0gW107XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoZGVjcnlwdGVkPy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgICAgICBrZXlzW2lkXSA9IHsgLi4ua2V5IH07ICAgICAgICAgICAgLy8gY2lwaGVydGV4dCBjYXJyaWVkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgICAgIHVuZGVjcnlwdGFibGUucHVzaChrZXkubGFiZWwgfHwgaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAga2V5c1tpZF0gPSBkZWNyeXB0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB7IGtleXMsIHVuZGVjcnlwdGFibGUgfTtcbn1cblxuLyoqXG4gKiBUaGUga2V5cyB0byBzZW5kIHRvIHRoZSByZWxheTogb25seSB0aG9zZSB0aGlzIGRldmljZSBjYW4gcmVhZC4gQSBrZXkgaXRcbiAqIGNhbm5vdCByZWFkIGlzIGxlZnQgb3V0LCBzbyB0aGUgY29weSBvbiB0aGUgZGV2aWNlIHRoYXQgY2FuIHJlYWQgaXQgc3RheXNcbiAqIHRoZSBnb29kIG9uZSB3aGVuIHRoYXQgZGV2aWNlIGltcG9ydHMgd2hhdCB3YXMgc2VudC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBNYXAgb2YgaWQgLT4ga2V5IGRhdGEgd2l0aCBwbGFpbnRleHQgc2VjcmV0c1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2V5c0ZvclJlbGF5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBrZXlzID0ge307XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoaGFzVXNhYmxlU2VjcmV0KGRlY3J5cHRlZCkpIGtleXNbaWRdID0gZGVjcnlwdGVkO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gaGFzVXNhYmxlU2VjcmV0KGtleSkge1xuICAgIHJldHVybiAhIWtleSAmJiAha2V5LnVuZGVjcnlwdGFibGUgJiYgdHlwZW9mIGtleS5zZWNyZXQgPT09ICdzdHJpbmcnICYmIGtleS5zZWNyZXQgIT09ICcnO1xufVxuXG4vKipcbiAqIEltcG9ydCBrZXlzIGludG8gdGhlIHN0b3JlIChtZXJnZSBcdTIwMTQgZXhpc3Rpbmcga2V5cyB3aXRoIHNhbWUgaWQgYXJlIG92ZXJ3cml0dGVuKS5cbiAqIEluY29taW5nIHNlY3JldHMgYXJlIHBsYWludGV4dCAoZnJvbSBhIGRlY3J5cHRlZCBiYWNrdXAgb3IgYSByZWxheSBmZXRjaCkgYW5kXG4gKiBhcmUgcmUtd3JhcHBlZCBmb3IgdGhlIGF0LXJlc3QgdGllciB0aGlzIGNvbnRleHQgaXMgaW4gXHUyMDE0IHRoZSBkZXZpY2Uga2V5LCBvclxuICogdGhlIHBhc3N3b3JkIHNlc3Npb24ga2V5IHdoZW4gb25lIGlzIGxpdmUgXHUyMDE0IGJlZm9yZSBzdG9yYWdlLlxuICpcbiAqIEFuIGVudHJ5IHdpdGggbm8gdXNhYmxlIHNlY3JldCBpcyBza2lwcGVkLCBzbyBpdCBjYW4gbmVpdGhlciByZXBsYWNlIGEgZ29vZFxuICogc2VjcmV0IG5vciBhZGQgYSBrZXkgd2l0aCBub3RoaW5nIGluIGl0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBrZXlzIC0gTWFwIG9mIGlkIC0+IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IH1cbiAqIEByZXR1cm5zIHtQcm9taXNlPHtpbXBvcnRlZDogbnVtYmVyLCBza2lwcGVkOiBudW1iZXJ9Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydFN0b3JlKGtleXMpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgbGV0IGltcG9ydGVkID0gMDtcbiAgICBsZXQgc2tpcHBlZCA9IDA7XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoa2V5cykpIHtcbiAgICAgICAgaWYgKCFoYXNVc2FibGVTZWNyZXQoa2V5KSkge1xuICAgICAgICAgICAgc2tpcHBlZCsrO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VjcmV0ID0gaXNDaXBoZXJ0ZXh0KGtleS5zZWNyZXQpID8ga2V5LnNlY3JldCA6IGF3YWl0IHdyYXBTZWNyZXQoa2V5LnNlY3JldCk7XG4gICAgICAgIHN0b3JlLmtleXNbaWRdID0geyAuLi5rZXksIHNlY3JldCB9O1xuICAgICAgICBpbXBvcnRlZCsrO1xuICAgIH1cbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG4gICAgcmV0dXJuIHsgaW1wb3J0ZWQsIHNraXBwZWQgfTtcbn1cbiIsICIvKipcbiAqIFN5bmMgTWFuYWdlciBcdTIwMTQgUGxhdGZvcm0gc3luYyB2aWEgc3RvcmFnZS5zeW5jIChDaHJvbWUgXHUyMTkyIEdvb2dsZSwgU2FmYXJpIFx1MjE5MiBpQ2xvdWQpXG4gKlxuICogQXJjaGl0ZWN0dXJlOlxuICogICBXcml0ZTogYXBwIFx1MjE5MiBzdG9yYWdlLmxvY2FsIFx1MjE5MiBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMTkyIHN0b3JhZ2Uuc3luY1xuICogICBSZWFkOiAgcHVsbEZyb21TeW5jKCkgb24gc3RhcnR1cCBcdTIxOTIgbWVyZ2UgaW50byBzdG9yYWdlLmxvY2FsXG4gKiAgIExpc3Rlbjogc3RvcmFnZS5vbkNoYW5nZWQoXCJzeW5jXCIpIFx1MjE5MiBtZXJnZSByZW1vdGUgY2hhbmdlcyBpbnRvIGxvY2FsXG4gKlxuICogc3RvcmFnZS5sb2NhbCByZW1haW5zIHRoZSBzb3VyY2Ugb2YgdHJ1dGguIHN0b3JhZ2Uuc3luYyBpcyBhIGJlc3QtZWZmb3J0IG1pcnJvci5cbiAqL1xuXG5pbXBvcnQgeyBtZXJnZVJlbW90ZSB9IGZyb20gJy4vc3luYy1tZXJnZSc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaXNDaXBoZXJ0ZXh0LCBpc1Bhc3N3b3JkQmxvYiB9IGZyb20gJy4vc2VjcmV0LXZhdWx0JztcbmltcG9ydCB7IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcywgcmVkYWN0UHJvZmlsZXMgfSBmcm9tICcuL2J1bmtlci11cmwuanMnO1xuaW1wb3J0IHsgd2l0aFByb2ZpbGVzTG9jayB9IGZyb20gJy4vcHJvZmlsZXMtc3RvcmUuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnN0YW50c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCBTWU5DX1FVT1RBID0gMTAyXzQwMDsgICAgICAgLy8gMTAwIEtCIHRvdGFsXG5jb25zdCBNQVhfSVRFTSA9IDhfMTkyOyAgICAgICAgICAgLy8gOCBLQiBwZXIgaXRlbVxuY29uc3QgTUFYX0lURU1TID0gNTEyO1xuY29uc3QgQ0hVTktfUFJFRklYID0gJ19jaHVuazonO1xuY29uc3QgU1lOQ19NRVRBX0tFWSA9ICdfc3luY19tZXRhJztcbmNvbnN0IExPQ0FMX0VOQUJMRURfS0VZID0gJ3BsYXRmb3JtU3luY0VuYWJsZWQnO1xuXG4vLyBQcmlvcml0eSB0aWVycyBmb3IgYnVkZ2V0IGFsbG9jYXRpb25cbmNvbnN0IFBSSU9SSVRZID0ge1xuICAgIC8vIFRvbWJzdG9uZXMgKGRlbGV0aW9uIHJlY29yZHMpIGdldCB0aGUgZ3VhcmFudGVlZCB0b3Agc2xvdDogYSBkZWxldGlvbiBtdXN0XG4gICAgLy8gbmV2ZXIgbG9zZSBpdHMgYnVkZ2V0IHJhY2UgdG8gYnVsa3kgdmF1bHQgY29udGVudCwgb3IgdGhlIGRlbGV0ZWQgaXRlbVxuICAgIC8vIHJlc3VycmVjdHMgb24gdGhlIG5leHQgZGV2aWNlIHRoYXQgc3RpbGwgaGFzIGEgc3RhbGUgY29weSAoaXNzdWUgIzMpLlxuICAgIFAwX1RPTUJTVE9ORVM6IDAsXG4gICAgUDFfUFJPRklMRVM6IDEsXG4gICAgUDJfU0VUVElOR1M6IDIsXG4gICAgUDNfQVBJS0VZUzogMyxcbiAgICBQNF9WQVVMVDogNCxcbn07XG5cbi8vIFdhcm5pbmcgdGhyZXNob2xkcyBmb3IgcmV0YWluZWQgZGVsZXRpb24gaGlzdG9yeSAodG9tYnN0b25lcyBhcmUga2VwdFxuLy8gZm9yZXZlciBzbyBhbiBvZmZsaW5lIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgYWJvdXQgYSBkZWxldGlvbiBjYW5ub3Rcbi8vIHJlc3VycmVjdCB0aGUgaXRlbSBcdTIwMTQgdGhlIGNvdW50IG9ubHkgZ3Jvd3MsIHNvIG51ZGdlIHRoZSB1c2VyIHRvIHRyaW0gaXQpLlxuY29uc3QgVE9NQlNUT05FX1dBUk5fR0VOVExFID0gODtcbmNvbnN0IFRPTUJTVE9ORV9XQVJOX1NUUk9ORyA9IDE2O1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5sZXQgcHVzaFRpbWVyID0gbnVsbDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDaHVua2luZyBoZWxwZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTcGxpdCBhIEpTT04tc2VyaWFsaXNlZCB2YWx1ZSBpbnRvIDw9OEtCIGNodW5rcy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgeyBrZXksIHZhbHVlIH0gcGFpcnMgcmVhZHkgZm9yIHN0b3JhZ2Uuc3luYy5zZXQoKS5cbiAqL1xuZnVuY3Rpb24gY2h1bmtWYWx1ZShrZXksIGpzb25TdHJpbmcpIHtcbiAgICBjb25zdCBjaHVua3MgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpzb25TdHJpbmcubGVuZ3RoOyBpICs9IE1BWF9JVEVNIC0gMTAwKSB7XG4gICAgICAgIC8vIFJlc2VydmUgfjEwMCBieXRlcyBmb3IgdGhlIGtleSBvdmVyaGVhZCBpbiB0aGUgc3RvcmVkIGl0ZW1cbiAgICAgICAgY2h1bmtzLnB1c2goanNvblN0cmluZy5zbGljZShpLCBpICsgTUFYX0lURU0gLSAxMDApKTtcbiAgICB9XG4gICAgaWYgKGNodW5rcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRml0cyBpbiBhIHNpbmdsZSBpdGVtIFx1MjAxNCBzdG9yZSBkaXJlY3RseVxuICAgICAgICByZXR1cm4gW3sga2V5LCB2YWx1ZToganNvblN0cmluZyB9XTtcbiAgICB9XG4gICAgLy8gTXVsdGlwbGUgY2h1bmtzXG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YCwgdmFsdWU6IGNodW5rc1tpXSB9KTtcbiAgICB9XG4gICAgLy8gU3RvcmUgYSBtZXRhZGF0YSBlbnRyeSBzbyB3ZSBrbm93IGhvdyBtYW55IGNodW5rcyB0aGVyZSBhcmVcbiAgICBlbnRyaWVzLnB1c2goeyBrZXksIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh7IF9fY2h1bmtlZDogdHJ1ZSwgY291bnQ6IGNodW5rcy5sZW5ndGggfSkgfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8qKlxuICogUmVhc3NlbWJsZSBjaHVua2VkIGRhdGEgZnJvbSBhIHN5bmMgZGF0YSBvYmplY3QuXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgSlNPTiB2YWx1ZSwgb3IgbnVsbCBvbiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gcmVhc3NlbWJsZUZyb21TeW5jRGF0YShrZXksIHN5bmNEYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICBpZiAoIW1ldGEgfHwgIW1ldGEuX19jaHVua2VkKSB7XG4gICAgICAgICAgICAvLyBOb3QgY2h1bmtlZCBcdTIwMTQgcGFyc2UgZGlyZWN0bHlcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3luY0RhdGFba2V5XSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKHN5bmNEYXRhW2tleV0pIDogc3luY0RhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29tYmluZWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtZXRhLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rS2V5ID0gYCR7Q0hVTktfUFJFRklYfSR7a2V5fToke2l9YDtcbiAgICAgICAgICAgIGlmIChzeW5jRGF0YVtjaHVua0tleV0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb21iaW5lZCArPSBzeW5jRGF0YVtjaHVua0tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoY29tYmluZWQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVmVyc2lvbiBjb21wYXJpc29uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDb21wYXJlIHR3byBkb3R0ZWQgdmVyc2lvbiBzdHJpbmdzIG51bWVyaWNhbGx5LlxuICogUmV0dXJucyAxIGlmIGEgPiBiLCAtMSBpZiBhIDwgYiwgMCBpZiBlcXVhbC4gTWlzc2luZyAvIG5vbi1udW1lcmljXG4gKiBjb21wb25lbnRzIGFyZSB0cmVhdGVkIGFzIDAgc28gJzEuMTAuMCcgY29ycmVjdGx5IHNvcnRzIGFib3ZlICcxLjkuMCdcbiAqIChhIHBsYWluIHN0cmluZyBjb21wYXJlIHdvdWxkIHB1dCAnMS45LjAnIGZpcnN0KS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNlbXZlcihhLCBiKSB7XG4gICAgY29uc3QgcGEgPSBTdHJpbmcoYSkuc3BsaXQoJy4nKTtcbiAgICBjb25zdCBwYiA9IFN0cmluZyhiKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KHBhLmxlbmd0aCwgcGIubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHggPSBwYXJzZUludChwYVtpXSwgMTApIHx8IDA7XG4gICAgICAgIGNvbnN0IHkgPSBwYXJzZUludChwYltpXSwgMTApIHx8IDA7XG4gICAgICAgIGlmICh4ID4geSkgcmV0dXJuIDE7XG4gICAgICAgIGlmICh4IDwgeSkgcmV0dXJuIC0xO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCBzeW5jIHBheWxvYWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJlYWQgYWxsIGxvY2FsIGRhdGEgYW5kIGJ1aWxkIGEgcHJpb3JpdGlzZWQgbGlzdCBvZiBlbnRyaWVzIHRvIHN5bmMuXG4gKiBSZXR1cm5zIHsgZW50cmllczogW3sga2V5LCBqc29uU3RyaW5nLCBwcmlvcml0eSwgc2l6ZSB9XSwgdG90YWxTaXplIH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3luY1BheWxvYWQoKSB7XG4gICAgY29uc3QgYWxsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuXG4gICAgLy8gVDAtNTogYSBzZWNyZXQgaXMgb25seSBldmVyIGVtaXR0ZWQgdG8gc3RvcmFnZS5zeW5jIChHb29nbGUvaUNsb3VkKSBpZiBpdFxuICAgIC8vIGlzIGFscmVhZHkgYW4gZW5jcnlwdGVkIGJsb2IuIEFueSB2YWx1ZSB0aGF0IGlzIE5PVCBjaXBoZXJ0ZXh0IGlzIHJlZnVzZWRcbiAgICAvLyAoZHJvcHBlZCkgc28gcGxhaW50ZXh0IHByaXZhdGUga2V5cyAvIEFQSSBzZWNyZXRzIC8gbm90ZXMgY2FuIG5ldmVyIGxlYXZlXG4gICAgLy8gdGhlIGRldmljZS4gYCcnYCAoZW1wdHkgLyBidW5rZXIpIGlzIGFsbG93ZWQgdGhyb3VnaCBhcyBub24tc2VjcmV0LlxuICAgIGNvbnN0IHNlY3JldE9rID0gdiA9PiAhdiB8fCBpc0NpcGhlcnRleHQodik7XG5cbiAgICAvLyBUb21ic3RvbmVzIChpc3N1ZSAjMykuIEEgZG9jL2tleSBpcyBzdXBwcmVzc2VkIGZyb20gdGhlIHBheWxvYWQgd2hlbiBhXG4gICAgLy8gdG9tYnN0b25lIGRhdGVkIGF0LW9yLWFmdGVyIGl0cyB1cGRhdGVkQXQgZXhpc3RzLCBzbyBhIHN0YWxlIGxvY2FsIGNvcHlcbiAgICAvLyBjYW5ub3QgcmUtcHVzaCBhIGRlbGV0ZWQgaXRlbSBiYWNrIGludG8gdGhlIG1pcnJvci5cbiAgICBjb25zdCBkZWxldGVkRG9jcyA9IChhbGwuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGFsbC5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWREb2NzIDoge307XG4gICAgY29uc3QgZGVsZXRlZEtleXMgPSAoYWxsLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBhbGwuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkS2V5cyA6IHt9O1xuICAgIGNvbnN0IGRlbGV0ZWRQcm9maWxlcyA9IChhbGwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBhbGwuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZFByb2ZpbGVzIDoge307XG5cbiAgICAvLyBBIHByb2ZpbGUncyBzdGFibGUgaWRlbnRpdHkgZm9yIHRvbWJzdG9uZSAvIHJlY2VuY3kga2V5aW5nOiBpdHMgcHVia2V5LFxuICAgIC8vIGVsc2UgKGZvciBhIGJ1bmtlcikgaXRzIHJlbW90ZSBwdWJrZXkuIE1hdGNoZXMgbWVyZ2VJbnRvTG9jYWwncyBpZGVudGl0eU9mLlxuICAgIGNvbnN0IGlkZW50aXR5T2YgPSAocCkgPT4gKHAgJiYgKHAucHViS2V5IHx8IHAucmVtb3RlUHVia2V5KSkgfHwgbnVsbDtcblxuICAgIC8vIFAwOiBUb21ic3RvbmVzIFx1MjAxNCB0aGUgZ3VhcmFudGVlZCBzbG90IChlbWl0dGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlKS5cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZERvY3MpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGRlbGV0ZWREb2NzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZERvY3MnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkS2V5cykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkS2V5cycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRQcm9maWxlcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZFByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnZGVsZXRlZFByb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFAxOiBQcm9maWxlcyAoc3RyaXAgYGhvc3RzYCB0byBzYXZlIHNwYWNlKSArIHByb2ZpbGVJbmRleFxuICAgIGlmIChhbGwucHJvZmlsZXMpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Qcm9maWxlcyA9IHJlZGFjdFByb2ZpbGVzKGFsbC5wcm9maWxlcylcbiAgICAgICAgICAgIC5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBwcm9maWxlIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KSxcbiAgICAgICAgICAgICAgICAvLyBzbyBhIHN0YWxlIGxvY2FsIGNvcHkgY2Fubm90IHJlLXB1c2ggYSBkZWxldGVkIGlkZW50aXR5LlxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShpZCAhPSBudWxsICYmIGRlbGV0ZWRQcm9maWxlc1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdID49IChwLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm1hcChwID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGhvc3RzLCAuLi5yZXN0IH0gPSBwO1xuICAgICAgICAgICAgICAgIGlmIChyZXN0LnByaXZLZXkgJiYgIXNlY3JldE9rKHJlc3QucHJpdktleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHByaXZLZXkgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdC5wcml2S2V5ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjbGVhblByb2ZpbGVzKTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDFfUFJPRklMRVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoYWxsLnByb2ZpbGVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGwucHJvZmlsZUluZGV4KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAncHJvZmlsZUluZGV4JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgLy8gTk9URTogYGlzRW5jcnlwdGVkYCAodGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGZsYWcpIGlzIGRlbGliZXJhdGVseSBOT1RcbiAgICAvLyBzeW5jZWQuIEl0IGlzIGEgcGVyLWRldmljZSBmYWN0IFx1MjAxNCBhIGRldmljZSBob2xkcyB0aGUgcGFzc3dvcmQgdmVyaWZpZXIgb3JcbiAgICAvLyBpdCBkb2VzIG5vdCBcdTIwMTQgYW5kIG1pcnJvcmluZyBpdCBvbmNlIGxhdGNoZWQgYSBwYXNzd29yZGxlc3MgZGV2aWNlIGludG8gYVxuICAgIC8vIGRlYWQtZW5kIGxvY2sgc2NyZWVuIGl0IGhhZCBubyBwYXNzd29yZCBmb3IuIFNlZSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkuXG5cbiAgICAvLyBQMjogU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5nc0tleXMgPSBbJ2F1dG9Mb2NrTWludXRlcycsICd2ZXJzaW9uJywgJ3Byb3RvY29sX2hhbmRsZXInLCBMT0NBTF9FTkFCTEVEX0tFWV07XG4gICAgZm9yIChjb25zdCBrIG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoYWxsW2tdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShhbGxba10pO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBrLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDJfU0VUVElOR1MsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXMoYWxsKSkge1xuICAgICAgICBpZiAoay5zdGFydHNXaXRoKCdmZWF0dXJlOicpKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFAzOiBBUEkga2V5IHZhdWx0IFx1MjAxNCBvbmx5IHN5bmMga2V5cyB3aG9zZSBzZWNyZXQgaXMgY2lwaGVydGV4dCAoVDAtNSlcbiAgICBpZiAoYWxsLmFwaUtleVZhdWx0ICYmIGFsbC5hcGlLZXlWYXVsdC5rZXlzKSB7XG4gICAgICAgIGNvbnN0IHNhZmVLZXlzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKGFsbC5hcGlLZXlWYXVsdC5rZXlzKSkge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBrZXkgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWRLZXlzW2lkXSAhPSBudWxsICYmIGRlbGV0ZWRLZXlzW2lkXSA+PSAoa2V5LnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlY3JldE9rKGtleS5zZWNyZXQpKSB7XG4gICAgICAgICAgICAgICAgc2FmZUtleXNbaWRdID0ga2V5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgQVBJIHNlY3JldCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNhZmVWYXVsdCA9IHsgLi4uYWxsLmFwaUtleVZhdWx0LCBrZXlzOiBzYWZlS2V5cyB9O1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoc2FmZVZhdWx0KTtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiAnYXBpS2V5VmF1bHQnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDNfQVBJS0VZUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDQ6IFZhdWx0IGRvY3MgKGluZGl2aWR1YWxseSwgbmV3ZXN0IGZpcnN0KSBcdTIwMTQgb25seSBpZiBjb250ZW50IGlzIGNpcGhlcnRleHRcbiAgICBpZiAoYWxsLnZhdWx0RG9jcyAmJiB0eXBlb2YgYWxsLnZhdWx0RG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY29uc3QgZG9jcyA9IE9iamVjdC52YWx1ZXMoYWxsLnZhdWx0RG9jcykuc29ydCgoYSwgYikgPT4gKGIudXBkYXRlZEF0IHx8IDApIC0gKGEudXBkYXRlZEF0IHx8IDApKTtcbiAgICAgICAgZm9yIChjb25zdCBkb2Mgb2YgZG9jcykge1xuICAgICAgICAgICAgLy8gU3VwcHJlc3MgYSBkb2MgYSB0b21ic3RvbmUgaGFzIHN1cGVyc2VkZWQgKGRlbGV0ZWRBdCA+PSB1cGRhdGVkQXQpLlxuICAgICAgICAgICAgaWYgKGRlbGV0ZWREb2NzW2RvYy5wYXRoXSAhPSBudWxsICYmIGRlbGV0ZWREb2NzW2RvYy5wYXRoXSA+PSAoZG9jLnVwZGF0ZWRBdCB8fCAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzZWNyZXRPayhkb2MuY29udGVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tTeW5jTWFuYWdlcl0gUmVmdXNpbmcgdG8gc3luYyBwbGFpbnRleHQgdmF1bHQgY29udGVudCBcdTIwMTQgZHJvcHBlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZG9jS2V5ID0gYHZhdWx0RG9jOiR7ZG9jLnBhdGh9YDtcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkb2MpO1xuICAgICAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBkb2NLZXksIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QNF9WQVVMVCwgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdXNoIHRvIHN5bmNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFdyaXRlIGEgcHJpb3JpdGlzZWQsIHByZS1jaHVua2VkIHBheWxvYWQgdG8gc3RvcmFnZS5zeW5jLCByZXRyeWluZyBvbiBhblxuICogb3Zlci1xdW90YSByZWplY3Rpb24gYnkgZHJvcHBpbmcgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsIHByZXNlbnQgYW5kXG4gKiB0cnlpbmcgYWdhaW4uIFAwICh0b21ic3RvbmVzKSBhbmQgUDEgKHByb2ZpbGVzKSBhcmUgTkVWRVIgZHJvcHBlZCBcdTIwMTQgYSBmdWxsXG4gKiBiYXRjaCBmYWlsdXJlIHdvdWxkIHN0cmFuZCBhIGRlbGV0aW9uIG9yIGEga2V5LCBzbyB0aGUgaW1wb3J0YW50IHRpZXJzIHN5bmNcbiAqIGV2ZW4gd2hlbiB0aGUgYnVsa3kgb25lcyBjYW5ub3QuXG4gKlxuICogQHBhcmFtIHt7IHByaW9yaXR5OiBudW1iZXIsIGNodW5rczoge2tleTpzdHJpbmcsIHZhbHVlOnN0cmluZ31bXSB9W119IGluY2x1ZGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fSBudW1iZXIgb2YgZGF0YSBrZXlzIGFjdHVhbGx5IHdyaXR0ZW5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2V0U3luY1Jlc3BlY3RpbmdRdW90YShpbmNsdWRlZCkge1xuICAgIGxldCB0aWVycyA9IGluY2x1ZGVkLnNsaWNlKCk7XG4gICAgLy8gR3VhcmQgYWdhaW5zdCBhbiB1bmJvdW5kZWQgbG9vcDogYXQgbW9zdCBvbmUgcmV0cnkgcGVyIGRpc3RpbmN0IHByaW9yaXR5LlxuICAgIGZvciAobGV0IGF0dGVtcHQgPSAwOyA7IGF0dGVtcHQrKykge1xuICAgICAgICBjb25zdCBzeW5jUGF5bG9hZCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxTeW5jS2V5cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdGllcnMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBpdGVtLmNodW5rcykge1xuICAgICAgICAgICAgICAgIHN5bmNQYXlsb2FkW2Mua2V5XSA9IGMudmFsdWU7XG4gICAgICAgICAgICAgICAgYWxsU3luY0tleXMucHVzaChjLmtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3luY1BheWxvYWRbU1lOQ19NRVRBX0tFWV0gPSBKU09OLnN0cmluZ2lmeSh7IGxhc3RXcml0dGVuQXQ6IERhdGUubm93KCksIGtleXM6IGFsbFN5bmNLZXlzIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnNldChzeW5jUGF5bG9hZCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFuIG9ycGhhbmVkIGNodW5rczogcmVtb3ZlIGFueSBleGlzdGluZyBzeW5jIGtleSBub3QgaW4gb3VyIHBheWxvYWQuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5nZXQobnVsbCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JwaGFuS2V5cyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5maWx0ZXIoayA9PlxuICAgICAgICAgICAgICAgICAgICBrICE9PSBTWU5DX01FVEFfS0VZICYmICFhbGxTeW5jS2V5cy5pbmNsdWRlcyhrKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG9ycGhhbktleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLnJlbW92ZShvcnBoYW5LZXlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyBOb24tY3JpdGljYWwgY2xlYW51cFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFsbFN5bmNLZXlzLmxlbmd0aDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gT3ZlciBxdW90YSAob3IgTUFYX0lURU1TKSBcdTIwMTQgZHJvcCB0aGUgbG93ZXN0LXByaW9yaXR5IHRpZXIgc3RpbGxcbiAgICAgICAgICAgIC8vIHByZXNlbnQgYW5kIHJldHJ5LiBOZXZlciBkcm9wIFAwL1AxLlxuICAgICAgICAgICAgY29uc3QgbWF4UHJpb3JpdHkgPSB0aWVycy5yZWR1Y2UoKG0sIHQpID0+IE1hdGgubWF4KG0sIHQucHJpb3JpdHkpLCAtMSk7XG4gICAgICAgICAgICBpZiAobWF4UHJpb3JpdHkgPD0gUFJJT1JJVFkuUDFfUFJPRklMRVMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlOyAvLyBub3RoaW5nIGRyb3BwYWJsZSBsZWZ0OyBQMC9QMSBtdXN0IHN1cnZpdmUgb3IgZmFpbCBsb3VkbHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IHRpZXJzLmxlbmd0aDtcbiAgICAgICAgICAgIHRpZXJzID0gdGllcnMuZmlsdGVyKHQgPT4gdC5wcmlvcml0eSA8IG1heFByaW9yaXR5KTtcbiAgICAgICAgICAgIGlmICh0aWVycy5sZW5ndGggPT09IGJlZm9yZSkgdGhyb3cgZTsgLy8gbm8gcHJvZ3Jlc3MgXHUyMDE0IGJhaWxcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBzeW5jLnNldCBvdmVyIHF1b3RhIFx1MjAxNCBkcm9wcGVkIHByaW9yaXR5ICR7bWF4UHJpb3JpdHl9IHRpZXIsIHJldHJ5aW5nYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdXNoVG9TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW5hYmxlZCA9IGF3YWl0IGlzU3luY0VuYWJsZWQoKTtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIFB1bGwtbWVyZ2UgQkVGT1JFIGJ1aWxkaW5nOiBvcnBoYW4tY2xlYW51cCBiZWxvdyB3aXBlcyBhbnkgbWlycm9yIGtleVxuICAgICAgICAvLyBhYnNlbnQgZnJvbSB0aGlzIGRldmljZSdzIHBheWxvYWQsIHNvIHdlIG11c3QgZmlyc3QgYWJzb3JiIHJlbW90ZVxuICAgICAgICAvLyBzdGF0ZSAoZXNwZWNpYWxseSByZW1vdGUgdG9tYnN0b25lcywgd2hpY2ggdGhlbiBzdXBwcmVzcyB0aGUgbWF0Y2hpbmdcbiAgICAgICAgLy8gZG9jcy9rZXlzIGZyb20gdGhlIHBheWxvYWQgd2UgYXJlIGFib3V0IHRvIGJ1aWxkKS4gV2l0aG91dCB0aGlzIGFcbiAgICAgICAgLy8gZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBvZiBhIGRlbGV0aW9uIHdvdWxkIHJlLXB1c2ggdGhlIGl0ZW0uXG4gICAgICAgIGNvbnN0IHJlbW90ZSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAocmVtb3RlKSBhd2FpdCBtZXJnZUludG9Mb2NhbChyZW1vdGUpO1xuXG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBidWlsZFN5bmNQYXlsb2FkKCk7XG5cbiAgICAgICAgLy8gU29ydCBieSBwcmlvcml0eSAoYXNjZW5kaW5nID0gbW9zdCBpbXBvcnRhbnQgZmlyc3QpXG4gICAgICAgIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBpbmNsdWRlZCBzZXQgcmVzcGVjdGluZyB0aGUgaW4tY29kZSBieXRlL2l0ZW0gYnVkZ2V0LlxuICAgICAgICBsZXQgdXNlZEJ5dGVzID0gMDtcbiAgICAgICAgbGV0IHVzZWRJdGVtcyA9IDA7XG4gICAgICAgIGNvbnN0IGluY2x1ZGVkID0gW107XG4gICAgICAgIGxldCBidWRnZXRFeGhhdXN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmIChidWRnZXRFeGhhdXN0ZWQpIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCBjaHVua3MgPSBjaHVua1ZhbHVlKGVudHJ5LmtleSwgZW50cnkuanNvblN0cmluZyk7XG4gICAgICAgICAgICBsZXQgZW50cnlTaXplID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgYyBvZiBjaHVua3MpIHtcbiAgICAgICAgICAgICAgICBlbnRyeVNpemUgKz0gYy5rZXkubGVuZ3RoICsgKHR5cGVvZiBjLnZhbHVlID09PSAnc3RyaW5nJyA/IGMudmFsdWUubGVuZ3RoIDogSlNPTi5zdHJpbmdpZnkoYy52YWx1ZSkubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVzZWRCeXRlcyArIGVudHJ5U2l6ZSA+IFNZTkNfUVVPVEEgLSA1MDAgfHwgdXNlZEl0ZW1zICsgY2h1bmtzLmxlbmd0aCA+IE1BWF9JVEVNUyAtIDUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkucHJpb3JpdHkgPD0gUFJJT1JJVFkuUDNfQVBJS0VZUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBDcml0aWNhbCBkYXRhIChpbmNsLiBQMCB0b21ic3RvbmVzKSBcdTIwMTQgaW5jbHVkZSBhbnl3YXk7IHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBydW50aW1lIHF1b3RhIGZhbGxiYWNrIHdpbGwgc2hlZCBidWxreSB0aWVycyBpZiB0aGUgQVBJIHJlamVjdHMuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbU3luY01hbmFnZXJdIEJ1ZGdldCBleGhhdXN0ZWQgYXQgcHJpb3JpdHkgJHtlbnRyeS5wcmlvcml0eX0sIHNraXBwaW5nIHJlbWFpbmluZyBlbnRyaWVzYCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZGdldEV4aGF1c3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5jbHVkZWQucHVzaCh7IHByaW9yaXR5OiBlbnRyeS5wcmlvcml0eSwgY2h1bmtzIH0pO1xuICAgICAgICAgICAgdXNlZEJ5dGVzICs9IGVudHJ5U2l6ZTtcbiAgICAgICAgICAgIHVzZWRJdGVtcyArPSBjaHVua3MubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1N5bmNNYW5hZ2VyXSBQdXNoZWQgJHt3cml0dGVufSBlbnRyaWVzICgke3VzZWRCeXRlc30gYnl0ZXMpIHRvIHN5bmMgc3RvcmFnZWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdXNoVG9TeW5jIGVycm9yOicsIGUpO1xuICAgICAgICAvLyBMb2NhbCBzdG9yYWdlIGlzIHVuYWZmZWN0ZWQgXHUyMDE0IGdyYWNlZnVsIGRlZ3JhZGF0aW9uXG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFB1bGwgZnJvbSBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBSZWFkIGFsbCBkYXRhIGZyb20gc3luYyBzdG9yYWdlIGFuZCByZXR1cm4gYXMgYSBwbGFpbiBvYmplY3Qgd2l0aFxuICogcmVhc3NlbWJsZWQgY2h1bmtlZCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwdWxsRnJvbVN5bmMoKSB7XG4gICAgaWYgKCFhcGkuc3RvcmFnZS5zeW5jKSByZXR1cm4gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICBpZiAoIXJhdyB8fCBPYmplY3Qua2V5cyhyYXcpLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbWV0YVN0ciA9IHJhd1tTWU5DX01FVEFfS0VZXTtcbiAgICAgICAgaWYgKCFtZXRhU3RyKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQgbWV0YTtcbiAgICAgICAgdHJ5IHsgbWV0YSA9IEpTT04ucGFyc2UobWV0YVN0cik7IH0gY2F0Y2ggeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICAvLyBDb2xsZWN0IHRoZSBub24tY2h1bmssIG5vbi1tZXRhIGtleXNcbiAgICAgICAgY29uc3QgZGF0YUtleXMgPSBtZXRhLmtleXMuZmlsdGVyKGsgPT4gIWsuc3RhcnRzV2l0aChDSFVOS19QUkVGSVgpICYmIGsgIT09IFNZTkNfTUVUQV9LRVkpO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGFLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlYXNzZW1ibGVGcm9tU3luY0RhdGEoa2V5LCByYXcpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0Ll9zeW5jTWV0YSA9IG1ldGE7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHB1bGxGcm9tU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1lcmdlIGxvZ2ljXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gVGhlIGJhY2tncm91bmQncyBvd24gd2F5IHRvIGhlYXIgb2YgbW92ZWQgcHJvZmlsZXMuIEEgd29ya2VyIGNhbm5vdCBtZXNzYWdlXG4vLyBpdHNlbGYsIHNvIGEgbWVyZ2UgcnVubmluZyB0aGVyZSBjYWxscyB0aGlzOyBhIHBhZ2Ugc2VuZHMgYSBtZXNzYWdlLlxubGV0IHByb2ZpbGVNb3ZlSGFuZGxlciA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm9maWxlTW92ZUhhbmRsZXIoaGFuZGxlcikge1xuICAgIHByb2ZpbGVNb3ZlSGFuZGxlciA9IGhhbmRsZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFubm91bmNlUHJvZmlsZU1vdmVzKG1vdmVzKSB7XG4gICAgaWYgKHByb2ZpbGVNb3ZlSGFuZGxlcikge1xuICAgICAgICBwcm9maWxlTW92ZUhhbmRsZXIobW92ZXMpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3Byb2ZpbGVzTW92ZWQnLCBwYXlsb2FkOiBtb3ZlcyB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmFja2dyb3VuZCB1bmF2YWlsYWJsZTogd2hhdCBpcyBrZXllZCBieSBpbmRleCBjaGVja3MgaXRzIGlkZW50aXR5ICovIH1cbn1cblxuLyoqXG4gKiBXaGVyZSBlYWNoIHByb2ZpbGUgd2VudC4gQW4gdW50b3VjaGVkIHJlY29yZCBpcyBmb3VuZCBhcyBpdHNlbGYsIGFuZCBvbmUgc3luY1xuICogcmVwbGFjZWQgaXMgZm91bmQgYnkgaWRlbnRpdHkuIEVhY2ggcGxhY2UgaXMgY2xhaW1lZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0W119IGJlZm9yZVxuICogQHBhcmFtIHtvYmplY3RbXX0gYWZ0ZXJcbiAqIEBwYXJhbSB7KHByb2ZpbGU6IG9iamVjdCkgPT4gP3N0cmluZ30gaWRlbnRpdHlPZlxuICogQHJldHVybnMge0FycmF5PFtudW1iZXIsID9udW1iZXJdPn0gW29sZCBpbmRleCwgbmV3IGluZGV4IG9yIG51bGwgaWYgZ29uZV0sIGNoYW5nZXMgb25seVxuICovXG5mdW5jdGlvbiBwcm9maWxlTW92ZXMoYmVmb3JlLCBhZnRlciwgaWRlbnRpdHlPZikge1xuICAgIGNvbnN0IHBsYWNlcyA9IGJlZm9yZS5tYXAocHJvZmlsZSA9PiBhZnRlci5pbmRleE9mKHByb2ZpbGUpKTtcbiAgICBjb25zdCBjbGFpbWVkID0gbmV3IFNldChwbGFjZXMpO1xuICAgIGJlZm9yZS5mb3JFYWNoKChwcm9maWxlLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwcm9maWxlKTtcbiAgICAgICAgaWYgKHBsYWNlc1tpXSA+PSAwIHx8ICFpZCkgcmV0dXJuO1xuICAgICAgICBwbGFjZXNbaV0gPSBhZnRlci5maW5kSW5kZXgoKG90aGVyLCBqKSA9PiAhY2xhaW1lZC5oYXMoaikgJiYgaWRlbnRpdHlPZihvdGhlcikgPT09IGlkKTtcbiAgICAgICAgY2xhaW1lZC5hZGQocGxhY2VzW2ldKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGxhY2VzLmZsYXRNYXAoKHBsYWNlLCBpKSA9PiAocGxhY2UgPT09IGkgPyBbXSA6IFtbaSwgcGxhY2UgPCAwID8gbnVsbCA6IHBsYWNlXV0pKTtcbn1cblxuLyoqXG4gKiBNZXJnZSBzeW5jIGRhdGEgaW50byBsb2NhbCBzdG9yYWdlIHdpdGggY29uZmxpY3QgcmVzb2x1dGlvbi5cbiAqXG4gKiBDT05ESVRJT04gMyAoaXNzdWUgIzMgbG9vcCBpbnZhcmlhbnQpOiBldmVyeSB3cml0ZSBoZXJlIGdvZXMgdGhyb3VnaCB0aGUgcmF3XG4gKiBtb2R1bGUtbGV2ZWwgYHN0b3JhZ2VgICg9IGFwaS5zdG9yYWdlLmxvY2FsKSB2aWEgYSBzaW5nbGUgYHN0b3JhZ2Uuc2V0YC4gSXRcbiAqIE1VU1QgTk9UIGNhbGwgdGhlIHN0b3JlLWxheWVyIGhlbHBlcnMgKGRlbGV0ZURvY3VtZW50TG9jYWwgLyBzYXZlRG9jdW1lbnRMb2NhbFxuICogLyBkZWxldGVBcGlLZXkgLyBzYXZlQXBpS2V5KSwgYmVjYXVzZSB0aG9zZSBjYWxsIHNjaGVkdWxlU3luY1B1c2goKSBcdTIwMTQgYSBtZXJnZVxuICogdGhhdCBzY2hlZHVsZWQgYSBwdXNoIHdvdWxkIHR1cm4gZXZlcnkgaW5jb21pbmcgc3luYyBpbnRvIGFuIG91dGdvaW5nIG9uZSBhbmRcbiAqIGxvb3AuIEEgcmVncmVzc2lvbiB0ZXN0IGFzc2VydHMgbWVyZ2VJbnRvTG9jYWwgbmV2ZXIgc2NoZWR1bGVzIGEgcHVzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKSB7XG4gICAgaWYgKCFzeW5jRGF0YSkgcmV0dXJuO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBzeW5jRGF0YSA9IHsgLi4uc3luY0RhdGEsIHByb2ZpbGVzOiByZWRhY3RQcm9maWxlcyhzeW5jRGF0YS5wcm9maWxlcykgfTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcmVhZCBhbmQgdGhlIHdyaXRlIHJ1biB1bmRlciB0aGUgcHJvZmlsZXMgbG9jaywgc28gYSBwcm9maWxlcyBjaGFuZ2VcbiAgICAvLyBtYWRlIG1lYW53aGlsZSAoYSByZXZva2UsIGEgcmVsYXkgZWRpdCkgaXMgbmV2ZXIgd3JpdHRlbiBvdmVyLlxuICAgIGNvbnN0IG1vdmVzID0gYXdhaXQgd2l0aFByb2ZpbGVzTG9jaygoKSA9PiBtZXJnZUludG9Mb2NhbExvY2tlZChzeW5jRGF0YSkpO1xuICAgIGlmIChtb3Zlcy5sZW5ndGggPiAwKSBhd2FpdCBhbm5vdW5jZVByb2ZpbGVNb3Zlcyhtb3Zlcyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1lcmdlSW50b0xvY2FsTG9ja2VkKHN5bmNEYXRhKSB7XG4gICAgY29uc3QgbG9jYWwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcblxuICAgIC8vIERldGVjdCBmcmVzaCBpbnN0YWxsOiBubyBwcm9maWxlcywgb3IgYSBzaW5nbGUgdW50b3VjaGVkIGRlZmF1bHQgcHJvZmlsZS5cbiAgICAvLyAoRGVmYXVsdCBrZXlzIGFyZSBub3cgd3JhcHBlZCBhdCByZXN0LCBzbyBgcHJpdktleWAgaXMgdHJ1dGh5IGV2ZW4gb24gYVxuICAgIC8vIGZyZXNoIGluc3RhbGwgXHUyMDE0IGRldGVjdCB0aGUgdW50b3VjaGVkIGRlZmF1bHQgYnkgaXRzIG5hbWUgKyBhYnNlbmNlIG9mIGFueVxuICAgIC8vIHBlci1zaXRlIGdyYW50cyBpbnN0ZWFkLilcbiAgICAvL1xuICAgIC8vIEMxOiBhIGxvbmUgcHJvZmlsZSBpcyBvbmx5IFwidW50b3VjaGVkL2ZyZXNoXCIgd2hlbiBpdCBjYXJyaWVzIG5vIGlkZW50aXR5LlxuICAgIC8vIEEgbG9uZSBCVU5LRVIgcHJvZmlsZSBoYXMgcHJpdktleTonJyBidXQgSVMgYSByZWFsIGlkZW50aXR5ICh0eXBlL2J1bmtlclVybFxuICAgIC8vIC9yZW1vdGVQdWJrZXkpLCBhbmQgbXVzdCBub3QgYmUgdHJlYXRlZCBhcyBmcmVzaCBhbmQgd2lwZWQgYnkgYSBzeW5jIHB1bGwuXG4gICAgY29uc3QgaGFzSWRlbnRpdHkgPSAocCkgPT4gISEocCAmJiAoXG4gICAgICAgIHAucHJpdktleSB8fCBwLnB1YktleSB8fCBwLnR5cGUgPT09ICdidW5rZXInIHx8IHAuYnVua2VyVXJsIHx8IHAucmVtb3RlUHVia2V5XG4gICAgKSk7XG4gICAgY29uc3QgbG9uZSA9IGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMSA/IGxvY2FsLnByb2ZpbGVzWzBdIDogbnVsbDtcbiAgICBjb25zdCBpc0ZyZXNoID0gIWxvY2FsLnByb2ZpbGVzIHx8XG4gICAgICAgIGxvY2FsLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAobG9uZSAmJiAhbG9uZS5wcml2S2V5ICYmICFoYXNJZGVudGl0eShsb25lKSkgfHxcbiAgICAgICAgKGxvbmUgJiYgbG9uZS5uYW1lID09PSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJyAmJlxuICAgICAgICAgICAgT2JqZWN0LmtleXMobG9uZS5ob3N0cyB8fCB7fSkubGVuZ3RoID09PSAwKTtcblxuICAgIC8vIFN0YWJsZSBpZGVudGl0eSBmb3IgcHJvZmlsZSBtYXRjaGluZyAvIHRvbWJzdG9uZXM6IHB1YktleSwgZWxzZSB0aGVcbiAgICAvLyBidW5rZXIncyByZW1vdGVQdWJrZXkuIE1hdGNoZXMgYnVpbGRTeW5jUGF5bG9hZCdzIGlkZW50aXR5T2YuXG4gICAgY29uc3QgaWRlbnRpdHlPZiA9IChwKSA9PiAocCAmJiAocC5wdWJLZXkgfHwgcC5yZW1vdGVQdWJrZXkpKSB8fCBudWxsO1xuXG4gICAgLy8gQ2FwdHVyZSB0aGUgQUNUSVZFIGlkZW50aXR5IEJFRk9SRSBhbnkgcmVvcmRlcmluZy9yZW1vdmFsIHNvIHRoZSBhY3RpdmVcbiAgICAvLyBpbmRleCBjYW4gZm9sbG93IHRoYXQgaWRlbnRpdHkgdGhyb3VnaCB0aGUgbWVyZ2UgKGEga2V5IG1hbmFnZXIgbXVzdCBub3RcbiAgICAvLyBzaWxlbnRseSBzd2l0Y2ggd2hpY2ggaWRlbnRpdHkgaXMgYWN0aXZlIGp1c3QgYmVjYXVzZSBhIHByb2ZpbGUgb3JkZXJlZFxuICAgIC8vIGJlZm9yZSBpdCB3YXMgcmVtb3ZlZCBvbiBhbm90aGVyIGRldmljZSkuXG4gICAgY29uc3QgbG9jYWxBY3RpdmVJbmRleCA9IChsb2NhbC5wcm9maWxlSW5kZXggIT0gbnVsbCkgPyBsb2NhbC5wcm9maWxlSW5kZXggOiAwO1xuICAgIGNvbnN0IGFjdGl2ZUlkID0gKGxvY2FsLnByb2ZpbGVzICYmIGxvY2FsLnByb2ZpbGVzW2xvY2FsQWN0aXZlSW5kZXhdKVxuICAgICAgICA/IGlkZW50aXR5T2YobG9jYWwucHJvZmlsZXNbbG9jYWxBY3RpdmVJbmRleF0pXG4gICAgICAgIDogbnVsbDtcblxuICAgIC8vIC0tLSBQcm9maWxlIHRvbWJzdG9uZXMgKGlzc3VlICMzKSBcdTIwMTQgdW5pb24gbG9jYWwgKyByZW1vdGUsIG1heCBwZXIgaWRlbnRpdHkgLS0tXG4gICAgY29uc3QgZGVsZXRlZFByb2ZpbGVzID0geyAuLi4obG9jYWwuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZFByb2ZpbGVzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkUHJvZmlsZXNbaWRdID09IG51bGwgfHwgdHMgPiBkZWxldGVkUHJvZmlsZXNbaWRdKSBkZWxldGVkUHJvZmlsZXNbaWRdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZXMgKFAxKSBcdTIwMTQgcHVia2V5LWtleWVkIG1lcmdlICsgdG9tYnN0b25lIHJlbW92YWwgLS0tXG4gICAgLy8gTWF0Y2ggYnkgc3RhYmxlIGlkZW50aXR5IHJhdGhlciB0aGFuIGFycmF5IGluZGV4LCBzbyBhIHJlb3JkZXJlZCBvciBwYXJ0aWFsXG4gICAgLy8gc3luYyBwYXlsb2FkIGNhbm5vdCBvdmVyd3JpdGUgb25lIGlkZW50aXR5J3Mga2V5IG1hdGVyaWFsIHdpdGggYW5vdGhlcidzLlxuICAgIGxldCBtZXJnZWRQcm9maWxlcyA9IGxvY2FsLnByb2ZpbGVzID8gWy4uLmxvY2FsLnByb2ZpbGVzXSA6IG51bGw7XG4gICAgbGV0IHByb2ZpbGVzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICBpZiAoaXNGcmVzaCkge1xuICAgICAgICAgICAgLy8gRnJlc2ggaW5zdGFsbCBcdTIwMTQgYWRvcHQgc3luYyBwcm9maWxlcyBlbnRpcmVseVxuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMgPSBzeW5jRGF0YS5wcm9maWxlcy5zbGljZSgpO1xuICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2NhbC5wcm9maWxlcykge1xuICAgICAgICAgICAgY29uc3QgaW5kZXhCeUlkZW50aXR5ID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihwKTtcbiAgICAgICAgICAgICAgICBpZiAoaWQgJiYgIWluZGV4QnlJZGVudGl0eS5oYXMoaWQpKSBpbmRleEJ5SWRlbnRpdHkuc2V0KGlkLCBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzeW5jUHJvZmlsZSBvZiBzeW5jRGF0YS5wcm9maWxlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gaWRlbnRpdHlPZihzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlkICYmIGluZGV4QnlJZGVudGl0eS5oYXMoaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBpbmRleEJ5SWRlbnRpdHkuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxQcm9maWxlID0gbWVyZ2VkUHJvZmlsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc3luY1Byb2ZpbGUudXBkYXRlZEF0IHx8IDApID4gKGxvY2FsUHJvZmlsZS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN5bmMgaXMgbmV3ZXIgXHUyMDE0IGFkb3B0IGl0IGJ1dCBwcmVzZXJ2ZSBsb2NhbCBwZXItc2l0ZSBob3N0c1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXNbaV0gPSB7IC4uLnN5bmNQcm9maWxlLCBob3N0czogbG9jYWxQcm9maWxlLmhvc3RzIHx8IHt9IH07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBIGdlbnVpbmVseSBuZXcgaWRlbnRpdHkgbm90IHByZXNlbnQgbG9jYWxseSBcdTIwMTQgYXBwZW5kIGl0LlxuICAgICAgICAgICAgICAgICAgICBpbmRleEJ5SWRlbnRpdHkuc2V0KGlkLCBtZXJnZWRQcm9maWxlcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRQcm9maWxlcy5wdXNoKHN5bmNQcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQSBrZXlsZXNzIHJlbW90ZSBwcm9maWxlIGNhbm5vdCBiZSByZWNvbmNpbGVkIHRvIGEgbG9jYWwgb25lXG4gICAgICAgICAgICAgICAgLy8gc2FmZWx5IChubyBpZGVudGl0eSB0byBtYXRjaCBvbiksIHNvIGl0IGlzIHNraXBwZWQuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBseSBwcm9maWxlIHRvbWJzdG9uZXM6IHJlbW92ZSBhbnkgbWVyZ2VkIHByb2ZpbGUgd2hvc2UgaWRlbnRpdHkgaGFzXG4gICAgLy8gKHVwZGF0ZWRBdCA8PSBkZWxldGVkQXQpIFx1MjAxNCBkZWxldGlvbiB3aW5zIHRpZXMsIGNvbnNpc3RlbnQgd2l0aCBkb2NzL2tleXMuXG4gICAgLy8gQSByZWNyZWF0ZWQgcHJvZmlsZSAodXBkYXRlZEF0ID4gZGVsZXRlZEF0KSBzdXJ2aXZlcy4gTmV2ZXIgcHJ1bmUgdG9tYnN0b25lcy5cbiAgICBpZiAobWVyZ2VkUHJvZmlsZXMgJiYgT2JqZWN0LmtleXMoZGVsZXRlZFByb2ZpbGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGtlcHQgPSBtZXJnZWRQcm9maWxlcy5maWx0ZXIocCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICBjb25zdCB0cyA9IGlkICE9IG51bGwgPyBkZWxldGVkUHJvZmlsZXNbaWRdIDogbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAhKHRzICE9IG51bGwgJiYgKHAudXBkYXRlZEF0IHx8IDApIDw9IHRzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNhZmV0eTogbmV2ZXIgbGV0IGEgc3luYyBtZXJnZSBsZWF2ZSBaRVJPIHByb2ZpbGVzICh0aGF0IHdvdWxkIG9ycGhhblxuICAgICAgICAvLyB0aGUgYWN0aXZlIGluZGV4IGFuZCBicmljayB0aGUgVUkpLiBJZiByZW1vdmFsIHdvdWxkIGVtcHR5IHRoZSBsaXN0LFxuICAgICAgICAvLyBrZWVwIHRoZSBwcm9maWxlcyBhcy1pcyBcdTIwMTQgdGhlIGxvY2FsIHVzZXIgY2FuIHN0aWxsIGRlbGV0ZSBkZWxpYmVyYXRlbHkuXG4gICAgICAgIC8vIERlbGliZXJhdGUgdHJhZGUtb2ZmOiBjcm9zcy1kZXZpY2UgZGVsZXRpb24gZG9lcyBOT1QgY29udmVyZ2Ugb24gYVxuICAgICAgICAvLyBkZXZpY2Ugd2hlcmUgYXBwbHlpbmcgaXQgd291bGQgbGVhdmUgemVybyBwcm9maWxlczsgdGhlIHByb2ZpbGUgc3RheXNcbiAgICAgICAgLy8gdG9tYnN0b25lLXN1cHByZXNzZWQgb24gZW1pdCwgc28gaXQgZG9lcyBub3QgcmUtcHJvcGFnYXRlIHRvIG90aGVycy5cbiAgICAgICAgaWYgKGtlcHQubGVuZ3RoICE9PSBtZXJnZWRQcm9maWxlcy5sZW5ndGggJiYga2VwdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBtZXJnZWRQcm9maWxlcyA9IGtlcHQ7XG4gICAgICAgICAgICBwcm9maWxlc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IG1vdmVzID0gW107XG4gICAgaWYgKHByb2ZpbGVzQ2hhbmdlZCAmJiBtZXJnZWRQcm9maWxlcykge1xuICAgICAgICB1cGRhdGVzLnByb2ZpbGVzID0gbWVyZ2VkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3ZlcyA9IHByb2ZpbGVNb3Zlcyhsb2NhbC5wcm9maWxlcyB8fCBbXSwgbWVyZ2VkUHJvZmlsZXMsIGlkZW50aXR5T2YpO1xuICAgICAgICBpZiAobW92ZXMubGVuZ3RoID4gMCAmJiBsb2NhbC5idW5rZXJTZXNzaW9ucykge1xuICAgICAgICAgICAgdXBkYXRlcy5idW5rZXJTZXNzaW9ucyA9IGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3Zlcyhsb2NhbC5idW5rZXJTZXNzaW9ucywgbW92ZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGUgaW5kZXggKFAxKSBcdTIwMTQgRk9MTE9XIFRIRSBBQ1RJVkUgSURFTlRJVFkgYWNyb3NzIHRoZSBtZXJnZSAtLS1cbiAgICAvLyBUaGUgYWN0aXZlIGluZGV4IHRyYWNrcyB0aGUgYWN0aXZlIGlkZW50aXR5LCBub3QgYSByYXcgc2xvdDogaWYgYSBwcm9maWxlXG4gICAgLy8gb3JkZXJlZCBiZWZvcmUgdGhlIGFjdGl2ZSBvbmUgaXMgcmVtb3ZlZCBvbiBhbm90aGVyIGRldmljZSwgdGhlIGluZGV4XG4gICAgLy8gc2hpZnRzIHNvIHRoZSBTQU1FIGlkZW50aXR5IHN0YXlzIGFjdGl2ZS4gVGhlIGluZGV4IG9ubHkgbW92ZXMgdG8gYVxuICAgIC8vIGRpZmZlcmVudCBpZGVudGl0eSB3aGVuIHRoZSBhY3RpdmUgb25lIGlzIGl0c2VsZiBnb25lICh0b21ic3RvbmVkKSwgb3Igb24gYVxuICAgIC8vIGZyZXNoIGFkb3B0IFx1MjAxNCB0aGVuIGl0IGZhbGxzIGJhY2sgdG8gdGhlIHNhZmUgY2xhbXAuXG4gICAgaWYgKG1lcmdlZFByb2ZpbGVzICYmIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGRlc2lyZWRJbmRleDtcbiAgICAgICAgaWYgKHN5bmNEYXRhLnByb2ZpbGVzICYmIGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGFkb3B0IFx1MjAxNCB0YWtlIHN5bmMncyBhY3RpdmUgaW5kZXgsIGNsYW1wZWQgaW50byByYW5nZS5cbiAgICAgICAgICAgIGNvbnN0IGJhc2UgPSBzeW5jRGF0YS5wcm9maWxlSW5kZXggIT0gbnVsbCA/IHN5bmNEYXRhLnByb2ZpbGVJbmRleCA6IDA7XG4gICAgICAgICAgICBkZXNpcmVkSW5kZXggPSBNYXRoLm1pbihNYXRoLm1heChiYXNlLCAwKSwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmb2xsb3dlZCA9IGFjdGl2ZUlkICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IG1lcmdlZFByb2ZpbGVzLmZpbmRJbmRleChwID0+IGlkZW50aXR5T2YocCkgPT09IGFjdGl2ZUlkKVxuICAgICAgICAgICAgICAgIDogLTE7XG4gICAgICAgICAgICBkZXNpcmVkSW5kZXggPSBmb2xsb3dlZCA+PSAwXG4gICAgICAgICAgICAgICAgPyBmb2xsb3dlZFxuICAgICAgICAgICAgICAgIDogTWF0aC5taW4oTWF0aC5tYXgobG9jYWxBY3RpdmVJbmRleCwgMCksIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZXNpcmVkSW5kZXggIT09IGxvY2FsLnByb2ZpbGVJbmRleCkge1xuICAgICAgICAgICAgdXBkYXRlcy5wcm9maWxlSW5kZXggPSBkZXNpcmVkSW5kZXg7XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBFbmNyeXB0aW9uIHN0YXRlIChQMSkgLS0tXG4gICAgLy8gQTI6IGBpc0VuY3J5cHRlZGAgaXMgTk9UIG1lcmdlZC4gVGhlIG1hc3Rlci1wYXNzd29yZCBsb2NrIGlzIGEgcGVyLWRldmljZVxuICAgIC8vIGZhY3QgcHJvdmVuIGJ5IHRoZSBsb2NhbCB2ZXJpZmllcjsgbWlycm9yaW5nIGl0IG9uY2UgbGF0Y2hlZCBhIHBhc3N3b3JkbGVzc1xuICAgIC8vIGRldmljZSBpbnRvIGEgbG9jayBzY3JlZW4gaXQgaGFkIG5vIHBhc3N3b3JkIGZvci4gU2VlIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKS5cblxuICAgIC8vIC0tLSBTZXR0aW5ncyAoUDIpIFx1MjAxNCBsYXN0LXdyaXRlLXdpbnMgLS0tXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHNldHRpbmdzS2V5cykge1xuICAgICAgICBpZiAoc3luY0RhdGFba2V5XSAhPSBudWxsICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIC8vIEZvciB2ZXJzaW9uLCBvbmx5IGFjY2VwdCBhIG51bWVyaWNhbGx5LWhpZ2hlciBvbmUgKCcxLjEwLjAnID4gJzEuOS4wJykuXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAndmVyc2lvbicgJiYgbG9jYWwudmVyc2lvbiAmJiBjb21wYXJlU2VtdmVyKHN5bmNEYXRhLnZlcnNpb24sIGxvY2FsLnZlcnNpb24pIDw9IDApIGNvbnRpbnVlO1xuICAgICAgICAgICAgdXBkYXRlc1trZXldID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEZlYXR1cmUgZmxhZ3NcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzeW5jRGF0YSkpIHtcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdmZWF0dXJlOicpICYmIHN5bmNEYXRhW2tleV0gIT09IGxvY2FsW2tleV0pIHtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBUb21ic3RvbmVzIChpc3N1ZSAjMykgXHUyMDE0IHVuaW9uIGxvY2FsICsgcmVtb3RlLCBtYXggZGVsZXRlZEF0IHBlciBrZXkgLS0tXG4gICAgY29uc3QgZGVsZXRlZERvY3MgPSB7IC4uLihsb2NhbC5kZWxldGVkRG9jcyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gbG9jYWwuZGVsZXRlZERvY3MgOiB7fSkgfTtcbiAgICBpZiAoc3luY0RhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtwYXRoLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZERvY3MpKSB7XG4gICAgICAgICAgICBpZiAoZGVsZXRlZERvY3NbcGF0aF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWREb2NzW3BhdGhdKSBkZWxldGVkRG9jc1twYXRoXSA9IHRzO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGRlbGV0ZWRLZXlzID0geyAuLi4obG9jYWwuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGxvY2FsLmRlbGV0ZWRLZXlzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkS2V5cykpIHtcbiAgICAgICAgICAgIGlmIChkZWxldGVkS2V5c1tpZF0gPT0gbnVsbCB8fCB0cyA+IGRlbGV0ZWRLZXlzW2lkXSkgZGVsZXRlZEtleXNbaWRdID0gdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gQVBJIEtleSBWYXVsdCAoUDMpIC0tLVxuICAgIC8vIEJ1aWxkIHRoZSBtZXJnZWQga2V5IHNldCwgZm9sZCBpbiBhbnkgcmVtb3RlIGtleXMsIHRoZW4gYXBwbHkga2V5XG4gICAgLy8gdG9tYnN0b25lcy4gUnVucyBldmVuIHdoZW4gdGhlIHB1bGwgY2FycmllcyBOTyBhcGlLZXlWYXVsdCwgc28gYVxuICAgIC8vIGRlbGV0ZS1vbmx5IHB1bGwgY2FuIHN0aWxsIHJlbW92ZSBhIGxvY2FsbHktaGVsZCBrZXkuXG4gICAge1xuICAgICAgICBsZXQgYmFzZVZhdWx0ID0gbG9jYWwuYXBpS2V5VmF1bHQgfHwgbnVsbDtcbiAgICAgICAgbGV0IGxvY2FsS2V5cyA9IChsb2NhbC5hcGlLZXlWYXVsdCAmJiBsb2NhbC5hcGlLZXlWYXVsdC5rZXlzKSB8fCB7fTtcbiAgICAgICAgbGV0IGFwaUNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCghbG9jYWwuYXBpS2V5VmF1bHQgfHwgaXNGcmVzaCkgJiYgc3luY0RhdGEuYXBpS2V5VmF1bHQpIHtcbiAgICAgICAgICAgIGJhc2VWYXVsdCA9IHN5bmNEYXRhLmFwaUtleVZhdWx0O1xuICAgICAgICAgICAgbG9jYWxLZXlzID0ge307XG4gICAgICAgICAgICBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaGFyZWQgbWVyZ2UgKHN5bmMtbWVyZ2UuanMpOiBuZXdlciByZW1vdGUgd2lucywgZGVsZXRpb24gd2lucyB0aWVzXG4gICAgICAgIC8vIChgPD1gKSwgdG9tYnN0b25lcyBhcmUgTkVWRVIgcHJ1bmVkIGhlcmUuIFRvbWJzdG9uZXMgYXJlIGNsZWFyZWQgb25seVxuICAgICAgICAvLyBhdCB0aGUgc291cmNlIChzYXZlQXBpS2V5IG9uIHNhbWUtZGV2aWNlIHJlY3JlYXRlKSBvciBieSB0aGUgdXNlci5cbiAgICAgICAgY29uc3Qga2V5TWVyZ2UgPSBtZXJnZVJlbW90ZShsb2NhbEtleXMsIChzeW5jRGF0YS5hcGlLZXlWYXVsdCAmJiBzeW5jRGF0YS5hcGlLZXlWYXVsdC5rZXlzKSB8fCB7fSwgZGVsZXRlZEtleXMpO1xuICAgICAgICBjb25zdCBtZXJnZWRLZXlzID0ga2V5TWVyZ2UubWVyZ2VkO1xuICAgICAgICBpZiAoa2V5TWVyZ2UuY2hhbmdlZCkgYXBpQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGlmIChhcGlDaGFuZ2VkICYmIGJhc2VWYXVsdCkge1xuICAgICAgICAgICAgdXBkYXRlcy5hcGlLZXlWYXVsdCA9IHsgLi4uYmFzZVZhdWx0LCBrZXlzOiBtZXJnZWRLZXlzIH07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLSBWYXVsdCBkb2NzIChQNCkgLS0tXG4gICAgY29uc3QgcmVtb3RlRG9jcyA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHN5bmNEYXRhKSkge1xuICAgICAgICBpZiAoIWtleS5zdGFydHNXaXRoKCd2YXVsdERvYzonKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRvYyA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghZG9jIHx8ICFkb2MucGF0aCkgY29udGludWU7XG4gICAgICAgIHJlbW90ZURvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgIH1cbiAgICAvLyBTaGFyZWQgbWVyZ2U6IGRlbGV0aW9uIHdpbnMgdGllcywgdG9tYnN0b25lcyBhcmUgTkVWRVIgcHJ1bmVkIGhlcmUuXG4gICAgY29uc3QgeyBtZXJnZWQ6IG1lcmdlZERvY3MsIGNoYW5nZWQ6IGRvY3NDaGFuZ2VkIH0gPSBtZXJnZVJlbW90ZShsb2NhbC52YXVsdERvY3MgfHwge30sIHJlbW90ZURvY3MsIGRlbGV0ZWREb2NzKTtcbiAgICBpZiAoZG9jc0NoYW5nZWQpIHtcbiAgICAgICAgdXBkYXRlcy52YXVsdERvY3MgPSBtZXJnZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBQZXJzaXN0IHRoZSB0b21ic3RvbmUgc2V0cy4gVGhlc2UgYXJlIGEgUFVSRSBVTklPTiAobWF4IGRlbGV0ZWRBdCBwZXJcbiAgICAvLyBrZXkpIFx1MjAxNCB0aGUgbWVyZ2UgbmV2ZXIgcmVtb3ZlcyBhIHRvbWJzdG9uZSwgc28gdGhleSBhcmUgcmV0YWluZWQgZm9yZXZlclxuICAgIC8vIGFuZCBhbiBvZmZsaW5lIGRldmljZSBjYW5ub3QgcmVzdXJyZWN0IGEgZGVsZXRpb24uIFRoZXkgYXJlIGNsZWFyZWQgb25seVxuICAgIC8vIGF0IHRoZSBzb3VyY2UgKHNhdmVEb2N1bWVudExvY2FsL3NhdmVBcGlLZXkgb24gc2FtZS1kZXZpY2UgcmVjcmVhdGUpIG9yIGJ5XG4gICAgLy8gdGhlIHVzZXIgdmlhIGNsZWFyRGVsZXRpb25IaXN0b3J5LlxuICAgIC8vXG4gICAgLy8gUmVzaWR1YWwgKGFjY2VwdGVkLCBkb2N1bWVudGVkKTogcHVyZSBjcm9zcy1kZXZpY2UgY2xvY2sgc2tldyBcdTIwMTQgYSBsaXZlXG4gICAgLy8gY29weSB3aG9zZSB1cGRhdGVkQXQgaXMgZ2VudWluZWx5IE5FV0VSIHRoYW4gdGhlIGRlbGV0ZSdzIHRpbWVzdGFtcCBcdTIwMTQgd2luc1xuICAgIC8vIHVuZGVyIHRoZSBgPD1gIHJ1bGUgYW5kIGlzIGtlcHQuIFRoYXQgaXMgYW4gaW5oZXJlbnQgbGFzdC13cml0ZS13aW5zIGxpbWl0XG4gICAgLy8gdGhhdCB0b21ic3RvbmVzIGRvIG5vdCByZXNvbHZlOyBcImZpeGluZ1wiIGl0IGJ5IHBydW5pbmcgd291bGQgcmVpbnRyb2R1Y2VcbiAgICAvLyB0aGUgc2FtZS1zZWNvbmQgcmVzdXJyZWN0aW9uIGJ1Zywgc28gaXQgaXMgbGVmdCBhcy1pcy5cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkRG9jcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkRG9jcyA9IGRlbGV0ZWREb2NzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRLZXlzKSAhPT0gSlNPTi5zdHJpbmdpZnkobG9jYWwuZGVsZXRlZEtleXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZEtleXMgPSBkZWxldGVkS2V5cztcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkUHJvZmlsZXMgfHwge30pKSB7XG4gICAgICAgIHVwZGF0ZXMuZGVsZXRlZFByb2ZpbGVzID0gZGVsZXRlZFByb2ZpbGVzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgICAvLyBSYXcgbG9jYWwgd3JpdGUgT05MWSBcdTIwMTQgbmV2ZXIgc2NoZWR1bGVTeW5jUHVzaCAobG9vcCBpbnZhcmlhbnQpLlxuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh1cGRhdGVzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTWVyZ2VkIHN5bmMgZGF0YSBpbnRvIGxvY2FsOicsIE9iamVjdC5rZXlzKHVwZGF0ZXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vdmVzO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlYm91bmNlZCBwdXNoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBTY2hlZHVsZSBhIHN5bmMgcHVzaCB3aXRoIGEgMi1zZWNvbmQgZGVib3VuY2UuXG4gKiBFeHBvcnRlZCBmb3IgdXNlIGJ5IHN0b3JlcyBhbmQgdGhlIHN0b3JhZ2UgaW50ZXJjZXB0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZVN5bmNQdXNoKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuICAgIGlmIChwdXNoVGltZXIpIGNsZWFyVGltZW91dChwdXNoVGltZXIpO1xuICAgIHB1c2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwdXNoVGltZXIgPSBudWxsO1xuICAgICAgICBwdXNoVG9TeW5jKCk7XG4gICAgfSwgMjAwMCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVsZXRpb24taGlzdG9yeSAodG9tYnN0b25lKSByZXRlbnRpb24gaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogVG90YWwgbnVtYmVyIG9mIHJldGFpbmVkIGRlbGV0aW9uIHJlY29yZHMgKGRvY3MgKyBrZXlzKS4gR3Jvd3Mgb3ZlciB0aGUgbGlmZVxuICogb2YgdGhlIGluc3RhbGwgYmVjYXVzZSB0b21ic3RvbmVzIGFyZSBrZXB0IGZvcmV2ZXIgKGFuIG9mZmxpbmUgZGV2aWNlIHRoYXRcbiAqIG5ldmVyIGxlYXJuZWQgb2YgYSBkZWxldGlvbiBtdXN0IG5vdCBiZSBhYmxlIHRvIHJlc3VycmVjdCB0aGUgaXRlbSkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUb21ic3RvbmVDb3VudCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBkZWxldGVkRG9jczoge30sIGRlbGV0ZWRLZXlzOiB7fSwgZGVsZXRlZFByb2ZpbGVzOiB7fSB9KTtcbiAgICBjb25zdCBkb2NzID0gZGF0YS5kZWxldGVkRG9jcyAmJiB0eXBlb2YgZGF0YS5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWREb2NzIDoge307XG4gICAgY29uc3Qga2V5cyA9IGRhdGEuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkS2V5cyA6IHt9O1xuICAgIGNvbnN0IHByb2ZpbGVzID0gZGF0YS5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZFByb2ZpbGVzIDoge307XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGRvY3MpLmxlbmd0aCArIE9iamVjdC5rZXlzKGtleXMpLmxlbmd0aCArIE9iamVjdC5rZXlzKHByb2ZpbGVzKS5sZW5ndGg7XG59XG5cbi8qKlxuICogV2FybmluZyBsZXZlbCBmb3IgYSBnaXZlbiByZXRhaW5lZC1kZWxldGlvbiBjb3VudDpcbiAqICAgMCA9IGZpbmUsIDEgPSBnZW50bGUgbnVkZ2UgKD49IDgpLCAyID0gc3Ryb25nZXIgd2FybmluZyAoPj0gMTYpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9tYnN0b25lV2FybmluZ0xldmVsKGNvdW50KSB7XG4gICAgaWYgKGNvdW50ID49IFRPTUJTVE9ORV9XQVJOX1NUUk9ORykgcmV0dXJuIDI7XG4gICAgaWYgKGNvdW50ID49IFRPTUJTVE9ORV9XQVJOX0dFTlRMRSkgcmV0dXJuIDE7XG4gICAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQ2xlYXIgYWxsIHJldGFpbmVkIGRlbGV0aW9uIGhpc3RvcnkuIEluZm9ybWVkLXVzZXIgY2hvaWNlOiBhIGRldmljZSB0aGF0IGhhc1xuICogYmVlbiBvZmZsaW5lIHNpbmNlIGJlZm9yZSBvbmUgb2YgdGhlc2UgZGVsZXRpb25zIGNhbiwgb24gaXRzIG5leHQgc3luYyxcbiAqIHJlLWFkZCB0aGUgaXRlbSBcdTIwMTQgYmVjYXVzZSB0aGUgcmVjb3JkIHRoYXQgdG9sZCBldmVyeW9uZSBpdCB3YXMgZGVsZXRlZCBpc1xuICogbm93IGdvbmUuIFNjaGVkdWxlcyBhIHB1c2ggc28gdGhlIGNsZWFyZWQgc3RhdGUgcHJvcGFnYXRlcyB0byB0aGUgbWlycm9yLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJEZWxldGlvbkhpc3RvcnkoKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBkZWxldGVkRG9jczoge30sIGRlbGV0ZWRLZXlzOiB7fSwgZGVsZXRlZFByb2ZpbGVzOiB7fSB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRW5jcnlwdGlvbi1mbGFnIHNlbGYtaGVhbCAoQTIpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDbGVhciBhIGJvZ3VzIGBpc0VuY3J5cHRlZD10cnVlYCB3aGVuIHRoaXMgZGV2aWNlIGhvbGRzIG5vIGV2aWRlbmNlIG9mIHJlYWxcbiAqIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IG5vIHBhc3N3b3JkIHZlcmlmaWVyIChwYXNzd29yZEhhc2gpIEFORCBubyBwcm9maWxlIGtleVxuICogdGhhdCBpcyBhIFBBU1NXT1JEIGJsb2IuXG4gKlxuICogR2F0aW5nIGRldGFpbCAoY3JpdGljYWwpOiBldmlkZW5jZSBpcyBhIFBBU1NXT1JEIGJsb2IgKGlzUGFzc3dvcmRCbG9iKSwgTk9UIGFcbiAqIGRldmljZS1rZXkgYmxvYi4gU2luY2UgdjEuNy4wIGV2ZXJ5IGtleSBpcyB3cmFwcGVkIGF0IHJlc3QgZXZlbiBmb3IgdGhlXG4gKiBwYXNzd29yZGxlc3MgTGV2ZWwtMCB1c2VyLCBzbyBhIG5vcm1hbCBwYXNzd29yZGxlc3MgaW5zdGFsbCBpcyBmdWxsIG9mXG4gKiBkZXZpY2Uta2V5IGNpcGhlcnRleHQ7IGtleWluZyBvZmYgdGhhdCB3b3VsZCB3cm9uZ2x5IGtlZXAgdGhlIGZsYWcgbGF0Y2hlZC5cbiAqIE9ubHkgYSBwYXNzd29yZC1kZXJpdmVkIGJsb2IgKG9yIHRoZSB2ZXJpZmllcikgcHJvdmVzIGEgbWFzdGVyIHBhc3N3b3JkLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSB0cnVlIGlmIGEgYm9ndXMgZmxhZyB3YXMgY2xlYXJlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbGZIZWFsRW5jcnlwdGlvbkZsYWcoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlLCBwYXNzd29yZEhhc2g6IG51bGwsIHByb2ZpbGVzOiBbXSB9KTtcbiAgICBpZiAoIWRhdGEuaXNFbmNyeXB0ZWQpIHJldHVybiBmYWxzZTsgICAvLyBub3RoaW5nIGxhdGNoZWQgXHUyMDE0IG5vdGhpbmcgdG8gaGVhbFxuICAgIGlmIChkYXRhLnBhc3N3b3JkSGFzaCkgcmV0dXJuIGZhbHNlOyAgIC8vIHJlYWwgdmVyaWZpZXIgcHJlc2VudCBcdTIwMTQga2VlcCB0aGUgZmxhZ1xuXG4gICAgY29uc3QgaGFzUGFzc3dvcmRCbG9iID0gQXJyYXkuaXNBcnJheShkYXRhLnByb2ZpbGVzKSAmJlxuICAgICAgICBkYXRhLnByb2ZpbGVzLnNvbWUocCA9PiBwICYmIGlzUGFzc3dvcmRCbG9iKHAucHJpdktleSkpO1xuICAgIGlmIChoYXNQYXNzd29yZEJsb2IpIHJldHVybiBmYWxzZTsgICAgIC8vIHBhc3N3b3JkLWVuY3J5cHRlZCBrZXkgbWF0ZXJpYWwgXHUyMDE0IGtlZXBcblxuICAgIC8vIEZsYWcgaXMgYm9ndXMgKGUuZy4gbWlycm9yZWQgaW4gZnJvbSBhbm90aGVyIGRldmljZSB0aGF0IERJRCBoYXZlIGFcbiAgICAvLyBwYXNzd29yZCkuIENsZWFyIGl0IHNvIHRoaXMgZGV2aWNlIGlzIG5vdCBzdHJhbmRlZCBhdCBhIGRlYWQtZW5kIHVubG9jay5cbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBDbGVhcmVkIGJvZ3VzIGlzRW5jcnlwdGVkIGZsYWcgKG5vIHBhc3N3b3JkIHZlcmlmaWVyL2Jsb2IpJyk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRW5hYmxlIC8gZGlzYWJsZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1N5bmNFbmFibGVkKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IHRydWUgfSk7XG4gICAgcmV0dXJuIGRhdGFbTE9DQUxfRU5BQkxFRF9LRVldO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0U3luY0VuYWJsZWQoZW5hYmxlZCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW0xPQ0FMX0VOQUJMRURfS0VZXTogZW5hYmxlZCB9KTtcbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlZHVjZSBldmVyeSBidW5rZXJVcmwgaW4gdGhlIGBwcm9maWxlc2AgbWlycm9yIHRvIGl0cyBhZGRyZXNzLiBXb3JrcyBvbiB0aGVcbiAqIHN0b3JlZCBkYXRhIGRpcmVjdGx5LCBzbyBpdCBkb2VzIG5vdCBkZXBlbmQgb24gc3luYyBiZWluZyBlbmFibGVkLCBhbmQgd3JpdGVzXG4gKiBub3RoaW5nIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBjaGFuZ2UuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzY3J1YlN5bmNlZFByb2ZpbGVzKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuO1xuICAgIGNvbnN0IHJhdyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgIGNvbnN0IHByb2ZpbGVzID0gcmF3ID8gcmVhc3NlbWJsZUZyb21TeW5jRGF0YSgncHJvZmlsZXMnLCByYXcpIDogbnVsbDtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvZmlsZXMpKSByZXR1cm47XG4gICAgY29uc3QgY2xlYW4gPSByZWRhY3RQcm9maWxlcyhwcm9maWxlcyk7XG4gICAgaWYgKGNsZWFuID09PSBwcm9maWxlcykgcmV0dXJuO1xuXG4gICAgY29uc3QgZW50cmllcyA9IGNodW5rVmFsdWUoJ3Byb2ZpbGVzJywgSlNPTi5zdHJpbmdpZnkoY2xlYW4pKTtcbiAgICBjb25zdCBwYXlsb2FkID0gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMubWFwKGUgPT4gW2Uua2V5LCBlLnZhbHVlXSkpO1xuICAgIGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuc2V0KHBheWxvYWQpO1xuICAgIGNvbnN0IHVudXNlZCA9IE9iamVjdC5rZXlzKHJhdykuZmlsdGVyKGsgPT5cbiAgICAgICAgay5zdGFydHNXaXRoKGAke0NIVU5LX1BSRUZJWH1wcm9maWxlczpgKSAmJiAhKGsgaW4gcGF5bG9hZClcbiAgICApO1xuICAgIGlmICh1bnVzZWQubGVuZ3RoID4gMCkgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5yZW1vdmUodW51c2VkKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgLy8gU2VsZi1oZWFsIGEgYm9ndXMgZW5jcnlwdGlvbiBmbGFnIGZpcnN0IFx1MjAxNCB0aGlzIG11c3QgcnVuIGV2ZW4gd2hlbiBzeW5jIGlzXG4gICAgLy8gdW5hdmFpbGFibGUgb3IgZGlzYWJsZWQsIGJlY2F1c2UgdGhlIGJhZCBzdGF0ZSBpdCBmaXhlcyBtYXkgaGF2ZSBiZWVuIGxlZnRcbiAgICAvLyBiZWhpbmQgYnkgYW4gZWFybGllciAobm93LXJlbW92ZWQpIGlzRW5jcnlwdGVkLXN5bmNpbmcgYnVpbGQuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gc3RvcmFnZS5zeW5jIG5vdCBhdmFpbGFibGUgXHUyMDE0IHNraXBwaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBzY3J1YlN5bmNlZFByb2ZpbGVzKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIHNjcnViU3luY2VkUHJvZmlsZXMgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIFBsYXRmb3JtIHN5bmMgZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFB1bGwgKyBtZXJnZVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN5bmNEYXRhID0gYXdhaXQgcHVsbEZyb21TeW5jKCk7XG4gICAgICAgIGlmIChzeW5jRGF0YSkge1xuICAgICAgICAgICAgYXdhaXQgbWVyZ2VJbnRvTG9jYWwoc3luY0RhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsK21lcmdlIGNvbXBsZXRlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBObyBzeW5jIGRhdGEgZm91bmQgXHUyMDE0IGZyZXNoIHN5bmMnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBJbml0aWFsIHB1bGwgZmFpbGVkOicsIGUpO1xuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgcmVtb3RlIGNoYW5nZXNcbiAgICBpZiAoYXBpLnN0b3JhZ2Uub25DaGFuZ2VkKSB7XG4gICAgICAgIGFwaS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcigoY2hhbmdlcywgYXJlYU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmVhTmFtZSAhPT0gJ3N5bmMnKSByZXR1cm47XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBSZW1vdGUgc3luYyBjaGFuZ2UgZGV0ZWN0ZWQnKTtcbiAgICAgICAgICAgIC8vIFJlLXB1bGwgYW5kIG1lcmdlIHRoZSBmdWxsIHN5bmMgZGF0YSB0byBoYW5kbGUgY2h1bmtlZCB2YWx1ZXMgY29ycmVjdGx5XG4gICAgICAgICAgICBwdWxsRnJvbVN5bmMoKS50aGVuKHN5bmNEYXRhID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc3luY0RhdGEpIG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIG1lcmdlIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIERvIGFuIGluaXRpYWwgcHVzaCBzbyBsb2NhbCBkYXRhIGlzIG1pcnJvcmVkXG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuIiwgIi8qKlxuICogU2hhcmVkIHRvbWJzdG9uZS1hd2FyZSBtZXJnZS5cbiAqXG4gKiBPbmUgcnVsZSBmb3IgZXZlcnkgcGxhY2UgcmVtb3RlIGRhdGEgbWVldHMgbG9jYWwgZGF0YSAodGhlIHN0b3JhZ2Uuc3luY1xuICogbWlycm9yIGFuZCBib3RoIHJlbGF5IHB1bGxzLCB2YXVsdCBkb2N1bWVudHMgYW5kIEFQSSBrZXlzKTogYSByZW1vdGUgaXRlbSBpc1xuICogZHJvcHBlZCB3aGVuIGEgdG9tYnN0b25lIGZvciBpdHMga2V5IGlzIGRhdGVkIGF0IG9yIGFmdGVyIHRoZSByZW1vdGUgaXRlbSdzXG4gKiBvd24gdGltZXN0YW1wLiBEZWxldGlvbiB3aW5zIHRpZXMuIEEgY29weSB3cml0dGVuIGFmdGVyIHRoZSBkZWxldGlvbiAoYVxuICogcmUtY3JlYXRlKSBjYXJyaWVzIGEgbmV3ZXIgdGltZXN0YW1wIGFuZCBpcyBrZXB0LlxuICpcbiAqIFRvbWJzdG9uZXMgYXJlIG5ldmVyIHBydW5lZCBoZXJlLlxuICovXG5cbi8qKlxuICogSXMgYGl0ZW1gIHN1cGVyc2VkZWQgYnkgdGhlIHRvbWJzdG9uZSBmb3IgYGtleWA/XG4gKiBAcGFyYW0ge09iamVjdH0gdG9tYnN0b25lcyAtIHsga2V5OiBkZWxldGVkQXRTZWNvbmRzIH1cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lIC0gdGhlIGl0ZW0ncyB0aW1lc3RhbXAgaW4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUb21ic3RvbmVkKHRvbWJzdG9uZXMsIGtleSwgdGltZSkge1xuICAgIGlmICghdG9tYnN0b25lcyB8fCB0eXBlb2YgdG9tYnN0b25lcyAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB0cyA9IHRvbWJzdG9uZXNba2V5XTtcbiAgICByZXR1cm4gdHMgIT0gbnVsbCAmJiAodGltZSB8fCAwKSA8PSB0cztcbn1cblxuLyoqXG4gKiBNZXJnZSBhIHJlbW90ZSBtYXAgaW50byBhIGxvY2FsIG1hcC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbG9jYWwgLSB7IGtleTogaXRlbSB9XG4gKiBAcGFyYW0ge09iamVjdH0gcmVtb3RlIC0geyBrZXk6IGl0ZW0gfVxuICogQHBhcmFtIHtPYmplY3R9IHRvbWJzdG9uZXMgLSB7IGtleTogZGVsZXRlZEF0U2Vjb25kcyB9XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdHNdXG4gKiBAcGFyYW0geyhpdGVtOk9iamVjdCk9Pm51bWJlcn0gW29wdHMudGltZU9mXSAtIGl0ZW0gdGltZXN0YW1wIChkZWZhdWx0IHVwZGF0ZWRBdClcbiAqIEByZXR1cm5zIHt7IG1lcmdlZDogT2JqZWN0LCBjaGFuZ2VkOiBib29sZWFuIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVJlbW90ZShsb2NhbCwgcmVtb3RlLCB0b21ic3RvbmVzLCBvcHRzID0ge30pIHtcbiAgICBjb25zdCB0aW1lT2YgPSBvcHRzLnRpbWVPZiB8fCAoKGl0ZW0pID0+IChpdGVtICYmIGl0ZW0udXBkYXRlZEF0KSB8fCAwKTtcbiAgICBjb25zdCBtZXJnZWQgPSB7IC4uLihsb2NhbCB8fCB7fSkgfTtcbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgW2tleSwgaXRlbV0gb2YgT2JqZWN0LmVudHJpZXMocmVtb3RlIHx8IHt9KSkge1xuICAgICAgICBpZiAoIWl0ZW0pIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaXNUb21ic3RvbmVkKHRvbWJzdG9uZXMsIGtleSwgdGltZU9mKGl0ZW0pKSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IG1pbmUgPSBtZXJnZWRba2V5XTtcbiAgICAgICAgaWYgKCFtaW5lIHx8IHRpbWVPZihpdGVtKSA+IHRpbWVPZihtaW5lKSkge1xuICAgICAgICAgICAgbWVyZ2VkW2tleV0gPSBpdGVtO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobWVyZ2VkKSkge1xuICAgICAgICBpZiAoaXNUb21ic3RvbmVkKHRvbWJzdG9uZXMsIGtleSwgdGltZU9mKG1lcmdlZFtrZXldKSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBtZXJnZWRba2V5XTtcbiAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IG1lcmdlZCwgY2hhbmdlZCB9O1xufVxuXG4vKipcbiAqIENvbGxlY3QgZGVsZXRpb24gdGltZXMgZnJvbSB0aGUgYXV0aG9yJ3Mgb3duIGtpbmQgNSBldmVudHMgKE5JUC0wOSkgZm9yIHRoZVxuICogZ2l2ZW4gZC10YWdzLiBBY2NlcHRzIGBhYCB0YWdzIGAzMDA3ODo8cHVia2V5Pjo8ZHRhZz5gLCBhbmQgdGhlIGVhcmxpZXJcbiAqIGAzMDA3ODo6PGR0YWc+YCBzaGFwZSB0aGlzIGV4dGVuc2lvbiB1c2VkIHRvIHdyaXRlICh0aGUgYXV0aG9yIGlzIGFscmVhZHlcbiAqIHZlcmlmaWVkIGJ5IHRoZSBjYWxsZXIpLiBBbHNvIG1hcHMgYGVgIHRhZ3MgdGhyb3VnaCBgZXZlbnRJZFRvRHRhZ2AuXG4gKlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBkZWxldGlvbnMgLSB2ZXJpZmllZCBraW5kIDUgZXZlbnRzIGJ5IGBwdWJrZXlgXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVia2V5XG4gKiBAcGFyYW0ge09iamVjdH0gW2V2ZW50SWRUb0R0YWddIC0geyBldmVudElkOiBkdGFnIH1cbiAqIEByZXR1cm5zIHtPYmplY3R9IHsgZHRhZzogbGF0ZXN0RGVsZXRpb25DcmVhdGVkQXQgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRpb25Ub21ic3RvbmVzKGRlbGV0aW9ucywgcHVia2V5LCBldmVudElkVG9EdGFnID0ge30pIHtcbiAgICBjb25zdCBvdXQgPSB7fTtcbiAgICBjb25zdCBub3RlID0gKGR0YWcsIHRzKSA9PiB7XG4gICAgICAgIGlmIChvdXRbZHRhZ10gPT0gbnVsbCB8fCB0cyA+IG91dFtkdGFnXSkgb3V0W2R0YWddID0gdHM7XG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IGV2IG9mIGRlbGV0aW9ucyB8fCBbXSkge1xuICAgICAgICBpZiAoIWV2IHx8IGV2LmtpbmQgIT09IDUgfHwgZXYucHVia2V5ICE9PSBwdWJrZXkpIGNvbnRpbnVlO1xuICAgICAgICBmb3IgKGNvbnN0IHRhZyBvZiBldi50YWdzIHx8IFtdKSB7XG4gICAgICAgICAgICBpZiAodGFnWzBdID09PSAnYScgJiYgdHlwZW9mIHRhZ1sxXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmdWxsID0gYDMwMDc4OiR7cHVia2V5fTpgO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZ2FjeSA9ICczMDA3ODo6JztcbiAgICAgICAgICAgICAgICBpZiAodGFnWzFdLnN0YXJ0c1dpdGgoZnVsbCkpIG5vdGUodGFnWzFdLnNsaWNlKGZ1bGwubGVuZ3RoKSwgZXYuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGFnWzFdLnN0YXJ0c1dpdGgobGVnYWN5KSkgbm90ZSh0YWdbMV0uc2xpY2UobGVnYWN5Lmxlbmd0aCksIGV2LmNyZWF0ZWRfYXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YWdbMF0gPT09ICdlJyAmJiBldmVudElkVG9EdGFnW3RhZ1sxXV0pIHtcbiAgICAgICAgICAgICAgICBub3RlKGV2ZW50SWRUb0R0YWdbdGFnWzFdXSwgZXYuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cbiIsICIvKipcbiAqIFNlY3JldCBWYXVsdCBcdTIwMTQgYXQtcmVzdCBlbmNyeXB0aW9uIGZvciBwcml2YXRlIGtleXMgYW5kIGFwcGxpY2F0aW9uIHNlY3JldHMuXG4gKlxuICogVGhyZWF0IG1vZGVsIChUMC00KTogcmF3IHNlY3JldCBieXRlcyBtdXN0IG5ldmVyIHNpdCBpbiBicm93c2VyIHN0b3JhZ2UgaW5cbiAqIGNsZWFydGV4dCwgZXZlbiBmb3IgdGhlIERFRkFVTFQgcGFzc3dvcmRsZXNzIHVzZXIuIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHR3b1xuICogd3JhcHBpbmcgc3RyYXRlZ2llcyBiZWhpbmQgb25lIGB3cmFwU2VjcmV0YCAvIGB1bndyYXBTZWNyZXRgIGludGVyZmFjZTpcbiAqXG4gKiAgIDEuIERFVklDRSBLRVkgKGRlZmF1bHQsIG5vIG1hc3RlciBwYXNzd29yZCkgXHUyMDE0IGEgbm9uLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNXG4gKiAgICAgIENyeXB0b0tleS4gVGhyZWUgcGVyc2lzdGVuY2Ugc3RyYXRlZ2llcyBleGlzdCwgYW5kIGVhY2ggaXMgVkVSSUZJRURcbiAqICAgICAgKHJlYWQgYmFjayBhbmQgcm91bmQtdHJpcHBlZCB0aHJvdWdoIGVuY3J5cHQvZGVjcnlwdCkgYmVmb3JlIGl0IGlzXG4gKiAgICAgIHRydXN0ZWQ6XG4gKlxuICogICAgICAgIGEuIGBpZGJgICAgIFx1MjAxNCBhIENyeXB0b0tleSAqaGFuZGxlKiBpbiBJbmRleGVkREIuIE9ubHkgZXZlciBBRE9QVEVELFxuICogICAgICAgICAgICAgICAgICAgICAgbmV2ZXIgbWludGVkOiB3ZSB0cnVzdCBgaWRiYCBleGNsdXNpdmVseSB3aGVuIGRiLmdldCgpXG4gKiAgICAgICAgICAgICAgICAgICAgICBoYW5kcyBiYWNrIGEgUFJFLUVYSVNUSU5HIGtleSB0aGF0IHJvdW5kLXRyaXBzLCBiZWNhdXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGF0IFx1MjAxNCBhbmQgb25seSB0aGF0IFx1MjAxNCBwcm92ZXMgdGhlIGhhbmRsZSBzdXJ2aXZlZCBhXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyBjb250ZXh0LiBBIHNhbWUtY29udGV4dCBwdXRcdTIxOTJnZXQgcHJvYmUgY2Fubm90XG4gKiAgICAgICAgICAgICAgICAgICAgICBwcm92ZSBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlLiBLZWVwaW5nIHRoZSBhZG9wdCBwYXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZXMgZXZlcnkgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd3JpdHRlbiBiZWZvcmVcbiAqICAgICAgICAgICAgICAgICAgICAgIDEuOC4xLCB3aG9zZSBibG9icyBsaXZlIHVuZGVyIHRoaXMga2V5LlxuICogICAgICAgICAgICAgICAgICAgICAgKipORVZFUiB1c2VkIGFzIHRoZSB3cmFwcGluZyBrZXkgb24gU2FmYXJpLioqIE9uIFdlYktpdFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIHR3byBzdG9yYWdlIGFyZWFzIGRvIG5vdCBzaGFyZSBhIGxpZmV0aW1lIHRoZSB3YXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZXkgZG8gb24gQ2hyb21pdW0vR2Vja28sIHNvIGFuIGFkb3B0ZWQgSW5kZXhlZERCIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgaXMgbm90IGEgc2FmZSB3cmFwcGluZyBrZXkgdGhlcmUuIFNhZmFyaSB0aGVyZWZvcmUgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cml0ZXMgdW5kZXIgYHNlZWRgIChidW5kbGUtc2NvcGVkIGBzdG9yYWdlLmxvY2FsYCk7XG4gKiAgICAgICAgICAgICAgICAgICAgICBhZG9wdGVkIElEQiBrZXlzIGFyZSBkZWNyeXB0LW9ubHkgbGVnYWN5IG9uIFNhZmFyaSwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgYXQtcmVzdCBtaWdyYXRpb24gcmUtd3JhcHMgRVZFUlkgZGV2aWNlIGJsb2IgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24gc3RvcmVzIFx1MjAxNCBwcm9maWxlIHByaXZhdGUga2V5cywgQVBJLWtleVxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cywgdmF1bHQtbm90ZSBib2RpZXMsIGFuZCBOSVAtNDYgYnVua2VyIHNlc3Npb25cbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMgLyBzZXNzaW9uIHByaXZhdGUga2V5cyBcdTIwMTQgbm90IGp1c3QgcHJvZmlsZSBrZXlzLlxuICogICAgICAgICAgICAgICAgICAgICAgKFBlci1lbmdpbmUgc3RvcmFnZS1zY29waW5nIHJhdGlvbmFsZTogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgICAgICAgICAgICAgICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqICAgICAgICBiLiBgc2VlZGAgICBcdTIwMTQgMzIgcmFuZG9tIGJ5dGVzIGluIGBicm93c2VyLnN0b3JhZ2UubG9jYWxgIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgZGV2aWNlS2V5U2VlZGAsIGltcG9ydGVkIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ01cbiAqICAgICAgICAgICAgICAgICAgICAgIGtleSBhdCBsb2FkLiBUaGlzIGlzIHdoZXJlIEVWRVJZIG5ldyBkZXZpY2Uga2V5IGxhbmRzLFxuICogICAgICAgICAgICAgICAgICAgICAgb24gZXZlcnkgcGxhdGZvcm06IHdoZW4gbm8gcHJlLWV4aXN0aW5nIElEQiBrZXkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIHdlIGRvIG5vdCBtaW50IG9uZSwgd2Ugc2VlZC4gQ2hyb21lL0ZpcmVmb3ggZnJlc2hcbiAqICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxzIHRoZXJlZm9yZSB1c2UgYHNlZWRgIHRvbyBcdTIwMTQgb25lIGNvZGUgcGF0aCwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgb25seSBvbmUgd2hvc2UgcGVyc2lzdGVuY2Ugd2UgY2FuIGFjdHVhbGx5IHZlcmlmeS5cbiAqICAgICAgICBjLiBgbWVtb3J5YCBcdTIwMTQgbGFzdCByZXNvcnQgKHVuaXQgdGVzdHMsIHNhbmRib3hlZCBjb250ZXh0cykuIFNlY3JldHNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZWQgaGVyZSBkbyBub3Qgc3Vydml2ZSBhIHJlbG9hZC5cbiAqXG4gKiAgICAgIFRoZSByZXNvbHZlZCBzdHJhdGVneSBpcyBTVElDS1k6IGl0IGlzIHJlY29yZGVkIGluIHN0b3JhZ2UubG9jYWwgdW5kZXJcbiAqICAgICAgYGRldmljZUtleVN0cmF0ZWd5YCBhbmQgaG9ub3VyZWQgb24gbGF0ZXIgbG9hZHMsIHNvIGEgY29udGV4dCBjYW5ub3RcbiAqICAgICAgc2lsZW50bHkgZmxpcCBzdHJhdGVnaWVzIGFuZCBvcnBoYW4gdGhlIGJsb2JzIHdyaXR0ZW4gdW5kZXIgdGhlIG9sZFxuICogICAgICBvbmUuIERlY3J5cHRpb24gaXMgc3ltbWV0cmljIHJlZ2FyZGxlc3M6IGBkZWNyeXB0V2l0aERldmljZUtleWAgdHJpZXNcbiAqICAgICAgdGhlIGN1cnJlbnQga2V5LCB0aGVuIGV2ZXJ5IG90aGVyIGtleSB0aGlzIGluc3RhbGwgY291bGQgZXZlciBoYXZlIGhhZFxuICogICAgICAobGVnYWN5IElEQiBoYW5kbGUsIGV4aXN0aW5nIHNlZWQpLCBhbmQgY2FsbGVycyB1c2luZ1xuICogICAgICBgZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXBgIHJlLXdyYXAgdW5kZXIgdGhlIGN1cnJlbnQgc3RyYXRlZ3kuXG4gKlxuICogICAgICBUaHJlYXQgbW9kZWwsIGhvbmVzdGx5IHN0YXRlZDogdGhlIHBhc3N3b3JkbGVzcyBkZXZpY2UgdGllciBpcyBhdC1yZXN0XG4gKiAgICAgIHByb3RlY3Rpb24gYWdhaW5zdCBjYXN1YWwgaW5zcGVjdGlvbiBvZiBleHRlbnNpb24gc3RvcmFnZSwgTk9UIGEgZGVmZW5jZVxuICogICAgICBhZ2FpbnN0IGNvZGUgYWxyZWFkeSBleGVjdXRpbmcgaW4gdGhpcyBleHRlbnNpb24ncyBjb250ZXh0LiBUaGVcbiAqICAgICAgc3Ryb25nZXN0IHRpZXIgYXZhaWxhYmxlIHRvZGF5IGlzIGEgKiptYXN0ZXIgcGFzc3dvcmQqKiAoYmVsb3cpLCB3aGljaFxuICogICAgICBkZXJpdmVzIHRoZSB3cmFwcGluZyBrZXkgZnJvbSBhIHNlY3JldCB0aGF0IGlzIG5ldmVyIHN0b3JlZC4gVXNlcnNcbiAqICAgICAgaG9sZGluZyBoaWdoLXZhbHVlIGtleXMgc2hvdWxkIHNldCBvbmUuIEEgaGFyZHdhcmUtYmFja2VkIGRldmljZSBrZXkgaXNcbiAqICAgICAgZnV0dXJlIHdvcmsuIChUaWVyIHRyYWRlb2ZmcyBpbiBmdWxsOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKlxuICogICAyLiBTRVNTSU9OIEtFWSAobWFzdGVyIHBhc3N3b3JkIHNldCArIHVubG9ja2VkKSBcdTIwMTQgdGhlIEFFUy0yNTYtR0NNIGtleVxuICogICAgICBkZXJpdmVkIGZyb20gdGhlIHBhc3N3b3JkIChzZWUgY3J5cHRvLmpzKS4gU2V0IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlclxuICogICAgICBvbiB1bmxvY2sgdmlhIGBzZXRTZXNzaW9uS2V5YCwgY2xlYXJlZCBvbiBsb2NrIHZpYSBgY2xlYXJTZXNzaW9uYC5cbiAqXG4gKiBCbG9iIGZvcm1hdHMgKGJvdGggYXJlIHNlbGYtZGVzY3JpYmluZyBKU09OIHN0cmluZ3MpOlxuICogICBwYXNzd29yZCBibG9iIDogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9XG4gKiAgIGRldmljZSAgYmxvYiA6IHsgdjoxLCBrOlwiZGV2aWNlXCIsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqXG4gKiBgdW53cmFwU2VjcmV0YCByZWZ1c2VzIHRvIGRlY3J5cHQgd2hlbiB0aGUgc2Vzc2lvbiBoYXMgYmVlbiBleHBsaWNpdGx5IGxvY2tlZFxuICogKEY1L0Y2KSBzbyBhIGxvY2tlZCBwYWdlIGNhbm5vdCByZWFkIHNlY3JldHMuXG4gKi9cblxuaW1wb3J0IHsgZW5jcnlwdFdpdGhLZXksIGRlY3J5cHRXaXRoS2V5IH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuY29uc3QgREVWSUNFX0RCID0gJ25vc3Rya2V5LXNlY3JldC12YXVsdCc7XG5jb25zdCBERVZJQ0VfU1RPUkUgPSAna2V5cyc7XG5jb25zdCBERVZJQ0VfS0VZX0lEID0gJ2RldmljZS13cmFwLWtleS12MSc7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBiYXNlNjQgcmF3IHNlZWQgZm9yIHRoZSBgc2VlZGAgc3RyYXRlZ3kuXG5jb25zdCBERVZJQ0VfU0VFRF9LRVkgPSAnZGV2aWNlS2V5U2VlZCc7XG5jb25zdCBERVZJQ0VfU0VFRF9CWVRFUyA9IDMyO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgU1RJQ0tZIHJlc29sdmVkIHN0cmF0ZWd5ICgnaWRiJyB8ICdzZWVkJykuXG5jb25zdCBERVZJQ0VfU1RSQVRFR1lfS0VZID0gJ2RldmljZUtleVN0cmF0ZWd5JztcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIChrZXB0IGxvY2FsIHNvIHRoaXMgbW9kdWxlIGhhcyBubyBjcm9zcy1kZXBzKSAtLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGFiVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFRvQWIoYjY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIFNlc3Npb24gKHBhc3N3b3JkLWRlcml2ZWQpIGtleSBzdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfc2Vzc2lvbktleSA9IG51bGw7ICAgLy8gQ3J5cHRvS2V5IHwgbnVsbFxubGV0IF9zZXNzaW9uU2FsdCA9IG51bGw7ICAvLyBVaW50OEFycmF5IHwgbnVsbFxuLy8gX3VubG9ja2VkOiBudWxsID0gcGFzc3dvcmRsZXNzIC8gbm90IGFwcGxpY2FibGUgKG5ldmVyIGxvY2tlZCksXG4vLyAgICAgICAgICAgIHRydWUgPSB1bmxvY2tlZCwgZmFsc2UgPSBsb2NrZWQgKHJlZnVzZSBzZWNyZXQgcmVhZHMpLlxubGV0IF91bmxvY2tlZCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uS2V5KGNyeXB0b0tleSwgc2FsdCkge1xuICAgIF9zZXNzaW9uS2V5ID0gY3J5cHRvS2V5O1xuICAgIF9zZXNzaW9uU2FsdCA9IHNhbHQ7XG4gICAgX3VubG9ja2VkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcbiAgICBfc2Vzc2lvbktleSA9IG51bGw7XG4gICAgX3Nlc3Npb25TYWx0ID0gbnVsbDtcbiAgICBfdW5sb2NrZWQgPSBmYWxzZTtcbn1cblxuLyoqIEV4cGxpY2l0bHkgbWFyayB0aGUgc2Vzc2lvbiB1bmxvY2tlZC9sb2NrZWQgd2l0aG91dCBwcm92aWRpbmcgYSBrZXkuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VW5sb2NrZWQodikge1xuICAgIF91bmxvY2tlZCA9IHYgPT09IG51bGwgPyBudWxsIDogISF2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2Vzc2lvbktleSgpIHtcbiAgICByZXR1cm4gISFfc2Vzc2lvbktleTtcbn1cblxuLy8gLS0tIERldmljZSBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG5sZXQgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDsgICAvLyAnaWRiJyB8ICdzZWVkJyB8ICdtZW1vcnknIFx1MjAxNCBzZXQgb25jZSByZXNvbHZlZFxubGV0IF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsOyAgLy8gbGFzdC1yZXNvcnQga2V5IGZvciBjb250ZXh0cyB0aGF0IHBlcnNpc3Qgbm90aGluZ1xubGV0IF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiB0aGUgcHJlLTEuOC4xIElEQiBrZXlcbmxldCBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gYW4gZXhpc3Rpbmcgc2VlZCBrZXlcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZXZpY2VLZXkoKSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlOiByYXcgYnl0ZXMgY2FuIG5ldmVyIGJlIHJlYWQgYmFjayBvdXRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkRGJBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ZWREQiAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92ZSBhIGNhbmRpZGF0ZSBrZXkgaXMgYWN0dWFsbHkgdXNhYmxlIGJlZm9yZSB3ZSB0cnVzdCBhIHN0cmF0ZWd5IHdpdGggYVxuICogdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBBIHJlYWQtYmFjayBoYW5kbGUgdGhhdCBzdHJ1Y3R1cmVkLWNsb25lXG4gKiBtYW5nbGVkIChvciBhIHNlZWQgdGhhdCBjYW1lIGJhY2sgdHJ1bmNhdGVkKSBmYWlscyBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHlcbiAqIHByb2R1Y2luZyB1bmRlY3J5cHRhYmxlIGJsb2JzLlxuICovXG5hc3luYyBmdW5jdGlvbiBrZXlSb3VuZFRyaXBzKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgICAgIGNvbnN0IHByb2JlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdub3N0cmtleS1kZXZpY2UtcHJvYmUnKTtcbiAgICAgICAgY29uc3QgY3QgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgcHJvYmUpO1xuICAgICAgICBjb25zdCBwdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBjdCk7XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocHQpID09PSAnbm9zdHJrZXktZGV2aWNlLXByb2JlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRldmljZURiKCkge1xuICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICBjb25zdCB7IG9wZW5EQiB9ID0gYXdhaXQgaW1wb3J0KCdpZGInKTtcbiAgICByZXR1cm4gb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICB1cGdyYWRlKGQpIHtcbiAgICAgICAgICAgIGlmICghZC5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKERFVklDRV9TVE9SRSkpIHtcbiAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgKGEpOiBBRE9QVCBhIHByZS1leGlzdGluZyBub24tZXh0cmFjdGFibGUgQ3J5cHRvS2V5IGhhbmRsZSBmcm9tXG4gKiBJbmRleGVkREIuIE5ldmVyIG1pbnRzIG9uZS5cbiAqXG4gKiBBIGtleSB0aGF0IGRiLmdldCgpIGhhbmRzIGJhY2sgaXMgYSBrZXkgc29tZSBFQVJMSUVSIGNvbnRleHQgd3JvdGUsIHNvIGl0IGlzXG4gKiBwcm9vZiBvZiBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlIFx1MjAxNCB0aGUgb25lIHRoaW5nIGEgc2FtZS1jb250ZXh0XG4gKiBwdXRcdTIxOTJnZXRcdTIxOTJyb3VuZC10cmlwIHByb2JlIGNhbiBuZXZlciBlc3RhYmxpc2guIGlPUyBTYWZhcmkncyBJbmRleGVkREIgaXNcbiAqIGZ1bmN0aW9uYWwgYnV0IGVwaGVtZXJhbCBmb3IgdGhlIGV4dGVuc2lvbiBiYWNrZ3JvdW5kOiBpdCB3b3VsZCBoYXZlIHBhc3NlZFxuICogdGhlIHByb2JlIGFuZCB0aGVuIGxvc3QgdGhlIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gU286IG5vXG4gKiBwcmUtZXhpc3Rpbmcga2V5IG1lYW5zIG5vIGBpZGJgLCBhbmQgdGhlIGNhbGxlciBzZWVkcyBpbnN0ZWFkLlxuICpcbiAqIFJldHVybnMgbnVsbCAobmV2ZXIgdGhyb3dzKSB3aGVuIG5vdGhpbmcgdXNhYmxlIGlzIHRoZXJlLlxuICovXG5hc3luYyBmdW5jdGlvbiB0cnlJZGJEZXZpY2VLZXkoKSB7XG4gICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuIG51bGw7IC8vIGVtcHR5IHN0b3JlIFx1MjE5MiBzZWVkLCBkbyBOT1QgbWludCBoZXJlXG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhleGlzdGluZykpID8gZXhpc3RpbmcgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHN0b3JhZ2UgYXJlYSBiYWNraW5nIHRoZSBgc2VlZGAgc3RyYXRlZ3kuIEltcG9ydGVkIGxhemlseSBiZWNhdXNlXG4gKiBicm93c2VyLXBvbHlmaWxsIHRocm93cyBhdCBtb2R1bGUgbG9hZCB3aGVuIG5vIGV4dGVuc2lvbiBuYW1lc3BhY2UgZXhpc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWVkU3RvcmFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgcmV0dXJuIGFwaT8uc3RvcmFnZT8ubG9jYWwgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogU2lnbmFsIDI6IGEgV2ViS2l0IHVzZXIgYWdlbnQgd2l0aCBubyBDaHJvbWl1bSBtYXJrZXIgb24gaXQuICovXG5mdW5jdGlvbiBsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdWEgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgJyc7XG4gICAgICAgIHJldHVybiAvU2FmYXJpfEFwcGxlV2ViS2l0Ly50ZXN0KHVhKSAmJiAhL0Nocm9tKGV8aXVtKXxFZGdcXC98T1BSXFwvLy50ZXN0KHVhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcnVlIG9uIFNhZmFyaSAoaU9TICsgbWFjT1MpLCB3aGVyZSBJbmRleGVkREIgbXVzdCBORVZFUiBob2xkIHRoZSB3cmFwcGluZ1xuICoga2V5IFx1MjAxNCBzZWUgdGhlIG1vZHVsZSBoZWFkZXIncyBzdG9yYWdlLXNjb3BlIG5vdGUuXG4gKlxuICogRGV0ZWN0aW9uIGlzIG11bHRpLXNpZ25hbCBhbmQgQklBU0VEIFRPV0FSRCBTQUZBUkksIGJlY2F1c2UgdGhlIHR3byBlcnJvcnNcbiAqIGFyZSBub3Qgc3ltbWV0cmljOiBzZWVkaW5nIGEgQ2hyb21lIHZhdWx0IGNvc3RzIG5vdGhpbmcgKHNlZWQgaXMgYWxyZWFkeSB0aGVcbiAqIHN0cmF0ZWd5IGV2ZXJ5IGZyZXNoIGluc3RhbGwgbGFuZHMgb24pLCB3aGlsZSBhZG9wdGluZyBhbiBJREIga2V5IG9uIFNhZmFyaVxuICogaXMgdW5zYWZlLiBTbyBvbmx5IGEgUE9TSVRJVkVMWSBpZGVudGlmaWVkIENocm9tZS9GaXJlZm94IG9yaWdpbiBtYXkgYWRvcHQgYW5cbiAqIEluZGV4ZWREQiBrZXkgXHUyMDE0IGEgZ2V0VVJMIHRoYXQgaXMgbWlzc2luZywgdGhyb3dzLCByZXR1cm5zIGEgbm9uLXN0cmluZyxcbiAqIHJldHVybnMgJycgb3IgcmV0dXJucyBhIHNjaGVtZSB3ZSBkbyBub3QgcmVjb2duaXNlIGFsbCByZXNvbHZlIHRvIFNhZmFyaS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNTYWZhcmlFbmdpbmUoKSB7XG4gICAgbGV0IG9yaWdpbiA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaT8ucnVudGltZT8uZ2V0VVJMPy4oJycpO1xuICAgICAgICBvcmlnaW4gPSB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgfVxuICAgIC8vIFNpZ25hbCAxOiBhIHBvc2l0aXZlbHkgaWRlbnRpZmllZCBTYWZhcmkgb3JpZ2luLlxuICAgIGlmIChvcmlnaW4gJiYgb3JpZ2luLnN0YXJ0c1dpdGgoJ3NhZmFyaS13ZWItZXh0ZW5zaW9uOi8vJykpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAyOiBhIFdlYktpdC1vbmx5IFVBIG91dHJhbmtzIHRoZSBvcmlnaW4gXHUyMDE0IGEgU2FmYXJpIGJ1aWxkIHRoYXRcbiAgICAvLyByZXBvcnRlZCBhbiB1bmV4cGVjdGVkIG9yaWdpbiBzdGlsbCBtdXN0IG5vdCB0b3VjaCBJbmRleGVkREIuXG4gICAgaWYgKGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMzogb25seSB0aGVzZSB0d28gb3JpZ2lucyBlYXJuIHRoZSBJREIgYWRvcHQgcGF0aC5cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW4uc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8IG9yaWdpbi5zdGFydHNXaXRoKCdtb3otZXh0ZW5zaW9uOi8vJykpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7IC8vIGFtYmlndW91cyBcdTIxOTIgc2VlZFxufVxuXG4vKiogSW1wb3J0IHJhdyBzZWVkIGJ5dGVzIChiYXNlNjQpIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ00ga2V5LiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1wb3J0U2VlZEtleShzZWVkQjY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JywgYmFzZTY0VG9BYihzZWVkQjY0KSwgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZSBvbmNlIGltcG9ydGVkXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuLyoqIFJlYWQgdGhlIHN0aWNreSBzdHJhdGVneSByZWNvcmRlZCBieSBhIHByZXZpb3VzIHJlc29sdXRpb24gKG51bGwgaWYgbm9uZSkuICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3RpY2t5U3RyYXRlZ3koKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgcyA9IGdvdD8uW0RFVklDRV9TVFJBVEVHWV9LRVldO1xuICAgICAgICByZXR1cm4gKHMgPT09ICdpZGInIHx8IHMgPT09ICdzZWVkJykgPyBzIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogUmVjb3JkIHRoZSByZXNvbHZlZCBzdHJhdGVneSBzbyBsYXRlciBsb2FkcyBjYW5ub3Qgc2lsZW50bHkgZmxpcCBpdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlU3RpY2t5U3RyYXRlZ3koc3RyYXRlZ3kpIHtcbiAgICBpZiAoc3RyYXRlZ3kgIT09ICdpZGInICYmIHN0cmF0ZWd5ICE9PSAnc2VlZCcpIHJldHVybjsgLy8gJ21lbW9yeScgcGVyc2lzdHMgbm90aGluZ1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBzdHJhdGVneSB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmVzdCBlZmZvcnQgXHUyMDE0IHRoZSBzdHJhdGVneSBzdGlsbCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgKi8gfVxufVxuXG4vKiogU3RyYXRlZ3kgKGIpOiBhIHJhdyByYW5kb20gc2VlZCBpbiBzdG9yYWdlLmxvY2FsLCBpbXBvcnRlZCBub24tZXh0cmFjdGFibGUuICovXG5hc3luYyBmdW5jdGlvbiB0cnlTZWVkRGV2aWNlS2V5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgbGV0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgICAgIHNlZWQgPSBhYlRvQmFzZTY0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoREVWSUNFX1NFRURfQllURVMpKS5idWZmZXIpO1xuICAgICAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IHNlZWQgfSk7XG4gICAgICAgICAgICAvLyBWRVJJRlkgcGVyc2lzdGVuY2UgYmVmb3JlIGFueXRoaW5nIGlzIHdyYXBwZWQgdW5kZXIgaXQuXG4gICAgICAgICAgICBjb25zdCBjaGVjayA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3QgcGVyc2lzdGVkID0gY2hlY2s/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKHBlcnNpc3RlZCAhPT0gc2VlZCkge1xuICAgICAgICAgICAgICAgIC8vIEFub3RoZXIgY29udGV4dCAocG9wdXAgdnMgYmFja2dyb3VuZCBvbiBhIGZpcnN0IHJ1bikgbWludGVkXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdyb3RlIGl0cyBvd24gc2VlZCBiZXR3ZWVuIG91ciBzZXQoKSBhbmQgdGhpcyByZWFkLiBBRE9QVFxuICAgICAgICAgICAgICAgIC8vIFRIRSBXSU5ORVI6IGFueSBzZWVkIGFjdHVhbGx5IGluIHN0b3JhZ2UgaXMgZXhhY3RseSBhcyBnb29kIGFzXG4gICAgICAgICAgICAgICAgLy8gb3VycywgYW5kIGl0IGlzIHRoZSBvbmUgdGhlIG90aGVyIGNvbnRleHQgaXMgYWxyZWFkeSB3cmFwcGluZ1xuICAgICAgICAgICAgICAgIC8vIHVuZGVyLiBSZXR1cm5pbmcgbnVsbCBoZXJlIHdvdWxkIGRyb3AgdGhlIGNhbGxlciB0aHJvdWdoIHRvXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbW9yeSBrZXksIHdob3NlIGJsb2JzIGRpZSB3aXRoIHRoaXMgY29udGV4dCBcdTIwMTQgdGhlIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBsb3NzIHRoaXMgc3RyYXRlZ3kgZXhpc3RzIHRvIHByZXZlbnQuIE9ubHkgYSBnZW51aW5lbHkgYWJzZW50XG4gICAgICAgICAgICAgICAgLy8gb3IgdW51c2FibGUgdmFsdWUgaXMgYSBmYWlsdXJlLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGVyc2lzdGVkICE9PSAnc3RyaW5nJyB8fCBwZXJzaXN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWVkID0gcGVyc2lzdGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgKGNyZWF0aW5nIG9uIGZpcnN0IHVzZSkgdGhlIGRldmljZSB3cmFwIGtleS5cbiAqXG4gKiBSZXNvbHV0aW9uIG9yZGVyLCBvbmNlOiBob25vdXIgdGhlIHN0aWNreSBzdHJhdGVneSB0aGlzIGluc3RhbGwgYWxyZWFkeVxuICogcmVjb3JkZWQ7IG90aGVyd2lzZSBBRE9QVCBhIHByZS1leGlzdGluZyBJbmRleGVkREIga2V5IGlmIG9uZSBpcyB0aGVyZSwgYW5kXG4gKiBmYWlsaW5nIHRoYXQgc2VlZC4gV2hhdGV2ZXIgcmVzb2x2ZXMgaXMgd3JpdHRlbiBiYWNrIGFzIHRoZSBzdGlja3kgc3RyYXRlZ3kuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZXZpY2VLZXkoKSB7XG4gICAgaWYgKF9kZXZpY2VLZXlQcm9taXNlKSByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG4gICAgX2RldmljZUtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja3kgPSBhd2FpdCByZWFkU3RpY2t5U3RyYXRlZ3koKTtcblxuICAgICAgICAvLyBBIHZhdWx0IGFscmVhZHkgb24gYHNlZWRgIG5ldmVyIHJlLXByb2JlcyBJbmRleGVkREI6IGl0cyBibG9icyBhcmVcbiAgICAgICAgLy8gdW5kZXIgdGhlIHNlZWQga2V5LCBhbmQgYWRvcHRpbmcgYSBzdHJheSBJREIgaGFuZGxlIHdvdWxkIG9ycGhhbiB0aGVtLlxuICAgICAgICAvLyBPbiBTYWZhcmkgd2UgbmV2ZXIgV1JJVEUgdW5kZXIgYW4gSURCIGtleSBhdCBhbGwgKHNlZSBoZWFkZXIpOiBpdHNcbiAgICAgICAgLy8gcGVyLWVuZ2luZSBzdG9yYWdlIHNjb3BpbmcgbWFrZXMgYW4gYWRvcHRlZCBJREIgaGFuZGxlIHVuc2FmZSBhcyBhXG4gICAgICAgIC8vIHdyYXBwaW5nIGtleS4gRXhpc3RpbmcgSURCIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdFxuICAgICAgICAvLyBmYWxsYmFjayBhbmQgYXJlIHJlLXdyYXBwZWQgdW5kZXIgdGhlIHNlZWQgYnkgdGhlIGF0LXJlc3QgbWlncmF0aW9uLlxuICAgICAgICBpZiAoc3RpY2t5ICE9PSAnc2VlZCcgJiYgIShhd2FpdCBpc1NhZmFyaUVuZ2luZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgaWRiS2V5ID0gYXdhaXQgdHJ5SWRiRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBpZiAoaWRiS2V5KSB7XG4gICAgICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ2lkYic7XG4gICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnaWRiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkYktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCB0cnlTZWVkRGV2aWNlS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSB7XG4gICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnc2VlZCc7XG4gICAgICAgICAgICAvLyBBbHNvIGNvdmVycyB0aGUgZGVncmFkZSBjYXNlOiBzdGlja3kgd2FzICdpZGInIGJ1dCB0aGUgaGFuZGxlIGlzXG4gICAgICAgICAgICAvLyBnb25lLiBPbGQgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0IGZhbGxiYWNrIGJlbG93LlxuICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnc2VlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlZWRLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RoaW5nIHBlcnNpc3RzIGhlcmUuIEJldHRlciB0aGFuIHJlZnVzaW5nIHRvIGVuY3J5cHQsIGJ1dCBibG9ic1xuICAgICAgICAvLyB3cml0dGVuIHVuZGVyIHRoaXMga2V5IGRpZSB3aXRoIHRoZSBjb250ZXh0IFx1MjAxNCBzZWUgbW9kdWxlIGhlYWRlci5cbiAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ21lbW9yeSc7XG4gICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xufVxuXG4vKiogV2hpY2ggcGVyc2lzdGVuY2Ugc3RyYXRlZ3kgdGhlIGRldmljZSBrZXkgcmVzb2x2ZWQgdG8gKG51bGwgdW50aWwgcmVzb2x2ZWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZUtleVN0cmF0ZWd5KCkge1xuICAgIHJldHVybiBfZGV2aWNlU3RyYXRlZ3k7XG59XG5cbi8qKlxuICogRHJvcCBldmVyeSBtZW1vaXNlZCBkZXZpY2Uta2V5IGhhbmRsZS4gTVVTVCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYW55XG4gKiBgc3RvcmFnZS5jbGVhcigpYDogdGhlIHNlZWQgKGFuZCB0aGUgc3RpY2t5IHN0cmF0ZWd5KSBhcmUgZ29uZSBmcm9tIHN0b3JhZ2UsXG4gKiBzbyBhIGNhY2hlZCBwcm9taXNlIHdvdWxkIGtlZXAgaGFuZGluZyBvdXQgYSBrZXkgd2hvc2UgYmFja2luZyBtYXRlcmlhbCBub1xuICogbG9uZ2VyIGV4aXN0cyBcdTIwMTQgdGhlIG5leHQgZ2V0RGV2aWNlS2V5KCkgd291bGQgd3JhcCBzZWNyZXRzIHVuZGVyIGEga2V5IHRoYXRcbiAqIGRpZXMgd2l0aCB0aGlzIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldERldmljZUtleSgpIHtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDtcbiAgICBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGRldmljZSBrZXksIHVzZWQgb25seSBhcyBhXG4gKiBkZWNyeXB0IGZhbGxiYWNrIGZvciBibG9icyB3cml0dGVuIGJlZm9yZSB0aGlzIGNvbnRleHQgY2hhbmdlZCBzdHJhdGVneS5cbiAqIE5ldmVyIGNyZWF0ZXMgb25lLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRMZWdhY3lJZGJLZXkoKSB7XG4gICAgaWYgKF9sZWdhY3lJZGJLZXlQcm9taXNlKSByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIHRoZSBrZXkgYW4gRVhJU1RJTkcgYGRldmljZUtleVNlZWRgIGltcG9ydHMgdG8sIHVzZWQgb25seVxuICogYXMgYSBkZWNyeXB0IGZhbGxiYWNrLiBOZXZlciBtaW50cyBhIHNlZWQgKHRoYXQgaXMgdHJ5U2VlZERldmljZUtleSdzIGpvYikuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEV4aXN0aW5nU2VlZEtleSgpIHtcbiAgICBpZiAoX2V4aXN0aW5nU2VlZEtleVByb21pc2UpIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKCFzZWVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG59XG5cbi8qKlxuICogRXZlcnkgT1RIRVIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBoYXZlIHdyYXBwZWQgYSBkZXZpY2UgYmxvYiB1bmRlciwgaW5cbiAqIHByZWZlcmVuY2Ugb3JkZXIuIFN0cmF0ZWd5IGZsaXBzIChpZGJcdTIxOTJzZWVkIG9uIGRlZ3JhZGUsIHNlZWRcdTIxOTJpZGIgb24gYW5cbiAqIGFkb3B0ZWQgaGFuZGxlKSBtdXN0IG5ldmVyIG9ycGhhbiBhIGJsb2IsIHNvIHRoZSBmYWxsYmFjayBpcyBzeW1tZXRyaWM6IGFcbiAqIHNlZWQgYmxvYiBzdGF5cyByZWFkYWJsZSB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicgYW5kIHZpY2UgdmVyc2EuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZhbGxiYWNrRGV2aWNlS2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gW107XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ2lkYicpIHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gYXdhaXQgZ2V0TGVnYWN5SWRiS2V5KCk7XG4gICAgICAgIGlmIChsZWdhY3kpIGtleXMucHVzaChsZWdhY3kpO1xuICAgIH1cbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnc2VlZCcpIHtcbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IGdldEV4aXN0aW5nU2VlZEtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkga2V5cy5wdXNoKHNlZWRLZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2Igd2l0aCB0aGUgY3VycmVudCBrZXksIGZhbGxpbmcgYmFjayB0byBldmVyeSBvdGhlciBrZXlcbiAqIHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQuIFJldHVybnMgdGhlIHBsYWludGV4dCBwbHVzIHdoZXRoZXIgYSBmYWxsYmFjayBrZXlcbiAqIHdhcyBuZWVkZWQgKGkuZS4gdGhlIGJsb2IgaXMgc3RhbGUgYW5kIHdvcnRoIHJlLXdyYXBwaW5nKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSwgc3RhbGU6IGZhbHNlIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGZhbGxiYWNrIG9mIGF3YWl0IGZhbGxiYWNrRGV2aWNlS2V5cygpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGZhbGxiYWNrLCBpdiwgY2lwaGVydGV4dCksXG4gICAgICAgICAgICAgICAgICAgIHN0YWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogdHJ5IHRoZSBuZXh0IG9uZSAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTsgLy8gcmVwb3J0IHRoZSBDVVJSRU5UIGtleSdzIGZhaWx1cmUsIG5vdCB0aGUgbGFzdCBmYWxsYmFjaydzXG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgZW5jLmVuY29kZShwbGFpbnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdjogMSxcbiAgICAgICAgazogJ2RldmljZScsXG4gICAgICAgIGl2OiBhYlRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYWJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FiKGl2KSkgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBiYXNlNjRUb0FiKGNpcGhlcnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aERldmljZUtleShlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICAvLyBHQ00gYXV0aGVudGljYXRpb24gY2FuIGZhaWwgd2l0aCB0aGUgQ1VSUkVOVCBzdHJhdGVneSdzIGtleSBiZWNhdXNlIHRoZVxuICAgIC8vIGJsb2IgcHJlZGF0ZXMgYSBzdHJhdGVneSBjaGFuZ2UgKGEgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd2hvc2UgSURCIGhhbmRsZVxuICAgIC8vIGlzIHN0aWxsIHJlYWRhYmxlIHdoaWxlIHRoaXMgY29udGV4dCBzZXR0bGVkIG9uIHRoZSBzZWVkLCBvciB0aGUgcmV2ZXJzZSkuXG4gICAgLy8gVHJ5IGV2ZXJ5IGtleSB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkIGJlZm9yZSBkZWNsYXJpbmcgdGhlIHNlY3JldCBsb3N0LlxuICAgIGNvbnN0IHsgcGxhaW50ZXh0IH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHBsYWludGV4dDtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2IgYW5kLCB3aGVuIGl0IGNvdWxkIG9ubHkgYmUgcmVhZCB2aWEgYSBmYWxsYmFjayBrZXlcbiAqIChsZWdhY3kgSW5kZXhlZERCIGhhbmRsZSwgb3IgYW4gZXhpc3Rpbmcgc2VlZCB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicpLFxuICogaGFuZCBiYWNrIGEgcmVwbGFjZW1lbnQgYmxvYiB3cmFwcGVkIHVuZGVyIHRoZSBDVVJSRU5UIHN0cmF0ZWd5IHNvIHRoZSBjYWxsZXJcbiAqIGNhbiBwZXJzaXN0IHRoZSB1cGdyYWRlIG9wcG9ydHVuaXN0aWNhbGx5LlxuICogYHJld3JhcHBlZGAgaXMgbnVsbCB3aGVuIHRoZSBibG9iIGlzIGFscmVhZHkgY3VycmVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwKGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IHsgcGxhaW50ZXh0LCBzdGFsZSB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBsYWludGV4dCxcbiAgICAgICAgcmV3cmFwcGVkOiBzdGFsZSA/IGF3YWl0IGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkgOiBudWxsLFxuICAgIH07XG59XG5cbi8vIC0tLSBCbG9iIGNsYXNzaWZpY2F0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZnVuY3Rpb24gaXNQYXNzd29yZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5zYWx0ICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0ICYmIHAuayAhPT0gJ2RldmljZScpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLmsgPT09ICdkZXZpY2UnICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbi8qKiBUcnVlIGlmIHRoZSB2YWx1ZSBpcyBhbHJlYWR5IGNpcGhlcnRleHQgKGVpdGhlciB3cmFwcGluZykuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaXBoZXJ0ZXh0KHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB8fCBpc0RldmljZUtleUJsb2IodmFsdWUpO1xufVxuXG4vLyAtLS0gVW5pZmllZCB3cmFwIC8gdW53cmFwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBzZWNyZXQgZm9yIGF0LXJlc3Qgc3RvcmFnZS4gUHJlZmVycyB0aGUgcGFzc3dvcmQtZGVyaXZlZCBzZXNzaW9uXG4gKiBrZXkgd2hlbiBvbmUgaXMgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dCAoYmFja2dyb3VuZCwgdW5sb2NrZWQpOyBvdGhlcndpc2VcbiAqIGZhbGxzIGJhY2sgdG8gdGhlIGFsd2F5cy1hdmFpbGFibGUgZGV2aWNlIGtleS4gTmV2ZXIgcmV0dXJucyBwbGFpbnRleHQuXG4gKlxuICogVGhlIHRpZXIgaXMgdGhlcmVmb3JlIEFNQklFTlQgXHUyMDE0IGl0IGlzIHdoYXRldmVyIGBzZXRTZXNzaW9uS2V5YCAvIGBjbGVhclNlc3Npb25gXG4gKiBsYXN0IGRpZCBpbiB0aGlzIG1vZHVsZSwgd2hpY2ggbWF5IGhhdmUgYmVlbiBkb25lIGJ5IGEgZGlmZmVyZW50IGZpbGUuIE9ubHlcbiAqIGNhbGwgdGhpcyB3aGVyZSBlaXRoZXIgdGllciBpcyBnZW51aW5lbHkgYWNjZXB0YWJsZSAoYSB2YWx1ZSB0aGF0XG4gKiBgdW53cmFwU2VjcmV0YCBjYW4gb3BlbiB1bmRlciBib3RoKS4gQSBjYWxsZXIgdGhhdCBuZWVkcyBhIFNQRUNJRklDIHRpZXIgbXVzdFxuICogbmFtZSBpdDogYGVuY3J5cHRXaXRoRGV2aWNlS2V5YCBvciBgZW5jcnlwdFdpdGhLZXlgLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEBwYXJhbSB7e2V4dHJhY3RhYmxlPzogYm9vbGVhbn19IFtvcHRpb25zXSAtIGBleHRyYWN0YWJsZTogdHJ1ZWAgYWxsb3dzIHRoZVxuICogICAgICAgIHJhdyBieXRlcyB0byBiZSBleHBvcnRlZCBvbmNlIChzZWUgZXhwb3J0S2V5QmFzZTY0KS4gVXNlZCBieSB0aGVcbiAqICAgICAgICBiYWNrZ3JvdW5kIHdvcmtlciBzbyBhbiB1bmxvY2tlZCBzZXNzaW9uIGNhbiBiZSBwYXJrZWQgaW5cbiAqICAgICAgICBzdG9yYWdlLnNlc3Npb24gYW5kIGZ1bGx5IHJlc3RvcmVkIGFmdGVyIGFuIE1WMyBldmljdGlvbi4gRGVmYXVsdFxuICogICAgICAgIGZhbHNlOiB0aGUga2V5IGlzIG9wYXF1ZSBhbmQgY2Fubm90IGxlYXZlIHRoZSBjcnlwdG8gc3Vic3lzdGVtLlxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgICEhb3B0aW9ucy5leHRyYWN0YWJsZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKlxuICogRXhwb3J0IGFuIGV4dHJhY3RhYmxlIEFFUyBrZXkncyByYXcgYnl0ZXMgYXMgYmFzZTY0LlxuICogT25seSBldmVyIGNhbGxlZCBvbiBhIGtleSBkZXJpdmVkIHdpdGggYHsgZXh0cmFjdGFibGU6IHRydWUgfWAuXG4gKlxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gYmFzZTY0IHJhdyBrZXkgYnl0ZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleUJhc2U2NChrZXkpIHtcbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChhd2FpdCBjcnlwdG8uc3VidGxlLmV4cG9ydEtleSgncmF3Jywga2V5KSk7XG59XG5cbi8qKlxuICogSW1wb3J0IGJhc2U2NCByYXcgYnl0ZXMgYmFjayBpbnRvIGEgTk9OLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNIGtleS5cbiAqIFRoZSBjb3VudGVycGFydCBvZiBleHBvcnRLZXlCYXNlNjQ6IHdoYXRldmVyIHdlbnQgb3V0IGV4dHJhY3RhYmxlIGNvbWVzIGJhY2tcbiAqIG9wYXF1ZSwgc28gYSByZXN0b3JlZCBzZXNzaW9uIGtleSBjYW5ub3QgYmUgcmUtZXhwb3J0ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NCAtIHJhdyBrZXkgYnl0ZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlCYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKiBiYXNlNjQgXHUyMTk0IGJ5dGVzLCBleHBvcnRlZCBzbyBjYWxsZXJzIGNhbiByb3VuZC10cmlwIGEgc2FsdCB0aHJvdWdoIEpTT04uICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlcykge1xuICAgIC8vIGBuZXcgVWludDhBcnJheSh2aWV3KWAgaW5zaWRlIHRoZSBoZWxwZXIgY29waWVzIHRoZSBWSUVXLCBzbyBhIHNhbHQgdGhhdFxuICAgIC8vIGlzIGEgd2luZG93IGludG8gYSBsYXJnZXIgYnVmZmVyIHN0aWxsIGVuY29kZXMgY29ycmVjdGx5LlxuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ5dGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgKGlnbm9yZXMgdGhlIHNhbHQgZW1iZWRkZWQgaW4gdGhlXG4gKiBibG9iIFx1MjAxNCB0aGUgY2FsbGVyIG11c3Qgc3VwcGx5IGEga2V5IHRoYXQgbWF0Y2hlcyBob3cgdGhlIGJsb2Igd2FzIGVuY3J5cHRlZCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKS9lbmNyeXB0V2l0aEtleSgpXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAtIEFFUy0yNTYtR0NNIGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhLZXkoZW5jcnlwdGVkRGF0YSwga2V5KSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGhhc2gsIHN0b3JlZEhhc2gpO1xufVxuXG4vKipcbiAqIENvbnN0YW50LXRpbWUgY29tcGFyaXNvbiBvZiB0d28gYmFzZTY0LWVuY29kZWQgYnl0ZSBzdHJpbmdzLlxuICpcbiAqIERlY29kZXMgYm90aCB0byByYXcgYnl0ZXMgYW5kIGNvbXBhcmVzIHdpdGggYW4gYWNjdW11bGF0b3Igc28gdGhlIHJ1bm5pbmdcbiAqIHRpbWUgZG9lcyBub3QgZGVwZW5kIG9uIHdoZXJlIHRoZSBmaXJzdCBtaXNtYXRjaCBvY2N1cnMgXHUyMDE0IHRoaXMgYXZvaWRzIHRoZVxuICogdGltaW5nIHNpZGUtY2hhbm5lbCBvZiBhIHBsYWluIGA9PT1gIHN0cmluZyBjb21wYXJlIChUaWVyLTMgY3J5cHRvLmpzOjIxMykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChhLCBiKSB7XG4gICAgbGV0IGJhLCBiYjtcbiAgICB0cnkge1xuICAgICAgICBiYSA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYSkpO1xuICAgICAgICBiYiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYikpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgdGhlIG1heCBsZW5ndGggc28gbGVuZ3RoIGRpZmZlcmVuY2VzIGRvbid0IHNob3J0LWNpcmN1aXQgZWFybHkuXG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgoYmEubGVuZ3RoLCBiYi5sZW5ndGgpO1xuICAgIGxldCBkaWZmID0gYmEubGVuZ3RoIF4gYmIubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGlmZiB8PSAoYmFbaV0gfHwgMCkgXiAoYmJbaV0gfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkaWZmID09PSAwO1xufVxuIiwgIi8qKlxuICogYnVua2VyOi8vIGNvbm5lY3Rpb24gc3RyaW5ncy4gTm8gaW1wb3J0cywgc28gYW55dGhpbmcgdGhhdCBoYW5kbGVzIHByb2ZpbGVzXG4gKiBjYW4gdXNlIHRoaXMgd2l0aG91dCBsb2FkaW5nIHRoZSByZWxheSBjb2RlLlxuICpcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5cbi8qKlxuICogUGFyc2UgYSBidW5rZXI6Ly8gY29ubmVjdGlvbiBzdHJpbmdcbiAqIEZvcm1hdDogYnVua2VyOi8vPHB1YmtleT4/cmVsYXk9d3NzOi8vLi4uJnJlbGF5PXdzczovLy4uLiZzZWNyZXQ9PG9wdGlvbmFsPlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdW5rZXJVcmwodXJsKSB7XG4gICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnYnVua2VyOi8vJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1bmtlciBVUkw6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgY29uc3QgcmVtb3RlUHVia2V5ID0gcGFyc2VkLmhvc3RuYW1lIHx8IHBhcnNlZC5wYXRobmFtZS5yZXBsYWNlKCcvLycsICcnKTtcblxuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBwdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5cyA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0QWxsKCdyZWxheScpO1xuICAgIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidW5rZXIgVVJMOiBhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSByZWxheSBVUkxzXG4gICAgZm9yIChjb25zdCByZWxheSBvZiByZWxheXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBuZXcgVVJMKHJlbGF5KTtcbiAgICAgICAgICAgIGlmIChyLnByb3RvY29sICE9PSAnd3NzOicgJiYgci5wcm90b2NvbCAhPT0gJ3dzOicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcmVsYXkgcHJvdG9jb2w6ICR7ci5wcm90b2NvbH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlbGF5IFVSTDogJHtyZWxheX1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNlY3JldCA9IHBhcnNlZC5zZWFyY2hQYXJhbXMuZ2V0KCdzZWNyZXQnKSB8fCBudWxsO1xuXG4gICAgcmV0dXJuIHsgcmVtb3RlUHVia2V5LCByZWxheXMsIHNlY3JldCB9O1xufVxuXG4vKipcbiAqIEEgcmVsYXkgdmFsdWUgd2l0aG91dCBjcmVkZW50aWFsczogbm8gdXNlcmluZm8sIG5vIGBzZWNyZXRgIHBhcmFtLCBubyBmcmFnbWVudC5cbiAqIE90aGVyIHF1ZXJ5IHBhcmFtcyBzdGF5LiBBIHZhbHVlIHdpdGggbm9uZSBvZiB0aG9zZSBjb21lcyBiYWNrIHVuY2hhbmdlZC5cbiAqL1xuZnVuY3Rpb24gY2xlYW5SZWxheShyZWxheSkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVsYXkpO1xuICAgIGNvbnN0IG5hbWVzID0gWy4uLnVybC5zZWFyY2hQYXJhbXMua2V5cygpXS5maWx0ZXIobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWNyZXQnKTtcbiAgICBpZiAoIXVybC51c2VybmFtZSAmJiAhdXJsLnBhc3N3b3JkICYmICF1cmwuaGFzaCAmJiBuYW1lcy5sZW5ndGggPT09IDApIHJldHVybiByZWxheTtcbiAgICB1cmwudXNlcm5hbWUgPSAnJztcbiAgICB1cmwucGFzc3dvcmQgPSAnJztcbiAgICB1cmwuaGFzaCA9ICcnO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUobmFtZSk7XG4gICAgcmV0dXJuIHVybC5ocmVmO1xufVxuXG4vKipcbiAqIERvZXMgdGhpcyBjb25uZWN0aW9uIHN0cmluZyBjYXJyeSBhIHNlY3JldCByZWRhY3RCdW5rZXJVcmwgd291bGQgcmVtb3ZlLCBpbiBpdHNcbiAqIGBzZWNyZXRgIHBhcmFtIG9yIGluc2lkZSBhIHJlbGF5IHZhbHVlPyBOZXZlciB0aHJvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidW5rZXJVcmxIYXNTZWNyZXQodXJsKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBzZWNyZXQsIHJlbGF5cyB9ID0gcGFyc2VCdW5rZXJVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuICEhc2VjcmV0IHx8IHJlbGF5cy5zb21lKHJlbGF5ID0+IGNsZWFuUmVsYXkocmVsYXkpICE9PSByZWxheSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbmNvbnN0IGVuY29kZVJlbGF5ID0gKHJlbGF5KSA9PlxuICAgIGVuY29kZVVSSUNvbXBvbmVudChyZWxheSkucmVwbGFjZSgvJTNBL2csICc6JykucmVwbGFjZSgvJTJGL2csICcvJyk7XG5cbi8qKlxuICogVGhlIHNpZ25lcidzIGFkZHJlc3MgYWxvbmU6IGJ1bmtlcjovLzxwdWJrZXk+P3JlbGF5PS4uLiZyZWxheT0uLi5cbiAqIFJlYnVpbHQgZnJvbSB0aGUgcGFyc2VkIGZpZWxkcywgc28gb2YgdGhlIGNvbm5lY3Rpb24gc3RyaW5nIG9ubHkgdGhlIHB1YmtleSBhbmRcbiAqIHRoZSByZWxheSB2YWx1ZXMgc3Vydml2ZS4gRWFjaCByZWxheSB2YWx1ZSBsb3NlcyBpdHMgdXNlcmluZm8sIGBzZWNyZXRgIHBhcmFtXG4gKiBhbmQgZnJhZ21lbnQsIGFuZCBrZWVwcyBhbnkgb3RoZXIgcXVlcnkgcGFyYW1zIGl0IGhhcy5cbiAqXG4gKiBAcGFyYW0geyp9IHVybCBhIGNvbm5lY3Rpb24gc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgYWRkcmVzcywgb3IgJycgaWYgYHVybGAgaXMgbm90IGEgdmFsaWQgY29ubmVjdGlvbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdEJ1bmtlclVybCh1cmwpIHtcbiAgICBsZXQgcGFyc2VkO1xuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlZCA9IHBhcnNlQnVua2VyVXJsKHVybCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgY29uc3QgcmVsYXlzID0gcGFyc2VkLnJlbGF5cy5tYXAocmVsYXkgPT4gYHJlbGF5PSR7ZW5jb2RlUmVsYXkoY2xlYW5SZWxheShyZWxheSkpfWApLmpvaW4oJyYnKTtcbiAgICByZXR1cm4gYGJ1bmtlcjovLyR7cGFyc2VkLnJlbW90ZVB1YmtleX0/JHtyZWxheXN9YDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSBwcm9maWxlIGxpc3Qgd2l0aCBlYWNoIGJ1bmtlclVybCByZWR1Y2VkIHRvIGl0cyBhZGRyZXNzLlxuICpcbiAqIEBwYXJhbSB7Kn0gcHJvZmlsZXMgYSBwcm9maWxlIGxpc3Q7IGFueXRoaW5nIGVsc2UgaXMgcmV0dXJuZWQgYXMgaXQgaXNcbiAqIEByZXR1cm5zIHRoZSBzYW1lIGxpc3Qgd2hlbiBub3RoaW5nIG5lZWRlZCBjaGFuZ2luZywgc28gYSBjYWxsZXIgY2FuIHNraXAgYVxuICogICAgICAgICAgd3JpdGUgYnkgY29tcGFyaW5nIHJlZmVyZW5jZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZGFjdFByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2ZpbGVzKSkgcmV0dXJuIHByb2ZpbGVzO1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgY29uc3QgY2xlYW4gPSBwcm9maWxlcy5tYXAoKHByb2ZpbGUpID0+IHtcbiAgICAgICAgaWYgKCFwcm9maWxlPy5idW5rZXJVcmwpIHJldHVybiBwcm9maWxlO1xuICAgICAgICBjb25zdCBidW5rZXJVcmwgPSByZWRhY3RCdW5rZXJVcmwocHJvZmlsZS5idW5rZXJVcmwpO1xuICAgICAgICBpZiAoYnVua2VyVXJsID09PSBwcm9maWxlLmJ1bmtlclVybCkgcmV0dXJuIHByb2ZpbGU7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4geyAuLi5wcm9maWxlLCBidW5rZXJVcmwgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2hhbmdlZCA/IGNsZWFuIDogcHJvZmlsZXM7XG59XG5cbi8qKlxuICogU3RvcmVkIHNlc3Npb25zIGFyZSBrZXllZCBieSBwcm9maWxlIHBvc2l0aW9uLiBSZW1vdmluZyBhIHByb2ZpbGUgdGFrZXMgaXRzXG4gKiBzZXNzaW9uIHdpdGggaXQgYW5kIG1vdmVzIGxhdGVyIHNlc3Npb25zIGRvd24gd2l0aCB0aGVpciBwcm9maWxlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdDxzdHJpbmcsICo+fSBidW5rZXJTZXNzaW9uc1xuICogQHBhcmFtIHtudW1iZXJ9IHJlbW92ZWRJbmRleFxuICogQHJldHVybnMge09iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVua2VyU2Vzc2lvbnNBZnRlckRlbGV0ZShidW5rZXJTZXNzaW9ucywgcmVtb3ZlZEluZGV4KSB7XG4gICAgY29uc3Qgc2hpZnRlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBpZiAoaW5kZXggPT09IHJlbW92ZWRJbmRleCkgY29udGludWU7XG4gICAgICAgIHNoaWZ0ZWRbaW5kZXggPiByZW1vdmVkSW5kZXggPyBpbmRleCAtIDEgOiBpbmRleF0gPSBzZXNzaW9uO1xuICAgIH1cbiAgICByZXR1cm4gc2hpZnRlZDtcbn1cblxuLyoqXG4gKiBUaGUgc2FtZSwgZm9yIGFueSBjaGFuZ2Ugb2YgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3Q8c3RyaW5nLCAqPn0gYnVua2VyU2Vzc2lvbnNcbiAqIEBwYXJhbSB7QXJyYXk8W251bWJlciwgP251bWJlcl0+fSBtb3ZlcyBlYWNoIHByb2ZpbGUgdGhhdCBtb3ZlZCwgYW5kIHRvIHdoZXJlOyBudWxsIGlmIGdvbmVcbiAqIEByZXR1cm5zIHtPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1bmtlclNlc3Npb25zQWZ0ZXJNb3ZlcyhidW5rZXJTZXNzaW9ucywgbW92ZXMpIHtcbiAgICBjb25zdCBtb3ZlZCA9IG5ldyBNYXAobW92ZXMpO1xuICAgIGNvbnN0IHBsYWNlZCA9IHt9O1xuICAgIGZvciAoY29uc3QgW3Bvc2l0aW9uLCBzZXNzaW9uXSBvZiBPYmplY3QuZW50cmllcyhidW5rZXJTZXNzaW9ucyB8fCB7fSkpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBOdW1iZXIocG9zaXRpb24pO1xuICAgICAgICBjb25zdCB0byA9IG1vdmVkLmhhcyhpbmRleCkgPyBtb3ZlZC5nZXQoaW5kZXgpIDogaW5kZXg7XG4gICAgICAgIGlmICh0byAhPT0gbnVsbCkgcGxhY2VkW3RvXSA9IHNlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBwbGFjZWQ7XG59XG4iLCAiLyoqXG4gKiBPbmUgb3JkZXJlZCB3cml0ZSBwYXRoIGZvciB0aGUgYHByb2ZpbGVzYCBhcnJheSBpbiBzdG9yYWdlLmxvY2FsLlxuICpcbiAqIEV2ZXJ5IHdyaXRlciB1c2VkIHRvIHJlYWQgdGhlIHdob2xlIGFycmF5LCBhd2FpdCBzb21ldGhpbmcgKGNyeXB0bywgYSByZWxheVxuICogZmV0Y2gsIGFub3RoZXIgc3RvcmFnZSByZWFkKSBhbmQgd3JpdGUgdGhlIHdob2xlIGFycmF5IGJhY2suIEEgc2xvdyB3cml0ZXJcbiAqIHRoZW4gd3JvdGUgYSBzdGFsZSBjb3B5IG92ZXIgYSBuZXdlciBvbmU6IGEgcmVsYXkgZWRpdCB2YW5pc2hlZCwgb3IgYSBzaXRlXG4gKiBwZXJtaXNzaW9uIHRoYXQgaGFkIGp1c3QgYmVlbiByZXZva2VkIGNhbWUgYmFjay5cbiAqXG4gKiBIZXJlIGV2ZXJ5IGNoYW5nZSBydW5zIGFzOiB0YWtlIHRoZSBsb2NrLCByZWFkIGBwcm9maWxlc2AgZnJlc2gsIGFwcGx5IGFcbiAqIFNZTkNIUk9OT1VTIG11dGF0b3IgdGhhdCBjaGFuZ2VzIG9ubHkgdGhlIGZpZWxkcyBpdHMgY2FsbGVyIG93bnMsIHdyaXRlLCBsZXRcbiAqIGdvLiBTbG93IHdvcmsgaGFwcGVucyBiZWZvcmUgdGhlIGNhbGwsIG5ldmVyIGluc2lkZSB0aGUgbG9jay5cbiAqXG4gKiBUaGUgbG9jayBpcyB0aGUgV2ViIExvY2tzIEFQSSB3aGVuIHRoZSBjb250ZXh0IGhhcyBpdC4gVGhlIHdvcmtlciBhbmQgZXZlcnlcbiAqIGV4dGVuc2lvbiBwYWdlIHNoYXJlIG9uZSBvcmlnaW4sIHNvIG9uZSBuYW1lZCBsb2NrIG9yZGVycyB3cml0ZXMgYWNyb3NzIGFsbFxuICogb2YgdGhlbSB3aXRob3V0IGEgbmV3IG1lc3NhZ2Uga2luZC4gRWFjaCBjb250ZXh0IGFsc28gY2hhaW5zIGl0cyBvd24gY2FsbHMsXG4gKiB3aGljaCBpcyB0aGUgd2hvbGUgbG9jayB3aGVyZSBXZWIgTG9ja3MgYXJlIG1pc3NpbmcgKHRlc3RzLCBvbGRlciBlbmdpbmVzKS5cbiAqL1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgTE9DS19OQU1FID0gJ25vc3Rya2V5OnByb2ZpbGVzJztcbmxldCBsb2NhbENoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbi8qKiBSdW4gYGZuYCB3aXRoIHRoZSBwcm9maWxlcyBsb2NrIGhlbGQuIE5ldmVyIGNhbGwgdGhpcyBmcm9tIGluc2lkZSBgZm5gLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhQcm9maWxlc0xvY2soZm4pIHtcbiAgICBjb25zdCBsb2NrcyA9IGdsb2JhbFRoaXMubmF2aWdhdG9yPy5sb2NrcztcbiAgICBjb25zdCB0YXNrID0gKGxvY2tzICYmIHR5cGVvZiBsb2Nrcy5yZXF1ZXN0ID09PSAnZnVuY3Rpb24nKVxuICAgICAgICA/ICgpID0+IGxvY2tzLnJlcXVlc3QoTE9DS19OQU1FLCAoKSA9PiBmbigpKVxuICAgICAgICA6ICgpID0+IGZuKCk7XG4gICAgY29uc3QgcnVuID0gbG9jYWxDaGFpbi50aGVuKHRhc2ssIHRhc2spO1xuICAgIGxvY2FsQ2hhaW4gPSBydW4uY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiBydW47XG59XG5cbi8qKlxuICogUmVhZCBgcHJvZmlsZXNgIGZyZXNoLCBhcHBseSBgbXV0YXRvcihwcm9maWxlcywgZGF0YSlgIGFuZCB3cml0ZSB0aGUgcmVzdWx0LlxuICpcbiAqIFRoZSBtdXRhdG9yIG11c3QgYmUgc3luY2hyb25vdXMuIEl0IGNoYW5nZXMgdGhlIGFycmF5IGluIHBsYWNlIGFuZCByZXR1cm5zXG4gKiBmYWxzZSB0byBza2lwIHRoZSB3cml0ZSwgb3IgYW4gb2JqZWN0IG9mIG90aGVyIGtleXMgdG8gd3JpdGUgaW4gdGhlIHNhbWVcbiAqIHN0b3JhZ2Ugd3JpdGUsIG9yIG5vdGhpbmcuIGBrZXlzYCBuYW1lcyBvdGhlciBzdG9yZWQgdmFsdWVzICh3aXRoIGRlZmF1bHRzKVxuICogdGhlIG11dGF0b3IgbmVlZHMgdG8gcmVhZDsgdGhleSBhcnJpdmUgaW4gYGRhdGFgLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlPHt3cml0dGVuOiBib29sZWFuLCBwcm9maWxlczogQXJyYXl9Pn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVByb2ZpbGVzKG11dGF0b3IsIHsgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsLCBrZXlzID0ge30gfSA9IHt9KSB7XG4gICAgcmV0dXJuIHdpdGhQcm9maWxlc0xvY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyAuLi5rZXlzLCBwcm9maWxlczogW10gfSk7XG4gICAgICAgIGNvbnN0IHByb2ZpbGVzID0gQXJyYXkuaXNBcnJheShkYXRhLnByb2ZpbGVzKSA/IGRhdGEucHJvZmlsZXMgOiBbXTtcbiAgICAgICAgY29uc3Qgb3V0ID0gbXV0YXRvcihwcm9maWxlcywgZGF0YSk7XG4gICAgICAgIGlmIChvdXQgJiYgdHlwZW9mIG91dC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VwZGF0ZVByb2ZpbGVzOiB0aGUgbXV0YXRvciBtdXN0IGJlIHN5bmNocm9ub3VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dCA9PT0gZmFsc2UpIHJldHVybiB7IHdyaXR0ZW46IGZhbHNlLCBwcm9maWxlcyB9O1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IC4uLihvdXQgfHwge30pLCBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHsgd3JpdHRlbjogdHJ1ZSwgcHJvZmlsZXMgfTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBcHBseSBwcml2YXRlLWtleSBjaGFuZ2VzIHdvcmtlZCBvdXQgZWFybGllciwgbWF0Y2hlZCBieSB0aGUgc3RvcmVkIGJsb2JcbiAqIHRoZXkgcmVwbGFjZSwgc28gYSBwcm9maWxlIHRoYXQgbW92ZWQgb3IgY2hhbmdlZCBtZWFud2hpbGUgaXMgbmV2ZXIgdG91Y2hlZFxuICogYnkgbWlzdGFrZS4gYGNoYW5nZXNgIG1hcHMgYW4gb2xkIHByaXZLZXkgdG8gYHsgcHJpdktleT8sIHB1YktleT8gfWA7IGFcbiAqIHB1YktleSBpcyBvbmx5IGZpbGxlZCBpbiB3aGVyZSBub25lIGlzIGNhY2hlZC4gUmV0dXJucyB0aGUgdXBkYXRlIHJlc3VsdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5S2V5Q2hhbmdlcyhjaGFuZ2VzLCB7IHN0b3JhZ2UsIGV4dHJhID0gbnVsbCwgd3JpdGVJZkVtcHR5ID0gZmFsc2UgfSA9IHt9KSB7XG4gICAgaWYgKCEoY2hhbmdlcyBpbnN0YW5jZW9mIE1hcCkgfHwgKGNoYW5nZXMuc2l6ZSA9PT0gMCAmJiAhd3JpdGVJZkVtcHR5KSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgd3JpdHRlbjogZmFsc2UsIHByb2ZpbGVzOiBudWxsIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlUHJvZmlsZXMoKHByb2ZpbGVzKSA9PiB7XG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgcCBvZiBwcm9maWxlcykge1xuICAgICAgICAgICAgaWYgKCFwIHx8ICFwLnByaXZLZXkgfHwgIWNoYW5nZXMuaGFzKHAucHJpdktleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgYyA9IGNoYW5nZXMuZ2V0KHAucHJpdktleSk7XG4gICAgICAgICAgICBpZiAoYy5wdWJLZXkgJiYgIXAucHViS2V5KSB7IHAucHViS2V5ID0gYy5wdWJLZXk7IGNoYW5nZWQgPSB0cnVlOyB9XG4gICAgICAgICAgICBpZiAoYy5wcml2S2V5ICYmIGMucHJpdktleSAhPT0gcC5wcml2S2V5KSB7IHAucHJpdktleSA9IGMucHJpdktleTsgY2hhbmdlZCA9IHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNoYW5nZWQgJiYgIXdyaXRlSWZFbXB0eSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gZXh0cmEgfHwgdW5kZWZpbmVkO1xuICAgIH0sIHsgc3RvcmFnZSB9KTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQ0EsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFB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YztBQUMzRCxVQUFNLElBQUksRUFBRSxjQUFjO0FBQUcsUUFBSSxLQUFLLFFBQVMsR0FBRSxjQUFjO0FBQy9ELFVBQU0sSUFBSSxFQUFFLG1CQUFtQjtBQUFHLFFBQUksS0FBSyxPQUFRLEdBQUUsY0FBYztBQUNuRSxPQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDL0IsWUFBTSxNQUFNLElBQUksUUFBUSxPQUFPLHdCQUF3QjtBQUN2RCxhQUFPLEtBQUssS0FBSyxrQkFBa0I7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUVBLGlCQUFlLE9BQU87QUFFbEIsVUFBTSxjQUFjLE1BQU0sUUFBUSxhQUFhO0FBQy9DLFVBQU0sU0FBUyxNQUFNLFFBQVEsVUFBVTtBQUN2QyxVQUFNLE9BQU8sRUFBRSxtQkFBbUI7QUFDbEMsVUFBTSxPQUFPLEVBQUUsb0JBQW9CO0FBRW5DLFFBQUksQ0FBQyxhQUFhO0FBR2Qsa0JBQVksSUFBSTtBQUNoQixlQUFTLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFDdkI7QUFBQSxJQUNKO0FBRUEsUUFBSSxRQUFRO0FBRVIsa0JBQVksS0FBSztBQUNqQixlQUFTLE1BQU0sTUFBTTtBQUFBLFFBQ2pCLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNaLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFFQSxnQkFBWSxJQUFJO0FBQ2hCLFFBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUMvQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFFL0IsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hFLFVBQU0sWUFBWSxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUU7QUFDbEQsVUFBTSxjQUFjLE1BQU1DLGVBQWM7QUFDeEMsVUFBTSxPQUFPLE1BQU0sWUFBWTtBQUUvQixlQUFXO0FBQ1gsV0FBTztBQUVQLFFBQUksTUFBTSxlQUFlLFVBQVUsR0FBRztBQUNsQyxZQUFNLFFBQVE7QUFBQSxJQUNsQjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsTUFBTSxVQUFVLElBQUksQ0FBQzsiLAogICJuYW1lcyI6IFsidGFyZ2V0IiwgImluaXQiLCAiSVZfQllURVMiLCAiSVZfQllURVMiLCAib3BlbkRCIiwgImFwaSIsICJJVl9CWVRFUyIsICJzdG9yYWdlIiwgInN0b3JhZ2UiLCAiaXNTeW5jRW5hYmxlZCIsICJpc1N5bmNFbmFibGVkIl0KfQo=
