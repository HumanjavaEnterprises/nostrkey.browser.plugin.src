(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod2) => function __require() {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
    mod2
  ));

  // src/shims/process.js
  var process;
  var init_process = __esm({
    "src/shims/process.js"() {
      process = {
        env: { NODE_ENV: "production", LOG_LEVEL: "warn" },
        browser: true,
        version: "",
        stdout: null,
        stderr: null,
        nextTick: function(fn) {
          var args = Array.prototype.slice.call(arguments, 1);
          Promise.resolve().then(function() {
            fn.apply(null, args);
          });
        }
      };
    }
  });

  // node_modules/quick-format-unescaped/index.js
  var require_quick_format_unescaped = __commonJS({
    "node_modules/quick-format-unescaped/index.js"(exports, module) {
      "use strict";
      init_process();
      function tryStringify(o) {
        try {
          return JSON.stringify(o);
        } catch (e) {
          return '"[Circular]"';
        }
      }
      module.exports = format;
      function format(f, args, opts) {
        var ss = opts && opts.stringify || tryStringify;
        var offset = 1;
        if (typeof f === "object" && f !== null) {
          var len = args.length + offset;
          if (len === 1) return f;
          var objects = new Array(len);
          objects[0] = ss(f);
          for (var index = 1; index < len; index++) {
            objects[index] = ss(args[index]);
          }
          return objects.join(" ");
        }
        if (typeof f !== "string") {
          return f;
        }
        var argLen = args.length;
        if (argLen === 0) return f;
        var str = "";
        var a = 1 - offset;
        var lastPos = -1;
        var flen = f && f.length || 0;
        for (var i = 0; i < flen; ) {
          if (f.charCodeAt(i) === 37 && i + 1 < flen) {
            lastPos = lastPos > -1 ? lastPos : 0;
            switch (f.charCodeAt(i + 1)) {
              case 100:
              // 'd'
              case 102:
                if (a >= argLen)
                  break;
                if (args[a] == null) break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += Number(args[a]);
                lastPos = i + 2;
                i++;
                break;
              case 105:
                if (a >= argLen)
                  break;
                if (args[a] == null) break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += Math.floor(Number(args[a]));
                lastPos = i + 2;
                i++;
                break;
              case 79:
              // 'O'
              case 111:
              // 'o'
              case 106:
                if (a >= argLen)
                  break;
                if (args[a] === void 0) break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                var type = typeof args[a];
                if (type === "string") {
                  str += "'" + args[a] + "'";
                  lastPos = i + 2;
                  i++;
                  break;
                }
                if (type === "function") {
                  str += args[a].name || "<anonymous>";
                  lastPos = i + 2;
                  i++;
                  break;
                }
                str += ss(args[a]);
                lastPos = i + 2;
                i++;
                break;
              case 115:
                if (a >= argLen)
                  break;
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += String(args[a]);
                lastPos = i + 2;
                i++;
                break;
              case 37:
                if (lastPos < i)
                  str += f.slice(lastPos, i);
                str += "%";
                lastPos = i + 2;
                i++;
                a--;
                break;
            }
            ++a;
          }
          ++i;
        }
        if (lastPos === -1)
          return f;
        else if (lastPos < flen) {
          str += f.slice(lastPos);
        }
        return str;
      }
    }
  });

  // node_modules/pino/browser.js
  var require_browser = __commonJS({
    "node_modules/pino/browser.js"(exports, module) {
      "use strict";
      init_process();
      var format = require_quick_format_unescaped();
      module.exports = pino2;
      var _console = pfGlobalThisOrFallback().console || {};
      var stdSerializers = {
        mapHttpRequest: mock,
        mapHttpResponse: mock,
        wrapRequestSerializer: passthrough,
        wrapResponseSerializer: passthrough,
        wrapErrorSerializer: passthrough,
        req: mock,
        res: mock,
        err: asErrValue,
        errWithCause: asErrValue
      };
      function levelToValue(level, logger2) {
        return level === "silent" ? Infinity : logger2.levels.values[level];
      }
      var baseLogFunctionSymbol = /* @__PURE__ */ Symbol("pino.logFuncs");
      var hierarchySymbol = /* @__PURE__ */ Symbol("pino.hierarchy");
      var logFallbackMap = {
        error: "log",
        fatal: "error",
        warn: "error",
        info: "log",
        debug: "log",
        trace: "log"
      };
      function appendChildLogger(parentLogger, childLogger) {
        const newEntry = {
          logger: childLogger,
          parent: parentLogger[hierarchySymbol]
        };
        childLogger[hierarchySymbol] = newEntry;
      }
      function setupBaseLogFunctions(logger2, levels, proto) {
        const logFunctions = {};
        levels.forEach((level) => {
          logFunctions[level] = proto[level] ? proto[level] : _console[level] || _console[logFallbackMap[level] || "log"] || noop;
        });
        logger2[baseLogFunctionSymbol] = logFunctions;
      }
      function shouldSerialize(serialize, serializers) {
        if (Array.isArray(serialize)) {
          const hasToFilter = serialize.filter(function(k) {
            return k !== "!stdSerializers.err";
          });
          return hasToFilter;
        } else if (serialize === true) {
          return Object.keys(serializers);
        }
        return false;
      }
      function pino2(opts) {
        opts = opts || {};
        opts.browser = opts.browser || {};
        const transmit2 = opts.browser.transmit;
        if (transmit2 && typeof transmit2.send !== "function") {
          throw Error("pino: transmit option must have a send function");
        }
        const proto = opts.browser.write || _console;
        if (opts.browser.write) opts.browser.asObject = true;
        const serializers = opts.serializers || {};
        const serialize = shouldSerialize(opts.browser.serialize, serializers);
        let stdErrSerialize = opts.browser.serialize;
        if (Array.isArray(opts.browser.serialize) && opts.browser.serialize.indexOf("!stdSerializers.err") > -1) stdErrSerialize = false;
        const customLevels = Object.keys(opts.customLevels || {});
        const levels = ["error", "fatal", "warn", "info", "debug", "trace"].concat(customLevels);
        if (typeof proto === "function") {
          levels.forEach(function(level2) {
            proto[level2] = proto;
          });
        }
        if (opts.enabled === false || opts.browser.disabled) opts.level = "silent";
        const level = opts.level || "info";
        const logger2 = Object.create(proto);
        if (!logger2.log) logger2.log = noop;
        setupBaseLogFunctions(logger2, levels, proto);
        appendChildLogger({}, logger2);
        Object.defineProperty(logger2, "levelVal", {
          get: getLevelVal
        });
        Object.defineProperty(logger2, "level", {
          get: getLevel,
          set: setLevel
        });
        const setOpts = {
          transmit: transmit2,
          serialize,
          asObject: opts.browser.asObject,
          asObjectBindingsOnly: opts.browser.asObjectBindingsOnly,
          formatters: opts.browser.formatters,
          reportCaller: opts.browser.reportCaller,
          levels,
          timestamp: getTimeFunction(opts),
          messageKey: opts.messageKey || "msg",
          onChild: opts.onChild || noop
        };
        logger2.levels = getLevels(opts);
        logger2.level = level;
        logger2.isLevelEnabled = function(level2) {
          if (!this.levels.values[level2]) {
            return false;
          }
          return this.levels.values[level2] >= this.levels.values[this.level];
        };
        logger2.setMaxListeners = logger2.getMaxListeners = logger2.emit = logger2.addListener = logger2.on = logger2.prependListener = logger2.once = logger2.prependOnceListener = logger2.removeListener = logger2.removeAllListeners = logger2.listeners = logger2.listenerCount = logger2.eventNames = logger2.write = logger2.flush = noop;
        logger2.serializers = serializers;
        logger2._serialize = serialize;
        logger2._stdErrSerialize = stdErrSerialize;
        logger2.child = function(...args) {
          return child.call(this, setOpts, ...args);
        };
        if (transmit2) logger2._logEvent = createLogEventShape();
        function getLevelVal() {
          return levelToValue(this.level, this);
        }
        function getLevel() {
          return this._level;
        }
        function setLevel(level2) {
          if (level2 !== "silent" && !this.levels.values[level2]) {
            throw Error("unknown level " + level2);
          }
          this._level = level2;
          set(this, setOpts, logger2, "error");
          set(this, setOpts, logger2, "fatal");
          set(this, setOpts, logger2, "warn");
          set(this, setOpts, logger2, "info");
          set(this, setOpts, logger2, "debug");
          set(this, setOpts, logger2, "trace");
          customLevels.forEach((level3) => {
            set(this, setOpts, logger2, level3);
          });
        }
        function child(setOpts2, bindings, childOptions) {
          if (!bindings) {
            throw new Error("missing bindings for child Pino");
          }
          childOptions = childOptions || {};
          if (serialize && bindings.serializers) {
            childOptions.serializers = bindings.serializers;
          }
          const childOptionsSerializers = childOptions.serializers;
          if (serialize && childOptionsSerializers) {
            var childSerializers = Object.assign({}, serializers, childOptionsSerializers);
            var childSerialize = opts.browser.serialize === true ? Object.keys(childSerializers) : serialize;
            delete bindings.serializers;
            applySerializers([bindings], childSerialize, childSerializers, this._stdErrSerialize);
          }
          function Child(parent) {
            this._childLevel = (parent._childLevel | 0) + 1;
            this.bindings = bindings;
            if (childSerializers) {
              this.serializers = childSerializers;
              this._serialize = childSerialize;
            }
            if (transmit2) {
              this._logEvent = createLogEventShape(
                [].concat(parent._logEvent.bindings, bindings)
              );
            }
          }
          Child.prototype = this;
          const newLogger = new Child(this);
          appendChildLogger(this, newLogger);
          newLogger.child = function(...args) {
            return child.call(this, setOpts2, ...args);
          };
          newLogger.level = childOptions.level || this.level;
          setOpts2.onChild(newLogger);
          return newLogger;
        }
        return logger2;
      }
      function getLevels(opts) {
        const customLevels = opts.customLevels || {};
        const values = Object.assign({}, pino2.levels.values, customLevels);
        const labels = Object.assign({}, pino2.levels.labels, invertObject(customLevels));
        return {
          values,
          labels
        };
      }
      function invertObject(obj) {
        const inverted = {};
        Object.keys(obj).forEach(function(key) {
          inverted[obj[key]] = key;
        });
        return inverted;
      }
      pino2.levels = {
        values: {
          fatal: 60,
          error: 50,
          warn: 40,
          info: 30,
          debug: 20,
          trace: 10
        },
        labels: {
          10: "trace",
          20: "debug",
          30: "info",
          40: "warn",
          50: "error",
          60: "fatal"
        }
      };
      pino2.stdSerializers = stdSerializers;
      pino2.stdTimeFunctions = Object.assign({}, { nullTime, epochTime, unixTime, isoTime });
      function getBindingChain(logger2) {
        const bindings = [];
        if (logger2.bindings) {
          bindings.push(logger2.bindings);
        }
        let hierarchy = logger2[hierarchySymbol];
        while (hierarchy.parent) {
          hierarchy = hierarchy.parent;
          if (hierarchy.logger.bindings) {
            bindings.push(hierarchy.logger.bindings);
          }
        }
        return bindings.reverse();
      }
      function set(self2, opts, rootLogger, level) {
        Object.defineProperty(self2, level, {
          value: levelToValue(self2.level, rootLogger) > levelToValue(level, rootLogger) ? noop : rootLogger[baseLogFunctionSymbol][level],
          writable: true,
          enumerable: true,
          configurable: true
        });
        if (self2[level] === noop) {
          if (!opts.transmit) return;
          const transmitLevel = opts.transmit.level || self2.level;
          const transmitValue = levelToValue(transmitLevel, rootLogger);
          const methodValue = levelToValue(level, rootLogger);
          if (methodValue < transmitValue) return;
        }
        self2[level] = createWrap(self2, opts, rootLogger, level);
        const bindings = getBindingChain(self2);
        if (bindings.length === 0) {
          return;
        }
        self2[level] = prependBindingsInArguments(bindings, self2[level]);
      }
      function prependBindingsInArguments(bindings, logFunc) {
        return function() {
          return logFunc.apply(this, [...bindings, ...arguments]);
        };
      }
      function createWrap(self2, opts, rootLogger, level) {
        return /* @__PURE__ */ (function(write) {
          return function LOG() {
            const ts = opts.timestamp();
            const args = new Array(arguments.length);
            const proto = Object.getPrototypeOf && Object.getPrototypeOf(this) === _console ? _console : this;
            for (var i = 0; i < args.length; i++) args[i] = arguments[i];
            var argsIsSerialized = false;
            if (opts.serialize) {
              applySerializers(args, this._serialize, this.serializers, this._stdErrSerialize);
              argsIsSerialized = true;
            }
            if (opts.asObject || opts.formatters) {
              const out = asObject(this, level, args, ts, opts);
              if (opts.reportCaller && out && out.length > 0 && out[0] && typeof out[0] === "object") {
                try {
                  const caller = getCallerLocation();
                  if (caller) out[0].caller = caller;
                } catch (e) {
                }
              }
              write.call(proto, ...out);
            } else {
              if (opts.reportCaller) {
                try {
                  const caller = getCallerLocation();
                  if (caller) args.push(caller);
                } catch (e) {
                }
              }
              write.apply(proto, args);
            }
            if (opts.transmit) {
              const transmitLevel = opts.transmit.level || self2._level;
              const transmitValue = levelToValue(transmitLevel, rootLogger);
              const methodValue = levelToValue(level, rootLogger);
              if (methodValue < transmitValue) return;
              transmit(this, {
                ts,
                methodLevel: level,
                methodValue,
                transmitLevel,
                transmitValue: rootLogger.levels.values[opts.transmit.level || self2._level],
                send: opts.transmit.send,
                val: levelToValue(self2._level, rootLogger)
              }, args, argsIsSerialized);
            }
          };
        })(self2[baseLogFunctionSymbol][level]);
      }
      function asObject(logger2, level, args, ts, opts) {
        const {
          level: levelFormatter,
          log: logObjectFormatter = (obj) => obj
        } = opts.formatters || {};
        const argsCloned = args.slice();
        let msg = argsCloned[0];
        const logObject = {};
        let lvl = (logger2._childLevel | 0) + 1;
        if (lvl < 1) lvl = 1;
        if (ts) {
          logObject.time = ts;
        }
        if (levelFormatter) {
          const formattedLevel = levelFormatter(level, logger2.levels.values[level]);
          Object.assign(logObject, formattedLevel);
        } else {
          logObject.level = logger2.levels.values[level];
        }
        if (opts.asObjectBindingsOnly) {
          if (msg !== null && typeof msg === "object") {
            while (lvl-- && typeof argsCloned[0] === "object") {
              Object.assign(logObject, argsCloned.shift());
            }
          }
          const formattedLogObject = logObjectFormatter(logObject);
          return [formattedLogObject, ...argsCloned];
        } else {
          if (msg !== null && typeof msg === "object") {
            while (lvl-- && typeof argsCloned[0] === "object") {
              Object.assign(logObject, argsCloned.shift());
            }
            msg = argsCloned.length ? format(argsCloned.shift(), argsCloned) : void 0;
          } else if (typeof msg === "string") msg = format(argsCloned.shift(), argsCloned);
          if (msg !== void 0) logObject[opts.messageKey] = msg;
          const formattedLogObject = logObjectFormatter(logObject);
          return [formattedLogObject];
        }
      }
      function applySerializers(args, serialize, serializers, stdErrSerialize) {
        for (const i in args) {
          if (stdErrSerialize && args[i] instanceof Error) {
            args[i] = pino2.stdSerializers.err(args[i]);
          } else if (typeof args[i] === "object" && !Array.isArray(args[i]) && serialize) {
            for (const k in args[i]) {
              if (serialize.indexOf(k) > -1 && k in serializers) {
                args[i][k] = serializers[k](args[i][k]);
              }
            }
          }
        }
      }
      function transmit(logger2, opts, args, argsIsSerialized = false) {
        const send = opts.send;
        const ts = opts.ts;
        const methodLevel = opts.methodLevel;
        const methodValue = opts.methodValue;
        const val = opts.val;
        const bindings = logger2._logEvent.bindings;
        if (!argsIsSerialized) {
          applySerializers(
            args,
            logger2._serialize || Object.keys(logger2.serializers),
            logger2.serializers,
            logger2._stdErrSerialize === void 0 ? true : logger2._stdErrSerialize
          );
        }
        logger2._logEvent.ts = ts;
        logger2._logEvent.messages = args.filter(function(arg) {
          return bindings.indexOf(arg) === -1;
        });
        logger2._logEvent.level.label = methodLevel;
        logger2._logEvent.level.value = methodValue;
        send(methodLevel, logger2._logEvent, val);
        logger2._logEvent = createLogEventShape(bindings);
      }
      function createLogEventShape(bindings) {
        return {
          ts: 0,
          messages: [],
          bindings: bindings || [],
          level: { label: "", value: 0 }
        };
      }
      function asErrValue(err) {
        const obj = {
          type: err.constructor.name,
          msg: err.message,
          stack: err.stack
        };
        for (const key in err) {
          if (obj[key] === void 0) {
            obj[key] = err[key];
          }
        }
        return obj;
      }
      function getTimeFunction(opts) {
        if (typeof opts.timestamp === "function") {
          return opts.timestamp;
        }
        if (opts.timestamp === false) {
          return nullTime;
        }
        return epochTime;
      }
      function mock() {
        return {};
      }
      function passthrough(a) {
        return a;
      }
      function noop() {
      }
      function nullTime() {
        return false;
      }
      function epochTime() {
        return Date.now();
      }
      function unixTime() {
        return Math.round(Date.now() / 1e3);
      }
      function isoTime() {
        return new Date(Date.now()).toISOString();
      }
      function pfGlobalThisOrFallback() {
        function defd(o) {
          return typeof o !== "undefined" && o;
        }
        try {
          if (typeof globalThis !== "undefined") return globalThis;
          Object.defineProperty(Object.prototype, "globalThis", {
            get: function() {
              delete Object.prototype.globalThis;
              return this.globalThis = this;
            },
            configurable: true
          });
          return globalThis;
        } catch (e) {
          return defd(self) || defd(window) || defd(this) || {};
        }
      }
      module.exports.default = pino2;
      module.exports.pino = pino2;
      function getCallerLocation() {
        const stack = new Error().stack;
        if (!stack) return null;
        const lines = stack.split("\n");
        for (let i = 1; i < lines.length; i++) {
          const l = lines[i].trim();
          if (/(^at\s+)?(createWrap|LOG|set\s*\(|asObject|Object\.apply|Function\.apply)/.test(l)) continue;
          if (l.indexOf("browser.js") !== -1) continue;
          if (l.indexOf("node:internal") !== -1) continue;
          if (l.indexOf("node_modules") !== -1) continue;
          let m = l.match(/\((.*?):(\d+):(\d+)\)/);
          if (!m) m = l.match(/at\s+(.*?):(\d+):(\d+)/);
          if (m) {
            const file = m[1];
            const line = m[2];
            const col = m[3];
            return file + ":" + line + ":" + col;
          }
        }
        return null;
      }
    }
  });

  // node-stub:crypto
  var require_crypto = __commonJS({
    "node-stub:crypto"(exports, module) {
      init_process();
      module.exports = {};
    }
  });

  // node_modules/bech32/dist/index.js
  var require_dist = __commonJS({
    "node_modules/bech32/dist/index.js"(exports) {
      "use strict";
      init_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.bech32m = exports.bech32 = void 0;
      var ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
      var ALPHABET_MAP = {};
      for (let z = 0; z < ALPHABET.length; z++) {
        const x = ALPHABET.charAt(z);
        ALPHABET_MAP[x] = z;
      }
      function polymodStep(pre) {
        const b = pre >> 25;
        return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
      }
      function prefixChk(prefix) {
        let chk = 1;
        for (let i = 0; i < prefix.length; ++i) {
          const c = prefix.charCodeAt(i);
          if (c < 33 || c > 126)
            return "Invalid prefix (" + prefix + ")";
          chk = polymodStep(chk) ^ c >> 5;
        }
        chk = polymodStep(chk);
        for (let i = 0; i < prefix.length; ++i) {
          const v = prefix.charCodeAt(i);
          chk = polymodStep(chk) ^ v & 31;
        }
        return chk;
      }
      function convert(data, inBits, outBits, pad) {
        let value = 0;
        let bits = 0;
        const maxV = (1 << outBits) - 1;
        const result = [];
        for (let i = 0; i < data.length; ++i) {
          value = value << inBits | data[i];
          bits += inBits;
          while (bits >= outBits) {
            bits -= outBits;
            result.push(value >> bits & maxV);
          }
        }
        if (pad) {
          if (bits > 0) {
            result.push(value << outBits - bits & maxV);
          }
        } else {
          if (bits >= inBits)
            return "Excess padding";
          if (value << outBits - bits & maxV)
            return "Non-zero padding";
        }
        return result;
      }
      function toWords(bytes) {
        return convert(bytes, 8, 5, true);
      }
      function fromWordsUnsafe(words) {
        const res = convert(words, 5, 8, false);
        if (Array.isArray(res))
          return res;
      }
      function fromWords(words) {
        const res = convert(words, 5, 8, false);
        if (Array.isArray(res))
          return res;
        throw new Error(res);
      }
      function getLibraryFromEncoding(encoding) {
        let ENCODING_CONST;
        if (encoding === "bech32") {
          ENCODING_CONST = 1;
        } else {
          ENCODING_CONST = 734539939;
        }
        function encode(prefix, words, LIMIT) {
          LIMIT = LIMIT || 90;
          if (prefix.length + 7 + words.length > LIMIT)
            throw new TypeError("Exceeds length limit");
          prefix = prefix.toLowerCase();
          let chk = prefixChk(prefix);
          if (typeof chk === "string")
            throw new Error(chk);
          let result = prefix + "1";
          for (let i = 0; i < words.length; ++i) {
            const x = words[i];
            if (x >> 5 !== 0)
              throw new Error("Non 5-bit word");
            chk = polymodStep(chk) ^ x;
            result += ALPHABET.charAt(x);
          }
          for (let i = 0; i < 6; ++i) {
            chk = polymodStep(chk);
          }
          chk ^= ENCODING_CONST;
          for (let i = 0; i < 6; ++i) {
            const v = chk >> (5 - i) * 5 & 31;
            result += ALPHABET.charAt(v);
          }
          return result;
        }
        function __decode(str, LIMIT) {
          LIMIT = LIMIT || 90;
          if (str.length < 8)
            return str + " too short";
          if (str.length > LIMIT)
            return "Exceeds length limit";
          const lowered = str.toLowerCase();
          const uppered = str.toUpperCase();
          if (str !== lowered && str !== uppered)
            return "Mixed-case string " + str;
          str = lowered;
          const split = str.lastIndexOf("1");
          if (split === -1)
            return "No separator character for " + str;
          if (split === 0)
            return "Missing prefix for " + str;
          const prefix = str.slice(0, split);
          const wordChars = str.slice(split + 1);
          if (wordChars.length < 6)
            return "Data too short";
          let chk = prefixChk(prefix);
          if (typeof chk === "string")
            return chk;
          const words = [];
          for (let i = 0; i < wordChars.length; ++i) {
            const c = wordChars.charAt(i);
            const v = ALPHABET_MAP[c];
            if (v === void 0)
              return "Unknown character " + c;
            chk = polymodStep(chk) ^ v;
            if (i + 6 >= wordChars.length)
              continue;
            words.push(v);
          }
          if (chk !== ENCODING_CONST)
            return "Invalid checksum for " + str;
          return { prefix, words };
        }
        function decodeUnsafe(str, LIMIT) {
          const res = __decode(str, LIMIT);
          if (typeof res === "object")
            return res;
        }
        function decode(str, LIMIT) {
          const res = __decode(str, LIMIT);
          if (typeof res === "object")
            return res;
          throw new Error(res);
        }
        return {
          decodeUnsafe,
          decode,
          encode,
          toWords,
          fromWordsUnsafe,
          fromWords
        };
      }
      exports.bech32 = getLibraryFromEncoding("bech32");
      exports.bech32m = getLibraryFromEncoding("bech32m");
    }
  });

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      init_process();
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num2) {
        return lookup[num2 >> 18 & 63] + lookup[num2 >> 12 & 63] + lookup[num2 >> 6 & 63] + lookup[num2 & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      init_process();
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      init_process();
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer3;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer3.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer3.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer3.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer3.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer3.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer3.alloc(+length);
      }
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
        if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer3.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer3.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes2(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes2(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes2(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer3.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
      Buffer3.prototype.equals = function equals(b) {
        if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
      }
      Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer3.from(target, target.offset, target.byteLength);
        }
        if (!Buffer3.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer3.from(val, encoding);
        }
        if (Buffer3.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes2(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes2(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes2(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer3.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer3.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes2(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes2(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes2(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
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

  // src/profiles/profiles.js
  init_process();

  // src/utilities/utils.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/index.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/types/index.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/types/base.js
  init_process();
  var NostrEventKind;
  (function(NostrEventKind3) {
    NostrEventKind3[NostrEventKind3["SET_METADATA"] = 0] = "SET_METADATA";
    NostrEventKind3[NostrEventKind3["TEXT_NOTE"] = 1] = "TEXT_NOTE";
    NostrEventKind3[NostrEventKind3["RECOMMEND_SERVER"] = 2] = "RECOMMEND_SERVER";
    NostrEventKind3[NostrEventKind3["CONTACTS"] = 3] = "CONTACTS";
    NostrEventKind3[NostrEventKind3["ENCRYPTED_DIRECT_MESSAGE"] = 4] = "ENCRYPTED_DIRECT_MESSAGE";
    NostrEventKind3[NostrEventKind3["EVENT_DELETION"] = 5] = "EVENT_DELETION";
    NostrEventKind3[NostrEventKind3["REPOST"] = 6] = "REPOST";
    NostrEventKind3[NostrEventKind3["REACTION"] = 7] = "REACTION";
    NostrEventKind3[NostrEventKind3["CHANNEL_CREATION"] = 40] = "CHANNEL_CREATION";
    NostrEventKind3[NostrEventKind3["CHANNEL_METADATA"] = 41] = "CHANNEL_METADATA";
    NostrEventKind3[NostrEventKind3["CHANNEL_MESSAGE"] = 42] = "CHANNEL_MESSAGE";
    NostrEventKind3[NostrEventKind3["CHANNEL_HIDE_MESSAGE"] = 43] = "CHANNEL_HIDE_MESSAGE";
    NostrEventKind3[NostrEventKind3["CHANNEL_MUTE_USER"] = 44] = "CHANNEL_MUTE_USER";
    NostrEventKind3[NostrEventKind3["AUTH"] = 22242] = "AUTH";
    NostrEventKind3[NostrEventKind3["AUTH_RESPONSE"] = 22243] = "AUTH_RESPONSE";
  })(NostrEventKind || (NostrEventKind = {}));
  var NostrMessageType;
  (function(NostrMessageType2) {
    NostrMessageType2["EVENT"] = "EVENT";
    NostrMessageType2["NOTICE"] = "NOTICE";
    NostrMessageType2["OK"] = "OK";
    NostrMessageType2["EOSE"] = "EOSE";
    NostrMessageType2["REQ"] = "REQ";
    NostrMessageType2["CLOSE"] = "CLOSE";
    NostrMessageType2["AUTH"] = "AUTH";
  })(NostrMessageType || (NostrMessageType = {}));

  // node_modules/nostr-crypto-utils/dist/esm/types/protocol.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/types/messages.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/types/guards.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/types/nip46.js
  init_process();
  var Nip46Method;
  (function(Nip46Method2) {
    Nip46Method2["CONNECT"] = "connect";
    Nip46Method2["PING"] = "ping";
    Nip46Method2["GET_PUBLIC_KEY"] = "get_public_key";
    Nip46Method2["SIGN_EVENT"] = "sign_event";
    Nip46Method2["NIP04_ENCRYPT"] = "nip04_encrypt";
    Nip46Method2["NIP04_DECRYPT"] = "nip04_decrypt";
    Nip46Method2["NIP44_ENCRYPT"] = "nip44_encrypt";
    Nip46Method2["NIP44_DECRYPT"] = "nip44_decrypt";
    Nip46Method2["GET_RELAYS"] = "get_relays";
  })(Nip46Method || (Nip46Method = {}));

  // node_modules/nostr-crypto-utils/dist/esm/types/index.js
  var NostrEventKind2;
  (function(NostrEventKind3) {
    NostrEventKind3[NostrEventKind3["SET_METADATA"] = 0] = "SET_METADATA";
    NostrEventKind3[NostrEventKind3["TEXT_NOTE"] = 1] = "TEXT_NOTE";
    NostrEventKind3[NostrEventKind3["RECOMMEND_SERVER"] = 2] = "RECOMMEND_SERVER";
    NostrEventKind3[NostrEventKind3["CONTACT_LIST"] = 3] = "CONTACT_LIST";
    NostrEventKind3[NostrEventKind3["ENCRYPTED_DIRECT_MESSAGE"] = 4] = "ENCRYPTED_DIRECT_MESSAGE";
    NostrEventKind3[NostrEventKind3["DELETE"] = 5] = "DELETE";
    NostrEventKind3[NostrEventKind3["REPOST"] = 6] = "REPOST";
    NostrEventKind3[NostrEventKind3["REACTION"] = 7] = "REACTION";
    NostrEventKind3[NostrEventKind3["BADGE_AWARD"] = 8] = "BADGE_AWARD";
    NostrEventKind3[NostrEventKind3["CHANNEL_CREATE"] = 40] = "CHANNEL_CREATE";
    NostrEventKind3[NostrEventKind3["CHANNEL_METADATA"] = 41] = "CHANNEL_METADATA";
    NostrEventKind3[NostrEventKind3["CHANNEL_MESSAGE"] = 42] = "CHANNEL_MESSAGE";
    NostrEventKind3[NostrEventKind3["CHANNEL_HIDE_MESSAGE"] = 43] = "CHANNEL_HIDE_MESSAGE";
    NostrEventKind3[NostrEventKind3["CHANNEL_MUTE_USER"] = 44] = "CHANNEL_MUTE_USER";
    NostrEventKind3[NostrEventKind3["CHANNEL_RESERVE"] = 45] = "CHANNEL_RESERVE";
    NostrEventKind3[NostrEventKind3["REPORTING"] = 1984] = "REPORTING";
    NostrEventKind3[NostrEventKind3["ZAP_REQUEST"] = 9734] = "ZAP_REQUEST";
    NostrEventKind3[NostrEventKind3["ZAP"] = 9735] = "ZAP";
    NostrEventKind3[NostrEventKind3["MUTE_LIST"] = 1e4] = "MUTE_LIST";
    NostrEventKind3[NostrEventKind3["PIN_LIST"] = 10001] = "PIN_LIST";
    NostrEventKind3[NostrEventKind3["RELAY_LIST_METADATA"] = 10002] = "RELAY_LIST_METADATA";
    NostrEventKind3[NostrEventKind3["CLIENT_AUTH"] = 22242] = "CLIENT_AUTH";
    NostrEventKind3[NostrEventKind3["AUTH_RESPONSE"] = 22243] = "AUTH_RESPONSE";
    NostrEventKind3[NostrEventKind3["NOSTR_CONNECT"] = 24133] = "NOSTR_CONNECT";
    NostrEventKind3[NostrEventKind3["CATEGORIZED_PEOPLE"] = 3e4] = "CATEGORIZED_PEOPLE";
    NostrEventKind3[NostrEventKind3["CATEGORIZED_BOOKMARKS"] = 30001] = "CATEGORIZED_BOOKMARKS";
    NostrEventKind3[NostrEventKind3["PROFILE_BADGES"] = 30008] = "PROFILE_BADGES";
    NostrEventKind3[NostrEventKind3["BADGE_DEFINITION"] = 30009] = "BADGE_DEFINITION";
    NostrEventKind3[NostrEventKind3["LONG_FORM"] = 30023] = "LONG_FORM";
    NostrEventKind3[NostrEventKind3["APPLICATION_SPECIFIC"] = 30078] = "APPLICATION_SPECIFIC";
  })(NostrEventKind2 || (NostrEventKind2 = {}));

  // node_modules/nostr-crypto-utils/dist/esm/crypto.js
  init_process();

  // node_modules/@noble/curves/secp256k1.js
  init_process();

  // node_modules/@noble/hashes/sha2.js
  init_process();

  // node_modules/@noble/hashes/_md.js
  init_process();

  // node_modules/@noble/hashes/utils.js
  init_process();
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n, title = "") {
    if (!Number.isSafeInteger(n) || n < 0) {
      const prefix = title && `"${title}" `;
      throw new Error(`${prefix}expected integer >= 0, got ${n}`);
    }
  }
  function abytes(value, length, title = "") {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== void 0;
    if (!bytes || needsLen && len !== length) {
      const prefix = title && `"${title}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes ? `length=${len}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out, void 0, "digestInto() output");
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error('"digestInto() output" expected to be of length >=' + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  var hasHexBuiltin = /* @__PURE__ */ (() => (
    // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
  ))();
  var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes[bytes[i]];
    }
    return hex;
  }
  var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
      return ch - asciis._0;
    if (ch >= asciis.A && ch <= asciis.F)
      return ch - (asciis.A - 10);
    if (ch >= asciis.a && ch <= asciis.f)
      return ch - (asciis.a - 10);
    return;
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    if (hasHexBuiltin)
      return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  function createHasher(hashCons, info = {}) {
    const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
    const tmp = hashCons(void 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    Object.assign(hashC, info);
    return Object.freeze(hashC);
  }
  function randomBytes(bytesLength = 32) {
    const cr = typeof globalThis === "object" ? globalThis.crypto : null;
    if (typeof cr?.getRandomValues !== "function")
      throw new Error("crypto.getRandomValues must be defined");
    return cr.getRandomValues(new Uint8Array(bytesLength));
  }
  var oidNist = (suffix) => ({
    oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
  });

  // node_modules/@noble/hashes/_md.js
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD = class {
    blockLen;
    outputLen;
    padOffset;
    isLE;
    // For partial updates less than block size
    buffer;
    view;
    finished = false;
    length = 0;
    pos = 0;
    destroyed = false;
    constructor(blockLen, outputLen, padOffset, isLE) {
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      abytes(data);
      const { view, buffer, blockLen } = this;
      const len = data.length;
      for (let pos = 0; pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (; blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      clean(this.buffer.subarray(pos));
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos; i < blockLen; i++)
        buffer[i] = 0;
      view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen must be aligned to 32bit");
      const outLen = len / 4;
      const state2 = this.get();
      if (outLen > state2.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0; i < outLen; i++)
        oview.setUint32(4 * i, state2[i], isLE);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to ||= new this.constructor();
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.destroyed = destroyed;
      to.finished = finished;
      to.length = length;
      to.pos = pos;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
  };
  var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);

  // node_modules/@noble/hashes/sha2.js
  var SHA256_K = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  var SHA2_32B = class extends HashMD {
    constructor(outputLen) {
      super(64, outputLen, 8, false);
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0; i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16; i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0; i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      clean(SHA256_W);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      clean(this.buffer);
    }
  };
  var _SHA256 = class extends SHA2_32B {
    // We cannot use array here since array allows indexing by variable
    // which means optimizer/compiler cannot use registers.
    A = SHA256_IV[0] | 0;
    B = SHA256_IV[1] | 0;
    C = SHA256_IV[2] | 0;
    D = SHA256_IV[3] | 0;
    E = SHA256_IV[4] | 0;
    F = SHA256_IV[5] | 0;
    G = SHA256_IV[6] | 0;
    H = SHA256_IV[7] | 0;
    constructor() {
      super(32);
    }
  };
  var sha256 = /* @__PURE__ */ createHasher(
    () => new _SHA256(),
    /* @__PURE__ */ oidNist(1)
  );

  // node_modules/@noble/curves/abstract/curve.js
  init_process();

  // node_modules/@noble/curves/utils.js
  init_process();
  var _0n = /* @__PURE__ */ BigInt(0);
  var _1n = /* @__PURE__ */ BigInt(1);
  function abool(value, title = "") {
    if (typeof value !== "boolean") {
      const prefix = title && `"${title}" `;
      throw new Error(prefix + "expected boolean, got type=" + typeof value);
    }
    return value;
  }
  function abignumber(n) {
    if (typeof n === "bigint") {
      if (!isPosBig(n))
        throw new Error("positive bigint expected, got " + n);
    } else
      anumber(n);
    return n;
  }
  function hexToNumber(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    return hex === "" ? _0n : BigInt("0x" + hex);
  }
  function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
  }
  function bytesToNumberLE(bytes) {
    return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
  }
  function numberToBytesBE(n, len) {
    anumber(len);
    n = abignumber(n);
    const res = hexToBytes(n.toString(16).padStart(len * 2, "0"));
    if (res.length !== len)
      throw new Error("number too large");
    return res;
  }
  function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
  }
  function copyBytes(bytes) {
    return Uint8Array.from(bytes);
  }
  function asciiToBytes(ascii) {
    return Uint8Array.from(ascii, (c, i) => {
      const charCode = c.charCodeAt(0);
      if (c.length !== 1 || charCode > 127) {
        throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
      }
      return charCode;
    });
  }
  var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
  function bitLen(n) {
    let len;
    for (len = 0; n > _0n; n >>= _1n, len += 1)
      ;
    return len;
  }
  var bitMask = (n) => (_1n << BigInt(n)) - _1n;
  function validateObject(object, fields = {}, optFields = {}) {
    if (!object || typeof object !== "object")
      throw new Error("expected valid options object");
    function checkField(fieldName, expectedType, isOpt) {
      const val = object[fieldName];
      if (isOpt && val === void 0)
        return;
      const current = typeof val;
      if (current !== expectedType || val === null)
        throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
    }
    const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
    iter(fields, false);
    iter(optFields, true);
  }
  function memoized(fn) {
    const map = /* @__PURE__ */ new WeakMap();
    return (arg, ...args) => {
      const val = map.get(arg);
      if (val !== void 0)
        return val;
      const computed = fn(arg, ...args);
      map.set(arg, computed);
      return computed;
    };
  }

  // node_modules/@noble/curves/abstract/modular.js
  init_process();
  var _0n2 = /* @__PURE__ */ BigInt(0);
  var _1n2 = /* @__PURE__ */ BigInt(1);
  var _2n = /* @__PURE__ */ BigInt(2);
  var _3n = /* @__PURE__ */ BigInt(3);
  var _4n = /* @__PURE__ */ BigInt(4);
  var _5n = /* @__PURE__ */ BigInt(5);
  var _7n = /* @__PURE__ */ BigInt(7);
  var _8n = /* @__PURE__ */ BigInt(8);
  var _9n = /* @__PURE__ */ BigInt(9);
  var _16n = /* @__PURE__ */ BigInt(16);
  function mod(a, b) {
    const result = a % b;
    return result >= _0n2 ? result : b + result;
  }
  function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n2) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number, modulo) {
    if (number === _0n2)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _0n2)
      throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
    while (a !== _0n2) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n2)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function assertIsSquare(Fp, root, n) {
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
  }
  function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n2) / _4n;
    const root = Fp.pow(n, p1div4);
    assertIsSquare(Fp, root, n);
    return root;
  }
  function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n;
    const n2 = Fp.mul(n, _2n);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i = Fp.mul(Fp.mul(nv, _2n), v);
    const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    assertIsSquare(Fp, root, n);
    return root;
  }
  function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
    const c2 = tn(Fp_, c1);
    const c3 = tn(Fp_, Fp_.neg(c1));
    const c4 = (P + _7n) / _16n;
    return (Fp, n) => {
      let tv1 = Fp.pow(n, c4);
      let tv2 = Fp.mul(tv1, c1);
      const tv3 = Fp.mul(tv1, c2);
      const tv4 = Fp.mul(tv1, c3);
      const e1 = Fp.eql(Fp.sqr(tv2), n);
      const e2 = Fp.eql(Fp.sqr(tv3), n);
      tv1 = Fp.cmov(tv1, tv2, e1);
      tv2 = Fp.cmov(tv4, tv3, e2);
      const e3 = Fp.eql(Fp.sqr(tv2), n);
      const root = Fp.cmov(tv1, tv2, e3);
      assertIsSquare(Fp, root, n);
      return root;
    };
  }
  function tonelliShanks(P) {
    if (P < _3n)
      throw new Error("sqrt is not defined for small field");
    let Q = P - _1n2;
    let S = 0;
    while (Q % _2n === _0n2) {
      Q /= _2n;
      S++;
    }
    let Z = _2n;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
      if (Z++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n2) / _2n;
    return function tonelliSlow(Fp, n) {
      if (Fp.is0(n))
        return n;
      if (FpLegendre(Fp, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = Fp.mul(Fp.ONE, cc);
      let t = Fp.pow(n, Q);
      let R = Fp.pow(n, Q1div2);
      while (!Fp.eql(t, Fp.ONE)) {
        if (Fp.is0(t))
          return Fp.ZERO;
        let i = 1;
        let t_tmp = Fp.sqr(t);
        while (!Fp.eql(t_tmp, Fp.ONE)) {
          i++;
          t_tmp = Fp.sqr(t_tmp);
          if (i === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n2 << BigInt(M - i - 1);
        const b = Fp.pow(c, exponent);
        M = i;
        c = Fp.sqr(b);
        t = Fp.mul(t, c);
        R = Fp.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt(P) {
    if (P % _4n === _3n)
      return sqrt3mod4;
    if (P % _8n === _5n)
      return sqrt5mod8;
    if (P % _16n === _9n)
      return sqrt9mod16(P);
    return tonelliShanks(P);
  }
  var FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
  function validateField(field) {
    const initial = {
      ORDER: "bigint",
      BYTES: "number",
      BITS: "number"
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
      map[val] = "function";
      return map;
    }, initial);
    validateObject(field, opts);
    return field;
  }
  function FpPow(Fp, num2, power) {
    if (power < _0n2)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n2)
      return Fp.ONE;
    if (power === _1n2)
      return num2;
    let p = Fp.ONE;
    let d = num2;
    while (power > _0n2) {
      if (power & _1n2)
        p = Fp.mul(p, d);
      d = Fp.sqr(d);
      power >>= _1n2;
    }
    return p;
  }
  function FpInvertBatch(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
    const multipliedAcc = nums.reduce((acc, num2, i) => {
      if (Fp.is0(num2))
        return acc;
      inverted[i] = acc;
      return Fp.mul(acc, num2);
    }, Fp.ONE);
    const invertedAcc = Fp.inv(multipliedAcc);
    nums.reduceRight((acc, num2, i) => {
      if (Fp.is0(num2))
        return acc;
      inverted[i] = Fp.mul(acc, inverted[i]);
      return Fp.mul(acc, num2);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre(Fp, n) {
    const p1mod2 = (Fp.ORDER - _1n2) / _2n;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength(n, nBitLength) {
    if (nBitLength !== void 0)
      anumber(nBitLength);
    const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  var _Field = class {
    ORDER;
    BITS;
    BYTES;
    isLE;
    ZERO = _0n2;
    ONE = _1n2;
    _lengths;
    _sqrt;
    // cached sqrt
    _mod;
    constructor(ORDER, opts = {}) {
      if (ORDER <= _0n2)
        throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
      let _nbitLength = void 0;
      this.isLE = false;
      if (opts != null && typeof opts === "object") {
        if (typeof opts.BITS === "number")
          _nbitLength = opts.BITS;
        if (typeof opts.sqrt === "function")
          this.sqrt = opts.sqrt;
        if (typeof opts.isLE === "boolean")
          this.isLE = opts.isLE;
        if (opts.allowedLengths)
          this._lengths = opts.allowedLengths?.slice();
        if (typeof opts.modFromBytes === "boolean")
          this._mod = opts.modFromBytes;
      }
      const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
      if (nByteLength > 2048)
        throw new Error("invalid field: expected ORDER of <= 2048 bytes");
      this.ORDER = ORDER;
      this.BITS = nBitLength;
      this.BYTES = nByteLength;
      this._sqrt = void 0;
      Object.preventExtensions(this);
    }
    create(num2) {
      return mod(num2, this.ORDER);
    }
    isValid(num2) {
      if (typeof num2 !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num2);
      return _0n2 <= num2 && num2 < this.ORDER;
    }
    is0(num2) {
      return num2 === _0n2;
    }
    // is valid and invertible
    isValidNot0(num2) {
      return !this.is0(num2) && this.isValid(num2);
    }
    isOdd(num2) {
      return (num2 & _1n2) === _1n2;
    }
    neg(num2) {
      return mod(-num2, this.ORDER);
    }
    eql(lhs, rhs) {
      return lhs === rhs;
    }
    sqr(num2) {
      return mod(num2 * num2, this.ORDER);
    }
    add(lhs, rhs) {
      return mod(lhs + rhs, this.ORDER);
    }
    sub(lhs, rhs) {
      return mod(lhs - rhs, this.ORDER);
    }
    mul(lhs, rhs) {
      return mod(lhs * rhs, this.ORDER);
    }
    pow(num2, power) {
      return FpPow(this, num2, power);
    }
    div(lhs, rhs) {
      return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
    }
    // Same as above, but doesn't normalize
    sqrN(num2) {
      return num2 * num2;
    }
    addN(lhs, rhs) {
      return lhs + rhs;
    }
    subN(lhs, rhs) {
      return lhs - rhs;
    }
    mulN(lhs, rhs) {
      return lhs * rhs;
    }
    inv(num2) {
      return invert(num2, this.ORDER);
    }
    sqrt(num2) {
      if (!this._sqrt)
        this._sqrt = FpSqrt(this.ORDER);
      return this._sqrt(this, num2);
    }
    toBytes(num2) {
      return this.isLE ? numberToBytesLE(num2, this.BYTES) : numberToBytesBE(num2, this.BYTES);
    }
    fromBytes(bytes, skipValidation = false) {
      abytes(bytes);
      const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
      if (allowedLengths) {
        if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
          throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
        }
        const padded = new Uint8Array(BYTES);
        padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
        bytes = padded;
      }
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
      if (modFromBytes)
        scalar = mod(scalar, ORDER);
      if (!skipValidation) {
        if (!this.isValid(scalar))
          throw new Error("invalid field element: outside of range 0..ORDER");
      }
      return scalar;
    }
    // TODO: we don't need it here, move out to separate fn
    invertBatch(lst) {
      return FpInvertBatch(this, lst);
    }
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov(a, b, condition) {
      return condition ? b : a;
    }
  };
  function Field(ORDER, opts = {}) {
    return new _Field(ORDER, opts);
  }
  function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField(key, fieldOrder, isLE = false) {
    abytes(key);
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    if (len < 16 || len < minLen || len > 1024)
      throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
    const num2 = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
    const reduced = mod(num2, fieldOrder - _1n2) + _1n2;
    return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
  }

  // node_modules/@noble/curves/abstract/curve.js
  var _0n3 = /* @__PURE__ */ BigInt(0);
  var _1n3 = /* @__PURE__ */ BigInt(1);
  function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
  }
  function normalizeZ(c, points) {
    const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
    return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
  }
  function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
      throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
  }
  function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1;
    const windowSize = 2 ** (W - 1);
    const maxNumber = 2 ** W;
    const mask = bitMask(W);
    const shiftBy = BigInt(W);
    return { windows, windowSize, mask, maxNumber, shiftBy };
  }
  function calcOffsets(n, window2, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask);
    let nextN = n >> shiftBy;
    if (wbits > windowSize) {
      wbits -= maxNumber;
      nextN += _1n3;
    }
    const offsetStart = window2 * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1;
    const isZero = wbits === 0;
    const isNeg = wbits < 0;
    const isNegF = window2 % 2 !== 0;
    const offsetF = offsetStart;
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
  }
  var pointPrecomputes = /* @__PURE__ */ new WeakMap();
  var pointWindowSizes = /* @__PURE__ */ new WeakMap();
  function getW(P) {
    return pointWindowSizes.get(P) || 1;
  }
  function assert0(n) {
    if (n !== _0n3)
      throw new Error("invalid wNAF");
  }
  var wNAF = class {
    BASE;
    ZERO;
    Fn;
    bits;
    // Parametrized with a given Point class (not individual point)
    constructor(Point, bits) {
      this.BASE = Point.BASE;
      this.ZERO = Point.ZERO;
      this.Fn = Point.Fn;
      this.bits = bits;
    }
    // non-const time multiplication ladder
    _unsafeLadder(elm, n, p = this.ZERO) {
      let d = elm;
      while (n > _0n3) {
        if (n & _1n3)
          p = p.add(d);
        d = d.double();
        n >>= _1n3;
      }
      return p;
    }
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param point Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(point, W) {
      const { windows, windowSize } = calcWOpts(W, this.bits);
      const points = [];
      let p = point;
      let base = p;
      for (let window2 = 0; window2 < windows; window2++) {
        base = p;
        points.push(base);
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    }
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * More compact implementation:
     * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      if (!this.Fn.isValid(n))
        throw new Error("invalid scalar");
      let p = this.ZERO;
      let f = this.BASE;
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          f = f.add(negateCt(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(negateCt(isNeg, precomputes[offset]));
        }
      }
      assert0(n);
      return { p, f };
    }
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        if (n === _0n3)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      assert0(n);
      return acc;
    }
    getPrecomputes(W, point, transform) {
      let comp = pointPrecomputes.get(point);
      if (!comp) {
        comp = this.precomputeWindow(point, W);
        if (W !== 1) {
          if (typeof transform === "function")
            comp = transform(comp);
          pointPrecomputes.set(point, comp);
        }
      }
      return comp;
    }
    cached(point, scalar, transform) {
      const W = getW(point);
      return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
    }
    unsafe(point, scalar, transform, prev) {
      const W = getW(point);
      if (W === 1)
        return this._unsafeLadder(point, scalar, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(P, W) {
      validateW(W, this.bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
    hasCache(elm) {
      return getW(elm) !== 1;
    }
  };
  function mulEndoUnsafe(Point, point, k1, k2) {
    let acc = point;
    let p1 = Point.ZERO;
    let p2 = Point.ZERO;
    while (k1 > _0n3 || k2 > _0n3) {
      if (k1 & _1n3)
        p1 = p1.add(acc);
      if (k2 & _1n3)
        p2 = p2.add(acc);
      acc = acc.double();
      k1 >>= _1n3;
      k2 >>= _1n3;
    }
    return { p1, p2 };
  }
  function createField(order, field, isLE) {
    if (field) {
      if (field.ORDER !== order)
        throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
      validateField(field);
      return field;
    } else {
      return Field(order, { isLE });
    }
  }
  function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
    if (FpFnLE === void 0)
      FpFnLE = type === "edwards";
    if (!CURVE || typeof CURVE !== "object")
      throw new Error(`expected valid ${type} CURVE object`);
    for (const p of ["p", "n", "h"]) {
      const val = CURVE[p];
      if (!(typeof val === "bigint" && val > _0n3))
        throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = type === "weierstrass" ? "b" : "d";
    const params = ["Gx", "Gy", "a", _b];
    for (const p of params) {
      if (!Fp.isValid(CURVE[p]))
        throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return { CURVE, Fp, Fn };
  }
  function createKeygen(randomSecretKey, getPublicKey2) {
    return function keygen(seed) {
      const secretKey = randomSecretKey(seed);
      return { secretKey, publicKey: getPublicKey2(secretKey) };
    };
  }

  // node_modules/@noble/curves/abstract/weierstrass.js
  init_process();
  var divNearest = (num2, den) => (num2 + (num2 >= 0 ? den : -den) / _2n2) / den;
  function _splitEndoScalar(k, basis, n) {
    const [[a1, b1], [a2, b2]] = basis;
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    let k1 = k - c1 * a1 - c2 * a2;
    let k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < _0n4;
    const k2neg = k2 < _0n4;
    if (k1neg)
      k1 = -k1;
    if (k2neg)
      k2 = -k2;
    const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
    if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
      throw new Error("splitScalar (endomorphism): failed, k=" + k);
    }
    return { k1neg, k1, k2neg, k2 };
  }
  var _0n4 = BigInt(0);
  var _1n4 = BigInt(1);
  var _2n2 = BigInt(2);
  var _3n2 = BigInt(3);
  var _4n2 = BigInt(4);
  function weierstrass(params, extraOpts = {}) {
    const validated = createCurveFields("weierstrass", params, extraOpts);
    const { Fp, Fn } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor, n: CURVE_ORDER } = CURVE;
    validateObject(extraOpts, {}, {
      allowInfinityPoint: "boolean",
      clearCofactor: "function",
      isTorsionFree: "function",
      fromBytes: "function",
      toBytes: "function",
      endo: "object"
    });
    const { endo } = extraOpts;
    if (endo) {
      if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
        throw new Error('invalid endo: expected "beta": bigint and "basises": array');
      }
    }
    const lengths = getWLengths(Fp, Fn);
    function assertCompressionIsSupported() {
      if (!Fp.isOdd)
        throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function pointToBytes2(_c, point, isCompressed) {
      const { x, y } = point.toAffine();
      const bx = Fp.toBytes(x);
      abool(isCompressed, "isCompressed");
      if (isCompressed) {
        assertCompressionIsSupported();
        const hasEvenY = !Fp.isOdd(y);
        return concatBytes(pprefix(hasEvenY), bx);
      } else {
        return concatBytes(Uint8Array.of(4), bx, Fp.toBytes(y));
      }
    }
    function pointFromBytes(bytes) {
      abytes(bytes, void 0, "Point");
      const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
      const length = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (length === comp && (head === 2 || head === 3)) {
        const x = Fp.fromBytes(tail);
        if (!Fp.isValid(x))
          throw new Error("bad point: is not on curve, wrong x");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("bad point: is not on curve, sqrt error" + err);
        }
        assertCompressionIsSupported();
        const evenY = Fp.isOdd(y);
        const evenH = (head & 1) === 1;
        if (evenH !== evenY)
          y = Fp.neg(y);
        return { x, y };
      } else if (length === uncomp && head === 4) {
        const L = Fp.BYTES;
        const x = Fp.fromBytes(tail.subarray(0, L));
        const y = Fp.fromBytes(tail.subarray(L, L * 2));
        if (!isValidXY(x, y))
          throw new Error("bad point: is not on curve");
        return { x, y };
      } else {
        throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
      }
    }
    const encodePoint = extraOpts.toBytes || pointToBytes2;
    const decodePoint = extraOpts.fromBytes || pointFromBytes;
    function weierstrassEquation(x) {
      const x2 = Fp.sqr(x);
      const x3 = Fp.mul(x2, x);
      return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
    }
    function isValidXY(x, y) {
      const left = Fp.sqr(y);
      const right = weierstrassEquation(x);
      return Fp.eql(left, right);
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
      throw new Error("bad curve params: a or b");
    function acoord(title, n, banZero = false) {
      if (!Fp.isValid(n) || banZero && Fp.is0(n))
        throw new Error(`bad point coordinate ${title}`);
      return n;
    }
    function aprjpoint(other) {
      if (!(other instanceof Point))
        throw new Error("Weierstrass Point expected");
    }
    function splitEndoScalarN(k) {
      if (!endo || !endo.basises)
        throw new Error("no endo");
      return _splitEndoScalar(k, endo.basises, Fn.ORDER);
    }
    const toAffineMemo = memoized((p, iz) => {
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    });
    const assertValidMemo = memoized((p) => {
      if (p.is0()) {
        if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return true;
    });
    function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
      k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
      k1p = negateCt(k1neg, k1p);
      k2p = negateCt(k2neg, k2p);
      return k1p.add(k2p);
    }
    class Point {
      // base / generator point
      static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
      // zero / infinity / identity point
      static ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
      // 0, 1, 0
      // math field
      static Fp = Fp;
      // scalar field
      static Fn = Fn;
      X;
      Y;
      Z;
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      constructor(X, Y, Z) {
        this.X = acoord("x", X);
        this.Y = acoord("y", Y, true);
        this.Z = acoord("z", Z);
        Object.freeze(this);
      }
      static CURVE() {
        return CURVE;
      }
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof Point)
          throw new Error("projective point not allowed");
        if (Fp.is0(x) && Fp.is0(y))
          return Point.ZERO;
        return new Point(x, y, Fp.ONE);
      }
      static fromBytes(bytes) {
        const P = Point.fromAffine(decodePoint(abytes(bytes, void 0, "point")));
        P.assertValidity();
        return P;
      }
      static fromHex(hex) {
        return Point.fromBytes(hexToBytes(hex));
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      /**
       *
       * @param windowSize
       * @param isLazy true will defer table computation until the first multiplication
       * @returns
       */
      precompute(windowSize = 8, isLazy = true) {
        wnaf.createCache(this, windowSize);
        if (!isLazy)
          this.multiply(_3n2);
        return this;
      }
      // TODO: return `this`
      /** A point on curve is valid if it conforms to equation. */
      assertValidity() {
        assertValidMemo(this);
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (!Fp.isOdd)
          throw new Error("Field doesn't support isOdd");
        return !Fp.isOdd(y);
      }
      /** Compare one point to another. */
      equals(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
        const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
        return U1 && U2;
      }
      /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
      negate() {
        return new Point(this.X, Fp.neg(this.Y), this.Z);
      }
      // Renes-Costello-Batina exception-free doubling formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 3
      // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
      double() {
        const { a, b } = CURVE;
        const b3 = Fp.mul(b, _3n2);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        let t0 = Fp.mul(X1, X1);
        let t1 = Fp.mul(Y1, Y1);
        let t2 = Fp.mul(Z1, Z1);
        let t3 = Fp.mul(X1, Y1);
        t3 = Fp.add(t3, t3);
        Z3 = Fp.mul(X1, Z1);
        Z3 = Fp.add(Z3, Z3);
        X3 = Fp.mul(a, Z3);
        Y3 = Fp.mul(b3, t2);
        Y3 = Fp.add(X3, Y3);
        X3 = Fp.sub(t1, Y3);
        Y3 = Fp.add(t1, Y3);
        Y3 = Fp.mul(X3, Y3);
        X3 = Fp.mul(t3, X3);
        Z3 = Fp.mul(b3, Z3);
        t2 = Fp.mul(a, t2);
        t3 = Fp.sub(t0, t2);
        t3 = Fp.mul(a, t3);
        t3 = Fp.add(t3, Z3);
        Z3 = Fp.add(t0, t0);
        t0 = Fp.add(Z3, t0);
        t0 = Fp.add(t0, t2);
        t0 = Fp.mul(t0, t3);
        Y3 = Fp.add(Y3, t0);
        t2 = Fp.mul(Y1, Z1);
        t2 = Fp.add(t2, t2);
        t0 = Fp.mul(t2, t3);
        X3 = Fp.sub(X3, t0);
        Z3 = Fp.mul(t2, t1);
        Z3 = Fp.add(Z3, Z3);
        Z3 = Fp.add(Z3, Z3);
        return new Point(X3, Y3, Z3);
      }
      // Renes-Costello-Batina exception-free addition formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 1
      // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
      add(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        const a = CURVE.a;
        const b3 = Fp.mul(CURVE.b, _3n2);
        let t0 = Fp.mul(X1, X2);
        let t1 = Fp.mul(Y1, Y2);
        let t2 = Fp.mul(Z1, Z2);
        let t3 = Fp.add(X1, Y1);
        let t4 = Fp.add(X2, Y2);
        t3 = Fp.mul(t3, t4);
        t4 = Fp.add(t0, t1);
        t3 = Fp.sub(t3, t4);
        t4 = Fp.add(X1, Z1);
        let t5 = Fp.add(X2, Z2);
        t4 = Fp.mul(t4, t5);
        t5 = Fp.add(t0, t2);
        t4 = Fp.sub(t4, t5);
        t5 = Fp.add(Y1, Z1);
        X3 = Fp.add(Y2, Z2);
        t5 = Fp.mul(t5, X3);
        X3 = Fp.add(t1, t2);
        t5 = Fp.sub(t5, X3);
        Z3 = Fp.mul(a, t4);
        X3 = Fp.mul(b3, t2);
        Z3 = Fp.add(X3, Z3);
        X3 = Fp.sub(t1, Z3);
        Z3 = Fp.add(t1, Z3);
        Y3 = Fp.mul(X3, Z3);
        t1 = Fp.add(t0, t0);
        t1 = Fp.add(t1, t0);
        t2 = Fp.mul(a, t2);
        t4 = Fp.mul(b3, t4);
        t1 = Fp.add(t1, t2);
        t2 = Fp.sub(t0, t2);
        t2 = Fp.mul(a, t2);
        t4 = Fp.add(t4, t2);
        t0 = Fp.mul(t1, t4);
        Y3 = Fp.add(Y3, t0);
        t0 = Fp.mul(t5, t4);
        X3 = Fp.mul(t3, X3);
        X3 = Fp.sub(X3, t0);
        t0 = Fp.mul(t3, t1);
        Z3 = Fp.mul(t5, Z3);
        Z3 = Fp.add(Z3, t0);
        return new Point(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      is0() {
        return this.equals(Point.ZERO);
      }
      /**
       * Constant time multiplication.
       * Uses wNAF method. Windowed method may be 10% faster,
       * but takes 2x longer to generate and consumes 2x memory.
       * Uses precomputes when available.
       * Uses endomorphism for Koblitz curves.
       * @param scalar by which the point would be multiplied
       * @returns New point
       */
      multiply(scalar) {
        const { endo: endo2 } = extraOpts;
        if (!Fn.isValidNot0(scalar))
          throw new Error("invalid scalar: out of range");
        let point, fake;
        const mul = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point, p));
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
          const { p: k1p, f: k1f } = mul(k1);
          const { p: k2p, f: k2f } = mul(k2);
          fake = k1f.add(k2f);
          point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
        } else {
          const { p, f } = mul(scalar);
          point = p;
          fake = f;
        }
        return normalizeZ(Point, [point, fake])[0];
      }
      /**
       * Non-constant-time multiplication. Uses double-and-add algorithm.
       * It's faster, but should only be used when you don't care about
       * an exposed secret key e.g. sig verification, which works over *public* keys.
       */
      multiplyUnsafe(sc) {
        const { endo: endo2 } = extraOpts;
        const p = this;
        if (!Fn.isValid(sc))
          throw new Error("invalid scalar: out of range");
        if (sc === _0n4 || p.is0())
          return Point.ZERO;
        if (sc === _1n4)
          return p;
        if (wnaf.hasCache(this))
          return this.multiply(sc);
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
          const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2);
          return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
        } else {
          return wnaf.unsafe(p, sc);
        }
      }
      /**
       * Converts Projective point to affine (x, y) coordinates.
       * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
       */
      toAffine(invertedZ) {
        return toAffineMemo(this, invertedZ);
      }
      /**
       * Checks whether Point is free of torsion elements (is in prime subgroup).
       * Always torsion-free for cofactor=1 curves.
       */
      isTorsionFree() {
        const { isTorsionFree } = extraOpts;
        if (cofactor === _1n4)
          return true;
        if (isTorsionFree)
          return isTorsionFree(Point, this);
        return wnaf.unsafe(this, CURVE_ORDER).is0();
      }
      clearCofactor() {
        const { clearCofactor } = extraOpts;
        if (cofactor === _1n4)
          return this;
        if (clearCofactor)
          return clearCofactor(Point, this);
        return this.multiplyUnsafe(cofactor);
      }
      isSmallOrder() {
        return this.multiplyUnsafe(cofactor).is0();
      }
      toBytes(isCompressed = true) {
        abool(isCompressed, "isCompressed");
        this.assertValidity();
        return encodePoint(Point, this, isCompressed);
      }
      toHex(isCompressed = true) {
        return bytesToHex(this.toBytes(isCompressed));
      }
      toString() {
        return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
      }
    }
    const bits = Fn.BITS;
    const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
    Point.BASE.precompute(8);
    return Point;
  }
  function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 2 : 3);
  }
  function getWLengths(Fp, Fn) {
    return {
      secretKey: Fn.BYTES,
      publicKey: 1 + Fp.BYTES,
      publicKeyUncompressed: 1 + 2 * Fp.BYTES,
      publicKeyHasPrefix: true,
      signature: 2 * Fn.BYTES
    };
  }

  // node_modules/@noble/curves/secp256k1.js
  var secp256k1_CURVE = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
  };
  var secp256k1_ENDO = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
      [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
      [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
    ]
  };
  var _0n5 = /* @__PURE__ */ BigInt(0);
  var _2n3 = /* @__PURE__ */ BigInt(2);
  function sqrtMod(y) {
    const P = secp256k1_CURVE.p;
    const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow2(b3, _3n3, P) * b3 % P;
    const b9 = pow2(b6, _3n3, P) * b3 % P;
    const b11 = pow2(b9, _2n3, P) * b2 % P;
    const b22 = pow2(b11, _11n, P) * b11 % P;
    const b44 = pow2(b22, _22n, P) * b22 % P;
    const b88 = pow2(b44, _44n, P) * b44 % P;
    const b176 = pow2(b88, _88n, P) * b88 % P;
    const b220 = pow2(b176, _44n, P) * b44 % P;
    const b223 = pow2(b220, _3n3, P) * b3 % P;
    const t1 = pow2(b223, _23n, P) * b22 % P;
    const t2 = pow2(t1, _6n, P) * b2 % P;
    const root = pow2(t2, _2n3, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
  var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
    Fp: Fpk1,
    endo: secp256k1_ENDO
  });
  var TAGGED_HASH_PREFIXES = {};
  function taggedHash(tag, ...messages) {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === void 0) {
      const tagH = sha256(asciiToBytes(tag));
      tagP = concatBytes(tagH, tagH);
      TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return sha256(concatBytes(tagP, ...messages));
  }
  var pointToBytes = (point) => point.toBytes(true).slice(1);
  var hasEven = (y) => y % _2n3 === _0n5;
  function schnorrGetExtPubKey(priv) {
    const { Fn, BASE } = Pointk1;
    const d_ = Fn.fromBytes(priv);
    const p = BASE.multiply(d_);
    const scalar = hasEven(p.y) ? d_ : Fn.neg(d_);
    return { scalar, bytes: pointToBytes(p) };
  }
  function lift_x(x) {
    const Fp = Fpk1;
    if (!Fp.isValidNot0(x))
      throw new Error("invalid x: Fail if x \u2265 p");
    const xx = Fp.create(x * x);
    const c = Fp.create(xx * x + BigInt(7));
    let y = Fp.sqrt(c);
    if (!hasEven(y))
      y = Fp.neg(y);
    const p = Pointk1.fromAffine({ x, y });
    p.assertValidity();
    return p;
  }
  var num = bytesToNumberBE;
  function challenge(...args) {
    return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
  }
  function schnorrGetPublicKey(secretKey) {
    return schnorrGetExtPubKey(secretKey).bytes;
  }
  function schnorrSign(message, secretKey, auxRand = randomBytes(32)) {
    const { Fn } = Pointk1;
    const m = abytes(message, void 0, "message");
    const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
    const a = abytes(auxRand, 32, "auxRand");
    const t = Fn.toBytes(d ^ num(taggedHash("BIP0340/aux", a)));
    const rand = taggedHash("BIP0340/nonce", t, px, m);
    const { bytes: rx, scalar: k } = schnorrGetExtPubKey(rand);
    const e = challenge(rx, px, m);
    const sig = new Uint8Array(64);
    sig.set(rx, 0);
    sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
    if (!schnorrVerify(sig, m, px))
      throw new Error("sign: Invalid signature produced");
    return sig;
  }
  function schnorrVerify(signature, message, publicKey) {
    const { Fp, Fn, BASE } = Pointk1;
    const sig = abytes(signature, 64, "signature");
    const m = abytes(message, void 0, "message");
    const pub = abytes(publicKey, 32, "publicKey");
    try {
      const P = lift_x(num(pub));
      const r = num(sig.subarray(0, 32));
      if (!Fp.isValidNot0(r))
        return false;
      const s = num(sig.subarray(32, 64));
      if (!Fn.isValidNot0(s))
        return false;
      const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
      const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
      const { x, y } = R.toAffine();
      if (R.is0() || !hasEven(y) || x !== r)
        return false;
      return true;
    } catch (error) {
      return false;
    }
  }
  var schnorr = /* @__PURE__ */ (() => {
    const size = 32;
    const seedLength = 48;
    const randomSecretKey = (seed = randomBytes(seedLength)) => {
      return mapHashToField(seed, secp256k1_CURVE.n);
    };
    return {
      keygen: createKeygen(randomSecretKey, schnorrGetPublicKey),
      getPublicKey: schnorrGetPublicKey,
      sign: schnorrSign,
      verify: schnorrVerify,
      Point: Pointk1,
      utils: {
        randomSecretKey,
        taggedHash,
        lift_x,
        pointToBytes
      },
      lengths: {
        secretKey: size,
        publicKey: size,
        publicKeyHasPrefix: false,
        signature: size * 2,
        seed: seedLength
      }
    };
  })();

  // node_modules/nostr-crypto-utils/dist/esm/utils/logger.js
  init_process();
  var import_pino = __toESM(require_browser());
  var LogLevel;
  (function(LogLevel2) {
    LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
    LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
    LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
    LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
  })(LogLevel || (LogLevel = {}));
  var logger = (0, import_pino.default)({
    name: "nostr-crypto-utils",
    level: process.env.LOG_LEVEL || "info",
    transport: true ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname"
      }
    } : void 0,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
      log: (obj) => {
        if (obj && typeof obj === "object" && "err" in obj) {
          const newObj = { ...obj };
          if (newObj.err instanceof Error) {
            const err = newObj.err;
            newObj.err = {
              message: err.message,
              stack: err.stack,
              name: err.name
            };
          }
          return newObj;
        }
        return obj;
      }
    }
  });

  // node_modules/nostr-crypto-utils/dist/esm/encoding/base64.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/crypto.js
  var getCrypto = async () => {
    if (typeof window !== "undefined" && window.crypto) {
      return window.crypto;
    }
    if (typeof globalThis !== "undefined" && globalThis.crypto) {
      return globalThis.crypto;
    }
    try {
      const cryptoModule = await Promise.resolve().then(() => __toESM(require_crypto()));
      if (cryptoModule.webcrypto) {
        return cryptoModule.webcrypto;
      }
    } catch {
      logger.debug("Node crypto not available");
    }
    throw new Error("No WebCrypto implementation available");
  };
  var CustomCrypto = class {
    cryptoInstance = null;
    initPromise;
    constructor() {
      this.initPromise = this.initialize();
    }
    async initialize() {
      this.cryptoInstance = await getCrypto();
    }
    async ensureInitialized() {
      await this.initPromise;
      if (!this.cryptoInstance) {
        throw new Error("Crypto implementation not initialized");
      }
      return this.cryptoInstance;
    }
    async getSubtle() {
      const crypto2 = await this.ensureInitialized();
      return crypto2.subtle;
    }
    async getRandomValues(array) {
      const crypto2 = await this.ensureInitialized();
      return crypto2.getRandomValues(array);
    }
  };
  var customCrypto = new CustomCrypto();
  var signSchnorr = schnorr.sign;
  var verifySchnorrSignature = schnorr.verify;
  function getPublicKeySync(privateKey) {
    const privateKeyBytes = privateKey instanceof Uint8Array ? privateKey : hexToBytes(privateKey);
    const publicKeyBytes = schnorr.getPublicKey(privateKeyBytes);
    return bytesToHex(publicKeyBytes);
  }

  // node_modules/nostr-crypto-utils/dist/esm/validation/index.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/event/index.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/event/creation.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/event/signing.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-04.js
  init_process();
  var getCrypto2 = async () => {
    if (typeof window !== "undefined" && window.crypto) {
      return window.crypto;
    }
    if (typeof globalThis !== "undefined" && globalThis.crypto) {
      return globalThis.crypto;
    }
    try {
      const cryptoModule = await Promise.resolve().then(() => __toESM(require_crypto()));
      if (cryptoModule.webcrypto) {
        return cryptoModule.webcrypto;
      }
    } catch {
      logger.debug("Node crypto not available");
    }
    throw new Error("No WebCrypto implementation available");
  };
  var CryptoImplementation = class {
    cryptoInstance = null;
    initPromise;
    constructor() {
      this.initPromise = this.initialize();
    }
    async initialize() {
      this.cryptoInstance = await getCrypto2();
    }
    async ensureInitialized() {
      await this.initPromise;
      if (!this.cryptoInstance) {
        throw new Error("Crypto implementation not initialized");
      }
      return this.cryptoInstance;
    }
    async getSubtle() {
      const crypto2 = await this.ensureInitialized();
      return crypto2.subtle;
    }
    async getRandomValues(array) {
      const crypto2 = await this.ensureInitialized();
      return crypto2.getRandomValues(array);
    }
  };
  var cryptoImpl = new CryptoImplementation();

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-01.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-19.js
  init_process();
  var import_bech32 = __toESM(require_dist());
  var import_buffer = __toESM(require_buffer());

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-26.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-44.js
  init_process();
  var utf8Encoder = new TextEncoder();
  var utf8Decoder = new TextDecoder();

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-46.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/nips/nip-49.js
  init_process();

  // node_modules/nostr-crypto-utils/dist/esm/utils/encoding.js
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

  // src/utilities/seedphrase.js
  init_process();

  // src/utilities/secret-vault.js
  init_process();
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
  var _sessionKey = null;
  var _sessionSalt = null;
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

  // src/utilities/utils.js
  var DB_VERSION = 6;
  var storage = api.storage.local;
  var RECOMMENDED_RELAYS = [
    new URL("wss://relay.damus.io"),
    new URL("wss://relay.primal.net"),
    new URL("wss://relay.snort.social"),
    new URL("wss://relay.getalby.com/v1"),
    new URL("wss://nos.lol")
  ];
  async function initialize() {
    await getOrSetDefault("profileIndex", 0);
    await getOrSetDefault("profiles", [await generateProfile()]);
    let version = (await storage.get({ version: 0 })).version;
    console.log("DB version: ", version);
    while (version < DB_VERSION) {
      version = await migrate(version, DB_VERSION);
      await storage.set({ version });
    }
  }
  async function migrate(version, goal) {
    if (version === 0) {
      console.log("Migrating to version 1.");
      let profiles = await getProfiles();
      profiles.forEach((profile) => profile.hosts = {});
      await storage.set({ profiles });
      return version + 1;
    }
    if (version === 1) {
      console.log("migrating to version 2.");
      let profiles = await getProfiles();
      await storage.set({ profiles });
      return version + 1;
    }
    if (version === 2) {
      console.log("Migrating to version 3.");
      let profiles = await getProfiles();
      profiles.forEach((profile) => profile.relayReminder = true);
      await storage.set({ profiles });
      return version + 1;
    }
    if (version === 3) {
      console.log("Migrating to version 4 (encryption support).");
      let data = await storage.get({ isEncrypted: false });
      if (!data.isEncrypted) {
        await storage.set({ isEncrypted: false });
      }
      return version + 1;
    }
    if (version === 4) {
      console.log("Migrating to version 5 (NIP-46 bunker support).");
      let profiles = await getProfiles();
      profiles.forEach((profile) => {
        if (!profile.type) profile.type = "local";
        if (profile.bunkerUrl === void 0) profile.bunkerUrl = null;
        if (profile.remotePubkey === void 0) profile.remotePubkey = null;
      });
      await storage.set({ profiles });
      return version + 1;
    }
    if (version === 5) {
      console.log("Migrating to version 6 (platform sync support).");
      const now = Math.floor(Date.now() / 1e3);
      let profiles = await getProfiles();
      profiles.forEach((profile) => {
        if (profile.updatedAt === void 0) profile.updatedAt = now;
      });
      await storage.set({ profiles, platformSyncEnabled: true });
      return version + 1;
    }
  }
  async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
  }
  async function getProfileNames() {
    let profiles = await getProfiles();
    return profiles.map((p) => p.name);
  }
  async function getProfileIndex() {
    const index = await storage.get({ profileIndex: 0 });
    return index.profileIndex;
  }
  async function deleteProfile(index) {
    let profiles = await getProfiles();
    let profileIndex = await getProfileIndex();
    profiles.splice(index, 1);
    if (profiles.length == 0) {
      await clearData();
      await initialize();
    } else {
      let newIndex = profileIndex === index ? Math.max(index - 1, 0) : profileIndex;
      await storage.set({ profiles, profileIndex: newIndex });
    }
  }
  async function clearData() {
    let ignoreInstallHook = await storage.get({ ignoreInstallHook: false });
    await storage.clear();
    await storage.set(ignoreInstallHook);
  }
  async function generatePrivateKey() {
    return await api.runtime.sendMessage({ kind: "generatePrivateKey" });
  }
  async function generateProfile(name = "Default Nostr Profile", type = "local") {
    let privKey = "";
    let pubKey = "";
    if (type === "local") {
      const hex = await generatePrivateKey();
      try {
        pubKey = getPublicKeySync(hex);
      } catch {
      }
      privKey = await wrapSecret(hex);
    }
    return {
      name,
      privKey,
      pubKey,
      hosts: {},
      relays: RECOMMENDED_RELAYS.map((r) => ({ url: r.href, read: true, write: true })),
      relayReminder: false,
      type,
      bunkerUrl: null,
      remotePubkey: null,
      updatedAt: Math.floor(Date.now() / 1e3)
    };
  }
  async function getOrSetDefault(key, def) {
    let val = (await storage.get(key))[key];
    if (val == null || val == void 0) {
      await storage.set({ [key]: def });
      return def;
    }
    return val;
  }
  async function getNpub() {
    let index = await getProfileIndex();
    return await api.runtime.sendMessage({
      kind: "getNpub",
      payload: index
    });
  }

  // src/profiles/profiles.js
  var state = {
    profiles: [],
    // { index, name, npub, isActive, selected }
    activeIndex: null
  };
  function $(id) {
    return document.getElementById(id);
  }
  async function loadProfiles() {
    const profiles = await getProfiles();
    const names = await getProfileNames();
    const activeIndex = await getProfileIndex();
    state.activeIndex = activeIndex;
    state.profiles = [];
    for (let i = 0; i < profiles.length; i++) {
      let npub = "";
      try {
        npub = await getNpub(i);
      } catch (e) {
        npub = "(unable to read)";
      }
      state.profiles.push({
        index: i,
        name: names[i] || "Unnamed",
        npub: npub || "",
        isActive: i === activeIndex,
        selected: false
      });
    }
    render();
  }
  function render() {
    const list = $("profile-list");
    const countText = $("count-text");
    const warningText = $("warning-text");
    const deleteBtn = $("delete-selected-btn");
    const selectAllBtn = $("select-all-btn");
    if (state.profiles.length === 0) {
      list.innerHTML = '<li style="color:#b0b0a8;padding:20px;text-align:center;">No profiles found.</li>';
      return;
    }
    const npubCount = {};
    state.profiles.forEach((p) => {
      if (p.npub) {
        npubCount[p.npub] = (npubCount[p.npub] || 0) + 1;
      }
    });
    list.innerHTML = state.profiles.map((p) => {
      const isDupe = npubCount[p.npub] > 1;
      const truncNpub = p.npub && p.npub.length > 20 ? p.npub.slice(0, 12) + "..." + p.npub.slice(-8) : p.npub;
      return `
            <li class="profile-item ${p.selected ? "selected" : ""} ${p.isActive ? "active-profile" : ""}"
                data-index="${p.index}" role="option" aria-selected="${p.selected}">
                <input type="checkbox" class="profile-checkbox" data-index="${p.index}"
                    ${p.selected ? "checked" : ""} ${p.isActive && state.profiles.length > 1 ? "" : ""}
                    aria-label="Select ${p.name}" />
                <div class="profile-info">
                    <div class="profile-name">
                        ${escapeHtml(p.name)}
                        ${isDupe ? ' <span style="color:#f92672;font-size:0.75rem;">(duplicate)</span>' : ""}
                    </div>
                    <div class="profile-npub">${escapeHtml(truncNpub)}</div>
                </div>
                ${p.isActive ? '<span class="profile-active-badge">Active</span>' : ""}
            </li>
        `;
    }).join("");
    list.querySelectorAll(".profile-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const profile = state.profiles.find((p) => p.index === idx);
        if (profile) {
          profile.selected = e.target.checked;
          render();
        }
      });
    });
    list.querySelectorAll(".profile-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;
        const idx = parseInt(item.dataset.index, 10);
        const profile = state.profiles.find((p) => p.index === idx);
        if (profile) {
          profile.selected = !profile.selected;
          render();
        }
      });
    });
    const selectedCount = state.profiles.filter((p) => p.selected).length;
    const totalCount = state.profiles.length;
    countText.textContent = `${totalCount} profile${totalCount !== 1 ? "s" : ""} total`;
    const selectedActive = state.profiles.some((p) => p.selected && p.isActive);
    const selectedAll = selectedCount === totalCount;
    warningText.classList.add("hidden");
    if (selectedAll) {
      warningText.textContent = "You must keep at least one profile. The active profile will be kept.";
      warningText.classList.remove("hidden");
    } else if (selectedActive && selectedCount < totalCount) {
      warningText.textContent = "Your active profile is selected. A different profile will become active after deletion.";
      warningText.classList.remove("hidden");
    }
    deleteBtn.disabled = selectedCount === 0;
    deleteBtn.textContent = `Delete Selected (${selectedCount})`;
    const allSelected = selectedCount === totalCount;
    selectAllBtn.textContent = allSelected ? "Deselect All" : "Select All";
  }
  async function deleteSelected() {
    let toDelete = state.profiles.filter((p) => p.selected);
    if (toDelete.length === state.profiles.length) {
      toDelete = toDelete.filter((p) => !p.isActive);
    }
    if (toDelete.length === 0) return;
    const count = toDelete.length;
    if (!confirm(`Delete ${count} profile${count !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    const indices = toDelete.map((p) => p.index).sort((a, b) => b - a);
    for (const idx of indices) {
      try {
        await deleteProfile(idx);
      } catch (e) {
        console.error(`Failed to delete profile ${idx}:`, e);
      }
    }
    const successText = $("success-text");
    successText.textContent = `Deleted ${count} profile${count !== 1 ? "s" : ""}.`;
    successText.classList.remove("hidden");
    setTimeout(() => successText.classList.add("hidden"), 3e3);
    await loadProfiles();
  }
  function toggleSelectAll() {
    const allSelected = state.profiles.every((p) => p.selected);
    state.profiles.forEach((p) => {
      p.selected = !allSelected;
    });
    render();
  }
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  document.addEventListener("DOMContentLoaded", async () => {
    await loadProfiles();
    $("delete-selected-btn").addEventListener("click", deleteSelected);
    $("select-all-btn").addEventListener("click", toggleSelectAll);
  });
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/weierstrass.js:
@noble/curves/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsICJub2RlLXN0dWI6Y3J5cHRvIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9iZWNoMzIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2lkYi9idWlsZC9pbmRleC5qcyIsICIuLi8uLi8uLi9zcmMvcHJvZmlsZXMvcHJvZmlsZXMuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9iYXNlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL3Byb3RvY29sLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvZGlzdC9lc20vdHlwZXMvbWVzc2FnZXMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvZ3VhcmRzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL25pcDQ2LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2NyeXB0by50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvc2VjcDI1NmsxLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy9zaGEyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy9fbWQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9oYXNoZXMvc3JjL3V0aWxzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9hYnN0cmFjdC9jdXJ2ZS50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvdXRpbHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L21vZHVsYXIudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L3dlaWVyc3RyYXNzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3V0aWxzL2xvZ2dlci50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9lbmNvZGluZy9iYXNlNjQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdmFsaWRhdGlvbi9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9ldmVudC9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9ldmVudC9jcmVhdGlvbi50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy9ldmVudC9zaWduaW5nLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTA0LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTAxLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTE5LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTI2LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTQ0LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTQ2LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL25pcHMvbmlwLTQ5LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3V0aWxzL2VuY29kaW5nLnRzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2NyeXB0by5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3NlZWRwaHJhc2UuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIndXNlIHN0cmljdCdcbmZ1bmN0aW9uIHRyeVN0cmluZ2lmeSAobykge1xuICB0cnkgeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkobykgfSBjYXRjaChlKSB7IHJldHVybiAnXCJbQ2lyY3VsYXJdXCInIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtYXRcblxuZnVuY3Rpb24gZm9ybWF0KGYsIGFyZ3MsIG9wdHMpIHtcbiAgdmFyIHNzID0gKG9wdHMgJiYgb3B0cy5zdHJpbmdpZnkpIHx8IHRyeVN0cmluZ2lmeVxuICB2YXIgb2Zmc2V0ID0gMVxuICBpZiAodHlwZW9mIGYgPT09ICdvYmplY3QnICYmIGYgIT09IG51bGwpIHtcbiAgICB2YXIgbGVuID0gYXJncy5sZW5ndGggKyBvZmZzZXRcbiAgICBpZiAobGVuID09PSAxKSByZXR1cm4gZlxuICAgIHZhciBvYmplY3RzID0gbmV3IEFycmF5KGxlbilcbiAgICBvYmplY3RzWzBdID0gc3MoZilcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XG4gICAgICBvYmplY3RzW2luZGV4XSA9IHNzKGFyZ3NbaW5kZXhdKVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJylcbiAgfVxuICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZcbiAgfVxuICB2YXIgYXJnTGVuID0gYXJncy5sZW5ndGhcbiAgaWYgKGFyZ0xlbiA9PT0gMCkgcmV0dXJuIGZcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBhID0gMSAtIG9mZnNldFxuICB2YXIgbGFzdFBvcyA9IC0xXG4gIHZhciBmbGVuID0gKGYgJiYgZi5sZW5ndGgpIHx8IDBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbGVuOykge1xuICAgIGlmIChmLmNoYXJDb2RlQXQoaSkgPT09IDM3ICYmIGkgKyAxIDwgZmxlbikge1xuICAgICAgbGFzdFBvcyA9IGxhc3RQb3MgPiAtMSA/IGxhc3RQb3MgOiAwXG4gICAgICBzd2l0Y2ggKGYuY2hhckNvZGVBdChpICsgMSkpIHtcbiAgICAgICAgY2FzZSAxMDA6IC8vICdkJ1xuICAgICAgICBjYXNlIDEwMjogLy8gJ2YnXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBOdW1iZXIoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDEwNTogLy8gJ2knXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBNYXRoLmZsb29yKE51bWJlcihhcmdzW2FdKSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDc5OiAvLyAnTydcbiAgICAgICAgY2FzZSAxMTE6IC8vICdvJ1xuICAgICAgICBjYXNlIDEwNjogLy8gJ2onXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgYXJnc1thXVxuICAgICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc3RyICs9ICdcXCcnICsgYXJnc1thXSArICdcXCcnXG4gICAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciArPSBhcmdzW2FdLm5hbWUgfHwgJzxhbm9ueW1vdXM+J1xuICAgICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0ciArPSBzcyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMTE1OiAvLyAncydcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IFN0cmluZyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzc6IC8vICclJ1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9ICclJ1xuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGEtLVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICArK2FcbiAgICB9XG4gICAgKytpXG4gIH1cbiAgaWYgKGxhc3RQb3MgPT09IC0xKVxuICAgIHJldHVybiBmXG4gIGVsc2UgaWYgKGxhc3RQb3MgPCBmbGVuKSB7XG4gICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcylcbiAgfVxuXG4gIHJldHVybiBzdHJcbn1cbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgZm9ybWF0ID0gcmVxdWlyZSgncXVpY2stZm9ybWF0LXVuZXNjYXBlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gcGlub1xuXG5jb25zdCBfY29uc29sZSA9IHBmR2xvYmFsVGhpc09yRmFsbGJhY2soKS5jb25zb2xlIHx8IHt9XG5jb25zdCBzdGRTZXJpYWxpemVycyA9IHtcbiAgbWFwSHR0cFJlcXVlc3Q6IG1vY2ssXG4gIG1hcEh0dHBSZXNwb25zZTogbW9jayxcbiAgd3JhcFJlcXVlc3RTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgd3JhcFJlc3BvbnNlU2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBFcnJvclNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICByZXE6IG1vY2ssXG4gIHJlczogbW9jayxcbiAgZXJyOiBhc0VyclZhbHVlLFxuICBlcnJXaXRoQ2F1c2U6IGFzRXJyVmFsdWVcbn1cbmZ1bmN0aW9uIGxldmVsVG9WYWx1ZSAobGV2ZWwsIGxvZ2dlcikge1xuICByZXR1cm4gbGV2ZWwgPT09ICdzaWxlbnQnXG4gICAgPyBJbmZpbml0eVxuICAgIDogbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdXG59XG5jb25zdCBiYXNlTG9nRnVuY3Rpb25TeW1ib2wgPSBTeW1ib2woJ3Bpbm8ubG9nRnVuY3MnKVxuY29uc3QgaGllcmFyY2h5U3ltYm9sID0gU3ltYm9sKCdwaW5vLmhpZXJhcmNoeScpXG5cbmNvbnN0IGxvZ0ZhbGxiYWNrTWFwID0ge1xuICBlcnJvcjogJ2xvZycsXG4gIGZhdGFsOiAnZXJyb3InLFxuICB3YXJuOiAnZXJyb3InLFxuICBpbmZvOiAnbG9nJyxcbiAgZGVidWc6ICdsb2cnLFxuICB0cmFjZTogJ2xvZydcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGRMb2dnZXIgKHBhcmVudExvZ2dlciwgY2hpbGRMb2dnZXIpIHtcbiAgY29uc3QgbmV3RW50cnkgPSB7XG4gICAgbG9nZ2VyOiBjaGlsZExvZ2dlcixcbiAgICBwYXJlbnQ6IHBhcmVudExvZ2dlcltoaWVyYXJjaHlTeW1ib2xdXG4gIH1cbiAgY2hpbGRMb2dnZXJbaGllcmFyY2h5U3ltYm9sXSA9IG5ld0VudHJ5XG59XG5cbmZ1bmN0aW9uIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyAobG9nZ2VyLCBsZXZlbHMsIHByb3RvKSB7XG4gIGNvbnN0IGxvZ0Z1bmN0aW9ucyA9IHt9XG4gIGxldmVscy5mb3JFYWNoKGxldmVsID0+IHtcbiAgICBsb2dGdW5jdGlvbnNbbGV2ZWxdID0gcHJvdG9bbGV2ZWxdID8gcHJvdG9bbGV2ZWxdIDogKF9jb25zb2xlW2xldmVsXSB8fCBfY29uc29sZVtsb2dGYWxsYmFja01hcFtsZXZlbF0gfHwgJ2xvZyddIHx8IG5vb3ApXG4gIH0pXG4gIGxvZ2dlcltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdID0gbG9nRnVuY3Rpb25zXG59XG5cbmZ1bmN0aW9uIHNob3VsZFNlcmlhbGl6ZSAoc2VyaWFsaXplLCBzZXJpYWxpemVycykge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXJpYWxpemUpKSB7XG4gICAgY29uc3QgaGFzVG9GaWx0ZXIgPSBzZXJpYWxpemUuZmlsdGVyKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gayAhPT0gJyFzdGRTZXJpYWxpemVycy5lcnInXG4gICAgfSlcbiAgICByZXR1cm4gaGFzVG9GaWx0ZXJcbiAgfSBlbHNlIGlmIChzZXJpYWxpemUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2VyaWFsaXplcnMpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gcGlubyAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLmJyb3dzZXIgPSBvcHRzLmJyb3dzZXIgfHwge31cblxuICBjb25zdCB0cmFuc21pdCA9IG9wdHMuYnJvd3Nlci50cmFuc21pdFxuICBpZiAodHJhbnNtaXQgJiYgdHlwZW9mIHRyYW5zbWl0LnNlbmQgIT09ICdmdW5jdGlvbicpIHsgdGhyb3cgRXJyb3IoJ3Bpbm86IHRyYW5zbWl0IG9wdGlvbiBtdXN0IGhhdmUgYSBzZW5kIGZ1bmN0aW9uJykgfVxuXG4gIGNvbnN0IHByb3RvID0gb3B0cy5icm93c2VyLndyaXRlIHx8IF9jb25zb2xlXG4gIGlmIChvcHRzLmJyb3dzZXIud3JpdGUpIG9wdHMuYnJvd3Nlci5hc09iamVjdCA9IHRydWVcbiAgY29uc3Qgc2VyaWFsaXplcnMgPSBvcHRzLnNlcmlhbGl6ZXJzIHx8IHt9XG4gIGNvbnN0IHNlcmlhbGl6ZSA9IHNob3VsZFNlcmlhbGl6ZShvcHRzLmJyb3dzZXIuc2VyaWFsaXplLCBzZXJpYWxpemVycylcbiAgbGV0IHN0ZEVyclNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemVcblxuICBpZiAoXG4gICAgQXJyYXkuaXNBcnJheShvcHRzLmJyb3dzZXIuc2VyaWFsaXplKSAmJlxuICAgIG9wdHMuYnJvd3Nlci5zZXJpYWxpemUuaW5kZXhPZignIXN0ZFNlcmlhbGl6ZXJzLmVycicpID4gLTFcbiAgKSBzdGRFcnJTZXJpYWxpemUgPSBmYWxzZVxuXG4gIGNvbnN0IGN1c3RvbUxldmVscyA9IE9iamVjdC5rZXlzKG9wdHMuY3VzdG9tTGV2ZWxzIHx8IHt9KVxuICBjb25zdCBsZXZlbHMgPSBbJ2Vycm9yJywgJ2ZhdGFsJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZSddLmNvbmNhdChjdXN0b21MZXZlbHMpXG5cbiAgaWYgKHR5cGVvZiBwcm90byA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgcHJvdG9bbGV2ZWxdID0gcHJvdG9cbiAgICB9KVxuICB9XG4gIGlmIChvcHRzLmVuYWJsZWQgPT09IGZhbHNlIHx8IG9wdHMuYnJvd3Nlci5kaXNhYmxlZCkgb3B0cy5sZXZlbCA9ICdzaWxlbnQnXG4gIGNvbnN0IGxldmVsID0gb3B0cy5sZXZlbCB8fCAnaW5mbydcbiAgY29uc3QgbG9nZ2VyID0gT2JqZWN0LmNyZWF0ZShwcm90bylcbiAgaWYgKCFsb2dnZXIubG9nKSBsb2dnZXIubG9nID0gbm9vcFxuXG4gIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyhsb2dnZXIsIGxldmVscywgcHJvdG8pXG4gIC8vIHNldHVwIHJvb3QgaGllcmFyY2h5IGVudHJ5XG4gIGFwcGVuZENoaWxkTG9nZ2VyKHt9LCBsb2dnZXIpXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsVmFsJywge1xuICAgIGdldDogZ2V0TGV2ZWxWYWxcbiAgfSlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsJywge1xuICAgIGdldDogZ2V0TGV2ZWwsXG4gICAgc2V0OiBzZXRMZXZlbFxuICB9KVxuXG4gIGNvbnN0IHNldE9wdHMgPSB7XG4gICAgdHJhbnNtaXQsXG4gICAgc2VyaWFsaXplLFxuICAgIGFzT2JqZWN0OiBvcHRzLmJyb3dzZXIuYXNPYmplY3QsXG4gICAgYXNPYmplY3RCaW5kaW5nc09ubHk6IG9wdHMuYnJvd3Nlci5hc09iamVjdEJpbmRpbmdzT25seSxcbiAgICBmb3JtYXR0ZXJzOiBvcHRzLmJyb3dzZXIuZm9ybWF0dGVycyxcbiAgICByZXBvcnRDYWxsZXI6IG9wdHMuYnJvd3Nlci5yZXBvcnRDYWxsZXIsXG4gICAgbGV2ZWxzLFxuICAgIHRpbWVzdGFtcDogZ2V0VGltZUZ1bmN0aW9uKG9wdHMpLFxuICAgIG1lc3NhZ2VLZXk6IG9wdHMubWVzc2FnZUtleSB8fCAnbXNnJyxcbiAgICBvbkNoaWxkOiBvcHRzLm9uQ2hpbGQgfHwgbm9vcFxuICB9XG4gIGxvZ2dlci5sZXZlbHMgPSBnZXRMZXZlbHMob3B0cylcbiAgbG9nZ2VyLmxldmVsID0gbGV2ZWxcblxuICBsb2dnZXIuaXNMZXZlbEVuYWJsZWQgPSBmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICBpZiAoIXRoaXMubGV2ZWxzLnZhbHVlc1tsZXZlbF0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdID49IHRoaXMubGV2ZWxzLnZhbHVlc1t0aGlzLmxldmVsXVxuICB9XG4gIGxvZ2dlci5zZXRNYXhMaXN0ZW5lcnMgPSBsb2dnZXIuZ2V0TWF4TGlzdGVuZXJzID1cbiAgbG9nZ2VyLmVtaXQgPSBsb2dnZXIuYWRkTGlzdGVuZXIgPSBsb2dnZXIub24gPVxuICBsb2dnZXIucHJlcGVuZExpc3RlbmVyID0gbG9nZ2VyLm9uY2UgPVxuICBsb2dnZXIucHJlcGVuZE9uY2VMaXN0ZW5lciA9IGxvZ2dlci5yZW1vdmVMaXN0ZW5lciA9XG4gIGxvZ2dlci5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBsb2dnZXIubGlzdGVuZXJzID1cbiAgbG9nZ2VyLmxpc3RlbmVyQ291bnQgPSBsb2dnZXIuZXZlbnROYW1lcyA9XG4gIGxvZ2dlci53cml0ZSA9IGxvZ2dlci5mbHVzaCA9IG5vb3BcbiAgbG9nZ2VyLnNlcmlhbGl6ZXJzID0gc2VyaWFsaXplcnNcbiAgbG9nZ2VyLl9zZXJpYWxpemUgPSBzZXJpYWxpemVcbiAgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUgPSBzdGRFcnJTZXJpYWxpemVcbiAgbG9nZ2VyLmNoaWxkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIGNoaWxkLmNhbGwodGhpcywgc2V0T3B0cywgLi4uYXJncykgfVxuXG4gIGlmICh0cmFuc21pdCkgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoKVxuXG4gIGZ1bmN0aW9uIGdldExldmVsVmFsICgpIHtcbiAgICByZXR1cm4gbGV2ZWxUb1ZhbHVlKHRoaXMubGV2ZWwsIHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMZXZlbCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xldmVsXG4gIH1cbiAgZnVuY3Rpb24gc2V0TGV2ZWwgKGxldmVsKSB7XG4gICAgaWYgKGxldmVsICE9PSAnc2lsZW50JyAmJiAhdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gbGV2ZWwgJyArIGxldmVsKVxuICAgIH1cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsXG5cbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnZXJyb3InKSAvLyA8LS0gbXVzdCBzdGF5IGZpcnN0XG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2ZhdGFsJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnd2FybicpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2luZm8nKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdkZWJ1ZycpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ3RyYWNlJylcblxuICAgIGN1c3RvbUxldmVscy5mb3JFYWNoKChsZXZlbCkgPT4ge1xuICAgICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgbGV2ZWwpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoaWxkIChzZXRPcHRzLCBiaW5kaW5ncywgY2hpbGRPcHRpb25zKSB7XG4gICAgaWYgKCFiaW5kaW5ncykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGJpbmRpbmdzIGZvciBjaGlsZCBQaW5vJylcbiAgICB9XG4gICAgY2hpbGRPcHRpb25zID0gY2hpbGRPcHRpb25zIHx8IHt9XG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBiaW5kaW5ncy5zZXJpYWxpemVycykge1xuICAgICAgY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzID0gYmluZGluZ3Muc2VyaWFsaXplcnNcbiAgICB9XG4gICAgY29uc3QgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMgPSBjaGlsZE9wdGlvbnMuc2VyaWFsaXplcnNcbiAgICBpZiAoc2VyaWFsaXplICYmIGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzKSB7XG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemVycyA9IE9iamVjdC5hc3NpZ24oe30sIHNlcmlhbGl6ZXJzLCBjaGlsZE9wdGlvbnNTZXJpYWxpemVycylcbiAgICAgIHZhciBjaGlsZFNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemUgPT09IHRydWVcbiAgICAgICAgPyBPYmplY3Qua2V5cyhjaGlsZFNlcmlhbGl6ZXJzKVxuICAgICAgICA6IHNlcmlhbGl6ZVxuICAgICAgZGVsZXRlIGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgICBhcHBseVNlcmlhbGl6ZXJzKFtiaW5kaW5nc10sIGNoaWxkU2VyaWFsaXplLCBjaGlsZFNlcmlhbGl6ZXJzLCB0aGlzLl9zdGRFcnJTZXJpYWxpemUpXG4gICAgfVxuICAgIGZ1bmN0aW9uIENoaWxkIChwYXJlbnQpIHtcbiAgICAgIHRoaXMuX2NoaWxkTGV2ZWwgPSAocGFyZW50Ll9jaGlsZExldmVsIHwgMCkgKyAxXG5cbiAgICAgIC8vIG1ha2Ugc3VyZSBiaW5kaW5ncyBhcmUgYXZhaWxhYmxlIGluIHRoZSBgc2V0YCBmdW5jdGlvblxuICAgICAgdGhpcy5iaW5kaW5ncyA9IGJpbmRpbmdzXG5cbiAgICAgIGlmIChjaGlsZFNlcmlhbGl6ZXJzKSB7XG4gICAgICAgIHRoaXMuc2VyaWFsaXplcnMgPSBjaGlsZFNlcmlhbGl6ZXJzXG4gICAgICAgIHRoaXMuX3NlcmlhbGl6ZSA9IGNoaWxkU2VyaWFsaXplXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNtaXQpIHtcbiAgICAgICAgdGhpcy5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKFxuICAgICAgICAgIFtdLmNvbmNhdChwYXJlbnQuX2xvZ0V2ZW50LmJpbmRpbmdzLCBiaW5kaW5ncylcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICBDaGlsZC5wcm90b3R5cGUgPSB0aGlzXG4gICAgY29uc3QgbmV3TG9nZ2VyID0gbmV3IENoaWxkKHRoaXMpXG5cbiAgICAvLyBtdXN0IGhhcHBlbiBiZWZvcmUgdGhlIGxldmVsIGlzIGFzc2lnbmVkXG4gICAgYXBwZW5kQ2hpbGRMb2dnZXIodGhpcywgbmV3TG9nZ2VyKVxuICAgIG5ld0xvZ2dlci5jaGlsZCA9IGZ1bmN0aW9uICguLi5hcmdzKSB7IHJldHVybiBjaGlsZC5jYWxsKHRoaXMsIHNldE9wdHMsIC4uLmFyZ3MpIH1cbiAgICAvLyByZXF1aXJlZCB0byBhY3R1YWxseSBpbml0aWFsaXplIHRoZSBsb2dnZXIgZnVuY3Rpb25zIGZvciBhbnkgZ2l2ZW4gY2hpbGRcbiAgICBuZXdMb2dnZXIubGV2ZWwgPSBjaGlsZE9wdGlvbnMubGV2ZWwgfHwgdGhpcy5sZXZlbCAvLyBhbGxvdyBsZXZlbCB0byBiZSBzZXQgYnkgY2hpbGRPcHRpb25zXG4gICAgc2V0T3B0cy5vbkNoaWxkKG5ld0xvZ2dlcilcblxuICAgIHJldHVybiBuZXdMb2dnZXJcbiAgfVxuICByZXR1cm4gbG9nZ2VyXG59XG5cbmZ1bmN0aW9uIGdldExldmVscyAob3B0cykge1xuICBjb25zdCBjdXN0b21MZXZlbHMgPSBvcHRzLmN1c3RvbUxldmVscyB8fCB7fVxuXG4gIGNvbnN0IHZhbHVlcyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbm8ubGV2ZWxzLnZhbHVlcywgY3VzdG9tTGV2ZWxzKVxuICBjb25zdCBsYWJlbHMgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5vLmxldmVscy5sYWJlbHMsIGludmVydE9iamVjdChjdXN0b21MZXZlbHMpKVxuXG4gIHJldHVybiB7XG4gICAgdmFsdWVzLFxuICAgIGxhYmVsc1xuICB9XG59XG5cbmZ1bmN0aW9uIGludmVydE9iamVjdCAob2JqKSB7XG4gIGNvbnN0IGludmVydGVkID0ge31cbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpbnZlcnRlZFtvYmpba2V5XV0gPSBrZXlcbiAgfSlcbiAgcmV0dXJuIGludmVydGVkXG59XG5cbnBpbm8ubGV2ZWxzID0ge1xuICB2YWx1ZXM6IHtcbiAgICBmYXRhbDogNjAsXG4gICAgZXJyb3I6IDUwLFxuICAgIHdhcm46IDQwLFxuICAgIGluZm86IDMwLFxuICAgIGRlYnVnOiAyMCxcbiAgICB0cmFjZTogMTBcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgMTA6ICd0cmFjZScsXG4gICAgMjA6ICdkZWJ1ZycsXG4gICAgMzA6ICdpbmZvJyxcbiAgICA0MDogJ3dhcm4nLFxuICAgIDUwOiAnZXJyb3InLFxuICAgIDYwOiAnZmF0YWwnXG4gIH1cbn1cblxucGluby5zdGRTZXJpYWxpemVycyA9IHN0ZFNlcmlhbGl6ZXJzXG5waW5vLnN0ZFRpbWVGdW5jdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG51bGxUaW1lLCBlcG9jaFRpbWUsIHVuaXhUaW1lLCBpc29UaW1lIH0pXG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdDaGFpbiAobG9nZ2VyKSB7XG4gIGNvbnN0IGJpbmRpbmdzID0gW11cbiAgaWYgKGxvZ2dlci5iaW5kaW5ncykge1xuICAgIGJpbmRpbmdzLnB1c2gobG9nZ2VyLmJpbmRpbmdzKVxuICB9XG5cbiAgLy8gdHJhdmVyc2UgdXAgdGhlIHRyZWUgdG8gZ2V0IGFsbCBiaW5kaW5nc1xuICBsZXQgaGllcmFyY2h5ID0gbG9nZ2VyW2hpZXJhcmNoeVN5bWJvbF1cbiAgd2hpbGUgKGhpZXJhcmNoeS5wYXJlbnQpIHtcbiAgICBoaWVyYXJjaHkgPSBoaWVyYXJjaHkucGFyZW50XG4gICAgaWYgKGhpZXJhcmNoeS5sb2dnZXIuYmluZGluZ3MpIHtcbiAgICAgIGJpbmRpbmdzLnB1c2goaGllcmFyY2h5LmxvZ2dlci5iaW5kaW5ncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmluZGluZ3MucmV2ZXJzZSgpXG59XG5cbmZ1bmN0aW9uIHNldCAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpIHtcbiAgLy8gb3ZlcnJpZGUgdGhlIGN1cnJlbnQgbG9nIGZ1bmN0aW9ucyB3aXRoIGVpdGhlciBgbm9vcGAgb3IgdGhlIGJhc2UgbG9nIGZ1bmN0aW9uXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBsZXZlbCwge1xuICAgIHZhbHVlOiAobGV2ZWxUb1ZhbHVlKHNlbGYubGV2ZWwsIHJvb3RMb2dnZXIpID4gbGV2ZWxUb1ZhbHVlKGxldmVsLCByb290TG9nZ2VyKVxuICAgICAgPyBub29wXG4gICAgICA6IHJvb3RMb2dnZXJbYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sXVtsZXZlbF0pLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG5cbiAgaWYgKHNlbGZbbGV2ZWxdID09PSBub29wKSB7XG4gICAgaWYgKCFvcHRzLnRyYW5zbWl0KSByZXR1cm5cblxuICAgIGNvbnN0IHRyYW5zbWl0TGV2ZWwgPSBvcHRzLnRyYW5zbWl0LmxldmVsIHx8IHNlbGYubGV2ZWxcbiAgICBjb25zdCB0cmFuc21pdFZhbHVlID0gbGV2ZWxUb1ZhbHVlKHRyYW5zbWl0TGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgY29uc3QgbWV0aG9kVmFsdWUgPSBsZXZlbFRvVmFsdWUobGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gIH1cblxuICAvLyBtYWtlIHN1cmUgdGhlIGxvZyBmb3JtYXQgaXMgY29ycmVjdFxuICBzZWxmW2xldmVsXSA9IGNyZWF0ZVdyYXAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpXG5cbiAgLy8gcHJlcGVuZCBiaW5kaW5ncyBpZiBpdCBpcyBub3QgdGhlIHJvb3QgbG9nZ2VyXG4gIGNvbnN0IGJpbmRpbmdzID0gZ2V0QmluZGluZ0NoYWluKHNlbGYpXG4gIGlmIChiaW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBlYXJseSBleGl0IGluIGNhc2UgZm9yIHJvb3RMb2dnZXJcbiAgICByZXR1cm5cbiAgfVxuICBzZWxmW2xldmVsXSA9IHByZXBlbmRCaW5kaW5nc0luQXJndW1lbnRzKGJpbmRpbmdzLCBzZWxmW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gcHJlcGVuZEJpbmRpbmdzSW5Bcmd1bWVudHMgKGJpbmRpbmdzLCBsb2dGdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGxvZ0Z1bmMuYXBwbHkodGhpcywgWy4uLmJpbmRpbmdzLCAuLi5hcmd1bWVudHNdKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyYXAgKHNlbGYsIG9wdHMsIHJvb3RMb2dnZXIsIGxldmVsKSB7XG4gIHJldHVybiAoZnVuY3Rpb24gKHdyaXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIExPRyAoKSB7XG4gICAgICBjb25zdCB0cyA9IG9wdHMudGltZXN0YW1wKClcbiAgICAgIGNvbnN0IGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aClcbiAgICAgIGNvbnN0IHByb3RvID0gKE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgPT09IF9jb25zb2xlKSA/IF9jb25zb2xlIDogdGhpc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG5cbiAgICAgIHZhciBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2VcbiAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZSkge1xuICAgICAgICBhcHBseVNlcmlhbGl6ZXJzKGFyZ3MsIHRoaXMuX3NlcmlhbGl6ZSwgdGhpcy5zZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgICAgICBhcmdzSXNTZXJpYWxpemVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG9wdHMuYXNPYmplY3QgfHwgb3B0cy5mb3JtYXR0ZXJzKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IGFzT2JqZWN0KHRoaXMsIGxldmVsLCBhcmdzLCB0cywgb3B0cylcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyICYmIG91dCAmJiBvdXQubGVuZ3RoID4gMCAmJiBvdXRbMF0gJiYgdHlwZW9mIG91dFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGVyID0gZ2V0Q2FsbGVyTG9jYXRpb24oKVxuICAgICAgICAgICAgaWYgKGNhbGxlcikgb3V0WzBdLmNhbGxlciA9IGNhbGxlclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGUuY2FsbChwcm90bywgLi4ub3V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlciA9IGdldENhbGxlckxvY2F0aW9uKClcbiAgICAgICAgICAgIGlmIChjYWxsZXIpIGFyZ3MucHVzaChjYWxsZXIpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB3cml0ZS5hcHBseShwcm90bywgYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMudHJhbnNtaXQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNtaXRMZXZlbCA9IG9wdHMudHJhbnNtaXQubGV2ZWwgfHwgc2VsZi5fbGV2ZWxcbiAgICAgICAgY29uc3QgdHJhbnNtaXRWYWx1ZSA9IGxldmVsVG9WYWx1ZSh0cmFuc21pdExldmVsLCByb290TG9nZ2VyKVxuICAgICAgICBjb25zdCBtZXRob2RWYWx1ZSA9IGxldmVsVG9WYWx1ZShsZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gICAgICAgIHRyYW5zbWl0KHRoaXMsIHtcbiAgICAgICAgICB0cyxcbiAgICAgICAgICBtZXRob2RMZXZlbDogbGV2ZWwsXG4gICAgICAgICAgbWV0aG9kVmFsdWUsXG4gICAgICAgICAgdHJhbnNtaXRMZXZlbCxcbiAgICAgICAgICB0cmFuc21pdFZhbHVlOiByb290TG9nZ2VyLmxldmVscy52YWx1ZXNbb3B0cy50cmFuc21pdC5sZXZlbCB8fCBzZWxmLl9sZXZlbF0sXG4gICAgICAgICAgc2VuZDogb3B0cy50cmFuc21pdC5zZW5kLFxuICAgICAgICAgIHZhbDogbGV2ZWxUb1ZhbHVlKHNlbGYuX2xldmVsLCByb290TG9nZ2VyKVxuICAgICAgICB9LCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkKVxuICAgICAgfVxuICAgIH1cbiAgfSkoc2VsZltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gYXNPYmplY3QgKGxvZ2dlciwgbGV2ZWwsIGFyZ3MsIHRzLCBvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBsZXZlbDogbGV2ZWxGb3JtYXR0ZXIsXG4gICAgbG9nOiBsb2dPYmplY3RGb3JtYXR0ZXIgPSAob2JqKSA9PiBvYmpcbiAgfSA9IG9wdHMuZm9ybWF0dGVycyB8fCB7fVxuICBjb25zdCBhcmdzQ2xvbmVkID0gYXJncy5zbGljZSgpXG4gIGxldCBtc2cgPSBhcmdzQ2xvbmVkWzBdXG4gIGNvbnN0IGxvZ09iamVjdCA9IHt9XG5cbiAgbGV0IGx2bCA9IChsb2dnZXIuX2NoaWxkTGV2ZWwgfCAwKSArIDFcbiAgaWYgKGx2bCA8IDEpIGx2bCA9IDFcblxuICBpZiAodHMpIHtcbiAgICBsb2dPYmplY3QudGltZSA9IHRzXG4gIH1cblxuICBpZiAobGV2ZWxGb3JtYXR0ZXIpIHtcbiAgICBjb25zdCBmb3JtYXR0ZWRMZXZlbCA9IGxldmVsRm9ybWF0dGVyKGxldmVsLCBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF0pXG4gICAgT2JqZWN0LmFzc2lnbihsb2dPYmplY3QsIGZvcm1hdHRlZExldmVsKVxuICB9IGVsc2Uge1xuICAgIGxvZ09iamVjdC5sZXZlbCA9IGxvZ2dlci5sZXZlbHMudmFsdWVzW2xldmVsXVxuICB9XG5cbiAgaWYgKG9wdHMuYXNPYmplY3RCaW5kaW5nc09ubHkpIHtcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZm9ybWF0dGVkTG9nT2JqZWN0ID0gbG9nT2JqZWN0Rm9ybWF0dGVyKGxvZ09iamVjdClcbiAgICByZXR1cm4gW2Zvcm1hdHRlZExvZ09iamVjdCwgLi4uYXJnc0Nsb25lZF1cbiAgfSBlbHNlIHtcbiAgICAvLyBkZWxpYmVyYXRlLCBjYXRjaGluZyBvYmplY3RzLCBhcnJheXNcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgICBtc2cgPSBhcmdzQ2xvbmVkLmxlbmd0aCA/IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpIDogdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbXNnID09PSAnc3RyaW5nJykgbXNnID0gZm9ybWF0KGFyZ3NDbG9uZWQuc2hpZnQoKSwgYXJnc0Nsb25lZClcbiAgICBpZiAobXNnICE9PSB1bmRlZmluZWQpIGxvZ09iamVjdFtvcHRzLm1lc3NhZ2VLZXldID0gbXNnXG5cbiAgICBjb25zdCBmb3JtYXR0ZWRMb2dPYmplY3QgPSBsb2dPYmplY3RGb3JtYXR0ZXIobG9nT2JqZWN0KVxuICAgIHJldHVybiBbZm9ybWF0dGVkTG9nT2JqZWN0XVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5U2VyaWFsaXplcnMgKGFyZ3MsIHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMsIHN0ZEVyclNlcmlhbGl6ZSkge1xuICBmb3IgKGNvbnN0IGkgaW4gYXJncykge1xuICAgIGlmIChzdGRFcnJTZXJpYWxpemUgJiYgYXJnc1tpXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBhcmdzW2ldID0gcGluby5zdGRTZXJpYWxpemVycy5lcnIoYXJnc1tpXSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzW2ldKSAmJiBzZXJpYWxpemUpIHtcbiAgICAgIGZvciAoY29uc3QgayBpbiBhcmdzW2ldKSB7XG4gICAgICAgIGlmIChzZXJpYWxpemUuaW5kZXhPZihrKSA+IC0xICYmIGsgaW4gc2VyaWFsaXplcnMpIHtcbiAgICAgICAgICBhcmdzW2ldW2tdID0gc2VyaWFsaXplcnNba10oYXJnc1tpXVtrXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc21pdCAobG9nZ2VyLCBvcHRzLCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2VuZCA9IG9wdHMuc2VuZFxuICBjb25zdCB0cyA9IG9wdHMudHNcbiAgY29uc3QgbWV0aG9kTGV2ZWwgPSBvcHRzLm1ldGhvZExldmVsXG4gIGNvbnN0IG1ldGhvZFZhbHVlID0gb3B0cy5tZXRob2RWYWx1ZVxuICBjb25zdCB2YWwgPSBvcHRzLnZhbFxuICBjb25zdCBiaW5kaW5ncyA9IGxvZ2dlci5fbG9nRXZlbnQuYmluZGluZ3NcblxuICBpZiAoIWFyZ3NJc1NlcmlhbGl6ZWQpIHtcbiAgICBhcHBseVNlcmlhbGl6ZXJzKFxuICAgICAgYXJncyxcbiAgICAgIGxvZ2dlci5fc2VyaWFsaXplIHx8IE9iamVjdC5rZXlzKGxvZ2dlci5zZXJpYWxpemVycyksXG4gICAgICBsb2dnZXIuc2VyaWFsaXplcnMsXG4gICAgICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplXG4gICAgKVxuICB9XG5cbiAgbG9nZ2VyLl9sb2dFdmVudC50cyA9IHRzXG4gIGxvZ2dlci5fbG9nRXZlbnQubWVzc2FnZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7XG4gICAgLy8gYmluZGluZ3MgY2FuIG9ubHkgYmUgb2JqZWN0cywgc28gcmVmZXJlbmNlIGVxdWFsaXR5IGNoZWNrIHZpYSBpbmRleE9mIGlzIGZpbmVcbiAgICByZXR1cm4gYmluZGluZ3MuaW5kZXhPZihhcmcpID09PSAtMVxuICB9KVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQubGV2ZWwubGFiZWwgPSBtZXRob2RMZXZlbFxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLnZhbHVlID0gbWV0aG9kVmFsdWVcblxuICBzZW5kKG1ldGhvZExldmVsLCBsb2dnZXIuX2xvZ0V2ZW50LCB2YWwpXG5cbiAgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoYmluZGluZ3MpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ0V2ZW50U2hhcGUgKGJpbmRpbmdzKSB7XG4gIHJldHVybiB7XG4gICAgdHM6IDAsXG4gICAgbWVzc2FnZXM6IFtdLFxuICAgIGJpbmRpbmdzOiBiaW5kaW5ncyB8fCBbXSxcbiAgICBsZXZlbDogeyBsYWJlbDogJycsIHZhbHVlOiAwIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhc0VyclZhbHVlIChlcnIpIHtcbiAgY29uc3Qgb2JqID0ge1xuICAgIHR5cGU6IGVyci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgIG1zZzogZXJyLm1lc3NhZ2UsXG4gICAgc3RhY2s6IGVyci5zdGFja1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVycikge1xuICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IGVycltrZXldXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gZ2V0VGltZUZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICh0eXBlb2Ygb3B0cy50aW1lc3RhbXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0cy50aW1lc3RhbXBcbiAgfVxuICBpZiAob3B0cy50aW1lc3RhbXAgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG51bGxUaW1lXG4gIH1cbiAgcmV0dXJuIGVwb2NoVGltZVxufVxuXG5mdW5jdGlvbiBtb2NrICgpIHsgcmV0dXJuIHt9IH1cbmZ1bmN0aW9uIHBhc3N0aHJvdWdoIChhKSB7IHJldHVybiBhIH1cbmZ1bmN0aW9uIG5vb3AgKCkge31cblxuZnVuY3Rpb24gbnVsbFRpbWUgKCkgeyByZXR1cm4gZmFsc2UgfVxuZnVuY3Rpb24gZXBvY2hUaW1lICgpIHsgcmV0dXJuIERhdGUubm93KCkgfVxuZnVuY3Rpb24gdW5peFRpbWUgKCkgeyByZXR1cm4gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMC4wKSB9XG5mdW5jdGlvbiBpc29UaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkpLnRvSVNPU3RyaW5nKCkgfSAvLyB1c2luZyBEYXRlLm5vdygpIGZvciB0ZXN0YWJpbGl0eVxuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIHBmR2xvYmFsVGhpc09yRmFsbGJhY2sgKCkge1xuICBmdW5jdGlvbiBkZWZkIChvKSB7IHJldHVybiB0eXBlb2YgbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbyB9XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGdsb2JhbFRoaXNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ2dsb2JhbFRoaXMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIE9iamVjdC5wcm90b3R5cGUuZ2xvYmFsVGhpc1xuICAgICAgICByZXR1cm4gKHRoaXMuZ2xvYmFsVGhpcyA9IHRoaXMpXG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICByZXR1cm4gZ2xvYmFsVGhpc1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmQoc2VsZikgfHwgZGVmZCh3aW5kb3cpIHx8IGRlZmQodGhpcykgfHwge31cbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gcGlub1xubW9kdWxlLmV4cG9ydHMucGlubyA9IHBpbm9cblxuLy8gQXR0ZW1wdCB0byBleHRyYWN0IHRoZSB1c2VyIGNhbGxzaXRlIChmaWxlOmxpbmU6Y29sdW1uKVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGdldENhbGxlckxvY2F0aW9uICgpIHtcbiAgY29uc3Qgc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIGlmICghc3RhY2spIHJldHVybiBudWxsXG4gIGNvbnN0IGxpbmVzID0gc3RhY2suc3BsaXQoJ1xcbicpXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsID0gbGluZXNbaV0udHJpbSgpXG4gICAgLy8gc2tpcCBmcmFtZXMgZnJvbSB0aGlzIGZpbGUgYW5kIGludGVybmFsc1xuICAgIGlmICgvKF5hdFxccyspPyhjcmVhdGVXcmFwfExPR3xzZXRcXHMqXFwofGFzT2JqZWN0fE9iamVjdFxcLmFwcGx5fEZ1bmN0aW9uXFwuYXBwbHkpLy50ZXN0KGwpKSBjb250aW51ZVxuICAgIGlmIChsLmluZGV4T2YoJ2Jyb3dzZXIuanMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgaWYgKGwuaW5kZXhPZignbm9kZTppbnRlcm5hbCcpICE9PSAtMSkgY29udGludWVcbiAgICBpZiAobC5pbmRleE9mKCdub2RlX21vZHVsZXMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgLy8gdHJ5IGZvcm1hdHMgbGlrZTogYXQgZnVuYyAoZmlsZTpsaW5lOmNvbCkgb3IgYXQgZmlsZTpsaW5lOmNvbFxuICAgIGxldCBtID0gbC5tYXRjaCgvXFwoKC4qPyk6KFxcZCspOihcXGQrKVxcKS8pXG4gICAgaWYgKCFtKSBtID0gbC5tYXRjaCgvYXRcXHMrKC4qPyk6KFxcZCspOihcXGQrKS8pXG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBtWzFdXG4gICAgICBjb25zdCBsaW5lID0gbVsyXVxuICAgICAgY29uc3QgY29sID0gbVszXVxuICAgICAgcmV0dXJuIGZpbGUgKyAnOicgKyBsaW5lICsgJzonICsgY29sXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG4iLCAibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCAiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5iZWNoMzJtID0gZXhwb3J0cy5iZWNoMzIgPSB2b2lkIDA7XG5jb25zdCBBTFBIQUJFVCA9ICdxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bCc7XG5jb25zdCBBTFBIQUJFVF9NQVAgPSB7fTtcbmZvciAobGV0IHogPSAwOyB6IDwgQUxQSEFCRVQubGVuZ3RoOyB6KyspIHtcbiAgICBjb25zdCB4ID0gQUxQSEFCRVQuY2hhckF0KHopO1xuICAgIEFMUEhBQkVUX01BUFt4XSA9IHo7XG59XG5mdW5jdGlvbiBwb2x5bW9kU3RlcChwcmUpIHtcbiAgICBjb25zdCBiID0gcHJlID4+IDI1O1xuICAgIHJldHVybiAoKChwcmUgJiAweDFmZmZmZmYpIDw8IDUpIF5cbiAgICAgICAgKC0oKGIgPj4gMCkgJiAxKSAmIDB4M2I2YTU3YjIpIF5cbiAgICAgICAgKC0oKGIgPj4gMSkgJiAxKSAmIDB4MjY1MDhlNmQpIF5cbiAgICAgICAgKC0oKGIgPj4gMikgJiAxKSAmIDB4MWVhMTE5ZmEpIF5cbiAgICAgICAgKC0oKGIgPj4gMykgJiAxKSAmIDB4M2Q0MjMzZGQpIF5cbiAgICAgICAgKC0oKGIgPj4gNCkgJiAxKSAmIDB4MmExNDYyYjMpKTtcbn1cbmZ1bmN0aW9uIHByZWZpeENoayhwcmVmaXgpIHtcbiAgICBsZXQgY2hrID0gMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMzMgfHwgYyA+IDEyNilcbiAgICAgICAgICAgIHJldHVybiAnSW52YWxpZCBwcmVmaXggKCcgKyBwcmVmaXggKyAnKSc7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAoYyA+PiA1KTtcbiAgICB9XG4gICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB2ID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAodiAmIDB4MWYpO1xuICAgIH1cbiAgICByZXR1cm4gY2hrO1xufVxuZnVuY3Rpb24gY29udmVydChkYXRhLCBpbkJpdHMsIG91dEJpdHMsIHBhZCkge1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgbGV0IGJpdHMgPSAwO1xuICAgIGNvbnN0IG1heFYgPSAoMSA8PCBvdXRCaXRzKSAtIDE7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIDw8IGluQml0cykgfCBkYXRhW2ldO1xuICAgICAgICBiaXRzICs9IGluQml0cztcbiAgICAgICAgd2hpbGUgKGJpdHMgPj0gb3V0Qml0cykge1xuICAgICAgICAgICAgYml0cyAtPSBvdXRCaXRzO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKHZhbHVlID4+IGJpdHMpICYgbWF4Vik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhZCkge1xuICAgICAgICBpZiAoYml0cyA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoYml0cyA+PSBpbkJpdHMpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VzcyBwYWRkaW5nJztcbiAgICAgICAgaWYgKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpXG4gICAgICAgICAgICByZXR1cm4gJ05vbi16ZXJvIHBhZGRpbmcnO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gdG9Xb3JkcyhieXRlcykge1xuICAgIHJldHVybiBjb252ZXJ0KGJ5dGVzLCA4LCA1LCB0cnVlKTtcbn1cbmZ1bmN0aW9uIGZyb21Xb3Jkc1Vuc2FmZSh3b3Jkcykge1xuICAgIGNvbnN0IHJlcyA9IGNvbnZlcnQod29yZHMsIDUsIDgsIGZhbHNlKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMpKVxuICAgICAgICByZXR1cm4gcmVzO1xufVxuZnVuY3Rpb24gZnJvbVdvcmRzKHdvcmRzKSB7XG4gICAgY29uc3QgcmVzID0gY29udmVydCh3b3JkcywgNSwgOCwgZmFsc2UpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlcykpXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG59XG5mdW5jdGlvbiBnZXRMaWJyYXJ5RnJvbUVuY29kaW5nKGVuY29kaW5nKSB7XG4gICAgbGV0IEVOQ09ESU5HX0NPTlNUO1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2JlY2gzMicpIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAweDJiYzgzMGEzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbmNvZGUocHJlZml4LCB3b3JkcywgTElNSVQpIHtcbiAgICAgICAgTElNSVQgPSBMSU1JVCB8fCA5MDtcbiAgICAgICAgaWYgKHByZWZpeC5sZW5ndGggKyA3ICsgd29yZHMubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeGNlZWRzIGxlbmd0aCBsaW1pdCcpO1xuICAgICAgICBwcmVmaXggPSBwcmVmaXgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGNoayBtb2RcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY2hrKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHByZWZpeCArICcxJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgeCA9IHdvcmRzW2ldO1xuICAgICAgICAgICAgaWYgKHggPj4gNSAhPT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbiA1LWJpdCB3b3JkJyk7XG4gICAgICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4geDtcbiAgICAgICAgICAgIHJlc3VsdCArPSBBTFBIQUJFVC5jaGFyQXQoeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoayk7XG4gICAgICAgIH1cbiAgICAgICAgY2hrIF49IEVOQ09ESU5HX0NPTlNUO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgdiA9IChjaGsgPj4gKCg1IC0gaSkgKiA1KSkgJiAweDFmO1xuICAgICAgICAgICAgcmVzdWx0ICs9IEFMUEhBQkVULmNoYXJBdCh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBfX2RlY29kZShzdHIsIExJTUlUKSB7XG4gICAgICAgIExJTUlUID0gTElNSVQgfHwgOTA7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoIDwgOClcbiAgICAgICAgICAgIHJldHVybiBzdHIgKyAnIHRvbyBzaG9ydCc7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VlZHMgbGVuZ3RoIGxpbWl0JztcbiAgICAgICAgLy8gZG9uJ3QgYWxsb3cgbWl4ZWQgY2FzZVxuICAgICAgICBjb25zdCBsb3dlcmVkID0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHVwcGVyZWQgPSBzdHIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKHN0ciAhPT0gbG93ZXJlZCAmJiBzdHIgIT09IHVwcGVyZWQpXG4gICAgICAgICAgICByZXR1cm4gJ01peGVkLWNhc2Ugc3RyaW5nICcgKyBzdHI7XG4gICAgICAgIHN0ciA9IGxvd2VyZWQ7XG4gICAgICAgIGNvbnN0IHNwbGl0ID0gc3RyLmxhc3RJbmRleE9mKCcxJyk7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gJ05vIHNlcGFyYXRvciBjaGFyYWN0ZXIgZm9yICcgKyBzdHI7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAnTWlzc2luZyBwcmVmaXggZm9yICcgKyBzdHI7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHN0ci5zbGljZSgwLCBzcGxpdCk7XG4gICAgICAgIGNvbnN0IHdvcmRDaGFycyA9IHN0ci5zbGljZShzcGxpdCArIDEpO1xuICAgICAgICBpZiAod29yZENoYXJzLmxlbmd0aCA8IDYpXG4gICAgICAgICAgICByZXR1cm4gJ0RhdGEgdG9vIHNob3J0JztcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gY2hrO1xuICAgICAgICBjb25zdCB3b3JkcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRDaGFycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHdvcmRDaGFycy5jaGFyQXQoaSk7XG4gICAgICAgICAgICBjb25zdCB2ID0gQUxQSEFCRVRfTUFQW2NdO1xuICAgICAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1Vua25vd24gY2hhcmFjdGVyICcgKyBjO1xuICAgICAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeIHY7XG4gICAgICAgICAgICAvLyBub3QgaW4gdGhlIGNoZWNrc3VtP1xuICAgICAgICAgICAgaWYgKGkgKyA2ID49IHdvcmRDaGFycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB3b3Jkcy5wdXNoKHYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGsgIT09IEVOQ09ESU5HX0NPTlNUKVxuICAgICAgICAgICAgcmV0dXJuICdJbnZhbGlkIGNoZWNrc3VtIGZvciAnICsgc3RyO1xuICAgICAgICByZXR1cm4geyBwcmVmaXgsIHdvcmRzIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlY29kZVVuc2FmZShzdHIsIExJTUlUKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IF9fZGVjb2RlKHN0ciwgTElNSVQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNvZGUoc3RyLCBMSU1JVCkge1xuICAgICAgICBjb25zdCByZXMgPSBfX2RlY29kZShzdHIsIExJTUlUKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGRlY29kZVVuc2FmZSxcbiAgICAgICAgZGVjb2RlLFxuICAgICAgICBlbmNvZGUsXG4gICAgICAgIHRvV29yZHMsXG4gICAgICAgIGZyb21Xb3Jkc1Vuc2FmZSxcbiAgICAgICAgZnJvbVdvcmRzLFxuICAgIH07XG59XG5leHBvcnRzLmJlY2gzMiA9IGdldExpYnJhcnlGcm9tRW5jb2RpbmcoJ2JlY2gzMicpO1xuZXhwb3J0cy5iZWNoMzJtID0gZ2V0TGlicmFyeUZyb21FbmNvZGluZygnYmVjaDMybScpO1xuIiwgIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbi8vIFN1cHBvcnQgZGVjb2RpbmcgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ3MsIGFzIE5vZGUuanMgZG9lcy5cbi8vIFNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0I1VSTF9hcHBsaWNhdGlvbnNcbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIGdldExlbnMgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyBUcmltIG9mZiBleHRyYSBieXRlcyBhZnRlciBwbGFjZWhvbGRlciBieXRlcyBhcmUgZm91bmRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVhdGdhbW1pdC9iYXNlNjQtanMvaXNzdWVzLzQyXG4gIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKCc9JylcbiAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW5cblxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlblxuICAgID8gMFxuICAgIDogNCAtICh2YWxpZExlbiAlIDQpXG5cbiAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXVxufVxuXG4vLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiBfYnl0ZUxlbmd0aCAoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuXG4gIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpXG5cbiAgdmFyIGN1ckJ5dGUgPSAwXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICB2YXIgbGVuID0gcGxhY2VIb2xkZXJzTGVuID4gMFxuICAgID8gdmFsaWRMZW4gLSA0XG4gICAgOiB2YWxpZExlblxuXG4gIHZhciBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwgIi8qISBpZWVlNzU0LiBCU0QtMy1DbGF1c2UgTGljZW5zZS4gRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnL29wZW5zb3VyY2U+ICovXG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCAiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbmNvbnN0IGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbmNvbnN0IGN1c3RvbUluc3BlY3RTeW1ib2wgPVxuICAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sWydmb3InXSA9PT0gJ2Z1bmN0aW9uJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA/IFN5bWJvbFsnZm9yJ10oJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA6IG51bGxcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG5jb25zdCBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGNvbnN0IHByb3RvID0geyBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH0gfVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgVWludDhBcnJheS5wcm90b3R5cGUpXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGFyciwgcHJvdG8pXG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAncGFyZW50Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclxuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ29mZnNldCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5ieXRlT2Zmc2V0XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAobGVuZ3RoKSB7XG4gIGlmIChsZW5ndGggPiBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIGxlbmd0aCArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1ZiwgQnVmZmVyLnByb3RvdHlwZSlcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbmZ1bmN0aW9uIGZyb20gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheVZpZXcodmFsdWUpXG4gIH1cblxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2UodmFsdWUsIEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBBcnJheUJ1ZmZlcikpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIChpc0luc3RhbmNlKHZhbHVlLCBTaGFyZWRBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgU2hhcmVkQXJyYXlCdWZmZXIpKSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgKVxuICB9XG5cbiAgY29uc3QgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgY29uc3QgYiA9IGZyb21PYmplY3QodmFsdWUpXG4gIGlmIChiKSByZXR1cm4gYlxuXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9QcmltaXRpdmUgIT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLnByb3RvdHlwZSwgVWludDhBcnJheS5wcm90b3R5cGUpXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLCBVaW50OEFycmF5KVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gIH1cblxuICBjb25zdCBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICBsZXQgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcblxuICBjb25zdCBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICBjb25zdCBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheVZpZXcgKGFycmF5Vmlldykge1xuICBpZiAoaXNJbnN0YW5jZShhcnJheVZpZXcsIFVpbnQ4QXJyYXkpKSB7XG4gICAgY29uc3QgY29weSA9IG5ldyBVaW50OEFycmF5KGFycmF5VmlldylcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKGNvcHkuYnVmZmVyLCBjb3B5LmJ5dGVPZmZzZXQsIGNvcHkuYnl0ZUxlbmd0aClcbiAgfVxuICByZXR1cm4gZnJvbUFycmF5TGlrZShhcnJheVZpZXcpXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJvZmZzZXRcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcImxlbmd0aFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBsZXQgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVmLCBCdWZmZXIucHJvdG90eXBlKVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIGNvbnN0IGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgY29uc3QgYnVmID0gY3JlYXRlQnVmZmVyKGxlbilcblxuICAgIGlmIChidWYubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnVmXG4gICAgfVxuXG4gICAgb2JqLmNvcHkoYnVmLCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIGJ1ZlxuICB9XG5cbiAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYU4ob2JqLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICB9XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqKVxuICB9XG5cbiAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iai5kYXRhKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZSAmJlxuICAgIGIgIT09IEJ1ZmZlci5wcm90b3R5cGUgLy8gc28gQnVmZmVyLmlzQnVmZmVyKEJ1ZmZlci5wcm90b3R5cGUpIHdpbGwgYmUgZmFsc2Vcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmIChpc0luc3RhbmNlKGEsIFVpbnQ4QXJyYXkpKSBhID0gQnVmZmVyLmZyb20oYSwgYS5vZmZzZXQsIGEuYnl0ZUxlbmd0aClcbiAgaWYgKGlzSW5zdGFuY2UoYiwgVWludDhBcnJheSkpIGIgPSBCdWZmZXIuZnJvbShiLCBiLm9mZnNldCwgYi5ieXRlTGVuZ3RoKVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJidWYxXCIsIFwiYnVmMlwiIGFyZ3VtZW50cyBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5J1xuICAgIClcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIGxldCB4ID0gYS5sZW5ndGhcbiAgbGV0IHkgPSBiLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgbGV0IGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICBsZXQgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIGxldCBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgaWYgKHBvcyArIGJ1Zi5sZW5ndGggPiBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIGJ1ZiA9IEJ1ZmZlci5mcm9tKGJ1ZilcbiAgICAgICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgYnVmLFxuICAgICAgICAgIHBvc1xuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIH1cbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgY29uc3QgbXVzdE1hdGNoID0gKGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSA9PT0gdHJ1ZSlcbiAgaWYgKCFtdXN0TWF0Y2ggJiYgbGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICBsZXQgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB7XG4gICAgICAgICAgcmV0dXJuIG11c3RNYXRjaCA/IC0xIDogdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgfVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJjaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCAoYW5kIHRoZSBgaXMtYnVmZmVyYCBucG0gcGFja2FnZSlcbi8vIHRvIGRldGVjdCBhIEJ1ZmZlciBpbnN0YW5jZS4gSXQncyBub3QgcG9zc2libGUgdG8gdXNlIGBpbnN0YW5jZW9mIEJ1ZmZlcmBcbi8vIHJlbGlhYmx5IGluIGEgYnJvd3NlcmlmeSBjb250ZXh0IGJlY2F1c2UgdGhlcmUgY291bGQgYmUgbXVsdGlwbGUgZGlmZmVyZW50XG4vLyBjb3BpZXMgb2YgdGhlICdidWZmZXInIHBhY2thZ2UgaW4gdXNlLiBUaGlzIG1ldGhvZCB3b3JrcyBldmVuIGZvciBCdWZmZXJcbi8vIGluc3RhbmNlcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIGFub3RoZXIgY29weSBvZiB0aGUgYGJ1ZmZlcmAgcGFja2FnZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE1NFxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgY29uc3QgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcgPSBCdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgbGV0IHN0ciA9ICcnXG4gIGNvbnN0IG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKVxuICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5pZiAoY3VzdG9tSW5zcGVjdFN5bWJvbCkge1xuICBCdWZmZXIucHJvdG90eXBlW2N1c3RvbUluc3BlY3RTeW1ib2xdID0gQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmIChpc0luc3RhbmNlKHRhcmdldCwgVWludDhBcnJheSkpIHtcbiAgICB0YXJnZXQgPSBCdWZmZXIuZnJvbSh0YXJnZXQsIHRhcmdldC5vZmZzZXQsIHRhcmdldC5ieXRlTGVuZ3RoKVxuICB9XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInRhcmdldFwiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXkuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdGFyZ2V0KVxuICAgIClcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIGxldCB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICBsZXQgeSA9IGVuZCAtIHN0YXJ0XG4gIGNvbnN0IGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgY29uc3QgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgY29uc3QgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgW3ZhbF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIGxldCBpbmRleFNpemUgPSAxXG4gIGxldCBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIGxldCB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIGxldCBpXG4gIGlmIChkaXIpIHtcbiAgICBsZXQgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIGNvbnN0IHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBsZXQgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKG51bWJlcklzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICBjb25zdCByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIGxldCBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgY29uc3QgcmVzID0gW11cblxuICBsZXQgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgY29uc3QgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgbGV0IGNvZGVQb2ludCA9IG51bGxcbiAgICBsZXQgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKVxuICAgICAgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKVxuICAgICAgICAgID8gM1xuICAgICAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpXG4gICAgICAgICAgICAgID8gMlxuICAgICAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIGxldCBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbmNvbnN0IE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICBjb25zdCBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIGxldCByZXMgPSAnJ1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGxldCByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICBsZXQgb3V0ID0gJydcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gaGV4U2xpY2VMb29rdXBUYWJsZVtidWZbaV1dXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBjb25zdCBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICBsZXQgcmVzID0gJydcbiAgLy8gSWYgYnl0ZXMubGVuZ3RoIGlzIG9kZCwgdGhlIGxhc3QgOCBiaXRzIG11c3QgYmUgaWdub3JlZCAoc2FtZSBhcyBub2RlLmpzKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICBjb25zdCBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihuZXdCdWYsIEJ1ZmZlci5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludExFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0XVxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50QkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIGxldCBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDggPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDE2TEUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQzMkxFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDMyQkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnVUludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ1VJbnQ2NExFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgbG8gPSBmaXJzdCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDI0XG5cbiAgY29uc3QgaGkgPSB0aGlzWysrb2Zmc2V0XSArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgbGFzdCAqIDIgKiogMjRcblxuICByZXR1cm4gQmlnSW50KGxvKSArIChCaWdJbnQoaGkpIDw8IEJpZ0ludCgzMikpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdVSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnVUludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCBoaSA9IGZpcnN0ICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF1cblxuICBjb25zdCBsbyA9IHRoaXNbKytvZmZzZXRdICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgbGFzdFxuXG4gIHJldHVybiAoQmlnSW50KGhpKSA8PCBCaWdJbnQoMzIpKSArIEJpZ0ludChsbylcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldF1cbiAgbGV0IG11bCA9IDFcbiAgbGV0IGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICBsZXQgaSA9IGJ5dGVMZW5ndGhcbiAgbGV0IG11bCA9IDFcbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICBjb25zdCB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnSW50NjRMRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgNF0gK1xuICAgIHRoaXNbb2Zmc2V0ICsgNV0gKiAyICoqIDggK1xuICAgIHRoaXNbb2Zmc2V0ICsgNl0gKiAyICoqIDE2ICtcbiAgICAobGFzdCA8PCAyNCkgLy8gT3ZlcmZsb3dcblxuICByZXR1cm4gKEJpZ0ludCh2YWwpIDw8IEJpZ0ludCgzMikpICtcbiAgICBCaWdJbnQoZmlyc3QgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAyNClcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ0ludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ0ludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCB2YWwgPSAoZmlyc3QgPDwgMjQpICsgLy8gT3ZlcmZsb3dcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XVxuXG4gIHJldHVybiAoQmlnSW50KHZhbCkgPDwgQmlnSW50KDMyKSkgK1xuICAgIEJpZ0ludCh0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjQgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIGxhc3QpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnRMRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludEJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIGxldCBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgbGV0IG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50OCA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQxNkxFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDMyTEUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQzMkJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIHdydEJpZ1VJbnQ2NExFIChidWYsIHZhbHVlLCBvZmZzZXQsIG1pbiwgbWF4KSB7XG4gIGNoZWNrSW50QkkodmFsdWUsIG1pbiwgbWF4LCBidWYsIG9mZnNldCwgNylcblxuICBsZXQgbG8gPSBOdW1iZXIodmFsdWUgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsZXQgaGkgPSBOdW1iZXIodmFsdWUgPj4gQmlnSW50KDMyKSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIHJldHVybiBvZmZzZXRcbn1cblxuZnVuY3Rpb24gd3J0QmlnVUludDY0QkUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbWluLCBtYXgpIHtcbiAgY2hlY2tJbnRCSSh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCA3KVxuXG4gIGxldCBsbyA9IE51bWJlcih2YWx1ZSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCArIDddID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQgKyA2XSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0ICsgNV0gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCArIDRdID0gbG9cbiAgbGV0IGhpID0gTnVtYmVyKHZhbHVlID4+IEJpZ0ludCgzMikgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQgKyAzXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0ICsgMl0gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCArIDFdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXRdID0gaGlcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ1VJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnVUludDY0TEUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRMRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBCaWdJbnQoMCksIEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnVUludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdVSW50NjRCRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NEJFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIEJpZ0ludCgwKSwgQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSAwXG4gIGxldCBtdWwgPSAxXG4gIGxldCBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSBieXRlTGVuZ3RoIC0gMVxuICBsZXQgbXVsID0gMVxuICBsZXQgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ0ludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdJbnQ2NExFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0TEUodGhpcywgdmFsdWUsIG9mZnNldCwgLUJpZ0ludCgnMHg4MDAwMDAwMDAwMDAwMDAwJyksIEJpZ0ludCgnMHg3ZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ0ludDY0QkUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRCRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAtQmlnSW50KCcweDgwMDAwMDAwMDAwMDAwMDAnKSwgQmlnSW50KCcweDdmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IHNob3VsZCBiZSBhIEJ1ZmZlcicpXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICBjb25zdCBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKChlbmNvZGluZyA9PT0gJ3V0ZjgnICYmIGNvZGUgPCAxMjgpIHx8XG4gICAgICAgICAgZW5jb2RpbmcgPT09ICdsYXRpbjEnKSB7XG4gICAgICAgIC8vIEZhc3QgcGF0aDogSWYgYHZhbGAgZml0cyBpbnRvIGEgc2luZ2xlIGJ5dGUsIHVzZSB0aGF0IG51bWVyaWMgdmFsdWUuXG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWwgPSBOdW1iZXIodmFsKVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIGxldCBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgICBjb25zdCBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgdmFsdWUgXCInICsgdmFsICtcbiAgICAgICAgJ1wiIGlzIGludmFsaWQgZm9yIGFyZ3VtZW50IFwidmFsdWVcIicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIENVU1RPTSBFUlJPUlNcbi8vID09PT09PT09PT09PT1cblxuLy8gU2ltcGxpZmllZCB2ZXJzaW9ucyBmcm9tIE5vZGUsIGNoYW5nZWQgZm9yIEJ1ZmZlci1vbmx5IHVzYWdlXG5jb25zdCBlcnJvcnMgPSB7fVxuZnVuY3Rpb24gRSAoc3ltLCBnZXRNZXNzYWdlLCBCYXNlKSB7XG4gIGVycm9yc1tzeW1dID0gY2xhc3MgTm9kZUVycm9yIGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgc3VwZXIoKVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ21lc3NhZ2UnLCB7XG4gICAgICAgIHZhbHVlOiBnZXRNZXNzYWdlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIC8vIEFkZCB0aGUgZXJyb3IgY29kZSB0byB0aGUgbmFtZSB0byBpbmNsdWRlIGl0IGluIHRoZSBzdGFjayB0cmFjZS5cbiAgICAgIHRoaXMubmFtZSA9IGAke3RoaXMubmFtZX0gWyR7c3ltfV1gXG4gICAgICAvLyBBY2Nlc3MgdGhlIHN0YWNrIHRvIGdlbmVyYXRlIHRoZSBlcnJvciBtZXNzYWdlIGluY2x1ZGluZyB0aGUgZXJyb3IgY29kZVxuICAgICAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgICAgIHRoaXMuc3RhY2sgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgICAgIC8vIFJlc2V0IHRoZSBuYW1lIHRvIHRoZSBhY3R1YWwgbmFtZS5cbiAgICAgIGRlbGV0ZSB0aGlzLm5hbWVcbiAgICB9XG5cbiAgICBnZXQgY29kZSAoKSB7XG4gICAgICByZXR1cm4gc3ltXG4gICAgfVxuXG4gICAgc2V0IGNvZGUgKHZhbHVlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvZGUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRvU3RyaW5nICgpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9IFske3N5bX1dOiAke3RoaXMubWVzc2FnZX1gXG4gICAgfVxuICB9XG59XG5cbkUoJ0VSUl9CVUZGRVJfT1VUX09GX0JPVU5EUycsXG4gIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJldHVybiBgJHtuYW1lfSBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHNgXG4gICAgfVxuXG4gICAgcmV0dXJuICdBdHRlbXB0IHRvIGFjY2VzcyBtZW1vcnkgb3V0c2lkZSBidWZmZXIgYm91bmRzJ1xuICB9LCBSYW5nZUVycm9yKVxuRSgnRVJSX0lOVkFMSURfQVJHX1RZUEUnLFxuICBmdW5jdGlvbiAobmFtZSwgYWN0dWFsKSB7XG4gICAgcmV0dXJuIGBUaGUgXCIke25hbWV9XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBhY3R1YWx9YFxuICB9LCBUeXBlRXJyb3IpXG5FKCdFUlJfT1VUX09GX1JBTkdFJyxcbiAgZnVuY3Rpb24gKHN0ciwgcmFuZ2UsIGlucHV0KSB7XG4gICAgbGV0IG1zZyA9IGBUaGUgdmFsdWUgb2YgXCIke3N0cn1cIiBpcyBvdXQgb2YgcmFuZ2UuYFxuICAgIGxldCByZWNlaXZlZCA9IGlucHV0XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIoaW5wdXQpICYmIE1hdGguYWJzKGlucHV0KSA+IDIgKiogMzIpIHtcbiAgICAgIHJlY2VpdmVkID0gYWRkTnVtZXJpY2FsU2VwYXJhdG9yKFN0cmluZyhpbnB1dCkpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdiaWdpbnQnKSB7XG4gICAgICByZWNlaXZlZCA9IFN0cmluZyhpbnB1dClcbiAgICAgIGlmIChpbnB1dCA+IEJpZ0ludCgyKSAqKiBCaWdJbnQoMzIpIHx8IGlucHV0IDwgLShCaWdJbnQoMikgKiogQmlnSW50KDMyKSkpIHtcbiAgICAgICAgcmVjZWl2ZWQgPSBhZGROdW1lcmljYWxTZXBhcmF0b3IocmVjZWl2ZWQpXG4gICAgICB9XG4gICAgICByZWNlaXZlZCArPSAnbidcbiAgICB9XG4gICAgbXNnICs9IGAgSXQgbXVzdCBiZSAke3JhbmdlfS4gUmVjZWl2ZWQgJHtyZWNlaXZlZH1gXG4gICAgcmV0dXJuIG1zZ1xuICB9LCBSYW5nZUVycm9yKVxuXG5mdW5jdGlvbiBhZGROdW1lcmljYWxTZXBhcmF0b3IgKHZhbCkge1xuICBsZXQgcmVzID0gJydcbiAgbGV0IGkgPSB2YWwubGVuZ3RoXG4gIGNvbnN0IHN0YXJ0ID0gdmFsWzBdID09PSAnLScgPyAxIDogMFxuICBmb3IgKDsgaSA+PSBzdGFydCArIDQ7IGkgLT0gMykge1xuICAgIHJlcyA9IGBfJHt2YWwuc2xpY2UoaSAtIDMsIGkpfSR7cmVzfWBcbiAgfVxuICByZXR1cm4gYCR7dmFsLnNsaWNlKDAsIGkpfSR7cmVzfWBcbn1cblxuLy8gQ0hFQ0sgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gY2hlY2tCb3VuZHMgKGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGlmIChidWZbb2Zmc2V0XSA9PT0gdW5kZWZpbmVkIHx8IGJ1ZltvZmZzZXQgKyBieXRlTGVuZ3RoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCBidWYubGVuZ3RoIC0gKGJ5dGVMZW5ndGggKyAxKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0ludEJJICh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikge1xuICAgIGNvbnN0IG4gPSB0eXBlb2YgbWluID09PSAnYmlnaW50JyA/ICduJyA6ICcnXG4gICAgbGV0IHJhbmdlXG4gICAgaWYgKGJ5dGVMZW5ndGggPiAzKSB7XG4gICAgICBpZiAobWluID09PSAwIHx8IG1pbiA9PT0gQmlnSW50KDApKSB7XG4gICAgICAgIHJhbmdlID0gYD49IDAke259IGFuZCA8IDIke259ICoqICR7KGJ5dGVMZW5ndGggKyAxKSAqIDh9JHtufWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gYD49IC0oMiR7bn0gKiogJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufSkgYW5kIDwgMiAqKiBgICtcbiAgICAgICAgICAgICAgICBgJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZ2UgPSBgPj0gJHttaW59JHtufSBhbmQgPD0gJHttYXh9JHtufWBcbiAgICB9XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfT1VUX09GX1JBTkdFKCd2YWx1ZScsIHJhbmdlLCB2YWx1ZSlcbiAgfVxuICBjaGVja0JvdW5kcyhidWYsIG9mZnNldCwgYnl0ZUxlbmd0aClcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVOdW1iZXIgKHZhbHVlLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfSU5WQUxJRF9BUkdfVFlQRShuYW1lLCAnbnVtYmVyJywgdmFsdWUpXG4gIH1cbn1cblxuZnVuY3Rpb24gYm91bmRzRXJyb3IgKHZhbHVlLCBsZW5ndGgsIHR5cGUpIHtcbiAgaWYgKE1hdGguZmxvb3IodmFsdWUpICE9PSB2YWx1ZSkge1xuICAgIHZhbGlkYXRlTnVtYmVyKHZhbHVlLCB0eXBlKVxuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX09VVF9PRl9SQU5HRSh0eXBlIHx8ICdvZmZzZXQnLCAnYW4gaW50ZWdlcicsIHZhbHVlKVxuICB9XG5cbiAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9CVUZGRVJfT1VUX09GX0JPVU5EUygpXG4gIH1cblxuICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9PVVRfT0ZfUkFOR0UodHlwZSB8fCAnb2Zmc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA+PSAke3R5cGUgPyAxIDogMH0gYW5kIDw9ICR7bGVuZ3RofWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSlcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5jb25zdCBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHRha2VzIGVxdWFsIHNpZ25zIGFzIGVuZCBvZiB0aGUgQmFzZTY0IGVuY29kaW5nXG4gIHN0ciA9IHN0ci5zcGxpdCgnPScpWzBdXG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgbGV0IGNvZGVQb2ludFxuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIGxldCBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICBjb25zdCBieXRlcyA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIGNvbnN0IGJ5dGVBcnJheSA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgbGV0IGMsIGhpLCBsb1xuICBjb25zdCBieXRlQXJyYXkgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGxldCBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG4vLyBBcnJheUJ1ZmZlciBvciBVaW50OEFycmF5IG9iamVjdHMgZnJvbSBvdGhlciBjb250ZXh0cyAoaS5lLiBpZnJhbWVzKSBkbyBub3QgcGFzc1xuLy8gdGhlIGBpbnN0YW5jZW9mYCBjaGVjayBidXQgdGhleSBzaG91bGQgYmUgdHJlYXRlZCBhcyBvZiB0aGF0IHR5cGUuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNjZcbmZ1bmN0aW9uIGlzSW5zdGFuY2UgKG9iaiwgdHlwZSkge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgdHlwZSB8fFxuICAgIChvYmogIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPSBudWxsICYmXG4gICAgICBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gdHlwZS5uYW1lKVxufVxuZnVuY3Rpb24gbnVtYmVySXNOYU4gKG9iaikge1xuICAvLyBGb3IgSUUxMSBzdXBwb3J0XG4gIHJldHVybiBvYmogIT09IG9iaiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG4vLyBDcmVhdGUgbG9va3VwIHRhYmxlIGZvciBgdG9TdHJpbmcoJ2hleCcpYFxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMjE5XG5jb25zdCBoZXhTbGljZUxvb2t1cFRhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgYWxwaGFiZXQgPSAnMDEyMzQ1Njc4OWFiY2RlZidcbiAgY29uc3QgdGFibGUgPSBuZXcgQXJyYXkoMjU2KVxuICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICBjb25zdCBpMTYgPSBpICogMTZcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDE2OyArK2opIHtcbiAgICAgIHRhYmxlW2kxNiArIGpdID0gYWxwaGFiZXRbaV0gKyBhbHBoYWJldFtqXVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFibGVcbn0pKClcblxuLy8gUmV0dXJuIG5vdCBmdW5jdGlvbiB3aXRoIEVycm9yIGlmIEJpZ0ludCBub3Qgc3VwcG9ydGVkXG5mdW5jdGlvbiBkZWZpbmVCaWdJbnRNZXRob2QgKGZuKSB7XG4gIHJldHVybiB0eXBlb2YgQmlnSW50ID09PSAndW5kZWZpbmVkJyA/IEJ1ZmZlckJpZ0ludE5vdERlZmluZWQgOiBmblxufVxuXG5mdW5jdGlvbiBCdWZmZXJCaWdJbnROb3REZWZpbmVkICgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdCaWdJbnQgbm90IHN1cHBvcnRlZCcpXG59XG4iLCAiY29uc3QgaW5zdGFuY2VPZkFueSA9IChvYmplY3QsIGNvbnN0cnVjdG9ycykgPT4gY29uc3RydWN0b3JzLnNvbWUoKGMpID0+IG9iamVjdCBpbnN0YW5jZW9mIGMpO1xuXG5sZXQgaWRiUHJveHlhYmxlVHlwZXM7XG5sZXQgY3Vyc29yQWR2YW5jZU1ldGhvZHM7XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldElkYlByb3h5YWJsZVR5cGVzKCkge1xuICAgIHJldHVybiAoaWRiUHJveHlhYmxlVHlwZXMgfHxcbiAgICAgICAgKGlkYlByb3h5YWJsZVR5cGVzID0gW1xuICAgICAgICAgICAgSURCRGF0YWJhc2UsXG4gICAgICAgICAgICBJREJPYmplY3RTdG9yZSxcbiAgICAgICAgICAgIElEQkluZGV4LFxuICAgICAgICAgICAgSURCQ3Vyc29yLFxuICAgICAgICAgICAgSURCVHJhbnNhY3Rpb24sXG4gICAgICAgIF0pKTtcbn1cbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKSB7XG4gICAgcmV0dXJuIChjdXJzb3JBZHZhbmNlTWV0aG9kcyB8fFxuICAgICAgICAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgPSBbXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmFkdmFuY2UsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZVByaW1hcnlLZXksXG4gICAgICAgIF0pKTtcbn1cbmNvbnN0IHRyYW5zYWN0aW9uRG9uZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCB0cmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHdyYXAocmVxdWVzdC5yZXN1bHQpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gVGhpcyBtYXBwaW5nIGV4aXN0cyBpbiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgYnV0IGRvZXNuJ3QgZXhpc3QgaW4gdHJhbnNmb3JtQ2FjaGUuIFRoaXNcbiAgICAvLyBpcyBiZWNhdXNlIHdlIGNyZWF0ZSBtYW55IHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdC5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb21pc2UsIHJlcXVlc3QpO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHR4KSB7XG4gICAgLy8gRWFybHkgYmFpbCBpZiB3ZSd2ZSBhbHJlYWR5IGNyZWF0ZWQgYSBkb25lIHByb21pc2UgZm9yIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgaWYgKHRyYW5zYWN0aW9uRG9uZU1hcC5oYXModHgpKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgZG9uZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QodHguZXJyb3IgfHwgbmV3IERPTUV4Y2VwdGlvbignQWJvcnRFcnJvcicsICdBYm9ydEVycm9yJykpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBDYWNoZSBpdCBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuICAgIHRyYW5zYWN0aW9uRG9uZU1hcC5zZXQodHgsIGRvbmUpO1xufVxubGV0IGlkYlByb3h5VHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciB0cmFuc2FjdGlvbi5kb25lLlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdkb25lJylcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25Eb25lTWFwLmdldCh0YXJnZXQpO1xuICAgICAgICAgICAgLy8gTWFrZSB0eC5zdG9yZSByZXR1cm4gdGhlIG9ubHkgc3RvcmUgaW4gdGhlIHRyYW5zYWN0aW9uLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG1hbnkuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ3N0b3JlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzFdXG4gICAgICAgICAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIDogcmVjZWl2ZXIub2JqZWN0U3RvcmUocmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSB0cmFuc2Zvcm0gd2hhdGV2ZXIgd2UgZ2V0IGJhY2suXG4gICAgICAgIHJldHVybiB3cmFwKHRhcmdldFtwcm9wXSk7XG4gICAgfSxcbiAgICBzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbiAmJlxuICAgICAgICAgICAgKHByb3AgPT09ICdkb25lJyB8fCBwcm9wID09PSAnc3RvcmUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0O1xuICAgIH0sXG59O1xuZnVuY3Rpb24gcmVwbGFjZVRyYXBzKGNhbGxiYWNrKSB7XG4gICAgaWRiUHJveHlUcmFwcyA9IGNhbGxiYWNrKGlkYlByb3h5VHJhcHMpO1xufVxuZnVuY3Rpb24gd3JhcEZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBEdWUgdG8gZXhwZWN0ZWQgb2JqZWN0IGVxdWFsaXR5ICh3aGljaCBpcyBlbmZvcmNlZCBieSB0aGUgY2FjaGluZyBpbiBgd3JhcGApLCB3ZVxuICAgIC8vIG9ubHkgY3JlYXRlIG9uZSBuZXcgZnVuYyBwZXIgZnVuYy5cbiAgICAvLyBDdXJzb3IgbWV0aG9kcyBhcmUgc3BlY2lhbCwgYXMgdGhlIGJlaGF2aW91ciBpcyBhIGxpdHRsZSBtb3JlIGRpZmZlcmVudCB0byBzdGFuZGFyZCBJREIuIEluXG4gICAgLy8gSURCLCB5b3UgYWR2YW5jZSB0aGUgY3Vyc29yIGFuZCB3YWl0IGZvciBhIG5ldyAnc3VjY2Vzcycgb24gdGhlIElEQlJlcXVlc3QgdGhhdCBnYXZlIHlvdSB0aGVcbiAgICAvLyBjdXJzb3IuIEl0J3Mga2luZGEgbGlrZSBhIHByb21pc2UgdGhhdCBjYW4gcmVzb2x2ZSB3aXRoIG1hbnkgdmFsdWVzLiBUaGF0IGRvZXNuJ3QgbWFrZSBzZW5zZVxuICAgIC8vIHdpdGggcmVhbCBwcm9taXNlcywgc28gZWFjaCBhZHZhbmNlIG1ldGhvZHMgcmV0dXJucyBhIG5ldyBwcm9taXNlIGZvciB0aGUgY3Vyc29yIG9iamVjdCwgb3JcbiAgICAvLyB1bmRlZmluZWQgaWYgdGhlIGVuZCBvZiB0aGUgY3Vyc29yIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgaWYgKGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkuaW5jbHVkZXMoZnVuYykpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICAgICAgZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIHdyYXAodGhpcy5yZXF1ZXN0KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgcmV0dXJuIHdyYXAoZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIHJldHVybiB3cmFwRnVuY3Rpb24odmFsdWUpO1xuICAgIC8vIFRoaXMgZG9lc24ndCByZXR1cm4sIGl0IGp1c3QgY3JlYXRlcyBhICdkb25lJyBwcm9taXNlIGZvciB0aGUgdHJhbnNhY3Rpb24sXG4gICAgLy8gd2hpY2ggaXMgbGF0ZXIgcmV0dXJuZWQgZm9yIHRyYW5zYWN0aW9uLmRvbmUgKHNlZSBpZGJPYmplY3RIYW5kbGVyKS5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbilcbiAgICAgICAgY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHZhbHVlKTtcbiAgICBpZiAoaW5zdGFuY2VPZkFueSh2YWx1ZSwgZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSkpXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkodmFsdWUsIGlkYlByb3h5VHJhcHMpO1xuICAgIC8vIFJldHVybiB0aGUgc2FtZSB2YWx1ZSBiYWNrIGlmIHdlJ3JlIG5vdCBnb2luZyB0byB0cmFuc2Zvcm0gaXQuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gd3JhcCh2YWx1ZSkge1xuICAgIC8vIFdlIHNvbWV0aW1lcyBnZW5lcmF0ZSBtdWx0aXBsZSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QgKGVnIHdoZW4gY3Vyc29yaW5nKSwgYmVjYXVzZVxuICAgIC8vIElEQiBpcyB3ZWlyZCBhbmQgYSBzaW5nbGUgSURCUmVxdWVzdCBjYW4geWllbGQgbWFueSByZXNwb25zZXMsIHNvIHRoZXNlIGNhbid0IGJlIGNhY2hlZC5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJSZXF1ZXN0KVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdCh2YWx1ZSk7XG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSB0cmFuc2Zvcm1lZCB0aGlzIHZhbHVlIGJlZm9yZSwgcmV1c2UgdGhlIHRyYW5zZm9ybWVkIHZhbHVlLlxuICAgIC8vIFRoaXMgaXMgZmFzdGVyLCBidXQgaXQgYWxzbyBwcm92aWRlcyBvYmplY3QgZXF1YWxpdHkuXG4gICAgaWYgKHRyYW5zZm9ybUNhY2hlLmhhcyh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSk7XG4gICAgLy8gTm90IGFsbCB0eXBlcyBhcmUgdHJhbnNmb3JtZWQuXG4gICAgLy8gVGhlc2UgbWF5IGJlIHByaW1pdGl2ZSB0eXBlcywgc28gdGhleSBjYW4ndCBiZSBXZWFrTWFwIGtleXMuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB0cmFuc2Zvcm1DYWNoZS5zZXQodmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChuZXdWYWx1ZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3VmFsdWU7XG59XG5jb25zdCB1bndyYXAgPSAodmFsdWUpID0+IHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuXG4vKipcbiAqIE9wZW4gYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqIEBwYXJhbSB2ZXJzaW9uIFNjaGVtYSB2ZXJzaW9uLlxuICogQHBhcmFtIGNhbGxiYWNrcyBBZGRpdGlvbmFsIGNhbGxiYWNrcy5cbiAqL1xuZnVuY3Rpb24gb3BlbkRCKG5hbWUsIHZlcnNpb24sIHsgYmxvY2tlZCwgdXBncmFkZSwgYmxvY2tpbmcsIHRlcm1pbmF0ZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKG5hbWUsIHZlcnNpb24pO1xuICAgIGNvbnN0IG9wZW5Qcm9taXNlID0gd3JhcChyZXF1ZXN0KTtcbiAgICBpZiAodXBncmFkZSkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZ3JhZGVuZWVkZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHVwZ3JhZGUod3JhcChyZXF1ZXN0LnJlc3VsdCksIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIHdyYXAocmVxdWVzdC50cmFuc2FjdGlvbiksIGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICBvcGVuUHJvbWlzZVxuICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgaWYgKHRlcm1pbmF0ZWQpXG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHRlcm1pbmF0ZWQoKSk7XG4gICAgICAgIGlmIChibG9ja2luZykge1xuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcigndmVyc2lvbmNoYW5nZScsIChldmVudCkgPT4gYmxvY2tpbmcoZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pO1xuICAgIHJldHVybiBvcGVuUHJvbWlzZTtcbn1cbi8qKlxuICogRGVsZXRlIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURCKG5hbWUsIHsgYmxvY2tlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLmRlbGV0ZURhdGFiYXNlKG5hbWUpO1xuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gd3JhcChyZXF1ZXN0KS50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG59XG5cbmNvbnN0IHJlYWRNZXRob2RzID0gWydnZXQnLCAnZ2V0S2V5JywgJ2dldEFsbCcsICdnZXRBbGxLZXlzJywgJ2NvdW50J107XG5jb25zdCB3cml0ZU1ldGhvZHMgPSBbJ3B1dCcsICdhZGQnLCAnZGVsZXRlJywgJ2NsZWFyJ107XG5jb25zdCBjYWNoZWRNZXRob2RzID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkge1xuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIElEQkRhdGFiYXNlICYmXG4gICAgICAgICEocHJvcCBpbiB0YXJnZXQpICYmXG4gICAgICAgIHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkTWV0aG9kcy5nZXQocHJvcCkpXG4gICAgICAgIHJldHVybiBjYWNoZWRNZXRob2RzLmdldChwcm9wKTtcbiAgICBjb25zdCB0YXJnZXRGdW5jTmFtZSA9IHByb3AucmVwbGFjZSgvRnJvbUluZGV4JC8sICcnKTtcbiAgICBjb25zdCB1c2VJbmRleCA9IHByb3AgIT09IHRhcmdldEZ1bmNOYW1lO1xuICAgIGNvbnN0IGlzV3JpdGUgPSB3cml0ZU1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpO1xuICAgIGlmIChcbiAgICAvLyBCYWlsIGlmIHRoZSB0YXJnZXQgZG9lc24ndCBleGlzdCBvbiB0aGUgdGFyZ2V0LiBFZywgZ2V0QWxsIGlzbid0IGluIEVkZ2UuXG4gICAgISh0YXJnZXRGdW5jTmFtZSBpbiAodXNlSW5kZXggPyBJREJJbmRleCA6IElEQk9iamVjdFN0b3JlKS5wcm90b3R5cGUpIHx8XG4gICAgICAgICEoaXNXcml0ZSB8fCByZWFkTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbWV0aG9kID0gYXN5bmMgZnVuY3Rpb24gKHN0b3JlTmFtZSwgLi4uYXJncykge1xuICAgICAgICAvLyBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiB1bmRlZmluZWQgZ3ppcHBzIGJldHRlciwgYnV0IGZhaWxzIGluIEVkZ2UgOihcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLnRyYW5zYWN0aW9uKHN0b3JlTmFtZSwgaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogJ3JlYWRvbmx5Jyk7XG4gICAgICAgIGxldCB0YXJnZXQgPSB0eC5zdG9yZTtcbiAgICAgICAgaWYgKHVzZUluZGV4KVxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmluZGV4KGFyZ3Muc2hpZnQoKSk7XG4gICAgICAgIC8vIE11c3QgcmVqZWN0IGlmIG9wIHJlamVjdHMuXG4gICAgICAgIC8vIElmIGl0J3MgYSB3cml0ZSBvcGVyYXRpb24sIG11c3QgcmVqZWN0IGlmIHR4LmRvbmUgcmVqZWN0cy5cbiAgICAgICAgLy8gTXVzdCByZWplY3Qgd2l0aCBvcCByZWplY3Rpb24gZmlyc3QuXG4gICAgICAgIC8vIE11c3QgcmVzb2x2ZSB3aXRoIG9wIHZhbHVlLlxuICAgICAgICAvLyBNdXN0IGhhbmRsZSBib3RoIHByb21pc2VzIChubyB1bmhhbmRsZWQgcmVqZWN0aW9ucylcbiAgICAgICAgcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0YXJnZXRbdGFyZ2V0RnVuY05hbWVdKC4uLmFyZ3MpLFxuICAgICAgICAgICAgaXNXcml0ZSAmJiB0eC5kb25lLFxuICAgICAgICBdKSlbMF07XG4gICAgfTtcbiAgICBjYWNoZWRNZXRob2RzLnNldChwcm9wLCBtZXRob2QpO1xuICAgIHJldHVybiBtZXRob2Q7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldDogKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSxcbiAgICBoYXM6ICh0YXJnZXQsIHByb3ApID0+ICEhZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCksXG59KSk7XG5cbmNvbnN0IGFkdmFuY2VNZXRob2RQcm9wcyA9IFsnY29udGludWUnLCAnY29udGludWVQcmltYXJ5S2V5JywgJ2FkdmFuY2UnXTtcbmNvbnN0IG1ldGhvZE1hcCA9IHt9O1xuY29uc3QgYWR2YW5jZVJlc3VsdHMgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgY3Vyc29ySXRlcmF0b3JUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICghYWR2YW5jZU1ldGhvZFByb3BzLmluY2x1ZGVzKHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgbGV0IGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF07XG4gICAgICAgIGlmICghY2FjaGVkRnVuYykge1xuICAgICAgICAgICAgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgYWR2YW5jZVJlc3VsdHMuc2V0KHRoaXMsIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LmdldCh0aGlzKVtwcm9wXSguLi5hcmdzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZWRGdW5jO1xuICAgIH0sXG59O1xuYXN5bmMgZnVuY3Rpb24qIGl0ZXJhdGUoLi4uYXJncykge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby10aGlzLWFzc2lnbm1lbnRcbiAgICBsZXQgY3Vyc29yID0gdGhpcztcbiAgICBpZiAoIShjdXJzb3IgaW5zdGFuY2VvZiBJREJDdXJzb3IpKSB7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5vcGVuQ3Vyc29yKC4uLmFyZ3MpO1xuICAgIH1cbiAgICBpZiAoIWN1cnNvcilcbiAgICAgICAgcmV0dXJuO1xuICAgIGN1cnNvciA9IGN1cnNvcjtcbiAgICBjb25zdCBwcm94aWVkQ3Vyc29yID0gbmV3IFByb3h5KGN1cnNvciwgY3Vyc29ySXRlcmF0b3JUcmFwcyk7XG4gICAgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuc2V0KHByb3hpZWRDdXJzb3IsIGN1cnNvcik7XG4gICAgLy8gTWFwIHRoaXMgZG91YmxlLXByb3h5IGJhY2sgdG8gdGhlIG9yaWdpbmFsLCBzbyBvdGhlciBjdXJzb3IgbWV0aG9kcyB3b3JrLlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJveGllZEN1cnNvciwgdW53cmFwKGN1cnNvcikpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgeWllbGQgcHJveGllZEN1cnNvcjtcbiAgICAgICAgLy8gSWYgb25lIG9mIHRoZSBhZHZhbmNpbmcgbWV0aG9kcyB3YXMgbm90IGNhbGxlZCwgY2FsbCBjb250aW51ZSgpLlxuICAgICAgICBjdXJzb3IgPSBhd2FpdCAoYWR2YW5jZVJlc3VsdHMuZ2V0KHByb3hpZWRDdXJzb3IpIHx8IGN1cnNvci5jb250aW51ZSgpKTtcbiAgICAgICAgYWR2YW5jZVJlc3VsdHMuZGVsZXRlKHByb3hpZWRDdXJzb3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkge1xuICAgIHJldHVybiAoKHByb3AgPT09IFN5bWJvbC5hc3luY0l0ZXJhdG9yICYmXG4gICAgICAgIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlLCBJREJDdXJzb3JdKSkgfHxcbiAgICAgICAgKHByb3AgPT09ICdpdGVyYXRlJyAmJiBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZV0pKSk7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmIChpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGU7XG4gICAgICAgIHJldHVybiBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIHJldHVybiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApO1xuICAgIH0sXG59KSk7XG5cbmV4cG9ydCB7IGRlbGV0ZURCLCBvcGVuREIsIHVud3JhcCwgd3JhcCB9O1xuIiwgIi8qKlxuICogTm9zdHJLZXkgXHUyMDE0IE1hbmFnZSBQcm9maWxlcyAoZnVsbC1wYWdlKVxuICogTXVsdGktc2VsZWN0LCBidWxrIGRlbGV0ZSwgZHVwbGljYXRlIGRldGVjdGlvbi5cbiAqL1xuXG5pbXBvcnQgeyBnZXRQcm9maWxlcywgZ2V0UHJvZmlsZU5hbWVzLCBnZXRQcm9maWxlSW5kZXgsIGRlbGV0ZVByb2ZpbGUsIGdldE5wdWIgfSBmcm9tICcuLi91dGlsaXRpZXMvdXRpbHMnO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBwcm9maWxlczogW10sICAgICAgIC8vIHsgaW5kZXgsIG5hbWUsIG5wdWIsIGlzQWN0aXZlLCBzZWxlY3RlZCB9XG4gICAgYWN0aXZlSW5kZXg6IG51bGwsXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFByb2ZpbGVzKCkge1xuICAgIGNvbnN0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBuYW1lcyA9IGF3YWl0IGdldFByb2ZpbGVOYW1lcygpO1xuICAgIGNvbnN0IGFjdGl2ZUluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgc3RhdGUuYWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleDtcbiAgICBzdGF0ZS5wcm9maWxlcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgbnB1YiA9ICcnO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbnB1YiA9IGF3YWl0IGdldE5wdWIoaSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIG5wdWIgPSAnKHVuYWJsZSB0byByZWFkKSc7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucHJvZmlsZXMucHVzaCh7XG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldIHx8ICdVbm5hbWVkJyxcbiAgICAgICAgICAgIG5wdWI6IG5wdWIgfHwgJycsXG4gICAgICAgICAgICBpc0FjdGl2ZTogaSA9PT0gYWN0aXZlSW5kZXgsXG4gICAgICAgICAgICBzZWxlY3RlZDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgY29uc3QgbGlzdCA9ICQoJ3Byb2ZpbGUtbGlzdCcpO1xuICAgIGNvbnN0IGNvdW50VGV4dCA9ICQoJ2NvdW50LXRleHQnKTtcbiAgICBjb25zdCB3YXJuaW5nVGV4dCA9ICQoJ3dhcm5pbmctdGV4dCcpO1xuICAgIGNvbnN0IGRlbGV0ZUJ0biA9ICQoJ2RlbGV0ZS1zZWxlY3RlZC1idG4nKTtcbiAgICBjb25zdCBzZWxlY3RBbGxCdG4gPSAkKCdzZWxlY3QtYWxsLWJ0bicpO1xuXG4gICAgaWYgKHN0YXRlLnByb2ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBsaXN0LmlubmVySFRNTCA9ICc8bGkgc3R5bGU9XCJjb2xvcjojYjBiMGE4O3BhZGRpbmc6MjBweDt0ZXh0LWFsaWduOmNlbnRlcjtcIj5ObyBwcm9maWxlcyBmb3VuZC48L2xpPic7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgZHVwbGljYXRlc1xuICAgIGNvbnN0IG5wdWJDb3VudCA9IHt9O1xuICAgIHN0YXRlLnByb2ZpbGVzLmZvckVhY2gocCA9PiB7XG4gICAgICAgIGlmIChwLm5wdWIpIHtcbiAgICAgICAgICAgIG5wdWJDb3VudFtwLm5wdWJdID0gKG5wdWJDb3VudFtwLm5wdWJdIHx8IDApICsgMTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGlzdC5pbm5lckhUTUwgPSBzdGF0ZS5wcm9maWxlcy5tYXAocCA9PiB7XG4gICAgICAgIGNvbnN0IGlzRHVwZSA9IG5wdWJDb3VudFtwLm5wdWJdID4gMTtcbiAgICAgICAgY29uc3QgdHJ1bmNOcHViID0gcC5ucHViICYmIHAubnB1Yi5sZW5ndGggPiAyMFxuICAgICAgICAgICAgPyBwLm5wdWIuc2xpY2UoMCwgMTIpICsgJy4uLicgKyBwLm5wdWIuc2xpY2UoLTgpXG4gICAgICAgICAgICA6IHAubnB1YjtcblxuICAgICAgICByZXR1cm4gYFxuICAgICAgICAgICAgPGxpIGNsYXNzPVwicHJvZmlsZS1pdGVtICR7cC5zZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiAnJ30gJHtwLmlzQWN0aXZlID8gJ2FjdGl2ZS1wcm9maWxlJyA6ICcnfVwiXG4gICAgICAgICAgICAgICAgZGF0YS1pbmRleD1cIiR7cC5pbmRleH1cIiByb2xlPVwib3B0aW9uXCIgYXJpYS1zZWxlY3RlZD1cIiR7cC5zZWxlY3RlZH1cIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJwcm9maWxlLWNoZWNrYm94XCIgZGF0YS1pbmRleD1cIiR7cC5pbmRleH1cIlxuICAgICAgICAgICAgICAgICAgICAke3Auc2VsZWN0ZWQgPyAnY2hlY2tlZCcgOiAnJ30gJHtwLmlzQWN0aXZlICYmIHN0YXRlLnByb2ZpbGVzLmxlbmd0aCA+IDEgPyAnJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiU2VsZWN0ICR7cC5uYW1lfVwiIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2ZpbGUtaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZmlsZS1uYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAke2VzY2FwZUh0bWwocC5uYW1lKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICR7aXNEdXBlID8gJyA8c3BhbiBzdHlsZT1cImNvbG9yOiNmOTI2NzI7Zm9udC1zaXplOjAuNzVyZW07XCI+KGR1cGxpY2F0ZSk8L3NwYW4+JyA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInByb2ZpbGUtbnB1YlwiPiR7ZXNjYXBlSHRtbCh0cnVuY05wdWIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICR7cC5pc0FjdGl2ZSA/ICc8c3BhbiBjbGFzcz1cInByb2ZpbGUtYWN0aXZlLWJhZGdlXCI+QWN0aXZlPC9zcGFuPicgOiAnJ31cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIGA7XG4gICAgfSkuam9pbignJyk7XG5cbiAgICAvLyBCaW5kIGNoZWNrYm94IGV2ZW50c1xuICAgIGxpc3QucXVlcnlTZWxlY3RvckFsbCgnLnByb2ZpbGUtY2hlY2tib3gnKS5mb3JFYWNoKGNiID0+IHtcbiAgICAgICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGUudGFyZ2V0LmRhdGFzZXQuaW5kZXgsIDEwKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2ZpbGUgPSBzdGF0ZS5wcm9maWxlcy5maW5kKHAgPT4gcC5pbmRleCA9PT0gaWR4KTtcbiAgICAgICAgICAgIGlmIChwcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgcHJvZmlsZS5zZWxlY3RlZCA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gQmluZCByb3cgY2xpY2sgdG8gdG9nZ2xlIGNoZWNrYm94XG4gICAgbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcucHJvZmlsZS1pdGVtJykuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQudHlwZSA9PT0gJ2NoZWNrYm94JykgcmV0dXJuOyAvLyBsZXQgY2hlY2tib3ggaGFuZGxlIGl0c2VsZlxuICAgICAgICAgICAgY29uc3QgaWR4ID0gcGFyc2VJbnQoaXRlbS5kYXRhc2V0LmluZGV4LCAxMCk7XG4gICAgICAgICAgICBjb25zdCBwcm9maWxlID0gc3RhdGUucHJvZmlsZXMuZmluZChwID0+IHAuaW5kZXggPT09IGlkeCk7XG4gICAgICAgICAgICBpZiAocHJvZmlsZSkge1xuICAgICAgICAgICAgICAgIHByb2ZpbGUuc2VsZWN0ZWQgPSAhcHJvZmlsZS5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgY291bnRzXG4gICAgY29uc3Qgc2VsZWN0ZWRDb3VudCA9IHN0YXRlLnByb2ZpbGVzLmZpbHRlcihwID0+IHAuc2VsZWN0ZWQpLmxlbmd0aDtcbiAgICBjb25zdCB0b3RhbENvdW50ID0gc3RhdGUucHJvZmlsZXMubGVuZ3RoO1xuICAgIGNvdW50VGV4dC50ZXh0Q29udGVudCA9IGAke3RvdGFsQ291bnR9IHByb2ZpbGUke3RvdGFsQ291bnQgIT09IDEgPyAncycgOiAnJ30gdG90YWxgO1xuXG4gICAgLy8gV2FybmluZyBpZiB0cnlpbmcgdG8gZGVsZXRlIGFsbCBvciBhY3RpdmVcbiAgICBjb25zdCBzZWxlY3RlZEFjdGl2ZSA9IHN0YXRlLnByb2ZpbGVzLnNvbWUocCA9PiBwLnNlbGVjdGVkICYmIHAuaXNBY3RpdmUpO1xuICAgIGNvbnN0IHNlbGVjdGVkQWxsID0gc2VsZWN0ZWRDb3VudCA9PT0gdG90YWxDb3VudDtcblxuICAgIHdhcm5pbmdUZXh0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIGlmIChzZWxlY3RlZEFsbCkge1xuICAgICAgICB3YXJuaW5nVGV4dC50ZXh0Q29udGVudCA9ICdZb3UgbXVzdCBrZWVwIGF0IGxlYXN0IG9uZSBwcm9maWxlLiBUaGUgYWN0aXZlIHByb2ZpbGUgd2lsbCBiZSBrZXB0Lic7XG4gICAgICAgIHdhcm5pbmdUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRBY3RpdmUgJiYgc2VsZWN0ZWRDb3VudCA8IHRvdGFsQ291bnQpIHtcbiAgICAgICAgd2FybmluZ1RleHQudGV4dENvbnRlbnQgPSAnWW91ciBhY3RpdmUgcHJvZmlsZSBpcyBzZWxlY3RlZC4gQSBkaWZmZXJlbnQgcHJvZmlsZSB3aWxsIGJlY29tZSBhY3RpdmUgYWZ0ZXIgZGVsZXRpb24uJztcbiAgICAgICAgd2FybmluZ1RleHQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGJ1dHRvbnNcbiAgICBkZWxldGVCdG4uZGlzYWJsZWQgPSBzZWxlY3RlZENvdW50ID09PSAwO1xuICAgIGRlbGV0ZUJ0bi50ZXh0Q29udGVudCA9IGBEZWxldGUgU2VsZWN0ZWQgKCR7c2VsZWN0ZWRDb3VudH0pYDtcblxuICAgIGNvbnN0IGFsbFNlbGVjdGVkID0gc2VsZWN0ZWRDb3VudCA9PT0gdG90YWxDb3VudDtcbiAgICBzZWxlY3RBbGxCdG4udGV4dENvbnRlbnQgPSBhbGxTZWxlY3RlZCA/ICdEZXNlbGVjdCBBbGwnIDogJ1NlbGVjdCBBbGwnO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVTZWxlY3RlZCgpIHtcbiAgICBsZXQgdG9EZWxldGUgPSBzdGF0ZS5wcm9maWxlcy5maWx0ZXIocCA9PiBwLnNlbGVjdGVkKTtcblxuICAgIC8vIENhbid0IGRlbGV0ZSBhbGwgXHUyMDE0IGtlZXAgdGhlIGFjdGl2ZSBvbmVcbiAgICBpZiAodG9EZWxldGUubGVuZ3RoID09PSBzdGF0ZS5wcm9maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgdG9EZWxldGUgPSB0b0RlbGV0ZS5maWx0ZXIocCA9PiAhcC5pc0FjdGl2ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRvRGVsZXRlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgY291bnQgPSB0b0RlbGV0ZS5sZW5ndGg7XG4gICAgaWYgKCFjb25maXJtKGBEZWxldGUgJHtjb3VudH0gcHJvZmlsZSR7Y291bnQgIT09IDEgPyAncycgOiAnJ30/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS5gKSkgcmV0dXJuO1xuXG4gICAgLy8gRGVsZXRlIGZyb20gaGlnaGVzdCBpbmRleCBmaXJzdCBzbyBpbmRpY2VzIGRvbid0IHNoaWZ0XG4gICAgY29uc3QgaW5kaWNlcyA9IHRvRGVsZXRlLm1hcChwID0+IHAuaW5kZXgpLnNvcnQoKGEsIGIpID0+IGIgLSBhKTtcblxuICAgIGZvciAoY29uc3QgaWR4IG9mIGluZGljZXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGRlbGV0ZVByb2ZpbGUoaWR4KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGRlbGV0ZSBwcm9maWxlICR7aWR4fTpgLCBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN1Y2Nlc3NUZXh0ID0gJCgnc3VjY2Vzcy10ZXh0Jyk7XG4gICAgc3VjY2Vzc1RleHQudGV4dENvbnRlbnQgPSBgRGVsZXRlZCAke2NvdW50fSBwcm9maWxlJHtjb3VudCAhPT0gMSA/ICdzJyA6ICcnfS5gO1xuICAgIHN1Y2Nlc3NUZXh0LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gc3VjY2Vzc1RleHQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyksIDMwMDApO1xuXG4gICAgYXdhaXQgbG9hZFByb2ZpbGVzKCk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZVNlbGVjdEFsbCgpIHtcbiAgICBjb25zdCBhbGxTZWxlY3RlZCA9IHN0YXRlLnByb2ZpbGVzLmV2ZXJ5KHAgPT4gcC5zZWxlY3RlZCk7XG4gICAgc3RhdGUucHJvZmlsZXMuZm9yRWFjaChwID0+IHsgcC5zZWxlY3RlZCA9ICFhbGxTZWxlY3RlZDsgfSk7XG4gICAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgaWYgKCFzdHIpIHJldHVybiAnJztcbiAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn1cblxuLy8gSW5pdFxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBsb2FkUHJvZmlsZXMoKTtcblxuICAgICQoJ2RlbGV0ZS1zZWxlY3RlZC1idG4nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlbGV0ZVNlbGVjdGVkKTtcbiAgICAkKCdzZWxlY3QtYWxsLWJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlU2VsZWN0QWxsKTtcbn0pO1xuIiwgImltcG9ydCB7IGdldFB1YmxpY0tleVN5bmMgfSBmcm9tICdub3N0ci1jcnlwdG8tdXRpbHMnO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGVuY3J5cHQsIGRlY3J5cHQsIGhhc2hQYXNzd29yZCwgdmVyaWZ5UGFzc3dvcmQgfSBmcm9tICcuL2NyeXB0byc7XG5pbXBvcnQgeyBsb29rc0xpa2VTZWVkUGhyYXNlLCBpc1ZhbGlkU2VlZFBocmFzZSB9IGZyb20gJy4vc2VlZHBocmFzZSc7XG5pbXBvcnQge1xuICAgIHdyYXBTZWNyZXQsXG4gICAgaXNEZXZpY2VLZXlCbG9iLFxuICAgIGlzQ2lwaGVydGV4dCxcbiAgICBkZWNyeXB0V2l0aERldmljZUtleSxcbn0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG5leHBvcnQgeyBpc0RldmljZUtleUJsb2IsIGlzQ2lwaGVydGV4dCB9O1xuXG5jb25zdCBEQl9WRVJTSU9OID0gNjtcbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9SRUxBWVMgPSBbXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZGFtdXMuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5wcmltYWwubmV0JyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuc25vcnQuc29jaWFsJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZ2V0YWxieS5jb20vdjEnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3MubG9sJyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNSkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNiAocGxhdGZvcm0gc3luYyBzdXBwb3J0KS4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS51cGRhdGVkQXQgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS51cGRhdGVkQXQgPSBub3c7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwbGF0Zm9ybVN5bmNFbmFibGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICAvLyBUMC00OiBuZXZlciBwZXJzaXN0IGEgcHJpdmF0ZSBrZXkgYXMgcGxhaW50ZXh0IGhleC4gQSBuZXcgbG9jYWwga2V5IGlzXG4gICAgLy8gd3JhcHBlZCBhdCByZXN0IGltbWVkaWF0ZWx5IChkZXZpY2Uga2V5IGJ5IGRlZmF1bHQsIG9yIHRoZSBwYXNzd29yZFxuICAgIC8vIHNlc3Npb24ga2V5IHdoZW4gb25lIGlzIGFjdGl2ZSBpbiB0aGlzIGNvbnRleHQpLiBUaGUgcHVibGljIGtleSBpcyBjYWNoZWRcbiAgICAvLyBzbyBucHViIGRpc3BsYXkgd29ya3Mgd2l0aG91dCB1bndyYXBwaW5nLlxuICAgIGxldCBwcml2S2V5ID0gJyc7XG4gICAgbGV0IHB1YktleSA9ICcnO1xuICAgIGlmICh0eXBlID09PSAnbG9jYWwnKSB7XG4gICAgICAgIGNvbnN0IGhleCA9IGF3YWl0IGdlbmVyYXRlUHJpdmF0ZUtleSgpO1xuICAgICAgICB0cnkgeyBwdWJLZXkgPSBnZXRQdWJsaWNLZXlTeW5jKGhleCk7IH0gY2F0Y2ggeyAvKiBsZWF2ZSB1bmNhY2hlZCAqLyB9XG4gICAgICAgIHByaXZLZXkgPSBhd2FpdCB3cmFwU2VjcmV0KGhleCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHByaXZLZXksXG4gICAgICAgIHB1YktleSxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBwcm9maWxlc1tpbmRleF0udXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcml2YXRlS2V5KGluZGV4LCBwcml2YXRlS2V5KSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICBwYXlsb2FkOiBbaW5kZXgsIHByaXZhdGVLZXldLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3UHJvZmlsZSgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUoJ05ldyBQcm9maWxlJyk7XG4gICAgcHJvZmlsZXMucHVzaChuZXdQcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3QnVua2VyUHJvZmlsZShuYW1lID0gJ05ldyBCdW5rZXInLCBidW5rZXJVcmwgPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKG5hbWUsICdidW5rZXInKTtcbiAgICBwcm9maWxlLmJ1bmtlclVybCA9IGJ1bmtlclVybDtcbiAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZWxheXMocHJvZmlsZUluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHByb2ZpbGVJbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlzIHx8IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJlbGF5cyhwcm9maWxlSW5kZXgsIHJlbGF5cykge1xuICAgIC8vIEhhdmluZyBhbiBBbHBpbmUgcHJveHkgb2JqZWN0IGFzIGEgc3ViLW9iamVjdCBkb2VzIG5vdCBzZXJpYWxpemUgY29ycmVjdGx5IGluIHN0b3JhZ2UsXG4gICAgLy8gc28gd2UgYXJlIHByZS1zZXJpYWxpemluZyBoZXJlIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gdGhlIHByb2ZpbGUsIHNvIHRoZSBwcm94eVxuICAgIC8vIG9iaiBkb2Vzbid0IGJ1ZyBvdXQuXG4gICAgbGV0IGZpeGVkUmVsYXlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxheXMpKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbcHJvZmlsZUluZGV4XTtcbiAgICBwcm9maWxlLnJlbGF5cyA9IGZpeGVkUmVsYXlzO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGNvbnN0IGhvc3RzID0gcHJvZmlsZT8uaG9zdHMgfHwge307XG4gICAgLy8gTkstMDM6IGdyYW50cyBhcmUgbm93IGtleWVkIG9uIHRoZSBmdWxsIG9yaWdpbiAoc2NoZW1lK2hvc3RbOnBvcnRdKS5cbiAgICBpZiAoaG9zdHNbaG9zdF0/LlthY3Rpb25dKSByZXR1cm4gaG9zdHNbaG9zdF1bYWN0aW9uXTtcbiAgICAvLyBUcmFuc2l0aW9uOiBhY2NlcHQgbGVnYWN5IGdyYW50cyB0aGF0IHdlcmUga2V5ZWQgb24gdGhlIGJhcmUgaG9zdG5hbWUuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gbmV3IFVSTChob3N0KS5ob3N0O1xuICAgICAgICBpZiAobGVnYWN5ICYmIGhvc3RzW2xlZ2FjeV0/LlthY3Rpb25dKSByZXR1cm4gaG9zdHNbbGVnYWN5XVthY3Rpb25dO1xuICAgIH0gY2F0Y2ggeyAvKiBob3N0IHdhcyBub3QgYSBmdWxsIG9yaWdpbjsgbm90aGluZyB0byBtaWdyYXRlICovIH1cbiAgICByZXR1cm4gJ2Fzayc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbiwgcGVybSwgaW5kZXggPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbaW5kZXhdO1xuICAgIGxldCBuZXdQZXJtcyA9IHByb2ZpbGUuaG9zdHNbaG9zdF0gfHwge307XG4gICAgbmV3UGVybXMgPSB7IC4uLm5ld1Blcm1zLCBbYWN0aW9uXTogcGVybSB9O1xuICAgIHByb2ZpbGUuaG9zdHNbaG9zdF0gPSBuZXdQZXJtcztcbiAgICBwcm9maWxlLnVwZGF0ZWRBdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIHByb2ZpbGVzW2luZGV4XSA9IHByb2ZpbGU7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuUGVybWlzc2lvbihwKSB7XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZSB3aGVyZSBldmVudCBzaWduaW5nIGluY2x1ZGVzIGEga2luZCBudW1iZXJcbiAgICBpZiAocC5zdGFydHNXaXRoKCdzaWduRXZlbnQ6JykpIHtcbiAgICAgICAgbGV0IFtlLCBuXSA9IHAuc3BsaXQoJzonKTtcbiAgICAgICAgbiA9IHBhcnNlSW50KG4pO1xuICAgICAgICBsZXQgbm5hbWUgPSBLSU5EUy5maW5kKGsgPT4ga1swXSA9PT0gbik/LlsxXSB8fCBgVW5rbm93biAoS2luZCAke259KWA7XG4gICAgICAgIHJldHVybiBgU2lnbiBldmVudDogJHtubmFtZX1gO1xuICAgIH1cblxuICAgIHN3aXRjaCAocCkge1xuICAgICAgICBjYXNlICdnZXRQdWJLZXknOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHB1YmxpYyBrZXknO1xuICAgICAgICBjYXNlICdzaWduRXZlbnQnOlxuICAgICAgICAgICAgcmV0dXJuICdTaWduIGV2ZW50JztcbiAgICAgICAgY2FzZSAnZ2V0UmVsYXlzJzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCByZWxheSBsaXN0JztcbiAgICAgICAgY2FzZSAnbmlwMDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwMDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnVW5rbm93bic7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVLZXkoa2V5KSB7XG4gICAgY29uc3QgaGV4TWF0Y2ggPSAvXltcXGRhLWZdezY0fSQvaS50ZXN0KGtleSk7XG4gICAgY29uc3QgYjMyTWF0Y2ggPSAvXm5zZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXXs1OH0kLy50ZXN0KGtleSk7XG5cbiAgICByZXR1cm4gaGV4TWF0Y2ggfHwgYjMyTWF0Y2ggfHwgaXNOY3J5cHRzZWMoa2V5KSB8fCBpc1ZhbGlkU2VlZFBocmFzZShrZXkpO1xufVxuXG5leHBvcnQgeyBsb29rc0xpa2VTZWVkUGhyYXNlIH07XG5leHBvcnQgY29uc3QgaXNTZWVkUGhyYXNlID0gaXNWYWxpZFNlZWRQaHJhc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05jcnlwdHNlYyhrZXkpIHtcbiAgICByZXR1cm4gL15uY3J5cHRzZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXSskLy50ZXN0KGtleSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZWF0dXJlKG5hbWUpIHtcbiAgICBsZXQgZm5hbWUgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICBsZXQgZiA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtmbmFtZV06IGZhbHNlIH0pO1xuICAgIHJldHVybiBmW2ZuYW1lXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheVJlbWluZGVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlUmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHByb2ZpbGVzW2luZGV4XS5yZWxheVJlbWluZGVyID0gZmFsc2U7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5wdWIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICB9KTtcbn1cblxuLy8gLS0tIE1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgbWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaXMgYWN0aXZlLlxuICpcbiAqIERlZmVuc2l2ZTogY2hlY2tzIG11bHRpcGxlIGluZGljYXRvcnMsIG5vdCBqdXN0IHRoZSBib29sZWFuIGZsYWcuXG4gKiBJZiBwYXNzd29yZEhhc2ggb3IgZW5jcnlwdGVkIGtleSBibG9icyBleGlzdCBidXQgdGhlIGlzRW5jcnlwdGVkIGZsYWdcbiAqIGlzIGZhbHNlIChpbmNvbnNpc3RlbnQgc3RhdGUgZnJvbSBzZXJ2aWNlIHdvcmtlciBjcmFzaCwgcmFjZSBjb25kaXRpb24sXG4gKiBldGMuKSwgc2VsZi1oZWFscyBieSBzZXR0aW5nIHRoZSBmbGFnIGJhY2sgdG8gdHJ1ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRW5jcnlwdGVkKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKGRhdGEuaXNFbmNyeXB0ZWQpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gRmFsbGJhY2sgMTogcGFzc3dvcmRIYXNoIGV4aXN0cyBidXQgZmxhZyBpcyBzdGFsZVxuICAgIGlmIChkYXRhLnBhc3N3b3JkSGFzaCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjayAyOiBlbmNyeXB0ZWQgYmxvYnMgZXhpc3QgaW4gcHJvZmlsZXMgYnV0IGZsYWcgKyBoYXNoIGFyZSBtaXNzaW5nXG4gICAgZm9yIChjb25zdCBwcm9maWxlIG9mIGRhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogU3RvcmUgdGhlIHBhc3N3b3JkIHZlcmlmaWNhdGlvbiBoYXNoIChuZXZlciB0aGUgcGFzc3dvcmQgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IHRoZSBzdG9yZWQgaGFzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbiAgICBpZiAoIWRhdGEucGFzc3dvcmRIYXNoIHx8ICFkYXRhLnBhc3N3b3JkU2FsdCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgZGF0YS5wYXNzd29yZEhhc2gsIGRhdGEucGFzc3dvcmRTYWx0KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgbWFzdGVyIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IGNsZWFycyBoYXNoIGFuZCBkZWNyeXB0cyBhbGwga2V5cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVBhc3N3b3JkUHJvdGVjdGlvbihwYXNzd29yZCkge1xuICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgY2hlY2tQYXNzd29yZChwYXNzd29yZCk7XG4gICAgaWYgKCF2YWxpZCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XG5cbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgLy8gRGVjcnlwdCB0byBoZXgsIHRoZW4gUkUtV1JBUCB1bmRlciB0aGUgZGV2aWNlIGtleS4gUmVtb3ZpbmcgdGhlXG4gICAgICAgIC8vIHBhc3N3b3JkIG11c3QgbmV2ZXIgZG93bmdyYWRlIGEga2V5IHRvIHBsYWludGV4dCBhdCByZXN0IChUMC00KS5cbiAgICAgICAgY29uc3QgaGV4ID0gYXdhaXQgdG9IZXhQcml2S2V5KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgaWYgKGhleCkgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IHdyYXBTZWNyZXQoaGV4KTtcbiAgICB9XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IGFsbCBwcm9maWxlIHByaXZhdGUga2V5cyB3aXRoIGEgbWFzdGVyIHBhc3N3b3JkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEFsbEtleXMocGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkgY29udGludWU7IC8vIGFscmVhZHkgcGFzc3dvcmQtZW5jcnlwdGVkXG4gICAgICAgIC8vIFVud3JhcCBkZXZpY2Utd3JhcHBlZCBvciBwbGFpbnRleHQga2V5cyB0byBoZXgsIHRoZW4gcGFzc3dvcmQtZW5jcnlwdC5cbiAgICAgICAgY29uc3QgaGV4ID0gaXNEZXZpY2VLZXlCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpXG4gICAgICAgICAgICA/IGF3YWl0IGRlY3J5cHRXaXRoRGV2aWNlS2V5KHByb2ZpbGVzW2ldLnByaXZLZXkpXG4gICAgICAgICAgICA6IHByb2ZpbGVzW2ldLnByaXZLZXk7XG4gICAgICAgIGlmIChoZXgpIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KGhleCwgcGFzc3dvcmQpO1xuICAgIH1cbiAgICBhd2FpdCBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbi8qKlxuICogUmUtZW5jcnlwdCBhbGwga2V5cyB3aXRoIGEgbmV3IHBhc3N3b3JkIChyZXF1aXJlcyB0aGUgb2xkIHBhc3N3b3JkKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkRm9yS2V5cyhvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgaGV4ID0gYXdhaXQgdG9IZXhQcml2S2V5KHByb2ZpbGVzW2ldLnByaXZLZXksIG9sZFBhc3N3b3JkKTtcbiAgICAgICAgaWYgKCFoZXgpIGNvbnRpbnVlO1xuICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChoZXgsIG5ld1Bhc3N3b3JkKTtcbiAgICB9XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgc2luZ2xlIHByb2ZpbGUncyBwcml2YXRlIGtleSwgcmV0dXJuaW5nIHRoZSBoZXggc3RyaW5nLlxuICogSGFuZGxlcyBwYXNzd29yZCBibG9icyAodmlhIHBhc3N3b3JkKSwgZGV2aWNlLXdyYXBwZWQgYmxvYnMgKHZpYSBkZXZpY2Uga2V5KSxcbiAqIGFuZCBsZWdhY3kgcGxhaW50ZXh0IChyZXR1cm5lZCBhcy1pcykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWNyeXB0ZWRQcml2S2V5KHByb2ZpbGUsIHBhc3N3b3JkKSB7XG4gICAgaWYgKHByb2ZpbGUudHlwZSA9PT0gJ2J1bmtlcicpIHJldHVybiAnJztcbiAgICByZXR1cm4gdG9IZXhQcml2S2V5KHByb2ZpbGUucHJpdktleSwgcGFzc3dvcmQpO1xufVxuXG4vKipcbiAqIFJlc29sdmUgYW55IHN0b3JlZCBwcml2YXRlLWtleSByZXByZXNlbnRhdGlvbiB0byByYXcgaGV4LlxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZCAgIHBhc3N3b3JkIGJsb2IgfCBkZXZpY2UgYmxvYiB8IHBsYWludGV4dCBoZXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCBtYXN0ZXIgcGFzc3dvcmQgKG9ubHkgbmVlZGVkIGZvciBwYXNzd29yZCBibG9icylcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvSGV4UHJpdktleShzdG9yZWQsIHBhc3N3b3JkKSB7XG4gICAgaWYgKCFzdG9yZWQpIHJldHVybiBzdG9yZWQ7XG4gICAgaWYgKGlzRW5jcnlwdGVkQmxvYihzdG9yZWQpKSByZXR1cm4gZGVjcnlwdChzdG9yZWQsIHBhc3N3b3JkKTtcbiAgICBpZiAoaXNEZXZpY2VLZXlCbG9iKHN0b3JlZCkpIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleShzdG9yZWQpO1xuICAgIHJldHVybiBzdG9yZWQ7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHN0b3JlZCB2YWx1ZSBsb29rcyBsaWtlIGFuIGVuY3J5cHRlZCBibG9iLlxuICogRW5jcnlwdGVkIGJsb2JzIGFyZSBKU09OIHN0cmluZ3MgY29udGFpbmluZyB7c2FsdCwgaXYsIGNpcGhlcnRleHR9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbmNyeXB0ZWRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHBhcnNlZC5zYWx0ICYmIHBhcnNlZC5pdiAmJiBwYXJzZWQuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5vc3RyLWNyeXB0by11dGlsc1xuICogQGRlc2NyaXB0aW9uIENvcmUgY3J5cHRvZ3JhcGhpYyB1dGlsaXRpZXMgZm9yIE5vc3RyIHByb3RvY29sXG4gKi9cblxuLy8gQ29yZSB0eXBlc1xuZXhwb3J0IHR5cGUge1xuICBOb3N0ckV2ZW50LFxuICBVbnNpZ25lZE5vc3RyRXZlbnQsXG4gIFNpZ25lZE5vc3RyRXZlbnQsXG4gIE5vc3RyRmlsdGVyLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgUHVibGljS2V5LFxuICBLZXlQYWlyLFxuICBOb3N0ck1lc3NhZ2VUdXBsZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIEV2ZW50IGtpbmRzLCBtZXNzYWdlIHR5cGVzLCBhbmQgTklQLTQ2IHR5cGVzXG5leHBvcnQgeyBOb3N0ckV2ZW50S2luZCwgTm9zdHJNZXNzYWdlVHlwZSwgTmlwNDZNZXRob2QgfSBmcm9tICcuL3R5cGVzJztcbmV4cG9ydCB0eXBlIHtcbiAgTmlwNDZSZXF1ZXN0LFxuICBOaXA0NlJlc3BvbnNlLFxuICBOaXA0NlNlc3Npb24sXG4gIE5pcDQ2U2Vzc2lvbkluZm8sXG4gIEJ1bmtlclVSSSxcbiAgQnVua2VyVmFsaWRhdGlvblJlc3VsdCxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIENvcmUgY3J5cHRvIGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgZ2VuZXJhdGVLZXlQYWlyLFxuICBnZXRQdWJsaWNLZXksXG4gIGdldFB1YmxpY0tleVN5bmMsXG4gIHZhbGlkYXRlS2V5UGFpcixcbiAgY3JlYXRlRXZlbnQsXG4gIHNpZ25FdmVudCxcbiAgZmluYWxpemVFdmVudCxcbiAgdmVyaWZ5U2lnbmF0dXJlLFxuICBlbmNyeXB0LFxuICBkZWNyeXB0LFxufSBmcm9tICcuL2NyeXB0byc7XG5cbi8vIFZhbGlkYXRpb24gZnVuY3Rpb25zXG5leHBvcnQge1xuICB2YWxpZGF0ZUV2ZW50LFxuICB2YWxpZGF0ZUV2ZW50SWQsXG4gIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUsXG4gIHZhbGlkYXRlU2lnbmVkRXZlbnQsXG4gIHZhbGlkYXRlRXZlbnRCYXNlLFxuICB2YWxpZGF0ZUZpbHRlcixcbiAgdmFsaWRhdGVTdWJzY3JpcHRpb24sXG4gIHZhbGlkYXRlUmVzcG9uc2UsXG59IGZyb20gJy4vdmFsaWRhdGlvbic7XG5cbi8vIEV2ZW50IGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgY2FsY3VsYXRlRXZlbnRJZCxcbn0gZnJvbSAnLi9ldmVudCc7XG5cbi8vIE5JUC0wNCBlbmNyeXB0aW9uXG5leHBvcnQge1xuICBjb21wdXRlU2hhcmVkU2VjcmV0LFxuICBlbmNyeXB0TWVzc2FnZSxcbiAgZGVjcnlwdE1lc3NhZ2UsXG59IGZyb20gJy4vbmlwcy9uaXAtMDQnO1xuXG4vLyBSZS1leHBvcnQgTklQc1xuZXhwb3J0ICogYXMgbmlwMDEgZnJvbSAnLi9uaXBzL25pcC0wMSc7XG5leHBvcnQgKiBhcyBuaXAwNCBmcm9tICcuL25pcHMvbmlwLTA0JztcbmV4cG9ydCAqIGFzIG5pcDE5IGZyb20gJy4vbmlwcy9uaXAtMTknO1xuZXhwb3J0ICogYXMgbmlwMjYgZnJvbSAnLi9uaXBzL25pcC0yNic7XG5leHBvcnQgKiBhcyBuaXA0NCBmcm9tICcuL25pcHMvbmlwLTQ0JztcbmV4cG9ydCAqIGFzIG5pcDQ2IGZyb20gJy4vbmlwcy9uaXAtNDYnO1xuZXhwb3J0ICogYXMgbmlwNDkgZnJvbSAnLi9uaXBzL25pcC00OSc7XG5cbi8vIFV0aWxzXG5leHBvcnQge1xuICBoZXhUb0J5dGVzLFxuICBieXRlc1RvSGV4LFxuICB1dGY4VG9CeXRlcyxcbiAgYnl0ZXNUb1V0ZjgsXG59IGZyb20gJy4vdXRpbHMvZW5jb2RpbmcnO1xuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlc1xuICogQGRlc2NyaXB0aW9uIFR5cGUgZGVmaW5pdGlvbnMgZm9yIE5vc3RyXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXlEZXRhaWxzIHtcbiAgaGV4OiBzdHJpbmc7XG4gIGJ5dGVzOiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEtleVBhaXIge1xuICBwcml2YXRlS2V5OiBzdHJpbmc7XG4gIHB1YmxpY0tleTogUHVibGljS2V5RGV0YWlscztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ckV2ZW50IHtcbiAga2luZDogbnVtYmVyO1xuICBjcmVhdGVkX2F0OiBudW1iZXI7XG4gIHRhZ3M6IHN0cmluZ1tdW107XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgcHVia2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVkTm9zdHJFdmVudCBleHRlbmRzIE5vc3RyRXZlbnQge1xuICBpZDogc3RyaW5nO1xuICBzaWc6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXkge1xuICBoZXg6IHN0cmluZztcbiAgYnl0ZXM/OiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gTm9zdHJFdmVudEtpbmQge1xuICBTRVRfTUVUQURBVEEgPSAwLFxuICBURVhUX05PVEUgPSAxLFxuICBSRUNPTU1FTkRfU0VSVkVSID0gMixcbiAgQ09OVEFDVF9MSVNUID0gMyxcbiAgRU5DUllQVEVEX0RJUkVDVF9NRVNTQUdFID0gNCxcbiAgREVMRVRFID0gNSxcbiAgUkVQT1NUID0gNixcbiAgUkVBQ1RJT04gPSA3LFxuICBCQURHRV9BV0FSRCA9IDgsXG4gIENIQU5ORUxfQ1JFQVRFID0gNDAsXG4gIENIQU5ORUxfTUVUQURBVEEgPSA0MSxcbiAgQ0hBTk5FTF9NRVNTQUdFID0gNDIsXG4gIENIQU5ORUxfSElERV9NRVNTQUdFID0gNDMsXG4gIENIQU5ORUxfTVVURV9VU0VSID0gNDQsXG4gIENIQU5ORUxfUkVTRVJWRSA9IDQ1LFxuICBSRVBPUlRJTkcgPSAxOTg0LFxuICBaQVBfUkVRVUVTVCA9IDk3MzQsXG4gIFpBUCA9IDk3MzUsXG4gIE1VVEVfTElTVCA9IDEwMDAwLFxuICBQSU5fTElTVCA9IDEwMDAxLFxuICBSRUxBWV9MSVNUX01FVEFEQVRBID0gMTAwMDIsXG4gIENMSUVOVF9BVVRIID0gMjIyNDIsXG4gIEFVVEhfUkVTUE9OU0UgPSAyMjI0MyxcbiAgTk9TVFJfQ09OTkVDVCA9IDI0MTMzLFxuICBDQVRFR09SSVpFRF9QRU9QTEUgPSAzMDAwMCxcbiAgQ0FURUdPUklaRURfQk9PS01BUktTID0gMzAwMDEsXG4gIFBST0ZJTEVfQkFER0VTID0gMzAwMDgsXG4gIEJBREdFX0RFRklOSVRJT04gPSAzMDAwOSxcbiAgTE9OR19GT1JNID0gMzAwMjMsXG4gIEFQUExJQ0FUSU9OX1NQRUNJRklDID0gMzAwNzhcbn1cblxuLyoqXG4gKiBSZS1leHBvcnQgYWxsIHR5cGVzIGZyb20gYmFzZSBtb2R1bGVcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICovXG5leHBvcnQgKiBmcm9tICcuL2Jhc2UnO1xuXG4vKiogUmUtZXhwb3J0IHByb3RvY29sIHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIFJlLWV4cG9ydCBtZXNzYWdlIHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL21lc3NhZ2VzJztcblxuLyoqIFJlLWV4cG9ydCB0eXBlIGd1YXJkcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9ndWFyZHMnO1xuXG4vLyBSZS1leHBvcnQgTklQLTE5IHR5cGVzXG5leHBvcnQgdHlwZSB7XG4gIE5pcDE5RGF0YVR5cGVcbn0gZnJvbSAnLi4vbmlwcy9uaXAtMTknO1xuXG4vKiogUmUtZXhwb3J0IE5JUC00NiB0eXBlcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9uaXA0Nic7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL2Jhc2VcbiAqIEBkZXNjcmlwdGlvbiBDb3JlIHR5cGUgZGVmaW5pdGlvbnMgZm9yIE5vc3RyIHByb3RvY29sXG4gKi9cblxuLy8gS2V5IFR5cGVzXG5leHBvcnQgdHlwZSBQdWJsaWNLZXlIZXggPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBQcml2YXRlS2V5SGV4ID0gc3RyaW5nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleURldGFpbHMge1xuICAvKiogUHVibGljIGtleSBpbiBoZXggZm9ybWF0ICovXG4gIGhleDogc3RyaW5nO1xuICAvKiogTklQLTA1IGlkZW50aWZpZXIgKi9cbiAgbmlwMDU6IHN0cmluZztcbiAgLyoqIFB1YmxpYyBrZXkgaW4gYnl0ZXMgZm9ybWF0ICovXG4gIGJ5dGVzOiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgdHlwZSBQdWJsaWNLZXkgPSBQdWJsaWNLZXlIZXggfCBQdWJsaWNLZXlEZXRhaWxzO1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleVBhaXIge1xuICAvKiogUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdCAqL1xuICBwcml2YXRlS2V5OiBQcml2YXRlS2V5SGV4O1xuICAvKiogUHVibGljIGtleSBkZXRhaWxzICovXG4gIHB1YmxpY0tleTogUHVibGljS2V5RGV0YWlscztcbn1cblxuLy8gRXZlbnQgVHlwZXNcbmV4cG9ydCBlbnVtIE5vc3RyRXZlbnRLaW5kIHtcbiAgLy8gTklQLTAxOiBDb3JlIFByb3RvY29sXG4gIFNFVF9NRVRBREFUQSA9IDAsXG4gIFRFWFRfTk9URSA9IDEsXG4gIFJFQ09NTUVORF9TRVJWRVIgPSAyLFxuICBDT05UQUNUUyA9IDMsXG4gIEVOQ1JZUFRFRF9ESVJFQ1RfTUVTU0FHRSA9IDQsXG4gIEVWRU5UX0RFTEVUSU9OID0gNSxcbiAgUkVQT1NUID0gNixcbiAgUkVBQ1RJT04gPSA3LFxuXG4gIC8vIE5JUC0yODogUHVibGljIENoYXRcbiAgQ0hBTk5FTF9DUkVBVElPTiA9IDQwLFxuICBDSEFOTkVMX01FVEFEQVRBID0gNDEsXG4gIENIQU5ORUxfTUVTU0FHRSA9IDQyLFxuICBDSEFOTkVMX0hJREVfTUVTU0FHRSA9IDQzLFxuICBDSEFOTkVMX01VVEVfVVNFUiA9IDQ0LFxuXG4gIC8vIE5JUC00MjogQXV0aGVudGljYXRpb25cbiAgQVVUSCA9IDIyMjQyLFxuICBBVVRIX1JFU1BPTlNFID0gMjIyNDNcbn1cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgTm9zdHIgZXZlbnRzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VOb3N0ckV2ZW50IHtcbiAgLyoqIEV2ZW50IGtpbmQgYXMgZGVmaW5lZCBpbiBOSVBzICovXG4gIGtpbmQ6IG51bWJlcjtcbiAgLyoqIENvbnRlbnQgb2YgdGhlIGV2ZW50ICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIEFycmF5IG9mIHRhZ3MgKi9cbiAgdGFnczogc3RyaW5nW11bXTtcbiAgLyoqIFVuaXggdGltZXN0YW1wIGluIHNlY29uZHMgKi9cbiAgY3JlYXRlZF9hdDogbnVtYmVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBldmVudHMgdGhhdCBoYXZlbid0IGJlZW4gc2lnbmVkIHlldCAqL1xuZXhwb3J0IGludGVyZmFjZSBVbnNpZ25lZE5vc3RyRXZlbnQgZXh0ZW5kcyBCYXNlTm9zdHJFdmVudCB7XG4gIC8qKiBPcHRpb25hbCBwdWJsaWMga2V5ICovXG4gIHB1YmtleT86IHN0cmluZztcbn1cblxuLyoqIEludGVyZmFjZSBmb3Igc2lnbmVkIGV2ZW50cyAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduZWROb3N0ckV2ZW50IGV4dGVuZHMgQmFzZU5vc3RyRXZlbnQge1xuICAvKiogUHVibGljIGtleSBvZiB0aGUgZXZlbnQgY3JlYXRvciAqL1xuICBwdWJrZXk6IHN0cmluZztcbiAgLyoqIEV2ZW50IElEIChzaGEyNTYgb2YgdGhlIHNlcmlhbGl6ZWQgZXZlbnQpICovXG4gIGlkOiBzdHJpbmc7XG4gIC8qKiBTY2hub3JyIHNpZ25hdHVyZSBvZiB0aGUgZXZlbnQgSUQgKi9cbiAgc2lnOiBzdHJpbmc7XG59XG5cbi8qKiBBbGlhcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAqL1xuZXhwb3J0IHR5cGUgTm9zdHJFdmVudCA9IFNpZ25lZE5vc3RyRXZlbnQ7XG5cbi8qKiBUeXBlIGZvciBjcmVhdGluZyBuZXcgZXZlbnRzICovXG5leHBvcnQgdHlwZSBVbnNpZ25lZEV2ZW50ID0gT21pdDxOb3N0ckV2ZW50LCAnaWQnIHwgJ3NpZyc+O1xuXG4vLyBGaWx0ZXIgVHlwZXNcbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJGaWx0ZXIge1xuICBpZHM/OiBzdHJpbmdbXTtcbiAgYXV0aG9ycz86IHN0cmluZ1tdO1xuICBraW5kcz86IE5vc3RyRXZlbnRLaW5kW107XG4gIHNpbmNlPzogbnVtYmVyO1xuICB1bnRpbD86IG51bWJlcjtcbiAgbGltaXQ/OiBudW1iZXI7XG4gICcjZSc/OiBzdHJpbmdbXTtcbiAgJyNwJz86IHN0cmluZ1tdO1xuICBzZWFyY2g/OiBzdHJpbmc7XG4gIC8qKiBTdXBwb3J0IGZvciBhcmJpdHJhcnkgdGFncyAoTklQLTEyKSAqL1xuICBba2V5OiBgIyR7c3RyaW5nfWBdOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0clN1YnNjcmlwdGlvbiB7XG4gIGlkOiBzdHJpbmc7XG4gIGZpbHRlcnM6IE5vc3RyRmlsdGVyW107XG59XG5cbi8vIE1lc3NhZ2UgVHlwZXNcbmV4cG9ydCBlbnVtIE5vc3RyTWVzc2FnZVR5cGUge1xuICBFVkVOVCA9ICdFVkVOVCcsXG4gIE5PVElDRSA9ICdOT1RJQ0UnLFxuICBPSyA9ICdPSycsXG4gIEVPU0UgPSAnRU9TRScsXG4gIFJFUSA9ICdSRVEnLFxuICBDTE9TRSA9ICdDTE9TRScsXG4gIEFVVEggPSAnQVVUSCdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ck1lc3NhZ2Uge1xuICB0eXBlOiBOb3N0ck1lc3NhZ2VUeXBlO1xuICBldmVudD86IFNpZ25lZE5vc3RyRXZlbnQ7XG4gIHN1YnNjcmlwdGlvbklkPzogc3RyaW5nO1xuICBmaWx0ZXJzPzogTm9zdHJGaWx0ZXJbXTtcbiAgZXZlbnRJZD86IHN0cmluZztcbiAgYWNjZXB0ZWQ/OiBib29sZWFuO1xuICBtZXNzYWdlPzogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbiAgcGF5bG9hZD86IHN0cmluZyB8IChzdHJpbmcgfCBib29sZWFuKVtdOyAgXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJSZXNwb25zZSB7XG4gIHR5cGU6IE5vc3RyTWVzc2FnZVR5cGU7XG4gIGV2ZW50PzogU2lnbmVkTm9zdHJFdmVudDtcbiAgc3Vic2NyaXB0aW9uSWQ/OiBzdHJpbmc7XG4gIGZpbHRlcnM/OiBOb3N0ckZpbHRlcltdO1xuICBldmVudElkPzogc3RyaW5nO1xuICBhY2NlcHRlZD86IGJvb2xlYW47XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIGNvdW50PzogbnVtYmVyO1xufVxuXG4vLyBVdGlsaXR5IFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ckVycm9yIHtcbiAgY29kZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGRldGFpbHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvcHJvdG9jb2xcbiAqIEBkZXNjcmlwdGlvbiBOb3N0ciBwcm90b2NvbCB0eXBlc1xuICovXG5cbmltcG9ydCB0eXBlIHsgXG4gIE5vc3RyRmlsdGVyLCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgTm9zdHJSZXNwb25zZSxcbiAgTm9zdHJFcnJvclxufSBmcm9tICcuL2Jhc2UuanMnO1xuXG4vLyBSZS1leHBvcnQgdHlwZXMgZnJvbSBiYXNlIHRoYXQgYXJlIHVzZWQgaW4gdGhpcyBtb2R1bGVcbmV4cG9ydCB0eXBlIHsgXG4gIE5vc3RyRmlsdGVyLCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgTm9zdHJSZXNwb25zZSxcbiAgTm9zdHJFcnJvclxufTtcbiIsICJleHBvcnQge307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXNzYWdlcy5qcy5tYXAiLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL2d1YXJkc1xuICogQGRlc2NyaXB0aW9uIFR5cGUgZ3VhcmQgZnVuY3Rpb25zIGZvciBOb3N0ciB0eXBlc1xuICovXG5cbmltcG9ydCB7IE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQsIE5vc3RyRmlsdGVyLCBOb3N0clN1YnNjcmlwdGlvbiwgTm9zdHJSZXNwb25zZSwgTm9zdHJFcnJvciB9IGZyb20gJy4vYmFzZSc7XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJFdmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0ckV2ZW50KGV2ZW50OiB1bmtub3duKTogZXZlbnQgaXMgTm9zdHJFdmVudCB7XG4gIGlmICh0eXBlb2YgZXZlbnQgIT09ICdvYmplY3QnIHx8IGV2ZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRFdmVudCA9IGV2ZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8vIFJlcXVpcmVkIGZpZWxkc1xuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQua2luZCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsaWRFdmVudC5raW5kKSB8fCB2YWxpZEV2ZW50LmtpbmQgPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbGlkRXZlbnQuY3JlYXRlZF9hdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBwdWJrZXkgc3RydWN0dXJlXG4gIGlmICh2YWxpZEV2ZW50LnB1YmtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LnB1YmtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdmFsaWRFdmVudC5wdWJrZXkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbGlkRXZlbnQucHVia2V5ID09PSAnb2JqZWN0JyAmJiB2YWxpZEV2ZW50LnB1YmtleSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgcHVia2V5ID0gdmFsaWRFdmVudC5wdWJrZXkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBpZiAodHlwZW9mIHB1YmtleS5oZXggIT09ICdzdHJpbmcnIHx8ICFwdWJrZXkuaGV4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIHRhZ3MgYXJyYXlcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbGlkRXZlbnQudGFncykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayB0YWcgYXJyYXkgZWxlbWVudHNcbiAgaWYgKCF2YWxpZEV2ZW50LnRhZ3MuZXZlcnkodGFnID0+IEFycmF5LmlzQXJyYXkodGFnKSAmJiB0YWcuZXZlcnkoaXRlbSA9PiB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIFNpZ25lZE5vc3RyRXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2lnbmVkTm9zdHJFdmVudChldmVudDogdW5rbm93bik6IGV2ZW50IGlzIFNpZ25lZE5vc3RyRXZlbnQge1xuICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBzaWduZWRFdmVudCA9IGV2ZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkcyBmcm9tIE5vc3RyRXZlbnRcbiAgaWYgKCFpc05vc3RyRXZlbnQoZXZlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcHVia2V5IGlzIHByZXNlbnQgYW5kIHZhbGlkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQucHVia2V5ID09PSAnc3RyaW5nJykge1xuICAgIGlmICghc2lnbmVkRXZlbnQucHVia2V5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5wdWJrZXkgPT09ICdvYmplY3QnICYmIHNpZ25lZEV2ZW50LnB1YmtleSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHB1YmtleSA9IHNpZ25lZEV2ZW50LnB1YmtleSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBpZiAodHlwZW9mIHB1YmtleS5oZXggIT09ICdzdHJpbmcnIHx8ICFwdWJrZXkuaGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlkIGZpZWxkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQuaWQgIT09ICdzdHJpbmcnIHx8ICFzaWduZWRFdmVudC5pZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHNpZyBmaWVsZFxuICBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LnNpZyAhPT0gJ3N0cmluZycgfHwgIXNpZ25lZEV2ZW50LnNpZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRmlsdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyRmlsdGVyKGZpbHRlcjogdW5rbm93bik6IGZpbHRlciBpcyBOb3N0ckZpbHRlciB7XG4gIGlmICh0eXBlb2YgZmlsdGVyICE9PSAnb2JqZWN0JyB8fCBmaWx0ZXIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZEZpbHRlciA9IGZpbHRlciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY29uc3QgdmFsaWRLZXlzID0gWydpZHMnLCAnYXV0aG9ycycsICdraW5kcycsICdzaW5jZScsICd1bnRpbCcsICdsaW1pdCcsICcjZScsICcjcCcsICcjdCddO1xuICBjb25zdCBmaWx0ZXJLZXlzID0gT2JqZWN0LmtleXModmFsaWRGaWx0ZXIpO1xuXG4gIC8vIENoZWNrIGlmIGFsbCBrZXlzIGluIHRoZSBmaWx0ZXIgYXJlIHZhbGlkXG4gIGlmICghZmlsdGVyS2V5cy5ldmVyeShrZXkgPT4gdmFsaWRLZXlzLmluY2x1ZGVzKGtleSkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgYXJyYXkgZmllbGRzXG4gIGlmICh2YWxpZEZpbHRlci5pZHMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIuaWRzKSB8fCAhdmFsaWRGaWx0ZXIuaWRzLmV2ZXJ5KGlkID0+IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXIuYXV0aG9ycyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5hdXRob3JzKSB8fCAhdmFsaWRGaWx0ZXIuYXV0aG9ycy5ldmVyeShhdXRob3IgPT4gdHlwZW9mIGF1dGhvciA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXIua2luZHMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIua2luZHMpIHx8ICF2YWxpZEZpbHRlci5raW5kcy5ldmVyeShraW5kID0+IHR5cGVvZiBraW5kID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpICYmIGtpbmQgPj0gMCkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlclsnI2UnXSAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlclsnI2UnXSkgfHwgIXZhbGlkRmlsdGVyWycjZSddLmV2ZXJ5KGUgPT4gdHlwZW9mIGUgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyWycjcCddICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyWycjcCddKSB8fCAhdmFsaWRGaWx0ZXJbJyNwJ10uZXZlcnkocCA9PiB0eXBlb2YgcCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXJbJyN0J10gIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXJbJyN0J10pIHx8ICF2YWxpZEZpbHRlclsnI3QnXS5ldmVyeSh0ID0+IHR5cGVvZiB0ID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgbnVtYmVyIGZpZWxkc1xuICBpZiAodmFsaWRGaWx0ZXIuc2luY2UgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRGaWx0ZXIuc2luY2UgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWxpZEZpbHRlci51bnRpbCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZEZpbHRlci51bnRpbCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkRmlsdGVyLmxpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkRmlsdGVyLmxpbWl0ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyU3Vic2NyaXB0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyU3Vic2NyaXB0aW9uKHN1YjogdW5rbm93bik6IHN1YiBpcyBOb3N0clN1YnNjcmlwdGlvbiB7XG4gIGlmICh0eXBlb2Ygc3ViICE9PSAnb2JqZWN0JyB8fCBzdWIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZFN1YiA9IHN1YiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAodHlwZW9mIHZhbGlkU3ViLmlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWxpZFN1Yi5maWx0ZXJzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghdmFsaWRTdWIuZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gaXNOb3N0ckZpbHRlcihmaWx0ZXIpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyUmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJSZXNwb25zZShyZXNwb25zZTogdW5rbm93bik6IHJlc3BvbnNlIGlzIE5vc3RyUmVzcG9uc2Uge1xuICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAnb2JqZWN0JyB8fCByZXNwb25zZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkUmVzcG9uc2UgPSByZXNwb25zZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAodHlwZW9mIHZhbGlkUmVzcG9uc2UudHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmFsaWRSZXNwb25zZS5zdWJzY3JpcHRpb25JZCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZFJlc3BvbnNlLnN1YnNjcmlwdGlvbklkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLmV2ZW50ICE9PSB1bmRlZmluZWQgJiYgIWlzU2lnbmVkTm9zdHJFdmVudCh2YWxpZFJlc3BvbnNlLmV2ZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRSZXNwb25zZS5tZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRXJyb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIE5vc3RyRXJyb3Ige1xuICBpZiAodHlwZW9mIGVycm9yICE9PSAnb2JqZWN0JyB8fCBlcnJvciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkRXJyb3IgPSBlcnJvciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWxpZEVycm9yLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIHZhbGlkRXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZydcbiAgKTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvbmlwNDZcbiAqIEBkZXNjcmlwdGlvbiBUeXBlIGRlZmluaXRpb25zIGZvciBOSVAtNDYgKE5vc3RyIENvbm5lY3QgLyBSZW1vdGUgU2lnbmluZylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDYubWRcbiAqL1xuXG4vKipcbiAqIE5JUC00NiByZW1vdGUgc2lnbmluZyBtZXRob2RzXG4gKi9cbmV4cG9ydCBlbnVtIE5pcDQ2TWV0aG9kIHtcbiAgQ09OTkVDVCA9ICdjb25uZWN0JyxcbiAgUElORyA9ICdwaW5nJyxcbiAgR0VUX1BVQkxJQ19LRVkgPSAnZ2V0X3B1YmxpY19rZXknLFxuICBTSUdOX0VWRU5UID0gJ3NpZ25fZXZlbnQnLFxuICBOSVAwNF9FTkNSWVBUID0gJ25pcDA0X2VuY3J5cHQnLFxuICBOSVAwNF9ERUNSWVBUID0gJ25pcDA0X2RlY3J5cHQnLFxuICBOSVA0NF9FTkNSWVBUID0gJ25pcDQ0X2VuY3J5cHQnLFxuICBOSVA0NF9ERUNSWVBUID0gJ25pcDQ0X2RlY3J5cHQnLFxuICBHRVRfUkVMQVlTID0gJ2dldF9yZWxheXMnLFxufVxuXG4vKipcbiAqIFBhcnNlZCBidW5rZXI6Ly8gVVJJXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVua2VyVVJJIHtcbiAgLyoqIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpICovXG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xuICAvKiogUmVsYXkgVVJMcyBmb3IgY29tbXVuaWNhdGlvbiAqL1xuICByZWxheXM6IHN0cmluZ1tdO1xuICAvKiogT3B0aW9uYWwgc2VjcmV0IGZvciBpbml0aWFsIGNvbm5lY3Rpb24gKi9cbiAgc2VjcmV0Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5JUC00NiBKU09OLVJQQyByZXF1ZXN0IChjbGllbnQgLT4gc2lnbmVyKVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2UmVxdWVzdCB7XG4gIGlkOiBzdHJpbmc7XG4gIG1ldGhvZDogTmlwNDZNZXRob2QgfCBzdHJpbmc7XG4gIHBhcmFtczogc3RyaW5nW107XG59XG5cbi8qKlxuICogTklQLTQ2IEpTT04tUlBDIHJlc3BvbnNlIChzaWduZXIgLT4gY2xpZW50KVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2UmVzcG9uc2Uge1xuICBpZDogc3RyaW5nO1xuICByZXN1bHQ/OiBzdHJpbmc7XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgTklQLTQ2IHNlc3Npb24gY29udGFpbmluZyB0aGUgZXBoZW1lcmFsIGtleXBhaXIgYW5kIGNvbnZlcnNhdGlvbiBrZXlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlNlc3Npb24ge1xuICAvKiogQ2xpZW50J3MgZXBoZW1lcmFsIHByaXZhdGUga2V5IChoZXgpICovXG4gIGNsaWVudFNlY3JldEtleTogc3RyaW5nO1xuICAvKiogQ2xpZW50J3MgZXBoZW1lcmFsIHB1YmxpYyBrZXkgKGhleCkgKi9cbiAgY2xpZW50UHVia2V5OiBzdHJpbmc7XG4gIC8qKiBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KSAqL1xuICByZW1vdGVQdWJrZXk6IHN0cmluZztcbiAgLyoqIE5JUC00NCBjb252ZXJzYXRpb24ga2V5IChkZXJpdmVkIGZyb20gRUNESCkgKi9cbiAgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5O1xufVxuXG4vKipcbiAqIFB1YmxpYyBzZXNzaW9uIGluZm8gKHNhZmUgdG8gZXhwb3NlOyBleGNsdWRlcyBwcml2YXRlIGtleSBhbmQgY29udmVyc2F0aW9uIGtleSlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlNlc3Npb25JbmZvIHtcbiAgY2xpZW50UHVia2V5OiBzdHJpbmc7XG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiB2YWxpZGF0aW5nIGEgYnVua2VyOi8vIFVSSVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1bmtlclZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbiAgdXJpPzogQnVua2VyVVJJO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBjcnlwdG9cbiAqIEBkZXNjcmlwdGlvbiBDcnlwdG9ncmFwaGljIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqIFxuICogSU1QT1JUQU5UOiBOb3N0ciBQcm90b2NvbCBDcnlwdG9ncmFwaGljIFJlcXVpcmVtZW50c1xuICogV2hpbGUgc2VjcDI1NmsxIGlzIHRoZSB1bmRlcmx5aW5nIGVsbGlwdGljIGN1cnZlIHVzZWQgYnkgTm9zdHIsIHRoZSBwcm90b2NvbCBzcGVjaWZpY2FsbHlcbiAqIHJlcXVpcmVzIHNjaG5vcnIgc2lnbmF0dXJlcyBhcyBkZWZpbmVkIGluIE5JUC0wMS4gVGhpcyBtZWFuczpcbiAqIFxuICogMS4gQWx3YXlzIHVzZSBzY2hub3JyLXNwZWNpZmljIGZ1bmN0aW9uczpcbiAqICAgIC0gc2Nobm9yci5nZXRQdWJsaWNLZXkoKSBmb3IgcHVibGljIGtleSBnZW5lcmF0aW9uXG4gKiAgICAtIHNjaG5vcnIuc2lnbigpIGZvciBzaWduaW5nXG4gKiAgICAtIHNjaG5vcnIudmVyaWZ5KCkgZm9yIHZlcmlmaWNhdGlvblxuICogXG4gKiAyLiBBdm9pZCB1c2luZyBzZWNwMjU2azEgZnVuY3Rpb25zIGRpcmVjdGx5OlxuICogICAgLSBET04nVCB1c2Ugc2VjcDI1NmsxLmdldFB1YmxpY0tleSgpXG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEuc2lnbigpXG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEudmVyaWZ5KClcbiAqIFxuICogV2hpbGUgYm90aCBtaWdodCB3b3JrIGluIHNvbWUgY2FzZXMgKGFzIHRoZXkgdXNlIHRoZSBzYW1lIGN1cnZlKSwgdGhlIHNjaG5vcnIgc2lnbmF0dXJlXG4gKiBzY2hlbWUgaGFzIHNwZWNpZmljIHJlcXVpcmVtZW50cyBmb3Iga2V5IGFuZCBzaWduYXR1cmUgZm9ybWF0cyB0aGF0IGFyZW4ndCBndWFyYW50ZWVkXG4gKiB3aGVuIHVzaW5nIHRoZSBsb3dlci1sZXZlbCBzZWNwMjU2azEgZnVuY3Rpb25zIGRpcmVjdGx5LlxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIsIHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgS2V5UGFpciwgUHVibGljS2V5RGV0YWlscywgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCwgUHVibGljS2V5IH0gZnJvbSAnLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBieXRlc1RvQmFzZTY0LCBiYXNlNjRUb0J5dGVzIH0gZnJvbSAnLi9lbmNvZGluZy9iYXNlNjQnO1xuXG5cbi8qKlxuICogQ3VzdG9tIGNyeXB0byBpbnRlcmZhY2UgZm9yIGNyb3NzLXBsYXRmb3JtIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDcnlwdG9TdWJ0bGUge1xuICBzdWJ0bGU6IHtcbiAgICBnZW5lcmF0ZUtleShcbiAgICAgIGFsZ29yaXRobTogUnNhSGFzaGVkS2V5R2VuUGFyYW1zIHwgRWNLZXlHZW5QYXJhbXMsXG4gICAgICBleHRyYWN0YWJsZTogYm9vbGVhbixcbiAgICAgIGtleVVzYWdlczogcmVhZG9ubHkgS2V5VXNhZ2VbXVxuICAgICk6IFByb21pc2U8Q3J5cHRvS2V5UGFpcj47XG4gICAgaW1wb3J0S2V5KFxuICAgICAgZm9ybWF0OiAncmF3JyB8ICdwa2NzOCcgfCAnc3BraScsXG4gICAgICBrZXlEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICAgIGFsZ29yaXRobTogUnNhSGFzaGVkSW1wb3J0UGFyYW1zIHwgRWNLZXlJbXBvcnRQYXJhbXMgfCBBZXNLZXlBbGdvcml0aG0sXG4gICAgICBleHRyYWN0YWJsZTogYm9vbGVhbixcbiAgICAgIGtleVVzYWdlczogcmVhZG9ubHkgS2V5VXNhZ2VbXVxuICAgICk6IFByb21pc2U8Q3J5cHRvS2V5PjtcbiAgICBlbmNyeXB0KFxuICAgICAgYWxnb3JpdGhtOiB7IG5hbWU6IHN0cmluZzsgaXY6IFVpbnQ4QXJyYXkgfSxcbiAgICAgIGtleTogQ3J5cHRvS2V5LFxuICAgICAgZGF0YTogQXJyYXlCdWZmZXJcbiAgICApOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICBkZWNyeXB0KFxuICAgICAgYWxnb3JpdGhtOiB7IG5hbWU6IHN0cmluZzsgaXY6IFVpbnQ4QXJyYXkgfSxcbiAgICAgIGtleTogQ3J5cHRvS2V5LFxuICAgICAgZGF0YTogQXJyYXlCdWZmZXJcbiAgICApOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgfTtcbiAgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFQ7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbiAgaW50ZXJmYWNlIEdsb2JhbCB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbn1cblxuLy8gR2V0IHRoZSBhcHByb3ByaWF0ZSBjcnlwdG8gaW1wbGVtZW50YXRpb25cbmNvbnN0IGdldENyeXB0byA9IGFzeW5jICgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4gPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuICAgIHJldHVybiB3aW5kb3cuY3J5cHRvO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvKSB7XG4gICAgcmV0dXJuIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG87XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBjcnlwdG9Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ2NyeXB0bycpO1xuICAgIGlmIChjcnlwdG9Nb2R1bGUud2ViY3J5cHRvKSB7XG4gICAgICByZXR1cm4gY3J5cHRvTW9kdWxlLndlYmNyeXB0byBhcyBDcnlwdG9TdWJ0bGU7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBsb2dnZXIuZGVidWcoJ05vZGUgY3J5cHRvIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gV2ViQ3J5cHRvIGltcGxlbWVudGF0aW9uIGF2YWlsYWJsZScpO1xufTtcblxuLyoqXG4gKiBDcnlwdG8gaW1wbGVtZW50YXRpb24gdGhhdCB3b3JrcyBpbiBib3RoIE5vZGUuanMgYW5kIGJyb3dzZXIgZW52aXJvbm1lbnRzXG4gKi9cbmNsYXNzIEN1c3RvbUNyeXB0byB7XG4gIHByaXZhdGUgY3J5cHRvSW5zdGFuY2U6IENyeXB0b1N1YnRsZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFByb21pc2UgPSB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNyeXB0b0luc3RhbmNlID0gYXdhaXQgZ2V0Q3J5cHRvKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUluaXRpYWxpemVkKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiB7XG4gICAgYXdhaXQgdGhpcy5pbml0UHJvbWlzZTtcbiAgICBpZiAoIXRoaXMuY3J5cHRvSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3J5cHRvIGltcGxlbWVudGF0aW9uIG5vdCBpbml0aWFsaXplZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcnlwdG9JbnN0YW5jZTtcbiAgfVxuXG4gIGFzeW5jIGdldFN1YnRsZSgpOiBQcm9taXNlPENyeXB0b1N1YnRsZVsnc3VidGxlJ10+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGU7XG4gIH1cblxuICBhc3luYyBnZXRSYW5kb21WYWx1ZXM8VCBleHRlbmRzIFVpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk+KGFycmF5OiBUKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcbiAgfVxufVxuXG4vLyBDcmVhdGUgYW5kIGV4cG9ydCBkZWZhdWx0IGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3VzdG9tQ3J5cHRvID0gbmV3IEN1c3RvbUNyeXB0bygpO1xuXG4vLyBFeHBvcnQgc2Nobm9yciBmdW5jdGlvbnNcbmV4cG9ydCBjb25zdCBzaWduU2Nobm9yciA9IHNjaG5vcnIuc2lnbjtcbmV4cG9ydCBjb25zdCB2ZXJpZnlTY2hub3JyU2lnbmF0dXJlID0gc2Nobm9yci52ZXJpZnk7XG5cbi8qKlxuICogR2V0cyB0aGUgY29tcHJlc3NlZCBwdWJsaWMga2V5ICgzMyBieXRlcyB3aXRoIHByZWZpeClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXByZXNzZWRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzZWNwMjU2azEuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgc2Nobm9yciBwdWJsaWMga2V5ICgzMiBieXRlcyB4LWNvb3JkaW5hdGUpIGFzIHBlciBCSVAzNDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNjaG5vcnJQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG5ldyBrZXkgcGFpclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVLZXlQYWlyKCk6IFByb21pc2U8S2V5UGFpcj4ge1xuICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSByYW5kb21CeXRlcygzMik7XG4gIGNvbnN0IHByaXZhdGVLZXkgPSBieXRlc1RvSGV4KHByaXZhdGVLZXlCeXRlcyk7XG4gIHByaXZhdGVLZXlCeXRlcy5maWxsKDApOyAvLyB6ZXJvIHNvdXJjZSBtYXRlcmlhbFxuICBjb25zdCBwdWJsaWNLZXkgPSBhd2FpdCBnZXRQdWJsaWNLZXkocHJpdmF0ZUtleSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwcml2YXRlS2V5LFxuICAgIHB1YmxpY0tleVxuICB9O1xufVxuXG4vKipcbiAqIEdldHMgYSBwdWJsaWMga2V5IGZyb20gYSBwcml2YXRlIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVibGljS2V5KHByaXZhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8UHVibGljS2V5RGV0YWlscz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMocHJpdmF0ZUtleSk7XG4gICAgY29uc3QgcHVibGljS2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xuICAgIHJldHVybiB7XG4gICAgICBoZXg6IGJ5dGVzVG9IZXgocHVibGljS2V5Qnl0ZXMpLFxuICAgICAgYnl0ZXM6IHB1YmxpY0tleUJ5dGVzXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBwdWJsaWMga2V5Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBrZXkgcGFpclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVLZXlQYWlyKGtleVBhaXI6IEtleVBhaXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkZXJpdmVkUHViS2V5ID0gYXdhaXQgZ2V0UHVibGljS2V5KGtleVBhaXIucHJpdmF0ZUtleSk7XG4gICAgcmV0dXJuIGRlcml2ZWRQdWJLZXkuaGV4ID09PSBrZXlQYWlyLnB1YmxpY0tleS5oZXg7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBrZXkgcGFpcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGV2ZW50OiBQYXJ0aWFsPE5vc3RyRXZlbnQ+KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXZlbnQsXG4gICAgY3JlYXRlZF9hdDogZXZlbnQuY3JlYXRlZF9hdCB8fCB0aW1lc3RhbXAsXG4gICAgdGFnczogZXZlbnQudGFncyB8fCBbXSxcbiAgICBjb250ZW50OiBldmVudC5jb250ZW50IHx8ICcnLFxuICAgIGtpbmQ6IGV2ZW50LmtpbmQgfHwgMVxuICB9IGFzIE5vc3RyRXZlbnQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcHJpdmF0ZSBrZXkgdG8gaGV4IHN0cmluZyAoYWNjZXB0cyBib3RoIGhleCBzdHJpbmcgYW5kIFVpbnQ4QXJyYXkpXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVByaXZhdGVLZXkocHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGlmIChwcml2YXRlS2V5IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBieXRlc1RvSGV4KHByaXZhdGVLZXkpO1xuICB9XG4gIHJldHVybiBwcml2YXRlS2V5O1xufVxuXG4vKipcbiAqIFNpZ25zIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzaWduXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGFzIGhleCBzdHJpbmcgb3IgVWludDhBcnJheVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnbkV2ZW50KGV2ZW50OiBOb3N0ckV2ZW50LCBwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJpdmF0ZUtleUhleCA9IG5vcm1hbGl6ZVByaXZhdGVLZXkocHJpdmF0ZUtleSk7XG5cbiAgICAvLyBTZXJpYWxpemUgZXZlbnQgZm9yIHNpZ25pbmcgKE5JUC0wMSBmb3JtYXQpXG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBldmVudC5wdWJrZXksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG5cbiAgICAvLyBDYWxjdWxhdGUgZXZlbnQgaGFzaFxuICAgIGNvbnN0IGV2ZW50SGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuXG4gICAgLy8gQ29udmVydCBwcml2YXRlIGtleSB0byBieXRlcyBhbmQgc2lnblxuICAgIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMocHJpdmF0ZUtleUhleCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBzY2hub3JyLnNpZ24oZXZlbnRIYXNoLCBwcml2YXRlS2V5Qnl0ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIHNpZ25lZCBldmVudFxuICAgIHJldHVybiB7XG4gICAgICAuLi5ldmVudCxcbiAgICAgIGlkOiBieXRlc1RvSGV4KGV2ZW50SGFzaCksXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnbmF0dXJlQnl0ZXMpXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHNpZ24gZXZlbnQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgYSBwdWJsaWMga2V5IGhleCBzdHJpbmcgZnJvbSBhIHByaXZhdGUga2V5IChzeW5jaHJvbm91cylcbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgYXMgaGV4IHN0cmluZyBvciBVaW50OEFycmF5XG4gKiBAcmV0dXJucyBIZXgtZW5jb2RlZCBwdWJsaWMga2V5ICgzMi1ieXRlIHgtb25seSBzY2hub3JyIGtleSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0tleVN5bmMocHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IHByaXZhdGVLZXkgaW5zdGFuY2VvZiBVaW50OEFycmF5XG4gICAgPyBwcml2YXRlS2V5XG4gICAgOiBoZXhUb0J5dGVzKHByaXZhdGVLZXkpO1xuICBjb25zdCBwdWJsaWNLZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG4gIHJldHVybiBieXRlc1RvSGV4KHB1YmxpY0tleUJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzLCBoYXNoZXMsIGFuZCBzaWducyBhIE5vc3RyIGV2ZW50IGluIG9uZSBzdGVwXG4gKiBAcGFyYW0gZXZlbnQgLSBQYXJ0aWFsIGV2ZW50IChraW5kLCBjb250ZW50LCB0YWdzIHJlcXVpcmVkOyBwdWJrZXkgZGVyaXZlZCBpZiBtaXNzaW5nKVxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBhcyBoZXggc3RyaW5nIG9yIFVpbnQ4QXJyYXlcbiAqIEByZXR1cm5zIEZ1bGx5IHNpZ25lZCBldmVudCB3aXRoIGlkLCBwdWJrZXksIGFuZCBzaWdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmFsaXplRXZlbnQoXG4gIGV2ZW50OiBQYXJ0aWFsPE5vc3RyRXZlbnQ+LFxuICBwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5XG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgY29uc3QgcHVia2V5ID0gZXZlbnQucHVia2V5IHx8IGdldFB1YmxpY0tleVN5bmMocHJpdmF0ZUtleSk7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IGV2ZW50LmNyZWF0ZWRfYXQgfHwgTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG5cbiAgY29uc3QgZnVsbEV2ZW50OiBOb3N0ckV2ZW50ID0ge1xuICAgIGtpbmQ6IGV2ZW50LmtpbmQgfHwgMSxcbiAgICBjcmVhdGVkX2F0OiB0aW1lc3RhbXAsXG4gICAgdGFnczogZXZlbnQudGFncyB8fCBbXSxcbiAgICBjb250ZW50OiBldmVudC5jb250ZW50IHx8ICcnLFxuICAgIHB1YmtleSxcbiAgfTtcblxuICByZXR1cm4gc2lnbkV2ZW50KGZ1bGxFdmVudCwgcHJpdmF0ZUtleSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgYW4gZXZlbnQgc2lnbmF0dXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICAvLyBTZXJpYWxpemUgZXZlbnQgZm9yIHZlcmlmaWNhdGlvbiAoTklQLTAxIGZvcm1hdClcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGV2ZW50LnB1YmtleSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcblxuICAgIC8vIENhbGN1bGF0ZSBldmVudCBoYXNoXG4gICAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG5cbiAgICAvLyBWZXJpZnkgZXZlbnQgSURcbiAgICBjb25zdCBjYWxjdWxhdGVkSWQgPSBieXRlc1RvSGV4KGV2ZW50SGFzaCk7XG4gICAgaWYgKGNhbGN1bGF0ZWRJZCAhPT0gZXZlbnQuaWQpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXZlbnQgSUQgbWlzbWF0Y2gnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGhleCBzdHJpbmdzIHRvIGJ5dGVzXG4gICAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBoZXhUb0J5dGVzKGV2ZW50LnNpZyk7XG4gICAgY29uc3QgcHVia2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKGV2ZW50LnB1YmtleSk7XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHNjaG5vcnIudmVyaWZ5KHNpZ25hdHVyZUJ5dGVzLCBldmVudEhhc2gsIHB1YmtleUJ5dGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHJlY2lwaWVudFB1YktleTogUHVibGljS2V5IHwgc3RyaW5nLFxuICBzZW5kZXJQcml2S2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVjaXBpZW50UHViS2V5SGV4ID0gdHlwZW9mIHJlY2lwaWVudFB1YktleSA9PT0gJ3N0cmluZycgPyByZWNpcGllbnRQdWJLZXkgOiByZWNpcGllbnRQdWJLZXkuaGV4O1xuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHNlbmRlclByaXZLZXkpLCBoZXhUb0J5dGVzKHJlY2lwaWVudFB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7XG5cbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gSVZcbiAgICBjb25zdCBpdiA9IHJhbmRvbUJ5dGVzKDE2KTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICkpO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIEVuY3J5cHQgdGhlIG1lc3NhZ2VcbiAgICBjb25zdCBkYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBrZXksXG4gICAgICBkYXRhLmJ1ZmZlclxuICAgICkpO1xuXG4gICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgY29uc3QgY2lwaGVydGV4dEJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkoZW5jcnlwdGVkKSk7XG4gICAgY29uc3QgaXZCYXNlNjQgPSBieXRlc1RvQmFzZTY0KGl2KTtcblxuICAgIHJldHVybiBjaXBoZXJ0ZXh0QmFzZTY0ICsgJz9pdj0nICsgaXZCYXNlNjQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBlbmNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIERlY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoXG4gIGVuY3J5cHRlZE1lc3NhZ2U6IHN0cmluZyxcbiAgc2VuZGVyUHViS2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcsXG4gIHJlY2lwaWVudFByaXZLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZW5kZXJQdWJLZXlIZXggPSB0eXBlb2Ygc2VuZGVyUHViS2V5ID09PSAnc3RyaW5nJyA/IHNlbmRlclB1YktleSA6IHNlbmRlclB1YktleS5oZXg7XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMocmVjaXBpZW50UHJpdktleSksIGhleFRvQnl0ZXMoc2VuZGVyUHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTtcblxuICAgIC8vIFBhcnNlIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIC8vIEFsc28gc3VwcG9ydCBsZWdhY3kgaGV4IGZvcm1hdCAoaXYgKyBjaXBoZXJ0ZXh0IGNvbmNhdGVuYXRlZCkgYXMgZmFsbGJhY2tcbiAgICBsZXQgaXY6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXk7XG5cbiAgICBpZiAoZW5jcnlwdGVkTWVzc2FnZS5pbmNsdWRlcygnP2l2PScpKSB7XG4gICAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0XG4gICAgICBjb25zdCBbY2lwaGVydGV4dEJhc2U2NCwgaXZCYXNlNjRdID0gZW5jcnlwdGVkTWVzc2FnZS5zcGxpdCgnP2l2PScpO1xuICAgICAgY2lwaGVydGV4dCA9IGJhc2U2NFRvQnl0ZXMoY2lwaGVydGV4dEJhc2U2NCk7XG4gICAgICBpdiA9IGJhc2U2NFRvQnl0ZXMoaXZCYXNlNjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWdhY3kgaGV4IGZvcm1hdCBmYWxsYmFjazogZmlyc3QgMTYgYnl0ZXMgYXJlIElWLCByZXN0IGlzIGNpcGhlcnRleHRcbiAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGhleFRvQnl0ZXMoZW5jcnlwdGVkTWVzc2FnZSk7XG4gICAgICBpdiA9IGVuY3J5cHRlZC5zbGljZSgwLCAxNik7XG4gICAgICBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkLnNsaWNlKDE2KTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2RlY3J5cHQnXVxuICAgICkpO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5kZWNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBrZXksXG4gICAgICBjaXBoZXJ0ZXh0LmJ1ZmZlciBhcyBBcnJheUJ1ZmZlclxuICAgICkpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShkZWNyeXB0ZWQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZGVjcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICIvKipcbiAqIFNFQ0cgc2VjcDI1NmsxLiBTZWUgW3BkZl0oaHR0cHM6Ly93d3cuc2VjZy5vcmcvc2VjMi12Mi5wZGYpLlxuICpcbiAqIEJlbG9uZ3MgdG8gS29ibGl0eiBjdXJ2ZXM6IGl0IGhhcyBlZmZpY2llbnRseS1jb21wdXRhYmxlIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4LFxuICogY2hlY2sgb3V0IHtAbGluayBFbmRvbW9ycGhpc21PcHRzfS4gU2VlbXMgdG8gYmUgcmlnaWQgKG5vdCBiYWNrZG9vcmVkKS5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVLZXlnZW4sIHR5cGUgQ3VydmVMZW5ndGhzIH0gZnJvbSAnLi9hYnN0cmFjdC9jdXJ2ZS50cyc7XG5pbXBvcnQgeyBjcmVhdGVIYXNoZXIsIHR5cGUgSDJDSGFzaGVyLCBpc29nZW55TWFwIH0gZnJvbSAnLi9hYnN0cmFjdC9oYXNoLXRvLWN1cnZlLnRzJztcbmltcG9ydCB7IEZpZWxkLCBtYXBIYXNoVG9GaWVsZCwgcG93MiB9IGZyb20gJy4vYWJzdHJhY3QvbW9kdWxhci50cyc7XG5pbXBvcnQge1xuICB0eXBlIEVDRFNBLFxuICBlY2RzYSxcbiAgdHlwZSBFbmRvbW9ycGhpc21PcHRzLFxuICBtYXBUb0N1cnZlU2ltcGxlU1dVLFxuICB0eXBlIFdlaWVyc3RyYXNzUG9pbnQgYXMgUG9pbnRUeXBlLFxuICB3ZWllcnN0cmFzcyxcbiAgdHlwZSBXZWllcnN0cmFzc09wdHMsXG4gIHR5cGUgV2VpZXJzdHJhc3NQb2ludENvbnMsXG59IGZyb20gJy4vYWJzdHJhY3Qvd2VpZXJzdHJhc3MudHMnO1xuaW1wb3J0IHsgYWJ5dGVzLCBhc2NpaVRvQnl0ZXMsIGJ5dGVzVG9OdW1iZXJCRSwgY29uY2F0Qnl0ZXMgfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLy8gU2VlbXMgbGlrZSBnZW5lcmF0b3Igd2FzIHByb2R1Y2VkIGZyb20gc29tZSBzZWVkOlxuLy8gYFBvaW50azEuQkFTRS5tdWx0aXBseShQb2ludGsxLkZuLmludigybiwgTikpLnRvQWZmaW5lKCkueGBcbi8vIC8vIGdpdmVzIHNob3J0IHggMHgzYjc4Y2U1NjNmODlhMGVkOTQxNGY1YWEyOGFkMGQ5NmQ2Nzk1ZjljNjNuXG5jb25zdCBzZWNwMjU2azFfQ1VSVkU6IFdlaWVyc3RyYXNzT3B0czxiaWdpbnQ+ID0ge1xuICBwOiBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVmZmZmZmMyZicpLFxuICBuOiBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmViYWFlZGNlNmFmNDhhMDNiYmZkMjVlOGNkMDM2NDE0MScpLFxuICBoOiBCaWdJbnQoMSksXG4gIGE6IEJpZ0ludCgwKSxcbiAgYjogQmlnSW50KDcpLFxuICBHeDogQmlnSW50KCcweDc5YmU2NjdlZjlkY2JiYWM1NWEwNjI5NWNlODcwYjA3MDI5YmZjZGIyZGNlMjhkOTU5ZjI4MTViMTZmODE3OTgnKSxcbiAgR3k6IEJpZ0ludCgnMHg0ODNhZGE3NzI2YTNjNDY1NWRhNGZiZmMwZTExMDhhOGZkMTdiNDQ4YTY4NTU0MTk5YzQ3ZDA4ZmZiMTBkNGI4JyksXG59O1xuXG5jb25zdCBzZWNwMjU2azFfRU5ETzogRW5kb21vcnBoaXNtT3B0cyA9IHtcbiAgYmV0YTogQmlnSW50KCcweDdhZTk2YTJiNjU3YzA3MTA2ZTY0NDc5ZWFjMzQzNGU5OWNmMDQ5NzUxMmY1ODk5NWMxMzk2YzI4NzE5NTAxZWUnKSxcbiAgYmFzaXNlczogW1xuICAgIFtCaWdJbnQoJzB4MzA4NmQyMjFhN2Q0NmJjZGU4NmM5MGU0OTI4NGViMTUnKSwgLUJpZ0ludCgnMHhlNDQzN2VkNjAxMGU4ODI4NmY1NDdmYTkwYWJmZTRjMycpXSxcbiAgICBbQmlnSW50KCcweDExNGNhNTBmN2E4ZTJmM2Y2NTdjMTEwOGQ5ZDQ0Y2ZkOCcpLCBCaWdJbnQoJzB4MzA4NmQyMjFhN2Q0NmJjZGU4NmM5MGU0OTI4NGViMTUnKV0sXG4gIF0sXG59O1xuXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzJuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgyKTtcblxuLyoqXG4gKiBcdTIyMUFuID0gbl4oKHArMSkvNCkgZm9yIGZpZWxkcyBwID0gMyBtb2QgNC4gV2UgdW53cmFwIHRoZSBsb29wIGFuZCBtdWx0aXBseSBiaXQtYnktYml0LlxuICogKFArMW4vNG4pLnRvU3RyaW5nKDIpIHdvdWxkIHByb2R1Y2UgYml0cyBbMjIzeCAxLCAwLCAyMnggMSwgNHggMCwgMTEsIDAwXVxuICovXG5mdW5jdGlvbiBzcXJ0TW9kKHk6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGNvbnN0IFAgPSBzZWNwMjU2azFfQ1VSVkUucDtcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGNvbnN0IF8zbiA9IEJpZ0ludCgzKSwgXzZuID0gQmlnSW50KDYpLCBfMTFuID0gQmlnSW50KDExKSwgXzIybiA9IEJpZ0ludCgyMik7XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBjb25zdCBfMjNuID0gQmlnSW50KDIzKSwgXzQ0biA9IEJpZ0ludCg0NCksIF84OG4gPSBCaWdJbnQoODgpO1xuICBjb25zdCBiMiA9ICh5ICogeSAqIHkpICUgUDsgLy8geF4zLCAxMVxuICBjb25zdCBiMyA9IChiMiAqIGIyICogeSkgJSBQOyAvLyB4XjdcbiAgY29uc3QgYjYgPSAocG93MihiMywgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IGI5ID0gKHBvdzIoYjYsIF8zbiwgUCkgKiBiMykgJSBQO1xuICBjb25zdCBiMTEgPSAocG93MihiOSwgXzJuLCBQKSAqIGIyKSAlIFA7XG4gIGNvbnN0IGIyMiA9IChwb3cyKGIxMSwgXzExbiwgUCkgKiBiMTEpICUgUDtcbiAgY29uc3QgYjQ0ID0gKHBvdzIoYjIyLCBfMjJuLCBQKSAqIGIyMikgJSBQO1xuICBjb25zdCBiODggPSAocG93MihiNDQsIF80NG4sIFApICogYjQ0KSAlIFA7XG4gIGNvbnN0IGIxNzYgPSAocG93MihiODgsIF84OG4sIFApICogYjg4KSAlIFA7XG4gIGNvbnN0IGIyMjAgPSAocG93MihiMTc2LCBfNDRuLCBQKSAqIGI0NCkgJSBQO1xuICBjb25zdCBiMjIzID0gKHBvdzIoYjIyMCwgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IHQxID0gKHBvdzIoYjIyMywgXzIzbiwgUCkgKiBiMjIpICUgUDtcbiAgY29uc3QgdDIgPSAocG93Mih0MSwgXzZuLCBQKSAqIGIyKSAlIFA7XG4gIGNvbnN0IHJvb3QgPSBwb3cyKHQyLCBfMm4sIFApO1xuICBpZiAoIUZwazEuZXFsKEZwazEuc3FyKHJvb3QpLCB5KSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuICByZXR1cm4gcm9vdDtcbn1cblxuY29uc3QgRnBrMSA9IEZpZWxkKHNlY3AyNTZrMV9DVVJWRS5wLCB7IHNxcnQ6IHNxcnRNb2QgfSk7XG5jb25zdCBQb2ludGsxID0gLyogQF9fUFVSRV9fICovIHdlaWVyc3RyYXNzKHNlY3AyNTZrMV9DVVJWRSwge1xuICBGcDogRnBrMSxcbiAgZW5kbzogc2VjcDI1NmsxX0VORE8sXG59KTtcblxuLyoqXG4gKiBzZWNwMjU2azEgY3VydmU6IEVDRFNBIGFuZCBFQ0RIIG1ldGhvZHMuXG4gKlxuICogVXNlcyBzaGEyNTYgdG8gaGFzaCBtZXNzYWdlcy4gVG8gdXNlIGEgZGlmZmVyZW50IGhhc2gsXG4gKiBwYXNzIGB7IHByZWhhc2g6IGZhbHNlIH1gIHRvIHNpZ24gLyB2ZXJpZnkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBpbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG4gKiBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5IH0gPSBzZWNwMjU2azEua2V5Z2VuKCk7XG4gKiAvLyBjb25zdCBwdWJsaWNLZXkgPSBzZWNwMjU2azEuZ2V0UHVibGljS2V5KHNlY3JldEtleSk7XG4gKiBjb25zdCBtc2cgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ2hlbGxvIG5vYmxlJyk7XG4gKiBjb25zdCBzaWcgPSBzZWNwMjU2azEuc2lnbihtc2csIHNlY3JldEtleSk7XG4gKiBjb25zdCBpc1ZhbGlkID0gc2VjcDI1NmsxLnZlcmlmeShzaWcsIG1zZywgcHVibGljS2V5KTtcbiAqIC8vIGNvbnN0IHNpZ0tlY2NhayA9IHNlY3AyNTZrMS5zaWduKGtlY2NhazI1Nihtc2cpLCBzZWNyZXRLZXksIHsgcHJlaGFzaDogZmFsc2UgfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHNlY3AyNTZrMTogRUNEU0EgPSAvKiBAX19QVVJFX18gKi8gZWNkc2EoUG9pbnRrMSwgc2hhMjU2KTtcblxuLy8gU2Nobm9yciBzaWduYXR1cmVzIGFyZSBzdXBlcmlvciB0byBFQ0RTQSBmcm9tIGFib3ZlLiBCZWxvdyBpcyBTY2hub3JyLXNwZWNpZmljIEJJUDAzNDAgY29kZS5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpcHMvYmxvYi9tYXN0ZXIvYmlwLTAzNDAubWVkaWF3aWtpXG4vKiogQW4gb2JqZWN0IG1hcHBpbmcgdGFncyB0byB0aGVpciB0YWdnZWQgaGFzaCBwcmVmaXggb2YgW1NIQTI1Nih0YWcpIHwgU0hBMjU2KHRhZyldICovXG5jb25zdCBUQUdHRURfSEFTSF9QUkVGSVhFUzogeyBbdGFnOiBzdHJpbmddOiBVaW50OEFycmF5IH0gPSB7fTtcbmZ1bmN0aW9uIHRhZ2dlZEhhc2godGFnOiBzdHJpbmcsIC4uLm1lc3NhZ2VzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcbiAgbGV0IHRhZ1AgPSBUQUdHRURfSEFTSF9QUkVGSVhFU1t0YWddO1xuICBpZiAodGFnUCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgdGFnSCA9IHNoYTI1Nihhc2NpaVRvQnl0ZXModGFnKSk7XG4gICAgdGFnUCA9IGNvbmNhdEJ5dGVzKHRhZ0gsIHRhZ0gpO1xuICAgIFRBR0dFRF9IQVNIX1BSRUZJWEVTW3RhZ10gPSB0YWdQO1xuICB9XG4gIHJldHVybiBzaGEyNTYoY29uY2F0Qnl0ZXModGFnUCwgLi4ubWVzc2FnZXMpKTtcbn1cblxuLy8gRUNEU0EgY29tcGFjdCBwb2ludHMgYXJlIDMzLWJ5dGUuIFNjaG5vcnIgaXMgMzI6IHdlIHN0cmlwIGZpcnN0IGJ5dGUgMHgwMiBvciAweDAzXG5jb25zdCBwb2ludFRvQnl0ZXMgPSAocG9pbnQ6IFBvaW50VHlwZTxiaWdpbnQ+KSA9PiBwb2ludC50b0J5dGVzKHRydWUpLnNsaWNlKDEpO1xuY29uc3QgaGFzRXZlbiA9ICh5OiBiaWdpbnQpID0+IHkgJSBfMm4gPT09IF8wbjtcblxuLy8gQ2FsY3VsYXRlIHBvaW50LCBzY2FsYXIgYW5kIGJ5dGVzXG5mdW5jdGlvbiBzY2hub3JyR2V0RXh0UHViS2V5KHByaXY6IFVpbnQ4QXJyYXkpIHtcbiAgY29uc3QgeyBGbiwgQkFTRSB9ID0gUG9pbnRrMTtcbiAgY29uc3QgZF8gPSBGbi5mcm9tQnl0ZXMocHJpdik7XG4gIGNvbnN0IHAgPSBCQVNFLm11bHRpcGx5KGRfKTsgLy8gUCA9IGQnXHUyMkM1RzsgMCA8IGQnIDwgbiBjaGVjayBpcyBkb25lIGluc2lkZVxuICBjb25zdCBzY2FsYXIgPSBoYXNFdmVuKHAueSkgPyBkXyA6IEZuLm5lZyhkXyk7XG4gIHJldHVybiB7IHNjYWxhciwgYnl0ZXM6IHBvaW50VG9CeXRlcyhwKSB9O1xufVxuLyoqXG4gKiBsaWZ0X3ggZnJvbSBCSVAzNDAuIENvbnZlcnQgMzItYnl0ZSB4IGNvb3JkaW5hdGUgdG8gZWxsaXB0aWMgY3VydmUgcG9pbnQuXG4gKiBAcmV0dXJucyB2YWxpZCBwb2ludCBjaGVja2VkIGZvciBiZWluZyBvbi1jdXJ2ZVxuICovXG5mdW5jdGlvbiBsaWZ0X3goeDogYmlnaW50KTogUG9pbnRUeXBlPGJpZ2ludD4ge1xuICBjb25zdCBGcCA9IEZwazE7XG4gIGlmICghRnAuaXNWYWxpZE5vdDAoeCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB4OiBGYWlsIGlmIHggXHUyMjY1IHAnKTtcbiAgY29uc3QgeHggPSBGcC5jcmVhdGUoeCAqIHgpO1xuICBjb25zdCBjID0gRnAuY3JlYXRlKHh4ICogeCArIEJpZ0ludCg3KSk7IC8vIExldCBjID0geFx1MDBCMyArIDcgbW9kIHAuXG4gIGxldCB5ID0gRnAuc3FydChjKTsgLy8gTGV0IHkgPSBjXihwKzEpLzQgbW9kIHAuIFNhbWUgYXMgc3FydCgpLlxuICAvLyBSZXR1cm4gdGhlIHVuaXF1ZSBwb2ludCBQIHN1Y2ggdGhhdCB4KFApID0geCBhbmRcbiAgLy8geShQKSA9IHkgaWYgeSBtb2QgMiA9IDAgb3IgeShQKSA9IHAteSBvdGhlcndpc2UuXG4gIGlmICghaGFzRXZlbih5KSkgeSA9IEZwLm5lZyh5KTtcbiAgY29uc3QgcCA9IFBvaW50azEuZnJvbUFmZmluZSh7IHgsIHkgfSk7XG4gIHAuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgcmV0dXJuIHA7XG59XG5jb25zdCBudW0gPSBieXRlc1RvTnVtYmVyQkU7XG4vKipcbiAqIENyZWF0ZSB0YWdnZWQgaGFzaCwgY29udmVydCBpdCB0byBiaWdpbnQsIHJlZHVjZSBtb2R1bG8tbi5cbiAqL1xuZnVuY3Rpb24gY2hhbGxlbmdlKC4uLmFyZ3M6IFVpbnQ4QXJyYXlbXSk6IGJpZ2ludCB7XG4gIHJldHVybiBQb2ludGsxLkZuLmNyZWF0ZShudW0odGFnZ2VkSGFzaCgnQklQMDM0MC9jaGFsbGVuZ2UnLCAuLi5hcmdzKSkpO1xufVxuXG4vKipcbiAqIFNjaG5vcnIgcHVibGljIGtleSBpcyBqdXN0IGB4YCBjb29yZGluYXRlIG9mIFBvaW50IGFzIHBlciBCSVAzNDAuXG4gKi9cbmZ1bmN0aW9uIHNjaG5vcnJHZXRQdWJsaWNLZXkoc2VjcmV0S2V5OiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzY2hub3JyR2V0RXh0UHViS2V5KHNlY3JldEtleSkuYnl0ZXM7IC8vIGQnPWludChzaykuIEZhaWwgaWYgZCc9MCBvciBkJ1x1MjI2NW4uIFJldCBieXRlcyhkJ1x1MjJDNUcpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBTY2hub3JyIHNpZ25hdHVyZSBhcyBwZXIgQklQMzQwLiBWZXJpZmllcyBpdHNlbGYgYmVmb3JlIHJldHVybmluZyBhbnl0aGluZy5cbiAqIGF1eFJhbmQgaXMgb3B0aW9uYWwgYW5kIGlzIG5vdCB0aGUgc29sZSBzb3VyY2Ugb2YgayBnZW5lcmF0aW9uOiBiYWQgQ1NQUk5HIHdvbid0IGJlIGRhbmdlcm91cy5cbiAqL1xuZnVuY3Rpb24gc2Nobm9yclNpZ24oXG4gIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gIHNlY3JldEtleTogVWludDhBcnJheSxcbiAgYXV4UmFuZDogVWludDhBcnJheSA9IHJhbmRvbUJ5dGVzKDMyKVxuKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHsgRm4gfSA9IFBvaW50azE7XG4gIGNvbnN0IG0gPSBhYnl0ZXMobWVzc2FnZSwgdW5kZWZpbmVkLCAnbWVzc2FnZScpO1xuICBjb25zdCB7IGJ5dGVzOiBweCwgc2NhbGFyOiBkIH0gPSBzY2hub3JyR2V0RXh0UHViS2V5KHNlY3JldEtleSk7IC8vIGNoZWNrcyBmb3IgaXNXaXRoaW5DdXJ2ZU9yZGVyXG4gIGNvbnN0IGEgPSBhYnl0ZXMoYXV4UmFuZCwgMzIsICdhdXhSYW5kJyk7IC8vIEF1eGlsaWFyeSByYW5kb20gZGF0YSBhOiBhIDMyLWJ5dGUgYXJyYXlcbiAgY29uc3QgdCA9IEZuLnRvQnl0ZXMoZCBeIG51bSh0YWdnZWRIYXNoKCdCSVAwMzQwL2F1eCcsIGEpKSk7IC8vIExldCB0IGJlIHRoZSBieXRlLXdpc2UgeG9yIG9mIGJ5dGVzKGQpIGFuZCBoYXNoL2F1eChhKVxuICBjb25zdCByYW5kID0gdGFnZ2VkSGFzaCgnQklQMDM0MC9ub25jZScsIHQsIHB4LCBtKTsgLy8gTGV0IHJhbmQgPSBoYXNoL25vbmNlKHQgfHwgYnl0ZXMoUCkgfHwgbSlcbiAgLy8gTGV0IGsnID0gaW50KHJhbmQpIG1vZCBuLiBGYWlsIGlmIGsnID0gMC4gTGV0IFIgPSBrJ1x1MjJDNUdcbiAgY29uc3QgeyBieXRlczogcngsIHNjYWxhcjogayB9ID0gc2Nobm9yckdldEV4dFB1YktleShyYW5kKTtcbiAgY29uc3QgZSA9IGNoYWxsZW5nZShyeCwgcHgsIG0pOyAvLyBMZXQgZSA9IGludChoYXNoL2NoYWxsZW5nZShieXRlcyhSKSB8fCBieXRlcyhQKSB8fCBtKSkgbW9kIG4uXG4gIGNvbnN0IHNpZyA9IG5ldyBVaW50OEFycmF5KDY0KTsgLy8gTGV0IHNpZyA9IGJ5dGVzKFIpIHx8IGJ5dGVzKChrICsgZWQpIG1vZCBuKS5cbiAgc2lnLnNldChyeCwgMCk7XG4gIHNpZy5zZXQoRm4udG9CeXRlcyhGbi5jcmVhdGUoayArIGUgKiBkKSksIDMyKTtcbiAgLy8gSWYgVmVyaWZ5KGJ5dGVzKFApLCBtLCBzaWcpIChzZWUgYmVsb3cpIHJldHVybnMgZmFpbHVyZSwgYWJvcnRcbiAgaWYgKCFzY2hub3JyVmVyaWZ5KHNpZywgbSwgcHgpKSB0aHJvdyBuZXcgRXJyb3IoJ3NpZ246IEludmFsaWQgc2lnbmF0dXJlIHByb2R1Y2VkJyk7XG4gIHJldHVybiBzaWc7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgU2Nobm9yciBzaWduYXR1cmUuXG4gKiBXaWxsIHN3YWxsb3cgZXJyb3JzICYgcmV0dXJuIGZhbHNlIGV4Y2VwdCBmb3IgaW5pdGlhbCB0eXBlIHZhbGlkYXRpb24gb2YgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBzY2hub3JyVmVyaWZ5KHNpZ25hdHVyZTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSwgcHVibGljS2V5OiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHsgRnAsIEZuLCBCQVNFIH0gPSBQb2ludGsxO1xuICBjb25zdCBzaWcgPSBhYnl0ZXMoc2lnbmF0dXJlLCA2NCwgJ3NpZ25hdHVyZScpO1xuICBjb25zdCBtID0gYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgY29uc3QgcHViID0gYWJ5dGVzKHB1YmxpY0tleSwgMzIsICdwdWJsaWNLZXknKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBQID0gbGlmdF94KG51bShwdWIpKTsgLy8gUCA9IGxpZnRfeChpbnQocGspKTsgZmFpbCBpZiB0aGF0IGZhaWxzXG4gICAgY29uc3QgciA9IG51bShzaWcuc3ViYXJyYXkoMCwgMzIpKTsgLy8gTGV0IHIgPSBpbnQoc2lnWzA6MzJdKTsgZmFpbCBpZiByIFx1MjI2NSBwLlxuICAgIGlmICghRnAuaXNWYWxpZE5vdDAocikpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBzID0gbnVtKHNpZy5zdWJhcnJheSgzMiwgNjQpKTsgLy8gTGV0IHMgPSBpbnQoc2lnWzMyOjY0XSk7IGZhaWwgaWYgcyBcdTIyNjUgbi5cbiAgICBpZiAoIUZuLmlzVmFsaWROb3QwKHMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBlID0gY2hhbGxlbmdlKEZuLnRvQnl0ZXMociksIHBvaW50VG9CeXRlcyhQKSwgbSk7IC8vIGludChjaGFsbGVuZ2UoYnl0ZXMocil8fGJ5dGVzKFApfHxtKSklblxuICAgIC8vIFIgPSBzXHUyMkM1RyAtIGVcdTIyQzVQLCB3aGVyZSAtZVAgPT0gKG4tZSlQXG4gICAgY29uc3QgUiA9IEJBU0UubXVsdGlwbHlVbnNhZmUocykuYWRkKFAubXVsdGlwbHlVbnNhZmUoRm4ubmVnKGUpKSk7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBSLnRvQWZmaW5lKCk7XG4gICAgLy8gRmFpbCBpZiBpc19pbmZpbml0ZShSKSAvIG5vdCBoYXNfZXZlbl95KFIpIC8geChSKSBcdTIyNjAgci5cbiAgICBpZiAoUi5pczAoKSB8fCAhaGFzRXZlbih5KSB8fCB4ICE9PSByKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFNlY3BTY2hub3JyID0ge1xuICBrZXlnZW46IChzZWVkPzogVWludDhBcnJheSkgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuICBnZXRQdWJsaWNLZXk6IHR5cGVvZiBzY2hub3JyR2V0UHVibGljS2V5O1xuICBzaWduOiB0eXBlb2Ygc2Nobm9yclNpZ247XG4gIHZlcmlmeTogdHlwZW9mIHNjaG5vcnJWZXJpZnk7XG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+O1xuICB1dGlsczoge1xuICAgIHJhbmRvbVNlY3JldEtleTogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICAgIHBvaW50VG9CeXRlczogKHBvaW50OiBQb2ludFR5cGU8YmlnaW50PikgPT4gVWludDhBcnJheTtcbiAgICBsaWZ0X3g6IHR5cGVvZiBsaWZ0X3g7XG4gICAgdGFnZ2VkSGFzaDogdHlwZW9mIHRhZ2dlZEhhc2g7XG4gIH07XG4gIGxlbmd0aHM6IEN1cnZlTGVuZ3Rocztcbn07XG4vKipcbiAqIFNjaG5vcnIgc2lnbmF0dXJlcyBvdmVyIHNlY3AyNTZrMS5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpcHMvYmxvYi9tYXN0ZXIvYmlwLTAzNDAubWVkaWF3aWtpXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG4gKiBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5IH0gPSBzY2hub3JyLmtleWdlbigpO1xuICogLy8gY29uc3QgcHVibGljS2V5ID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoc2VjcmV0S2V5KTtcbiAqIGNvbnN0IG1zZyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnaGVsbG8nKTtcbiAqIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihtc2csIHNlY3JldEtleSk7XG4gKiBjb25zdCBpc1ZhbGlkID0gc2Nobm9yci52ZXJpZnkoc2lnLCBtc2csIHB1YmxpY0tleSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHNjaG5vcnI6IFNlY3BTY2hub3JyID0gLyogQF9fUFVSRV9fICovICgoKSA9PiB7XG4gIGNvbnN0IHNpemUgPSAzMjtcbiAgY29uc3Qgc2VlZExlbmd0aCA9IDQ4O1xuICBjb25zdCByYW5kb21TZWNyZXRLZXkgPSAoc2VlZCA9IHJhbmRvbUJ5dGVzKHNlZWRMZW5ndGgpKTogVWludDhBcnJheSA9PiB7XG4gICAgcmV0dXJuIG1hcEhhc2hUb0ZpZWxkKHNlZWQsIHNlY3AyNTZrMV9DVVJWRS5uKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBrZXlnZW46IGNyZWF0ZUtleWdlbihyYW5kb21TZWNyZXRLZXksIHNjaG5vcnJHZXRQdWJsaWNLZXkpLFxuICAgIGdldFB1YmxpY0tleTogc2Nobm9yckdldFB1YmxpY0tleSxcbiAgICBzaWduOiBzY2hub3JyU2lnbixcbiAgICB2ZXJpZnk6IHNjaG5vcnJWZXJpZnksXG4gICAgUG9pbnQ6IFBvaW50azEsXG4gICAgdXRpbHM6IHtcbiAgICAgIHJhbmRvbVNlY3JldEtleSxcbiAgICAgIHRhZ2dlZEhhc2gsXG4gICAgICBsaWZ0X3gsXG4gICAgICBwb2ludFRvQnl0ZXMsXG4gICAgfSxcbiAgICBsZW5ndGhzOiB7XG4gICAgICBzZWNyZXRLZXk6IHNpemUsXG4gICAgICBwdWJsaWNLZXk6IHNpemUsXG4gICAgICBwdWJsaWNLZXlIYXNQcmVmaXg6IGZhbHNlLFxuICAgICAgc2lnbmF0dXJlOiBzaXplICogMixcbiAgICAgIHNlZWQ6IHNlZWRMZW5ndGgsXG4gICAgfSxcbiAgfTtcbn0pKCk7XG5cbmNvbnN0IGlzb01hcCA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgaXNvZ2VueU1hcChcbiAgICBGcGsxLFxuICAgIFtcbiAgICAgIC8vIHhOdW1cbiAgICAgIFtcbiAgICAgICAgJzB4OGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGRhYWFhYThjNycsXG4gICAgICAgICcweDdkM2Q0YzgwYmMzMjFkNWI5ZjMxNWNlYTdmZDQ0YzVkNTk1ZDJmYzBiZjYzYjkyZGZmZjEwNDRmMTdjNjU4MScsXG4gICAgICAgICcweDUzNGMzMjhkMjNmMjM0ZTZlMmE0MTNkZWNhMjVjYWVjZTQ1MDYxNDQwMzdjNDAzMTRlY2JkMGI1M2Q5ZGQyNjInLFxuICAgICAgICAnMHg4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZGFhYWFhODhjJyxcbiAgICAgIF0sXG4gICAgICAvLyB4RGVuXG4gICAgICBbXG4gICAgICAgICcweGQzNTc3MTE5M2Q5NDkxOGE5Y2EzNGNjYmI3YjY0MGRkODZjZDQwOTU0MmY4NDg3ZDlmZTZiNzQ1NzgxZWI0OWInLFxuICAgICAgICAnMHhlZGFkYzZmNjQzODNkYzFkZjdjNGIyZDUxYjU0MjI1NDA2ZDM2YjY0MWY1ZTQxYmJjNTJhNTY2MTJhOGM2ZDE0JyxcbiAgICAgICAgJzB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMScsIC8vIExBU1QgMVxuICAgICAgXSxcbiAgICAgIC8vIHlOdW1cbiAgICAgIFtcbiAgICAgICAgJzB4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGI4ZTM4ZTIzYycsXG4gICAgICAgICcweGM3NWUwYzMyZDVjYjdjMGZhOWQwYTU0YjEyYTBhNmQ1NjQ3YWIwNDZkNjg2ZGE2ZmRmZmM5MGZjMjAxZDcxYTMnLFxuICAgICAgICAnMHgyOWE2MTk0NjkxZjkxYTczNzE1MjA5ZWY2NTEyZTU3NjcyMjgzMGEyMDFiZTIwMThhNzY1ZTg1YTllY2VlOTMxJyxcbiAgICAgICAgJzB4MmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmYzOGUzOGQ4NCcsXG4gICAgICBdLFxuICAgICAgLy8geURlblxuICAgICAgW1xuICAgICAgICAnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZmOTNiJyxcbiAgICAgICAgJzB4N2EwNjUzNGJiOGJkYjQ5ZmQ1ZTllNjYzMjcyMmMyOTg5NDY3YzFiZmM4ZThkOTc4ZGZiNDI1ZDI2ODVjMjU3MycsXG4gICAgICAgICcweDY0ODRhYTcxNjU0NWNhMmNmM2E3MGMzZmE4ZmUzMzdlMGEzZDIxMTYyZjBkNjI5OWE3YmY4MTkyYmZkMmE3NmYnLFxuICAgICAgICAnMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxJywgLy8gTEFTVCAxXG4gICAgICBdLFxuICAgIF0ubWFwKChpKSA9PiBpLm1hcCgoaikgPT4gQmlnSW50KGopKSkgYXMgW2JpZ2ludFtdLCBiaWdpbnRbXSwgYmlnaW50W10sIGJpZ2ludFtdXVxuICApKSgpO1xuY29uc3QgbWFwU1dVID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBtYXBUb0N1cnZlU2ltcGxlU1dVKEZwazEsIHtcbiAgICBBOiBCaWdJbnQoJzB4M2Y4NzMxYWJkZDY2MWFkY2EwOGE1NTU4ZjBmNWQyNzJlOTUzZDM2M2NiNmYwZTVkNDA1NDQ3YzAxYTQ0NDUzMycpLFxuICAgIEI6IEJpZ0ludCgnMTc3MScpLFxuICAgIFo6IEZwazEuY3JlYXRlKEJpZ0ludCgnLTExJykpLFxuICB9KSkoKTtcblxuLyoqIEhhc2hpbmcgLyBlbmNvZGluZyB0byBzZWNwMjU2azEgcG9pbnRzIC8gZmllbGQuIFJGQyA5MzgwIG1ldGhvZHMuICovXG5leHBvcnQgY29uc3Qgc2VjcDI1NmsxX2hhc2hlcjogSDJDSGFzaGVyPFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4+ID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBjcmVhdGVIYXNoZXIoXG4gICAgUG9pbnRrMSxcbiAgICAoc2NhbGFyczogYmlnaW50W10pID0+IHtcbiAgICAgIGNvbnN0IHsgeCwgeSB9ID0gbWFwU1dVKEZwazEuY3JlYXRlKHNjYWxhcnNbMF0pKTtcbiAgICAgIHJldHVybiBpc29NYXAoeCwgeSk7XG4gICAgfSxcbiAgICB7XG4gICAgICBEU1Q6ICdzZWNwMjU2azFfWE1EOlNIQS0yNTZfU1NXVV9ST18nLFxuICAgICAgZW5jb2RlRFNUOiAnc2VjcDI1NmsxX1hNRDpTSEEtMjU2X1NTV1VfTlVfJyxcbiAgICAgIHA6IEZwazEuT1JERVIsXG4gICAgICBtOiAxLFxuICAgICAgazogMTI4LFxuICAgICAgZXhwYW5kOiAneG1kJyxcbiAgICAgIGhhc2g6IHNoYTI1NixcbiAgICB9XG4gICkpKCk7XG4iLCAiLyoqXG4gKiBTSEEyIGhhc2ggZnVuY3Rpb24uIEEuay5hLiBzaGEyNTYsIHNoYTM4NCwgc2hhNTEyLCBzaGE1MTJfMjI0LCBzaGE1MTJfMjU2LlxuICogU0hBMjU2IGlzIHRoZSBmYXN0ZXN0IGhhc2ggaW1wbGVtZW50YWJsZSBpbiBKUywgZXZlbiBmYXN0ZXIgdGhhbiBCbGFrZTMuXG4gKiBDaGVjayBvdXQgW1JGQyA0NjM0XShodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNDYzNCkgYW5kXG4gKiBbRklQUyAxODAtNF0oaHR0cHM6Ly9udmxwdWJzLm5pc3QuZ292L25pc3RwdWJzL0ZJUFMvTklTVC5GSVBTLjE4MC00LnBkZikuXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IENoaSwgSGFzaE1ELCBNYWosIFNIQTIyNF9JViwgU0hBMjU2X0lWLCBTSEEzODRfSVYsIFNIQTUxMl9JViB9IGZyb20gJy4vX21kLnRzJztcbmltcG9ydCAqIGFzIHU2NCBmcm9tICcuL191NjQudHMnO1xuaW1wb3J0IHsgdHlwZSBDSGFzaCwgY2xlYW4sIGNyZWF0ZUhhc2hlciwgb2lkTmlzdCwgcm90ciB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vKipcbiAqIFJvdW5kIGNvbnN0YW50czpcbiAqIEZpcnN0IDMyIGJpdHMgb2YgZnJhY3Rpb25hbCBwYXJ0cyBvZiB0aGUgY3ViZSByb290cyBvZiB0aGUgZmlyc3QgNjQgcHJpbWVzIDIuLjMxMSlcbiAqL1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBTSEEyNTZfSyA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHg0MjhhMmY5OCwgMHg3MTM3NDQ5MSwgMHhiNWMwZmJjZiwgMHhlOWI1ZGJhNSwgMHgzOTU2YzI1YiwgMHg1OWYxMTFmMSwgMHg5MjNmODJhNCwgMHhhYjFjNWVkNSxcbiAgMHhkODA3YWE5OCwgMHgxMjgzNWIwMSwgMHgyNDMxODViZSwgMHg1NTBjN2RjMywgMHg3MmJlNWQ3NCwgMHg4MGRlYjFmZSwgMHg5YmRjMDZhNywgMHhjMTliZjE3NCxcbiAgMHhlNDliNjljMSwgMHhlZmJlNDc4NiwgMHgwZmMxOWRjNiwgMHgyNDBjYTFjYywgMHgyZGU5MmM2ZiwgMHg0YTc0ODRhYSwgMHg1Y2IwYTlkYywgMHg3NmY5ODhkYSxcbiAgMHg5ODNlNTE1MiwgMHhhODMxYzY2ZCwgMHhiMDAzMjdjOCwgMHhiZjU5N2ZjNywgMHhjNmUwMGJmMywgMHhkNWE3OTE0NywgMHgwNmNhNjM1MSwgMHgxNDI5Mjk2NyxcbiAgMHgyN2I3MGE4NSwgMHgyZTFiMjEzOCwgMHg0ZDJjNmRmYywgMHg1MzM4MGQxMywgMHg2NTBhNzM1NCwgMHg3NjZhMGFiYiwgMHg4MWMyYzkyZSwgMHg5MjcyMmM4NSxcbiAgMHhhMmJmZThhMSwgMHhhODFhNjY0YiwgMHhjMjRiOGI3MCwgMHhjNzZjNTFhMywgMHhkMTkyZTgxOSwgMHhkNjk5MDYyNCwgMHhmNDBlMzU4NSwgMHgxMDZhYTA3MCxcbiAgMHgxOWE0YzExNiwgMHgxZTM3NmMwOCwgMHgyNzQ4Nzc0YywgMHgzNGIwYmNiNSwgMHgzOTFjMGNiMywgMHg0ZWQ4YWE0YSwgMHg1YjljY2E0ZiwgMHg2ODJlNmZmMyxcbiAgMHg3NDhmODJlZSwgMHg3OGE1NjM2ZiwgMHg4NGM4NzgxNCwgMHg4Y2M3MDIwOCwgMHg5MGJlZmZmYSwgMHhhNDUwNmNlYiwgMHhiZWY5YTNmNywgMHhjNjcxNzhmMlxuXSk7XG5cbi8qKiBSZXVzYWJsZSB0ZW1wb3JhcnkgYnVmZmVyLiBcIldcIiBjb21lcyBzdHJhaWdodCBmcm9tIHNwZWMuICovXG5jb25zdCBTSEEyNTZfVyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoNjQpO1xuXG4vKiogSW50ZXJuYWwgMzItYnl0ZSBiYXNlIFNIQTIgaGFzaCBjbGFzcy4gKi9cbmFic3RyYWN0IGNsYXNzIFNIQTJfMzJCPFQgZXh0ZW5kcyBTSEEyXzMyQjxUPj4gZXh0ZW5kcyBIYXNoTUQ8VD4ge1xuICAvLyBXZSBjYW5ub3QgdXNlIGFycmF5IGhlcmUgc2luY2UgYXJyYXkgYWxsb3dzIGluZGV4aW5nIGJ5IHZhcmlhYmxlXG4gIC8vIHdoaWNoIG1lYW5zIG9wdGltaXplci9jb21waWxlciBjYW5ub3QgdXNlIHJlZ2lzdGVycy5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IEE6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEI6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEM6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEQ6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEU6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEY6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEc6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXRMZW46IG51bWJlcikge1xuICAgIHN1cGVyKDY0LCBvdXRwdXRMZW4sIDgsIGZhbHNlKTtcbiAgfVxuICBwcm90ZWN0ZWQgZ2V0KCk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0ge1xuICAgIGNvbnN0IHsgQSwgQiwgQywgRCwgRSwgRiwgRywgSCB9ID0gdGhpcztcbiAgICByZXR1cm4gW0EsIEIsIEMsIEQsIEUsIEYsIEcsIEhdO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgc2V0KFxuICAgIEE6IG51bWJlciwgQjogbnVtYmVyLCBDOiBudW1iZXIsIEQ6IG51bWJlciwgRTogbnVtYmVyLCBGOiBudW1iZXIsIEc6IG51bWJlciwgSDogbnVtYmVyXG4gICk6IHZvaWQge1xuICAgIHRoaXMuQSA9IEEgfCAwO1xuICAgIHRoaXMuQiA9IEIgfCAwO1xuICAgIHRoaXMuQyA9IEMgfCAwO1xuICAgIHRoaXMuRCA9IEQgfCAwO1xuICAgIHRoaXMuRSA9IEUgfCAwO1xuICAgIHRoaXMuRiA9IEYgfCAwO1xuICAgIHRoaXMuRyA9IEcgfCAwO1xuICAgIHRoaXMuSCA9IEggfCAwO1xuICB9XG4gIHByb3RlY3RlZCBwcm9jZXNzKHZpZXc6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEV4dGVuZCB0aGUgZmlyc3QgMTYgd29yZHMgaW50byB0aGUgcmVtYWluaW5nIDQ4IHdvcmRzIHdbMTYuLjYzXSBvZiB0aGUgbWVzc2FnZSBzY2hlZHVsZSBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIFNIQTI1Nl9XW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0LCBmYWxzZSk7XG4gICAgZm9yIChsZXQgaSA9IDE2OyBpIDwgNjQ7IGkrKykge1xuICAgICAgY29uc3QgVzE1ID0gU0hBMjU2X1dbaSAtIDE1XTtcbiAgICAgIGNvbnN0IFcyID0gU0hBMjU2X1dbaSAtIDJdO1xuICAgICAgY29uc3QgczAgPSByb3RyKFcxNSwgNykgXiByb3RyKFcxNSwgMTgpIF4gKFcxNSA+Pj4gMyk7XG4gICAgICBjb25zdCBzMSA9IHJvdHIoVzIsIDE3KSBeIHJvdHIoVzIsIDE5KSBeIChXMiA+Pj4gMTApO1xuICAgICAgU0hBMjU2X1dbaV0gPSAoczEgKyBTSEEyNTZfV1tpIC0gN10gKyBzMCArIFNIQTI1Nl9XW2kgLSAxNl0pIHwgMDtcbiAgICB9XG4gICAgLy8gQ29tcHJlc3Npb24gZnVuY3Rpb24gbWFpbiBsb29wLCA2NCByb3VuZHNcbiAgICBsZXQgeyBBLCBCLCBDLCBELCBFLCBGLCBHLCBIIH0gPSB0aGlzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuICAgICAgY29uc3Qgc2lnbWExID0gcm90cihFLCA2KSBeIHJvdHIoRSwgMTEpIF4gcm90cihFLCAyNSk7XG4gICAgICBjb25zdCBUMSA9IChIICsgc2lnbWExICsgQ2hpKEUsIEYsIEcpICsgU0hBMjU2X0tbaV0gKyBTSEEyNTZfV1tpXSkgfCAwO1xuICAgICAgY29uc3Qgc2lnbWEwID0gcm90cihBLCAyKSBeIHJvdHIoQSwgMTMpIF4gcm90cihBLCAyMik7XG4gICAgICBjb25zdCBUMiA9IChzaWdtYTAgKyBNYWooQSwgQiwgQykpIHwgMDtcbiAgICAgIEggPSBHO1xuICAgICAgRyA9IEY7XG4gICAgICBGID0gRTtcbiAgICAgIEUgPSAoRCArIFQxKSB8IDA7XG4gICAgICBEID0gQztcbiAgICAgIEMgPSBCO1xuICAgICAgQiA9IEE7XG4gICAgICBBID0gKFQxICsgVDIpIHwgMDtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBjb21wcmVzc2VkIGNodW5rIHRvIHRoZSBjdXJyZW50IGhhc2ggdmFsdWVcbiAgICBBID0gKEEgKyB0aGlzLkEpIHwgMDtcbiAgICBCID0gKEIgKyB0aGlzLkIpIHwgMDtcbiAgICBDID0gKEMgKyB0aGlzLkMpIHwgMDtcbiAgICBEID0gKEQgKyB0aGlzLkQpIHwgMDtcbiAgICBFID0gKEUgKyB0aGlzLkUpIHwgMDtcbiAgICBGID0gKEYgKyB0aGlzLkYpIHwgMDtcbiAgICBHID0gKEcgKyB0aGlzLkcpIHwgMDtcbiAgICBIID0gKEggKyB0aGlzLkgpIHwgMDtcbiAgICB0aGlzLnNldChBLCBCLCBDLCBELCBFLCBGLCBHLCBIKTtcbiAgfVxuICBwcm90ZWN0ZWQgcm91bmRDbGVhbigpOiB2b2lkIHtcbiAgICBjbGVhbihTSEEyNTZfVyk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlcik7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItMjU2IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTI1NiBleHRlbmRzIFNIQTJfMzJCPF9TSEEyNTY+IHtcbiAgLy8gV2UgY2Fubm90IHVzZSBhcnJheSBoZXJlIHNpbmNlIGFycmF5IGFsbG93cyBpbmRleGluZyBieSB2YXJpYWJsZVxuICAvLyB3aGljaCBtZWFucyBvcHRpbWl6ZXIvY29tcGlsZXIgY2Fubm90IHVzZSByZWdpc3RlcnMuXG4gIHByb3RlY3RlZCBBOiBudW1iZXIgPSBTSEEyNTZfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQjogbnVtYmVyID0gU0hBMjU2X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEM6IG51bWJlciA9IFNIQTI1Nl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBEOiBudW1iZXIgPSBTSEEyNTZfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgRTogbnVtYmVyID0gU0hBMjU2X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIEY6IG51bWJlciA9IFNIQTI1Nl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBHOiBudW1iZXIgPSBTSEEyNTZfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgSDogbnVtYmVyID0gU0hBMjU2X0lWWzddIHwgMDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMzIpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTIyNCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEEyMjQgZXh0ZW5kcyBTSEEyXzMyQjxfU0hBMjI0PiB7XG4gIHByb3RlY3RlZCBBOiBudW1iZXIgPSBTSEEyMjRfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQjogbnVtYmVyID0gU0hBMjI0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEM6IG51bWJlciA9IFNIQTIyNF9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBEOiBudW1iZXIgPSBTSEEyMjRfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgRTogbnVtYmVyID0gU0hBMjI0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIEY6IG51bWJlciA9IFNIQTIyNF9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBHOiBudW1iZXIgPSBTSEEyMjRfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgSDogbnVtYmVyID0gU0hBMjI0X0lWWzddIHwgMDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMjgpO1xuICB9XG59XG5cbi8vIFNIQTItNTEyIGlzIHNsb3dlciB0aGFuIHNoYTI1NiBpbiBqcyBiZWNhdXNlIHU2NCBvcGVyYXRpb25zIGFyZSBzbG93LlxuXG4vLyBSb3VuZCBjb250YW50c1xuLy8gRmlyc3QgMzIgYml0cyBvZiB0aGUgZnJhY3Rpb25hbCBwYXJ0cyBvZiB0aGUgY3ViZSByb290cyBvZiB0aGUgZmlyc3QgODAgcHJpbWVzIDIuLjQwOVxuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBLNTEyID0gLyogQF9fUFVSRV9fICovICgoKSA9PiB1NjQuc3BsaXQoW1xuICAnMHg0MjhhMmY5OGQ3MjhhZTIyJywgJzB4NzEzNzQ0OTEyM2VmNjVjZCcsICcweGI1YzBmYmNmZWM0ZDNiMmYnLCAnMHhlOWI1ZGJhNTgxODlkYmJjJyxcbiAgJzB4Mzk1NmMyNWJmMzQ4YjUzOCcsICcweDU5ZjExMWYxYjYwNWQwMTknLCAnMHg5MjNmODJhNGFmMTk0ZjliJywgJzB4YWIxYzVlZDVkYTZkODExOCcsXG4gICcweGQ4MDdhYTk4YTMwMzAyNDInLCAnMHgxMjgzNWIwMTQ1NzA2ZmJlJywgJzB4MjQzMTg1YmU0ZWU0YjI4YycsICcweDU1MGM3ZGMzZDVmZmI0ZTInLFxuICAnMHg3MmJlNWQ3NGYyN2I4OTZmJywgJzB4ODBkZWIxZmUzYjE2OTZiMScsICcweDliZGMwNmE3MjVjNzEyMzUnLCAnMHhjMTliZjE3NGNmNjkyNjk0JyxcbiAgJzB4ZTQ5YjY5YzE5ZWYxNGFkMicsICcweGVmYmU0Nzg2Mzg0ZjI1ZTMnLCAnMHgwZmMxOWRjNjhiOGNkNWI1JywgJzB4MjQwY2ExY2M3N2FjOWM2NScsXG4gICcweDJkZTkyYzZmNTkyYjAyNzUnLCAnMHg0YTc0ODRhYTZlYTZlNDgzJywgJzB4NWNiMGE5ZGNiZDQxZmJkNCcsICcweDc2Zjk4OGRhODMxMTUzYjUnLFxuICAnMHg5ODNlNTE1MmVlNjZkZmFiJywgJzB4YTgzMWM2NmQyZGI0MzIxMCcsICcweGIwMDMyN2M4OThmYjIxM2YnLCAnMHhiZjU5N2ZjN2JlZWYwZWU0JyxcbiAgJzB4YzZlMDBiZjMzZGE4OGZjMicsICcweGQ1YTc5MTQ3OTMwYWE3MjUnLCAnMHgwNmNhNjM1MWUwMDM4MjZmJywgJzB4MTQyOTI5NjcwYTBlNmU3MCcsXG4gICcweDI3YjcwYTg1NDZkMjJmZmMnLCAnMHgyZTFiMjEzODVjMjZjOTI2JywgJzB4NGQyYzZkZmM1YWM0MmFlZCcsICcweDUzMzgwZDEzOWQ5NWIzZGYnLFxuICAnMHg2NTBhNzM1NDhiYWY2M2RlJywgJzB4NzY2YTBhYmIzYzc3YjJhOCcsICcweDgxYzJjOTJlNDdlZGFlZTYnLCAnMHg5MjcyMmM4NTE0ODIzNTNiJyxcbiAgJzB4YTJiZmU4YTE0Y2YxMDM2NCcsICcweGE4MWE2NjRiYmM0MjMwMDEnLCAnMHhjMjRiOGI3MGQwZjg5NzkxJywgJzB4Yzc2YzUxYTMwNjU0YmUzMCcsXG4gICcweGQxOTJlODE5ZDZlZjUyMTgnLCAnMHhkNjk5MDYyNDU1NjVhOTEwJywgJzB4ZjQwZTM1ODU1NzcxMjAyYScsICcweDEwNmFhMDcwMzJiYmQxYjgnLFxuICAnMHgxOWE0YzExNmI4ZDJkMGM4JywgJzB4MWUzNzZjMDg1MTQxYWI1MycsICcweDI3NDg3NzRjZGY4ZWViOTknLCAnMHgzNGIwYmNiNWUxOWI0OGE4JyxcbiAgJzB4MzkxYzBjYjNjNWM5NWE2MycsICcweDRlZDhhYTRhZTM0MThhY2InLCAnMHg1YjljY2E0Zjc3NjNlMzczJywgJzB4NjgyZTZmZjNkNmIyYjhhMycsXG4gICcweDc0OGY4MmVlNWRlZmIyZmMnLCAnMHg3OGE1NjM2ZjQzMTcyZjYwJywgJzB4ODRjODc4MTRhMWYwYWI3MicsICcweDhjYzcwMjA4MWE2NDM5ZWMnLFxuICAnMHg5MGJlZmZmYTIzNjMxZTI4JywgJzB4YTQ1MDZjZWJkZTgyYmRlOScsICcweGJlZjlhM2Y3YjJjNjc5MTUnLCAnMHhjNjcxNzhmMmUzNzI1MzJiJyxcbiAgJzB4Y2EyNzNlY2VlYTI2NjE5YycsICcweGQxODZiOGM3MjFjMGMyMDcnLCAnMHhlYWRhN2RkNmNkZTBlYjFlJywgJzB4ZjU3ZDRmN2ZlZTZlZDE3OCcsXG4gICcweDA2ZjA2N2FhNzIxNzZmYmEnLCAnMHgwYTYzN2RjNWEyYzg5OGE2JywgJzB4MTEzZjk4MDRiZWY5MGRhZScsICcweDFiNzEwYjM1MTMxYzQ3MWInLFxuICAnMHgyOGRiNzdmNTIzMDQ3ZDg0JywgJzB4MzJjYWFiN2I0MGM3MjQ5MycsICcweDNjOWViZTBhMTVjOWJlYmMnLCAnMHg0MzFkNjdjNDljMTAwZDRjJyxcbiAgJzB4NGNjNWQ0YmVjYjNlNDJiNicsICcweDU5N2YyOTljZmM2NTdlMmEnLCAnMHg1ZmNiNmZhYjNhZDZmYWVjJywgJzB4NmM0NDE5OGM0YTQ3NTgxNydcbl0ubWFwKG4gPT4gQmlnSW50KG4pKSkpKCk7XG5jb25zdCBTSEE1MTJfS2ggPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IEs1MTJbMF0pKCk7XG5jb25zdCBTSEE1MTJfS2wgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IEs1MTJbMV0pKCk7XG5cbi8vIFJldXNhYmxlIHRlbXBvcmFyeSBidWZmZXJzXG5jb25zdCBTSEE1MTJfV19IID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG5jb25zdCBTSEE1MTJfV19MID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG5cbi8qKiBJbnRlcm5hbCA2NC1ieXRlIGJhc2UgU0hBMiBoYXNoIGNsYXNzLiAqL1xuYWJzdHJhY3QgY2xhc3MgU0hBMl82NEI8VCBleHRlbmRzIFNIQTJfNjRCPFQ+PiBleHRlbmRzIEhhc2hNRDxUPiB7XG4gIC8vIFdlIGNhbm5vdCB1c2UgYXJyYXkgaGVyZSBzaW5jZSBhcnJheSBhbGxvd3MgaW5kZXhpbmcgYnkgdmFyaWFibGVcbiAgLy8gd2hpY2ggbWVhbnMgb3B0aW1pemVyL2NvbXBpbGVyIGNhbm5vdCB1c2UgcmVnaXN0ZXJzLlxuICAvLyBoIC0tIGhpZ2ggMzIgYml0cywgbCAtLSBsb3cgMzIgYml0c1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQWg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEFsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBCaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQmw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IENoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRGg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IERsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBFaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRWw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEZoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgR2g6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEdsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBIaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgSGw6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXRMZW46IG51bWJlcikge1xuICAgIHN1cGVyKDEyOCwgb3V0cHV0TGVuLCAxNiwgZmFsc2UpO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgZ2V0KCk6IFtcbiAgICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuICBdIHtcbiAgICBjb25zdCB7IEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsIH0gPSB0aGlzO1xuICAgIHJldHVybiBbQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGxdO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgc2V0KFxuICAgIEFoOiBudW1iZXIsIEFsOiBudW1iZXIsIEJoOiBudW1iZXIsIEJsOiBudW1iZXIsIENoOiBudW1iZXIsIENsOiBudW1iZXIsIERoOiBudW1iZXIsIERsOiBudW1iZXIsXG4gICAgRWg6IG51bWJlciwgRWw6IG51bWJlciwgRmg6IG51bWJlciwgRmw6IG51bWJlciwgR2g6IG51bWJlciwgR2w6IG51bWJlciwgSGg6IG51bWJlciwgSGw6IG51bWJlclxuICApOiB2b2lkIHtcbiAgICB0aGlzLkFoID0gQWggfCAwO1xuICAgIHRoaXMuQWwgPSBBbCB8IDA7XG4gICAgdGhpcy5CaCA9IEJoIHwgMDtcbiAgICB0aGlzLkJsID0gQmwgfCAwO1xuICAgIHRoaXMuQ2ggPSBDaCB8IDA7XG4gICAgdGhpcy5DbCA9IENsIHwgMDtcbiAgICB0aGlzLkRoID0gRGggfCAwO1xuICAgIHRoaXMuRGwgPSBEbCB8IDA7XG4gICAgdGhpcy5FaCA9IEVoIHwgMDtcbiAgICB0aGlzLkVsID0gRWwgfCAwO1xuICAgIHRoaXMuRmggPSBGaCB8IDA7XG4gICAgdGhpcy5GbCA9IEZsIHwgMDtcbiAgICB0aGlzLkdoID0gR2ggfCAwO1xuICAgIHRoaXMuR2wgPSBHbCB8IDA7XG4gICAgdGhpcy5IaCA9IEhoIHwgMDtcbiAgICB0aGlzLkhsID0gSGwgfCAwO1xuICB9XG4gIHByb3RlY3RlZCBwcm9jZXNzKHZpZXc6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEV4dGVuZCB0aGUgZmlyc3QgMTYgd29yZHMgaW50byB0aGUgcmVtYWluaW5nIDY0IHdvcmRzIHdbMTYuLjc5XSBvZiB0aGUgbWVzc2FnZSBzY2hlZHVsZSBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIHtcbiAgICAgIFNIQTUxMl9XX0hbaV0gPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgU0hBNTEyX1dfTFtpXSA9IHZpZXcuZ2V0VWludDMyKChvZmZzZXQgKz0gNCkpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTY7IGkgPCA4MDsgaSsrKSB7XG4gICAgICAvLyBzMCA6PSAod1tpLTE1XSByaWdodHJvdGF0ZSAxKSB4b3IgKHdbaS0xNV0gcmlnaHRyb3RhdGUgOCkgeG9yICh3W2ktMTVdIHJpZ2h0c2hpZnQgNylcbiAgICAgIGNvbnN0IFcxNWggPSBTSEE1MTJfV19IW2kgLSAxNV0gfCAwO1xuICAgICAgY29uc3QgVzE1bCA9IFNIQTUxMl9XX0xbaSAtIDE1XSB8IDA7XG4gICAgICBjb25zdCBzMGggPSB1NjQucm90clNIKFcxNWgsIFcxNWwsIDEpIF4gdTY0LnJvdHJTSChXMTVoLCBXMTVsLCA4KSBeIHU2NC5zaHJTSChXMTVoLCBXMTVsLCA3KTtcbiAgICAgIGNvbnN0IHMwbCA9IHU2NC5yb3RyU0woVzE1aCwgVzE1bCwgMSkgXiB1NjQucm90clNMKFcxNWgsIFcxNWwsIDgpIF4gdTY0LnNoclNMKFcxNWgsIFcxNWwsIDcpO1xuICAgICAgLy8gczEgOj0gKHdbaS0yXSByaWdodHJvdGF0ZSAxOSkgeG9yICh3W2ktMl0gcmlnaHRyb3RhdGUgNjEpIHhvciAod1tpLTJdIHJpZ2h0c2hpZnQgNilcbiAgICAgIGNvbnN0IFcyaCA9IFNIQTUxMl9XX0hbaSAtIDJdIHwgMDtcbiAgICAgIGNvbnN0IFcybCA9IFNIQTUxMl9XX0xbaSAtIDJdIHwgMDtcbiAgICAgIGNvbnN0IHMxaCA9IHU2NC5yb3RyU0goVzJoLCBXMmwsIDE5KSBeIHU2NC5yb3RyQkgoVzJoLCBXMmwsIDYxKSBeIHU2NC5zaHJTSChXMmgsIFcybCwgNik7XG4gICAgICBjb25zdCBzMWwgPSB1NjQucm90clNMKFcyaCwgVzJsLCAxOSkgXiB1NjQucm90ckJMKFcyaCwgVzJsLCA2MSkgXiB1NjQuc2hyU0woVzJoLCBXMmwsIDYpO1xuICAgICAgLy8gU0hBMjU2X1dbaV0gPSBzMCArIHMxICsgU0hBMjU2X1dbaSAtIDddICsgU0hBMjU2X1dbaSAtIDE2XTtcbiAgICAgIGNvbnN0IFNVTWwgPSB1NjQuYWRkNEwoczBsLCBzMWwsIFNIQTUxMl9XX0xbaSAtIDddLCBTSEE1MTJfV19MW2kgLSAxNl0pO1xuICAgICAgY29uc3QgU1VNaCA9IHU2NC5hZGQ0SChTVU1sLCBzMGgsIHMxaCwgU0hBNTEyX1dfSFtpIC0gN10sIFNIQTUxMl9XX0hbaSAtIDE2XSk7XG4gICAgICBTSEE1MTJfV19IW2ldID0gU1VNaCB8IDA7XG4gICAgICBTSEE1MTJfV19MW2ldID0gU1VNbCB8IDA7XG4gICAgfVxuICAgIGxldCB7IEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsIH0gPSB0aGlzO1xuICAgIC8vIENvbXByZXNzaW9uIGZ1bmN0aW9uIG1haW4gbG9vcCwgODAgcm91bmRzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4MDsgaSsrKSB7XG4gICAgICAvLyBTMSA6PSAoZSByaWdodHJvdGF0ZSAxNCkgeG9yIChlIHJpZ2h0cm90YXRlIDE4KSB4b3IgKGUgcmlnaHRyb3RhdGUgNDEpXG4gICAgICBjb25zdCBzaWdtYTFoID0gdTY0LnJvdHJTSChFaCwgRWwsIDE0KSBeIHU2NC5yb3RyU0goRWgsIEVsLCAxOCkgXiB1NjQucm90ckJIKEVoLCBFbCwgNDEpO1xuICAgICAgY29uc3Qgc2lnbWExbCA9IHU2NC5yb3RyU0woRWgsIEVsLCAxNCkgXiB1NjQucm90clNMKEVoLCBFbCwgMTgpIF4gdTY0LnJvdHJCTChFaCwgRWwsIDQxKTtcbiAgICAgIC8vY29uc3QgVDEgPSAoSCArIHNpZ21hMSArIENoaShFLCBGLCBHKSArIFNIQTI1Nl9LW2ldICsgU0hBMjU2X1dbaV0pIHwgMDtcbiAgICAgIGNvbnN0IENISWggPSAoRWggJiBGaCkgXiAofkVoICYgR2gpO1xuICAgICAgY29uc3QgQ0hJbCA9IChFbCAmIEZsKSBeICh+RWwgJiBHbCk7XG4gICAgICAvLyBUMSA9IEggKyBzaWdtYTEgKyBDaGkoRSwgRiwgRykgKyBTSEE1MTJfS1tpXSArIFNIQTUxMl9XW2ldXG4gICAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IFQxbGwgPSB1NjQuYWRkNUwoSGwsIHNpZ21hMWwsIENISWwsIFNIQTUxMl9LbFtpXSwgU0hBNTEyX1dfTFtpXSk7XG4gICAgICBjb25zdCBUMWggPSB1NjQuYWRkNUgoVDFsbCwgSGgsIHNpZ21hMWgsIENISWgsIFNIQTUxMl9LaFtpXSwgU0hBNTEyX1dfSFtpXSk7XG4gICAgICBjb25zdCBUMWwgPSBUMWxsIHwgMDtcbiAgICAgIC8vIFMwIDo9IChhIHJpZ2h0cm90YXRlIDI4KSB4b3IgKGEgcmlnaHRyb3RhdGUgMzQpIHhvciAoYSByaWdodHJvdGF0ZSAzOSlcbiAgICAgIGNvbnN0IHNpZ21hMGggPSB1NjQucm90clNIKEFoLCBBbCwgMjgpIF4gdTY0LnJvdHJCSChBaCwgQWwsIDM0KSBeIHU2NC5yb3RyQkgoQWgsIEFsLCAzOSk7XG4gICAgICBjb25zdCBzaWdtYTBsID0gdTY0LnJvdHJTTChBaCwgQWwsIDI4KSBeIHU2NC5yb3RyQkwoQWgsIEFsLCAzNCkgXiB1NjQucm90ckJMKEFoLCBBbCwgMzkpO1xuICAgICAgY29uc3QgTUFKaCA9IChBaCAmIEJoKSBeIChBaCAmIENoKSBeIChCaCAmIENoKTtcbiAgICAgIGNvbnN0IE1BSmwgPSAoQWwgJiBCbCkgXiAoQWwgJiBDbCkgXiAoQmwgJiBDbCk7XG4gICAgICBIaCA9IEdoIHwgMDtcbiAgICAgIEhsID0gR2wgfCAwO1xuICAgICAgR2ggPSBGaCB8IDA7XG4gICAgICBHbCA9IEZsIHwgMDtcbiAgICAgIEZoID0gRWggfCAwO1xuICAgICAgRmwgPSBFbCB8IDA7XG4gICAgICAoeyBoOiBFaCwgbDogRWwgfSA9IHU2NC5hZGQoRGggfCAwLCBEbCB8IDAsIFQxaCB8IDAsIFQxbCB8IDApKTtcbiAgICAgIERoID0gQ2ggfCAwO1xuICAgICAgRGwgPSBDbCB8IDA7XG4gICAgICBDaCA9IEJoIHwgMDtcbiAgICAgIENsID0gQmwgfCAwO1xuICAgICAgQmggPSBBaCB8IDA7XG4gICAgICBCbCA9IEFsIHwgMDtcbiAgICAgIGNvbnN0IEFsbCA9IHU2NC5hZGQzTChUMWwsIHNpZ21hMGwsIE1BSmwpO1xuICAgICAgQWggPSB1NjQuYWRkM0goQWxsLCBUMWgsIHNpZ21hMGgsIE1BSmgpO1xuICAgICAgQWwgPSBBbGwgfCAwO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGNvbXByZXNzZWQgY2h1bmsgdG8gdGhlIGN1cnJlbnQgaGFzaCB2YWx1ZVxuICAgICh7IGg6IEFoLCBsOiBBbCB9ID0gdTY0LmFkZCh0aGlzLkFoIHwgMCwgdGhpcy5BbCB8IDAsIEFoIHwgMCwgQWwgfCAwKSk7XG4gICAgKHsgaDogQmgsIGw6IEJsIH0gPSB1NjQuYWRkKHRoaXMuQmggfCAwLCB0aGlzLkJsIHwgMCwgQmggfCAwLCBCbCB8IDApKTtcbiAgICAoeyBoOiBDaCwgbDogQ2wgfSA9IHU2NC5hZGQodGhpcy5DaCB8IDAsIHRoaXMuQ2wgfCAwLCBDaCB8IDAsIENsIHwgMCkpO1xuICAgICh7IGg6IERoLCBsOiBEbCB9ID0gdTY0LmFkZCh0aGlzLkRoIHwgMCwgdGhpcy5EbCB8IDAsIERoIHwgMCwgRGwgfCAwKSk7XG4gICAgKHsgaDogRWgsIGw6IEVsIH0gPSB1NjQuYWRkKHRoaXMuRWggfCAwLCB0aGlzLkVsIHwgMCwgRWggfCAwLCBFbCB8IDApKTtcbiAgICAoeyBoOiBGaCwgbDogRmwgfSA9IHU2NC5hZGQodGhpcy5GaCB8IDAsIHRoaXMuRmwgfCAwLCBGaCB8IDAsIEZsIHwgMCkpO1xuICAgICh7IGg6IEdoLCBsOiBHbCB9ID0gdTY0LmFkZCh0aGlzLkdoIHwgMCwgdGhpcy5HbCB8IDAsIEdoIHwgMCwgR2wgfCAwKSk7XG4gICAgKHsgaDogSGgsIGw6IEhsIH0gPSB1NjQuYWRkKHRoaXMuSGggfCAwLCB0aGlzLkhsIHwgMCwgSGggfCAwLCBIbCB8IDApKTtcbiAgICB0aGlzLnNldChBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCk7XG4gIH1cbiAgcHJvdGVjdGVkIHJvdW5kQ2xlYW4oKTogdm9pZCB7XG4gICAgY2xlYW4oU0hBNTEyX1dfSCwgU0hBNTEyX1dfTCk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItNTEyIGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTUxMiBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTI+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBTSEE1MTJfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFNIQTUxMl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gU0hBNTEyX0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBTSEE1MTJfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFNIQTUxMl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gU0hBNTEyX0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBTSEE1MTJfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFNIQTUxMl9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gU0hBNTEyX0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBTSEE1MTJfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFNIQTUxMl9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFNIQTUxMl9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFNIQTUxMl9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFNIQTUxMl9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFNIQTUxMl9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFNIQTUxMl9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDY0KTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi0zODQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBMzg0IGV4dGVuZHMgU0hBMl82NEI8X1NIQTM4ND4ge1xuICBwcm90ZWN0ZWQgQWg6IG51bWJlciA9IFNIQTM4NF9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gU0hBMzg0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBTSEEzODRfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgQmw6IG51bWJlciA9IFNIQTM4NF9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gU0hBMzg0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBTSEEzODRfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRGg6IG51bWJlciA9IFNIQTM4NF9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gU0hBMzg0X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBTSEEzODRfSVZbOF0gfCAwO1xuICBwcm90ZWN0ZWQgRWw6IG51bWJlciA9IFNIQTM4NF9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gU0hBMzg0X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gU0hBMzg0X0lWWzExXSB8IDA7XG4gIHByb3RlY3RlZCBHaDogbnVtYmVyID0gU0hBMzg0X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gU0hBMzg0X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gU0hBMzg0X0lWWzE0XSB8IDA7XG4gIHByb3RlY3RlZCBIbDogbnVtYmVyID0gU0hBMzg0X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoNDgpO1xuICB9XG59XG5cbi8qKlxuICogVHJ1bmNhdGVkIFNIQTUxMi8yNTYgYW5kIFNIQTUxMi8yMjQuXG4gKiBTSEE1MTJfSVYgaXMgWE9SZWQgd2l0aCAweGE1YTVhNWE1YTVhNWE1YTUsIHRoZW4gdXNlZCBhcyBcImludGVybWVkaWFyeVwiIElWIG9mIFNIQTUxMi90LlxuICogVGhlbiB0IGhhc2hlcyBzdHJpbmcgdG8gcHJvZHVjZSByZXN1bHQgSVYuXG4gKiBTZWUgYHRlc3QvbWlzYy9zaGEyLWdlbi1pdi5qc2AuXG4gKi9cblxuLyoqIFNIQTUxMi8yMjQgSVYgKi9cbmNvbnN0IFQyMjRfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4OGMzZDM3YzgsIDB4MTk1NDRkYTIsIDB4NzNlMTk5NjYsIDB4ODlkY2Q0ZDYsIDB4MWRmYWI3YWUsIDB4MzJmZjljODIsIDB4Njc5ZGQ1MTQsIDB4NTgyZjlmY2YsXG4gIDB4MGY2ZDJiNjksIDB4N2JkNDRkYTgsIDB4NzdlMzZmNzMsIDB4MDRjNDg5NDIsIDB4M2Y5ZDg1YTgsIDB4NmExZDM2YzgsIDB4MTExMmU2YWQsIDB4OTFkNjkyYTEsXG5dKTtcblxuLyoqIFNIQTUxMi8yNTYgSVYgKi9cbmNvbnN0IFQyNTZfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4MjIzMTIxOTQsIDB4ZmMyYmY3MmMsIDB4OWY1NTVmYTMsIDB4Yzg0YzY0YzIsIDB4MjM5M2I4NmIsIDB4NmY1M2IxNTEsIDB4OTYzODc3MTksIDB4NTk0MGVhYmQsXG4gIDB4OTYyODNlZTIsIDB4YTg4ZWZmZTMsIDB4YmU1ZTFlMjUsIDB4NTM4NjM5OTIsIDB4MmIwMTk5ZmMsIDB4MmM4NWI4YWEsIDB4MGViNzJkZGMsIDB4ODFjNTJjYTIsXG5dKTtcblxuLyoqIEludGVybmFsIFNIQTItNTEyLzIyNCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTJfMjI0IGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMl8yMjQ+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBUMjI0X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBUMjI0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBUMjI0X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBUMjI0X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBUMjI0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBUMjI0X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBUMjI0X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBUMjI0X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBUMjI0X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBUMjI0X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBUMjI0X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gVDIyNF9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFQyMjRfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBUMjI0X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gVDIyNF9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFQyMjRfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigyOCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItNTEyLzI1NiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTJfMjU2IGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMl8yNTY+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBUMjU2X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBUMjU2X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBUMjU2X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBUMjU2X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBUMjU2X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBUMjU2X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBUMjU2X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBUMjU2X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBUMjU2X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBUMjU2X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBUMjU2X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gVDI1Nl9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFQyNTZfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBUMjU2X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gVDI1Nl9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFQyNTZfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigzMik7XG4gIH1cbn1cblxuLyoqXG4gKiBTSEEyLTI1NiBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuIEluIEpTIGl0J3MgdGhlIGZhc3Rlc3Q6IGV2ZW4gZmFzdGVyIHRoYW4gQmxha2UzLiBTb21lIGluZm86XG4gKlxuICogLSBUcnlpbmcgMl4xMjggaGFzaGVzIHdvdWxkIGdldCA1MCUgY2hhbmNlIG9mIGNvbGxpc2lvbiwgdXNpbmcgYmlydGhkYXkgYXR0YWNrLlxuICogLSBCVEMgbmV0d29yayBpcyBkb2luZyAyXjcwIGhhc2hlcy9zZWMgKDJeOTUgaGFzaGVzL3llYXIpIGFzIHBlciAyMDI1LlxuICogLSBFYWNoIHNoYTI1NiBoYXNoIGlzIGV4ZWN1dGluZyAyXjE4IGJpdCBvcGVyYXRpb25zLlxuICogLSBHb29kIDIwMjQgQVNJQ3MgY2FuIGRvIDIwMFRoL3NlYyB3aXRoIDM1MDAgd2F0dHMgb2YgcG93ZXIsIGNvcnJlc3BvbmRpbmcgdG8gMl4zNiBoYXNoZXMvam91bGUuXG4gKi9cbmV4cG9ydCBjb25zdCBzaGEyNTY6IENIYXNoPF9TSEEyNTY+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEEyNTYoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwMSlcbik7XG4vKiogU0hBMi0yMjQgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0ICovXG5leHBvcnQgY29uc3Qgc2hhMjI0OiBDSGFzaDxfU0hBMjI0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMjI0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDQpXG4pO1xuXG4vKiogU0hBMi01MTIgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMjogQ0hhc2g8X1NIQTUxMj4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTUxMigpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDAzKVxuKTtcbi8qKiBTSEEyLTM4NCBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuICovXG5leHBvcnQgY29uc3Qgc2hhMzg0OiBDSGFzaDxfU0hBMzg0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMzg0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDIpXG4pO1xuXG4vKipcbiAqIFNIQTItNTEyLzI1NiBcInRydW5jYXRlZFwiIGhhc2ggZnVuY3Rpb24sIHdpdGggaW1wcm92ZWQgcmVzaXN0YW5jZSB0byBsZW5ndGggZXh0ZW5zaW9uIGF0dGFja3MuXG4gKiBTZWUgdGhlIHBhcGVyIG9uIFt0cnVuY2F0ZWQgU0hBNTEyXShodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEwLzU0OC5wZGYpLlxuICovXG5leHBvcnQgY29uc3Qgc2hhNTEyXzI1NjogQ0hhc2g8X1NIQTUxMl8yNTY+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEE1MTJfMjU2KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDYpXG4pO1xuLyoqXG4gKiBTSEEyLTUxMi8yMjQgXCJ0cnVuY2F0ZWRcIiBoYXNoIGZ1bmN0aW9uLCB3aXRoIGltcHJvdmVkIHJlc2lzdGFuY2UgdG8gbGVuZ3RoIGV4dGVuc2lvbiBhdHRhY2tzLlxuICogU2VlIHRoZSBwYXBlciBvbiBbdHJ1bmNhdGVkIFNIQTUxMl0oaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMC81NDgucGRmKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMl8yMjQ6IENIYXNoPF9TSEE1MTJfMjI0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBNTEyXzIyNCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA1KVxuKTtcbiIsICIvKipcbiAqIEludGVybmFsIE1lcmtsZS1EYW1nYXJkIGhhc2ggdXRpbHMuXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IGFieXRlcywgYWV4aXN0cywgYW91dHB1dCwgY2xlYW4sIGNyZWF0ZVZpZXcsIHR5cGUgSGFzaCB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vKiogQ2hvaWNlOiBhID8gYiA6IGMgKi9cbmV4cG9ydCBmdW5jdGlvbiBDaGkoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoYSAmIGIpIF4gKH5hICYgYyk7XG59XG5cbi8qKiBNYWpvcml0eSBmdW5jdGlvbiwgdHJ1ZSBpZiBhbnkgdHdvIGlucHV0cyBpcyB0cnVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1haihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChhICYgYikgXiAoYSAmIGMpIF4gKGIgJiBjKTtcbn1cblxuLyoqXG4gKiBNZXJrbGUtRGFtZ2FyZCBoYXNoIGNvbnN0cnVjdGlvbiBiYXNlIGNsYXNzLlxuICogQ291bGQgYmUgdXNlZCB0byBjcmVhdGUgTUQ1LCBSSVBFTUQsIFNIQTEsIFNIQTIuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIYXNoTUQ8VCBleHRlbmRzIEhhc2hNRDxUPj4gaW1wbGVtZW50cyBIYXNoPFQ+IHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHByb2Nlc3MoYnVmOiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0KCk6IG51bWJlcltdO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0KC4uLmFyZ3M6IG51bWJlcltdKTogdm9pZDtcbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgcm91bmRDbGVhbigpOiB2b2lkO1xuXG4gIHJlYWRvbmx5IGJsb2NrTGVuOiBudW1iZXI7XG4gIHJlYWRvbmx5IG91dHB1dExlbjogbnVtYmVyO1xuICByZWFkb25seSBwYWRPZmZzZXQ6IG51bWJlcjtcbiAgcmVhZG9ubHkgaXNMRTogYm9vbGVhbjtcblxuICAvLyBGb3IgcGFydGlhbCB1cGRhdGVzIGxlc3MgdGhhbiBibG9jayBzaXplXG4gIHByb3RlY3RlZCBidWZmZXI6IFVpbnQ4QXJyYXk7XG4gIHByb3RlY3RlZCB2aWV3OiBEYXRhVmlldztcbiAgcHJvdGVjdGVkIGZpbmlzaGVkID0gZmFsc2U7XG4gIHByb3RlY3RlZCBsZW5ndGggPSAwO1xuICBwcm90ZWN0ZWQgcG9zID0gMDtcbiAgcHJvdGVjdGVkIGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKGJsb2NrTGVuOiBudW1iZXIsIG91dHB1dExlbjogbnVtYmVyLCBwYWRPZmZzZXQ6IG51bWJlciwgaXNMRTogYm9vbGVhbikge1xuICAgIHRoaXMuYmxvY2tMZW4gPSBibG9ja0xlbjtcbiAgICB0aGlzLm91dHB1dExlbiA9IG91dHB1dExlbjtcbiAgICB0aGlzLnBhZE9mZnNldCA9IHBhZE9mZnNldDtcbiAgICB0aGlzLmlzTEUgPSBpc0xFO1xuICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYmxvY2tMZW4pO1xuICAgIHRoaXMudmlldyA9IGNyZWF0ZVZpZXcodGhpcy5idWZmZXIpO1xuICB9XG4gIHVwZGF0ZShkYXRhOiBVaW50OEFycmF5KTogdGhpcyB7XG4gICAgYWV4aXN0cyh0aGlzKTtcbiAgICBhYnl0ZXMoZGF0YSk7XG4gICAgY29uc3QgeyB2aWV3LCBidWZmZXIsIGJsb2NrTGVuIH0gPSB0aGlzO1xuICAgIGNvbnN0IGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgIGZvciAobGV0IHBvcyA9IDA7IHBvcyA8IGxlbjsgKSB7XG4gICAgICBjb25zdCB0YWtlID0gTWF0aC5taW4oYmxvY2tMZW4gLSB0aGlzLnBvcywgbGVuIC0gcG9zKTtcbiAgICAgIC8vIEZhc3QgcGF0aDogd2UgaGF2ZSBhdCBsZWFzdCBvbmUgYmxvY2sgaW4gaW5wdXQsIGNhc3QgaXQgdG8gdmlldyBhbmQgcHJvY2Vzc1xuICAgICAgaWYgKHRha2UgPT09IGJsb2NrTGVuKSB7XG4gICAgICAgIGNvbnN0IGRhdGFWaWV3ID0gY3JlYXRlVmlldyhkYXRhKTtcbiAgICAgICAgZm9yICg7IGJsb2NrTGVuIDw9IGxlbiAtIHBvczsgcG9zICs9IGJsb2NrTGVuKSB0aGlzLnByb2Nlc3MoZGF0YVZpZXcsIHBvcyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnVmZmVyLnNldChkYXRhLnN1YmFycmF5KHBvcywgcG9zICsgdGFrZSksIHRoaXMucG9zKTtcbiAgICAgIHRoaXMucG9zICs9IHRha2U7XG4gICAgICBwb3MgKz0gdGFrZTtcbiAgICAgIGlmICh0aGlzLnBvcyA9PT0gYmxvY2tMZW4pIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGVuZ3RoICs9IGRhdGEubGVuZ3RoO1xuICAgIHRoaXMucm91bmRDbGVhbigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGRpZ2VzdEludG8ob3V0OiBVaW50OEFycmF5KTogdm9pZCB7XG4gICAgYWV4aXN0cyh0aGlzKTtcbiAgICBhb3V0cHV0KG91dCwgdGhpcyk7XG4gICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgLy8gUGFkZGluZ1xuICAgIC8vIFdlIGNhbiBhdm9pZCBhbGxvY2F0aW9uIG9mIGJ1ZmZlciBmb3IgcGFkZGluZyBjb21wbGV0ZWx5IGlmIGl0XG4gICAgLy8gd2FzIHByZXZpb3VzbHkgbm90IGFsbG9jYXRlZCBoZXJlLiBCdXQgaXQgd29uJ3QgY2hhbmdlIHBlcmZvcm1hbmNlLlxuICAgIGNvbnN0IHsgYnVmZmVyLCB2aWV3LCBibG9ja0xlbiwgaXNMRSB9ID0gdGhpcztcbiAgICBsZXQgeyBwb3MgfSA9IHRoaXM7XG4gICAgLy8gYXBwZW5kIHRoZSBiaXQgJzEnIHRvIHRoZSBtZXNzYWdlXG4gICAgYnVmZmVyW3BvcysrXSA9IDBiMTAwMDAwMDA7XG4gICAgY2xlYW4odGhpcy5idWZmZXIuc3ViYXJyYXkocG9zKSk7XG4gICAgLy8gd2UgaGF2ZSBsZXNzIHRoYW4gcGFkT2Zmc2V0IGxlZnQgaW4gYnVmZmVyLCBzbyB3ZSBjYW5ub3QgcHV0IGxlbmd0aCBpblxuICAgIC8vIGN1cnJlbnQgYmxvY2ssIG5lZWQgcHJvY2VzcyBpdCBhbmQgcGFkIGFnYWluXG4gICAgaWYgKHRoaXMucGFkT2Zmc2V0ID4gYmxvY2tMZW4gLSBwb3MpIHtcbiAgICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICAgIHBvcyA9IDA7XG4gICAgfVxuICAgIC8vIFBhZCB1bnRpbCBmdWxsIGJsb2NrIGJ5dGUgd2l0aCB6ZXJvc1xuICAgIGZvciAobGV0IGkgPSBwb3M7IGkgPCBibG9ja0xlbjsgaSsrKSBidWZmZXJbaV0gPSAwO1xuICAgIC8vIE5vdGU6IHNoYTUxMiByZXF1aXJlcyBsZW5ndGggdG8gYmUgMTI4Yml0IGludGVnZXIsIGJ1dCBsZW5ndGggaW4gSlMgd2lsbCBvdmVyZmxvdyBiZWZvcmUgdGhhdFxuICAgIC8vIFlvdSBuZWVkIHRvIHdyaXRlIGFyb3VuZCAyIGV4YWJ5dGVzICh1NjRfbWF4IC8gOCAvICgxMDI0Kio2KSkgZm9yIHRoaXMgdG8gaGFwcGVuLlxuICAgIC8vIFNvIHdlIGp1c3Qgd3JpdGUgbG93ZXN0IDY0IGJpdHMgb2YgdGhhdCB2YWx1ZS5cbiAgICB2aWV3LnNldEJpZ1VpbnQ2NChibG9ja0xlbiAtIDgsIEJpZ0ludCh0aGlzLmxlbmd0aCAqIDgpLCBpc0xFKTtcbiAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgY29uc3Qgb3ZpZXcgPSBjcmVhdGVWaWV3KG91dCk7XG4gICAgY29uc3QgbGVuID0gdGhpcy5vdXRwdXRMZW47XG4gICAgLy8gTk9URTogd2UgZG8gZGl2aXNpb24gYnkgNCBsYXRlciwgd2hpY2ggbXVzdCBiZSBmdXNlZCBpbiBzaW5nbGUgb3Agd2l0aCBtb2R1bG8gYnkgSklUXG4gICAgaWYgKGxlbiAlIDQpIHRocm93IG5ldyBFcnJvcignX3NoYTI6IG91dHB1dExlbiBtdXN0IGJlIGFsaWduZWQgdG8gMzJiaXQnKTtcbiAgICBjb25zdCBvdXRMZW4gPSBsZW4gLyA0O1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5nZXQoKTtcbiAgICBpZiAob3V0TGVuID4gc3RhdGUubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ19zaGEyOiBvdXRwdXRMZW4gYmlnZ2VyIHRoYW4gc3RhdGUnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dExlbjsgaSsrKSBvdmlldy5zZXRVaW50MzIoNCAqIGksIHN0YXRlW2ldLCBpc0xFKTtcbiAgfVxuICBkaWdlc3QoKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBidWZmZXIsIG91dHB1dExlbiB9ID0gdGhpcztcbiAgICB0aGlzLmRpZ2VzdEludG8oYnVmZmVyKTtcbiAgICBjb25zdCByZXMgPSBidWZmZXIuc2xpY2UoMCwgb3V0cHV0TGVuKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIF9jbG9uZUludG8odG8/OiBUKTogVCB7XG4gICAgdG8gfHw9IG5ldyAodGhpcy5jb25zdHJ1Y3RvciBhcyBhbnkpKCkgYXMgVDtcbiAgICB0by5zZXQoLi4udGhpcy5nZXQoKSk7XG4gICAgY29uc3QgeyBibG9ja0xlbiwgYnVmZmVyLCBsZW5ndGgsIGZpbmlzaGVkLCBkZXN0cm95ZWQsIHBvcyB9ID0gdGhpcztcbiAgICB0by5kZXN0cm95ZWQgPSBkZXN0cm95ZWQ7XG4gICAgdG8uZmluaXNoZWQgPSBmaW5pc2hlZDtcbiAgICB0by5sZW5ndGggPSBsZW5ndGg7XG4gICAgdG8ucG9zID0gcG9zO1xuICAgIGlmIChsZW5ndGggJSBibG9ja0xlbikgdG8uYnVmZmVyLnNldChidWZmZXIpO1xuICAgIHJldHVybiB0byBhcyB1bmtub3duIGFzIGFueTtcbiAgfVxuICBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fY2xvbmVJbnRvKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbml0aWFsIFNIQS0yIHN0YXRlOiBmcmFjdGlvbmFsIHBhcnRzIG9mIHNxdWFyZSByb290cyBvZiBmaXJzdCAxNiBwcmltZXMgMi4uNTMuXG4gKiBDaGVjayBvdXQgYHRlc3QvbWlzYy9zaGEyLWdlbi1pdi5qc2AgZm9yIHJlY29tcHV0YXRpb24gZ3VpZGUuXG4gKi9cblxuLyoqIEluaXRpYWwgU0hBMjU2IHN0YXRlLiBCaXRzIDAuLjMyIG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyLi4xOSAqL1xuZXhwb3J0IGNvbnN0IFNIQTI1Nl9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NmEwOWU2NjcsIDB4YmI2N2FlODUsIDB4M2M2ZWYzNzIsIDB4YTU0ZmY1M2EsIDB4NTEwZTUyN2YsIDB4OWIwNTY4OGMsIDB4MWY4M2Q5YWIsIDB4NWJlMGNkMTksXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBMjI0IHN0YXRlLiBCaXRzIDMyLi42NCBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMjMuLjUzICovXG5leHBvcnQgY29uc3QgU0hBMjI0X0lWOiBVaW50MzJBcnJheSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHhjMTA1OWVkOCwgMHgzNjdjZDUwNywgMHgzMDcwZGQxNywgMHhmNzBlNTkzOSwgMHhmZmMwMGIzMSwgMHg2ODU4MTUxMSwgMHg2NGY5OGZhNywgMHhiZWZhNGZhNCxcbl0pO1xuXG4vKiogSW5pdGlhbCBTSEEzODQgc3RhdGUuIEJpdHMgMC4uNjQgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIzLi41MyAqL1xuZXhwb3J0IGNvbnN0IFNIQTM4NF9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4Y2JiYjlkNWQsIDB4YzEwNTllZDgsIDB4NjI5YTI5MmEsIDB4MzY3Y2Q1MDcsIDB4OTE1OTAxNWEsIDB4MzA3MGRkMTcsIDB4MTUyZmVjZDgsIDB4ZjcwZTU5MzksXG4gIDB4NjczMzI2NjcsIDB4ZmZjMDBiMzEsIDB4OGViNDRhODcsIDB4Njg1ODE1MTEsIDB4ZGIwYzJlMGQsIDB4NjRmOThmYTcsIDB4NDdiNTQ4MWQsIDB4YmVmYTRmYTQsXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBNTEyIHN0YXRlLiBCaXRzIDAuLjY0IG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyLi4xOSAqL1xuZXhwb3J0IGNvbnN0IFNIQTUxMl9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NmEwOWU2NjcsIDB4ZjNiY2M5MDgsIDB4YmI2N2FlODUsIDB4ODRjYWE3M2IsIDB4M2M2ZWYzNzIsIDB4ZmU5NGY4MmIsIDB4YTU0ZmY1M2EsIDB4NWYxZDM2ZjEsXG4gIDB4NTEwZTUyN2YsIDB4YWRlNjgyZDEsIDB4OWIwNTY4OGMsIDB4MmIzZTZjMWYsIDB4MWY4M2Q5YWIsIDB4ZmI0MWJkNmIsIDB4NWJlMGNkMTksIDB4MTM3ZTIxNzksXG5dKTtcbiIsICIvKipcbiAqIFV0aWxpdGllcyBmb3IgaGV4LCBieXRlcywgQ1NQUk5HLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtaGFzaGVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG4vKiogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBVaW50OEFycmF5LiBCZSBjYXJlZnVsOiBub2RlanMgQnVmZmVyIHdpbGwgcmV0dXJuIHRydWUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCeXRlcyhhOiB1bmtub3duKTogYSBpcyBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGEgaW5zdGFuY2VvZiBVaW50OEFycmF5IHx8IChBcnJheUJ1ZmZlci5pc1ZpZXcoYSkgJiYgYS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnVWludDhBcnJheScpO1xufVxuXG4vKiogQXNzZXJ0cyBzb21ldGhpbmcgaXMgcG9zaXRpdmUgaW50ZWdlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbnVtYmVyKG46IG51bWJlciwgdGl0bGU6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIobikgfHwgbiA8IDApIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke3ByZWZpeH1leHBlY3RlZCBpbnRlZ2VyID49IDAsIGdvdCAke259YCk7XG4gIH1cbn1cblxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIFVpbnQ4QXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gYWJ5dGVzKHZhbHVlOiBVaW50OEFycmF5LCBsZW5ndGg/OiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBieXRlcyA9IGlzQnl0ZXModmFsdWUpO1xuICBjb25zdCBsZW4gPSB2YWx1ZT8ubGVuZ3RoO1xuICBjb25zdCBuZWVkc0xlbiA9IGxlbmd0aCAhPT0gdW5kZWZpbmVkO1xuICBpZiAoIWJ5dGVzIHx8IChuZWVkc0xlbiAmJiBsZW4gIT09IGxlbmd0aCkpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgY29uc3Qgb2ZMZW4gPSBuZWVkc0xlbiA/IGAgb2YgbGVuZ3RoICR7bGVuZ3RofWAgOiAnJztcbiAgICBjb25zdCBnb3QgPSBieXRlcyA/IGBsZW5ndGg9JHtsZW59YCA6IGB0eXBlPSR7dHlwZW9mIHZhbHVlfWA7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCArICdleHBlY3RlZCBVaW50OEFycmF5JyArIG9mTGVuICsgJywgZ290ICcgKyBnb3QpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIGhhc2ggKi9cbmV4cG9ydCBmdW5jdGlvbiBhaGFzaChoOiBDSGFzaCk6IHZvaWQge1xuICBpZiAodHlwZW9mIGggIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGguY3JlYXRlICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBFcnJvcignSGFzaCBtdXN0IHdyYXBwZWQgYnkgdXRpbHMuY3JlYXRlSGFzaGVyJyk7XG4gIGFudW1iZXIoaC5vdXRwdXRMZW4pO1xuICBhbnVtYmVyKGguYmxvY2tMZW4pO1xufVxuXG4vKiogQXNzZXJ0cyBhIGhhc2ggaW5zdGFuY2UgaGFzIG5vdCBiZWVuIGRlc3Ryb3llZCAvIGZpbmlzaGVkICovXG5leHBvcnQgZnVuY3Rpb24gYWV4aXN0cyhpbnN0YW5jZTogYW55LCBjaGVja0ZpbmlzaGVkID0gdHJ1ZSk6IHZvaWQge1xuICBpZiAoaW5zdGFuY2UuZGVzdHJveWVkKSB0aHJvdyBuZXcgRXJyb3IoJ0hhc2ggaW5zdGFuY2UgaGFzIGJlZW4gZGVzdHJveWVkJyk7XG4gIGlmIChjaGVja0ZpbmlzaGVkICYmIGluc3RhbmNlLmZpbmlzaGVkKSB0aHJvdyBuZXcgRXJyb3IoJ0hhc2gjZGlnZXN0KCkgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQnKTtcbn1cblxuLyoqIEFzc2VydHMgb3V0cHV0IGlzIHByb3Blcmx5LXNpemVkIGJ5dGUgYXJyYXkgKi9cbmV4cG9ydCBmdW5jdGlvbiBhb3V0cHV0KG91dDogYW55LCBpbnN0YW5jZTogYW55KTogdm9pZCB7XG4gIGFieXRlcyhvdXQsIHVuZGVmaW5lZCwgJ2RpZ2VzdEludG8oKSBvdXRwdXQnKTtcbiAgY29uc3QgbWluID0gaW5zdGFuY2Uub3V0cHV0TGVuO1xuICBpZiAob3V0Lmxlbmd0aCA8IG1pbikge1xuICAgIHRocm93IG5ldyBFcnJvcignXCJkaWdlc3RJbnRvKCkgb3V0cHV0XCIgZXhwZWN0ZWQgdG8gYmUgb2YgbGVuZ3RoID49JyArIG1pbik7XG4gIH1cbn1cblxuLyoqIEdlbmVyaWMgdHlwZSBlbmNvbXBhc3NpbmcgOC8xNi8zMi1ieXRlIGFycmF5cyAtIGJ1dCBub3QgNjQtYnl0ZS4gKi9cbi8vIHByZXR0aWVyLWlnbm9yZVxuZXhwb3J0IHR5cGUgVHlwZWRBcnJheSA9IEludDhBcnJheSB8IFVpbnQ4Q2xhbXBlZEFycmF5IHwgVWludDhBcnJheSB8XG4gIFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheTtcblxuLyoqIENhc3QgdTggLyB1MTYgLyB1MzIgdG8gdTguICovXG5leHBvcnQgZnVuY3Rpb24gdTgoYXJyOiBUeXBlZEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgYXJyLmJ5dGVMZW5ndGgpO1xufVxuXG4vKiogQ2FzdCB1OCAvIHUxNiAvIHUzMiB0byB1MzIuICovXG5leHBvcnQgZnVuY3Rpb24gdTMyKGFycjogVHlwZWRBcnJheSk6IFVpbnQzMkFycmF5IHtcbiAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgTWF0aC5mbG9vcihhcnIuYnl0ZUxlbmd0aCAvIDQpKTtcbn1cblxuLyoqIFplcm9pemUgYSBieXRlIGFycmF5LiBXYXJuaW5nOiBKUyBwcm92aWRlcyBubyBndWFyYW50ZWVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuKC4uLmFycmF5czogVHlwZWRBcnJheVtdKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXlzW2ldLmZpbGwoMCk7XG4gIH1cbn1cblxuLyoqIENyZWF0ZSBEYXRhVmlldyBvZiBhbiBhcnJheSBmb3IgZWFzeSBieXRlLWxldmVsIG1hbmlwdWxhdGlvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWaWV3KGFycjogVHlwZWRBcnJheSk6IERhdGFWaWV3IHtcbiAgcmV0dXJuIG5ldyBEYXRhVmlldyhhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgYXJyLmJ5dGVMZW5ndGgpO1xufVxuXG4vKiogVGhlIHJvdGF0ZSByaWdodCAoY2lyY3VsYXIgcmlnaHQgc2hpZnQpIG9wZXJhdGlvbiBmb3IgdWludDMyICovXG5leHBvcnQgZnVuY3Rpb24gcm90cih3b3JkOiBudW1iZXIsIHNoaWZ0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKHdvcmQgPDwgKDMyIC0gc2hpZnQpKSB8ICh3b3JkID4+PiBzaGlmdCk7XG59XG5cbi8qKiBUaGUgcm90YXRlIGxlZnQgKGNpcmN1bGFyIGxlZnQgc2hpZnQpIG9wZXJhdGlvbiBmb3IgdWludDMyICovXG5leHBvcnQgZnVuY3Rpb24gcm90bCh3b3JkOiBudW1iZXIsIHNoaWZ0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKHdvcmQgPDwgc2hpZnQpIHwgKCh3b3JkID4+PiAoMzIgLSBzaGlmdCkpID4+PiAwKTtcbn1cblxuLyoqIElzIGN1cnJlbnQgcGxhdGZvcm0gbGl0dGxlLWVuZGlhbj8gTW9zdCBhcmUuIEJpZy1FbmRpYW4gcGxhdGZvcm06IElCTSAqL1xuZXhwb3J0IGNvbnN0IGlzTEU6IGJvb2xlYW4gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIG5ldyBVaW50OEFycmF5KG5ldyBVaW50MzJBcnJheShbMHgxMTIyMzM0NF0pLmJ1ZmZlcilbMF0gPT09IDB4NDQpKCk7XG5cbi8qKiBUaGUgYnl0ZSBzd2FwIG9wZXJhdGlvbiBmb3IgdWludDMyICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZVN3YXAod29yZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChcbiAgICAoKHdvcmQgPDwgMjQpICYgMHhmZjAwMDAwMCkgfFxuICAgICgod29yZCA8PCA4KSAmIDB4ZmYwMDAwKSB8XG4gICAgKCh3b3JkID4+PiA4KSAmIDB4ZmYwMCkgfFxuICAgICgod29yZCA+Pj4gMjQpICYgMHhmZilcbiAgKTtcbn1cbi8qKiBDb25kaXRpb25hbGx5IGJ5dGUgc3dhcCBpZiBvbiBhIGJpZy1lbmRpYW4gcGxhdGZvcm0gKi9cbmV4cG9ydCBjb25zdCBzd2FwOElmQkU6IChuOiBudW1iZXIpID0+IG51bWJlciA9IGlzTEVcbiAgPyAobjogbnVtYmVyKSA9PiBuXG4gIDogKG46IG51bWJlcikgPT4gYnl0ZVN3YXAobik7XG5cbi8qKiBJbiBwbGFjZSBieXRlIHN3YXAgZm9yIFVpbnQzMkFycmF5ICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZVN3YXAzMihhcnI6IFVpbnQzMkFycmF5KTogVWludDMyQXJyYXkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGFycltpXSA9IGJ5dGVTd2FwKGFycltpXSk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZXhwb3J0IGNvbnN0IHN3YXAzMklmQkU6ICh1OiBVaW50MzJBcnJheSkgPT4gVWludDMyQXJyYXkgPSBpc0xFXG4gID8gKHU6IFVpbnQzMkFycmF5KSA9PiB1XG4gIDogYnl0ZVN3YXAzMjtcblxuLy8gQnVpbHQtaW4gaGV4IGNvbnZlcnNpb24gaHR0cHM6Ly9jYW5pdXNlLmNvbS9tZG4tamF2YXNjcmlwdF9idWlsdGluc191aW50OGFycmF5X2Zyb21oZXhcbmNvbnN0IGhhc0hleEJ1aWx0aW46IGJvb2xlYW4gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIC8vIEB0cy1pZ25vcmVcbiAgdHlwZW9mIFVpbnQ4QXJyYXkuZnJvbShbXSkudG9IZXggPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIFVpbnQ4QXJyYXkuZnJvbUhleCA9PT0gJ2Z1bmN0aW9uJykoKTtcblxuLy8gQXJyYXkgd2hlcmUgaW5kZXggMHhmMCAoMjQwKSBpcyBtYXBwZWQgdG8gc3RyaW5nICdmMCdcbmNvbnN0IGhleGVzID0gLyogQF9fUFVSRV9fICovIEFycmF5LmZyb20oeyBsZW5ndGg6IDI1NiB9LCAoXywgaSkgPT5cbiAgaS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKVxuKTtcblxuLyoqXG4gKiBDb252ZXJ0IGJ5dGUgYXJyYXkgdG8gaGV4IHN0cmluZy4gVXNlcyBidWlsdC1pbiBmdW5jdGlvbiwgd2hlbiBhdmFpbGFibGUuXG4gKiBAZXhhbXBsZSBieXRlc1RvSGV4KFVpbnQ4QXJyYXkuZnJvbShbMHhjYSwgMHhmZSwgMHgwMSwgMHgyM10pKSAvLyAnY2FmZTAxMjMnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvSGV4KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgYWJ5dGVzKGJ5dGVzKTtcbiAgLy8gQHRzLWlnbm9yZVxuICBpZiAoaGFzSGV4QnVpbHRpbikgcmV0dXJuIGJ5dGVzLnRvSGV4KCk7XG4gIC8vIHByZS1jYWNoaW5nIGltcHJvdmVzIHRoZSBzcGVlZCA2eFxuICBsZXQgaGV4ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBoZXggKz0gaGV4ZXNbYnl0ZXNbaV1dO1xuICB9XG4gIHJldHVybiBoZXg7XG59XG5cbi8vIFdlIHVzZSBvcHRpbWl6ZWQgdGVjaG5pcXVlIHRvIGNvbnZlcnQgaGV4IHN0cmluZyB0byBieXRlIGFycmF5XG5jb25zdCBhc2NpaXMgPSB7IF8wOiA0OCwgXzk6IDU3LCBBOiA2NSwgRjogNzAsIGE6IDk3LCBmOiAxMDIgfSBhcyBjb25zdDtcbmZ1bmN0aW9uIGFzY2lpVG9CYXNlMTYoY2g6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmIChjaCA+PSBhc2NpaXMuXzAgJiYgY2ggPD0gYXNjaWlzLl85KSByZXR1cm4gY2ggLSBhc2NpaXMuXzA7IC8vICcyJyA9PiA1MC00OFxuICBpZiAoY2ggPj0gYXNjaWlzLkEgJiYgY2ggPD0gYXNjaWlzLkYpIHJldHVybiBjaCAtIChhc2NpaXMuQSAtIDEwKTsgLy8gJ0InID0+IDY2LSg2NS0xMClcbiAgaWYgKGNoID49IGFzY2lpcy5hICYmIGNoIDw9IGFzY2lpcy5mKSByZXR1cm4gY2ggLSAoYXNjaWlzLmEgLSAxMCk7IC8vICdiJyA9PiA5OC0oOTctMTApXG4gIHJldHVybjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGhleCBzdHJpbmcgdG8gYnl0ZSBhcnJheS4gVXNlcyBidWlsdC1pbiBmdW5jdGlvbiwgd2hlbiBhdmFpbGFibGUuXG4gKiBAZXhhbXBsZSBoZXhUb0J5dGVzKCdjYWZlMDEyMycpIC8vIFVpbnQ4QXJyYXkuZnJvbShbMHhjYSwgMHhmZSwgMHgwMSwgMHgyM10pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgJyArIHR5cGVvZiBoZXgpO1xuICAvLyBAdHMtaWdub3JlXG4gIGlmIChoYXNIZXhCdWlsdGluKSByZXR1cm4gVWludDhBcnJheS5mcm9tSGV4KGhleCk7XG4gIGNvbnN0IGhsID0gaGV4Lmxlbmd0aDtcbiAgY29uc3QgYWwgPSBobCAvIDI7XG4gIGlmIChobCAlIDIpIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IHVucGFkZGVkIGhleCBvZiBsZW5ndGggJyArIGhsKTtcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShhbCk7XG4gIGZvciAobGV0IGFpID0gMCwgaGkgPSAwOyBhaSA8IGFsOyBhaSsrLCBoaSArPSAyKSB7XG4gICAgY29uc3QgbjEgPSBhc2NpaVRvQmFzZTE2KGhleC5jaGFyQ29kZUF0KGhpKSk7XG4gICAgY29uc3QgbjIgPSBhc2NpaVRvQmFzZTE2KGhleC5jaGFyQ29kZUF0KGhpICsgMSkpO1xuICAgIGlmIChuMSA9PT0gdW5kZWZpbmVkIHx8IG4yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSBoZXhbaGldICsgaGV4W2hpICsgMV07XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCBub24taGV4IGNoYXJhY3RlciBcIicgKyBjaGFyICsgJ1wiIGF0IGluZGV4ICcgKyBoaSk7XG4gICAgfVxuICAgIGFycmF5W2FpXSA9IG4xICogMTYgKyBuMjsgLy8gbXVsdGlwbHkgZmlyc3Qgb2N0ZXQsIGUuZy4gJ2EzJyA9PiAxMCoxNiszID0+IDE2MCArIDMgPT4gMTYzXG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIFRoZXJlIGlzIG5vIHNldEltbWVkaWF0ZSBpbiBicm93c2VyIGFuZCBzZXRUaW1lb3V0IGlzIHNsb3cuXG4gKiBDYWxsIG9mIGFzeW5jIGZuIHdpbGwgcmV0dXJuIFByb21pc2UsIHdoaWNoIHdpbGwgYmUgZnVsbGZpbGVkIG9ubHkgb25cbiAqIG5leHQgc2NoZWR1bGVyIHF1ZXVlIHByb2Nlc3Npbmcgc3RlcCBhbmQgdGhpcyBpcyBleGFjdGx5IHdoYXQgd2UgbmVlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5leHRUaWNrID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge307XG5cbi8qKiBSZXR1cm5zIGNvbnRyb2wgdG8gdGhyZWFkIGVhY2ggJ3RpY2snIG1zIHRvIGF2b2lkIGJsb2NraW5nLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzeW5jTG9vcChcbiAgaXRlcnM6IG51bWJlcixcbiAgdGljazogbnVtYmVyLFxuICBjYjogKGk6IG51bWJlcikgPT4gdm9pZFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCB0cyA9IERhdGUubm93KCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcnM7IGkrKykge1xuICAgIGNiKGkpO1xuICAgIC8vIERhdGUubm93KCkgaXMgbm90IG1vbm90b25pYywgc28gaW4gY2FzZSBpZiBjbG9jayBnb2VzIGJhY2t3YXJkcyB3ZSByZXR1cm4gcmV0dXJuIGNvbnRyb2wgdG9vXG4gICAgY29uc3QgZGlmZiA9IERhdGUubm93KCkgLSB0cztcbiAgICBpZiAoZGlmZiA+PSAwICYmIGRpZmYgPCB0aWNrKSBjb250aW51ZTtcbiAgICBhd2FpdCBuZXh0VGljaygpO1xuICAgIHRzICs9IGRpZmY7XG4gIH1cbn1cblxuLy8gR2xvYmFsIHN5bWJvbHMsIGJ1dCB0cyBkb2Vzbid0IHNlZSB0aGVtOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzMxNTM1XG5kZWNsYXJlIGNvbnN0IFRleHRFbmNvZGVyOiBhbnk7XG5cbi8qKlxuICogQ29udmVydHMgc3RyaW5nIHRvIGJ5dGVzIHVzaW5nIFVURjggZW5jb2RpbmcuXG4gKiBCdWlsdC1pbiBkb2Vzbid0IHZhbGlkYXRlIGlucHV0IHRvIGJlIHN0cmluZzogd2UgZG8gdGhlIGNoZWNrLlxuICogQGV4YW1wbGUgdXRmOFRvQnl0ZXMoJ2FiYycpIC8vIFVpbnQ4QXJyYXkuZnJvbShbOTcsIDk4LCA5OV0pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGY4VG9CeXRlcyhzdHI6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignc3RyaW5nIGV4cGVjdGVkJyk7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyKSk7IC8vIGh0dHBzOi8vYnVnemlsLmxhLzE2ODE4MDlcbn1cblxuLyoqIEtERnMgY2FuIGFjY2VwdCBzdHJpbmcgb3IgVWludDhBcnJheSBmb3IgdXNlciBjb252ZW5pZW5jZS4gKi9cbmV4cG9ydCB0eXBlIEtERklucHV0ID0gc3RyaW5nIHwgVWludDhBcnJheTtcblxuLyoqXG4gKiBIZWxwZXIgZm9yIEtERnM6IGNvbnN1bWVzIHVpbnQ4YXJyYXkgb3Igc3RyaW5nLlxuICogV2hlbiBzdHJpbmcgaXMgcGFzc2VkLCBkb2VzIHV0ZjggZGVjb2RpbmcsIHVzaW5nIFRleHREZWNvZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24ga2RmSW5wdXRUb0J5dGVzKGRhdGE6IEtERklucHV0LCBlcnJvclRpdGxlID0gJycpOiBVaW50OEFycmF5IHtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykgcmV0dXJuIHV0ZjhUb0J5dGVzKGRhdGEpO1xuICByZXR1cm4gYWJ5dGVzKGRhdGEsIHVuZGVmaW5lZCwgZXJyb3JUaXRsZSk7XG59XG5cbi8qKiBDb3BpZXMgc2V2ZXJhbCBVaW50OEFycmF5cyBpbnRvIG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXRCeXRlcyguLi5hcnJheXM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgc3VtID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgIGFieXRlcyhhKTtcbiAgICBzdW0gKz0gYS5sZW5ndGg7XG4gIH1cbiAgY29uc3QgcmVzID0gbmV3IFVpbnQ4QXJyYXkoc3VtKTtcbiAgZm9yIChsZXQgaSA9IDAsIHBhZCA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgIHJlcy5zZXQoYSwgcGFkKTtcbiAgICBwYWQgKz0gYS5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudHlwZSBFbXB0eU9iaiA9IHt9O1xuLyoqIE1lcmdlcyBkZWZhdWx0IG9wdGlvbnMgYW5kIHBhc3NlZCBvcHRpb25zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrT3B0czxUMSBleHRlbmRzIEVtcHR5T2JqLCBUMiBleHRlbmRzIEVtcHR5T2JqPihcbiAgZGVmYXVsdHM6IFQxLFxuICBvcHRzPzogVDJcbik6IFQxICYgVDIge1xuICBpZiAob3B0cyAhPT0gdW5kZWZpbmVkICYmIHt9LnRvU3RyaW5nLmNhbGwob3B0cykgIT09ICdbb2JqZWN0IE9iamVjdF0nKVxuICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucyBtdXN0IGJlIG9iamVjdCBvciB1bmRlZmluZWQnKTtcbiAgY29uc3QgbWVyZ2VkID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0cyk7XG4gIHJldHVybiBtZXJnZWQgYXMgVDEgJiBUMjtcbn1cblxuLyoqIENvbW1vbiBpbnRlcmZhY2UgZm9yIGFsbCBoYXNoZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhc2g8VD4ge1xuICBibG9ja0xlbjogbnVtYmVyOyAvLyBCeXRlcyBwZXIgYmxvY2tcbiAgb3V0cHV0TGVuOiBudW1iZXI7IC8vIEJ5dGVzIGluIG91dHB1dFxuICB1cGRhdGUoYnVmOiBVaW50OEFycmF5KTogdGhpcztcbiAgZGlnZXN0SW50byhidWY6IFVpbnQ4QXJyYXkpOiB2b2lkO1xuICBkaWdlc3QoKTogVWludDhBcnJheTtcbiAgZGVzdHJveSgpOiB2b2lkO1xuICBfY2xvbmVJbnRvKHRvPzogVCk6IFQ7XG4gIGNsb25lKCk6IFQ7XG59XG5cbi8qKiBQc2V1ZG9SYW5kb20gKG51bWJlcikgR2VuZXJhdG9yICovXG5leHBvcnQgaW50ZXJmYWNlIFBSRyB7XG4gIGFkZEVudHJvcHkoc2VlZDogVWludDhBcnJheSk6IHZvaWQ7XG4gIHJhbmRvbUJ5dGVzKGxlbmd0aDogbnVtYmVyKTogVWludDhBcnJheTtcbiAgY2xlYW4oKTogdm9pZDtcbn1cblxuLyoqXG4gKiBYT0Y6IHN0cmVhbWluZyBBUEkgdG8gcmVhZCBkaWdlc3QgaW4gY2h1bmtzLlxuICogU2FtZSBhcyAnc3F1ZWV6ZScgaW4ga2VjY2FrL2sxMiBhbmQgJ3NlZWsnIGluIGJsYWtlMywgYnV0IG1vcmUgZ2VuZXJpYyBuYW1lLlxuICogV2hlbiBoYXNoIHVzZWQgaW4gWE9GIG1vZGUgaXQgaXMgdXAgdG8gdXNlciB0byBjYWxsICcuZGVzdHJveScgYWZ0ZXJ3YXJkcywgc2luY2Ugd2UgY2Fubm90XG4gKiBkZXN0cm95IHN0YXRlLCBuZXh0IGNhbGwgY2FuIHJlcXVpcmUgbW9yZSBieXRlcy5cbiAqL1xuZXhwb3J0IHR5cGUgSGFzaFhPRjxUIGV4dGVuZHMgSGFzaDxUPj4gPSBIYXNoPFQ+ICYge1xuICB4b2YoYnl0ZXM6IG51bWJlcik6IFVpbnQ4QXJyYXk7IC8vIFJlYWQgJ2J5dGVzJyBieXRlcyBmcm9tIGRpZ2VzdCBzdHJlYW1cbiAgeG9mSW50byhidWY6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5OyAvLyByZWFkIGJ1Zi5sZW5ndGggYnl0ZXMgZnJvbSBkaWdlc3Qgc3RyZWFtIGludG8gYnVmXG59O1xuXG4vKiogSGFzaCBjb25zdHJ1Y3RvciAqL1xuZXhwb3J0IHR5cGUgSGFzaGVyQ29uczxULCBPcHRzID0gdW5kZWZpbmVkPiA9IE9wdHMgZXh0ZW5kcyB1bmRlZmluZWQgPyAoKSA9PiBUIDogKG9wdHM/OiBPcHRzKSA9PiBUO1xuLyoqIE9wdGlvbmFsIGhhc2ggcGFyYW1zLiAqL1xuZXhwb3J0IHR5cGUgSGFzaEluZm8gPSB7XG4gIG9pZD86IFVpbnQ4QXJyYXk7IC8vIERFUiBlbmNvZGVkIE9JRCBpbiBieXRlc1xufTtcbi8qKiBIYXNoIGZ1bmN0aW9uICovXG5leHBvcnQgdHlwZSBDSGFzaDxUIGV4dGVuZHMgSGFzaDxUPiA9IEhhc2g8YW55PiwgT3B0cyA9IHVuZGVmaW5lZD4gPSB7XG4gIG91dHB1dExlbjogbnVtYmVyO1xuICBibG9ja0xlbjogbnVtYmVyO1xufSAmIEhhc2hJbmZvICZcbiAgKE9wdHMgZXh0ZW5kcyB1bmRlZmluZWRcbiAgICA/IHtcbiAgICAgICAgKG1zZzogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGNyZWF0ZSgpOiBUO1xuICAgICAgfVxuICAgIDoge1xuICAgICAgICAobXNnOiBVaW50OEFycmF5LCBvcHRzPzogT3B0cyk6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGNyZWF0ZShvcHRzPzogT3B0cyk6IFQ7XG4gICAgICB9KTtcbi8qKiBYT0Ygd2l0aCBvdXRwdXQgKi9cbmV4cG9ydCB0eXBlIENIYXNoWE9GPFQgZXh0ZW5kcyBIYXNoWE9GPFQ+ID0gSGFzaFhPRjxhbnk+LCBPcHRzID0gdW5kZWZpbmVkPiA9IENIYXNoPFQsIE9wdHM+O1xuXG4vKiogQ3JlYXRlcyBmdW5jdGlvbiB3aXRoIG91dHB1dExlbiwgYmxvY2tMZW4sIGNyZWF0ZSBwcm9wZXJ0aWVzIGZyb20gYSBjbGFzcyBjb25zdHJ1Y3Rvci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIYXNoZXI8VCBleHRlbmRzIEhhc2g8VD4sIE9wdHMgPSB1bmRlZmluZWQ+KFxuICBoYXNoQ29uczogSGFzaGVyQ29uczxULCBPcHRzPixcbiAgaW5mbzogSGFzaEluZm8gPSB7fVxuKTogQ0hhc2g8VCwgT3B0cz4ge1xuICBjb25zdCBoYXNoQzogYW55ID0gKG1zZzogVWludDhBcnJheSwgb3B0cz86IE9wdHMpID0+IGhhc2hDb25zKG9wdHMpLnVwZGF0ZShtc2cpLmRpZ2VzdCgpO1xuICBjb25zdCB0bXAgPSBoYXNoQ29ucyh1bmRlZmluZWQpO1xuICBoYXNoQy5vdXRwdXRMZW4gPSB0bXAub3V0cHV0TGVuO1xuICBoYXNoQy5ibG9ja0xlbiA9IHRtcC5ibG9ja0xlbjtcbiAgaGFzaEMuY3JlYXRlID0gKG9wdHM/OiBPcHRzKSA9PiBoYXNoQ29ucyhvcHRzKTtcbiAgT2JqZWN0LmFzc2lnbihoYXNoQywgaW5mbyk7XG4gIHJldHVybiBPYmplY3QuZnJlZXplKGhhc2hDKTtcbn1cblxuLyoqIENyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBQUk5HLiBVc2VzIGludGVybmFsIE9TLWxldmVsIGBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21CeXRlcyhieXRlc0xlbmd0aCA9IDMyKTogVWludDhBcnJheSB7XG4gIGNvbnN0IGNyID0gdHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnID8gKGdsb2JhbFRoaXMgYXMgYW55KS5jcnlwdG8gOiBudWxsO1xuICBpZiAodHlwZW9mIGNyPy5nZXRSYW5kb21WYWx1ZXMgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzIG11c3QgYmUgZGVmaW5lZCcpO1xuICByZXR1cm4gY3IuZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KGJ5dGVzTGVuZ3RoKSk7XG59XG5cbi8qKiBDcmVhdGVzIE9JRCBvcHRzIGZvciBOSVNUIGhhc2hlcywgd2l0aCBwcmVmaXggMDYgMDkgNjAgODYgNDggMDEgNjUgMDMgMDQgMDIuICovXG5leHBvcnQgY29uc3Qgb2lkTmlzdCA9IChzdWZmaXg6IG51bWJlcik6IFJlcXVpcmVkPEhhc2hJbmZvPiA9PiAoe1xuICBvaWQ6IFVpbnQ4QXJyYXkuZnJvbShbMHgwNiwgMHgwOSwgMHg2MCwgMHg4NiwgMHg0OCwgMHgwMSwgMHg2NSwgMHgwMywgMHgwNCwgMHgwMiwgc3VmZml4XSksXG59KTtcbiIsICIvKipcbiAqIE1ldGhvZHMgZm9yIGVsbGlwdGljIGN1cnZlIG11bHRpcGxpY2F0aW9uIGJ5IHNjYWxhcnMuXG4gKiBDb250YWlucyB3TkFGLCBwaXBwZW5nZXIuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7IGJpdExlbiwgYml0TWFzaywgdHlwZSBTaWduZXIgfSBmcm9tICcuLi91dGlscy50cyc7XG5pbXBvcnQgeyBGaWVsZCwgRnBJbnZlcnRCYXRjaCwgdmFsaWRhdGVGaWVsZCwgdHlwZSBJRmllbGQgfSBmcm9tICcuL21vZHVsYXIudHMnO1xuXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzFuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxKTtcblxuZXhwb3J0IHR5cGUgQWZmaW5lUG9pbnQ8VD4gPSB7XG4gIHg6IFQ7XG4gIHk6IFQ7XG59ICYgeyBaPzogbmV2ZXIgfTtcblxuLy8gV2UgY2FuJ3QgXCJhYnN0cmFjdCBvdXRcIiBjb29yZGluYXRlcyAoWCwgWSwgWjsgYW5kIFQgaW4gRWR3YXJkcyk6IGFyZ3VtZW50IG5hbWVzIG9mIGNvbnN0cnVjdG9yXG4vLyBhcmUgbm90IGFjY2Vzc2libGUuIFNlZSBUeXBlc2NyaXB0IGdoLTU2MDkzLCBnaC00MTU5NC5cbi8vXG4vLyBXZSBoYXZlIHRvIHVzZSByZWN1cnNpdmUgdHlwZXMsIHNvIGl0IHdpbGwgcmV0dXJuIGFjdHVhbCBwb2ludCwgbm90IGNvbnN0YWluZWQgYEN1cnZlUG9pbnRgLlxuLy8gSWYsIGF0IGFueSBwb2ludCwgUCBpcyBgYW55YCwgaXQgd2lsbCBlcmFzZSBhbGwgdHlwZXMgYW5kIHJlcGxhY2UgaXRcbi8vIHdpdGggYGFueWAsIGJlY2F1c2Ugb2YgcmVjdXJzaW9uLCBgYW55IGltcGxlbWVudHMgQ3VydmVQb2ludGAsXG4vLyBidXQgd2UgbG9zZSBhbGwgY29uc3RyYWlucyBvbiBtZXRob2RzLlxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBlbGxpcHRpYyBjdXJ2ZSBQb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIEN1cnZlUG9pbnQ8RiwgUCBleHRlbmRzIEN1cnZlUG9pbnQ8RiwgUD4+IHtcbiAgLyoqIEFmZmluZSB4IGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIHByb2plY3RpdmUgLyBleHRlbmRlZCBYIGNvb3JkaW5hdGUuICovXG4gIHg6IEY7XG4gIC8qKiBBZmZpbmUgeSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIC8gZXh0ZW5kZWQgWSBjb29yZGluYXRlLiAqL1xuICB5OiBGO1xuICBaPzogRjtcbiAgZG91YmxlKCk6IFA7XG4gIG5lZ2F0ZSgpOiBQO1xuICBhZGQob3RoZXI6IFApOiBQO1xuICBzdWJ0cmFjdChvdGhlcjogUCk6IFA7XG4gIGVxdWFscyhvdGhlcjogUCk6IGJvb2xlYW47XG4gIG11bHRpcGx5KHNjYWxhcjogYmlnaW50KTogUDtcbiAgYXNzZXJ0VmFsaWRpdHkoKTogdm9pZDtcbiAgY2xlYXJDb2ZhY3RvcigpOiBQO1xuICBpczAoKTogYm9vbGVhbjtcbiAgaXNUb3JzaW9uRnJlZSgpOiBib29sZWFuO1xuICBpc1NtYWxsT3JkZXIoKTogYm9vbGVhbjtcbiAgbXVsdGlwbHlVbnNhZmUoc2NhbGFyOiBiaWdpbnQpOiBQO1xuICAvKipcbiAgICogTWFzc2l2ZWx5IHNwZWVkcyB1cCBgcC5tdWx0aXBseShuKWAgYnkgdXNpbmcgcHJlY29tcHV0ZSB0YWJsZXMgKGNhY2hpbmcpLiBTZWUge0BsaW5rIHdOQUZ9LlxuICAgKiBAcGFyYW0gaXNMYXp5IGNhbGN1bGF0ZSBjYWNoZSBub3cuIERlZmF1bHQgKHRydWUpIGVuc3VyZXMgaXQncyBkZWZlcnJlZCB0byBmaXJzdCBgbXVsdGlwbHkoKWBcbiAgICovXG4gIHByZWNvbXB1dGUod2luZG93U2l6ZT86IG51bWJlciwgaXNMYXp5PzogYm9vbGVhbik6IFA7XG4gIC8qKiBDb252ZXJ0cyBwb2ludCB0byAyRCB4eSBhZmZpbmUgY29vcmRpbmF0ZXMgKi9cbiAgdG9BZmZpbmUoaW52ZXJ0ZWRaPzogRik6IEFmZmluZVBvaW50PEY+O1xuICB0b0J5dGVzKCk6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KCk6IHN0cmluZztcbn1cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgZWxsaXB0aWMgY3VydmUgUG9pbnQgY29uc3RydWN0b3JzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDdXJ2ZVBvaW50Q29uczxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PiB7XG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdOiAoaXRlbTogdW5rbm93bikgPT4gYm9vbGVhbjtcbiAgQkFTRTogUDtcbiAgWkVSTzogUDtcbiAgLyoqIEZpZWxkIGZvciBiYXNpYyBjdXJ2ZSBtYXRoICovXG4gIEZwOiBJRmllbGQ8UF9GPFA+PjtcbiAgLyoqIFNjYWxhciBmaWVsZCwgZm9yIHNjYWxhcnMgaW4gbXVsdGlwbHkgYW5kIG90aGVycyAqL1xuICBGbjogSUZpZWxkPGJpZ2ludD47XG4gIC8qKiBDcmVhdGVzIHBvaW50IGZyb20geCwgeS4gRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgZnJvbUFmZmluZShwOiBBZmZpbmVQb2ludDxQX0Y8UD4+KTogUDtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogUDtcbiAgZnJvbUhleChoZXg6IHN0cmluZyk6IFA7XG59XG5cbi8vIFR5cGUgaW5mZXJlbmNlIGhlbHBlcnM6IFBDIC0gUG9pbnRDb25zdHJ1Y3RvciwgUCAtIFBvaW50LCBGcCAtIEZpZWxkIGVsZW1lbnRcbi8vIFNob3J0IG5hbWVzLCBiZWNhdXNlIHdlIHVzZSB0aGVtIGEgbG90IGluIHJlc3VsdCB0eXBlczpcbi8vICogd2UgY2FuJ3QgZG8gJ1AgPSBHZXRDdXJ2ZVBvaW50PFBDPic6IHRoaXMgaXMgZGVmYXVsdCB2YWx1ZSBhbmQgZG9lc24ndCBjb25zdHJhaW4gYW55dGhpbmdcbi8vICogd2UgY2FuJ3QgZG8gJ3R5cGUgWCA9IEdldEN1cnZlUG9pbnQ8UEM+JzogaXQgd29uJ3QgYmUgYWNjZXNpYmxlIGZvciBhcmd1bWVudHMvcmV0dXJuIHR5cGVzXG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PmAgY29uc3RyYWludHMgZnJvbSBpbnRlcmZhY2UgZGVmaW5pdGlvblxuLy8gICB3b24ndCBwcm9wYWdhdGUsIGlmIGBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPGFueT5gOiB0aGUgUCB3b3VsZCBiZSAnYW55Jywgd2hpY2ggaXMgaW5jb3JyZWN0XG4vLyAqIFBDIGNvdWxkIGJlIHN1cGVyIHNwZWNpZmljIHdpdGggc3VwZXIgc3BlY2lmaWMgUCwgd2hpY2ggaW1wbGVtZW50cyBDdXJ2ZVBvaW50PGFueSwgUD4uXG4vLyAgIHRoaXMgbWVhbnMgd2UgbmVlZCB0byBkbyBzdHVmZiBsaWtlXG4vLyAgIGBmdW5jdGlvbiB0ZXN0PFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KGBcbi8vICAgaWYgd2Ugd2FudCB0eXBlIHNhZmV0eSBhcm91bmQgUCwgb3RoZXJ3aXNlIFBDX1A8UEM+IHdpbGwgYmUgYW55XG5cbi8qKiBSZXR1cm5zIEZwIHR5cGUgZnJvbSBQb2ludCAoUF9GPFA+ID09IFAuRikgKi9cbmV4cG9ydCB0eXBlIFBfRjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PiA9IFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGluZmVyIEYsIFA+ID8gRiA6IG5ldmVyO1xuLyoqIFJldHVybnMgRnAgdHlwZSBmcm9tIFBvaW50Q29ucyAoUENfRjxQQz4gPT0gUEMuUC5GKSAqL1xuZXhwb3J0IHR5cGUgUENfRjxQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+Pj4gPSBQQ1snRnAnXVsnWkVSTyddO1xuLyoqIFJldHVybnMgUG9pbnQgdHlwZSBmcm9tIFBvaW50Q29ucyAoUENfUDxQQz4gPT0gUEMuUCkgKi9cbmV4cG9ydCB0eXBlIFBDX1A8UEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj4+ID0gUENbJ1pFUk8nXTtcblxuLy8gVWdseSBoYWNrIHRvIGdldCBwcm9wZXIgdHlwZSBpbmZlcmVuY2UsIGJlY2F1c2UgaW4gdHlwZXNjcmlwdCBmYWlscyB0byBpbmZlciByZXN1cnNpdmVseS5cbi8vIFRoZSBoYWNrIGFsbG93cyB0byBkbyB1cCB0byAxMCBjaGFpbmVkIG9wZXJhdGlvbnMgd2l0aG91dCBhcHBseWluZyB0eXBlIGVyYXN1cmUuXG4vL1xuLy8gVHlwZXMgd2hpY2ggd29uJ3Qgd29yazpcbi8vICogYEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+PmAsIHdpbGwgcmV0dXJuIGBhbnlgIGFmdGVyIDEgb3BlcmF0aW9uXG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxhbnk+OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+IGV4dGVuZHMgQ3VydmVQb2ludENvbnM8YW55PiA9IGZhbHNlYFxuLy8gKiBgUCBleHRlbmRzIEN1cnZlUG9pbnQsIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD5gXG4vLyAgICAgKiBJdCBjYW4ndCBpbmZlciBQIGZyb20gUEMgYWxvbmVcbi8vICAgICAqIFRvbyBtYW55IHJlbGF0aW9ucyBiZXR3ZWVuIEYsIFAgJiBQQ1xuLy8gICAgICogSXQgd2lsbCBpbmZlciBQL0YgaWYgYGFyZzogQ3VydmVQb2ludENvbnM8RiwgUD5gLCBidXQgd2lsbCBmYWlsIGlmIFBDIGlzIGdlbmVyaWNcbi8vICAgICAqIEl0IHdpbGwgd29yayBjb3JyZWN0bHkgaWYgdGhlcmUgaXMgYW4gYWRkaXRpb25hbCBhcmd1bWVudCBvZiB0eXBlIFBcbi8vICAgICAqIEJ1dCBnZW5lcmFsbHksIHdlIGRvbid0IHdhbnQgdG8gcGFyYW1ldHJpemUgYEN1cnZlUG9pbnRDb25zYCBvdmVyIGBGYDogaXQgd2lsbCBjb21wbGljYXRlXG4vLyAgICAgICB0eXBlcywgbWFraW5nIHRoZW0gdW4taW5mZXJhYmxlXG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCB0eXBlIFBDX0FOWSA9IEN1cnZlUG9pbnRDb25zPFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSwgYW55PlxuICA+Pj4+Pj4+Pj5cbj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3VydmVMZW5ndGhzIHtcbiAgc2VjcmV0S2V5PzogbnVtYmVyO1xuICBwdWJsaWNLZXk/OiBudW1iZXI7XG4gIHB1YmxpY0tleVVuY29tcHJlc3NlZD86IG51bWJlcjtcbiAgcHVibGljS2V5SGFzUHJlZml4PzogYm9vbGVhbjtcbiAgc2lnbmF0dXJlPzogbnVtYmVyO1xuICBzZWVkPzogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBNYXBwZXI8VD4gPSAoaTogVFtdKSA9PiBUW107XG5cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGVDdDxUIGV4dGVuZHMgeyBuZWdhdGU6ICgpID0+IFQgfT4oY29uZGl0aW9uOiBib29sZWFuLCBpdGVtOiBUKTogVCB7XG4gIGNvbnN0IG5lZyA9IGl0ZW0ubmVnYXRlKCk7XG4gIHJldHVybiBjb25kaXRpb24gPyBuZWcgOiBpdGVtO1xufVxuXG4vKipcbiAqIFRha2VzIGEgYnVuY2ggb2YgUHJvamVjdGl2ZSBQb2ludHMgYnV0IGV4ZWN1dGVzIG9ubHkgb25lXG4gKiBpbnZlcnNpb24gb24gYWxsIG9mIHRoZW0uIEludmVyc2lvbiBpcyB2ZXJ5IHNsb3cgb3BlcmF0aW9uLFxuICogc28gdGhpcyBpbXByb3ZlcyBwZXJmb3JtYW5jZSBtYXNzaXZlbHkuXG4gKiBPcHRpbWl6YXRpb246IGNvbnZlcnRzIGEgbGlzdCBvZiBwcm9qZWN0aXZlIHBvaW50cyB0byBhIGxpc3Qgb2YgaWRlbnRpY2FsIHBvaW50cyB3aXRoIFo9MS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVo8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIGM6IFBDLFxuICBwb2ludHM6IFBbXVxuKTogUFtdIHtcbiAgY29uc3QgaW52ZXJ0ZWRacyA9IEZwSW52ZXJ0QmF0Y2goXG4gICAgYy5GcCxcbiAgICBwb2ludHMubWFwKChwKSA9PiBwLlohKVxuICApO1xuICByZXR1cm4gcG9pbnRzLm1hcCgocCwgaSkgPT4gYy5mcm9tQWZmaW5lKHAudG9BZmZpbmUoaW52ZXJ0ZWRac1tpXSkpKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVXKFc6IG51bWJlciwgYml0czogbnVtYmVyKSB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoVykgfHwgVyA8PSAwIHx8IFcgPiBiaXRzKVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB3aW5kb3cgc2l6ZSwgZXhwZWN0ZWQgWzEuLicgKyBiaXRzICsgJ10sIGdvdCBXPScgKyBXKTtcbn1cblxuLyoqIEludGVybmFsIHdOQUYgb3B0cyBmb3Igc3BlY2lmaWMgVyBhbmQgc2NhbGFyQml0cyAqL1xudHlwZSBXT3B0cyA9IHtcbiAgd2luZG93czogbnVtYmVyO1xuICB3aW5kb3dTaXplOiBudW1iZXI7XG4gIG1hc2s6IGJpZ2ludDtcbiAgbWF4TnVtYmVyOiBudW1iZXI7XG4gIHNoaWZ0Qnk6IGJpZ2ludDtcbn07XG5cbmZ1bmN0aW9uIGNhbGNXT3B0cyhXOiBudW1iZXIsIHNjYWxhckJpdHM6IG51bWJlcik6IFdPcHRzIHtcbiAgdmFsaWRhdGVXKFcsIHNjYWxhckJpdHMpO1xuICBjb25zdCB3aW5kb3dzID0gTWF0aC5jZWlsKHNjYWxhckJpdHMgLyBXKSArIDE7IC8vIFc9OCAzMy4gTm90IDMyLCBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCB3aW5kb3dTaXplID0gMiAqKiAoVyAtIDEpOyAvLyBXPTggMTI4LiBOb3QgMjU2LCBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCBtYXhOdW1iZXIgPSAyICoqIFc7IC8vIFc9OCAyNTZcbiAgY29uc3QgbWFzayA9IGJpdE1hc2soVyk7IC8vIFc9OCAyNTUgPT0gbWFzayAwYjExMTExMTExXG4gIGNvbnN0IHNoaWZ0QnkgPSBCaWdJbnQoVyk7IC8vIFc9OCA4XG4gIHJldHVybiB7IHdpbmRvd3MsIHdpbmRvd1NpemUsIG1hc2ssIG1heE51bWJlciwgc2hpZnRCeSB9O1xufVxuXG5mdW5jdGlvbiBjYWxjT2Zmc2V0cyhuOiBiaWdpbnQsIHdpbmRvdzogbnVtYmVyLCB3T3B0czogV09wdHMpIHtcbiAgY29uc3QgeyB3aW5kb3dTaXplLCBtYXNrLCBtYXhOdW1iZXIsIHNoaWZ0QnkgfSA9IHdPcHRzO1xuICBsZXQgd2JpdHMgPSBOdW1iZXIobiAmIG1hc2spOyAvLyBleHRyYWN0IFcgYml0cy5cbiAgbGV0IG5leHROID0gbiA+PiBzaGlmdEJ5OyAvLyBzaGlmdCBudW1iZXIgYnkgVyBiaXRzLlxuXG4gIC8vIFdoYXQgYWN0dWFsbHkgaGFwcGVucyBoZXJlOlxuICAvLyBjb25zdCBoaWdoZXN0Qml0ID0gTnVtYmVyKG1hc2sgXiAobWFzayA+PiAxbikpO1xuICAvLyBsZXQgd2JpdHMyID0gd2JpdHMgLSAxOyAvLyBza2lwIHplcm9cbiAgLy8gaWYgKHdiaXRzMiAmIGhpZ2hlc3RCaXQpIHsgd2JpdHMyIF49IE51bWJlcihtYXNrKTsgLy8gKH4pO1xuXG4gIC8vIHNwbGl0IGlmIGJpdHMgPiBtYXg6ICsyMjQgPT4gMjU2LTMyXG4gIGlmICh3Yml0cyA+IHdpbmRvd1NpemUpIHtcbiAgICAvLyB3ZSBza2lwIHplcm8sIHdoaWNoIG1lYW5zIGluc3RlYWQgb2YgYD49IHNpemUtMWAsIHdlIGRvIGA+IHNpemVgXG4gICAgd2JpdHMgLT0gbWF4TnVtYmVyOyAvLyAtMzIsIGNhbiBiZSBtYXhOdW1iZXIgLSB3Yml0cywgYnV0IHRoZW4gd2UgbmVlZCB0byBzZXQgaXNOZWcgaGVyZS5cbiAgICBuZXh0TiArPSBfMW47IC8vICsyNTYgKGNhcnJ5KVxuICB9XG4gIGNvbnN0IG9mZnNldFN0YXJ0ID0gd2luZG93ICogd2luZG93U2l6ZTtcbiAgY29uc3Qgb2Zmc2V0ID0gb2Zmc2V0U3RhcnQgKyBNYXRoLmFicyh3Yml0cykgLSAxOyAvLyAtMSBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCBpc1plcm8gPSB3Yml0cyA9PT0gMDsgLy8gaXMgY3VycmVudCB3aW5kb3cgc2xpY2UgYSAwP1xuICBjb25zdCBpc05lZyA9IHdiaXRzIDwgMDsgLy8gaXMgY3VycmVudCB3aW5kb3cgc2xpY2UgbmVnYXRpdmU/XG4gIGNvbnN0IGlzTmVnRiA9IHdpbmRvdyAlIDIgIT09IDA7IC8vIGZha2UgcmFuZG9tIHN0YXRlbWVudCBmb3Igbm9pc2VcbiAgY29uc3Qgb2Zmc2V0RiA9IG9mZnNldFN0YXJ0OyAvLyBmYWtlIG9mZnNldCBmb3Igbm9pc2VcbiAgcmV0dXJuIHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZywgaXNOZWdGLCBvZmZzZXRGIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50czogYW55W10sIGM6IGFueSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkocG9pbnRzKSkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBleHBlY3RlZCcpO1xuICBwb2ludHMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgIGlmICghKHAgaW5zdGFuY2VvZiBjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBvaW50IGF0IGluZGV4ICcgKyBpKTtcbiAgfSk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFyczogYW55W10sIGZpZWxkOiBhbnkpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjYWxhcnMpKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG9mIHNjYWxhcnMgZXhwZWN0ZWQnKTtcbiAgc2NhbGFycy5mb3JFYWNoKChzLCBpKSA9PiB7XG4gICAgaWYgKCFmaWVsZC5pc1ZhbGlkKHMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyIGF0IGluZGV4ICcgKyBpKTtcbiAgfSk7XG59XG5cbi8vIFNpbmNlIHBvaW50cyBpbiBkaWZmZXJlbnQgZ3JvdXBzIGNhbm5vdCBiZSBlcXVhbCAoZGlmZmVyZW50IG9iamVjdCBjb25zdHJ1Y3RvciksXG4vLyB3ZSBjYW4gaGF2ZSBzaW5nbGUgcGxhY2UgdG8gc3RvcmUgcHJlY29tcHV0ZXMuXG4vLyBBbGxvd3MgdG8gbWFrZSBwb2ludHMgZnJvemVuIC8gaW1tdXRhYmxlLlxuY29uc3QgcG9pbnRQcmVjb21wdXRlcyA9IG5ldyBXZWFrTWFwPGFueSwgYW55W10+KCk7XG5jb25zdCBwb2ludFdpbmRvd1NpemVzID0gbmV3IFdlYWtNYXA8YW55LCBudW1iZXI+KCk7XG5cbmZ1bmN0aW9uIGdldFcoUDogYW55KTogbnVtYmVyIHtcbiAgLy8gVG8gZGlzYWJsZSBwcmVjb21wdXRlczpcbiAgLy8gcmV0dXJuIDE7XG4gIHJldHVybiBwb2ludFdpbmRvd1NpemVzLmdldChQKSB8fCAxO1xufVxuXG5mdW5jdGlvbiBhc3NlcnQwKG46IGJpZ2ludCk6IHZvaWQge1xuICBpZiAobiAhPT0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgd05BRicpO1xufVxuXG4vKipcbiAqIEVsbGlwdGljIGN1cnZlIG11bHRpcGxpY2F0aW9uIG9mIFBvaW50IGJ5IHNjYWxhci4gRnJhZ2lsZS5cbiAqIFRhYmxlIGdlbmVyYXRpb24gdGFrZXMgKiozME1CIG9mIHJhbSBhbmQgMTBtcyBvbiBoaWdoLWVuZCBDUFUqKixcbiAqIGJ1dCBtYXkgdGFrZSBtdWNoIGxvbmdlciBvbiBzbG93IGRldmljZXMuIEFjdHVhbCBnZW5lcmF0aW9uIHdpbGwgaGFwcGVuIG9uXG4gKiBmaXJzdCBjYWxsIG9mIGBtdWx0aXBseSgpYC4gQnkgZGVmYXVsdCwgYEJBU0VgIHBvaW50IGlzIHByZWNvbXB1dGVkLlxuICpcbiAqIFNjYWxhcnMgc2hvdWxkIGFsd2F5cyBiZSBsZXNzIHRoYW4gY3VydmUgb3JkZXI6IHRoaXMgc2hvdWxkIGJlIGNoZWNrZWQgaW5zaWRlIG9mIGEgY3VydmUgaXRzZWxmLlxuICogQ3JlYXRlcyBwcmVjb21wdXRhdGlvbiB0YWJsZXMgZm9yIGZhc3QgbXVsdGlwbGljYXRpb246XG4gKiAtIHByaXZhdGUgc2NhbGFyIGlzIHNwbGl0IGJ5IGZpeGVkIHNpemUgd2luZG93cyBvZiBXIGJpdHNcbiAqIC0gZXZlcnkgd2luZG93IHBvaW50IGlzIGNvbGxlY3RlZCBmcm9tIHdpbmRvdydzIHRhYmxlICYgYWRkZWQgdG8gYWNjdW11bGF0b3JcbiAqIC0gc2luY2Ugd2luZG93cyBhcmUgZGlmZmVyZW50LCBzYW1lIHBvaW50IGluc2lkZSB0YWJsZXMgd29uJ3QgYmUgYWNjZXNzZWQgbW9yZSB0aGFuIG9uY2UgcGVyIGNhbGNcbiAqIC0gZWFjaCBtdWx0aXBsaWNhdGlvbiBpcyAnTWF0aC5jZWlsKENVUlZFX09SREVSIC8gXHVEODM1XHVEQzRBKSArIDEnIHBvaW50IGFkZGl0aW9ucyAoZml4ZWQgZm9yIGFueSBzY2FsYXIpXG4gKiAtICsxIHdpbmRvdyBpcyBuZWNjZXNzYXJ5IGZvciB3TkFGXG4gKiAtIHdOQUYgcmVkdWNlcyB0YWJsZSBzaXplOiAyeCBsZXNzIG1lbW9yeSArIDJ4IGZhc3RlciBnZW5lcmF0aW9uLCBidXQgMTAlIHNsb3dlciBtdWx0aXBsaWNhdGlvblxuICpcbiAqIEB0b2RvIFJlc2VhcmNoIHJldHVybmluZyAyZCBKUyBhcnJheSBvZiB3aW5kb3dzLCBpbnN0ZWFkIG9mIGEgc2luZ2xlIHdpbmRvdy5cbiAqIFRoaXMgd291bGQgYWxsb3cgd2luZG93cyB0byBiZSBpbiBkaWZmZXJlbnQgbWVtb3J5IGxvY2F0aW9uc1xuICovXG5leHBvcnQgY2xhc3Mgd05BRjxQQyBleHRlbmRzIFBDX0FOWT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IEJBU0U6IFBDX1A8UEM+O1xuICBwcml2YXRlIHJlYWRvbmx5IFpFUk86IFBDX1A8UEM+O1xuICBwcml2YXRlIHJlYWRvbmx5IEZuOiBQQ1snRm4nXTtcbiAgcmVhZG9ubHkgYml0czogbnVtYmVyO1xuXG4gIC8vIFBhcmFtZXRyaXplZCB3aXRoIGEgZ2l2ZW4gUG9pbnQgY2xhc3MgKG5vdCBpbmRpdmlkdWFsIHBvaW50KVxuICBjb25zdHJ1Y3RvcihQb2ludDogUEMsIGJpdHM6IG51bWJlcikge1xuICAgIHRoaXMuQkFTRSA9IFBvaW50LkJBU0U7XG4gICAgdGhpcy5aRVJPID0gUG9pbnQuWkVSTztcbiAgICB0aGlzLkZuID0gUG9pbnQuRm47XG4gICAgdGhpcy5iaXRzID0gYml0cztcbiAgfVxuXG4gIC8vIG5vbi1jb25zdCB0aW1lIG11bHRpcGxpY2F0aW9uIGxhZGRlclxuICBfdW5zYWZlTGFkZGVyKGVsbTogUENfUDxQQz4sIG46IGJpZ2ludCwgcDogUENfUDxQQz4gPSB0aGlzLlpFUk8pOiBQQ19QPFBDPiB7XG4gICAgbGV0IGQ6IFBDX1A8UEM+ID0gZWxtO1xuICAgIHdoaWxlIChuID4gXzBuKSB7XG4gICAgICBpZiAobiAmIF8xbikgcCA9IHAuYWRkKGQpO1xuICAgICAgZCA9IGQuZG91YmxlKCk7XG4gICAgICBuID4+PSBfMW47XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB3TkFGIHByZWNvbXB1dGF0aW9uIHdpbmRvdy4gVXNlZCBmb3IgY2FjaGluZy5cbiAgICogRGVmYXVsdCB3aW5kb3cgc2l6ZSBpcyBzZXQgYnkgYHV0aWxzLnByZWNvbXB1dGUoKWAgYW5kIGlzIGVxdWFsIHRvIDguXG4gICAqIE51bWJlciBvZiBwcmVjb21wdXRlZCBwb2ludHMgZGVwZW5kcyBvbiB0aGUgY3VydmUgc2l6ZTpcbiAgICogMl4oXHVEODM1XHVEQzRBXHUyMjEyMSkgKiAoTWF0aC5jZWlsKFx1RDgzNVx1REM1QiAvIFx1RDgzNVx1REM0QSkgKyAxKSwgd2hlcmU6XG4gICAqIC0gXHVEODM1XHVEQzRBIGlzIHRoZSB3aW5kb3cgc2l6ZVxuICAgKiAtIFx1RDgzNVx1REM1QiBpcyB0aGUgYml0bGVuZ3RoIG9mIHRoZSBjdXJ2ZSBvcmRlci5cbiAgICogRm9yIGEgMjU2LWJpdCBjdXJ2ZSBhbmQgd2luZG93IHNpemUgOCwgdGhlIG51bWJlciBvZiBwcmVjb21wdXRlZCBwb2ludHMgaXMgMTI4ICogMzMgPSA0MjI0LlxuICAgKiBAcGFyYW0gcG9pbnQgUG9pbnQgaW5zdGFuY2VcbiAgICogQHBhcmFtIFcgd2luZG93IHNpemVcbiAgICogQHJldHVybnMgcHJlY29tcHV0ZWQgcG9pbnQgdGFibGVzIGZsYXR0ZW5lZCB0byBhIHNpbmdsZSBhcnJheVxuICAgKi9cbiAgcHJpdmF0ZSBwcmVjb21wdXRlV2luZG93KHBvaW50OiBQQ19QPFBDPiwgVzogbnVtYmVyKTogUENfUDxQQz5bXSB7XG4gICAgY29uc3QgeyB3aW5kb3dzLCB3aW5kb3dTaXplIH0gPSBjYWxjV09wdHMoVywgdGhpcy5iaXRzKTtcbiAgICBjb25zdCBwb2ludHM6IFBDX1A8UEM+W10gPSBbXTtcbiAgICBsZXQgcDogUENfUDxQQz4gPSBwb2ludDtcbiAgICBsZXQgYmFzZSA9IHA7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd2luZG93czsgd2luZG93KyspIHtcbiAgICAgIGJhc2UgPSBwO1xuICAgICAgcG9pbnRzLnB1c2goYmFzZSk7XG4gICAgICAvLyBpPTEsIGJjIHdlIHNraXAgMFxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dTaXplOyBpKyspIHtcbiAgICAgICAgYmFzZSA9IGJhc2UuYWRkKHApO1xuICAgICAgICBwb2ludHMucHVzaChiYXNlKTtcbiAgICAgIH1cbiAgICAgIHAgPSBiYXNlLmRvdWJsZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgZWMgbXVsdGlwbGljYXRpb24gdXNpbmcgcHJlY29tcHV0ZWQgdGFibGVzIGFuZCB3LWFyeSBub24tYWRqYWNlbnQgZm9ybS5cbiAgICogTW9yZSBjb21wYWN0IGltcGxlbWVudGF0aW9uOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL25vYmxlLXNlY3AyNTZrMS9ibG9iLzQ3Y2IxNjY5YjZlNTA2YWQ2NmIzNWZlN2Q3NjEzMmFlOTc0NjVkYTIvaW5kZXgudHMjTDUwMi1MNTQxXG4gICAqIEByZXR1cm5zIHJlYWwgYW5kIGZha2UgKGZvciBjb25zdC10aW1lKSBwb2ludHNcbiAgICovXG4gIHByaXZhdGUgd05BRihXOiBudW1iZXIsIHByZWNvbXB1dGVzOiBQQ19QPFBDPltdLCBuOiBiaWdpbnQpOiB7IHA6IFBDX1A8UEM+OyBmOiBQQ19QPFBDPiB9IHtcbiAgICAvLyBTY2FsYXIgc2hvdWxkIGJlIHNtYWxsZXIgdGhhbiBmaWVsZCBvcmRlclxuICAgIGlmICghdGhpcy5Gbi5pc1ZhbGlkKG4pKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyJyk7XG4gICAgLy8gQWNjdW11bGF0b3JzXG4gICAgbGV0IHAgPSB0aGlzLlpFUk87XG4gICAgbGV0IGYgPSB0aGlzLkJBU0U7XG4gICAgLy8gVGhpcyBjb2RlIHdhcyBmaXJzdCB3cml0dGVuIHdpdGggYXNzdW1wdGlvbiB0aGF0ICdmJyBhbmQgJ3AnIHdpbGwgbmV2ZXIgYmUgaW5maW5pdHkgcG9pbnQ6XG4gICAgLy8gc2luY2UgZWFjaCBhZGRpdGlvbiBpcyBtdWx0aXBsaWVkIGJ5IDIgKiogVywgaXQgY2Fubm90IGNhbmNlbCBlYWNoIG90aGVyLiBIb3dldmVyLFxuICAgIC8vIHRoZXJlIGlzIG5lZ2F0ZSBub3c6IGl0IGlzIHBvc3NpYmxlIHRoYXQgbmVnYXRlZCBlbGVtZW50IGZyb20gbG93IHZhbHVlXG4gICAgLy8gd291bGQgYmUgdGhlIHNhbWUgYXMgaGlnaCBlbGVtZW50LCB3aGljaCB3aWxsIGNyZWF0ZSBjYXJyeSBpbnRvIG5leHQgd2luZG93LlxuICAgIC8vIEl0J3Mgbm90IG9idmlvdXMgaG93IHRoaXMgY2FuIGZhaWwsIGJ1dCBzdGlsbCB3b3J0aCBpbnZlc3RpZ2F0aW5nIGxhdGVyLlxuICAgIGNvbnN0IHdvID0gY2FsY1dPcHRzKFcsIHRoaXMuYml0cyk7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd28ud2luZG93czsgd2luZG93KyspIHtcbiAgICAgIC8vIChuID09PSBfMG4pIGlzIGhhbmRsZWQgYW5kIG5vdCBlYXJseS1leGl0ZWQuIGlzRXZlbiBhbmQgb2Zmc2V0RiBhcmUgdXNlZCBmb3Igbm9pc2VcbiAgICAgIGNvbnN0IHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZywgaXNOZWdGLCBvZmZzZXRGIH0gPSBjYWxjT2Zmc2V0cyhuLCB3aW5kb3csIHdvKTtcbiAgICAgIG4gPSBuZXh0TjtcbiAgICAgIGlmIChpc1plcm8pIHtcbiAgICAgICAgLy8gYml0cyBhcmUgMDogYWRkIGdhcmJhZ2UgdG8gZmFrZSBwb2ludFxuICAgICAgICAvLyBJbXBvcnRhbnQgcGFydCBmb3IgY29uc3QtdGltZSBnZXRQdWJsaWNLZXk6IGFkZCByYW5kb20gXCJub2lzZVwiIHBvaW50IHRvIGYuXG4gICAgICAgIGYgPSBmLmFkZChuZWdhdGVDdChpc05lZ0YsIHByZWNvbXB1dGVzW29mZnNldEZdKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBiaXRzIGFyZSAxOiBhZGQgdG8gcmVzdWx0IHBvaW50XG4gICAgICAgIHAgPSBwLmFkZChuZWdhdGVDdChpc05lZywgcHJlY29tcHV0ZXNbb2Zmc2V0XSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3NlcnQwKG4pO1xuICAgIC8vIFJldHVybiBib3RoIHJlYWwgYW5kIGZha2UgcG9pbnRzOiBKSVQgd29uJ3QgZWxpbWluYXRlIGYuXG4gICAgLy8gQXQgdGhpcyBwb2ludCB0aGVyZSBpcyBhIHdheSB0byBGIGJlIGluZmluaXR5LXBvaW50IGV2ZW4gaWYgcCBpcyBub3QsXG4gICAgLy8gd2hpY2ggbWFrZXMgaXQgbGVzcyBjb25zdC10aW1lOiBhcm91bmQgMSBiaWdpbnQgbXVsdGlwbHkuXG4gICAgcmV0dXJuIHsgcCwgZiB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgZWMgdW5zYWZlIChub24gY29uc3QtdGltZSkgbXVsdGlwbGljYXRpb24gdXNpbmcgcHJlY29tcHV0ZWQgdGFibGVzIGFuZCB3LWFyeSBub24tYWRqYWNlbnQgZm9ybS5cbiAgICogQHBhcmFtIGFjYyBhY2N1bXVsYXRvciBwb2ludCB0byBhZGQgcmVzdWx0IG9mIG11bHRpcGxpY2F0aW9uXG4gICAqIEByZXR1cm5zIHBvaW50XG4gICAqL1xuICBwcml2YXRlIHdOQUZVbnNhZmUoXG4gICAgVzogbnVtYmVyLFxuICAgIHByZWNvbXB1dGVzOiBQQ19QPFBDPltdLFxuICAgIG46IGJpZ2ludCxcbiAgICBhY2M6IFBDX1A8UEM+ID0gdGhpcy5aRVJPXG4gICk6IFBDX1A8UEM+IHtcbiAgICBjb25zdCB3byA9IGNhbGNXT3B0cyhXLCB0aGlzLmJpdHMpO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdvLndpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICBpZiAobiA9PT0gXzBuKSBicmVhazsgLy8gRWFybHktZXhpdCwgc2tpcCAwIHZhbHVlXG4gICAgICBjb25zdCB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcgfSA9IGNhbGNPZmZzZXRzKG4sIHdpbmRvdywgd28pO1xuICAgICAgbiA9IG5leHROO1xuICAgICAgaWYgKGlzWmVybykge1xuICAgICAgICAvLyBXaW5kb3cgYml0cyBhcmUgMDogc2tpcCBwcm9jZXNzaW5nLlxuICAgICAgICAvLyBNb3ZlIHRvIG5leHQgd2luZG93LlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwcmVjb21wdXRlc1tvZmZzZXRdO1xuICAgICAgICBhY2MgPSBhY2MuYWRkKGlzTmVnID8gaXRlbS5uZWdhdGUoKSA6IGl0ZW0pOyAvLyBSZS11c2luZyBhY2MgYWxsb3dzIHRvIHNhdmUgYWRkcyBpbiBNU01cbiAgICAgIH1cbiAgICB9XG4gICAgYXNzZXJ0MChuKTtcbiAgICByZXR1cm4gYWNjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmVjb21wdXRlcyhXOiBudW1iZXIsIHBvaW50OiBQQ19QPFBDPiwgdHJhbnNmb3JtPzogTWFwcGVyPFBDX1A8UEM+Pik6IFBDX1A8UEM+W10ge1xuICAgIC8vIENhbGN1bGF0ZSBwcmVjb21wdXRlcyBvbiBhIGZpcnN0IHJ1biwgcmV1c2UgdGhlbSBhZnRlclxuICAgIGxldCBjb21wID0gcG9pbnRQcmVjb21wdXRlcy5nZXQocG9pbnQpO1xuICAgIGlmICghY29tcCkge1xuICAgICAgY29tcCA9IHRoaXMucHJlY29tcHV0ZVdpbmRvdyhwb2ludCwgVykgYXMgUENfUDxQQz5bXTtcbiAgICAgIGlmIChXICE9PSAxKSB7XG4gICAgICAgIC8vIERvaW5nIHRyYW5zZm9ybSBvdXRzaWRlIG9mIGlmIGJyaW5ncyAxNSUgcGVyZiBoaXRcbiAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT09ICdmdW5jdGlvbicpIGNvbXAgPSB0cmFuc2Zvcm0oY29tcCk7XG4gICAgICAgIHBvaW50UHJlY29tcHV0ZXMuc2V0KHBvaW50LCBjb21wKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbXA7XG4gIH1cblxuICBjYWNoZWQoXG4gICAgcG9pbnQ6IFBDX1A8UEM+LFxuICAgIHNjYWxhcjogYmlnaW50LFxuICAgIHRyYW5zZm9ybT86IE1hcHBlcjxQQ19QPFBDPj5cbiAgKTogeyBwOiBQQ19QPFBDPjsgZjogUENfUDxQQz4gfSB7XG4gICAgY29uc3QgVyA9IGdldFcocG9pbnQpO1xuICAgIHJldHVybiB0aGlzLndOQUYoVywgdGhpcy5nZXRQcmVjb21wdXRlcyhXLCBwb2ludCwgdHJhbnNmb3JtKSwgc2NhbGFyKTtcbiAgfVxuXG4gIHVuc2FmZShwb2ludDogUENfUDxQQz4sIHNjYWxhcjogYmlnaW50LCB0cmFuc2Zvcm0/OiBNYXBwZXI8UENfUDxQQz4+LCBwcmV2PzogUENfUDxQQz4pOiBQQ19QPFBDPiB7XG4gICAgY29uc3QgVyA9IGdldFcocG9pbnQpO1xuICAgIGlmIChXID09PSAxKSByZXR1cm4gdGhpcy5fdW5zYWZlTGFkZGVyKHBvaW50LCBzY2FsYXIsIHByZXYpOyAvLyBGb3IgVz0xIGxhZGRlciBpcyB+eDIgZmFzdGVyXG4gICAgcmV0dXJuIHRoaXMud05BRlVuc2FmZShXLCB0aGlzLmdldFByZWNvbXB1dGVzKFcsIHBvaW50LCB0cmFuc2Zvcm0pLCBzY2FsYXIsIHByZXYpO1xuICB9XG5cbiAgLy8gV2UgY2FsY3VsYXRlIHByZWNvbXB1dGVzIGZvciBlbGxpcHRpYyBjdXJ2ZSBwb2ludCBtdWx0aXBsaWNhdGlvblxuICAvLyB1c2luZyB3aW5kb3dlZCBtZXRob2QuIFRoaXMgc3BlY2lmaWVzIHdpbmRvdyBzaXplIGFuZFxuICAvLyBzdG9yZXMgcHJlY29tcHV0ZWQgdmFsdWVzLiBVc3VhbGx5IG9ubHkgYmFzZSBwb2ludCB3b3VsZCBiZSBwcmVjb21wdXRlZC5cbiAgY3JlYXRlQ2FjaGUoUDogUENfUDxQQz4sIFc6IG51bWJlcik6IHZvaWQge1xuICAgIHZhbGlkYXRlVyhXLCB0aGlzLmJpdHMpO1xuICAgIHBvaW50V2luZG93U2l6ZXMuc2V0KFAsIFcpO1xuICAgIHBvaW50UHJlY29tcHV0ZXMuZGVsZXRlKFApO1xuICB9XG5cbiAgaGFzQ2FjaGUoZWxtOiBQQ19QPFBDPik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRXKGVsbSkgIT09IDE7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmRvbW9ycGhpc20tc3BlY2lmaWMgbXVsdGlwbGljYXRpb24gZm9yIEtvYmxpdHogY3VydmVzLlxuICogQ29zdDogMTI4IGRibCwgMC0yNTYgYWRkcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bEVuZG9VbnNhZmU8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIFBvaW50OiBQQyxcbiAgcG9pbnQ6IFAsXG4gIGsxOiBiaWdpbnQsXG4gIGsyOiBiaWdpbnRcbik6IHsgcDE6IFA7IHAyOiBQIH0ge1xuICBsZXQgYWNjID0gcG9pbnQ7XG4gIGxldCBwMSA9IFBvaW50LlpFUk87XG4gIGxldCBwMiA9IFBvaW50LlpFUk87XG4gIHdoaWxlIChrMSA+IF8wbiB8fCBrMiA+IF8wbikge1xuICAgIGlmIChrMSAmIF8xbikgcDEgPSBwMS5hZGQoYWNjKTtcbiAgICBpZiAoazIgJiBfMW4pIHAyID0gcDIuYWRkKGFjYyk7XG4gICAgYWNjID0gYWNjLmRvdWJsZSgpO1xuICAgIGsxID4+PSBfMW47XG4gICAgazIgPj49IF8xbjtcbiAgfVxuICByZXR1cm4geyBwMSwgcDIgfTtcbn1cblxuLyoqXG4gKiBQaXBwZW5nZXIgYWxnb3JpdGhtIGZvciBtdWx0aS1zY2FsYXIgbXVsdGlwbGljYXRpb24gKE1TTSwgUGEgKyBRYiArIFJjICsgLi4uKS5cbiAqIDMweCBmYXN0ZXIgdnMgbmFpdmUgYWRkaXRpb24gb24gTD00MDk2LCAxMHggZmFzdGVyIHRoYW4gcHJlY29tcHV0ZXMuXG4gKiBGb3IgTj0yNTRiaXQsIEw9MSwgaXQgZG9lczogMTAyNCBBREQgKyAyNTQgREJMLiBGb3IgTD01OiAxNTM2IEFERCArIDI1NCBEQkwuXG4gKiBBbGdvcml0aG1pY2FsbHkgY29uc3RhbnQtdGltZSAoZm9yIHNhbWUgTCksIGV2ZW4gd2hlbiAxIHBvaW50ICsgc2NhbGFyLCBvciB3aGVuIHNjYWxhciA9IDAuXG4gKiBAcGFyYW0gYyBDdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGZpZWxkTiBmaWVsZCBvdmVyIENVUlZFLk4gLSBpbXBvcnRhbnQgdGhhdCBpdCdzIG5vdCBvdmVyIENVUlZFLlBcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgTCBjdXJ2ZSBwb2ludHNcbiAqIEBwYXJhbSBzY2FsYXJzIGFycmF5IG9mIEwgc2NhbGFycyAoYWthIHNlY3JldCBrZXlzIC8gYmlnaW50cylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpcHBlbmdlcjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgYzogUEMsXG4gIHBvaW50czogUFtdLFxuICBzY2FsYXJzOiBiaWdpbnRbXVxuKTogUCB7XG4gIC8vIElmIHdlIHNwbGl0IHNjYWxhcnMgYnkgc29tZSB3aW5kb3cgKGxldCdzIHNheSA4IGJpdHMpLCBldmVyeSBjaHVuayB3aWxsIG9ubHlcbiAgLy8gdGFrZSAyNTYgYnVja2V0cyBldmVuIGlmIHRoZXJlIGFyZSA0MDk2IHNjYWxhcnMsIGFsc28gcmUtdXNlcyBkb3VibGUuXG4gIC8vIFRPRE86XG4gIC8vIC0gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAyNC83NTAucGRmXG4gIC8vIC0gaHR0cHM6Ly90Y2hlcy5pYWNyLm9yZy9pbmRleC5waHAvVENIRVMvYXJ0aWNsZS92aWV3LzEwMjg3XG4gIC8vIDAgaXMgYWNjZXB0ZWQgaW4gc2NhbGFyc1xuICBjb25zdCBmaWVsZE4gPSBjLkZuO1xuICB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHMsIGMpO1xuICB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFycywgZmllbGROKTtcbiAgY29uc3QgcGxlbmd0aCA9IHBvaW50cy5sZW5ndGg7XG4gIGNvbnN0IHNsZW5ndGggPSBzY2FsYXJzLmxlbmd0aDtcbiAgaWYgKHBsZW5ndGggIT09IHNsZW5ndGgpIHRocm93IG5ldyBFcnJvcignYXJyYXlzIG9mIHBvaW50cyBhbmQgc2NhbGFycyBtdXN0IGhhdmUgZXF1YWwgbGVuZ3RoJyk7XG4gIC8vIGlmIChwbGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG11c3QgYmUgb2YgbGVuZ3RoID49IDInKTtcbiAgY29uc3QgemVybyA9IGMuWkVSTztcbiAgY29uc3Qgd2JpdHMgPSBiaXRMZW4oQmlnSW50KHBsZW5ndGgpKTtcbiAgbGV0IHdpbmRvd1NpemUgPSAxOyAvLyBiaXRzXG4gIGlmICh3Yml0cyA+IDEyKSB3aW5kb3dTaXplID0gd2JpdHMgLSAzO1xuICBlbHNlIGlmICh3Yml0cyA+IDQpIHdpbmRvd1NpemUgPSB3Yml0cyAtIDI7XG4gIGVsc2UgaWYgKHdiaXRzID4gMCkgd2luZG93U2l6ZSA9IDI7XG4gIGNvbnN0IE1BU0sgPSBiaXRNYXNrKHdpbmRvd1NpemUpO1xuICBjb25zdCBidWNrZXRzID0gbmV3IEFycmF5KE51bWJlcihNQVNLKSArIDEpLmZpbGwoemVybyk7IC8vICsxIGZvciB6ZXJvIGFycmF5XG4gIGNvbnN0IGxhc3RCaXRzID0gTWF0aC5mbG9vcigoZmllbGROLkJJVFMgLSAxKSAvIHdpbmRvd1NpemUpICogd2luZG93U2l6ZTtcbiAgbGV0IHN1bSA9IHplcm87XG4gIGZvciAobGV0IGkgPSBsYXN0Qml0czsgaSA+PSAwOyBpIC09IHdpbmRvd1NpemUpIHtcbiAgICBidWNrZXRzLmZpbGwoemVybyk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzbGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IHNjYWxhciA9IHNjYWxhcnNbal07XG4gICAgICBjb25zdCB3Yml0cyA9IE51bWJlcigoc2NhbGFyID4+IEJpZ0ludChpKSkgJiBNQVNLKTtcbiAgICAgIGJ1Y2tldHNbd2JpdHNdID0gYnVja2V0c1t3Yml0c10uYWRkKHBvaW50c1tqXSk7XG4gICAgfVxuICAgIGxldCByZXNJID0gemVybzsgLy8gbm90IHVzaW5nIHRoaXMgd2lsbCBkbyBzbWFsbCBzcGVlZC11cCwgYnV0IHdpbGwgbG9zZSBjdFxuICAgIC8vIFNraXAgZmlyc3QgYnVja2V0LCBiZWNhdXNlIGl0IGlzIHplcm9cbiAgICBmb3IgKGxldCBqID0gYnVja2V0cy5sZW5ndGggLSAxLCBzdW1JID0gemVybzsgaiA+IDA7IGotLSkge1xuICAgICAgc3VtSSA9IHN1bUkuYWRkKGJ1Y2tldHNbal0pO1xuICAgICAgcmVzSSA9IHJlc0kuYWRkKHN1bUkpO1xuICAgIH1cbiAgICBzdW0gPSBzdW0uYWRkKHJlc0kpO1xuICAgIGlmIChpICE9PSAwKSBmb3IgKGxldCBqID0gMDsgaiA8IHdpbmRvd1NpemU7IGorKykgc3VtID0gc3VtLmRvdWJsZSgpO1xuICB9XG4gIHJldHVybiBzdW0gYXMgUDtcbn1cbi8qKlxuICogUHJlY29tcHV0ZWQgbXVsdGktc2NhbGFyIG11bHRpcGxpY2F0aW9uIChNU00sIFBhICsgUWIgKyBSYyArIC4uLikuXG4gKiBAcGFyYW0gYyBDdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGZpZWxkTiBmaWVsZCBvdmVyIENVUlZFLk4gLSBpbXBvcnRhbnQgdGhhdCBpdCdzIG5vdCBvdmVyIENVUlZFLlBcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgTCBjdXJ2ZSBwb2ludHNcbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHdoaWNoIG11bHRpcGxpZXMgcG9pbnRzIHdpdGggc2NhYXJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVjb21wdXRlTVNNVW5zYWZlPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBjOiBQQyxcbiAgcG9pbnRzOiBQW10sXG4gIHdpbmRvd1NpemU6IG51bWJlclxuKTogKHNjYWxhcnM6IGJpZ2ludFtdKSA9PiBQIHtcbiAgLyoqXG4gICAqIFBlcmZvcm1hbmNlIEFuYWx5c2lzIG9mIFdpbmRvdy1iYXNlZCBQcmVjb21wdXRhdGlvblxuICAgKlxuICAgKiBCYXNlIENhc2UgKDI1Ni1iaXQgc2NhbGFyLCA4LWJpdCB3aW5kb3cpOlxuICAgKiAtIFN0YW5kYXJkIHByZWNvbXB1dGF0aW9uIHJlcXVpcmVzOlxuICAgKiAgIC0gMzEgYWRkaXRpb25zIHBlciBzY2FsYXIgXHUwMEQ3IDI1NiBzY2FsYXJzID0gNyw5MzYgb3BzXG4gICAqICAgLSBQbHVzIDI1NSBzdW1tYXJ5IGFkZGl0aW9ucyA9IDgsMTkxIHRvdGFsIG9wc1xuICAgKiAgIE5vdGU6IFN1bW1hcnkgYWRkaXRpb25zIGNhbiBiZSBvcHRpbWl6ZWQgdmlhIGFjY3VtdWxhdG9yXG4gICAqXG4gICAqIENodW5rZWQgUHJlY29tcHV0YXRpb24gQW5hbHlzaXM6XG4gICAqIC0gVXNpbmcgMzIgY2h1bmtzIHJlcXVpcmVzOlxuICAgKiAgIC0gMjU1IGFkZGl0aW9ucyBwZXIgY2h1bmtcbiAgICogICAtIDI1NiBkb3VibGluZ3NcbiAgICogICAtIFRvdGFsOiAoMjU1IFx1MDBENyAzMikgKyAyNTYgPSA4LDQxNiBvcHNcbiAgICpcbiAgICogTWVtb3J5IFVzYWdlIENvbXBhcmlzb246XG4gICAqIFdpbmRvdyBTaXplIHwgU3RhbmRhcmQgUG9pbnRzIHwgQ2h1bmtlZCBQb2ludHNcbiAgICogLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLVxuICAgKiAgICAgNC1iaXQgICB8ICAgICA1MjAgICAgICAgICB8ICAgICAgMTVcbiAgICogICAgIDgtYml0ICAgfCAgICA0LDIyNCAgICAgICAgfCAgICAgMjU1XG4gICAqICAgIDEwLWJpdCAgIHwgICAxMyw4MjQgICAgICAgIHwgICAxLDAyM1xuICAgKiAgICAxNi1iaXQgICB8ICA1NTcsMDU2ICAgICAgICB8ICA2NSw1MzVcbiAgICpcbiAgICogS2V5IEFkdmFudGFnZXM6XG4gICAqIDEuIEVuYWJsZXMgbGFyZ2VyIHdpbmRvdyBzaXplcyBkdWUgdG8gcmVkdWNlZCBtZW1vcnkgb3ZlcmhlYWRcbiAgICogMi4gTW9yZSBlZmZpY2llbnQgZm9yIHNtYWxsZXIgc2NhbGFyIGNvdW50czpcbiAgICogICAgLSAxNiBjaHVua3M6ICgxNiBcdTAwRDcgMjU1KSArIDI1NiA9IDQsMzM2IG9wc1xuICAgKiAgICAtIH4yeCBmYXN0ZXIgdGhhbiBzdGFuZGFyZCA4LDE5MSBvcHNcbiAgICpcbiAgICogTGltaXRhdGlvbnM6XG4gICAqIC0gTm90IHN1aXRhYmxlIGZvciBwbGFpbiBwcmVjb21wdXRlcyAocmVxdWlyZXMgMjU2IGNvbnN0YW50IGRvdWJsaW5ncylcbiAgICogLSBQZXJmb3JtYW5jZSBkZWdyYWRlcyB3aXRoIGxhcmdlciBzY2FsYXIgY291bnRzOlxuICAgKiAgIC0gT3B0aW1hbCBmb3IgfjI1NiBzY2FsYXJzXG4gICAqICAgLSBMZXNzIGVmZmljaWVudCBmb3IgNDA5Nisgc2NhbGFycyAoUGlwcGVuZ2VyIHByZWZlcnJlZClcbiAgICovXG4gIGNvbnN0IGZpZWxkTiA9IGMuRm47XG4gIHZhbGlkYXRlVyh3aW5kb3dTaXplLCBmaWVsZE4uQklUUyk7XG4gIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50cywgYyk7XG4gIGNvbnN0IHplcm8gPSBjLlpFUk87XG4gIGNvbnN0IHRhYmxlU2l6ZSA9IDIgKiogd2luZG93U2l6ZSAtIDE7IC8vIHRhYmxlIHNpemUgKHdpdGhvdXQgemVybylcbiAgY29uc3QgY2h1bmtzID0gTWF0aC5jZWlsKGZpZWxkTi5CSVRTIC8gd2luZG93U2l6ZSk7IC8vIGNodW5rcyBvZiBpdGVtXG4gIGNvbnN0IE1BU0sgPSBiaXRNYXNrKHdpbmRvd1NpemUpO1xuICBjb25zdCB0YWJsZXMgPSBwb2ludHMubWFwKChwOiBQKSA9PiB7XG4gICAgY29uc3QgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGFjYyA9IHA7IGkgPCB0YWJsZVNpemU7IGkrKykge1xuICAgICAgcmVzLnB1c2goYWNjKTtcbiAgICAgIGFjYyA9IGFjYy5hZGQocCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0pO1xuICByZXR1cm4gKHNjYWxhcnM6IGJpZ2ludFtdKTogUCA9PiB7XG4gICAgdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnMsIGZpZWxkTik7XG4gICAgaWYgKHNjYWxhcnMubGVuZ3RoID4gcG9pbnRzLmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJyYXkgb2Ygc2NhbGFycyBtdXN0IGJlIHNtYWxsZXIgdGhhbiBhcnJheSBvZiBwb2ludHMnKTtcbiAgICBsZXQgcmVzID0gemVybztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rczsgaSsrKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIGRvdWJsZSBpZiBhY2N1bXVsYXRvciBpcyBzdGlsbCB6ZXJvLlxuICAgICAgaWYgKHJlcyAhPT0gemVybykgZm9yIChsZXQgaiA9IDA7IGogPCB3aW5kb3dTaXplOyBqKyspIHJlcyA9IHJlcy5kb3VibGUoKTtcbiAgICAgIGNvbnN0IHNoaWZ0QnkgPSBCaWdJbnQoY2h1bmtzICogd2luZG93U2l6ZSAtIChpICsgMSkgKiB3aW5kb3dTaXplKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2NhbGFycy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBuID0gc2NhbGFyc1tqXTtcbiAgICAgICAgY29uc3QgY3VyciA9IE51bWJlcigobiA+PiBzaGlmdEJ5KSAmIE1BU0spO1xuICAgICAgICBpZiAoIWN1cnIpIGNvbnRpbnVlOyAvLyBza2lwIHplcm8gc2NhbGFycyBjaHVua3NcbiAgICAgICAgcmVzID0gcmVzLmFkZCh0YWJsZXNbal1bY3VyciAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVmFsaWRDdXJ2ZVBhcmFtczxUPiA9IHtcbiAgcDogYmlnaW50O1xuICBuOiBiaWdpbnQ7XG4gIGg6IGJpZ2ludDtcbiAgYTogVDtcbiAgYj86IFQ7XG4gIGQ/OiBUO1xuICBHeDogVDtcbiAgR3k6IFQ7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVGaWVsZDxUPihvcmRlcjogYmlnaW50LCBmaWVsZD86IElGaWVsZDxUPiwgaXNMRT86IGJvb2xlYW4pOiBJRmllbGQ8VD4ge1xuICBpZiAoZmllbGQpIHtcbiAgICBpZiAoZmllbGQuT1JERVIgIT09IG9yZGVyKSB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkLk9SREVSIG11c3QgbWF0Y2ggb3JkZXI6IEZwID09IHAsIEZuID09IG4nKTtcbiAgICB2YWxpZGF0ZUZpZWxkKGZpZWxkKTtcbiAgICByZXR1cm4gZmllbGQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZpZWxkKG9yZGVyLCB7IGlzTEUgfSkgYXMgdW5rbm93biBhcyBJRmllbGQ8VD47XG4gIH1cbn1cbmV4cG9ydCB0eXBlIEZwRm48VD4gPSB7IEZwOiBJRmllbGQ8VD47IEZuOiBJRmllbGQ8YmlnaW50PiB9O1xuXG4vKiogVmFsaWRhdGVzIENVUlZFIG9wdHMgYW5kIGNyZWF0ZXMgZmllbGRzICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VydmVGaWVsZHM8VD4oXG4gIHR5cGU6ICd3ZWllcnN0cmFzcycgfCAnZWR3YXJkcycsXG4gIENVUlZFOiBWYWxpZEN1cnZlUGFyYW1zPFQ+LFxuICBjdXJ2ZU9wdHM6IFBhcnRpYWw8RnBGbjxUPj4gPSB7fSxcbiAgRnBGbkxFPzogYm9vbGVhblxuKTogRnBGbjxUPiAmIHsgQ1VSVkU6IFZhbGlkQ3VydmVQYXJhbXM8VD4gfSB7XG4gIGlmIChGcEZuTEUgPT09IHVuZGVmaW5lZCkgRnBGbkxFID0gdHlwZSA9PT0gJ2Vkd2FyZHMnO1xuICBpZiAoIUNVUlZFIHx8IHR5cGVvZiBDVVJWRSAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgdmFsaWQgJHt0eXBlfSBDVVJWRSBvYmplY3RgKTtcbiAgZm9yIChjb25zdCBwIG9mIFsncCcsICduJywgJ2gnXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHZhbCA9IENVUlZFW3BdO1xuICAgIGlmICghKHR5cGVvZiB2YWwgPT09ICdiaWdpbnQnICYmIHZhbCA+IF8wbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENVUlZFLiR7cH0gbXVzdCBiZSBwb3NpdGl2ZSBiaWdpbnRgKTtcbiAgfVxuICBjb25zdCBGcCA9IGNyZWF0ZUZpZWxkKENVUlZFLnAsIGN1cnZlT3B0cy5GcCwgRnBGbkxFKTtcbiAgY29uc3QgRm4gPSBjcmVhdGVGaWVsZChDVVJWRS5uLCBjdXJ2ZU9wdHMuRm4sIEZwRm5MRSk7XG4gIGNvbnN0IF9iOiAnYicgfCAnZCcgPSB0eXBlID09PSAnd2VpZXJzdHJhc3MnID8gJ2InIDogJ2QnO1xuICBjb25zdCBwYXJhbXMgPSBbJ0d4JywgJ0d5JywgJ2EnLCBfYl0gYXMgY29uc3Q7XG4gIGZvciAoY29uc3QgcCBvZiBwYXJhbXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKCFGcC5pc1ZhbGlkKENVUlZFW3BdKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ1VSVkUuJHtwfSBtdXN0IGJlIHZhbGlkIGZpZWxkIGVsZW1lbnQgb2YgQ1VSVkUuRnBgKTtcbiAgfVxuICBDVVJWRSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmFzc2lnbih7fSwgQ1VSVkUpKTtcbiAgcmV0dXJuIHsgQ1VSVkUsIEZwLCBGbiB9O1xufVxuXG50eXBlIEtleWdlbkZuID0gKFxuICBzZWVkPzogVWludDhBcnJheSxcbiAgaXNDb21wcmVzc2VkPzogYm9vbGVhblxuKSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5Z2VuKFxuICByYW5kb21TZWNyZXRLZXk6IEZ1bmN0aW9uLFxuICBnZXRQdWJsaWNLZXk6IFNpZ25lclsnZ2V0UHVibGljS2V5J11cbik6IEtleWdlbkZuIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGtleWdlbihzZWVkPzogVWludDhBcnJheSkge1xuICAgIGNvbnN0IHNlY3JldEtleSA9IHJhbmRvbVNlY3JldEtleShzZWVkKTtcbiAgICByZXR1cm4geyBzZWNyZXRLZXksIHB1YmxpY0tleTogZ2V0UHVibGljS2V5KHNlY3JldEtleSkgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIEhleCwgYnl0ZXMgYW5kIG51bWJlciB1dGlsaXRpZXMuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7XG4gIGFieXRlcyBhcyBhYnl0ZXNfLFxuICBhbnVtYmVyLFxuICBieXRlc1RvSGV4IGFzIGJ5dGVzVG9IZXhfLFxuICBjb25jYXRCeXRlcyBhcyBjb25jYXRCeXRlc18sXG4gIGhleFRvQnl0ZXMgYXMgaGV4VG9CeXRlc18sXG59IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuZXhwb3J0IHtcbiAgYWJ5dGVzLFxuICBhbnVtYmVyLFxuICBieXRlc1RvSGV4LFxuICBjb25jYXRCeXRlcyxcbiAgaGV4VG9CeXRlcyxcbiAgaXNCeXRlcyxcbiAgcmFuZG9tQnl0ZXMsXG59IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKTtcbmNvbnN0IF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSk7XG5cbmV4cG9ydCB0eXBlIENIYXNoID0ge1xuICAobWVzc2FnZTogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7XG4gIGJsb2NrTGVuOiBudW1iZXI7XG4gIG91dHB1dExlbjogbnVtYmVyO1xuICBjcmVhdGUob3B0cz86IHsgZGtMZW4/OiBudW1iZXIgfSk6IGFueTsgLy8gRm9yIHNoYWtlXG59O1xuZXhwb3J0IHR5cGUgRkhhc2ggPSAobWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbmV4cG9ydCBmdW5jdGlvbiBhYm9vbCh2YWx1ZTogYm9vbGVhbiwgdGl0bGU6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJykge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIGJvb2xlYW4sIGdvdCB0eXBlPScgKyB0eXBlb2YgdmFsdWUpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gVXNlZCBpbiB3ZWllcnN0cmFzcywgZGVyXG5mdW5jdGlvbiBhYmlnbnVtYmVyKG46IG51bWJlciB8IGJpZ2ludCkge1xuICBpZiAodHlwZW9mIG4gPT09ICdiaWdpbnQnKSB7XG4gICAgaWYgKCFpc1Bvc0JpZyhuKSkgdGhyb3cgbmV3IEVycm9yKCdwb3NpdGl2ZSBiaWdpbnQgZXhwZWN0ZWQsIGdvdCAnICsgbik7XG4gIH0gZWxzZSBhbnVtYmVyKG4pO1xuICByZXR1cm4gbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzYWZlbnVtYmVyKHZhbHVlOiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbHVlKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIHNhZmUgaW50ZWdlciwgZ290IHR5cGU9JyArIHR5cGVvZiB2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvSGV4VW5wYWRkZWQobnVtOiBudW1iZXIgfCBiaWdpbnQpOiBzdHJpbmcge1xuICBjb25zdCBoZXggPSBhYmlnbnVtYmVyKG51bSkudG9TdHJpbmcoMTYpO1xuICByZXR1cm4gaGV4Lmxlbmd0aCAmIDEgPyAnMCcgKyBoZXggOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb051bWJlcihoZXg6IHN0cmluZyk6IGJpZ2ludCB7XG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgJyArIHR5cGVvZiBoZXgpO1xuICByZXR1cm4gaGV4ID09PSAnJyA/IF8wbiA6IEJpZ0ludCgnMHgnICsgaGV4KTsgLy8gQmlnIEVuZGlhblxufVxuXG4vLyBCRTogQmlnIEVuZGlhbiwgTEU6IExpdHRsZSBFbmRpYW5cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTnVtYmVyQkUoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICByZXR1cm4gaGV4VG9OdW1iZXIoYnl0ZXNUb0hleF8oYnl0ZXMpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTnVtYmVyTEUoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICByZXR1cm4gaGV4VG9OdW1iZXIoYnl0ZXNUb0hleF8oY29weUJ5dGVzKGFieXRlc18oYnl0ZXMpKS5yZXZlcnNlKCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvQnl0ZXNCRShuOiBudW1iZXIgfCBiaWdpbnQsIGxlbjogbnVtYmVyKTogVWludDhBcnJheSB7XG4gIGFudW1iZXIobGVuKTtcbiAgbiA9IGFiaWdudW1iZXIobik7XG4gIGNvbnN0IHJlcyA9IGhleFRvQnl0ZXNfKG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KGxlbiAqIDIsICcwJykpO1xuICBpZiAocmVzLmxlbmd0aCAhPT0gbGVuKSB0aHJvdyBuZXcgRXJyb3IoJ251bWJlciB0b28gbGFyZ2UnKTtcbiAgcmV0dXJuIHJlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0J5dGVzTEUobjogbnVtYmVyIHwgYmlnaW50LCBsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbnVtYmVyVG9CeXRlc0JFKG4sIGxlbikucmV2ZXJzZSgpO1xufVxuLy8gVW5wYWRkZWQsIHJhcmVseSB1c2VkXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9WYXJCeXRlc0JFKG46IG51bWJlciB8IGJpZ2ludCk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gaGV4VG9CeXRlc18obnVtYmVyVG9IZXhVbnBhZGRlZChhYmlnbnVtYmVyKG4pKSk7XG59XG5cbi8vIENvbXBhcmVzIDIgdThhLXMgaW4ga2luZGEgY29uc3RhbnQgdGltZVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsQnl0ZXMoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGxldCBkaWZmID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSBkaWZmIHw9IGFbaV0gXiBiW2ldO1xuICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgVWludDhBcnJheS4gV2UgY2FuJ3QgdXNlIHU4YS5zbGljZSgpLCBiZWNhdXNlIHU4YSBjYW4gYmUgQnVmZmVyLFxuICogYW5kIEJ1ZmZlciNzbGljZSBjcmVhdGVzIG11dGFibGUgY29weS4gTmV2ZXIgdXNlIEJ1ZmZlcnMhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5Qnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShieXRlcyk7XG59XG5cbi8qKlxuICogRGVjb2RlcyA3LWJpdCBBU0NJSSBzdHJpbmcgdG8gVWludDhBcnJheSwgdGhyb3dzIG9uIG5vbi1hc2NpaSBzeW1ib2xzXG4gKiBTaG91bGQgYmUgc2FmZSB0byB1c2UgZm9yIHRoaW5ncyBleHBlY3RlZCB0byBiZSBBU0NJSS5cbiAqIFJldHVybnMgZXhhY3Qgc2FtZSByZXN1bHQgYXMgYFRleHRFbmNvZGVyYCBmb3IgQVNDSUkgb3IgdGhyb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNjaWlUb0J5dGVzKGFzY2lpOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShhc2NpaSwgKGMsIGkpID0+IHtcbiAgICBjb25zdCBjaGFyQ29kZSA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAoYy5sZW5ndGggIT09IDEgfHwgY2hhckNvZGUgPiAxMjcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYHN0cmluZyBjb250YWlucyBub24tQVNDSUkgY2hhcmFjdGVyIFwiJHthc2NpaVtpXX1cIiB3aXRoIGNvZGUgJHtjaGFyQ29kZX0gYXQgcG9zaXRpb24gJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBjaGFyQ29kZTtcbiAgfSk7XG59XG5cbi8vIElzIHBvc2l0aXZlIGJpZ2ludFxuY29uc3QgaXNQb3NCaWcgPSAobjogYmlnaW50KSA9PiB0eXBlb2YgbiA9PT0gJ2JpZ2ludCcgJiYgXzBuIDw9IG47XG5cbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKG46IGJpZ2ludCwgbWluOiBiaWdpbnQsIG1heDogYmlnaW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1Bvc0JpZyhuKSAmJiBpc1Bvc0JpZyhtaW4pICYmIGlzUG9zQmlnKG1heCkgJiYgbWluIDw9IG4gJiYgbiA8IG1heDtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIG1pbiA8PSBuIDwgbWF4LiBOT1RFOiBJdCdzIDwgbWF4IGFuZCBub3QgPD0gbWF4LlxuICogQGV4YW1wbGVcbiAqIGFJblJhbmdlKCd4JywgeCwgMW4sIDI1Nm4pOyAvLyB3b3VsZCBhc3N1bWUgeCBpcyBpbiAoMW4uLjI1NW4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhSW5SYW5nZSh0aXRsZTogc3RyaW5nLCBuOiBiaWdpbnQsIG1pbjogYmlnaW50LCBtYXg6IGJpZ2ludCk6IHZvaWQge1xuICAvLyBXaHkgbWluIDw9IG4gPCBtYXggYW5kIG5vdCBhIChtaW4gPCBuIDwgbWF4KSBPUiBiIChtaW4gPD0gbiA8PSBtYXgpP1xuICAvLyBjb25zaWRlciBQPTI1Nm4sIG1pbj0wbiwgbWF4PVBcbiAgLy8gLSBhIGZvciBtaW49MCB3b3VsZCByZXF1aXJlIC0xOiAgICAgICAgICBgaW5SYW5nZSgneCcsIHgsIC0xbiwgUClgXG4gIC8vIC0gYiB3b3VsZCBjb21tb25seSByZXF1aXJlIHN1YnRyYWN0aW9uOiAgYGluUmFuZ2UoJ3gnLCB4LCAwbiwgUCAtIDFuKWBcbiAgLy8gLSBvdXIgd2F5IGlzIHRoZSBjbGVhbmVzdDogICAgICAgICAgICAgICBgaW5SYW5nZSgneCcsIHgsIDBuLCBQKVxuICBpZiAoIWluUmFuZ2UobiwgbWluLCBtYXgpKVxuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgdmFsaWQgJyArIHRpdGxlICsgJzogJyArIG1pbiArICcgPD0gbiA8ICcgKyBtYXggKyAnLCBnb3QgJyArIG4pO1xufVxuXG4vLyBCaXQgb3BlcmF0aW9uc1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgYW1vdW50IG9mIGJpdHMgaW4gYSBiaWdpbnQuXG4gKiBTYW1lIGFzIGBuLnRvU3RyaW5nKDIpLmxlbmd0aGBcbiAqIFRPRE86IG1lcmdlIHdpdGggbkxlbmd0aCBpbiBtb2R1bGFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaXRMZW4objogYmlnaW50KTogbnVtYmVyIHtcbiAgbGV0IGxlbjtcbiAgZm9yIChsZW4gPSAwOyBuID4gXzBuOyBuID4+PSBfMW4sIGxlbiArPSAxKTtcbiAgcmV0dXJuIGxlbjtcbn1cblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBiaXQgYXQgcG9zaXRpb24uXG4gKiBOT1RFOiBmaXJzdCBiaXQgcG9zaXRpb24gaXMgMCAoc2FtZSBhcyBhcnJheXMpXG4gKiBTYW1lIGFzIGAhIStBcnJheS5mcm9tKG4udG9TdHJpbmcoMikpLnJldmVyc2UoKVtwb3NdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0R2V0KG46IGJpZ2ludCwgcG9zOiBudW1iZXIpOiBiaWdpbnQge1xuICByZXR1cm4gKG4gPj4gQmlnSW50KHBvcykpICYgXzFuO1xufVxuXG4vKipcbiAqIFNldHMgc2luZ2xlIGJpdCBhdCBwb3NpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpdFNldChuOiBiaWdpbnQsIHBvczogbnVtYmVyLCB2YWx1ZTogYm9vbGVhbik6IGJpZ2ludCB7XG4gIHJldHVybiBuIHwgKCh2YWx1ZSA/IF8xbiA6IF8wbikgPDwgQmlnSW50KHBvcykpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBtYXNrIGZvciBOIGJpdHMuIE5vdCB1c2luZyAqKiBvcGVyYXRvciB3aXRoIGJpZ2ludHMgYmVjYXVzZSBvZiBvbGQgZW5naW5lcy5cbiAqIFNhbWUgYXMgQmlnSW50KGAwYiR7QXJyYXkoaSkuZmlsbCgnMScpLmpvaW4oJycpfWApXG4gKi9cbmV4cG9ydCBjb25zdCBiaXRNYXNrID0gKG46IG51bWJlcik6IGJpZ2ludCA9PiAoXzFuIDw8IEJpZ0ludChuKSkgLSBfMW47XG5cbi8vIERSQkdcblxudHlwZSBQcmVkPFQ+ID0gKHY6IFVpbnQ4QXJyYXkpID0+IFQgfCB1bmRlZmluZWQ7XG4vKipcbiAqIE1pbmltYWwgSE1BQy1EUkJHIGZyb20gTklTVCA4MDAtOTAgZm9yIFJGQzY5Nzkgc2lncy5cbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHRoYXQgd2lsbCBjYWxsIERSQkcgdW50aWwgMm5kIGFyZyByZXR1cm5zIHNvbWV0aGluZyBtZWFuaW5nZnVsXG4gKiBAZXhhbXBsZVxuICogICBjb25zdCBkcmJnID0gY3JlYXRlSG1hY0RSQkc8S2V5PigzMiwgMzIsIGhtYWMpO1xuICogICBkcmJnKHNlZWQsIGJ5dGVzVG9LZXkpOyAvLyBieXRlc1RvS2V5IG11c3QgcmV0dXJuIEtleSBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhtYWNEcmJnPFQ+KFxuICBoYXNoTGVuOiBudW1iZXIsXG4gIHFCeXRlTGVuOiBudW1iZXIsXG4gIGhtYWNGbjogKGtleTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheVxuKTogKHNlZWQ6IFVpbnQ4QXJyYXksIHByZWRpY2F0ZTogUHJlZDxUPikgPT4gVCB7XG4gIGFudW1iZXIoaGFzaExlbiwgJ2hhc2hMZW4nKTtcbiAgYW51bWJlcihxQnl0ZUxlbiwgJ3FCeXRlTGVuJyk7XG4gIGlmICh0eXBlb2YgaG1hY0ZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ2htYWNGbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgY29uc3QgdThuID0gKGxlbjogbnVtYmVyKTogVWludDhBcnJheSA9PiBuZXcgVWludDhBcnJheShsZW4pOyAvLyBjcmVhdGVzIFVpbnQ4QXJyYXlcbiAgY29uc3QgTlVMTCA9IFVpbnQ4QXJyYXkub2YoKTtcbiAgY29uc3QgYnl0ZTAgPSBVaW50OEFycmF5Lm9mKDB4MDApO1xuICBjb25zdCBieXRlMSA9IFVpbnQ4QXJyYXkub2YoMHgwMSk7XG4gIGNvbnN0IF9tYXhEcmJnSXRlcnMgPSAxMDAwO1xuXG4gIC8vIFN0ZXAgQiwgU3RlcCBDOiBzZXQgaGFzaExlbiB0byA4KmNlaWwoaGxlbi84KVxuICBsZXQgdiA9IHU4bihoYXNoTGVuKTsgLy8gTWluaW1hbCBub24tZnVsbC1zcGVjIEhNQUMtRFJCRyBmcm9tIE5JU1QgODAwLTkwIGZvciBSRkM2OTc5IHNpZ3MuXG4gIGxldCBrID0gdThuKGhhc2hMZW4pOyAvLyBTdGVwcyBCIGFuZCBDIG9mIFJGQzY5NzkgMy4yOiBzZXQgaGFzaExlbiwgaW4gb3VyIGNhc2UgYWx3YXlzIHNhbWVcbiAgbGV0IGkgPSAwOyAvLyBJdGVyYXRpb25zIGNvdW50ZXIsIHdpbGwgdGhyb3cgd2hlbiBvdmVyIDEwMDBcbiAgY29uc3QgcmVzZXQgPSAoKSA9PiB7XG4gICAgdi5maWxsKDEpO1xuICAgIGsuZmlsbCgwKTtcbiAgICBpID0gMDtcbiAgfTtcbiAgY29uc3QgaCA9ICguLi5tc2dzOiBVaW50OEFycmF5W10pID0+IGhtYWNGbihrLCBjb25jYXRCeXRlc18odiwgLi4ubXNncykpOyAvLyBobWFjKGspKHYsIC4uLnZhbHVlcylcbiAgY29uc3QgcmVzZWVkID0gKHNlZWQ6IFVpbnQ4QXJyYXkgPSBOVUxMKSA9PiB7XG4gICAgLy8gSE1BQy1EUkJHIHJlc2VlZCgpIGZ1bmN0aW9uLiBTdGVwcyBELUdcbiAgICBrID0gaChieXRlMCwgc2VlZCk7IC8vIGsgPSBobWFjKGsgfHwgdiB8fCAweDAwIHx8IHNlZWQpXG4gICAgdiA9IGgoKTsgLy8gdiA9IGhtYWMoayB8fCB2KVxuICAgIGlmIChzZWVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGsgPSBoKGJ5dGUxLCBzZWVkKTsgLy8gayA9IGhtYWMoayB8fCB2IHx8IDB4MDEgfHwgc2VlZClcbiAgICB2ID0gaCgpOyAvLyB2ID0gaG1hYyhrIHx8IHYpXG4gIH07XG4gIGNvbnN0IGdlbiA9ICgpID0+IHtcbiAgICAvLyBITUFDLURSQkcgZ2VuZXJhdGUoKSBmdW5jdGlvblxuICAgIGlmIChpKysgPj0gX21heERyYmdJdGVycykgdGhyb3cgbmV3IEVycm9yKCdkcmJnOiB0cmllZCBtYXggYW1vdW50IG9mIGl0ZXJhdGlvbnMnKTtcbiAgICBsZXQgbGVuID0gMDtcbiAgICBjb25zdCBvdXQ6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgIHdoaWxlIChsZW4gPCBxQnl0ZUxlbikge1xuICAgICAgdiA9IGgoKTtcbiAgICAgIGNvbnN0IHNsID0gdi5zbGljZSgpO1xuICAgICAgb3V0LnB1c2goc2wpO1xuICAgICAgbGVuICs9IHYubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gY29uY2F0Qnl0ZXNfKC4uLm91dCk7XG4gIH07XG4gIGNvbnN0IGdlblVudGlsID0gKHNlZWQ6IFVpbnQ4QXJyYXksIHByZWQ6IFByZWQ8VD4pOiBUID0+IHtcbiAgICByZXNldCgpO1xuICAgIHJlc2VlZChzZWVkKTsgLy8gU3RlcHMgRC1HXG4gICAgbGV0IHJlczogVCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDsgLy8gU3RlcCBIOiBncmluZCB1bnRpbCBrIGlzIGluIFsxLi5uLTFdXG4gICAgd2hpbGUgKCEocmVzID0gcHJlZChnZW4oKSkpKSByZXNlZWQoKTtcbiAgICByZXNldCgpO1xuICAgIHJldHVybiByZXM7XG4gIH07XG4gIHJldHVybiBnZW5VbnRpbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0KFxuICBvYmplY3Q6IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIGZpZWxkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9LFxuICBvcHRGaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuKTogdm9pZCB7XG4gIGlmICghb2JqZWN0IHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHZhbGlkIG9wdGlvbnMgb2JqZWN0Jyk7XG4gIHR5cGUgSXRlbSA9IGtleW9mIHR5cGVvZiBvYmplY3Q7XG4gIGZ1bmN0aW9uIGNoZWNrRmllbGQoZmllbGROYW1lOiBJdGVtLCBleHBlY3RlZFR5cGU6IHN0cmluZywgaXNPcHQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB2YWwgPSBvYmplY3RbZmllbGROYW1lXTtcbiAgICBpZiAoaXNPcHQgJiYgdmFsID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICBjb25zdCBjdXJyZW50ID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoY3VycmVudCAhPT0gZXhwZWN0ZWRUeXBlIHx8IHZhbCA9PT0gbnVsbClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgcGFyYW0gXCIke2ZpZWxkTmFtZX1cIiBpcyBpbnZhbGlkOiBleHBlY3RlZCAke2V4cGVjdGVkVHlwZX0sIGdvdCAke2N1cnJlbnR9YCk7XG4gIH1cbiAgY29uc3QgaXRlciA9IChmOiB0eXBlb2YgZmllbGRzLCBpc09wdDogYm9vbGVhbikgPT5cbiAgICBPYmplY3QuZW50cmllcyhmKS5mb3JFYWNoKChbaywgdl0pID0+IGNoZWNrRmllbGQoaywgdiwgaXNPcHQpKTtcbiAgaXRlcihmaWVsZHMsIGZhbHNlKTtcbiAgaXRlcihvcHRGaWVsZHMsIHRydWUpO1xufVxuXG4vKipcbiAqIHRocm93cyBub3QgaW1wbGVtZW50ZWQgZXJyb3JcbiAqL1xuZXhwb3J0IGNvbnN0IG5vdEltcGxlbWVudGVkID0gKCk6IG5ldmVyID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbn07XG5cbi8qKlxuICogTWVtb2l6ZXMgKGNhY2hlcykgY29tcHV0YXRpb24gcmVzdWx0LlxuICogVXNlcyBXZWFrTWFwOiB0aGUgdmFsdWUgaXMgZ29pbmcgYXV0by1jbGVhbmVkIGJ5IEdDIGFmdGVyIGxhc3QgcmVmZXJlbmNlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZDxUIGV4dGVuZHMgb2JqZWN0LCBSLCBPIGV4dGVuZHMgYW55W10+KFxuICBmbjogKGFyZzogVCwgLi4uYXJnczogTykgPT4gUlxuKTogKGFyZzogVCwgLi4uYXJnczogTykgPT4gUiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBXZWFrTWFwPFQsIFI+KCk7XG4gIHJldHVybiAoYXJnOiBULCAuLi5hcmdzOiBPKTogUiA9PiB7XG4gICAgY29uc3QgdmFsID0gbWFwLmdldChhcmcpO1xuICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHZhbDtcbiAgICBjb25zdCBjb21wdXRlZCA9IGZuKGFyZywgLi4uYXJncyk7XG4gICAgbWFwLnNldChhcmcsIGNvbXB1dGVkKTtcbiAgICByZXR1cm4gY29tcHV0ZWQ7XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3J5cHRvS2V5cyB7XG4gIGxlbmd0aHM6IHsgc2VlZD86IG51bWJlcjsgcHVibGljPzogbnVtYmVyOyBzZWNyZXQ/OiBudW1iZXIgfTtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xufVxuXG4vKiogR2VuZXJpYyBpbnRlcmZhY2UgZm9yIHNpZ25hdHVyZXMuIEhhcyBrZXlnZW4sIHNpZ24gYW5kIHZlcmlmeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVyIGV4dGVuZHMgQ3J5cHRvS2V5cyB7XG4gIC8vIEludGVyZmFjZXMgYXJlIGZ1bi4gV2UgY2Fubm90IGp1c3QgYWRkIG5ldyBmaWVsZHMgd2l0aG91dCBjb3B5aW5nIG9sZCBvbmVzLlxuICBsZW5ndGhzOiB7XG4gICAgc2VlZD86IG51bWJlcjtcbiAgICBwdWJsaWM/OiBudW1iZXI7XG4gICAgc2VjcmV0PzogbnVtYmVyO1xuICAgIHNpZ25SYW5kPzogbnVtYmVyO1xuICAgIHNpZ25hdHVyZT86IG51bWJlcjtcbiAgfTtcbiAgc2lnbjogKG1zZzogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICB2ZXJpZnk6IChzaWc6IFVpbnQ4QXJyYXksIG1zZzogVWludDhBcnJheSwgcHVibGljS2V5OiBVaW50OEFycmF5KSA9PiBib29sZWFuO1xufVxuIiwgIi8qKlxuICogVXRpbHMgZm9yIG1vZHVsYXIgZGl2aXNpb24gYW5kIGZpZWxkcy5cbiAqIEZpZWxkIG92ZXIgMTEgaXMgYSBmaW5pdGUgKEdhbG9pcykgZmllbGQgaXMgaW50ZWdlciBudW1iZXIgb3BlcmF0aW9ucyBgbW9kIDExYC5cbiAqIFRoZXJlIGlzIG5vIGRpdmlzaW9uOiBpdCBpcyByZXBsYWNlZCBieSBtb2R1bGFyIG11bHRpcGxpY2F0aXZlIGludmVyc2UuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7XG4gIGFieXRlcyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb051bWJlckJFLFxuICBieXRlc1RvTnVtYmVyTEUsXG4gIG51bWJlclRvQnl0ZXNCRSxcbiAgbnVtYmVyVG9CeXRlc0xFLFxuICB2YWxpZGF0ZU9iamVjdCxcbn0gZnJvbSAnLi4vdXRpbHMudHMnO1xuXG4vLyBOdW1iZXJzIGFyZW4ndCB1c2VkIGluIHgyNTUxOSAvIHg0NDggYnVpbGRzXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCksIF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSksIF8ybiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMik7XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8zbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMyksIF80biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNCksIF81biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNSk7XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF83biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNyksIF84biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoOCksIF85biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoOSk7XG5jb25zdCBfMTZuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxNik7XG5cbi8vIENhbGN1bGF0ZXMgYSBtb2R1bG8gYlxuZXhwb3J0IGZ1bmN0aW9uIG1vZChhOiBiaWdpbnQsIGI6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGNvbnN0IHJlc3VsdCA9IGEgJSBiO1xuICByZXR1cm4gcmVzdWx0ID49IF8wbiA/IHJlc3VsdCA6IGIgKyByZXN1bHQ7XG59XG4vKipcbiAqIEVmZmljaWVudGx5IHJhaXNlIG51bSB0byBwb3dlciBhbmQgZG8gbW9kdWxhciBkaXZpc2lvbi5cbiAqIFVuc2FmZSBpbiBzb21lIGNvbnRleHRzOiB1c2VzIGxhZGRlciwgc28gY2FuIGV4cG9zZSBiaWdpbnQgYml0cy5cbiAqIEBleGFtcGxlXG4gKiBwb3coMm4sIDZuLCAxMW4pIC8vIDY0biAlIDExbiA9PSA5blxuICovXG5leHBvcnQgZnVuY3Rpb24gcG93KG51bTogYmlnaW50LCBwb3dlcjogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJpZ2ludCB7XG4gIHJldHVybiBGcFBvdyhGaWVsZChtb2R1bG8pLCBudW0sIHBvd2VyKTtcbn1cblxuLyoqIERvZXMgYHheKDJecG93ZXIpYCBtb2QgcC4gYHBvdzIoMzAsIDQpYCA9PSBgMzBeKDJeNClgICovXG5leHBvcnQgZnVuY3Rpb24gcG93Mih4OiBiaWdpbnQsIHBvd2VyOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYmlnaW50IHtcbiAgbGV0IHJlcyA9IHg7XG4gIHdoaWxlIChwb3dlci0tID4gXzBuKSB7XG4gICAgcmVzICo9IHJlcztcbiAgICByZXMgJT0gbW9kdWxvO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogSW52ZXJzZXMgbnVtYmVyIG92ZXIgbW9kdWxvLlxuICogSW1wbGVtZW50ZWQgdXNpbmcgW0V1Y2xpZGVhbiBHQ0RdKGh0dHBzOi8vYnJpbGxpYW50Lm9yZy93aWtpL2V4dGVuZGVkLWV1Y2xpZGVhbi1hbGdvcml0aG0vKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChudW1iZXI6IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBiaWdpbnQge1xuICBpZiAobnVtYmVyID09PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBleHBlY3RlZCBub24temVybyBudW1iZXInKTtcbiAgaWYgKG1vZHVsbyA8PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBleHBlY3RlZCBwb3NpdGl2ZSBtb2R1bHVzLCBnb3QgJyArIG1vZHVsbyk7XG4gIC8vIEZlcm1hdCdzIGxpdHRsZSB0aGVvcmVtIFwiQ1QtbGlrZVwiIHZlcnNpb24gaW52KG4pID0gbl4obS0yKSBtb2QgbSBpcyAzMHggc2xvd2VyLlxuICBsZXQgYSA9IG1vZChudW1iZXIsIG1vZHVsbyk7XG4gIGxldCBiID0gbW9kdWxvO1xuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgbGV0IHggPSBfMG4sIHkgPSBfMW4sIHUgPSBfMW4sIHYgPSBfMG47XG4gIHdoaWxlIChhICE9PSBfMG4pIHtcbiAgICAvLyBKSVQgYXBwbGllcyBvcHRpbWl6YXRpb24gaWYgdGhvc2UgdHdvIGxpbmVzIGZvbGxvdyBlYWNoIG90aGVyXG4gICAgY29uc3QgcSA9IGIgLyBhO1xuICAgIGNvbnN0IHIgPSBiICUgYTtcbiAgICBjb25zdCBtID0geCAtIHUgKiBxO1xuICAgIGNvbnN0IG4gPSB5IC0gdiAqIHE7XG4gICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgYiA9IGEsIGEgPSByLCB4ID0gdSwgeSA9IHYsIHUgPSBtLCB2ID0gbjtcbiAgfVxuICBjb25zdCBnY2QgPSBiO1xuICBpZiAoZ2NkICE9PSBfMW4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBkb2VzIG5vdCBleGlzdCcpO1xuICByZXR1cm4gbW9kKHgsIG1vZHVsbyk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydElzU3F1YXJlPFQ+KEZwOiBJRmllbGQ8VD4sIHJvb3Q6IFQsIG46IFQpOiB2b2lkIHtcbiAgaWYgKCFGcC5lcWwoRnAuc3FyKHJvb3QpLCBuKSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xufVxuXG4vLyBOb3QgYWxsIHJvb3RzIGFyZSBwb3NzaWJsZSEgRXhhbXBsZSB3aGljaCB3aWxsIHRocm93OlxuLy8gY29uc3QgTlVNID1cbi8vIG4gPSA3MjA1NzU5NDAzNzkyNzgxNm47XG4vLyBGcCA9IEZpZWxkKEJpZ0ludCgnMHgxYTAxMTFlYTM5N2ZlNjlhNGIxYmE3YjY0MzRiYWNkNzY0Nzc0Yjg0ZjM4NTEyYmY2NzMwZDJhMGY2YjBmNjI0MWVhYmZmZmViMTUzZmZmZmI5ZmVmZmZmZmZmZmFhYWInKSk7XG5mdW5jdGlvbiBzcXJ0M21vZDQ8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkge1xuICBjb25zdCBwMWRpdjQgPSAoRnAuT1JERVIgKyBfMW4pIC8gXzRuO1xuICBjb25zdCByb290ID0gRnAucG93KG4sIHAxZGl2NCk7XG4gIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIHNxcnQ1bW9kODxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSB7XG4gIGNvbnN0IHA1ZGl2OCA9IChGcC5PUkRFUiAtIF81bikgLyBfOG47XG4gIGNvbnN0IG4yID0gRnAubXVsKG4sIF8ybik7XG4gIGNvbnN0IHYgPSBGcC5wb3cobjIsIHA1ZGl2OCk7XG4gIGNvbnN0IG52ID0gRnAubXVsKG4sIHYpO1xuICBjb25zdCBpID0gRnAubXVsKEZwLm11bChudiwgXzJuKSwgdik7XG4gIGNvbnN0IHJvb3QgPSBGcC5tdWwobnYsIEZwLnN1YihpLCBGcC5PTkUpKTtcbiAgYXNzZXJ0SXNTcXVhcmUoRnAsIHJvb3QsIG4pO1xuICByZXR1cm4gcm9vdDtcbn1cblxuLy8gQmFzZWQgb24gUkZDOTM4MCwgS29uZyBhbGdvcml0aG1cbi8vIHByZXR0aWVyLWlnbm9yZVxuZnVuY3Rpb24gc3FydDltb2QxNihQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIGNvbnN0IEZwXyA9IEZpZWxkKFApO1xuICBjb25zdCB0biA9IHRvbmVsbGlTaGFua3MoUCk7XG4gIGNvbnN0IGMxID0gdG4oRnBfLCBGcF8ubmVnKEZwXy5PTkUpKTsvLyAgMS4gYzEgPSBzcXJ0KC0xKSBpbiBGLCBpLmUuLCAoYzFeMikgPT0gLTEgaW4gRlxuICBjb25zdCBjMiA9IHRuKEZwXywgYzEpOyAgICAgICAgICAgICAgLy8gIDIuIGMyID0gc3FydChjMSkgaW4gRiwgaS5lLiwgKGMyXjIpID09IGMxIGluIEZcbiAgY29uc3QgYzMgPSB0bihGcF8sIEZwXy5uZWcoYzEpKTsgICAgIC8vICAzLiBjMyA9IHNxcnQoLWMxKSBpbiBGLCBpLmUuLCAoYzNeMikgPT0gLWMxIGluIEZcbiAgY29uc3QgYzQgPSAoUCArIF83bikgLyBfMTZuOyAgICAgICAgIC8vICA0LiBjNCA9IChxICsgNykgLyAxNiAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgcmV0dXJuIDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiB7XG4gICAgbGV0IHR2MSA9IEZwLnBvdyhuLCBjNCk7ICAgICAgICAgICAvLyAgMS4gdHYxID0geF5jNFxuICAgIGxldCB0djIgPSBGcC5tdWwodHYxLCBjMSk7ICAgICAgICAgLy8gIDIuIHR2MiA9IGMxICogdHYxXG4gICAgY29uc3QgdHYzID0gRnAubXVsKHR2MSwgYzIpOyAgICAgICAvLyAgMy4gdHYzID0gYzIgKiB0djFcbiAgICBjb25zdCB0djQgPSBGcC5tdWwodHYxLCBjMyk7ICAgICAgIC8vICA0LiB0djQgPSBjMyAqIHR2MVxuICAgIGNvbnN0IGUxID0gRnAuZXFsKEZwLnNxcih0djIpLCBuKTsgLy8gIDUuICBlMSA9ICh0djJeMikgPT0geFxuICAgIGNvbnN0IGUyID0gRnAuZXFsKEZwLnNxcih0djMpLCBuKTsgLy8gIDYuICBlMiA9ICh0djNeMikgPT0geFxuICAgIHR2MSA9IEZwLmNtb3YodHYxLCB0djIsIGUxKTsgICAgICAgLy8gIDcuIHR2MSA9IENNT1YodHYxLCB0djIsIGUxKSAgIyBTZWxlY3QgdHYyIGlmICh0djJeMikgPT0geFxuICAgIHR2MiA9IEZwLmNtb3YodHY0LCB0djMsIGUyKTsgICAgICAgLy8gIDguIHR2MiA9IENNT1YodHY0LCB0djMsIGUyKSAgIyBTZWxlY3QgdHYzIGlmICh0djNeMikgPT0geFxuICAgIGNvbnN0IGUzID0gRnAuZXFsKEZwLnNxcih0djIpLCBuKTsgLy8gIDkuICBlMyA9ICh0djJeMikgPT0geFxuICAgIGNvbnN0IHJvb3QgPSBGcC5jbW92KHR2MSwgdHYyLCBlMyk7Ly8gMTAuICB6ID0gQ01PVih0djEsIHR2MiwgZTMpICAgIyBTZWxlY3Qgc3FydCBmcm9tIHR2MSAmIHR2MlxuICAgIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBUb25lbGxpLVNoYW5rcyBzcXVhcmUgcm9vdCBzZWFyY2ggYWxnb3JpdGhtLlxuICogMS4gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmIChwYWdlIDEyKVxuICogMi4gU3F1YXJlIFJvb3RzIGZyb20gMTsgMjQsIDUxLCAxMCB0byBEYW4gU2hhbmtzXG4gKiBAcGFyYW0gUCBmaWVsZCBvcmRlclxuICogQHJldHVybnMgZnVuY3Rpb24gdGhhdCB0YWtlcyBmaWVsZCBGcCAoY3JlYXRlZCBmcm9tIFApIGFuZCBudW1iZXIgblxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9uZWxsaVNoYW5rcyhQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIC8vIEluaXRpYWxpemF0aW9uIChwcmVjb21wdXRhdGlvbikuXG4gIC8vIENhY2hpbmcgaW5pdGlhbGl6YXRpb24gY291bGQgYm9vc3QgcGVyZiBieSA3JS5cbiAgaWYgKFAgPCBfM24pIHRocm93IG5ldyBFcnJvcignc3FydCBpcyBub3QgZGVmaW5lZCBmb3Igc21hbGwgZmllbGQnKTtcbiAgLy8gRmFjdG9yIFAgLSAxID0gUSAqIDJeUywgd2hlcmUgUSBpcyBvZGRcbiAgbGV0IFEgPSBQIC0gXzFuO1xuICBsZXQgUyA9IDA7XG4gIHdoaWxlIChRICUgXzJuID09PSBfMG4pIHtcbiAgICBRIC89IF8ybjtcbiAgICBTKys7XG4gIH1cblxuICAvLyBGaW5kIHRoZSBmaXJzdCBxdWFkcmF0aWMgbm9uLXJlc2lkdWUgWiA+PSAyXG4gIGxldCBaID0gXzJuO1xuICBjb25zdCBfRnAgPSBGaWVsZChQKTtcbiAgd2hpbGUgKEZwTGVnZW5kcmUoX0ZwLCBaKSA9PT0gMSkge1xuICAgIC8vIEJhc2ljIHByaW1hbGl0eSB0ZXN0IGZvciBQLiBBZnRlciB4IGl0ZXJhdGlvbnMsIGNoYW5jZSBvZlxuICAgIC8vIG5vdCBmaW5kaW5nIHF1YWRyYXRpYyBub24tcmVzaWR1ZSBpcyAyXngsIHNvIDJeMTAwMC5cbiAgICBpZiAoWisrID4gMTAwMCkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdDogcHJvYmFibHkgbm9uLXByaW1lIFAnKTtcbiAgfVxuICAvLyBGYXN0LXBhdGg7IHVzdWFsbHkgZG9uZSBiZWZvcmUgWiwgYnV0IHdlIGRvIFwicHJpbWFsaXR5IHRlc3RcIi5cbiAgaWYgKFMgPT09IDEpIHJldHVybiBzcXJ0M21vZDQ7XG5cbiAgLy8gU2xvdy1wYXRoXG4gIC8vIFRPRE86IHRlc3Qgb24gRnAyIGFuZCBvdGhlcnNcbiAgbGV0IGNjID0gX0ZwLnBvdyhaLCBRKTsgLy8gYyA9IHpeUVxuICBjb25zdCBRMWRpdjIgPSAoUSArIF8xbikgLyBfMm47XG4gIHJldHVybiBmdW5jdGlvbiB0b25lbGxpU2xvdzxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogVCB7XG4gICAgaWYgKEZwLmlzMChuKSkgcmV0dXJuIG47XG4gICAgLy8gQ2hlY2sgaWYgbiBpcyBhIHF1YWRyYXRpYyByZXNpZHVlIHVzaW5nIExlZ2VuZHJlIHN5bWJvbFxuICAgIGlmIChGcExlZ2VuZHJlKEZwLCBuKSAhPT0gMSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB2YXJpYWJsZXMgZm9yIHRoZSBtYWluIGxvb3BcbiAgICBsZXQgTSA9IFM7XG4gICAgbGV0IGMgPSBGcC5tdWwoRnAuT05FLCBjYyk7IC8vIGMgPSB6XlEsIG1vdmUgY2MgZnJvbSBmaWVsZCBfRnAgaW50byBmaWVsZCBGcFxuICAgIGxldCB0ID0gRnAucG93KG4sIFEpOyAvLyB0ID0gbl5RLCBmaXJzdCBndWVzcyBhdCB0aGUgZnVkZ2UgZmFjdG9yXG4gICAgbGV0IFIgPSBGcC5wb3cobiwgUTFkaXYyKTsgLy8gUiA9IG5eKChRKzEpLzIpLCBmaXJzdCBndWVzcyBhdCB0aGUgc3F1YXJlIHJvb3RcblxuICAgIC8vIE1haW4gbG9vcFxuICAgIC8vIHdoaWxlIHQgIT0gMVxuICAgIHdoaWxlICghRnAuZXFsKHQsIEZwLk9ORSkpIHtcbiAgICAgIGlmIChGcC5pczAodCkpIHJldHVybiBGcC5aRVJPOyAvLyBpZiB0PTAgcmV0dXJuIFI9MFxuICAgICAgbGV0IGkgPSAxO1xuXG4gICAgICAvLyBGaW5kIHRoZSBzbWFsbGVzdCBpID49IDEgc3VjaCB0aGF0IHReKDJeaSkgXHUyMjYxIDEgKG1vZCBQKVxuICAgICAgbGV0IHRfdG1wID0gRnAuc3FyKHQpOyAvLyB0XigyXjEpXG4gICAgICB3aGlsZSAoIUZwLmVxbCh0X3RtcCwgRnAuT05FKSkge1xuICAgICAgICBpKys7XG4gICAgICAgIHRfdG1wID0gRnAuc3FyKHRfdG1wKTsgLy8gdF4oMl4yKS4uLlxuICAgICAgICBpZiAoaSA9PT0gTSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGV4cG9uZW50IGZvciBiOiAyXihNIC0gaSAtIDEpXG4gICAgICBjb25zdCBleHBvbmVudCA9IF8xbiA8PCBCaWdJbnQoTSAtIGkgLSAxKTsgLy8gYmlnaW50IGlzIGltcG9ydGFudFxuICAgICAgY29uc3QgYiA9IEZwLnBvdyhjLCBleHBvbmVudCk7IC8vIGIgPSAyXihNIC0gaSAtIDEpXG5cbiAgICAgIC8vIFVwZGF0ZSB2YXJpYWJsZXNcbiAgICAgIE0gPSBpO1xuICAgICAgYyA9IEZwLnNxcihiKTsgLy8gYyA9IGJeMlxuICAgICAgdCA9IEZwLm11bCh0LCBjKTsgLy8gdCA9ICh0ICogYl4yKVxuICAgICAgUiA9IEZwLm11bChSLCBiKTsgLy8gUiA9IFIqYlxuICAgIH1cbiAgICByZXR1cm4gUjtcbiAgfTtcbn1cblxuLyoqXG4gKiBTcXVhcmUgcm9vdCBmb3IgYSBmaW5pdGUgZmllbGQuIFdpbGwgdHJ5IG9wdGltaXplZCB2ZXJzaW9ucyBmaXJzdDpcbiAqXG4gKiAxLiBQIFx1MjI2MSAzIChtb2QgNClcbiAqIDIuIFAgXHUyMjYxIDUgKG1vZCA4KVxuICogMy4gUCBcdTIyNjEgOSAobW9kIDE2KVxuICogNC4gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtXG4gKlxuICogRGlmZmVyZW50IGFsZ29yaXRobXMgY2FuIGdpdmUgZGlmZmVyZW50IHJvb3RzLCBpdCBpcyB1cCB0byB1c2VyIHRvIGRlY2lkZSB3aGljaCBvbmUgdGhleSB3YW50LlxuICogRm9yIGV4YW1wbGUgdGhlcmUgaXMgRnBTcXJ0T2RkL0ZwU3FydEV2ZW4gdG8gY2hvaWNlIHJvb3QgYmFzZWQgb24gb2RkbmVzcyAodXNlZCBmb3IgaGFzaC10by1jdXJ2ZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnQoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICAvLyBQIFx1MjI2MSAzIChtb2QgNCkgPT4gXHUyMjFBbiA9IG5eKChQKzEpLzQpXG4gIGlmIChQICUgXzRuID09PSBfM24pIHJldHVybiBzcXJ0M21vZDQ7XG4gIC8vIFAgXHUyMjYxIDUgKG1vZCA4KSA9PiBBdGtpbiBhbGdvcml0aG0sIHBhZ2UgMTAgb2YgaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmXG4gIGlmIChQICUgXzhuID09PSBfNW4pIHJldHVybiBzcXJ0NW1vZDg7XG4gIC8vIFAgXHUyMjYxIDkgKG1vZCAxNikgPT4gS29uZyBhbGdvcml0aG0sIHBhZ2UgMTEgb2YgaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmIChhbGdvcml0aG0gNClcbiAgaWYgKFAgJSBfMTZuID09PSBfOW4pIHJldHVybiBzcXJ0OW1vZDE2KFApO1xuICAvLyBUb25lbGxpLVNoYW5rcyBhbGdvcml0aG1cbiAgcmV0dXJuIHRvbmVsbGlTaGFua3MoUCk7XG59XG5cbi8vIExpdHRsZS1lbmRpYW4gY2hlY2sgZm9yIGZpcnN0IExFIGJpdCAobGFzdCBCRSBiaXQpO1xuZXhwb3J0IGNvbnN0IGlzTmVnYXRpdmVMRSA9IChudW06IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBib29sZWFuID0+XG4gIChtb2QobnVtLCBtb2R1bG8pICYgXzFuKSA9PT0gXzFuO1xuXG4vKiogRmllbGQgaXMgbm90IGFsd2F5cyBvdmVyIHByaW1lOiBmb3IgZXhhbXBsZSwgRnAyIGhhcyBPUkRFUihxKT1wXm0uICovXG5leHBvcnQgaW50ZXJmYWNlIElGaWVsZDxUPiB7XG4gIE9SREVSOiBiaWdpbnQ7XG4gIEJZVEVTOiBudW1iZXI7XG4gIEJJVFM6IG51bWJlcjtcbiAgaXNMRTogYm9vbGVhbjtcbiAgWkVSTzogVDtcbiAgT05FOiBUO1xuICAvLyAxLWFyZ1xuICBjcmVhdGU6IChudW06IFQpID0+IFQ7XG4gIGlzVmFsaWQ6IChudW06IFQpID0+IGJvb2xlYW47XG4gIGlzMDogKG51bTogVCkgPT4gYm9vbGVhbjtcbiAgaXNWYWxpZE5vdDA6IChudW06IFQpID0+IGJvb2xlYW47XG4gIG5lZyhudW06IFQpOiBUO1xuICBpbnYobnVtOiBUKTogVDtcbiAgc3FydChudW06IFQpOiBUO1xuICBzcXIobnVtOiBUKTogVDtcbiAgLy8gMi1hcmdzXG4gIGVxbChsaHM6IFQsIHJoczogVCk6IGJvb2xlYW47XG4gIGFkZChsaHM6IFQsIHJoczogVCk6IFQ7XG4gIHN1YihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIG11bChsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQ7XG4gIHBvdyhsaHM6IFQsIHBvd2VyOiBiaWdpbnQpOiBUO1xuICBkaXYobGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICAvLyBOIGZvciBOb25Ob3JtYWxpemVkIChmb3Igbm93KVxuICBhZGROKGxoczogVCwgcmhzOiBUKTogVDtcbiAgc3ViTihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIG11bE4obGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICBzcXJOKG51bTogVCk6IFQ7XG5cbiAgLy8gT3B0aW9uYWxcbiAgLy8gU2hvdWxkIGJlIHNhbWUgYXMgc2duMCBmdW5jdGlvbiBpblxuICAvLyBbUkZDOTM4MF0oaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi00LjEpLlxuICAvLyBOT1RFOiBzZ24wIGlzICduZWdhdGl2ZSBpbiBMRScsIHdoaWNoIGlzIHNhbWUgYXMgb2RkLiBBbmQgbmVnYXRpdmUgaW4gTEUgaXMga2luZGEgc3RyYW5nZSBkZWZpbml0aW9uIGFueXdheS5cbiAgaXNPZGQ/KG51bTogVCk6IGJvb2xlYW47IC8vIE9kZCBpbnN0ZWFkIG9mIGV2ZW4gc2luY2Ugd2UgaGF2ZSBpdCBmb3IgRnAyXG4gIC8vIGxlZ2VuZHJlPyhudW06IFQpOiBUO1xuICBpbnZlcnRCYXRjaDogKGxzdDogVFtdKSA9PiBUW107XG4gIHRvQnl0ZXMobnVtOiBUKTogVWludDhBcnJheTtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBza2lwVmFsaWRhdGlvbj86IGJvb2xlYW4pOiBUO1xuICAvLyBJZiBjIGlzIEZhbHNlLCBDTU9WIHJldHVybnMgYSwgb3RoZXJ3aXNlIGl0IHJldHVybnMgYi5cbiAgY21vdihhOiBULCBiOiBULCBjOiBib29sZWFuKTogVDtcbn1cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgRklFTERfRklFTERTID0gW1xuICAnY3JlYXRlJywgJ2lzVmFsaWQnLCAnaXMwJywgJ25lZycsICdpbnYnLCAnc3FydCcsICdzcXInLFxuICAnZXFsJywgJ2FkZCcsICdzdWInLCAnbXVsJywgJ3BvdycsICdkaXYnLFxuICAnYWRkTicsICdzdWJOJywgJ211bE4nLCAnc3FyTidcbl0gYXMgY29uc3Q7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZDxUPihmaWVsZDogSUZpZWxkPFQ+KTogSUZpZWxkPFQ+IHtcbiAgY29uc3QgaW5pdGlhbCA9IHtcbiAgICBPUkRFUjogJ2JpZ2ludCcsXG4gICAgQllURVM6ICdudW1iZXInLFxuICAgIEJJVFM6ICdudW1iZXInLFxuICB9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGNvbnN0IG9wdHMgPSBGSUVMRF9GSUVMRFMucmVkdWNlKChtYXAsIHZhbDogc3RyaW5nKSA9PiB7XG4gICAgbWFwW3ZhbF0gPSAnZnVuY3Rpb24nO1xuICAgIHJldHVybiBtYXA7XG4gIH0sIGluaXRpYWwpO1xuICB2YWxpZGF0ZU9iamVjdChmaWVsZCwgb3B0cyk7XG4gIC8vIGNvbnN0IG1heCA9IDE2Mzg0O1xuICAvLyBpZiAoZmllbGQuQllURVMgPCAxIHx8IGZpZWxkLkJZVEVTID4gbWF4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQnKTtcbiAgLy8gaWYgKGZpZWxkLkJJVFMgPCAxIHx8IGZpZWxkLkJJVFMgPiA4ICogbWF4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQnKTtcbiAgcmV0dXJuIGZpZWxkO1xufVxuXG4vLyBHZW5lcmljIGZpZWxkIGZ1bmN0aW9uc1xuXG4vKipcbiAqIFNhbWUgYXMgYHBvd2AgYnV0IGZvciBGcDogbm9uLWNvbnN0YW50LXRpbWUuXG4gKiBVbnNhZmUgaW4gc29tZSBjb250ZXh0czogdXNlcyBsYWRkZXIsIHNvIGNhbiBleHBvc2UgYmlnaW50IGJpdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcFBvdzxUPihGcDogSUZpZWxkPFQ+LCBudW06IFQsIHBvd2VyOiBiaWdpbnQpOiBUIHtcbiAgaWYgKHBvd2VyIDwgXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZXhwb25lbnQsIG5lZ2F0aXZlcyB1bnN1cHBvcnRlZCcpO1xuICBpZiAocG93ZXIgPT09IF8wbikgcmV0dXJuIEZwLk9ORTtcbiAgaWYgKHBvd2VyID09PSBfMW4pIHJldHVybiBudW07XG4gIGxldCBwID0gRnAuT05FO1xuICBsZXQgZCA9IG51bTtcbiAgd2hpbGUgKHBvd2VyID4gXzBuKSB7XG4gICAgaWYgKHBvd2VyICYgXzFuKSBwID0gRnAubXVsKHAsIGQpO1xuICAgIGQgPSBGcC5zcXIoZCk7XG4gICAgcG93ZXIgPj49IF8xbjtcbiAgfVxuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBFZmZpY2llbnRseSBpbnZlcnQgYW4gYXJyYXkgb2YgRmllbGQgZWxlbWVudHMuXG4gKiBFeGNlcHRpb24tZnJlZS4gV2lsbCByZXR1cm4gYHVuZGVmaW5lZGAgZm9yIDAgZWxlbWVudHMuXG4gKiBAcGFyYW0gcGFzc1plcm8gbWFwIDAgdG8gMCAoaW5zdGVhZCBvZiB1bmRlZmluZWQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcEludmVydEJhdGNoPFQ+KEZwOiBJRmllbGQ8VD4sIG51bXM6IFRbXSwgcGFzc1plcm8gPSBmYWxzZSk6IFRbXSB7XG4gIGNvbnN0IGludmVydGVkID0gbmV3IEFycmF5KG51bXMubGVuZ3RoKS5maWxsKHBhc3NaZXJvID8gRnAuWkVSTyA6IHVuZGVmaW5lZCk7XG4gIC8vIFdhbGsgZnJvbSBmaXJzdCB0byBsYXN0LCBtdWx0aXBseSB0aGVtIGJ5IGVhY2ggb3RoZXIgTU9EIHBcbiAgY29uc3QgbXVsdGlwbGllZEFjYyA9IG51bXMucmVkdWNlKChhY2MsIG51bSwgaSkgPT4ge1xuICAgIGlmIChGcC5pczAobnVtKSkgcmV0dXJuIGFjYztcbiAgICBpbnZlcnRlZFtpXSA9IGFjYztcbiAgICByZXR1cm4gRnAubXVsKGFjYywgbnVtKTtcbiAgfSwgRnAuT05FKTtcbiAgLy8gSW52ZXJ0IGxhc3QgZWxlbWVudFxuICBjb25zdCBpbnZlcnRlZEFjYyA9IEZwLmludihtdWx0aXBsaWVkQWNjKTtcbiAgLy8gV2FsayBmcm9tIGxhc3QgdG8gZmlyc3QsIG11bHRpcGx5IHRoZW0gYnkgaW52ZXJ0ZWQgZWFjaCBvdGhlciBNT0QgcFxuICBudW1zLnJlZHVjZVJpZ2h0KChhY2MsIG51bSwgaSkgPT4ge1xuICAgIGlmIChGcC5pczAobnVtKSkgcmV0dXJuIGFjYztcbiAgICBpbnZlcnRlZFtpXSA9IEZwLm11bChhY2MsIGludmVydGVkW2ldKTtcbiAgICByZXR1cm4gRnAubXVsKGFjYywgbnVtKTtcbiAgfSwgaW52ZXJ0ZWRBY2MpO1xuICByZXR1cm4gaW52ZXJ0ZWQ7XG59XG5cbi8vIFRPRE86IHJlbW92ZVxuZXhwb3J0IGZ1bmN0aW9uIEZwRGl2PFQ+KEZwOiBJRmllbGQ8VD4sIGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVCB7XG4gIHJldHVybiBGcC5tdWwobGhzLCB0eXBlb2YgcmhzID09PSAnYmlnaW50JyA/IGludmVydChyaHMsIEZwLk9SREVSKSA6IEZwLmludihyaHMpKTtcbn1cblxuLyoqXG4gKiBMZWdlbmRyZSBzeW1ib2wuXG4gKiBMZWdlbmRyZSBjb25zdGFudCBpcyB1c2VkIHRvIGNhbGN1bGF0ZSBMZWdlbmRyZSBzeW1ib2wgKGEgfCBwKVxuICogd2hpY2ggZGVub3RlcyB0aGUgdmFsdWUgb2YgYV4oKHAtMSkvMikgKG1vZCBwKS5cbiAqXG4gKiAqIChhIHwgcCkgXHUyMjYxIDEgICAgaWYgYSBpcyBhIHNxdWFyZSAobW9kIHApLCBxdWFkcmF0aWMgcmVzaWR1ZVxuICogKiAoYSB8IHApIFx1MjI2MSAtMSAgIGlmIGEgaXMgbm90IGEgc3F1YXJlIChtb2QgcCksIHF1YWRyYXRpYyBub24gcmVzaWR1ZVxuICogKiAoYSB8IHApIFx1MjI2MSAwICAgIGlmIGEgXHUyMjYxIDAgKG1vZCBwKVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBMZWdlbmRyZTxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogLTEgfCAwIHwgMSB7XG4gIC8vIFdlIGNhbiB1c2UgM3JkIGFyZ3VtZW50IGFzIG9wdGlvbmFsIGNhY2hlIG9mIHRoaXMgdmFsdWVcbiAgLy8gYnV0IHNlZW1zIHVubmVlZGVkIGZvciBub3cuIFRoZSBvcGVyYXRpb24gaXMgdmVyeSBmYXN0LlxuICBjb25zdCBwMW1vZDIgPSAoRnAuT1JERVIgLSBfMW4pIC8gXzJuO1xuICBjb25zdCBwb3dlcmVkID0gRnAucG93KG4sIHAxbW9kMik7XG4gIGNvbnN0IHllcyA9IEZwLmVxbChwb3dlcmVkLCBGcC5PTkUpO1xuICBjb25zdCB6ZXJvID0gRnAuZXFsKHBvd2VyZWQsIEZwLlpFUk8pO1xuICBjb25zdCBubyA9IEZwLmVxbChwb3dlcmVkLCBGcC5uZWcoRnAuT05FKSk7XG4gIGlmICgheWVzICYmICF6ZXJvICYmICFubykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIExlZ2VuZHJlIHN5bWJvbCByZXN1bHQnKTtcbiAgcmV0dXJuIHllcyA/IDEgOiB6ZXJvID8gMCA6IC0xO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgVHJ1ZSB3aGVuZXZlciB0aGUgdmFsdWUgeCBpcyBhIHNxdWFyZSBpbiB0aGUgZmllbGQgRi5cbmV4cG9ydCBmdW5jdGlvbiBGcElzU3F1YXJlPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpOiBib29sZWFuIHtcbiAgY29uc3QgbCA9IEZwTGVnZW5kcmUoRnAsIG4pO1xuICByZXR1cm4gbCA9PT0gMTtcbn1cblxuZXhwb3J0IHR5cGUgTkxlbmd0aCA9IHsgbkJ5dGVMZW5ndGg6IG51bWJlcjsgbkJpdExlbmd0aDogbnVtYmVyIH07XG4vLyBDVVJWRS5uIGxlbmd0aHNcbmV4cG9ydCBmdW5jdGlvbiBuTGVuZ3RoKG46IGJpZ2ludCwgbkJpdExlbmd0aD86IG51bWJlcik6IE5MZW5ndGgge1xuICAvLyBCaXQgc2l6ZSwgYnl0ZSBzaXplIG9mIENVUlZFLm5cbiAgaWYgKG5CaXRMZW5ndGggIT09IHVuZGVmaW5lZCkgYW51bWJlcihuQml0TGVuZ3RoKTtcbiAgY29uc3QgX25CaXRMZW5ndGggPSBuQml0TGVuZ3RoICE9PSB1bmRlZmluZWQgPyBuQml0TGVuZ3RoIDogbi50b1N0cmluZygyKS5sZW5ndGg7XG4gIGNvbnN0IG5CeXRlTGVuZ3RoID0gTWF0aC5jZWlsKF9uQml0TGVuZ3RoIC8gOCk7XG4gIHJldHVybiB7IG5CaXRMZW5ndGg6IF9uQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9O1xufVxuXG50eXBlIEZwRmllbGQgPSBJRmllbGQ8YmlnaW50PiAmIFJlcXVpcmVkPFBpY2s8SUZpZWxkPGJpZ2ludD4sICdpc09kZCc+PjtcbnR5cGUgU3FydEZuID0gKG46IGJpZ2ludCkgPT4gYmlnaW50O1xudHlwZSBGaWVsZE9wdHMgPSBQYXJ0aWFsPHtcbiAgaXNMRTogYm9vbGVhbjtcbiAgQklUUzogbnVtYmVyO1xuICBzcXJ0OiBTcXJ0Rm47XG4gIGFsbG93ZWRMZW5ndGhzPzogcmVhZG9ubHkgbnVtYmVyW107IC8vIGZvciBQNTIxIChhZGRzIHBhZGRpbmcgZm9yIHNtYWxsZXIgc2l6ZXMpXG4gIG1vZEZyb21CeXRlczogYm9vbGVhbjsgLy8gYmxzMTItMzgxIHJlcXVpcmVzIG1vZChuKSBpbnN0ZWFkIG9mIHJlamVjdGluZyBrZXlzID49IG5cbn0+O1xuY2xhc3MgX0ZpZWxkIGltcGxlbWVudHMgSUZpZWxkPGJpZ2ludD4ge1xuICByZWFkb25seSBPUkRFUjogYmlnaW50O1xuICByZWFkb25seSBCSVRTOiBudW1iZXI7XG4gIHJlYWRvbmx5IEJZVEVTOiBudW1iZXI7XG4gIHJlYWRvbmx5IGlzTEU6IGJvb2xlYW47XG4gIHJlYWRvbmx5IFpFUk8gPSBfMG47XG4gIHJlYWRvbmx5IE9ORSA9IF8xbjtcbiAgcmVhZG9ubHkgX2xlbmd0aHM/OiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBfc3FydDogUmV0dXJuVHlwZTx0eXBlb2YgRnBTcXJ0PiB8IHVuZGVmaW5lZDsgLy8gY2FjaGVkIHNxcnRcbiAgcHJpdmF0ZSByZWFkb25seSBfbW9kPzogYm9vbGVhbjtcbiAgY29uc3RydWN0b3IoT1JERVI6IGJpZ2ludCwgb3B0czogRmllbGRPcHRzID0ge30pIHtcbiAgICBpZiAoT1JERVIgPD0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQ6IGV4cGVjdGVkIE9SREVSID4gMCwgZ290ICcgKyBPUkRFUik7XG4gICAgbGV0IF9uYml0TGVuZ3RoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5pc0xFID0gZmFsc2U7XG4gICAgaWYgKG9wdHMgIT0gbnVsbCAmJiB0eXBlb2Ygb3B0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5CSVRTID09PSAnbnVtYmVyJykgX25iaXRMZW5ndGggPSBvcHRzLkJJVFM7XG4gICAgICBpZiAodHlwZW9mIG9wdHMuc3FydCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5zcXJ0ID0gb3B0cy5zcXJ0O1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLmlzTEUgPT09ICdib29sZWFuJykgdGhpcy5pc0xFID0gb3B0cy5pc0xFO1xuICAgICAgaWYgKG9wdHMuYWxsb3dlZExlbmd0aHMpIHRoaXMuX2xlbmd0aHMgPSBvcHRzLmFsbG93ZWRMZW5ndGhzPy5zbGljZSgpO1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLm1vZEZyb21CeXRlcyA9PT0gJ2Jvb2xlYW4nKSB0aGlzLl9tb2QgPSBvcHRzLm1vZEZyb21CeXRlcztcbiAgICB9XG4gICAgY29uc3QgeyBuQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9ID0gbkxlbmd0aChPUkRFUiwgX25iaXRMZW5ndGgpO1xuICAgIGlmIChuQnl0ZUxlbmd0aCA+IDIwNDgpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZDogZXhwZWN0ZWQgT1JERVIgb2YgPD0gMjA0OCBieXRlcycpO1xuICAgIHRoaXMuT1JERVIgPSBPUkRFUjtcbiAgICB0aGlzLkJJVFMgPSBuQml0TGVuZ3RoO1xuICAgIHRoaXMuQllURVMgPSBuQnl0ZUxlbmd0aDtcbiAgICB0aGlzLl9zcXJ0ID0gdW5kZWZpbmVkO1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0aGlzKTtcbiAgfVxuXG4gIGNyZWF0ZShudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBpc1ZhbGlkKG51bTogYmlnaW50KSB7XG4gICAgaWYgKHR5cGVvZiBudW0gIT09ICdiaWdpbnQnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkIGVsZW1lbnQ6IGV4cGVjdGVkIGJpZ2ludCwgZ290ICcgKyB0eXBlb2YgbnVtKTtcbiAgICByZXR1cm4gXzBuIDw9IG51bSAmJiBudW0gPCB0aGlzLk9SREVSOyAvLyAwIGlzIHZhbGlkIGVsZW1lbnQsIGJ1dCBpdCdzIG5vdCBpbnZlcnRpYmxlXG4gIH1cbiAgaXMwKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG51bSA9PT0gXzBuO1xuICB9XG4gIC8vIGlzIHZhbGlkIGFuZCBpbnZlcnRpYmxlXG4gIGlzVmFsaWROb3QwKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuICF0aGlzLmlzMChudW0pICYmIHRoaXMuaXNWYWxpZChudW0pO1xuICB9XG4gIGlzT2RkKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIChudW0gJiBfMW4pID09PSBfMW47XG4gIH1cbiAgbmVnKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZCgtbnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBlcWwobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyA9PT0gcmhzO1xuICB9XG5cbiAgc3FyKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChudW0gKiBudW0sIHRoaXMuT1JERVIpO1xuICB9XG4gIGFkZChsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyArIHJocywgdGhpcy5PUkRFUik7XG4gIH1cbiAgc3ViKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzIC0gcmhzLCB0aGlzLk9SREVSKTtcbiAgfVxuICBtdWwobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKiByaHMsIHRoaXMuT1JERVIpO1xuICB9XG4gIHBvdyhudW06IGJpZ2ludCwgcG93ZXI6IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgcmV0dXJuIEZwUG93KHRoaXMsIG51bSwgcG93ZXIpO1xuICB9XG4gIGRpdihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyAqIGludmVydChyaHMsIHRoaXMuT1JERVIpLCB0aGlzLk9SREVSKTtcbiAgfVxuXG4gIC8vIFNhbWUgYXMgYWJvdmUsIGJ1dCBkb2Vzbid0IG5vcm1hbGl6ZVxuICBzcXJOKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG51bSAqIG51bTtcbiAgfVxuICBhZGROKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgKyByaHM7XG4gIH1cbiAgc3ViTihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzIC0gcmhzO1xuICB9XG4gIG11bE4obGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyAqIHJocztcbiAgfVxuXG4gIGludihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBpbnZlcnQobnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBzcXJ0KG51bTogYmlnaW50KTogYmlnaW50IHtcbiAgICAvLyBDYWNoaW5nIF9zcXJ0IHNwZWVkcyB1cCBzcXJ0OW1vZDE2IGJ5IDV4IGFuZCB0b25uZWxpLXNoYW5rcyBieSAxMCVcbiAgICBpZiAoIXRoaXMuX3NxcnQpIHRoaXMuX3NxcnQgPSBGcFNxcnQodGhpcy5PUkRFUik7XG4gICAgcmV0dXJuIHRoaXMuX3NxcnQodGhpcywgbnVtKTtcbiAgfVxuICB0b0J5dGVzKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNMRSA/IG51bWJlclRvQnl0ZXNMRShudW0sIHRoaXMuQllURVMpIDogbnVtYmVyVG9CeXRlc0JFKG51bSwgdGhpcy5CWVRFUyk7XG4gIH1cbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBza2lwVmFsaWRhdGlvbiA9IGZhbHNlKSB7XG4gICAgYWJ5dGVzKGJ5dGVzKTtcbiAgICBjb25zdCB7IF9sZW5ndGhzOiBhbGxvd2VkTGVuZ3RocywgQllURVMsIGlzTEUsIE9SREVSLCBfbW9kOiBtb2RGcm9tQnl0ZXMgfSA9IHRoaXM7XG4gICAgaWYgKGFsbG93ZWRMZW5ndGhzKSB7XG4gICAgICBpZiAoIWFsbG93ZWRMZW5ndGhzLmluY2x1ZGVzKGJ5dGVzLmxlbmd0aCkgfHwgYnl0ZXMubGVuZ3RoID4gQllURVMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdGaWVsZC5mcm9tQnl0ZXM6IGV4cGVjdGVkICcgKyBhbGxvd2VkTGVuZ3RocyArICcgYnl0ZXMsIGdvdCAnICsgYnl0ZXMubGVuZ3RoXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBwYWRkZWQgPSBuZXcgVWludDhBcnJheShCWVRFUyk7XG4gICAgICAvLyBpc0xFIGFkZCAwIHRvIHJpZ2h0LCAhaXNMRSB0byB0aGUgbGVmdC5cbiAgICAgIHBhZGRlZC5zZXQoYnl0ZXMsIGlzTEUgPyAwIDogcGFkZGVkLmxlbmd0aCAtIGJ5dGVzLmxlbmd0aCk7XG4gICAgICBieXRlcyA9IHBhZGRlZDtcbiAgICB9XG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAhPT0gQllURVMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkLmZyb21CeXRlczogZXhwZWN0ZWQgJyArIEJZVEVTICsgJyBieXRlcywgZ290ICcgKyBieXRlcy5sZW5ndGgpO1xuICAgIGxldCBzY2FsYXIgPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGJ5dGVzKSA6IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7XG4gICAgaWYgKG1vZEZyb21CeXRlcykgc2NhbGFyID0gbW9kKHNjYWxhciwgT1JERVIpO1xuICAgIGlmICghc2tpcFZhbGlkYXRpb24pXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZChzY2FsYXIpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQgZWxlbWVudDogb3V0c2lkZSBvZiByYW5nZSAwLi5PUkRFUicpO1xuICAgIC8vIE5PVEU6IHdlIGRvbid0IHZhbGlkYXRlIHNjYWxhciBoZXJlLCBwbGVhc2UgdXNlIGlzVmFsaWQuIFRoaXMgZG9uZSBzdWNoIHdheSBiZWNhdXNlIHNvbWVcbiAgICAvLyBwcm90b2NvbCBtYXkgYWxsb3cgbm9uLXJlZHVjZWQgc2NhbGFyIHRoYXQgcmVkdWNlZCBsYXRlciBvciBjaGFuZ2VkIHNvbWUgb3RoZXIgd2F5LlxuICAgIHJldHVybiBzY2FsYXI7XG4gIH1cbiAgLy8gVE9ETzogd2UgZG9uJ3QgbmVlZCBpdCBoZXJlLCBtb3ZlIG91dCB0byBzZXBhcmF0ZSBmblxuICBpbnZlcnRCYXRjaChsc3Q6IGJpZ2ludFtdKTogYmlnaW50W10ge1xuICAgIHJldHVybiBGcEludmVydEJhdGNoKHRoaXMsIGxzdCk7XG4gIH1cbiAgLy8gV2UgY2FuJ3QgbW92ZSB0aGlzIG91dCBiZWNhdXNlIEZwNiwgRnAxMiBpbXBsZW1lbnQgaXRcbiAgLy8gYW5kIGl0J3MgdW5jbGVhciB3aGF0IHRvIHJldHVybiBpbiB0aGVyZS5cbiAgY21vdihhOiBiaWdpbnQsIGI6IGJpZ2ludCwgY29uZGl0aW9uOiBib29sZWFuKSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbiA/IGIgOiBhO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZpbml0ZSBmaWVsZC4gTWFqb3IgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uczpcbiAqICogMS4gRGVub3JtYWxpemVkIG9wZXJhdGlvbnMgbGlrZSBtdWxOIGluc3RlYWQgb2YgbXVsLlxuICogKiAyLiBJZGVudGljYWwgb2JqZWN0IHNoYXBlOiBuZXZlciBhZGQgb3IgcmVtb3ZlIGtleXMuXG4gKiAqIDMuIGBPYmplY3QuZnJlZXplYC5cbiAqIEZyYWdpbGU6IGFsd2F5cyBydW4gYSBiZW5jaG1hcmsgb24gYSBjaGFuZ2UuXG4gKiBTZWN1cml0eSBub3RlOiBvcGVyYXRpb25zIGRvbid0IGNoZWNrICdpc1ZhbGlkJyBmb3IgYWxsIGVsZW1lbnRzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLFxuICogaXQgaXMgY2FsbGVyIHJlc3BvbnNpYmlsaXR5IHRvIGNoZWNrIHRoaXMuXG4gKiBUaGlzIGlzIGxvdy1sZXZlbCBjb2RlLCBwbGVhc2UgbWFrZSBzdXJlIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICpcbiAqIE5vdGUgYWJvdXQgZmllbGQgcHJvcGVydGllczpcbiAqICogQ0hBUkFDVEVSSVNUSUMgcCA9IHByaW1lIG51bWJlciwgbnVtYmVyIG9mIGVsZW1lbnRzIGluIG1haW4gc3ViZ3JvdXAuXG4gKiAqIE9SREVSIHEgPSBzaW1pbGFyIHRvIGNvZmFjdG9yIGluIGN1cnZlcywgbWF5IGJlIGNvbXBvc2l0ZSBgcSA9IHBebWAuXG4gKlxuICogQHBhcmFtIE9SREVSIGZpZWxkIG9yZGVyLCBwcm9iYWJseSBwcmltZSwgb3IgY291bGQgYmUgY29tcG9zaXRlXG4gKiBAcGFyYW0gYml0TGVuIGhvdyBtYW55IGJpdHMgdGhlIGZpZWxkIGNvbnN1bWVzXG4gKiBAcGFyYW0gaXNMRSAoZGVmYXVsdDogZmFsc2UpIGlmIGVuY29kaW5nIC8gZGVjb2Rpbmcgc2hvdWxkIGJlIGluIGxpdHRsZS1lbmRpYW5cbiAqIEBwYXJhbSByZWRlZiBvcHRpb25hbCBmYXN0ZXIgcmVkZWZpbml0aW9ucyBvZiBzcXJ0IGFuZCBvdGhlciBtZXRob2RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWVsZChPUkRFUjogYmlnaW50LCBvcHRzOiBGaWVsZE9wdHMgPSB7fSk6IFJlYWRvbmx5PEZwRmllbGQ+IHtcbiAgcmV0dXJuIG5ldyBfRmllbGQoT1JERVIsIG9wdHMpO1xufVxuXG4vLyBHZW5lcmljIHJhbmRvbSBzY2FsYXIsIHdlIGNhbiBkbyBzYW1lIGZvciBvdGhlciBmaWVsZHMgaWYgdmlhIEZwMi5tdWwoRnAyLk9ORSwgRnAyLnJhbmRvbSk/XG4vLyBUaGlzIGFsbG93cyB1bnNhZmUgbWV0aG9kcyBsaWtlIGlnbm9yZSBiaWFzIG9yIHplcm8uIFRoZXNlIHVuc2FmZSwgYnV0IG9mdGVuIHVzZWQgaW4gZGlmZmVyZW50IHByb3RvY29scyAoaWYgZGV0ZXJtaW5pc3RpYyBSTkcpLlxuLy8gd2hpY2ggbWVhbiB3ZSBjYW5ub3QgZm9yY2UgdGhpcyB2aWEgb3B0cy5cbi8vIE5vdCBzdXJlIHdoYXQgdG8gZG8gd2l0aCByYW5kb21CeXRlcywgd2UgY2FuIGFjY2VwdCBpdCBpbnNpZGUgb3B0cyBpZiB3YW50ZWQuXG4vLyBQcm9iYWJseSBuZWVkIHRvIGV4cG9ydCBnZXRNaW5IYXNoTGVuZ3RoIHNvbWV3aGVyZT9cbi8vIHJhbmRvbShieXRlcz86IFVpbnQ4QXJyYXksIHVuc2FmZUFsbG93WmVybyA9IGZhbHNlLCB1bnNhZmVBbGxvd0JpYXMgPSBmYWxzZSkge1xuLy8gICBjb25zdCBMRU4gPSAhdW5zYWZlQWxsb3dCaWFzID8gZ2V0TWluSGFzaExlbmd0aChPUkRFUikgOiBCWVRFUztcbi8vICAgaWYgKGJ5dGVzID09PSB1bmRlZmluZWQpIGJ5dGVzID0gcmFuZG9tQnl0ZXMoTEVOKTsgLy8gX29wdHMucmFuZG9tQnl0ZXM/XG4vLyAgIGNvbnN0IG51bSA9IGlzTEUgPyBieXRlc1RvTnVtYmVyTEUoYnl0ZXMpIDogYnl0ZXNUb051bWJlckJFKGJ5dGVzKTtcbi8vICAgLy8gYG1vZCh4LCAxMSlgIGNhbiBzb21ldGltZXMgcHJvZHVjZSAwLiBgbW9kKHgsIDEwKSArIDFgIGlzIHRoZSBzYW1lLCBidXQgbm8gMFxuLy8gICBjb25zdCByZWR1Y2VkID0gdW5zYWZlQWxsb3daZXJvID8gbW9kKG51bSwgT1JERVIpIDogbW9kKG51bSwgT1JERVIgLSBfMW4pICsgXzFuO1xuLy8gICByZXR1cm4gcmVkdWNlZDtcbi8vIH0sXG5cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnRPZGQ8VD4oRnA6IElGaWVsZDxUPiwgZWxtOiBUKTogVCB7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3QgaGF2ZSBpc09kZFwiKTtcbiAgY29uc3Qgcm9vdCA9IEZwLnNxcnQoZWxtKTtcbiAgcmV0dXJuIEZwLmlzT2RkKHJvb3QpID8gcm9vdCA6IEZwLm5lZyhyb290KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZwU3FydEV2ZW48VD4oRnA6IElGaWVsZDxUPiwgZWxtOiBUKTogVCB7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3QgaGF2ZSBpc09kZFwiKTtcbiAgY29uc3Qgcm9vdCA9IEZwLnNxcnQoZWxtKTtcbiAgcmV0dXJuIEZwLmlzT2RkKHJvb3QpID8gRnAubmVnKHJvb3QpIDogcm9vdDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRvdGFsIG51bWJlciBvZiBieXRlcyBjb25zdW1lZCBieSB0aGUgZmllbGQgZWxlbWVudC5cbiAqIEZvciBleGFtcGxlLCAzMiBieXRlcyBmb3IgdXN1YWwgMjU2LWJpdCB3ZWllcnN0cmFzcyBjdXJ2ZS5cbiAqIEBwYXJhbSBmaWVsZE9yZGVyIG51bWJlciBvZiBmaWVsZCBlbGVtZW50cywgdXN1YWxseSBDVVJWRS5uXG4gKiBAcmV0dXJucyBieXRlIGxlbmd0aCBvZiBmaWVsZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyOiBiaWdpbnQpOiBudW1iZXIge1xuICBpZiAodHlwZW9mIGZpZWxkT3JkZXIgIT09ICdiaWdpbnQnKSB0aHJvdyBuZXcgRXJyb3IoJ2ZpZWxkIG9yZGVyIG11c3QgYmUgYmlnaW50Jyk7XG4gIGNvbnN0IGJpdExlbmd0aCA9IGZpZWxkT3JkZXIudG9TdHJpbmcoMikubGVuZ3RoO1xuICByZXR1cm4gTWF0aC5jZWlsKGJpdExlbmd0aCAvIDgpO1xufVxuXG4vKipcbiAqIFJldHVybnMgbWluaW1hbCBhbW91bnQgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgc2FmZWx5IHJlZHVjZWRcbiAqIGJ5IGZpZWxkIG9yZGVyLlxuICogU2hvdWxkIGJlIDJeLTEyOCBmb3IgMTI4LWJpdCBjdXJ2ZSBzdWNoIGFzIFAyNTYuXG4gKiBAcGFyYW0gZmllbGRPcmRlciBudW1iZXIgb2YgZmllbGQgZWxlbWVudHMsIHVzdWFsbHkgQ1VSVkUublxuICogQHJldHVybnMgYnl0ZSBsZW5ndGggb2YgdGFyZ2V0IGhhc2hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1pbkhhc2hMZW5ndGgoZmllbGRPcmRlcjogYmlnaW50KTogbnVtYmVyIHtcbiAgY29uc3QgbGVuZ3RoID0gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyKTtcbiAgcmV0dXJuIGxlbmd0aCArIE1hdGguY2VpbChsZW5ndGggLyAyKTtcbn1cblxuLyoqXG4gKiBcIkNvbnN0YW50LXRpbWVcIiBwcml2YXRlIGtleSBnZW5lcmF0aW9uIHV0aWxpdHkuXG4gKiBDYW4gdGFrZSAobiArIG4vMikgb3IgbW9yZSBieXRlcyBvZiB1bmlmb3JtIGlucHV0IGUuZy4gZnJvbSBDU1BSTkcgb3IgS0RGXG4gKiBhbmQgY29udmVydCB0aGVtIGludG8gcHJpdmF0ZSBzY2FsYXIsIHdpdGggdGhlIG1vZHVsbyBiaWFzIGJlaW5nIG5lZ2xpZ2libGUuXG4gKiBOZWVkcyBhdCBsZWFzdCA0OCBieXRlcyBvZiBpbnB1dCBmb3IgMzItYnl0ZSBwcml2YXRlIGtleS5cbiAqIGh0dHBzOi8vcmVzZWFyY2gua3VkZWxza2lzZWN1cml0eS5jb20vMjAyMC8wNy8yOC90aGUtZGVmaW5pdGl2ZS1ndWlkZS10by1tb2R1bG8tYmlhcy1hbmQtaG93LXRvLWF2b2lkLWl0L1xuICogRklQUyAxODYtNSwgQS4yIGh0dHBzOi8vY3NyYy5uaXN0Lmdvdi9wdWJsaWNhdGlvbnMvZGV0YWlsL2ZpcHMvMTg2LzUvZmluYWxcbiAqIFJGQyA5MzgwLCBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTVcbiAqIEBwYXJhbSBoYXNoIGhhc2ggb3V0cHV0IGZyb20gU0hBMyBvciBhIHNpbWlsYXIgZnVuY3Rpb25cbiAqIEBwYXJhbSBncm91cE9yZGVyIHNpemUgb2Ygc3ViZ3JvdXAgLSAoZS5nLiBzZWNwMjU2azEuUG9pbnQuRm4uT1JERVIpXG4gKiBAcGFyYW0gaXNMRSBpbnRlcnByZXQgaGFzaCBieXRlcyBhcyBMRSBudW1cbiAqIEByZXR1cm5zIHZhbGlkIHByaXZhdGUgc2NhbGFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBIYXNoVG9GaWVsZChrZXk6IFVpbnQ4QXJyYXksIGZpZWxkT3JkZXI6IGJpZ2ludCwgaXNMRSA9IGZhbHNlKTogVWludDhBcnJheSB7XG4gIGFieXRlcyhrZXkpO1xuICBjb25zdCBsZW4gPSBrZXkubGVuZ3RoO1xuICBjb25zdCBmaWVsZExlbiA9IGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcik7XG4gIGNvbnN0IG1pbkxlbiA9IGdldE1pbkhhc2hMZW5ndGgoZmllbGRPcmRlcik7XG4gIC8vIE5vIHNtYWxsIG51bWJlcnM6IG5lZWQgdG8gdW5kZXJzdGFuZCBiaWFzIHN0b3J5LiBObyBodWdlIG51bWJlcnM6IGVhc2llciB0byBkZXRlY3QgSlMgdGltaW5ncy5cbiAgaWYgKGxlbiA8IDE2IHx8IGxlbiA8IG1pbkxlbiB8fCBsZW4gPiAxMDI0KVxuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgJyArIG1pbkxlbiArICctMTAyNCBieXRlcyBvZiBpbnB1dCwgZ290ICcgKyBsZW4pO1xuICBjb25zdCBudW0gPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGtleSkgOiBieXRlc1RvTnVtYmVyQkUoa2V5KTtcbiAgLy8gYG1vZCh4LCAxMSlgIGNhbiBzb21ldGltZXMgcHJvZHVjZSAwLiBgbW9kKHgsIDEwKSArIDFgIGlzIHRoZSBzYW1lLCBidXQgbm8gMFxuICBjb25zdCByZWR1Y2VkID0gbW9kKG51bSwgZmllbGRPcmRlciAtIF8xbikgKyBfMW47XG4gIHJldHVybiBpc0xFID8gbnVtYmVyVG9CeXRlc0xFKHJlZHVjZWQsIGZpZWxkTGVuKSA6IG51bWJlclRvQnl0ZXNCRShyZWR1Y2VkLCBmaWVsZExlbik7XG59XG4iLCAiLyoqXG4gKiBTaG9ydCBXZWllcnN0cmFzcyBjdXJ2ZSBtZXRob2RzLiBUaGUgZm9ybXVsYSBpczogeVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGIuXG4gKlxuICogIyMjIERlc2lnbiByYXRpb25hbGUgZm9yIHR5cGVzXG4gKlxuICogKiBJbnRlcmFjdGlvbiBiZXR3ZWVuIGNsYXNzZXMgZnJvbSBkaWZmZXJlbnQgY3VydmVzIHNob3VsZCBmYWlsOlxuICogICBgazI1Ni5Qb2ludC5CQVNFLmFkZChwMjU2LlBvaW50LkJBU0UpYFxuICogKiBGb3IgdGhpcyBwdXJwb3NlIHdlIHdhbnQgdG8gdXNlIGBpbnN0YW5jZW9mYCBvcGVyYXRvciwgd2hpY2ggaXMgZmFzdCBhbmQgd29ya3MgZHVyaW5nIHJ1bnRpbWVcbiAqICogRGlmZmVyZW50IGNhbGxzIG9mIGBjdXJ2ZSgpYCB3b3VsZCByZXR1cm4gZGlmZmVyZW50IGNsYXNzZXMgLVxuICogICBgY3VydmUocGFyYW1zKSAhPT0gY3VydmUocGFyYW1zKWA6IGlmIHNvbWVib2R5IGRlY2lkZWQgdG8gbW9ua2V5LXBhdGNoIHRoZWlyIGN1cnZlLFxuICogICBpdCB3b24ndCBhZmZlY3Qgb3RoZXJzXG4gKlxuICogVHlwZVNjcmlwdCBjYW4ndCBpbmZlciB0eXBlcyBmb3IgY2xhc3NlcyBjcmVhdGVkIGluc2lkZSBhIGZ1bmN0aW9uLiBDbGFzc2VzIGlzIG9uZSBpbnN0YW5jZVxuICogb2Ygbm9taW5hdGl2ZSB0eXBlcyBpbiBUeXBlU2NyaXB0IGFuZCBpbnRlcmZhY2VzIG9ubHkgY2hlY2sgZm9yIHNoYXBlLCBzbyBpdCdzIGhhcmQgdG8gY3JlYXRlXG4gKiB1bmlxdWUgdHlwZSBmb3IgZXZlcnkgZnVuY3Rpb24gY2FsbC5cbiAqXG4gKiBXZSBjYW4gdXNlIGdlbmVyaWMgdHlwZXMgdmlhIHNvbWUgcGFyYW0sIGxpa2UgY3VydmUgb3B0cywgYnV0IHRoYXQgd291bGQ6XG4gKiAgICAgMS4gRW5hYmxlIGludGVyYWN0aW9uIGJldHdlZW4gYGN1cnZlKHBhcmFtcylgIGFuZCBgY3VydmUocGFyYW1zKWAgKGN1cnZlcyBvZiBzYW1lIHBhcmFtcylcbiAqICAgICB3aGljaCBpcyBoYXJkIHRvIGRlYnVnLlxuICogICAgIDIuIFBhcmFtcyBjYW4gYmUgZ2VuZXJpYyBhbmQgd2UgY2FuJ3QgZW5mb3JjZSB0aGVtIHRvIGJlIGNvbnN0YW50IHZhbHVlOlxuICogICAgIGlmIHNvbWVib2R5IGNyZWF0ZXMgY3VydmUgZnJvbSBub24tY29uc3RhbnQgcGFyYW1zLFxuICogICAgIGl0IHdvdWxkIGJlIGFsbG93ZWQgdG8gaW50ZXJhY3Qgd2l0aCBvdGhlciBjdXJ2ZXMgd2l0aCBub24tY29uc3RhbnQgcGFyYW1zXG4gKlxuICogQHRvZG8gaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svcmVsZWFzZS1ub3Rlcy90eXBlc2NyaXB0LTItNy5odG1sI3VuaXF1ZS1zeW1ib2xcbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgaG1hYyBhcyBub2JsZUhtYWMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2htYWMuanMnO1xuaW1wb3J0IHsgYWhhc2ggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7XG4gIGFib29sLFxuICBhYnl0ZXMsXG4gIGFJblJhbmdlLFxuICBiaXRMZW4sXG4gIGJpdE1hc2ssXG4gIGJ5dGVzVG9IZXgsXG4gIGJ5dGVzVG9OdW1iZXJCRSxcbiAgY29uY2F0Qnl0ZXMsXG4gIGNyZWF0ZUhtYWNEcmJnLFxuICBoZXhUb0J5dGVzLFxuICBpc0J5dGVzLFxuICBtZW1vaXplZCxcbiAgbnVtYmVyVG9IZXhVbnBhZGRlZCxcbiAgdmFsaWRhdGVPYmplY3QsXG4gIHJhbmRvbUJ5dGVzIGFzIHdjUmFuZG9tQnl0ZXMsXG4gIHR5cGUgQ0hhc2gsXG4gIHR5cGUgU2lnbmVyLFxufSBmcm9tICcuLi91dGlscy50cyc7XG5pbXBvcnQge1xuICBjcmVhdGVDdXJ2ZUZpZWxkcyxcbiAgY3JlYXRlS2V5Z2VuLFxuICBtdWxFbmRvVW5zYWZlLFxuICBuZWdhdGVDdCxcbiAgbm9ybWFsaXplWixcbiAgd05BRixcbiAgdHlwZSBBZmZpbmVQb2ludCxcbiAgdHlwZSBDdXJ2ZUxlbmd0aHMsXG4gIHR5cGUgQ3VydmVQb2ludCxcbiAgdHlwZSBDdXJ2ZVBvaW50Q29ucyxcbn0gZnJvbSAnLi9jdXJ2ZS50cyc7XG5pbXBvcnQge1xuICBGcEludmVydEJhdGNoLFxuICBnZXRNaW5IYXNoTGVuZ3RoLFxuICBtYXBIYXNoVG9GaWVsZCxcbiAgdmFsaWRhdGVGaWVsZCxcbiAgdHlwZSBJRmllbGQsXG59IGZyb20gJy4vbW9kdWxhci50cyc7XG5cbmV4cG9ydCB0eXBlIHsgQWZmaW5lUG9pbnQgfTtcblxudHlwZSBFbmRvQmFzaXMgPSBbW2JpZ2ludCwgYmlnaW50XSwgW2JpZ2ludCwgYmlnaW50XV07XG4vKipcbiAqIFdoZW4gV2VpZXJzdHJhc3MgY3VydmUgaGFzIGBhPTBgLCBpdCBiZWNvbWVzIEtvYmxpdHogY3VydmUuXG4gKiBLb2JsaXR6IGN1cnZlcyBhbGxvdyB1c2luZyAqKmVmZmljaWVudGx5LWNvbXB1dGFibGUgR0xWIGVuZG9tb3JwaGlzbSBcdTAzQzgqKi5cbiAqIEVuZG9tb3JwaGlzbSB1c2VzIDJ4IGxlc3MgUkFNLCBzcGVlZHMgdXAgcHJlY29tcHV0YXRpb24gYnkgMnggYW5kIEVDREggLyBrZXkgcmVjb3ZlcnkgYnkgMjAlLlxuICogRm9yIHByZWNvbXB1dGVkIHdOQUYgaXQgdHJhZGVzIG9mZiAxLzIgaW5pdCB0aW1lICYgMS8zIHJhbSBmb3IgMjAlIHBlcmYgaGl0LlxuICpcbiAqIEVuZG9tb3JwaGlzbSBjb25zaXN0cyBvZiBiZXRhLCBsYW1iZGEgYW5kIHNwbGl0U2NhbGFyOlxuICpcbiAqIDEuIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4IHRyYW5zZm9ybXMgYSBwb2ludDogYFAgPSAoeCwgeSkgXHUyMUE2IFx1MDNDOChQKSA9IChcdTAzQjJcdTAwQjd4IG1vZCBwLCB5KWBcbiAqIDIuIEdMViBzY2FsYXIgZGVjb21wb3NpdGlvbiB0cmFuc2Zvcm1zIGEgc2NhbGFyOiBgayBcdTIyNjEga1x1MjA4MSArIGtcdTIwODJcdTAwQjdcdTAzQkIgKG1vZCBuKWBcbiAqIDMuIFRoZW4gdGhlc2UgYXJlIGNvbWJpbmVkOiBga1x1MDBCN1AgPSBrXHUyMDgxXHUwMEI3UCArIGtcdTIwODJcdTAwQjdcdTAzQzgoUClgXG4gKiA0LiBUd28gMTI4LWJpdCBwb2ludC1ieS1zY2FsYXIgbXVsdGlwbGljYXRpb25zICsgb25lIHBvaW50IGFkZGl0aW9uIGlzIGZhc3RlciB0aGFuXG4gKiAgICBvbmUgMjU2LWJpdCBtdWx0aXBsaWNhdGlvbi5cbiAqXG4gKiB3aGVyZVxuICogKiBiZXRhOiBcdTAzQjIgXHUyMjA4IEZcdTIwOUEgd2l0aCBcdTAzQjJcdTAwQjMgPSAxLCBcdTAzQjIgXHUyMjYwIDFcbiAqICogbGFtYmRhOiBcdTAzQkIgXHUyMjA4IEZcdTIwOTkgd2l0aCBcdTAzQkJcdTAwQjMgPSAxLCBcdTAzQkIgXHUyMjYwIDFcbiAqICogc3BsaXRTY2FsYXIgZGVjb21wb3NlcyBrIFx1MjFBNiBrXHUyMDgxLCBrXHUyMDgyLCBieSB1c2luZyByZWR1Y2VkIGJhc2lzIHZlY3RvcnMuXG4gKiAgIEdhdXNzIGxhdHRpY2UgcmVkdWN0aW9uIGNhbGN1bGF0ZXMgdGhlbSBmcm9tIGluaXRpYWwgYmFzaXMgdmVjdG9ycyBgKG4sIDApLCAoLVx1MDNCQiwgMClgXG4gKlxuICogQ2hlY2sgb3V0IGB0ZXN0L21pc2MvZW5kb21vcnBoaXNtLmpzYCBhbmRcbiAqIFtnaXN0XShodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsbWlsbHIvZWI2NzA4MDY3OTNlODRkZjYyOGE3YzQzNGE4NzMwNjYpLlxuICovXG5leHBvcnQgdHlwZSBFbmRvbW9ycGhpc21PcHRzID0ge1xuICBiZXRhOiBiaWdpbnQ7XG4gIGJhc2lzZXM/OiBFbmRvQmFzaXM7XG4gIHNwbGl0U2NhbGFyPzogKGs6IGJpZ2ludCkgPT4geyBrMW5lZzogYm9vbGVhbjsgazE6IGJpZ2ludDsgazJuZWc6IGJvb2xlYW47IGsyOiBiaWdpbnQgfTtcbn07XG4vLyBXZSBjb25zdHJ1Y3QgYmFzaXMgaW4gc3VjaCB3YXkgdGhhdCBkZW4gaXMgYWx3YXlzIHBvc2l0aXZlIGFuZCBlcXVhbHMgbiwgYnV0IG51bSBzaWduIGRlcGVuZHMgb24gYmFzaXMgKG5vdCBvbiBzZWNyZXQgdmFsdWUpXG5jb25zdCBkaXZOZWFyZXN0ID0gKG51bTogYmlnaW50LCBkZW46IGJpZ2ludCkgPT4gKG51bSArIChudW0gPj0gMCA/IGRlbiA6IC1kZW4pIC8gXzJuKSAvIGRlbjtcblxuZXhwb3J0IHR5cGUgU2NhbGFyRW5kb1BhcnRzID0geyBrMW5lZzogYm9vbGVhbjsgazE6IGJpZ2ludDsgazJuZWc6IGJvb2xlYW47IGsyOiBiaWdpbnQgfTtcblxuLyoqXG4gKiBTcGxpdHMgc2NhbGFyIGZvciBHTFYgZW5kb21vcnBoaXNtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gX3NwbGl0RW5kb1NjYWxhcihrOiBiaWdpbnQsIGJhc2lzOiBFbmRvQmFzaXMsIG46IGJpZ2ludCk6IFNjYWxhckVuZG9QYXJ0cyB7XG4gIC8vIFNwbGl0IHNjYWxhciBpbnRvIHR3byBzdWNoIHRoYXQgcGFydCBpcyB+aGFsZiBiaXRzOiBgYWJzKHBhcnQpIDwgc3FydChOKWBcbiAgLy8gU2luY2UgcGFydCBjYW4gYmUgbmVnYXRpdmUsIHdlIG5lZWQgdG8gZG8gdGhpcyBvbiBwb2ludC5cbiAgLy8gVE9ETzogdmVyaWZ5U2NhbGFyIGZ1bmN0aW9uIHdoaWNoIGNvbnN1bWVzIGxhbWJkYVxuICBjb25zdCBbW2ExLCBiMV0sIFthMiwgYjJdXSA9IGJhc2lzO1xuICBjb25zdCBjMSA9IGRpdk5lYXJlc3QoYjIgKiBrLCBuKTtcbiAgY29uc3QgYzIgPSBkaXZOZWFyZXN0KC1iMSAqIGssIG4pO1xuICAvLyB8azF8L3xrMnwgaXMgPCBzcXJ0KE4pLCBidXQgY2FuIGJlIG5lZ2F0aXZlLlxuICAvLyBJZiB3ZSBkbyBgazEgbW9kIE5gLCB3ZSdsbCBnZXQgYmlnIHNjYWxhciAoYD4gc3FydChOKWApOiBzbywgd2UgZG8gY2hlYXBlciBuZWdhdGlvbiBpbnN0ZWFkLlxuICBsZXQgazEgPSBrIC0gYzEgKiBhMSAtIGMyICogYTI7XG4gIGxldCBrMiA9IC1jMSAqIGIxIC0gYzIgKiBiMjtcbiAgY29uc3QgazFuZWcgPSBrMSA8IF8wbjtcbiAgY29uc3QgazJuZWcgPSBrMiA8IF8wbjtcbiAgaWYgKGsxbmVnKSBrMSA9IC1rMTtcbiAgaWYgKGsybmVnKSBrMiA9IC1rMjtcbiAgLy8gRG91YmxlIGNoZWNrIHRoYXQgcmVzdWx0aW5nIHNjYWxhciBsZXNzIHRoYW4gaGFsZiBiaXRzIG9mIE46IG90aGVyd2lzZSB3TkFGIHdpbGwgZmFpbC5cbiAgLy8gVGhpcyBzaG91bGQgb25seSBoYXBwZW4gb24gd3JvbmcgYmFzaXNlcy4gQWxzbywgbWF0aCBpbnNpZGUgaXMgdG9vIGNvbXBsZXggYW5kIEkgZG9uJ3QgdHJ1c3QgaXQuXG4gIGNvbnN0IE1BWF9OVU0gPSBiaXRNYXNrKE1hdGguY2VpbChiaXRMZW4obikgLyAyKSkgKyBfMW47IC8vIEhhbGYgYml0cyBvZiBOXG4gIGlmIChrMSA8IF8wbiB8fCBrMSA+PSBNQVhfTlVNIHx8IGsyIDwgXzBuIHx8IGsyID49IE1BWF9OVU0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NwbGl0U2NhbGFyIChlbmRvbW9ycGhpc20pOiBmYWlsZWQsIGs9JyArIGspO1xuICB9XG4gIHJldHVybiB7IGsxbmVnLCBrMSwgazJuZWcsIGsyIH07XG59XG5cbi8qKlxuICogT3B0aW9uIHRvIGVuYWJsZSBoZWRnZWQgc2lnbmF0dXJlcyB3aXRoIGltcHJvdmVkIHNlY3VyaXR5LlxuICpcbiAqICogUmFuZG9tbHkgZ2VuZXJhdGVkIGsgaXMgYmFkLCBiZWNhdXNlIGJyb2tlbiBDU1BSTkcgd291bGQgbGVhayBwcml2YXRlIGtleXMuXG4gKiAqIERldGVybWluaXN0aWMgayAoUkZDNjk3OSkgaXMgYmV0dGVyOyBidXQgaXMgc3VzcGVjdGlibGUgdG8gZmF1bHQgYXR0YWNrcy5cbiAqXG4gKiBXZSBhbGxvdyB1c2luZyB0ZWNobmlxdWUgZGVzY3JpYmVkIGluIFJGQzY5NzkgMy42OiBhZGRpdGlvbmFsIGsnLCBhLmsuYS4gYWRkaW5nIHJhbmRvbW5lc3NcbiAqIHRvIGRldGVybWluaXN0aWMgc2lnLiBJZiBDU1BSTkcgaXMgYnJva2VuICYgcmFuZG9tbmVzcyBpcyB3ZWFrLCBpdCB3b3VsZCBTVElMTCBiZSBhcyBzZWN1cmVcbiAqIGFzIG9yZGluYXJ5IHNpZyB3aXRob3V0IEV4dHJhRW50cm9weS5cbiAqXG4gKiAqIGB0cnVlYCBtZWFucyBcImZldGNoIGRhdGEsIGZyb20gQ1NQUk5HLCBpbmNvcnBvcmF0ZSBpdCBpbnRvIGsgZ2VuZXJhdGlvblwiXG4gKiAqIGBmYWxzZWAgbWVhbnMgXCJkaXNhYmxlIGV4dHJhIGVudHJvcHksIHVzZSBwdXJlbHkgZGV0ZXJtaW5pc3RpYyBrXCJcbiAqICogYFVpbnQ4QXJyYXlgIHBhc3NlZCBtZWFucyBcImluY29ycG9yYXRlIGZvbGxvd2luZyBkYXRhIGludG8gayBnZW5lcmF0aW9uXCJcbiAqXG4gKiBodHRwczovL3BhdWxtaWxsci5jb20vcG9zdHMvZGV0ZXJtaW5pc3RpYy1zaWduYXR1cmVzL1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQUV4dHJhRW50cm9weSA9IGJvb2xlYW4gfCBVaW50OEFycmF5O1xuLyoqXG4gKiAtIGBjb21wYWN0YCBpcyB0aGUgZGVmYXVsdCBmb3JtYXRcbiAqIC0gYHJlY292ZXJlZGAgaXMgdGhlIHNhbWUgYXMgY29tcGFjdCwgYnV0IHdpdGggYW4gZXh0cmEgYnl0ZSBpbmRpY2F0aW5nIHJlY292ZXJ5IGJ5dGVcbiAqIC0gYGRlcmAgaXMgQVNOLjEgREVSIGVuY29kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gJ2NvbXBhY3QnIHwgJ3JlY292ZXJlZCcgfCAnZGVyJztcbi8qKlxuICogLSBgcHJlaGFzaGA6IChkZWZhdWx0OiB0cnVlKSBpbmRpY2F0ZXMgd2hldGhlciB0byBkbyBzaGEyNTYobWVzc2FnZSkuXG4gKiAgIFdoZW4gYSBjdXN0b20gaGFzaCBpcyB1c2VkLCBpdCBtdXN0IGJlIHNldCB0byBgZmFsc2VgLlxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVJlY292ZXJPcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbn07XG4vKipcbiAqIC0gYHByZWhhc2hgOiAoZGVmYXVsdDogdHJ1ZSkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gZG8gc2hhMjU2KG1lc3NhZ2UpLlxuICogICBXaGVuIGEgY3VzdG9tIGhhc2ggaXMgdXNlZCwgaXQgbXVzdCBiZSBzZXQgdG8gYGZhbHNlYC5cbiAqIC0gYGxvd1NgOiAoZGVmYXVsdDogdHJ1ZSkgcHJvaGliaXRzIHNpZ25hdHVyZXMgd2hpY2ggaGF2ZSAoc2lnLnMgPj0gQ1VSVkUubi8ybikuXG4gKiAgIENvbXBhdGlibGUgd2l0aCBCVEMvRVRILiBTZXR0aW5nIGBsb3dTOiBmYWxzZWAgYWxsb3dzIHRvIGNyZWF0ZSBtYWxsZWFibGUgc2lnbmF0dXJlcyxcbiAqICAgd2hpY2ggaXMgZGVmYXVsdCBvcGVuc3NsIGJlaGF2aW9yLlxuICogICBOb24tbWFsbGVhYmxlIHNpZ25hdHVyZXMgY2FuIHN0aWxsIGJlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCBpbiBvcGVuc3NsLlxuICogLSBgZm9ybWF0YDogKGRlZmF1bHQ6ICdjb21wYWN0JykgJ2NvbXBhY3QnIG9yICdyZWNvdmVyZWQnIHdpdGggcmVjb3ZlcnkgYnl0ZVxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVZlcmlmeU9wdHMgPSB7XG4gIHByZWhhc2g/OiBib29sZWFuO1xuICBsb3dTPzogYm9vbGVhbjtcbiAgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQ7XG59O1xuLyoqXG4gKiAtIGBwcmVoYXNoYDogKGRlZmF1bHQ6IHRydWUpIGluZGljYXRlcyB3aGV0aGVyIHRvIGRvIHNoYTI1NihtZXNzYWdlKS5cbiAqICAgV2hlbiBhIGN1c3RvbSBoYXNoIGlzIHVzZWQsIGl0IG11c3QgYmUgc2V0IHRvIGBmYWxzZWAuXG4gKiAtIGBsb3dTYDogKGRlZmF1bHQ6IHRydWUpIHByb2hpYml0cyBzaWduYXR1cmVzIHdoaWNoIGhhdmUgKHNpZy5zID49IENVUlZFLm4vMm4pLlxuICogICBDb21wYXRpYmxlIHdpdGggQlRDL0VUSC4gU2V0dGluZyBgbG93UzogZmFsc2VgIGFsbG93cyB0byBjcmVhdGUgbWFsbGVhYmxlIHNpZ25hdHVyZXMsXG4gKiAgIHdoaWNoIGlzIGRlZmF1bHQgb3BlbnNzbCBiZWhhdmlvci5cbiAqICAgTm9uLW1hbGxlYWJsZSBzaWduYXR1cmVzIGNhbiBzdGlsbCBiZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgaW4gb3BlbnNzbC5cbiAqIC0gYGZvcm1hdGA6IChkZWZhdWx0OiAnY29tcGFjdCcpICdjb21wYWN0JyBvciAncmVjb3ZlcmVkJyB3aXRoIHJlY292ZXJ5IGJ5dGVcbiAqIC0gYGV4dHJhRW50cm9weWA6IChkZWZhdWx0OiBmYWxzZSkgY3JlYXRlcyBzaWdzIHdpdGggaW5jcmVhc2VkIHNlY3VyaXR5LCBzZWUge0BsaW5rIEVDRFNBRXh0cmFFbnRyb3B5fVxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25PcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbiAgbG93Uz86IGJvb2xlYW47XG4gIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xuICBleHRyYUVudHJvcHk/OiBFQ0RTQUV4dHJhRW50cm9weTtcbn07XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdDogc3RyaW5nKTogRUNEU0FTaWduYXR1cmVGb3JtYXQge1xuICBpZiAoIVsnY29tcGFjdCcsICdyZWNvdmVyZWQnLCAnZGVyJ10uaW5jbHVkZXMoZm9ybWF0KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NpZ25hdHVyZSBmb3JtYXQgbXVzdCBiZSBcImNvbXBhY3RcIiwgXCJyZWNvdmVyZWRcIiwgb3IgXCJkZXJcIicpO1xuICByZXR1cm4gZm9ybWF0IGFzIEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVNpZ09wdHM8VCBleHRlbmRzIEVDRFNBU2lnbk9wdHMsIEQgZXh0ZW5kcyBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPj4oXG4gIG9wdHM6IFQsXG4gIGRlZjogRFxuKTogUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz4ge1xuICBjb25zdCBvcHRzbjogRUNEU0FTaWduT3B0cyA9IHt9O1xuICBmb3IgKGxldCBvcHROYW1lIG9mIE9iamVjdC5rZXlzKGRlZikpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgb3B0c25bb3B0TmFtZV0gPSBvcHRzW29wdE5hbWVdID09PSB1bmRlZmluZWQgPyBkZWZbb3B0TmFtZV0gOiBvcHRzW29wdE5hbWVdO1xuICB9XG4gIGFib29sKG9wdHNuLmxvd1MhLCAnbG93UycpO1xuICBhYm9vbChvcHRzbi5wcmVoYXNoISwgJ3ByZWhhc2gnKTtcbiAgaWYgKG9wdHNuLmZvcm1hdCAhPT0gdW5kZWZpbmVkKSB2YWxpZGF0ZVNpZ0Zvcm1hdChvcHRzbi5mb3JtYXQpO1xuICByZXR1cm4gb3B0c24gYXMgUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz47XG59XG5cbi8qKiBJbnN0YW5jZSBtZXRob2RzIGZvciAzRCBYWVogcHJvamVjdGl2ZSBwb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIFdlaWVyc3RyYXNzUG9pbnQ8VD4gZXh0ZW5kcyBDdXJ2ZVBvaW50PFQsIFdlaWVyc3RyYXNzUG9pbnQ8VD4+IHtcbiAgLyoqIHByb2plY3RpdmUgWCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBhZmZpbmUgeC4gKi9cbiAgcmVhZG9ubHkgWDogVDtcbiAgLyoqIHByb2plY3RpdmUgWSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBhZmZpbmUgeS4gKi9cbiAgcmVhZG9ubHkgWTogVDtcbiAgLyoqIHByb2plY3RpdmUgeiBjb29yZGluYXRlICovXG4gIHJlYWRvbmx5IFo6IFQ7XG4gIC8qKiBhZmZpbmUgeCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIFguICovXG4gIGdldCB4KCk6IFQ7XG4gIC8qKiBhZmZpbmUgeSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIFkuICovXG4gIGdldCB5KCk6IFQ7XG4gIC8qKiBFbmNvZGVzIHBvaW50IHVzaW5nIElFRUUgUDEzNjMgKERFUikgZW5jb2RpbmcuIEZpcnN0IGJ5dGUgaXMgMi8zLzQuIERlZmF1bHQgPSBpc0NvbXByZXNzZWQuICovXG4gIHRvQnl0ZXMoaXNDb21wcmVzc2VkPzogYm9vbGVhbik6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pOiBzdHJpbmc7XG59XG5cbi8qKiBTdGF0aWMgbWV0aG9kcyBmb3IgM0QgWFlaIHByb2plY3RpdmUgcG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBXZWllcnN0cmFzc1BvaW50Q29uczxUPiBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFdlaWVyc3RyYXNzUG9pbnQ8VD4+IHtcbiAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gIG5ldyAoWDogVCwgWTogVCwgWjogVCk6IFdlaWVyc3RyYXNzUG9pbnQ8VD47XG4gIENVUlZFKCk6IFdlaWVyc3RyYXNzT3B0czxUPjtcbn1cblxuLyoqXG4gKiBXZWllcnN0cmFzcyBjdXJ2ZSBvcHRpb25zLlxuICpcbiAqICogcDogcHJpbWUgY2hhcmFjdGVyaXN0aWMgKG9yZGVyKSBvZiBmaW5pdGUgZmllbGQsIGluIHdoaWNoIGFyaXRobWV0aWNzIGlzIGRvbmVcbiAqICogbjogb3JkZXIgb2YgcHJpbWUgc3ViZ3JvdXAgYS5rLmEgdG90YWwgYW1vdW50IG9mIHZhbGlkIGN1cnZlIHBvaW50c1xuICogKiBoOiBjb2ZhY3RvciwgdXN1YWxseSAxLiBoKm4gaXMgZ3JvdXAgb3JkZXI7IG4gaXMgc3ViZ3JvdXAgb3JkZXJcbiAqICogYTogZm9ybXVsYSBwYXJhbSwgbXVzdCBiZSBpbiBmaWVsZCBvZiBwXG4gKiAqIGI6IGZvcm11bGEgcGFyYW0sIG11c3QgYmUgaW4gZmllbGQgb2YgcFxuICogKiBHeDogeCBjb29yZGluYXRlIG9mIGdlbmVyYXRvciBwb2ludCBhLmsuYS4gYmFzZSBwb2ludFxuICogKiBHeTogeSBjb29yZGluYXRlIG9mIGdlbmVyYXRvciBwb2ludFxuICovXG5leHBvcnQgdHlwZSBXZWllcnN0cmFzc09wdHM8VD4gPSBSZWFkb25seTx7XG4gIHA6IGJpZ2ludDtcbiAgbjogYmlnaW50O1xuICBoOiBiaWdpbnQ7XG4gIGE6IFQ7XG4gIGI6IFQ7XG4gIEd4OiBUO1xuICBHeTogVDtcbn0+O1xuXG4vLyBXaGVuIGEgY29mYWN0b3IgIT0gMSwgdGhlcmUgY2FuIGJlIGFuIGVmZmVjdGl2ZSBtZXRob2RzIHRvOlxuLy8gMS4gRGV0ZXJtaW5lIHdoZXRoZXIgYSBwb2ludCBpcyB0b3JzaW9uLWZyZWVcbi8vIDIuIENsZWFyIHRvcnNpb24gY29tcG9uZW50XG5leHBvcnQgdHlwZSBXZWllcnN0cmFzc0V4dHJhT3B0czxUPiA9IFBhcnRpYWw8e1xuICBGcDogSUZpZWxkPFQ+O1xuICBGbjogSUZpZWxkPGJpZ2ludD47XG4gIGFsbG93SW5maW5pdHlQb2ludDogYm9vbGVhbjtcbiAgZW5kbzogRW5kb21vcnBoaXNtT3B0cztcbiAgaXNUb3JzaW9uRnJlZTogKGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LCBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPikgPT4gYm9vbGVhbjtcbiAgY2xlYXJDb2ZhY3RvcjogKGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LCBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPikgPT4gV2VpZXJzdHJhc3NQb2ludDxUPjtcbiAgZnJvbUJ5dGVzOiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IEFmZmluZVBvaW50PFQ+O1xuICB0b0J5dGVzOiAoXG4gICAgYzogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4sXG4gICAgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4sXG4gICAgaXNDb21wcmVzc2VkOiBib29sZWFuXG4gICkgPT4gVWludDhBcnJheTtcbn0+O1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIEVDRFNBIHNpZ25hdHVyZXMgb3ZlciBhIFdlaWVyc3RyYXNzIGN1cnZlLlxuICpcbiAqICogbG93UzogKGRlZmF1bHQ6IHRydWUpIHdoZXRoZXIgcHJvZHVjZWQgLyB2ZXJpZmllZCBzaWduYXR1cmVzIG9jY3VweSBsb3cgaGFsZiBvZiBlY2RzYU9wdHMucC4gUHJldmVudHMgbWFsbGVhYmlsaXR5LlxuICogKiBobWFjOiAoZGVmYXVsdDogbm9ibGUtaGFzaGVzIGhtYWMpIGZ1bmN0aW9uLCB3b3VsZCBiZSB1c2VkIHRvIGluaXQgaG1hYy1kcmJnIGZvciBrIGdlbmVyYXRpb24uXG4gKiAqIHJhbmRvbUJ5dGVzOiAoZGVmYXVsdDogd2ViY3J5cHRvIG9zLWxldmVsIENTUFJORykgY3VzdG9tIG1ldGhvZCBmb3IgZmV0Y2hpbmcgc2VjdXJlIHJhbmRvbW5lc3MuXG4gKiAqIGJpdHMyaW50LCBiaXRzMmludF9tb2ROOiB1c2VkIGluIHNpZ3MsIHNvbWV0aW1lcyBvdmVycmlkZGVuIGJ5IGN1cnZlc1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQU9wdHMgPSBQYXJ0aWFsPHtcbiAgbG93UzogYm9vbGVhbjtcbiAgaG1hYzogKGtleTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgcmFuZG9tQnl0ZXM6IChieXRlc0xlbmd0aD86IG51bWJlcikgPT4gVWludDhBcnJheTtcbiAgYml0czJpbnQ6IChieXRlczogVWludDhBcnJheSkgPT4gYmlnaW50O1xuICBiaXRzMmludF9tb2ROOiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IGJpZ2ludDtcbn0+O1xuXG4vKipcbiAqIEVsbGlwdGljIEN1cnZlIERpZmZpZS1IZWxsbWFuIGludGVyZmFjZS5cbiAqIFByb3ZpZGVzIGtleWdlbiwgc2VjcmV0LXRvLXB1YmxpYyBjb252ZXJzaW9uLCBjYWxjdWxhdGluZyBzaGFyZWQgc2VjcmV0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFQ0RIIHtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKSA9PiBVaW50OEFycmF5O1xuICBnZXRTaGFyZWRTZWNyZXQ6IChcbiAgICBzZWNyZXRLZXlBOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleUI6IFVpbnQ4QXJyYXksXG4gICAgaXNDb21wcmVzc2VkPzogYm9vbGVhblxuICApID0+IFVpbnQ4QXJyYXk7XG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+O1xuICB1dGlsczoge1xuICAgIGlzVmFsaWRTZWNyZXRLZXk6IChzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpID0+IGJvb2xlYW47XG4gICAgaXNWYWxpZFB1YmxpY0tleTogKHB1YmxpY0tleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbikgPT4gYm9vbGVhbjtcbiAgICByYW5kb21TZWNyZXRLZXk6IChzZWVkPzogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgfTtcbiAgbGVuZ3RoczogQ3VydmVMZW5ndGhzO1xufVxuXG4vKipcbiAqIEVDRFNBIGludGVyZmFjZS5cbiAqIE9ubHkgc3VwcG9ydGVkIGZvciBwcmltZSBmaWVsZHMsIG5vdCBGcDIgKGV4dGVuc2lvbiBmaWVsZHMpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVDRFNBIGV4dGVuZHMgRUNESCB7XG4gIHNpZ246IChtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM/OiBFQ0RTQVNpZ25PcHRzKSA9PiBVaW50OEFycmF5O1xuICB2ZXJpZnk6IChcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXk6IFVpbnQ4QXJyYXksXG4gICAgb3B0cz86IEVDRFNBVmVyaWZ5T3B0c1xuICApID0+IGJvb2xlYW47XG4gIHJlY292ZXJQdWJsaWNLZXkoc2lnbmF0dXJlOiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBvcHRzPzogRUNEU0FSZWNvdmVyT3B0cyk6IFVpbnQ4QXJyYXk7XG4gIFNpZ25hdHVyZTogRUNEU0FTaWduYXR1cmVDb25zO1xufVxuZXhwb3J0IGNsYXNzIERFUkVyciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobSA9ICcnKSB7XG4gICAgc3VwZXIobSk7XG4gIH1cbn1cbmV4cG9ydCB0eXBlIElERVIgPSB7XG4gIC8vIGFzbi4xIERFUiBlbmNvZGluZyB1dGlsc1xuICBFcnI6IHR5cGVvZiBERVJFcnI7XG4gIC8vIEJhc2ljIGJ1aWxkaW5nIGJsb2NrIGlzIFRMViAoVGFnLUxlbmd0aC1WYWx1ZSlcbiAgX3Rsdjoge1xuICAgIGVuY29kZTogKHRhZzogbnVtYmVyLCBkYXRhOiBzdHJpbmcpID0+IHN0cmluZztcbiAgICAvLyB2IC0gdmFsdWUsIGwgLSBsZWZ0IGJ5dGVzICh1bnBhcnNlZClcbiAgICBkZWNvZGUodGFnOiBudW1iZXIsIGRhdGE6IFVpbnQ4QXJyYXkpOiB7IHY6IFVpbnQ4QXJyYXk7IGw6IFVpbnQ4QXJyYXkgfTtcbiAgfTtcbiAgLy8gaHR0cHM6Ly9jcnlwdG8uc3RhY2tleGNoYW5nZS5jb20vYS81NzczNCBMZWZ0bW9zdCBiaXQgb2YgZmlyc3QgYnl0ZSBpcyAnbmVnYXRpdmUnIGZsYWcsXG4gIC8vIHNpbmNlIHdlIGFsd2F5cyB1c2UgcG9zaXRpdmUgaW50ZWdlcnMgaGVyZS4gSXQgbXVzdCBhbHdheXMgYmUgZW1wdHk6XG4gIC8vIC0gYWRkIHplcm8gYnl0ZSBpZiBleGlzdHNcbiAgLy8gLSBpZiBuZXh0IGJ5dGUgZG9lc24ndCBoYXZlIGEgZmxhZywgbGVhZGluZyB6ZXJvIGlzIG5vdCBhbGxvd2VkIChtaW5pbWFsIGVuY29kaW5nKVxuICBfaW50OiB7XG4gICAgZW5jb2RlKG51bTogYmlnaW50KTogc3RyaW5nO1xuICAgIGRlY29kZShkYXRhOiBVaW50OEFycmF5KTogYmlnaW50O1xuICB9O1xuICB0b1NpZyhoZXg6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH07XG4gIGhleEZyb21TaWcoc2lnOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH0pOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBBU04uMSBERVIgZW5jb2RpbmcgdXRpbGl0aWVzLiBBU04gaXMgdmVyeSBjb21wbGV4ICYgZnJhZ2lsZS4gRm9ybWF0OlxuICpcbiAqICAgICBbMHgzMCAoU0VRVUVOQ0UpLCBieXRlbGVuZ3RoLCAweDAyIChJTlRFR0VSKSwgaW50TGVuZ3RoLCBSLCAweDAyIChJTlRFR0VSKSwgaW50TGVuZ3RoLCBTXVxuICpcbiAqIERvY3M6IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL2RvY3MvYS13YXJtLXdlbGNvbWUtdG8tYXNuMS1hbmQtZGVyLywgaHR0cHM6Ly9sdWNhLm50b3Aub3JnL1RlYWNoaW5nL0FwcHVudGkvYXNuMS5odG1sXG4gKi9cbmV4cG9ydCBjb25zdCBERVI6IElERVIgPSB7XG4gIC8vIGFzbi4xIERFUiBlbmNvZGluZyB1dGlsc1xuICBFcnI6IERFUkVycixcbiAgLy8gQmFzaWMgYnVpbGRpbmcgYmxvY2sgaXMgVExWIChUYWctTGVuZ3RoLVZhbHVlKVxuICBfdGx2OiB7XG4gICAgZW5jb2RlOiAodGFnOiBudW1iZXIsIGRhdGE6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKHRhZyA8IDAgfHwgdGFnID4gMjU2KSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogd3JvbmcgdGFnJyk7XG4gICAgICBpZiAoZGF0YS5sZW5ndGggJiAxKSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogdW5wYWRkZWQgZGF0YScpO1xuICAgICAgY29uc3QgZGF0YUxlbiA9IGRhdGEubGVuZ3RoIC8gMjtcbiAgICAgIGNvbnN0IGxlbiA9IG51bWJlclRvSGV4VW5wYWRkZWQoZGF0YUxlbik7XG4gICAgICBpZiAoKGxlbi5sZW5ndGggLyAyKSAmIDBiMTAwMF8wMDAwKSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogbG9uZyBmb3JtIGxlbmd0aCB0b28gYmlnJyk7XG4gICAgICAvLyBsZW5ndGggb2YgbGVuZ3RoIHdpdGggbG9uZyBmb3JtIGZsYWdcbiAgICAgIGNvbnN0IGxlbkxlbiA9IGRhdGFMZW4gPiAxMjcgPyBudW1iZXJUb0hleFVucGFkZGVkKChsZW4ubGVuZ3RoIC8gMikgfCAwYjEwMDBfMDAwMCkgOiAnJztcbiAgICAgIGNvbnN0IHQgPSBudW1iZXJUb0hleFVucGFkZGVkKHRhZyk7XG4gICAgICByZXR1cm4gdCArIGxlbkxlbiArIGxlbiArIGRhdGE7XG4gICAgfSxcbiAgICAvLyB2IC0gdmFsdWUsIGwgLSBsZWZ0IGJ5dGVzICh1bnBhcnNlZClcbiAgICBkZWNvZGUodGFnOiBudW1iZXIsIGRhdGE6IFVpbnQ4QXJyYXkpOiB7IHY6IFVpbnQ4QXJyYXk7IGw6IFVpbnQ4QXJyYXkgfSB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgbGV0IHBvcyA9IDA7XG4gICAgICBpZiAodGFnIDwgMCB8fCB0YWcgPiAyNTYpIHRocm93IG5ldyBFKCd0bHYuZW5jb2RlOiB3cm9uZyB0YWcnKTtcbiAgICAgIGlmIChkYXRhLmxlbmd0aCA8IDIgfHwgZGF0YVtwb3MrK10gIT09IHRhZykgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IHdyb25nIHRsdicpO1xuICAgICAgY29uc3QgZmlyc3QgPSBkYXRhW3BvcysrXTtcbiAgICAgIGNvbnN0IGlzTG9uZyA9ICEhKGZpcnN0ICYgMGIxMDAwXzAwMDApOyAvLyBGaXJzdCBiaXQgb2YgZmlyc3QgbGVuZ3RoIGJ5dGUgaXMgZmxhZyBmb3Igc2hvcnQvbG9uZyBmb3JtXG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGlmICghaXNMb25nKSBsZW5ndGggPSBmaXJzdDtcbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBMb25nIGZvcm06IFtsb25nRmxhZygxYml0KSwgbGVuZ3RoTGVuZ3RoKDdiaXQpLCBsZW5ndGggKEJFKV1cbiAgICAgICAgY29uc3QgbGVuTGVuID0gZmlyc3QgJiAwYjAxMTFfMTExMTtcbiAgICAgICAgaWYgKCFsZW5MZW4pIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBpbmRlZmluaXRlIGxlbmd0aCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGlmIChsZW5MZW4gPiA0KSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogYnl0ZSBsZW5ndGggaXMgdG9vIGJpZycpOyAvLyB0aGlzIHdpbGwgb3ZlcmZsb3cgdTMyIGluIGpzXG4gICAgICAgIGNvbnN0IGxlbmd0aEJ5dGVzID0gZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIGxlbkxlbik7XG4gICAgICAgIGlmIChsZW5ndGhCeXRlcy5sZW5ndGggIT09IGxlbkxlbikgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IGxlbmd0aCBieXRlcyBub3QgY29tcGxldGUnKTtcbiAgICAgICAgaWYgKGxlbmd0aEJ5dGVzWzBdID09PSAwKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogemVybyBsZWZ0bW9zdCBieXRlJyk7XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBsZW5ndGhCeXRlcykgbGVuZ3RoID0gKGxlbmd0aCA8PCA4KSB8IGI7XG4gICAgICAgIHBvcyArPSBsZW5MZW47XG4gICAgICAgIGlmIChsZW5ndGggPCAxMjgpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBub3QgbWluaW1hbCBlbmNvZGluZycpO1xuICAgICAgfVxuICAgICAgY29uc3QgdiA9IGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpO1xuICAgICAgaWYgKHYubGVuZ3RoICE9PSBsZW5ndGgpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiB3cm9uZyB2YWx1ZSBsZW5ndGgnKTtcbiAgICAgIHJldHVybiB7IHYsIGw6IGRhdGEuc3ViYXJyYXkocG9zICsgbGVuZ3RoKSB9O1xuICAgIH0sXG4gIH0sXG4gIC8vIGh0dHBzOi8vY3J5cHRvLnN0YWNrZXhjaGFuZ2UuY29tL2EvNTc3MzQgTGVmdG1vc3QgYml0IG9mIGZpcnN0IGJ5dGUgaXMgJ25lZ2F0aXZlJyBmbGFnLFxuICAvLyBzaW5jZSB3ZSBhbHdheXMgdXNlIHBvc2l0aXZlIGludGVnZXJzIGhlcmUuIEl0IG11c3QgYWx3YXlzIGJlIGVtcHR5OlxuICAvLyAtIGFkZCB6ZXJvIGJ5dGUgaWYgZXhpc3RzXG4gIC8vIC0gaWYgbmV4dCBieXRlIGRvZXNuJ3QgaGF2ZSBhIGZsYWcsIGxlYWRpbmcgemVybyBpcyBub3QgYWxsb3dlZCAobWluaW1hbCBlbmNvZGluZylcbiAgX2ludDoge1xuICAgIGVuY29kZShudW06IGJpZ2ludCk6IHN0cmluZyB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKG51bSA8IF8wbikgdGhyb3cgbmV3IEUoJ2ludGVnZXI6IG5lZ2F0aXZlIGludGVnZXJzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgbGV0IGhleCA9IG51bWJlclRvSGV4VW5wYWRkZWQobnVtKTtcbiAgICAgIC8vIFBhZCB3aXRoIHplcm8gYnl0ZSBpZiBuZWdhdGl2ZSBmbGFnIGlzIHByZXNlbnRcbiAgICAgIGlmIChOdW1iZXIucGFyc2VJbnQoaGV4WzBdLCAxNikgJiAwYjEwMDApIGhleCA9ICcwMCcgKyBoZXg7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCAmIDEpIHRocm93IG5ldyBFKCd1bmV4cGVjdGVkIERFUiBwYXJzaW5nIGFzc2VydGlvbjogdW5wYWRkZWQgaGV4Jyk7XG4gICAgICByZXR1cm4gaGV4O1xuICAgIH0sXG4gICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmIChkYXRhWzBdICYgMGIxMDAwXzAwMDApIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZSBpbnRlZ2VyOiBuZWdhdGl2ZScpO1xuICAgICAgaWYgKGRhdGFbMF0gPT09IDB4MDAgJiYgIShkYXRhWzFdICYgMGIxMDAwXzAwMDApKVxuICAgICAgICB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmUgaW50ZWdlcjogdW5uZWNlc3NhcnkgbGVhZGluZyB6ZXJvJyk7XG4gICAgICByZXR1cm4gYnl0ZXNUb051bWJlckJFKGRhdGEpO1xuICAgIH0sXG4gIH0sXG4gIHRvU2lnKGJ5dGVzOiBVaW50OEFycmF5KTogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9IHtcbiAgICAvLyBwYXJzZSBERVIgc2lnbmF0dXJlXG4gICAgY29uc3QgeyBFcnI6IEUsIF9pbnQ6IGludCwgX3RsdjogdGx2IH0gPSBERVI7XG4gICAgY29uc3QgZGF0YSA9IGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAnc2lnbmF0dXJlJyk7XG4gICAgY29uc3QgeyB2OiBzZXFCeXRlcywgbDogc2VxTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MzAsIGRhdGEpO1xuICAgIGlmIChzZXFMZWZ0Qnl0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmU6IGxlZnQgYnl0ZXMgYWZ0ZXIgcGFyc2luZycpO1xuICAgIGNvbnN0IHsgdjogckJ5dGVzLCBsOiByTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MDIsIHNlcUJ5dGVzKTtcbiAgICBjb25zdCB7IHY6IHNCeXRlcywgbDogc0xlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDAyLCByTGVmdEJ5dGVzKTtcbiAgICBpZiAoc0xlZnRCeXRlcy5sZW5ndGgpIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZTogbGVmdCBieXRlcyBhZnRlciBwYXJzaW5nJyk7XG4gICAgcmV0dXJuIHsgcjogaW50LmRlY29kZShyQnl0ZXMpLCBzOiBpbnQuZGVjb2RlKHNCeXRlcykgfTtcbiAgfSxcbiAgaGV4RnJvbVNpZyhzaWc6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfSk6IHN0cmluZyB7XG4gICAgY29uc3QgeyBfdGx2OiB0bHYsIF9pbnQ6IGludCB9ID0gREVSO1xuICAgIGNvbnN0IHJzID0gdGx2LmVuY29kZSgweDAyLCBpbnQuZW5jb2RlKHNpZy5yKSk7XG4gICAgY29uc3Qgc3MgPSB0bHYuZW5jb2RlKDB4MDIsIGludC5lbmNvZGUoc2lnLnMpKTtcbiAgICBjb25zdCBzZXEgPSBycyArIHNzO1xuICAgIHJldHVybiB0bHYuZW5jb2RlKDB4MzAsIHNlcSk7XG4gIH0sXG59O1xuXG4vLyBCZSBmcmllbmRseSB0byBiYWQgRUNNQVNjcmlwdCBwYXJzZXJzIGJ5IG5vdCB1c2luZyBiaWdpbnQgbGl0ZXJhbHNcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgXzBuID0gQmlnSW50KDApLCBfMW4gPSBCaWdJbnQoMSksIF8ybiA9IEJpZ0ludCgyKSwgXzNuID0gQmlnSW50KDMpLCBfNG4gPSBCaWdJbnQoNCk7XG5cbi8qKlxuICogQ3JlYXRlcyB3ZWllcnN0cmFzcyBQb2ludCBjb25zdHJ1Y3RvciwgYmFzZWQgb24gc3BlY2lmaWVkIGN1cnZlIG9wdGlvbnMuXG4gKlxuICogU2VlIHtAbGluayBXZWllcnN0cmFzc09wdHN9LlxuICpcbiAqIEBleGFtcGxlXG5gYGBqc1xuY29uc3Qgb3B0cyA9IHtcbiAgcDogMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZhYzczbixcbiAgbjogMHgxMDAwMDAwMDAwMDAwMDAwMDAwMDFiOGZhMTZkZmFiOWFjYTE2YjZiM24sXG4gIGg6IDFuLFxuICBhOiAwbixcbiAgYjogN24sXG4gIEd4OiAweDNiNGMzODJjZTM3YWExOTJhNDAxOWU3NjMwMzZmNGY1ZGQ0ZDdlYmJuLFxuICBHeTogMHg5MzhjZjkzNTMxOGZkY2VkNmJjMjgyODY1MzE3MzNjM2YwM2M0ZmVlbixcbn07XG5jb25zdCBzZWNwMTYwazFfUG9pbnQgPSB3ZWllcnN0cmFzcyhvcHRzKTtcbmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2VpZXJzdHJhc3M8VD4oXG4gIHBhcmFtczogV2VpZXJzdHJhc3NPcHRzPFQ+LFxuICBleHRyYU9wdHM6IFdlaWVyc3RyYXNzRXh0cmFPcHRzPFQ+ID0ge31cbik6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+IHtcbiAgY29uc3QgdmFsaWRhdGVkID0gY3JlYXRlQ3VydmVGaWVsZHMoJ3dlaWVyc3RyYXNzJywgcGFyYW1zLCBleHRyYU9wdHMpO1xuICBjb25zdCB7IEZwLCBGbiB9ID0gdmFsaWRhdGVkO1xuICBsZXQgQ1VSVkUgPSB2YWxpZGF0ZWQuQ1VSVkUgYXMgV2VpZXJzdHJhc3NPcHRzPFQ+O1xuICBjb25zdCB7IGg6IGNvZmFjdG9yLCBuOiBDVVJWRV9PUkRFUiB9ID0gQ1VSVkU7XG4gIHZhbGlkYXRlT2JqZWN0KFxuICAgIGV4dHJhT3B0cyxcbiAgICB7fSxcbiAgICB7XG4gICAgICBhbGxvd0luZmluaXR5UG9pbnQ6ICdib29sZWFuJyxcbiAgICAgIGNsZWFyQ29mYWN0b3I6ICdmdW5jdGlvbicsXG4gICAgICBpc1RvcnNpb25GcmVlOiAnZnVuY3Rpb24nLFxuICAgICAgZnJvbUJ5dGVzOiAnZnVuY3Rpb24nLFxuICAgICAgdG9CeXRlczogJ2Z1bmN0aW9uJyxcbiAgICAgIGVuZG86ICdvYmplY3QnLFxuICAgIH1cbiAgKTtcblxuICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgaWYgKGVuZG8pIHtcbiAgICAvLyB2YWxpZGF0ZU9iamVjdChlbmRvLCB7IGJldGE6ICdiaWdpbnQnLCBzcGxpdFNjYWxhcjogJ2Z1bmN0aW9uJyB9KTtcbiAgICBpZiAoIUZwLmlzMChDVVJWRS5hKSB8fCB0eXBlb2YgZW5kby5iZXRhICE9PSAnYmlnaW50JyB8fCAhQXJyYXkuaXNBcnJheShlbmRvLmJhc2lzZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZW5kbzogZXhwZWN0ZWQgXCJiZXRhXCI6IGJpZ2ludCBhbmQgXCJiYXNpc2VzXCI6IGFycmF5Jyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbGVuZ3RocyA9IGdldFdMZW5ndGhzKEZwLCBGbik7XG5cbiAgZnVuY3Rpb24gYXNzZXJ0Q29tcHJlc3Npb25Jc1N1cHBvcnRlZCgpIHtcbiAgICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbXByZXNzaW9uIGlzIG5vdCBzdXBwb3J0ZWQ6IEZpZWxkIGRvZXMgbm90IGhhdmUgLmlzT2RkKCknKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudHMgSUVFRSBQMTM2MyBwb2ludCBlbmNvZGluZ1xuICBmdW5jdGlvbiBwb2ludFRvQnl0ZXMoXG4gICAgX2M6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LFxuICAgIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+LFxuICAgIGlzQ29tcHJlc3NlZDogYm9vbGVhblxuICApOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IHgsIHkgfSA9IHBvaW50LnRvQWZmaW5lKCk7XG4gICAgY29uc3QgYnggPSBGcC50b0J5dGVzKHgpO1xuICAgIGFib29sKGlzQ29tcHJlc3NlZCwgJ2lzQ29tcHJlc3NlZCcpO1xuICAgIGlmIChpc0NvbXByZXNzZWQpIHtcbiAgICAgIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKTtcbiAgICAgIGNvbnN0IGhhc0V2ZW5ZID0gIUZwLmlzT2RkISh5KTtcbiAgICAgIHJldHVybiBjb25jYXRCeXRlcyhwcHJlZml4KGhhc0V2ZW5ZKSwgYngpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMoVWludDhBcnJheS5vZigweDA0KSwgYngsIEZwLnRvQnl0ZXMoeSkpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwb2ludEZyb21CeXRlcyhieXRlczogVWludDhBcnJheSkge1xuICAgIGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAnUG9pbnQnKTtcbiAgICBjb25zdCB7IHB1YmxpY0tleTogY29tcCwgcHVibGljS2V5VW5jb21wcmVzc2VkOiB1bmNvbXAgfSA9IGxlbmd0aHM7IC8vIGUuZy4gZm9yIDMyLWJ5dGU6IDMzLCA2NVxuICAgIGNvbnN0IGxlbmd0aCA9IGJ5dGVzLmxlbmd0aDtcbiAgICBjb25zdCBoZWFkID0gYnl0ZXNbMF07XG4gICAgY29uc3QgdGFpbCA9IGJ5dGVzLnN1YmFycmF5KDEpO1xuICAgIC8vIE5vIGFjdHVhbCB2YWxpZGF0aW9uIGlzIGRvbmUgaGVyZTogdXNlIC5hc3NlcnRWYWxpZGl0eSgpXG4gICAgaWYgKGxlbmd0aCA9PT0gY29tcCAmJiAoaGVhZCA9PT0gMHgwMiB8fCBoZWFkID09PSAweDAzKSkge1xuICAgICAgY29uc3QgeCA9IEZwLmZyb21CeXRlcyh0YWlsKTtcbiAgICAgIGlmICghRnAuaXNWYWxpZCh4KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZSwgd3JvbmcgeCcpO1xuICAgICAgY29uc3QgeTIgPSB3ZWllcnN0cmFzc0VxdWF0aW9uKHgpOyAvLyB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYlxuICAgICAgbGV0IHk6IFQ7XG4gICAgICB0cnkge1xuICAgICAgICB5ID0gRnAuc3FydCh5Mik7IC8vIHkgPSB5XHUwMEIyIF4gKHArMSkvNFxuICAgICAgfSBjYXRjaCAoc3FydEVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IHNxcnRFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gJzogJyArIHNxcnRFcnJvci5tZXNzYWdlIDogJyc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUsIHNxcnQgZXJyb3InICsgZXJyKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKTtcbiAgICAgIGNvbnN0IGV2ZW5ZID0gRnAuaXNPZGQhKHkpO1xuICAgICAgY29uc3QgZXZlbkggPSAoaGVhZCAmIDEpID09PSAxOyAvLyBFQ0RTQS1zcGVjaWZpY1xuICAgICAgaWYgKGV2ZW5IICE9PSBldmVuWSkgeSA9IEZwLm5lZyh5KTtcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcbiAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5jb21wICYmIGhlYWQgPT09IDB4MDQpIHtcbiAgICAgIC8vIFRPRE86IG1vcmUgY2hlY2tzXG4gICAgICBjb25zdCBMID0gRnAuQllURVM7XG4gICAgICBjb25zdCB4ID0gRnAuZnJvbUJ5dGVzKHRhaWwuc3ViYXJyYXkoMCwgTCkpO1xuICAgICAgY29uc3QgeSA9IEZwLmZyb21CeXRlcyh0YWlsLnN1YmFycmF5KEwsIEwgKiAyKSk7XG4gICAgICBpZiAoIWlzVmFsaWRYWSh4LCB5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZScpO1xuICAgICAgcmV0dXJuIHsgeCwgeSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBiYWQgcG9pbnQ6IGdvdCBsZW5ndGggJHtsZW5ndGh9LCBleHBlY3RlZCBjb21wcmVzc2VkPSR7Y29tcH0gb3IgdW5jb21wcmVzc2VkPSR7dW5jb21wfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZW5jb2RlUG9pbnQgPSBleHRyYU9wdHMudG9CeXRlcyB8fCBwb2ludFRvQnl0ZXM7XG4gIGNvbnN0IGRlY29kZVBvaW50ID0gZXh0cmFPcHRzLmZyb21CeXRlcyB8fCBwb2ludEZyb21CeXRlcztcbiAgZnVuY3Rpb24gd2VpZXJzdHJhc3NFcXVhdGlvbih4OiBUKTogVCB7XG4gICAgY29uc3QgeDIgPSBGcC5zcXIoeCk7IC8vIHggKiB4XG4gICAgY29uc3QgeDMgPSBGcC5tdWwoeDIsIHgpOyAvLyB4XHUwMEIyICogeFxuICAgIHJldHVybiBGcC5hZGQoRnAuYWRkKHgzLCBGcC5tdWwoeCwgQ1VSVkUuYSkpLCBDVVJWRS5iKTsgLy8geFx1MDBCMyArIGEgKiB4ICsgYlxuICB9XG5cbiAgLy8gVE9ETzogbW92ZSB0b3AtbGV2ZWxcbiAgLyoqIENoZWNrcyB3aGV0aGVyIGVxdWF0aW9uIGhvbGRzIGZvciBnaXZlbiB4LCB5OiB5XHUwMEIyID09IHhcdTAwQjMgKyBheCArIGIgKi9cbiAgZnVuY3Rpb24gaXNWYWxpZFhZKHg6IFQsIHk6IFQpOiBib29sZWFuIHtcbiAgICBjb25zdCBsZWZ0ID0gRnAuc3FyKHkpOyAvLyB5XHUwMEIyXG4gICAgY29uc3QgcmlnaHQgPSB3ZWllcnN0cmFzc0VxdWF0aW9uKHgpOyAvLyB4XHUwMEIzICsgYXggKyBiXG4gICAgcmV0dXJuIEZwLmVxbChsZWZ0LCByaWdodCk7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB3aGV0aGVyIHRoZSBwYXNzZWQgY3VydmUgcGFyYW1zIGFyZSB2YWxpZC5cbiAgLy8gVGVzdCAxOiBlcXVhdGlvbiB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYiBzaG91bGQgd29yayBmb3IgZ2VuZXJhdG9yIHBvaW50LlxuICBpZiAoIWlzVmFsaWRYWShDVVJWRS5HeCwgQ1VSVkUuR3kpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjdXJ2ZSBwYXJhbXM6IGdlbmVyYXRvciBwb2ludCcpO1xuXG4gIC8vIFRlc3QgMjogZGlzY3JpbWluYW50IFx1MDM5NCBwYXJ0IHNob3VsZCBiZSBub24temVybzogNGFcdTAwQjMgKyAyN2JcdTAwQjIgIT0gMC5cbiAgLy8gR3VhcmFudGVlcyBjdXJ2ZSBpcyBnZW51cy0xLCBzbW9vdGggKG5vbi1zaW5ndWxhcikuXG4gIGNvbnN0IF80YTMgPSBGcC5tdWwoRnAucG93KENVUlZFLmEsIF8zbiksIF80bik7XG4gIGNvbnN0IF8yN2IyID0gRnAubXVsKEZwLnNxcihDVVJWRS5iKSwgQmlnSW50KDI3KSk7XG4gIGlmIChGcC5pczAoRnAuYWRkKF80YTMsIF8yN2IyKSkpIHRocm93IG5ldyBFcnJvcignYmFkIGN1cnZlIHBhcmFtczogYSBvciBiJyk7XG5cbiAgLyoqIEFzc2VydHMgY29vcmRpbmF0ZSBpcyB2YWxpZDogMCA8PSBuIDwgRnAuT1JERVIuICovXG4gIGZ1bmN0aW9uIGFjb29yZCh0aXRsZTogc3RyaW5nLCBuOiBULCBiYW5aZXJvID0gZmFsc2UpIHtcbiAgICBpZiAoIUZwLmlzVmFsaWQobikgfHwgKGJhblplcm8gJiYgRnAuaXMwKG4pKSkgdGhyb3cgbmV3IEVycm9yKGBiYWQgcG9pbnQgY29vcmRpbmF0ZSAke3RpdGxlfWApO1xuICAgIHJldHVybiBuO1xuICB9XG5cbiAgZnVuY3Rpb24gYXByanBvaW50KG90aGVyOiB1bmtub3duKSB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBQb2ludCkpIHRocm93IG5ldyBFcnJvcignV2VpZXJzdHJhc3MgUG9pbnQgZXhwZWN0ZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwbGl0RW5kb1NjYWxhck4oazogYmlnaW50KSB7XG4gICAgaWYgKCFlbmRvIHx8ICFlbmRvLmJhc2lzZXMpIHRocm93IG5ldyBFcnJvcignbm8gZW5kbycpO1xuICAgIHJldHVybiBfc3BsaXRFbmRvU2NhbGFyKGssIGVuZG8uYmFzaXNlcywgRm4uT1JERVIpO1xuICB9XG5cbiAgLy8gTWVtb2l6ZWQgdG9BZmZpbmUgLyB2YWxpZGl0eSBjaGVjay4gVGhleSBhcmUgaGVhdnkuIFBvaW50cyBhcmUgaW1tdXRhYmxlLlxuXG4gIC8vIENvbnZlcnRzIFByb2plY3RpdmUgcG9pbnQgdG8gYWZmaW5lICh4LCB5KSBjb29yZGluYXRlcy5cbiAgLy8gQ2FuIGFjY2VwdCBwcmVjb21wdXRlZCBaXi0xIC0gZm9yIGV4YW1wbGUsIGZyb20gaW52ZXJ0QmF0Y2guXG4gIC8vIChYLCBZLCBaKSBcdTIyMEIgKHg9WC9aLCB5PVkvWilcbiAgY29uc3QgdG9BZmZpbmVNZW1vID0gbWVtb2l6ZWQoKHA6IFBvaW50LCBpej86IFQpOiBBZmZpbmVQb2ludDxUPiA9PiB7XG4gICAgY29uc3QgeyBYLCBZLCBaIH0gPSBwO1xuICAgIC8vIEZhc3QtcGF0aCBmb3Igbm9ybWFsaXplZCBwb2ludHNcbiAgICBpZiAoRnAuZXFsKFosIEZwLk9ORSkpIHJldHVybiB7IHg6IFgsIHk6IFkgfTtcbiAgICBjb25zdCBpczAgPSBwLmlzMCgpO1xuICAgIC8vIElmIGludlogd2FzIDAsIHdlIHJldHVybiB6ZXJvIHBvaW50LiBIb3dldmVyIHdlIHN0aWxsIHdhbnQgdG8gZXhlY3V0ZVxuICAgIC8vIGFsbCBvcGVyYXRpb25zLCBzbyB3ZSByZXBsYWNlIGludlogd2l0aCBhIHJhbmRvbSBudW1iZXIsIDEuXG4gICAgaWYgKGl6ID09IG51bGwpIGl6ID0gaXMwID8gRnAuT05FIDogRnAuaW52KFopO1xuICAgIGNvbnN0IHggPSBGcC5tdWwoWCwgaXopO1xuICAgIGNvbnN0IHkgPSBGcC5tdWwoWSwgaXopO1xuICAgIGNvbnN0IHp6ID0gRnAubXVsKFosIGl6KTtcbiAgICBpZiAoaXMwKSByZXR1cm4geyB4OiBGcC5aRVJPLCB5OiBGcC5aRVJPIH07XG4gICAgaWYgKCFGcC5lcWwoenosIEZwLk9ORSkpIHRocm93IG5ldyBFcnJvcignaW52WiB3YXMgaW52YWxpZCcpO1xuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfSk7XG4gIC8vIE5PVEU6IG9uIGV4Y2VwdGlvbiB0aGlzIHdpbGwgY3Jhc2ggJ2NhY2hlZCcgYW5kIG5vIHZhbHVlIHdpbGwgYmUgc2V0LlxuICAvLyBPdGhlcndpc2UgdHJ1ZSB3aWxsIGJlIHJldHVyblxuICBjb25zdCBhc3NlcnRWYWxpZE1lbW8gPSBtZW1vaXplZCgocDogUG9pbnQpID0+IHtcbiAgICBpZiAocC5pczAoKSkge1xuICAgICAgLy8gKDAsIDEsIDApIGFrYSBaRVJPIGlzIGludmFsaWQgaW4gbW9zdCBjb250ZXh0cy5cbiAgICAgIC8vIEluIEJMUywgWkVSTyBjYW4gYmUgc2VyaWFsaXplZCwgc28gd2UgYWxsb3cgaXQuXG4gICAgICAvLyAoMCwgMCwgMCkgaXMgaW52YWxpZCByZXByZXNlbnRhdGlvbiBvZiBaRVJPLlxuICAgICAgaWYgKGV4dHJhT3B0cy5hbGxvd0luZmluaXR5UG9pbnQgJiYgIUZwLmlzMChwLlkpKSByZXR1cm47XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogWkVSTycpO1xuICAgIH1cbiAgICAvLyBTb21lIDNyZC1wYXJ0eSB0ZXN0IHZlY3RvcnMgcmVxdWlyZSBkaWZmZXJlbnQgd29yZGluZyBiZXR3ZWVuIGhlcmUgJiBgZnJvbUNvbXByZXNzZWRIZXhgXG4gICAgY29uc3QgeyB4LCB5IH0gPSBwLnRvQWZmaW5lKCk7XG4gICAgaWYgKCFGcC5pc1ZhbGlkKHgpIHx8ICFGcC5pc1ZhbGlkKHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogeCBvciB5IG5vdCBmaWVsZCBlbGVtZW50cycpO1xuICAgIGlmICghaXNWYWxpZFhZKHgsIHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogZXF1YXRpb24gbGVmdCAhPSByaWdodCcpO1xuICAgIGlmICghcC5pc1RvcnNpb25GcmVlKCkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBub3QgaW4gcHJpbWUtb3JkZXIgc3ViZ3JvdXAnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZmluaXNoRW5kbyhcbiAgICBlbmRvQmV0YTogRW5kb21vcnBoaXNtT3B0c1snYmV0YSddLFxuICAgIGsxcDogUG9pbnQsXG4gICAgazJwOiBQb2ludCxcbiAgICBrMW5lZzogYm9vbGVhbixcbiAgICBrMm5lZzogYm9vbGVhblxuICApIHtcbiAgICBrMnAgPSBuZXcgUG9pbnQoRnAubXVsKGsycC5YLCBlbmRvQmV0YSksIGsycC5ZLCBrMnAuWik7XG4gICAgazFwID0gbmVnYXRlQ3QoazFuZWcsIGsxcCk7XG4gICAgazJwID0gbmVnYXRlQ3QoazJuZWcsIGsycCk7XG4gICAgcmV0dXJuIGsxcC5hZGQoazJwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9qZWN0aXZlIFBvaW50IHdvcmtzIGluIDNkIC8gcHJvamVjdGl2ZSAoaG9tb2dlbmVvdXMpIGNvb3JkaW5hdGVzOihYLCBZLCBaKSBcdTIyMEIgKHg9WC9aLCB5PVkvWikuXG4gICAqIERlZmF1bHQgUG9pbnQgd29ya3MgaW4gMmQgLyBhZmZpbmUgY29vcmRpbmF0ZXM6ICh4LCB5KS5cbiAgICogV2UncmUgZG9pbmcgY2FsY3VsYXRpb25zIGluIHByb2plY3RpdmUsIGJlY2F1c2UgaXRzIG9wZXJhdGlvbnMgZG9uJ3QgcmVxdWlyZSBjb3N0bHkgaW52ZXJzaW9uLlxuICAgKi9cbiAgY2xhc3MgUG9pbnQgaW1wbGVtZW50cyBXZWllcnN0cmFzc1BvaW50PFQ+IHtcbiAgICAvLyBiYXNlIC8gZ2VuZXJhdG9yIHBvaW50XG4gICAgc3RhdGljIHJlYWRvbmx5IEJBU0UgPSBuZXcgUG9pbnQoQ1VSVkUuR3gsIENVUlZFLkd5LCBGcC5PTkUpO1xuICAgIC8vIHplcm8gLyBpbmZpbml0eSAvIGlkZW50aXR5IHBvaW50XG4gICAgc3RhdGljIHJlYWRvbmx5IFpFUk8gPSBuZXcgUG9pbnQoRnAuWkVSTywgRnAuT05FLCBGcC5aRVJPKTsgLy8gMCwgMSwgMFxuICAgIC8vIG1hdGggZmllbGRcbiAgICBzdGF0aWMgcmVhZG9ubHkgRnAgPSBGcDtcbiAgICAvLyBzY2FsYXIgZmllbGRcbiAgICBzdGF0aWMgcmVhZG9ubHkgRm4gPSBGbjtcblxuICAgIHJlYWRvbmx5IFg6IFQ7XG4gICAgcmVhZG9ubHkgWTogVDtcbiAgICByZWFkb25seSBaOiBUO1xuXG4gICAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gICAgY29uc3RydWN0b3IoWDogVCwgWTogVCwgWjogVCkge1xuICAgICAgdGhpcy5YID0gYWNvb3JkKCd4JywgWCk7XG4gICAgICB0aGlzLlkgPSBhY29vcmQoJ3knLCBZLCB0cnVlKTtcbiAgICAgIHRoaXMuWiA9IGFjb29yZCgneicsIFopO1xuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ1VSVkUoKTogV2VpZXJzdHJhc3NPcHRzPFQ+IHtcbiAgICAgIHJldHVybiBDVVJWRTtcbiAgICB9XG5cbiAgICAvKiogRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgICBzdGF0aWMgZnJvbUFmZmluZShwOiBBZmZpbmVQb2ludDxUPik6IFBvaW50IHtcbiAgICAgIGNvbnN0IHsgeCwgeSB9ID0gcCB8fCB7fTtcbiAgICAgIGlmICghcCB8fCAhRnAuaXNWYWxpZCh4KSB8fCAhRnAuaXNWYWxpZCh5KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFmZmluZSBwb2ludCcpO1xuICAgICAgaWYgKHAgaW5zdGFuY2VvZiBQb2ludCkgdGhyb3cgbmV3IEVycm9yKCdwcm9qZWN0aXZlIHBvaW50IG5vdCBhbGxvd2VkJyk7XG4gICAgICAvLyAoMCwgMCkgd291bGQndmUgcHJvZHVjZWQgKDAsIDAsIDEpIC0gaW5zdGVhZCwgd2UgbmVlZCAoMCwgMSwgMClcbiAgICAgIGlmIChGcC5pczAoeCkgJiYgRnAuaXMwKHkpKSByZXR1cm4gUG9pbnQuWkVSTztcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSwgRnAuT05FKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogUG9pbnQge1xuICAgICAgY29uc3QgUCA9IFBvaW50LmZyb21BZmZpbmUoZGVjb2RlUG9pbnQoYWJ5dGVzKGJ5dGVzLCB1bmRlZmluZWQsICdwb2ludCcpKSk7XG4gICAgICBQLmFzc2VydFZhbGlkaXR5KCk7XG4gICAgICByZXR1cm4gUDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUhleChoZXg6IHN0cmluZyk6IFBvaW50IHtcbiAgICAgIHJldHVybiBQb2ludC5mcm9tQnl0ZXMoaGV4VG9CeXRlcyhoZXgpKTtcbiAgICB9XG5cbiAgICBnZXQgeCgpOiBUIHtcbiAgICAgIHJldHVybiB0aGlzLnRvQWZmaW5lKCkueDtcbiAgICB9XG4gICAgZ2V0IHkoKTogVCB7XG4gICAgICByZXR1cm4gdGhpcy50b0FmZmluZSgpLnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2luZG93U2l6ZVxuICAgICAqIEBwYXJhbSBpc0xhenkgdHJ1ZSB3aWxsIGRlZmVyIHRhYmxlIGNvbXB1dGF0aW9uIHVudGlsIHRoZSBmaXJzdCBtdWx0aXBsaWNhdGlvblxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJlY29tcHV0ZSh3aW5kb3dTaXplOiBudW1iZXIgPSA4LCBpc0xhenkgPSB0cnVlKTogUG9pbnQge1xuICAgICAgd25hZi5jcmVhdGVDYWNoZSh0aGlzLCB3aW5kb3dTaXplKTtcbiAgICAgIGlmICghaXNMYXp5KSB0aGlzLm11bHRpcGx5KF8zbik7IC8vIHJhbmRvbSBudW1iZXJcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJldHVybiBgdGhpc2BcbiAgICAvKiogQSBwb2ludCBvbiBjdXJ2ZSBpcyB2YWxpZCBpZiBpdCBjb25mb3JtcyB0byBlcXVhdGlvbi4gKi9cbiAgICBhc3NlcnRWYWxpZGl0eSgpOiB2b2lkIHtcbiAgICAgIGFzc2VydFZhbGlkTWVtbyh0aGlzKTtcbiAgICB9XG5cbiAgICBoYXNFdmVuWSgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IHsgeSB9ID0gdGhpcy50b0FmZmluZSgpO1xuICAgICAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKFwiRmllbGQgZG9lc24ndCBzdXBwb3J0IGlzT2RkXCIpO1xuICAgICAgcmV0dXJuICFGcC5pc09kZCh5KTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSBvbmUgcG9pbnQgdG8gYW5vdGhlci4gKi9cbiAgICBlcXVhbHMob3RoZXI6IFBvaW50KTogYm9vbGVhbiB7XG4gICAgICBhcHJqcG9pbnQob3RoZXIpO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgY29uc3QgeyBYOiBYMiwgWTogWTIsIFo6IFoyIH0gPSBvdGhlcjtcbiAgICAgIGNvbnN0IFUxID0gRnAuZXFsKEZwLm11bChYMSwgWjIpLCBGcC5tdWwoWDIsIFoxKSk7XG4gICAgICBjb25zdCBVMiA9IEZwLmVxbChGcC5tdWwoWTEsIFoyKSwgRnAubXVsKFkyLCBaMSkpO1xuICAgICAgcmV0dXJuIFUxICYmIFUyO1xuICAgIH1cblxuICAgIC8qKiBGbGlwcyBwb2ludCB0byBvbmUgY29ycmVzcG9uZGluZyB0byAoeCwgLXkpIGluIEFmZmluZSBjb29yZGluYXRlcy4gKi9cbiAgICBuZWdhdGUoKTogUG9pbnQge1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLlgsIEZwLm5lZyh0aGlzLlkpLCB0aGlzLlopO1xuICAgIH1cblxuICAgIC8vIFJlbmVzLUNvc3RlbGxvLUJhdGluYSBleGNlcHRpb24tZnJlZSBkb3VibGluZyBmb3JtdWxhLlxuICAgIC8vIFRoZXJlIGlzIDMwJSBmYXN0ZXIgSmFjb2JpYW4gZm9ybXVsYSwgYnV0IGl0IGlzIG5vdCBjb21wbGV0ZS5cbiAgICAvLyBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDE1LzEwNjAsIGFsZ29yaXRobSAzXG4gICAgLy8gQ29zdDogOE0gKyAzUyArIDMqYSArIDIqYjMgKyAxNWFkZC5cbiAgICBkb3VibGUoKSB7XG4gICAgICBjb25zdCB7IGEsIGIgfSA9IENVUlZFO1xuICAgICAgY29uc3QgYjMgPSBGcC5tdWwoYiwgXzNuKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGxldCBYMyA9IEZwLlpFUk8sIFkzID0gRnAuWkVSTywgWjMgPSBGcC5aRVJPOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGxldCB0MCA9IEZwLm11bChYMSwgWDEpOyAvLyBzdGVwIDFcbiAgICAgIGxldCB0MSA9IEZwLm11bChZMSwgWTEpO1xuICAgICAgbGV0IHQyID0gRnAubXVsKFoxLCBaMSk7XG4gICAgICBsZXQgdDMgPSBGcC5tdWwoWDEsIFkxKTtcbiAgICAgIHQzID0gRnAuYWRkKHQzLCB0Myk7IC8vIHN0ZXAgNVxuICAgICAgWjMgPSBGcC5tdWwoWDEsIFoxKTtcbiAgICAgIFozID0gRnAuYWRkKFozLCBaMyk7XG4gICAgICBYMyA9IEZwLm11bChhLCBaMyk7XG4gICAgICBZMyA9IEZwLm11bChiMywgdDIpO1xuICAgICAgWTMgPSBGcC5hZGQoWDMsIFkzKTsgLy8gc3RlcCAxMFxuICAgICAgWDMgPSBGcC5zdWIodDEsIFkzKTtcbiAgICAgIFkzID0gRnAuYWRkKHQxLCBZMyk7XG4gICAgICBZMyA9IEZwLm11bChYMywgWTMpO1xuICAgICAgWDMgPSBGcC5tdWwodDMsIFgzKTtcbiAgICAgIFozID0gRnAubXVsKGIzLCBaMyk7IC8vIHN0ZXAgMTVcbiAgICAgIHQyID0gRnAubXVsKGEsIHQyKTtcbiAgICAgIHQzID0gRnAuc3ViKHQwLCB0Mik7XG4gICAgICB0MyA9IEZwLm11bChhLCB0Myk7XG4gICAgICB0MyA9IEZwLmFkZCh0MywgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQodDAsIHQwKTsgLy8gc3RlcCAyMFxuICAgICAgdDAgPSBGcC5hZGQoWjMsIHQwKTtcbiAgICAgIHQwID0gRnAuYWRkKHQwLCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MCwgdDMpO1xuICAgICAgWTMgPSBGcC5hZGQoWTMsIHQwKTtcbiAgICAgIHQyID0gRnAubXVsKFkxLCBaMSk7IC8vIHN0ZXAgMjVcbiAgICAgIHQyID0gRnAuYWRkKHQyLCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MiwgdDMpO1xuICAgICAgWDMgPSBGcC5zdWIoWDMsIHQwKTtcbiAgICAgIFozID0gRnAubXVsKHQyLCB0MSk7XG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpOyAvLyBzdGVwIDMwXG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpO1xuICAgICAgcmV0dXJuIG5ldyBQb2ludChYMywgWTMsIFozKTtcbiAgICB9XG5cbiAgICAvLyBSZW5lcy1Db3N0ZWxsby1CYXRpbmEgZXhjZXB0aW9uLWZyZWUgYWRkaXRpb24gZm9ybXVsYS5cbiAgICAvLyBUaGVyZSBpcyAzMCUgZmFzdGVyIEphY29iaWFuIGZvcm11bGEsIGJ1dCBpdCBpcyBub3QgY29tcGxldGUuXG4gICAgLy8gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxNS8xMDYwLCBhbGdvcml0aG0gMVxuICAgIC8vIENvc3Q6IDEyTSArIDBTICsgMyphICsgMypiMyArIDIzYWRkLlxuICAgIGFkZChvdGhlcjogUG9pbnQpOiBQb2ludCB7XG4gICAgICBhcHJqcG9pbnQob3RoZXIpO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgY29uc3QgeyBYOiBYMiwgWTogWTIsIFo6IFoyIH0gPSBvdGhlcjtcbiAgICAgIGxldCBYMyA9IEZwLlpFUk8sIFkzID0gRnAuWkVSTywgWjMgPSBGcC5aRVJPOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IGEgPSBDVVJWRS5hO1xuICAgICAgY29uc3QgYjMgPSBGcC5tdWwoQ1VSVkUuYiwgXzNuKTtcbiAgICAgIGxldCB0MCA9IEZwLm11bChYMSwgWDIpOyAvLyBzdGVwIDFcbiAgICAgIGxldCB0MSA9IEZwLm11bChZMSwgWTIpO1xuICAgICAgbGV0IHQyID0gRnAubXVsKFoxLCBaMik7XG4gICAgICBsZXQgdDMgPSBGcC5hZGQoWDEsIFkxKTtcbiAgICAgIGxldCB0NCA9IEZwLmFkZChYMiwgWTIpOyAvLyBzdGVwIDVcbiAgICAgIHQzID0gRnAubXVsKHQzLCB0NCk7XG4gICAgICB0NCA9IEZwLmFkZCh0MCwgdDEpO1xuICAgICAgdDMgPSBGcC5zdWIodDMsIHQ0KTtcbiAgICAgIHQ0ID0gRnAuYWRkKFgxLCBaMSk7XG4gICAgICBsZXQgdDUgPSBGcC5hZGQoWDIsIFoyKTsgLy8gc3RlcCAxMFxuICAgICAgdDQgPSBGcC5tdWwodDQsIHQ1KTtcbiAgICAgIHQ1ID0gRnAuYWRkKHQwLCB0Mik7XG4gICAgICB0NCA9IEZwLnN1Yih0NCwgdDUpO1xuICAgICAgdDUgPSBGcC5hZGQoWTEsIFoxKTtcbiAgICAgIFgzID0gRnAuYWRkKFkyLCBaMik7IC8vIHN0ZXAgMTVcbiAgICAgIHQ1ID0gRnAubXVsKHQ1LCBYMyk7XG4gICAgICBYMyA9IEZwLmFkZCh0MSwgdDIpO1xuICAgICAgdDUgPSBGcC5zdWIodDUsIFgzKTtcbiAgICAgIFozID0gRnAubXVsKGEsIHQ0KTtcbiAgICAgIFgzID0gRnAubXVsKGIzLCB0Mik7IC8vIHN0ZXAgMjBcbiAgICAgIFozID0gRnAuYWRkKFgzLCBaMyk7XG4gICAgICBYMyA9IEZwLnN1Yih0MSwgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQodDEsIFozKTtcbiAgICAgIFkzID0gRnAubXVsKFgzLCBaMyk7XG4gICAgICB0MSA9IEZwLmFkZCh0MCwgdDApOyAvLyBzdGVwIDI1XG4gICAgICB0MSA9IEZwLmFkZCh0MSwgdDApO1xuICAgICAgdDIgPSBGcC5tdWwoYSwgdDIpO1xuICAgICAgdDQgPSBGcC5tdWwoYjMsIHQ0KTtcbiAgICAgIHQxID0gRnAuYWRkKHQxLCB0Mik7XG4gICAgICB0MiA9IEZwLnN1Yih0MCwgdDIpOyAvLyBzdGVwIDMwXG4gICAgICB0MiA9IEZwLm11bChhLCB0Mik7XG4gICAgICB0NCA9IEZwLmFkZCh0NCwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDEsIHQ0KTtcbiAgICAgIFkzID0gRnAuYWRkKFkzLCB0MCk7XG4gICAgICB0MCA9IEZwLm11bCh0NSwgdDQpOyAvLyBzdGVwIDM1XG4gICAgICBYMyA9IEZwLm11bCh0MywgWDMpO1xuICAgICAgWDMgPSBGcC5zdWIoWDMsIHQwKTtcbiAgICAgIHQwID0gRnAubXVsKHQzLCB0MSk7XG4gICAgICBaMyA9IEZwLm11bCh0NSwgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQoWjMsIHQwKTsgLy8gc3RlcCA0MFxuICAgICAgcmV0dXJuIG5ldyBQb2ludChYMywgWTMsIFozKTtcbiAgICB9XG5cbiAgICBzdWJ0cmFjdChvdGhlcjogUG9pbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChvdGhlci5uZWdhdGUoKSk7XG4gICAgfVxuXG4gICAgaXMwKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKFBvaW50LlpFUk8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0YW50IHRpbWUgbXVsdGlwbGljYXRpb24uXG4gICAgICogVXNlcyB3TkFGIG1ldGhvZC4gV2luZG93ZWQgbWV0aG9kIG1heSBiZSAxMCUgZmFzdGVyLFxuICAgICAqIGJ1dCB0YWtlcyAyeCBsb25nZXIgdG8gZ2VuZXJhdGUgYW5kIGNvbnN1bWVzIDJ4IG1lbW9yeS5cbiAgICAgKiBVc2VzIHByZWNvbXB1dGVzIHdoZW4gYXZhaWxhYmxlLlxuICAgICAqIFVzZXMgZW5kb21vcnBoaXNtIGZvciBLb2JsaXR6IGN1cnZlcy5cbiAgICAgKiBAcGFyYW0gc2NhbGFyIGJ5IHdoaWNoIHRoZSBwb2ludCB3b3VsZCBiZSBtdWx0aXBsaWVkXG4gICAgICogQHJldHVybnMgTmV3IHBvaW50XG4gICAgICovXG4gICAgbXVsdGlwbHkoc2NhbGFyOiBiaWdpbnQpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmICghRm4uaXNWYWxpZE5vdDAoc2NhbGFyKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcjogb3V0IG9mIHJhbmdlJyk7IC8vIDAgaXMgaW52YWxpZFxuICAgICAgbGV0IHBvaW50OiBQb2ludCwgZmFrZTogUG9pbnQ7IC8vIEZha2UgcG9pbnQgaXMgdXNlZCB0byBjb25zdC10aW1lIG11bHRcbiAgICAgIGNvbnN0IG11bCA9IChuOiBiaWdpbnQpID0+IHduYWYuY2FjaGVkKHRoaXMsIG4sIChwKSA9PiBub3JtYWxpemVaKFBvaW50LCBwKSk7XG4gICAgICAvKiogU2VlIGRvY3MgZm9yIHtAbGluayBFbmRvbW9ycGhpc21PcHRzfSAqL1xuICAgICAgaWYgKGVuZG8pIHtcbiAgICAgICAgY29uc3QgeyBrMW5lZywgazEsIGsybmVnLCBrMiB9ID0gc3BsaXRFbmRvU2NhbGFyTihzY2FsYXIpO1xuICAgICAgICBjb25zdCB7IHA6IGsxcCwgZjogazFmIH0gPSBtdWwoazEpO1xuICAgICAgICBjb25zdCB7IHA6IGsycCwgZjogazJmIH0gPSBtdWwoazIpO1xuICAgICAgICBmYWtlID0gazFmLmFkZChrMmYpO1xuICAgICAgICBwb2ludCA9IGZpbmlzaEVuZG8oZW5kby5iZXRhLCBrMXAsIGsycCwgazFuZWcsIGsybmVnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgcCwgZiB9ID0gbXVsKHNjYWxhcik7XG4gICAgICAgIHBvaW50ID0gcDtcbiAgICAgICAgZmFrZSA9IGY7XG4gICAgICB9XG4gICAgICAvLyBOb3JtYWxpemUgYHpgIGZvciBib3RoIHBvaW50cywgYnV0IHJldHVybiBvbmx5IHJlYWwgb25lXG4gICAgICByZXR1cm4gbm9ybWFsaXplWihQb2ludCwgW3BvaW50LCBmYWtlXSlbMF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTm9uLWNvbnN0YW50LXRpbWUgbXVsdGlwbGljYXRpb24uIFVzZXMgZG91YmxlLWFuZC1hZGQgYWxnb3JpdGhtLlxuICAgICAqIEl0J3MgZmFzdGVyLCBidXQgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aGVuIHlvdSBkb24ndCBjYXJlIGFib3V0XG4gICAgICogYW4gZXhwb3NlZCBzZWNyZXQga2V5IGUuZy4gc2lnIHZlcmlmaWNhdGlvbiwgd2hpY2ggd29ya3Mgb3ZlciAqcHVibGljKiBrZXlzLlxuICAgICAqL1xuICAgIG11bHRpcGx5VW5zYWZlKHNjOiBiaWdpbnQpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgICAgIGNvbnN0IHAgPSB0aGlzIGFzIFBvaW50O1xuICAgICAgaWYgKCFGbi5pc1ZhbGlkKHNjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcjogb3V0IG9mIHJhbmdlJyk7IC8vIDAgaXMgdmFsaWRcbiAgICAgIGlmIChzYyA9PT0gXzBuIHx8IHAuaXMwKCkpIHJldHVybiBQb2ludC5aRVJPOyAvLyAwXG4gICAgICBpZiAoc2MgPT09IF8xbikgcmV0dXJuIHA7IC8vIDFcbiAgICAgIGlmICh3bmFmLmhhc0NhY2hlKHRoaXMpKSByZXR1cm4gdGhpcy5tdWx0aXBseShzYyk7IC8vIHByZWNvbXB1dGVzXG4gICAgICAvLyBXZSBkb24ndCBoYXZlIG1ldGhvZCBmb3IgZG91YmxlIHNjYWxhciBtdWx0aXBsaWNhdGlvbiAoYVAgKyBiUSk6XG4gICAgICAvLyBFdmVuIHdpdGggdXNpbmcgU3RyYXVzcy1TaGFtaXIgdHJpY2ssIGl0J3MgMzUlIHNsb3dlciB0aGFuIG5hXHUwMEVGdmUgbXVsK2FkZC5cbiAgICAgIGlmIChlbmRvKSB7XG4gICAgICAgIGNvbnN0IHsgazFuZWcsIGsxLCBrMm5lZywgazIgfSA9IHNwbGl0RW5kb1NjYWxhck4oc2MpO1xuICAgICAgICBjb25zdCB7IHAxLCBwMiB9ID0gbXVsRW5kb1Vuc2FmZShQb2ludCwgcCwgazEsIGsyKTsgLy8gMzAlIGZhc3RlciB2cyB3bmFmLnVuc2FmZVxuICAgICAgICByZXR1cm4gZmluaXNoRW5kbyhlbmRvLmJldGEsIHAxLCBwMiwgazFuZWcsIGsybmVnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3bmFmLnVuc2FmZShwLCBzYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgUHJvamVjdGl2ZSBwb2ludCB0byBhZmZpbmUgKHgsIHkpIGNvb3JkaW5hdGVzLlxuICAgICAqIEBwYXJhbSBpbnZlcnRlZFogWl4tMSAoaW52ZXJ0ZWQgemVybykgLSBvcHRpb25hbCwgcHJlY29tcHV0YXRpb24gaXMgdXNlZnVsIGZvciBpbnZlcnRCYXRjaFxuICAgICAqL1xuICAgIHRvQWZmaW5lKGludmVydGVkWj86IFQpOiBBZmZpbmVQb2ludDxUPiB7XG4gICAgICByZXR1cm4gdG9BZmZpbmVNZW1vKHRoaXMsIGludmVydGVkWik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgUG9pbnQgaXMgZnJlZSBvZiB0b3JzaW9uIGVsZW1lbnRzIChpcyBpbiBwcmltZSBzdWJncm91cCkuXG4gICAgICogQWx3YXlzIHRvcnNpb24tZnJlZSBmb3IgY29mYWN0b3I9MSBjdXJ2ZXMuXG4gICAgICovXG4gICAgaXNUb3JzaW9uRnJlZSgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IHsgaXNUb3JzaW9uRnJlZSB9ID0gZXh0cmFPcHRzO1xuICAgICAgaWYgKGNvZmFjdG9yID09PSBfMW4pIHJldHVybiB0cnVlO1xuICAgICAgaWYgKGlzVG9yc2lvbkZyZWUpIHJldHVybiBpc1RvcnNpb25GcmVlKFBvaW50LCB0aGlzKTtcbiAgICAgIHJldHVybiB3bmFmLnVuc2FmZSh0aGlzLCBDVVJWRV9PUkRFUikuaXMwKCk7XG4gICAgfVxuXG4gICAgY2xlYXJDb2ZhY3RvcigpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGNsZWFyQ29mYWN0b3IgfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmIChjb2ZhY3RvciA9PT0gXzFuKSByZXR1cm4gdGhpczsgLy8gRmFzdC1wYXRoXG4gICAgICBpZiAoY2xlYXJDb2ZhY3RvcikgcmV0dXJuIGNsZWFyQ29mYWN0b3IoUG9pbnQsIHRoaXMpIGFzIFBvaW50O1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IpO1xuICAgIH1cblxuICAgIGlzU21hbGxPcmRlcigpOiBib29sZWFuIHtcbiAgICAgIC8vIGNhbiB3ZSB1c2UgdGhpcy5jbGVhckNvZmFjdG9yKCk/XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVVuc2FmZShjb2ZhY3RvcikuaXMwKCk7XG4gICAgfVxuXG4gICAgdG9CeXRlcyhpc0NvbXByZXNzZWQgPSB0cnVlKTogVWludDhBcnJheSB7XG4gICAgICBhYm9vbChpc0NvbXByZXNzZWQsICdpc0NvbXByZXNzZWQnKTtcbiAgICAgIHRoaXMuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgICAgIHJldHVybiBlbmNvZGVQb2ludChQb2ludCwgdGhpcywgaXNDb21wcmVzc2VkKTtcbiAgICB9XG5cbiAgICB0b0hleChpc0NvbXByZXNzZWQgPSB0cnVlKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBieXRlc1RvSGV4KHRoaXMudG9CeXRlcyhpc0NvbXByZXNzZWQpKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBgPFBvaW50ICR7dGhpcy5pczAoKSA/ICdaRVJPJyA6IHRoaXMudG9IZXgoKX0+YDtcbiAgICB9XG4gIH1cbiAgY29uc3QgYml0cyA9IEZuLkJJVFM7XG4gIGNvbnN0IHduYWYgPSBuZXcgd05BRihQb2ludCwgZXh0cmFPcHRzLmVuZG8gPyBNYXRoLmNlaWwoYml0cyAvIDIpIDogYml0cyk7XG4gIFBvaW50LkJBU0UucHJlY29tcHV0ZSg4KTsgLy8gRW5hYmxlIHByZWNvbXB1dGVzLiBTbG93cyBkb3duIGZpcnN0IHB1YmxpY0tleSBjb21wdXRhdGlvbiBieSAyMG1zLlxuICByZXR1cm4gUG9pbnQ7XG59XG5cbi8qKiBNZXRob2RzIG9mIEVDRFNBIHNpZ25hdHVyZSBpbnN0YW5jZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRUNEU0FTaWduYXR1cmUge1xuICByZWFkb25seSByOiBiaWdpbnQ7XG4gIHJlYWRvbmx5IHM6IGJpZ2ludDtcbiAgcmVhZG9ubHkgcmVjb3Zlcnk/OiBudW1iZXI7XG4gIGFkZFJlY292ZXJ5Qml0KHJlY292ZXJ5OiBudW1iZXIpOiBFQ0RTQVNpZ25hdHVyZSAmIHsgcmVhZG9ubHkgcmVjb3Zlcnk6IG51bWJlciB9O1xuICBoYXNIaWdoUygpOiBib29sZWFuO1xuICByZWNvdmVyUHVibGljS2V5KG1lc3NhZ2VIYXNoOiBVaW50OEFycmF5KTogV2VpZXJzdHJhc3NQb2ludDxiaWdpbnQ+O1xuICB0b0J5dGVzKGZvcm1hdD86IHN0cmluZyk6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KGZvcm1hdD86IHN0cmluZyk6IHN0cmluZztcbn1cbi8qKiBNZXRob2RzIG9mIEVDRFNBIHNpZ25hdHVyZSBjb25zdHJ1Y3Rvci4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbmF0dXJlQ29ucyA9IHtcbiAgbmV3IChyOiBiaWdpbnQsIHM6IGJpZ2ludCwgcmVjb3Zlcnk/OiBudW1iZXIpOiBFQ0RTQVNpZ25hdHVyZTtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCk6IEVDRFNBU2lnbmF0dXJlO1xuICBmcm9tSGV4KGhleDogc3RyaW5nLCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCk6IEVDRFNBU2lnbmF0dXJlO1xufTtcblxuLy8gUG9pbnRzIHN0YXJ0IHdpdGggYnl0ZSAweDAyIHdoZW4geSBpcyBldmVuOyBvdGhlcndpc2UgMHgwM1xuZnVuY3Rpb24gcHByZWZpeChoYXNFdmVuWTogYm9vbGVhbik6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVWludDhBcnJheS5vZihoYXNFdmVuWSA/IDB4MDIgOiAweDAzKTtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2hhbGx1ZSBhbmQgdmFuIGRlIFdvZXN0aWpuZSBtZXRob2QgZm9yIGFueSB3ZWllcnN0cmFzcyBjdXJ2ZS5cbiAqIFRPRE86IGNoZWNrIGlmIHRoZXJlIGlzIGEgd2F5IHRvIG1lcmdlIHRoaXMgd2l0aCB1dlJhdGlvIGluIEVkd2FyZHM7IG1vdmUgdG8gbW9kdWxhci5cbiAqIGIgPSBUcnVlIGFuZCB5ID0gc3FydCh1IC8gdikgaWYgKHUgLyB2KSBpcyBzcXVhcmUgaW4gRiwgYW5kXG4gKiBiID0gRmFsc2UgYW5kIHkgPSBzcXJ0KFogKiAodSAvIHYpKSBvdGhlcndpc2UuXG4gKiBAcGFyYW0gRnBcbiAqIEBwYXJhbSBaXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gU1dVRnBTcXJ0UmF0aW88VD4oXG4gIEZwOiBJRmllbGQ8VD4sXG4gIFo6IFRcbik6ICh1OiBULCB2OiBUKSA9PiB7IGlzVmFsaWQ6IGJvb2xlYW47IHZhbHVlOiBUIH0ge1xuICAvLyBHZW5lcmljIGltcGxlbWVudGF0aW9uXG4gIGNvbnN0IHEgPSBGcC5PUkRFUjtcbiAgbGV0IGwgPSBfMG47XG4gIGZvciAobGV0IG8gPSBxIC0gXzFuOyBvICUgXzJuID09PSBfMG47IG8gLz0gXzJuKSBsICs9IF8xbjtcbiAgY29uc3QgYzEgPSBsOyAvLyAxLiBjMSwgdGhlIGxhcmdlc3QgaW50ZWdlciBzdWNoIHRoYXQgMl5jMSBkaXZpZGVzIHEgLSAxLlxuICAvLyBXZSBuZWVkIDJuICoqIGMxIGFuZCAybiAqKiAoYzEtMSkuIFdlIGNhbid0IHVzZSAqKjsgYnV0IHdlIGNhbiB1c2UgPDwuXG4gIC8vIDJuICoqIGMxID09IDJuIDw8IChjMS0xKVxuICBjb25zdCBfMm5fcG93X2MxXzEgPSBfMm4gPDwgKGMxIC0gXzFuIC0gXzFuKTtcbiAgY29uc3QgXzJuX3Bvd19jMSA9IF8ybl9wb3dfYzFfMSAqIF8ybjtcbiAgY29uc3QgYzIgPSAocSAtIF8xbikgLyBfMm5fcG93X2MxOyAvLyAyLiBjMiA9IChxIC0gMSkgLyAoMl5jMSkgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGMzID0gKGMyIC0gXzFuKSAvIF8ybjsgLy8gMy4gYzMgPSAoYzIgLSAxKSAvIDIgICAgICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjNCA9IF8ybl9wb3dfYzEgLSBfMW47IC8vIDQuIGM0ID0gMl5jMSAtIDEgICAgICAgICAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzUgPSBfMm5fcG93X2MxXzE7IC8vIDUuIGM1ID0gMl4oYzEgLSAxKSAgICAgICAgICAgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGM2ID0gRnAucG93KFosIGMyKTsgLy8gNi4gYzYgPSBaXmMyXG4gIGNvbnN0IGM3ID0gRnAucG93KFosIChjMiArIF8xbikgLyBfMm4pOyAvLyA3LiBjNyA9IFpeKChjMiArIDEpIC8gMilcbiAgbGV0IHNxcnRSYXRpbyA9ICh1OiBULCB2OiBUKTogeyBpc1ZhbGlkOiBib29sZWFuOyB2YWx1ZTogVCB9ID0+IHtcbiAgICBsZXQgdHYxID0gYzY7IC8vIDEuIHR2MSA9IGM2XG4gICAgbGV0IHR2MiA9IEZwLnBvdyh2LCBjNCk7IC8vIDIuIHR2MiA9IHZeYzRcbiAgICBsZXQgdHYzID0gRnAuc3FyKHR2Mik7IC8vIDMuIHR2MyA9IHR2Ml4yXG4gICAgdHYzID0gRnAubXVsKHR2Mywgdik7IC8vIDQuIHR2MyA9IHR2MyAqIHZcbiAgICBsZXQgdHY1ID0gRnAubXVsKHUsIHR2Myk7IC8vIDUuIHR2NSA9IHUgKiB0djNcbiAgICB0djUgPSBGcC5wb3codHY1LCBjMyk7IC8vIDYuIHR2NSA9IHR2NV5jM1xuICAgIHR2NSA9IEZwLm11bCh0djUsIHR2Mik7IC8vIDcuIHR2NSA9IHR2NSAqIHR2MlxuICAgIHR2MiA9IEZwLm11bCh0djUsIHYpOyAvLyA4LiB0djIgPSB0djUgKiB2XG4gICAgdHYzID0gRnAubXVsKHR2NSwgdSk7IC8vIDkuIHR2MyA9IHR2NSAqIHVcbiAgICBsZXQgdHY0ID0gRnAubXVsKHR2MywgdHYyKTsgLy8gMTAuIHR2NCA9IHR2MyAqIHR2MlxuICAgIHR2NSA9IEZwLnBvdyh0djQsIGM1KTsgLy8gMTEuIHR2NSA9IHR2NF5jNVxuICAgIGxldCBpc1FSID0gRnAuZXFsKHR2NSwgRnAuT05FKTsgLy8gMTIuIGlzUVIgPSB0djUgPT0gMVxuICAgIHR2MiA9IEZwLm11bCh0djMsIGM3KTsgLy8gMTMuIHR2MiA9IHR2MyAqIGM3XG4gICAgdHY1ID0gRnAubXVsKHR2NCwgdHYxKTsgLy8gMTQuIHR2NSA9IHR2NCAqIHR2MVxuICAgIHR2MyA9IEZwLmNtb3YodHYyLCB0djMsIGlzUVIpOyAvLyAxNS4gdHYzID0gQ01PVih0djIsIHR2MywgaXNRUilcbiAgICB0djQgPSBGcC5jbW92KHR2NSwgdHY0LCBpc1FSKTsgLy8gMTYuIHR2NCA9IENNT1YodHY1LCB0djQsIGlzUVIpXG4gICAgLy8gMTcuIGZvciBpIGluIChjMSwgYzEgLSAxLCAuLi4sIDIpOlxuICAgIGZvciAobGV0IGkgPSBjMTsgaSA+IF8xbjsgaS0tKSB7XG4gICAgICBsZXQgdHY1ID0gaSAtIF8ybjsgLy8gMTguICAgIHR2NSA9IGkgLSAyXG4gICAgICB0djUgPSBfMm4gPDwgKHR2NSAtIF8xbik7IC8vIDE5LiAgICB0djUgPSAyXnR2NVxuICAgICAgbGV0IHR2djUgPSBGcC5wb3codHY0LCB0djUpOyAvLyAyMC4gICAgdHY1ID0gdHY0XnR2NVxuICAgICAgY29uc3QgZTEgPSBGcC5lcWwodHZ2NSwgRnAuT05FKTsgLy8gMjEuICAgIGUxID0gdHY1ID09IDFcbiAgICAgIHR2MiA9IEZwLm11bCh0djMsIHR2MSk7IC8vIDIyLiAgICB0djIgPSB0djMgKiB0djFcbiAgICAgIHR2MSA9IEZwLm11bCh0djEsIHR2MSk7IC8vIDIzLiAgICB0djEgPSB0djEgKiB0djFcbiAgICAgIHR2djUgPSBGcC5tdWwodHY0LCB0djEpOyAvLyAyNC4gICAgdHY1ID0gdHY0ICogdHYxXG4gICAgICB0djMgPSBGcC5jbW92KHR2MiwgdHYzLCBlMSk7IC8vIDI1LiAgICB0djMgPSBDTU9WKHR2MiwgdHYzLCBlMSlcbiAgICAgIHR2NCA9IEZwLmNtb3YodHZ2NSwgdHY0LCBlMSk7IC8vIDI2LiAgICB0djQgPSBDTU9WKHR2NSwgdHY0LCBlMSlcbiAgICB9XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogaXNRUiwgdmFsdWU6IHR2MyB9O1xuICB9O1xuICBpZiAoRnAuT1JERVIgJSBfNG4gPT09IF8zbikge1xuICAgIC8vIHNxcnRfcmF0aW9fM21vZDQodSwgdilcbiAgICBjb25zdCBjMSA9IChGcC5PUkRFUiAtIF8zbikgLyBfNG47IC8vIDEuIGMxID0gKHEgLSAzKSAvIDQgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gICAgY29uc3QgYzIgPSBGcC5zcXJ0KEZwLm5lZyhaKSk7IC8vIDIuIGMyID0gc3FydCgtWilcbiAgICBzcXJ0UmF0aW8gPSAodTogVCwgdjogVCkgPT4ge1xuICAgICAgbGV0IHR2MSA9IEZwLnNxcih2KTsgLy8gMS4gdHYxID0gdl4yXG4gICAgICBjb25zdCB0djIgPSBGcC5tdWwodSwgdik7IC8vIDIuIHR2MiA9IHUgKiB2XG4gICAgICB0djEgPSBGcC5tdWwodHYxLCB0djIpOyAvLyAzLiB0djEgPSB0djEgKiB0djJcbiAgICAgIGxldCB5MSA9IEZwLnBvdyh0djEsIGMxKTsgLy8gNC4geTEgPSB0djFeYzFcbiAgICAgIHkxID0gRnAubXVsKHkxLCB0djIpOyAvLyA1LiB5MSA9IHkxICogdHYyXG4gICAgICBjb25zdCB5MiA9IEZwLm11bCh5MSwgYzIpOyAvLyA2LiB5MiA9IHkxICogYzJcbiAgICAgIGNvbnN0IHR2MyA9IEZwLm11bChGcC5zcXIoeTEpLCB2KTsgLy8gNy4gdHYzID0geTFeMjsgOC4gdHYzID0gdHYzICogdlxuICAgICAgY29uc3QgaXNRUiA9IEZwLmVxbCh0djMsIHUpOyAvLyA5LiBpc1FSID0gdHYzID09IHVcbiAgICAgIGxldCB5ID0gRnAuY21vdih5MiwgeTEsIGlzUVIpOyAvLyAxMC4geSA9IENNT1YoeTIsIHkxLCBpc1FSKVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogaXNRUiwgdmFsdWU6IHkgfTsgLy8gMTEuIHJldHVybiAoaXNRUiwgeSkgaXNRUiA/IHkgOiB5KmMyXG4gICAgfTtcbiAgfVxuICAvLyBObyBjdXJ2ZXMgdXNlcyB0aGF0XG4gIC8vIGlmIChGcC5PUkRFUiAlIF84biA9PT0gXzVuKSAvLyBzcXJ0X3JhdGlvXzVtb2Q4XG4gIHJldHVybiBzcXJ0UmF0aW87XG59XG4vKipcbiAqIFNpbXBsaWZpZWQgU2hhbGx1ZS12YW4gZGUgV29lc3Rpam5lLVVsYXMgTWV0aG9kXG4gKiBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTYuNi4yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb0N1cnZlU2ltcGxlU1dVPFQ+KFxuICBGcDogSUZpZWxkPFQ+LFxuICBvcHRzOiB7XG4gICAgQTogVDtcbiAgICBCOiBUO1xuICAgIFo6IFQ7XG4gIH1cbik6ICh1OiBUKSA9PiB7IHg6IFQ7IHk6IFQgfSB7XG4gIHZhbGlkYXRlRmllbGQoRnApO1xuICBjb25zdCB7IEEsIEIsIFogfSA9IG9wdHM7XG4gIGlmICghRnAuaXNWYWxpZChBKSB8fCAhRnAuaXNWYWxpZChCKSB8fCAhRnAuaXNWYWxpZChaKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcFRvQ3VydmVTaW1wbGVTV1U6IGludmFsaWQgb3B0cycpO1xuICBjb25zdCBzcXJ0UmF0aW8gPSBTV1VGcFNxcnRSYXRpbyhGcCwgWik7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcignRmllbGQgZG9lcyBub3QgaGF2ZSAuaXNPZGQoKScpO1xuICAvLyBJbnB1dDogdSwgYW4gZWxlbWVudCBvZiBGLlxuICAvLyBPdXRwdXQ6ICh4LCB5KSwgYSBwb2ludCBvbiBFLlxuICByZXR1cm4gKHU6IFQpOiB7IHg6IFQ7IHk6IFQgfSA9PiB7XG4gICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgbGV0IHR2MSwgdHYyLCB0djMsIHR2NCwgdHY1LCB0djYsIHgsIHk7XG4gICAgdHYxID0gRnAuc3FyKHUpOyAvLyAxLiAgdHYxID0gdV4yXG4gICAgdHYxID0gRnAubXVsKHR2MSwgWik7IC8vIDIuICB0djEgPSBaICogdHYxXG4gICAgdHYyID0gRnAuc3FyKHR2MSk7IC8vIDMuICB0djIgPSB0djFeMlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2MSk7IC8vIDQuICB0djIgPSB0djIgKyB0djFcbiAgICB0djMgPSBGcC5hZGQodHYyLCBGcC5PTkUpOyAvLyA1LiAgdHYzID0gdHYyICsgMVxuICAgIHR2MyA9IEZwLm11bCh0djMsIEIpOyAvLyA2LiAgdHYzID0gQiAqIHR2M1xuICAgIHR2NCA9IEZwLmNtb3YoWiwgRnAubmVnKHR2MiksICFGcC5lcWwodHYyLCBGcC5aRVJPKSk7IC8vIDcuICB0djQgPSBDTU9WKFosIC10djIsIHR2MiAhPSAwKVxuICAgIHR2NCA9IEZwLm11bCh0djQsIEEpOyAvLyA4LiAgdHY0ID0gQSAqIHR2NFxuICAgIHR2MiA9IEZwLnNxcih0djMpOyAvLyA5LiAgdHYyID0gdHYzXjJcbiAgICB0djYgPSBGcC5zcXIodHY0KTsgLy8gMTAuIHR2NiA9IHR2NF4yXG4gICAgdHY1ID0gRnAubXVsKHR2NiwgQSk7IC8vIDExLiB0djUgPSBBICogdHY2XG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHY1KTsgLy8gMTIuIHR2MiA9IHR2MiArIHR2NVxuICAgIHR2MiA9IEZwLm11bCh0djIsIHR2Myk7IC8vIDEzLiB0djIgPSB0djIgKiB0djNcbiAgICB0djYgPSBGcC5tdWwodHY2LCB0djQpOyAvLyAxNC4gdHY2ID0gdHY2ICogdHY0XG4gICAgdHY1ID0gRnAubXVsKHR2NiwgQik7IC8vIDE1LiB0djUgPSBCICogdHY2XG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHY1KTsgLy8gMTYuIHR2MiA9IHR2MiArIHR2NVxuICAgIHggPSBGcC5tdWwodHYxLCB0djMpOyAvLyAxNy4gICB4ID0gdHYxICogdHYzXG4gICAgY29uc3QgeyBpc1ZhbGlkLCB2YWx1ZSB9ID0gc3FydFJhdGlvKHR2MiwgdHY2KTsgLy8gMTguIChpc19neDFfc3F1YXJlLCB5MSkgPSBzcXJ0X3JhdGlvKHR2MiwgdHY2KVxuICAgIHkgPSBGcC5tdWwodHYxLCB1KTsgLy8gMTkuICAgeSA9IHR2MSAqIHUgIC0+IFogKiB1XjMgKiB5MVxuICAgIHkgPSBGcC5tdWwoeSwgdmFsdWUpOyAvLyAyMC4gICB5ID0geSAqIHkxXG4gICAgeCA9IEZwLmNtb3YoeCwgdHYzLCBpc1ZhbGlkKTsgLy8gMjEuICAgeCA9IENNT1YoeCwgdHYzLCBpc19neDFfc3F1YXJlKVxuICAgIHkgPSBGcC5jbW92KHksIHZhbHVlLCBpc1ZhbGlkKTsgLy8gMjIuICAgeSA9IENNT1YoeSwgeTEsIGlzX2d4MV9zcXVhcmUpXG4gICAgY29uc3QgZTEgPSBGcC5pc09kZCEodSkgPT09IEZwLmlzT2RkISh5KTsgLy8gMjMuICBlMSA9IHNnbjAodSkgPT0gc2duMCh5KVxuICAgIHkgPSBGcC5jbW92KEZwLm5lZyh5KSwgeSwgZTEpOyAvLyAyNC4gICB5ID0gQ01PVigteSwgeSwgZTEpXG4gICAgY29uc3QgdHY0X2ludiA9IEZwSW52ZXJ0QmF0Y2goRnAsIFt0djRdLCB0cnVlKVswXTtcbiAgICB4ID0gRnAubXVsKHgsIHR2NF9pbnYpOyAvLyAyNS4gICB4ID0geCAvIHR2NFxuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0V0xlbmd0aHM8VD4oRnA6IElGaWVsZDxUPiwgRm46IElGaWVsZDxiaWdpbnQ+KSB7XG4gIHJldHVybiB7XG4gICAgc2VjcmV0S2V5OiBGbi5CWVRFUyxcbiAgICBwdWJsaWNLZXk6IDEgKyBGcC5CWVRFUyxcbiAgICBwdWJsaWNLZXlVbmNvbXByZXNzZWQ6IDEgKyAyICogRnAuQllURVMsXG4gICAgcHVibGljS2V5SGFzUHJlZml4OiB0cnVlLFxuICAgIHNpZ25hdHVyZTogMiAqIEZuLkJZVEVTLFxuICB9O1xufVxuXG4vKipcbiAqIFNvbWV0aW1lcyB1c2VycyBvbmx5IG5lZWQgZ2V0UHVibGljS2V5LCBnZXRTaGFyZWRTZWNyZXQsIGFuZCBzZWNyZXQga2V5IGhhbmRsaW5nLlxuICogVGhpcyBoZWxwZXIgZW5zdXJlcyBubyBzaWduYXR1cmUgZnVuY3Rpb25hbGl0eSBpcyBwcmVzZW50LiBMZXNzIGNvZGUsIHNtYWxsZXIgYnVuZGxlIHNpemUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlY2RoKFxuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PixcbiAgZWNkaE9wdHM6IHsgcmFuZG9tQnl0ZXM/OiAoYnl0ZXNMZW5ndGg/OiBudW1iZXIpID0+IFVpbnQ4QXJyYXkgfSA9IHt9XG4pOiBFQ0RIIHtcbiAgY29uc3QgeyBGbiB9ID0gUG9pbnQ7XG4gIGNvbnN0IHJhbmRvbUJ5dGVzXyA9IGVjZGhPcHRzLnJhbmRvbUJ5dGVzIHx8IHdjUmFuZG9tQnl0ZXM7XG4gIGNvbnN0IGxlbmd0aHMgPSBPYmplY3QuYXNzaWduKGdldFdMZW5ndGhzKFBvaW50LkZwLCBGbiksIHsgc2VlZDogZ2V0TWluSGFzaExlbmd0aChGbi5PUkRFUikgfSk7XG5cbiAgZnVuY3Rpb24gaXNWYWxpZFNlY3JldEtleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gRm4uZnJvbUJ5dGVzKHNlY3JldEtleSk7XG4gICAgICByZXR1cm4gRm4uaXNWYWxpZE5vdDAobnVtKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVmFsaWRQdWJsaWNLZXkocHVibGljS2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBwdWJsaWNLZXk6IGNvbXAsIHB1YmxpY0tleVVuY29tcHJlc3NlZCB9ID0gbGVuZ3RocztcbiAgICB0cnkge1xuICAgICAgY29uc3QgbCA9IHB1YmxpY0tleS5sZW5ndGg7XG4gICAgICBpZiAoaXNDb21wcmVzc2VkID09PSB0cnVlICYmIGwgIT09IGNvbXApIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChpc0NvbXByZXNzZWQgPT09IGZhbHNlICYmIGwgIT09IHB1YmxpY0tleVVuY29tcHJlc3NlZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuICEhUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlY3JldCBrZXkgZnJvbSByYW5kb20gb2Ygc2l6ZVxuICAgKiAoZ3JvdXBMZW4gKyBjZWlsKGdyb3VwTGVuIC8gMikpIHdpdGggbW9kdWxvIGJpYXMgYmVpbmcgbmVnbGlnaWJsZS5cbiAgICovXG4gIGZ1bmN0aW9uIHJhbmRvbVNlY3JldEtleShzZWVkID0gcmFuZG9tQnl0ZXNfKGxlbmd0aHMuc2VlZCkpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbWFwSGFzaFRvRmllbGQoYWJ5dGVzKHNlZWQsIGxlbmd0aHMuc2VlZCwgJ3NlZWQnKSwgRm4uT1JERVIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHB1YmxpYyBrZXkgZm9yIGEgc2VjcmV0IGtleS4gQ2hlY2tzIGZvciB2YWxpZGl0eSBvZiB0aGUgc2VjcmV0IGtleS5cbiAgICogQHBhcmFtIGlzQ29tcHJlc3NlZCB3aGV0aGVyIHRvIHJldHVybiBjb21wYWN0IChkZWZhdWx0KSwgb3IgZnVsbCBrZXlcbiAgICogQHJldHVybnMgUHVibGljIGtleSwgZnVsbCB3aGVuIGlzQ29tcHJlc3NlZD1mYWxzZTsgc2hvcnQgd2hlbiBpc0NvbXByZXNzZWQ9dHJ1ZVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UHVibGljS2V5KHNlY3JldEtleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkID0gdHJ1ZSk6IFVpbnQ4QXJyYXkge1xuICAgIHJldHVybiBQb2ludC5CQVNFLm11bHRpcGx5KEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpKS50b0J5dGVzKGlzQ29tcHJlc3NlZCk7XG4gIH1cblxuICAvKipcbiAgICogUXVpY2sgYW5kIGRpcnR5IGNoZWNrIGZvciBpdGVtIGJlaW5nIHB1YmxpYyBrZXkuIERvZXMgbm90IHZhbGlkYXRlIGhleCwgb3IgYmVpbmcgb24tY3VydmUuXG4gICAqL1xuICBmdW5jdGlvbiBpc1Byb2JQdWIoaXRlbTogVWludDhBcnJheSk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXksIHB1YmxpY0tleVVuY29tcHJlc3NlZCB9ID0gbGVuZ3RocztcbiAgICBpZiAoIWlzQnl0ZXMoaXRlbSkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgaWYgKCgnX2xlbmd0aHMnIGluIEZuICYmIEZuLl9sZW5ndGhzKSB8fCBzZWNyZXRLZXkgPT09IHB1YmxpY0tleSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBjb25zdCBsID0gYWJ5dGVzKGl0ZW0sIHVuZGVmaW5lZCwgJ2tleScpLmxlbmd0aDtcbiAgICByZXR1cm4gbCA9PT0gcHVibGljS2V5IHx8IGwgPT09IHB1YmxpY0tleVVuY29tcHJlc3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFQ0RIIChFbGxpcHRpYyBDdXJ2ZSBEaWZmaWUgSGVsbG1hbikuXG4gICAqIENvbXB1dGVzIHNoYXJlZCBwdWJsaWMga2V5IGZyb20gc2VjcmV0IGtleSBBIGFuZCBwdWJsaWMga2V5IEIuXG4gICAqIENoZWNrczogMSkgc2VjcmV0IGtleSB2YWxpZGl0eSAyKSBzaGFyZWQga2V5IGlzIG9uLWN1cnZlLlxuICAgKiBEb2VzIE5PVCBoYXNoIHRoZSByZXN1bHQuXG4gICAqIEBwYXJhbSBpc0NvbXByZXNzZWQgd2hldGhlciB0byByZXR1cm4gY29tcGFjdCAoZGVmYXVsdCksIG9yIGZ1bGwga2V5XG4gICAqIEByZXR1cm5zIHNoYXJlZCBwdWJsaWMga2V5XG4gICAqL1xuICBmdW5jdGlvbiBnZXRTaGFyZWRTZWNyZXQoXG4gICAgc2VjcmV0S2V5QTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXlCOiBVaW50OEFycmF5LFxuICAgIGlzQ29tcHJlc3NlZCA9IHRydWVcbiAgKTogVWludDhBcnJheSB7XG4gICAgaWYgKGlzUHJvYlB1YihzZWNyZXRLZXlBKSA9PT0gdHJ1ZSkgdGhyb3cgbmV3IEVycm9yKCdmaXJzdCBhcmcgbXVzdCBiZSBwcml2YXRlIGtleScpO1xuICAgIGlmIChpc1Byb2JQdWIocHVibGljS2V5QikgPT09IGZhbHNlKSB0aHJvdyBuZXcgRXJyb3IoJ3NlY29uZCBhcmcgbXVzdCBiZSBwdWJsaWMga2V5Jyk7XG4gICAgY29uc3QgcyA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXlBKTtcbiAgICBjb25zdCBiID0gUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleUIpOyAvLyBjaGVja3MgZm9yIGJlaW5nIG9uLWN1cnZlXG4gICAgcmV0dXJuIGIubXVsdGlwbHkocykudG9CeXRlcyhpc0NvbXByZXNzZWQpO1xuICB9XG5cbiAgY29uc3QgdXRpbHMgPSB7XG4gICAgaXNWYWxpZFNlY3JldEtleSxcbiAgICBpc1ZhbGlkUHVibGljS2V5LFxuICAgIHJhbmRvbVNlY3JldEtleSxcbiAgfTtcbiAgY29uc3Qga2V5Z2VuID0gY3JlYXRlS2V5Z2VuKHJhbmRvbVNlY3JldEtleSwgZ2V0UHVibGljS2V5KTtcblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7IGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCBrZXlnZW4sIFBvaW50LCB1dGlscywgbGVuZ3RocyB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIEVDRFNBIHNpZ25pbmcgaW50ZXJmYWNlIGZvciBnaXZlbiBlbGxpcHRpYyBjdXJ2ZSBgUG9pbnRgIGFuZCBgaGFzaGAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIFBvaW50IGNyZWF0ZWQgdXNpbmcge0BsaW5rIHdlaWVyc3RyYXNzfSBmdW5jdGlvblxuICogQHBhcmFtIGhhc2ggdXNlZCBmb3IgMSkgbWVzc2FnZSBwcmVoYXNoLWluZyAyKSBrIGdlbmVyYXRpb24gaW4gYHNpZ25gLCB1c2luZyBobWFjX2RyYmcoaGFzaClcbiAqIEBwYXJhbSBlY2RzYU9wdHMgcmFyZWx5IG5lZWRlZCwgc2VlIHtAbGluayBFQ0RTQU9wdHN9XG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBjb25zdCBwMjU2X1BvaW50ID0gd2VpZXJzdHJhc3MoLi4uKTtcbiAqIGNvbnN0IHAyNTZfc2hhMjU2ID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjU2KTtcbiAqIGNvbnN0IHAyNTZfc2hhMjI0ID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjI0KTtcbiAqIGNvbnN0IHAyNTZfc2hhMjI0X3IgPSBlY2RzYShwMjU2X1BvaW50LCBzaGEyMjQsIHsgcmFuZG9tQnl0ZXM6IChsZW5ndGgpID0+IHsgLi4uIH0gfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVjZHNhKFxuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PixcbiAgaGFzaDogQ0hhc2gsXG4gIGVjZHNhT3B0czogRUNEU0FPcHRzID0ge31cbik6IEVDRFNBIHtcbiAgYWhhc2goaGFzaCk7XG4gIHZhbGlkYXRlT2JqZWN0KFxuICAgIGVjZHNhT3B0cyxcbiAgICB7fSxcbiAgICB7XG4gICAgICBobWFjOiAnZnVuY3Rpb24nLFxuICAgICAgbG93UzogJ2Jvb2xlYW4nLFxuICAgICAgcmFuZG9tQnl0ZXM6ICdmdW5jdGlvbicsXG4gICAgICBiaXRzMmludDogJ2Z1bmN0aW9uJyxcbiAgICAgIGJpdHMyaW50X21vZE46ICdmdW5jdGlvbicsXG4gICAgfVxuICApO1xuICBlY2RzYU9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBlY2RzYU9wdHMpO1xuICBjb25zdCByYW5kb21CeXRlcyA9IGVjZHNhT3B0cy5yYW5kb21CeXRlcyB8fCB3Y1JhbmRvbUJ5dGVzO1xuICBjb25zdCBobWFjID0gZWNkc2FPcHRzLmhtYWMgfHwgKChrZXksIG1zZykgPT4gbm9ibGVIbWFjKGhhc2gsIGtleSwgbXNnKSk7XG5cbiAgY29uc3QgeyBGcCwgRm4gfSA9IFBvaW50O1xuICBjb25zdCB7IE9SREVSOiBDVVJWRV9PUkRFUiwgQklUUzogZm5CaXRzIH0gPSBGbjtcbiAgY29uc3QgeyBrZXlnZW4sIGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCB1dGlscywgbGVuZ3RocyB9ID0gZWNkaChQb2ludCwgZWNkc2FPcHRzKTtcbiAgY29uc3QgZGVmYXVsdFNpZ09wdHM6IFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+ID0ge1xuICAgIHByZWhhc2g6IHRydWUsXG4gICAgbG93UzogdHlwZW9mIGVjZHNhT3B0cy5sb3dTID09PSAnYm9vbGVhbicgPyBlY2RzYU9wdHMubG93UyA6IHRydWUsXG4gICAgZm9ybWF0OiAnY29tcGFjdCcgYXMgRUNEU0FTaWduYXR1cmVGb3JtYXQsXG4gICAgZXh0cmFFbnRyb3B5OiBmYWxzZSxcbiAgfTtcbiAgY29uc3QgaGFzTGFyZ2VDb2ZhY3RvciA9IENVUlZFX09SREVSICogXzJuIDwgRnAuT1JERVI7IC8vIFdvbid0IENVUlZFKCkuaCA+IDJuIGJlIG1vcmUgZWZmZWN0aXZlP1xuXG4gIGZ1bmN0aW9uIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcihudW1iZXI6IGJpZ2ludCkge1xuICAgIGNvbnN0IEhBTEYgPSBDVVJWRV9PUkRFUiA+PiBfMW47XG4gICAgcmV0dXJuIG51bWJlciA+IEhBTEY7XG4gIH1cbiAgZnVuY3Rpb24gdmFsaWRhdGVSUyh0aXRsZTogc3RyaW5nLCBudW06IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgaWYgKCFGbi5pc1ZhbGlkTm90MChudW0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHNpZ25hdHVyZSAke3RpdGxlfTogb3V0IG9mIHJhbmdlIDEuLlBvaW50LkZuLk9SREVSYCk7XG4gICAgcmV0dXJuIG51bTtcbiAgfVxuICBmdW5jdGlvbiBhc3NlcnRTbWFsbENvZmFjdG9yKCk6IHZvaWQge1xuICAgIC8vIEVDRFNBIHJlY292ZXJ5IGlzIGhhcmQgZm9yIGNvZmFjdG9yID4gMSBjdXJ2ZXMuXG4gICAgLy8gSW4gc2lnbiwgYHIgPSBxLnggbW9kIG5gLCBhbmQgaGVyZSB3ZSByZWNvdmVyIHEueCBmcm9tIHIuXG4gICAgLy8gV2hpbGUgcmVjb3ZlcmluZyBxLnggPj0gbiwgd2UgbmVlZCB0byBhZGQgcituIGZvciBjb2ZhY3Rvcj0xIGN1cnZlcy5cbiAgICAvLyBIb3dldmVyLCBmb3IgY29mYWN0b3I+MSwgcituIG1heSBub3QgZ2V0IHEueDpcbiAgICAvLyByK24qaSB3b3VsZCBuZWVkIHRvIGJlIGRvbmUgaW5zdGVhZCB3aGVyZSBpIGlzIHVua25vd24uXG4gICAgLy8gVG8gZWFzaWx5IGdldCBpLCB3ZSBlaXRoZXIgbmVlZCB0bzpcbiAgICAvLyBhLiBpbmNyZWFzZSBhbW91bnQgb2YgdmFsaWQgcmVjaWQgdmFsdWVzICg0LCA1Li4uKTsgT1JcbiAgICAvLyBiLiBwcm9oaWJpdCBub24tcHJpbWUtb3JkZXIgc2lnbmF0dXJlcyAocmVjaWQgPiAxKS5cbiAgICBpZiAoaGFzTGFyZ2VDb2ZhY3RvcilcbiAgICAgIHRocm93IG5ldyBFcnJvcignXCJyZWNvdmVyZWRcIiBzaWcgdHlwZSBpcyBub3Qgc3VwcG9ydGVkIGZvciBjb2ZhY3RvciA+MiBjdXJ2ZXMnKTtcbiAgfVxuICBmdW5jdGlvbiB2YWxpZGF0ZVNpZ0xlbmd0aChieXRlczogVWludDhBcnJheSwgZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdCk7XG4gICAgY29uc3Qgc2l6ZSA9IGxlbmd0aHMuc2lnbmF0dXJlITtcbiAgICBjb25zdCBzaXplciA9IGZvcm1hdCA9PT0gJ2NvbXBhY3QnID8gc2l6ZSA6IGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcgPyBzaXplICsgMSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gYWJ5dGVzKGJ5dGVzLCBzaXplcik7XG4gIH1cblxuICAvKipcbiAgICogRUNEU0Egc2lnbmF0dXJlIHdpdGggaXRzIChyLCBzKSBwcm9wZXJ0aWVzLiBTdXBwb3J0cyBjb21wYWN0LCByZWNvdmVyZWQgJiBERVIgcmVwcmVzZW50YXRpb25zLlxuICAgKi9cbiAgY2xhc3MgU2lnbmF0dXJlIGltcGxlbWVudHMgRUNEU0FTaWduYXR1cmUge1xuICAgIHJlYWRvbmx5IHI6IGJpZ2ludDtcbiAgICByZWFkb25seSBzOiBiaWdpbnQ7XG4gICAgcmVhZG9ubHkgcmVjb3Zlcnk/OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihyOiBiaWdpbnQsIHM6IGJpZ2ludCwgcmVjb3Zlcnk/OiBudW1iZXIpIHtcbiAgICAgIHRoaXMuciA9IHZhbGlkYXRlUlMoJ3InLCByKTsgLy8gciBpbiBbMS4uTi0xXTtcbiAgICAgIHRoaXMucyA9IHZhbGlkYXRlUlMoJ3MnLCBzKTsgLy8gcyBpbiBbMS4uTi0xXTtcbiAgICAgIGlmIChyZWNvdmVyeSAhPSBudWxsKSB7XG4gICAgICAgIGFzc2VydFNtYWxsQ29mYWN0b3IoKTtcbiAgICAgICAgaWYgKCFbMCwgMSwgMiwgM10uaW5jbHVkZXMocmVjb3ZlcnkpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3ZlcnkgaWQnKTtcbiAgICAgICAgdGhpcy5yZWNvdmVyeSA9IHJlY292ZXJ5O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUJ5dGVzKFxuICAgICAgYnl0ZXM6IFVpbnQ4QXJyYXksXG4gICAgICBmb3JtYXQ6IEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gZGVmYXVsdFNpZ09wdHMuZm9ybWF0XG4gICAgKTogU2lnbmF0dXJlIHtcbiAgICAgIHZhbGlkYXRlU2lnTGVuZ3RoKGJ5dGVzLCBmb3JtYXQpO1xuICAgICAgbGV0IHJlY2lkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoZm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICBjb25zdCB7IHIsIHMgfSA9IERFUi50b1NpZyhhYnl0ZXMoYnl0ZXMpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUociwgcyk7XG4gICAgICB9XG4gICAgICBpZiAoZm9ybWF0ID09PSAncmVjb3ZlcmVkJykge1xuICAgICAgICByZWNpZCA9IGJ5dGVzWzBdO1xuICAgICAgICBmb3JtYXQgPSAnY29tcGFjdCc7XG4gICAgICAgIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMSk7XG4gICAgICB9XG4gICAgICBjb25zdCBMID0gbGVuZ3Rocy5zaWduYXR1cmUhIC8gMjtcbiAgICAgIGNvbnN0IHIgPSBieXRlcy5zdWJhcnJheSgwLCBMKTtcbiAgICAgIGNvbnN0IHMgPSBieXRlcy5zdWJhcnJheShMLCBMICogMik7XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZShGbi5mcm9tQnl0ZXMociksIEZuLmZyb21CeXRlcyhzKSwgcmVjaWQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmcm9tSGV4KGhleDogc3RyaW5nLCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJvbUJ5dGVzKGhleFRvQnl0ZXMoaGV4KSwgZm9ybWF0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzc2VydFJlY292ZXJ5KCk6IG51bWJlciB7XG4gICAgICBjb25zdCB7IHJlY292ZXJ5IH0gPSB0aGlzO1xuICAgICAgaWYgKHJlY292ZXJ5ID09IG51bGwpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeSBpZDogbXVzdCBiZSBwcmVzZW50Jyk7XG4gICAgICByZXR1cm4gcmVjb3Zlcnk7XG4gICAgfVxuXG4gICAgYWRkUmVjb3ZlcnlCaXQocmVjb3Zlcnk6IG51bWJlcik6IFJlY292ZXJlZFNpZ25hdHVyZSB7XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZSh0aGlzLnIsIHRoaXMucywgcmVjb3ZlcnkpIGFzIFJlY292ZXJlZFNpZ25hdHVyZTtcbiAgICB9XG5cbiAgICByZWNvdmVyUHVibGljS2V5KG1lc3NhZ2VIYXNoOiBVaW50OEFycmF5KTogV2VpZXJzdHJhc3NQb2ludDxiaWdpbnQ+IHtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHJlY292ZXJ5ID0gdGhpcy5hc3NlcnRSZWNvdmVyeSgpO1xuICAgICAgY29uc3QgcmFkaiA9IHJlY292ZXJ5ID09PSAyIHx8IHJlY292ZXJ5ID09PSAzID8gciArIENVUlZFX09SREVSIDogcjtcbiAgICAgIGlmICghRnAuaXNWYWxpZChyYWRqKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5IGlkOiBzaWcucitjdXJ2ZS5uICE9IFIueCcpO1xuICAgICAgY29uc3QgeCA9IEZwLnRvQnl0ZXMocmFkaik7XG4gICAgICBjb25zdCBSID0gUG9pbnQuZnJvbUJ5dGVzKGNvbmNhdEJ5dGVzKHBwcmVmaXgoKHJlY292ZXJ5ICYgMSkgPT09IDApLCB4KSk7XG4gICAgICBjb25zdCBpciA9IEZuLmludihyYWRqKTsgLy8gcl4tMVxuICAgICAgY29uc3QgaCA9IGJpdHMyaW50X21vZE4oYWJ5dGVzKG1lc3NhZ2VIYXNoLCB1bmRlZmluZWQsICdtc2dIYXNoJykpOyAvLyBUcnVuY2F0ZSBoYXNoXG4gICAgICBjb25zdCB1MSA9IEZuLmNyZWF0ZSgtaCAqIGlyKTsgLy8gLWhyXi0xXG4gICAgICBjb25zdCB1MiA9IEZuLmNyZWF0ZShzICogaXIpOyAvLyBzcl4tMVxuICAgICAgLy8gKHNyXi0xKVItKGhyXi0xKUcgPSAtKGhyXi0xKUcgKyAoc3JeLTEpLiB1bnNhZmUgaXMgZmluZTogdGhlcmUgaXMgbm8gcHJpdmF0ZSBkYXRhLlxuICAgICAgY29uc3QgUSA9IFBvaW50LkJBU0UubXVsdGlwbHlVbnNhZmUodTEpLmFkZChSLm11bHRpcGx5VW5zYWZlKHUyKSk7XG4gICAgICBpZiAoUS5pczAoKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5OiBwb2ludCBhdCBpbmZpbmlmeScpO1xuICAgICAgUS5hc3NlcnRWYWxpZGl0eSgpO1xuICAgICAgcmV0dXJuIFE7XG4gICAgfVxuXG4gICAgLy8gU2lnbmF0dXJlcyBzaG91bGQgYmUgbG93LXMsIHRvIHByZXZlbnQgbWFsbGVhYmlsaXR5LlxuICAgIGhhc0hpZ2hTKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcih0aGlzLnMpO1xuICAgIH1cblxuICAgIHRvQnl0ZXMoZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9IGRlZmF1bHRTaWdPcHRzLmZvcm1hdCkge1xuICAgICAgdmFsaWRhdGVTaWdGb3JtYXQoZm9ybWF0KTtcbiAgICAgIGlmIChmb3JtYXQgPT09ICdkZXInKSByZXR1cm4gaGV4VG9CeXRlcyhERVIuaGV4RnJvbVNpZyh0aGlzKSk7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHRoaXM7XG4gICAgICBjb25zdCByYiA9IEZuLnRvQnl0ZXMocik7XG4gICAgICBjb25zdCBzYiA9IEZuLnRvQnl0ZXMocyk7XG4gICAgICBpZiAoZm9ybWF0ID09PSAncmVjb3ZlcmVkJykge1xuICAgICAgICBhc3NlcnRTbWFsbENvZmFjdG9yKCk7XG4gICAgICAgIHJldHVybiBjb25jYXRCeXRlcyhVaW50OEFycmF5Lm9mKHRoaXMuYXNzZXJ0UmVjb3ZlcnkoKSksIHJiLCBzYik7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMocmIsIHNiKTtcbiAgICB9XG5cbiAgICB0b0hleChmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIGJ5dGVzVG9IZXgodGhpcy50b0J5dGVzKGZvcm1hdCkpO1xuICAgIH1cbiAgfVxuICB0eXBlIFJlY292ZXJlZFNpZ25hdHVyZSA9IFNpZ25hdHVyZSAmIHsgcmVjb3Zlcnk6IG51bWJlciB9O1xuXG4gIC8vIFJGQzY5Nzk6IGVuc3VyZSBFQ0RTQSBtc2cgaXMgWCBieXRlcyBhbmQgPCBOLiBSRkMgc3VnZ2VzdHMgb3B0aW9uYWwgdHJ1bmNhdGluZyB2aWEgYml0czJvY3RldHMuXG4gIC8vIEZJUFMgMTg2LTQgNC42IHN1Z2dlc3RzIHRoZSBsZWZ0bW9zdCBtaW4obkJpdExlbiwgb3V0TGVuKSBiaXRzLCB3aGljaCBtYXRjaGVzIGJpdHMyaW50LlxuICAvLyBiaXRzMmludCBjYW4gcHJvZHVjZSByZXM+Tiwgd2UgY2FuIGRvIG1vZChyZXMsIE4pIHNpbmNlIHRoZSBiaXRMZW4gaXMgdGhlIHNhbWUuXG4gIC8vIGludDJvY3RldHMgY2FuJ3QgYmUgdXNlZDsgcGFkcyBzbWFsbCBtc2dzIHdpdGggMDogdW5hY2NlcHRhdGJsZSBmb3IgdHJ1bmMgYXMgcGVyIFJGQyB2ZWN0b3JzXG4gIGNvbnN0IGJpdHMyaW50ID1cbiAgICBlY2RzYU9wdHMuYml0czJpbnQgfHxcbiAgICBmdW5jdGlvbiBiaXRzMmludF9kZWYoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgLy8gT3VyIGN1c3RvbSBjaGVjayBcImp1c3QgaW4gY2FzZVwiLCBmb3IgcHJvdGVjdGlvbiBhZ2FpbnN0IERvU1xuICAgICAgaWYgKGJ5dGVzLmxlbmd0aCA+IDgxOTIpIHRocm93IG5ldyBFcnJvcignaW5wdXQgaXMgdG9vIGxhcmdlJyk7XG4gICAgICAvLyBGb3IgY3VydmVzIHdpdGggbkJpdExlbmd0aCAlIDggIT09IDA6IGJpdHMyb2N0ZXRzKGJpdHMyb2N0ZXRzKG0pKSAhPT0gYml0czJvY3RldHMobSlcbiAgICAgIC8vIGZvciBzb21lIGNhc2VzLCBzaW5jZSBieXRlcy5sZW5ndGggKiA4IGlzIG5vdCBhY3R1YWwgYml0TGVuZ3RoLlxuICAgICAgY29uc3QgbnVtID0gYnl0ZXNUb051bWJlckJFKGJ5dGVzKTsgLy8gY2hlY2sgZm9yID09IHU4IGRvbmUgaGVyZVxuICAgICAgY29uc3QgZGVsdGEgPSBieXRlcy5sZW5ndGggKiA4IC0gZm5CaXRzOyAvLyB0cnVuY2F0ZSB0byBuQml0TGVuZ3RoIGxlZnRtb3N0IGJpdHNcbiAgICAgIHJldHVybiBkZWx0YSA+IDAgPyBudW0gPj4gQmlnSW50KGRlbHRhKSA6IG51bTtcbiAgICB9O1xuICBjb25zdCBiaXRzMmludF9tb2ROID1cbiAgICBlY2RzYU9wdHMuYml0czJpbnRfbW9kTiB8fFxuICAgIGZ1bmN0aW9uIGJpdHMyaW50X21vZE5fZGVmKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIHJldHVybiBGbi5jcmVhdGUoYml0czJpbnQoYnl0ZXMpKTsgLy8gY2FuJ3QgdXNlIGJ5dGVzVG9OdW1iZXJCRSBoZXJlXG4gICAgfTtcbiAgLy8gUGFkcyBvdXRwdXQgd2l0aCB6ZXJvIGFzIHBlciBzcGVjXG4gIGNvbnN0IE9SREVSX01BU0sgPSBiaXRNYXNrKGZuQml0cyk7XG4gIC8qKiBDb252ZXJ0cyB0byBieXRlcy4gQ2hlY2tzIGlmIG51bSBpbiBgWzAuLk9SREVSX01BU0stMV1gIGUuZy46IGBbMC4uMl4yNTYtMV1gLiAqL1xuICBmdW5jdGlvbiBpbnQyb2N0ZXRzKG51bTogYmlnaW50KTogVWludDhBcnJheSB7XG4gICAgLy8gSU1QT1JUQU5UOiB0aGUgY2hlY2sgZW5zdXJlcyB3b3JraW5nIGZvciBjYXNlIGBGbi5CWVRFUyAhPSBGbi5CSVRTICogOGBcbiAgICBhSW5SYW5nZSgnbnVtIDwgMl4nICsgZm5CaXRzLCBudW0sIF8wbiwgT1JERVJfTUFTSyk7XG4gICAgcmV0dXJuIEZuLnRvQnl0ZXMobnVtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlOiBVaW50OEFycmF5LCBwcmVoYXNoOiBib29sZWFuKSB7XG4gICAgYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgICByZXR1cm4gcHJlaGFzaCA/IGFieXRlcyhoYXNoKG1lc3NhZ2UpLCB1bmRlZmluZWQsICdwcmVoYXNoZWQgbWVzc2FnZScpIDogbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGVwcyBBLCBEIG9mIFJGQzY5NzkgMy4yLlxuICAgKiBDcmVhdGVzIFJGQzY5Nzkgc2VlZDsgY29udmVydHMgbXNnL3ByaXZLZXkgdG8gbnVtYmVycy5cbiAgICogVXNlZCBvbmx5IGluIHNpZ24sIG5vdCBpbiB2ZXJpZnkuXG4gICAqXG4gICAqIFdhcm5pbmc6IHdlIGNhbm5vdCBhc3N1bWUgaGVyZSB0aGF0IG1lc3NhZ2UgaGFzIHNhbWUgYW1vdW50IG9mIGJ5dGVzIGFzIGN1cnZlIG9yZGVyLFxuICAgKiB0aGlzIHdpbGwgYmUgaW52YWxpZCBhdCBsZWFzdCBmb3IgUDUyMS4gQWxzbyBpdCBjYW4gYmUgYmlnZ2VyIGZvciBQMjI0ICsgU0hBMjU2LlxuICAgKi9cbiAgZnVuY3Rpb24gcHJlcFNpZyhtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM6IEVDRFNBU2lnbk9wdHMpIHtcbiAgICBjb25zdCB7IGxvd1MsIHByZWhhc2gsIGV4dHJhRW50cm9weSB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpOyAvLyBSRkM2OTc5IDMuMiBBOiBoMSA9IEgobSlcbiAgICAvLyBXZSBjYW4ndCBsYXRlciBjYWxsIGJpdHMyb2N0ZXRzLCBzaW5jZSBuZXN0ZWQgYml0czJpbnQgaXMgYnJva2VuIGZvciBjdXJ2ZXNcbiAgICAvLyB3aXRoIGZuQml0cyAlIDggIT09IDAuIEJlY2F1c2Ugb2YgdGhhdCwgd2UgdW53cmFwIGl0IGhlcmUgYXMgaW50Mm9jdGV0cyBjYWxsLlxuICAgIC8vIGNvbnN0IGJpdHMyb2N0ZXRzID0gKGJpdHMpID0+IGludDJvY3RldHMoYml0czJpbnRfbW9kTihiaXRzKSlcbiAgICBjb25zdCBoMWludCA9IGJpdHMyaW50X21vZE4obWVzc2FnZSk7XG4gICAgY29uc3QgZCA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpOyAvLyB2YWxpZGF0ZSBzZWNyZXQga2V5LCBjb252ZXJ0IHRvIGJpZ2ludFxuICAgIGlmICghRm4uaXNWYWxpZE5vdDAoZCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwcml2YXRlIGtleScpO1xuICAgIGNvbnN0IHNlZWRBcmdzID0gW2ludDJvY3RldHMoZCksIGludDJvY3RldHMoaDFpbnQpXTtcbiAgICAvLyBleHRyYUVudHJvcHkuIFJGQzY5NzkgMy42OiBhZGRpdGlvbmFsIGsnIChvcHRpb25hbCkuXG4gICAgaWYgKGV4dHJhRW50cm9weSAhPSBudWxsICYmIGV4dHJhRW50cm9weSAhPT0gZmFsc2UpIHtcbiAgICAgIC8vIEsgPSBITUFDX0soViB8fCAweDAwIHx8IGludDJvY3RldHMoeCkgfHwgYml0czJvY3RldHMoaDEpIHx8IGsnKVxuICAgICAgLy8gZ2VuIHJhbmRvbSBieXRlcyBPUiBwYXNzIGFzLWlzXG4gICAgICBjb25zdCBlID0gZXh0cmFFbnRyb3B5ID09PSB0cnVlID8gcmFuZG9tQnl0ZXMobGVuZ3Rocy5zZWNyZXRLZXkpIDogZXh0cmFFbnRyb3B5O1xuICAgICAgc2VlZEFyZ3MucHVzaChhYnl0ZXMoZSwgdW5kZWZpbmVkLCAnZXh0cmFFbnRyb3B5JykpOyAvLyBjaGVjayBmb3IgYmVpbmcgYnl0ZXNcbiAgICB9XG4gICAgY29uc3Qgc2VlZCA9IGNvbmNhdEJ5dGVzKC4uLnNlZWRBcmdzKTsgLy8gU3RlcCBEIG9mIFJGQzY5NzkgMy4yXG4gICAgY29uc3QgbSA9IGgxaW50OyAvLyBubyBuZWVkIHRvIGNhbGwgYml0czJpbnQgc2Vjb25kIHRpbWUgaGVyZSwgaXQgaXMgaW5zaWRlIHRydW5jYXRlSGFzaCFcbiAgICAvLyBDb252ZXJ0cyBzaWduYXR1cmUgcGFyYW1zIGludG8gcG9pbnQgdyByL3MsIGNoZWNrcyByZXN1bHQgZm9yIHZhbGlkaXR5LlxuICAgIC8vIFRvIHRyYW5zZm9ybSBrID0+IFNpZ25hdHVyZTpcbiAgICAvLyBxID0ga1x1MjJDNUdcbiAgICAvLyByID0gcS54IG1vZCBuXG4gICAgLy8gcyA9IGteLTEobSArIHJkKSBtb2QgblxuICAgIC8vIENhbiB1c2Ugc2NhbGFyIGJsaW5kaW5nIGJeLTEoYm0gKyBiZHIpIHdoZXJlIGIgXHUyMjA4IFsxLHFcdTIyMTIxXSBhY2NvcmRpbmcgdG9cbiAgICAvLyBodHRwczovL3RjaGVzLmlhY3Iub3JnL2luZGV4LnBocC9UQ0hFUy9hcnRpY2xlL3ZpZXcvNzMzNy82NTA5LiBXZSd2ZSBkZWNpZGVkIGFnYWluc3QgaXQ6XG4gICAgLy8gYSkgZGVwZW5kZW5jeSBvbiBDU1BSTkcgYikgMTUlIHNsb3dkb3duIGMpIGRvZXNuJ3QgcmVhbGx5IGhlbHAgc2luY2UgYmlnaW50cyBhcmUgbm90IENUXG4gICAgZnVuY3Rpb24gazJzaWcoa0J5dGVzOiBVaW50OEFycmF5KTogU2lnbmF0dXJlIHwgdW5kZWZpbmVkIHtcbiAgICAgIC8vIFJGQyA2OTc5IFNlY3Rpb24gMy4yLCBzdGVwIDM6IGsgPSBiaXRzMmludChUKVxuICAgICAgLy8gSW1wb3J0YW50OiBhbGwgbW9kKCkgY2FsbHMgaGVyZSBtdXN0IGJlIGRvbmUgb3ZlciBOXG4gICAgICBjb25zdCBrID0gYml0czJpbnQoa0J5dGVzKTsgLy8gQ2Fubm90IHVzZSBmaWVsZHMgbWV0aG9kcywgc2luY2UgaXQgaXMgZ3JvdXAgZWxlbWVudFxuICAgICAgaWYgKCFGbi5pc1ZhbGlkTm90MChrKSkgcmV0dXJuOyAvLyBWYWxpZCBzY2FsYXJzIChpbmNsdWRpbmcgaykgbXVzdCBiZSBpbiAxLi5OLTFcbiAgICAgIGNvbnN0IGlrID0gRm4uaW52KGspOyAvLyBrXi0xIG1vZCBuXG4gICAgICBjb25zdCBxID0gUG9pbnQuQkFTRS5tdWx0aXBseShrKS50b0FmZmluZSgpOyAvLyBxID0ga1x1MjJDNUdcbiAgICAgIGNvbnN0IHIgPSBGbi5jcmVhdGUocS54KTsgLy8gciA9IHEueCBtb2QgblxuICAgICAgaWYgKHIgPT09IF8wbikgcmV0dXJuO1xuICAgICAgY29uc3QgcyA9IEZuLmNyZWF0ZShpayAqIEZuLmNyZWF0ZShtICsgciAqIGQpKTsgLy8gcyA9IGteLTEobSArIHJkKSBtb2QgblxuICAgICAgaWYgKHMgPT09IF8wbikgcmV0dXJuO1xuICAgICAgbGV0IHJlY292ZXJ5ID0gKHEueCA9PT0gciA/IDAgOiAyKSB8IE51bWJlcihxLnkgJiBfMW4pOyAvLyByZWNvdmVyeSBiaXQgKDIgb3IgMyB3aGVuIHEueD5uKVxuICAgICAgbGV0IG5vcm1TID0gcztcbiAgICAgIGlmIChsb3dTICYmIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcihzKSkge1xuICAgICAgICBub3JtUyA9IEZuLm5lZyhzKTsgLy8gaWYgbG93UyB3YXMgcGFzc2VkLCBlbnN1cmUgcyBpcyBhbHdheXMgaW4gdGhlIGJvdHRvbSBoYWxmIG9mIE5cbiAgICAgICAgcmVjb3ZlcnkgXj0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKHIsIG5vcm1TLCBoYXNMYXJnZUNvZmFjdG9yID8gdW5kZWZpbmVkIDogcmVjb3ZlcnkpO1xuICAgIH1cbiAgICByZXR1cm4geyBzZWVkLCBrMnNpZyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25zIG1lc3NhZ2UgaGFzaCB3aXRoIGEgc2VjcmV0IGtleS5cbiAgICpcbiAgICogYGBgXG4gICAqIHNpZ24obSwgZCkgd2hlcmVcbiAgICogICBrID0gcmZjNjk3OV9obWFjX2RyYmcobSwgZClcbiAgICogICAoeCwgeSkgPSBHIFx1MDBENyBrXG4gICAqICAgciA9IHggbW9kIG5cbiAgICogICBzID0gKG0gKyBkcikgLyBrIG1vZCBuXG4gICAqIGBgYFxuICAgKi9cbiAgZnVuY3Rpb24gc2lnbihtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM6IEVDRFNBU2lnbk9wdHMgPSB7fSk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgc2VlZCwgazJzaWcgfSA9IHByZXBTaWcobWVzc2FnZSwgc2VjcmV0S2V5LCBvcHRzKTsgLy8gU3RlcHMgQSwgRCBvZiBSRkM2OTc5IDMuMi5cbiAgICBjb25zdCBkcmJnID0gY3JlYXRlSG1hY0RyYmc8U2lnbmF0dXJlPihoYXNoLm91dHB1dExlbiwgRm4uQllURVMsIGhtYWMpO1xuICAgIGNvbnN0IHNpZyA9IGRyYmcoc2VlZCwgazJzaWcpOyAvLyBTdGVwcyBCLCBDLCBELCBFLCBGLCBHXG4gICAgcmV0dXJuIHNpZy50b0J5dGVzKG9wdHMuZm9ybWF0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyBhIHNpZ25hdHVyZSBhZ2FpbnN0IG1lc3NhZ2UgYW5kIHB1YmxpYyBrZXkuXG4gICAqIFJlamVjdHMgbG93UyBzaWduYXR1cmVzIGJ5IGRlZmF1bHQ6IHNlZSB7QGxpbmsgRUNEU0FWZXJpZnlPcHRzfS5cbiAgICogSW1wbGVtZW50cyBzZWN0aW9uIDQuMS40IGZyb20gaHR0cHM6Ly93d3cuc2VjZy5vcmcvc2VjMS12Mi5wZGY6XG4gICAqXG4gICAqIGBgYFxuICAgKiB2ZXJpZnkociwgcywgaCwgUCkgd2hlcmVcbiAgICogICB1MSA9IGhzXi0xIG1vZCBuXG4gICAqICAgdTIgPSByc14tMSBtb2QgblxuICAgKiAgIFIgPSB1MVx1MjJDNUcgKyB1Mlx1MjJDNVBcbiAgICogICBtb2QoUi54LCBuKSA9PSByXG4gICAqIGBgYFxuICAgKi9cbiAgZnVuY3Rpb24gdmVyaWZ5KFxuICAgIHNpZ25hdHVyZTogVWludDhBcnJheSxcbiAgICBtZXNzYWdlOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleTogVWludDhBcnJheSxcbiAgICBvcHRzOiBFQ0RTQVZlcmlmeU9wdHMgPSB7fVxuICApOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGxvd1MsIHByZWhhc2gsIGZvcm1hdCB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBwdWJsaWNLZXkgPSBhYnl0ZXMocHVibGljS2V5LCB1bmRlZmluZWQsICdwdWJsaWNLZXknKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpO1xuICAgIGlmICghaXNCeXRlcyhzaWduYXR1cmUgYXMgYW55KSkge1xuICAgICAgY29uc3QgZW5kID0gc2lnbmF0dXJlIGluc3RhbmNlb2YgU2lnbmF0dXJlID8gJywgdXNlIHNpZy50b0J5dGVzKCknIDogJyc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZlcmlmeSBleHBlY3RzIFVpbnQ4QXJyYXkgc2lnbmF0dXJlJyArIGVuZCk7XG4gICAgfVxuICAgIHZhbGlkYXRlU2lnTGVuZ3RoKHNpZ25hdHVyZSwgZm9ybWF0KTsgLy8gZXhlY3V0ZSB0aGlzIHR3aWNlIGJlY2F1c2Ugd2Ugd2FudCBsb3VkIGVycm9yXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNpZyA9IFNpZ25hdHVyZS5mcm9tQnl0ZXMoc2lnbmF0dXJlLCBmb3JtYXQpO1xuICAgICAgY29uc3QgUCA9IFBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXkpO1xuICAgICAgaWYgKGxvd1MgJiYgc2lnLmhhc0hpZ2hTKCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gc2lnO1xuICAgICAgY29uc3QgaCA9IGJpdHMyaW50X21vZE4obWVzc2FnZSk7IC8vIG1vZCBuLCBub3QgbW9kIHBcbiAgICAgIGNvbnN0IGlzID0gRm4uaW52KHMpOyAvLyBzXi0xIG1vZCBuXG4gICAgICBjb25zdCB1MSA9IEZuLmNyZWF0ZShoICogaXMpOyAvLyB1MSA9IGhzXi0xIG1vZCBuXG4gICAgICBjb25zdCB1MiA9IEZuLmNyZWF0ZShyICogaXMpOyAvLyB1MiA9IHJzXi0xIG1vZCBuXG4gICAgICBjb25zdCBSID0gUG9pbnQuQkFTRS5tdWx0aXBseVVuc2FmZSh1MSkuYWRkKFAubXVsdGlwbHlVbnNhZmUodTIpKTsgLy8gdTFcdTIyQzVHICsgdTJcdTIyQzVQXG4gICAgICBpZiAoUi5pczAoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgdiA9IEZuLmNyZWF0ZShSLngpOyAvLyB2ID0gci54IG1vZCBuXG4gICAgICByZXR1cm4gdiA9PT0gcjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3ZlclB1YmxpY0tleShcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBvcHRzOiBFQ0RTQVJlY292ZXJPcHRzID0ge31cbiAgKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBwcmVoYXNoIH0gPSB2YWxpZGF0ZVNpZ09wdHMob3B0cywgZGVmYXVsdFNpZ09wdHMpO1xuICAgIG1lc3NhZ2UgPSB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZSwgcHJlaGFzaCk7XG4gICAgcmV0dXJuIFNpZ25hdHVyZS5mcm9tQnl0ZXMoc2lnbmF0dXJlLCAncmVjb3ZlcmVkJykucmVjb3ZlclB1YmxpY0tleShtZXNzYWdlKS50b0J5dGVzKCk7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAga2V5Z2VuLFxuICAgIGdldFB1YmxpY0tleSxcbiAgICBnZXRTaGFyZWRTZWNyZXQsXG4gICAgdXRpbHMsXG4gICAgbGVuZ3RocyxcbiAgICBQb2ludCxcbiAgICBzaWduLFxuICAgIHZlcmlmeSxcbiAgICByZWNvdmVyUHVibGljS2V5LFxuICAgIFNpZ25hdHVyZSxcbiAgICBoYXNoLFxuICB9KSBzYXRpc2ZpZXMgU2lnbmVyO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBsb2dnZXJcbiAqIEBkZXNjcmlwdGlvbiBMb2dnZXIgdXRpbGl0eSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gKi9cblxuZW51bSBMb2dMZXZlbCB7XG4gIERFQlVHLFxuICBJTkZPLFxuICBXQVJOLFxuICBFUlJPUlxufVxuXG5pbXBvcnQgcGlubyBmcm9tICdwaW5vJztcblxuLyoqXG4gKiBDcmVhdGUgYSBsb2dnZXIgaW5zdGFuY2Ugd2l0aCBjb25zaXN0ZW50IGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBuYW1lIC0gQ29tcG9uZW50IG9yIG1vZHVsZSBuYW1lIGZvciB0aGUgbG9nZ2VyXG4gKiBAcmV0dXJucyBDb25maWd1cmVkIHBpbm8gbG9nZ2VyIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2dnZXIobmFtZTogc3RyaW5nKTogcGluby5Mb2dnZXIge1xuICByZXR1cm4gcGlubyh7XG4gICAgbmFtZSxcbiAgICBsZXZlbDogcHJvY2Vzcy5lbnYuTE9HX0xFVkVMIHx8ICdpbmZvJyxcbiAgICB0cmFuc3BvcnQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8ge1xuICAgICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNsYXRlVGltZTogJ0hIOk1NOnNzJyxcbiAgICAgICAgaWdub3JlOiAncGlkLGhvc3RuYW1lJyxcbiAgICAgIH1cbiAgICB9IDogdW5kZWZpbmVkLFxuICAgIGZvcm1hdHRlcnM6IHtcbiAgICAgIGxldmVsOiAobGFiZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgbGV2ZWw6IGxhYmVsLnRvVXBwZXJDYXNlKCkgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFNpbXBsZSBsb2cgZnVuY3Rpb24gZm9yIGJhc2ljIGxvZ2dpbmcgbmVlZHNcbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBsb2dcbiAqIEBwYXJhbSBkYXRhIC0gT3B0aW9uYWwgZGF0YSB0byBpbmNsdWRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2cobWVzc2FnZTogc3RyaW5nLCBkYXRhPzogdW5rbm93bik6IHZvaWQge1xuICBjb25zb2xlLmxvZyhtZXNzYWdlLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IGxvZ2dlciBpbnN0YW5jZSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gKiBJbmNsdWRlcyBlbmhhbmNlZCBlcnJvciBoYW5kbGluZyBhbmQgZm9ybWF0dGluZ1xuICovXG5leHBvcnQgY29uc3QgbG9nZ2VyOiBwaW5vLkxvZ2dlciA9IHBpbm8oe1xuICBuYW1lOiAnbm9zdHItY3J5cHRvLXV0aWxzJyxcbiAgbGV2ZWw6IHByb2Nlc3MuZW52LkxPR19MRVZFTCB8fCAnaW5mbycsXG4gIHRyYW5zcG9ydDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyB7XG4gICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgdHJhbnNsYXRlVGltZTogJ0hIOk1NOnNzJyxcbiAgICAgIGlnbm9yZTogJ3BpZCxob3N0bmFtZScsXG4gICAgfVxuICB9IDogdW5kZWZpbmVkLFxuICBmb3JtYXR0ZXJzOiB7XG4gICAgbGV2ZWw6IChsYWJlbCkgPT4ge1xuICAgICAgcmV0dXJuIHsgbGV2ZWw6IGxhYmVsLnRvVXBwZXJDYXNlKCkgfTtcbiAgICB9LFxuICAgIGxvZzogKG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgIC8vIENvbnZlcnQgZXJyb3Igb2JqZWN0cyB0byBzdHJpbmdzIGZvciBiZXR0ZXIgbG9nZ2luZ1xuICAgICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAnZXJyJyBpbiBvYmopIHtcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5vYmogfTtcbiAgICAgICAgaWYgKG5ld09iai5lcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgIGNvbnN0IGVyciA9IG5ld09iai5lcnIgYXMgRXJyb3I7XG4gICAgICAgICAgbmV3T2JqLmVyciA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgIG5hbWU6IGVyci5uYW1lLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld09iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGNsYXNzIEN1c3RvbUxvZ2dlciB7XG4gIHByaXZhdGUgX2xldmVsOiBMb2dMZXZlbDtcblxuICBjb25zdHJ1Y3RvcihsZXZlbDogTG9nTGV2ZWwgPSBMb2dMZXZlbC5JTkZPKSB7XG4gICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcbiAgfVxuXG4gIHNldExldmVsKGxldmVsOiBMb2dMZXZlbCk6IHZvaWQge1xuICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gIH1cblxuICBwcml2YXRlIF9sb2cobGV2ZWw6IExvZ0xldmVsLCBtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIGlmIChsZXZlbCA+PSB0aGlzLl9sZXZlbCkge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgY29uc3QgbGV2ZWxOYW1lID0gTG9nTGV2ZWxbbGV2ZWxdO1xuICAgICAgY29uc3QgY29udGV4dFN0ciA9IGNvbnRleHQgPyBgICR7SlNPTi5zdHJpbmdpZnkoY29udGV4dCl9YCA6ICcnO1xuICAgICAgY29uc29sZS5sb2coYFske3RpbWVzdGFtcH1dICR7bGV2ZWxOYW1lfTogJHttZXNzYWdlfSR7Y29udGV4dFN0cn1gKTtcbiAgICB9XG4gIH1cblxuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5ERUJVRywgbWVzc2FnZSwgY29udGV4dCk7XG4gIH1cblxuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgdGhpcy5fbG9nKExvZ0xldmVsLklORk8sIG1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG5cbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5XQVJOLCBtZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZyB8IEVycm9yIHwgdW5rbm93biwgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gbWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yID8gbWVzc2FnZS5tZXNzYWdlIDogU3RyaW5nKG1lc3NhZ2UpO1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5FUlJPUiwgZXJyb3JNZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vLyBSZS1leHBvcnQgdGhlIExvZ2dlciB0eXBlIGZvciB1c2UgaW4gb3RoZXIgZmlsZXNcbmV4cG9ydCB0eXBlIHsgTG9nZ2VyIH0gZnJvbSAncGlubyc7XG4iLCAiLyoqXG4gKiBCYXNlNjQgZW5jb2RpbmcgdXRpbGl0aWVzIGZvciBOb3N0clxuICogUHJvdmlkZXMgY29uc2lzdGVudCBiYXNlNjQgZW5jb2RpbmcvZGVjb2RpbmcgYWNyb3NzIGFsbCBOb3N0ci1yZWxhdGVkIHByb2plY3RzXG4gKiBVc2VzIGJyb3dzZXItY29tcGF0aWJsZSBBUElzIChubyBOb2RlLmpzIEJ1ZmZlciBkZXBlbmRlbmN5KVxuICovXG5cbi8qKlxuICogQ29udmVydCBzdHJpbmcgdG8gYmFzZTY0XG4gKiBAcGFyYW0gc3RyIFN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb0Jhc2U2NChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cik7XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBzdHJpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVVEYtOCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb1N0cmluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbiAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIGJhc2U2NFxuICogQHBhcmFtIGJ1ZmZlciBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ1ZmZlcik7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gVWludDhBcnJheVxuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXlcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J1ZmZlcihiYXNlNjQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBzdHJpbmcgaXMgdmFsaWQgYmFzZTY0XG4gKiBAcGFyYW0gYmFzZTY0IFN0cmluZyB0byBjaGVja1xuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBiYXNlNjRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRCYXNlNjQoYmFzZTY0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gQm9vbGVhbihiYXNlNjQubWF0Y2goL15bQS1aYS16MC05Ky9dKj17MCwyfSQvKSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIFVSTC1zYWZlIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NCBTdGFuZGFyZCBiYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0Jhc2U2NFVybChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlNjQucmVwbGFjZSgvXFwrL2csICctJykucmVwbGFjZSgvXFwvL2csICdfJykucmVwbGFjZSgvPSskLywgJycpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVVJMLXNhZmUgYmFzZTY0IHRvIHN0YW5kYXJkIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NHVybCBVUkwtc2FmZSBiYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBTdGFuZGFyZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQmFzZTY0VXJsKGJhc2U2NHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYmFzZTY0ID0gYmFzZTY0dXJsLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XG4gIGNvbnN0IHBhZGRpbmcgPSAnPScucmVwZWF0KCg0IC0gYmFzZTY0Lmxlbmd0aCAlIDQpICUgNCk7XG4gIHJldHVybiBiYXNlNjQgKyBwYWRkaW5nO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaGV4IHN0cmluZyB0byBiYXNlNjRcbiAqIEBwYXJhbSBoZXggSGV4IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGhleCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CYXNlNjQoaGV4OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWhleC5tYXRjaCgvXlswLTlhLWZBLUZdKiQvKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGV4Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgYnl0ZXNbaSAvIDJdID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZyhpLCBpICsgMiksIDE2KTtcbiAgfVxuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gaGV4IHN0cmluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEhleCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0hleChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBiYXNlNjQgc3RyaW5nIGZyb20gYnl0ZSBhcnJheVxuICogQHBhcmFtIGJ5dGVzIEJ5dGUgYXJyYXlcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBsZXQgYmluYXJ5ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBieXRlIGFycmF5XG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmdcbiAqIEByZXR1cm5zIEJ5dGUgYXJyYXlcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J5dGVzKGJhc2U2NDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgfVxuICByZXR1cm4gYnl0ZXM7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHBhZGRlZCBsZW5ndGggZm9yIGJhc2U2NCBzdHJpbmdcbiAqIEBwYXJhbSBkYXRhTGVuZ3RoIExlbmd0aCBvZiByYXcgZGF0YVxuICogQHJldHVybnMgTGVuZ3RoIG9mIHBhZGRlZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVCYXNlNjRMZW5ndGgoZGF0YUxlbmd0aDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguY2VpbChkYXRhTGVuZ3RoIC8gMykgKiA0O1xufVxuXG4vKipcbiAqIFJlbW92ZSBiYXNlNjQgcGFkZGluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nIHdpdGhvdXQgcGFkZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQmFzZTY0UGFkZGluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlNjQucmVwbGFjZSgvPSskLywgJycpO1xufVxuXG4vKipcbiAqIEFkZCBiYXNlNjQgcGFkZGluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHdpdGhvdXQgcGFkZGluZ1xuICogQHJldHVybnMgUHJvcGVybHkgcGFkZGVkIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEJhc2U2NFBhZGRpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBwYWRkaW5nID0gJz0nLnJlcGVhdCgoNCAtIGJhc2U2NC5sZW5ndGggJSA0KSAlIDQpO1xuICByZXR1cm4gYmFzZTY0ICsgcGFkZGluZztcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdmFsaWRhdGlvblxuICogQGRlc2NyaXB0aW9uIFZhbGlkYXRpb24gdXRpbGl0aWVzIGZvciBOb3N0ciBldmVudHMsIG1lc3NhZ2VzLCBhbmQgcmVsYXRlZCBkYXRhIHN0cnVjdHVyZXMuXG4gKiBQcm92aWRlcyBmdW5jdGlvbnMgdG8gdmFsaWRhdGUgZXZlbnRzLCBzaWduYXR1cmVzLCBmaWx0ZXJzLCBhbmQgc3Vic2NyaXB0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIE5vc3RyIHByb3RvY29sLlxuICovXG5cbmltcG9ydCB7IFxuICBOb3N0ckV2ZW50LCBcbiAgU2lnbmVkTm9zdHJFdmVudCwgXG4gIE5vc3RyRmlsdGVyLCBcbiAgTm9zdHJTdWJzY3JpcHRpb24sIFxuICBWYWxpZGF0aW9uUmVzdWx0LCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlXG59IGZyb20gJy4uL3R5cGVzL2luZGV4JztcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgaGV4IHN0cmluZyBmcm9tIGEgUHVibGljS2V5IG9yIHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRQdWJsaWNLZXlIZXgocHVia2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHB1YmtleSA9PT0gJ3N0cmluZycgPyBwdWJrZXkgOiBwdWJrZXkuaGV4O1xufVxuXG5mdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShoZXgubWF0Y2goLy57MSwyfS9nKSEubWFwKGJ5dGUgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgSUQgYnkgY2hlY2tpbmcgaWYgaXQgbWF0Y2hlcyB0aGUgU0hBLTI1NiBoYXNoIG9mIHRoZSBjYW5vbmljYWwgZXZlbnQgc2VyaWFsaXphdGlvbi5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnRJZChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudElkKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcbiAgICBjb25zdCBoYXNoID0gYnl0ZXNUb0hleChzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGhhc2ggPT09IGV2ZW50LmlkLFxuICAgICAgZXJyb3I6IGhhc2ggPT09IGV2ZW50LmlkID8gdW5kZWZpbmVkIDogJ0ludmFsaWQgZXZlbnQgSUQnXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IElEJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgSUQnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IHNpZ25hdHVyZSB1c2luZyBTY2hub3JyIHNpZ25hdHVyZSB2ZXJpZmljYXRpb24uXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gVmVyaWZ5IHRoZSBzaWduYXR1cmVcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpLFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuICAgIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICBjb25zdCBwdWJrZXlIZXggPSBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KTtcbiAgICBjb25zdCBwdWJrZXlCeXRlcyA9IGhleFRvQnl0ZXMocHVia2V5SGV4KTtcbiAgICBjb25zdCBpc1ZhbGlkID0gc2Nobm9yci52ZXJpZnkoaGV4VG9CeXRlcyhldmVudC5zaWcpLCBoYXNoLCBwdWJrZXlCeXRlcyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQsXG4gICAgICBlcnJvcjogaXNWYWxpZCA/IHVuZGVmaW5lZCA6ICdJbnZhbGlkIHNpZ25hdHVyZSdcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgc2lnbmF0dXJlJ1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBjb21wbGV0ZSBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlLCB0aW1lc3RhbXBzLCBJRCwgYW5kIHNpZ25hdHVyZS5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gRmlyc3QgdmFsaWRhdGUgdGhlIGV2ZW50IHN0cnVjdHVyZVxuICBjb25zdCBiYXNlVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRCYXNlKGV2ZW50KTtcbiAgaWYgKCFiYXNlVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgcmV0dXJuIGJhc2VWYWxpZGF0aW9uO1xuICB9XG5cbiAgLy8gVGhlbiB2YWxpZGF0ZSB0aGUgZXZlbnQgSURcbiAgY29uc3QgaWRWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudElkKGV2ZW50KTtcbiAgaWYgKCFpZFZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgIHJldHVybiBpZFZhbGlkYXRpb247XG4gIH1cblxuICAvLyBGaW5hbGx5IHZhbGlkYXRlIHRoZSBzaWduYXR1cmVcbiAgcmV0dXJuIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUoZXZlbnQpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIHNpZ25lZCBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBzaWduYXR1cmUgZm9ybWF0LlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVTaWduZWRFdmVudChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTaWduZWRFdmVudChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIENoZWNrIGJhc2ljIGV2ZW50IHN0cnVjdHVyZVxuICAgIGNvbnN0IGJhc2VWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudEJhc2UoZXZlbnQpO1xuICAgIGlmICghYmFzZVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGJhc2VWYWxpZGF0aW9uO1xuICAgIH1cblxuICAgIC8vIEdldCBwdWJrZXkgaGV4XG4gICAgY29uc3QgcHVia2V5SGV4ID0gZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBwdWJrZXkgZm9ybWF0XG4gICAgaWYgKCFwdWJrZXlIZXggfHwgdHlwZW9mIHB1YmtleUhleCAhPT0gJ3N0cmluZycgfHwgcHVia2V5SGV4Lmxlbmd0aCAhPT0gNjQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgcHVibGljIGtleSBmb3JtYXQnXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHNpZ25hdHVyZSBmb3JtYXRcbiAgICBpZiAoIWV2ZW50LnNpZyB8fCB0eXBlb2YgZXZlbnQuc2lnICE9PSAnc3RyaW5nJyB8fCBldmVudC5zaWcubGVuZ3RoICE9PSAxMjgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgc2lnbmF0dXJlIGZvcm1hdCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgSUQgZm9ybWF0XG4gICAgaWYgKCFldmVudC5pZCB8fCB0eXBlb2YgZXZlbnQuaWQgIT09ICdzdHJpbmcnIHx8IGV2ZW50LmlkLmxlbmd0aCAhPT0gNjQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgZXZlbnQgSUQgZm9ybWF0J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzaWduZWQgZXZlbnQnKTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzaWduZWQgZXZlbnQnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpZWxkcy5cbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50QmFzZShldmVudDogTm9zdHJFdmVudCB8IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzXG4gIGlmICghZXZlbnQgfHwgdHlwZW9mIGV2ZW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZXZlbnQgc3RydWN0dXJlJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUga2luZFxuICBpZiAodHlwZW9mIGV2ZW50LmtpbmQgIT09ICdudW1iZXInIHx8IGV2ZW50LmtpbmQgPCAwKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQga2luZCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0aW1lc3RhbXBcbiAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIGlmICh0eXBlb2YgZXZlbnQuY3JlYXRlZF9hdCAhPT0gJ251bWJlcicgfHwgZXZlbnQuY3JlYXRlZF9hdCA+IG5vdyArIDYwKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgdGltZXN0YW1wIGNhbm5vdCBiZSBpbiB0aGUgZnV0dXJlJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgY29udGVudFxuICBpZiAodHlwZW9mIGV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgY29udGVudCBtdXN0IGJlIGEgc3RyaW5nJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgcHVia2V5IGZvcm1hdFxuICBpZiAoIWV2ZW50LnB1YmtleSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcHVibGljIGtleScgfTtcbiAgfVxuXG4gIC8vIEdldCBwdWJrZXkgaGV4XG4gIGNvbnN0IHB1YmtleUhleCA9IGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpO1xuICBpZiAodHlwZW9mIHB1YmtleUhleCAhPT0gJ3N0cmluZycgfHwgIS9eWzAtOWEtZl17NjR9JC8udGVzdChwdWJrZXlIZXgpKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwdWJsaWMga2V5IGZvcm1hdCcgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRhZ3NcbiAgaWYgKCFBcnJheS5pc0FycmF5KGV2ZW50LnRhZ3MpKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgdGFncyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICB9XG5cbiAgZm9yIChjb25zdCB0YWcgb2YgZXZlbnQudGFncykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh0YWcpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFYWNoIHRhZyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICAgIH1cbiAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRW1wdHkgdGFncyBhcmUgbm90IGFsbG93ZWQnIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGFnWzBdICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnVGFnIGlkZW50aWZpZXIgbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZmlsdGVyIGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpZWxkcy5cbiAqIFxuICogQHBhcmFtIHtOb3N0ckZpbHRlcn0gZmlsdGVyIC0gVGhlIGZpbHRlciB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRmlsdGVyKGZpbHRlcik7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyOiBOb3N0ckZpbHRlcik6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGZpbHRlciBzdHJ1Y3R1cmVcbiAgICBpZiAoIWZpbHRlciB8fCB0eXBlb2YgZmlsdGVyICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBmaWx0ZXIgc3RydWN0dXJlJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGlkcyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5pZHMgJiYgKCFBcnJheS5pc0FycmF5KGZpbHRlci5pZHMpIHx8ICFmaWx0ZXIuaWRzLmV2ZXJ5KGlkID0+IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGlkcyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgYXV0aG9ycyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5hdXRob3JzICYmICghQXJyYXkuaXNBcnJheShmaWx0ZXIuYXV0aG9ycykgfHwgIWZpbHRlci5hdXRob3JzLmV2ZXJ5KGF1dGhvciA9PiB0eXBlb2YgYXV0aG9yID09PSAnc3RyaW5nJykpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgYXV0aG9ycyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2luZHMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIua2luZHMpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShmaWx0ZXIua2luZHMpKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBraW5kcyBtdXN0IGJlIGFuIGFycmF5IG9mIG51bWJlcnMnIH07XG4gICAgICB9XG4gICAgICBpZiAoIWZpbHRlci5raW5kcy5ldmVyeShraW5kID0+IHR5cGVvZiBraW5kID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpICYmIGtpbmQgPj0gMCkpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGtpbmRzIG11c3QgYmUgbm9uLW5lZ2F0aXZlIGludGVnZXJzJyB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHRpbWVzdGFtcHNcbiAgICBpZiAoZmlsdGVyLnNpbmNlICYmIHR5cGVvZiBmaWx0ZXIuc2luY2UgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgc2luY2UgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG4gICAgaWYgKGZpbHRlci51bnRpbCAmJiB0eXBlb2YgZmlsdGVyLnVudGlsICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIHVudGlsIG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgbGltaXRcbiAgICBpZiAoZmlsdGVyLmxpbWl0ICYmIHR5cGVvZiBmaWx0ZXIubGltaXQgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgbGltaXQgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzZWFyY2hcbiAgICBpZiAoZmlsdGVyLnNlYXJjaCAmJiB0eXBlb2YgZmlsdGVyLnNlYXJjaCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBzZWFyY2ggbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBmaWx0ZXInKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZmlsdGVyJyB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgc3Vic2NyaXB0aW9uIGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpbHRlcnMuXG4gKiBcbiAqIEBwYXJhbSB7Tm9zdHJTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvbiAtIFRoZSBzdWJzY3JpcHRpb24gdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogTm9zdHJTdWJzY3JpcHRpb24pOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBzdWJzY3JpcHRpb24gc3RydWN0dXJlXG4gICAgaWYgKCFzdWJzY3JpcHRpb24gfHwgdHlwZW9mIHN1YnNjcmlwdGlvbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc3Vic2NyaXB0aW9uIHN0cnVjdHVyZScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzdWJzY3JpcHRpb24gSURcbiAgICBpZiAoIXN1YnNjcmlwdGlvbi5pZCB8fCB0eXBlb2Ygc3Vic2NyaXB0aW9uLmlkICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnU3Vic2NyaXB0aW9uIG11c3QgaGF2ZSBhIHN0cmluZyBJRCcgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBmaWx0ZXJzIGFycmF5XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN1YnNjcmlwdGlvbi5maWx0ZXJzKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnU3Vic2NyaXB0aW9uIGZpbHRlcnMgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBlYWNoIGZpbHRlclxuICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIHN1YnNjcmlwdGlvbi5maWx0ZXJzKSB7XG4gICAgICBjb25zdCBmaWx0ZXJWYWxpZGF0aW9uID0gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyKTtcbiAgICAgIGlmICghZmlsdGVyVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXJWYWxpZGF0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIHN1YnNjcmlwdGlvbicpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzdWJzY3JpcHRpb24nIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciByZWxheSByZXNwb25zZSBtZXNzYWdlLlxuICogXG4gKiBAcGFyYW0ge3Vua25vd259IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlUmVzcG9uc2UoWydFVkVOVCcsIGV2ZW50T2JqXSk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVSZXNwb25zZShtZXNzYWdlOiB1bmtub3duKTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgYW4gYXJyYXlcbiAgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbnZhbGlkIG1lc3NhZ2UgZm9ybWF0OiBtdXN0IGJlIGFuIGFycmF5J1xuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBpZiBtZXNzYWdlIGhhcyBhdCBsZWFzdCBvbmUgZWxlbWVudFxuICBpZiAobWVzc2FnZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ludmFsaWQgbWVzc2FnZSBmb3JtYXQ6IGFycmF5IGlzIGVtcHR5J1xuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBpZiBmaXJzdCBlbGVtZW50IGlzIGEgdmFsaWQgbWVzc2FnZSB0eXBlXG4gIGNvbnN0IHR5cGUgPSBtZXNzYWdlWzBdO1xuICBpZiAoIU9iamVjdC52YWx1ZXMoTm9zdHJNZXNzYWdlVHlwZSkuaW5jbHVkZXModHlwZSBhcyBOb3N0ck1lc3NhZ2VUeXBlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiBgSW52YWxpZCBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gXG4gICAgfTtcbiAgfVxuXG4gIC8vIFR5cGUtc3BlY2lmaWMgdmFsaWRhdGlvblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuRVZFTlQ6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0VWRU5UIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0ZVNpZ25lZEV2ZW50KG1lc3NhZ2VbMV0gYXMgU2lnbmVkTm9zdHJFdmVudCk7XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuTk9USUNFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnTk9USUNFIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cyB3aXRoIGEgc3RyaW5nIG1lc3NhZ2UnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuT0s6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDQgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnIHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzJdICE9PSAnYm9vbGVhbicgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbM10gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdPSyBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDQgZWxlbWVudHM6IFt0eXBlLCBldmVudElkLCBzdWNjZXNzLCBtZXNzYWdlXSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5FT1NFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnRU9TRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5SRVE6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdSRVEgbWVzc2FnZSBtdXN0IGhhdmUgYXQgbGVhc3QgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ1JFUSBtZXNzYWdlIG11c3QgaGF2ZSBhIHN0cmluZyBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBWYWxpZGF0ZSBlYWNoIGZpbHRlciBpZiBwcmVzZW50XG4gICAgICBmb3IgKGxldCBpID0gMjsgaSA8IG1lc3NhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZmlsdGVyUmVzdWx0ID0gdmFsaWRhdGVGaWx0ZXIobWVzc2FnZVtpXSBhcyBOb3N0ckZpbHRlcik7XG4gICAgICAgIGlmICghZmlsdGVyUmVzdWx0LmlzVmFsaWQpIHtcbiAgICAgICAgICByZXR1cm4gZmlsdGVyUmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuQ0xPU0U6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIgfHwgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdDTE9TRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5BVVRIOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdBVVRIIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0ZVNpZ25lZEV2ZW50KG1lc3NhZ2VbMV0gYXMgU2lnbmVkTm9zdHJFdmVudCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBgVW5zdXBwb3J0ZWQgbWVzc2FnZSB0eXBlOiAke3R5cGV9YFxuICAgICAgfTtcbiAgfVxufVxuIiwgIi8qKlxuICogQG1vZHVsZSBldmVudFxuICogQGRlc2NyaXB0aW9uIEV2ZW50IGhhbmRsaW5nIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqL1xuXG5leHBvcnQgeyBjcmVhdGVFdmVudCwgc2VyaWFsaXplRXZlbnQsIGdldEV2ZW50SGFzaCB9IGZyb20gJy4vY3JlYXRpb24nO1xuZXhwb3J0IHsgdmFsaWRhdGVFdmVudCwgY2FsY3VsYXRlRXZlbnRJZCB9IGZyb20gJy4vc2lnbmluZyc7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGV2ZW50L2NyZWF0aW9uXG4gKiBAZGVzY3JpcHRpb24gRXZlbnQgY3JlYXRpb24gYW5kIHNlcmlhbGl6YXRpb24gdXRpbGl0aWVzIGZvciBOb3N0clxuICovXG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBOb3N0ckV2ZW50S2luZCB9IGZyb20gJy4uL3R5cGVzL2luZGV4JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IE5vc3RyIGV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gcGFyYW1zIC0gRXZlbnQgcGFyYW1ldGVyc1xuICogQHJldHVybnMgQ3JlYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQocGFyYW1zOiB7XG4gIGtpbmQ6IE5vc3RyRXZlbnRLaW5kO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXVtdO1xuICBjcmVhdGVkX2F0PzogbnVtYmVyO1xuICBwdWJrZXk/OiBzdHJpbmc7XG59KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHsgXG4gICAga2luZCwgXG4gICAgY29udGVudCwgXG4gICAgdGFncyA9IFtdLCBcbiAgICBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksIFxuICAgIHB1YmtleSA9ICcnIFxuICB9ID0gcGFyYW1zO1xuICBcbiAgcmV0dXJuIHtcbiAgICBraW5kLFxuICAgIGNvbnRlbnQsXG4gICAgdGFncyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHB1YmtleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgTm9zdHIgZXZlbnQgZm9yIHNpZ25pbmcvaGFzaGluZyAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2VyaWFsaXplXG4gKiBAcmV0dXJucyBTZXJpYWxpemVkIGV2ZW50IEpTT04gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFdmVudChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudFxuICBdKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoYXNoIG9mIGEgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEV2ZW50IGhhc2ggaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXZlbnRIYXNoKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBldmVudCBoYXNoJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgZXZlbnQvc2lnbmluZ1xuICogQGRlc2NyaXB0aW9uIEV2ZW50IHNpZ25pbmcgYW5kIHZlcmlmaWNhdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRFdmVudEhhc2ggfSBmcm9tICcuL2NyZWF0aW9uJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBTaWducyBhIE5vc3RyIGV2ZW50IHdpdGggYSBwcml2YXRlIGtleSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBTaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsIFxuICBwcml2YXRlS2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBnZXRFdmVudEhhc2goZXZlbnQpO1xuICAgIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihoZXhUb0J5dGVzKGhhc2gpLCBoZXhUb0J5dGVzKHByaXZhdGVLZXkpKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogaGFzaCxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWcpLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGUgc2lnbmF0dXJlIG9mIGEgc2lnbmVkIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgc2lnbmF0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnNpZyksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LmlkKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGV2ZW50IGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50KGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFldmVudC5pZCB8fCAhZXZlbnQucHVia2V5IHx8ICFldmVudC5zaWcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHZlcmlmeVNpZ25hdHVyZShldmVudCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0Vycm9yIHZhbGlkYXRpbmcgZXZlbnQnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldmVudCBJRCBmb3IgYSBOb3N0ciBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gY2FsY3VsYXRlIElEIGZvclxuICogQHJldHVybnMgRXZlbnQgSURcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUV2ZW50SWQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtMDRcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtMDQgKEVuY3J5cHRlZCBEaXJlY3QgTWVzc2FnZXMpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA0Lm1kXG4gKi9cblxuaW1wb3J0IHsgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IGJ5dGVzVG9CYXNlNjQsIGJhc2U2NFRvQnl0ZXMgfSBmcm9tICcuLi9lbmNvZGluZy9iYXNlNjQnO1xuaW1wb3J0IHR5cGUgeyBDcnlwdG9TdWJ0bGUgfSBmcm9tICcuLi9jcnlwdG8nO1xuXG5cbi8vIENvbmZpZ3VyZSBjcnlwdG8gZm9yIE5vZGUuanMgYW5kIHRlc3QgZW52aXJvbm1lbnRzXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG4gIGludGVyZmFjZSBHbG9iYWwge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG59XG5cbmNvbnN0IGdldENyeXB0byA9IGFzeW5jICgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4gPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuICAgIHJldHVybiB3aW5kb3cuY3J5cHRvO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvKSB7XG4gICAgcmV0dXJuIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG87XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBjcnlwdG9Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ2NyeXB0bycpO1xuICAgIGlmIChjcnlwdG9Nb2R1bGUud2ViY3J5cHRvKSB7XG4gICAgICByZXR1cm4gY3J5cHRvTW9kdWxlLndlYmNyeXB0byBhcyBDcnlwdG9TdWJ0bGU7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBsb2dnZXIuZGVidWcoJ05vZGUgY3J5cHRvIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gV2ViQ3J5cHRvIGltcGxlbWVudGF0aW9uIGF2YWlsYWJsZScpO1xufTtcblxuY2xhc3MgQ3J5cHRvSW1wbGVtZW50YXRpb24ge1xuICBwcml2YXRlIGNyeXB0b0luc3RhbmNlOiBDcnlwdG9TdWJ0bGUgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRQcm9taXNlID0gdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jcnlwdG9JbnN0YW5jZSA9IGF3YWl0IGdldENyeXB0bygpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVJbml0aWFsaXplZCgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgaWYgKCF0aGlzLmNyeXB0b0luc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NyeXB0byBpbXBsZW1lbnRhdGlvbiBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3J5cHRvSW5zdGFuY2U7XG4gIH1cblxuICBhc3luYyBnZXRTdWJ0bGUoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGVbJ3N1YnRsZSddPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gIH1cbn1cblxuY29uc3QgY3J5cHRvSW1wbCA9IG5ldyBDcnlwdG9JbXBsZW1lbnRhdGlvbigpO1xuXG5pbnRlcmZhY2UgU2hhcmVkU2VjcmV0IHtcbiAgc2hhcmVkU2VjcmV0OiBVaW50OEFycmF5O1xufVxuXG4vKipcbiAqIEVuY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDQgZW5jcnlwdGlvblxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSBzZW5kZXJQcml2S2V5IC0gU2VuZGVyJ3MgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSByZWNpcGllbnRQdWJLZXkgLSBSZWNpcGllbnQncyBwdWJsaWMga2V5XG4gKiBAcmV0dXJucyBFbmNyeXB0ZWQgbWVzc2FnZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRNZXNzYWdlKFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHNlbmRlclByaXZLZXk6IHN0cmluZyxcbiAgcmVjaXBpZW50UHViS2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgaWYgKCFtZXNzYWdlIHx8ICFzZW5kZXJQcml2S2V5IHx8ICFyZWNpcGllbnRQdWJLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2V5c1xuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChzZW5kZXJQcml2S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBwdWJsaWMga2V5IGlzIGluIGNvcnJlY3QgZm9ybWF0XG4gICAgY29uc3QgcHViS2V5SGV4ID0gcmVjaXBpZW50UHViS2V5LnN0YXJ0c1dpdGgoJzAyJykgfHwgcmVjaXBpZW50UHViS2V5LnN0YXJ0c1dpdGgoJzAzJykgXG4gICAgICA/IHJlY2lwaWVudFB1YktleSBcbiAgICAgIDogJzAyJyArIHJlY2lwaWVudFB1YktleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhzZW5kZXJQcml2S2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpOyAvLyBVc2Ugb25seSB4LWNvb3JkaW5hdGVcblxuICAgIC8vIEltcG9ydCBrZXkgZm9yIEFFU1xuICAgIGNvbnN0IHNoYXJlZEtleSA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICAvLyBHZW5lcmF0ZSBJViBhbmQgZW5jcnlwdFxuICAgIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIGF3YWl0IGNyeXB0b0ltcGwuZ2V0UmFuZG9tVmFsdWVzKGl2KTtcblxuICAgIGNvbnN0IGVuY29kZWQgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIHNoYXJlZEtleSxcbiAgICAgIGVuY29kZWQuYnVmZmVyXG4gICAgKTtcblxuICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIGNvbnN0IGNpcGhlcnRleHRCYXNlNjQgPSBieXRlc1RvQmFzZTY0KG5ldyBVaW50OEFycmF5KGVuY3J5cHRlZCkpO1xuICAgIGNvbnN0IGl2QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChpdik7XG5cbiAgICByZXR1cm4gY2lwaGVydGV4dEJhc2U2NCArICc/aXY9JyArIGl2QmFzZTY0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZW5jcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0IGRlY3J5cHRpb25cbiAqIEBwYXJhbSBlbmNyeXB0ZWRNZXNzYWdlIC0gRW5jcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKiBAcGFyYW0gcmVjaXBpZW50UHJpdktleSAtIFJlY2lwaWVudCdzIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gc2VuZGVyUHViS2V5IC0gU2VuZGVyJ3MgcHVibGljIGtleVxuICogQHJldHVybnMgRGVjcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0TWVzc2FnZShcbiAgZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nLFxuICByZWNpcGllbnRQcml2S2V5OiBzdHJpbmcsXG4gIHNlbmRlclB1YktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGlmICghZW5jcnlwdGVkTWVzc2FnZSB8fCAhcmVjaXBpZW50UHJpdktleSB8fCAhc2VuZGVyUHViS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgcGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtleXNcbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3QocmVjaXBpZW50UHJpdktleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcHVibGljIGtleSBpcyBpbiBjb3JyZWN0IGZvcm1hdFxuICAgIGNvbnN0IHB1YktleUhleCA9IHNlbmRlclB1YktleS5zdGFydHNXaXRoKCcwMicpIHx8IHNlbmRlclB1YktleS5zdGFydHNXaXRoKCcwMycpXG4gICAgICA/IHNlbmRlclB1YktleVxuICAgICAgOiAnMDInICsgc2VuZGVyUHViS2V5O1xuXG4gICAgLy8gR2VuZXJhdGUgc2hhcmVkIHNlY3JldFxuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHJlY2lwaWVudFByaXZLZXkpLCBoZXhUb0J5dGVzKHB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7IC8vIFVzZSBvbmx5IHgtY29vcmRpbmF0ZVxuXG4gICAgLy8gSW1wb3J0IGtleSBmb3IgQUVTXG4gICAgY29uc3Qgc2hhcmVkS2V5ID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAgc2hhcmVkWC5idWZmZXIsXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydkZWNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIFBhcnNlIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIC8vIEFsc28gc3VwcG9ydCBsZWdhY3kgaGV4IGZvcm1hdCAoaXYgKyBjaXBoZXJ0ZXh0IGNvbmNhdGVuYXRlZCkgYXMgZmFsbGJhY2tcbiAgICBsZXQgaXY6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXk7XG5cbiAgICBpZiAoZW5jcnlwdGVkTWVzc2FnZS5pbmNsdWRlcygnP2l2PScpKSB7XG4gICAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0XG4gICAgICBjb25zdCBbY2lwaGVydGV4dEJhc2U2NCwgaXZCYXNlNjRdID0gZW5jcnlwdGVkTWVzc2FnZS5zcGxpdCgnP2l2PScpO1xuICAgICAgY2lwaGVydGV4dCA9IGJhc2U2NFRvQnl0ZXMoY2lwaGVydGV4dEJhc2U2NCk7XG4gICAgICBpdiA9IGJhc2U2NFRvQnl0ZXMoaXZCYXNlNjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWdhY3kgaGV4IGZvcm1hdCBmYWxsYmFjazogZmlyc3QgMTYgYnl0ZXMgYXJlIElWLCByZXN0IGlzIGNpcGhlcnRleHRcbiAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGhleFRvQnl0ZXMoZW5jcnlwdGVkTWVzc2FnZSk7XG4gICAgICBpdiA9IGVuY3J5cHRlZC5zbGljZSgwLCAxNik7XG4gICAgICBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkLnNsaWNlKDE2KTtcbiAgICB9XG5cbiAgICAvLyBEZWNyeXB0XG4gICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmRlY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIHNoYXJlZEtleSxcbiAgICAgIGNpcGhlcnRleHQuYnVmZmVyIGFzIEFycmF5QnVmZmVyXG4gICAgKTtcblxuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGVjcnlwdGVkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGRlY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2hhcmVkIHNlY3JldCBmb3IgTklQLTA0IGVuY3J5cHRpb25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSBwdWJsaWNLZXkgLSBQdWJsaWMga2V5XG4gKiBAcmV0dXJucyBTaGFyZWQgc2VjcmV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNoYXJlZFNlY3JldChcbiAgcHJpdmF0ZUtleTogc3RyaW5nLFxuICBwdWJsaWNLZXk6IHN0cmluZ1xuKTogU2hhcmVkU2VjcmV0IHtcbiAgdHJ5IHtcbiAgICBpZiAoIXByaXZhdGVLZXkgfHwgIXB1YmxpY0tleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBrZXlzXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHByaXZhdGVLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHB1YmxpYyBrZXkgaXMgaW4gY29ycmVjdCBmb3JtYXRcbiAgICBjb25zdCBwdWJLZXlIZXggPSBwdWJsaWNLZXkuc3RhcnRzV2l0aCgnMDInKSB8fCBwdWJsaWNLZXkuc3RhcnRzV2l0aCgnMDMnKVxuICAgICAgPyBwdWJsaWNLZXlcbiAgICAgIDogJzAyJyArIHB1YmxpY0tleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhwcml2YXRlS2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICByZXR1cm4geyBzaGFyZWRTZWNyZXQ6IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKSB9OyAvLyBSZXR1cm4gb25seSB4LWNvb3JkaW5hdGVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdlbmVyYXRlIHNoYXJlZCBzZWNyZXQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgeyBnZW5lcmF0ZVNoYXJlZFNlY3JldCBhcyBjb21wdXRlU2hhcmVkU2VjcmV0IH07XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTAxXG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTAxOiBCYXNpYyBQcm90b2NvbCBGbG93IERlc2NyaXB0aW9uXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgTm9zdHIgZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHBhcmFtZXRlcnMgKE5JUC0wMSlcbiAqIEBwYXJhbSBwYXJhbXMgLSBFdmVudCBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBDcmVhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudChwYXJhbXM6IHtcbiAga2luZDogbnVtYmVyO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXVtdO1xuICBjcmVhdGVkX2F0PzogbnVtYmVyO1xuICBwdWJrZXk/OiBzdHJpbmc7XG59KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHsgXG4gICAga2luZCwgXG4gICAgY29udGVudCwgXG4gICAgdGFncyA9IFtdLCBcbiAgICBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksIFxuICAgIHB1YmtleSA9ICcnIFxuICB9ID0gcGFyYW1zO1xuICBcbiAgcmV0dXJuIHtcbiAgICBraW5kLFxuICAgIGNvbnRlbnQsXG4gICAgdGFncyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHB1YmtleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgTm9zdHIgZXZlbnQgZm9yIHNpZ25pbmcvaGFzaGluZyAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2VyaWFsaXplXG4gKiBAcmV0dXJucyBTZXJpYWxpemVkIGV2ZW50IEpTT04gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFdmVudChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudFxuICBdKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoYXNoIG9mIGEgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEV2ZW50IGhhc2ggaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXZlbnRIYXNoKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICAgIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBldmVudCBoYXNoJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBTaWducyBhIE5vc3RyIGV2ZW50IHdpdGggYSBwcml2YXRlIGtleSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBTaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsIFxuICBwcml2YXRlS2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBnZXRFdmVudEhhc2goZXZlbnQpO1xuICAgIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihoZXhUb0J5dGVzKGhhc2gpLCBoZXhUb0J5dGVzKHByaXZhdGVLZXkpKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogaGFzaCxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWcpLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGUgc2lnbmF0dXJlIG9mIGEgc2lnbmVkIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgc2lnbmF0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICAvLyBWZXJpZnkgZXZlbnQgSURcbiAgICBjb25zdCBleHBlY3RlZElkID0gY2FsY3VsYXRlRXZlbnRJZChldmVudCk7XG4gICAgaWYgKGV2ZW50LmlkICE9PSBleHBlY3RlZElkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHNpZ25hdHVyZVxuICAgIHJldHVybiBzY2hub3JyLnZlcmlmeShcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuc2lnKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuaWQpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5wdWJrZXkpXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldmVudCBJRCBhY2NvcmRpbmcgdG8gTklQLTAxXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBjYWxjdWxhdGUgSUQgZm9yXG4gKiBAcmV0dXJucyBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVFdmVudElkKGV2ZW50OiBOb3N0ckV2ZW50KTogc3RyaW5nIHtcbiAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBzdHJ1Y3R1cmUgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGV2ZW50IHN0cnVjdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudChldmVudDogTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgZXZlbnQuY29udGVudCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBldmVudC5raW5kICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShldmVudC50YWdzKSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZXZlbnQucHVia2V5ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIC8vIFZhbGlkYXRlIHRhZ3Mgc3RydWN0dXJlXG4gICAgZm9yIChjb25zdCB0YWcgb2YgZXZlbnQudGFncykge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRhZykpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0YWcubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHRhZ1swXSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCcpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwgIi8qKlxuICogTklQLTE5OiBiZWNoMzItZW5jb2RlZCBlbnRpdGllc1xuICogSW1wbGVtZW50cyBlbmNvZGluZyBhbmQgZGVjb2Rpbmcgb2YgTm9zdHIgZW50aXRpZXMgdXNpbmcgYmVjaDMyIGZvcm1hdFxuICovXG5cbmltcG9ydCB7IGJlY2gzMiB9IGZyb20gJ2JlY2gzMic7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXInO1xuXG5leHBvcnQgdHlwZSBOaXAxOURhdGFUeXBlID0gJ25wdWInIHwgJ25zZWMnIHwgJ25vdGUnIHwgJ25wcm9maWxlJyB8ICduZXZlbnQnIHwgJ25hZGRyJyB8ICducmVsYXknO1xuXG5jb25zdCBWQUxJRF9QUkVGSVhFUzogTmlwMTlEYXRhVHlwZVtdID0gWyducHViJywgJ25zZWMnLCAnbm90ZScsICducHJvZmlsZScsICduZXZlbnQnLCAnbmFkZHInLCAnbnJlbGF5J107XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmlwMTlEYXRhIHtcbiAgdHlwZTogTmlwMTlEYXRhVHlwZTtcbiAgZGF0YTogc3RyaW5nO1xuICByZWxheXM/OiBzdHJpbmdbXTtcbiAgYXV0aG9yPzogc3RyaW5nO1xuICBraW5kPzogbnVtYmVyO1xuICBpZGVudGlmaWVyPzogc3RyaW5nOyAvLyBGb3IgbmFkZHJcbn1cblxuLy8gVExWIHR5cGUgY29uc3RhbnRzXG5jb25zdCBUTFZfVFlQRVMgPSB7XG4gIFNQRUNJQUw6IDAsICAgLy8gTWFpbiBkYXRhIChoZXgpXG4gIFJFTEFZOiAxLCAgICAgLy8gUmVsYXkgVVJMICh1dGY4KVxuICBBVVRIT1I6IDIsICAgIC8vIEF1dGhvciBwdWJrZXkgKGhleClcbiAgS0lORDogMywgICAgICAvLyBFdmVudCBraW5kICh1aW50OClcbiAgSURFTlRJRklFUjogNCAvLyBJZGVudGlmaWVyICh1dGY4KVxufSBhcyBjb25zdDtcblxuLyoqXG4gKiBFbmNvZGUgYSBwdWJsaWMga2V5IGFzIGFuIG5wdWJcbiAqIEBwYXJhbSBwdWJrZXkgUHVibGljIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucHViIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHB1YmtleSBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucHViRW5jb2RlKHB1YmtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShwdWJrZXksICdoZXgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25wdWInLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgcHJpdmF0ZSBrZXkgYXMgYW4gbnNlY1xuICogQHBhcmFtIHByaXZrZXkgUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnNlYyBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwcml2a2V5IGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5zZWNFbmNvZGUocHJpdmtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHJpdmtleSwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20ocHJpdmtleSwgJ2hleCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnNlYycsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gZXZlbnQgSUQgYXMgYSBub3RlXG4gKiBAcGFyYW0gZXZlbnRJZCBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBub3RlIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIGV2ZW50SWQgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm90ZUVuY29kZShldmVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhldmVudElkLCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShldmVudElkLCAnaGV4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCdub3RlJywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBwcm9maWxlIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gcHVia2V5IFB1YmxpYyBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucHJvZmlsZSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwdWJrZXkgaXMgaW52YWxpZCBvciByZWxheXMgYXJlIG1hbGZvcm1lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnByb2ZpbGVFbmNvZGUocHVia2V5OiBzdHJpbmcsIHJlbGF5cz86IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGlmIChyZWxheXMpIHtcbiAgICByZWxheXMuZm9yRWFjaCh2YWxpZGF0ZVJlbGF5VXJsKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICducHJvZmlsZScsXG4gICAgZGF0YTogcHVia2V5LFxuICAgIHJlbGF5c1xuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25wcm9maWxlJywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGV2ZW50IGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gZXZlbnRJZCBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKiBAcGFyYW0gcmVsYXlzIE9wdGlvbmFsIHJlbGF5IFVSTHNcbiAqIEBwYXJhbSBhdXRob3IgT3B0aW9uYWwgYXV0aG9yIHB1YmxpYyBrZXlcbiAqIEBwYXJhbSBraW5kIE9wdGlvbmFsIGV2ZW50IGtpbmRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5ldmVudCBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXZlbnRFbmNvZGUoXG4gIGV2ZW50SWQ6IHN0cmluZyxcbiAgcmVsYXlzPzogc3RyaW5nW10sXG4gIGF1dGhvcj86IHN0cmluZyxcbiAga2luZD86IG51bWJlclxuKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcoZXZlbnRJZCwgNjQpO1xuICBpZiAocmVsYXlzKSB7XG4gICAgcmVsYXlzLmZvckVhY2godmFsaWRhdGVSZWxheVVybCk7XG4gIH1cbiAgaWYgKGF1dGhvcikge1xuICAgIHZhbGlkYXRlSGV4U3RyaW5nKGF1dGhvciwgNjQpO1xuICB9XG4gIGlmIChraW5kICE9PSB1bmRlZmluZWQgJiYgIU51bWJlci5pc0ludGVnZXIoa2luZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZXZlbnQga2luZCcpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25ldmVudCcsXG4gICAgZGF0YTogZXZlbnRJZCxcbiAgICByZWxheXMsXG4gICAgYXV0aG9yLFxuICAgIGtpbmRcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCduZXZlbnQnLCBkYXRhLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gYWRkcmVzcyAoTklQLTMzKVxuICogQHBhcmFtIHB1YmtleSBBdXRob3IncyBwdWJsaWMga2V5XG4gKiBAcGFyYW0ga2luZCBFdmVudCBraW5kXG4gKiBAcGFyYW0gaWRlbnRpZmllciBTdHJpbmcgaWRlbnRpZmllclxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuYWRkciBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYWRkckVuY29kZShcbiAgcHVia2V5OiBzdHJpbmcsXG4gIGtpbmQ6IG51bWJlcixcbiAgaWRlbnRpZmllcjogc3RyaW5nLFxuICByZWxheXM/OiBzdHJpbmdbXVxuKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGlmICghTnVtYmVyLmlzSW50ZWdlcihraW5kKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBldmVudCBraW5kJyk7XG4gIH1cbiAgaWYgKCFpZGVudGlmaWVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJZGVudGlmaWVyIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKHJlbGF5cykge1xuICAgIHJlbGF5cy5mb3JFYWNoKHZhbGlkYXRlUmVsYXlVcmwpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25hZGRyJyxcbiAgICBkYXRhOiBwdWJrZXksXG4gICAga2luZCxcbiAgICBpZGVudGlmaWVyLFxuICAgIHJlbGF5c1xuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25hZGRyJywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgcmVsYXkgVVJMXG4gKiBAcGFyYW0gdXJsIFJlbGF5IFVSTFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnJlbGF5IHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIFVSTCBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucmVsYXlFbmNvZGUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVJlbGF5VXJsKHVybCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbSh1cmwsICd1dGY4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducmVsYXknLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgYmVjaDMyLWVuY29kZWQgTm9zdHIgZW50aXR5XG4gKiBAcGFyYW0gc3RyIGJlY2gzMi1lbmNvZGVkIHN0cmluZ1xuICogQHJldHVybnMgRGVjb2RlZCBkYXRhIHdpdGggdHlwZSBhbmQgbWV0YWRhdGFcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBzdHJpbmcgaXMgaW52YWxpZCBvciBtYWxmb3JtZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShzdHI6IHN0cmluZyk6IE5pcDE5RGF0YSB7XG4gIGlmICghc3RyLmluY2x1ZGVzKCcxJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmVjaDMyIHN0cmluZycpO1xuICB9XG5cbiAgY29uc3QgcHJlZml4ID0gc3RyLnNwbGl0KCcxJylbMF0udG9Mb3dlckNhc2UoKTtcbiAgaWYgKCFWQUxJRF9QUkVGSVhFUy5pbmNsdWRlcyhwcmVmaXggYXMgTmlwMTlEYXRhVHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJlZml4Jyk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRlY29kZWQgPSBiZWNoMzIuZGVjb2RlKHN0ciwgMTAwMCk7XG4gICAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKGJlY2gzMi5mcm9tV29yZHMoZGVjb2RlZC53b3JkcykpO1xuXG4gICAgLy8gRm9yIG5yZWxheSB0eXBlXG4gICAgbGV0IHVybDogc3RyaW5nO1xuICAgIC8vIEZvciBUTFYgdHlwZXNcbiAgICBsZXQgZGVjb2RlZERhdGE6IE5pcDE5RGF0YTtcblxuICAgIHN3aXRjaCAoZGVjb2RlZC5wcmVmaXgpIHtcbiAgICAgIGNhc2UgJ25wdWInOlxuICAgICAgY2FzZSAnbnNlYyc6XG4gICAgICBjYXNlICdub3RlJzpcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcoZGF0YS50b1N0cmluZygnaGV4JyksIDY0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBkZWNvZGVkLnByZWZpeCBhcyBOaXAxOURhdGFUeXBlLFxuICAgICAgICAgIGRhdGE6IGRhdGEudG9TdHJpbmcoJ2hleCcpXG4gICAgICAgIH07XG4gICAgICBjYXNlICducmVsYXknOlxuICAgICAgICB1cmwgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIHZhbGlkYXRlUmVsYXlVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnbnJlbGF5JyxcbiAgICAgICAgICBkYXRhOiB1cmxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ25wcm9maWxlJzpcbiAgICAgIGNhc2UgJ25ldmVudCc6XG4gICAgICBjYXNlICduYWRkcic6XG4gICAgICAgIGRlY29kZWREYXRhID0gZGVjb2RlVExWKGRlY29kZWQucHJlZml4IGFzIE5pcDE5RGF0YVR5cGUsIGRhdGEpO1xuICAgICAgICByZXR1cm4gZGVjb2RlZERhdGE7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJlZml4Jyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJlY2gzMiBzdHJpbmcnKTtcbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbmZ1bmN0aW9uIHZhbGlkYXRlSGV4U3RyaW5nKHN0cjogc3RyaW5nLCBsZW5ndGg/OiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCEvXlswLTlhLWZBLUZdKyQvLnRlc3Qoc3RyKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGxlbmd0aCAmJiBzdHIubGVuZ3RoICE9PSBsZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgaGV4IHN0cmluZyBsZW5ndGggKGV4cGVjdGVkICR7bGVuZ3RofSlgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVJlbGF5VXJsKHVybDogc3RyaW5nKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIGlmICghWyd3czonLCAnd3NzOiddLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxheSBVUkwgcHJvdG9jb2wnKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxheSBVUkwnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGVUTFYoZGF0YTogTmlwMTlEYXRhKTogbnVtYmVyW10ge1xuICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XG4gIFxuICAvLyBTcGVjaWFsICh0eXBlIDApOiBtYWluIGRhdGFcbiAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuZnJvbShkYXRhLmRhdGEsICdoZXgnKTtcbiAgcmVzdWx0LnB1c2goVExWX1RZUEVTLlNQRUNJQUwsIGJ5dGVzLmxlbmd0aCk7XG4gIHJlc3VsdC5wdXNoKC4uLmJ5dGVzKTtcblxuICAvLyBSZWxheSAodHlwZSAxKTogcmVsYXkgVVJMc1xuICBpZiAoZGF0YS5yZWxheXM/Lmxlbmd0aCkge1xuICAgIGZvciAoY29uc3QgcmVsYXkgb2YgZGF0YS5yZWxheXMpIHtcbiAgICAgIGNvbnN0IHJlbGF5Qnl0ZXMgPSBCdWZmZXIuZnJvbShyZWxheSwgJ3V0ZjgnKTtcbiAgICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5SRUxBWSwgcmVsYXlCeXRlcy5sZW5ndGgpO1xuICAgICAgcmVzdWx0LnB1c2goLi4ucmVsYXlCeXRlcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQXV0aG9yICh0eXBlIDIpOiBhdXRob3IgcHVia2V5XG4gIGlmIChkYXRhLmF1dGhvcikge1xuICAgIGNvbnN0IGF1dGhvckJ5dGVzID0gQnVmZmVyLmZyb20oZGF0YS5hdXRob3IsICdoZXgnKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuQVVUSE9SLCBhdXRob3JCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmF1dGhvckJ5dGVzKTtcbiAgfVxuXG4gIC8vIEtpbmQgKHR5cGUgMyk6IGV2ZW50IGtpbmRcbiAgaWYgKGRhdGEua2luZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2luZEJ5dGVzID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGtpbmRCeXRlcy53cml0ZVVJbnQzMkJFKGRhdGEua2luZCk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLktJTkQsIGtpbmRCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmtpbmRCeXRlcyk7XG4gIH1cblxuICAvLyBJZGVudGlmaWVyICh0eXBlIDQpOiBmb3IgbmFkZHJcbiAgaWYgKGRhdGEuaWRlbnRpZmllcikge1xuICAgIGNvbnN0IGlkZW50aWZpZXJCeXRlcyA9IEJ1ZmZlci5mcm9tKGRhdGEuaWRlbnRpZmllciwgJ3V0ZjgnKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuSURFTlRJRklFUiwgaWRlbnRpZmllckJ5dGVzLmxlbmd0aCk7XG4gICAgcmVzdWx0LnB1c2goLi4uaWRlbnRpZmllckJ5dGVzKTtcbiAgfVxuXG4gIHJldHVybiBiZWNoMzIudG9Xb3JkcyhCdWZmZXIuZnJvbShyZXN1bHQpKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVExWKHByZWZpeDogTmlwMTlEYXRhVHlwZSwgZGF0YTogQnVmZmVyKTogTmlwMTlEYXRhIHtcbiAgY29uc3QgcmVzdWx0OiBOaXAxOURhdGEgPSB7XG4gICAgdHlwZTogcHJlZml4LFxuICAgIGRhdGE6ICcnLFxuICAgIHJlbGF5czogW11cbiAgfTtcblxuICBsZXQgaSA9IDA7XG4gIC8vIEZvciByZWxheSB0eXBlXG4gIGxldCByZWxheTogc3RyaW5nO1xuXG4gIHdoaWxlIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICBjb25zdCB0eXBlID0gZGF0YVtpXTtcbiAgICBjb25zdCBsZW5ndGggPSBkYXRhW2kgKyAxXTtcbiAgICBcbiAgICBpZiAoaSArIDIgKyBsZW5ndGggPiBkYXRhLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFRMViBkYXRhJyk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHZhbHVlID0gZGF0YS5zbGljZShpICsgMiwgaSArIDIgKyBsZW5ndGgpO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5TUEVDSUFMOlxuICAgICAgICByZXN1bHQuZGF0YSA9IHZhbHVlLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcocmVzdWx0LmRhdGEsIDY0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5SRUxBWTpcbiAgICAgICAgcmVsYXkgPSB2YWx1ZS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICB2YWxpZGF0ZVJlbGF5VXJsKHJlbGF5KTtcbiAgICAgICAgcmVzdWx0LnJlbGF5cyA9IHJlc3VsdC5yZWxheXMgfHwgW107XG4gICAgICAgIHJlc3VsdC5yZWxheXMucHVzaChyZWxheSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuQVVUSE9SOlxuICAgICAgICByZXN1bHQuYXV0aG9yID0gdmFsdWUudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICB2YWxpZGF0ZUhleFN0cmluZyhyZXN1bHQuYXV0aG9yLCA2NCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuS0lORDpcbiAgICAgICAgcmVzdWx0LmtpbmQgPSB2YWx1ZS5yZWFkVUludDMyQkUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5JREVOVElGSUVSOlxuICAgICAgICByZXN1bHQuaWRlbnRpZmllciA9IHZhbHVlLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gU2tpcCB1bmtub3duIFRMViB0eXBlc1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpICs9IDIgKyBsZW5ndGg7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwgIi8qKlxuICogTklQLTI2OiBEZWxlZ2F0ZWQgRXZlbnQgU2lnbmluZ1xuICogSW1wbGVtZW50cyBkZWxlZ2F0aW9uIG9mIGV2ZW50IHNpZ25pbmcgY2FwYWJpbGl0aWVzXG4gKi9cblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IE5vc3RyRXZlbnQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBzaWduU2Nobm9yciwgdmVyaWZ5U2Nobm9yclNpZ25hdHVyZSB9IGZyb20gJy4uL2NyeXB0byc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlbGVnYXRpb25Db25kaXRpb25zIHtcbiAga2luZD86IG51bWJlcjtcbiAgc2luY2U/OiBudW1iZXI7XG4gIHVudGlsPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbGVnYXRpb24ge1xuICBkZWxlZ2F0b3I6IHN0cmluZztcbiAgZGVsZWdhdGVlOiBzdHJpbmc7XG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zO1xuICB0b2tlbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlbGVnYXRpb24gdG9rZW5cbiAqIEBwYXJhbSBkZWxlZ2F0b3JQcml2YXRlS2V5IERlbGVnYXRvcidzIHByaXZhdGUga2V5ICh1c2VkIGZvciBzaWduaW5nIG9ubHksIG5ldmVyIHJldHVybmVkKVxuICogQHBhcmFtIGRlbGVnYXRlZSBEZWxlZ2F0ZWUncyBwdWJsaWMga2V5XG4gKiBAcGFyYW0gY29uZGl0aW9ucyBEZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEByZXR1cm5zIERlbGVnYXRpb24gdG9rZW4gKGRlbGVnYXRvciBmaWVsZCBjb250YWlucyB0aGUgUFVCTElDIGtleSwgbm90IHRoZSBwcml2YXRlIGtleSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbGVnYXRpb24oXG4gIGRlbGVnYXRvclByaXZhdGVLZXk6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zXG4pOiBEZWxlZ2F0aW9uIHtcbiAgY29uc3QgY29uZGl0aW9uc1N0cmluZyA9IHNlcmlhbGl6ZUNvbmRpdGlvbnMoY29uZGl0aW9ucyk7XG4gIGNvbnN0IHRva2VuID0gc2lnbkRlbGVnYXRpb24oZGVsZWdhdG9yUHJpdmF0ZUtleSwgZGVsZWdhdGVlLCBjb25kaXRpb25zU3RyaW5nKTtcblxuICAvLyBEZXJpdmUgdGhlIHB1YmxpYyBrZXkgZnJvbSB0aGUgcHJpdmF0ZSBrZXkgXHUyMDE0IE5FVkVSIHJldHVybiB0aGUgcHJpdmF0ZSBrZXlcbiAgY29uc3QgZGVsZWdhdG9yUHVibGljS2V5ID0gYnl0ZXNUb0hleChzY2hub3JyLmdldFB1YmxpY0tleShoZXhUb0J5dGVzKGRlbGVnYXRvclByaXZhdGVLZXkpKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkZWxlZ2F0b3I6IGRlbGVnYXRvclB1YmxpY0tleSxcbiAgICBkZWxlZ2F0ZWUsXG4gICAgY29uZGl0aW9ucyxcbiAgICB0b2tlblxuICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIGRlbGVnYXRpb24gdG9rZW5cbiAqIEBwYXJhbSBkZWxlZ2F0aW9uIERlbGVnYXRpb24gdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeURlbGVnYXRpb24oZGVsZWdhdGlvbjogRGVsZWdhdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBjb25kaXRpb25zU3RyaW5nID0gc2VyaWFsaXplQ29uZGl0aW9ucyhkZWxlZ2F0aW9uLmNvbmRpdGlvbnMpO1xuICByZXR1cm4gYXdhaXQgdmVyaWZ5RGVsZWdhdGlvblNpZ25hdHVyZShcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRvcixcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRlZSxcbiAgICBjb25kaXRpb25zU3RyaW5nLFxuICAgIGRlbGVnYXRpb24udG9rZW5cbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhbiBldmVudCBtZWV0cyBkZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBjaGVja1xuICogQHBhcmFtIGNvbmRpdGlvbnMgRGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcmV0dXJucyBUcnVlIGlmIGNvbmRpdGlvbnMgYXJlIG1ldFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEZWxlZ2F0aW9uQ29uZGl0aW9ucyhcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsXG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zXG4pOiBib29sZWFuIHtcbiAgaWYgKGNvbmRpdGlvbnMua2luZCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmtpbmQgIT09IGNvbmRpdGlvbnMua2luZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb25kaXRpb25zLnNpbmNlICE9PSB1bmRlZmluZWQgJiYgZXZlbnQuY3JlYXRlZF9hdCA8IGNvbmRpdGlvbnMuc2luY2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29uZGl0aW9ucy51bnRpbCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmNyZWF0ZWRfYXQgPiBjb25kaXRpb25zLnVudGlsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQWRkIGRlbGVnYXRpb24gdGFnIHRvIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gYWRkIGRlbGVnYXRpb24gdG9cbiAqIEBwYXJhbSBkZWxlZ2F0aW9uIERlbGVnYXRpb24gdG8gYWRkXG4gKiBAcmV0dXJucyBVcGRhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWxlZ2F0aW9uVGFnKFxuICBldmVudDogTm9zdHJFdmVudCxcbiAgZGVsZWdhdGlvbjogRGVsZWdhdGlvblxuKTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHRhZyA9IFtcbiAgICAnZGVsZWdhdGlvbicsXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0b3IsXG4gICAgc2VyaWFsaXplQ29uZGl0aW9ucyhkZWxlZ2F0aW9uLmNvbmRpdGlvbnMpLFxuICAgIGRlbGVnYXRpb24udG9rZW5cbiAgXTtcblxuICByZXR1cm4ge1xuICAgIC4uLmV2ZW50LFxuICAgIHRhZ3M6IFsuLi5ldmVudC50YWdzLCB0YWddXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBkZWxlZ2F0aW9uIGZyb20gYW4gZXZlbnRcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBleHRyYWN0IGRlbGVnYXRpb24gZnJvbVxuICogQHJldHVybnMgRGVsZWdhdGlvbiBvciBudWxsIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdERlbGVnYXRpb24oZXZlbnQ6IE5vc3RyRXZlbnQpOiBEZWxlZ2F0aW9uIHwgbnVsbCB7XG4gIGNvbnN0IHRhZyA9IGV2ZW50LnRhZ3MuZmluZCh0ID0+IHRbMF0gPT09ICdkZWxlZ2F0aW9uJyk7XG4gIGlmICghdGFnIHx8IHRhZy5sZW5ndGggIT09IDQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGVsZWdhdG9yOiB0YWdbMV0sXG4gICAgZGVsZWdhdGVlOiBldmVudC5wdWJrZXksXG4gICAgY29uZGl0aW9uczogcGFyc2VDb25kaXRpb25zKHRhZ1syXSksXG4gICAgdG9rZW46IHRhZ1szXVxuICB9O1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBzZXJpYWxpemVDb25kaXRpb25zKGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKGNvbmRpdGlvbnMua2luZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChga2luZD0ke2NvbmRpdGlvbnMua2luZH1gKTtcbiAgfVxuICBpZiAoY29uZGl0aW9ucy5zaW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChgY3JlYXRlZF9hdD4ke2NvbmRpdGlvbnMuc2luY2V9YCk7XG4gIH1cbiAgaWYgKGNvbmRpdGlvbnMudW50aWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGNyZWF0ZWRfYXQ8JHtjb25kaXRpb25zLnVudGlsfWApO1xuICB9XG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyYnKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kaXRpb25zKGNvbmRpdGlvbnNTdHJpbmc6IHN0cmluZyk6IERlbGVnYXRpb25Db25kaXRpb25zIHtcbiAgY29uc3QgY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnMgPSB7fTtcbiAgY29uc3QgcGFydHMgPSBjb25kaXRpb25zU3RyaW5nLnNwbGl0KCcmJyk7XG5cbiAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgaWYgKHBhcnQuc3RhcnRzV2l0aCgna2luZD0nKSkge1xuICAgICAgY29uZGl0aW9ucy5raW5kID0gcGFyc2VJbnQocGFydC5zbGljZSg1KSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2NyZWF0ZWRfYXQ+JykpIHtcbiAgICAgIGNvbmRpdGlvbnMuc2luY2UgPSBwYXJzZUludChwYXJ0LnNsaWNlKDExKSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2NyZWF0ZWRfYXQ8JykpIHtcbiAgICAgIGNvbmRpdGlvbnMudW50aWwgPSBwYXJzZUludChwYXJ0LnNsaWNlKDExKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmRpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHNpZ25EZWxlZ2F0aW9uKFxuICBkZWxlZ2F0b3I6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IHN0cmluZ1xuKTogc3RyaW5nIHtcbiAgY29uc3QgbWVzc2FnZSA9IGBub3N0cjpkZWxlZ2F0aW9uOiR7ZGVsZWdhdGVlfToke2NvbmRpdGlvbnN9YDtcbiAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSkpO1xuICBjb25zdCBzaWduYXR1cmUgPSBzaWduU2Nobm9ycihoYXNoLCBoZXhUb0J5dGVzKGRlbGVnYXRvcikpO1xuICByZXR1cm4gYnl0ZXNUb0hleChzaWduYXR1cmUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB2ZXJpZnlEZWxlZ2F0aW9uU2lnbmF0dXJlKFxuICBkZWxlZ2F0b3I6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IHN0cmluZyxcbiAgc2lnbmF0dXJlOiBzdHJpbmdcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBtc2dIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShgbm9zdHI6ZGVsZWdhdGlvbjoke2RlbGVnYXRlZX06JHtjb25kaXRpb25zfWApKTtcblxuICByZXR1cm4gdmVyaWZ5U2Nobm9yclNpZ25hdHVyZShoZXhUb0J5dGVzKHNpZ25hdHVyZSksIG1zZ0hhc2gsIGhleFRvQnl0ZXMoZGVsZWdhdG9yKSk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ0XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ0IChWZXJzaW9uZWQgRW5jcnlwdGVkIFBheWxvYWRzKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80NC5tZFxuICovXG5cbmltcG9ydCB7IGNoYWNoYTIwIH0gZnJvbSAnQG5vYmxlL2NpcGhlcnMvY2hhY2hhLmpzJztcbmltcG9ydCB7IGVxdWFsQnl0ZXMgfSBmcm9tICdAbm9ibGUvY2lwaGVycy91dGlscy5qcyc7XG5pbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBleHRyYWN0IGFzIGhrZGZfZXh0cmFjdCwgZXhwYW5kIGFzIGhrZGZfZXhwYW5kIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9oa2RmLmpzJztcbmltcG9ydCB7IGhtYWMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2htYWMuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGNvbmNhdEJ5dGVzLCBoZXhUb0J5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgYmFzZTY0IH0gZnJvbSAnQHNjdXJlL2Jhc2UnO1xuXG5jb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuY29uc3QgdXRmOERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuY29uc3QgbWluUGxhaW50ZXh0U2l6ZSA9IDE7XG5jb25zdCBtYXhQbGFpbnRleHRTaXplID0gNjU1MzU7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHBhZGRlZCBsZW5ndGggZm9yIE5JUC00NCBtZXNzYWdlIHBhZGRpbmdcbiAqL1xuZnVuY3Rpb24gY2FsY1BhZGRlZExlbihsZW46IG51bWJlcik6IG51bWJlciB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIobGVuKSB8fCBsZW4gPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHBvc2l0aXZlIGludGVnZXInKTtcbiAgaWYgKGxlbiA8PSAzMikgcmV0dXJuIDMyO1xuICBjb25zdCBuZXh0UG93ZXIgPSAxIDw8IChNYXRoLmZsb29yKE1hdGgubG9nMihsZW4gLSAxKSkgKyAxKTtcbiAgY29uc3QgY2h1bmsgPSBuZXh0UG93ZXIgPD0gMjU2ID8gMzIgOiBuZXh0UG93ZXIgLyA4O1xuICByZXR1cm4gY2h1bmsgKiAoTWF0aC5mbG9vcigobGVuIC0gMSkgLyBjaHVuaykgKyAxKTtcbn1cblxuLyoqXG4gKiBQYWQgcGxhaW50ZXh0IHBlciBOSVAtNDQgc3BlY1xuICovXG5mdW5jdGlvbiBwYWQocGxhaW50ZXh0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgdW5wYWRkZWQgPSB1dGY4RW5jb2Rlci5lbmNvZGUocGxhaW50ZXh0KTtcbiAgY29uc3QgdW5wYWRkZWRMZW4gPSB1bnBhZGRlZC5sZW5ndGg7XG4gIGlmICh1bnBhZGRlZExlbiA8IG1pblBsYWludGV4dFNpemUgfHwgdW5wYWRkZWRMZW4gPiBtYXhQbGFpbnRleHRTaXplKVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwbGFpbnRleHQgbGVuZ3RoOiBtdXN0IGJlIGJldHdlZW4gMSBhbmQgNjU1MzUgYnl0ZXMnKTtcbiAgY29uc3QgcHJlZml4ID0gbmV3IFVpbnQ4QXJyYXkoMik7XG4gIG5ldyBEYXRhVmlldyhwcmVmaXguYnVmZmVyKS5zZXRVaW50MTYoMCwgdW5wYWRkZWRMZW4sIGZhbHNlKTsgLy8gYmlnLWVuZGlhblxuICBjb25zdCBzdWZmaXggPSBuZXcgVWludDhBcnJheShjYWxjUGFkZGVkTGVuKHVucGFkZGVkTGVuKSAtIHVucGFkZGVkTGVuKTtcbiAgcmV0dXJuIGNvbmNhdEJ5dGVzKHByZWZpeCwgdW5wYWRkZWQsIHN1ZmZpeCk7XG59XG5cbi8qKlxuICogVW5wYWQgZGVjcnlwdGVkIG1lc3NhZ2UgcGVyIE5JUC00NCBzcGVjXG4gKi9cbmZ1bmN0aW9uIHVucGFkKHBhZGRlZDogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IHVucGFkZGVkTGVuID0gbmV3IERhdGFWaWV3KHBhZGRlZC5idWZmZXIsIHBhZGRlZC5ieXRlT2Zmc2V0KS5nZXRVaW50MTYoMCwgZmFsc2UpO1xuICBjb25zdCB1bnBhZGRlZCA9IHBhZGRlZC5zdWJhcnJheSgyLCAyICsgdW5wYWRkZWRMZW4pO1xuICBpZiAoXG4gICAgdW5wYWRkZWRMZW4gPCBtaW5QbGFpbnRleHRTaXplIHx8XG4gICAgdW5wYWRkZWRMZW4gPiBtYXhQbGFpbnRleHRTaXplIHx8XG4gICAgdW5wYWRkZWQubGVuZ3RoICE9PSB1bnBhZGRlZExlbiB8fFxuICAgIHBhZGRlZC5sZW5ndGggIT09IDIgKyBjYWxjUGFkZGVkTGVuKHVucGFkZGVkTGVuKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGFkZGluZycpO1xuICB9XG4gIHJldHVybiB1dGY4RGVjb2Rlci5kZWNvZGUodW5wYWRkZWQpO1xufVxuXG4vKipcbiAqIERlcml2ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gcHJpdmF0ZSBrZXkgYW5kIHB1YmxpYyBrZXkgdXNpbmcgRUNESCArIEhLREZcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udmVyc2F0aW9uS2V5KHByaXZrZXlBOiBVaW50OEFycmF5LCBwdWJrZXlCOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KHByaXZrZXlBLCBoZXhUb0J5dGVzKCcwMicgKyBwdWJrZXlCKSk7XG4gIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zdWJhcnJheSgxLCAzMyk7XG4gIHJldHVybiBoa2RmX2V4dHJhY3Qoc2hhMjU2LCBzaGFyZWRYLCB1dGY4RW5jb2Rlci5lbmNvZGUoJ25pcDQ0LXYyJykpO1xufVxuXG4vKipcbiAqIERlcml2ZSBtZXNzYWdlIGtleXMgKGNoYWNoYSBrZXksIGNoYWNoYSBub25jZSwgaG1hYyBrZXkpIGZyb20gY29udmVyc2F0aW9uIGtleSBhbmQgbm9uY2VcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5LCBub25jZTogVWludDhBcnJheSk6IHtcbiAgY2hhY2hhX2tleTogVWludDhBcnJheTtcbiAgY2hhY2hhX25vbmNlOiBVaW50OEFycmF5O1xuICBobWFjX2tleTogVWludDhBcnJheTtcbn0ge1xuICBjb25zdCBrZXlzID0gaGtkZl9leHBhbmQoc2hhMjU2LCBjb252ZXJzYXRpb25LZXksIG5vbmNlLCA3Nik7XG4gIHJldHVybiB7XG4gICAgY2hhY2hhX2tleToga2V5cy5zdWJhcnJheSgwLCAzMiksXG4gICAgY2hhY2hhX25vbmNlOiBrZXlzLnN1YmFycmF5KDMyLCA0NCksXG4gICAgaG1hY19rZXk6IGtleXMuc3ViYXJyYXkoNDQsIDc2KSxcbiAgfTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IHBsYWludGV4dCB1c2luZyBOSVAtNDQgdjJcbiAqIEBwYXJhbSBwbGFpbnRleHQgLSBUaGUgbWVzc2FnZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gY29udmVyc2F0aW9uS2V5IC0gMzItYnl0ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gZ2V0Q29udmVyc2F0aW9uS2V5XG4gKiBAcGFyYW0gbm9uY2UgLSBPcHRpb25hbCAzMi1ieXRlIG5vbmNlIChyYW5kb20gaWYgbm90IHByb3ZpZGVkKVxuICogQHJldHVybnMgQmFzZTY0LWVuY29kZWQgZW5jcnlwdGVkIHBheWxvYWRcbiAqL1xuZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQ6IHN0cmluZywgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5LCBub25jZTogVWludDhBcnJheSA9IHJhbmRvbUJ5dGVzKDMyKSk6IHN0cmluZyB7XG4gIGNvbnN0IHsgY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBobWFjX2tleSB9ID0gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5LCBub25jZSk7XG4gIGNvbnN0IHBhZGRlZCA9IHBhZChwbGFpbnRleHQpO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gY2hhY2hhMjAoY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBwYWRkZWQpO1xuICBjb25zdCBtYWMgPSBobWFjKHNoYTI1NiwgaG1hY19rZXksIGNvbmNhdEJ5dGVzKG5vbmNlLCBjaXBoZXJ0ZXh0KSk7XG4gIHJldHVybiBiYXNlNjQuZW5jb2RlKGNvbmNhdEJ5dGVzKG5ldyBVaW50OEFycmF5KFsyXSksIG5vbmNlLCBjaXBoZXJ0ZXh0LCBtYWMpKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgTklQLTQ0IHYyIHBheWxvYWRcbiAqIEBwYXJhbSBwYXlsb2FkIC0gQmFzZTY0LWVuY29kZWQgZW5jcnlwdGVkIHBheWxvYWRcbiAqIEBwYXJhbSBjb252ZXJzYXRpb25LZXkgLSAzMi1ieXRlIGNvbnZlcnNhdGlvbiBrZXkgZnJvbSBnZXRDb252ZXJzYXRpb25LZXlcbiAqIEByZXR1cm5zIERlY3J5cHRlZCBwbGFpbnRleHQgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGRlY3J5cHQocGF5bG9hZDogc3RyaW5nLCBjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gYmFzZTY0LmRlY29kZShwYXlsb2FkKTtcbiAgY29uc3QgdmVyc2lvbiA9IGRhdGFbMF07XG4gIGlmICh2ZXJzaW9uICE9PSAyKSB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gZW5jcnlwdGlvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gIGlmIChkYXRhLmxlbmd0aCA8IDk5IHx8IGRhdGEubGVuZ3RoID4gNjU2MDMpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwYXlsb2FkIHNpemUnKTtcbiAgY29uc3Qgbm9uY2UgPSBkYXRhLnN1YmFycmF5KDEsIDMzKTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGRhdGEuc3ViYXJyYXkoMzMsIGRhdGEubGVuZ3RoIC0gMzIpO1xuICBjb25zdCBtYWMgPSBkYXRhLnN1YmFycmF5KGRhdGEubGVuZ3RoIC0gMzIpO1xuICBjb25zdCB7IGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgaG1hY19rZXkgfSA9IGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleSwgbm9uY2UpO1xuICBjb25zdCBleHBlY3RlZE1hYyA9IGhtYWMoc2hhMjU2LCBobWFjX2tleSwgY29uY2F0Qnl0ZXMobm9uY2UsIGNpcGhlcnRleHQpKTtcbiAgaWYgKCFlcXVhbEJ5dGVzKG1hYywgZXhwZWN0ZWRNYWMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgTUFDJyk7XG4gIGNvbnN0IHBhZGRlZCA9IGNoYWNoYTIwKGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgY2lwaGVydGV4dCk7XG4gIHJldHVybiB1bnBhZChwYWRkZWQpO1xufVxuXG4vKipcbiAqIHYyIEFQSSBvYmplY3QgbWF0Y2hpbmcgbm9zdHItdG9vbHMgc2hhcGUgZm9yIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGNvbnN0IHYyID0ge1xuICB1dGlsczoge1xuICAgIGdldENvbnZlcnNhdGlvbktleSxcbiAgICBjYWxjUGFkZGVkTGVuLFxuICB9LFxuICBlbmNyeXB0LFxuICBkZWNyeXB0LFxufTtcblxuZXhwb3J0IHsgZ2V0Q29udmVyc2F0aW9uS2V5LCBlbmNyeXB0LCBkZWNyeXB0LCBjYWxjUGFkZGVkTGVuIH07XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ2XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ2IChOb3N0ciBDb25uZWN0IC8gUmVtb3RlIFNpZ25pbmcpXG4gKlxuICogUHVyZSBwcm90b2NvbCBsYXllciBcdTIwMTQgY3J5cHRvLCBlbmNvZGluZywgbWVzc2FnZSBmb3JtYXR0aW5nLlxuICogTm8gV2ViU29ja2V0LCBubyByZWxheSBjb25uZWN0aW9ucywgbm8gSS9PLlxuICogQ29uc3VtZXJzIHByb3ZpZGUgdGhlaXIgb3duIHRyYW5zcG9ydC5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHtcbiAgZ2V0Q29udmVyc2F0aW9uS2V5IGFzIG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5LFxuICBlbmNyeXB0IGFzIG5pcDQ0RW5jcnlwdCxcbiAgZGVjcnlwdCBhcyBuaXA0NERlY3J5cHQsXG59IGZyb20gJy4vbmlwLTQ0JztcbmltcG9ydCB0eXBlIHtcbiAgQnVua2VyVVJJLFxuICBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0LFxuICBOaXA0NlJlcXVlc3QsXG4gIE5pcDQ2UmVzcG9uc2UsXG4gIE5pcDQ2U2Vzc2lvbixcbiAgTmlwNDZTZXNzaW9uSW5mbyxcbiAgU2lnbmVkTm9zdHJFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgTmlwNDZNZXRob2QgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAxLiBCdW5rZXIgVVJJIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIFBhcnNlIGEgYnVua2VyOi8vIFVSSSBpbnRvIGl0cyBjb21wb25lbnRzXG4gKiBAcGFyYW0gdXJpIC0gYnVua2VyOi8vJmx0O3JlbW90ZS1wdWJrZXkmZ3Q7P3JlbGF5PS4uLiZzZWNyZXQ9Li4uXG4gKiBAcmV0dXJucyBQYXJzZWQgQnVua2VyVVJJIG9yIHRocm93cyBvbiBpbnZhbGlkIGlucHV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1bmtlclVSSSh1cmk6IHN0cmluZyk6IEJ1bmtlclVSSSB7XG4gIGlmICghdXJpLnN0YXJ0c1dpdGgoJ2J1bmtlcjovLycpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwodXJpLnJlcGxhY2UoJ2J1bmtlcjovLycsICdodHRwczovLycpKTtcbiAgY29uc3QgcmVtb3RlUHVia2V5ID0gdXJsLmhvc3RuYW1lO1xuXG4gIGlmICghL15bMC05YS1mXXs2NH0kLy50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogcmVtb3RlIHB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gIH1cblxuICBjb25zdCByZWxheXMgPSB1cmwuc2VhcmNoUGFyYW1zLmdldEFsbCgncmVsYXknKTtcbiAgaWYgKHJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBjb25zdCBzZWNyZXQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnc2VjcmV0JykgfHwgdW5kZWZpbmVkO1xuXG4gIHJldHVybiB7IHJlbW90ZVB1YmtleSwgcmVsYXlzLCBzZWNyZXQgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBidW5rZXI6Ly8gVVJJIHN0cmluZ1xuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcGFyYW0gcmVsYXlzIC0gUmVsYXkgVVJMc1xuICogQHBhcmFtIHNlY3JldCAtIE9wdGlvbmFsIGNvbm5lY3Rpb24gc2VjcmV0XG4gKiBAcmV0dXJucyBidW5rZXI6Ly8gVVJJIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnVua2VyVVJJKHJlbW90ZVB1YmtleTogc3RyaW5nLCByZWxheXM6IHN0cmluZ1tdLCBzZWNyZXQ/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIS9eWzAtOWEtZl17NjR9JC8udGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdGVQdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICB9XG4gIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlbGF5cy5tYXAociA9PiBgcmVsYXk9JHtlbmNvZGVVUklDb21wb25lbnQocil9YCk7XG4gIGlmIChzZWNyZXQpIHtcbiAgICBwYXJhbXMucHVzaChgc2VjcmV0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlY3JldCl9YCk7XG4gIH1cblxuICByZXR1cm4gYGJ1bmtlcjovLyR7cmVtb3RlUHVia2V5fT8ke3BhcmFtcy5qb2luKCcmJyl9YDtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBhIGJ1bmtlcjovLyBVUkkgYW5kIHJldHVybiBzdHJ1Y3R1cmVkIHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCdW5rZXJVUkkodXJpOiBzdHJpbmcpOiBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUJ1bmtlclVSSSh1cmkpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUsIHVyaTogcGFyc2VkIH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6IChlIGFzIEVycm9yKS5tZXNzYWdlIH07XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDIuIFNlc3Npb24gTWFuYWdlbWVudCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgTklQLTQ2IHNlc3Npb24gd2l0aCBhbiBlcGhlbWVyYWwga2V5cGFpclxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcmV0dXJucyBTZXNzaW9uIGNvbnRhaW5pbmcgZXBoZW1lcmFsIGtleXMgYW5kIE5JUC00NCBjb252ZXJzYXRpb24ga2V5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZXNzaW9uKHJlbW90ZVB1YmtleTogc3RyaW5nKTogTmlwNDZTZXNzaW9uIHtcbiAgaWYgKCEvXlswLTlhLWZdezY0fSQvLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3RlUHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgfVxuXG4gIGNvbnN0IGNsaWVudFNlY3JldEtleUJ5dGVzID0gcmFuZG9tQnl0ZXMoMzIpO1xuICBjb25zdCBjbGllbnRTZWNyZXRLZXkgPSBieXRlc1RvSGV4KGNsaWVudFNlY3JldEtleUJ5dGVzKTtcbiAgY29uc3QgY2xpZW50UHVia2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleSA9IGJ5dGVzVG9IZXgoY2xpZW50UHVia2V5Qnl0ZXMpO1xuXG4gIGNvbnN0IGNvbnZlcnNhdGlvbktleSA9IG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzLCByZW1vdGVQdWJrZXkpO1xuXG4gIHJldHVybiB7XG4gICAgY2xpZW50U2VjcmV0S2V5LFxuICAgIGNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXksXG4gICAgY29udmVyc2F0aW9uS2V5LFxuICB9O1xufVxuXG4vKipcbiAqIFJlc3RvcmUgYSBzZXNzaW9uIGZyb20gYSBwcmV2aW91c2x5IHNhdmVkIGVwaGVtZXJhbCBwcml2YXRlIGtleVxuICogQHBhcmFtIGNsaWVudFNlY3JldEtleSAtIEhleC1lbmNvZGVkIGVwaGVtZXJhbCBwcml2YXRlIGtleVxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcmV0dXJucyBSZXN0b3JlZCBzZXNzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlU2Vzc2lvbihjbGllbnRTZWNyZXRLZXk6IHN0cmluZywgcmVtb3RlUHVia2V5OiBzdHJpbmcpOiBOaXA0NlNlc3Npb24ge1xuICBjb25zdCBjbGllbnRTZWNyZXRLZXlCeXRlcyA9IGhleFRvQnl0ZXMoY2xpZW50U2VjcmV0S2V5KTtcbiAgY29uc3QgY2xpZW50UHVia2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleSA9IGJ5dGVzVG9IZXgoY2xpZW50UHVia2V5Qnl0ZXMpO1xuXG4gIGNvbnN0IGNvbnZlcnNhdGlvbktleSA9IG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzLCByZW1vdGVQdWJrZXkpO1xuXG4gIHJldHVybiB7XG4gICAgY2xpZW50U2VjcmV0S2V5LFxuICAgIGNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXksXG4gICAgY29udmVyc2F0aW9uS2V5LFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBwdWJsaWMgc2Vzc2lvbiBpbmZvIChzYWZlIHRvIGV4cG9zZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlc3Npb25JbmZvKHNlc3Npb246IE5pcDQ2U2Vzc2lvbik6IE5pcDQ2U2Vzc2lvbkluZm8ge1xuICByZXR1cm4ge1xuICAgIGNsaWVudFB1YmtleTogc2Vzc2lvbi5jbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5OiBzZXNzaW9uLnJlbW90ZVB1YmtleSxcbiAgfTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDMuIEpTT04tUlBDIE1lc3NhZ2VzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhIE5JUC00NiBKU09OLVJQQyByZXF1ZXN0XG4gKiBAcGFyYW0gbWV0aG9kIC0gUlBDIG1ldGhvZCBuYW1lXG4gKiBAcGFyYW0gcGFyYW1zIC0gQXJyYXkgb2Ygc3RyaW5nIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBpZCAtIE9wdGlvbmFsIHJlcXVlc3QgSUQgKHJhbmRvbSBpZiBub3QgcHJvdmlkZWQpXG4gKiBAcmV0dXJucyBKU09OLVJQQyByZXF1ZXN0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVxdWVzdChtZXRob2Q6IE5pcDQ2TWV0aG9kIHwgc3RyaW5nLCBwYXJhbXM6IHN0cmluZ1tdLCBpZD86IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGlkIHx8IGJ5dGVzVG9IZXgocmFuZG9tQnl0ZXMoMTYpKSxcbiAgICBtZXRob2QsXG4gICAgcGFyYW1zLFxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIE5JUC00NiBKU09OLVJQQyByZXNwb25zZVxuICogQHBhcmFtIGlkIC0gUmVxdWVzdCBJRCBiZWluZyByZXNwb25kZWQgdG9cbiAqIEBwYXJhbSByZXN1bHQgLSBSZXN1bHQgc3RyaW5nIChvbiBzdWNjZXNzKVxuICogQHBhcmFtIGVycm9yIC0gRXJyb3Igc3RyaW5nIChvbiBmYWlsdXJlKVxuICogQHJldHVybnMgSlNPTi1SUEMgcmVzcG9uc2Ugb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXNwb25zZShpZDogc3RyaW5nLCByZXN1bHQ/OiBzdHJpbmcsIGVycm9yPzogc3RyaW5nKTogTmlwNDZSZXNwb25zZSB7XG4gIGNvbnN0IHJlc3BvbnNlOiBOaXA0NlJlc3BvbnNlID0geyBpZCB9O1xuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHJlc3BvbnNlLnJlc3VsdCA9IHJlc3VsdDtcbiAgaWYgKGVycm9yICE9PSB1bmRlZmluZWQpIHJlc3BvbnNlLmVycm9yID0gZXJyb3I7XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIEpTT04gc3RyaW5nIGludG8gYSBOSVAtNDYgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIGpzb24gLSBKU09OIHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybnMgUGFyc2VkIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGF5bG9hZChqc29uOiBzdHJpbmcpOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlIHtcbiAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaWYgKHR5cGVvZiBvYmouaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIE5JUC00NiBwYXlsb2FkOiBtaXNzaW5nIGlkJyk7XG4gIH1cbiAgcmV0dXJuIG9iaiBhcyB1bmtub3duIGFzIE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2U7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwYXlsb2FkIGlzIGEgTklQLTQ2IHJlcXVlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVxdWVzdChwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlKTogcGF5bG9hZCBpcyBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gJ21ldGhvZCcgaW4gcGF5bG9hZCAmJiAncGFyYW1zJyBpbiBwYXlsb2FkO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcGF5bG9hZCBpcyBhIE5JUC00NiByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNwb25zZShwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlKTogcGF5bG9hZCBpcyBOaXA0NlJlc3BvbnNlIHtcbiAgcmV0dXJuICdyZXN1bHQnIGluIHBheWxvYWQgfHwgJ2Vycm9yJyBpbiBwYXlsb2FkO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNC4gRXZlbnQgV3JhcHBpbmcgKEtpbmQgMjQxMzMpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIEVuY3J5cHQgYW5kIHdyYXAgYSBOSVAtNDYgcGF5bG9hZCBpbnRvIGEga2luZCAyNDEzMyBzaWduZWQgZXZlbnRcbiAqIEBwYXJhbSBwYXlsb2FkIC0gSlNPTi1SUEMgcmVxdWVzdCBvciByZXNwb25zZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gc2Vzc2lvbiAtIE5JUC00NiBzZXNzaW9uXG4gKiBAcGFyYW0gcmVjaXBpZW50UHVia2V5IC0gVGhlIHJlY2lwaWVudCdzIHB1YmtleSAoaGV4KVxuICogQHJldHVybnMgU2lnbmVkIGtpbmQgMjQxMzMgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBFdmVudChcbiAgcGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSxcbiAgc2Vzc2lvbjogTmlwNDZTZXNzaW9uLFxuICByZWNpcGllbnRQdWJrZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgY29uc3QgZW5jcnlwdGVkID0gbmlwNDRFbmNyeXB0KGpzb24sIHNlc3Npb24uY29udmVyc2F0aW9uS2V5KTtcblxuICBjb25zdCBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIGNvbnN0IGV2ZW50ID0ge1xuICAgIGtpbmQ6IDI0MTMzLFxuICAgIGNyZWF0ZWRfYXQsXG4gICAgdGFnczogW1sncCcsIHJlY2lwaWVudFB1YmtleV1dLFxuICAgIGNvbnRlbnQ6IGVuY3J5cHRlZCxcbiAgICBwdWJrZXk6IHNlc3Npb24uY2xpZW50UHVia2V5LFxuICB9O1xuXG4gIC8vIFNlcmlhbGl6ZSBmb3IgTklQLTAxIGV2ZW50IElEXG4gIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudCxcbiAgXSk7XG5cbiAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMoc2Vzc2lvbi5jbGllbnRTZWNyZXRLZXkpO1xuICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IHNjaG5vcnIuc2lnbihldmVudEhhc2gsIHByaXZhdGVLZXlCeXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICBpZDogYnl0ZXNUb0hleChldmVudEhhc2gpLFxuICAgIHNpZzogYnl0ZXNUb0hleChzaWduYXR1cmVCeXRlcyksXG4gIH07XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbmQgcGFyc2UgYSBraW5kIDI0MTMzIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBTaWduZWQga2luZCAyNDEzMyBldmVudFxuICogQHBhcmFtIHNlc3Npb24gLSBOSVAtNDYgc2Vzc2lvblxuICogQHJldHVybnMgRGVjcnlwdGVkIEpTT04tUlBDIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcEV2ZW50KFxuICBldmVudDogU2lnbmVkTm9zdHJFdmVudCxcbiAgc2Vzc2lvbjogTmlwNDZTZXNzaW9uXG4pOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlIHtcbiAgaWYgKGV2ZW50LmtpbmQgIT09IDI0MTMzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBraW5kIDI0MTMzLCBnb3QgJHtldmVudC5raW5kfWApO1xuICB9XG5cbiAgY29uc3QganNvbiA9IG5pcDQ0RGVjcnlwdChldmVudC5jb250ZW50LCBzZXNzaW9uLmNvbnZlcnNhdGlvbktleSk7XG4gIHJldHVybiBwYXJzZVBheWxvYWQoanNvbik7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCA1LiBDb252ZW5pZW5jZSBSZXF1ZXN0IENyZWF0b3JzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhICdjb25uZWN0JyByZXF1ZXN0XG4gKiBAcGFyYW0gcmVtb3RlUHVia2V5IC0gUmVtb3RlIHNpZ25lcidzIHB1YmtleVxuICogQHBhcmFtIHNlY3JldCAtIE9wdGlvbmFsIGNvbm5lY3Rpb24gc2VjcmV0IGZyb20gYnVua2VyIFVSSVxuICogQHBhcmFtIHBlcm1pc3Npb25zIC0gT3B0aW9uYWwgY29tbWEtc2VwYXJhdGVkIHBlcm1pc3Npb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0UmVxdWVzdChyZW1vdGVQdWJrZXk6IHN0cmluZywgc2VjcmV0Pzogc3RyaW5nLCBwZXJtaXNzaW9ucz86IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIGNvbnN0IHBhcmFtcyA9IFtyZW1vdGVQdWJrZXldO1xuICBpZiAoc2VjcmV0KSBwYXJhbXMucHVzaChzZWNyZXQpO1xuICBlbHNlIGlmIChwZXJtaXNzaW9ucykgcGFyYW1zLnB1c2goJycpO1xuICBpZiAocGVybWlzc2lvbnMpIHBhcmFtcy5wdXNoKHBlcm1pc3Npb25zKTtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuQ09OTkVDVCwgcGFyYW1zKTtcbn1cblxuLyoqIENyZWF0ZSBhICdwaW5nJyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gcGluZ1JlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuUElORywgW10pO1xufVxuXG4vKiogQ3JlYXRlIGEgJ2dldF9wdWJsaWNfa2V5JyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljS2V5UmVxdWVzdCgpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5HRVRfUFVCTElDX0tFWSwgW10pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICdzaWduX2V2ZW50JyByZXF1ZXN0XG4gKiBAcGFyYW0gZXZlbnRKc29uIC0gSlNPTi1zdHJpbmdpZmllZCB1bnNpZ25lZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2lnbkV2ZW50UmVxdWVzdChldmVudEpzb246IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLlNJR05fRVZFTlQsIFtldmVudEpzb25dKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwMDRfZW5jcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHJlY2lwaWVudFxuICogQHBhcmFtIHBsYWludGV4dCAtIE1lc3NhZ2UgdG8gZW5jcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwMDRFbmNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIHBsYWludGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQMDRfRU5DUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIHBsYWludGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXAwNF9kZWNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2Ugc2VuZGVyXG4gKiBAcGFyYW0gY2lwaGVydGV4dCAtIEVuY3J5cHRlZCBtZXNzYWdlIHRvIGRlY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDA0RGVjcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBjaXBoZXJ0ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVAwNF9ERUNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgY2lwaGVydGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXA0NF9lbmNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2UgcmVjaXBpZW50XG4gKiBAcGFyYW0gcGxhaW50ZXh0IC0gTWVzc2FnZSB0byBlbmNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXA0NEVuY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgcGxhaW50ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVA0NF9FTkNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgcGxhaW50ZXh0XSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDQ0X2RlY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSBzZW5kZXJcbiAqIEBwYXJhbSBjaXBoZXJ0ZXh0IC0gRW5jcnlwdGVkIG1lc3NhZ2UgdG8gZGVjcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwNDREZWNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIGNpcGhlcnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDQ0X0RFQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBjaXBoZXJ0ZXh0XSk7XG59XG5cbi8qKiBDcmVhdGUgYSAnZ2V0X3JlbGF5cycgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbGF5c1JlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuR0VUX1JFTEFZUywgW10pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNi4gRmlsdGVyIEhlbHBlciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBOb3N0ciBmaWx0ZXIgZm9yIHN1YnNjcmliaW5nIHRvIE5JUC00NiByZXNwb25zZSBldmVudHNcbiAqIEBwYXJhbSBjbGllbnRQdWJrZXkgLSBPdXIgZXBoZW1lcmFsIHB1YmxpYyBrZXkgKGhleClcbiAqIEBwYXJhbSBzaW5jZSAtIE9wdGlvbmFsIHNpbmNlIHRpbWVzdGFtcFxuICogQHJldHVybnMgRmlsdGVyIG9iamVjdCBmb3Iga2luZCAyNDEzMyBldmVudHMgdGFnZ2VkIHRvIHVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXNwb25zZUZpbHRlcihcbiAgY2xpZW50UHVia2V5OiBzdHJpbmcsXG4gIHNpbmNlPzogbnVtYmVyXG4pOiB7IGtpbmRzOiBudW1iZXJbXTsgJyNwJzogc3RyaW5nW107IHNpbmNlPzogbnVtYmVyIH0ge1xuICBjb25zdCBmaWx0ZXI6IHsga2luZHM6IG51bWJlcltdOyAnI3AnOiBzdHJpbmdbXTsgc2luY2U/OiBudW1iZXIgfSA9IHtcbiAgICBraW5kczogWzI0MTMzXSxcbiAgICAnI3AnOiBbY2xpZW50UHVia2V5XSxcbiAgfTtcbiAgaWYgKHNpbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICBmaWx0ZXIuc2luY2UgPSBzaW5jZTtcbiAgfVxuICByZXR1cm4gZmlsdGVyO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00OVxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00OSAoUHJpdmF0ZSBLZXkgRW5jcnlwdGlvbiAvIG5jcnlwdHNlYylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDkubWRcbiAqL1xuXG5pbXBvcnQgeyB4Y2hhY2hhMjBwb2x5MTMwNSB9IGZyb20gJ0Bub2JsZS9jaXBoZXJzL2NoYWNoYS5qcyc7XG5pbXBvcnQgeyBzY3J5cHQgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NjcnlwdC5qcyc7XG5pbXBvcnQgeyBjb25jYXRCeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGJlY2gzMiBhcyBzY3VyZUJlY2gzMiB9IGZyb20gJ0BzY3VyZS9iYXNlJztcblxudHlwZSBLZXlTZWN1cml0eUJ5dGUgPSAweDAwIHwgMHgwMSB8IDB4MDI7XG5cbi8qKlxuICogRW5jcnlwdCBhIE5vc3RyIHByaXZhdGUga2V5IHdpdGggYSBwYXNzd29yZCwgcHJvZHVjaW5nIGFuIG5jcnlwdHNlYyBiZWNoMzIgc3RyaW5nXG4gKiBAcGFyYW0gc2VjIC0gMzItYnl0ZSBzZWNyZXQga2V5XG4gKiBAcGFyYW0gcGFzc3dvcmQgLSBQYXNzd29yZCBmb3IgZW5jcnlwdGlvblxuICogQHBhcmFtIGxvZ24gLSBTY3J5cHQgbG9nMihOKSBwYXJhbWV0ZXIgKGRlZmF1bHQ6IDE2LCBtZWFuaW5nIE49NjU1MzYpXG4gKiBAcGFyYW0ga3NiIC0gS2V5IHNlY3VyaXR5IGJ5dGU6IDB4MDA9dW5rbm93biwgMHgwMT11bnNhZmUsIDB4MDI9c2FmZSAoZGVmYXVsdDogMHgwMilcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5jcnlwdHNlYyBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHQoXG4gIHNlYzogVWludDhBcnJheSxcbiAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgbG9nbjogbnVtYmVyID0gMTYsXG4gIGtzYjogS2V5U2VjdXJpdHlCeXRlID0gMHgwMlxuKTogc3RyaW5nIHtcbiAgY29uc3Qgc2FsdCA9IHJhbmRvbUJ5dGVzKDE2KTtcbiAgY29uc3QgbiA9IDIgKiogbG9nbjtcbiAgY29uc3Qgbm9ybWFsaXplZFBhc3N3b3JkID0gcGFzc3dvcmQubm9ybWFsaXplKCdORktDJyk7XG4gIGNvbnN0IGtleSA9IHNjcnlwdChub3JtYWxpemVkUGFzc3dvcmQsIHNhbHQsIHsgTjogbiwgcjogOCwgcDogMSwgZGtMZW46IDMyIH0pO1xuICBjb25zdCBub25jZSA9IHJhbmRvbUJ5dGVzKDI0KTtcbiAgY29uc3QgYWFkID0gVWludDhBcnJheS5mcm9tKFtrc2JdKTtcbiAgY29uc3QgY2lwaGVyID0geGNoYWNoYTIwcG9seTEzMDUoa2V5LCBub25jZSwgYWFkKTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGNpcGhlci5lbmNyeXB0KHNlYyk7XG4gIC8vIEJpbmFyeSBmb3JtYXQ6IHZlcnNpb24oMSkgKyBsb2duKDEpICsgc2FsdCgxNikgKyBub25jZSgyNCkgKyBrc2IoMSkgKyBjaXBoZXJ0ZXh0KDQ4ID0gMzIgKyAxNiB0YWcpXG4gIGNvbnN0IHBheWxvYWQgPSBjb25jYXRCeXRlcyhcbiAgICBVaW50OEFycmF5LmZyb20oWzB4MDJdKSxcbiAgICBVaW50OEFycmF5LmZyb20oW2xvZ25dKSxcbiAgICBzYWx0LFxuICAgIG5vbmNlLFxuICAgIGFhZCxcbiAgICBjaXBoZXJ0ZXh0XG4gICk7XG4gIGNvbnN0IHdvcmRzID0gc2N1cmVCZWNoMzIudG9Xb3JkcyhwYXlsb2FkKTtcbiAgcmV0dXJuIHNjdXJlQmVjaDMyLmVuY29kZSgnbmNyeXB0c2VjJywgd29yZHMsIDIwMCk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbiBuY3J5cHRzZWMgYmVjaDMyIHN0cmluZyBiYWNrIHRvIHRoZSAzMi1ieXRlIHNlY3JldCBrZXlcbiAqIEBwYXJhbSBuY3J5cHRzZWMgLSBiZWNoMzItZW5jb2RlZCBuY3J5cHRzZWMgc3RyaW5nXG4gKiBAcGFyYW0gcGFzc3dvcmQgLSBQYXNzd29yZCB1c2VkIGZvciBlbmNyeXB0aW9uXG4gKiBAcmV0dXJucyAzMi1ieXRlIHNlY3JldCBrZXkgYXMgVWludDhBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjcnlwdChuY3J5cHRzZWM6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCB7IHByZWZpeCwgd29yZHMgfSA9IHNjdXJlQmVjaDMyLmRlY29kZShuY3J5cHRzZWMgYXMgYCR7c3RyaW5nfTEke3N0cmluZ31gLCAyMDApO1xuICBpZiAocHJlZml4ICE9PSAnbmNyeXB0c2VjJykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIG5jcnlwdHNlYyBwcmVmaXgnKTtcbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHNjdXJlQmVjaDMyLmZyb21Xb3Jkcyh3b3JkcykpO1xuICBjb25zdCB2ZXJzaW9uID0gZGF0YVswXTtcbiAgaWYgKHZlcnNpb24gIT09IDB4MDIpIHRocm93IG5ldyBFcnJvcihgdW5rbm93biBuY3J5cHRzZWMgdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICBjb25zdCBsb2duID0gZGF0YVsxXTtcbiAgY29uc3Qgc2FsdCA9IGRhdGEuc3ViYXJyYXkoMiwgMTgpO1xuICBjb25zdCBub25jZSA9IGRhdGEuc3ViYXJyYXkoMTgsIDQyKTtcbiAgY29uc3Qga3NiID0gZGF0YVs0Ml07XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBkYXRhLnN1YmFycmF5KDQzKTtcbiAgY29uc3QgbiA9IDIgKiogbG9nbjtcbiAgY29uc3Qgbm9ybWFsaXplZFBhc3N3b3JkID0gcGFzc3dvcmQubm9ybWFsaXplKCdORktDJyk7XG4gIGNvbnN0IGtleSA9IHNjcnlwdChub3JtYWxpemVkUGFzc3dvcmQsIHNhbHQsIHsgTjogbiwgcjogOCwgcDogMSwgZGtMZW46IDMyIH0pO1xuICBjb25zdCBhYWQgPSBVaW50OEFycmF5LmZyb20oW2tzYl0pO1xuICBjb25zdCBjaXBoZXIgPSB4Y2hhY2hhMjBwb2x5MTMwNShrZXksIG5vbmNlLCBhYWQpO1xuICByZXR1cm4gY2lwaGVyLmRlY3J5cHQoY2lwaGVydGV4dCk7XG59XG4iLCAiLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIGRhdGFcbiAqL1xuXG4vKipcbiAqIENvbnZlcnQgYSBoZXggc3RyaW5nIHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBoZXggSGV4IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVaW50OEFycmF5IG9mIGJ5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZXgubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgYnl0ZXNbaSAvIDJdID0gcGFyc2VJbnQoaGV4LnNsaWNlKGksIGkgKyAyKSwgMTYpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXM7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIGhleCBzdHJpbmdcbiAqIEBwYXJhbSBieXRlcyBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEhleCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBVVEYtOCBzdHJpbmcgdG8gVWludDhBcnJheVxuICogQHBhcmFtIHN0ciBVVEYtOCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVWludDhBcnJheSBvZiBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cik7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIFVURi04IHN0cmluZ1xuICogQHBhcmFtIGJ5dGVzIFVpbnQ4QXJyYXkgdG8gY29udmVydFxuICogQHJldHVybnMgVVRGLTggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvVXRmOChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcyk7XG59XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc3luYyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTnVsbCB3aGVuIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBzeW5jIChvbGRlciBTYWZhcmksIGV0Yy4pXG4gICAgc3luYzogX2Jyb3dzZXIuc3RvcmFnZT8uc3luYyA/IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSB7XG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXNuJ3Qgc3VwcG9ydCBnZXRCeXRlc0luVXNlIFx1MjAxNCByZXR1cm4gMFxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXRCeXRlc0luVXNlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgIi8qKlxuICogRW5jcnlwdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5IG1hc3RlciBwYXNzd29yZCBmZWF0dXJlLlxuICpcbiAqIFVzZXMgV2ViIENyeXB0byBBUEkgKGNyeXB0by5zdWJ0bGUpIGV4Y2x1c2l2ZWx5IFx1MjAxNCBubyBleHRlcm5hbCBsaWJyYXJpZXMuXG4gKiAtIFBCS0RGMiB3aXRoIDYwMCwwMDAgaXRlcmF0aW9ucyAoT1dBU1AgMjAyMyByZWNvbW1lbmRhdGlvbilcbiAqIC0gQUVTLTI1Ni1HQ00gZm9yIGF1dGhlbnRpY2F0ZWQgZW5jcnlwdGlvblxuICogLSBSYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpIHBlciBvcGVyYXRpb25cbiAqIC0gQWxsIGJpbmFyeSBkYXRhIGVuY29kZWQgYXMgYmFzZTY0IGZvciBKU09OIHN0b3JhZ2UgY29tcGF0aWJpbGl0eVxuICovXG5cbmNvbnN0IFBCS0RGMl9JVEVSQVRJT05TID0gNjAwXzAwMDtcbmNvbnN0IFNBTFRfQllURVMgPSAxNjtcbmNvbnN0IElWX0JZVEVTID0gMTI7XG5cbi8vIC0tLSBCYXNlNjQgaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCkge1xuICAgIGNvbnN0IGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBieXRlcy5idWZmZXI7XG59XG5cbi8vIC0tLSBLZXkgZGVyaXZhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBEZXJpdmUgYW4gQUVTLTI1Ni1HQ00gQ3J5cHRvS2V5IGZyb20gYSBwYXNzd29yZCBhbmQgc2FsdCB1c2luZyBQQktERjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcnxVaW50OEFycmF5fSBzYWx0IC0gMTYtYnl0ZSBzYWx0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxDcnlwdG9LZXk+fSBBRVMtMjU2LUdDTSBrZXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddXG4gICAgKTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgd2l0aCBwcmUtZGVyaXZlZCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHVzaW5nIGEgcHJlLWRlcml2ZWQgQ3J5cHRvS2V5IGFuZCBpdHMgc2FsdC5cbiAqXG4gKiBUaGlzIGF2b2lkcyBob2xkaW5nIHRoZSByYXcgcGFzc3dvcmQgaW4gbWVtb3J5IFx1MjAxNCB0aGUgY2FsbGVyIGRlcml2ZXMgdGhlXG4gKiBrZXkgb25jZSAodmlhIGRlcml2ZUtleSkgYW5kIHJldXNlcyBpdCBmb3IgdGhlIHNlc3Npb24uICBUaGUgb3V0cHV0XG4gKiBmb3JtYXQgaXMgaWRlbnRpY2FsIHRvIGVuY3J5cHQoKSwgc28gZGVjcnlwdCgpIGNhbiBzdGlsbCBiZSB1c2VkIHdpdGhcbiAqIHRoZSBvcmlnaW5hbCBwYXNzd29yZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0ICAgICAgICAgIC0gVGhlIGRhdGEgdG8gZW5jcnlwdFxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleSAgICAgICAgICAgICAtIEFFUy0yNTYtR0NNIGtleSBmcm9tIGRlcml2ZUtleSgpXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHNhbHQgICAgICAgICAgIC0gVGhlIHNhbHQgdGhhdCB3YXMgdXNlZCB0byBkZXJpdmUgYGtleWBcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aEtleShwbGFpbnRleHQsIGtleSwgc2FsdCkge1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IC8gRGVjcnlwdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB3aXRoIGEgcGFzc3dvcmQuXG4gKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSwgZGVyaXZlcyBhblxuICogQUVTLTI1Ni1HQ00ga2V5IHZpYSBQQktERjIsIGFuZCByZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZ1xuICogYmFzZTY0LWVuY29kZWQgc2FsdCwgaXYsIGFuZCBjaXBoZXJ0ZXh0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgLSBUaGUgZGF0YSB0byBlbmNyeXB0IChlLmcuIGhleCBwcml2YXRlIGtleSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQsIHBhc3N3b3JkKSB7XG4gICAgY29uc3Qgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCk7XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSAoaWdub3JlcyB0aGUgc2FsdCBlbWJlZGRlZCBpbiB0aGVcbiAqIGJsb2IgXHUyMDE0IHRoZSBjYWxsZXIgbXVzdCBzdXBwbHkgYSBrZXkgdGhhdCBtYXRjaGVzIGhvdyB0aGUgYmxvYiB3YXMgZW5jcnlwdGVkKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpL2VuY3J5cHRXaXRoS2V5KClcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aEtleShlbmNyeXB0ZWREYXRhLCBrZXkpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdGhhdCB3YXMgZW5jcnlwdGVkIHdpdGggYGVuY3J5cHQoKWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgICAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHBhc3N3b3JkIGlzIHdyb25nIG9yIGRhdGEgaXMgdGFtcGVyZWQgd2l0aFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG5cbiAgICBjb25zdCBzYWx0QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuXG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0QnVmKTtcblxuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuXG4gICAgY29uc3QgZGVjID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgcmV0dXJuIGRlYy5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gUGFzc3dvcmQgaGFzaGluZyAoZm9yIHZlcmlmaWNhdGlvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogSGFzaCBhIHBhc3N3b3JkIHdpdGggUEJLREYyIGZvciB2ZXJpZmljYXRpb24gcHVycG9zZXMuXG4gKlxuICogVGhpcyBwcm9kdWNlcyBhIHNlcGFyYXRlIGhhc2ggKG5vdCB0aGUgZW5jcnlwdGlvbiBrZXkpIHRoYXQgY2FuIGJlIHN0b3JlZFxuICogdG8gdmVyaWZ5IHRoZSBwYXNzd29yZCB3aXRob3V0IG5lZWRpbmcgdG8gYXR0ZW1wdCBkZWNyeXB0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gW3NhbHRdIC0gT3B0aW9uYWwgc2FsdDsgZ2VuZXJhdGVkIGlmIG9taXR0ZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHsgaGFzaDogc3RyaW5nLCBzYWx0OiBzdHJpbmcgfT59IGJhc2U2NC1lbmNvZGVkIGhhc2ggYW5kIHNhbHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhc2hQYXNzd29yZChwYXNzd29yZCwgc2FsdCkge1xuICAgIGlmICghc2FsdCkge1xuICAgICAgICBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2FsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2FsdCA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUJpdHMnXVxuICAgICk7XG5cbiAgICBjb25zdCBoYXNoQml0cyA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVyaXZlQml0cyhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0LFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICAyNTZcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogYXJyYXlCdWZmZXJUb0Jhc2U2NChoYXNoQml0cyksXG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IGEgc3RvcmVkIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgLSBUaGUgcGFzc3dvcmQgdG8gdmVyaWZ5XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkSGFzaCAtIGJhc2U2NC1lbmNvZGVkIGhhc2ggZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZFNhbHQgLSBiYXNlNjQtZW5jb2RlZCBzYWx0IGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHRoZSBwYXNzd29yZCBtYXRjaGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkSGFzaCwgc3RvcmVkU2FsdCkge1xuICAgIGNvbnN0IHsgaGFzaCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRTYWx0KTtcbiAgICByZXR1cm4gY29uc3RhbnRUaW1lRXF1YWxCYXNlNjQoaGFzaCwgc3RvcmVkSGFzaCk7XG59XG5cbi8qKlxuICogQ29uc3RhbnQtdGltZSBjb21wYXJpc29uIG9mIHR3byBiYXNlNjQtZW5jb2RlZCBieXRlIHN0cmluZ3MuXG4gKlxuICogRGVjb2RlcyBib3RoIHRvIHJhdyBieXRlcyBhbmQgY29tcGFyZXMgd2l0aCBhbiBhY2N1bXVsYXRvciBzbyB0aGUgcnVubmluZ1xuICogdGltZSBkb2VzIG5vdCBkZXBlbmQgb24gd2hlcmUgdGhlIGZpcnN0IG1pc21hdGNoIG9jY3VycyBcdTIwMTQgdGhpcyBhdm9pZHMgdGhlXG4gKiB0aW1pbmcgc2lkZS1jaGFubmVsIG9mIGEgcGxhaW4gYD09PWAgc3RyaW5nIGNvbXBhcmUgKFRpZXItMyBjcnlwdG8uanM6MjEzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGEsIGIpIHtcbiAgICBsZXQgYmEsIGJiO1xuICAgIHRyeSB7XG4gICAgICAgIGJhID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihhKSk7XG4gICAgICAgIGJiID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihiKSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQ29tcGFyZSB0aGUgbWF4IGxlbmd0aCBzbyBsZW5ndGggZGlmZmVyZW5jZXMgZG9uJ3Qgc2hvcnQtY2lyY3VpdCBlYXJseS5cbiAgICBjb25zdCBsZW4gPSBNYXRoLm1heChiYS5sZW5ndGgsIGJiLmxlbmd0aCk7XG4gICAgbGV0IGRpZmYgPSBiYS5sZW5ndGggXiBiYi5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBkaWZmIHw9IChiYVtpXSB8fCAwKSBeIChiYltpXSB8fCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpZmYgPT09IDA7XG59XG4iLCAiLyoqXG4gKiBCSVAzOSBTZWVkIFBocmFzZSB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5LlxuICpcbiAqIEltcGxlbWVudHMgdGhlIHNhbWUgYWxnb3JpdGhtIGFzIGBub3N0ci1uc2VjLXNlZWRwaHJhc2VgOlxuICogdGhlIDMyLWJ5dGUgcHJpdmF0ZSBrZXkgSVMgdGhlIEJJUDM5IGVudHJvcHkgKGJpZGlyZWN0aW9uYWwgZW5jb2RpbmcpLlxuICpcbiAqIFVzZXMgQHNjdXJlL2JpcDM5IChhbHJlYWR5IGEgdHJhbnNpdGl2ZSBkZXAgb2Ygbm9zdHItdG9vbHMpLlxuICovXG5cbmltcG9ydCB7IGVudHJvcHlUb01uZW1vbmljLCBtbmVtb25pY1RvRW50cm9weSwgdmFsaWRhdGVNbmVtb25pYyB9IGZyb20gJ0BzY3VyZS9iaXAzOSc7XG5pbXBvcnQgeyB3b3JkbGlzdCB9IGZyb20gJ0BzY3VyZS9iaXAzOS93b3JkbGlzdHMvZW5nbGlzaC5qcyc7XG5pbXBvcnQgeyBoZXhUb0J5dGVzLCBieXRlc1RvSGV4LCBnZXRQdWJsaWNLZXlTeW5jIH0gZnJvbSAnbm9zdHItY3J5cHRvLXV0aWxzJztcblxuLyoqXG4gKiBDb252ZXJ0IGEgaGV4IHByaXZhdGUga2V5IHRvIGEgMjQtd29yZCBCSVAzOSBtbmVtb25pYy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBoZXhLZXkgLSA2NC1jaGFyIGhleCBwcml2YXRlIGtleVxuICogQHJldHVybnMge3N0cmluZ30gMjQtd29yZCBtbmVtb25pY1xuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5VG9TZWVkUGhyYXNlKGhleEtleSkge1xuICAgIGNvbnN0IGJ5dGVzID0gaGV4VG9CeXRlcyhoZXhLZXkpO1xuICAgIHJldHVybiBlbnRyb3B5VG9NbmVtb25pYyhieXRlcywgd29yZGxpc3QpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBCSVAzOSBtbmVtb25pYyBiYWNrIHRvIGEgaGV4IHByaXZhdGUga2V5ICsgZGVyaXZlZCBwdWJrZXkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlIC0gMjQtd29yZCBtbmVtb25pY1xuICogQHJldHVybnMge3sgaGV4S2V5OiBzdHJpbmcsIHB1YktleTogc3RyaW5nIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkUGhyYXNlVG9LZXkocGhyYXNlKSB7XG4gICAgY29uc3QgZW50cm9weSA9IG1uZW1vbmljVG9FbnRyb3B5KHBocmFzZS50cmltKCkudG9Mb3dlckNhc2UoKSwgd29yZGxpc3QpO1xuICAgIGNvbnN0IGhleEtleSA9IGJ5dGVzVG9IZXgoZW50cm9weSk7XG4gICAgY29uc3QgcHViS2V5ID0gZ2V0UHVibGljS2V5U3luYyhoZXhLZXkpO1xuICAgIHJldHVybiB7IGhleEtleSwgcHViS2V5IH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBCSVAzOSBtbmVtb25pYyAoY2hlY2tzdW0gKyB3b3JkbGlzdCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRTZWVkUGhyYXNlKHBocmFzZSkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZU1uZW1vbmljKHBocmFzZS50cmltKCkudG9Mb3dlckNhc2UoKSwgd29yZGxpc3QpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEZhc3QgaGV1cmlzdGljOiBkb2VzIHRoZSBpbnB1dCBsb29rIGxpa2UgaXQgY291bGQgYmUgYSBzZWVkIHBocmFzZT9cbiAqICgxMisgc3BhY2Utc2VwYXJhdGVkIGFscGhhYmV0aWMgd29yZHMpXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3NMaWtlU2VlZFBocmFzZShpbnB1dCkge1xuICAgIGlmICghaW5wdXQgfHwgdHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHdvcmRzID0gaW5wdXQudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgcmV0dXJuIHdvcmRzLmxlbmd0aCA+PSAxMiAmJiB3b3Jkcy5ldmVyeSh3ID0+IC9eW2EtekEtWl0rJC8udGVzdCh3KSk7XG59XG4iLCAiLyoqXG4gKiBTZWNyZXQgVmF1bHQgXHUyMDE0IGF0LXJlc3QgZW5jcnlwdGlvbiBmb3IgcHJpdmF0ZSBrZXlzIGFuZCBhcHBsaWNhdGlvbiBzZWNyZXRzLlxuICpcbiAqIFRocmVhdCBtb2RlbCAoVDAtNCk6IHJhdyBzZWNyZXQgYnl0ZXMgbXVzdCBuZXZlciBzaXQgaW4gYnJvd3NlciBzdG9yYWdlIGluXG4gKiBjbGVhcnRleHQsIGV2ZW4gZm9yIHRoZSBERUZBVUxUIHBhc3N3b3JkbGVzcyB1c2VyLiBUaGlzIG1vZHVsZSBwcm92aWRlcyB0d29cbiAqIHdyYXBwaW5nIHN0cmF0ZWdpZXMgYmVoaW5kIG9uZSBgd3JhcFNlY3JldGAgLyBgdW53cmFwU2VjcmV0YCBpbnRlcmZhY2U6XG4gKlxuICogICAxLiBERVZJQ0UgS0VZIChkZWZhdWx0LCBubyBtYXN0ZXIgcGFzc3dvcmQpIFx1MjAxNCBhIG5vbi1leHRyYWN0YWJsZSBBRVMtMjU2LUdDTVxuICogICAgICBDcnlwdG9LZXkgZ2VuZXJhdGVkIHdpdGggYGV4dHJhY3RhYmxlOmZhbHNlYCBhbmQgcGVyc2lzdGVkIGFzIGEgQ3J5cHRvS2V5XG4gKiAgICAgICpoYW5kbGUqIGluIEluZGV4ZWREQi4gVGhlIHJhdyBrZXkgYnl0ZXMgbmV2ZXIgbGVhdmUgdGhlIGJyb3dzZXIncyBrZXlcbiAqICAgICAgc3RvcmUsIHNvIHN0b3JhZ2Ugb25seSBldmVyIGhvbGRzIGNpcGhlcnRleHQgKyBhIGhhbmRsZSB0aGF0IGNhbm5vdCBiZVxuICogICAgICBleHBvcnRlZC4gSW4gZW52aXJvbm1lbnRzIHdpdGhvdXQgSW5kZXhlZERCICh1bml0IHRlc3RzKSB0aGUga2V5IGlzIGhlbGRcbiAqICAgICAgaW4gbWVtb3J5IGZvciB0aGUgbGlmZSBvZiB0aGUgbW9kdWxlLlxuICpcbiAqICAgMi4gU0VTU0lPTiBLRVkgKG1hc3RlciBwYXNzd29yZCBzZXQgKyB1bmxvY2tlZCkgXHUyMDE0IHRoZSBBRVMtMjU2LUdDTSBrZXlcbiAqICAgICAgZGVyaXZlZCBmcm9tIHRoZSBwYXNzd29yZCAoc2VlIGNyeXB0by5qcykuIFNldCBieSB0aGUgYmFja2dyb3VuZCB3b3JrZXJcbiAqICAgICAgb24gdW5sb2NrIHZpYSBgc2V0U2Vzc2lvbktleWAsIGNsZWFyZWQgb24gbG9jayB2aWEgYGNsZWFyU2Vzc2lvbmAuXG4gKlxuICogQmxvYiBmb3JtYXRzIChib3RoIGFyZSBzZWxmLWRlc2NyaWJpbmcgSlNPTiBzdHJpbmdzKTpcbiAqICAgcGFzc3dvcmQgYmxvYiA6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfVxuICogICBkZXZpY2UgIGJsb2IgOiB7IHY6MSwgazpcImRldmljZVwiLCBpdiwgY2lwaGVydGV4dCB9XG4gKlxuICogYHVud3JhcFNlY3JldGAgcmVmdXNlcyB0byBkZWNyeXB0IHdoZW4gdGhlIHNlc3Npb24gaGFzIGJlZW4gZXhwbGljaXRseSBsb2NrZWRcbiAqIChGNS9GNikgc28gYSBsb2NrZWQgcGFnZSBjYW5ub3QgcmVhZCBzZWNyZXRzLlxuICovXG5cbmltcG9ydCB7IGVuY3J5cHRXaXRoS2V5LCBkZWNyeXB0V2l0aEtleSB9IGZyb20gJy4vY3J5cHRvJztcblxuY29uc3QgSVZfQllURVMgPSAxMjtcbmNvbnN0IERFVklDRV9EQiA9ICdub3N0cmtleS1zZWNyZXQtdmF1bHQnO1xuY29uc3QgREVWSUNFX1NUT1JFID0gJ2tleXMnO1xuY29uc3QgREVWSUNFX0tFWV9JRCA9ICdkZXZpY2Utd3JhcC1rZXktdjEnO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgKGtlcHQgbG9jYWwgc28gdGhpcyBtb2R1bGUgaGFzIG5vIGNyb3NzLWRlcHMpIC0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gYWJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgbGV0IGJpbmFyeSA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VG9BYihiNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGI2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gU2Vzc2lvbiAocGFzc3dvcmQtZGVyaXZlZCkga2V5IHN0YXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9zZXNzaW9uS2V5ID0gbnVsbDsgICAvLyBDcnlwdG9LZXkgfCBudWxsXG5sZXQgX3Nlc3Npb25TYWx0ID0gbnVsbDsgIC8vIFVpbnQ4QXJyYXkgfCBudWxsXG4vLyBfdW5sb2NrZWQ6IG51bGwgPSBwYXNzd29yZGxlc3MgLyBub3QgYXBwbGljYWJsZSAobmV2ZXIgbG9ja2VkKSxcbi8vICAgICAgICAgICAgdHJ1ZSA9IHVubG9ja2VkLCBmYWxzZSA9IGxvY2tlZCAocmVmdXNlIHNlY3JldCByZWFkcykuXG5sZXQgX3VubG9ja2VkID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlc3Npb25LZXkoY3J5cHRvS2V5LCBzYWx0KSB7XG4gICAgX3Nlc3Npb25LZXkgPSBjcnlwdG9LZXk7XG4gICAgX3Nlc3Npb25TYWx0ID0gc2FsdDtcbiAgICBfdW5sb2NrZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZXNzaW9uKCkge1xuICAgIF9zZXNzaW9uS2V5ID0gbnVsbDtcbiAgICBfc2Vzc2lvblNhbHQgPSBudWxsO1xuICAgIF91bmxvY2tlZCA9IGZhbHNlO1xufVxuXG4vKiogRXhwbGljaXRseSBtYXJrIHRoZSBzZXNzaW9uIHVubG9ja2VkL2xvY2tlZCB3aXRob3V0IHByb3ZpZGluZyBhIGtleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRVbmxvY2tlZCh2KSB7XG4gICAgX3VubG9ja2VkID0gdiA9PT0gbnVsbCA/IG51bGwgOiAhIXY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZXNzaW9uS2V5KCkge1xuICAgIHJldHVybiAhIV9zZXNzaW9uS2V5O1xufVxuXG4vLyAtLS0gRGV2aWNlIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubGV0IF9kZXZpY2VLZXlQcm9taXNlID0gbnVsbDtcbmxldCBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDsgLy8gZmFsbGJhY2sgZm9yIGVudmlyb25tZW50cyB3aXRob3V0IEluZGV4ZWREQlxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURldmljZUtleSgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5nZW5lcmF0ZUtleShcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgIGZhbHNlLCAvLyBOT04tZXh0cmFjdGFibGU6IHJhdyBieXRlcyBjYW4gbmV2ZXIgYmUgcmVhZCBiYWNrIG91dFxuICAgICAgICBbJ2VuY3J5cHQnLCAnZGVjcnlwdCddLFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWREYkF2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5kZXhlZERCICE9PSBudWxsO1xufVxuXG4vKipcbiAqIEdldCAoY3JlYXRpbmcgb24gZmlyc3QgdXNlKSB0aGUgcGVyc2lzdGVudCBub24tZXh0cmFjdGFibGUgZGV2aWNlIGtleS5cbiAqIFBlcnNpc3RlZCBpbiBJbmRleGVkREIgYXMgYSBDcnlwdG9LZXkgaGFuZGxlIHZpYSBzdHJ1Y3R1cmVkIGNsb25lLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGV2aWNlS2V5KCkge1xuICAgIGlmIChfZGV2aWNlS2V5UHJvbWlzZSkgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xuICAgIF9kZXZpY2VLZXlQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgICAgICB9XG4gICAgICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICAgICAgY29uc3QgeyBvcGVuREIgfSA9IGF3YWl0IGltcG9ydCgnaWRiJyk7XG4gICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICAgICAgdXBncmFkZShkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREVWSUNFX1NUT1JFKSkge1xuICAgICAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGtleSA9IGF3YWl0IGdlbmVyYXRlRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBhd2FpdCBkYi5wdXQoREVWSUNFX1NUT1JFLCBrZXksIERFVklDRV9LRVlfSUQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBlbmMuZW5jb2RlKHBsYWludGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICB2OiAxLFxuICAgICAgICBrOiAnZGV2aWNlJyxcbiAgICAgICAgaXY6IGFiVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhYlRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhEZXZpY2VLZXkoZW5jcnlwdGVkRGF0YSkge1xuICAgIGNvbnN0IHsgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BYihpdikpIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgYmFzZTY0VG9BYihjaXBoZXJ0ZXh0KSxcbiAgICApO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gQmxvYiBjbGFzc2lmaWNhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGZ1bmN0aW9uIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwICYmIHAuc2FsdCAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCAmJiBwLmsgIT09ICdkZXZpY2UnKTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldmljZUtleUJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5rID09PSAnZGV2aWNlJyAmJiBwLml2ICYmIHAuY2lwaGVydGV4dCk7XG4gICAgfSBjYXRjaCB7IHJldHVybiBmYWxzZTsgfVxufVxuXG4vKiogVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYWxyZWFkeSBjaXBoZXJ0ZXh0IChlaXRoZXIgd3JhcHBpbmcpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2lwaGVydGV4dCh2YWx1ZSkge1xuICAgIHJldHVybiBpc1Bhc3N3b3JkQmxvYih2YWx1ZSkgfHwgaXNEZXZpY2VLZXlCbG9iKHZhbHVlKTtcbn1cblxuLy8gLS0tIFVuaWZpZWQgd3JhcCAvIHVud3JhcCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgc2VjcmV0IGZvciBhdC1yZXN0IHN0b3JhZ2UuIFByZWZlcnMgdGhlIHBhc3N3b3JkLWRlcml2ZWQgc2Vzc2lvblxuICoga2V5IHdoZW4gb25lIGlzIGF2YWlsYWJsZSBpbiB0aGlzIGNvbnRleHQgKGJhY2tncm91bmQsIHVubG9ja2VkKTsgb3RoZXJ3aXNlXG4gKiBmYWxscyBiYWNrIHRvIHRoZSBhbHdheXMtYXZhaWxhYmxlIGRldmljZSBrZXkuIE5ldmVyIHJldHVybnMgcGxhaW50ZXh0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE1BTVc7QUFOWDtBQUFBO0FBTU8sTUFBSSxVQUFVO0FBQUEsUUFDakIs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QUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsUUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxRQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsYUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxnQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxrQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxpQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxzQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxtQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxpQkFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsSUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGFBQUEsSUFBQSxJQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsS0FBQSxJQUFBLElBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFVBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEscUJBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsYUFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxlQUFBLElBQUEsS0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGVBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsb0JBQUEsSUFBQSxHQUFB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QU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDakY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssTUFBTSxHQUFHLElBQUk7QUFBQSxRQUM5QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLGlCQUFpQixNQUFNO0FBQ25CLFlBQUksQ0FBQyxTQUFTLFFBQVEsS0FBSyxlQUFlO0FBRXRDLGlCQUFPLFFBQVEsUUFBUSxDQUFDO0FBQUEsUUFDNUI7QUFDQSxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxLQUFLLGNBQWMsR0FBRyxJQUFJO0FBQUEsUUFDdEQ7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssYUFBYSxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ3hGO0FBQUEsSUFDSixJQUFJO0FBQUE7QUFBQSxJQUdKLFdBQVcsU0FBUyxTQUFTLGFBQWE7QUFBQSxFQUM5QztBQUdBLE1BQUksT0FBTztBQUFBLElBQ1AsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxTQUFTLE1BQU07QUFDWCxVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE1BQU0sR0FBRyxJQUFJO0FBQUEsTUFDdEM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDaEU7QUFBQSxJQUNBLFVBQVUsTUFBTTtBQUNaLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxNQUN2QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNqRTtBQUFBLElBQ0EsVUFBVSxNQUFNO0FBQ1osVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2pFO0FBQUEsSUFDQSxPQUFPLE1BQU07QUFDVCxVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLElBQUksR0FBRyxJQUFJO0FBQUEsTUFDcEM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDOUQ7QUFBQSxJQUNBLGNBQWMsTUFBTTtBQUNoQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLFdBQVcsR0FBRyxJQUFJO0FBQUEsTUFDM0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxVQUFVLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDckU7QUFBQSxJQUNBLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDdEU7QUFBQSxFQUNKO0FBSUEsTUFBSSxTQUFTLFNBQVMsU0FBUztBQUFBLElBQzNCLFVBQVUsTUFBTTtBQUVaLFlBQU0sU0FBUyxTQUFTLE9BQU8sT0FBTyxHQUFHLElBQUk7QUFDN0MsYUFBTyxVQUFVLE9BQU8sT0FBTyxTQUFTLGFBQWEsU0FBUyxRQUFRLFFBQVE7QUFBQSxJQUNsRjtBQUFBLElBQ0EsU0FBUyxNQUFNO0FBQ1gsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsT0FBTyxNQUFNLEdBQUcsSUFBSTtBQUFBLE1BQ3hDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsUUFBUSxTQUFTLE9BQU8sS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ3BFO0FBQUEsSUFDQSxTQUFTLFNBQVMsT0FBTztBQUFBLEVBQzdCLElBQUk7OztBQ3hQSjtBQVlBLE1BQU0sV0FBVztBQUlqQixXQUFTLG9CQUFvQixRQUFRO0FBQ2pDLFVBQU0sUUFBUSxJQUFJLFdBQVcsTUFBTTtBQUNuQyxRQUFJLFNBQVM7QUFDYixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ25DLGdCQUFVLE9BQU8sYUFBYSxNQUFNLENBQUMsQ0FBQztBQUFBLElBQzFDO0FBQ0EsV0FBTyxLQUFLLE1BQU07QUFBQSxFQUN0QjtBQTJEQSxpQkFBc0IsZUFBZSxXQUFXLEtBQUssTUFBTTtBQUN2RCxVQUFNLEtBQUssT0FBTyxnQkFBZ0IsSUFBSSxXQUFXLFFBQVEsQ0FBQztBQUMxRCxVQUFNLE1BQU0sSUFBSSxZQUFZO0FBQzVCLFVBQU0sYUFBYSxNQUFNLE9BQU8sT0FBTztBQUFBLE1BQ25DLEVBQUUsTUFBTSxXQUFXLEdBQUc7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsSUFBSSxPQUFPLFNBQVM7QUFBQSxJQUN4QjtBQUVBLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTSxvQkFBb0IsSUFBSTtBQUFBLE1BQzlCLElBQUksb0JBQW9CLEVBQUU7QUFBQSxNQUMxQixZQUFZLG9CQUFvQixVQUFVO0FBQUEsSUFDOUMsQ0FBQztBQUFBLEVBQ0w7OztBQ2hHQTs7O0FDQUE7QUE0QkEsTUFBTUMsWUFBVztBQUNqQixNQUFNLFlBQVk7QUFDbEIsTUFBTSxlQUFlO0FBQ3JCLE1BQU0sZ0JBQWdCO0FBR3RCLFdBQVMsV0FBVyxRQUFRO0FBQ3hCLFVBQU0sUUFBUSxJQUFJLFdBQVcsTUFBTTtBQUNuQyxRQUFJLFNBQVM7QUFDYixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxJQUFLLFdBQVUsT0FBTyxhQUFhLE1BQU0sQ0FBQyxDQUFDO0FBQzdFLFdBQU8sS0FBSyxNQUFNO0FBQUEsRUFDdEI7QUFTQSxNQUFJLGNBQWM7QUFDbEIsTUFBSSxlQUFlO0FBMkJuQixNQUFJLG9CQUFvQjtBQUN4QixNQUFJLG1CQUFtQjtBQUV2QixpQkFBZSxvQkFBb0I7QUFDL0IsV0FBTyxPQUFPLE9BQU87QUFBQSxNQUNqQixFQUFFLE1BQU0sV0FBVyxRQUFRLElBQUk7QUFBQSxNQUMvQjtBQUFBO0FBQUEsTUFDQSxDQUFDLFdBQVcsU0FBUztBQUFBLElBQ3pCO0FBQUEsRUFDSjtBQUVBLFdBQVMscUJBQXFCO0FBQzFCLFdBQU8sT0FBTyxjQUFjLGVBQWUsY0FBYztBQUFBLEVBQzdEO0FBTUEsaUJBQXNCLGVBQWU7QUFDakMsUUFBSSxrQkFBbUIsUUFBTztBQUM5Qix5QkFBcUIsWUFBWTtBQUM3QixVQUFJLENBQUMsbUJBQW1CLEdBQUc7QUFDdkIsWUFBSSxDQUFDLGlCQUFrQixvQkFBbUIsTUFBTSxrQkFBa0I7QUFDbEUsZUFBTztBQUFBLE1BQ1g7QUFFQSxZQUFNLEVBQUUsUUFBQUMsUUFBTyxJQUFJLE1BQU07QUFDekIsWUFBTSxLQUFLLE1BQU1BLFFBQU8sV0FBVyxHQUFHO0FBQUEsUUFDbEMsUUFBUSxHQUFHO0FBQ1AsY0FBSSxDQUFDLEVBQUUsaUJBQWlCLFNBQVMsWUFBWSxHQUFHO0FBQzVDLGNBQUUsa0JBQWtCLFlBQVk7QUFBQSxVQUNwQztBQUFBLFFBQ0o7QUFBQSxNQUNKLENBQUM7QUFDRCxVQUFJLE1BQU0sTUFBTSxHQUFHLElBQUksY0FBYyxhQUFhO0FBQ2xELFVBQUksQ0FBQyxLQUFLO0FBQ04sY0FBTSxNQUFNLGtCQUFrQjtBQUM5QixjQUFNLEdBQUcsSUFBSSxjQUFjLEtBQUssYUFBYTtBQUFBLE1BQ2pEO0FBQ0EsYUFBTztBQUFBLElBQ1gsR0FBRztBQUNILFdBQU87QUFBQSxFQUNYO0FBRUEsaUJBQXNCLHFCQUFxQixXQUFXO0FBQ2xELFVBQU0sTUFBTSxNQUFNLGFBQWE7QUFDL0IsVUFBTSxLQUFLLE9BQU8sZ0JBQWdCLElBQUksV0FBV0MsU0FBUSxDQUFDO0FBQzFELFVBQU0sTUFBTSxJQUFJLFlBQVk7QUFDNUIsVUFBTSxhQUFhLE1BQU0sT0FBTyxPQUFPO0FBQUEsTUFDbkMsRUFBRSxNQUFNLFdBQVcsR0FBRztBQUFBLE1BQUc7QUFBQSxNQUFLLElBQUksT0FBTyxTQUFTO0FBQUEsSUFDdEQ7QUFDQSxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILElBQUksV0FBVyxFQUFFO0FBQUEsTUFDakIsWUFBWSxXQUFXLFVBQVU7QUFBQSxJQUNyQyxDQUFDO0FBQUEsRUFDTDtBQWNPLFdBQVMsZUFBZSxPQUFPO0FBQ2xDLFFBQUksT0FBTyxVQUFVLFNBQVUsUUFBTztBQUN0QyxRQUFJO0FBQ0EsWUFBTSxJQUFJLEtBQUssTUFBTSxLQUFLO0FBQzFCLGFBQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxNQUFNO0FBQUEsSUFDN0QsUUFBUTtBQUFFLGFBQU87QUFBQSxJQUFPO0FBQUEsRUFDNUI7QUFFTyxXQUFTLGdCQUFnQixPQUFPO0FBQ25DLFFBQUksT0FBTyxVQUFVLFNBQVUsUUFBTztBQUN0QyxRQUFJO0FBQ0EsWUFBTSxJQUFJLEtBQUssTUFBTSxLQUFLO0FBQzFCLGFBQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksRUFBRSxNQUFNLEVBQUU7QUFBQSxJQUNqRCxRQUFRO0FBQUUsYUFBTztBQUFBLElBQU87QUFBQSxFQUM1QjtBQUdPLFdBQVMsYUFBYSxPQUFPO0FBQ2hDLFdBQU8sZUFBZSxLQUFLLEtBQUssZ0JBQWdCLEtBQUs7QUFBQSxFQUN6RDtBQVNBLGlCQUFzQixXQUFXLFdBQVc7QUFDeEMsUUFBSSxPQUFPLGNBQWMsWUFBWSxVQUFVLFdBQVcsRUFBRyxRQUFPO0FBQ3BFLFFBQUksYUFBYSxTQUFTLEVBQUcsUUFBTztBQUNwQyxRQUFJLGFBQWE7QUFDYixhQUFPLGVBQWUsV0FBVyxhQUFhLFlBQVk7QUFBQSxJQUM5RDtBQUNBLFdBQU8scUJBQXFCLFNBQVM7QUFBQSxFQUN6Qzs7O0FsQzFLQSxNQUFNLGFBQWE7QUFDbkIsTUFBTSxVQUFVLElBQUksUUFBUTtBQUNyQixNQUFNLHFCQUFxQjtBQUFBLElBQzlCLElBQUksSUFBSSxzQkFBc0I7QUFBQSxJQUM5QixJQUFJLElBQUksd0JBQXdCO0FBQUEsSUFDaEMsSUFBSSxJQUFJLDBCQUEwQjtBQUFBLElBQ2xDLElBQUksSUFBSSw0QkFBNEI7QUFBQSxJQUNwQyxJQUFJLElBQUksZUFBZTtBQUFBLEVBQzNCO0FBMERBLGlCQUFzQixhQUFhO0FBQy9CLFVBQU0sZ0JBQWdCLGdCQUFnQixDQUFDO0FBQ3ZDLFVBQU0sZ0JBQWdCLFlBQVksQ0FBQyxNQUFNLGdCQUFnQixDQUFDLENBQUM7QUFDM0QsUUFBSSxXQUFXLE1BQU0sUUFBUSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsR0FBRztBQUNsRCxZQUFRLElBQUksZ0JBQWdCLE9BQU87QUFDbkMsV0FBTyxVQUFVLFlBQVk7QUFDekIsZ0JBQVUsTUFBTSxRQUFRLFNBQVMsVUFBVTtBQUMzQyxZQUFNLFFBQVEsSUFBSSxFQUFFLFFBQVEsQ0FBQztBQUFBLElBQ2pDO0FBQUEsRUFDSjtBQUVBLGlCQUFlLFFBQVEsU0FBUyxNQUFNO0FBQ2xDLFFBQUksWUFBWSxHQUFHO0FBQ2YsY0FBUSxJQUFJLHlCQUF5QjtBQUNyQyxVQUFJLFdBQVcsTUFBTSxZQUFZO0FBQ2pDLGVBQVMsUUFBUSxhQUFZLFFBQVEsUUFBUSxDQUFDLENBQUU7QUFDaEQsWUFBTSxRQUFRLElBQUksRUFBRSxTQUFTLENBQUM7QUFDOUIsYUFBTyxVQUFVO0FBQUEsSUFDckI7QUFFQSxRQUFJLFlBQVksR0FBRztBQUNmLGNBQVEsSUFBSSx5QkFBeUI7QUFDckMsVUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxZQUFNLFFBQVEsSUFBSSxFQUFFLFNBQVMsQ0FBQztBQUM5QixhQUFPLFVBQVU7QUFBQSxJQUNyQjtBQUVBLFFBQUksWUFBWSxHQUFHO0FBQ2YsY0FBUSxJQUFJLHlCQUF5QjtBQUNyQyxVQUFJLFdBQVcsTUFBTSxZQUFZO0FBQ2pDLGVBQVMsUUFBUSxhQUFZLFFBQVEsZ0JBQWdCLElBQUs7QUFDMUQsWUFBTSxRQUFRLElBQUksRUFBRSxTQUFTLENBQUM7QUFDOUIsYUFBTyxVQUFVO0FBQUEsSUFDckI7QUFFQSxRQUFJLFlBQVksR0FBRztBQUNmLGNBQVEsSUFBSSw4Q0FBOEM7QUFJMUQsVUFBSSxPQUFPLE1BQU0sUUFBUSxJQUFJLEVBQUUsYUFBYSxNQUFNLENBQUM7QUFDbkQsVUFBSSxDQUFDLEtBQUssYUFBYTtBQUNuQixjQUFNLFFBQVEsSUFBSSxFQUFFLGFBQWEsTUFBTSxDQUFDO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVU7QUFBQSxJQUNyQjtBQUVBLFFBQUksWUFBWSxHQUFHO0FBQ2YsY0FBUSxJQUFJLGlEQUFpRDtBQUM3RCxVQUFJLFdBQVcsTUFBTSxZQUFZO0FBQ2pDLGVBQVMsUUFBUSxhQUFXO0FBQ3hCLFlBQUksQ0FBQyxRQUFRLEtBQU0sU0FBUSxPQUFPO0FBQ2xDLFlBQUksUUFBUSxjQUFjLE9BQVcsU0FBUSxZQUFZO0FBQ3pELFlBQUksUUFBUSxpQkFBaUIsT0FBVyxTQUFRLGVBQWU7QUFBQSxNQUNuRSxDQUFDO0FBQ0QsWUFBTSxRQUFRLElBQUksRUFBRSxTQUFTLENBQUM7QUFDOUIsYUFBTyxVQUFVO0FBQUEsSUFDckI7QUFFQSxRQUFJLFlBQVksR0FBRztBQUNmLGNBQVEsSUFBSSxpREFBaUQ7QUFDN0QsWUFBTSxNQUFNLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxHQUFJO0FBQ3hDLFVBQUksV0FBVyxNQUFNLFlBQVk7QUFDakMsZUFBUyxRQUFRLGFBQVc7QUFDeEIsWUFBSSxRQUFRLGNBQWMsT0FBVyxTQUFRLFlBQVk7QUFBQSxNQUM3RCxDQUFDO0FBQ0QsWUFBTSxRQUFRLElBQUksRUFBRSxVQUFVLHFCQUFxQixLQUFLLENBQUM7QUFDekQsYUFBTyxVQUFVO0FBQUEsSUFDckI7QUFBQSxFQUNKO0FBRUEsaUJBQXNCLGNBQWM7QUFDaEMsUUFBSSxXQUFXLE1BQU0sUUFBUSxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQztBQUNqRCxXQUFPLFNBQVM7QUFBQSxFQUNwQjtBQU9BLGlCQUFzQixrQkFBa0I7QUFDcEMsUUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxXQUFPLFNBQVMsSUFBSSxPQUFLLEVBQUUsSUFBSTtBQUFBLEVBQ25DO0FBRUEsaUJBQXNCLGtCQUFrQjtBQUNwQyxVQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQztBQUNuRCxXQUFPLE1BQU07QUFBQSxFQUNqQjtBQU1BLGlCQUFzQixjQUFjLE9BQU87QUFDdkMsUUFBSSxXQUFXLE1BQU0sWUFBWTtBQUNqQyxRQUFJLGVBQWUsTUFBTSxnQkFBZ0I7QUFDekMsYUFBUyxPQUFPLE9BQU8sQ0FBQztBQUN4QixRQUFJLFNBQVMsVUFBVSxHQUFHO0FBQ3RCLFlBQU0sVUFBVTtBQUNoQixZQUFNLFdBQVc7QUFBQSxJQUNyQixPQUFPO0FBRUgsVUFBSSxXQUNBLGlCQUFpQixRQUFRLEtBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJO0FBQ3RELFlBQU0sUUFBUSxJQUFJLEVBQUUsVUFBVSxjQUFjLFNBQVMsQ0FBQztBQUFBLElBQzFEO0FBQUEsRUFDSjtBQUVBLGlCQUFzQixZQUFZO0FBQzlCLFFBQUksb0JBQW9CLE1BQU0sUUFBUSxJQUFJLEVBQUUsbUJBQW1CLE1BQU0sQ0FBQztBQUN0RSxVQUFNLFFBQVEsTUFBTTtBQUNwQixVQUFNLFFBQVEsSUFBSSxpQkFBaUI7QUFBQSxFQUN2QztBQUVBLGlCQUFlLHFCQUFxQjtBQUNoQyxXQUFPLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQUEsRUFDdkU7QUFFQSxpQkFBc0IsZ0JBQWdCLE9BQU8seUJBQXlCLE9BQU8sU0FBUztBQUtsRixRQUFJLFVBQVU7QUFDZCxRQUFJLFNBQVM7QUFDYixRQUFJLFNBQVMsU0FBUztBQUNsQixZQUFNLE1BQU0sTUFBTSxtQkFBbUI7QUFDckMsVUFBSTtBQUFFLGlCQUFTLGlCQUFpQixHQUFHO0FBQUEsTUFBRyxRQUFRO0FBQUEsTUFBdUI7QUFDckUsZ0JBQVUsTUFBTSxXQUFXLEdBQUc7QUFBQSxJQUNsQztBQUNBLFdBQU87QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLE9BQU8sQ0FBQztBQUFBLE1BQ1IsUUFBUSxtQkFBbUIsSUFBSSxRQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxFQUFFO0FBQUEsTUFDOUUsZUFBZTtBQUFBLE1BQ2Y7QUFBQSxNQUNBLFdBQVc7QUFBQSxNQUNYLGNBQWM7QUFBQSxNQUNkLFdBQVcsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLEdBQUk7QUFBQSxJQUMzQztBQUFBLEVBQ0o7QUFFQSxpQkFBZSxnQkFBZ0IsS0FBSyxLQUFLO0FBQ3JDLFFBQUksT0FBTyxNQUFNLFFBQVEsSUFBSSxHQUFHLEdBQUcsR0FBRztBQUN0QyxRQUFJLE9BQU8sUUFBUSxPQUFPLFFBQVc7QUFDakMsWUFBTSxRQUFRLElBQUksRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDaEMsYUFBTztBQUFBLElBQ1g7QUFFQSxXQUFPO0FBQUEsRUFDWDtBQXlKQSxpQkFBc0IsVUFBVTtBQUM1QixRQUFJLFFBQVEsTUFBTSxnQkFBZ0I7QUFDbEMsV0FBTyxNQUFNLElBQUksUUFBUSxZQUFZO0FBQUEsTUFDakMsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLElBQ2IsQ0FBQztBQUFBLEVBQ0w7OztBRGhZQSxNQUFNLFFBQVE7QUFBQSxJQUNWLFVBQVUsQ0FBQztBQUFBO0FBQUEsSUFDWCxhQUFhO0FBQUEsRUFDakI7QUFFQSxXQUFTLEVBQUUsSUFBSTtBQUFFLFdBQU8sU0FBUyxlQUFlLEVBQUU7QUFBQSxFQUFHO0FBRXJELGlCQUFlLGVBQWU7QUFDMUIsVUFBTSxXQUFXLE1BQU0sWUFBWTtBQUNuQyxVQUFNLFFBQVEsTUFBTSxnQkFBZ0I7QUFDcEMsVUFBTSxjQUFjLE1BQU0sZ0JBQWdCO0FBQzFDLFVBQU0sY0FBYztBQUNwQixVQUFNLFdBQVcsQ0FBQztBQUVsQixhQUFTLElBQUksR0FBRyxJQUFJLFNBQVMsUUFBUSxLQUFLO0FBQ3RDLFVBQUksT0FBTztBQUNYLFVBQUk7QUFDQSxlQUFPLE1BQU0sUUFBUSxDQUFDO0FBQUEsTUFDMUIsU0FBUyxHQUFHO0FBQ1IsZUFBTztBQUFBLE1BQ1g7QUFDQSxZQUFNLFNBQVMsS0FBSztBQUFBLFFBQ2hCLE9BQU87QUFBQSxRQUNQLE1BQU0sTUFBTSxDQUFDLEtBQUs7QUFBQSxRQUNsQixNQUFNLFFBQVE7QUFBQSxRQUNkLFVBQVUsTUFBTTtBQUFBLFFBQ2hCLFVBQVU7QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNMO0FBRUEsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLFNBQVM7QUFDZCxVQUFNLE9BQU8sRUFBRSxjQUFjO0FBQzdCLFVBQU0sWUFBWSxFQUFFLFlBQVk7QUFDaEMsVUFBTSxjQUFjLEVBQUUsY0FBYztBQUNwQyxVQUFNLFlBQVksRUFBRSxxQkFBcUI7QUFDekMsVUFBTSxlQUFlLEVBQUUsZ0JBQWdCO0FBRXZDLFFBQUksTUFBTSxTQUFTLFdBQVcsR0FBRztBQUM3QixXQUFLLFlBQVk7QUFDakI7QUFBQSxJQUNKO0FBR0EsVUFBTSxZQUFZLENBQUM7QUFDbkIsVUFBTSxTQUFTLFFBQVEsT0FBSztBQUN4QixVQUFJLEVBQUUsTUFBTTtBQUNSLGtCQUFVLEVBQUUsSUFBSSxLQUFLLFVBQVUsRUFBRSxJQUFJLEtBQUssS0FBSztBQUFBLE1BQ25EO0FBQUEsSUFDSixDQUFDO0FBRUQsU0FBSyxZQUFZLE1BQU0sU0FBUyxJQUFJLE9BQUs7QUFDckMsWUFBTSxTQUFTLFVBQVUsRUFBRSxJQUFJLElBQUk7QUFDbkMsWUFBTSxZQUFZLEVBQUUsUUFBUSxFQUFFLEtBQUssU0FBUyxLQUN0QyxFQUFFLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxRQUFRLEVBQUUsS0FBSyxNQUFNLEVBQUUsSUFDN0MsRUFBRTtBQUVSLGFBQU87QUFBQSxzQ0FDdUIsRUFBRSxXQUFXLGFBQWEsRUFBRSxJQUFJLEVBQUUsV0FBVyxtQkFBbUIsRUFBRTtBQUFBLDhCQUMxRSxFQUFFLEtBQUssa0NBQWtDLEVBQUUsUUFBUTtBQUFBLDhFQUNILEVBQUUsS0FBSztBQUFBLHNCQUMvRCxFQUFFLFdBQVcsWUFBWSxFQUFFLElBQUksRUFBRSxZQUFZLE1BQU0sU0FBUyxTQUFTLElBQUksS0FBSyxFQUFFO0FBQUEseUNBQzdELEVBQUUsSUFBSTtBQUFBO0FBQUE7QUFBQSwwQkFHckIsV0FBVyxFQUFFLElBQUksQ0FBQztBQUFBLDBCQUNsQixTQUFTLHVFQUF1RSxFQUFFO0FBQUE7QUFBQSxnREFFNUQsV0FBVyxTQUFTLENBQUM7QUFBQTtBQUFBLGtCQUVuRCxFQUFFLFdBQVcscURBQXFELEVBQUU7QUFBQTtBQUFBO0FBQUEsSUFHbEYsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUdWLFNBQUssaUJBQWlCLG1CQUFtQixFQUFFLFFBQVEsUUFBTTtBQUNyRCxTQUFHLGlCQUFpQixVQUFVLENBQUMsTUFBTTtBQUNqQyxjQUFNLE1BQU0sU0FBUyxFQUFFLE9BQU8sUUFBUSxPQUFPLEVBQUU7QUFDL0MsY0FBTSxVQUFVLE1BQU0sU0FBUyxLQUFLLE9BQUssRUFBRSxVQUFVLEdBQUc7QUFDeEQsWUFBSSxTQUFTO0FBQ1Qsa0JBQVEsV0FBVyxFQUFFLE9BQU87QUFDNUIsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTCxDQUFDO0FBR0QsU0FBSyxpQkFBaUIsZUFBZSxFQUFFLFFBQVEsVUFBUTtBQUNuRCxXQUFLLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNsQyxZQUFJLEVBQUUsT0FBTyxTQUFTLFdBQVk7QUFDbEMsY0FBTSxNQUFNLFNBQVMsS0FBSyxRQUFRLE9BQU8sRUFBRTtBQUMzQyxjQUFNLFVBQVUsTUFBTSxTQUFTLEtBQUssT0FBSyxFQUFFLFVBQVUsR0FBRztBQUN4RCxZQUFJLFNBQVM7QUFDVCxrQkFBUSxXQUFXLENBQUMsUUFBUTtBQUM1QixpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMLENBQUM7QUFHRCxVQUFNLGdCQUFnQixNQUFNLFNBQVMsT0FBTyxPQUFLLEVBQUUsUUFBUSxFQUFFO0FBQzdELFVBQU0sYUFBYSxNQUFNLFNBQVM7QUFDbEMsY0FBVSxjQUFjLEdBQUcsVUFBVSxXQUFXLGVBQWUsSUFBSSxNQUFNLEVBQUU7QUFHM0UsVUFBTSxpQkFBaUIsTUFBTSxTQUFTLEtBQUssT0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRO0FBQ3hFLFVBQU0sY0FBYyxrQkFBa0I7QUFFdEMsZ0JBQVksVUFBVSxJQUFJLFFBQVE7QUFDbEMsUUFBSSxhQUFhO0FBQ2Isa0JBQVksY0FBYztBQUMxQixrQkFBWSxVQUFVLE9BQU8sUUFBUTtBQUFBLElBQ3pDLFdBQVcsa0JBQWtCLGdCQUFnQixZQUFZO0FBQ3JELGtCQUFZLGNBQWM7QUFDMUIsa0JBQVksVUFBVSxPQUFPLFFBQVE7QUFBQSxJQUN6QztBQUdBLGNBQVUsV0FBVyxrQkFBa0I7QUFDdkMsY0FBVSxjQUFjLG9CQUFvQixhQUFhO0FBRXpELFVBQU0sY0FBYyxrQkFBa0I7QUFDdEMsaUJBQWEsY0FBYyxjQUFjLGlCQUFpQjtBQUFBLEVBQzlEO0FBRUEsaUJBQWUsaUJBQWlCO0FBQzVCLFFBQUksV0FBVyxNQUFNLFNBQVMsT0FBTyxPQUFLLEVBQUUsUUFBUTtBQUdwRCxRQUFJLFNBQVMsV0FBVyxNQUFNLFNBQVMsUUFBUTtBQUMzQyxpQkFBVyxTQUFTLE9BQU8sT0FBSyxDQUFDLEVBQUUsUUFBUTtBQUFBLElBQy9DO0FBRUEsUUFBSSxTQUFTLFdBQVcsRUFBRztBQUUzQixVQUFNLFFBQVEsU0FBUztBQUN2QixRQUFJLENBQUMsUUFBUSxVQUFVLEtBQUssV0FBVyxVQUFVLElBQUksTUFBTSxFQUFFLDBCQUEwQixFQUFHO0FBRzFGLFVBQU0sVUFBVSxTQUFTLElBQUksT0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQztBQUUvRCxlQUFXLE9BQU8sU0FBUztBQUN2QixVQUFJO0FBQ0EsY0FBTSxjQUFjLEdBQUc7QUFBQSxNQUMzQixTQUFTLEdBQUc7QUFDUixnQkFBUSxNQUFNLDRCQUE0QixHQUFHLEtBQUssQ0FBQztBQUFBLE1BQ3ZEO0FBQUEsSUFDSjtBQUVBLFVBQU0sY0FBYyxFQUFFLGNBQWM7QUFDcEMsZ0JBQVksY0FBYyxXQUFXLEtBQUssV0FBVyxVQUFVLElBQUksTUFBTSxFQUFFO0FBQzNFLGdCQUFZLFVBQVUsT0FBTyxRQUFRO0FBQ3JDLGVBQVcsTUFBTSxZQUFZLFVBQVUsSUFBSSxRQUFRLEdBQUcsR0FBSTtBQUUxRCxVQUFNLGFBQWE7QUFBQSxFQUN2QjtBQUVBLFdBQVMsa0JBQWtCO0FBQ3ZCLFVBQU0sY0FBYyxNQUFNLFNBQVMsTUFBTSxPQUFLLEVBQUUsUUFBUTtBQUN4RCxVQUFNLFNBQVMsUUFBUSxPQUFLO0FBQUUsUUFBRSxXQUFXLENBQUM7QUFBQSxJQUFhLENBQUM7QUFDMUQsV0FBTztBQUFBLEVBQ1g7QUFFQSxXQUFTLFdBQVcsS0FBSztBQUNyQixRQUFJLENBQUMsSUFBSyxRQUFPO0FBQ2pCLFdBQU8sT0FBTyxHQUFHLEVBQUUsUUFBUSxNQUFNLE9BQU8sRUFBRSxRQUFRLE1BQU0sTUFBTSxFQUFFLFFBQVEsTUFBTSxNQUFNLEVBQUUsUUFBUSxNQUFNLFFBQVE7QUFBQSxFQUNoSDtBQUdBLFdBQVMsaUJBQWlCLG9CQUFvQixZQUFZO0FBQ3RELFVBQU0sYUFBYTtBQUVuQixNQUFFLHFCQUFxQixFQUFFLGlCQUFpQixTQUFTLGNBQWM7QUFDakUsTUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsU0FBUyxlQUFlO0FBQUEsRUFDakUsQ0FBQzsiLAogICJuYW1lcyI6IFsicGlubyIsICJsb2dnZXIiLCAidHJhbnNtaXQiLCAibGV2ZWwiLCAic2V0T3B0cyIsICJzZWxmIiwgImxlbiIsICJpIiwgIm51bSIsICJsZW4yIiwgIkJ1ZmZlciIsICJ1dGY4VG9CeXRlcyIsICJiYXNlNjRUb0J5dGVzIiwgImkiLCAiYXNjaWlUb0J5dGVzIiwgImJ5dGVMZW5ndGgiLCAidGFyZ2V0IiwgIk5vc3RyRXZlbnRLaW5kIiwgIk5vc3RyTWVzc2FnZVR5cGUiLCAiTmlwNDZNZXRob2QiLCAiTm9zdHJFdmVudEtpbmQiLCAic3RhdGUiLCAiXzBuIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIm51bSIsICJfMG4iLCAiXzFuIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIm51bSIsICJudW0iLCAiXzFuIiwgIl8wbiIsICJfMW4iLCAid2luZG93IiwgIl8wbiIsICJfMW4iLCAid2luZG93IiwgIl8wbiIsICJnZXRQdWJsaWNLZXkiLCAibnVtIiwgIl8ybiIsICJfMG4iLCAiXzFuIiwgIl8wbiIsICJfMW4iLCAiXzJuIiwgIl8zbiIsICJfNG4iLCAicG9pbnRUb0J5dGVzIiwgImVuZG8iLCAiXzBuIiwgIl8ybiIsICJfM24iLCAiXzJuIiwgIl8wbiIsICJMb2dMZXZlbCIsICJwaW5vIiwgImNyeXB0byIsICJnZXRDcnlwdG8iLCAiY3J5cHRvIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJJVl9CWVRFUyJdCn0K
