(() => {
  // node_modules/idb/build/index.js
  var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
  var idbProxyableTypes;
  var cursorAdvanceMethods;
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
  var transactionDoneMap = /* @__PURE__ */ new WeakMap();
  var transformCache = /* @__PURE__ */ new WeakMap();
  var reverseTransformCache = /* @__PURE__ */ new WeakMap();
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
  var idbProxyTraps = {
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
  var unwrap = (value) => reverseTransformCache.get(value);
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
  var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
  var writeMethods = ["put", "add", "delete", "clear"];
  var cachedMethods = /* @__PURE__ */ new Map();
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
  replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
  }));
  var advanceMethodProps = ["continue", "continuePrimaryKey", "advance"];
  var methodMap = {};
  var advanceResults = /* @__PURE__ */ new WeakMap();
  var ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
  var cursorIteratorTraps = {
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

  // src/utilities/db.js
  async function openEventsDb() {
    return await openDB("events", 1, {
      upgrade(db) {
        const events = db.createObjectStore("events", {
          keyPath: "event.id"
        });
        events.createIndex("pubkey", "event.pubkey");
        events.createIndex("created_at", "event.created_at");
        events.createIndex("kind", "event.kind");
        events.createIndex("host", "metadata.host");
      }
    });
  }
  async function sortByIndex(index, query, asc, max) {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db.transaction("events").store.index(index).openCursor(query, asc ? "next" : "prev");
    while (cursor) {
      events.push(cursor.value);
      if (events.length >= max) {
        break;
      }
      cursor = await cursor.continue();
    }
    return events;
  }
  async function getHosts() {
    let db = await openEventsDb();
    let hosts = /* @__PURE__ */ new Set();
    let cursor = await db.transaction("events").store.openCursor();
    while (cursor) {
      hosts.add(cursor.value.metadata.host);
      cursor = await cursor.continue();
    }
    return [...hosts];
  }
  async function downloadAllContents() {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db.transaction("events").store.openCursor();
    while (cursor) {
      events.push(cursor.value.event);
      cursor = await cursor.continue();
    }
    events = events.map((e) => JSON.stringify(e));
    events = events.join("\n");
    console.log(events);
    const file = new File([events], "events.jsonl", {
      type: "application/octet-stream"
    });
    const blob = new Blob([events], { type: "plain/text" });
    return blob;
  }

  // src/utilities/browser-polyfill.js
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
    }
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
    }
  };

  // src/utilities/utils.js
  var storage = api.storage.local;
  var RECOMMENDED_RELAYS = [
    new URL("wss://relay.damus.io"),
    new URL("wss://relay.primal.net"),
    new URL("wss://relay.snort.social"),
    new URL("wss://relay.getalby.com/v1"),
    new URL("wss://nos.lol"),
    new URL("wss://brb.io"),
    new URL("wss://nostr.orangepill.dev")
  ];
  var KINDS = [
    [0, "Metadata", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    [1, "Text", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    [2, "Recommend Relay", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    [3, "Contacts", "https://github.com/nostr-protocol/nips/blob/master/02.md"],
    [4, "Encrypted Direct Messages", "https://github.com/nostr-protocol/nips/blob/master/04.md"],
    [5, "Event Deletion", "https://github.com/nostr-protocol/nips/blob/master/09.md"],
    [6, "Repost", "https://github.com/nostr-protocol/nips/blob/master/18.md"],
    [7, "Reaction", "https://github.com/nostr-protocol/nips/blob/master/25.md"],
    [8, "Badge Award", "https://github.com/nostr-protocol/nips/blob/master/58.md"],
    [16, "Generic Repost", "https://github.com/nostr-protocol/nips/blob/master/18.md"],
    [40, "Channel Creation", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [41, "Channel Metadata", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [42, "Channel Message", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [43, "Channel Hide Message", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [44, "Channel Mute User", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [1063, "File Metadata", "https://github.com/nostr-protocol/nips/blob/master/94.md"],
    [1311, "Live Chat Message", "https://github.com/nostr-protocol/nips/blob/master/53.md"],
    [1984, "Reporting", "https://github.com/nostr-protocol/nips/blob/master/56.md"],
    [1985, "Label", "https://github.com/nostr-protocol/nips/blob/master/32.md"],
    [4550, "Community Post Approval", "https://github.com/nostr-protocol/nips/blob/master/72.md"],
    [7e3, "Job Feedback", "https://github.com/nostr-protocol/nips/blob/master/90.md"],
    [9041, "Zap Goal", "https://github.com/nostr-protocol/nips/blob/master/75.md"],
    [9734, "Zap Request", "https://github.com/nostr-protocol/nips/blob/master/57.md"],
    [9735, "Zap", "https://github.com/nostr-protocol/nips/blob/master/57.md"],
    [1e4, "Mute List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [10001, "Pin List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [10002, "Relay List Metadata", "https://github.com/nostr-protocol/nips/blob/master/65.md"],
    [13194, "Wallet Info", "https://github.com/nostr-protocol/nips/blob/master/47.md"],
    [22242, "Client Authentication", "https://github.com/nostr-protocol/nips/blob/master/42.md"],
    [23194, "Wallet Request", "https://github.com/nostr-protocol/nips/blob/master/47.md"],
    [23195, "Wallet Response", "https://github.com/nostr-protocol/nips/blob/master/47.md"],
    [24133, "Nostr Connect", "https://github.com/nostr-protocol/nips/blob/master/46.md"],
    [27235, "HTTP Auth", "https://github.com/nostr-protocol/nips/blob/master/98.md"],
    [3e4, "Categorized People List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [30001, "Categorized Bookmark List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [30008, "Profile Badges", "https://github.com/nostr-protocol/nips/blob/master/58.md"],
    [30009, "Badge Definition", "https://github.com/nostr-protocol/nips/blob/master/58.md"],
    [30017, "Create or update a stall", "https://github.com/nostr-protocol/nips/blob/master/15.md"],
    [30018, "Create or update a product", "https://github.com/nostr-protocol/nips/blob/master/15.md"],
    [30023, "Long-Form Content", "https://github.com/nostr-protocol/nips/blob/master/23.md"],
    [30024, "Draft Long-form Content", "https://github.com/nostr-protocol/nips/blob/master/23.md"],
    [30078, "Application-specific Data", "https://github.com/nostr-protocol/nips/blob/master/78.md"],
    [30311, "Live Event", "https://github.com/nostr-protocol/nips/blob/master/53.md"],
    [30315, "User Statuses", "https://github.com/nostr-protocol/nips/blob/master/38.md"],
    [30402, "Classified Listing", "https://github.com/nostr-protocol/nips/blob/master/99.md"],
    [30403, "Draft Classified Listing", "https://github.com/nostr-protocol/nips/blob/master/99.md"],
    [31922, "Date-Based Calendar Event", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31923, "Time-Based Calendar Event", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31924, "Calendar", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31925, "Calendar Event RSVP", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31989, "Handler recommendation", "https://github.com/nostr-protocol/nips/blob/master/89.md"],
    [31990, "Handler information", "https://github.com/nostr-protocol/nips/blob/master/89.md"],
    [34550, "Community Definition", "https://github.com/nostr-protocol/nips/blob/master/72.md"]
  ];
  async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
  }

  // src/event_history/event_history.js
  var TOMORROW = /* @__PURE__ */ new Date();
  TOMORROW.setDate(TOMORROW.getDate() + 1);
  var state = {
    events: [],
    view: "created_at",
    max: 100,
    sort: "asc",
    allHosts: [],
    host: "",
    allProfiles: [],
    profile: "",
    pubkey: "",
    selected: null,
    copied: false,
    // date view
    fromCreatedAt: "2008-10-31",
    toCreatedAt: TOMORROW.toISOString().split("T")[0],
    // kind view
    quickKind: "",
    fromKind: 0,
    toKind: 5e4
  };
  function $(id) {
    return document.getElementById(id);
  }
  function getFromTime() {
    const dt = new Date(state.fromCreatedAt);
    return Math.floor(dt.getTime() / 1e3);
  }
  function getToTime() {
    const dt = new Date(state.toCreatedAt);
    return Math.floor(dt.getTime() / 1e3);
  }
  function getKeyRange() {
    switch (state.view) {
      case "created_at":
        return IDBKeyRange.bound(getFromTime(), getToTime());
      case "kind":
        return IDBKeyRange.bound(state.fromKind, state.toKind);
      case "host":
        if (state.host.length === 0) return null;
        return IDBKeyRange.only(state.host);
      case "pubkey":
        if (state.pubkey.length === 0) return null;
        return IDBKeyRange.only(state.pubkey);
      default:
        return null;
    }
  }
  function formatDate(epochSeconds) {
    return new Date(epochSeconds * 1e3).toUTCString();
  }
  function formatKind(kind) {
    const k = KINDS.find(([kNum]) => kNum === kind);
    return k ? `${k[1]} (${kind})` : `Unknown (${kind})`;
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function render() {
    const viewSelect = $("view");
    const sortSelect = $("sort");
    const maxInput = $("max");
    if (viewSelect && document.activeElement !== viewSelect) viewSelect.value = state.view;
    if (sortSelect && document.activeElement !== sortSelect) sortSelect.value = state.sort;
    if (maxInput && document.activeElement !== maxInput) maxInput.value = state.max;
    const dateFilters = document.querySelectorAll('[data-filter="created_at"]');
    const kindFilters = document.querySelectorAll('[data-filter="kind"]');
    const hostFilters = document.querySelectorAll('[data-filter="host"]');
    const pubkeyFilters = document.querySelectorAll('[data-filter="pubkey"]');
    dateFilters.forEach((el) => el.style.display = state.view === "created_at" ? "" : "none");
    kindFilters.forEach((el) => el.style.display = state.view === "kind" ? "" : "none");
    hostFilters.forEach((el) => el.style.display = state.view === "host" ? "" : "none");
    pubkeyFilters.forEach((el) => el.style.display = state.view === "pubkey" ? "" : "none");
    const fromCreatedAt = $("fromCreatedAt");
    const toCreatedAt = $("toCreatedAt");
    if (fromCreatedAt && document.activeElement !== fromCreatedAt) fromCreatedAt.value = state.fromCreatedAt;
    if (toCreatedAt && document.activeElement !== toCreatedAt) toCreatedAt.value = state.toCreatedAt;
    const fromKind = $("fromKind");
    const toKind = $("toKind");
    if (fromKind && document.activeElement !== fromKind) fromKind.value = state.fromKind;
    if (toKind && document.activeElement !== toKind) toKind.value = state.toKind;
    const kindShortcut = $("kindShortcut");
    if (kindShortcut && document.activeElement !== kindShortcut) kindShortcut.value = state.quickKind;
    const hostSelect = $("host");
    if (hostSelect) {
      hostSelect.innerHTML = '<option value=""></option>' + state.allHosts.map((h) => `<option value="${escapeHtml(h)}" ${state.host === h ? "selected" : ""}>${escapeHtml(h)}</option>`).join("");
    }
    const profileSelect = $("profiles");
    if (profileSelect) {
      const profileNames = state.allProfiles.map((p) => p.name);
      profileSelect.innerHTML = '<option value=""></option>' + profileNames.map((p) => `<option value="${escapeHtml(p)}" ${state.profile === p ? "selected" : ""}>${escapeHtml(p)}</option>`).join("");
    }
    const pubkeyInput = $("pubkey");
    if (pubkeyInput && document.activeElement !== pubkeyInput) pubkeyInput.value = state.pubkey;
    const eventList = $("event-list");
    if (eventList) {
      eventList.innerHTML = state.events.map((event, index) => `
            <div class="mt-3 border-solid border border-monokai-bg-lighter rounded-lg">
                <div
                    class="select-none flex cursor-pointer text-sm md:text-xl"
                    data-action="toggle-event"
                    data-index="${index}"
                >
                    <div class="flex-none w-14 p-4 font-extrabold">${state.selected === index ? "-" : "+"}</div>
                    <div class="flex-1 w-64 p-4">${escapeHtml(formatDate(event.metadata.signed_at))}</div>
                    <div class="flex-1 w-64 p-4">${escapeHtml(event.metadata.host)}</div>
                    <div class="flex-1 w-64 p-4">${escapeHtml(formatKind(event.event.kind))}</div>
                </div>
                <div data-action="copy-event" data-index="${index}" class="cursor-pointer">
                    <pre
                        class="rounded-b-lg bg-monokai-bg-lighter text-sm md:text-base p-4 overflow-x-auto"
                        style="display:${state.selected === index ? "block" : "none"};"
                    >${escapeHtml(JSON.stringify(event, null, 2))}</pre>
                </div>
            </div>
        `).join("");
      eventList.querySelectorAll('[data-action="toggle-event"]').forEach((el) => {
        el.addEventListener("click", () => {
          const idx = parseInt(el.dataset.index);
          state.selected = state.selected === idx ? null : idx;
          render();
        });
      });
      eventList.querySelectorAll('[data-action="copy-event"]').forEach((el) => {
        el.addEventListener("click", async () => {
          const idx = parseInt(el.dataset.index);
          await copyEvent(idx);
        });
      });
    }
    const copiedToast = $("copied-toast");
    if (copiedToast) copiedToast.style.display = state.copied ? "block" : "none";
  }
  async function reload() {
    const events = await sortByIndex(
      state.view,
      getKeyRange(),
      state.sort === "asc",
      state.max
    );
    state.events = events.map((e) => ({ ...e, copied: false }));
    getHosts().then((hosts) => {
      state.allHosts = hosts;
      render();
    });
    const profiles = await getProfiles();
    state.allProfiles = await Promise.all(
      profiles.map(async (profile, index) => ({
        name: profile.name,
        pubkey: await api.runtime.sendMessage({
          kind: "getNpub",
          payload: index
        })
      }))
    );
    render();
  }
  async function saveAll() {
    const file = await downloadAllContents();
    api.tabs.create({
      url: URL.createObjectURL(file),
      active: true
    });
  }
  async function deleteAll() {
    if (confirm("Are you sure you want to delete ALL events?")) {
      await deleteDB("events");
      await reload();
    }
  }
  function quickKindSelect() {
    if (state.quickKind === "") return;
    const i = parseInt(state.quickKind);
    state.fromKind = i;
    state.toKind = i;
    reload();
  }
  function pkFromProfile() {
    const found = state.allProfiles.find(({ name }) => name === state.profile);
    if (found) {
      state.pubkey = found.pubkey;
      reload();
    }
  }
  async function copyEvent(index) {
    const event = JSON.stringify(state.events[index]);
    state.copied = true;
    render();
    setTimeout(() => {
      state.copied = false;
      render();
    }, 1e3);
    await navigator.clipboard.writeText(event);
  }
  var maxDebounceTimer = null;
  var pubkeyDebounceTimer = null;
  function bindEvents() {
    $("view")?.addEventListener("change", (e) => {
      state.view = e.target.value;
      reload();
    });
    $("sort")?.addEventListener("change", (e) => {
      state.sort = e.target.value;
      reload();
    });
    $("max")?.addEventListener("input", (e) => {
      state.max = parseInt(e.target.value) || 100;
      clearTimeout(maxDebounceTimer);
      maxDebounceTimer = setTimeout(() => reload(), 750);
    });
    $("fromCreatedAt")?.addEventListener("change", (e) => {
      state.fromCreatedAt = e.target.value;
      reload();
    });
    $("toCreatedAt")?.addEventListener("change", (e) => {
      state.toCreatedAt = e.target.value;
      reload();
    });
    $("kindShortcut")?.addEventListener("change", (e) => {
      state.quickKind = e.target.value;
      quickKindSelect();
    });
    $("fromKind")?.addEventListener("change", (e) => {
      state.fromKind = parseInt(e.target.value) || 0;
      reload();
    });
    $("toKind")?.addEventListener("change", (e) => {
      state.toKind = parseInt(e.target.value) || 5e4;
      reload();
    });
    $("host")?.addEventListener("change", (e) => {
      state.host = e.target.value;
      reload();
    });
    $("profiles")?.addEventListener("change", (e) => {
      state.profile = e.target.value;
      pkFromProfile();
    });
    $("pubkey")?.addEventListener("input", (e) => {
      state.pubkey = e.target.value;
      clearTimeout(pubkeyDebounceTimer);
      pubkeyDebounceTimer = setTimeout(() => reload(), 500);
    });
    $("save-all-btn")?.addEventListener("click", saveAll);
    $("delete-all-btn")?.addEventListener("click", deleteAll);
    $("close-btn")?.addEventListener("click", () => window.close());
  }
  async function init() {
    const kindShortcut = $("kindShortcut");
    if (kindShortcut) {
      kindShortcut.innerHTML = "<option></option>" + KINDS.map(([kind, desc]) => `<option value="${kind}">${escapeHtml(desc)}</option>`).join("");
    }
    bindEvents();
    await reload();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2lkYi9idWlsZC9pbmRleC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2RiLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3V0aWxzLmpzIiwgIi4uLy4uLy4uL3NyYy9ldmVudF9oaXN0b3J5L2V2ZW50X2hpc3RvcnkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBvcGVuREIgfSBmcm9tICdpZGInO1xuXG5hc3luYyBmdW5jdGlvbiBvcGVuRXZlbnRzRGIoKSB7XG4gICAgcmV0dXJuIGF3YWl0IG9wZW5EQignZXZlbnRzJywgMSwge1xuICAgICAgICB1cGdyYWRlKGRiKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudHMgPSBkYi5jcmVhdGVPYmplY3RTdG9yZSgnZXZlbnRzJywge1xuICAgICAgICAgICAgICAgIGtleVBhdGg6ICdldmVudC5pZCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgncHVia2V5JywgJ2V2ZW50LnB1YmtleScpO1xuICAgICAgICAgICAgZXZlbnRzLmNyZWF0ZUluZGV4KCdjcmVhdGVkX2F0JywgJ2V2ZW50LmNyZWF0ZWRfYXQnKTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgna2luZCcsICdldmVudC5raW5kJyk7XG4gICAgICAgICAgICBldmVudHMuY3JlYXRlSW5kZXgoJ2hvc3QnLCAnbWV0YWRhdGEuaG9zdCcpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUV2ZW50KGV2ZW50KSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgcmV0dXJuIGRiLnB1dCgnZXZlbnRzJywgZXZlbnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc29ydEJ5SW5kZXgoaW5kZXgsIHF1ZXJ5LCBhc2MsIG1heCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBldmVudHMgPSBbXTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGJcbiAgICAgICAgLnRyYW5zYWN0aW9uKCdldmVudHMnKVxuICAgICAgICAuc3RvcmUuaW5kZXgoaW5kZXgpXG4gICAgICAgIC5vcGVuQ3Vyc29yKHF1ZXJ5LCBhc2MgPyAnbmV4dCcgOiAncHJldicpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgaWYgKGV2ZW50cy5sZW5ndGggPj0gbWF4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvc3RzKCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBob3N0cyA9IG5ldyBTZXQoKTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGIudHJhbnNhY3Rpb24oJ2V2ZW50cycpLnN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIGhvc3RzLmFkZChjdXJzb3IudmFsdWUubWV0YWRhdGEuaG9zdCk7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5jb250aW51ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gWy4uLmhvc3RzXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQWxsQ29udGVudHMoKSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuICAgIGxldCBjdXJzb3IgPSBhd2FpdCBkYi50cmFuc2FjdGlvbignZXZlbnRzJykuc3RvcmUub3BlbkN1cnNvcigpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlLmV2ZW50KTtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICAgIGV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiBKU09OLnN0cmluZ2lmeShlKSk7XG4gICAgZXZlbnRzID0gZXZlbnRzLmpvaW4oJ1xcbicpO1xuICAgIGNvbnNvbGUubG9nKGV2ZW50cyk7XG5cbiAgICBjb25zdCBmaWxlID0gbmV3IEZpbGUoW2V2ZW50c10sICdldmVudHMuanNvbmwnLCB7XG4gICAgICAgIHR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtldmVudHNdLCB7IHR5cGU6ICdwbGFpbi90ZXh0JyB9KTtcblxuICAgIHJldHVybiBibG9iO1xufVxuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGVuY3J5cHQsIGRlY3J5cHQsIGhhc2hQYXNzd29yZCwgdmVyaWZ5UGFzc3dvcmQgfSBmcm9tICcuL2NyeXB0byc7XG5cbmNvbnN0IERCX1ZFUlNJT04gPSA1O1xuY29uc3Qgc3RvcmFnZSA9IGFwaS5zdG9yYWdlLmxvY2FsO1xuZXhwb3J0IGNvbnN0IFJFQ09NTUVOREVEX1JFTEFZUyA9IFtcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5kYW11cy5pbycpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LnByaW1hbC5uZXQnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5zbm9ydC5zb2NpYWwnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5nZXRhbGJ5LmNvbS92MScpLFxuICAgIG5ldyBVUkwoJ3dzczovL25vcy5sb2wnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9icmIuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3N0ci5vcmFuZ2VwaWxsLmRldicpLFxuXTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuZXhwb3J0IGNvbnN0IEtJTkRTID0gW1xuICAgIFswLCAnTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWQnXSxcbiAgICBbMSwgJ1RleHQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWQnXSxcbiAgICBbMiwgJ1JlY29tbWVuZCBSZWxheScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFszLCAnQ29udGFjdHMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDIubWQnXSxcbiAgICBbNCwgJ0VuY3J5cHRlZCBEaXJlY3QgTWVzc2FnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDQubWQnXSxcbiAgICBbNSwgJ0V2ZW50IERlbGV0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA5Lm1kJ10sXG4gICAgWzYsICdSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNywgJ1JlYWN0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI1Lm1kJ10sXG4gICAgWzgsICdCYWRnZSBBd2FyZCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81OC5tZCddLFxuICAgIFsxNiwgJ0dlbmVyaWMgUmVwb3N0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE4Lm1kJ10sXG4gICAgWzQwLCAnQ2hhbm5lbCBDcmVhdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MSwgJ0NoYW5uZWwgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDIsICdDaGFubmVsIE1lc3NhZ2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbNDMsICdDaGFubmVsIEhpZGUgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0NCwgJ0NoYW5uZWwgTXV0ZSBVc2VyJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzEwNjMsICdGaWxlIE1ldGFkYXRhJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk0Lm1kJ10sXG4gICAgWzEzMTEsICdMaXZlIENoYXQgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81My5tZCddLFxuICAgIFsxOTg0LCAnUmVwb3J0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU2Lm1kJ10sXG4gICAgWzE5ODUsICdMYWJlbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8zMi5tZCddLFxuICAgIFs0NTUwLCAnQ29tbXVuaXR5IFBvc3QgQXBwcm92YWwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzIubWQnXSxcbiAgICBbNzAwMCwgJ0pvYiBGZWVkYmFjaycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85MC5tZCddLFxuICAgIFs5MDQxLCAnWmFwIEdvYWwnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzUubWQnXSxcbiAgICBbOTczNCwgJ1phcCBSZXF1ZXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU3Lm1kJ10sXG4gICAgWzk3MzUsICdaYXAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbMTAwMDAsICdNdXRlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMTAwMDEsICdQaW4gTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMiwgJ1JlbGF5IExpc3QgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNjUubWQnXSxcbiAgICBbMTMxOTQsICdXYWxsZXQgSW5mbycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ny5tZCddLFxuICAgIFsyMjI0MiwgJ0NsaWVudCBBdXRoZW50aWNhdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Mi5tZCddLFxuICAgIFsyMzE5NCwgJ1dhbGxldCBSZXF1ZXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIzMTk1LCAnV2FsbGV0IFJlc3BvbnNlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzI0MTMzLCAnTm9zdHIgQ29ubmVjdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ni5tZCddLFxuICAgIFsyNzIzNSwgJ0hUVFAgQXV0aCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85OC5tZCddLFxuICAgIFszMDAwMCwgJ0NhdGVnb3JpemVkIFBlb3BsZSBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDAxLCAnQ2F0ZWdvcml6ZWQgQm9va21hcmsgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFszMDAwOCwgJ1Byb2ZpbGUgQmFkZ2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDA5LCAnQmFkZ2UgRGVmaW5pdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81OC5tZCddLFxuICAgIFszMDAxNywgJ0NyZWF0ZSBvciB1cGRhdGUgYSBzdGFsbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xNS5tZCddLFxuICAgIFszMDAxOCwgJ0NyZWF0ZSBvciB1cGRhdGUgYSBwcm9kdWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDIzLCAnTG9uZy1Gb3JtIENvbnRlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjMubWQnXSxcbiAgICBbMzAwMjQsICdEcmFmdCBMb25nLWZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDA3OCwgJ0FwcGxpY2F0aW9uLXNwZWNpZmljIERhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNzgubWQnXSxcbiAgICBbMzAzMTEsICdMaXZlIEV2ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzMwMzE1LCAnVXNlciBTdGF0dXNlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8zOC5tZCddLFxuICAgIFszMDQwMiwgJ0NsYXNzaWZpZWQgTGlzdGluZycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85OS5tZCddLFxuICAgIFszMDQwMywgJ0RyYWZ0IENsYXNzaWZpZWQgTGlzdGluZycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci85OS5tZCddLFxuICAgIFszMTkyMiwgJ0RhdGUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjMsICdUaW1lLUJhc2VkIENhbGVuZGFyIEV2ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTI0LCAnQ2FsZW5kYXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjUsICdDYWxlbmRhciBFdmVudCBSU1ZQJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUyLm1kJ10sXG4gICAgWzMxOTg5LCAnSGFuZGxlciByZWNvbW1lbmRhdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszMTk5MCwgJ0hhbmRsZXIgaW5mb3JtYXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvODkubWQnXSxcbiAgICBbMzQ1NTAsICdDb21tdW5pdHkgRGVmaW5pdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuXTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgYXdhaXQgZ2V0T3JTZXREZWZhdWx0KCdwcm9maWxlSW5kZXgnLCAwKTtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVzJywgW2F3YWl0IGdlbmVyYXRlUHJvZmlsZSgpXSk7XG4gICAgbGV0IHZlcnNpb24gPSAoYXdhaXQgc3RvcmFnZS5nZXQoeyB2ZXJzaW9uOiAwIH0pKS52ZXJzaW9uO1xuICAgIGNvbnNvbGUubG9nKCdEQiB2ZXJzaW9uOiAnLCB2ZXJzaW9uKTtcbiAgICB3aGlsZSAodmVyc2lvbiA8IERCX1ZFUlNJT04pIHtcbiAgICAgICAgdmVyc2lvbiA9IGF3YWl0IG1pZ3JhdGUodmVyc2lvbiwgREJfVkVSU0lPTik7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgdmVyc2lvbiB9KTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1pZ3JhdGUodmVyc2lvbiwgZ29hbCkge1xuICAgIGlmICh2ZXJzaW9uID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAxLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUuaG9zdHMgPSB7fSkpO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21pZ3JhdGluZyB0byB2ZXJzaW9uIDIuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMikge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gMy4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IChwcm9maWxlLnJlbGF5UmVtaW5kZXIgPSB0cnVlKSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMykge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNCAoZW5jcnlwdGlvbiBzdXBwb3J0KS4nKTtcbiAgICAgICAgLy8gTm8gZGF0YSB0cmFuc2Zvcm1hdGlvbiBuZWVkZWQgXHUyMDE0IGV4aXN0aW5nIHBsYWludGV4dCBrZXlzIHN0YXkgYXMtaXMuXG4gICAgICAgIC8vIEVuY3J5cHRpb24gb25seSBhY3RpdmF0ZXMgd2hlbiB0aGUgdXNlciBzZXRzIGEgbWFzdGVyIHBhc3N3b3JkLlxuICAgICAgICAvLyBXZSBqdXN0IGVuc3VyZSB0aGUgaXNFbmNyeXB0ZWQgZmxhZyBleGlzdHMgYW5kIGRlZmF1bHRzIHRvIGZhbHNlLlxuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICBpZiAoIWRhdGEuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNCkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNSAoTklQLTQ2IGJ1bmtlciBzdXBwb3J0KS4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChwcm9maWxlID0+IHtcbiAgICAgICAgICAgIGlmICghcHJvZmlsZS50eXBlKSBwcm9maWxlLnR5cGUgPSAnbG9jYWwnO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUuYnVua2VyVXJsID09PSB1bmRlZmluZWQpIHByb2ZpbGUuYnVua2VyVXJsID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChwcm9maWxlLnJlbW90ZVB1YmtleSA9PT0gdW5kZWZpbmVkKSBwcm9maWxlLnJlbW90ZVB1YmtleSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBwcml2S2V5OiB0eXBlID09PSAnbG9jYWwnID8gYXdhaXQgZ2VuZXJhdGVQcml2YXRlS2V5KCkgOiAnJyxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByaXZhdGVLZXkoaW5kZXgsIHByaXZhdGVLZXkpIHtcbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdzYXZlUHJpdmF0ZUtleScsXG4gICAgICAgIHBheWxvYWQ6IFtpbmRleCwgcHJpdmF0ZUtleV0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdQcm9maWxlKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgY29uc3QgbmV3UHJvZmlsZSA9IGF3YWl0IGdlbmVyYXRlUHJvZmlsZSgnTmV3IFByb2ZpbGUnKTtcbiAgICBwcm9maWxlcy5wdXNoKG5ld1Byb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdCdW5rZXJQcm9maWxlKG5hbWUgPSAnTmV3IEJ1bmtlcicsIGJ1bmtlclVybCA9IG51bGwpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IHByb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUobmFtZSwgJ2J1bmtlcicpO1xuICAgIHByb2ZpbGUuYnVua2VyVXJsID0gYnVua2VyVXJsO1xuICAgIHByb2ZpbGVzLnB1c2gocHJvZmlsZSk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMubGVuZ3RoIC0gMTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFJlbGF5cyhwcm9maWxlSW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUocHJvZmlsZUluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheXMgfHwgW107XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUmVsYXlzKHByb2ZpbGVJbmRleCwgcmVsYXlzKSB7XG4gICAgLy8gSGF2aW5nIGFuIEFscGluZSBwcm94eSBvYmplY3QgYXMgYSBzdWItb2JqZWN0IGRvZXMgbm90IHNlcmlhbGl6ZSBjb3JyZWN0bHkgaW4gc3RvcmFnZSxcbiAgICAvLyBzbyB3ZSBhcmUgcHJlLXNlcmlhbGl6aW5nIGhlcmUgYmVmb3JlIGFzc2lnbmluZyBpdCB0byB0aGUgcHJvZmlsZSwgc28gdGhlIHByb3h5XG4gICAgLy8gb2JqIGRvZXNuJ3QgYnVnIG91dC5cbiAgICBsZXQgZml4ZWRSZWxheXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlbGF5cykpO1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgbGV0IHByb2ZpbGUgPSBwcm9maWxlc1twcm9maWxlSW5kZXhdO1xuICAgIHByb2ZpbGUucmVsYXlzID0gZml4ZWRSZWxheXM7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLmhvc3RzPy5baG9zdF0/LlthY3Rpb25dIHx8ICdhc2snO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24sIHBlcm0sIGluZGV4ID0gbnVsbCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgaWYgKCFpbmRleCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IHByb2ZpbGVzW2luZGV4XTtcbiAgICBsZXQgbmV3UGVybXMgPSBwcm9maWxlLmhvc3RzW2hvc3RdIHx8IHt9O1xuICAgIG5ld1Blcm1zID0geyAuLi5uZXdQZXJtcywgW2FjdGlvbl06IHBlcm0gfTtcbiAgICBwcm9maWxlLmhvc3RzW2hvc3RdID0gbmV3UGVybXM7XG4gICAgcHJvZmlsZXNbaW5kZXhdID0gcHJvZmlsZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5QZXJtaXNzaW9uKHApIHtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlIHdoZXJlIGV2ZW50IHNpZ25pbmcgaW5jbHVkZXMgYSBraW5kIG51bWJlclxuICAgIGlmIChwLnN0YXJ0c1dpdGgoJ3NpZ25FdmVudDonKSkge1xuICAgICAgICBsZXQgW2UsIG5dID0gcC5zcGxpdCgnOicpO1xuICAgICAgICBuID0gcGFyc2VJbnQobik7XG4gICAgICAgIGxldCBubmFtZSA9IEtJTkRTLmZpbmQoayA9PiBrWzBdID09PSBuKT8uWzFdIHx8IGBVbmtub3duIChLaW5kICR7bn0pYDtcbiAgICAgICAgcmV0dXJuIGBTaWduIGV2ZW50OiAke25uYW1lfWA7XG4gICAgfVxuXG4gICAgc3dpdGNoIChwKSB7XG4gICAgICAgIGNhc2UgJ2dldFB1YktleSc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcHVibGljIGtleSc7XG4gICAgICAgIGNhc2UgJ3NpZ25FdmVudCc6XG4gICAgICAgICAgICByZXR1cm4gJ1NpZ24gZXZlbnQnO1xuICAgICAgICBjYXNlICdnZXRSZWxheXMnOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHJlbGF5IGxpc3QnO1xuICAgICAgICBjYXNlICduaXAwNC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXAwNC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXA0NC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBjYXNlICduaXA0NC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdVbmtub3duJztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUtleShrZXkpIHtcbiAgICBjb25zdCBoZXhNYXRjaCA9IC9eW1xcZGEtZl17NjR9JC9pLnRlc3Qoa2V5KTtcbiAgICBjb25zdCBiMzJNYXRjaCA9IC9ebnNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdezU4fSQvLnRlc3Qoa2V5KTtcblxuICAgIHJldHVybiBoZXhNYXRjaCB8fCBiMzJNYXRjaCB8fCBpc05jcnlwdHNlYyhrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOY3J5cHRzZWMoa2V5KSB7XG4gICAgcmV0dXJuIC9ebmNyeXB0c2VjMVtxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bF0rJC8udGVzdChrZXkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmVhdHVyZShuYW1lKSB7XG4gICAgbGV0IGZuYW1lID0gYGZlYXR1cmU6JHtuYW1lfWA7XG4gICAgbGV0IGYgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoeyBbZm5hbWVdOiBmYWxzZSB9KTtcbiAgICByZXR1cm4gZltmbmFtZV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWxheVJlbWluZGVyKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlSZW1pbmRlcjtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBwcm9maWxlc1tpbmRleF0ucmVsYXlSZW1pbmRlciA9IGZhbHNlO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXROcHViKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgcGF5bG9hZDogaW5kZXgsXG4gICAgfSk7XG59XG5cbi8vIC0tLSBNYXN0ZXIgcGFzc3dvcmQgZW5jcnlwdGlvbiBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIG1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGlzIGFjdGl2ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRW5jcnlwdGVkKCkge1xuICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgcmV0dXJuIGRhdGEuaXNFbmNyeXB0ZWQ7XG59XG5cbi8qKlxuICogU3RvcmUgdGhlIHBhc3N3b3JkIHZlcmlmaWNhdGlvbiBoYXNoIChuZXZlciB0aGUgcGFzc3dvcmQgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IHRoZSBzdG9yZWQgaGFzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbiAgICBpZiAoIWRhdGEucGFzc3dvcmRIYXNoIHx8ICFkYXRhLnBhc3N3b3JkU2FsdCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgZGF0YS5wYXNzd29yZEhhc2gsIGRhdGEucGFzc3dvcmRTYWx0KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgbWFzdGVyIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IGNsZWFycyBoYXNoIGFuZCBkZWNyeXB0cyBhbGwga2V5cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVBhc3N3b3JkUHJvdGVjdGlvbihwYXNzd29yZCkge1xuICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgY2hlY2tQYXNzd29yZChwYXNzd29yZCk7XG4gICAgaWYgKCF2YWxpZCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XG5cbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkge1xuICAgICAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGRlY3J5cHQocHJvZmlsZXNbaV0ucHJpdktleSwgcGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIGlzRW5jcnlwdGVkOiBmYWxzZSxcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBudWxsLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IG51bGwsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRW5jcnlwdCBhbGwgcHJvZmlsZSBwcml2YXRlIGtleXMgd2l0aCBhIG1hc3RlciBwYXNzd29yZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRBbGxLZXlzKHBhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG4vKipcbiAqIFJlLWVuY3J5cHQgYWxsIGtleXMgd2l0aCBhIG5ldyBwYXNzd29yZCAocmVxdWlyZXMgdGhlIG9sZCBwYXNzd29yZCkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZEZvcktleXMob2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGxldCBoZXggPSBwcm9maWxlc1tpXS5wcml2S2V5O1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKGhleCkpIHtcbiAgICAgICAgICAgIGhleCA9IGF3YWl0IGRlY3J5cHQoaGV4LCBvbGRQYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGVuY3J5cHQoaGV4LCBuZXdQYXNzd29yZCk7XG4gICAgfVxuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKG5ld1Bhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHByb2ZpbGVzLFxuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2gsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogc2FsdCxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIHNpbmdsZSBwcm9maWxlJ3MgcHJpdmF0ZSBrZXksIHJldHVybmluZyB0aGUgaGV4IHN0cmluZy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlY3J5cHRlZFByaXZLZXkocHJvZmlsZSwgcGFzc3dvcmQpIHtcbiAgICBpZiAocHJvZmlsZS50eXBlID09PSAnYnVua2VyJykgcmV0dXJuICcnO1xuICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZS5wcml2S2V5KSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdChwcm9maWxlLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2ZpbGUucHJpdktleTtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RvcmVkIHZhbHVlIGxvb2tzIGxpa2UgYW4gZW5jcnlwdGVkIGJsb2IuXG4gKiBFbmNyeXB0ZWQgYmxvYnMgYXJlIEpTT04gc3RyaW5ncyBjb250YWluaW5nIHtzYWx0LCBpdiwgY2lwaGVydGV4dH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VuY3J5cHRlZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocGFyc2VkLnNhbHQgJiYgcGFyc2VkLml2ICYmIHBhcnNlZC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBkZWxldGVEQiB9IGZyb20gJ2lkYic7XG5pbXBvcnQgeyBkb3dubG9hZEFsbENvbnRlbnRzLCBnZXRIb3N0cywgc29ydEJ5SW5kZXggfSBmcm9tICcuLi91dGlsaXRpZXMvZGInO1xuaW1wb3J0IHsgZ2V0UHJvZmlsZXMsIEtJTkRTIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3V0aWxzJztcbmltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgVE9NT1JST1cgPSBuZXcgRGF0ZSgpO1xuVE9NT1JST1cuc2V0RGF0ZShUT01PUlJPVy5nZXREYXRlKCkgKyAxKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZXZlbnRzOiBbXSxcbiAgICB2aWV3OiAnY3JlYXRlZF9hdCcsXG4gICAgbWF4OiAxMDAsXG4gICAgc29ydDogJ2FzYycsXG4gICAgYWxsSG9zdHM6IFtdLFxuICAgIGhvc3Q6ICcnLFxuICAgIGFsbFByb2ZpbGVzOiBbXSxcbiAgICBwcm9maWxlOiAnJyxcbiAgICBwdWJrZXk6ICcnLFxuICAgIHNlbGVjdGVkOiBudWxsLFxuICAgIGNvcGllZDogZmFsc2UsXG5cbiAgICAvLyBkYXRlIHZpZXdcbiAgICBmcm9tQ3JlYXRlZEF0OiAnMjAwOC0xMC0zMScsXG4gICAgdG9DcmVhdGVkQXQ6IFRPTU9SUk9XLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcblxuICAgIC8vIGtpbmQgdmlld1xuICAgIHF1aWNrS2luZDogJycsXG4gICAgZnJvbUtpbmQ6IDAsXG4gICAgdG9LaW5kOiA1MDAwMCxcbn07XG5cbmZ1bmN0aW9uICQoaWQpIHsgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTsgfVxuXG5mdW5jdGlvbiBnZXRGcm9tVGltZSgpIHtcbiAgICBjb25zdCBkdCA9IG5ldyBEYXRlKHN0YXRlLmZyb21DcmVhdGVkQXQpO1xuICAgIHJldHVybiBNYXRoLmZsb29yKGR0LmdldFRpbWUoKSAvIDEwMDApO1xufVxuXG5mdW5jdGlvbiBnZXRUb1RpbWUoKSB7XG4gICAgY29uc3QgZHQgPSBuZXcgRGF0ZShzdGF0ZS50b0NyZWF0ZWRBdCk7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoZHQuZ2V0VGltZSgpIC8gMTAwMCk7XG59XG5cbmZ1bmN0aW9uIGdldEtleVJhbmdlKCkge1xuICAgIHN3aXRjaCAoc3RhdGUudmlldykge1xuICAgICAgICBjYXNlICdjcmVhdGVkX2F0JzpcbiAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5ib3VuZChnZXRGcm9tVGltZSgpLCBnZXRUb1RpbWUoKSk7XG4gICAgICAgIGNhc2UgJ2tpbmQnOlxuICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmJvdW5kKHN0YXRlLmZyb21LaW5kLCBzdGF0ZS50b0tpbmQpO1xuICAgICAgICBjYXNlICdob3N0JzpcbiAgICAgICAgICAgIGlmIChzdGF0ZS5ob3N0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2Uub25seShzdGF0ZS5ob3N0KTtcbiAgICAgICAgY2FzZSAncHVia2V5JzpcbiAgICAgICAgICAgIGlmIChzdGF0ZS5wdWJrZXkubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5vbmx5KHN0YXRlLnB1YmtleSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUoZXBvY2hTZWNvbmRzKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGVwb2NoU2Vjb25kcyAqIDEwMDApLnRvVVRDU3RyaW5nKCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEtpbmQoa2luZCkge1xuICAgIGNvbnN0IGsgPSBLSU5EUy5maW5kKChba051bV0pID0+IGtOdW0gPT09IGtpbmQpO1xuICAgIHJldHVybiBrID8gYCR7a1sxXX0gKCR7a2luZH0pYCA6IGBVbmtub3duICgke2tpbmR9KWA7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LnRleHRDb250ZW50ID0gc3RyO1xuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xufVxuXG4vLyAtLS0gUmVuZGVyIC0tLVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gVmlldyBzZWxlY3RcbiAgICBjb25zdCB2aWV3U2VsZWN0ID0gJCgndmlldycpO1xuICAgIGNvbnN0IHNvcnRTZWxlY3QgPSAkKCdzb3J0Jyk7XG4gICAgY29uc3QgbWF4SW5wdXQgPSAkKCdtYXgnKTtcblxuICAgIGlmICh2aWV3U2VsZWN0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHZpZXdTZWxlY3QpIHZpZXdTZWxlY3QudmFsdWUgPSBzdGF0ZS52aWV3O1xuICAgIGlmIChzb3J0U2VsZWN0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHNvcnRTZWxlY3QpIHNvcnRTZWxlY3QudmFsdWUgPSBzdGF0ZS5zb3J0O1xuICAgIGlmIChtYXhJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBtYXhJbnB1dCkgbWF4SW5wdXQudmFsdWUgPSBzdGF0ZS5tYXg7XG5cbiAgICAvLyBTaG93L2hpZGUgZmlsdGVyIHNlY3Rpb25zXG4gICAgY29uc3QgZGF0ZUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maWx0ZXI9XCJjcmVhdGVkX2F0XCJdJyk7XG4gICAgY29uc3Qga2luZEZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maWx0ZXI9XCJraW5kXCJdJyk7XG4gICAgY29uc3QgaG9zdEZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maWx0ZXI9XCJob3N0XCJdJyk7XG4gICAgY29uc3QgcHVia2V5RmlsdGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZpbHRlcj1cInB1YmtleVwiXScpO1xuXG4gICAgZGF0ZUZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ2NyZWF0ZWRfYXQnID8gJycgOiAnbm9uZScpO1xuICAgIGtpbmRGaWx0ZXJzLmZvckVhY2goZWwgPT4gZWwuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnZpZXcgPT09ICdraW5kJyA/ICcnIDogJ25vbmUnKTtcbiAgICBob3N0RmlsdGVycy5mb3JFYWNoKGVsID0+IGVsLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS52aWV3ID09PSAnaG9zdCcgPyAnJyA6ICdub25lJyk7XG4gICAgcHVia2V5RmlsdGVycy5mb3JFYWNoKGVsID0+IGVsLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS52aWV3ID09PSAncHVia2V5JyA/ICcnIDogJ25vbmUnKTtcblxuICAgIC8vIERhdGUgaW5wdXRzXG4gICAgY29uc3QgZnJvbUNyZWF0ZWRBdCA9ICQoJ2Zyb21DcmVhdGVkQXQnKTtcbiAgICBjb25zdCB0b0NyZWF0ZWRBdCA9ICQoJ3RvQ3JlYXRlZEF0Jyk7XG4gICAgaWYgKGZyb21DcmVhdGVkQXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZnJvbUNyZWF0ZWRBdCkgZnJvbUNyZWF0ZWRBdC52YWx1ZSA9IHN0YXRlLmZyb21DcmVhdGVkQXQ7XG4gICAgaWYgKHRvQ3JlYXRlZEF0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRvQ3JlYXRlZEF0KSB0b0NyZWF0ZWRBdC52YWx1ZSA9IHN0YXRlLnRvQ3JlYXRlZEF0O1xuXG4gICAgLy8gS2luZCBpbnB1dHNcbiAgICBjb25zdCBmcm9tS2luZCA9ICQoJ2Zyb21LaW5kJyk7XG4gICAgY29uc3QgdG9LaW5kID0gJCgndG9LaW5kJyk7XG4gICAgaWYgKGZyb21LaW5kICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGZyb21LaW5kKSBmcm9tS2luZC52YWx1ZSA9IHN0YXRlLmZyb21LaW5kO1xuICAgIGlmICh0b0tpbmQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdG9LaW5kKSB0b0tpbmQudmFsdWUgPSBzdGF0ZS50b0tpbmQ7XG5cbiAgICAvLyBRdWljayBraW5kIHNlbGVjdFxuICAgIGNvbnN0IGtpbmRTaG9ydGN1dCA9ICQoJ2tpbmRTaG9ydGN1dCcpO1xuICAgIGlmIChraW5kU2hvcnRjdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0ga2luZFNob3J0Y3V0KSBraW5kU2hvcnRjdXQudmFsdWUgPSBzdGF0ZS5xdWlja0tpbmQ7XG5cbiAgICAvLyBIb3N0IHNlbGVjdFxuICAgIGNvbnN0IGhvc3RTZWxlY3QgPSAkKCdob3N0Jyk7XG4gICAgaWYgKGhvc3RTZWxlY3QpIHtcbiAgICAgICAgaG9zdFNlbGVjdC5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPjwvb3B0aW9uPicgK1xuICAgICAgICAgICAgc3RhdGUuYWxsSG9zdHMubWFwKGggPT4gYDxvcHRpb24gdmFsdWU9XCIke2VzY2FwZUh0bWwoaCl9XCIgJHtzdGF0ZS5ob3N0ID09PSBoID8gJ3NlbGVjdGVkJyA6ICcnfT4ke2VzY2FwZUh0bWwoaCl9PC9vcHRpb24+YCkuam9pbignJyk7XG4gICAgfVxuXG4gICAgLy8gUHJvZmlsZXMgc2VsZWN0XG4gICAgY29uc3QgcHJvZmlsZVNlbGVjdCA9ICQoJ3Byb2ZpbGVzJyk7XG4gICAgaWYgKHByb2ZpbGVTZWxlY3QpIHtcbiAgICAgICAgY29uc3QgcHJvZmlsZU5hbWVzID0gc3RhdGUuYWxsUHJvZmlsZXMubWFwKHAgPT4gcC5uYW1lKTtcbiAgICAgICAgcHJvZmlsZVNlbGVjdC5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPjwvb3B0aW9uPicgK1xuICAgICAgICAgICAgcHJvZmlsZU5hbWVzLm1hcChwID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NhcGVIdG1sKHApfVwiICR7c3RhdGUucHJvZmlsZSA9PT0gcCA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NhcGVIdG1sKHApfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8vIFB1YmtleSBpbnB1dFxuICAgIGNvbnN0IHB1YmtleUlucHV0ID0gJCgncHVia2V5Jyk7XG4gICAgaWYgKHB1YmtleUlucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHB1YmtleUlucHV0KSBwdWJrZXlJbnB1dC52YWx1ZSA9IHN0YXRlLnB1YmtleTtcblxuICAgIC8vIEV2ZW50IGxpc3RcbiAgICBjb25zdCBldmVudExpc3QgPSAkKCdldmVudC1saXN0Jyk7XG4gICAgaWYgKGV2ZW50TGlzdCkge1xuICAgICAgICBldmVudExpc3QuaW5uZXJIVE1MID0gc3RhdGUuZXZlbnRzLm1hcCgoZXZlbnQsIGluZGV4KSA9PiBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtMyBib3JkZXItc29saWQgYm9yZGVyIGJvcmRlci1tb25va2FpLWJnLWxpZ2h0ZXIgcm91bmRlZC1sZ1wiPlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJzZWxlY3Qtbm9uZSBmbGV4IGN1cnNvci1wb2ludGVyIHRleHQtc20gbWQ6dGV4dC14bFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPVwidG9nZ2xlLWV2ZW50XCJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LW5vbmUgdy0xNCBwLTQgZm9udC1leHRyYWJvbGRcIj4ke3N0YXRlLnNlbGVjdGVkID09PSBpbmRleCA/ICctJyA6ICcrJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChmb3JtYXREYXRlKGV2ZW50Lm1ldGFkYXRhLnNpZ25lZF9hdCkpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleC0xIHctNjQgcC00XCI+JHtlc2NhcGVIdG1sKGV2ZW50Lm1ldGFkYXRhLmhvc3QpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleC0xIHctNjQgcC00XCI+JHtlc2NhcGVIdG1sKGZvcm1hdEtpbmQoZXZlbnQuZXZlbnQua2luZCkpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1hY3Rpb249XCJjb3B5LWV2ZW50XCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCIgY2xhc3M9XCJjdXJzb3ItcG9pbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICA8cHJlXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtYi1sZyBiZy1tb25va2FpLWJnLWxpZ2h0ZXIgdGV4dC1zbSBtZDp0ZXh0LWJhc2UgcC00IG92ZXJmbG93LXgtYXV0b1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cImRpc3BsYXk6JHtzdGF0ZS5zZWxlY3RlZCA9PT0gaW5kZXggPyAnYmxvY2snIDogJ25vbmUnfTtcIlxuICAgICAgICAgICAgICAgICAgICA+JHtlc2NhcGVIdG1sKEpTT04uc3RyaW5naWZ5KGV2ZW50LCBudWxsLCAyKSl9PC9wcmU+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYCkuam9pbignJyk7XG5cbiAgICAgICAgLy8gQmluZCBldmVudCB0b2dnbGVcbiAgICAgICAgZXZlbnRMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS1ldmVudFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gcGFyc2VJbnQoZWwuZGF0YXNldC5pbmRleCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWQgPSBzdGF0ZS5zZWxlY3RlZCA9PT0gaWR4ID8gbnVsbCA6IGlkeDtcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCaW5kIGNvcHkgZXZlbnRcbiAgICAgICAgZXZlbnRMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNvcHktZXZlbnRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGVsLmRhdGFzZXQuaW5kZXgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGNvcHlFdmVudChpZHgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvcGllZCB0b2FzdFxuICAgIGNvbnN0IGNvcGllZFRvYXN0ID0gJCgnY29waWVkLXRvYXN0Jyk7XG4gICAgaWYgKGNvcGllZFRvYXN0KSBjb3BpZWRUb2FzdC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUuY29waWVkID8gJ2Jsb2NrJyA6ICdub25lJztcbn1cblxuLy8gLS0tIEFjdGlvbnMgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZCgpIHtcbiAgICBjb25zdCBldmVudHMgPSBhd2FpdCBzb3J0QnlJbmRleChcbiAgICAgICAgc3RhdGUudmlldyxcbiAgICAgICAgZ2V0S2V5UmFuZ2UoKSxcbiAgICAgICAgc3RhdGUuc29ydCA9PT0gJ2FzYycsXG4gICAgICAgIHN0YXRlLm1heCxcbiAgICApO1xuICAgIHN0YXRlLmV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiAoeyAuLi5lLCBjb3BpZWQ6IGZhbHNlIH0pKTtcblxuICAgIGdldEhvc3RzKCkudGhlbihob3N0cyA9PiB7IHN0YXRlLmFsbEhvc3RzID0gaG9zdHM7IHJlbmRlcigpOyB9KTtcblxuICAgIGNvbnN0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBzdGF0ZS5hbGxQcm9maWxlcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBwcm9maWxlcy5tYXAoYXN5bmMgKHByb2ZpbGUsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgbmFtZTogcHJvZmlsZS5uYW1lLFxuICAgICAgICAgICAgcHVia2V5OiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IGluZGV4LFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pKSxcbiAgICApO1xuXG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVBbGwoKSB7XG4gICAgY29uc3QgZmlsZSA9IGF3YWl0IGRvd25sb2FkQWxsQ29udGVudHMoKTtcbiAgICBhcGkudGFicy5jcmVhdGUoe1xuICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSksXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVsZXRlQWxsKCkge1xuICAgIGlmIChjb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIEFMTCBldmVudHM/JykpIHtcbiAgICAgICAgYXdhaXQgZGVsZXRlREIoJ2V2ZW50cycpO1xuICAgICAgICBhd2FpdCByZWxvYWQoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHF1aWNrS2luZFNlbGVjdCgpIHtcbiAgICBpZiAoc3RhdGUucXVpY2tLaW5kID09PSAnJykgcmV0dXJuO1xuICAgIGNvbnN0IGkgPSBwYXJzZUludChzdGF0ZS5xdWlja0tpbmQpO1xuICAgIHN0YXRlLmZyb21LaW5kID0gaTtcbiAgICBzdGF0ZS50b0tpbmQgPSBpO1xuICAgIHJlbG9hZCgpO1xufVxuXG5mdW5jdGlvbiBwa0Zyb21Qcm9maWxlKCkge1xuICAgIGNvbnN0IGZvdW5kID0gc3RhdGUuYWxsUHJvZmlsZXMuZmluZCgoeyBuYW1lIH0pID0+IG5hbWUgPT09IHN0YXRlLnByb2ZpbGUpO1xuICAgIGlmIChmb3VuZCkge1xuICAgICAgICBzdGF0ZS5wdWJrZXkgPSBmb3VuZC5wdWJrZXk7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUV2ZW50KGluZGV4KSB7XG4gICAgY29uc3QgZXZlbnQgPSBKU09OLnN0cmluZ2lmeShzdGF0ZS5ldmVudHNbaW5kZXhdKTtcbiAgICBzdGF0ZS5jb3BpZWQgPSB0cnVlO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5jb3BpZWQgPSBmYWxzZTsgcmVuZGVyKCk7IH0sIDEwMDApO1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGV2ZW50KTtcbn1cblxuLy8gLS0tIEV2ZW50IGJpbmRpbmcgLS0tXG5cbmxldCBtYXhEZWJvdW5jZVRpbWVyID0gbnVsbDtcbmxldCBwdWJrZXlEZWJvdW5jZVRpbWVyID0gbnVsbDtcblxuZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcbiAgICAkKCd2aWV3Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnZpZXcgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdzb3J0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnNvcnQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdtYXgnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5tYXggPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSkgfHwgMTAwO1xuICAgICAgICBjbGVhclRpbWVvdXQobWF4RGVib3VuY2VUaW1lcik7XG4gICAgICAgIG1heERlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHJlbG9hZCgpLCA3NTApO1xuICAgIH0pO1xuXG4gICAgJCgnZnJvbUNyZWF0ZWRBdCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5mcm9tQ3JlYXRlZEF0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgndG9DcmVhdGVkQXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUudG9DcmVhdGVkQXQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdraW5kU2hvcnRjdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUucXVpY2tLaW5kID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHF1aWNrS2luZFNlbGVjdCgpO1xuICAgIH0pO1xuXG4gICAgJCgnZnJvbUtpbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZnJvbUtpbmQgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSkgfHwgMDtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCd0b0tpbmQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUudG9LaW5kID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDUwMDAwO1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9KTtcblxuICAgICQoJ2hvc3QnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuaG9zdCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9KTtcblxuICAgICQoJ3Byb2ZpbGVzJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnByb2ZpbGUgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcGtGcm9tUHJvZmlsZSgpO1xuICAgIH0pO1xuXG4gICAgJCgncHVia2V5Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUucHVia2V5ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIGNsZWFyVGltZW91dChwdWJrZXlEZWJvdW5jZVRpbWVyKTtcbiAgICAgICAgcHVia2V5RGVib3VuY2VUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gcmVsb2FkKCksIDUwMCk7XG4gICAgfSk7XG5cbiAgICAkKCdzYXZlLWFsbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzYXZlQWxsKTtcbiAgICAkKCdkZWxldGUtYWxsLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZUFsbCk7XG4gICAgJCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gd2luZG93LmNsb3NlKCkpO1xufVxuXG4vLyAtLS0gSW5pdCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBQb3B1bGF0ZSB0aGUga2luZCBzaG9ydGN1dCBzZWxlY3RcbiAgICBjb25zdCBraW5kU2hvcnRjdXQgPSAkKCdraW5kU2hvcnRjdXQnKTtcbiAgICBpZiAoa2luZFNob3J0Y3V0KSB7XG4gICAgICAgIGtpbmRTaG9ydGN1dC5pbm5lckhUTUwgPSAnPG9wdGlvbj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIEtJTkRTLm1hcCgoW2tpbmQsIGRlc2NdKSA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7a2luZH1cIj4ke2VzY2FwZUh0bWwoZGVzYyl9PC9vcHRpb24+YCkuam9pbignJyk7XG4gICAgfVxuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIGF3YWl0IHJlbG9hZCgpO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUFBLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxpQkFBaUIsYUFBYSxLQUFLLENBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUU1RixNQUFJO0FBQ0osTUFBSTtBQUVKLFdBQVMsdUJBQXVCO0FBQzVCLFdBQVEsc0JBQ0gsb0JBQW9CO0FBQUEsTUFDakI7QUFB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
