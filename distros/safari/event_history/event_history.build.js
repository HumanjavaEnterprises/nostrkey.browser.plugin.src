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

  // src/event_history/event_history.js
  init_process();

  // node_modules/idb/build/index.js
  init_process();
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
  init_process();
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

  // src/utilities/utils.js
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

  // src/utilities/seedphrase.js
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

  // node_modules/@noble/hashes/sha2.js
  init_process();

  // node_modules/@noble/hashes/_md.js
  init_process();
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

  // src/utilities/utils.js
  var storage = api.storage.local;
  var RECOMMENDED_RELAYS = [
    new URL("wss://relay.damus.io"),
    new URL("wss://relay.primal.net"),
    new URL("wss://relay.snort.social"),
    new URL("wss://relay.getalby.com/v1"),
    new URL("wss://nos.lol")
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsICJub2RlLXN0dWI6Y3J5cHRvIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9iZWNoMzIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2V2ZW50X2hpc3RvcnkvZXZlbnRfaGlzdG9yeS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaWRiL2J1aWxkL2luZGV4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvZGIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWVkcGhyYXNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy91dGlscy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvc2hhMi50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvX21kLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2Jhc2UudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvcHJvdG9jb2wudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9kaXN0L2VzbS90eXBlcy9tZXNzYWdlcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9ndWFyZHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvbmlwNDYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvY3J5cHRvLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9zZWNwMjU2azEudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L2N1cnZlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy91dGlscy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3QvbW9kdWxhci50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3Qvd2VpZXJzdHJhc3MudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdXRpbHMvbG9nZ2VyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2VuY29kaW5nL2Jhc2U2NC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy92YWxpZGF0aW9uL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L2NyZWF0aW9uLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L3NpZ25pbmcudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMDQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMDEudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMTkudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMjYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDkudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdXRpbHMvZW5jb2RpbmcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIndXNlIHN0cmljdCdcbmZ1bmN0aW9uIHRyeVN0cmluZ2lmeSAobykge1xuICB0cnkgeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkobykgfSBjYXRjaChlKSB7IHJldHVybiAnXCJbQ2lyY3VsYXJdXCInIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtYXRcblxuZnVuY3Rpb24gZm9ybWF0KGYsIGFyZ3MsIG9wdHMpIHtcbiAgdmFyIHNzID0gKG9wdHMgJiYgb3B0cy5zdHJpbmdpZnkpIHx8IHRyeVN0cmluZ2lmeVxuICB2YXIgb2Zmc2V0ID0gMVxuICBpZiAodHlwZW9mIGYgPT09ICdvYmplY3QnICYmIGYgIT09IG51bGwpIHtcbiAgICB2YXIgbGVuID0gYXJncy5sZW5ndGggKyBvZmZzZXRcbiAgICBpZiAobGVuID09PSAxKSByZXR1cm4gZlxuICAgIHZhciBvYmplY3RzID0gbmV3IEFycmF5KGxlbilcbiAgICBvYmplY3RzWzBdID0gc3MoZilcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XG4gICAgICBvYmplY3RzW2luZGV4XSA9IHNzKGFyZ3NbaW5kZXhdKVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJylcbiAgfVxuICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZcbiAgfVxuICB2YXIgYXJnTGVuID0gYXJncy5sZW5ndGhcbiAgaWYgKGFyZ0xlbiA9PT0gMCkgcmV0dXJuIGZcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBhID0gMSAtIG9mZnNldFxuICB2YXIgbGFzdFBvcyA9IC0xXG4gIHZhciBmbGVuID0gKGYgJiYgZi5sZW5ndGgpIHx8IDBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbGVuOykge1xuICAgIGlmIChmLmNoYXJDb2RlQXQoaSkgPT09IDM3ICYmIGkgKyAxIDwgZmxlbikge1xuICAgICAgbGFzdFBvcyA9IGxhc3RQb3MgPiAtMSA/IGxhc3RQb3MgOiAwXG4gICAgICBzd2l0Y2ggKGYuY2hhckNvZGVBdChpICsgMSkpIHtcbiAgICAgICAgY2FzZSAxMDA6IC8vICdkJ1xuICAgICAgICBjYXNlIDEwMjogLy8gJ2YnXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBOdW1iZXIoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDEwNTogLy8gJ2knXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBNYXRoLmZsb29yKE51bWJlcihhcmdzW2FdKSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDc5OiAvLyAnTydcbiAgICAgICAgY2FzZSAxMTE6IC8vICdvJ1xuICAgICAgICBjYXNlIDEwNjogLy8gJ2onXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgYXJnc1thXVxuICAgICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc3RyICs9ICdcXCcnICsgYXJnc1thXSArICdcXCcnXG4gICAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciArPSBhcmdzW2FdLm5hbWUgfHwgJzxhbm9ueW1vdXM+J1xuICAgICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0ciArPSBzcyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMTE1OiAvLyAncydcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IFN0cmluZyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzc6IC8vICclJ1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9ICclJ1xuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGEtLVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICArK2FcbiAgICB9XG4gICAgKytpXG4gIH1cbiAgaWYgKGxhc3RQb3MgPT09IC0xKVxuICAgIHJldHVybiBmXG4gIGVsc2UgaWYgKGxhc3RQb3MgPCBmbGVuKSB7XG4gICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcylcbiAgfVxuXG4gIHJldHVybiBzdHJcbn1cbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgZm9ybWF0ID0gcmVxdWlyZSgncXVpY2stZm9ybWF0LXVuZXNjYXBlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gcGlub1xuXG5jb25zdCBfY29uc29sZSA9IHBmR2xvYmFsVGhpc09yRmFsbGJhY2soKS5jb25zb2xlIHx8IHt9XG5jb25zdCBzdGRTZXJpYWxpemVycyA9IHtcbiAgbWFwSHR0cFJlcXVlc3Q6IG1vY2ssXG4gIG1hcEh0dHBSZXNwb25zZTogbW9jayxcbiAgd3JhcFJlcXVlc3RTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgd3JhcFJlc3BvbnNlU2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBFcnJvclNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICByZXE6IG1vY2ssXG4gIHJlczogbW9jayxcbiAgZXJyOiBhc0VyclZhbHVlLFxuICBlcnJXaXRoQ2F1c2U6IGFzRXJyVmFsdWVcbn1cbmZ1bmN0aW9uIGxldmVsVG9WYWx1ZSAobGV2ZWwsIGxvZ2dlcikge1xuICByZXR1cm4gbGV2ZWwgPT09ICdzaWxlbnQnXG4gICAgPyBJbmZpbml0eVxuICAgIDogbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdXG59XG5jb25zdCBiYXNlTG9nRnVuY3Rpb25TeW1ib2wgPSBTeW1ib2woJ3Bpbm8ubG9nRnVuY3MnKVxuY29uc3QgaGllcmFyY2h5U3ltYm9sID0gU3ltYm9sKCdwaW5vLmhpZXJhcmNoeScpXG5cbmNvbnN0IGxvZ0ZhbGxiYWNrTWFwID0ge1xuICBlcnJvcjogJ2xvZycsXG4gIGZhdGFsOiAnZXJyb3InLFxuICB3YXJuOiAnZXJyb3InLFxuICBpbmZvOiAnbG9nJyxcbiAgZGVidWc6ICdsb2cnLFxuICB0cmFjZTogJ2xvZydcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGRMb2dnZXIgKHBhcmVudExvZ2dlciwgY2hpbGRMb2dnZXIpIHtcbiAgY29uc3QgbmV3RW50cnkgPSB7XG4gICAgbG9nZ2VyOiBjaGlsZExvZ2dlcixcbiAgICBwYXJlbnQ6IHBhcmVudExvZ2dlcltoaWVyYXJjaHlTeW1ib2xdXG4gIH1cbiAgY2hpbGRMb2dnZXJbaGllcmFyY2h5U3ltYm9sXSA9IG5ld0VudHJ5XG59XG5cbmZ1bmN0aW9uIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyAobG9nZ2VyLCBsZXZlbHMsIHByb3RvKSB7XG4gIGNvbnN0IGxvZ0Z1bmN0aW9ucyA9IHt9XG4gIGxldmVscy5mb3JFYWNoKGxldmVsID0+IHtcbiAgICBsb2dGdW5jdGlvbnNbbGV2ZWxdID0gcHJvdG9bbGV2ZWxdID8gcHJvdG9bbGV2ZWxdIDogKF9jb25zb2xlW2xldmVsXSB8fCBfY29uc29sZVtsb2dGYWxsYmFja01hcFtsZXZlbF0gfHwgJ2xvZyddIHx8IG5vb3ApXG4gIH0pXG4gIGxvZ2dlcltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdID0gbG9nRnVuY3Rpb25zXG59XG5cbmZ1bmN0aW9uIHNob3VsZFNlcmlhbGl6ZSAoc2VyaWFsaXplLCBzZXJpYWxpemVycykge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXJpYWxpemUpKSB7XG4gICAgY29uc3QgaGFzVG9GaWx0ZXIgPSBzZXJpYWxpemUuZmlsdGVyKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gayAhPT0gJyFzdGRTZXJpYWxpemVycy5lcnInXG4gICAgfSlcbiAgICByZXR1cm4gaGFzVG9GaWx0ZXJcbiAgfSBlbHNlIGlmIChzZXJpYWxpemUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2VyaWFsaXplcnMpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gcGlubyAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLmJyb3dzZXIgPSBvcHRzLmJyb3dzZXIgfHwge31cblxuICBjb25zdCB0cmFuc21pdCA9IG9wdHMuYnJvd3Nlci50cmFuc21pdFxuICBpZiAodHJhbnNtaXQgJiYgdHlwZW9mIHRyYW5zbWl0LnNlbmQgIT09ICdmdW5jdGlvbicpIHsgdGhyb3cgRXJyb3IoJ3Bpbm86IHRyYW5zbWl0IG9wdGlvbiBtdXN0IGhhdmUgYSBzZW5kIGZ1bmN0aW9uJykgfVxuXG4gIGNvbnN0IHByb3RvID0gb3B0cy5icm93c2VyLndyaXRlIHx8IF9jb25zb2xlXG4gIGlmIChvcHRzLmJyb3dzZXIud3JpdGUpIG9wdHMuYnJvd3Nlci5hc09iamVjdCA9IHRydWVcbiAgY29uc3Qgc2VyaWFsaXplcnMgPSBvcHRzLnNlcmlhbGl6ZXJzIHx8IHt9XG4gIGNvbnN0IHNlcmlhbGl6ZSA9IHNob3VsZFNlcmlhbGl6ZShvcHRzLmJyb3dzZXIuc2VyaWFsaXplLCBzZXJpYWxpemVycylcbiAgbGV0IHN0ZEVyclNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemVcblxuICBpZiAoXG4gICAgQXJyYXkuaXNBcnJheShvcHRzLmJyb3dzZXIuc2VyaWFsaXplKSAmJlxuICAgIG9wdHMuYnJvd3Nlci5zZXJpYWxpemUuaW5kZXhPZignIXN0ZFNlcmlhbGl6ZXJzLmVycicpID4gLTFcbiAgKSBzdGRFcnJTZXJpYWxpemUgPSBmYWxzZVxuXG4gIGNvbnN0IGN1c3RvbUxldmVscyA9IE9iamVjdC5rZXlzKG9wdHMuY3VzdG9tTGV2ZWxzIHx8IHt9KVxuICBjb25zdCBsZXZlbHMgPSBbJ2Vycm9yJywgJ2ZhdGFsJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZSddLmNvbmNhdChjdXN0b21MZXZlbHMpXG5cbiAgaWYgKHR5cGVvZiBwcm90byA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgcHJvdG9bbGV2ZWxdID0gcHJvdG9cbiAgICB9KVxuICB9XG4gIGlmIChvcHRzLmVuYWJsZWQgPT09IGZhbHNlIHx8IG9wdHMuYnJvd3Nlci5kaXNhYmxlZCkgb3B0cy5sZXZlbCA9ICdzaWxlbnQnXG4gIGNvbnN0IGxldmVsID0gb3B0cy5sZXZlbCB8fCAnaW5mbydcbiAgY29uc3QgbG9nZ2VyID0gT2JqZWN0LmNyZWF0ZShwcm90bylcbiAgaWYgKCFsb2dnZXIubG9nKSBsb2dnZXIubG9nID0gbm9vcFxuXG4gIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyhsb2dnZXIsIGxldmVscywgcHJvdG8pXG4gIC8vIHNldHVwIHJvb3QgaGllcmFyY2h5IGVudHJ5XG4gIGFwcGVuZENoaWxkTG9nZ2VyKHt9LCBsb2dnZXIpXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsVmFsJywge1xuICAgIGdldDogZ2V0TGV2ZWxWYWxcbiAgfSlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsJywge1xuICAgIGdldDogZ2V0TGV2ZWwsXG4gICAgc2V0OiBzZXRMZXZlbFxuICB9KVxuXG4gIGNvbnN0IHNldE9wdHMgPSB7XG4gICAgdHJhbnNtaXQsXG4gICAgc2VyaWFsaXplLFxuICAgIGFzT2JqZWN0OiBvcHRzLmJyb3dzZXIuYXNPYmplY3QsXG4gICAgYXNPYmplY3RCaW5kaW5nc09ubHk6IG9wdHMuYnJvd3Nlci5hc09iamVjdEJpbmRpbmdzT25seSxcbiAgICBmb3JtYXR0ZXJzOiBvcHRzLmJyb3dzZXIuZm9ybWF0dGVycyxcbiAgICByZXBvcnRDYWxsZXI6IG9wdHMuYnJvd3Nlci5yZXBvcnRDYWxsZXIsXG4gICAgbGV2ZWxzLFxuICAgIHRpbWVzdGFtcDogZ2V0VGltZUZ1bmN0aW9uKG9wdHMpLFxuICAgIG1lc3NhZ2VLZXk6IG9wdHMubWVzc2FnZUtleSB8fCAnbXNnJyxcbiAgICBvbkNoaWxkOiBvcHRzLm9uQ2hpbGQgfHwgbm9vcFxuICB9XG4gIGxvZ2dlci5sZXZlbHMgPSBnZXRMZXZlbHMob3B0cylcbiAgbG9nZ2VyLmxldmVsID0gbGV2ZWxcblxuICBsb2dnZXIuaXNMZXZlbEVuYWJsZWQgPSBmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICBpZiAoIXRoaXMubGV2ZWxzLnZhbHVlc1tsZXZlbF0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdID49IHRoaXMubGV2ZWxzLnZhbHVlc1t0aGlzLmxldmVsXVxuICB9XG4gIGxvZ2dlci5zZXRNYXhMaXN0ZW5lcnMgPSBsb2dnZXIuZ2V0TWF4TGlzdGVuZXJzID1cbiAgbG9nZ2VyLmVtaXQgPSBsb2dnZXIuYWRkTGlzdGVuZXIgPSBsb2dnZXIub24gPVxuICBsb2dnZXIucHJlcGVuZExpc3RlbmVyID0gbG9nZ2VyLm9uY2UgPVxuICBsb2dnZXIucHJlcGVuZE9uY2VMaXN0ZW5lciA9IGxvZ2dlci5yZW1vdmVMaXN0ZW5lciA9XG4gIGxvZ2dlci5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBsb2dnZXIubGlzdGVuZXJzID1cbiAgbG9nZ2VyLmxpc3RlbmVyQ291bnQgPSBsb2dnZXIuZXZlbnROYW1lcyA9XG4gIGxvZ2dlci53cml0ZSA9IGxvZ2dlci5mbHVzaCA9IG5vb3BcbiAgbG9nZ2VyLnNlcmlhbGl6ZXJzID0gc2VyaWFsaXplcnNcbiAgbG9nZ2VyLl9zZXJpYWxpemUgPSBzZXJpYWxpemVcbiAgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUgPSBzdGRFcnJTZXJpYWxpemVcbiAgbG9nZ2VyLmNoaWxkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIGNoaWxkLmNhbGwodGhpcywgc2V0T3B0cywgLi4uYXJncykgfVxuXG4gIGlmICh0cmFuc21pdCkgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoKVxuXG4gIGZ1bmN0aW9uIGdldExldmVsVmFsICgpIHtcbiAgICByZXR1cm4gbGV2ZWxUb1ZhbHVlKHRoaXMubGV2ZWwsIHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMZXZlbCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xldmVsXG4gIH1cbiAgZnVuY3Rpb24gc2V0TGV2ZWwgKGxldmVsKSB7XG4gICAgaWYgKGxldmVsICE9PSAnc2lsZW50JyAmJiAhdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gbGV2ZWwgJyArIGxldmVsKVxuICAgIH1cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsXG5cbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnZXJyb3InKSAvLyA8LS0gbXVzdCBzdGF5IGZpcnN0XG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2ZhdGFsJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnd2FybicpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2luZm8nKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdkZWJ1ZycpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ3RyYWNlJylcblxuICAgIGN1c3RvbUxldmVscy5mb3JFYWNoKChsZXZlbCkgPT4ge1xuICAgICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgbGV2ZWwpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoaWxkIChzZXRPcHRzLCBiaW5kaW5ncywgY2hpbGRPcHRpb25zKSB7XG4gICAgaWYgKCFiaW5kaW5ncykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGJpbmRpbmdzIGZvciBjaGlsZCBQaW5vJylcbiAgICB9XG4gICAgY2hpbGRPcHRpb25zID0gY2hpbGRPcHRpb25zIHx8IHt9XG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBiaW5kaW5ncy5zZXJpYWxpemVycykge1xuICAgICAgY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzID0gYmluZGluZ3Muc2VyaWFsaXplcnNcbiAgICB9XG4gICAgY29uc3QgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMgPSBjaGlsZE9wdGlvbnMuc2VyaWFsaXplcnNcbiAgICBpZiAoc2VyaWFsaXplICYmIGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzKSB7XG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemVycyA9IE9iamVjdC5hc3NpZ24oe30sIHNlcmlhbGl6ZXJzLCBjaGlsZE9wdGlvbnNTZXJpYWxpemVycylcbiAgICAgIHZhciBjaGlsZFNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemUgPT09IHRydWVcbiAgICAgICAgPyBPYmplY3Qua2V5cyhjaGlsZFNlcmlhbGl6ZXJzKVxuICAgICAgICA6IHNlcmlhbGl6ZVxuICAgICAgZGVsZXRlIGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgICBhcHBseVNlcmlhbGl6ZXJzKFtiaW5kaW5nc10sIGNoaWxkU2VyaWFsaXplLCBjaGlsZFNlcmlhbGl6ZXJzLCB0aGlzLl9zdGRFcnJTZXJpYWxpemUpXG4gICAgfVxuICAgIGZ1bmN0aW9uIENoaWxkIChwYXJlbnQpIHtcbiAgICAgIHRoaXMuX2NoaWxkTGV2ZWwgPSAocGFyZW50Ll9jaGlsZExldmVsIHwgMCkgKyAxXG5cbiAgICAgIC8vIG1ha2Ugc3VyZSBiaW5kaW5ncyBhcmUgYXZhaWxhYmxlIGluIHRoZSBgc2V0YCBmdW5jdGlvblxuICAgICAgdGhpcy5iaW5kaW5ncyA9IGJpbmRpbmdzXG5cbiAgICAgIGlmIChjaGlsZFNlcmlhbGl6ZXJzKSB7XG4gICAgICAgIHRoaXMuc2VyaWFsaXplcnMgPSBjaGlsZFNlcmlhbGl6ZXJzXG4gICAgICAgIHRoaXMuX3NlcmlhbGl6ZSA9IGNoaWxkU2VyaWFsaXplXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNtaXQpIHtcbiAgICAgICAgdGhpcy5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKFxuICAgICAgICAgIFtdLmNvbmNhdChwYXJlbnQuX2xvZ0V2ZW50LmJpbmRpbmdzLCBiaW5kaW5ncylcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICBDaGlsZC5wcm90b3R5cGUgPSB0aGlzXG4gICAgY29uc3QgbmV3TG9nZ2VyID0gbmV3IENoaWxkKHRoaXMpXG5cbiAgICAvLyBtdXN0IGhhcHBlbiBiZWZvcmUgdGhlIGxldmVsIGlzIGFzc2lnbmVkXG4gICAgYXBwZW5kQ2hpbGRMb2dnZXIodGhpcywgbmV3TG9nZ2VyKVxuICAgIG5ld0xvZ2dlci5jaGlsZCA9IGZ1bmN0aW9uICguLi5hcmdzKSB7IHJldHVybiBjaGlsZC5jYWxsKHRoaXMsIHNldE9wdHMsIC4uLmFyZ3MpIH1cbiAgICAvLyByZXF1aXJlZCB0byBhY3R1YWxseSBpbml0aWFsaXplIHRoZSBsb2dnZXIgZnVuY3Rpb25zIGZvciBhbnkgZ2l2ZW4gY2hpbGRcbiAgICBuZXdMb2dnZXIubGV2ZWwgPSBjaGlsZE9wdGlvbnMubGV2ZWwgfHwgdGhpcy5sZXZlbCAvLyBhbGxvdyBsZXZlbCB0byBiZSBzZXQgYnkgY2hpbGRPcHRpb25zXG4gICAgc2V0T3B0cy5vbkNoaWxkKG5ld0xvZ2dlcilcblxuICAgIHJldHVybiBuZXdMb2dnZXJcbiAgfVxuICByZXR1cm4gbG9nZ2VyXG59XG5cbmZ1bmN0aW9uIGdldExldmVscyAob3B0cykge1xuICBjb25zdCBjdXN0b21MZXZlbHMgPSBvcHRzLmN1c3RvbUxldmVscyB8fCB7fVxuXG4gIGNvbnN0IHZhbHVlcyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbm8ubGV2ZWxzLnZhbHVlcywgY3VzdG9tTGV2ZWxzKVxuICBjb25zdCBsYWJlbHMgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5vLmxldmVscy5sYWJlbHMsIGludmVydE9iamVjdChjdXN0b21MZXZlbHMpKVxuXG4gIHJldHVybiB7XG4gICAgdmFsdWVzLFxuICAgIGxhYmVsc1xuICB9XG59XG5cbmZ1bmN0aW9uIGludmVydE9iamVjdCAob2JqKSB7XG4gIGNvbnN0IGludmVydGVkID0ge31cbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpbnZlcnRlZFtvYmpba2V5XV0gPSBrZXlcbiAgfSlcbiAgcmV0dXJuIGludmVydGVkXG59XG5cbnBpbm8ubGV2ZWxzID0ge1xuICB2YWx1ZXM6IHtcbiAgICBmYXRhbDogNjAsXG4gICAgZXJyb3I6IDUwLFxuICAgIHdhcm46IDQwLFxuICAgIGluZm86IDMwLFxuICAgIGRlYnVnOiAyMCxcbiAgICB0cmFjZTogMTBcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgMTA6ICd0cmFjZScsXG4gICAgMjA6ICdkZWJ1ZycsXG4gICAgMzA6ICdpbmZvJyxcbiAgICA0MDogJ3dhcm4nLFxuICAgIDUwOiAnZXJyb3InLFxuICAgIDYwOiAnZmF0YWwnXG4gIH1cbn1cblxucGluby5zdGRTZXJpYWxpemVycyA9IHN0ZFNlcmlhbGl6ZXJzXG5waW5vLnN0ZFRpbWVGdW5jdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG51bGxUaW1lLCBlcG9jaFRpbWUsIHVuaXhUaW1lLCBpc29UaW1lIH0pXG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdDaGFpbiAobG9nZ2VyKSB7XG4gIGNvbnN0IGJpbmRpbmdzID0gW11cbiAgaWYgKGxvZ2dlci5iaW5kaW5ncykge1xuICAgIGJpbmRpbmdzLnB1c2gobG9nZ2VyLmJpbmRpbmdzKVxuICB9XG5cbiAgLy8gdHJhdmVyc2UgdXAgdGhlIHRyZWUgdG8gZ2V0IGFsbCBiaW5kaW5nc1xuICBsZXQgaGllcmFyY2h5ID0gbG9nZ2VyW2hpZXJhcmNoeVN5bWJvbF1cbiAgd2hpbGUgKGhpZXJhcmNoeS5wYXJlbnQpIHtcbiAgICBoaWVyYXJjaHkgPSBoaWVyYXJjaHkucGFyZW50XG4gICAgaWYgKGhpZXJhcmNoeS5sb2dnZXIuYmluZGluZ3MpIHtcbiAgICAgIGJpbmRpbmdzLnB1c2goaGllcmFyY2h5LmxvZ2dlci5iaW5kaW5ncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmluZGluZ3MucmV2ZXJzZSgpXG59XG5cbmZ1bmN0aW9uIHNldCAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpIHtcbiAgLy8gb3ZlcnJpZGUgdGhlIGN1cnJlbnQgbG9nIGZ1bmN0aW9ucyB3aXRoIGVpdGhlciBgbm9vcGAgb3IgdGhlIGJhc2UgbG9nIGZ1bmN0aW9uXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBsZXZlbCwge1xuICAgIHZhbHVlOiAobGV2ZWxUb1ZhbHVlKHNlbGYubGV2ZWwsIHJvb3RMb2dnZXIpID4gbGV2ZWxUb1ZhbHVlKGxldmVsLCByb290TG9nZ2VyKVxuICAgICAgPyBub29wXG4gICAgICA6IHJvb3RMb2dnZXJbYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sXVtsZXZlbF0pLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG5cbiAgaWYgKHNlbGZbbGV2ZWxdID09PSBub29wKSB7XG4gICAgaWYgKCFvcHRzLnRyYW5zbWl0KSByZXR1cm5cblxuICAgIGNvbnN0IHRyYW5zbWl0TGV2ZWwgPSBvcHRzLnRyYW5zbWl0LmxldmVsIHx8IHNlbGYubGV2ZWxcbiAgICBjb25zdCB0cmFuc21pdFZhbHVlID0gbGV2ZWxUb1ZhbHVlKHRyYW5zbWl0TGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgY29uc3QgbWV0aG9kVmFsdWUgPSBsZXZlbFRvVmFsdWUobGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gIH1cblxuICAvLyBtYWtlIHN1cmUgdGhlIGxvZyBmb3JtYXQgaXMgY29ycmVjdFxuICBzZWxmW2xldmVsXSA9IGNyZWF0ZVdyYXAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpXG5cbiAgLy8gcHJlcGVuZCBiaW5kaW5ncyBpZiBpdCBpcyBub3QgdGhlIHJvb3QgbG9nZ2VyXG4gIGNvbnN0IGJpbmRpbmdzID0gZ2V0QmluZGluZ0NoYWluKHNlbGYpXG4gIGlmIChiaW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBlYXJseSBleGl0IGluIGNhc2UgZm9yIHJvb3RMb2dnZXJcbiAgICByZXR1cm5cbiAgfVxuICBzZWxmW2xldmVsXSA9IHByZXBlbmRCaW5kaW5nc0luQXJndW1lbnRzKGJpbmRpbmdzLCBzZWxmW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gcHJlcGVuZEJpbmRpbmdzSW5Bcmd1bWVudHMgKGJpbmRpbmdzLCBsb2dGdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGxvZ0Z1bmMuYXBwbHkodGhpcywgWy4uLmJpbmRpbmdzLCAuLi5hcmd1bWVudHNdKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyYXAgKHNlbGYsIG9wdHMsIHJvb3RMb2dnZXIsIGxldmVsKSB7XG4gIHJldHVybiAoZnVuY3Rpb24gKHdyaXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIExPRyAoKSB7XG4gICAgICBjb25zdCB0cyA9IG9wdHMudGltZXN0YW1wKClcbiAgICAgIGNvbnN0IGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aClcbiAgICAgIGNvbnN0IHByb3RvID0gKE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgPT09IF9jb25zb2xlKSA/IF9jb25zb2xlIDogdGhpc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG5cbiAgICAgIHZhciBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2VcbiAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZSkge1xuICAgICAgICBhcHBseVNlcmlhbGl6ZXJzKGFyZ3MsIHRoaXMuX3NlcmlhbGl6ZSwgdGhpcy5zZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgICAgICBhcmdzSXNTZXJpYWxpemVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG9wdHMuYXNPYmplY3QgfHwgb3B0cy5mb3JtYXR0ZXJzKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IGFzT2JqZWN0KHRoaXMsIGxldmVsLCBhcmdzLCB0cywgb3B0cylcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyICYmIG91dCAmJiBvdXQubGVuZ3RoID4gMCAmJiBvdXRbMF0gJiYgdHlwZW9mIG91dFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGVyID0gZ2V0Q2FsbGVyTG9jYXRpb24oKVxuICAgICAgICAgICAgaWYgKGNhbGxlcikgb3V0WzBdLmNhbGxlciA9IGNhbGxlclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGUuY2FsbChwcm90bywgLi4ub3V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlciA9IGdldENhbGxlckxvY2F0aW9uKClcbiAgICAgICAgICAgIGlmIChjYWxsZXIpIGFyZ3MucHVzaChjYWxsZXIpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB3cml0ZS5hcHBseShwcm90bywgYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMudHJhbnNtaXQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNtaXRMZXZlbCA9IG9wdHMudHJhbnNtaXQubGV2ZWwgfHwgc2VsZi5fbGV2ZWxcbiAgICAgICAgY29uc3QgdHJhbnNtaXRWYWx1ZSA9IGxldmVsVG9WYWx1ZSh0cmFuc21pdExldmVsLCByb290TG9nZ2VyKVxuICAgICAgICBjb25zdCBtZXRob2RWYWx1ZSA9IGxldmVsVG9WYWx1ZShsZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gICAgICAgIHRyYW5zbWl0KHRoaXMsIHtcbiAgICAgICAgICB0cyxcbiAgICAgICAgICBtZXRob2RMZXZlbDogbGV2ZWwsXG4gICAgICAgICAgbWV0aG9kVmFsdWUsXG4gICAgICAgICAgdHJhbnNtaXRMZXZlbCxcbiAgICAgICAgICB0cmFuc21pdFZhbHVlOiByb290TG9nZ2VyLmxldmVscy52YWx1ZXNbb3B0cy50cmFuc21pdC5sZXZlbCB8fCBzZWxmLl9sZXZlbF0sXG4gICAgICAgICAgc2VuZDogb3B0cy50cmFuc21pdC5zZW5kLFxuICAgICAgICAgIHZhbDogbGV2ZWxUb1ZhbHVlKHNlbGYuX2xldmVsLCByb290TG9nZ2VyKVxuICAgICAgICB9LCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkKVxuICAgICAgfVxuICAgIH1cbiAgfSkoc2VsZltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gYXNPYmplY3QgKGxvZ2dlciwgbGV2ZWwsIGFyZ3MsIHRzLCBvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBsZXZlbDogbGV2ZWxGb3JtYXR0ZXIsXG4gICAgbG9nOiBsb2dPYmplY3RGb3JtYXR0ZXIgPSAob2JqKSA9PiBvYmpcbiAgfSA9IG9wdHMuZm9ybWF0dGVycyB8fCB7fVxuICBjb25zdCBhcmdzQ2xvbmVkID0gYXJncy5zbGljZSgpXG4gIGxldCBtc2cgPSBhcmdzQ2xvbmVkWzBdXG4gIGNvbnN0IGxvZ09iamVjdCA9IHt9XG5cbiAgbGV0IGx2bCA9IChsb2dnZXIuX2NoaWxkTGV2ZWwgfCAwKSArIDFcbiAgaWYgKGx2bCA8IDEpIGx2bCA9IDFcblxuICBpZiAodHMpIHtcbiAgICBsb2dPYmplY3QudGltZSA9IHRzXG4gIH1cblxuICBpZiAobGV2ZWxGb3JtYXR0ZXIpIHtcbiAgICBjb25zdCBmb3JtYXR0ZWRMZXZlbCA9IGxldmVsRm9ybWF0dGVyKGxldmVsLCBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF0pXG4gICAgT2JqZWN0LmFzc2lnbihsb2dPYmplY3QsIGZvcm1hdHRlZExldmVsKVxuICB9IGVsc2Uge1xuICAgIGxvZ09iamVjdC5sZXZlbCA9IGxvZ2dlci5sZXZlbHMudmFsdWVzW2xldmVsXVxuICB9XG5cbiAgaWYgKG9wdHMuYXNPYmplY3RCaW5kaW5nc09ubHkpIHtcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZm9ybWF0dGVkTG9nT2JqZWN0ID0gbG9nT2JqZWN0Rm9ybWF0dGVyKGxvZ09iamVjdClcbiAgICByZXR1cm4gW2Zvcm1hdHRlZExvZ09iamVjdCwgLi4uYXJnc0Nsb25lZF1cbiAgfSBlbHNlIHtcbiAgICAvLyBkZWxpYmVyYXRlLCBjYXRjaGluZyBvYmplY3RzLCBhcnJheXNcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgICBtc2cgPSBhcmdzQ2xvbmVkLmxlbmd0aCA/IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpIDogdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbXNnID09PSAnc3RyaW5nJykgbXNnID0gZm9ybWF0KGFyZ3NDbG9uZWQuc2hpZnQoKSwgYXJnc0Nsb25lZClcbiAgICBpZiAobXNnICE9PSB1bmRlZmluZWQpIGxvZ09iamVjdFtvcHRzLm1lc3NhZ2VLZXldID0gbXNnXG5cbiAgICBjb25zdCBmb3JtYXR0ZWRMb2dPYmplY3QgPSBsb2dPYmplY3RGb3JtYXR0ZXIobG9nT2JqZWN0KVxuICAgIHJldHVybiBbZm9ybWF0dGVkTG9nT2JqZWN0XVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5U2VyaWFsaXplcnMgKGFyZ3MsIHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMsIHN0ZEVyclNlcmlhbGl6ZSkge1xuICBmb3IgKGNvbnN0IGkgaW4gYXJncykge1xuICAgIGlmIChzdGRFcnJTZXJpYWxpemUgJiYgYXJnc1tpXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBhcmdzW2ldID0gcGluby5zdGRTZXJpYWxpemVycy5lcnIoYXJnc1tpXSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzW2ldKSAmJiBzZXJpYWxpemUpIHtcbiAgICAgIGZvciAoY29uc3QgayBpbiBhcmdzW2ldKSB7XG4gICAgICAgIGlmIChzZXJpYWxpemUuaW5kZXhPZihrKSA+IC0xICYmIGsgaW4gc2VyaWFsaXplcnMpIHtcbiAgICAgICAgICBhcmdzW2ldW2tdID0gc2VyaWFsaXplcnNba10oYXJnc1tpXVtrXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc21pdCAobG9nZ2VyLCBvcHRzLCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2VuZCA9IG9wdHMuc2VuZFxuICBjb25zdCB0cyA9IG9wdHMudHNcbiAgY29uc3QgbWV0aG9kTGV2ZWwgPSBvcHRzLm1ldGhvZExldmVsXG4gIGNvbnN0IG1ldGhvZFZhbHVlID0gb3B0cy5tZXRob2RWYWx1ZVxuICBjb25zdCB2YWwgPSBvcHRzLnZhbFxuICBjb25zdCBiaW5kaW5ncyA9IGxvZ2dlci5fbG9nRXZlbnQuYmluZGluZ3NcblxuICBpZiAoIWFyZ3NJc1NlcmlhbGl6ZWQpIHtcbiAgICBhcHBseVNlcmlhbGl6ZXJzKFxuICAgICAgYXJncyxcbiAgICAgIGxvZ2dlci5fc2VyaWFsaXplIHx8IE9iamVjdC5rZXlzKGxvZ2dlci5zZXJpYWxpemVycyksXG4gICAgICBsb2dnZXIuc2VyaWFsaXplcnMsXG4gICAgICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplXG4gICAgKVxuICB9XG5cbiAgbG9nZ2VyLl9sb2dFdmVudC50cyA9IHRzXG4gIGxvZ2dlci5fbG9nRXZlbnQubWVzc2FnZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7XG4gICAgLy8gYmluZGluZ3MgY2FuIG9ubHkgYmUgb2JqZWN0cywgc28gcmVmZXJlbmNlIGVxdWFsaXR5IGNoZWNrIHZpYSBpbmRleE9mIGlzIGZpbmVcbiAgICByZXR1cm4gYmluZGluZ3MuaW5kZXhPZihhcmcpID09PSAtMVxuICB9KVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQubGV2ZWwubGFiZWwgPSBtZXRob2RMZXZlbFxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLnZhbHVlID0gbWV0aG9kVmFsdWVcblxuICBzZW5kKG1ldGhvZExldmVsLCBsb2dnZXIuX2xvZ0V2ZW50LCB2YWwpXG5cbiAgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoYmluZGluZ3MpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ0V2ZW50U2hhcGUgKGJpbmRpbmdzKSB7XG4gIHJldHVybiB7XG4gICAgdHM6IDAsXG4gICAgbWVzc2FnZXM6IFtdLFxuICAgIGJpbmRpbmdzOiBiaW5kaW5ncyB8fCBbXSxcbiAgICBsZXZlbDogeyBsYWJlbDogJycsIHZhbHVlOiAwIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhc0VyclZhbHVlIChlcnIpIHtcbiAgY29uc3Qgb2JqID0ge1xuICAgIHR5cGU6IGVyci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgIG1zZzogZXJyLm1lc3NhZ2UsXG4gICAgc3RhY2s6IGVyci5zdGFja1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVycikge1xuICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IGVycltrZXldXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gZ2V0VGltZUZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICh0eXBlb2Ygb3B0cy50aW1lc3RhbXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0cy50aW1lc3RhbXBcbiAgfVxuICBpZiAob3B0cy50aW1lc3RhbXAgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG51bGxUaW1lXG4gIH1cbiAgcmV0dXJuIGVwb2NoVGltZVxufVxuXG5mdW5jdGlvbiBtb2NrICgpIHsgcmV0dXJuIHt9IH1cbmZ1bmN0aW9uIHBhc3N0aHJvdWdoIChhKSB7IHJldHVybiBhIH1cbmZ1bmN0aW9uIG5vb3AgKCkge31cblxuZnVuY3Rpb24gbnVsbFRpbWUgKCkgeyByZXR1cm4gZmFsc2UgfVxuZnVuY3Rpb24gZXBvY2hUaW1lICgpIHsgcmV0dXJuIERhdGUubm93KCkgfVxuZnVuY3Rpb24gdW5peFRpbWUgKCkgeyByZXR1cm4gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMC4wKSB9XG5mdW5jdGlvbiBpc29UaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkpLnRvSVNPU3RyaW5nKCkgfSAvLyB1c2luZyBEYXRlLm5vdygpIGZvciB0ZXN0YWJpbGl0eVxuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIHBmR2xvYmFsVGhpc09yRmFsbGJhY2sgKCkge1xuICBmdW5jdGlvbiBkZWZkIChvKSB7IHJldHVybiB0eXBlb2YgbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbyB9XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGdsb2JhbFRoaXNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ2dsb2JhbFRoaXMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIE9iamVjdC5wcm90b3R5cGUuZ2xvYmFsVGhpc1xuICAgICAgICByZXR1cm4gKHRoaXMuZ2xvYmFsVGhpcyA9IHRoaXMpXG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICByZXR1cm4gZ2xvYmFsVGhpc1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmQoc2VsZikgfHwgZGVmZCh3aW5kb3cpIHx8IGRlZmQodGhpcykgfHwge31cbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gcGlub1xubW9kdWxlLmV4cG9ydHMucGlubyA9IHBpbm9cblxuLy8gQXR0ZW1wdCB0byBleHRyYWN0IHRoZSB1c2VyIGNhbGxzaXRlIChmaWxlOmxpbmU6Y29sdW1uKVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGdldENhbGxlckxvY2F0aW9uICgpIHtcbiAgY29uc3Qgc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIGlmICghc3RhY2spIHJldHVybiBudWxsXG4gIGNvbnN0IGxpbmVzID0gc3RhY2suc3BsaXQoJ1xcbicpXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsID0gbGluZXNbaV0udHJpbSgpXG4gICAgLy8gc2tpcCBmcmFtZXMgZnJvbSB0aGlzIGZpbGUgYW5kIGludGVybmFsc1xuICAgIGlmICgvKF5hdFxccyspPyhjcmVhdGVXcmFwfExPR3xzZXRcXHMqXFwofGFzT2JqZWN0fE9iamVjdFxcLmFwcGx5fEZ1bmN0aW9uXFwuYXBwbHkpLy50ZXN0KGwpKSBjb250aW51ZVxuICAgIGlmIChsLmluZGV4T2YoJ2Jyb3dzZXIuanMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgaWYgKGwuaW5kZXhPZignbm9kZTppbnRlcm5hbCcpICE9PSAtMSkgY29udGludWVcbiAgICBpZiAobC5pbmRleE9mKCdub2RlX21vZHVsZXMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgLy8gdHJ5IGZvcm1hdHMgbGlrZTogYXQgZnVuYyAoZmlsZTpsaW5lOmNvbCkgb3IgYXQgZmlsZTpsaW5lOmNvbFxuICAgIGxldCBtID0gbC5tYXRjaCgvXFwoKC4qPyk6KFxcZCspOihcXGQrKVxcKS8pXG4gICAgaWYgKCFtKSBtID0gbC5tYXRjaCgvYXRcXHMrKC4qPyk6KFxcZCspOihcXGQrKS8pXG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBtWzFdXG4gICAgICBjb25zdCBsaW5lID0gbVsyXVxuICAgICAgY29uc3QgY29sID0gbVszXVxuICAgICAgcmV0dXJuIGZpbGUgKyAnOicgKyBsaW5lICsgJzonICsgY29sXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG4iLCAibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCAiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5iZWNoMzJtID0gZXhwb3J0cy5iZWNoMzIgPSB2b2lkIDA7XG5jb25zdCBBTFBIQUJFVCA9ICdxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bCc7XG5jb25zdCBBTFBIQUJFVF9NQVAgPSB7fTtcbmZvciAobGV0IHogPSAwOyB6IDwgQUxQSEFCRVQubGVuZ3RoOyB6KyspIHtcbiAgICBjb25zdCB4ID0gQUxQSEFCRVQuY2hhckF0KHopO1xuICAgIEFMUEhBQkVUX01BUFt4XSA9IHo7XG59XG5mdW5jdGlvbiBwb2x5bW9kU3RlcChwcmUpIHtcbiAgICBjb25zdCBiID0gcHJlID4+IDI1O1xuICAgIHJldHVybiAoKChwcmUgJiAweDFmZmZmZmYpIDw8IDUpIF5cbiAgICAgICAgKC0oKGIgPj4gMCkgJiAxKSAmIDB4M2I2YTU3YjIpIF5cbiAgICAgICAgKC0oKGIgPj4gMSkgJiAxKSAmIDB4MjY1MDhlNmQpIF5cbiAgICAgICAgKC0oKGIgPj4gMikgJiAxKSAmIDB4MWVhMTE5ZmEpIF5cbiAgICAgICAgKC0oKGIgPj4gMykgJiAxKSAmIDB4M2Q0MjMzZGQpIF5cbiAgICAgICAgKC0oKGIgPj4gNCkgJiAxKSAmIDB4MmExNDYyYjMpKTtcbn1cbmZ1bmN0aW9uIHByZWZpeENoayhwcmVmaXgpIHtcbiAgICBsZXQgY2hrID0gMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMzMgfHwgYyA+IDEyNilcbiAgICAgICAgICAgIHJldHVybiAnSW52YWxpZCBwcmVmaXggKCcgKyBwcmVmaXggKyAnKSc7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAoYyA+PiA1KTtcbiAgICB9XG4gICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB2ID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAodiAmIDB4MWYpO1xuICAgIH1cbiAgICByZXR1cm4gY2hrO1xufVxuZnVuY3Rpb24gY29udmVydChkYXRhLCBpbkJpdHMsIG91dEJpdHMsIHBhZCkge1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgbGV0IGJpdHMgPSAwO1xuICAgIGNvbnN0IG1heFYgPSAoMSA8PCBvdXRCaXRzKSAtIDE7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIDw8IGluQml0cykgfCBkYXRhW2ldO1xuICAgICAgICBiaXRzICs9IGluQml0cztcbiAgICAgICAgd2hpbGUgKGJpdHMgPj0gb3V0Qml0cykge1xuICAgICAgICAgICAgYml0cyAtPSBvdXRCaXRzO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKHZhbHVlID4+IGJpdHMpICYgbWF4Vik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhZCkge1xuICAgICAgICBpZiAoYml0cyA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoYml0cyA+PSBpbkJpdHMpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VzcyBwYWRkaW5nJztcbiAgICAgICAgaWYgKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpXG4gICAgICAgICAgICByZXR1cm4gJ05vbi16ZXJvIHBhZGRpbmcnO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gdG9Xb3JkcyhieXRlcykge1xuICAgIHJldHVybiBjb252ZXJ0KGJ5dGVzLCA4LCA1LCB0cnVlKTtcbn1cbmZ1bmN0aW9uIGZyb21Xb3Jkc1Vuc2FmZSh3b3Jkcykge1xuICAgIGNvbnN0IHJlcyA9IGNvbnZlcnQod29yZHMsIDUsIDgsIGZhbHNlKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMpKVxuICAgICAgICByZXR1cm4gcmVzO1xufVxuZnVuY3Rpb24gZnJvbVdvcmRzKHdvcmRzKSB7XG4gICAgY29uc3QgcmVzID0gY29udmVydCh3b3JkcywgNSwgOCwgZmFsc2UpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlcykpXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG59XG5mdW5jdGlvbiBnZXRMaWJyYXJ5RnJvbUVuY29kaW5nKGVuY29kaW5nKSB7XG4gICAgbGV0IEVOQ09ESU5HX0NPTlNUO1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2JlY2gzMicpIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAweDJiYzgzMGEzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbmNvZGUocHJlZml4LCB3b3JkcywgTElNSVQpIHtcbiAgICAgICAgTElNSVQgPSBMSU1JVCB8fCA5MDtcbiAgICAgICAgaWYgKHByZWZpeC5sZW5ndGggKyA3ICsgd29yZHMubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeGNlZWRzIGxlbmd0aCBsaW1pdCcpO1xuICAgICAgICBwcmVmaXggPSBwcmVmaXgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGNoayBtb2RcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY2hrKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHByZWZpeCArICcxJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgeCA9IHdvcmRzW2ldO1xuICAgICAgICAgICAgaWYgKHggPj4gNSAhPT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbiA1LWJpdCB3b3JkJyk7XG4gICAgICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4geDtcbiAgICAgICAgICAgIHJlc3VsdCArPSBBTFBIQUJFVC5jaGFyQXQoeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoayk7XG4gICAgICAgIH1cbiAgICAgICAgY2hrIF49IEVOQ09ESU5HX0NPTlNUO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgdiA9IChjaGsgPj4gKCg1IC0gaSkgKiA1KSkgJiAweDFmO1xuICAgICAgICAgICAgcmVzdWx0ICs9IEFMUEhBQkVULmNoYXJBdCh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBfX2RlY29kZShzdHIsIExJTUlUKSB7XG4gICAgICAgIExJTUlUID0gTElNSVQgfHwgOTA7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoIDwgOClcbiAgICAgICAgICAgIHJldHVybiBzdHIgKyAnIHRvbyBzaG9ydCc7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VlZHMgbGVuZ3RoIGxpbWl0JztcbiAgICAgICAgLy8gZG9uJ3QgYWxsb3cgbWl4ZWQgY2FzZVxuICAgICAgICBjb25zdCBsb3dlcmVkID0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHVwcGVyZWQgPSBzdHIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKHN0ciAhPT0gbG93ZXJlZCAmJiBzdHIgIT09IHVwcGVyZWQpXG4gICAgICAgICAgICByZXR1cm4gJ01peGVkLWNhc2Ugc3RyaW5nICcgKyBzdHI7XG4gICAgICAgIHN0ciA9IGxvd2VyZWQ7XG4gICAgICAgIGNvbnN0IHNwbGl0ID0gc3RyLmxhc3RJbmRleE9mKCcxJyk7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gJ05vIHNlcGFyYXRvciBjaGFyYWN0ZXIgZm9yICcgKyBzdHI7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAnTWlzc2luZyBwcmVmaXggZm9yICcgKyBzdHI7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHN0ci5zbGljZSgwLCBzcGxpdCk7XG4gICAgICAgIGNvbnN0IHdvcmRDaGFycyA9IHN0ci5zbGljZShzcGxpdCArIDEpO1xuICAgICAgICBpZiAod29yZENoYXJzLmxlbmd0aCA8IDYpXG4gICAgICAgICAgICByZXR1cm4gJ0RhdGEgdG9vIHNob3J0JztcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gY2hrO1xuICAgICAgICBjb25zdCB3b3JkcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRDaGFycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHdvcmRDaGFycy5jaGFyQXQoaSk7XG4gICAgICAgICAgICBjb25zdCB2ID0gQUxQSEFCRVRfTUFQW2NdO1xuICAgICAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1Vua25vd24gY2hhcmFjdGVyICcgKyBjO1xuICAgICAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeIHY7XG4gICAgICAgICAgICAvLyBub3QgaW4gdGhlIGNoZWNrc3VtP1xuICAgICAgICAgICAgaWYgKGkgKyA2ID49IHdvcmRDaGFycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB3b3Jkcy5wdXNoKHYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGsgIT09IEVOQ09ESU5HX0NPTlNUKVxuICAgICAgICAgICAgcmV0dXJuICdJbnZhbGlkIGNoZWNrc3VtIGZvciAnICsgc3RyO1xuICAgICAgICByZXR1cm4geyBwcmVmaXgsIHdvcmRzIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlY29kZVVuc2FmZShzdHIsIExJTUlUKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IF9fZGVjb2RlKHN0ciwgTElNSVQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNvZGUoc3RyLCBMSU1JVCkge1xuICAgICAgICBjb25zdCByZXMgPSBfX2RlY29kZShzdHIsIExJTUlUKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGRlY29kZVVuc2FmZSxcbiAgICAgICAgZGVjb2RlLFxuICAgICAgICBlbmNvZGUsXG4gICAgICAgIHRvV29yZHMsXG4gICAgICAgIGZyb21Xb3Jkc1Vuc2FmZSxcbiAgICAgICAgZnJvbVdvcmRzLFxuICAgIH07XG59XG5leHBvcnRzLmJlY2gzMiA9IGdldExpYnJhcnlGcm9tRW5jb2RpbmcoJ2JlY2gzMicpO1xuZXhwb3J0cy5iZWNoMzJtID0gZ2V0TGlicmFyeUZyb21FbmNvZGluZygnYmVjaDMybScpO1xuIiwgIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbi8vIFN1cHBvcnQgZGVjb2RpbmcgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ3MsIGFzIE5vZGUuanMgZG9lcy5cbi8vIFNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0I1VSTF9hcHBsaWNhdGlvbnNcbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIGdldExlbnMgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyBUcmltIG9mZiBleHRyYSBieXRlcyBhZnRlciBwbGFjZWhvbGRlciBieXRlcyBhcmUgZm91bmRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVhdGdhbW1pdC9iYXNlNjQtanMvaXNzdWVzLzQyXG4gIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKCc9JylcbiAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW5cblxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlblxuICAgID8gMFxuICAgIDogNCAtICh2YWxpZExlbiAlIDQpXG5cbiAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXVxufVxuXG4vLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiBfYnl0ZUxlbmd0aCAoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuXG4gIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpXG5cbiAgdmFyIGN1ckJ5dGUgPSAwXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICB2YXIgbGVuID0gcGxhY2VIb2xkZXJzTGVuID4gMFxuICAgID8gdmFsaWRMZW4gLSA0XG4gICAgOiB2YWxpZExlblxuXG4gIHZhciBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwgIi8qISBpZWVlNzU0LiBCU0QtMy1DbGF1c2UgTGljZW5zZS4gRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnL29wZW5zb3VyY2U+ICovXG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCAiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbmNvbnN0IGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbmNvbnN0IGN1c3RvbUluc3BlY3RTeW1ib2wgPVxuICAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sWydmb3InXSA9PT0gJ2Z1bmN0aW9uJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA/IFN5bWJvbFsnZm9yJ10oJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA6IG51bGxcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG5jb25zdCBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGNvbnN0IHByb3RvID0geyBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH0gfVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgVWludDhBcnJheS5wcm90b3R5cGUpXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGFyciwgcHJvdG8pXG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAncGFyZW50Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclxuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ29mZnNldCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5ieXRlT2Zmc2V0XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAobGVuZ3RoKSB7XG4gIGlmIChsZW5ndGggPiBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIGxlbmd0aCArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1ZiwgQnVmZmVyLnByb3RvdHlwZSlcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbmZ1bmN0aW9uIGZyb20gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheVZpZXcodmFsdWUpXG4gIH1cblxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2UodmFsdWUsIEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBBcnJheUJ1ZmZlcikpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIChpc0luc3RhbmNlKHZhbHVlLCBTaGFyZWRBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgU2hhcmVkQXJyYXlCdWZmZXIpKSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgKVxuICB9XG5cbiAgY29uc3QgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgY29uc3QgYiA9IGZyb21PYmplY3QodmFsdWUpXG4gIGlmIChiKSByZXR1cm4gYlxuXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9QcmltaXRpdmUgIT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLnByb3RvdHlwZSwgVWludDhBcnJheS5wcm90b3R5cGUpXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLCBVaW50OEFycmF5KVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gIH1cblxuICBjb25zdCBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICBsZXQgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcblxuICBjb25zdCBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICBjb25zdCBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheVZpZXcgKGFycmF5Vmlldykge1xuICBpZiAoaXNJbnN0YW5jZShhcnJheVZpZXcsIFVpbnQ4QXJyYXkpKSB7XG4gICAgY29uc3QgY29weSA9IG5ldyBVaW50OEFycmF5KGFycmF5VmlldylcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKGNvcHkuYnVmZmVyLCBjb3B5LmJ5dGVPZmZzZXQsIGNvcHkuYnl0ZUxlbmd0aClcbiAgfVxuICByZXR1cm4gZnJvbUFycmF5TGlrZShhcnJheVZpZXcpXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJvZmZzZXRcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcImxlbmd0aFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBsZXQgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVmLCBCdWZmZXIucHJvdG90eXBlKVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIGNvbnN0IGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgY29uc3QgYnVmID0gY3JlYXRlQnVmZmVyKGxlbilcblxuICAgIGlmIChidWYubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnVmXG4gICAgfVxuXG4gICAgb2JqLmNvcHkoYnVmLCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIGJ1ZlxuICB9XG5cbiAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYU4ob2JqLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICB9XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqKVxuICB9XG5cbiAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iai5kYXRhKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZSAmJlxuICAgIGIgIT09IEJ1ZmZlci5wcm90b3R5cGUgLy8gc28gQnVmZmVyLmlzQnVmZmVyKEJ1ZmZlci5wcm90b3R5cGUpIHdpbGwgYmUgZmFsc2Vcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmIChpc0luc3RhbmNlKGEsIFVpbnQ4QXJyYXkpKSBhID0gQnVmZmVyLmZyb20oYSwgYS5vZmZzZXQsIGEuYnl0ZUxlbmd0aClcbiAgaWYgKGlzSW5zdGFuY2UoYiwgVWludDhBcnJheSkpIGIgPSBCdWZmZXIuZnJvbShiLCBiLm9mZnNldCwgYi5ieXRlTGVuZ3RoKVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJidWYxXCIsIFwiYnVmMlwiIGFyZ3VtZW50cyBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5J1xuICAgIClcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIGxldCB4ID0gYS5sZW5ndGhcbiAgbGV0IHkgPSBiLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgbGV0IGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICBsZXQgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIGxldCBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgaWYgKHBvcyArIGJ1Zi5sZW5ndGggPiBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIGJ1ZiA9IEJ1ZmZlci5mcm9tKGJ1ZilcbiAgICAgICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgYnVmLFxuICAgICAgICAgIHBvc1xuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIH1cbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgY29uc3QgbXVzdE1hdGNoID0gKGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSA9PT0gdHJ1ZSlcbiAgaWYgKCFtdXN0TWF0Y2ggJiYgbGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICBsZXQgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB7XG4gICAgICAgICAgcmV0dXJuIG11c3RNYXRjaCA/IC0xIDogdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgfVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJjaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCAoYW5kIHRoZSBgaXMtYnVmZmVyYCBucG0gcGFja2FnZSlcbi8vIHRvIGRldGVjdCBhIEJ1ZmZlciBpbnN0YW5jZS4gSXQncyBub3QgcG9zc2libGUgdG8gdXNlIGBpbnN0YW5jZW9mIEJ1ZmZlcmBcbi8vIHJlbGlhYmx5IGluIGEgYnJvd3NlcmlmeSBjb250ZXh0IGJlY2F1c2UgdGhlcmUgY291bGQgYmUgbXVsdGlwbGUgZGlmZmVyZW50XG4vLyBjb3BpZXMgb2YgdGhlICdidWZmZXInIHBhY2thZ2UgaW4gdXNlLiBUaGlzIG1ldGhvZCB3b3JrcyBldmVuIGZvciBCdWZmZXJcbi8vIGluc3RhbmNlcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIGFub3RoZXIgY29weSBvZiB0aGUgYGJ1ZmZlcmAgcGFja2FnZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE1NFxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgY29uc3QgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcgPSBCdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgbGV0IHN0ciA9ICcnXG4gIGNvbnN0IG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKVxuICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5pZiAoY3VzdG9tSW5zcGVjdFN5bWJvbCkge1xuICBCdWZmZXIucHJvdG90eXBlW2N1c3RvbUluc3BlY3RTeW1ib2xdID0gQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmIChpc0luc3RhbmNlKHRhcmdldCwgVWludDhBcnJheSkpIHtcbiAgICB0YXJnZXQgPSBCdWZmZXIuZnJvbSh0YXJnZXQsIHRhcmdldC5vZmZzZXQsIHRhcmdldC5ieXRlTGVuZ3RoKVxuICB9XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInRhcmdldFwiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXkuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdGFyZ2V0KVxuICAgIClcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIGxldCB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICBsZXQgeSA9IGVuZCAtIHN0YXJ0XG4gIGNvbnN0IGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgY29uc3QgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgY29uc3QgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgW3ZhbF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIGxldCBpbmRleFNpemUgPSAxXG4gIGxldCBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIGxldCB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIGxldCBpXG4gIGlmIChkaXIpIHtcbiAgICBsZXQgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIGNvbnN0IHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBsZXQgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKG51bWJlcklzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICBjb25zdCByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIGxldCBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgY29uc3QgcmVzID0gW11cblxuICBsZXQgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgY29uc3QgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgbGV0IGNvZGVQb2ludCA9IG51bGxcbiAgICBsZXQgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKVxuICAgICAgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKVxuICAgICAgICAgID8gM1xuICAgICAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpXG4gICAgICAgICAgICAgID8gMlxuICAgICAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIGxldCBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbmNvbnN0IE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICBjb25zdCBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIGxldCByZXMgPSAnJ1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGxldCByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICBsZXQgb3V0ID0gJydcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gaGV4U2xpY2VMb29rdXBUYWJsZVtidWZbaV1dXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBjb25zdCBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICBsZXQgcmVzID0gJydcbiAgLy8gSWYgYnl0ZXMubGVuZ3RoIGlzIG9kZCwgdGhlIGxhc3QgOCBiaXRzIG11c3QgYmUgaWdub3JlZCAoc2FtZSBhcyBub2RlLmpzKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICBjb25zdCBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihuZXdCdWYsIEJ1ZmZlci5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludExFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0XVxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50QkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIGxldCBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDggPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDE2TEUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQzMkxFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDMyQkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnVUludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ1VJbnQ2NExFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgbG8gPSBmaXJzdCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDI0XG5cbiAgY29uc3QgaGkgPSB0aGlzWysrb2Zmc2V0XSArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgbGFzdCAqIDIgKiogMjRcblxuICByZXR1cm4gQmlnSW50KGxvKSArIChCaWdJbnQoaGkpIDw8IEJpZ0ludCgzMikpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdVSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnVUludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCBoaSA9IGZpcnN0ICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF1cblxuICBjb25zdCBsbyA9IHRoaXNbKytvZmZzZXRdICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgbGFzdFxuXG4gIHJldHVybiAoQmlnSW50KGhpKSA8PCBCaWdJbnQoMzIpKSArIEJpZ0ludChsbylcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldF1cbiAgbGV0IG11bCA9IDFcbiAgbGV0IGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICBsZXQgaSA9IGJ5dGVMZW5ndGhcbiAgbGV0IG11bCA9IDFcbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICBjb25zdCB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnSW50NjRMRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgNF0gK1xuICAgIHRoaXNbb2Zmc2V0ICsgNV0gKiAyICoqIDggK1xuICAgIHRoaXNbb2Zmc2V0ICsgNl0gKiAyICoqIDE2ICtcbiAgICAobGFzdCA8PCAyNCkgLy8gT3ZlcmZsb3dcblxuICByZXR1cm4gKEJpZ0ludCh2YWwpIDw8IEJpZ0ludCgzMikpICtcbiAgICBCaWdJbnQoZmlyc3QgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAyNClcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ0ludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ0ludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCB2YWwgPSAoZmlyc3QgPDwgMjQpICsgLy8gT3ZlcmZsb3dcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XVxuXG4gIHJldHVybiAoQmlnSW50KHZhbCkgPDwgQmlnSW50KDMyKSkgK1xuICAgIEJpZ0ludCh0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjQgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIGxhc3QpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnRMRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludEJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIGxldCBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgbGV0IG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50OCA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQxNkxFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDMyTEUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQzMkJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIHdydEJpZ1VJbnQ2NExFIChidWYsIHZhbHVlLCBvZmZzZXQsIG1pbiwgbWF4KSB7XG4gIGNoZWNrSW50QkkodmFsdWUsIG1pbiwgbWF4LCBidWYsIG9mZnNldCwgNylcblxuICBsZXQgbG8gPSBOdW1iZXIodmFsdWUgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsZXQgaGkgPSBOdW1iZXIodmFsdWUgPj4gQmlnSW50KDMyKSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIHJldHVybiBvZmZzZXRcbn1cblxuZnVuY3Rpb24gd3J0QmlnVUludDY0QkUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbWluLCBtYXgpIHtcbiAgY2hlY2tJbnRCSSh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCA3KVxuXG4gIGxldCBsbyA9IE51bWJlcih2YWx1ZSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCArIDddID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQgKyA2XSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0ICsgNV0gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCArIDRdID0gbG9cbiAgbGV0IGhpID0gTnVtYmVyKHZhbHVlID4+IEJpZ0ludCgzMikgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQgKyAzXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0ICsgMl0gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCArIDFdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXRdID0gaGlcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ1VJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnVUludDY0TEUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRMRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBCaWdJbnQoMCksIEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnVUludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdVSW50NjRCRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NEJFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIEJpZ0ludCgwKSwgQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSAwXG4gIGxldCBtdWwgPSAxXG4gIGxldCBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSBieXRlTGVuZ3RoIC0gMVxuICBsZXQgbXVsID0gMVxuICBsZXQgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ0ludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdJbnQ2NExFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0TEUodGhpcywgdmFsdWUsIG9mZnNldCwgLUJpZ0ludCgnMHg4MDAwMDAwMDAwMDAwMDAwJyksIEJpZ0ludCgnMHg3ZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ0ludDY0QkUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRCRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAtQmlnSW50KCcweDgwMDAwMDAwMDAwMDAwMDAnKSwgQmlnSW50KCcweDdmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IHNob3VsZCBiZSBhIEJ1ZmZlcicpXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICBjb25zdCBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKChlbmNvZGluZyA9PT0gJ3V0ZjgnICYmIGNvZGUgPCAxMjgpIHx8XG4gICAgICAgICAgZW5jb2RpbmcgPT09ICdsYXRpbjEnKSB7XG4gICAgICAgIC8vIEZhc3QgcGF0aDogSWYgYHZhbGAgZml0cyBpbnRvIGEgc2luZ2xlIGJ5dGUsIHVzZSB0aGF0IG51bWVyaWMgdmFsdWUuXG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWwgPSBOdW1iZXIodmFsKVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIGxldCBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgICBjb25zdCBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgdmFsdWUgXCInICsgdmFsICtcbiAgICAgICAgJ1wiIGlzIGludmFsaWQgZm9yIGFyZ3VtZW50IFwidmFsdWVcIicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIENVU1RPTSBFUlJPUlNcbi8vID09PT09PT09PT09PT1cblxuLy8gU2ltcGxpZmllZCB2ZXJzaW9ucyBmcm9tIE5vZGUsIGNoYW5nZWQgZm9yIEJ1ZmZlci1vbmx5IHVzYWdlXG5jb25zdCBlcnJvcnMgPSB7fVxuZnVuY3Rpb24gRSAoc3ltLCBnZXRNZXNzYWdlLCBCYXNlKSB7XG4gIGVycm9yc1tzeW1dID0gY2xhc3MgTm9kZUVycm9yIGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgc3VwZXIoKVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ21lc3NhZ2UnLCB7XG4gICAgICAgIHZhbHVlOiBnZXRNZXNzYWdlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIC8vIEFkZCB0aGUgZXJyb3IgY29kZSB0byB0aGUgbmFtZSB0byBpbmNsdWRlIGl0IGluIHRoZSBzdGFjayB0cmFjZS5cbiAgICAgIHRoaXMubmFtZSA9IGAke3RoaXMubmFtZX0gWyR7c3ltfV1gXG4gICAgICAvLyBBY2Nlc3MgdGhlIHN0YWNrIHRvIGdlbmVyYXRlIHRoZSBlcnJvciBtZXNzYWdlIGluY2x1ZGluZyB0aGUgZXJyb3IgY29kZVxuICAgICAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgICAgIHRoaXMuc3RhY2sgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgICAgIC8vIFJlc2V0IHRoZSBuYW1lIHRvIHRoZSBhY3R1YWwgbmFtZS5cbiAgICAgIGRlbGV0ZSB0aGlzLm5hbWVcbiAgICB9XG5cbiAgICBnZXQgY29kZSAoKSB7XG4gICAgICByZXR1cm4gc3ltXG4gICAgfVxuXG4gICAgc2V0IGNvZGUgKHZhbHVlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvZGUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRvU3RyaW5nICgpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9IFske3N5bX1dOiAke3RoaXMubWVzc2FnZX1gXG4gICAgfVxuICB9XG59XG5cbkUoJ0VSUl9CVUZGRVJfT1VUX09GX0JPVU5EUycsXG4gIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJldHVybiBgJHtuYW1lfSBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHNgXG4gICAgfVxuXG4gICAgcmV0dXJuICdBdHRlbXB0IHRvIGFjY2VzcyBtZW1vcnkgb3V0c2lkZSBidWZmZXIgYm91bmRzJ1xuICB9LCBSYW5nZUVycm9yKVxuRSgnRVJSX0lOVkFMSURfQVJHX1RZUEUnLFxuICBmdW5jdGlvbiAobmFtZSwgYWN0dWFsKSB7XG4gICAgcmV0dXJuIGBUaGUgXCIke25hbWV9XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBhY3R1YWx9YFxuICB9LCBUeXBlRXJyb3IpXG5FKCdFUlJfT1VUX09GX1JBTkdFJyxcbiAgZnVuY3Rpb24gKHN0ciwgcmFuZ2UsIGlucHV0KSB7XG4gICAgbGV0IG1zZyA9IGBUaGUgdmFsdWUgb2YgXCIke3N0cn1cIiBpcyBvdXQgb2YgcmFuZ2UuYFxuICAgIGxldCByZWNlaXZlZCA9IGlucHV0XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIoaW5wdXQpICYmIE1hdGguYWJzKGlucHV0KSA+IDIgKiogMzIpIHtcbiAgICAgIHJlY2VpdmVkID0gYWRkTnVtZXJpY2FsU2VwYXJhdG9yKFN0cmluZyhpbnB1dCkpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdiaWdpbnQnKSB7XG4gICAgICByZWNlaXZlZCA9IFN0cmluZyhpbnB1dClcbiAgICAgIGlmIChpbnB1dCA+IEJpZ0ludCgyKSAqKiBCaWdJbnQoMzIpIHx8IGlucHV0IDwgLShCaWdJbnQoMikgKiogQmlnSW50KDMyKSkpIHtcbiAgICAgICAgcmVjZWl2ZWQgPSBhZGROdW1lcmljYWxTZXBhcmF0b3IocmVjZWl2ZWQpXG4gICAgICB9XG4gICAgICByZWNlaXZlZCArPSAnbidcbiAgICB9XG4gICAgbXNnICs9IGAgSXQgbXVzdCBiZSAke3JhbmdlfS4gUmVjZWl2ZWQgJHtyZWNlaXZlZH1gXG4gICAgcmV0dXJuIG1zZ1xuICB9LCBSYW5nZUVycm9yKVxuXG5mdW5jdGlvbiBhZGROdW1lcmljYWxTZXBhcmF0b3IgKHZhbCkge1xuICBsZXQgcmVzID0gJydcbiAgbGV0IGkgPSB2YWwubGVuZ3RoXG4gIGNvbnN0IHN0YXJ0ID0gdmFsWzBdID09PSAnLScgPyAxIDogMFxuICBmb3IgKDsgaSA+PSBzdGFydCArIDQ7IGkgLT0gMykge1xuICAgIHJlcyA9IGBfJHt2YWwuc2xpY2UoaSAtIDMsIGkpfSR7cmVzfWBcbiAgfVxuICByZXR1cm4gYCR7dmFsLnNsaWNlKDAsIGkpfSR7cmVzfWBcbn1cblxuLy8gQ0hFQ0sgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gY2hlY2tCb3VuZHMgKGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGlmIChidWZbb2Zmc2V0XSA9PT0gdW5kZWZpbmVkIHx8IGJ1ZltvZmZzZXQgKyBieXRlTGVuZ3RoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCBidWYubGVuZ3RoIC0gKGJ5dGVMZW5ndGggKyAxKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0ludEJJICh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikge1xuICAgIGNvbnN0IG4gPSB0eXBlb2YgbWluID09PSAnYmlnaW50JyA/ICduJyA6ICcnXG4gICAgbGV0IHJhbmdlXG4gICAgaWYgKGJ5dGVMZW5ndGggPiAzKSB7XG4gICAgICBpZiAobWluID09PSAwIHx8IG1pbiA9PT0gQmlnSW50KDApKSB7XG4gICAgICAgIHJhbmdlID0gYD49IDAke259IGFuZCA8IDIke259ICoqICR7KGJ5dGVMZW5ndGggKyAxKSAqIDh9JHtufWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gYD49IC0oMiR7bn0gKiogJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufSkgYW5kIDwgMiAqKiBgICtcbiAgICAgICAgICAgICAgICBgJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZ2UgPSBgPj0gJHttaW59JHtufSBhbmQgPD0gJHttYXh9JHtufWBcbiAgICB9XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfT1VUX09GX1JBTkdFKCd2YWx1ZScsIHJhbmdlLCB2YWx1ZSlcbiAgfVxuICBjaGVja0JvdW5kcyhidWYsIG9mZnNldCwgYnl0ZUxlbmd0aClcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVOdW1iZXIgKHZhbHVlLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfSU5WQUxJRF9BUkdfVFlQRShuYW1lLCAnbnVtYmVyJywgdmFsdWUpXG4gIH1cbn1cblxuZnVuY3Rpb24gYm91bmRzRXJyb3IgKHZhbHVlLCBsZW5ndGgsIHR5cGUpIHtcbiAgaWYgKE1hdGguZmxvb3IodmFsdWUpICE9PSB2YWx1ZSkge1xuICAgIHZhbGlkYXRlTnVtYmVyKHZhbHVlLCB0eXBlKVxuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX09VVF9PRl9SQU5HRSh0eXBlIHx8ICdvZmZzZXQnLCAnYW4gaW50ZWdlcicsIHZhbHVlKVxuICB9XG5cbiAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9CVUZGRVJfT1VUX09GX0JPVU5EUygpXG4gIH1cblxuICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9PVVRfT0ZfUkFOR0UodHlwZSB8fCAnb2Zmc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA+PSAke3R5cGUgPyAxIDogMH0gYW5kIDw9ICR7bGVuZ3RofWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSlcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5jb25zdCBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHRha2VzIGVxdWFsIHNpZ25zIGFzIGVuZCBvZiB0aGUgQmFzZTY0IGVuY29kaW5nXG4gIHN0ciA9IHN0ci5zcGxpdCgnPScpWzBdXG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgbGV0IGNvZGVQb2ludFxuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIGxldCBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICBjb25zdCBieXRlcyA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIGNvbnN0IGJ5dGVBcnJheSA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgbGV0IGMsIGhpLCBsb1xuICBjb25zdCBieXRlQXJyYXkgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGxldCBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG4vLyBBcnJheUJ1ZmZlciBvciBVaW50OEFycmF5IG9iamVjdHMgZnJvbSBvdGhlciBjb250ZXh0cyAoaS5lLiBpZnJhbWVzKSBkbyBub3QgcGFzc1xuLy8gdGhlIGBpbnN0YW5jZW9mYCBjaGVjayBidXQgdGhleSBzaG91bGQgYmUgdHJlYXRlZCBhcyBvZiB0aGF0IHR5cGUuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNjZcbmZ1bmN0aW9uIGlzSW5zdGFuY2UgKG9iaiwgdHlwZSkge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgdHlwZSB8fFxuICAgIChvYmogIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPSBudWxsICYmXG4gICAgICBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gdHlwZS5uYW1lKVxufVxuZnVuY3Rpb24gbnVtYmVySXNOYU4gKG9iaikge1xuICAvLyBGb3IgSUUxMSBzdXBwb3J0XG4gIHJldHVybiBvYmogIT09IG9iaiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG4vLyBDcmVhdGUgbG9va3VwIHRhYmxlIGZvciBgdG9TdHJpbmcoJ2hleCcpYFxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMjE5XG5jb25zdCBoZXhTbGljZUxvb2t1cFRhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgYWxwaGFiZXQgPSAnMDEyMzQ1Njc4OWFiY2RlZidcbiAgY29uc3QgdGFibGUgPSBuZXcgQXJyYXkoMjU2KVxuICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICBjb25zdCBpMTYgPSBpICogMTZcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDE2OyArK2opIHtcbiAgICAgIHRhYmxlW2kxNiArIGpdID0gYWxwaGFiZXRbaV0gKyBhbHBoYWJldFtqXVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFibGVcbn0pKClcblxuLy8gUmV0dXJuIG5vdCBmdW5jdGlvbiB3aXRoIEVycm9yIGlmIEJpZ0ludCBub3Qgc3VwcG9ydGVkXG5mdW5jdGlvbiBkZWZpbmVCaWdJbnRNZXRob2QgKGZuKSB7XG4gIHJldHVybiB0eXBlb2YgQmlnSW50ID09PSAndW5kZWZpbmVkJyA/IEJ1ZmZlckJpZ0ludE5vdERlZmluZWQgOiBmblxufVxuXG5mdW5jdGlvbiBCdWZmZXJCaWdJbnROb3REZWZpbmVkICgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdCaWdJbnQgbm90IHN1cHBvcnRlZCcpXG59XG4iLCAiaW1wb3J0IHsgZGVsZXRlREIgfSBmcm9tICdpZGInO1xuaW1wb3J0IHsgZG93bmxvYWRBbGxDb250ZW50cywgZ2V0SG9zdHMsIHNvcnRCeUluZGV4IH0gZnJvbSAnLi4vdXRpbGl0aWVzL2RiJztcbmltcG9ydCB7IGdldFByb2ZpbGVzLCBLSU5EUyB9IGZyb20gJy4uL3V0aWxpdGllcy91dGlscyc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmNvbnN0IFRPTU9SUk9XID0gbmV3IERhdGUoKTtcblRPTU9SUk9XLnNldERhdGUoVE9NT1JST1cuZ2V0RGF0ZSgpICsgMSk7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGV2ZW50czogW10sXG4gICAgdmlldzogJ2NyZWF0ZWRfYXQnLFxuICAgIG1heDogMTAwLFxuICAgIHNvcnQ6ICdhc2MnLFxuICAgIGFsbEhvc3RzOiBbXSxcbiAgICBob3N0OiAnJyxcbiAgICBhbGxQcm9maWxlczogW10sXG4gICAgcHJvZmlsZTogJycsXG4gICAgcHVia2V5OiAnJyxcbiAgICBzZWxlY3RlZDogbnVsbCxcbiAgICBjb3BpZWQ6IGZhbHNlLFxuXG4gICAgLy8gZGF0ZSB2aWV3XG4gICAgZnJvbUNyZWF0ZWRBdDogJzIwMDgtMTAtMzEnLFxuICAgIHRvQ3JlYXRlZEF0OiBUT01PUlJPVy50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG5cbiAgICAvLyBraW5kIHZpZXdcbiAgICBxdWlja0tpbmQ6ICcnLFxuICAgIGZyb21LaW5kOiAwLFxuICAgIHRvS2luZDogNTAwMDAsXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gZ2V0RnJvbVRpbWUoKSB7XG4gICAgY29uc3QgZHQgPSBuZXcgRGF0ZShzdGF0ZS5mcm9tQ3JlYXRlZEF0KTtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihkdC5nZXRUaW1lKCkgLyAxMDAwKTtcbn1cblxuZnVuY3Rpb24gZ2V0VG9UaW1lKCkge1xuICAgIGNvbnN0IGR0ID0gbmV3IERhdGUoc3RhdGUudG9DcmVhdGVkQXQpO1xuICAgIHJldHVybiBNYXRoLmZsb29yKGR0LmdldFRpbWUoKSAvIDEwMDApO1xufVxuXG5mdW5jdGlvbiBnZXRLZXlSYW5nZSgpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnZpZXcpIHtcbiAgICAgICAgY2FzZSAnY3JlYXRlZF9hdCc6XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2UuYm91bmQoZ2V0RnJvbVRpbWUoKSwgZ2V0VG9UaW1lKCkpO1xuICAgICAgICBjYXNlICdraW5kJzpcbiAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5ib3VuZChzdGF0ZS5mcm9tS2luZCwgc3RhdGUudG9LaW5kKTtcbiAgICAgICAgY2FzZSAnaG9zdCc6XG4gICAgICAgICAgICBpZiAoc3RhdGUuaG9zdC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLm9ubHkoc3RhdGUuaG9zdCk7XG4gICAgICAgIGNhc2UgJ3B1YmtleSc6XG4gICAgICAgICAgICBpZiAoc3RhdGUucHVia2V5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2Uub25seShzdGF0ZS5wdWJrZXkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKGVwb2NoU2Vjb25kcykge1xuICAgIHJldHVybiBuZXcgRGF0ZShlcG9jaFNlY29uZHMgKiAxMDAwKS50b1VUQ1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRLaW5kKGtpbmQpIHtcbiAgICBjb25zdCBrID0gS0lORFMuZmluZCgoW2tOdW1dKSA9PiBrTnVtID09PSBraW5kKTtcbiAgICByZXR1cm4gayA/IGAke2tbMV19ICgke2tpbmR9KWAgOiBgVW5rbm93biAoJHtraW5kfSlgO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFZpZXcgc2VsZWN0XG4gICAgY29uc3Qgdmlld1NlbGVjdCA9ICQoJ3ZpZXcnKTtcbiAgICBjb25zdCBzb3J0U2VsZWN0ID0gJCgnc29ydCcpO1xuICAgIGNvbnN0IG1heElucHV0ID0gJCgnbWF4Jyk7XG5cbiAgICBpZiAodmlld1NlbGVjdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB2aWV3U2VsZWN0KSB2aWV3U2VsZWN0LnZhbHVlID0gc3RhdGUudmlldztcbiAgICBpZiAoc29ydFNlbGVjdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBzb3J0U2VsZWN0KSBzb3J0U2VsZWN0LnZhbHVlID0gc3RhdGUuc29ydDtcbiAgICBpZiAobWF4SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbWF4SW5wdXQpIG1heElucHV0LnZhbHVlID0gc3RhdGUubWF4O1xuXG4gICAgLy8gU2hvdy9oaWRlIGZpbHRlciBzZWN0aW9uc1xuICAgIGNvbnN0IGRhdGVGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwiY3JlYXRlZF9hdFwiXScpO1xuICAgIGNvbnN0IGtpbmRGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwia2luZFwiXScpO1xuICAgIGNvbnN0IGhvc3RGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwiaG9zdFwiXScpO1xuICAgIGNvbnN0IHB1YmtleUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maWx0ZXI9XCJwdWJrZXlcIl0nKTtcblxuICAgIGRhdGVGaWx0ZXJzLmZvckVhY2goZWwgPT4gZWwuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnZpZXcgPT09ICdjcmVhdGVkX2F0JyA/ICcnIDogJ25vbmUnKTtcbiAgICBraW5kRmlsdGVycy5mb3JFYWNoKGVsID0+IGVsLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS52aWV3ID09PSAna2luZCcgPyAnJyA6ICdub25lJyk7XG4gICAgaG9zdEZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ2hvc3QnID8gJycgOiAnbm9uZScpO1xuICAgIHB1YmtleUZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ3B1YmtleScgPyAnJyA6ICdub25lJyk7XG5cbiAgICAvLyBEYXRlIGlucHV0c1xuICAgIGNvbnN0IGZyb21DcmVhdGVkQXQgPSAkKCdmcm9tQ3JlYXRlZEF0Jyk7XG4gICAgY29uc3QgdG9DcmVhdGVkQXQgPSAkKCd0b0NyZWF0ZWRBdCcpO1xuICAgIGlmIChmcm9tQ3JlYXRlZEF0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGZyb21DcmVhdGVkQXQpIGZyb21DcmVhdGVkQXQudmFsdWUgPSBzdGF0ZS5mcm9tQ3JlYXRlZEF0O1xuICAgIGlmICh0b0NyZWF0ZWRBdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0b0NyZWF0ZWRBdCkgdG9DcmVhdGVkQXQudmFsdWUgPSBzdGF0ZS50b0NyZWF0ZWRBdDtcblxuICAgIC8vIEtpbmQgaW5wdXRzXG4gICAgY29uc3QgZnJvbUtpbmQgPSAkKCdmcm9tS2luZCcpO1xuICAgIGNvbnN0IHRvS2luZCA9ICQoJ3RvS2luZCcpO1xuICAgIGlmIChmcm9tS2luZCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBmcm9tS2luZCkgZnJvbUtpbmQudmFsdWUgPSBzdGF0ZS5mcm9tS2luZDtcbiAgICBpZiAodG9LaW5kICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRvS2luZCkgdG9LaW5kLnZhbHVlID0gc3RhdGUudG9LaW5kO1xuXG4gICAgLy8gUXVpY2sga2luZCBzZWxlY3RcbiAgICBjb25zdCBraW5kU2hvcnRjdXQgPSAkKCdraW5kU2hvcnRjdXQnKTtcbiAgICBpZiAoa2luZFNob3J0Y3V0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGtpbmRTaG9ydGN1dCkga2luZFNob3J0Y3V0LnZhbHVlID0gc3RhdGUucXVpY2tLaW5kO1xuXG4gICAgLy8gSG9zdCBzZWxlY3RcbiAgICBjb25zdCBob3N0U2VsZWN0ID0gJCgnaG9zdCcpO1xuICAgIGlmIChob3N0U2VsZWN0KSB7XG4gICAgICAgIGhvc3RTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHN0YXRlLmFsbEhvc3RzLm1hcChoID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NhcGVIdG1sKGgpfVwiICR7c3RhdGUuaG9zdCA9PT0gaCA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NhcGVIdG1sKGgpfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8vIFByb2ZpbGVzIHNlbGVjdFxuICAgIGNvbnN0IHByb2ZpbGVTZWxlY3QgPSAkKCdwcm9maWxlcycpO1xuICAgIGlmIChwcm9maWxlU2VsZWN0KSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lcyA9IHN0YXRlLmFsbFByb2ZpbGVzLm1hcChwID0+IHAubmFtZSk7XG4gICAgICAgIHByb2ZpbGVTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHByb2ZpbGVOYW1lcy5tYXAocCA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbChwKX1cIiAke3N0YXRlLnByb2ZpbGUgPT09IHAgPyAnc2VsZWN0ZWQnIDogJyd9PiR7ZXNjYXBlSHRtbChwKX08L29wdGlvbj5gKS5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvLyBQdWJrZXkgaW5wdXRcbiAgICBjb25zdCBwdWJrZXlJbnB1dCA9ICQoJ3B1YmtleScpO1xuICAgIGlmIChwdWJrZXlJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBwdWJrZXlJbnB1dCkgcHVia2V5SW5wdXQudmFsdWUgPSBzdGF0ZS5wdWJrZXk7XG5cbiAgICAvLyBFdmVudCBsaXN0XG4gICAgY29uc3QgZXZlbnRMaXN0ID0gJCgnZXZlbnQtbGlzdCcpO1xuICAgIGlmIChldmVudExpc3QpIHtcbiAgICAgICAgZXZlbnRMaXN0LmlubmVySFRNTCA9IHN0YXRlLmV2ZW50cy5tYXAoKGV2ZW50LCBpbmRleCkgPT4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm10LTMgYm9yZGVyLXNvbGlkIGJvcmRlciBib3JkZXItbW9ub2thaS1iZy1saWdodGVyIHJvdW5kZWQtbGdcIj5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwic2VsZWN0LW5vbmUgZmxleCBjdXJzb3ItcG9pbnRlciB0ZXh0LXNtIG1kOnRleHQteGxcIlxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cInRvZ2dsZS1ldmVudFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleC1ub25lIHctMTQgcC00IGZvbnQtZXh0cmFib2xkXCI+JHtzdGF0ZS5zZWxlY3RlZCA9PT0gaW5kZXggPyAnLScgOiAnKyd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LTEgdy02NCBwLTRcIj4ke2VzY2FwZUh0bWwoZm9ybWF0RGF0ZShldmVudC5tZXRhZGF0YS5zaWduZWRfYXQpKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChldmVudC5tZXRhZGF0YS5ob3N0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChmb3JtYXRLaW5kKGV2ZW50LmV2ZW50LmtpbmQpKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtYWN0aW9uPVwiY29weS1ldmVudFwiIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiIGNsYXNzPVwiY3Vyc29yLXBvaW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHByZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWItbGcgYmctbW9ub2thaS1iZy1saWdodGVyIHRleHQtc20gbWQ6dGV4dC1iYXNlIHAtNCBvdmVyZmxvdy14LWF1dG9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5OiR7c3RhdGUuc2VsZWN0ZWQgPT09IGluZGV4ID8gJ2Jsb2NrJyA6ICdub25lJ307XCJcbiAgICAgICAgICAgICAgICAgICAgPiR7ZXNjYXBlSHRtbChKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgMikpfTwvcHJlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpO1xuXG4gICAgICAgIC8vIEJpbmQgZXZlbnQgdG9nZ2xlXG4gICAgICAgIGV2ZW50TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtZXZlbnRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGVsLmRhdGFzZXQuaW5kZXgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkID0gc3RhdGUuc2VsZWN0ZWQgPT09IGlkeCA/IG51bGwgOiBpZHg7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBjb3B5IGV2ZW50XG4gICAgICAgIGV2ZW50TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjb3B5LWV2ZW50XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBwYXJzZUludChlbC5kYXRhc2V0LmluZGV4KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb3B5RXZlbnQoaWR4KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3BpZWQgdG9hc3RcbiAgICBjb25zdCBjb3BpZWRUb2FzdCA9ICQoJ2NvcGllZC10b2FzdCcpO1xuICAgIGlmIChjb3BpZWRUb2FzdCkgY29waWVkVG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLmNvcGllZCA/ICdibG9jaycgOiAnbm9uZSc7XG59XG5cbi8vIC0tLSBBY3Rpb25zIC0tLVxuXG5hc3luYyBmdW5jdGlvbiByZWxvYWQoKSB7XG4gICAgY29uc3QgZXZlbnRzID0gYXdhaXQgc29ydEJ5SW5kZXgoXG4gICAgICAgIHN0YXRlLnZpZXcsXG4gICAgICAgIGdldEtleVJhbmdlKCksXG4gICAgICAgIHN0YXRlLnNvcnQgPT09ICdhc2MnLFxuICAgICAgICBzdGF0ZS5tYXgsXG4gICAgKTtcbiAgICBzdGF0ZS5ldmVudHMgPSBldmVudHMubWFwKGUgPT4gKHsgLi4uZSwgY29waWVkOiBmYWxzZSB9KSk7XG5cbiAgICBnZXRIb3N0cygpLnRoZW4oaG9zdHMgPT4geyBzdGF0ZS5hbGxIb3N0cyA9IGhvc3RzOyByZW5kZXIoKTsgfSk7XG5cbiAgICBjb25zdCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgc3RhdGUuYWxsUHJvZmlsZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgcHJvZmlsZXMubWFwKGFzeW5jIChwcm9maWxlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcbiAgICAgICAgICAgIHB1YmtleTogYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KSksXG4gICAgKTtcblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlQWxsKCkge1xuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBkb3dubG9hZEFsbENvbnRlbnRzKCk7XG4gICAgYXBpLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUFsbCgpIHtcbiAgICBpZiAoY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBBTEwgZXZlbnRzPycpKSB7XG4gICAgICAgIGF3YWl0IGRlbGV0ZURCKCdldmVudHMnKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBxdWlja0tpbmRTZWxlY3QoKSB7XG4gICAgaWYgKHN0YXRlLnF1aWNrS2luZCA9PT0gJycpIHJldHVybjtcbiAgICBjb25zdCBpID0gcGFyc2VJbnQoc3RhdGUucXVpY2tLaW5kKTtcbiAgICBzdGF0ZS5mcm9tS2luZCA9IGk7XG4gICAgc3RhdGUudG9LaW5kID0gaTtcbiAgICByZWxvYWQoKTtcbn1cblxuZnVuY3Rpb24gcGtGcm9tUHJvZmlsZSgpIHtcbiAgICBjb25zdCBmb3VuZCA9IHN0YXRlLmFsbFByb2ZpbGVzLmZpbmQoKHsgbmFtZSB9KSA9PiBuYW1lID09PSBzdGF0ZS5wcm9maWxlKTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgc3RhdGUucHVia2V5ID0gZm91bmQucHVia2V5O1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlFdmVudChpbmRleCkge1xuICAgIGNvbnN0IGV2ZW50ID0gSlNPTi5zdHJpbmdpZnkoc3RhdGUuZXZlbnRzW2luZGV4XSk7XG4gICAgc3RhdGUuY29waWVkID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuY29waWVkID0gZmFsc2U7IHJlbmRlcigpOyB9LCAxMDAwKTtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChldmVudCk7XG59XG5cbi8vIC0tLSBFdmVudCBiaW5kaW5nIC0tLVxuXG5sZXQgbWF4RGVib3VuY2VUaW1lciA9IG51bGw7XG5sZXQgcHVia2V5RGVib3VuY2VUaW1lciA9IG51bGw7XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgndmlldycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS52aWV3ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgnc29ydCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5zb3J0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgnbWF4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubWF4ID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDEwMDtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG1heERlYm91bmNlVGltZXIpO1xuICAgICAgICBtYXhEZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiByZWxvYWQoKSwgNzUwKTtcbiAgICB9KTtcblxuICAgICQoJ2Zyb21DcmVhdGVkQXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZnJvbUNyZWF0ZWRBdCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9KTtcblxuICAgICQoJ3RvQ3JlYXRlZEF0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnRvQ3JlYXRlZEF0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgna2luZFNob3J0Y3V0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnF1aWNrS2luZCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICBxdWlja0tpbmRTZWxlY3QoKTtcbiAgICB9KTtcblxuICAgICQoJ2Zyb21LaW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmZyb21LaW5kID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDA7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgndG9LaW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnRvS2luZCA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSB8fCA1MDAwMDtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdob3N0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmhvc3QgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdwcm9maWxlcycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5wcm9maWxlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHBrRnJvbVByb2ZpbGUoKTtcbiAgICB9KTtcblxuICAgICQoJ3B1YmtleScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnB1YmtleSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICBjbGVhclRpbWVvdXQocHVia2V5RGVib3VuY2VUaW1lcik7XG4gICAgICAgIHB1YmtleURlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHJlbG9hZCgpLCA1MDApO1xuICAgIH0pO1xuXG4gICAgJCgnc2F2ZS1hbGwtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUFsbCk7XG4gICAgJCgnZGVsZXRlLWFsbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWxldGVBbGwpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcbn1cblxuLy8gLS0tIEluaXQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gUG9wdWxhdGUgdGhlIGtpbmQgc2hvcnRjdXQgc2VsZWN0XG4gICAgY29uc3Qga2luZFNob3J0Y3V0ID0gJCgna2luZFNob3J0Y3V0Jyk7XG4gICAgaWYgKGtpbmRTaG9ydGN1dCkge1xuICAgICAgICBraW5kU2hvcnRjdXQuaW5uZXJIVE1MID0gJzxvcHRpb24+PC9vcHRpb24+JyArXG4gICAgICAgICAgICBLSU5EUy5tYXAoKFtraW5kLCBkZXNjXSkgPT4gYDxvcHRpb24gdmFsdWU9XCIke2tpbmR9XCI+JHtlc2NhcGVIdG1sKGRlc2MpfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICBhd2FpdCByZWxvYWQoKTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBvcGVuREIgfSBmcm9tICdpZGInO1xuXG5hc3luYyBmdW5jdGlvbiBvcGVuRXZlbnRzRGIoKSB7XG4gICAgcmV0dXJuIGF3YWl0IG9wZW5EQignZXZlbnRzJywgMSwge1xuICAgICAgICB1cGdyYWRlKGRiKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudHMgPSBkYi5jcmVhdGVPYmplY3RTdG9yZSgnZXZlbnRzJywge1xuICAgICAgICAgICAgICAgIGtleVBhdGg6ICdldmVudC5pZCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgncHVia2V5JywgJ2V2ZW50LnB1YmtleScpO1xuICAgICAgICAgICAgZXZlbnRzLmNyZWF0ZUluZGV4KCdjcmVhdGVkX2F0JywgJ2V2ZW50LmNyZWF0ZWRfYXQnKTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgna2luZCcsICdldmVudC5raW5kJyk7XG4gICAgICAgICAgICBldmVudHMuY3JlYXRlSW5kZXgoJ2hvc3QnLCAnbWV0YWRhdGEuaG9zdCcpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUV2ZW50KGV2ZW50KSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgcmV0dXJuIGRiLnB1dCgnZXZlbnRzJywgZXZlbnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc29ydEJ5SW5kZXgoaW5kZXgsIHF1ZXJ5LCBhc2MsIG1heCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBldmVudHMgPSBbXTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGJcbiAgICAgICAgLnRyYW5zYWN0aW9uKCdldmVudHMnKVxuICAgICAgICAuc3RvcmUuaW5kZXgoaW5kZXgpXG4gICAgICAgIC5vcGVuQ3Vyc29yKHF1ZXJ5LCBhc2MgPyAnbmV4dCcgOiAncHJldicpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgaWYgKGV2ZW50cy5sZW5ndGggPj0gbWF4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvc3RzKCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBob3N0cyA9IG5ldyBTZXQoKTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGIudHJhbnNhY3Rpb24oJ2V2ZW50cycpLnN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIGhvc3RzLmFkZChjdXJzb3IudmFsdWUubWV0YWRhdGEuaG9zdCk7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5jb250aW51ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gWy4uLmhvc3RzXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQWxsQ29udGVudHMoKSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuICAgIGxldCBjdXJzb3IgPSBhd2FpdCBkYi50cmFuc2FjdGlvbignZXZlbnRzJykuc3RvcmUub3BlbkN1cnNvcigpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlLmV2ZW50KTtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICAgIGV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiBKU09OLnN0cmluZ2lmeShlKSk7XG4gICAgZXZlbnRzID0gZXZlbnRzLmpvaW4oJ1xcbicpO1xuICAgIGNvbnNvbGUubG9nKGV2ZW50cyk7XG5cbiAgICBjb25zdCBmaWxlID0gbmV3IEZpbGUoW2V2ZW50c10sICdldmVudHMuanNvbmwnLCB7XG4gICAgICAgIHR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtldmVudHNdLCB7IHR5cGU6ICdwbGFpbi90ZXh0JyB9KTtcblxuICAgIHJldHVybiBibG9iO1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBlbmNyeXB0LCBkZWNyeXB0LCBoYXNoUGFzc3dvcmQsIHZlcmlmeVBhc3N3b3JkIH0gZnJvbSAnLi9jcnlwdG8nO1xuaW1wb3J0IHsgbG9va3NMaWtlU2VlZFBocmFzZSwgaXNWYWxpZFNlZWRQaHJhc2UgfSBmcm9tICcuL3NlZWRwaHJhc2UnO1xuXG5jb25zdCBEQl9WRVJTSU9OID0gNjtcbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9SRUxBWVMgPSBbXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZGFtdXMuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5wcmltYWwubmV0JyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuc25vcnQuc29jaWFsJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZ2V0YWxieS5jb20vdjEnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3MubG9sJyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNSkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNiAocGxhdGZvcm0gc3luYyBzdXBwb3J0KS4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS51cGRhdGVkQXQgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS51cGRhdGVkQXQgPSBub3c7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwbGF0Zm9ybVN5bmNFbmFibGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBwcml2S2V5OiB0eXBlID09PSAnbG9jYWwnID8gYXdhaXQgZ2VuZXJhdGVQcml2YXRlS2V5KCkgOiAnJyxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBwcm9maWxlc1tpbmRleF0udXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcml2YXRlS2V5KGluZGV4LCBwcml2YXRlS2V5KSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICBwYXlsb2FkOiBbaW5kZXgsIHByaXZhdGVLZXldLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3UHJvZmlsZSgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUoJ05ldyBQcm9maWxlJyk7XG4gICAgcHJvZmlsZXMucHVzaChuZXdQcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3QnVua2VyUHJvZmlsZShuYW1lID0gJ05ldyBCdW5rZXInLCBidW5rZXJVcmwgPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKG5hbWUsICdidW5rZXInKTtcbiAgICBwcm9maWxlLmJ1bmtlclVybCA9IGJ1bmtlclVybDtcbiAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZWxheXMocHJvZmlsZUluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHByb2ZpbGVJbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlzIHx8IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJlbGF5cyhwcm9maWxlSW5kZXgsIHJlbGF5cykge1xuICAgIC8vIEhhdmluZyBhbiBBbHBpbmUgcHJveHkgb2JqZWN0IGFzIGEgc3ViLW9iamVjdCBkb2VzIG5vdCBzZXJpYWxpemUgY29ycmVjdGx5IGluIHN0b3JhZ2UsXG4gICAgLy8gc28gd2UgYXJlIHByZS1zZXJpYWxpemluZyBoZXJlIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gdGhlIHByb2ZpbGUsIHNvIHRoZSBwcm94eVxuICAgIC8vIG9iaiBkb2Vzbid0IGJ1ZyBvdXQuXG4gICAgbGV0IGZpeGVkUmVsYXlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxheXMpKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbcHJvZmlsZUluZGV4XTtcbiAgICBwcm9maWxlLnJlbGF5cyA9IGZpeGVkUmVsYXlzO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlPy5ob3N0cz8uW2hvc3RdPy5bYWN0aW9uXSB8fCAnYXNrJztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBlcm1pc3Npb24oaG9zdCwgYWN0aW9uLCBwZXJtLCBpbmRleCA9IG51bGwpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgICAgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICB9XG4gICAgbGV0IHByb2ZpbGUgPSBwcm9maWxlc1tpbmRleF07XG4gICAgbGV0IG5ld1Blcm1zID0gcHJvZmlsZS5ob3N0c1tob3N0XSB8fCB7fTtcbiAgICBuZXdQZXJtcyA9IHsgLi4ubmV3UGVybXMsIFthY3Rpb25dOiBwZXJtIH07XG4gICAgcHJvZmlsZS5ob3N0c1tob3N0XSA9IG5ld1Blcm1zO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdID0gcHJvZmlsZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5QZXJtaXNzaW9uKHApIHtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlIHdoZXJlIGV2ZW50IHNpZ25pbmcgaW5jbHVkZXMgYSBraW5kIG51bWJlclxuICAgIGlmIChwLnN0YXJ0c1dpdGgoJ3NpZ25FdmVudDonKSkge1xuICAgICAgICBsZXQgW2UsIG5dID0gcC5zcGxpdCgnOicpO1xuICAgICAgICBuID0gcGFyc2VJbnQobik7XG4gICAgICAgIGxldCBubmFtZSA9IEtJTkRTLmZpbmQoayA9PiBrWzBdID09PSBuKT8uWzFdIHx8IGBVbmtub3duIChLaW5kICR7bn0pYDtcbiAgICAgICAgcmV0dXJuIGBTaWduIGV2ZW50OiAke25uYW1lfWA7XG4gICAgfVxuXG4gICAgc3dpdGNoIChwKSB7XG4gICAgICAgIGNhc2UgJ2dldFB1YktleSc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcHVibGljIGtleSc7XG4gICAgICAgIGNhc2UgJ3NpZ25FdmVudCc6XG4gICAgICAgICAgICByZXR1cm4gJ1NpZ24gZXZlbnQnO1xuICAgICAgICBjYXNlICdnZXRSZWxheXMnOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHJlbGF5IGxpc3QnO1xuICAgICAgICBjYXNlICduaXAwNC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXAwNC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXA0NC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBjYXNlICduaXA0NC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdVbmtub3duJztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUtleShrZXkpIHtcbiAgICBjb25zdCBoZXhNYXRjaCA9IC9eW1xcZGEtZl17NjR9JC9pLnRlc3Qoa2V5KTtcbiAgICBjb25zdCBiMzJNYXRjaCA9IC9ebnNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdezU4fSQvLnRlc3Qoa2V5KTtcblxuICAgIHJldHVybiBoZXhNYXRjaCB8fCBiMzJNYXRjaCB8fCBpc05jcnlwdHNlYyhrZXkpIHx8IGlzVmFsaWRTZWVkUGhyYXNlKGtleSk7XG59XG5cbmV4cG9ydCB7IGxvb2tzTGlrZVNlZWRQaHJhc2UgfTtcbmV4cG9ydCBjb25zdCBpc1NlZWRQaHJhc2UgPSBpc1ZhbGlkU2VlZFBocmFzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmNyeXB0c2VjKGtleSkge1xuICAgIHJldHVybiAvXm5jcnlwdHNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdKyQvLnRlc3Qoa2V5KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZlYXR1cmUobmFtZSkge1xuICAgIGxldCBmbmFtZSA9IGBmZWF0dXJlOiR7bmFtZX1gO1xuICAgIGxldCBmID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgW2ZuYW1lXTogZmFsc2UgfSk7XG4gICAgcmV0dXJuIGZbZm5hbWVdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLnJlbGF5UmVtaW5kZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVSZWxheVJlbWluZGVyKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLnJlbGF5UmVtaW5kZXIgPSBmYWxzZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TnB1YigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICByZXR1cm4gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnZ2V0TnB1YicsXG4gICAgICAgIHBheWxvYWQ6IGluZGV4LFxuICAgIH0pO1xufVxuXG4vLyAtLS0gTWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBtYXN0ZXIgcGFzc3dvcmQgZW5jcnlwdGlvbiBpcyBhY3RpdmUuXG4gKlxuICogRGVmZW5zaXZlOiBjaGVja3MgbXVsdGlwbGUgaW5kaWNhdG9ycywgbm90IGp1c3QgdGhlIGJvb2xlYW4gZmxhZy5cbiAqIElmIHBhc3N3b3JkSGFzaCBvciBlbmNyeXB0ZWQga2V5IGJsb2JzIGV4aXN0IGJ1dCB0aGUgaXNFbmNyeXB0ZWQgZmxhZ1xuICogaXMgZmFsc2UgKGluY29uc2lzdGVudCBzdGF0ZSBmcm9tIHNlcnZpY2Ugd29ya2VyIGNyYXNoLCByYWNlIGNvbmRpdGlvbixcbiAqIGV0Yy4pLCBzZWxmLWhlYWxzIGJ5IHNldHRpbmcgdGhlIGZsYWcgYmFjayB0byB0cnVlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNFbmNyeXB0ZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlLCBwYXNzd29yZEhhc2g6IG51bGwsIHByb2ZpbGVzOiBbXSB9KTtcbiAgICBpZiAoZGF0YS5pc0VuY3J5cHRlZCkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBGYWxsYmFjayAxOiBwYXNzd29yZEhhc2ggZXhpc3RzIGJ1dCBmbGFnIGlzIHN0YWxlXG4gICAgaWYgKGRhdGEucGFzc3dvcmRIYXNoKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZhbGxiYWNrIDI6IGVuY3J5cHRlZCBibG9icyBleGlzdCBpbiBwcm9maWxlcyBidXQgZmxhZyArIGhhc2ggYXJlIG1pc3NpbmdcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgb2YgZGF0YS5wcm9maWxlcykge1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGUucHJpdktleSkpIHtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBTdG9yZSB0aGUgcGFzc3dvcmQgdmVyaWZpY2F0aW9uIGhhc2ggKG5ldmVyIHRoZSBwYXNzd29yZCBpdHNlbGYpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBoYXNoLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IHNhbHQsXG4gICAgICAgIGlzRW5jcnlwdGVkOiB0cnVlLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgdGhlIHN0b3JlZCBoYXNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tQYXNzd29yZChwYXNzd29yZCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogbnVsbCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBudWxsLFxuICAgIH0pO1xuICAgIGlmICghZGF0YS5wYXNzd29yZEhhc2ggfHwgIWRhdGEucGFzc3dvcmRTYWx0KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBkYXRhLnBhc3N3b3JkSGFzaCwgZGF0YS5wYXNzd29yZFNhbHQpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBtYXN0ZXIgcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgY2xlYXJzIGhhc2ggYW5kIGRlY3J5cHRzIGFsbCBrZXlzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlUGFzc3dvcmRQcm90ZWN0aW9uKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgdmFsaWQgPSBhd2FpdCBjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBpZiAoIXZhbGlkKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKTtcblxuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZGVjcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IGFsbCBwcm9maWxlIHByaXZhdGUga2V5cyB3aXRoIGEgbWFzdGVyIHBhc3N3b3JkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEFsbEtleXMocGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFpc0VuY3J5cHRlZEJsb2IocHJvZmlsZXNbaV0ucHJpdktleSkpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbi8qKlxuICogUmUtZW5jcnlwdCBhbGwga2V5cyB3aXRoIGEgbmV3IHBhc3N3b3JkIChyZXF1aXJlcyB0aGUgb2xkIHBhc3N3b3JkKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkRm9yS2V5cyhvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGhleCA9IHByb2ZpbGVzW2ldLnByaXZLZXk7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IoaGV4KSkge1xuICAgICAgICAgICAgaGV4ID0gYXdhaXQgZGVjcnlwdChoZXgsIG9sZFBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChoZXgsIG5ld1Bhc3N3b3JkKTtcbiAgICB9XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgc2luZ2xlIHByb2ZpbGUncyBwcml2YXRlIGtleSwgcmV0dXJuaW5nIHRoZSBoZXggc3RyaW5nLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVjcnlwdGVkUHJpdktleShwcm9maWxlLCBwYXNzd29yZCkge1xuICAgIGlmIChwcm9maWxlLnR5cGUgPT09ICdidW5rZXInKSByZXR1cm4gJyc7XG4gICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0KHByb2ZpbGUucHJpdktleSwgcGFzc3dvcmQpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvZmlsZS5wcml2S2V5O1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBzdG9yZWQgdmFsdWUgbG9va3MgbGlrZSBhbiBlbmNyeXB0ZWQgYmxvYi5cbiAqIEVuY3J5cHRlZCBibG9icyBhcmUgSlNPTiBzdHJpbmdzIGNvbnRhaW5pbmcge3NhbHQsIGl2LCBjaXBoZXJ0ZXh0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW5jcnlwdGVkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwYXJzZWQuc2FsdCAmJiBwYXJzZWQuaXYgJiYgcGFyc2VkLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBhbGFybXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gY2hyb21lLmFsYXJtcyBzdXJ2aXZlcyBNVjMgc2VydmljZS13b3JrZXIgZXZpY3Rpb247IHNldFRpbWVvdXQgZG9lcyBub3QuXG5hcGkuYWxhcm1zID0gX2Jyb3dzZXIuYWxhcm1zID8ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIC8vIGFsYXJtcy5jcmVhdGUgaXMgc3luY2hyb25vdXMgb24gQ2hyb21lLCByZXR1cm5zIFByb21pc2Ugb24gRmlyZWZveC9TYWZhcmlcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gX2Jyb3dzZXIuYWxhcm1zLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicgPyByZXN1bHQgOiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9LFxuICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLmFsYXJtcy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLmFsYXJtcywgX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIG9uQWxhcm06IF9icm93c2VyLmFsYXJtcy5vbkFsYXJtLFxufSA6IG51bGw7XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICIvKipcbiAqIEVuY3J5cHRpb24gdXRpbGl0aWVzIGZvciBOb3N0cktleSBtYXN0ZXIgcGFzc3dvcmQgZmVhdHVyZS5cbiAqXG4gKiBVc2VzIFdlYiBDcnlwdG8gQVBJIChjcnlwdG8uc3VidGxlKSBleGNsdXNpdmVseSBcdTIwMTQgbm8gZXh0ZXJuYWwgbGlicmFyaWVzLlxuICogLSBQQktERjIgd2l0aCA2MDAsMDAwIGl0ZXJhdGlvbnMgKE9XQVNQIDIwMjMgcmVjb21tZW5kYXRpb24pXG4gKiAtIEFFUy0yNTYtR0NNIGZvciBhdXRoZW50aWNhdGVkIGVuY3J5cHRpb25cbiAqIC0gUmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSBwZXIgb3BlcmF0aW9uXG4gKiAtIEFsbCBiaW5hcnkgZGF0YSBlbmNvZGVkIGFzIGJhc2U2NCBmb3IgSlNPTiBzdG9yYWdlIGNvbXBhdGliaWxpdHlcbiAqL1xuXG5jb25zdCBQQktERjJfSVRFUkFUSU9OUyA9IDYwMF8wMDA7XG5jb25zdCBTQUxUX0JZVEVTID0gMTY7XG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gS2V5IGRlcml2YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRGVyaXZlIGFuIEFFUy0yNTYtR0NNIENyeXB0b0tleSBmcm9tIGEgcGFzc3dvcmQgYW5kIHNhbHQgdXNpbmcgUEJLREYyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8VWludDhBcnJheX0gc2FsdCAtIDE2LWJ5dGUgc2FsdFxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVLZXknXVxuICAgICk7XG5cbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5kZXJpdmVLZXkoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdDogc2FsdCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBzYWx0IDogbmV3IFVpbnQ4QXJyYXkoc2FsdCksXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdGhhdCB3YXMgZW5jcnlwdGVkIHdpdGggYGVuY3J5cHQoKWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgICAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBUaGUgb3JpZ2luYWwgcGxhaW50ZXh0XG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHBhc3N3b3JkIGlzIHdyb25nIG9yIGRhdGEgaXMgdGFtcGVyZWQgd2l0aFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChlbmNyeXB0ZWREYXRhLCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkRGF0YSk7XG5cbiAgICBjb25zdCBzYWx0QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgY29uc3QgaXZCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKGl2KSk7XG4gICAgY29uc3QgY3RCdWYgPSBiYXNlNjRUb0FycmF5QnVmZmVyKGNpcGhlcnRleHQpO1xuXG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0QnVmKTtcblxuICAgIGNvbnN0IHBsYWluQnVmID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXY6IGl2QnVmIH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgY3RCdWZcbiAgICApO1xuXG4gICAgY29uc3QgZGVjID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgcmV0dXJuIGRlYy5kZWNvZGUocGxhaW5CdWYpO1xufVxuXG4vLyAtLS0gUGFzc3dvcmQgaGFzaGluZyAoZm9yIHZlcmlmaWNhdGlvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogSGFzaCBhIHBhc3N3b3JkIHdpdGggUEJLREYyIGZvciB2ZXJpZmljYXRpb24gcHVycG9zZXMuXG4gKlxuICogVGhpcyBwcm9kdWNlcyBhIHNlcGFyYXRlIGhhc2ggKG5vdCB0aGUgZW5jcnlwdGlvbiBrZXkpIHRoYXQgY2FuIGJlIHN0b3JlZFxuICogdG8gdmVyaWZ5IHRoZSBwYXNzd29yZCB3aXRob3V0IG5lZWRpbmcgdG8gYXR0ZW1wdCBkZWNyeXB0aW9uLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gW3NhbHRdIC0gT3B0aW9uYWwgc2FsdDsgZ2VuZXJhdGVkIGlmIG9taXR0ZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHsgaGFzaDogc3RyaW5nLCBzYWx0OiBzdHJpbmcgfT59IGJhc2U2NC1lbmNvZGVkIGhhc2ggYW5kIHNhbHRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhc2hQYXNzd29yZChwYXNzd29yZCwgc2FsdCkge1xuICAgIGlmICghc2FsdCkge1xuICAgICAgICBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2FsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2FsdCA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUJpdHMnXVxuICAgICk7XG5cbiAgICBjb25zdCBoYXNoQml0cyA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVyaXZlQml0cyhcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0LFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICAyNTZcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaGFzaDogYXJyYXlCdWZmZXJUb0Jhc2U2NChoYXNoQml0cyksXG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IGEgc3RvcmVkIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAgLSBUaGUgcGFzc3dvcmQgdG8gdmVyaWZ5XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkSGFzaCAtIGJhc2U2NC1lbmNvZGVkIGhhc2ggZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZFNhbHQgLSBiYXNlNjQtZW5jb2RlZCBzYWx0IGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBUcnVlIGlmIHRoZSBwYXNzd29yZCBtYXRjaGVzXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkSGFzaCwgc3RvcmVkU2FsdCkge1xuICAgIGNvbnN0IHsgaGFzaCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRTYWx0KTtcbiAgICByZXR1cm4gaGFzaCA9PT0gc3RvcmVkSGFzaDtcbn1cbiIsICIvKipcbiAqIEJJUDM5IFNlZWQgUGhyYXNlIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkuXG4gKlxuICogSW1wbGVtZW50cyB0aGUgc2FtZSBhbGdvcml0aG0gYXMgYG5vc3RyLW5zZWMtc2VlZHBocmFzZWA6XG4gKiB0aGUgMzItYnl0ZSBwcml2YXRlIGtleSBJUyB0aGUgQklQMzkgZW50cm9weSAoYmlkaXJlY3Rpb25hbCBlbmNvZGluZykuXG4gKlxuICogVXNlcyBAc2N1cmUvYmlwMzkgKGFscmVhZHkgYSB0cmFuc2l0aXZlIGRlcCBvZiBub3N0ci10b29scykuXG4gKi9cblxuaW1wb3J0IHsgZW50cm9weVRvTW5lbW9uaWMsIG1uZW1vbmljVG9FbnRyb3B5LCB2YWxpZGF0ZU1uZW1vbmljIH0gZnJvbSAnQHNjdXJlL2JpcDM5JztcbmltcG9ydCB7IHdvcmRsaXN0IH0gZnJvbSAnQHNjdXJlL2JpcDM5L3dvcmRsaXN0cy9lbmdsaXNoLmpzJztcbmltcG9ydCB7IGhleFRvQnl0ZXMsIGJ5dGVzVG9IZXgsIGdldFB1YmxpY0tleVN5bmMgfSBmcm9tICdub3N0ci1jcnlwdG8tdXRpbHMnO1xuXG4vKipcbiAqIENvbnZlcnQgYSBoZXggcHJpdmF0ZSBrZXkgdG8gYSAyNC13b3JkIEJJUDM5IG1uZW1vbmljLlxuICogQHBhcmFtIHtzdHJpbmd9IGhleEtleSAtIDY0LWNoYXIgaGV4IHByaXZhdGUga2V5XG4gKiBAcmV0dXJucyB7c3RyaW5nfSAyNC13b3JkIG1uZW1vbmljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXlUb1NlZWRQaHJhc2UoaGV4S2V5KSB7XG4gICAgY29uc3QgYnl0ZXMgPSBoZXhUb0J5dGVzKGhleEtleSk7XG4gICAgcmV0dXJuIGVudHJvcHlUb01uZW1vbmljKGJ5dGVzLCB3b3JkbGlzdCk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIEJJUDM5IG1uZW1vbmljIGJhY2sgdG8gYSBoZXggcHJpdmF0ZSBrZXkgKyBkZXJpdmVkIHB1YmtleS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2UgLSAyNC13b3JkIG1uZW1vbmljXG4gKiBAcmV0dXJucyB7eyBoZXhLZXk6IHN0cmluZywgcHViS2V5OiBzdHJpbmcgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlZWRQaHJhc2VUb0tleShwaHJhc2UpIHtcbiAgICBjb25zdCBlbnRyb3B5ID0gbW5lbW9uaWNUb0VudHJvcHkocGhyYXNlLnRyaW0oKS50b0xvd2VyQ2FzZSgpLCB3b3JkbGlzdCk7XG4gICAgY29uc3QgaGV4S2V5ID0gYnl0ZXNUb0hleChlbnRyb3B5KTtcbiAgICBjb25zdCBwdWJLZXkgPSBnZXRQdWJsaWNLZXlTeW5jKGhleEtleSk7XG4gICAgcmV0dXJuIHsgaGV4S2V5LCBwdWJLZXkgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBhIEJJUDM5IG1uZW1vbmljIChjaGVja3N1bSArIHdvcmRsaXN0KS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2VcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFNlZWRQaHJhc2UocGhyYXNlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlTW5lbW9uaWMocGhyYXNlLnRyaW0oKS50b0xvd2VyQ2FzZSgpLCB3b3JkbGlzdCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogRmFzdCBoZXVyaXN0aWM6IGRvZXMgdGhlIGlucHV0IGxvb2sgbGlrZSBpdCBjb3VsZCBiZSBhIHNlZWQgcGhyYXNlP1xuICogKDEyKyBzcGFjZS1zZXBhcmF0ZWQgYWxwaGFiZXRpYyB3b3JkcylcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rc0xpa2VTZWVkUGhyYXNlKGlucHV0KSB7XG4gICAgaWYgKCFpbnB1dCB8fCB0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgd29yZHMgPSBpbnB1dC50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICByZXR1cm4gd29yZHMubGVuZ3RoID49IDEyICYmIHdvcmRzLmV2ZXJ5KHcgPT4gL15bYS16QS1aXSskLy50ZXN0KHcpKTtcbn1cbiIsICIvKipcbiAqIFV0aWxpdGllcyBmb3IgaGV4LCBieXRlcywgQ1NQUk5HLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtaGFzaGVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG4vKiogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBVaW50OEFycmF5LiBCZSBjYXJlZnVsOiBub2RlanMgQnVmZmVyIHdpbGwgcmV0dXJuIHRydWUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCeXRlcyhhOiB1bmtub3duKTogYSBpcyBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGEgaW5zdGFuY2VvZiBVaW50OEFycmF5IHx8IChBcnJheUJ1ZmZlci5pc1ZpZXcoYSkgJiYgYS5jb25zdHJ1Y3Rvci5uYW1lID09PSAnVWludDhBcnJheScpO1xufVxuXG4vKiogQXNzZXJ0cyBzb21ldGhpbmcgaXMgcG9zaXRpdmUgaW50ZWdlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbnVtYmVyKG46IG51bWJlciwgdGl0bGU6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIobikgfHwgbiA8IDApIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke3ByZWZpeH1leHBlY3RlZCBpbnRlZ2VyID49IDAsIGdvdCAke259YCk7XG4gIH1cbn1cblxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIFVpbnQ4QXJyYXkuICovXG5leHBvcnQgZnVuY3Rpb24gYWJ5dGVzKHZhbHVlOiBVaW50OEFycmF5LCBsZW5ndGg/OiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBieXRlcyA9IGlzQnl0ZXModmFsdWUpO1xuICBjb25zdCBsZW4gPSB2YWx1ZT8ubGVuZ3RoO1xuICBjb25zdCBuZWVkc0xlbiA9IGxlbmd0aCAhPT0gdW5kZWZpbmVkO1xuICBpZiAoIWJ5dGVzIHx8IChuZWVkc0xlbiAmJiBsZW4gIT09IGxlbmd0aCkpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgY29uc3Qgb2ZMZW4gPSBuZWVkc0xlbiA/IGAgb2YgbGVuZ3RoICR7bGVuZ3RofWAgOiAnJztcbiAgICBjb25zdCBnb3QgPSBieXRlcyA/IGBsZW5ndGg9JHtsZW59YCA6IGB0eXBlPSR7dHlwZW9mIHZhbHVlfWA7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCArICdleHBlY3RlZCBVaW50OEFycmF5JyArIG9mTGVuICsgJywgZ290ICcgKyBnb3QpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIGhhc2ggKi9cbmV4cG9ydCBmdW5jdGlvbiBhaGFzaChoOiBDSGFzaCk6IHZvaWQge1xuICBpZiAodHlwZW9mIGggIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGguY3JlYXRlICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBFcnJvcignSGFzaCBtdXN0IHdyYXBwZWQgYnkgdXRpbHMuY3JlYXRlSGFzaGVyJyk7XG4gIGFudW1iZXIoaC5vdXRwdXRMZW4pO1xuICBhbnVtYmVyKGguYmxvY2tMZW4pO1xufVxuXG4vKiogQXNzZXJ0cyBhIGhhc2ggaW5zdGFuY2UgaGFzIG5vdCBiZWVuIGRlc3Ryb3llZCAvIGZpbmlzaGVkICovXG5leHBvcnQgZnVuY3Rpb24gYWV4aXN0cyhpbnN0YW5jZTogYW55LCBjaGVja0ZpbmlzaGVkID0gdHJ1ZSk6IHZvaWQge1xuICBpZiAoaW5zdGFuY2UuZGVzdHJveWVkKSB0aHJvdyBuZXcgRXJyb3IoJ0hhc2ggaW5zdGFuY2UgaGFzIGJlZW4gZGVzdHJveWVkJyk7XG4gIGlmIChjaGVja0ZpbmlzaGVkICYmIGluc3RhbmNlLmZpbmlzaGVkKSB0aHJvdyBuZXcgRXJyb3IoJ0hhc2gjZGlnZXN0KCkgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWQnKTtcbn1cblxuLyoqIEFzc2VydHMgb3V0cHV0IGlzIHByb3Blcmx5LXNpemVkIGJ5dGUgYXJyYXkgKi9cbmV4cG9ydCBmdW5jdGlvbiBhb3V0cHV0KG91dDogYW55LCBpbnN0YW5jZTogYW55KTogdm9pZCB7XG4gIGFieXRlcyhvdXQsIHVuZGVmaW5lZCwgJ2RpZ2VzdEludG8oKSBvdXRwdXQnKTtcbiAgY29uc3QgbWluID0gaW5zdGFuY2Uub3V0cHV0TGVuO1xuICBpZiAob3V0Lmxlbmd0aCA8IG1pbikge1xuICAgIHRocm93IG5ldyBFcnJvcignXCJkaWdlc3RJbnRvKCkgb3V0cHV0XCIgZXhwZWN0ZWQgdG8gYmUgb2YgbGVuZ3RoID49JyArIG1pbik7XG4gIH1cbn1cblxuLyoqIEdlbmVyaWMgdHlwZSBlbmNvbXBhc3NpbmcgOC8xNi8zMi1ieXRlIGFycmF5cyAtIGJ1dCBub3QgNjQtYnl0ZS4gKi9cbi8vIHByZXR0aWVyLWlnbm9yZVxuZXhwb3J0IHR5cGUgVHlwZWRBcnJheSA9IEludDhBcnJheSB8IFVpbnQ4Q2xhbXBlZEFycmF5IHwgVWludDhBcnJheSB8XG4gIFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheTtcblxuLyoqIENhc3QgdTggLyB1MTYgLyB1MzIgdG8gdTguICovXG5leHBvcnQgZnVuY3Rpb24gdTgoYXJyOiBUeXBlZEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgYXJyLmJ5dGVMZW5ndGgpO1xufVxuXG4vKiogQ2FzdCB1OCAvIHUxNiAvIHUzMiB0byB1MzIuICovXG5leHBvcnQgZnVuY3Rpb24gdTMyKGFycjogVHlwZWRBcnJheSk6IFVpbnQzMkFycmF5IHtcbiAgcmV0dXJuIG5ldyBVaW50MzJBcnJheShhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgTWF0aC5mbG9vcihhcnIuYnl0ZUxlbmd0aCAvIDQpKTtcbn1cblxuLyoqIFplcm9pemUgYSBieXRlIGFycmF5LiBXYXJuaW5nOiBKUyBwcm92aWRlcyBubyBndWFyYW50ZWVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuKC4uLmFycmF5czogVHlwZWRBcnJheVtdKTogdm9pZCB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyYXlzW2ldLmZpbGwoMCk7XG4gIH1cbn1cblxuLyoqIENyZWF0ZSBEYXRhVmlldyBvZiBhbiBhcnJheSBmb3IgZWFzeSBieXRlLWxldmVsIG1hbmlwdWxhdGlvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWaWV3KGFycjogVHlwZWRBcnJheSk6IERhdGFWaWV3IHtcbiAgcmV0dXJuIG5ldyBEYXRhVmlldyhhcnIuYnVmZmVyLCBhcnIuYnl0ZU9mZnNldCwgYXJyLmJ5dGVMZW5ndGgpO1xufVxuXG4vKiogVGhlIHJvdGF0ZSByaWdodCAoY2lyY3VsYXIgcmlnaHQgc2hpZnQpIG9wZXJhdGlvbiBmb3IgdWludDMyICovXG5leHBvcnQgZnVuY3Rpb24gcm90cih3b3JkOiBudW1iZXIsIHNoaWZ0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKHdvcmQgPDwgKDMyIC0gc2hpZnQpKSB8ICh3b3JkID4+PiBzaGlmdCk7XG59XG5cbi8qKiBUaGUgcm90YXRlIGxlZnQgKGNpcmN1bGFyIGxlZnQgc2hpZnQpIG9wZXJhdGlvbiBmb3IgdWludDMyICovXG5leHBvcnQgZnVuY3Rpb24gcm90bCh3b3JkOiBudW1iZXIsIHNoaWZ0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKHdvcmQgPDwgc2hpZnQpIHwgKCh3b3JkID4+PiAoMzIgLSBzaGlmdCkpID4+PiAwKTtcbn1cblxuLyoqIElzIGN1cnJlbnQgcGxhdGZvcm0gbGl0dGxlLWVuZGlhbj8gTW9zdCBhcmUuIEJpZy1FbmRpYW4gcGxhdGZvcm06IElCTSAqL1xuZXhwb3J0IGNvbnN0IGlzTEU6IGJvb2xlYW4gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIG5ldyBVaW50OEFycmF5KG5ldyBVaW50MzJBcnJheShbMHgxMTIyMzM0NF0pLmJ1ZmZlcilbMF0gPT09IDB4NDQpKCk7XG5cbi8qKiBUaGUgYnl0ZSBzd2FwIG9wZXJhdGlvbiBmb3IgdWludDMyICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZVN3YXAod29yZDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChcbiAgICAoKHdvcmQgPDwgMjQpICYgMHhmZjAwMDAwMCkgfFxuICAgICgod29yZCA8PCA4KSAmIDB4ZmYwMDAwKSB8XG4gICAgKCh3b3JkID4+PiA4KSAmIDB4ZmYwMCkgfFxuICAgICgod29yZCA+Pj4gMjQpICYgMHhmZilcbiAgKTtcbn1cbi8qKiBDb25kaXRpb25hbGx5IGJ5dGUgc3dhcCBpZiBvbiBhIGJpZy1lbmRpYW4gcGxhdGZvcm0gKi9cbmV4cG9ydCBjb25zdCBzd2FwOElmQkU6IChuOiBudW1iZXIpID0+IG51bWJlciA9IGlzTEVcbiAgPyAobjogbnVtYmVyKSA9PiBuXG4gIDogKG46IG51bWJlcikgPT4gYnl0ZVN3YXAobik7XG5cbi8qKiBJbiBwbGFjZSBieXRlIHN3YXAgZm9yIFVpbnQzMkFycmF5ICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZVN3YXAzMihhcnI6IFVpbnQzMkFycmF5KTogVWludDMyQXJyYXkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGFycltpXSA9IGJ5dGVTd2FwKGFycltpXSk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZXhwb3J0IGNvbnN0IHN3YXAzMklmQkU6ICh1OiBVaW50MzJBcnJheSkgPT4gVWludDMyQXJyYXkgPSBpc0xFXG4gID8gKHU6IFVpbnQzMkFycmF5KSA9PiB1XG4gIDogYnl0ZVN3YXAzMjtcblxuLy8gQnVpbHQtaW4gaGV4IGNvbnZlcnNpb24gaHR0cHM6Ly9jYW5pdXNlLmNvbS9tZG4tamF2YXNjcmlwdF9idWlsdGluc191aW50OGFycmF5X2Zyb21oZXhcbmNvbnN0IGhhc0hleEJ1aWx0aW46IGJvb2xlYW4gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIC8vIEB0cy1pZ25vcmVcbiAgdHlwZW9mIFVpbnQ4QXJyYXkuZnJvbShbXSkudG9IZXggPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIFVpbnQ4QXJyYXkuZnJvbUhleCA9PT0gJ2Z1bmN0aW9uJykoKTtcblxuLy8gQXJyYXkgd2hlcmUgaW5kZXggMHhmMCAoMjQwKSBpcyBtYXBwZWQgdG8gc3RyaW5nICdmMCdcbmNvbnN0IGhleGVzID0gLyogQF9fUFVSRV9fICovIEFycmF5LmZyb20oeyBsZW5ndGg6IDI1NiB9LCAoXywgaSkgPT5cbiAgaS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKVxuKTtcblxuLyoqXG4gKiBDb252ZXJ0IGJ5dGUgYXJyYXkgdG8gaGV4IHN0cmluZy4gVXNlcyBidWlsdC1pbiBmdW5jdGlvbiwgd2hlbiBhdmFpbGFibGUuXG4gKiBAZXhhbXBsZSBieXRlc1RvSGV4KFVpbnQ4QXJyYXkuZnJvbShbMHhjYSwgMHhmZSwgMHgwMSwgMHgyM10pKSAvLyAnY2FmZTAxMjMnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvSGV4KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgYWJ5dGVzKGJ5dGVzKTtcbiAgLy8gQHRzLWlnbm9yZVxuICBpZiAoaGFzSGV4QnVpbHRpbikgcmV0dXJuIGJ5dGVzLnRvSGV4KCk7XG4gIC8vIHByZS1jYWNoaW5nIGltcHJvdmVzIHRoZSBzcGVlZCA2eFxuICBsZXQgaGV4ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBoZXggKz0gaGV4ZXNbYnl0ZXNbaV1dO1xuICB9XG4gIHJldHVybiBoZXg7XG59XG5cbi8vIFdlIHVzZSBvcHRpbWl6ZWQgdGVjaG5pcXVlIHRvIGNvbnZlcnQgaGV4IHN0cmluZyB0byBieXRlIGFycmF5XG5jb25zdCBhc2NpaXMgPSB7IF8wOiA0OCwgXzk6IDU3LCBBOiA2NSwgRjogNzAsIGE6IDk3LCBmOiAxMDIgfSBhcyBjb25zdDtcbmZ1bmN0aW9uIGFzY2lpVG9CYXNlMTYoY2g6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmIChjaCA+PSBhc2NpaXMuXzAgJiYgY2ggPD0gYXNjaWlzLl85KSByZXR1cm4gY2ggLSBhc2NpaXMuXzA7IC8vICcyJyA9PiA1MC00OFxuICBpZiAoY2ggPj0gYXNjaWlzLkEgJiYgY2ggPD0gYXNjaWlzLkYpIHJldHVybiBjaCAtIChhc2NpaXMuQSAtIDEwKTsgLy8gJ0InID0+IDY2LSg2NS0xMClcbiAgaWYgKGNoID49IGFzY2lpcy5hICYmIGNoIDw9IGFzY2lpcy5mKSByZXR1cm4gY2ggLSAoYXNjaWlzLmEgLSAxMCk7IC8vICdiJyA9PiA5OC0oOTctMTApXG4gIHJldHVybjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGhleCBzdHJpbmcgdG8gYnl0ZSBhcnJheS4gVXNlcyBidWlsdC1pbiBmdW5jdGlvbiwgd2hlbiBhdmFpbGFibGUuXG4gKiBAZXhhbXBsZSBoZXhUb0J5dGVzKCdjYWZlMDEyMycpIC8vIFVpbnQ4QXJyYXkuZnJvbShbMHhjYSwgMHhmZSwgMHgwMSwgMHgyM10pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgJyArIHR5cGVvZiBoZXgpO1xuICAvLyBAdHMtaWdub3JlXG4gIGlmIChoYXNIZXhCdWlsdGluKSByZXR1cm4gVWludDhBcnJheS5mcm9tSGV4KGhleCk7XG4gIGNvbnN0IGhsID0gaGV4Lmxlbmd0aDtcbiAgY29uc3QgYWwgPSBobCAvIDI7XG4gIGlmIChobCAlIDIpIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IHVucGFkZGVkIGhleCBvZiBsZW5ndGggJyArIGhsKTtcbiAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShhbCk7XG4gIGZvciAobGV0IGFpID0gMCwgaGkgPSAwOyBhaSA8IGFsOyBhaSsrLCBoaSArPSAyKSB7XG4gICAgY29uc3QgbjEgPSBhc2NpaVRvQmFzZTE2KGhleC5jaGFyQ29kZUF0KGhpKSk7XG4gICAgY29uc3QgbjIgPSBhc2NpaVRvQmFzZTE2KGhleC5jaGFyQ29kZUF0KGhpICsgMSkpO1xuICAgIGlmIChuMSA9PT0gdW5kZWZpbmVkIHx8IG4yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSBoZXhbaGldICsgaGV4W2hpICsgMV07XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCBub24taGV4IGNoYXJhY3RlciBcIicgKyBjaGFyICsgJ1wiIGF0IGluZGV4ICcgKyBoaSk7XG4gICAgfVxuICAgIGFycmF5W2FpXSA9IG4xICogMTYgKyBuMjsgLy8gbXVsdGlwbHkgZmlyc3Qgb2N0ZXQsIGUuZy4gJ2EzJyA9PiAxMCoxNiszID0+IDE2MCArIDMgPT4gMTYzXG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG4vKipcbiAqIFRoZXJlIGlzIG5vIHNldEltbWVkaWF0ZSBpbiBicm93c2VyIGFuZCBzZXRUaW1lb3V0IGlzIHNsb3cuXG4gKiBDYWxsIG9mIGFzeW5jIGZuIHdpbGwgcmV0dXJuIFByb21pc2UsIHdoaWNoIHdpbGwgYmUgZnVsbGZpbGVkIG9ubHkgb25cbiAqIG5leHQgc2NoZWR1bGVyIHF1ZXVlIHByb2Nlc3Npbmcgc3RlcCBhbmQgdGhpcyBpcyBleGFjdGx5IHdoYXQgd2UgbmVlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5leHRUaWNrID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge307XG5cbi8qKiBSZXR1cm5zIGNvbnRyb2wgdG8gdGhyZWFkIGVhY2ggJ3RpY2snIG1zIHRvIGF2b2lkIGJsb2NraW5nLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFzeW5jTG9vcChcbiAgaXRlcnM6IG51bWJlcixcbiAgdGljazogbnVtYmVyLFxuICBjYjogKGk6IG51bWJlcikgPT4gdm9pZFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCB0cyA9IERhdGUubm93KCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcnM7IGkrKykge1xuICAgIGNiKGkpO1xuICAgIC8vIERhdGUubm93KCkgaXMgbm90IG1vbm90b25pYywgc28gaW4gY2FzZSBpZiBjbG9jayBnb2VzIGJhY2t3YXJkcyB3ZSByZXR1cm4gcmV0dXJuIGNvbnRyb2wgdG9vXG4gICAgY29uc3QgZGlmZiA9IERhdGUubm93KCkgLSB0cztcbiAgICBpZiAoZGlmZiA+PSAwICYmIGRpZmYgPCB0aWNrKSBjb250aW51ZTtcbiAgICBhd2FpdCBuZXh0VGljaygpO1xuICAgIHRzICs9IGRpZmY7XG4gIH1cbn1cblxuLy8gR2xvYmFsIHN5bWJvbHMsIGJ1dCB0cyBkb2Vzbid0IHNlZSB0aGVtOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzMxNTM1XG5kZWNsYXJlIGNvbnN0IFRleHRFbmNvZGVyOiBhbnk7XG5cbi8qKlxuICogQ29udmVydHMgc3RyaW5nIHRvIGJ5dGVzIHVzaW5nIFVURjggZW5jb2RpbmcuXG4gKiBCdWlsdC1pbiBkb2Vzbid0IHZhbGlkYXRlIGlucHV0IHRvIGJlIHN0cmluZzogd2UgZG8gdGhlIGNoZWNrLlxuICogQGV4YW1wbGUgdXRmOFRvQnl0ZXMoJ2FiYycpIC8vIFVpbnQ4QXJyYXkuZnJvbShbOTcsIDk4LCA5OV0pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGY4VG9CeXRlcyhzdHI6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignc3RyaW5nIGV4cGVjdGVkJyk7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyKSk7IC8vIGh0dHBzOi8vYnVnemlsLmxhLzE2ODE4MDlcbn1cblxuLyoqIEtERnMgY2FuIGFjY2VwdCBzdHJpbmcgb3IgVWludDhBcnJheSBmb3IgdXNlciBjb252ZW5pZW5jZS4gKi9cbmV4cG9ydCB0eXBlIEtERklucHV0ID0gc3RyaW5nIHwgVWludDhBcnJheTtcblxuLyoqXG4gKiBIZWxwZXIgZm9yIEtERnM6IGNvbnN1bWVzIHVpbnQ4YXJyYXkgb3Igc3RyaW5nLlxuICogV2hlbiBzdHJpbmcgaXMgcGFzc2VkLCBkb2VzIHV0ZjggZGVjb2RpbmcsIHVzaW5nIFRleHREZWNvZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24ga2RmSW5wdXRUb0J5dGVzKGRhdGE6IEtERklucHV0LCBlcnJvclRpdGxlID0gJycpOiBVaW50OEFycmF5IHtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykgcmV0dXJuIHV0ZjhUb0J5dGVzKGRhdGEpO1xuICByZXR1cm4gYWJ5dGVzKGRhdGEsIHVuZGVmaW5lZCwgZXJyb3JUaXRsZSk7XG59XG5cbi8qKiBDb3BpZXMgc2V2ZXJhbCBVaW50OEFycmF5cyBpbnRvIG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXRCeXRlcyguLi5hcnJheXM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgc3VtID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgIGFieXRlcyhhKTtcbiAgICBzdW0gKz0gYS5sZW5ndGg7XG4gIH1cbiAgY29uc3QgcmVzID0gbmV3IFVpbnQ4QXJyYXkoc3VtKTtcbiAgZm9yIChsZXQgaSA9IDAsIHBhZCA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhID0gYXJyYXlzW2ldO1xuICAgIHJlcy5zZXQoYSwgcGFkKTtcbiAgICBwYWQgKz0gYS5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudHlwZSBFbXB0eU9iaiA9IHt9O1xuLyoqIE1lcmdlcyBkZWZhdWx0IG9wdGlvbnMgYW5kIHBhc3NlZCBvcHRpb25zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrT3B0czxUMSBleHRlbmRzIEVtcHR5T2JqLCBUMiBleHRlbmRzIEVtcHR5T2JqPihcbiAgZGVmYXVsdHM6IFQxLFxuICBvcHRzPzogVDJcbik6IFQxICYgVDIge1xuICBpZiAob3B0cyAhPT0gdW5kZWZpbmVkICYmIHt9LnRvU3RyaW5nLmNhbGwob3B0cykgIT09ICdbb2JqZWN0IE9iamVjdF0nKVxuICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9ucyBtdXN0IGJlIG9iamVjdCBvciB1bmRlZmluZWQnKTtcbiAgY29uc3QgbWVyZ2VkID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0cyk7XG4gIHJldHVybiBtZXJnZWQgYXMgVDEgJiBUMjtcbn1cblxuLyoqIENvbW1vbiBpbnRlcmZhY2UgZm9yIGFsbCBoYXNoZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIEhhc2g8VD4ge1xuICBibG9ja0xlbjogbnVtYmVyOyAvLyBCeXRlcyBwZXIgYmxvY2tcbiAgb3V0cHV0TGVuOiBudW1iZXI7IC8vIEJ5dGVzIGluIG91dHB1dFxuICB1cGRhdGUoYnVmOiBVaW50OEFycmF5KTogdGhpcztcbiAgZGlnZXN0SW50byhidWY6IFVpbnQ4QXJyYXkpOiB2b2lkO1xuICBkaWdlc3QoKTogVWludDhBcnJheTtcbiAgZGVzdHJveSgpOiB2b2lkO1xuICBfY2xvbmVJbnRvKHRvPzogVCk6IFQ7XG4gIGNsb25lKCk6IFQ7XG59XG5cbi8qKiBQc2V1ZG9SYW5kb20gKG51bWJlcikgR2VuZXJhdG9yICovXG5leHBvcnQgaW50ZXJmYWNlIFBSRyB7XG4gIGFkZEVudHJvcHkoc2VlZDogVWludDhBcnJheSk6IHZvaWQ7XG4gIHJhbmRvbUJ5dGVzKGxlbmd0aDogbnVtYmVyKTogVWludDhBcnJheTtcbiAgY2xlYW4oKTogdm9pZDtcbn1cblxuLyoqXG4gKiBYT0Y6IHN0cmVhbWluZyBBUEkgdG8gcmVhZCBkaWdlc3QgaW4gY2h1bmtzLlxuICogU2FtZSBhcyAnc3F1ZWV6ZScgaW4ga2VjY2FrL2sxMiBhbmQgJ3NlZWsnIGluIGJsYWtlMywgYnV0IG1vcmUgZ2VuZXJpYyBuYW1lLlxuICogV2hlbiBoYXNoIHVzZWQgaW4gWE9GIG1vZGUgaXQgaXMgdXAgdG8gdXNlciB0byBjYWxsICcuZGVzdHJveScgYWZ0ZXJ3YXJkcywgc2luY2Ugd2UgY2Fubm90XG4gKiBkZXN0cm95IHN0YXRlLCBuZXh0IGNhbGwgY2FuIHJlcXVpcmUgbW9yZSBieXRlcy5cbiAqL1xuZXhwb3J0IHR5cGUgSGFzaFhPRjxUIGV4dGVuZHMgSGFzaDxUPj4gPSBIYXNoPFQ+ICYge1xuICB4b2YoYnl0ZXM6IG51bWJlcik6IFVpbnQ4QXJyYXk7IC8vIFJlYWQgJ2J5dGVzJyBieXRlcyBmcm9tIGRpZ2VzdCBzdHJlYW1cbiAgeG9mSW50byhidWY6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5OyAvLyByZWFkIGJ1Zi5sZW5ndGggYnl0ZXMgZnJvbSBkaWdlc3Qgc3RyZWFtIGludG8gYnVmXG59O1xuXG4vKiogSGFzaCBjb25zdHJ1Y3RvciAqL1xuZXhwb3J0IHR5cGUgSGFzaGVyQ29uczxULCBPcHRzID0gdW5kZWZpbmVkPiA9IE9wdHMgZXh0ZW5kcyB1bmRlZmluZWQgPyAoKSA9PiBUIDogKG9wdHM/OiBPcHRzKSA9PiBUO1xuLyoqIE9wdGlvbmFsIGhhc2ggcGFyYW1zLiAqL1xuZXhwb3J0IHR5cGUgSGFzaEluZm8gPSB7XG4gIG9pZD86IFVpbnQ4QXJyYXk7IC8vIERFUiBlbmNvZGVkIE9JRCBpbiBieXRlc1xufTtcbi8qKiBIYXNoIGZ1bmN0aW9uICovXG5leHBvcnQgdHlwZSBDSGFzaDxUIGV4dGVuZHMgSGFzaDxUPiA9IEhhc2g8YW55PiwgT3B0cyA9IHVuZGVmaW5lZD4gPSB7XG4gIG91dHB1dExlbjogbnVtYmVyO1xuICBibG9ja0xlbjogbnVtYmVyO1xufSAmIEhhc2hJbmZvICZcbiAgKE9wdHMgZXh0ZW5kcyB1bmRlZmluZWRcbiAgICA/IHtcbiAgICAgICAgKG1zZzogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGNyZWF0ZSgpOiBUO1xuICAgICAgfVxuICAgIDoge1xuICAgICAgICAobXNnOiBVaW50OEFycmF5LCBvcHRzPzogT3B0cyk6IFVpbnQ4QXJyYXk7XG4gICAgICAgIGNyZWF0ZShvcHRzPzogT3B0cyk6IFQ7XG4gICAgICB9KTtcbi8qKiBYT0Ygd2l0aCBvdXRwdXQgKi9cbmV4cG9ydCB0eXBlIENIYXNoWE9GPFQgZXh0ZW5kcyBIYXNoWE9GPFQ+ID0gSGFzaFhPRjxhbnk+LCBPcHRzID0gdW5kZWZpbmVkPiA9IENIYXNoPFQsIE9wdHM+O1xuXG4vKiogQ3JlYXRlcyBmdW5jdGlvbiB3aXRoIG91dHB1dExlbiwgYmxvY2tMZW4sIGNyZWF0ZSBwcm9wZXJ0aWVzIGZyb20gYSBjbGFzcyBjb25zdHJ1Y3Rvci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIYXNoZXI8VCBleHRlbmRzIEhhc2g8VD4sIE9wdHMgPSB1bmRlZmluZWQ+KFxuICBoYXNoQ29uczogSGFzaGVyQ29uczxULCBPcHRzPixcbiAgaW5mbzogSGFzaEluZm8gPSB7fVxuKTogQ0hhc2g8VCwgT3B0cz4ge1xuICBjb25zdCBoYXNoQzogYW55ID0gKG1zZzogVWludDhBcnJheSwgb3B0cz86IE9wdHMpID0+IGhhc2hDb25zKG9wdHMpLnVwZGF0ZShtc2cpLmRpZ2VzdCgpO1xuICBjb25zdCB0bXAgPSBoYXNoQ29ucyh1bmRlZmluZWQpO1xuICBoYXNoQy5vdXRwdXRMZW4gPSB0bXAub3V0cHV0TGVuO1xuICBoYXNoQy5ibG9ja0xlbiA9IHRtcC5ibG9ja0xlbjtcbiAgaGFzaEMuY3JlYXRlID0gKG9wdHM/OiBPcHRzKSA9PiBoYXNoQ29ucyhvcHRzKTtcbiAgT2JqZWN0LmFzc2lnbihoYXNoQywgaW5mbyk7XG4gIHJldHVybiBPYmplY3QuZnJlZXplKGhhc2hDKTtcbn1cblxuLyoqIENyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBQUk5HLiBVc2VzIGludGVybmFsIE9TLWxldmVsIGBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21CeXRlcyhieXRlc0xlbmd0aCA9IDMyKTogVWludDhBcnJheSB7XG4gIGNvbnN0IGNyID0gdHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnID8gKGdsb2JhbFRoaXMgYXMgYW55KS5jcnlwdG8gOiBudWxsO1xuICBpZiAodHlwZW9mIGNyPy5nZXRSYW5kb21WYWx1ZXMgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzIG11c3QgYmUgZGVmaW5lZCcpO1xuICByZXR1cm4gY3IuZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KGJ5dGVzTGVuZ3RoKSk7XG59XG5cbi8qKiBDcmVhdGVzIE9JRCBvcHRzIGZvciBOSVNUIGhhc2hlcywgd2l0aCBwcmVmaXggMDYgMDkgNjAgODYgNDggMDEgNjUgMDMgMDQgMDIuICovXG5leHBvcnQgY29uc3Qgb2lkTmlzdCA9IChzdWZmaXg6IG51bWJlcik6IFJlcXVpcmVkPEhhc2hJbmZvPiA9PiAoe1xuICBvaWQ6IFVpbnQ4QXJyYXkuZnJvbShbMHgwNiwgMHgwOSwgMHg2MCwgMHg4NiwgMHg0OCwgMHgwMSwgMHg2NSwgMHgwMywgMHgwNCwgMHgwMiwgc3VmZml4XSksXG59KTtcbiIsICIvKipcbiAqIFNIQTIgaGFzaCBmdW5jdGlvbi4gQS5rLmEuIHNoYTI1Niwgc2hhMzg0LCBzaGE1MTIsIHNoYTUxMl8yMjQsIHNoYTUxMl8yNTYuXG4gKiBTSEEyNTYgaXMgdGhlIGZhc3Rlc3QgaGFzaCBpbXBsZW1lbnRhYmxlIGluIEpTLCBldmVuIGZhc3RlciB0aGFuIEJsYWtlMy5cbiAqIENoZWNrIG91dCBbUkZDIDQ2MzRdKGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM0NjM0KSBhbmRcbiAqIFtGSVBTIDE4MC00XShodHRwczovL252bHB1YnMubmlzdC5nb3YvbmlzdHB1YnMvRklQUy9OSVNULkZJUFMuMTgwLTQucGRmKS5cbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgQ2hpLCBIYXNoTUQsIE1haiwgU0hBMjI0X0lWLCBTSEEyNTZfSVYsIFNIQTM4NF9JViwgU0hBNTEyX0lWIH0gZnJvbSAnLi9fbWQudHMnO1xuaW1wb3J0ICogYXMgdTY0IGZyb20gJy4vX3U2NC50cyc7XG5pbXBvcnQgeyB0eXBlIENIYXNoLCBjbGVhbiwgY3JlYXRlSGFzaGVyLCBvaWROaXN0LCByb3RyIH0gZnJvbSAnLi91dGlscy50cyc7XG5cbi8qKlxuICogUm91bmQgY29uc3RhbnRzOlxuICogRmlyc3QgMzIgYml0cyBvZiBmcmFjdGlvbmFsIHBhcnRzIG9mIHRoZSBjdWJlIHJvb3RzIG9mIHRoZSBmaXJzdCA2NCBwcmltZXMgMi4uMzExKVxuICovXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IFNIQTI1Nl9LID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDQyOGEyZjk4LCAweDcxMzc0NDkxLCAweGI1YzBmYmNmLCAweGU5YjVkYmE1LCAweDM5NTZjMjViLCAweDU5ZjExMWYxLCAweDkyM2Y4MmE0LCAweGFiMWM1ZWQ1LFxuICAweGQ4MDdhYTk4LCAweDEyODM1YjAxLCAweDI0MzE4NWJlLCAweDU1MGM3ZGMzLCAweDcyYmU1ZDc0LCAweDgwZGViMWZlLCAweDliZGMwNmE3LCAweGMxOWJmMTc0LFxuICAweGU0OWI2OWMxLCAweGVmYmU0Nzg2LCAweDBmYzE5ZGM2LCAweDI0MGNhMWNjLCAweDJkZTkyYzZmLCAweDRhNzQ4NGFhLCAweDVjYjBhOWRjLCAweDc2Zjk4OGRhLFxuICAweDk4M2U1MTUyLCAweGE4MzFjNjZkLCAweGIwMDMyN2M4LCAweGJmNTk3ZmM3LCAweGM2ZTAwYmYzLCAweGQ1YTc5MTQ3LCAweDA2Y2E2MzUxLCAweDE0MjkyOTY3LFxuICAweDI3YjcwYTg1LCAweDJlMWIyMTM4LCAweDRkMmM2ZGZjLCAweDUzMzgwZDEzLCAweDY1MGE3MzU0LCAweDc2NmEwYWJiLCAweDgxYzJjOTJlLCAweDkyNzIyYzg1LFxuICAweGEyYmZlOGExLCAweGE4MWE2NjRiLCAweGMyNGI4YjcwLCAweGM3NmM1MWEzLCAweGQxOTJlODE5LCAweGQ2OTkwNjI0LCAweGY0MGUzNTg1LCAweDEwNmFhMDcwLFxuICAweDE5YTRjMTE2LCAweDFlMzc2YzA4LCAweDI3NDg3NzRjLCAweDM0YjBiY2I1LCAweDM5MWMwY2IzLCAweDRlZDhhYTRhLCAweDViOWNjYTRmLCAweDY4MmU2ZmYzLFxuICAweDc0OGY4MmVlLCAweDc4YTU2MzZmLCAweDg0Yzg3ODE0LCAweDhjYzcwMjA4LCAweDkwYmVmZmZhLCAweGE0NTA2Y2ViLCAweGJlZjlhM2Y3LCAweGM2NzE3OGYyXG5dKTtcblxuLyoqIFJldXNhYmxlIHRlbXBvcmFyeSBidWZmZXIuIFwiV1wiIGNvbWVzIHN0cmFpZ2h0IGZyb20gc3BlYy4gKi9cbmNvbnN0IFNIQTI1Nl9XID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg2NCk7XG5cbi8qKiBJbnRlcm5hbCAzMi1ieXRlIGJhc2UgU0hBMiBoYXNoIGNsYXNzLiAqL1xuYWJzdHJhY3QgY2xhc3MgU0hBMl8zMkI8VCBleHRlbmRzIFNIQTJfMzJCPFQ+PiBleHRlbmRzIEhhc2hNRDxUPiB7XG4gIC8vIFdlIGNhbm5vdCB1c2UgYXJyYXkgaGVyZSBzaW5jZSBhcnJheSBhbGxvd3MgaW5kZXhpbmcgYnkgdmFyaWFibGVcbiAgLy8gd2hpY2ggbWVhbnMgb3B0aW1pemVyL2NvbXBpbGVyIGNhbm5vdCB1c2UgcmVnaXN0ZXJzLlxuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQTogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQjogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQzogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRTogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRjogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRzogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgSDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG91dHB1dExlbjogbnVtYmVyKSB7XG4gICAgc3VwZXIoNjQsIG91dHB1dExlbiwgOCwgZmFsc2UpO1xuICB9XG4gIHByb3RlY3RlZCBnZXQoKTogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSB7XG4gICAgY29uc3QgeyBBLCBCLCBDLCBELCBFLCBGLCBHLCBIIH0gPSB0aGlzO1xuICAgIHJldHVybiBbQSwgQiwgQywgRCwgRSwgRiwgRywgSF07XG4gIH1cbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIHByb3RlY3RlZCBzZXQoXG4gICAgQTogbnVtYmVyLCBCOiBudW1iZXIsIEM6IG51bWJlciwgRDogbnVtYmVyLCBFOiBudW1iZXIsIEY6IG51bWJlciwgRzogbnVtYmVyLCBIOiBudW1iZXJcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5BID0gQSB8IDA7XG4gICAgdGhpcy5CID0gQiB8IDA7XG4gICAgdGhpcy5DID0gQyB8IDA7XG4gICAgdGhpcy5EID0gRCB8IDA7XG4gICAgdGhpcy5FID0gRSB8IDA7XG4gICAgdGhpcy5GID0gRiB8IDA7XG4gICAgdGhpcy5HID0gRyB8IDA7XG4gICAgdGhpcy5IID0gSCB8IDA7XG4gIH1cbiAgcHJvdGVjdGVkIHByb2Nlc3ModmlldzogRGF0YVZpZXcsIG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gRXh0ZW5kIHRoZSBmaXJzdCAxNiB3b3JkcyBpbnRvIHRoZSByZW1haW5pbmcgNDggd29yZHMgd1sxNi4uNjNdIG9mIHRoZSBtZXNzYWdlIHNjaGVkdWxlIGFycmF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgaSsrLCBvZmZzZXQgKz0gNCkgU0hBMjU2X1dbaV0gPSB2aWV3LmdldFVpbnQzMihvZmZzZXQsIGZhbHNlKTtcbiAgICBmb3IgKGxldCBpID0gMTY7IGkgPCA2NDsgaSsrKSB7XG4gICAgICBjb25zdCBXMTUgPSBTSEEyNTZfV1tpIC0gMTVdO1xuICAgICAgY29uc3QgVzIgPSBTSEEyNTZfV1tpIC0gMl07XG4gICAgICBjb25zdCBzMCA9IHJvdHIoVzE1LCA3KSBeIHJvdHIoVzE1LCAxOCkgXiAoVzE1ID4+PiAzKTtcbiAgICAgIGNvbnN0IHMxID0gcm90cihXMiwgMTcpIF4gcm90cihXMiwgMTkpIF4gKFcyID4+PiAxMCk7XG4gICAgICBTSEEyNTZfV1tpXSA9IChzMSArIFNIQTI1Nl9XW2kgLSA3XSArIHMwICsgU0hBMjU2X1dbaSAtIDE2XSkgfCAwO1xuICAgIH1cbiAgICAvLyBDb21wcmVzc2lvbiBmdW5jdGlvbiBtYWluIGxvb3AsIDY0IHJvdW5kc1xuICAgIGxldCB7IEEsIEIsIEMsIEQsIEUsIEYsIEcsIEggfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2NDsgaSsrKSB7XG4gICAgICBjb25zdCBzaWdtYTEgPSByb3RyKEUsIDYpIF4gcm90cihFLCAxMSkgXiByb3RyKEUsIDI1KTtcbiAgICAgIGNvbnN0IFQxID0gKEggKyBzaWdtYTEgKyBDaGkoRSwgRiwgRykgKyBTSEEyNTZfS1tpXSArIFNIQTI1Nl9XW2ldKSB8IDA7XG4gICAgICBjb25zdCBzaWdtYTAgPSByb3RyKEEsIDIpIF4gcm90cihBLCAxMykgXiByb3RyKEEsIDIyKTtcbiAgICAgIGNvbnN0IFQyID0gKHNpZ21hMCArIE1haihBLCBCLCBDKSkgfCAwO1xuICAgICAgSCA9IEc7XG4gICAgICBHID0gRjtcbiAgICAgIEYgPSBFO1xuICAgICAgRSA9IChEICsgVDEpIHwgMDtcbiAgICAgIEQgPSBDO1xuICAgICAgQyA9IEI7XG4gICAgICBCID0gQTtcbiAgICAgIEEgPSAoVDEgKyBUMikgfCAwO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGNvbXByZXNzZWQgY2h1bmsgdG8gdGhlIGN1cnJlbnQgaGFzaCB2YWx1ZVxuICAgIEEgPSAoQSArIHRoaXMuQSkgfCAwO1xuICAgIEIgPSAoQiArIHRoaXMuQikgfCAwO1xuICAgIEMgPSAoQyArIHRoaXMuQykgfCAwO1xuICAgIEQgPSAoRCArIHRoaXMuRCkgfCAwO1xuICAgIEUgPSAoRSArIHRoaXMuRSkgfCAwO1xuICAgIEYgPSAoRiArIHRoaXMuRikgfCAwO1xuICAgIEcgPSAoRyArIHRoaXMuRykgfCAwO1xuICAgIEggPSAoSCArIHRoaXMuSCkgfCAwO1xuICAgIHRoaXMuc2V0KEEsIEIsIEMsIEQsIEUsIEYsIEcsIEgpO1xuICB9XG4gIHByb3RlY3RlZCByb3VuZENsZWFuKCk6IHZvaWQge1xuICAgIGNsZWFuKFNIQTI1Nl9XKTtcbiAgfVxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICAgIGNsZWFuKHRoaXMuYnVmZmVyKTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi0yNTYgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBMjU2IGV4dGVuZHMgU0hBMl8zMkI8X1NIQTI1Nj4ge1xuICAvLyBXZSBjYW5ub3QgdXNlIGFycmF5IGhlcmUgc2luY2UgYXJyYXkgYWxsb3dzIGluZGV4aW5nIGJ5IHZhcmlhYmxlXG4gIC8vIHdoaWNoIG1lYW5zIG9wdGltaXplci9jb21waWxlciBjYW5ub3QgdXNlIHJlZ2lzdGVycy5cbiAgcHJvdGVjdGVkIEE6IG51bWJlciA9IFNIQTI1Nl9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBCOiBudW1iZXIgPSBTSEEyNTZfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQzogbnVtYmVyID0gU0hBMjU2X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEQ6IG51bWJlciA9IFNIQTI1Nl9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBFOiBudW1iZXIgPSBTSEEyNTZfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgRjogbnVtYmVyID0gU0hBMjU2X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIEc6IG51bWJlciA9IFNIQTI1Nl9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBIOiBudW1iZXIgPSBTSEEyNTZfSVZbN10gfCAwO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigzMik7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItMjI0IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTIyNCBleHRlbmRzIFNIQTJfMzJCPF9TSEEyMjQ+IHtcbiAgcHJvdGVjdGVkIEE6IG51bWJlciA9IFNIQTIyNF9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBCOiBudW1iZXIgPSBTSEEyMjRfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQzogbnVtYmVyID0gU0hBMjI0X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEQ6IG51bWJlciA9IFNIQTIyNF9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBFOiBudW1iZXIgPSBTSEEyMjRfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgRjogbnVtYmVyID0gU0hBMjI0X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIEc6IG51bWJlciA9IFNIQTIyNF9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBIOiBudW1iZXIgPSBTSEEyMjRfSVZbN10gfCAwO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigyOCk7XG4gIH1cbn1cblxuLy8gU0hBMi01MTIgaXMgc2xvd2VyIHRoYW4gc2hhMjU2IGluIGpzIGJlY2F1c2UgdTY0IG9wZXJhdGlvbnMgYXJlIHNsb3cuXG5cbi8vIFJvdW5kIGNvbnRhbnRzXG4vLyBGaXJzdCAzMiBiaXRzIG9mIHRoZSBmcmFjdGlvbmFsIHBhcnRzIG9mIHRoZSBjdWJlIHJvb3RzIG9mIHRoZSBmaXJzdCA4MCBwcmltZXMgMi4uNDA5XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IEs1MTIgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IHU2NC5zcGxpdChbXG4gICcweDQyOGEyZjk4ZDcyOGFlMjInLCAnMHg3MTM3NDQ5MTIzZWY2NWNkJywgJzB4YjVjMGZiY2ZlYzRkM2IyZicsICcweGU5YjVkYmE1ODE4OWRiYmMnLFxuICAnMHgzOTU2YzI1YmYzNDhiNTM4JywgJzB4NTlmMTExZjFiNjA1ZDAxOScsICcweDkyM2Y4MmE0YWYxOTRmOWInLCAnMHhhYjFjNWVkNWRhNmQ4MTE4JyxcbiAgJzB4ZDgwN2FhOThhMzAzMDI0MicsICcweDEyODM1YjAxNDU3MDZmYmUnLCAnMHgyNDMxODViZTRlZTRiMjhjJywgJzB4NTUwYzdkYzNkNWZmYjRlMicsXG4gICcweDcyYmU1ZDc0ZjI3Yjg5NmYnLCAnMHg4MGRlYjFmZTNiMTY5NmIxJywgJzB4OWJkYzA2YTcyNWM3MTIzNScsICcweGMxOWJmMTc0Y2Y2OTI2OTQnLFxuICAnMHhlNDliNjljMTllZjE0YWQyJywgJzB4ZWZiZTQ3ODYzODRmMjVlMycsICcweDBmYzE5ZGM2OGI4Y2Q1YjUnLCAnMHgyNDBjYTFjYzc3YWM5YzY1JyxcbiAgJzB4MmRlOTJjNmY1OTJiMDI3NScsICcweDRhNzQ4NGFhNmVhNmU0ODMnLCAnMHg1Y2IwYTlkY2JkNDFmYmQ0JywgJzB4NzZmOTg4ZGE4MzExNTNiNScsXG4gICcweDk4M2U1MTUyZWU2NmRmYWInLCAnMHhhODMxYzY2ZDJkYjQzMjEwJywgJzB4YjAwMzI3Yzg5OGZiMjEzZicsICcweGJmNTk3ZmM3YmVlZjBlZTQnLFxuICAnMHhjNmUwMGJmMzNkYTg4ZmMyJywgJzB4ZDVhNzkxNDc5MzBhYTcyNScsICcweDA2Y2E2MzUxZTAwMzgyNmYnLCAnMHgxNDI5Mjk2NzBhMGU2ZTcwJyxcbiAgJzB4MjdiNzBhODU0NmQyMmZmYycsICcweDJlMWIyMTM4NWMyNmM5MjYnLCAnMHg0ZDJjNmRmYzVhYzQyYWVkJywgJzB4NTMzODBkMTM5ZDk1YjNkZicsXG4gICcweDY1MGE3MzU0OGJhZjYzZGUnLCAnMHg3NjZhMGFiYjNjNzdiMmE4JywgJzB4ODFjMmM5MmU0N2VkYWVlNicsICcweDkyNzIyYzg1MTQ4MjM1M2InLFxuICAnMHhhMmJmZThhMTRjZjEwMzY0JywgJzB4YTgxYTY2NGJiYzQyMzAwMScsICcweGMyNGI4YjcwZDBmODk3OTEnLCAnMHhjNzZjNTFhMzA2NTRiZTMwJyxcbiAgJzB4ZDE5MmU4MTlkNmVmNTIxOCcsICcweGQ2OTkwNjI0NTU2NWE5MTAnLCAnMHhmNDBlMzU4NTU3NzEyMDJhJywgJzB4MTA2YWEwNzAzMmJiZDFiOCcsXG4gICcweDE5YTRjMTE2YjhkMmQwYzgnLCAnMHgxZTM3NmMwODUxNDFhYjUzJywgJzB4Mjc0ODc3NGNkZjhlZWI5OScsICcweDM0YjBiY2I1ZTE5YjQ4YTgnLFxuICAnMHgzOTFjMGNiM2M1Yzk1YTYzJywgJzB4NGVkOGFhNGFlMzQxOGFjYicsICcweDViOWNjYTRmNzc2M2UzNzMnLCAnMHg2ODJlNmZmM2Q2YjJiOGEzJyxcbiAgJzB4NzQ4ZjgyZWU1ZGVmYjJmYycsICcweDc4YTU2MzZmNDMxNzJmNjAnLCAnMHg4NGM4NzgxNGExZjBhYjcyJywgJzB4OGNjNzAyMDgxYTY0MzllYycsXG4gICcweDkwYmVmZmZhMjM2MzFlMjgnLCAnMHhhNDUwNmNlYmRlODJiZGU5JywgJzB4YmVmOWEzZjdiMmM2NzkxNScsICcweGM2NzE3OGYyZTM3MjUzMmInLFxuICAnMHhjYTI3M2VjZWVhMjY2MTljJywgJzB4ZDE4NmI4YzcyMWMwYzIwNycsICcweGVhZGE3ZGQ2Y2RlMGViMWUnLCAnMHhmNTdkNGY3ZmVlNmVkMTc4JyxcbiAgJzB4MDZmMDY3YWE3MjE3NmZiYScsICcweDBhNjM3ZGM1YTJjODk4YTYnLCAnMHgxMTNmOTgwNGJlZjkwZGFlJywgJzB4MWI3MTBiMzUxMzFjNDcxYicsXG4gICcweDI4ZGI3N2Y1MjMwNDdkODQnLCAnMHgzMmNhYWI3YjQwYzcyNDkzJywgJzB4M2M5ZWJlMGExNWM5YmViYycsICcweDQzMWQ2N2M0OWMxMDBkNGMnLFxuICAnMHg0Y2M1ZDRiZWNiM2U0MmI2JywgJzB4NTk3ZjI5OWNmYzY1N2UyYScsICcweDVmY2I2ZmFiM2FkNmZhZWMnLCAnMHg2YzQ0MTk4YzRhNDc1ODE3J1xuXS5tYXAobiA9PiBCaWdJbnQobikpKSkoKTtcbmNvbnN0IFNIQTUxMl9LaCA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4gSzUxMlswXSkoKTtcbmNvbnN0IFNIQTUxMl9LbCA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4gSzUxMlsxXSkoKTtcblxuLy8gUmV1c2FibGUgdGVtcG9yYXJ5IGJ1ZmZlcnNcbmNvbnN0IFNIQTUxMl9XX0ggPSAvKiBAX19QVVJFX18gKi8gbmV3IFVpbnQzMkFycmF5KDgwKTtcbmNvbnN0IFNIQTUxMl9XX0wgPSAvKiBAX19QVVJFX18gKi8gbmV3IFVpbnQzMkFycmF5KDgwKTtcblxuLyoqIEludGVybmFsIDY0LWJ5dGUgYmFzZSBTSEEyIGhhc2ggY2xhc3MuICovXG5hYnN0cmFjdCBjbGFzcyBTSEEyXzY0QjxUIGV4dGVuZHMgU0hBMl82NEI8VD4+IGV4dGVuZHMgSGFzaE1EPFQ+IHtcbiAgLy8gV2UgY2Fubm90IHVzZSBhcnJheSBoZXJlIHNpbmNlIGFycmF5IGFsbG93cyBpbmRleGluZyBieSB2YXJpYWJsZVxuICAvLyB3aGljaCBtZWFucyBvcHRpbWl6ZXIvY29tcGlsZXIgY2Fubm90IHVzZSByZWdpc3RlcnMuXG4gIC8vIGggLS0gaGlnaCAzMiBiaXRzLCBsIC0tIGxvdyAzMiBiaXRzXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBBaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQWw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEJoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBCbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQ2g6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IENsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBEaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRGw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEVoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBFbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRmg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEZsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBHaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgR2w6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEhoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBIbDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG91dHB1dExlbjogbnVtYmVyKSB7XG4gICAgc3VwZXIoMTI4LCBvdXRwdXRMZW4sIDE2LCBmYWxzZSk7XG4gIH1cbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIHByb3RlY3RlZCBnZXQoKTogW1xuICAgIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICAgIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXG4gIF0ge1xuICAgIGNvbnN0IHsgQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGwgfSA9IHRoaXM7XG4gICAgcmV0dXJuIFtBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbF07XG4gIH1cbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIHByb3RlY3RlZCBzZXQoXG4gICAgQWg6IG51bWJlciwgQWw6IG51bWJlciwgQmg6IG51bWJlciwgQmw6IG51bWJlciwgQ2g6IG51bWJlciwgQ2w6IG51bWJlciwgRGg6IG51bWJlciwgRGw6IG51bWJlcixcbiAgICBFaDogbnVtYmVyLCBFbDogbnVtYmVyLCBGaDogbnVtYmVyLCBGbDogbnVtYmVyLCBHaDogbnVtYmVyLCBHbDogbnVtYmVyLCBIaDogbnVtYmVyLCBIbDogbnVtYmVyXG4gICk6IHZvaWQge1xuICAgIHRoaXMuQWggPSBBaCB8IDA7XG4gICAgdGhpcy5BbCA9IEFsIHwgMDtcbiAgICB0aGlzLkJoID0gQmggfCAwO1xuICAgIHRoaXMuQmwgPSBCbCB8IDA7XG4gICAgdGhpcy5DaCA9IENoIHwgMDtcbiAgICB0aGlzLkNsID0gQ2wgfCAwO1xuICAgIHRoaXMuRGggPSBEaCB8IDA7XG4gICAgdGhpcy5EbCA9IERsIHwgMDtcbiAgICB0aGlzLkVoID0gRWggfCAwO1xuICAgIHRoaXMuRWwgPSBFbCB8IDA7XG4gICAgdGhpcy5GaCA9IEZoIHwgMDtcbiAgICB0aGlzLkZsID0gRmwgfCAwO1xuICAgIHRoaXMuR2ggPSBHaCB8IDA7XG4gICAgdGhpcy5HbCA9IEdsIHwgMDtcbiAgICB0aGlzLkhoID0gSGggfCAwO1xuICAgIHRoaXMuSGwgPSBIbCB8IDA7XG4gIH1cbiAgcHJvdGVjdGVkIHByb2Nlc3ModmlldzogRGF0YVZpZXcsIG9mZnNldDogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gRXh0ZW5kIHRoZSBmaXJzdCAxNiB3b3JkcyBpbnRvIHRoZSByZW1haW5pbmcgNjQgd29yZHMgd1sxNi4uNzldIG9mIHRoZSBtZXNzYWdlIHNjaGVkdWxlIGFycmF5XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgaSsrLCBvZmZzZXQgKz0gNCkge1xuICAgICAgU0hBNTEyX1dfSFtpXSA9IHZpZXcuZ2V0VWludDMyKG9mZnNldCk7XG4gICAgICBTSEE1MTJfV19MW2ldID0gdmlldy5nZXRVaW50MzIoKG9mZnNldCArPSA0KSk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAxNjsgaSA8IDgwOyBpKyspIHtcbiAgICAgIC8vIHMwIDo9ICh3W2ktMTVdIHJpZ2h0cm90YXRlIDEpIHhvciAod1tpLTE1XSByaWdodHJvdGF0ZSA4KSB4b3IgKHdbaS0xNV0gcmlnaHRzaGlmdCA3KVxuICAgICAgY29uc3QgVzE1aCA9IFNIQTUxMl9XX0hbaSAtIDE1XSB8IDA7XG4gICAgICBjb25zdCBXMTVsID0gU0hBNTEyX1dfTFtpIC0gMTVdIHwgMDtcbiAgICAgIGNvbnN0IHMwaCA9IHU2NC5yb3RyU0goVzE1aCwgVzE1bCwgMSkgXiB1NjQucm90clNIKFcxNWgsIFcxNWwsIDgpIF4gdTY0LnNoclNIKFcxNWgsIFcxNWwsIDcpO1xuICAgICAgY29uc3QgczBsID0gdTY0LnJvdHJTTChXMTVoLCBXMTVsLCAxKSBeIHU2NC5yb3RyU0woVzE1aCwgVzE1bCwgOCkgXiB1NjQuc2hyU0woVzE1aCwgVzE1bCwgNyk7XG4gICAgICAvLyBzMSA6PSAod1tpLTJdIHJpZ2h0cm90YXRlIDE5KSB4b3IgKHdbaS0yXSByaWdodHJvdGF0ZSA2MSkgeG9yICh3W2ktMl0gcmlnaHRzaGlmdCA2KVxuICAgICAgY29uc3QgVzJoID0gU0hBNTEyX1dfSFtpIC0gMl0gfCAwO1xuICAgICAgY29uc3QgVzJsID0gU0hBNTEyX1dfTFtpIC0gMl0gfCAwO1xuICAgICAgY29uc3QgczFoID0gdTY0LnJvdHJTSChXMmgsIFcybCwgMTkpIF4gdTY0LnJvdHJCSChXMmgsIFcybCwgNjEpIF4gdTY0LnNoclNIKFcyaCwgVzJsLCA2KTtcbiAgICAgIGNvbnN0IHMxbCA9IHU2NC5yb3RyU0woVzJoLCBXMmwsIDE5KSBeIHU2NC5yb3RyQkwoVzJoLCBXMmwsIDYxKSBeIHU2NC5zaHJTTChXMmgsIFcybCwgNik7XG4gICAgICAvLyBTSEEyNTZfV1tpXSA9IHMwICsgczEgKyBTSEEyNTZfV1tpIC0gN10gKyBTSEEyNTZfV1tpIC0gMTZdO1xuICAgICAgY29uc3QgU1VNbCA9IHU2NC5hZGQ0TChzMGwsIHMxbCwgU0hBNTEyX1dfTFtpIC0gN10sIFNIQTUxMl9XX0xbaSAtIDE2XSk7XG4gICAgICBjb25zdCBTVU1oID0gdTY0LmFkZDRIKFNVTWwsIHMwaCwgczFoLCBTSEE1MTJfV19IW2kgLSA3XSwgU0hBNTEyX1dfSFtpIC0gMTZdKTtcbiAgICAgIFNIQTUxMl9XX0hbaV0gPSBTVU1oIHwgMDtcbiAgICAgIFNIQTUxMl9XX0xbaV0gPSBTVU1sIHwgMDtcbiAgICB9XG4gICAgbGV0IHsgQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGwgfSA9IHRoaXM7XG4gICAgLy8gQ29tcHJlc3Npb24gZnVuY3Rpb24gbWFpbiBsb29wLCA4MCByb3VuZHNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDgwOyBpKyspIHtcbiAgICAgIC8vIFMxIDo9IChlIHJpZ2h0cm90YXRlIDE0KSB4b3IgKGUgcmlnaHRyb3RhdGUgMTgpIHhvciAoZSByaWdodHJvdGF0ZSA0MSlcbiAgICAgIGNvbnN0IHNpZ21hMWggPSB1NjQucm90clNIKEVoLCBFbCwgMTQpIF4gdTY0LnJvdHJTSChFaCwgRWwsIDE4KSBeIHU2NC5yb3RyQkgoRWgsIEVsLCA0MSk7XG4gICAgICBjb25zdCBzaWdtYTFsID0gdTY0LnJvdHJTTChFaCwgRWwsIDE0KSBeIHU2NC5yb3RyU0woRWgsIEVsLCAxOCkgXiB1NjQucm90ckJMKEVoLCBFbCwgNDEpO1xuICAgICAgLy9jb25zdCBUMSA9IChIICsgc2lnbWExICsgQ2hpKEUsIEYsIEcpICsgU0hBMjU2X0tbaV0gKyBTSEEyNTZfV1tpXSkgfCAwO1xuICAgICAgY29uc3QgQ0hJaCA9IChFaCAmIEZoKSBeICh+RWggJiBHaCk7XG4gICAgICBjb25zdCBDSElsID0gKEVsICYgRmwpIF4gKH5FbCAmIEdsKTtcbiAgICAgIC8vIFQxID0gSCArIHNpZ21hMSArIENoaShFLCBGLCBHKSArIFNIQTUxMl9LW2ldICsgU0hBNTEyX1dbaV1cbiAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgY29uc3QgVDFsbCA9IHU2NC5hZGQ1TChIbCwgc2lnbWExbCwgQ0hJbCwgU0hBNTEyX0tsW2ldLCBTSEE1MTJfV19MW2ldKTtcbiAgICAgIGNvbnN0IFQxaCA9IHU2NC5hZGQ1SChUMWxsLCBIaCwgc2lnbWExaCwgQ0hJaCwgU0hBNTEyX0toW2ldLCBTSEE1MTJfV19IW2ldKTtcbiAgICAgIGNvbnN0IFQxbCA9IFQxbGwgfCAwO1xuICAgICAgLy8gUzAgOj0gKGEgcmlnaHRyb3RhdGUgMjgpIHhvciAoYSByaWdodHJvdGF0ZSAzNCkgeG9yIChhIHJpZ2h0cm90YXRlIDM5KVxuICAgICAgY29uc3Qgc2lnbWEwaCA9IHU2NC5yb3RyU0goQWgsIEFsLCAyOCkgXiB1NjQucm90ckJIKEFoLCBBbCwgMzQpIF4gdTY0LnJvdHJCSChBaCwgQWwsIDM5KTtcbiAgICAgIGNvbnN0IHNpZ21hMGwgPSB1NjQucm90clNMKEFoLCBBbCwgMjgpIF4gdTY0LnJvdHJCTChBaCwgQWwsIDM0KSBeIHU2NC5yb3RyQkwoQWgsIEFsLCAzOSk7XG4gICAgICBjb25zdCBNQUpoID0gKEFoICYgQmgpIF4gKEFoICYgQ2gpIF4gKEJoICYgQ2gpO1xuICAgICAgY29uc3QgTUFKbCA9IChBbCAmIEJsKSBeIChBbCAmIENsKSBeIChCbCAmIENsKTtcbiAgICAgIEhoID0gR2ggfCAwO1xuICAgICAgSGwgPSBHbCB8IDA7XG4gICAgICBHaCA9IEZoIHwgMDtcbiAgICAgIEdsID0gRmwgfCAwO1xuICAgICAgRmggPSBFaCB8IDA7XG4gICAgICBGbCA9IEVsIHwgMDtcbiAgICAgICh7IGg6IEVoLCBsOiBFbCB9ID0gdTY0LmFkZChEaCB8IDAsIERsIHwgMCwgVDFoIHwgMCwgVDFsIHwgMCkpO1xuICAgICAgRGggPSBDaCB8IDA7XG4gICAgICBEbCA9IENsIHwgMDtcbiAgICAgIENoID0gQmggfCAwO1xuICAgICAgQ2wgPSBCbCB8IDA7XG4gICAgICBCaCA9IEFoIHwgMDtcbiAgICAgIEJsID0gQWwgfCAwO1xuICAgICAgY29uc3QgQWxsID0gdTY0LmFkZDNMKFQxbCwgc2lnbWEwbCwgTUFKbCk7XG4gICAgICBBaCA9IHU2NC5hZGQzSChBbGwsIFQxaCwgc2lnbWEwaCwgTUFKaCk7XG4gICAgICBBbCA9IEFsbCB8IDA7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgY29tcHJlc3NlZCBjaHVuayB0byB0aGUgY3VycmVudCBoYXNoIHZhbHVlXG4gICAgKHsgaDogQWgsIGw6IEFsIH0gPSB1NjQuYWRkKHRoaXMuQWggfCAwLCB0aGlzLkFsIHwgMCwgQWggfCAwLCBBbCB8IDApKTtcbiAgICAoeyBoOiBCaCwgbDogQmwgfSA9IHU2NC5hZGQodGhpcy5CaCB8IDAsIHRoaXMuQmwgfCAwLCBCaCB8IDAsIEJsIHwgMCkpO1xuICAgICh7IGg6IENoLCBsOiBDbCB9ID0gdTY0LmFkZCh0aGlzLkNoIHwgMCwgdGhpcy5DbCB8IDAsIENoIHwgMCwgQ2wgfCAwKSk7XG4gICAgKHsgaDogRGgsIGw6IERsIH0gPSB1NjQuYWRkKHRoaXMuRGggfCAwLCB0aGlzLkRsIHwgMCwgRGggfCAwLCBEbCB8IDApKTtcbiAgICAoeyBoOiBFaCwgbDogRWwgfSA9IHU2NC5hZGQodGhpcy5FaCB8IDAsIHRoaXMuRWwgfCAwLCBFaCB8IDAsIEVsIHwgMCkpO1xuICAgICh7IGg6IEZoLCBsOiBGbCB9ID0gdTY0LmFkZCh0aGlzLkZoIHwgMCwgdGhpcy5GbCB8IDAsIEZoIHwgMCwgRmwgfCAwKSk7XG4gICAgKHsgaDogR2gsIGw6IEdsIH0gPSB1NjQuYWRkKHRoaXMuR2ggfCAwLCB0aGlzLkdsIHwgMCwgR2ggfCAwLCBHbCB8IDApKTtcbiAgICAoeyBoOiBIaCwgbDogSGwgfSA9IHU2NC5hZGQodGhpcy5IaCB8IDAsIHRoaXMuSGwgfCAwLCBIaCB8IDAsIEhsIHwgMCkpO1xuICAgIHRoaXMuc2V0KEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsKTtcbiAgfVxuICBwcm90ZWN0ZWQgcm91bmRDbGVhbigpOiB2b2lkIHtcbiAgICBjbGVhbihTSEE1MTJfV19ILCBTSEE1MTJfV19MKTtcbiAgfVxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGNsZWFuKHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi01MTIgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBNTEyIGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMj4ge1xuICBwcm90ZWN0ZWQgQWg6IG51bWJlciA9IFNIQTUxMl9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gU0hBNTEyX0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBTSEE1MTJfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgQmw6IG51bWJlciA9IFNIQTUxMl9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gU0hBNTEyX0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBTSEE1MTJfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRGg6IG51bWJlciA9IFNIQTUxMl9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gU0hBNTEyX0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBTSEE1MTJfSVZbOF0gfCAwO1xuICBwcm90ZWN0ZWQgRWw6IG51bWJlciA9IFNIQTUxMl9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gU0hBNTEyX0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gU0hBNTEyX0lWWzExXSB8IDA7XG4gIHByb3RlY3RlZCBHaDogbnVtYmVyID0gU0hBNTEyX0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gU0hBNTEyX0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gU0hBNTEyX0lWWzE0XSB8IDA7XG4gIHByb3RlY3RlZCBIbDogbnVtYmVyID0gU0hBNTEyX0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoNjQpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTM4NCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEEzODQgZXh0ZW5kcyBTSEEyXzY0QjxfU0hBMzg0PiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gU0hBMzg0X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBTSEEzODRfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQmg6IG51bWJlciA9IFNIQTM4NF9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gU0hBMzg0X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBTSEEzODRfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgQ2w6IG51bWJlciA9IFNIQTM4NF9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gU0hBMzg0X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBTSEEzODRfSVZbN10gfCAwO1xuICBwcm90ZWN0ZWQgRWg6IG51bWJlciA9IFNIQTM4NF9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gU0hBMzg0X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBTSEEzODRfSVZbMTBdIHwgMDtcbiAgcHJvdGVjdGVkIEZsOiBudW1iZXIgPSBTSEEzODRfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBTSEEzODRfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBTSEEzODRfSVZbMTNdIHwgMDtcbiAgcHJvdGVjdGVkIEhoOiBudW1iZXIgPSBTSEEzODRfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBTSEEzODRfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcig0OCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUcnVuY2F0ZWQgU0hBNTEyLzI1NiBhbmQgU0hBNTEyLzIyNC5cbiAqIFNIQTUxMl9JViBpcyBYT1JlZCB3aXRoIDB4YTVhNWE1YTVhNWE1YTVhNSwgdGhlbiB1c2VkIGFzIFwiaW50ZXJtZWRpYXJ5XCIgSVYgb2YgU0hBNTEyL3QuXG4gKiBUaGVuIHQgaGFzaGVzIHN0cmluZyB0byBwcm9kdWNlIHJlc3VsdCBJVi5cbiAqIFNlZSBgdGVzdC9taXNjL3NoYTItZ2VuLWl2LmpzYC5cbiAqL1xuXG4vKiogU0hBNTEyLzIyNCBJViAqL1xuY29uc3QgVDIyNF9JViA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHg4YzNkMzdjOCwgMHgxOTU0NGRhMiwgMHg3M2UxOTk2NiwgMHg4OWRjZDRkNiwgMHgxZGZhYjdhZSwgMHgzMmZmOWM4MiwgMHg2NzlkZDUxNCwgMHg1ODJmOWZjZixcbiAgMHgwZjZkMmI2OSwgMHg3YmQ0NGRhOCwgMHg3N2UzNmY3MywgMHgwNGM0ODk0MiwgMHgzZjlkODVhOCwgMHg2YTFkMzZjOCwgMHgxMTEyZTZhZCwgMHg5MWQ2OTJhMSxcbl0pO1xuXG4vKiogU0hBNTEyLzI1NiBJViAqL1xuY29uc3QgVDI1Nl9JViA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHgyMjMxMjE5NCwgMHhmYzJiZjcyYywgMHg5ZjU1NWZhMywgMHhjODRjNjRjMiwgMHgyMzkzYjg2YiwgMHg2ZjUzYjE1MSwgMHg5NjM4NzcxOSwgMHg1OTQwZWFiZCxcbiAgMHg5NjI4M2VlMiwgMHhhODhlZmZlMywgMHhiZTVlMWUyNSwgMHg1Mzg2Mzk5MiwgMHgyYjAxOTlmYywgMHgyYzg1YjhhYSwgMHgwZWI3MmRkYywgMHg4MWM1MmNhMixcbl0pO1xuXG4vKiogSW50ZXJuYWwgU0hBMi01MTIvMjI0IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTUxMl8yMjQgZXh0ZW5kcyBTSEEyXzY0QjxfU0hBNTEyXzIyND4ge1xuICBwcm90ZWN0ZWQgQWg6IG51bWJlciA9IFQyMjRfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFQyMjRfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQmg6IG51bWJlciA9IFQyMjRfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgQmw6IG51bWJlciA9IFQyMjRfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFQyMjRfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgQ2w6IG51bWJlciA9IFQyMjRfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRGg6IG51bWJlciA9IFQyMjRfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFQyMjRfSVZbN10gfCAwO1xuICBwcm90ZWN0ZWQgRWg6IG51bWJlciA9IFQyMjRfSVZbOF0gfCAwO1xuICBwcm90ZWN0ZWQgRWw6IG51bWJlciA9IFQyMjRfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFQyMjRfSVZbMTBdIHwgMDtcbiAgcHJvdGVjdGVkIEZsOiBudW1iZXIgPSBUMjI0X0lWWzExXSB8IDA7XG4gIHByb3RlY3RlZCBHaDogbnVtYmVyID0gVDIyNF9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFQyMjRfSVZbMTNdIHwgMDtcbiAgcHJvdGVjdGVkIEhoOiBudW1iZXIgPSBUMjI0X0lWWzE0XSB8IDA7XG4gIHByb3RlY3RlZCBIbDogbnVtYmVyID0gVDIyNF9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDI4KTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi01MTIvMjU2IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTUxMl8yNTYgZXh0ZW5kcyBTSEEyXzY0QjxfU0hBNTEyXzI1Nj4ge1xuICBwcm90ZWN0ZWQgQWg6IG51bWJlciA9IFQyNTZfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFQyNTZfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQmg6IG51bWJlciA9IFQyNTZfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgQmw6IG51bWJlciA9IFQyNTZfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFQyNTZfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgQ2w6IG51bWJlciA9IFQyNTZfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRGg6IG51bWJlciA9IFQyNTZfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFQyNTZfSVZbN10gfCAwO1xuICBwcm90ZWN0ZWQgRWg6IG51bWJlciA9IFQyNTZfSVZbOF0gfCAwO1xuICBwcm90ZWN0ZWQgRWw6IG51bWJlciA9IFQyNTZfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFQyNTZfSVZbMTBdIHwgMDtcbiAgcHJvdGVjdGVkIEZsOiBudW1iZXIgPSBUMjU2X0lWWzExXSB8IDA7XG4gIHByb3RlY3RlZCBHaDogbnVtYmVyID0gVDI1Nl9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFQyNTZfSVZbMTNdIHwgMDtcbiAgcHJvdGVjdGVkIEhoOiBudW1iZXIgPSBUMjU2X0lWWzE0XSB8IDA7XG4gIHByb3RlY3RlZCBIbDogbnVtYmVyID0gVDI1Nl9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDMyKTtcbiAgfVxufVxuXG4vKipcbiAqIFNIQTItMjU2IGhhc2ggZnVuY3Rpb24gZnJvbSBSRkMgNDYzNC4gSW4gSlMgaXQncyB0aGUgZmFzdGVzdDogZXZlbiBmYXN0ZXIgdGhhbiBCbGFrZTMuIFNvbWUgaW5mbzpcbiAqXG4gKiAtIFRyeWluZyAyXjEyOCBoYXNoZXMgd291bGQgZ2V0IDUwJSBjaGFuY2Ugb2YgY29sbGlzaW9uLCB1c2luZyBiaXJ0aGRheSBhdHRhY2suXG4gKiAtIEJUQyBuZXR3b3JrIGlzIGRvaW5nIDJeNzAgaGFzaGVzL3NlYyAoMl45NSBoYXNoZXMveWVhcikgYXMgcGVyIDIwMjUuXG4gKiAtIEVhY2ggc2hhMjU2IGhhc2ggaXMgZXhlY3V0aW5nIDJeMTggYml0IG9wZXJhdGlvbnMuXG4gKiAtIEdvb2QgMjAyNCBBU0lDcyBjYW4gZG8gMjAwVGgvc2VjIHdpdGggMzUwMCB3YXR0cyBvZiBwb3dlciwgY29ycmVzcG9uZGluZyB0byAyXjM2IGhhc2hlcy9qb3VsZS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNoYTI1NjogQ0hhc2g8X1NIQTI1Nj4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTI1NigpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDAxKVxuKTtcbi8qKiBTSEEyLTIyNCBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQgKi9cbmV4cG9ydCBjb25zdCBzaGEyMjQ6IENIYXNoPF9TSEEyMjQ+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEEyMjQoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwNClcbik7XG5cbi8qKiBTSEEyLTUxMiBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuICovXG5leHBvcnQgY29uc3Qgc2hhNTEyOiBDSGFzaDxfU0hBNTEyPiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBNTEyKCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDMpXG4pO1xuLyoqIFNIQTItMzg0IGhhc2ggZnVuY3Rpb24gZnJvbSBSRkMgNDYzNC4gKi9cbmV4cG9ydCBjb25zdCBzaGEzODQ6IENIYXNoPF9TSEEzODQ+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEEzODQoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwMilcbik7XG5cbi8qKlxuICogU0hBMi01MTIvMjU2IFwidHJ1bmNhdGVkXCIgaGFzaCBmdW5jdGlvbiwgd2l0aCBpbXByb3ZlZCByZXNpc3RhbmNlIHRvIGxlbmd0aCBleHRlbnNpb24gYXR0YWNrcy5cbiAqIFNlZSB0aGUgcGFwZXIgb24gW3RydW5jYXRlZCBTSEE1MTJdKGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTAvNTQ4LnBkZikuXG4gKi9cbmV4cG9ydCBjb25zdCBzaGE1MTJfMjU2OiBDSGFzaDxfU0hBNTEyXzI1Nj4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTUxMl8yNTYoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwNilcbik7XG4vKipcbiAqIFNIQTItNTEyLzIyNCBcInRydW5jYXRlZFwiIGhhc2ggZnVuY3Rpb24sIHdpdGggaW1wcm92ZWQgcmVzaXN0YW5jZSB0byBsZW5ndGggZXh0ZW5zaW9uIGF0dGFja3MuXG4gKiBTZWUgdGhlIHBhcGVyIG9uIFt0cnVuY2F0ZWQgU0hBNTEyXShodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEwLzU0OC5wZGYpLlxuICovXG5leHBvcnQgY29uc3Qgc2hhNTEyXzIyNDogQ0hhc2g8X1NIQTUxMl8yMjQ+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEE1MTJfMjI0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDUpXG4pO1xuIiwgIi8qKlxuICogSW50ZXJuYWwgTWVya2xlLURhbWdhcmQgaGFzaCB1dGlscy5cbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgYWJ5dGVzLCBhZXhpc3RzLCBhb3V0cHV0LCBjbGVhbiwgY3JlYXRlVmlldywgdHlwZSBIYXNoIH0gZnJvbSAnLi91dGlscy50cyc7XG5cbi8qKiBDaG9pY2U6IGEgPyBiIDogYyAqL1xuZXhwb3J0IGZ1bmN0aW9uIENoaShhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChhICYgYikgXiAofmEgJiBjKTtcbn1cblxuLyoqIE1ham9yaXR5IGZ1bmN0aW9uLCB0cnVlIGlmIGFueSB0d28gaW5wdXRzIGlzIHRydWUuICovXG5leHBvcnQgZnVuY3Rpb24gTWFqKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKGEgJiBiKSBeIChhICYgYykgXiAoYiAmIGMpO1xufVxuXG4vKipcbiAqIE1lcmtsZS1EYW1nYXJkIGhhc2ggY29uc3RydWN0aW9uIGJhc2UgY2xhc3MuXG4gKiBDb3VsZCBiZSB1c2VkIHRvIGNyZWF0ZSBNRDUsIFJJUEVNRCwgU0hBMSwgU0hBMi5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhhc2hNRDxUIGV4dGVuZHMgSGFzaE1EPFQ+PiBpbXBsZW1lbnRzIEhhc2g8VD4ge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcHJvY2VzcyhidWY6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBnZXQoKTogbnVtYmVyW107XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBzZXQoLi4uYXJnczogbnVtYmVyW10pOiB2b2lkO1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCByb3VuZENsZWFuKCk6IHZvaWQ7XG5cbiAgcmVhZG9ubHkgYmxvY2tMZW46IG51bWJlcjtcbiAgcmVhZG9ubHkgb3V0cHV0TGVuOiBudW1iZXI7XG4gIHJlYWRvbmx5IHBhZE9mZnNldDogbnVtYmVyO1xuICByZWFkb25seSBpc0xFOiBib29sZWFuO1xuXG4gIC8vIEZvciBwYXJ0aWFsIHVwZGF0ZXMgbGVzcyB0aGFuIGJsb2NrIHNpemVcbiAgcHJvdGVjdGVkIGJ1ZmZlcjogVWludDhBcnJheTtcbiAgcHJvdGVjdGVkIHZpZXc6IERhdGFWaWV3O1xuICBwcm90ZWN0ZWQgZmluaXNoZWQgPSBmYWxzZTtcbiAgcHJvdGVjdGVkIGxlbmd0aCA9IDA7XG4gIHByb3RlY3RlZCBwb3MgPSAwO1xuICBwcm90ZWN0ZWQgZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoYmxvY2tMZW46IG51bWJlciwgb3V0cHV0TGVuOiBudW1iZXIsIHBhZE9mZnNldDogbnVtYmVyLCBpc0xFOiBib29sZWFuKSB7XG4gICAgdGhpcy5ibG9ja0xlbiA9IGJsb2NrTGVuO1xuICAgIHRoaXMub3V0cHV0TGVuID0gb3V0cHV0TGVuO1xuICAgIHRoaXMucGFkT2Zmc2V0ID0gcGFkT2Zmc2V0O1xuICAgIHRoaXMuaXNMRSA9IGlzTEU7XG4gICAgdGhpcy5idWZmZXIgPSBuZXcgVWludDhBcnJheShibG9ja0xlbik7XG4gICAgdGhpcy52aWV3ID0gY3JlYXRlVmlldyh0aGlzLmJ1ZmZlcik7XG4gIH1cbiAgdXBkYXRlKGRhdGE6IFVpbnQ4QXJyYXkpOiB0aGlzIHtcbiAgICBhZXhpc3RzKHRoaXMpO1xuICAgIGFieXRlcyhkYXRhKTtcbiAgICBjb25zdCB7IHZpZXcsIGJ1ZmZlciwgYmxvY2tMZW4gfSA9IHRoaXM7XG4gICAgY29uc3QgbGVuID0gZGF0YS5sZW5ndGg7XG4gICAgZm9yIChsZXQgcG9zID0gMDsgcG9zIDwgbGVuOyApIHtcbiAgICAgIGNvbnN0IHRha2UgPSBNYXRoLm1pbihibG9ja0xlbiAtIHRoaXMucG9zLCBsZW4gLSBwb3MpO1xuICAgICAgLy8gRmFzdCBwYXRoOiB3ZSBoYXZlIGF0IGxlYXN0IG9uZSBibG9jayBpbiBpbnB1dCwgY2FzdCBpdCB0byB2aWV3IGFuZCBwcm9jZXNzXG4gICAgICBpZiAodGFrZSA9PT0gYmxvY2tMZW4pIHtcbiAgICAgICAgY29uc3QgZGF0YVZpZXcgPSBjcmVhdGVWaWV3KGRhdGEpO1xuICAgICAgICBmb3IgKDsgYmxvY2tMZW4gPD0gbGVuIC0gcG9zOyBwb3MgKz0gYmxvY2tMZW4pIHRoaXMucHJvY2VzcyhkYXRhVmlldywgcG9zKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBidWZmZXIuc2V0KGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyB0YWtlKSwgdGhpcy5wb3MpO1xuICAgICAgdGhpcy5wb3MgKz0gdGFrZTtcbiAgICAgIHBvcyArPSB0YWtlO1xuICAgICAgaWYgKHRoaXMucG9zID09PSBibG9ja0xlbikge1xuICAgICAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgICAgIHRoaXMucG9zID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5sZW5ndGggKz0gZGF0YS5sZW5ndGg7XG4gICAgdGhpcy5yb3VuZENsZWFuKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgZGlnZXN0SW50byhvdXQ6IFVpbnQ4QXJyYXkpOiB2b2lkIHtcbiAgICBhZXhpc3RzKHRoaXMpO1xuICAgIGFvdXRwdXQob3V0LCB0aGlzKTtcbiAgICB0aGlzLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICAvLyBQYWRkaW5nXG4gICAgLy8gV2UgY2FuIGF2b2lkIGFsbG9jYXRpb24gb2YgYnVmZmVyIGZvciBwYWRkaW5nIGNvbXBsZXRlbHkgaWYgaXRcbiAgICAvLyB3YXMgcHJldmlvdXNseSBub3QgYWxsb2NhdGVkIGhlcmUuIEJ1dCBpdCB3b24ndCBjaGFuZ2UgcGVyZm9ybWFuY2UuXG4gICAgY29uc3QgeyBidWZmZXIsIHZpZXcsIGJsb2NrTGVuLCBpc0xFIH0gPSB0aGlzO1xuICAgIGxldCB7IHBvcyB9ID0gdGhpcztcbiAgICAvLyBhcHBlbmQgdGhlIGJpdCAnMScgdG8gdGhlIG1lc3NhZ2VcbiAgICBidWZmZXJbcG9zKytdID0gMGIxMDAwMDAwMDtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlci5zdWJhcnJheShwb3MpKTtcbiAgICAvLyB3ZSBoYXZlIGxlc3MgdGhhbiBwYWRPZmZzZXQgbGVmdCBpbiBidWZmZXIsIHNvIHdlIGNhbm5vdCBwdXQgbGVuZ3RoIGluXG4gICAgLy8gY3VycmVudCBibG9jaywgbmVlZCBwcm9jZXNzIGl0IGFuZCBwYWQgYWdhaW5cbiAgICBpZiAodGhpcy5wYWRPZmZzZXQgPiBibG9ja0xlbiAtIHBvcykge1xuICAgICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgLy8gUGFkIHVudGlsIGZ1bGwgYmxvY2sgYnl0ZSB3aXRoIHplcm9zXG4gICAgZm9yIChsZXQgaSA9IHBvczsgaSA8IGJsb2NrTGVuOyBpKyspIGJ1ZmZlcltpXSA9IDA7XG4gICAgLy8gTm90ZTogc2hhNTEyIHJlcXVpcmVzIGxlbmd0aCB0byBiZSAxMjhiaXQgaW50ZWdlciwgYnV0IGxlbmd0aCBpbiBKUyB3aWxsIG92ZXJmbG93IGJlZm9yZSB0aGF0XG4gICAgLy8gWW91IG5lZWQgdG8gd3JpdGUgYXJvdW5kIDIgZXhhYnl0ZXMgKHU2NF9tYXggLyA4IC8gKDEwMjQqKjYpKSBmb3IgdGhpcyB0byBoYXBwZW4uXG4gICAgLy8gU28gd2UganVzdCB3cml0ZSBsb3dlc3QgNjQgYml0cyBvZiB0aGF0IHZhbHVlLlxuICAgIHZpZXcuc2V0QmlnVWludDY0KGJsb2NrTGVuIC0gOCwgQmlnSW50KHRoaXMubGVuZ3RoICogOCksIGlzTEUpO1xuICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICBjb25zdCBvdmlldyA9IGNyZWF0ZVZpZXcob3V0KTtcbiAgICBjb25zdCBsZW4gPSB0aGlzLm91dHB1dExlbjtcbiAgICAvLyBOT1RFOiB3ZSBkbyBkaXZpc2lvbiBieSA0IGxhdGVyLCB3aGljaCBtdXN0IGJlIGZ1c2VkIGluIHNpbmdsZSBvcCB3aXRoIG1vZHVsbyBieSBKSVRcbiAgICBpZiAobGVuICUgNCkgdGhyb3cgbmV3IEVycm9yKCdfc2hhMjogb3V0cHV0TGVuIG11c3QgYmUgYWxpZ25lZCB0byAzMmJpdCcpO1xuICAgIGNvbnN0IG91dExlbiA9IGxlbiAvIDQ7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmdldCgpO1xuICAgIGlmIChvdXRMZW4gPiBzdGF0ZS5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignX3NoYTI6IG91dHB1dExlbiBiaWdnZXIgdGhhbiBzdGF0ZScpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0TGVuOyBpKyspIG92aWV3LnNldFVpbnQzMig0ICogaSwgc3RhdGVbaV0sIGlzTEUpO1xuICB9XG4gIGRpZ2VzdCgpOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IGJ1ZmZlciwgb3V0cHV0TGVuIH0gPSB0aGlzO1xuICAgIHRoaXMuZGlnZXN0SW50byhidWZmZXIpO1xuICAgIGNvbnN0IHJlcyA9IGJ1ZmZlci5zbGljZSgwLCBvdXRwdXRMZW4pO1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgX2Nsb25lSW50byh0bz86IFQpOiBUIHtcbiAgICB0byB8fD0gbmV3ICh0aGlzLmNvbnN0cnVjdG9yIGFzIGFueSkoKSBhcyBUO1xuICAgIHRvLnNldCguLi50aGlzLmdldCgpKTtcbiAgICBjb25zdCB7IGJsb2NrTGVuLCBidWZmZXIsIGxlbmd0aCwgZmluaXNoZWQsIGRlc3Ryb3llZCwgcG9zIH0gPSB0aGlzO1xuICAgIHRvLmRlc3Ryb3llZCA9IGRlc3Ryb3llZDtcbiAgICB0by5maW5pc2hlZCA9IGZpbmlzaGVkO1xuICAgIHRvLmxlbmd0aCA9IGxlbmd0aDtcbiAgICB0by5wb3MgPSBwb3M7XG4gICAgaWYgKGxlbmd0aCAlIGJsb2NrTGVuKSB0by5idWZmZXIuc2V0KGJ1ZmZlcik7XG4gICAgcmV0dXJuIHRvIGFzIHVua25vd24gYXMgYW55O1xuICB9XG4gIGNsb25lKCk6IFQge1xuICAgIHJldHVybiB0aGlzLl9jbG9uZUludG8oKTtcbiAgfVxufVxuXG4vKipcbiAqIEluaXRpYWwgU0hBLTIgc3RhdGU6IGZyYWN0aW9uYWwgcGFydHMgb2Ygc3F1YXJlIHJvb3RzIG9mIGZpcnN0IDE2IHByaW1lcyAyLi41My5cbiAqIENoZWNrIG91dCBgdGVzdC9taXNjL3NoYTItZ2VuLWl2LmpzYCBmb3IgcmVjb21wdXRhdGlvbiBndWlkZS5cbiAqL1xuXG4vKiogSW5pdGlhbCBTSEEyNTYgc3RhdGUuIEJpdHMgMC4uMzIgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIuLjE5ICovXG5leHBvcnQgY29uc3QgU0hBMjU2X0lWOiBVaW50MzJBcnJheSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHg2YTA5ZTY2NywgMHhiYjY3YWU4NSwgMHgzYzZlZjM3MiwgMHhhNTRmZjUzYSwgMHg1MTBlNTI3ZiwgMHg5YjA1Njg4YywgMHgxZjgzZDlhYiwgMHg1YmUwY2QxOSxcbl0pO1xuXG4vKiogSW5pdGlhbCBTSEEyMjQgc3RhdGUuIEJpdHMgMzIuLjY0IG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyMy4uNTMgKi9cbmV4cG9ydCBjb25zdCBTSEEyMjRfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweGMxMDU5ZWQ4LCAweDM2N2NkNTA3LCAweDMwNzBkZDE3LCAweGY3MGU1OTM5LCAweGZmYzAwYjMxLCAweDY4NTgxNTExLCAweDY0Zjk4ZmE3LCAweGJlZmE0ZmE0LFxuXSk7XG5cbi8qKiBJbml0aWFsIFNIQTM4NCBzdGF0ZS4gQml0cyAwLi42NCBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMjMuLjUzICovXG5leHBvcnQgY29uc3QgU0hBMzg0X0lWOiBVaW50MzJBcnJheSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHhjYmJiOWQ1ZCwgMHhjMTA1OWVkOCwgMHg2MjlhMjkyYSwgMHgzNjdjZDUwNywgMHg5MTU5MDE1YSwgMHgzMDcwZGQxNywgMHgxNTJmZWNkOCwgMHhmNzBlNTkzOSxcbiAgMHg2NzMzMjY2NywgMHhmZmMwMGIzMSwgMHg4ZWI0NGE4NywgMHg2ODU4MTUxMSwgMHhkYjBjMmUwZCwgMHg2NGY5OGZhNywgMHg0N2I1NDgxZCwgMHhiZWZhNGZhNCxcbl0pO1xuXG4vKiogSW5pdGlhbCBTSEE1MTIgc3RhdGUuIEJpdHMgMC4uNjQgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIuLjE5ICovXG5leHBvcnQgY29uc3QgU0hBNTEyX0lWOiBVaW50MzJBcnJheSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHg2YTA5ZTY2NywgMHhmM2JjYzkwOCwgMHhiYjY3YWU4NSwgMHg4NGNhYTczYiwgMHgzYzZlZjM3MiwgMHhmZTk0ZjgyYiwgMHhhNTRmZjUzYSwgMHg1ZjFkMzZmMSxcbiAgMHg1MTBlNTI3ZiwgMHhhZGU2ODJkMSwgMHg5YjA1Njg4YywgMHgyYjNlNmMxZiwgMHgxZjgzZDlhYiwgMHhmYjQxYmQ2YiwgMHg1YmUwY2QxOSwgMHgxMzdlMjE3OSxcbl0pO1xuIiwgIi8qKlxuICogQG1vZHVsZSBub3N0ci1jcnlwdG8tdXRpbHNcbiAqIEBkZXNjcmlwdGlvbiBDb3JlIGNyeXB0b2dyYXBoaWMgdXRpbGl0aWVzIGZvciBOb3N0ciBwcm90b2NvbFxuICovXG5cbi8vIENvcmUgdHlwZXNcbmV4cG9ydCB0eXBlIHtcbiAgTm9zdHJFdmVudCxcbiAgVW5zaWduZWROb3N0ckV2ZW50LFxuICBTaWduZWROb3N0ckV2ZW50LFxuICBOb3N0ckZpbHRlcixcbiAgTm9zdHJTdWJzY3JpcHRpb24sXG4gIFB1YmxpY0tleSxcbiAgS2V5UGFpcixcbiAgTm9zdHJNZXNzYWdlVHVwbGUsXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vLyBFdmVudCBraW5kcywgbWVzc2FnZSB0eXBlcywgYW5kIE5JUC00NiB0eXBlc1xuZXhwb3J0IHsgTm9zdHJFdmVudEtpbmQsIE5vc3RyTWVzc2FnZVR5cGUsIE5pcDQ2TWV0aG9kIH0gZnJvbSAnLi90eXBlcyc7XG5leHBvcnQgdHlwZSB7XG4gIE5pcDQ2UmVxdWVzdCxcbiAgTmlwNDZSZXNwb25zZSxcbiAgTmlwNDZTZXNzaW9uLFxuICBOaXA0NlNlc3Npb25JbmZvLFxuICBCdW5rZXJVUkksXG4gIEJ1bmtlclZhbGlkYXRpb25SZXN1bHQsXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vLyBDb3JlIGNyeXB0byBmdW5jdGlvbnNcbmV4cG9ydCB7XG4gIGdlbmVyYXRlS2V5UGFpcixcbiAgZ2V0UHVibGljS2V5LFxuICBnZXRQdWJsaWNLZXlTeW5jLFxuICB2YWxpZGF0ZUtleVBhaXIsXG4gIGNyZWF0ZUV2ZW50LFxuICBzaWduRXZlbnQsXG4gIGZpbmFsaXplRXZlbnQsXG4gIHZlcmlmeVNpZ25hdHVyZSxcbiAgZW5jcnlwdCxcbiAgZGVjcnlwdCxcbn0gZnJvbSAnLi9jcnlwdG8nO1xuXG4vLyBWYWxpZGF0aW9uIGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgdmFsaWRhdGVFdmVudCxcbiAgdmFsaWRhdGVFdmVudElkLFxuICB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlLFxuICB2YWxpZGF0ZVNpZ25lZEV2ZW50LFxuICB2YWxpZGF0ZUV2ZW50QmFzZSxcbiAgdmFsaWRhdGVGaWx0ZXIsXG4gIHZhbGlkYXRlU3Vic2NyaXB0aW9uLFxuICB2YWxpZGF0ZVJlc3BvbnNlLFxufSBmcm9tICcuL3ZhbGlkYXRpb24nO1xuXG4vLyBFdmVudCBmdW5jdGlvbnNcbmV4cG9ydCB7XG4gIGNhbGN1bGF0ZUV2ZW50SWQsXG59IGZyb20gJy4vZXZlbnQnO1xuXG4vLyBOSVAtMDQgZW5jcnlwdGlvblxuZXhwb3J0IHtcbiAgY29tcHV0ZVNoYXJlZFNlY3JldCxcbiAgZW5jcnlwdE1lc3NhZ2UsXG4gIGRlY3J5cHRNZXNzYWdlLFxufSBmcm9tICcuL25pcHMvbmlwLTA0JztcblxuLy8gUmUtZXhwb3J0IE5JUHNcbmV4cG9ydCAqIGFzIG5pcDAxIGZyb20gJy4vbmlwcy9uaXAtMDEnO1xuZXhwb3J0ICogYXMgbmlwMDQgZnJvbSAnLi9uaXBzL25pcC0wNCc7XG5leHBvcnQgKiBhcyBuaXAxOSBmcm9tICcuL25pcHMvbmlwLTE5JztcbmV4cG9ydCAqIGFzIG5pcDI2IGZyb20gJy4vbmlwcy9uaXAtMjYnO1xuZXhwb3J0ICogYXMgbmlwNDQgZnJvbSAnLi9uaXBzL25pcC00NCc7XG5leHBvcnQgKiBhcyBuaXA0NiBmcm9tICcuL25pcHMvbmlwLTQ2JztcbmV4cG9ydCAqIGFzIG5pcDQ5IGZyb20gJy4vbmlwcy9uaXAtNDknO1xuXG4vLyBVdGlsc1xuZXhwb3J0IHtcbiAgaGV4VG9CeXRlcyxcbiAgYnl0ZXNUb0hleCxcbiAgdXRmOFRvQnl0ZXMsXG4gIGJ5dGVzVG9VdGY4LFxufSBmcm9tICcuL3V0aWxzL2VuY29kaW5nJztcbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXNcbiAqIEBkZXNjcmlwdGlvbiBUeXBlIGRlZmluaXRpb25zIGZvciBOb3N0clxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGljS2V5RGV0YWlscyB7XG4gIGhleDogc3RyaW5nO1xuICBieXRlczogVWludDhBcnJheTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBLZXlQYWlyIHtcbiAgcHJpdmF0ZUtleTogc3RyaW5nO1xuICBwdWJsaWNLZXk6IFB1YmxpY0tleURldGFpbHM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJFdmVudCB7XG4gIGtpbmQ6IG51bWJlcjtcbiAgY3JlYXRlZF9hdDogbnVtYmVyO1xuICB0YWdzOiBzdHJpbmdbXVtdO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHB1YmtleTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25lZE5vc3RyRXZlbnQgZXh0ZW5kcyBOb3N0ckV2ZW50IHtcbiAgaWQ6IHN0cmluZztcbiAgc2lnOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGljS2V5IHtcbiAgaGV4OiBzdHJpbmc7XG4gIGJ5dGVzPzogVWludDhBcnJheTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgaXNWYWxpZDogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBlbnVtIE5vc3RyRXZlbnRLaW5kIHtcbiAgU0VUX01FVEFEQVRBID0gMCxcbiAgVEVYVF9OT1RFID0gMSxcbiAgUkVDT01NRU5EX1NFUlZFUiA9IDIsXG4gIENPTlRBQ1RfTElTVCA9IDMsXG4gIEVOQ1JZUFRFRF9ESVJFQ1RfTUVTU0FHRSA9IDQsXG4gIERFTEVURSA9IDUsXG4gIFJFUE9TVCA9IDYsXG4gIFJFQUNUSU9OID0gNyxcbiAgQkFER0VfQVdBUkQgPSA4LFxuICBDSEFOTkVMX0NSRUFURSA9IDQwLFxuICBDSEFOTkVMX01FVEFEQVRBID0gNDEsXG4gIENIQU5ORUxfTUVTU0FHRSA9IDQyLFxuICBDSEFOTkVMX0hJREVfTUVTU0FHRSA9IDQzLFxuICBDSEFOTkVMX01VVEVfVVNFUiA9IDQ0LFxuICBDSEFOTkVMX1JFU0VSVkUgPSA0NSxcbiAgUkVQT1JUSU5HID0gMTk4NCxcbiAgWkFQX1JFUVVFU1QgPSA5NzM0LFxuICBaQVAgPSA5NzM1LFxuICBNVVRFX0xJU1QgPSAxMDAwMCxcbiAgUElOX0xJU1QgPSAxMDAwMSxcbiAgUkVMQVlfTElTVF9NRVRBREFUQSA9IDEwMDAyLFxuICBDTElFTlRfQVVUSCA9IDIyMjQyLFxuICBBVVRIX1JFU1BPTlNFID0gMjIyNDMsXG4gIE5PU1RSX0NPTk5FQ1QgPSAyNDEzMyxcbiAgQ0FURUdPUklaRURfUEVPUExFID0gMzAwMDAsXG4gIENBVEVHT1JJWkVEX0JPT0tNQVJLUyA9IDMwMDAxLFxuICBQUk9GSUxFX0JBREdFUyA9IDMwMDA4LFxuICBCQURHRV9ERUZJTklUSU9OID0gMzAwMDksXG4gIExPTkdfRk9STSA9IDMwMDIzLFxuICBBUFBMSUNBVElPTl9TUEVDSUZJQyA9IDMwMDc4XG59XG5cbi8qKlxuICogUmUtZXhwb3J0IGFsbCB0eXBlcyBmcm9tIGJhc2UgbW9kdWxlXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqL1xuZXhwb3J0ICogZnJvbSAnLi9iYXNlJztcblxuLyoqIFJlLWV4cG9ydCBwcm90b2NvbCB0eXBlcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9wcm90b2NvbCc7XG5cbi8qKiBSZS1leHBvcnQgbWVzc2FnZSB0eXBlcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9tZXNzYWdlcyc7XG5cbi8qKiBSZS1leHBvcnQgdHlwZSBndWFyZHMgKi9cbmV4cG9ydCAqIGZyb20gJy4vZ3VhcmRzJztcblxuLy8gUmUtZXhwb3J0IE5JUC0xOSB0eXBlc1xuZXhwb3J0IHR5cGUge1xuICBOaXAxOURhdGFUeXBlXG59IGZyb20gJy4uL25pcHMvbmlwLTE5JztcblxuLyoqIFJlLWV4cG9ydCBOSVAtNDYgdHlwZXMgKi9cbmV4cG9ydCAqIGZyb20gJy4vbmlwNDYnO1xuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlcy9iYXNlXG4gKiBAZGVzY3JpcHRpb24gQ29yZSB0eXBlIGRlZmluaXRpb25zIGZvciBOb3N0ciBwcm90b2NvbFxuICovXG5cbi8vIEtleSBUeXBlc1xuZXhwb3J0IHR5cGUgUHVibGljS2V5SGV4ID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgUHJpdmF0ZUtleUhleCA9IHN0cmluZztcblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXlEZXRhaWxzIHtcbiAgLyoqIFB1YmxpYyBrZXkgaW4gaGV4IGZvcm1hdCAqL1xuICBoZXg6IHN0cmluZztcbiAgLyoqIE5JUC0wNSBpZGVudGlmaWVyICovXG4gIG5pcDA1OiBzdHJpbmc7XG4gIC8qKiBQdWJsaWMga2V5IGluIGJ5dGVzIGZvcm1hdCAqL1xuICBieXRlczogVWludDhBcnJheTtcbn1cblxuZXhwb3J0IHR5cGUgUHVibGljS2V5ID0gUHVibGljS2V5SGV4IHwgUHVibGljS2V5RGV0YWlscztcblxuZXhwb3J0IGludGVyZmFjZSBLZXlQYWlyIHtcbiAgLyoqIFByaXZhdGUga2V5IGluIGhleCBmb3JtYXQgKi9cbiAgcHJpdmF0ZUtleTogUHJpdmF0ZUtleUhleDtcbiAgLyoqIFB1YmxpYyBrZXkgZGV0YWlscyAqL1xuICBwdWJsaWNLZXk6IFB1YmxpY0tleURldGFpbHM7XG59XG5cbi8vIEV2ZW50IFR5cGVzXG5leHBvcnQgZW51bSBOb3N0ckV2ZW50S2luZCB7XG4gIC8vIE5JUC0wMTogQ29yZSBQcm90b2NvbFxuICBTRVRfTUVUQURBVEEgPSAwLFxuICBURVhUX05PVEUgPSAxLFxuICBSRUNPTU1FTkRfU0VSVkVSID0gMixcbiAgQ09OVEFDVFMgPSAzLFxuICBFTkNSWVBURURfRElSRUNUX01FU1NBR0UgPSA0LFxuICBFVkVOVF9ERUxFVElPTiA9IDUsXG4gIFJFUE9TVCA9IDYsXG4gIFJFQUNUSU9OID0gNyxcblxuICAvLyBOSVAtMjg6IFB1YmxpYyBDaGF0XG4gIENIQU5ORUxfQ1JFQVRJT04gPSA0MCxcbiAgQ0hBTk5FTF9NRVRBREFUQSA9IDQxLFxuICBDSEFOTkVMX01FU1NBR0UgPSA0MixcbiAgQ0hBTk5FTF9ISURFX01FU1NBR0UgPSA0MyxcbiAgQ0hBTk5FTF9NVVRFX1VTRVIgPSA0NCxcblxuICAvLyBOSVAtNDI6IEF1dGhlbnRpY2F0aW9uXG4gIEFVVEggPSAyMjI0MixcbiAgQVVUSF9SRVNQT05TRSA9IDIyMjQzXG59XG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIE5vc3RyIGV2ZW50cyAqL1xuZXhwb3J0IGludGVyZmFjZSBCYXNlTm9zdHJFdmVudCB7XG4gIC8qKiBFdmVudCBraW5kIGFzIGRlZmluZWQgaW4gTklQcyAqL1xuICBraW5kOiBudW1iZXI7XG4gIC8qKiBDb250ZW50IG9mIHRoZSBldmVudCAqL1xuICBjb250ZW50OiBzdHJpbmc7XG4gIC8qKiBBcnJheSBvZiB0YWdzICovXG4gIHRhZ3M6IHN0cmluZ1tdW107XG4gIC8qKiBVbml4IHRpbWVzdGFtcCBpbiBzZWNvbmRzICovXG4gIGNyZWF0ZWRfYXQ6IG51bWJlcjtcbn1cblxuLyoqIEludGVyZmFjZSBmb3IgZXZlbnRzIHRoYXQgaGF2ZW4ndCBiZWVuIHNpZ25lZCB5ZXQgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVW5zaWduZWROb3N0ckV2ZW50IGV4dGVuZHMgQmFzZU5vc3RyRXZlbnQge1xuICAvKiogT3B0aW9uYWwgcHVibGljIGtleSAqL1xuICBwdWJrZXk/OiBzdHJpbmc7XG59XG5cbi8qKiBJbnRlcmZhY2UgZm9yIHNpZ25lZCBldmVudHMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVkTm9zdHJFdmVudCBleHRlbmRzIEJhc2VOb3N0ckV2ZW50IHtcbiAgLyoqIFB1YmxpYyBrZXkgb2YgdGhlIGV2ZW50IGNyZWF0b3IgKi9cbiAgcHVia2V5OiBzdHJpbmc7XG4gIC8qKiBFdmVudCBJRCAoc2hhMjU2IG9mIHRoZSBzZXJpYWxpemVkIGV2ZW50KSAqL1xuICBpZDogc3RyaW5nO1xuICAvKiogU2Nobm9yciBzaWduYXR1cmUgb2YgdGhlIGV2ZW50IElEICovXG4gIHNpZzogc3RyaW5nO1xufVxuXG4vKiogQWxpYXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgKi9cbmV4cG9ydCB0eXBlIE5vc3RyRXZlbnQgPSBTaWduZWROb3N0ckV2ZW50O1xuXG4vKiogVHlwZSBmb3IgY3JlYXRpbmcgbmV3IGV2ZW50cyAqL1xuZXhwb3J0IHR5cGUgVW5zaWduZWRFdmVudCA9IE9taXQ8Tm9zdHJFdmVudCwgJ2lkJyB8ICdzaWcnPjtcblxuLy8gRmlsdGVyIFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyRmlsdGVyIHtcbiAgaWRzPzogc3RyaW5nW107XG4gIGF1dGhvcnM/OiBzdHJpbmdbXTtcbiAga2luZHM/OiBOb3N0ckV2ZW50S2luZFtdO1xuICBzaW5jZT86IG51bWJlcjtcbiAgdW50aWw/OiBudW1iZXI7XG4gIGxpbWl0PzogbnVtYmVyO1xuICAnI2UnPzogc3RyaW5nW107XG4gICcjcCc/OiBzdHJpbmdbXTtcbiAgc2VhcmNoPzogc3RyaW5nO1xuICAvKiogU3VwcG9ydCBmb3IgYXJiaXRyYXJ5IHRhZ3MgKE5JUC0xMikgKi9cbiAgW2tleTogYCMke3N0cmluZ31gXTogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJTdWJzY3JpcHRpb24ge1xuICBpZDogc3RyaW5nO1xuICBmaWx0ZXJzOiBOb3N0ckZpbHRlcltdO1xufVxuXG4vLyBNZXNzYWdlIFR5cGVzXG5leHBvcnQgZW51bSBOb3N0ck1lc3NhZ2VUeXBlIHtcbiAgRVZFTlQgPSAnRVZFTlQnLFxuICBOT1RJQ0UgPSAnTk9USUNFJyxcbiAgT0sgPSAnT0snLFxuICBFT1NFID0gJ0VPU0UnLFxuICBSRVEgPSAnUkVRJyxcbiAgQ0xPU0UgPSAnQ0xPU0UnLFxuICBBVVRIID0gJ0FVVEgnXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJNZXNzYWdlIHtcbiAgdHlwZTogTm9zdHJNZXNzYWdlVHlwZTtcbiAgZXZlbnQ/OiBTaWduZWROb3N0ckV2ZW50O1xuICBzdWJzY3JpcHRpb25JZD86IHN0cmluZztcbiAgZmlsdGVycz86IE5vc3RyRmlsdGVyW107XG4gIGV2ZW50SWQ/OiBzdHJpbmc7XG4gIGFjY2VwdGVkPzogYm9vbGVhbjtcbiAgbWVzc2FnZT86IHN0cmluZztcbiAgY291bnQ/OiBudW1iZXI7XG4gIHBheWxvYWQ/OiBzdHJpbmcgfCAoc3RyaW5nIHwgYm9vbGVhbilbXTsgIFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyUmVzcG9uc2Uge1xuICB0eXBlOiBOb3N0ck1lc3NhZ2VUeXBlO1xuICBldmVudD86IFNpZ25lZE5vc3RyRXZlbnQ7XG4gIHN1YnNjcmlwdGlvbklkPzogc3RyaW5nO1xuICBmaWx0ZXJzPzogTm9zdHJGaWx0ZXJbXTtcbiAgZXZlbnRJZD86IHN0cmluZztcbiAgYWNjZXB0ZWQ/OiBib29sZWFuO1xuICBtZXNzYWdlPzogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbn1cblxuLy8gVXRpbGl0eSBUeXBlc1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgaXNWYWxpZDogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJFcnJvciB7XG4gIGNvZGU6IHN0cmluZztcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL3Byb3RvY29sXG4gKiBAZGVzY3JpcHRpb24gTm9zdHIgcHJvdG9jb2wgdHlwZXNcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IFxuICBOb3N0ckZpbHRlciwgXG4gIFB1YmxpY0tleSxcbiAgTm9zdHJNZXNzYWdlVHlwZSxcbiAgTm9zdHJTdWJzY3JpcHRpb24sXG4gIE5vc3RyUmVzcG9uc2UsXG4gIE5vc3RyRXJyb3Jcbn0gZnJvbSAnLi9iYXNlLmpzJztcblxuLy8gUmUtZXhwb3J0IHR5cGVzIGZyb20gYmFzZSB0aGF0IGFyZSB1c2VkIGluIHRoaXMgbW9kdWxlXG5leHBvcnQgdHlwZSB7IFxuICBOb3N0ckZpbHRlciwgXG4gIFB1YmxpY0tleSxcbiAgTm9zdHJNZXNzYWdlVHlwZSxcbiAgTm9zdHJTdWJzY3JpcHRpb24sXG4gIE5vc3RyUmVzcG9uc2UsXG4gIE5vc3RyRXJyb3Jcbn07XG4iLCAiZXhwb3J0IHt9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWVzc2FnZXMuanMubWFwIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlcy9ndWFyZHNcbiAqIEBkZXNjcmlwdGlvbiBUeXBlIGd1YXJkIGZ1bmN0aW9ucyBmb3IgTm9zdHIgdHlwZXNcbiAqL1xuXG5pbXBvcnQgeyBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50LCBOb3N0ckZpbHRlciwgTm9zdHJTdWJzY3JpcHRpb24sIE5vc3RyUmVzcG9uc2UsIE5vc3RyRXJyb3IgfSBmcm9tICcuL2Jhc2UnO1xuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJFdmVudChldmVudDogdW5rbm93bik6IGV2ZW50IGlzIE5vc3RyRXZlbnQge1xuICBpZiAodHlwZW9mIGV2ZW50ICE9PSAnb2JqZWN0JyB8fCBldmVudCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkRXZlbnQgPSBldmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvLyBSZXF1aXJlZCBmaWVsZHNcbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmtpbmQgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbGlkRXZlbnQua2luZCkgfHwgdmFsaWRFdmVudC5raW5kIDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsaWRFdmVudC5jb250ZW50ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsaWRFdmVudC5jcmVhdGVkX2F0ICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWxpZEV2ZW50LmNyZWF0ZWRfYXQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcHVia2V5IHN0cnVjdHVyZVxuICBpZiAodmFsaWRFdmVudC5wdWJrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2YgdmFsaWRFdmVudC5wdWJrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIXZhbGlkRXZlbnQucHVia2V5KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LnB1YmtleSA9PT0gJ29iamVjdCcgJiYgdmFsaWRFdmVudC5wdWJrZXkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IHB1YmtleSA9IHZhbGlkRXZlbnQucHVia2V5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgaWYgKHR5cGVvZiBwdWJrZXkuaGV4ICE9PSAnc3RyaW5nJyB8fCAhcHVia2V5LmhleCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVjayB0YWdzIGFycmF5XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWxpZEV2ZW50LnRhZ3MpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgdGFnIGFycmF5IGVsZW1lbnRzXG4gIGlmICghdmFsaWRFdmVudC50YWdzLmV2ZXJ5KHRhZyA9PiBBcnJheS5pc0FycmF5KHRhZykgJiYgdGFnLmV2ZXJ5KGl0ZW0gPT4gdHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBTaWduZWROb3N0ckV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NpZ25lZE5vc3RyRXZlbnQoZXZlbnQ6IHVua25vd24pOiBldmVudCBpcyBTaWduZWROb3N0ckV2ZW50IHtcbiAgaWYgKCFldmVudCB8fCB0eXBlb2YgZXZlbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3Qgc2lnbmVkRXZlbnQgPSBldmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvLyBDaGVjayByZXF1aXJlZCBmaWVsZHMgZnJvbSBOb3N0ckV2ZW50XG4gIGlmICghaXNOb3N0ckV2ZW50KGV2ZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHB1YmtleSBpcyBwcmVzZW50IGFuZCB2YWxpZFxuICBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LnB1YmtleSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIXNpZ25lZEV2ZW50LnB1YmtleSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQucHVia2V5ID09PSAnb2JqZWN0JyAmJiBzaWduZWRFdmVudC5wdWJrZXkgIT09IG51bGwpIHtcbiAgICBjb25zdCBwdWJrZXkgPSBzaWduZWRFdmVudC5wdWJrZXkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgaWYgKHR5cGVvZiBwdWJrZXkuaGV4ICE9PSAnc3RyaW5nJyB8fCAhcHVia2V5LmhleCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBpZCBmaWVsZFxuICBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LmlkICE9PSAnc3RyaW5nJyB8fCAhc2lnbmVkRXZlbnQuaWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBzaWcgZmllbGRcbiAgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5zaWcgIT09ICdzdHJpbmcnIHx8ICFzaWduZWRFdmVudC5zaWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBOb3N0ckZpbHRlclxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0ckZpbHRlcihmaWx0ZXI6IHVua25vd24pOiBmaWx0ZXIgaXMgTm9zdHJGaWx0ZXIge1xuICBpZiAodHlwZW9mIGZpbHRlciAhPT0gJ29iamVjdCcgfHwgZmlsdGVyID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRGaWx0ZXIgPSBmaWx0ZXIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHZhbGlkS2V5cyA9IFsnaWRzJywgJ2F1dGhvcnMnLCAna2luZHMnLCAnc2luY2UnLCAndW50aWwnLCAnbGltaXQnLCAnI2UnLCAnI3AnLCAnI3QnXTtcbiAgY29uc3QgZmlsdGVyS2V5cyA9IE9iamVjdC5rZXlzKHZhbGlkRmlsdGVyKTtcblxuICAvLyBDaGVjayBpZiBhbGwga2V5cyBpbiB0aGUgZmlsdGVyIGFyZSB2YWxpZFxuICBpZiAoIWZpbHRlcktleXMuZXZlcnkoa2V5ID0+IHZhbGlkS2V5cy5pbmNsdWRlcyhrZXkpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGFycmF5IGZpZWxkc1xuICBpZiAodmFsaWRGaWx0ZXIuaWRzICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyLmlkcykgfHwgIXZhbGlkRmlsdGVyLmlkcy5ldmVyeShpZCA9PiB0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyLmF1dGhvcnMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIuYXV0aG9ycykgfHwgIXZhbGlkRmlsdGVyLmF1dGhvcnMuZXZlcnkoYXV0aG9yID0+IHR5cGVvZiBhdXRob3IgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyLmtpbmRzICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyLmtpbmRzKSB8fCAhdmFsaWRGaWx0ZXIua2luZHMuZXZlcnkoa2luZCA9PiB0eXBlb2Yga2luZCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihraW5kKSAmJiBraW5kID49IDApKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXJbJyNlJ10gIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXJbJyNlJ10pIHx8ICF2YWxpZEZpbHRlclsnI2UnXS5ldmVyeShlID0+IHR5cGVvZiBlID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlclsnI3AnXSAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlclsnI3AnXSkgfHwgIXZhbGlkRmlsdGVyWycjcCddLmV2ZXJ5KHAgPT4gdHlwZW9mIHAgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyWycjdCddICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyWycjdCddKSB8fCAhdmFsaWRGaWx0ZXJbJyN0J10uZXZlcnkodCA9PiB0eXBlb2YgdCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIG51bWJlciBmaWVsZHNcbiAgaWYgKHZhbGlkRmlsdGVyLnNpbmNlICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkRmlsdGVyLnNpbmNlICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsaWRGaWx0ZXIudW50aWwgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRGaWx0ZXIudW50aWwgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWxpZEZpbHRlci5saW1pdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZEZpbHRlci5saW1pdCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBOb3N0clN1YnNjcmlwdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0clN1YnNjcmlwdGlvbihzdWI6IHVua25vd24pOiBzdWIgaXMgTm9zdHJTdWJzY3JpcHRpb24ge1xuICBpZiAodHlwZW9mIHN1YiAhPT0gJ29iamVjdCcgfHwgc3ViID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRTdWIgPSBzdWIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgaWYgKHR5cGVvZiB2YWxpZFN1Yi5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsaWRTdWIuZmlsdGVycykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIXZhbGlkU3ViLmZpbHRlcnMuZXZlcnkoZmlsdGVyID0+IGlzTm9zdHJGaWx0ZXIoZmlsdGVyKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBOb3N0clJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyUmVzcG9uc2UocmVzcG9uc2U6IHVua25vd24pOiByZXNwb25zZSBpcyBOb3N0clJlc3BvbnNlIHtcbiAgaWYgKHR5cGVvZiByZXNwb25zZSAhPT0gJ29iamVjdCcgfHwgcmVzcG9uc2UgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZFJlc3BvbnNlID0gcmVzcG9uc2UgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgaWYgKHR5cGVvZiB2YWxpZFJlc3BvbnNlLnR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHZhbGlkUmVzcG9uc2Uuc3Vic2NyaXB0aW9uSWQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRSZXNwb25zZS5zdWJzY3JpcHRpb25JZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmFsaWRSZXNwb25zZS5ldmVudCAhPT0gdW5kZWZpbmVkICYmICFpc1NpZ25lZE5vc3RyRXZlbnQodmFsaWRSZXNwb25zZS5ldmVudCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmFsaWRSZXNwb25zZS5tZXNzYWdlICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkUmVzcG9uc2UubWVzc2FnZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBOb3N0ckVycm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyRXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBOb3N0ckVycm9yIHtcbiAgaWYgKHR5cGVvZiBlcnJvciAhPT0gJ29iamVjdCcgfHwgZXJyb3IgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZEVycm9yID0gZXJyb3IgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgdmFsaWRFcnJvci50eXBlID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiB2YWxpZEVycm9yLm1lc3NhZ2UgPT09ICdzdHJpbmcnXG4gICk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL25pcDQ2XG4gKiBAZGVzY3JpcHRpb24gVHlwZSBkZWZpbml0aW9ucyBmb3IgTklQLTQ2IChOb3N0ciBDb25uZWN0IC8gUmVtb3RlIFNpZ25pbmcpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kXG4gKi9cblxuLyoqXG4gKiBOSVAtNDYgcmVtb3RlIHNpZ25pbmcgbWV0aG9kc1xuICovXG5leHBvcnQgZW51bSBOaXA0Nk1ldGhvZCB7XG4gIENPTk5FQ1QgPSAnY29ubmVjdCcsXG4gIFBJTkcgPSAncGluZycsXG4gIEdFVF9QVUJMSUNfS0VZID0gJ2dldF9wdWJsaWNfa2V5JyxcbiAgU0lHTl9FVkVOVCA9ICdzaWduX2V2ZW50JyxcbiAgTklQMDRfRU5DUllQVCA9ICduaXAwNF9lbmNyeXB0JyxcbiAgTklQMDRfREVDUllQVCA9ICduaXAwNF9kZWNyeXB0JyxcbiAgTklQNDRfRU5DUllQVCA9ICduaXA0NF9lbmNyeXB0JyxcbiAgTklQNDRfREVDUllQVCA9ICduaXA0NF9kZWNyeXB0JyxcbiAgR0VUX1JFTEFZUyA9ICdnZXRfcmVsYXlzJyxcbn1cblxuLyoqXG4gKiBQYXJzZWQgYnVua2VyOi8vIFVSSVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1bmtlclVSSSB7XG4gIC8qKiBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KSAqL1xuICByZW1vdGVQdWJrZXk6IHN0cmluZztcbiAgLyoqIFJlbGF5IFVSTHMgZm9yIGNvbW11bmljYXRpb24gKi9cbiAgcmVsYXlzOiBzdHJpbmdbXTtcbiAgLyoqIE9wdGlvbmFsIHNlY3JldCBmb3IgaW5pdGlhbCBjb25uZWN0aW9uICovXG4gIHNlY3JldD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBOSVAtNDYgSlNPTi1SUEMgcmVxdWVzdCAoY2xpZW50IC0+IHNpZ25lcilcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlJlcXVlc3Qge1xuICBpZDogc3RyaW5nO1xuICBtZXRob2Q6IE5pcDQ2TWV0aG9kIHwgc3RyaW5nO1xuICBwYXJhbXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIE5JUC00NiBKU09OLVJQQyByZXNwb25zZSAoc2lnbmVyIC0+IGNsaWVudClcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlJlc3BvbnNlIHtcbiAgaWQ6IHN0cmluZztcbiAgcmVzdWx0Pzogc3RyaW5nO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIE5JUC00NiBzZXNzaW9uIGNvbnRhaW5pbmcgdGhlIGVwaGVtZXJhbCBrZXlwYWlyIGFuZCBjb252ZXJzYXRpb24ga2V5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmlwNDZTZXNzaW9uIHtcbiAgLyoqIENsaWVudCdzIGVwaGVtZXJhbCBwcml2YXRlIGtleSAoaGV4KSAqL1xuICBjbGllbnRTZWNyZXRLZXk6IHN0cmluZztcbiAgLyoqIENsaWVudCdzIGVwaGVtZXJhbCBwdWJsaWMga2V5IChoZXgpICovXG4gIGNsaWVudFB1YmtleTogc3RyaW5nO1xuICAvKiogUmVtb3RlIHNpZ25lcidzIHB1YmxpYyBrZXkgKGhleCkgKi9cbiAgcmVtb3RlUHVia2V5OiBzdHJpbmc7XG4gIC8qKiBOSVAtNDQgY29udmVyc2F0aW9uIGtleSAoZGVyaXZlZCBmcm9tIEVDREgpICovXG4gIGNvbnZlcnNhdGlvbktleTogVWludDhBcnJheTtcbn1cblxuLyoqXG4gKiBQdWJsaWMgc2Vzc2lvbiBpbmZvIChzYWZlIHRvIGV4cG9zZTsgZXhjbHVkZXMgcHJpdmF0ZSBrZXkgYW5kIGNvbnZlcnNhdGlvbiBrZXkpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmlwNDZTZXNzaW9uSW5mbyB7XG4gIGNsaWVudFB1YmtleTogc3RyaW5nO1xuICByZW1vdGVQdWJrZXk6IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgdmFsaWRhdGluZyBhIGJ1bmtlcjovLyBVUklcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0IHtcbiAgaXNWYWxpZDogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG4gIHVyaT86IEJ1bmtlclVSSTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgY3J5cHRvXG4gKiBAZGVzY3JpcHRpb24gQ3J5cHRvZ3JhcGhpYyB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKiBcbiAqIElNUE9SVEFOVDogTm9zdHIgUHJvdG9jb2wgQ3J5cHRvZ3JhcGhpYyBSZXF1aXJlbWVudHNcbiAqIFdoaWxlIHNlY3AyNTZrMSBpcyB0aGUgdW5kZXJseWluZyBlbGxpcHRpYyBjdXJ2ZSB1c2VkIGJ5IE5vc3RyLCB0aGUgcHJvdG9jb2wgc3BlY2lmaWNhbGx5XG4gKiByZXF1aXJlcyBzY2hub3JyIHNpZ25hdHVyZXMgYXMgZGVmaW5lZCBpbiBOSVAtMDEuIFRoaXMgbWVhbnM6XG4gKiBcbiAqIDEuIEFsd2F5cyB1c2Ugc2Nobm9yci1zcGVjaWZpYyBmdW5jdGlvbnM6XG4gKiAgICAtIHNjaG5vcnIuZ2V0UHVibGljS2V5KCkgZm9yIHB1YmxpYyBrZXkgZ2VuZXJhdGlvblxuICogICAgLSBzY2hub3JyLnNpZ24oKSBmb3Igc2lnbmluZ1xuICogICAgLSBzY2hub3JyLnZlcmlmeSgpIGZvciB2ZXJpZmljYXRpb25cbiAqIFxuICogMi4gQXZvaWQgdXNpbmcgc2VjcDI1NmsxIGZ1bmN0aW9ucyBkaXJlY3RseTpcbiAqICAgIC0gRE9OJ1QgdXNlIHNlY3AyNTZrMS5nZXRQdWJsaWNLZXkoKVxuICogICAgLSBET04nVCB1c2Ugc2VjcDI1NmsxLnNpZ24oKVxuICogICAgLSBET04nVCB1c2Ugc2VjcDI1NmsxLnZlcmlmeSgpXG4gKiBcbiAqIFdoaWxlIGJvdGggbWlnaHQgd29yayBpbiBzb21lIGNhc2VzIChhcyB0aGV5IHVzZSB0aGUgc2FtZSBjdXJ2ZSksIHRoZSBzY2hub3JyIHNpZ25hdHVyZVxuICogc2NoZW1lIGhhcyBzcGVjaWZpYyByZXF1aXJlbWVudHMgZm9yIGtleSBhbmQgc2lnbmF0dXJlIGZvcm1hdHMgdGhhdCBhcmVuJ3QgZ3VhcmFudGVlZFxuICogd2hlbiB1c2luZyB0aGUgbG93ZXItbGV2ZWwgc2VjcDI1NmsxIGZ1bmN0aW9ucyBkaXJlY3RseS5cbiAqL1xuXG5pbXBvcnQgeyBzY2hub3JyLCBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IEtleVBhaXIsIFB1YmxpY0tleURldGFpbHMsIE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQsIFB1YmxpY0tleSB9IGZyb20gJy4vdHlwZXMvaW5kZXgnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHsgYnl0ZXNUb0Jhc2U2NCwgYmFzZTY0VG9CeXRlcyB9IGZyb20gJy4vZW5jb2RpbmcvYmFzZTY0JztcblxuXG4vKipcbiAqIEN1c3RvbSBjcnlwdG8gaW50ZXJmYWNlIGZvciBjcm9zcy1wbGF0Zm9ybSBjb21wYXRpYmlsaXR5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3J5cHRvU3VidGxlIHtcbiAgc3VidGxlOiB7XG4gICAgZ2VuZXJhdGVLZXkoXG4gICAgICBhbGdvcml0aG06IFJzYUhhc2hlZEtleUdlblBhcmFtcyB8IEVjS2V5R2VuUGFyYW1zLFxuICAgICAgZXh0cmFjdGFibGU6IGJvb2xlYW4sXG4gICAgICBrZXlVc2FnZXM6IHJlYWRvbmx5IEtleVVzYWdlW11cbiAgICApOiBQcm9taXNlPENyeXB0b0tleVBhaXI+O1xuICAgIGltcG9ydEtleShcbiAgICAgIGZvcm1hdDogJ3JhdycgfCAncGtjczgnIHwgJ3Nwa2knLFxuICAgICAga2V5RGF0YTogQXJyYXlCdWZmZXIsXG4gICAgICBhbGdvcml0aG06IFJzYUhhc2hlZEltcG9ydFBhcmFtcyB8IEVjS2V5SW1wb3J0UGFyYW1zIHwgQWVzS2V5QWxnb3JpdGhtLFxuICAgICAgZXh0cmFjdGFibGU6IGJvb2xlYW4sXG4gICAgICBrZXlVc2FnZXM6IHJlYWRvbmx5IEtleVVzYWdlW11cbiAgICApOiBQcm9taXNlPENyeXB0b0tleT47XG4gICAgZW5jcnlwdChcbiAgICAgIGFsZ29yaXRobTogeyBuYW1lOiBzdHJpbmc7IGl2OiBVaW50OEFycmF5IH0sXG4gICAgICBrZXk6IENyeXB0b0tleSxcbiAgICAgIGRhdGE6IEFycmF5QnVmZmVyXG4gICAgKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gICAgZGVjcnlwdChcbiAgICAgIGFsZ29yaXRobTogeyBuYW1lOiBzdHJpbmc7IGl2OiBVaW50OEFycmF5IH0sXG4gICAgICBrZXk6IENyeXB0b0tleSxcbiAgICAgIGRhdGE6IEFycmF5QnVmZmVyXG4gICAgKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj47XG4gIH07XG4gIGdldFJhbmRvbVZhbHVlczxUIGV4dGVuZHMgVWludDhBcnJheSB8IEludDhBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheT4oYXJyYXk6IFQpOiBUO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG4gIGludGVyZmFjZSBHbG9iYWwge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG59XG5cbi8vIEdldCB0aGUgYXBwcm9wcmlhdGUgY3J5cHRvIGltcGxlbWVudGF0aW9uXG5jb25zdCBnZXRDcnlwdG8gPSBhc3luYyAoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+ID0+IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jcnlwdG8pIHtcbiAgICByZXR1cm4gd2luZG93LmNyeXB0bztcbiAgfVxuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbCBhcyBHbG9iYWwpLmNyeXB0bykge1xuICAgIHJldHVybiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgY3J5cHRvTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdjcnlwdG8nKTtcbiAgICBpZiAoY3J5cHRvTW9kdWxlLndlYmNyeXB0bykge1xuICAgICAgcmV0dXJuIGNyeXB0b01vZHVsZS53ZWJjcnlwdG8gYXMgQ3J5cHRvU3VidGxlO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdOb2RlIGNyeXB0byBub3QgYXZhaWxhYmxlJyk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIFdlYkNyeXB0byBpbXBsZW1lbnRhdGlvbiBhdmFpbGFibGUnKTtcbn07XG5cbi8qKlxuICogQ3J5cHRvIGltcGxlbWVudGF0aW9uIHRoYXQgd29ya3MgaW4gYm90aCBOb2RlLmpzIGFuZCBicm93c2VyIGVudmlyb25tZW50c1xuICovXG5jbGFzcyBDdXN0b21DcnlwdG8ge1xuICBwcml2YXRlIGNyeXB0b0luc3RhbmNlOiBDcnlwdG9TdWJ0bGUgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRQcm9taXNlID0gdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jcnlwdG9JbnN0YW5jZSA9IGF3YWl0IGdldENyeXB0bygpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVJbml0aWFsaXplZCgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgaWYgKCF0aGlzLmNyeXB0b0luc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NyeXB0byBpbXBsZW1lbnRhdGlvbiBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3J5cHRvSW5zdGFuY2U7XG4gIH1cblxuICBhc3luYyBnZXRTdWJ0bGUoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGVbJ3N1YnRsZSddPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gIH1cbn1cblxuLy8gQ3JlYXRlIGFuZCBleHBvcnQgZGVmYXVsdCBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGN1c3RvbUNyeXB0byA9IG5ldyBDdXN0b21DcnlwdG8oKTtcblxuLy8gRXhwb3J0IHNjaG5vcnIgZnVuY3Rpb25zXG5leHBvcnQgY29uc3Qgc2lnblNjaG5vcnIgPSBzY2hub3JyLnNpZ247XG5leHBvcnQgY29uc3QgdmVyaWZ5U2Nobm9yclNpZ25hdHVyZSA9IHNjaG5vcnIudmVyaWZ5O1xuXG4vKipcbiAqIEdldHMgdGhlIGNvbXByZXNzZWQgcHVibGljIGtleSAoMzMgYnl0ZXMgd2l0aCBwcmVmaXgpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wcmVzc2VkUHVibGljS2V5KHByaXZhdGVLZXlCeXRlczogVWludDhBcnJheSk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gc2VjcDI1NmsxLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMsIHRydWUpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHNjaG5vcnIgcHVibGljIGtleSAoMzIgYnl0ZXMgeC1jb29yZGluYXRlKSBhcyBwZXIgQklQMzQwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2hub3JyUHVibGljS2V5KHByaXZhdGVLZXlCeXRlczogVWludDhBcnJheSk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gc2Nobm9yci5nZXRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBuZXcga2V5IHBhaXJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlS2V5UGFpcigpOiBQcm9taXNlPEtleVBhaXI+IHtcbiAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gcmFuZG9tQnl0ZXMoMzIpO1xuICBjb25zdCBwcml2YXRlS2V5ID0gYnl0ZXNUb0hleChwcml2YXRlS2V5Qnl0ZXMpO1xuICBwcml2YXRlS2V5Qnl0ZXMuZmlsbCgwKTsgLy8gemVybyBzb3VyY2UgbWF0ZXJpYWxcbiAgY29uc3QgcHVibGljS2V5ID0gYXdhaXQgZ2V0UHVibGljS2V5KHByaXZhdGVLZXkpO1xuXG4gIHJldHVybiB7XG4gICAgcHJpdmF0ZUtleSxcbiAgICBwdWJsaWNLZXlcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXRzIGEgcHVibGljIGtleSBmcm9tIGEgcHJpdmF0ZSBrZXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFB1YmxpY0tleShwcml2YXRlS2V5OiBzdHJpbmcpOiBQcm9taXNlPFB1YmxpY0tleURldGFpbHM+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKHByaXZhdGVLZXkpO1xuICAgIGNvbnN0IHB1YmxpY0tleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzKTtcbiAgICByZXR1cm4ge1xuICAgICAgaGV4OiBieXRlc1RvSGV4KHB1YmxpY0tleUJ5dGVzKSxcbiAgICAgIGJ5dGVzOiBwdWJsaWNLZXlCeXRlc1xuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZXQgcHVibGljIGtleScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEga2V5IHBhaXJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlS2V5UGFpcihrZXlQYWlyOiBLZXlQYWlyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgZGVyaXZlZFB1YktleSA9IGF3YWl0IGdldFB1YmxpY0tleShrZXlQYWlyLnByaXZhdGVLZXkpO1xuICAgIHJldHVybiBkZXJpdmVkUHViS2V5LmhleCA9PT0ga2V5UGFpci5wdWJsaWNLZXkuaGV4O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUga2V5IHBhaXInKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudChldmVudDogUGFydGlhbDxOb3N0ckV2ZW50Pik6IE5vc3RyRXZlbnQge1xuICBjb25zdCB0aW1lc3RhbXAgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcblxuICByZXR1cm4ge1xuICAgIC4uLmV2ZW50LFxuICAgIGNyZWF0ZWRfYXQ6IGV2ZW50LmNyZWF0ZWRfYXQgfHwgdGltZXN0YW1wLFxuICAgIHRhZ3M6IGV2ZW50LnRhZ3MgfHwgW10sXG4gICAgY29udGVudDogZXZlbnQuY29udGVudCB8fCAnJyxcbiAgICBraW5kOiBldmVudC5raW5kIHx8IDFcbiAgfSBhcyBOb3N0ckV2ZW50O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHByaXZhdGUga2V5IHRvIGhleCBzdHJpbmcgKGFjY2VwdHMgYm90aCBoZXggc3RyaW5nIGFuZCBVaW50OEFycmF5KVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVQcml2YXRlS2V5KHByaXZhdGVLZXk6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBpZiAocHJpdmF0ZUtleSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChwcml2YXRlS2V5KTtcbiAgfVxuICByZXR1cm4gcHJpdmF0ZUtleTtcbn1cblxuLyoqXG4gKiBTaWducyBhbiBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBhcyBoZXggc3RyaW5nIG9yIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChldmVudDogTm9zdHJFdmVudCwgcHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHByaXZhdGVLZXlIZXggPSBub3JtYWxpemVQcml2YXRlS2V5KHByaXZhdGVLZXkpO1xuXG4gICAgLy8gU2VyaWFsaXplIGV2ZW50IGZvciBzaWduaW5nIChOSVAtMDEgZm9ybWF0KVxuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAwLFxuICAgICAgZXZlbnQucHVia2V5LFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuXG4gICAgLy8gQ2FsY3VsYXRlIGV2ZW50IGhhc2hcbiAgICBjb25zdCBldmVudEhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcblxuICAgIC8vIENvbnZlcnQgcHJpdmF0ZSBrZXkgdG8gYnl0ZXMgYW5kIHNpZ25cbiAgICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKHByaXZhdGVLZXlIZXgpO1xuICAgIGNvbnN0IHNpZ25hdHVyZUJ5dGVzID0gc2Nobm9yci5zaWduKGV2ZW50SGFzaCwgcHJpdmF0ZUtleUJ5dGVzKTtcblxuICAgIC8vIENyZWF0ZSBzaWduZWQgZXZlbnRcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogYnl0ZXNUb0hleChldmVudEhhc2gpLFxuICAgICAgc2lnOiBieXRlc1RvSGV4KHNpZ25hdHVyZUJ5dGVzKVxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIGEgcHVibGljIGtleSBoZXggc3RyaW5nIGZyb20gYSBwcml2YXRlIGtleSAoc3luY2hyb25vdXMpXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGFzIGhleCBzdHJpbmcgb3IgVWludDhBcnJheVxuICogQHJldHVybnMgSGV4LWVuY29kZWQgcHVibGljIGtleSAoMzItYnl0ZSB4LW9ubHkgc2Nobm9yciBrZXkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQdWJsaWNLZXlTeW5jKHByaXZhdGVLZXk6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSBwcml2YXRlS2V5IGluc3RhbmNlb2YgVWludDhBcnJheVxuICAgID8gcHJpdmF0ZUtleVxuICAgIDogaGV4VG9CeXRlcyhwcml2YXRlS2V5KTtcbiAgY29uc3QgcHVibGljS2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xuICByZXR1cm4gYnl0ZXNUb0hleChwdWJsaWNLZXlCeXRlcyk7XG59XG5cbi8qKlxuICogQ3JlYXRlcywgaGFzaGVzLCBhbmQgc2lnbnMgYSBOb3N0ciBldmVudCBpbiBvbmUgc3RlcFxuICogQHBhcmFtIGV2ZW50IC0gUGFydGlhbCBldmVudCAoa2luZCwgY29udGVudCwgdGFncyByZXF1aXJlZDsgcHVia2V5IGRlcml2ZWQgaWYgbWlzc2luZylcbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgYXMgaGV4IHN0cmluZyBvciBVaW50OEFycmF5XG4gKiBAcmV0dXJucyBGdWxseSBzaWduZWQgZXZlbnQgd2l0aCBpZCwgcHVia2V5LCBhbmQgc2lnXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5hbGl6ZUV2ZW50KFxuICBldmVudDogUGFydGlhbDxOb3N0ckV2ZW50PixcbiAgcHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheVxuKTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIGNvbnN0IHB1YmtleSA9IGV2ZW50LnB1YmtleSB8fCBnZXRQdWJsaWNLZXlTeW5jKHByaXZhdGVLZXkpO1xuICBjb25zdCB0aW1lc3RhbXAgPSBldmVudC5jcmVhdGVkX2F0IHx8IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuXG4gIGNvbnN0IGZ1bGxFdmVudDogTm9zdHJFdmVudCA9IHtcbiAgICBraW5kOiBldmVudC5raW5kIHx8IDEsXG4gICAgY3JlYXRlZF9hdDogdGltZXN0YW1wLFxuICAgIHRhZ3M6IGV2ZW50LnRhZ3MgfHwgW10sXG4gICAgY29udGVudDogZXZlbnQuY29udGVudCB8fCAnJyxcbiAgICBwdWJrZXksXG4gIH07XG5cbiAgcmV0dXJuIHNpZ25FdmVudChmdWxsRXZlbnQsIHByaXZhdGVLZXkpO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIGFuIGV2ZW50IHNpZ25hdHVyZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgLy8gU2VyaWFsaXplIGV2ZW50IGZvciB2ZXJpZmljYXRpb24gKE5JUC0wMSBmb3JtYXQpXG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBldmVudC5wdWJrZXksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG5cbiAgICAvLyBDYWxjdWxhdGUgZXZlbnQgaGFzaFxuICAgIGNvbnN0IGV2ZW50SGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuXG4gICAgLy8gVmVyaWZ5IGV2ZW50IElEXG4gICAgY29uc3QgY2FsY3VsYXRlZElkID0gYnl0ZXNUb0hleChldmVudEhhc2gpO1xuICAgIGlmIChjYWxjdWxhdGVkSWQgIT09IGV2ZW50LmlkKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0V2ZW50IElEIG1pc21hdGNoJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBoZXggc3RyaW5ncyB0byBieXRlc1xuICAgIGNvbnN0IHNpZ25hdHVyZUJ5dGVzID0gaGV4VG9CeXRlcyhldmVudC5zaWcpO1xuICAgIGNvbnN0IHB1YmtleUJ5dGVzID0gaGV4VG9CeXRlcyhldmVudC5wdWJrZXkpO1xuXG4gICAgLy8gVmVyaWZ5IHNpZ25hdHVyZVxuICAgIHJldHVybiBzY2hub3JyLnZlcmlmeShzaWduYXR1cmVCeXRlcywgZXZlbnRIYXNoLCBwdWJrZXlCeXRlcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRW5jcnlwdHMgYSBtZXNzYWdlIHVzaW5nIE5JUC0wNFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChcbiAgbWVzc2FnZTogc3RyaW5nLFxuICByZWNpcGllbnRQdWJLZXk6IFB1YmxpY0tleSB8IHN0cmluZyxcbiAgc2VuZGVyUHJpdktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlY2lwaWVudFB1YktleUhleCA9IHR5cGVvZiByZWNpcGllbnRQdWJLZXkgPT09ICdzdHJpbmcnID8gcmVjaXBpZW50UHViS2V5IDogcmVjaXBpZW50UHViS2V5LmhleDtcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhzZW5kZXJQcml2S2V5KSwgaGV4VG9CeXRlcyhyZWNpcGllbnRQdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpO1xuXG4gICAgLy8gR2VuZXJhdGUgcmFuZG9tIElWXG4gICAgY29uc3QgaXYgPSByYW5kb21CeXRlcygxNik7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgY3VzdG9tQ3J5cHRvLmdldFN1YnRsZSgpLnRoZW4oKHN1YnRsZSkgPT4gc3VidGxlLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAgc2hhcmVkWC5idWZmZXIsXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydlbmNyeXB0J11cbiAgICApKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICAvLyBFbmNyeXB0IHRoZSBtZXNzYWdlXG4gICAgY29uc3QgZGF0YSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShtZXNzYWdlKTtcbiAgICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuZW5jcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdiB9LFxuICAgICAga2V5LFxuICAgICAgZGF0YS5idWZmZXJcbiAgICApKTtcblxuICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIGNvbnN0IGNpcGhlcnRleHRCYXNlNjQgPSBieXRlc1RvQmFzZTY0KG5ldyBVaW50OEFycmF5KGVuY3J5cHRlZCkpO1xuICAgIGNvbnN0IGl2QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChpdik7XG5cbiAgICByZXR1cm4gY2lwaGVydGV4dEJhc2U2NCArICc/aXY9JyArIGl2QmFzZTY0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZW5jcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KFxuICBlbmNyeXB0ZWRNZXNzYWdlOiBzdHJpbmcsXG4gIHNlbmRlclB1YktleTogUHVibGljS2V5IHwgc3RyaW5nLFxuICByZWNpcGllbnRQcml2S2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VuZGVyUHViS2V5SGV4ID0gdHlwZW9mIHNlbmRlclB1YktleSA9PT0gJ3N0cmluZycgPyBzZW5kZXJQdWJLZXkgOiBzZW5kZXJQdWJLZXkuaGV4O1xuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHJlY2lwaWVudFByaXZLZXkpLCBoZXhUb0J5dGVzKHNlbmRlclB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7XG5cbiAgICAvLyBQYXJzZSBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICAvLyBBbHNvIHN1cHBvcnQgbGVnYWN5IGhleCBmb3JtYXQgKGl2ICsgY2lwaGVydGV4dCBjb25jYXRlbmF0ZWQpIGFzIGZhbGxiYWNrXG4gICAgbGV0IGl2OiBVaW50OEFycmF5O1xuICAgIGxldCBjaXBoZXJ0ZXh0OiBVaW50OEFycmF5O1xuXG4gICAgaWYgKGVuY3J5cHRlZE1lc3NhZ2UuaW5jbHVkZXMoJz9pdj0nKSkge1xuICAgICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdFxuICAgICAgY29uc3QgW2NpcGhlcnRleHRCYXNlNjQsIGl2QmFzZTY0XSA9IGVuY3J5cHRlZE1lc3NhZ2Uuc3BsaXQoJz9pdj0nKTtcbiAgICAgIGNpcGhlcnRleHQgPSBiYXNlNjRUb0J5dGVzKGNpcGhlcnRleHRCYXNlNjQpO1xuICAgICAgaXYgPSBiYXNlNjRUb0J5dGVzKGl2QmFzZTY0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGVnYWN5IGhleCBmb3JtYXQgZmFsbGJhY2s6IGZpcnN0IDE2IGJ5dGVzIGFyZSBJViwgcmVzdCBpcyBjaXBoZXJ0ZXh0XG4gICAgICBjb25zdCBlbmNyeXB0ZWQgPSBoZXhUb0J5dGVzKGVuY3J5cHRlZE1lc3NhZ2UpO1xuICAgICAgaXYgPSBlbmNyeXB0ZWQuc2xpY2UoMCwgMTYpO1xuICAgICAgY2lwaGVydGV4dCA9IGVuY3J5cHRlZC5zbGljZSgxNik7XG4gICAgfVxuXG4gICAgY29uc3Qga2V5ID0gYXdhaXQgY3VzdG9tQ3J5cHRvLmdldFN1YnRsZSgpLnRoZW4oKHN1YnRsZSkgPT4gc3VidGxlLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAgc2hhcmVkWC5idWZmZXIsXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydkZWNyeXB0J11cbiAgICApKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuZGVjcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdiB9LFxuICAgICAga2V5LFxuICAgICAgY2lwaGVydGV4dC5idWZmZXIgYXMgQXJyYXlCdWZmZXJcbiAgICApKTtcblxuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGVjcnlwdGVkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGRlY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iLCAiLyoqXG4gKiBTRUNHIHNlY3AyNTZrMS4gU2VlIFtwZGZdKGh0dHBzOi8vd3d3LnNlY2cub3JnL3NlYzItdjIucGRmKS5cbiAqXG4gKiBCZWxvbmdzIHRvIEtvYmxpdHogY3VydmVzOiBpdCBoYXMgZWZmaWNpZW50bHktY29tcHV0YWJsZSBHTFYgZW5kb21vcnBoaXNtIFx1MDNDOCxcbiAqIGNoZWNrIG91dCB7QGxpbmsgRW5kb21vcnBoaXNtT3B0c30uIFNlZW1zIHRvIGJlIHJpZ2lkIChub3QgYmFja2Rvb3JlZCkuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgY3JlYXRlS2V5Z2VuLCB0eXBlIEN1cnZlTGVuZ3RocyB9IGZyb20gJy4vYWJzdHJhY3QvY3VydmUudHMnO1xuaW1wb3J0IHsgY3JlYXRlSGFzaGVyLCB0eXBlIEgyQ0hhc2hlciwgaXNvZ2VueU1hcCB9IGZyb20gJy4vYWJzdHJhY3QvaGFzaC10by1jdXJ2ZS50cyc7XG5pbXBvcnQgeyBGaWVsZCwgbWFwSGFzaFRvRmllbGQsIHBvdzIgfSBmcm9tICcuL2Fic3RyYWN0L21vZHVsYXIudHMnO1xuaW1wb3J0IHtcbiAgdHlwZSBFQ0RTQSxcbiAgZWNkc2EsXG4gIHR5cGUgRW5kb21vcnBoaXNtT3B0cyxcbiAgbWFwVG9DdXJ2ZVNpbXBsZVNXVSxcbiAgdHlwZSBXZWllcnN0cmFzc1BvaW50IGFzIFBvaW50VHlwZSxcbiAgd2VpZXJzdHJhc3MsXG4gIHR5cGUgV2VpZXJzdHJhc3NPcHRzLFxuICB0eXBlIFdlaWVyc3RyYXNzUG9pbnRDb25zLFxufSBmcm9tICcuL2Fic3RyYWN0L3dlaWVyc3RyYXNzLnRzJztcbmltcG9ydCB7IGFieXRlcywgYXNjaWlUb0J5dGVzLCBieXRlc1RvTnVtYmVyQkUsIGNvbmNhdEJ5dGVzIH0gZnJvbSAnLi91dGlscy50cyc7XG5cbi8vIFNlZW1zIGxpa2UgZ2VuZXJhdG9yIHdhcyBwcm9kdWNlZCBmcm9tIHNvbWUgc2VlZDpcbi8vIGBQb2ludGsxLkJBU0UubXVsdGlwbHkoUG9pbnRrMS5Gbi5pbnYoMm4sIE4pKS50b0FmZmluZSgpLnhgXG4vLyAvLyBnaXZlcyBzaG9ydCB4IDB4M2I3OGNlNTYzZjg5YTBlZDk0MTRmNWFhMjhhZDBkOTZkNjc5NWY5YzYzblxuY29uc3Qgc2VjcDI1NmsxX0NVUlZFOiBXZWllcnN0cmFzc09wdHM8YmlnaW50PiA9IHtcbiAgcDogQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlZmZmZmZjMmYnKSxcbiAgbjogQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlYmFhZWRjZTZhZjQ4YTAzYmJmZDI1ZThjZDAzNjQxNDEnKSxcbiAgaDogQmlnSW50KDEpLFxuICBhOiBCaWdJbnQoMCksXG4gIGI6IEJpZ0ludCg3KSxcbiAgR3g6IEJpZ0ludCgnMHg3OWJlNjY3ZWY5ZGNiYmFjNTVhMDYyOTVjZTg3MGIwNzAyOWJmY2RiMmRjZTI4ZDk1OWYyODE1YjE2ZjgxNzk4JyksXG4gIEd5OiBCaWdJbnQoJzB4NDgzYWRhNzcyNmEzYzQ2NTVkYTRmYmZjMGUxMTA4YThmZDE3YjQ0OGE2ODU1NDE5OWM0N2QwOGZmYjEwZDRiOCcpLFxufTtcblxuY29uc3Qgc2VjcDI1NmsxX0VORE86IEVuZG9tb3JwaGlzbU9wdHMgPSB7XG4gIGJldGE6IEJpZ0ludCgnMHg3YWU5NmEyYjY1N2MwNzEwNmU2NDQ3OWVhYzM0MzRlOTljZjA0OTc1MTJmNTg5OTVjMTM5NmMyODcxOTUwMWVlJyksXG4gIGJhc2lzZXM6IFtcbiAgICBbQmlnSW50KCcweDMwODZkMjIxYTdkNDZiY2RlODZjOTBlNDkyODRlYjE1JyksIC1CaWdJbnQoJzB4ZTQ0MzdlZDYwMTBlODgyODZmNTQ3ZmE5MGFiZmU0YzMnKV0sXG4gICAgW0JpZ0ludCgnMHgxMTRjYTUwZjdhOGUyZjNmNjU3YzExMDhkOWQ0NGNmZDgnKSwgQmlnSW50KCcweDMwODZkMjIxYTdkNDZiY2RlODZjOTBlNDkyODRlYjE1JyldLFxuICBdLFxufTtcblxuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKTtcbmNvbnN0IF8ybiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMik7XG5cbi8qKlxuICogXHUyMjFBbiA9IG5eKChwKzEpLzQpIGZvciBmaWVsZHMgcCA9IDMgbW9kIDQuIFdlIHVud3JhcCB0aGUgbG9vcCBhbmQgbXVsdGlwbHkgYml0LWJ5LWJpdC5cbiAqIChQKzFuLzRuKS50b1N0cmluZygyKSB3b3VsZCBwcm9kdWNlIGJpdHMgWzIyM3ggMSwgMCwgMjJ4IDEsIDR4IDAsIDExLCAwMF1cbiAqL1xuZnVuY3Rpb24gc3FydE1vZCh5OiBiaWdpbnQpOiBiaWdpbnQge1xuICBjb25zdCBQID0gc2VjcDI1NmsxX0NVUlZFLnA7XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBjb25zdCBfM24gPSBCaWdJbnQoMyksIF82biA9IEJpZ0ludCg2KSwgXzExbiA9IEJpZ0ludCgxMSksIF8yMm4gPSBCaWdJbnQoMjIpO1xuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgY29uc3QgXzIzbiA9IEJpZ0ludCgyMyksIF80NG4gPSBCaWdJbnQoNDQpLCBfODhuID0gQmlnSW50KDg4KTtcbiAgY29uc3QgYjIgPSAoeSAqIHkgKiB5KSAlIFA7IC8vIHheMywgMTFcbiAgY29uc3QgYjMgPSAoYjIgKiBiMiAqIHkpICUgUDsgLy8geF43XG4gIGNvbnN0IGI2ID0gKHBvdzIoYjMsIF8zbiwgUCkgKiBiMykgJSBQO1xuICBjb25zdCBiOSA9IChwb3cyKGI2LCBfM24sIFApICogYjMpICUgUDtcbiAgY29uc3QgYjExID0gKHBvdzIoYjksIF8ybiwgUCkgKiBiMikgJSBQO1xuICBjb25zdCBiMjIgPSAocG93MihiMTEsIF8xMW4sIFApICogYjExKSAlIFA7XG4gIGNvbnN0IGI0NCA9IChwb3cyKGIyMiwgXzIybiwgUCkgKiBiMjIpICUgUDtcbiAgY29uc3QgYjg4ID0gKHBvdzIoYjQ0LCBfNDRuLCBQKSAqIGI0NCkgJSBQO1xuICBjb25zdCBiMTc2ID0gKHBvdzIoYjg4LCBfODhuLCBQKSAqIGI4OCkgJSBQO1xuICBjb25zdCBiMjIwID0gKHBvdzIoYjE3NiwgXzQ0biwgUCkgKiBiNDQpICUgUDtcbiAgY29uc3QgYjIyMyA9IChwb3cyKGIyMjAsIF8zbiwgUCkgKiBiMykgJSBQO1xuICBjb25zdCB0MSA9IChwb3cyKGIyMjMsIF8yM24sIFApICogYjIyKSAlIFA7XG4gIGNvbnN0IHQyID0gKHBvdzIodDEsIF82biwgUCkgKiBiMikgJSBQO1xuICBjb25zdCByb290ID0gcG93Mih0MiwgXzJuLCBQKTtcbiAgaWYgKCFGcGsxLmVxbChGcGsxLnNxcihyb290KSwgeSkpIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5cbmNvbnN0IEZwazEgPSBGaWVsZChzZWNwMjU2azFfQ1VSVkUucCwgeyBzcXJ0OiBzcXJ0TW9kIH0pO1xuY29uc3QgUG9pbnRrMSA9IC8qIEBfX1BVUkVfXyAqLyB3ZWllcnN0cmFzcyhzZWNwMjU2azFfQ1VSVkUsIHtcbiAgRnA6IEZwazEsXG4gIGVuZG86IHNlY3AyNTZrMV9FTkRPLFxufSk7XG5cbi8qKlxuICogc2VjcDI1NmsxIGN1cnZlOiBFQ0RTQSBhbmQgRUNESCBtZXRob2RzLlxuICpcbiAqIFVzZXMgc2hhMjU2IHRvIGhhc2ggbWVzc2FnZXMuIFRvIHVzZSBhIGRpZmZlcmVudCBoYXNoLFxuICogcGFzcyBgeyBwcmVoYXNoOiBmYWxzZSB9YCB0byBzaWduIC8gdmVyaWZ5LlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogaW1wb3J0IHsgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuICogY29uc3QgeyBzZWNyZXRLZXksIHB1YmxpY0tleSB9ID0gc2VjcDI1NmsxLmtleWdlbigpO1xuICogLy8gY29uc3QgcHVibGljS2V5ID0gc2VjcDI1NmsxLmdldFB1YmxpY0tleShzZWNyZXRLZXkpO1xuICogY29uc3QgbXNnID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdoZWxsbyBub2JsZScpO1xuICogY29uc3Qgc2lnID0gc2VjcDI1NmsxLnNpZ24obXNnLCBzZWNyZXRLZXkpO1xuICogY29uc3QgaXNWYWxpZCA9IHNlY3AyNTZrMS52ZXJpZnkoc2lnLCBtc2csIHB1YmxpY0tleSk7XG4gKiAvLyBjb25zdCBzaWdLZWNjYWsgPSBzZWNwMjU2azEuc2lnbihrZWNjYWsyNTYobXNnKSwgc2VjcmV0S2V5LCB7IHByZWhhc2g6IGZhbHNlIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBzZWNwMjU2azE6IEVDRFNBID0gLyogQF9fUFVSRV9fICovIGVjZHNhKFBvaW50azEsIHNoYTI1Nik7XG5cbi8vIFNjaG5vcnIgc2lnbmF0dXJlcyBhcmUgc3VwZXJpb3IgdG8gRUNEU0EgZnJvbSBhYm92ZS4gQmVsb3cgaXMgU2Nobm9yci1zcGVjaWZpYyBCSVAwMzQwIGNvZGUuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYml0Y29pbi9iaXBzL2Jsb2IvbWFzdGVyL2JpcC0wMzQwLm1lZGlhd2lraVxuLyoqIEFuIG9iamVjdCBtYXBwaW5nIHRhZ3MgdG8gdGhlaXIgdGFnZ2VkIGhhc2ggcHJlZml4IG9mIFtTSEEyNTYodGFnKSB8IFNIQTI1Nih0YWcpXSAqL1xuY29uc3QgVEFHR0VEX0hBU0hfUFJFRklYRVM6IHsgW3RhZzogc3RyaW5nXTogVWludDhBcnJheSB9ID0ge307XG5mdW5jdGlvbiB0YWdnZWRIYXNoKHRhZzogc3RyaW5nLCAuLi5tZXNzYWdlczogVWludDhBcnJheVtdKTogVWludDhBcnJheSB7XG4gIGxldCB0YWdQID0gVEFHR0VEX0hBU0hfUFJFRklYRVNbdGFnXTtcbiAgaWYgKHRhZ1AgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHRhZ0ggPSBzaGEyNTYoYXNjaWlUb0J5dGVzKHRhZykpO1xuICAgIHRhZ1AgPSBjb25jYXRCeXRlcyh0YWdILCB0YWdIKTtcbiAgICBUQUdHRURfSEFTSF9QUkVGSVhFU1t0YWddID0gdGFnUDtcbiAgfVxuICByZXR1cm4gc2hhMjU2KGNvbmNhdEJ5dGVzKHRhZ1AsIC4uLm1lc3NhZ2VzKSk7XG59XG5cbi8vIEVDRFNBIGNvbXBhY3QgcG9pbnRzIGFyZSAzMy1ieXRlLiBTY2hub3JyIGlzIDMyOiB3ZSBzdHJpcCBmaXJzdCBieXRlIDB4MDIgb3IgMHgwM1xuY29uc3QgcG9pbnRUb0J5dGVzID0gKHBvaW50OiBQb2ludFR5cGU8YmlnaW50PikgPT4gcG9pbnQudG9CeXRlcyh0cnVlKS5zbGljZSgxKTtcbmNvbnN0IGhhc0V2ZW4gPSAoeTogYmlnaW50KSA9PiB5ICUgXzJuID09PSBfMG47XG5cbi8vIENhbGN1bGF0ZSBwb2ludCwgc2NhbGFyIGFuZCBieXRlc1xuZnVuY3Rpb24gc2Nobm9yckdldEV4dFB1YktleShwcml2OiBVaW50OEFycmF5KSB7XG4gIGNvbnN0IHsgRm4sIEJBU0UgfSA9IFBvaW50azE7XG4gIGNvbnN0IGRfID0gRm4uZnJvbUJ5dGVzKHByaXYpO1xuICBjb25zdCBwID0gQkFTRS5tdWx0aXBseShkXyk7IC8vIFAgPSBkJ1x1MjJDNUc7IDAgPCBkJyA8IG4gY2hlY2sgaXMgZG9uZSBpbnNpZGVcbiAgY29uc3Qgc2NhbGFyID0gaGFzRXZlbihwLnkpID8gZF8gOiBGbi5uZWcoZF8pO1xuICByZXR1cm4geyBzY2FsYXIsIGJ5dGVzOiBwb2ludFRvQnl0ZXMocCkgfTtcbn1cbi8qKlxuICogbGlmdF94IGZyb20gQklQMzQwLiBDb252ZXJ0IDMyLWJ5dGUgeCBjb29yZGluYXRlIHRvIGVsbGlwdGljIGN1cnZlIHBvaW50LlxuICogQHJldHVybnMgdmFsaWQgcG9pbnQgY2hlY2tlZCBmb3IgYmVpbmcgb24tY3VydmVcbiAqL1xuZnVuY3Rpb24gbGlmdF94KHg6IGJpZ2ludCk6IFBvaW50VHlwZTxiaWdpbnQ+IHtcbiAgY29uc3QgRnAgPSBGcGsxO1xuICBpZiAoIUZwLmlzVmFsaWROb3QwKHgpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgeDogRmFpbCBpZiB4IFx1MjI2NSBwJyk7XG4gIGNvbnN0IHh4ID0gRnAuY3JlYXRlKHggKiB4KTtcbiAgY29uc3QgYyA9IEZwLmNyZWF0ZSh4eCAqIHggKyBCaWdJbnQoNykpOyAvLyBMZXQgYyA9IHhcdTAwQjMgKyA3IG1vZCBwLlxuICBsZXQgeSA9IEZwLnNxcnQoYyk7IC8vIExldCB5ID0gY14ocCsxKS80IG1vZCBwLiBTYW1lIGFzIHNxcnQoKS5cbiAgLy8gUmV0dXJuIHRoZSB1bmlxdWUgcG9pbnQgUCBzdWNoIHRoYXQgeChQKSA9IHggYW5kXG4gIC8vIHkoUCkgPSB5IGlmIHkgbW9kIDIgPSAwIG9yIHkoUCkgPSBwLXkgb3RoZXJ3aXNlLlxuICBpZiAoIWhhc0V2ZW4oeSkpIHkgPSBGcC5uZWcoeSk7XG4gIGNvbnN0IHAgPSBQb2ludGsxLmZyb21BZmZpbmUoeyB4LCB5IH0pO1xuICBwLmFzc2VydFZhbGlkaXR5KCk7XG4gIHJldHVybiBwO1xufVxuY29uc3QgbnVtID0gYnl0ZXNUb051bWJlckJFO1xuLyoqXG4gKiBDcmVhdGUgdGFnZ2VkIGhhc2gsIGNvbnZlcnQgaXQgdG8gYmlnaW50LCByZWR1Y2UgbW9kdWxvLW4uXG4gKi9cbmZ1bmN0aW9uIGNoYWxsZW5nZSguLi5hcmdzOiBVaW50OEFycmF5W10pOiBiaWdpbnQge1xuICByZXR1cm4gUG9pbnRrMS5Gbi5jcmVhdGUobnVtKHRhZ2dlZEhhc2goJ0JJUDAzNDAvY2hhbGxlbmdlJywgLi4uYXJncykpKTtcbn1cblxuLyoqXG4gKiBTY2hub3JyIHB1YmxpYyBrZXkgaXMganVzdCBgeGAgY29vcmRpbmF0ZSBvZiBQb2ludCBhcyBwZXIgQklQMzQwLlxuICovXG5mdW5jdGlvbiBzY2hub3JyR2V0UHVibGljS2V5KHNlY3JldEtleTogVWludDhBcnJheSk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gc2Nobm9yckdldEV4dFB1YktleShzZWNyZXRLZXkpLmJ5dGVzOyAvLyBkJz1pbnQoc2spLiBGYWlsIGlmIGQnPTAgb3IgZCdcdTIyNjVuLiBSZXQgYnl0ZXMoZCdcdTIyQzVHKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgU2Nobm9yciBzaWduYXR1cmUgYXMgcGVyIEJJUDM0MC4gVmVyaWZpZXMgaXRzZWxmIGJlZm9yZSByZXR1cm5pbmcgYW55dGhpbmcuXG4gKiBhdXhSYW5kIGlzIG9wdGlvbmFsIGFuZCBpcyBub3QgdGhlIHNvbGUgc291cmNlIG9mIGsgZ2VuZXJhdGlvbjogYmFkIENTUFJORyB3b24ndCBiZSBkYW5nZXJvdXMuXG4gKi9cbmZ1bmN0aW9uIHNjaG5vcnJTaWduKFxuICBtZXNzYWdlOiBVaW50OEFycmF5LFxuICBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksXG4gIGF1eFJhbmQ6IFVpbnQ4QXJyYXkgPSByYW5kb21CeXRlcygzMilcbik6IFVpbnQ4QXJyYXkge1xuICBjb25zdCB7IEZuIH0gPSBQb2ludGsxO1xuICBjb25zdCBtID0gYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgY29uc3QgeyBieXRlczogcHgsIHNjYWxhcjogZCB9ID0gc2Nobm9yckdldEV4dFB1YktleShzZWNyZXRLZXkpOyAvLyBjaGVja3MgZm9yIGlzV2l0aGluQ3VydmVPcmRlclxuICBjb25zdCBhID0gYWJ5dGVzKGF1eFJhbmQsIDMyLCAnYXV4UmFuZCcpOyAvLyBBdXhpbGlhcnkgcmFuZG9tIGRhdGEgYTogYSAzMi1ieXRlIGFycmF5XG4gIGNvbnN0IHQgPSBGbi50b0J5dGVzKGQgXiBudW0odGFnZ2VkSGFzaCgnQklQMDM0MC9hdXgnLCBhKSkpOyAvLyBMZXQgdCBiZSB0aGUgYnl0ZS13aXNlIHhvciBvZiBieXRlcyhkKSBhbmQgaGFzaC9hdXgoYSlcbiAgY29uc3QgcmFuZCA9IHRhZ2dlZEhhc2goJ0JJUDAzNDAvbm9uY2UnLCB0LCBweCwgbSk7IC8vIExldCByYW5kID0gaGFzaC9ub25jZSh0IHx8IGJ5dGVzKFApIHx8IG0pXG4gIC8vIExldCBrJyA9IGludChyYW5kKSBtb2Qgbi4gRmFpbCBpZiBrJyA9IDAuIExldCBSID0gaydcdTIyQzVHXG4gIGNvbnN0IHsgYnl0ZXM6IHJ4LCBzY2FsYXI6IGsgfSA9IHNjaG5vcnJHZXRFeHRQdWJLZXkocmFuZCk7XG4gIGNvbnN0IGUgPSBjaGFsbGVuZ2UocngsIHB4LCBtKTsgLy8gTGV0IGUgPSBpbnQoaGFzaC9jaGFsbGVuZ2UoYnl0ZXMoUikgfHwgYnl0ZXMoUCkgfHwgbSkpIG1vZCBuLlxuICBjb25zdCBzaWcgPSBuZXcgVWludDhBcnJheSg2NCk7IC8vIExldCBzaWcgPSBieXRlcyhSKSB8fCBieXRlcygoayArIGVkKSBtb2QgbikuXG4gIHNpZy5zZXQocngsIDApO1xuICBzaWcuc2V0KEZuLnRvQnl0ZXMoRm4uY3JlYXRlKGsgKyBlICogZCkpLCAzMik7XG4gIC8vIElmIFZlcmlmeShieXRlcyhQKSwgbSwgc2lnKSAoc2VlIGJlbG93KSByZXR1cm5zIGZhaWx1cmUsIGFib3J0XG4gIGlmICghc2Nobm9yclZlcmlmeShzaWcsIG0sIHB4KSkgdGhyb3cgbmV3IEVycm9yKCdzaWduOiBJbnZhbGlkIHNpZ25hdHVyZSBwcm9kdWNlZCcpO1xuICByZXR1cm4gc2lnO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIFNjaG5vcnIgc2lnbmF0dXJlLlxuICogV2lsbCBzd2FsbG93IGVycm9ycyAmIHJldHVybiBmYWxzZSBleGNlcHQgZm9yIGluaXRpYWwgdHlwZSB2YWxpZGF0aW9uIG9mIGFyZ3VtZW50cy5cbiAqL1xuZnVuY3Rpb24gc2Nobm9yclZlcmlmeShzaWduYXR1cmU6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHB1YmxpY0tleTogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBjb25zdCB7IEZwLCBGbiwgQkFTRSB9ID0gUG9pbnRrMTtcbiAgY29uc3Qgc2lnID0gYWJ5dGVzKHNpZ25hdHVyZSwgNjQsICdzaWduYXR1cmUnKTtcbiAgY29uc3QgbSA9IGFieXRlcyhtZXNzYWdlLCB1bmRlZmluZWQsICdtZXNzYWdlJyk7XG4gIGNvbnN0IHB1YiA9IGFieXRlcyhwdWJsaWNLZXksIDMyLCAncHVibGljS2V5Jyk7XG4gIHRyeSB7XG4gICAgY29uc3QgUCA9IGxpZnRfeChudW0ocHViKSk7IC8vIFAgPSBsaWZ0X3goaW50KHBrKSk7IGZhaWwgaWYgdGhhdCBmYWlsc1xuICAgIGNvbnN0IHIgPSBudW0oc2lnLnN1YmFycmF5KDAsIDMyKSk7IC8vIExldCByID0gaW50KHNpZ1swOjMyXSk7IGZhaWwgaWYgciBcdTIyNjUgcC5cbiAgICBpZiAoIUZwLmlzVmFsaWROb3QwKHIpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgcyA9IG51bShzaWcuc3ViYXJyYXkoMzIsIDY0KSk7IC8vIExldCBzID0gaW50KHNpZ1szMjo2NF0pOyBmYWlsIGlmIHMgXHUyMjY1IG4uXG4gICAgaWYgKCFGbi5pc1ZhbGlkTm90MChzKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgZSA9IGNoYWxsZW5nZShGbi50b0J5dGVzKHIpLCBwb2ludFRvQnl0ZXMoUCksIG0pOyAvLyBpbnQoY2hhbGxlbmdlKGJ5dGVzKHIpfHxieXRlcyhQKXx8bSkpJW5cbiAgICAvLyBSID0gc1x1MjJDNUcgLSBlXHUyMkM1UCwgd2hlcmUgLWVQID09IChuLWUpUFxuICAgIGNvbnN0IFIgPSBCQVNFLm11bHRpcGx5VW5zYWZlKHMpLmFkZChQLm11bHRpcGx5VW5zYWZlKEZuLm5lZyhlKSkpO1xuICAgIGNvbnN0IHsgeCwgeSB9ID0gUi50b0FmZmluZSgpO1xuICAgIC8vIEZhaWwgaWYgaXNfaW5maW5pdGUoUikgLyBub3QgaGFzX2V2ZW5feShSKSAvIHgoUikgXHUyMjYwIHIuXG4gICAgaWYgKFIuaXMwKCkgfHwgIWhhc0V2ZW4oeSkgfHwgeCAhPT0gcikgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBTZWNwU2Nobm9yciA9IHtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiB0eXBlb2Ygc2Nobm9yckdldFB1YmxpY0tleTtcbiAgc2lnbjogdHlwZW9mIHNjaG5vcnJTaWduO1xuICB2ZXJpZnk6IHR5cGVvZiBzY2hub3JyVmVyaWZ5O1xuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PjtcbiAgdXRpbHM6IHtcbiAgICByYW5kb21TZWNyZXRLZXk6IChzZWVkPzogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgICBwb2ludFRvQnl0ZXM6IChwb2ludDogUG9pbnRUeXBlPGJpZ2ludD4pID0+IFVpbnQ4QXJyYXk7XG4gICAgbGlmdF94OiB0eXBlb2YgbGlmdF94O1xuICAgIHRhZ2dlZEhhc2g6IHR5cGVvZiB0YWdnZWRIYXNoO1xuICB9O1xuICBsZW5ndGhzOiBDdXJ2ZUxlbmd0aHM7XG59O1xuLyoqXG4gKiBTY2hub3JyIHNpZ25hdHVyZXMgb3ZlciBzZWNwMjU2azEuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYml0Y29pbi9iaXBzL2Jsb2IvbWFzdGVyL2JpcC0wMzQwLm1lZGlhd2lraVxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBpbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuICogY29uc3QgeyBzZWNyZXRLZXksIHB1YmxpY0tleSB9ID0gc2Nobm9yci5rZXlnZW4oKTtcbiAqIC8vIGNvbnN0IHB1YmxpY0tleSA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KHNlY3JldEtleSk7XG4gKiBjb25zdCBtc2cgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ2hlbGxvJyk7XG4gKiBjb25zdCBzaWcgPSBzY2hub3JyLnNpZ24obXNnLCBzZWNyZXRLZXkpO1xuICogY29uc3QgaXNWYWxpZCA9IHNjaG5vcnIudmVyaWZ5KHNpZywgbXNnLCBwdWJsaWNLZXkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBzY2hub3JyOiBTZWNwU2Nobm9yciA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4ge1xuICBjb25zdCBzaXplID0gMzI7XG4gIGNvbnN0IHNlZWRMZW5ndGggPSA0ODtcbiAgY29uc3QgcmFuZG9tU2VjcmV0S2V5ID0gKHNlZWQgPSByYW5kb21CeXRlcyhzZWVkTGVuZ3RoKSk6IFVpbnQ4QXJyYXkgPT4ge1xuICAgIHJldHVybiBtYXBIYXNoVG9GaWVsZChzZWVkLCBzZWNwMjU2azFfQ1VSVkUubik7XG4gIH07XG4gIHJldHVybiB7XG4gICAga2V5Z2VuOiBjcmVhdGVLZXlnZW4ocmFuZG9tU2VjcmV0S2V5LCBzY2hub3JyR2V0UHVibGljS2V5KSxcbiAgICBnZXRQdWJsaWNLZXk6IHNjaG5vcnJHZXRQdWJsaWNLZXksXG4gICAgc2lnbjogc2Nobm9yclNpZ24sXG4gICAgdmVyaWZ5OiBzY2hub3JyVmVyaWZ5LFxuICAgIFBvaW50OiBQb2ludGsxLFxuICAgIHV0aWxzOiB7XG4gICAgICByYW5kb21TZWNyZXRLZXksXG4gICAgICB0YWdnZWRIYXNoLFxuICAgICAgbGlmdF94LFxuICAgICAgcG9pbnRUb0J5dGVzLFxuICAgIH0sXG4gICAgbGVuZ3Roczoge1xuICAgICAgc2VjcmV0S2V5OiBzaXplLFxuICAgICAgcHVibGljS2V5OiBzaXplLFxuICAgICAgcHVibGljS2V5SGFzUHJlZml4OiBmYWxzZSxcbiAgICAgIHNpZ25hdHVyZTogc2l6ZSAqIDIsXG4gICAgICBzZWVkOiBzZWVkTGVuZ3RoLFxuICAgIH0sXG4gIH07XG59KSgpO1xuXG5jb25zdCBpc29NYXAgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIGlzb2dlbnlNYXAoXG4gICAgRnBrMSxcbiAgICBbXG4gICAgICAvLyB4TnVtXG4gICAgICBbXG4gICAgICAgICcweDhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhkYWFhYWE4YzcnLFxuICAgICAgICAnMHg3ZDNkNGM4MGJjMzIxZDViOWYzMTVjZWE3ZmQ0NGM1ZDU5NWQyZmMwYmY2M2I5MmRmZmYxMDQ0ZjE3YzY1ODEnLFxuICAgICAgICAnMHg1MzRjMzI4ZDIzZjIzNGU2ZTJhNDEzZGVjYTI1Y2FlY2U0NTA2MTQ0MDM3YzQwMzE0ZWNiZDBiNTNkOWRkMjYyJyxcbiAgICAgICAgJzB4OGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGRhYWFhYTg4YycsXG4gICAgICBdLFxuICAgICAgLy8geERlblxuICAgICAgW1xuICAgICAgICAnMHhkMzU3NzExOTNkOTQ5MThhOWNhMzRjY2JiN2I2NDBkZDg2Y2Q0MDk1NDJmODQ4N2Q5ZmU2Yjc0NTc4MWViNDliJyxcbiAgICAgICAgJzB4ZWRhZGM2ZjY0MzgzZGMxZGY3YzRiMmQ1MWI1NDIyNTQwNmQzNmI2NDFmNWU0MWJiYzUyYTU2NjEyYThjNmQxNCcsXG4gICAgICAgICcweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEnLCAvLyBMQVNUIDFcbiAgICAgIF0sXG4gICAgICAvLyB5TnVtXG4gICAgICBbXG4gICAgICAgICcweDRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiOGUzOGUyM2MnLFxuICAgICAgICAnMHhjNzVlMGMzMmQ1Y2I3YzBmYTlkMGE1NGIxMmEwYTZkNTY0N2FiMDQ2ZDY4NmRhNmZkZmZjOTBmYzIwMWQ3MWEzJyxcbiAgICAgICAgJzB4MjlhNjE5NDY5MWY5MWE3MzcxNTIwOWVmNjUxMmU1NzY3MjI4MzBhMjAxYmUyMDE4YTc2NWU4NWE5ZWNlZTkzMScsXG4gICAgICAgICcweDJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmMzhlMzhkODQnLFxuICAgICAgXSxcbiAgICAgIC8vIHlEZW5cbiAgICAgIFtcbiAgICAgICAgJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVmZmZmZjkzYicsXG4gICAgICAgICcweDdhMDY1MzRiYjhiZGI0OWZkNWU5ZTY2MzI3MjJjMjk4OTQ2N2MxYmZjOGU4ZDk3OGRmYjQyNWQyNjg1YzI1NzMnLFxuICAgICAgICAnMHg2NDg0YWE3MTY1NDVjYTJjZjNhNzBjM2ZhOGZlMzM3ZTBhM2QyMTE2MmYwZDYyOTlhN2JmODE5MmJmZDJhNzZmJyxcbiAgICAgICAgJzB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMScsIC8vIExBU1QgMVxuICAgICAgXSxcbiAgICBdLm1hcCgoaSkgPT4gaS5tYXAoKGopID0+IEJpZ0ludChqKSkpIGFzIFtiaWdpbnRbXSwgYmlnaW50W10sIGJpZ2ludFtdLCBiaWdpbnRbXV1cbiAgKSkoKTtcbmNvbnN0IG1hcFNXVSA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgbWFwVG9DdXJ2ZVNpbXBsZVNXVShGcGsxLCB7XG4gICAgQTogQmlnSW50KCcweDNmODczMWFiZGQ2NjFhZGNhMDhhNTU1OGYwZjVkMjcyZTk1M2QzNjNjYjZmMGU1ZDQwNTQ0N2MwMWE0NDQ1MzMnKSxcbiAgICBCOiBCaWdJbnQoJzE3NzEnKSxcbiAgICBaOiBGcGsxLmNyZWF0ZShCaWdJbnQoJy0xMScpKSxcbiAgfSkpKCk7XG5cbi8qKiBIYXNoaW5nIC8gZW5jb2RpbmcgdG8gc2VjcDI1NmsxIHBvaW50cyAvIGZpZWxkLiBSRkMgOTM4MCBtZXRob2RzLiAqL1xuZXhwb3J0IGNvbnN0IHNlY3AyNTZrMV9oYXNoZXI6IEgyQ0hhc2hlcjxXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+PiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgY3JlYXRlSGFzaGVyKFxuICAgIFBvaW50azEsXG4gICAgKHNjYWxhcnM6IGJpZ2ludFtdKSA9PiB7XG4gICAgICBjb25zdCB7IHgsIHkgfSA9IG1hcFNXVShGcGsxLmNyZWF0ZShzY2FsYXJzWzBdKSk7XG4gICAgICByZXR1cm4gaXNvTWFwKHgsIHkpO1xuICAgIH0sXG4gICAge1xuICAgICAgRFNUOiAnc2VjcDI1NmsxX1hNRDpTSEEtMjU2X1NTV1VfUk9fJyxcbiAgICAgIGVuY29kZURTVDogJ3NlY3AyNTZrMV9YTUQ6U0hBLTI1Nl9TU1dVX05VXycsXG4gICAgICBwOiBGcGsxLk9SREVSLFxuICAgICAgbTogMSxcbiAgICAgIGs6IDEyOCxcbiAgICAgIGV4cGFuZDogJ3htZCcsXG4gICAgICBoYXNoOiBzaGEyNTYsXG4gICAgfVxuICApKSgpO1xuIiwgIi8qKlxuICogTWV0aG9kcyBmb3IgZWxsaXB0aWMgY3VydmUgbXVsdGlwbGljYXRpb24gYnkgc2NhbGFycy5cbiAqIENvbnRhaW5zIHdOQUYsIHBpcHBlbmdlci5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgYml0TGVuLCBiaXRNYXNrLCB0eXBlIFNpZ25lciB9IGZyb20gJy4uL3V0aWxzLnRzJztcbmltcG9ydCB7IEZpZWxkLCBGcEludmVydEJhdGNoLCB2YWxpZGF0ZUZpZWxkLCB0eXBlIElGaWVsZCB9IGZyb20gJy4vbW9kdWxhci50cyc7XG5cbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCk7XG5jb25zdCBfMW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDEpO1xuXG5leHBvcnQgdHlwZSBBZmZpbmVQb2ludDxUPiA9IHtcbiAgeDogVDtcbiAgeTogVDtcbn0gJiB7IFo/OiBuZXZlciB9O1xuXG4vLyBXZSBjYW4ndCBcImFic3RyYWN0IG91dFwiIGNvb3JkaW5hdGVzIChYLCBZLCBaOyBhbmQgVCBpbiBFZHdhcmRzKTogYXJndW1lbnQgbmFtZXMgb2YgY29uc3RydWN0b3Jcbi8vIGFyZSBub3QgYWNjZXNzaWJsZS4gU2VlIFR5cGVzY3JpcHQgZ2gtNTYwOTMsIGdoLTQxNTk0LlxuLy9cbi8vIFdlIGhhdmUgdG8gdXNlIHJlY3Vyc2l2ZSB0eXBlcywgc28gaXQgd2lsbCByZXR1cm4gYWN0dWFsIHBvaW50LCBub3QgY29uc3RhaW5lZCBgQ3VydmVQb2ludGAuXG4vLyBJZiwgYXQgYW55IHBvaW50LCBQIGlzIGBhbnlgLCBpdCB3aWxsIGVyYXNlIGFsbCB0eXBlcyBhbmQgcmVwbGFjZSBpdFxuLy8gd2l0aCBgYW55YCwgYmVjYXVzZSBvZiByZWN1cnNpb24sIGBhbnkgaW1wbGVtZW50cyBDdXJ2ZVBvaW50YCxcbi8vIGJ1dCB3ZSBsb3NlIGFsbCBjb25zdHJhaW5zIG9uIG1ldGhvZHMuXG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGVsbGlwdGljIGN1cnZlIFBvaW50cy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VydmVQb2ludDxGLCBQIGV4dGVuZHMgQ3VydmVQb2ludDxGLCBQPj4ge1xuICAvKiogQWZmaW5lIHggY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSAvIGV4dGVuZGVkIFggY29vcmRpbmF0ZS4gKi9cbiAgeDogRjtcbiAgLyoqIEFmZmluZSB5IGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIHByb2plY3RpdmUgLyBleHRlbmRlZCBZIGNvb3JkaW5hdGUuICovXG4gIHk6IEY7XG4gIFo/OiBGO1xuICBkb3VibGUoKTogUDtcbiAgbmVnYXRlKCk6IFA7XG4gIGFkZChvdGhlcjogUCk6IFA7XG4gIHN1YnRyYWN0KG90aGVyOiBQKTogUDtcbiAgZXF1YWxzKG90aGVyOiBQKTogYm9vbGVhbjtcbiAgbXVsdGlwbHkoc2NhbGFyOiBiaWdpbnQpOiBQO1xuICBhc3NlcnRWYWxpZGl0eSgpOiB2b2lkO1xuICBjbGVhckNvZmFjdG9yKCk6IFA7XG4gIGlzMCgpOiBib29sZWFuO1xuICBpc1RvcnNpb25GcmVlKCk6IGJvb2xlYW47XG4gIGlzU21hbGxPcmRlcigpOiBib29sZWFuO1xuICBtdWx0aXBseVVuc2FmZShzY2FsYXI6IGJpZ2ludCk6IFA7XG4gIC8qKlxuICAgKiBNYXNzaXZlbHkgc3BlZWRzIHVwIGBwLm11bHRpcGx5KG4pYCBieSB1c2luZyBwcmVjb21wdXRlIHRhYmxlcyAoY2FjaGluZykuIFNlZSB7QGxpbmsgd05BRn0uXG4gICAqIEBwYXJhbSBpc0xhenkgY2FsY3VsYXRlIGNhY2hlIG5vdy4gRGVmYXVsdCAodHJ1ZSkgZW5zdXJlcyBpdCdzIGRlZmVycmVkIHRvIGZpcnN0IGBtdWx0aXBseSgpYFxuICAgKi9cbiAgcHJlY29tcHV0ZSh3aW5kb3dTaXplPzogbnVtYmVyLCBpc0xhenk/OiBib29sZWFuKTogUDtcbiAgLyoqIENvbnZlcnRzIHBvaW50IHRvIDJEIHh5IGFmZmluZSBjb29yZGluYXRlcyAqL1xuICB0b0FmZmluZShpbnZlcnRlZFo/OiBGKTogQWZmaW5lUG9pbnQ8Rj47XG4gIHRvQnl0ZXMoKTogVWludDhBcnJheTtcbiAgdG9IZXgoKTogc3RyaW5nO1xufVxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBlbGxpcHRpYyBjdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvcnMuICovXG5leHBvcnQgaW50ZXJmYWNlIEN1cnZlUG9pbnRDb25zPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4+IHtcbiAgW1N5bWJvbC5oYXNJbnN0YW5jZV06IChpdGVtOiB1bmtub3duKSA9PiBib29sZWFuO1xuICBCQVNFOiBQO1xuICBaRVJPOiBQO1xuICAvKiogRmllbGQgZm9yIGJhc2ljIGN1cnZlIG1hdGggKi9cbiAgRnA6IElGaWVsZDxQX0Y8UD4+O1xuICAvKiogU2NhbGFyIGZpZWxkLCBmb3Igc2NhbGFycyBpbiBtdWx0aXBseSBhbmQgb3RoZXJzICovXG4gIEZuOiBJRmllbGQ8YmlnaW50PjtcbiAgLyoqIENyZWF0ZXMgcG9pbnQgZnJvbSB4LCB5LiBEb2VzIE5PVCB2YWxpZGF0ZSBpZiB0aGUgcG9pbnQgaXMgdmFsaWQuIFVzZSBgLmFzc2VydFZhbGlkaXR5KClgLiAqL1xuICBmcm9tQWZmaW5lKHA6IEFmZmluZVBvaW50PFBfRjxQPj4pOiBQO1xuICBmcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBQO1xuICBmcm9tSGV4KGhleDogc3RyaW5nKTogUDtcbn1cblxuLy8gVHlwZSBpbmZlcmVuY2UgaGVscGVyczogUEMgLSBQb2ludENvbnN0cnVjdG9yLCBQIC0gUG9pbnQsIEZwIC0gRmllbGQgZWxlbWVudFxuLy8gU2hvcnQgbmFtZXMsIGJlY2F1c2Ugd2UgdXNlIHRoZW0gYSBsb3QgaW4gcmVzdWx0IHR5cGVzOlxuLy8gKiB3ZSBjYW4ndCBkbyAnUCA9IEdldEN1cnZlUG9pbnQ8UEM+JzogdGhpcyBpcyBkZWZhdWx0IHZhbHVlIGFuZCBkb2Vzbid0IGNvbnN0cmFpbiBhbnl0aGluZ1xuLy8gKiB3ZSBjYW4ndCBkbyAndHlwZSBYID0gR2V0Q3VydmVQb2ludDxQQz4nOiBpdCB3b24ndCBiZSBhY2Nlc2libGUgZm9yIGFyZ3VtZW50cy9yZXR1cm4gdHlwZXNcbi8vICogYEN1cnZlUG9pbnRDb25zPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4+YCBjb25zdHJhaW50cyBmcm9tIGludGVyZmFjZSBkZWZpbml0aW9uXG4vLyAgIHdvbid0IHByb3BhZ2F0ZSwgaWYgYFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8YW55PmA6IHRoZSBQIHdvdWxkIGJlICdhbnknLCB3aGljaCBpcyBpbmNvcnJlY3Rcbi8vICogUEMgY291bGQgYmUgc3VwZXIgc3BlY2lmaWMgd2l0aCBzdXBlciBzcGVjaWZpYyBQLCB3aGljaCBpbXBsZW1lbnRzIEN1cnZlUG9pbnQ8YW55LCBQPi5cbi8vICAgdGhpcyBtZWFucyB3ZSBuZWVkIHRvIGRvIHN0dWZmIGxpa2Vcbi8vICAgYGZ1bmN0aW9uIHRlc3Q8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oYFxuLy8gICBpZiB3ZSB3YW50IHR5cGUgc2FmZXR5IGFyb3VuZCBQLCBvdGhlcndpc2UgUENfUDxQQz4gd2lsbCBiZSBhbnlcblxuLyoqIFJldHVybnMgRnAgdHlwZSBmcm9tIFBvaW50IChQX0Y8UD4gPT0gUC5GKSAqL1xuZXhwb3J0IHR5cGUgUF9GPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4+ID0gUCBleHRlbmRzIEN1cnZlUG9pbnQ8aW5mZXIgRiwgUD4gPyBGIDogbmV2ZXI7XG4vKiogUmV0dXJucyBGcCB0eXBlIGZyb20gUG9pbnRDb25zIChQQ19GPFBDPiA9PSBQQy5QLkYpICovXG5leHBvcnQgdHlwZSBQQ19GPFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8Q3VydmVQb2ludDxhbnksIGFueT4+PiA9IFBDWydGcCddWydaRVJPJ107XG4vKiogUmV0dXJucyBQb2ludCB0eXBlIGZyb20gUG9pbnRDb25zIChQQ19QPFBDPiA9PSBQQy5QKSAqL1xuZXhwb3J0IHR5cGUgUENfUDxQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+Pj4gPSBQQ1snWkVSTyddO1xuXG4vLyBVZ2x5IGhhY2sgdG8gZ2V0IHByb3BlciB0eXBlIGluZmVyZW5jZSwgYmVjYXVzZSBpbiB0eXBlc2NyaXB0IGZhaWxzIHRvIGluZmVyIHJlc3Vyc2l2ZWx5LlxuLy8gVGhlIGhhY2sgYWxsb3dzIHRvIGRvIHVwIHRvIDEwIGNoYWluZWQgb3BlcmF0aW9ucyB3aXRob3V0IGFwcGx5aW5nIHR5cGUgZXJhc3VyZS5cbi8vXG4vLyBUeXBlcyB3aGljaCB3b24ndCB3b3JrOlxuLy8gKiBgQ3VydmVQb2ludENvbnM8Q3VydmVQb2ludDxhbnksIGFueT4+YCwgd2lsbCByZXR1cm4gYGFueWAgYWZ0ZXIgMSBvcGVyYXRpb25cbi8vICogYEN1cnZlUG9pbnRDb25zPGFueT46IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4gZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxhbnk+ID0gZmFsc2VgXG4vLyAqIGBQIGV4dGVuZHMgQ3VydmVQb2ludCwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPmBcbi8vICAgICAqIEl0IGNhbid0IGluZmVyIFAgZnJvbSBQQyBhbG9uZVxuLy8gICAgICogVG9vIG1hbnkgcmVsYXRpb25zIGJldHdlZW4gRiwgUCAmIFBDXG4vLyAgICAgKiBJdCB3aWxsIGluZmVyIFAvRiBpZiBgYXJnOiBDdXJ2ZVBvaW50Q29uczxGLCBQPmAsIGJ1dCB3aWxsIGZhaWwgaWYgUEMgaXMgZ2VuZXJpY1xuLy8gICAgICogSXQgd2lsbCB3b3JrIGNvcnJlY3RseSBpZiB0aGVyZSBpcyBhbiBhZGRpdGlvbmFsIGFyZ3VtZW50IG9mIHR5cGUgUFxuLy8gICAgICogQnV0IGdlbmVyYWxseSwgd2UgZG9uJ3Qgd2FudCB0byBwYXJhbWV0cml6ZSBgQ3VydmVQb2ludENvbnNgIG92ZXIgYEZgOiBpdCB3aWxsIGNvbXBsaWNhdGVcbi8vICAgICAgIHR5cGVzLCBtYWtpbmcgdGhlbSB1bi1pbmZlcmFibGVcbi8vIHByZXR0aWVyLWlnbm9yZVxuZXhwb3J0IHR5cGUgUENfQU5ZID0gQ3VydmVQb2ludENvbnM8XG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LCBhbnk+XG4gID4+Pj4+Pj4+PlxuPjtcblxuZXhwb3J0IGludGVyZmFjZSBDdXJ2ZUxlbmd0aHMge1xuICBzZWNyZXRLZXk/OiBudW1iZXI7XG4gIHB1YmxpY0tleT86IG51bWJlcjtcbiAgcHVibGljS2V5VW5jb21wcmVzc2VkPzogbnVtYmVyO1xuICBwdWJsaWNLZXlIYXNQcmVmaXg/OiBib29sZWFuO1xuICBzaWduYXR1cmU/OiBudW1iZXI7XG4gIHNlZWQ/OiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIE1hcHBlcjxUPiA9IChpOiBUW10pID0+IFRbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZUN0PFQgZXh0ZW5kcyB7IG5lZ2F0ZTogKCkgPT4gVCB9Pihjb25kaXRpb246IGJvb2xlYW4sIGl0ZW06IFQpOiBUIHtcbiAgY29uc3QgbmVnID0gaXRlbS5uZWdhdGUoKTtcbiAgcmV0dXJuIGNvbmRpdGlvbiA/IG5lZyA6IGl0ZW07XG59XG5cbi8qKlxuICogVGFrZXMgYSBidW5jaCBvZiBQcm9qZWN0aXZlIFBvaW50cyBidXQgZXhlY3V0ZXMgb25seSBvbmVcbiAqIGludmVyc2lvbiBvbiBhbGwgb2YgdGhlbS4gSW52ZXJzaW9uIGlzIHZlcnkgc2xvdyBvcGVyYXRpb24sXG4gKiBzbyB0aGlzIGltcHJvdmVzIHBlcmZvcm1hbmNlIG1hc3NpdmVseS5cbiAqIE9wdGltaXphdGlvbjogY29udmVydHMgYSBsaXN0IG9mIHByb2plY3RpdmUgcG9pbnRzIHRvIGEgbGlzdCBvZiBpZGVudGljYWwgcG9pbnRzIHdpdGggWj0xLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplWjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgYzogUEMsXG4gIHBvaW50czogUFtdXG4pOiBQW10ge1xuICBjb25zdCBpbnZlcnRlZFpzID0gRnBJbnZlcnRCYXRjaChcbiAgICBjLkZwLFxuICAgIHBvaW50cy5tYXAoKHApID0+IHAuWiEpXG4gICk7XG4gIHJldHVybiBwb2ludHMubWFwKChwLCBpKSA9PiBjLmZyb21BZmZpbmUocC50b0FmZmluZShpbnZlcnRlZFpzW2ldKSkpO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVcoVzogbnVtYmVyLCBiaXRzOiBudW1iZXIpIHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihXKSB8fCBXIDw9IDAgfHwgVyA+IGJpdHMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHdpbmRvdyBzaXplLCBleHBlY3RlZCBbMS4uJyArIGJpdHMgKyAnXSwgZ290IFc9JyArIFcpO1xufVxuXG4vKiogSW50ZXJuYWwgd05BRiBvcHRzIGZvciBzcGVjaWZpYyBXIGFuZCBzY2FsYXJCaXRzICovXG50eXBlIFdPcHRzID0ge1xuICB3aW5kb3dzOiBudW1iZXI7XG4gIHdpbmRvd1NpemU6IG51bWJlcjtcbiAgbWFzazogYmlnaW50O1xuICBtYXhOdW1iZXI6IG51bWJlcjtcbiAgc2hpZnRCeTogYmlnaW50O1xufTtcblxuZnVuY3Rpb24gY2FsY1dPcHRzKFc6IG51bWJlciwgc2NhbGFyQml0czogbnVtYmVyKTogV09wdHMge1xuICB2YWxpZGF0ZVcoVywgc2NhbGFyQml0cyk7XG4gIGNvbnN0IHdpbmRvd3MgPSBNYXRoLmNlaWwoc2NhbGFyQml0cyAvIFcpICsgMTsgLy8gVz04IDMzLiBOb3QgMzIsIGJlY2F1c2Ugd2Ugc2tpcCB6ZXJvXG4gIGNvbnN0IHdpbmRvd1NpemUgPSAyICoqIChXIC0gMSk7IC8vIFc9OCAxMjguIE5vdCAyNTYsIGJlY2F1c2Ugd2Ugc2tpcCB6ZXJvXG4gIGNvbnN0IG1heE51bWJlciA9IDIgKiogVzsgLy8gVz04IDI1NlxuICBjb25zdCBtYXNrID0gYml0TWFzayhXKTsgLy8gVz04IDI1NSA9PSBtYXNrIDBiMTExMTExMTFcbiAgY29uc3Qgc2hpZnRCeSA9IEJpZ0ludChXKTsgLy8gVz04IDhcbiAgcmV0dXJuIHsgd2luZG93cywgd2luZG93U2l6ZSwgbWFzaywgbWF4TnVtYmVyLCBzaGlmdEJ5IH07XG59XG5cbmZ1bmN0aW9uIGNhbGNPZmZzZXRzKG46IGJpZ2ludCwgd2luZG93OiBudW1iZXIsIHdPcHRzOiBXT3B0cykge1xuICBjb25zdCB7IHdpbmRvd1NpemUsIG1hc2ssIG1heE51bWJlciwgc2hpZnRCeSB9ID0gd09wdHM7XG4gIGxldCB3Yml0cyA9IE51bWJlcihuICYgbWFzayk7IC8vIGV4dHJhY3QgVyBiaXRzLlxuICBsZXQgbmV4dE4gPSBuID4+IHNoaWZ0Qnk7IC8vIHNoaWZ0IG51bWJlciBieSBXIGJpdHMuXG5cbiAgLy8gV2hhdCBhY3R1YWxseSBoYXBwZW5zIGhlcmU6XG4gIC8vIGNvbnN0IGhpZ2hlc3RCaXQgPSBOdW1iZXIobWFzayBeIChtYXNrID4+IDFuKSk7XG4gIC8vIGxldCB3Yml0czIgPSB3Yml0cyAtIDE7IC8vIHNraXAgemVyb1xuICAvLyBpZiAod2JpdHMyICYgaGlnaGVzdEJpdCkgeyB3Yml0czIgXj0gTnVtYmVyKG1hc2spOyAvLyAofik7XG5cbiAgLy8gc3BsaXQgaWYgYml0cyA+IG1heDogKzIyNCA9PiAyNTYtMzJcbiAgaWYgKHdiaXRzID4gd2luZG93U2l6ZSkge1xuICAgIC8vIHdlIHNraXAgemVybywgd2hpY2ggbWVhbnMgaW5zdGVhZCBvZiBgPj0gc2l6ZS0xYCwgd2UgZG8gYD4gc2l6ZWBcbiAgICB3Yml0cyAtPSBtYXhOdW1iZXI7IC8vIC0zMiwgY2FuIGJlIG1heE51bWJlciAtIHdiaXRzLCBidXQgdGhlbiB3ZSBuZWVkIHRvIHNldCBpc05lZyBoZXJlLlxuICAgIG5leHROICs9IF8xbjsgLy8gKzI1NiAoY2FycnkpXG4gIH1cbiAgY29uc3Qgb2Zmc2V0U3RhcnQgPSB3aW5kb3cgKiB3aW5kb3dTaXplO1xuICBjb25zdCBvZmZzZXQgPSBvZmZzZXRTdGFydCArIE1hdGguYWJzKHdiaXRzKSAtIDE7IC8vIC0xIGJlY2F1c2Ugd2Ugc2tpcCB6ZXJvXG4gIGNvbnN0IGlzWmVybyA9IHdiaXRzID09PSAwOyAvLyBpcyBjdXJyZW50IHdpbmRvdyBzbGljZSBhIDA/XG4gIGNvbnN0IGlzTmVnID0gd2JpdHMgPCAwOyAvLyBpcyBjdXJyZW50IHdpbmRvdyBzbGljZSBuZWdhdGl2ZT9cbiAgY29uc3QgaXNOZWdGID0gd2luZG93ICUgMiAhPT0gMDsgLy8gZmFrZSByYW5kb20gc3RhdGVtZW50IGZvciBub2lzZVxuICBjb25zdCBvZmZzZXRGID0gb2Zmc2V0U3RhcnQ7IC8vIGZha2Ugb2Zmc2V0IGZvciBub2lzZVxuICByZXR1cm4geyBuZXh0Tiwgb2Zmc2V0LCBpc1plcm8sIGlzTmVnLCBpc05lZ0YsIG9mZnNldEYgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVNU01Qb2ludHMocG9pbnRzOiBhbnlbXSwgYzogYW55KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShwb2ludHMpKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IGV4cGVjdGVkJyk7XG4gIHBvaW50cy5mb3JFYWNoKChwLCBpKSA9PiB7XG4gICAgaWYgKCEocCBpbnN0YW5jZW9mIGMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcG9pbnQgYXQgaW5kZXggJyArIGkpO1xuICB9KTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlTVNNU2NhbGFycyhzY2FsYXJzOiBhbnlbXSwgZmllbGQ6IGFueSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc2NhbGFycykpIHRocm93IG5ldyBFcnJvcignYXJyYXkgb2Ygc2NhbGFycyBleHBlY3RlZCcpO1xuICBzY2FsYXJzLmZvckVhY2goKHMsIGkpID0+IHtcbiAgICBpZiAoIWZpZWxkLmlzVmFsaWQocykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzY2FsYXIgYXQgaW5kZXggJyArIGkpO1xuICB9KTtcbn1cblxuLy8gU2luY2UgcG9pbnRzIGluIGRpZmZlcmVudCBncm91cHMgY2Fubm90IGJlIGVxdWFsIChkaWZmZXJlbnQgb2JqZWN0IGNvbnN0cnVjdG9yKSxcbi8vIHdlIGNhbiBoYXZlIHNpbmdsZSBwbGFjZSB0byBzdG9yZSBwcmVjb21wdXRlcy5cbi8vIEFsbG93cyB0byBtYWtlIHBvaW50cyBmcm96ZW4gLyBpbW11dGFibGUuXG5jb25zdCBwb2ludFByZWNvbXB1dGVzID0gbmV3IFdlYWtNYXA8YW55LCBhbnlbXT4oKTtcbmNvbnN0IHBvaW50V2luZG93U2l6ZXMgPSBuZXcgV2Vha01hcDxhbnksIG51bWJlcj4oKTtcblxuZnVuY3Rpb24gZ2V0VyhQOiBhbnkpOiBudW1iZXIge1xuICAvLyBUbyBkaXNhYmxlIHByZWNvbXB1dGVzOlxuICAvLyByZXR1cm4gMTtcbiAgcmV0dXJuIHBvaW50V2luZG93U2l6ZXMuZ2V0KFApIHx8IDE7XG59XG5cbmZ1bmN0aW9uIGFzc2VydDAobjogYmlnaW50KTogdm9pZCB7XG4gIGlmIChuICE9PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB3TkFGJyk7XG59XG5cbi8qKlxuICogRWxsaXB0aWMgY3VydmUgbXVsdGlwbGljYXRpb24gb2YgUG9pbnQgYnkgc2NhbGFyLiBGcmFnaWxlLlxuICogVGFibGUgZ2VuZXJhdGlvbiB0YWtlcyAqKjMwTUIgb2YgcmFtIGFuZCAxMG1zIG9uIGhpZ2gtZW5kIENQVSoqLFxuICogYnV0IG1heSB0YWtlIG11Y2ggbG9uZ2VyIG9uIHNsb3cgZGV2aWNlcy4gQWN0dWFsIGdlbmVyYXRpb24gd2lsbCBoYXBwZW4gb25cbiAqIGZpcnN0IGNhbGwgb2YgYG11bHRpcGx5KClgLiBCeSBkZWZhdWx0LCBgQkFTRWAgcG9pbnQgaXMgcHJlY29tcHV0ZWQuXG4gKlxuICogU2NhbGFycyBzaG91bGQgYWx3YXlzIGJlIGxlc3MgdGhhbiBjdXJ2ZSBvcmRlcjogdGhpcyBzaG91bGQgYmUgY2hlY2tlZCBpbnNpZGUgb2YgYSBjdXJ2ZSBpdHNlbGYuXG4gKiBDcmVhdGVzIHByZWNvbXB1dGF0aW9uIHRhYmxlcyBmb3IgZmFzdCBtdWx0aXBsaWNhdGlvbjpcbiAqIC0gcHJpdmF0ZSBzY2FsYXIgaXMgc3BsaXQgYnkgZml4ZWQgc2l6ZSB3aW5kb3dzIG9mIFcgYml0c1xuICogLSBldmVyeSB3aW5kb3cgcG9pbnQgaXMgY29sbGVjdGVkIGZyb20gd2luZG93J3MgdGFibGUgJiBhZGRlZCB0byBhY2N1bXVsYXRvclxuICogLSBzaW5jZSB3aW5kb3dzIGFyZSBkaWZmZXJlbnQsIHNhbWUgcG9pbnQgaW5zaWRlIHRhYmxlcyB3b24ndCBiZSBhY2Nlc3NlZCBtb3JlIHRoYW4gb25jZSBwZXIgY2FsY1xuICogLSBlYWNoIG11bHRpcGxpY2F0aW9uIGlzICdNYXRoLmNlaWwoQ1VSVkVfT1JERVIgLyBcdUQ4MzVcdURDNEEpICsgMScgcG9pbnQgYWRkaXRpb25zIChmaXhlZCBmb3IgYW55IHNjYWxhcilcbiAqIC0gKzEgd2luZG93IGlzIG5lY2Nlc3NhcnkgZm9yIHdOQUZcbiAqIC0gd05BRiByZWR1Y2VzIHRhYmxlIHNpemU6IDJ4IGxlc3MgbWVtb3J5ICsgMnggZmFzdGVyIGdlbmVyYXRpb24sIGJ1dCAxMCUgc2xvd2VyIG11bHRpcGxpY2F0aW9uXG4gKlxuICogQHRvZG8gUmVzZWFyY2ggcmV0dXJuaW5nIDJkIEpTIGFycmF5IG9mIHdpbmRvd3MsIGluc3RlYWQgb2YgYSBzaW5nbGUgd2luZG93LlxuICogVGhpcyB3b3VsZCBhbGxvdyB3aW5kb3dzIHRvIGJlIGluIGRpZmZlcmVudCBtZW1vcnkgbG9jYXRpb25zXG4gKi9cbmV4cG9ydCBjbGFzcyB3TkFGPFBDIGV4dGVuZHMgUENfQU5ZPiB7XG4gIHByaXZhdGUgcmVhZG9ubHkgQkFTRTogUENfUDxQQz47XG4gIHByaXZhdGUgcmVhZG9ubHkgWkVSTzogUENfUDxQQz47XG4gIHByaXZhdGUgcmVhZG9ubHkgRm46IFBDWydGbiddO1xuICByZWFkb25seSBiaXRzOiBudW1iZXI7XG5cbiAgLy8gUGFyYW1ldHJpemVkIHdpdGggYSBnaXZlbiBQb2ludCBjbGFzcyAobm90IGluZGl2aWR1YWwgcG9pbnQpXG4gIGNvbnN0cnVjdG9yKFBvaW50OiBQQywgYml0czogbnVtYmVyKSB7XG4gICAgdGhpcy5CQVNFID0gUG9pbnQuQkFTRTtcbiAgICB0aGlzLlpFUk8gPSBQb2ludC5aRVJPO1xuICAgIHRoaXMuRm4gPSBQb2ludC5GbjtcbiAgICB0aGlzLmJpdHMgPSBiaXRzO1xuICB9XG5cbiAgLy8gbm9uLWNvbnN0IHRpbWUgbXVsdGlwbGljYXRpb24gbGFkZGVyXG4gIF91bnNhZmVMYWRkZXIoZWxtOiBQQ19QPFBDPiwgbjogYmlnaW50LCBwOiBQQ19QPFBDPiA9IHRoaXMuWkVSTyk6IFBDX1A8UEM+IHtcbiAgICBsZXQgZDogUENfUDxQQz4gPSBlbG07XG4gICAgd2hpbGUgKG4gPiBfMG4pIHtcbiAgICAgIGlmIChuICYgXzFuKSBwID0gcC5hZGQoZCk7XG4gICAgICBkID0gZC5kb3VibGUoKTtcbiAgICAgIG4gPj49IF8xbjtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHdOQUYgcHJlY29tcHV0YXRpb24gd2luZG93LiBVc2VkIGZvciBjYWNoaW5nLlxuICAgKiBEZWZhdWx0IHdpbmRvdyBzaXplIGlzIHNldCBieSBgdXRpbHMucHJlY29tcHV0ZSgpYCBhbmQgaXMgZXF1YWwgdG8gOC5cbiAgICogTnVtYmVyIG9mIHByZWNvbXB1dGVkIHBvaW50cyBkZXBlbmRzIG9uIHRoZSBjdXJ2ZSBzaXplOlxuICAgKiAyXihcdUQ4MzVcdURDNEFcdTIyMTIxKSAqIChNYXRoLmNlaWwoXHVEODM1XHVEQzVCIC8gXHVEODM1XHVEQzRBKSArIDEpLCB3aGVyZTpcbiAgICogLSBcdUQ4MzVcdURDNEEgaXMgdGhlIHdpbmRvdyBzaXplXG4gICAqIC0gXHVEODM1XHVEQzVCIGlzIHRoZSBiaXRsZW5ndGggb2YgdGhlIGN1cnZlIG9yZGVyLlxuICAgKiBGb3IgYSAyNTYtYml0IGN1cnZlIGFuZCB3aW5kb3cgc2l6ZSA4LCB0aGUgbnVtYmVyIG9mIHByZWNvbXB1dGVkIHBvaW50cyBpcyAxMjggKiAzMyA9IDQyMjQuXG4gICAqIEBwYXJhbSBwb2ludCBQb2ludCBpbnN0YW5jZVxuICAgKiBAcGFyYW0gVyB3aW5kb3cgc2l6ZVxuICAgKiBAcmV0dXJucyBwcmVjb21wdXRlZCBwb2ludCB0YWJsZXMgZmxhdHRlbmVkIHRvIGEgc2luZ2xlIGFycmF5XG4gICAqL1xuICBwcml2YXRlIHByZWNvbXB1dGVXaW5kb3cocG9pbnQ6IFBDX1A8UEM+LCBXOiBudW1iZXIpOiBQQ19QPFBDPltdIHtcbiAgICBjb25zdCB7IHdpbmRvd3MsIHdpbmRvd1NpemUgfSA9IGNhbGNXT3B0cyhXLCB0aGlzLmJpdHMpO1xuICAgIGNvbnN0IHBvaW50czogUENfUDxQQz5bXSA9IFtdO1xuICAgIGxldCBwOiBQQ19QPFBDPiA9IHBvaW50O1xuICAgIGxldCBiYXNlID0gcDtcbiAgICBmb3IgKGxldCB3aW5kb3cgPSAwOyB3aW5kb3cgPCB3aW5kb3dzOyB3aW5kb3crKykge1xuICAgICAgYmFzZSA9IHA7XG4gICAgICBwb2ludHMucHVzaChiYXNlKTtcbiAgICAgIC8vIGk9MSwgYmMgd2Ugc2tpcCAwXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHdpbmRvd1NpemU7IGkrKykge1xuICAgICAgICBiYXNlID0gYmFzZS5hZGQocCk7XG4gICAgICAgIHBvaW50cy5wdXNoKGJhc2UpO1xuICAgICAgfVxuICAgICAgcCA9IGJhc2UuZG91YmxlKCk7XG4gICAgfVxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50cyBlYyBtdWx0aXBsaWNhdGlvbiB1c2luZyBwcmVjb21wdXRlZCB0YWJsZXMgYW5kIHctYXJ5IG5vbi1hZGphY2VudCBmb3JtLlxuICAgKiBNb3JlIGNvbXBhY3QgaW1wbGVtZW50YXRpb246XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsbWlsbHIvbm9ibGUtc2VjcDI1NmsxL2Jsb2IvNDdjYjE2NjliNmU1MDZhZDY2YjM1ZmU3ZDc2MTMyYWU5NzQ2NWRhMi9pbmRleC50cyNMNTAyLUw1NDFcbiAgICogQHJldHVybnMgcmVhbCBhbmQgZmFrZSAoZm9yIGNvbnN0LXRpbWUpIHBvaW50c1xuICAgKi9cbiAgcHJpdmF0ZSB3TkFGKFc6IG51bWJlciwgcHJlY29tcHV0ZXM6IFBDX1A8UEM+W10sIG46IGJpZ2ludCk6IHsgcDogUENfUDxQQz47IGY6IFBDX1A8UEM+IH0ge1xuICAgIC8vIFNjYWxhciBzaG91bGQgYmUgc21hbGxlciB0aGFuIGZpZWxkIG9yZGVyXG4gICAgaWYgKCF0aGlzLkZuLmlzVmFsaWQobikpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzY2FsYXInKTtcbiAgICAvLyBBY2N1bXVsYXRvcnNcbiAgICBsZXQgcCA9IHRoaXMuWkVSTztcbiAgICBsZXQgZiA9IHRoaXMuQkFTRTtcbiAgICAvLyBUaGlzIGNvZGUgd2FzIGZpcnN0IHdyaXR0ZW4gd2l0aCBhc3N1bXB0aW9uIHRoYXQgJ2YnIGFuZCAncCcgd2lsbCBuZXZlciBiZSBpbmZpbml0eSBwb2ludDpcbiAgICAvLyBzaW5jZSBlYWNoIGFkZGl0aW9uIGlzIG11bHRpcGxpZWQgYnkgMiAqKiBXLCBpdCBjYW5ub3QgY2FuY2VsIGVhY2ggb3RoZXIuIEhvd2V2ZXIsXG4gICAgLy8gdGhlcmUgaXMgbmVnYXRlIG5vdzogaXQgaXMgcG9zc2libGUgdGhhdCBuZWdhdGVkIGVsZW1lbnQgZnJvbSBsb3cgdmFsdWVcbiAgICAvLyB3b3VsZCBiZSB0aGUgc2FtZSBhcyBoaWdoIGVsZW1lbnQsIHdoaWNoIHdpbGwgY3JlYXRlIGNhcnJ5IGludG8gbmV4dCB3aW5kb3cuXG4gICAgLy8gSXQncyBub3Qgb2J2aW91cyBob3cgdGhpcyBjYW4gZmFpbCwgYnV0IHN0aWxsIHdvcnRoIGludmVzdGlnYXRpbmcgbGF0ZXIuXG4gICAgY29uc3Qgd28gPSBjYWxjV09wdHMoVywgdGhpcy5iaXRzKTtcbiAgICBmb3IgKGxldCB3aW5kb3cgPSAwOyB3aW5kb3cgPCB3by53aW5kb3dzOyB3aW5kb3crKykge1xuICAgICAgLy8gKG4gPT09IF8wbikgaXMgaGFuZGxlZCBhbmQgbm90IGVhcmx5LWV4aXRlZC4gaXNFdmVuIGFuZCBvZmZzZXRGIGFyZSB1c2VkIGZvciBub2lzZVxuICAgICAgY29uc3QgeyBuZXh0Tiwgb2Zmc2V0LCBpc1plcm8sIGlzTmVnLCBpc05lZ0YsIG9mZnNldEYgfSA9IGNhbGNPZmZzZXRzKG4sIHdpbmRvdywgd28pO1xuICAgICAgbiA9IG5leHROO1xuICAgICAgaWYgKGlzWmVybykge1xuICAgICAgICAvLyBiaXRzIGFyZSAwOiBhZGQgZ2FyYmFnZSB0byBmYWtlIHBvaW50XG4gICAgICAgIC8vIEltcG9ydGFudCBwYXJ0IGZvciBjb25zdC10aW1lIGdldFB1YmxpY0tleTogYWRkIHJhbmRvbSBcIm5vaXNlXCIgcG9pbnQgdG8gZi5cbiAgICAgICAgZiA9IGYuYWRkKG5lZ2F0ZUN0KGlzTmVnRiwgcHJlY29tcHV0ZXNbb2Zmc2V0Rl0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGJpdHMgYXJlIDE6IGFkZCB0byByZXN1bHQgcG9pbnRcbiAgICAgICAgcCA9IHAuYWRkKG5lZ2F0ZUN0KGlzTmVnLCBwcmVjb21wdXRlc1tvZmZzZXRdKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydDAobik7XG4gICAgLy8gUmV0dXJuIGJvdGggcmVhbCBhbmQgZmFrZSBwb2ludHM6IEpJVCB3b24ndCBlbGltaW5hdGUgZi5cbiAgICAvLyBBdCB0aGlzIHBvaW50IHRoZXJlIGlzIGEgd2F5IHRvIEYgYmUgaW5maW5pdHktcG9pbnQgZXZlbiBpZiBwIGlzIG5vdCxcbiAgICAvLyB3aGljaCBtYWtlcyBpdCBsZXNzIGNvbnN0LXRpbWU6IGFyb3VuZCAxIGJpZ2ludCBtdWx0aXBseS5cbiAgICByZXR1cm4geyBwLCBmIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50cyBlYyB1bnNhZmUgKG5vbiBjb25zdC10aW1lKSBtdWx0aXBsaWNhdGlvbiB1c2luZyBwcmVjb21wdXRlZCB0YWJsZXMgYW5kIHctYXJ5IG5vbi1hZGphY2VudCBmb3JtLlxuICAgKiBAcGFyYW0gYWNjIGFjY3VtdWxhdG9yIHBvaW50IHRvIGFkZCByZXN1bHQgb2YgbXVsdGlwbGljYXRpb25cbiAgICogQHJldHVybnMgcG9pbnRcbiAgICovXG4gIHByaXZhdGUgd05BRlVuc2FmZShcbiAgICBXOiBudW1iZXIsXG4gICAgcHJlY29tcHV0ZXM6IFBDX1A8UEM+W10sXG4gICAgbjogYmlnaW50LFxuICAgIGFjYzogUENfUDxQQz4gPSB0aGlzLlpFUk9cbiAgKTogUENfUDxQQz4ge1xuICAgIGNvbnN0IHdvID0gY2FsY1dPcHRzKFcsIHRoaXMuYml0cyk7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd28ud2luZG93czsgd2luZG93KyspIHtcbiAgICAgIGlmIChuID09PSBfMG4pIGJyZWFrOyAvLyBFYXJseS1leGl0LCBza2lwIDAgdmFsdWVcbiAgICAgIGNvbnN0IHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZyB9ID0gY2FsY09mZnNldHMobiwgd2luZG93LCB3byk7XG4gICAgICBuID0gbmV4dE47XG4gICAgICBpZiAoaXNaZXJvKSB7XG4gICAgICAgIC8vIFdpbmRvdyBiaXRzIGFyZSAwOiBza2lwIHByb2Nlc3NpbmcuXG4gICAgICAgIC8vIE1vdmUgdG8gbmV4dCB3aW5kb3cuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHByZWNvbXB1dGVzW29mZnNldF07XG4gICAgICAgIGFjYyA9IGFjYy5hZGQoaXNOZWcgPyBpdGVtLm5lZ2F0ZSgpIDogaXRlbSk7IC8vIFJlLXVzaW5nIGFjYyBhbGxvd3MgdG8gc2F2ZSBhZGRzIGluIE1TTVxuICAgICAgfVxuICAgIH1cbiAgICBhc3NlcnQwKG4pO1xuICAgIHJldHVybiBhY2M7XG4gIH1cblxuICBwcml2YXRlIGdldFByZWNvbXB1dGVzKFc6IG51bWJlciwgcG9pbnQ6IFBDX1A8UEM+LCB0cmFuc2Zvcm0/OiBNYXBwZXI8UENfUDxQQz4+KTogUENfUDxQQz5bXSB7XG4gICAgLy8gQ2FsY3VsYXRlIHByZWNvbXB1dGVzIG9uIGEgZmlyc3QgcnVuLCByZXVzZSB0aGVtIGFmdGVyXG4gICAgbGV0IGNvbXAgPSBwb2ludFByZWNvbXB1dGVzLmdldChwb2ludCk7XG4gICAgaWYgKCFjb21wKSB7XG4gICAgICBjb21wID0gdGhpcy5wcmVjb21wdXRlV2luZG93KHBvaW50LCBXKSBhcyBQQ19QPFBDPltdO1xuICAgICAgaWYgKFcgIT09IDEpIHtcbiAgICAgICAgLy8gRG9pbmcgdHJhbnNmb3JtIG91dHNpZGUgb2YgaWYgYnJpbmdzIDE1JSBwZXJmIGhpdFxuICAgICAgICBpZiAodHlwZW9mIHRyYW5zZm9ybSA9PT0gJ2Z1bmN0aW9uJykgY29tcCA9IHRyYW5zZm9ybShjb21wKTtcbiAgICAgICAgcG9pbnRQcmVjb21wdXRlcy5zZXQocG9pbnQsIGNvbXApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tcDtcbiAgfVxuXG4gIGNhY2hlZChcbiAgICBwb2ludDogUENfUDxQQz4sXG4gICAgc2NhbGFyOiBiaWdpbnQsXG4gICAgdHJhbnNmb3JtPzogTWFwcGVyPFBDX1A8UEM+PlxuICApOiB7IHA6IFBDX1A8UEM+OyBmOiBQQ19QPFBDPiB9IHtcbiAgICBjb25zdCBXID0gZ2V0Vyhwb2ludCk7XG4gICAgcmV0dXJuIHRoaXMud05BRihXLCB0aGlzLmdldFByZWNvbXB1dGVzKFcsIHBvaW50LCB0cmFuc2Zvcm0pLCBzY2FsYXIpO1xuICB9XG5cbiAgdW5zYWZlKHBvaW50OiBQQ19QPFBDPiwgc2NhbGFyOiBiaWdpbnQsIHRyYW5zZm9ybT86IE1hcHBlcjxQQ19QPFBDPj4sIHByZXY/OiBQQ19QPFBDPik6IFBDX1A8UEM+IHtcbiAgICBjb25zdCBXID0gZ2V0Vyhwb2ludCk7XG4gICAgaWYgKFcgPT09IDEpIHJldHVybiB0aGlzLl91bnNhZmVMYWRkZXIocG9pbnQsIHNjYWxhciwgcHJldik7IC8vIEZvciBXPTEgbGFkZGVyIGlzIH54MiBmYXN0ZXJcbiAgICByZXR1cm4gdGhpcy53TkFGVW5zYWZlKFcsIHRoaXMuZ2V0UHJlY29tcHV0ZXMoVywgcG9pbnQsIHRyYW5zZm9ybSksIHNjYWxhciwgcHJldik7XG4gIH1cblxuICAvLyBXZSBjYWxjdWxhdGUgcHJlY29tcHV0ZXMgZm9yIGVsbGlwdGljIGN1cnZlIHBvaW50IG11bHRpcGxpY2F0aW9uXG4gIC8vIHVzaW5nIHdpbmRvd2VkIG1ldGhvZC4gVGhpcyBzcGVjaWZpZXMgd2luZG93IHNpemUgYW5kXG4gIC8vIHN0b3JlcyBwcmVjb21wdXRlZCB2YWx1ZXMuIFVzdWFsbHkgb25seSBiYXNlIHBvaW50IHdvdWxkIGJlIHByZWNvbXB1dGVkLlxuICBjcmVhdGVDYWNoZShQOiBQQ19QPFBDPiwgVzogbnVtYmVyKTogdm9pZCB7XG4gICAgdmFsaWRhdGVXKFcsIHRoaXMuYml0cyk7XG4gICAgcG9pbnRXaW5kb3dTaXplcy5zZXQoUCwgVyk7XG4gICAgcG9pbnRQcmVjb21wdXRlcy5kZWxldGUoUCk7XG4gIH1cblxuICBoYXNDYWNoZShlbG06IFBDX1A8UEM+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGdldFcoZWxtKSAhPT0gMTtcbiAgfVxufVxuXG4vKipcbiAqIEVuZG9tb3JwaGlzbS1zcGVjaWZpYyBtdWx0aXBsaWNhdGlvbiBmb3IgS29ibGl0eiBjdXJ2ZXMuXG4gKiBDb3N0OiAxMjggZGJsLCAwLTI1NiBhZGRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsRW5kb1Vuc2FmZTxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgUG9pbnQ6IFBDLFxuICBwb2ludDogUCxcbiAgazE6IGJpZ2ludCxcbiAgazI6IGJpZ2ludFxuKTogeyBwMTogUDsgcDI6IFAgfSB7XG4gIGxldCBhY2MgPSBwb2ludDtcbiAgbGV0IHAxID0gUG9pbnQuWkVSTztcbiAgbGV0IHAyID0gUG9pbnQuWkVSTztcbiAgd2hpbGUgKGsxID4gXzBuIHx8IGsyID4gXzBuKSB7XG4gICAgaWYgKGsxICYgXzFuKSBwMSA9IHAxLmFkZChhY2MpO1xuICAgIGlmIChrMiAmIF8xbikgcDIgPSBwMi5hZGQoYWNjKTtcbiAgICBhY2MgPSBhY2MuZG91YmxlKCk7XG4gICAgazEgPj49IF8xbjtcbiAgICBrMiA+Pj0gXzFuO1xuICB9XG4gIHJldHVybiB7IHAxLCBwMiB9O1xufVxuXG4vKipcbiAqIFBpcHBlbmdlciBhbGdvcml0aG0gZm9yIG11bHRpLXNjYWxhciBtdWx0aXBsaWNhdGlvbiAoTVNNLCBQYSArIFFiICsgUmMgKyAuLi4pLlxuICogMzB4IGZhc3RlciB2cyBuYWl2ZSBhZGRpdGlvbiBvbiBMPTQwOTYsIDEweCBmYXN0ZXIgdGhhbiBwcmVjb21wdXRlcy5cbiAqIEZvciBOPTI1NGJpdCwgTD0xLCBpdCBkb2VzOiAxMDI0IEFERCArIDI1NCBEQkwuIEZvciBMPTU6IDE1MzYgQUREICsgMjU0IERCTC5cbiAqIEFsZ29yaXRobWljYWxseSBjb25zdGFudC10aW1lIChmb3Igc2FtZSBMKSwgZXZlbiB3aGVuIDEgcG9pbnQgKyBzY2FsYXIsIG9yIHdoZW4gc2NhbGFyID0gMC5cbiAqIEBwYXJhbSBjIEN1cnZlIFBvaW50IGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0gZmllbGROIGZpZWxkIG92ZXIgQ1VSVkUuTiAtIGltcG9ydGFudCB0aGF0IGl0J3Mgbm90IG92ZXIgQ1VSVkUuUFxuICogQHBhcmFtIHBvaW50cyBhcnJheSBvZiBMIGN1cnZlIHBvaW50c1xuICogQHBhcmFtIHNjYWxhcnMgYXJyYXkgb2YgTCBzY2FsYXJzIChha2Egc2VjcmV0IGtleXMgLyBiaWdpbnRzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGlwcGVuZ2VyPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBjOiBQQyxcbiAgcG9pbnRzOiBQW10sXG4gIHNjYWxhcnM6IGJpZ2ludFtdXG4pOiBQIHtcbiAgLy8gSWYgd2Ugc3BsaXQgc2NhbGFycyBieSBzb21lIHdpbmRvdyAobGV0J3Mgc2F5IDggYml0cyksIGV2ZXJ5IGNodW5rIHdpbGwgb25seVxuICAvLyB0YWtlIDI1NiBidWNrZXRzIGV2ZW4gaWYgdGhlcmUgYXJlIDQwOTYgc2NhbGFycywgYWxzbyByZS11c2VzIGRvdWJsZS5cbiAgLy8gVE9ETzpcbiAgLy8gLSBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDI0Lzc1MC5wZGZcbiAgLy8gLSBodHRwczovL3RjaGVzLmlhY3Iub3JnL2luZGV4LnBocC9UQ0hFUy9hcnRpY2xlL3ZpZXcvMTAyODdcbiAgLy8gMCBpcyBhY2NlcHRlZCBpbiBzY2FsYXJzXG4gIGNvbnN0IGZpZWxkTiA9IGMuRm47XG4gIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50cywgYyk7XG4gIHZhbGlkYXRlTVNNU2NhbGFycyhzY2FsYXJzLCBmaWVsZE4pO1xuICBjb25zdCBwbGVuZ3RoID0gcG9pbnRzLmxlbmd0aDtcbiAgY29uc3Qgc2xlbmd0aCA9IHNjYWxhcnMubGVuZ3RoO1xuICBpZiAocGxlbmd0aCAhPT0gc2xlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdhcnJheXMgb2YgcG9pbnRzIGFuZCBzY2FsYXJzIG11c3QgaGF2ZSBlcXVhbCBsZW5ndGgnKTtcbiAgLy8gaWYgKHBsZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignYXJyYXkgbXVzdCBiZSBvZiBsZW5ndGggPj0gMicpO1xuICBjb25zdCB6ZXJvID0gYy5aRVJPO1xuICBjb25zdCB3Yml0cyA9IGJpdExlbihCaWdJbnQocGxlbmd0aCkpO1xuICBsZXQgd2luZG93U2l6ZSA9IDE7IC8vIGJpdHNcbiAgaWYgKHdiaXRzID4gMTIpIHdpbmRvd1NpemUgPSB3Yml0cyAtIDM7XG4gIGVsc2UgaWYgKHdiaXRzID4gNCkgd2luZG93U2l6ZSA9IHdiaXRzIC0gMjtcbiAgZWxzZSBpZiAod2JpdHMgPiAwKSB3aW5kb3dTaXplID0gMjtcbiAgY29uc3QgTUFTSyA9IGJpdE1hc2sod2luZG93U2l6ZSk7XG4gIGNvbnN0IGJ1Y2tldHMgPSBuZXcgQXJyYXkoTnVtYmVyKE1BU0spICsgMSkuZmlsbCh6ZXJvKTsgLy8gKzEgZm9yIHplcm8gYXJyYXlcbiAgY29uc3QgbGFzdEJpdHMgPSBNYXRoLmZsb29yKChmaWVsZE4uQklUUyAtIDEpIC8gd2luZG93U2l6ZSkgKiB3aW5kb3dTaXplO1xuICBsZXQgc3VtID0gemVybztcbiAgZm9yIChsZXQgaSA9IGxhc3RCaXRzOyBpID49IDA7IGkgLT0gd2luZG93U2l6ZSkge1xuICAgIGJ1Y2tldHMuZmlsbCh6ZXJvKTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNsZW5ndGg7IGorKykge1xuICAgICAgY29uc3Qgc2NhbGFyID0gc2NhbGFyc1tqXTtcbiAgICAgIGNvbnN0IHdiaXRzID0gTnVtYmVyKChzY2FsYXIgPj4gQmlnSW50KGkpKSAmIE1BU0spO1xuICAgICAgYnVja2V0c1t3Yml0c10gPSBidWNrZXRzW3diaXRzXS5hZGQocG9pbnRzW2pdKTtcbiAgICB9XG4gICAgbGV0IHJlc0kgPSB6ZXJvOyAvLyBub3QgdXNpbmcgdGhpcyB3aWxsIGRvIHNtYWxsIHNwZWVkLXVwLCBidXQgd2lsbCBsb3NlIGN0XG4gICAgLy8gU2tpcCBmaXJzdCBidWNrZXQsIGJlY2F1c2UgaXQgaXMgemVyb1xuICAgIGZvciAobGV0IGogPSBidWNrZXRzLmxlbmd0aCAtIDEsIHN1bUkgPSB6ZXJvOyBqID4gMDsgai0tKSB7XG4gICAgICBzdW1JID0gc3VtSS5hZGQoYnVja2V0c1tqXSk7XG4gICAgICByZXNJID0gcmVzSS5hZGQoc3VtSSk7XG4gICAgfVxuICAgIHN1bSA9IHN1bS5hZGQocmVzSSk7XG4gICAgaWYgKGkgIT09IDApIGZvciAobGV0IGogPSAwOyBqIDwgd2luZG93U2l6ZTsgaisrKSBzdW0gPSBzdW0uZG91YmxlKCk7XG4gIH1cbiAgcmV0dXJuIHN1bSBhcyBQO1xufVxuLyoqXG4gKiBQcmVjb21wdXRlZCBtdWx0aS1zY2FsYXIgbXVsdGlwbGljYXRpb24gKE1TTSwgUGEgKyBRYiArIFJjICsgLi4uKS5cbiAqIEBwYXJhbSBjIEN1cnZlIFBvaW50IGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0gZmllbGROIGZpZWxkIG92ZXIgQ1VSVkUuTiAtIGltcG9ydGFudCB0aGF0IGl0J3Mgbm90IG92ZXIgQ1VSVkUuUFxuICogQHBhcmFtIHBvaW50cyBhcnJheSBvZiBMIGN1cnZlIHBvaW50c1xuICogQHJldHVybnMgZnVuY3Rpb24gd2hpY2ggbXVsdGlwbGllcyBwb2ludHMgd2l0aCBzY2FhcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZWNvbXB1dGVNU01VbnNhZmU8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIGM6IFBDLFxuICBwb2ludHM6IFBbXSxcbiAgd2luZG93U2l6ZTogbnVtYmVyXG4pOiAoc2NhbGFyczogYmlnaW50W10pID0+IFAge1xuICAvKipcbiAgICogUGVyZm9ybWFuY2UgQW5hbHlzaXMgb2YgV2luZG93LWJhc2VkIFByZWNvbXB1dGF0aW9uXG4gICAqXG4gICAqIEJhc2UgQ2FzZSAoMjU2LWJpdCBzY2FsYXIsIDgtYml0IHdpbmRvdyk6XG4gICAqIC0gU3RhbmRhcmQgcHJlY29tcHV0YXRpb24gcmVxdWlyZXM6XG4gICAqICAgLSAzMSBhZGRpdGlvbnMgcGVyIHNjYWxhciBcdTAwRDcgMjU2IHNjYWxhcnMgPSA3LDkzNiBvcHNcbiAgICogICAtIFBsdXMgMjU1IHN1bW1hcnkgYWRkaXRpb25zID0gOCwxOTEgdG90YWwgb3BzXG4gICAqICAgTm90ZTogU3VtbWFyeSBhZGRpdGlvbnMgY2FuIGJlIG9wdGltaXplZCB2aWEgYWNjdW11bGF0b3JcbiAgICpcbiAgICogQ2h1bmtlZCBQcmVjb21wdXRhdGlvbiBBbmFseXNpczpcbiAgICogLSBVc2luZyAzMiBjaHVua3MgcmVxdWlyZXM6XG4gICAqICAgLSAyNTUgYWRkaXRpb25zIHBlciBjaHVua1xuICAgKiAgIC0gMjU2IGRvdWJsaW5nc1xuICAgKiAgIC0gVG90YWw6ICgyNTUgXHUwMEQ3IDMyKSArIDI1NiA9IDgsNDE2IG9wc1xuICAgKlxuICAgKiBNZW1vcnkgVXNhZ2UgQ29tcGFyaXNvbjpcbiAgICogV2luZG93IFNpemUgfCBTdGFuZGFyZCBQb2ludHMgfCBDaHVua2VkIFBvaW50c1xuICAgKiAtLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tXG4gICAqICAgICA0LWJpdCAgIHwgICAgIDUyMCAgICAgICAgIHwgICAgICAxNVxuICAgKiAgICAgOC1iaXQgICB8ICAgIDQsMjI0ICAgICAgICB8ICAgICAyNTVcbiAgICogICAgMTAtYml0ICAgfCAgIDEzLDgyNCAgICAgICAgfCAgIDEsMDIzXG4gICAqICAgIDE2LWJpdCAgIHwgIDU1NywwNTYgICAgICAgIHwgIDY1LDUzNVxuICAgKlxuICAgKiBLZXkgQWR2YW50YWdlczpcbiAgICogMS4gRW5hYmxlcyBsYXJnZXIgd2luZG93IHNpemVzIGR1ZSB0byByZWR1Y2VkIG1lbW9yeSBvdmVyaGVhZFxuICAgKiAyLiBNb3JlIGVmZmljaWVudCBmb3Igc21hbGxlciBzY2FsYXIgY291bnRzOlxuICAgKiAgICAtIDE2IGNodW5rczogKDE2IFx1MDBENyAyNTUpICsgMjU2ID0gNCwzMzYgb3BzXG4gICAqICAgIC0gfjJ4IGZhc3RlciB0aGFuIHN0YW5kYXJkIDgsMTkxIG9wc1xuICAgKlxuICAgKiBMaW1pdGF0aW9uczpcbiAgICogLSBOb3Qgc3VpdGFibGUgZm9yIHBsYWluIHByZWNvbXB1dGVzIChyZXF1aXJlcyAyNTYgY29uc3RhbnQgZG91YmxpbmdzKVxuICAgKiAtIFBlcmZvcm1hbmNlIGRlZ3JhZGVzIHdpdGggbGFyZ2VyIHNjYWxhciBjb3VudHM6XG4gICAqICAgLSBPcHRpbWFsIGZvciB+MjU2IHNjYWxhcnNcbiAgICogICAtIExlc3MgZWZmaWNpZW50IGZvciA0MDk2KyBzY2FsYXJzIChQaXBwZW5nZXIgcHJlZmVycmVkKVxuICAgKi9cbiAgY29uc3QgZmllbGROID0gYy5GbjtcbiAgdmFsaWRhdGVXKHdpbmRvd1NpemUsIGZpZWxkTi5CSVRTKTtcbiAgdmFsaWRhdGVNU01Qb2ludHMocG9pbnRzLCBjKTtcbiAgY29uc3QgemVybyA9IGMuWkVSTztcbiAgY29uc3QgdGFibGVTaXplID0gMiAqKiB3aW5kb3dTaXplIC0gMTsgLy8gdGFibGUgc2l6ZSAod2l0aG91dCB6ZXJvKVxuICBjb25zdCBjaHVua3MgPSBNYXRoLmNlaWwoZmllbGROLkJJVFMgLyB3aW5kb3dTaXplKTsgLy8gY2h1bmtzIG9mIGl0ZW1cbiAgY29uc3QgTUFTSyA9IGJpdE1hc2sod2luZG93U2l6ZSk7XG4gIGNvbnN0IHRhYmxlcyA9IHBvaW50cy5tYXAoKHA6IFApID0+IHtcbiAgICBjb25zdCByZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMCwgYWNjID0gcDsgaSA8IHRhYmxlU2l6ZTsgaSsrKSB7XG4gICAgICByZXMucHVzaChhY2MpO1xuICAgICAgYWNjID0gYWNjLmFkZChwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfSk7XG4gIHJldHVybiAoc2NhbGFyczogYmlnaW50W10pOiBQID0+IHtcbiAgICB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFycywgZmllbGROKTtcbiAgICBpZiAoc2NhbGFycy5sZW5ndGggPiBwb2ludHMubGVuZ3RoKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBvZiBzY2FsYXJzIG11c3QgYmUgc21hbGxlciB0aGFuIGFycmF5IG9mIHBvaW50cycpO1xuICAgIGxldCByZXMgPSB6ZXJvO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2h1bmtzOyBpKyspIHtcbiAgICAgIC8vIE5vIG5lZWQgdG8gZG91YmxlIGlmIGFjY3VtdWxhdG9yIGlzIHN0aWxsIHplcm8uXG4gICAgICBpZiAocmVzICE9PSB6ZXJvKSBmb3IgKGxldCBqID0gMDsgaiA8IHdpbmRvd1NpemU7IGorKykgcmVzID0gcmVzLmRvdWJsZSgpO1xuICAgICAgY29uc3Qgc2hpZnRCeSA9IEJpZ0ludChjaHVua3MgKiB3aW5kb3dTaXplIC0gKGkgKyAxKSAqIHdpbmRvd1NpemUpO1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzY2FsYXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IG4gPSBzY2FsYXJzW2pdO1xuICAgICAgICBjb25zdCBjdXJyID0gTnVtYmVyKChuID4+IHNoaWZ0QnkpICYgTUFTSyk7XG4gICAgICAgIGlmICghY3VycikgY29udGludWU7IC8vIHNraXAgemVybyBzY2FsYXJzIGNodW5rc1xuICAgICAgICByZXMgPSByZXMuYWRkKHRhYmxlc1tqXVtjdXJyIC0gMV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBWYWxpZEN1cnZlUGFyYW1zPFQ+ID0ge1xuICBwOiBiaWdpbnQ7XG4gIG46IGJpZ2ludDtcbiAgaDogYmlnaW50O1xuICBhOiBUO1xuICBiPzogVDtcbiAgZD86IFQ7XG4gIEd4OiBUO1xuICBHeTogVDtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZUZpZWxkPFQ+KG9yZGVyOiBiaWdpbnQsIGZpZWxkPzogSUZpZWxkPFQ+LCBpc0xFPzogYm9vbGVhbik6IElGaWVsZDxUPiB7XG4gIGlmIChmaWVsZCkge1xuICAgIGlmIChmaWVsZC5PUkRFUiAhPT0gb3JkZXIpIHRocm93IG5ldyBFcnJvcignRmllbGQuT1JERVIgbXVzdCBtYXRjaCBvcmRlcjogRnAgPT0gcCwgRm4gPT0gbicpO1xuICAgIHZhbGlkYXRlRmllbGQoZmllbGQpO1xuICAgIHJldHVybiBmaWVsZDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmllbGQob3JkZXIsIHsgaXNMRSB9KSBhcyB1bmtub3duIGFzIElGaWVsZDxUPjtcbiAgfVxufVxuZXhwb3J0IHR5cGUgRnBGbjxUPiA9IHsgRnA6IElGaWVsZDxUPjsgRm46IElGaWVsZDxiaWdpbnQ+IH07XG5cbi8qKiBWYWxpZGF0ZXMgQ1VSVkUgb3B0cyBhbmQgY3JlYXRlcyBmaWVsZHMgKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXJ2ZUZpZWxkczxUPihcbiAgdHlwZTogJ3dlaWVyc3RyYXNzJyB8ICdlZHdhcmRzJyxcbiAgQ1VSVkU6IFZhbGlkQ3VydmVQYXJhbXM8VD4sXG4gIGN1cnZlT3B0czogUGFydGlhbDxGcEZuPFQ+PiA9IHt9LFxuICBGcEZuTEU/OiBib29sZWFuXG4pOiBGcEZuPFQ+ICYgeyBDVVJWRTogVmFsaWRDdXJ2ZVBhcmFtczxUPiB9IHtcbiAgaWYgKEZwRm5MRSA9PT0gdW5kZWZpbmVkKSBGcEZuTEUgPSB0eXBlID09PSAnZWR3YXJkcyc7XG4gIGlmICghQ1VSVkUgfHwgdHlwZW9mIENVUlZFICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCB2YWxpZCAke3R5cGV9IENVUlZFIG9iamVjdGApO1xuICBmb3IgKGNvbnN0IHAgb2YgWydwJywgJ24nLCAnaCddIGFzIGNvbnN0KSB7XG4gICAgY29uc3QgdmFsID0gQ1VSVkVbcF07XG4gICAgaWYgKCEodHlwZW9mIHZhbCA9PT0gJ2JpZ2ludCcgJiYgdmFsID4gXzBuKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ1VSVkUuJHtwfSBtdXN0IGJlIHBvc2l0aXZlIGJpZ2ludGApO1xuICB9XG4gIGNvbnN0IEZwID0gY3JlYXRlRmllbGQoQ1VSVkUucCwgY3VydmVPcHRzLkZwLCBGcEZuTEUpO1xuICBjb25zdCBGbiA9IGNyZWF0ZUZpZWxkKENVUlZFLm4sIGN1cnZlT3B0cy5GbiwgRnBGbkxFKTtcbiAgY29uc3QgX2I6ICdiJyB8ICdkJyA9IHR5cGUgPT09ICd3ZWllcnN0cmFzcycgPyAnYicgOiAnZCc7XG4gIGNvbnN0IHBhcmFtcyA9IFsnR3gnLCAnR3knLCAnYScsIF9iXSBhcyBjb25zdDtcbiAgZm9yIChjb25zdCBwIG9mIHBhcmFtcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBpZiAoIUZwLmlzVmFsaWQoQ1VSVkVbcF0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDVVJWRS4ke3B9IG11c3QgYmUgdmFsaWQgZmllbGQgZWxlbWVudCBvZiBDVVJWRS5GcGApO1xuICB9XG4gIENVUlZFID0gT2JqZWN0LmZyZWV6ZShPYmplY3QuYXNzaWduKHt9LCBDVVJWRSkpO1xuICByZXR1cm4geyBDVVJWRSwgRnAsIEZuIH07XG59XG5cbnR5cGUgS2V5Z2VuRm4gPSAoXG4gIHNlZWQ/OiBVaW50OEFycmF5LFxuICBpc0NvbXByZXNzZWQ/OiBib29sZWFuXG4pID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVLZXlnZW4oXG4gIHJhbmRvbVNlY3JldEtleTogRnVuY3Rpb24sXG4gIGdldFB1YmxpY0tleTogU2lnbmVyWydnZXRQdWJsaWNLZXknXVxuKTogS2V5Z2VuRm4ge1xuICByZXR1cm4gZnVuY3Rpb24ga2V5Z2VuKHNlZWQ/OiBVaW50OEFycmF5KSB7XG4gICAgY29uc3Qgc2VjcmV0S2V5ID0gcmFuZG9tU2VjcmV0S2V5KHNlZWQpO1xuICAgIHJldHVybiB7IHNlY3JldEtleSwgcHVibGljS2V5OiBnZXRQdWJsaWNLZXkoc2VjcmV0S2V5KSB9O1xuICB9O1xufVxuIiwgIi8qKlxuICogSGV4LCBieXRlcyBhbmQgbnVtYmVyIHV0aWxpdGllcy5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHtcbiAgYWJ5dGVzIGFzIGFieXRlc18sXG4gIGFudW1iZXIsXG4gIGJ5dGVzVG9IZXggYXMgYnl0ZXNUb0hleF8sXG4gIGNvbmNhdEJ5dGVzIGFzIGNvbmNhdEJ5dGVzXyxcbiAgaGV4VG9CeXRlcyBhcyBoZXhUb0J5dGVzXyxcbn0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5leHBvcnQge1xuICBhYnl0ZXMsXG4gIGFudW1iZXIsXG4gIGJ5dGVzVG9IZXgsXG4gIGNvbmNhdEJ5dGVzLFxuICBoZXhUb0J5dGVzLFxuICBpc0J5dGVzLFxuICByYW5kb21CeXRlcyxcbn0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzFuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxKTtcblxuZXhwb3J0IHR5cGUgQ0hhc2ggPSB7XG4gIChtZXNzYWdlOiBVaW50OEFycmF5KTogVWludDhBcnJheTtcbiAgYmxvY2tMZW46IG51bWJlcjtcbiAgb3V0cHV0TGVuOiBudW1iZXI7XG4gIGNyZWF0ZShvcHRzPzogeyBka0xlbj86IG51bWJlciB9KTogYW55OyAvLyBGb3Igc2hha2Vcbn07XG5leHBvcnQgdHlwZSBGSGFzaCA9IChtZXNzYWdlOiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuZXhwb3J0IGZ1bmN0aW9uIGFib29sKHZhbHVlOiBib29sZWFuLCB0aXRsZTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGl0bGUgJiYgYFwiJHt0aXRsZX1cIiBgO1xuICAgIHRocm93IG5ldyBFcnJvcihwcmVmaXggKyAnZXhwZWN0ZWQgYm9vbGVhbiwgZ290IHR5cGU9JyArIHR5cGVvZiB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vLyBVc2VkIGluIHdlaWVyc3RyYXNzLCBkZXJcbmZ1bmN0aW9uIGFiaWdudW1iZXIobjogbnVtYmVyIHwgYmlnaW50KSB7XG4gIGlmICh0eXBlb2YgbiA9PT0gJ2JpZ2ludCcpIHtcbiAgICBpZiAoIWlzUG9zQmlnKG4pKSB0aHJvdyBuZXcgRXJyb3IoJ3Bvc2l0aXZlIGJpZ2ludCBleHBlY3RlZCwgZ290ICcgKyBuKTtcbiAgfSBlbHNlIGFudW1iZXIobik7XG4gIHJldHVybiBuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNhZmVudW1iZXIodmFsdWU6IG51bWJlciwgdGl0bGU6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIodmFsdWUpKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGl0bGUgJiYgYFwiJHt0aXRsZX1cIiBgO1xuICAgIHRocm93IG5ldyBFcnJvcihwcmVmaXggKyAnZXhwZWN0ZWQgc2FmZSBpbnRlZ2VyLCBnb3QgdHlwZT0nICsgdHlwZW9mIHZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9IZXhVbnBhZGRlZChudW06IG51bWJlciB8IGJpZ2ludCk6IHN0cmluZyB7XG4gIGNvbnN0IGhleCA9IGFiaWdudW1iZXIobnVtKS50b1N0cmluZygxNik7XG4gIHJldHVybiBoZXgubGVuZ3RoICYgMSA/ICcwJyArIGhleCA6IGhleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhleFRvTnVtYmVyKGhleDogc3RyaW5nKTogYmlnaW50IHtcbiAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCAnICsgdHlwZW9mIGhleCk7XG4gIHJldHVybiBoZXggPT09ICcnID8gXzBuIDogQmlnSW50KCcweCcgKyBoZXgpOyAvLyBCaWcgRW5kaWFuXG59XG5cbi8vIEJFOiBCaWcgRW5kaWFuLCBMRTogTGl0dGxlIEVuZGlhblxuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9OdW1iZXJCRShieXRlczogVWludDhBcnJheSk6IGJpZ2ludCB7XG4gIHJldHVybiBoZXhUb051bWJlcihieXRlc1RvSGV4XyhieXRlcykpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9OdW1iZXJMRShieXRlczogVWludDhBcnJheSk6IGJpZ2ludCB7XG4gIHJldHVybiBoZXhUb051bWJlcihieXRlc1RvSGV4Xyhjb3B5Qnl0ZXMoYWJ5dGVzXyhieXRlcykpLnJldmVyc2UoKSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9CeXRlc0JFKG46IG51bWJlciB8IGJpZ2ludCwgbGVuOiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgYW51bWJlcihsZW4pO1xuICBuID0gYWJpZ251bWJlcihuKTtcbiAgY29uc3QgcmVzID0gaGV4VG9CeXRlc18obi50b1N0cmluZygxNikucGFkU3RhcnQobGVuICogMiwgJzAnKSk7XG4gIGlmIChyZXMubGVuZ3RoICE9PSBsZW4pIHRocm93IG5ldyBFcnJvcignbnVtYmVyIHRvbyBsYXJnZScpO1xuICByZXR1cm4gcmVzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvQnl0ZXNMRShuOiBudW1iZXIgfCBiaWdpbnQsIGxlbjogbnVtYmVyKTogVWludDhBcnJheSB7XG4gIHJldHVybiBudW1iZXJUb0J5dGVzQkUobiwgbGVuKS5yZXZlcnNlKCk7XG59XG4vLyBVbnBhZGRlZCwgcmFyZWx5IHVzZWRcbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb1ZhckJ5dGVzQkUobjogbnVtYmVyIHwgYmlnaW50KTogVWludDhBcnJheSB7XG4gIHJldHVybiBoZXhUb0J5dGVzXyhudW1iZXJUb0hleFVucGFkZGVkKGFiaWdudW1iZXIobikpKTtcbn1cblxuLy8gQ29tcGFyZXMgMiB1OGEtcyBpbiBraW5kYSBjb25zdGFudCB0aW1lXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxCeXRlcyhhOiBVaW50OEFycmF5LCBiOiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgbGV0IGRpZmYgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIGRpZmYgfD0gYVtpXSBeIGJbaV07XG4gIHJldHVybiBkaWZmID09PSAwO1xufVxuXG4vKipcbiAqIENvcGllcyBVaW50OEFycmF5LiBXZSBjYW4ndCB1c2UgdThhLnNsaWNlKCksIGJlY2F1c2UgdThhIGNhbiBiZSBCdWZmZXIsXG4gKiBhbmQgQnVmZmVyI3NsaWNlIGNyZWF0ZXMgbXV0YWJsZSBjb3B5LiBOZXZlciB1c2UgQnVmZmVycyFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHlCeXRlcyhieXRlczogVWludDhBcnJheSk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVWludDhBcnJheS5mcm9tKGJ5dGVzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGVzIDctYml0IEFTQ0lJIHN0cmluZyB0byBVaW50OEFycmF5LCB0aHJvd3Mgb24gbm9uLWFzY2lpIHN5bWJvbHNcbiAqIFNob3VsZCBiZSBzYWZlIHRvIHVzZSBmb3IgdGhpbmdzIGV4cGVjdGVkIHRvIGJlIEFTQ0lJLlxuICogUmV0dXJucyBleGFjdCBzYW1lIHJlc3VsdCBhcyBgVGV4dEVuY29kZXJgIGZvciBBU0NJSSBvciB0aHJvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc2NpaVRvQnl0ZXMoYXNjaWk6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVWludDhBcnJheS5mcm9tKGFzY2lpLCAoYywgaSkgPT4ge1xuICAgIGNvbnN0IGNoYXJDb2RlID0gYy5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChjLmxlbmd0aCAhPT0gMSB8fCBjaGFyQ29kZSA+IDEyNykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgc3RyaW5nIGNvbnRhaW5zIG5vbi1BU0NJSSBjaGFyYWN0ZXIgXCIke2FzY2lpW2ldfVwiIHdpdGggY29kZSAke2NoYXJDb2RlfSBhdCBwb3NpdGlvbiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJDb2RlO1xuICB9KTtcbn1cblxuLy8gSXMgcG9zaXRpdmUgYmlnaW50XG5jb25zdCBpc1Bvc0JpZyA9IChuOiBiaWdpbnQpID0+IHR5cGVvZiBuID09PSAnYmlnaW50JyAmJiBfMG4gPD0gbjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluUmFuZ2UobjogYmlnaW50LCBtaW46IGJpZ2ludCwgbWF4OiBiaWdpbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzUG9zQmlnKG4pICYmIGlzUG9zQmlnKG1pbikgJiYgaXNQb3NCaWcobWF4KSAmJiBtaW4gPD0gbiAmJiBuIDwgbWF4O1xufVxuXG4vKipcbiAqIEFzc2VydHMgbWluIDw9IG4gPCBtYXguIE5PVEU6IEl0J3MgPCBtYXggYW5kIG5vdCA8PSBtYXguXG4gKiBAZXhhbXBsZVxuICogYUluUmFuZ2UoJ3gnLCB4LCAxbiwgMjU2bik7IC8vIHdvdWxkIGFzc3VtZSB4IGlzIGluICgxbi4uMjU1bilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFJblJhbmdlKHRpdGxlOiBzdHJpbmcsIG46IGJpZ2ludCwgbWluOiBiaWdpbnQsIG1heDogYmlnaW50KTogdm9pZCB7XG4gIC8vIFdoeSBtaW4gPD0gbiA8IG1heCBhbmQgbm90IGEgKG1pbiA8IG4gPCBtYXgpIE9SIGIgKG1pbiA8PSBuIDw9IG1heCk/XG4gIC8vIGNvbnNpZGVyIFA9MjU2biwgbWluPTBuLCBtYXg9UFxuICAvLyAtIGEgZm9yIG1pbj0wIHdvdWxkIHJlcXVpcmUgLTE6ICAgICAgICAgIGBpblJhbmdlKCd4JywgeCwgLTFuLCBQKWBcbiAgLy8gLSBiIHdvdWxkIGNvbW1vbmx5IHJlcXVpcmUgc3VidHJhY3Rpb246ICBgaW5SYW5nZSgneCcsIHgsIDBuLCBQIC0gMW4pYFxuICAvLyAtIG91ciB3YXkgaXMgdGhlIGNsZWFuZXN0OiAgICAgICAgICAgICAgIGBpblJhbmdlKCd4JywgeCwgMG4sIFApXG4gIGlmICghaW5SYW5nZShuLCBtaW4sIG1heCkpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCB2YWxpZCAnICsgdGl0bGUgKyAnOiAnICsgbWluICsgJyA8PSBuIDwgJyArIG1heCArICcsIGdvdCAnICsgbik7XG59XG5cbi8vIEJpdCBvcGVyYXRpb25zXG5cbi8qKlxuICogQ2FsY3VsYXRlcyBhbW91bnQgb2YgYml0cyBpbiBhIGJpZ2ludC5cbiAqIFNhbWUgYXMgYG4udG9TdHJpbmcoMikubGVuZ3RoYFxuICogVE9ETzogbWVyZ2Ugd2l0aCBuTGVuZ3RoIGluIG1vZHVsYXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpdExlbihuOiBiaWdpbnQpOiBudW1iZXIge1xuICBsZXQgbGVuO1xuICBmb3IgKGxlbiA9IDA7IG4gPiBfMG47IG4gPj49IF8xbiwgbGVuICs9IDEpO1xuICByZXR1cm4gbGVuO1xufVxuXG4vKipcbiAqIEdldHMgc2luZ2xlIGJpdCBhdCBwb3NpdGlvbi5cbiAqIE5PVEU6IGZpcnN0IGJpdCBwb3NpdGlvbiBpcyAwIChzYW1lIGFzIGFycmF5cylcbiAqIFNhbWUgYXMgYCEhK0FycmF5LmZyb20obi50b1N0cmluZygyKSkucmV2ZXJzZSgpW3Bvc11gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaXRHZXQobjogYmlnaW50LCBwb3M6IG51bWJlcik6IGJpZ2ludCB7XG4gIHJldHVybiAobiA+PiBCaWdJbnQocG9zKSkgJiBfMW47XG59XG5cbi8qKlxuICogU2V0cyBzaW5nbGUgYml0IGF0IHBvc2l0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0U2V0KG46IGJpZ2ludCwgcG9zOiBudW1iZXIsIHZhbHVlOiBib29sZWFuKTogYmlnaW50IHtcbiAgcmV0dXJuIG4gfCAoKHZhbHVlID8gXzFuIDogXzBuKSA8PCBCaWdJbnQocG9zKSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIG1hc2sgZm9yIE4gYml0cy4gTm90IHVzaW5nICoqIG9wZXJhdG9yIHdpdGggYmlnaW50cyBiZWNhdXNlIG9mIG9sZCBlbmdpbmVzLlxuICogU2FtZSBhcyBCaWdJbnQoYDBiJHtBcnJheShpKS5maWxsKCcxJykuam9pbignJyl9YClcbiAqL1xuZXhwb3J0IGNvbnN0IGJpdE1hc2sgPSAobjogbnVtYmVyKTogYmlnaW50ID0+IChfMW4gPDwgQmlnSW50KG4pKSAtIF8xbjtcblxuLy8gRFJCR1xuXG50eXBlIFByZWQ8VD4gPSAodjogVWludDhBcnJheSkgPT4gVCB8IHVuZGVmaW5lZDtcbi8qKlxuICogTWluaW1hbCBITUFDLURSQkcgZnJvbSBOSVNUIDgwMC05MCBmb3IgUkZDNjk3OSBzaWdzLlxuICogQHJldHVybnMgZnVuY3Rpb24gdGhhdCB3aWxsIGNhbGwgRFJCRyB1bnRpbCAybmQgYXJnIHJldHVybnMgc29tZXRoaW5nIG1lYW5pbmdmdWxcbiAqIEBleGFtcGxlXG4gKiAgIGNvbnN0IGRyYmcgPSBjcmVhdGVIbWFjRFJCRzxLZXk+KDMyLCAzMiwgaG1hYyk7XG4gKiAgIGRyYmcoc2VlZCwgYnl0ZXNUb0tleSk7IC8vIGJ5dGVzVG9LZXkgbXVzdCByZXR1cm4gS2V5IG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSG1hY0RyYmc8VD4oXG4gIGhhc2hMZW46IG51bWJlcixcbiAgcUJ5dGVMZW46IG51bWJlcixcbiAgaG1hY0ZuOiAoa2V5OiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5XG4pOiAoc2VlZDogVWludDhBcnJheSwgcHJlZGljYXRlOiBQcmVkPFQ+KSA9PiBUIHtcbiAgYW51bWJlcihoYXNoTGVuLCAnaGFzaExlbicpO1xuICBhbnVtYmVyKHFCeXRlTGVuLCAncUJ5dGVMZW4nKTtcbiAgaWYgKHR5cGVvZiBobWFjRm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignaG1hY0ZuIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICBjb25zdCB1OG4gPSAobGVuOiBudW1iZXIpOiBVaW50OEFycmF5ID0+IG5ldyBVaW50OEFycmF5KGxlbik7IC8vIGNyZWF0ZXMgVWludDhBcnJheVxuICBjb25zdCBOVUxMID0gVWludDhBcnJheS5vZigpO1xuICBjb25zdCBieXRlMCA9IFVpbnQ4QXJyYXkub2YoMHgwMCk7XG4gIGNvbnN0IGJ5dGUxID0gVWludDhBcnJheS5vZigweDAxKTtcbiAgY29uc3QgX21heERyYmdJdGVycyA9IDEwMDA7XG5cbiAgLy8gU3RlcCBCLCBTdGVwIEM6IHNldCBoYXNoTGVuIHRvIDgqY2VpbChobGVuLzgpXG4gIGxldCB2ID0gdThuKGhhc2hMZW4pOyAvLyBNaW5pbWFsIG5vbi1mdWxsLXNwZWMgSE1BQy1EUkJHIGZyb20gTklTVCA4MDAtOTAgZm9yIFJGQzY5Nzkgc2lncy5cbiAgbGV0IGsgPSB1OG4oaGFzaExlbik7IC8vIFN0ZXBzIEIgYW5kIEMgb2YgUkZDNjk3OSAzLjI6IHNldCBoYXNoTGVuLCBpbiBvdXIgY2FzZSBhbHdheXMgc2FtZVxuICBsZXQgaSA9IDA7IC8vIEl0ZXJhdGlvbnMgY291bnRlciwgd2lsbCB0aHJvdyB3aGVuIG92ZXIgMTAwMFxuICBjb25zdCByZXNldCA9ICgpID0+IHtcbiAgICB2LmZpbGwoMSk7XG4gICAgay5maWxsKDApO1xuICAgIGkgPSAwO1xuICB9O1xuICBjb25zdCBoID0gKC4uLm1zZ3M6IFVpbnQ4QXJyYXlbXSkgPT4gaG1hY0ZuKGssIGNvbmNhdEJ5dGVzXyh2LCAuLi5tc2dzKSk7IC8vIGhtYWMoaykodiwgLi4udmFsdWVzKVxuICBjb25zdCByZXNlZWQgPSAoc2VlZDogVWludDhBcnJheSA9IE5VTEwpID0+IHtcbiAgICAvLyBITUFDLURSQkcgcmVzZWVkKCkgZnVuY3Rpb24uIFN0ZXBzIEQtR1xuICAgIGsgPSBoKGJ5dGUwLCBzZWVkKTsgLy8gayA9IGhtYWMoayB8fCB2IHx8IDB4MDAgfHwgc2VlZClcbiAgICB2ID0gaCgpOyAvLyB2ID0gaG1hYyhrIHx8IHYpXG4gICAgaWYgKHNlZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgayA9IGgoYnl0ZTEsIHNlZWQpOyAvLyBrID0gaG1hYyhrIHx8IHYgfHwgMHgwMSB8fCBzZWVkKVxuICAgIHYgPSBoKCk7IC8vIHYgPSBobWFjKGsgfHwgdilcbiAgfTtcbiAgY29uc3QgZ2VuID0gKCkgPT4ge1xuICAgIC8vIEhNQUMtRFJCRyBnZW5lcmF0ZSgpIGZ1bmN0aW9uXG4gICAgaWYgKGkrKyA+PSBfbWF4RHJiZ0l0ZXJzKSB0aHJvdyBuZXcgRXJyb3IoJ2RyYmc6IHRyaWVkIG1heCBhbW91bnQgb2YgaXRlcmF0aW9ucycpO1xuICAgIGxldCBsZW4gPSAwO1xuICAgIGNvbnN0IG91dDogVWludDhBcnJheVtdID0gW107XG4gICAgd2hpbGUgKGxlbiA8IHFCeXRlTGVuKSB7XG4gICAgICB2ID0gaCgpO1xuICAgICAgY29uc3Qgc2wgPSB2LnNsaWNlKCk7XG4gICAgICBvdXQucHVzaChzbCk7XG4gICAgICBsZW4gKz0gdi5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBjb25jYXRCeXRlc18oLi4ub3V0KTtcbiAgfTtcbiAgY29uc3QgZ2VuVW50aWwgPSAoc2VlZDogVWludDhBcnJheSwgcHJlZDogUHJlZDxUPik6IFQgPT4ge1xuICAgIHJlc2V0KCk7XG4gICAgcmVzZWVkKHNlZWQpOyAvLyBTdGVwcyBELUdcbiAgICBsZXQgcmVzOiBUIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkOyAvLyBTdGVwIEg6IGdyaW5kIHVudGlsIGsgaXMgaW4gWzEuLm4tMV1cbiAgICB3aGlsZSAoIShyZXMgPSBwcmVkKGdlbigpKSkpIHJlc2VlZCgpO1xuICAgIHJlc2V0KCk7XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgcmV0dXJuIGdlblVudGlsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVPYmplY3QoXG4gIG9iamVjdDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge30sXG4gIG9wdEZpZWxkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG4pOiB2b2lkIHtcbiAgaWYgKCFvYmplY3QgfHwgdHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgdmFsaWQgb3B0aW9ucyBvYmplY3QnKTtcbiAgdHlwZSBJdGVtID0ga2V5b2YgdHlwZW9mIG9iamVjdDtcbiAgZnVuY3Rpb24gY2hlY2tGaWVsZChmaWVsZE5hbWU6IEl0ZW0sIGV4cGVjdGVkVHlwZTogc3RyaW5nLCBpc09wdDogYm9vbGVhbikge1xuICAgIGNvbnN0IHZhbCA9IG9iamVjdFtmaWVsZE5hbWVdO1xuICAgIGlmIChpc09wdCAmJiB2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgIGNvbnN0IGN1cnJlbnQgPSB0eXBlb2YgdmFsO1xuICAgIGlmIChjdXJyZW50ICE9PSBleHBlY3RlZFR5cGUgfHwgdmFsID09PSBudWxsKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBwYXJhbSBcIiR7ZmllbGROYW1lfVwiIGlzIGludmFsaWQ6IGV4cGVjdGVkICR7ZXhwZWN0ZWRUeXBlfSwgZ290ICR7Y3VycmVudH1gKTtcbiAgfVxuICBjb25zdCBpdGVyID0gKGY6IHR5cGVvZiBmaWVsZHMsIGlzT3B0OiBib29sZWFuKSA9PlxuICAgIE9iamVjdC5lbnRyaWVzKGYpLmZvckVhY2goKFtrLCB2XSkgPT4gY2hlY2tGaWVsZChrLCB2LCBpc09wdCkpO1xuICBpdGVyKGZpZWxkcywgZmFsc2UpO1xuICBpdGVyKG9wdEZpZWxkcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogdGhyb3dzIG5vdCBpbXBsZW1lbnRlZCBlcnJvclxuICovXG5leHBvcnQgY29uc3Qgbm90SW1wbGVtZW50ZWQgPSAoKTogbmV2ZXIgPT4ge1xuICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xufTtcblxuLyoqXG4gKiBNZW1vaXplcyAoY2FjaGVzKSBjb21wdXRhdGlvbiByZXN1bHQuXG4gKiBVc2VzIFdlYWtNYXA6IHRoZSB2YWx1ZSBpcyBnb2luZyBhdXRvLWNsZWFuZWQgYnkgR0MgYWZ0ZXIgbGFzdCByZWZlcmVuY2UgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lbW9pemVkPFQgZXh0ZW5kcyBvYmplY3QsIFIsIE8gZXh0ZW5kcyBhbnlbXT4oXG4gIGZuOiAoYXJnOiBULCAuLi5hcmdzOiBPKSA9PiBSXG4pOiAoYXJnOiBULCAuLi5hcmdzOiBPKSA9PiBSIHtcbiAgY29uc3QgbWFwID0gbmV3IFdlYWtNYXA8VCwgUj4oKTtcbiAgcmV0dXJuIChhcmc6IFQsIC4uLmFyZ3M6IE8pOiBSID0+IHtcbiAgICBjb25zdCB2YWwgPSBtYXAuZ2V0KGFyZyk7XG4gICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdmFsO1xuICAgIGNvbnN0IGNvbXB1dGVkID0gZm4oYXJnLCAuLi5hcmdzKTtcbiAgICBtYXAuc2V0KGFyZywgY29tcHV0ZWQpO1xuICAgIHJldHVybiBjb21wdXRlZDtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDcnlwdG9LZXlzIHtcbiAgbGVuZ3RoczogeyBzZWVkPzogbnVtYmVyOyBwdWJsaWM/OiBudW1iZXI7IHNlY3JldD86IG51bWJlciB9O1xuICBrZXlnZW46IChzZWVkPzogVWludDhBcnJheSkgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuICBnZXRQdWJsaWNLZXk6IChzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG59XG5cbi8qKiBHZW5lcmljIGludGVyZmFjZSBmb3Igc2lnbmF0dXJlcy4gSGFzIGtleWdlbiwgc2lnbiBhbmQgdmVyaWZ5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduZXIgZXh0ZW5kcyBDcnlwdG9LZXlzIHtcbiAgLy8gSW50ZXJmYWNlcyBhcmUgZnVuLiBXZSBjYW5ub3QganVzdCBhZGQgbmV3IGZpZWxkcyB3aXRob3V0IGNvcHlpbmcgb2xkIG9uZXMuXG4gIGxlbmd0aHM6IHtcbiAgICBzZWVkPzogbnVtYmVyO1xuICAgIHB1YmxpYz86IG51bWJlcjtcbiAgICBzZWNyZXQ/OiBudW1iZXI7XG4gICAgc2lnblJhbmQ/OiBudW1iZXI7XG4gICAgc2lnbmF0dXJlPzogbnVtYmVyO1xuICB9O1xuICBzaWduOiAobXNnOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gIHZlcmlmeTogKHNpZzogVWludDhBcnJheSwgbXNnOiBVaW50OEFycmF5LCBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkpID0+IGJvb2xlYW47XG59XG4iLCAiLyoqXG4gKiBVdGlscyBmb3IgbW9kdWxhciBkaXZpc2lvbiBhbmQgZmllbGRzLlxuICogRmllbGQgb3ZlciAxMSBpcyBhIGZpbml0ZSAoR2Fsb2lzKSBmaWVsZCBpcyBpbnRlZ2VyIG51bWJlciBvcGVyYXRpb25zIGBtb2QgMTFgLlxuICogVGhlcmUgaXMgbm8gZGl2aXNpb246IGl0IGlzIHJlcGxhY2VkIGJ5IG1vZHVsYXIgbXVsdGlwbGljYXRpdmUgaW52ZXJzZS5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHtcbiAgYWJ5dGVzLFxuICBhbnVtYmVyLFxuICBieXRlc1RvTnVtYmVyQkUsXG4gIGJ5dGVzVG9OdW1iZXJMRSxcbiAgbnVtYmVyVG9CeXRlc0JFLFxuICBudW1iZXJUb0J5dGVzTEUsXG4gIHZhbGlkYXRlT2JqZWN0LFxufSBmcm9tICcuLi91dGlscy50cyc7XG5cbi8vIE51bWJlcnMgYXJlbid0IHVzZWQgaW4geDI1NTE5IC8geDQ0OCBidWlsZHNcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKSwgXzFuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxKSwgXzJuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgyKTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgXzNuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgzKSwgXzRuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCg0KSwgXzVuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCg1KTtcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgXzduID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCg3KSwgXzhuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCg4KSwgXzluID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCg5KTtcbmNvbnN0IF8xNm4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDE2KTtcblxuLy8gQ2FsY3VsYXRlcyBhIG1vZHVsbyBiXG5leHBvcnQgZnVuY3Rpb24gbW9kKGE6IGJpZ2ludCwgYjogYmlnaW50KTogYmlnaW50IHtcbiAgY29uc3QgcmVzdWx0ID0gYSAlIGI7XG4gIHJldHVybiByZXN1bHQgPj0gXzBuID8gcmVzdWx0IDogYiArIHJlc3VsdDtcbn1cbi8qKlxuICogRWZmaWNpZW50bHkgcmFpc2UgbnVtIHRvIHBvd2VyIGFuZCBkbyBtb2R1bGFyIGRpdmlzaW9uLlxuICogVW5zYWZlIGluIHNvbWUgY29udGV4dHM6IHVzZXMgbGFkZGVyLCBzbyBjYW4gZXhwb3NlIGJpZ2ludCBiaXRzLlxuICogQGV4YW1wbGVcbiAqIHBvdygybiwgNm4sIDExbikgLy8gNjRuICUgMTFuID09IDluXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb3cobnVtOiBiaWdpbnQsIHBvd2VyOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYmlnaW50IHtcbiAgcmV0dXJuIEZwUG93KEZpZWxkKG1vZHVsbyksIG51bSwgcG93ZXIpO1xufVxuXG4vKiogRG9lcyBgeF4oMl5wb3dlcilgIG1vZCBwLiBgcG93MigzMCwgNClgID09IGAzMF4oMl40KWAgKi9cbmV4cG9ydCBmdW5jdGlvbiBwb3cyKHg6IGJpZ2ludCwgcG93ZXI6IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBiaWdpbnQge1xuICBsZXQgcmVzID0geDtcbiAgd2hpbGUgKHBvd2VyLS0gPiBfMG4pIHtcbiAgICByZXMgKj0gcmVzO1xuICAgIHJlcyAlPSBtb2R1bG87XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBJbnZlcnNlcyBudW1iZXIgb3ZlciBtb2R1bG8uXG4gKiBJbXBsZW1lbnRlZCB1c2luZyBbRXVjbGlkZWFuIEdDRF0oaHR0cHM6Ly9icmlsbGlhbnQub3JnL3dpa2kvZXh0ZW5kZWQtZXVjbGlkZWFuLWFsZ29yaXRobS8pLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG51bWJlcjogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGlmIChudW1iZXIgPT09IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZlcnQ6IGV4cGVjdGVkIG5vbi16ZXJvIG51bWJlcicpO1xuICBpZiAobW9kdWxvIDw9IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZlcnQ6IGV4cGVjdGVkIHBvc2l0aXZlIG1vZHVsdXMsIGdvdCAnICsgbW9kdWxvKTtcbiAgLy8gRmVybWF0J3MgbGl0dGxlIHRoZW9yZW0gXCJDVC1saWtlXCIgdmVyc2lvbiBpbnYobikgPSBuXihtLTIpIG1vZCBtIGlzIDMweCBzbG93ZXIuXG4gIGxldCBhID0gbW9kKG51bWJlciwgbW9kdWxvKTtcbiAgbGV0IGIgPSBtb2R1bG87XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBsZXQgeCA9IF8wbiwgeSA9IF8xbiwgdSA9IF8xbiwgdiA9IF8wbjtcbiAgd2hpbGUgKGEgIT09IF8wbikge1xuICAgIC8vIEpJVCBhcHBsaWVzIG9wdGltaXphdGlvbiBpZiB0aG9zZSB0d28gbGluZXMgZm9sbG93IGVhY2ggb3RoZXJcbiAgICBjb25zdCBxID0gYiAvIGE7XG4gICAgY29uc3QgciA9IGIgJSBhO1xuICAgIGNvbnN0IG0gPSB4IC0gdSAqIHE7XG4gICAgY29uc3QgbiA9IHkgLSB2ICogcTtcbiAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBiID0gYSwgYSA9IHIsIHggPSB1LCB5ID0gdiwgdSA9IG0sIHYgPSBuO1xuICB9XG4gIGNvbnN0IGdjZCA9IGI7XG4gIGlmIChnY2QgIT09IF8xbikgdGhyb3cgbmV3IEVycm9yKCdpbnZlcnQ6IGRvZXMgbm90IGV4aXN0Jyk7XG4gIHJldHVybiBtb2QoeCwgbW9kdWxvKTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0SXNTcXVhcmU8VD4oRnA6IElGaWVsZDxUPiwgcm9vdDogVCwgbjogVCk6IHZvaWQge1xuICBpZiAoIUZwLmVxbChGcC5zcXIocm9vdCksIG4pKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHNxdWFyZSByb290Jyk7XG59XG5cbi8vIE5vdCBhbGwgcm9vdHMgYXJlIHBvc3NpYmxlISBFeGFtcGxlIHdoaWNoIHdpbGwgdGhyb3c6XG4vLyBjb25zdCBOVU0gPVxuLy8gbiA9IDcyMDU3NTk0MDM3OTI3ODE2bjtcbi8vIEZwID0gRmllbGQoQmlnSW50KCcweDFhMDExMWVhMzk3ZmU2OWE0YjFiYTdiNjQzNGJhY2Q3NjQ3NzRiODRmMzg1MTJiZjY3MzBkMmEwZjZiMGY2MjQxZWFiZmZmZWIxNTNmZmZmYjlmZWZmZmZmZmZmYWFhYicpKTtcbmZ1bmN0aW9uIHNxcnQzbW9kNDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSB7XG4gIGNvbnN0IHAxZGl2NCA9IChGcC5PUkRFUiArIF8xbikgLyBfNG47XG4gIGNvbnN0IHJvb3QgPSBGcC5wb3cobiwgcDFkaXY0KTtcbiAgYXNzZXJ0SXNTcXVhcmUoRnAsIHJvb3QsIG4pO1xuICByZXR1cm4gcm9vdDtcbn1cblxuZnVuY3Rpb24gc3FydDVtb2Q4PFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpIHtcbiAgY29uc3QgcDVkaXY4ID0gKEZwLk9SREVSIC0gXzVuKSAvIF84bjtcbiAgY29uc3QgbjIgPSBGcC5tdWwobiwgXzJuKTtcbiAgY29uc3QgdiA9IEZwLnBvdyhuMiwgcDVkaXY4KTtcbiAgY29uc3QgbnYgPSBGcC5tdWwobiwgdik7XG4gIGNvbnN0IGkgPSBGcC5tdWwoRnAubXVsKG52LCBfMm4pLCB2KTtcbiAgY29uc3Qgcm9vdCA9IEZwLm11bChudiwgRnAuc3ViKGksIEZwLk9ORSkpO1xuICBhc3NlcnRJc1NxdWFyZShGcCwgcm9vdCwgbik7XG4gIHJldHVybiByb290O1xufVxuXG4vLyBCYXNlZCBvbiBSRkM5MzgwLCBLb25nIGFsZ29yaXRobVxuLy8gcHJldHRpZXItaWdub3JlXG5mdW5jdGlvbiBzcXJ0OW1vZDE2KFA6IGJpZ2ludCk6IDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiBUIHtcbiAgY29uc3QgRnBfID0gRmllbGQoUCk7XG4gIGNvbnN0IHRuID0gdG9uZWxsaVNoYW5rcyhQKTtcbiAgY29uc3QgYzEgPSB0bihGcF8sIEZwXy5uZWcoRnBfLk9ORSkpOy8vICAxLiBjMSA9IHNxcnQoLTEpIGluIEYsIGkuZS4sIChjMV4yKSA9PSAtMSBpbiBGXG4gIGNvbnN0IGMyID0gdG4oRnBfLCBjMSk7ICAgICAgICAgICAgICAvLyAgMi4gYzIgPSBzcXJ0KGMxKSBpbiBGLCBpLmUuLCAoYzJeMikgPT0gYzEgaW4gRlxuICBjb25zdCBjMyA9IHRuKEZwXywgRnBfLm5lZyhjMSkpOyAgICAgLy8gIDMuIGMzID0gc3FydCgtYzEpIGluIEYsIGkuZS4sIChjM14yKSA9PSAtYzEgaW4gRlxuICBjb25zdCBjNCA9IChQICsgXzduKSAvIF8xNm47ICAgICAgICAgLy8gIDQuIGM0ID0gKHEgKyA3KSAvIDE2ICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICByZXR1cm4gPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IHtcbiAgICBsZXQgdHYxID0gRnAucG93KG4sIGM0KTsgICAgICAgICAgIC8vICAxLiB0djEgPSB4XmM0XG4gICAgbGV0IHR2MiA9IEZwLm11bCh0djEsIGMxKTsgICAgICAgICAvLyAgMi4gdHYyID0gYzEgKiB0djFcbiAgICBjb25zdCB0djMgPSBGcC5tdWwodHYxLCBjMik7ICAgICAgIC8vICAzLiB0djMgPSBjMiAqIHR2MVxuICAgIGNvbnN0IHR2NCA9IEZwLm11bCh0djEsIGMzKTsgICAgICAgLy8gIDQuIHR2NCA9IGMzICogdHYxXG4gICAgY29uc3QgZTEgPSBGcC5lcWwoRnAuc3FyKHR2MiksIG4pOyAvLyAgNS4gIGUxID0gKHR2Ml4yKSA9PSB4XG4gICAgY29uc3QgZTIgPSBGcC5lcWwoRnAuc3FyKHR2MyksIG4pOyAvLyAgNi4gIGUyID0gKHR2M14yKSA9PSB4XG4gICAgdHYxID0gRnAuY21vdih0djEsIHR2MiwgZTEpOyAgICAgICAvLyAgNy4gdHYxID0gQ01PVih0djEsIHR2MiwgZTEpICAjIFNlbGVjdCB0djIgaWYgKHR2Ml4yKSA9PSB4XG4gICAgdHYyID0gRnAuY21vdih0djQsIHR2MywgZTIpOyAgICAgICAvLyAgOC4gdHYyID0gQ01PVih0djQsIHR2MywgZTIpICAjIFNlbGVjdCB0djMgaWYgKHR2M14yKSA9PSB4XG4gICAgY29uc3QgZTMgPSBGcC5lcWwoRnAuc3FyKHR2MiksIG4pOyAvLyAgOS4gIGUzID0gKHR2Ml4yKSA9PSB4XG4gICAgY29uc3Qgcm9vdCA9IEZwLmNtb3YodHYxLCB0djIsIGUzKTsvLyAxMC4gIHogPSBDTU9WKHR2MSwgdHYyLCBlMykgICAjIFNlbGVjdCBzcXJ0IGZyb20gdHYxICYgdHYyXG4gICAgYXNzZXJ0SXNTcXVhcmUoRnAsIHJvb3QsIG4pO1xuICAgIHJldHVybiByb290O1xuICB9O1xufVxuXG4vKipcbiAqIFRvbmVsbGktU2hhbmtzIHNxdWFyZSByb290IHNlYXJjaCBhbGdvcml0aG0uXG4gKiAxLiBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEyLzY4NS5wZGYgKHBhZ2UgMTIpXG4gKiAyLiBTcXVhcmUgUm9vdHMgZnJvbSAxOyAyNCwgNTEsIDEwIHRvIERhbiBTaGFua3NcbiAqIEBwYXJhbSBQIGZpZWxkIG9yZGVyXG4gKiBAcmV0dXJucyBmdW5jdGlvbiB0aGF0IHRha2VzIGZpZWxkIEZwIChjcmVhdGVkIGZyb20gUCkgYW5kIG51bWJlciBuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b25lbGxpU2hhbmtzKFA6IGJpZ2ludCk6IDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiBUIHtcbiAgLy8gSW5pdGlhbGl6YXRpb24gKHByZWNvbXB1dGF0aW9uKS5cbiAgLy8gQ2FjaGluZyBpbml0aWFsaXphdGlvbiBjb3VsZCBib29zdCBwZXJmIGJ5IDclLlxuICBpZiAoUCA8IF8zbikgdGhyb3cgbmV3IEVycm9yKCdzcXJ0IGlzIG5vdCBkZWZpbmVkIGZvciBzbWFsbCBmaWVsZCcpO1xuICAvLyBGYWN0b3IgUCAtIDEgPSBRICogMl5TLCB3aGVyZSBRIGlzIG9kZFxuICBsZXQgUSA9IFAgLSBfMW47XG4gIGxldCBTID0gMDtcbiAgd2hpbGUgKFEgJSBfMm4gPT09IF8wbikge1xuICAgIFEgLz0gXzJuO1xuICAgIFMrKztcbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGZpcnN0IHF1YWRyYXRpYyBub24tcmVzaWR1ZSBaID49IDJcbiAgbGV0IFogPSBfMm47XG4gIGNvbnN0IF9GcCA9IEZpZWxkKFApO1xuICB3aGlsZSAoRnBMZWdlbmRyZShfRnAsIFopID09PSAxKSB7XG4gICAgLy8gQmFzaWMgcHJpbWFsaXR5IHRlc3QgZm9yIFAuIEFmdGVyIHggaXRlcmF0aW9ucywgY2hhbmNlIG9mXG4gICAgLy8gbm90IGZpbmRpbmcgcXVhZHJhdGljIG5vbi1yZXNpZHVlIGlzIDJeeCwgc28gMl4xMDAwLlxuICAgIGlmIChaKysgPiAxMDAwKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHNxdWFyZSByb290OiBwcm9iYWJseSBub24tcHJpbWUgUCcpO1xuICB9XG4gIC8vIEZhc3QtcGF0aDsgdXN1YWxseSBkb25lIGJlZm9yZSBaLCBidXQgd2UgZG8gXCJwcmltYWxpdHkgdGVzdFwiLlxuICBpZiAoUyA9PT0gMSkgcmV0dXJuIHNxcnQzbW9kNDtcblxuICAvLyBTbG93LXBhdGhcbiAgLy8gVE9ETzogdGVzdCBvbiBGcDIgYW5kIG90aGVyc1xuICBsZXQgY2MgPSBfRnAucG93KFosIFEpOyAvLyBjID0gel5RXG4gIGNvbnN0IFExZGl2MiA9IChRICsgXzFuKSAvIF8ybjtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvbmVsbGlTbG93PFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpOiBUIHtcbiAgICBpZiAoRnAuaXMwKG4pKSByZXR1cm4gbjtcbiAgICAvLyBDaGVjayBpZiBuIGlzIGEgcXVhZHJhdGljIHJlc2lkdWUgdXNpbmcgTGVnZW5kcmUgc3ltYm9sXG4gICAgaWYgKEZwTGVnZW5kcmUoRnAsIG4pICE9PSAxKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHNxdWFyZSByb290Jyk7XG5cbiAgICAvLyBJbml0aWFsaXplIHZhcmlhYmxlcyBmb3IgdGhlIG1haW4gbG9vcFxuICAgIGxldCBNID0gUztcbiAgICBsZXQgYyA9IEZwLm11bChGcC5PTkUsIGNjKTsgLy8gYyA9IHpeUSwgbW92ZSBjYyBmcm9tIGZpZWxkIF9GcCBpbnRvIGZpZWxkIEZwXG4gICAgbGV0IHQgPSBGcC5wb3cobiwgUSk7IC8vIHQgPSBuXlEsIGZpcnN0IGd1ZXNzIGF0IHRoZSBmdWRnZSBmYWN0b3JcbiAgICBsZXQgUiA9IEZwLnBvdyhuLCBRMWRpdjIpOyAvLyBSID0gbl4oKFErMSkvMiksIGZpcnN0IGd1ZXNzIGF0IHRoZSBzcXVhcmUgcm9vdFxuXG4gICAgLy8gTWFpbiBsb29wXG4gICAgLy8gd2hpbGUgdCAhPSAxXG4gICAgd2hpbGUgKCFGcC5lcWwodCwgRnAuT05FKSkge1xuICAgICAgaWYgKEZwLmlzMCh0KSkgcmV0dXJuIEZwLlpFUk87IC8vIGlmIHQ9MCByZXR1cm4gUj0wXG4gICAgICBsZXQgaSA9IDE7XG5cbiAgICAgIC8vIEZpbmQgdGhlIHNtYWxsZXN0IGkgPj0gMSBzdWNoIHRoYXQgdF4oMl5pKSBcdTIyNjEgMSAobW9kIFApXG4gICAgICBsZXQgdF90bXAgPSBGcC5zcXIodCk7IC8vIHReKDJeMSlcbiAgICAgIHdoaWxlICghRnAuZXFsKHRfdG1wLCBGcC5PTkUpKSB7XG4gICAgICAgIGkrKztcbiAgICAgICAgdF90bXAgPSBGcC5zcXIodF90bXApOyAvLyB0XigyXjIpLi4uXG4gICAgICAgIGlmIChpID09PSBNKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHNxdWFyZSByb290Jyk7XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZXhwb25lbnQgZm9yIGI6IDJeKE0gLSBpIC0gMSlcbiAgICAgIGNvbnN0IGV4cG9uZW50ID0gXzFuIDw8IEJpZ0ludChNIC0gaSAtIDEpOyAvLyBiaWdpbnQgaXMgaW1wb3J0YW50XG4gICAgICBjb25zdCBiID0gRnAucG93KGMsIGV4cG9uZW50KTsgLy8gYiA9IDJeKE0gLSBpIC0gMSlcblxuICAgICAgLy8gVXBkYXRlIHZhcmlhYmxlc1xuICAgICAgTSA9IGk7XG4gICAgICBjID0gRnAuc3FyKGIpOyAvLyBjID0gYl4yXG4gICAgICB0ID0gRnAubXVsKHQsIGMpOyAvLyB0ID0gKHQgKiBiXjIpXG4gICAgICBSID0gRnAubXVsKFIsIGIpOyAvLyBSID0gUipiXG4gICAgfVxuICAgIHJldHVybiBSO1xuICB9O1xufVxuXG4vKipcbiAqIFNxdWFyZSByb290IGZvciBhIGZpbml0ZSBmaWVsZC4gV2lsbCB0cnkgb3B0aW1pemVkIHZlcnNpb25zIGZpcnN0OlxuICpcbiAqIDEuIFAgXHUyMjYxIDMgKG1vZCA0KVxuICogMi4gUCBcdTIyNjEgNSAobW9kIDgpXG4gKiAzLiBQIFx1MjI2MSA5IChtb2QgMTYpXG4gKiA0LiBUb25lbGxpLVNoYW5rcyBhbGdvcml0aG1cbiAqXG4gKiBEaWZmZXJlbnQgYWxnb3JpdGhtcyBjYW4gZ2l2ZSBkaWZmZXJlbnQgcm9vdHMsIGl0IGlzIHVwIHRvIHVzZXIgdG8gZGVjaWRlIHdoaWNoIG9uZSB0aGV5IHdhbnQuXG4gKiBGb3IgZXhhbXBsZSB0aGVyZSBpcyBGcFNxcnRPZGQvRnBTcXJ0RXZlbiB0byBjaG9pY2Ugcm9vdCBiYXNlZCBvbiBvZGRuZXNzICh1c2VkIGZvciBoYXNoLXRvLWN1cnZlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZwU3FydChQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIC8vIFAgXHUyMjYxIDMgKG1vZCA0KSA9PiBcdTIyMUFuID0gbl4oKFArMSkvNClcbiAgaWYgKFAgJSBfNG4gPT09IF8zbikgcmV0dXJuIHNxcnQzbW9kNDtcbiAgLy8gUCBcdTIyNjEgNSAobW9kIDgpID0+IEF0a2luIGFsZ29yaXRobSwgcGFnZSAxMCBvZiBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEyLzY4NS5wZGZcbiAgaWYgKFAgJSBfOG4gPT09IF81bikgcmV0dXJuIHNxcnQ1bW9kODtcbiAgLy8gUCBcdTIyNjEgOSAobW9kIDE2KSA9PiBLb25nIGFsZ29yaXRobSwgcGFnZSAxMSBvZiBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEyLzY4NS5wZGYgKGFsZ29yaXRobSA0KVxuICBpZiAoUCAlIF8xNm4gPT09IF85bikgcmV0dXJuIHNxcnQ5bW9kMTYoUCk7XG4gIC8vIFRvbmVsbGktU2hhbmtzIGFsZ29yaXRobVxuICByZXR1cm4gdG9uZWxsaVNoYW5rcyhQKTtcbn1cblxuLy8gTGl0dGxlLWVuZGlhbiBjaGVjayBmb3IgZmlyc3QgTEUgYml0IChsYXN0IEJFIGJpdCk7XG5leHBvcnQgY29uc3QgaXNOZWdhdGl2ZUxFID0gKG51bTogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJvb2xlYW4gPT5cbiAgKG1vZChudW0sIG1vZHVsbykgJiBfMW4pID09PSBfMW47XG5cbi8qKiBGaWVsZCBpcyBub3QgYWx3YXlzIG92ZXIgcHJpbWU6IGZvciBleGFtcGxlLCBGcDIgaGFzIE9SREVSKHEpPXBebS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUZpZWxkPFQ+IHtcbiAgT1JERVI6IGJpZ2ludDtcbiAgQllURVM6IG51bWJlcjtcbiAgQklUUzogbnVtYmVyO1xuICBpc0xFOiBib29sZWFuO1xuICBaRVJPOiBUO1xuICBPTkU6IFQ7XG4gIC8vIDEtYXJnXG4gIGNyZWF0ZTogKG51bTogVCkgPT4gVDtcbiAgaXNWYWxpZDogKG51bTogVCkgPT4gYm9vbGVhbjtcbiAgaXMwOiAobnVtOiBUKSA9PiBib29sZWFuO1xuICBpc1ZhbGlkTm90MDogKG51bTogVCkgPT4gYm9vbGVhbjtcbiAgbmVnKG51bTogVCk6IFQ7XG4gIGludihudW06IFQpOiBUO1xuICBzcXJ0KG51bTogVCk6IFQ7XG4gIHNxcihudW06IFQpOiBUO1xuICAvLyAyLWFyZ3NcbiAgZXFsKGxoczogVCwgcmhzOiBUKTogYm9vbGVhbjtcbiAgYWRkKGxoczogVCwgcmhzOiBUKTogVDtcbiAgc3ViKGxoczogVCwgcmhzOiBUKTogVDtcbiAgbXVsKGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVDtcbiAgcG93KGxoczogVCwgcG93ZXI6IGJpZ2ludCk6IFQ7XG4gIGRpdihsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQ7XG4gIC8vIE4gZm9yIE5vbk5vcm1hbGl6ZWQgKGZvciBub3cpXG4gIGFkZE4obGhzOiBULCByaHM6IFQpOiBUO1xuICBzdWJOKGxoczogVCwgcmhzOiBUKTogVDtcbiAgbXVsTihsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQ7XG4gIHNxck4obnVtOiBUKTogVDtcblxuICAvLyBPcHRpb25hbFxuICAvLyBTaG91bGQgYmUgc2FtZSBhcyBzZ24wIGZ1bmN0aW9uIGluXG4gIC8vIFtSRkM5MzgwXShodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTQuMSkuXG4gIC8vIE5PVEU6IHNnbjAgaXMgJ25lZ2F0aXZlIGluIExFJywgd2hpY2ggaXMgc2FtZSBhcyBvZGQuIEFuZCBuZWdhdGl2ZSBpbiBMRSBpcyBraW5kYSBzdHJhbmdlIGRlZmluaXRpb24gYW55d2F5LlxuICBpc09kZD8obnVtOiBUKTogYm9vbGVhbjsgLy8gT2RkIGluc3RlYWQgb2YgZXZlbiBzaW5jZSB3ZSBoYXZlIGl0IGZvciBGcDJcbiAgLy8gbGVnZW5kcmU/KG51bTogVCk6IFQ7XG4gIGludmVydEJhdGNoOiAobHN0OiBUW10pID0+IFRbXTtcbiAgdG9CeXRlcyhudW06IFQpOiBVaW50OEFycmF5O1xuICBmcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXksIHNraXBWYWxpZGF0aW9uPzogYm9vbGVhbik6IFQ7XG4gIC8vIElmIGMgaXMgRmFsc2UsIENNT1YgcmV0dXJucyBhLCBvdGhlcndpc2UgaXQgcmV0dXJucyBiLlxuICBjbW92KGE6IFQsIGI6IFQsIGM6IGJvb2xlYW4pOiBUO1xufVxuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBGSUVMRF9GSUVMRFMgPSBbXG4gICdjcmVhdGUnLCAnaXNWYWxpZCcsICdpczAnLCAnbmVnJywgJ2ludicsICdzcXJ0JywgJ3NxcicsXG4gICdlcWwnLCAnYWRkJywgJ3N1YicsICdtdWwnLCAncG93JywgJ2RpdicsXG4gICdhZGROJywgJ3N1Yk4nLCAnbXVsTicsICdzcXJOJ1xuXSBhcyBjb25zdDtcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpZWxkPFQ+KGZpZWxkOiBJRmllbGQ8VD4pOiBJRmllbGQ8VD4ge1xuICBjb25zdCBpbml0aWFsID0ge1xuICAgIE9SREVSOiAnYmlnaW50JyxcbiAgICBCWVRFUzogJ251bWJlcicsXG4gICAgQklUUzogJ251bWJlcicsXG4gIH0gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgY29uc3Qgb3B0cyA9IEZJRUxEX0ZJRUxEUy5yZWR1Y2UoKG1hcCwgdmFsOiBzdHJpbmcpID0+IHtcbiAgICBtYXBbdmFsXSA9ICdmdW5jdGlvbic7XG4gICAgcmV0dXJuIG1hcDtcbiAgfSwgaW5pdGlhbCk7XG4gIHZhbGlkYXRlT2JqZWN0KGZpZWxkLCBvcHRzKTtcbiAgLy8gY29uc3QgbWF4ID0gMTYzODQ7XG4gIC8vIGlmIChmaWVsZC5CWVRFUyA8IDEgfHwgZmllbGQuQllURVMgPiBtYXgpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZCcpO1xuICAvLyBpZiAoZmllbGQuQklUUyA8IDEgfHwgZmllbGQuQklUUyA+IDggKiBtYXgpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZCcpO1xuICByZXR1cm4gZmllbGQ7XG59XG5cbi8vIEdlbmVyaWMgZmllbGQgZnVuY3Rpb25zXG5cbi8qKlxuICogU2FtZSBhcyBgcG93YCBidXQgZm9yIEZwOiBub24tY29uc3RhbnQtdGltZS5cbiAqIFVuc2FmZSBpbiBzb21lIGNvbnRleHRzOiB1c2VzIGxhZGRlciwgc28gY2FuIGV4cG9zZSBiaWdpbnQgYml0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZwUG93PFQ+KEZwOiBJRmllbGQ8VD4sIG51bTogVCwgcG93ZXI6IGJpZ2ludCk6IFQge1xuICBpZiAocG93ZXIgPCBfMG4pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBleHBvbmVudCwgbmVnYXRpdmVzIHVuc3VwcG9ydGVkJyk7XG4gIGlmIChwb3dlciA9PT0gXzBuKSByZXR1cm4gRnAuT05FO1xuICBpZiAocG93ZXIgPT09IF8xbikgcmV0dXJuIG51bTtcbiAgbGV0IHAgPSBGcC5PTkU7XG4gIGxldCBkID0gbnVtO1xuICB3aGlsZSAocG93ZXIgPiBfMG4pIHtcbiAgICBpZiAocG93ZXIgJiBfMW4pIHAgPSBGcC5tdWwocCwgZCk7XG4gICAgZCA9IEZwLnNxcihkKTtcbiAgICBwb3dlciA+Pj0gXzFuO1xuICB9XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIEVmZmljaWVudGx5IGludmVydCBhbiBhcnJheSBvZiBGaWVsZCBlbGVtZW50cy5cbiAqIEV4Y2VwdGlvbi1mcmVlLiBXaWxsIHJldHVybiBgdW5kZWZpbmVkYCBmb3IgMCBlbGVtZW50cy5cbiAqIEBwYXJhbSBwYXNzWmVybyBtYXAgMCB0byAwIChpbnN0ZWFkIG9mIHVuZGVmaW5lZClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZwSW52ZXJ0QmF0Y2g8VD4oRnA6IElGaWVsZDxUPiwgbnVtczogVFtdLCBwYXNzWmVybyA9IGZhbHNlKTogVFtdIHtcbiAgY29uc3QgaW52ZXJ0ZWQgPSBuZXcgQXJyYXkobnVtcy5sZW5ndGgpLmZpbGwocGFzc1plcm8gPyBGcC5aRVJPIDogdW5kZWZpbmVkKTtcbiAgLy8gV2FsayBmcm9tIGZpcnN0IHRvIGxhc3QsIG11bHRpcGx5IHRoZW0gYnkgZWFjaCBvdGhlciBNT0QgcFxuICBjb25zdCBtdWx0aXBsaWVkQWNjID0gbnVtcy5yZWR1Y2UoKGFjYywgbnVtLCBpKSA9PiB7XG4gICAgaWYgKEZwLmlzMChudW0pKSByZXR1cm4gYWNjO1xuICAgIGludmVydGVkW2ldID0gYWNjO1xuICAgIHJldHVybiBGcC5tdWwoYWNjLCBudW0pO1xuICB9LCBGcC5PTkUpO1xuICAvLyBJbnZlcnQgbGFzdCBlbGVtZW50XG4gIGNvbnN0IGludmVydGVkQWNjID0gRnAuaW52KG11bHRpcGxpZWRBY2MpO1xuICAvLyBXYWxrIGZyb20gbGFzdCB0byBmaXJzdCwgbXVsdGlwbHkgdGhlbSBieSBpbnZlcnRlZCBlYWNoIG90aGVyIE1PRCBwXG4gIG51bXMucmVkdWNlUmlnaHQoKGFjYywgbnVtLCBpKSA9PiB7XG4gICAgaWYgKEZwLmlzMChudW0pKSByZXR1cm4gYWNjO1xuICAgIGludmVydGVkW2ldID0gRnAubXVsKGFjYywgaW52ZXJ0ZWRbaV0pO1xuICAgIHJldHVybiBGcC5tdWwoYWNjLCBudW0pO1xuICB9LCBpbnZlcnRlZEFjYyk7XG4gIHJldHVybiBpbnZlcnRlZDtcbn1cblxuLy8gVE9ETzogcmVtb3ZlXG5leHBvcnQgZnVuY3Rpb24gRnBEaXY8VD4oRnA6IElGaWVsZDxUPiwgbGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUIHtcbiAgcmV0dXJuIEZwLm11bChsaHMsIHR5cGVvZiByaHMgPT09ICdiaWdpbnQnID8gaW52ZXJ0KHJocywgRnAuT1JERVIpIDogRnAuaW52KHJocykpO1xufVxuXG4vKipcbiAqIExlZ2VuZHJlIHN5bWJvbC5cbiAqIExlZ2VuZHJlIGNvbnN0YW50IGlzIHVzZWQgdG8gY2FsY3VsYXRlIExlZ2VuZHJlIHN5bWJvbCAoYSB8IHApXG4gKiB3aGljaCBkZW5vdGVzIHRoZSB2YWx1ZSBvZiBhXigocC0xKS8yKSAobW9kIHApLlxuICpcbiAqICogKGEgfCBwKSBcdTIyNjEgMSAgICBpZiBhIGlzIGEgc3F1YXJlIChtb2QgcCksIHF1YWRyYXRpYyByZXNpZHVlXG4gKiAqIChhIHwgcCkgXHUyMjYxIC0xICAgaWYgYSBpcyBub3QgYSBzcXVhcmUgKG1vZCBwKSwgcXVhZHJhdGljIG5vbiByZXNpZHVlXG4gKiAqIChhIHwgcCkgXHUyMjYxIDAgICAgaWYgYSBcdTIyNjEgMCAobW9kIHApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcExlZ2VuZHJlPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpOiAtMSB8IDAgfCAxIHtcbiAgLy8gV2UgY2FuIHVzZSAzcmQgYXJndW1lbnQgYXMgb3B0aW9uYWwgY2FjaGUgb2YgdGhpcyB2YWx1ZVxuICAvLyBidXQgc2VlbXMgdW5uZWVkZWQgZm9yIG5vdy4gVGhlIG9wZXJhdGlvbiBpcyB2ZXJ5IGZhc3QuXG4gIGNvbnN0IHAxbW9kMiA9IChGcC5PUkRFUiAtIF8xbikgLyBfMm47XG4gIGNvbnN0IHBvd2VyZWQgPSBGcC5wb3cobiwgcDFtb2QyKTtcbiAgY29uc3QgeWVzID0gRnAuZXFsKHBvd2VyZWQsIEZwLk9ORSk7XG4gIGNvbnN0IHplcm8gPSBGcC5lcWwocG93ZXJlZCwgRnAuWkVSTyk7XG4gIGNvbnN0IG5vID0gRnAuZXFsKHBvd2VyZWQsIEZwLm5lZyhGcC5PTkUpKTtcbiAgaWYgKCF5ZXMgJiYgIXplcm8gJiYgIW5vKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgTGVnZW5kcmUgc3ltYm9sIHJlc3VsdCcpO1xuICByZXR1cm4geWVzID8gMSA6IHplcm8gPyAwIDogLTE7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBUcnVlIHdoZW5ldmVyIHRoZSB2YWx1ZSB4IGlzIGEgc3F1YXJlIGluIHRoZSBmaWVsZCBGLlxuZXhwb3J0IGZ1bmN0aW9uIEZwSXNTcXVhcmU8VD4oRnA6IElGaWVsZDxUPiwgbjogVCk6IGJvb2xlYW4ge1xuICBjb25zdCBsID0gRnBMZWdlbmRyZShGcCwgbik7XG4gIHJldHVybiBsID09PSAxO1xufVxuXG5leHBvcnQgdHlwZSBOTGVuZ3RoID0geyBuQnl0ZUxlbmd0aDogbnVtYmVyOyBuQml0TGVuZ3RoOiBudW1iZXIgfTtcbi8vIENVUlZFLm4gbGVuZ3Roc1xuZXhwb3J0IGZ1bmN0aW9uIG5MZW5ndGgobjogYmlnaW50LCBuQml0TGVuZ3RoPzogbnVtYmVyKTogTkxlbmd0aCB7XG4gIC8vIEJpdCBzaXplLCBieXRlIHNpemUgb2YgQ1VSVkUublxuICBpZiAobkJpdExlbmd0aCAhPT0gdW5kZWZpbmVkKSBhbnVtYmVyKG5CaXRMZW5ndGgpO1xuICBjb25zdCBfbkJpdExlbmd0aCA9IG5CaXRMZW5ndGggIT09IHVuZGVmaW5lZCA/IG5CaXRMZW5ndGggOiBuLnRvU3RyaW5nKDIpLmxlbmd0aDtcbiAgY29uc3QgbkJ5dGVMZW5ndGggPSBNYXRoLmNlaWwoX25CaXRMZW5ndGggLyA4KTtcbiAgcmV0dXJuIHsgbkJpdExlbmd0aDogX25CaXRMZW5ndGgsIG5CeXRlTGVuZ3RoIH07XG59XG5cbnR5cGUgRnBGaWVsZCA9IElGaWVsZDxiaWdpbnQ+ICYgUmVxdWlyZWQ8UGljazxJRmllbGQ8YmlnaW50PiwgJ2lzT2RkJz4+O1xudHlwZSBTcXJ0Rm4gPSAobjogYmlnaW50KSA9PiBiaWdpbnQ7XG50eXBlIEZpZWxkT3B0cyA9IFBhcnRpYWw8e1xuICBpc0xFOiBib29sZWFuO1xuICBCSVRTOiBudW1iZXI7XG4gIHNxcnQ6IFNxcnRGbjtcbiAgYWxsb3dlZExlbmd0aHM/OiByZWFkb25seSBudW1iZXJbXTsgLy8gZm9yIFA1MjEgKGFkZHMgcGFkZGluZyBmb3Igc21hbGxlciBzaXplcylcbiAgbW9kRnJvbUJ5dGVzOiBib29sZWFuOyAvLyBibHMxMi0zODEgcmVxdWlyZXMgbW9kKG4pIGluc3RlYWQgb2YgcmVqZWN0aW5nIGtleXMgPj0gblxufT47XG5jbGFzcyBfRmllbGQgaW1wbGVtZW50cyBJRmllbGQ8YmlnaW50PiB7XG4gIHJlYWRvbmx5IE9SREVSOiBiaWdpbnQ7XG4gIHJlYWRvbmx5IEJJVFM6IG51bWJlcjtcbiAgcmVhZG9ubHkgQllURVM6IG51bWJlcjtcbiAgcmVhZG9ubHkgaXNMRTogYm9vbGVhbjtcbiAgcmVhZG9ubHkgWkVSTyA9IF8wbjtcbiAgcmVhZG9ubHkgT05FID0gXzFuO1xuICByZWFkb25seSBfbGVuZ3Rocz86IG51bWJlcltdO1xuICBwcml2YXRlIF9zcXJ0OiBSZXR1cm5UeXBlPHR5cGVvZiBGcFNxcnQ+IHwgdW5kZWZpbmVkOyAvLyBjYWNoZWQgc3FydFxuICBwcml2YXRlIHJlYWRvbmx5IF9tb2Q/OiBib29sZWFuO1xuICBjb25zdHJ1Y3RvcihPUkRFUjogYmlnaW50LCBvcHRzOiBGaWVsZE9wdHMgPSB7fSkge1xuICAgIGlmIChPUkRFUiA8PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZDogZXhwZWN0ZWQgT1JERVIgPiAwLCBnb3QgJyArIE9SREVSKTtcbiAgICBsZXQgX25iaXRMZW5ndGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmlzTEUgPSBmYWxzZTtcbiAgICBpZiAob3B0cyAhPSBudWxsICYmIHR5cGVvZiBvcHRzID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLkJJVFMgPT09ICdudW1iZXInKSBfbmJpdExlbmd0aCA9IG9wdHMuQklUUztcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5zcXJ0ID09PSAnZnVuY3Rpb24nKSB0aGlzLnNxcnQgPSBvcHRzLnNxcnQ7XG4gICAgICBpZiAodHlwZW9mIG9wdHMuaXNMRSA9PT0gJ2Jvb2xlYW4nKSB0aGlzLmlzTEUgPSBvcHRzLmlzTEU7XG4gICAgICBpZiAob3B0cy5hbGxvd2VkTGVuZ3RocykgdGhpcy5fbGVuZ3RocyA9IG9wdHMuYWxsb3dlZExlbmd0aHM/LnNsaWNlKCk7XG4gICAgICBpZiAodHlwZW9mIG9wdHMubW9kRnJvbUJ5dGVzID09PSAnYm9vbGVhbicpIHRoaXMuX21vZCA9IG9wdHMubW9kRnJvbUJ5dGVzO1xuICAgIH1cbiAgICBjb25zdCB7IG5CaXRMZW5ndGgsIG5CeXRlTGVuZ3RoIH0gPSBuTGVuZ3RoKE9SREVSLCBfbmJpdExlbmd0aCk7XG4gICAgaWYgKG5CeXRlTGVuZ3RoID4gMjA0OCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkOiBleHBlY3RlZCBPUkRFUiBvZiA8PSAyMDQ4IGJ5dGVzJyk7XG4gICAgdGhpcy5PUkRFUiA9IE9SREVSO1xuICAgIHRoaXMuQklUUyA9IG5CaXRMZW5ndGg7XG4gICAgdGhpcy5CWVRFUyA9IG5CeXRlTGVuZ3RoO1xuICAgIHRoaXMuX3NxcnQgPSB1bmRlZmluZWQ7XG4gICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHRoaXMpO1xuICB9XG5cbiAgY3JlYXRlKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChudW0sIHRoaXMuT1JERVIpO1xuICB9XG4gIGlzVmFsaWQobnVtOiBiaWdpbnQpIHtcbiAgICBpZiAodHlwZW9mIG51bSAhPT0gJ2JpZ2ludCcpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQgZWxlbWVudDogZXhwZWN0ZWQgYmlnaW50LCBnb3QgJyArIHR5cGVvZiBudW0pO1xuICAgIHJldHVybiBfMG4gPD0gbnVtICYmIG51bSA8IHRoaXMuT1JERVI7IC8vIDAgaXMgdmFsaWQgZWxlbWVudCwgYnV0IGl0J3Mgbm90IGludmVydGlibGVcbiAgfVxuICBpczAobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbnVtID09PSBfMG47XG4gIH1cbiAgLy8gaXMgdmFsaWQgYW5kIGludmVydGlibGVcbiAgaXNWYWxpZE5vdDAobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gIXRoaXMuaXMwKG51bSkgJiYgdGhpcy5pc1ZhbGlkKG51bSk7XG4gIH1cbiAgaXNPZGQobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gKG51bSAmIF8xbikgPT09IF8xbjtcbiAgfVxuICBuZWcobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKC1udW0sIHRoaXMuT1JERVIpO1xuICB9XG4gIGVxbChsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzID09PSByaHM7XG4gIH1cblxuICBzcXIobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKG51bSAqIG51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgYWRkKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzICsgcmhzLCB0aGlzLk9SREVSKTtcbiAgfVxuICBzdWIobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgLSByaHMsIHRoaXMuT1JERVIpO1xuICB9XG4gIG11bChsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyAqIHJocywgdGhpcy5PUkRFUik7XG4gIH1cbiAgcG93KG51bTogYmlnaW50LCBwb3dlcjogYmlnaW50KTogYmlnaW50IHtcbiAgICByZXR1cm4gRnBQb3codGhpcywgbnVtLCBwb3dlcik7XG4gIH1cbiAgZGl2KGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzICogaW52ZXJ0KHJocywgdGhpcy5PUkRFUiksIHRoaXMuT1JERVIpO1xuICB9XG5cbiAgLy8gU2FtZSBhcyBhYm92ZSwgYnV0IGRvZXNuJ3Qgbm9ybWFsaXplXG4gIHNxck4obnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbnVtICogbnVtO1xuICB9XG4gIGFkZE4obGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyArIHJocztcbiAgfVxuICBzdWJOKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgLSByaHM7XG4gIH1cbiAgbXVsTihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzICogcmhzO1xuICB9XG5cbiAgaW52KG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIGludmVydChudW0sIHRoaXMuT1JERVIpO1xuICB9XG4gIHNxcnQobnVtOiBiaWdpbnQpOiBiaWdpbnQge1xuICAgIC8vIENhY2hpbmcgX3NxcnQgc3BlZWRzIHVwIHNxcnQ5bW9kMTYgYnkgNXggYW5kIHRvbm5lbGktc2hhbmtzIGJ5IDEwJVxuICAgIGlmICghdGhpcy5fc3FydCkgdGhpcy5fc3FydCA9IEZwU3FydCh0aGlzLk9SREVSKTtcbiAgICByZXR1cm4gdGhpcy5fc3FydCh0aGlzLCBudW0pO1xuICB9XG4gIHRvQnl0ZXMobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gdGhpcy5pc0xFID8gbnVtYmVyVG9CeXRlc0xFKG51bSwgdGhpcy5CWVRFUykgOiBudW1iZXJUb0J5dGVzQkUobnVtLCB0aGlzLkJZVEVTKTtcbiAgfVxuICBmcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXksIHNraXBWYWxpZGF0aW9uID0gZmFsc2UpIHtcbiAgICBhYnl0ZXMoYnl0ZXMpO1xuICAgIGNvbnN0IHsgX2xlbmd0aHM6IGFsbG93ZWRMZW5ndGhzLCBCWVRFUywgaXNMRSwgT1JERVIsIF9tb2Q6IG1vZEZyb21CeXRlcyB9ID0gdGhpcztcbiAgICBpZiAoYWxsb3dlZExlbmd0aHMpIHtcbiAgICAgIGlmICghYWxsb3dlZExlbmd0aHMuaW5jbHVkZXMoYnl0ZXMubGVuZ3RoKSB8fCBieXRlcy5sZW5ndGggPiBCWVRFUykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ0ZpZWxkLmZyb21CeXRlczogZXhwZWN0ZWQgJyArIGFsbG93ZWRMZW5ndGhzICsgJyBieXRlcywgZ290ICcgKyBieXRlcy5sZW5ndGhcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhZGRlZCA9IG5ldyBVaW50OEFycmF5KEJZVEVTKTtcbiAgICAgIC8vIGlzTEUgYWRkIDAgdG8gcmlnaHQsICFpc0xFIHRvIHRoZSBsZWZ0LlxuICAgICAgcGFkZGVkLnNldChieXRlcywgaXNMRSA/IDAgOiBwYWRkZWQubGVuZ3RoIC0gYnl0ZXMubGVuZ3RoKTtcbiAgICAgIGJ5dGVzID0gcGFkZGVkO1xuICAgIH1cbiAgICBpZiAoYnl0ZXMubGVuZ3RoICE9PSBCWVRFUylcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmllbGQuZnJvbUJ5dGVzOiBleHBlY3RlZCAnICsgQllURVMgKyAnIGJ5dGVzLCBnb3QgJyArIGJ5dGVzLmxlbmd0aCk7XG4gICAgbGV0IHNjYWxhciA9IGlzTEUgPyBieXRlc1RvTnVtYmVyTEUoYnl0ZXMpIDogYnl0ZXNUb051bWJlckJFKGJ5dGVzKTtcbiAgICBpZiAobW9kRnJvbUJ5dGVzKSBzY2FsYXIgPSBtb2Qoc2NhbGFyLCBPUkRFUik7XG4gICAgaWYgKCFza2lwVmFsaWRhdGlvbilcbiAgICAgIGlmICghdGhpcy5pc1ZhbGlkKHNjYWxhcikpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZCBlbGVtZW50OiBvdXRzaWRlIG9mIHJhbmdlIDAuLk9SREVSJyk7XG4gICAgLy8gTk9URTogd2UgZG9uJ3QgdmFsaWRhdGUgc2NhbGFyIGhlcmUsIHBsZWFzZSB1c2UgaXNWYWxpZC4gVGhpcyBkb25lIHN1Y2ggd2F5IGJlY2F1c2Ugc29tZVxuICAgIC8vIHByb3RvY29sIG1heSBhbGxvdyBub24tcmVkdWNlZCBzY2FsYXIgdGhhdCByZWR1Y2VkIGxhdGVyIG9yIGNoYW5nZWQgc29tZSBvdGhlciB3YXkuXG4gICAgcmV0dXJuIHNjYWxhcjtcbiAgfVxuICAvLyBUT0RPOiB3ZSBkb24ndCBuZWVkIGl0IGhlcmUsIG1vdmUgb3V0IHRvIHNlcGFyYXRlIGZuXG4gIGludmVydEJhdGNoKGxzdDogYmlnaW50W10pOiBiaWdpbnRbXSB7XG4gICAgcmV0dXJuIEZwSW52ZXJ0QmF0Y2godGhpcywgbHN0KTtcbiAgfVxuICAvLyBXZSBjYW4ndCBtb3ZlIHRoaXMgb3V0IGJlY2F1c2UgRnA2LCBGcDEyIGltcGxlbWVudCBpdFxuICAvLyBhbmQgaXQncyB1bmNsZWFyIHdoYXQgdG8gcmV0dXJuIGluIHRoZXJlLlxuICBjbW92KGE6IGJpZ2ludCwgYjogYmlnaW50LCBjb25kaXRpb246IGJvb2xlYW4pIHtcbiAgICByZXR1cm4gY29uZGl0aW9uID8gYiA6IGE7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZmluaXRlIGZpZWxkLiBNYWpvciBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25zOlxuICogKiAxLiBEZW5vcm1hbGl6ZWQgb3BlcmF0aW9ucyBsaWtlIG11bE4gaW5zdGVhZCBvZiBtdWwuXG4gKiAqIDIuIElkZW50aWNhbCBvYmplY3Qgc2hhcGU6IG5ldmVyIGFkZCBvciByZW1vdmUga2V5cy5cbiAqICogMy4gYE9iamVjdC5mcmVlemVgLlxuICogRnJhZ2lsZTogYWx3YXlzIHJ1biBhIGJlbmNobWFyayBvbiBhIGNoYW5nZS5cbiAqIFNlY3VyaXR5IG5vdGU6IG9wZXJhdGlvbnMgZG9uJ3QgY2hlY2sgJ2lzVmFsaWQnIGZvciBhbGwgZWxlbWVudHMgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gKiBpdCBpcyBjYWxsZXIgcmVzcG9uc2liaWxpdHkgdG8gY2hlY2sgdGhpcy5cbiAqIFRoaXMgaXMgbG93LWxldmVsIGNvZGUsIHBsZWFzZSBtYWtlIHN1cmUgeW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmcuXG4gKlxuICogTm90ZSBhYm91dCBmaWVsZCBwcm9wZXJ0aWVzOlxuICogKiBDSEFSQUNURVJJU1RJQyBwID0gcHJpbWUgbnVtYmVyLCBudW1iZXIgb2YgZWxlbWVudHMgaW4gbWFpbiBzdWJncm91cC5cbiAqICogT1JERVIgcSA9IHNpbWlsYXIgdG8gY29mYWN0b3IgaW4gY3VydmVzLCBtYXkgYmUgY29tcG9zaXRlIGBxID0gcF5tYC5cbiAqXG4gKiBAcGFyYW0gT1JERVIgZmllbGQgb3JkZXIsIHByb2JhYmx5IHByaW1lLCBvciBjb3VsZCBiZSBjb21wb3NpdGVcbiAqIEBwYXJhbSBiaXRMZW4gaG93IG1hbnkgYml0cyB0aGUgZmllbGQgY29uc3VtZXNcbiAqIEBwYXJhbSBpc0xFIChkZWZhdWx0OiBmYWxzZSkgaWYgZW5jb2RpbmcgLyBkZWNvZGluZyBzaG91bGQgYmUgaW4gbGl0dGxlLWVuZGlhblxuICogQHBhcmFtIHJlZGVmIG9wdGlvbmFsIGZhc3RlciByZWRlZmluaXRpb25zIG9mIHNxcnQgYW5kIG90aGVyIG1ldGhvZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkKE9SREVSOiBiaWdpbnQsIG9wdHM6IEZpZWxkT3B0cyA9IHt9KTogUmVhZG9ubHk8RnBGaWVsZD4ge1xuICByZXR1cm4gbmV3IF9GaWVsZChPUkRFUiwgb3B0cyk7XG59XG5cbi8vIEdlbmVyaWMgcmFuZG9tIHNjYWxhciwgd2UgY2FuIGRvIHNhbWUgZm9yIG90aGVyIGZpZWxkcyBpZiB2aWEgRnAyLm11bChGcDIuT05FLCBGcDIucmFuZG9tKT9cbi8vIFRoaXMgYWxsb3dzIHVuc2FmZSBtZXRob2RzIGxpa2UgaWdub3JlIGJpYXMgb3IgemVyby4gVGhlc2UgdW5zYWZlLCBidXQgb2Z0ZW4gdXNlZCBpbiBkaWZmZXJlbnQgcHJvdG9jb2xzIChpZiBkZXRlcm1pbmlzdGljIFJORykuXG4vLyB3aGljaCBtZWFuIHdlIGNhbm5vdCBmb3JjZSB0aGlzIHZpYSBvcHRzLlxuLy8gTm90IHN1cmUgd2hhdCB0byBkbyB3aXRoIHJhbmRvbUJ5dGVzLCB3ZSBjYW4gYWNjZXB0IGl0IGluc2lkZSBvcHRzIGlmIHdhbnRlZC5cbi8vIFByb2JhYmx5IG5lZWQgdG8gZXhwb3J0IGdldE1pbkhhc2hMZW5ndGggc29tZXdoZXJlP1xuLy8gcmFuZG9tKGJ5dGVzPzogVWludDhBcnJheSwgdW5zYWZlQWxsb3daZXJvID0gZmFsc2UsIHVuc2FmZUFsbG93QmlhcyA9IGZhbHNlKSB7XG4vLyAgIGNvbnN0IExFTiA9ICF1bnNhZmVBbGxvd0JpYXMgPyBnZXRNaW5IYXNoTGVuZ3RoKE9SREVSKSA6IEJZVEVTO1xuLy8gICBpZiAoYnl0ZXMgPT09IHVuZGVmaW5lZCkgYnl0ZXMgPSByYW5kb21CeXRlcyhMRU4pOyAvLyBfb3B0cy5yYW5kb21CeXRlcz9cbi8vICAgY29uc3QgbnVtID0gaXNMRSA/IGJ5dGVzVG9OdW1iZXJMRShieXRlcykgOiBieXRlc1RvTnVtYmVyQkUoYnl0ZXMpO1xuLy8gICAvLyBgbW9kKHgsIDExKWAgY2FuIHNvbWV0aW1lcyBwcm9kdWNlIDAuIGBtb2QoeCwgMTApICsgMWAgaXMgdGhlIHNhbWUsIGJ1dCBubyAwXG4vLyAgIGNvbnN0IHJlZHVjZWQgPSB1bnNhZmVBbGxvd1plcm8gPyBtb2QobnVtLCBPUkRFUikgOiBtb2QobnVtLCBPUkRFUiAtIF8xbikgKyBfMW47XG4vLyAgIHJldHVybiByZWR1Y2VkO1xuLy8gfSxcblxuZXhwb3J0IGZ1bmN0aW9uIEZwU3FydE9kZDxUPihGcDogSUZpZWxkPFQ+LCBlbG06IFQpOiBUIHtcbiAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKFwiRmllbGQgZG9lc24ndCBoYXZlIGlzT2RkXCIpO1xuICBjb25zdCByb290ID0gRnAuc3FydChlbG0pO1xuICByZXR1cm4gRnAuaXNPZGQocm9vdCkgPyByb290IDogRnAubmVnKHJvb3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRnBTcXJ0RXZlbjxUPihGcDogSUZpZWxkPFQ+LCBlbG06IFQpOiBUIHtcbiAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKFwiRmllbGQgZG9lc24ndCBoYXZlIGlzT2RkXCIpO1xuICBjb25zdCByb290ID0gRnAuc3FydChlbG0pO1xuICByZXR1cm4gRnAuaXNPZGQocm9vdCkgPyBGcC5uZWcocm9vdCkgOiByb290O1xufVxuXG4vKipcbiAqIFJldHVybnMgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGNvbnN1bWVkIGJ5IHRoZSBmaWVsZCBlbGVtZW50LlxuICogRm9yIGV4YW1wbGUsIDMyIGJ5dGVzIGZvciB1c3VhbCAyNTYtYml0IHdlaWVyc3RyYXNzIGN1cnZlLlxuICogQHBhcmFtIGZpZWxkT3JkZXIgbnVtYmVyIG9mIGZpZWxkIGVsZW1lbnRzLCB1c3VhbGx5IENVUlZFLm5cbiAqIEByZXR1cm5zIGJ5dGUgbGVuZ3RoIG9mIGZpZWxkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWVsZEJ5dGVzTGVuZ3RoKGZpZWxkT3JkZXI6IGJpZ2ludCk6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgZmllbGRPcmRlciAhPT0gJ2JpZ2ludCcpIHRocm93IG5ldyBFcnJvcignZmllbGQgb3JkZXIgbXVzdCBiZSBiaWdpbnQnKTtcbiAgY29uc3QgYml0TGVuZ3RoID0gZmllbGRPcmRlci50b1N0cmluZygyKS5sZW5ndGg7XG4gIHJldHVybiBNYXRoLmNlaWwoYml0TGVuZ3RoIC8gOCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBtaW5pbWFsIGFtb3VudCBvZiBieXRlcyB0aGF0IGNhbiBiZSBzYWZlbHkgcmVkdWNlZFxuICogYnkgZmllbGQgb3JkZXIuXG4gKiBTaG91bGQgYmUgMl4tMTI4IGZvciAxMjgtYml0IGN1cnZlIHN1Y2ggYXMgUDI1Ni5cbiAqIEBwYXJhbSBmaWVsZE9yZGVyIG51bWJlciBvZiBmaWVsZCBlbGVtZW50cywgdXN1YWxseSBDVVJWRS5uXG4gKiBAcmV0dXJucyBieXRlIGxlbmd0aCBvZiB0YXJnZXQgaGFzaFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWluSGFzaExlbmd0aChmaWVsZE9yZGVyOiBiaWdpbnQpOiBudW1iZXIge1xuICBjb25zdCBsZW5ndGggPSBnZXRGaWVsZEJ5dGVzTGVuZ3RoKGZpZWxkT3JkZXIpO1xuICByZXR1cm4gbGVuZ3RoICsgTWF0aC5jZWlsKGxlbmd0aCAvIDIpO1xufVxuXG4vKipcbiAqIFwiQ29uc3RhbnQtdGltZVwiIHByaXZhdGUga2V5IGdlbmVyYXRpb24gdXRpbGl0eS5cbiAqIENhbiB0YWtlIChuICsgbi8yKSBvciBtb3JlIGJ5dGVzIG9mIHVuaWZvcm0gaW5wdXQgZS5nLiBmcm9tIENTUFJORyBvciBLREZcbiAqIGFuZCBjb252ZXJ0IHRoZW0gaW50byBwcml2YXRlIHNjYWxhciwgd2l0aCB0aGUgbW9kdWxvIGJpYXMgYmVpbmcgbmVnbGlnaWJsZS5cbiAqIE5lZWRzIGF0IGxlYXN0IDQ4IGJ5dGVzIG9mIGlucHV0IGZvciAzMi1ieXRlIHByaXZhdGUga2V5LlxuICogaHR0cHM6Ly9yZXNlYXJjaC5rdWRlbHNraXNlY3VyaXR5LmNvbS8yMDIwLzA3LzI4L3RoZS1kZWZpbml0aXZlLWd1aWRlLXRvLW1vZHVsby1iaWFzLWFuZC1ob3ctdG8tYXZvaWQtaXQvXG4gKiBGSVBTIDE4Ni01LCBBLjIgaHR0cHM6Ly9jc3JjLm5pc3QuZ292L3B1YmxpY2F0aW9ucy9kZXRhaWwvZmlwcy8xODYvNS9maW5hbFxuICogUkZDIDkzODAsIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM5MzgwI3NlY3Rpb24tNVxuICogQHBhcmFtIGhhc2ggaGFzaCBvdXRwdXQgZnJvbSBTSEEzIG9yIGEgc2ltaWxhciBmdW5jdGlvblxuICogQHBhcmFtIGdyb3VwT3JkZXIgc2l6ZSBvZiBzdWJncm91cCAtIChlLmcuIHNlY3AyNTZrMS5Qb2ludC5Gbi5PUkRFUilcbiAqIEBwYXJhbSBpc0xFIGludGVycHJldCBoYXNoIGJ5dGVzIGFzIExFIG51bVxuICogQHJldHVybnMgdmFsaWQgcHJpdmF0ZSBzY2FsYXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcEhhc2hUb0ZpZWxkKGtleTogVWludDhBcnJheSwgZmllbGRPcmRlcjogYmlnaW50LCBpc0xFID0gZmFsc2UpOiBVaW50OEFycmF5IHtcbiAgYWJ5dGVzKGtleSk7XG4gIGNvbnN0IGxlbiA9IGtleS5sZW5ndGg7XG4gIGNvbnN0IGZpZWxkTGVuID0gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyKTtcbiAgY29uc3QgbWluTGVuID0gZ2V0TWluSGFzaExlbmd0aChmaWVsZE9yZGVyKTtcbiAgLy8gTm8gc21hbGwgbnVtYmVyczogbmVlZCB0byB1bmRlcnN0YW5kIGJpYXMgc3RvcnkuIE5vIGh1Z2UgbnVtYmVyczogZWFzaWVyIHRvIGRldGVjdCBKUyB0aW1pbmdzLlxuICBpZiAobGVuIDwgMTYgfHwgbGVuIDwgbWluTGVuIHx8IGxlbiA+IDEwMjQpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCAnICsgbWluTGVuICsgJy0xMDI0IGJ5dGVzIG9mIGlucHV0LCBnb3QgJyArIGxlbik7XG4gIGNvbnN0IG51bSA9IGlzTEUgPyBieXRlc1RvTnVtYmVyTEUoa2V5KSA6IGJ5dGVzVG9OdW1iZXJCRShrZXkpO1xuICAvLyBgbW9kKHgsIDExKWAgY2FuIHNvbWV0aW1lcyBwcm9kdWNlIDAuIGBtb2QoeCwgMTApICsgMWAgaXMgdGhlIHNhbWUsIGJ1dCBubyAwXG4gIGNvbnN0IHJlZHVjZWQgPSBtb2QobnVtLCBmaWVsZE9yZGVyIC0gXzFuKSArIF8xbjtcbiAgcmV0dXJuIGlzTEUgPyBudW1iZXJUb0J5dGVzTEUocmVkdWNlZCwgZmllbGRMZW4pIDogbnVtYmVyVG9CeXRlc0JFKHJlZHVjZWQsIGZpZWxkTGVuKTtcbn1cbiIsICIvKipcbiAqIFNob3J0IFdlaWVyc3RyYXNzIGN1cnZlIG1ldGhvZHMuIFRoZSBmb3JtdWxhIGlzOiB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYi5cbiAqXG4gKiAjIyMgRGVzaWduIHJhdGlvbmFsZSBmb3IgdHlwZXNcbiAqXG4gKiAqIEludGVyYWN0aW9uIGJldHdlZW4gY2xhc3NlcyBmcm9tIGRpZmZlcmVudCBjdXJ2ZXMgc2hvdWxkIGZhaWw6XG4gKiAgIGBrMjU2LlBvaW50LkJBU0UuYWRkKHAyNTYuUG9pbnQuQkFTRSlgXG4gKiAqIEZvciB0aGlzIHB1cnBvc2Ugd2Ugd2FudCB0byB1c2UgYGluc3RhbmNlb2ZgIG9wZXJhdG9yLCB3aGljaCBpcyBmYXN0IGFuZCB3b3JrcyBkdXJpbmcgcnVudGltZVxuICogKiBEaWZmZXJlbnQgY2FsbHMgb2YgYGN1cnZlKClgIHdvdWxkIHJldHVybiBkaWZmZXJlbnQgY2xhc3NlcyAtXG4gKiAgIGBjdXJ2ZShwYXJhbXMpICE9PSBjdXJ2ZShwYXJhbXMpYDogaWYgc29tZWJvZHkgZGVjaWRlZCB0byBtb25rZXktcGF0Y2ggdGhlaXIgY3VydmUsXG4gKiAgIGl0IHdvbid0IGFmZmVjdCBvdGhlcnNcbiAqXG4gKiBUeXBlU2NyaXB0IGNhbid0IGluZmVyIHR5cGVzIGZvciBjbGFzc2VzIGNyZWF0ZWQgaW5zaWRlIGEgZnVuY3Rpb24uIENsYXNzZXMgaXMgb25lIGluc3RhbmNlXG4gKiBvZiBub21pbmF0aXZlIHR5cGVzIGluIFR5cGVTY3JpcHQgYW5kIGludGVyZmFjZXMgb25seSBjaGVjayBmb3Igc2hhcGUsIHNvIGl0J3MgaGFyZCB0byBjcmVhdGVcbiAqIHVuaXF1ZSB0eXBlIGZvciBldmVyeSBmdW5jdGlvbiBjYWxsLlxuICpcbiAqIFdlIGNhbiB1c2UgZ2VuZXJpYyB0eXBlcyB2aWEgc29tZSBwYXJhbSwgbGlrZSBjdXJ2ZSBvcHRzLCBidXQgdGhhdCB3b3VsZDpcbiAqICAgICAxLiBFbmFibGUgaW50ZXJhY3Rpb24gYmV0d2VlbiBgY3VydmUocGFyYW1zKWAgYW5kIGBjdXJ2ZShwYXJhbXMpYCAoY3VydmVzIG9mIHNhbWUgcGFyYW1zKVxuICogICAgIHdoaWNoIGlzIGhhcmQgdG8gZGVidWcuXG4gKiAgICAgMi4gUGFyYW1zIGNhbiBiZSBnZW5lcmljIGFuZCB3ZSBjYW4ndCBlbmZvcmNlIHRoZW0gdG8gYmUgY29uc3RhbnQgdmFsdWU6XG4gKiAgICAgaWYgc29tZWJvZHkgY3JlYXRlcyBjdXJ2ZSBmcm9tIG5vbi1jb25zdGFudCBwYXJhbXMsXG4gKiAgICAgaXQgd291bGQgYmUgYWxsb3dlZCB0byBpbnRlcmFjdCB3aXRoIG90aGVyIGN1cnZlcyB3aXRoIG5vbi1jb25zdGFudCBwYXJhbXNcbiAqXG4gKiBAdG9kbyBodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay9yZWxlYXNlLW5vdGVzL3R5cGVzY3JpcHQtMi03Lmh0bWwjdW5pcXVlLXN5bWJvbFxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQgeyBobWFjIGFzIG5vYmxlSG1hYyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvaG1hYy5qcyc7XG5pbXBvcnQgeyBhaGFzaCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHtcbiAgYWJvb2wsXG4gIGFieXRlcyxcbiAgYUluUmFuZ2UsXG4gIGJpdExlbixcbiAgYml0TWFzayxcbiAgYnl0ZXNUb0hleCxcbiAgYnl0ZXNUb051bWJlckJFLFxuICBjb25jYXRCeXRlcyxcbiAgY3JlYXRlSG1hY0RyYmcsXG4gIGhleFRvQnl0ZXMsXG4gIGlzQnl0ZXMsXG4gIG1lbW9pemVkLFxuICBudW1iZXJUb0hleFVucGFkZGVkLFxuICB2YWxpZGF0ZU9iamVjdCxcbiAgcmFuZG9tQnl0ZXMgYXMgd2NSYW5kb21CeXRlcyxcbiAgdHlwZSBDSGFzaCxcbiAgdHlwZSBTaWduZXIsXG59IGZyb20gJy4uL3V0aWxzLnRzJztcbmltcG9ydCB7XG4gIGNyZWF0ZUN1cnZlRmllbGRzLFxuICBjcmVhdGVLZXlnZW4sXG4gIG11bEVuZG9VbnNhZmUsXG4gIG5lZ2F0ZUN0LFxuICBub3JtYWxpemVaLFxuICB3TkFGLFxuICB0eXBlIEFmZmluZVBvaW50LFxuICB0eXBlIEN1cnZlTGVuZ3RocyxcbiAgdHlwZSBDdXJ2ZVBvaW50LFxuICB0eXBlIEN1cnZlUG9pbnRDb25zLFxufSBmcm9tICcuL2N1cnZlLnRzJztcbmltcG9ydCB7XG4gIEZwSW52ZXJ0QmF0Y2gsXG4gIGdldE1pbkhhc2hMZW5ndGgsXG4gIG1hcEhhc2hUb0ZpZWxkLFxuICB2YWxpZGF0ZUZpZWxkLFxuICB0eXBlIElGaWVsZCxcbn0gZnJvbSAnLi9tb2R1bGFyLnRzJztcblxuZXhwb3J0IHR5cGUgeyBBZmZpbmVQb2ludCB9O1xuXG50eXBlIEVuZG9CYXNpcyA9IFtbYmlnaW50LCBiaWdpbnRdLCBbYmlnaW50LCBiaWdpbnRdXTtcbi8qKlxuICogV2hlbiBXZWllcnN0cmFzcyBjdXJ2ZSBoYXMgYGE9MGAsIGl0IGJlY29tZXMgS29ibGl0eiBjdXJ2ZS5cbiAqIEtvYmxpdHogY3VydmVzIGFsbG93IHVzaW5nICoqZWZmaWNpZW50bHktY29tcHV0YWJsZSBHTFYgZW5kb21vcnBoaXNtIFx1MDNDOCoqLlxuICogRW5kb21vcnBoaXNtIHVzZXMgMnggbGVzcyBSQU0sIHNwZWVkcyB1cCBwcmVjb21wdXRhdGlvbiBieSAyeCBhbmQgRUNESCAvIGtleSByZWNvdmVyeSBieSAyMCUuXG4gKiBGb3IgcHJlY29tcHV0ZWQgd05BRiBpdCB0cmFkZXMgb2ZmIDEvMiBpbml0IHRpbWUgJiAxLzMgcmFtIGZvciAyMCUgcGVyZiBoaXQuXG4gKlxuICogRW5kb21vcnBoaXNtIGNvbnNpc3RzIG9mIGJldGEsIGxhbWJkYSBhbmQgc3BsaXRTY2FsYXI6XG4gKlxuICogMS4gR0xWIGVuZG9tb3JwaGlzbSBcdTAzQzggdHJhbnNmb3JtcyBhIHBvaW50OiBgUCA9ICh4LCB5KSBcdTIxQTYgXHUwM0M4KFApID0gKFx1MDNCMlx1MDBCN3ggbW9kIHAsIHkpYFxuICogMi4gR0xWIHNjYWxhciBkZWNvbXBvc2l0aW9uIHRyYW5zZm9ybXMgYSBzY2FsYXI6IGBrIFx1MjI2MSBrXHUyMDgxICsga1x1MjA4Mlx1MDBCN1x1MDNCQiAobW9kIG4pYFxuICogMy4gVGhlbiB0aGVzZSBhcmUgY29tYmluZWQ6IGBrXHUwMEI3UCA9IGtcdTIwODFcdTAwQjdQICsga1x1MjA4Mlx1MDBCN1x1MDNDOChQKWBcbiAqIDQuIFR3byAxMjgtYml0IHBvaW50LWJ5LXNjYWxhciBtdWx0aXBsaWNhdGlvbnMgKyBvbmUgcG9pbnQgYWRkaXRpb24gaXMgZmFzdGVyIHRoYW5cbiAqICAgIG9uZSAyNTYtYml0IG11bHRpcGxpY2F0aW9uLlxuICpcbiAqIHdoZXJlXG4gKiAqIGJldGE6IFx1MDNCMiBcdTIyMDggRlx1MjA5QSB3aXRoIFx1MDNCMlx1MDBCMyA9IDEsIFx1MDNCMiBcdTIyNjAgMVxuICogKiBsYW1iZGE6IFx1MDNCQiBcdTIyMDggRlx1MjA5OSB3aXRoIFx1MDNCQlx1MDBCMyA9IDEsIFx1MDNCQiBcdTIyNjAgMVxuICogKiBzcGxpdFNjYWxhciBkZWNvbXBvc2VzIGsgXHUyMUE2IGtcdTIwODEsIGtcdTIwODIsIGJ5IHVzaW5nIHJlZHVjZWQgYmFzaXMgdmVjdG9ycy5cbiAqICAgR2F1c3MgbGF0dGljZSByZWR1Y3Rpb24gY2FsY3VsYXRlcyB0aGVtIGZyb20gaW5pdGlhbCBiYXNpcyB2ZWN0b3JzIGAobiwgMCksICgtXHUwM0JCLCAwKWBcbiAqXG4gKiBDaGVjayBvdXQgYHRlc3QvbWlzYy9lbmRvbW9ycGhpc20uanNgIGFuZFxuICogW2dpc3RdKGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxtaWxsci9lYjY3MDgwNjc5M2U4NGRmNjI4YTdjNDM0YTg3MzA2NikuXG4gKi9cbmV4cG9ydCB0eXBlIEVuZG9tb3JwaGlzbU9wdHMgPSB7XG4gIGJldGE6IGJpZ2ludDtcbiAgYmFzaXNlcz86IEVuZG9CYXNpcztcbiAgc3BsaXRTY2FsYXI/OiAoazogYmlnaW50KSA9PiB7IGsxbmVnOiBib29sZWFuOyBrMTogYmlnaW50OyBrMm5lZzogYm9vbGVhbjsgazI6IGJpZ2ludCB9O1xufTtcbi8vIFdlIGNvbnN0cnVjdCBiYXNpcyBpbiBzdWNoIHdheSB0aGF0IGRlbiBpcyBhbHdheXMgcG9zaXRpdmUgYW5kIGVxdWFscyBuLCBidXQgbnVtIHNpZ24gZGVwZW5kcyBvbiBiYXNpcyAobm90IG9uIHNlY3JldCB2YWx1ZSlcbmNvbnN0IGRpdk5lYXJlc3QgPSAobnVtOiBiaWdpbnQsIGRlbjogYmlnaW50KSA9PiAobnVtICsgKG51bSA+PSAwID8gZGVuIDogLWRlbikgLyBfMm4pIC8gZGVuO1xuXG5leHBvcnQgdHlwZSBTY2FsYXJFbmRvUGFydHMgPSB7IGsxbmVnOiBib29sZWFuOyBrMTogYmlnaW50OyBrMm5lZzogYm9vbGVhbjsgazI6IGJpZ2ludCB9O1xuXG4vKipcbiAqIFNwbGl0cyBzY2FsYXIgZm9yIEdMViBlbmRvbW9ycGhpc20uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBfc3BsaXRFbmRvU2NhbGFyKGs6IGJpZ2ludCwgYmFzaXM6IEVuZG9CYXNpcywgbjogYmlnaW50KTogU2NhbGFyRW5kb1BhcnRzIHtcbiAgLy8gU3BsaXQgc2NhbGFyIGludG8gdHdvIHN1Y2ggdGhhdCBwYXJ0IGlzIH5oYWxmIGJpdHM6IGBhYnMocGFydCkgPCBzcXJ0KE4pYFxuICAvLyBTaW5jZSBwYXJ0IGNhbiBiZSBuZWdhdGl2ZSwgd2UgbmVlZCB0byBkbyB0aGlzIG9uIHBvaW50LlxuICAvLyBUT0RPOiB2ZXJpZnlTY2FsYXIgZnVuY3Rpb24gd2hpY2ggY29uc3VtZXMgbGFtYmRhXG4gIGNvbnN0IFtbYTEsIGIxXSwgW2EyLCBiMl1dID0gYmFzaXM7XG4gIGNvbnN0IGMxID0gZGl2TmVhcmVzdChiMiAqIGssIG4pO1xuICBjb25zdCBjMiA9IGRpdk5lYXJlc3QoLWIxICogaywgbik7XG4gIC8vIHxrMXwvfGsyfCBpcyA8IHNxcnQoTiksIGJ1dCBjYW4gYmUgbmVnYXRpdmUuXG4gIC8vIElmIHdlIGRvIGBrMSBtb2QgTmAsIHdlJ2xsIGdldCBiaWcgc2NhbGFyIChgPiBzcXJ0KE4pYCk6IHNvLCB3ZSBkbyBjaGVhcGVyIG5lZ2F0aW9uIGluc3RlYWQuXG4gIGxldCBrMSA9IGsgLSBjMSAqIGExIC0gYzIgKiBhMjtcbiAgbGV0IGsyID0gLWMxICogYjEgLSBjMiAqIGIyO1xuICBjb25zdCBrMW5lZyA9IGsxIDwgXzBuO1xuICBjb25zdCBrMm5lZyA9IGsyIDwgXzBuO1xuICBpZiAoazFuZWcpIGsxID0gLWsxO1xuICBpZiAoazJuZWcpIGsyID0gLWsyO1xuICAvLyBEb3VibGUgY2hlY2sgdGhhdCByZXN1bHRpbmcgc2NhbGFyIGxlc3MgdGhhbiBoYWxmIGJpdHMgb2YgTjogb3RoZXJ3aXNlIHdOQUYgd2lsbCBmYWlsLlxuICAvLyBUaGlzIHNob3VsZCBvbmx5IGhhcHBlbiBvbiB3cm9uZyBiYXNpc2VzLiBBbHNvLCBtYXRoIGluc2lkZSBpcyB0b28gY29tcGxleCBhbmQgSSBkb24ndCB0cnVzdCBpdC5cbiAgY29uc3QgTUFYX05VTSA9IGJpdE1hc2soTWF0aC5jZWlsKGJpdExlbihuKSAvIDIpKSArIF8xbjsgLy8gSGFsZiBiaXRzIG9mIE5cbiAgaWYgKGsxIDwgXzBuIHx8IGsxID49IE1BWF9OVU0gfHwgazIgPCBfMG4gfHwgazIgPj0gTUFYX05VTSkge1xuICAgIHRocm93IG5ldyBFcnJvcignc3BsaXRTY2FsYXIgKGVuZG9tb3JwaGlzbSk6IGZhaWxlZCwgaz0nICsgayk7XG4gIH1cbiAgcmV0dXJuIHsgazFuZWcsIGsxLCBrMm5lZywgazIgfTtcbn1cblxuLyoqXG4gKiBPcHRpb24gdG8gZW5hYmxlIGhlZGdlZCBzaWduYXR1cmVzIHdpdGggaW1wcm92ZWQgc2VjdXJpdHkuXG4gKlxuICogKiBSYW5kb21seSBnZW5lcmF0ZWQgayBpcyBiYWQsIGJlY2F1c2UgYnJva2VuIENTUFJORyB3b3VsZCBsZWFrIHByaXZhdGUga2V5cy5cbiAqICogRGV0ZXJtaW5pc3RpYyBrIChSRkM2OTc5KSBpcyBiZXR0ZXI7IGJ1dCBpcyBzdXNwZWN0aWJsZSB0byBmYXVsdCBhdHRhY2tzLlxuICpcbiAqIFdlIGFsbG93IHVzaW5nIHRlY2huaXF1ZSBkZXNjcmliZWQgaW4gUkZDNjk3OSAzLjY6IGFkZGl0aW9uYWwgaycsIGEuay5hLiBhZGRpbmcgcmFuZG9tbmVzc1xuICogdG8gZGV0ZXJtaW5pc3RpYyBzaWcuIElmIENTUFJORyBpcyBicm9rZW4gJiByYW5kb21uZXNzIGlzIHdlYWssIGl0IHdvdWxkIFNUSUxMIGJlIGFzIHNlY3VyZVxuICogYXMgb3JkaW5hcnkgc2lnIHdpdGhvdXQgRXh0cmFFbnRyb3B5LlxuICpcbiAqICogYHRydWVgIG1lYW5zIFwiZmV0Y2ggZGF0YSwgZnJvbSBDU1BSTkcsIGluY29ycG9yYXRlIGl0IGludG8gayBnZW5lcmF0aW9uXCJcbiAqICogYGZhbHNlYCBtZWFucyBcImRpc2FibGUgZXh0cmEgZW50cm9weSwgdXNlIHB1cmVseSBkZXRlcm1pbmlzdGljIGtcIlxuICogKiBgVWludDhBcnJheWAgcGFzc2VkIG1lYW5zIFwiaW5jb3Jwb3JhdGUgZm9sbG93aW5nIGRhdGEgaW50byBrIGdlbmVyYXRpb25cIlxuICpcbiAqIGh0dHBzOi8vcGF1bG1pbGxyLmNvbS9wb3N0cy9kZXRlcm1pbmlzdGljLXNpZ25hdHVyZXMvXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBRXh0cmFFbnRyb3B5ID0gYm9vbGVhbiB8IFVpbnQ4QXJyYXk7XG4vKipcbiAqIC0gYGNvbXBhY3RgIGlzIHRoZSBkZWZhdWx0IGZvcm1hdFxuICogLSBgcmVjb3ZlcmVkYCBpcyB0aGUgc2FtZSBhcyBjb21wYWN0LCBidXQgd2l0aCBhbiBleHRyYSBieXRlIGluZGljYXRpbmcgcmVjb3ZlcnkgYnl0ZVxuICogLSBgZGVyYCBpcyBBU04uMSBERVIgZW5jb2RpbmdcbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FTaWduYXR1cmVGb3JtYXQgPSAnY29tcGFjdCcgfCAncmVjb3ZlcmVkJyB8ICdkZXInO1xuLyoqXG4gKiAtIGBwcmVoYXNoYDogKGRlZmF1bHQ6IHRydWUpIGluZGljYXRlcyB3aGV0aGVyIHRvIGRvIHNoYTI1NihtZXNzYWdlKS5cbiAqICAgV2hlbiBhIGN1c3RvbSBoYXNoIGlzIHVzZWQsIGl0IG11c3QgYmUgc2V0IHRvIGBmYWxzZWAuXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBUmVjb3Zlck9wdHMgPSB7XG4gIHByZWhhc2g/OiBib29sZWFuO1xufTtcbi8qKlxuICogLSBgcHJlaGFzaGA6IChkZWZhdWx0OiB0cnVlKSBpbmRpY2F0ZXMgd2hldGhlciB0byBkbyBzaGEyNTYobWVzc2FnZSkuXG4gKiAgIFdoZW4gYSBjdXN0b20gaGFzaCBpcyB1c2VkLCBpdCBtdXN0IGJlIHNldCB0byBgZmFsc2VgLlxuICogLSBgbG93U2A6IChkZWZhdWx0OiB0cnVlKSBwcm9oaWJpdHMgc2lnbmF0dXJlcyB3aGljaCBoYXZlIChzaWcucyA+PSBDVVJWRS5uLzJuKS5cbiAqICAgQ29tcGF0aWJsZSB3aXRoIEJUQy9FVEguIFNldHRpbmcgYGxvd1M6IGZhbHNlYCBhbGxvd3MgdG8gY3JlYXRlIG1hbGxlYWJsZSBzaWduYXR1cmVzLFxuICogICB3aGljaCBpcyBkZWZhdWx0IG9wZW5zc2wgYmVoYXZpb3IuXG4gKiAgIE5vbi1tYWxsZWFibGUgc2lnbmF0dXJlcyBjYW4gc3RpbGwgYmUgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIGluIG9wZW5zc2wuXG4gKiAtIGBmb3JtYXRgOiAoZGVmYXVsdDogJ2NvbXBhY3QnKSAnY29tcGFjdCcgb3IgJ3JlY292ZXJlZCcgd2l0aCByZWNvdmVyeSBieXRlXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBVmVyaWZ5T3B0cyA9IHtcbiAgcHJlaGFzaD86IGJvb2xlYW47XG4gIGxvd1M/OiBib29sZWFuO1xuICBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdDtcbn07XG4vKipcbiAqIC0gYHByZWhhc2hgOiAoZGVmYXVsdDogdHJ1ZSkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gZG8gc2hhMjU2KG1lc3NhZ2UpLlxuICogICBXaGVuIGEgY3VzdG9tIGhhc2ggaXMgdXNlZCwgaXQgbXVzdCBiZSBzZXQgdG8gYGZhbHNlYC5cbiAqIC0gYGxvd1NgOiAoZGVmYXVsdDogdHJ1ZSkgcHJvaGliaXRzIHNpZ25hdHVyZXMgd2hpY2ggaGF2ZSAoc2lnLnMgPj0gQ1VSVkUubi8ybikuXG4gKiAgIENvbXBhdGlibGUgd2l0aCBCVEMvRVRILiBTZXR0aW5nIGBsb3dTOiBmYWxzZWAgYWxsb3dzIHRvIGNyZWF0ZSBtYWxsZWFibGUgc2lnbmF0dXJlcyxcbiAqICAgd2hpY2ggaXMgZGVmYXVsdCBvcGVuc3NsIGJlaGF2aW9yLlxuICogICBOb24tbWFsbGVhYmxlIHNpZ25hdHVyZXMgY2FuIHN0aWxsIGJlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCBpbiBvcGVuc3NsLlxuICogLSBgZm9ybWF0YDogKGRlZmF1bHQ6ICdjb21wYWN0JykgJ2NvbXBhY3QnIG9yICdyZWNvdmVyZWQnIHdpdGggcmVjb3ZlcnkgYnl0ZVxuICogLSBgZXh0cmFFbnRyb3B5YDogKGRlZmF1bHQ6IGZhbHNlKSBjcmVhdGVzIHNpZ3Mgd2l0aCBpbmNyZWFzZWQgc2VjdXJpdHksIHNlZSB7QGxpbmsgRUNEU0FFeHRyYUVudHJvcHl9XG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbk9wdHMgPSB7XG4gIHByZWhhc2g/OiBib29sZWFuO1xuICBsb3dTPzogYm9vbGVhbjtcbiAgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQ7XG4gIGV4dHJhRW50cm9weT86IEVDRFNBRXh0cmFFbnRyb3B5O1xufTtcblxuZnVuY3Rpb24gdmFsaWRhdGVTaWdGb3JtYXQoZm9ybWF0OiBzdHJpbmcpOiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCB7XG4gIGlmICghWydjb21wYWN0JywgJ3JlY292ZXJlZCcsICdkZXInXS5pbmNsdWRlcyhmb3JtYXQpKVxuICAgIHRocm93IG5ldyBFcnJvcignU2lnbmF0dXJlIGZvcm1hdCBtdXN0IGJlIFwiY29tcGFjdFwiLCBcInJlY292ZXJlZFwiLCBvciBcImRlclwiJyk7XG4gIHJldHVybiBmb3JtYXQgYXMgRUNEU0FTaWduYXR1cmVGb3JtYXQ7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU2lnT3B0czxUIGV4dGVuZHMgRUNEU0FTaWduT3B0cywgRCBleHRlbmRzIFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+PihcbiAgb3B0czogVCxcbiAgZGVmOiBEXG4pOiBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPiB7XG4gIGNvbnN0IG9wdHNuOiBFQ0RTQVNpZ25PcHRzID0ge307XG4gIGZvciAobGV0IG9wdE5hbWUgb2YgT2JqZWN0LmtleXMoZGVmKSkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBvcHRzbltvcHROYW1lXSA9IG9wdHNbb3B0TmFtZV0gPT09IHVuZGVmaW5lZCA/IGRlZltvcHROYW1lXSA6IG9wdHNbb3B0TmFtZV07XG4gIH1cbiAgYWJvb2wob3B0c24ubG93UyEsICdsb3dTJyk7XG4gIGFib29sKG9wdHNuLnByZWhhc2ghLCAncHJlaGFzaCcpO1xuICBpZiAob3B0c24uZm9ybWF0ICE9PSB1bmRlZmluZWQpIHZhbGlkYXRlU2lnRm9ybWF0KG9wdHNuLmZvcm1hdCk7XG4gIHJldHVybiBvcHRzbiBhcyBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPjtcbn1cblxuLyoqIEluc3RhbmNlIG1ldGhvZHMgZm9yIDNEIFhZWiBwcm9qZWN0aXZlIHBvaW50cy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV2VpZXJzdHJhc3NQb2ludDxUPiBleHRlbmRzIEN1cnZlUG9pbnQ8VCwgV2VpZXJzdHJhc3NQb2ludDxUPj4ge1xuICAvKiogcHJvamVjdGl2ZSBYIGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIGFmZmluZSB4LiAqL1xuICByZWFkb25seSBYOiBUO1xuICAvKiogcHJvamVjdGl2ZSBZIGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIGFmZmluZSB5LiAqL1xuICByZWFkb25seSBZOiBUO1xuICAvKiogcHJvamVjdGl2ZSB6IGNvb3JkaW5hdGUgKi9cbiAgcmVhZG9ubHkgWjogVDtcbiAgLyoqIGFmZmluZSB4IGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIHByb2plY3RpdmUgWC4gKi9cbiAgZ2V0IHgoKTogVDtcbiAgLyoqIGFmZmluZSB5IGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIHByb2plY3RpdmUgWS4gKi9cbiAgZ2V0IHkoKTogVDtcbiAgLyoqIEVuY29kZXMgcG9pbnQgdXNpbmcgSUVFRSBQMTM2MyAoREVSKSBlbmNvZGluZy4gRmlyc3QgYnl0ZSBpcyAyLzMvNC4gRGVmYXVsdCA9IGlzQ29tcHJlc3NlZC4gKi9cbiAgdG9CeXRlcyhpc0NvbXByZXNzZWQ/OiBib29sZWFuKTogVWludDhBcnJheTtcbiAgdG9IZXgoaXNDb21wcmVzc2VkPzogYm9vbGVhbik6IHN0cmluZztcbn1cblxuLyoqIFN0YXRpYyBtZXRob2RzIGZvciAzRCBYWVogcHJvamVjdGl2ZSBwb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+IGV4dGVuZHMgQ3VydmVQb2ludENvbnM8V2VpZXJzdHJhc3NQb2ludDxUPj4ge1xuICAvKiogRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgbmV3IChYOiBULCBZOiBULCBaOiBUKTogV2VpZXJzdHJhc3NQb2ludDxUPjtcbiAgQ1VSVkUoKTogV2VpZXJzdHJhc3NPcHRzPFQ+O1xufVxuXG4vKipcbiAqIFdlaWVyc3RyYXNzIGN1cnZlIG9wdGlvbnMuXG4gKlxuICogKiBwOiBwcmltZSBjaGFyYWN0ZXJpc3RpYyAob3JkZXIpIG9mIGZpbml0ZSBmaWVsZCwgaW4gd2hpY2ggYXJpdGhtZXRpY3MgaXMgZG9uZVxuICogKiBuOiBvcmRlciBvZiBwcmltZSBzdWJncm91cCBhLmsuYSB0b3RhbCBhbW91bnQgb2YgdmFsaWQgY3VydmUgcG9pbnRzXG4gKiAqIGg6IGNvZmFjdG9yLCB1c3VhbGx5IDEuIGgqbiBpcyBncm91cCBvcmRlcjsgbiBpcyBzdWJncm91cCBvcmRlclxuICogKiBhOiBmb3JtdWxhIHBhcmFtLCBtdXN0IGJlIGluIGZpZWxkIG9mIHBcbiAqICogYjogZm9ybXVsYSBwYXJhbSwgbXVzdCBiZSBpbiBmaWVsZCBvZiBwXG4gKiAqIEd4OiB4IGNvb3JkaW5hdGUgb2YgZ2VuZXJhdG9yIHBvaW50IGEuay5hLiBiYXNlIHBvaW50XG4gKiAqIEd5OiB5IGNvb3JkaW5hdGUgb2YgZ2VuZXJhdG9yIHBvaW50XG4gKi9cbmV4cG9ydCB0eXBlIFdlaWVyc3RyYXNzT3B0czxUPiA9IFJlYWRvbmx5PHtcbiAgcDogYmlnaW50O1xuICBuOiBiaWdpbnQ7XG4gIGg6IGJpZ2ludDtcbiAgYTogVDtcbiAgYjogVDtcbiAgR3g6IFQ7XG4gIEd5OiBUO1xufT47XG5cbi8vIFdoZW4gYSBjb2ZhY3RvciAhPSAxLCB0aGVyZSBjYW4gYmUgYW4gZWZmZWN0aXZlIG1ldGhvZHMgdG86XG4vLyAxLiBEZXRlcm1pbmUgd2hldGhlciBhIHBvaW50IGlzIHRvcnNpb24tZnJlZVxuLy8gMi4gQ2xlYXIgdG9yc2lvbiBjb21wb25lbnRcbmV4cG9ydCB0eXBlIFdlaWVyc3RyYXNzRXh0cmFPcHRzPFQ+ID0gUGFydGlhbDx7XG4gIEZwOiBJRmllbGQ8VD47XG4gIEZuOiBJRmllbGQ8YmlnaW50PjtcbiAgYWxsb3dJbmZpbml0eVBvaW50OiBib29sZWFuO1xuICBlbmRvOiBFbmRvbW9ycGhpc21PcHRzO1xuICBpc1RvcnNpb25GcmVlOiAoYzogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4sIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+KSA9PiBib29sZWFuO1xuICBjbGVhckNvZmFjdG9yOiAoYzogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4sIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+KSA9PiBXZWllcnN0cmFzc1BvaW50PFQ+O1xuICBmcm9tQnl0ZXM6IChieXRlczogVWludDhBcnJheSkgPT4gQWZmaW5lUG9pbnQ8VD47XG4gIHRvQnl0ZXM6IChcbiAgICBjOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPixcbiAgICBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPixcbiAgICBpc0NvbXByZXNzZWQ6IGJvb2xlYW5cbiAgKSA9PiBVaW50OEFycmF5O1xufT47XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgRUNEU0Egc2lnbmF0dXJlcyBvdmVyIGEgV2VpZXJzdHJhc3MgY3VydmUuXG4gKlxuICogKiBsb3dTOiAoZGVmYXVsdDogdHJ1ZSkgd2hldGhlciBwcm9kdWNlZCAvIHZlcmlmaWVkIHNpZ25hdHVyZXMgb2NjdXB5IGxvdyBoYWxmIG9mIGVjZHNhT3B0cy5wLiBQcmV2ZW50cyBtYWxsZWFiaWxpdHkuXG4gKiAqIGhtYWM6IChkZWZhdWx0OiBub2JsZS1oYXNoZXMgaG1hYykgZnVuY3Rpb24sIHdvdWxkIGJlIHVzZWQgdG8gaW5pdCBobWFjLWRyYmcgZm9yIGsgZ2VuZXJhdGlvbi5cbiAqICogcmFuZG9tQnl0ZXM6IChkZWZhdWx0OiB3ZWJjcnlwdG8gb3MtbGV2ZWwgQ1NQUk5HKSBjdXN0b20gbWV0aG9kIGZvciBmZXRjaGluZyBzZWN1cmUgcmFuZG9tbmVzcy5cbiAqICogYml0czJpbnQsIGJpdHMyaW50X21vZE46IHVzZWQgaW4gc2lncywgc29tZXRpbWVzIG92ZXJyaWRkZW4gYnkgY3VydmVzXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBT3B0cyA9IFBhcnRpYWw8e1xuICBsb3dTOiBib29sZWFuO1xuICBobWFjOiAoa2V5OiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICByYW5kb21CeXRlczogKGJ5dGVzTGVuZ3RoPzogbnVtYmVyKSA9PiBVaW50OEFycmF5O1xuICBiaXRzMmludDogKGJ5dGVzOiBVaW50OEFycmF5KSA9PiBiaWdpbnQ7XG4gIGJpdHMyaW50X21vZE46IChieXRlczogVWludDhBcnJheSkgPT4gYmlnaW50O1xufT47XG5cbi8qKlxuICogRWxsaXB0aWMgQ3VydmUgRGlmZmllLUhlbGxtYW4gaW50ZXJmYWNlLlxuICogUHJvdmlkZXMga2V5Z2VuLCBzZWNyZXQtdG8tcHVibGljIGNvbnZlcnNpb24sIGNhbGN1bGF0aW5nIHNoYXJlZCBzZWNyZXRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVDREgge1xuICBrZXlnZW46IChzZWVkPzogVWludDhBcnJheSkgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuICBnZXRQdWJsaWNLZXk6IChzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pID0+IFVpbnQ4QXJyYXk7XG4gIGdldFNoYXJlZFNlY3JldDogKFxuICAgIHNlY3JldEtleUE6IFVpbnQ4QXJyYXksXG4gICAgcHVibGljS2V5QjogVWludDhBcnJheSxcbiAgICBpc0NvbXByZXNzZWQ/OiBib29sZWFuXG4gICkgPT4gVWludDhBcnJheTtcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD47XG4gIHV0aWxzOiB7XG4gICAgaXNWYWxpZFNlY3JldEtleTogKHNlY3JldEtleTogVWludDhBcnJheSkgPT4gYm9vbGVhbjtcbiAgICBpc1ZhbGlkUHVibGljS2V5OiAocHVibGljS2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKSA9PiBib29sZWFuO1xuICAgIHJhbmRvbVNlY3JldEtleTogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICB9O1xuICBsZW5ndGhzOiBDdXJ2ZUxlbmd0aHM7XG59XG5cbi8qKlxuICogRUNEU0EgaW50ZXJmYWNlLlxuICogT25seSBzdXBwb3J0ZWQgZm9yIHByaW1lIGZpZWxkcywgbm90IEZwMiAoZXh0ZW5zaW9uIGZpZWxkcykuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRUNEU0EgZXh0ZW5kcyBFQ0RIIHtcbiAgc2lnbjogKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHNlY3JldEtleTogVWludDhBcnJheSwgb3B0cz86IEVDRFNBU2lnbk9wdHMpID0+IFVpbnQ4QXJyYXk7XG4gIHZlcmlmeTogKFxuICAgIHNpZ25hdHVyZTogVWludDhBcnJheSxcbiAgICBtZXNzYWdlOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleTogVWludDhBcnJheSxcbiAgICBvcHRzPzogRUNEU0FWZXJpZnlPcHRzXG4gICkgPT4gYm9vbGVhbjtcbiAgcmVjb3ZlclB1YmxpY0tleShzaWduYXR1cmU6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXksIG9wdHM/OiBFQ0RTQVJlY292ZXJPcHRzKTogVWludDhBcnJheTtcbiAgU2lnbmF0dXJlOiBFQ0RTQVNpZ25hdHVyZUNvbnM7XG59XG5leHBvcnQgY2xhc3MgREVSRXJyIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtID0gJycpIHtcbiAgICBzdXBlcihtKTtcbiAgfVxufVxuZXhwb3J0IHR5cGUgSURFUiA9IHtcbiAgLy8gYXNuLjEgREVSIGVuY29kaW5nIHV0aWxzXG4gIEVycjogdHlwZW9mIERFUkVycjtcbiAgLy8gQmFzaWMgYnVpbGRpbmcgYmxvY2sgaXMgVExWIChUYWctTGVuZ3RoLVZhbHVlKVxuICBfdGx2OiB7XG4gICAgZW5jb2RlOiAodGFnOiBudW1iZXIsIGRhdGE6IHN0cmluZykgPT4gc3RyaW5nO1xuICAgIC8vIHYgLSB2YWx1ZSwgbCAtIGxlZnQgYnl0ZXMgKHVucGFyc2VkKVxuICAgIGRlY29kZSh0YWc6IG51bWJlciwgZGF0YTogVWludDhBcnJheSk6IHsgdjogVWludDhBcnJheTsgbDogVWludDhBcnJheSB9O1xuICB9O1xuICAvLyBodHRwczovL2NyeXB0by5zdGFja2V4Y2hhbmdlLmNvbS9hLzU3NzM0IExlZnRtb3N0IGJpdCBvZiBmaXJzdCBieXRlIGlzICduZWdhdGl2ZScgZmxhZyxcbiAgLy8gc2luY2Ugd2UgYWx3YXlzIHVzZSBwb3NpdGl2ZSBpbnRlZ2VycyBoZXJlLiBJdCBtdXN0IGFsd2F5cyBiZSBlbXB0eTpcbiAgLy8gLSBhZGQgemVybyBieXRlIGlmIGV4aXN0c1xuICAvLyAtIGlmIG5leHQgYnl0ZSBkb2Vzbid0IGhhdmUgYSBmbGFnLCBsZWFkaW5nIHplcm8gaXMgbm90IGFsbG93ZWQgKG1pbmltYWwgZW5jb2RpbmcpXG4gIF9pbnQ6IHtcbiAgICBlbmNvZGUobnVtOiBiaWdpbnQpOiBzdHJpbmc7XG4gICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBiaWdpbnQ7XG4gIH07XG4gIHRvU2lnKGhleDogc3RyaW5nIHwgVWludDhBcnJheSk6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfTtcbiAgaGV4RnJvbVNpZyhzaWc6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfSk6IHN0cmluZztcbn07XG4vKipcbiAqIEFTTi4xIERFUiBlbmNvZGluZyB1dGlsaXRpZXMuIEFTTiBpcyB2ZXJ5IGNvbXBsZXggJiBmcmFnaWxlLiBGb3JtYXQ6XG4gKlxuICogICAgIFsweDMwIChTRVFVRU5DRSksIGJ5dGVsZW5ndGgsIDB4MDIgKElOVEVHRVIpLCBpbnRMZW5ndGgsIFIsIDB4MDIgKElOVEVHRVIpLCBpbnRMZW5ndGgsIFNdXG4gKlxuICogRG9jczogaHR0cHM6Ly9sZXRzZW5jcnlwdC5vcmcvZG9jcy9hLXdhcm0td2VsY29tZS10by1hc24xLWFuZC1kZXIvLCBodHRwczovL2x1Y2EubnRvcC5vcmcvVGVhY2hpbmcvQXBwdW50aS9hc24xLmh0bWxcbiAqL1xuZXhwb3J0IGNvbnN0IERFUjogSURFUiA9IHtcbiAgLy8gYXNuLjEgREVSIGVuY29kaW5nIHV0aWxzXG4gIEVycjogREVSRXJyLFxuICAvLyBCYXNpYyBidWlsZGluZyBibG9jayBpcyBUTFYgKFRhZy1MZW5ndGgtVmFsdWUpXG4gIF90bHY6IHtcbiAgICBlbmNvZGU6ICh0YWc6IG51bWJlciwgZGF0YTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IHsgRXJyOiBFIH0gPSBERVI7XG4gICAgICBpZiAodGFnIDwgMCB8fCB0YWcgPiAyNTYpIHRocm93IG5ldyBFKCd0bHYuZW5jb2RlOiB3cm9uZyB0YWcnKTtcbiAgICAgIGlmIChkYXRhLmxlbmd0aCAmIDEpIHRocm93IG5ldyBFKCd0bHYuZW5jb2RlOiB1bnBhZGRlZCBkYXRhJyk7XG4gICAgICBjb25zdCBkYXRhTGVuID0gZGF0YS5sZW5ndGggLyAyO1xuICAgICAgY29uc3QgbGVuID0gbnVtYmVyVG9IZXhVbnBhZGRlZChkYXRhTGVuKTtcbiAgICAgIGlmICgobGVuLmxlbmd0aCAvIDIpICYgMGIxMDAwXzAwMDApIHRocm93IG5ldyBFKCd0bHYuZW5jb2RlOiBsb25nIGZvcm0gbGVuZ3RoIHRvbyBiaWcnKTtcbiAgICAgIC8vIGxlbmd0aCBvZiBsZW5ndGggd2l0aCBsb25nIGZvcm0gZmxhZ1xuICAgICAgY29uc3QgbGVuTGVuID0gZGF0YUxlbiA+IDEyNyA/IG51bWJlclRvSGV4VW5wYWRkZWQoKGxlbi5sZW5ndGggLyAyKSB8IDBiMTAwMF8wMDAwKSA6ICcnO1xuICAgICAgY29uc3QgdCA9IG51bWJlclRvSGV4VW5wYWRkZWQodGFnKTtcbiAgICAgIHJldHVybiB0ICsgbGVuTGVuICsgbGVuICsgZGF0YTtcbiAgICB9LFxuICAgIC8vIHYgLSB2YWx1ZSwgbCAtIGxlZnQgYnl0ZXMgKHVucGFyc2VkKVxuICAgIGRlY29kZSh0YWc6IG51bWJlciwgZGF0YTogVWludDhBcnJheSk6IHsgdjogVWludDhBcnJheTsgbDogVWludDhBcnJheSB9IHtcbiAgICAgIGNvbnN0IHsgRXJyOiBFIH0gPSBERVI7XG4gICAgICBsZXQgcG9zID0gMDtcbiAgICAgIGlmICh0YWcgPCAwIHx8IHRhZyA+IDI1NikgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IHdyb25nIHRhZycpO1xuICAgICAgaWYgKGRhdGEubGVuZ3RoIDwgMiB8fCBkYXRhW3BvcysrXSAhPT0gdGFnKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZTogd3JvbmcgdGx2Jyk7XG4gICAgICBjb25zdCBmaXJzdCA9IGRhdGFbcG9zKytdO1xuICAgICAgY29uc3QgaXNMb25nID0gISEoZmlyc3QgJiAwYjEwMDBfMDAwMCk7IC8vIEZpcnN0IGJpdCBvZiBmaXJzdCBsZW5ndGggYnl0ZSBpcyBmbGFnIGZvciBzaG9ydC9sb25nIGZvcm1cbiAgICAgIGxldCBsZW5ndGggPSAwO1xuICAgICAgaWYgKCFpc0xvbmcpIGxlbmd0aCA9IGZpcnN0O1xuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIExvbmcgZm9ybTogW2xvbmdGbGFnKDFiaXQpLCBsZW5ndGhMZW5ndGgoN2JpdCksIGxlbmd0aCAoQkUpXVxuICAgICAgICBjb25zdCBsZW5MZW4gPSBmaXJzdCAmIDBiMDExMV8xMTExO1xuICAgICAgICBpZiAoIWxlbkxlbikgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGUobG9uZyk6IGluZGVmaW5pdGUgbGVuZ3RoIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgaWYgKGxlbkxlbiA+IDQpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBieXRlIGxlbmd0aCBpcyB0b28gYmlnJyk7IC8vIHRoaXMgd2lsbCBvdmVyZmxvdyB1MzIgaW4ganNcbiAgICAgICAgY29uc3QgbGVuZ3RoQnl0ZXMgPSBkYXRhLnN1YmFycmF5KHBvcywgcG9zICsgbGVuTGVuKTtcbiAgICAgICAgaWYgKGxlbmd0aEJ5dGVzLmxlbmd0aCAhPT0gbGVuTGVuKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZTogbGVuZ3RoIGJ5dGVzIG5vdCBjb21wbGV0ZScpO1xuICAgICAgICBpZiAobGVuZ3RoQnl0ZXNbMF0gPT09IDApIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiB6ZXJvIGxlZnRtb3N0IGJ5dGUnKTtcbiAgICAgICAgZm9yIChjb25zdCBiIG9mIGxlbmd0aEJ5dGVzKSBsZW5ndGggPSAobGVuZ3RoIDw8IDgpIHwgYjtcbiAgICAgICAgcG9zICs9IGxlbkxlbjtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEyOCkgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGUobG9uZyk6IG5vdCBtaW5pbWFsIGVuY29kaW5nJyk7XG4gICAgICB9XG4gICAgICBjb25zdCB2ID0gZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIGxlbmd0aCk7XG4gICAgICBpZiAodi5sZW5ndGggIT09IGxlbmd0aCkgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IHdyb25nIHZhbHVlIGxlbmd0aCcpO1xuICAgICAgcmV0dXJuIHsgdiwgbDogZGF0YS5zdWJhcnJheShwb3MgKyBsZW5ndGgpIH07XG4gICAgfSxcbiAgfSxcbiAgLy8gaHR0cHM6Ly9jcnlwdG8uc3RhY2tleGNoYW5nZS5jb20vYS81NzczNCBMZWZ0bW9zdCBiaXQgb2YgZmlyc3QgYnl0ZSBpcyAnbmVnYXRpdmUnIGZsYWcsXG4gIC8vIHNpbmNlIHdlIGFsd2F5cyB1c2UgcG9zaXRpdmUgaW50ZWdlcnMgaGVyZS4gSXQgbXVzdCBhbHdheXMgYmUgZW1wdHk6XG4gIC8vIC0gYWRkIHplcm8gYnl0ZSBpZiBleGlzdHNcbiAgLy8gLSBpZiBuZXh0IGJ5dGUgZG9lc24ndCBoYXZlIGEgZmxhZywgbGVhZGluZyB6ZXJvIGlzIG5vdCBhbGxvd2VkIChtaW5pbWFsIGVuY29kaW5nKVxuICBfaW50OiB7XG4gICAgZW5jb2RlKG51bTogYmlnaW50KTogc3RyaW5nIHtcbiAgICAgIGNvbnN0IHsgRXJyOiBFIH0gPSBERVI7XG4gICAgICBpZiAobnVtIDwgXzBuKSB0aHJvdyBuZXcgRSgnaW50ZWdlcjogbmVnYXRpdmUgaW50ZWdlcnMgYXJlIG5vdCBhbGxvd2VkJyk7XG4gICAgICBsZXQgaGV4ID0gbnVtYmVyVG9IZXhVbnBhZGRlZChudW0pO1xuICAgICAgLy8gUGFkIHdpdGggemVybyBieXRlIGlmIG5lZ2F0aXZlIGZsYWcgaXMgcHJlc2VudFxuICAgICAgaWYgKE51bWJlci5wYXJzZUludChoZXhbMF0sIDE2KSAmIDBiMTAwMCkgaGV4ID0gJzAwJyArIGhleDtcbiAgICAgIGlmIChoZXgubGVuZ3RoICYgMSkgdGhyb3cgbmV3IEUoJ3VuZXhwZWN0ZWQgREVSIHBhcnNpbmcgYXNzZXJ0aW9uOiB1bnBhZGRlZCBoZXgnKTtcbiAgICAgIHJldHVybiBoZXg7XG4gICAgfSxcbiAgICBkZWNvZGUoZGF0YTogVWludDhBcnJheSk6IGJpZ2ludCB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKGRhdGFbMF0gJiAwYjEwMDBfMDAwMCkgdGhyb3cgbmV3IEUoJ2ludmFsaWQgc2lnbmF0dXJlIGludGVnZXI6IG5lZ2F0aXZlJyk7XG4gICAgICBpZiAoZGF0YVswXSA9PT0gMHgwMCAmJiAhKGRhdGFbMV0gJiAwYjEwMDBfMDAwMCkpXG4gICAgICAgIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZSBpbnRlZ2VyOiB1bm5lY2Vzc2FyeSBsZWFkaW5nIHplcm8nKTtcbiAgICAgIHJldHVybiBieXRlc1RvTnVtYmVyQkUoZGF0YSk7XG4gICAgfSxcbiAgfSxcbiAgdG9TaWcoYnl0ZXM6IFVpbnQ4QXJyYXkpOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH0ge1xuICAgIC8vIHBhcnNlIERFUiBzaWduYXR1cmVcbiAgICBjb25zdCB7IEVycjogRSwgX2ludDogaW50LCBfdGx2OiB0bHYgfSA9IERFUjtcbiAgICBjb25zdCBkYXRhID0gYWJ5dGVzKGJ5dGVzLCB1bmRlZmluZWQsICdzaWduYXR1cmUnKTtcbiAgICBjb25zdCB7IHY6IHNlcUJ5dGVzLCBsOiBzZXFMZWZ0Qnl0ZXMgfSA9IHRsdi5kZWNvZGUoMHgzMCwgZGF0YSk7XG4gICAgaWYgKHNlcUxlZnRCeXRlcy5sZW5ndGgpIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZTogbGVmdCBieXRlcyBhZnRlciBwYXJzaW5nJyk7XG4gICAgY29uc3QgeyB2OiByQnl0ZXMsIGw6IHJMZWZ0Qnl0ZXMgfSA9IHRsdi5kZWNvZGUoMHgwMiwgc2VxQnl0ZXMpO1xuICAgIGNvbnN0IHsgdjogc0J5dGVzLCBsOiBzTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MDIsIHJMZWZ0Qnl0ZXMpO1xuICAgIGlmIChzTGVmdEJ5dGVzLmxlbmd0aCkgdGhyb3cgbmV3IEUoJ2ludmFsaWQgc2lnbmF0dXJlOiBsZWZ0IGJ5dGVzIGFmdGVyIHBhcnNpbmcnKTtcbiAgICByZXR1cm4geyByOiBpbnQuZGVjb2RlKHJCeXRlcyksIHM6IGludC5kZWNvZGUoc0J5dGVzKSB9O1xuICB9LFxuICBoZXhGcm9tU2lnKHNpZzogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9KTogc3RyaW5nIHtcbiAgICBjb25zdCB7IF90bHY6IHRsdiwgX2ludDogaW50IH0gPSBERVI7XG4gICAgY29uc3QgcnMgPSB0bHYuZW5jb2RlKDB4MDIsIGludC5lbmNvZGUoc2lnLnIpKTtcbiAgICBjb25zdCBzcyA9IHRsdi5lbmNvZGUoMHgwMiwgaW50LmVuY29kZShzaWcucykpO1xuICAgIGNvbnN0IHNlcSA9IHJzICsgc3M7XG4gICAgcmV0dXJuIHRsdi5lbmNvZGUoMHgzMCwgc2VxKTtcbiAgfSxcbn07XG5cbi8vIEJlIGZyaWVuZGx5IHRvIGJhZCBFQ01BU2NyaXB0IHBhcnNlcnMgYnkgbm90IHVzaW5nIGJpZ2ludCBsaXRlcmFsc1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfMG4gPSBCaWdJbnQoMCksIF8xbiA9IEJpZ0ludCgxKSwgXzJuID0gQmlnSW50KDIpLCBfM24gPSBCaWdJbnQoMyksIF80biA9IEJpZ0ludCg0KTtcblxuLyoqXG4gKiBDcmVhdGVzIHdlaWVyc3RyYXNzIFBvaW50IGNvbnN0cnVjdG9yLCBiYXNlZCBvbiBzcGVjaWZpZWQgY3VydmUgb3B0aW9ucy5cbiAqXG4gKiBTZWUge0BsaW5rIFdlaWVyc3RyYXNzT3B0c30uXG4gKlxuICogQGV4YW1wbGVcbmBgYGpzXG5jb25zdCBvcHRzID0ge1xuICBwOiAweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlZmZmZmFjNzNuLFxuICBuOiAweDEwMDAwMDAwMDAwMDAwMDAwMDAwMWI4ZmExNmRmYWI5YWNhMTZiNmIzbixcbiAgaDogMW4sXG4gIGE6IDBuLFxuICBiOiA3bixcbiAgR3g6IDB4M2I0YzM4MmNlMzdhYTE5MmE0MDE5ZTc2MzAzNmY0ZjVkZDRkN2ViYm4sXG4gIEd5OiAweDkzOGNmOTM1MzE4ZmRjZWQ2YmMyODI4NjUzMTczM2MzZjAzYzRmZWVuLFxufTtcbmNvbnN0IHNlY3AxNjBrMV9Qb2ludCA9IHdlaWVyc3RyYXNzKG9wdHMpO1xuYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWllcnN0cmFzczxUPihcbiAgcGFyYW1zOiBXZWllcnN0cmFzc09wdHM8VD4sXG4gIGV4dHJhT3B0czogV2VpZXJzdHJhc3NFeHRyYU9wdHM8VD4gPSB7fVxuKTogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4ge1xuICBjb25zdCB2YWxpZGF0ZWQgPSBjcmVhdGVDdXJ2ZUZpZWxkcygnd2VpZXJzdHJhc3MnLCBwYXJhbXMsIGV4dHJhT3B0cyk7XG4gIGNvbnN0IHsgRnAsIEZuIH0gPSB2YWxpZGF0ZWQ7XG4gIGxldCBDVVJWRSA9IHZhbGlkYXRlZC5DVVJWRSBhcyBXZWllcnN0cmFzc09wdHM8VD47XG4gIGNvbnN0IHsgaDogY29mYWN0b3IsIG46IENVUlZFX09SREVSIH0gPSBDVVJWRTtcbiAgdmFsaWRhdGVPYmplY3QoXG4gICAgZXh0cmFPcHRzLFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGFsbG93SW5maW5pdHlQb2ludDogJ2Jvb2xlYW4nLFxuICAgICAgY2xlYXJDb2ZhY3RvcjogJ2Z1bmN0aW9uJyxcbiAgICAgIGlzVG9yc2lvbkZyZWU6ICdmdW5jdGlvbicsXG4gICAgICBmcm9tQnl0ZXM6ICdmdW5jdGlvbicsXG4gICAgICB0b0J5dGVzOiAnZnVuY3Rpb24nLFxuICAgICAgZW5kbzogJ29iamVjdCcsXG4gICAgfVxuICApO1xuXG4gIGNvbnN0IHsgZW5kbyB9ID0gZXh0cmFPcHRzO1xuICBpZiAoZW5kbykge1xuICAgIC8vIHZhbGlkYXRlT2JqZWN0KGVuZG8sIHsgYmV0YTogJ2JpZ2ludCcsIHNwbGl0U2NhbGFyOiAnZnVuY3Rpb24nIH0pO1xuICAgIGlmICghRnAuaXMwKENVUlZFLmEpIHx8IHR5cGVvZiBlbmRvLmJldGEgIT09ICdiaWdpbnQnIHx8ICFBcnJheS5pc0FycmF5KGVuZG8uYmFzaXNlcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBlbmRvOiBleHBlY3RlZCBcImJldGFcIjogYmlnaW50IGFuZCBcImJhc2lzZXNcIjogYXJyYXknKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBsZW5ndGhzID0gZ2V0V0xlbmd0aHMoRnAsIEZuKTtcblxuICBmdW5jdGlvbiBhc3NlcnRDb21wcmVzc2lvbklzU3VwcG9ydGVkKCkge1xuICAgIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcignY29tcHJlc3Npb24gaXMgbm90IHN1cHBvcnRlZDogRmllbGQgZG9lcyBub3QgaGF2ZSAuaXNPZGQoKScpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50cyBJRUVFIFAxMzYzIHBvaW50IGVuY29kaW5nXG4gIGZ1bmN0aW9uIHBvaW50VG9CeXRlcyhcbiAgICBfYzogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4sXG4gICAgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4sXG4gICAgaXNDb21wcmVzc2VkOiBib29sZWFuXG4gICk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgeCwgeSB9ID0gcG9pbnQudG9BZmZpbmUoKTtcbiAgICBjb25zdCBieCA9IEZwLnRvQnl0ZXMoeCk7XG4gICAgYWJvb2woaXNDb21wcmVzc2VkLCAnaXNDb21wcmVzc2VkJyk7XG4gICAgaWYgKGlzQ29tcHJlc3NlZCkge1xuICAgICAgYXNzZXJ0Q29tcHJlc3Npb25Jc1N1cHBvcnRlZCgpO1xuICAgICAgY29uc3QgaGFzRXZlblkgPSAhRnAuaXNPZGQhKHkpO1xuICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKHBwcmVmaXgoaGFzRXZlblkpLCBieCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25jYXRCeXRlcyhVaW50OEFycmF5Lm9mKDB4MDQpLCBieCwgRnAudG9CeXRlcyh5KSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHBvaW50RnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KSB7XG4gICAgYWJ5dGVzKGJ5dGVzLCB1bmRlZmluZWQsICdQb2ludCcpO1xuICAgIGNvbnN0IHsgcHVibGljS2V5OiBjb21wLCBwdWJsaWNLZXlVbmNvbXByZXNzZWQ6IHVuY29tcCB9ID0gbGVuZ3RoczsgLy8gZS5nLiBmb3IgMzItYnl0ZTogMzMsIDY1XG4gICAgY29uc3QgbGVuZ3RoID0gYnl0ZXMubGVuZ3RoO1xuICAgIGNvbnN0IGhlYWQgPSBieXRlc1swXTtcbiAgICBjb25zdCB0YWlsID0gYnl0ZXMuc3ViYXJyYXkoMSk7XG4gICAgLy8gTm8gYWN0dWFsIHZhbGlkYXRpb24gaXMgZG9uZSBoZXJlOiB1c2UgLmFzc2VydFZhbGlkaXR5KClcbiAgICBpZiAobGVuZ3RoID09PSBjb21wICYmIChoZWFkID09PSAweDAyIHx8IGhlYWQgPT09IDB4MDMpKSB7XG4gICAgICBjb25zdCB4ID0gRnAuZnJvbUJ5dGVzKHRhaWwpO1xuICAgICAgaWYgKCFGcC5pc1ZhbGlkKHgpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogaXMgbm90IG9uIGN1cnZlLCB3cm9uZyB4Jyk7XG4gICAgICBjb25zdCB5MiA9IHdlaWVyc3RyYXNzRXF1YXRpb24oeCk7IC8vIHlcdTAwQjIgPSB4XHUwMEIzICsgYXggKyBiXG4gICAgICBsZXQgeTogVDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHkgPSBGcC5zcXJ0KHkyKTsgLy8geSA9IHlcdTAwQjIgXiAocCsxKS80XG4gICAgICB9IGNhdGNoIChzcXJ0RXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyID0gc3FydEVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyAnOiAnICsgc3FydEVycm9yLm1lc3NhZ2UgOiAnJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZSwgc3FydCBlcnJvcicgKyBlcnIpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Q29tcHJlc3Npb25Jc1N1cHBvcnRlZCgpO1xuICAgICAgY29uc3QgZXZlblkgPSBGcC5pc09kZCEoeSk7XG4gICAgICBjb25zdCBldmVuSCA9IChoZWFkICYgMSkgPT09IDE7IC8vIEVDRFNBLXNwZWNpZmljXG4gICAgICBpZiAoZXZlbkggIT09IGV2ZW5ZKSB5ID0gRnAubmVnKHkpO1xuICAgICAgcmV0dXJuIHsgeCwgeSB9O1xuICAgIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmNvbXAgJiYgaGVhZCA9PT0gMHgwNCkge1xuICAgICAgLy8gVE9ETzogbW9yZSBjaGVja3NcbiAgICAgIGNvbnN0IEwgPSBGcC5CWVRFUztcbiAgICAgIGNvbnN0IHggPSBGcC5mcm9tQnl0ZXModGFpbC5zdWJhcnJheSgwLCBMKSk7XG4gICAgICBjb25zdCB5ID0gRnAuZnJvbUJ5dGVzKHRhaWwuc3ViYXJyYXkoTCwgTCAqIDIpKTtcbiAgICAgIGlmICghaXNWYWxpZFhZKHgsIHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogaXMgbm90IG9uIGN1cnZlJyk7XG4gICAgICByZXR1cm4geyB4LCB5IH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGJhZCBwb2ludDogZ290IGxlbmd0aCAke2xlbmd0aH0sIGV4cGVjdGVkIGNvbXByZXNzZWQ9JHtjb21wfSBvciB1bmNvbXByZXNzZWQ9JHt1bmNvbXB9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBlbmNvZGVQb2ludCA9IGV4dHJhT3B0cy50b0J5dGVzIHx8IHBvaW50VG9CeXRlcztcbiAgY29uc3QgZGVjb2RlUG9pbnQgPSBleHRyYU9wdHMuZnJvbUJ5dGVzIHx8IHBvaW50RnJvbUJ5dGVzO1xuICBmdW5jdGlvbiB3ZWllcnN0cmFzc0VxdWF0aW9uKHg6IFQpOiBUIHtcbiAgICBjb25zdCB4MiA9IEZwLnNxcih4KTsgLy8geCAqIHhcbiAgICBjb25zdCB4MyA9IEZwLm11bCh4MiwgeCk7IC8vIHhcdTAwQjIgKiB4XG4gICAgcmV0dXJuIEZwLmFkZChGcC5hZGQoeDMsIEZwLm11bCh4LCBDVVJWRS5hKSksIENVUlZFLmIpOyAvLyB4XHUwMEIzICsgYSAqIHggKyBiXG4gIH1cblxuICAvLyBUT0RPOiBtb3ZlIHRvcC1sZXZlbFxuICAvKiogQ2hlY2tzIHdoZXRoZXIgZXF1YXRpb24gaG9sZHMgZm9yIGdpdmVuIHgsIHk6IHlcdTAwQjIgPT0geFx1MDBCMyArIGF4ICsgYiAqL1xuICBmdW5jdGlvbiBpc1ZhbGlkWFkoeDogVCwgeTogVCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGxlZnQgPSBGcC5zcXIoeSk7IC8vIHlcdTAwQjJcbiAgICBjb25zdCByaWdodCA9IHdlaWVyc3RyYXNzRXF1YXRpb24oeCk7IC8vIHhcdTAwQjMgKyBheCArIGJcbiAgICByZXR1cm4gRnAuZXFsKGxlZnQsIHJpZ2h0KTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHdoZXRoZXIgdGhlIHBhc3NlZCBjdXJ2ZSBwYXJhbXMgYXJlIHZhbGlkLlxuICAvLyBUZXN0IDE6IGVxdWF0aW9uIHlcdTAwQjIgPSB4XHUwMEIzICsgYXggKyBiIHNob3VsZCB3b3JrIGZvciBnZW5lcmF0b3IgcG9pbnQuXG4gIGlmICghaXNWYWxpZFhZKENVUlZFLkd4LCBDVVJWRS5HeSkpIHRocm93IG5ldyBFcnJvcignYmFkIGN1cnZlIHBhcmFtczogZ2VuZXJhdG9yIHBvaW50Jyk7XG5cbiAgLy8gVGVzdCAyOiBkaXNjcmltaW5hbnQgXHUwMzk0IHBhcnQgc2hvdWxkIGJlIG5vbi16ZXJvOiA0YVx1MDBCMyArIDI3Ylx1MDBCMiAhPSAwLlxuICAvLyBHdWFyYW50ZWVzIGN1cnZlIGlzIGdlbnVzLTEsIHNtb290aCAobm9uLXNpbmd1bGFyKS5cbiAgY29uc3QgXzRhMyA9IEZwLm11bChGcC5wb3coQ1VSVkUuYSwgXzNuKSwgXzRuKTtcbiAgY29uc3QgXzI3YjIgPSBGcC5tdWwoRnAuc3FyKENVUlZFLmIpLCBCaWdJbnQoMjcpKTtcbiAgaWYgKEZwLmlzMChGcC5hZGQoXzRhMywgXzI3YjIpKSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgY3VydmUgcGFyYW1zOiBhIG9yIGInKTtcblxuICAvKiogQXNzZXJ0cyBjb29yZGluYXRlIGlzIHZhbGlkOiAwIDw9IG4gPCBGcC5PUkRFUi4gKi9cbiAgZnVuY3Rpb24gYWNvb3JkKHRpdGxlOiBzdHJpbmcsIG46IFQsIGJhblplcm8gPSBmYWxzZSkge1xuICAgIGlmICghRnAuaXNWYWxpZChuKSB8fCAoYmFuWmVybyAmJiBGcC5pczAobikpKSB0aHJvdyBuZXcgRXJyb3IoYGJhZCBwb2ludCBjb29yZGluYXRlICR7dGl0bGV9YCk7XG4gICAgcmV0dXJuIG47XG4gIH1cblxuICBmdW5jdGlvbiBhcHJqcG9pbnQob3RoZXI6IHVua25vd24pIHtcbiAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFBvaW50KSkgdGhyb3cgbmV3IEVycm9yKCdXZWllcnN0cmFzcyBQb2ludCBleHBlY3RlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3BsaXRFbmRvU2NhbGFyTihrOiBiaWdpbnQpIHtcbiAgICBpZiAoIWVuZG8gfHwgIWVuZG8uYmFzaXNlcykgdGhyb3cgbmV3IEVycm9yKCdubyBlbmRvJyk7XG4gICAgcmV0dXJuIF9zcGxpdEVuZG9TY2FsYXIoaywgZW5kby5iYXNpc2VzLCBGbi5PUkRFUik7XG4gIH1cblxuICAvLyBNZW1vaXplZCB0b0FmZmluZSAvIHZhbGlkaXR5IGNoZWNrLiBUaGV5IGFyZSBoZWF2eS4gUG9pbnRzIGFyZSBpbW11dGFibGUuXG5cbiAgLy8gQ29udmVydHMgUHJvamVjdGl2ZSBwb2ludCB0byBhZmZpbmUgKHgsIHkpIGNvb3JkaW5hdGVzLlxuICAvLyBDYW4gYWNjZXB0IHByZWNvbXB1dGVkIFpeLTEgLSBmb3IgZXhhbXBsZSwgZnJvbSBpbnZlcnRCYXRjaC5cbiAgLy8gKFgsIFksIFopIFx1MjIwQiAoeD1YL1osIHk9WS9aKVxuICBjb25zdCB0b0FmZmluZU1lbW8gPSBtZW1vaXplZCgocDogUG9pbnQsIGl6PzogVCk6IEFmZmluZVBvaW50PFQ+ID0+IHtcbiAgICBjb25zdCB7IFgsIFksIFogfSA9IHA7XG4gICAgLy8gRmFzdC1wYXRoIGZvciBub3JtYWxpemVkIHBvaW50c1xuICAgIGlmIChGcC5lcWwoWiwgRnAuT05FKSkgcmV0dXJuIHsgeDogWCwgeTogWSB9O1xuICAgIGNvbnN0IGlzMCA9IHAuaXMwKCk7XG4gICAgLy8gSWYgaW52WiB3YXMgMCwgd2UgcmV0dXJuIHplcm8gcG9pbnQuIEhvd2V2ZXIgd2Ugc3RpbGwgd2FudCB0byBleGVjdXRlXG4gICAgLy8gYWxsIG9wZXJhdGlvbnMsIHNvIHdlIHJlcGxhY2UgaW52WiB3aXRoIGEgcmFuZG9tIG51bWJlciwgMS5cbiAgICBpZiAoaXogPT0gbnVsbCkgaXogPSBpczAgPyBGcC5PTkUgOiBGcC5pbnYoWik7XG4gICAgY29uc3QgeCA9IEZwLm11bChYLCBpeik7XG4gICAgY29uc3QgeSA9IEZwLm11bChZLCBpeik7XG4gICAgY29uc3QgenogPSBGcC5tdWwoWiwgaXopO1xuICAgIGlmIChpczApIHJldHVybiB7IHg6IEZwLlpFUk8sIHk6IEZwLlpFUk8gfTtcbiAgICBpZiAoIUZwLmVxbCh6eiwgRnAuT05FKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZaIHdhcyBpbnZhbGlkJyk7XG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9KTtcbiAgLy8gTk9URTogb24gZXhjZXB0aW9uIHRoaXMgd2lsbCBjcmFzaCAnY2FjaGVkJyBhbmQgbm8gdmFsdWUgd2lsbCBiZSBzZXQuXG4gIC8vIE90aGVyd2lzZSB0cnVlIHdpbGwgYmUgcmV0dXJuXG4gIGNvbnN0IGFzc2VydFZhbGlkTWVtbyA9IG1lbW9pemVkKChwOiBQb2ludCkgPT4ge1xuICAgIGlmIChwLmlzMCgpKSB7XG4gICAgICAvLyAoMCwgMSwgMCkgYWthIFpFUk8gaXMgaW52YWxpZCBpbiBtb3N0IGNvbnRleHRzLlxuICAgICAgLy8gSW4gQkxTLCBaRVJPIGNhbiBiZSBzZXJpYWxpemVkLCBzbyB3ZSBhbGxvdyBpdC5cbiAgICAgIC8vICgwLCAwLCAwKSBpcyBpbnZhbGlkIHJlcHJlc2VudGF0aW9uIG9mIFpFUk8uXG4gICAgICBpZiAoZXh0cmFPcHRzLmFsbG93SW5maW5pdHlQb2ludCAmJiAhRnAuaXMwKHAuWSkpIHJldHVybjtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBaRVJPJyk7XG4gICAgfVxuICAgIC8vIFNvbWUgM3JkLXBhcnR5IHRlc3QgdmVjdG9ycyByZXF1aXJlIGRpZmZlcmVudCB3b3JkaW5nIGJldHdlZW4gaGVyZSAmIGBmcm9tQ29tcHJlc3NlZEhleGBcbiAgICBjb25zdCB7IHgsIHkgfSA9IHAudG9BZmZpbmUoKTtcbiAgICBpZiAoIUZwLmlzVmFsaWQoeCkgfHwgIUZwLmlzVmFsaWQoeSkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiB4IG9yIHkgbm90IGZpZWxkIGVsZW1lbnRzJyk7XG4gICAgaWYgKCFpc1ZhbGlkWFkoeCwgeSkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBlcXVhdGlvbiBsZWZ0ICE9IHJpZ2h0Jyk7XG4gICAgaWYgKCFwLmlzVG9yc2lvbkZyZWUoKSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IG5vdCBpbiBwcmltZS1vcmRlciBzdWJncm91cCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxuICBmdW5jdGlvbiBmaW5pc2hFbmRvKFxuICAgIGVuZG9CZXRhOiBFbmRvbW9ycGhpc21PcHRzWydiZXRhJ10sXG4gICAgazFwOiBQb2ludCxcbiAgICBrMnA6IFBvaW50LFxuICAgIGsxbmVnOiBib29sZWFuLFxuICAgIGsybmVnOiBib29sZWFuXG4gICkge1xuICAgIGsycCA9IG5ldyBQb2ludChGcC5tdWwoazJwLlgsIGVuZG9CZXRhKSwgazJwLlksIGsycC5aKTtcbiAgICBrMXAgPSBuZWdhdGVDdChrMW5lZywgazFwKTtcbiAgICBrMnAgPSBuZWdhdGVDdChrMm5lZywgazJwKTtcbiAgICByZXR1cm4gazFwLmFkZChrMnApO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2plY3RpdmUgUG9pbnQgd29ya3MgaW4gM2QgLyBwcm9qZWN0aXZlIChob21vZ2VuZW91cykgY29vcmRpbmF0ZXM6KFgsIFksIFopIFx1MjIwQiAoeD1YL1osIHk9WS9aKS5cbiAgICogRGVmYXVsdCBQb2ludCB3b3JrcyBpbiAyZCAvIGFmZmluZSBjb29yZGluYXRlczogKHgsIHkpLlxuICAgKiBXZSdyZSBkb2luZyBjYWxjdWxhdGlvbnMgaW4gcHJvamVjdGl2ZSwgYmVjYXVzZSBpdHMgb3BlcmF0aW9ucyBkb24ndCByZXF1aXJlIGNvc3RseSBpbnZlcnNpb24uXG4gICAqL1xuICBjbGFzcyBQb2ludCBpbXBsZW1lbnRzIFdlaWVyc3RyYXNzUG9pbnQ8VD4ge1xuICAgIC8vIGJhc2UgLyBnZW5lcmF0b3IgcG9pbnRcbiAgICBzdGF0aWMgcmVhZG9ubHkgQkFTRSA9IG5ldyBQb2ludChDVVJWRS5HeCwgQ1VSVkUuR3ksIEZwLk9ORSk7XG4gICAgLy8gemVybyAvIGluZmluaXR5IC8gaWRlbnRpdHkgcG9pbnRcbiAgICBzdGF0aWMgcmVhZG9ubHkgWkVSTyA9IG5ldyBQb2ludChGcC5aRVJPLCBGcC5PTkUsIEZwLlpFUk8pOyAvLyAwLCAxLCAwXG4gICAgLy8gbWF0aCBmaWVsZFxuICAgIHN0YXRpYyByZWFkb25seSBGcCA9IEZwO1xuICAgIC8vIHNjYWxhciBmaWVsZFxuICAgIHN0YXRpYyByZWFkb25seSBGbiA9IEZuO1xuXG4gICAgcmVhZG9ubHkgWDogVDtcbiAgICByZWFkb25seSBZOiBUO1xuICAgIHJlYWRvbmx5IFo6IFQ7XG5cbiAgICAvKiogRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgICBjb25zdHJ1Y3RvcihYOiBULCBZOiBULCBaOiBUKSB7XG4gICAgICB0aGlzLlggPSBhY29vcmQoJ3gnLCBYKTtcbiAgICAgIHRoaXMuWSA9IGFjb29yZCgneScsIFksIHRydWUpO1xuICAgICAgdGhpcy5aID0gYWNvb3JkKCd6JywgWik7XG4gICAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBDVVJWRSgpOiBXZWllcnN0cmFzc09wdHM8VD4ge1xuICAgICAgcmV0dXJuIENVUlZFO1xuICAgIH1cblxuICAgIC8qKiBEb2VzIE5PVCB2YWxpZGF0ZSBpZiB0aGUgcG9pbnQgaXMgdmFsaWQuIFVzZSBgLmFzc2VydFZhbGlkaXR5KClgLiAqL1xuICAgIHN0YXRpYyBmcm9tQWZmaW5lKHA6IEFmZmluZVBvaW50PFQ+KTogUG9pbnQge1xuICAgICAgY29uc3QgeyB4LCB5IH0gPSBwIHx8IHt9O1xuICAgICAgaWYgKCFwIHx8ICFGcC5pc1ZhbGlkKHgpIHx8ICFGcC5pc1ZhbGlkKHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYWZmaW5lIHBvaW50Jyk7XG4gICAgICBpZiAocCBpbnN0YW5jZW9mIFBvaW50KSB0aHJvdyBuZXcgRXJyb3IoJ3Byb2plY3RpdmUgcG9pbnQgbm90IGFsbG93ZWQnKTtcbiAgICAgIC8vICgwLCAwKSB3b3VsZCd2ZSBwcm9kdWNlZCAoMCwgMCwgMSkgLSBpbnN0ZWFkLCB3ZSBuZWVkICgwLCAxLCAwKVxuICAgICAgaWYgKEZwLmlzMCh4KSAmJiBGcC5pczAoeSkpIHJldHVybiBQb2ludC5aRVJPO1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCh4LCB5LCBGcC5PTkUpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBQb2ludCB7XG4gICAgICBjb25zdCBQID0gUG9pbnQuZnJvbUFmZmluZShkZWNvZGVQb2ludChhYnl0ZXMoYnl0ZXMsIHVuZGVmaW5lZCwgJ3BvaW50JykpKTtcbiAgICAgIFAuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgICAgIHJldHVybiBQO1xuICAgIH1cblxuICAgIHN0YXRpYyBmcm9tSGV4KGhleDogc3RyaW5nKTogUG9pbnQge1xuICAgICAgcmV0dXJuIFBvaW50LmZyb21CeXRlcyhoZXhUb0J5dGVzKGhleCkpO1xuICAgIH1cblxuICAgIGdldCB4KCk6IFQge1xuICAgICAgcmV0dXJuIHRoaXMudG9BZmZpbmUoKS54O1xuICAgIH1cbiAgICBnZXQgeSgpOiBUIHtcbiAgICAgIHJldHVybiB0aGlzLnRvQWZmaW5lKCkueTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB3aW5kb3dTaXplXG4gICAgICogQHBhcmFtIGlzTGF6eSB0cnVlIHdpbGwgZGVmZXIgdGFibGUgY29tcHV0YXRpb24gdW50aWwgdGhlIGZpcnN0IG11bHRpcGxpY2F0aW9uXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcmVjb21wdXRlKHdpbmRvd1NpemU6IG51bWJlciA9IDgsIGlzTGF6eSA9IHRydWUpOiBQb2ludCB7XG4gICAgICB3bmFmLmNyZWF0ZUNhY2hlKHRoaXMsIHdpbmRvd1NpemUpO1xuICAgICAgaWYgKCFpc0xhenkpIHRoaXMubXVsdGlwbHkoXzNuKTsgLy8gcmFuZG9tIG51bWJlclxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogcmV0dXJuIGB0aGlzYFxuICAgIC8qKiBBIHBvaW50IG9uIGN1cnZlIGlzIHZhbGlkIGlmIGl0IGNvbmZvcm1zIHRvIGVxdWF0aW9uLiAqL1xuICAgIGFzc2VydFZhbGlkaXR5KCk6IHZvaWQge1xuICAgICAgYXNzZXJ0VmFsaWRNZW1vKHRoaXMpO1xuICAgIH1cblxuICAgIGhhc0V2ZW5ZKCk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgeyB5IH0gPSB0aGlzLnRvQWZmaW5lKCk7XG4gICAgICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWVsZCBkb2Vzbid0IHN1cHBvcnQgaXNPZGRcIik7XG4gICAgICByZXR1cm4gIUZwLmlzT2RkKHkpO1xuICAgIH1cblxuICAgIC8qKiBDb21wYXJlIG9uZSBwb2ludCB0byBhbm90aGVyLiAqL1xuICAgIGVxdWFscyhvdGhlcjogUG9pbnQpOiBib29sZWFuIHtcbiAgICAgIGFwcmpwb2ludChvdGhlcik7XG4gICAgICBjb25zdCB7IFg6IFgxLCBZOiBZMSwgWjogWjEgfSA9IHRoaXM7XG4gICAgICBjb25zdCB7IFg6IFgyLCBZOiBZMiwgWjogWjIgfSA9IG90aGVyO1xuICAgICAgY29uc3QgVTEgPSBGcC5lcWwoRnAubXVsKFgxLCBaMiksIEZwLm11bChYMiwgWjEpKTtcbiAgICAgIGNvbnN0IFUyID0gRnAuZXFsKEZwLm11bChZMSwgWjIpLCBGcC5tdWwoWTIsIFoxKSk7XG4gICAgICByZXR1cm4gVTEgJiYgVTI7XG4gICAgfVxuXG4gICAgLyoqIEZsaXBzIHBvaW50IHRvIG9uZSBjb3JyZXNwb25kaW5nIHRvICh4LCAteSkgaW4gQWZmaW5lIGNvb3JkaW5hdGVzLiAqL1xuICAgIG5lZ2F0ZSgpOiBQb2ludCB7XG4gICAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMuWCwgRnAubmVnKHRoaXMuWSksIHRoaXMuWik7XG4gICAgfVxuXG4gICAgLy8gUmVuZXMtQ29zdGVsbG8tQmF0aW5hIGV4Y2VwdGlvbi1mcmVlIGRvdWJsaW5nIGZvcm11bGEuXG4gICAgLy8gVGhlcmUgaXMgMzAlIGZhc3RlciBKYWNvYmlhbiBmb3JtdWxhLCBidXQgaXQgaXMgbm90IGNvbXBsZXRlLlxuICAgIC8vIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTUvMTA2MCwgYWxnb3JpdGhtIDNcbiAgICAvLyBDb3N0OiA4TSArIDNTICsgMyphICsgMipiMyArIDE1YWRkLlxuICAgIGRvdWJsZSgpIHtcbiAgICAgIGNvbnN0IHsgYSwgYiB9ID0gQ1VSVkU7XG4gICAgICBjb25zdCBiMyA9IEZwLm11bChiLCBfM24pO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgbGV0IFgzID0gRnAuWkVSTywgWTMgPSBGcC5aRVJPLCBaMyA9IEZwLlpFUk87IC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgbGV0IHQwID0gRnAubXVsKFgxLCBYMSk7IC8vIHN0ZXAgMVxuICAgICAgbGV0IHQxID0gRnAubXVsKFkxLCBZMSk7XG4gICAgICBsZXQgdDIgPSBGcC5tdWwoWjEsIFoxKTtcbiAgICAgIGxldCB0MyA9IEZwLm11bChYMSwgWTEpO1xuICAgICAgdDMgPSBGcC5hZGQodDMsIHQzKTsgLy8gc3RlcCA1XG4gICAgICBaMyA9IEZwLm11bChYMSwgWjEpO1xuICAgICAgWjMgPSBGcC5hZGQoWjMsIFozKTtcbiAgICAgIFgzID0gRnAubXVsKGEsIFozKTtcbiAgICAgIFkzID0gRnAubXVsKGIzLCB0Mik7XG4gICAgICBZMyA9IEZwLmFkZChYMywgWTMpOyAvLyBzdGVwIDEwXG4gICAgICBYMyA9IEZwLnN1Yih0MSwgWTMpO1xuICAgICAgWTMgPSBGcC5hZGQodDEsIFkzKTtcbiAgICAgIFkzID0gRnAubXVsKFgzLCBZMyk7XG4gICAgICBYMyA9IEZwLm11bCh0MywgWDMpO1xuICAgICAgWjMgPSBGcC5tdWwoYjMsIFozKTsgLy8gc3RlcCAxNVxuICAgICAgdDIgPSBGcC5tdWwoYSwgdDIpO1xuICAgICAgdDMgPSBGcC5zdWIodDAsIHQyKTtcbiAgICAgIHQzID0gRnAubXVsKGEsIHQzKTtcbiAgICAgIHQzID0gRnAuYWRkKHQzLCBaMyk7XG4gICAgICBaMyA9IEZwLmFkZCh0MCwgdDApOyAvLyBzdGVwIDIwXG4gICAgICB0MCA9IEZwLmFkZChaMywgdDApO1xuICAgICAgdDAgPSBGcC5hZGQodDAsIHQyKTtcbiAgICAgIHQwID0gRnAubXVsKHQwLCB0Myk7XG4gICAgICBZMyA9IEZwLmFkZChZMywgdDApO1xuICAgICAgdDIgPSBGcC5tdWwoWTEsIFoxKTsgLy8gc3RlcCAyNVxuICAgICAgdDIgPSBGcC5hZGQodDIsIHQyKTtcbiAgICAgIHQwID0gRnAubXVsKHQyLCB0Myk7XG4gICAgICBYMyA9IEZwLnN1YihYMywgdDApO1xuICAgICAgWjMgPSBGcC5tdWwodDIsIHQxKTtcbiAgICAgIFozID0gRnAuYWRkKFozLCBaMyk7IC8vIHN0ZXAgMzBcbiAgICAgIFozID0gRnAuYWRkKFozLCBaMyk7XG4gICAgICByZXR1cm4gbmV3IFBvaW50KFgzLCBZMywgWjMpO1xuICAgIH1cblxuICAgIC8vIFJlbmVzLUNvc3RlbGxvLUJhdGluYSBleGNlcHRpb24tZnJlZSBhZGRpdGlvbiBmb3JtdWxhLlxuICAgIC8vIFRoZXJlIGlzIDMwJSBmYXN0ZXIgSmFjb2JpYW4gZm9ybXVsYSwgYnV0IGl0IGlzIG5vdCBjb21wbGV0ZS5cbiAgICAvLyBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDE1LzEwNjAsIGFsZ29yaXRobSAxXG4gICAgLy8gQ29zdDogMTJNICsgMFMgKyAzKmEgKyAzKmIzICsgMjNhZGQuXG4gICAgYWRkKG90aGVyOiBQb2ludCk6IFBvaW50IHtcbiAgICAgIGFwcmpwb2ludChvdGhlcik7XG4gICAgICBjb25zdCB7IFg6IFgxLCBZOiBZMSwgWjogWjEgfSA9IHRoaXM7XG4gICAgICBjb25zdCB7IFg6IFgyLCBZOiBZMiwgWjogWjIgfSA9IG90aGVyO1xuICAgICAgbGV0IFgzID0gRnAuWkVSTywgWTMgPSBGcC5aRVJPLCBaMyA9IEZwLlpFUk87IC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgY29uc3QgYSA9IENVUlZFLmE7XG4gICAgICBjb25zdCBiMyA9IEZwLm11bChDVVJWRS5iLCBfM24pO1xuICAgICAgbGV0IHQwID0gRnAubXVsKFgxLCBYMik7IC8vIHN0ZXAgMVxuICAgICAgbGV0IHQxID0gRnAubXVsKFkxLCBZMik7XG4gICAgICBsZXQgdDIgPSBGcC5tdWwoWjEsIFoyKTtcbiAgICAgIGxldCB0MyA9IEZwLmFkZChYMSwgWTEpO1xuICAgICAgbGV0IHQ0ID0gRnAuYWRkKFgyLCBZMik7IC8vIHN0ZXAgNVxuICAgICAgdDMgPSBGcC5tdWwodDMsIHQ0KTtcbiAgICAgIHQ0ID0gRnAuYWRkKHQwLCB0MSk7XG4gICAgICB0MyA9IEZwLnN1Yih0MywgdDQpO1xuICAgICAgdDQgPSBGcC5hZGQoWDEsIFoxKTtcbiAgICAgIGxldCB0NSA9IEZwLmFkZChYMiwgWjIpOyAvLyBzdGVwIDEwXG4gICAgICB0NCA9IEZwLm11bCh0NCwgdDUpO1xuICAgICAgdDUgPSBGcC5hZGQodDAsIHQyKTtcbiAgICAgIHQ0ID0gRnAuc3ViKHQ0LCB0NSk7XG4gICAgICB0NSA9IEZwLmFkZChZMSwgWjEpO1xuICAgICAgWDMgPSBGcC5hZGQoWTIsIFoyKTsgLy8gc3RlcCAxNVxuICAgICAgdDUgPSBGcC5tdWwodDUsIFgzKTtcbiAgICAgIFgzID0gRnAuYWRkKHQxLCB0Mik7XG4gICAgICB0NSA9IEZwLnN1Yih0NSwgWDMpO1xuICAgICAgWjMgPSBGcC5tdWwoYSwgdDQpO1xuICAgICAgWDMgPSBGcC5tdWwoYjMsIHQyKTsgLy8gc3RlcCAyMFxuICAgICAgWjMgPSBGcC5hZGQoWDMsIFozKTtcbiAgICAgIFgzID0gRnAuc3ViKHQxLCBaMyk7XG4gICAgICBaMyA9IEZwLmFkZCh0MSwgWjMpO1xuICAgICAgWTMgPSBGcC5tdWwoWDMsIFozKTtcbiAgICAgIHQxID0gRnAuYWRkKHQwLCB0MCk7IC8vIHN0ZXAgMjVcbiAgICAgIHQxID0gRnAuYWRkKHQxLCB0MCk7XG4gICAgICB0MiA9IEZwLm11bChhLCB0Mik7XG4gICAgICB0NCA9IEZwLm11bChiMywgdDQpO1xuICAgICAgdDEgPSBGcC5hZGQodDEsIHQyKTtcbiAgICAgIHQyID0gRnAuc3ViKHQwLCB0Mik7IC8vIHN0ZXAgMzBcbiAgICAgIHQyID0gRnAubXVsKGEsIHQyKTtcbiAgICAgIHQ0ID0gRnAuYWRkKHQ0LCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MSwgdDQpO1xuICAgICAgWTMgPSBGcC5hZGQoWTMsIHQwKTtcbiAgICAgIHQwID0gRnAubXVsKHQ1LCB0NCk7IC8vIHN0ZXAgMzVcbiAgICAgIFgzID0gRnAubXVsKHQzLCBYMyk7XG4gICAgICBYMyA9IEZwLnN1YihYMywgdDApO1xuICAgICAgdDAgPSBGcC5tdWwodDMsIHQxKTtcbiAgICAgIFozID0gRnAubXVsKHQ1LCBaMyk7XG4gICAgICBaMyA9IEZwLmFkZChaMywgdDApOyAvLyBzdGVwIDQwXG4gICAgICByZXR1cm4gbmV3IFBvaW50KFgzLCBZMywgWjMpO1xuICAgIH1cblxuICAgIHN1YnRyYWN0KG90aGVyOiBQb2ludCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkKG90aGVyLm5lZ2F0ZSgpKTtcbiAgICB9XG5cbiAgICBpczAoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5lcXVhbHMoUG9pbnQuWkVSTyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29uc3RhbnQgdGltZSBtdWx0aXBsaWNhdGlvbi5cbiAgICAgKiBVc2VzIHdOQUYgbWV0aG9kLiBXaW5kb3dlZCBtZXRob2QgbWF5IGJlIDEwJSBmYXN0ZXIsXG4gICAgICogYnV0IHRha2VzIDJ4IGxvbmdlciB0byBnZW5lcmF0ZSBhbmQgY29uc3VtZXMgMnggbWVtb3J5LlxuICAgICAqIFVzZXMgcHJlY29tcHV0ZXMgd2hlbiBhdmFpbGFibGUuXG4gICAgICogVXNlcyBlbmRvbW9ycGhpc20gZm9yIEtvYmxpdHogY3VydmVzLlxuICAgICAqIEBwYXJhbSBzY2FsYXIgYnkgd2hpY2ggdGhlIHBvaW50IHdvdWxkIGJlIG11bHRpcGxpZWRcbiAgICAgKiBAcmV0dXJucyBOZXcgcG9pbnRcbiAgICAgKi9cbiAgICBtdWx0aXBseShzY2FsYXI6IGJpZ2ludCk6IFBvaW50IHtcbiAgICAgIGNvbnN0IHsgZW5kbyB9ID0gZXh0cmFPcHRzO1xuICAgICAgaWYgKCFGbi5pc1ZhbGlkTm90MChzY2FsYXIpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyOiBvdXQgb2YgcmFuZ2UnKTsgLy8gMCBpcyBpbnZhbGlkXG4gICAgICBsZXQgcG9pbnQ6IFBvaW50LCBmYWtlOiBQb2ludDsgLy8gRmFrZSBwb2ludCBpcyB1c2VkIHRvIGNvbnN0LXRpbWUgbXVsdFxuICAgICAgY29uc3QgbXVsID0gKG46IGJpZ2ludCkgPT4gd25hZi5jYWNoZWQodGhpcywgbiwgKHApID0+IG5vcm1hbGl6ZVooUG9pbnQsIHApKTtcbiAgICAgIC8qKiBTZWUgZG9jcyBmb3Ige0BsaW5rIEVuZG9tb3JwaGlzbU9wdHN9ICovXG4gICAgICBpZiAoZW5kbykge1xuICAgICAgICBjb25zdCB7IGsxbmVnLCBrMSwgazJuZWcsIGsyIH0gPSBzcGxpdEVuZG9TY2FsYXJOKHNjYWxhcik7XG4gICAgICAgIGNvbnN0IHsgcDogazFwLCBmOiBrMWYgfSA9IG11bChrMSk7XG4gICAgICAgIGNvbnN0IHsgcDogazJwLCBmOiBrMmYgfSA9IG11bChrMik7XG4gICAgICAgIGZha2UgPSBrMWYuYWRkKGsyZik7XG4gICAgICAgIHBvaW50ID0gZmluaXNoRW5kbyhlbmRvLmJldGEsIGsxcCwgazJwLCBrMW5lZywgazJuZWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgeyBwLCBmIH0gPSBtdWwoc2NhbGFyKTtcbiAgICAgICAgcG9pbnQgPSBwO1xuICAgICAgICBmYWtlID0gZjtcbiAgICAgIH1cbiAgICAgIC8vIE5vcm1hbGl6ZSBgemAgZm9yIGJvdGggcG9pbnRzLCBidXQgcmV0dXJuIG9ubHkgcmVhbCBvbmVcbiAgICAgIHJldHVybiBub3JtYWxpemVaKFBvaW50LCBbcG9pbnQsIGZha2VdKVswXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOb24tY29uc3RhbnQtdGltZSBtdWx0aXBsaWNhdGlvbi4gVXNlcyBkb3VibGUtYW5kLWFkZCBhbGdvcml0aG0uXG4gICAgICogSXQncyBmYXN0ZXIsIGJ1dCBzaG91bGQgb25seSBiZSB1c2VkIHdoZW4geW91IGRvbid0IGNhcmUgYWJvdXRcbiAgICAgKiBhbiBleHBvc2VkIHNlY3JldCBrZXkgZS5nLiBzaWcgdmVyaWZpY2F0aW9uLCB3aGljaCB3b3JrcyBvdmVyICpwdWJsaWMqIGtleXMuXG4gICAgICovXG4gICAgbXVsdGlwbHlVbnNhZmUoc2M6IGJpZ2ludCk6IFBvaW50IHtcbiAgICAgIGNvbnN0IHsgZW5kbyB9ID0gZXh0cmFPcHRzO1xuICAgICAgY29uc3QgcCA9IHRoaXMgYXMgUG9pbnQ7XG4gICAgICBpZiAoIUZuLmlzVmFsaWQoc2MpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyOiBvdXQgb2YgcmFuZ2UnKTsgLy8gMCBpcyB2YWxpZFxuICAgICAgaWYgKHNjID09PSBfMG4gfHwgcC5pczAoKSkgcmV0dXJuIFBvaW50LlpFUk87IC8vIDBcbiAgICAgIGlmIChzYyA9PT0gXzFuKSByZXR1cm4gcDsgLy8gMVxuICAgICAgaWYgKHduYWYuaGFzQ2FjaGUodGhpcykpIHJldHVybiB0aGlzLm11bHRpcGx5KHNjKTsgLy8gcHJlY29tcHV0ZXNcbiAgICAgIC8vIFdlIGRvbid0IGhhdmUgbWV0aG9kIGZvciBkb3VibGUgc2NhbGFyIG11bHRpcGxpY2F0aW9uIChhUCArIGJRKTpcbiAgICAgIC8vIEV2ZW4gd2l0aCB1c2luZyBTdHJhdXNzLVNoYW1pciB0cmljaywgaXQncyAzNSUgc2xvd2VyIHRoYW4gbmFcdTAwRUZ2ZSBtdWwrYWRkLlxuICAgICAgaWYgKGVuZG8pIHtcbiAgICAgICAgY29uc3QgeyBrMW5lZywgazEsIGsybmVnLCBrMiB9ID0gc3BsaXRFbmRvU2NhbGFyTihzYyk7XG4gICAgICAgIGNvbnN0IHsgcDEsIHAyIH0gPSBtdWxFbmRvVW5zYWZlKFBvaW50LCBwLCBrMSwgazIpOyAvLyAzMCUgZmFzdGVyIHZzIHduYWYudW5zYWZlXG4gICAgICAgIHJldHVybiBmaW5pc2hFbmRvKGVuZG8uYmV0YSwgcDEsIHAyLCBrMW5lZywgazJuZWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHduYWYudW5zYWZlKHAsIHNjKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBQcm9qZWN0aXZlIHBvaW50IHRvIGFmZmluZSAoeCwgeSkgY29vcmRpbmF0ZXMuXG4gICAgICogQHBhcmFtIGludmVydGVkWiBaXi0xIChpbnZlcnRlZCB6ZXJvKSAtIG9wdGlvbmFsLCBwcmVjb21wdXRhdGlvbiBpcyB1c2VmdWwgZm9yIGludmVydEJhdGNoXG4gICAgICovXG4gICAgdG9BZmZpbmUoaW52ZXJ0ZWRaPzogVCk6IEFmZmluZVBvaW50PFQ+IHtcbiAgICAgIHJldHVybiB0b0FmZmluZU1lbW8odGhpcywgaW52ZXJ0ZWRaKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciBQb2ludCBpcyBmcmVlIG9mIHRvcnNpb24gZWxlbWVudHMgKGlzIGluIHByaW1lIHN1Ymdyb3VwKS5cbiAgICAgKiBBbHdheXMgdG9yc2lvbi1mcmVlIGZvciBjb2ZhY3Rvcj0xIGN1cnZlcy5cbiAgICAgKi9cbiAgICBpc1RvcnNpb25GcmVlKCk6IGJvb2xlYW4ge1xuICAgICAgY29uc3QgeyBpc1RvcnNpb25GcmVlIH0gPSBleHRyYU9wdHM7XG4gICAgICBpZiAoY29mYWN0b3IgPT09IF8xbikgcmV0dXJuIHRydWU7XG4gICAgICBpZiAoaXNUb3JzaW9uRnJlZSkgcmV0dXJuIGlzVG9yc2lvbkZyZWUoUG9pbnQsIHRoaXMpO1xuICAgICAgcmV0dXJuIHduYWYudW5zYWZlKHRoaXMsIENVUlZFX09SREVSKS5pczAoKTtcbiAgICB9XG5cbiAgICBjbGVhckNvZmFjdG9yKCk6IFBvaW50IHtcbiAgICAgIGNvbnN0IHsgY2xlYXJDb2ZhY3RvciB9ID0gZXh0cmFPcHRzO1xuICAgICAgaWYgKGNvZmFjdG9yID09PSBfMW4pIHJldHVybiB0aGlzOyAvLyBGYXN0LXBhdGhcbiAgICAgIGlmIChjbGVhckNvZmFjdG9yKSByZXR1cm4gY2xlYXJDb2ZhY3RvcihQb2ludCwgdGhpcykgYXMgUG9pbnQ7XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVVuc2FmZShjb2ZhY3Rvcik7XG4gICAgfVxuXG4gICAgaXNTbWFsbE9yZGVyKCk6IGJvb2xlYW4ge1xuICAgICAgLy8gY2FuIHdlIHVzZSB0aGlzLmNsZWFyQ29mYWN0b3IoKT9cbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5VW5zYWZlKGNvZmFjdG9yKS5pczAoKTtcbiAgICB9XG5cbiAgICB0b0J5dGVzKGlzQ29tcHJlc3NlZCA9IHRydWUpOiBVaW50OEFycmF5IHtcbiAgICAgIGFib29sKGlzQ29tcHJlc3NlZCwgJ2lzQ29tcHJlc3NlZCcpO1xuICAgICAgdGhpcy5hc3NlcnRWYWxpZGl0eSgpO1xuICAgICAgcmV0dXJuIGVuY29kZVBvaW50KFBvaW50LCB0aGlzLCBpc0NvbXByZXNzZWQpO1xuICAgIH1cblxuICAgIHRvSGV4KGlzQ29tcHJlc3NlZCA9IHRydWUpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIGJ5dGVzVG9IZXgodGhpcy50b0J5dGVzKGlzQ29tcHJlc3NlZCkpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIGA8UG9pbnQgJHt0aGlzLmlzMCgpID8gJ1pFUk8nIDogdGhpcy50b0hleCgpfT5gO1xuICAgIH1cbiAgfVxuICBjb25zdCBiaXRzID0gRm4uQklUUztcbiAgY29uc3Qgd25hZiA9IG5ldyB3TkFGKFBvaW50LCBleHRyYU9wdHMuZW5kbyA/IE1hdGguY2VpbChiaXRzIC8gMikgOiBiaXRzKTtcbiAgUG9pbnQuQkFTRS5wcmVjb21wdXRlKDgpOyAvLyBFbmFibGUgcHJlY29tcHV0ZXMuIFNsb3dzIGRvd24gZmlyc3QgcHVibGljS2V5IGNvbXB1dGF0aW9uIGJ5IDIwbXMuXG4gIHJldHVybiBQb2ludDtcbn1cblxuLyoqIE1ldGhvZHMgb2YgRUNEU0Egc2lnbmF0dXJlIGluc3RhbmNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBFQ0RTQVNpZ25hdHVyZSB7XG4gIHJlYWRvbmx5IHI6IGJpZ2ludDtcbiAgcmVhZG9ubHkgczogYmlnaW50O1xuICByZWFkb25seSByZWNvdmVyeT86IG51bWJlcjtcbiAgYWRkUmVjb3ZlcnlCaXQocmVjb3Zlcnk6IG51bWJlcik6IEVDRFNBU2lnbmF0dXJlICYgeyByZWFkb25seSByZWNvdmVyeTogbnVtYmVyIH07XG4gIGhhc0hpZ2hTKCk6IGJvb2xlYW47XG4gIHJlY292ZXJQdWJsaWNLZXkobWVzc2FnZUhhc2g6IFVpbnQ4QXJyYXkpOiBXZWllcnN0cmFzc1BvaW50PGJpZ2ludD47XG4gIHRvQnl0ZXMoZm9ybWF0Pzogc3RyaW5nKTogVWludDhBcnJheTtcbiAgdG9IZXgoZm9ybWF0Pzogc3RyaW5nKTogc3RyaW5nO1xufVxuLyoqIE1ldGhvZHMgb2YgRUNEU0Egc2lnbmF0dXJlIGNvbnN0cnVjdG9yLiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FTaWduYXR1cmVDb25zID0ge1xuICBuZXcgKHI6IGJpZ2ludCwgczogYmlnaW50LCByZWNvdmVyeT86IG51bWJlcik6IEVDRFNBU2lnbmF0dXJlO1xuICBmcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXksIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0KTogRUNEU0FTaWduYXR1cmU7XG4gIGZyb21IZXgoaGV4OiBzdHJpbmcsIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0KTogRUNEU0FTaWduYXR1cmU7XG59O1xuXG4vLyBQb2ludHMgc3RhcnQgd2l0aCBieXRlIDB4MDIgd2hlbiB5IGlzIGV2ZW47IG90aGVyd2lzZSAweDAzXG5mdW5jdGlvbiBwcHJlZml4KGhhc0V2ZW5ZOiBib29sZWFuKTogVWludDhBcnJheSB7XG4gIHJldHVybiBVaW50OEFycmF5Lm9mKGhhc0V2ZW5ZID8gMHgwMiA6IDB4MDMpO1xufVxuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBTaGFsbHVlIGFuZCB2YW4gZGUgV29lc3Rpam5lIG1ldGhvZCBmb3IgYW55IHdlaWVyc3RyYXNzIGN1cnZlLlxuICogVE9ETzogY2hlY2sgaWYgdGhlcmUgaXMgYSB3YXkgdG8gbWVyZ2UgdGhpcyB3aXRoIHV2UmF0aW8gaW4gRWR3YXJkczsgbW92ZSB0byBtb2R1bGFyLlxuICogYiA9IFRydWUgYW5kIHkgPSBzcXJ0KHUgLyB2KSBpZiAodSAvIHYpIGlzIHNxdWFyZSBpbiBGLCBhbmRcbiAqIGIgPSBGYWxzZSBhbmQgeSA9IHNxcnQoWiAqICh1IC8gdikpIG90aGVyd2lzZS5cbiAqIEBwYXJhbSBGcFxuICogQHBhcmFtIFpcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTV1VGcFNxcnRSYXRpbzxUPihcbiAgRnA6IElGaWVsZDxUPixcbiAgWjogVFxuKTogKHU6IFQsIHY6IFQpID0+IHsgaXNWYWxpZDogYm9vbGVhbjsgdmFsdWU6IFQgfSB7XG4gIC8vIEdlbmVyaWMgaW1wbGVtZW50YXRpb25cbiAgY29uc3QgcSA9IEZwLk9SREVSO1xuICBsZXQgbCA9IF8wbjtcbiAgZm9yIChsZXQgbyA9IHEgLSBfMW47IG8gJSBfMm4gPT09IF8wbjsgbyAvPSBfMm4pIGwgKz0gXzFuO1xuICBjb25zdCBjMSA9IGw7IC8vIDEuIGMxLCB0aGUgbGFyZ2VzdCBpbnRlZ2VyIHN1Y2ggdGhhdCAyXmMxIGRpdmlkZXMgcSAtIDEuXG4gIC8vIFdlIG5lZWQgMm4gKiogYzEgYW5kIDJuICoqIChjMS0xKS4gV2UgY2FuJ3QgdXNlICoqOyBidXQgd2UgY2FuIHVzZSA8PC5cbiAgLy8gMm4gKiogYzEgPT0gMm4gPDwgKGMxLTEpXG4gIGNvbnN0IF8ybl9wb3dfYzFfMSA9IF8ybiA8PCAoYzEgLSBfMW4gLSBfMW4pO1xuICBjb25zdCBfMm5fcG93X2MxID0gXzJuX3Bvd19jMV8xICogXzJuO1xuICBjb25zdCBjMiA9IChxIC0gXzFuKSAvIF8ybl9wb3dfYzE7IC8vIDIuIGMyID0gKHEgLSAxKSAvICgyXmMxKSAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzMgPSAoYzIgLSBfMW4pIC8gXzJuOyAvLyAzLiBjMyA9IChjMiAtIDEpIC8gMiAgICAgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGM0ID0gXzJuX3Bvd19jMSAtIF8xbjsgLy8gNC4gYzQgPSAyXmMxIC0gMSAgICAgICAgICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjNSA9IF8ybl9wb3dfYzFfMTsgLy8gNS4gYzUgPSAyXihjMSAtIDEpICAgICAgICAgICAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzYgPSBGcC5wb3coWiwgYzIpOyAvLyA2LiBjNiA9IFpeYzJcbiAgY29uc3QgYzcgPSBGcC5wb3coWiwgKGMyICsgXzFuKSAvIF8ybik7IC8vIDcuIGM3ID0gWl4oKGMyICsgMSkgLyAyKVxuICBsZXQgc3FydFJhdGlvID0gKHU6IFQsIHY6IFQpOiB7IGlzVmFsaWQ6IGJvb2xlYW47IHZhbHVlOiBUIH0gPT4ge1xuICAgIGxldCB0djEgPSBjNjsgLy8gMS4gdHYxID0gYzZcbiAgICBsZXQgdHYyID0gRnAucG93KHYsIGM0KTsgLy8gMi4gdHYyID0gdl5jNFxuICAgIGxldCB0djMgPSBGcC5zcXIodHYyKTsgLy8gMy4gdHYzID0gdHYyXjJcbiAgICB0djMgPSBGcC5tdWwodHYzLCB2KTsgLy8gNC4gdHYzID0gdHYzICogdlxuICAgIGxldCB0djUgPSBGcC5tdWwodSwgdHYzKTsgLy8gNS4gdHY1ID0gdSAqIHR2M1xuICAgIHR2NSA9IEZwLnBvdyh0djUsIGMzKTsgLy8gNi4gdHY1ID0gdHY1XmMzXG4gICAgdHY1ID0gRnAubXVsKHR2NSwgdHYyKTsgLy8gNy4gdHY1ID0gdHY1ICogdHYyXG4gICAgdHYyID0gRnAubXVsKHR2NSwgdik7IC8vIDguIHR2MiA9IHR2NSAqIHZcbiAgICB0djMgPSBGcC5tdWwodHY1LCB1KTsgLy8gOS4gdHYzID0gdHY1ICogdVxuICAgIGxldCB0djQgPSBGcC5tdWwodHYzLCB0djIpOyAvLyAxMC4gdHY0ID0gdHYzICogdHYyXG4gICAgdHY1ID0gRnAucG93KHR2NCwgYzUpOyAvLyAxMS4gdHY1ID0gdHY0XmM1XG4gICAgbGV0IGlzUVIgPSBGcC5lcWwodHY1LCBGcC5PTkUpOyAvLyAxMi4gaXNRUiA9IHR2NSA9PSAxXG4gICAgdHYyID0gRnAubXVsKHR2MywgYzcpOyAvLyAxMy4gdHYyID0gdHYzICogYzdcbiAgICB0djUgPSBGcC5tdWwodHY0LCB0djEpOyAvLyAxNC4gdHY1ID0gdHY0ICogdHYxXG4gICAgdHYzID0gRnAuY21vdih0djIsIHR2MywgaXNRUik7IC8vIDE1LiB0djMgPSBDTU9WKHR2MiwgdHYzLCBpc1FSKVxuICAgIHR2NCA9IEZwLmNtb3YodHY1LCB0djQsIGlzUVIpOyAvLyAxNi4gdHY0ID0gQ01PVih0djUsIHR2NCwgaXNRUilcbiAgICAvLyAxNy4gZm9yIGkgaW4gKGMxLCBjMSAtIDEsIC4uLiwgMik6XG4gICAgZm9yIChsZXQgaSA9IGMxOyBpID4gXzFuOyBpLS0pIHtcbiAgICAgIGxldCB0djUgPSBpIC0gXzJuOyAvLyAxOC4gICAgdHY1ID0gaSAtIDJcbiAgICAgIHR2NSA9IF8ybiA8PCAodHY1IC0gXzFuKTsgLy8gMTkuICAgIHR2NSA9IDJedHY1XG4gICAgICBsZXQgdHZ2NSA9IEZwLnBvdyh0djQsIHR2NSk7IC8vIDIwLiAgICB0djUgPSB0djRedHY1XG4gICAgICBjb25zdCBlMSA9IEZwLmVxbCh0dnY1LCBGcC5PTkUpOyAvLyAyMS4gICAgZTEgPSB0djUgPT0gMVxuICAgICAgdHYyID0gRnAubXVsKHR2MywgdHYxKTsgLy8gMjIuICAgIHR2MiA9IHR2MyAqIHR2MVxuICAgICAgdHYxID0gRnAubXVsKHR2MSwgdHYxKTsgLy8gMjMuICAgIHR2MSA9IHR2MSAqIHR2MVxuICAgICAgdHZ2NSA9IEZwLm11bCh0djQsIHR2MSk7IC8vIDI0LiAgICB0djUgPSB0djQgKiB0djFcbiAgICAgIHR2MyA9IEZwLmNtb3YodHYyLCB0djMsIGUxKTsgLy8gMjUuICAgIHR2MyA9IENNT1YodHYyLCB0djMsIGUxKVxuICAgICAgdHY0ID0gRnAuY21vdih0dnY1LCB0djQsIGUxKTsgLy8gMjYuICAgIHR2NCA9IENNT1YodHY1LCB0djQsIGUxKVxuICAgIH1cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBpc1FSLCB2YWx1ZTogdHYzIH07XG4gIH07XG4gIGlmIChGcC5PUkRFUiAlIF80biA9PT0gXzNuKSB7XG4gICAgLy8gc3FydF9yYXRpb18zbW9kNCh1LCB2KVxuICAgIGNvbnN0IGMxID0gKEZwLk9SREVSIC0gXzNuKSAvIF80bjsgLy8gMS4gYzEgPSAocSAtIDMpIC8gNCAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgICBjb25zdCBjMiA9IEZwLnNxcnQoRnAubmVnKFopKTsgLy8gMi4gYzIgPSBzcXJ0KC1aKVxuICAgIHNxcnRSYXRpbyA9ICh1OiBULCB2OiBUKSA9PiB7XG4gICAgICBsZXQgdHYxID0gRnAuc3FyKHYpOyAvLyAxLiB0djEgPSB2XjJcbiAgICAgIGNvbnN0IHR2MiA9IEZwLm11bCh1LCB2KTsgLy8gMi4gdHYyID0gdSAqIHZcbiAgICAgIHR2MSA9IEZwLm11bCh0djEsIHR2Mik7IC8vIDMuIHR2MSA9IHR2MSAqIHR2MlxuICAgICAgbGV0IHkxID0gRnAucG93KHR2MSwgYzEpOyAvLyA0LiB5MSA9IHR2MV5jMVxuICAgICAgeTEgPSBGcC5tdWwoeTEsIHR2Mik7IC8vIDUuIHkxID0geTEgKiB0djJcbiAgICAgIGNvbnN0IHkyID0gRnAubXVsKHkxLCBjMik7IC8vIDYuIHkyID0geTEgKiBjMlxuICAgICAgY29uc3QgdHYzID0gRnAubXVsKEZwLnNxcih5MSksIHYpOyAvLyA3LiB0djMgPSB5MV4yOyA4LiB0djMgPSB0djMgKiB2XG4gICAgICBjb25zdCBpc1FSID0gRnAuZXFsKHR2MywgdSk7IC8vIDkuIGlzUVIgPSB0djMgPT0gdVxuICAgICAgbGV0IHkgPSBGcC5jbW92KHkyLCB5MSwgaXNRUik7IC8vIDEwLiB5ID0gQ01PVih5MiwgeTEsIGlzUVIpXG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBpc1FSLCB2YWx1ZTogeSB9OyAvLyAxMS4gcmV0dXJuIChpc1FSLCB5KSBpc1FSID8geSA6IHkqYzJcbiAgICB9O1xuICB9XG4gIC8vIE5vIGN1cnZlcyB1c2VzIHRoYXRcbiAgLy8gaWYgKEZwLk9SREVSICUgXzhuID09PSBfNW4pIC8vIHNxcnRfcmF0aW9fNW1vZDhcbiAgcmV0dXJuIHNxcnRSYXRpbztcbn1cbi8qKlxuICogU2ltcGxpZmllZCBTaGFsbHVlLXZhbiBkZSBXb2VzdGlqbmUtVWxhcyBNZXRob2RcbiAqIGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM5MzgwI3NlY3Rpb24tNi42LjJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvQ3VydmVTaW1wbGVTV1U8VD4oXG4gIEZwOiBJRmllbGQ8VD4sXG4gIG9wdHM6IHtcbiAgICBBOiBUO1xuICAgIEI6IFQ7XG4gICAgWjogVDtcbiAgfVxuKTogKHU6IFQpID0+IHsgeDogVDsgeTogVCB9IHtcbiAgdmFsaWRhdGVGaWVsZChGcCk7XG4gIGNvbnN0IHsgQSwgQiwgWiB9ID0gb3B0cztcbiAgaWYgKCFGcC5pc1ZhbGlkKEEpIHx8ICFGcC5pc1ZhbGlkKEIpIHx8ICFGcC5pc1ZhbGlkKFopKVxuICAgIHRocm93IG5ldyBFcnJvcignbWFwVG9DdXJ2ZVNpbXBsZVNXVTogaW52YWxpZCBvcHRzJyk7XG4gIGNvbnN0IHNxcnRSYXRpbyA9IFNXVUZwU3FydFJhdGlvKEZwLCBaKTtcbiAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKCdGaWVsZCBkb2VzIG5vdCBoYXZlIC5pc09kZCgpJyk7XG4gIC8vIElucHV0OiB1LCBhbiBlbGVtZW50IG9mIEYuXG4gIC8vIE91dHB1dDogKHgsIHkpLCBhIHBvaW50IG9uIEUuXG4gIHJldHVybiAodTogVCk6IHsgeDogVDsgeTogVCB9ID0+IHtcbiAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICBsZXQgdHYxLCB0djIsIHR2MywgdHY0LCB0djUsIHR2NiwgeCwgeTtcbiAgICB0djEgPSBGcC5zcXIodSk7IC8vIDEuICB0djEgPSB1XjJcbiAgICB0djEgPSBGcC5tdWwodHYxLCBaKTsgLy8gMi4gIHR2MSA9IFogKiB0djFcbiAgICB0djIgPSBGcC5zcXIodHYxKTsgLy8gMy4gIHR2MiA9IHR2MV4yXG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHYxKTsgLy8gNC4gIHR2MiA9IHR2MiArIHR2MVxuICAgIHR2MyA9IEZwLmFkZCh0djIsIEZwLk9ORSk7IC8vIDUuICB0djMgPSB0djIgKyAxXG4gICAgdHYzID0gRnAubXVsKHR2MywgQik7IC8vIDYuICB0djMgPSBCICogdHYzXG4gICAgdHY0ID0gRnAuY21vdihaLCBGcC5uZWcodHYyKSwgIUZwLmVxbCh0djIsIEZwLlpFUk8pKTsgLy8gNy4gIHR2NCA9IENNT1YoWiwgLXR2MiwgdHYyICE9IDApXG4gICAgdHY0ID0gRnAubXVsKHR2NCwgQSk7IC8vIDguICB0djQgPSBBICogdHY0XG4gICAgdHYyID0gRnAuc3FyKHR2Myk7IC8vIDkuICB0djIgPSB0djNeMlxuICAgIHR2NiA9IEZwLnNxcih0djQpOyAvLyAxMC4gdHY2ID0gdHY0XjJcbiAgICB0djUgPSBGcC5tdWwodHY2LCBBKTsgLy8gMTEuIHR2NSA9IEEgKiB0djZcbiAgICB0djIgPSBGcC5hZGQodHYyLCB0djUpOyAvLyAxMi4gdHYyID0gdHYyICsgdHY1XG4gICAgdHYyID0gRnAubXVsKHR2MiwgdHYzKTsgLy8gMTMuIHR2MiA9IHR2MiAqIHR2M1xuICAgIHR2NiA9IEZwLm11bCh0djYsIHR2NCk7IC8vIDE0LiB0djYgPSB0djYgKiB0djRcbiAgICB0djUgPSBGcC5tdWwodHY2LCBCKTsgLy8gMTUuIHR2NSA9IEIgKiB0djZcbiAgICB0djIgPSBGcC5hZGQodHYyLCB0djUpOyAvLyAxNi4gdHYyID0gdHYyICsgdHY1XG4gICAgeCA9IEZwLm11bCh0djEsIHR2Myk7IC8vIDE3LiAgIHggPSB0djEgKiB0djNcbiAgICBjb25zdCB7IGlzVmFsaWQsIHZhbHVlIH0gPSBzcXJ0UmF0aW8odHYyLCB0djYpOyAvLyAxOC4gKGlzX2d4MV9zcXVhcmUsIHkxKSA9IHNxcnRfcmF0aW8odHYyLCB0djYpXG4gICAgeSA9IEZwLm11bCh0djEsIHUpOyAvLyAxOS4gICB5ID0gdHYxICogdSAgLT4gWiAqIHVeMyAqIHkxXG4gICAgeSA9IEZwLm11bCh5LCB2YWx1ZSk7IC8vIDIwLiAgIHkgPSB5ICogeTFcbiAgICB4ID0gRnAuY21vdih4LCB0djMsIGlzVmFsaWQpOyAvLyAyMS4gICB4ID0gQ01PVih4LCB0djMsIGlzX2d4MV9zcXVhcmUpXG4gICAgeSA9IEZwLmNtb3YoeSwgdmFsdWUsIGlzVmFsaWQpOyAvLyAyMi4gICB5ID0gQ01PVih5LCB5MSwgaXNfZ3gxX3NxdWFyZSlcbiAgICBjb25zdCBlMSA9IEZwLmlzT2RkISh1KSA9PT0gRnAuaXNPZGQhKHkpOyAvLyAyMy4gIGUxID0gc2duMCh1KSA9PSBzZ24wKHkpXG4gICAgeSA9IEZwLmNtb3YoRnAubmVnKHkpLCB5LCBlMSk7IC8vIDI0LiAgIHkgPSBDTU9WKC15LCB5LCBlMSlcbiAgICBjb25zdCB0djRfaW52ID0gRnBJbnZlcnRCYXRjaChGcCwgW3R2NF0sIHRydWUpWzBdO1xuICAgIHggPSBGcC5tdWwoeCwgdHY0X2ludik7IC8vIDI1LiAgIHggPSB4IC8gdHY0XG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRXTGVuZ3RoczxUPihGcDogSUZpZWxkPFQ+LCBGbjogSUZpZWxkPGJpZ2ludD4pIHtcbiAgcmV0dXJuIHtcbiAgICBzZWNyZXRLZXk6IEZuLkJZVEVTLFxuICAgIHB1YmxpY0tleTogMSArIEZwLkJZVEVTLFxuICAgIHB1YmxpY0tleVVuY29tcHJlc3NlZDogMSArIDIgKiBGcC5CWVRFUyxcbiAgICBwdWJsaWNLZXlIYXNQcmVmaXg6IHRydWUsXG4gICAgc2lnbmF0dXJlOiAyICogRm4uQllURVMsXG4gIH07XG59XG5cbi8qKlxuICogU29tZXRpbWVzIHVzZXJzIG9ubHkgbmVlZCBnZXRQdWJsaWNLZXksIGdldFNoYXJlZFNlY3JldCwgYW5kIHNlY3JldCBrZXkgaGFuZGxpbmcuXG4gKiBUaGlzIGhlbHBlciBlbnN1cmVzIG5vIHNpZ25hdHVyZSBmdW5jdGlvbmFsaXR5IGlzIHByZXNlbnQuIExlc3MgY29kZSwgc21hbGxlciBidW5kbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVjZGgoXG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+LFxuICBlY2RoT3B0czogeyByYW5kb21CeXRlcz86IChieXRlc0xlbmd0aD86IG51bWJlcikgPT4gVWludDhBcnJheSB9ID0ge31cbik6IEVDREgge1xuICBjb25zdCB7IEZuIH0gPSBQb2ludDtcbiAgY29uc3QgcmFuZG9tQnl0ZXNfID0gZWNkaE9wdHMucmFuZG9tQnl0ZXMgfHwgd2NSYW5kb21CeXRlcztcbiAgY29uc3QgbGVuZ3RocyA9IE9iamVjdC5hc3NpZ24oZ2V0V0xlbmd0aHMoUG9pbnQuRnAsIEZuKSwgeyBzZWVkOiBnZXRNaW5IYXNoTGVuZ3RoKEZuLk9SREVSKSB9KTtcblxuICBmdW5jdGlvbiBpc1ZhbGlkU2VjcmV0S2V5KHNlY3JldEtleTogVWludDhBcnJheSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBudW0gPSBGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5KTtcbiAgICAgIHJldHVybiBGbi5pc1ZhbGlkTm90MChudW0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNWYWxpZFB1YmxpY0tleShwdWJsaWNLZXk6IFVpbnQ4QXJyYXksIGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHB1YmxpY0tleTogY29tcCwgcHVibGljS2V5VW5jb21wcmVzc2VkIH0gPSBsZW5ndGhzO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBsID0gcHVibGljS2V5Lmxlbmd0aDtcbiAgICAgIGlmIChpc0NvbXByZXNzZWQgPT09IHRydWUgJiYgbCAhPT0gY29tcCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKGlzQ29tcHJlc3NlZCA9PT0gZmFsc2UgJiYgbCAhPT0gcHVibGljS2V5VW5jb21wcmVzc2VkKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gISFQb2ludC5mcm9tQnl0ZXMocHVibGljS2V5KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgc2VjcmV0IGtleSBmcm9tIHJhbmRvbSBvZiBzaXplXG4gICAqIChncm91cExlbiArIGNlaWwoZ3JvdXBMZW4gLyAyKSkgd2l0aCBtb2R1bG8gYmlhcyBiZWluZyBuZWdsaWdpYmxlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmFuZG9tU2VjcmV0S2V5KHNlZWQgPSByYW5kb21CeXRlc18obGVuZ3Rocy5zZWVkKSk6IFVpbnQ4QXJyYXkge1xuICAgIHJldHVybiBtYXBIYXNoVG9GaWVsZChhYnl0ZXMoc2VlZCwgbGVuZ3Rocy5zZWVkLCAnc2VlZCcpLCBGbi5PUkRFUik7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgcHVibGljIGtleSBmb3IgYSBzZWNyZXQga2V5LiBDaGVja3MgZm9yIHZhbGlkaXR5IG9mIHRoZSBzZWNyZXQga2V5LlxuICAgKiBAcGFyYW0gaXNDb21wcmVzc2VkIHdoZXRoZXIgdG8gcmV0dXJuIGNvbXBhY3QgKGRlZmF1bHQpLCBvciBmdWxsIGtleVxuICAgKiBAcmV0dXJucyBQdWJsaWMga2V5LCBmdWxsIHdoZW4gaXNDb21wcmVzc2VkPWZhbHNlOyBzaG9ydCB3aGVuIGlzQ29tcHJlc3NlZD10cnVlXG4gICAqL1xuICBmdW5jdGlvbiBnZXRQdWJsaWNLZXkoc2VjcmV0S2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQgPSB0cnVlKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIFBvaW50LkJBU0UubXVsdGlwbHkoRm4uZnJvbUJ5dGVzKHNlY3JldEtleSkpLnRvQnl0ZXMoaXNDb21wcmVzc2VkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWljayBhbmQgZGlydHkgY2hlY2sgZm9yIGl0ZW0gYmVpbmcgcHVibGljIGtleS4gRG9lcyBub3QgdmFsaWRhdGUgaGV4LCBvciBiZWluZyBvbi1jdXJ2ZS5cbiAgICovXG4gIGZ1bmN0aW9uIGlzUHJvYlB1YihpdGVtOiBVaW50OEFycmF5KTogYm9vbGVhbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBzZWNyZXRLZXksIHB1YmxpY0tleSwgcHVibGljS2V5VW5jb21wcmVzc2VkIH0gPSBsZW5ndGhzO1xuICAgIGlmICghaXNCeXRlcyhpdGVtKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBpZiAoKCdfbGVuZ3RocycgaW4gRm4gJiYgRm4uX2xlbmd0aHMpIHx8IHNlY3JldEtleSA9PT0gcHVibGljS2V5KSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGNvbnN0IGwgPSBhYnl0ZXMoaXRlbSwgdW5kZWZpbmVkLCAna2V5JykubGVuZ3RoO1xuICAgIHJldHVybiBsID09PSBwdWJsaWNLZXkgfHwgbCA9PT0gcHVibGljS2V5VW5jb21wcmVzc2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIEVDREggKEVsbGlwdGljIEN1cnZlIERpZmZpZSBIZWxsbWFuKS5cbiAgICogQ29tcHV0ZXMgc2hhcmVkIHB1YmxpYyBrZXkgZnJvbSBzZWNyZXQga2V5IEEgYW5kIHB1YmxpYyBrZXkgQi5cbiAgICogQ2hlY2tzOiAxKSBzZWNyZXQga2V5IHZhbGlkaXR5IDIpIHNoYXJlZCBrZXkgaXMgb24tY3VydmUuXG4gICAqIERvZXMgTk9UIGhhc2ggdGhlIHJlc3VsdC5cbiAgICogQHBhcmFtIGlzQ29tcHJlc3NlZCB3aGV0aGVyIHRvIHJldHVybiBjb21wYWN0IChkZWZhdWx0KSwgb3IgZnVsbCBrZXlcbiAgICogQHJldHVybnMgc2hhcmVkIHB1YmxpYyBrZXlcbiAgICovXG4gIGZ1bmN0aW9uIGdldFNoYXJlZFNlY3JldChcbiAgICBzZWNyZXRLZXlBOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleUI6IFVpbnQ4QXJyYXksXG4gICAgaXNDb21wcmVzc2VkID0gdHJ1ZVxuICApOiBVaW50OEFycmF5IHtcbiAgICBpZiAoaXNQcm9iUHViKHNlY3JldEtleUEpID09PSB0cnVlKSB0aHJvdyBuZXcgRXJyb3IoJ2ZpcnN0IGFyZyBtdXN0IGJlIHByaXZhdGUga2V5Jyk7XG4gICAgaWYgKGlzUHJvYlB1YihwdWJsaWNLZXlCKSA9PT0gZmFsc2UpIHRocm93IG5ldyBFcnJvcignc2Vjb25kIGFyZyBtdXN0IGJlIHB1YmxpYyBrZXknKTtcbiAgICBjb25zdCBzID0gRm4uZnJvbUJ5dGVzKHNlY3JldEtleUEpO1xuICAgIGNvbnN0IGIgPSBQb2ludC5mcm9tQnl0ZXMocHVibGljS2V5Qik7IC8vIGNoZWNrcyBmb3IgYmVpbmcgb24tY3VydmVcbiAgICByZXR1cm4gYi5tdWx0aXBseShzKS50b0J5dGVzKGlzQ29tcHJlc3NlZCk7XG4gIH1cblxuICBjb25zdCB1dGlscyA9IHtcbiAgICBpc1ZhbGlkU2VjcmV0S2V5LFxuICAgIGlzVmFsaWRQdWJsaWNLZXksXG4gICAgcmFuZG9tU2VjcmV0S2V5LFxuICB9O1xuICBjb25zdCBrZXlnZW4gPSBjcmVhdGVLZXlnZW4ocmFuZG9tU2VjcmV0S2V5LCBnZXRQdWJsaWNLZXkpO1xuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHsgZ2V0UHVibGljS2V5LCBnZXRTaGFyZWRTZWNyZXQsIGtleWdlbiwgUG9pbnQsIHV0aWxzLCBsZW5ndGhzIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgRUNEU0Egc2lnbmluZyBpbnRlcmZhY2UgZm9yIGdpdmVuIGVsbGlwdGljIGN1cnZlIGBQb2ludGAgYW5kIGBoYXNoYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gUG9pbnQgY3JlYXRlZCB1c2luZyB7QGxpbmsgd2VpZXJzdHJhc3N9IGZ1bmN0aW9uXG4gKiBAcGFyYW0gaGFzaCB1c2VkIGZvciAxKSBtZXNzYWdlIHByZWhhc2gtaW5nIDIpIGsgZ2VuZXJhdGlvbiBpbiBgc2lnbmAsIHVzaW5nIGhtYWNfZHJiZyhoYXNoKVxuICogQHBhcmFtIGVjZHNhT3B0cyByYXJlbHkgbmVlZGVkLCBzZWUge0BsaW5rIEVDRFNBT3B0c31cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGNvbnN0IHAyNTZfUG9pbnQgPSB3ZWllcnN0cmFzcyguLi4pO1xuICogY29uc3QgcDI1Nl9zaGEyNTYgPSBlY2RzYShwMjU2X1BvaW50LCBzaGEyNTYpO1xuICogY29uc3QgcDI1Nl9zaGEyMjQgPSBlY2RzYShwMjU2X1BvaW50LCBzaGEyMjQpO1xuICogY29uc3QgcDI1Nl9zaGEyMjRfciA9IGVjZHNhKHAyNTZfUG9pbnQsIHNoYTIyNCwgeyByYW5kb21CeXRlczogKGxlbmd0aCkgPT4geyAuLi4gfSB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZWNkc2EoXG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+LFxuICBoYXNoOiBDSGFzaCxcbiAgZWNkc2FPcHRzOiBFQ0RTQU9wdHMgPSB7fVxuKTogRUNEU0Ege1xuICBhaGFzaChoYXNoKTtcbiAgdmFsaWRhdGVPYmplY3QoXG4gICAgZWNkc2FPcHRzLFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGhtYWM6ICdmdW5jdGlvbicsXG4gICAgICBsb3dTOiAnYm9vbGVhbicsXG4gICAgICByYW5kb21CeXRlczogJ2Z1bmN0aW9uJyxcbiAgICAgIGJpdHMyaW50OiAnZnVuY3Rpb24nLFxuICAgICAgYml0czJpbnRfbW9kTjogJ2Z1bmN0aW9uJyxcbiAgICB9XG4gICk7XG4gIGVjZHNhT3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGVjZHNhT3B0cyk7XG4gIGNvbnN0IHJhbmRvbUJ5dGVzID0gZWNkc2FPcHRzLnJhbmRvbUJ5dGVzIHx8IHdjUmFuZG9tQnl0ZXM7XG4gIGNvbnN0IGhtYWMgPSBlY2RzYU9wdHMuaG1hYyB8fCAoKGtleSwgbXNnKSA9PiBub2JsZUhtYWMoaGFzaCwga2V5LCBtc2cpKTtcblxuICBjb25zdCB7IEZwLCBGbiB9ID0gUG9pbnQ7XG4gIGNvbnN0IHsgT1JERVI6IENVUlZFX09SREVSLCBCSVRTOiBmbkJpdHMgfSA9IEZuO1xuICBjb25zdCB7IGtleWdlbiwgZ2V0UHVibGljS2V5LCBnZXRTaGFyZWRTZWNyZXQsIHV0aWxzLCBsZW5ndGhzIH0gPSBlY2RoKFBvaW50LCBlY2RzYU9wdHMpO1xuICBjb25zdCBkZWZhdWx0U2lnT3B0czogUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz4gPSB7XG4gICAgcHJlaGFzaDogdHJ1ZSxcbiAgICBsb3dTOiB0eXBlb2YgZWNkc2FPcHRzLmxvd1MgPT09ICdib29sZWFuJyA/IGVjZHNhT3B0cy5sb3dTIDogdHJ1ZSxcbiAgICBmb3JtYXQ6ICdjb21wYWN0JyBhcyBFQ0RTQVNpZ25hdHVyZUZvcm1hdCxcbiAgICBleHRyYUVudHJvcHk6IGZhbHNlLFxuICB9O1xuICBjb25zdCBoYXNMYXJnZUNvZmFjdG9yID0gQ1VSVkVfT1JERVIgKiBfMm4gPCBGcC5PUkRFUjsgLy8gV29uJ3QgQ1VSVkUoKS5oID4gMm4gYmUgbW9yZSBlZmZlY3RpdmU/XG5cbiAgZnVuY3Rpb24gaXNCaWdnZXJUaGFuSGFsZk9yZGVyKG51bWJlcjogYmlnaW50KSB7XG4gICAgY29uc3QgSEFMRiA9IENVUlZFX09SREVSID4+IF8xbjtcbiAgICByZXR1cm4gbnVtYmVyID4gSEFMRjtcbiAgfVxuICBmdW5jdGlvbiB2YWxpZGF0ZVJTKHRpdGxlOiBzdHJpbmcsIG51bTogYmlnaW50KTogYmlnaW50IHtcbiAgICBpZiAoIUZuLmlzVmFsaWROb3QwKG51bSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgc2lnbmF0dXJlICR7dGl0bGV9OiBvdXQgb2YgcmFuZ2UgMS4uUG9pbnQuRm4uT1JERVJgKTtcbiAgICByZXR1cm4gbnVtO1xuICB9XG4gIGZ1bmN0aW9uIGFzc2VydFNtYWxsQ29mYWN0b3IoKTogdm9pZCB7XG4gICAgLy8gRUNEU0EgcmVjb3ZlcnkgaXMgaGFyZCBmb3IgY29mYWN0b3IgPiAxIGN1cnZlcy5cbiAgICAvLyBJbiBzaWduLCBgciA9IHEueCBtb2QgbmAsIGFuZCBoZXJlIHdlIHJlY292ZXIgcS54IGZyb20gci5cbiAgICAvLyBXaGlsZSByZWNvdmVyaW5nIHEueCA+PSBuLCB3ZSBuZWVkIHRvIGFkZCByK24gZm9yIGNvZmFjdG9yPTEgY3VydmVzLlxuICAgIC8vIEhvd2V2ZXIsIGZvciBjb2ZhY3Rvcj4xLCByK24gbWF5IG5vdCBnZXQgcS54OlxuICAgIC8vIHIrbippIHdvdWxkIG5lZWQgdG8gYmUgZG9uZSBpbnN0ZWFkIHdoZXJlIGkgaXMgdW5rbm93bi5cbiAgICAvLyBUbyBlYXNpbHkgZ2V0IGksIHdlIGVpdGhlciBuZWVkIHRvOlxuICAgIC8vIGEuIGluY3JlYXNlIGFtb3VudCBvZiB2YWxpZCByZWNpZCB2YWx1ZXMgKDQsIDUuLi4pOyBPUlxuICAgIC8vIGIuIHByb2hpYml0IG5vbi1wcmltZS1vcmRlciBzaWduYXR1cmVzIChyZWNpZCA+IDEpLlxuICAgIGlmIChoYXNMYXJnZUNvZmFjdG9yKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcInJlY292ZXJlZFwiIHNpZyB0eXBlIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGNvZmFjdG9yID4yIGN1cnZlcycpO1xuICB9XG4gIGZ1bmN0aW9uIHZhbGlkYXRlU2lnTGVuZ3RoKGJ5dGVzOiBVaW50OEFycmF5LCBmb3JtYXQ6IEVDRFNBU2lnbmF0dXJlRm9ybWF0KSB7XG4gICAgdmFsaWRhdGVTaWdGb3JtYXQoZm9ybWF0KTtcbiAgICBjb25zdCBzaXplID0gbGVuZ3Rocy5zaWduYXR1cmUhO1xuICAgIGNvbnN0IHNpemVyID0gZm9ybWF0ID09PSAnY29tcGFjdCcgPyBzaXplIDogZm9ybWF0ID09PSAncmVjb3ZlcmVkJyA/IHNpemUgKyAxIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiBhYnl0ZXMoYnl0ZXMsIHNpemVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFQ0RTQSBzaWduYXR1cmUgd2l0aCBpdHMgKHIsIHMpIHByb3BlcnRpZXMuIFN1cHBvcnRzIGNvbXBhY3QsIHJlY292ZXJlZCAmIERFUiByZXByZXNlbnRhdGlvbnMuXG4gICAqL1xuICBjbGFzcyBTaWduYXR1cmUgaW1wbGVtZW50cyBFQ0RTQVNpZ25hdHVyZSB7XG4gICAgcmVhZG9ubHkgcjogYmlnaW50O1xuICAgIHJlYWRvbmx5IHM6IGJpZ2ludDtcbiAgICByZWFkb25seSByZWNvdmVyeT86IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKHI6IGJpZ2ludCwgczogYmlnaW50LCByZWNvdmVyeT86IG51bWJlcikge1xuICAgICAgdGhpcy5yID0gdmFsaWRhdGVSUygncicsIHIpOyAvLyByIGluIFsxLi5OLTFdO1xuICAgICAgdGhpcy5zID0gdmFsaWRhdGVSUygncycsIHMpOyAvLyBzIGluIFsxLi5OLTFdO1xuICAgICAgaWYgKHJlY292ZXJ5ICE9IG51bGwpIHtcbiAgICAgICAgYXNzZXJ0U21hbGxDb2ZhY3RvcigpO1xuICAgICAgICBpZiAoIVswLCAxLCAyLCAzXS5pbmNsdWRlcyhyZWNvdmVyeSkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeSBpZCcpO1xuICAgICAgICB0aGlzLnJlY292ZXJ5ID0gcmVjb3Zlcnk7XG4gICAgICB9XG4gICAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmcm9tQnl0ZXMoXG4gICAgICBieXRlczogVWludDhBcnJheSxcbiAgICAgIGZvcm1hdDogRUNEU0FTaWduYXR1cmVGb3JtYXQgPSBkZWZhdWx0U2lnT3B0cy5mb3JtYXRcbiAgICApOiBTaWduYXR1cmUge1xuICAgICAgdmFsaWRhdGVTaWdMZW5ndGgoYnl0ZXMsIGZvcm1hdCk7XG4gICAgICBsZXQgcmVjaWQ6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChmb3JtYXQgPT09ICdkZXInKSB7XG4gICAgICAgIGNvbnN0IHsgciwgcyB9ID0gREVSLnRvU2lnKGFieXRlcyhieXRlcykpO1xuICAgICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZShyLCBzKTtcbiAgICAgIH1cbiAgICAgIGlmIChmb3JtYXQgPT09ICdyZWNvdmVyZWQnKSB7XG4gICAgICAgIHJlY2lkID0gYnl0ZXNbMF07XG4gICAgICAgIGZvcm1hdCA9ICdjb21wYWN0JztcbiAgICAgICAgYnl0ZXMgPSBieXRlcy5zdWJhcnJheSgxKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IEwgPSBsZW5ndGhzLnNpZ25hdHVyZSEgLyAyO1xuICAgICAgY29uc3QgciA9IGJ5dGVzLnN1YmFycmF5KDAsIEwpO1xuICAgICAgY29uc3QgcyA9IGJ5dGVzLnN1YmFycmF5KEwsIEwgKiAyKTtcbiAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKEZuLmZyb21CeXRlcyhyKSwgRm4uZnJvbUJ5dGVzKHMpLCByZWNpZCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21IZXgoaGV4OiBzdHJpbmcsIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0KSB7XG4gICAgICByZXR1cm4gdGhpcy5mcm9tQnl0ZXMoaGV4VG9CeXRlcyhoZXgpLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXNzZXJ0UmVjb3ZlcnkoKTogbnVtYmVyIHtcbiAgICAgIGNvbnN0IHsgcmVjb3ZlcnkgfSA9IHRoaXM7XG4gICAgICBpZiAocmVjb3ZlcnkgPT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5IGlkOiBtdXN0IGJlIHByZXNlbnQnKTtcbiAgICAgIHJldHVybiByZWNvdmVyeTtcbiAgICB9XG5cbiAgICBhZGRSZWNvdmVyeUJpdChyZWNvdmVyeTogbnVtYmVyKTogUmVjb3ZlcmVkU2lnbmF0dXJlIHtcbiAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKHRoaXMuciwgdGhpcy5zLCByZWNvdmVyeSkgYXMgUmVjb3ZlcmVkU2lnbmF0dXJlO1xuICAgIH1cblxuICAgIHJlY292ZXJQdWJsaWNLZXkobWVzc2FnZUhhc2g6IFVpbnQ4QXJyYXkpOiBXZWllcnN0cmFzc1BvaW50PGJpZ2ludD4ge1xuICAgICAgY29uc3QgeyByLCBzIH0gPSB0aGlzO1xuICAgICAgY29uc3QgcmVjb3ZlcnkgPSB0aGlzLmFzc2VydFJlY292ZXJ5KCk7XG4gICAgICBjb25zdCByYWRqID0gcmVjb3ZlcnkgPT09IDIgfHwgcmVjb3ZlcnkgPT09IDMgPyByICsgQ1VSVkVfT1JERVIgOiByO1xuICAgICAgaWYgKCFGcC5pc1ZhbGlkKHJhZGopKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3ZlcnkgaWQ6IHNpZy5yK2N1cnZlLm4gIT0gUi54Jyk7XG4gICAgICBjb25zdCB4ID0gRnAudG9CeXRlcyhyYWRqKTtcbiAgICAgIGNvbnN0IFIgPSBQb2ludC5mcm9tQnl0ZXMoY29uY2F0Qnl0ZXMocHByZWZpeCgocmVjb3ZlcnkgJiAxKSA9PT0gMCksIHgpKTtcbiAgICAgIGNvbnN0IGlyID0gRm4uaW52KHJhZGopOyAvLyByXi0xXG4gICAgICBjb25zdCBoID0gYml0czJpbnRfbW9kTihhYnl0ZXMobWVzc2FnZUhhc2gsIHVuZGVmaW5lZCwgJ21zZ0hhc2gnKSk7IC8vIFRydW5jYXRlIGhhc2hcbiAgICAgIGNvbnN0IHUxID0gRm4uY3JlYXRlKC1oICogaXIpOyAvLyAtaHJeLTFcbiAgICAgIGNvbnN0IHUyID0gRm4uY3JlYXRlKHMgKiBpcik7IC8vIHNyXi0xXG4gICAgICAvLyAoc3JeLTEpUi0oaHJeLTEpRyA9IC0oaHJeLTEpRyArIChzcl4tMSkuIHVuc2FmZSBpcyBmaW5lOiB0aGVyZSBpcyBubyBwcml2YXRlIGRhdGEuXG4gICAgICBjb25zdCBRID0gUG9pbnQuQkFTRS5tdWx0aXBseVVuc2FmZSh1MSkuYWRkKFIubXVsdGlwbHlVbnNhZmUodTIpKTtcbiAgICAgIGlmIChRLmlzMCgpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3Zlcnk6IHBvaW50IGF0IGluZmluaWZ5Jyk7XG4gICAgICBRLmFzc2VydFZhbGlkaXR5KCk7XG4gICAgICByZXR1cm4gUTtcbiAgICB9XG5cbiAgICAvLyBTaWduYXR1cmVzIHNob3VsZCBiZSBsb3ctcywgdG8gcHJldmVudCBtYWxsZWFiaWxpdHkuXG4gICAgaGFzSGlnaFMoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gaXNCaWdnZXJUaGFuSGFsZk9yZGVyKHRoaXMucyk7XG4gICAgfVxuXG4gICAgdG9CeXRlcyhmb3JtYXQ6IEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gZGVmYXVsdFNpZ09wdHMuZm9ybWF0KSB7XG4gICAgICB2YWxpZGF0ZVNpZ0Zvcm1hdChmb3JtYXQpO1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ2RlcicpIHJldHVybiBoZXhUb0J5dGVzKERFUi5oZXhGcm9tU2lnKHRoaXMpKTtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHJiID0gRm4udG9CeXRlcyhyKTtcbiAgICAgIGNvbnN0IHNiID0gRm4udG9CeXRlcyhzKTtcbiAgICAgIGlmIChmb3JtYXQgPT09ICdyZWNvdmVyZWQnKSB7XG4gICAgICAgIGFzc2VydFNtYWxsQ29mYWN0b3IoKTtcbiAgICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKFVpbnQ4QXJyYXkub2YodGhpcy5hc3NlcnRSZWNvdmVyeSgpKSwgcmIsIHNiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb25jYXRCeXRlcyhyYiwgc2IpO1xuICAgIH1cblxuICAgIHRvSGV4KGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0KSB7XG4gICAgICByZXR1cm4gYnl0ZXNUb0hleCh0aGlzLnRvQnl0ZXMoZm9ybWF0KSk7XG4gICAgfVxuICB9XG4gIHR5cGUgUmVjb3ZlcmVkU2lnbmF0dXJlID0gU2lnbmF0dXJlICYgeyByZWNvdmVyeTogbnVtYmVyIH07XG5cbiAgLy8gUkZDNjk3OTogZW5zdXJlIEVDRFNBIG1zZyBpcyBYIGJ5dGVzIGFuZCA8IE4uIFJGQyBzdWdnZXN0cyBvcHRpb25hbCB0cnVuY2F0aW5nIHZpYSBiaXRzMm9jdGV0cy5cbiAgLy8gRklQUyAxODYtNCA0LjYgc3VnZ2VzdHMgdGhlIGxlZnRtb3N0IG1pbihuQml0TGVuLCBvdXRMZW4pIGJpdHMsIHdoaWNoIG1hdGNoZXMgYml0czJpbnQuXG4gIC8vIGJpdHMyaW50IGNhbiBwcm9kdWNlIHJlcz5OLCB3ZSBjYW4gZG8gbW9kKHJlcywgTikgc2luY2UgdGhlIGJpdExlbiBpcyB0aGUgc2FtZS5cbiAgLy8gaW50Mm9jdGV0cyBjYW4ndCBiZSB1c2VkOyBwYWRzIHNtYWxsIG1zZ3Mgd2l0aCAwOiB1bmFjY2VwdGF0YmxlIGZvciB0cnVuYyBhcyBwZXIgUkZDIHZlY3RvcnNcbiAgY29uc3QgYml0czJpbnQgPVxuICAgIGVjZHNhT3B0cy5iaXRzMmludCB8fFxuICAgIGZ1bmN0aW9uIGJpdHMyaW50X2RlZihieXRlczogVWludDhBcnJheSk6IGJpZ2ludCB7XG4gICAgICAvLyBPdXIgY3VzdG9tIGNoZWNrIFwianVzdCBpbiBjYXNlXCIsIGZvciBwcm90ZWN0aW9uIGFnYWluc3QgRG9TXG4gICAgICBpZiAoYnl0ZXMubGVuZ3RoID4gODE5MikgdGhyb3cgbmV3IEVycm9yKCdpbnB1dCBpcyB0b28gbGFyZ2UnKTtcbiAgICAgIC8vIEZvciBjdXJ2ZXMgd2l0aCBuQml0TGVuZ3RoICUgOCAhPT0gMDogYml0czJvY3RldHMoYml0czJvY3RldHMobSkpICE9PSBiaXRzMm9jdGV0cyhtKVxuICAgICAgLy8gZm9yIHNvbWUgY2FzZXMsIHNpbmNlIGJ5dGVzLmxlbmd0aCAqIDggaXMgbm90IGFjdHVhbCBiaXRMZW5ndGguXG4gICAgICBjb25zdCBudW0gPSBieXRlc1RvTnVtYmVyQkUoYnl0ZXMpOyAvLyBjaGVjayBmb3IgPT0gdTggZG9uZSBoZXJlXG4gICAgICBjb25zdCBkZWx0YSA9IGJ5dGVzLmxlbmd0aCAqIDggLSBmbkJpdHM7IC8vIHRydW5jYXRlIHRvIG5CaXRMZW5ndGggbGVmdG1vc3QgYml0c1xuICAgICAgcmV0dXJuIGRlbHRhID4gMCA/IG51bSA+PiBCaWdJbnQoZGVsdGEpIDogbnVtO1xuICAgIH07XG4gIGNvbnN0IGJpdHMyaW50X21vZE4gPVxuICAgIGVjZHNhT3B0cy5iaXRzMmludF9tb2ROIHx8XG4gICAgZnVuY3Rpb24gYml0czJpbnRfbW9kTl9kZWYoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgcmV0dXJuIEZuLmNyZWF0ZShiaXRzMmludChieXRlcykpOyAvLyBjYW4ndCB1c2UgYnl0ZXNUb051bWJlckJFIGhlcmVcbiAgICB9O1xuICAvLyBQYWRzIG91dHB1dCB3aXRoIHplcm8gYXMgcGVyIHNwZWNcbiAgY29uc3QgT1JERVJfTUFTSyA9IGJpdE1hc2soZm5CaXRzKTtcbiAgLyoqIENvbnZlcnRzIHRvIGJ5dGVzLiBDaGVja3MgaWYgbnVtIGluIGBbMC4uT1JERVJfTUFTSy0xXWAgZS5nLjogYFswLi4yXjI1Ni0xXWAuICovXG4gIGZ1bmN0aW9uIGludDJvY3RldHMobnVtOiBiaWdpbnQpOiBVaW50OEFycmF5IHtcbiAgICAvLyBJTVBPUlRBTlQ6IHRoZSBjaGVjayBlbnN1cmVzIHdvcmtpbmcgZm9yIGNhc2UgYEZuLkJZVEVTICE9IEZuLkJJVFMgKiA4YFxuICAgIGFJblJhbmdlKCdudW0gPCAyXicgKyBmbkJpdHMsIG51bSwgXzBuLCBPUkRFUl9NQVNLKTtcbiAgICByZXR1cm4gRm4udG9CeXRlcyhudW0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHByZWhhc2g6IGJvb2xlYW4pIHtcbiAgICBhYnl0ZXMobWVzc2FnZSwgdW5kZWZpbmVkLCAnbWVzc2FnZScpO1xuICAgIHJldHVybiBwcmVoYXNoID8gYWJ5dGVzKGhhc2gobWVzc2FnZSksIHVuZGVmaW5lZCwgJ3ByZWhhc2hlZCBtZXNzYWdlJykgOiBtZXNzYWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZXBzIEEsIEQgb2YgUkZDNjk3OSAzLjIuXG4gICAqIENyZWF0ZXMgUkZDNjk3OSBzZWVkOyBjb252ZXJ0cyBtc2cvcHJpdktleSB0byBudW1iZXJzLlxuICAgKiBVc2VkIG9ubHkgaW4gc2lnbiwgbm90IGluIHZlcmlmeS5cbiAgICpcbiAgICogV2FybmluZzogd2UgY2Fubm90IGFzc3VtZSBoZXJlIHRoYXQgbWVzc2FnZSBoYXMgc2FtZSBhbW91bnQgb2YgYnl0ZXMgYXMgY3VydmUgb3JkZXIsXG4gICAqIHRoaXMgd2lsbCBiZSBpbnZhbGlkIGF0IGxlYXN0IGZvciBQNTIxLiBBbHNvIGl0IGNhbiBiZSBiaWdnZXIgZm9yIFAyMjQgKyBTSEEyNTYuXG4gICAqL1xuICBmdW5jdGlvbiBwcmVwU2lnKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHNlY3JldEtleTogVWludDhBcnJheSwgb3B0czogRUNEU0FTaWduT3B0cykge1xuICAgIGNvbnN0IHsgbG93UywgcHJlaGFzaCwgZXh0cmFFbnRyb3B5IH0gPSB2YWxpZGF0ZVNpZ09wdHMob3B0cywgZGVmYXVsdFNpZ09wdHMpO1xuICAgIG1lc3NhZ2UgPSB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZSwgcHJlaGFzaCk7IC8vIFJGQzY5NzkgMy4yIEE6IGgxID0gSChtKVxuICAgIC8vIFdlIGNhbid0IGxhdGVyIGNhbGwgYml0czJvY3RldHMsIHNpbmNlIG5lc3RlZCBiaXRzMmludCBpcyBicm9rZW4gZm9yIGN1cnZlc1xuICAgIC8vIHdpdGggZm5CaXRzICUgOCAhPT0gMC4gQmVjYXVzZSBvZiB0aGF0LCB3ZSB1bndyYXAgaXQgaGVyZSBhcyBpbnQyb2N0ZXRzIGNhbGwuXG4gICAgLy8gY29uc3QgYml0czJvY3RldHMgPSAoYml0cykgPT4gaW50Mm9jdGV0cyhiaXRzMmludF9tb2ROKGJpdHMpKVxuICAgIGNvbnN0IGgxaW50ID0gYml0czJpbnRfbW9kTihtZXNzYWdlKTtcbiAgICBjb25zdCBkID0gRm4uZnJvbUJ5dGVzKHNlY3JldEtleSk7IC8vIHZhbGlkYXRlIHNlY3JldCBrZXksIGNvbnZlcnQgdG8gYmlnaW50XG4gICAgaWYgKCFGbi5pc1ZhbGlkTm90MChkKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHByaXZhdGUga2V5Jyk7XG4gICAgY29uc3Qgc2VlZEFyZ3MgPSBbaW50Mm9jdGV0cyhkKSwgaW50Mm9jdGV0cyhoMWludCldO1xuICAgIC8vIGV4dHJhRW50cm9weS4gUkZDNjk3OSAzLjY6IGFkZGl0aW9uYWwgaycgKG9wdGlvbmFsKS5cbiAgICBpZiAoZXh0cmFFbnRyb3B5ICE9IG51bGwgJiYgZXh0cmFFbnRyb3B5ICE9PSBmYWxzZSkge1xuICAgICAgLy8gSyA9IEhNQUNfSyhWIHx8IDB4MDAgfHwgaW50Mm9jdGV0cyh4KSB8fCBiaXRzMm9jdGV0cyhoMSkgfHwgaycpXG4gICAgICAvLyBnZW4gcmFuZG9tIGJ5dGVzIE9SIHBhc3MgYXMtaXNcbiAgICAgIGNvbnN0IGUgPSBleHRyYUVudHJvcHkgPT09IHRydWUgPyByYW5kb21CeXRlcyhsZW5ndGhzLnNlY3JldEtleSkgOiBleHRyYUVudHJvcHk7XG4gICAgICBzZWVkQXJncy5wdXNoKGFieXRlcyhlLCB1bmRlZmluZWQsICdleHRyYUVudHJvcHknKSk7IC8vIGNoZWNrIGZvciBiZWluZyBieXRlc1xuICAgIH1cbiAgICBjb25zdCBzZWVkID0gY29uY2F0Qnl0ZXMoLi4uc2VlZEFyZ3MpOyAvLyBTdGVwIEQgb2YgUkZDNjk3OSAzLjJcbiAgICBjb25zdCBtID0gaDFpbnQ7IC8vIG5vIG5lZWQgdG8gY2FsbCBiaXRzMmludCBzZWNvbmQgdGltZSBoZXJlLCBpdCBpcyBpbnNpZGUgdHJ1bmNhdGVIYXNoIVxuICAgIC8vIENvbnZlcnRzIHNpZ25hdHVyZSBwYXJhbXMgaW50byBwb2ludCB3IHIvcywgY2hlY2tzIHJlc3VsdCBmb3IgdmFsaWRpdHkuXG4gICAgLy8gVG8gdHJhbnNmb3JtIGsgPT4gU2lnbmF0dXJlOlxuICAgIC8vIHEgPSBrXHUyMkM1R1xuICAgIC8vIHIgPSBxLnggbW9kIG5cbiAgICAvLyBzID0ga14tMShtICsgcmQpIG1vZCBuXG4gICAgLy8gQ2FuIHVzZSBzY2FsYXIgYmxpbmRpbmcgYl4tMShibSArIGJkcikgd2hlcmUgYiBcdTIyMDggWzEscVx1MjIxMjFdIGFjY29yZGluZyB0b1xuICAgIC8vIGh0dHBzOi8vdGNoZXMuaWFjci5vcmcvaW5kZXgucGhwL1RDSEVTL2FydGljbGUvdmlldy83MzM3LzY1MDkuIFdlJ3ZlIGRlY2lkZWQgYWdhaW5zdCBpdDpcbiAgICAvLyBhKSBkZXBlbmRlbmN5IG9uIENTUFJORyBiKSAxNSUgc2xvd2Rvd24gYykgZG9lc24ndCByZWFsbHkgaGVscCBzaW5jZSBiaWdpbnRzIGFyZSBub3QgQ1RcbiAgICBmdW5jdGlvbiBrMnNpZyhrQnl0ZXM6IFVpbnQ4QXJyYXkpOiBTaWduYXR1cmUgfCB1bmRlZmluZWQge1xuICAgICAgLy8gUkZDIDY5NzkgU2VjdGlvbiAzLjIsIHN0ZXAgMzogayA9IGJpdHMyaW50KFQpXG4gICAgICAvLyBJbXBvcnRhbnQ6IGFsbCBtb2QoKSBjYWxscyBoZXJlIG11c3QgYmUgZG9uZSBvdmVyIE5cbiAgICAgIGNvbnN0IGsgPSBiaXRzMmludChrQnl0ZXMpOyAvLyBDYW5ub3QgdXNlIGZpZWxkcyBtZXRob2RzLCBzaW5jZSBpdCBpcyBncm91cCBlbGVtZW50XG4gICAgICBpZiAoIUZuLmlzVmFsaWROb3QwKGspKSByZXR1cm47IC8vIFZhbGlkIHNjYWxhcnMgKGluY2x1ZGluZyBrKSBtdXN0IGJlIGluIDEuLk4tMVxuICAgICAgY29uc3QgaWsgPSBGbi5pbnYoayk7IC8vIGteLTEgbW9kIG5cbiAgICAgIGNvbnN0IHEgPSBQb2ludC5CQVNFLm11bHRpcGx5KGspLnRvQWZmaW5lKCk7IC8vIHEgPSBrXHUyMkM1R1xuICAgICAgY29uc3QgciA9IEZuLmNyZWF0ZShxLngpOyAvLyByID0gcS54IG1vZCBuXG4gICAgICBpZiAociA9PT0gXzBuKSByZXR1cm47XG4gICAgICBjb25zdCBzID0gRm4uY3JlYXRlKGlrICogRm4uY3JlYXRlKG0gKyByICogZCkpOyAvLyBzID0ga14tMShtICsgcmQpIG1vZCBuXG4gICAgICBpZiAocyA9PT0gXzBuKSByZXR1cm47XG4gICAgICBsZXQgcmVjb3ZlcnkgPSAocS54ID09PSByID8gMCA6IDIpIHwgTnVtYmVyKHEueSAmIF8xbik7IC8vIHJlY292ZXJ5IGJpdCAoMiBvciAzIHdoZW4gcS54Pm4pXG4gICAgICBsZXQgbm9ybVMgPSBzO1xuICAgICAgaWYgKGxvd1MgJiYgaXNCaWdnZXJUaGFuSGFsZk9yZGVyKHMpKSB7XG4gICAgICAgIG5vcm1TID0gRm4ubmVnKHMpOyAvLyBpZiBsb3dTIHdhcyBwYXNzZWQsIGVuc3VyZSBzIGlzIGFsd2F5cyBpbiB0aGUgYm90dG9tIGhhbGYgb2YgTlxuICAgICAgICByZWNvdmVyeSBePSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUociwgbm9ybVMsIGhhc0xhcmdlQ29mYWN0b3IgPyB1bmRlZmluZWQgOiByZWNvdmVyeSk7XG4gICAgfVxuICAgIHJldHVybiB7IHNlZWQsIGsyc2lnIH07XG4gIH1cblxuICAvKipcbiAgICogU2lnbnMgbWVzc2FnZSBoYXNoIHdpdGggYSBzZWNyZXQga2V5LlxuICAgKlxuICAgKiBgYGBcbiAgICogc2lnbihtLCBkKSB3aGVyZVxuICAgKiAgIGsgPSByZmM2OTc5X2htYWNfZHJiZyhtLCBkKVxuICAgKiAgICh4LCB5KSA9IEcgXHUwMEQ3IGtcbiAgICogICByID0geCBtb2QgblxuICAgKiAgIHMgPSAobSArIGRyKSAvIGsgbW9kIG5cbiAgICogYGBgXG4gICAqL1xuICBmdW5jdGlvbiBzaWduKG1lc3NhZ2U6IFVpbnQ4QXJyYXksIHNlY3JldEtleTogVWludDhBcnJheSwgb3B0czogRUNEU0FTaWduT3B0cyA9IHt9KTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBzZWVkLCBrMnNpZyB9ID0gcHJlcFNpZyhtZXNzYWdlLCBzZWNyZXRLZXksIG9wdHMpOyAvLyBTdGVwcyBBLCBEIG9mIFJGQzY5NzkgMy4yLlxuICAgIGNvbnN0IGRyYmcgPSBjcmVhdGVIbWFjRHJiZzxTaWduYXR1cmU+KGhhc2gub3V0cHV0TGVuLCBGbi5CWVRFUywgaG1hYyk7XG4gICAgY29uc3Qgc2lnID0gZHJiZyhzZWVkLCBrMnNpZyk7IC8vIFN0ZXBzIEIsIEMsIEQsIEUsIEYsIEdcbiAgICByZXR1cm4gc2lnLnRvQnl0ZXMob3B0cy5mb3JtYXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIGEgc2lnbmF0dXJlIGFnYWluc3QgbWVzc2FnZSBhbmQgcHVibGljIGtleS5cbiAgICogUmVqZWN0cyBsb3dTIHNpZ25hdHVyZXMgYnkgZGVmYXVsdDogc2VlIHtAbGluayBFQ0RTQVZlcmlmeU9wdHN9LlxuICAgKiBJbXBsZW1lbnRzIHNlY3Rpb24gNC4xLjQgZnJvbSBodHRwczovL3d3dy5zZWNnLm9yZy9zZWMxLXYyLnBkZjpcbiAgICpcbiAgICogYGBgXG4gICAqIHZlcmlmeShyLCBzLCBoLCBQKSB3aGVyZVxuICAgKiAgIHUxID0gaHNeLTEgbW9kIG5cbiAgICogICB1MiA9IHJzXi0xIG1vZCBuXG4gICAqICAgUiA9IHUxXHUyMkM1RyArIHUyXHUyMkM1UFxuICAgKiAgIG1vZChSLngsIG4pID09IHJcbiAgICogYGBgXG4gICAqL1xuICBmdW5jdGlvbiB2ZXJpZnkoXG4gICAgc2lnbmF0dXJlOiBVaW50OEFycmF5LFxuICAgIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gICAgcHVibGljS2V5OiBVaW50OEFycmF5LFxuICAgIG9wdHM6IEVDRFNBVmVyaWZ5T3B0cyA9IHt9XG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgbG93UywgcHJlaGFzaCwgZm9ybWF0IH0gPSB2YWxpZGF0ZVNpZ09wdHMob3B0cywgZGVmYXVsdFNpZ09wdHMpO1xuICAgIHB1YmxpY0tleSA9IGFieXRlcyhwdWJsaWNLZXksIHVuZGVmaW5lZCwgJ3B1YmxpY0tleScpO1xuICAgIG1lc3NhZ2UgPSB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZSwgcHJlaGFzaCk7XG4gICAgaWYgKCFpc0J5dGVzKHNpZ25hdHVyZSBhcyBhbnkpKSB7XG4gICAgICBjb25zdCBlbmQgPSBzaWduYXR1cmUgaW5zdGFuY2VvZiBTaWduYXR1cmUgPyAnLCB1c2Ugc2lnLnRvQnl0ZXMoKScgOiAnJztcbiAgICAgIHRocm93IG5ldyBFcnJvcigndmVyaWZ5IGV4cGVjdHMgVWludDhBcnJheSBzaWduYXR1cmUnICsgZW5kKTtcbiAgICB9XG4gICAgdmFsaWRhdGVTaWdMZW5ndGgoc2lnbmF0dXJlLCBmb3JtYXQpOyAvLyBleGVjdXRlIHRoaXMgdHdpY2UgYmVjYXVzZSB3ZSB3YW50IGxvdWQgZXJyb3JcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2lnID0gU2lnbmF0dXJlLmZyb21CeXRlcyhzaWduYXR1cmUsIGZvcm1hdCk7XG4gICAgICBjb25zdCBQID0gUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleSk7XG4gICAgICBpZiAobG93UyAmJiBzaWcuaGFzSGlnaFMoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgeyByLCBzIH0gPSBzaWc7XG4gICAgICBjb25zdCBoID0gYml0czJpbnRfbW9kTihtZXNzYWdlKTsgLy8gbW9kIG4sIG5vdCBtb2QgcFxuICAgICAgY29uc3QgaXMgPSBGbi5pbnYocyk7IC8vIHNeLTEgbW9kIG5cbiAgICAgIGNvbnN0IHUxID0gRm4uY3JlYXRlKGggKiBpcyk7IC8vIHUxID0gaHNeLTEgbW9kIG5cbiAgICAgIGNvbnN0IHUyID0gRm4uY3JlYXRlKHIgKiBpcyk7IC8vIHUyID0gcnNeLTEgbW9kIG5cbiAgICAgIGNvbnN0IFIgPSBQb2ludC5CQVNFLm11bHRpcGx5VW5zYWZlKHUxKS5hZGQoUC5tdWx0aXBseVVuc2FmZSh1MikpOyAvLyB1MVx1MjJDNUcgKyB1Mlx1MjJDNVBcbiAgICAgIGlmIChSLmlzMCgpKSByZXR1cm4gZmFsc2U7XG4gICAgICBjb25zdCB2ID0gRm4uY3JlYXRlKFIueCk7IC8vIHYgPSByLnggbW9kIG5cbiAgICAgIHJldHVybiB2ID09PSByO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWNvdmVyUHVibGljS2V5KFxuICAgIHNpZ25hdHVyZTogVWludDhBcnJheSxcbiAgICBtZXNzYWdlOiBVaW50OEFycmF5LFxuICAgIG9wdHM6IEVDRFNBUmVjb3Zlck9wdHMgPSB7fVxuICApOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IHByZWhhc2ggfSA9IHZhbGlkYXRlU2lnT3B0cyhvcHRzLCBkZWZhdWx0U2lnT3B0cyk7XG4gICAgbWVzc2FnZSA9IHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlLCBwcmVoYXNoKTtcbiAgICByZXR1cm4gU2lnbmF0dXJlLmZyb21CeXRlcyhzaWduYXR1cmUsICdyZWNvdmVyZWQnKS5yZWNvdmVyUHVibGljS2V5KG1lc3NhZ2UpLnRvQnl0ZXMoKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHtcbiAgICBrZXlnZW4sXG4gICAgZ2V0UHVibGljS2V5LFxuICAgIGdldFNoYXJlZFNlY3JldCxcbiAgICB1dGlscyxcbiAgICBsZW5ndGhzLFxuICAgIFBvaW50LFxuICAgIHNpZ24sXG4gICAgdmVyaWZ5LFxuICAgIHJlY292ZXJQdWJsaWNLZXksXG4gICAgU2lnbmF0dXJlLFxuICAgIGhhc2gsXG4gIH0pIHNhdGlzZmllcyBTaWduZXI7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGxvZ2dlclxuICogQGRlc2NyaXB0aW9uIExvZ2dlciB1dGlsaXR5IGZvciB0aGUgYXBwbGljYXRpb25cbiAqL1xuXG5lbnVtIExvZ0xldmVsIHtcbiAgREVCVUcsXG4gIElORk8sXG4gIFdBUk4sXG4gIEVSUk9SXG59XG5cbmltcG9ydCBwaW5vIGZyb20gJ3Bpbm8nO1xuXG4vKipcbiAqIENyZWF0ZSBhIGxvZ2dlciBpbnN0YW5jZSB3aXRoIGNvbnNpc3RlbnQgY29uZmlndXJhdGlvblxuICogQHBhcmFtIG5hbWUgLSBDb21wb25lbnQgb3IgbW9kdWxlIG5hbWUgZm9yIHRoZSBsb2dnZXJcbiAqIEByZXR1cm5zIENvbmZpZ3VyZWQgcGlubyBsb2dnZXIgaW5zdGFuY2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvZ2dlcihuYW1lOiBzdHJpbmcpOiBwaW5vLkxvZ2dlciB7XG4gIHJldHVybiBwaW5vKHtcbiAgICBuYW1lLFxuICAgIGxldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ2luZm8nLFxuICAgIHRyYW5zcG9ydDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyB7XG4gICAgICB0YXJnZXQ6ICdwaW5vLXByZXR0eScsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgICB0cmFuc2xhdGVUaW1lOiAnSEg6TU06c3MnLFxuICAgICAgICBpZ25vcmU6ICdwaWQsaG9zdG5hbWUnLFxuICAgICAgfVxuICAgIH0gOiB1bmRlZmluZWQsXG4gICAgZm9ybWF0dGVyczoge1xuICAgICAgbGV2ZWw6IChsYWJlbCkgPT4ge1xuICAgICAgICByZXR1cm4geyBsZXZlbDogbGFiZWwudG9VcHBlckNhc2UoKSB9O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogU2ltcGxlIGxvZyBmdW5jdGlvbiBmb3IgYmFzaWMgbG9nZ2luZyBuZWVkc1xuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGxvZ1xuICogQHBhcmFtIGRhdGEgLSBPcHRpb25hbCBkYXRhIHRvIGluY2x1ZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZyhtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiB1bmtub3duKTogdm9pZCB7XG4gIGNvbnNvbGUubG9nKG1lc3NhZ2UsIGRhdGEpO1xufVxuXG4vKipcbiAqIERlZmF1bHQgbG9nZ2VyIGluc3RhbmNlIGZvciB0aGUgYXBwbGljYXRpb25cbiAqIEluY2x1ZGVzIGVuaGFuY2VkIGVycm9yIGhhbmRsaW5nIGFuZCBmb3JtYXR0aW5nXG4gKi9cbmV4cG9ydCBjb25zdCBsb2dnZXI6IHBpbm8uTG9nZ2VyID0gcGlubyh7XG4gIG5hbWU6ICdub3N0ci1jcnlwdG8tdXRpbHMnLFxuICBsZXZlbDogcHJvY2Vzcy5lbnYuTE9HX0xFVkVMIHx8ICdpbmZvJyxcbiAgdHJhbnNwb3J0OiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IHtcbiAgICB0YXJnZXQ6ICdwaW5vLXByZXR0eScsXG4gICAgb3B0aW9uczoge1xuICAgICAgY29sb3JpemU6IHRydWUsXG4gICAgICB0cmFuc2xhdGVUaW1lOiAnSEg6TU06c3MnLFxuICAgICAgaWdub3JlOiAncGlkLGhvc3RuYW1lJyxcbiAgICB9XG4gIH0gOiB1bmRlZmluZWQsXG4gIGZvcm1hdHRlcnM6IHtcbiAgICBsZXZlbDogKGxhYmVsKSA9PiB7XG4gICAgICByZXR1cm4geyBsZXZlbDogbGFiZWwudG9VcHBlckNhc2UoKSB9O1xuICAgIH0sXG4gICAgbG9nOiAob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4ge1xuICAgICAgLy8gQ29udmVydCBlcnJvciBvYmplY3RzIHRvIHN0cmluZ3MgZm9yIGJldHRlciBsb2dnaW5nXG4gICAgICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmICdlcnInIGluIG9iaikge1xuICAgICAgICBjb25zdCBuZXdPYmogPSB7IC4uLm9iaiB9O1xuICAgICAgICBpZiAobmV3T2JqLmVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgY29uc3QgZXJyID0gbmV3T2JqLmVyciBhcyBFcnJvcjtcbiAgICAgICAgICBuZXdPYmouZXJyID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgbmFtZTogZXJyLm5hbWUsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3T2JqO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgY2xhc3MgQ3VzdG9tTG9nZ2VyIHtcbiAgcHJpdmF0ZSBfbGV2ZWw6IExvZ0xldmVsO1xuXG4gIGNvbnN0cnVjdG9yKGxldmVsOiBMb2dMZXZlbCA9IExvZ0xldmVsLklORk8pIHtcbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuICB9XG5cbiAgc2V0TGV2ZWwobGV2ZWw6IExvZ0xldmVsKTogdm9pZCB7XG4gICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcbiAgfVxuXG4gIHByaXZhdGUgX2xvZyhsZXZlbDogTG9nTGV2ZWwsIG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgaWYgKGxldmVsID49IHRoaXMuX2xldmVsKSB7XG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgICBjb25zdCBsZXZlbE5hbWUgPSBMb2dMZXZlbFtsZXZlbF07XG4gICAgICBjb25zdCBjb250ZXh0U3RyID0gY29udGV4dCA/IGAgJHtKU09OLnN0cmluZ2lmeShjb250ZXh0KX1gIDogJyc7XG4gICAgICBjb25zb2xlLmxvZyhgWyR7dGltZXN0YW1wfV0gJHtsZXZlbE5hbWV9OiAke21lc3NhZ2V9JHtjb250ZXh0U3RyfWApO1xuICAgIH1cbiAgfVxuXG4gIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgdGhpcy5fbG9nKExvZ0xldmVsLkRFQlVHLCBtZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxuXG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuSU5GTywgbWVzc2FnZSwgY29udGV4dCk7XG4gIH1cblxuICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgdGhpcy5fbG9nKExvZ0xldmVsLldBUk4sIG1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nIHwgRXJyb3IgfCB1bmtub3duLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IgPyBtZXNzYWdlLm1lc3NhZ2UgOiBTdHJpbmcobWVzc2FnZSk7XG4gICAgdGhpcy5fbG9nKExvZ0xldmVsLkVSUk9SLCBlcnJvck1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG59XG5cbi8vIFJlLWV4cG9ydCB0aGUgTG9nZ2VyIHR5cGUgZm9yIHVzZSBpbiBvdGhlciBmaWxlc1xuZXhwb3J0IHR5cGUgeyBMb2dnZXIgfSBmcm9tICdwaW5vJztcbiIsICIvKipcbiAqIEJhc2U2NCBlbmNvZGluZyB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKiBQcm92aWRlcyBjb25zaXN0ZW50IGJhc2U2NCBlbmNvZGluZy9kZWNvZGluZyBhY3Jvc3MgYWxsIE5vc3RyLXJlbGF0ZWQgcHJvamVjdHNcbiAqIFVzZXMgYnJvd3Nlci1jb21wYXRpYmxlIEFQSXMgKG5vIE5vZGUuanMgQnVmZmVyIGRlcGVuZGVuY3kpXG4gKi9cblxuLyoqXG4gKiBDb252ZXJ0IHN0cmluZyB0byBiYXNlNjRcbiAqIEBwYXJhbSBzdHIgU3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvQmFzZTY0KHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyKTtcbiAgcmV0dXJuIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIHN0cmluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVURi04IHN0cmluZ1xuICogQHRocm93cyBFcnJvciBpZiBiYXNlNjQgc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvU3RyaW5nKGJhc2U2NDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFpc1ZhbGlkQmFzZTY0KGJhc2U2NCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmFzZTY0IHN0cmluZycpO1xuICB9XG4gIGNvbnN0IGJ5dGVzID0gYmFzZTY0VG9CeXRlcyhiYXNlNjQpO1xuICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IFVpbnQ4QXJyYXkgdG8gYmFzZTY0XG4gKiBAcGFyYW0gYnVmZmVyIFVpbnQ4QXJyYXkgdG8gY29udmVydFxuICogQHJldHVybnMgQmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnVmZmVyVG9CYXNlNjQoYnVmZmVyOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgcmV0dXJuIGJ5dGVzVG9CYXNlNjQoYnVmZmVyKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBVaW50OEFycmF5XG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVWludDhBcnJheVxuICogQHRocm93cyBFcnJvciBpZiBiYXNlNjQgc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnVmZmVyKGJhc2U2NDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICByZXR1cm4gYmFzZTY0VG9CeXRlcyhiYXNlNjQpO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHN0cmluZyBpcyB2YWxpZCBiYXNlNjRcbiAqIEBwYXJhbSBiYXNlNjQgU3RyaW5nIHRvIGNoZWNrXG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkIGJhc2U2NFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEJhc2U2NChiYXNlNjQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIHJldHVybiBCb29sZWFuKGJhc2U2NC5tYXRjaCgvXltBLVphLXowLTkrL10qPXswLDJ9JC8pKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gVVJMLXNhZmUgYmFzZTY0XG4gKiBAcGFyYW0gYmFzZTY0IFN0YW5kYXJkIGJhc2U2NCBzdHJpbmdcbiAqIEByZXR1cm5zIFVSTC1zYWZlIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvQmFzZTY0VXJsKGJhc2U2NDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJhc2U2NC5yZXBsYWNlKC9cXCsvZywgJy0nKS5yZXBsYWNlKC9cXC8vZywgJ18nKS5yZXBsYWNlKC89KyQvLCAnJyk7XG59XG5cbi8qKlxuICogQ29udmVydCBVUkwtc2FmZSBiYXNlNjQgdG8gc3RhbmRhcmQgYmFzZTY0XG4gKiBAcGFyYW0gYmFzZTY0dXJsIFVSTC1zYWZlIGJhc2U2NCBzdHJpbmdcbiAqIEByZXR1cm5zIFN0YW5kYXJkIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21CYXNlNjRVcmwoYmFzZTY0dXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBiYXNlNjQgPSBiYXNlNjR1cmwucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKTtcbiAgY29uc3QgcGFkZGluZyA9ICc9Jy5yZXBlYXQoKDQgLSBiYXNlNjQubGVuZ3RoICUgNCkgJSA0KTtcbiAgcmV0dXJuIGJhc2U2NCArIHBhZGRpbmc7XG59XG5cbi8qKlxuICogQ29udmVydCBoZXggc3RyaW5nIHRvIGJhc2U2NFxuICogQHBhcmFtIGhleCBIZXggc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgaGV4IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0Jhc2U2NChoZXg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaGV4Lm1hdGNoKC9eWzAtOWEtZkEtRl0qJC8pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGhleC5sZW5ndGggLyAyKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZXgubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBieXRlc1tpIC8gMl0gPSBwYXJzZUludChoZXguc3Vic3RyaW5nKGksIGkgKyAyKSwgMTYpO1xuICB9XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBoZXggc3RyaW5nXG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgSGV4IHN0cmluZ1xuICogQHRocm93cyBFcnJvciBpZiBiYXNlNjQgc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvSGV4KGJhc2U2NDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFpc1ZhbGlkQmFzZTY0KGJhc2U2NCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmFzZTY0IHN0cmluZycpO1xuICB9XG4gIGNvbnN0IGJ5dGVzID0gYmFzZTY0VG9CeXRlcyhiYXNlNjQpO1xuICByZXR1cm4gQXJyYXkuZnJvbShieXRlcykubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSkuam9pbignJyk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGJhc2U2NCBzdHJpbmcgZnJvbSBieXRlIGFycmF5XG4gKiBAcGFyYW0gYnl0ZXMgQnl0ZSBhcnJheVxuICogQHJldHVybnMgQmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGxldCBiaW5hcnkgPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgfVxuICByZXR1cm4gYnRvYShiaW5hcnkpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIGJ5dGUgYXJyYXlcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgQnl0ZSBhcnJheVxuICogQHRocm93cyBFcnJvciBpZiBiYXNlNjQgc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKCFpc1ZhbGlkQmFzZTY0KGJhc2U2NCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmFzZTY0IHN0cmluZycpO1xuICB9XG4gIGNvbnN0IGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBieXRlcztcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgcGFkZGVkIGxlbmd0aCBmb3IgYmFzZTY0IHN0cmluZ1xuICogQHBhcmFtIGRhdGFMZW5ndGggTGVuZ3RoIG9mIHJhdyBkYXRhXG4gKiBAcmV0dXJucyBMZW5ndGggb2YgcGFkZGVkIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUJhc2U2NExlbmd0aChkYXRhTGVuZ3RoOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5jZWlsKGRhdGFMZW5ndGggLyAzKSAqIDQ7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJhc2U2NCBwYWRkaW5nXG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmdcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmcgd2l0aG91dCBwYWRkaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVCYXNlNjRQYWRkaW5nKGJhc2U2NDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJhc2U2NC5yZXBsYWNlKC89KyQvLCAnJyk7XG59XG5cbi8qKlxuICogQWRkIGJhc2U2NCBwYWRkaW5nXG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmcgd2l0aG91dCBwYWRkaW5nXG4gKiBAcmV0dXJucyBQcm9wZXJseSBwYWRkZWQgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkQmFzZTY0UGFkZGluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhZGRpbmcgPSAnPScucmVwZWF0KCg0IC0gYmFzZTY0Lmxlbmd0aCAlIDQpICUgNCk7XG4gIHJldHVybiBiYXNlNjQgKyBwYWRkaW5nO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSB2YWxpZGF0aW9uXG4gKiBAZGVzY3JpcHRpb24gVmFsaWRhdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyIGV2ZW50cywgbWVzc2FnZXMsIGFuZCByZWxhdGVkIGRhdGEgc3RydWN0dXJlcy5cbiAqIFByb3ZpZGVzIGZ1bmN0aW9ucyB0byB2YWxpZGF0ZSBldmVudHMsIHNpZ25hdHVyZXMsIGZpbHRlcnMsIGFuZCBzdWJzY3JpcHRpb25zIGFjY29yZGluZyB0byB0aGUgTm9zdHIgcHJvdG9jb2wuXG4gKi9cblxuaW1wb3J0IHsgXG4gIE5vc3RyRXZlbnQsIFxuICBTaWduZWROb3N0ckV2ZW50LCBcbiAgTm9zdHJGaWx0ZXIsIFxuICBOb3N0clN1YnNjcmlwdGlvbiwgXG4gIFZhbGlkYXRpb25SZXN1bHQsIFxuICBQdWJsaWNLZXksXG4gIE5vc3RyTWVzc2FnZVR5cGVcbn0gZnJvbSAnLi4vdHlwZXMvaW5kZXgnO1xuXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuXG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBoZXggc3RyaW5nIGZyb20gYSBQdWJsaWNLZXkgb3Igc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGdldFB1YmxpY0tleUhleChwdWJrZXk6IFB1YmxpY0tleSB8IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlb2YgcHVia2V5ID09PSAnc3RyaW5nJyA/IHB1YmtleSA6IHB1YmtleS5oZXg7XG59XG5cbmZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGhleC5tYXRjaCgvLnsxLDJ9L2cpIS5tYXAoYnl0ZSA9PiBwYXJzZUludChieXRlLCAxNikpKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBJRCBieSBjaGVja2luZyBpZiBpdCBtYXRjaGVzIHRoZSBTSEEtMjU2IGhhc2ggb2YgdGhlIGNhbm9uaWNhbCBldmVudCBzZXJpYWxpemF0aW9uLlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVFdmVudElkKGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50SWQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpLFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuICAgIGNvbnN0IGhhc2ggPSBieXRlc1RvSGV4KHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpKTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogaGFzaCA9PT0gZXZlbnQuaWQsXG4gICAgICBlcnJvcjogaGFzaCA9PT0gZXZlbnQuaWQgPyB1bmRlZmluZWQgOiAnSW52YWxpZCBldmVudCBJRCdcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgSUQnKTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCBJRCdcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgc2lnbmF0dXJlIHVzaW5nIFNjaG5vcnIgc2lnbmF0dXJlIHZlcmlmaWNhdGlvbi5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnRTaWduYXR1cmUoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBWZXJpZnkgdGhlIHNpZ25hdHVyZVxuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAwLFxuICAgICAgZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG4gICAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICAgIGNvbnN0IHB1YmtleUhleCA9IGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpO1xuICAgIGNvbnN0IHB1YmtleUJ5dGVzID0gaGV4VG9CeXRlcyhwdWJrZXlIZXgpO1xuICAgIGNvbnN0IGlzVmFsaWQgPSBzY2hub3JyLnZlcmlmeShoZXhUb0J5dGVzKGV2ZW50LnNpZyksIGhhc2gsIHB1YmtleUJ5dGVzKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZCxcbiAgICAgIGVycm9yOiBpc1ZhbGlkID8gdW5kZWZpbmVkIDogJ0ludmFsaWQgc2lnbmF0dXJlJ1xuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCBzaWduYXR1cmUnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIGNvbXBsZXRlIE5vc3RyIGV2ZW50IGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUsIHRpbWVzdGFtcHMsIElELCBhbmQgc2lnbmF0dXJlLlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVFdmVudChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAvLyBGaXJzdCB2YWxpZGF0ZSB0aGUgZXZlbnQgc3RydWN0dXJlXG4gIGNvbnN0IGJhc2VWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudEJhc2UoZXZlbnQpO1xuICBpZiAoIWJhc2VWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICByZXR1cm4gYmFzZVZhbGlkYXRpb247XG4gIH1cblxuICAvLyBUaGVuIHZhbGlkYXRlIHRoZSBldmVudCBJRFxuICBjb25zdCBpZFZhbGlkYXRpb24gPSB2YWxpZGF0ZUV2ZW50SWQoZXZlbnQpO1xuICBpZiAoIWlkVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgcmV0dXJuIGlkVmFsaWRhdGlvbjtcbiAgfVxuXG4gIC8vIEZpbmFsbHkgdmFsaWRhdGUgdGhlIHNpZ25hdHVyZVxuICByZXR1cm4gdmFsaWRhdGVFdmVudFNpZ25hdHVyZShldmVudCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgc2lnbmVkIE5vc3RyIGV2ZW50IGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIHNpZ25hdHVyZSBmb3JtYXQuXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZVNpZ25lZEV2ZW50KGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNpZ25lZEV2ZW50KGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgYmFzaWMgZXZlbnQgc3RydWN0dXJlXG4gICAgY29uc3QgYmFzZVZhbGlkYXRpb24gPSB2YWxpZGF0ZUV2ZW50QmFzZShldmVudCk7XG4gICAgaWYgKCFiYXNlVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICByZXR1cm4gYmFzZVZhbGlkYXRpb247XG4gICAgfVxuXG4gICAgLy8gR2V0IHB1YmtleSBoZXhcbiAgICBjb25zdCBwdWJrZXlIZXggPSBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KTtcblxuICAgIC8vIFZhbGlkYXRlIHB1YmtleSBmb3JtYXRcbiAgICBpZiAoIXB1YmtleUhleCB8fCB0eXBlb2YgcHVia2V5SGV4ICE9PSAnc3RyaW5nJyB8fCBwdWJrZXlIZXgubGVuZ3RoICE9PSA2NCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnSW52YWxpZCBwdWJsaWMga2V5IGZvcm1hdCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgc2lnbmF0dXJlIGZvcm1hdFxuICAgIGlmICghZXZlbnQuc2lnIHx8IHR5cGVvZiBldmVudC5zaWcgIT09ICdzdHJpbmcnIHx8IGV2ZW50LnNpZy5sZW5ndGggIT09IDEyOCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnSW52YWxpZCBzaWduYXR1cmUgZm9ybWF0J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBJRCBmb3JtYXRcbiAgICBpZiAoIWV2ZW50LmlkIHx8IHR5cGVvZiBldmVudC5pZCAhPT0gJ3N0cmluZycgfHwgZXZlbnQuaWQubGVuZ3RoICE9PSA2NCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnSW52YWxpZCBldmVudCBJRCBmb3JtYXQnXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIHNpZ25lZCBldmVudCcpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIHNpZ25lZCBldmVudCdcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSBhbmQgZmllbGRzLlxuICogQHBhcmFtIGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnRCYXNlKGV2ZW50OiBOb3N0ckV2ZW50IHwgU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAvLyBDaGVjayByZXF1aXJlZCBmaWVsZHNcbiAgaWYgKCFldmVudCB8fCB0eXBlb2YgZXZlbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBldmVudCBzdHJ1Y3R1cmUnIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBraW5kXG4gIGlmICh0eXBlb2YgZXZlbnQua2luZCAhPT0gJ251bWJlcicgfHwgZXZlbnQua2luZCA8IDApIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFdmVudCBraW5kIG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRpbWVzdGFtcFxuICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgaWYgKHR5cGVvZiBldmVudC5jcmVhdGVkX2F0ICE9PSAnbnVtYmVyJyB8fCBldmVudC5jcmVhdGVkX2F0ID4gbm93ICsgNjApIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFdmVudCB0aW1lc3RhbXAgY2Fubm90IGJlIGluIHRoZSBmdXR1cmUnIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBjb250ZW50XG4gIGlmICh0eXBlb2YgZXZlbnQuY29udGVudCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFdmVudCBjb250ZW50IG11c3QgYmUgYSBzdHJpbmcnIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBwdWJrZXkgZm9ybWF0XG4gIGlmICghZXZlbnQucHVia2V5KSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnTWlzc2luZyBwdWJsaWMga2V5JyB9O1xuICB9XG5cbiAgLy8gR2V0IHB1YmtleSBoZXhcbiAgY29uc3QgcHVia2V5SGV4ID0gZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSk7XG4gIGlmICh0eXBlb2YgcHVia2V5SGV4ICE9PSAnc3RyaW5nJyB8fCAhL15bMC05YS1mXXs2NH0kLy50ZXN0KHB1YmtleUhleCkpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHB1YmxpYyBrZXkgZm9ybWF0JyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgdGFnc1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZXZlbnQudGFncykpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFdmVudCB0YWdzIG11c3QgYmUgYW4gYXJyYXknIH07XG4gIH1cblxuICBmb3IgKGNvbnN0IHRhZyBvZiBldmVudC50YWdzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRhZykpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0VhY2ggdGFnIG11c3QgYmUgYW4gYXJyYXknIH07XG4gICAgfVxuICAgIGlmICh0YWcubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFbXB0eSB0YWdzIGFyZSBub3QgYWxsb3dlZCcgfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0YWdbMF0gIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdUYWcgaWRlbnRpZmllciBtdXN0IGJlIGEgc3RyaW5nJyB9O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBmaWx0ZXIgYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSBhbmQgZmllbGRzLlxuICogXG4gKiBAcGFyYW0ge05vc3RyRmlsdGVyfSBmaWx0ZXIgLSBUaGUgZmlsdGVyIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyKTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbHRlcihmaWx0ZXI6IE5vc3RyRmlsdGVyKTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgZmlsdGVyIHN0cnVjdHVyZVxuICAgIGlmICghZmlsdGVyIHx8IHR5cGVvZiBmaWx0ZXIgIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGZpbHRlciBzdHJ1Y3R1cmUnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgaWRzIGFycmF5IGlmIHByZXNlbnRcbiAgICBpZiAoZmlsdGVyLmlkcyAmJiAoIUFycmF5LmlzQXJyYXkoZmlsdGVyLmlkcykgfHwgIWZpbHRlci5pZHMuZXZlcnkoaWQgPT4gdHlwZW9mIGlkID09PSAnc3RyaW5nJykpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgaWRzIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncycgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBhdXRob3JzIGFycmF5IGlmIHByZXNlbnRcbiAgICBpZiAoZmlsdGVyLmF1dGhvcnMgJiYgKCFBcnJheS5pc0FycmF5KGZpbHRlci5hdXRob3JzKSB8fCAhZmlsdGVyLmF1dGhvcnMuZXZlcnkoYXV0aG9yID0+IHR5cGVvZiBhdXRob3IgPT09ICdzdHJpbmcnKSkpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBhdXRob3JzIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncycgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBraW5kcyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5raW5kcykge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZpbHRlci5raW5kcykpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGtpbmRzIG11c3QgYmUgYW4gYXJyYXkgb2YgbnVtYmVycycgfTtcbiAgICAgIH1cbiAgICAgIGlmICghZmlsdGVyLmtpbmRzLmV2ZXJ5KGtpbmQgPT4gdHlwZW9mIGtpbmQgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoa2luZCkgJiYga2luZCA+PSAwKSkge1xuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIga2luZHMgbXVzdCBiZSBub24tbmVnYXRpdmUgaW50ZWdlcnMnIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgdGltZXN0YW1wc1xuICAgIGlmIChmaWx0ZXIuc2luY2UgJiYgdHlwZW9mIGZpbHRlci5zaW5jZSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBzaW5jZSBtdXN0IGJlIGEgbnVtYmVyJyB9O1xuICAgIH1cbiAgICBpZiAoZmlsdGVyLnVudGlsICYmIHR5cGVvZiBmaWx0ZXIudW50aWwgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgdW50aWwgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBsaW1pdFxuICAgIGlmIChmaWx0ZXIubGltaXQgJiYgdHlwZW9mIGZpbHRlci5saW1pdCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBsaW1pdCBtdXN0IGJlIGEgbnVtYmVyJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHNlYXJjaFxuICAgIGlmIChmaWx0ZXIuc2VhcmNoICYmIHR5cGVvZiBmaWx0ZXIuc2VhcmNoICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIHNlYXJjaCBtdXN0IGJlIGEgc3RyaW5nJyB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGZpbHRlcicpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBmaWx0ZXInIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBzdWJzY3JpcHRpb24gYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSBhbmQgZmlsdGVycy5cbiAqIFxuICogQHBhcmFtIHtOb3N0clN1YnNjcmlwdGlvbn0gc3Vic2NyaXB0aW9uIC0gVGhlIHN1YnNjcmlwdGlvbiB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbik7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uOiBOb3N0clN1YnNjcmlwdGlvbik6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIHN1YnNjcmlwdGlvbiBzdHJ1Y3R1cmVcbiAgICBpZiAoIXN1YnNjcmlwdGlvbiB8fCB0eXBlb2Ygc3Vic2NyaXB0aW9uICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBzdWJzY3JpcHRpb24gc3RydWN0dXJlJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHN1YnNjcmlwdGlvbiBJRFxuICAgIGlmICghc3Vic2NyaXB0aW9uLmlkIHx8IHR5cGVvZiBzdWJzY3JpcHRpb24uaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdTdWJzY3JpcHRpb24gbXVzdCBoYXZlIGEgc3RyaW5nIElEJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGZpbHRlcnMgYXJyYXlcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3Vic2NyaXB0aW9uLmZpbHRlcnMpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdTdWJzY3JpcHRpb24gZmlsdGVycyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGVhY2ggZmlsdGVyXG4gICAgZm9yIChjb25zdCBmaWx0ZXIgb2Ygc3Vic2NyaXB0aW9uLmZpbHRlcnMpIHtcbiAgICAgIGNvbnN0IGZpbHRlclZhbGlkYXRpb24gPSB2YWxpZGF0ZUZpbHRlcihmaWx0ZXIpO1xuICAgICAgaWYgKCFmaWx0ZXJWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgICAgcmV0dXJuIGZpbHRlclZhbGlkYXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgc3Vic2NyaXB0aW9uJyk7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIHN1YnNjcmlwdGlvbicgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIHJlbGF5IHJlc3BvbnNlIG1lc3NhZ2UuXG4gKiBcbiAqIEBwYXJhbSB7dW5rbm93bn0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVSZXNwb25zZShbJ0VWRU5UJywgZXZlbnRPYmpdKTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVJlc3BvbnNlKG1lc3NhZ2U6IHVua25vd24pOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gQ2hlY2sgaWYgbWVzc2FnZSBpcyBhbiBhcnJheVxuICBpZiAoIUFycmF5LmlzQXJyYXkobWVzc2FnZSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ludmFsaWQgbWVzc2FnZSBmb3JtYXQ6IG11c3QgYmUgYW4gYXJyYXknXG4gICAgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIG1lc3NhZ2UgaGFzIGF0IGxlYXN0IG9uZSBlbGVtZW50XG4gIGlmIChtZXNzYWdlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW52YWxpZCBtZXNzYWdlIGZvcm1hdDogYXJyYXkgaXMgZW1wdHknXG4gICAgfTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIGZpcnN0IGVsZW1lbnQgaXMgYSB2YWxpZCBtZXNzYWdlIHR5cGVcbiAgY29uc3QgdHlwZSA9IG1lc3NhZ2VbMF07XG4gIGlmICghT2JqZWN0LnZhbHVlcyhOb3N0ck1lc3NhZ2VUeXBlKS5pbmNsdWRlcyh0eXBlIGFzIE5vc3RyTWVzc2FnZVR5cGUpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6IGBJbnZhbGlkIG1lc3NhZ2UgdHlwZTogJHt0eXBlfWBcbiAgICB9O1xuICB9XG5cbiAgLy8gVHlwZS1zcGVjaWZpYyB2YWxpZGF0aW9uXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5FVkVOVDpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnRVZFTlQgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkYXRlU2lnbmVkRXZlbnQobWVzc2FnZVsxXSBhcyBTaWduZWROb3N0ckV2ZW50KTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5OT1RJQ0U6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIgfHwgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdOT1RJQ0UgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzIHdpdGggYSBzdHJpbmcgbWVzc2FnZSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5PSzpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gNCB8fCBcbiAgICAgICAgICB0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbMl0gIT09ICdib29sZWFuJyB8fCBcbiAgICAgICAgICB0eXBlb2YgbWVzc2FnZVszXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ09LIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgNCBlbGVtZW50czogW3R5cGUsIGV2ZW50SWQsIHN1Y2Nlc3MsIG1lc3NhZ2VdJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLkVPU0U6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIgfHwgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdFT1NFIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cyB3aXRoIGEgc3Vic2NyaXB0aW9uIElEJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLlJFUTpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ1JFUSBtZXNzYWdlIG11c3QgaGF2ZSBhdCBsZWFzdCAyIGVsZW1lbnRzJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnUkVRIG1lc3NhZ2UgbXVzdCBoYXZlIGEgc3RyaW5nIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIFZhbGlkYXRlIGVhY2ggZmlsdGVyIGlmIHByZXNlbnRcbiAgICAgIGZvciAobGV0IGkgPSAyOyBpIDwgbWVzc2FnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBmaWx0ZXJSZXN1bHQgPSB2YWxpZGF0ZUZpbHRlcihtZXNzYWdlW2ldIGFzIE5vc3RyRmlsdGVyKTtcbiAgICAgICAgaWYgKCFmaWx0ZXJSZXN1bHQuaXNWYWxpZCkge1xuICAgICAgICAgIHJldHVybiBmaWx0ZXJSZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5DTE9TRTpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMiB8fCB0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0NMT1NFIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cyB3aXRoIGEgc3Vic2NyaXB0aW9uIElEJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLkFVVEg6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0FVVEggbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkYXRlU2lnbmVkRXZlbnQobWVzc2FnZVsxXSBhcyBTaWduZWROb3N0ckV2ZW50KTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGBVbnN1cHBvcnRlZCBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gXG4gICAgICB9O1xuICB9XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGV2ZW50XG4gKiBAZGVzY3JpcHRpb24gRXZlbnQgaGFuZGxpbmcgdXRpbGl0aWVzIGZvciBOb3N0clxuICovXG5cbmV4cG9ydCB7IGNyZWF0ZUV2ZW50LCBzZXJpYWxpemVFdmVudCwgZ2V0RXZlbnRIYXNoIH0gZnJvbSAnLi9jcmVhdGlvbic7XG5leHBvcnQgeyB2YWxpZGF0ZUV2ZW50LCBjYWxjdWxhdGVFdmVudElkIH0gZnJvbSAnLi9zaWduaW5nJztcbiIsICIvKipcbiAqIEBtb2R1bGUgZXZlbnQvY3JlYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBFdmVudCBjcmVhdGlvbiBhbmQgc2VyaWFsaXphdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKi9cblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgdHlwZSB7IE5vc3RyRXZlbnQsIE5vc3RyRXZlbnRLaW5kIH0gZnJvbSAnLi4vdHlwZXMvaW5kZXgnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgTm9zdHIgZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBwYXJhbXMgLSBFdmVudCBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBDcmVhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudChwYXJhbXM6IHtcbiAga2luZDogTm9zdHJFdmVudEtpbmQ7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGFncz86IHN0cmluZ1tdW107XG4gIGNyZWF0ZWRfYXQ/OiBudW1iZXI7XG4gIHB1YmtleT86IHN0cmluZztcbn0pOiBOb3N0ckV2ZW50IHtcbiAgY29uc3QgeyBcbiAgICBraW5kLCBcbiAgICBjb250ZW50LCBcbiAgICB0YWdzID0gW10sIFxuICAgIGNyZWF0ZWRfYXQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSwgXG4gICAgcHVia2V5ID0gJycgXG4gIH0gPSBwYXJhbXM7XG4gIFxuICByZXR1cm4ge1xuICAgIGtpbmQsXG4gICAgY29udGVudCxcbiAgICB0YWdzLFxuICAgIGNyZWF0ZWRfYXQsXG4gICAgcHVia2V5LFxuICB9O1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgYSBOb3N0ciBldmVudCBmb3Igc2lnbmluZy9oYXNoaW5nIChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzZXJpYWxpemVcbiAqIEByZXR1cm5zIFNlcmlhbGl6ZWQgZXZlbnQgSlNPTiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUV2ZW50KGV2ZW50OiBOb3N0ckV2ZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFtcbiAgICAwLFxuICAgIGV2ZW50LnB1YmtleSxcbiAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgIGV2ZW50LmtpbmQsXG4gICAgZXZlbnQudGFncyxcbiAgICBldmVudC5jb250ZW50XG4gIF0pO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGhhc2ggb2YgYSBOb3N0ciBldmVudCAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gaGFzaFxuICogQHJldHVybnMgRXZlbnQgaGFzaCBpbiBoZXggZm9ybWF0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRFdmVudEhhc2goZXZlbnQ6IE5vc3RyRXZlbnQpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVFdmVudChldmVudCk7XG4gICAgY29uc3QgaGFzaCA9IGF3YWl0IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICAgIHJldHVybiBieXRlc1RvSGV4KGhhc2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZ2V0IGV2ZW50IGhhc2gnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIiwgIi8qKlxuICogQG1vZHVsZSBldmVudC9zaWduaW5nXG4gKiBAZGVzY3JpcHRpb24gRXZlbnQgc2lnbmluZyBhbmQgdmVyaWZpY2F0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqL1xuXG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IGdldEV2ZW50SGFzaCB9IGZyb20gJy4vY3JlYXRpb24nO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIFNpZ25zIGEgTm9zdHIgZXZlbnQgd2l0aCBhIHByaXZhdGUga2V5IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzaWduXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGluIGhleCBmb3JtYXRcbiAqIEByZXR1cm5zIFNpZ25lZCBldmVudFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnbkV2ZW50KFxuICBldmVudDogTm9zdHJFdmVudCwgXG4gIHByaXZhdGVLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgaGFzaCA9IGF3YWl0IGdldEV2ZW50SGFzaChldmVudCk7XG4gICAgY29uc3Qgc2lnID0gc2Nobm9yci5zaWduKGhleFRvQnl0ZXMoaGFzaCksIGhleFRvQnl0ZXMocHJpdmF0ZUtleSkpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICAuLi5ldmVudCxcbiAgICAgIGlkOiBoYXNoLFxuICAgICAgc2lnOiBieXRlc1RvSGV4KHNpZyksXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHNpZ24gZXZlbnQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoZSBzaWduYXR1cmUgb2YgYSBzaWduZWQgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZlcmlmeVxuICogQHJldHVybnMgVHJ1ZSBpZiBzaWduYXR1cmUgaXMgdmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeVNpZ25hdHVyZShldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIHJldHVybiBzY2hub3JyLnZlcmlmeShcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuc2lnKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuaWQpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5wdWJrZXkpXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIFRydWUgaWYgZXZlbnQgaXMgdmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICAvLyBDaGVjayByZXF1aXJlZCBmaWVsZHNcbiAgICBpZiAoIWV2ZW50LmlkIHx8ICFldmVudC5wdWJrZXkgfHwgIWV2ZW50LnNpZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSBzaWduYXR1cmVcbiAgICByZXR1cm4gdmVyaWZ5U2lnbmF0dXJlKGV2ZW50KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRXJyb3IgdmFsaWRhdGluZyBldmVudCcpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV2ZW50IElEIGZvciBhIE5vc3RyIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBjYWxjdWxhdGUgSUQgZm9yXG4gKiBAcmV0dXJucyBFdmVudCBJRFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlRXZlbnRJZChldmVudDogTm9zdHJFdmVudCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBnZXRFdmVudEhhc2goZXZlbnQpO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC0wNFxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC0wNCAoRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDQubWRcbiAqL1xuXG5pbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHsgYnl0ZXNUb0Jhc2U2NCwgYmFzZTY0VG9CeXRlcyB9IGZyb20gJy4uL2VuY29kaW5nL2Jhc2U2NCc7XG5pbXBvcnQgdHlwZSB7IENyeXB0b1N1YnRsZSB9IGZyb20gJy4uL2NyeXB0byc7XG5cblxuLy8gQ29uZmlndXJlIGNyeXB0byBmb3IgTm9kZS5qcyBhbmQgdGVzdCBlbnZpcm9ubWVudHNcbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbiAgaW50ZXJmYWNlIEdsb2JhbCB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbn1cblxuY29uc3QgZ2V0Q3J5cHRvID0gYXN5bmMgKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiA9PiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY3J5cHRvKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jcnlwdG87XG4gIH1cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG8pIHtcbiAgICByZXR1cm4gKGdsb2JhbCBhcyBHbG9iYWwpLmNyeXB0bztcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGNyeXB0b01vZHVsZSA9IGF3YWl0IGltcG9ydCgnY3J5cHRvJyk7XG4gICAgaWYgKGNyeXB0b01vZHVsZS53ZWJjcnlwdG8pIHtcbiAgICAgIHJldHVybiBjcnlwdG9Nb2R1bGUud2ViY3J5cHRvIGFzIENyeXB0b1N1YnRsZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGxvZ2dlci5kZWJ1ZygnTm9kZSBjcnlwdG8gbm90IGF2YWlsYWJsZScpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdObyBXZWJDcnlwdG8gaW1wbGVtZW50YXRpb24gYXZhaWxhYmxlJyk7XG59O1xuXG5jbGFzcyBDcnlwdG9JbXBsZW1lbnRhdGlvbiB7XG4gIHByaXZhdGUgY3J5cHRvSW5zdGFuY2U6IENyeXB0b1N1YnRsZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFByb21pc2UgPSB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNyeXB0b0luc3RhbmNlID0gYXdhaXQgZ2V0Q3J5cHRvKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUluaXRpYWxpemVkKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiB7XG4gICAgYXdhaXQgdGhpcy5pbml0UHJvbWlzZTtcbiAgICBpZiAoIXRoaXMuY3J5cHRvSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3J5cHRvIGltcGxlbWVudGF0aW9uIG5vdCBpbml0aWFsaXplZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcnlwdG9JbnN0YW5jZTtcbiAgfVxuXG4gIGFzeW5jIGdldFN1YnRsZSgpOiBQcm9taXNlPENyeXB0b1N1YnRsZVsnc3VidGxlJ10+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGU7XG4gIH1cblxuICBhc3luYyBnZXRSYW5kb21WYWx1ZXM8VCBleHRlbmRzIFVpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk+KGFycmF5OiBUKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcbiAgfVxufVxuXG5jb25zdCBjcnlwdG9JbXBsID0gbmV3IENyeXB0b0ltcGxlbWVudGF0aW9uKCk7XG5cbmludGVyZmFjZSBTaGFyZWRTZWNyZXQge1xuICBzaGFyZWRTZWNyZXQ6IFVpbnQ4QXJyYXk7XG59XG5cbi8qKlxuICogRW5jcnlwdHMgYSBtZXNzYWdlIHVzaW5nIE5JUC0wNCBlbmNyeXB0aW9uXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gZW5jcnlwdFxuICogQHBhcmFtIHNlbmRlclByaXZLZXkgLSBTZW5kZXIncyBwcml2YXRlIGtleVxuICogQHBhcmFtIHJlY2lwaWVudFB1YktleSAtIFJlY2lwaWVudCdzIHB1YmxpYyBrZXlcbiAqIEByZXR1cm5zIEVuY3J5cHRlZCBtZXNzYWdlIHN0cmluZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdE1lc3NhZ2UoXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgc2VuZGVyUHJpdktleTogc3RyaW5nLFxuICByZWNpcGllbnRQdWJLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIW1lc3NhZ2UgfHwgIXNlbmRlclByaXZLZXkgfHwgIXJlY2lwaWVudFB1YktleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBrZXlzXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHNlbmRlclByaXZLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHB1YmxpYyBrZXkgaXMgaW4gY29ycmVjdCBmb3JtYXRcbiAgICBjb25zdCBwdWJLZXlIZXggPSByZWNpcGllbnRQdWJLZXkuc3RhcnRzV2l0aCgnMDInKSB8fCByZWNpcGllbnRQdWJLZXkuc3RhcnRzV2l0aCgnMDMnKSBcbiAgICAgID8gcmVjaXBpZW50UHViS2V5IFxuICAgICAgOiAnMDInICsgcmVjaXBpZW50UHViS2V5O1xuXG4gICAgLy8gR2VuZXJhdGUgc2hhcmVkIHNlY3JldFxuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHNlbmRlclByaXZLZXkpLCBoZXhUb0J5dGVzKHB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7IC8vIFVzZSBvbmx5IHgtY29vcmRpbmF0ZVxuXG4gICAgLy8gSW1wb3J0IGtleSBmb3IgQUVTXG4gICAgY29uc3Qgc2hhcmVkS2V5ID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAgc2hhcmVkWC5idWZmZXIsXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydlbmNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIEdlbmVyYXRlIElWIGFuZCBlbmNyeXB0XG4gICAgY29uc3QgaXYgPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgYXdhaXQgY3J5cHRvSW1wbC5nZXRSYW5kb21WYWx1ZXMoaXYpO1xuXG4gICAgY29uc3QgZW5jb2RlZCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShtZXNzYWdlKTtcbiAgICBjb25zdCBlbmNyeXB0ZWQgPSBhd2FpdCAoYXdhaXQgY3J5cHRvSW1wbC5nZXRTdWJ0bGUoKSkuZW5jcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdiB9LFxuICAgICAgc2hhcmVkS2V5LFxuICAgICAgZW5jb2RlZC5idWZmZXJcbiAgICApO1xuXG4gICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgY29uc3QgY2lwaGVydGV4dEJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkoZW5jcnlwdGVkKSk7XG4gICAgY29uc3QgaXZCYXNlNjQgPSBieXRlc1RvQmFzZTY0KGl2KTtcblxuICAgIHJldHVybiBjaXBoZXJ0ZXh0QmFzZTY0ICsgJz9pdj0nICsgaXZCYXNlNjQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBlbmNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIERlY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDQgZGVjcnlwdGlvblxuICogQHBhcmFtIGVuY3J5cHRlZE1lc3NhZ2UgLSBFbmNyeXB0ZWQgbWVzc2FnZSBzdHJpbmdcbiAqIEBwYXJhbSByZWNpcGllbnRQcml2S2V5IC0gUmVjaXBpZW50J3MgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSBzZW5kZXJQdWJLZXkgLSBTZW5kZXIncyBwdWJsaWMga2V5XG4gKiBAcmV0dXJucyBEZWNyeXB0ZWQgbWVzc2FnZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHRNZXNzYWdlKFxuICBlbmNyeXB0ZWRNZXNzYWdlOiBzdHJpbmcsXG4gIHJlY2lwaWVudFByaXZLZXk6IHN0cmluZyxcbiAgc2VuZGVyUHViS2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgaWYgKCFlbmNyeXB0ZWRNZXNzYWdlIHx8ICFyZWNpcGllbnRQcml2S2V5IHx8ICFzZW5kZXJQdWJLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2V5c1xuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChyZWNpcGllbnRQcml2S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBwdWJsaWMga2V5IGlzIGluIGNvcnJlY3QgZm9ybWF0XG4gICAgY29uc3QgcHViS2V5SGV4ID0gc2VuZGVyUHViS2V5LnN0YXJ0c1dpdGgoJzAyJykgfHwgc2VuZGVyUHViS2V5LnN0YXJ0c1dpdGgoJzAzJylcbiAgICAgID8gc2VuZGVyUHViS2V5XG4gICAgICA6ICcwMicgKyBzZW5kZXJQdWJLZXk7XG5cbiAgICAvLyBHZW5lcmF0ZSBzaGFyZWQgc2VjcmV0XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMocmVjaXBpZW50UHJpdktleSksIGhleFRvQnl0ZXMocHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTsgLy8gVXNlIG9ubHkgeC1jb29yZGluYXRlXG5cbiAgICAvLyBJbXBvcnQga2V5IGZvciBBRVNcbiAgICBjb25zdCBzaGFyZWRLZXkgPSBhd2FpdCAoYXdhaXQgY3J5cHRvSW1wbC5nZXRTdWJ0bGUoKSkuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2RlY3J5cHQnXVxuICAgICk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgLy8gUGFyc2UgTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgLy8gQWxzbyBzdXBwb3J0IGxlZ2FjeSBoZXggZm9ybWF0IChpdiArIGNpcGhlcnRleHQgY29uY2F0ZW5hdGVkKSBhcyBmYWxsYmFja1xuICAgIGxldCBpdjogVWludDhBcnJheTtcbiAgICBsZXQgY2lwaGVydGV4dDogVWludDhBcnJheTtcblxuICAgIGlmIChlbmNyeXB0ZWRNZXNzYWdlLmluY2x1ZGVzKCc/aXY9JykpIHtcbiAgICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXRcbiAgICAgIGNvbnN0IFtjaXBoZXJ0ZXh0QmFzZTY0LCBpdkJhc2U2NF0gPSBlbmNyeXB0ZWRNZXNzYWdlLnNwbGl0KCc/aXY9Jyk7XG4gICAgICBjaXBoZXJ0ZXh0ID0gYmFzZTY0VG9CeXRlcyhjaXBoZXJ0ZXh0QmFzZTY0KTtcbiAgICAgIGl2ID0gYmFzZTY0VG9CeXRlcyhpdkJhc2U2NCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExlZ2FjeSBoZXggZm9ybWF0IGZhbGxiYWNrOiBmaXJzdCAxNiBieXRlcyBhcmUgSVYsIHJlc3QgaXMgY2lwaGVydGV4dFxuICAgICAgY29uc3QgZW5jcnlwdGVkID0gaGV4VG9CeXRlcyhlbmNyeXB0ZWRNZXNzYWdlKTtcbiAgICAgIGl2ID0gZW5jcnlwdGVkLnNsaWNlKDAsIDE2KTtcbiAgICAgIGNpcGhlcnRleHQgPSBlbmNyeXB0ZWQuc2xpY2UoMTYpO1xuICAgIH1cblxuICAgIC8vIERlY3J5cHRcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBhd2FpdCAoYXdhaXQgY3J5cHRvSW1wbC5nZXRTdWJ0bGUoKSkuZGVjcnlwdChcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBpdiB9LFxuICAgICAgc2hhcmVkS2V5LFxuICAgICAgY2lwaGVydGV4dC5idWZmZXIgYXMgQXJyYXlCdWZmZXJcbiAgICApO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShkZWNyeXB0ZWQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZGVjcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBzaGFyZWQgc2VjcmV0IGZvciBOSVAtMDQgZW5jcnlwdGlvblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleVxuICogQHBhcmFtIHB1YmxpY0tleSAtIFB1YmxpYyBrZXlcbiAqIEByZXR1cm5zIFNoYXJlZCBzZWNyZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU2hhcmVkU2VjcmV0KFxuICBwcml2YXRlS2V5OiBzdHJpbmcsXG4gIHB1YmxpY0tleTogc3RyaW5nXG4pOiBTaGFyZWRTZWNyZXQge1xuICB0cnkge1xuICAgIGlmICghcHJpdmF0ZUtleSB8fCAhcHVibGljS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgcGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtleXNcbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3QocHJpdmF0ZUtleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcHVibGljIGtleSBpcyBpbiBjb3JyZWN0IGZvcm1hdFxuICAgIGNvbnN0IHB1YktleUhleCA9IHB1YmxpY0tleS5zdGFydHNXaXRoKCcwMicpIHx8IHB1YmxpY0tleS5zdGFydHNXaXRoKCcwMycpXG4gICAgICA/IHB1YmxpY0tleVxuICAgICAgOiAnMDInICsgcHVibGljS2V5O1xuXG4gICAgLy8gR2VuZXJhdGUgc2hhcmVkIHNlY3JldFxuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHByaXZhdGVLZXkpLCBoZXhUb0J5dGVzKHB1YktleUhleCkpO1xuICAgIHJldHVybiB7IHNoYXJlZFNlY3JldDogc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpIH07IC8vIFJldHVybiBvbmx5IHgtY29vcmRpbmF0ZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZ2VuZXJhdGUgc2hhcmVkIHNlY3JldCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCB7IGdlbmVyYXRlU2hhcmVkU2VjcmV0IGFzIGNvbXB1dGVTaGFyZWRTZWNyZXQgfTtcbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtMDFcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtMDE6IEJhc2ljIFByb3RvY29sIEZsb3cgRGVzY3JpcHRpb25cbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDEubWRcbiAqL1xuXG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgdHlwZSB7IE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBOb3N0ciBldmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgcGFyYW1ldGVycyAoTklQLTAxKVxuICogQHBhcmFtIHBhcmFtcyAtIEV2ZW50IHBhcmFtZXRlcnNcbiAqIEByZXR1cm5zIENyZWF0ZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KHBhcmFtczoge1xuICBraW5kOiBudW1iZXI7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGFncz86IHN0cmluZ1tdW107XG4gIGNyZWF0ZWRfYXQ/OiBudW1iZXI7XG4gIHB1YmtleT86IHN0cmluZztcbn0pOiBOb3N0ckV2ZW50IHtcbiAgY29uc3QgeyBcbiAgICBraW5kLCBcbiAgICBjb250ZW50LCBcbiAgICB0YWdzID0gW10sIFxuICAgIGNyZWF0ZWRfYXQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKSwgXG4gICAgcHVia2V5ID0gJycgXG4gIH0gPSBwYXJhbXM7XG4gIFxuICByZXR1cm4ge1xuICAgIGtpbmQsXG4gICAgY29udGVudCxcbiAgICB0YWdzLFxuICAgIGNyZWF0ZWRfYXQsXG4gICAgcHVia2V5LFxuICB9O1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgYSBOb3N0ciBldmVudCBmb3Igc2lnbmluZy9oYXNoaW5nIChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzZXJpYWxpemVcbiAqIEByZXR1cm5zIFNlcmlhbGl6ZWQgZXZlbnQgSlNPTiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUV2ZW50KGV2ZW50OiBOb3N0ckV2ZW50KTogc3RyaW5nIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFtcbiAgICAwLFxuICAgIGV2ZW50LnB1YmtleSxcbiAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgIGV2ZW50LmtpbmQsXG4gICAgZXZlbnQudGFncyxcbiAgICBldmVudC5jb250ZW50XG4gIF0pO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGhhc2ggb2YgYSBOb3N0ciBldmVudCAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gaGFzaFxuICogQHJldHVybnMgRXZlbnQgaGFzaCBpbiBoZXggZm9ybWF0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRFdmVudEhhc2goZXZlbnQ6IE5vc3RyRXZlbnQpOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVFdmVudChldmVudCk7XG4gICAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICAgIHJldHVybiBieXRlc1RvSGV4KGhhc2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZ2V0IGV2ZW50IGhhc2gnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFNpZ25zIGEgTm9zdHIgZXZlbnQgd2l0aCBhIHByaXZhdGUga2V5IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzaWduXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGluIGhleCBmb3JtYXRcbiAqIEByZXR1cm5zIFNpZ25lZCBldmVudFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnbkV2ZW50KFxuICBldmVudDogTm9zdHJFdmVudCwgXG4gIHByaXZhdGVLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgaGFzaCA9IGF3YWl0IGdldEV2ZW50SGFzaChldmVudCk7XG4gICAgY29uc3Qgc2lnID0gc2Nobm9yci5zaWduKGhleFRvQnl0ZXMoaGFzaCksIGhleFRvQnl0ZXMocHJpdmF0ZUtleSkpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICAuLi5ldmVudCxcbiAgICAgIGlkOiBoYXNoLFxuICAgICAgc2lnOiBieXRlc1RvSGV4KHNpZyksXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHNpZ24gZXZlbnQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoZSBzaWduYXR1cmUgb2YgYSBzaWduZWQgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZlcmlmeVxuICogQHJldHVybnMgVHJ1ZSBpZiBzaWduYXR1cmUgaXMgdmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeVNpZ25hdHVyZShldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIC8vIFZlcmlmeSBldmVudCBJRFxuICAgIGNvbnN0IGV4cGVjdGVkSWQgPSBjYWxjdWxhdGVFdmVudElkKGV2ZW50KTtcbiAgICBpZiAoZXZlbnQuaWQgIT09IGV4cGVjdGVkSWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHNjaG5vcnIudmVyaWZ5KFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5zaWcpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5pZCksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnB1YmtleSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmVyaWZ5IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV2ZW50IElEIGFjY29yZGluZyB0byBOSVAtMDFcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGNhbGN1bGF0ZSBJRCBmb3JcbiAqIEByZXR1cm5zIEV2ZW50IElEIGluIGhleCBmb3JtYXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUV2ZW50SWQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBzdHJpbmcge1xuICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICBjb25zdCBoYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gIHJldHVybiBieXRlc1RvSGV4KGhhc2gpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IHN0cnVjdHVyZSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIFRydWUgaWYgZXZlbnQgc3RydWN0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50KGV2ZW50OiBOb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBldmVudC5jb250ZW50ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZXZlbnQuY3JlYXRlZF9hdCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV2ZW50LmtpbmQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGV2ZW50LnRhZ3MpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBldmVudC5wdWJrZXkgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgLy8gVmFsaWRhdGUgdGFncyBzdHJ1Y3R1cmVcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiBldmVudC50YWdzKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGFnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHRhZy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgdGFnWzBdICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCAiLyoqXG4gKiBOSVAtMTk6IGJlY2gzMi1lbmNvZGVkIGVudGl0aWVzXG4gKiBJbXBsZW1lbnRzIGVuY29kaW5nIGFuZCBkZWNvZGluZyBvZiBOb3N0ciBlbnRpdGllcyB1c2luZyBiZWNoMzIgZm9ybWF0XG4gKi9cblxuaW1wb3J0IHsgYmVjaDMyIH0gZnJvbSAnYmVjaDMyJztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlcic7XG5cbmV4cG9ydCB0eXBlIE5pcDE5RGF0YVR5cGUgPSAnbnB1YicgfCAnbnNlYycgfCAnbm90ZScgfCAnbnByb2ZpbGUnIHwgJ25ldmVudCcgfCAnbmFkZHInIHwgJ25yZWxheSc7XG5cbmNvbnN0IFZBTElEX1BSRUZJWEVTOiBOaXAxOURhdGFUeXBlW10gPSBbJ25wdWInLCAnbnNlYycsICdub3RlJywgJ25wcm9maWxlJywgJ25ldmVudCcsICduYWRkcicsICducmVsYXknXTtcblxuZXhwb3J0IGludGVyZmFjZSBOaXAxOURhdGEge1xuICB0eXBlOiBOaXAxOURhdGFUeXBlO1xuICBkYXRhOiBzdHJpbmc7XG4gIHJlbGF5cz86IHN0cmluZ1tdO1xuICBhdXRob3I/OiBzdHJpbmc7XG4gIGtpbmQ/OiBudW1iZXI7XG4gIGlkZW50aWZpZXI/OiBzdHJpbmc7IC8vIEZvciBuYWRkclxufVxuXG4vLyBUTFYgdHlwZSBjb25zdGFudHNcbmNvbnN0IFRMVl9UWVBFUyA9IHtcbiAgU1BFQ0lBTDogMCwgICAvLyBNYWluIGRhdGEgKGhleClcbiAgUkVMQVk6IDEsICAgICAvLyBSZWxheSBVUkwgKHV0ZjgpXG4gIEFVVEhPUjogMiwgICAgLy8gQXV0aG9yIHB1YmtleSAoaGV4KVxuICBLSU5EOiAzLCAgICAgIC8vIEV2ZW50IGtpbmQgKHVpbnQ4KVxuICBJREVOVElGSUVSOiA0IC8vIElkZW50aWZpZXIgKHV0ZjgpXG59IGFzIGNvbnN0O1xuXG4vKipcbiAqIEVuY29kZSBhIHB1YmxpYyBrZXkgYXMgYW4gbnB1YlxuICogQHBhcmFtIHB1YmtleSBQdWJsaWMga2V5IGluIGhleCBmb3JtYXRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5wdWIgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcHVia2V5IGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5wdWJFbmNvZGUocHVia2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhwdWJrZXksIDY0KTtcbiAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKHB1YmtleSwgJ2hleCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnB1YicsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBwcml2YXRlIGtleSBhcyBhbiBuc2VjXG4gKiBAcGFyYW0gcHJpdmtleSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuc2VjIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHByaXZrZXkgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnNlY0VuY29kZShwcml2a2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhwcml2a2V5LCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShwcml2a2V5LCAnaGV4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCduc2VjJywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBhbiBldmVudCBJRCBhcyBhIG5vdGVcbiAqIEBwYXJhbSBldmVudElkIEV2ZW50IElEIGluIGhleCBmb3JtYXRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5vdGUgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgZXZlbnRJZCBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3RlRW5jb2RlKGV2ZW50SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKGV2ZW50SWQsIDY0KTtcbiAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKGV2ZW50SWQsICdoZXgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25vdGUnLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIHByb2ZpbGUgaW5mb3JtYXRpb25cbiAqIEBwYXJhbSBwdWJrZXkgUHVibGljIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcGFyYW0gcmVsYXlzIE9wdGlvbmFsIHJlbGF5IFVSTHNcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5wcm9maWxlIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHB1YmtleSBpcyBpbnZhbGlkIG9yIHJlbGF5cyBhcmUgbWFsZm9ybWVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucHJvZmlsZUVuY29kZShwdWJrZXk6IHN0cmluZywgcmVsYXlzPzogc3RyaW5nW10pOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhwdWJrZXksIDY0KTtcbiAgaWYgKHJlbGF5cykge1xuICAgIHJlbGF5cy5mb3JFYWNoKHZhbGlkYXRlUmVsYXlVcmwpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25wcm9maWxlJyxcbiAgICBkYXRhOiBwdWJrZXksXG4gICAgcmVsYXlzXG4gIH0pO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnByb2ZpbGUnLCBkYXRhLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgZXZlbnQgaW5mb3JtYXRpb25cbiAqIEBwYXJhbSBldmVudElkIEV2ZW50IElEIGluIGhleCBmb3JtYXRcbiAqIEBwYXJhbSByZWxheXMgT3B0aW9uYWwgcmVsYXkgVVJMc1xuICogQHBhcmFtIGF1dGhvciBPcHRpb25hbCBhdXRob3IgcHVibGljIGtleVxuICogQHBhcmFtIGtpbmQgT3B0aW9uYWwgZXZlbnQga2luZFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbmV2ZW50IHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHBhcmFtZXRlcnMgYXJlIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ldmVudEVuY29kZShcbiAgZXZlbnRJZDogc3RyaW5nLFxuICByZWxheXM/OiBzdHJpbmdbXSxcbiAgYXV0aG9yPzogc3RyaW5nLFxuICBraW5kPzogbnVtYmVyXG4pOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhldmVudElkLCA2NCk7XG4gIGlmIChyZWxheXMpIHtcbiAgICByZWxheXMuZm9yRWFjaCh2YWxpZGF0ZVJlbGF5VXJsKTtcbiAgfVxuICBpZiAoYXV0aG9yKSB7XG4gICAgdmFsaWRhdGVIZXhTdHJpbmcoYXV0aG9yLCA2NCk7XG4gIH1cbiAgaWYgKGtpbmQgIT09IHVuZGVmaW5lZCAmJiAhTnVtYmVyLmlzSW50ZWdlcihraW5kKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBldmVudCBraW5kJyk7XG4gIH1cblxuICBjb25zdCBkYXRhID0gZW5jb2RlVExWKHtcbiAgICB0eXBlOiAnbmV2ZW50JyxcbiAgICBkYXRhOiBldmVudElkLFxuICAgIHJlbGF5cyxcbiAgICBhdXRob3IsXG4gICAga2luZFxuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25ldmVudCcsIGRhdGEsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBhbiBhZGRyZXNzIChOSVAtMzMpXG4gKiBAcGFyYW0gcHVia2V5IEF1dGhvcidzIHB1YmxpYyBrZXlcbiAqIEBwYXJhbSBraW5kIEV2ZW50IGtpbmRcbiAqIEBwYXJhbSBpZGVudGlmaWVyIFN0cmluZyBpZGVudGlmaWVyXG4gKiBAcGFyYW0gcmVsYXlzIE9wdGlvbmFsIHJlbGF5IFVSTHNcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5hZGRyIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHBhcmFtZXRlcnMgYXJlIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5hZGRyRW5jb2RlKFxuICBwdWJrZXk6IHN0cmluZyxcbiAga2luZDogbnVtYmVyLFxuICBpZGVudGlmaWVyOiBzdHJpbmcsXG4gIHJlbGF5cz86IHN0cmluZ1tdXG4pOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhwdWJrZXksIDY0KTtcbiAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGV2ZW50IGtpbmQnKTtcbiAgfVxuICBpZiAoIWlkZW50aWZpZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0lkZW50aWZpZXIgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAocmVsYXlzKSB7XG4gICAgcmVsYXlzLmZvckVhY2godmFsaWRhdGVSZWxheVVybCk7XG4gIH1cblxuICBjb25zdCBkYXRhID0gZW5jb2RlVExWKHtcbiAgICB0eXBlOiAnbmFkZHInLFxuICAgIGRhdGE6IHB1YmtleSxcbiAgICBraW5kLFxuICAgIGlkZW50aWZpZXIsXG4gICAgcmVsYXlzXG4gIH0pO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbmFkZHInLCBkYXRhLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYSByZWxheSBVUkxcbiAqIEBwYXJhbSB1cmwgUmVsYXkgVVJMXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucmVsYXkgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgVVJMIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5yZWxheUVuY29kZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlUmVsYXlVcmwodXJsKTtcbiAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKHVybCwgJ3V0ZjgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25yZWxheScsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBiZWNoMzItZW5jb2RlZCBOb3N0ciBlbnRpdHlcbiAqIEBwYXJhbSBzdHIgYmVjaDMyLWVuY29kZWQgc3RyaW5nXG4gKiBAcmV0dXJucyBEZWNvZGVkIGRhdGEgd2l0aCB0eXBlIGFuZCBtZXRhZGF0YVxuICogQHRocm93cyB7RXJyb3J9IElmIHN0cmluZyBpcyBpbnZhbGlkIG9yIG1hbGZvcm1lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlKHN0cjogc3RyaW5nKTogTmlwMTlEYXRhIHtcbiAgaWYgKCFzdHIuaW5jbHVkZXMoJzEnKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiZWNoMzIgc3RyaW5nJyk7XG4gIH1cblxuICBjb25zdCBwcmVmaXggPSBzdHIuc3BsaXQoJzEnKVswXS50b0xvd2VyQ2FzZSgpO1xuICBpZiAoIVZBTElEX1BSRUZJWEVTLmluY2x1ZGVzKHByZWZpeCBhcyBOaXAxOURhdGFUeXBlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwcmVmaXgnKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgZGVjb2RlZCA9IGJlY2gzMi5kZWNvZGUoc3RyLCAxMDAwKTtcbiAgICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20oYmVjaDMyLmZyb21Xb3JkcyhkZWNvZGVkLndvcmRzKSk7XG5cbiAgICAvLyBGb3IgbnJlbGF5IHR5cGVcbiAgICBsZXQgdXJsOiBzdHJpbmc7XG4gICAgLy8gRm9yIFRMViB0eXBlc1xuICAgIGxldCBkZWNvZGVkRGF0YTogTmlwMTlEYXRhO1xuXG4gICAgc3dpdGNoIChkZWNvZGVkLnByZWZpeCkge1xuICAgICAgY2FzZSAnbnB1Yic6XG4gICAgICBjYXNlICduc2VjJzpcbiAgICAgIGNhc2UgJ25vdGUnOlxuICAgICAgICB2YWxpZGF0ZUhleFN0cmluZyhkYXRhLnRvU3RyaW5nKCdoZXgnKSwgNjQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IGRlY29kZWQucHJlZml4IGFzIE5pcDE5RGF0YVR5cGUsXG4gICAgICAgICAgZGF0YTogZGF0YS50b1N0cmluZygnaGV4JylcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ25yZWxheSc6XG4gICAgICAgIHVybCA9IGRhdGEudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgdmFsaWRhdGVSZWxheVVybCh1cmwpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICducmVsYXknLFxuICAgICAgICAgIGRhdGE6IHVybFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnbnByb2ZpbGUnOlxuICAgICAgY2FzZSAnbmV2ZW50JzpcbiAgICAgIGNhc2UgJ25hZGRyJzpcbiAgICAgICAgZGVjb2RlZERhdGEgPSBkZWNvZGVUTFYoZGVjb2RlZC5wcmVmaXggYXMgTmlwMTlEYXRhVHlwZSwgZGF0YSk7XG4gICAgICAgIHJldHVybiBkZWNvZGVkRGF0YTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwcmVmaXgnKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmVjaDMyIHN0cmluZycpO1xuICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbnNcblxuZnVuY3Rpb24gdmFsaWRhdGVIZXhTdHJpbmcoc3RyOiBzdHJpbmcsIGxlbmd0aD86IG51bWJlcik6IHZvaWQge1xuICBpZiAoIS9eWzAtOWEtZkEtRl0rJC8udGVzdChzdHIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKTtcbiAgfVxuICBpZiAobGVuZ3RoICYmIHN0ci5sZW5ndGggIT09IGxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBoZXggc3RyaW5nIGxlbmd0aCAoZXhwZWN0ZWQgJHtsZW5ndGh9KWApO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUmVsYXlVcmwodXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMKHVybCk7XG4gICAgaWYgKCFbJ3dzOicsICd3c3M6J10uaW5jbHVkZXMocGFyc2VkLnByb3RvY29sKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlbGF5IFVSTCBwcm90b2NvbCcpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlbGF5IFVSTCcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZVRMVihkYXRhOiBOaXAxOURhdGEpOiBudW1iZXJbXSB7XG4gIGNvbnN0IHJlc3VsdDogbnVtYmVyW10gPSBbXTtcbiAgXG4gIC8vIFNwZWNpYWwgKHR5cGUgMCk6IG1haW4gZGF0YVxuICBjb25zdCBieXRlcyA9IEJ1ZmZlci5mcm9tKGRhdGEuZGF0YSwgJ2hleCcpO1xuICByZXN1bHQucHVzaChUTFZfVFlQRVMuU1BFQ0lBTCwgYnl0ZXMubGVuZ3RoKTtcbiAgcmVzdWx0LnB1c2goLi4uYnl0ZXMpO1xuXG4gIC8vIFJlbGF5ICh0eXBlIDEpOiByZWxheSBVUkxzXG4gIGlmIChkYXRhLnJlbGF5cz8ubGVuZ3RoKSB7XG4gICAgZm9yIChjb25zdCByZWxheSBvZiBkYXRhLnJlbGF5cykge1xuICAgICAgY29uc3QgcmVsYXlCeXRlcyA9IEJ1ZmZlci5mcm9tKHJlbGF5LCAndXRmOCcpO1xuICAgICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLlJFTEFZLCByZWxheUJ5dGVzLmxlbmd0aCk7XG4gICAgICByZXN1bHQucHVzaCguLi5yZWxheUJ5dGVzKTtcbiAgICB9XG4gIH1cblxuICAvLyBBdXRob3IgKHR5cGUgMik6IGF1dGhvciBwdWJrZXlcbiAgaWYgKGRhdGEuYXV0aG9yKSB7XG4gICAgY29uc3QgYXV0aG9yQnl0ZXMgPSBCdWZmZXIuZnJvbShkYXRhLmF1dGhvciwgJ2hleCcpO1xuICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5BVVRIT1IsIGF1dGhvckJ5dGVzLmxlbmd0aCk7XG4gICAgcmVzdWx0LnB1c2goLi4uYXV0aG9yQnl0ZXMpO1xuICB9XG5cbiAgLy8gS2luZCAodHlwZSAzKTogZXZlbnQga2luZFxuICBpZiAoZGF0YS5raW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBraW5kQnl0ZXMgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAga2luZEJ5dGVzLndyaXRlVUludDMyQkUoZGF0YS5raW5kKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuS0lORCwga2luZEJ5dGVzLmxlbmd0aCk7XG4gICAgcmVzdWx0LnB1c2goLi4ua2luZEJ5dGVzKTtcbiAgfVxuXG4gIC8vIElkZW50aWZpZXIgKHR5cGUgNCk6IGZvciBuYWRkclxuICBpZiAoZGF0YS5pZGVudGlmaWVyKSB7XG4gICAgY29uc3QgaWRlbnRpZmllckJ5dGVzID0gQnVmZmVyLmZyb20oZGF0YS5pZGVudGlmaWVyLCAndXRmOCcpO1xuICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5JREVOVElGSUVSLCBpZGVudGlmaWVyQnl0ZXMubGVuZ3RoKTtcbiAgICByZXN1bHQucHVzaCguLi5pZGVudGlmaWVyQnl0ZXMpO1xuICB9XG5cbiAgcmV0dXJuIGJlY2gzMi50b1dvcmRzKEJ1ZmZlci5mcm9tKHJlc3VsdCkpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUTFYocHJlZml4OiBOaXAxOURhdGFUeXBlLCBkYXRhOiBCdWZmZXIpOiBOaXAxOURhdGEge1xuICBjb25zdCByZXN1bHQ6IE5pcDE5RGF0YSA9IHtcbiAgICB0eXBlOiBwcmVmaXgsXG4gICAgZGF0YTogJycsXG4gICAgcmVsYXlzOiBbXVxuICB9O1xuXG4gIGxldCBpID0gMDtcbiAgLy8gRm9yIHJlbGF5IHR5cGVcbiAgbGV0IHJlbGF5OiBzdHJpbmc7XG5cbiAgd2hpbGUgKGkgPCBkYXRhLmxlbmd0aCkge1xuICAgIGNvbnN0IHR5cGUgPSBkYXRhW2ldO1xuICAgIGNvbnN0IGxlbmd0aCA9IGRhdGFbaSArIDFdO1xuICAgIFxuICAgIGlmIChpICsgMiArIGxlbmd0aCA+IGRhdGEubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgVExWIGRhdGEnKTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgdmFsdWUgPSBkYXRhLnNsaWNlKGkgKyAyLCBpICsgMiArIGxlbmd0aCk7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgVExWX1RZUEVTLlNQRUNJQUw6XG4gICAgICAgIHJlc3VsdC5kYXRhID0gdmFsdWUudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICB2YWxpZGF0ZUhleFN0cmluZyhyZXN1bHQuZGF0YSwgNjQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVExWX1RZUEVTLlJFTEFZOlxuICAgICAgICByZWxheSA9IHZhbHVlLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIHZhbGlkYXRlUmVsYXlVcmwocmVsYXkpO1xuICAgICAgICByZXN1bHQucmVsYXlzID0gcmVzdWx0LnJlbGF5cyB8fCBbXTtcbiAgICAgICAgcmVzdWx0LnJlbGF5cy5wdXNoKHJlbGF5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5BVVRIT1I6XG4gICAgICAgIHJlc3VsdC5hdXRob3IgPSB2YWx1ZS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgIHZhbGlkYXRlSGV4U3RyaW5nKHJlc3VsdC5hdXRob3IsIDY0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5LSU5EOlxuICAgICAgICByZXN1bHQua2luZCA9IHZhbHVlLnJlYWRVSW50MzJCRSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVExWX1RZUEVTLklERU5USUZJRVI6XG4gICAgICAgIHJlc3VsdC5pZGVudGlmaWVyID0gdmFsdWUudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBTa2lwIHVua25vd24gVExWIHR5cGVzXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGkgKz0gMiArIGxlbmd0aDtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCAiLyoqXG4gKiBOSVAtMjY6IERlbGVnYXRlZCBFdmVudCBTaWduaW5nXG4gKiBJbXBsZW1lbnRzIGRlbGVnYXRpb24gb2YgZXZlbnQgc2lnbmluZyBjYXBhYmlsaXRpZXNcbiAqL1xuXG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgTm9zdHJFdmVudCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IHNpZ25TY2hub3JyLCB2ZXJpZnlTY2hub3JyU2lnbmF0dXJlIH0gZnJvbSAnLi4vY3J5cHRvJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVsZWdhdGlvbkNvbmRpdGlvbnMge1xuICBraW5kPzogbnVtYmVyO1xuICBzaW5jZT86IG51bWJlcjtcbiAgdW50aWw/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVsZWdhdGlvbiB7XG4gIGRlbGVnYXRvcjogc3RyaW5nO1xuICBkZWxlZ2F0ZWU6IHN0cmluZztcbiAgY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnM7XG4gIHRva2VuOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVsZWdhdGlvbiB0b2tlblxuICogQHBhcmFtIGRlbGVnYXRvclByaXZhdGVLZXkgRGVsZWdhdG9yJ3MgcHJpdmF0ZSBrZXkgKHVzZWQgZm9yIHNpZ25pbmcgb25seSwgbmV2ZXIgcmV0dXJuZWQpXG4gKiBAcGFyYW0gZGVsZWdhdGVlIERlbGVnYXRlZSdzIHB1YmxpYyBrZXlcbiAqIEBwYXJhbSBjb25kaXRpb25zIERlbGVnYXRpb24gY29uZGl0aW9uc1xuICogQHJldHVybnMgRGVsZWdhdGlvbiB0b2tlbiAoZGVsZWdhdG9yIGZpZWxkIGNvbnRhaW5zIHRoZSBQVUJMSUMga2V5LCBub3QgdGhlIHByaXZhdGUga2V5KVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVsZWdhdGlvbihcbiAgZGVsZWdhdG9yUHJpdmF0ZUtleTogc3RyaW5nLFxuICBkZWxlZ2F0ZWU6IHN0cmluZyxcbiAgY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnNcbik6IERlbGVnYXRpb24ge1xuICBjb25zdCBjb25kaXRpb25zU3RyaW5nID0gc2VyaWFsaXplQ29uZGl0aW9ucyhjb25kaXRpb25zKTtcbiAgY29uc3QgdG9rZW4gPSBzaWduRGVsZWdhdGlvbihkZWxlZ2F0b3JQcml2YXRlS2V5LCBkZWxlZ2F0ZWUsIGNvbmRpdGlvbnNTdHJpbmcpO1xuXG4gIC8vIERlcml2ZSB0aGUgcHVibGljIGtleSBmcm9tIHRoZSBwcml2YXRlIGtleSBcdTIwMTQgTkVWRVIgcmV0dXJuIHRoZSBwcml2YXRlIGtleVxuICBjb25zdCBkZWxlZ2F0b3JQdWJsaWNLZXkgPSBieXRlc1RvSGV4KHNjaG5vcnIuZ2V0UHVibGljS2V5KGhleFRvQnl0ZXMoZGVsZWdhdG9yUHJpdmF0ZUtleSkpKTtcblxuICByZXR1cm4ge1xuICAgIGRlbGVnYXRvcjogZGVsZWdhdG9yUHVibGljS2V5LFxuICAgIGRlbGVnYXRlZSxcbiAgICBjb25kaXRpb25zLFxuICAgIHRva2VuXG4gIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgZGVsZWdhdGlvbiB0b2tlblxuICogQHBhcmFtIGRlbGVnYXRpb24gRGVsZWdhdGlvbiB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQsIGZhbHNlIG90aGVyd2lzZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5RGVsZWdhdGlvbihkZWxlZ2F0aW9uOiBEZWxlZ2F0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGNvbmRpdGlvbnNTdHJpbmcgPSBzZXJpYWxpemVDb25kaXRpb25zKGRlbGVnYXRpb24uY29uZGl0aW9ucyk7XG4gIHJldHVybiBhd2FpdCB2ZXJpZnlEZWxlZ2F0aW9uU2lnbmF0dXJlKFxuICAgIGRlbGVnYXRpb24uZGVsZWdhdG9yLFxuICAgIGRlbGVnYXRpb24uZGVsZWdhdGVlLFxuICAgIGNvbmRpdGlvbnNTdHJpbmcsXG4gICAgZGVsZWdhdGlvbi50b2tlblxuICApO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGV2ZW50IG1lZXRzIGRlbGVnYXRpb24gY29uZGl0aW9uc1xuICogQHBhcmFtIGV2ZW50IEV2ZW50IHRvIGNoZWNrXG4gKiBAcGFyYW0gY29uZGl0aW9ucyBEZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEByZXR1cm5zIFRydWUgaWYgY29uZGl0aW9ucyBhcmUgbWV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0RlbGVnYXRpb25Db25kaXRpb25zKFxuICBldmVudDogTm9zdHJFdmVudCxcbiAgY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnNcbik6IGJvb2xlYW4ge1xuICBpZiAoY29uZGl0aW9ucy5raW5kICE9PSB1bmRlZmluZWQgJiYgZXZlbnQua2luZCAhPT0gY29uZGl0aW9ucy5raW5kKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbmRpdGlvbnMuc2luY2UgIT09IHVuZGVmaW5lZCAmJiBldmVudC5jcmVhdGVkX2F0IDwgY29uZGl0aW9ucy5zaW5jZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb25kaXRpb25zLnVudGlsICE9PSB1bmRlZmluZWQgJiYgZXZlbnQuY3JlYXRlZF9hdCA+IGNvbmRpdGlvbnMudW50aWwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBZGQgZGVsZWdhdGlvbiB0YWcgdG8gYW4gZXZlbnRcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBhZGQgZGVsZWdhdGlvbiB0b1xuICogQHBhcmFtIGRlbGVnYXRpb24gRGVsZWdhdGlvbiB0byBhZGRcbiAqIEByZXR1cm5zIFVwZGF0ZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERlbGVnYXRpb25UYWcoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LFxuICBkZWxlZ2F0aW9uOiBEZWxlZ2F0aW9uXG4pOiBOb3N0ckV2ZW50IHtcbiAgY29uc3QgdGFnID0gW1xuICAgICdkZWxlZ2F0aW9uJyxcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRvcixcbiAgICBzZXJpYWxpemVDb25kaXRpb25zKGRlbGVnYXRpb24uY29uZGl0aW9ucyksXG4gICAgZGVsZWdhdGlvbi50b2tlblxuICBdO1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXZlbnQsXG4gICAgdGFnczogWy4uLmV2ZW50LnRhZ3MsIHRhZ11cbiAgfTtcbn1cblxuLyoqXG4gKiBFeHRyYWN0IGRlbGVnYXRpb24gZnJvbSBhbiBldmVudFxuICogQHBhcmFtIGV2ZW50IEV2ZW50IHRvIGV4dHJhY3QgZGVsZWdhdGlvbiBmcm9tXG4gKiBAcmV0dXJucyBEZWxlZ2F0aW9uIG9yIG51bGwgaWYgbm90IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RGVsZWdhdGlvbihldmVudDogTm9zdHJFdmVudCk6IERlbGVnYXRpb24gfCBudWxsIHtcbiAgY29uc3QgdGFnID0gZXZlbnQudGFncy5maW5kKHQgPT4gdFswXSA9PT0gJ2RlbGVnYXRpb24nKTtcbiAgaWYgKCF0YWcgfHwgdGFnLmxlbmd0aCAhPT0gNCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBkZWxlZ2F0b3I6IHRhZ1sxXSxcbiAgICBkZWxlZ2F0ZWU6IGV2ZW50LnB1YmtleSxcbiAgICBjb25kaXRpb25zOiBwYXJzZUNvbmRpdGlvbnModGFnWzJdKSxcbiAgICB0b2tlbjogdGFnWzNdXG4gIH07XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbnNcbmZ1bmN0aW9uIHNlcmlhbGl6ZUNvbmRpdGlvbnMoY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnMpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoY29uZGl0aW9ucy5raW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICBwYXJ0cy5wdXNoKGBraW5kPSR7Y29uZGl0aW9ucy5raW5kfWApO1xuICB9XG4gIGlmIChjb25kaXRpb25zLnNpbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwYXJ0cy5wdXNoKGBjcmVhdGVkX2F0PiR7Y29uZGl0aW9ucy5zaW5jZX1gKTtcbiAgfVxuICBpZiAoY29uZGl0aW9ucy51bnRpbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChgY3JlYXRlZF9hdDwke2NvbmRpdGlvbnMudW50aWx9YCk7XG4gIH1cblxuICByZXR1cm4gcGFydHMuam9pbignJicpO1xufVxuXG5mdW5jdGlvbiBwYXJzZUNvbmRpdGlvbnMoY29uZGl0aW9uc1N0cmluZzogc3RyaW5nKTogRGVsZWdhdGlvbkNvbmRpdGlvbnMge1xuICBjb25zdCBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucyA9IHt9O1xuICBjb25zdCBwYXJ0cyA9IGNvbmRpdGlvbnNTdHJpbmcuc3BsaXQoJyYnKTtcblxuICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICBpZiAocGFydC5zdGFydHNXaXRoKCdraW5kPScpKSB7XG4gICAgICBjb25kaXRpb25zLmtpbmQgPSBwYXJzZUludChwYXJ0LnNsaWNlKDUpKTtcbiAgICB9IGVsc2UgaWYgKHBhcnQuc3RhcnRzV2l0aCgnY3JlYXRlZF9hdD4nKSkge1xuICAgICAgY29uZGl0aW9ucy5zaW5jZSA9IHBhcnNlSW50KHBhcnQuc2xpY2UoMTEpKTtcbiAgICB9IGVsc2UgaWYgKHBhcnQuc3RhcnRzV2l0aCgnY3JlYXRlZF9hdDwnKSkge1xuICAgICAgY29uZGl0aW9ucy51bnRpbCA9IHBhcnNlSW50KHBhcnQuc2xpY2UoMTEpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZGl0aW9ucztcbn1cblxuZnVuY3Rpb24gc2lnbkRlbGVnYXRpb24oXG4gIGRlbGVnYXRvcjogc3RyaW5nLFxuICBkZWxlZ2F0ZWU6IHN0cmluZyxcbiAgY29uZGl0aW9uczogc3RyaW5nXG4pOiBzdHJpbmcge1xuICBjb25zdCBtZXNzYWdlID0gYG5vc3RyOmRlbGVnYXRpb246JHtkZWxlZ2F0ZWV9OiR7Y29uZGl0aW9uc31gO1xuICBjb25zdCBoYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShtZXNzYWdlKSk7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IHNpZ25TY2hub3JyKGhhc2gsIGhleFRvQnl0ZXMoZGVsZWdhdG9yKSk7XG4gIHJldHVybiBieXRlc1RvSGV4KHNpZ25hdHVyZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHZlcmlmeURlbGVnYXRpb25TaWduYXR1cmUoXG4gIGRlbGVnYXRvcjogc3RyaW5nLFxuICBkZWxlZ2F0ZWU6IHN0cmluZyxcbiAgY29uZGl0aW9uczogc3RyaW5nLFxuICBzaWduYXR1cmU6IHN0cmluZ1xuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IG1zZ0hhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGBub3N0cjpkZWxlZ2F0aW9uOiR7ZGVsZWdhdGVlfToke2NvbmRpdGlvbnN9YCkpO1xuXG4gIHJldHVybiB2ZXJpZnlTY2hub3JyU2lnbmF0dXJlKGhleFRvQnl0ZXMoc2lnbmF0dXJlKSwgbXNnSGFzaCwgaGV4VG9CeXRlcyhkZWxlZ2F0b3IpKTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtNDRcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtNDQgKFZlcnNpb25lZCBFbmNyeXB0ZWQgUGF5bG9hZHMpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ0Lm1kXG4gKi9cblxuaW1wb3J0IHsgY2hhY2hhMjAgfSBmcm9tICdAbm9ibGUvY2lwaGVycy9jaGFjaGEuanMnO1xuaW1wb3J0IHsgZXF1YWxCeXRlcyB9IGZyb20gJ0Bub2JsZS9jaXBoZXJzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGV4dHJhY3QgYXMgaGtkZl9leHRyYWN0LCBleHBhbmQgYXMgaGtkZl9leHBhbmQgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2hrZGYuanMnO1xuaW1wb3J0IHsgaG1hYyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvaG1hYy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgY29uY2F0Qnl0ZXMsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBiYXNlNjQgfSBmcm9tICdAc2N1cmUvYmFzZSc7XG5cbmNvbnN0IHV0ZjhFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5jb25zdCB1dGY4RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuXG5jb25zdCBtaW5QbGFpbnRleHRTaXplID0gMTtcbmNvbnN0IG1heFBsYWludGV4dFNpemUgPSA2NTUzNTtcblxuLyoqXG4gKiBDYWxjdWxhdGUgcGFkZGVkIGxlbmd0aCBmb3IgTklQLTQ0IG1lc3NhZ2UgcGFkZGluZ1xuICovXG5mdW5jdGlvbiBjYWxjUGFkZGVkTGVuKGxlbjogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihsZW4pIHx8IGxlbiA8IDEpIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgcG9zaXRpdmUgaW50ZWdlcicpO1xuICBpZiAobGVuIDw9IDMyKSByZXR1cm4gMzI7XG4gIGNvbnN0IG5leHRQb3dlciA9IDEgPDwgKE1hdGguZmxvb3IoTWF0aC5sb2cyKGxlbiAtIDEpKSArIDEpO1xuICBjb25zdCBjaHVuayA9IG5leHRQb3dlciA8PSAyNTYgPyAzMiA6IG5leHRQb3dlciAvIDg7XG4gIHJldHVybiBjaHVuayAqIChNYXRoLmZsb29yKChsZW4gLSAxKSAvIGNodW5rKSArIDEpO1xufVxuXG4vKipcbiAqIFBhZCBwbGFpbnRleHQgcGVyIE5JUC00NCBzcGVjXG4gKi9cbmZ1bmN0aW9uIHBhZChwbGFpbnRleHQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCB1bnBhZGRlZCA9IHV0ZjhFbmNvZGVyLmVuY29kZShwbGFpbnRleHQpO1xuICBjb25zdCB1bnBhZGRlZExlbiA9IHVucGFkZGVkLmxlbmd0aDtcbiAgaWYgKHVucGFkZGVkTGVuIDwgbWluUGxhaW50ZXh0U2l6ZSB8fCB1bnBhZGRlZExlbiA+IG1heFBsYWludGV4dFNpemUpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBsYWludGV4dCBsZW5ndGg6IG11c3QgYmUgYmV0d2VlbiAxIGFuZCA2NTUzNSBieXRlcycpO1xuICBjb25zdCBwcmVmaXggPSBuZXcgVWludDhBcnJheSgyKTtcbiAgbmV3IERhdGFWaWV3KHByZWZpeC5idWZmZXIpLnNldFVpbnQxNigwLCB1bnBhZGRlZExlbiwgZmFsc2UpOyAvLyBiaWctZW5kaWFuXG4gIGNvbnN0IHN1ZmZpeCA9IG5ldyBVaW50OEFycmF5KGNhbGNQYWRkZWRMZW4odW5wYWRkZWRMZW4pIC0gdW5wYWRkZWRMZW4pO1xuICByZXR1cm4gY29uY2F0Qnl0ZXMocHJlZml4LCB1bnBhZGRlZCwgc3VmZml4KTtcbn1cblxuLyoqXG4gKiBVbnBhZCBkZWNyeXB0ZWQgbWVzc2FnZSBwZXIgTklQLTQ0IHNwZWNcbiAqL1xuZnVuY3Rpb24gdW5wYWQocGFkZGVkOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgY29uc3QgdW5wYWRkZWRMZW4gPSBuZXcgRGF0YVZpZXcocGFkZGVkLmJ1ZmZlciwgcGFkZGVkLmJ5dGVPZmZzZXQpLmdldFVpbnQxNigwLCBmYWxzZSk7XG4gIGNvbnN0IHVucGFkZGVkID0gcGFkZGVkLnN1YmFycmF5KDIsIDIgKyB1bnBhZGRlZExlbik7XG4gIGlmIChcbiAgICB1bnBhZGRlZExlbiA8IG1pblBsYWludGV4dFNpemUgfHxcbiAgICB1bnBhZGRlZExlbiA+IG1heFBsYWludGV4dFNpemUgfHxcbiAgICB1bnBhZGRlZC5sZW5ndGggIT09IHVucGFkZGVkTGVuIHx8XG4gICAgcGFkZGVkLmxlbmd0aCAhPT0gMiArIGNhbGNQYWRkZWRMZW4odW5wYWRkZWRMZW4pXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwYWRkaW5nJyk7XG4gIH1cbiAgcmV0dXJuIHV0ZjhEZWNvZGVyLmRlY29kZSh1bnBhZGRlZCk7XG59XG5cbi8qKlxuICogRGVyaXZlIGNvbnZlcnNhdGlvbiBrZXkgZnJvbSBwcml2YXRlIGtleSBhbmQgcHVibGljIGtleSB1c2luZyBFQ0RIICsgSEtERlxuICovXG5mdW5jdGlvbiBnZXRDb252ZXJzYXRpb25LZXkocHJpdmtleUE6IFVpbnQ4QXJyYXksIHB1YmtleUI6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQocHJpdmtleUEsIGhleFRvQnl0ZXMoJzAyJyArIHB1YmtleUIpKTtcbiAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnN1YmFycmF5KDEsIDMzKTtcbiAgcmV0dXJuIGhrZGZfZXh0cmFjdChzaGEyNTYsIHNoYXJlZFgsIHV0ZjhFbmNvZGVyLmVuY29kZSgnbmlwNDQtdjInKSk7XG59XG5cbi8qKlxuICogRGVyaXZlIG1lc3NhZ2Uga2V5cyAoY2hhY2hhIGtleSwgY2hhY2hhIG5vbmNlLCBobWFjIGtleSkgZnJvbSBjb252ZXJzYXRpb24ga2V5IGFuZCBub25jZVxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlS2V5cyhjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXksIG5vbmNlOiBVaW50OEFycmF5KToge1xuICBjaGFjaGFfa2V5OiBVaW50OEFycmF5O1xuICBjaGFjaGFfbm9uY2U6IFVpbnQ4QXJyYXk7XG4gIGhtYWNfa2V5OiBVaW50OEFycmF5O1xufSB7XG4gIGNvbnN0IGtleXMgPSBoa2RmX2V4cGFuZChzaGEyNTYsIGNvbnZlcnNhdGlvbktleSwgbm9uY2UsIDc2KTtcbiAgcmV0dXJuIHtcbiAgICBjaGFjaGFfa2V5OiBrZXlzLnN1YmFycmF5KDAsIDMyKSxcbiAgICBjaGFjaGFfbm9uY2U6IGtleXMuc3ViYXJyYXkoMzIsIDQ0KSxcbiAgICBobWFjX2tleToga2V5cy5zdWJhcnJheSg0NCwgNzYpLFxuICB9O1xufVxuXG4vKipcbiAqIEVuY3J5cHQgcGxhaW50ZXh0IHVzaW5nIE5JUC00NCB2MlxuICogQHBhcmFtIHBsYWludGV4dCAtIFRoZSBtZXNzYWdlIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSBjb252ZXJzYXRpb25LZXkgLSAzMi1ieXRlIGNvbnZlcnNhdGlvbiBrZXkgZnJvbSBnZXRDb252ZXJzYXRpb25LZXlcbiAqIEBwYXJhbSBub25jZSAtIE9wdGlvbmFsIDMyLWJ5dGUgbm9uY2UgKHJhbmRvbSBpZiBub3QgcHJvdmlkZWQpXG4gKiBAcmV0dXJucyBCYXNlNjQtZW5jb2RlZCBlbmNyeXB0ZWQgcGF5bG9hZFxuICovXG5mdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dDogc3RyaW5nLCBjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXksIG5vbmNlOiBVaW50OEFycmF5ID0gcmFuZG9tQnl0ZXMoMzIpKTogc3RyaW5nIHtcbiAgY29uc3QgeyBjaGFjaGFfa2V5LCBjaGFjaGFfbm9uY2UsIGhtYWNfa2V5IH0gPSBnZXRNZXNzYWdlS2V5cyhjb252ZXJzYXRpb25LZXksIG5vbmNlKTtcbiAgY29uc3QgcGFkZGVkID0gcGFkKHBsYWludGV4dCk7XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBjaGFjaGEyMChjaGFjaGFfa2V5LCBjaGFjaGFfbm9uY2UsIHBhZGRlZCk7XG4gIGNvbnN0IG1hYyA9IGhtYWMoc2hhMjU2LCBobWFjX2tleSwgY29uY2F0Qnl0ZXMobm9uY2UsIGNpcGhlcnRleHQpKTtcbiAgcmV0dXJuIGJhc2U2NC5lbmNvZGUoY29uY2F0Qnl0ZXMobmV3IFVpbnQ4QXJyYXkoWzJdKSwgbm9uY2UsIGNpcGhlcnRleHQsIG1hYykpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYSBOSVAtNDQgdjIgcGF5bG9hZFxuICogQHBhcmFtIHBheWxvYWQgLSBCYXNlNjQtZW5jb2RlZCBlbmNyeXB0ZWQgcGF5bG9hZFxuICogQHBhcmFtIGNvbnZlcnNhdGlvbktleSAtIDMyLWJ5dGUgY29udmVyc2F0aW9uIGtleSBmcm9tIGdldENvbnZlcnNhdGlvbktleVxuICogQHJldHVybnMgRGVjcnlwdGVkIHBsYWludGV4dCBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZGVjcnlwdChwYXlsb2FkOiBzdHJpbmcsIGNvbnZlcnNhdGlvbktleTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBiYXNlNjQuZGVjb2RlKHBheWxvYWQpO1xuICBjb25zdCB2ZXJzaW9uID0gZGF0YVswXTtcbiAgaWYgKHZlcnNpb24gIT09IDIpIHRocm93IG5ldyBFcnJvcihgdW5rbm93biBlbmNyeXB0aW9uIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcbiAgaWYgKGRhdGEubGVuZ3RoIDwgOTkgfHwgZGF0YS5sZW5ndGggPiA2NTYwMykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBheWxvYWQgc2l6ZScpO1xuICBjb25zdCBub25jZSA9IGRhdGEuc3ViYXJyYXkoMSwgMzMpO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gZGF0YS5zdWJhcnJheSgzMywgZGF0YS5sZW5ndGggLSAzMik7XG4gIGNvbnN0IG1hYyA9IGRhdGEuc3ViYXJyYXkoZGF0YS5sZW5ndGggLSAzMik7XG4gIGNvbnN0IHsgY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBobWFjX2tleSB9ID0gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5LCBub25jZSk7XG4gIGNvbnN0IGV4cGVjdGVkTWFjID0gaG1hYyhzaGEyNTYsIGhtYWNfa2V5LCBjb25jYXRCeXRlcyhub25jZSwgY2lwaGVydGV4dCkpO1xuICBpZiAoIWVxdWFsQnl0ZXMobWFjLCBleHBlY3RlZE1hYykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBNQUMnKTtcbiAgY29uc3QgcGFkZGVkID0gY2hhY2hhMjAoY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBjaXBoZXJ0ZXh0KTtcbiAgcmV0dXJuIHVucGFkKHBhZGRlZCk7XG59XG5cbi8qKlxuICogdjIgQVBJIG9iamVjdCBtYXRjaGluZyBub3N0ci10b29scyBzaGFwZSBmb3IgY29tcGF0aWJpbGl0eVxuICovXG5leHBvcnQgY29uc3QgdjIgPSB7XG4gIHV0aWxzOiB7XG4gICAgZ2V0Q29udmVyc2F0aW9uS2V5LFxuICAgIGNhbGNQYWRkZWRMZW4sXG4gIH0sXG4gIGVuY3J5cHQsXG4gIGRlY3J5cHQsXG59O1xuXG5leHBvcnQgeyBnZXRDb252ZXJzYXRpb25LZXksIGVuY3J5cHQsIGRlY3J5cHQsIGNhbGNQYWRkZWRMZW4gfTtcbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtNDZcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtNDYgKE5vc3RyIENvbm5lY3QgLyBSZW1vdGUgU2lnbmluZylcbiAqXG4gKiBQdXJlIHByb3RvY29sIGxheWVyIFx1MjAxNCBjcnlwdG8sIGVuY29kaW5nLCBtZXNzYWdlIGZvcm1hdHRpbmcuXG4gKiBObyBXZWJTb2NrZXQsIG5vIHJlbGF5IGNvbm5lY3Rpb25zLCBubyBJL08uXG4gKiBDb25zdW1lcnMgcHJvdmlkZSB0aGVpciBvd24gdHJhbnNwb3J0LlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDYubWRcbiAqL1xuXG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQge1xuICBnZXRDb252ZXJzYXRpb25LZXkgYXMgbmlwNDRHZXRDb252ZXJzYXRpb25LZXksXG4gIGVuY3J5cHQgYXMgbmlwNDRFbmNyeXB0LFxuICBkZWNyeXB0IGFzIG5pcDQ0RGVjcnlwdCxcbn0gZnJvbSAnLi9uaXAtNDQnO1xuaW1wb3J0IHR5cGUge1xuICBCdW5rZXJVUkksXG4gIEJ1bmtlclZhbGlkYXRpb25SZXN1bHQsXG4gIE5pcDQ2UmVxdWVzdCxcbiAgTmlwNDZSZXNwb25zZSxcbiAgTmlwNDZTZXNzaW9uLFxuICBOaXA0NlNlc3Npb25JbmZvLFxuICBTaWduZWROb3N0ckV2ZW50LFxufSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBOaXA0Nk1ldGhvZCB9IGZyb20gJy4uL3R5cGVzJztcblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDEuIEJ1bmtlciBVUkkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogUGFyc2UgYSBidW5rZXI6Ly8gVVJJIGludG8gaXRzIGNvbXBvbmVudHNcbiAqIEBwYXJhbSB1cmkgLSBidW5rZXI6Ly8mbHQ7cmVtb3RlLXB1YmtleSZndDs/cmVsYXk9Li4uJnNlY3JldD0uLi5cbiAqIEByZXR1cm5zIFBhcnNlZCBCdW5rZXJVUkkgb3IgdGhyb3dzIG9uIGludmFsaWQgaW5wdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQnVua2VyVVJJKHVyaTogc3RyaW5nKTogQnVua2VyVVJJIHtcbiAgaWYgKCF1cmkuc3RhcnRzV2l0aCgnYnVua2VyOi8vJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogbXVzdCBzdGFydCB3aXRoIGJ1bmtlcjovLycpO1xuICB9XG5cbiAgY29uc3QgdXJsID0gbmV3IFVSTCh1cmkucmVwbGFjZSgnYnVua2VyOi8vJywgJ2h0dHBzOi8vJykpO1xuICBjb25zdCByZW1vdGVQdWJrZXkgPSB1cmwuaG9zdG5hbWU7XG5cbiAgaWYgKCEvXlswLTlhLWZdezY0fSQvLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBidW5rZXIgVVJJOiByZW1vdGUgcHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgfVxuXG4gIGNvbnN0IHJlbGF5cyA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0QWxsKCdyZWxheScpO1xuICBpZiAocmVsYXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBidW5rZXIgVVJJOiBhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGNvbnN0IHNlY3JldCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdzZWNyZXQnKSB8fCB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIHsgcmVtb3RlUHVia2V5LCByZWxheXMsIHNlY3JldCB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGJ1bmtlcjovLyBVUkkgc3RyaW5nXG4gKiBAcGFyYW0gcmVtb3RlUHVia2V5IC0gUmVtb3RlIHNpZ25lcidzIHB1YmxpYyBrZXkgKGhleClcbiAqIEBwYXJhbSByZWxheXMgLSBSZWxheSBVUkxzXG4gKiBAcGFyYW0gc2VjcmV0IC0gT3B0aW9uYWwgY29ubmVjdGlvbiBzZWNyZXRcbiAqIEByZXR1cm5zIGJ1bmtlcjovLyBVUkkgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCdW5rZXJVUkkocmVtb3RlUHVia2V5OiBzdHJpbmcsIHJlbGF5czogc3RyaW5nW10sIHNlY3JldD86IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghL15bMC05YS1mXXs2NH0kLy50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW90ZVB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gIH1cbiAgaWYgKHJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2F0IGxlYXN0IG9uZSByZWxheSBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgY29uc3QgcGFyYW1zID0gcmVsYXlzLm1hcChyID0+IGByZWxheT0ke2VuY29kZVVSSUNvbXBvbmVudChyKX1gKTtcbiAgaWYgKHNlY3JldCkge1xuICAgIHBhcmFtcy5wdXNoKGBzZWNyZXQ9JHtlbmNvZGVVUklDb21wb25lbnQoc2VjcmV0KX1gKTtcbiAgfVxuXG4gIHJldHVybiBgYnVua2VyOi8vJHtyZW1vdGVQdWJrZXl9PyR7cGFyYW1zLmpvaW4oJyYnKX1gO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGEgYnVua2VyOi8vIFVSSSBhbmQgcmV0dXJuIHN0cnVjdHVyZWQgcmVzdWx0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJ1bmtlclVSSSh1cmk6IHN0cmluZyk6IEJ1bmtlclZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQnVua2VyVVJJKHVyaSk7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgdXJpOiBwYXJzZWQgfTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogKGUgYXMgRXJyb3IpLm1lc3NhZ2UgfTtcbiAgfVxufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgMi4gU2Vzc2lvbiBNYW5hZ2VtZW50IFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBOSVAtNDYgc2Vzc2lvbiB3aXRoIGFuIGVwaGVtZXJhbCBrZXlwYWlyXG4gKiBAcGFyYW0gcmVtb3RlUHVia2V5IC0gUmVtb3RlIHNpZ25lcidzIHB1YmxpYyBrZXkgKGhleClcbiAqIEByZXR1cm5zIFNlc3Npb24gY29udGFpbmluZyBlcGhlbWVyYWwga2V5cyBhbmQgTklQLTQ0IGNvbnZlcnNhdGlvbiBrZXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb24ocmVtb3RlUHVia2V5OiBzdHJpbmcpOiBOaXA0NlNlc3Npb24ge1xuICBpZiAoIS9eWzAtOWEtZl17NjR9JC8udGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdGVQdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICB9XG5cbiAgY29uc3QgY2xpZW50U2VjcmV0S2V5Qnl0ZXMgPSByYW5kb21CeXRlcygzMik7XG4gIGNvbnN0IGNsaWVudFNlY3JldEtleSA9IGJ5dGVzVG9IZXgoY2xpZW50U2VjcmV0S2V5Qnl0ZXMpO1xuICBjb25zdCBjbGllbnRQdWJrZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzKTtcbiAgY29uc3QgY2xpZW50UHVia2V5ID0gYnl0ZXNUb0hleChjbGllbnRQdWJrZXlCeXRlcyk7XG5cbiAgY29uc3QgY29udmVyc2F0aW9uS2V5ID0gbmlwNDRHZXRDb252ZXJzYXRpb25LZXkoY2xpZW50U2VjcmV0S2V5Qnl0ZXMsIHJlbW90ZVB1YmtleSk7XG5cbiAgcmV0dXJuIHtcbiAgICBjbGllbnRTZWNyZXRLZXksXG4gICAgY2xpZW50UHVia2V5LFxuICAgIHJlbW90ZVB1YmtleSxcbiAgICBjb252ZXJzYXRpb25LZXksXG4gIH07XG59XG5cbi8qKlxuICogUmVzdG9yZSBhIHNlc3Npb24gZnJvbSBhIHByZXZpb3VzbHkgc2F2ZWQgZXBoZW1lcmFsIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gY2xpZW50U2VjcmV0S2V5IC0gSGV4LWVuY29kZWQgZXBoZW1lcmFsIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gcmVtb3RlUHVia2V5IC0gUmVtb3RlIHNpZ25lcidzIHB1YmxpYyBrZXkgKGhleClcbiAqIEByZXR1cm5zIFJlc3RvcmVkIHNlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVTZXNzaW9uKGNsaWVudFNlY3JldEtleTogc3RyaW5nLCByZW1vdGVQdWJrZXk6IHN0cmluZyk6IE5pcDQ2U2Vzc2lvbiB7XG4gIGNvbnN0IGNsaWVudFNlY3JldEtleUJ5dGVzID0gaGV4VG9CeXRlcyhjbGllbnRTZWNyZXRLZXkpO1xuICBjb25zdCBjbGllbnRQdWJrZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzKTtcbiAgY29uc3QgY2xpZW50UHVia2V5ID0gYnl0ZXNUb0hleChjbGllbnRQdWJrZXlCeXRlcyk7XG5cbiAgY29uc3QgY29udmVyc2F0aW9uS2V5ID0gbmlwNDRHZXRDb252ZXJzYXRpb25LZXkoY2xpZW50U2VjcmV0S2V5Qnl0ZXMsIHJlbW90ZVB1YmtleSk7XG5cbiAgcmV0dXJuIHtcbiAgICBjbGllbnRTZWNyZXRLZXksXG4gICAgY2xpZW50UHVia2V5LFxuICAgIHJlbW90ZVB1YmtleSxcbiAgICBjb252ZXJzYXRpb25LZXksXG4gIH07XG59XG5cbi8qKlxuICogR2V0IHB1YmxpYyBzZXNzaW9uIGluZm8gKHNhZmUgdG8gZXhwb3NlKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Vzc2lvbkluZm8oc2Vzc2lvbjogTmlwNDZTZXNzaW9uKTogTmlwNDZTZXNzaW9uSW5mbyB7XG4gIHJldHVybiB7XG4gICAgY2xpZW50UHVia2V5OiBzZXNzaW9uLmNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXk6IHNlc3Npb24ucmVtb3RlUHVia2V5LFxuICB9O1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgMy4gSlNPTi1SUEMgTWVzc2FnZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogQ3JlYXRlIGEgTklQLTQ2IEpTT04tUlBDIHJlcXVlc3RcbiAqIEBwYXJhbSBtZXRob2QgLSBSUEMgbWV0aG9kIG5hbWVcbiAqIEBwYXJhbSBwYXJhbXMgLSBBcnJheSBvZiBzdHJpbmcgcGFyYW1ldGVyc1xuICogQHBhcmFtIGlkIC0gT3B0aW9uYWwgcmVxdWVzdCBJRCAocmFuZG9tIGlmIG5vdCBwcm92aWRlZClcbiAqIEByZXR1cm5zIEpTT04tUlBDIHJlcXVlc3Qgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXF1ZXN0KG1ldGhvZDogTmlwNDZNZXRob2QgfCBzdHJpbmcsIHBhcmFtczogc3RyaW5nW10sIGlkPzogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIHtcbiAgICBpZDogaWQgfHwgYnl0ZXNUb0hleChyYW5kb21CeXRlcygxNikpLFxuICAgIG1ldGhvZCxcbiAgICBwYXJhbXMsXG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgTklQLTQ2IEpTT04tUlBDIHJlc3BvbnNlXG4gKiBAcGFyYW0gaWQgLSBSZXF1ZXN0IElEIGJlaW5nIHJlc3BvbmRlZCB0b1xuICogQHBhcmFtIHJlc3VsdCAtIFJlc3VsdCBzdHJpbmcgKG9uIHN1Y2Nlc3MpXG4gKiBAcGFyYW0gZXJyb3IgLSBFcnJvciBzdHJpbmcgKG9uIGZhaWx1cmUpXG4gKiBAcmV0dXJucyBKU09OLVJQQyByZXNwb25zZSBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlc3BvbnNlKGlkOiBzdHJpbmcsIHJlc3VsdD86IHN0cmluZywgZXJyb3I/OiBzdHJpbmcpOiBOaXA0NlJlc3BvbnNlIHtcbiAgY29uc3QgcmVzcG9uc2U6IE5pcDQ2UmVzcG9uc2UgPSB7IGlkIH07XG4gIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkgcmVzcG9uc2UucmVzdWx0ID0gcmVzdWx0O1xuICBpZiAoZXJyb3IgIT09IHVuZGVmaW5lZCkgcmVzcG9uc2UuZXJyb3IgPSBlcnJvcjtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgSlNPTiBzdHJpbmcgaW50byBhIE5JUC00NiByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ganNvbiAtIEpTT04gc3RyaW5nIHRvIHBhcnNlXG4gKiBAcmV0dXJucyBQYXJzZWQgcmVxdWVzdCBvciByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQYXlsb2FkKGpzb246IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2Uge1xuICBjb25zdCBvYmogPSBKU09OLnBhcnNlKGpzb24pIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAodHlwZW9mIG9iai5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgTklQLTQ2IHBheWxvYWQ6IG1pc3NpbmcgaWQnKTtcbiAgfVxuICByZXR1cm4gb2JqIGFzIHVua25vd24gYXMgTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHBheWxvYWQgaXMgYSBOSVAtNDYgcmVxdWVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXF1ZXN0KHBheWxvYWQ6IE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2UpOiBwYXlsb2FkIGlzIE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiAnbWV0aG9kJyBpbiBwYXlsb2FkICYmICdwYXJhbXMnIGluIHBheWxvYWQ7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwYXlsb2FkIGlzIGEgTklQLTQ2IHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jlc3BvbnNlKHBheWxvYWQ6IE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2UpOiBwYXlsb2FkIGlzIE5pcDQ2UmVzcG9uc2Uge1xuICByZXR1cm4gJ3Jlc3VsdCcgaW4gcGF5bG9hZCB8fCAnZXJyb3InIGluIHBheWxvYWQ7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCA0LiBFdmVudCBXcmFwcGluZyAoS2luZCAyNDEzMykgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogRW5jcnlwdCBhbmQgd3JhcCBhIE5JUC00NiBwYXlsb2FkIGludG8gYSBraW5kIDI0MTMzIHNpZ25lZCBldmVudFxuICogQHBhcmFtIHBheWxvYWQgLSBKU09OLVJQQyByZXF1ZXN0IG9yIHJlc3BvbnNlIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSBzZXNzaW9uIC0gTklQLTQ2IHNlc3Npb25cbiAqIEBwYXJhbSByZWNpcGllbnRQdWJrZXkgLSBUaGUgcmVjaXBpZW50J3MgcHVia2V5IChoZXgpXG4gKiBAcmV0dXJucyBTaWduZWQga2luZCAyNDEzMyBldmVudFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcEV2ZW50KFxuICBwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlLFxuICBzZXNzaW9uOiBOaXA0NlNlc3Npb24sXG4gIHJlY2lwaWVudFB1YmtleTogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICBjb25zdCBlbmNyeXB0ZWQgPSBuaXA0NEVuY3J5cHQoanNvbiwgc2Vzc2lvbi5jb252ZXJzYXRpb25LZXkpO1xuXG4gIGNvbnN0IGNyZWF0ZWRfYXQgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcbiAgY29uc3QgZXZlbnQgPSB7XG4gICAga2luZDogMjQxMzMsXG4gICAgY3JlYXRlZF9hdCxcbiAgICB0YWdzOiBbWydwJywgcmVjaXBpZW50UHVia2V5XV0sXG4gICAgY29udGVudDogZW5jcnlwdGVkLFxuICAgIHB1YmtleTogc2Vzc2lvbi5jbGllbnRQdWJrZXksXG4gIH07XG5cbiAgLy8gU2VyaWFsaXplIGZvciBOSVAtMDEgZXZlbnQgSURcbiAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAwLFxuICAgIGV2ZW50LnB1YmtleSxcbiAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgIGV2ZW50LmtpbmQsXG4gICAgZXZlbnQudGFncyxcbiAgICBldmVudC5jb250ZW50LFxuICBdKTtcblxuICBjb25zdCBldmVudEhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gaGV4VG9CeXRlcyhzZXNzaW9uLmNsaWVudFNlY3JldEtleSk7XG4gIGNvbnN0IHNpZ25hdHVyZUJ5dGVzID0gc2Nobm9yci5zaWduKGV2ZW50SGFzaCwgcHJpdmF0ZUtleUJ5dGVzKTtcblxuICByZXR1cm4ge1xuICAgIC4uLmV2ZW50LFxuICAgIGlkOiBieXRlc1RvSGV4KGV2ZW50SGFzaCksXG4gICAgc2lnOiBieXRlc1RvSGV4KHNpZ25hdHVyZUJ5dGVzKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGFuZCBwYXJzZSBhIGtpbmQgMjQxMzMgZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIFNpZ25lZCBraW5kIDI0MTMzIGV2ZW50XG4gKiBAcGFyYW0gc2Vzc2lvbiAtIE5JUC00NiBzZXNzaW9uXG4gKiBAcmV0dXJucyBEZWNyeXB0ZWQgSlNPTi1SUEMgcmVxdWVzdCBvciByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwRXZlbnQoXG4gIGV2ZW50OiBTaWduZWROb3N0ckV2ZW50LFxuICBzZXNzaW9uOiBOaXA0NlNlc3Npb25cbik6IE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2Uge1xuICBpZiAoZXZlbnQua2luZCAhPT0gMjQxMzMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGV4cGVjdGVkIGtpbmQgMjQxMzMsIGdvdCAke2V2ZW50LmtpbmR9YCk7XG4gIH1cblxuICBjb25zdCBqc29uID0gbmlwNDREZWNyeXB0KGV2ZW50LmNvbnRlbnQsIHNlc3Npb24uY29udmVyc2F0aW9uS2V5KTtcbiAgcmV0dXJuIHBhcnNlUGF5bG9hZChqc29uKTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDUuIENvbnZlbmllbmNlIFJlcXVlc3QgQ3JlYXRvcnMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogQ3JlYXRlIGEgJ2Nvbm5lY3QnIHJlcXVlc3RcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVia2V5XG4gKiBAcGFyYW0gc2VjcmV0IC0gT3B0aW9uYWwgY29ubmVjdGlvbiBzZWNyZXQgZnJvbSBidW5rZXIgVVJJXG4gKiBAcGFyYW0gcGVybWlzc2lvbnMgLSBPcHRpb25hbCBjb21tYS1zZXBhcmF0ZWQgcGVybWlzc2lvbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RSZXF1ZXN0KHJlbW90ZVB1YmtleTogc3RyaW5nLCBzZWNyZXQ/OiBzdHJpbmcsIHBlcm1pc3Npb25zPzogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgY29uc3QgcGFyYW1zID0gW3JlbW90ZVB1YmtleV07XG4gIGlmIChzZWNyZXQpIHBhcmFtcy5wdXNoKHNlY3JldCk7XG4gIGVsc2UgaWYgKHBlcm1pc3Npb25zKSBwYXJhbXMucHVzaCgnJyk7XG4gIGlmIChwZXJtaXNzaW9ucykgcGFyYW1zLnB1c2gocGVybWlzc2lvbnMpO1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5DT05ORUNULCBwYXJhbXMpO1xufVxuXG4vKiogQ3JlYXRlIGEgJ3BpbmcnIHJlcXVlc3QgKi9cbmV4cG9ydCBmdW5jdGlvbiBwaW5nUmVxdWVzdCgpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5QSU5HLCBbXSk7XG59XG5cbi8qKiBDcmVhdGUgYSAnZ2V0X3B1YmxpY19rZXknIHJlcXVlc3QgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQdWJsaWNLZXlSZXF1ZXN0KCk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLkdFVF9QVUJMSUNfS0VZLCBbXSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ3NpZ25fZXZlbnQnIHJlcXVlc3RcbiAqIEBwYXJhbSBldmVudEpzb24gLSBKU09OLXN0cmluZ2lmaWVkIHVuc2lnbmVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaWduRXZlbnRSZXF1ZXN0KGV2ZW50SnNvbjogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuU0lHTl9FVkVOVCwgW2V2ZW50SnNvbl0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXAwNF9lbmNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2UgcmVjaXBpZW50XG4gKiBAcGFyYW0gcGxhaW50ZXh0IC0gTWVzc2FnZSB0byBlbmNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXAwNEVuY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgcGxhaW50ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVAwNF9FTkNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgcGxhaW50ZXh0XSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDA0X2RlY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSBzZW5kZXJcbiAqIEBwYXJhbSBjaXBoZXJ0ZXh0IC0gRW5jcnlwdGVkIG1lc3NhZ2UgdG8gZGVjcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwMDREZWNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIGNpcGhlcnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDA0X0RFQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBjaXBoZXJ0ZXh0XSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDQ0X2VuY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSByZWNpcGllbnRcbiAqIEBwYXJhbSBwbGFpbnRleHQgLSBNZXNzYWdlIHRvIGVuY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDQ0RW5jcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBwbGFpbnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDQ0X0VOQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBwbGFpbnRleHRdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwNDRfZGVjcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHNlbmRlclxuICogQHBhcmFtIGNpcGhlcnRleHQgLSBFbmNyeXB0ZWQgbWVzc2FnZSB0byBkZWNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXA0NERlY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgY2lwaGVydGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQNDRfREVDUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIGNpcGhlcnRleHRdKTtcbn1cblxuLyoqIENyZWF0ZSBhICdnZXRfcmVsYXlzJyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVsYXlzUmVxdWVzdCgpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5HRVRfUkVMQVlTLCBbXSk7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCA2LiBGaWx0ZXIgSGVscGVyIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhIE5vc3RyIGZpbHRlciBmb3Igc3Vic2NyaWJpbmcgdG8gTklQLTQ2IHJlc3BvbnNlIGV2ZW50c1xuICogQHBhcmFtIGNsaWVudFB1YmtleSAtIE91ciBlcGhlbWVyYWwgcHVibGljIGtleSAoaGV4KVxuICogQHBhcmFtIHNpbmNlIC0gT3B0aW9uYWwgc2luY2UgdGltZXN0YW1wXG4gKiBAcmV0dXJucyBGaWx0ZXIgb2JqZWN0IGZvciBraW5kIDI0MTMzIGV2ZW50cyB0YWdnZWQgdG8gdXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlc3BvbnNlRmlsdGVyKFxuICBjbGllbnRQdWJrZXk6IHN0cmluZyxcbiAgc2luY2U/OiBudW1iZXJcbik6IHsga2luZHM6IG51bWJlcltdOyAnI3AnOiBzdHJpbmdbXTsgc2luY2U/OiBudW1iZXIgfSB7XG4gIGNvbnN0IGZpbHRlcjogeyBraW5kczogbnVtYmVyW107ICcjcCc6IHN0cmluZ1tdOyBzaW5jZT86IG51bWJlciB9ID0ge1xuICAgIGtpbmRzOiBbMjQxMzNdLFxuICAgICcjcCc6IFtjbGllbnRQdWJrZXldLFxuICB9O1xuICBpZiAoc2luY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIGZpbHRlci5zaW5jZSA9IHNpbmNlO1xuICB9XG4gIHJldHVybiBmaWx0ZXI7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ5XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ5IChQcml2YXRlIEtleSBFbmNyeXB0aW9uIC8gbmNyeXB0c2VjKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80OS5tZFxuICovXG5cbmltcG9ydCB7IHhjaGFjaGEyMHBvbHkxMzA1IH0gZnJvbSAnQG5vYmxlL2NpcGhlcnMvY2hhY2hhLmpzJztcbmltcG9ydCB7IHNjcnlwdCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2NyeXB0LmpzJztcbmltcG9ydCB7IGNvbmNhdEJ5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgYmVjaDMyIGFzIHNjdXJlQmVjaDMyIH0gZnJvbSAnQHNjdXJlL2Jhc2UnO1xuXG50eXBlIEtleVNlY3VyaXR5Qnl0ZSA9IDB4MDAgfCAweDAxIHwgMHgwMjtcblxuLyoqXG4gKiBFbmNyeXB0IGEgTm9zdHIgcHJpdmF0ZSBrZXkgd2l0aCBhIHBhc3N3b3JkLCBwcm9kdWNpbmcgYW4gbmNyeXB0c2VjIGJlY2gzMiBzdHJpbmdcbiAqIEBwYXJhbSBzZWMgLSAzMi1ieXRlIHNlY3JldCBrZXlcbiAqIEBwYXJhbSBwYXNzd29yZCAtIFBhc3N3b3JkIGZvciBlbmNyeXB0aW9uXG4gKiBAcGFyYW0gbG9nbiAtIFNjcnlwdCBsb2cyKE4pIHBhcmFtZXRlciAoZGVmYXVsdDogMTYsIG1lYW5pbmcgTj02NTUzNilcbiAqIEBwYXJhbSBrc2IgLSBLZXkgc2VjdXJpdHkgYnl0ZTogMHgwMD11bmtub3duLCAweDAxPXVuc2FmZSwgMHgwMj1zYWZlIChkZWZhdWx0OiAweDAyKVxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbmNyeXB0c2VjIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jcnlwdChcbiAgc2VjOiBVaW50OEFycmF5LFxuICBwYXNzd29yZDogc3RyaW5nLFxuICBsb2duOiBudW1iZXIgPSAxNixcbiAga3NiOiBLZXlTZWN1cml0eUJ5dGUgPSAweDAyXG4pOiBzdHJpbmcge1xuICBjb25zdCBzYWx0ID0gcmFuZG9tQnl0ZXMoMTYpO1xuICBjb25zdCBuID0gMiAqKiBsb2duO1xuICBjb25zdCBub3JtYWxpemVkUGFzc3dvcmQgPSBwYXNzd29yZC5ub3JtYWxpemUoJ05GS0MnKTtcbiAgY29uc3Qga2V5ID0gc2NyeXB0KG5vcm1hbGl6ZWRQYXNzd29yZCwgc2FsdCwgeyBOOiBuLCByOiA4LCBwOiAxLCBka0xlbjogMzIgfSk7XG4gIGNvbnN0IG5vbmNlID0gcmFuZG9tQnl0ZXMoMjQpO1xuICBjb25zdCBhYWQgPSBVaW50OEFycmF5LmZyb20oW2tzYl0pO1xuICBjb25zdCBjaXBoZXIgPSB4Y2hhY2hhMjBwb2x5MTMwNShrZXksIG5vbmNlLCBhYWQpO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gY2lwaGVyLmVuY3J5cHQoc2VjKTtcbiAgLy8gQmluYXJ5IGZvcm1hdDogdmVyc2lvbigxKSArIGxvZ24oMSkgKyBzYWx0KDE2KSArIG5vbmNlKDI0KSArIGtzYigxKSArIGNpcGhlcnRleHQoNDggPSAzMiArIDE2IHRhZylcbiAgY29uc3QgcGF5bG9hZCA9IGNvbmNhdEJ5dGVzKFxuICAgIFVpbnQ4QXJyYXkuZnJvbShbMHgwMl0pLFxuICAgIFVpbnQ4QXJyYXkuZnJvbShbbG9nbl0pLFxuICAgIHNhbHQsXG4gICAgbm9uY2UsXG4gICAgYWFkLFxuICAgIGNpcGhlcnRleHRcbiAgKTtcbiAgY29uc3Qgd29yZHMgPSBzY3VyZUJlY2gzMi50b1dvcmRzKHBheWxvYWQpO1xuICByZXR1cm4gc2N1cmVCZWNoMzIuZW5jb2RlKCduY3J5cHRzZWMnLCB3b3JkcywgMjAwKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGFuIG5jcnlwdHNlYyBiZWNoMzIgc3RyaW5nIGJhY2sgdG8gdGhlIDMyLWJ5dGUgc2VjcmV0IGtleVxuICogQHBhcmFtIG5jcnlwdHNlYyAtIGJlY2gzMi1lbmNvZGVkIG5jcnlwdHNlYyBzdHJpbmdcbiAqIEBwYXJhbSBwYXNzd29yZCAtIFBhc3N3b3JkIHVzZWQgZm9yIGVuY3J5cHRpb25cbiAqIEByZXR1cm5zIDMyLWJ5dGUgc2VjcmV0IGtleSBhcyBVaW50OEFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNyeXB0KG5jcnlwdHNlYzogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHsgcHJlZml4LCB3b3JkcyB9ID0gc2N1cmVCZWNoMzIuZGVjb2RlKG5jcnlwdHNlYyBhcyBgJHtzdHJpbmd9MSR7c3RyaW5nfWAsIDIwMCk7XG4gIGlmIChwcmVmaXggIT09ICduY3J5cHRzZWMnKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgbmNyeXB0c2VjIHByZWZpeCcpO1xuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoc2N1cmVCZWNoMzIuZnJvbVdvcmRzKHdvcmRzKSk7XG4gIGNvbnN0IHZlcnNpb24gPSBkYXRhWzBdO1xuICBpZiAodmVyc2lvbiAhPT0gMHgwMikgdGhyb3cgbmV3IEVycm9yKGB1bmtub3duIG5jcnlwdHNlYyB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gIGNvbnN0IGxvZ24gPSBkYXRhWzFdO1xuICBjb25zdCBzYWx0ID0gZGF0YS5zdWJhcnJheSgyLCAxOCk7XG4gIGNvbnN0IG5vbmNlID0gZGF0YS5zdWJhcnJheSgxOCwgNDIpO1xuICBjb25zdCBrc2IgPSBkYXRhWzQyXTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGRhdGEuc3ViYXJyYXkoNDMpO1xuICBjb25zdCBuID0gMiAqKiBsb2duO1xuICBjb25zdCBub3JtYWxpemVkUGFzc3dvcmQgPSBwYXNzd29yZC5ub3JtYWxpemUoJ05GS0MnKTtcbiAgY29uc3Qga2V5ID0gc2NyeXB0KG5vcm1hbGl6ZWRQYXNzd29yZCwgc2FsdCwgeyBOOiBuLCByOiA4LCBwOiAxLCBka0xlbjogMzIgfSk7XG4gIGNvbnN0IGFhZCA9IFVpbnQ4QXJyYXkuZnJvbShba3NiXSk7XG4gIGNvbnN0IGNpcGhlciA9IHhjaGFjaGEyMHBvbHkxMzA1KGtleSwgbm9uY2UsIGFhZCk7XG4gIHJldHVybiBjaXBoZXIuZGVjcnlwdChjaXBoZXJ0ZXh0KTtcbn1cbiIsICIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zIGZvciBlbmNvZGluZyBhbmQgZGVjb2RpbmcgZGF0YVxuICovXG5cbi8qKlxuICogQ29udmVydCBhIGhleCBzdHJpbmcgdG8gVWludDhBcnJheVxuICogQHBhcmFtIGhleCBIZXggc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgb2YgYnl0ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGhleC5sZW5ndGggLyAyKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhleC5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBieXRlc1tpIC8gMl0gPSBwYXJzZUludChoZXguc2xpY2UoaSwgaSArIDIpLCAxNik7XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbn1cblxuLyoqXG4gKiBDb252ZXJ0IFVpbnQ4QXJyYXkgdG8gaGV4IHN0cmluZ1xuICogQHBhcmFtIGJ5dGVzIFVpbnQ4QXJyYXkgdG8gY29udmVydFxuICogQHJldHVybnMgSGV4IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0hleChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpXG4gICAgICAgIC5tYXAoYiA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKVxuICAgICAgICAuam9pbignJyk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIFVURi04IHN0cmluZyB0byBVaW50OEFycmF5XG4gKiBAcGFyYW0gc3RyIFVURi04IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVaW50OEFycmF5IG9mIGJ5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dGY4VG9CeXRlcyhzdHI6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIHJldHVybiBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IFVpbnQ4QXJyYXkgdG8gVVRGLTggc3RyaW5nXG4gKiBAcGFyYW0gYnl0ZXMgVWludDhBcnJheSB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVVEYtOCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9VdGY4KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJ5dGVzKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxNQU1XO0FBTlg7QUFBQTtBQU1PLE1BQUksVUFBVTtBQUFBLFFBQ2pCLEtBQUssRUFBRSxVQUFVLGNBQWMsV0FBVyxPQUFPO0FBQUEsUUFDakQsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsVUFBVSxTQUFVLElBQUk7QUFDcEIsY0FBSSxPQUFPLE1BQU0sVUFBVSxNQUFNLEtBQUssV0FBVyxDQUFDO0FBQ2xELGtCQUFRLFFBQVEsRUFBRSxLQUFLLFdBQVk7QUFBRSxlQUFHLE1BQU0sTUFBTSxJQUFJO0FBQUEsVUFBRyxDQUFDO0FBQUEsUUFDaEU7QUFBQSxNQUNKO0FBQUE7QUFBQTs7O0FDaEJBO0FBQUE7QUFBQTtBQUFBO0FBQ0EsZUFBUyxhQUFjLEdBQUc7QUFDeEIsWUFBSTtBQUFFLGlCQUFPLEtBQUssVUFBVSxDQUFDO0FBQUEsUUFBRSxTQUFRLEdBQUc7QUFBRSxpQkFBTztBQUFBLFFBQWU7QUFBQSxNQUNwRTtBQUVBLGFBQU8sVUFBVTtBQUVqQixlQUFTLE9BQU8sR0FBRyxNQUFNLE1BQU07QUFDN0IsWUFBSSxLQUFNLFFBQVEsS0FBSyxhQUFjO0FBQ3JDLFlBQUksU0FBUztBQUNiLFlBQUksT0FBTyxNQUFNLFlBQVksTUFBTSxNQUFNO0FBQ3ZDLGNBQUksTUFBTSxLQUFLLFNBQVM7QUFDeEIsY0FBSSxRQUFRLEVBQUcsUUFBTztBQUN0QixjQUFJLFVBQVUsSUFBSSxNQUFNLEdBQUc7QUFDM0Isa0JBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FB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QUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFFBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsVUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxhQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGdCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGtCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGlCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLHNCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLG1CQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGlCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFdBQUEsSUFBQSxJQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsYUFBQSxJQUFBLElBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxLQUFBLElBQUEsSUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFdBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsVUFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxxQkFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxhQUFBLElBQUEsS0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGVBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsZUFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxvQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSx1QkFBQSxJQUFBLEtBQUEsSUFB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QUFLO0FBQ2hDLFlBQUksS0FBSyxHQUFHLE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxHQUFHO0FBQ3hDLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUNqQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDakIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFB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QkFBaUIsb0JBQW9CLElBQUk7IiwKICAibmFtZXMiOiBbInBpbm8iLCAibG9nZ2VyIiwgInRyYW5zbWl0IiwgImxldmVsIiwgInNldE9wdHMiLCAic2VsZiIsICJsZW4iLCAiaSIsICJudW0iLCAibGVuMiIsICJCdWZmZXIiLCAidXRmOFRvQnl0ZXMiLCAiYmFzZTY0VG9CeXRlcyIsICJpIiwgImFzY2lpVG9CeXRlcyIsICJieXRlTGVuZ3RoIiwgInRhcmdldCIsICJzdGF0ZSIsICJOb3N0ckV2ZW50S2luZCIsICJOb3N0ck1lc3NhZ2VUeXBlIiwgIk5pcDQ2TWV0aG9kIiwgIk5vc3RyRXZlbnRLaW5kIiwgIl8wbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJudW0iLCAiXzBuIiwgIl8xbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJudW0iLCAibnVtIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIndpbmRvdyIsICJfMG4iLCAiXzFuIiwgIndpbmRvdyIsICJfMG4iLCAiZ2V0UHVibGljS2V5IiwgIm51bSIsICJfMm4iLCAiXzBuIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIl8ybiIsICJfM24iLCAiXzRuIiwgInBvaW50VG9CeXRlcyIsICJlbmRvIiwgIl8wbiIsICJfMm4iLCAiXzNuIiwgIl8ybiIsICJfMG4iLCAiTG9nTGV2ZWwiLCAicGlubyIsICJjcnlwdG8iLCAiZ2V0Q3J5cHRvIiwgImNyeXB0byJdCn0K
