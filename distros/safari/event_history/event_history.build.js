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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsICJub2RlLXN0dWI6Y3J5cHRvIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9iZWNoMzIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2V2ZW50X2hpc3RvcnkvZXZlbnRfaGlzdG9yeS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaWRiL2J1aWxkL2luZGV4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvZGIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWVkcGhyYXNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy91dGlscy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvc2hhMi50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvX21kLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2Jhc2UudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvcHJvdG9jb2wudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9kaXN0L2VzbS90eXBlcy9tZXNzYWdlcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9ndWFyZHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvbmlwNDYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvY3J5cHRvLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9zZWNwMjU2azEudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L2N1cnZlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy91dGlscy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3QvbW9kdWxhci50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3Qvd2VpZXJzdHJhc3MudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdXRpbHMvbG9nZ2VyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2VuY29kaW5nL2Jhc2U2NC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy92YWxpZGF0aW9uL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L2NyZWF0aW9uLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L3NpZ25pbmcudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMDQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMDEudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMTkudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMjYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDkudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdXRpbHMvZW5jb2RpbmcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIndXNlIHN0cmljdCdcbmZ1bmN0aW9uIHRyeVN0cmluZ2lmeSAobykge1xuICB0cnkgeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkobykgfSBjYXRjaChlKSB7IHJldHVybiAnXCJbQ2lyY3VsYXJdXCInIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtYXRcblxuZnVuY3Rpb24gZm9ybWF0KGYsIGFyZ3MsIG9wdHMpIHtcbiAgdmFyIHNzID0gKG9wdHMgJiYgb3B0cy5zdHJpbmdpZnkpIHx8IHRyeVN0cmluZ2lmeVxuICB2YXIgb2Zmc2V0ID0gMVxuICBpZiAodHlwZW9mIGYgPT09ICdvYmplY3QnICYmIGYgIT09IG51bGwpIHtcbiAgICB2YXIgbGVuID0gYXJncy5sZW5ndGggKyBvZmZzZXRcbiAgICBpZiAobGVuID09PSAxKSByZXR1cm4gZlxuICAgIHZhciBvYmplY3RzID0gbmV3IEFycmF5KGxlbilcbiAgICBvYmplY3RzWzBdID0gc3MoZilcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XG4gICAgICBvYmplY3RzW2luZGV4XSA9IHNzKGFyZ3NbaW5kZXhdKVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJylcbiAgfVxuICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZcbiAgfVxuICB2YXIgYXJnTGVuID0gYXJncy5sZW5ndGhcbiAgaWYgKGFyZ0xlbiA9PT0gMCkgcmV0dXJuIGZcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBhID0gMSAtIG9mZnNldFxuICB2YXIgbGFzdFBvcyA9IC0xXG4gIHZhciBmbGVuID0gKGYgJiYgZi5sZW5ndGgpIHx8IDBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbGVuOykge1xuICAgIGlmIChmLmNoYXJDb2RlQXQoaSkgPT09IDM3ICYmIGkgKyAxIDwgZmxlbikge1xuICAgICAgbGFzdFBvcyA9IGxhc3RQb3MgPiAtMSA/IGxhc3RQb3MgOiAwXG4gICAgICBzd2l0Y2ggKGYuY2hhckNvZGVBdChpICsgMSkpIHtcbiAgICAgICAgY2FzZSAxMDA6IC8vICdkJ1xuICAgICAgICBjYXNlIDEwMjogLy8gJ2YnXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBOdW1iZXIoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDEwNTogLy8gJ2knXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBNYXRoLmZsb29yKE51bWJlcihhcmdzW2FdKSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDc5OiAvLyAnTydcbiAgICAgICAgY2FzZSAxMTE6IC8vICdvJ1xuICAgICAgICBjYXNlIDEwNjogLy8gJ2onXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgYXJnc1thXVxuICAgICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc3RyICs9ICdcXCcnICsgYXJnc1thXSArICdcXCcnXG4gICAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciArPSBhcmdzW2FdLm5hbWUgfHwgJzxhbm9ueW1vdXM+J1xuICAgICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0ciArPSBzcyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMTE1OiAvLyAncydcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IFN0cmluZyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzc6IC8vICclJ1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9ICclJ1xuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGEtLVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICArK2FcbiAgICB9XG4gICAgKytpXG4gIH1cbiAgaWYgKGxhc3RQb3MgPT09IC0xKVxuICAgIHJldHVybiBmXG4gIGVsc2UgaWYgKGxhc3RQb3MgPCBmbGVuKSB7XG4gICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcylcbiAgfVxuXG4gIHJldHVybiBzdHJcbn1cbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgZm9ybWF0ID0gcmVxdWlyZSgncXVpY2stZm9ybWF0LXVuZXNjYXBlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gcGlub1xuXG5jb25zdCBfY29uc29sZSA9IHBmR2xvYmFsVGhpc09yRmFsbGJhY2soKS5jb25zb2xlIHx8IHt9XG5jb25zdCBzdGRTZXJpYWxpemVycyA9IHtcbiAgbWFwSHR0cFJlcXVlc3Q6IG1vY2ssXG4gIG1hcEh0dHBSZXNwb25zZTogbW9jayxcbiAgd3JhcFJlcXVlc3RTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgd3JhcFJlc3BvbnNlU2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBFcnJvclNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICByZXE6IG1vY2ssXG4gIHJlczogbW9jayxcbiAgZXJyOiBhc0VyclZhbHVlLFxuICBlcnJXaXRoQ2F1c2U6IGFzRXJyVmFsdWVcbn1cbmZ1bmN0aW9uIGxldmVsVG9WYWx1ZSAobGV2ZWwsIGxvZ2dlcikge1xuICByZXR1cm4gbGV2ZWwgPT09ICdzaWxlbnQnXG4gICAgPyBJbmZpbml0eVxuICAgIDogbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdXG59XG5jb25zdCBiYXNlTG9nRnVuY3Rpb25TeW1ib2wgPSBTeW1ib2woJ3Bpbm8ubG9nRnVuY3MnKVxuY29uc3QgaGllcmFyY2h5U3ltYm9sID0gU3ltYm9sKCdwaW5vLmhpZXJhcmNoeScpXG5cbmNvbnN0IGxvZ0ZhbGxiYWNrTWFwID0ge1xuICBlcnJvcjogJ2xvZycsXG4gIGZhdGFsOiAnZXJyb3InLFxuICB3YXJuOiAnZXJyb3InLFxuICBpbmZvOiAnbG9nJyxcbiAgZGVidWc6ICdsb2cnLFxuICB0cmFjZTogJ2xvZydcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGRMb2dnZXIgKHBhcmVudExvZ2dlciwgY2hpbGRMb2dnZXIpIHtcbiAgY29uc3QgbmV3RW50cnkgPSB7XG4gICAgbG9nZ2VyOiBjaGlsZExvZ2dlcixcbiAgICBwYXJlbnQ6IHBhcmVudExvZ2dlcltoaWVyYXJjaHlTeW1ib2xdXG4gIH1cbiAgY2hpbGRMb2dnZXJbaGllcmFyY2h5U3ltYm9sXSA9IG5ld0VudHJ5XG59XG5cbmZ1bmN0aW9uIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyAobG9nZ2VyLCBsZXZlbHMsIHByb3RvKSB7XG4gIGNvbnN0IGxvZ0Z1bmN0aW9ucyA9IHt9XG4gIGxldmVscy5mb3JFYWNoKGxldmVsID0+IHtcbiAgICBsb2dGdW5jdGlvbnNbbGV2ZWxdID0gcHJvdG9bbGV2ZWxdID8gcHJvdG9bbGV2ZWxdIDogKF9jb25zb2xlW2xldmVsXSB8fCBfY29uc29sZVtsb2dGYWxsYmFja01hcFtsZXZlbF0gfHwgJ2xvZyddIHx8IG5vb3ApXG4gIH0pXG4gIGxvZ2dlcltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdID0gbG9nRnVuY3Rpb25zXG59XG5cbmZ1bmN0aW9uIHNob3VsZFNlcmlhbGl6ZSAoc2VyaWFsaXplLCBzZXJpYWxpemVycykge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXJpYWxpemUpKSB7XG4gICAgY29uc3QgaGFzVG9GaWx0ZXIgPSBzZXJpYWxpemUuZmlsdGVyKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gayAhPT0gJyFzdGRTZXJpYWxpemVycy5lcnInXG4gICAgfSlcbiAgICByZXR1cm4gaGFzVG9GaWx0ZXJcbiAgfSBlbHNlIGlmIChzZXJpYWxpemUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2VyaWFsaXplcnMpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gcGlubyAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLmJyb3dzZXIgPSBvcHRzLmJyb3dzZXIgfHwge31cblxuICBjb25zdCB0cmFuc21pdCA9IG9wdHMuYnJvd3Nlci50cmFuc21pdFxuICBpZiAodHJhbnNtaXQgJiYgdHlwZW9mIHRyYW5zbWl0LnNlbmQgIT09ICdmdW5jdGlvbicpIHsgdGhyb3cgRXJyb3IoJ3Bpbm86IHRyYW5zbWl0IG9wdGlvbiBtdXN0IGhhdmUgYSBzZW5kIGZ1bmN0aW9uJykgfVxuXG4gIGNvbnN0IHByb3RvID0gb3B0cy5icm93c2VyLndyaXRlIHx8IF9jb25zb2xlXG4gIGlmIChvcHRzLmJyb3dzZXIud3JpdGUpIG9wdHMuYnJvd3Nlci5hc09iamVjdCA9IHRydWVcbiAgY29uc3Qgc2VyaWFsaXplcnMgPSBvcHRzLnNlcmlhbGl6ZXJzIHx8IHt9XG4gIGNvbnN0IHNlcmlhbGl6ZSA9IHNob3VsZFNlcmlhbGl6ZShvcHRzLmJyb3dzZXIuc2VyaWFsaXplLCBzZXJpYWxpemVycylcbiAgbGV0IHN0ZEVyclNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemVcblxuICBpZiAoXG4gICAgQXJyYXkuaXNBcnJheShvcHRzLmJyb3dzZXIuc2VyaWFsaXplKSAmJlxuICAgIG9wdHMuYnJvd3Nlci5zZXJpYWxpemUuaW5kZXhPZignIXN0ZFNlcmlhbGl6ZXJzLmVycicpID4gLTFcbiAgKSBzdGRFcnJTZXJpYWxpemUgPSBmYWxzZVxuXG4gIGNvbnN0IGN1c3RvbUxldmVscyA9IE9iamVjdC5rZXlzKG9wdHMuY3VzdG9tTGV2ZWxzIHx8IHt9KVxuICBjb25zdCBsZXZlbHMgPSBbJ2Vycm9yJywgJ2ZhdGFsJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZSddLmNvbmNhdChjdXN0b21MZXZlbHMpXG5cbiAgaWYgKHR5cGVvZiBwcm90byA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgcHJvdG9bbGV2ZWxdID0gcHJvdG9cbiAgICB9KVxuICB9XG4gIGlmIChvcHRzLmVuYWJsZWQgPT09IGZhbHNlIHx8IG9wdHMuYnJvd3Nlci5kaXNhYmxlZCkgb3B0cy5sZXZlbCA9ICdzaWxlbnQnXG4gIGNvbnN0IGxldmVsID0gb3B0cy5sZXZlbCB8fCAnaW5mbydcbiAgY29uc3QgbG9nZ2VyID0gT2JqZWN0LmNyZWF0ZShwcm90bylcbiAgaWYgKCFsb2dnZXIubG9nKSBsb2dnZXIubG9nID0gbm9vcFxuXG4gIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyhsb2dnZXIsIGxldmVscywgcHJvdG8pXG4gIC8vIHNldHVwIHJvb3QgaGllcmFyY2h5IGVudHJ5XG4gIGFwcGVuZENoaWxkTG9nZ2VyKHt9LCBsb2dnZXIpXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsVmFsJywge1xuICAgIGdldDogZ2V0TGV2ZWxWYWxcbiAgfSlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsJywge1xuICAgIGdldDogZ2V0TGV2ZWwsXG4gICAgc2V0OiBzZXRMZXZlbFxuICB9KVxuXG4gIGNvbnN0IHNldE9wdHMgPSB7XG4gICAgdHJhbnNtaXQsXG4gICAgc2VyaWFsaXplLFxuICAgIGFzT2JqZWN0OiBvcHRzLmJyb3dzZXIuYXNPYmplY3QsXG4gICAgYXNPYmplY3RCaW5kaW5nc09ubHk6IG9wdHMuYnJvd3Nlci5hc09iamVjdEJpbmRpbmdzT25seSxcbiAgICBmb3JtYXR0ZXJzOiBvcHRzLmJyb3dzZXIuZm9ybWF0dGVycyxcbiAgICByZXBvcnRDYWxsZXI6IG9wdHMuYnJvd3Nlci5yZXBvcnRDYWxsZXIsXG4gICAgbGV2ZWxzLFxuICAgIHRpbWVzdGFtcDogZ2V0VGltZUZ1bmN0aW9uKG9wdHMpLFxuICAgIG1lc3NhZ2VLZXk6IG9wdHMubWVzc2FnZUtleSB8fCAnbXNnJyxcbiAgICBvbkNoaWxkOiBvcHRzLm9uQ2hpbGQgfHwgbm9vcFxuICB9XG4gIGxvZ2dlci5sZXZlbHMgPSBnZXRMZXZlbHMob3B0cylcbiAgbG9nZ2VyLmxldmVsID0gbGV2ZWxcblxuICBsb2dnZXIuaXNMZXZlbEVuYWJsZWQgPSBmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICBpZiAoIXRoaXMubGV2ZWxzLnZhbHVlc1tsZXZlbF0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdID49IHRoaXMubGV2ZWxzLnZhbHVlc1t0aGlzLmxldmVsXVxuICB9XG4gIGxvZ2dlci5zZXRNYXhMaXN0ZW5lcnMgPSBsb2dnZXIuZ2V0TWF4TGlzdGVuZXJzID1cbiAgbG9nZ2VyLmVtaXQgPSBsb2dnZXIuYWRkTGlzdGVuZXIgPSBsb2dnZXIub24gPVxuICBsb2dnZXIucHJlcGVuZExpc3RlbmVyID0gbG9nZ2VyLm9uY2UgPVxuICBsb2dnZXIucHJlcGVuZE9uY2VMaXN0ZW5lciA9IGxvZ2dlci5yZW1vdmVMaXN0ZW5lciA9XG4gIGxvZ2dlci5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBsb2dnZXIubGlzdGVuZXJzID1cbiAgbG9nZ2VyLmxpc3RlbmVyQ291bnQgPSBsb2dnZXIuZXZlbnROYW1lcyA9XG4gIGxvZ2dlci53cml0ZSA9IGxvZ2dlci5mbHVzaCA9IG5vb3BcbiAgbG9nZ2VyLnNlcmlhbGl6ZXJzID0gc2VyaWFsaXplcnNcbiAgbG9nZ2VyLl9zZXJpYWxpemUgPSBzZXJpYWxpemVcbiAgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUgPSBzdGRFcnJTZXJpYWxpemVcbiAgbG9nZ2VyLmNoaWxkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIGNoaWxkLmNhbGwodGhpcywgc2V0T3B0cywgLi4uYXJncykgfVxuXG4gIGlmICh0cmFuc21pdCkgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoKVxuXG4gIGZ1bmN0aW9uIGdldExldmVsVmFsICgpIHtcbiAgICByZXR1cm4gbGV2ZWxUb1ZhbHVlKHRoaXMubGV2ZWwsIHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMZXZlbCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xldmVsXG4gIH1cbiAgZnVuY3Rpb24gc2V0TGV2ZWwgKGxldmVsKSB7XG4gICAgaWYgKGxldmVsICE9PSAnc2lsZW50JyAmJiAhdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gbGV2ZWwgJyArIGxldmVsKVxuICAgIH1cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsXG5cbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnZXJyb3InKSAvLyA8LS0gbXVzdCBzdGF5IGZpcnN0XG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2ZhdGFsJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnd2FybicpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2luZm8nKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdkZWJ1ZycpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ3RyYWNlJylcblxuICAgIGN1c3RvbUxldmVscy5mb3JFYWNoKChsZXZlbCkgPT4ge1xuICAgICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgbGV2ZWwpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoaWxkIChzZXRPcHRzLCBiaW5kaW5ncywgY2hpbGRPcHRpb25zKSB7XG4gICAgaWYgKCFiaW5kaW5ncykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGJpbmRpbmdzIGZvciBjaGlsZCBQaW5vJylcbiAgICB9XG4gICAgY2hpbGRPcHRpb25zID0gY2hpbGRPcHRpb25zIHx8IHt9XG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBiaW5kaW5ncy5zZXJpYWxpemVycykge1xuICAgICAgY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzID0gYmluZGluZ3Muc2VyaWFsaXplcnNcbiAgICB9XG4gICAgY29uc3QgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMgPSBjaGlsZE9wdGlvbnMuc2VyaWFsaXplcnNcbiAgICBpZiAoc2VyaWFsaXplICYmIGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzKSB7XG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemVycyA9IE9iamVjdC5hc3NpZ24oe30sIHNlcmlhbGl6ZXJzLCBjaGlsZE9wdGlvbnNTZXJpYWxpemVycylcbiAgICAgIHZhciBjaGlsZFNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemUgPT09IHRydWVcbiAgICAgICAgPyBPYmplY3Qua2V5cyhjaGlsZFNlcmlhbGl6ZXJzKVxuICAgICAgICA6IHNlcmlhbGl6ZVxuICAgICAgZGVsZXRlIGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgICBhcHBseVNlcmlhbGl6ZXJzKFtiaW5kaW5nc10sIGNoaWxkU2VyaWFsaXplLCBjaGlsZFNlcmlhbGl6ZXJzLCB0aGlzLl9zdGRFcnJTZXJpYWxpemUpXG4gICAgfVxuICAgIGZ1bmN0aW9uIENoaWxkIChwYXJlbnQpIHtcbiAgICAgIHRoaXMuX2NoaWxkTGV2ZWwgPSAocGFyZW50Ll9jaGlsZExldmVsIHwgMCkgKyAxXG5cbiAgICAgIC8vIG1ha2Ugc3VyZSBiaW5kaW5ncyBhcmUgYXZhaWxhYmxlIGluIHRoZSBgc2V0YCBmdW5jdGlvblxuICAgICAgdGhpcy5iaW5kaW5ncyA9IGJpbmRpbmdzXG5cbiAgICAgIGlmIChjaGlsZFNlcmlhbGl6ZXJzKSB7XG4gICAgICAgIHRoaXMuc2VyaWFsaXplcnMgPSBjaGlsZFNlcmlhbGl6ZXJzXG4gICAgICAgIHRoaXMuX3NlcmlhbGl6ZSA9IGNoaWxkU2VyaWFsaXplXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNtaXQpIHtcbiAgICAgICAgdGhpcy5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKFxuICAgICAgICAgIFtdLmNvbmNhdChwYXJlbnQuX2xvZ0V2ZW50LmJpbmRpbmdzLCBiaW5kaW5ncylcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICBDaGlsZC5wcm90b3R5cGUgPSB0aGlzXG4gICAgY29uc3QgbmV3TG9nZ2VyID0gbmV3IENoaWxkKHRoaXMpXG5cbiAgICAvLyBtdXN0IGhhcHBlbiBiZWZvcmUgdGhlIGxldmVsIGlzIGFzc2lnbmVkXG4gICAgYXBwZW5kQ2hpbGRMb2dnZXIodGhpcywgbmV3TG9nZ2VyKVxuICAgIG5ld0xvZ2dlci5jaGlsZCA9IGZ1bmN0aW9uICguLi5hcmdzKSB7IHJldHVybiBjaGlsZC5jYWxsKHRoaXMsIHNldE9wdHMsIC4uLmFyZ3MpIH1cbiAgICAvLyByZXF1aXJlZCB0byBhY3R1YWxseSBpbml0aWFsaXplIHRoZSBsb2dnZXIgZnVuY3Rpb25zIGZvciBhbnkgZ2l2ZW4gY2hpbGRcbiAgICBuZXdMb2dnZXIubGV2ZWwgPSBjaGlsZE9wdGlvbnMubGV2ZWwgfHwgdGhpcy5sZXZlbCAvLyBhbGxvdyBsZXZlbCB0byBiZSBzZXQgYnkgY2hpbGRPcHRpb25zXG4gICAgc2V0T3B0cy5vbkNoaWxkKG5ld0xvZ2dlcilcblxuICAgIHJldHVybiBuZXdMb2dnZXJcbiAgfVxuICByZXR1cm4gbG9nZ2VyXG59XG5cbmZ1bmN0aW9uIGdldExldmVscyAob3B0cykge1xuICBjb25zdCBjdXN0b21MZXZlbHMgPSBvcHRzLmN1c3RvbUxldmVscyB8fCB7fVxuXG4gIGNvbnN0IHZhbHVlcyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbm8ubGV2ZWxzLnZhbHVlcywgY3VzdG9tTGV2ZWxzKVxuICBjb25zdCBsYWJlbHMgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5vLmxldmVscy5sYWJlbHMsIGludmVydE9iamVjdChjdXN0b21MZXZlbHMpKVxuXG4gIHJldHVybiB7XG4gICAgdmFsdWVzLFxuICAgIGxhYmVsc1xuICB9XG59XG5cbmZ1bmN0aW9uIGludmVydE9iamVjdCAob2JqKSB7XG4gIGNvbnN0IGludmVydGVkID0ge31cbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpbnZlcnRlZFtvYmpba2V5XV0gPSBrZXlcbiAgfSlcbiAgcmV0dXJuIGludmVydGVkXG59XG5cbnBpbm8ubGV2ZWxzID0ge1xuICB2YWx1ZXM6IHtcbiAgICBmYXRhbDogNjAsXG4gICAgZXJyb3I6IDUwLFxuICAgIHdhcm46IDQwLFxuICAgIGluZm86IDMwLFxuICAgIGRlYnVnOiAyMCxcbiAgICB0cmFjZTogMTBcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgMTA6ICd0cmFjZScsXG4gICAgMjA6ICdkZWJ1ZycsXG4gICAgMzA6ICdpbmZvJyxcbiAgICA0MDogJ3dhcm4nLFxuICAgIDUwOiAnZXJyb3InLFxuICAgIDYwOiAnZmF0YWwnXG4gIH1cbn1cblxucGluby5zdGRTZXJpYWxpemVycyA9IHN0ZFNlcmlhbGl6ZXJzXG5waW5vLnN0ZFRpbWVGdW5jdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG51bGxUaW1lLCBlcG9jaFRpbWUsIHVuaXhUaW1lLCBpc29UaW1lIH0pXG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdDaGFpbiAobG9nZ2VyKSB7XG4gIGNvbnN0IGJpbmRpbmdzID0gW11cbiAgaWYgKGxvZ2dlci5iaW5kaW5ncykge1xuICAgIGJpbmRpbmdzLnB1c2gobG9nZ2VyLmJpbmRpbmdzKVxuICB9XG5cbiAgLy8gdHJhdmVyc2UgdXAgdGhlIHRyZWUgdG8gZ2V0IGFsbCBiaW5kaW5nc1xuICBsZXQgaGllcmFyY2h5ID0gbG9nZ2VyW2hpZXJhcmNoeVN5bWJvbF1cbiAgd2hpbGUgKGhpZXJhcmNoeS5wYXJlbnQpIHtcbiAgICBoaWVyYXJjaHkgPSBoaWVyYXJjaHkucGFyZW50XG4gICAgaWYgKGhpZXJhcmNoeS5sb2dnZXIuYmluZGluZ3MpIHtcbiAgICAgIGJpbmRpbmdzLnB1c2goaGllcmFyY2h5LmxvZ2dlci5iaW5kaW5ncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmluZGluZ3MucmV2ZXJzZSgpXG59XG5cbmZ1bmN0aW9uIHNldCAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpIHtcbiAgLy8gb3ZlcnJpZGUgdGhlIGN1cnJlbnQgbG9nIGZ1bmN0aW9ucyB3aXRoIGVpdGhlciBgbm9vcGAgb3IgdGhlIGJhc2UgbG9nIGZ1bmN0aW9uXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBsZXZlbCwge1xuICAgIHZhbHVlOiAobGV2ZWxUb1ZhbHVlKHNlbGYubGV2ZWwsIHJvb3RMb2dnZXIpID4gbGV2ZWxUb1ZhbHVlKGxldmVsLCByb290TG9nZ2VyKVxuICAgICAgPyBub29wXG4gICAgICA6IHJvb3RMb2dnZXJbYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sXVtsZXZlbF0pLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG5cbiAgaWYgKHNlbGZbbGV2ZWxdID09PSBub29wKSB7XG4gICAgaWYgKCFvcHRzLnRyYW5zbWl0KSByZXR1cm5cblxuICAgIGNvbnN0IHRyYW5zbWl0TGV2ZWwgPSBvcHRzLnRyYW5zbWl0LmxldmVsIHx8IHNlbGYubGV2ZWxcbiAgICBjb25zdCB0cmFuc21pdFZhbHVlID0gbGV2ZWxUb1ZhbHVlKHRyYW5zbWl0TGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgY29uc3QgbWV0aG9kVmFsdWUgPSBsZXZlbFRvVmFsdWUobGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gIH1cblxuICAvLyBtYWtlIHN1cmUgdGhlIGxvZyBmb3JtYXQgaXMgY29ycmVjdFxuICBzZWxmW2xldmVsXSA9IGNyZWF0ZVdyYXAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpXG5cbiAgLy8gcHJlcGVuZCBiaW5kaW5ncyBpZiBpdCBpcyBub3QgdGhlIHJvb3QgbG9nZ2VyXG4gIGNvbnN0IGJpbmRpbmdzID0gZ2V0QmluZGluZ0NoYWluKHNlbGYpXG4gIGlmIChiaW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBlYXJseSBleGl0IGluIGNhc2UgZm9yIHJvb3RMb2dnZXJcbiAgICByZXR1cm5cbiAgfVxuICBzZWxmW2xldmVsXSA9IHByZXBlbmRCaW5kaW5nc0luQXJndW1lbnRzKGJpbmRpbmdzLCBzZWxmW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gcHJlcGVuZEJpbmRpbmdzSW5Bcmd1bWVudHMgKGJpbmRpbmdzLCBsb2dGdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGxvZ0Z1bmMuYXBwbHkodGhpcywgWy4uLmJpbmRpbmdzLCAuLi5hcmd1bWVudHNdKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyYXAgKHNlbGYsIG9wdHMsIHJvb3RMb2dnZXIsIGxldmVsKSB7XG4gIHJldHVybiAoZnVuY3Rpb24gKHdyaXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIExPRyAoKSB7XG4gICAgICBjb25zdCB0cyA9IG9wdHMudGltZXN0YW1wKClcbiAgICAgIGNvbnN0IGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aClcbiAgICAgIGNvbnN0IHByb3RvID0gKE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgPT09IF9jb25zb2xlKSA/IF9jb25zb2xlIDogdGhpc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG5cbiAgICAgIHZhciBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2VcbiAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZSkge1xuICAgICAgICBhcHBseVNlcmlhbGl6ZXJzKGFyZ3MsIHRoaXMuX3NlcmlhbGl6ZSwgdGhpcy5zZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgICAgICBhcmdzSXNTZXJpYWxpemVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG9wdHMuYXNPYmplY3QgfHwgb3B0cy5mb3JtYXR0ZXJzKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IGFzT2JqZWN0KHRoaXMsIGxldmVsLCBhcmdzLCB0cywgb3B0cylcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyICYmIG91dCAmJiBvdXQubGVuZ3RoID4gMCAmJiBvdXRbMF0gJiYgdHlwZW9mIG91dFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGVyID0gZ2V0Q2FsbGVyTG9jYXRpb24oKVxuICAgICAgICAgICAgaWYgKGNhbGxlcikgb3V0WzBdLmNhbGxlciA9IGNhbGxlclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGUuY2FsbChwcm90bywgLi4ub3V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlciA9IGdldENhbGxlckxvY2F0aW9uKClcbiAgICAgICAgICAgIGlmIChjYWxsZXIpIGFyZ3MucHVzaChjYWxsZXIpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB3cml0ZS5hcHBseShwcm90bywgYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMudHJhbnNtaXQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNtaXRMZXZlbCA9IG9wdHMudHJhbnNtaXQubGV2ZWwgfHwgc2VsZi5fbGV2ZWxcbiAgICAgICAgY29uc3QgdHJhbnNtaXRWYWx1ZSA9IGxldmVsVG9WYWx1ZSh0cmFuc21pdExldmVsLCByb290TG9nZ2VyKVxuICAgICAgICBjb25zdCBtZXRob2RWYWx1ZSA9IGxldmVsVG9WYWx1ZShsZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gICAgICAgIHRyYW5zbWl0KHRoaXMsIHtcbiAgICAgICAgICB0cyxcbiAgICAgICAgICBtZXRob2RMZXZlbDogbGV2ZWwsXG4gICAgICAgICAgbWV0aG9kVmFsdWUsXG4gICAgICAgICAgdHJhbnNtaXRMZXZlbCxcbiAgICAgICAgICB0cmFuc21pdFZhbHVlOiByb290TG9nZ2VyLmxldmVscy52YWx1ZXNbb3B0cy50cmFuc21pdC5sZXZlbCB8fCBzZWxmLl9sZXZlbF0sXG4gICAgICAgICAgc2VuZDogb3B0cy50cmFuc21pdC5zZW5kLFxuICAgICAgICAgIHZhbDogbGV2ZWxUb1ZhbHVlKHNlbGYuX2xldmVsLCByb290TG9nZ2VyKVxuICAgICAgICB9LCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkKVxuICAgICAgfVxuICAgIH1cbiAgfSkoc2VsZltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gYXNPYmplY3QgKGxvZ2dlciwgbGV2ZWwsIGFyZ3MsIHRzLCBvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBsZXZlbDogbGV2ZWxGb3JtYXR0ZXIsXG4gICAgbG9nOiBsb2dPYmplY3RGb3JtYXR0ZXIgPSAob2JqKSA9PiBvYmpcbiAgfSA9IG9wdHMuZm9ybWF0dGVycyB8fCB7fVxuICBjb25zdCBhcmdzQ2xvbmVkID0gYXJncy5zbGljZSgpXG4gIGxldCBtc2cgPSBhcmdzQ2xvbmVkWzBdXG4gIGNvbnN0IGxvZ09iamVjdCA9IHt9XG5cbiAgbGV0IGx2bCA9IChsb2dnZXIuX2NoaWxkTGV2ZWwgfCAwKSArIDFcbiAgaWYgKGx2bCA8IDEpIGx2bCA9IDFcblxuICBpZiAodHMpIHtcbiAgICBsb2dPYmplY3QudGltZSA9IHRzXG4gIH1cblxuICBpZiAobGV2ZWxGb3JtYXR0ZXIpIHtcbiAgICBjb25zdCBmb3JtYXR0ZWRMZXZlbCA9IGxldmVsRm9ybWF0dGVyKGxldmVsLCBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF0pXG4gICAgT2JqZWN0LmFzc2lnbihsb2dPYmplY3QsIGZvcm1hdHRlZExldmVsKVxuICB9IGVsc2Uge1xuICAgIGxvZ09iamVjdC5sZXZlbCA9IGxvZ2dlci5sZXZlbHMudmFsdWVzW2xldmVsXVxuICB9XG5cbiAgaWYgKG9wdHMuYXNPYmplY3RCaW5kaW5nc09ubHkpIHtcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZm9ybWF0dGVkTG9nT2JqZWN0ID0gbG9nT2JqZWN0Rm9ybWF0dGVyKGxvZ09iamVjdClcbiAgICByZXR1cm4gW2Zvcm1hdHRlZExvZ09iamVjdCwgLi4uYXJnc0Nsb25lZF1cbiAgfSBlbHNlIHtcbiAgICAvLyBkZWxpYmVyYXRlLCBjYXRjaGluZyBvYmplY3RzLCBhcnJheXNcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgICBtc2cgPSBhcmdzQ2xvbmVkLmxlbmd0aCA/IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpIDogdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbXNnID09PSAnc3RyaW5nJykgbXNnID0gZm9ybWF0KGFyZ3NDbG9uZWQuc2hpZnQoKSwgYXJnc0Nsb25lZClcbiAgICBpZiAobXNnICE9PSB1bmRlZmluZWQpIGxvZ09iamVjdFtvcHRzLm1lc3NhZ2VLZXldID0gbXNnXG5cbiAgICBjb25zdCBmb3JtYXR0ZWRMb2dPYmplY3QgPSBsb2dPYmplY3RGb3JtYXR0ZXIobG9nT2JqZWN0KVxuICAgIHJldHVybiBbZm9ybWF0dGVkTG9nT2JqZWN0XVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5U2VyaWFsaXplcnMgKGFyZ3MsIHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMsIHN0ZEVyclNlcmlhbGl6ZSkge1xuICBmb3IgKGNvbnN0IGkgaW4gYXJncykge1xuICAgIGlmIChzdGRFcnJTZXJpYWxpemUgJiYgYXJnc1tpXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBhcmdzW2ldID0gcGluby5zdGRTZXJpYWxpemVycy5lcnIoYXJnc1tpXSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzW2ldKSAmJiBzZXJpYWxpemUpIHtcbiAgICAgIGZvciAoY29uc3QgayBpbiBhcmdzW2ldKSB7XG4gICAgICAgIGlmIChzZXJpYWxpemUuaW5kZXhPZihrKSA+IC0xICYmIGsgaW4gc2VyaWFsaXplcnMpIHtcbiAgICAgICAgICBhcmdzW2ldW2tdID0gc2VyaWFsaXplcnNba10oYXJnc1tpXVtrXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc21pdCAobG9nZ2VyLCBvcHRzLCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2VuZCA9IG9wdHMuc2VuZFxuICBjb25zdCB0cyA9IG9wdHMudHNcbiAgY29uc3QgbWV0aG9kTGV2ZWwgPSBvcHRzLm1ldGhvZExldmVsXG4gIGNvbnN0IG1ldGhvZFZhbHVlID0gb3B0cy5tZXRob2RWYWx1ZVxuICBjb25zdCB2YWwgPSBvcHRzLnZhbFxuICBjb25zdCBiaW5kaW5ncyA9IGxvZ2dlci5fbG9nRXZlbnQuYmluZGluZ3NcblxuICBpZiAoIWFyZ3NJc1NlcmlhbGl6ZWQpIHtcbiAgICBhcHBseVNlcmlhbGl6ZXJzKFxuICAgICAgYXJncyxcbiAgICAgIGxvZ2dlci5fc2VyaWFsaXplIHx8IE9iamVjdC5rZXlzKGxvZ2dlci5zZXJpYWxpemVycyksXG4gICAgICBsb2dnZXIuc2VyaWFsaXplcnMsXG4gICAgICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplXG4gICAgKVxuICB9XG5cbiAgbG9nZ2VyLl9sb2dFdmVudC50cyA9IHRzXG4gIGxvZ2dlci5fbG9nRXZlbnQubWVzc2FnZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7XG4gICAgLy8gYmluZGluZ3MgY2FuIG9ubHkgYmUgb2JqZWN0cywgc28gcmVmZXJlbmNlIGVxdWFsaXR5IGNoZWNrIHZpYSBpbmRleE9mIGlzIGZpbmVcbiAgICByZXR1cm4gYmluZGluZ3MuaW5kZXhPZihhcmcpID09PSAtMVxuICB9KVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQubGV2ZWwubGFiZWwgPSBtZXRob2RMZXZlbFxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLnZhbHVlID0gbWV0aG9kVmFsdWVcblxuICBzZW5kKG1ldGhvZExldmVsLCBsb2dnZXIuX2xvZ0V2ZW50LCB2YWwpXG5cbiAgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoYmluZGluZ3MpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ0V2ZW50U2hhcGUgKGJpbmRpbmdzKSB7XG4gIHJldHVybiB7XG4gICAgdHM6IDAsXG4gICAgbWVzc2FnZXM6IFtdLFxuICAgIGJpbmRpbmdzOiBiaW5kaW5ncyB8fCBbXSxcbiAgICBsZXZlbDogeyBsYWJlbDogJycsIHZhbHVlOiAwIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhc0VyclZhbHVlIChlcnIpIHtcbiAgY29uc3Qgb2JqID0ge1xuICAgIHR5cGU6IGVyci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgIG1zZzogZXJyLm1lc3NhZ2UsXG4gICAgc3RhY2s6IGVyci5zdGFja1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVycikge1xuICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IGVycltrZXldXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gZ2V0VGltZUZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICh0eXBlb2Ygb3B0cy50aW1lc3RhbXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0cy50aW1lc3RhbXBcbiAgfVxuICBpZiAob3B0cy50aW1lc3RhbXAgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG51bGxUaW1lXG4gIH1cbiAgcmV0dXJuIGVwb2NoVGltZVxufVxuXG5mdW5jdGlvbiBtb2NrICgpIHsgcmV0dXJuIHt9IH1cbmZ1bmN0aW9uIHBhc3N0aHJvdWdoIChhKSB7IHJldHVybiBhIH1cbmZ1bmN0aW9uIG5vb3AgKCkge31cblxuZnVuY3Rpb24gbnVsbFRpbWUgKCkgeyByZXR1cm4gZmFsc2UgfVxuZnVuY3Rpb24gZXBvY2hUaW1lICgpIHsgcmV0dXJuIERhdGUubm93KCkgfVxuZnVuY3Rpb24gdW5peFRpbWUgKCkgeyByZXR1cm4gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMC4wKSB9XG5mdW5jdGlvbiBpc29UaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkpLnRvSVNPU3RyaW5nKCkgfSAvLyB1c2luZyBEYXRlLm5vdygpIGZvciB0ZXN0YWJpbGl0eVxuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIHBmR2xvYmFsVGhpc09yRmFsbGJhY2sgKCkge1xuICBmdW5jdGlvbiBkZWZkIChvKSB7IHJldHVybiB0eXBlb2YgbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbyB9XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGdsb2JhbFRoaXNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ2dsb2JhbFRoaXMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIE9iamVjdC5wcm90b3R5cGUuZ2xvYmFsVGhpc1xuICAgICAgICByZXR1cm4gKHRoaXMuZ2xvYmFsVGhpcyA9IHRoaXMpXG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICByZXR1cm4gZ2xvYmFsVGhpc1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmQoc2VsZikgfHwgZGVmZCh3aW5kb3cpIHx8IGRlZmQodGhpcykgfHwge31cbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gcGlub1xubW9kdWxlLmV4cG9ydHMucGlubyA9IHBpbm9cblxuLy8gQXR0ZW1wdCB0byBleHRyYWN0IHRoZSB1c2VyIGNhbGxzaXRlIChmaWxlOmxpbmU6Y29sdW1uKVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGdldENhbGxlckxvY2F0aW9uICgpIHtcbiAgY29uc3Qgc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIGlmICghc3RhY2spIHJldHVybiBudWxsXG4gIGNvbnN0IGxpbmVzID0gc3RhY2suc3BsaXQoJ1xcbicpXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsID0gbGluZXNbaV0udHJpbSgpXG4gICAgLy8gc2tpcCBmcmFtZXMgZnJvbSB0aGlzIGZpbGUgYW5kIGludGVybmFsc1xuICAgIGlmICgvKF5hdFxccyspPyhjcmVhdGVXcmFwfExPR3xzZXRcXHMqXFwofGFzT2JqZWN0fE9iamVjdFxcLmFwcGx5fEZ1bmN0aW9uXFwuYXBwbHkpLy50ZXN0KGwpKSBjb250aW51ZVxuICAgIGlmIChsLmluZGV4T2YoJ2Jyb3dzZXIuanMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgaWYgKGwuaW5kZXhPZignbm9kZTppbnRlcm5hbCcpICE9PSAtMSkgY29udGludWVcbiAgICBpZiAobC5pbmRleE9mKCdub2RlX21vZHVsZXMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgLy8gdHJ5IGZvcm1hdHMgbGlrZTogYXQgZnVuYyAoZmlsZTpsaW5lOmNvbCkgb3IgYXQgZmlsZTpsaW5lOmNvbFxuICAgIGxldCBtID0gbC5tYXRjaCgvXFwoKC4qPyk6KFxcZCspOihcXGQrKVxcKS8pXG4gICAgaWYgKCFtKSBtID0gbC5tYXRjaCgvYXRcXHMrKC4qPyk6KFxcZCspOihcXGQrKS8pXG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBtWzFdXG4gICAgICBjb25zdCBsaW5lID0gbVsyXVxuICAgICAgY29uc3QgY29sID0gbVszXVxuICAgICAgcmV0dXJuIGZpbGUgKyAnOicgKyBsaW5lICsgJzonICsgY29sXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG4iLCAibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCAiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5iZWNoMzJtID0gZXhwb3J0cy5iZWNoMzIgPSB2b2lkIDA7XG5jb25zdCBBTFBIQUJFVCA9ICdxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bCc7XG5jb25zdCBBTFBIQUJFVF9NQVAgPSB7fTtcbmZvciAobGV0IHogPSAwOyB6IDwgQUxQSEFCRVQubGVuZ3RoOyB6KyspIHtcbiAgICBjb25zdCB4ID0gQUxQSEFCRVQuY2hhckF0KHopO1xuICAgIEFMUEhBQkVUX01BUFt4XSA9IHo7XG59XG5mdW5jdGlvbiBwb2x5bW9kU3RlcChwcmUpIHtcbiAgICBjb25zdCBiID0gcHJlID4+IDI1O1xuICAgIHJldHVybiAoKChwcmUgJiAweDFmZmZmZmYpIDw8IDUpIF5cbiAgICAgICAgKC0oKGIgPj4gMCkgJiAxKSAmIDB4M2I2YTU3YjIpIF5cbiAgICAgICAgKC0oKGIgPj4gMSkgJiAxKSAmIDB4MjY1MDhlNmQpIF5cbiAgICAgICAgKC0oKGIgPj4gMikgJiAxKSAmIDB4MWVhMTE5ZmEpIF5cbiAgICAgICAgKC0oKGIgPj4gMykgJiAxKSAmIDB4M2Q0MjMzZGQpIF5cbiAgICAgICAgKC0oKGIgPj4gNCkgJiAxKSAmIDB4MmExNDYyYjMpKTtcbn1cbmZ1bmN0aW9uIHByZWZpeENoayhwcmVmaXgpIHtcbiAgICBsZXQgY2hrID0gMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMzMgfHwgYyA+IDEyNilcbiAgICAgICAgICAgIHJldHVybiAnSW52YWxpZCBwcmVmaXggKCcgKyBwcmVmaXggKyAnKSc7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAoYyA+PiA1KTtcbiAgICB9XG4gICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB2ID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAodiAmIDB4MWYpO1xuICAgIH1cbiAgICByZXR1cm4gY2hrO1xufVxuZnVuY3Rpb24gY29udmVydChkYXRhLCBpbkJpdHMsIG91dEJpdHMsIHBhZCkge1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgbGV0IGJpdHMgPSAwO1xuICAgIGNvbnN0IG1heFYgPSAoMSA8PCBvdXRCaXRzKSAtIDE7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIDw8IGluQml0cykgfCBkYXRhW2ldO1xuICAgICAgICBiaXRzICs9IGluQml0cztcbiAgICAgICAgd2hpbGUgKGJpdHMgPj0gb3V0Qml0cykge1xuICAgICAgICAgICAgYml0cyAtPSBvdXRCaXRzO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKHZhbHVlID4+IGJpdHMpICYgbWF4Vik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhZCkge1xuICAgICAgICBpZiAoYml0cyA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoYml0cyA+PSBpbkJpdHMpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VzcyBwYWRkaW5nJztcbiAgICAgICAgaWYgKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpXG4gICAgICAgICAgICByZXR1cm4gJ05vbi16ZXJvIHBhZGRpbmcnO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gdG9Xb3JkcyhieXRlcykge1xuICAgIHJldHVybiBjb252ZXJ0KGJ5dGVzLCA4LCA1LCB0cnVlKTtcbn1cbmZ1bmN0aW9uIGZyb21Xb3Jkc1Vuc2FmZSh3b3Jkcykge1xuICAgIGNvbnN0IHJlcyA9IGNvbnZlcnQod29yZHMsIDUsIDgsIGZhbHNlKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMpKVxuICAgICAgICByZXR1cm4gcmVzO1xufVxuZnVuY3Rpb24gZnJvbVdvcmRzKHdvcmRzKSB7XG4gICAgY29uc3QgcmVzID0gY29udmVydCh3b3JkcywgNSwgOCwgZmFsc2UpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlcykpXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG59XG5mdW5jdGlvbiBnZXRMaWJyYXJ5RnJvbUVuY29kaW5nKGVuY29kaW5nKSB7XG4gICAgbGV0IEVOQ09ESU5HX0NPTlNUO1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2JlY2gzMicpIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAweDJiYzgzMGEzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbmNvZGUocHJlZml4LCB3b3JkcywgTElNSVQpIHtcbiAgICAgICAgTElNSVQgPSBMSU1JVCB8fCA5MDtcbiAgICAgICAgaWYgKHByZWZpeC5sZW5ndGggKyA3ICsgd29yZHMubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeGNlZWRzIGxlbmd0aCBsaW1pdCcpO1xuICAgICAgICBwcmVmaXggPSBwcmVmaXgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGNoayBtb2RcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY2hrKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHByZWZpeCArICcxJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgeCA9IHdvcmRzW2ldO1xuICAgICAgICAgICAgaWYgKHggPj4gNSAhPT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbiA1LWJpdCB3b3JkJyk7XG4gICAgICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4geDtcbiAgICAgICAgICAgIHJlc3VsdCArPSBBTFBIQUJFVC5jaGFyQXQoeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoayk7XG4gICAgICAgIH1cbiAgICAgICAgY2hrIF49IEVOQ09ESU5HX0NPTlNUO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgdiA9IChjaGsgPj4gKCg1IC0gaSkgKiA1KSkgJiAweDFmO1xuICAgICAgICAgICAgcmVzdWx0ICs9IEFMUEhBQkVULmNoYXJBdCh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBfX2RlY29kZShzdHIsIExJTUlUKSB7XG4gICAgICAgIExJTUlUID0gTElNSVQgfHwgOTA7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoIDwgOClcbiAgICAgICAgICAgIHJldHVybiBzdHIgKyAnIHRvbyBzaG9ydCc7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VlZHMgbGVuZ3RoIGxpbWl0JztcbiAgICAgICAgLy8gZG9uJ3QgYWxsb3cgbWl4ZWQgY2FzZVxuICAgICAgICBjb25zdCBsb3dlcmVkID0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHVwcGVyZWQgPSBzdHIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKHN0ciAhPT0gbG93ZXJlZCAmJiBzdHIgIT09IHVwcGVyZWQpXG4gICAgICAgICAgICByZXR1cm4gJ01peGVkLWNhc2Ugc3RyaW5nICcgKyBzdHI7XG4gICAgICAgIHN0ciA9IGxvd2VyZWQ7XG4gICAgICAgIGNvbnN0IHNwbGl0ID0gc3RyLmxhc3RJbmRleE9mKCcxJyk7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gJ05vIHNlcGFyYXRvciBjaGFyYWN0ZXIgZm9yICcgKyBzdHI7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAnTWlzc2luZyBwcmVmaXggZm9yICcgKyBzdHI7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHN0ci5zbGljZSgwLCBzcGxpdCk7XG4gICAgICAgIGNvbnN0IHdvcmRDaGFycyA9IHN0ci5zbGljZShzcGxpdCArIDEpO1xuICAgICAgICBpZiAod29yZENoYXJzLmxlbmd0aCA8IDYpXG4gICAgICAgICAgICByZXR1cm4gJ0RhdGEgdG9vIHNob3J0JztcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gY2hrO1xuICAgICAgICBjb25zdCB3b3JkcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRDaGFycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHdvcmRDaGFycy5jaGFyQXQoaSk7XG4gICAgICAgICAgICBjb25zdCB2ID0gQUxQSEFCRVRfTUFQW2NdO1xuICAgICAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1Vua25vd24gY2hhcmFjdGVyICcgKyBjO1xuICAgICAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeIHY7XG4gICAgICAgICAgICAvLyBub3QgaW4gdGhlIGNoZWNrc3VtP1xuICAgICAgICAgICAgaWYgKGkgKyA2ID49IHdvcmRDaGFycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB3b3Jkcy5wdXNoKHYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGsgIT09IEVOQ09ESU5HX0NPTlNUKVxuICAgICAgICAgICAgcmV0dXJuICdJbnZhbGlkIGNoZWNrc3VtIGZvciAnICsgc3RyO1xuICAgICAgICByZXR1cm4geyBwcmVmaXgsIHdvcmRzIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlY29kZVVuc2FmZShzdHIsIExJTUlUKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IF9fZGVjb2RlKHN0ciwgTElNSVQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNvZGUoc3RyLCBMSU1JVCkge1xuICAgICAgICBjb25zdCByZXMgPSBfX2RlY29kZShzdHIsIExJTUlUKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGRlY29kZVVuc2FmZSxcbiAgICAgICAgZGVjb2RlLFxuICAgICAgICBlbmNvZGUsXG4gICAgICAgIHRvV29yZHMsXG4gICAgICAgIGZyb21Xb3Jkc1Vuc2FmZSxcbiAgICAgICAgZnJvbVdvcmRzLFxuICAgIH07XG59XG5leHBvcnRzLmJlY2gzMiA9IGdldExpYnJhcnlGcm9tRW5jb2RpbmcoJ2JlY2gzMicpO1xuZXhwb3J0cy5iZWNoMzJtID0gZ2V0TGlicmFyeUZyb21FbmNvZGluZygnYmVjaDMybScpO1xuIiwgIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbi8vIFN1cHBvcnQgZGVjb2RpbmcgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ3MsIGFzIE5vZGUuanMgZG9lcy5cbi8vIFNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0I1VSTF9hcHBsaWNhdGlvbnNcbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIGdldExlbnMgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyBUcmltIG9mZiBleHRyYSBieXRlcyBhZnRlciBwbGFjZWhvbGRlciBieXRlcyBhcmUgZm91bmRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVhdGdhbW1pdC9iYXNlNjQtanMvaXNzdWVzLzQyXG4gIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKCc9JylcbiAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW5cblxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlblxuICAgID8gMFxuICAgIDogNCAtICh2YWxpZExlbiAlIDQpXG5cbiAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXVxufVxuXG4vLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiBfYnl0ZUxlbmd0aCAoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuXG4gIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpXG5cbiAgdmFyIGN1ckJ5dGUgPSAwXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICB2YXIgbGVuID0gcGxhY2VIb2xkZXJzTGVuID4gMFxuICAgID8gdmFsaWRMZW4gLSA0XG4gICAgOiB2YWxpZExlblxuXG4gIHZhciBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwgIi8qISBpZWVlNzU0LiBCU0QtMy1DbGF1c2UgTGljZW5zZS4gRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnL29wZW5zb3VyY2U+ICovXG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCAiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbmNvbnN0IGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbmNvbnN0IGN1c3RvbUluc3BlY3RTeW1ib2wgPVxuICAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sWydmb3InXSA9PT0gJ2Z1bmN0aW9uJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA/IFN5bWJvbFsnZm9yJ10oJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA6IG51bGxcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG5jb25zdCBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGNvbnN0IHByb3RvID0geyBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH0gfVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgVWludDhBcnJheS5wcm90b3R5cGUpXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGFyciwgcHJvdG8pXG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAncGFyZW50Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclxuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ29mZnNldCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5ieXRlT2Zmc2V0XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAobGVuZ3RoKSB7XG4gIGlmIChsZW5ndGggPiBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIGxlbmd0aCArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1ZiwgQnVmZmVyLnByb3RvdHlwZSlcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbmZ1bmN0aW9uIGZyb20gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheVZpZXcodmFsdWUpXG4gIH1cblxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2UodmFsdWUsIEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBBcnJheUJ1ZmZlcikpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIChpc0luc3RhbmNlKHZhbHVlLCBTaGFyZWRBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgU2hhcmVkQXJyYXlCdWZmZXIpKSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgKVxuICB9XG5cbiAgY29uc3QgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgY29uc3QgYiA9IGZyb21PYmplY3QodmFsdWUpXG4gIGlmIChiKSByZXR1cm4gYlxuXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9QcmltaXRpdmUgIT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLnByb3RvdHlwZSwgVWludDhBcnJheS5wcm90b3R5cGUpXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLCBVaW50OEFycmF5KVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gIH1cblxuICBjb25zdCBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICBsZXQgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcblxuICBjb25zdCBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICBjb25zdCBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheVZpZXcgKGFycmF5Vmlldykge1xuICBpZiAoaXNJbnN0YW5jZShhcnJheVZpZXcsIFVpbnQ4QXJyYXkpKSB7XG4gICAgY29uc3QgY29weSA9IG5ldyBVaW50OEFycmF5KGFycmF5VmlldylcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKGNvcHkuYnVmZmVyLCBjb3B5LmJ5dGVPZmZzZXQsIGNvcHkuYnl0ZUxlbmd0aClcbiAgfVxuICByZXR1cm4gZnJvbUFycmF5TGlrZShhcnJheVZpZXcpXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJvZmZzZXRcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcImxlbmd0aFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBsZXQgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVmLCBCdWZmZXIucHJvdG90eXBlKVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIGNvbnN0IGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgY29uc3QgYnVmID0gY3JlYXRlQnVmZmVyKGxlbilcblxuICAgIGlmIChidWYubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnVmXG4gICAgfVxuXG4gICAgb2JqLmNvcHkoYnVmLCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIGJ1ZlxuICB9XG5cbiAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYU4ob2JqLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICB9XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqKVxuICB9XG5cbiAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iai5kYXRhKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZSAmJlxuICAgIGIgIT09IEJ1ZmZlci5wcm90b3R5cGUgLy8gc28gQnVmZmVyLmlzQnVmZmVyKEJ1ZmZlci5wcm90b3R5cGUpIHdpbGwgYmUgZmFsc2Vcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmIChpc0luc3RhbmNlKGEsIFVpbnQ4QXJyYXkpKSBhID0gQnVmZmVyLmZyb20oYSwgYS5vZmZzZXQsIGEuYnl0ZUxlbmd0aClcbiAgaWYgKGlzSW5zdGFuY2UoYiwgVWludDhBcnJheSkpIGIgPSBCdWZmZXIuZnJvbShiLCBiLm9mZnNldCwgYi5ieXRlTGVuZ3RoKVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJidWYxXCIsIFwiYnVmMlwiIGFyZ3VtZW50cyBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5J1xuICAgIClcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIGxldCB4ID0gYS5sZW5ndGhcbiAgbGV0IHkgPSBiLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgbGV0IGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICBsZXQgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIGxldCBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgaWYgKHBvcyArIGJ1Zi5sZW5ndGggPiBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIGJ1ZiA9IEJ1ZmZlci5mcm9tKGJ1ZilcbiAgICAgICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgYnVmLFxuICAgICAgICAgIHBvc1xuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIH1cbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgY29uc3QgbXVzdE1hdGNoID0gKGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSA9PT0gdHJ1ZSlcbiAgaWYgKCFtdXN0TWF0Y2ggJiYgbGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICBsZXQgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB7XG4gICAgICAgICAgcmV0dXJuIG11c3RNYXRjaCA/IC0xIDogdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgfVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJjaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCAoYW5kIHRoZSBgaXMtYnVmZmVyYCBucG0gcGFja2FnZSlcbi8vIHRvIGRldGVjdCBhIEJ1ZmZlciBpbnN0YW5jZS4gSXQncyBub3QgcG9zc2libGUgdG8gdXNlIGBpbnN0YW5jZW9mIEJ1ZmZlcmBcbi8vIHJlbGlhYmx5IGluIGEgYnJvd3NlcmlmeSBjb250ZXh0IGJlY2F1c2UgdGhlcmUgY291bGQgYmUgbXVsdGlwbGUgZGlmZmVyZW50XG4vLyBjb3BpZXMgb2YgdGhlICdidWZmZXInIHBhY2thZ2UgaW4gdXNlLiBUaGlzIG1ldGhvZCB3b3JrcyBldmVuIGZvciBCdWZmZXJcbi8vIGluc3RhbmNlcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIGFub3RoZXIgY29weSBvZiB0aGUgYGJ1ZmZlcmAgcGFja2FnZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE1NFxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgY29uc3QgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcgPSBCdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgbGV0IHN0ciA9ICcnXG4gIGNvbnN0IG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKVxuICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5pZiAoY3VzdG9tSW5zcGVjdFN5bWJvbCkge1xuICBCdWZmZXIucHJvdG90eXBlW2N1c3RvbUluc3BlY3RTeW1ib2xdID0gQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmIChpc0luc3RhbmNlKHRhcmdldCwgVWludDhBcnJheSkpIHtcbiAgICB0YXJnZXQgPSBCdWZmZXIuZnJvbSh0YXJnZXQsIHRhcmdldC5vZmZzZXQsIHRhcmdldC5ieXRlTGVuZ3RoKVxuICB9XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInRhcmdldFwiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXkuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdGFyZ2V0KVxuICAgIClcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIGxldCB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICBsZXQgeSA9IGVuZCAtIHN0YXJ0XG4gIGNvbnN0IGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgY29uc3QgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgY29uc3QgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgW3ZhbF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIGxldCBpbmRleFNpemUgPSAxXG4gIGxldCBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIGxldCB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIGxldCBpXG4gIGlmIChkaXIpIHtcbiAgICBsZXQgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIGNvbnN0IHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBsZXQgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKG51bWJlcklzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICBjb25zdCByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIGxldCBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgY29uc3QgcmVzID0gW11cblxuICBsZXQgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgY29uc3QgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgbGV0IGNvZGVQb2ludCA9IG51bGxcbiAgICBsZXQgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKVxuICAgICAgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKVxuICAgICAgICAgID8gM1xuICAgICAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpXG4gICAgICAgICAgICAgID8gMlxuICAgICAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIGxldCBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbmNvbnN0IE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICBjb25zdCBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIGxldCByZXMgPSAnJ1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGxldCByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICBsZXQgb3V0ID0gJydcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gaGV4U2xpY2VMb29rdXBUYWJsZVtidWZbaV1dXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBjb25zdCBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICBsZXQgcmVzID0gJydcbiAgLy8gSWYgYnl0ZXMubGVuZ3RoIGlzIG9kZCwgdGhlIGxhc3QgOCBiaXRzIG11c3QgYmUgaWdub3JlZCAoc2FtZSBhcyBub2RlLmpzKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICBjb25zdCBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihuZXdCdWYsIEJ1ZmZlci5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludExFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0XVxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50QkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIGxldCBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDggPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDE2TEUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQzMkxFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDMyQkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnVUludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ1VJbnQ2NExFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgbG8gPSBmaXJzdCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDI0XG5cbiAgY29uc3QgaGkgPSB0aGlzWysrb2Zmc2V0XSArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgbGFzdCAqIDIgKiogMjRcblxuICByZXR1cm4gQmlnSW50KGxvKSArIChCaWdJbnQoaGkpIDw8IEJpZ0ludCgzMikpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdVSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnVUludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCBoaSA9IGZpcnN0ICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF1cblxuICBjb25zdCBsbyA9IHRoaXNbKytvZmZzZXRdICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgbGFzdFxuXG4gIHJldHVybiAoQmlnSW50KGhpKSA8PCBCaWdJbnQoMzIpKSArIEJpZ0ludChsbylcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldF1cbiAgbGV0IG11bCA9IDFcbiAgbGV0IGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICBsZXQgaSA9IGJ5dGVMZW5ndGhcbiAgbGV0IG11bCA9IDFcbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICBjb25zdCB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnSW50NjRMRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgNF0gK1xuICAgIHRoaXNbb2Zmc2V0ICsgNV0gKiAyICoqIDggK1xuICAgIHRoaXNbb2Zmc2V0ICsgNl0gKiAyICoqIDE2ICtcbiAgICAobGFzdCA8PCAyNCkgLy8gT3ZlcmZsb3dcblxuICByZXR1cm4gKEJpZ0ludCh2YWwpIDw8IEJpZ0ludCgzMikpICtcbiAgICBCaWdJbnQoZmlyc3QgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAyNClcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ0ludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ0ludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCB2YWwgPSAoZmlyc3QgPDwgMjQpICsgLy8gT3ZlcmZsb3dcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XVxuXG4gIHJldHVybiAoQmlnSW50KHZhbCkgPDwgQmlnSW50KDMyKSkgK1xuICAgIEJpZ0ludCh0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjQgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIGxhc3QpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnRMRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludEJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIGxldCBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgbGV0IG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50OCA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQxNkxFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDMyTEUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQzMkJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIHdydEJpZ1VJbnQ2NExFIChidWYsIHZhbHVlLCBvZmZzZXQsIG1pbiwgbWF4KSB7XG4gIGNoZWNrSW50QkkodmFsdWUsIG1pbiwgbWF4LCBidWYsIG9mZnNldCwgNylcblxuICBsZXQgbG8gPSBOdW1iZXIodmFsdWUgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsZXQgaGkgPSBOdW1iZXIodmFsdWUgPj4gQmlnSW50KDMyKSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIHJldHVybiBvZmZzZXRcbn1cblxuZnVuY3Rpb24gd3J0QmlnVUludDY0QkUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbWluLCBtYXgpIHtcbiAgY2hlY2tJbnRCSSh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCA3KVxuXG4gIGxldCBsbyA9IE51bWJlcih2YWx1ZSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCArIDddID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQgKyA2XSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0ICsgNV0gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCArIDRdID0gbG9cbiAgbGV0IGhpID0gTnVtYmVyKHZhbHVlID4+IEJpZ0ludCgzMikgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQgKyAzXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0ICsgMl0gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCArIDFdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXRdID0gaGlcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ1VJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnVUludDY0TEUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRMRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBCaWdJbnQoMCksIEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnVUludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdVSW50NjRCRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NEJFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIEJpZ0ludCgwKSwgQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSAwXG4gIGxldCBtdWwgPSAxXG4gIGxldCBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSBieXRlTGVuZ3RoIC0gMVxuICBsZXQgbXVsID0gMVxuICBsZXQgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ0ludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdJbnQ2NExFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0TEUodGhpcywgdmFsdWUsIG9mZnNldCwgLUJpZ0ludCgnMHg4MDAwMDAwMDAwMDAwMDAwJyksIEJpZ0ludCgnMHg3ZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ0ludDY0QkUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRCRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAtQmlnSW50KCcweDgwMDAwMDAwMDAwMDAwMDAnKSwgQmlnSW50KCcweDdmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IHNob3VsZCBiZSBhIEJ1ZmZlcicpXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICBjb25zdCBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKChlbmNvZGluZyA9PT0gJ3V0ZjgnICYmIGNvZGUgPCAxMjgpIHx8XG4gICAgICAgICAgZW5jb2RpbmcgPT09ICdsYXRpbjEnKSB7XG4gICAgICAgIC8vIEZhc3QgcGF0aDogSWYgYHZhbGAgZml0cyBpbnRvIGEgc2luZ2xlIGJ5dGUsIHVzZSB0aGF0IG51bWVyaWMgdmFsdWUuXG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWwgPSBOdW1iZXIodmFsKVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIGxldCBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgICBjb25zdCBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgdmFsdWUgXCInICsgdmFsICtcbiAgICAgICAgJ1wiIGlzIGludmFsaWQgZm9yIGFyZ3VtZW50IFwidmFsdWVcIicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIENVU1RPTSBFUlJPUlNcbi8vID09PT09PT09PT09PT1cblxuLy8gU2ltcGxpZmllZCB2ZXJzaW9ucyBmcm9tIE5vZGUsIGNoYW5nZWQgZm9yIEJ1ZmZlci1vbmx5IHVzYWdlXG5jb25zdCBlcnJvcnMgPSB7fVxuZnVuY3Rpb24gRSAoc3ltLCBnZXRNZXNzYWdlLCBCYXNlKSB7XG4gIGVycm9yc1tzeW1dID0gY2xhc3MgTm9kZUVycm9yIGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgc3VwZXIoKVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ21lc3NhZ2UnLCB7XG4gICAgICAgIHZhbHVlOiBnZXRNZXNzYWdlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIC8vIEFkZCB0aGUgZXJyb3IgY29kZSB0byB0aGUgbmFtZSB0byBpbmNsdWRlIGl0IGluIHRoZSBzdGFjayB0cmFjZS5cbiAgICAgIHRoaXMubmFtZSA9IGAke3RoaXMubmFtZX0gWyR7c3ltfV1gXG4gICAgICAvLyBBY2Nlc3MgdGhlIHN0YWNrIHRvIGdlbmVyYXRlIHRoZSBlcnJvciBtZXNzYWdlIGluY2x1ZGluZyB0aGUgZXJyb3IgY29kZVxuICAgICAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgICAgIHRoaXMuc3RhY2sgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgICAgIC8vIFJlc2V0IHRoZSBuYW1lIHRvIHRoZSBhY3R1YWwgbmFtZS5cbiAgICAgIGRlbGV0ZSB0aGlzLm5hbWVcbiAgICB9XG5cbiAgICBnZXQgY29kZSAoKSB7XG4gICAgICByZXR1cm4gc3ltXG4gICAgfVxuXG4gICAgc2V0IGNvZGUgKHZhbHVlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvZGUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRvU3RyaW5nICgpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9IFske3N5bX1dOiAke3RoaXMubWVzc2FnZX1gXG4gICAgfVxuICB9XG59XG5cbkUoJ0VSUl9CVUZGRVJfT1VUX09GX0JPVU5EUycsXG4gIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJldHVybiBgJHtuYW1lfSBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHNgXG4gICAgfVxuXG4gICAgcmV0dXJuICdBdHRlbXB0IHRvIGFjY2VzcyBtZW1vcnkgb3V0c2lkZSBidWZmZXIgYm91bmRzJ1xuICB9LCBSYW5nZUVycm9yKVxuRSgnRVJSX0lOVkFMSURfQVJHX1RZUEUnLFxuICBmdW5jdGlvbiAobmFtZSwgYWN0dWFsKSB7XG4gICAgcmV0dXJuIGBUaGUgXCIke25hbWV9XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBhY3R1YWx9YFxuICB9LCBUeXBlRXJyb3IpXG5FKCdFUlJfT1VUX09GX1JBTkdFJyxcbiAgZnVuY3Rpb24gKHN0ciwgcmFuZ2UsIGlucHV0KSB7XG4gICAgbGV0IG1zZyA9IGBUaGUgdmFsdWUgb2YgXCIke3N0cn1cIiBpcyBvdXQgb2YgcmFuZ2UuYFxuICAgIGxldCByZWNlaXZlZCA9IGlucHV0XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIoaW5wdXQpICYmIE1hdGguYWJzKGlucHV0KSA+IDIgKiogMzIpIHtcbiAgICAgIHJlY2VpdmVkID0gYWRkTnVtZXJpY2FsU2VwYXJhdG9yKFN0cmluZyhpbnB1dCkpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdiaWdpbnQnKSB7XG4gICAgICByZWNlaXZlZCA9IFN0cmluZyhpbnB1dClcbiAgICAgIGlmIChpbnB1dCA+IEJpZ0ludCgyKSAqKiBCaWdJbnQoMzIpIHx8IGlucHV0IDwgLShCaWdJbnQoMikgKiogQmlnSW50KDMyKSkpIHtcbiAgICAgICAgcmVjZWl2ZWQgPSBhZGROdW1lcmljYWxTZXBhcmF0b3IocmVjZWl2ZWQpXG4gICAgICB9XG4gICAgICByZWNlaXZlZCArPSAnbidcbiAgICB9XG4gICAgbXNnICs9IGAgSXQgbXVzdCBiZSAke3JhbmdlfS4gUmVjZWl2ZWQgJHtyZWNlaXZlZH1gXG4gICAgcmV0dXJuIG1zZ1xuICB9LCBSYW5nZUVycm9yKVxuXG5mdW5jdGlvbiBhZGROdW1lcmljYWxTZXBhcmF0b3IgKHZhbCkge1xuICBsZXQgcmVzID0gJydcbiAgbGV0IGkgPSB2YWwubGVuZ3RoXG4gIGNvbnN0IHN0YXJ0ID0gdmFsWzBdID09PSAnLScgPyAxIDogMFxuICBmb3IgKDsgaSA+PSBzdGFydCArIDQ7IGkgLT0gMykge1xuICAgIHJlcyA9IGBfJHt2YWwuc2xpY2UoaSAtIDMsIGkpfSR7cmVzfWBcbiAgfVxuICByZXR1cm4gYCR7dmFsLnNsaWNlKDAsIGkpfSR7cmVzfWBcbn1cblxuLy8gQ0hFQ0sgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gY2hlY2tCb3VuZHMgKGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGlmIChidWZbb2Zmc2V0XSA9PT0gdW5kZWZpbmVkIHx8IGJ1ZltvZmZzZXQgKyBieXRlTGVuZ3RoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCBidWYubGVuZ3RoIC0gKGJ5dGVMZW5ndGggKyAxKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0ludEJJICh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikge1xuICAgIGNvbnN0IG4gPSB0eXBlb2YgbWluID09PSAnYmlnaW50JyA/ICduJyA6ICcnXG4gICAgbGV0IHJhbmdlXG4gICAgaWYgKGJ5dGVMZW5ndGggPiAzKSB7XG4gICAgICBpZiAobWluID09PSAwIHx8IG1pbiA9PT0gQmlnSW50KDApKSB7XG4gICAgICAgIHJhbmdlID0gYD49IDAke259IGFuZCA8IDIke259ICoqICR7KGJ5dGVMZW5ndGggKyAxKSAqIDh9JHtufWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gYD49IC0oMiR7bn0gKiogJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufSkgYW5kIDwgMiAqKiBgICtcbiAgICAgICAgICAgICAgICBgJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZ2UgPSBgPj0gJHttaW59JHtufSBhbmQgPD0gJHttYXh9JHtufWBcbiAgICB9XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfT1VUX09GX1JBTkdFKCd2YWx1ZScsIHJhbmdlLCB2YWx1ZSlcbiAgfVxuICBjaGVja0JvdW5kcyhidWYsIG9mZnNldCwgYnl0ZUxlbmd0aClcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVOdW1iZXIgKHZhbHVlLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfSU5WQUxJRF9BUkdfVFlQRShuYW1lLCAnbnVtYmVyJywgdmFsdWUpXG4gIH1cbn1cblxuZnVuY3Rpb24gYm91bmRzRXJyb3IgKHZhbHVlLCBsZW5ndGgsIHR5cGUpIHtcbiAgaWYgKE1hdGguZmxvb3IodmFsdWUpICE9PSB2YWx1ZSkge1xuICAgIHZhbGlkYXRlTnVtYmVyKHZhbHVlLCB0eXBlKVxuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX09VVF9PRl9SQU5HRSh0eXBlIHx8ICdvZmZzZXQnLCAnYW4gaW50ZWdlcicsIHZhbHVlKVxuICB9XG5cbiAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9CVUZGRVJfT1VUX09GX0JPVU5EUygpXG4gIH1cblxuICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9PVVRfT0ZfUkFOR0UodHlwZSB8fCAnb2Zmc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA+PSAke3R5cGUgPyAxIDogMH0gYW5kIDw9ICR7bGVuZ3RofWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSlcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5jb25zdCBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHRha2VzIGVxdWFsIHNpZ25zIGFzIGVuZCBvZiB0aGUgQmFzZTY0IGVuY29kaW5nXG4gIHN0ciA9IHN0ci5zcGxpdCgnPScpWzBdXG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgbGV0IGNvZGVQb2ludFxuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIGxldCBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICBjb25zdCBieXRlcyA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIGNvbnN0IGJ5dGVBcnJheSA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgbGV0IGMsIGhpLCBsb1xuICBjb25zdCBieXRlQXJyYXkgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGxldCBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG4vLyBBcnJheUJ1ZmZlciBvciBVaW50OEFycmF5IG9iamVjdHMgZnJvbSBvdGhlciBjb250ZXh0cyAoaS5lLiBpZnJhbWVzKSBkbyBub3QgcGFzc1xuLy8gdGhlIGBpbnN0YW5jZW9mYCBjaGVjayBidXQgdGhleSBzaG91bGQgYmUgdHJlYXRlZCBhcyBvZiB0aGF0IHR5cGUuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNjZcbmZ1bmN0aW9uIGlzSW5zdGFuY2UgKG9iaiwgdHlwZSkge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgdHlwZSB8fFxuICAgIChvYmogIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPSBudWxsICYmXG4gICAgICBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gdHlwZS5uYW1lKVxufVxuZnVuY3Rpb24gbnVtYmVySXNOYU4gKG9iaikge1xuICAvLyBGb3IgSUUxMSBzdXBwb3J0XG4gIHJldHVybiBvYmogIT09IG9iaiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG4vLyBDcmVhdGUgbG9va3VwIHRhYmxlIGZvciBgdG9TdHJpbmcoJ2hleCcpYFxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMjE5XG5jb25zdCBoZXhTbGljZUxvb2t1cFRhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgYWxwaGFiZXQgPSAnMDEyMzQ1Njc4OWFiY2RlZidcbiAgY29uc3QgdGFibGUgPSBuZXcgQXJyYXkoMjU2KVxuICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICBjb25zdCBpMTYgPSBpICogMTZcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDE2OyArK2opIHtcbiAgICAgIHRhYmxlW2kxNiArIGpdID0gYWxwaGFiZXRbaV0gKyBhbHBoYWJldFtqXVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFibGVcbn0pKClcblxuLy8gUmV0dXJuIG5vdCBmdW5jdGlvbiB3aXRoIEVycm9yIGlmIEJpZ0ludCBub3Qgc3VwcG9ydGVkXG5mdW5jdGlvbiBkZWZpbmVCaWdJbnRNZXRob2QgKGZuKSB7XG4gIHJldHVybiB0eXBlb2YgQmlnSW50ID09PSAndW5kZWZpbmVkJyA/IEJ1ZmZlckJpZ0ludE5vdERlZmluZWQgOiBmblxufVxuXG5mdW5jdGlvbiBCdWZmZXJCaWdJbnROb3REZWZpbmVkICgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdCaWdJbnQgbm90IHN1cHBvcnRlZCcpXG59XG4iLCAiaW1wb3J0IHsgZGVsZXRlREIgfSBmcm9tICdpZGInO1xuaW1wb3J0IHsgZG93bmxvYWRBbGxDb250ZW50cywgZ2V0SG9zdHMsIHNvcnRCeUluZGV4IH0gZnJvbSAnLi4vdXRpbGl0aWVzL2RiJztcbmltcG9ydCB7IGdldFByb2ZpbGVzLCBLSU5EUyB9IGZyb20gJy4uL3V0aWxpdGllcy91dGlscyc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmNvbnN0IFRPTU9SUk9XID0gbmV3IERhdGUoKTtcblRPTU9SUk9XLnNldERhdGUoVE9NT1JST1cuZ2V0RGF0ZSgpICsgMSk7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGV2ZW50czogW10sXG4gICAgdmlldzogJ2NyZWF0ZWRfYXQnLFxuICAgIG1heDogMTAwLFxuICAgIHNvcnQ6ICdhc2MnLFxuICAgIGFsbEhvc3RzOiBbXSxcbiAgICBob3N0OiAnJyxcbiAgICBhbGxQcm9maWxlczogW10sXG4gICAgcHJvZmlsZTogJycsXG4gICAgcHVia2V5OiAnJyxcbiAgICBzZWxlY3RlZDogbnVsbCxcbiAgICBjb3BpZWQ6IGZhbHNlLFxuXG4gICAgLy8gZGF0ZSB2aWV3XG4gICAgZnJvbUNyZWF0ZWRBdDogJzIwMDgtMTAtMzEnLFxuICAgIHRvQ3JlYXRlZEF0OiBUT01PUlJPVy50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG5cbiAgICAvLyBraW5kIHZpZXdcbiAgICBxdWlja0tpbmQ6ICcnLFxuICAgIGZyb21LaW5kOiAwLFxuICAgIHRvS2luZDogNTAwMDAsXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gZ2V0RnJvbVRpbWUoKSB7XG4gICAgY29uc3QgZHQgPSBuZXcgRGF0ZShzdGF0ZS5mcm9tQ3JlYXRlZEF0KTtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihkdC5nZXRUaW1lKCkgLyAxMDAwKTtcbn1cblxuZnVuY3Rpb24gZ2V0VG9UaW1lKCkge1xuICAgIGNvbnN0IGR0ID0gbmV3IERhdGUoc3RhdGUudG9DcmVhdGVkQXQpO1xuICAgIHJldHVybiBNYXRoLmZsb29yKGR0LmdldFRpbWUoKSAvIDEwMDApO1xufVxuXG5mdW5jdGlvbiBnZXRLZXlSYW5nZSgpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnZpZXcpIHtcbiAgICAgICAgY2FzZSAnY3JlYXRlZF9hdCc6XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2UuYm91bmQoZ2V0RnJvbVRpbWUoKSwgZ2V0VG9UaW1lKCkpO1xuICAgICAgICBjYXNlICdraW5kJzpcbiAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5ib3VuZChzdGF0ZS5mcm9tS2luZCwgc3RhdGUudG9LaW5kKTtcbiAgICAgICAgY2FzZSAnaG9zdCc6XG4gICAgICAgICAgICBpZiAoc3RhdGUuaG9zdC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLm9ubHkoc3RhdGUuaG9zdCk7XG4gICAgICAgIGNhc2UgJ3B1YmtleSc6XG4gICAgICAgICAgICBpZiAoc3RhdGUucHVia2V5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2Uub25seShzdGF0ZS5wdWJrZXkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKGVwb2NoU2Vjb25kcykge1xuICAgIHJldHVybiBuZXcgRGF0ZShlcG9jaFNlY29uZHMgKiAxMDAwKS50b1VUQ1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRLaW5kKGtpbmQpIHtcbiAgICBjb25zdCBrID0gS0lORFMuZmluZCgoW2tOdW1dKSA9PiBrTnVtID09PSBraW5kKTtcbiAgICByZXR1cm4gayA/IGAke2tbMV19ICgke2tpbmR9KWAgOiBgVW5rbm93biAoJHtraW5kfSlgO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFZpZXcgc2VsZWN0XG4gICAgY29uc3Qgdmlld1NlbGVjdCA9ICQoJ3ZpZXcnKTtcbiAgICBjb25zdCBzb3J0U2VsZWN0ID0gJCgnc29ydCcpO1xuICAgIGNvbnN0IG1heElucHV0ID0gJCgnbWF4Jyk7XG5cbiAgICBpZiAodmlld1NlbGVjdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB2aWV3U2VsZWN0KSB2aWV3U2VsZWN0LnZhbHVlID0gc3RhdGUudmlldztcbiAgICBpZiAoc29ydFNlbGVjdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBzb3J0U2VsZWN0KSBzb3J0U2VsZWN0LnZhbHVlID0gc3RhdGUuc29ydDtcbiAgICBpZiAobWF4SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbWF4SW5wdXQpIG1heElucHV0LnZhbHVlID0gc3RhdGUubWF4O1xuXG4gICAgLy8gU2hvdy9oaWRlIGZpbHRlciBzZWN0aW9uc1xuICAgIGNvbnN0IGRhdGVGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwiY3JlYXRlZF9hdFwiXScpO1xuICAgIGNvbnN0IGtpbmRGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwia2luZFwiXScpO1xuICAgIGNvbnN0IGhvc3RGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwiaG9zdFwiXScpO1xuICAgIGNvbnN0IHB1YmtleUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maWx0ZXI9XCJwdWJrZXlcIl0nKTtcblxuICAgIGRhdGVGaWx0ZXJzLmZvckVhY2goZWwgPT4gZWwuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnZpZXcgPT09ICdjcmVhdGVkX2F0JyA/ICcnIDogJ25vbmUnKTtcbiAgICBraW5kRmlsdGVycy5mb3JFYWNoKGVsID0+IGVsLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS52aWV3ID09PSAna2luZCcgPyAnJyA6ICdub25lJyk7XG4gICAgaG9zdEZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ2hvc3QnID8gJycgOiAnbm9uZScpO1xuICAgIHB1YmtleUZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ3B1YmtleScgPyAnJyA6ICdub25lJyk7XG5cbiAgICAvLyBEYXRlIGlucHV0c1xuICAgIGNvbnN0IGZyb21DcmVhdGVkQXQgPSAkKCdmcm9tQ3JlYXRlZEF0Jyk7XG4gICAgY29uc3QgdG9DcmVhdGVkQXQgPSAkKCd0b0NyZWF0ZWRBdCcpO1xuICAgIGlmIChmcm9tQ3JlYXRlZEF0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGZyb21DcmVhdGVkQXQpIGZyb21DcmVhdGVkQXQudmFsdWUgPSBzdGF0ZS5mcm9tQ3JlYXRlZEF0O1xuICAgIGlmICh0b0NyZWF0ZWRBdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0b0NyZWF0ZWRBdCkgdG9DcmVhdGVkQXQudmFsdWUgPSBzdGF0ZS50b0NyZWF0ZWRBdDtcblxuICAgIC8vIEtpbmQgaW5wdXRzXG4gICAgY29uc3QgZnJvbUtpbmQgPSAkKCdmcm9tS2luZCcpO1xuICAgIGNvbnN0IHRvS2luZCA9ICQoJ3RvS2luZCcpO1xuICAgIGlmIChmcm9tS2luZCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBmcm9tS2luZCkgZnJvbUtpbmQudmFsdWUgPSBzdGF0ZS5mcm9tS2luZDtcbiAgICBpZiAodG9LaW5kICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRvS2luZCkgdG9LaW5kLnZhbHVlID0gc3RhdGUudG9LaW5kO1xuXG4gICAgLy8gUXVpY2sga2luZCBzZWxlY3RcbiAgICBjb25zdCBraW5kU2hvcnRjdXQgPSAkKCdraW5kU2hvcnRjdXQnKTtcbiAgICBpZiAoa2luZFNob3J0Y3V0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGtpbmRTaG9ydGN1dCkga2luZFNob3J0Y3V0LnZhbHVlID0gc3RhdGUucXVpY2tLaW5kO1xuXG4gICAgLy8gSG9zdCBzZWxlY3RcbiAgICBjb25zdCBob3N0U2VsZWN0ID0gJCgnaG9zdCcpO1xuICAgIGlmIChob3N0U2VsZWN0KSB7XG4gICAgICAgIGhvc3RTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHN0YXRlLmFsbEhvc3RzLm1hcChoID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NhcGVIdG1sKGgpfVwiICR7c3RhdGUuaG9zdCA9PT0gaCA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NhcGVIdG1sKGgpfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8vIFByb2ZpbGVzIHNlbGVjdFxuICAgIGNvbnN0IHByb2ZpbGVTZWxlY3QgPSAkKCdwcm9maWxlcycpO1xuICAgIGlmIChwcm9maWxlU2VsZWN0KSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lcyA9IHN0YXRlLmFsbFByb2ZpbGVzLm1hcChwID0+IHAubmFtZSk7XG4gICAgICAgIHByb2ZpbGVTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHByb2ZpbGVOYW1lcy5tYXAocCA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbChwKX1cIiAke3N0YXRlLnByb2ZpbGUgPT09IHAgPyAnc2VsZWN0ZWQnIDogJyd9PiR7ZXNjYXBlSHRtbChwKX08L29wdGlvbj5gKS5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvLyBQdWJrZXkgaW5wdXRcbiAgICBjb25zdCBwdWJrZXlJbnB1dCA9ICQoJ3B1YmtleScpO1xuICAgIGlmIChwdWJrZXlJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBwdWJrZXlJbnB1dCkgcHVia2V5SW5wdXQudmFsdWUgPSBzdGF0ZS5wdWJrZXk7XG5cbiAgICAvLyBFdmVudCBsaXN0XG4gICAgY29uc3QgZXZlbnRMaXN0ID0gJCgnZXZlbnQtbGlzdCcpO1xuICAgIGlmIChldmVudExpc3QpIHtcbiAgICAgICAgZXZlbnRMaXN0LmlubmVySFRNTCA9IHN0YXRlLmV2ZW50cy5tYXAoKGV2ZW50LCBpbmRleCkgPT4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm10LTMgYm9yZGVyLXNvbGlkIGJvcmRlciBib3JkZXItbW9ub2thaS1iZy1saWdodGVyIHJvdW5kZWQtbGdcIj5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwic2VsZWN0LW5vbmUgZmxleCBjdXJzb3ItcG9pbnRlciB0ZXh0LXNtIG1kOnRleHQteGxcIlxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cInRvZ2dsZS1ldmVudFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleC1ub25lIHctMTQgcC00IGZvbnQtZXh0cmFib2xkXCI+JHtzdGF0ZS5zZWxlY3RlZCA9PT0gaW5kZXggPyAnLScgOiAnKyd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LTEgdy02NCBwLTRcIj4ke2VzY2FwZUh0bWwoZm9ybWF0RGF0ZShldmVudC5tZXRhZGF0YS5zaWduZWRfYXQpKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChldmVudC5tZXRhZGF0YS5ob3N0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChmb3JtYXRLaW5kKGV2ZW50LmV2ZW50LmtpbmQpKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtYWN0aW9uPVwiY29weS1ldmVudFwiIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiIGNsYXNzPVwiY3Vyc29yLXBvaW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHByZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWItbGcgYmctbW9ub2thaS1iZy1saWdodGVyIHRleHQtc20gbWQ6dGV4dC1iYXNlIHAtNCBvdmVyZmxvdy14LWF1dG9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5OiR7c3RhdGUuc2VsZWN0ZWQgPT09IGluZGV4ID8gJ2Jsb2NrJyA6ICdub25lJ307XCJcbiAgICAgICAgICAgICAgICAgICAgPiR7ZXNjYXBlSHRtbChKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgMikpfTwvcHJlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpO1xuXG4gICAgICAgIC8vIEJpbmQgZXZlbnQgdG9nZ2xlXG4gICAgICAgIGV2ZW50TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtZXZlbnRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGVsLmRhdGFzZXQuaW5kZXgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkID0gc3RhdGUuc2VsZWN0ZWQgPT09IGlkeCA/IG51bGwgOiBpZHg7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBjb3B5IGV2ZW50XG4gICAgICAgIGV2ZW50TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjb3B5LWV2ZW50XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBwYXJzZUludChlbC5kYXRhc2V0LmluZGV4KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb3B5RXZlbnQoaWR4KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3BpZWQgdG9hc3RcbiAgICBjb25zdCBjb3BpZWRUb2FzdCA9ICQoJ2NvcGllZC10b2FzdCcpO1xuICAgIGlmIChjb3BpZWRUb2FzdCkgY29waWVkVG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLmNvcGllZCA/ICdibG9jaycgOiAnbm9uZSc7XG59XG5cbi8vIC0tLSBBY3Rpb25zIC0tLVxuXG5hc3luYyBmdW5jdGlvbiByZWxvYWQoKSB7XG4gICAgY29uc3QgZXZlbnRzID0gYXdhaXQgc29ydEJ5SW5kZXgoXG4gICAgICAgIHN0YXRlLnZpZXcsXG4gICAgICAgIGdldEtleVJhbmdlKCksXG4gICAgICAgIHN0YXRlLnNvcnQgPT09ICdhc2MnLFxuICAgICAgICBzdGF0ZS5tYXgsXG4gICAgKTtcbiAgICBzdGF0ZS5ldmVudHMgPSBldmVudHMubWFwKGUgPT4gKHsgLi4uZSwgY29waWVkOiBmYWxzZSB9KSk7XG5cbiAgICBnZXRIb3N0cygpLnRoZW4oaG9zdHMgPT4geyBzdGF0ZS5hbGxIb3N0cyA9IGhvc3RzOyByZW5kZXIoKTsgfSk7XG5cbiAgICBjb25zdCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgc3RhdGUuYWxsUHJvZmlsZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgcHJvZmlsZXMubWFwKGFzeW5jIChwcm9maWxlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcbiAgICAgICAgICAgIHB1YmtleTogYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KSksXG4gICAgKTtcblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlQWxsKCkge1xuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBkb3dubG9hZEFsbENvbnRlbnRzKCk7XG4gICAgYXBpLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUFsbCgpIHtcbiAgICBpZiAoY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBBTEwgZXZlbnRzPycpKSB7XG4gICAgICAgIGF3YWl0IGRlbGV0ZURCKCdldmVudHMnKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBxdWlja0tpbmRTZWxlY3QoKSB7XG4gICAgaWYgKHN0YXRlLnF1aWNrS2luZCA9PT0gJycpIHJldHVybjtcbiAgICBjb25zdCBpID0gcGFyc2VJbnQoc3RhdGUucXVpY2tLaW5kKTtcbiAgICBzdGF0ZS5mcm9tS2luZCA9IGk7XG4gICAgc3RhdGUudG9LaW5kID0gaTtcbiAgICByZWxvYWQoKTtcbn1cblxuZnVuY3Rpb24gcGtGcm9tUHJvZmlsZSgpIHtcbiAgICBjb25zdCBmb3VuZCA9IHN0YXRlLmFsbFByb2ZpbGVzLmZpbmQoKHsgbmFtZSB9KSA9PiBuYW1lID09PSBzdGF0ZS5wcm9maWxlKTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgc3RhdGUucHVia2V5ID0gZm91bmQucHVia2V5O1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlFdmVudChpbmRleCkge1xuICAgIGNvbnN0IGV2ZW50ID0gSlNPTi5zdHJpbmdpZnkoc3RhdGUuZXZlbnRzW2luZGV4XSk7XG4gICAgc3RhdGUuY29waWVkID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuY29waWVkID0gZmFsc2U7IHJlbmRlcigpOyB9LCAxMDAwKTtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChldmVudCk7XG59XG5cbi8vIC0tLSBFdmVudCBiaW5kaW5nIC0tLVxuXG5sZXQgbWF4RGVib3VuY2VUaW1lciA9IG51bGw7XG5sZXQgcHVia2V5RGVib3VuY2VUaW1lciA9IG51bGw7XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgndmlldycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS52aWV3ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgnc29ydCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5zb3J0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgnbWF4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubWF4ID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDEwMDtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG1heERlYm91bmNlVGltZXIpO1xuICAgICAgICBtYXhEZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiByZWxvYWQoKSwgNzUwKTtcbiAgICB9KTtcblxuICAgICQoJ2Zyb21DcmVhdGVkQXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZnJvbUNyZWF0ZWRBdCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9KTtcblxuICAgICQoJ3RvQ3JlYXRlZEF0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnRvQ3JlYXRlZEF0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgna2luZFNob3J0Y3V0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnF1aWNrS2luZCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICBxdWlja0tpbmRTZWxlY3QoKTtcbiAgICB9KTtcblxuICAgICQoJ2Zyb21LaW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmZyb21LaW5kID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDA7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgndG9LaW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnRvS2luZCA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSB8fCA1MDAwMDtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdob3N0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmhvc3QgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdwcm9maWxlcycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5wcm9maWxlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHBrRnJvbVByb2ZpbGUoKTtcbiAgICB9KTtcblxuICAgICQoJ3B1YmtleScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnB1YmtleSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICBjbGVhclRpbWVvdXQocHVia2V5RGVib3VuY2VUaW1lcik7XG4gICAgICAgIHB1YmtleURlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHJlbG9hZCgpLCA1MDApO1xuICAgIH0pO1xuXG4gICAgJCgnc2F2ZS1hbGwtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUFsbCk7XG4gICAgJCgnZGVsZXRlLWFsbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWxldGVBbGwpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcbn1cblxuLy8gLS0tIEluaXQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gUG9wdWxhdGUgdGhlIGtpbmQgc2hvcnRjdXQgc2VsZWN0XG4gICAgY29uc3Qga2luZFNob3J0Y3V0ID0gJCgna2luZFNob3J0Y3V0Jyk7XG4gICAgaWYgKGtpbmRTaG9ydGN1dCkge1xuICAgICAgICBraW5kU2hvcnRjdXQuaW5uZXJIVE1MID0gJzxvcHRpb24+PC9vcHRpb24+JyArXG4gICAgICAgICAgICBLSU5EUy5tYXAoKFtraW5kLCBkZXNjXSkgPT4gYDxvcHRpb24gdmFsdWU9XCIke2tpbmR9XCI+JHtlc2NhcGVIdG1sKGRlc2MpfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICBhd2FpdCByZWxvYWQoKTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBvcGVuREIgfSBmcm9tICdpZGInO1xuXG5hc3luYyBmdW5jdGlvbiBvcGVuRXZlbnRzRGIoKSB7XG4gICAgcmV0dXJuIGF3YWl0IG9wZW5EQignZXZlbnRzJywgMSwge1xuICAgICAgICB1cGdyYWRlKGRiKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudHMgPSBkYi5jcmVhdGVPYmplY3RTdG9yZSgnZXZlbnRzJywge1xuICAgICAgICAgICAgICAgIGtleVBhdGg6ICdldmVudC5pZCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgncHVia2V5JywgJ2V2ZW50LnB1YmtleScpO1xuICAgICAgICAgICAgZXZlbnRzLmNyZWF0ZUluZGV4KCdjcmVhdGVkX2F0JywgJ2V2ZW50LmNyZWF0ZWRfYXQnKTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgna2luZCcsICdldmVudC5raW5kJyk7XG4gICAgICAgICAgICBldmVudHMuY3JlYXRlSW5kZXgoJ2hvc3QnLCAnbWV0YWRhdGEuaG9zdCcpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUV2ZW50KGV2ZW50KSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgcmV0dXJuIGRiLnB1dCgnZXZlbnRzJywgZXZlbnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc29ydEJ5SW5kZXgoaW5kZXgsIHF1ZXJ5LCBhc2MsIG1heCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBldmVudHMgPSBbXTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGJcbiAgICAgICAgLnRyYW5zYWN0aW9uKCdldmVudHMnKVxuICAgICAgICAuc3RvcmUuaW5kZXgoaW5kZXgpXG4gICAgICAgIC5vcGVuQ3Vyc29yKHF1ZXJ5LCBhc2MgPyAnbmV4dCcgOiAncHJldicpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgaWYgKGV2ZW50cy5sZW5ndGggPj0gbWF4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvc3RzKCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBob3N0cyA9IG5ldyBTZXQoKTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGIudHJhbnNhY3Rpb24oJ2V2ZW50cycpLnN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIGhvc3RzLmFkZChjdXJzb3IudmFsdWUubWV0YWRhdGEuaG9zdCk7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5jb250aW51ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gWy4uLmhvc3RzXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQWxsQ29udGVudHMoKSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuICAgIGxldCBjdXJzb3IgPSBhd2FpdCBkYi50cmFuc2FjdGlvbignZXZlbnRzJykuc3RvcmUub3BlbkN1cnNvcigpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlLmV2ZW50KTtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICAgIGV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiBKU09OLnN0cmluZ2lmeShlKSk7XG4gICAgZXZlbnRzID0gZXZlbnRzLmpvaW4oJ1xcbicpO1xuICAgIGNvbnNvbGUubG9nKGV2ZW50cyk7XG5cbiAgICBjb25zdCBmaWxlID0gbmV3IEZpbGUoW2V2ZW50c10sICdldmVudHMuanNvbmwnLCB7XG4gICAgICAgIHR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtldmVudHNdLCB7IHR5cGU6ICdwbGFpbi90ZXh0JyB9KTtcblxuICAgIHJldHVybiBibG9iO1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBlbmNyeXB0LCBkZWNyeXB0LCBoYXNoUGFzc3dvcmQsIHZlcmlmeVBhc3N3b3JkIH0gZnJvbSAnLi9jcnlwdG8nO1xuaW1wb3J0IHsgbG9va3NMaWtlU2VlZFBocmFzZSwgaXNWYWxpZFNlZWRQaHJhc2UgfSBmcm9tICcuL3NlZWRwaHJhc2UnO1xuXG5jb25zdCBEQl9WRVJTSU9OID0gNjtcbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9SRUxBWVMgPSBbXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZGFtdXMuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5wcmltYWwubmV0JyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuc25vcnQuc29jaWFsJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZ2V0YWxieS5jb20vdjEnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3MubG9sJyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNSkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNiAocGxhdGZvcm0gc3luYyBzdXBwb3J0KS4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS51cGRhdGVkQXQgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS51cGRhdGVkQXQgPSBub3c7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwbGF0Zm9ybVN5bmNFbmFibGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBwcml2S2V5OiB0eXBlID09PSAnbG9jYWwnID8gYXdhaXQgZ2VuZXJhdGVQcml2YXRlS2V5KCkgOiAnJyxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBwcm9maWxlc1tpbmRleF0udXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcml2YXRlS2V5KGluZGV4LCBwcml2YXRlS2V5KSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICBwYXlsb2FkOiBbaW5kZXgsIHByaXZhdGVLZXldLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3UHJvZmlsZSgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUoJ05ldyBQcm9maWxlJyk7XG4gICAgcHJvZmlsZXMucHVzaChuZXdQcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3QnVua2VyUHJvZmlsZShuYW1lID0gJ05ldyBCdW5rZXInLCBidW5rZXJVcmwgPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKG5hbWUsICdidW5rZXInKTtcbiAgICBwcm9maWxlLmJ1bmtlclVybCA9IGJ1bmtlclVybDtcbiAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZWxheXMocHJvZmlsZUluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHByb2ZpbGVJbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlzIHx8IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJlbGF5cyhwcm9maWxlSW5kZXgsIHJlbGF5cykge1xuICAgIC8vIEhhdmluZyBhbiBBbHBpbmUgcHJveHkgb2JqZWN0IGFzIGEgc3ViLW9iamVjdCBkb2VzIG5vdCBzZXJpYWxpemUgY29ycmVjdGx5IGluIHN0b3JhZ2UsXG4gICAgLy8gc28gd2UgYXJlIHByZS1zZXJpYWxpemluZyBoZXJlIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gdGhlIHByb2ZpbGUsIHNvIHRoZSBwcm94eVxuICAgIC8vIG9iaiBkb2Vzbid0IGJ1ZyBvdXQuXG4gICAgbGV0IGZpeGVkUmVsYXlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxheXMpKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbcHJvZmlsZUluZGV4XTtcbiAgICBwcm9maWxlLnJlbGF5cyA9IGZpeGVkUmVsYXlzO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlPy5ob3N0cz8uW2hvc3RdPy5bYWN0aW9uXSB8fCAnYXNrJztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBlcm1pc3Npb24oaG9zdCwgYWN0aW9uLCBwZXJtLCBpbmRleCA9IG51bGwpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGlmICghaW5kZXgpIHtcbiAgICAgICAgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICB9XG4gICAgbGV0IHByb2ZpbGUgPSBwcm9maWxlc1tpbmRleF07XG4gICAgbGV0IG5ld1Blcm1zID0gcHJvZmlsZS5ob3N0c1tob3N0XSB8fCB7fTtcbiAgICBuZXdQZXJtcyA9IHsgLi4ubmV3UGVybXMsIFthY3Rpb25dOiBwZXJtIH07XG4gICAgcHJvZmlsZS5ob3N0c1tob3N0XSA9IG5ld1Blcm1zO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdID0gcHJvZmlsZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVtYW5QZXJtaXNzaW9uKHApIHtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlIHdoZXJlIGV2ZW50IHNpZ25pbmcgaW5jbHVkZXMgYSBraW5kIG51bWJlclxuICAgIGlmIChwLnN0YXJ0c1dpdGgoJ3NpZ25FdmVudDonKSkge1xuICAgICAgICBsZXQgW2UsIG5dID0gcC5zcGxpdCgnOicpO1xuICAgICAgICBuID0gcGFyc2VJbnQobik7XG4gICAgICAgIGxldCBubmFtZSA9IEtJTkRTLmZpbmQoayA9PiBrWzBdID09PSBuKT8uWzFdIHx8IGBVbmtub3duIChLaW5kICR7bn0pYDtcbiAgICAgICAgcmV0dXJuIGBTaWduIGV2ZW50OiAke25uYW1lfWA7XG4gICAgfVxuXG4gICAgc3dpdGNoIChwKSB7XG4gICAgICAgIGNhc2UgJ2dldFB1YktleSc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcHVibGljIGtleSc7XG4gICAgICAgIGNhc2UgJ3NpZ25FdmVudCc6XG4gICAgICAgICAgICByZXR1cm4gJ1NpZ24gZXZlbnQnO1xuICAgICAgICBjYXNlICdnZXRSZWxheXMnOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHJlbGF5IGxpc3QnO1xuICAgICAgICBjYXNlICduaXAwNC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXAwNC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC0wNCknO1xuICAgICAgICBjYXNlICduaXA0NC5lbmNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRW5jcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBjYXNlICduaXA0NC5kZWNyeXB0JzpcbiAgICAgICAgICAgIHJldHVybiAnRGVjcnlwdCBwcml2YXRlIG1lc3NhZ2UgKE5JUC00NCknO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdVbmtub3duJztcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUtleShrZXkpIHtcbiAgICBjb25zdCBoZXhNYXRjaCA9IC9eW1xcZGEtZl17NjR9JC9pLnRlc3Qoa2V5KTtcbiAgICBjb25zdCBiMzJNYXRjaCA9IC9ebnNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdezU4fSQvLnRlc3Qoa2V5KTtcblxuICAgIHJldHVybiBoZXhNYXRjaCB8fCBiMzJNYXRjaCB8fCBpc05jcnlwdHNlYyhrZXkpIHx8IGlzVmFsaWRTZWVkUGhyYXNlKGtleSk7XG59XG5cbmV4cG9ydCB7IGxvb2tzTGlrZVNlZWRQaHJhc2UgfTtcbmV4cG9ydCBjb25zdCBpc1NlZWRQaHJhc2UgPSBpc1ZhbGlkU2VlZFBocmFzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmNyeXB0c2VjKGtleSkge1xuICAgIHJldHVybiAvXm5jcnlwdHNlYzFbcXB6cnk5eDhnZjJ0dmR3MHMzam41NGtoY2U2bXVhN2xdKyQvLnRlc3Qoa2V5KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZlYXR1cmUobmFtZSkge1xuICAgIGxldCBmbmFtZSA9IGBmZWF0dXJlOiR7bmFtZX1gO1xuICAgIGxldCBmID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgW2ZuYW1lXTogZmFsc2UgfSk7XG4gICAgcmV0dXJuIGZbZm5hbWVdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLnJlbGF5UmVtaW5kZXI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b2dnbGVSZWxheVJlbWluZGVyKCkge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLnJlbGF5UmVtaW5kZXIgPSBmYWxzZTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TnB1YigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICByZXR1cm4gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnZ2V0TnB1YicsXG4gICAgICAgIHBheWxvYWQ6IGluZGV4LFxuICAgIH0pO1xufVxuXG4vLyAtLS0gTWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBtYXN0ZXIgcGFzc3dvcmQgZW5jcnlwdGlvbiBpcyBhY3RpdmUuXG4gKlxuICogRGVmZW5zaXZlOiBjaGVja3MgbXVsdGlwbGUgaW5kaWNhdG9ycywgbm90IGp1c3QgdGhlIGJvb2xlYW4gZmxhZy5cbiAqIElmIHBhc3N3b3JkSGFzaCBvciBlbmNyeXB0ZWQga2V5IGJsb2JzIGV4aXN0IGJ1dCB0aGUgaXNFbmNyeXB0ZWQgZmxhZ1xuICogaXMgZmFsc2UgKGluY29uc2lzdGVudCBzdGF0ZSBmcm9tIHNlcnZpY2Ugd29ya2VyIGNyYXNoLCByYWNlIGNvbmRpdGlvbixcbiAqIGV0Yy4pLCBzZWxmLWhlYWxzIGJ5IHNldHRpbmcgdGhlIGZsYWcgYmFjayB0byB0cnVlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNFbmNyeXB0ZWQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgaXNFbmNyeXB0ZWQ6IGZhbHNlLCBwYXNzd29yZEhhc2g6IG51bGwsIHByb2ZpbGVzOiBbXSB9KTtcbiAgICBpZiAoZGF0YS5pc0VuY3J5cHRlZCkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBGYWxsYmFjayAxOiBwYXNzd29yZEhhc2ggZXhpc3RzIGJ1dCBmbGFnIGlzIHN0YWxlXG4gICAgaWYgKGRhdGEucGFzc3dvcmRIYXNoKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZhbGxiYWNrIDI6IGVuY3J5cHRlZCBibG9icyBleGlzdCBpbiBwcm9maWxlcyBidXQgZmxhZyArIGhhc2ggYXJlIG1pc3NpbmdcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgb2YgZGF0YS5wcm9maWxlcykge1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGUucHJpdktleSkpIHtcbiAgICAgICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgaXNFbmNyeXB0ZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBTdG9yZSB0aGUgcGFzc3dvcmQgdmVyaWZpY2F0aW9uIGhhc2ggKG5ldmVyIHRoZSBwYXNzd29yZCBpdHNlbGYpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBoYXNoLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IHNhbHQsXG4gICAgICAgIGlzRW5jcnlwdGVkOiB0cnVlLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgdGhlIHN0b3JlZCBoYXNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tQYXNzd29yZChwYXNzd29yZCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogbnVsbCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBudWxsLFxuICAgIH0pO1xuICAgIGlmICghZGF0YS5wYXNzd29yZEhhc2ggfHwgIWRhdGEucGFzc3dvcmRTYWx0KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBkYXRhLnBhc3N3b3JkSGFzaCwgZGF0YS5wYXNzd29yZFNhbHQpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBtYXN0ZXIgcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgY2xlYXJzIGhhc2ggYW5kIGRlY3J5cHRzIGFsbCBrZXlzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlUGFzc3dvcmRQcm90ZWN0aW9uKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgdmFsaWQgPSBhd2FpdCBjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBpZiAoIXZhbGlkKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKTtcblxuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZGVjcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IGFsbCBwcm9maWxlIHByaXZhdGUga2V5cyB3aXRoIGEgbWFzdGVyIHBhc3N3b3JkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEFsbEtleXMocGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFpc0VuY3J5cHRlZEJsb2IocHJvZmlsZXNbaV0ucHJpdktleSkpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbi8qKlxuICogUmUtZW5jcnlwdCBhbGwga2V5cyB3aXRoIGEgbmV3IHBhc3N3b3JkIChyZXF1aXJlcyB0aGUgb2xkIHBhc3N3b3JkKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkRm9yS2V5cyhvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGhleCA9IHByb2ZpbGVzW2ldLnByaXZLZXk7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IoaGV4KSkge1xuICAgICAgICAgICAgaGV4ID0gYXdhaXQgZGVjcnlwdChoZXgsIG9sZFBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChoZXgsIG5ld1Bhc3N3b3JkKTtcbiAgICB9XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgc2luZ2xlIHByb2ZpbGUncyBwcml2YXRlIGtleSwgcmV0dXJuaW5nIHRoZSBoZXggc3RyaW5nLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVjcnlwdGVkUHJpdktleShwcm9maWxlLCBwYXNzd29yZCkge1xuICAgIGlmIChwcm9maWxlLnR5cGUgPT09ICdidW5rZXInKSByZXR1cm4gJyc7XG4gICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0KHByb2ZpbGUucHJpdktleSwgcGFzc3dvcmQpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvZmlsZS5wcml2S2V5O1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBzdG9yZWQgdmFsdWUgbG9va3MgbGlrZSBhbiBlbmNyeXB0ZWQgYmxvYi5cbiAqIEVuY3J5cHRlZCBibG9icyBhcmUgSlNPTiBzdHJpbmdzIGNvbnRhaW5pbmcge3NhbHQsIGl2LCBjaXBoZXJ0ZXh0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW5jcnlwdGVkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwYXJzZWQuc2FsdCAmJiBwYXJzZWQuaXYgJiYgcGFyc2VkLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIC0tLSBzdG9yYWdlLnN5bmMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE51bGwgd2hlbiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgc3luYyAob2xkZXIgU2FmYXJpLCBldGMuKVxuICAgIHN5bmM6IF9icm93c2VyLnN0b3JhZ2U/LnN5bmMgPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEJ5dGVzSW5Vc2UoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkge1xuICAgICAgICAgICAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgZ2V0Qnl0ZXNJblVzZSBcdTIwMTQgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0Qnl0ZXNJblVzZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSA6IG51bGwsXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5vbkNoYW5nZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNoYW5nZWQ6IF9icm93c2VyLnN0b3JhZ2U/Lm9uQ2hhbmdlZCB8fCBudWxsLFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICIvKipcbiAqIEVuY3J5cHRpb24gdXRpbGl0aWVzIGZvciBOb3N0cktleSBtYXN0ZXIgcGFzc3dvcmQgZmVhdHVyZS5cbiAqXG4gKiBVc2VzIFdlYiBDcnlwdG8gQVBJIChjcnlwdG8uc3VidGxlKSBleGNsdXNpdmVseSBcdTIwMTQgbm8gZXh0ZXJuYWwgbGlicmFyaWVzLlxuICogLSBQQktERjIgd2l0aCA2MDAsMDAwIGl0ZXJhdGlvbnMgKE9XQVNQIDIwMjMgcmVjb21tZW5kYXRpb24pXG4gKiAtIEFFUy0yNTYtR0NNIGZvciBhdXRoZW50aWNhdGVkIGVuY3J5cHRpb25cbiAqIC0gUmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSBwZXIgb3BlcmF0aW9uXG4gKiAtIEFsbCBiaW5hcnkgZGF0YSBlbmNvZGVkIGFzIGJhc2U2NCBmb3IgSlNPTiBzdG9yYWdlIGNvbXBhdGliaWxpdHlcbiAqL1xuXG5jb25zdCBQQktERjJfSVRFUkFUSU9OUyA9IDYwMF8wMDA7XG5jb25zdCBTQUxUX0JZVEVTID0gMTY7XG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuXG4vLyAtLS0gQmFzZTY0IGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFycmF5QnVmZmVyVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpIHtcbiAgICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnkubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgICBieXRlc1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXMuYnVmZmVyO1xufVxuXG4vLyAtLS0gS2V5IGRlcml2YXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRGVyaXZlIGFuIEFFUy0yNTYtR0NNIENyeXB0b0tleSBmcm9tIGEgcGFzc3dvcmQgYW5kIHNhbHQgdXNpbmcgUEJLREYyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8VWludDhBcnJheX0gc2FsdCAtIDE2LWJ5dGUgc2FsdFxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVLZXknXVxuICAgICk7XG5cbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZS5kZXJpdmVLZXkoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdDogc2FsdCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBzYWx0IDogbmV3IFVpbnQ4QXJyYXkoc2FsdCksXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IC8gRGVjcnlwdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB3aXRoIGEgcGFzc3dvcmQuXG4gKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHNhbHQgKDE2IGJ5dGVzKSBhbmQgSVYgKDEyIGJ5dGVzKSwgZGVyaXZlcyBhblxuICogQUVTLTI1Ni1HQ00ga2V5IHZpYSBQQktERjIsIGFuZCByZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZ1xuICogYmFzZTY0LWVuY29kZWQgc2FsdCwgaXYsIGFuZCBjaXBoZXJ0ZXh0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgLSBUaGUgZGF0YSB0byBlbmNyeXB0IChlLmcuIGhleCBwcml2YXRlIGtleSlcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQsIHBhc3N3b3JkKSB7XG4gICAgY29uc3Qgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShJVl9CWVRFUykpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdCk7XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIERlY3J5cHQgZGF0YSB0aGF0IHdhcyBlbmNyeXB0ZWQgd2l0aCBgZW5jcnlwdCgpYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZW5jcnlwdGVkRGF0YSAtIEpTT04gc3RyaW5nIGZyb20gZW5jcnlwdCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAgICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBvcmlnaW5hbCBwbGFpbnRleHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgcGFzc3dvcmQgaXMgd3Jvbmcgb3IgZGF0YSBpcyB0YW1wZXJlZCB3aXRoXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0KGVuY3J5cHRlZERhdGEsIHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcblxuICAgIGNvbnN0IHNhbHRCdWYgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHRCdWYpO1xuXG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG5cbiAgICBjb25zdCBkZWMgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICByZXR1cm4gZGVjLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8vIC0tLSBQYXNzd29yZCBoYXNoaW5nIChmb3IgdmVyaWZpY2F0aW9uKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBIYXNoIGEgcGFzc3dvcmQgd2l0aCBQQktERjIgZm9yIHZlcmlmaWNhdGlvbiBwdXJwb3Nlcy5cbiAqXG4gKiBUaGlzIHByb2R1Y2VzIGEgc2VwYXJhdGUgaGFzaCAobm90IHRoZSBlbmNyeXB0aW9uIGtleSkgdGhhdCBjYW4gYmUgc3RvcmVkXG4gKiB0byB2ZXJpZnkgdGhlIHBhc3N3b3JkIHdpdGhvdXQgbmVlZGluZyB0byBhdHRlbXB0IGRlY3J5cHRpb24uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHBhcmFtIHtVaW50OEFycmF5fSBbc2FsdF0gLSBPcHRpb25hbCBzYWx0OyBnZW5lcmF0ZWQgaWYgb21pdHRlZFxuICogQHJldHVybnMge1Byb21pc2U8eyBoYXNoOiBzdHJpbmcsIHNhbHQ6IHN0cmluZyB9Pn0gYmFzZTY0LWVuY29kZWQgaGFzaCBhbmQgc2FsdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgaWYgKCFzYWx0KSB7XG4gICAgICAgIHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzYWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBzYWx0ID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihzYWx0KSk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlQml0cyddXG4gICAgKTtcblxuICAgIGNvbnN0IGhhc2hCaXRzID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgICBpdGVyYXRpb25zOiBQQktERjJfSVRFUkFUSU9OUyxcbiAgICAgICAgICAgIGhhc2g6ICdTSEEtMjU2JyxcbiAgICAgICAgfSxcbiAgICAgICAga2V5TWF0ZXJpYWwsXG4gICAgICAgIDI1NlxuICAgICk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBoYXNoOiBhcnJheUJ1ZmZlclRvQmFzZTY0KGhhc2hCaXRzKSxcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgYSBzdG9yZWQgaGFzaC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgICAtIFRoZSBwYXNzd29yZCB0byB2ZXJpZnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRIYXNoIC0gYmFzZTY0LWVuY29kZWQgaGFzaCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RvcmVkU2FsdCAtIGJhc2U2NC1lbmNvZGVkIHNhbHQgZnJvbSBoYXNoUGFzc3dvcmQoKVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59IFRydWUgaWYgdGhlIHBhc3N3b3JkIG1hdGNoZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBzdG9yZWRIYXNoLCBzdG9yZWRTYWx0KSB7XG4gICAgY29uc3QgeyBoYXNoIH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZFNhbHQpO1xuICAgIHJldHVybiBoYXNoID09PSBzdG9yZWRIYXNoO1xufVxuIiwgIi8qKlxuICogQklQMzkgU2VlZCBQaHJhc2UgdXRpbGl0aWVzIGZvciBOb3N0cktleS5cbiAqXG4gKiBJbXBsZW1lbnRzIHRoZSBzYW1lIGFsZ29yaXRobSBhcyBgbm9zdHItbnNlYy1zZWVkcGhyYXNlYDpcbiAqIHRoZSAzMi1ieXRlIHByaXZhdGUga2V5IElTIHRoZSBCSVAzOSBlbnRyb3B5IChiaWRpcmVjdGlvbmFsIGVuY29kaW5nKS5cbiAqXG4gKiBVc2VzIEBzY3VyZS9iaXAzOSAoYWxyZWFkeSBhIHRyYW5zaXRpdmUgZGVwIG9mIG5vc3RyLXRvb2xzKS5cbiAqL1xuXG5pbXBvcnQgeyBlbnRyb3B5VG9NbmVtb25pYywgbW5lbW9uaWNUb0VudHJvcHksIHZhbGlkYXRlTW5lbW9uaWMgfSBmcm9tICdAc2N1cmUvYmlwMzknO1xuaW1wb3J0IHsgd29yZGxpc3QgfSBmcm9tICdAc2N1cmUvYmlwMzkvd29yZGxpc3RzL2VuZ2xpc2guanMnO1xuaW1wb3J0IHsgaGV4VG9CeXRlcywgYnl0ZXNUb0hleCwgZ2V0UHVibGljS2V5U3luYyB9IGZyb20gJ25vc3RyLWNyeXB0by11dGlscyc7XG5cbi8qKlxuICogQ29udmVydCBhIGhleCBwcml2YXRlIGtleSB0byBhIDI0LXdvcmQgQklQMzkgbW5lbW9uaWMuXG4gKiBAcGFyYW0ge3N0cmluZ30gaGV4S2V5IC0gNjQtY2hhciBoZXggcHJpdmF0ZSBrZXlcbiAqIEByZXR1cm5zIHtzdHJpbmd9IDI0LXdvcmQgbW5lbW9uaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleVRvU2VlZFBocmFzZShoZXhLZXkpIHtcbiAgICBjb25zdCBieXRlcyA9IGhleFRvQnl0ZXMoaGV4S2V5KTtcbiAgICByZXR1cm4gZW50cm9weVRvTW5lbW9uaWMoYnl0ZXMsIHdvcmRsaXN0KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgQklQMzkgbW5lbW9uaWMgYmFjayB0byBhIGhleCBwcml2YXRlIGtleSArIGRlcml2ZWQgcHVia2V5LlxuICogQHBhcmFtIHtzdHJpbmd9IHBocmFzZSAtIDI0LXdvcmQgbW5lbW9uaWNcbiAqIEByZXR1cm5zIHt7IGhleEtleTogc3RyaW5nLCBwdWJLZXk6IHN0cmluZyB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VlZFBocmFzZVRvS2V5KHBocmFzZSkge1xuICAgIGNvbnN0IGVudHJvcHkgPSBtbmVtb25pY1RvRW50cm9weShwaHJhc2UudHJpbSgpLnRvTG93ZXJDYXNlKCksIHdvcmRsaXN0KTtcbiAgICBjb25zdCBoZXhLZXkgPSBieXRlc1RvSGV4KGVudHJvcHkpO1xuICAgIGNvbnN0IHB1YktleSA9IGdldFB1YmxpY0tleVN5bmMoaGV4S2V5KTtcbiAgICByZXR1cm4geyBoZXhLZXksIHB1YktleSB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGEgQklQMzkgbW5lbW9uaWMgKGNoZWNrc3VtICsgd29yZGxpc3QpLlxuICogQHBhcmFtIHtzdHJpbmd9IHBocmFzZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkU2VlZFBocmFzZShwaHJhc2UpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVNbmVtb25pYyhwaHJhc2UudHJpbSgpLnRvTG93ZXJDYXNlKCksIHdvcmRsaXN0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBGYXN0IGhldXJpc3RpYzogZG9lcyB0aGUgaW5wdXQgbG9vayBsaWtlIGl0IGNvdWxkIGJlIGEgc2VlZCBwaHJhc2U/XG4gKiAoMTIrIHNwYWNlLXNlcGFyYXRlZCBhbHBoYWJldGljIHdvcmRzKVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2tzTGlrZVNlZWRQaHJhc2UoaW5wdXQpIHtcbiAgICBpZiAoIWlucHV0IHx8IHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB3b3JkcyA9IGlucHV0LnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xuICAgIHJldHVybiB3b3Jkcy5sZW5ndGggPj0gMTIgJiYgd29yZHMuZXZlcnkodyA9PiAvXlthLXpBLVpdKyQvLnRlc3QodykpO1xufVxuIiwgIi8qKlxuICogVXRpbGl0aWVzIGZvciBoZXgsIGJ5dGVzLCBDU1BSTkcuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1oYXNoZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbi8qKiBDaGVja3MgaWYgc29tZXRoaW5nIGlzIFVpbnQ4QXJyYXkuIEJlIGNhcmVmdWw6IG5vZGVqcyBCdWZmZXIgd2lsbCByZXR1cm4gdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0J5dGVzKGE6IHVua25vd24pOiBhIGlzIFVpbnQ4QXJyYXkge1xuICByZXR1cm4gYSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgfHwgKEFycmF5QnVmZmVyLmlzVmlldyhhKSAmJiBhLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdVaW50OEFycmF5Jyk7XG59XG5cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBwb3NpdGl2ZSBpbnRlZ2VyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFudW1iZXIobjogbnVtYmVyLCB0aXRsZTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihuKSB8fCBuIDwgMCkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cHJlZml4fWV4cGVjdGVkIGludGVnZXIgPj0gMCwgZ290ICR7bn1gKTtcbiAgfVxufVxuXG4vKiogQXNzZXJ0cyBzb21ldGhpbmcgaXMgVWludDhBcnJheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhYnl0ZXModmFsdWU6IFVpbnQ4QXJyYXksIGxlbmd0aD86IG51bWJlciwgdGl0bGU6IHN0cmluZyA9ICcnKTogVWludDhBcnJheSB7XG4gIGNvbnN0IGJ5dGVzID0gaXNCeXRlcyh2YWx1ZSk7XG4gIGNvbnN0IGxlbiA9IHZhbHVlPy5sZW5ndGg7XG4gIGNvbnN0IG5lZWRzTGVuID0gbGVuZ3RoICE9PSB1bmRlZmluZWQ7XG4gIGlmICghYnl0ZXMgfHwgKG5lZWRzTGVuICYmIGxlbiAhPT0gbGVuZ3RoKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICBjb25zdCBvZkxlbiA9IG5lZWRzTGVuID8gYCBvZiBsZW5ndGggJHtsZW5ndGh9YCA6ICcnO1xuICAgIGNvbnN0IGdvdCA9IGJ5dGVzID8gYGxlbmd0aD0ke2xlbn1gIDogYHR5cGU9JHt0eXBlb2YgdmFsdWV9YDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIFVpbnQ4QXJyYXknICsgb2ZMZW4gKyAnLCBnb3QgJyArIGdvdCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKiogQXNzZXJ0cyBzb21ldGhpbmcgaXMgaGFzaCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFoYXNoKGg6IENIYXNoKTogdm9pZCB7XG4gIGlmICh0eXBlb2YgaCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgaC5jcmVhdGUgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdIYXNoIG11c3Qgd3JhcHBlZCBieSB1dGlscy5jcmVhdGVIYXNoZXInKTtcbiAgYW51bWJlcihoLm91dHB1dExlbik7XG4gIGFudW1iZXIoaC5ibG9ja0xlbik7XG59XG5cbi8qKiBBc3NlcnRzIGEgaGFzaCBpbnN0YW5jZSBoYXMgbm90IGJlZW4gZGVzdHJveWVkIC8gZmluaXNoZWQgKi9cbmV4cG9ydCBmdW5jdGlvbiBhZXhpc3RzKGluc3RhbmNlOiBhbnksIGNoZWNrRmluaXNoZWQgPSB0cnVlKTogdm9pZCB7XG4gIGlmIChpbnN0YW5jZS5kZXN0cm95ZWQpIHRocm93IG5ldyBFcnJvcignSGFzaCBpbnN0YW5jZSBoYXMgYmVlbiBkZXN0cm95ZWQnKTtcbiAgaWYgKGNoZWNrRmluaXNoZWQgJiYgaW5zdGFuY2UuZmluaXNoZWQpIHRocm93IG5ldyBFcnJvcignSGFzaCNkaWdlc3QoKSBoYXMgYWxyZWFkeSBiZWVuIGNhbGxlZCcpO1xufVxuXG4vKiogQXNzZXJ0cyBvdXRwdXQgaXMgcHJvcGVybHktc2l6ZWQgYnl0ZSBhcnJheSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFvdXRwdXQob3V0OiBhbnksIGluc3RhbmNlOiBhbnkpOiB2b2lkIHtcbiAgYWJ5dGVzKG91dCwgdW5kZWZpbmVkLCAnZGlnZXN0SW50bygpIG91dHB1dCcpO1xuICBjb25zdCBtaW4gPSBpbnN0YW5jZS5vdXRwdXRMZW47XG4gIGlmIChvdXQubGVuZ3RoIDwgbWluKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcImRpZ2VzdEludG8oKSBvdXRwdXRcIiBleHBlY3RlZCB0byBiZSBvZiBsZW5ndGggPj0nICsgbWluKTtcbiAgfVxufVxuXG4vKiogR2VuZXJpYyB0eXBlIGVuY29tcGFzc2luZyA4LzE2LzMyLWJ5dGUgYXJyYXlzIC0gYnV0IG5vdCA2NC1ieXRlLiAqL1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgdHlwZSBUeXBlZEFycmF5ID0gSW50OEFycmF5IHwgVWludDhDbGFtcGVkQXJyYXkgfCBVaW50OEFycmF5IHxcbiAgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5O1xuXG4vKiogQ2FzdCB1OCAvIHUxNiAvIHUzMiB0byB1OC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChhcnI6IFR5cGVkQXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBhcnIuYnl0ZUxlbmd0aCk7XG59XG5cbi8qKiBDYXN0IHU4IC8gdTE2IC8gdTMyIHRvIHUzMi4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1MzIoYXJyOiBUeXBlZEFycmF5KTogVWludDMyQXJyYXkge1xuICByZXR1cm4gbmV3IFVpbnQzMkFycmF5KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBNYXRoLmZsb29yKGFyci5ieXRlTGVuZ3RoIC8gNCkpO1xufVxuXG4vKiogWmVyb2l6ZSBhIGJ5dGUgYXJyYXkuIFdhcm5pbmc6IEpTIHByb3ZpZGVzIG5vIGd1YXJhbnRlZXMuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW4oLi4uYXJyYXlzOiBUeXBlZEFycmF5W10pOiB2b2lkIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheXMubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheXNbaV0uZmlsbCgwKTtcbiAgfVxufVxuXG4vKiogQ3JlYXRlIERhdGFWaWV3IG9mIGFuIGFycmF5IGZvciBlYXN5IGJ5dGUtbGV2ZWwgbWFuaXB1bGF0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZpZXcoYXJyOiBUeXBlZEFycmF5KTogRGF0YVZpZXcge1xuICByZXR1cm4gbmV3IERhdGFWaWV3KGFyci5idWZmZXIsIGFyci5ieXRlT2Zmc2V0LCBhcnIuYnl0ZUxlbmd0aCk7XG59XG5cbi8qKiBUaGUgcm90YXRlIHJpZ2h0IChjaXJjdWxhciByaWdodCBzaGlmdCkgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RyKHdvcmQ6IG51bWJlciwgc2hpZnQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAod29yZCA8PCAoMzIgLSBzaGlmdCkpIHwgKHdvcmQgPj4+IHNoaWZ0KTtcbn1cblxuLyoqIFRoZSByb3RhdGUgbGVmdCAoY2lyY3VsYXIgbGVmdCBzaGlmdCkgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RsKHdvcmQ6IG51bWJlciwgc2hpZnQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAod29yZCA8PCBzaGlmdCkgfCAoKHdvcmQgPj4+ICgzMiAtIHNoaWZ0KSkgPj4+IDApO1xufVxuXG4vKiogSXMgY3VycmVudCBwbGF0Zm9ybSBsaXR0bGUtZW5kaWFuPyBNb3N0IGFyZS4gQmlnLUVuZGlhbiBwbGF0Zm9ybTogSUJNICovXG5leHBvcnQgY29uc3QgaXNMRTogYm9vbGVhbiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgbmV3IFVpbnQ4QXJyYXkobmV3IFVpbnQzMkFycmF5KFsweDExMjIzMzQ0XSkuYnVmZmVyKVswXSA9PT0gMHg0NCkoKTtcblxuLyoqIFRoZSBieXRlIHN3YXAgb3BlcmF0aW9uIGZvciB1aW50MzIgKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlU3dhcCh3b3JkOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKFxuICAgICgod29yZCA8PCAyNCkgJiAweGZmMDAwMDAwKSB8XG4gICAgKCh3b3JkIDw8IDgpICYgMHhmZjAwMDApIHxcbiAgICAoKHdvcmQgPj4+IDgpICYgMHhmZjAwKSB8XG4gICAgKCh3b3JkID4+PiAyNCkgJiAweGZmKVxuICApO1xufVxuLyoqIENvbmRpdGlvbmFsbHkgYnl0ZSBzd2FwIGlmIG9uIGEgYmlnLWVuZGlhbiBwbGF0Zm9ybSAqL1xuZXhwb3J0IGNvbnN0IHN3YXA4SWZCRTogKG46IG51bWJlcikgPT4gbnVtYmVyID0gaXNMRVxuICA/IChuOiBudW1iZXIpID0+IG5cbiAgOiAobjogbnVtYmVyKSA9PiBieXRlU3dhcChuKTtcblxuLyoqIEluIHBsYWNlIGJ5dGUgc3dhcCBmb3IgVWludDMyQXJyYXkgKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlU3dhcDMyKGFycjogVWludDMyQXJyYXkpOiBVaW50MzJBcnJheSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgYXJyW2ldID0gYnl0ZVN3YXAoYXJyW2ldKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5leHBvcnQgY29uc3Qgc3dhcDMySWZCRTogKHU6IFVpbnQzMkFycmF5KSA9PiBVaW50MzJBcnJheSA9IGlzTEVcbiAgPyAodTogVWludDMyQXJyYXkpID0+IHVcbiAgOiBieXRlU3dhcDMyO1xuXG4vLyBCdWlsdC1pbiBoZXggY29udmVyc2lvbiBodHRwczovL2Nhbml1c2UuY29tL21kbi1qYXZhc2NyaXB0X2J1aWx0aW5zX3VpbnQ4YXJyYXlfZnJvbWhleFxuY29uc3QgaGFzSGV4QnVpbHRpbjogYm9vbGVhbiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgLy8gQHRzLWlnbm9yZVxuICB0eXBlb2YgVWludDhBcnJheS5mcm9tKFtdKS50b0hleCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgVWludDhBcnJheS5mcm9tSGV4ID09PSAnZnVuY3Rpb24nKSgpO1xuXG4vLyBBcnJheSB3aGVyZSBpbmRleCAweGYwICgyNDApIGlzIG1hcHBlZCB0byBzdHJpbmcgJ2YwJ1xuY29uc3QgaGV4ZXMgPSAvKiBAX19QVVJFX18gKi8gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjU2IH0sIChfLCBpKSA9PlxuICBpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpXG4pO1xuXG4vKipcbiAqIENvbnZlcnQgYnl0ZSBhcnJheSB0byBoZXggc3RyaW5nLiBVc2VzIGJ1aWx0LWluIGZ1bmN0aW9uLCB3aGVuIGF2YWlsYWJsZS5cbiAqIEBleGFtcGxlIGJ5dGVzVG9IZXgoVWludDhBcnJheS5mcm9tKFsweGNhLCAweGZlLCAweDAxLCAweDIzXSkpIC8vICdjYWZlMDEyMydcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBhYnl0ZXMoYnl0ZXMpO1xuICAvLyBAdHMtaWdub3JlXG4gIGlmIChoYXNIZXhCdWlsdGluKSByZXR1cm4gYnl0ZXMudG9IZXgoKTtcbiAgLy8gcHJlLWNhY2hpbmcgaW1wcm92ZXMgdGhlIHNwZWVkIDZ4XG4gIGxldCBoZXggPSAnJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgIGhleCArPSBoZXhlc1tieXRlc1tpXV07XG4gIH1cbiAgcmV0dXJuIGhleDtcbn1cblxuLy8gV2UgdXNlIG9wdGltaXplZCB0ZWNobmlxdWUgdG8gY29udmVydCBoZXggc3RyaW5nIHRvIGJ5dGUgYXJyYXlcbmNvbnN0IGFzY2lpcyA9IHsgXzA6IDQ4LCBfOTogNTcsIEE6IDY1LCBGOiA3MCwgYTogOTcsIGY6IDEwMiB9IGFzIGNvbnN0O1xuZnVuY3Rpb24gYXNjaWlUb0Jhc2UxNihjaDogbnVtYmVyKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGNoID49IGFzY2lpcy5fMCAmJiBjaCA8PSBhc2NpaXMuXzkpIHJldHVybiBjaCAtIGFzY2lpcy5fMDsgLy8gJzInID0+IDUwLTQ4XG4gIGlmIChjaCA+PSBhc2NpaXMuQSAmJiBjaCA8PSBhc2NpaXMuRikgcmV0dXJuIGNoIC0gKGFzY2lpcy5BIC0gMTApOyAvLyAnQicgPT4gNjYtKDY1LTEwKVxuICBpZiAoY2ggPj0gYXNjaWlzLmEgJiYgY2ggPD0gYXNjaWlzLmYpIHJldHVybiBjaCAtIChhc2NpaXMuYSAtIDEwKTsgLy8gJ2InID0+IDk4LSg5Ny0xMClcbiAgcmV0dXJuO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaGV4IHN0cmluZyB0byBieXRlIGFycmF5LiBVc2VzIGJ1aWx0LWluIGZ1bmN0aW9uLCB3aGVuIGF2YWlsYWJsZS5cbiAqIEBleGFtcGxlIGhleFRvQnl0ZXMoJ2NhZmUwMTIzJykgLy8gVWludDhBcnJheS5mcm9tKFsweGNhLCAweGZlLCAweDAxLCAweDIzXSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvQnl0ZXMoaGV4OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKHR5cGVvZiBoZXggIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCAnICsgdHlwZW9mIGhleCk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKGhhc0hleEJ1aWx0aW4pIHJldHVybiBVaW50OEFycmF5LmZyb21IZXgoaGV4KTtcbiAgY29uc3QgaGwgPSBoZXgubGVuZ3RoO1xuICBjb25zdCBhbCA9IGhsIC8gMjtcbiAgaWYgKGhsICUgMikgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgdW5wYWRkZWQgaGV4IG9mIGxlbmd0aCAnICsgaGwpO1xuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFsKTtcbiAgZm9yIChsZXQgYWkgPSAwLCBoaSA9IDA7IGFpIDwgYWw7IGFpKyssIGhpICs9IDIpIHtcbiAgICBjb25zdCBuMSA9IGFzY2lpVG9CYXNlMTYoaGV4LmNoYXJDb2RlQXQoaGkpKTtcbiAgICBjb25zdCBuMiA9IGFzY2lpVG9CYXNlMTYoaGV4LmNoYXJDb2RlQXQoaGkgKyAxKSk7XG4gICAgaWYgKG4xID09PSB1bmRlZmluZWQgfHwgbjIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgY2hhciA9IGhleFtoaV0gKyBoZXhbaGkgKyAxXTtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290IG5vbi1oZXggY2hhcmFjdGVyIFwiJyArIGNoYXIgKyAnXCIgYXQgaW5kZXggJyArIGhpKTtcbiAgICB9XG4gICAgYXJyYXlbYWldID0gbjEgKiAxNiArIG4yOyAvLyBtdWx0aXBseSBmaXJzdCBvY3RldCwgZS5nLiAnYTMnID0+IDEwKjE2KzMgPT4gMTYwICsgMyA9PiAxNjNcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbi8qKlxuICogVGhlcmUgaXMgbm8gc2V0SW1tZWRpYXRlIGluIGJyb3dzZXIgYW5kIHNldFRpbWVvdXQgaXMgc2xvdy5cbiAqIENhbGwgb2YgYXN5bmMgZm4gd2lsbCByZXR1cm4gUHJvbWlzZSwgd2hpY2ggd2lsbCBiZSBmdWxsZmlsZWQgb25seSBvblxuICogbmV4dCBzY2hlZHVsZXIgcXVldWUgcHJvY2Vzc2luZyBzdGVwIGFuZCB0aGlzIGlzIGV4YWN0bHkgd2hhdCB3ZSBuZWVkLlxuICovXG5leHBvcnQgY29uc3QgbmV4dFRpY2sgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7fTtcblxuLyoqIFJldHVybnMgY29udHJvbCB0byB0aHJlYWQgZWFjaCAndGljaycgbXMgdG8gYXZvaWQgYmxvY2tpbmcuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXN5bmNMb29wKFxuICBpdGVyczogbnVtYmVyLFxuICB0aWNrOiBudW1iZXIsXG4gIGNiOiAoaTogbnVtYmVyKSA9PiB2b2lkXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IHRzID0gRGF0ZS5ub3coKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyczsgaSsrKSB7XG4gICAgY2IoaSk7XG4gICAgLy8gRGF0ZS5ub3coKSBpcyBub3QgbW9ub3RvbmljLCBzbyBpbiBjYXNlIGlmIGNsb2NrIGdvZXMgYmFja3dhcmRzIHdlIHJldHVybiByZXR1cm4gY29udHJvbCB0b29cbiAgICBjb25zdCBkaWZmID0gRGF0ZS5ub3coKSAtIHRzO1xuICAgIGlmIChkaWZmID49IDAgJiYgZGlmZiA8IHRpY2spIGNvbnRpbnVlO1xuICAgIGF3YWl0IG5leHRUaWNrKCk7XG4gICAgdHMgKz0gZGlmZjtcbiAgfVxufVxuXG4vLyBHbG9iYWwgc3ltYm9scywgYnV0IHRzIGRvZXNuJ3Qgc2VlIHRoZW06IGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMzE1MzVcbmRlY2xhcmUgY29uc3QgVGV4dEVuY29kZXI6IGFueTtcblxuLyoqXG4gKiBDb252ZXJ0cyBzdHJpbmcgdG8gYnl0ZXMgdXNpbmcgVVRGOCBlbmNvZGluZy5cbiAqIEJ1aWx0LWluIGRvZXNuJ3QgdmFsaWRhdGUgaW5wdXQgdG8gYmUgc3RyaW5nOiB3ZSBkbyB0aGUgY2hlY2suXG4gKiBAZXhhbXBsZSB1dGY4VG9CeXRlcygnYWJjJykgLy8gVWludDhBcnJheS5mcm9tKFs5NywgOTgsIDk5XSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdzdHJpbmcgZXhwZWN0ZWQnKTtcbiAgcmV0dXJuIG5ldyBVaW50OEFycmF5KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpKTsgLy8gaHR0cHM6Ly9idWd6aWwubGEvMTY4MTgwOVxufVxuXG4vKiogS0RGcyBjYW4gYWNjZXB0IHN0cmluZyBvciBVaW50OEFycmF5IGZvciB1c2VyIGNvbnZlbmllbmNlLiAqL1xuZXhwb3J0IHR5cGUgS0RGSW5wdXQgPSBzdHJpbmcgfCBVaW50OEFycmF5O1xuXG4vKipcbiAqIEhlbHBlciBmb3IgS0RGczogY29uc3VtZXMgdWludDhhcnJheSBvciBzdHJpbmcuXG4gKiBXaGVuIHN0cmluZyBpcyBwYXNzZWQsIGRvZXMgdXRmOCBkZWNvZGluZywgdXNpbmcgVGV4dERlY29kZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZGZJbnB1dFRvQnl0ZXMoZGF0YTogS0RGSW5wdXQsIGVycm9yVGl0bGUgPSAnJyk6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSByZXR1cm4gdXRmOFRvQnl0ZXMoZGF0YSk7XG4gIHJldHVybiBhYnl0ZXMoZGF0YSwgdW5kZWZpbmVkLCBlcnJvclRpdGxlKTtcbn1cblxuLyoqIENvcGllcyBzZXZlcmFsIFVpbnQ4QXJyYXlzIGludG8gb25lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdEJ5dGVzKC4uLmFycmF5czogVWludDhBcnJheVtdKTogVWludDhBcnJheSB7XG4gIGxldCBzdW0gPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBhcnJheXNbaV07XG4gICAgYWJ5dGVzKGEpO1xuICAgIHN1bSArPSBhLmxlbmd0aDtcbiAgfVxuICBjb25zdCByZXMgPSBuZXcgVWludDhBcnJheShzdW0pO1xuICBmb3IgKGxldCBpID0gMCwgcGFkID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGEgPSBhcnJheXNbaV07XG4gICAgcmVzLnNldChhLCBwYWQpO1xuICAgIHBhZCArPSBhLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG50eXBlIEVtcHR5T2JqID0ge307XG4vKiogTWVyZ2VzIGRlZmF1bHQgb3B0aW9ucyBhbmQgcGFzc2VkIG9wdGlvbnMuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tPcHRzPFQxIGV4dGVuZHMgRW1wdHlPYmosIFQyIGV4dGVuZHMgRW1wdHlPYmo+KFxuICBkZWZhdWx0czogVDEsXG4gIG9wdHM/OiBUMlxuKTogVDEgJiBUMiB7XG4gIGlmIChvcHRzICE9PSB1bmRlZmluZWQgJiYge30udG9TdHJpbmcuY2FsbChvcHRzKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zIG11c3QgYmUgb2JqZWN0IG9yIHVuZGVmaW5lZCcpO1xuICBjb25zdCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRzKTtcbiAgcmV0dXJuIG1lcmdlZCBhcyBUMSAmIFQyO1xufVxuXG4vKiogQ29tbW9uIGludGVyZmFjZSBmb3IgYWxsIGhhc2hlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGFzaDxUPiB7XG4gIGJsb2NrTGVuOiBudW1iZXI7IC8vIEJ5dGVzIHBlciBibG9ja1xuICBvdXRwdXRMZW46IG51bWJlcjsgLy8gQnl0ZXMgaW4gb3V0cHV0XG4gIHVwZGF0ZShidWY6IFVpbnQ4QXJyYXkpOiB0aGlzO1xuICBkaWdlc3RJbnRvKGJ1ZjogVWludDhBcnJheSk6IHZvaWQ7XG4gIGRpZ2VzdCgpOiBVaW50OEFycmF5O1xuICBkZXN0cm95KCk6IHZvaWQ7XG4gIF9jbG9uZUludG8odG8/OiBUKTogVDtcbiAgY2xvbmUoKTogVDtcbn1cblxuLyoqIFBzZXVkb1JhbmRvbSAobnVtYmVyKSBHZW5lcmF0b3IgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUFJHIHtcbiAgYWRkRW50cm9weShzZWVkOiBVaW50OEFycmF5KTogdm9pZDtcbiAgcmFuZG9tQnl0ZXMobGVuZ3RoOiBudW1iZXIpOiBVaW50OEFycmF5O1xuICBjbGVhbigpOiB2b2lkO1xufVxuXG4vKipcbiAqIFhPRjogc3RyZWFtaW5nIEFQSSB0byByZWFkIGRpZ2VzdCBpbiBjaHVua3MuXG4gKiBTYW1lIGFzICdzcXVlZXplJyBpbiBrZWNjYWsvazEyIGFuZCAnc2VlaycgaW4gYmxha2UzLCBidXQgbW9yZSBnZW5lcmljIG5hbWUuXG4gKiBXaGVuIGhhc2ggdXNlZCBpbiBYT0YgbW9kZSBpdCBpcyB1cCB0byB1c2VyIHRvIGNhbGwgJy5kZXN0cm95JyBhZnRlcndhcmRzLCBzaW5jZSB3ZSBjYW5ub3RcbiAqIGRlc3Ryb3kgc3RhdGUsIG5leHQgY2FsbCBjYW4gcmVxdWlyZSBtb3JlIGJ5dGVzLlxuICovXG5leHBvcnQgdHlwZSBIYXNoWE9GPFQgZXh0ZW5kcyBIYXNoPFQ+PiA9IEhhc2g8VD4gJiB7XG4gIHhvZihieXRlczogbnVtYmVyKTogVWludDhBcnJheTsgLy8gUmVhZCAnYnl0ZXMnIGJ5dGVzIGZyb20gZGlnZXN0IHN0cmVhbVxuICB4b2ZJbnRvKGJ1ZjogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7IC8vIHJlYWQgYnVmLmxlbmd0aCBieXRlcyBmcm9tIGRpZ2VzdCBzdHJlYW0gaW50byBidWZcbn07XG5cbi8qKiBIYXNoIGNvbnN0cnVjdG9yICovXG5leHBvcnQgdHlwZSBIYXNoZXJDb25zPFQsIE9wdHMgPSB1bmRlZmluZWQ+ID0gT3B0cyBleHRlbmRzIHVuZGVmaW5lZCA/ICgpID0+IFQgOiAob3B0cz86IE9wdHMpID0+IFQ7XG4vKiogT3B0aW9uYWwgaGFzaCBwYXJhbXMuICovXG5leHBvcnQgdHlwZSBIYXNoSW5mbyA9IHtcbiAgb2lkPzogVWludDhBcnJheTsgLy8gREVSIGVuY29kZWQgT0lEIGluIGJ5dGVzXG59O1xuLyoqIEhhc2ggZnVuY3Rpb24gKi9cbmV4cG9ydCB0eXBlIENIYXNoPFQgZXh0ZW5kcyBIYXNoPFQ+ID0gSGFzaDxhbnk+LCBPcHRzID0gdW5kZWZpbmVkPiA9IHtcbiAgb3V0cHV0TGVuOiBudW1iZXI7XG4gIGJsb2NrTGVuOiBudW1iZXI7XG59ICYgSGFzaEluZm8gJlxuICAoT3B0cyBleHRlbmRzIHVuZGVmaW5lZFxuICAgID8ge1xuICAgICAgICAobXNnOiBVaW50OEFycmF5KTogVWludDhBcnJheTtcbiAgICAgICAgY3JlYXRlKCk6IFQ7XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIChtc2c6IFVpbnQ4QXJyYXksIG9wdHM/OiBPcHRzKTogVWludDhBcnJheTtcbiAgICAgICAgY3JlYXRlKG9wdHM/OiBPcHRzKTogVDtcbiAgICAgIH0pO1xuLyoqIFhPRiB3aXRoIG91dHB1dCAqL1xuZXhwb3J0IHR5cGUgQ0hhc2hYT0Y8VCBleHRlbmRzIEhhc2hYT0Y8VD4gPSBIYXNoWE9GPGFueT4sIE9wdHMgPSB1bmRlZmluZWQ+ID0gQ0hhc2g8VCwgT3B0cz47XG5cbi8qKiBDcmVhdGVzIGZ1bmN0aW9uIHdpdGggb3V0cHV0TGVuLCBibG9ja0xlbiwgY3JlYXRlIHByb3BlcnRpZXMgZnJvbSBhIGNsYXNzIGNvbnN0cnVjdG9yLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhhc2hlcjxUIGV4dGVuZHMgSGFzaDxUPiwgT3B0cyA9IHVuZGVmaW5lZD4oXG4gIGhhc2hDb25zOiBIYXNoZXJDb25zPFQsIE9wdHM+LFxuICBpbmZvOiBIYXNoSW5mbyA9IHt9XG4pOiBDSGFzaDxULCBPcHRzPiB7XG4gIGNvbnN0IGhhc2hDOiBhbnkgPSAobXNnOiBVaW50OEFycmF5LCBvcHRzPzogT3B0cykgPT4gaGFzaENvbnMob3B0cykudXBkYXRlKG1zZykuZGlnZXN0KCk7XG4gIGNvbnN0IHRtcCA9IGhhc2hDb25zKHVuZGVmaW5lZCk7XG4gIGhhc2hDLm91dHB1dExlbiA9IHRtcC5vdXRwdXRMZW47XG4gIGhhc2hDLmJsb2NrTGVuID0gdG1wLmJsb2NrTGVuO1xuICBoYXNoQy5jcmVhdGUgPSAob3B0cz86IE9wdHMpID0+IGhhc2hDb25zKG9wdHMpO1xuICBPYmplY3QuYXNzaWduKGhhc2hDLCBpbmZvKTtcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoaGFzaEMpO1xufVxuXG4vKiogQ3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIFBSTkcuIFVzZXMgaW50ZXJuYWwgT1MtbGV2ZWwgYGNyeXB0by5nZXRSYW5kb21WYWx1ZXNgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbUJ5dGVzKGJ5dGVzTGVuZ3RoID0gMzIpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgY3IgPSB0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcgPyAoZ2xvYmFsVGhpcyBhcyBhbnkpLmNyeXB0byA6IG51bGw7XG4gIGlmICh0eXBlb2YgY3I/LmdldFJhbmRvbVZhbHVlcyAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIHJldHVybiBjci5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoYnl0ZXNMZW5ndGgpKTtcbn1cblxuLyoqIENyZWF0ZXMgT0lEIG9wdHMgZm9yIE5JU1QgaGFzaGVzLCB3aXRoIHByZWZpeCAwNiAwOSA2MCA4NiA0OCAwMSA2NSAwMyAwNCAwMi4gKi9cbmV4cG9ydCBjb25zdCBvaWROaXN0ID0gKHN1ZmZpeDogbnVtYmVyKTogUmVxdWlyZWQ8SGFzaEluZm8+ID0+ICh7XG4gIG9pZDogVWludDhBcnJheS5mcm9tKFsweDA2LCAweDA5LCAweDYwLCAweDg2LCAweDQ4LCAweDAxLCAweDY1LCAweDAzLCAweDA0LCAweDAyLCBzdWZmaXhdKSxcbn0pO1xuIiwgIi8qKlxuICogU0hBMiBoYXNoIGZ1bmN0aW9uLiBBLmsuYS4gc2hhMjU2LCBzaGEzODQsIHNoYTUxMiwgc2hhNTEyXzIyNCwgc2hhNTEyXzI1Ni5cbiAqIFNIQTI1NiBpcyB0aGUgZmFzdGVzdCBoYXNoIGltcGxlbWVudGFibGUgaW4gSlMsIGV2ZW4gZmFzdGVyIHRoYW4gQmxha2UzLlxuICogQ2hlY2sgb3V0IFtSRkMgNDYzNF0oaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzQ2MzQpIGFuZFxuICogW0ZJUFMgMTgwLTRdKGh0dHBzOi8vbnZscHVicy5uaXN0Lmdvdi9uaXN0cHVicy9GSVBTL05JU1QuRklQUy4xODAtNC5wZGYpLlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBDaGksIEhhc2hNRCwgTWFqLCBTSEEyMjRfSVYsIFNIQTI1Nl9JViwgU0hBMzg0X0lWLCBTSEE1MTJfSVYgfSBmcm9tICcuL19tZC50cyc7XG5pbXBvcnQgKiBhcyB1NjQgZnJvbSAnLi9fdTY0LnRzJztcbmltcG9ydCB7IHR5cGUgQ0hhc2gsIGNsZWFuLCBjcmVhdGVIYXNoZXIsIG9pZE5pc3QsIHJvdHIgfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLyoqXG4gKiBSb3VuZCBjb25zdGFudHM6XG4gKiBGaXJzdCAzMiBiaXRzIG9mIGZyYWN0aW9uYWwgcGFydHMgb2YgdGhlIGN1YmUgcm9vdHMgb2YgdGhlIGZpcnN0IDY0IHByaW1lcyAyLi4zMTEpXG4gKi9cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgU0hBMjU2X0sgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NDI4YTJmOTgsIDB4NzEzNzQ0OTEsIDB4YjVjMGZiY2YsIDB4ZTliNWRiYTUsIDB4Mzk1NmMyNWIsIDB4NTlmMTExZjEsIDB4OTIzZjgyYTQsIDB4YWIxYzVlZDUsXG4gIDB4ZDgwN2FhOTgsIDB4MTI4MzViMDEsIDB4MjQzMTg1YmUsIDB4NTUwYzdkYzMsIDB4NzJiZTVkNzQsIDB4ODBkZWIxZmUsIDB4OWJkYzA2YTcsIDB4YzE5YmYxNzQsXG4gIDB4ZTQ5YjY5YzEsIDB4ZWZiZTQ3ODYsIDB4MGZjMTlkYzYsIDB4MjQwY2ExY2MsIDB4MmRlOTJjNmYsIDB4NGE3NDg0YWEsIDB4NWNiMGE5ZGMsIDB4NzZmOTg4ZGEsXG4gIDB4OTgzZTUxNTIsIDB4YTgzMWM2NmQsIDB4YjAwMzI3YzgsIDB4YmY1OTdmYzcsIDB4YzZlMDBiZjMsIDB4ZDVhNzkxNDcsIDB4MDZjYTYzNTEsIDB4MTQyOTI5NjcsXG4gIDB4MjdiNzBhODUsIDB4MmUxYjIxMzgsIDB4NGQyYzZkZmMsIDB4NTMzODBkMTMsIDB4NjUwYTczNTQsIDB4NzY2YTBhYmIsIDB4ODFjMmM5MmUsIDB4OTI3MjJjODUsXG4gIDB4YTJiZmU4YTEsIDB4YTgxYTY2NGIsIDB4YzI0YjhiNzAsIDB4Yzc2YzUxYTMsIDB4ZDE5MmU4MTksIDB4ZDY5OTA2MjQsIDB4ZjQwZTM1ODUsIDB4MTA2YWEwNzAsXG4gIDB4MTlhNGMxMTYsIDB4MWUzNzZjMDgsIDB4Mjc0ODc3NGMsIDB4MzRiMGJjYjUsIDB4MzkxYzBjYjMsIDB4NGVkOGFhNGEsIDB4NWI5Y2NhNGYsIDB4NjgyZTZmZjMsXG4gIDB4NzQ4ZjgyZWUsIDB4NzhhNTYzNmYsIDB4ODRjODc4MTQsIDB4OGNjNzAyMDgsIDB4OTBiZWZmZmEsIDB4YTQ1MDZjZWIsIDB4YmVmOWEzZjcsIDB4YzY3MTc4ZjJcbl0pO1xuXG4vKiogUmV1c2FibGUgdGVtcG9yYXJ5IGJ1ZmZlci4gXCJXXCIgY29tZXMgc3RyYWlnaHQgZnJvbSBzcGVjLiAqL1xuY29uc3QgU0hBMjU2X1cgPSAvKiBAX19QVVJFX18gKi8gbmV3IFVpbnQzMkFycmF5KDY0KTtcblxuLyoqIEludGVybmFsIDMyLWJ5dGUgYmFzZSBTSEEyIGhhc2ggY2xhc3MuICovXG5hYnN0cmFjdCBjbGFzcyBTSEEyXzMyQjxUIGV4dGVuZHMgU0hBMl8zMkI8VD4+IGV4dGVuZHMgSGFzaE1EPFQ+IHtcbiAgLy8gV2UgY2Fubm90IHVzZSBhcnJheSBoZXJlIHNpbmNlIGFycmF5IGFsbG93cyBpbmRleGluZyBieSB2YXJpYWJsZVxuICAvLyB3aGljaCBtZWFucyBvcHRpbWl6ZXIvY29tcGlsZXIgY2Fubm90IHVzZSByZWdpc3RlcnMuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBBOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBCOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBEOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBFOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBHOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBIOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob3V0cHV0TGVuOiBudW1iZXIpIHtcbiAgICBzdXBlcig2NCwgb3V0cHV0TGVuLCA4LCBmYWxzZSk7XG4gIH1cbiAgcHJvdGVjdGVkIGdldCgpOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdIHtcbiAgICBjb25zdCB7IEEsIEIsIEMsIEQsIEUsIEYsIEcsIEggfSA9IHRoaXM7XG4gICAgcmV0dXJuIFtBLCBCLCBDLCBELCBFLCBGLCBHLCBIXTtcbiAgfVxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJvdGVjdGVkIHNldChcbiAgICBBOiBudW1iZXIsIEI6IG51bWJlciwgQzogbnVtYmVyLCBEOiBudW1iZXIsIEU6IG51bWJlciwgRjogbnVtYmVyLCBHOiBudW1iZXIsIEg6IG51bWJlclxuICApOiB2b2lkIHtcbiAgICB0aGlzLkEgPSBBIHwgMDtcbiAgICB0aGlzLkIgPSBCIHwgMDtcbiAgICB0aGlzLkMgPSBDIHwgMDtcbiAgICB0aGlzLkQgPSBEIHwgMDtcbiAgICB0aGlzLkUgPSBFIHwgMDtcbiAgICB0aGlzLkYgPSBGIHwgMDtcbiAgICB0aGlzLkcgPSBHIHwgMDtcbiAgICB0aGlzLkggPSBIIHwgMDtcbiAgfVxuICBwcm90ZWN0ZWQgcHJvY2Vzcyh2aWV3OiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBFeHRlbmQgdGhlIGZpcnN0IDE2IHdvcmRzIGludG8gdGhlIHJlbWFpbmluZyA0OCB3b3JkcyB3WzE2Li42M10gb2YgdGhlIG1lc3NhZ2Ugc2NoZWR1bGUgYXJyYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyssIG9mZnNldCArPSA0KSBTSEEyNTZfV1tpXSA9IHZpZXcuZ2V0VWludDMyKG9mZnNldCwgZmFsc2UpO1xuICAgIGZvciAobGV0IGkgPSAxNjsgaSA8IDY0OyBpKyspIHtcbiAgICAgIGNvbnN0IFcxNSA9IFNIQTI1Nl9XW2kgLSAxNV07XG4gICAgICBjb25zdCBXMiA9IFNIQTI1Nl9XW2kgLSAyXTtcbiAgICAgIGNvbnN0IHMwID0gcm90cihXMTUsIDcpIF4gcm90cihXMTUsIDE4KSBeIChXMTUgPj4+IDMpO1xuICAgICAgY29uc3QgczEgPSByb3RyKFcyLCAxNykgXiByb3RyKFcyLCAxOSkgXiAoVzIgPj4+IDEwKTtcbiAgICAgIFNIQTI1Nl9XW2ldID0gKHMxICsgU0hBMjU2X1dbaSAtIDddICsgczAgKyBTSEEyNTZfV1tpIC0gMTZdKSB8IDA7XG4gICAgfVxuICAgIC8vIENvbXByZXNzaW9uIGZ1bmN0aW9uIG1haW4gbG9vcCwgNjQgcm91bmRzXG4gICAgbGV0IHsgQSwgQiwgQywgRCwgRSwgRiwgRywgSCB9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY0OyBpKyspIHtcbiAgICAgIGNvbnN0IHNpZ21hMSA9IHJvdHIoRSwgNikgXiByb3RyKEUsIDExKSBeIHJvdHIoRSwgMjUpO1xuICAgICAgY29uc3QgVDEgPSAoSCArIHNpZ21hMSArIENoaShFLCBGLCBHKSArIFNIQTI1Nl9LW2ldICsgU0hBMjU2X1dbaV0pIHwgMDtcbiAgICAgIGNvbnN0IHNpZ21hMCA9IHJvdHIoQSwgMikgXiByb3RyKEEsIDEzKSBeIHJvdHIoQSwgMjIpO1xuICAgICAgY29uc3QgVDIgPSAoc2lnbWEwICsgTWFqKEEsIEIsIEMpKSB8IDA7XG4gICAgICBIID0gRztcbiAgICAgIEcgPSBGO1xuICAgICAgRiA9IEU7XG4gICAgICBFID0gKEQgKyBUMSkgfCAwO1xuICAgICAgRCA9IEM7XG4gICAgICBDID0gQjtcbiAgICAgIEIgPSBBO1xuICAgICAgQSA9IChUMSArIFQyKSB8IDA7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgY29tcHJlc3NlZCBjaHVuayB0byB0aGUgY3VycmVudCBoYXNoIHZhbHVlXG4gICAgQSA9IChBICsgdGhpcy5BKSB8IDA7XG4gICAgQiA9IChCICsgdGhpcy5CKSB8IDA7XG4gICAgQyA9IChDICsgdGhpcy5DKSB8IDA7XG4gICAgRCA9IChEICsgdGhpcy5EKSB8IDA7XG4gICAgRSA9IChFICsgdGhpcy5FKSB8IDA7XG4gICAgRiA9IChGICsgdGhpcy5GKSB8IDA7XG4gICAgRyA9IChHICsgdGhpcy5HKSB8IDA7XG4gICAgSCA9IChIICsgdGhpcy5IKSB8IDA7XG4gICAgdGhpcy5zZXQoQSwgQiwgQywgRCwgRSwgRiwgRywgSCk7XG4gIH1cbiAgcHJvdGVjdGVkIHJvdW5kQ2xlYW4oKTogdm9pZCB7XG4gICAgY2xlYW4oU0hBMjU2X1cpO1xuICB9XG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gICAgY2xlYW4odGhpcy5idWZmZXIpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTI1NiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEEyNTYgZXh0ZW5kcyBTSEEyXzMyQjxfU0hBMjU2PiB7XG4gIC8vIFdlIGNhbm5vdCB1c2UgYXJyYXkgaGVyZSBzaW5jZSBhcnJheSBhbGxvd3MgaW5kZXhpbmcgYnkgdmFyaWFibGVcbiAgLy8gd2hpY2ggbWVhbnMgb3B0aW1pemVyL2NvbXBpbGVyIGNhbm5vdCB1c2UgcmVnaXN0ZXJzLlxuICBwcm90ZWN0ZWQgQTogbnVtYmVyID0gU0hBMjU2X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEI6IG51bWJlciA9IFNIQTI1Nl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBDOiBudW1iZXIgPSBTSEEyNTZfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgRDogbnVtYmVyID0gU0hBMjU2X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIEU6IG51bWJlciA9IFNIQTI1Nl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBGOiBudW1iZXIgPSBTSEEyNTZfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRzogbnVtYmVyID0gU0hBMjU2X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIEg6IG51bWJlciA9IFNIQTI1Nl9JVls3XSB8IDA7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDMyKTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi0yMjQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBMjI0IGV4dGVuZHMgU0hBMl8zMkI8X1NIQTIyND4ge1xuICBwcm90ZWN0ZWQgQTogbnVtYmVyID0gU0hBMjI0X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEI6IG51bWJlciA9IFNIQTIyNF9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBDOiBudW1iZXIgPSBTSEEyMjRfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgRDogbnVtYmVyID0gU0hBMjI0X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIEU6IG51bWJlciA9IFNIQTIyNF9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBGOiBudW1iZXIgPSBTSEEyMjRfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRzogbnVtYmVyID0gU0hBMjI0X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIEg6IG51bWJlciA9IFNIQTIyNF9JVls3XSB8IDA7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDI4KTtcbiAgfVxufVxuXG4vLyBTSEEyLTUxMiBpcyBzbG93ZXIgdGhhbiBzaGEyNTYgaW4ganMgYmVjYXVzZSB1NjQgb3BlcmF0aW9ucyBhcmUgc2xvdy5cblxuLy8gUm91bmQgY29udGFudHNcbi8vIEZpcnN0IDMyIGJpdHMgb2YgdGhlIGZyYWN0aW9uYWwgcGFydHMgb2YgdGhlIGN1YmUgcm9vdHMgb2YgdGhlIGZpcnN0IDgwIHByaW1lcyAyLi40MDlcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgSzUxMiA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4gdTY0LnNwbGl0KFtcbiAgJzB4NDI4YTJmOThkNzI4YWUyMicsICcweDcxMzc0NDkxMjNlZjY1Y2QnLCAnMHhiNWMwZmJjZmVjNGQzYjJmJywgJzB4ZTliNWRiYTU4MTg5ZGJiYycsXG4gICcweDM5NTZjMjViZjM0OGI1MzgnLCAnMHg1OWYxMTFmMWI2MDVkMDE5JywgJzB4OTIzZjgyYTRhZjE5NGY5YicsICcweGFiMWM1ZWQ1ZGE2ZDgxMTgnLFxuICAnMHhkODA3YWE5OGEzMDMwMjQyJywgJzB4MTI4MzViMDE0NTcwNmZiZScsICcweDI0MzE4NWJlNGVlNGIyOGMnLCAnMHg1NTBjN2RjM2Q1ZmZiNGUyJyxcbiAgJzB4NzJiZTVkNzRmMjdiODk2ZicsICcweDgwZGViMWZlM2IxNjk2YjEnLCAnMHg5YmRjMDZhNzI1YzcxMjM1JywgJzB4YzE5YmYxNzRjZjY5MjY5NCcsXG4gICcweGU0OWI2OWMxOWVmMTRhZDInLCAnMHhlZmJlNDc4NjM4NGYyNWUzJywgJzB4MGZjMTlkYzY4YjhjZDViNScsICcweDI0MGNhMWNjNzdhYzljNjUnLFxuICAnMHgyZGU5MmM2ZjU5MmIwMjc1JywgJzB4NGE3NDg0YWE2ZWE2ZTQ4MycsICcweDVjYjBhOWRjYmQ0MWZiZDQnLCAnMHg3NmY5ODhkYTgzMTE1M2I1JyxcbiAgJzB4OTgzZTUxNTJlZTY2ZGZhYicsICcweGE4MzFjNjZkMmRiNDMyMTAnLCAnMHhiMDAzMjdjODk4ZmIyMTNmJywgJzB4YmY1OTdmYzdiZWVmMGVlNCcsXG4gICcweGM2ZTAwYmYzM2RhODhmYzInLCAnMHhkNWE3OTE0NzkzMGFhNzI1JywgJzB4MDZjYTYzNTFlMDAzODI2ZicsICcweDE0MjkyOTY3MGEwZTZlNzAnLFxuICAnMHgyN2I3MGE4NTQ2ZDIyZmZjJywgJzB4MmUxYjIxMzg1YzI2YzkyNicsICcweDRkMmM2ZGZjNWFjNDJhZWQnLCAnMHg1MzM4MGQxMzlkOTViM2RmJyxcbiAgJzB4NjUwYTczNTQ4YmFmNjNkZScsICcweDc2NmEwYWJiM2M3N2IyYTgnLCAnMHg4MWMyYzkyZTQ3ZWRhZWU2JywgJzB4OTI3MjJjODUxNDgyMzUzYicsXG4gICcweGEyYmZlOGExNGNmMTAzNjQnLCAnMHhhODFhNjY0YmJjNDIzMDAxJywgJzB4YzI0YjhiNzBkMGY4OTc5MScsICcweGM3NmM1MWEzMDY1NGJlMzAnLFxuICAnMHhkMTkyZTgxOWQ2ZWY1MjE4JywgJzB4ZDY5OTA2MjQ1NTY1YTkxMCcsICcweGY0MGUzNTg1NTc3MTIwMmEnLCAnMHgxMDZhYTA3MDMyYmJkMWI4JyxcbiAgJzB4MTlhNGMxMTZiOGQyZDBjOCcsICcweDFlMzc2YzA4NTE0MWFiNTMnLCAnMHgyNzQ4Nzc0Y2RmOGVlYjk5JywgJzB4MzRiMGJjYjVlMTliNDhhOCcsXG4gICcweDM5MWMwY2IzYzVjOTVhNjMnLCAnMHg0ZWQ4YWE0YWUzNDE4YWNiJywgJzB4NWI5Y2NhNGY3NzYzZTM3MycsICcweDY4MmU2ZmYzZDZiMmI4YTMnLFxuICAnMHg3NDhmODJlZTVkZWZiMmZjJywgJzB4NzhhNTYzNmY0MzE3MmY2MCcsICcweDg0Yzg3ODE0YTFmMGFiNzInLCAnMHg4Y2M3MDIwODFhNjQzOWVjJyxcbiAgJzB4OTBiZWZmZmEyMzYzMWUyOCcsICcweGE0NTA2Y2ViZGU4MmJkZTknLCAnMHhiZWY5YTNmN2IyYzY3OTE1JywgJzB4YzY3MTc4ZjJlMzcyNTMyYicsXG4gICcweGNhMjczZWNlZWEyNjYxOWMnLCAnMHhkMTg2YjhjNzIxYzBjMjA3JywgJzB4ZWFkYTdkZDZjZGUwZWIxZScsICcweGY1N2Q0ZjdmZWU2ZWQxNzgnLFxuICAnMHgwNmYwNjdhYTcyMTc2ZmJhJywgJzB4MGE2MzdkYzVhMmM4OThhNicsICcweDExM2Y5ODA0YmVmOTBkYWUnLCAnMHgxYjcxMGIzNTEzMWM0NzFiJyxcbiAgJzB4MjhkYjc3ZjUyMzA0N2Q4NCcsICcweDMyY2FhYjdiNDBjNzI0OTMnLCAnMHgzYzllYmUwYTE1YzliZWJjJywgJzB4NDMxZDY3YzQ5YzEwMGQ0YycsXG4gICcweDRjYzVkNGJlY2IzZTQyYjYnLCAnMHg1OTdmMjk5Y2ZjNjU3ZTJhJywgJzB4NWZjYjZmYWIzYWQ2ZmFlYycsICcweDZjNDQxOThjNGE0NzU4MTcnXG5dLm1hcChuID0+IEJpZ0ludChuKSkpKSgpO1xuY29uc3QgU0hBNTEyX0toID0gLyogQF9fUFVSRV9fICovICgoKSA9PiBLNTEyWzBdKSgpO1xuY29uc3QgU0hBNTEyX0tsID0gLyogQF9fUFVSRV9fICovICgoKSA9PiBLNTEyWzFdKSgpO1xuXG4vLyBSZXVzYWJsZSB0ZW1wb3JhcnkgYnVmZmVyc1xuY29uc3QgU0hBNTEyX1dfSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoODApO1xuY29uc3QgU0hBNTEyX1dfTCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoODApO1xuXG4vKiogSW50ZXJuYWwgNjQtYnl0ZSBiYXNlIFNIQTIgaGFzaCBjbGFzcy4gKi9cbmFic3RyYWN0IGNsYXNzIFNIQTJfNjRCPFQgZXh0ZW5kcyBTSEEyXzY0QjxUPj4gZXh0ZW5kcyBIYXNoTUQ8VD4ge1xuICAvLyBXZSBjYW5ub3QgdXNlIGFycmF5IGhlcmUgc2luY2UgYXJyYXkgYWxsb3dzIGluZGV4aW5nIGJ5IHZhcmlhYmxlXG4gIC8vIHdoaWNoIG1lYW5zIG9wdGltaXplci9jb21waWxlciBjYW5ub3QgdXNlIHJlZ2lzdGVycy5cbiAgLy8gaCAtLSBoaWdoIDMyIGJpdHMsIGwgLS0gbG93IDMyIGJpdHNcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEFoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBBbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQmg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEJsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQ2w6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IERoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBEbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRWg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEVsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRmw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEdoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBHbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgSGg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEhsOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob3V0cHV0TGVuOiBudW1iZXIpIHtcbiAgICBzdXBlcigxMjgsIG91dHB1dExlbiwgMTYsIGZhbHNlKTtcbiAgfVxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJvdGVjdGVkIGdldCgpOiBbXG4gICAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsXG4gICAgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJcbiAgXSB7XG4gICAgY29uc3QgeyBBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCB9ID0gdGhpcztcbiAgICByZXR1cm4gW0FoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsXTtcbiAgfVxuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgcHJvdGVjdGVkIHNldChcbiAgICBBaDogbnVtYmVyLCBBbDogbnVtYmVyLCBCaDogbnVtYmVyLCBCbDogbnVtYmVyLCBDaDogbnVtYmVyLCBDbDogbnVtYmVyLCBEaDogbnVtYmVyLCBEbDogbnVtYmVyLFxuICAgIEVoOiBudW1iZXIsIEVsOiBudW1iZXIsIEZoOiBudW1iZXIsIEZsOiBudW1iZXIsIEdoOiBudW1iZXIsIEdsOiBudW1iZXIsIEhoOiBudW1iZXIsIEhsOiBudW1iZXJcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5BaCA9IEFoIHwgMDtcbiAgICB0aGlzLkFsID0gQWwgfCAwO1xuICAgIHRoaXMuQmggPSBCaCB8IDA7XG4gICAgdGhpcy5CbCA9IEJsIHwgMDtcbiAgICB0aGlzLkNoID0gQ2ggfCAwO1xuICAgIHRoaXMuQ2wgPSBDbCB8IDA7XG4gICAgdGhpcy5EaCA9IERoIHwgMDtcbiAgICB0aGlzLkRsID0gRGwgfCAwO1xuICAgIHRoaXMuRWggPSBFaCB8IDA7XG4gICAgdGhpcy5FbCA9IEVsIHwgMDtcbiAgICB0aGlzLkZoID0gRmggfCAwO1xuICAgIHRoaXMuRmwgPSBGbCB8IDA7XG4gICAgdGhpcy5HaCA9IEdoIHwgMDtcbiAgICB0aGlzLkdsID0gR2wgfCAwO1xuICAgIHRoaXMuSGggPSBIaCB8IDA7XG4gICAgdGhpcy5IbCA9IEhsIHwgMDtcbiAgfVxuICBwcm90ZWN0ZWQgcHJvY2Vzcyh2aWV3OiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBFeHRlbmQgdGhlIGZpcnN0IDE2IHdvcmRzIGludG8gdGhlIHJlbWFpbmluZyA2NCB3b3JkcyB3WzE2Li43OV0gb2YgdGhlIG1lc3NhZ2Ugc2NoZWR1bGUgYXJyYXlcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyssIG9mZnNldCArPSA0KSB7XG4gICAgICBTSEE1MTJfV19IW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0KTtcbiAgICAgIFNIQTUxMl9XX0xbaV0gPSB2aWV3LmdldFVpbnQzMigob2Zmc2V0ICs9IDQpKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE2OyBpIDwgODA7IGkrKykge1xuICAgICAgLy8gczAgOj0gKHdbaS0xNV0gcmlnaHRyb3RhdGUgMSkgeG9yICh3W2ktMTVdIHJpZ2h0cm90YXRlIDgpIHhvciAod1tpLTE1XSByaWdodHNoaWZ0IDcpXG4gICAgICBjb25zdCBXMTVoID0gU0hBNTEyX1dfSFtpIC0gMTVdIHwgMDtcbiAgICAgIGNvbnN0IFcxNWwgPSBTSEE1MTJfV19MW2kgLSAxNV0gfCAwO1xuICAgICAgY29uc3QgczBoID0gdTY0LnJvdHJTSChXMTVoLCBXMTVsLCAxKSBeIHU2NC5yb3RyU0goVzE1aCwgVzE1bCwgOCkgXiB1NjQuc2hyU0goVzE1aCwgVzE1bCwgNyk7XG4gICAgICBjb25zdCBzMGwgPSB1NjQucm90clNMKFcxNWgsIFcxNWwsIDEpIF4gdTY0LnJvdHJTTChXMTVoLCBXMTVsLCA4KSBeIHU2NC5zaHJTTChXMTVoLCBXMTVsLCA3KTtcbiAgICAgIC8vIHMxIDo9ICh3W2ktMl0gcmlnaHRyb3RhdGUgMTkpIHhvciAod1tpLTJdIHJpZ2h0cm90YXRlIDYxKSB4b3IgKHdbaS0yXSByaWdodHNoaWZ0IDYpXG4gICAgICBjb25zdCBXMmggPSBTSEE1MTJfV19IW2kgLSAyXSB8IDA7XG4gICAgICBjb25zdCBXMmwgPSBTSEE1MTJfV19MW2kgLSAyXSB8IDA7XG4gICAgICBjb25zdCBzMWggPSB1NjQucm90clNIKFcyaCwgVzJsLCAxOSkgXiB1NjQucm90ckJIKFcyaCwgVzJsLCA2MSkgXiB1NjQuc2hyU0goVzJoLCBXMmwsIDYpO1xuICAgICAgY29uc3QgczFsID0gdTY0LnJvdHJTTChXMmgsIFcybCwgMTkpIF4gdTY0LnJvdHJCTChXMmgsIFcybCwgNjEpIF4gdTY0LnNoclNMKFcyaCwgVzJsLCA2KTtcbiAgICAgIC8vIFNIQTI1Nl9XW2ldID0gczAgKyBzMSArIFNIQTI1Nl9XW2kgLSA3XSArIFNIQTI1Nl9XW2kgLSAxNl07XG4gICAgICBjb25zdCBTVU1sID0gdTY0LmFkZDRMKHMwbCwgczFsLCBTSEE1MTJfV19MW2kgLSA3XSwgU0hBNTEyX1dfTFtpIC0gMTZdKTtcbiAgICAgIGNvbnN0IFNVTWggPSB1NjQuYWRkNEgoU1VNbCwgczBoLCBzMWgsIFNIQTUxMl9XX0hbaSAtIDddLCBTSEE1MTJfV19IW2kgLSAxNl0pO1xuICAgICAgU0hBNTEyX1dfSFtpXSA9IFNVTWggfCAwO1xuICAgICAgU0hBNTEyX1dfTFtpXSA9IFNVTWwgfCAwO1xuICAgIH1cbiAgICBsZXQgeyBBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCB9ID0gdGhpcztcbiAgICAvLyBDb21wcmVzc2lvbiBmdW5jdGlvbiBtYWluIGxvb3AsIDgwIHJvdW5kc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODA7IGkrKykge1xuICAgICAgLy8gUzEgOj0gKGUgcmlnaHRyb3RhdGUgMTQpIHhvciAoZSByaWdodHJvdGF0ZSAxOCkgeG9yIChlIHJpZ2h0cm90YXRlIDQxKVxuICAgICAgY29uc3Qgc2lnbWExaCA9IHU2NC5yb3RyU0goRWgsIEVsLCAxNCkgXiB1NjQucm90clNIKEVoLCBFbCwgMTgpIF4gdTY0LnJvdHJCSChFaCwgRWwsIDQxKTtcbiAgICAgIGNvbnN0IHNpZ21hMWwgPSB1NjQucm90clNMKEVoLCBFbCwgMTQpIF4gdTY0LnJvdHJTTChFaCwgRWwsIDE4KSBeIHU2NC5yb3RyQkwoRWgsIEVsLCA0MSk7XG4gICAgICAvL2NvbnN0IFQxID0gKEggKyBzaWdtYTEgKyBDaGkoRSwgRiwgRykgKyBTSEEyNTZfS1tpXSArIFNIQTI1Nl9XW2ldKSB8IDA7XG4gICAgICBjb25zdCBDSEloID0gKEVoICYgRmgpIF4gKH5FaCAmIEdoKTtcbiAgICAgIGNvbnN0IENISWwgPSAoRWwgJiBGbCkgXiAofkVsICYgR2wpO1xuICAgICAgLy8gVDEgPSBIICsgc2lnbWExICsgQ2hpKEUsIEYsIEcpICsgU0hBNTEyX0tbaV0gKyBTSEE1MTJfV1tpXVxuICAgICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBjb25zdCBUMWxsID0gdTY0LmFkZDVMKEhsLCBzaWdtYTFsLCBDSElsLCBTSEE1MTJfS2xbaV0sIFNIQTUxMl9XX0xbaV0pO1xuICAgICAgY29uc3QgVDFoID0gdTY0LmFkZDVIKFQxbGwsIEhoLCBzaWdtYTFoLCBDSEloLCBTSEE1MTJfS2hbaV0sIFNIQTUxMl9XX0hbaV0pO1xuICAgICAgY29uc3QgVDFsID0gVDFsbCB8IDA7XG4gICAgICAvLyBTMCA6PSAoYSByaWdodHJvdGF0ZSAyOCkgeG9yIChhIHJpZ2h0cm90YXRlIDM0KSB4b3IgKGEgcmlnaHRyb3RhdGUgMzkpXG4gICAgICBjb25zdCBzaWdtYTBoID0gdTY0LnJvdHJTSChBaCwgQWwsIDI4KSBeIHU2NC5yb3RyQkgoQWgsIEFsLCAzNCkgXiB1NjQucm90ckJIKEFoLCBBbCwgMzkpO1xuICAgICAgY29uc3Qgc2lnbWEwbCA9IHU2NC5yb3RyU0woQWgsIEFsLCAyOCkgXiB1NjQucm90ckJMKEFoLCBBbCwgMzQpIF4gdTY0LnJvdHJCTChBaCwgQWwsIDM5KTtcbiAgICAgIGNvbnN0IE1BSmggPSAoQWggJiBCaCkgXiAoQWggJiBDaCkgXiAoQmggJiBDaCk7XG4gICAgICBjb25zdCBNQUpsID0gKEFsICYgQmwpIF4gKEFsICYgQ2wpIF4gKEJsICYgQ2wpO1xuICAgICAgSGggPSBHaCB8IDA7XG4gICAgICBIbCA9IEdsIHwgMDtcbiAgICAgIEdoID0gRmggfCAwO1xuICAgICAgR2wgPSBGbCB8IDA7XG4gICAgICBGaCA9IEVoIHwgMDtcbiAgICAgIEZsID0gRWwgfCAwO1xuICAgICAgKHsgaDogRWgsIGw6IEVsIH0gPSB1NjQuYWRkKERoIHwgMCwgRGwgfCAwLCBUMWggfCAwLCBUMWwgfCAwKSk7XG4gICAgICBEaCA9IENoIHwgMDtcbiAgICAgIERsID0gQ2wgfCAwO1xuICAgICAgQ2ggPSBCaCB8IDA7XG4gICAgICBDbCA9IEJsIHwgMDtcbiAgICAgIEJoID0gQWggfCAwO1xuICAgICAgQmwgPSBBbCB8IDA7XG4gICAgICBjb25zdCBBbGwgPSB1NjQuYWRkM0woVDFsLCBzaWdtYTBsLCBNQUpsKTtcbiAgICAgIEFoID0gdTY0LmFkZDNIKEFsbCwgVDFoLCBzaWdtYTBoLCBNQUpoKTtcbiAgICAgIEFsID0gQWxsIHwgMDtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBjb21wcmVzc2VkIGNodW5rIHRvIHRoZSBjdXJyZW50IGhhc2ggdmFsdWVcbiAgICAoeyBoOiBBaCwgbDogQWwgfSA9IHU2NC5hZGQodGhpcy5BaCB8IDAsIHRoaXMuQWwgfCAwLCBBaCB8IDAsIEFsIHwgMCkpO1xuICAgICh7IGg6IEJoLCBsOiBCbCB9ID0gdTY0LmFkZCh0aGlzLkJoIHwgMCwgdGhpcy5CbCB8IDAsIEJoIHwgMCwgQmwgfCAwKSk7XG4gICAgKHsgaDogQ2gsIGw6IENsIH0gPSB1NjQuYWRkKHRoaXMuQ2ggfCAwLCB0aGlzLkNsIHwgMCwgQ2ggfCAwLCBDbCB8IDApKTtcbiAgICAoeyBoOiBEaCwgbDogRGwgfSA9IHU2NC5hZGQodGhpcy5EaCB8IDAsIHRoaXMuRGwgfCAwLCBEaCB8IDAsIERsIHwgMCkpO1xuICAgICh7IGg6IEVoLCBsOiBFbCB9ID0gdTY0LmFkZCh0aGlzLkVoIHwgMCwgdGhpcy5FbCB8IDAsIEVoIHwgMCwgRWwgfCAwKSk7XG4gICAgKHsgaDogRmgsIGw6IEZsIH0gPSB1NjQuYWRkKHRoaXMuRmggfCAwLCB0aGlzLkZsIHwgMCwgRmggfCAwLCBGbCB8IDApKTtcbiAgICAoeyBoOiBHaCwgbDogR2wgfSA9IHU2NC5hZGQodGhpcy5HaCB8IDAsIHRoaXMuR2wgfCAwLCBHaCB8IDAsIEdsIHwgMCkpO1xuICAgICh7IGg6IEhoLCBsOiBIbCB9ID0gdTY0LmFkZCh0aGlzLkhoIHwgMCwgdGhpcy5IbCB8IDAsIEhoIHwgMCwgSGwgfCAwKSk7XG4gICAgdGhpcy5zZXQoQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGwpO1xuICB9XG4gIHByb3RlY3RlZCByb3VuZENsZWFuKCk6IHZvaWQge1xuICAgIGNsZWFuKFNIQTUxMl9XX0gsIFNIQTUxMl9XX0wpO1xuICB9XG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgY2xlYW4odGhpcy5idWZmZXIpO1xuICAgIHRoaXMuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTUxMiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTIgZXh0ZW5kcyBTSEEyXzY0QjxfU0hBNTEyPiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gU0hBNTEyX0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBTSEE1MTJfSVZbMV0gfCAwO1xuICBwcm90ZWN0ZWQgQmg6IG51bWJlciA9IFNIQTUxMl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gU0hBNTEyX0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBTSEE1MTJfSVZbNF0gfCAwO1xuICBwcm90ZWN0ZWQgQ2w6IG51bWJlciA9IFNIQTUxMl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gU0hBNTEyX0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBTSEE1MTJfSVZbN10gfCAwO1xuICBwcm90ZWN0ZWQgRWg6IG51bWJlciA9IFNIQTUxMl9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gU0hBNTEyX0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBTSEE1MTJfSVZbMTBdIHwgMDtcbiAgcHJvdGVjdGVkIEZsOiBudW1iZXIgPSBTSEE1MTJfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBTSEE1MTJfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBTSEE1MTJfSVZbMTNdIHwgMDtcbiAgcHJvdGVjdGVkIEhoOiBudW1iZXIgPSBTSEE1MTJfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBTSEE1MTJfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcig2NCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItMzg0IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTM4NCBleHRlbmRzIFNIQTJfNjRCPF9TSEEzODQ+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBTSEEzODRfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFNIQTM4NF9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gU0hBMzg0X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBTSEEzODRfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFNIQTM4NF9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gU0hBMzg0X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBTSEEzODRfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFNIQTM4NF9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gU0hBMzg0X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBTSEEzODRfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFNIQTM4NF9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFNIQTM4NF9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFNIQTM4NF9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFNIQTM4NF9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFNIQTM4NF9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFNIQTM4NF9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDQ4KTtcbiAgfVxufVxuXG4vKipcbiAqIFRydW5jYXRlZCBTSEE1MTIvMjU2IGFuZCBTSEE1MTIvMjI0LlxuICogU0hBNTEyX0lWIGlzIFhPUmVkIHdpdGggMHhhNWE1YTVhNWE1YTVhNWE1LCB0aGVuIHVzZWQgYXMgXCJpbnRlcm1lZGlhcnlcIiBJViBvZiBTSEE1MTIvdC5cbiAqIFRoZW4gdCBoYXNoZXMgc3RyaW5nIHRvIHByb2R1Y2UgcmVzdWx0IElWLlxuICogU2VlIGB0ZXN0L21pc2Mvc2hhMi1nZW4taXYuanNgLlxuICovXG5cbi8qKiBTSEE1MTIvMjI0IElWICovXG5jb25zdCBUMjI0X0lWID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDhjM2QzN2M4LCAweDE5NTQ0ZGEyLCAweDczZTE5OTY2LCAweDg5ZGNkNGQ2LCAweDFkZmFiN2FlLCAweDMyZmY5YzgyLCAweDY3OWRkNTE0LCAweDU4MmY5ZmNmLFxuICAweDBmNmQyYjY5LCAweDdiZDQ0ZGE4LCAweDc3ZTM2ZjczLCAweDA0YzQ4OTQyLCAweDNmOWQ4NWE4LCAweDZhMWQzNmM4LCAweDExMTJlNmFkLCAweDkxZDY5MmExLFxuXSk7XG5cbi8qKiBTSEE1MTIvMjU2IElWICovXG5jb25zdCBUMjU2X0lWID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDIyMzEyMTk0LCAweGZjMmJmNzJjLCAweDlmNTU1ZmEzLCAweGM4NGM2NGMyLCAweDIzOTNiODZiLCAweDZmNTNiMTUxLCAweDk2Mzg3NzE5LCAweDU5NDBlYWJkLFxuICAweDk2MjgzZWUyLCAweGE4OGVmZmUzLCAweGJlNWUxZTI1LCAweDUzODYzOTkyLCAweDJiMDE5OWZjLCAweDJjODViOGFhLCAweDBlYjcyZGRjLCAweDgxYzUyY2EyLFxuXSk7XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTUxMi8yMjQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBNTEyXzIyNCBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTJfMjI0PiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gVDIyNF9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gVDIyNF9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gVDIyNF9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gVDIyNF9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gVDIyNF9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gVDIyNF9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gVDIyNF9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gVDIyNF9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gVDIyNF9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gVDIyNF9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gVDIyNF9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFQyMjRfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBUMjI0X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gVDIyNF9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFQyMjRfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBUMjI0X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMjgpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTUxMi8yNTYgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBNTEyXzI1NiBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTJfMjU2PiB7XG4gIHByb3RlY3RlZCBBaDogbnVtYmVyID0gVDI1Nl9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gVDI1Nl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gVDI1Nl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBCbDogbnVtYmVyID0gVDI1Nl9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gVDI1Nl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gVDI1Nl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBEaDogbnVtYmVyID0gVDI1Nl9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gVDI1Nl9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gVDI1Nl9JVls4XSB8IDA7XG4gIHByb3RlY3RlZCBFbDogbnVtYmVyID0gVDI1Nl9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gVDI1Nl9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFQyNTZfSVZbMTFdIHwgMDtcbiAgcHJvdGVjdGVkIEdoOiBudW1iZXIgPSBUMjU2X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gVDI1Nl9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFQyNTZfSVZbMTRdIHwgMDtcbiAgcHJvdGVjdGVkIEhsOiBudW1iZXIgPSBUMjU2X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMzIpO1xuICB9XG59XG5cbi8qKlxuICogU0hBMi0yNTYgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiBJbiBKUyBpdCdzIHRoZSBmYXN0ZXN0OiBldmVuIGZhc3RlciB0aGFuIEJsYWtlMy4gU29tZSBpbmZvOlxuICpcbiAqIC0gVHJ5aW5nIDJeMTI4IGhhc2hlcyB3b3VsZCBnZXQgNTAlIGNoYW5jZSBvZiBjb2xsaXNpb24sIHVzaW5nIGJpcnRoZGF5IGF0dGFjay5cbiAqIC0gQlRDIG5ldHdvcmsgaXMgZG9pbmcgMl43MCBoYXNoZXMvc2VjICgyXjk1IGhhc2hlcy95ZWFyKSBhcyBwZXIgMjAyNS5cbiAqIC0gRWFjaCBzaGEyNTYgaGFzaCBpcyBleGVjdXRpbmcgMl4xOCBiaXQgb3BlcmF0aW9ucy5cbiAqIC0gR29vZCAyMDI0IEFTSUNzIGNhbiBkbyAyMDBUaC9zZWMgd2l0aCAzNTAwIHdhdHRzIG9mIHBvd2VyLCBjb3JyZXNwb25kaW5nIHRvIDJeMzYgaGFzaGVzL2pvdWxlLlxuICovXG5leHBvcnQgY29uc3Qgc2hhMjU2OiBDSGFzaDxfU0hBMjU2PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMjU2KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDEpXG4pO1xuLyoqIFNIQTItMjI0IGhhc2ggZnVuY3Rpb24gZnJvbSBSRkMgNDYzNCAqL1xuZXhwb3J0IGNvbnN0IHNoYTIyNDogQ0hhc2g8X1NIQTIyND4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTIyNCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA0KVxuKTtcblxuLyoqIFNIQTItNTEyIGhhc2ggZnVuY3Rpb24gZnJvbSBSRkMgNDYzNC4gKi9cbmV4cG9ydCBjb25zdCBzaGE1MTI6IENIYXNoPF9TSEE1MTI+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEE1MTIoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwMylcbik7XG4vKiogU0hBMi0zODQgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiAqL1xuZXhwb3J0IGNvbnN0IHNoYTM4NDogQ0hhc2g8X1NIQTM4ND4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTM4NCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDAyKVxuKTtcblxuLyoqXG4gKiBTSEEyLTUxMi8yNTYgXCJ0cnVuY2F0ZWRcIiBoYXNoIGZ1bmN0aW9uLCB3aXRoIGltcHJvdmVkIHJlc2lzdGFuY2UgdG8gbGVuZ3RoIGV4dGVuc2lvbiBhdHRhY2tzLlxuICogU2VlIHRoZSBwYXBlciBvbiBbdHJ1bmNhdGVkIFNIQTUxMl0oaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMC81NDgucGRmKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMl8yNTY6IENIYXNoPF9TSEE1MTJfMjU2PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBNTEyXzI1NigpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA2KVxuKTtcbi8qKlxuICogU0hBMi01MTIvMjI0IFwidHJ1bmNhdGVkXCIgaGFzaCBmdW5jdGlvbiwgd2l0aCBpbXByb3ZlZCByZXNpc3RhbmNlIHRvIGxlbmd0aCBleHRlbnNpb24gYXR0YWNrcy5cbiAqIFNlZSB0aGUgcGFwZXIgb24gW3RydW5jYXRlZCBTSEE1MTJdKGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTAvNTQ4LnBkZikuXG4gKi9cbmV4cG9ydCBjb25zdCBzaGE1MTJfMjI0OiBDSGFzaDxfU0hBNTEyXzIyND4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTUxMl8yMjQoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwNSlcbik7XG4iLCAiLyoqXG4gKiBJbnRlcm5hbCBNZXJrbGUtRGFtZ2FyZCBoYXNoIHV0aWxzLlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBhYnl0ZXMsIGFleGlzdHMsIGFvdXRwdXQsIGNsZWFuLCBjcmVhdGVWaWV3LCB0eXBlIEhhc2ggfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLyoqIENob2ljZTogYSA/IGIgOiBjICovXG5leHBvcnQgZnVuY3Rpb24gQ2hpKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKGEgJiBiKSBeICh+YSAmIGMpO1xufVxuXG4vKiogTWFqb3JpdHkgZnVuY3Rpb24sIHRydWUgaWYgYW55IHR3byBpbnB1dHMgaXMgdHJ1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYWooYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoYSAmIGIpIF4gKGEgJiBjKSBeIChiICYgYyk7XG59XG5cbi8qKlxuICogTWVya2xlLURhbWdhcmQgaGFzaCBjb25zdHJ1Y3Rpb24gYmFzZSBjbGFzcy5cbiAqIENvdWxkIGJlIHVzZWQgdG8gY3JlYXRlIE1ENSwgUklQRU1ELCBTSEExLCBTSEEyLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSGFzaE1EPFQgZXh0ZW5kcyBIYXNoTUQ8VD4+IGltcGxlbWVudHMgSGFzaDxUPiB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBwcm9jZXNzKGJ1ZjogRGF0YVZpZXcsIG9mZnNldDogbnVtYmVyKTogdm9pZDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGdldCgpOiBudW1iZXJbXTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHNldCguLi5hcmdzOiBudW1iZXJbXSk6IHZvaWQ7XG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJvdW5kQ2xlYW4oKTogdm9pZDtcblxuICByZWFkb25seSBibG9ja0xlbjogbnVtYmVyO1xuICByZWFkb25seSBvdXRwdXRMZW46IG51bWJlcjtcbiAgcmVhZG9ubHkgcGFkT2Zmc2V0OiBudW1iZXI7XG4gIHJlYWRvbmx5IGlzTEU6IGJvb2xlYW47XG5cbiAgLy8gRm9yIHBhcnRpYWwgdXBkYXRlcyBsZXNzIHRoYW4gYmxvY2sgc2l6ZVxuICBwcm90ZWN0ZWQgYnVmZmVyOiBVaW50OEFycmF5O1xuICBwcm90ZWN0ZWQgdmlldzogRGF0YVZpZXc7XG4gIHByb3RlY3RlZCBmaW5pc2hlZCA9IGZhbHNlO1xuICBwcm90ZWN0ZWQgbGVuZ3RoID0gMDtcbiAgcHJvdGVjdGVkIHBvcyA9IDA7XG4gIHByb3RlY3RlZCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihibG9ja0xlbjogbnVtYmVyLCBvdXRwdXRMZW46IG51bWJlciwgcGFkT2Zmc2V0OiBudW1iZXIsIGlzTEU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmJsb2NrTGVuID0gYmxvY2tMZW47XG4gICAgdGhpcy5vdXRwdXRMZW4gPSBvdXRwdXRMZW47XG4gICAgdGhpcy5wYWRPZmZzZXQgPSBwYWRPZmZzZXQ7XG4gICAgdGhpcy5pc0xFID0gaXNMRTtcbiAgICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJsb2NrTGVuKTtcbiAgICB0aGlzLnZpZXcgPSBjcmVhdGVWaWV3KHRoaXMuYnVmZmVyKTtcbiAgfVxuICB1cGRhdGUoZGF0YTogVWludDhBcnJheSk6IHRoaXMge1xuICAgIGFleGlzdHModGhpcyk7XG4gICAgYWJ5dGVzKGRhdGEpO1xuICAgIGNvbnN0IHsgdmlldywgYnVmZmVyLCBibG9ja0xlbiB9ID0gdGhpcztcbiAgICBjb25zdCBsZW4gPSBkYXRhLmxlbmd0aDtcbiAgICBmb3IgKGxldCBwb3MgPSAwOyBwb3MgPCBsZW47ICkge1xuICAgICAgY29uc3QgdGFrZSA9IE1hdGgubWluKGJsb2NrTGVuIC0gdGhpcy5wb3MsIGxlbiAtIHBvcyk7XG4gICAgICAvLyBGYXN0IHBhdGg6IHdlIGhhdmUgYXQgbGVhc3Qgb25lIGJsb2NrIGluIGlucHV0LCBjYXN0IGl0IHRvIHZpZXcgYW5kIHByb2Nlc3NcbiAgICAgIGlmICh0YWtlID09PSBibG9ja0xlbikge1xuICAgICAgICBjb25zdCBkYXRhVmlldyA9IGNyZWF0ZVZpZXcoZGF0YSk7XG4gICAgICAgIGZvciAoOyBibG9ja0xlbiA8PSBsZW4gLSBwb3M7IHBvcyArPSBibG9ja0xlbikgdGhpcy5wcm9jZXNzKGRhdGFWaWV3LCBwb3MpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJ1ZmZlci5zZXQoZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIHRha2UpLCB0aGlzLnBvcyk7XG4gICAgICB0aGlzLnBvcyArPSB0YWtlO1xuICAgICAgcG9zICs9IHRha2U7XG4gICAgICBpZiAodGhpcy5wb3MgPT09IGJsb2NrTGVuKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICAgICAgdGhpcy5wb3MgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxlbmd0aCArPSBkYXRhLmxlbmd0aDtcbiAgICB0aGlzLnJvdW5kQ2xlYW4oKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBkaWdlc3RJbnRvKG91dDogVWludDhBcnJheSk6IHZvaWQge1xuICAgIGFleGlzdHModGhpcyk7XG4gICAgYW91dHB1dChvdXQsIHRoaXMpO1xuICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xuICAgIC8vIFBhZGRpbmdcbiAgICAvLyBXZSBjYW4gYXZvaWQgYWxsb2NhdGlvbiBvZiBidWZmZXIgZm9yIHBhZGRpbmcgY29tcGxldGVseSBpZiBpdFxuICAgIC8vIHdhcyBwcmV2aW91c2x5IG5vdCBhbGxvY2F0ZWQgaGVyZS4gQnV0IGl0IHdvbid0IGNoYW5nZSBwZXJmb3JtYW5jZS5cbiAgICBjb25zdCB7IGJ1ZmZlciwgdmlldywgYmxvY2tMZW4sIGlzTEUgfSA9IHRoaXM7XG4gICAgbGV0IHsgcG9zIH0gPSB0aGlzO1xuICAgIC8vIGFwcGVuZCB0aGUgYml0ICcxJyB0byB0aGUgbWVzc2FnZVxuICAgIGJ1ZmZlcltwb3MrK10gPSAwYjEwMDAwMDAwO1xuICAgIGNsZWFuKHRoaXMuYnVmZmVyLnN1YmFycmF5KHBvcykpO1xuICAgIC8vIHdlIGhhdmUgbGVzcyB0aGFuIHBhZE9mZnNldCBsZWZ0IGluIGJ1ZmZlciwgc28gd2UgY2Fubm90IHB1dCBsZW5ndGggaW5cbiAgICAvLyBjdXJyZW50IGJsb2NrLCBuZWVkIHByb2Nlc3MgaXQgYW5kIHBhZCBhZ2FpblxuICAgIGlmICh0aGlzLnBhZE9mZnNldCA+IGJsb2NrTGVuIC0gcG9zKSB7XG4gICAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgICBwb3MgPSAwO1xuICAgIH1cbiAgICAvLyBQYWQgdW50aWwgZnVsbCBibG9jayBieXRlIHdpdGggemVyb3NcbiAgICBmb3IgKGxldCBpID0gcG9zOyBpIDwgYmxvY2tMZW47IGkrKykgYnVmZmVyW2ldID0gMDtcbiAgICAvLyBOb3RlOiBzaGE1MTIgcmVxdWlyZXMgbGVuZ3RoIHRvIGJlIDEyOGJpdCBpbnRlZ2VyLCBidXQgbGVuZ3RoIGluIEpTIHdpbGwgb3ZlcmZsb3cgYmVmb3JlIHRoYXRcbiAgICAvLyBZb3UgbmVlZCB0byB3cml0ZSBhcm91bmQgMiBleGFieXRlcyAodTY0X21heCAvIDggLyAoMTAyNCoqNikpIGZvciB0aGlzIHRvIGhhcHBlbi5cbiAgICAvLyBTbyB3ZSBqdXN0IHdyaXRlIGxvd2VzdCA2NCBiaXRzIG9mIHRoYXQgdmFsdWUuXG4gICAgdmlldy5zZXRCaWdVaW50NjQoYmxvY2tMZW4gLSA4LCBCaWdJbnQodGhpcy5sZW5ndGggKiA4KSwgaXNMRSk7XG4gICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgIGNvbnN0IG92aWV3ID0gY3JlYXRlVmlldyhvdXQpO1xuICAgIGNvbnN0IGxlbiA9IHRoaXMub3V0cHV0TGVuO1xuICAgIC8vIE5PVEU6IHdlIGRvIGRpdmlzaW9uIGJ5IDQgbGF0ZXIsIHdoaWNoIG11c3QgYmUgZnVzZWQgaW4gc2luZ2xlIG9wIHdpdGggbW9kdWxvIGJ5IEpJVFxuICAgIGlmIChsZW4gJSA0KSB0aHJvdyBuZXcgRXJyb3IoJ19zaGEyOiBvdXRwdXRMZW4gbXVzdCBiZSBhbGlnbmVkIHRvIDMyYml0Jyk7XG4gICAgY29uc3Qgb3V0TGVuID0gbGVuIC8gNDtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZ2V0KCk7XG4gICAgaWYgKG91dExlbiA+IHN0YXRlLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdfc2hhMjogb3V0cHV0TGVuIGJpZ2dlciB0aGFuIHN0YXRlJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRMZW47IGkrKykgb3ZpZXcuc2V0VWludDMyKDQgKiBpLCBzdGF0ZVtpXSwgaXNMRSk7XG4gIH1cbiAgZGlnZXN0KCk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgYnVmZmVyLCBvdXRwdXRMZW4gfSA9IHRoaXM7XG4gICAgdGhpcy5kaWdlc3RJbnRvKGJ1ZmZlcik7XG4gICAgY29uc3QgcmVzID0gYnVmZmVyLnNsaWNlKDAsIG91dHB1dExlbik7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBfY2xvbmVJbnRvKHRvPzogVCk6IFQge1xuICAgIHRvIHx8PSBuZXcgKHRoaXMuY29uc3RydWN0b3IgYXMgYW55KSgpIGFzIFQ7XG4gICAgdG8uc2V0KC4uLnRoaXMuZ2V0KCkpO1xuICAgIGNvbnN0IHsgYmxvY2tMZW4sIGJ1ZmZlciwgbGVuZ3RoLCBmaW5pc2hlZCwgZGVzdHJveWVkLCBwb3MgfSA9IHRoaXM7XG4gICAgdG8uZGVzdHJveWVkID0gZGVzdHJveWVkO1xuICAgIHRvLmZpbmlzaGVkID0gZmluaXNoZWQ7XG4gICAgdG8ubGVuZ3RoID0gbGVuZ3RoO1xuICAgIHRvLnBvcyA9IHBvcztcbiAgICBpZiAobGVuZ3RoICUgYmxvY2tMZW4pIHRvLmJ1ZmZlci5zZXQoYnVmZmVyKTtcbiAgICByZXR1cm4gdG8gYXMgdW5rbm93biBhcyBhbnk7XG4gIH1cbiAgY2xvbmUoKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuX2Nsb25lSW50bygpO1xuICB9XG59XG5cbi8qKlxuICogSW5pdGlhbCBTSEEtMiBzdGF0ZTogZnJhY3Rpb25hbCBwYXJ0cyBvZiBzcXVhcmUgcm9vdHMgb2YgZmlyc3QgMTYgcHJpbWVzIDIuLjUzLlxuICogQ2hlY2sgb3V0IGB0ZXN0L21pc2Mvc2hhMi1nZW4taXYuanNgIGZvciByZWNvbXB1dGF0aW9uIGd1aWRlLlxuICovXG5cbi8qKiBJbml0aWFsIFNIQTI1NiBzdGF0ZS4gQml0cyAwLi4zMiBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMi4uMTkgKi9cbmV4cG9ydCBjb25zdCBTSEEyNTZfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDZhMDllNjY3LCAweGJiNjdhZTg1LCAweDNjNmVmMzcyLCAweGE1NGZmNTNhLCAweDUxMGU1MjdmLCAweDliMDU2ODhjLCAweDFmODNkOWFiLCAweDViZTBjZDE5LFxuXSk7XG5cbi8qKiBJbml0aWFsIFNIQTIyNCBzdGF0ZS4gQml0cyAzMi4uNjQgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIzLi41MyAqL1xuZXhwb3J0IGNvbnN0IFNIQTIyNF9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4YzEwNTllZDgsIDB4MzY3Y2Q1MDcsIDB4MzA3MGRkMTcsIDB4ZjcwZTU5MzksIDB4ZmZjMDBiMzEsIDB4Njg1ODE1MTEsIDB4NjRmOThmYTcsIDB4YmVmYTRmYTQsXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBMzg0IHN0YXRlLiBCaXRzIDAuLjY0IG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyMy4uNTMgKi9cbmV4cG9ydCBjb25zdCBTSEEzODRfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweGNiYmI5ZDVkLCAweGMxMDU5ZWQ4LCAweDYyOWEyOTJhLCAweDM2N2NkNTA3LCAweDkxNTkwMTVhLCAweDMwNzBkZDE3LCAweDE1MmZlY2Q4LCAweGY3MGU1OTM5LFxuICAweDY3MzMyNjY3LCAweGZmYzAwYjMxLCAweDhlYjQ0YTg3LCAweDY4NTgxNTExLCAweGRiMGMyZTBkLCAweDY0Zjk4ZmE3LCAweDQ3YjU0ODFkLCAweGJlZmE0ZmE0LFxuXSk7XG5cbi8qKiBJbml0aWFsIFNIQTUxMiBzdGF0ZS4gQml0cyAwLi42NCBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMi4uMTkgKi9cbmV4cG9ydCBjb25zdCBTSEE1MTJfSVY6IFVpbnQzMkFycmF5ID0gLyogQF9fUFVSRV9fICovIFVpbnQzMkFycmF5LmZyb20oW1xuICAweDZhMDllNjY3LCAweGYzYmNjOTA4LCAweGJiNjdhZTg1LCAweDg0Y2FhNzNiLCAweDNjNmVmMzcyLCAweGZlOTRmODJiLCAweGE1NGZmNTNhLCAweDVmMWQzNmYxLFxuICAweDUxMGU1MjdmLCAweGFkZTY4MmQxLCAweDliMDU2ODhjLCAweDJiM2U2YzFmLCAweDFmODNkOWFiLCAweGZiNDFiZDZiLCAweDViZTBjZDE5LCAweDEzN2UyMTc5LFxuXSk7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5vc3RyLWNyeXB0by11dGlsc1xuICogQGRlc2NyaXB0aW9uIENvcmUgY3J5cHRvZ3JhcGhpYyB1dGlsaXRpZXMgZm9yIE5vc3RyIHByb3RvY29sXG4gKi9cblxuLy8gQ29yZSB0eXBlc1xuZXhwb3J0IHR5cGUge1xuICBOb3N0ckV2ZW50LFxuICBVbnNpZ25lZE5vc3RyRXZlbnQsXG4gIFNpZ25lZE5vc3RyRXZlbnQsXG4gIE5vc3RyRmlsdGVyLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgUHVibGljS2V5LFxuICBLZXlQYWlyLFxuICBOb3N0ck1lc3NhZ2VUdXBsZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIEV2ZW50IGtpbmRzLCBtZXNzYWdlIHR5cGVzLCBhbmQgTklQLTQ2IHR5cGVzXG5leHBvcnQgeyBOb3N0ckV2ZW50S2luZCwgTm9zdHJNZXNzYWdlVHlwZSwgTmlwNDZNZXRob2QgfSBmcm9tICcuL3R5cGVzJztcbmV4cG9ydCB0eXBlIHtcbiAgTmlwNDZSZXF1ZXN0LFxuICBOaXA0NlJlc3BvbnNlLFxuICBOaXA0NlNlc3Npb24sXG4gIE5pcDQ2U2Vzc2lvbkluZm8sXG4gIEJ1bmtlclVSSSxcbiAgQnVua2VyVmFsaWRhdGlvblJlc3VsdCxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8vIENvcmUgY3J5cHRvIGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgZ2VuZXJhdGVLZXlQYWlyLFxuICBnZXRQdWJsaWNLZXksXG4gIGdldFB1YmxpY0tleVN5bmMsXG4gIHZhbGlkYXRlS2V5UGFpcixcbiAgY3JlYXRlRXZlbnQsXG4gIHNpZ25FdmVudCxcbiAgZmluYWxpemVFdmVudCxcbiAgdmVyaWZ5U2lnbmF0dXJlLFxuICBlbmNyeXB0LFxuICBkZWNyeXB0LFxufSBmcm9tICcuL2NyeXB0byc7XG5cbi8vIFZhbGlkYXRpb24gZnVuY3Rpb25zXG5leHBvcnQge1xuICB2YWxpZGF0ZUV2ZW50LFxuICB2YWxpZGF0ZUV2ZW50SWQsXG4gIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUsXG4gIHZhbGlkYXRlU2lnbmVkRXZlbnQsXG4gIHZhbGlkYXRlRXZlbnRCYXNlLFxuICB2YWxpZGF0ZUZpbHRlcixcbiAgdmFsaWRhdGVTdWJzY3JpcHRpb24sXG4gIHZhbGlkYXRlUmVzcG9uc2UsXG59IGZyb20gJy4vdmFsaWRhdGlvbic7XG5cbi8vIEV2ZW50IGZ1bmN0aW9uc1xuZXhwb3J0IHtcbiAgY2FsY3VsYXRlRXZlbnRJZCxcbn0gZnJvbSAnLi9ldmVudCc7XG5cbi8vIE5JUC0wNCBlbmNyeXB0aW9uXG5leHBvcnQge1xuICBjb21wdXRlU2hhcmVkU2VjcmV0LFxuICBlbmNyeXB0TWVzc2FnZSxcbiAgZGVjcnlwdE1lc3NhZ2UsXG59IGZyb20gJy4vbmlwcy9uaXAtMDQnO1xuXG4vLyBSZS1leHBvcnQgTklQc1xuZXhwb3J0ICogYXMgbmlwMDEgZnJvbSAnLi9uaXBzL25pcC0wMSc7XG5leHBvcnQgKiBhcyBuaXAwNCBmcm9tICcuL25pcHMvbmlwLTA0JztcbmV4cG9ydCAqIGFzIG5pcDE5IGZyb20gJy4vbmlwcy9uaXAtMTknO1xuZXhwb3J0ICogYXMgbmlwMjYgZnJvbSAnLi9uaXBzL25pcC0yNic7XG5leHBvcnQgKiBhcyBuaXA0NCBmcm9tICcuL25pcHMvbmlwLTQ0JztcbmV4cG9ydCAqIGFzIG5pcDQ2IGZyb20gJy4vbmlwcy9uaXAtNDYnO1xuZXhwb3J0ICogYXMgbmlwNDkgZnJvbSAnLi9uaXBzL25pcC00OSc7XG5cbi8vIFV0aWxzXG5leHBvcnQge1xuICBoZXhUb0J5dGVzLFxuICBieXRlc1RvSGV4LFxuICB1dGY4VG9CeXRlcyxcbiAgYnl0ZXNUb1V0ZjgsXG59IGZyb20gJy4vdXRpbHMvZW5jb2RpbmcnO1xuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlc1xuICogQGRlc2NyaXB0aW9uIFR5cGUgZGVmaW5pdGlvbnMgZm9yIE5vc3RyXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXlEZXRhaWxzIHtcbiAgaGV4OiBzdHJpbmc7XG4gIGJ5dGVzOiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEtleVBhaXIge1xuICBwcml2YXRlS2V5OiBzdHJpbmc7XG4gIHB1YmxpY0tleTogUHVibGljS2V5RGV0YWlscztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ckV2ZW50IHtcbiAga2luZDogbnVtYmVyO1xuICBjcmVhdGVkX2F0OiBudW1iZXI7XG4gIHRhZ3M6IHN0cmluZ1tdW107XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgcHVia2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVkTm9zdHJFdmVudCBleHRlbmRzIE5vc3RyRXZlbnQge1xuICBpZDogc3RyaW5nO1xuICBzaWc6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaWNLZXkge1xuICBoZXg6IHN0cmluZztcbiAgYnl0ZXM/OiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gTm9zdHJFdmVudEtpbmQge1xuICBTRVRfTUVUQURBVEEgPSAwLFxuICBURVhUX05PVEUgPSAxLFxuICBSRUNPTU1FTkRfU0VSVkVSID0gMixcbiAgQ09OVEFDVF9MSVNUID0gMyxcbiAgRU5DUllQVEVEX0RJUkVDVF9NRVNTQUdFID0gNCxcbiAgREVMRVRFID0gNSxcbiAgUkVQT1NUID0gNixcbiAgUkVBQ1RJT04gPSA3LFxuICBCQURHRV9BV0FSRCA9IDgsXG4gIENIQU5ORUxfQ1JFQVRFID0gNDAsXG4gIENIQU5ORUxfTUVUQURBVEEgPSA0MSxcbiAgQ0hBTk5FTF9NRVNTQUdFID0gNDIsXG4gIENIQU5ORUxfSElERV9NRVNTQUdFID0gNDMsXG4gIENIQU5ORUxfTVVURV9VU0VSID0gNDQsXG4gIENIQU5ORUxfUkVTRVJWRSA9IDQ1LFxuICBSRVBPUlRJTkcgPSAxOTg0LFxuICBaQVBfUkVRVUVTVCA9IDk3MzQsXG4gIFpBUCA9IDk3MzUsXG4gIE1VVEVfTElTVCA9IDEwMDAwLFxuICBQSU5fTElTVCA9IDEwMDAxLFxuICBSRUxBWV9MSVNUX01FVEFEQVRBID0gMTAwMDIsXG4gIENMSUVOVF9BVVRIID0gMjIyNDIsXG4gIEFVVEhfUkVTUE9OU0UgPSAyMjI0MyxcbiAgTk9TVFJfQ09OTkVDVCA9IDI0MTMzLFxuICBDQVRFR09SSVpFRF9QRU9QTEUgPSAzMDAwMCxcbiAgQ0FURUdPUklaRURfQk9PS01BUktTID0gMzAwMDEsXG4gIFBST0ZJTEVfQkFER0VTID0gMzAwMDgsXG4gIEJBREdFX0RFRklOSVRJT04gPSAzMDAwOSxcbiAgTE9OR19GT1JNID0gMzAwMjMsXG4gIEFQUExJQ0FUSU9OX1NQRUNJRklDID0gMzAwNzhcbn1cblxuLyoqXG4gKiBSZS1leHBvcnQgYWxsIHR5cGVzIGZyb20gYmFzZSBtb2R1bGVcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICovXG5leHBvcnQgKiBmcm9tICcuL2Jhc2UnO1xuXG4vKiogUmUtZXhwb3J0IHByb3RvY29sIHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL3Byb3RvY29sJztcblxuLyoqIFJlLWV4cG9ydCBtZXNzYWdlIHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL21lc3NhZ2VzJztcblxuLyoqIFJlLWV4cG9ydCB0eXBlIGd1YXJkcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9ndWFyZHMnO1xuXG4vLyBSZS1leHBvcnQgTklQLTE5IHR5cGVzXG5leHBvcnQgdHlwZSB7XG4gIE5pcDE5RGF0YVR5cGVcbn0gZnJvbSAnLi4vbmlwcy9uaXAtMTknO1xuXG4vKiogUmUtZXhwb3J0IE5JUC00NiB0eXBlcyAqL1xuZXhwb3J0ICogZnJvbSAnLi9uaXA0Nic7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL2Jhc2VcbiAqIEBkZXNjcmlwdGlvbiBDb3JlIHR5cGUgZGVmaW5pdGlvbnMgZm9yIE5vc3RyIHByb3RvY29sXG4gKi9cblxuLy8gS2V5IFR5cGVzXG5leHBvcnQgdHlwZSBQdWJsaWNLZXlIZXggPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBQcml2YXRlS2V5SGV4ID0gc3RyaW5nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleURldGFpbHMge1xuICAvKiogUHVibGljIGtleSBpbiBoZXggZm9ybWF0ICovXG4gIGhleDogc3RyaW5nO1xuICAvKiogTklQLTA1IGlkZW50aWZpZXIgKi9cbiAgbmlwMDU6IHN0cmluZztcbiAgLyoqIFB1YmxpYyBrZXkgaW4gYnl0ZXMgZm9ybWF0ICovXG4gIGJ5dGVzOiBVaW50OEFycmF5O1xufVxuXG5leHBvcnQgdHlwZSBQdWJsaWNLZXkgPSBQdWJsaWNLZXlIZXggfCBQdWJsaWNLZXlEZXRhaWxzO1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleVBhaXIge1xuICAvKiogUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdCAqL1xuICBwcml2YXRlS2V5OiBQcml2YXRlS2V5SGV4O1xuICAvKiogUHVibGljIGtleSBkZXRhaWxzICovXG4gIHB1YmxpY0tleTogUHVibGljS2V5RGV0YWlscztcbn1cblxuLy8gRXZlbnQgVHlwZXNcbmV4cG9ydCBlbnVtIE5vc3RyRXZlbnRLaW5kIHtcbiAgLy8gTklQLTAxOiBDb3JlIFByb3RvY29sXG4gIFNFVF9NRVRBREFUQSA9IDAsXG4gIFRFWFRfTk9URSA9IDEsXG4gIFJFQ09NTUVORF9TRVJWRVIgPSAyLFxuICBDT05UQUNUUyA9IDMsXG4gIEVOQ1JZUFRFRF9ESVJFQ1RfTUVTU0FHRSA9IDQsXG4gIEVWRU5UX0RFTEVUSU9OID0gNSxcbiAgUkVQT1NUID0gNixcbiAgUkVBQ1RJT04gPSA3LFxuXG4gIC8vIE5JUC0yODogUHVibGljIENoYXRcbiAgQ0hBTk5FTF9DUkVBVElPTiA9IDQwLFxuICBDSEFOTkVMX01FVEFEQVRBID0gNDEsXG4gIENIQU5ORUxfTUVTU0FHRSA9IDQyLFxuICBDSEFOTkVMX0hJREVfTUVTU0FHRSA9IDQzLFxuICBDSEFOTkVMX01VVEVfVVNFUiA9IDQ0LFxuXG4gIC8vIE5JUC00MjogQXV0aGVudGljYXRpb25cbiAgQVVUSCA9IDIyMjQyLFxuICBBVVRIX1JFU1BPTlNFID0gMjIyNDNcbn1cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgTm9zdHIgZXZlbnRzICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VOb3N0ckV2ZW50IHtcbiAgLyoqIEV2ZW50IGtpbmQgYXMgZGVmaW5lZCBpbiBOSVBzICovXG4gIGtpbmQ6IG51bWJlcjtcbiAgLyoqIENvbnRlbnQgb2YgdGhlIGV2ZW50ICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgLyoqIEFycmF5IG9mIHRhZ3MgKi9cbiAgdGFnczogc3RyaW5nW11bXTtcbiAgLyoqIFVuaXggdGltZXN0YW1wIGluIHNlY29uZHMgKi9cbiAgY3JlYXRlZF9hdDogbnVtYmVyO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBldmVudHMgdGhhdCBoYXZlbid0IGJlZW4gc2lnbmVkIHlldCAqL1xuZXhwb3J0IGludGVyZmFjZSBVbnNpZ25lZE5vc3RyRXZlbnQgZXh0ZW5kcyBCYXNlTm9zdHJFdmVudCB7XG4gIC8qKiBPcHRpb25hbCBwdWJsaWMga2V5ICovXG4gIHB1YmtleT86IHN0cmluZztcbn1cblxuLyoqIEludGVyZmFjZSBmb3Igc2lnbmVkIGV2ZW50cyAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduZWROb3N0ckV2ZW50IGV4dGVuZHMgQmFzZU5vc3RyRXZlbnQge1xuICAvKiogUHVibGljIGtleSBvZiB0aGUgZXZlbnQgY3JlYXRvciAqL1xuICBwdWJrZXk6IHN0cmluZztcbiAgLyoqIEV2ZW50IElEIChzaGEyNTYgb2YgdGhlIHNlcmlhbGl6ZWQgZXZlbnQpICovXG4gIGlkOiBzdHJpbmc7XG4gIC8qKiBTY2hub3JyIHNpZ25hdHVyZSBvZiB0aGUgZXZlbnQgSUQgKi9cbiAgc2lnOiBzdHJpbmc7XG59XG5cbi8qKiBBbGlhcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAqL1xuZXhwb3J0IHR5cGUgTm9zdHJFdmVudCA9IFNpZ25lZE5vc3RyRXZlbnQ7XG5cbi8qKiBUeXBlIGZvciBjcmVhdGluZyBuZXcgZXZlbnRzICovXG5leHBvcnQgdHlwZSBVbnNpZ25lZEV2ZW50ID0gT21pdDxOb3N0ckV2ZW50LCAnaWQnIHwgJ3NpZyc+O1xuXG4vLyBGaWx0ZXIgVHlwZXNcbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJGaWx0ZXIge1xuICBpZHM/OiBzdHJpbmdbXTtcbiAgYXV0aG9ycz86IHN0cmluZ1tdO1xuICBraW5kcz86IE5vc3RyRXZlbnRLaW5kW107XG4gIHNpbmNlPzogbnVtYmVyO1xuICB1bnRpbD86IG51bWJlcjtcbiAgbGltaXQ/OiBudW1iZXI7XG4gICcjZSc/OiBzdHJpbmdbXTtcbiAgJyNwJz86IHN0cmluZ1tdO1xuICBzZWFyY2g/OiBzdHJpbmc7XG4gIC8qKiBTdXBwb3J0IGZvciBhcmJpdHJhcnkgdGFncyAoTklQLTEyKSAqL1xuICBba2V5OiBgIyR7c3RyaW5nfWBdOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0clN1YnNjcmlwdGlvbiB7XG4gIGlkOiBzdHJpbmc7XG4gIGZpbHRlcnM6IE5vc3RyRmlsdGVyW107XG59XG5cbi8vIE1lc3NhZ2UgVHlwZXNcbmV4cG9ydCBlbnVtIE5vc3RyTWVzc2FnZVR5cGUge1xuICBFVkVOVCA9ICdFVkVOVCcsXG4gIE5PVElDRSA9ICdOT1RJQ0UnLFxuICBPSyA9ICdPSycsXG4gIEVPU0UgPSAnRU9TRScsXG4gIFJFUSA9ICdSRVEnLFxuICBDTE9TRSA9ICdDTE9TRScsXG4gIEFVVEggPSAnQVVUSCdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ck1lc3NhZ2Uge1xuICB0eXBlOiBOb3N0ck1lc3NhZ2VUeXBlO1xuICBldmVudD86IFNpZ25lZE5vc3RyRXZlbnQ7XG4gIHN1YnNjcmlwdGlvbklkPzogc3RyaW5nO1xuICBmaWx0ZXJzPzogTm9zdHJGaWx0ZXJbXTtcbiAgZXZlbnRJZD86IHN0cmluZztcbiAgYWNjZXB0ZWQ/OiBib29sZWFuO1xuICBtZXNzYWdlPzogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbiAgcGF5bG9hZD86IHN0cmluZyB8IChzdHJpbmcgfCBib29sZWFuKVtdOyAgXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9zdHJSZXNwb25zZSB7XG4gIHR5cGU6IE5vc3RyTWVzc2FnZVR5cGU7XG4gIGV2ZW50PzogU2lnbmVkTm9zdHJFdmVudDtcbiAgc3Vic2NyaXB0aW9uSWQ/OiBzdHJpbmc7XG4gIGZpbHRlcnM/OiBOb3N0ckZpbHRlcltdO1xuICBldmVudElkPzogc3RyaW5nO1xuICBhY2NlcHRlZD86IGJvb2xlYW47XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIGNvdW50PzogbnVtYmVyO1xufVxuXG4vLyBVdGlsaXR5IFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0ckVycm9yIHtcbiAgY29kZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGRldGFpbHM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvcHJvdG9jb2xcbiAqIEBkZXNjcmlwdGlvbiBOb3N0ciBwcm90b2NvbCB0eXBlc1xuICovXG5cbmltcG9ydCB0eXBlIHsgXG4gIE5vc3RyRmlsdGVyLCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgTm9zdHJSZXNwb25zZSxcbiAgTm9zdHJFcnJvclxufSBmcm9tICcuL2Jhc2UuanMnO1xuXG4vLyBSZS1leHBvcnQgdHlwZXMgZnJvbSBiYXNlIHRoYXQgYXJlIHVzZWQgaW4gdGhpcyBtb2R1bGVcbmV4cG9ydCB0eXBlIHsgXG4gIE5vc3RyRmlsdGVyLCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlLFxuICBOb3N0clN1YnNjcmlwdGlvbixcbiAgTm9zdHJSZXNwb25zZSxcbiAgTm9zdHJFcnJvclxufTtcbiIsICJleHBvcnQge307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXNzYWdlcy5qcy5tYXAiLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzL2d1YXJkc1xuICogQGRlc2NyaXB0aW9uIFR5cGUgZ3VhcmQgZnVuY3Rpb25zIGZvciBOb3N0ciB0eXBlc1xuICovXG5cbmltcG9ydCB7IE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQsIE5vc3RyRmlsdGVyLCBOb3N0clN1YnNjcmlwdGlvbiwgTm9zdHJSZXNwb25zZSwgTm9zdHJFcnJvciB9IGZyb20gJy4vYmFzZSc7XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJFdmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0ckV2ZW50KGV2ZW50OiB1bmtub3duKTogZXZlbnQgaXMgTm9zdHJFdmVudCB7XG4gIGlmICh0eXBlb2YgZXZlbnQgIT09ICdvYmplY3QnIHx8IGV2ZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRFdmVudCA9IGV2ZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8vIFJlcXVpcmVkIGZpZWxkc1xuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQua2luZCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsaWRFdmVudC5raW5kKSB8fCB2YWxpZEV2ZW50LmtpbmQgPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbGlkRXZlbnQuY3JlYXRlZF9hdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBwdWJrZXkgc3RydWN0dXJlXG4gIGlmICh2YWxpZEV2ZW50LnB1YmtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiB2YWxpZEV2ZW50LnB1YmtleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmICghdmFsaWRFdmVudC5wdWJrZXkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbGlkRXZlbnQucHVia2V5ID09PSAnb2JqZWN0JyAmJiB2YWxpZEV2ZW50LnB1YmtleSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgcHVia2V5ID0gdmFsaWRFdmVudC5wdWJrZXkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBpZiAodHlwZW9mIHB1YmtleS5oZXggIT09ICdzdHJpbmcnIHx8ICFwdWJrZXkuaGV4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIHRhZ3MgYXJyYXlcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbGlkRXZlbnQudGFncykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayB0YWcgYXJyYXkgZWxlbWVudHNcbiAgaWYgKCF2YWxpZEV2ZW50LnRhZ3MuZXZlcnkodGFnID0+IEFycmF5LmlzQXJyYXkodGFnKSAmJiB0YWcuZXZlcnkoaXRlbSA9PiB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIFNpZ25lZE5vc3RyRXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2lnbmVkTm9zdHJFdmVudChldmVudDogdW5rbm93bik6IGV2ZW50IGlzIFNpZ25lZE5vc3RyRXZlbnQge1xuICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBzaWduZWRFdmVudCA9IGV2ZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkcyBmcm9tIE5vc3RyRXZlbnRcbiAgaWYgKCFpc05vc3RyRXZlbnQoZXZlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgcHVia2V5IGlzIHByZXNlbnQgYW5kIHZhbGlkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQucHVia2V5ID09PSAnc3RyaW5nJykge1xuICAgIGlmICghc2lnbmVkRXZlbnQucHVia2V5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5wdWJrZXkgPT09ICdvYmplY3QnICYmIHNpZ25lZEV2ZW50LnB1YmtleSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHB1YmtleSA9IHNpZ25lZEV2ZW50LnB1YmtleSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBpZiAodHlwZW9mIHB1YmtleS5oZXggIT09ICdzdHJpbmcnIHx8ICFwdWJrZXkuaGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlkIGZpZWxkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQuaWQgIT09ICdzdHJpbmcnIHx8ICFzaWduZWRFdmVudC5pZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHNpZyBmaWVsZFxuICBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LnNpZyAhPT0gJ3N0cmluZycgfHwgIXNpZ25lZEV2ZW50LnNpZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRmlsdGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyRmlsdGVyKGZpbHRlcjogdW5rbm93bik6IGZpbHRlciBpcyBOb3N0ckZpbHRlciB7XG4gIGlmICh0eXBlb2YgZmlsdGVyICE9PSAnb2JqZWN0JyB8fCBmaWx0ZXIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZEZpbHRlciA9IGZpbHRlciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgY29uc3QgdmFsaWRLZXlzID0gWydpZHMnLCAnYXV0aG9ycycsICdraW5kcycsICdzaW5jZScsICd1bnRpbCcsICdsaW1pdCcsICcjZScsICcjcCcsICcjdCddO1xuICBjb25zdCBmaWx0ZXJLZXlzID0gT2JqZWN0LmtleXModmFsaWRGaWx0ZXIpO1xuXG4gIC8vIENoZWNrIGlmIGFsbCBrZXlzIGluIHRoZSBmaWx0ZXIgYXJlIHZhbGlkXG4gIGlmICghZmlsdGVyS2V5cy5ldmVyeShrZXkgPT4gdmFsaWRLZXlzLmluY2x1ZGVzKGtleSkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgYXJyYXkgZmllbGRzXG4gIGlmICh2YWxpZEZpbHRlci5pZHMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIuaWRzKSB8fCAhdmFsaWRGaWx0ZXIuaWRzLmV2ZXJ5KGlkID0+IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXIuYXV0aG9ycyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5hdXRob3JzKSB8fCAhdmFsaWRGaWx0ZXIuYXV0aG9ycy5ldmVyeShhdXRob3IgPT4gdHlwZW9mIGF1dGhvciA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXIua2luZHMgIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXIua2luZHMpIHx8ICF2YWxpZEZpbHRlci5raW5kcy5ldmVyeShraW5kID0+IHR5cGVvZiBraW5kID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpICYmIGtpbmQgPj0gMCkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlclsnI2UnXSAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlclsnI2UnXSkgfHwgIXZhbGlkRmlsdGVyWycjZSddLmV2ZXJ5KGUgPT4gdHlwZW9mIGUgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyWycjcCddICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyWycjcCddKSB8fCAhdmFsaWRGaWx0ZXJbJyNwJ10uZXZlcnkocCA9PiB0eXBlb2YgcCA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXJbJyN0J10gIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXJbJyN0J10pIHx8ICF2YWxpZEZpbHRlclsnI3QnXS5ldmVyeSh0ID0+IHR5cGVvZiB0ID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgbnVtYmVyIGZpZWxkc1xuICBpZiAodmFsaWRGaWx0ZXIuc2luY2UgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRGaWx0ZXIuc2luY2UgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gIGlmICh2YWxpZEZpbHRlci51bnRpbCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZEZpbHRlci51bnRpbCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkRmlsdGVyLmxpbWl0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkRmlsdGVyLmxpbWl0ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyU3Vic2NyaXB0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyU3Vic2NyaXB0aW9uKHN1YjogdW5rbm93bik6IHN1YiBpcyBOb3N0clN1YnNjcmlwdGlvbiB7XG4gIGlmICh0eXBlb2Ygc3ViICE9PSAnb2JqZWN0JyB8fCBzdWIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZFN1YiA9IHN1YiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAodHlwZW9mIHZhbGlkU3ViLmlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWxpZFN1Yi5maWx0ZXJzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghdmFsaWRTdWIuZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4gaXNOb3N0ckZpbHRlcihmaWx0ZXIpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyUmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJSZXNwb25zZShyZXNwb25zZTogdW5rbm93bik6IHJlc3BvbnNlIGlzIE5vc3RyUmVzcG9uc2Uge1xuICBpZiAodHlwZW9mIHJlc3BvbnNlICE9PSAnb2JqZWN0JyB8fCByZXNwb25zZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkUmVzcG9uc2UgPSByZXNwb25zZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAodHlwZW9mIHZhbGlkUmVzcG9uc2UudHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmFsaWRSZXNwb25zZS5zdWJzY3JpcHRpb25JZCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZFJlc3BvbnNlLnN1YnNjcmlwdGlvbklkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLmV2ZW50ICE9PSB1bmRlZmluZWQgJiYgIWlzU2lnbmVkTm9zdHJFdmVudCh2YWxpZFJlc3BvbnNlLmV2ZW50KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRSZXNwb25zZS5tZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFR5cGUgZ3VhcmQgZm9yIE5vc3RyRXJyb3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIE5vc3RyRXJyb3Ige1xuICBpZiAodHlwZW9mIGVycm9yICE9PSAnb2JqZWN0JyB8fCBlcnJvciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkRXJyb3IgPSBlcnJvciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWxpZEVycm9yLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIHZhbGlkRXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZydcbiAgKTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvbmlwNDZcbiAqIEBkZXNjcmlwdGlvbiBUeXBlIGRlZmluaXRpb25zIGZvciBOSVAtNDYgKE5vc3RyIENvbm5lY3QgLyBSZW1vdGUgU2lnbmluZylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDYubWRcbiAqL1xuXG4vKipcbiAqIE5JUC00NiByZW1vdGUgc2lnbmluZyBtZXRob2RzXG4gKi9cbmV4cG9ydCBlbnVtIE5pcDQ2TWV0aG9kIHtcbiAgQ09OTkVDVCA9ICdjb25uZWN0JyxcbiAgUElORyA9ICdwaW5nJyxcbiAgR0VUX1BVQkxJQ19LRVkgPSAnZ2V0X3B1YmxpY19rZXknLFxuICBTSUdOX0VWRU5UID0gJ3NpZ25fZXZlbnQnLFxuICBOSVAwNF9FTkNSWVBUID0gJ25pcDA0X2VuY3J5cHQnLFxuICBOSVAwNF9ERUNSWVBUID0gJ25pcDA0X2RlY3J5cHQnLFxuICBOSVA0NF9FTkNSWVBUID0gJ25pcDQ0X2VuY3J5cHQnLFxuICBOSVA0NF9ERUNSWVBUID0gJ25pcDQ0X2RlY3J5cHQnLFxuICBHRVRfUkVMQVlTID0gJ2dldF9yZWxheXMnLFxufVxuXG4vKipcbiAqIFBhcnNlZCBidW5rZXI6Ly8gVVJJXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVua2VyVVJJIHtcbiAgLyoqIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpICovXG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xuICAvKiogUmVsYXkgVVJMcyBmb3IgY29tbXVuaWNhdGlvbiAqL1xuICByZWxheXM6IHN0cmluZ1tdO1xuICAvKiogT3B0aW9uYWwgc2VjcmV0IGZvciBpbml0aWFsIGNvbm5lY3Rpb24gKi9cbiAgc2VjcmV0Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5JUC00NiBKU09OLVJQQyByZXF1ZXN0IChjbGllbnQgLT4gc2lnbmVyKVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2UmVxdWVzdCB7XG4gIGlkOiBzdHJpbmc7XG4gIG1ldGhvZDogTmlwNDZNZXRob2QgfCBzdHJpbmc7XG4gIHBhcmFtczogc3RyaW5nW107XG59XG5cbi8qKlxuICogTklQLTQ2IEpTT04tUlBDIHJlc3BvbnNlIChzaWduZXIgLT4gY2xpZW50KVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2UmVzcG9uc2Uge1xuICBpZDogc3RyaW5nO1xuICByZXN1bHQ/OiBzdHJpbmc7XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgTklQLTQ2IHNlc3Npb24gY29udGFpbmluZyB0aGUgZXBoZW1lcmFsIGtleXBhaXIgYW5kIGNvbnZlcnNhdGlvbiBrZXlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlNlc3Npb24ge1xuICAvKiogQ2xpZW50J3MgZXBoZW1lcmFsIHByaXZhdGUga2V5IChoZXgpICovXG4gIGNsaWVudFNlY3JldEtleTogc3RyaW5nO1xuICAvKiogQ2xpZW50J3MgZXBoZW1lcmFsIHB1YmxpYyBrZXkgKGhleCkgKi9cbiAgY2xpZW50UHVia2V5OiBzdHJpbmc7XG4gIC8qKiBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KSAqL1xuICByZW1vdGVQdWJrZXk6IHN0cmluZztcbiAgLyoqIE5JUC00NCBjb252ZXJzYXRpb24ga2V5IChkZXJpdmVkIGZyb20gRUNESCkgKi9cbiAgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5O1xufVxuXG4vKipcbiAqIFB1YmxpYyBzZXNzaW9uIGluZm8gKHNhZmUgdG8gZXhwb3NlOyBleGNsdWRlcyBwcml2YXRlIGtleSBhbmQgY29udmVyc2F0aW9uIGtleSlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOaXA0NlNlc3Npb25JbmZvIHtcbiAgY2xpZW50UHVia2V5OiBzdHJpbmc7XG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiB2YWxpZGF0aW5nIGEgYnVua2VyOi8vIFVSSVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1bmtlclZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbiAgdXJpPzogQnVua2VyVVJJO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBjcnlwdG9cbiAqIEBkZXNjcmlwdGlvbiBDcnlwdG9ncmFwaGljIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqIFxuICogSU1QT1JUQU5UOiBOb3N0ciBQcm90b2NvbCBDcnlwdG9ncmFwaGljIFJlcXVpcmVtZW50c1xuICogV2hpbGUgc2VjcDI1NmsxIGlzIHRoZSB1bmRlcmx5aW5nIGVsbGlwdGljIGN1cnZlIHVzZWQgYnkgTm9zdHIsIHRoZSBwcm90b2NvbCBzcGVjaWZpY2FsbHlcbiAqIHJlcXVpcmVzIHNjaG5vcnIgc2lnbmF0dXJlcyBhcyBkZWZpbmVkIGluIE5JUC0wMS4gVGhpcyBtZWFuczpcbiAqIFxuICogMS4gQWx3YXlzIHVzZSBzY2hub3JyLXNwZWNpZmljIGZ1bmN0aW9uczpcbiAqICAgIC0gc2Nobm9yci5nZXRQdWJsaWNLZXkoKSBmb3IgcHVibGljIGtleSBnZW5lcmF0aW9uXG4gKiAgICAtIHNjaG5vcnIuc2lnbigpIGZvciBzaWduaW5nXG4gKiAgICAtIHNjaG5vcnIudmVyaWZ5KCkgZm9yIHZlcmlmaWNhdGlvblxuICogXG4gKiAyLiBBdm9pZCB1c2luZyBzZWNwMjU2azEgZnVuY3Rpb25zIGRpcmVjdGx5OlxuICogICAgLSBET04nVCB1c2Ugc2VjcDI1NmsxLmdldFB1YmxpY0tleSgpXG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEuc2lnbigpXG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEudmVyaWZ5KClcbiAqIFxuICogV2hpbGUgYm90aCBtaWdodCB3b3JrIGluIHNvbWUgY2FzZXMgKGFzIHRoZXkgdXNlIHRoZSBzYW1lIGN1cnZlKSwgdGhlIHNjaG5vcnIgc2lnbmF0dXJlXG4gKiBzY2hlbWUgaGFzIHNwZWNpZmljIHJlcXVpcmVtZW50cyBmb3Iga2V5IGFuZCBzaWduYXR1cmUgZm9ybWF0cyB0aGF0IGFyZW4ndCBndWFyYW50ZWVkXG4gKiB3aGVuIHVzaW5nIHRoZSBsb3dlci1sZXZlbCBzZWNwMjU2azEgZnVuY3Rpb25zIGRpcmVjdGx5LlxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIsIHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgS2V5UGFpciwgUHVibGljS2V5RGV0YWlscywgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCwgUHVibGljS2V5IH0gZnJvbSAnLi90eXBlcy9pbmRleCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBieXRlc1RvQmFzZTY0LCBiYXNlNjRUb0J5dGVzIH0gZnJvbSAnLi9lbmNvZGluZy9iYXNlNjQnO1xuXG5cbi8qKlxuICogQ3VzdG9tIGNyeXB0byBpbnRlcmZhY2UgZm9yIGNyb3NzLXBsYXRmb3JtIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDcnlwdG9TdWJ0bGUge1xuICBzdWJ0bGU6IHtcbiAgICBnZW5lcmF0ZUtleShcbiAgICAgIGFsZ29yaXRobTogUnNhSGFzaGVkS2V5R2VuUGFyYW1zIHwgRWNLZXlHZW5QYXJhbXMsXG4gICAgICBleHRyYWN0YWJsZTogYm9vbGVhbixcbiAgICAgIGtleVVzYWdlczogcmVhZG9ubHkgS2V5VXNhZ2VbXVxuICAgICk6IFByb21pc2U8Q3J5cHRvS2V5UGFpcj47XG4gICAgaW1wb3J0S2V5KFxuICAgICAgZm9ybWF0OiAncmF3JyB8ICdwa2NzOCcgfCAnc3BraScsXG4gICAgICBrZXlEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICAgIGFsZ29yaXRobTogUnNhSGFzaGVkSW1wb3J0UGFyYW1zIHwgRWNLZXlJbXBvcnRQYXJhbXMgfCBBZXNLZXlBbGdvcml0aG0sXG4gICAgICBleHRyYWN0YWJsZTogYm9vbGVhbixcbiAgICAgIGtleVVzYWdlczogcmVhZG9ubHkgS2V5VXNhZ2VbXVxuICAgICk6IFByb21pc2U8Q3J5cHRvS2V5PjtcbiAgICBlbmNyeXB0KFxuICAgICAgYWxnb3JpdGhtOiB7IG5hbWU6IHN0cmluZzsgaXY6IFVpbnQ4QXJyYXkgfSxcbiAgICAgIGtleTogQ3J5cHRvS2V5LFxuICAgICAgZGF0YTogQXJyYXlCdWZmZXJcbiAgICApOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgICBkZWNyeXB0KFxuICAgICAgYWxnb3JpdGhtOiB7IG5hbWU6IHN0cmluZzsgaXY6IFVpbnQ4QXJyYXkgfSxcbiAgICAgIGtleTogQ3J5cHRvS2V5LFxuICAgICAgZGF0YTogQXJyYXlCdWZmZXJcbiAgICApOiBQcm9taXNlPEFycmF5QnVmZmVyPjtcbiAgfTtcbiAgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFQ7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbiAgaW50ZXJmYWNlIEdsb2JhbCB7XG4gICAgY3J5cHRvOiBDcnlwdG9TdWJ0bGU7XG4gIH1cbn1cblxuLy8gR2V0IHRoZSBhcHByb3ByaWF0ZSBjcnlwdG8gaW1wbGVtZW50YXRpb25cbmNvbnN0IGdldENyeXB0byA9IGFzeW5jICgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4gPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuICAgIHJldHVybiB3aW5kb3cuY3J5cHRvO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvKSB7XG4gICAgcmV0dXJuIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG87XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBjcnlwdG9Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ2NyeXB0bycpO1xuICAgIGlmIChjcnlwdG9Nb2R1bGUud2ViY3J5cHRvKSB7XG4gICAgICByZXR1cm4gY3J5cHRvTW9kdWxlLndlYmNyeXB0byBhcyBDcnlwdG9TdWJ0bGU7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBsb2dnZXIuZGVidWcoJ05vZGUgY3J5cHRvIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gV2ViQ3J5cHRvIGltcGxlbWVudGF0aW9uIGF2YWlsYWJsZScpO1xufTtcblxuLyoqXG4gKiBDcnlwdG8gaW1wbGVtZW50YXRpb24gdGhhdCB3b3JrcyBpbiBib3RoIE5vZGUuanMgYW5kIGJyb3dzZXIgZW52aXJvbm1lbnRzXG4gKi9cbmNsYXNzIEN1c3RvbUNyeXB0byB7XG4gIHByaXZhdGUgY3J5cHRvSW5zdGFuY2U6IENyeXB0b1N1YnRsZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFByb21pc2UgPSB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNyeXB0b0luc3RhbmNlID0gYXdhaXQgZ2V0Q3J5cHRvKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGVuc3VyZUluaXRpYWxpemVkKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiB7XG4gICAgYXdhaXQgdGhpcy5pbml0UHJvbWlzZTtcbiAgICBpZiAoIXRoaXMuY3J5cHRvSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ3J5cHRvIGltcGxlbWVudGF0aW9uIG5vdCBpbml0aWFsaXplZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcnlwdG9JbnN0YW5jZTtcbiAgfVxuXG4gIGFzeW5jIGdldFN1YnRsZSgpOiBQcm9taXNlPENyeXB0b1N1YnRsZVsnc3VidGxlJ10+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGU7XG4gIH1cblxuICBhc3luYyBnZXRSYW5kb21WYWx1ZXM8VCBleHRlbmRzIFVpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk+KGFycmF5OiBUKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcbiAgfVxufVxuXG4vLyBDcmVhdGUgYW5kIGV4cG9ydCBkZWZhdWx0IGluc3RhbmNlXG5leHBvcnQgY29uc3QgY3VzdG9tQ3J5cHRvID0gbmV3IEN1c3RvbUNyeXB0bygpO1xuXG4vLyBFeHBvcnQgc2Nobm9yciBmdW5jdGlvbnNcbmV4cG9ydCBjb25zdCBzaWduU2Nobm9yciA9IHNjaG5vcnIuc2lnbjtcbmV4cG9ydCBjb25zdCB2ZXJpZnlTY2hub3JyU2lnbmF0dXJlID0gc2Nobm9yci52ZXJpZnk7XG5cbi8qKlxuICogR2V0cyB0aGUgY29tcHJlc3NlZCBwdWJsaWMga2V5ICgzMyBieXRlcyB3aXRoIHByZWZpeClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXByZXNzZWRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzZWNwMjU2azEuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgc2Nobm9yciBwdWJsaWMga2V5ICgzMiBieXRlcyB4LWNvb3JkaW5hdGUpIGFzIHBlciBCSVAzNDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNjaG5vcnJQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG5ldyBrZXkgcGFpclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVLZXlQYWlyKCk6IFByb21pc2U8S2V5UGFpcj4ge1xuICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSByYW5kb21CeXRlcygzMik7XG4gIGNvbnN0IHByaXZhdGVLZXkgPSBieXRlc1RvSGV4KHByaXZhdGVLZXlCeXRlcyk7XG4gIHByaXZhdGVLZXlCeXRlcy5maWxsKDApOyAvLyB6ZXJvIHNvdXJjZSBtYXRlcmlhbFxuICBjb25zdCBwdWJsaWNLZXkgPSBhd2FpdCBnZXRQdWJsaWNLZXkocHJpdmF0ZUtleSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwcml2YXRlS2V5LFxuICAgIHB1YmxpY0tleVxuICB9O1xufVxuXG4vKipcbiAqIEdldHMgYSBwdWJsaWMga2V5IGZyb20gYSBwcml2YXRlIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVibGljS2V5KHByaXZhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8UHVibGljS2V5RGV0YWlscz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMocHJpdmF0ZUtleSk7XG4gICAgY29uc3QgcHVibGljS2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXMpO1xuICAgIHJldHVybiB7XG4gICAgICBoZXg6IGJ5dGVzVG9IZXgocHVibGljS2V5Qnl0ZXMpLFxuICAgICAgYnl0ZXM6IHB1YmxpY0tleUJ5dGVzXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBwdWJsaWMga2V5Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBrZXkgcGFpclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVLZXlQYWlyKGtleVBhaXI6IEtleVBhaXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkZXJpdmVkUHViS2V5ID0gYXdhaXQgZ2V0UHVibGljS2V5KGtleVBhaXIucHJpdmF0ZUtleSk7XG4gICAgcmV0dXJuIGRlcml2ZWRQdWJLZXkuaGV4ID09PSBrZXlQYWlyLnB1YmxpY0tleS5oZXg7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBrZXkgcGFpcicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KGV2ZW50OiBQYXJ0aWFsPE5vc3RyRXZlbnQ+KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXZlbnQsXG4gICAgY3JlYXRlZF9hdDogZXZlbnQuY3JlYXRlZF9hdCB8fCB0aW1lc3RhbXAsXG4gICAgdGFnczogZXZlbnQudGFncyB8fCBbXSxcbiAgICBjb250ZW50OiBldmVudC5jb250ZW50IHx8ICcnLFxuICAgIGtpbmQ6IGV2ZW50LmtpbmQgfHwgMVxuICB9IGFzIE5vc3RyRXZlbnQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcHJpdmF0ZSBrZXkgdG8gaGV4IHN0cmluZyAoYWNjZXB0cyBib3RoIGhleCBzdHJpbmcgYW5kIFVpbnQ4QXJyYXkpXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVByaXZhdGVLZXkocHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGlmIChwcml2YXRlS2V5IGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBieXRlc1RvSGV4KHByaXZhdGVLZXkpO1xuICB9XG4gIHJldHVybiBwcml2YXRlS2V5O1xufVxuXG4vKipcbiAqIFNpZ25zIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBzaWduXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGFzIGhleCBzdHJpbmcgb3IgVWludDhBcnJheVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2lnbkV2ZW50KGV2ZW50OiBOb3N0ckV2ZW50LCBwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJpdmF0ZUtleUhleCA9IG5vcm1hbGl6ZVByaXZhdGVLZXkocHJpdmF0ZUtleSk7XG5cbiAgICAvLyBTZXJpYWxpemUgZXZlbnQgZm9yIHNpZ25pbmcgKE5JUC0wMSBmb3JtYXQpXG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBldmVudC5wdWJrZXksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG5cbiAgICAvLyBDYWxjdWxhdGUgZXZlbnQgaGFzaFxuICAgIGNvbnN0IGV2ZW50SGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuXG4gICAgLy8gQ29udmVydCBwcml2YXRlIGtleSB0byBieXRlcyBhbmQgc2lnblxuICAgIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMocHJpdmF0ZUtleUhleCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBzY2hub3JyLnNpZ24oZXZlbnRIYXNoLCBwcml2YXRlS2V5Qnl0ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIHNpZ25lZCBldmVudFxuICAgIHJldHVybiB7XG4gICAgICAuLi5ldmVudCxcbiAgICAgIGlkOiBieXRlc1RvSGV4KGV2ZW50SGFzaCksXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnbmF0dXJlQnl0ZXMpXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHNpZ24gZXZlbnQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgYSBwdWJsaWMga2V5IGhleCBzdHJpbmcgZnJvbSBhIHByaXZhdGUga2V5IChzeW5jaHJvbm91cylcbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgYXMgaGV4IHN0cmluZyBvciBVaW50OEFycmF5XG4gKiBAcmV0dXJucyBIZXgtZW5jb2RlZCBwdWJsaWMga2V5ICgzMi1ieXRlIHgtb25seSBzY2hub3JyIGtleSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0tleVN5bmMocHJpdmF0ZUtleTogc3RyaW5nIHwgVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IHByaXZhdGVLZXkgaW5zdGFuY2VvZiBVaW50OEFycmF5XG4gICAgPyBwcml2YXRlS2V5XG4gICAgOiBoZXhUb0J5dGVzKHByaXZhdGVLZXkpO1xuICBjb25zdCBwdWJsaWNLZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG4gIHJldHVybiBieXRlc1RvSGV4KHB1YmxpY0tleUJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzLCBoYXNoZXMsIGFuZCBzaWducyBhIE5vc3RyIGV2ZW50IGluIG9uZSBzdGVwXG4gKiBAcGFyYW0gZXZlbnQgLSBQYXJ0aWFsIGV2ZW50IChraW5kLCBjb250ZW50LCB0YWdzIHJlcXVpcmVkOyBwdWJrZXkgZGVyaXZlZCBpZiBtaXNzaW5nKVxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBhcyBoZXggc3RyaW5nIG9yIFVpbnQ4QXJyYXlcbiAqIEByZXR1cm5zIEZ1bGx5IHNpZ25lZCBldmVudCB3aXRoIGlkLCBwdWJrZXksIGFuZCBzaWdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmFsaXplRXZlbnQoXG4gIGV2ZW50OiBQYXJ0aWFsPE5vc3RyRXZlbnQ+LFxuICBwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5XG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgY29uc3QgcHVia2V5ID0gZXZlbnQucHVia2V5IHx8IGdldFB1YmxpY0tleVN5bmMocHJpdmF0ZUtleSk7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IGV2ZW50LmNyZWF0ZWRfYXQgfHwgTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG5cbiAgY29uc3QgZnVsbEV2ZW50OiBOb3N0ckV2ZW50ID0ge1xuICAgIGtpbmQ6IGV2ZW50LmtpbmQgfHwgMSxcbiAgICBjcmVhdGVkX2F0OiB0aW1lc3RhbXAsXG4gICAgdGFnczogZXZlbnQudGFncyB8fCBbXSxcbiAgICBjb250ZW50OiBldmVudC5jb250ZW50IHx8ICcnLFxuICAgIHB1YmtleSxcbiAgfTtcblxuICByZXR1cm4gc2lnbkV2ZW50KGZ1bGxFdmVudCwgcHJpdmF0ZUtleSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgYW4gZXZlbnQgc2lnbmF0dXJlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICAvLyBTZXJpYWxpemUgZXZlbnQgZm9yIHZlcmlmaWNhdGlvbiAoTklQLTAxIGZvcm1hdClcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGV2ZW50LnB1YmtleSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcblxuICAgIC8vIENhbGN1bGF0ZSBldmVudCBoYXNoXG4gICAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG5cbiAgICAvLyBWZXJpZnkgZXZlbnQgSURcbiAgICBjb25zdCBjYWxjdWxhdGVkSWQgPSBieXRlc1RvSGV4KGV2ZW50SGFzaCk7XG4gICAgaWYgKGNhbGN1bGF0ZWRJZCAhPT0gZXZlbnQuaWQpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXZlbnQgSUQgbWlzbWF0Y2gnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IGhleCBzdHJpbmdzIHRvIGJ5dGVzXG4gICAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBoZXhUb0J5dGVzKGV2ZW50LnNpZyk7XG4gICAgY29uc3QgcHVia2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKGV2ZW50LnB1YmtleSk7XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHNjaG5vcnIudmVyaWZ5KHNpZ25hdHVyZUJ5dGVzLCBldmVudEhhc2gsIHB1YmtleUJ5dGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHJlY2lwaWVudFB1YktleTogUHVibGljS2V5IHwgc3RyaW5nLFxuICBzZW5kZXJQcml2S2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVjaXBpZW50UHViS2V5SGV4ID0gdHlwZW9mIHJlY2lwaWVudFB1YktleSA9PT0gJ3N0cmluZycgPyByZWNpcGllbnRQdWJLZXkgOiByZWNpcGllbnRQdWJLZXkuaGV4O1xuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHNlbmRlclByaXZLZXkpLCBoZXhUb0J5dGVzKHJlY2lwaWVudFB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7XG5cbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gSVZcbiAgICBjb25zdCBpdiA9IHJhbmRvbUJ5dGVzKDE2KTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICkpO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIEVuY3J5cHQgdGhlIG1lc3NhZ2VcbiAgICBjb25zdCBkYXRhID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBrZXksXG4gICAgICBkYXRhLmJ1ZmZlclxuICAgICkpO1xuXG4gICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgY29uc3QgY2lwaGVydGV4dEJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkoZW5jcnlwdGVkKSk7XG4gICAgY29uc3QgaXZCYXNlNjQgPSBieXRlc1RvQmFzZTY0KGl2KTtcblxuICAgIHJldHVybiBjaXBoZXJ0ZXh0QmFzZTY0ICsgJz9pdj0nICsgaXZCYXNlNjQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBlbmNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIERlY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoXG4gIGVuY3J5cHRlZE1lc3NhZ2U6IHN0cmluZyxcbiAgc2VuZGVyUHViS2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcsXG4gIHJlY2lwaWVudFByaXZLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZW5kZXJQdWJLZXlIZXggPSB0eXBlb2Ygc2VuZGVyUHViS2V5ID09PSAnc3RyaW5nJyA/IHNlbmRlclB1YktleSA6IHNlbmRlclB1YktleS5oZXg7XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMocmVjaXBpZW50UHJpdktleSksIGhleFRvQnl0ZXMoc2VuZGVyUHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTtcblxuICAgIC8vIFBhcnNlIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIC8vIEFsc28gc3VwcG9ydCBsZWdhY3kgaGV4IGZvcm1hdCAoaXYgKyBjaXBoZXJ0ZXh0IGNvbmNhdGVuYXRlZCkgYXMgZmFsbGJhY2tcbiAgICBsZXQgaXY6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXk7XG5cbiAgICBpZiAoZW5jcnlwdGVkTWVzc2FnZS5pbmNsdWRlcygnP2l2PScpKSB7XG4gICAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0XG4gICAgICBjb25zdCBbY2lwaGVydGV4dEJhc2U2NCwgaXZCYXNlNjRdID0gZW5jcnlwdGVkTWVzc2FnZS5zcGxpdCgnP2l2PScpO1xuICAgICAgY2lwaGVydGV4dCA9IGJhc2U2NFRvQnl0ZXMoY2lwaGVydGV4dEJhc2U2NCk7XG4gICAgICBpdiA9IGJhc2U2NFRvQnl0ZXMoaXZCYXNlNjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWdhY3kgaGV4IGZvcm1hdCBmYWxsYmFjazogZmlyc3QgMTYgYnl0ZXMgYXJlIElWLCByZXN0IGlzIGNpcGhlcnRleHRcbiAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGhleFRvQnl0ZXMoZW5jcnlwdGVkTWVzc2FnZSk7XG4gICAgICBpdiA9IGVuY3J5cHRlZC5zbGljZSgwLCAxNik7XG4gICAgICBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkLnNsaWNlKDE2KTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBjdXN0b21DcnlwdG8uZ2V0U3VidGxlKCkudGhlbigoc3VidGxlKSA9PiBzdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2RlY3J5cHQnXVxuICAgICkpO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5kZWNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBrZXksXG4gICAgICBjaXBoZXJ0ZXh0LmJ1ZmZlciBhcyBBcnJheUJ1ZmZlclxuICAgICkpO1xuXG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShkZWNyeXB0ZWQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZGVjcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICIvKipcbiAqIFNFQ0cgc2VjcDI1NmsxLiBTZWUgW3BkZl0oaHR0cHM6Ly93d3cuc2VjZy5vcmcvc2VjMi12Mi5wZGYpLlxuICpcbiAqIEJlbG9uZ3MgdG8gS29ibGl0eiBjdXJ2ZXM6IGl0IGhhcyBlZmZpY2llbnRseS1jb21wdXRhYmxlIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4LFxuICogY2hlY2sgb3V0IHtAbGluayBFbmRvbW9ycGhpc21PcHRzfS4gU2VlbXMgdG8gYmUgcmlnaWQgKG5vdCBiYWNrZG9vcmVkKS5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBjcmVhdGVLZXlnZW4sIHR5cGUgQ3VydmVMZW5ndGhzIH0gZnJvbSAnLi9hYnN0cmFjdC9jdXJ2ZS50cyc7XG5pbXBvcnQgeyBjcmVhdGVIYXNoZXIsIHR5cGUgSDJDSGFzaGVyLCBpc29nZW55TWFwIH0gZnJvbSAnLi9hYnN0cmFjdC9oYXNoLXRvLWN1cnZlLnRzJztcbmltcG9ydCB7IEZpZWxkLCBtYXBIYXNoVG9GaWVsZCwgcG93MiB9IGZyb20gJy4vYWJzdHJhY3QvbW9kdWxhci50cyc7XG5pbXBvcnQge1xuICB0eXBlIEVDRFNBLFxuICBlY2RzYSxcbiAgdHlwZSBFbmRvbW9ycGhpc21PcHRzLFxuICBtYXBUb0N1cnZlU2ltcGxlU1dVLFxuICB0eXBlIFdlaWVyc3RyYXNzUG9pbnQgYXMgUG9pbnRUeXBlLFxuICB3ZWllcnN0cmFzcyxcbiAgdHlwZSBXZWllcnN0cmFzc09wdHMsXG4gIHR5cGUgV2VpZXJzdHJhc3NQb2ludENvbnMsXG59IGZyb20gJy4vYWJzdHJhY3Qvd2VpZXJzdHJhc3MudHMnO1xuaW1wb3J0IHsgYWJ5dGVzLCBhc2NpaVRvQnl0ZXMsIGJ5dGVzVG9OdW1iZXJCRSwgY29uY2F0Qnl0ZXMgfSBmcm9tICcuL3V0aWxzLnRzJztcblxuLy8gU2VlbXMgbGlrZSBnZW5lcmF0b3Igd2FzIHByb2R1Y2VkIGZyb20gc29tZSBzZWVkOlxuLy8gYFBvaW50azEuQkFTRS5tdWx0aXBseShQb2ludGsxLkZuLmludigybiwgTikpLnRvQWZmaW5lKCkueGBcbi8vIC8vIGdpdmVzIHNob3J0IHggMHgzYjc4Y2U1NjNmODlhMGVkOTQxNGY1YWEyOGFkMGQ5NmQ2Nzk1ZjljNjNuXG5jb25zdCBzZWNwMjU2azFfQ1VSVkU6IFdlaWVyc3RyYXNzT3B0czxiaWdpbnQ+ID0ge1xuICBwOiBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVmZmZmZmMyZicpLFxuICBuOiBCaWdJbnQoJzB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmViYWFlZGNlNmFmNDhhMDNiYmZkMjVlOGNkMDM2NDE0MScpLFxuICBoOiBCaWdJbnQoMSksXG4gIGE6IEJpZ0ludCgwKSxcbiAgYjogQmlnSW50KDcpLFxuICBHeDogQmlnSW50KCcweDc5YmU2NjdlZjlkY2JiYWM1NWEwNjI5NWNlODcwYjA3MDI5YmZjZGIyZGNlMjhkOTU5ZjI4MTViMTZmODE3OTgnKSxcbiAgR3k6IEJpZ0ludCgnMHg0ODNhZGE3NzI2YTNjNDY1NWRhNGZiZmMwZTExMDhhOGZkMTdiNDQ4YTY4NTU0MTk5YzQ3ZDA4ZmZiMTBkNGI4JyksXG59O1xuXG5jb25zdCBzZWNwMjU2azFfRU5ETzogRW5kb21vcnBoaXNtT3B0cyA9IHtcbiAgYmV0YTogQmlnSW50KCcweDdhZTk2YTJiNjU3YzA3MTA2ZTY0NDc5ZWFjMzQzNGU5OWNmMDQ5NzUxMmY1ODk5NWMxMzk2YzI4NzE5NTAxZWUnKSxcbiAgYmFzaXNlczogW1xuICAgIFtCaWdJbnQoJzB4MzA4NmQyMjFhN2Q0NmJjZGU4NmM5MGU0OTI4NGViMTUnKSwgLUJpZ0ludCgnMHhlNDQzN2VkNjAxMGU4ODI4NmY1NDdmYTkwYWJmZTRjMycpXSxcbiAgICBbQmlnSW50KCcweDExNGNhNTBmN2E4ZTJmM2Y2NTdjMTEwOGQ5ZDQ0Y2ZkOCcpLCBCaWdJbnQoJzB4MzA4NmQyMjFhN2Q0NmJjZGU4NmM5MGU0OTI4NGViMTUnKV0sXG4gIF0sXG59O1xuXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzJuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgyKTtcblxuLyoqXG4gKiBcdTIyMUFuID0gbl4oKHArMSkvNCkgZm9yIGZpZWxkcyBwID0gMyBtb2QgNC4gV2UgdW53cmFwIHRoZSBsb29wIGFuZCBtdWx0aXBseSBiaXQtYnktYml0LlxuICogKFArMW4vNG4pLnRvU3RyaW5nKDIpIHdvdWxkIHByb2R1Y2UgYml0cyBbMjIzeCAxLCAwLCAyMnggMSwgNHggMCwgMTEsIDAwXVxuICovXG5mdW5jdGlvbiBzcXJ0TW9kKHk6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGNvbnN0IFAgPSBzZWNwMjU2azFfQ1VSVkUucDtcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGNvbnN0IF8zbiA9IEJpZ0ludCgzKSwgXzZuID0gQmlnSW50KDYpLCBfMTFuID0gQmlnSW50KDExKSwgXzIybiA9IEJpZ0ludCgyMik7XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBjb25zdCBfMjNuID0gQmlnSW50KDIzKSwgXzQ0biA9IEJpZ0ludCg0NCksIF84OG4gPSBCaWdJbnQoODgpO1xuICBjb25zdCBiMiA9ICh5ICogeSAqIHkpICUgUDsgLy8geF4zLCAxMVxuICBjb25zdCBiMyA9IChiMiAqIGIyICogeSkgJSBQOyAvLyB4XjdcbiAgY29uc3QgYjYgPSAocG93MihiMywgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IGI5ID0gKHBvdzIoYjYsIF8zbiwgUCkgKiBiMykgJSBQO1xuICBjb25zdCBiMTEgPSAocG93MihiOSwgXzJuLCBQKSAqIGIyKSAlIFA7XG4gIGNvbnN0IGIyMiA9IChwb3cyKGIxMSwgXzExbiwgUCkgKiBiMTEpICUgUDtcbiAgY29uc3QgYjQ0ID0gKHBvdzIoYjIyLCBfMjJuLCBQKSAqIGIyMikgJSBQO1xuICBjb25zdCBiODggPSAocG93MihiNDQsIF80NG4sIFApICogYjQ0KSAlIFA7XG4gIGNvbnN0IGIxNzYgPSAocG93MihiODgsIF84OG4sIFApICogYjg4KSAlIFA7XG4gIGNvbnN0IGIyMjAgPSAocG93MihiMTc2LCBfNDRuLCBQKSAqIGI0NCkgJSBQO1xuICBjb25zdCBiMjIzID0gKHBvdzIoYjIyMCwgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IHQxID0gKHBvdzIoYjIyMywgXzIzbiwgUCkgKiBiMjIpICUgUDtcbiAgY29uc3QgdDIgPSAocG93Mih0MSwgXzZuLCBQKSAqIGIyKSAlIFA7XG4gIGNvbnN0IHJvb3QgPSBwb3cyKHQyLCBfMm4sIFApO1xuICBpZiAoIUZwazEuZXFsKEZwazEuc3FyKHJvb3QpLCB5KSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuICByZXR1cm4gcm9vdDtcbn1cblxuY29uc3QgRnBrMSA9IEZpZWxkKHNlY3AyNTZrMV9DVVJWRS5wLCB7IHNxcnQ6IHNxcnRNb2QgfSk7XG5jb25zdCBQb2ludGsxID0gLyogQF9fUFVSRV9fICovIHdlaWVyc3RyYXNzKHNlY3AyNTZrMV9DVVJWRSwge1xuICBGcDogRnBrMSxcbiAgZW5kbzogc2VjcDI1NmsxX0VORE8sXG59KTtcblxuLyoqXG4gKiBzZWNwMjU2azEgY3VydmU6IEVDRFNBIGFuZCBFQ0RIIG1ldGhvZHMuXG4gKlxuICogVXNlcyBzaGEyNTYgdG8gaGFzaCBtZXNzYWdlcy4gVG8gdXNlIGEgZGlmZmVyZW50IGhhc2gsXG4gKiBwYXNzIGB7IHByZWhhc2g6IGZhbHNlIH1gIHRvIHNpZ24gLyB2ZXJpZnkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBpbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG4gKiBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5IH0gPSBzZWNwMjU2azEua2V5Z2VuKCk7XG4gKiAvLyBjb25zdCBwdWJsaWNLZXkgPSBzZWNwMjU2azEuZ2V0UHVibGljS2V5KHNlY3JldEtleSk7XG4gKiBjb25zdCBtc2cgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoJ2hlbGxvIG5vYmxlJyk7XG4gKiBjb25zdCBzaWcgPSBzZWNwMjU2azEuc2lnbihtc2csIHNlY3JldEtleSk7XG4gKiBjb25zdCBpc1ZhbGlkID0gc2VjcDI1NmsxLnZlcmlmeShzaWcsIG1zZywgcHVibGljS2V5KTtcbiAqIC8vIGNvbnN0IHNpZ0tlY2NhayA9IHNlY3AyNTZrMS5zaWduKGtlY2NhazI1Nihtc2cpLCBzZWNyZXRLZXksIHsgcHJlaGFzaDogZmFsc2UgfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHNlY3AyNTZrMTogRUNEU0EgPSAvKiBAX19QVVJFX18gKi8gZWNkc2EoUG9pbnRrMSwgc2hhMjU2KTtcblxuLy8gU2Nobm9yciBzaWduYXR1cmVzIGFyZSBzdXBlcmlvciB0byBFQ0RTQSBmcm9tIGFib3ZlLiBCZWxvdyBpcyBTY2hub3JyLXNwZWNpZmljIEJJUDAzNDAgY29kZS5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpcHMvYmxvYi9tYXN0ZXIvYmlwLTAzNDAubWVkaWF3aWtpXG4vKiogQW4gb2JqZWN0IG1hcHBpbmcgdGFncyB0byB0aGVpciB0YWdnZWQgaGFzaCBwcmVmaXggb2YgW1NIQTI1Nih0YWcpIHwgU0hBMjU2KHRhZyldICovXG5jb25zdCBUQUdHRURfSEFTSF9QUkVGSVhFUzogeyBbdGFnOiBzdHJpbmddOiBVaW50OEFycmF5IH0gPSB7fTtcbmZ1bmN0aW9uIHRhZ2dlZEhhc2godGFnOiBzdHJpbmcsIC4uLm1lc3NhZ2VzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcbiAgbGV0IHRhZ1AgPSBUQUdHRURfSEFTSF9QUkVGSVhFU1t0YWddO1xuICBpZiAodGFnUCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgdGFnSCA9IHNoYTI1Nihhc2NpaVRvQnl0ZXModGFnKSk7XG4gICAgdGFnUCA9IGNvbmNhdEJ5dGVzKHRhZ0gsIHRhZ0gpO1xuICAgIFRBR0dFRF9IQVNIX1BSRUZJWEVTW3RhZ10gPSB0YWdQO1xuICB9XG4gIHJldHVybiBzaGEyNTYoY29uY2F0Qnl0ZXModGFnUCwgLi4ubWVzc2FnZXMpKTtcbn1cblxuLy8gRUNEU0EgY29tcGFjdCBwb2ludHMgYXJlIDMzLWJ5dGUuIFNjaG5vcnIgaXMgMzI6IHdlIHN0cmlwIGZpcnN0IGJ5dGUgMHgwMiBvciAweDAzXG5jb25zdCBwb2ludFRvQnl0ZXMgPSAocG9pbnQ6IFBvaW50VHlwZTxiaWdpbnQ+KSA9PiBwb2ludC50b0J5dGVzKHRydWUpLnNsaWNlKDEpO1xuY29uc3QgaGFzRXZlbiA9ICh5OiBiaWdpbnQpID0+IHkgJSBfMm4gPT09IF8wbjtcblxuLy8gQ2FsY3VsYXRlIHBvaW50LCBzY2FsYXIgYW5kIGJ5dGVzXG5mdW5jdGlvbiBzY2hub3JyR2V0RXh0UHViS2V5KHByaXY6IFVpbnQ4QXJyYXkpIHtcbiAgY29uc3QgeyBGbiwgQkFTRSB9ID0gUG9pbnRrMTtcbiAgY29uc3QgZF8gPSBGbi5mcm9tQnl0ZXMocHJpdik7XG4gIGNvbnN0IHAgPSBCQVNFLm11bHRpcGx5KGRfKTsgLy8gUCA9IGQnXHUyMkM1RzsgMCA8IGQnIDwgbiBjaGVjayBpcyBkb25lIGluc2lkZVxuICBjb25zdCBzY2FsYXIgPSBoYXNFdmVuKHAueSkgPyBkXyA6IEZuLm5lZyhkXyk7XG4gIHJldHVybiB7IHNjYWxhciwgYnl0ZXM6IHBvaW50VG9CeXRlcyhwKSB9O1xufVxuLyoqXG4gKiBsaWZ0X3ggZnJvbSBCSVAzNDAuIENvbnZlcnQgMzItYnl0ZSB4IGNvb3JkaW5hdGUgdG8gZWxsaXB0aWMgY3VydmUgcG9pbnQuXG4gKiBAcmV0dXJucyB2YWxpZCBwb2ludCBjaGVja2VkIGZvciBiZWluZyBvbi1jdXJ2ZVxuICovXG5mdW5jdGlvbiBsaWZ0X3goeDogYmlnaW50KTogUG9pbnRUeXBlPGJpZ2ludD4ge1xuICBjb25zdCBGcCA9IEZwazE7XG4gIGlmICghRnAuaXNWYWxpZE5vdDAoeCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB4OiBGYWlsIGlmIHggXHUyMjY1IHAnKTtcbiAgY29uc3QgeHggPSBGcC5jcmVhdGUoeCAqIHgpO1xuICBjb25zdCBjID0gRnAuY3JlYXRlKHh4ICogeCArIEJpZ0ludCg3KSk7IC8vIExldCBjID0geFx1MDBCMyArIDcgbW9kIHAuXG4gIGxldCB5ID0gRnAuc3FydChjKTsgLy8gTGV0IHkgPSBjXihwKzEpLzQgbW9kIHAuIFNhbWUgYXMgc3FydCgpLlxuICAvLyBSZXR1cm4gdGhlIHVuaXF1ZSBwb2ludCBQIHN1Y2ggdGhhdCB4KFApID0geCBhbmRcbiAgLy8geShQKSA9IHkgaWYgeSBtb2QgMiA9IDAgb3IgeShQKSA9IHAteSBvdGhlcndpc2UuXG4gIGlmICghaGFzRXZlbih5KSkgeSA9IEZwLm5lZyh5KTtcbiAgY29uc3QgcCA9IFBvaW50azEuZnJvbUFmZmluZSh7IHgsIHkgfSk7XG4gIHAuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgcmV0dXJuIHA7XG59XG5jb25zdCBudW0gPSBieXRlc1RvTnVtYmVyQkU7XG4vKipcbiAqIENyZWF0ZSB0YWdnZWQgaGFzaCwgY29udmVydCBpdCB0byBiaWdpbnQsIHJlZHVjZSBtb2R1bG8tbi5cbiAqL1xuZnVuY3Rpb24gY2hhbGxlbmdlKC4uLmFyZ3M6IFVpbnQ4QXJyYXlbXSk6IGJpZ2ludCB7XG4gIHJldHVybiBQb2ludGsxLkZuLmNyZWF0ZShudW0odGFnZ2VkSGFzaCgnQklQMDM0MC9jaGFsbGVuZ2UnLCAuLi5hcmdzKSkpO1xufVxuXG4vKipcbiAqIFNjaG5vcnIgcHVibGljIGtleSBpcyBqdXN0IGB4YCBjb29yZGluYXRlIG9mIFBvaW50IGFzIHBlciBCSVAzNDAuXG4gKi9cbmZ1bmN0aW9uIHNjaG5vcnJHZXRQdWJsaWNLZXkoc2VjcmV0S2V5OiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBzY2hub3JyR2V0RXh0UHViS2V5KHNlY3JldEtleSkuYnl0ZXM7IC8vIGQnPWludChzaykuIEZhaWwgaWYgZCc9MCBvciBkJ1x1MjI2NW4uIFJldCBieXRlcyhkJ1x1MjJDNUcpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBTY2hub3JyIHNpZ25hdHVyZSBhcyBwZXIgQklQMzQwLiBWZXJpZmllcyBpdHNlbGYgYmVmb3JlIHJldHVybmluZyBhbnl0aGluZy5cbiAqIGF1eFJhbmQgaXMgb3B0aW9uYWwgYW5kIGlzIG5vdCB0aGUgc29sZSBzb3VyY2Ugb2YgayBnZW5lcmF0aW9uOiBiYWQgQ1NQUk5HIHdvbid0IGJlIGRhbmdlcm91cy5cbiAqL1xuZnVuY3Rpb24gc2Nobm9yclNpZ24oXG4gIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gIHNlY3JldEtleTogVWludDhBcnJheSxcbiAgYXV4UmFuZDogVWludDhBcnJheSA9IHJhbmRvbUJ5dGVzKDMyKVxuKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHsgRm4gfSA9IFBvaW50azE7XG4gIGNvbnN0IG0gPSBhYnl0ZXMobWVzc2FnZSwgdW5kZWZpbmVkLCAnbWVzc2FnZScpO1xuICBjb25zdCB7IGJ5dGVzOiBweCwgc2NhbGFyOiBkIH0gPSBzY2hub3JyR2V0RXh0UHViS2V5KHNlY3JldEtleSk7IC8vIGNoZWNrcyBmb3IgaXNXaXRoaW5DdXJ2ZU9yZGVyXG4gIGNvbnN0IGEgPSBhYnl0ZXMoYXV4UmFuZCwgMzIsICdhdXhSYW5kJyk7IC8vIEF1eGlsaWFyeSByYW5kb20gZGF0YSBhOiBhIDMyLWJ5dGUgYXJyYXlcbiAgY29uc3QgdCA9IEZuLnRvQnl0ZXMoZCBeIG51bSh0YWdnZWRIYXNoKCdCSVAwMzQwL2F1eCcsIGEpKSk7IC8vIExldCB0IGJlIHRoZSBieXRlLXdpc2UgeG9yIG9mIGJ5dGVzKGQpIGFuZCBoYXNoL2F1eChhKVxuICBjb25zdCByYW5kID0gdGFnZ2VkSGFzaCgnQklQMDM0MC9ub25jZScsIHQsIHB4LCBtKTsgLy8gTGV0IHJhbmQgPSBoYXNoL25vbmNlKHQgfHwgYnl0ZXMoUCkgfHwgbSlcbiAgLy8gTGV0IGsnID0gaW50KHJhbmQpIG1vZCBuLiBGYWlsIGlmIGsnID0gMC4gTGV0IFIgPSBrJ1x1MjJDNUdcbiAgY29uc3QgeyBieXRlczogcngsIHNjYWxhcjogayB9ID0gc2Nobm9yckdldEV4dFB1YktleShyYW5kKTtcbiAgY29uc3QgZSA9IGNoYWxsZW5nZShyeCwgcHgsIG0pOyAvLyBMZXQgZSA9IGludChoYXNoL2NoYWxsZW5nZShieXRlcyhSKSB8fCBieXRlcyhQKSB8fCBtKSkgbW9kIG4uXG4gIGNvbnN0IHNpZyA9IG5ldyBVaW50OEFycmF5KDY0KTsgLy8gTGV0IHNpZyA9IGJ5dGVzKFIpIHx8IGJ5dGVzKChrICsgZWQpIG1vZCBuKS5cbiAgc2lnLnNldChyeCwgMCk7XG4gIHNpZy5zZXQoRm4udG9CeXRlcyhGbi5jcmVhdGUoayArIGUgKiBkKSksIDMyKTtcbiAgLy8gSWYgVmVyaWZ5KGJ5dGVzKFApLCBtLCBzaWcpIChzZWUgYmVsb3cpIHJldHVybnMgZmFpbHVyZSwgYWJvcnRcbiAgaWYgKCFzY2hub3JyVmVyaWZ5KHNpZywgbSwgcHgpKSB0aHJvdyBuZXcgRXJyb3IoJ3NpZ246IEludmFsaWQgc2lnbmF0dXJlIHByb2R1Y2VkJyk7XG4gIHJldHVybiBzaWc7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgU2Nobm9yciBzaWduYXR1cmUuXG4gKiBXaWxsIHN3YWxsb3cgZXJyb3JzICYgcmV0dXJuIGZhbHNlIGV4Y2VwdCBmb3IgaW5pdGlhbCB0eXBlIHZhbGlkYXRpb24gb2YgYXJndW1lbnRzLlxuICovXG5mdW5jdGlvbiBzY2hub3JyVmVyaWZ5KHNpZ25hdHVyZTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSwgcHVibGljS2V5OiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHsgRnAsIEZuLCBCQVNFIH0gPSBQb2ludGsxO1xuICBjb25zdCBzaWcgPSBhYnl0ZXMoc2lnbmF0dXJlLCA2NCwgJ3NpZ25hdHVyZScpO1xuICBjb25zdCBtID0gYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgY29uc3QgcHViID0gYWJ5dGVzKHB1YmxpY0tleSwgMzIsICdwdWJsaWNLZXknKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBQID0gbGlmdF94KG51bShwdWIpKTsgLy8gUCA9IGxpZnRfeChpbnQocGspKTsgZmFpbCBpZiB0aGF0IGZhaWxzXG4gICAgY29uc3QgciA9IG51bShzaWcuc3ViYXJyYXkoMCwgMzIpKTsgLy8gTGV0IHIgPSBpbnQoc2lnWzA6MzJdKTsgZmFpbCBpZiByIFx1MjI2NSBwLlxuICAgIGlmICghRnAuaXNWYWxpZE5vdDAocikpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBzID0gbnVtKHNpZy5zdWJhcnJheSgzMiwgNjQpKTsgLy8gTGV0IHMgPSBpbnQoc2lnWzMyOjY0XSk7IGZhaWwgaWYgcyBcdTIyNjUgbi5cbiAgICBpZiAoIUZuLmlzVmFsaWROb3QwKHMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBlID0gY2hhbGxlbmdlKEZuLnRvQnl0ZXMociksIHBvaW50VG9CeXRlcyhQKSwgbSk7IC8vIGludChjaGFsbGVuZ2UoYnl0ZXMocil8fGJ5dGVzKFApfHxtKSklblxuICAgIC8vIFIgPSBzXHUyMkM1RyAtIGVcdTIyQzVQLCB3aGVyZSAtZVAgPT0gKG4tZSlQXG4gICAgY29uc3QgUiA9IEJBU0UubXVsdGlwbHlVbnNhZmUocykuYWRkKFAubXVsdGlwbHlVbnNhZmUoRm4ubmVnKGUpKSk7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBSLnRvQWZmaW5lKCk7XG4gICAgLy8gRmFpbCBpZiBpc19pbmZpbml0ZShSKSAvIG5vdCBoYXNfZXZlbl95KFIpIC8geChSKSBcdTIyNjAgci5cbiAgICBpZiAoUi5pczAoKSB8fCAhaGFzRXZlbih5KSB8fCB4ICE9PSByKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFNlY3BTY2hub3JyID0ge1xuICBrZXlnZW46IChzZWVkPzogVWludDhBcnJheSkgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuICBnZXRQdWJsaWNLZXk6IHR5cGVvZiBzY2hub3JyR2V0UHVibGljS2V5O1xuICBzaWduOiB0eXBlb2Ygc2Nobm9yclNpZ247XG4gIHZlcmlmeTogdHlwZW9mIHNjaG5vcnJWZXJpZnk7XG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+O1xuICB1dGlsczoge1xuICAgIHJhbmRvbVNlY3JldEtleTogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICAgIHBvaW50VG9CeXRlczogKHBvaW50OiBQb2ludFR5cGU8YmlnaW50PikgPT4gVWludDhBcnJheTtcbiAgICBsaWZ0X3g6IHR5cGVvZiBsaWZ0X3g7XG4gICAgdGFnZ2VkSGFzaDogdHlwZW9mIHRhZ2dlZEhhc2g7XG4gIH07XG4gIGxlbmd0aHM6IEN1cnZlTGVuZ3Rocztcbn07XG4vKipcbiAqIFNjaG5vcnIgc2lnbmF0dXJlcyBvdmVyIHNlY3AyNTZrMS5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9iaXRjb2luL2JpcHMvYmxvYi9tYXN0ZXIvYmlwLTAzNDAubWVkaWF3aWtpXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG4gKiBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5IH0gPSBzY2hub3JyLmtleWdlbigpO1xuICogLy8gY29uc3QgcHVibGljS2V5ID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoc2VjcmV0S2V5KTtcbiAqIGNvbnN0IG1zZyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnaGVsbG8nKTtcbiAqIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihtc2csIHNlY3JldEtleSk7XG4gKiBjb25zdCBpc1ZhbGlkID0gc2Nobm9yci52ZXJpZnkoc2lnLCBtc2csIHB1YmxpY0tleSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IHNjaG5vcnI6IFNlY3BTY2hub3JyID0gLyogQF9fUFVSRV9fICovICgoKSA9PiB7XG4gIGNvbnN0IHNpemUgPSAzMjtcbiAgY29uc3Qgc2VlZExlbmd0aCA9IDQ4O1xuICBjb25zdCByYW5kb21TZWNyZXRLZXkgPSAoc2VlZCA9IHJhbmRvbUJ5dGVzKHNlZWRMZW5ndGgpKTogVWludDhBcnJheSA9PiB7XG4gICAgcmV0dXJuIG1hcEhhc2hUb0ZpZWxkKHNlZWQsIHNlY3AyNTZrMV9DVVJWRS5uKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBrZXlnZW46IGNyZWF0ZUtleWdlbihyYW5kb21TZWNyZXRLZXksIHNjaG5vcnJHZXRQdWJsaWNLZXkpLFxuICAgIGdldFB1YmxpY0tleTogc2Nobm9yckdldFB1YmxpY0tleSxcbiAgICBzaWduOiBzY2hub3JyU2lnbixcbiAgICB2ZXJpZnk6IHNjaG5vcnJWZXJpZnksXG4gICAgUG9pbnQ6IFBvaW50azEsXG4gICAgdXRpbHM6IHtcbiAgICAgIHJhbmRvbVNlY3JldEtleSxcbiAgICAgIHRhZ2dlZEhhc2gsXG4gICAgICBsaWZ0X3gsXG4gICAgICBwb2ludFRvQnl0ZXMsXG4gICAgfSxcbiAgICBsZW5ndGhzOiB7XG4gICAgICBzZWNyZXRLZXk6IHNpemUsXG4gICAgICBwdWJsaWNLZXk6IHNpemUsXG4gICAgICBwdWJsaWNLZXlIYXNQcmVmaXg6IGZhbHNlLFxuICAgICAgc2lnbmF0dXJlOiBzaXplICogMixcbiAgICAgIHNlZWQ6IHNlZWRMZW5ndGgsXG4gICAgfSxcbiAgfTtcbn0pKCk7XG5cbmNvbnN0IGlzb01hcCA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT5cbiAgaXNvZ2VueU1hcChcbiAgICBGcGsxLFxuICAgIFtcbiAgICAgIC8vIHhOdW1cbiAgICAgIFtcbiAgICAgICAgJzB4OGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGUzOGRhYWFhYThjNycsXG4gICAgICAgICcweDdkM2Q0YzgwYmMzMjFkNWI5ZjMxNWNlYTdmZDQ0YzVkNTk1ZDJmYzBiZjYzYjkyZGZmZjEwNDRmMTdjNjU4MScsXG4gICAgICAgICcweDUzNGMzMjhkMjNmMjM0ZTZlMmE0MTNkZWNhMjVjYWVjZTQ1MDYxNDQwMzdjNDAzMTRlY2JkMGI1M2Q5ZGQyNjInLFxuICAgICAgICAnMHg4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZGFhYWFhODhjJyxcbiAgICAgIF0sXG4gICAgICAvLyB4RGVuXG4gICAgICBbXG4gICAgICAgICcweGQzNTc3MTE5M2Q5NDkxOGE5Y2EzNGNjYmI3YjY0MGRkODZjZDQwOTU0MmY4NDg3ZDlmZTZiNzQ1NzgxZWI0OWInLFxuICAgICAgICAnMHhlZGFkYzZmNjQzODNkYzFkZjdjNGIyZDUxYjU0MjI1NDA2ZDM2YjY0MWY1ZTQxYmJjNTJhNTY2MTJhOGM2ZDE0JyxcbiAgICAgICAgJzB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMScsIC8vIExBU1QgMVxuICAgICAgXSxcbiAgICAgIC8vIHlOdW1cbiAgICAgIFtcbiAgICAgICAgJzB4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGI4ZTM4ZTIzYycsXG4gICAgICAgICcweGM3NWUwYzMyZDVjYjdjMGZhOWQwYTU0YjEyYTBhNmQ1NjQ3YWIwNDZkNjg2ZGE2ZmRmZmM5MGZjMjAxZDcxYTMnLFxuICAgICAgICAnMHgyOWE2MTk0NjkxZjkxYTczNzE1MjA5ZWY2NTEyZTU3NjcyMjgzMGEyMDFiZTIwMThhNzY1ZTg1YTllY2VlOTMxJyxcbiAgICAgICAgJzB4MmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmY2ODRiZGExMmYzOGUzOGQ4NCcsXG4gICAgICBdLFxuICAgICAgLy8geURlblxuICAgICAgW1xuICAgICAgICAnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZmOTNiJyxcbiAgICAgICAgJzB4N2EwNjUzNGJiOGJkYjQ5ZmQ1ZTllNjYzMjcyMmMyOTg5NDY3YzFiZmM4ZThkOTc4ZGZiNDI1ZDI2ODVjMjU3MycsXG4gICAgICAgICcweDY0ODRhYTcxNjU0NWNhMmNmM2E3MGMzZmE4ZmUzMzdlMGEzZDIxMTYyZjBkNjI5OWE3YmY4MTkyYmZkMmE3NmYnLFxuICAgICAgICAnMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxJywgLy8gTEFTVCAxXG4gICAgICBdLFxuICAgIF0ubWFwKChpKSA9PiBpLm1hcCgoaikgPT4gQmlnSW50KGopKSkgYXMgW2JpZ2ludFtdLCBiaWdpbnRbXSwgYmlnaW50W10sIGJpZ2ludFtdXVxuICApKSgpO1xuY29uc3QgbWFwU1dVID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBtYXBUb0N1cnZlU2ltcGxlU1dVKEZwazEsIHtcbiAgICBBOiBCaWdJbnQoJzB4M2Y4NzMxYWJkZDY2MWFkY2EwOGE1NTU4ZjBmNWQyNzJlOTUzZDM2M2NiNmYwZTVkNDA1NDQ3YzAxYTQ0NDUzMycpLFxuICAgIEI6IEJpZ0ludCgnMTc3MScpLFxuICAgIFo6IEZwazEuY3JlYXRlKEJpZ0ludCgnLTExJykpLFxuICB9KSkoKTtcblxuLyoqIEhhc2hpbmcgLyBlbmNvZGluZyB0byBzZWNwMjU2azEgcG9pbnRzIC8gZmllbGQuIFJGQyA5MzgwIG1ldGhvZHMuICovXG5leHBvcnQgY29uc3Qgc2VjcDI1NmsxX2hhc2hlcjogSDJDSGFzaGVyPFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4+ID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBjcmVhdGVIYXNoZXIoXG4gICAgUG9pbnRrMSxcbiAgICAoc2NhbGFyczogYmlnaW50W10pID0+IHtcbiAgICAgIGNvbnN0IHsgeCwgeSB9ID0gbWFwU1dVKEZwazEuY3JlYXRlKHNjYWxhcnNbMF0pKTtcbiAgICAgIHJldHVybiBpc29NYXAoeCwgeSk7XG4gICAgfSxcbiAgICB7XG4gICAgICBEU1Q6ICdzZWNwMjU2azFfWE1EOlNIQS0yNTZfU1NXVV9ST18nLFxuICAgICAgZW5jb2RlRFNUOiAnc2VjcDI1NmsxX1hNRDpTSEEtMjU2X1NTV1VfTlVfJyxcbiAgICAgIHA6IEZwazEuT1JERVIsXG4gICAgICBtOiAxLFxuICAgICAgazogMTI4LFxuICAgICAgZXhwYW5kOiAneG1kJyxcbiAgICAgIGhhc2g6IHNoYTI1NixcbiAgICB9XG4gICkpKCk7XG4iLCAiLyoqXG4gKiBNZXRob2RzIGZvciBlbGxpcHRpYyBjdXJ2ZSBtdWx0aXBsaWNhdGlvbiBieSBzY2FsYXJzLlxuICogQ29udGFpbnMgd05BRiwgcGlwcGVuZ2VyLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQgeyBiaXRMZW4sIGJpdE1hc2ssIHR5cGUgU2lnbmVyIH0gZnJvbSAnLi4vdXRpbHMudHMnO1xuaW1wb3J0IHsgRmllbGQsIEZwSW52ZXJ0QmF0Y2gsIHZhbGlkYXRlRmllbGQsIHR5cGUgSUZpZWxkIH0gZnJvbSAnLi9tb2R1bGFyLnRzJztcblxuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKTtcbmNvbnN0IF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSk7XG5cbmV4cG9ydCB0eXBlIEFmZmluZVBvaW50PFQ+ID0ge1xuICB4OiBUO1xuICB5OiBUO1xufSAmIHsgWj86IG5ldmVyIH07XG5cbi8vIFdlIGNhbid0IFwiYWJzdHJhY3Qgb3V0XCIgY29vcmRpbmF0ZXMgKFgsIFksIFo7IGFuZCBUIGluIEVkd2FyZHMpOiBhcmd1bWVudCBuYW1lcyBvZiBjb25zdHJ1Y3RvclxuLy8gYXJlIG5vdCBhY2Nlc3NpYmxlLiBTZWUgVHlwZXNjcmlwdCBnaC01NjA5MywgZ2gtNDE1OTQuXG4vL1xuLy8gV2UgaGF2ZSB0byB1c2UgcmVjdXJzaXZlIHR5cGVzLCBzbyBpdCB3aWxsIHJldHVybiBhY3R1YWwgcG9pbnQsIG5vdCBjb25zdGFpbmVkIGBDdXJ2ZVBvaW50YC5cbi8vIElmLCBhdCBhbnkgcG9pbnQsIFAgaXMgYGFueWAsIGl0IHdpbGwgZXJhc2UgYWxsIHR5cGVzIGFuZCByZXBsYWNlIGl0XG4vLyB3aXRoIGBhbnlgLCBiZWNhdXNlIG9mIHJlY3Vyc2lvbiwgYGFueSBpbXBsZW1lbnRzIEN1cnZlUG9pbnRgLFxuLy8gYnV0IHdlIGxvc2UgYWxsIGNvbnN0cmFpbnMgb24gbWV0aG9kcy5cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgZWxsaXB0aWMgY3VydmUgUG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDdXJ2ZVBvaW50PEYsIFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PEYsIFA+PiB7XG4gIC8qKiBBZmZpbmUgeCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIC8gZXh0ZW5kZWQgWCBjb29yZGluYXRlLiAqL1xuICB4OiBGO1xuICAvKiogQWZmaW5lIHkgY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSAvIGV4dGVuZGVkIFkgY29vcmRpbmF0ZS4gKi9cbiAgeTogRjtcbiAgWj86IEY7XG4gIGRvdWJsZSgpOiBQO1xuICBuZWdhdGUoKTogUDtcbiAgYWRkKG90aGVyOiBQKTogUDtcbiAgc3VidHJhY3Qob3RoZXI6IFApOiBQO1xuICBlcXVhbHMob3RoZXI6IFApOiBib29sZWFuO1xuICBtdWx0aXBseShzY2FsYXI6IGJpZ2ludCk6IFA7XG4gIGFzc2VydFZhbGlkaXR5KCk6IHZvaWQ7XG4gIGNsZWFyQ29mYWN0b3IoKTogUDtcbiAgaXMwKCk6IGJvb2xlYW47XG4gIGlzVG9yc2lvbkZyZWUoKTogYm9vbGVhbjtcbiAgaXNTbWFsbE9yZGVyKCk6IGJvb2xlYW47XG4gIG11bHRpcGx5VW5zYWZlKHNjYWxhcjogYmlnaW50KTogUDtcbiAgLyoqXG4gICAqIE1hc3NpdmVseSBzcGVlZHMgdXAgYHAubXVsdGlwbHkobilgIGJ5IHVzaW5nIHByZWNvbXB1dGUgdGFibGVzIChjYWNoaW5nKS4gU2VlIHtAbGluayB3TkFGfS5cbiAgICogQHBhcmFtIGlzTGF6eSBjYWxjdWxhdGUgY2FjaGUgbm93LiBEZWZhdWx0ICh0cnVlKSBlbnN1cmVzIGl0J3MgZGVmZXJyZWQgdG8gZmlyc3QgYG11bHRpcGx5KClgXG4gICAqL1xuICBwcmVjb21wdXRlKHdpbmRvd1NpemU/OiBudW1iZXIsIGlzTGF6eT86IGJvb2xlYW4pOiBQO1xuICAvKiogQ29udmVydHMgcG9pbnQgdG8gMkQgeHkgYWZmaW5lIGNvb3JkaW5hdGVzICovXG4gIHRvQWZmaW5lKGludmVydGVkWj86IEYpOiBBZmZpbmVQb2ludDxGPjtcbiAgdG9CeXRlcygpOiBVaW50OEFycmF5O1xuICB0b0hleCgpOiBzdHJpbmc7XG59XG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3IgYWxsIGVsbGlwdGljIGN1cnZlIFBvaW50IGNvbnN0cnVjdG9ycy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VydmVQb2ludENvbnM8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPj4ge1xuICBbU3ltYm9sLmhhc0luc3RhbmNlXTogKGl0ZW06IHVua25vd24pID0+IGJvb2xlYW47XG4gIEJBU0U6IFA7XG4gIFpFUk86IFA7XG4gIC8qKiBGaWVsZCBmb3IgYmFzaWMgY3VydmUgbWF0aCAqL1xuICBGcDogSUZpZWxkPFBfRjxQPj47XG4gIC8qKiBTY2FsYXIgZmllbGQsIGZvciBzY2FsYXJzIGluIG11bHRpcGx5IGFuZCBvdGhlcnMgKi9cbiAgRm46IElGaWVsZDxiaWdpbnQ+O1xuICAvKiogQ3JlYXRlcyBwb2ludCBmcm9tIHgsIHkuIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gIGZyb21BZmZpbmUocDogQWZmaW5lUG9pbnQ8UF9GPFA+Pik6IFA7XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSk6IFA7XG4gIGZyb21IZXgoaGV4OiBzdHJpbmcpOiBQO1xufVxuXG4vLyBUeXBlIGluZmVyZW5jZSBoZWxwZXJzOiBQQyAtIFBvaW50Q29uc3RydWN0b3IsIFAgLSBQb2ludCwgRnAgLSBGaWVsZCBlbGVtZW50XG4vLyBTaG9ydCBuYW1lcywgYmVjYXVzZSB3ZSB1c2UgdGhlbSBhIGxvdCBpbiByZXN1bHQgdHlwZXM6XG4vLyAqIHdlIGNhbid0IGRvICdQID0gR2V0Q3VydmVQb2ludDxQQz4nOiB0aGlzIGlzIGRlZmF1bHQgdmFsdWUgYW5kIGRvZXNuJ3QgY29uc3RyYWluIGFueXRoaW5nXG4vLyAqIHdlIGNhbid0IGRvICd0eXBlIFggPSBHZXRDdXJ2ZVBvaW50PFBDPic6IGl0IHdvbid0IGJlIGFjY2VzaWJsZSBmb3IgYXJndW1lbnRzL3JldHVybiB0eXBlc1xuLy8gKiBgQ3VydmVQb2ludENvbnM8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPj5gIGNvbnN0cmFpbnRzIGZyb20gaW50ZXJmYWNlIGRlZmluaXRpb25cbi8vICAgd29uJ3QgcHJvcGFnYXRlLCBpZiBgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxhbnk+YDogdGhlIFAgd291bGQgYmUgJ2FueScsIHdoaWNoIGlzIGluY29ycmVjdFxuLy8gKiBQQyBjb3VsZCBiZSBzdXBlciBzcGVjaWZpYyB3aXRoIHN1cGVyIHNwZWNpZmljIFAsIHdoaWNoIGltcGxlbWVudHMgQ3VydmVQb2ludDxhbnksIFA+LlxuLy8gICB0aGlzIG1lYW5zIHdlIG5lZWQgdG8gZG8gc3R1ZmYgbGlrZVxuLy8gICBgZnVuY3Rpb24gdGVzdDxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihgXG4vLyAgIGlmIHdlIHdhbnQgdHlwZSBzYWZldHkgYXJvdW5kIFAsIG90aGVyd2lzZSBQQ19QPFBDPiB3aWxsIGJlIGFueVxuXG4vKiogUmV0dXJucyBGcCB0eXBlIGZyb20gUG9pbnQgKFBfRjxQPiA9PSBQLkYpICovXG5leHBvcnQgdHlwZSBQX0Y8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPj4gPSBQIGV4dGVuZHMgQ3VydmVQb2ludDxpbmZlciBGLCBQPiA/IEYgOiBuZXZlcjtcbi8qKiBSZXR1cm5zIEZwIHR5cGUgZnJvbSBQb2ludENvbnMgKFBDX0Y8UEM+ID09IFBDLlAuRikgKi9cbmV4cG9ydCB0eXBlIFBDX0Y8UEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj4+ID0gUENbJ0ZwJ11bJ1pFUk8nXTtcbi8qKiBSZXR1cm5zIFBvaW50IHR5cGUgZnJvbSBQb2ludENvbnMgKFBDX1A8UEM+ID09IFBDLlApICovXG5leHBvcnQgdHlwZSBQQ19QPFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8Q3VydmVQb2ludDxhbnksIGFueT4+PiA9IFBDWydaRVJPJ107XG5cbi8vIFVnbHkgaGFjayB0byBnZXQgcHJvcGVyIHR5cGUgaW5mZXJlbmNlLCBiZWNhdXNlIGluIHR5cGVzY3JpcHQgZmFpbHMgdG8gaW5mZXIgcmVzdXJzaXZlbHkuXG4vLyBUaGUgaGFjayBhbGxvd3MgdG8gZG8gdXAgdG8gMTAgY2hhaW5lZCBvcGVyYXRpb25zIHdpdGhvdXQgYXBwbHlpbmcgdHlwZSBlcmFzdXJlLlxuLy9cbi8vIFR5cGVzIHdoaWNoIHdvbid0IHdvcms6XG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj5gLCB3aWxsIHJldHVybiBgYW55YCBhZnRlciAxIG9wZXJhdGlvblxuLy8gKiBgQ3VydmVQb2ludENvbnM8YW55PjogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PiBleHRlbmRzIEN1cnZlUG9pbnRDb25zPGFueT4gPSBmYWxzZWBcbi8vICogYFAgZXh0ZW5kcyBDdXJ2ZVBvaW50LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+YFxuLy8gICAgICogSXQgY2FuJ3QgaW5mZXIgUCBmcm9tIFBDIGFsb25lXG4vLyAgICAgKiBUb28gbWFueSByZWxhdGlvbnMgYmV0d2VlbiBGLCBQICYgUENcbi8vICAgICAqIEl0IHdpbGwgaW5mZXIgUC9GIGlmIGBhcmc6IEN1cnZlUG9pbnRDb25zPEYsIFA+YCwgYnV0IHdpbGwgZmFpbCBpZiBQQyBpcyBnZW5lcmljXG4vLyAgICAgKiBJdCB3aWxsIHdvcmsgY29ycmVjdGx5IGlmIHRoZXJlIGlzIGFuIGFkZGl0aW9uYWwgYXJndW1lbnQgb2YgdHlwZSBQXG4vLyAgICAgKiBCdXQgZ2VuZXJhbGx5LCB3ZSBkb24ndCB3YW50IHRvIHBhcmFtZXRyaXplIGBDdXJ2ZVBvaW50Q29uc2Agb3ZlciBgRmA6IGl0IHdpbGwgY29tcGxpY2F0ZVxuLy8gICAgICAgdHlwZXMsIG1ha2luZyB0aGVtIHVuLWluZmVyYWJsZVxuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgdHlwZSBQQ19BTlkgPSBDdXJ2ZVBvaW50Q29uczxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksIGFueT5cbiAgPj4+Pj4+Pj4+XG4+O1xuXG5leHBvcnQgaW50ZXJmYWNlIEN1cnZlTGVuZ3RocyB7XG4gIHNlY3JldEtleT86IG51bWJlcjtcbiAgcHVibGljS2V5PzogbnVtYmVyO1xuICBwdWJsaWNLZXlVbmNvbXByZXNzZWQ/OiBudW1iZXI7XG4gIHB1YmxpY0tleUhhc1ByZWZpeD86IGJvb2xlYW47XG4gIHNpZ25hdHVyZT86IG51bWJlcjtcbiAgc2VlZD86IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgTWFwcGVyPFQ+ID0gKGk6IFRbXSkgPT4gVFtdO1xuXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlQ3Q8VCBleHRlbmRzIHsgbmVnYXRlOiAoKSA9PiBUIH0+KGNvbmRpdGlvbjogYm9vbGVhbiwgaXRlbTogVCk6IFQge1xuICBjb25zdCBuZWcgPSBpdGVtLm5lZ2F0ZSgpO1xuICByZXR1cm4gY29uZGl0aW9uID8gbmVnIDogaXRlbTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhIGJ1bmNoIG9mIFByb2plY3RpdmUgUG9pbnRzIGJ1dCBleGVjdXRlcyBvbmx5IG9uZVxuICogaW52ZXJzaW9uIG9uIGFsbCBvZiB0aGVtLiBJbnZlcnNpb24gaXMgdmVyeSBzbG93IG9wZXJhdGlvbixcbiAqIHNvIHRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2UgbWFzc2l2ZWx5LlxuICogT3B0aW1pemF0aW9uOiBjb252ZXJ0cyBhIGxpc3Qgb2YgcHJvamVjdGl2ZSBwb2ludHMgdG8gYSBsaXN0IG9mIGlkZW50aWNhbCBwb2ludHMgd2l0aCBaPTEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVaPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBjOiBQQyxcbiAgcG9pbnRzOiBQW11cbik6IFBbXSB7XG4gIGNvbnN0IGludmVydGVkWnMgPSBGcEludmVydEJhdGNoKFxuICAgIGMuRnAsXG4gICAgcG9pbnRzLm1hcCgocCkgPT4gcC5aISlcbiAgKTtcbiAgcmV0dXJuIHBvaW50cy5tYXAoKHAsIGkpID0+IGMuZnJvbUFmZmluZShwLnRvQWZmaW5lKGludmVydGVkWnNbaV0pKSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlVyhXOiBudW1iZXIsIGJpdHM6IG51bWJlcikge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKFcpIHx8IFcgPD0gMCB8fCBXID4gYml0cylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgd2luZG93IHNpemUsIGV4cGVjdGVkIFsxLi4nICsgYml0cyArICddLCBnb3QgVz0nICsgVyk7XG59XG5cbi8qKiBJbnRlcm5hbCB3TkFGIG9wdHMgZm9yIHNwZWNpZmljIFcgYW5kIHNjYWxhckJpdHMgKi9cbnR5cGUgV09wdHMgPSB7XG4gIHdpbmRvd3M6IG51bWJlcjtcbiAgd2luZG93U2l6ZTogbnVtYmVyO1xuICBtYXNrOiBiaWdpbnQ7XG4gIG1heE51bWJlcjogbnVtYmVyO1xuICBzaGlmdEJ5OiBiaWdpbnQ7XG59O1xuXG5mdW5jdGlvbiBjYWxjV09wdHMoVzogbnVtYmVyLCBzY2FsYXJCaXRzOiBudW1iZXIpOiBXT3B0cyB7XG4gIHZhbGlkYXRlVyhXLCBzY2FsYXJCaXRzKTtcbiAgY29uc3Qgd2luZG93cyA9IE1hdGguY2VpbChzY2FsYXJCaXRzIC8gVykgKyAxOyAvLyBXPTggMzMuIE5vdCAzMiwgYmVjYXVzZSB3ZSBza2lwIHplcm9cbiAgY29uc3Qgd2luZG93U2l6ZSA9IDIgKiogKFcgLSAxKTsgLy8gVz04IDEyOC4gTm90IDI1NiwgYmVjYXVzZSB3ZSBza2lwIHplcm9cbiAgY29uc3QgbWF4TnVtYmVyID0gMiAqKiBXOyAvLyBXPTggMjU2XG4gIGNvbnN0IG1hc2sgPSBiaXRNYXNrKFcpOyAvLyBXPTggMjU1ID09IG1hc2sgMGIxMTExMTExMVxuICBjb25zdCBzaGlmdEJ5ID0gQmlnSW50KFcpOyAvLyBXPTggOFxuICByZXR1cm4geyB3aW5kb3dzLCB3aW5kb3dTaXplLCBtYXNrLCBtYXhOdW1iZXIsIHNoaWZ0QnkgfTtcbn1cblxuZnVuY3Rpb24gY2FsY09mZnNldHMobjogYmlnaW50LCB3aW5kb3c6IG51bWJlciwgd09wdHM6IFdPcHRzKSB7XG4gIGNvbnN0IHsgd2luZG93U2l6ZSwgbWFzaywgbWF4TnVtYmVyLCBzaGlmdEJ5IH0gPSB3T3B0cztcbiAgbGV0IHdiaXRzID0gTnVtYmVyKG4gJiBtYXNrKTsgLy8gZXh0cmFjdCBXIGJpdHMuXG4gIGxldCBuZXh0TiA9IG4gPj4gc2hpZnRCeTsgLy8gc2hpZnQgbnVtYmVyIGJ5IFcgYml0cy5cblxuICAvLyBXaGF0IGFjdHVhbGx5IGhhcHBlbnMgaGVyZTpcbiAgLy8gY29uc3QgaGlnaGVzdEJpdCA9IE51bWJlcihtYXNrIF4gKG1hc2sgPj4gMW4pKTtcbiAgLy8gbGV0IHdiaXRzMiA9IHdiaXRzIC0gMTsgLy8gc2tpcCB6ZXJvXG4gIC8vIGlmICh3Yml0czIgJiBoaWdoZXN0Qml0KSB7IHdiaXRzMiBePSBOdW1iZXIobWFzayk7IC8vICh+KTtcblxuICAvLyBzcGxpdCBpZiBiaXRzID4gbWF4OiArMjI0ID0+IDI1Ni0zMlxuICBpZiAod2JpdHMgPiB3aW5kb3dTaXplKSB7XG4gICAgLy8gd2Ugc2tpcCB6ZXJvLCB3aGljaCBtZWFucyBpbnN0ZWFkIG9mIGA+PSBzaXplLTFgLCB3ZSBkbyBgPiBzaXplYFxuICAgIHdiaXRzIC09IG1heE51bWJlcjsgLy8gLTMyLCBjYW4gYmUgbWF4TnVtYmVyIC0gd2JpdHMsIGJ1dCB0aGVuIHdlIG5lZWQgdG8gc2V0IGlzTmVnIGhlcmUuXG4gICAgbmV4dE4gKz0gXzFuOyAvLyArMjU2IChjYXJyeSlcbiAgfVxuICBjb25zdCBvZmZzZXRTdGFydCA9IHdpbmRvdyAqIHdpbmRvd1NpemU7XG4gIGNvbnN0IG9mZnNldCA9IG9mZnNldFN0YXJ0ICsgTWF0aC5hYnMod2JpdHMpIC0gMTsgLy8gLTEgYmVjYXVzZSB3ZSBza2lwIHplcm9cbiAgY29uc3QgaXNaZXJvID0gd2JpdHMgPT09IDA7IC8vIGlzIGN1cnJlbnQgd2luZG93IHNsaWNlIGEgMD9cbiAgY29uc3QgaXNOZWcgPSB3Yml0cyA8IDA7IC8vIGlzIGN1cnJlbnQgd2luZG93IHNsaWNlIG5lZ2F0aXZlP1xuICBjb25zdCBpc05lZ0YgPSB3aW5kb3cgJSAyICE9PSAwOyAvLyBmYWtlIHJhbmRvbSBzdGF0ZW1lbnQgZm9yIG5vaXNlXG4gIGNvbnN0IG9mZnNldEYgPSBvZmZzZXRTdGFydDsgLy8gZmFrZSBvZmZzZXQgZm9yIG5vaXNlXG4gIHJldHVybiB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcsIGlzTmVnRiwgb2Zmc2V0RiB9O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHM6IGFueVtdLCBjOiBhbnkpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHBvaW50cykpIHRocm93IG5ldyBFcnJvcignYXJyYXkgZXhwZWN0ZWQnKTtcbiAgcG9pbnRzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICBpZiAoIShwIGluc3RhbmNlb2YgYykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwb2ludCBhdCBpbmRleCAnICsgaSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnM6IGFueVtdLCBmaWVsZDogYW55KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY2FsYXJzKSkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBvZiBzY2FsYXJzIGV4cGVjdGVkJyk7XG4gIHNjYWxhcnMuZm9yRWFjaCgocywgaSkgPT4ge1xuICAgIGlmICghZmllbGQuaXNWYWxpZChzKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhciBhdCBpbmRleCAnICsgaSk7XG4gIH0pO1xufVxuXG4vLyBTaW5jZSBwb2ludHMgaW4gZGlmZmVyZW50IGdyb3VwcyBjYW5ub3QgYmUgZXF1YWwgKGRpZmZlcmVudCBvYmplY3QgY29uc3RydWN0b3IpLFxuLy8gd2UgY2FuIGhhdmUgc2luZ2xlIHBsYWNlIHRvIHN0b3JlIHByZWNvbXB1dGVzLlxuLy8gQWxsb3dzIHRvIG1ha2UgcG9pbnRzIGZyb3plbiAvIGltbXV0YWJsZS5cbmNvbnN0IHBvaW50UHJlY29tcHV0ZXMgPSBuZXcgV2Vha01hcDxhbnksIGFueVtdPigpO1xuY29uc3QgcG9pbnRXaW5kb3dTaXplcyA9IG5ldyBXZWFrTWFwPGFueSwgbnVtYmVyPigpO1xuXG5mdW5jdGlvbiBnZXRXKFA6IGFueSk6IG51bWJlciB7XG4gIC8vIFRvIGRpc2FibGUgcHJlY29tcHV0ZXM6XG4gIC8vIHJldHVybiAxO1xuICByZXR1cm4gcG9pbnRXaW5kb3dTaXplcy5nZXQoUCkgfHwgMTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0MChuOiBiaWdpbnQpOiB2b2lkIHtcbiAgaWYgKG4gIT09IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHdOQUYnKTtcbn1cblxuLyoqXG4gKiBFbGxpcHRpYyBjdXJ2ZSBtdWx0aXBsaWNhdGlvbiBvZiBQb2ludCBieSBzY2FsYXIuIEZyYWdpbGUuXG4gKiBUYWJsZSBnZW5lcmF0aW9uIHRha2VzICoqMzBNQiBvZiByYW0gYW5kIDEwbXMgb24gaGlnaC1lbmQgQ1BVKiosXG4gKiBidXQgbWF5IHRha2UgbXVjaCBsb25nZXIgb24gc2xvdyBkZXZpY2VzLiBBY3R1YWwgZ2VuZXJhdGlvbiB3aWxsIGhhcHBlbiBvblxuICogZmlyc3QgY2FsbCBvZiBgbXVsdGlwbHkoKWAuIEJ5IGRlZmF1bHQsIGBCQVNFYCBwb2ludCBpcyBwcmVjb21wdXRlZC5cbiAqXG4gKiBTY2FsYXJzIHNob3VsZCBhbHdheXMgYmUgbGVzcyB0aGFuIGN1cnZlIG9yZGVyOiB0aGlzIHNob3VsZCBiZSBjaGVja2VkIGluc2lkZSBvZiBhIGN1cnZlIGl0c2VsZi5cbiAqIENyZWF0ZXMgcHJlY29tcHV0YXRpb24gdGFibGVzIGZvciBmYXN0IG11bHRpcGxpY2F0aW9uOlxuICogLSBwcml2YXRlIHNjYWxhciBpcyBzcGxpdCBieSBmaXhlZCBzaXplIHdpbmRvd3Mgb2YgVyBiaXRzXG4gKiAtIGV2ZXJ5IHdpbmRvdyBwb2ludCBpcyBjb2xsZWN0ZWQgZnJvbSB3aW5kb3cncyB0YWJsZSAmIGFkZGVkIHRvIGFjY3VtdWxhdG9yXG4gKiAtIHNpbmNlIHdpbmRvd3MgYXJlIGRpZmZlcmVudCwgc2FtZSBwb2ludCBpbnNpZGUgdGFibGVzIHdvbid0IGJlIGFjY2Vzc2VkIG1vcmUgdGhhbiBvbmNlIHBlciBjYWxjXG4gKiAtIGVhY2ggbXVsdGlwbGljYXRpb24gaXMgJ01hdGguY2VpbChDVVJWRV9PUkRFUiAvIFx1RDgzNVx1REM0QSkgKyAxJyBwb2ludCBhZGRpdGlvbnMgKGZpeGVkIGZvciBhbnkgc2NhbGFyKVxuICogLSArMSB3aW5kb3cgaXMgbmVjY2Vzc2FyeSBmb3Igd05BRlxuICogLSB3TkFGIHJlZHVjZXMgdGFibGUgc2l6ZTogMnggbGVzcyBtZW1vcnkgKyAyeCBmYXN0ZXIgZ2VuZXJhdGlvbiwgYnV0IDEwJSBzbG93ZXIgbXVsdGlwbGljYXRpb25cbiAqXG4gKiBAdG9kbyBSZXNlYXJjaCByZXR1cm5pbmcgMmQgSlMgYXJyYXkgb2Ygd2luZG93cywgaW5zdGVhZCBvZiBhIHNpbmdsZSB3aW5kb3cuXG4gKiBUaGlzIHdvdWxkIGFsbG93IHdpbmRvd3MgdG8gYmUgaW4gZGlmZmVyZW50IG1lbW9yeSBsb2NhdGlvbnNcbiAqL1xuZXhwb3J0IGNsYXNzIHdOQUY8UEMgZXh0ZW5kcyBQQ19BTlk+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBCQVNFOiBQQ19QPFBDPjtcbiAgcHJpdmF0ZSByZWFkb25seSBaRVJPOiBQQ19QPFBDPjtcbiAgcHJpdmF0ZSByZWFkb25seSBGbjogUENbJ0ZuJ107XG4gIHJlYWRvbmx5IGJpdHM6IG51bWJlcjtcblxuICAvLyBQYXJhbWV0cml6ZWQgd2l0aCBhIGdpdmVuIFBvaW50IGNsYXNzIChub3QgaW5kaXZpZHVhbCBwb2ludClcbiAgY29uc3RydWN0b3IoUG9pbnQ6IFBDLCBiaXRzOiBudW1iZXIpIHtcbiAgICB0aGlzLkJBU0UgPSBQb2ludC5CQVNFO1xuICAgIHRoaXMuWkVSTyA9IFBvaW50LlpFUk87XG4gICAgdGhpcy5GbiA9IFBvaW50LkZuO1xuICAgIHRoaXMuYml0cyA9IGJpdHM7XG4gIH1cblxuICAvLyBub24tY29uc3QgdGltZSBtdWx0aXBsaWNhdGlvbiBsYWRkZXJcbiAgX3Vuc2FmZUxhZGRlcihlbG06IFBDX1A8UEM+LCBuOiBiaWdpbnQsIHA6IFBDX1A8UEM+ID0gdGhpcy5aRVJPKTogUENfUDxQQz4ge1xuICAgIGxldCBkOiBQQ19QPFBDPiA9IGVsbTtcbiAgICB3aGlsZSAobiA+IF8wbikge1xuICAgICAgaWYgKG4gJiBfMW4pIHAgPSBwLmFkZChkKTtcbiAgICAgIGQgPSBkLmRvdWJsZSgpO1xuICAgICAgbiA+Pj0gXzFuO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgd05BRiBwcmVjb21wdXRhdGlvbiB3aW5kb3cuIFVzZWQgZm9yIGNhY2hpbmcuXG4gICAqIERlZmF1bHQgd2luZG93IHNpemUgaXMgc2V0IGJ5IGB1dGlscy5wcmVjb21wdXRlKClgIGFuZCBpcyBlcXVhbCB0byA4LlxuICAgKiBOdW1iZXIgb2YgcHJlY29tcHV0ZWQgcG9pbnRzIGRlcGVuZHMgb24gdGhlIGN1cnZlIHNpemU6XG4gICAqIDJeKFx1RDgzNVx1REM0QVx1MjIxMjEpICogKE1hdGguY2VpbChcdUQ4MzVcdURDNUIgLyBcdUQ4MzVcdURDNEEpICsgMSksIHdoZXJlOlxuICAgKiAtIFx1RDgzNVx1REM0QSBpcyB0aGUgd2luZG93IHNpemVcbiAgICogLSBcdUQ4MzVcdURDNUIgaXMgdGhlIGJpdGxlbmd0aCBvZiB0aGUgY3VydmUgb3JkZXIuXG4gICAqIEZvciBhIDI1Ni1iaXQgY3VydmUgYW5kIHdpbmRvdyBzaXplIDgsIHRoZSBudW1iZXIgb2YgcHJlY29tcHV0ZWQgcG9pbnRzIGlzIDEyOCAqIDMzID0gNDIyNC5cbiAgICogQHBhcmFtIHBvaW50IFBvaW50IGluc3RhbmNlXG4gICAqIEBwYXJhbSBXIHdpbmRvdyBzaXplXG4gICAqIEByZXR1cm5zIHByZWNvbXB1dGVkIHBvaW50IHRhYmxlcyBmbGF0dGVuZWQgdG8gYSBzaW5nbGUgYXJyYXlcbiAgICovXG4gIHByaXZhdGUgcHJlY29tcHV0ZVdpbmRvdyhwb2ludDogUENfUDxQQz4sIFc6IG51bWJlcik6IFBDX1A8UEM+W10ge1xuICAgIGNvbnN0IHsgd2luZG93cywgd2luZG93U2l6ZSB9ID0gY2FsY1dPcHRzKFcsIHRoaXMuYml0cyk7XG4gICAgY29uc3QgcG9pbnRzOiBQQ19QPFBDPltdID0gW107XG4gICAgbGV0IHA6IFBDX1A8UEM+ID0gcG9pbnQ7XG4gICAgbGV0IGJhc2UgPSBwO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICBiYXNlID0gcDtcbiAgICAgIHBvaW50cy5wdXNoKGJhc2UpO1xuICAgICAgLy8gaT0xLCBiYyB3ZSBza2lwIDBcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgd2luZG93U2l6ZTsgaSsrKSB7XG4gICAgICAgIGJhc2UgPSBiYXNlLmFkZChwKTtcbiAgICAgICAgcG9pbnRzLnB1c2goYmFzZSk7XG4gICAgICB9XG4gICAgICBwID0gYmFzZS5kb3VibGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGVjIG11bHRpcGxpY2F0aW9uIHVzaW5nIHByZWNvbXB1dGVkIHRhYmxlcyBhbmQgdy1hcnkgbm9uLWFkamFjZW50IGZvcm0uXG4gICAqIE1vcmUgY29tcGFjdCBpbXBsZW1lbnRhdGlvbjpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BhdWxtaWxsci9ub2JsZS1zZWNwMjU2azEvYmxvYi80N2NiMTY2OWI2ZTUwNmFkNjZiMzVmZTdkNzYxMzJhZTk3NDY1ZGEyL2luZGV4LnRzI0w1MDItTDU0MVxuICAgKiBAcmV0dXJucyByZWFsIGFuZCBmYWtlIChmb3IgY29uc3QtdGltZSkgcG9pbnRzXG4gICAqL1xuICBwcml2YXRlIHdOQUYoVzogbnVtYmVyLCBwcmVjb21wdXRlczogUENfUDxQQz5bXSwgbjogYmlnaW50KTogeyBwOiBQQ19QPFBDPjsgZjogUENfUDxQQz4gfSB7XG4gICAgLy8gU2NhbGFyIHNob3VsZCBiZSBzbWFsbGVyIHRoYW4gZmllbGQgb3JkZXJcbiAgICBpZiAoIXRoaXMuRm4uaXNWYWxpZChuKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcicpO1xuICAgIC8vIEFjY3VtdWxhdG9yc1xuICAgIGxldCBwID0gdGhpcy5aRVJPO1xuICAgIGxldCBmID0gdGhpcy5CQVNFO1xuICAgIC8vIFRoaXMgY29kZSB3YXMgZmlyc3Qgd3JpdHRlbiB3aXRoIGFzc3VtcHRpb24gdGhhdCAnZicgYW5kICdwJyB3aWxsIG5ldmVyIGJlIGluZmluaXR5IHBvaW50OlxuICAgIC8vIHNpbmNlIGVhY2ggYWRkaXRpb24gaXMgbXVsdGlwbGllZCBieSAyICoqIFcsIGl0IGNhbm5vdCBjYW5jZWwgZWFjaCBvdGhlci4gSG93ZXZlcixcbiAgICAvLyB0aGVyZSBpcyBuZWdhdGUgbm93OiBpdCBpcyBwb3NzaWJsZSB0aGF0IG5lZ2F0ZWQgZWxlbWVudCBmcm9tIGxvdyB2YWx1ZVxuICAgIC8vIHdvdWxkIGJlIHRoZSBzYW1lIGFzIGhpZ2ggZWxlbWVudCwgd2hpY2ggd2lsbCBjcmVhdGUgY2FycnkgaW50byBuZXh0IHdpbmRvdy5cbiAgICAvLyBJdCdzIG5vdCBvYnZpb3VzIGhvdyB0aGlzIGNhbiBmYWlsLCBidXQgc3RpbGwgd29ydGggaW52ZXN0aWdhdGluZyBsYXRlci5cbiAgICBjb25zdCB3byA9IGNhbGNXT3B0cyhXLCB0aGlzLmJpdHMpO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdvLndpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICAvLyAobiA9PT0gXzBuKSBpcyBoYW5kbGVkIGFuZCBub3QgZWFybHktZXhpdGVkLiBpc0V2ZW4gYW5kIG9mZnNldEYgYXJlIHVzZWQgZm9yIG5vaXNlXG4gICAgICBjb25zdCB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcsIGlzTmVnRiwgb2Zmc2V0RiB9ID0gY2FsY09mZnNldHMobiwgd2luZG93LCB3byk7XG4gICAgICBuID0gbmV4dE47XG4gICAgICBpZiAoaXNaZXJvKSB7XG4gICAgICAgIC8vIGJpdHMgYXJlIDA6IGFkZCBnYXJiYWdlIHRvIGZha2UgcG9pbnRcbiAgICAgICAgLy8gSW1wb3J0YW50IHBhcnQgZm9yIGNvbnN0LXRpbWUgZ2V0UHVibGljS2V5OiBhZGQgcmFuZG9tIFwibm9pc2VcIiBwb2ludCB0byBmLlxuICAgICAgICBmID0gZi5hZGQobmVnYXRlQ3QoaXNOZWdGLCBwcmVjb21wdXRlc1tvZmZzZXRGXSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYml0cyBhcmUgMTogYWRkIHRvIHJlc3VsdCBwb2ludFxuICAgICAgICBwID0gcC5hZGQobmVnYXRlQ3QoaXNOZWcsIHByZWNvbXB1dGVzW29mZnNldF0pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXNzZXJ0MChuKTtcbiAgICAvLyBSZXR1cm4gYm90aCByZWFsIGFuZCBmYWtlIHBvaW50czogSklUIHdvbid0IGVsaW1pbmF0ZSBmLlxuICAgIC8vIEF0IHRoaXMgcG9pbnQgdGhlcmUgaXMgYSB3YXkgdG8gRiBiZSBpbmZpbml0eS1wb2ludCBldmVuIGlmIHAgaXMgbm90LFxuICAgIC8vIHdoaWNoIG1ha2VzIGl0IGxlc3MgY29uc3QtdGltZTogYXJvdW5kIDEgYmlnaW50IG11bHRpcGx5LlxuICAgIHJldHVybiB7IHAsIGYgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGVjIHVuc2FmZSAobm9uIGNvbnN0LXRpbWUpIG11bHRpcGxpY2F0aW9uIHVzaW5nIHByZWNvbXB1dGVkIHRhYmxlcyBhbmQgdy1hcnkgbm9uLWFkamFjZW50IGZvcm0uXG4gICAqIEBwYXJhbSBhY2MgYWNjdW11bGF0b3IgcG9pbnQgdG8gYWRkIHJlc3VsdCBvZiBtdWx0aXBsaWNhdGlvblxuICAgKiBAcmV0dXJucyBwb2ludFxuICAgKi9cbiAgcHJpdmF0ZSB3TkFGVW5zYWZlKFxuICAgIFc6IG51bWJlcixcbiAgICBwcmVjb21wdXRlczogUENfUDxQQz5bXSxcbiAgICBuOiBiaWdpbnQsXG4gICAgYWNjOiBQQ19QPFBDPiA9IHRoaXMuWkVST1xuICApOiBQQ19QPFBDPiB7XG4gICAgY29uc3Qgd28gPSBjYWxjV09wdHMoVywgdGhpcy5iaXRzKTtcbiAgICBmb3IgKGxldCB3aW5kb3cgPSAwOyB3aW5kb3cgPCB3by53aW5kb3dzOyB3aW5kb3crKykge1xuICAgICAgaWYgKG4gPT09IF8wbikgYnJlYWs7IC8vIEVhcmx5LWV4aXQsIHNraXAgMCB2YWx1ZVxuICAgICAgY29uc3QgeyBuZXh0Tiwgb2Zmc2V0LCBpc1plcm8sIGlzTmVnIH0gPSBjYWxjT2Zmc2V0cyhuLCB3aW5kb3csIHdvKTtcbiAgICAgIG4gPSBuZXh0TjtcbiAgICAgIGlmIChpc1plcm8pIHtcbiAgICAgICAgLy8gV2luZG93IGJpdHMgYXJlIDA6IHNraXAgcHJvY2Vzc2luZy5cbiAgICAgICAgLy8gTW92ZSB0byBuZXh0IHdpbmRvdy5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBpdGVtID0gcHJlY29tcHV0ZXNbb2Zmc2V0XTtcbiAgICAgICAgYWNjID0gYWNjLmFkZChpc05lZyA/IGl0ZW0ubmVnYXRlKCkgOiBpdGVtKTsgLy8gUmUtdXNpbmcgYWNjIGFsbG93cyB0byBzYXZlIGFkZHMgaW4gTVNNXG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydDAobik7XG4gICAgcmV0dXJuIGFjYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJlY29tcHV0ZXMoVzogbnVtYmVyLCBwb2ludDogUENfUDxQQz4sIHRyYW5zZm9ybT86IE1hcHBlcjxQQ19QPFBDPj4pOiBQQ19QPFBDPltdIHtcbiAgICAvLyBDYWxjdWxhdGUgcHJlY29tcHV0ZXMgb24gYSBmaXJzdCBydW4sIHJldXNlIHRoZW0gYWZ0ZXJcbiAgICBsZXQgY29tcCA9IHBvaW50UHJlY29tcHV0ZXMuZ2V0KHBvaW50KTtcbiAgICBpZiAoIWNvbXApIHtcbiAgICAgIGNvbXAgPSB0aGlzLnByZWNvbXB1dGVXaW5kb3cocG9pbnQsIFcpIGFzIFBDX1A8UEM+W107XG4gICAgICBpZiAoVyAhPT0gMSkge1xuICAgICAgICAvLyBEb2luZyB0cmFuc2Zvcm0gb3V0c2lkZSBvZiBpZiBicmluZ3MgMTUlIHBlcmYgaGl0XG4gICAgICAgIGlmICh0eXBlb2YgdHJhbnNmb3JtID09PSAnZnVuY3Rpb24nKSBjb21wID0gdHJhbnNmb3JtKGNvbXApO1xuICAgICAgICBwb2ludFByZWNvbXB1dGVzLnNldChwb2ludCwgY29tcCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21wO1xuICB9XG5cbiAgY2FjaGVkKFxuICAgIHBvaW50OiBQQ19QPFBDPixcbiAgICBzY2FsYXI6IGJpZ2ludCxcbiAgICB0cmFuc2Zvcm0/OiBNYXBwZXI8UENfUDxQQz4+XG4gICk6IHsgcDogUENfUDxQQz47IGY6IFBDX1A8UEM+IH0ge1xuICAgIGNvbnN0IFcgPSBnZXRXKHBvaW50KTtcbiAgICByZXR1cm4gdGhpcy53TkFGKFcsIHRoaXMuZ2V0UHJlY29tcHV0ZXMoVywgcG9pbnQsIHRyYW5zZm9ybSksIHNjYWxhcik7XG4gIH1cblxuICB1bnNhZmUocG9pbnQ6IFBDX1A8UEM+LCBzY2FsYXI6IGJpZ2ludCwgdHJhbnNmb3JtPzogTWFwcGVyPFBDX1A8UEM+PiwgcHJldj86IFBDX1A8UEM+KTogUENfUDxQQz4ge1xuICAgIGNvbnN0IFcgPSBnZXRXKHBvaW50KTtcbiAgICBpZiAoVyA9PT0gMSkgcmV0dXJuIHRoaXMuX3Vuc2FmZUxhZGRlcihwb2ludCwgc2NhbGFyLCBwcmV2KTsgLy8gRm9yIFc9MSBsYWRkZXIgaXMgfngyIGZhc3RlclxuICAgIHJldHVybiB0aGlzLndOQUZVbnNhZmUoVywgdGhpcy5nZXRQcmVjb21wdXRlcyhXLCBwb2ludCwgdHJhbnNmb3JtKSwgc2NhbGFyLCBwcmV2KTtcbiAgfVxuXG4gIC8vIFdlIGNhbGN1bGF0ZSBwcmVjb21wdXRlcyBmb3IgZWxsaXB0aWMgY3VydmUgcG9pbnQgbXVsdGlwbGljYXRpb25cbiAgLy8gdXNpbmcgd2luZG93ZWQgbWV0aG9kLiBUaGlzIHNwZWNpZmllcyB3aW5kb3cgc2l6ZSBhbmRcbiAgLy8gc3RvcmVzIHByZWNvbXB1dGVkIHZhbHVlcy4gVXN1YWxseSBvbmx5IGJhc2UgcG9pbnQgd291bGQgYmUgcHJlY29tcHV0ZWQuXG4gIGNyZWF0ZUNhY2hlKFA6IFBDX1A8UEM+LCBXOiBudW1iZXIpOiB2b2lkIHtcbiAgICB2YWxpZGF0ZVcoVywgdGhpcy5iaXRzKTtcbiAgICBwb2ludFdpbmRvd1NpemVzLnNldChQLCBXKTtcbiAgICBwb2ludFByZWNvbXB1dGVzLmRlbGV0ZShQKTtcbiAgfVxuXG4gIGhhc0NhY2hlKGVsbTogUENfUDxQQz4pOiBib29sZWFuIHtcbiAgICByZXR1cm4gZ2V0VyhlbG0pICE9PSAxO1xuICB9XG59XG5cbi8qKlxuICogRW5kb21vcnBoaXNtLXNwZWNpZmljIG11bHRpcGxpY2F0aW9uIGZvciBLb2JsaXR6IGN1cnZlcy5cbiAqIENvc3Q6IDEyOCBkYmwsIDAtMjU2IGFkZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWxFbmRvVW5zYWZlPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBQb2ludDogUEMsXG4gIHBvaW50OiBQLFxuICBrMTogYmlnaW50LFxuICBrMjogYmlnaW50XG4pOiB7IHAxOiBQOyBwMjogUCB9IHtcbiAgbGV0IGFjYyA9IHBvaW50O1xuICBsZXQgcDEgPSBQb2ludC5aRVJPO1xuICBsZXQgcDIgPSBQb2ludC5aRVJPO1xuICB3aGlsZSAoazEgPiBfMG4gfHwgazIgPiBfMG4pIHtcbiAgICBpZiAoazEgJiBfMW4pIHAxID0gcDEuYWRkKGFjYyk7XG4gICAgaWYgKGsyICYgXzFuKSBwMiA9IHAyLmFkZChhY2MpO1xuICAgIGFjYyA9IGFjYy5kb3VibGUoKTtcbiAgICBrMSA+Pj0gXzFuO1xuICAgIGsyID4+PSBfMW47XG4gIH1cbiAgcmV0dXJuIHsgcDEsIHAyIH07XG59XG5cbi8qKlxuICogUGlwcGVuZ2VyIGFsZ29yaXRobSBmb3IgbXVsdGktc2NhbGFyIG11bHRpcGxpY2F0aW9uIChNU00sIFBhICsgUWIgKyBSYyArIC4uLikuXG4gKiAzMHggZmFzdGVyIHZzIG5haXZlIGFkZGl0aW9uIG9uIEw9NDA5NiwgMTB4IGZhc3RlciB0aGFuIHByZWNvbXB1dGVzLlxuICogRm9yIE49MjU0Yml0LCBMPTEsIGl0IGRvZXM6IDEwMjQgQUREICsgMjU0IERCTC4gRm9yIEw9NTogMTUzNiBBREQgKyAyNTQgREJMLlxuICogQWxnb3JpdGhtaWNhbGx5IGNvbnN0YW50LXRpbWUgKGZvciBzYW1lIEwpLCBldmVuIHdoZW4gMSBwb2ludCArIHNjYWxhciwgb3Igd2hlbiBzY2FsYXIgPSAwLlxuICogQHBhcmFtIGMgQ3VydmUgUG9pbnQgY29uc3RydWN0b3JcbiAqIEBwYXJhbSBmaWVsZE4gZmllbGQgb3ZlciBDVVJWRS5OIC0gaW1wb3J0YW50IHRoYXQgaXQncyBub3Qgb3ZlciBDVVJWRS5QXG4gKiBAcGFyYW0gcG9pbnRzIGFycmF5IG9mIEwgY3VydmUgcG9pbnRzXG4gKiBAcGFyYW0gc2NhbGFycyBhcnJheSBvZiBMIHNjYWxhcnMgKGFrYSBzZWNyZXQga2V5cyAvIGJpZ2ludHMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaXBwZW5nZXI8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIGM6IFBDLFxuICBwb2ludHM6IFBbXSxcbiAgc2NhbGFyczogYmlnaW50W11cbik6IFAge1xuICAvLyBJZiB3ZSBzcGxpdCBzY2FsYXJzIGJ5IHNvbWUgd2luZG93IChsZXQncyBzYXkgOCBiaXRzKSwgZXZlcnkgY2h1bmsgd2lsbCBvbmx5XG4gIC8vIHRha2UgMjU2IGJ1Y2tldHMgZXZlbiBpZiB0aGVyZSBhcmUgNDA5NiBzY2FsYXJzLCBhbHNvIHJlLXVzZXMgZG91YmxlLlxuICAvLyBUT0RPOlxuICAvLyAtIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMjQvNzUwLnBkZlxuICAvLyAtIGh0dHBzOi8vdGNoZXMuaWFjci5vcmcvaW5kZXgucGhwL1RDSEVTL2FydGljbGUvdmlldy8xMDI4N1xuICAvLyAwIGlzIGFjY2VwdGVkIGluIHNjYWxhcnNcbiAgY29uc3QgZmllbGROID0gYy5GbjtcbiAgdmFsaWRhdGVNU01Qb2ludHMocG9pbnRzLCBjKTtcbiAgdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnMsIGZpZWxkTik7XG4gIGNvbnN0IHBsZW5ndGggPSBwb2ludHMubGVuZ3RoO1xuICBjb25zdCBzbGVuZ3RoID0gc2NhbGFycy5sZW5ndGg7XG4gIGlmIChwbGVuZ3RoICE9PSBzbGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5cyBvZiBwb2ludHMgYW5kIHNjYWxhcnMgbXVzdCBoYXZlIGVxdWFsIGxlbmd0aCcpO1xuICAvLyBpZiAocGxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBtdXN0IGJlIG9mIGxlbmd0aCA+PSAyJyk7XG4gIGNvbnN0IHplcm8gPSBjLlpFUk87XG4gIGNvbnN0IHdiaXRzID0gYml0TGVuKEJpZ0ludChwbGVuZ3RoKSk7XG4gIGxldCB3aW5kb3dTaXplID0gMTsgLy8gYml0c1xuICBpZiAod2JpdHMgPiAxMikgd2luZG93U2l6ZSA9IHdiaXRzIC0gMztcbiAgZWxzZSBpZiAod2JpdHMgPiA0KSB3aW5kb3dTaXplID0gd2JpdHMgLSAyO1xuICBlbHNlIGlmICh3Yml0cyA+IDApIHdpbmRvd1NpemUgPSAyO1xuICBjb25zdCBNQVNLID0gYml0TWFzayh3aW5kb3dTaXplKTtcbiAgY29uc3QgYnVja2V0cyA9IG5ldyBBcnJheShOdW1iZXIoTUFTSykgKyAxKS5maWxsKHplcm8pOyAvLyArMSBmb3IgemVybyBhcnJheVxuICBjb25zdCBsYXN0Qml0cyA9IE1hdGguZmxvb3IoKGZpZWxkTi5CSVRTIC0gMSkgLyB3aW5kb3dTaXplKSAqIHdpbmRvd1NpemU7XG4gIGxldCBzdW0gPSB6ZXJvO1xuICBmb3IgKGxldCBpID0gbGFzdEJpdHM7IGkgPj0gMDsgaSAtPSB3aW5kb3dTaXplKSB7XG4gICAgYnVja2V0cy5maWxsKHplcm8pO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2xlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBzY2FsYXIgPSBzY2FsYXJzW2pdO1xuICAgICAgY29uc3Qgd2JpdHMgPSBOdW1iZXIoKHNjYWxhciA+PiBCaWdJbnQoaSkpICYgTUFTSyk7XG4gICAgICBidWNrZXRzW3diaXRzXSA9IGJ1Y2tldHNbd2JpdHNdLmFkZChwb2ludHNbal0pO1xuICAgIH1cbiAgICBsZXQgcmVzSSA9IHplcm87IC8vIG5vdCB1c2luZyB0aGlzIHdpbGwgZG8gc21hbGwgc3BlZWQtdXAsIGJ1dCB3aWxsIGxvc2UgY3RcbiAgICAvLyBTa2lwIGZpcnN0IGJ1Y2tldCwgYmVjYXVzZSBpdCBpcyB6ZXJvXG4gICAgZm9yIChsZXQgaiA9IGJ1Y2tldHMubGVuZ3RoIC0gMSwgc3VtSSA9IHplcm87IGogPiAwOyBqLS0pIHtcbiAgICAgIHN1bUkgPSBzdW1JLmFkZChidWNrZXRzW2pdKTtcbiAgICAgIHJlc0kgPSByZXNJLmFkZChzdW1JKTtcbiAgICB9XG4gICAgc3VtID0gc3VtLmFkZChyZXNJKTtcbiAgICBpZiAoaSAhPT0gMCkgZm9yIChsZXQgaiA9IDA7IGogPCB3aW5kb3dTaXplOyBqKyspIHN1bSA9IHN1bS5kb3VibGUoKTtcbiAgfVxuICByZXR1cm4gc3VtIGFzIFA7XG59XG4vKipcbiAqIFByZWNvbXB1dGVkIG11bHRpLXNjYWxhciBtdWx0aXBsaWNhdGlvbiAoTVNNLCBQYSArIFFiICsgUmMgKyAuLi4pLlxuICogQHBhcmFtIGMgQ3VydmUgUG9pbnQgY29uc3RydWN0b3JcbiAqIEBwYXJhbSBmaWVsZE4gZmllbGQgb3ZlciBDVVJWRS5OIC0gaW1wb3J0YW50IHRoYXQgaXQncyBub3Qgb3ZlciBDVVJWRS5QXG4gKiBAcGFyYW0gcG9pbnRzIGFycmF5IG9mIEwgY3VydmUgcG9pbnRzXG4gKiBAcmV0dXJucyBmdW5jdGlvbiB3aGljaCBtdWx0aXBsaWVzIHBvaW50cyB3aXRoIHNjYWFyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJlY29tcHV0ZU1TTVVuc2FmZTxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgYzogUEMsXG4gIHBvaW50czogUFtdLFxuICB3aW5kb3dTaXplOiBudW1iZXJcbik6IChzY2FsYXJzOiBiaWdpbnRbXSkgPT4gUCB7XG4gIC8qKlxuICAgKiBQZXJmb3JtYW5jZSBBbmFseXNpcyBvZiBXaW5kb3ctYmFzZWQgUHJlY29tcHV0YXRpb25cbiAgICpcbiAgICogQmFzZSBDYXNlICgyNTYtYml0IHNjYWxhciwgOC1iaXQgd2luZG93KTpcbiAgICogLSBTdGFuZGFyZCBwcmVjb21wdXRhdGlvbiByZXF1aXJlczpcbiAgICogICAtIDMxIGFkZGl0aW9ucyBwZXIgc2NhbGFyIFx1MDBENyAyNTYgc2NhbGFycyA9IDcsOTM2IG9wc1xuICAgKiAgIC0gUGx1cyAyNTUgc3VtbWFyeSBhZGRpdGlvbnMgPSA4LDE5MSB0b3RhbCBvcHNcbiAgICogICBOb3RlOiBTdW1tYXJ5IGFkZGl0aW9ucyBjYW4gYmUgb3B0aW1pemVkIHZpYSBhY2N1bXVsYXRvclxuICAgKlxuICAgKiBDaHVua2VkIFByZWNvbXB1dGF0aW9uIEFuYWx5c2lzOlxuICAgKiAtIFVzaW5nIDMyIGNodW5rcyByZXF1aXJlczpcbiAgICogICAtIDI1NSBhZGRpdGlvbnMgcGVyIGNodW5rXG4gICAqICAgLSAyNTYgZG91YmxpbmdzXG4gICAqICAgLSBUb3RhbDogKDI1NSBcdTAwRDcgMzIpICsgMjU2ID0gOCw0MTYgb3BzXG4gICAqXG4gICAqIE1lbW9yeSBVc2FnZSBDb21wYXJpc29uOlxuICAgKiBXaW5kb3cgU2l6ZSB8IFN0YW5kYXJkIFBvaW50cyB8IENodW5rZWQgUG9pbnRzXG4gICAqIC0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS1cbiAgICogICAgIDQtYml0ICAgfCAgICAgNTIwICAgICAgICAgfCAgICAgIDE1XG4gICAqICAgICA4LWJpdCAgIHwgICAgNCwyMjQgICAgICAgIHwgICAgIDI1NVxuICAgKiAgICAxMC1iaXQgICB8ICAgMTMsODI0ICAgICAgICB8ICAgMSwwMjNcbiAgICogICAgMTYtYml0ICAgfCAgNTU3LDA1NiAgICAgICAgfCAgNjUsNTM1XG4gICAqXG4gICAqIEtleSBBZHZhbnRhZ2VzOlxuICAgKiAxLiBFbmFibGVzIGxhcmdlciB3aW5kb3cgc2l6ZXMgZHVlIHRvIHJlZHVjZWQgbWVtb3J5IG92ZXJoZWFkXG4gICAqIDIuIE1vcmUgZWZmaWNpZW50IGZvciBzbWFsbGVyIHNjYWxhciBjb3VudHM6XG4gICAqICAgIC0gMTYgY2h1bmtzOiAoMTYgXHUwMEQ3IDI1NSkgKyAyNTYgPSA0LDMzNiBvcHNcbiAgICogICAgLSB+MnggZmFzdGVyIHRoYW4gc3RhbmRhcmQgOCwxOTEgb3BzXG4gICAqXG4gICAqIExpbWl0YXRpb25zOlxuICAgKiAtIE5vdCBzdWl0YWJsZSBmb3IgcGxhaW4gcHJlY29tcHV0ZXMgKHJlcXVpcmVzIDI1NiBjb25zdGFudCBkb3VibGluZ3MpXG4gICAqIC0gUGVyZm9ybWFuY2UgZGVncmFkZXMgd2l0aCBsYXJnZXIgc2NhbGFyIGNvdW50czpcbiAgICogICAtIE9wdGltYWwgZm9yIH4yNTYgc2NhbGFyc1xuICAgKiAgIC0gTGVzcyBlZmZpY2llbnQgZm9yIDQwOTYrIHNjYWxhcnMgKFBpcHBlbmdlciBwcmVmZXJyZWQpXG4gICAqL1xuICBjb25zdCBmaWVsZE4gPSBjLkZuO1xuICB2YWxpZGF0ZVcod2luZG93U2l6ZSwgZmllbGROLkJJVFMpO1xuICB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHMsIGMpO1xuICBjb25zdCB6ZXJvID0gYy5aRVJPO1xuICBjb25zdCB0YWJsZVNpemUgPSAyICoqIHdpbmRvd1NpemUgLSAxOyAvLyB0YWJsZSBzaXplICh3aXRob3V0IHplcm8pXG4gIGNvbnN0IGNodW5rcyA9IE1hdGguY2VpbChmaWVsZE4uQklUUyAvIHdpbmRvd1NpemUpOyAvLyBjaHVua3Mgb2YgaXRlbVxuICBjb25zdCBNQVNLID0gYml0TWFzayh3aW5kb3dTaXplKTtcbiAgY29uc3QgdGFibGVzID0gcG9pbnRzLm1hcCgocDogUCkgPT4ge1xuICAgIGNvbnN0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBhY2MgPSBwOyBpIDwgdGFibGVTaXplOyBpKyspIHtcbiAgICAgIHJlcy5wdXNoKGFjYyk7XG4gICAgICBhY2MgPSBhY2MuYWRkKHApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbiAgcmV0dXJuIChzY2FsYXJzOiBiaWdpbnRbXSk6IFAgPT4ge1xuICAgIHZhbGlkYXRlTVNNU2NhbGFycyhzY2FsYXJzLCBmaWVsZE4pO1xuICAgIGlmIChzY2FsYXJzLmxlbmd0aCA+IHBvaW50cy5sZW5ndGgpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG9mIHNjYWxhcnMgbXVzdCBiZSBzbWFsbGVyIHRoYW4gYXJyYXkgb2YgcG9pbnRzJyk7XG4gICAgbGV0IHJlcyA9IHplcm87XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3M7IGkrKykge1xuICAgICAgLy8gTm8gbmVlZCB0byBkb3VibGUgaWYgYWNjdW11bGF0b3IgaXMgc3RpbGwgemVyby5cbiAgICAgIGlmIChyZXMgIT09IHplcm8pIGZvciAobGV0IGogPSAwOyBqIDwgd2luZG93U2l6ZTsgaisrKSByZXMgPSByZXMuZG91YmxlKCk7XG4gICAgICBjb25zdCBzaGlmdEJ5ID0gQmlnSW50KGNodW5rcyAqIHdpbmRvd1NpemUgLSAoaSArIDEpICogd2luZG93U2l6ZSk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNjYWxhcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgbiA9IHNjYWxhcnNbal07XG4gICAgICAgIGNvbnN0IGN1cnIgPSBOdW1iZXIoKG4gPj4gc2hpZnRCeSkgJiBNQVNLKTtcbiAgICAgICAgaWYgKCFjdXJyKSBjb250aW51ZTsgLy8gc2tpcCB6ZXJvIHNjYWxhcnMgY2h1bmtzXG4gICAgICAgIHJlcyA9IHJlcy5hZGQodGFibGVzW2pdW2N1cnIgLSAxXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFZhbGlkQ3VydmVQYXJhbXM8VD4gPSB7XG4gIHA6IGJpZ2ludDtcbiAgbjogYmlnaW50O1xuICBoOiBiaWdpbnQ7XG4gIGE6IFQ7XG4gIGI/OiBUO1xuICBkPzogVDtcbiAgR3g6IFQ7XG4gIEd5OiBUO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlRmllbGQ8VD4ob3JkZXI6IGJpZ2ludCwgZmllbGQ/OiBJRmllbGQ8VD4sIGlzTEU/OiBib29sZWFuKTogSUZpZWxkPFQ+IHtcbiAgaWYgKGZpZWxkKSB7XG4gICAgaWYgKGZpZWxkLk9SREVSICE9PSBvcmRlcikgdGhyb3cgbmV3IEVycm9yKCdGaWVsZC5PUkRFUiBtdXN0IG1hdGNoIG9yZGVyOiBGcCA9PSBwLCBGbiA9PSBuJyk7XG4gICAgdmFsaWRhdGVGaWVsZChmaWVsZCk7XG4gICAgcmV0dXJuIGZpZWxkO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGaWVsZChvcmRlciwgeyBpc0xFIH0pIGFzIHVua25vd24gYXMgSUZpZWxkPFQ+O1xuICB9XG59XG5leHBvcnQgdHlwZSBGcEZuPFQ+ID0geyBGcDogSUZpZWxkPFQ+OyBGbjogSUZpZWxkPGJpZ2ludD4gfTtcblxuLyoqIFZhbGlkYXRlcyBDVVJWRSBvcHRzIGFuZCBjcmVhdGVzIGZpZWxkcyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1cnZlRmllbGRzPFQ+KFxuICB0eXBlOiAnd2VpZXJzdHJhc3MnIHwgJ2Vkd2FyZHMnLFxuICBDVVJWRTogVmFsaWRDdXJ2ZVBhcmFtczxUPixcbiAgY3VydmVPcHRzOiBQYXJ0aWFsPEZwRm48VD4+ID0ge30sXG4gIEZwRm5MRT86IGJvb2xlYW5cbik6IEZwRm48VD4gJiB7IENVUlZFOiBWYWxpZEN1cnZlUGFyYW1zPFQ+IH0ge1xuICBpZiAoRnBGbkxFID09PSB1bmRlZmluZWQpIEZwRm5MRSA9IHR5cGUgPT09ICdlZHdhcmRzJztcbiAgaWYgKCFDVVJWRSB8fCB0eXBlb2YgQ1VSVkUgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgRXJyb3IoYGV4cGVjdGVkIHZhbGlkICR7dHlwZX0gQ1VSVkUgb2JqZWN0YCk7XG4gIGZvciAoY29uc3QgcCBvZiBbJ3AnLCAnbicsICdoJ10gYXMgY29uc3QpIHtcbiAgICBjb25zdCB2YWwgPSBDVVJWRVtwXTtcbiAgICBpZiAoISh0eXBlb2YgdmFsID09PSAnYmlnaW50JyAmJiB2YWwgPiBfMG4pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDVVJWRS4ke3B9IG11c3QgYmUgcG9zaXRpdmUgYmlnaW50YCk7XG4gIH1cbiAgY29uc3QgRnAgPSBjcmVhdGVGaWVsZChDVVJWRS5wLCBjdXJ2ZU9wdHMuRnAsIEZwRm5MRSk7XG4gIGNvbnN0IEZuID0gY3JlYXRlRmllbGQoQ1VSVkUubiwgY3VydmVPcHRzLkZuLCBGcEZuTEUpO1xuICBjb25zdCBfYjogJ2InIHwgJ2QnID0gdHlwZSA9PT0gJ3dlaWVyc3RyYXNzJyA/ICdiJyA6ICdkJztcbiAgY29uc3QgcGFyYW1zID0gWydHeCcsICdHeScsICdhJywgX2JdIGFzIGNvbnN0O1xuICBmb3IgKGNvbnN0IHAgb2YgcGFyYW1zKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGlmICghRnAuaXNWYWxpZChDVVJWRVtwXSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENVUlZFLiR7cH0gbXVzdCBiZSB2YWxpZCBmaWVsZCBlbGVtZW50IG9mIENVUlZFLkZwYCk7XG4gIH1cbiAgQ1VSVkUgPSBPYmplY3QuZnJlZXplKE9iamVjdC5hc3NpZ24oe30sIENVUlZFKSk7XG4gIHJldHVybiB7IENVUlZFLCBGcCwgRm4gfTtcbn1cblxudHlwZSBLZXlnZW5GbiA9IChcbiAgc2VlZD86IFVpbnQ4QXJyYXksXG4gIGlzQ29tcHJlc3NlZD86IGJvb2xlYW5cbikgPT4geyBzZWNyZXRLZXk6IFVpbnQ4QXJyYXk7IHB1YmxpY0tleTogVWludDhBcnJheSB9O1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUtleWdlbihcbiAgcmFuZG9tU2VjcmV0S2V5OiBGdW5jdGlvbixcbiAgZ2V0UHVibGljS2V5OiBTaWduZXJbJ2dldFB1YmxpY0tleSddXG4pOiBLZXlnZW5GbiB7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlnZW4oc2VlZD86IFVpbnQ4QXJyYXkpIHtcbiAgICBjb25zdCBzZWNyZXRLZXkgPSByYW5kb21TZWNyZXRLZXkoc2VlZCk7XG4gICAgcmV0dXJuIHsgc2VjcmV0S2V5LCBwdWJsaWNLZXk6IGdldFB1YmxpY0tleShzZWNyZXRLZXkpIH07XG4gIH07XG59XG4iLCAiLyoqXG4gKiBIZXgsIGJ5dGVzIGFuZCBudW1iZXIgdXRpbGl0aWVzLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQge1xuICBhYnl0ZXMgYXMgYWJ5dGVzXyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb0hleCBhcyBieXRlc1RvSGV4XyxcbiAgY29uY2F0Qnl0ZXMgYXMgY29uY2F0Qnl0ZXNfLFxuICBoZXhUb0J5dGVzIGFzIGhleFRvQnl0ZXNfLFxufSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmV4cG9ydCB7XG4gIGFieXRlcyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb0hleCxcbiAgY29uY2F0Qnl0ZXMsXG4gIGhleFRvQnl0ZXMsXG4gIGlzQnl0ZXMsXG4gIHJhbmRvbUJ5dGVzLFxufSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCk7XG5jb25zdCBfMW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDEpO1xuXG5leHBvcnQgdHlwZSBDSGFzaCA9IHtcbiAgKG1lc3NhZ2U6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5O1xuICBibG9ja0xlbjogbnVtYmVyO1xuICBvdXRwdXRMZW46IG51bWJlcjtcbiAgY3JlYXRlKG9wdHM/OiB7IGRrTGVuPzogbnVtYmVyIH0pOiBhbnk7IC8vIEZvciBzaGFrZVxufTtcbmV4cG9ydCB0eXBlIEZIYXNoID0gKG1lc3NhZ2U6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG5leHBvcnQgZnVuY3Rpb24gYWJvb2wodmFsdWU6IGJvb2xlYW4sIHRpdGxlOiBzdHJpbmcgPSAnJyk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCArICdleHBlY3RlZCBib29sZWFuLCBnb3QgdHlwZT0nICsgdHlwZW9mIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIFVzZWQgaW4gd2VpZXJzdHJhc3MsIGRlclxuZnVuY3Rpb24gYWJpZ251bWJlcihuOiBudW1iZXIgfCBiaWdpbnQpIHtcbiAgaWYgKHR5cGVvZiBuID09PSAnYmlnaW50Jykge1xuICAgIGlmICghaXNQb3NCaWcobikpIHRocm93IG5ldyBFcnJvcigncG9zaXRpdmUgYmlnaW50IGV4cGVjdGVkLCBnb3QgJyArIG4pO1xuICB9IGVsc2UgYW51bWJlcihuKTtcbiAgcmV0dXJuIG47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc2FmZW51bWJlcih2YWx1ZTogbnVtYmVyLCB0aXRsZTogc3RyaW5nID0gJycpOiB2b2lkIHtcbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcih2YWx1ZSkpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aXRsZSAmJiBgXCIke3RpdGxlfVwiIGA7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByZWZpeCArICdleHBlY3RlZCBzYWZlIGludGVnZXIsIGdvdCB0eXBlPScgKyB0eXBlb2YgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0hleFVucGFkZGVkKG51bTogbnVtYmVyIHwgYmlnaW50KTogc3RyaW5nIHtcbiAgY29uc3QgaGV4ID0gYWJpZ251bWJlcihudW0pLnRvU3RyaW5nKDE2KTtcbiAgcmV0dXJuIGhleC5sZW5ndGggJiAxID8gJzAnICsgaGV4IDogaGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9OdW1iZXIoaGV4OiBzdHJpbmcpOiBiaWdpbnQge1xuICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290ICcgKyB0eXBlb2YgaGV4KTtcbiAgcmV0dXJuIGhleCA9PT0gJycgPyBfMG4gOiBCaWdJbnQoJzB4JyArIGhleCk7IC8vIEJpZyBFbmRpYW5cbn1cblxuLy8gQkU6IEJpZyBFbmRpYW4sIExFOiBMaXR0bGUgRW5kaWFuXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb051bWJlckJFKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgcmV0dXJuIGhleFRvTnVtYmVyKGJ5dGVzVG9IZXhfKGJ5dGVzKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb051bWJlckxFKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgcmV0dXJuIGhleFRvTnVtYmVyKGJ5dGVzVG9IZXhfKGNvcHlCeXRlcyhhYnl0ZXNfKGJ5dGVzKSkucmV2ZXJzZSgpKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0J5dGVzQkUobjogbnVtYmVyIHwgYmlnaW50LCBsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICBhbnVtYmVyKGxlbik7XG4gIG4gPSBhYmlnbnVtYmVyKG4pO1xuICBjb25zdCByZXMgPSBoZXhUb0J5dGVzXyhuLnRvU3RyaW5nKDE2KS5wYWRTdGFydChsZW4gKiAyLCAnMCcpKTtcbiAgaWYgKHJlcy5sZW5ndGggIT09IGxlbikgdGhyb3cgbmV3IEVycm9yKCdudW1iZXIgdG9vIGxhcmdlJyk7XG4gIHJldHVybiByZXM7XG59XG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9CeXRlc0xFKG46IG51bWJlciB8IGJpZ2ludCwgbGVuOiBudW1iZXIpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIG51bWJlclRvQnl0ZXNCRShuLCBsZW4pLnJldmVyc2UoKTtcbn1cbi8vIFVucGFkZGVkLCByYXJlbHkgdXNlZFxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvVmFyQnl0ZXNCRShuOiBudW1iZXIgfCBiaWdpbnQpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGhleFRvQnl0ZXNfKG51bWJlclRvSGV4VW5wYWRkZWQoYWJpZ251bWJlcihuKSkpO1xufVxuXG4vLyBDb21wYXJlcyAyIHU4YS1zIGluIGtpbmRhIGNvbnN0YW50IHRpbWVcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbEJ5dGVzKGE6IFVpbnQ4QXJyYXksIGI6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBsZXQgZGlmZiA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykgZGlmZiB8PSBhW2ldIF4gYltpXTtcbiAgcmV0dXJuIGRpZmYgPT09IDA7XG59XG5cbi8qKlxuICogQ29waWVzIFVpbnQ4QXJyYXkuIFdlIGNhbid0IHVzZSB1OGEuc2xpY2UoKSwgYmVjYXVzZSB1OGEgY2FuIGJlIEJ1ZmZlcixcbiAqIGFuZCBCdWZmZXIjc2xpY2UgY3JlYXRlcyBtdXRhYmxlIGNvcHkuIE5ldmVyIHVzZSBCdWZmZXJzIVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIHJldHVybiBVaW50OEFycmF5LmZyb20oYnl0ZXMpO1xufVxuXG4vKipcbiAqIERlY29kZXMgNy1iaXQgQVNDSUkgc3RyaW5nIHRvIFVpbnQ4QXJyYXksIHRocm93cyBvbiBub24tYXNjaWkgc3ltYm9sc1xuICogU2hvdWxkIGJlIHNhZmUgdG8gdXNlIGZvciB0aGluZ3MgZXhwZWN0ZWQgdG8gYmUgQVNDSUkuXG4gKiBSZXR1cm5zIGV4YWN0IHNhbWUgcmVzdWx0IGFzIGBUZXh0RW5jb2RlcmAgZm9yIEFTQ0lJIG9yIHRocm93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzY2lpVG9CeXRlcyhhc2NpaTogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBVaW50OEFycmF5LmZyb20oYXNjaWksIChjLCBpKSA9PiB7XG4gICAgY29uc3QgY2hhckNvZGUgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKGMubGVuZ3RoICE9PSAxIHx8IGNoYXJDb2RlID4gMTI3KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBzdHJpbmcgY29udGFpbnMgbm9uLUFTQ0lJIGNoYXJhY3RlciBcIiR7YXNjaWlbaV19XCIgd2l0aCBjb2RlICR7Y2hhckNvZGV9IGF0IHBvc2l0aW9uICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY2hhckNvZGU7XG4gIH0pO1xufVxuXG4vLyBJcyBwb3NpdGl2ZSBiaWdpbnRcbmNvbnN0IGlzUG9zQmlnID0gKG46IGJpZ2ludCkgPT4gdHlwZW9mIG4gPT09ICdiaWdpbnQnICYmIF8wbiA8PSBuO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5SYW5nZShuOiBiaWdpbnQsIG1pbjogYmlnaW50LCBtYXg6IGJpZ2ludCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNQb3NCaWcobikgJiYgaXNQb3NCaWcobWluKSAmJiBpc1Bvc0JpZyhtYXgpICYmIG1pbiA8PSBuICYmIG4gPCBtYXg7XG59XG5cbi8qKlxuICogQXNzZXJ0cyBtaW4gPD0gbiA8IG1heC4gTk9URTogSXQncyA8IG1heCBhbmQgbm90IDw9IG1heC5cbiAqIEBleGFtcGxlXG4gKiBhSW5SYW5nZSgneCcsIHgsIDFuLCAyNTZuKTsgLy8gd291bGQgYXNzdW1lIHggaXMgaW4gKDFuLi4yNTVuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gYUluUmFuZ2UodGl0bGU6IHN0cmluZywgbjogYmlnaW50LCBtaW46IGJpZ2ludCwgbWF4OiBiaWdpbnQpOiB2b2lkIHtcbiAgLy8gV2h5IG1pbiA8PSBuIDwgbWF4IGFuZCBub3QgYSAobWluIDwgbiA8IG1heCkgT1IgYiAobWluIDw9IG4gPD0gbWF4KT9cbiAgLy8gY29uc2lkZXIgUD0yNTZuLCBtaW49MG4sIG1heD1QXG4gIC8vIC0gYSBmb3IgbWluPTAgd291bGQgcmVxdWlyZSAtMTogICAgICAgICAgYGluUmFuZ2UoJ3gnLCB4LCAtMW4sIFApYFxuICAvLyAtIGIgd291bGQgY29tbW9ubHkgcmVxdWlyZSBzdWJ0cmFjdGlvbjogIGBpblJhbmdlKCd4JywgeCwgMG4sIFAgLSAxbilgXG4gIC8vIC0gb3VyIHdheSBpcyB0aGUgY2xlYW5lc3Q6ICAgICAgICAgICAgICAgYGluUmFuZ2UoJ3gnLCB4LCAwbiwgUClcbiAgaWYgKCFpblJhbmdlKG4sIG1pbiwgbWF4KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHZhbGlkICcgKyB0aXRsZSArICc6ICcgKyBtaW4gKyAnIDw9IG4gPCAnICsgbWF4ICsgJywgZ290ICcgKyBuKTtcbn1cblxuLy8gQml0IG9wZXJhdGlvbnNcblxuLyoqXG4gKiBDYWxjdWxhdGVzIGFtb3VudCBvZiBiaXRzIGluIGEgYmlnaW50LlxuICogU2FtZSBhcyBgbi50b1N0cmluZygyKS5sZW5ndGhgXG4gKiBUT0RPOiBtZXJnZSB3aXRoIG5MZW5ndGggaW4gbW9kdWxhclxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0TGVuKG46IGJpZ2ludCk6IG51bWJlciB7XG4gIGxldCBsZW47XG4gIGZvciAobGVuID0gMDsgbiA+IF8wbjsgbiA+Pj0gXzFuLCBsZW4gKz0gMSk7XG4gIHJldHVybiBsZW47XG59XG5cbi8qKlxuICogR2V0cyBzaW5nbGUgYml0IGF0IHBvc2l0aW9uLlxuICogTk9URTogZmlyc3QgYml0IHBvc2l0aW9uIGlzIDAgKHNhbWUgYXMgYXJyYXlzKVxuICogU2FtZSBhcyBgISErQXJyYXkuZnJvbShuLnRvU3RyaW5nKDIpKS5yZXZlcnNlKClbcG9zXWBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpdEdldChuOiBiaWdpbnQsIHBvczogbnVtYmVyKTogYmlnaW50IHtcbiAgcmV0dXJuIChuID4+IEJpZ0ludChwb3MpKSAmIF8xbjtcbn1cblxuLyoqXG4gKiBTZXRzIHNpbmdsZSBiaXQgYXQgcG9zaXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaXRTZXQobjogYmlnaW50LCBwb3M6IG51bWJlciwgdmFsdWU6IGJvb2xlYW4pOiBiaWdpbnQge1xuICByZXR1cm4gbiB8ICgodmFsdWUgPyBfMW4gOiBfMG4pIDw8IEJpZ0ludChwb3MpKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgbWFzayBmb3IgTiBiaXRzLiBOb3QgdXNpbmcgKiogb3BlcmF0b3Igd2l0aCBiaWdpbnRzIGJlY2F1c2Ugb2Ygb2xkIGVuZ2luZXMuXG4gKiBTYW1lIGFzIEJpZ0ludChgMGIke0FycmF5KGkpLmZpbGwoJzEnKS5qb2luKCcnKX1gKVxuICovXG5leHBvcnQgY29uc3QgYml0TWFzayA9IChuOiBudW1iZXIpOiBiaWdpbnQgPT4gKF8xbiA8PCBCaWdJbnQobikpIC0gXzFuO1xuXG4vLyBEUkJHXG5cbnR5cGUgUHJlZDxUPiA9ICh2OiBVaW50OEFycmF5KSA9PiBUIHwgdW5kZWZpbmVkO1xuLyoqXG4gKiBNaW5pbWFsIEhNQUMtRFJCRyBmcm9tIE5JU1QgODAwLTkwIGZvciBSRkM2OTc5IHNpZ3MuXG4gKiBAcmV0dXJucyBmdW5jdGlvbiB0aGF0IHdpbGwgY2FsbCBEUkJHIHVudGlsIDJuZCBhcmcgcmV0dXJucyBzb21ldGhpbmcgbWVhbmluZ2Z1bFxuICogQGV4YW1wbGVcbiAqICAgY29uc3QgZHJiZyA9IGNyZWF0ZUhtYWNEUkJHPEtleT4oMzIsIDMyLCBobWFjKTtcbiAqICAgZHJiZyhzZWVkLCBieXRlc1RvS2V5KTsgLy8gYnl0ZXNUb0tleSBtdXN0IHJldHVybiBLZXkgb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIbWFjRHJiZzxUPihcbiAgaGFzaExlbjogbnVtYmVyLFxuICBxQnl0ZUxlbjogbnVtYmVyLFxuICBobWFjRm46IChrZXk6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXlcbik6IChzZWVkOiBVaW50OEFycmF5LCBwcmVkaWNhdGU6IFByZWQ8VD4pID0+IFQge1xuICBhbnVtYmVyKGhhc2hMZW4sICdoYXNoTGVuJyk7XG4gIGFudW1iZXIocUJ5dGVMZW4sICdxQnl0ZUxlbicpO1xuICBpZiAodHlwZW9mIGhtYWNGbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdobWFjRm4gbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIGNvbnN0IHU4biA9IChsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkgPT4gbmV3IFVpbnQ4QXJyYXkobGVuKTsgLy8gY3JlYXRlcyBVaW50OEFycmF5XG4gIGNvbnN0IE5VTEwgPSBVaW50OEFycmF5Lm9mKCk7XG4gIGNvbnN0IGJ5dGUwID0gVWludDhBcnJheS5vZigweDAwKTtcbiAgY29uc3QgYnl0ZTEgPSBVaW50OEFycmF5Lm9mKDB4MDEpO1xuICBjb25zdCBfbWF4RHJiZ0l0ZXJzID0gMTAwMDtcblxuICAvLyBTdGVwIEIsIFN0ZXAgQzogc2V0IGhhc2hMZW4gdG8gOCpjZWlsKGhsZW4vOClcbiAgbGV0IHYgPSB1OG4oaGFzaExlbik7IC8vIE1pbmltYWwgbm9uLWZ1bGwtc3BlYyBITUFDLURSQkcgZnJvbSBOSVNUIDgwMC05MCBmb3IgUkZDNjk3OSBzaWdzLlxuICBsZXQgayA9IHU4bihoYXNoTGVuKTsgLy8gU3RlcHMgQiBhbmQgQyBvZiBSRkM2OTc5IDMuMjogc2V0IGhhc2hMZW4sIGluIG91ciBjYXNlIGFsd2F5cyBzYW1lXG4gIGxldCBpID0gMDsgLy8gSXRlcmF0aW9ucyBjb3VudGVyLCB3aWxsIHRocm93IHdoZW4gb3ZlciAxMDAwXG4gIGNvbnN0IHJlc2V0ID0gKCkgPT4ge1xuICAgIHYuZmlsbCgxKTtcbiAgICBrLmZpbGwoMCk7XG4gICAgaSA9IDA7XG4gIH07XG4gIGNvbnN0IGggPSAoLi4ubXNnczogVWludDhBcnJheVtdKSA9PiBobWFjRm4oaywgY29uY2F0Qnl0ZXNfKHYsIC4uLm1zZ3MpKTsgLy8gaG1hYyhrKSh2LCAuLi52YWx1ZXMpXG4gIGNvbnN0IHJlc2VlZCA9IChzZWVkOiBVaW50OEFycmF5ID0gTlVMTCkgPT4ge1xuICAgIC8vIEhNQUMtRFJCRyByZXNlZWQoKSBmdW5jdGlvbi4gU3RlcHMgRC1HXG4gICAgayA9IGgoYnl0ZTAsIHNlZWQpOyAvLyBrID0gaG1hYyhrIHx8IHYgfHwgMHgwMCB8fCBzZWVkKVxuICAgIHYgPSBoKCk7IC8vIHYgPSBobWFjKGsgfHwgdilcbiAgICBpZiAoc2VlZC5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICBrID0gaChieXRlMSwgc2VlZCk7IC8vIGsgPSBobWFjKGsgfHwgdiB8fCAweDAxIHx8IHNlZWQpXG4gICAgdiA9IGgoKTsgLy8gdiA9IGhtYWMoayB8fCB2KVxuICB9O1xuICBjb25zdCBnZW4gPSAoKSA9PiB7XG4gICAgLy8gSE1BQy1EUkJHIGdlbmVyYXRlKCkgZnVuY3Rpb25cbiAgICBpZiAoaSsrID49IF9tYXhEcmJnSXRlcnMpIHRocm93IG5ldyBFcnJvcignZHJiZzogdHJpZWQgbWF4IGFtb3VudCBvZiBpdGVyYXRpb25zJyk7XG4gICAgbGV0IGxlbiA9IDA7XG4gICAgY29uc3Qgb3V0OiBVaW50OEFycmF5W10gPSBbXTtcbiAgICB3aGlsZSAobGVuIDwgcUJ5dGVMZW4pIHtcbiAgICAgIHYgPSBoKCk7XG4gICAgICBjb25zdCBzbCA9IHYuc2xpY2UoKTtcbiAgICAgIG91dC5wdXNoKHNsKTtcbiAgICAgIGxlbiArPSB2Lmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmNhdEJ5dGVzXyguLi5vdXQpO1xuICB9O1xuICBjb25zdCBnZW5VbnRpbCA9IChzZWVkOiBVaW50OEFycmF5LCBwcmVkOiBQcmVkPFQ+KTogVCA9PiB7XG4gICAgcmVzZXQoKTtcbiAgICByZXNlZWQoc2VlZCk7IC8vIFN0ZXBzIEQtR1xuICAgIGxldCByZXM6IFQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7IC8vIFN0ZXAgSDogZ3JpbmQgdW50aWwgayBpcyBpbiBbMS4ubi0xXVxuICAgIHdoaWxlICghKHJlcyA9IHByZWQoZ2VuKCkpKSkgcmVzZWVkKCk7XG4gICAgcmVzZXQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9O1xuICByZXR1cm4gZ2VuVW50aWw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU9iamVjdChcbiAgb2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuICBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fSxcbiAgb3B0RmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbik6IHZvaWQge1xuICBpZiAoIW9iamVjdCB8fCB0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCB2YWxpZCBvcHRpb25zIG9iamVjdCcpO1xuICB0eXBlIEl0ZW0gPSBrZXlvZiB0eXBlb2Ygb2JqZWN0O1xuICBmdW5jdGlvbiBjaGVja0ZpZWxkKGZpZWxkTmFtZTogSXRlbSwgZXhwZWN0ZWRUeXBlOiBzdHJpbmcsIGlzT3B0OiBib29sZWFuKSB7XG4gICAgY29uc3QgdmFsID0gb2JqZWN0W2ZpZWxkTmFtZV07XG4gICAgaWYgKGlzT3B0ICYmIHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgY29uc3QgY3VycmVudCA9IHR5cGVvZiB2YWw7XG4gICAgaWYgKGN1cnJlbnQgIT09IGV4cGVjdGVkVHlwZSB8fCB2YWwgPT09IG51bGwpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHBhcmFtIFwiJHtmaWVsZE5hbWV9XCIgaXMgaW52YWxpZDogZXhwZWN0ZWQgJHtleHBlY3RlZFR5cGV9LCBnb3QgJHtjdXJyZW50fWApO1xuICB9XG4gIGNvbnN0IGl0ZXIgPSAoZjogdHlwZW9mIGZpZWxkcywgaXNPcHQ6IGJvb2xlYW4pID0+XG4gICAgT2JqZWN0LmVudHJpZXMoZikuZm9yRWFjaCgoW2ssIHZdKSA9PiBjaGVja0ZpZWxkKGssIHYsIGlzT3B0KSk7XG4gIGl0ZXIoZmllbGRzLCBmYWxzZSk7XG4gIGl0ZXIob3B0RmllbGRzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiB0aHJvd3Mgbm90IGltcGxlbWVudGVkIGVycm9yXG4gKi9cbmV4cG9ydCBjb25zdCBub3RJbXBsZW1lbnRlZCA9ICgpOiBuZXZlciA9PiB7XG4gIHRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG59O1xuXG4vKipcbiAqIE1lbW9pemVzIChjYWNoZXMpIGNvbXB1dGF0aW9uIHJlc3VsdC5cbiAqIFVzZXMgV2Vha01hcDogdGhlIHZhbHVlIGlzIGdvaW5nIGF1dG8tY2xlYW5lZCBieSBHQyBhZnRlciBsYXN0IHJlZmVyZW5jZSBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVtb2l6ZWQ8VCBleHRlbmRzIG9iamVjdCwgUiwgTyBleHRlbmRzIGFueVtdPihcbiAgZm46IChhcmc6IFQsIC4uLmFyZ3M6IE8pID0+IFJcbik6IChhcmc6IFQsIC4uLmFyZ3M6IE8pID0+IFIge1xuICBjb25zdCBtYXAgPSBuZXcgV2Vha01hcDxULCBSPigpO1xuICByZXR1cm4gKGFyZzogVCwgLi4uYXJnczogTyk6IFIgPT4ge1xuICAgIGNvbnN0IHZhbCA9IG1hcC5nZXQoYXJnKTtcbiAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHJldHVybiB2YWw7XG4gICAgY29uc3QgY29tcHV0ZWQgPSBmbihhcmcsIC4uLmFyZ3MpO1xuICAgIG1hcC5zZXQoYXJnLCBjb21wdXRlZCk7XG4gICAgcmV0dXJuIGNvbXB1dGVkO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENyeXB0b0tleXMge1xuICBsZW5ndGhzOiB7IHNlZWQ/OiBudW1iZXI7IHB1YmxpYz86IG51bWJlcjsgc2VjcmV0PzogbnVtYmVyIH07XG4gIGtleWdlbjogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG4gIGdldFB1YmxpY0tleTogKHNlY3JldEtleTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbn1cblxuLyoqIEdlbmVyaWMgaW50ZXJmYWNlIGZvciBzaWduYXR1cmVzLiBIYXMga2V5Z2VuLCBzaWduIGFuZCB2ZXJpZnkuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25lciBleHRlbmRzIENyeXB0b0tleXMge1xuICAvLyBJbnRlcmZhY2VzIGFyZSBmdW4uIFdlIGNhbm5vdCBqdXN0IGFkZCBuZXcgZmllbGRzIHdpdGhvdXQgY29weWluZyBvbGQgb25lcy5cbiAgbGVuZ3Roczoge1xuICAgIHNlZWQ/OiBudW1iZXI7XG4gICAgcHVibGljPzogbnVtYmVyO1xuICAgIHNlY3JldD86IG51bWJlcjtcbiAgICBzaWduUmFuZD86IG51bWJlcjtcbiAgICBzaWduYXR1cmU/OiBudW1iZXI7XG4gIH07XG4gIHNpZ246IChtc2c6IFVpbnQ4QXJyYXksIHNlY3JldEtleTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgdmVyaWZ5OiAoc2lnOiBVaW50OEFycmF5LCBtc2c6IFVpbnQ4QXJyYXksIHB1YmxpY0tleTogVWludDhBcnJheSkgPT4gYm9vbGVhbjtcbn1cbiIsICIvKipcbiAqIFV0aWxzIGZvciBtb2R1bGFyIGRpdmlzaW9uIGFuZCBmaWVsZHMuXG4gKiBGaWVsZCBvdmVyIDExIGlzIGEgZmluaXRlIChHYWxvaXMpIGZpZWxkIGlzIGludGVnZXIgbnVtYmVyIG9wZXJhdGlvbnMgYG1vZCAxMWAuXG4gKiBUaGVyZSBpcyBubyBkaXZpc2lvbjogaXQgaXMgcmVwbGFjZWQgYnkgbW9kdWxhciBtdWx0aXBsaWNhdGl2ZSBpbnZlcnNlLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQge1xuICBhYnl0ZXMsXG4gIGFudW1iZXIsXG4gIGJ5dGVzVG9OdW1iZXJCRSxcbiAgYnl0ZXNUb051bWJlckxFLFxuICBudW1iZXJUb0J5dGVzQkUsXG4gIG51bWJlclRvQnl0ZXNMRSxcbiAgdmFsaWRhdGVPYmplY3QsXG59IGZyb20gJy4uL3V0aWxzLnRzJztcblxuLy8gTnVtYmVycyBhcmVuJ3QgdXNlZCBpbiB4MjU1MTkgLyB4NDQ4IGJ1aWxkc1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApLCBfMW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDEpLCBfMm4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDIpO1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfM24gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDMpLCBfNG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDQpLCBfNW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDUpO1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBfN24gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDcpLCBfOG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDgpLCBfOW4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDkpO1xuY29uc3QgXzE2biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMTYpO1xuXG4vLyBDYWxjdWxhdGVzIGEgbW9kdWxvIGJcbmV4cG9ydCBmdW5jdGlvbiBtb2QoYTogYmlnaW50LCBiOiBiaWdpbnQpOiBiaWdpbnQge1xuICBjb25zdCByZXN1bHQgPSBhICUgYjtcbiAgcmV0dXJuIHJlc3VsdCA+PSBfMG4gPyByZXN1bHQgOiBiICsgcmVzdWx0O1xufVxuLyoqXG4gKiBFZmZpY2llbnRseSByYWlzZSBudW0gdG8gcG93ZXIgYW5kIGRvIG1vZHVsYXIgZGl2aXNpb24uXG4gKiBVbnNhZmUgaW4gc29tZSBjb250ZXh0czogdXNlcyBsYWRkZXIsIHNvIGNhbiBleHBvc2UgYmlnaW50IGJpdHMuXG4gKiBAZXhhbXBsZVxuICogcG93KDJuLCA2biwgMTFuKSAvLyA2NG4gJSAxMW4gPT0gOW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvdyhudW06IGJpZ2ludCwgcG93ZXI6IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBiaWdpbnQge1xuICByZXR1cm4gRnBQb3coRmllbGQobW9kdWxvKSwgbnVtLCBwb3dlcik7XG59XG5cbi8qKiBEb2VzIGB4XigyXnBvd2VyKWAgbW9kIHAuIGBwb3cyKDMwLCA0KWAgPT0gYDMwXigyXjQpYCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvdzIoeDogYmlnaW50LCBwb3dlcjogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGxldCByZXMgPSB4O1xuICB3aGlsZSAocG93ZXItLSA+IF8wbikge1xuICAgIHJlcyAqPSByZXM7XG4gICAgcmVzICU9IG1vZHVsbztcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEludmVyc2VzIG51bWJlciBvdmVyIG1vZHVsby5cbiAqIEltcGxlbWVudGVkIHVzaW5nIFtFdWNsaWRlYW4gR0NEXShodHRwczovL2JyaWxsaWFudC5vcmcvd2lraS9leHRlbmRlZC1ldWNsaWRlYW4tYWxnb3JpdGhtLykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQobnVtYmVyOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYmlnaW50IHtcbiAgaWYgKG51bWJlciA9PT0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmVydDogZXhwZWN0ZWQgbm9uLXplcm8gbnVtYmVyJyk7XG4gIGlmIChtb2R1bG8gPD0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmVydDogZXhwZWN0ZWQgcG9zaXRpdmUgbW9kdWx1cywgZ290ICcgKyBtb2R1bG8pO1xuICAvLyBGZXJtYXQncyBsaXR0bGUgdGhlb3JlbSBcIkNULWxpa2VcIiB2ZXJzaW9uIGludihuKSA9IG5eKG0tMikgbW9kIG0gaXMgMzB4IHNsb3dlci5cbiAgbGV0IGEgPSBtb2QobnVtYmVyLCBtb2R1bG8pO1xuICBsZXQgYiA9IG1vZHVsbztcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGxldCB4ID0gXzBuLCB5ID0gXzFuLCB1ID0gXzFuLCB2ID0gXzBuO1xuICB3aGlsZSAoYSAhPT0gXzBuKSB7XG4gICAgLy8gSklUIGFwcGxpZXMgb3B0aW1pemF0aW9uIGlmIHRob3NlIHR3byBsaW5lcyBmb2xsb3cgZWFjaCBvdGhlclxuICAgIGNvbnN0IHEgPSBiIC8gYTtcbiAgICBjb25zdCByID0gYiAlIGE7XG4gICAgY29uc3QgbSA9IHggLSB1ICogcTtcbiAgICBjb25zdCBuID0geSAtIHYgKiBxO1xuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGIgPSBhLCBhID0gciwgeCA9IHUsIHkgPSB2LCB1ID0gbSwgdiA9IG47XG4gIH1cbiAgY29uc3QgZ2NkID0gYjtcbiAgaWYgKGdjZCAhPT0gXzFuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmVydDogZG9lcyBub3QgZXhpc3QnKTtcbiAgcmV0dXJuIG1vZCh4LCBtb2R1bG8pO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRJc1NxdWFyZTxUPihGcDogSUZpZWxkPFQ+LCByb290OiBULCBuOiBUKTogdm9pZCB7XG4gIGlmICghRnAuZXFsKEZwLnNxcihyb290KSwgbikpIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcbn1cblxuLy8gTm90IGFsbCByb290cyBhcmUgcG9zc2libGUhIEV4YW1wbGUgd2hpY2ggd2lsbCB0aHJvdzpcbi8vIGNvbnN0IE5VTSA9XG4vLyBuID0gNzIwNTc1OTQwMzc5Mjc4MTZuO1xuLy8gRnAgPSBGaWVsZChCaWdJbnQoJzB4MWEwMTExZWEzOTdmZTY5YTRiMWJhN2I2NDM0YmFjZDc2NDc3NGI4NGYzODUxMmJmNjczMGQyYTBmNmIwZjYyNDFlYWJmZmZlYjE1M2ZmZmZiOWZlZmZmZmZmZmZhYWFiJykpO1xuZnVuY3Rpb24gc3FydDNtb2Q0PFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpIHtcbiAgY29uc3QgcDFkaXY0ID0gKEZwLk9SREVSICsgXzFuKSAvIF80bjtcbiAgY29uc3Qgcm9vdCA9IEZwLnBvdyhuLCBwMWRpdjQpO1xuICBhc3NlcnRJc1NxdWFyZShGcCwgcm9vdCwgbik7XG4gIHJldHVybiByb290O1xufVxuXG5mdW5jdGlvbiBzcXJ0NW1vZDg8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkge1xuICBjb25zdCBwNWRpdjggPSAoRnAuT1JERVIgLSBfNW4pIC8gXzhuO1xuICBjb25zdCBuMiA9IEZwLm11bChuLCBfMm4pO1xuICBjb25zdCB2ID0gRnAucG93KG4yLCBwNWRpdjgpO1xuICBjb25zdCBudiA9IEZwLm11bChuLCB2KTtcbiAgY29uc3QgaSA9IEZwLm11bChGcC5tdWwobnYsIF8ybiksIHYpO1xuICBjb25zdCByb290ID0gRnAubXVsKG52LCBGcC5zdWIoaSwgRnAuT05FKSk7XG4gIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5cbi8vIEJhc2VkIG9uIFJGQzkzODAsIEtvbmcgYWxnb3JpdGhtXG4vLyBwcmV0dGllci1pZ25vcmVcbmZ1bmN0aW9uIHNxcnQ5bW9kMTYoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICBjb25zdCBGcF8gPSBGaWVsZChQKTtcbiAgY29uc3QgdG4gPSB0b25lbGxpU2hhbmtzKFApO1xuICBjb25zdCBjMSA9IHRuKEZwXywgRnBfLm5lZyhGcF8uT05FKSk7Ly8gIDEuIGMxID0gc3FydCgtMSkgaW4gRiwgaS5lLiwgKGMxXjIpID09IC0xIGluIEZcbiAgY29uc3QgYzIgPSB0bihGcF8sIGMxKTsgICAgICAgICAgICAgIC8vICAyLiBjMiA9IHNxcnQoYzEpIGluIEYsIGkuZS4sIChjMl4yKSA9PSBjMSBpbiBGXG4gIGNvbnN0IGMzID0gdG4oRnBfLCBGcF8ubmVnKGMxKSk7ICAgICAvLyAgMy4gYzMgPSBzcXJ0KC1jMSkgaW4gRiwgaS5lLiwgKGMzXjIpID09IC1jMSBpbiBGXG4gIGNvbnN0IGM0ID0gKFAgKyBfN24pIC8gXzE2bjsgICAgICAgICAvLyAgNC4gYzQgPSAocSArIDcpIC8gMTYgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIHJldHVybiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4ge1xuICAgIGxldCB0djEgPSBGcC5wb3cobiwgYzQpOyAgICAgICAgICAgLy8gIDEuIHR2MSA9IHheYzRcbiAgICBsZXQgdHYyID0gRnAubXVsKHR2MSwgYzEpOyAgICAgICAgIC8vICAyLiB0djIgPSBjMSAqIHR2MVxuICAgIGNvbnN0IHR2MyA9IEZwLm11bCh0djEsIGMyKTsgICAgICAgLy8gIDMuIHR2MyA9IGMyICogdHYxXG4gICAgY29uc3QgdHY0ID0gRnAubXVsKHR2MSwgYzMpOyAgICAgICAvLyAgNC4gdHY0ID0gYzMgKiB0djFcbiAgICBjb25zdCBlMSA9IEZwLmVxbChGcC5zcXIodHYyKSwgbik7IC8vICA1LiAgZTEgPSAodHYyXjIpID09IHhcbiAgICBjb25zdCBlMiA9IEZwLmVxbChGcC5zcXIodHYzKSwgbik7IC8vICA2LiAgZTIgPSAodHYzXjIpID09IHhcbiAgICB0djEgPSBGcC5jbW92KHR2MSwgdHYyLCBlMSk7ICAgICAgIC8vICA3LiB0djEgPSBDTU9WKHR2MSwgdHYyLCBlMSkgICMgU2VsZWN0IHR2MiBpZiAodHYyXjIpID09IHhcbiAgICB0djIgPSBGcC5jbW92KHR2NCwgdHYzLCBlMik7ICAgICAgIC8vICA4LiB0djIgPSBDTU9WKHR2NCwgdHYzLCBlMikgICMgU2VsZWN0IHR2MyBpZiAodHYzXjIpID09IHhcbiAgICBjb25zdCBlMyA9IEZwLmVxbChGcC5zcXIodHYyKSwgbik7IC8vICA5LiAgZTMgPSAodHYyXjIpID09IHhcbiAgICBjb25zdCByb290ID0gRnAuY21vdih0djEsIHR2MiwgZTMpOy8vIDEwLiAgeiA9IENNT1YodHYxLCB0djIsIGUzKSAgICMgU2VsZWN0IHNxcnQgZnJvbSB0djEgJiB0djJcbiAgICBhc3NlcnRJc1NxdWFyZShGcCwgcm9vdCwgbik7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH07XG59XG5cbi8qKlxuICogVG9uZWxsaS1TaGFua3Mgc3F1YXJlIHJvb3Qgc2VhcmNoIGFsZ29yaXRobS5cbiAqIDEuIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTIvNjg1LnBkZiAocGFnZSAxMilcbiAqIDIuIFNxdWFyZSBSb290cyBmcm9tIDE7IDI0LCA1MSwgMTAgdG8gRGFuIFNoYW5rc1xuICogQHBhcmFtIFAgZmllbGQgb3JkZXJcbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHRoYXQgdGFrZXMgZmllbGQgRnAgKGNyZWF0ZWQgZnJvbSBQKSBhbmQgbnVtYmVyIG5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbmVsbGlTaGFua3MoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICAvLyBJbml0aWFsaXphdGlvbiAocHJlY29tcHV0YXRpb24pLlxuICAvLyBDYWNoaW5nIGluaXRpYWxpemF0aW9uIGNvdWxkIGJvb3N0IHBlcmYgYnkgNyUuXG4gIGlmIChQIDwgXzNuKSB0aHJvdyBuZXcgRXJyb3IoJ3NxcnQgaXMgbm90IGRlZmluZWQgZm9yIHNtYWxsIGZpZWxkJyk7XG4gIC8vIEZhY3RvciBQIC0gMSA9IFEgKiAyXlMsIHdoZXJlIFEgaXMgb2RkXG4gIGxldCBRID0gUCAtIF8xbjtcbiAgbGV0IFMgPSAwO1xuICB3aGlsZSAoUSAlIF8ybiA9PT0gXzBuKSB7XG4gICAgUSAvPSBfMm47XG4gICAgUysrO1xuICB9XG5cbiAgLy8gRmluZCB0aGUgZmlyc3QgcXVhZHJhdGljIG5vbi1yZXNpZHVlIFogPj0gMlxuICBsZXQgWiA9IF8ybjtcbiAgY29uc3QgX0ZwID0gRmllbGQoUCk7XG4gIHdoaWxlIChGcExlZ2VuZHJlKF9GcCwgWikgPT09IDEpIHtcbiAgICAvLyBCYXNpYyBwcmltYWxpdHkgdGVzdCBmb3IgUC4gQWZ0ZXIgeCBpdGVyYXRpb25zLCBjaGFuY2Ugb2ZcbiAgICAvLyBub3QgZmluZGluZyBxdWFkcmF0aWMgbm9uLXJlc2lkdWUgaXMgMl54LCBzbyAyXjEwMDAuXG4gICAgaWYgKForKyA+IDEwMDApIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3Q6IHByb2JhYmx5IG5vbi1wcmltZSBQJyk7XG4gIH1cbiAgLy8gRmFzdC1wYXRoOyB1c3VhbGx5IGRvbmUgYmVmb3JlIFosIGJ1dCB3ZSBkbyBcInByaW1hbGl0eSB0ZXN0XCIuXG4gIGlmIChTID09PSAxKSByZXR1cm4gc3FydDNtb2Q0O1xuXG4gIC8vIFNsb3ctcGF0aFxuICAvLyBUT0RPOiB0ZXN0IG9uIEZwMiBhbmQgb3RoZXJzXG4gIGxldCBjYyA9IF9GcC5wb3coWiwgUSk7IC8vIGMgPSB6XlFcbiAgY29uc3QgUTFkaXYyID0gKFEgKyBfMW4pIC8gXzJuO1xuICByZXR1cm4gZnVuY3Rpb24gdG9uZWxsaVNsb3c8VD4oRnA6IElGaWVsZDxUPiwgbjogVCk6IFQge1xuICAgIGlmIChGcC5pczAobikpIHJldHVybiBuO1xuICAgIC8vIENoZWNrIGlmIG4gaXMgYSBxdWFkcmF0aWMgcmVzaWR1ZSB1c2luZyBMZWdlbmRyZSBzeW1ib2xcbiAgICBpZiAoRnBMZWdlbmRyZShGcCwgbikgIT09IDEpIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcblxuICAgIC8vIEluaXRpYWxpemUgdmFyaWFibGVzIGZvciB0aGUgbWFpbiBsb29wXG4gICAgbGV0IE0gPSBTO1xuICAgIGxldCBjID0gRnAubXVsKEZwLk9ORSwgY2MpOyAvLyBjID0gel5RLCBtb3ZlIGNjIGZyb20gZmllbGQgX0ZwIGludG8gZmllbGQgRnBcbiAgICBsZXQgdCA9IEZwLnBvdyhuLCBRKTsgLy8gdCA9IG5eUSwgZmlyc3QgZ3Vlc3MgYXQgdGhlIGZ1ZGdlIGZhY3RvclxuICAgIGxldCBSID0gRnAucG93KG4sIFExZGl2Mik7IC8vIFIgPSBuXigoUSsxKS8yKSwgZmlyc3QgZ3Vlc3MgYXQgdGhlIHNxdWFyZSByb290XG5cbiAgICAvLyBNYWluIGxvb3BcbiAgICAvLyB3aGlsZSB0ICE9IDFcbiAgICB3aGlsZSAoIUZwLmVxbCh0LCBGcC5PTkUpKSB7XG4gICAgICBpZiAoRnAuaXMwKHQpKSByZXR1cm4gRnAuWkVSTzsgLy8gaWYgdD0wIHJldHVybiBSPTBcbiAgICAgIGxldCBpID0gMTtcblxuICAgICAgLy8gRmluZCB0aGUgc21hbGxlc3QgaSA+PSAxIHN1Y2ggdGhhdCB0XigyXmkpIFx1MjI2MSAxIChtb2QgUClcbiAgICAgIGxldCB0X3RtcCA9IEZwLnNxcih0KTsgLy8gdF4oMl4xKVxuICAgICAgd2hpbGUgKCFGcC5lcWwodF90bXAsIEZwLk9ORSkpIHtcbiAgICAgICAgaSsrO1xuICAgICAgICB0X3RtcCA9IEZwLnNxcih0X3RtcCk7IC8vIHReKDJeMikuLi5cbiAgICAgICAgaWYgKGkgPT09IE0pIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGZpbmQgc3F1YXJlIHJvb3QnKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBleHBvbmVudCBmb3IgYjogMl4oTSAtIGkgLSAxKVxuICAgICAgY29uc3QgZXhwb25lbnQgPSBfMW4gPDwgQmlnSW50KE0gLSBpIC0gMSk7IC8vIGJpZ2ludCBpcyBpbXBvcnRhbnRcbiAgICAgIGNvbnN0IGIgPSBGcC5wb3coYywgZXhwb25lbnQpOyAvLyBiID0gMl4oTSAtIGkgLSAxKVxuXG4gICAgICAvLyBVcGRhdGUgdmFyaWFibGVzXG4gICAgICBNID0gaTtcbiAgICAgIGMgPSBGcC5zcXIoYik7IC8vIGMgPSBiXjJcbiAgICAgIHQgPSBGcC5tdWwodCwgYyk7IC8vIHQgPSAodCAqIGJeMilcbiAgICAgIFIgPSBGcC5tdWwoUiwgYik7IC8vIFIgPSBSKmJcbiAgICB9XG4gICAgcmV0dXJuIFI7XG4gIH07XG59XG5cbi8qKlxuICogU3F1YXJlIHJvb3QgZm9yIGEgZmluaXRlIGZpZWxkLiBXaWxsIHRyeSBvcHRpbWl6ZWQgdmVyc2lvbnMgZmlyc3Q6XG4gKlxuICogMS4gUCBcdTIyNjEgMyAobW9kIDQpXG4gKiAyLiBQIFx1MjI2MSA1IChtb2QgOClcbiAqIDMuIFAgXHUyMjYxIDkgKG1vZCAxNilcbiAqIDQuIFRvbmVsbGktU2hhbmtzIGFsZ29yaXRobVxuICpcbiAqIERpZmZlcmVudCBhbGdvcml0aG1zIGNhbiBnaXZlIGRpZmZlcmVudCByb290cywgaXQgaXMgdXAgdG8gdXNlciB0byBkZWNpZGUgd2hpY2ggb25lIHRoZXkgd2FudC5cbiAqIEZvciBleGFtcGxlIHRoZXJlIGlzIEZwU3FydE9kZC9GcFNxcnRFdmVuIHRvIGNob2ljZSByb290IGJhc2VkIG9uIG9kZG5lc3MgKHVzZWQgZm9yIGhhc2gtdG8tY3VydmUpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBTcXJ0KFA6IGJpZ2ludCk6IDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiBUIHtcbiAgLy8gUCBcdTIyNjEgMyAobW9kIDQpID0+IFx1MjIxQW4gPSBuXigoUCsxKS80KVxuICBpZiAoUCAlIF80biA9PT0gXzNuKSByZXR1cm4gc3FydDNtb2Q0O1xuICAvLyBQIFx1MjI2MSA1IChtb2QgOCkgPT4gQXRraW4gYWxnb3JpdGhtLCBwYWdlIDEwIG9mIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTIvNjg1LnBkZlxuICBpZiAoUCAlIF84biA9PT0gXzVuKSByZXR1cm4gc3FydDVtb2Q4O1xuICAvLyBQIFx1MjI2MSA5IChtb2QgMTYpID0+IEtvbmcgYWxnb3JpdGhtLCBwYWdlIDExIG9mIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTIvNjg1LnBkZiAoYWxnb3JpdGhtIDQpXG4gIGlmIChQICUgXzE2biA9PT0gXzluKSByZXR1cm4gc3FydDltb2QxNihQKTtcbiAgLy8gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtXG4gIHJldHVybiB0b25lbGxpU2hhbmtzKFApO1xufVxuXG4vLyBMaXR0bGUtZW5kaWFuIGNoZWNrIGZvciBmaXJzdCBMRSBiaXQgKGxhc3QgQkUgYml0KTtcbmV4cG9ydCBjb25zdCBpc05lZ2F0aXZlTEUgPSAobnVtOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYm9vbGVhbiA9PlxuICAobW9kKG51bSwgbW9kdWxvKSAmIF8xbikgPT09IF8xbjtcblxuLyoqIEZpZWxkIGlzIG5vdCBhbHdheXMgb3ZlciBwcmltZTogZm9yIGV4YW1wbGUsIEZwMiBoYXMgT1JERVIocSk9cF5tLiAqL1xuZXhwb3J0IGludGVyZmFjZSBJRmllbGQ8VD4ge1xuICBPUkRFUjogYmlnaW50O1xuICBCWVRFUzogbnVtYmVyO1xuICBCSVRTOiBudW1iZXI7XG4gIGlzTEU6IGJvb2xlYW47XG4gIFpFUk86IFQ7XG4gIE9ORTogVDtcbiAgLy8gMS1hcmdcbiAgY3JlYXRlOiAobnVtOiBUKSA9PiBUO1xuICBpc1ZhbGlkOiAobnVtOiBUKSA9PiBib29sZWFuO1xuICBpczA6IChudW06IFQpID0+IGJvb2xlYW47XG4gIGlzVmFsaWROb3QwOiAobnVtOiBUKSA9PiBib29sZWFuO1xuICBuZWcobnVtOiBUKTogVDtcbiAgaW52KG51bTogVCk6IFQ7XG4gIHNxcnQobnVtOiBUKTogVDtcbiAgc3FyKG51bTogVCk6IFQ7XG4gIC8vIDItYXJnc1xuICBlcWwobGhzOiBULCByaHM6IFQpOiBib29sZWFuO1xuICBhZGQobGhzOiBULCByaHM6IFQpOiBUO1xuICBzdWIobGhzOiBULCByaHM6IFQpOiBUO1xuICBtdWwobGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICBwb3cobGhzOiBULCBwb3dlcjogYmlnaW50KTogVDtcbiAgZGl2KGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVDtcbiAgLy8gTiBmb3IgTm9uTm9ybWFsaXplZCAoZm9yIG5vdylcbiAgYWRkTihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIHN1Yk4obGhzOiBULCByaHM6IFQpOiBUO1xuICBtdWxOKGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVDtcbiAgc3FyTihudW06IFQpOiBUO1xuXG4gIC8vIE9wdGlvbmFsXG4gIC8vIFNob3VsZCBiZSBzYW1lIGFzIHNnbjAgZnVuY3Rpb24gaW5cbiAgLy8gW1JGQzkzODBdKGh0dHBzOi8vd3d3LnJmYy1lZGl0b3Iub3JnL3JmYy9yZmM5MzgwI3NlY3Rpb24tNC4xKS5cbiAgLy8gTk9URTogc2duMCBpcyAnbmVnYXRpdmUgaW4gTEUnLCB3aGljaCBpcyBzYW1lIGFzIG9kZC4gQW5kIG5lZ2F0aXZlIGluIExFIGlzIGtpbmRhIHN0cmFuZ2UgZGVmaW5pdGlvbiBhbnl3YXkuXG4gIGlzT2RkPyhudW06IFQpOiBib29sZWFuOyAvLyBPZGQgaW5zdGVhZCBvZiBldmVuIHNpbmNlIHdlIGhhdmUgaXQgZm9yIEZwMlxuICAvLyBsZWdlbmRyZT8obnVtOiBUKTogVDtcbiAgaW52ZXJ0QmF0Y2g6IChsc3Q6IFRbXSkgPT4gVFtdO1xuICB0b0J5dGVzKG51bTogVCk6IFVpbnQ4QXJyYXk7XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSwgc2tpcFZhbGlkYXRpb24/OiBib29sZWFuKTogVDtcbiAgLy8gSWYgYyBpcyBGYWxzZSwgQ01PViByZXR1cm5zIGEsIG90aGVyd2lzZSBpdCByZXR1cm5zIGIuXG4gIGNtb3YoYTogVCwgYjogVCwgYzogYm9vbGVhbik6IFQ7XG59XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IEZJRUxEX0ZJRUxEUyA9IFtcbiAgJ2NyZWF0ZScsICdpc1ZhbGlkJywgJ2lzMCcsICduZWcnLCAnaW52JywgJ3NxcnQnLCAnc3FyJyxcbiAgJ2VxbCcsICdhZGQnLCAnc3ViJywgJ211bCcsICdwb3cnLCAnZGl2JyxcbiAgJ2FkZE4nLCAnc3ViTicsICdtdWxOJywgJ3Nxck4nXG5dIGFzIGNvbnN0O1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmllbGQ8VD4oZmllbGQ6IElGaWVsZDxUPik6IElGaWVsZDxUPiB7XG4gIGNvbnN0IGluaXRpYWwgPSB7XG4gICAgT1JERVI6ICdiaWdpbnQnLFxuICAgIEJZVEVTOiAnbnVtYmVyJyxcbiAgICBCSVRTOiAnbnVtYmVyJyxcbiAgfSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBjb25zdCBvcHRzID0gRklFTERfRklFTERTLnJlZHVjZSgobWFwLCB2YWw6IHN0cmluZykgPT4ge1xuICAgIG1hcFt2YWxdID0gJ2Z1bmN0aW9uJztcbiAgICByZXR1cm4gbWFwO1xuICB9LCBpbml0aWFsKTtcbiAgdmFsaWRhdGVPYmplY3QoZmllbGQsIG9wdHMpO1xuICAvLyBjb25zdCBtYXggPSAxNjM4NDtcbiAgLy8gaWYgKGZpZWxkLkJZVEVTIDwgMSB8fCBmaWVsZC5CWVRFUyA+IG1heCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkJyk7XG4gIC8vIGlmIChmaWVsZC5CSVRTIDwgMSB8fCBmaWVsZC5CSVRTID4gOCAqIG1heCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkJyk7XG4gIHJldHVybiBmaWVsZDtcbn1cblxuLy8gR2VuZXJpYyBmaWVsZCBmdW5jdGlvbnNcblxuLyoqXG4gKiBTYW1lIGFzIGBwb3dgIGJ1dCBmb3IgRnA6IG5vbi1jb25zdGFudC10aW1lLlxuICogVW5zYWZlIGluIHNvbWUgY29udGV4dHM6IHVzZXMgbGFkZGVyLCBzbyBjYW4gZXhwb3NlIGJpZ2ludCBiaXRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBQb3c8VD4oRnA6IElGaWVsZDxUPiwgbnVtOiBULCBwb3dlcjogYmlnaW50KTogVCB7XG4gIGlmIChwb3dlciA8IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGV4cG9uZW50LCBuZWdhdGl2ZXMgdW5zdXBwb3J0ZWQnKTtcbiAgaWYgKHBvd2VyID09PSBfMG4pIHJldHVybiBGcC5PTkU7XG4gIGlmIChwb3dlciA9PT0gXzFuKSByZXR1cm4gbnVtO1xuICBsZXQgcCA9IEZwLk9ORTtcbiAgbGV0IGQgPSBudW07XG4gIHdoaWxlIChwb3dlciA+IF8wbikge1xuICAgIGlmIChwb3dlciAmIF8xbikgcCA9IEZwLm11bChwLCBkKTtcbiAgICBkID0gRnAuc3FyKGQpO1xuICAgIHBvd2VyID4+PSBfMW47XG4gIH1cbiAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICogRWZmaWNpZW50bHkgaW52ZXJ0IGFuIGFycmF5IG9mIEZpZWxkIGVsZW1lbnRzLlxuICogRXhjZXB0aW9uLWZyZWUuIFdpbGwgcmV0dXJuIGB1bmRlZmluZWRgIGZvciAwIGVsZW1lbnRzLlxuICogQHBhcmFtIHBhc3NaZXJvIG1hcCAwIHRvIDAgKGluc3RlYWQgb2YgdW5kZWZpbmVkKVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBJbnZlcnRCYXRjaDxUPihGcDogSUZpZWxkPFQ+LCBudW1zOiBUW10sIHBhc3NaZXJvID0gZmFsc2UpOiBUW10ge1xuICBjb25zdCBpbnZlcnRlZCA9IG5ldyBBcnJheShudW1zLmxlbmd0aCkuZmlsbChwYXNzWmVybyA/IEZwLlpFUk8gOiB1bmRlZmluZWQpO1xuICAvLyBXYWxrIGZyb20gZmlyc3QgdG8gbGFzdCwgbXVsdGlwbHkgdGhlbSBieSBlYWNoIG90aGVyIE1PRCBwXG4gIGNvbnN0IG11bHRpcGxpZWRBY2MgPSBudW1zLnJlZHVjZSgoYWNjLCBudW0sIGkpID0+IHtcbiAgICBpZiAoRnAuaXMwKG51bSkpIHJldHVybiBhY2M7XG4gICAgaW52ZXJ0ZWRbaV0gPSBhY2M7XG4gICAgcmV0dXJuIEZwLm11bChhY2MsIG51bSk7XG4gIH0sIEZwLk9ORSk7XG4gIC8vIEludmVydCBsYXN0IGVsZW1lbnRcbiAgY29uc3QgaW52ZXJ0ZWRBY2MgPSBGcC5pbnYobXVsdGlwbGllZEFjYyk7XG4gIC8vIFdhbGsgZnJvbSBsYXN0IHRvIGZpcnN0LCBtdWx0aXBseSB0aGVtIGJ5IGludmVydGVkIGVhY2ggb3RoZXIgTU9EIHBcbiAgbnVtcy5yZWR1Y2VSaWdodCgoYWNjLCBudW0sIGkpID0+IHtcbiAgICBpZiAoRnAuaXMwKG51bSkpIHJldHVybiBhY2M7XG4gICAgaW52ZXJ0ZWRbaV0gPSBGcC5tdWwoYWNjLCBpbnZlcnRlZFtpXSk7XG4gICAgcmV0dXJuIEZwLm11bChhY2MsIG51bSk7XG4gIH0sIGludmVydGVkQWNjKTtcbiAgcmV0dXJuIGludmVydGVkO1xufVxuXG4vLyBUT0RPOiByZW1vdmVcbmV4cG9ydCBmdW5jdGlvbiBGcERpdjxUPihGcDogSUZpZWxkPFQ+LCBsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQge1xuICByZXR1cm4gRnAubXVsKGxocywgdHlwZW9mIHJocyA9PT0gJ2JpZ2ludCcgPyBpbnZlcnQocmhzLCBGcC5PUkRFUikgOiBGcC5pbnYocmhzKSk7XG59XG5cbi8qKlxuICogTGVnZW5kcmUgc3ltYm9sLlxuICogTGVnZW5kcmUgY29uc3RhbnQgaXMgdXNlZCB0byBjYWxjdWxhdGUgTGVnZW5kcmUgc3ltYm9sIChhIHwgcClcbiAqIHdoaWNoIGRlbm90ZXMgdGhlIHZhbHVlIG9mIGFeKChwLTEpLzIpIChtb2QgcCkuXG4gKlxuICogKiAoYSB8IHApIFx1MjI2MSAxICAgIGlmIGEgaXMgYSBzcXVhcmUgKG1vZCBwKSwgcXVhZHJhdGljIHJlc2lkdWVcbiAqICogKGEgfCBwKSBcdTIyNjEgLTEgICBpZiBhIGlzIG5vdCBhIHNxdWFyZSAobW9kIHApLCBxdWFkcmF0aWMgbm9uIHJlc2lkdWVcbiAqICogKGEgfCBwKSBcdTIyNjEgMCAgICBpZiBhIFx1MjI2MSAwIChtb2QgcClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZwTGVnZW5kcmU8VD4oRnA6IElGaWVsZDxUPiwgbjogVCk6IC0xIHwgMCB8IDEge1xuICAvLyBXZSBjYW4gdXNlIDNyZCBhcmd1bWVudCBhcyBvcHRpb25hbCBjYWNoZSBvZiB0aGlzIHZhbHVlXG4gIC8vIGJ1dCBzZWVtcyB1bm5lZWRlZCBmb3Igbm93LiBUaGUgb3BlcmF0aW9uIGlzIHZlcnkgZmFzdC5cbiAgY29uc3QgcDFtb2QyID0gKEZwLk9SREVSIC0gXzFuKSAvIF8ybjtcbiAgY29uc3QgcG93ZXJlZCA9IEZwLnBvdyhuLCBwMW1vZDIpO1xuICBjb25zdCB5ZXMgPSBGcC5lcWwocG93ZXJlZCwgRnAuT05FKTtcbiAgY29uc3QgemVybyA9IEZwLmVxbChwb3dlcmVkLCBGcC5aRVJPKTtcbiAgY29uc3Qgbm8gPSBGcC5lcWwocG93ZXJlZCwgRnAubmVnKEZwLk9ORSkpO1xuICBpZiAoIXllcyAmJiAhemVybyAmJiAhbm8pIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBMZWdlbmRyZSBzeW1ib2wgcmVzdWx0Jyk7XG4gIHJldHVybiB5ZXMgPyAxIDogemVybyA/IDAgOiAtMTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIFRydWUgd2hlbmV2ZXIgdGhlIHZhbHVlIHggaXMgYSBzcXVhcmUgaW4gdGhlIGZpZWxkIEYuXG5leHBvcnQgZnVuY3Rpb24gRnBJc1NxdWFyZTxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogYm9vbGVhbiB7XG4gIGNvbnN0IGwgPSBGcExlZ2VuZHJlKEZwLCBuKTtcbiAgcmV0dXJuIGwgPT09IDE7XG59XG5cbmV4cG9ydCB0eXBlIE5MZW5ndGggPSB7IG5CeXRlTGVuZ3RoOiBudW1iZXI7IG5CaXRMZW5ndGg6IG51bWJlciB9O1xuLy8gQ1VSVkUubiBsZW5ndGhzXG5leHBvcnQgZnVuY3Rpb24gbkxlbmd0aChuOiBiaWdpbnQsIG5CaXRMZW5ndGg/OiBudW1iZXIpOiBOTGVuZ3RoIHtcbiAgLy8gQml0IHNpemUsIGJ5dGUgc2l6ZSBvZiBDVVJWRS5uXG4gIGlmIChuQml0TGVuZ3RoICE9PSB1bmRlZmluZWQpIGFudW1iZXIobkJpdExlbmd0aCk7XG4gIGNvbnN0IF9uQml0TGVuZ3RoID0gbkJpdExlbmd0aCAhPT0gdW5kZWZpbmVkID8gbkJpdExlbmd0aCA6IG4udG9TdHJpbmcoMikubGVuZ3RoO1xuICBjb25zdCBuQnl0ZUxlbmd0aCA9IE1hdGguY2VpbChfbkJpdExlbmd0aCAvIDgpO1xuICByZXR1cm4geyBuQml0TGVuZ3RoOiBfbkJpdExlbmd0aCwgbkJ5dGVMZW5ndGggfTtcbn1cblxudHlwZSBGcEZpZWxkID0gSUZpZWxkPGJpZ2ludD4gJiBSZXF1aXJlZDxQaWNrPElGaWVsZDxiaWdpbnQ+LCAnaXNPZGQnPj47XG50eXBlIFNxcnRGbiA9IChuOiBiaWdpbnQpID0+IGJpZ2ludDtcbnR5cGUgRmllbGRPcHRzID0gUGFydGlhbDx7XG4gIGlzTEU6IGJvb2xlYW47XG4gIEJJVFM6IG51bWJlcjtcbiAgc3FydDogU3FydEZuO1xuICBhbGxvd2VkTGVuZ3Rocz86IHJlYWRvbmx5IG51bWJlcltdOyAvLyBmb3IgUDUyMSAoYWRkcyBwYWRkaW5nIGZvciBzbWFsbGVyIHNpemVzKVxuICBtb2RGcm9tQnl0ZXM6IGJvb2xlYW47IC8vIGJsczEyLTM4MSByZXF1aXJlcyBtb2QobikgaW5zdGVhZCBvZiByZWplY3Rpbmcga2V5cyA+PSBuXG59PjtcbmNsYXNzIF9GaWVsZCBpbXBsZW1lbnRzIElGaWVsZDxiaWdpbnQ+IHtcbiAgcmVhZG9ubHkgT1JERVI6IGJpZ2ludDtcbiAgcmVhZG9ubHkgQklUUzogbnVtYmVyO1xuICByZWFkb25seSBCWVRFUzogbnVtYmVyO1xuICByZWFkb25seSBpc0xFOiBib29sZWFuO1xuICByZWFkb25seSBaRVJPID0gXzBuO1xuICByZWFkb25seSBPTkUgPSBfMW47XG4gIHJlYWRvbmx5IF9sZW5ndGhzPzogbnVtYmVyW107XG4gIHByaXZhdGUgX3NxcnQ6IFJldHVyblR5cGU8dHlwZW9mIEZwU3FydD4gfCB1bmRlZmluZWQ7IC8vIGNhY2hlZCBzcXJ0XG4gIHByaXZhdGUgcmVhZG9ubHkgX21vZD86IGJvb2xlYW47XG4gIGNvbnN0cnVjdG9yKE9SREVSOiBiaWdpbnQsIG9wdHM6IEZpZWxkT3B0cyA9IHt9KSB7XG4gICAgaWYgKE9SREVSIDw9IF8wbikgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkOiBleHBlY3RlZCBPUkRFUiA+IDAsIGdvdCAnICsgT1JERVIpO1xuICAgIGxldCBfbmJpdExlbmd0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaXNMRSA9IGZhbHNlO1xuICAgIGlmIChvcHRzICE9IG51bGwgJiYgdHlwZW9mIG9wdHMgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdHMuQklUUyA9PT0gJ251bWJlcicpIF9uYml0TGVuZ3RoID0gb3B0cy5CSVRTO1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLnNxcnQgPT09ICdmdW5jdGlvbicpIHRoaXMuc3FydCA9IG9wdHMuc3FydDtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5pc0xFID09PSAnYm9vbGVhbicpIHRoaXMuaXNMRSA9IG9wdHMuaXNMRTtcbiAgICAgIGlmIChvcHRzLmFsbG93ZWRMZW5ndGhzKSB0aGlzLl9sZW5ndGhzID0gb3B0cy5hbGxvd2VkTGVuZ3Rocz8uc2xpY2UoKTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5tb2RGcm9tQnl0ZXMgPT09ICdib29sZWFuJykgdGhpcy5fbW9kID0gb3B0cy5tb2RGcm9tQnl0ZXM7XG4gICAgfVxuICAgIGNvbnN0IHsgbkJpdExlbmd0aCwgbkJ5dGVMZW5ndGggfSA9IG5MZW5ndGgoT1JERVIsIF9uYml0TGVuZ3RoKTtcbiAgICBpZiAobkJ5dGVMZW5ndGggPiAyMDQ4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQ6IGV4cGVjdGVkIE9SREVSIG9mIDw9IDIwNDggYnl0ZXMnKTtcbiAgICB0aGlzLk9SREVSID0gT1JERVI7XG4gICAgdGhpcy5CSVRTID0gbkJpdExlbmd0aDtcbiAgICB0aGlzLkJZVEVTID0gbkJ5dGVMZW5ndGg7XG4gICAgdGhpcy5fc3FydCA9IHVuZGVmaW5lZDtcbiAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnModGhpcyk7XG4gIH1cblxuICBjcmVhdGUobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKG51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgaXNWYWxpZChudW06IGJpZ2ludCkge1xuICAgIGlmICh0eXBlb2YgbnVtICE9PSAnYmlnaW50JylcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZCBlbGVtZW50OiBleHBlY3RlZCBiaWdpbnQsIGdvdCAnICsgdHlwZW9mIG51bSk7XG4gICAgcmV0dXJuIF8wbiA8PSBudW0gJiYgbnVtIDwgdGhpcy5PUkRFUjsgLy8gMCBpcyB2YWxpZCBlbGVtZW50LCBidXQgaXQncyBub3QgaW52ZXJ0aWJsZVxuICB9XG4gIGlzMChudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBudW0gPT09IF8wbjtcbiAgfVxuICAvLyBpcyB2YWxpZCBhbmQgaW52ZXJ0aWJsZVxuICBpc1ZhbGlkTm90MChudW06IGJpZ2ludCkge1xuICAgIHJldHVybiAhdGhpcy5pczAobnVtKSAmJiB0aGlzLmlzVmFsaWQobnVtKTtcbiAgfVxuICBpc09kZChudW06IGJpZ2ludCkge1xuICAgIHJldHVybiAobnVtICYgXzFuKSA9PT0gXzFuO1xuICB9XG4gIG5lZyhudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QoLW51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgZXFsKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgPT09IHJocztcbiAgfVxuXG4gIHNxcihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobnVtICogbnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBhZGQobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKyByaHMsIHRoaXMuT1JERVIpO1xuICB9XG4gIHN1YihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyAtIHJocywgdGhpcy5PUkRFUik7XG4gIH1cbiAgbXVsKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzICogcmhzLCB0aGlzLk9SREVSKTtcbiAgfVxuICBwb3cobnVtOiBiaWdpbnQsIHBvd2VyOiBiaWdpbnQpOiBiaWdpbnQge1xuICAgIHJldHVybiBGcFBvdyh0aGlzLCBudW0sIHBvd2VyKTtcbiAgfVxuICBkaXYobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKiBpbnZlcnQocmhzLCB0aGlzLk9SREVSKSwgdGhpcy5PUkRFUik7XG4gIH1cblxuICAvLyBTYW1lIGFzIGFib3ZlLCBidXQgZG9lc24ndCBub3JtYWxpemVcbiAgc3FyTihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBudW0gKiBudW07XG4gIH1cbiAgYWRkTihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzICsgcmhzO1xuICB9XG4gIHN1Yk4obGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyAtIHJocztcbiAgfVxuICBtdWxOKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgKiByaHM7XG4gIH1cblxuICBpbnYobnVtOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gaW52ZXJ0KG51bSwgdGhpcy5PUkRFUik7XG4gIH1cbiAgc3FydChudW06IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgLy8gQ2FjaGluZyBfc3FydCBzcGVlZHMgdXAgc3FydDltb2QxNiBieSA1eCBhbmQgdG9ubmVsaS1zaGFua3MgYnkgMTAlXG4gICAgaWYgKCF0aGlzLl9zcXJ0KSB0aGlzLl9zcXJ0ID0gRnBTcXJ0KHRoaXMuT1JERVIpO1xuICAgIHJldHVybiB0aGlzLl9zcXJ0KHRoaXMsIG51bSk7XG4gIH1cbiAgdG9CeXRlcyhudW06IGJpZ2ludCkge1xuICAgIHJldHVybiB0aGlzLmlzTEUgPyBudW1iZXJUb0J5dGVzTEUobnVtLCB0aGlzLkJZVEVTKSA6IG51bWJlclRvQnl0ZXNCRShudW0sIHRoaXMuQllURVMpO1xuICB9XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSwgc2tpcFZhbGlkYXRpb24gPSBmYWxzZSkge1xuICAgIGFieXRlcyhieXRlcyk7XG4gICAgY29uc3QgeyBfbGVuZ3RoczogYWxsb3dlZExlbmd0aHMsIEJZVEVTLCBpc0xFLCBPUkRFUiwgX21vZDogbW9kRnJvbUJ5dGVzIH0gPSB0aGlzO1xuICAgIGlmIChhbGxvd2VkTGVuZ3Rocykge1xuICAgICAgaWYgKCFhbGxvd2VkTGVuZ3Rocy5pbmNsdWRlcyhieXRlcy5sZW5ndGgpIHx8IGJ5dGVzLmxlbmd0aCA+IEJZVEVTKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnRmllbGQuZnJvbUJ5dGVzOiBleHBlY3RlZCAnICsgYWxsb3dlZExlbmd0aHMgKyAnIGJ5dGVzLCBnb3QgJyArIGJ5dGVzLmxlbmd0aFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgY29uc3QgcGFkZGVkID0gbmV3IFVpbnQ4QXJyYXkoQllURVMpO1xuICAgICAgLy8gaXNMRSBhZGQgMCB0byByaWdodCwgIWlzTEUgdG8gdGhlIGxlZnQuXG4gICAgICBwYWRkZWQuc2V0KGJ5dGVzLCBpc0xFID8gMCA6IHBhZGRlZC5sZW5ndGggLSBieXRlcy5sZW5ndGgpO1xuICAgICAgYnl0ZXMgPSBwYWRkZWQ7XG4gICAgfVxuICAgIGlmIChieXRlcy5sZW5ndGggIT09IEJZVEVTKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWVsZC5mcm9tQnl0ZXM6IGV4cGVjdGVkICcgKyBCWVRFUyArICcgYnl0ZXMsIGdvdCAnICsgYnl0ZXMubGVuZ3RoKTtcbiAgICBsZXQgc2NhbGFyID0gaXNMRSA/IGJ5dGVzVG9OdW1iZXJMRShieXRlcykgOiBieXRlc1RvTnVtYmVyQkUoYnl0ZXMpO1xuICAgIGlmIChtb2RGcm9tQnl0ZXMpIHNjYWxhciA9IG1vZChzY2FsYXIsIE9SREVSKTtcbiAgICBpZiAoIXNraXBWYWxpZGF0aW9uKVxuICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoc2NhbGFyKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkIGVsZW1lbnQ6IG91dHNpZGUgb2YgcmFuZ2UgMC4uT1JERVInKTtcbiAgICAvLyBOT1RFOiB3ZSBkb24ndCB2YWxpZGF0ZSBzY2FsYXIgaGVyZSwgcGxlYXNlIHVzZSBpc1ZhbGlkLiBUaGlzIGRvbmUgc3VjaCB3YXkgYmVjYXVzZSBzb21lXG4gICAgLy8gcHJvdG9jb2wgbWF5IGFsbG93IG5vbi1yZWR1Y2VkIHNjYWxhciB0aGF0IHJlZHVjZWQgbGF0ZXIgb3IgY2hhbmdlZCBzb21lIG90aGVyIHdheS5cbiAgICByZXR1cm4gc2NhbGFyO1xuICB9XG4gIC8vIFRPRE86IHdlIGRvbid0IG5lZWQgaXQgaGVyZSwgbW92ZSBvdXQgdG8gc2VwYXJhdGUgZm5cbiAgaW52ZXJ0QmF0Y2gobHN0OiBiaWdpbnRbXSk6IGJpZ2ludFtdIHtcbiAgICByZXR1cm4gRnBJbnZlcnRCYXRjaCh0aGlzLCBsc3QpO1xuICB9XG4gIC8vIFdlIGNhbid0IG1vdmUgdGhpcyBvdXQgYmVjYXVzZSBGcDYsIEZwMTIgaW1wbGVtZW50IGl0XG4gIC8vIGFuZCBpdCdzIHVuY2xlYXIgd2hhdCB0byByZXR1cm4gaW4gdGhlcmUuXG4gIGNtb3YoYTogYmlnaW50LCBiOiBiaWdpbnQsIGNvbmRpdGlvbjogYm9vbGVhbikge1xuICAgIHJldHVybiBjb25kaXRpb24gPyBiIDogYTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmaW5pdGUgZmllbGQuIE1ham9yIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnM6XG4gKiAqIDEuIERlbm9ybWFsaXplZCBvcGVyYXRpb25zIGxpa2UgbXVsTiBpbnN0ZWFkIG9mIG11bC5cbiAqICogMi4gSWRlbnRpY2FsIG9iamVjdCBzaGFwZTogbmV2ZXIgYWRkIG9yIHJlbW92ZSBrZXlzLlxuICogKiAzLiBgT2JqZWN0LmZyZWV6ZWAuXG4gKiBGcmFnaWxlOiBhbHdheXMgcnVuIGEgYmVuY2htYXJrIG9uIGEgY2hhbmdlLlxuICogU2VjdXJpdHkgbm90ZTogb3BlcmF0aW9ucyBkb24ndCBjaGVjayAnaXNWYWxpZCcgZm9yIGFsbCBlbGVtZW50cyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyxcbiAqIGl0IGlzIGNhbGxlciByZXNwb25zaWJpbGl0eSB0byBjaGVjayB0aGlzLlxuICogVGhpcyBpcyBsb3ctbGV2ZWwgY29kZSwgcGxlYXNlIG1ha2Ugc3VyZSB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAqXG4gKiBOb3RlIGFib3V0IGZpZWxkIHByb3BlcnRpZXM6XG4gKiAqIENIQVJBQ1RFUklTVElDIHAgPSBwcmltZSBudW1iZXIsIG51bWJlciBvZiBlbGVtZW50cyBpbiBtYWluIHN1Ymdyb3VwLlxuICogKiBPUkRFUiBxID0gc2ltaWxhciB0byBjb2ZhY3RvciBpbiBjdXJ2ZXMsIG1heSBiZSBjb21wb3NpdGUgYHEgPSBwXm1gLlxuICpcbiAqIEBwYXJhbSBPUkRFUiBmaWVsZCBvcmRlciwgcHJvYmFibHkgcHJpbWUsIG9yIGNvdWxkIGJlIGNvbXBvc2l0ZVxuICogQHBhcmFtIGJpdExlbiBob3cgbWFueSBiaXRzIHRoZSBmaWVsZCBjb25zdW1lc1xuICogQHBhcmFtIGlzTEUgKGRlZmF1bHQ6IGZhbHNlKSBpZiBlbmNvZGluZyAvIGRlY29kaW5nIHNob3VsZCBiZSBpbiBsaXR0bGUtZW5kaWFuXG4gKiBAcGFyYW0gcmVkZWYgb3B0aW9uYWwgZmFzdGVyIHJlZGVmaW5pdGlvbnMgb2Ygc3FydCBhbmQgb3RoZXIgbWV0aG9kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRmllbGQoT1JERVI6IGJpZ2ludCwgb3B0czogRmllbGRPcHRzID0ge30pOiBSZWFkb25seTxGcEZpZWxkPiB7XG4gIHJldHVybiBuZXcgX0ZpZWxkKE9SREVSLCBvcHRzKTtcbn1cblxuLy8gR2VuZXJpYyByYW5kb20gc2NhbGFyLCB3ZSBjYW4gZG8gc2FtZSBmb3Igb3RoZXIgZmllbGRzIGlmIHZpYSBGcDIubXVsKEZwMi5PTkUsIEZwMi5yYW5kb20pP1xuLy8gVGhpcyBhbGxvd3MgdW5zYWZlIG1ldGhvZHMgbGlrZSBpZ25vcmUgYmlhcyBvciB6ZXJvLiBUaGVzZSB1bnNhZmUsIGJ1dCBvZnRlbiB1c2VkIGluIGRpZmZlcmVudCBwcm90b2NvbHMgKGlmIGRldGVybWluaXN0aWMgUk5HKS5cbi8vIHdoaWNoIG1lYW4gd2UgY2Fubm90IGZvcmNlIHRoaXMgdmlhIG9wdHMuXG4vLyBOb3Qgc3VyZSB3aGF0IHRvIGRvIHdpdGggcmFuZG9tQnl0ZXMsIHdlIGNhbiBhY2NlcHQgaXQgaW5zaWRlIG9wdHMgaWYgd2FudGVkLlxuLy8gUHJvYmFibHkgbmVlZCB0byBleHBvcnQgZ2V0TWluSGFzaExlbmd0aCBzb21ld2hlcmU/XG4vLyByYW5kb20oYnl0ZXM/OiBVaW50OEFycmF5LCB1bnNhZmVBbGxvd1plcm8gPSBmYWxzZSwgdW5zYWZlQWxsb3dCaWFzID0gZmFsc2UpIHtcbi8vICAgY29uc3QgTEVOID0gIXVuc2FmZUFsbG93QmlhcyA/IGdldE1pbkhhc2hMZW5ndGgoT1JERVIpIDogQllURVM7XG4vLyAgIGlmIChieXRlcyA9PT0gdW5kZWZpbmVkKSBieXRlcyA9IHJhbmRvbUJ5dGVzKExFTik7IC8vIF9vcHRzLnJhbmRvbUJ5dGVzP1xuLy8gICBjb25zdCBudW0gPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGJ5dGVzKSA6IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7XG4vLyAgIC8vIGBtb2QoeCwgMTEpYCBjYW4gc29tZXRpbWVzIHByb2R1Y2UgMC4gYG1vZCh4LCAxMCkgKyAxYCBpcyB0aGUgc2FtZSwgYnV0IG5vIDBcbi8vICAgY29uc3QgcmVkdWNlZCA9IHVuc2FmZUFsbG93WmVybyA/IG1vZChudW0sIE9SREVSKSA6IG1vZChudW0sIE9SREVSIC0gXzFuKSArIF8xbjtcbi8vICAgcmV0dXJuIHJlZHVjZWQ7XG4vLyB9LFxuXG5leHBvcnQgZnVuY3Rpb24gRnBTcXJ0T2RkPFQ+KEZwOiBJRmllbGQ8VD4sIGVsbTogVCk6IFQge1xuICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWVsZCBkb2Vzbid0IGhhdmUgaXNPZGRcIik7XG4gIGNvbnN0IHJvb3QgPSBGcC5zcXJ0KGVsbSk7XG4gIHJldHVybiBGcC5pc09kZChyb290KSA/IHJvb3QgOiBGcC5uZWcocm9vdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnRFdmVuPFQ+KEZwOiBJRmllbGQ8VD4sIGVsbTogVCk6IFQge1xuICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoXCJGaWVsZCBkb2Vzbid0IGhhdmUgaXNPZGRcIik7XG4gIGNvbnN0IHJvb3QgPSBGcC5zcXJ0KGVsbSk7XG4gIHJldHVybiBGcC5pc09kZChyb290KSA/IEZwLm5lZyhyb290KSA6IHJvb3Q7XG59XG5cbi8qKlxuICogUmV0dXJucyB0b3RhbCBudW1iZXIgb2YgYnl0ZXMgY29uc3VtZWQgYnkgdGhlIGZpZWxkIGVsZW1lbnQuXG4gKiBGb3IgZXhhbXBsZSwgMzIgYnl0ZXMgZm9yIHVzdWFsIDI1Ni1iaXQgd2VpZXJzdHJhc3MgY3VydmUuXG4gKiBAcGFyYW0gZmllbGRPcmRlciBudW1iZXIgb2YgZmllbGQgZWxlbWVudHMsIHVzdWFsbHkgQ1VSVkUublxuICogQHJldHVybnMgYnl0ZSBsZW5ndGggb2YgZmllbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcjogYmlnaW50KTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiBmaWVsZE9yZGVyICE9PSAnYmlnaW50JykgdGhyb3cgbmV3IEVycm9yKCdmaWVsZCBvcmRlciBtdXN0IGJlIGJpZ2ludCcpO1xuICBjb25zdCBiaXRMZW5ndGggPSBmaWVsZE9yZGVyLnRvU3RyaW5nKDIpLmxlbmd0aDtcbiAgcmV0dXJuIE1hdGguY2VpbChiaXRMZW5ndGggLyA4KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIG1pbmltYWwgYW1vdW50IG9mIGJ5dGVzIHRoYXQgY2FuIGJlIHNhZmVseSByZWR1Y2VkXG4gKiBieSBmaWVsZCBvcmRlci5cbiAqIFNob3VsZCBiZSAyXi0xMjggZm9yIDEyOC1iaXQgY3VydmUgc3VjaCBhcyBQMjU2LlxuICogQHBhcmFtIGZpZWxkT3JkZXIgbnVtYmVyIG9mIGZpZWxkIGVsZW1lbnRzLCB1c3VhbGx5IENVUlZFLm5cbiAqIEByZXR1cm5zIGJ5dGUgbGVuZ3RoIG9mIHRhcmdldCBoYXNoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNaW5IYXNoTGVuZ3RoKGZpZWxkT3JkZXI6IGJpZ2ludCk6IG51bWJlciB7XG4gIGNvbnN0IGxlbmd0aCA9IGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcik7XG4gIHJldHVybiBsZW5ndGggKyBNYXRoLmNlaWwobGVuZ3RoIC8gMik7XG59XG5cbi8qKlxuICogXCJDb25zdGFudC10aW1lXCIgcHJpdmF0ZSBrZXkgZ2VuZXJhdGlvbiB1dGlsaXR5LlxuICogQ2FuIHRha2UgKG4gKyBuLzIpIG9yIG1vcmUgYnl0ZXMgb2YgdW5pZm9ybSBpbnB1dCBlLmcuIGZyb20gQ1NQUk5HIG9yIEtERlxuICogYW5kIGNvbnZlcnQgdGhlbSBpbnRvIHByaXZhdGUgc2NhbGFyLCB3aXRoIHRoZSBtb2R1bG8gYmlhcyBiZWluZyBuZWdsaWdpYmxlLlxuICogTmVlZHMgYXQgbGVhc3QgNDggYnl0ZXMgb2YgaW5wdXQgZm9yIDMyLWJ5dGUgcHJpdmF0ZSBrZXkuXG4gKiBodHRwczovL3Jlc2VhcmNoLmt1ZGVsc2tpc2VjdXJpdHkuY29tLzIwMjAvMDcvMjgvdGhlLWRlZmluaXRpdmUtZ3VpZGUtdG8tbW9kdWxvLWJpYXMtYW5kLWhvdy10by1hdm9pZC1pdC9cbiAqIEZJUFMgMTg2LTUsIEEuMiBodHRwczovL2NzcmMubmlzdC5nb3YvcHVibGljYXRpb25zL2RldGFpbC9maXBzLzE4Ni81L2ZpbmFsXG4gKiBSRkMgOTM4MCwgaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi01XG4gKiBAcGFyYW0gaGFzaCBoYXNoIG91dHB1dCBmcm9tIFNIQTMgb3IgYSBzaW1pbGFyIGZ1bmN0aW9uXG4gKiBAcGFyYW0gZ3JvdXBPcmRlciBzaXplIG9mIHN1Ymdyb3VwIC0gKGUuZy4gc2VjcDI1NmsxLlBvaW50LkZuLk9SREVSKVxuICogQHBhcmFtIGlzTEUgaW50ZXJwcmV0IGhhc2ggYnl0ZXMgYXMgTEUgbnVtXG4gKiBAcmV0dXJucyB2YWxpZCBwcml2YXRlIHNjYWxhclxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwSGFzaFRvRmllbGQoa2V5OiBVaW50OEFycmF5LCBmaWVsZE9yZGVyOiBiaWdpbnQsIGlzTEUgPSBmYWxzZSk6IFVpbnQ4QXJyYXkge1xuICBhYnl0ZXMoa2V5KTtcbiAgY29uc3QgbGVuID0ga2V5Lmxlbmd0aDtcbiAgY29uc3QgZmllbGRMZW4gPSBnZXRGaWVsZEJ5dGVzTGVuZ3RoKGZpZWxkT3JkZXIpO1xuICBjb25zdCBtaW5MZW4gPSBnZXRNaW5IYXNoTGVuZ3RoKGZpZWxkT3JkZXIpO1xuICAvLyBObyBzbWFsbCBudW1iZXJzOiBuZWVkIHRvIHVuZGVyc3RhbmQgYmlhcyBzdG9yeS4gTm8gaHVnZSBudW1iZXJzOiBlYXNpZXIgdG8gZGV0ZWN0IEpTIHRpbWluZ3MuXG4gIGlmIChsZW4gPCAxNiB8fCBsZW4gPCBtaW5MZW4gfHwgbGVuID4gMTAyNClcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkICcgKyBtaW5MZW4gKyAnLTEwMjQgYnl0ZXMgb2YgaW5wdXQsIGdvdCAnICsgbGVuKTtcbiAgY29uc3QgbnVtID0gaXNMRSA/IGJ5dGVzVG9OdW1iZXJMRShrZXkpIDogYnl0ZXNUb051bWJlckJFKGtleSk7XG4gIC8vIGBtb2QoeCwgMTEpYCBjYW4gc29tZXRpbWVzIHByb2R1Y2UgMC4gYG1vZCh4LCAxMCkgKyAxYCBpcyB0aGUgc2FtZSwgYnV0IG5vIDBcbiAgY29uc3QgcmVkdWNlZCA9IG1vZChudW0sIGZpZWxkT3JkZXIgLSBfMW4pICsgXzFuO1xuICByZXR1cm4gaXNMRSA/IG51bWJlclRvQnl0ZXNMRShyZWR1Y2VkLCBmaWVsZExlbikgOiBudW1iZXJUb0J5dGVzQkUocmVkdWNlZCwgZmllbGRMZW4pO1xufVxuIiwgIi8qKlxuICogU2hvcnQgV2VpZXJzdHJhc3MgY3VydmUgbWV0aG9kcy4gVGhlIGZvcm11bGEgaXM6IHlcdTAwQjIgPSB4XHUwMEIzICsgYXggKyBiLlxuICpcbiAqICMjIyBEZXNpZ24gcmF0aW9uYWxlIGZvciB0eXBlc1xuICpcbiAqICogSW50ZXJhY3Rpb24gYmV0d2VlbiBjbGFzc2VzIGZyb20gZGlmZmVyZW50IGN1cnZlcyBzaG91bGQgZmFpbDpcbiAqICAgYGsyNTYuUG9pbnQuQkFTRS5hZGQocDI1Ni5Qb2ludC5CQVNFKWBcbiAqICogRm9yIHRoaXMgcHVycG9zZSB3ZSB3YW50IHRvIHVzZSBgaW5zdGFuY2VvZmAgb3BlcmF0b3IsIHdoaWNoIGlzIGZhc3QgYW5kIHdvcmtzIGR1cmluZyBydW50aW1lXG4gKiAqIERpZmZlcmVudCBjYWxscyBvZiBgY3VydmUoKWAgd291bGQgcmV0dXJuIGRpZmZlcmVudCBjbGFzc2VzIC1cbiAqICAgYGN1cnZlKHBhcmFtcykgIT09IGN1cnZlKHBhcmFtcylgOiBpZiBzb21lYm9keSBkZWNpZGVkIHRvIG1vbmtleS1wYXRjaCB0aGVpciBjdXJ2ZSxcbiAqICAgaXQgd29uJ3QgYWZmZWN0IG90aGVyc1xuICpcbiAqIFR5cGVTY3JpcHQgY2FuJ3QgaW5mZXIgdHlwZXMgZm9yIGNsYXNzZXMgY3JlYXRlZCBpbnNpZGUgYSBmdW5jdGlvbi4gQ2xhc3NlcyBpcyBvbmUgaW5zdGFuY2VcbiAqIG9mIG5vbWluYXRpdmUgdHlwZXMgaW4gVHlwZVNjcmlwdCBhbmQgaW50ZXJmYWNlcyBvbmx5IGNoZWNrIGZvciBzaGFwZSwgc28gaXQncyBoYXJkIHRvIGNyZWF0ZVxuICogdW5pcXVlIHR5cGUgZm9yIGV2ZXJ5IGZ1bmN0aW9uIGNhbGwuXG4gKlxuICogV2UgY2FuIHVzZSBnZW5lcmljIHR5cGVzIHZpYSBzb21lIHBhcmFtLCBsaWtlIGN1cnZlIG9wdHMsIGJ1dCB0aGF0IHdvdWxkOlxuICogICAgIDEuIEVuYWJsZSBpbnRlcmFjdGlvbiBiZXR3ZWVuIGBjdXJ2ZShwYXJhbXMpYCBhbmQgYGN1cnZlKHBhcmFtcylgIChjdXJ2ZXMgb2Ygc2FtZSBwYXJhbXMpXG4gKiAgICAgd2hpY2ggaXMgaGFyZCB0byBkZWJ1Zy5cbiAqICAgICAyLiBQYXJhbXMgY2FuIGJlIGdlbmVyaWMgYW5kIHdlIGNhbid0IGVuZm9yY2UgdGhlbSB0byBiZSBjb25zdGFudCB2YWx1ZTpcbiAqICAgICBpZiBzb21lYm9keSBjcmVhdGVzIGN1cnZlIGZyb20gbm9uLWNvbnN0YW50IHBhcmFtcyxcbiAqICAgICBpdCB3b3VsZCBiZSBhbGxvd2VkIHRvIGludGVyYWN0IHdpdGggb3RoZXIgY3VydmVzIHdpdGggbm9uLWNvbnN0YW50IHBhcmFtc1xuICpcbiAqIEB0b2RvIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL3JlbGVhc2Utbm90ZXMvdHlwZXNjcmlwdC0yLTcuaHRtbCN1bmlxdWUtc3ltYm9sXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7IGhtYWMgYXMgbm9ibGVIbWFjIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9obWFjLmpzJztcbmltcG9ydCB7IGFoYXNoIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQge1xuICBhYm9vbCxcbiAgYWJ5dGVzLFxuICBhSW5SYW5nZSxcbiAgYml0TGVuLFxuICBiaXRNYXNrLFxuICBieXRlc1RvSGV4LFxuICBieXRlc1RvTnVtYmVyQkUsXG4gIGNvbmNhdEJ5dGVzLFxuICBjcmVhdGVIbWFjRHJiZyxcbiAgaGV4VG9CeXRlcyxcbiAgaXNCeXRlcyxcbiAgbWVtb2l6ZWQsXG4gIG51bWJlclRvSGV4VW5wYWRkZWQsXG4gIHZhbGlkYXRlT2JqZWN0LFxuICByYW5kb21CeXRlcyBhcyB3Y1JhbmRvbUJ5dGVzLFxuICB0eXBlIENIYXNoLFxuICB0eXBlIFNpZ25lcixcbn0gZnJvbSAnLi4vdXRpbHMudHMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlQ3VydmVGaWVsZHMsXG4gIGNyZWF0ZUtleWdlbixcbiAgbXVsRW5kb1Vuc2FmZSxcbiAgbmVnYXRlQ3QsXG4gIG5vcm1hbGl6ZVosXG4gIHdOQUYsXG4gIHR5cGUgQWZmaW5lUG9pbnQsXG4gIHR5cGUgQ3VydmVMZW5ndGhzLFxuICB0eXBlIEN1cnZlUG9pbnQsXG4gIHR5cGUgQ3VydmVQb2ludENvbnMsXG59IGZyb20gJy4vY3VydmUudHMnO1xuaW1wb3J0IHtcbiAgRnBJbnZlcnRCYXRjaCxcbiAgZ2V0TWluSGFzaExlbmd0aCxcbiAgbWFwSGFzaFRvRmllbGQsXG4gIHZhbGlkYXRlRmllbGQsXG4gIHR5cGUgSUZpZWxkLFxufSBmcm9tICcuL21vZHVsYXIudHMnO1xuXG5leHBvcnQgdHlwZSB7IEFmZmluZVBvaW50IH07XG5cbnR5cGUgRW5kb0Jhc2lzID0gW1tiaWdpbnQsIGJpZ2ludF0sIFtiaWdpbnQsIGJpZ2ludF1dO1xuLyoqXG4gKiBXaGVuIFdlaWVyc3RyYXNzIGN1cnZlIGhhcyBgYT0wYCwgaXQgYmVjb21lcyBLb2JsaXR6IGN1cnZlLlxuICogS29ibGl0eiBjdXJ2ZXMgYWxsb3cgdXNpbmcgKiplZmZpY2llbnRseS1jb21wdXRhYmxlIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4KiouXG4gKiBFbmRvbW9ycGhpc20gdXNlcyAyeCBsZXNzIFJBTSwgc3BlZWRzIHVwIHByZWNvbXB1dGF0aW9uIGJ5IDJ4IGFuZCBFQ0RIIC8ga2V5IHJlY292ZXJ5IGJ5IDIwJS5cbiAqIEZvciBwcmVjb21wdXRlZCB3TkFGIGl0IHRyYWRlcyBvZmYgMS8yIGluaXQgdGltZSAmIDEvMyByYW0gZm9yIDIwJSBwZXJmIGhpdC5cbiAqXG4gKiBFbmRvbW9ycGhpc20gY29uc2lzdHMgb2YgYmV0YSwgbGFtYmRhIGFuZCBzcGxpdFNjYWxhcjpcbiAqXG4gKiAxLiBHTFYgZW5kb21vcnBoaXNtIFx1MDNDOCB0cmFuc2Zvcm1zIGEgcG9pbnQ6IGBQID0gKHgsIHkpIFx1MjFBNiBcdTAzQzgoUCkgPSAoXHUwM0IyXHUwMEI3eCBtb2QgcCwgeSlgXG4gKiAyLiBHTFYgc2NhbGFyIGRlY29tcG9zaXRpb24gdHJhbnNmb3JtcyBhIHNjYWxhcjogYGsgXHUyMjYxIGtcdTIwODEgKyBrXHUyMDgyXHUwMEI3XHUwM0JCIChtb2QgbilgXG4gKiAzLiBUaGVuIHRoZXNlIGFyZSBjb21iaW5lZDogYGtcdTAwQjdQID0ga1x1MjA4MVx1MDBCN1AgKyBrXHUyMDgyXHUwMEI3XHUwM0M4KFApYFxuICogNC4gVHdvIDEyOC1iaXQgcG9pbnQtYnktc2NhbGFyIG11bHRpcGxpY2F0aW9ucyArIG9uZSBwb2ludCBhZGRpdGlvbiBpcyBmYXN0ZXIgdGhhblxuICogICAgb25lIDI1Ni1iaXQgbXVsdGlwbGljYXRpb24uXG4gKlxuICogd2hlcmVcbiAqICogYmV0YTogXHUwM0IyIFx1MjIwOCBGXHUyMDlBIHdpdGggXHUwM0IyXHUwMEIzID0gMSwgXHUwM0IyIFx1MjI2MCAxXG4gKiAqIGxhbWJkYTogXHUwM0JCIFx1MjIwOCBGXHUyMDk5IHdpdGggXHUwM0JCXHUwMEIzID0gMSwgXHUwM0JCIFx1MjI2MCAxXG4gKiAqIHNwbGl0U2NhbGFyIGRlY29tcG9zZXMgayBcdTIxQTYga1x1MjA4MSwga1x1MjA4MiwgYnkgdXNpbmcgcmVkdWNlZCBiYXNpcyB2ZWN0b3JzLlxuICogICBHYXVzcyBsYXR0aWNlIHJlZHVjdGlvbiBjYWxjdWxhdGVzIHRoZW0gZnJvbSBpbml0aWFsIGJhc2lzIHZlY3RvcnMgYChuLCAwKSwgKC1cdTAzQkIsIDApYFxuICpcbiAqIENoZWNrIG91dCBgdGVzdC9taXNjL2VuZG9tb3JwaGlzbS5qc2AgYW5kXG4gKiBbZ2lzdF0oaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bG1pbGxyL2ViNjcwODA2NzkzZTg0ZGY2MjhhN2M0MzRhODczMDY2KS5cbiAqL1xuZXhwb3J0IHR5cGUgRW5kb21vcnBoaXNtT3B0cyA9IHtcbiAgYmV0YTogYmlnaW50O1xuICBiYXNpc2VzPzogRW5kb0Jhc2lzO1xuICBzcGxpdFNjYWxhcj86IChrOiBiaWdpbnQpID0+IHsgazFuZWc6IGJvb2xlYW47IGsxOiBiaWdpbnQ7IGsybmVnOiBib29sZWFuOyBrMjogYmlnaW50IH07XG59O1xuLy8gV2UgY29uc3RydWN0IGJhc2lzIGluIHN1Y2ggd2F5IHRoYXQgZGVuIGlzIGFsd2F5cyBwb3NpdGl2ZSBhbmQgZXF1YWxzIG4sIGJ1dCBudW0gc2lnbiBkZXBlbmRzIG9uIGJhc2lzIChub3Qgb24gc2VjcmV0IHZhbHVlKVxuY29uc3QgZGl2TmVhcmVzdCA9IChudW06IGJpZ2ludCwgZGVuOiBiaWdpbnQpID0+IChudW0gKyAobnVtID49IDAgPyBkZW4gOiAtZGVuKSAvIF8ybikgLyBkZW47XG5cbmV4cG9ydCB0eXBlIFNjYWxhckVuZG9QYXJ0cyA9IHsgazFuZWc6IGJvb2xlYW47IGsxOiBiaWdpbnQ7IGsybmVnOiBib29sZWFuOyBrMjogYmlnaW50IH07XG5cbi8qKlxuICogU3BsaXRzIHNjYWxhciBmb3IgR0xWIGVuZG9tb3JwaGlzbS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9zcGxpdEVuZG9TY2FsYXIoazogYmlnaW50LCBiYXNpczogRW5kb0Jhc2lzLCBuOiBiaWdpbnQpOiBTY2FsYXJFbmRvUGFydHMge1xuICAvLyBTcGxpdCBzY2FsYXIgaW50byB0d28gc3VjaCB0aGF0IHBhcnQgaXMgfmhhbGYgYml0czogYGFicyhwYXJ0KSA8IHNxcnQoTilgXG4gIC8vIFNpbmNlIHBhcnQgY2FuIGJlIG5lZ2F0aXZlLCB3ZSBuZWVkIHRvIGRvIHRoaXMgb24gcG9pbnQuXG4gIC8vIFRPRE86IHZlcmlmeVNjYWxhciBmdW5jdGlvbiB3aGljaCBjb25zdW1lcyBsYW1iZGFcbiAgY29uc3QgW1thMSwgYjFdLCBbYTIsIGIyXV0gPSBiYXNpcztcbiAgY29uc3QgYzEgPSBkaXZOZWFyZXN0KGIyICogaywgbik7XG4gIGNvbnN0IGMyID0gZGl2TmVhcmVzdCgtYjEgKiBrLCBuKTtcbiAgLy8gfGsxfC98azJ8IGlzIDwgc3FydChOKSwgYnV0IGNhbiBiZSBuZWdhdGl2ZS5cbiAgLy8gSWYgd2UgZG8gYGsxIG1vZCBOYCwgd2UnbGwgZ2V0IGJpZyBzY2FsYXIgKGA+IHNxcnQoTilgKTogc28sIHdlIGRvIGNoZWFwZXIgbmVnYXRpb24gaW5zdGVhZC5cbiAgbGV0IGsxID0gayAtIGMxICogYTEgLSBjMiAqIGEyO1xuICBsZXQgazIgPSAtYzEgKiBiMSAtIGMyICogYjI7XG4gIGNvbnN0IGsxbmVnID0gazEgPCBfMG47XG4gIGNvbnN0IGsybmVnID0gazIgPCBfMG47XG4gIGlmIChrMW5lZykgazEgPSAtazE7XG4gIGlmIChrMm5lZykgazIgPSAtazI7XG4gIC8vIERvdWJsZSBjaGVjayB0aGF0IHJlc3VsdGluZyBzY2FsYXIgbGVzcyB0aGFuIGhhbGYgYml0cyBvZiBOOiBvdGhlcndpc2Ugd05BRiB3aWxsIGZhaWwuXG4gIC8vIFRoaXMgc2hvdWxkIG9ubHkgaGFwcGVuIG9uIHdyb25nIGJhc2lzZXMuIEFsc28sIG1hdGggaW5zaWRlIGlzIHRvbyBjb21wbGV4IGFuZCBJIGRvbid0IHRydXN0IGl0LlxuICBjb25zdCBNQVhfTlVNID0gYml0TWFzayhNYXRoLmNlaWwoYml0TGVuKG4pIC8gMikpICsgXzFuOyAvLyBIYWxmIGJpdHMgb2YgTlxuICBpZiAoazEgPCBfMG4gfHwgazEgPj0gTUFYX05VTSB8fCBrMiA8IF8wbiB8fCBrMiA+PSBNQVhfTlVNKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzcGxpdFNjYWxhciAoZW5kb21vcnBoaXNtKTogZmFpbGVkLCBrPScgKyBrKTtcbiAgfVxuICByZXR1cm4geyBrMW5lZywgazEsIGsybmVnLCBrMiB9O1xufVxuXG4vKipcbiAqIE9wdGlvbiB0byBlbmFibGUgaGVkZ2VkIHNpZ25hdHVyZXMgd2l0aCBpbXByb3ZlZCBzZWN1cml0eS5cbiAqXG4gKiAqIFJhbmRvbWx5IGdlbmVyYXRlZCBrIGlzIGJhZCwgYmVjYXVzZSBicm9rZW4gQ1NQUk5HIHdvdWxkIGxlYWsgcHJpdmF0ZSBrZXlzLlxuICogKiBEZXRlcm1pbmlzdGljIGsgKFJGQzY5NzkpIGlzIGJldHRlcjsgYnV0IGlzIHN1c3BlY3RpYmxlIHRvIGZhdWx0IGF0dGFja3MuXG4gKlxuICogV2UgYWxsb3cgdXNpbmcgdGVjaG5pcXVlIGRlc2NyaWJlZCBpbiBSRkM2OTc5IDMuNjogYWRkaXRpb25hbCBrJywgYS5rLmEuIGFkZGluZyByYW5kb21uZXNzXG4gKiB0byBkZXRlcm1pbmlzdGljIHNpZy4gSWYgQ1NQUk5HIGlzIGJyb2tlbiAmIHJhbmRvbW5lc3MgaXMgd2VhaywgaXQgd291bGQgU1RJTEwgYmUgYXMgc2VjdXJlXG4gKiBhcyBvcmRpbmFyeSBzaWcgd2l0aG91dCBFeHRyYUVudHJvcHkuXG4gKlxuICogKiBgdHJ1ZWAgbWVhbnMgXCJmZXRjaCBkYXRhLCBmcm9tIENTUFJORywgaW5jb3Jwb3JhdGUgaXQgaW50byBrIGdlbmVyYXRpb25cIlxuICogKiBgZmFsc2VgIG1lYW5zIFwiZGlzYWJsZSBleHRyYSBlbnRyb3B5LCB1c2UgcHVyZWx5IGRldGVybWluaXN0aWMga1wiXG4gKiAqIGBVaW50OEFycmF5YCBwYXNzZWQgbWVhbnMgXCJpbmNvcnBvcmF0ZSBmb2xsb3dpbmcgZGF0YSBpbnRvIGsgZ2VuZXJhdGlvblwiXG4gKlxuICogaHR0cHM6Ly9wYXVsbWlsbHIuY29tL3Bvc3RzL2RldGVybWluaXN0aWMtc2lnbmF0dXJlcy9cbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FFeHRyYUVudHJvcHkgPSBib29sZWFuIHwgVWludDhBcnJheTtcbi8qKlxuICogLSBgY29tcGFjdGAgaXMgdGhlIGRlZmF1bHQgZm9ybWF0XG4gKiAtIGByZWNvdmVyZWRgIGlzIHRoZSBzYW1lIGFzIGNvbXBhY3QsIGJ1dCB3aXRoIGFuIGV4dHJhIGJ5dGUgaW5kaWNhdGluZyByZWNvdmVyeSBieXRlXG4gKiAtIGBkZXJgIGlzIEFTTi4xIERFUiBlbmNvZGluZ1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9ICdjb21wYWN0JyB8ICdyZWNvdmVyZWQnIHwgJ2Rlcic7XG4vKipcbiAqIC0gYHByZWhhc2hgOiAoZGVmYXVsdDogdHJ1ZSkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gZG8gc2hhMjU2KG1lc3NhZ2UpLlxuICogICBXaGVuIGEgY3VzdG9tIGhhc2ggaXMgdXNlZCwgaXQgbXVzdCBiZSBzZXQgdG8gYGZhbHNlYC5cbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FSZWNvdmVyT3B0cyA9IHtcbiAgcHJlaGFzaD86IGJvb2xlYW47XG59O1xuLyoqXG4gKiAtIGBwcmVoYXNoYDogKGRlZmF1bHQ6IHRydWUpIGluZGljYXRlcyB3aGV0aGVyIHRvIGRvIHNoYTI1NihtZXNzYWdlKS5cbiAqICAgV2hlbiBhIGN1c3RvbSBoYXNoIGlzIHVzZWQsIGl0IG11c3QgYmUgc2V0IHRvIGBmYWxzZWAuXG4gKiAtIGBsb3dTYDogKGRlZmF1bHQ6IHRydWUpIHByb2hpYml0cyBzaWduYXR1cmVzIHdoaWNoIGhhdmUgKHNpZy5zID49IENVUlZFLm4vMm4pLlxuICogICBDb21wYXRpYmxlIHdpdGggQlRDL0VUSC4gU2V0dGluZyBgbG93UzogZmFsc2VgIGFsbG93cyB0byBjcmVhdGUgbWFsbGVhYmxlIHNpZ25hdHVyZXMsXG4gKiAgIHdoaWNoIGlzIGRlZmF1bHQgb3BlbnNzbCBiZWhhdmlvci5cbiAqICAgTm9uLW1hbGxlYWJsZSBzaWduYXR1cmVzIGNhbiBzdGlsbCBiZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgaW4gb3BlbnNzbC5cbiAqIC0gYGZvcm1hdGA6IChkZWZhdWx0OiAnY29tcGFjdCcpICdjb21wYWN0JyBvciAncmVjb3ZlcmVkJyB3aXRoIHJlY292ZXJ5IGJ5dGVcbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FWZXJpZnlPcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbiAgbG93Uz86IGJvb2xlYW47XG4gIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xufTtcbi8qKlxuICogLSBgcHJlaGFzaGA6IChkZWZhdWx0OiB0cnVlKSBpbmRpY2F0ZXMgd2hldGhlciB0byBkbyBzaGEyNTYobWVzc2FnZSkuXG4gKiAgIFdoZW4gYSBjdXN0b20gaGFzaCBpcyB1c2VkLCBpdCBtdXN0IGJlIHNldCB0byBgZmFsc2VgLlxuICogLSBgbG93U2A6IChkZWZhdWx0OiB0cnVlKSBwcm9oaWJpdHMgc2lnbmF0dXJlcyB3aGljaCBoYXZlIChzaWcucyA+PSBDVVJWRS5uLzJuKS5cbiAqICAgQ29tcGF0aWJsZSB3aXRoIEJUQy9FVEguIFNldHRpbmcgYGxvd1M6IGZhbHNlYCBhbGxvd3MgdG8gY3JlYXRlIG1hbGxlYWJsZSBzaWduYXR1cmVzLFxuICogICB3aGljaCBpcyBkZWZhdWx0IG9wZW5zc2wgYmVoYXZpb3IuXG4gKiAgIE5vbi1tYWxsZWFibGUgc2lnbmF0dXJlcyBjYW4gc3RpbGwgYmUgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIGluIG9wZW5zc2wuXG4gKiAtIGBmb3JtYXRgOiAoZGVmYXVsdDogJ2NvbXBhY3QnKSAnY29tcGFjdCcgb3IgJ3JlY292ZXJlZCcgd2l0aCByZWNvdmVyeSBieXRlXG4gKiAtIGBleHRyYUVudHJvcHlgOiAoZGVmYXVsdDogZmFsc2UpIGNyZWF0ZXMgc2lncyB3aXRoIGluY3JlYXNlZCBzZWN1cml0eSwgc2VlIHtAbGluayBFQ0RTQUV4dHJhRW50cm9weX1cbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FTaWduT3B0cyA9IHtcbiAgcHJlaGFzaD86IGJvb2xlYW47XG4gIGxvd1M/OiBib29sZWFuO1xuICBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdDtcbiAgZXh0cmFFbnRyb3B5PzogRUNEU0FFeHRyYUVudHJvcHk7XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVNpZ0Zvcm1hdChmb3JtYXQ6IHN0cmluZyk6IEVDRFNBU2lnbmF0dXJlRm9ybWF0IHtcbiAgaWYgKCFbJ2NvbXBhY3QnLCAncmVjb3ZlcmVkJywgJ2RlciddLmluY2x1ZGVzKGZvcm1hdCkpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdTaWduYXR1cmUgZm9ybWF0IG11c3QgYmUgXCJjb21wYWN0XCIsIFwicmVjb3ZlcmVkXCIsIG9yIFwiZGVyXCInKTtcbiAgcmV0dXJuIGZvcm1hdCBhcyBFQ0RTQVNpZ25hdHVyZUZvcm1hdDtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTaWdPcHRzPFQgZXh0ZW5kcyBFQ0RTQVNpZ25PcHRzLCBEIGV4dGVuZHMgUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz4+KFxuICBvcHRzOiBULFxuICBkZWY6IERcbik6IFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+IHtcbiAgY29uc3Qgb3B0c246IEVDRFNBU2lnbk9wdHMgPSB7fTtcbiAgZm9yIChsZXQgb3B0TmFtZSBvZiBPYmplY3Qua2V5cyhkZWYpKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG9wdHNuW29wdE5hbWVdID0gb3B0c1tvcHROYW1lXSA9PT0gdW5kZWZpbmVkID8gZGVmW29wdE5hbWVdIDogb3B0c1tvcHROYW1lXTtcbiAgfVxuICBhYm9vbChvcHRzbi5sb3dTISwgJ2xvd1MnKTtcbiAgYWJvb2wob3B0c24ucHJlaGFzaCEsICdwcmVoYXNoJyk7XG4gIGlmIChvcHRzbi5mb3JtYXQgIT09IHVuZGVmaW5lZCkgdmFsaWRhdGVTaWdGb3JtYXQob3B0c24uZm9ybWF0KTtcbiAgcmV0dXJuIG9wdHNuIGFzIFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+O1xufVxuXG4vKiogSW5zdGFuY2UgbWV0aG9kcyBmb3IgM0QgWFlaIHByb2plY3RpdmUgcG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBXZWllcnN0cmFzc1BvaW50PFQ+IGV4dGVuZHMgQ3VydmVQb2ludDxULCBXZWllcnN0cmFzc1BvaW50PFQ+PiB7XG4gIC8qKiBwcm9qZWN0aXZlIFggY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gYWZmaW5lIHguICovXG4gIHJlYWRvbmx5IFg6IFQ7XG4gIC8qKiBwcm9qZWN0aXZlIFkgY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gYWZmaW5lIHkuICovXG4gIHJlYWRvbmx5IFk6IFQ7XG4gIC8qKiBwcm9qZWN0aXZlIHogY29vcmRpbmF0ZSAqL1xuICByZWFkb25seSBaOiBUO1xuICAvKiogYWZmaW5lIHggY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSBYLiAqL1xuICBnZXQgeCgpOiBUO1xuICAvKiogYWZmaW5lIHkgY29vcmRpbmF0ZS4gRGlmZmVyZW50IGZyb20gcHJvamVjdGl2ZSBZLiAqL1xuICBnZXQgeSgpOiBUO1xuICAvKiogRW5jb2RlcyBwb2ludCB1c2luZyBJRUVFIFAxMzYzIChERVIpIGVuY29kaW5nLiBGaXJzdCBieXRlIGlzIDIvMy80LiBEZWZhdWx0ID0gaXNDb21wcmVzc2VkLiAqL1xuICB0b0J5dGVzKGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pOiBVaW50OEFycmF5O1xuICB0b0hleChpc0NvbXByZXNzZWQ/OiBib29sZWFuKTogc3RyaW5nO1xufVxuXG4vKiogU3RhdGljIG1ldGhvZHMgZm9yIDNEIFhZWiBwcm9qZWN0aXZlIHBvaW50cy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV2VpZXJzdHJhc3NQb2ludENvbnM8VD4gZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxXZWllcnN0cmFzc1BvaW50PFQ+PiB7XG4gIC8qKiBEb2VzIE5PVCB2YWxpZGF0ZSBpZiB0aGUgcG9pbnQgaXMgdmFsaWQuIFVzZSBgLmFzc2VydFZhbGlkaXR5KClgLiAqL1xuICBuZXcgKFg6IFQsIFk6IFQsIFo6IFQpOiBXZWllcnN0cmFzc1BvaW50PFQ+O1xuICBDVVJWRSgpOiBXZWllcnN0cmFzc09wdHM8VD47XG59XG5cbi8qKlxuICogV2VpZXJzdHJhc3MgY3VydmUgb3B0aW9ucy5cbiAqXG4gKiAqIHA6IHByaW1lIGNoYXJhY3RlcmlzdGljIChvcmRlcikgb2YgZmluaXRlIGZpZWxkLCBpbiB3aGljaCBhcml0aG1ldGljcyBpcyBkb25lXG4gKiAqIG46IG9yZGVyIG9mIHByaW1lIHN1Ymdyb3VwIGEuay5hIHRvdGFsIGFtb3VudCBvZiB2YWxpZCBjdXJ2ZSBwb2ludHNcbiAqICogaDogY29mYWN0b3IsIHVzdWFsbHkgMS4gaCpuIGlzIGdyb3VwIG9yZGVyOyBuIGlzIHN1Ymdyb3VwIG9yZGVyXG4gKiAqIGE6IGZvcm11bGEgcGFyYW0sIG11c3QgYmUgaW4gZmllbGQgb2YgcFxuICogKiBiOiBmb3JtdWxhIHBhcmFtLCBtdXN0IGJlIGluIGZpZWxkIG9mIHBcbiAqICogR3g6IHggY29vcmRpbmF0ZSBvZiBnZW5lcmF0b3IgcG9pbnQgYS5rLmEuIGJhc2UgcG9pbnRcbiAqICogR3k6IHkgY29vcmRpbmF0ZSBvZiBnZW5lcmF0b3IgcG9pbnRcbiAqL1xuZXhwb3J0IHR5cGUgV2VpZXJzdHJhc3NPcHRzPFQ+ID0gUmVhZG9ubHk8e1xuICBwOiBiaWdpbnQ7XG4gIG46IGJpZ2ludDtcbiAgaDogYmlnaW50O1xuICBhOiBUO1xuICBiOiBUO1xuICBHeDogVDtcbiAgR3k6IFQ7XG59PjtcblxuLy8gV2hlbiBhIGNvZmFjdG9yICE9IDEsIHRoZXJlIGNhbiBiZSBhbiBlZmZlY3RpdmUgbWV0aG9kcyB0bzpcbi8vIDEuIERldGVybWluZSB3aGV0aGVyIGEgcG9pbnQgaXMgdG9yc2lvbi1mcmVlXG4vLyAyLiBDbGVhciB0b3JzaW9uIGNvbXBvbmVudFxuZXhwb3J0IHR5cGUgV2VpZXJzdHJhc3NFeHRyYU9wdHM8VD4gPSBQYXJ0aWFsPHtcbiAgRnA6IElGaWVsZDxUPjtcbiAgRm46IElGaWVsZDxiaWdpbnQ+O1xuICBhbGxvd0luZmluaXR5UG9pbnQ6IGJvb2xlYW47XG4gIGVuZG86IEVuZG9tb3JwaGlzbU9wdHM7XG4gIGlzVG9yc2lvbkZyZWU6IChjOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPiwgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4pID0+IGJvb2xlYW47XG4gIGNsZWFyQ29mYWN0b3I6IChjOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPiwgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4pID0+IFdlaWVyc3RyYXNzUG9pbnQ8VD47XG4gIGZyb21CeXRlczogKGJ5dGVzOiBVaW50OEFycmF5KSA9PiBBZmZpbmVQb2ludDxUPjtcbiAgdG9CeXRlczogKFxuICAgIGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LFxuICAgIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+LFxuICAgIGlzQ29tcHJlc3NlZDogYm9vbGVhblxuICApID0+IFVpbnQ4QXJyYXk7XG59PjtcblxuLyoqXG4gKiBPcHRpb25zIGZvciBFQ0RTQSBzaWduYXR1cmVzIG92ZXIgYSBXZWllcnN0cmFzcyBjdXJ2ZS5cbiAqXG4gKiAqIGxvd1M6IChkZWZhdWx0OiB0cnVlKSB3aGV0aGVyIHByb2R1Y2VkIC8gdmVyaWZpZWQgc2lnbmF0dXJlcyBvY2N1cHkgbG93IGhhbGYgb2YgZWNkc2FPcHRzLnAuIFByZXZlbnRzIG1hbGxlYWJpbGl0eS5cbiAqICogaG1hYzogKGRlZmF1bHQ6IG5vYmxlLWhhc2hlcyBobWFjKSBmdW5jdGlvbiwgd291bGQgYmUgdXNlZCB0byBpbml0IGhtYWMtZHJiZyBmb3IgayBnZW5lcmF0aW9uLlxuICogKiByYW5kb21CeXRlczogKGRlZmF1bHQ6IHdlYmNyeXB0byBvcy1sZXZlbCBDU1BSTkcpIGN1c3RvbSBtZXRob2QgZm9yIGZldGNoaW5nIHNlY3VyZSByYW5kb21uZXNzLlxuICogKiBiaXRzMmludCwgYml0czJpbnRfbW9kTjogdXNlZCBpbiBzaWdzLCBzb21ldGltZXMgb3ZlcnJpZGRlbiBieSBjdXJ2ZXNcbiAqL1xuZXhwb3J0IHR5cGUgRUNEU0FPcHRzID0gUGFydGlhbDx7XG4gIGxvd1M6IGJvb2xlYW47XG4gIGhtYWM6IChrZXk6IFVpbnQ4QXJyYXksIG1lc3NhZ2U6IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gIHJhbmRvbUJ5dGVzOiAoYnl0ZXNMZW5ndGg/OiBudW1iZXIpID0+IFVpbnQ4QXJyYXk7XG4gIGJpdHMyaW50OiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IGJpZ2ludDtcbiAgYml0czJpbnRfbW9kTjogKGJ5dGVzOiBVaW50OEFycmF5KSA9PiBiaWdpbnQ7XG59PjtcblxuLyoqXG4gKiBFbGxpcHRpYyBDdXJ2ZSBEaWZmaWUtSGVsbG1hbiBpbnRlcmZhY2UuXG4gKiBQcm92aWRlcyBrZXlnZW4sIHNlY3JldC10by1wdWJsaWMgY29udmVyc2lvbiwgY2FsY3VsYXRpbmcgc2hhcmVkIHNlY3JldHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRUNESCB7XG4gIGtleWdlbjogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG4gIGdldFB1YmxpY0tleTogKHNlY3JldEtleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbikgPT4gVWludDhBcnJheTtcbiAgZ2V0U2hhcmVkU2VjcmV0OiAoXG4gICAgc2VjcmV0S2V5QTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXlCOiBVaW50OEFycmF5LFxuICAgIGlzQ29tcHJlc3NlZD86IGJvb2xlYW5cbiAgKSA9PiBVaW50OEFycmF5O1xuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PjtcbiAgdXRpbHM6IHtcbiAgICBpc1ZhbGlkU2VjcmV0S2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBib29sZWFuO1xuICAgIGlzVmFsaWRQdWJsaWNLZXk6IChwdWJsaWNLZXk6IFVpbnQ4QXJyYXksIGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pID0+IGJvb2xlYW47XG4gICAgcmFuZG9tU2VjcmV0S2V5OiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gIH07XG4gIGxlbmd0aHM6IEN1cnZlTGVuZ3Rocztcbn1cblxuLyoqXG4gKiBFQ0RTQSBpbnRlcmZhY2UuXG4gKiBPbmx5IHN1cHBvcnRlZCBmb3IgcHJpbWUgZmllbGRzLCBub3QgRnAyIChleHRlbnNpb24gZmllbGRzKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFQ0RTQSBleHRlbmRzIEVDREgge1xuICBzaWduOiAobWVzc2FnZTogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5LCBvcHRzPzogRUNEU0FTaWduT3B0cykgPT4gVWludDhBcnJheTtcbiAgdmVyaWZ5OiAoXG4gICAgc2lnbmF0dXJlOiBVaW50OEFycmF5LFxuICAgIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gICAgcHVibGljS2V5OiBVaW50OEFycmF5LFxuICAgIG9wdHM/OiBFQ0RTQVZlcmlmeU9wdHNcbiAgKSA9PiBib29sZWFuO1xuICByZWNvdmVyUHVibGljS2V5KHNpZ25hdHVyZTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSwgb3B0cz86IEVDRFNBUmVjb3Zlck9wdHMpOiBVaW50OEFycmF5O1xuICBTaWduYXR1cmU6IEVDRFNBU2lnbmF0dXJlQ29ucztcbn1cbmV4cG9ydCBjbGFzcyBERVJFcnIgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG0gPSAnJykge1xuICAgIHN1cGVyKG0pO1xuICB9XG59XG5leHBvcnQgdHlwZSBJREVSID0ge1xuICAvLyBhc24uMSBERVIgZW5jb2RpbmcgdXRpbHNcbiAgRXJyOiB0eXBlb2YgREVSRXJyO1xuICAvLyBCYXNpYyBidWlsZGluZyBibG9jayBpcyBUTFYgKFRhZy1MZW5ndGgtVmFsdWUpXG4gIF90bHY6IHtcbiAgICBlbmNvZGU6ICh0YWc6IG51bWJlciwgZGF0YTogc3RyaW5nKSA9PiBzdHJpbmc7XG4gICAgLy8gdiAtIHZhbHVlLCBsIC0gbGVmdCBieXRlcyAodW5wYXJzZWQpXG4gICAgZGVjb2RlKHRhZzogbnVtYmVyLCBkYXRhOiBVaW50OEFycmF5KTogeyB2OiBVaW50OEFycmF5OyBsOiBVaW50OEFycmF5IH07XG4gIH07XG4gIC8vIGh0dHBzOi8vY3J5cHRvLnN0YWNrZXhjaGFuZ2UuY29tL2EvNTc3MzQgTGVmdG1vc3QgYml0IG9mIGZpcnN0IGJ5dGUgaXMgJ25lZ2F0aXZlJyBmbGFnLFxuICAvLyBzaW5jZSB3ZSBhbHdheXMgdXNlIHBvc2l0aXZlIGludGVnZXJzIGhlcmUuIEl0IG11c3QgYWx3YXlzIGJlIGVtcHR5OlxuICAvLyAtIGFkZCB6ZXJvIGJ5dGUgaWYgZXhpc3RzXG4gIC8vIC0gaWYgbmV4dCBieXRlIGRvZXNuJ3QgaGF2ZSBhIGZsYWcsIGxlYWRpbmcgemVybyBpcyBub3QgYWxsb3dlZCAobWluaW1hbCBlbmNvZGluZylcbiAgX2ludDoge1xuICAgIGVuY29kZShudW06IGJpZ2ludCk6IHN0cmluZztcbiAgICBkZWNvZGUoZGF0YTogVWludDhBcnJheSk6IGJpZ2ludDtcbiAgfTtcbiAgdG9TaWcoaGV4OiBzdHJpbmcgfCBVaW50OEFycmF5KTogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9O1xuICBoZXhGcm9tU2lnKHNpZzogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9KTogc3RyaW5nO1xufTtcbi8qKlxuICogQVNOLjEgREVSIGVuY29kaW5nIHV0aWxpdGllcy4gQVNOIGlzIHZlcnkgY29tcGxleCAmIGZyYWdpbGUuIEZvcm1hdDpcbiAqXG4gKiAgICAgWzB4MzAgKFNFUVVFTkNFKSwgYnl0ZWxlbmd0aCwgMHgwMiAoSU5URUdFUiksIGludExlbmd0aCwgUiwgMHgwMiAoSU5URUdFUiksIGludExlbmd0aCwgU11cbiAqXG4gKiBEb2NzOiBodHRwczovL2xldHNlbmNyeXB0Lm9yZy9kb2NzL2Etd2FybS13ZWxjb21lLXRvLWFzbjEtYW5kLWRlci8sIGh0dHBzOi8vbHVjYS5udG9wLm9yZy9UZWFjaGluZy9BcHB1bnRpL2FzbjEuaHRtbFxuICovXG5leHBvcnQgY29uc3QgREVSOiBJREVSID0ge1xuICAvLyBhc24uMSBERVIgZW5jb2RpbmcgdXRpbHNcbiAgRXJyOiBERVJFcnIsXG4gIC8vIEJhc2ljIGJ1aWxkaW5nIGJsb2NrIGlzIFRMViAoVGFnLUxlbmd0aC1WYWx1ZSlcbiAgX3Rsdjoge1xuICAgIGVuY29kZTogKHRhZzogbnVtYmVyLCBkYXRhOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmICh0YWcgPCAwIHx8IHRhZyA+IDI1NikgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IHdyb25nIHRhZycpO1xuICAgICAgaWYgKGRhdGEubGVuZ3RoICYgMSkgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IHVucGFkZGVkIGRhdGEnKTtcbiAgICAgIGNvbnN0IGRhdGFMZW4gPSBkYXRhLmxlbmd0aCAvIDI7XG4gICAgICBjb25zdCBsZW4gPSBudW1iZXJUb0hleFVucGFkZGVkKGRhdGFMZW4pO1xuICAgICAgaWYgKChsZW4ubGVuZ3RoIC8gMikgJiAwYjEwMDBfMDAwMCkgdGhyb3cgbmV3IEUoJ3Rsdi5lbmNvZGU6IGxvbmcgZm9ybSBsZW5ndGggdG9vIGJpZycpO1xuICAgICAgLy8gbGVuZ3RoIG9mIGxlbmd0aCB3aXRoIGxvbmcgZm9ybSBmbGFnXG4gICAgICBjb25zdCBsZW5MZW4gPSBkYXRhTGVuID4gMTI3ID8gbnVtYmVyVG9IZXhVbnBhZGRlZCgobGVuLmxlbmd0aCAvIDIpIHwgMGIxMDAwXzAwMDApIDogJyc7XG4gICAgICBjb25zdCB0ID0gbnVtYmVyVG9IZXhVbnBhZGRlZCh0YWcpO1xuICAgICAgcmV0dXJuIHQgKyBsZW5MZW4gKyBsZW4gKyBkYXRhO1xuICAgIH0sXG4gICAgLy8gdiAtIHZhbHVlLCBsIC0gbGVmdCBieXRlcyAodW5wYXJzZWQpXG4gICAgZGVjb2RlKHRhZzogbnVtYmVyLCBkYXRhOiBVaW50OEFycmF5KTogeyB2OiBVaW50OEFycmF5OyBsOiBVaW50OEFycmF5IH0ge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGxldCBwb3MgPSAwO1xuICAgICAgaWYgKHRhZyA8IDAgfHwgdGFnID4gMjU2KSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogd3JvbmcgdGFnJyk7XG4gICAgICBpZiAoZGF0YS5sZW5ndGggPCAyIHx8IGRhdGFbcG9zKytdICE9PSB0YWcpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiB3cm9uZyB0bHYnKTtcbiAgICAgIGNvbnN0IGZpcnN0ID0gZGF0YVtwb3MrK107XG4gICAgICBjb25zdCBpc0xvbmcgPSAhIShmaXJzdCAmIDBiMTAwMF8wMDAwKTsgLy8gRmlyc3QgYml0IG9mIGZpcnN0IGxlbmd0aCBieXRlIGlzIGZsYWcgZm9yIHNob3J0L2xvbmcgZm9ybVxuICAgICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgICBpZiAoIWlzTG9uZykgbGVuZ3RoID0gZmlyc3Q7XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gTG9uZyBmb3JtOiBbbG9uZ0ZsYWcoMWJpdCksIGxlbmd0aExlbmd0aCg3Yml0KSwgbGVuZ3RoIChCRSldXG4gICAgICAgIGNvbnN0IGxlbkxlbiA9IGZpcnN0ICYgMGIwMTExXzExMTE7XG4gICAgICAgIGlmICghbGVuTGVuKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogaW5kZWZpbml0ZSBsZW5ndGggbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICBpZiAobGVuTGVuID4gNCkgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGUobG9uZyk6IGJ5dGUgbGVuZ3RoIGlzIHRvbyBiaWcnKTsgLy8gdGhpcyB3aWxsIG92ZXJmbG93IHUzMiBpbiBqc1xuICAgICAgICBjb25zdCBsZW5ndGhCeXRlcyA9IGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5MZW4pO1xuICAgICAgICBpZiAobGVuZ3RoQnl0ZXMubGVuZ3RoICE9PSBsZW5MZW4pIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiBsZW5ndGggYnl0ZXMgbm90IGNvbXBsZXRlJyk7XG4gICAgICAgIGlmIChsZW5ndGhCeXRlc1swXSA9PT0gMCkgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGUobG9uZyk6IHplcm8gbGVmdG1vc3QgYnl0ZScpO1xuICAgICAgICBmb3IgKGNvbnN0IGIgb2YgbGVuZ3RoQnl0ZXMpIGxlbmd0aCA9IChsZW5ndGggPDwgOCkgfCBiO1xuICAgICAgICBwb3MgKz0gbGVuTGVuO1xuICAgICAgICBpZiAobGVuZ3RoIDwgMTI4KSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogbm90IG1pbmltYWwgZW5jb2RpbmcnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHYgPSBkYXRhLnN1YmFycmF5KHBvcywgcG9zICsgbGVuZ3RoKTtcbiAgICAgIGlmICh2Lmxlbmd0aCAhPT0gbGVuZ3RoKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZTogd3JvbmcgdmFsdWUgbGVuZ3RoJyk7XG4gICAgICByZXR1cm4geyB2LCBsOiBkYXRhLnN1YmFycmF5KHBvcyArIGxlbmd0aCkgfTtcbiAgICB9LFxuICB9LFxuICAvLyBodHRwczovL2NyeXB0by5zdGFja2V4Y2hhbmdlLmNvbS9hLzU3NzM0IExlZnRtb3N0IGJpdCBvZiBmaXJzdCBieXRlIGlzICduZWdhdGl2ZScgZmxhZyxcbiAgLy8gc2luY2Ugd2UgYWx3YXlzIHVzZSBwb3NpdGl2ZSBpbnRlZ2VycyBoZXJlLiBJdCBtdXN0IGFsd2F5cyBiZSBlbXB0eTpcbiAgLy8gLSBhZGQgemVybyBieXRlIGlmIGV4aXN0c1xuICAvLyAtIGlmIG5leHQgYnl0ZSBkb2Vzbid0IGhhdmUgYSBmbGFnLCBsZWFkaW5nIHplcm8gaXMgbm90IGFsbG93ZWQgKG1pbmltYWwgZW5jb2RpbmcpXG4gIF9pbnQ6IHtcbiAgICBlbmNvZGUobnVtOiBiaWdpbnQpOiBzdHJpbmcge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmIChudW0gPCBfMG4pIHRocm93IG5ldyBFKCdpbnRlZ2VyOiBuZWdhdGl2ZSBpbnRlZ2VycyBhcmUgbm90IGFsbG93ZWQnKTtcbiAgICAgIGxldCBoZXggPSBudW1iZXJUb0hleFVucGFkZGVkKG51bSk7XG4gICAgICAvLyBQYWQgd2l0aCB6ZXJvIGJ5dGUgaWYgbmVnYXRpdmUgZmxhZyBpcyBwcmVzZW50XG4gICAgICBpZiAoTnVtYmVyLnBhcnNlSW50KGhleFswXSwgMTYpICYgMGIxMDAwKSBoZXggPSAnMDAnICsgaGV4O1xuICAgICAgaWYgKGhleC5sZW5ndGggJiAxKSB0aHJvdyBuZXcgRSgndW5leHBlY3RlZCBERVIgcGFyc2luZyBhc3NlcnRpb246IHVucGFkZGVkIGhleCcpO1xuICAgICAgcmV0dXJuIGhleDtcbiAgICB9LFxuICAgIGRlY29kZShkYXRhOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIGNvbnN0IHsgRXJyOiBFIH0gPSBERVI7XG4gICAgICBpZiAoZGF0YVswXSAmIDBiMTAwMF8wMDAwKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmUgaW50ZWdlcjogbmVnYXRpdmUnKTtcbiAgICAgIGlmIChkYXRhWzBdID09PSAweDAwICYmICEoZGF0YVsxXSAmIDBiMTAwMF8wMDAwKSlcbiAgICAgICAgdGhyb3cgbmV3IEUoJ2ludmFsaWQgc2lnbmF0dXJlIGludGVnZXI6IHVubmVjZXNzYXJ5IGxlYWRpbmcgemVybycpO1xuICAgICAgcmV0dXJuIGJ5dGVzVG9OdW1iZXJCRShkYXRhKTtcbiAgICB9LFxuICB9LFxuICB0b1NpZyhieXRlczogVWludDhBcnJheSk6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfSB7XG4gICAgLy8gcGFyc2UgREVSIHNpZ25hdHVyZVxuICAgIGNvbnN0IHsgRXJyOiBFLCBfaW50OiBpbnQsIF90bHY6IHRsdiB9ID0gREVSO1xuICAgIGNvbnN0IGRhdGEgPSBhYnl0ZXMoYnl0ZXMsIHVuZGVmaW5lZCwgJ3NpZ25hdHVyZScpO1xuICAgIGNvbnN0IHsgdjogc2VxQnl0ZXMsIGw6IHNlcUxlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDMwLCBkYXRhKTtcbiAgICBpZiAoc2VxTGVmdEJ5dGVzLmxlbmd0aCkgdGhyb3cgbmV3IEUoJ2ludmFsaWQgc2lnbmF0dXJlOiBsZWZ0IGJ5dGVzIGFmdGVyIHBhcnNpbmcnKTtcbiAgICBjb25zdCB7IHY6IHJCeXRlcywgbDogckxlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDAyLCBzZXFCeXRlcyk7XG4gICAgY29uc3QgeyB2OiBzQnl0ZXMsIGw6IHNMZWZ0Qnl0ZXMgfSA9IHRsdi5kZWNvZGUoMHgwMiwgckxlZnRCeXRlcyk7XG4gICAgaWYgKHNMZWZ0Qnl0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmU6IGxlZnQgYnl0ZXMgYWZ0ZXIgcGFyc2luZycpO1xuICAgIHJldHVybiB7IHI6IGludC5kZWNvZGUockJ5dGVzKSwgczogaW50LmRlY29kZShzQnl0ZXMpIH07XG4gIH0sXG4gIGhleEZyb21TaWcoc2lnOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH0pOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgX3RsdjogdGx2LCBfaW50OiBpbnQgfSA9IERFUjtcbiAgICBjb25zdCBycyA9IHRsdi5lbmNvZGUoMHgwMiwgaW50LmVuY29kZShzaWcucikpO1xuICAgIGNvbnN0IHNzID0gdGx2LmVuY29kZSgweDAyLCBpbnQuZW5jb2RlKHNpZy5zKSk7XG4gICAgY29uc3Qgc2VxID0gcnMgKyBzcztcbiAgICByZXR1cm4gdGx2LmVuY29kZSgweDMwLCBzZXEpO1xuICB9LFxufTtcblxuLy8gQmUgZnJpZW5kbHkgdG8gYmFkIEVDTUFTY3JpcHQgcGFyc2VycyBieSBub3QgdXNpbmcgYmlnaW50IGxpdGVyYWxzXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8wbiA9IEJpZ0ludCgwKSwgXzFuID0gQmlnSW50KDEpLCBfMm4gPSBCaWdJbnQoMiksIF8zbiA9IEJpZ0ludCgzKSwgXzRuID0gQmlnSW50KDQpO1xuXG4vKipcbiAqIENyZWF0ZXMgd2VpZXJzdHJhc3MgUG9pbnQgY29uc3RydWN0b3IsIGJhc2VkIG9uIHNwZWNpZmllZCBjdXJ2ZSBvcHRpb25zLlxuICpcbiAqIFNlZSB7QGxpbmsgV2VpZXJzdHJhc3NPcHRzfS5cbiAqXG4gKiBAZXhhbXBsZVxuYGBganNcbmNvbnN0IG9wdHMgPSB7XG4gIHA6IDB4ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmVmZmZmYWM3M24sXG4gIG46IDB4MTAwMDAwMDAwMDAwMDAwMDAwMDAxYjhmYTE2ZGZhYjlhY2ExNmI2YjNuLFxuICBoOiAxbixcbiAgYTogMG4sXG4gIGI6IDduLFxuICBHeDogMHgzYjRjMzgyY2UzN2FhMTkyYTQwMTllNzYzMDM2ZjRmNWRkNGQ3ZWJibixcbiAgR3k6IDB4OTM4Y2Y5MzUzMThmZGNlZDZiYzI4Mjg2NTMxNzMzYzNmMDNjNGZlZW4sXG59O1xuY29uc3Qgc2VjcDE2MGsxX1BvaW50ID0gd2VpZXJzdHJhc3Mob3B0cyk7XG5gYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlaWVyc3RyYXNzPFQ+KFxuICBwYXJhbXM6IFdlaWVyc3RyYXNzT3B0czxUPixcbiAgZXh0cmFPcHRzOiBXZWllcnN0cmFzc0V4dHJhT3B0czxUPiA9IHt9XG4pOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPiB7XG4gIGNvbnN0IHZhbGlkYXRlZCA9IGNyZWF0ZUN1cnZlRmllbGRzKCd3ZWllcnN0cmFzcycsIHBhcmFtcywgZXh0cmFPcHRzKTtcbiAgY29uc3QgeyBGcCwgRm4gfSA9IHZhbGlkYXRlZDtcbiAgbGV0IENVUlZFID0gdmFsaWRhdGVkLkNVUlZFIGFzIFdlaWVyc3RyYXNzT3B0czxUPjtcbiAgY29uc3QgeyBoOiBjb2ZhY3RvciwgbjogQ1VSVkVfT1JERVIgfSA9IENVUlZFO1xuICB2YWxpZGF0ZU9iamVjdChcbiAgICBleHRyYU9wdHMsXG4gICAge30sXG4gICAge1xuICAgICAgYWxsb3dJbmZpbml0eVBvaW50OiAnYm9vbGVhbicsXG4gICAgICBjbGVhckNvZmFjdG9yOiAnZnVuY3Rpb24nLFxuICAgICAgaXNUb3JzaW9uRnJlZTogJ2Z1bmN0aW9uJyxcbiAgICAgIGZyb21CeXRlczogJ2Z1bmN0aW9uJyxcbiAgICAgIHRvQnl0ZXM6ICdmdW5jdGlvbicsXG4gICAgICBlbmRvOiAnb2JqZWN0JyxcbiAgICB9XG4gICk7XG5cbiAgY29uc3QgeyBlbmRvIH0gPSBleHRyYU9wdHM7XG4gIGlmIChlbmRvKSB7XG4gICAgLy8gdmFsaWRhdGVPYmplY3QoZW5kbywgeyBiZXRhOiAnYmlnaW50Jywgc3BsaXRTY2FsYXI6ICdmdW5jdGlvbicgfSk7XG4gICAgaWYgKCFGcC5pczAoQ1VSVkUuYSkgfHwgdHlwZW9mIGVuZG8uYmV0YSAhPT0gJ2JpZ2ludCcgfHwgIUFycmF5LmlzQXJyYXkoZW5kby5iYXNpc2VzKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGVuZG86IGV4cGVjdGVkIFwiYmV0YVwiOiBiaWdpbnQgYW5kIFwiYmFzaXNlc1wiOiBhcnJheScpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGxlbmd0aHMgPSBnZXRXTGVuZ3RocyhGcCwgRm4pO1xuXG4gIGZ1bmN0aW9uIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKSB7XG4gICAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKCdjb21wcmVzc2lvbiBpcyBub3Qgc3VwcG9ydGVkOiBGaWVsZCBkb2VzIG5vdCBoYXZlIC5pc09kZCgpJyk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRzIElFRUUgUDEzNjMgcG9pbnQgZW5jb2RpbmdcbiAgZnVuY3Rpb24gcG9pbnRUb0J5dGVzKFxuICAgIF9jOiBXZWllcnN0cmFzc1BvaW50Q29uczxUPixcbiAgICBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPixcbiAgICBpc0NvbXByZXNzZWQ6IGJvb2xlYW5cbiAgKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBwb2ludC50b0FmZmluZSgpO1xuICAgIGNvbnN0IGJ4ID0gRnAudG9CeXRlcyh4KTtcbiAgICBhYm9vbChpc0NvbXByZXNzZWQsICdpc0NvbXByZXNzZWQnKTtcbiAgICBpZiAoaXNDb21wcmVzc2VkKSB7XG4gICAgICBhc3NlcnRDb21wcmVzc2lvbklzU3VwcG9ydGVkKCk7XG4gICAgICBjb25zdCBoYXNFdmVuWSA9ICFGcC5pc09kZCEoeSk7XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMocHByZWZpeChoYXNFdmVuWSksIGJ4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKFVpbnQ4QXJyYXkub2YoMHgwNCksIGJ4LCBGcC50b0J5dGVzKHkpKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcG9pbnRGcm9tQnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpIHtcbiAgICBhYnl0ZXMoYnl0ZXMsIHVuZGVmaW5lZCwgJ1BvaW50Jyk7XG4gICAgY29uc3QgeyBwdWJsaWNLZXk6IGNvbXAsIHB1YmxpY0tleVVuY29tcHJlc3NlZDogdW5jb21wIH0gPSBsZW5ndGhzOyAvLyBlLmcuIGZvciAzMi1ieXRlOiAzMywgNjVcbiAgICBjb25zdCBsZW5ndGggPSBieXRlcy5sZW5ndGg7XG4gICAgY29uc3QgaGVhZCA9IGJ5dGVzWzBdO1xuICAgIGNvbnN0IHRhaWwgPSBieXRlcy5zdWJhcnJheSgxKTtcbiAgICAvLyBObyBhY3R1YWwgdmFsaWRhdGlvbiBpcyBkb25lIGhlcmU6IHVzZSAuYXNzZXJ0VmFsaWRpdHkoKVxuICAgIGlmIChsZW5ndGggPT09IGNvbXAgJiYgKGhlYWQgPT09IDB4MDIgfHwgaGVhZCA9PT0gMHgwMykpIHtcbiAgICAgIGNvbnN0IHggPSBGcC5mcm9tQnl0ZXModGFpbCk7XG4gICAgICBpZiAoIUZwLmlzVmFsaWQoeCkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUsIHdyb25nIHgnKTtcbiAgICAgIGNvbnN0IHkyID0gd2VpZXJzdHJhc3NFcXVhdGlvbih4KTsgLy8geVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGJcbiAgICAgIGxldCB5OiBUO1xuICAgICAgdHJ5IHtcbiAgICAgICAgeSA9IEZwLnNxcnQoeTIpOyAvLyB5ID0geVx1MDBCMiBeIChwKzEpLzRcbiAgICAgIH0gY2F0Y2ggKHNxcnRFcnJvcikge1xuICAgICAgICBjb25zdCBlcnIgPSBzcXJ0RXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/ICc6ICcgKyBzcXJ0RXJyb3IubWVzc2FnZSA6ICcnO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogaXMgbm90IG9uIGN1cnZlLCBzcXJ0IGVycm9yJyArIGVycik7XG4gICAgICB9XG4gICAgICBhc3NlcnRDb21wcmVzc2lvbklzU3VwcG9ydGVkKCk7XG4gICAgICBjb25zdCBldmVuWSA9IEZwLmlzT2RkISh5KTtcbiAgICAgIGNvbnN0IGV2ZW5IID0gKGhlYWQgJiAxKSA9PT0gMTsgLy8gRUNEU0Etc3BlY2lmaWNcbiAgICAgIGlmIChldmVuSCAhPT0gZXZlblkpIHkgPSBGcC5uZWcoeSk7XG4gICAgICByZXR1cm4geyB4LCB5IH07XG4gICAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuY29tcCAmJiBoZWFkID09PSAweDA0KSB7XG4gICAgICAvLyBUT0RPOiBtb3JlIGNoZWNrc1xuICAgICAgY29uc3QgTCA9IEZwLkJZVEVTO1xuICAgICAgY29uc3QgeCA9IEZwLmZyb21CeXRlcyh0YWlsLnN1YmFycmF5KDAsIEwpKTtcbiAgICAgIGNvbnN0IHkgPSBGcC5mcm9tQnl0ZXModGFpbC5zdWJhcnJheShMLCBMICogMikpO1xuICAgICAgaWYgKCFpc1ZhbGlkWFkoeCwgeSkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUnKTtcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgYmFkIHBvaW50OiBnb3QgbGVuZ3RoICR7bGVuZ3RofSwgZXhwZWN0ZWQgY29tcHJlc3NlZD0ke2NvbXB9IG9yIHVuY29tcHJlc3NlZD0ke3VuY29tcH1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGVuY29kZVBvaW50ID0gZXh0cmFPcHRzLnRvQnl0ZXMgfHwgcG9pbnRUb0J5dGVzO1xuICBjb25zdCBkZWNvZGVQb2ludCA9IGV4dHJhT3B0cy5mcm9tQnl0ZXMgfHwgcG9pbnRGcm9tQnl0ZXM7XG4gIGZ1bmN0aW9uIHdlaWVyc3RyYXNzRXF1YXRpb24oeDogVCk6IFQge1xuICAgIGNvbnN0IHgyID0gRnAuc3FyKHgpOyAvLyB4ICogeFxuICAgIGNvbnN0IHgzID0gRnAubXVsKHgyLCB4KTsgLy8geFx1MDBCMiAqIHhcbiAgICByZXR1cm4gRnAuYWRkKEZwLmFkZCh4MywgRnAubXVsKHgsIENVUlZFLmEpKSwgQ1VSVkUuYik7IC8vIHhcdTAwQjMgKyBhICogeCArIGJcbiAgfVxuXG4gIC8vIFRPRE86IG1vdmUgdG9wLWxldmVsXG4gIC8qKiBDaGVja3Mgd2hldGhlciBlcXVhdGlvbiBob2xkcyBmb3IgZ2l2ZW4geCwgeTogeVx1MDBCMiA9PSB4XHUwMEIzICsgYXggKyBiICovXG4gIGZ1bmN0aW9uIGlzVmFsaWRYWSh4OiBULCB5OiBUKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbGVmdCA9IEZwLnNxcih5KTsgLy8geVx1MDBCMlxuICAgIGNvbnN0IHJpZ2h0ID0gd2VpZXJzdHJhc3NFcXVhdGlvbih4KTsgLy8geFx1MDBCMyArIGF4ICsgYlxuICAgIHJldHVybiBGcC5lcWwobGVmdCwgcmlnaHQpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgd2hldGhlciB0aGUgcGFzc2VkIGN1cnZlIHBhcmFtcyBhcmUgdmFsaWQuXG4gIC8vIFRlc3QgMTogZXF1YXRpb24geVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGIgc2hvdWxkIHdvcmsgZm9yIGdlbmVyYXRvciBwb2ludC5cbiAgaWYgKCFpc1ZhbGlkWFkoQ1VSVkUuR3gsIENVUlZFLkd5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgY3VydmUgcGFyYW1zOiBnZW5lcmF0b3IgcG9pbnQnKTtcblxuICAvLyBUZXN0IDI6IGRpc2NyaW1pbmFudCBcdTAzOTQgcGFydCBzaG91bGQgYmUgbm9uLXplcm86IDRhXHUwMEIzICsgMjdiXHUwMEIyICE9IDAuXG4gIC8vIEd1YXJhbnRlZXMgY3VydmUgaXMgZ2VudXMtMSwgc21vb3RoIChub24tc2luZ3VsYXIpLlxuICBjb25zdCBfNGEzID0gRnAubXVsKEZwLnBvdyhDVVJWRS5hLCBfM24pLCBfNG4pO1xuICBjb25zdCBfMjdiMiA9IEZwLm11bChGcC5zcXIoQ1VSVkUuYiksIEJpZ0ludCgyNykpO1xuICBpZiAoRnAuaXMwKEZwLmFkZChfNGEzLCBfMjdiMikpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjdXJ2ZSBwYXJhbXM6IGEgb3IgYicpO1xuXG4gIC8qKiBBc3NlcnRzIGNvb3JkaW5hdGUgaXMgdmFsaWQ6IDAgPD0gbiA8IEZwLk9SREVSLiAqL1xuICBmdW5jdGlvbiBhY29vcmQodGl0bGU6IHN0cmluZywgbjogVCwgYmFuWmVybyA9IGZhbHNlKSB7XG4gICAgaWYgKCFGcC5pc1ZhbGlkKG4pIHx8IChiYW5aZXJvICYmIEZwLmlzMChuKSkpIHRocm93IG5ldyBFcnJvcihgYmFkIHBvaW50IGNvb3JkaW5hdGUgJHt0aXRsZX1gKTtcbiAgICByZXR1cm4gbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcmpwb2ludChvdGhlcjogdW5rbm93bikge1xuICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgUG9pbnQpKSB0aHJvdyBuZXcgRXJyb3IoJ1dlaWVyc3RyYXNzIFBvaW50IGV4cGVjdGVkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzcGxpdEVuZG9TY2FsYXJOKGs6IGJpZ2ludCkge1xuICAgIGlmICghZW5kbyB8fCAhZW5kby5iYXNpc2VzKSB0aHJvdyBuZXcgRXJyb3IoJ25vIGVuZG8nKTtcbiAgICByZXR1cm4gX3NwbGl0RW5kb1NjYWxhcihrLCBlbmRvLmJhc2lzZXMsIEZuLk9SREVSKTtcbiAgfVxuXG4gIC8vIE1lbW9pemVkIHRvQWZmaW5lIC8gdmFsaWRpdHkgY2hlY2suIFRoZXkgYXJlIGhlYXZ5LiBQb2ludHMgYXJlIGltbXV0YWJsZS5cblxuICAvLyBDb252ZXJ0cyBQcm9qZWN0aXZlIHBvaW50IHRvIGFmZmluZSAoeCwgeSkgY29vcmRpbmF0ZXMuXG4gIC8vIENhbiBhY2NlcHQgcHJlY29tcHV0ZWQgWl4tMSAtIGZvciBleGFtcGxlLCBmcm9tIGludmVydEJhdGNoLlxuICAvLyAoWCwgWSwgWikgXHUyMjBCICh4PVgvWiwgeT1ZL1opXG4gIGNvbnN0IHRvQWZmaW5lTWVtbyA9IG1lbW9pemVkKChwOiBQb2ludCwgaXo/OiBUKTogQWZmaW5lUG9pbnQ8VD4gPT4ge1xuICAgIGNvbnN0IHsgWCwgWSwgWiB9ID0gcDtcbiAgICAvLyBGYXN0LXBhdGggZm9yIG5vcm1hbGl6ZWQgcG9pbnRzXG4gICAgaWYgKEZwLmVxbChaLCBGcC5PTkUpKSByZXR1cm4geyB4OiBYLCB5OiBZIH07XG4gICAgY29uc3QgaXMwID0gcC5pczAoKTtcbiAgICAvLyBJZiBpbnZaIHdhcyAwLCB3ZSByZXR1cm4gemVybyBwb2ludC4gSG93ZXZlciB3ZSBzdGlsbCB3YW50IHRvIGV4ZWN1dGVcbiAgICAvLyBhbGwgb3BlcmF0aW9ucywgc28gd2UgcmVwbGFjZSBpbnZaIHdpdGggYSByYW5kb20gbnVtYmVyLCAxLlxuICAgIGlmIChpeiA9PSBudWxsKSBpeiA9IGlzMCA/IEZwLk9ORSA6IEZwLmludihaKTtcbiAgICBjb25zdCB4ID0gRnAubXVsKFgsIGl6KTtcbiAgICBjb25zdCB5ID0gRnAubXVsKFksIGl6KTtcbiAgICBjb25zdCB6eiA9IEZwLm11bChaLCBpeik7XG4gICAgaWYgKGlzMCkgcmV0dXJuIHsgeDogRnAuWkVSTywgeTogRnAuWkVSTyB9O1xuICAgIGlmICghRnAuZXFsKHp6LCBGcC5PTkUpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludlogd2FzIGludmFsaWQnKTtcbiAgICByZXR1cm4geyB4LCB5IH07XG4gIH0pO1xuICAvLyBOT1RFOiBvbiBleGNlcHRpb24gdGhpcyB3aWxsIGNyYXNoICdjYWNoZWQnIGFuZCBubyB2YWx1ZSB3aWxsIGJlIHNldC5cbiAgLy8gT3RoZXJ3aXNlIHRydWUgd2lsbCBiZSByZXR1cm5cbiAgY29uc3QgYXNzZXJ0VmFsaWRNZW1vID0gbWVtb2l6ZWQoKHA6IFBvaW50KSA9PiB7XG4gICAgaWYgKHAuaXMwKCkpIHtcbiAgICAgIC8vICgwLCAxLCAwKSBha2EgWkVSTyBpcyBpbnZhbGlkIGluIG1vc3QgY29udGV4dHMuXG4gICAgICAvLyBJbiBCTFMsIFpFUk8gY2FuIGJlIHNlcmlhbGl6ZWQsIHNvIHdlIGFsbG93IGl0LlxuICAgICAgLy8gKDAsIDAsIDApIGlzIGludmFsaWQgcmVwcmVzZW50YXRpb24gb2YgWkVSTy5cbiAgICAgIGlmIChleHRyYU9wdHMuYWxsb3dJbmZpbml0eVBvaW50ICYmICFGcC5pczAocC5ZKSkgcmV0dXJuO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IFpFUk8nKTtcbiAgICB9XG4gICAgLy8gU29tZSAzcmQtcGFydHkgdGVzdCB2ZWN0b3JzIHJlcXVpcmUgZGlmZmVyZW50IHdvcmRpbmcgYmV0d2VlbiBoZXJlICYgYGZyb21Db21wcmVzc2VkSGV4YFxuICAgIGNvbnN0IHsgeCwgeSB9ID0gcC50b0FmZmluZSgpO1xuICAgIGlmICghRnAuaXNWYWxpZCh4KSB8fCAhRnAuaXNWYWxpZCh5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IHggb3IgeSBub3QgZmllbGQgZWxlbWVudHMnKTtcbiAgICBpZiAoIWlzVmFsaWRYWSh4LCB5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGVxdWF0aW9uIGxlZnQgIT0gcmlnaHQnKTtcbiAgICBpZiAoIXAuaXNUb3JzaW9uRnJlZSgpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogbm90IGluIHByaW1lLW9yZGVyIHN1Ymdyb3VwJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGZpbmlzaEVuZG8oXG4gICAgZW5kb0JldGE6IEVuZG9tb3JwaGlzbU9wdHNbJ2JldGEnXSxcbiAgICBrMXA6IFBvaW50LFxuICAgIGsycDogUG9pbnQsXG4gICAgazFuZWc6IGJvb2xlYW4sXG4gICAgazJuZWc6IGJvb2xlYW5cbiAgKSB7XG4gICAgazJwID0gbmV3IFBvaW50KEZwLm11bChrMnAuWCwgZW5kb0JldGEpLCBrMnAuWSwgazJwLlopO1xuICAgIGsxcCA9IG5lZ2F0ZUN0KGsxbmVnLCBrMXApO1xuICAgIGsycCA9IG5lZ2F0ZUN0KGsybmVnLCBrMnApO1xuICAgIHJldHVybiBrMXAuYWRkKGsycCk7XG4gIH1cblxuICAvKipcbiAgICogUHJvamVjdGl2ZSBQb2ludCB3b3JrcyBpbiAzZCAvIHByb2plY3RpdmUgKGhvbW9nZW5lb3VzKSBjb29yZGluYXRlczooWCwgWSwgWikgXHUyMjBCICh4PVgvWiwgeT1ZL1opLlxuICAgKiBEZWZhdWx0IFBvaW50IHdvcmtzIGluIDJkIC8gYWZmaW5lIGNvb3JkaW5hdGVzOiAoeCwgeSkuXG4gICAqIFdlJ3JlIGRvaW5nIGNhbGN1bGF0aW9ucyBpbiBwcm9qZWN0aXZlLCBiZWNhdXNlIGl0cyBvcGVyYXRpb25zIGRvbid0IHJlcXVpcmUgY29zdGx5IGludmVyc2lvbi5cbiAgICovXG4gIGNsYXNzIFBvaW50IGltcGxlbWVudHMgV2VpZXJzdHJhc3NQb2ludDxUPiB7XG4gICAgLy8gYmFzZSAvIGdlbmVyYXRvciBwb2ludFxuICAgIHN0YXRpYyByZWFkb25seSBCQVNFID0gbmV3IFBvaW50KENVUlZFLkd4LCBDVVJWRS5HeSwgRnAuT05FKTtcbiAgICAvLyB6ZXJvIC8gaW5maW5pdHkgLyBpZGVudGl0eSBwb2ludFxuICAgIHN0YXRpYyByZWFkb25seSBaRVJPID0gbmV3IFBvaW50KEZwLlpFUk8sIEZwLk9ORSwgRnAuWkVSTyk7IC8vIDAsIDEsIDBcbiAgICAvLyBtYXRoIGZpZWxkXG4gICAgc3RhdGljIHJlYWRvbmx5IEZwID0gRnA7XG4gICAgLy8gc2NhbGFyIGZpZWxkXG4gICAgc3RhdGljIHJlYWRvbmx5IEZuID0gRm47XG5cbiAgICByZWFkb25seSBYOiBUO1xuICAgIHJlYWRvbmx5IFk6IFQ7XG4gICAgcmVhZG9ubHkgWjogVDtcblxuICAgIC8qKiBEb2VzIE5PVCB2YWxpZGF0ZSBpZiB0aGUgcG9pbnQgaXMgdmFsaWQuIFVzZSBgLmFzc2VydFZhbGlkaXR5KClgLiAqL1xuICAgIGNvbnN0cnVjdG9yKFg6IFQsIFk6IFQsIFo6IFQpIHtcbiAgICAgIHRoaXMuWCA9IGFjb29yZCgneCcsIFgpO1xuICAgICAgdGhpcy5ZID0gYWNvb3JkKCd5JywgWSwgdHJ1ZSk7XG4gICAgICB0aGlzLlogPSBhY29vcmQoJ3onLCBaKTtcbiAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIENVUlZFKCk6IFdlaWVyc3RyYXNzT3B0czxUPiB7XG4gICAgICByZXR1cm4gQ1VSVkU7XG4gICAgfVxuXG4gICAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gICAgc3RhdGljIGZyb21BZmZpbmUocDogQWZmaW5lUG9pbnQ8VD4pOiBQb2ludCB7XG4gICAgICBjb25zdCB7IHgsIHkgfSA9IHAgfHwge307XG4gICAgICBpZiAoIXAgfHwgIUZwLmlzVmFsaWQoeCkgfHwgIUZwLmlzVmFsaWQoeSkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhZmZpbmUgcG9pbnQnKTtcbiAgICAgIGlmIChwIGluc3RhbmNlb2YgUG9pbnQpIHRocm93IG5ldyBFcnJvcigncHJvamVjdGl2ZSBwb2ludCBub3QgYWxsb3dlZCcpO1xuICAgICAgLy8gKDAsIDApIHdvdWxkJ3ZlIHByb2R1Y2VkICgwLCAwLCAxKSAtIGluc3RlYWQsIHdlIG5lZWQgKDAsIDEsIDApXG4gICAgICBpZiAoRnAuaXMwKHgpICYmIEZwLmlzMCh5KSkgcmV0dXJuIFBvaW50LlpFUk87XG4gICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHksIEZwLk9ORSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSk6IFBvaW50IHtcbiAgICAgIGNvbnN0IFAgPSBQb2ludC5mcm9tQWZmaW5lKGRlY29kZVBvaW50KGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAncG9pbnQnKSkpO1xuICAgICAgUC5hc3NlcnRWYWxpZGl0eSgpO1xuICAgICAgcmV0dXJuIFA7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21IZXgoaGV4OiBzdHJpbmcpOiBQb2ludCB7XG4gICAgICByZXR1cm4gUG9pbnQuZnJvbUJ5dGVzKGhleFRvQnl0ZXMoaGV4KSk7XG4gICAgfVxuXG4gICAgZ2V0IHgoKTogVCB7XG4gICAgICByZXR1cm4gdGhpcy50b0FmZmluZSgpLng7XG4gICAgfVxuICAgIGdldCB5KCk6IFQge1xuICAgICAgcmV0dXJuIHRoaXMudG9BZmZpbmUoKS55O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHdpbmRvd1NpemVcbiAgICAgKiBAcGFyYW0gaXNMYXp5IHRydWUgd2lsbCBkZWZlciB0YWJsZSBjb21wdXRhdGlvbiB1bnRpbCB0aGUgZmlyc3QgbXVsdGlwbGljYXRpb25cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByZWNvbXB1dGUod2luZG93U2l6ZTogbnVtYmVyID0gOCwgaXNMYXp5ID0gdHJ1ZSk6IFBvaW50IHtcbiAgICAgIHduYWYuY3JlYXRlQ2FjaGUodGhpcywgd2luZG93U2l6ZSk7XG4gICAgICBpZiAoIWlzTGF6eSkgdGhpcy5tdWx0aXBseShfM24pOyAvLyByYW5kb20gbnVtYmVyXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBUT0RPOiByZXR1cm4gYHRoaXNgXG4gICAgLyoqIEEgcG9pbnQgb24gY3VydmUgaXMgdmFsaWQgaWYgaXQgY29uZm9ybXMgdG8gZXF1YXRpb24uICovXG4gICAgYXNzZXJ0VmFsaWRpdHkoKTogdm9pZCB7XG4gICAgICBhc3NlcnRWYWxpZE1lbW8odGhpcyk7XG4gICAgfVxuXG4gICAgaGFzRXZlblkoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB7IHkgfSA9IHRoaXMudG9BZmZpbmUoKTtcbiAgICAgIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3Qgc3VwcG9ydCBpc09kZFwiKTtcbiAgICAgIHJldHVybiAhRnAuaXNPZGQoeSk7XG4gICAgfVxuXG4gICAgLyoqIENvbXBhcmUgb25lIHBvaW50IHRvIGFub3RoZXIuICovXG4gICAgZXF1YWxzKG90aGVyOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgICAgYXByanBvaW50KG90aGVyKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHsgWDogWDIsIFk6IFkyLCBaOiBaMiB9ID0gb3RoZXI7XG4gICAgICBjb25zdCBVMSA9IEZwLmVxbChGcC5tdWwoWDEsIFoyKSwgRnAubXVsKFgyLCBaMSkpO1xuICAgICAgY29uc3QgVTIgPSBGcC5lcWwoRnAubXVsKFkxLCBaMiksIEZwLm11bChZMiwgWjEpKTtcbiAgICAgIHJldHVybiBVMSAmJiBVMjtcbiAgICB9XG5cbiAgICAvKiogRmxpcHMgcG9pbnQgdG8gb25lIGNvcnJlc3BvbmRpbmcgdG8gKHgsIC15KSBpbiBBZmZpbmUgY29vcmRpbmF0ZXMuICovXG4gICAgbmVnYXRlKCk6IFBvaW50IHtcbiAgICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy5YLCBGcC5uZWcodGhpcy5ZKSwgdGhpcy5aKTtcbiAgICB9XG5cbiAgICAvLyBSZW5lcy1Db3N0ZWxsby1CYXRpbmEgZXhjZXB0aW9uLWZyZWUgZG91YmxpbmcgZm9ybXVsYS5cbiAgICAvLyBUaGVyZSBpcyAzMCUgZmFzdGVyIEphY29iaWFuIGZvcm11bGEsIGJ1dCBpdCBpcyBub3QgY29tcGxldGUuXG4gICAgLy8gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxNS8xMDYwLCBhbGdvcml0aG0gM1xuICAgIC8vIENvc3Q6IDhNICsgM1MgKyAzKmEgKyAyKmIzICsgMTVhZGQuXG4gICAgZG91YmxlKCkge1xuICAgICAgY29uc3QgeyBhLCBiIH0gPSBDVVJWRTtcbiAgICAgIGNvbnN0IGIzID0gRnAubXVsKGIsIF8zbik7XG4gICAgICBjb25zdCB7IFg6IFgxLCBZOiBZMSwgWjogWjEgfSA9IHRoaXM7XG4gICAgICBsZXQgWDMgPSBGcC5aRVJPLCBZMyA9IEZwLlpFUk8sIFozID0gRnAuWkVSTzsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBsZXQgdDAgPSBGcC5tdWwoWDEsIFgxKTsgLy8gc3RlcCAxXG4gICAgICBsZXQgdDEgPSBGcC5tdWwoWTEsIFkxKTtcbiAgICAgIGxldCB0MiA9IEZwLm11bChaMSwgWjEpO1xuICAgICAgbGV0IHQzID0gRnAubXVsKFgxLCBZMSk7XG4gICAgICB0MyA9IEZwLmFkZCh0MywgdDMpOyAvLyBzdGVwIDVcbiAgICAgIFozID0gRnAubXVsKFgxLCBaMSk7XG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpO1xuICAgICAgWDMgPSBGcC5tdWwoYSwgWjMpO1xuICAgICAgWTMgPSBGcC5tdWwoYjMsIHQyKTtcbiAgICAgIFkzID0gRnAuYWRkKFgzLCBZMyk7IC8vIHN0ZXAgMTBcbiAgICAgIFgzID0gRnAuc3ViKHQxLCBZMyk7XG4gICAgICBZMyA9IEZwLmFkZCh0MSwgWTMpO1xuICAgICAgWTMgPSBGcC5tdWwoWDMsIFkzKTtcbiAgICAgIFgzID0gRnAubXVsKHQzLCBYMyk7XG4gICAgICBaMyA9IEZwLm11bChiMywgWjMpOyAvLyBzdGVwIDE1XG4gICAgICB0MiA9IEZwLm11bChhLCB0Mik7XG4gICAgICB0MyA9IEZwLnN1Yih0MCwgdDIpO1xuICAgICAgdDMgPSBGcC5tdWwoYSwgdDMpO1xuICAgICAgdDMgPSBGcC5hZGQodDMsIFozKTtcbiAgICAgIFozID0gRnAuYWRkKHQwLCB0MCk7IC8vIHN0ZXAgMjBcbiAgICAgIHQwID0gRnAuYWRkKFozLCB0MCk7XG4gICAgICB0MCA9IEZwLmFkZCh0MCwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDAsIHQzKTtcbiAgICAgIFkzID0gRnAuYWRkKFkzLCB0MCk7XG4gICAgICB0MiA9IEZwLm11bChZMSwgWjEpOyAvLyBzdGVwIDI1XG4gICAgICB0MiA9IEZwLmFkZCh0MiwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDIsIHQzKTtcbiAgICAgIFgzID0gRnAuc3ViKFgzLCB0MCk7XG4gICAgICBaMyA9IEZwLm11bCh0MiwgdDEpO1xuICAgICAgWjMgPSBGcC5hZGQoWjMsIFozKTsgLy8gc3RlcCAzMFxuICAgICAgWjMgPSBGcC5hZGQoWjMsIFozKTtcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoWDMsIFkzLCBaMyk7XG4gICAgfVxuXG4gICAgLy8gUmVuZXMtQ29zdGVsbG8tQmF0aW5hIGV4Y2VwdGlvbi1mcmVlIGFkZGl0aW9uIGZvcm11bGEuXG4gICAgLy8gVGhlcmUgaXMgMzAlIGZhc3RlciBKYWNvYmlhbiBmb3JtdWxhLCBidXQgaXQgaXMgbm90IGNvbXBsZXRlLlxuICAgIC8vIGh0dHBzOi8vZXByaW50LmlhY3Iub3JnLzIwMTUvMTA2MCwgYWxnb3JpdGhtIDFcbiAgICAvLyBDb3N0OiAxMk0gKyAwUyArIDMqYSArIDMqYjMgKyAyM2FkZC5cbiAgICBhZGQob3RoZXI6IFBvaW50KTogUG9pbnQge1xuICAgICAgYXByanBvaW50KG90aGVyKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHsgWDogWDIsIFk6IFkyLCBaOiBaMiB9ID0gb3RoZXI7XG4gICAgICBsZXQgWDMgPSBGcC5aRVJPLCBZMyA9IEZwLlpFUk8sIFozID0gRnAuWkVSTzsgLy8gcHJldHRpZXItaWdub3JlXG4gICAgICBjb25zdCBhID0gQ1VSVkUuYTtcbiAgICAgIGNvbnN0IGIzID0gRnAubXVsKENVUlZFLmIsIF8zbik7XG4gICAgICBsZXQgdDAgPSBGcC5tdWwoWDEsIFgyKTsgLy8gc3RlcCAxXG4gICAgICBsZXQgdDEgPSBGcC5tdWwoWTEsIFkyKTtcbiAgICAgIGxldCB0MiA9IEZwLm11bChaMSwgWjIpO1xuICAgICAgbGV0IHQzID0gRnAuYWRkKFgxLCBZMSk7XG4gICAgICBsZXQgdDQgPSBGcC5hZGQoWDIsIFkyKTsgLy8gc3RlcCA1XG4gICAgICB0MyA9IEZwLm11bCh0MywgdDQpO1xuICAgICAgdDQgPSBGcC5hZGQodDAsIHQxKTtcbiAgICAgIHQzID0gRnAuc3ViKHQzLCB0NCk7XG4gICAgICB0NCA9IEZwLmFkZChYMSwgWjEpO1xuICAgICAgbGV0IHQ1ID0gRnAuYWRkKFgyLCBaMik7IC8vIHN0ZXAgMTBcbiAgICAgIHQ0ID0gRnAubXVsKHQ0LCB0NSk7XG4gICAgICB0NSA9IEZwLmFkZCh0MCwgdDIpO1xuICAgICAgdDQgPSBGcC5zdWIodDQsIHQ1KTtcbiAgICAgIHQ1ID0gRnAuYWRkKFkxLCBaMSk7XG4gICAgICBYMyA9IEZwLmFkZChZMiwgWjIpOyAvLyBzdGVwIDE1XG4gICAgICB0NSA9IEZwLm11bCh0NSwgWDMpO1xuICAgICAgWDMgPSBGcC5hZGQodDEsIHQyKTtcbiAgICAgIHQ1ID0gRnAuc3ViKHQ1LCBYMyk7XG4gICAgICBaMyA9IEZwLm11bChhLCB0NCk7XG4gICAgICBYMyA9IEZwLm11bChiMywgdDIpOyAvLyBzdGVwIDIwXG4gICAgICBaMyA9IEZwLmFkZChYMywgWjMpO1xuICAgICAgWDMgPSBGcC5zdWIodDEsIFozKTtcbiAgICAgIFozID0gRnAuYWRkKHQxLCBaMyk7XG4gICAgICBZMyA9IEZwLm11bChYMywgWjMpO1xuICAgICAgdDEgPSBGcC5hZGQodDAsIHQwKTsgLy8gc3RlcCAyNVxuICAgICAgdDEgPSBGcC5hZGQodDEsIHQwKTtcbiAgICAgIHQyID0gRnAubXVsKGEsIHQyKTtcbiAgICAgIHQ0ID0gRnAubXVsKGIzLCB0NCk7XG4gICAgICB0MSA9IEZwLmFkZCh0MSwgdDIpO1xuICAgICAgdDIgPSBGcC5zdWIodDAsIHQyKTsgLy8gc3RlcCAzMFxuICAgICAgdDIgPSBGcC5tdWwoYSwgdDIpO1xuICAgICAgdDQgPSBGcC5hZGQodDQsIHQyKTtcbiAgICAgIHQwID0gRnAubXVsKHQxLCB0NCk7XG4gICAgICBZMyA9IEZwLmFkZChZMywgdDApO1xuICAgICAgdDAgPSBGcC5tdWwodDUsIHQ0KTsgLy8gc3RlcCAzNVxuICAgICAgWDMgPSBGcC5tdWwodDMsIFgzKTtcbiAgICAgIFgzID0gRnAuc3ViKFgzLCB0MCk7XG4gICAgICB0MCA9IEZwLm11bCh0MywgdDEpO1xuICAgICAgWjMgPSBGcC5tdWwodDUsIFozKTtcbiAgICAgIFozID0gRnAuYWRkKFozLCB0MCk7IC8vIHN0ZXAgNDBcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoWDMsIFkzLCBaMyk7XG4gICAgfVxuXG4gICAgc3VidHJhY3Qob3RoZXI6IFBvaW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGQob3RoZXIubmVnYXRlKCkpO1xuICAgIH1cblxuICAgIGlzMCgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmVxdWFscyhQb2ludC5aRVJPKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zdGFudCB0aW1lIG11bHRpcGxpY2F0aW9uLlxuICAgICAqIFVzZXMgd05BRiBtZXRob2QuIFdpbmRvd2VkIG1ldGhvZCBtYXkgYmUgMTAlIGZhc3RlcixcbiAgICAgKiBidXQgdGFrZXMgMnggbG9uZ2VyIHRvIGdlbmVyYXRlIGFuZCBjb25zdW1lcyAyeCBtZW1vcnkuXG4gICAgICogVXNlcyBwcmVjb21wdXRlcyB3aGVuIGF2YWlsYWJsZS5cbiAgICAgKiBVc2VzIGVuZG9tb3JwaGlzbSBmb3IgS29ibGl0eiBjdXJ2ZXMuXG4gICAgICogQHBhcmFtIHNjYWxhciBieSB3aGljaCB0aGUgcG9pbnQgd291bGQgYmUgbXVsdGlwbGllZFxuICAgICAqIEByZXR1cm5zIE5ldyBwb2ludFxuICAgICAqL1xuICAgIG11bHRpcGx5KHNjYWxhcjogYmlnaW50KTogUG9pbnQge1xuICAgICAgY29uc3QgeyBlbmRvIH0gPSBleHRyYU9wdHM7XG4gICAgICBpZiAoIUZuLmlzVmFsaWROb3QwKHNjYWxhcikpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzY2FsYXI6IG91dCBvZiByYW5nZScpOyAvLyAwIGlzIGludmFsaWRcbiAgICAgIGxldCBwb2ludDogUG9pbnQsIGZha2U6IFBvaW50OyAvLyBGYWtlIHBvaW50IGlzIHVzZWQgdG8gY29uc3QtdGltZSBtdWx0XG4gICAgICBjb25zdCBtdWwgPSAobjogYmlnaW50KSA9PiB3bmFmLmNhY2hlZCh0aGlzLCBuLCAocCkgPT4gbm9ybWFsaXplWihQb2ludCwgcCkpO1xuICAgICAgLyoqIFNlZSBkb2NzIGZvciB7QGxpbmsgRW5kb21vcnBoaXNtT3B0c30gKi9cbiAgICAgIGlmIChlbmRvKSB7XG4gICAgICAgIGNvbnN0IHsgazFuZWcsIGsxLCBrMm5lZywgazIgfSA9IHNwbGl0RW5kb1NjYWxhck4oc2NhbGFyKTtcbiAgICAgICAgY29uc3QgeyBwOiBrMXAsIGY6IGsxZiB9ID0gbXVsKGsxKTtcbiAgICAgICAgY29uc3QgeyBwOiBrMnAsIGY6IGsyZiB9ID0gbXVsKGsyKTtcbiAgICAgICAgZmFrZSA9IGsxZi5hZGQoazJmKTtcbiAgICAgICAgcG9pbnQgPSBmaW5pc2hFbmRvKGVuZG8uYmV0YSwgazFwLCBrMnAsIGsxbmVnLCBrMm5lZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IHAsIGYgfSA9IG11bChzY2FsYXIpO1xuICAgICAgICBwb2ludCA9IHA7XG4gICAgICAgIGZha2UgPSBmO1xuICAgICAgfVxuICAgICAgLy8gTm9ybWFsaXplIGB6YCBmb3IgYm90aCBwb2ludHMsIGJ1dCByZXR1cm4gb25seSByZWFsIG9uZVxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZVooUG9pbnQsIFtwb2ludCwgZmFrZV0pWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5vbi1jb25zdGFudC10aW1lIG11bHRpcGxpY2F0aW9uLiBVc2VzIGRvdWJsZS1hbmQtYWRkIGFsZ29yaXRobS5cbiAgICAgKiBJdCdzIGZhc3RlciwgYnV0IHNob3VsZCBvbmx5IGJlIHVzZWQgd2hlbiB5b3UgZG9uJ3QgY2FyZSBhYm91dFxuICAgICAqIGFuIGV4cG9zZWQgc2VjcmV0IGtleSBlLmcuIHNpZyB2ZXJpZmljYXRpb24sIHdoaWNoIHdvcmtzIG92ZXIgKnB1YmxpYyoga2V5cy5cbiAgICAgKi9cbiAgICBtdWx0aXBseVVuc2FmZShzYzogYmlnaW50KTogUG9pbnQge1xuICAgICAgY29uc3QgeyBlbmRvIH0gPSBleHRyYU9wdHM7XG4gICAgICBjb25zdCBwID0gdGhpcyBhcyBQb2ludDtcbiAgICAgIGlmICghRm4uaXNWYWxpZChzYykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzY2FsYXI6IG91dCBvZiByYW5nZScpOyAvLyAwIGlzIHZhbGlkXG4gICAgICBpZiAoc2MgPT09IF8wbiB8fCBwLmlzMCgpKSByZXR1cm4gUG9pbnQuWkVSTzsgLy8gMFxuICAgICAgaWYgKHNjID09PSBfMW4pIHJldHVybiBwOyAvLyAxXG4gICAgICBpZiAod25hZi5oYXNDYWNoZSh0aGlzKSkgcmV0dXJuIHRoaXMubXVsdGlwbHkoc2MpOyAvLyBwcmVjb21wdXRlc1xuICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSBtZXRob2QgZm9yIGRvdWJsZSBzY2FsYXIgbXVsdGlwbGljYXRpb24gKGFQICsgYlEpOlxuICAgICAgLy8gRXZlbiB3aXRoIHVzaW5nIFN0cmF1c3MtU2hhbWlyIHRyaWNrLCBpdCdzIDM1JSBzbG93ZXIgdGhhbiBuYVx1MDBFRnZlIG11bCthZGQuXG4gICAgICBpZiAoZW5kbykge1xuICAgICAgICBjb25zdCB7IGsxbmVnLCBrMSwgazJuZWcsIGsyIH0gPSBzcGxpdEVuZG9TY2FsYXJOKHNjKTtcbiAgICAgICAgY29uc3QgeyBwMSwgcDIgfSA9IG11bEVuZG9VbnNhZmUoUG9pbnQsIHAsIGsxLCBrMik7IC8vIDMwJSBmYXN0ZXIgdnMgd25hZi51bnNhZmVcbiAgICAgICAgcmV0dXJuIGZpbmlzaEVuZG8oZW5kby5iZXRhLCBwMSwgcDIsIGsxbmVnLCBrMm5lZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gd25hZi51bnNhZmUocCwgc2MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIFByb2plY3RpdmUgcG9pbnQgdG8gYWZmaW5lICh4LCB5KSBjb29yZGluYXRlcy5cbiAgICAgKiBAcGFyYW0gaW52ZXJ0ZWRaIFpeLTEgKGludmVydGVkIHplcm8pIC0gb3B0aW9uYWwsIHByZWNvbXB1dGF0aW9uIGlzIHVzZWZ1bCBmb3IgaW52ZXJ0QmF0Y2hcbiAgICAgKi9cbiAgICB0b0FmZmluZShpbnZlcnRlZFo/OiBUKTogQWZmaW5lUG9pbnQ8VD4ge1xuICAgICAgcmV0dXJuIHRvQWZmaW5lTWVtbyh0aGlzLCBpbnZlcnRlZFopO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIFBvaW50IGlzIGZyZWUgb2YgdG9yc2lvbiBlbGVtZW50cyAoaXMgaW4gcHJpbWUgc3ViZ3JvdXApLlxuICAgICAqIEFsd2F5cyB0b3JzaW9uLWZyZWUgZm9yIGNvZmFjdG9yPTEgY3VydmVzLlxuICAgICAqL1xuICAgIGlzVG9yc2lvbkZyZWUoKTogYm9vbGVhbiB7XG4gICAgICBjb25zdCB7IGlzVG9yc2lvbkZyZWUgfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmIChjb2ZhY3RvciA9PT0gXzFuKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmIChpc1RvcnNpb25GcmVlKSByZXR1cm4gaXNUb3JzaW9uRnJlZShQb2ludCwgdGhpcyk7XG4gICAgICByZXR1cm4gd25hZi51bnNhZmUodGhpcywgQ1VSVkVfT1JERVIpLmlzMCgpO1xuICAgIH1cblxuICAgIGNsZWFyQ29mYWN0b3IoKTogUG9pbnQge1xuICAgICAgY29uc3QgeyBjbGVhckNvZmFjdG9yIH0gPSBleHRyYU9wdHM7XG4gICAgICBpZiAoY29mYWN0b3IgPT09IF8xbikgcmV0dXJuIHRoaXM7IC8vIEZhc3QtcGF0aFxuICAgICAgaWYgKGNsZWFyQ29mYWN0b3IpIHJldHVybiBjbGVhckNvZmFjdG9yKFBvaW50LCB0aGlzKSBhcyBQb2ludDtcbiAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5VW5zYWZlKGNvZmFjdG9yKTtcbiAgICB9XG5cbiAgICBpc1NtYWxsT3JkZXIoKTogYm9vbGVhbiB7XG4gICAgICAvLyBjYW4gd2UgdXNlIHRoaXMuY2xlYXJDb2ZhY3RvcigpP1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IpLmlzMCgpO1xuICAgIH1cblxuICAgIHRvQnl0ZXMoaXNDb21wcmVzc2VkID0gdHJ1ZSk6IFVpbnQ4QXJyYXkge1xuICAgICAgYWJvb2woaXNDb21wcmVzc2VkLCAnaXNDb21wcmVzc2VkJyk7XG4gICAgICB0aGlzLmFzc2VydFZhbGlkaXR5KCk7XG4gICAgICByZXR1cm4gZW5jb2RlUG9pbnQoUG9pbnQsIHRoaXMsIGlzQ29tcHJlc3NlZCk7XG4gICAgfVxuXG4gICAgdG9IZXgoaXNDb21wcmVzc2VkID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gYnl0ZXNUb0hleCh0aGlzLnRvQnl0ZXMoaXNDb21wcmVzc2VkKSk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gYDxQb2ludCAke3RoaXMuaXMwKCkgPyAnWkVSTycgOiB0aGlzLnRvSGV4KCl9PmA7XG4gICAgfVxuICB9XG4gIGNvbnN0IGJpdHMgPSBGbi5CSVRTO1xuICBjb25zdCB3bmFmID0gbmV3IHdOQUYoUG9pbnQsIGV4dHJhT3B0cy5lbmRvID8gTWF0aC5jZWlsKGJpdHMgLyAyKSA6IGJpdHMpO1xuICBQb2ludC5CQVNFLnByZWNvbXB1dGUoOCk7IC8vIEVuYWJsZSBwcmVjb21wdXRlcy4gU2xvd3MgZG93biBmaXJzdCBwdWJsaWNLZXkgY29tcHV0YXRpb24gYnkgMjBtcy5cbiAgcmV0dXJuIFBvaW50O1xufVxuXG4vKiogTWV0aG9kcyBvZiBFQ0RTQSBzaWduYXR1cmUgaW5zdGFuY2UuICovXG5leHBvcnQgaW50ZXJmYWNlIEVDRFNBU2lnbmF0dXJlIHtcbiAgcmVhZG9ubHkgcjogYmlnaW50O1xuICByZWFkb25seSBzOiBiaWdpbnQ7XG4gIHJlYWRvbmx5IHJlY292ZXJ5PzogbnVtYmVyO1xuICBhZGRSZWNvdmVyeUJpdChyZWNvdmVyeTogbnVtYmVyKTogRUNEU0FTaWduYXR1cmUgJiB7IHJlYWRvbmx5IHJlY292ZXJ5OiBudW1iZXIgfTtcbiAgaGFzSGlnaFMoKTogYm9vbGVhbjtcbiAgcmVjb3ZlclB1YmxpY0tleShtZXNzYWdlSGFzaDogVWludDhBcnJheSk6IFdlaWVyc3RyYXNzUG9pbnQ8YmlnaW50PjtcbiAgdG9CeXRlcyhmb3JtYXQ/OiBzdHJpbmcpOiBVaW50OEFycmF5O1xuICB0b0hleChmb3JtYXQ/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG4vKiogTWV0aG9kcyBvZiBFQ0RTQSBzaWduYXR1cmUgY29uc3RydWN0b3IuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25hdHVyZUNvbnMgPSB7XG4gIG5ldyAocjogYmlnaW50LCBzOiBiaWdpbnQsIHJlY292ZXJ5PzogbnVtYmVyKTogRUNEU0FTaWduYXR1cmU7XG4gIGZyb21CeXRlcyhieXRlczogVWludDhBcnJheSwgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpOiBFQ0RTQVNpZ25hdHVyZTtcbiAgZnJvbUhleChoZXg6IHN0cmluZywgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpOiBFQ0RTQVNpZ25hdHVyZTtcbn07XG5cbi8vIFBvaW50cyBzdGFydCB3aXRoIGJ5dGUgMHgwMiB3aGVuIHkgaXMgZXZlbjsgb3RoZXJ3aXNlIDB4MDNcbmZ1bmN0aW9uIHBwcmVmaXgoaGFzRXZlblk6IGJvb2xlYW4pOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkub2YoaGFzRXZlblkgPyAweDAyIDogMHgwMyk7XG59XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIFNoYWxsdWUgYW5kIHZhbiBkZSBXb2VzdGlqbmUgbWV0aG9kIGZvciBhbnkgd2VpZXJzdHJhc3MgY3VydmUuXG4gKiBUT0RPOiBjaGVjayBpZiB0aGVyZSBpcyBhIHdheSB0byBtZXJnZSB0aGlzIHdpdGggdXZSYXRpbyBpbiBFZHdhcmRzOyBtb3ZlIHRvIG1vZHVsYXIuXG4gKiBiID0gVHJ1ZSBhbmQgeSA9IHNxcnQodSAvIHYpIGlmICh1IC8gdikgaXMgc3F1YXJlIGluIEYsIGFuZFxuICogYiA9IEZhbHNlIGFuZCB5ID0gc3FydChaICogKHUgLyB2KSkgb3RoZXJ3aXNlLlxuICogQHBhcmFtIEZwXG4gKiBAcGFyYW0gWlxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNXVUZwU3FydFJhdGlvPFQ+KFxuICBGcDogSUZpZWxkPFQ+LFxuICBaOiBUXG4pOiAodTogVCwgdjogVCkgPT4geyBpc1ZhbGlkOiBib29sZWFuOyB2YWx1ZTogVCB9IHtcbiAgLy8gR2VuZXJpYyBpbXBsZW1lbnRhdGlvblxuICBjb25zdCBxID0gRnAuT1JERVI7XG4gIGxldCBsID0gXzBuO1xuICBmb3IgKGxldCBvID0gcSAtIF8xbjsgbyAlIF8ybiA9PT0gXzBuOyBvIC89IF8ybikgbCArPSBfMW47XG4gIGNvbnN0IGMxID0gbDsgLy8gMS4gYzEsIHRoZSBsYXJnZXN0IGludGVnZXIgc3VjaCB0aGF0IDJeYzEgZGl2aWRlcyBxIC0gMS5cbiAgLy8gV2UgbmVlZCAybiAqKiBjMSBhbmQgMm4gKiogKGMxLTEpLiBXZSBjYW4ndCB1c2UgKio7IGJ1dCB3ZSBjYW4gdXNlIDw8LlxuICAvLyAybiAqKiBjMSA9PSAybiA8PCAoYzEtMSlcbiAgY29uc3QgXzJuX3Bvd19jMV8xID0gXzJuIDw8IChjMSAtIF8xbiAtIF8xbik7XG4gIGNvbnN0IF8ybl9wb3dfYzEgPSBfMm5fcG93X2MxXzEgKiBfMm47XG4gIGNvbnN0IGMyID0gKHEgLSBfMW4pIC8gXzJuX3Bvd19jMTsgLy8gMi4gYzIgPSAocSAtIDEpIC8gKDJeYzEpICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjMyA9IChjMiAtIF8xbikgLyBfMm47IC8vIDMuIGMzID0gKGMyIC0gMSkgLyAyICAgICAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzQgPSBfMm5fcG93X2MxIC0gXzFuOyAvLyA0LiBjNCA9IDJeYzEgLSAxICAgICAgICAgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGM1ID0gXzJuX3Bvd19jMV8xOyAvLyA1LiBjNSA9IDJeKGMxIC0gMSkgICAgICAgICAgICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjNiA9IEZwLnBvdyhaLCBjMik7IC8vIDYuIGM2ID0gWl5jMlxuICBjb25zdCBjNyA9IEZwLnBvdyhaLCAoYzIgKyBfMW4pIC8gXzJuKTsgLy8gNy4gYzcgPSBaXigoYzIgKyAxKSAvIDIpXG4gIGxldCBzcXJ0UmF0aW8gPSAodTogVCwgdjogVCk6IHsgaXNWYWxpZDogYm9vbGVhbjsgdmFsdWU6IFQgfSA9PiB7XG4gICAgbGV0IHR2MSA9IGM2OyAvLyAxLiB0djEgPSBjNlxuICAgIGxldCB0djIgPSBGcC5wb3codiwgYzQpOyAvLyAyLiB0djIgPSB2XmM0XG4gICAgbGV0IHR2MyA9IEZwLnNxcih0djIpOyAvLyAzLiB0djMgPSB0djJeMlxuICAgIHR2MyA9IEZwLm11bCh0djMsIHYpOyAvLyA0LiB0djMgPSB0djMgKiB2XG4gICAgbGV0IHR2NSA9IEZwLm11bCh1LCB0djMpOyAvLyA1LiB0djUgPSB1ICogdHYzXG4gICAgdHY1ID0gRnAucG93KHR2NSwgYzMpOyAvLyA2LiB0djUgPSB0djVeYzNcbiAgICB0djUgPSBGcC5tdWwodHY1LCB0djIpOyAvLyA3LiB0djUgPSB0djUgKiB0djJcbiAgICB0djIgPSBGcC5tdWwodHY1LCB2KTsgLy8gOC4gdHYyID0gdHY1ICogdlxuICAgIHR2MyA9IEZwLm11bCh0djUsIHUpOyAvLyA5LiB0djMgPSB0djUgKiB1XG4gICAgbGV0IHR2NCA9IEZwLm11bCh0djMsIHR2Mik7IC8vIDEwLiB0djQgPSB0djMgKiB0djJcbiAgICB0djUgPSBGcC5wb3codHY0LCBjNSk7IC8vIDExLiB0djUgPSB0djReYzVcbiAgICBsZXQgaXNRUiA9IEZwLmVxbCh0djUsIEZwLk9ORSk7IC8vIDEyLiBpc1FSID0gdHY1ID09IDFcbiAgICB0djIgPSBGcC5tdWwodHYzLCBjNyk7IC8vIDEzLiB0djIgPSB0djMgKiBjN1xuICAgIHR2NSA9IEZwLm11bCh0djQsIHR2MSk7IC8vIDE0LiB0djUgPSB0djQgKiB0djFcbiAgICB0djMgPSBGcC5jbW92KHR2MiwgdHYzLCBpc1FSKTsgLy8gMTUuIHR2MyA9IENNT1YodHYyLCB0djMsIGlzUVIpXG4gICAgdHY0ID0gRnAuY21vdih0djUsIHR2NCwgaXNRUik7IC8vIDE2LiB0djQgPSBDTU9WKHR2NSwgdHY0LCBpc1FSKVxuICAgIC8vIDE3LiBmb3IgaSBpbiAoYzEsIGMxIC0gMSwgLi4uLCAyKTpcbiAgICBmb3IgKGxldCBpID0gYzE7IGkgPiBfMW47IGktLSkge1xuICAgICAgbGV0IHR2NSA9IGkgLSBfMm47IC8vIDE4LiAgICB0djUgPSBpIC0gMlxuICAgICAgdHY1ID0gXzJuIDw8ICh0djUgLSBfMW4pOyAvLyAxOS4gICAgdHY1ID0gMl50djVcbiAgICAgIGxldCB0dnY1ID0gRnAucG93KHR2NCwgdHY1KTsgLy8gMjAuICAgIHR2NSA9IHR2NF50djVcbiAgICAgIGNvbnN0IGUxID0gRnAuZXFsKHR2djUsIEZwLk9ORSk7IC8vIDIxLiAgICBlMSA9IHR2NSA9PSAxXG4gICAgICB0djIgPSBGcC5tdWwodHYzLCB0djEpOyAvLyAyMi4gICAgdHYyID0gdHYzICogdHYxXG4gICAgICB0djEgPSBGcC5tdWwodHYxLCB0djEpOyAvLyAyMy4gICAgdHYxID0gdHYxICogdHYxXG4gICAgICB0dnY1ID0gRnAubXVsKHR2NCwgdHYxKTsgLy8gMjQuICAgIHR2NSA9IHR2NCAqIHR2MVxuICAgICAgdHYzID0gRnAuY21vdih0djIsIHR2MywgZTEpOyAvLyAyNS4gICAgdHYzID0gQ01PVih0djIsIHR2MywgZTEpXG4gICAgICB0djQgPSBGcC5jbW92KHR2djUsIHR2NCwgZTEpOyAvLyAyNi4gICAgdHY0ID0gQ01PVih0djUsIHR2NCwgZTEpXG4gICAgfVxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGlzUVIsIHZhbHVlOiB0djMgfTtcbiAgfTtcbiAgaWYgKEZwLk9SREVSICUgXzRuID09PSBfM24pIHtcbiAgICAvLyBzcXJ0X3JhdGlvXzNtb2Q0KHUsIHYpXG4gICAgY29uc3QgYzEgPSAoRnAuT1JERVIgLSBfM24pIC8gXzRuOyAvLyAxLiBjMSA9IChxIC0gMykgLyA0ICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICAgIGNvbnN0IGMyID0gRnAuc3FydChGcC5uZWcoWikpOyAvLyAyLiBjMiA9IHNxcnQoLVopXG4gICAgc3FydFJhdGlvID0gKHU6IFQsIHY6IFQpID0+IHtcbiAgICAgIGxldCB0djEgPSBGcC5zcXIodik7IC8vIDEuIHR2MSA9IHZeMlxuICAgICAgY29uc3QgdHYyID0gRnAubXVsKHUsIHYpOyAvLyAyLiB0djIgPSB1ICogdlxuICAgICAgdHYxID0gRnAubXVsKHR2MSwgdHYyKTsgLy8gMy4gdHYxID0gdHYxICogdHYyXG4gICAgICBsZXQgeTEgPSBGcC5wb3codHYxLCBjMSk7IC8vIDQuIHkxID0gdHYxXmMxXG4gICAgICB5MSA9IEZwLm11bCh5MSwgdHYyKTsgLy8gNS4geTEgPSB5MSAqIHR2MlxuICAgICAgY29uc3QgeTIgPSBGcC5tdWwoeTEsIGMyKTsgLy8gNi4geTIgPSB5MSAqIGMyXG4gICAgICBjb25zdCB0djMgPSBGcC5tdWwoRnAuc3FyKHkxKSwgdik7IC8vIDcuIHR2MyA9IHkxXjI7IDguIHR2MyA9IHR2MyAqIHZcbiAgICAgIGNvbnN0IGlzUVIgPSBGcC5lcWwodHYzLCB1KTsgLy8gOS4gaXNRUiA9IHR2MyA9PSB1XG4gICAgICBsZXQgeSA9IEZwLmNtb3YoeTIsIHkxLCBpc1FSKTsgLy8gMTAuIHkgPSBDTU9WKHkyLCB5MSwgaXNRUilcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGlzUVIsIHZhbHVlOiB5IH07IC8vIDExLiByZXR1cm4gKGlzUVIsIHkpIGlzUVIgPyB5IDogeSpjMlxuICAgIH07XG4gIH1cbiAgLy8gTm8gY3VydmVzIHVzZXMgdGhhdFxuICAvLyBpZiAoRnAuT1JERVIgJSBfOG4gPT09IF81bikgLy8gc3FydF9yYXRpb181bW9kOFxuICByZXR1cm4gc3FydFJhdGlvO1xufVxuLyoqXG4gKiBTaW1wbGlmaWVkIFNoYWxsdWUtdmFuIGRlIFdvZXN0aWpuZS1VbGFzIE1ldGhvZFxuICogaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi02LjYuMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVG9DdXJ2ZVNpbXBsZVNXVTxUPihcbiAgRnA6IElGaWVsZDxUPixcbiAgb3B0czoge1xuICAgIEE6IFQ7XG4gICAgQjogVDtcbiAgICBaOiBUO1xuICB9XG4pOiAodTogVCkgPT4geyB4OiBUOyB5OiBUIH0ge1xuICB2YWxpZGF0ZUZpZWxkKEZwKTtcbiAgY29uc3QgeyBBLCBCLCBaIH0gPSBvcHRzO1xuICBpZiAoIUZwLmlzVmFsaWQoQSkgfHwgIUZwLmlzVmFsaWQoQikgfHwgIUZwLmlzVmFsaWQoWikpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXBUb0N1cnZlU2ltcGxlU1dVOiBpbnZhbGlkIG9wdHMnKTtcbiAgY29uc3Qgc3FydFJhdGlvID0gU1dVRnBTcXJ0UmF0aW8oRnAsIFopO1xuICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkIGRvZXMgbm90IGhhdmUgLmlzT2RkKCknKTtcbiAgLy8gSW5wdXQ6IHUsIGFuIGVsZW1lbnQgb2YgRi5cbiAgLy8gT3V0cHV0OiAoeCwgeSksIGEgcG9pbnQgb24gRS5cbiAgcmV0dXJuICh1OiBUKTogeyB4OiBUOyB5OiBUIH0gPT4ge1xuICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgIGxldCB0djEsIHR2MiwgdHYzLCB0djQsIHR2NSwgdHY2LCB4LCB5O1xuICAgIHR2MSA9IEZwLnNxcih1KTsgLy8gMS4gIHR2MSA9IHVeMlxuICAgIHR2MSA9IEZwLm11bCh0djEsIFopOyAvLyAyLiAgdHYxID0gWiAqIHR2MVxuICAgIHR2MiA9IEZwLnNxcih0djEpOyAvLyAzLiAgdHYyID0gdHYxXjJcbiAgICB0djIgPSBGcC5hZGQodHYyLCB0djEpOyAvLyA0LiAgdHYyID0gdHYyICsgdHYxXG4gICAgdHYzID0gRnAuYWRkKHR2MiwgRnAuT05FKTsgLy8gNS4gIHR2MyA9IHR2MiArIDFcbiAgICB0djMgPSBGcC5tdWwodHYzLCBCKTsgLy8gNi4gIHR2MyA9IEIgKiB0djNcbiAgICB0djQgPSBGcC5jbW92KFosIEZwLm5lZyh0djIpLCAhRnAuZXFsKHR2MiwgRnAuWkVSTykpOyAvLyA3LiAgdHY0ID0gQ01PVihaLCAtdHYyLCB0djIgIT0gMClcbiAgICB0djQgPSBGcC5tdWwodHY0LCBBKTsgLy8gOC4gIHR2NCA9IEEgKiB0djRcbiAgICB0djIgPSBGcC5zcXIodHYzKTsgLy8gOS4gIHR2MiA9IHR2M14yXG4gICAgdHY2ID0gRnAuc3FyKHR2NCk7IC8vIDEwLiB0djYgPSB0djReMlxuICAgIHR2NSA9IEZwLm11bCh0djYsIEEpOyAvLyAxMS4gdHY1ID0gQSAqIHR2NlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2NSk7IC8vIDEyLiB0djIgPSB0djIgKyB0djVcbiAgICB0djIgPSBGcC5tdWwodHYyLCB0djMpOyAvLyAxMy4gdHYyID0gdHYyICogdHYzXG4gICAgdHY2ID0gRnAubXVsKHR2NiwgdHY0KTsgLy8gMTQuIHR2NiA9IHR2NiAqIHR2NFxuICAgIHR2NSA9IEZwLm11bCh0djYsIEIpOyAvLyAxNS4gdHY1ID0gQiAqIHR2NlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2NSk7IC8vIDE2LiB0djIgPSB0djIgKyB0djVcbiAgICB4ID0gRnAubXVsKHR2MSwgdHYzKTsgLy8gMTcuICAgeCA9IHR2MSAqIHR2M1xuICAgIGNvbnN0IHsgaXNWYWxpZCwgdmFsdWUgfSA9IHNxcnRSYXRpbyh0djIsIHR2Nik7IC8vIDE4LiAoaXNfZ3gxX3NxdWFyZSwgeTEpID0gc3FydF9yYXRpbyh0djIsIHR2NilcbiAgICB5ID0gRnAubXVsKHR2MSwgdSk7IC8vIDE5LiAgIHkgPSB0djEgKiB1ICAtPiBaICogdV4zICogeTFcbiAgICB5ID0gRnAubXVsKHksIHZhbHVlKTsgLy8gMjAuICAgeSA9IHkgKiB5MVxuICAgIHggPSBGcC5jbW92KHgsIHR2MywgaXNWYWxpZCk7IC8vIDIxLiAgIHggPSBDTU9WKHgsIHR2MywgaXNfZ3gxX3NxdWFyZSlcbiAgICB5ID0gRnAuY21vdih5LCB2YWx1ZSwgaXNWYWxpZCk7IC8vIDIyLiAgIHkgPSBDTU9WKHksIHkxLCBpc19neDFfc3F1YXJlKVxuICAgIGNvbnN0IGUxID0gRnAuaXNPZGQhKHUpID09PSBGcC5pc09kZCEoeSk7IC8vIDIzLiAgZTEgPSBzZ24wKHUpID09IHNnbjAoeSlcbiAgICB5ID0gRnAuY21vdihGcC5uZWcoeSksIHksIGUxKTsgLy8gMjQuICAgeSA9IENNT1YoLXksIHksIGUxKVxuICAgIGNvbnN0IHR2NF9pbnYgPSBGcEludmVydEJhdGNoKEZwLCBbdHY0XSwgdHJ1ZSlbMF07XG4gICAgeCA9IEZwLm11bCh4LCB0djRfaW52KTsgLy8gMjUuICAgeCA9IHggLyB0djRcbiAgICByZXR1cm4geyB4LCB5IH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFdMZW5ndGhzPFQ+KEZwOiBJRmllbGQ8VD4sIEZuOiBJRmllbGQ8YmlnaW50Pikge1xuICByZXR1cm4ge1xuICAgIHNlY3JldEtleTogRm4uQllURVMsXG4gICAgcHVibGljS2V5OiAxICsgRnAuQllURVMsXG4gICAgcHVibGljS2V5VW5jb21wcmVzc2VkOiAxICsgMiAqIEZwLkJZVEVTLFxuICAgIHB1YmxpY0tleUhhc1ByZWZpeDogdHJ1ZSxcbiAgICBzaWduYXR1cmU6IDIgKiBGbi5CWVRFUyxcbiAgfTtcbn1cblxuLyoqXG4gKiBTb21ldGltZXMgdXNlcnMgb25seSBuZWVkIGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCBhbmQgc2VjcmV0IGtleSBoYW5kbGluZy5cbiAqIFRoaXMgaGVscGVyIGVuc3VyZXMgbm8gc2lnbmF0dXJlIGZ1bmN0aW9uYWxpdHkgaXMgcHJlc2VudC4gTGVzcyBjb2RlLCBzbWFsbGVyIGJ1bmRsZSBzaXplLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZWNkaChcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4sXG4gIGVjZGhPcHRzOiB7IHJhbmRvbUJ5dGVzPzogKGJ5dGVzTGVuZ3RoPzogbnVtYmVyKSA9PiBVaW50OEFycmF5IH0gPSB7fVxuKTogRUNESCB7XG4gIGNvbnN0IHsgRm4gfSA9IFBvaW50O1xuICBjb25zdCByYW5kb21CeXRlc18gPSBlY2RoT3B0cy5yYW5kb21CeXRlcyB8fCB3Y1JhbmRvbUJ5dGVzO1xuICBjb25zdCBsZW5ndGhzID0gT2JqZWN0LmFzc2lnbihnZXRXTGVuZ3RocyhQb2ludC5GcCwgRm4pLCB7IHNlZWQ6IGdldE1pbkhhc2hMZW5ndGgoRm4uT1JERVIpIH0pO1xuXG4gIGZ1bmN0aW9uIGlzVmFsaWRTZWNyZXRLZXkoc2VjcmV0S2V5OiBVaW50OEFycmF5KSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG51bSA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpO1xuICAgICAgcmV0dXJuIEZuLmlzVmFsaWROb3QwKG51bSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc1ZhbGlkUHVibGljS2V5KHB1YmxpY0tleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgcHVibGljS2V5OiBjb21wLCBwdWJsaWNLZXlVbmNvbXByZXNzZWQgfSA9IGxlbmd0aHM7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGwgPSBwdWJsaWNLZXkubGVuZ3RoO1xuICAgICAgaWYgKGlzQ29tcHJlc3NlZCA9PT0gdHJ1ZSAmJiBsICE9PSBjb21wKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoaXNDb21wcmVzc2VkID09PSBmYWxzZSAmJiBsICE9PSBwdWJsaWNLZXlVbmNvbXByZXNzZWQpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiAhIVBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2VzIGNyeXB0b2dyYXBoaWNhbGx5IHNlY3VyZSBzZWNyZXQga2V5IGZyb20gcmFuZG9tIG9mIHNpemVcbiAgICogKGdyb3VwTGVuICsgY2VpbChncm91cExlbiAvIDIpKSB3aXRoIG1vZHVsbyBiaWFzIGJlaW5nIG5lZ2xpZ2libGUuXG4gICAqL1xuICBmdW5jdGlvbiByYW5kb21TZWNyZXRLZXkoc2VlZCA9IHJhbmRvbUJ5dGVzXyhsZW5ndGhzLnNlZWQpKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIG1hcEhhc2hUb0ZpZWxkKGFieXRlcyhzZWVkLCBsZW5ndGhzLnNlZWQsICdzZWVkJyksIEZuLk9SREVSKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBwdWJsaWMga2V5IGZvciBhIHNlY3JldCBrZXkuIENoZWNrcyBmb3IgdmFsaWRpdHkgb2YgdGhlIHNlY3JldCBrZXkuXG4gICAqIEBwYXJhbSBpc0NvbXByZXNzZWQgd2hldGhlciB0byByZXR1cm4gY29tcGFjdCAoZGVmYXVsdCksIG9yIGZ1bGwga2V5XG4gICAqIEByZXR1cm5zIFB1YmxpYyBrZXksIGZ1bGwgd2hlbiBpc0NvbXByZXNzZWQ9ZmFsc2U7IHNob3J0IHdoZW4gaXNDb21wcmVzc2VkPXRydWVcbiAgICovXG4gIGZ1bmN0aW9uIGdldFB1YmxpY0tleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIGlzQ29tcHJlc3NlZCA9IHRydWUpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gUG9pbnQuQkFTRS5tdWx0aXBseShGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5KSkudG9CeXRlcyhpc0NvbXByZXNzZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1aWNrIGFuZCBkaXJ0eSBjaGVjayBmb3IgaXRlbSBiZWluZyBwdWJsaWMga2V5LiBEb2VzIG5vdCB2YWxpZGF0ZSBoZXgsIG9yIGJlaW5nIG9uLWN1cnZlLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNQcm9iUHViKGl0ZW06IFVpbnQ4QXJyYXkpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHNlY3JldEtleSwgcHVibGljS2V5LCBwdWJsaWNLZXlVbmNvbXByZXNzZWQgfSA9IGxlbmd0aHM7XG4gICAgaWYgKCFpc0J5dGVzKGl0ZW0pKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGlmICgoJ19sZW5ndGhzJyBpbiBGbiAmJiBGbi5fbGVuZ3RocykgfHwgc2VjcmV0S2V5ID09PSBwdWJsaWNLZXkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgY29uc3QgbCA9IGFieXRlcyhpdGVtLCB1bmRlZmluZWQsICdrZXknKS5sZW5ndGg7XG4gICAgcmV0dXJuIGwgPT09IHB1YmxpY0tleSB8fCBsID09PSBwdWJsaWNLZXlVbmNvbXByZXNzZWQ7XG4gIH1cblxuICAvKipcbiAgICogRUNESCAoRWxsaXB0aWMgQ3VydmUgRGlmZmllIEhlbGxtYW4pLlxuICAgKiBDb21wdXRlcyBzaGFyZWQgcHVibGljIGtleSBmcm9tIHNlY3JldCBrZXkgQSBhbmQgcHVibGljIGtleSBCLlxuICAgKiBDaGVja3M6IDEpIHNlY3JldCBrZXkgdmFsaWRpdHkgMikgc2hhcmVkIGtleSBpcyBvbi1jdXJ2ZS5cbiAgICogRG9lcyBOT1QgaGFzaCB0aGUgcmVzdWx0LlxuICAgKiBAcGFyYW0gaXNDb21wcmVzc2VkIHdoZXRoZXIgdG8gcmV0dXJuIGNvbXBhY3QgKGRlZmF1bHQpLCBvciBmdWxsIGtleVxuICAgKiBAcmV0dXJucyBzaGFyZWQgcHVibGljIGtleVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U2hhcmVkU2VjcmV0KFxuICAgIHNlY3JldEtleUE6IFVpbnQ4QXJyYXksXG4gICAgcHVibGljS2V5QjogVWludDhBcnJheSxcbiAgICBpc0NvbXByZXNzZWQgPSB0cnVlXG4gICk6IFVpbnQ4QXJyYXkge1xuICAgIGlmIChpc1Byb2JQdWIoc2VjcmV0S2V5QSkgPT09IHRydWUpIHRocm93IG5ldyBFcnJvcignZmlyc3QgYXJnIG11c3QgYmUgcHJpdmF0ZSBrZXknKTtcbiAgICBpZiAoaXNQcm9iUHViKHB1YmxpY0tleUIpID09PSBmYWxzZSkgdGhyb3cgbmV3IEVycm9yKCdzZWNvbmQgYXJnIG11c3QgYmUgcHVibGljIGtleScpO1xuICAgIGNvbnN0IHMgPSBGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5QSk7XG4gICAgY29uc3QgYiA9IFBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXlCKTsgLy8gY2hlY2tzIGZvciBiZWluZyBvbi1jdXJ2ZVxuICAgIHJldHVybiBiLm11bHRpcGx5KHMpLnRvQnl0ZXMoaXNDb21wcmVzc2VkKTtcbiAgfVxuXG4gIGNvbnN0IHV0aWxzID0ge1xuICAgIGlzVmFsaWRTZWNyZXRLZXksXG4gICAgaXNWYWxpZFB1YmxpY0tleSxcbiAgICByYW5kb21TZWNyZXRLZXksXG4gIH07XG4gIGNvbnN0IGtleWdlbiA9IGNyZWF0ZUtleWdlbihyYW5kb21TZWNyZXRLZXksIGdldFB1YmxpY0tleSk7XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoeyBnZXRQdWJsaWNLZXksIGdldFNoYXJlZFNlY3JldCwga2V5Z2VuLCBQb2ludCwgdXRpbHMsIGxlbmd0aHMgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBFQ0RTQSBzaWduaW5nIGludGVyZmFjZSBmb3IgZ2l2ZW4gZWxsaXB0aWMgY3VydmUgYFBvaW50YCBhbmQgYGhhc2hgIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBQb2ludCBjcmVhdGVkIHVzaW5nIHtAbGluayB3ZWllcnN0cmFzc30gZnVuY3Rpb25cbiAqIEBwYXJhbSBoYXNoIHVzZWQgZm9yIDEpIG1lc3NhZ2UgcHJlaGFzaC1pbmcgMikgayBnZW5lcmF0aW9uIGluIGBzaWduYCwgdXNpbmcgaG1hY19kcmJnKGhhc2gpXG4gKiBAcGFyYW0gZWNkc2FPcHRzIHJhcmVseSBuZWVkZWQsIHNlZSB7QGxpbmsgRUNEU0FPcHRzfVxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogY29uc3QgcDI1Nl9Qb2ludCA9IHdlaWVyc3RyYXNzKC4uLik7XG4gKiBjb25zdCBwMjU2X3NoYTI1NiA9IGVjZHNhKHAyNTZfUG9pbnQsIHNoYTI1Nik7XG4gKiBjb25zdCBwMjU2X3NoYTIyNCA9IGVjZHNhKHAyNTZfUG9pbnQsIHNoYTIyNCk7XG4gKiBjb25zdCBwMjU2X3NoYTIyNF9yID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjI0LCB7IHJhbmRvbUJ5dGVzOiAobGVuZ3RoKSA9PiB7IC4uLiB9IH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlY2RzYShcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD4sXG4gIGhhc2g6IENIYXNoLFxuICBlY2RzYU9wdHM6IEVDRFNBT3B0cyA9IHt9XG4pOiBFQ0RTQSB7XG4gIGFoYXNoKGhhc2gpO1xuICB2YWxpZGF0ZU9iamVjdChcbiAgICBlY2RzYU9wdHMsXG4gICAge30sXG4gICAge1xuICAgICAgaG1hYzogJ2Z1bmN0aW9uJyxcbiAgICAgIGxvd1M6ICdib29sZWFuJyxcbiAgICAgIHJhbmRvbUJ5dGVzOiAnZnVuY3Rpb24nLFxuICAgICAgYml0czJpbnQ6ICdmdW5jdGlvbicsXG4gICAgICBiaXRzMmludF9tb2ROOiAnZnVuY3Rpb24nLFxuICAgIH1cbiAgKTtcbiAgZWNkc2FPcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZWNkc2FPcHRzKTtcbiAgY29uc3QgcmFuZG9tQnl0ZXMgPSBlY2RzYU9wdHMucmFuZG9tQnl0ZXMgfHwgd2NSYW5kb21CeXRlcztcbiAgY29uc3QgaG1hYyA9IGVjZHNhT3B0cy5obWFjIHx8ICgoa2V5LCBtc2cpID0+IG5vYmxlSG1hYyhoYXNoLCBrZXksIG1zZykpO1xuXG4gIGNvbnN0IHsgRnAsIEZuIH0gPSBQb2ludDtcbiAgY29uc3QgeyBPUkRFUjogQ1VSVkVfT1JERVIsIEJJVFM6IGZuQml0cyB9ID0gRm47XG4gIGNvbnN0IHsga2V5Z2VuLCBnZXRQdWJsaWNLZXksIGdldFNoYXJlZFNlY3JldCwgdXRpbHMsIGxlbmd0aHMgfSA9IGVjZGgoUG9pbnQsIGVjZHNhT3B0cyk7XG4gIGNvbnN0IGRlZmF1bHRTaWdPcHRzOiBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPiA9IHtcbiAgICBwcmVoYXNoOiB0cnVlLFxuICAgIGxvd1M6IHR5cGVvZiBlY2RzYU9wdHMubG93UyA9PT0gJ2Jvb2xlYW4nID8gZWNkc2FPcHRzLmxvd1MgOiB0cnVlLFxuICAgIGZvcm1hdDogJ2NvbXBhY3QnIGFzIEVDRFNBU2lnbmF0dXJlRm9ybWF0LFxuICAgIGV4dHJhRW50cm9weTogZmFsc2UsXG4gIH07XG4gIGNvbnN0IGhhc0xhcmdlQ29mYWN0b3IgPSBDVVJWRV9PUkRFUiAqIF8ybiA8IEZwLk9SREVSOyAvLyBXb24ndCBDVVJWRSgpLmggPiAybiBiZSBtb3JlIGVmZmVjdGl2ZT9cblxuICBmdW5jdGlvbiBpc0JpZ2dlclRoYW5IYWxmT3JkZXIobnVtYmVyOiBiaWdpbnQpIHtcbiAgICBjb25zdCBIQUxGID0gQ1VSVkVfT1JERVIgPj4gXzFuO1xuICAgIHJldHVybiBudW1iZXIgPiBIQUxGO1xuICB9XG4gIGZ1bmN0aW9uIHZhbGlkYXRlUlModGl0bGU6IHN0cmluZywgbnVtOiBiaWdpbnQpOiBiaWdpbnQge1xuICAgIGlmICghRm4uaXNWYWxpZE5vdDAobnVtKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBzaWduYXR1cmUgJHt0aXRsZX06IG91dCBvZiByYW5nZSAxLi5Qb2ludC5Gbi5PUkRFUmApO1xuICAgIHJldHVybiBudW07XG4gIH1cbiAgZnVuY3Rpb24gYXNzZXJ0U21hbGxDb2ZhY3RvcigpOiB2b2lkIHtcbiAgICAvLyBFQ0RTQSByZWNvdmVyeSBpcyBoYXJkIGZvciBjb2ZhY3RvciA+IDEgY3VydmVzLlxuICAgIC8vIEluIHNpZ24sIGByID0gcS54IG1vZCBuYCwgYW5kIGhlcmUgd2UgcmVjb3ZlciBxLnggZnJvbSByLlxuICAgIC8vIFdoaWxlIHJlY292ZXJpbmcgcS54ID49IG4sIHdlIG5lZWQgdG8gYWRkIHIrbiBmb3IgY29mYWN0b3I9MSBjdXJ2ZXMuXG4gICAgLy8gSG93ZXZlciwgZm9yIGNvZmFjdG9yPjEsIHIrbiBtYXkgbm90IGdldCBxLng6XG4gICAgLy8gcituKmkgd291bGQgbmVlZCB0byBiZSBkb25lIGluc3RlYWQgd2hlcmUgaSBpcyB1bmtub3duLlxuICAgIC8vIFRvIGVhc2lseSBnZXQgaSwgd2UgZWl0aGVyIG5lZWQgdG86XG4gICAgLy8gYS4gaW5jcmVhc2UgYW1vdW50IG9mIHZhbGlkIHJlY2lkIHZhbHVlcyAoNCwgNS4uLik7IE9SXG4gICAgLy8gYi4gcHJvaGliaXQgbm9uLXByaW1lLW9yZGVyIHNpZ25hdHVyZXMgKHJlY2lkID4gMSkuXG4gICAgaWYgKGhhc0xhcmdlQ29mYWN0b3IpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wicmVjb3ZlcmVkXCIgc2lnIHR5cGUgaXMgbm90IHN1cHBvcnRlZCBmb3IgY29mYWN0b3IgPjIgY3VydmVzJyk7XG4gIH1cbiAgZnVuY3Rpb24gdmFsaWRhdGVTaWdMZW5ndGgoYnl0ZXM6IFVpbnQ4QXJyYXksIGZvcm1hdDogRUNEU0FTaWduYXR1cmVGb3JtYXQpIHtcbiAgICB2YWxpZGF0ZVNpZ0Zvcm1hdChmb3JtYXQpO1xuICAgIGNvbnN0IHNpemUgPSBsZW5ndGhzLnNpZ25hdHVyZSE7XG4gICAgY29uc3Qgc2l6ZXIgPSBmb3JtYXQgPT09ICdjb21wYWN0JyA/IHNpemUgOiBmb3JtYXQgPT09ICdyZWNvdmVyZWQnID8gc2l6ZSArIDEgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGFieXRlcyhieXRlcywgc2l6ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVDRFNBIHNpZ25hdHVyZSB3aXRoIGl0cyAociwgcykgcHJvcGVydGllcy4gU3VwcG9ydHMgY29tcGFjdCwgcmVjb3ZlcmVkICYgREVSIHJlcHJlc2VudGF0aW9ucy5cbiAgICovXG4gIGNsYXNzIFNpZ25hdHVyZSBpbXBsZW1lbnRzIEVDRFNBU2lnbmF0dXJlIHtcbiAgICByZWFkb25seSByOiBiaWdpbnQ7XG4gICAgcmVhZG9ubHkgczogYmlnaW50O1xuICAgIHJlYWRvbmx5IHJlY292ZXJ5PzogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocjogYmlnaW50LCBzOiBiaWdpbnQsIHJlY292ZXJ5PzogbnVtYmVyKSB7XG4gICAgICB0aGlzLnIgPSB2YWxpZGF0ZVJTKCdyJywgcik7IC8vIHIgaW4gWzEuLk4tMV07XG4gICAgICB0aGlzLnMgPSB2YWxpZGF0ZVJTKCdzJywgcyk7IC8vIHMgaW4gWzEuLk4tMV07XG4gICAgICBpZiAocmVjb3ZlcnkgIT0gbnVsbCkge1xuICAgICAgICBhc3NlcnRTbWFsbENvZmFjdG9yKCk7XG4gICAgICAgIGlmICghWzAsIDEsIDIsIDNdLmluY2x1ZGVzKHJlY292ZXJ5KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5IGlkJyk7XG4gICAgICAgIHRoaXMucmVjb3ZlcnkgPSByZWNvdmVyeTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZyb21CeXRlcyhcbiAgICAgIGJ5dGVzOiBVaW50OEFycmF5LFxuICAgICAgZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9IGRlZmF1bHRTaWdPcHRzLmZvcm1hdFxuICAgICk6IFNpZ25hdHVyZSB7XG4gICAgICB2YWxpZGF0ZVNpZ0xlbmd0aChieXRlcywgZm9ybWF0KTtcbiAgICAgIGxldCByZWNpZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ2RlcicpIHtcbiAgICAgICAgY29uc3QgeyByLCBzIH0gPSBERVIudG9TaWcoYWJ5dGVzKGJ5dGVzKSk7XG4gICAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKHIsIHMpO1xuICAgICAgfVxuICAgICAgaWYgKGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcpIHtcbiAgICAgICAgcmVjaWQgPSBieXRlc1swXTtcbiAgICAgICAgZm9ybWF0ID0gJ2NvbXBhY3QnO1xuICAgICAgICBieXRlcyA9IGJ5dGVzLnN1YmFycmF5KDEpO1xuICAgICAgfVxuICAgICAgY29uc3QgTCA9IGxlbmd0aHMuc2lnbmF0dXJlISAvIDI7XG4gICAgICBjb25zdCByID0gYnl0ZXMuc3ViYXJyYXkoMCwgTCk7XG4gICAgICBjb25zdCBzID0gYnl0ZXMuc3ViYXJyYXkoTCwgTCAqIDIpO1xuICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUoRm4uZnJvbUJ5dGVzKHIpLCBGbi5mcm9tQnl0ZXMocyksIHJlY2lkKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUhleChoZXg6IHN0cmluZywgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyb21CeXRlcyhoZXhUb0J5dGVzKGhleCksIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3NlcnRSZWNvdmVyeSgpOiBudW1iZXIge1xuICAgICAgY29uc3QgeyByZWNvdmVyeSB9ID0gdGhpcztcbiAgICAgIGlmIChyZWNvdmVyeSA9PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3ZlcnkgaWQ6IG11c3QgYmUgcHJlc2VudCcpO1xuICAgICAgcmV0dXJuIHJlY292ZXJ5O1xuICAgIH1cblxuICAgIGFkZFJlY292ZXJ5Qml0KHJlY292ZXJ5OiBudW1iZXIpOiBSZWNvdmVyZWRTaWduYXR1cmUge1xuICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUodGhpcy5yLCB0aGlzLnMsIHJlY292ZXJ5KSBhcyBSZWNvdmVyZWRTaWduYXR1cmU7XG4gICAgfVxuXG4gICAgcmVjb3ZlclB1YmxpY0tleShtZXNzYWdlSGFzaDogVWludDhBcnJheSk6IFdlaWVyc3RyYXNzUG9pbnQ8YmlnaW50PiB7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHRoaXM7XG4gICAgICBjb25zdCByZWNvdmVyeSA9IHRoaXMuYXNzZXJ0UmVjb3ZlcnkoKTtcbiAgICAgIGNvbnN0IHJhZGogPSByZWNvdmVyeSA9PT0gMiB8fCByZWNvdmVyeSA9PT0gMyA/IHIgKyBDVVJWRV9PUkRFUiA6IHI7XG4gICAgICBpZiAoIUZwLmlzVmFsaWQocmFkaikpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeSBpZDogc2lnLnIrY3VydmUubiAhPSBSLngnKTtcbiAgICAgIGNvbnN0IHggPSBGcC50b0J5dGVzKHJhZGopO1xuICAgICAgY29uc3QgUiA9IFBvaW50LmZyb21CeXRlcyhjb25jYXRCeXRlcyhwcHJlZml4KChyZWNvdmVyeSAmIDEpID09PSAwKSwgeCkpO1xuICAgICAgY29uc3QgaXIgPSBGbi5pbnYocmFkaik7IC8vIHJeLTFcbiAgICAgIGNvbnN0IGggPSBiaXRzMmludF9tb2ROKGFieXRlcyhtZXNzYWdlSGFzaCwgdW5kZWZpbmVkLCAnbXNnSGFzaCcpKTsgLy8gVHJ1bmNhdGUgaGFzaFxuICAgICAgY29uc3QgdTEgPSBGbi5jcmVhdGUoLWggKiBpcik7IC8vIC1ocl4tMVxuICAgICAgY29uc3QgdTIgPSBGbi5jcmVhdGUocyAqIGlyKTsgLy8gc3JeLTFcbiAgICAgIC8vIChzcl4tMSlSLShocl4tMSlHID0gLShocl4tMSlHICsgKHNyXi0xKS4gdW5zYWZlIGlzIGZpbmU6IHRoZXJlIGlzIG5vIHByaXZhdGUgZGF0YS5cbiAgICAgIGNvbnN0IFEgPSBQb2ludC5CQVNFLm11bHRpcGx5VW5zYWZlKHUxKS5hZGQoUi5tdWx0aXBseVVuc2FmZSh1MikpO1xuICAgICAgaWYgKFEuaXMwKCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeTogcG9pbnQgYXQgaW5maW5pZnknKTtcbiAgICAgIFEuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgICAgIHJldHVybiBRO1xuICAgIH1cblxuICAgIC8vIFNpZ25hdHVyZXMgc2hvdWxkIGJlIGxvdy1zLCB0byBwcmV2ZW50IG1hbGxlYWJpbGl0eS5cbiAgICBoYXNIaWdoUygpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBpc0JpZ2dlclRoYW5IYWxmT3JkZXIodGhpcy5zKTtcbiAgICB9XG5cbiAgICB0b0J5dGVzKGZvcm1hdDogRUNEU0FTaWduYXR1cmVGb3JtYXQgPSBkZWZhdWx0U2lnT3B0cy5mb3JtYXQpIHtcbiAgICAgIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdCk7XG4gICAgICBpZiAoZm9ybWF0ID09PSAnZGVyJykgcmV0dXJuIGhleFRvQnl0ZXMoREVSLmhleEZyb21TaWcodGhpcykpO1xuICAgICAgY29uc3QgeyByLCBzIH0gPSB0aGlzO1xuICAgICAgY29uc3QgcmIgPSBGbi50b0J5dGVzKHIpO1xuICAgICAgY29uc3Qgc2IgPSBGbi50b0J5dGVzKHMpO1xuICAgICAgaWYgKGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcpIHtcbiAgICAgICAgYXNzZXJ0U21hbGxDb2ZhY3RvcigpO1xuICAgICAgICByZXR1cm4gY29uY2F0Qnl0ZXMoVWludDhBcnJheS5vZih0aGlzLmFzc2VydFJlY292ZXJ5KCkpLCByYiwgc2IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbmNhdEJ5dGVzKHJiLCBzYik7XG4gICAgfVxuXG4gICAgdG9IZXgoZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQpIHtcbiAgICAgIHJldHVybiBieXRlc1RvSGV4KHRoaXMudG9CeXRlcyhmb3JtYXQpKTtcbiAgICB9XG4gIH1cbiAgdHlwZSBSZWNvdmVyZWRTaWduYXR1cmUgPSBTaWduYXR1cmUgJiB7IHJlY292ZXJ5OiBudW1iZXIgfTtcblxuICAvLyBSRkM2OTc5OiBlbnN1cmUgRUNEU0EgbXNnIGlzIFggYnl0ZXMgYW5kIDwgTi4gUkZDIHN1Z2dlc3RzIG9wdGlvbmFsIHRydW5jYXRpbmcgdmlhIGJpdHMyb2N0ZXRzLlxuICAvLyBGSVBTIDE4Ni00IDQuNiBzdWdnZXN0cyB0aGUgbGVmdG1vc3QgbWluKG5CaXRMZW4sIG91dExlbikgYml0cywgd2hpY2ggbWF0Y2hlcyBiaXRzMmludC5cbiAgLy8gYml0czJpbnQgY2FuIHByb2R1Y2UgcmVzPk4sIHdlIGNhbiBkbyBtb2QocmVzLCBOKSBzaW5jZSB0aGUgYml0TGVuIGlzIHRoZSBzYW1lLlxuICAvLyBpbnQyb2N0ZXRzIGNhbid0IGJlIHVzZWQ7IHBhZHMgc21hbGwgbXNncyB3aXRoIDA6IHVuYWNjZXB0YXRibGUgZm9yIHRydW5jIGFzIHBlciBSRkMgdmVjdG9yc1xuICBjb25zdCBiaXRzMmludCA9XG4gICAgZWNkc2FPcHRzLmJpdHMyaW50IHx8XG4gICAgZnVuY3Rpb24gYml0czJpbnRfZGVmKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIC8vIE91ciBjdXN0b20gY2hlY2sgXCJqdXN0IGluIGNhc2VcIiwgZm9yIHByb3RlY3Rpb24gYWdhaW5zdCBEb1NcbiAgICAgIGlmIChieXRlcy5sZW5ndGggPiA4MTkyKSB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IGlzIHRvbyBsYXJnZScpO1xuICAgICAgLy8gRm9yIGN1cnZlcyB3aXRoIG5CaXRMZW5ndGggJSA4ICE9PSAwOiBiaXRzMm9jdGV0cyhiaXRzMm9jdGV0cyhtKSkgIT09IGJpdHMyb2N0ZXRzKG0pXG4gICAgICAvLyBmb3Igc29tZSBjYXNlcywgc2luY2UgYnl0ZXMubGVuZ3RoICogOCBpcyBub3QgYWN0dWFsIGJpdExlbmd0aC5cbiAgICAgIGNvbnN0IG51bSA9IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7IC8vIGNoZWNrIGZvciA9PSB1OCBkb25lIGhlcmVcbiAgICAgIGNvbnN0IGRlbHRhID0gYnl0ZXMubGVuZ3RoICogOCAtIGZuQml0czsgLy8gdHJ1bmNhdGUgdG8gbkJpdExlbmd0aCBsZWZ0bW9zdCBiaXRzXG4gICAgICByZXR1cm4gZGVsdGEgPiAwID8gbnVtID4+IEJpZ0ludChkZWx0YSkgOiBudW07XG4gICAgfTtcbiAgY29uc3QgYml0czJpbnRfbW9kTiA9XG4gICAgZWNkc2FPcHRzLmJpdHMyaW50X21vZE4gfHxcbiAgICBmdW5jdGlvbiBiaXRzMmludF9tb2ROX2RlZihieXRlczogVWludDhBcnJheSk6IGJpZ2ludCB7XG4gICAgICByZXR1cm4gRm4uY3JlYXRlKGJpdHMyaW50KGJ5dGVzKSk7IC8vIGNhbid0IHVzZSBieXRlc1RvTnVtYmVyQkUgaGVyZVxuICAgIH07XG4gIC8vIFBhZHMgb3V0cHV0IHdpdGggemVybyBhcyBwZXIgc3BlY1xuICBjb25zdCBPUkRFUl9NQVNLID0gYml0TWFzayhmbkJpdHMpO1xuICAvKiogQ29udmVydHMgdG8gYnl0ZXMuIENoZWNrcyBpZiBudW0gaW4gYFswLi5PUkRFUl9NQVNLLTFdYCBlLmcuOiBgWzAuLjJeMjU2LTFdYC4gKi9cbiAgZnVuY3Rpb24gaW50Mm9jdGV0cyhudW06IGJpZ2ludCk6IFVpbnQ4QXJyYXkge1xuICAgIC8vIElNUE9SVEFOVDogdGhlIGNoZWNrIGVuc3VyZXMgd29ya2luZyBmb3IgY2FzZSBgRm4uQllURVMgIT0gRm4uQklUUyAqIDhgXG4gICAgYUluUmFuZ2UoJ251bSA8IDJeJyArIGZuQml0cywgbnVtLCBfMG4sIE9SREVSX01BU0spO1xuICAgIHJldHVybiBGbi50b0J5dGVzKG51bSk7XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZTogVWludDhBcnJheSwgcHJlaGFzaDogYm9vbGVhbikge1xuICAgIGFieXRlcyhtZXNzYWdlLCB1bmRlZmluZWQsICdtZXNzYWdlJyk7XG4gICAgcmV0dXJuIHByZWhhc2ggPyBhYnl0ZXMoaGFzaChtZXNzYWdlKSwgdW5kZWZpbmVkLCAncHJlaGFzaGVkIG1lc3NhZ2UnKSA6IG1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogU3RlcHMgQSwgRCBvZiBSRkM2OTc5IDMuMi5cbiAgICogQ3JlYXRlcyBSRkM2OTc5IHNlZWQ7IGNvbnZlcnRzIG1zZy9wcml2S2V5IHRvIG51bWJlcnMuXG4gICAqIFVzZWQgb25seSBpbiBzaWduLCBub3QgaW4gdmVyaWZ5LlxuICAgKlxuICAgKiBXYXJuaW5nOiB3ZSBjYW5ub3QgYXNzdW1lIGhlcmUgdGhhdCBtZXNzYWdlIGhhcyBzYW1lIGFtb3VudCBvZiBieXRlcyBhcyBjdXJ2ZSBvcmRlcixcbiAgICogdGhpcyB3aWxsIGJlIGludmFsaWQgYXQgbGVhc3QgZm9yIFA1MjEuIEFsc28gaXQgY2FuIGJlIGJpZ2dlciBmb3IgUDIyNCArIFNIQTI1Ni5cbiAgICovXG4gIGZ1bmN0aW9uIHByZXBTaWcobWVzc2FnZTogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5LCBvcHRzOiBFQ0RTQVNpZ25PcHRzKSB7XG4gICAgY29uc3QgeyBsb3dTLCBwcmVoYXNoLCBleHRyYUVudHJvcHkgfSA9IHZhbGlkYXRlU2lnT3B0cyhvcHRzLCBkZWZhdWx0U2lnT3B0cyk7XG4gICAgbWVzc2FnZSA9IHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlLCBwcmVoYXNoKTsgLy8gUkZDNjk3OSAzLjIgQTogaDEgPSBIKG0pXG4gICAgLy8gV2UgY2FuJ3QgbGF0ZXIgY2FsbCBiaXRzMm9jdGV0cywgc2luY2UgbmVzdGVkIGJpdHMyaW50IGlzIGJyb2tlbiBmb3IgY3VydmVzXG4gICAgLy8gd2l0aCBmbkJpdHMgJSA4ICE9PSAwLiBCZWNhdXNlIG9mIHRoYXQsIHdlIHVud3JhcCBpdCBoZXJlIGFzIGludDJvY3RldHMgY2FsbC5cbiAgICAvLyBjb25zdCBiaXRzMm9jdGV0cyA9IChiaXRzKSA9PiBpbnQyb2N0ZXRzKGJpdHMyaW50X21vZE4oYml0cykpXG4gICAgY29uc3QgaDFpbnQgPSBiaXRzMmludF9tb2ROKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGQgPSBGbi5mcm9tQnl0ZXMoc2VjcmV0S2V5KTsgLy8gdmFsaWRhdGUgc2VjcmV0IGtleSwgY29udmVydCB0byBiaWdpbnRcbiAgICBpZiAoIUZuLmlzVmFsaWROb3QwKGQpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcHJpdmF0ZSBrZXknKTtcbiAgICBjb25zdCBzZWVkQXJncyA9IFtpbnQyb2N0ZXRzKGQpLCBpbnQyb2N0ZXRzKGgxaW50KV07XG4gICAgLy8gZXh0cmFFbnRyb3B5LiBSRkM2OTc5IDMuNjogYWRkaXRpb25hbCBrJyAob3B0aW9uYWwpLlxuICAgIGlmIChleHRyYUVudHJvcHkgIT0gbnVsbCAmJiBleHRyYUVudHJvcHkgIT09IGZhbHNlKSB7XG4gICAgICAvLyBLID0gSE1BQ19LKFYgfHwgMHgwMCB8fCBpbnQyb2N0ZXRzKHgpIHx8IGJpdHMyb2N0ZXRzKGgxKSB8fCBrJylcbiAgICAgIC8vIGdlbiByYW5kb20gYnl0ZXMgT1IgcGFzcyBhcy1pc1xuICAgICAgY29uc3QgZSA9IGV4dHJhRW50cm9weSA9PT0gdHJ1ZSA/IHJhbmRvbUJ5dGVzKGxlbmd0aHMuc2VjcmV0S2V5KSA6IGV4dHJhRW50cm9weTtcbiAgICAgIHNlZWRBcmdzLnB1c2goYWJ5dGVzKGUsIHVuZGVmaW5lZCwgJ2V4dHJhRW50cm9weScpKTsgLy8gY2hlY2sgZm9yIGJlaW5nIGJ5dGVzXG4gICAgfVxuICAgIGNvbnN0IHNlZWQgPSBjb25jYXRCeXRlcyguLi5zZWVkQXJncyk7IC8vIFN0ZXAgRCBvZiBSRkM2OTc5IDMuMlxuICAgIGNvbnN0IG0gPSBoMWludDsgLy8gbm8gbmVlZCB0byBjYWxsIGJpdHMyaW50IHNlY29uZCB0aW1lIGhlcmUsIGl0IGlzIGluc2lkZSB0cnVuY2F0ZUhhc2ghXG4gICAgLy8gQ29udmVydHMgc2lnbmF0dXJlIHBhcmFtcyBpbnRvIHBvaW50IHcgci9zLCBjaGVja3MgcmVzdWx0IGZvciB2YWxpZGl0eS5cbiAgICAvLyBUbyB0cmFuc2Zvcm0gayA9PiBTaWduYXR1cmU6XG4gICAgLy8gcSA9IGtcdTIyQzVHXG4gICAgLy8gciA9IHEueCBtb2QgblxuICAgIC8vIHMgPSBrXi0xKG0gKyByZCkgbW9kIG5cbiAgICAvLyBDYW4gdXNlIHNjYWxhciBibGluZGluZyBiXi0xKGJtICsgYmRyKSB3aGVyZSBiIFx1MjIwOCBbMSxxXHUyMjEyMV0gYWNjb3JkaW5nIHRvXG4gICAgLy8gaHR0cHM6Ly90Y2hlcy5pYWNyLm9yZy9pbmRleC5waHAvVENIRVMvYXJ0aWNsZS92aWV3LzczMzcvNjUwOS4gV2UndmUgZGVjaWRlZCBhZ2FpbnN0IGl0OlxuICAgIC8vIGEpIGRlcGVuZGVuY3kgb24gQ1NQUk5HIGIpIDE1JSBzbG93ZG93biBjKSBkb2Vzbid0IHJlYWxseSBoZWxwIHNpbmNlIGJpZ2ludHMgYXJlIG5vdCBDVFxuICAgIGZ1bmN0aW9uIGsyc2lnKGtCeXRlczogVWludDhBcnJheSk6IFNpZ25hdHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgICAvLyBSRkMgNjk3OSBTZWN0aW9uIDMuMiwgc3RlcCAzOiBrID0gYml0czJpbnQoVClcbiAgICAgIC8vIEltcG9ydGFudDogYWxsIG1vZCgpIGNhbGxzIGhlcmUgbXVzdCBiZSBkb25lIG92ZXIgTlxuICAgICAgY29uc3QgayA9IGJpdHMyaW50KGtCeXRlcyk7IC8vIENhbm5vdCB1c2UgZmllbGRzIG1ldGhvZHMsIHNpbmNlIGl0IGlzIGdyb3VwIGVsZW1lbnRcbiAgICAgIGlmICghRm4uaXNWYWxpZE5vdDAoaykpIHJldHVybjsgLy8gVmFsaWQgc2NhbGFycyAoaW5jbHVkaW5nIGspIG11c3QgYmUgaW4gMS4uTi0xXG4gICAgICBjb25zdCBpayA9IEZuLmludihrKTsgLy8ga14tMSBtb2QgblxuICAgICAgY29uc3QgcSA9IFBvaW50LkJBU0UubXVsdGlwbHkoaykudG9BZmZpbmUoKTsgLy8gcSA9IGtcdTIyQzVHXG4gICAgICBjb25zdCByID0gRm4uY3JlYXRlKHEueCk7IC8vIHIgPSBxLnggbW9kIG5cbiAgICAgIGlmIChyID09PSBfMG4pIHJldHVybjtcbiAgICAgIGNvbnN0IHMgPSBGbi5jcmVhdGUoaWsgKiBGbi5jcmVhdGUobSArIHIgKiBkKSk7IC8vIHMgPSBrXi0xKG0gKyByZCkgbW9kIG5cbiAgICAgIGlmIChzID09PSBfMG4pIHJldHVybjtcbiAgICAgIGxldCByZWNvdmVyeSA9IChxLnggPT09IHIgPyAwIDogMikgfCBOdW1iZXIocS55ICYgXzFuKTsgLy8gcmVjb3ZlcnkgYml0ICgyIG9yIDMgd2hlbiBxLng+bilcbiAgICAgIGxldCBub3JtUyA9IHM7XG4gICAgICBpZiAobG93UyAmJiBpc0JpZ2dlclRoYW5IYWxmT3JkZXIocykpIHtcbiAgICAgICAgbm9ybVMgPSBGbi5uZWcocyk7IC8vIGlmIGxvd1Mgd2FzIHBhc3NlZCwgZW5zdXJlIHMgaXMgYWx3YXlzIGluIHRoZSBib3R0b20gaGFsZiBvZiBOXG4gICAgICAgIHJlY292ZXJ5IF49IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZShyLCBub3JtUywgaGFzTGFyZ2VDb2ZhY3RvciA/IHVuZGVmaW5lZCA6IHJlY292ZXJ5KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc2VlZCwgazJzaWcgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWducyBtZXNzYWdlIGhhc2ggd2l0aCBhIHNlY3JldCBrZXkuXG4gICAqXG4gICAqIGBgYFxuICAgKiBzaWduKG0sIGQpIHdoZXJlXG4gICAqICAgayA9IHJmYzY5NzlfaG1hY19kcmJnKG0sIGQpXG4gICAqICAgKHgsIHkpID0gRyBcdTAwRDcga1xuICAgKiAgIHIgPSB4IG1vZCBuXG4gICAqICAgcyA9IChtICsgZHIpIC8gayBtb2QgblxuICAgKiBgYGBcbiAgICovXG4gIGZ1bmN0aW9uIHNpZ24obWVzc2FnZTogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5LCBvcHRzOiBFQ0RTQVNpZ25PcHRzID0ge30pOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IHNlZWQsIGsyc2lnIH0gPSBwcmVwU2lnKG1lc3NhZ2UsIHNlY3JldEtleSwgb3B0cyk7IC8vIFN0ZXBzIEEsIEQgb2YgUkZDNjk3OSAzLjIuXG4gICAgY29uc3QgZHJiZyA9IGNyZWF0ZUhtYWNEcmJnPFNpZ25hdHVyZT4oaGFzaC5vdXRwdXRMZW4sIEZuLkJZVEVTLCBobWFjKTtcbiAgICBjb25zdCBzaWcgPSBkcmJnKHNlZWQsIGsyc2lnKTsgLy8gU3RlcHMgQiwgQywgRCwgRSwgRiwgR1xuICAgIHJldHVybiBzaWcudG9CeXRlcyhvcHRzLmZvcm1hdCk7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgYSBzaWduYXR1cmUgYWdhaW5zdCBtZXNzYWdlIGFuZCBwdWJsaWMga2V5LlxuICAgKiBSZWplY3RzIGxvd1Mgc2lnbmF0dXJlcyBieSBkZWZhdWx0OiBzZWUge0BsaW5rIEVDRFNBVmVyaWZ5T3B0c30uXG4gICAqIEltcGxlbWVudHMgc2VjdGlvbiA0LjEuNCBmcm9tIGh0dHBzOi8vd3d3LnNlY2cub3JnL3NlYzEtdjIucGRmOlxuICAgKlxuICAgKiBgYGBcbiAgICogdmVyaWZ5KHIsIHMsIGgsIFApIHdoZXJlXG4gICAqICAgdTEgPSBoc14tMSBtb2QgblxuICAgKiAgIHUyID0gcnNeLTEgbW9kIG5cbiAgICogICBSID0gdTFcdTIyQzVHICsgdTJcdTIyQzVQXG4gICAqICAgbW9kKFIueCwgbikgPT0gclxuICAgKiBgYGBcbiAgICovXG4gIGZ1bmN0aW9uIHZlcmlmeShcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXk6IFVpbnQ4QXJyYXksXG4gICAgb3B0czogRUNEU0FWZXJpZnlPcHRzID0ge31cbiAgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBsb3dTLCBwcmVoYXNoLCBmb3JtYXQgfSA9IHZhbGlkYXRlU2lnT3B0cyhvcHRzLCBkZWZhdWx0U2lnT3B0cyk7XG4gICAgcHVibGljS2V5ID0gYWJ5dGVzKHB1YmxpY0tleSwgdW5kZWZpbmVkLCAncHVibGljS2V5Jyk7XG4gICAgbWVzc2FnZSA9IHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlLCBwcmVoYXNoKTtcbiAgICBpZiAoIWlzQnl0ZXMoc2lnbmF0dXJlIGFzIGFueSkpIHtcbiAgICAgIGNvbnN0IGVuZCA9IHNpZ25hdHVyZSBpbnN0YW5jZW9mIFNpZ25hdHVyZSA/ICcsIHVzZSBzaWcudG9CeXRlcygpJyA6ICcnO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd2ZXJpZnkgZXhwZWN0cyBVaW50OEFycmF5IHNpZ25hdHVyZScgKyBlbmQpO1xuICAgIH1cbiAgICB2YWxpZGF0ZVNpZ0xlbmd0aChzaWduYXR1cmUsIGZvcm1hdCk7IC8vIGV4ZWN1dGUgdGhpcyB0d2ljZSBiZWNhdXNlIHdlIHdhbnQgbG91ZCBlcnJvclxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzaWcgPSBTaWduYXR1cmUuZnJvbUJ5dGVzKHNpZ25hdHVyZSwgZm9ybWF0KTtcbiAgICAgIGNvbnN0IFAgPSBQb2ludC5mcm9tQnl0ZXMocHVibGljS2V5KTtcbiAgICAgIGlmIChsb3dTICYmIHNpZy5oYXNIaWdoUygpKSByZXR1cm4gZmFsc2U7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHNpZztcbiAgICAgIGNvbnN0IGggPSBiaXRzMmludF9tb2ROKG1lc3NhZ2UpOyAvLyBtb2Qgbiwgbm90IG1vZCBwXG4gICAgICBjb25zdCBpcyA9IEZuLmludihzKTsgLy8gc14tMSBtb2QgblxuICAgICAgY29uc3QgdTEgPSBGbi5jcmVhdGUoaCAqIGlzKTsgLy8gdTEgPSBoc14tMSBtb2QgblxuICAgICAgY29uc3QgdTIgPSBGbi5jcmVhdGUociAqIGlzKTsgLy8gdTIgPSByc14tMSBtb2QgblxuICAgICAgY29uc3QgUiA9IFBvaW50LkJBU0UubXVsdGlwbHlVbnNhZmUodTEpLmFkZChQLm11bHRpcGx5VW5zYWZlKHUyKSk7IC8vIHUxXHUyMkM1RyArIHUyXHUyMkM1UFxuICAgICAgaWYgKFIuaXMwKCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IHYgPSBGbi5jcmVhdGUoUi54KTsgLy8gdiA9IHIueCBtb2QgblxuICAgICAgcmV0dXJuIHYgPT09IHI7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY292ZXJQdWJsaWNLZXkoXG4gICAgc2lnbmF0dXJlOiBVaW50OEFycmF5LFxuICAgIG1lc3NhZ2U6IFVpbnQ4QXJyYXksXG4gICAgb3B0czogRUNEU0FSZWNvdmVyT3B0cyA9IHt9XG4gICk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgcHJlaGFzaCB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpO1xuICAgIHJldHVybiBTaWduYXR1cmUuZnJvbUJ5dGVzKHNpZ25hdHVyZSwgJ3JlY292ZXJlZCcpLnJlY292ZXJQdWJsaWNLZXkobWVzc2FnZSkudG9CeXRlcygpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoe1xuICAgIGtleWdlbixcbiAgICBnZXRQdWJsaWNLZXksXG4gICAgZ2V0U2hhcmVkU2VjcmV0LFxuICAgIHV0aWxzLFxuICAgIGxlbmd0aHMsXG4gICAgUG9pbnQsXG4gICAgc2lnbixcbiAgICB2ZXJpZnksXG4gICAgcmVjb3ZlclB1YmxpY0tleSxcbiAgICBTaWduYXR1cmUsXG4gICAgaGFzaCxcbiAgfSkgc2F0aXNmaWVzIFNpZ25lcjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbG9nZ2VyXG4gKiBAZGVzY3JpcHRpb24gTG9nZ2VyIHV0aWxpdHkgZm9yIHRoZSBhcHBsaWNhdGlvblxuICovXG5cbmVudW0gTG9nTGV2ZWwge1xuICBERUJVRyxcbiAgSU5GTyxcbiAgV0FSTixcbiAgRVJST1Jcbn1cblxuaW1wb3J0IHBpbm8gZnJvbSAncGlubyc7XG5cbi8qKlxuICogQ3JlYXRlIGEgbG9nZ2VyIGluc3RhbmNlIHdpdGggY29uc2lzdGVudCBjb25maWd1cmF0aW9uXG4gKiBAcGFyYW0gbmFtZSAtIENvbXBvbmVudCBvciBtb2R1bGUgbmFtZSBmb3IgdGhlIGxvZ2dlclxuICogQHJldHVybnMgQ29uZmlndXJlZCBwaW5vIGxvZ2dlciBpbnN0YW5jZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9nZ2VyKG5hbWU6IHN0cmluZyk6IHBpbm8uTG9nZ2VyIHtcbiAgcmV0dXJuIHBpbm8oe1xuICAgIG5hbWUsXG4gICAgbGV2ZWw6IHByb2Nlc3MuZW52LkxPR19MRVZFTCB8fCAnaW5mbycsXG4gICAgdHJhbnNwb3J0OiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IHtcbiAgICAgIHRhcmdldDogJ3Bpbm8tcHJldHR5JyxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgY29sb3JpemU6IHRydWUsXG4gICAgICAgIHRyYW5zbGF0ZVRpbWU6ICdISDpNTTpzcycsXG4gICAgICAgIGlnbm9yZTogJ3BpZCxob3N0bmFtZScsXG4gICAgICB9XG4gICAgfSA6IHVuZGVmaW5lZCxcbiAgICBmb3JtYXR0ZXJzOiB7XG4gICAgICBsZXZlbDogKGxhYmVsKSA9PiB7XG4gICAgICAgIHJldHVybiB7IGxldmVsOiBsYWJlbC50b1VwcGVyQ2FzZSgpIH07XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgbG9nIGZ1bmN0aW9uIGZvciBiYXNpYyBsb2dnaW5nIG5lZWRzXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gbG9nXG4gKiBAcGFyYW0gZGF0YSAtIE9wdGlvbmFsIGRhdGEgdG8gaW5jbHVkZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nKG1lc3NhZ2U6IHN0cmluZywgZGF0YT86IHVua25vd24pOiB2b2lkIHtcbiAgY29uc29sZS5sb2cobWVzc2FnZSwgZGF0YSk7XG59XG5cbi8qKlxuICogRGVmYXVsdCBsb2dnZXIgaW5zdGFuY2UgZm9yIHRoZSBhcHBsaWNhdGlvblxuICogSW5jbHVkZXMgZW5oYW5jZWQgZXJyb3IgaGFuZGxpbmcgYW5kIGZvcm1hdHRpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ2dlcjogcGluby5Mb2dnZXIgPSBwaW5vKHtcbiAgbmFtZTogJ25vc3RyLWNyeXB0by11dGlscycsXG4gIGxldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ2luZm8nLFxuICB0cmFuc3BvcnQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8ge1xuICAgIHRhcmdldDogJ3Bpbm8tcHJldHR5JyxcbiAgICBvcHRpb25zOiB7XG4gICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgIHRyYW5zbGF0ZVRpbWU6ICdISDpNTTpzcycsXG4gICAgICBpZ25vcmU6ICdwaWQsaG9zdG5hbWUnLFxuICAgIH1cbiAgfSA6IHVuZGVmaW5lZCxcbiAgZm9ybWF0dGVyczoge1xuICAgIGxldmVsOiAobGFiZWwpID0+IHtcbiAgICAgIHJldHVybiB7IGxldmVsOiBsYWJlbC50b1VwcGVyQ2FzZSgpIH07XG4gICAgfSxcbiAgICBsb2c6IChvYmo6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAvLyBDb252ZXJ0IGVycm9yIG9iamVjdHMgdG8gc3RyaW5ncyBmb3IgYmV0dGVyIGxvZ2dpbmdcbiAgICAgIGlmIChvYmogJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgJ2VycicgaW4gb2JqKSB7XG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4ub2JqIH07XG4gICAgICAgIGlmIChuZXdPYmouZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPSBuZXdPYmouZXJyIGFzIEVycm9yO1xuICAgICAgICAgIG5ld09iai5lcnIgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICBuYW1lOiBlcnIubmFtZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdPYmo7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfVxufSk7XG5cbmV4cG9ydCBjbGFzcyBDdXN0b21Mb2dnZXIge1xuICBwcml2YXRlIF9sZXZlbDogTG9nTGV2ZWw7XG5cbiAgY29uc3RydWN0b3IobGV2ZWw6IExvZ0xldmVsID0gTG9nTGV2ZWwuSU5GTykge1xuICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gIH1cblxuICBzZXRMZXZlbChsZXZlbDogTG9nTGV2ZWwpOiB2b2lkIHtcbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuICB9XG5cbiAgcHJpdmF0ZSBfbG9nKGxldmVsOiBMb2dMZXZlbCwgbWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICBpZiAobGV2ZWwgPj0gdGhpcy5fbGV2ZWwpIHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgIGNvbnN0IGxldmVsTmFtZSA9IExvZ0xldmVsW2xldmVsXTtcbiAgICAgIGNvbnN0IGNvbnRleHRTdHIgPSBjb250ZXh0ID8gYCAke0pTT04uc3RyaW5naWZ5KGNvbnRleHQpfWAgOiAnJztcbiAgICAgIGNvbnNvbGUubG9nKGBbJHt0aW1lc3RhbXB9XSAke2xldmVsTmFtZX06ICR7bWVzc2FnZX0ke2NvbnRleHRTdHJ9YCk7XG4gICAgfVxuICB9XG5cbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuREVCVUcsIG1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG5cbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5JTkZPLCBtZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxuXG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBjb250ZXh0PzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuV0FSTiwgbWVzc2FnZSwgY29udGV4dCk7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcgfCBFcnJvciB8IHVua25vd24sIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvciA/IG1lc3NhZ2UubWVzc2FnZSA6IFN0cmluZyhtZXNzYWdlKTtcbiAgICB0aGlzLl9sb2coTG9nTGV2ZWwuRVJST1IsIGVycm9yTWVzc2FnZSwgY29udGV4dCk7XG4gIH1cbn1cblxuLy8gUmUtZXhwb3J0IHRoZSBMb2dnZXIgdHlwZSBmb3IgdXNlIGluIG90aGVyIGZpbGVzXG5leHBvcnQgdHlwZSB7IExvZ2dlciB9IGZyb20gJ3Bpbm8nO1xuIiwgIi8qKlxuICogQmFzZTY0IGVuY29kaW5nIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqIFByb3ZpZGVzIGNvbnNpc3RlbnQgYmFzZTY0IGVuY29kaW5nL2RlY29kaW5nIGFjcm9zcyBhbGwgTm9zdHItcmVsYXRlZCBwcm9qZWN0c1xuICogVXNlcyBicm93c2VyLWNvbXBhdGlibGUgQVBJcyAobm8gTm9kZS5qcyBCdWZmZXIgZGVwZW5kZW5jeSlcbiAqL1xuXG4vKipcbiAqIENvbnZlcnQgc3RyaW5nIHRvIGJhc2U2NFxuICogQHBhcmFtIHN0ciBTdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgQmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9CYXNlNjQoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBieXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpO1xuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gc3RyaW5nXG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVVRGLTggc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9TdHJpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBiYXNlNjRUb0J5dGVzKGJhc2U2NCk7XG4gIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYnl0ZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVWludDhBcnJheSB0byBiYXNlNjRcbiAqIEBwYXJhbSBidWZmZXIgVWludDhBcnJheSB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUb0Jhc2U2NChidWZmZXI6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChidWZmZXIpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVaW50OEFycmF5XG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CdWZmZXIoYmFzZTY0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKCFpc1ZhbGlkQmFzZTY0KGJhc2U2NCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmFzZTY0IHN0cmluZycpO1xuICB9XG4gIHJldHVybiBiYXNlNjRUb0J5dGVzKGJhc2U2NCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgc3RyaW5nIGlzIHZhbGlkIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NCBTdHJpbmcgdG8gY2hlY2tcbiAqIEByZXR1cm5zIFRydWUgaWYgdmFsaWQgYmFzZTY0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQmFzZTY0KGJhc2U2NDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oYmFzZTY0Lm1hdGNoKC9eW0EtWmEtejAtOSsvXSo9ezAsMn0kLykpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBVUkwtc2FmZSBiYXNlNjRcbiAqIEBwYXJhbSBiYXNlNjQgU3RhbmRhcmQgYmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9CYXNlNjRVcmwoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZTY0LnJlcGxhY2UoL1xcKy9nLCAnLScpLnJlcGxhY2UoL1xcLy9nLCAnXycpLnJlcGxhY2UoLz0rJC8sICcnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IFVSTC1zYWZlIGJhc2U2NCB0byBzdGFuZGFyZCBiYXNlNjRcbiAqIEBwYXJhbSBiYXNlNjR1cmwgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgU3RhbmRhcmQgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUJhc2U2NFVybChiYXNlNjR1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJhc2U2NCA9IGJhc2U2NHVybC5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpO1xuICBjb25zdCBwYWRkaW5nID0gJz0nLnJlcGVhdCgoNCAtIGJhc2U2NC5sZW5ndGggJSA0KSAlIDQpO1xuICByZXR1cm4gYmFzZTY0ICsgcGFkZGluZztcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGhleCBzdHJpbmcgdG8gYmFzZTY0XG4gKiBAcGFyYW0gaGV4IEhleCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgQmFzZTY0IHN0cmluZ1xuICogQHRocm93cyBFcnJvciBpZiBoZXggc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhleFRvQmFzZTY0KGhleDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCFoZXgubWF0Y2goL15bMC05YS1mQS1GXSokLykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpO1xuICB9XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoaGV4Lmxlbmd0aCAvIDIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGhleC5sZW5ndGg7IGkgKz0gMikge1xuICAgIGJ5dGVzW2kgLyAyXSA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoaSwgaSArIDIpLCAxNik7XG4gIH1cbiAgcmV0dXJuIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIGhleCBzdHJpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBIZXggc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9IZXgoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBiYXNlNjRUb0J5dGVzKGJhc2U2NCk7XG4gIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzKS5tYXAoYiA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYmFzZTY0IHN0cmluZyBmcm9tIGJ5dGUgYXJyYXlcbiAqIEBwYXJhbSBieXRlcyBCeXRlIGFycmF5XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvQmFzZTY0KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgbGV0IGJpbmFyeSA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICB9XG4gIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gYnl0ZSBhcnJheVxuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBCeXRlIGFycmF5XG4gKiBAdGhyb3dzIEVycm9yIGlmIGJhc2U2NCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhiYXNlNjQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBwYWRkZWQgbGVuZ3RoIGZvciBiYXNlNjQgc3RyaW5nXG4gKiBAcGFyYW0gZGF0YUxlbmd0aCBMZW5ndGggb2YgcmF3IGRhdGFcbiAqIEByZXR1cm5zIExlbmd0aCBvZiBwYWRkZWQgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlQmFzZTY0TGVuZ3RoKGRhdGFMZW5ndGg6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLmNlaWwoZGF0YUxlbmd0aCAvIDMpICogNDtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYmFzZTY0IHBhZGRpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZ1xuICogQHJldHVybnMgQmFzZTY0IHN0cmluZyB3aXRob3V0IHBhZGRpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUJhc2U2NFBhZGRpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYmFzZTY0LnJlcGxhY2UoLz0rJC8sICcnKTtcbn1cblxuLyoqXG4gKiBBZGQgYmFzZTY0IHBhZGRpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB3aXRob3V0IHBhZGRpbmdcbiAqIEByZXR1cm5zIFByb3Blcmx5IHBhZGRlZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRCYXNlNjRQYWRkaW5nKGJhc2U2NDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcGFkZGluZyA9ICc9Jy5yZXBlYXQoKDQgLSBiYXNlNjQubGVuZ3RoICUgNCkgJSA0KTtcbiAgcmV0dXJuIGJhc2U2NCArIHBhZGRpbmc7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHZhbGlkYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBWYWxpZGF0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHIgZXZlbnRzLCBtZXNzYWdlcywgYW5kIHJlbGF0ZWQgZGF0YSBzdHJ1Y3R1cmVzLlxuICogUHJvdmlkZXMgZnVuY3Rpb25zIHRvIHZhbGlkYXRlIGV2ZW50cywgc2lnbmF0dXJlcywgZmlsdGVycywgYW5kIHN1YnNjcmlwdGlvbnMgYWNjb3JkaW5nIHRvIHRoZSBOb3N0ciBwcm90b2NvbC5cbiAqL1xuXG5pbXBvcnQgeyBcbiAgTm9zdHJFdmVudCwgXG4gIFNpZ25lZE5vc3RyRXZlbnQsIFxuICBOb3N0ckZpbHRlciwgXG4gIE5vc3RyU3Vic2NyaXB0aW9uLCBcbiAgVmFsaWRhdGlvblJlc3VsdCwgXG4gIFB1YmxpY0tleSxcbiAgTm9zdHJNZXNzYWdlVHlwZVxufSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuXG4vKipcbiAqIEdldHMgdGhlIGhleCBzdHJpbmcgZnJvbSBhIFB1YmxpY0tleSBvciBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZ2V0UHVibGljS2V5SGV4KHB1YmtleTogUHVibGljS2V5IHwgc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHR5cGVvZiBwdWJrZXkgPT09ICdzdHJpbmcnID8gcHVia2V5IDogcHVia2V5LmhleDtcbn1cblxuZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXg6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoaGV4Lm1hdGNoKC8uezEsMn0vZykhLm1hcChieXRlID0+IHBhcnNlSW50KGJ5dGUsIDE2KSkpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IElEIGJ5IGNoZWNraW5nIGlmIGl0IG1hdGNoZXMgdGhlIFNIQS0yNTYgaGFzaCBvZiB0aGUgY2Fub25pY2FsIGV2ZW50IHNlcmlhbGl6YXRpb24uXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50SWQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnRJZChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAwLFxuICAgICAgZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSksXG4gICAgICBldmVudC5jcmVhdGVkX2F0LFxuICAgICAgZXZlbnQua2luZCxcbiAgICAgIGV2ZW50LnRhZ3MsXG4gICAgICBldmVudC5jb250ZW50XG4gICAgXSk7XG4gICAgY29uc3QgaGFzaCA9IGJ5dGVzVG9IZXgoc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSkpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBoYXNoID09PSBldmVudC5pZCxcbiAgICAgIGVycm9yOiBoYXNoID09PSBldmVudC5pZCA/IHVuZGVmaW5lZCA6ICdJbnZhbGlkIGV2ZW50IElEJ1xuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCBJRCcpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IElEJ1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBzaWduYXR1cmUgdXNpbmcgU2Nobm9yciBzaWduYXR1cmUgdmVyaWZpY2F0aW9uLlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVFdmVudFNpZ25hdHVyZShldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudFNpZ25hdHVyZShldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFZlcmlmeSB0aGUgc2lnbmF0dXJlXG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcbiAgICBjb25zdCBoYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gICAgY29uc3QgcHVia2V5SGV4ID0gZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSk7XG4gICAgY29uc3QgcHVia2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKHB1YmtleUhleCk7XG4gICAgY29uc3QgaXNWYWxpZCA9IHNjaG5vcnIudmVyaWZ5KGhleFRvQnl0ZXMoZXZlbnQuc2lnKSwgaGFzaCwgcHVia2V5Qnl0ZXMpO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkLFxuICAgICAgZXJyb3I6IGlzVmFsaWQgPyB1bmRlZmluZWQgOiAnSW52YWxpZCBzaWduYXR1cmUnXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IHNpZ25hdHVyZSdcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgY29tcGxldGUgTm9zdHIgZXZlbnQgYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSwgdGltZXN0YW1wcywgSUQsIGFuZCBzaWduYXR1cmUuXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50KGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50KGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIEZpcnN0IHZhbGlkYXRlIHRoZSBldmVudCBzdHJ1Y3R1cmVcbiAgY29uc3QgYmFzZVZhbGlkYXRpb24gPSB2YWxpZGF0ZUV2ZW50QmFzZShldmVudCk7XG4gIGlmICghYmFzZVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgIHJldHVybiBiYXNlVmFsaWRhdGlvbjtcbiAgfVxuXG4gIC8vIFRoZW4gdmFsaWRhdGUgdGhlIGV2ZW50IElEXG4gIGNvbnN0IGlkVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRJZChldmVudCk7XG4gIGlmICghaWRWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICByZXR1cm4gaWRWYWxpZGF0aW9uO1xuICB9XG5cbiAgLy8gRmluYWxseSB2YWxpZGF0ZSB0aGUgc2lnbmF0dXJlXG4gIHJldHVybiB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50KTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBzaWduZWQgTm9zdHIgZXZlbnQgYnkgY2hlY2tpbmcgaXRzIHN0cnVjdHVyZSBhbmQgc2lnbmF0dXJlIGZvcm1hdC5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlU2lnbmVkRXZlbnQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2lnbmVkRXZlbnQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBDaGVjayBiYXNpYyBldmVudCBzdHJ1Y3R1cmVcbiAgICBjb25zdCBiYXNlVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRCYXNlKGV2ZW50KTtcbiAgICBpZiAoIWJhc2VWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgIHJldHVybiBiYXNlVmFsaWRhdGlvbjtcbiAgICB9XG5cbiAgICAvLyBHZXQgcHVia2V5IGhleFxuICAgIGNvbnN0IHB1YmtleUhleCA9IGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpO1xuXG4gICAgLy8gVmFsaWRhdGUgcHVia2V5IGZvcm1hdFxuICAgIGlmICghcHVia2V5SGV4IHx8IHR5cGVvZiBwdWJrZXlIZXggIT09ICdzdHJpbmcnIHx8IHB1YmtleUhleC5sZW5ndGggIT09IDY0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIHB1YmxpYyBrZXkgZm9ybWF0J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzaWduYXR1cmUgZm9ybWF0XG4gICAgaWYgKCFldmVudC5zaWcgfHwgdHlwZW9mIGV2ZW50LnNpZyAhPT0gJ3N0cmluZycgfHwgZXZlbnQuc2lnLmxlbmd0aCAhPT0gMTI4KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIHNpZ25hdHVyZSBmb3JtYXQnXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIElEIGZvcm1hdFxuICAgIGlmICghZXZlbnQuaWQgfHwgdHlwZW9mIGV2ZW50LmlkICE9PSAnc3RyaW5nJyB8fCBldmVudC5pZC5sZW5ndGggIT09IDY0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbnZhbGlkIGV2ZW50IElEIGZvcm1hdCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgc2lnbmVkIGV2ZW50Jyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgc2lnbmVkIGV2ZW50J1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBmaWVsZHMuXG4gKiBAcGFyYW0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIFZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudEJhc2UoZXZlbnQ6IE5vc3RyRXZlbnQgfCBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkc1xuICBpZiAoIWV2ZW50IHx8IHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIGV2ZW50IHN0cnVjdHVyZScgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGtpbmRcbiAgaWYgKHR5cGVvZiBldmVudC5raW5kICE9PSAnbnVtYmVyJyB8fCBldmVudC5raW5kIDwgMCkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IGtpbmQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgdGltZXN0YW1wXG4gIGNvbnN0IG5vdyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICBpZiAodHlwZW9mIGV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInIHx8IGV2ZW50LmNyZWF0ZWRfYXQgPiBub3cgKyA2MCkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IHRpbWVzdGFtcCBjYW5ub3QgYmUgaW4gdGhlIGZ1dHVyZScgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGNvbnRlbnRcbiAgaWYgKHR5cGVvZiBldmVudC5jb250ZW50ICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IGNvbnRlbnQgbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHB1YmtleSBmb3JtYXRcbiAgaWYgKCFldmVudC5wdWJrZXkpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIHB1YmxpYyBrZXknIH07XG4gIH1cblxuICAvLyBHZXQgcHVia2V5IGhleFxuICBjb25zdCBwdWJrZXlIZXggPSBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KTtcbiAgaWYgKHR5cGVvZiBwdWJrZXlIZXggIT09ICdzdHJpbmcnIHx8ICEvXlswLTlhLWZdezY0fSQvLnRlc3QocHVia2V5SGV4KSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgcHVibGljIGtleSBmb3JtYXQnIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0YWdzXG4gIGlmICghQXJyYXkuaXNBcnJheShldmVudC50YWdzKSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0V2ZW50IHRhZ3MgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgfVxuXG4gIGZvciAoY29uc3QgdGFnIG9mIGV2ZW50LnRhZ3MpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGFnKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRWFjaCB0YWcgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgICB9XG4gICAgaWYgKHRhZy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0VtcHR5IHRhZ3MgYXJlIG5vdCBhbGxvd2VkJyB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRhZ1swXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1RhZyBpZGVudGlmaWVyIG11c3QgYmUgYSBzdHJpbmcnIH07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGZpbHRlciBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBmaWVsZHMuXG4gKiBcbiAqIEBwYXJhbSB7Tm9zdHJGaWx0ZXJ9IGZpbHRlciAtIFRoZSBmaWx0ZXIgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUZpbHRlcihmaWx0ZXIpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsdGVyKGZpbHRlcjogTm9zdHJGaWx0ZXIpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBmaWx0ZXIgc3RydWN0dXJlXG4gICAgaWYgKCFmaWx0ZXIgfHwgdHlwZW9mIGZpbHRlciAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZmlsdGVyIHN0cnVjdHVyZScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBpZHMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIuaWRzICYmICghQXJyYXkuaXNBcnJheShmaWx0ZXIuaWRzKSB8fCAhZmlsdGVyLmlkcy5ldmVyeShpZCA9PiB0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSkpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBpZHMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGF1dGhvcnMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIuYXV0aG9ycyAmJiAoIUFycmF5LmlzQXJyYXkoZmlsdGVyLmF1dGhvcnMpIHx8ICFmaWx0ZXIuYXV0aG9ycy5ldmVyeShhdXRob3IgPT4gdHlwZW9mIGF1dGhvciA9PT0gJ3N0cmluZycpKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGF1dGhvcnMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtpbmRzIGFycmF5IGlmIHByZXNlbnRcbiAgICBpZiAoZmlsdGVyLmtpbmRzKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmlsdGVyLmtpbmRzKSkge1xuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIga2luZHMgbXVzdCBiZSBhbiBhcnJheSBvZiBudW1iZXJzJyB9O1xuICAgICAgfVxuICAgICAgaWYgKCFmaWx0ZXIua2luZHMuZXZlcnkoa2luZCA9PiB0eXBlb2Yga2luZCA9PT0gJ251bWJlcicgJiYgTnVtYmVyLmlzSW50ZWdlcihraW5kKSAmJiBraW5kID49IDApKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBraW5kcyBtdXN0IGJlIG5vbi1uZWdhdGl2ZSBpbnRlZ2VycycgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSB0aW1lc3RhbXBzXG4gICAgaWYgKGZpbHRlci5zaW5jZSAmJiB0eXBlb2YgZmlsdGVyLnNpbmNlICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIHNpbmNlIG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuICAgIGlmIChmaWx0ZXIudW50aWwgJiYgdHlwZW9mIGZpbHRlci51bnRpbCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciB1bnRpbCBtdXN0IGJlIGEgbnVtYmVyJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGxpbWl0XG4gICAgaWYgKGZpbHRlci5saW1pdCAmJiB0eXBlb2YgZmlsdGVyLmxpbWl0ICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGxpbWl0IG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgc2VhcmNoXG4gICAgaWYgKGZpbHRlci5zZWFyY2ggJiYgdHlwZW9mIGZpbHRlci5zZWFyY2ggIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgc2VhcmNoIG11c3QgYmUgYSBzdHJpbmcnIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZmlsdGVyJyk7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmFpbGVkIHRvIHZhbGlkYXRlIGZpbHRlcicgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIHN1YnNjcmlwdGlvbiBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBmaWx0ZXJzLlxuICogXG4gKiBAcGFyYW0ge05vc3RyU3Vic2NyaXB0aW9ufSBzdWJzY3JpcHRpb24gLSBUaGUgc3Vic2NyaXB0aW9uIHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uKTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb246IE5vc3RyU3Vic2NyaXB0aW9uKTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gVmFsaWRhdGUgc3Vic2NyaXB0aW9uIHN0cnVjdHVyZVxuICAgIGlmICghc3Vic2NyaXB0aW9uIHx8IHR5cGVvZiBzdWJzY3JpcHRpb24gIT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdJbnZhbGlkIHN1YnNjcmlwdGlvbiBzdHJ1Y3R1cmUnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgc3Vic2NyaXB0aW9uIElEXG4gICAgaWYgKCFzdWJzY3JpcHRpb24uaWQgfHwgdHlwZW9mIHN1YnNjcmlwdGlvbi5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1N1YnNjcmlwdGlvbiBtdXN0IGhhdmUgYSBzdHJpbmcgSUQnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZmlsdGVycyBhcnJheVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzdWJzY3JpcHRpb24uZmlsdGVycykpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ1N1YnNjcmlwdGlvbiBmaWx0ZXJzIG11c3QgYmUgYW4gYXJyYXknIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZWFjaCBmaWx0ZXJcbiAgICBmb3IgKGNvbnN0IGZpbHRlciBvZiBzdWJzY3JpcHRpb24uZmlsdGVycykge1xuICAgICAgY29uc3QgZmlsdGVyVmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsdGVyKGZpbHRlcik7XG4gICAgICBpZiAoIWZpbHRlclZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgICByZXR1cm4gZmlsdGVyVmFsaWRhdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzdWJzY3JpcHRpb24nKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgc3Vic2NyaXB0aW9uJyB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgcmVsYXkgcmVzcG9uc2UgbWVzc2FnZS5cbiAqIFxuICogQHBhcmFtIHt1bmtub3dufSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZVJlc3BvbnNlKFsnRVZFTlQnLCBldmVudE9ial0pO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUmVzcG9uc2UobWVzc2FnZTogdW5rbm93bik6IFZhbGlkYXRpb25SZXN1bHQge1xuICAvLyBDaGVjayBpZiBtZXNzYWdlIGlzIGFuIGFycmF5XG4gIGlmICghQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW52YWxpZCBtZXNzYWdlIGZvcm1hdDogbXVzdCBiZSBhbiBhcnJheSdcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgbWVzc2FnZSBoYXMgYXQgbGVhc3Qgb25lIGVsZW1lbnRcbiAgaWYgKG1lc3NhZ2UubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbnZhbGlkIG1lc3NhZ2UgZm9ybWF0OiBhcnJheSBpcyBlbXB0eSdcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgZmlyc3QgZWxlbWVudCBpcyBhIHZhbGlkIG1lc3NhZ2UgdHlwZVxuICBjb25zdCB0eXBlID0gbWVzc2FnZVswXTtcbiAgaWYgKCFPYmplY3QudmFsdWVzKE5vc3RyTWVzc2FnZVR5cGUpLmluY2x1ZGVzKHR5cGUgYXMgTm9zdHJNZXNzYWdlVHlwZSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogYEludmFsaWQgbWVzc2FnZSB0eXBlOiAke3R5cGV9YFxuICAgIH07XG4gIH1cblxuICAvLyBUeXBlLXNwZWNpZmljIHZhbGlkYXRpb25cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLkVWRU5UOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdFVkVOVCBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRhdGVTaWduZWRFdmVudChtZXNzYWdlWzFdIGFzIFNpZ25lZE5vc3RyRXZlbnQpO1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLk5PVElDRTpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMiB8fCB0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ05PVElDRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN0cmluZyBtZXNzYWdlJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLk9LOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSA0IHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJyB8fCBcbiAgICAgICAgICB0eXBlb2YgbWVzc2FnZVsyXSAhPT0gJ2Jvb2xlYW4nIHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzNdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnT0sgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSA0IGVsZW1lbnRzOiBbdHlwZSwgZXZlbnRJZCwgc3VjY2VzcywgbWVzc2FnZV0nXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuRU9TRTpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMiB8fCB0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0VPU0UgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzIHdpdGggYSBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuUkVROlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnUkVRIG1lc3NhZ2UgbXVzdCBoYXZlIGF0IGxlYXN0IDIgZWxlbWVudHMnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdSRVEgbWVzc2FnZSBtdXN0IGhhdmUgYSBzdHJpbmcgc3Vic2NyaXB0aW9uIElEJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gVmFsaWRhdGUgZWFjaCBmaWx0ZXIgaWYgcHJlc2VudFxuICAgICAgZm9yIChsZXQgaSA9IDI7IGkgPCBtZXNzYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlclJlc3VsdCA9IHZhbGlkYXRlRmlsdGVyKG1lc3NhZ2VbaV0gYXMgTm9zdHJGaWx0ZXIpO1xuICAgICAgICBpZiAoIWZpbHRlclJlc3VsdC5pc1ZhbGlkKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbHRlclJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSB9O1xuXG4gICAgY2FzZSBOb3N0ck1lc3NhZ2VUeXBlLkNMT1NFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnQ0xPU0UgbWVzc2FnZSBtdXN0IGhhdmUgZXhhY3RseSAyIGVsZW1lbnRzIHdpdGggYSBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuQVVUSDpcbiAgICAgIGlmIChtZXNzYWdlLmxlbmd0aCAhPT0gMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnQVVUSCBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRhdGVTaWduZWRFdmVudChtZXNzYWdlWzFdIGFzIFNpZ25lZE5vc3RyRXZlbnQpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogYFVuc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZTogJHt0eXBlfWBcbiAgICAgIH07XG4gIH1cbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgZXZlbnRcbiAqIEBkZXNjcmlwdGlvbiBFdmVudCBoYW5kbGluZyB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKi9cblxuZXhwb3J0IHsgY3JlYXRlRXZlbnQsIHNlcmlhbGl6ZUV2ZW50LCBnZXRFdmVudEhhc2ggfSBmcm9tICcuL2NyZWF0aW9uJztcbmV4cG9ydCB7IHZhbGlkYXRlRXZlbnQsIGNhbGN1bGF0ZUV2ZW50SWQgfSBmcm9tICcuL3NpZ25pbmcnO1xuIiwgIi8qKlxuICogQG1vZHVsZSBldmVudC9jcmVhdGlvblxuICogQGRlc2NyaXB0aW9uIEV2ZW50IGNyZWF0aW9uIGFuZCBzZXJpYWxpemF0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqL1xuXG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgTm9zdHJFdmVudEtpbmQgfSBmcm9tICcuLi90eXBlcy9pbmRleCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBOb3N0ciBldmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgcGFyYW1ldGVyc1xuICogQHBhcmFtIHBhcmFtcyAtIEV2ZW50IHBhcmFtZXRlcnNcbiAqIEByZXR1cm5zIENyZWF0ZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50KHBhcmFtczoge1xuICBraW5kOiBOb3N0ckV2ZW50S2luZDtcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW11bXTtcbiAgY3JlYXRlZF9hdD86IG51bWJlcjtcbiAgcHVia2V5Pzogc3RyaW5nO1xufSk6IE5vc3RyRXZlbnQge1xuICBjb25zdCB7IFxuICAgIGtpbmQsIFxuICAgIGNvbnRlbnQsIFxuICAgIHRhZ3MgPSBbXSwgXG4gICAgY3JlYXRlZF9hdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLCBcbiAgICBwdWJrZXkgPSAnJyBcbiAgfSA9IHBhcmFtcztcbiAgXG4gIHJldHVybiB7XG4gICAga2luZCxcbiAgICBjb250ZW50LFxuICAgIHRhZ3MsXG4gICAgY3JlYXRlZF9hdCxcbiAgICBwdWJrZXksXG4gIH07XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIE5vc3RyIGV2ZW50IGZvciBzaWduaW5nL2hhc2hpbmcgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNlcmlhbGl6ZVxuICogQHJldHVybnMgU2VyaWFsaXplZCBldmVudCBKU09OIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoW1xuICAgIDAsXG4gICAgZXZlbnQucHVia2V5LFxuICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgZXZlbnQua2luZCxcbiAgICBldmVudC50YWdzLFxuICAgIGV2ZW50LmNvbnRlbnRcbiAgXSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaGFzaCBvZiBhIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBoYXNoXG4gKiBAcmV0dXJucyBFdmVudCBoYXNoIGluIGhleCBmb3JtYXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEV2ZW50SGFzaChldmVudDogTm9zdHJFdmVudCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgICBjb25zdCBoYXNoID0gYXdhaXQgc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gICAgcmV0dXJuIGJ5dGVzVG9IZXgoaGFzaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZXQgZXZlbnQgaGFzaCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGV2ZW50L3NpZ25pbmdcbiAqIEBkZXNjcmlwdGlvbiBFdmVudCBzaWduaW5nIGFuZCB2ZXJpZmljYXRpb24gdXRpbGl0aWVzIGZvciBOb3N0clxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHsgZ2V0RXZlbnRIYXNoIH0gZnJvbSAnLi9jcmVhdGlvbic7XG5pbXBvcnQgdHlwZSB7IE5vc3RyRXZlbnQsIFNpZ25lZE5vc3RyRXZlbnQgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8qKlxuICogU2lnbnMgYSBOb3N0ciBldmVudCB3aXRoIGEgcHJpdmF0ZSBrZXkgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNpZ25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgU2lnbmVkIGV2ZW50XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduRXZlbnQoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LCBcbiAgcHJpdmF0ZUtleTogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBoYXNoID0gYXdhaXQgZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbiAgICBjb25zdCBzaWcgPSBzY2hub3JyLnNpZ24oaGV4VG9CeXRlcyhoYXNoKSwgaGV4VG9CeXRlcyhwcml2YXRlS2V5KSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmV2ZW50LFxuICAgICAgaWQ6IGhhc2gsXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnKSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gc2lnbiBldmVudCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhlIHNpZ25hdHVyZSBvZiBhIHNpZ25lZCBOb3N0ciBldmVudCAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHNpZ25hdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHNjaG5vcnIudmVyaWZ5KFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5zaWcpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5pZCksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnB1YmtleSlcbiAgICApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmVyaWZ5IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVHJ1ZSBpZiBldmVudCBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIC8vIENoZWNrIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghZXZlbnQuaWQgfHwgIWV2ZW50LnB1YmtleSB8fCAhZXZlbnQuc2lnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHNpZ25hdHVyZVxuICAgIHJldHVybiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdFcnJvciB2YWxpZGF0aW5nIGV2ZW50Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXZlbnQgSUQgZm9yIGEgTm9zdHIgZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGNhbGN1bGF0ZSBJRCBmb3JcbiAqIEByZXR1cm5zIEV2ZW50IElEXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVFdmVudElkKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGdldEV2ZW50SGFzaChldmVudCk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTA0XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTA0IChFbmNyeXB0ZWQgRGlyZWN0IE1lc3NhZ2VzKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZFxuICovXG5cbmltcG9ydCB7IHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBieXRlc1RvQmFzZTY0LCBiYXNlNjRUb0J5dGVzIH0gZnJvbSAnLi4vZW5jb2RpbmcvYmFzZTY0JztcbmltcG9ydCB0eXBlIHsgQ3J5cHRvU3VidGxlIH0gZnJvbSAnLi4vY3J5cHRvJztcblxuXG4vLyBDb25maWd1cmUgY3J5cHRvIGZvciBOb2RlLmpzIGFuZCB0ZXN0IGVudmlyb25tZW50c1xuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxuICBpbnRlcmZhY2UgR2xvYmFsIHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxufVxuXG5jb25zdCBnZXRDcnlwdG8gPSBhc3luYyAoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+ID0+IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jcnlwdG8pIHtcbiAgICByZXR1cm4gd2luZG93LmNyeXB0bztcbiAgfVxuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgKGdsb2JhbCBhcyBHbG9iYWwpLmNyeXB0bykge1xuICAgIHJldHVybiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgY3J5cHRvTW9kdWxlID0gYXdhaXQgaW1wb3J0KCdjcnlwdG8nKTtcbiAgICBpZiAoY3J5cHRvTW9kdWxlLndlYmNyeXB0bykge1xuICAgICAgcmV0dXJuIGNyeXB0b01vZHVsZS53ZWJjcnlwdG8gYXMgQ3J5cHRvU3VidGxlO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdOb2RlIGNyeXB0byBub3QgYXZhaWxhYmxlJyk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ05vIFdlYkNyeXB0byBpbXBsZW1lbnRhdGlvbiBhdmFpbGFibGUnKTtcbn07XG5cbmNsYXNzIENyeXB0b0ltcGxlbWVudGF0aW9uIHtcbiAgcHJpdmF0ZSBjcnlwdG9JbnN0YW5jZTogQ3J5cHRvU3VidGxlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaW5pdFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0UHJvbWlzZSA9IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY3J5cHRvSW5zdGFuY2UgPSBhd2FpdCBnZXRDcnlwdG8oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlSW5pdGlhbGl6ZWQoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuICAgIGlmICghdGhpcy5jcnlwdG9JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDcnlwdG8gaW1wbGVtZW50YXRpb24gbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyeXB0b0luc3RhbmNlO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3VidGxlKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlWydzdWJ0bGUnXT4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZTtcbiAgfVxuXG4gIGFzeW5jIGdldFJhbmRvbVZhbHVlczxUIGV4dGVuZHMgVWludDhBcnJheSB8IEludDhBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheT4oYXJyYXk6IFQpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xuICB9XG59XG5cbmNvbnN0IGNyeXB0b0ltcGwgPSBuZXcgQ3J5cHRvSW1wbGVtZW50YXRpb24oKTtcblxuaW50ZXJmYWNlIFNoYXJlZFNlY3JldCB7XG4gIHNoYXJlZFNlY3JldDogVWludDhBcnJheTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0IGVuY3J5cHRpb25cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gc2VuZGVyUHJpdktleSAtIFNlbmRlcidzIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gcmVjaXBpZW50UHViS2V5IC0gUmVjaXBpZW50J3MgcHVibGljIGtleVxuICogQHJldHVybnMgRW5jcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0TWVzc2FnZShcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBzZW5kZXJQcml2S2V5OiBzdHJpbmcsXG4gIHJlY2lwaWVudFB1YktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGlmICghbWVzc2FnZSB8fCAhc2VuZGVyUHJpdktleSB8fCAhcmVjaXBpZW50UHViS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgcGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtleXNcbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3Qoc2VuZGVyUHJpdktleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcHVibGljIGtleSBpcyBpbiBjb3JyZWN0IGZvcm1hdFxuICAgIGNvbnN0IHB1YktleUhleCA9IHJlY2lwaWVudFB1YktleS5zdGFydHNXaXRoKCcwMicpIHx8IHJlY2lwaWVudFB1YktleS5zdGFydHNXaXRoKCcwMycpIFxuICAgICAgPyByZWNpcGllbnRQdWJLZXkgXG4gICAgICA6ICcwMicgKyByZWNpcGllbnRQdWJLZXk7XG5cbiAgICAvLyBHZW5lcmF0ZSBzaGFyZWQgc2VjcmV0XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMoc2VuZGVyUHJpdktleSksIGhleFRvQnl0ZXMocHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTsgLy8gVXNlIG9ubHkgeC1jb29yZGluYXRlXG5cbiAgICAvLyBJbXBvcnQga2V5IGZvciBBRVNcbiAgICBjb25zdCBzaGFyZWRLZXkgPSBhd2FpdCAoYXdhaXQgY3J5cHRvSW1wbC5nZXRTdWJ0bGUoKSkuaW1wb3J0S2V5KFxuICAgICAgJ3JhdycsXG4gICAgICBzaGFyZWRYLmJ1ZmZlcixcbiAgICAgIHsgbmFtZTogJ0FFUy1DQkMnLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgZmFsc2UsXG4gICAgICBbJ2VuY3J5cHQnXVxuICAgICk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgLy8gR2VuZXJhdGUgSVYgYW5kIGVuY3J5cHRcbiAgICBjb25zdCBpdiA9IG5ldyBVaW50OEFycmF5KDE2KTtcbiAgICBhd2FpdCBjcnlwdG9JbXBsLmdldFJhbmRvbVZhbHVlcyhpdik7XG5cbiAgICBjb25zdCBlbmNvZGVkID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpO1xuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5lbmNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBzaGFyZWRLZXksXG4gICAgICBlbmNvZGVkLmJ1ZmZlclxuICAgICk7XG5cbiAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICBjb25zdCBjaXBoZXJ0ZXh0QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChuZXcgVWludDhBcnJheShlbmNyeXB0ZWQpKTtcbiAgICBjb25zdCBpdkJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQoaXYpO1xuXG4gICAgcmV0dXJuIGNpcGhlcnRleHRCYXNlNjQgKyAnP2l2PScgKyBpdkJhc2U2NDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGVuY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogRGVjcnlwdHMgYSBtZXNzYWdlIHVzaW5nIE5JUC0wNCBkZWNyeXB0aW9uXG4gKiBAcGFyYW0gZW5jcnlwdGVkTWVzc2FnZSAtIEVuY3J5cHRlZCBtZXNzYWdlIHN0cmluZ1xuICogQHBhcmFtIHJlY2lwaWVudFByaXZLZXkgLSBSZWNpcGllbnQncyBwcml2YXRlIGtleVxuICogQHBhcmFtIHNlbmRlclB1YktleSAtIFNlbmRlcidzIHB1YmxpYyBrZXlcbiAqIEByZXR1cm5zIERlY3J5cHRlZCBtZXNzYWdlIHN0cmluZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdE1lc3NhZ2UoXG4gIGVuY3J5cHRlZE1lc3NhZ2U6IHN0cmluZyxcbiAgcmVjaXBpZW50UHJpdktleTogc3RyaW5nLFxuICBzZW5kZXJQdWJLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBpZiAoIWVuY3J5cHRlZE1lc3NhZ2UgfHwgIXJlY2lwaWVudFByaXZLZXkgfHwgIXNlbmRlclB1YktleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBrZXlzXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHJlY2lwaWVudFByaXZLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHB1YmxpYyBrZXkgaXMgaW4gY29ycmVjdCBmb3JtYXRcbiAgICBjb25zdCBwdWJLZXlIZXggPSBzZW5kZXJQdWJLZXkuc3RhcnRzV2l0aCgnMDInKSB8fCBzZW5kZXJQdWJLZXkuc3RhcnRzV2l0aCgnMDMnKVxuICAgICAgPyBzZW5kZXJQdWJLZXlcbiAgICAgIDogJzAyJyArIHNlbmRlclB1YktleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhyZWNpcGllbnRQcml2S2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpOyAvLyBVc2Ugb25seSB4LWNvb3JkaW5hdGVcblxuICAgIC8vIEltcG9ydCBrZXkgZm9yIEFFU1xuICAgIGNvbnN0IHNoYXJlZEtleSA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZGVjcnlwdCddXG4gICAgKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICAvLyBQYXJzZSBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICAvLyBBbHNvIHN1cHBvcnQgbGVnYWN5IGhleCBmb3JtYXQgKGl2ICsgY2lwaGVydGV4dCBjb25jYXRlbmF0ZWQpIGFzIGZhbGxiYWNrXG4gICAgbGV0IGl2OiBVaW50OEFycmF5O1xuICAgIGxldCBjaXBoZXJ0ZXh0OiBVaW50OEFycmF5O1xuXG4gICAgaWYgKGVuY3J5cHRlZE1lc3NhZ2UuaW5jbHVkZXMoJz9pdj0nKSkge1xuICAgICAgLy8gTklQLTA0IHN0YW5kYXJkIGZvcm1hdFxuICAgICAgY29uc3QgW2NpcGhlcnRleHRCYXNlNjQsIGl2QmFzZTY0XSA9IGVuY3J5cHRlZE1lc3NhZ2Uuc3BsaXQoJz9pdj0nKTtcbiAgICAgIGNpcGhlcnRleHQgPSBiYXNlNjRUb0J5dGVzKGNpcGhlcnRleHRCYXNlNjQpO1xuICAgICAgaXYgPSBiYXNlNjRUb0J5dGVzKGl2QmFzZTY0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGVnYWN5IGhleCBmb3JtYXQgZmFsbGJhY2s6IGZpcnN0IDE2IGJ5dGVzIGFyZSBJViwgcmVzdCBpcyBjaXBoZXJ0ZXh0XG4gICAgICBjb25zdCBlbmNyeXB0ZWQgPSBoZXhUb0J5dGVzKGVuY3J5cHRlZE1lc3NhZ2UpO1xuICAgICAgaXYgPSBlbmNyeXB0ZWQuc2xpY2UoMCwgMTYpO1xuICAgICAgY2lwaGVydGV4dCA9IGVuY3J5cHRlZC5zbGljZSgxNik7XG4gICAgfVxuXG4gICAgLy8gRGVjcnlwdFxuICAgIGNvbnN0IGRlY3J5cHRlZCA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5kZWNyeXB0KFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGl2IH0sXG4gICAgICBzaGFyZWRLZXksXG4gICAgICBjaXBoZXJ0ZXh0LmJ1ZmZlciBhcyBBcnJheUJ1ZmZlclxuICAgICk7XG5cbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGRlY3J5cHRlZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBkZWNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHNoYXJlZCBzZWNyZXQgZm9yIE5JUC0wNCBlbmNyeXB0aW9uXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5XG4gKiBAcGFyYW0gcHVibGljS2V5IC0gUHVibGljIGtleVxuICogQHJldHVybnMgU2hhcmVkIHNlY3JldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTaGFyZWRTZWNyZXQoXG4gIHByaXZhdGVLZXk6IHN0cmluZyxcbiAgcHVibGljS2V5OiBzdHJpbmdcbik6IFNoYXJlZFNlY3JldCB7XG4gIHRyeSB7XG4gICAgaWYgKCFwcml2YXRlS2V5IHx8ICFwdWJsaWNLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2V5c1xuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChwcml2YXRlS2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBwdWJsaWMga2V5IGlzIGluIGNvcnJlY3QgZm9ybWF0XG4gICAgY29uc3QgcHViS2V5SGV4ID0gcHVibGljS2V5LnN0YXJ0c1dpdGgoJzAyJykgfHwgcHVibGljS2V5LnN0YXJ0c1dpdGgoJzAzJylcbiAgICAgID8gcHVibGljS2V5XG4gICAgICA6ICcwMicgKyBwdWJsaWNLZXk7XG5cbiAgICAvLyBHZW5lcmF0ZSBzaGFyZWQgc2VjcmV0XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMocHJpdmF0ZUtleSksIGhleFRvQnl0ZXMocHViS2V5SGV4KSk7XG4gICAgcmV0dXJuIHsgc2hhcmVkU2VjcmV0OiBzaGFyZWRQb2ludC5zbGljZSgxLCAzMykgfTsgLy8gUmV0dXJuIG9ubHkgeC1jb29yZGluYXRlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZW5lcmF0ZSBzaGFyZWQgc2VjcmV0Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuZXhwb3J0IHsgZ2VuZXJhdGVTaGFyZWRTZWNyZXQgYXMgY29tcHV0ZVNoYXJlZFNlY3JldCB9O1xuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC0wMVxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC0wMTogQmFzaWMgUHJvdG9jb2wgRmxvdyBEZXNjcmlwdGlvblxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZFxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IE5vc3RyIGV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwYXJhbWV0ZXJzIChOSVAtMDEpXG4gKiBAcGFyYW0gcGFyYW1zIC0gRXZlbnQgcGFyYW1ldGVyc1xuICogQHJldHVybnMgQ3JlYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQocGFyYW1zOiB7XG4gIGtpbmQ6IG51bWJlcjtcbiAgY29udGVudDogc3RyaW5nO1xuICB0YWdzPzogc3RyaW5nW11bXTtcbiAgY3JlYXRlZF9hdD86IG51bWJlcjtcbiAgcHVia2V5Pzogc3RyaW5nO1xufSk6IE5vc3RyRXZlbnQge1xuICBjb25zdCB7IFxuICAgIGtpbmQsIFxuICAgIGNvbnRlbnQsIFxuICAgIHRhZ3MgPSBbXSwgXG4gICAgY3JlYXRlZF9hdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLCBcbiAgICBwdWJrZXkgPSAnJyBcbiAgfSA9IHBhcmFtcztcbiAgXG4gIHJldHVybiB7XG4gICAga2luZCxcbiAgICBjb250ZW50LFxuICAgIHRhZ3MsXG4gICAgY3JlYXRlZF9hdCxcbiAgICBwdWJrZXksXG4gIH07XG59XG5cbi8qKlxuICogU2VyaWFsaXplcyBhIE5vc3RyIGV2ZW50IGZvciBzaWduaW5nL2hhc2hpbmcgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNlcmlhbGl6ZVxuICogQHJldHVybnMgU2VyaWFsaXplZCBldmVudCBKU09OIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoW1xuICAgIDAsXG4gICAgZXZlbnQucHVia2V5LFxuICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgZXZlbnQua2luZCxcbiAgICBldmVudC50YWdzLFxuICAgIGV2ZW50LmNvbnRlbnRcbiAgXSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaGFzaCBvZiBhIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBoYXNoXG4gKiBAcmV0dXJucyBFdmVudCBoYXNoIGluIGhleCBmb3JtYXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEV2ZW50SGFzaChldmVudDogTm9zdHJFdmVudCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgICBjb25zdCBoYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gICAgcmV0dXJuIGJ5dGVzVG9IZXgoaGFzaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBnZXQgZXZlbnQgaGFzaCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogU2lnbnMgYSBOb3N0ciBldmVudCB3aXRoIGEgcHJpdmF0ZSBrZXkgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNpZ25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgU2lnbmVkIGV2ZW50XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduRXZlbnQoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LCBcbiAgcHJpdmF0ZUtleTogc3RyaW5nXG4pOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBoYXNoID0gYXdhaXQgZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbiAgICBjb25zdCBzaWcgPSBzY2hub3JyLnNpZ24oaGV4VG9CeXRlcyhoYXNoKSwgaGV4VG9CeXRlcyhwcml2YXRlS2V5KSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmV2ZW50LFxuICAgICAgaWQ6IGhhc2gsXG4gICAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnKSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gc2lnbiBldmVudCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhlIHNpZ25hdHVyZSBvZiBhIHNpZ25lZCBOb3N0ciBldmVudCAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHNpZ25hdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgLy8gVmVyaWZ5IGV2ZW50IElEXG4gICAgY29uc3QgZXhwZWN0ZWRJZCA9IGNhbGN1bGF0ZUV2ZW50SWQoZXZlbnQpO1xuICAgIGlmIChldmVudC5pZCAhPT0gZXhwZWN0ZWRJZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSBzaWduYXR1cmVcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnNpZyksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LmlkKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXZlbnQgSUQgYWNjb3JkaW5nIHRvIE5JUC0wMVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gY2FsY3VsYXRlIElEIGZvclxuICogQHJldHVybnMgRXZlbnQgSUQgaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlRXZlbnRJZChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIGNvbnN0IHNlcmlhbGl6ZWQgPSBzZXJpYWxpemVFdmVudChldmVudCk7XG4gIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgcmV0dXJuIGJ5dGVzVG9IZXgoaGFzaCk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgc3RydWN0dXJlIChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVHJ1ZSBpZiBldmVudCBzdHJ1Y3R1cmUgaXMgdmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBldmVudC5jcmVhdGVkX2F0ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZXZlbnQua2luZCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZXZlbnQudGFncykpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV2ZW50LnB1YmtleSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICAvLyBWYWxpZGF0ZSB0YWdzIHN0cnVjdHVyZVxuICAgIGZvciAoY29uc3QgdGFnIG9mIGV2ZW50LnRhZ3MpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh0YWcpKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHR5cGVvZiB0YWdbMF0gIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiIsICIvKipcbiAqIE5JUC0xOTogYmVjaDMyLWVuY29kZWQgZW50aXRpZXNcbiAqIEltcGxlbWVudHMgZW5jb2RpbmcgYW5kIGRlY29kaW5nIG9mIE5vc3RyIGVudGl0aWVzIHVzaW5nIGJlY2gzMiBmb3JtYXRcbiAqL1xuXG5pbXBvcnQgeyBiZWNoMzIgfSBmcm9tICdiZWNoMzInO1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyJztcblxuZXhwb3J0IHR5cGUgTmlwMTlEYXRhVHlwZSA9ICducHViJyB8ICduc2VjJyB8ICdub3RlJyB8ICducHJvZmlsZScgfCAnbmV2ZW50JyB8ICduYWRkcicgfCAnbnJlbGF5JztcblxuY29uc3QgVkFMSURfUFJFRklYRVM6IE5pcDE5RGF0YVR5cGVbXSA9IFsnbnB1YicsICduc2VjJywgJ25vdGUnLCAnbnByb2ZpbGUnLCAnbmV2ZW50JywgJ25hZGRyJywgJ25yZWxheSddO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5pcDE5RGF0YSB7XG4gIHR5cGU6IE5pcDE5RGF0YVR5cGU7XG4gIGRhdGE6IHN0cmluZztcbiAgcmVsYXlzPzogc3RyaW5nW107XG4gIGF1dGhvcj86IHN0cmluZztcbiAga2luZD86IG51bWJlcjtcbiAgaWRlbnRpZmllcj86IHN0cmluZzsgLy8gRm9yIG5hZGRyXG59XG5cbi8vIFRMViB0eXBlIGNvbnN0YW50c1xuY29uc3QgVExWX1RZUEVTID0ge1xuICBTUEVDSUFMOiAwLCAgIC8vIE1haW4gZGF0YSAoaGV4KVxuICBSRUxBWTogMSwgICAgIC8vIFJlbGF5IFVSTCAodXRmOClcbiAgQVVUSE9SOiAyLCAgICAvLyBBdXRob3IgcHVia2V5IChoZXgpXG4gIEtJTkQ6IDMsICAgICAgLy8gRXZlbnQga2luZCAodWludDgpXG4gIElERU5USUZJRVI6IDQgLy8gSWRlbnRpZmllciAodXRmOClcbn0gYXMgY29uc3Q7XG5cbi8qKlxuICogRW5jb2RlIGEgcHVibGljIGtleSBhcyBhbiBucHViXG4gKiBAcGFyYW0gcHVia2V5IFB1YmxpYyBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnB1YiBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwdWJrZXkgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnB1YkVuY29kZShwdWJrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHB1YmtleSwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20ocHVia2V5LCAnaGV4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducHViJywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBhIHByaXZhdGUga2V5IGFzIGFuIG5zZWNcbiAqIEBwYXJhbSBwcml2a2V5IFByaXZhdGUga2V5IGluIGhleCBmb3JtYXRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5zZWMgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcHJpdmtleSBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuc2VjRW5jb2RlKHByaXZrZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHByaXZrZXksIDY0KTtcbiAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKHByaXZrZXksICdoZXgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25zZWMnLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGFuIGV2ZW50IElEIGFzIGEgbm90ZVxuICogQHBhcmFtIGV2ZW50SWQgRXZlbnQgSUQgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbm90ZSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBldmVudElkIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdGVFbmNvZGUoZXZlbnRJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcoZXZlbnRJZCwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20oZXZlbnRJZCwgJ2hleCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbm90ZScsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgcHJvZmlsZSBpbmZvcm1hdGlvblxuICogQHBhcmFtIHB1YmtleSBQdWJsaWMga2V5IGluIGhleCBmb3JtYXRcbiAqIEBwYXJhbSByZWxheXMgT3B0aW9uYWwgcmVsYXkgVVJMc1xuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnByb2ZpbGUgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcHVia2V5IGlzIGludmFsaWQgb3IgcmVsYXlzIGFyZSBtYWxmb3JtZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5wcm9maWxlRW5jb2RlKHB1YmtleTogc3RyaW5nLCByZWxheXM/OiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHB1YmtleSwgNjQpO1xuICBpZiAocmVsYXlzKSB7XG4gICAgcmVsYXlzLmZvckVhY2godmFsaWRhdGVSZWxheVVybCk7XG4gIH1cblxuICBjb25zdCBkYXRhID0gZW5jb2RlVExWKHtcbiAgICB0eXBlOiAnbnByb2ZpbGUnLFxuICAgIGRhdGE6IHB1YmtleSxcbiAgICByZWxheXNcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducHJvZmlsZScsIGRhdGEsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBldmVudCBpbmZvcm1hdGlvblxuICogQHBhcmFtIGV2ZW50SWQgRXZlbnQgSUQgaW4gaGV4IGZvcm1hdFxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcGFyYW0gYXV0aG9yIE9wdGlvbmFsIGF1dGhvciBwdWJsaWMga2V5XG4gKiBAcGFyYW0ga2luZCBPcHRpb25hbCBldmVudCBraW5kXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuZXZlbnQgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcGFyYW1ldGVycyBhcmUgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV2ZW50RW5jb2RlKFxuICBldmVudElkOiBzdHJpbmcsXG4gIHJlbGF5cz86IHN0cmluZ1tdLFxuICBhdXRob3I/OiBzdHJpbmcsXG4gIGtpbmQ/OiBudW1iZXJcbik6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKGV2ZW50SWQsIDY0KTtcbiAgaWYgKHJlbGF5cykge1xuICAgIHJlbGF5cy5mb3JFYWNoKHZhbGlkYXRlUmVsYXlVcmwpO1xuICB9XG4gIGlmIChhdXRob3IpIHtcbiAgICB2YWxpZGF0ZUhleFN0cmluZyhhdXRob3IsIDY0KTtcbiAgfVxuICBpZiAoa2luZCAhPT0gdW5kZWZpbmVkICYmICFOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGV2ZW50IGtpbmQnKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICduZXZlbnQnLFxuICAgIGRhdGE6IGV2ZW50SWQsXG4gICAgcmVsYXlzLFxuICAgIGF1dGhvcixcbiAgICBraW5kXG4gIH0pO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbmV2ZW50JywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGFuIGFkZHJlc3MgKE5JUC0zMylcbiAqIEBwYXJhbSBwdWJrZXkgQXV0aG9yJ3MgcHVibGljIGtleVxuICogQHBhcmFtIGtpbmQgRXZlbnQga2luZFxuICogQHBhcmFtIGlkZW50aWZpZXIgU3RyaW5nIGlkZW50aWZpZXJcbiAqIEBwYXJhbSByZWxheXMgT3B0aW9uYWwgcmVsYXkgVVJMc1xuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbmFkZHIgc3RyaW5nXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgcGFyYW1ldGVycyBhcmUgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmFkZHJFbmNvZGUoXG4gIHB1YmtleTogc3RyaW5nLFxuICBraW5kOiBudW1iZXIsXG4gIGlkZW50aWZpZXI6IHN0cmluZyxcbiAgcmVsYXlzPzogc3RyaW5nW11cbik6IHN0cmluZyB7XG4gIHZhbGlkYXRlSGV4U3RyaW5nKHB1YmtleSwgNjQpO1xuICBpZiAoIU51bWJlci5pc0ludGVnZXIoa2luZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZXZlbnQga2luZCcpO1xuICB9XG4gIGlmICghaWRlbnRpZmllcikge1xuICAgIHRocm93IG5ldyBFcnJvcignSWRlbnRpZmllciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGlmIChyZWxheXMpIHtcbiAgICByZWxheXMuZm9yRWFjaCh2YWxpZGF0ZVJlbGF5VXJsKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICduYWRkcicsXG4gICAgZGF0YTogcHVia2V5LFxuICAgIGtpbmQsXG4gICAgaWRlbnRpZmllcixcbiAgICByZWxheXNcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCduYWRkcicsIGRhdGEsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBhIHJlbGF5IFVSTFxuICogQHBhcmFtIHVybCBSZWxheSBVUkxcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5yZWxheSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBVUkwgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnJlbGF5RW5jb2RlKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVSZWxheVVybCh1cmwpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20odXJsLCAndXRmOCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnJlbGF5Jywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIERlY29kZSBhIGJlY2gzMi1lbmNvZGVkIE5vc3RyIGVudGl0eVxuICogQHBhcmFtIHN0ciBiZWNoMzItZW5jb2RlZCBzdHJpbmdcbiAqIEByZXR1cm5zIERlY29kZWQgZGF0YSB3aXRoIHR5cGUgYW5kIG1ldGFkYXRhXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgc3RyaW5nIGlzIGludmFsaWQgb3IgbWFsZm9ybWVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUoc3RyOiBzdHJpbmcpOiBOaXAxOURhdGEge1xuICBpZiAoIXN0ci5pbmNsdWRlcygnMScpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJlY2gzMiBzdHJpbmcnKTtcbiAgfVxuXG4gIGNvbnN0IHByZWZpeCA9IHN0ci5zcGxpdCgnMScpWzBdLnRvTG93ZXJDYXNlKCk7XG4gIGlmICghVkFMSURfUFJFRklYRVMuaW5jbHVkZXMocHJlZml4IGFzIE5pcDE5RGF0YVR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByZWZpeCcpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBkZWNvZGVkID0gYmVjaDMyLmRlY29kZShzdHIsIDEwMDApO1xuICAgIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShiZWNoMzIuZnJvbVdvcmRzKGRlY29kZWQud29yZHMpKTtcblxuICAgIC8vIEZvciBucmVsYXkgdHlwZVxuICAgIGxldCB1cmw6IHN0cmluZztcbiAgICAvLyBGb3IgVExWIHR5cGVzXG4gICAgbGV0IGRlY29kZWREYXRhOiBOaXAxOURhdGE7XG5cbiAgICBzd2l0Y2ggKGRlY29kZWQucHJlZml4KSB7XG4gICAgICBjYXNlICducHViJzpcbiAgICAgIGNhc2UgJ25zZWMnOlxuICAgICAgY2FzZSAnbm90ZSc6XG4gICAgICAgIHZhbGlkYXRlSGV4U3RyaW5nKGRhdGEudG9TdHJpbmcoJ2hleCcpLCA2NCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogZGVjb2RlZC5wcmVmaXggYXMgTmlwMTlEYXRhVHlwZSxcbiAgICAgICAgICBkYXRhOiBkYXRhLnRvU3RyaW5nKCdoZXgnKVxuICAgICAgICB9O1xuICAgICAgY2FzZSAnbnJlbGF5JzpcbiAgICAgICAgdXJsID0gZGF0YS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICB2YWxpZGF0ZVJlbGF5VXJsKHVybCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ25yZWxheScsXG4gICAgICAgICAgZGF0YTogdXJsXG4gICAgICAgIH07XG4gICAgICBjYXNlICducHJvZmlsZSc6XG4gICAgICBjYXNlICduZXZlbnQnOlxuICAgICAgY2FzZSAnbmFkZHInOlxuICAgICAgICBkZWNvZGVkRGF0YSA9IGRlY29kZVRMVihkZWNvZGVkLnByZWZpeCBhcyBOaXAxOURhdGFUeXBlLCBkYXRhKTtcbiAgICAgICAgcmV0dXJuIGRlY29kZWREYXRhO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHByZWZpeCcpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiZWNoMzIgc3RyaW5nJyk7XG4gIH1cbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUhleFN0cmluZyhzdHI6IHN0cmluZywgbGVuZ3RoPzogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghL15bMC05YS1mQS1GXSskLy50ZXN0KHN0cikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpO1xuICB9XG4gIGlmIChsZW5ndGggJiYgc3RyLmxlbmd0aCAhPT0gbGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGhleCBzdHJpbmcgbGVuZ3RoIChleHBlY3RlZCAke2xlbmd0aH0pYCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVSZWxheVVybCh1cmw6IHN0cmluZyk6IHZvaWQge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcbiAgICBpZiAoIVsnd3M6JywgJ3dzczonXS5pbmNsdWRlcyhwYXJzZWQucHJvdG9jb2wpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVsYXkgVVJMIHByb3RvY29sJyk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVsYXkgVVJMJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlVExWKGRhdGE6IE5pcDE5RGF0YSk6IG51bWJlcltdIHtcbiAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xuICBcbiAgLy8gU3BlY2lhbCAodHlwZSAwKTogbWFpbiBkYXRhXG4gIGNvbnN0IGJ5dGVzID0gQnVmZmVyLmZyb20oZGF0YS5kYXRhLCAnaGV4Jyk7XG4gIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5TUEVDSUFMLCBieXRlcy5sZW5ndGgpO1xuICByZXN1bHQucHVzaCguLi5ieXRlcyk7XG5cbiAgLy8gUmVsYXkgKHR5cGUgMSk6IHJlbGF5IFVSTHNcbiAgaWYgKGRhdGEucmVsYXlzPy5sZW5ndGgpIHtcbiAgICBmb3IgKGNvbnN0IHJlbGF5IG9mIGRhdGEucmVsYXlzKSB7XG4gICAgICBjb25zdCByZWxheUJ5dGVzID0gQnVmZmVyLmZyb20ocmVsYXksICd1dGY4Jyk7XG4gICAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuUkVMQVksIHJlbGF5Qnl0ZXMubGVuZ3RoKTtcbiAgICAgIHJlc3VsdC5wdXNoKC4uLnJlbGF5Qnl0ZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEF1dGhvciAodHlwZSAyKTogYXV0aG9yIHB1YmtleVxuICBpZiAoZGF0YS5hdXRob3IpIHtcbiAgICBjb25zdCBhdXRob3JCeXRlcyA9IEJ1ZmZlci5mcm9tKGRhdGEuYXV0aG9yLCAnaGV4Jyk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLkFVVEhPUiwgYXV0aG9yQnl0ZXMubGVuZ3RoKTtcbiAgICByZXN1bHQucHVzaCguLi5hdXRob3JCeXRlcyk7XG4gIH1cblxuICAvLyBLaW5kICh0eXBlIDMpOiBldmVudCBraW5kXG4gIGlmIChkYXRhLmtpbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGtpbmRCeXRlcyA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBraW5kQnl0ZXMud3JpdGVVSW50MzJCRShkYXRhLmtpbmQpO1xuICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5LSU5ELCBraW5kQnl0ZXMubGVuZ3RoKTtcbiAgICByZXN1bHQucHVzaCguLi5raW5kQnl0ZXMpO1xuICB9XG5cbiAgLy8gSWRlbnRpZmllciAodHlwZSA0KTogZm9yIG5hZGRyXG4gIGlmIChkYXRhLmlkZW50aWZpZXIpIHtcbiAgICBjb25zdCBpZGVudGlmaWVyQnl0ZXMgPSBCdWZmZXIuZnJvbShkYXRhLmlkZW50aWZpZXIsICd1dGY4Jyk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLklERU5USUZJRVIsIGlkZW50aWZpZXJCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmlkZW50aWZpZXJCeXRlcyk7XG4gIH1cblxuICByZXR1cm4gYmVjaDMyLnRvV29yZHMoQnVmZmVyLmZyb20ocmVzdWx0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVRMVihwcmVmaXg6IE5pcDE5RGF0YVR5cGUsIGRhdGE6IEJ1ZmZlcik6IE5pcDE5RGF0YSB7XG4gIGNvbnN0IHJlc3VsdDogTmlwMTlEYXRhID0ge1xuICAgIHR5cGU6IHByZWZpeCxcbiAgICBkYXRhOiAnJyxcbiAgICByZWxheXM6IFtdXG4gIH07XG5cbiAgbGV0IGkgPSAwO1xuICAvLyBGb3IgcmVsYXkgdHlwZVxuICBsZXQgcmVsYXk6IHN0cmluZztcblxuICB3aGlsZSAoaSA8IGRhdGEubGVuZ3RoKSB7XG4gICAgY29uc3QgdHlwZSA9IGRhdGFbaV07XG4gICAgY29uc3QgbGVuZ3RoID0gZGF0YVtpICsgMV07XG4gICAgXG4gICAgaWYgKGkgKyAyICsgbGVuZ3RoID4gZGF0YS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBUTFYgZGF0YScpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCB2YWx1ZSA9IGRhdGEuc2xpY2UoaSArIDIsIGkgKyAyICsgbGVuZ3RoKTtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBUTFZfVFlQRVMuU1BFQ0lBTDpcbiAgICAgICAgcmVzdWx0LmRhdGEgPSB2YWx1ZS50b1N0cmluZygnaGV4Jyk7XG4gICAgICAgIHZhbGlkYXRlSGV4U3RyaW5nKHJlc3VsdC5kYXRhLCA2NCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuUkVMQVk6XG4gICAgICAgIHJlbGF5ID0gdmFsdWUudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgdmFsaWRhdGVSZWxheVVybChyZWxheSk7XG4gICAgICAgIHJlc3VsdC5yZWxheXMgPSByZXN1bHQucmVsYXlzIHx8IFtdO1xuICAgICAgICByZXN1bHQucmVsYXlzLnB1c2gocmVsYXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVExWX1RZUEVTLkFVVEhPUjpcbiAgICAgICAgcmVzdWx0LmF1dGhvciA9IHZhbHVlLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcocmVzdWx0LmF1dGhvciwgNjQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVExWX1RZUEVTLktJTkQ6XG4gICAgICAgIHJlc3VsdC5raW5kID0gdmFsdWUucmVhZFVJbnQzMkJFKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuSURFTlRJRklFUjpcbiAgICAgICAgcmVzdWx0LmlkZW50aWZpZXIgPSB2YWx1ZS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFNraXAgdW5rbm93biBUTFYgdHlwZXNcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaSArPSAyICsgbGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsICIvKipcbiAqIE5JUC0yNjogRGVsZWdhdGVkIEV2ZW50IFNpZ25pbmdcbiAqIEltcGxlbWVudHMgZGVsZWdhdGlvbiBvZiBldmVudCBzaWduaW5nIGNhcGFiaWxpdGllc1xuICovXG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBOb3N0ckV2ZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgc2lnblNjaG5vcnIsIHZlcmlmeVNjaG5vcnJTaWduYXR1cmUgfSBmcm9tICcuLi9jcnlwdG8nO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEZWxlZ2F0aW9uQ29uZGl0aW9ucyB7XG4gIGtpbmQ/OiBudW1iZXI7XG4gIHNpbmNlPzogbnVtYmVyO1xuICB1bnRpbD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWxlZ2F0aW9uIHtcbiAgZGVsZWdhdG9yOiBzdHJpbmc7XG4gIGRlbGVnYXRlZTogc3RyaW5nO1xuICBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucztcbiAgdG9rZW46IHN0cmluZztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWxlZ2F0aW9uIHRva2VuXG4gKiBAcGFyYW0gZGVsZWdhdG9yUHJpdmF0ZUtleSBEZWxlZ2F0b3IncyBwcml2YXRlIGtleSAodXNlZCBmb3Igc2lnbmluZyBvbmx5LCBuZXZlciByZXR1cm5lZClcbiAqIEBwYXJhbSBkZWxlZ2F0ZWUgRGVsZWdhdGVlJ3MgcHVibGljIGtleVxuICogQHBhcmFtIGNvbmRpdGlvbnMgRGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcmV0dXJucyBEZWxlZ2F0aW9uIHRva2VuIChkZWxlZ2F0b3IgZmllbGQgY29udGFpbnMgdGhlIFBVQkxJQyBrZXksIG5vdCB0aGUgcHJpdmF0ZSBrZXkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZWxlZ2F0aW9uKFxuICBkZWxlZ2F0b3JQcml2YXRlS2V5OiBzdHJpbmcsXG4gIGRlbGVnYXRlZTogc3RyaW5nLFxuICBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9uc1xuKTogRGVsZWdhdGlvbiB7XG4gIGNvbnN0IGNvbmRpdGlvbnNTdHJpbmcgPSBzZXJpYWxpemVDb25kaXRpb25zKGNvbmRpdGlvbnMpO1xuICBjb25zdCB0b2tlbiA9IHNpZ25EZWxlZ2F0aW9uKGRlbGVnYXRvclByaXZhdGVLZXksIGRlbGVnYXRlZSwgY29uZGl0aW9uc1N0cmluZyk7XG5cbiAgLy8gRGVyaXZlIHRoZSBwdWJsaWMga2V5IGZyb20gdGhlIHByaXZhdGUga2V5IFx1MjAxNCBORVZFUiByZXR1cm4gdGhlIHByaXZhdGUga2V5XG4gIGNvbnN0IGRlbGVnYXRvclB1YmxpY0tleSA9IGJ5dGVzVG9IZXgoc2Nobm9yci5nZXRQdWJsaWNLZXkoaGV4VG9CeXRlcyhkZWxlZ2F0b3JQcml2YXRlS2V5KSkpO1xuXG4gIHJldHVybiB7XG4gICAgZGVsZWdhdG9yOiBkZWxlZ2F0b3JQdWJsaWNLZXksXG4gICAgZGVsZWdhdGVlLFxuICAgIGNvbmRpdGlvbnMsXG4gICAgdG9rZW5cbiAgfTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBkZWxlZ2F0aW9uIHRva2VuXG4gKiBAcGFyYW0gZGVsZWdhdGlvbiBEZWxlZ2F0aW9uIHRvIHZlcmlmeVxuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2ZXJpZnlEZWxlZ2F0aW9uKGRlbGVnYXRpb246IERlbGVnYXRpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgY29uZGl0aW9uc1N0cmluZyA9IHNlcmlhbGl6ZUNvbmRpdGlvbnMoZGVsZWdhdGlvbi5jb25kaXRpb25zKTtcbiAgcmV0dXJuIGF3YWl0IHZlcmlmeURlbGVnYXRpb25TaWduYXR1cmUoXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0b3IsXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0ZWUsXG4gICAgY29uZGl0aW9uc1N0cmluZyxcbiAgICBkZWxlZ2F0aW9uLnRva2VuXG4gICk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYW4gZXZlbnQgbWVldHMgZGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gY2hlY2tcbiAqIEBwYXJhbSBjb25kaXRpb25zIERlbGVnYXRpb24gY29uZGl0aW9uc1xuICogQHJldHVybnMgVHJ1ZSBpZiBjb25kaXRpb25zIGFyZSBtZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRGVsZWdhdGlvbkNvbmRpdGlvbnMoXG4gIGV2ZW50OiBOb3N0ckV2ZW50LFxuICBjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9uc1xuKTogYm9vbGVhbiB7XG4gIGlmIChjb25kaXRpb25zLmtpbmQgIT09IHVuZGVmaW5lZCAmJiBldmVudC5raW5kICE9PSBjb25kaXRpb25zLmtpbmQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29uZGl0aW9ucy5zaW5jZSAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmNyZWF0ZWRfYXQgPCBjb25kaXRpb25zLnNpbmNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbmRpdGlvbnMudW50aWwgIT09IHVuZGVmaW5lZCAmJiBldmVudC5jcmVhdGVkX2F0ID4gY29uZGl0aW9ucy51bnRpbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEFkZCBkZWxlZ2F0aW9uIHRhZyB0byBhbiBldmVudFxuICogQHBhcmFtIGV2ZW50IEV2ZW50IHRvIGFkZCBkZWxlZ2F0aW9uIHRvXG4gKiBAcGFyYW0gZGVsZWdhdGlvbiBEZWxlZ2F0aW9uIHRvIGFkZFxuICogQHJldHVybnMgVXBkYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVsZWdhdGlvblRhZyhcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsXG4gIGRlbGVnYXRpb246IERlbGVnYXRpb25cbik6IE5vc3RyRXZlbnQge1xuICBjb25zdCB0YWcgPSBbXG4gICAgJ2RlbGVnYXRpb24nLFxuICAgIGRlbGVnYXRpb24uZGVsZWdhdG9yLFxuICAgIHNlcmlhbGl6ZUNvbmRpdGlvbnMoZGVsZWdhdGlvbi5jb25kaXRpb25zKSxcbiAgICBkZWxlZ2F0aW9uLnRva2VuXG4gIF07XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICB0YWdzOiBbLi4uZXZlbnQudGFncywgdGFnXVxuICB9O1xufVxuXG4vKipcbiAqIEV4dHJhY3QgZGVsZWdhdGlvbiBmcm9tIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gZXh0cmFjdCBkZWxlZ2F0aW9uIGZyb21cbiAqIEByZXR1cm5zIERlbGVnYXRpb24gb3IgbnVsbCBpZiBub3QgZm91bmRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3REZWxlZ2F0aW9uKGV2ZW50OiBOb3N0ckV2ZW50KTogRGVsZWdhdGlvbiB8IG51bGwge1xuICBjb25zdCB0YWcgPSBldmVudC50YWdzLmZpbmQodCA9PiB0WzBdID09PSAnZGVsZWdhdGlvbicpO1xuICBpZiAoIXRhZyB8fCB0YWcubGVuZ3RoICE9PSA0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGRlbGVnYXRvcjogdGFnWzFdLFxuICAgIGRlbGVnYXRlZTogZXZlbnQucHVia2V5LFxuICAgIGNvbmRpdGlvbnM6IHBhcnNlQ29uZGl0aW9ucyh0YWdbMl0pLFxuICAgIHRva2VuOiB0YWdbM11cbiAgfTtcbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuZnVuY3Rpb24gc2VyaWFsaXplQ29uZGl0aW9ucyhjb25kaXRpb25zOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGlmIChjb25kaXRpb25zLmtpbmQgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGtpbmQ9JHtjb25kaXRpb25zLmtpbmR9YCk7XG4gIH1cbiAgaWYgKGNvbmRpdGlvbnMuc2luY2UgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGNyZWF0ZWRfYXQ+JHtjb25kaXRpb25zLnNpbmNlfWApO1xuICB9XG4gIGlmIChjb25kaXRpb25zLnVudGlsICE9PSB1bmRlZmluZWQpIHtcbiAgICBwYXJ0cy5wdXNoKGBjcmVhdGVkX2F0PCR7Y29uZGl0aW9ucy51bnRpbH1gKTtcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcmJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlQ29uZGl0aW9ucyhjb25kaXRpb25zU3RyaW5nOiBzdHJpbmcpOiBEZWxlZ2F0aW9uQ29uZGl0aW9ucyB7XG4gIGNvbnN0IGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zID0ge307XG4gIGNvbnN0IHBhcnRzID0gY29uZGl0aW9uc1N0cmluZy5zcGxpdCgnJicpO1xuXG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2tpbmQ9JykpIHtcbiAgICAgIGNvbmRpdGlvbnMua2luZCA9IHBhcnNlSW50KHBhcnQuc2xpY2UoNSkpO1xuICAgIH0gZWxzZSBpZiAocGFydC5zdGFydHNXaXRoKCdjcmVhdGVkX2F0PicpKSB7XG4gICAgICBjb25kaXRpb25zLnNpbmNlID0gcGFyc2VJbnQocGFydC5zbGljZSgxMSkpO1xuICAgIH0gZWxzZSBpZiAocGFydC5zdGFydHNXaXRoKCdjcmVhdGVkX2F0PCcpKSB7XG4gICAgICBjb25kaXRpb25zLnVudGlsID0gcGFyc2VJbnQocGFydC5zbGljZSgxMSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb25kaXRpb25zO1xufVxuXG5mdW5jdGlvbiBzaWduRGVsZWdhdGlvbihcbiAgZGVsZWdhdG9yOiBzdHJpbmcsXG4gIGRlbGVnYXRlZTogc3RyaW5nLFxuICBjb25kaXRpb25zOiBzdHJpbmdcbik6IHN0cmluZyB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBgbm9zdHI6ZGVsZWdhdGlvbjoke2RlbGVnYXRlZX06JHtjb25kaXRpb25zfWA7XG4gIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKG1lc3NhZ2UpKTtcbiAgY29uc3Qgc2lnbmF0dXJlID0gc2lnblNjaG5vcnIoaGFzaCwgaGV4VG9CeXRlcyhkZWxlZ2F0b3IpKTtcbiAgcmV0dXJuIGJ5dGVzVG9IZXgoc2lnbmF0dXJlKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdmVyaWZ5RGVsZWdhdGlvblNpZ25hdHVyZShcbiAgZGVsZWdhdG9yOiBzdHJpbmcsXG4gIGRlbGVnYXRlZTogc3RyaW5nLFxuICBjb25kaXRpb25zOiBzdHJpbmcsXG4gIHNpZ25hdHVyZTogc3RyaW5nXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgbXNnSGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYG5vc3RyOmRlbGVnYXRpb246JHtkZWxlZ2F0ZWV9OiR7Y29uZGl0aW9uc31gKSk7XG5cbiAgcmV0dXJuIHZlcmlmeVNjaG5vcnJTaWduYXR1cmUoaGV4VG9CeXRlcyhzaWduYXR1cmUpLCBtc2dIYXNoLCBoZXhUb0J5dGVzKGRlbGVnYXRvcikpO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00NFxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00NCAoVmVyc2lvbmVkIEVuY3J5cHRlZCBQYXlsb2FkcylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDQubWRcbiAqL1xuXG5pbXBvcnQgeyBjaGFjaGEyMCB9IGZyb20gJ0Bub2JsZS9jaXBoZXJzL2NoYWNoYS5qcyc7XG5pbXBvcnQgeyBlcXVhbEJ5dGVzIH0gZnJvbSAnQG5vYmxlL2NpcGhlcnMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgZXh0cmFjdCBhcyBoa2RmX2V4dHJhY3QsIGV4cGFuZCBhcyBoa2RmX2V4cGFuZCB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvaGtkZi5qcyc7XG5pbXBvcnQgeyBobWFjIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9obWFjLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBjb25jYXRCeXRlcywgaGV4VG9CeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGJhc2U2NCB9IGZyb20gJ0BzY3VyZS9iYXNlJztcblxuY29uc3QgdXRmOEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5cbmNvbnN0IG1pblBsYWludGV4dFNpemUgPSAxO1xuY29uc3QgbWF4UGxhaW50ZXh0U2l6ZSA9IDY1NTM1O1xuXG4vKipcbiAqIENhbGN1bGF0ZSBwYWRkZWQgbGVuZ3RoIGZvciBOSVAtNDQgbWVzc2FnZSBwYWRkaW5nXG4gKi9cbmZ1bmN0aW9uIGNhbGNQYWRkZWRMZW4obGVuOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGxlbikgfHwgbGVuIDwgMSkgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gIGlmIChsZW4gPD0gMzIpIHJldHVybiAzMjtcbiAgY29uc3QgbmV4dFBvd2VyID0gMSA8PCAoTWF0aC5mbG9vcihNYXRoLmxvZzIobGVuIC0gMSkpICsgMSk7XG4gIGNvbnN0IGNodW5rID0gbmV4dFBvd2VyIDw9IDI1NiA/IDMyIDogbmV4dFBvd2VyIC8gODtcbiAgcmV0dXJuIGNodW5rICogKE1hdGguZmxvb3IoKGxlbiAtIDEpIC8gY2h1bmspICsgMSk7XG59XG5cbi8qKlxuICogUGFkIHBsYWludGV4dCBwZXIgTklQLTQ0IHNwZWNcbiAqL1xuZnVuY3Rpb24gcGFkKHBsYWludGV4dDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHVucGFkZGVkID0gdXRmOEVuY29kZXIuZW5jb2RlKHBsYWludGV4dCk7XG4gIGNvbnN0IHVucGFkZGVkTGVuID0gdW5wYWRkZWQubGVuZ3RoO1xuICBpZiAodW5wYWRkZWRMZW4gPCBtaW5QbGFpbnRleHRTaXplIHx8IHVucGFkZGVkTGVuID4gbWF4UGxhaW50ZXh0U2l6ZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGxhaW50ZXh0IGxlbmd0aDogbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDY1NTM1IGJ5dGVzJyk7XG4gIGNvbnN0IHByZWZpeCA9IG5ldyBVaW50OEFycmF5KDIpO1xuICBuZXcgRGF0YVZpZXcocHJlZml4LmJ1ZmZlcikuc2V0VWludDE2KDAsIHVucGFkZGVkTGVuLCBmYWxzZSk7IC8vIGJpZy1lbmRpYW5cbiAgY29uc3Qgc3VmZml4ID0gbmV3IFVpbnQ4QXJyYXkoY2FsY1BhZGRlZExlbih1bnBhZGRlZExlbikgLSB1bnBhZGRlZExlbik7XG4gIHJldHVybiBjb25jYXRCeXRlcyhwcmVmaXgsIHVucGFkZGVkLCBzdWZmaXgpO1xufVxuXG4vKipcbiAqIFVucGFkIGRlY3J5cHRlZCBtZXNzYWdlIHBlciBOSVAtNDQgc3BlY1xuICovXG5mdW5jdGlvbiB1bnBhZChwYWRkZWQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCB1bnBhZGRlZExlbiA9IG5ldyBEYXRhVmlldyhwYWRkZWQuYnVmZmVyLCBwYWRkZWQuYnl0ZU9mZnNldCkuZ2V0VWludDE2KDAsIGZhbHNlKTtcbiAgY29uc3QgdW5wYWRkZWQgPSBwYWRkZWQuc3ViYXJyYXkoMiwgMiArIHVucGFkZGVkTGVuKTtcbiAgaWYgKFxuICAgIHVucGFkZGVkTGVuIDwgbWluUGxhaW50ZXh0U2l6ZSB8fFxuICAgIHVucGFkZGVkTGVuID4gbWF4UGxhaW50ZXh0U2l6ZSB8fFxuICAgIHVucGFkZGVkLmxlbmd0aCAhPT0gdW5wYWRkZWRMZW4gfHxcbiAgICBwYWRkZWQubGVuZ3RoICE9PSAyICsgY2FsY1BhZGRlZExlbih1bnBhZGRlZExlbilcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBhZGRpbmcnKTtcbiAgfVxuICByZXR1cm4gdXRmOERlY29kZXIuZGVjb2RlKHVucGFkZGVkKTtcbn1cblxuLyoqXG4gKiBEZXJpdmUgY29udmVyc2F0aW9uIGtleSBmcm9tIHByaXZhdGUga2V5IGFuZCBwdWJsaWMga2V5IHVzaW5nIEVDREggKyBIS0RGXG4gKi9cbmZ1bmN0aW9uIGdldENvbnZlcnNhdGlvbktleShwcml2a2V5QTogVWludDhBcnJheSwgcHVia2V5Qjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChwcml2a2V5QSwgaGV4VG9CeXRlcygnMDInICsgcHVia2V5QikpO1xuICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc3ViYXJyYXkoMSwgMzMpO1xuICByZXR1cm4gaGtkZl9leHRyYWN0KHNoYTI1Niwgc2hhcmVkWCwgdXRmOEVuY29kZXIuZW5jb2RlKCduaXA0NC12MicpKTtcbn1cblxuLyoqXG4gKiBEZXJpdmUgbWVzc2FnZSBrZXlzIChjaGFjaGEga2V5LCBjaGFjaGEgbm9uY2UsIGhtYWMga2V5KSBmcm9tIGNvbnZlcnNhdGlvbiBrZXkgYW5kIG5vbmNlXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleTogVWludDhBcnJheSwgbm9uY2U6IFVpbnQ4QXJyYXkpOiB7XG4gIGNoYWNoYV9rZXk6IFVpbnQ4QXJyYXk7XG4gIGNoYWNoYV9ub25jZTogVWludDhBcnJheTtcbiAgaG1hY19rZXk6IFVpbnQ4QXJyYXk7XG59IHtcbiAgY29uc3Qga2V5cyA9IGhrZGZfZXhwYW5kKHNoYTI1NiwgY29udmVyc2F0aW9uS2V5LCBub25jZSwgNzYpO1xuICByZXR1cm4ge1xuICAgIGNoYWNoYV9rZXk6IGtleXMuc3ViYXJyYXkoMCwgMzIpLFxuICAgIGNoYWNoYV9ub25jZToga2V5cy5zdWJhcnJheSgzMiwgNDQpLFxuICAgIGhtYWNfa2V5OiBrZXlzLnN1YmFycmF5KDQ0LCA3NiksXG4gIH07XG59XG5cbi8qKlxuICogRW5jcnlwdCBwbGFpbnRleHQgdXNpbmcgTklQLTQ0IHYyXG4gKiBAcGFyYW0gcGxhaW50ZXh0IC0gVGhlIG1lc3NhZ2UgdG8gZW5jcnlwdFxuICogQHBhcmFtIGNvbnZlcnNhdGlvbktleSAtIDMyLWJ5dGUgY29udmVyc2F0aW9uIGtleSBmcm9tIGdldENvbnZlcnNhdGlvbktleVxuICogQHBhcmFtIG5vbmNlIC0gT3B0aW9uYWwgMzItYnl0ZSBub25jZSAocmFuZG9tIGlmIG5vdCBwcm92aWRlZClcbiAqIEByZXR1cm5zIEJhc2U2NC1lbmNvZGVkIGVuY3J5cHRlZCBwYXlsb2FkXG4gKi9cbmZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0OiBzdHJpbmcsIGNvbnZlcnNhdGlvbktleTogVWludDhBcnJheSwgbm9uY2U6IFVpbnQ4QXJyYXkgPSByYW5kb21CeXRlcygzMikpOiBzdHJpbmcge1xuICBjb25zdCB7IGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgaG1hY19rZXkgfSA9IGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleSwgbm9uY2UpO1xuICBjb25zdCBwYWRkZWQgPSBwYWQocGxhaW50ZXh0KTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGNoYWNoYTIwKGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgcGFkZGVkKTtcbiAgY29uc3QgbWFjID0gaG1hYyhzaGEyNTYsIGhtYWNfa2V5LCBjb25jYXRCeXRlcyhub25jZSwgY2lwaGVydGV4dCkpO1xuICByZXR1cm4gYmFzZTY0LmVuY29kZShjb25jYXRCeXRlcyhuZXcgVWludDhBcnJheShbMl0pLCBub25jZSwgY2lwaGVydGV4dCwgbWFjKSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIE5JUC00NCB2MiBwYXlsb2FkXG4gKiBAcGFyYW0gcGF5bG9hZCAtIEJhc2U2NC1lbmNvZGVkIGVuY3J5cHRlZCBwYXlsb2FkXG4gKiBAcGFyYW0gY29udmVyc2F0aW9uS2V5IC0gMzItYnl0ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gZ2V0Q29udmVyc2F0aW9uS2V5XG4gKiBAcmV0dXJucyBEZWNyeXB0ZWQgcGxhaW50ZXh0IHN0cmluZ1xuICovXG5mdW5jdGlvbiBkZWNyeXB0KHBheWxvYWQ6IHN0cmluZywgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IGJhc2U2NC5kZWNvZGUocGF5bG9hZCk7XG4gIGNvbnN0IHZlcnNpb24gPSBkYXRhWzBdO1xuICBpZiAodmVyc2lvbiAhPT0gMikgdGhyb3cgbmV3IEVycm9yKGB1bmtub3duIGVuY3J5cHRpb24gdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICBpZiAoZGF0YS5sZW5ndGggPCA5OSB8fCBkYXRhLmxlbmd0aCA+IDY1NjAzKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGF5bG9hZCBzaXplJyk7XG4gIGNvbnN0IG5vbmNlID0gZGF0YS5zdWJhcnJheSgxLCAzMyk7XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBkYXRhLnN1YmFycmF5KDMzLCBkYXRhLmxlbmd0aCAtIDMyKTtcbiAgY29uc3QgbWFjID0gZGF0YS5zdWJhcnJheShkYXRhLmxlbmd0aCAtIDMyKTtcbiAgY29uc3QgeyBjaGFjaGFfa2V5LCBjaGFjaGFfbm9uY2UsIGhtYWNfa2V5IH0gPSBnZXRNZXNzYWdlS2V5cyhjb252ZXJzYXRpb25LZXksIG5vbmNlKTtcbiAgY29uc3QgZXhwZWN0ZWRNYWMgPSBobWFjKHNoYTI1NiwgaG1hY19rZXksIGNvbmNhdEJ5dGVzKG5vbmNlLCBjaXBoZXJ0ZXh0KSk7XG4gIGlmICghZXF1YWxCeXRlcyhtYWMsIGV4cGVjdGVkTWFjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIE1BQycpO1xuICBjb25zdCBwYWRkZWQgPSBjaGFjaGEyMChjaGFjaGFfa2V5LCBjaGFjaGFfbm9uY2UsIGNpcGhlcnRleHQpO1xuICByZXR1cm4gdW5wYWQocGFkZGVkKTtcbn1cblxuLyoqXG4gKiB2MiBBUEkgb2JqZWN0IG1hdGNoaW5nIG5vc3RyLXRvb2xzIHNoYXBlIGZvciBjb21wYXRpYmlsaXR5XG4gKi9cbmV4cG9ydCBjb25zdCB2MiA9IHtcbiAgdXRpbHM6IHtcbiAgICBnZXRDb252ZXJzYXRpb25LZXksXG4gICAgY2FsY1BhZGRlZExlbixcbiAgfSxcbiAgZW5jcnlwdCxcbiAgZGVjcnlwdCxcbn07XG5cbmV4cG9ydCB7IGdldENvbnZlcnNhdGlvbktleSwgZW5jcnlwdCwgZGVjcnlwdCwgY2FsY1BhZGRlZExlbiB9O1xuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00NlxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00NiAoTm9zdHIgQ29ubmVjdCAvIFJlbW90ZSBTaWduaW5nKVxuICpcbiAqIFB1cmUgcHJvdG9jb2wgbGF5ZXIgXHUyMDE0IGNyeXB0bywgZW5jb2RpbmcsIG1lc3NhZ2UgZm9ybWF0dGluZy5cbiAqIE5vIFdlYlNvY2tldCwgbm8gcmVsYXkgY29ubmVjdGlvbnMsIG5vIEkvTy5cbiAqIENvbnN1bWVycyBwcm92aWRlIHRoZWlyIG93biB0cmFuc3BvcnQuXG4gKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ni5tZFxuICovXG5cbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7XG4gIGdldENvbnZlcnNhdGlvbktleSBhcyBuaXA0NEdldENvbnZlcnNhdGlvbktleSxcbiAgZW5jcnlwdCBhcyBuaXA0NEVuY3J5cHQsXG4gIGRlY3J5cHQgYXMgbmlwNDREZWNyeXB0LFxufSBmcm9tICcuL25pcC00NCc7XG5pbXBvcnQgdHlwZSB7XG4gIEJ1bmtlclVSSSxcbiAgQnVua2VyVmFsaWRhdGlvblJlc3VsdCxcbiAgTmlwNDZSZXF1ZXN0LFxuICBOaXA0NlJlc3BvbnNlLFxuICBOaXA0NlNlc3Npb24sXG4gIE5pcDQ2U2Vzc2lvbkluZm8sXG4gIFNpZ25lZE5vc3RyRXZlbnQsXG59IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IE5pcDQ2TWV0aG9kIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgMS4gQnVua2VyIFVSSSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBQYXJzZSBhIGJ1bmtlcjovLyBVUkkgaW50byBpdHMgY29tcG9uZW50c1xuICogQHBhcmFtIHVyaSAtIGJ1bmtlcjovLyZsdDtyZW1vdGUtcHVia2V5Jmd0Oz9yZWxheT0uLi4mc2VjcmV0PS4uLlxuICogQHJldHVybnMgUGFyc2VkIEJ1bmtlclVSSSBvciB0aHJvd3Mgb24gaW52YWxpZCBpbnB1dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdW5rZXJVUkkodXJpOiBzdHJpbmcpOiBCdW5rZXJVUkkge1xuICBpZiAoIXVyaS5zdGFydHNXaXRoKCdidW5rZXI6Ly8nKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBidW5rZXIgVVJJOiBtdXN0IHN0YXJ0IHdpdGggYnVua2VyOi8vJyk7XG4gIH1cblxuICBjb25zdCB1cmwgPSBuZXcgVVJMKHVyaS5yZXBsYWNlKCdidW5rZXI6Ly8nLCAnaHR0cHM6Ly8nKSk7XG4gIGNvbnN0IHJlbW90ZVB1YmtleSA9IHVybC5ob3N0bmFtZTtcblxuICBpZiAoIS9eWzAtOWEtZl17NjR9JC8udGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IHJlbW90ZSBwdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICB9XG5cbiAgY29uc3QgcmVsYXlzID0gdXJsLnNlYXJjaFBhcmFtcy5nZXRBbGwoJ3JlbGF5Jyk7XG4gIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IGF0IGxlYXN0IG9uZSByZWxheSBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgY29uc3Qgc2VjcmV0ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3NlY3JldCcpIHx8IHVuZGVmaW5lZDtcblxuICByZXR1cm4geyByZW1vdGVQdWJrZXksIHJlbGF5cywgc2VjcmV0IH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYnVua2VyOi8vIFVSSSBzdHJpbmdcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KVxuICogQHBhcmFtIHJlbGF5cyAtIFJlbGF5IFVSTHNcbiAqIEBwYXJhbSBzZWNyZXQgLSBPcHRpb25hbCBjb25uZWN0aW9uIHNlY3JldFxuICogQHJldHVybnMgYnVua2VyOi8vIFVSSSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJ1bmtlclVSSShyZW1vdGVQdWJrZXk6IHN0cmluZywgcmVsYXlzOiBzdHJpbmdbXSwgc2VjcmV0Pzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKCEvXlswLTlhLWZdezY0fSQvLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3RlUHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgfVxuICBpZiAocmVsYXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBjb25zdCBwYXJhbXMgPSByZWxheXMubWFwKHIgPT4gYHJlbGF5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHIpfWApO1xuICBpZiAoc2VjcmV0KSB7XG4gICAgcGFyYW1zLnB1c2goYHNlY3JldD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWNyZXQpfWApO1xuICB9XG5cbiAgcmV0dXJuIGBidW5rZXI6Ly8ke3JlbW90ZVB1YmtleX0/JHtwYXJhbXMuam9pbignJicpfWA7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBidW5rZXI6Ly8gVVJJIGFuZCByZXR1cm4gc3RydWN0dXJlZCByZXN1bHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQnVua2VyVVJJKHVyaTogc3RyaW5nKTogQnVua2VyVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VCdW5rZXJVUkkodXJpKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCB1cmk6IHBhcnNlZCB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAoZSBhcyBFcnJvcikubWVzc2FnZSB9O1xuICB9XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAyLiBTZXNzaW9uIE1hbmFnZW1lbnQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IE5JUC00NiBzZXNzaW9uIHdpdGggYW4gZXBoZW1lcmFsIGtleXBhaXJcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KVxuICogQHJldHVybnMgU2Vzc2lvbiBjb250YWluaW5nIGVwaGVtZXJhbCBrZXlzIGFuZCBOSVAtNDQgY29udmVyc2F0aW9uIGtleVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbihyZW1vdGVQdWJrZXk6IHN0cmluZyk6IE5pcDQ2U2Vzc2lvbiB7XG4gIGlmICghL15bMC05YS1mXXs2NH0kLy50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW90ZVB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gIH1cblxuICBjb25zdCBjbGllbnRTZWNyZXRLZXlCeXRlcyA9IHJhbmRvbUJ5dGVzKDMyKTtcbiAgY29uc3QgY2xpZW50U2VjcmV0S2V5ID0gYnl0ZXNUb0hleChjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoY2xpZW50U2VjcmV0S2V5Qnl0ZXMpO1xuICBjb25zdCBjbGllbnRQdWJrZXkgPSBieXRlc1RvSGV4KGNsaWVudFB1YmtleUJ5dGVzKTtcblxuICBjb25zdCBjb252ZXJzYXRpb25LZXkgPSBuaXA0NEdldENvbnZlcnNhdGlvbktleShjbGllbnRTZWNyZXRLZXlCeXRlcywgcmVtb3RlUHVia2V5KTtcblxuICByZXR1cm4ge1xuICAgIGNsaWVudFNlY3JldEtleSxcbiAgICBjbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5LFxuICAgIGNvbnZlcnNhdGlvbktleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXN0b3JlIGEgc2Vzc2lvbiBmcm9tIGEgcHJldmlvdXNseSBzYXZlZCBlcGhlbWVyYWwgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSBjbGllbnRTZWNyZXRLZXkgLSBIZXgtZW5jb2RlZCBlcGhlbWVyYWwgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSByZW1vdGVQdWJrZXkgLSBSZW1vdGUgc2lnbmVyJ3MgcHVibGljIGtleSAoaGV4KVxuICogQHJldHVybnMgUmVzdG9yZWQgc2Vzc2lvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZVNlc3Npb24oY2xpZW50U2VjcmV0S2V5OiBzdHJpbmcsIHJlbW90ZVB1YmtleTogc3RyaW5nKTogTmlwNDZTZXNzaW9uIHtcbiAgY29uc3QgY2xpZW50U2VjcmV0S2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKGNsaWVudFNlY3JldEtleSk7XG4gIGNvbnN0IGNsaWVudFB1YmtleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkoY2xpZW50U2VjcmV0S2V5Qnl0ZXMpO1xuICBjb25zdCBjbGllbnRQdWJrZXkgPSBieXRlc1RvSGV4KGNsaWVudFB1YmtleUJ5dGVzKTtcblxuICBjb25zdCBjb252ZXJzYXRpb25LZXkgPSBuaXA0NEdldENvbnZlcnNhdGlvbktleShjbGllbnRTZWNyZXRLZXlCeXRlcywgcmVtb3RlUHVia2V5KTtcblxuICByZXR1cm4ge1xuICAgIGNsaWVudFNlY3JldEtleSxcbiAgICBjbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5LFxuICAgIGNvbnZlcnNhdGlvbktleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXQgcHVibGljIHNlc3Npb24gaW5mbyAoc2FmZSB0byBleHBvc2UpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXNzaW9uSW5mbyhzZXNzaW9uOiBOaXA0NlNlc3Npb24pOiBOaXA0NlNlc3Npb25JbmZvIHtcbiAgcmV0dXJuIHtcbiAgICBjbGllbnRQdWJrZXk6IHNlc3Npb24uY2xpZW50UHVia2V5LFxuICAgIHJlbW90ZVB1YmtleTogc2Vzc2lvbi5yZW1vdGVQdWJrZXksXG4gIH07XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAzLiBKU09OLVJQQyBNZXNzYWdlcyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBOSVAtNDYgSlNPTi1SUEMgcmVxdWVzdFxuICogQHBhcmFtIG1ldGhvZCAtIFJQQyBtZXRob2QgbmFtZVxuICogQHBhcmFtIHBhcmFtcyAtIEFycmF5IG9mIHN0cmluZyBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gaWQgLSBPcHRpb25hbCByZXF1ZXN0IElEIChyYW5kb20gaWYgbm90IHByb3ZpZGVkKVxuICogQHJldHVybnMgSlNPTi1SUEMgcmVxdWVzdCBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlcXVlc3QobWV0aG9kOiBOaXA0Nk1ldGhvZCB8IHN0cmluZywgcGFyYW1zOiBzdHJpbmdbXSwgaWQ/OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4ge1xuICAgIGlkOiBpZCB8fCBieXRlc1RvSGV4KHJhbmRvbUJ5dGVzKDE2KSksXG4gICAgbWV0aG9kLFxuICAgIHBhcmFtcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBOSVAtNDYgSlNPTi1SUEMgcmVzcG9uc2VcbiAqIEBwYXJhbSBpZCAtIFJlcXVlc3QgSUQgYmVpbmcgcmVzcG9uZGVkIHRvXG4gKiBAcGFyYW0gcmVzdWx0IC0gUmVzdWx0IHN0cmluZyAob24gc3VjY2VzcylcbiAqIEBwYXJhbSBlcnJvciAtIEVycm9yIHN0cmluZyAob24gZmFpbHVyZSlcbiAqIEByZXR1cm5zIEpTT04tUlBDIHJlc3BvbnNlIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2UoaWQ6IHN0cmluZywgcmVzdWx0Pzogc3RyaW5nLCBlcnJvcj86IHN0cmluZyk6IE5pcDQ2UmVzcG9uc2Uge1xuICBjb25zdCByZXNwb25zZTogTmlwNDZSZXNwb25zZSA9IHsgaWQgfTtcbiAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSByZXNwb25zZS5yZXN1bHQgPSByZXN1bHQ7XG4gIGlmIChlcnJvciAhPT0gdW5kZWZpbmVkKSByZXNwb25zZS5lcnJvciA9IGVycm9yO1xuICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbi8qKlxuICogUGFyc2UgYSBKU09OIHN0cmluZyBpbnRvIGEgTklQLTQ2IHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSBqc29uIC0gSlNPTiBzdHJpbmcgdG8gcGFyc2VcbiAqIEByZXR1cm5zIFBhcnNlZCByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBheWxvYWQoanNvbjogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSB7XG4gIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbikgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGlmICh0eXBlb2Ygb2JqLmlkICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBOSVAtNDYgcGF5bG9hZDogbWlzc2luZyBpZCcpO1xuICB9XG4gIHJldHVybiBvYmogYXMgdW5rbm93biBhcyBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcGF5bG9hZCBpcyBhIE5JUC00NiByZXF1ZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVlc3QocGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSk6IHBheWxvYWQgaXMgTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuICdtZXRob2QnIGluIHBheWxvYWQgJiYgJ3BhcmFtcycgaW4gcGF5bG9hZDtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHBheWxvYWQgaXMgYSBOSVAtNDYgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVzcG9uc2UocGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSk6IHBheWxvYWQgaXMgTmlwNDZSZXNwb25zZSB7XG4gIHJldHVybiAncmVzdWx0JyBpbiBwYXlsb2FkIHx8ICdlcnJvcicgaW4gcGF5bG9hZDtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDQuIEV2ZW50IFdyYXBwaW5nIChLaW5kIDI0MTMzKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBFbmNyeXB0IGFuZCB3cmFwIGEgTklQLTQ2IHBheWxvYWQgaW50byBhIGtpbmQgMjQxMzMgc2lnbmVkIGV2ZW50XG4gKiBAcGFyYW0gcGF5bG9hZCAtIEpTT04tUlBDIHJlcXVlc3Qgb3IgcmVzcG9uc2UgdG8gZW5jcnlwdFxuICogQHBhcmFtIHNlc3Npb24gLSBOSVAtNDYgc2Vzc2lvblxuICogQHBhcmFtIHJlY2lwaWVudFB1YmtleSAtIFRoZSByZWNpcGllbnQncyBwdWJrZXkgKGhleClcbiAqIEByZXR1cm5zIFNpZ25lZCBraW5kIDI0MTMzIGV2ZW50XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cmFwRXZlbnQoXG4gIHBheWxvYWQ6IE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2UsXG4gIHNlc3Npb246IE5pcDQ2U2Vzc2lvbixcbiAgcmVjaXBpZW50UHVia2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gIGNvbnN0IGVuY3J5cHRlZCA9IG5pcDQ0RW5jcnlwdChqc29uLCBzZXNzaW9uLmNvbnZlcnNhdGlvbktleSk7XG5cbiAgY29uc3QgY3JlYXRlZF9hdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICBjb25zdCBldmVudCA9IHtcbiAgICBraW5kOiAyNDEzMyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHRhZ3M6IFtbJ3AnLCByZWNpcGllbnRQdWJrZXldXSxcbiAgICBjb250ZW50OiBlbmNyeXB0ZWQsXG4gICAgcHVia2V5OiBzZXNzaW9uLmNsaWVudFB1YmtleSxcbiAgfTtcblxuICAvLyBTZXJpYWxpemUgZm9yIE5JUC0wMSBldmVudCBJRFxuICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgIDAsXG4gICAgZXZlbnQucHVia2V5LFxuICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgZXZlbnQua2luZCxcbiAgICBldmVudC50YWdzLFxuICAgIGV2ZW50LmNvbnRlbnQsXG4gIF0pO1xuXG4gIGNvbnN0IGV2ZW50SGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICBjb25zdCBwcml2YXRlS2V5Qnl0ZXMgPSBoZXhUb0J5dGVzKHNlc3Npb24uY2xpZW50U2VjcmV0S2V5KTtcbiAgY29uc3Qgc2lnbmF0dXJlQnl0ZXMgPSBzY2hub3JyLnNpZ24oZXZlbnRIYXNoLCBwcml2YXRlS2V5Qnl0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXZlbnQsXG4gICAgaWQ6IGJ5dGVzVG9IZXgoZXZlbnRIYXNoKSxcbiAgICBzaWc6IGJ5dGVzVG9IZXgoc2lnbmF0dXJlQnl0ZXMpLFxuICB9O1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW5kIHBhcnNlIGEga2luZCAyNDEzMyBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gU2lnbmVkIGtpbmQgMjQxMzMgZXZlbnRcbiAqIEBwYXJhbSBzZXNzaW9uIC0gTklQLTQ2IHNlc3Npb25cbiAqIEByZXR1cm5zIERlY3J5cHRlZCBKU09OLVJQQyByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXBFdmVudChcbiAgZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQsXG4gIHNlc3Npb246IE5pcDQ2U2Vzc2lvblxuKTogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSB7XG4gIGlmIChldmVudC5raW5kICE9PSAyNDEzMykge1xuICAgIHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQga2luZCAyNDEzMywgZ290ICR7ZXZlbnQua2luZH1gKTtcbiAgfVxuXG4gIGNvbnN0IGpzb24gPSBuaXA0NERlY3J5cHQoZXZlbnQuY29udGVudCwgc2Vzc2lvbi5jb252ZXJzYXRpb25LZXkpO1xuICByZXR1cm4gcGFyc2VQYXlsb2FkKGpzb24pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNS4gQ29udmVuaWVuY2UgUmVxdWVzdCBDcmVhdG9ycyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSAnY29ubmVjdCcgcmVxdWVzdFxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJrZXlcbiAqIEBwYXJhbSBzZWNyZXQgLSBPcHRpb25hbCBjb25uZWN0aW9uIHNlY3JldCBmcm9tIGJ1bmtlciBVUklcbiAqIEBwYXJhbSBwZXJtaXNzaW9ucyAtIE9wdGlvbmFsIGNvbW1hLXNlcGFyYXRlZCBwZXJtaXNzaW9uIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdFJlcXVlc3QocmVtb3RlUHVia2V5OiBzdHJpbmcsIHNlY3JldD86IHN0cmluZywgcGVybWlzc2lvbnM/OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICBjb25zdCBwYXJhbXMgPSBbcmVtb3RlUHVia2V5XTtcbiAgaWYgKHNlY3JldCkgcGFyYW1zLnB1c2goc2VjcmV0KTtcbiAgZWxzZSBpZiAocGVybWlzc2lvbnMpIHBhcmFtcy5wdXNoKCcnKTtcbiAgaWYgKHBlcm1pc3Npb25zKSBwYXJhbXMucHVzaChwZXJtaXNzaW9ucyk7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLkNPTk5FQ1QsIHBhcmFtcyk7XG59XG5cbi8qKiBDcmVhdGUgYSAncGluZycgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpbmdSZXF1ZXN0KCk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLlBJTkcsIFtdKTtcbn1cblxuLyoqIENyZWF0ZSBhICdnZXRfcHVibGljX2tleScgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFB1YmxpY0tleVJlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuR0VUX1BVQkxJQ19LRVksIFtdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnc2lnbl9ldmVudCcgcmVxdWVzdFxuICogQHBhcmFtIGV2ZW50SnNvbiAtIEpTT04tc3RyaW5naWZpZWQgdW5zaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNpZ25FdmVudFJlcXVlc3QoZXZlbnRKc29uOiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5TSUdOX0VWRU5ULCBbZXZlbnRKc29uXSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDA0X2VuY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSByZWNpcGllbnRcbiAqIEBwYXJhbSBwbGFpbnRleHQgLSBNZXNzYWdlIHRvIGVuY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDA0RW5jcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBwbGFpbnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDA0X0VOQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBwbGFpbnRleHRdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwMDRfZGVjcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHNlbmRlclxuICogQHBhcmFtIGNpcGhlcnRleHQgLSBFbmNyeXB0ZWQgbWVzc2FnZSB0byBkZWNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXAwNERlY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgY2lwaGVydGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQMDRfREVDUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIGNpcGhlcnRleHRdKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwNDRfZW5jcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHJlY2lwaWVudFxuICogQHBhcmFtIHBsYWludGV4dCAtIE1lc3NhZ2UgdG8gZW5jcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwNDRFbmNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIHBsYWludGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQNDRfRU5DUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIHBsYWludGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXA0NF9kZWNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2Ugc2VuZGVyXG4gKiBAcGFyYW0gY2lwaGVydGV4dCAtIEVuY3J5cHRlZCBtZXNzYWdlIHRvIGRlY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDQ0RGVjcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBjaXBoZXJ0ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVA0NF9ERUNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgY2lwaGVydGV4dF0pO1xufVxuXG4vKiogQ3JlYXRlIGEgJ2dldF9yZWxheXMnIHJlcXVlc3QgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWxheXNSZXF1ZXN0KCk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLkdFVF9SRUxBWVMsIFtdKTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDYuIEZpbHRlciBIZWxwZXIgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5cbi8qKlxuICogQ3JlYXRlIGEgTm9zdHIgZmlsdGVyIGZvciBzdWJzY3JpYmluZyB0byBOSVAtNDYgcmVzcG9uc2UgZXZlbnRzXG4gKiBAcGFyYW0gY2xpZW50UHVia2V5IC0gT3VyIGVwaGVtZXJhbCBwdWJsaWMga2V5IChoZXgpXG4gKiBAcGFyYW0gc2luY2UgLSBPcHRpb25hbCBzaW5jZSB0aW1lc3RhbXBcbiAqIEByZXR1cm5zIEZpbHRlciBvYmplY3QgZm9yIGtpbmQgMjQxMzMgZXZlbnRzIHRhZ2dlZCB0byB1c1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2VGaWx0ZXIoXG4gIGNsaWVudFB1YmtleTogc3RyaW5nLFxuICBzaW5jZT86IG51bWJlclxuKTogeyBraW5kczogbnVtYmVyW107ICcjcCc6IHN0cmluZ1tdOyBzaW5jZT86IG51bWJlciB9IHtcbiAgY29uc3QgZmlsdGVyOiB7IGtpbmRzOiBudW1iZXJbXTsgJyNwJzogc3RyaW5nW107IHNpbmNlPzogbnVtYmVyIH0gPSB7XG4gICAga2luZHM6IFsyNDEzM10sXG4gICAgJyNwJzogW2NsaWVudFB1YmtleV0sXG4gIH07XG4gIGlmIChzaW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZmlsdGVyLnNpbmNlID0gc2luY2U7XG4gIH1cbiAgcmV0dXJuIGZpbHRlcjtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtNDlcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtNDkgKFByaXZhdGUgS2V5IEVuY3J5cHRpb24gLyBuY3J5cHRzZWMpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ5Lm1kXG4gKi9cblxuaW1wb3J0IHsgeGNoYWNoYTIwcG9seTEzMDUgfSBmcm9tICdAbm9ibGUvY2lwaGVycy9jaGFjaGEuanMnO1xuaW1wb3J0IHsgc2NyeXB0IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zY3J5cHQuanMnO1xuaW1wb3J0IHsgY29uY2F0Qnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBiZWNoMzIgYXMgc2N1cmVCZWNoMzIgfSBmcm9tICdAc2N1cmUvYmFzZSc7XG5cbnR5cGUgS2V5U2VjdXJpdHlCeXRlID0gMHgwMCB8IDB4MDEgfCAweDAyO1xuXG4vKipcbiAqIEVuY3J5cHQgYSBOb3N0ciBwcml2YXRlIGtleSB3aXRoIGEgcGFzc3dvcmQsIHByb2R1Y2luZyBhbiBuY3J5cHRzZWMgYmVjaDMyIHN0cmluZ1xuICogQHBhcmFtIHNlYyAtIDMyLWJ5dGUgc2VjcmV0IGtleVxuICogQHBhcmFtIHBhc3N3b3JkIC0gUGFzc3dvcmQgZm9yIGVuY3J5cHRpb25cbiAqIEBwYXJhbSBsb2duIC0gU2NyeXB0IGxvZzIoTikgcGFyYW1ldGVyIChkZWZhdWx0OiAxNiwgbWVhbmluZyBOPTY1NTM2KVxuICogQHBhcmFtIGtzYiAtIEtleSBzZWN1cml0eSBieXRlOiAweDAwPXVua25vd24sIDB4MDE9dW5zYWZlLCAweDAyPXNhZmUgKGRlZmF1bHQ6IDB4MDIpXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuY3J5cHRzZWMgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNyeXB0KFxuICBzZWM6IFVpbnQ4QXJyYXksXG4gIHBhc3N3b3JkOiBzdHJpbmcsXG4gIGxvZ246IG51bWJlciA9IDE2LFxuICBrc2I6IEtleVNlY3VyaXR5Qnl0ZSA9IDB4MDJcbik6IHN0cmluZyB7XG4gIGNvbnN0IHNhbHQgPSByYW5kb21CeXRlcygxNik7XG4gIGNvbnN0IG4gPSAyICoqIGxvZ247XG4gIGNvbnN0IG5vcm1hbGl6ZWRQYXNzd29yZCA9IHBhc3N3b3JkLm5vcm1hbGl6ZSgnTkZLQycpO1xuICBjb25zdCBrZXkgPSBzY3J5cHQobm9ybWFsaXplZFBhc3N3b3JkLCBzYWx0LCB7IE46IG4sIHI6IDgsIHA6IDEsIGRrTGVuOiAzMiB9KTtcbiAgY29uc3Qgbm9uY2UgPSByYW5kb21CeXRlcygyNCk7XG4gIGNvbnN0IGFhZCA9IFVpbnQ4QXJyYXkuZnJvbShba3NiXSk7XG4gIGNvbnN0IGNpcGhlciA9IHhjaGFjaGEyMHBvbHkxMzA1KGtleSwgbm9uY2UsIGFhZCk7XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBjaXBoZXIuZW5jcnlwdChzZWMpO1xuICAvLyBCaW5hcnkgZm9ybWF0OiB2ZXJzaW9uKDEpICsgbG9nbigxKSArIHNhbHQoMTYpICsgbm9uY2UoMjQpICsga3NiKDEpICsgY2lwaGVydGV4dCg0OCA9IDMyICsgMTYgdGFnKVxuICBjb25zdCBwYXlsb2FkID0gY29uY2F0Qnl0ZXMoXG4gICAgVWludDhBcnJheS5mcm9tKFsweDAyXSksXG4gICAgVWludDhBcnJheS5mcm9tKFtsb2duXSksXG4gICAgc2FsdCxcbiAgICBub25jZSxcbiAgICBhYWQsXG4gICAgY2lwaGVydGV4dFxuICApO1xuICBjb25zdCB3b3JkcyA9IHNjdXJlQmVjaDMyLnRvV29yZHMocGF5bG9hZCk7XG4gIHJldHVybiBzY3VyZUJlY2gzMi5lbmNvZGUoJ25jcnlwdHNlYycsIHdvcmRzLCAyMDApO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gbmNyeXB0c2VjIGJlY2gzMiBzdHJpbmcgYmFjayB0byB0aGUgMzItYnl0ZSBzZWNyZXQga2V5XG4gKiBAcGFyYW0gbmNyeXB0c2VjIC0gYmVjaDMyLWVuY29kZWQgbmNyeXB0c2VjIHN0cmluZ1xuICogQHBhcmFtIHBhc3N3b3JkIC0gUGFzc3dvcmQgdXNlZCBmb3IgZW5jcnlwdGlvblxuICogQHJldHVybnMgMzItYnl0ZSBzZWNyZXQga2V5IGFzIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY3J5cHQobmNyeXB0c2VjOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgeyBwcmVmaXgsIHdvcmRzIH0gPSBzY3VyZUJlY2gzMi5kZWNvZGUobmNyeXB0c2VjIGFzIGAke3N0cmluZ30xJHtzdHJpbmd9YCwgMjAwKTtcbiAgaWYgKHByZWZpeCAhPT0gJ25jcnlwdHNlYycpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBuY3J5cHRzZWMgcHJlZml4Jyk7XG4gIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShzY3VyZUJlY2gzMi5mcm9tV29yZHMod29yZHMpKTtcbiAgY29uc3QgdmVyc2lvbiA9IGRhdGFbMF07XG4gIGlmICh2ZXJzaW9uICE9PSAweDAyKSB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gbmNyeXB0c2VjIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcbiAgY29uc3QgbG9nbiA9IGRhdGFbMV07XG4gIGNvbnN0IHNhbHQgPSBkYXRhLnN1YmFycmF5KDIsIDE4KTtcbiAgY29uc3Qgbm9uY2UgPSBkYXRhLnN1YmFycmF5KDE4LCA0Mik7XG4gIGNvbnN0IGtzYiA9IGRhdGFbNDJdO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gZGF0YS5zdWJhcnJheSg0Myk7XG4gIGNvbnN0IG4gPSAyICoqIGxvZ247XG4gIGNvbnN0IG5vcm1hbGl6ZWRQYXNzd29yZCA9IHBhc3N3b3JkLm5vcm1hbGl6ZSgnTkZLQycpO1xuICBjb25zdCBrZXkgPSBzY3J5cHQobm9ybWFsaXplZFBhc3N3b3JkLCBzYWx0LCB7IE46IG4sIHI6IDgsIHA6IDEsIGRrTGVuOiAzMiB9KTtcbiAgY29uc3QgYWFkID0gVWludDhBcnJheS5mcm9tKFtrc2JdKTtcbiAgY29uc3QgY2lwaGVyID0geGNoYWNoYTIwcG9seTEzMDUoa2V5LCBub25jZSwgYWFkKTtcbiAgcmV0dXJuIGNpcGhlci5kZWNyeXB0KGNpcGhlcnRleHQpO1xufVxuIiwgIi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnMgZm9yIGVuY29kaW5nIGFuZCBkZWNvZGluZyBkYXRhXG4gKi9cblxuLyoqXG4gKiBDb252ZXJ0IGEgaGV4IHN0cmluZyB0byBVaW50OEFycmF5XG4gKiBAcGFyYW0gaGV4IEhleCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVWludDhBcnJheSBvZiBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXg6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoaGV4Lmxlbmd0aCAvIDIpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGV4Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGJ5dGVzW2kgLyAyXSA9IHBhcnNlSW50KGhleC5zbGljZShpLCBpICsgMiksIDE2KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVWludDhBcnJheSB0byBoZXggc3RyaW5nXG4gKiBAcGFyYW0gYnl0ZXMgVWludDhBcnJheSB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBIZXggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvSGV4KGJ5dGVzOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShieXRlcylcbiAgICAgICAgLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpXG4gICAgICAgIC5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgVVRGLTggc3RyaW5nIHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBzdHIgVVRGLTggc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgb2YgYnl0ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0cjogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzdHIpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVWludDhBcnJheSB0byBVVEYtOCBzdHJpbmdcbiAqIEBwYXJhbSBieXRlcyBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVURi04IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb1V0ZjgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYnl0ZXMpO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE1BTVc7QUFOWDtBQUFBO0FBTU8sTUFBSSxVQUFVO0FBQUEsUUFDakIsS0FBSyxFQUFFLFVBQVUsY0FBYyxXQUFXLE9BQU87QUFBQSxRQUNqRCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsUUFDVCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixVQUFVLFNBQVUsSUFBSTtBQUNwQixjQUFJLE9BQU8sTUFBTSxVQUFVLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFDbEQsa0JBQVEsUUFBUSxFQUFFLEtBQUssV0FBWTtBQUFFLGVBQUcsTUFBTSxNQUFNLElBQUk7QUFBQSxVQUFHLENBQUM7QUFBQSxRQUNoRTtBQUFBLE1BQ0o7QUFBQTtBQUFBOzs7QUNoQkE7QUFBQTtBQUFBO0FBQUE7QUFDQSxlQUFTLGFBQWMsR0FBRztBQUN4QixZQUFJO0FBQUUsaUJBQU8sS0FBSyxVQUFVLENBQUM7QUFBQSxRQUFFLFNBQVEsR0FBRztBQUFFLGlCQUFPO0FBQUEsUUFBZTtBQUFBLE1BQ3BFO0FBRUEsYUFBTyxVQUFVO0FBRWpCLGVBQVMsT0FBTyxHQUFHLE1BQU0sTUFBTTtBQUM3QixZQUFJLEtBQU0sUUFBUSxLQUFLLGFBQWM7QUFDckMsWUFBSSxTQUFTO0FBQ2IsWUFBSSxPQUFPLE1BQU0sWUFBWSxNQUFNLE1BQU07QUFDdkMsY0FBSSxNQUFNLEtBQUssU0FBUztBQUN4QixjQUFJLFFBQVEsRUFBRyxRQUFPO0FBQ3RCLGNBQUksVUFBVSxJQUFJLE1BQU0sR0FBRztBQUMzQixrQkFBUSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ2pCLG1CQUFTLFFBQVEsR0FBRyxRQUFRLEtBQUssU0FBUztBQUN4QyxvQkFBUSxLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztBQUFBLFVBQ2pDO0FBQ0EsaUJBQU8sUUFBUSxLQUFLLEdBQUc7QUFBQSxRQUN6QjtBQUNBLFlBQUksT0FBTyxNQUFNLFVBQVU7QUFDekIsaUJBQU87QUFBQSxRQUNUO0FBQ0EsWUFBSSxTQUFTLEtBQUs7QUFDbEIsWUFBSSxXQUFXLEVBQUcsUUFBTztBQUN6QixZQUFJLE1BQU07QUFDVixZQUFJLElBQUksSUFBSTtBQUNaLFlBQUksVUFBVTtBQUNkLFlBQUksT0FBUSxLQUFLLEVBQUUsVUFBVztBQUM5QixpQkFBUyxJQUFJLEdBQUcsSUFBSSxRQUFPO0FBQ3pCLGNBQUksRUFBRSxXQUFXLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxNQUFNO0FBQzFDLHNCQUFVLFVBQVUsS0FBSyxVQUFVO0FBQ25DLG9CQUFRLEVBQUUsV0FBVyxJQUFJLENBQUMsR0FBRztBQUFBLGNBQzNCLEtBQUs7QUFBQTtBQUFBLGNBQ0wsS0FBSztBQUNILG9CQUFJLEtBQUs7QUFDUDtBQUNGLG9CQUFJLEtBQUssQ0FBQyxLQUFLLEtBQU87QUFDdEIsb0JBQUksVUFBVTtBQUNaLHlCQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0IsdUJBQU8sT0FBTyxLQUFLLENBQUMsQ0FBQztBQUNyQiwwQkFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUNILG9CQUFJLEtBQUs7QUFDUDtBQUNGLG9CQUFJLEtBQUssQ0FBQyxLQUFLLEtBQU87QUFDdEIsb0JBQUksVUFBVTtBQUNaLHlCQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0IsdUJBQU8sS0FBSyxNQUFNLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNqQywwQkFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUFBO0FBQUEsY0FDTCxLQUFLO0FBQUE7QUFBQSxjQUNMLEtBQUs7QUFDSCxvQkFBSSxLQUFLO0FBQ1A7QUFDRixvQkFBSSxLQUFLLENBQUMsTUFBTSxPQUFXO0FBQzNCLG9CQUFJLFVBQVU7QUFDWix5QkFBTyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzNCLG9CQUFJLE9BQU8sT0FBTyxLQUFLLENBQUM7QUFDeEIsb0JBQUksU0FBUyxVQUFVO0FBQ3JCLHlCQUFPLE1BQU8sS0FBSyxDQUFDLElBQUk7QUFDeEIsNEJBQVUsSUFBSTtBQUNkO0FBQ0E7QUFBQSxnQkFDRjtBQUNBLG9CQUFJLFNBQVMsWUFBWTtBQUN2Qix5QkFBTyxLQUFLLENBQUMsRUFBRSxRQUFRO0FBQ3ZCLDRCQUFVLElBQUk7QUFDZDtBQUNBO0FBQUEsZ0JBQ0Y7QUFDQSx1QkFBTyxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQ2pCLDBCQUFVLElBQUk7QUFDZDtBQUNBO0FBQUEsY0FDRixLQUFLO0FBQ0gsb0JBQUksS0FBSztBQUNQO0FBQ0Ysb0JBQUksVUFBVTtBQUNaLHlCQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0IsdUJBQU8sT0FBTyxLQUFLLENBQUMsQ0FBQztBQUNyQiwwQkFBVSxJQUFJO0FBQ2Q7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUNILG9CQUFJLFVBQVU7QUFDWix5QkFBTyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzNCLHVCQUFPO0FBQ1AsMEJBQVUsSUFBSTtBQUNkO0FBQ0E7QUFDQTtBQUFBLFlBQ0o7QUFDQSxjQUFFO0FBQUEsVUFDSjtBQUNBLFlBQUU7QUFBQSxRQUNKO0FBQ0EsWUFBSSxZQUFZO0FBQ2QsaUJBQU87QUFBQSxpQkFDQSxVQUFVLE1BQU07QUFDdkIsaUJBQU8sRUFBRSxNQUFNLE9BQU87QUFBQSxRQUN4QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBQUE7QUFBQTs7O0FDNUdBO0FBQUE7QUFBQTtBQUFBO0FBRUEsVUFBTSxTQUFTO0FBRWYsYUFBTyxVQUFVQTtBQUVqQixVQUFNLFdBQVcsdUJBQXVCLEVBQUUsV0FBVyxDQUFDO0FBQ3RELFVBQU0saUJBQWlCO0FBQUEsUUFDckIsZ0JBQWdCO0FBQUEsUUFDaEIsaUJBQWlCO0FBQUEsUUFDakIsdUJBQXVCO0FBQUEsUUFDdkIsd0JBQXdCO0FBQUEsUUFDeEIscUJBQXFCO0FBQUEsUUFDckIsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsY0FBYztBQUFBLE1BQ2hCO0FBQ0EsZUFBUyxhQUFjLE9BQU9DLFNBQVE7QUFDcEMsZUFBTyxVQUFVLFdBQ2IsV0FDQUEsUUFBTyxPQUFPLE9BQU8sS0FBSztBQUFBLE1BQ2hDO0FBQ0EsVUFBTSx3QkFBd0IsdUJBQU8sZUFBZTtBQUNwRCxVQUFNLGtCQUFrQix1QkFBTyxnQkFBZ0I7QUFFL0MsVUFBTSxpQkFBaUI7QUFBQSxRQUNyQixPQUFPO0FBQUEsUUFDUCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsUUFDUCxPQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsa0JBQW1CLGNBQWMsYUFBYTtBQUNyRCxjQUFNLFdBQVc7QUFBQSxVQUNmLFFBQVE7QUFBQSxVQUNSLFFBQVEsYUFBYSxlQUFlO0FBQUEsUUFDdEM7QUFDQSxvQkFBWSxlQUFlLElBQUk7QUFBQSxNQUNqQztBQUVBLGVBQVMsc0JBQXVCQSxTQUFRLFFBQVEsT0FBTztBQUNyRCxjQUFNLGVBQWUsQ0FBQztBQUN0QixlQUFPLFFBQVEsV0FBUztBQUN0Qix1QkFBYSxLQUFLLElBQUksTUFBTSxLQUFLLElBQUksTUFBTSxLQUFLLElBQUssU0FBUyxLQUFLLEtBQUssU0FBUyxlQUFlLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFBQSxRQUN0SCxDQUFDO0FBQ0QsUUFBQUEsUUFBTyxxQkFBcUIsSUFBSTtBQUFBLE1BQ2xDO0FBRUEsZUFBUyxnQkFBaUIsV0FBVyxhQUFhO0FBQ2hELFlBQUksTUFBTSxRQUFRLFNBQVMsR0FBRztBQUM1QixnQkFBTSxjQUFjLFVBQVUsT0FBTyxTQUFVLEdBQUc7QUFDaEQsbUJBQU8sTUFBTTtBQUFBLFVBQ2YsQ0FBQztBQUNELGlCQUFPO0FBQUEsUUFDVCxXQUFXLGNBQWMsTUFBTTtBQUM3QixpQkFBTyxPQUFPLEtBQUssV0FBVztBQUFBLFFBQ2hDO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTRCxNQUFNLE1BQU07QUFDbkIsZUFBTyxRQUFRLENBQUM7QUFDaEIsYUFBSyxVQUFVLEtBQUssV0FBVyxDQUFDO0FBRWhDLGNBQU1FLFlBQVcsS0FBSyxRQUFRO0FBQzlCLFlBQUlBLGFBQVksT0FBT0EsVUFBUyxTQUFTLFlBQVk7QUFBRSxnQkFBTSxNQUFNLGlEQUFpRDtBQUFBLFFBQUU7QUFFdEgsY0FBTSxRQUFRLEtBQUssUUFBUSxTQUFTO0FBQ3BDLFlBQUksS0FBSyxRQUFRLE1BQU8sTUFBSyxRQUFRLFdBQVc7QUFDaEQsY0FBTSxjQUFjLEtBQUssZUFBZSxDQUFDO0FBQ3pDLGNBQU0sWUFBWSxnQkFBZ0IsS0FBSyxRQUFRLFdBQVcsV0FBVztBQUNyRSxZQUFJLGtCQUFrQixLQUFLLFFBQVE7QUFFbkMsWUFDRSxNQUFNLFFBQVEsS0FBSyxRQUFRLFNBQVMsS0FDcEMsS0FBSyxRQUFRLFVBQVUsUUFBUSxxQkFBcUIsSUFBSSxHQUN4RCxtQkFBa0I7QUFFcEIsY0FBTSxlQUFlLE9BQU8sS0FBSyxLQUFLLGdCQUFnQixDQUFDLENBQUM7QUFDeEQsY0FBTSxTQUFTLENBQUMsU0FBUyxTQUFTLFFBQVEsUUFBUSxTQUFTLE9BQU8sRUFBRSxPQUFPLFlBQVk7QUFFdkYsWUFBSSxPQUFPLFVBQVUsWUFBWTtBQUMvQixpQkFBTyxRQUFRLFNBQVVDLFFBQU87QUFDOUIsa0JBQU1BLE1BQUssSUFBSTtBQUFBLFVBQ2pCLENBQUM7QUFBQSxRQUNIO0FBQ0EsWUFBSSxLQUFLLFlBQVksU0FBUyxLQUFLLFFBQVEsU0FBVSxNQUFLLFFBQVE7QUFDbEUsY0FBTSxRQUFRLEtBQUssU0FBUztBQUM1QixjQUFNRixVQUFTLE9BQU8sT0FBTyxLQUFLO0FBQ2xDLFlBQUksQ0FBQ0EsUUFBTyxJQUFLLENBQUFBLFFBQU8sTUFBTTtBQUU5Qiw4QkFBc0JBLFNBQVEsUUFBUSxLQUFLO0FBRTNDLDBCQUFrQixDQUFDLEdBQUdBLE9BQU07QUFFNUIsZUFBTyxlQUFlQSxTQUFRLFlBQVk7QUFBQSxVQUN4QyxLQUFLO0FBQUEsUUFDUCxDQUFDO0FBQ0QsZUFBTyxlQUFlQSxTQUFRLFNBQVM7QUFBQSxVQUNyQyxLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQUEsUUFDUCxDQUFDO0FBRUQsY0FBTSxVQUFVO0FBQUEsVUFDZCxVQUFBQztBQUFBLFVBQ0E7QUFBQSxVQUNBLFVBQVUsS0FBSyxRQUFRO0FBQUEsVUFDdkIsc0JBQXNCLEtBQUssUUFBUTtBQUFBLFVBQ25DLFlBQVksS0FBSyxRQUFRO0FBQUEsVUFDekIsY0FBYyxLQUFLLFFBQVE7QUFBQSxVQUMzQjtBQUFBLFVBQ0EsV0FBVyxnQkFBZ0IsSUFBSTtBQUFBLFVBQy9CLFlBQVksS0FBSyxjQUFjO0FBQUEsVUFDL0IsU0FBUyxLQUFLLFdBQVc7QUFBQSxRQUMzQjtBQUNBLFFBQUFELFFBQU8sU0FBUyxVQUFVLElBQUk7QUFDOUIsUUFBQUEsUUFBTyxRQUFRO0FBRWYsUUFBQUEsUUFBTyxpQkFBaUIsU0FBVUUsUUFBTztBQUN2QyxjQUFJLENBQUMsS0FBSyxPQUFPLE9BQU9BLE1BQUssR0FBRztBQUM5QixtQkFBTztBQUFBLFVBQ1Q7QUFFQSxpQkFBTyxLQUFLLE9BQU8sT0FBT0EsTUFBSyxLQUFLLEtBQUssT0FBTyxPQUFPLEtBQUssS0FBSztBQUFBLFFBQ25FO0FBQ0EsUUFBQUYsUUFBTyxrQkFBa0JBLFFBQU8sa0JBQ2hDQSxRQUFPLE9BQU9BLFFBQU8sY0FBY0EsUUFBTyxLQUMxQ0EsUUFBTyxrQkFBa0JBLFFBQU8sT0FDaENBLFFBQU8sc0JBQXNCQSxRQUFPLGlCQUNwQ0EsUUFBTyxxQkFBcUJBLFFBQU8sWUFDbkNBLFFBQU8sZ0JBQWdCQSxRQUFPLGFBQzlCQSxRQUFPLFFBQVFBLFFBQU8sUUFBUTtBQUM5QixRQUFBQSxRQUFPLGNBQWM7QUFDckIsUUFBQUEsUUFBTyxhQUFhO0FBQ3BCLFFBQUFBLFFBQU8sbUJBQW1CO0FBQzFCLFFBQUFBLFFBQU8sUUFBUSxZQUFhLE1BQU07QUFBRSxpQkFBTyxNQUFNLEtBQUssTUFBTSxTQUFTLEdBQUcsSUFBSTtBQUFBLFFBQUU7QUFFOUUsWUFBSUMsVUFBVSxDQUFBRCxRQUFPLFlBQVksb0JBQW9CO0FBRXJELGlCQUFTLGNBQWU7QUFDdEIsaUJBQU8sYUFBYSxLQUFLLE9BQU8sSUFBSTtBQUFBLFFBQ3RDO0FBRUEsaUJBQVMsV0FBWTtBQUNuQixpQkFBTyxLQUFLO0FBQUEsUUFDZDtBQUNBLGlCQUFTLFNBQVVFLFFBQU87QUFDeEIsY0FBSUEsV0FBVSxZQUFZLENBQUMsS0FBSyxPQUFPLE9BQU9BLE1BQUssR0FBRztBQUNwRCxrQkFBTSxNQUFNLG1CQUFtQkEsTUFBSztBQUFBLFVBQ3RDO0FBQ0EsZUFBSyxTQUFTQTtBQUVkLGNBQUksTUFBTSxTQUFTRixTQUFRLE9BQU87QUFDbEMsY0FBSSxNQUFNLFNBQVNBLFNBQVEsT0FBTztBQUNsQyxjQUFJLE1BQU0sU0FBU0EsU0FBUSxNQUFNO0FBQ2pDLGNBQUksTUFBTSxTQUFTQSxTQUFRLE1BQU07QUFDakMsY0FBSSxNQUFNLFNBQVNBLFNBQVEsT0FBTztBQUNsQyxjQUFJLE1BQU0sU0FBU0EsU0FBUSxPQUFPO0FBRWxDLHVCQUFhLFFBQVEsQ0FBQ0UsV0FBVTtBQUM5QixnQkFBSSxNQUFNLFNBQVNGLFNBQVFFLE1BQUs7QUFBQSxVQUNsQyxDQUFDO0FBQUEsUUFDSDtBQUVBLGlCQUFTLE1BQU9DLFVBQVMsVUFBVSxjQUFjO0FBQy9DLGNBQUksQ0FBQyxVQUFVO0FBQ2Isa0JBQU0sSUFBSSxNQUFNLGlDQUFpQztBQUFBLFVBQ25EO0FBQ0EseUJBQWUsZ0JBQWdCLENBQUM7QUFDaEMsY0FBSSxhQUFhLFNBQVMsYUFBYTtBQUNyQyx5QkFBYSxjQUFjLFNBQVM7QUFBQSxVQUN0QztBQUNBLGdCQUFNLDBCQUEwQixhQUFhO0FBQzdDLGNBQUksYUFBYSx5QkFBeUI7QUFDeEMsZ0JBQUksbUJBQW1CLE9BQU8sT0FBTyxDQUFDLEdBQUcsYUFBYSx1QkFBdUI7QUFDN0UsZ0JBQUksaUJBQWlCLEtBQUssUUFBUSxjQUFjLE9BQzVDLE9BQU8sS0FBSyxnQkFBZ0IsSUFDNUI7QUFDSixtQkFBTyxTQUFTO0FBQ2hCLDZCQUFpQixDQUFDLFFBQVEsR0FBRyxnQkFBZ0Isa0JBQWtCLEtBQUssZ0JBQWdCO0FBQUEsVUFDdEY7QUFDQSxtQkFBUyxNQUFPLFFBQVE7QUFDdEIsaUJBQUssZUFBZSxPQUFPLGNBQWMsS0FBSztBQUc5QyxpQkFBSyxXQUFXO0FBRWhCLGdCQUFJLGtCQUFrQjtBQUNwQixtQkFBSyxjQUFjO0FBQ25CLG1CQUFLLGFBQWE7QUFBQSxZQUNwQjtBQUNBLGdCQUFJRixXQUFVO0FBQ1osbUJBQUssWUFBWTtBQUFBLGdCQUNmLENBQUMsRUFBRSxPQUFPLE9BQU8sVUFBVSxVQUFVLFFBQVE7QUFBQSxjQUMvQztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQ0EsZ0JBQU0sWUFBWTtBQUNsQixnQkFBTSxZQUFZLElBQUksTUFBTSxJQUFJO0FBR2hDLDRCQUFrQixNQUFNLFNBQVM7QUFDakMsb0JBQVUsUUFBUSxZQUFhLE1BQU07QUFBRSxtQkFBTyxNQUFNLEtBQUssTUFBTUUsVUFBUyxHQUFHLElBQUk7QUFBQSxVQUFFO0FBRWpGLG9CQUFVLFFBQVEsYUFBYSxTQUFTLEtBQUs7QUFDN0MsVUFBQUEsU0FBUSxRQUFRLFNBQVM7QUFFekIsaUJBQU87QUFBQSxRQUNUO0FBQ0EsZUFBT0g7QUFBQSxNQUNUO0FBRUEsZUFBUyxVQUFXLE1BQU07QUFDeEIsY0FBTSxlQUFlLEtBQUssZ0JBQWdCLENBQUM7QUFFM0MsY0FBTSxTQUFTLE9BQU8sT0FBTyxDQUFDLEdBQUdELE1BQUssT0FBTyxRQUFRLFlBQVk7QUFDakUsY0FBTSxTQUFTLE9BQU8sT0FBTyxDQUFDLEdBQUdBLE1BQUssT0FBTyxRQUFRLGFBQWEsWUFBWSxDQUFDO0FBRS9FLGVBQU87QUFBQSxVQUNMO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsZUFBUyxhQUFjLEtBQUs7QUFDMUIsY0FBTSxXQUFXLENBQUM7QUFDbEIsZUFBTyxLQUFLLEdBQUcsRUFBRSxRQUFRLFNBQVUsS0FBSztBQUN0QyxtQkFBUyxJQUFJLEdBQUcsQ0FBQyxJQUFJO0FBQUEsUUFDdkIsQ0FBQztBQUNELGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsTUFBSyxTQUFTO0FBQUEsUUFDWixRQUFRO0FBQUEsVUFDTixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsVUFDUCxPQUFPO0FBQUEsUUFDVDtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFVBQ0osSUFBSTtBQUFBLFFBQ047QUFBQSxNQUNGO0FBRUEsTUFBQUEsTUFBSyxpQkFBaUI7QUFDdEIsTUFBQUEsTUFBSyxtQkFBbUIsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsV0FBVyxVQUFVLFFBQVEsQ0FBQztBQUVwRixlQUFTLGdCQUFpQkMsU0FBUTtBQUNoQyxjQUFNLFdBQVcsQ0FBQztBQUNsQixZQUFJQSxRQUFPLFVBQVU7QUFDbkIsbUJBQVMsS0FBS0EsUUFBTyxRQUFRO0FBQUEsUUFDL0I7QUFHQSxZQUFJLFlBQVlBLFFBQU8sZUFBZTtBQUN0QyxlQUFPLFVBQVUsUUFBUTtBQUN2QixzQkFBWSxVQUFVO0FBQ3RCLGNBQUksVUFBVSxPQUFPLFVBQVU7QUFDN0IscUJBQVMsS0FBSyxVQUFVLE9BQU8sUUFBUTtBQUFBLFVBQ3pDO0FBQUEsUUFDRjtBQUVBLGVBQU8sU0FBUyxRQUFRO0FBQUEsTUFDMUI7QUFFQSxlQUFTLElBQUtJLE9BQU0sTUFBTSxZQUFZLE9BQU87QUFFM0MsZUFBTyxlQUFlQSxPQUFNLE9BQU87QUFBQSxVQUNqQyxPQUFRLGFBQWFBLE1BQUssT0FBTyxVQUFVLElBQUksYUFBYSxPQUFPLFVBQVUsSUFDekUsT0FDQSxXQUFXLHFCQUFxQixFQUFFLEtBQUs7QUFBQSxVQUMzQyxVQUFVO0FBQUEsVUFDVixZQUFZO0FBQUEsVUFDWixjQUFjO0FBQUEsUUFDaEIsQ0FBQztBQUVELFlBQUlBLE1BQUssS0FBSyxNQUFNLE1BQU07QUFDeEIsY0FBSSxDQUFDLEtBQUssU0FBVTtBQUVwQixnQkFBTSxnQkFBZ0IsS0FBSyxTQUFTLFNBQVNBLE1BQUs7QUFDbEQsZ0JBQU0sZ0JBQWdCLGFBQWEsZUFBZSxVQUFVO0FBQzVELGdCQUFNLGNBQWMsYUFBYSxPQUFPLFVBQVU7QUFDbEQsY0FBSSxjQUFjLGNBQWU7QUFBQSxRQUNuQztBQUdBLFFBQUFBLE1BQUssS0FBSyxJQUFJLFdBQVdBLE9BQU0sTUFBTSxZQUFZLEtBQUs7QUFHdEQsY0FBTSxXQUFXLGdCQUFnQkEsS0FBSTtBQUNyQyxZQUFJLFNBQVMsV0FBVyxHQUFHO0FBRXpCO0FBQUEsUUFDRjtBQUNBLFFBQUFBLE1BQUssS0FBSyxJQUFJLDJCQUEyQixVQUFVQSxNQUFLLEtBQUssQ0FBQztBQUFBLE1BQ2hFO0FBRUEsZUFBUywyQkFBNEIsVUFBVSxTQUFTO0FBQ3RELGVBQU8sV0FBWTtBQUNqQixpQkFBTyxRQUFRLE1BQU0sTUFBTSxDQUFDLEdBQUcsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUFBLFFBQ3hEO0FBQUEsTUFDRjtBQUVBLGVBQVMsV0FBWUEsT0FBTSxNQUFNLFlBQVksT0FBTztBQUNsRCxlQUFRLDBCQUFVLE9BQU87QUFDdkIsaUJBQU8sU0FBUyxNQUFPO0FBQ3JCLGtCQUFNLEtBQUssS0FBSyxVQUFVO0FBQzFCLGtCQUFNLE9BQU8sSUFBSSxNQUFNLFVBQVUsTUFBTTtBQUN2QyxrQkFBTSxRQUFTLE9BQU8sa0JBQWtCLE9BQU8sZUFBZSxJQUFJLE1BQU0sV0FBWSxXQUFXO0FBQy9GLHFCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxJQUFLLE1BQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQztBQUUzRCxnQkFBSSxtQkFBbUI7QUFDdkIsZ0JBQUksS0FBSyxXQUFXO0FBQ2xCLCtCQUFpQixNQUFNLEtBQUssWUFBWSxLQUFLLGFBQWEsS0FBSyxnQkFBZ0I7QUFDL0UsaUNBQW1CO0FBQUEsWUFDckI7QUFDQSxnQkFBSSxLQUFLLFlBQVksS0FBSyxZQUFZO0FBQ3BDLG9CQUFNLE1BQU0sU0FBUyxNQUFNLE9BQU8sTUFBTSxJQUFJLElBQUk7QUFDaEQsa0JBQUksS0FBSyxnQkFBZ0IsT0FBTyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUMsS0FBSyxPQUFPLElBQUksQ0FBQyxNQUFNLFVBQVU7QUFDdEYsb0JBQUk7QUFDRix3QkFBTSxTQUFTLGtCQUFrQjtBQUNqQyxzQkFBSSxPQUFRLEtBQUksQ0FBQyxFQUFFLFNBQVM7QUFBQSxnQkFDOUIsU0FBUyxHQUFHO0FBQUEsZ0JBQUM7QUFBQSxjQUNmO0FBQ0Esb0JBQU0sS0FBSyxPQUFPLEdBQUcsR0FBRztBQUFBLFlBQzFCLE9BQU87QUFDTCxrQkFBSSxLQUFLLGNBQWM7QUFDckIsb0JBQUk7QUFDRix3QkFBTSxTQUFTLGtCQUFrQjtBQUNqQyxzQkFBSSxPQUFRLE1BQUssS0FBSyxNQUFNO0FBQUEsZ0JBQzlCLFNBQVMsR0FBRztBQUFBLGdCQUFDO0FBQUEsY0FDZjtBQUNBLG9CQUFNLE1BQU0sT0FBTyxJQUFJO0FBQUEsWUFDekI7QUFFQSxnQkFBSSxLQUFLLFVBQVU7QUFDakIsb0JBQU0sZ0JBQWdCLEtBQUssU0FBUyxTQUFTQSxNQUFLO0FBQ2xELG9CQUFNLGdCQUFnQixhQUFhLGVBQWUsVUFBVTtBQUM1RCxvQkFBTSxjQUFjLGFBQWEsT0FBTyxVQUFVO0FBQ2xELGtCQUFJLGNBQWMsY0FBZTtBQUNqQyx1QkFBUyxNQUFNO0FBQUEsZ0JBQ2I7QUFBQSxnQkFDQSxhQUFhO0FBQUEsZ0JBQ2I7QUFBQSxnQkFDQTtBQUFBLGdCQUNBLGVBQWUsV0FBVyxPQUFPLE9BQU8sS0FBSyxTQUFTLFNBQVNBLE1BQUssTUFBTTtBQUFBLGdCQUMxRSxNQUFNLEtBQUssU0FBUztBQUFBLGdCQUNwQixLQUFLLGFBQWFBLE1BQUssUUFBUSxVQUFVO0FBQUEsY0FDM0MsR0FBRyxNQUFNLGdCQUFnQjtBQUFBLFlBQzNCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsR0FBR0EsTUFBSyxxQkFBcUIsRUFBRSxLQUFLLENBQUM7QUFBQSxNQUN2QztBQUVBLGVBQVMsU0FBVUosU0FBUSxPQUFPLE1BQU0sSUFBSSxNQUFNO0FBQ2hELGNBQU07QUFBQSxVQUNKLE9BQU87QUFBQSxVQUNQLEtBQUsscUJBQXFCLENBQUMsUUFBUTtBQUFBLFFBQ3JDLElBQUksS0FBSyxjQUFjLENBQUM7QUFDeEIsY0FBTSxhQUFhLEtBQUssTUFBTTtBQUM5QixZQUFJLE1BQU0sV0FBVyxDQUFDO0FBQ3RCLGNBQU0sWUFBWSxDQUFDO0FBRW5CLFlBQUksT0FBT0EsUUFBTyxjQUFjLEtBQUs7QUFDckMsWUFBSSxNQUFNLEVBQUcsT0FBTTtBQUVuQixZQUFJLElBQUk7QUFDTixvQkFBVSxPQUFPO0FBQUEsUUFDbkI7QUFFQSxZQUFJLGdCQUFnQjtBQUNsQixnQkFBTSxpQkFBaUIsZUFBZSxPQUFPQSxRQUFPLE9BQU8sT0FBTyxLQUFLLENBQUM7QUFDeEUsaUJBQU8sT0FBTyxXQUFXLGNBQWM7QUFBQSxRQUN6QyxPQUFPO0FBQ0wsb0JBQVUsUUFBUUEsUUFBTyxPQUFPLE9BQU8sS0FBSztBQUFBLFFBQzlDO0FBRUEsWUFBSSxLQUFLLHNCQUFzQjtBQUM3QixjQUFJLFFBQVEsUUFBUSxPQUFPLFFBQVEsVUFBVTtBQUMzQyxtQkFBTyxTQUFTLE9BQU8sV0FBVyxDQUFDLE1BQU0sVUFBVTtBQUNqRCxxQkFBTyxPQUFPLFdBQVcsV0FBVyxNQUFNLENBQUM7QUFBQSxZQUM3QztBQUFBLFVBQ0Y7QUFFQSxnQkFBTSxxQkFBcUIsbUJBQW1CLFNBQVM7QUFDdkQsaUJBQU8sQ0FBQyxvQkFBb0IsR0FBRyxVQUFVO0FBQUEsUUFDM0MsT0FBTztBQUVMLGNBQUksUUFBUSxRQUFRLE9BQU8sUUFBUSxVQUFVO0FBQzNDLG1CQUFPLFNBQVMsT0FBTyxXQUFXLENBQUMsTUFBTSxVQUFVO0FBQ2pELHFCQUFPLE9BQU8sV0FBVyxXQUFXLE1BQU0sQ0FBQztBQUFBLFlBQzdDO0FBQ0Esa0JBQU0sV0FBVyxTQUFTLE9BQU8sV0FBVyxNQUFNLEdBQUcsVUFBVSxJQUFJO0FBQUEsVUFDckUsV0FBVyxPQUFPLFFBQVEsU0FBVSxPQUFNLE9BQU8sV0FBVyxNQUFNLEdBQUcsVUFBVTtBQUMvRSxjQUFJLFFBQVEsT0FBVyxXQUFVLEtBQUssVUFBVSxJQUFJO0FBRXBELGdCQUFNLHFCQUFxQixtQkFBbUIsU0FBUztBQUN2RCxpQkFBTyxDQUFDLGtCQUFrQjtBQUFBLFFBQzVCO0FBQUEsTUFDRjtBQUVBLGVBQVMsaUJBQWtCLE1BQU0sV0FBVyxhQUFhLGlCQUFpQjtBQUN4RSxtQkFBVyxLQUFLLE1BQU07QUFDcEIsY0FBSSxtQkFBbUIsS0FBSyxDQUFDLGFBQWEsT0FBTztBQUMvQyxpQkFBSyxDQUFDLElBQUlELE1BQUssZUFBZSxJQUFJLEtBQUssQ0FBQyxDQUFDO0FBQUEsVUFDM0MsV0FBVyxPQUFPLEtBQUssQ0FBQyxNQUFNLFlBQVksQ0FBQyxNQUFNLFFBQVEsS0FBSyxDQUFDLENBQUMsS0FBSyxXQUFXO0FBQzlFLHVCQUFXLEtBQUssS0FBSyxDQUFDLEdBQUc7QUFDdkIsa0JBQUksVUFBVSxRQUFRLENBQUMsSUFBSSxNQUFNLEtBQUssYUFBYTtBQUNqRCxxQkFBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFBLGNBQ3hDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUVBLGVBQVMsU0FBVUMsU0FBUSxNQUFNLE1BQU0sbUJBQW1CLE9BQU87QUFDL0QsY0FBTSxPQUFPLEtBQUs7QUFDbEIsY0FBTSxLQUFLLEtBQUs7QUFDaEIsY0FBTSxjQUFjLEtBQUs7QUFDekIsY0FBTSxjQUFjLEtBQUs7QUFDekIsY0FBTSxNQUFNLEtBQUs7QUFDakIsY0FBTSxXQUFXQSxRQUFPLFVBQVU7QUFFbEMsWUFBSSxDQUFDLGtCQUFrQjtBQUNyQjtBQUFBLFlBQ0U7QUFBQSxZQUNBQSxRQUFPLGNBQWMsT0FBTyxLQUFLQSxRQUFPLFdBQVc7QUFBQSxZQUNuREEsUUFBTztBQUFBLFlBQ1BBLFFBQU8scUJBQXFCLFNBQVksT0FBT0EsUUFBTztBQUFBLFVBQ3hEO0FBQUEsUUFDRjtBQUVBLFFBQUFBLFFBQU8sVUFBVSxLQUFLO0FBQ3RCLFFBQUFBLFFBQU8sVUFBVSxXQUFXLEtBQUssT0FBTyxTQUFVLEtBQUs7QUFFckQsaUJBQU8sU0FBUyxRQUFRLEdBQUcsTUFBTTtBQUFBLFFBQ25DLENBQUM7QUFFRCxRQUFBQSxRQUFPLFVBQVUsTUFBTSxRQUFRO0FBQy9CLFFBQUFBLFFBQU8sVUFBVSxNQUFNLFFBQVE7QUFFL0IsYUFBSyxhQUFhQSxRQUFPLFdBQVcsR0FBRztBQUV2QyxRQUFBQSxRQUFPLFlBQVksb0JBQW9CLFFBQVE7QUFBQSxNQUNqRDtBQUVBLGVBQVMsb0JBQXFCLFVBQVU7QUFDdEMsZUFBTztBQUFBLFVBQ0wsSUFBSTtBQUFBLFVBQ0osVUFBVSxDQUFDO0FBQUEsVUFDWCxVQUFVLFlBQVksQ0FBQztBQUFBLFVBQ3ZCLE9BQU8sRUFBRSxPQUFPLElBQUksT0FBTyxFQUFFO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBRUEsZUFBUyxXQUFZLEtBQUs7QUFDeEIsY0FBTSxNQUFNO0FBQUEsVUFDVixNQUFNLElBQUksWUFBWTtBQUFBLFVBQ3RCLEtBQUssSUFBSTtBQUFBLFVBQ1QsT0FBTyxJQUFJO0FBQUEsUUFDYjtBQUNBLG1CQUFXLE9BQU8sS0FBSztBQUNyQixjQUFJLElBQUksR0FBRyxNQUFNLFFBQVc7QUFDMUIsZ0JBQUksR0FBRyxJQUFJLElBQUksR0FBRztBQUFBLFVBQ3BCO0FBQUEsUUFDRjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxnQkFBaUIsTUFBTTtBQUM5QixZQUFJLE9BQU8sS0FBSyxjQUFjLFlBQVk7QUFDeEMsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFDQSxZQUFJLEtBQUssY0FBYyxPQUFPO0FBQzVCLGlCQUFPO0FBQUEsUUFDVDtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxPQUFRO0FBQUUsZUFBTyxDQUFDO0FBQUEsTUFBRTtBQUM3QixlQUFTLFlBQWEsR0FBRztBQUFFLGVBQU87QUFBQSxNQUFFO0FBQ3BDLGVBQVMsT0FBUTtBQUFBLE1BQUM7QUFFbEIsZUFBUyxXQUFZO0FBQUUsZUFBTztBQUFBLE1BQU07QUFDcEMsZUFBUyxZQUFhO0FBQUUsZUFBTyxLQUFLLElBQUk7QUFBQSxNQUFFO0FBQzFDLGVBQVMsV0FBWTtBQUFFLGVBQU8sS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLEdBQU07QUFBQSxNQUFFO0FBQzlELGVBQVMsVUFBVztBQUFFLGVBQU8sSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEVBQUUsWUFBWTtBQUFBLE1BQUU7QUFJaEUsZUFBUyx5QkFBMEI7QUFDakMsaUJBQVMsS0FBTSxHQUFHO0FBQUUsaUJBQU8sT0FBTyxNQUFNLGVBQWU7QUFBQSxRQUFFO0FBQ3pELFlBQUk7QUFDRixjQUFJLE9BQU8sZUFBZSxZQUFhLFFBQU87QUFDOUMsaUJBQU8sZUFBZSxPQUFPLFdBQVcsY0FBYztBQUFBLFlBQ3BELEtBQUssV0FBWTtBQUNmLHFCQUFPLE9BQU8sVUFBVTtBQUN4QixxQkFBUSxLQUFLLGFBQWE7QUFBQSxZQUM1QjtBQUFBLFlBQ0EsY0FBYztBQUFBLFVBQ2hCLENBQUM7QUFDRCxpQkFBTztBQUFBLFFBQ1QsU0FBUyxHQUFHO0FBQ1YsaUJBQU8sS0FBSyxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssS0FBSyxJQUFJLEtBQUssQ0FBQztBQUFBLFFBQ3REO0FBQUEsTUFDRjtBQUdBLGFBQU8sUUFBUSxVQUFVRDtBQUN6QixhQUFPLFFBQVEsT0FBT0E7QUFJdEIsZUFBUyxvQkFBcUI7QUFDNUIsY0FBTSxRQUFTLElBQUksTUFBTSxFQUFHO0FBQzVCLFlBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsY0FBTSxRQUFRLE1BQU0sTUFBTSxJQUFJO0FBQzlCLGlCQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLGdCQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSztBQUV4QixjQUFJLDRFQUE0RSxLQUFLLENBQUMsRUFBRztBQUN6RixjQUFJLEVBQUUsUUFBUSxZQUFZLE1BQU0sR0FBSTtBQUNwQyxjQUFJLEVBQUUsUUFBUSxlQUFlLE1BQU0sR0FBSTtBQUN2QyxjQUFJLEVBQUUsUUFBUSxjQUFjLE1BQU0sR0FBSTtBQUV0QyxjQUFJLElBQUksRUFBRSxNQUFNLHVCQUF1QjtBQUN2QyxjQUFJLENBQUMsRUFBRyxLQUFJLEVBQUUsTUFBTSx3QkFBd0I7QUFDNUMsY0FBSSxHQUFHO0FBQ0wsa0JBQU0sT0FBTyxFQUFFLENBQUM7QUFDaEIsa0JBQU0sT0FBTyxFQUFFLENBQUM7QUFDaEIsa0JBQU0sTUFBTSxFQUFFLENBQUM7QUFDZixtQkFBTyxPQUFPLE1BQU0sT0FBTyxNQUFNO0FBQUEsVUFDbkM7QUFBQSxRQUNGO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFBQTtBQUFBOzs7QUNsaUJBO0FBQUE7QUFBQTtBQUFBLGFBQU8sVUFBVSxDQUFDO0FBQUE7QUFBQTs7O0FDQWxCO0FBQUE7QUFBQTtBQUFBO0FBQ0EsYUFBTyxlQUFlLFNBQVMsY0FBYyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQzVELGNBQVEsVUFBVSxRQUFRLFNBQVM7QUFDbkMsVUFBTSxXQUFXO0FBQ2pCLFVBQU0sZUFBZSxDQUFDO0FBQ3RCLGVBQVMsSUFBSSxHQUFHLElBQUksU0FBUyxRQUFRLEtBQUs7QUFDdEMsY0FBTSxJQUFJLFNBQVMsT0FBTyxDQUFDO0FBQzNCLHFCQUFhLENBQUMsSUFBSTtBQUFBLE1BQ3RCO0FBQ0EsZUFBUyxZQUFZLEtBQUs7QUFDdEIsY0FBTSxJQUFJLE9BQU87QUFDakIsZ0JBQVUsTUFBTSxhQUFjLElBQ3pCLEVBQUcsS0FBSyxJQUFLLEtBQUssWUFDbEIsRUFBRyxLQUFLLElBQUssS0FBSyxZQUNsQixFQUFHLEtBQUssSUFBSyxLQUFLLFlBQ2xCLEVBQUcsS0FBSyxJQUFLLEtBQUssYUFDbEIsRUFBRyxLQUFLLElBQUssS0FBSztBQUFBLE1BQzNCO0FBQ0EsZUFBUyxVQUFVLFFBQVE7QUFDdkIsWUFBSSxNQUFNO0FBQ1YsaUJBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEVBQUUsR0FBRztBQUNwQyxnQkFBTSxJQUFJLE9BQU8sV0FBVyxDQUFDO0FBQzdCLGNBQUksSUFBSSxNQUFNLElBQUk7QUFDZCxtQkFBTyxxQkFBcUIsU0FBUztBQUN6QyxnQkFBTSxZQUFZLEdBQUcsSUFBSyxLQUFLO0FBQUEsUUFDbkM7QUFDQSxjQUFNLFlBQVksR0FBRztBQUNyQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLFFBQVEsRUFBRSxHQUFHO0FBQ3BDLGdCQUFNLElBQUksT0FBTyxXQUFXLENBQUM7QUFDN0IsZ0JBQU0sWUFBWSxHQUFHLElBQUssSUFBSTtBQUFBLFFBQ2xDO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFDQSxlQUFTLFFBQVEsTUFBTSxRQUFRLFNBQVMsS0FBSztBQUN6QyxZQUFJLFFBQVE7QUFDWixZQUFJLE9BQU87QUFDWCxjQUFNLFFBQVEsS0FBSyxXQUFXO0FBQzlCLGNBQU0sU0FBUyxDQUFDO0FBQ2hCLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxFQUFFLEdBQUc7QUFDbEMsa0JBQVMsU0FBUyxTQUFVLEtBQUssQ0FBQztBQUNsQyxrQkFBUTtBQUNSLGlCQUFPLFFBQVEsU0FBUztBQUNwQixvQkFBUTtBQUNSLG1CQUFPLEtBQU0sU0FBUyxPQUFRLElBQUk7QUFBQSxVQUN0QztBQUFBLFFBQ0o7QUFDQSxZQUFJLEtBQUs7QUFDTCxjQUFJLE9BQU8sR0FBRztBQUNWLG1CQUFPLEtBQU0sU0FBVSxVQUFVLE9BQVMsSUFBSTtBQUFBLFVBQ2xEO0FBQUEsUUFDSixPQUNLO0FBQ0QsY0FBSSxRQUFRO0FBQ1IsbUJBQU87QUFDWCxjQUFLLFNBQVUsVUFBVSxPQUFTO0FBQzlCLG1CQUFPO0FBQUEsUUFDZjtBQUNBLGVBQU87QUFBQSxNQUNYO0FBQ0EsZUFBUyxRQUFRLE9BQU87QUFDcEIsZUFBTyxRQUFRLE9BQU8sR0FBRyxHQUFHLElBQUk7QUFBQSxNQUNwQztBQUNBLGVBQVMsZ0JBQWdCLE9BQU87QUFDNUIsY0FBTSxNQUFNLFFBQVEsT0FBTyxHQUFHLEdBQUcsS0FBSztBQUN0QyxZQUFJLE1BQU0sUUFBUSxHQUFHO0FBQ2pCLGlCQUFPO0FBQUEsTUFDZjtBQUNBLGVBQVMsVUFBVSxPQUFPO0FBQ3RCLGNBQU0sTUFBTSxRQUFRLE9BQU8sR0FBRyxHQUFHLEtBQUs7QUFDdEMsWUFBSSxNQUFNLFFBQVEsR0FBRztBQUNqQixpQkFBTztBQUNYLGNBQU0sSUFBSSxNQUFNLEdBQUc7QUFBQSxNQUN2QjtBQUNBLGVBQVMsdUJBQXVCLFVBQVU7QUFDdEMsWUFBSTtBQUNKLFlBQUksYUFBYSxVQUFVO0FBQ3ZCLDJCQUFpQjtBQUFBLFFBQ3JCLE9BQ0s7QUFDRCwyQkFBaUI7QUFBQSxRQUNyQjtBQUNBLGlCQUFTLE9BQU8sUUFBUSxPQUFPLE9BQU87QUFDbEMsa0JBQVEsU0FBUztBQUNqQixjQUFJLE9BQU8sU0FBUyxJQUFJLE1BQU0sU0FBUztBQUNuQyxrQkFBTSxJQUFJLFVBQVUsc0JBQXNCO0FBQzlDLG1CQUFTLE9BQU8sWUFBWTtBQUU1QixjQUFJLE1BQU0sVUFBVSxNQUFNO0FBQzFCLGNBQUksT0FBTyxRQUFRO0FBQ2Ysa0JBQU0sSUFBSSxNQUFNLEdBQUc7QUFDdkIsY0FBSSxTQUFTLFNBQVM7QUFDdEIsbUJBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEVBQUUsR0FBRztBQUNuQyxrQkFBTSxJQUFJLE1BQU0sQ0FBQztBQUNqQixnQkFBSSxLQUFLLE1BQU07QUFDWCxvQkFBTSxJQUFJLE1BQU0sZ0JBQWdCO0FBQ3BDLGtCQUFNLFlBQVksR0FBRyxJQUFJO0FBQ3pCLHNCQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsVUFDL0I7QUFDQSxtQkFBUyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRztBQUN4QixrQkFBTSxZQUFZLEdBQUc7QUFBQSxVQUN6QjtBQUNBLGlCQUFPO0FBQ1AsbUJBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUc7QUFDeEIsa0JBQU0sSUFBSyxRQUFTLElBQUksS0FBSyxJQUFNO0FBQ25DLHNCQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsVUFDL0I7QUFDQSxpQkFBTztBQUFBLFFBQ1g7QUFDQSxpQkFBUyxTQUFTLEtBQUssT0FBTztBQUMxQixrQkFBUSxTQUFTO0FBQ2pCLGNBQUksSUFBSSxTQUFTO0FBQ2IsbUJBQU8sTUFBTTtBQUNqQixjQUFJLElBQUksU0FBUztBQUNiLG1CQUFPO0FBRVgsZ0JBQU0sVUFBVSxJQUFJLFlBQVk7QUFDaEMsZ0JBQU0sVUFBVSxJQUFJLFlBQVk7QUFDaEMsY0FBSSxRQUFRLFdBQVcsUUFBUTtBQUMzQixtQkFBTyx1QkFBdUI7QUFDbEMsZ0JBQU07QUFDTixnQkFBTSxRQUFRLElBQUksWUFBWSxHQUFHO0FBQ2pDLGNBQUksVUFBVTtBQUNWLG1CQUFPLGdDQUFnQztBQUMzQyxjQUFJLFVBQVU7QUFDVixtQkFBTyx3QkFBd0I7QUFDbkMsZ0JBQU0sU0FBUyxJQUFJLE1BQU0sR0FBRyxLQUFLO0FBQ2pDLGdCQUFNLFlBQVksSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUNyQyxjQUFJLFVBQVUsU0FBUztBQUNuQixtQkFBTztBQUNYLGNBQUksTUFBTSxVQUFVLE1BQU07QUFDMUIsY0FBSSxPQUFPLFFBQVE7QUFDZixtQkFBTztBQUNYLGdCQUFNLFFBQVEsQ0FBQztBQUNmLG1CQUFTLElBQUksR0FBRyxJQUFJLFVBQVUsUUFBUSxFQUFFLEdBQUc7QUFDdkMsa0JBQU0sSUFBSSxVQUFVLE9BQU8sQ0FBQztBQUM1QixrQkFBTSxJQUFJLGFBQWEsQ0FBQztBQUN4QixnQkFBSSxNQUFNO0FBQ04scUJBQU8sdUJBQXVCO0FBQ2xDLGtCQUFNLFlBQVksR0FBRyxJQUFJO0FBRXpCLGdCQUFJLElBQUksS0FBSyxVQUFVO0FBQ25CO0FBQ0osa0JBQU0sS0FBSyxDQUFDO0FBQUEsVUFDaEI7QUFDQSxjQUFJLFFBQVE7QUFDUixtQkFBTywwQkFBMEI7QUFDckMsaUJBQU8sRUFBRSxRQUFRLE1BQU07QUFBQSxRQUMzQjtBQUNBLGlCQUFTLGFBQWEsS0FBSyxPQUFPO0FBQzlCLGdCQUFNLE1BQU0sU0FBUyxLQUFLLEtBQUs7QUFDL0IsY0FBSSxPQUFPLFFBQVE7QUFDZixtQkFBTztBQUFBLFFBQ2Y7QUFDQSxpQkFBUyxPQUFPLEtBQUssT0FBTztBQUN4QixnQkFBTSxNQUFNLFNBQVMsS0FBSyxLQUFLO0FBQy9CLGNBQUksT0FBTyxRQUFRO0FBQ2YsbUJBQU87QUFDWCxnQkFBTSxJQUFJLE1BQU0sR0FBRztBQUFBLFFBQ3ZCO0FBQ0EsZUFBTztBQUFBLFVBQ0g7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQ0EsY0FBUSxTQUFTLHVCQUF1QixRQUFRO0FBQ2hELGNBQVEsVUFBVSx1QkFBdUIsU0FBUztBQUFBO0FBQUE7OztBQ3pLbEQ7QUFBQTtBQUFBO0FBQUE7QUFFQSxjQUFRLGFBQWE7QUFDckIsY0FBUSxjQUFjO0FBQ3RCLGNBQVEsZ0JBQWdCO0FBRXhCLFVBQUksU0FBUyxDQUFDO0FBQ2QsVUFBSSxZQUFZLENBQUM7QUFDakIsVUFBSSxNQUFNLE9BQU8sZUFBZSxjQUFjLGFBQWE7QUFFM0QsVUFBSSxPQUFPO0FBQ1gsV0FBUyxJQUFJLEdBQUcsTUFBTSxLQUFLLFFBQVEsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUMvQyxlQUFPLENBQUMsSUFBSSxLQUFLLENBQUM7QUFDbEIsa0JBQVUsS0FBSyxXQUFXLENBQUMsQ0FBQyxJQUFJO0FBQUEsTUFDbEM7QUFIUztBQUFPO0FBT2hCLGdCQUFVLElBQUksV0FBVyxDQUFDLENBQUMsSUFBSTtBQUMvQixnQkFBVSxJQUFJLFdBQVcsQ0FBQyxDQUFDLElBQUk7QUFFL0IsZUFBUyxRQUFTLEtBQUs7QUFDckIsWUFBSU0sT0FBTSxJQUFJO0FBRWQsWUFBSUEsT0FBTSxJQUFJLEdBQUc7QUFDZixnQkFBTSxJQUFJLE1BQU0sZ0RBQWdEO0FBQUEsUUFDbEU7QUFJQSxZQUFJLFdBQVcsSUFBSSxRQUFRLEdBQUc7QUFDOUIsWUFBSSxhQUFhLEdBQUksWUFBV0E7QUFFaEMsWUFBSSxrQkFBa0IsYUFBYUEsT0FDL0IsSUFDQSxJQUFLLFdBQVc7QUFFcEIsZUFBTyxDQUFDLFVBQVUsZUFBZTtBQUFBLE1BQ25DO0FBR0EsZUFBUyxXQUFZLEtBQUs7QUFDeEIsWUFBSSxPQUFPLFFBQVEsR0FBRztBQUN0QixZQUFJLFdBQVcsS0FBSyxDQUFDO0FBQ3JCLFlBQUksa0JBQWtCLEtBQUssQ0FBQztBQUM1QixnQkFBUyxXQUFXLG1CQUFtQixJQUFJLElBQUs7QUFBQSxNQUNsRDtBQUVBLGVBQVMsWUFBYSxLQUFLLFVBQVUsaUJBQWlCO0FBQ3BELGdCQUFTLFdBQVcsbUJBQW1CLElBQUksSUFBSztBQUFBLE1BQ2xEO0FBRUEsZUFBUyxZQUFhLEtBQUs7QUFDekIsWUFBSTtBQUNKLFlBQUksT0FBTyxRQUFRLEdBQUc7QUFDdEIsWUFBSSxXQUFXLEtBQUssQ0FBQztBQUNyQixZQUFJLGtCQUFrQixLQUFLLENBQUM7QUFFNUIsWUFBSSxNQUFNLElBQUksSUFBSSxZQUFZLEtBQUssVUFBVSxlQUFlLENBQUM7QUFFN0QsWUFBSSxVQUFVO0FBR2QsWUFBSUEsT0FBTSxrQkFBa0IsSUFDeEIsV0FBVyxJQUNYO0FBRUosWUFBSUM7QUFDSixhQUFLQSxLQUFJLEdBQUdBLEtBQUlELE1BQUtDLE1BQUssR0FBRztBQUMzQixnQkFDRyxVQUFVLElBQUksV0FBV0EsRUFBQyxDQUFDLEtBQUssS0FDaEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUssS0FDcEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUssSUFDckMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDO0FBQ2pDLGNBQUksU0FBUyxJQUFLLE9BQU8sS0FBTTtBQUMvQixjQUFJLFNBQVMsSUFBSyxPQUFPLElBQUs7QUFDOUIsY0FBSSxTQUFTLElBQUksTUFBTTtBQUFBLFFBQ3pCO0FBRUEsWUFBSSxvQkFBb0IsR0FBRztBQUN6QixnQkFDRyxVQUFVLElBQUksV0FBV0EsRUFBQyxDQUFDLEtBQUssSUFDaEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUs7QUFDdkMsY0FBSSxTQUFTLElBQUksTUFBTTtBQUFBLFFBQ3pCO0FBRUEsWUFBSSxvQkFBb0IsR0FBRztBQUN6QixnQkFDRyxVQUFVLElBQUksV0FBV0EsRUFBQyxDQUFDLEtBQUssS0FDaEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUssSUFDcEMsVUFBVSxJQUFJLFdBQVdBLEtBQUksQ0FBQyxDQUFDLEtBQUs7QUFDdkMsY0FBSSxTQUFTLElBQUssT0FBTyxJQUFLO0FBQzlCLGNBQUksU0FBUyxJQUFJLE1BQU07QUFBQSxRQUN6QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxnQkFBaUJDLE1BQUs7QUFDN0IsZUFBTyxPQUFPQSxRQUFPLEtBQUssRUFBSSxJQUM1QixPQUFPQSxRQUFPLEtBQUssRUFBSSxJQUN2QixPQUFPQSxRQUFPLElBQUksRUFBSSxJQUN0QixPQUFPQSxPQUFNLEVBQUk7QUFBQSxNQUNyQjtBQUVBLGVBQVMsWUFBYSxPQUFPLE9BQU8sS0FBSztBQUN2QyxZQUFJO0FBQ0osWUFBSSxTQUFTLENBQUM7QUFDZCxpQkFBU0QsS0FBSSxPQUFPQSxLQUFJLEtBQUtBLE1BQUssR0FBRztBQUNuQyxpQkFDSSxNQUFNQSxFQUFDLEtBQUssS0FBTSxhQUNsQixNQUFNQSxLQUFJLENBQUMsS0FBSyxJQUFLLFVBQ3RCLE1BQU1BLEtBQUksQ0FBQyxJQUFJO0FBQ2xCLGlCQUFPLEtBQUssZ0JBQWdCLEdBQUcsQ0FBQztBQUFBLFFBQ2xDO0FBQ0EsZUFBTyxPQUFPLEtBQUssRUFBRTtBQUFBLE1BQ3ZCO0FBRUEsZUFBUyxjQUFlLE9BQU87QUFDN0IsWUFBSTtBQUNKLFlBQUlELE9BQU0sTUFBTTtBQUNoQixZQUFJLGFBQWFBLE9BQU07QUFDdkIsWUFBSSxRQUFRLENBQUM7QUFDYixZQUFJLGlCQUFpQjtBQUdyQixpQkFBU0MsS0FBSSxHQUFHRSxRQUFPSCxPQUFNLFlBQVlDLEtBQUlFLE9BQU1GLE1BQUssZ0JBQWdCO0FBQ3RFLGdCQUFNLEtBQUssWUFBWSxPQUFPQSxJQUFJQSxLQUFJLGlCQUFrQkUsUUFBT0EsUUFBUUYsS0FBSSxjQUFlLENBQUM7QUFBQSxRQUM3RjtBQUdBLFlBQUksZUFBZSxHQUFHO0FBQ3BCLGdCQUFNLE1BQU1ELE9BQU0sQ0FBQztBQUNuQixnQkFBTTtBQUFBLFlBQ0osT0FBTyxPQUFPLENBQUMsSUFDZixPQUFRLE9BQU8sSUFBSyxFQUFJLElBQ3hCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsV0FBVyxlQUFlLEdBQUc7QUFDM0IsaUJBQU8sTUFBTUEsT0FBTSxDQUFDLEtBQUssS0FBSyxNQUFNQSxPQUFNLENBQUM7QUFDM0MsZ0JBQU07QUFBQSxZQUNKLE9BQU8sT0FBTyxFQUFFLElBQ2hCLE9BQVEsT0FBTyxJQUFLLEVBQUksSUFDeEIsT0FBUSxPQUFPLElBQUssRUFBSSxJQUN4QjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsZUFBTyxNQUFNLEtBQUssRUFBRTtBQUFBLE1BQ3RCO0FBQUE7QUFBQTs7O0FDckpBO0FBQUE7QUFBQTtBQUNBLGNBQVEsT0FBTyxTQUFVLFFBQVEsUUFBUSxNQUFNLE1BQU0sUUFBUTtBQUMzRCxZQUFJLEdBQUc7QUFDUCxZQUFJLE9BQVEsU0FBUyxJQUFLLE9BQU87QUFDakMsWUFBSSxRQUFRLEtBQUssUUFBUTtBQUN6QixZQUFJLFFBQVEsUUFBUTtBQUNwQixZQUFJLFFBQVE7QUFDWixZQUFJLElBQUksT0FBUSxTQUFTLElBQUs7QUFDOUIsWUFBSSxJQUFJLE9BQU8sS0FBSztBQUNwQixZQUFJLElBQUksT0FBTyxTQUFTLENBQUM7QUFFekIsYUFBSztBQUVMLFlBQUksS0FBTSxLQUFNLENBQUMsU0FBVTtBQUMzQixjQUFPLENBQUM7QUFDUixpQkFBUztBQUNULGVBQU8sUUFBUSxHQUFHLElBQUssSUFBSSxNQUFPLE9BQU8sU0FBUyxDQUFDLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBRztBQUFBLFFBQUM7QUFFM0UsWUFBSSxLQUFNLEtBQU0sQ0FBQyxTQUFVO0FBQzNCLGNBQU8sQ0FBQztBQUNSLGlCQUFTO0FBQ1QsZUFBTyxRQUFRLEdBQUcsSUFBSyxJQUFJLE1BQU8sT0FBTyxTQUFTLENBQUMsR0FBRyxLQUFLLEdBQUcsU0FBUyxHQUFHO0FBQUEsUUFBQztBQUUzRSxZQUFJLE1BQU0sR0FBRztBQUNYLGNBQUksSUFBSTtBQUFBLFFBQ1YsV0FBVyxNQUFNLE1BQU07QUFDckIsaUJBQU8sSUFBSSxPQUFRLElBQUksS0FBSyxLQUFLO0FBQUEsUUFDbkMsT0FBTztBQUNMLGNBQUksSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQ3hCLGNBQUksSUFBSTtBQUFBLFFBQ1Y7QUFDQSxnQkFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSTtBQUFBLE1BQ2hEO0FBRUEsY0FBUSxRQUFRLFNBQVUsUUFBUSxPQUFPLFFBQVEsTUFBTSxNQUFNLFFBQVE7QUFDbkUsWUFBSSxHQUFHLEdBQUc7QUFDVixZQUFJLE9BQVEsU0FBUyxJQUFLLE9BQU87QUFDakMsWUFBSSxRQUFRLEtBQUssUUFBUTtBQUN6QixZQUFJLFFBQVEsUUFBUTtBQUNwQixZQUFJLEtBQU0sU0FBUyxLQUFLLEtBQUssSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLElBQUk7QUFDOUQsWUFBSSxJQUFJLE9BQU8sSUFBSyxTQUFTO0FBQzdCLFlBQUksSUFBSSxPQUFPLElBQUk7QUFDbkIsWUFBSSxJQUFJLFFBQVEsS0FBTSxVQUFVLEtBQUssSUFBSSxRQUFRLElBQUssSUFBSTtBQUUxRCxnQkFBUSxLQUFLLElBQUksS0FBSztBQUV0QixZQUFJLE1BQU0sS0FBSyxLQUFLLFVBQVUsVUFBVTtBQUN0QyxjQUFJLE1BQU0sS0FBSyxJQUFJLElBQUk7QUFDdkIsY0FBSTtBQUFBLFFBQ04sT0FBTztBQUNMLGNBQUksS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxHQUFHO0FBQ3pDLGNBQUksU0FBUyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUc7QUFDckM7QUFDQSxpQkFBSztBQUFBLFVBQ1A7QUFDQSxjQUFJLElBQUksU0FBUyxHQUFHO0FBQ2xCLHFCQUFTLEtBQUs7QUFBQSxVQUNoQixPQUFPO0FBQ0wscUJBQVMsS0FBSyxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUs7QUFBQSxVQUNyQztBQUNBLGNBQUksUUFBUSxLQUFLLEdBQUc7QUFDbEI7QUFDQSxpQkFBSztBQUFBLFVBQ1A7QUFFQSxjQUFJLElBQUksU0FBUyxNQUFNO0FBQ3JCLGdCQUFJO0FBQ0osZ0JBQUk7QUFBQSxVQUNOLFdBQVcsSUFBSSxTQUFTLEdBQUc7QUFDekIsaUJBQU0sUUFBUSxJQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUN4QyxnQkFBSSxJQUFJO0FBQUEsVUFDVixPQUFPO0FBQ0wsZ0JBQUksUUFBUSxLQUFLLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQ3JELGdCQUFJO0FBQUEsVUFDTjtBQUFBLFFBQ0Y7QUFFQSxlQUFPLFFBQVEsR0FBRyxPQUFPLFNBQVMsQ0FBQyxJQUFJLElBQUksS0FBTSxLQUFLLEdBQUcsS0FBSyxLQUFLLFFBQVEsR0FBRztBQUFBLFFBQUM7QUFFL0UsWUFBSyxLQUFLLE9BQVE7QUFDbEIsZ0JBQVE7QUFDUixlQUFPLE9BQU8sR0FBRyxPQUFPLFNBQVMsQ0FBQyxJQUFJLElBQUksS0FBTSxLQUFLLEdBQUcsS0FBSyxLQUFLLFFBQVEsR0FBRztBQUFBLFFBQUM7QUFFOUUsZUFBTyxTQUFTLElBQUksQ0FBQyxLQUFLLElBQUk7QUFBQSxNQUNoQztBQUFBO0FBQUE7OztBQ3BGQTtBQUFBO0FBQUE7QUFBQTtBQVVBLFVBQU0sU0FBUztBQUNmLFVBQU0sVUFBVTtBQUNoQixVQUFNLHNCQUNILE9BQU8sV0FBVyxjQUFjLE9BQU8sT0FBTyxLQUFLLE1BQU0sYUFDdEQsT0FBTyxLQUFLLEVBQUUsNEJBQTRCLElBQzFDO0FBRU4sY0FBUSxTQUFTSTtBQUNqQixjQUFRLGFBQWE7QUFDckIsY0FBUSxvQkFBb0I7QUFFNUIsVUFBTSxlQUFlO0FBQ3JCLGNBQVEsYUFBYTtBQWdCckIsTUFBQUEsUUFBTyxzQkFBc0Isa0JBQWtCO0FBRS9DLFVBQUksQ0FBQ0EsUUFBTyx1QkFBdUIsT0FBTyxZQUFZLGVBQ2xELE9BQU8sUUFBUSxVQUFVLFlBQVk7QUFDdkMsZ0JBQVE7QUFBQSxVQUNOO0FBQUEsUUFFRjtBQUFBLE1BQ0Y7QUFFQSxlQUFTLG9CQUFxQjtBQUU1QixZQUFJO0FBQ0YsZ0JBQU0sTUFBTSxJQUFJLFdBQVcsQ0FBQztBQUM1QixnQkFBTSxRQUFRLEVBQUUsS0FBSyxXQUFZO0FBQUUsbUJBQU87QUFBQSxVQUFHLEVBQUU7QUFDL0MsaUJBQU8sZUFBZSxPQUFPLFdBQVcsU0FBUztBQUNqRCxpQkFBTyxlQUFlLEtBQUssS0FBSztBQUNoQyxpQkFBTyxJQUFJLElBQUksTUFBTTtBQUFBLFFBQ3ZCLFNBQVMsR0FBRztBQUNWLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFFQSxhQUFPLGVBQWVBLFFBQU8sV0FBVyxVQUFVO0FBQUEsUUFDaEQsWUFBWTtBQUFBLFFBQ1osS0FBSyxXQUFZO0FBQ2YsY0FBSSxDQUFDQSxRQUFPLFNBQVMsSUFBSSxFQUFHLFFBQU87QUFDbkMsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFBQSxNQUNGLENBQUM7QUFFRCxhQUFPLGVBQWVBLFFBQU8sV0FBVyxVQUFVO0FBQUEsUUFDaEQsWUFBWTtBQUFBLFFBQ1osS0FBSyxXQUFZO0FBQ2YsY0FBSSxDQUFDQSxRQUFPLFNBQVMsSUFBSSxFQUFHLFFBQU87QUFDbkMsaUJBQU8sS0FBSztBQUFBLFFBQ2Q7QUFBQSxNQUNGLENBQUM7QUFFRCxlQUFTLGFBQWMsUUFBUTtBQUM3QixZQUFJLFNBQVMsY0FBYztBQUN6QixnQkFBTSxJQUFJLFdBQVcsZ0JBQWdCLFNBQVMsZ0NBQWdDO0FBQUEsUUFDaEY7QUFFQSxjQUFNLE1BQU0sSUFBSSxXQUFXLE1BQU07QUFDakMsZUFBTyxlQUFlLEtBQUtBLFFBQU8sU0FBUztBQUMzQyxlQUFPO0FBQUEsTUFDVDtBQVlBLGVBQVNBLFFBQVEsS0FBSyxrQkFBa0IsUUFBUTtBQUU5QyxZQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGNBQUksT0FBTyxxQkFBcUIsVUFBVTtBQUN4QyxrQkFBTSxJQUFJO0FBQUEsY0FDUjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sWUFBWSxHQUFHO0FBQUEsUUFDeEI7QUFDQSxlQUFPLEtBQUssS0FBSyxrQkFBa0IsTUFBTTtBQUFBLE1BQzNDO0FBRUEsTUFBQUEsUUFBTyxXQUFXO0FBRWxCLGVBQVMsS0FBTSxPQUFPLGtCQUFrQixRQUFRO0FBQzlDLFlBQUksT0FBTyxVQUFVLFVBQVU7QUFDN0IsaUJBQU8sV0FBVyxPQUFPLGdCQUFnQjtBQUFBLFFBQzNDO0FBRUEsWUFBSSxZQUFZLE9BQU8sS0FBSyxHQUFHO0FBQzdCLGlCQUFPLGNBQWMsS0FBSztBQUFBLFFBQzVCO0FBRUEsWUFBSSxTQUFTLE1BQU07QUFDakIsZ0JBQU0sSUFBSTtBQUFBLFlBQ1Isb0hBQzBDLE9BQU87QUFBQSxVQUNuRDtBQUFBLFFBQ0Y7QUFFQSxZQUFJLFdBQVcsT0FBTyxXQUFXLEtBQzVCLFNBQVMsV0FBVyxNQUFNLFFBQVEsV0FBVyxHQUFJO0FBQ3BELGlCQUFPLGdCQUFnQixPQUFPLGtCQUFrQixNQUFNO0FBQUEsUUFDeEQ7QUFFQSxZQUFJLE9BQU8sc0JBQXNCLGdCQUM1QixXQUFXLE9BQU8saUJBQWlCLEtBQ25DLFNBQVMsV0FBVyxNQUFNLFFBQVEsaUJBQWlCLElBQUs7QUFDM0QsaUJBQU8sZ0JBQWdCLE9BQU8sa0JBQWtCLE1BQU07QUFBQSxRQUN4RDtBQUVBLFlBQUksT0FBTyxVQUFVLFVBQVU7QUFDN0IsZ0JBQU0sSUFBSTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGNBQU0sVUFBVSxNQUFNLFdBQVcsTUFBTSxRQUFRO0FBQy9DLFlBQUksV0FBVyxRQUFRLFlBQVksT0FBTztBQUN4QyxpQkFBT0EsUUFBTyxLQUFLLFNBQVMsa0JBQWtCLE1BQU07QUFBQSxRQUN0RDtBQUVBLGNBQU0sSUFBSSxXQUFXLEtBQUs7QUFDMUIsWUFBSSxFQUFHLFFBQU87QUFFZCxZQUFJLE9BQU8sV0FBVyxlQUFlLE9BQU8sZUFBZSxRQUN2RCxPQUFPLE1BQU0sT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUNuRCxpQkFBT0EsUUFBTyxLQUFLLE1BQU0sT0FBTyxXQUFXLEVBQUUsUUFBUSxHQUFHLGtCQUFrQixNQUFNO0FBQUEsUUFDbEY7QUFFQSxjQUFNLElBQUk7QUFBQSxVQUNSLG9IQUMwQyxPQUFPO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBVUEsTUFBQUEsUUFBTyxPQUFPLFNBQVUsT0FBTyxrQkFBa0IsUUFBUTtBQUN2RCxlQUFPLEtBQUssT0FBTyxrQkFBa0IsTUFBTTtBQUFBLE1BQzdDO0FBSUEsYUFBTyxlQUFlQSxRQUFPLFdBQVcsV0FBVyxTQUFTO0FBQzVELGFBQU8sZUFBZUEsU0FBUSxVQUFVO0FBRXhDLGVBQVMsV0FBWSxNQUFNO0FBQ3pCLFlBQUksT0FBTyxTQUFTLFVBQVU7QUFDNUIsZ0JBQU0sSUFBSSxVQUFVLHdDQUF3QztBQUFBLFFBQzlELFdBQVcsT0FBTyxHQUFHO0FBQ25CLGdCQUFNLElBQUksV0FBVyxnQkFBZ0IsT0FBTyxnQ0FBZ0M7QUFBQSxRQUM5RTtBQUFBLE1BQ0Y7QUFFQSxlQUFTLE1BQU8sTUFBTSxNQUFNLFVBQVU7QUFDcEMsbUJBQVcsSUFBSTtBQUNmLFlBQUksUUFBUSxHQUFHO0FBQ2IsaUJBQU8sYUFBYSxJQUFJO0FBQUEsUUFDMUI7QUFDQSxZQUFJLFNBQVMsUUFBVztBQUl0QixpQkFBTyxPQUFPLGFBQWEsV0FDdkIsYUFBYSxJQUFJLEVBQUUsS0FBSyxNQUFNLFFBQVEsSUFDdEMsYUFBYSxJQUFJLEVBQUUsS0FBSyxJQUFJO0FBQUEsUUFDbEM7QUFDQSxlQUFPLGFBQWEsSUFBSTtBQUFBLE1BQzFCO0FBTUEsTUFBQUEsUUFBTyxRQUFRLFNBQVUsTUFBTSxNQUFNLFVBQVU7QUFDN0MsZUFBTyxNQUFNLE1BQU0sTUFBTSxRQUFRO0FBQUEsTUFDbkM7QUFFQSxlQUFTLFlBQWEsTUFBTTtBQUMxQixtQkFBVyxJQUFJO0FBQ2YsZUFBTyxhQUFhLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUM7QUFBQSxNQUN0RDtBQUtBLE1BQUFBLFFBQU8sY0FBYyxTQUFVLE1BQU07QUFDbkMsZUFBTyxZQUFZLElBQUk7QUFBQSxNQUN6QjtBQUlBLE1BQUFBLFFBQU8sa0JBQWtCLFNBQVUsTUFBTTtBQUN2QyxlQUFPLFlBQVksSUFBSTtBQUFBLE1BQ3pCO0FBRUEsZUFBUyxXQUFZLFFBQVEsVUFBVTtBQUNyQyxZQUFJLE9BQU8sYUFBYSxZQUFZLGFBQWEsSUFBSTtBQUNuRCxxQkFBVztBQUFBLFFBQ2I7QUFFQSxZQUFJLENBQUNBLFFBQU8sV0FBVyxRQUFRLEdBQUc7QUFDaEMsZ0JBQU0sSUFBSSxVQUFVLHVCQUF1QixRQUFRO0FBQUEsUUFDckQ7QUFFQSxjQUFNLFNBQVMsV0FBVyxRQUFRLFFBQVEsSUFBSTtBQUM5QyxZQUFJLE1BQU0sYUFBYSxNQUFNO0FBRTdCLGNBQU0sU0FBUyxJQUFJLE1BQU0sUUFBUSxRQUFRO0FBRXpDLFlBQUksV0FBVyxRQUFRO0FBSXJCLGdCQUFNLElBQUksTUFBTSxHQUFHLE1BQU07QUFBQSxRQUMzQjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxjQUFlLE9BQU87QUFDN0IsY0FBTSxTQUFTLE1BQU0sU0FBUyxJQUFJLElBQUksUUFBUSxNQUFNLE1BQU0sSUFBSTtBQUM5RCxjQUFNLE1BQU0sYUFBYSxNQUFNO0FBQy9CLGlCQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsS0FBSyxHQUFHO0FBQ2xDLGNBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJO0FBQUEsUUFDdEI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsY0FBZSxXQUFXO0FBQ2pDLFlBQUksV0FBVyxXQUFXLFVBQVUsR0FBRztBQUNyQyxnQkFBTSxPQUFPLElBQUksV0FBVyxTQUFTO0FBQ3JDLGlCQUFPLGdCQUFnQixLQUFLLFFBQVEsS0FBSyxZQUFZLEtBQUssVUFBVTtBQUFBLFFBQ3RFO0FBQ0EsZUFBTyxjQUFjLFNBQVM7QUFBQSxNQUNoQztBQUVBLGVBQVMsZ0JBQWlCLE9BQU8sWUFBWSxRQUFRO0FBQ25ELFlBQUksYUFBYSxLQUFLLE1BQU0sYUFBYSxZQUFZO0FBQ25ELGdCQUFNLElBQUksV0FBVyxzQ0FBc0M7QUFBQSxRQUM3RDtBQUVBLFlBQUksTUFBTSxhQUFhLGNBQWMsVUFBVSxJQUFJO0FBQ2pELGdCQUFNLElBQUksV0FBVyxzQ0FBc0M7QUFBQSxRQUM3RDtBQUVBLFlBQUk7QUFDSixZQUFJLGVBQWUsVUFBYSxXQUFXLFFBQVc7QUFDcEQsZ0JBQU0sSUFBSSxXQUFXLEtBQUs7QUFBQSxRQUM1QixXQUFXLFdBQVcsUUFBVztBQUMvQixnQkFBTSxJQUFJLFdBQVcsT0FBTyxVQUFVO0FBQUEsUUFDeEMsT0FBTztBQUNMLGdCQUFNLElBQUksV0FBVyxPQUFPLFlBQVksTUFBTTtBQUFBLFFBQ2hEO0FBR0EsZUFBTyxlQUFlLEtBQUtBLFFBQU8sU0FBUztBQUUzQyxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsV0FBWSxLQUFLO0FBQ3hCLFlBQUlBLFFBQU8sU0FBUyxHQUFHLEdBQUc7QUFDeEIsZ0JBQU0sTUFBTSxRQUFRLElBQUksTUFBTSxJQUFJO0FBQ2xDLGdCQUFNLE1BQU0sYUFBYSxHQUFHO0FBRTVCLGNBQUksSUFBSSxXQUFXLEdBQUc7QUFDcEIsbUJBQU87QUFBQSxVQUNUO0FBRUEsY0FBSSxLQUFLLEtBQUssR0FBRyxHQUFHLEdBQUc7QUFDdkIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxJQUFJLFdBQVcsUUFBVztBQUM1QixjQUFJLE9BQU8sSUFBSSxXQUFXLFlBQVksWUFBWSxJQUFJLE1BQU0sR0FBRztBQUM3RCxtQkFBTyxhQUFhLENBQUM7QUFBQSxVQUN2QjtBQUNBLGlCQUFPLGNBQWMsR0FBRztBQUFBLFFBQzFCO0FBRUEsWUFBSSxJQUFJLFNBQVMsWUFBWSxNQUFNLFFBQVEsSUFBSSxJQUFJLEdBQUc7QUFDcEQsaUJBQU8sY0FBYyxJQUFJLElBQUk7QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFFQSxlQUFTLFFBQVMsUUFBUTtBQUd4QixZQUFJLFVBQVUsY0FBYztBQUMxQixnQkFBTSxJQUFJLFdBQVcsNERBQ2EsYUFBYSxTQUFTLEVBQUUsSUFBSSxRQUFRO0FBQUEsUUFDeEU7QUFDQSxlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLGVBQVMsV0FBWSxRQUFRO0FBQzNCLFlBQUksQ0FBQyxVQUFVLFFBQVE7QUFDckIsbUJBQVM7QUFBQSxRQUNYO0FBQ0EsZUFBT0EsUUFBTyxNQUFNLENBQUMsTUFBTTtBQUFBLE1BQzdCO0FBRUEsTUFBQUEsUUFBTyxXQUFXLFNBQVMsU0FBVSxHQUFHO0FBQ3RDLGVBQU8sS0FBSyxRQUFRLEVBQUUsY0FBYyxRQUNsQyxNQUFNQSxRQUFPO0FBQUEsTUFDakI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsU0FBUyxRQUFTLEdBQUcsR0FBRztBQUN2QyxZQUFJLFdBQVcsR0FBRyxVQUFVLEVBQUcsS0FBSUEsUUFBTyxLQUFLLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVTtBQUN4RSxZQUFJLFdBQVcsR0FBRyxVQUFVLEVBQUcsS0FBSUEsUUFBTyxLQUFLLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVTtBQUN4RSxZQUFJLENBQUNBLFFBQU8sU0FBUyxDQUFDLEtBQUssQ0FBQ0EsUUFBTyxTQUFTLENBQUMsR0FBRztBQUM5QyxnQkFBTSxJQUFJO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsWUFBSSxNQUFNLEVBQUcsUUFBTztBQUVwQixZQUFJLElBQUksRUFBRTtBQUNWLFlBQUksSUFBSSxFQUFFO0FBRVYsaUJBQVMsSUFBSSxHQUFHLE1BQU0sS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLEdBQUc7QUFDbEQsY0FBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRztBQUNqQixnQkFBSSxFQUFFLENBQUM7QUFDUCxnQkFBSSxFQUFFLENBQUM7QUFDUDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsWUFBSSxJQUFJLEVBQUcsUUFBTztBQUNsQixZQUFJLElBQUksRUFBRyxRQUFPO0FBQ2xCLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsUUFBTyxhQUFhLFNBQVMsV0FBWSxVQUFVO0FBQ2pELGdCQUFRLE9BQU8sUUFBUSxFQUFFLFlBQVksR0FBRztBQUFBLFVBQ3RDLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFBQSxVQUNMLEtBQUs7QUFDSCxtQkFBTztBQUFBLFVBQ1Q7QUFDRSxtQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNGO0FBRUEsTUFBQUEsUUFBTyxTQUFTLFNBQVMsT0FBUSxNQUFNLFFBQVE7QUFDN0MsWUFBSSxDQUFDLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDeEIsZ0JBQU0sSUFBSSxVQUFVLDZDQUE2QztBQUFBLFFBQ25FO0FBRUEsWUFBSSxLQUFLLFdBQVcsR0FBRztBQUNyQixpQkFBT0EsUUFBTyxNQUFNLENBQUM7QUFBQSxRQUN2QjtBQUVBLFlBQUk7QUFDSixZQUFJLFdBQVcsUUFBVztBQUN4QixtQkFBUztBQUNULGVBQUssSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEVBQUUsR0FBRztBQUNoQyxzQkFBVSxLQUFLLENBQUMsRUFBRTtBQUFBLFVBQ3BCO0FBQUEsUUFDRjtBQUVBLGNBQU0sU0FBU0EsUUFBTyxZQUFZLE1BQU07QUFDeEMsWUFBSSxNQUFNO0FBQ1YsYUFBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsRUFBRSxHQUFHO0FBQ2hDLGNBQUksTUFBTSxLQUFLLENBQUM7QUFDaEIsY0FBSSxXQUFXLEtBQUssVUFBVSxHQUFHO0FBQy9CLGdCQUFJLE1BQU0sSUFBSSxTQUFTLE9BQU8sUUFBUTtBQUNwQyxrQkFBSSxDQUFDQSxRQUFPLFNBQVMsR0FBRyxFQUFHLE9BQU1BLFFBQU8sS0FBSyxHQUFHO0FBQ2hELGtCQUFJLEtBQUssUUFBUSxHQUFHO0FBQUEsWUFDdEIsT0FBTztBQUNMLHlCQUFXLFVBQVUsSUFBSTtBQUFBLGdCQUN2QjtBQUFBLGdCQUNBO0FBQUEsZ0JBQ0E7QUFBQSxjQUNGO0FBQUEsWUFDRjtBQUFBLFVBQ0YsV0FBVyxDQUFDQSxRQUFPLFNBQVMsR0FBRyxHQUFHO0FBQ2hDLGtCQUFNLElBQUksVUFBVSw2Q0FBNkM7QUFBQSxVQUNuRSxPQUFPO0FBQ0wsZ0JBQUksS0FBSyxRQUFRLEdBQUc7QUFBQSxVQUN0QjtBQUNBLGlCQUFPLElBQUk7QUFBQSxRQUNiO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTLFdBQVksUUFBUSxVQUFVO0FBQ3JDLFlBQUlBLFFBQU8sU0FBUyxNQUFNLEdBQUc7QUFDM0IsaUJBQU8sT0FBTztBQUFBLFFBQ2hCO0FBQ0EsWUFBSSxZQUFZLE9BQU8sTUFBTSxLQUFLLFdBQVcsUUFBUSxXQUFXLEdBQUc7QUFDakUsaUJBQU8sT0FBTztBQUFBLFFBQ2hCO0FBQ0EsWUFBSSxPQUFPLFdBQVcsVUFBVTtBQUM5QixnQkFBTSxJQUFJO0FBQUEsWUFDUiw2RkFDbUIsT0FBTztBQUFBLFVBQzVCO0FBQUEsUUFDRjtBQUVBLGNBQU0sTUFBTSxPQUFPO0FBQ25CLGNBQU0sWUFBYSxVQUFVLFNBQVMsS0FBSyxVQUFVLENBQUMsTUFBTTtBQUM1RCxZQUFJLENBQUMsYUFBYSxRQUFRLEVBQUcsUUFBTztBQUdwQyxZQUFJLGNBQWM7QUFDbEIsbUJBQVM7QUFDUCxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUNILHFCQUFPO0FBQUEsWUFDVCxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQ0gscUJBQU9DLGFBQVksTUFBTSxFQUFFO0FBQUEsWUFDN0IsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUNILHFCQUFPLE1BQU07QUFBQSxZQUNmLEtBQUs7QUFDSCxxQkFBTyxRQUFRO0FBQUEsWUFDakIsS0FBSztBQUNILHFCQUFPQyxlQUFjLE1BQU0sRUFBRTtBQUFBLFlBQy9CO0FBQ0Usa0JBQUksYUFBYTtBQUNmLHVCQUFPLFlBQVksS0FBS0QsYUFBWSxNQUFNLEVBQUU7QUFBQSxjQUM5QztBQUNBLDBCQUFZLEtBQUssVUFBVSxZQUFZO0FBQ3ZDLDRCQUFjO0FBQUEsVUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLE1BQUFELFFBQU8sYUFBYTtBQUVwQixlQUFTLGFBQWMsVUFBVSxPQUFPLEtBQUs7QUFDM0MsWUFBSSxjQUFjO0FBU2xCLFlBQUksVUFBVSxVQUFhLFFBQVEsR0FBRztBQUNwQyxrQkFBUTtBQUFBLFFBQ1Y7QUFHQSxZQUFJLFFBQVEsS0FBSyxRQUFRO0FBQ3ZCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLFlBQUksUUFBUSxVQUFhLE1BQU0sS0FBSyxRQUFRO0FBQzFDLGdCQUFNLEtBQUs7QUFBQSxRQUNiO0FBRUEsWUFBSSxPQUFPLEdBQUc7QUFDWixpQkFBTztBQUFBLFFBQ1Q7QUFHQSxpQkFBUztBQUNULG1CQUFXO0FBRVgsWUFBSSxPQUFPLE9BQU87QUFDaEIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxDQUFDLFNBQVUsWUFBVztBQUUxQixlQUFPLE1BQU07QUFDWCxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLFNBQVMsTUFBTSxPQUFPLEdBQUc7QUFBQSxZQUVsQyxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQ0gscUJBQU8sVUFBVSxNQUFNLE9BQU8sR0FBRztBQUFBLFlBRW5DLEtBQUs7QUFDSCxxQkFBTyxXQUFXLE1BQU0sT0FBTyxHQUFHO0FBQUEsWUFFcEMsS0FBSztBQUFBLFlBQ0wsS0FBSztBQUNILHFCQUFPLFlBQVksTUFBTSxPQUFPLEdBQUc7QUFBQSxZQUVyQyxLQUFLO0FBQ0gscUJBQU8sWUFBWSxNQUFNLE9BQU8sR0FBRztBQUFBLFlBRXJDLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFDSCxxQkFBTyxhQUFhLE1BQU0sT0FBTyxHQUFHO0FBQUEsWUFFdEM7QUFDRSxrQkFBSSxZQUFhLE9BQU0sSUFBSSxVQUFVLHVCQUF1QixRQUFRO0FBQ3BFLDBCQUFZLFdBQVcsSUFBSSxZQUFZO0FBQ3ZDLDRCQUFjO0FBQUEsVUFDbEI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQVFBLE1BQUFBLFFBQU8sVUFBVSxZQUFZO0FBRTdCLGVBQVMsS0FBTSxHQUFHLEdBQUcsR0FBRztBQUN0QixjQUFNLElBQUksRUFBRSxDQUFDO0FBQ2IsVUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1YsVUFBRSxDQUFDLElBQUk7QUFBQSxNQUNUO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFNBQVMsU0FBUyxTQUFVO0FBQzNDLGNBQU0sTUFBTSxLQUFLO0FBQ2pCLFlBQUksTUFBTSxNQUFNLEdBQUc7QUFDakIsZ0JBQU0sSUFBSSxXQUFXLDJDQUEyQztBQUFBLFFBQ2xFO0FBQ0EsaUJBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxLQUFLLEdBQUc7QUFDL0IsZUFBSyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQUEsUUFDckI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxTQUFTLFNBQVMsU0FBVTtBQUMzQyxjQUFNLE1BQU0sS0FBSztBQUNqQixZQUFJLE1BQU0sTUFBTSxHQUFHO0FBQ2pCLGdCQUFNLElBQUksV0FBVywyQ0FBMkM7QUFBQSxRQUNsRTtBQUNBLGlCQUFTLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHO0FBQy9CLGVBQUssTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixlQUFLLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUFBLFFBQ3pCO0FBQ0EsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBQSxRQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVU7QUFDM0MsY0FBTSxNQUFNLEtBQUs7QUFDakIsWUFBSSxNQUFNLE1BQU0sR0FBRztBQUNqQixnQkFBTSxJQUFJLFdBQVcsMkNBQTJDO0FBQUEsUUFDbEU7QUFDQSxpQkFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEtBQUssR0FBRztBQUMvQixlQUFLLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsZUFBSyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdkIsZUFBSyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDdkIsZUFBSyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFBQSxRQUN6QjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFdBQVcsU0FBUyxXQUFZO0FBQy9DLGNBQU0sU0FBUyxLQUFLO0FBQ3BCLFlBQUksV0FBVyxFQUFHLFFBQU87QUFDekIsWUFBSSxVQUFVLFdBQVcsRUFBRyxRQUFPLFVBQVUsTUFBTSxHQUFHLE1BQU07QUFDNUQsZUFBTyxhQUFhLE1BQU0sTUFBTSxTQUFTO0FBQUEsTUFDM0M7QUFFQSxNQUFBQSxRQUFPLFVBQVUsaUJBQWlCQSxRQUFPLFVBQVU7QUFFbkQsTUFBQUEsUUFBTyxVQUFVLFNBQVMsU0FBUyxPQUFRLEdBQUc7QUFDNUMsWUFBSSxDQUFDQSxRQUFPLFNBQVMsQ0FBQyxFQUFHLE9BQU0sSUFBSSxVQUFVLDJCQUEyQjtBQUN4RSxZQUFJLFNBQVMsRUFBRyxRQUFPO0FBQ3ZCLGVBQU9BLFFBQU8sUUFBUSxNQUFNLENBQUMsTUFBTTtBQUFBLE1BQ3JDO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFVBQVUsU0FBUyxVQUFXO0FBQzdDLFlBQUksTUFBTTtBQUNWLGNBQU0sTUFBTSxRQUFRO0FBQ3BCLGNBQU0sS0FBSyxTQUFTLE9BQU8sR0FBRyxHQUFHLEVBQUUsUUFBUSxXQUFXLEtBQUssRUFBRSxLQUFLO0FBQ2xFLFlBQUksS0FBSyxTQUFTLElBQUssUUFBTztBQUM5QixlQUFPLGFBQWEsTUFBTTtBQUFBLE1BQzVCO0FBQ0EsVUFBSSxxQkFBcUI7QUFDdkIsUUFBQUEsUUFBTyxVQUFVLG1CQUFtQixJQUFJQSxRQUFPLFVBQVU7QUFBQSxNQUMzRDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxVQUFVLFNBQVMsUUFBUyxRQUFRLE9BQU8sS0FBSyxXQUFXLFNBQVM7QUFDbkYsWUFBSSxXQUFXLFFBQVEsVUFBVSxHQUFHO0FBQ2xDLG1CQUFTQSxRQUFPLEtBQUssUUFBUSxPQUFPLFFBQVEsT0FBTyxVQUFVO0FBQUEsUUFDL0Q7QUFDQSxZQUFJLENBQUNBLFFBQU8sU0FBUyxNQUFNLEdBQUc7QUFDNUIsZ0JBQU0sSUFBSTtBQUFBLFlBQ1IsbUZBQ29CLE9BQU87QUFBQSxVQUM3QjtBQUFBLFFBQ0Y7QUFFQSxZQUFJLFVBQVUsUUFBVztBQUN2QixrQkFBUTtBQUFBLFFBQ1Y7QUFDQSxZQUFJLFFBQVEsUUFBVztBQUNyQixnQkFBTSxTQUFTLE9BQU8sU0FBUztBQUFBLFFBQ2pDO0FBQ0EsWUFBSSxjQUFjLFFBQVc7QUFDM0Isc0JBQVk7QUFBQSxRQUNkO0FBQ0EsWUFBSSxZQUFZLFFBQVc7QUFDekIsb0JBQVUsS0FBSztBQUFBLFFBQ2pCO0FBRUEsWUFBSSxRQUFRLEtBQUssTUFBTSxPQUFPLFVBQVUsWUFBWSxLQUFLLFVBQVUsS0FBSyxRQUFRO0FBQzlFLGdCQUFNLElBQUksV0FBVyxvQkFBb0I7QUFBQSxRQUMzQztBQUVBLFlBQUksYUFBYSxXQUFXLFNBQVMsS0FBSztBQUN4QyxpQkFBTztBQUFBLFFBQ1Q7QUFDQSxZQUFJLGFBQWEsU0FBUztBQUN4QixpQkFBTztBQUFBLFFBQ1Q7QUFDQSxZQUFJLFNBQVMsS0FBSztBQUNoQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxtQkFBVztBQUNYLGlCQUFTO0FBQ1QsdUJBQWU7QUFDZixxQkFBYTtBQUViLFlBQUksU0FBUyxPQUFRLFFBQU87QUFFNUIsWUFBSSxJQUFJLFVBQVU7QUFDbEIsWUFBSSxJQUFJLE1BQU07QUFDZCxjQUFNLE1BQU0sS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUV6QixjQUFNLFdBQVcsS0FBSyxNQUFNLFdBQVcsT0FBTztBQUM5QyxjQUFNLGFBQWEsT0FBTyxNQUFNLE9BQU8sR0FBRztBQUUxQyxpQkFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUM1QixjQUFJLFNBQVMsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxHQUFHO0FBQ2pDLGdCQUFJLFNBQVMsQ0FBQztBQUNkLGdCQUFJLFdBQVcsQ0FBQztBQUNoQjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsWUFBSSxJQUFJLEVBQUcsUUFBTztBQUNsQixZQUFJLElBQUksRUFBRyxRQUFPO0FBQ2xCLGVBQU87QUFBQSxNQUNUO0FBV0EsZUFBUyxxQkFBc0IsUUFBUSxLQUFLLFlBQVksVUFBVSxLQUFLO0FBRXJFLFlBQUksT0FBTyxXQUFXLEVBQUcsUUFBTztBQUdoQyxZQUFJLE9BQU8sZUFBZSxVQUFVO0FBQ2xDLHFCQUFXO0FBQ1gsdUJBQWE7QUFBQSxRQUNmLFdBQVcsYUFBYSxZQUFZO0FBQ2xDLHVCQUFhO0FBQUEsUUFDZixXQUFXLGFBQWEsYUFBYTtBQUNuQyx1QkFBYTtBQUFBLFFBQ2Y7QUFDQSxxQkFBYSxDQUFDO0FBQ2QsWUFBSSxZQUFZLFVBQVUsR0FBRztBQUUzQix1QkFBYSxNQUFNLElBQUssT0FBTyxTQUFTO0FBQUEsUUFDMUM7QUFHQSxZQUFJLGFBQWEsRUFBRyxjQUFhLE9BQU8sU0FBUztBQUNqRCxZQUFJLGNBQWMsT0FBTyxRQUFRO0FBQy9CLGNBQUksSUFBSyxRQUFPO0FBQUEsY0FDWCxjQUFhLE9BQU8sU0FBUztBQUFBLFFBQ3BDLFdBQVcsYUFBYSxHQUFHO0FBQ3pCLGNBQUksSUFBSyxjQUFhO0FBQUEsY0FDakIsUUFBTztBQUFBLFFBQ2Q7QUFHQSxZQUFJLE9BQU8sUUFBUSxVQUFVO0FBQzNCLGdCQUFNQSxRQUFPLEtBQUssS0FBSyxRQUFRO0FBQUEsUUFDakM7QUFHQSxZQUFJQSxRQUFPLFNBQVMsR0FBRyxHQUFHO0FBRXhCLGNBQUksSUFBSSxXQUFXLEdBQUc7QUFDcEIsbUJBQU87QUFBQSxVQUNUO0FBQ0EsaUJBQU8sYUFBYSxRQUFRLEtBQUssWUFBWSxVQUFVLEdBQUc7QUFBQSxRQUM1RCxXQUFXLE9BQU8sUUFBUSxVQUFVO0FBQ2xDLGdCQUFNLE1BQU07QUFDWixjQUFJLE9BQU8sV0FBVyxVQUFVLFlBQVksWUFBWTtBQUN0RCxnQkFBSSxLQUFLO0FBQ1AscUJBQU8sV0FBVyxVQUFVLFFBQVEsS0FBSyxRQUFRLEtBQUssVUFBVTtBQUFBLFlBQ2xFLE9BQU87QUFDTCxxQkFBTyxXQUFXLFVBQVUsWUFBWSxLQUFLLFFBQVEsS0FBSyxVQUFVO0FBQUEsWUFDdEU7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sYUFBYSxRQUFRLENBQUMsR0FBRyxHQUFHLFlBQVksVUFBVSxHQUFHO0FBQUEsUUFDOUQ7QUFFQSxjQUFNLElBQUksVUFBVSxzQ0FBc0M7QUFBQSxNQUM1RDtBQUVBLGVBQVMsYUFBYyxLQUFLLEtBQUssWUFBWSxVQUFVLEtBQUs7QUFDMUQsWUFBSSxZQUFZO0FBQ2hCLFlBQUksWUFBWSxJQUFJO0FBQ3BCLFlBQUksWUFBWSxJQUFJO0FBRXBCLFlBQUksYUFBYSxRQUFXO0FBQzFCLHFCQUFXLE9BQU8sUUFBUSxFQUFFLFlBQVk7QUFDeEMsY0FBSSxhQUFhLFVBQVUsYUFBYSxXQUNwQyxhQUFhLGFBQWEsYUFBYSxZQUFZO0FBQ3JELGdCQUFJLElBQUksU0FBUyxLQUFLLElBQUksU0FBUyxHQUFHO0FBQ3BDLHFCQUFPO0FBQUEsWUFDVDtBQUNBLHdCQUFZO0FBQ1oseUJBQWE7QUFDYix5QkFBYTtBQUNiLDBCQUFjO0FBQUEsVUFDaEI7QUFBQSxRQUNGO0FBRUEsaUJBQVMsS0FBTSxLQUFLRyxJQUFHO0FBQ3JCLGNBQUksY0FBYyxHQUFHO0FBQ25CLG1CQUFPLElBQUlBLEVBQUM7QUFBQSxVQUNkLE9BQU87QUFDTCxtQkFBTyxJQUFJLGFBQWFBLEtBQUksU0FBUztBQUFBLFVBQ3ZDO0FBQUEsUUFDRjtBQUVBLFlBQUk7QUFDSixZQUFJLEtBQUs7QUFDUCxjQUFJLGFBQWE7QUFDakIsZUFBSyxJQUFJLFlBQVksSUFBSSxXQUFXLEtBQUs7QUFDdkMsZ0JBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxLQUFLLEtBQUssZUFBZSxLQUFLLElBQUksSUFBSSxVQUFVLEdBQUc7QUFDdEUsa0JBQUksZUFBZSxHQUFJLGNBQWE7QUFDcEMsa0JBQUksSUFBSSxhQUFhLE1BQU0sVUFBVyxRQUFPLGFBQWE7QUFBQSxZQUM1RCxPQUFPO0FBQ0wsa0JBQUksZUFBZSxHQUFJLE1BQUssSUFBSTtBQUNoQywyQkFBYTtBQUFBLFlBQ2Y7QUFBQSxVQUNGO0FBQUEsUUFDRixPQUFPO0FBQ0wsY0FBSSxhQUFhLFlBQVksVUFBVyxjQUFhLFlBQVk7QUFDakUsZUFBSyxJQUFJLFlBQVksS0FBSyxHQUFHLEtBQUs7QUFDaEMsZ0JBQUksUUFBUTtBQUNaLHFCQUFTLElBQUksR0FBRyxJQUFJLFdBQVcsS0FBSztBQUNsQyxrQkFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsR0FBRztBQUNyQyx3QkFBUTtBQUNSO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFDQSxnQkFBSSxNQUFPLFFBQU87QUFBQSxVQUNwQjtBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFILFFBQU8sVUFBVSxXQUFXLFNBQVMsU0FBVSxLQUFLLFlBQVksVUFBVTtBQUN4RSxlQUFPLEtBQUssUUFBUSxLQUFLLFlBQVksUUFBUSxNQUFNO0FBQUEsTUFDckQ7QUFFQSxNQUFBQSxRQUFPLFVBQVUsVUFBVSxTQUFTLFFBQVMsS0FBSyxZQUFZLFVBQVU7QUFDdEUsZUFBTyxxQkFBcUIsTUFBTSxLQUFLLFlBQVksVUFBVSxJQUFJO0FBQUEsTUFDbkU7QUFFQSxNQUFBQSxRQUFPLFVBQVUsY0FBYyxTQUFTLFlBQWEsS0FBSyxZQUFZLFVBQVU7QUFDOUUsZUFBTyxxQkFBcUIsTUFBTSxLQUFLLFlBQVksVUFBVSxLQUFLO0FBQUEsTUFDcEU7QUFFQSxlQUFTLFNBQVUsS0FBSyxRQUFRLFFBQVEsUUFBUTtBQUM5QyxpQkFBUyxPQUFPLE1BQU0sS0FBSztBQUMzQixjQUFNLFlBQVksSUFBSSxTQUFTO0FBQy9CLFlBQUksQ0FBQyxRQUFRO0FBQ1gsbUJBQVM7QUFBQSxRQUNYLE9BQU87QUFDTCxtQkFBUyxPQUFPLE1BQU07QUFDdEIsY0FBSSxTQUFTLFdBQVc7QUFDdEIscUJBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUVBLGNBQU0sU0FBUyxPQUFPO0FBRXRCLFlBQUksU0FBUyxTQUFTLEdBQUc7QUFDdkIsbUJBQVMsU0FBUztBQUFBLFFBQ3BCO0FBQ0EsWUFBSTtBQUNKLGFBQUssSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLEdBQUc7QUFDM0IsZ0JBQU0sU0FBUyxTQUFTLE9BQU8sT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDbkQsY0FBSSxZQUFZLE1BQU0sRUFBRyxRQUFPO0FBQ2hDLGNBQUksU0FBUyxDQUFDLElBQUk7QUFBQSxRQUNwQjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxVQUFXLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDL0MsZUFBTyxXQUFXQyxhQUFZLFFBQVEsSUFBSSxTQUFTLE1BQU0sR0FBRyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQ2pGO0FBRUEsZUFBUyxXQUFZLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDaEQsZUFBTyxXQUFXRyxjQUFhLE1BQU0sR0FBRyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQzdEO0FBRUEsZUFBUyxZQUFhLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDakQsZUFBTyxXQUFXRixlQUFjLE1BQU0sR0FBRyxLQUFLLFFBQVEsTUFBTTtBQUFBLE1BQzlEO0FBRUEsZUFBUyxVQUFXLEtBQUssUUFBUSxRQUFRLFFBQVE7QUFDL0MsZUFBTyxXQUFXLGVBQWUsUUFBUSxJQUFJLFNBQVMsTUFBTSxHQUFHLEtBQUssUUFBUSxNQUFNO0FBQUEsTUFDcEY7QUFFQSxNQUFBRixRQUFPLFVBQVUsUUFBUSxTQUFTLE1BQU8sUUFBUSxRQUFRLFFBQVEsVUFBVTtBQUV6RSxZQUFJLFdBQVcsUUFBVztBQUN4QixxQkFBVztBQUNYLG1CQUFTLEtBQUs7QUFDZCxtQkFBUztBQUFBLFFBRVgsV0FBVyxXQUFXLFVBQWEsT0FBTyxXQUFXLFVBQVU7QUFDN0QscUJBQVc7QUFDWCxtQkFBUyxLQUFLO0FBQ2QsbUJBQVM7QUFBQSxRQUVYLFdBQVcsU0FBUyxNQUFNLEdBQUc7QUFDM0IsbUJBQVMsV0FBVztBQUNwQixjQUFJLFNBQVMsTUFBTSxHQUFHO0FBQ3BCLHFCQUFTLFdBQVc7QUFDcEIsZ0JBQUksYUFBYSxPQUFXLFlBQVc7QUFBQSxVQUN6QyxPQUFPO0FBQ0wsdUJBQVc7QUFDWCxxQkFBUztBQUFBLFVBQ1g7QUFBQSxRQUNGLE9BQU87QUFDTCxnQkFBTSxJQUFJO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBRUEsY0FBTSxZQUFZLEtBQUssU0FBUztBQUNoQyxZQUFJLFdBQVcsVUFBYSxTQUFTLFVBQVcsVUFBUztBQUV6RCxZQUFLLE9BQU8sU0FBUyxNQUFNLFNBQVMsS0FBSyxTQUFTLE1BQU8sU0FBUyxLQUFLLFFBQVE7QUFDN0UsZ0JBQU0sSUFBSSxXQUFXLHdDQUF3QztBQUFBLFFBQy9EO0FBRUEsWUFBSSxDQUFDLFNBQVUsWUFBVztBQUUxQixZQUFJLGNBQWM7QUFDbEIsbUJBQVM7QUFDUCxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsS0FBSztBQUNILHFCQUFPLFNBQVMsTUFBTSxRQUFRLFFBQVEsTUFBTTtBQUFBLFlBRTlDLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFDSCxxQkFBTyxVQUFVLE1BQU0sUUFBUSxRQUFRLE1BQU07QUFBQSxZQUUvQyxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQUEsWUFDTCxLQUFLO0FBQ0gscUJBQU8sV0FBVyxNQUFNLFFBQVEsUUFBUSxNQUFNO0FBQUEsWUFFaEQsS0FBSztBQUVILHFCQUFPLFlBQVksTUFBTSxRQUFRLFFBQVEsTUFBTTtBQUFBLFlBRWpELEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFBQSxZQUNMLEtBQUs7QUFDSCxxQkFBTyxVQUFVLE1BQU0sUUFBUSxRQUFRLE1BQU07QUFBQSxZQUUvQztBQUNFLGtCQUFJLFlBQWEsT0FBTSxJQUFJLFVBQVUsdUJBQXVCLFFBQVE7QUFDcEUsMEJBQVksS0FBSyxVQUFVLFlBQVk7QUFDdkMsNEJBQWM7QUFBQSxVQUNsQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsTUFBQUEsUUFBTyxVQUFVLFNBQVMsU0FBUyxTQUFVO0FBQzNDLGVBQU87QUFBQSxVQUNMLE1BQU07QUFBQSxVQUNOLE1BQU0sTUFBTSxVQUFVLE1BQU0sS0FBSyxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQUEsUUFDdkQ7QUFBQSxNQUNGO0FBRUEsZUFBUyxZQUFhLEtBQUssT0FBTyxLQUFLO0FBQ3JDLFlBQUksVUFBVSxLQUFLLFFBQVEsSUFBSSxRQUFRO0FBQ3JDLGlCQUFPLE9BQU8sY0FBYyxHQUFHO0FBQUEsUUFDakMsT0FBTztBQUNMLGlCQUFPLE9BQU8sY0FBYyxJQUFJLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFBQSxRQUNuRDtBQUFBLE1BQ0Y7QUFFQSxlQUFTLFVBQVcsS0FBSyxPQUFPLEtBQUs7QUFDbkMsY0FBTSxLQUFLLElBQUksSUFBSSxRQUFRLEdBQUc7QUFDOUIsY0FBTSxNQUFNLENBQUM7QUFFYixZQUFJLElBQUk7QUFDUixlQUFPLElBQUksS0FBSztBQUNkLGdCQUFNLFlBQVksSUFBSSxDQUFDO0FBQ3ZCLGNBQUksWUFBWTtBQUNoQixjQUFJLG1CQUFvQixZQUFZLE1BQ2hDLElBQ0MsWUFBWSxNQUNULElBQ0MsWUFBWSxNQUNULElBQ0E7QUFFWixjQUFJLElBQUksb0JBQW9CLEtBQUs7QUFDL0IsZ0JBQUksWUFBWSxXQUFXLFlBQVk7QUFFdkMsb0JBQVEsa0JBQWtCO0FBQUEsY0FDeEIsS0FBSztBQUNILG9CQUFJLFlBQVksS0FBTTtBQUNwQiw4QkFBWTtBQUFBLGdCQUNkO0FBQ0E7QUFBQSxjQUNGLEtBQUs7QUFDSCw2QkFBYSxJQUFJLElBQUksQ0FBQztBQUN0QixxQkFBSyxhQUFhLFNBQVUsS0FBTTtBQUNoQyxtQ0FBaUIsWUFBWSxPQUFTLElBQU8sYUFBYTtBQUMxRCxzQkFBSSxnQkFBZ0IsS0FBTTtBQUN4QixnQ0FBWTtBQUFBLGtCQUNkO0FBQUEsZ0JBQ0Y7QUFDQTtBQUFBLGNBQ0YsS0FBSztBQUNILDZCQUFhLElBQUksSUFBSSxDQUFDO0FBQ3RCLDRCQUFZLElBQUksSUFBSSxDQUFDO0FBQ3JCLHFCQUFLLGFBQWEsU0FBVSxRQUFTLFlBQVksU0FBVSxLQUFNO0FBQy9ELG1DQUFpQixZQUFZLE9BQVEsTUFBTyxhQUFhLE9BQVMsSUFBTyxZQUFZO0FBQ3JGLHNCQUFJLGdCQUFnQixTQUFVLGdCQUFnQixTQUFVLGdCQUFnQixRQUFTO0FBQy9FLGdDQUFZO0FBQUEsa0JBQ2Q7QUFBQSxnQkFDRjtBQUNBO0FBQUEsY0FDRixLQUFLO0FBQ0gsNkJBQWEsSUFBSSxJQUFJLENBQUM7QUFDdEIsNEJBQVksSUFBSSxJQUFJLENBQUM7QUFDckIsNkJBQWEsSUFBSSxJQUFJLENBQUM7QUFDdEIscUJBQUssYUFBYSxTQUFVLFFBQVMsWUFBWSxTQUFVLFFBQVMsYUFBYSxTQUFVLEtBQU07QUFDL0YsbUNBQWlCLFlBQVksT0FBUSxNQUFRLGFBQWEsT0FBUyxNQUFPLFlBQVksT0FBUyxJQUFPLGFBQWE7QUFDbkgsc0JBQUksZ0JBQWdCLFNBQVUsZ0JBQWdCLFNBQVU7QUFDdEQsZ0NBQVk7QUFBQSxrQkFDZDtBQUFBLGdCQUNGO0FBQUEsWUFDSjtBQUFBLFVBQ0Y7QUFFQSxjQUFJLGNBQWMsTUFBTTtBQUd0Qix3QkFBWTtBQUNaLCtCQUFtQjtBQUFBLFVBQ3JCLFdBQVcsWUFBWSxPQUFRO0FBRTdCLHlCQUFhO0FBQ2IsZ0JBQUksS0FBSyxjQUFjLEtBQUssT0FBUSxLQUFNO0FBQzFDLHdCQUFZLFFBQVMsWUFBWTtBQUFBLFVBQ25DO0FBRUEsY0FBSSxLQUFLLFNBQVM7QUFDbEIsZUFBSztBQUFBLFFBQ1A7QUFFQSxlQUFPLHNCQUFzQixHQUFHO0FBQUEsTUFDbEM7QUFLQSxVQUFNLHVCQUF1QjtBQUU3QixlQUFTLHNCQUF1QixZQUFZO0FBQzFDLGNBQU0sTUFBTSxXQUFXO0FBQ3ZCLFlBQUksT0FBTyxzQkFBc0I7QUFDL0IsaUJBQU8sT0FBTyxhQUFhLE1BQU0sUUFBUSxVQUFVO0FBQUEsUUFDckQ7QUFHQSxZQUFJLE1BQU07QUFDVixZQUFJLElBQUk7QUFDUixlQUFPLElBQUksS0FBSztBQUNkLGlCQUFPLE9BQU8sYUFBYTtBQUFBLFlBQ3pCO0FBQUEsWUFDQSxXQUFXLE1BQU0sR0FBRyxLQUFLLG9CQUFvQjtBQUFBLFVBQy9DO0FBQUEsUUFDRjtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxXQUFZLEtBQUssT0FBTyxLQUFLO0FBQ3BDLFlBQUksTUFBTTtBQUNWLGNBQU0sS0FBSyxJQUFJLElBQUksUUFBUSxHQUFHO0FBRTlCLGlCQUFTLElBQUksT0FBTyxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQ2hDLGlCQUFPLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxHQUFJO0FBQUEsUUFDMUM7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVMsWUFBYSxLQUFLLE9BQU8sS0FBSztBQUNyQyxZQUFJLE1BQU07QUFDVixjQUFNLEtBQUssSUFBSSxJQUFJLFFBQVEsR0FBRztBQUU5QixpQkFBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLEVBQUUsR0FBRztBQUNoQyxpQkFBTyxPQUFPLGFBQWEsSUFBSSxDQUFDLENBQUM7QUFBQSxRQUNuQztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxTQUFVLEtBQUssT0FBTyxLQUFLO0FBQ2xDLGNBQU0sTUFBTSxJQUFJO0FBRWhCLFlBQUksQ0FBQyxTQUFTLFFBQVEsRUFBRyxTQUFRO0FBQ2pDLFlBQUksQ0FBQyxPQUFPLE1BQU0sS0FBSyxNQUFNLElBQUssT0FBTTtBQUV4QyxZQUFJLE1BQU07QUFDVixpQkFBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLEVBQUUsR0FBRztBQUNoQyxpQkFBTyxvQkFBb0IsSUFBSSxDQUFDLENBQUM7QUFBQSxRQUNuQztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxhQUFjLEtBQUssT0FBTyxLQUFLO0FBQ3RDLGNBQU0sUUFBUSxJQUFJLE1BQU0sT0FBTyxHQUFHO0FBQ2xDLFlBQUksTUFBTTtBQUVWLGlCQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sU0FBUyxHQUFHLEtBQUssR0FBRztBQUM1QyxpQkFBTyxPQUFPLGFBQWEsTUFBTSxDQUFDLElBQUssTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFJO0FBQUEsUUFDNUQ7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxRQUFRLFNBQVMsTUFBTyxPQUFPLEtBQUs7QUFDbkQsY0FBTSxNQUFNLEtBQUs7QUFDakIsZ0JBQVEsQ0FBQyxDQUFDO0FBQ1YsY0FBTSxRQUFRLFNBQVksTUFBTSxDQUFDLENBQUM7QUFFbEMsWUFBSSxRQUFRLEdBQUc7QUFDYixtQkFBUztBQUNULGNBQUksUUFBUSxFQUFHLFNBQVE7QUFBQSxRQUN6QixXQUFXLFFBQVEsS0FBSztBQUN0QixrQkFBUTtBQUFBLFFBQ1Y7QUFFQSxZQUFJLE1BQU0sR0FBRztBQUNYLGlCQUFPO0FBQ1AsY0FBSSxNQUFNLEVBQUcsT0FBTTtBQUFBLFFBQ3JCLFdBQVcsTUFBTSxLQUFLO0FBQ3BCLGdCQUFNO0FBQUEsUUFDUjtBQUVBLFlBQUksTUFBTSxNQUFPLE9BQU07QUFFdkIsY0FBTSxTQUFTLEtBQUssU0FBUyxPQUFPLEdBQUc7QUFFdkMsZUFBTyxlQUFlLFFBQVFBLFFBQU8sU0FBUztBQUU5QyxlQUFPO0FBQUEsTUFDVDtBQUtBLGVBQVMsWUFBYSxRQUFRLEtBQUssUUFBUTtBQUN6QyxZQUFLLFNBQVMsTUFBTyxLQUFLLFNBQVMsRUFBRyxPQUFNLElBQUksV0FBVyxvQkFBb0I7QUFDL0UsWUFBSSxTQUFTLE1BQU0sT0FBUSxPQUFNLElBQUksV0FBVyx1Q0FBdUM7QUFBQSxNQUN6RjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxhQUNqQkEsUUFBTyxVQUFVLGFBQWEsU0FBUyxXQUFZLFFBQVFLLGFBQVksVUFBVTtBQUMvRSxpQkFBUyxXQUFXO0FBQ3BCLFFBQUFBLGNBQWFBLGdCQUFlO0FBQzVCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUUEsYUFBWSxLQUFLLE1BQU07QUFFMUQsWUFBSSxNQUFNLEtBQUssTUFBTTtBQUNyQixZQUFJLE1BQU07QUFDVixZQUFJLElBQUk7QUFDUixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGlCQUFPLEtBQUssU0FBUyxDQUFDLElBQUk7QUFBQSxRQUM1QjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsTUFBQUwsUUFBTyxVQUFVLGFBQ2pCQSxRQUFPLFVBQVUsYUFBYSxTQUFTLFdBQVksUUFBUUssYUFBWSxVQUFVO0FBQy9FLGlCQUFTLFdBQVc7QUFDcEIsUUFBQUEsY0FBYUEsZ0JBQWU7QUFDNUIsWUFBSSxDQUFDLFVBQVU7QUFDYixzQkFBWSxRQUFRQSxhQUFZLEtBQUssTUFBTTtBQUFBLFFBQzdDO0FBRUEsWUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFQSxXQUFVO0FBQ3BDLFlBQUksTUFBTTtBQUNWLGVBQU9BLGNBQWEsTUFBTSxPQUFPLE1BQVE7QUFDdkMsaUJBQU8sS0FBSyxTQUFTLEVBQUVBLFdBQVUsSUFBSTtBQUFBLFFBQ3ZDO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBTCxRQUFPLFVBQVUsWUFDakJBLFFBQU8sVUFBVSxZQUFZLFNBQVMsVUFBVyxRQUFRLFVBQVU7QUFDakUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFDakQsZUFBTyxLQUFLLE1BQU07QUFBQSxNQUNwQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUNqQkEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLFFBQVEsVUFBVTtBQUN2RSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxlQUFPLEtBQUssTUFBTSxJQUFLLEtBQUssU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUM3QztBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUNqQkEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLFFBQVEsVUFBVTtBQUN2RSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxlQUFRLEtBQUssTUFBTSxLQUFLLElBQUssS0FBSyxTQUFTLENBQUM7QUFBQSxNQUM5QztBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUNqQkEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLFFBQVEsVUFBVTtBQUN2RSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUVqRCxnQkFBUyxLQUFLLE1BQU0sSUFDZixLQUFLLFNBQVMsQ0FBQyxLQUFLLElBQ3BCLEtBQUssU0FBUyxDQUFDLEtBQUssTUFDcEIsS0FBSyxTQUFTLENBQUMsSUFBSTtBQUFBLE1BQzFCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQ2pCQSxRQUFPLFVBQVUsZUFBZSxTQUFTLGFBQWMsUUFBUSxVQUFVO0FBQ3ZFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBRWpELGVBQVEsS0FBSyxNQUFNLElBQUksWUFDbkIsS0FBSyxTQUFTLENBQUMsS0FBSyxLQUNyQixLQUFLLFNBQVMsQ0FBQyxLQUFLLElBQ3JCLEtBQUssU0FBUyxDQUFDO0FBQUEsTUFDbkI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsa0JBQWtCLG1CQUFtQixTQUFTLGdCQUFpQixRQUFRO0FBQ3RGLGlCQUFTLFdBQVc7QUFDcEIsdUJBQWUsUUFBUSxRQUFRO0FBQy9CLGNBQU0sUUFBUSxLQUFLLE1BQU07QUFDekIsY0FBTSxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQzVCLFlBQUksVUFBVSxVQUFhLFNBQVMsUUFBVztBQUM3QyxzQkFBWSxRQUFRLEtBQUssU0FBUyxDQUFDO0FBQUEsUUFDckM7QUFFQSxjQUFNLEtBQUssUUFDVCxLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssSUFDdEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSztBQUV4QixjQUFNLEtBQUssS0FBSyxFQUFFLE1BQU0sSUFDdEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLElBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixPQUFPLEtBQUs7QUFFZCxlQUFPLE9BQU8sRUFBRSxLQUFLLE9BQU8sRUFBRSxLQUFLLE9BQU8sRUFBRTtBQUFBLE1BQzlDLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsa0JBQWtCLG1CQUFtQixTQUFTLGdCQUFpQixRQUFRO0FBQ3RGLGlCQUFTLFdBQVc7QUFDcEIsdUJBQWUsUUFBUSxRQUFRO0FBQy9CLGNBQU0sUUFBUSxLQUFLLE1BQU07QUFDekIsY0FBTSxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQzVCLFlBQUksVUFBVSxVQUFhLFNBQVMsUUFBVztBQUM3QyxzQkFBWSxRQUFRLEtBQUssU0FBUyxDQUFDO0FBQUEsUUFDckM7QUFFQSxjQUFNLEtBQUssUUFBUSxLQUFLLEtBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssSUFDdEIsS0FBSyxFQUFFLE1BQU07QUFFZixjQUFNLEtBQUssS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQy9CLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssSUFDdEI7QUFFRixnQkFBUSxPQUFPLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBSyxPQUFPLEVBQUU7QUFBQSxNQUMvQyxDQUFDO0FBRUQsTUFBQUEsUUFBTyxVQUFVLFlBQVksU0FBUyxVQUFXLFFBQVFLLGFBQVksVUFBVTtBQUM3RSxpQkFBUyxXQUFXO0FBQ3BCLFFBQUFBLGNBQWFBLGdCQUFlO0FBQzVCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUUEsYUFBWSxLQUFLLE1BQU07QUFFMUQsWUFBSSxNQUFNLEtBQUssTUFBTTtBQUNyQixZQUFJLE1BQU07QUFDVixZQUFJLElBQUk7QUFDUixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGlCQUFPLEtBQUssU0FBUyxDQUFDLElBQUk7QUFBQSxRQUM1QjtBQUNBLGVBQU87QUFFUCxZQUFJLE9BQU8sSUFBSyxRQUFPLEtBQUssSUFBSSxHQUFHLElBQUlBLFdBQVU7QUFFakQsZUFBTztBQUFBLE1BQ1Q7QUFFQSxNQUFBTCxRQUFPLFVBQVUsWUFBWSxTQUFTLFVBQVcsUUFBUUssYUFBWSxVQUFVO0FBQzdFLGlCQUFTLFdBQVc7QUFDcEIsUUFBQUEsY0FBYUEsZ0JBQWU7QUFDNUIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRQSxhQUFZLEtBQUssTUFBTTtBQUUxRCxZQUFJLElBQUlBO0FBQ1IsWUFBSSxNQUFNO0FBQ1YsWUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7QUFDM0IsZUFBTyxJQUFJLE1BQU0sT0FBTyxNQUFRO0FBQzlCLGlCQUFPLEtBQUssU0FBUyxFQUFFLENBQUMsSUFBSTtBQUFBLFFBQzlCO0FBQ0EsZUFBTztBQUVQLFlBQUksT0FBTyxJQUFLLFFBQU8sS0FBSyxJQUFJLEdBQUcsSUFBSUEsV0FBVTtBQUVqRCxlQUFPO0FBQUEsTUFDVDtBQUVBLE1BQUFMLFFBQU8sVUFBVSxXQUFXLFNBQVMsU0FBVSxRQUFRLFVBQVU7QUFDL0QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFDakQsWUFBSSxFQUFFLEtBQUssTUFBTSxJQUFJLEtBQU8sUUFBUSxLQUFLLE1BQU07QUFDL0MsZ0JBQVMsTUFBTyxLQUFLLE1BQU0sSUFBSSxLQUFLO0FBQUEsTUFDdEM7QUFFQSxNQUFBQSxRQUFPLFVBQVUsY0FBYyxTQUFTLFlBQWEsUUFBUSxVQUFVO0FBQ3JFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBQ2pELGNBQU0sTUFBTSxLQUFLLE1BQU0sSUFBSyxLQUFLLFNBQVMsQ0FBQyxLQUFLO0FBQ2hELGVBQVEsTUFBTSxRQUFVLE1BQU0sYUFBYTtBQUFBLE1BQzdDO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGNBQWMsU0FBUyxZQUFhLFFBQVEsVUFBVTtBQUNyRSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxjQUFNLE1BQU0sS0FBSyxTQUFTLENBQUMsSUFBSyxLQUFLLE1BQU0sS0FBSztBQUNoRCxlQUFRLE1BQU0sUUFBVSxNQUFNLGFBQWE7QUFBQSxNQUM3QztBQUVBLE1BQUFBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxRQUFRLFVBQVU7QUFDckUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFFakQsZUFBUSxLQUFLLE1BQU0sSUFDaEIsS0FBSyxTQUFTLENBQUMsS0FBSyxJQUNwQixLQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQ3BCLEtBQUssU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUN6QjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxRQUFRLFVBQVU7QUFDckUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFFakQsZUFBUSxLQUFLLE1BQU0sS0FBSyxLQUNyQixLQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQ3BCLEtBQUssU0FBUyxDQUFDLEtBQUssSUFDcEIsS0FBSyxTQUFTLENBQUM7QUFBQSxNQUNwQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxpQkFBaUIsbUJBQW1CLFNBQVMsZUFBZ0IsUUFBUTtBQUNwRixpQkFBUyxXQUFXO0FBQ3BCLHVCQUFlLFFBQVEsUUFBUTtBQUMvQixjQUFNLFFBQVEsS0FBSyxNQUFNO0FBQ3pCLGNBQU0sT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUM1QixZQUFJLFVBQVUsVUFBYSxTQUFTLFFBQVc7QUFDN0Msc0JBQVksUUFBUSxLQUFLLFNBQVMsQ0FBQztBQUFBLFFBQ3JDO0FBRUEsY0FBTSxNQUFNLEtBQUssU0FBUyxDQUFDLElBQ3pCLEtBQUssU0FBUyxDQUFDLElBQUksS0FBSyxJQUN4QixLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssTUFDdkIsUUFBUTtBQUVYLGdCQUFRLE9BQU8sR0FBRyxLQUFLLE9BQU8sRUFBRSxLQUM5QixPQUFPLFFBQ1AsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLElBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUN0QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssRUFBRTtBQUFBLE1BQzVCLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsaUJBQWlCLG1CQUFtQixTQUFTLGVBQWdCLFFBQVE7QUFDcEYsaUJBQVMsV0FBVztBQUNwQix1QkFBZSxRQUFRLFFBQVE7QUFDL0IsY0FBTSxRQUFRLEtBQUssTUFBTTtBQUN6QixjQUFNLE9BQU8sS0FBSyxTQUFTLENBQUM7QUFDNUIsWUFBSSxVQUFVLFVBQWEsU0FBUyxRQUFXO0FBQzdDLHNCQUFZLFFBQVEsS0FBSyxTQUFTLENBQUM7QUFBQSxRQUNyQztBQUVBLGNBQU0sT0FBTyxTQUFTO0FBQUEsUUFDcEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLEtBQ3RCLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxJQUN0QixLQUFLLEVBQUUsTUFBTTtBQUVmLGdCQUFRLE9BQU8sR0FBRyxLQUFLLE9BQU8sRUFBRSxLQUM5QixPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksS0FBSyxLQUM3QixLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssS0FDdEIsS0FBSyxFQUFFLE1BQU0sSUFBSSxLQUFLLElBQ3RCLElBQUk7QUFBQSxNQUNSLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsY0FBYyxTQUFTLFlBQWEsUUFBUSxVQUFVO0FBQ3JFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBQ2pELGVBQU8sUUFBUSxLQUFLLE1BQU0sUUFBUSxNQUFNLElBQUksQ0FBQztBQUFBLE1BQy9DO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGNBQWMsU0FBUyxZQUFhLFFBQVEsVUFBVTtBQUNyRSxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLGFBQVksUUFBUSxHQUFHLEtBQUssTUFBTTtBQUNqRCxlQUFPLFFBQVEsS0FBSyxNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUNoRDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUFlLFNBQVMsYUFBYyxRQUFRLFVBQVU7QUFDdkUsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxhQUFZLFFBQVEsR0FBRyxLQUFLLE1BQU07QUFDakQsZUFBTyxRQUFRLEtBQUssTUFBTSxRQUFRLE1BQU0sSUFBSSxDQUFDO0FBQUEsTUFDL0M7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZUFBZSxTQUFTLGFBQWMsUUFBUSxVQUFVO0FBQ3ZFLGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsYUFBWSxRQUFRLEdBQUcsS0FBSyxNQUFNO0FBQ2pELGVBQU8sUUFBUSxLQUFLLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQztBQUFBLE1BQ2hEO0FBRUEsZUFBUyxTQUFVLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSyxLQUFLO0FBQ3BELFlBQUksQ0FBQ0EsUUFBTyxTQUFTLEdBQUcsRUFBRyxPQUFNLElBQUksVUFBVSw2Q0FBNkM7QUFDNUYsWUFBSSxRQUFRLE9BQU8sUUFBUSxJQUFLLE9BQU0sSUFBSSxXQUFXLG1DQUFtQztBQUN4RixZQUFJLFNBQVMsTUFBTSxJQUFJLE9BQVEsT0FBTSxJQUFJLFdBQVcsb0JBQW9CO0FBQUEsTUFDMUU7QUFFQSxNQUFBQSxRQUFPLFVBQVUsY0FDakJBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxPQUFPLFFBQVFLLGFBQVksVUFBVTtBQUN4RixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixRQUFBQSxjQUFhQSxnQkFBZTtBQUM1QixZQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFNLFdBQVcsS0FBSyxJQUFJLEdBQUcsSUFBSUEsV0FBVSxJQUFJO0FBQy9DLG1CQUFTLE1BQU0sT0FBTyxRQUFRQSxhQUFZLFVBQVUsQ0FBQztBQUFBLFFBQ3ZEO0FBRUEsWUFBSSxNQUFNO0FBQ1YsWUFBSSxJQUFJO0FBQ1IsYUFBSyxNQUFNLElBQUksUUFBUTtBQUN2QixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGVBQUssU0FBUyxDQUFDLElBQUssUUFBUSxNQUFPO0FBQUEsUUFDckM7QUFFQSxlQUFPLFNBQVNBO0FBQUEsTUFDbEI7QUFFQSxNQUFBTCxRQUFPLFVBQVUsY0FDakJBLFFBQU8sVUFBVSxjQUFjLFNBQVMsWUFBYSxPQUFPLFFBQVFLLGFBQVksVUFBVTtBQUN4RixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixRQUFBQSxjQUFhQSxnQkFBZTtBQUM1QixZQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFNLFdBQVcsS0FBSyxJQUFJLEdBQUcsSUFBSUEsV0FBVSxJQUFJO0FBQy9DLG1CQUFTLE1BQU0sT0FBTyxRQUFRQSxhQUFZLFVBQVUsQ0FBQztBQUFBLFFBQ3ZEO0FBRUEsWUFBSSxJQUFJQSxjQUFhO0FBQ3JCLFlBQUksTUFBTTtBQUNWLGFBQUssU0FBUyxDQUFDLElBQUksUUFBUTtBQUMzQixlQUFPLEVBQUUsS0FBSyxNQUFNLE9BQU8sTUFBUTtBQUNqQyxlQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVEsTUFBTztBQUFBLFFBQ3JDO0FBRUEsZUFBTyxTQUFTQTtBQUFBLE1BQ2xCO0FBRUEsTUFBQUwsUUFBTyxVQUFVLGFBQ2pCQSxRQUFPLFVBQVUsYUFBYSxTQUFTLFdBQVksT0FBTyxRQUFRLFVBQVU7QUFDMUUsZ0JBQVEsQ0FBQztBQUNULGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsVUFBUyxNQUFNLE9BQU8sUUFBUSxHQUFHLEtBQU0sQ0FBQztBQUN2RCxhQUFLLE1BQU0sSUFBSyxRQUFRO0FBQ3hCLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGdCQUNqQkEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLGNBQWUsT0FBTyxRQUFRLFVBQVU7QUFDaEYsZ0JBQVEsQ0FBQztBQUNULGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsVUFBUyxNQUFNLE9BQU8sUUFBUSxHQUFHLE9BQVEsQ0FBQztBQUN6RCxhQUFLLE1BQU0sSUFBSyxRQUFRO0FBQ3hCLGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxnQkFDakJBLFFBQU8sVUFBVSxnQkFBZ0IsU0FBUyxjQUFlLE9BQU8sUUFBUSxVQUFVO0FBQ2hGLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxPQUFRLENBQUM7QUFDekQsYUFBSyxNQUFNLElBQUssVUFBVTtBQUMxQixhQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVE7QUFDNUIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZ0JBQ2pCQSxRQUFPLFVBQVUsZ0JBQWdCLFNBQVMsY0FBZSxPQUFPLFFBQVEsVUFBVTtBQUNoRixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxVQUFTLE1BQU0sT0FBTyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzdELGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixhQUFLLFNBQVMsQ0FBQyxJQUFLLFVBQVU7QUFDOUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGFBQUssTUFBTSxJQUFLLFFBQVE7QUFDeEIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZ0JBQ2pCQSxRQUFPLFVBQVUsZ0JBQWdCLFNBQVMsY0FBZSxPQUFPLFFBQVEsVUFBVTtBQUNoRixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxVQUFTLE1BQU0sT0FBTyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzdELGFBQUssTUFBTSxJQUFLLFVBQVU7QUFDMUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixhQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVE7QUFDNUIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxlQUFTLGVBQWdCLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSztBQUNyRCxtQkFBVyxPQUFPLEtBQUssS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUUxQyxZQUFJLEtBQUssT0FBTyxRQUFRLE9BQU8sVUFBVSxDQUFDO0FBQzFDLFlBQUksUUFBUSxJQUFJO0FBQ2hCLGFBQUssTUFBTTtBQUNYLFlBQUksUUFBUSxJQUFJO0FBQ2hCLGFBQUssTUFBTTtBQUNYLFlBQUksUUFBUSxJQUFJO0FBQ2hCLGFBQUssTUFBTTtBQUNYLFlBQUksUUFBUSxJQUFJO0FBQ2hCLFlBQUksS0FBSyxPQUFPLFNBQVMsT0FBTyxFQUFFLElBQUksT0FBTyxVQUFVLENBQUM7QUFDeEQsWUFBSSxRQUFRLElBQUk7QUFDaEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxRQUFRLElBQUk7QUFDaEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxRQUFRLElBQUk7QUFDaEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxRQUFRLElBQUk7QUFDaEIsZUFBTztBQUFBLE1BQ1Q7QUFFQSxlQUFTLGVBQWdCLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSztBQUNyRCxtQkFBVyxPQUFPLEtBQUssS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUUxQyxZQUFJLEtBQUssT0FBTyxRQUFRLE9BQU8sVUFBVSxDQUFDO0FBQzFDLFlBQUksU0FBUyxDQUFDLElBQUk7QUFDbEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxTQUFTLENBQUMsSUFBSTtBQUNsQixhQUFLLE1BQU07QUFDWCxZQUFJLFNBQVMsQ0FBQyxJQUFJO0FBQ2xCLGFBQUssTUFBTTtBQUNYLFlBQUksU0FBUyxDQUFDLElBQUk7QUFDbEIsWUFBSSxLQUFLLE9BQU8sU0FBUyxPQUFPLEVBQUUsSUFBSSxPQUFPLFVBQVUsQ0FBQztBQUN4RCxZQUFJLFNBQVMsQ0FBQyxJQUFJO0FBQ2xCLGFBQUssTUFBTTtBQUNYLFlBQUksU0FBUyxDQUFDLElBQUk7QUFDbEIsYUFBSyxNQUFNO0FBQ1gsWUFBSSxTQUFTLENBQUMsSUFBSTtBQUNsQixhQUFLLE1BQU07QUFDWCxZQUFJLE1BQU0sSUFBSTtBQUNkLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLG1CQUFtQixtQkFBbUIsU0FBUyxpQkFBa0IsT0FBTyxTQUFTLEdBQUc7QUFDbkcsZUFBTyxlQUFlLE1BQU0sT0FBTyxRQUFRLE9BQU8sQ0FBQyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7QUFBQSxNQUNwRixDQUFDO0FBRUQsTUFBQUEsUUFBTyxVQUFVLG1CQUFtQixtQkFBbUIsU0FBUyxpQkFBa0IsT0FBTyxTQUFTLEdBQUc7QUFDbkcsZUFBTyxlQUFlLE1BQU0sT0FBTyxRQUFRLE9BQU8sQ0FBQyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7QUFBQSxNQUNwRixDQUFDO0FBRUQsTUFBQUEsUUFBTyxVQUFVLGFBQWEsU0FBUyxXQUFZLE9BQU8sUUFBUUssYUFBWSxVQUFVO0FBQ3RGLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxVQUFVO0FBQ2IsZ0JBQU0sUUFBUSxLQUFLLElBQUksR0FBSSxJQUFJQSxjQUFjLENBQUM7QUFFOUMsbUJBQVMsTUFBTSxPQUFPLFFBQVFBLGFBQVksUUFBUSxHQUFHLENBQUMsS0FBSztBQUFBLFFBQzdEO0FBRUEsWUFBSSxJQUFJO0FBQ1IsWUFBSSxNQUFNO0FBQ1YsWUFBSSxNQUFNO0FBQ1YsYUFBSyxNQUFNLElBQUksUUFBUTtBQUN2QixlQUFPLEVBQUUsSUFBSUEsZ0JBQWUsT0FBTyxNQUFRO0FBQ3pDLGNBQUksUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLE1BQU0sR0FBRztBQUN4RCxrQkFBTTtBQUFBLFVBQ1I7QUFDQSxlQUFLLFNBQVMsQ0FBQyxLQUFNLFFBQVEsT0FBUSxLQUFLLE1BQU07QUFBQSxRQUNsRDtBQUVBLGVBQU8sU0FBU0E7QUFBQSxNQUNsQjtBQUVBLE1BQUFMLFFBQU8sVUFBVSxhQUFhLFNBQVMsV0FBWSxPQUFPLFFBQVFLLGFBQVksVUFBVTtBQUN0RixnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsVUFBVTtBQUNiLGdCQUFNLFFBQVEsS0FBSyxJQUFJLEdBQUksSUFBSUEsY0FBYyxDQUFDO0FBRTlDLG1CQUFTLE1BQU0sT0FBTyxRQUFRQSxhQUFZLFFBQVEsR0FBRyxDQUFDLEtBQUs7QUFBQSxRQUM3RDtBQUVBLFlBQUksSUFBSUEsY0FBYTtBQUNyQixZQUFJLE1BQU07QUFDVixZQUFJLE1BQU07QUFDVixhQUFLLFNBQVMsQ0FBQyxJQUFJLFFBQVE7QUFDM0IsZUFBTyxFQUFFLEtBQUssTUFBTSxPQUFPLE1BQVE7QUFDakMsY0FBSSxRQUFRLEtBQUssUUFBUSxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsTUFBTSxHQUFHO0FBQ3hELGtCQUFNO0FBQUEsVUFDUjtBQUNBLGVBQUssU0FBUyxDQUFDLEtBQU0sUUFBUSxPQUFRLEtBQUssTUFBTTtBQUFBLFFBQ2xEO0FBRUEsZUFBTyxTQUFTQTtBQUFBLE1BQ2xCO0FBRUEsTUFBQUwsUUFBTyxVQUFVLFlBQVksU0FBUyxVQUFXLE9BQU8sUUFBUSxVQUFVO0FBQ3hFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxLQUFNLElBQUs7QUFDM0QsWUFBSSxRQUFRLEVBQUcsU0FBUSxNQUFPLFFBQVE7QUFDdEMsYUFBSyxNQUFNLElBQUssUUFBUTtBQUN4QixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUFlLFNBQVMsYUFBYyxPQUFPLFFBQVEsVUFBVTtBQUM5RSxnQkFBUSxDQUFDO0FBQ1QsaUJBQVMsV0FBVztBQUNwQixZQUFJLENBQUMsU0FBVSxVQUFTLE1BQU0sT0FBTyxRQUFRLEdBQUcsT0FBUSxNQUFPO0FBQy9ELGFBQUssTUFBTSxJQUFLLFFBQVE7QUFDeEIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLE9BQU8sUUFBUSxVQUFVO0FBQzlFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxPQUFRLE1BQU87QUFDL0QsYUFBSyxNQUFNLElBQUssVUFBVTtBQUMxQixhQUFLLFNBQVMsQ0FBQyxJQUFLLFFBQVE7QUFDNUIsZUFBTyxTQUFTO0FBQUEsTUFDbEI7QUFFQSxNQUFBQSxRQUFPLFVBQVUsZUFBZSxTQUFTLGFBQWMsT0FBTyxRQUFRLFVBQVU7QUFDOUUsZ0JBQVEsQ0FBQztBQUNULGlCQUFTLFdBQVc7QUFDcEIsWUFBSSxDQUFDLFNBQVUsVUFBUyxNQUFNLE9BQU8sUUFBUSxHQUFHLFlBQVksV0FBVztBQUN2RSxhQUFLLE1BQU0sSUFBSyxRQUFRO0FBQ3hCLGFBQUssU0FBUyxDQUFDLElBQUssVUFBVTtBQUM5QixhQUFLLFNBQVMsQ0FBQyxJQUFLLFVBQVU7QUFDOUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLE9BQU8sUUFBUSxVQUFVO0FBQzlFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxTQUFVLFVBQVMsTUFBTSxPQUFPLFFBQVEsR0FBRyxZQUFZLFdBQVc7QUFDdkUsWUFBSSxRQUFRLEVBQUcsU0FBUSxhQUFhLFFBQVE7QUFDNUMsYUFBSyxNQUFNLElBQUssVUFBVTtBQUMxQixhQUFLLFNBQVMsQ0FBQyxJQUFLLFVBQVU7QUFDOUIsYUFBSyxTQUFTLENBQUMsSUFBSyxVQUFVO0FBQzlCLGFBQUssU0FBUyxDQUFDLElBQUssUUFBUTtBQUM1QixlQUFPLFNBQVM7QUFBQSxNQUNsQjtBQUVBLE1BQUFBLFFBQU8sVUFBVSxrQkFBa0IsbUJBQW1CLFNBQVMsZ0JBQWlCLE9BQU8sU0FBUyxHQUFHO0FBQ2pHLGVBQU8sZUFBZSxNQUFNLE9BQU8sUUFBUSxDQUFDLE9BQU8sb0JBQW9CLEdBQUcsT0FBTyxvQkFBb0IsQ0FBQztBQUFBLE1BQ3hHLENBQUM7QUFFRCxNQUFBQSxRQUFPLFVBQVUsa0JBQWtCLG1CQUFtQixTQUFTLGdCQUFpQixPQUFPLFNBQVMsR0FBRztBQUNqRyxlQUFPLGVBQWUsTUFBTSxPQUFPLFFBQVEsQ0FBQyxPQUFPLG9CQUFvQixHQUFHLE9BQU8sb0JBQW9CLENBQUM7QUFBQSxNQUN4RyxDQUFDO0FBRUQsZUFBUyxhQUFjLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBSyxLQUFLO0FBQ3hELFlBQUksU0FBUyxNQUFNLElBQUksT0FBUSxPQUFNLElBQUksV0FBVyxvQkFBb0I7QUFDeEUsWUFBSSxTQUFTLEVBQUcsT0FBTSxJQUFJLFdBQVcsb0JBQW9CO0FBQUEsTUFDM0Q7QUFFQSxlQUFTLFdBQVksS0FBSyxPQUFPLFFBQVEsY0FBYyxVQUFVO0FBQy9ELGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxVQUFVO0FBQ2IsdUJBQWEsS0FBSyxPQUFPLFFBQVEsR0FBRyxzQkFBd0IscUJBQXVCO0FBQUEsUUFDckY7QUFDQSxnQkFBUSxNQUFNLEtBQUssT0FBTyxRQUFRLGNBQWMsSUFBSSxDQUFDO0FBQ3JELGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGVBQWUsU0FBUyxhQUFjLE9BQU8sUUFBUSxVQUFVO0FBQzlFLGVBQU8sV0FBVyxNQUFNLE9BQU8sUUFBUSxNQUFNLFFBQVE7QUFBQSxNQUN2RDtBQUVBLE1BQUFBLFFBQU8sVUFBVSxlQUFlLFNBQVMsYUFBYyxPQUFPLFFBQVEsVUFBVTtBQUM5RSxlQUFPLFdBQVcsTUFBTSxPQUFPLFFBQVEsT0FBTyxRQUFRO0FBQUEsTUFDeEQ7QUFFQSxlQUFTLFlBQWEsS0FBSyxPQUFPLFFBQVEsY0FBYyxVQUFVO0FBQ2hFLGdCQUFRLENBQUM7QUFDVCxpQkFBUyxXQUFXO0FBQ3BCLFlBQUksQ0FBQyxVQUFVO0FBQ2IsdUJBQWEsS0FBSyxPQUFPLFFBQVEsR0FBRyx1QkFBeUIsc0JBQXdCO0FBQUEsUUFDdkY7QUFDQSxnQkFBUSxNQUFNLEtBQUssT0FBTyxRQUFRLGNBQWMsSUFBSSxDQUFDO0FBQ3JELGVBQU8sU0FBUztBQUFBLE1BQ2xCO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLGNBQWUsT0FBTyxRQUFRLFVBQVU7QUFDaEYsZUFBTyxZQUFZLE1BQU0sT0FBTyxRQUFRLE1BQU0sUUFBUTtBQUFBLE1BQ3hEO0FBRUEsTUFBQUEsUUFBTyxVQUFVLGdCQUFnQixTQUFTLGNBQWUsT0FBTyxRQUFRLFVBQVU7QUFDaEYsZUFBTyxZQUFZLE1BQU0sT0FBTyxRQUFRLE9BQU8sUUFBUTtBQUFBLE1BQ3pEO0FBR0EsTUFBQUEsUUFBTyxVQUFVLE9BQU8sU0FBUyxLQUFNLFFBQVEsYUFBYSxPQUFPLEtBQUs7QUFDdEUsWUFBSSxDQUFDQSxRQUFPLFNBQVMsTUFBTSxFQUFHLE9BQU0sSUFBSSxVQUFVLDZCQUE2QjtBQUMvRSxZQUFJLENBQUMsTUFBTyxTQUFRO0FBQ3BCLFlBQUksQ0FBQyxPQUFPLFFBQVEsRUFBRyxPQUFNLEtBQUs7QUFDbEMsWUFBSSxlQUFlLE9BQU8sT0FBUSxlQUFjLE9BQU87QUFDdkQsWUFBSSxDQUFDLFlBQWEsZUFBYztBQUNoQyxZQUFJLE1BQU0sS0FBSyxNQUFNLE1BQU8sT0FBTTtBQUdsQyxZQUFJLFFBQVEsTUFBTyxRQUFPO0FBQzFCLFlBQUksT0FBTyxXQUFXLEtBQUssS0FBSyxXQUFXLEVBQUcsUUFBTztBQUdyRCxZQUFJLGNBQWMsR0FBRztBQUNuQixnQkFBTSxJQUFJLFdBQVcsMkJBQTJCO0FBQUEsUUFDbEQ7QUFDQSxZQUFJLFFBQVEsS0FBSyxTQUFTLEtBQUssT0FBUSxPQUFNLElBQUksV0FBVyxvQkFBb0I7QUFDaEYsWUFBSSxNQUFNLEVBQUcsT0FBTSxJQUFJLFdBQVcseUJBQXlCO0FBRzNELFlBQUksTUFBTSxLQUFLLE9BQVEsT0FBTSxLQUFLO0FBQ2xDLFlBQUksT0FBTyxTQUFTLGNBQWMsTUFBTSxPQUFPO0FBQzdDLGdCQUFNLE9BQU8sU0FBUyxjQUFjO0FBQUEsUUFDdEM7QUFFQSxjQUFNLE1BQU0sTUFBTTtBQUVsQixZQUFJLFNBQVMsVUFBVSxPQUFPLFdBQVcsVUFBVSxlQUFlLFlBQVk7QUFFNUUsZUFBSyxXQUFXLGFBQWEsT0FBTyxHQUFHO0FBQUEsUUFDekMsT0FBTztBQUNMLHFCQUFXLFVBQVUsSUFBSTtBQUFBLFlBQ3ZCO0FBQUEsWUFDQSxLQUFLLFNBQVMsT0FBTyxHQUFHO0FBQUEsWUFDeEI7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBTUEsTUFBQUEsUUFBTyxVQUFVLE9BQU8sU0FBUyxLQUFNLEtBQUssT0FBTyxLQUFLLFVBQVU7QUFFaEUsWUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixjQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzdCLHVCQUFXO0FBQ1gsb0JBQVE7QUFDUixrQkFBTSxLQUFLO0FBQUEsVUFDYixXQUFXLE9BQU8sUUFBUSxVQUFVO0FBQ2xDLHVCQUFXO0FBQ1gsa0JBQU0sS0FBSztBQUFBLFVBQ2I7QUFDQSxjQUFJLGFBQWEsVUFBYSxPQUFPLGFBQWEsVUFBVTtBQUMxRCxrQkFBTSxJQUFJLFVBQVUsMkJBQTJCO0FBQUEsVUFDakQ7QUFDQSxjQUFJLE9BQU8sYUFBYSxZQUFZLENBQUNBLFFBQU8sV0FBVyxRQUFRLEdBQUc7QUFDaEUsa0JBQU0sSUFBSSxVQUFVLHVCQUF1QixRQUFRO0FBQUEsVUFDckQ7QUFDQSxjQUFJLElBQUksV0FBVyxHQUFHO0FBQ3BCLGtCQUFNLE9BQU8sSUFBSSxXQUFXLENBQUM7QUFDN0IsZ0JBQUssYUFBYSxVQUFVLE9BQU8sT0FDL0IsYUFBYSxVQUFVO0FBRXpCLG9CQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGLFdBQVcsT0FBTyxRQUFRLFVBQVU7QUFDbEMsZ0JBQU0sTUFBTTtBQUFBLFFBQ2QsV0FBVyxPQUFPLFFBQVEsV0FBVztBQUNuQyxnQkFBTSxPQUFPLEdBQUc7QUFBQSxRQUNsQjtBQUdBLFlBQUksUUFBUSxLQUFLLEtBQUssU0FBUyxTQUFTLEtBQUssU0FBUyxLQUFLO0FBQ3pELGdCQUFNLElBQUksV0FBVyxvQkFBb0I7QUFBQSxRQUMzQztBQUVBLFlBQUksT0FBTyxPQUFPO0FBQ2hCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGdCQUFRLFVBQVU7QUFDbEIsY0FBTSxRQUFRLFNBQVksS0FBSyxTQUFTLFFBQVE7QUFFaEQsWUFBSSxDQUFDLElBQUssT0FBTTtBQUVoQixZQUFJO0FBQ0osWUFBSSxPQUFPLFFBQVEsVUFBVTtBQUMzQixlQUFLLElBQUksT0FBTyxJQUFJLEtBQUssRUFBRSxHQUFHO0FBQzVCLGlCQUFLLENBQUMsSUFBSTtBQUFBLFVBQ1o7QUFBQSxRQUNGLE9BQU87QUFDTCxnQkFBTSxRQUFRQSxRQUFPLFNBQVMsR0FBRyxJQUM3QixNQUNBQSxRQUFPLEtBQUssS0FBSyxRQUFRO0FBQzdCLGdCQUFNLE1BQU0sTUFBTTtBQUNsQixjQUFJLFFBQVEsR0FBRztBQUNiLGtCQUFNLElBQUksVUFBVSxnQkFBZ0IsTUFDbEMsbUNBQW1DO0FBQUEsVUFDdkM7QUFDQSxlQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sT0FBTyxFQUFFLEdBQUc7QUFDaEMsaUJBQUssSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLEdBQUc7QUFBQSxVQUNqQztBQUFBLFFBQ0Y7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQU1BLFVBQU0sU0FBUyxDQUFDO0FBQ2hCLGVBQVMsRUFBRyxLQUFLLFlBQVksTUFBTTtBQUNqQyxlQUFPLEdBQUcsSUFBSSxNQUFNLGtCQUFrQixLQUFLO0FBQUEsVUFDekMsY0FBZTtBQUNiLGtCQUFNO0FBRU4sbUJBQU8sZUFBZSxNQUFNLFdBQVc7QUFBQSxjQUNyQyxPQUFPLFdBQVcsTUFBTSxNQUFNLFNBQVM7QUFBQSxjQUN2QyxVQUFVO0FBQUEsY0FDVixjQUFjO0FBQUEsWUFDaEIsQ0FBQztBQUdELGlCQUFLLE9BQU8sR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHO0FBR2hDLGlCQUFLO0FBRUwsbUJBQU8sS0FBSztBQUFBLFVBQ2Q7QUFBQSxVQUVBLElBQUksT0FBUTtBQUNWLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFVBRUEsSUFBSSxLQUFNLE9BQU87QUFDZixtQkFBTyxlQUFlLE1BQU0sUUFBUTtBQUFBLGNBQ2xDLGNBQWM7QUFBQSxjQUNkLFlBQVk7QUFBQSxjQUNaO0FBQUEsY0FDQSxVQUFVO0FBQUEsWUFDWixDQUFDO0FBQUEsVUFDSDtBQUFBLFVBRUEsV0FBWTtBQUNWLG1CQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUssR0FBRyxNQUFNLEtBQUssT0FBTztBQUFBLFVBQy9DO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQTtBQUFBLFFBQUU7QUFBQSxRQUNBLFNBQVUsTUFBTTtBQUNkLGNBQUksTUFBTTtBQUNSLG1CQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ2hCO0FBRUEsaUJBQU87QUFBQSxRQUNUO0FBQUEsUUFBRztBQUFBLE1BQVU7QUFDZjtBQUFBLFFBQUU7QUFBQSxRQUNBLFNBQVUsTUFBTSxRQUFRO0FBQ3RCLGlCQUFPLFFBQVEsSUFBSSxvREFBb0QsT0FBTyxNQUFNO0FBQUEsUUFDdEY7QUFBQSxRQUFHO0FBQUEsTUFBUztBQUNkO0FBQUEsUUFBRTtBQUFBLFFBQ0EsU0FBVSxLQUFLLE9BQU8sT0FBTztBQUMzQixjQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDOUIsY0FBSSxXQUFXO0FBQ2YsY0FBSSxPQUFPLFVBQVUsS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJO0FBQ3hELHVCQUFXLHNCQUFzQixPQUFPLEtBQUssQ0FBQztBQUFBLFVBQ2hELFdBQVcsT0FBTyxVQUFVLFVBQVU7QUFDcEMsdUJBQVcsT0FBTyxLQUFLO0FBQ3ZCLGdCQUFJLFFBQVEsT0FBTyxDQUFDLEtBQUssT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFLE9BQU8sQ0FBQyxLQUFLLE9BQU8sRUFBRSxJQUFJO0FBQ3pFLHlCQUFXLHNCQUFzQixRQUFRO0FBQUEsWUFDM0M7QUFDQSx3QkFBWTtBQUFBLFVBQ2Q7QUFDQSxpQkFBTyxlQUFlLEtBQUssY0FBYyxRQUFRO0FBQ2pELGlCQUFPO0FBQUEsUUFDVDtBQUFBLFFBQUc7QUFBQSxNQUFVO0FBRWYsZUFBUyxzQkFBdUIsS0FBSztBQUNuQyxZQUFJLE1BQU07QUFDVixZQUFJLElBQUksSUFBSTtBQUNaLGNBQU0sUUFBUSxJQUFJLENBQUMsTUFBTSxNQUFNLElBQUk7QUFDbkMsZUFBTyxLQUFLLFFBQVEsR0FBRyxLQUFLLEdBQUc7QUFDN0IsZ0JBQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7QUFBQSxRQUNyQztBQUNBLGVBQU8sR0FBRyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO0FBQUEsTUFDakM7QUFLQSxlQUFTLFlBQWEsS0FBSyxRQUFRSyxhQUFZO0FBQzdDLHVCQUFlLFFBQVEsUUFBUTtBQUMvQixZQUFJLElBQUksTUFBTSxNQUFNLFVBQWEsSUFBSSxTQUFTQSxXQUFVLE1BQU0sUUFBVztBQUN2RSxzQkFBWSxRQUFRLElBQUksVUFBVUEsY0FBYSxFQUFFO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBRUEsZUFBUyxXQUFZLE9BQU8sS0FBSyxLQUFLLEtBQUssUUFBUUEsYUFBWTtBQUM3RCxZQUFJLFFBQVEsT0FBTyxRQUFRLEtBQUs7QUFDOUIsZ0JBQU0sSUFBSSxPQUFPLFFBQVEsV0FBVyxNQUFNO0FBQzFDLGNBQUk7QUFDSixjQUFJQSxjQUFhLEdBQUc7QUFDbEIsZ0JBQUksUUFBUSxLQUFLLFFBQVEsT0FBTyxDQUFDLEdBQUc7QUFDbEMsc0JBQVEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRQSxjQUFhLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFBQSxZQUM3RCxPQUFPO0FBQ0wsc0JBQVEsU0FBUyxDQUFDLFFBQVFBLGNBQWEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUN6Q0EsY0FBYSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7QUFBQSxZQUN6QztBQUFBLFVBQ0YsT0FBTztBQUNMLG9CQUFRLE1BQU0sR0FBRyxHQUFHLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUFBLFVBQ3pDO0FBQ0EsZ0JBQU0sSUFBSSxPQUFPLGlCQUFpQixTQUFTLE9BQU8sS0FBSztBQUFBLFFBQ3pEO0FBQ0Esb0JBQVksS0FBSyxRQUFRQSxXQUFVO0FBQUEsTUFDckM7QUFFQSxlQUFTLGVBQWdCLE9BQU8sTUFBTTtBQUNwQyxZQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzdCLGdCQUFNLElBQUksT0FBTyxxQkFBcUIsTUFBTSxVQUFVLEtBQUs7QUFBQSxRQUM3RDtBQUFBLE1BQ0Y7QUFFQSxlQUFTLFlBQWEsT0FBTyxRQUFRLE1BQU07QUFDekMsWUFBSSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU87QUFDL0IseUJBQWUsT0FBTyxJQUFJO0FBQzFCLGdCQUFNLElBQUksT0FBTyxpQkFBaUIsUUFBUSxVQUFVLGNBQWMsS0FBSztBQUFBLFFBQ3pFO0FBRUEsWUFBSSxTQUFTLEdBQUc7QUFDZCxnQkFBTSxJQUFJLE9BQU8seUJBQXlCO0FBQUEsUUFDNUM7QUFFQSxjQUFNLElBQUksT0FBTztBQUFBLFVBQWlCLFFBQVE7QUFBQSxVQUNSLE1BQU0sT0FBTyxJQUFJLENBQUMsV0FBVyxNQUFNO0FBQUEsVUFDbkM7QUFBQSxRQUFLO0FBQUEsTUFDekM7QUFLQSxVQUFNLG9CQUFvQjtBQUUxQixlQUFTLFlBQWEsS0FBSztBQUV6QixjQUFNLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUV0QixjQUFNLElBQUksS0FBSyxFQUFFLFFBQVEsbUJBQW1CLEVBQUU7QUFFOUMsWUFBSSxJQUFJLFNBQVMsRUFBRyxRQUFPO0FBRTNCLGVBQU8sSUFBSSxTQUFTLE1BQU0sR0FBRztBQUMzQixnQkFBTSxNQUFNO0FBQUEsUUFDZDtBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBU0osYUFBYSxRQUFRLE9BQU87QUFDbkMsZ0JBQVEsU0FBUztBQUNqQixZQUFJO0FBQ0osY0FBTSxTQUFTLE9BQU87QUFDdEIsWUFBSSxnQkFBZ0I7QUFDcEIsY0FBTSxRQUFRLENBQUM7QUFFZixpQkFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUUsR0FBRztBQUMvQixzQkFBWSxPQUFPLFdBQVcsQ0FBQztBQUcvQixjQUFJLFlBQVksU0FBVSxZQUFZLE9BQVE7QUFFNUMsZ0JBQUksQ0FBQyxlQUFlO0FBRWxCLGtCQUFJLFlBQVksT0FBUTtBQUV0QixxQkFBSyxTQUFTLEtBQUssR0FBSSxPQUFNLEtBQUssS0FBTSxLQUFNLEdBQUk7QUFDbEQ7QUFBQSxjQUNGLFdBQVcsSUFBSSxNQUFNLFFBQVE7QUFFM0IscUJBQUssU0FBUyxLQUFLLEdBQUksT0FBTSxLQUFLLEtBQU0sS0FBTSxHQUFJO0FBQ2xEO0FBQUEsY0FDRjtBQUdBLDhCQUFnQjtBQUVoQjtBQUFBLFlBQ0Y7QUFHQSxnQkFBSSxZQUFZLE9BQVE7QUFDdEIsbUJBQUssU0FBUyxLQUFLLEdBQUksT0FBTSxLQUFLLEtBQU0sS0FBTSxHQUFJO0FBQ2xELDhCQUFnQjtBQUNoQjtBQUFBLFlBQ0Y7QUFHQSx5QkFBYSxnQkFBZ0IsU0FBVSxLQUFLLFlBQVksU0FBVTtBQUFBLFVBQ3BFLFdBQVcsZUFBZTtBQUV4QixpQkFBSyxTQUFTLEtBQUssR0FBSSxPQUFNLEtBQUssS0FBTSxLQUFNLEdBQUk7QUFBQSxVQUNwRDtBQUVBLDBCQUFnQjtBQUdoQixjQUFJLFlBQVksS0FBTTtBQUNwQixpQkFBSyxTQUFTLEtBQUssRUFBRztBQUN0QixrQkFBTSxLQUFLLFNBQVM7QUFBQSxVQUN0QixXQUFXLFlBQVksTUFBTztBQUM1QixpQkFBSyxTQUFTLEtBQUssRUFBRztBQUN0QixrQkFBTTtBQUFBLGNBQ0osYUFBYSxJQUFNO0FBQUEsY0FDbkIsWUFBWSxLQUFPO0FBQUEsWUFDckI7QUFBQSxVQUNGLFdBQVcsWUFBWSxPQUFTO0FBQzlCLGlCQUFLLFNBQVMsS0FBSyxFQUFHO0FBQ3RCLGtCQUFNO0FBQUEsY0FDSixhQUFhLEtBQU07QUFBQSxjQUNuQixhQUFhLElBQU0sS0FBTztBQUFBLGNBQzFCLFlBQVksS0FBTztBQUFBLFlBQ3JCO0FBQUEsVUFDRixXQUFXLFlBQVksU0FBVTtBQUMvQixpQkFBSyxTQUFTLEtBQUssRUFBRztBQUN0QixrQkFBTTtBQUFBLGNBQ0osYUFBYSxLQUFPO0FBQUEsY0FDcEIsYUFBYSxLQUFNLEtBQU87QUFBQSxjQUMxQixhQUFhLElBQU0sS0FBTztBQUFBLGNBQzFCLFlBQVksS0FBTztBQUFBLFlBQ3JCO0FBQUEsVUFDRixPQUFPO0FBQ0wsa0JBQU0sSUFBSSxNQUFNLG9CQUFvQjtBQUFBLFVBQ3RDO0FBQUEsUUFDRjtBQUVBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBU0csY0FBYyxLQUFLO0FBQzFCLGNBQU0sWUFBWSxDQUFDO0FBQ25CLGlCQUFTLElBQUksR0FBRyxJQUFJLElBQUksUUFBUSxFQUFFLEdBQUc7QUFFbkMsb0JBQVUsS0FBSyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEdBQUk7QUFBQSxRQUN6QztBQUNBLGVBQU87QUFBQSxNQUNUO0FBRUEsZUFBUyxlQUFnQixLQUFLLE9BQU87QUFDbkMsWUFBSSxHQUFHLElBQUk7QUFDWCxjQUFNLFlBQVksQ0FBQztBQUNuQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLFFBQVEsRUFBRSxHQUFHO0FBQ25DLGVBQUssU0FBUyxLQUFLLEVBQUc7QUFFdEIsY0FBSSxJQUFJLFdBQVcsQ0FBQztBQUNwQixlQUFLLEtBQUs7QUFDVixlQUFLLElBQUk7QUFDVCxvQkFBVSxLQUFLLEVBQUU7QUFDakIsb0JBQVUsS0FBSyxFQUFFO0FBQUEsUUFDbkI7QUFFQSxlQUFPO0FBQUEsTUFDVDtBQUVBLGVBQVNGLGVBQWUsS0FBSztBQUMzQixlQUFPLE9BQU8sWUFBWSxZQUFZLEdBQUcsQ0FBQztBQUFBLE1BQzVDO0FBRUEsZUFBUyxXQUFZLEtBQUssS0FBSyxRQUFRLFFBQVE7QUFDN0MsWUFBSTtBQUNKLGFBQUssSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLEdBQUc7QUFDM0IsY0FBSyxJQUFJLFVBQVUsSUFBSSxVQUFZLEtBQUssSUFBSSxPQUFTO0FBQ3JELGNBQUksSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDO0FBQUEsUUFDekI7QUFDQSxlQUFPO0FBQUEsTUFDVDtBQUtBLGVBQVMsV0FBWSxLQUFLLE1BQU07QUFDOUIsZUFBTyxlQUFlLFFBQ25CLE9BQU8sUUFBUSxJQUFJLGVBQWUsUUFBUSxJQUFJLFlBQVksUUFBUSxRQUNqRSxJQUFJLFlBQVksU0FBUyxLQUFLO0FBQUEsTUFDcEM7QUFDQSxlQUFTLFlBQWEsS0FBSztBQUV6QixlQUFPLFFBQVE7QUFBQSxNQUNqQjtBQUlBLFVBQU0sdUJBQXVCLFdBQVk7QUFDdkMsY0FBTSxXQUFXO0FBQ2pCLGNBQU0sUUFBUSxJQUFJLE1BQU0sR0FBRztBQUMzQixpQkFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsR0FBRztBQUMzQixnQkFBTSxNQUFNLElBQUk7QUFDaEIsbUJBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLEdBQUc7QUFDM0Isa0JBQU0sTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDO0FBQUEsVUFDM0M7QUFBQSxRQUNGO0FBQ0EsZUFBTztBQUFBLE1BQ1QsR0FBRztBQUdILGVBQVMsbUJBQW9CLElBQUk7QUFDL0IsZUFBTyxPQUFPLFdBQVcsY0FBYyx5QkFBeUI7QUFBQSxNQUNsRTtBQUVBLGVBQVMseUJBQTBCO0FBQ2pDLGNBQU0sSUFBSSxNQUFNLHNCQUFzQjtBQUFBLE1BQ3hDO0FBQUE7QUFBQTs7O0FDempFQTs7O0FDQUE7QUFBQSxNQUFNLGdCQUFnQixDQUFDLFFBQVEsaUJBQWlCLGFBQWEsS0FBSyxDQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFNUYsTUFBSTtBQUNKLE1BQUk7QUFFSixXQUFTLHVCQUF1QjtBQUM1QixXQUFRLHNCQUNILG9CQUFvQjtBQUFBLE1BQ2pCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNSO0FBRUEsV0FBUywwQkFBMEI7QUFDL0IsV0FBUSx5QkFDSCx1QkFBdUI7QUFBQSxNQUNwQixVQUFVLFVBQVU7QUFBQSxNQUNwQixVQUFVLFVBQVU7QUFBQSxNQUNwQixVQUFVLFVBQVU7QUFBQSxJQUN4QjtBQUFBLEVBQ1I7QUFDQSxNQUFNLHFCQUFxQixvQkFBSSxRQUFRO0FBQ3ZDLE1BQU0saUJBQWlCLG9CQUFJLFFBQVE7QUFDbkMsTUFBTSx3QkFBd0Isb0JBQUksUUFBUTtBQUMxQyxXQUFTLGlCQUFpQixTQUFTO0FBQy9CLFVBQU0sVUFBVSxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDN0MsWUFBTSxXQUFXLE1BQU07QUFDbkIsZ0JBQVEsb0JBQW9CLFdBQVcsT0FBTztBQUM5QyxnQkFBUSxvQkFBb0IsU0FBUyxLQUFLO0FBQUEsTUFDOUM7QUFDQSxZQUFNLFVBQVUsTUFBTTtBQUNsQixnQkFBUSxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQzVCLGlCQUFTO0FBQUEsTUFDYjtBQUNBLFlBQU0sUUFBUSxNQUFNO0FBQ2hCLGVBQU8sUUFBUSxLQUFLO0FBQ3BCLGlCQUFTO0FBQUEsTUFDYjtBQUNBLGNBQVEsaUJBQWlCLFdBQVcsT0FBTztBQUMzQyxjQUFRLGlCQUFpQixTQUFTLEtBQUs7QUFBQSxJQUMzQyxDQUFDO0FBR0QsMEJBQXNCLElBQUksU0FBUyxPQUFPO0FBQzFDLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUywrQkFBK0IsSUFBSTtBQUV4QyxRQUFJLG1CQUFtQixJQUFJLEVBQUU7QUFDekI7QUFDSixVQUFNLE9BQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQzFDLFlBQU0sV0FBVyxNQUFNO0FBQ25CLFdBQUcsb0JBQW9CLFlBQVksUUFBUTtBQUMzQyxXQUFHLG9CQUFvQixTQUFTLEtBQUs7QUFDckMsV0FBRyxvQkFBb0IsU0FBUyxLQUFLO0FBQUEsTUFDekM7QUFDQSxZQUFNLFdBQVcsTUFBTTtBQUNuQixnQkFBUTtBQUNSLGlCQUFTO0FBQUEsTUFDYjtBQUNBLFlBQU0sUUFBUSxNQUFNO0FBQ2hCLGVBQU8sR0FBRyxTQUFTLElBQUksYUFBYSxjQUFjLFlBQVksQ0FBQztBQUMvRCxpQkFBUztBQUFBLE1BQ2I7QUFDQSxTQUFHLGlCQUFpQixZQUFZLFFBQVE7QUFDeEMsU0FBRyxpQkFBaUIsU0FBUyxLQUFLO0FBQ2xDLFNBQUcsaUJBQWlCLFNBQVMsS0FBSztBQUFBLElBQ3RDLENBQUM7QUFFRCx1QkFBbUIsSUFBSSxJQUFJLElBQUk7QUFBQSxFQUNuQztBQUNBLE1BQUksZ0JBQWdCO0FBQUEsSUFDaEIsSUFBSSxRQUFRLE1BQU0sVUFBVTtBQUN4QixVQUFJLGtCQUFrQixnQkFBZ0I7QUFFbEMsWUFBSSxTQUFTO0FBQ1QsaUJBQU8sbUJBQW1CLElBQUksTUFBTTtBQUV4QyxZQUFJLFNBQVMsU0FBUztBQUNsQixpQkFBTyxTQUFTLGlCQUFpQixDQUFDLElBQzVCLFNBQ0EsU0FBUyxZQUFZLFNBQVMsaUJBQWlCLENBQUMsQ0FBQztBQUFBLFFBQzNEO0FBQUEsTUFDSjtBQUVBLGFBQU8sS0FBSyxPQUFPLElBQUksQ0FBQztBQUFBLElBQzVCO0FBQUEsSUFDQSxJQUFJLFFBQVEsTUFBTSxPQUFPO0FBQ3JCLGFBQU8sSUFBSSxJQUFJO0FBQ2YsYUFBTztBQUFBLElBQ1g7QUFBQSxJQUNBLElBQUksUUFBUSxNQUFNO0FBQ2QsVUFBSSxrQkFBa0IsbUJBQ2pCLFNBQVMsVUFBVSxTQUFTLFVBQVU7QUFDdkMsZUFBTztBQUFBLE1BQ1g7QUFDQSxhQUFPLFFBQVE7QUFBQSxJQUNuQjtBQUFBLEVBQ0o7QUFDQSxXQUFTLGFBQWEsVUFBVTtBQUM1QixvQkFBZ0IsU0FBUyxhQUFhO0FBQUEsRUFDMUM7QUFDQSxXQUFTLGFBQWEsTUFBTTtBQVF4QixRQUFJLHdCQUF3QixFQUFFLFNBQVMsSUFBSSxHQUFHO0FBQzFDLGFBQU8sWUFBYSxNQUFNO0FBR3RCLGFBQUssTUFBTSxPQUFPLElBQUksR0FBRyxJQUFJO0FBQzdCLGVBQU8sS0FBSyxLQUFLLE9BQU87QUFBQSxNQUM1QjtBQUFBLElBQ0o7QUFDQSxXQUFPLFlBQWEsTUFBTTtBQUd0QixhQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQztBQUFBLElBQzlDO0FBQUEsRUFDSjtBQUNBLFdBQVMsdUJBQXVCLE9BQU87QUFDbkMsUUFBSSxPQUFPLFVBQVU7QUFDakIsYUFBTyxhQUFhLEtBQUs7QUFHN0IsUUFBSSxpQkFBaUI7QUFDakIscUNBQStCLEtBQUs7QUFDeEMsUUFBSSxjQUFjLE9BQU8scUJBQXFCLENBQUM7QUFDM0MsYUFBTyxJQUFJLE1BQU0sT0FBTyxhQUFhO0FBRXpDLFdBQU87QUFBQSxFQUNYO0FBQ0EsV0FBUyxLQUFLLE9BQU87QUFHakIsUUFBSSxpQkFBaUI7QUFDakIsYUFBTyxpQkFBaUIsS0FBSztBQUdqQyxRQUFJLGVBQWUsSUFBSSxLQUFLO0FBQ3hCLGFBQU8sZUFBZSxJQUFJLEtBQUs7QUFDbkMsVUFBTSxXQUFXLHVCQUF1QixLQUFLO0FBRzdDLFFBQUksYUFBYSxPQUFPO0FBQ3BCLHFCQUFlLElBQUksT0FBTyxRQUFRO0FBQ2xDLDRCQUFzQixJQUFJLFVBQVUsS0FBSztBQUFBLElBQzdDO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDQSxNQUFNLFNBQVMsQ0FBQyxVQUFVLHNCQUFzQixJQUFJLEtBQUs7QUFTekQsV0FBUyxPQUFPLE1BQU0sU0FBUyxFQUFFLFNBQVMsU0FBUyxVQUFVLFdBQVcsSUFBSSxDQUFDLEdBQUc7QUFDNUUsVUFBTSxVQUFVLFVBQVUsS0FBSyxNQUFNLE9BQU87QUFDNUMsVUFBTSxjQUFjLEtBQUssT0FBTztBQUNoQyxRQUFJLFNBQVM7QUFDVCxjQUFRLGlCQUFpQixpQkFBaUIsQ0FBQyxVQUFVO0FBQ2pELGdCQUFRLEtBQUssUUFBUSxNQUFNLEdBQUcsTUFBTSxZQUFZLE1BQU0sWUFBWSxLQUFLLFFBQVEsV0FBVyxHQUFHLEtBQUs7QUFBQSxNQUN0RyxDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksU0FBUztBQUNULGNBQVEsaUJBQWlCLFdBQVcsQ0FBQyxVQUFVO0FBQUE7QUFBQSxRQUUvQyxNQUFNO0FBQUEsUUFBWSxNQUFNO0FBQUEsUUFBWTtBQUFBLE1BQUssQ0FBQztBQUFBLElBQzlDO0FBQ0EsZ0JBQ0ssS0FBSyxDQUFDLE9BQU87QUFDZCxVQUFJO0FBQ0EsV0FBRyxpQkFBaUIsU0FBUyxNQUFNLFdBQVcsQ0FBQztBQUNuRCxVQUFJLFVBQVU7QUFDVixXQUFHLGlCQUFpQixpQkFBaUIsQ0FBQyxVQUFVLFNBQVMsTUFBTSxZQUFZLE1BQU0sWUFBWSxLQUFLLENBQUM7QUFBQSxNQUN2RztBQUFBLElBQ0osQ0FBQyxFQUNJLE1BQU0sTUFBTTtBQUFBLElBQUUsQ0FBQztBQUNwQixXQUFPO0FBQUEsRUFDWDtBQU1BLFdBQVMsU0FBUyxNQUFNLEVBQUUsUUFBUSxJQUFJLENBQUMsR0FBRztBQUN0QyxVQUFNLFVBQVUsVUFBVSxlQUFlLElBQUk7QUFDN0MsUUFBSSxTQUFTO0FBQ1QsY0FBUSxpQkFBaUIsV0FBVyxDQUFDLFVBQVU7QUFBQTtBQUFBLFFBRS9DLE1BQU07QUFBQSxRQUFZO0FBQUEsTUFBSyxDQUFDO0FBQUEsSUFDNUI7QUFDQSxXQUFPLEtBQUssT0FBTyxFQUFFLEtBQUssTUFBTSxNQUFTO0FBQUEsRUFDN0M7QUFFQSxNQUFNLGNBQWMsQ0FBQyxPQUFPLFVBQVUsVUFBVSxjQUFjLE9BQU87QUFDckUsTUFBTSxlQUFlLENBQUMsT0FBTyxPQUFPLFVBQVUsT0FBTztBQUNyRCxNQUFNLGdCQUFnQixvQkFBSSxJQUFJO0FBQzlCLFdBQVMsVUFBVSxRQUFRLE1BQU07QUFDN0IsUUFBSSxFQUFFLGtCQUFrQixlQUNwQixFQUFFLFFBQVEsV0FDVixPQUFPLFNBQVMsV0FBVztBQUMzQjtBQUFBLElBQ0o7QUFDQSxRQUFJLGNBQWMsSUFBSSxJQUFJO0FBQ3RCLGFBQU8sY0FBYyxJQUFJLElBQUk7QUFDakMsVUFBTSxpQkFBaUIsS0FBSyxRQUFRLGNBQWMsRUFBRTtBQUNwRCxVQUFNLFdBQVcsU0FBUztBQUMxQixVQUFNLFVBQVUsYUFBYSxTQUFTLGNBQWM7QUFDcEQ7QUFBQTtBQUFBLE1BRUEsRUFBRSxtQkFBbUIsV0FBVyxXQUFXLGdCQUFnQixjQUN2RCxFQUFFLFdBQVcsWUFBWSxTQUFTLGNBQWM7QUFBQSxNQUFJO0FBQ3BEO0FBQUEsSUFDSjtBQUNBLFVBQU0sU0FBUyxlQUFnQixjQUFjLE1BQU07QUFFL0MsWUFBTSxLQUFLLEtBQUssWUFBWSxXQUFXLFVBQVUsY0FBYyxVQUFVO0FBQ3pFLFVBQUlJLFVBQVMsR0FBRztBQUNoQixVQUFJO0FBQ0EsUUFBQUEsVUFBU0EsUUFBTyxNQUFNLEtBQUssTUFBTSxDQUFDO0FBTXRDLGNBQVEsTUFBTSxRQUFRLElBQUk7QUFBQSxRQUN0QkEsUUFBTyxjQUFjLEVBQUUsR0FBRyxJQUFJO0FBQUEsUUFDOUIsV0FBVyxHQUFHO0FBQUEsTUFDbEIsQ0FBQyxHQUFHLENBQUM7QUFBQSxJQUNUO0FBQ0Esa0JBQWMsSUFBSSxNQUFNLE1BQU07QUFDOUIsV0FBTztBQUFBLEVBQ1g7QUFDQSxlQUFhLENBQUMsY0FBYztBQUFBLElBQ3hCLEdBQUc7QUFBQSxJQUNILEtBQUssQ0FBQyxRQUFRLE1BQU0sYUFBYSxVQUFVLFFBQVEsSUFBSSxLQUFLLFNBQVMsSUFBSSxRQUFRLE1BQU0sUUFBUTtBQUFBLElBQy9GLEtBQUssQ0FBQyxRQUFRLFNBQVMsQ0FBQyxDQUFDLFVBQVUsUUFBUSxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsSUFBSTtBQUFBLEVBQ2pGLEVBQUU7QUFFRixNQUFNLHFCQUFxQixDQUFDLFlBQVksc0JBQXNCLFNBQVM7QUFDdkUsTUFBTSxZQUFZLENBQUM7QUFDbkIsTUFBTSxpQkFBaUIsb0JBQUksUUFBUTtBQUNuQyxNQUFNLG1DQUFtQyxvQkFBSSxRQUFRO0FBQ3JELE1BQU0sc0JBQXNCO0FBQUEsSUFDeEIsSUFBSSxRQUFRLE1BQU07QUFDZCxVQUFJLENBQUMsbUJBQW1CLFNBQVMsSUFBSTtBQUNqQyxlQUFPLE9BQU8sSUFBSTtBQUN0QixVQUFJLGFBQWEsVUFBVSxJQUFJO0FBQy9CLFVBQUksQ0FBQyxZQUFZO0FBQ2IscUJBQWEsVUFBVSxJQUFJLElBQUksWUFBYSxNQUFNO0FBQzlDLHlCQUFlLElBQUksTUFBTSxpQ0FBaUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQUEsUUFDdEY7QUFBQSxNQUNKO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQ0Esa0JBQWdCLFdBQVcsTUFBTTtBQUU3QixRQUFJLFNBQVM7QUFDYixRQUFJLEVBQUUsa0JBQWtCLFlBQVk7QUFDaEMsZUFBUyxNQUFNLE9BQU8sV0FBVyxHQUFHLElBQUk7QUFBQSxJQUM1QztBQUNBLFFBQUksQ0FBQztBQUNEO0FBQ0osYUFBUztBQUNULFVBQU0sZ0JBQWdCLElBQUksTUFBTSxRQUFRLG1CQUFtQjtBQUMzRCxxQ0FBaUMsSUFBSSxlQUFlLE1BQU07QUFFMUQsMEJBQXNCLElBQUksZUFBZSxPQUFPLE1BQU0sQ0FBQztBQUN2RCxXQUFPLFFBQVE7QUFDWCxZQUFNO0FBRU4sZUFBUyxPQUFPLGVBQWUsSUFBSSxhQUFhLEtBQUssT0FBTyxTQUFTO0FBQ3JFLHFCQUFlLE9BQU8sYUFBYTtBQUFBLElBQ3ZDO0FBQUEsRUFDSjtBQUNBLFdBQVMsZUFBZSxRQUFRLE1BQU07QUFDbEMsV0FBUyxTQUFTLE9BQU8saUJBQ3JCLGNBQWMsUUFBUSxDQUFDLFVBQVUsZ0JBQWdCLFNBQVMsQ0FBQyxLQUMxRCxTQUFTLGFBQWEsY0FBYyxRQUFRLENBQUMsVUFBVSxjQUFjLENBQUM7QUFBQSxFQUMvRTtBQUNBLGVBQWEsQ0FBQyxjQUFjO0FBQUEsSUFDeEIsR0FBRztBQUFBLElBQ0gsSUFBSSxRQUFRLE1BQU0sVUFBVTtBQUN4QixVQUFJLGVBQWUsUUFBUSxJQUFJO0FBQzNCLGVBQU87QUFDWCxhQUFPLFNBQVMsSUFBSSxRQUFRLE1BQU0sUUFBUTtBQUFBLElBQzlDO0FBQUEsSUFDQSxJQUFJLFFBQVEsTUFBTTtBQUNkLGFBQU8sZUFBZSxRQUFRLElBQUksS0FBSyxTQUFTLElBQUksUUFBUSxJQUFJO0FBQUEsSUFDcEU7QUFBQSxFQUNKLEVBQUU7OztBQzlTRjtBQUVBLGlCQUFlLGVBQWU7QUFDMUIsV0FBTyxNQUFNLE9BQU8sVUFBVSxHQUFHO0FBQUEsTUFDN0IsUUFBUSxJQUFJO0FBQ1IsY0FBTSxTQUFTLEdBQUcsa0JBQWtCLFVBQVU7QUFBQSxVQUMxQyxTQUFTO0FBQUEsUUFDYixDQUFDO0FBQ0QsZUFBTyxZQUFZLFVBQVUsY0FBYztBQUMzQyxlQUFPLFlBQVksY0FBYyxrQkFBa0I7QUFDbkQsZUFBTyxZQUFZLFFBQVEsWUFBWTtBQUN2QyxlQUFPLFlBQVksUUFBUSxlQUFlO0FBQUEsTUFDOUM7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBT0EsaUJBQXNCLFlBQVksT0FBTyxPQUFPLEtBQUssS0FBSztBQUN0RCxRQUFJLEtBQUssTUFBTSxhQUFhO0FBQzVCLFFBQUksU0FBUyxDQUFDO0FBQ2QsUUFBSSxTQUFTLE1BQU0sR0FDZCxZQUFZLFFBQVEsRUFDcEIsTUFBTSxNQUFNLEtBQUssRUFDakIsV0FBVyxPQUFPLE1BQU0sU0FBUyxNQUFNO0FBQzVDLFdBQU8sUUFBUTtBQUNYLGFBQU8sS0FBSyxPQUFPLEtBQUs7QUFDeEIsVUFBSSxPQUFPLFVBQVUsS0FBSztBQUN0QjtBQUFBLE1BQ0o7QUFDQSxlQUFTLE1BQU0sT0FBTyxTQUFTO0FBQUEsSUFDbkM7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUVBLGlCQUFzQixXQUFXO0FBQzdCLFFBQUksS0FBSyxNQUFNLGFBQWE7QUFDNUIsUUFBSSxRQUFRLG9CQUFJLElBQUk7QUFDcEIsUUFBSSxTQUFTLE1BQU0sR0FBRyxZQUFZLFFBQVEsRUFBRSxNQUFNLFdBQVc7QUFDN0QsV0FBTyxRQUFRO0FBQ1gsWUFBTSxJQUFJLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDcEMsZUFBUyxNQUFNLE9BQU8sU0FBUztBQUFBLElBQ25DO0FBQ0EsV0FBTyxDQUFDLEdBQUcsS0FBSztBQUFBLEVBQ3BCO0FBRUEsaUJBQXNCLHNCQUFzQjtBQUN4QyxRQUFJLEtBQUssTUFBTSxhQUFhO0FBQzVCLFFBQUksU0FBUyxDQUFDO0FBQ2QsUUFBSSxTQUFTLE1BQU0sR0FBRyxZQUFZLFFBQVEsRUFBRSxNQUFNLFdBQVc7QUFDN0QsV0FBTyxRQUFRO0FBQ1gsYUFBTyxLQUFLLE9BQU8sTUFBTSxLQUFLO0FBQzlCLGVBQVMsTUFBTSxPQUFPLFNBQVM7QUFBQSxJQUNuQztBQUNBLGFBQVMsT0FBTyxJQUFJLE9BQUssS0FBSyxVQUFVLENBQUMsQ0FBQztBQUMxQyxhQUFTLE9BQU8sS0FBSyxJQUFJO0FBQ3pCLFlBQVEsSUFBSSxNQUFNO0FBRWxCLFVBQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCO0FBQUEsTUFDNUMsTUFBTTtBQUFBLElBQ1YsQ0FBQztBQUVELFVBQU0sT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV0RCxXQUFPO0FBQUEsRUFDWDs7O0FDcEVBOzs7QUNBQTtBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixNQUFJLENBQUMsVUFBVTtBQUNYLFVBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLEVBQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQU1yRSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBQUEsWUFDeEQsT0FBTztBQUNILHNCQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLE1BQU07QUFBQSxZQUNuRDtBQUFBLFVBQ0o7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQU1BLE1BQU0sTUFBTSxDQUFDO0FBR2IsTUFBSSxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJVixlQUFlLE1BQU07QUFDakIsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsUUFBUSxZQUFZLEdBQUcsSUFBSTtBQUFBLE1BQy9DO0FBQ0EsYUFBTyxVQUFVLFNBQVMsU0FBUyxTQUFTLFFBQVEsV0FBVyxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQzVFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFRQSxXQUFXLFNBQVMsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSzVCLE9BQU8sTUFBTTtBQUNULGFBQU8sU0FBUyxRQUFRLE9BQU8sSUFBSTtBQUFBLElBQ3ZDO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxrQkFBa0I7QUFDZCxVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLGdCQUFnQjtBQUFBLE1BQzVDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsU0FBUyxTQUFTLFFBQVEsZUFBZSxFQUFFO0FBQUEsSUFDekU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLElBQUksS0FBSztBQUNMLGFBQU8sU0FBUyxRQUFRO0FBQUEsSUFDNUI7QUFBQSxFQUNKO0FBR0EsTUFBSSxVQUFVO0FBQUEsSUFDVixPQUFPO0FBQUEsTUFDSCxPQUFPLE1BQU07QUFDVCxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJO0FBQUEsUUFDN0M7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ2hGO0FBQUEsTUFDQSxPQUFPLE1BQU07QUFDVCxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJO0FBQUEsUUFDN0M7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ2hGO0FBQUEsTUFDQSxTQUFTLE1BQU07QUFDWCxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxNQUFNLE1BQU0sR0FBRyxJQUFJO0FBQUEsUUFDL0M7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ2xGO0FBQUEsTUFDQSxVQUFVLE1BQU07QUFDWixZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxNQUFNLE9BQU8sR0FBRyxJQUFJO0FBQUEsUUFDaEQ7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE9BQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ25GO0FBQUEsSUFDSjtBQUFBO0FBQUE7QUFBQSxJQUlBLE1BQU0sU0FBUyxTQUFTLE9BQU87QUFBQSxNQUMzQixPQUFPLE1BQU07QUFDVCxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQUEsUUFDNUM7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQzlFO0FBQUEsTUFDQSxPQUFPLE1BQU07QUFDVCxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxLQUFLLElBQUksR0FBRyxJQUFJO0FBQUEsUUFDNUM7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQzlFO0FBQUEsTUFDQSxVQUFVLE1BQU07QUFDWixZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsUUFDL0M7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssTUFBTSxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ2pGO0FBQUEsTUFDQSxTQUFTLE1BQU07QUFDWCxZQUFJLENBQUMsVUFBVTtBQUNYLGlCQUFPLFNBQVMsUUFBUSxLQUFLLE1BQU0sR0FBRyxJQUFJO0FBQUEsUUFDOUM7QUFDQSxlQUFPLFVBQVUsU0FBUyxRQUFRLE1BQU0sU0FBUyxRQUFRLEtBQUssS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLE1BQ2hGO0FBQUEsTUFDQSxpQkFBaUIsTUFBTTtBQUNuQixZQUFJLENBQUMsU0FBUyxRQUFRLEtBQUssZUFBZTtBQUV0QyxpQkFBTyxRQUFRLFFBQVEsQ0FBQztBQUFBLFFBQzVCO0FBQ0EsWUFBSSxDQUFDLFVBQVU7QUFDWCxpQkFBTyxTQUFTLFFBQVEsS0FBSyxjQUFjLEdBQUcsSUFBSTtBQUFBLFFBQ3REO0FBQ0EsZUFBTyxVQUFVLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxLQUFLLGFBQWEsRUFBRSxHQUFHLElBQUk7QUFBQSxNQUN4RjtBQUFBLElBQ0osSUFBSTtBQUFBO0FBQUEsSUFHSixXQUFXLFNBQVMsU0FBUyxhQUFhO0FBQUEsRUFDOUM7QUFHQSxNQUFJLE9BQU87QUFBQSxJQUNQLFVBQVUsTUFBTTtBQUNaLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxNQUN2QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNqRTtBQUFBLElBQ0EsU0FBUyxNQUFNO0FBQ1gsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxNQUFNLEdBQUcsSUFBSTtBQUFBLE1BQ3RDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssS0FBSyxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ2hFO0FBQUEsSUFDQSxVQUFVLE1BQU07QUFDWixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxLQUFLLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkM7QUFDQSxhQUFPLFVBQVUsU0FBUyxNQUFNLFNBQVMsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxJQUNBLFVBQVUsTUFBTTtBQUNaLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxNQUN2QztBQUNBLGFBQU8sVUFBVSxTQUFTLE1BQU0sU0FBUyxLQUFLLE1BQU0sRUFBRSxHQUFHLElBQUk7QUFBQSxJQUNqRTtBQUFBLElBQ0EsT0FBTyxNQUFNO0FBQ1QsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxJQUFJLEdBQUcsSUFBSTtBQUFBLE1BQ3BDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQzlEO0FBQUEsSUFDQSxjQUFjLE1BQU07QUFDaEIsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxXQUFXLEdBQUcsSUFBSTtBQUFBLE1BQzNDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssVUFBVSxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ3JFO0FBQUEsSUFDQSxlQUFlLE1BQU07QUFDakIsVUFBSSxDQUFDLFVBQVU7QUFDWCxlQUFPLFNBQVMsS0FBSyxZQUFZLEdBQUcsSUFBSTtBQUFBLE1BQzVDO0FBQ0EsYUFBTyxVQUFVLFNBQVMsTUFBTSxTQUFTLEtBQUssV0FBVyxFQUFFLEdBQUcsSUFBSTtBQUFBLElBQ3RFO0FBQUEsRUFDSjs7O0FDdk9BOzs7QUNBQTs7O0FDQUE7QUFNTSxXQUFVLFFBQVEsR0FBVTtBQUNoQyxXQUFPLGFBQWEsY0FBZSxZQUFZLE9BQU8sQ0FBQyxLQUFLLEVBQUUsWUFBWSxTQUFTO0VBQ3JGO0FBR00sV0FBVSxRQUFRLEdBQVcsUUFBZ0IsSUFBRTtBQUNuRCxRQUFJLENBQUMsT0FBTyxjQUFjLENBQUMsS0FBSyxJQUFJLEdBQUc7QUFDckMsWUFBTSxTQUFTLFNBQVMsSUFBSSxLQUFLO0FBQ2pDLFlBQU0sSUFBSSxNQUFNLEdBQUcsTUFBTSw4QkFBOEIsQ0FBQyxFQUFFO0lBQzVEO0VBQ0Y7QUFHTSxXQUFVLE9BQU8sT0FBbUIsUUFBaUIsUUFBZ0IsSUFBRTtBQUMzRSxVQUFNLFFBQVEsUUFBUSxLQUFLO0FBQzNCLFVBQU0sTUFBTSxPQUFPO0FBQ25CLFVBQU0sV0FBVyxXQUFXO0FBQzVCLFFBQUksQ0FBQyxTQUFVLFlBQVksUUFBUSxRQUFTO0FBQzFDLFlBQU0sU0FBUyxTQUFTLElBQUksS0FBSztBQUNqQyxZQUFNLFFBQVEsV0FBVyxjQUFjLE1BQU0sS0FBSztBQUNsRCxZQUFNLE1BQU0sUUFBUSxVQUFVLEdBQUcsS0FBSyxRQUFRLE9BQU8sS0FBSztBQUMxRCxZQUFNLElBQUksTUFBTSxTQUFTLHdCQUF3QixRQUFRLFdBQVcsR0FBRztJQUN6RTtBQUNBLFdBQU87RUFDVDtBQVdNLFdBQVUsUUFBUSxVQUFlLGdCQUFnQixNQUFJO0FBQ3pELFFBQUksU0FBUztBQUFXLFlBQU0sSUFBSSxNQUFNLGtDQUFrQztBQUMxRSxRQUFJLGlCQUFpQixTQUFTO0FBQVUsWUFBTSxJQUFJLE1BQU0sdUNBQXVDO0VBQ2pHO0FBR00sV0FBVSxRQUFRLEtBQVUsVUFBYTtBQUM3QyxXQUFPLEtBQUssUUFBVyxxQkFBcUI7QUFDNUMsVUFBTSxNQUFNLFNBQVM7QUFDckIsUUFBSSxJQUFJLFNBQVMsS0FBSztBQUNwQixZQUFNLElBQUksTUFBTSxzREFBc0QsR0FBRztJQUMzRTtFQUNGO0FBa0JNLFdBQVUsU0FBUyxRQUFvQjtBQUMzQyxhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3RDLGFBQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQztJQUNsQjtFQUNGO0FBR00sV0FBVSxXQUFXLEtBQWU7QUFDeEMsV0FBTyxJQUFJLFNBQVMsSUFBSSxRQUFRLElBQUksWUFBWSxJQUFJLFVBQVU7RUFDaEU7QUFHTSxXQUFVLEtBQUssTUFBYyxPQUFhO0FBQzlDLFdBQVEsUUFBUyxLQUFLLFFBQVcsU0FBUztFQUM1QztBQXNDQSxNQUFNLGdCQUEwQzs7SUFFOUMsT0FBTyxXQUFXLEtBQUssQ0FBQSxDQUFFLEVBQUUsVUFBVSxjQUFjLE9BQU8sV0FBVyxZQUFZO0tBQVc7QUFHOUYsTUFBTSxRQUF3QixzQkFBTSxLQUFLLEVBQUUsUUFBUSxJQUFHLEdBQUksQ0FBQyxHQUFHLE1BQzVELEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxHQUFHLEdBQUcsQ0FBQztBQU8zQixXQUFVLFdBQVcsT0FBaUI7QUFDMUMsV0FBTyxLQUFLO0FBRVosUUFBSTtBQUFlLGFBQU8sTUFBTSxNQUFLO0FBRXJDLFFBQUksTUFBTTtBQUNWLGFBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFDckMsYUFBTyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCO0FBQ0EsV0FBTztFQUNUO0FBR0EsTUFBTSxTQUFTLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUc7QUFDNUQsV0FBUyxjQUFjLElBQVU7QUFDL0IsUUFBSSxNQUFNLE9BQU8sTUFBTSxNQUFNLE9BQU87QUFBSSxhQUFPLEtBQUssT0FBTztBQUMzRCxRQUFJLE1BQU0sT0FBTyxLQUFLLE1BQU0sT0FBTztBQUFHLGFBQU8sTUFBTSxPQUFPLElBQUk7QUFDOUQsUUFBSSxNQUFNLE9BQU8sS0FBSyxNQUFNLE9BQU87QUFBRyxhQUFPLE1BQU0sT0FBTyxJQUFJO0FBQzlEO0VBQ0Y7QUFNTSxXQUFVLFdBQVcsS0FBVztBQUNwQyxRQUFJLE9BQU8sUUFBUTtBQUFVLFlBQU0sSUFBSSxNQUFNLDhCQUE4QixPQUFPLEdBQUc7QUFFckYsUUFBSTtBQUFlLGFBQU8sV0FBVyxRQUFRLEdBQUc7QUFDaEQsVUFBTSxLQUFLLElBQUk7QUFDZixVQUFNLEtBQUssS0FBSztBQUNoQixRQUFJLEtBQUs7QUFBRyxZQUFNLElBQUksTUFBTSxxREFBcUQsRUFBRTtBQUNuRixVQUFNLFFBQVEsSUFBSSxXQUFXLEVBQUU7QUFDL0IsYUFBUyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxNQUFNLE1BQU0sR0FBRztBQUMvQyxZQUFNLEtBQUssY0FBYyxJQUFJLFdBQVcsRUFBRSxDQUFDO0FBQzNDLFlBQU0sS0FBSyxjQUFjLElBQUksV0FBVyxLQUFLLENBQUMsQ0FBQztBQUMvQyxVQUFJLE9BQU8sVUFBYSxPQUFPLFFBQVc7QUFDeEMsY0FBTSxPQUFPLElBQUksRUFBRSxJQUFJLElBQUksS0FBSyxDQUFDO0FBQ2pDLGNBQU0sSUFBSSxNQUFNLGlEQUFpRCxPQUFPLGdCQUFnQixFQUFFO01BQzVGO0FBQ0EsWUFBTSxFQUFFLElBQUksS0FBSyxLQUFLO0lBQ3hCO0FBQ0EsV0FBTztFQUNUO0FBb0RNLFdBQVUsZUFBZSxRQUFvQjtBQUNqRCxRQUFJLE1BQU07QUFDVixhQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3RDLFlBQU0sSUFBSSxPQUFPLENBQUM7QUFDbEIsYUFBTyxDQUFDO0FBQ1IsYUFBTyxFQUFFO0lBQ1g7QUFDQSxVQUFNLE1BQU0sSUFBSSxXQUFXLEdBQUc7QUFDOUIsYUFBUyxJQUFJLEdBQUcsTUFBTSxHQUFHLElBQUksT0FBTyxRQUFRLEtBQUs7QUFDL0MsWUFBTSxJQUFJLE9BQU8sQ0FBQztBQUNsQixVQUFJLElBQUksR0FBRyxHQUFHO0FBQ2QsYUFBTyxFQUFFO0lBQ1g7QUFDQSxXQUFPO0VBQ1Q7QUFvRU0sV0FBVSxhQUNkLFVBQ0EsT0FBaUIsQ0FBQSxHQUFFO0FBRW5CLFVBQU0sUUFBYSxDQUFDLEtBQWlCLFNBQWdCLFNBQVMsSUFBSSxFQUFFLE9BQU8sR0FBRyxFQUFFLE9BQU07QUFDdEYsVUFBTSxNQUFNLFNBQVMsTUFBUztBQUM5QixVQUFNLFlBQVksSUFBSTtBQUN0QixVQUFNLFdBQVcsSUFBSTtBQUNyQixVQUFNLFNBQVMsQ0FBQyxTQUFnQixTQUFTLElBQUk7QUFDN0MsV0FBTyxPQUFPLE9BQU8sSUFBSTtBQUN6QixXQUFPLE9BQU8sT0FBTyxLQUFLO0VBQzVCO0FBR00sV0FBVSxZQUFZLGNBQWMsSUFBRTtBQUMxQyxVQUFNLEtBQUssT0FBTyxlQUFlLFdBQVksV0FBbUIsU0FBUztBQUN6RSxRQUFJLE9BQU8sSUFBSSxvQkFBb0I7QUFDakMsWUFBTSxJQUFJLE1BQU0sd0NBQXdDO0FBQzFELFdBQU8sR0FBRyxnQkFBZ0IsSUFBSSxXQUFXLFdBQVcsQ0FBQztFQUN2RDtBQUdPLE1BQU0sVUFBVSxDQUFDLFlBQXdDO0lBQzlELEtBQUssV0FBVyxLQUFLLENBQUMsR0FBTSxHQUFNLElBQU0sS0FBTSxJQUFNLEdBQU0sS0FBTSxHQUFNLEdBQU0sR0FBTSxNQUFNLENBQUM7Ozs7QUNoVjNGOzs7QUNBQTtBQU9NLFdBQVUsSUFBSSxHQUFXLEdBQVcsR0FBUztBQUNqRCxXQUFRLElBQUksSUFBTSxDQUFDLElBQUk7RUFDekI7QUFHTSxXQUFVLElBQUksR0FBVyxHQUFXLEdBQVM7QUFDakQsV0FBUSxJQUFJLElBQU0sSUFBSSxJQUFNLElBQUk7RUFDbEM7QUFNTSxNQUFnQixTQUFoQixNQUFzQjtJQU9qQjtJQUNBO0lBQ0E7SUFDQTs7SUFHQztJQUNBO0lBQ0EsV0FBVztJQUNYLFNBQVM7SUFDVCxNQUFNO0lBQ04sWUFBWTtJQUV0QixZQUFZLFVBQWtCLFdBQW1CLFdBQW1CLE1BQWE7QUFDL0UsV0FBSyxXQUFXO0FBQ2hCLFdBQUssWUFBWTtBQUNqQixXQUFLLFlBQVk7QUFDakIsV0FBSyxPQUFPO0FBQ1osV0FBSyxTQUFTLElBQUksV0FBVyxRQUFRO0FBQ3JDLFdBQUssT0FBTyxXQUFXLEtBQUssTUFBTTtJQUNwQztJQUNBLE9BQU8sTUFBZ0I7QUFDckIsY0FBUSxJQUFJO0FBQ1osYUFBTyxJQUFJO0FBQ1gsWUFBTSxFQUFFLE1BQU0sUUFBUSxTQUFRLElBQUs7QUFDbkMsWUFBTSxNQUFNLEtBQUs7QUFDakIsZUFBUyxNQUFNLEdBQUcsTUFBTSxPQUFPO0FBQzdCLGNBQU0sT0FBTyxLQUFLLElBQUksV0FBVyxLQUFLLEtBQUssTUFBTSxHQUFHO0FBRXBELFlBQUksU0FBUyxVQUFVO0FBQ3JCLGdCQUFNLFdBQVcsV0FBVyxJQUFJO0FBQ2hDLGlCQUFPLFlBQVksTUFBTSxLQUFLLE9BQU87QUFBVSxpQkFBSyxRQUFRLFVBQVUsR0FBRztBQUN6RTtRQUNGO0FBQ0EsZUFBTyxJQUFJLEtBQUssU0FBUyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssR0FBRztBQUNuRCxhQUFLLE9BQU87QUFDWixlQUFPO0FBQ1AsWUFBSSxLQUFLLFFBQVEsVUFBVTtBQUN6QixlQUFLLFFBQVEsTUFBTSxDQUFDO0FBQ3BCLGVBQUssTUFBTTtRQUNiO01BQ0Y7QUFDQSxXQUFLLFVBQVUsS0FBSztBQUNwQixXQUFLLFdBQVU7QUFDZixhQUFPO0lBQ1Q7SUFDQSxXQUFXLEtBQWU7QUFDeEIsY0FBUSxJQUFJO0FBQ1osY0FBUSxLQUFLLElBQUk7QUFDakIsV0FBSyxXQUFXO0FBSWhCLFlBQU0sRUFBRSxRQUFRLE1BQU0sVUFBVSxLQUFJLElBQUs7QUFDekMsVUFBSSxFQUFFLElBQUcsSUFBSztBQUVkLGFBQU8sS0FBSyxJQUFJO0FBQ2hCLFlBQU0sS0FBSyxPQUFPLFNBQVMsR0FBRyxDQUFDO0FBRy9CLFVBQUksS0FBSyxZQUFZLFdBQVcsS0FBSztBQUNuQyxhQUFLLFFBQVEsTUFBTSxDQUFDO0FBQ3BCLGNBQU07TUFDUjtBQUVBLGVBQVMsSUFBSSxLQUFLLElBQUksVUFBVTtBQUFLLGVBQU8sQ0FBQyxJQUFJO0FBSWpELFdBQUssYUFBYSxXQUFXLEdBQUcsT0FBTyxLQUFLLFNBQVMsQ0FBQyxHQUFHLElBQUk7QUFDN0QsV0FBSyxRQUFRLE1BQU0sQ0FBQztBQUNwQixZQUFNLFFBQVEsV0FBVyxHQUFHO0FBQzVCLFlBQU0sTUFBTSxLQUFLO0FBRWpCLFVBQUksTUFBTTtBQUFHLGNBQU0sSUFBSSxNQUFNLDJDQUEyQztBQUN4RSxZQUFNLFNBQVMsTUFBTTtBQUNyQixZQUFNQyxTQUFRLEtBQUssSUFBRztBQUN0QixVQUFJLFNBQVNBLE9BQU07QUFBUSxjQUFNLElBQUksTUFBTSxvQ0FBb0M7QUFDL0UsZUFBUyxJQUFJLEdBQUcsSUFBSSxRQUFRO0FBQUssY0FBTSxVQUFVLElBQUksR0FBR0EsT0FBTSxDQUFDLEdBQUcsSUFBSTtJQUN4RTtJQUNBLFNBQU07QUFDSixZQUFNLEVBQUUsUUFBUSxVQUFTLElBQUs7QUFDOUIsV0FBSyxXQUFXLE1BQU07QUFDdEIsWUFBTSxNQUFNLE9BQU8sTUFBTSxHQUFHLFNBQVM7QUFDckMsV0FBSyxRQUFPO0FBQ1osYUFBTztJQUNUO0lBQ0EsV0FBVyxJQUFNO0FBQ2YsYUFBTyxJQUFLLEtBQUssWUFBbUI7QUFDcEMsU0FBRyxJQUFJLEdBQUcsS0FBSyxJQUFHLENBQUU7QUFDcEIsWUFBTSxFQUFFLFVBQVUsUUFBUSxRQUFRLFVBQVUsV0FBVyxJQUFHLElBQUs7QUFDL0QsU0FBRyxZQUFZO0FBQ2YsU0FBRyxXQUFXO0FBQ2QsU0FBRyxTQUFTO0FBQ1osU0FBRyxNQUFNO0FBQ1QsVUFBSSxTQUFTO0FBQVUsV0FBRyxPQUFPLElBQUksTUFBTTtBQUMzQyxhQUFPO0lBQ1Q7SUFDQSxRQUFLO0FBQ0gsYUFBTyxLQUFLLFdBQVU7SUFDeEI7O0FBU0ssTUFBTSxZQUF5Qyw0QkFBWSxLQUFLO0lBQ3JFO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7R0FDckY7OztBRDFIRCxNQUFNLFdBQTJCLDRCQUFZLEtBQUs7SUFDaEQ7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUNwRjtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQ3BGO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFDcEY7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUNwRjtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQ3BGO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFDcEY7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUNwRjtJQUFZO0lBQVk7SUFBWTtJQUFZO0lBQVk7SUFBWTtJQUFZO0dBQ3JGO0FBR0QsTUFBTSxXQUEyQixvQkFBSSxZQUFZLEVBQUU7QUFHbkQsTUFBZSxXQUFmLGNBQXVELE9BQVM7SUFZOUQsWUFBWSxXQUFpQjtBQUMzQixZQUFNLElBQUksV0FBVyxHQUFHLEtBQUs7SUFDL0I7SUFDVSxNQUFHO0FBQ1gsWUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBQyxJQUFLO0FBQ25DLGFBQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEM7O0lBRVUsSUFDUixHQUFXLEdBQVcsR0FBVyxHQUFXLEdBQVcsR0FBVyxHQUFXLEdBQVM7QUFFdEYsV0FBSyxJQUFJLElBQUk7QUFDYixXQUFLLElBQUksSUFBSTtBQUNiLFdBQUssSUFBSSxJQUFJO0FBQ2IsV0FBSyxJQUFJLElBQUk7QUFDYixXQUFLLElBQUksSUFBSTtBQUNiLFdBQUssSUFBSSxJQUFJO0FBQ2IsV0FBSyxJQUFJLElBQUk7QUFDYixXQUFLLElBQUksSUFBSTtJQUNmO0lBQ1UsUUFBUSxNQUFnQixRQUFjO0FBRTlDLGVBQVMsSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBRyxpQkFBUyxDQUFDLElBQUksS0FBSyxVQUFVLFFBQVEsS0FBSztBQUNwRixlQUFTLElBQUksSUFBSSxJQUFJLElBQUksS0FBSztBQUM1QixjQUFNLE1BQU0sU0FBUyxJQUFJLEVBQUU7QUFDM0IsY0FBTSxLQUFLLFNBQVMsSUFBSSxDQUFDO0FBQ3pCLGNBQU0sS0FBSyxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUssUUFBUTtBQUNuRCxjQUFNLEtBQUssS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLElBQUksRUFBRSxJQUFLLE9BQU87QUFDakQsaUJBQVMsQ0FBQyxJQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxFQUFFLElBQUs7TUFDakU7QUFFQSxVQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFDLElBQUs7QUFDakMsZUFBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUs7QUFDM0IsY0FBTSxTQUFTLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUNwRCxjQUFNLEtBQU0sSUFBSSxTQUFTLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSztBQUNyRSxjQUFNLFNBQVMsS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssR0FBRyxFQUFFO0FBQ3BELGNBQU0sS0FBTSxTQUFTLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSztBQUNyQyxZQUFJO0FBQ0osWUFBSTtBQUNKLFlBQUk7QUFDSixZQUFLLElBQUksS0FBTTtBQUNmLFlBQUk7QUFDSixZQUFJO0FBQ0osWUFBSTtBQUNKLFlBQUssS0FBSyxLQUFNO01BQ2xCO0FBRUEsVUFBSyxJQUFJLEtBQUssSUFBSztBQUNuQixVQUFLLElBQUksS0FBSyxJQUFLO0FBQ25CLFVBQUssSUFBSSxLQUFLLElBQUs7QUFDbkIsVUFBSyxJQUFJLEtBQUssSUFBSztBQUNuQixVQUFLLElBQUksS0FBSyxJQUFLO0FBQ25CLFVBQUssSUFBSSxLQUFLLElBQUs7QUFDbkIsVUFBSyxJQUFJLEtBQUssSUFBSztBQUNuQixVQUFLLElBQUksS0FBSyxJQUFLO0FBQ25CLFdBQUssSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDakM7SUFDVSxhQUFVO0FBQ2xCLFlBQU0sUUFBUTtJQUNoQjtJQUNBLFVBQU87QUFDTCxXQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQy9CLFlBQU0sS0FBSyxNQUFNO0lBQ25COztBQUlJLE1BQU8sVUFBUCxjQUF1QixTQUFpQjs7O0lBR2xDLElBQVksVUFBVSxDQUFDLElBQUk7SUFDM0IsSUFBWSxVQUFVLENBQUMsSUFBSTtJQUMzQixJQUFZLFVBQVUsQ0FBQyxJQUFJO0lBQzNCLElBQVksVUFBVSxDQUFDLElBQUk7SUFDM0IsSUFBWSxVQUFVLENBQUMsSUFBSTtJQUMzQixJQUFZLFVBQVUsQ0FBQyxJQUFJO0lBQzNCLElBQVksVUFBVSxDQUFDLElBQUk7SUFDM0IsSUFBWSxVQUFVLENBQUMsSUFBSTtJQUNyQyxjQUFBO0FBQ0UsWUFBTSxFQUFFO0lBQ1Y7O0FBcVRLLE1BQU0sU0FBeUM7SUFDcEQsTUFBTSxJQUFJLFFBQU87SUFDRCx3QkFBUSxDQUFJO0VBQUM7OztBRWxiL0I7OztBQ0FBOzs7QUNBQTtBQTRCQSxNQUFZO0FBQVosR0FBQSxTQUFZQyxpQkFBYztBQUV4QixJQUFBQSxnQkFBQUEsZ0JBQUEsY0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGtCQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsMEJBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsZ0JBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsUUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxVQUFBLElBQUEsQ0FBQSxJQUFBO0FBR0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGtCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGtCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGlCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLHNCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLG1CQUFBLElBQUEsRUFBQSxJQUFBO0FBR0EsSUFBQUEsZ0JBQUFBLGdCQUFBLE1BQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsZUFBQSxJQUFBLEtBQUEsSUFBQTtFQUNGLEdBckJZLG1CQUFBLGlCQUFjLENBQUEsRUFBQTtBQThFMUIsTUFBWTtBQUFaLEdBQUEsU0FBWUMsbUJBQWdCO0FBQzFCLElBQUFBLGtCQUFBLE9BQUEsSUFBQTtBQUNBLElBQUFBLGtCQUFBLFFBQUEsSUFBQTtBQUNBLElBQUFBLGtCQUFBLElBQUEsSUFBQTtBQUNBLElBQUFBLGtCQUFBLE1BQUEsSUFBQTtBQUNBLElBQUFBLGtCQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGtCQUFBLE9BQUEsSUFBQTtBQUNBLElBQUFBLGtCQUFBLE1BQUEsSUFBQTtFQUNGLEdBUlkscUJBQUEsbUJBQWdCLENBQUEsRUFBQTs7O0FDMUc1Qjs7O0FDQUE7OztBQ0FBOzs7QUNBQTtBQVNBLE1BQVk7QUFBWixHQUFBLFNBQVlDLGNBQVc7QUFDckIsSUFBQUEsYUFBQSxTQUFBLElBQUE7QUFDQSxJQUFBQSxhQUFBLE1BQUEsSUFBQTtBQUNBLElBQUFBLGFBQUEsZ0JBQUEsSUFBQTtBQUNBLElBQUFBLGFBQUEsWUFBQSxJQUFBO0FBQ0EsSUFBQUEsYUFBQSxlQUFBLElBQUE7QUFDQSxJQUFBQSxhQUFBLGVBQUEsSUFBQTtBQUNBLElBQUFBLGFBQUEsZUFBQSxJQUFBO0FBQ0EsSUFBQUEsYUFBQSxlQUFBLElBQUE7QUFDQSxJQUFBQSxhQUFBLFlBQUEsSUFBQTtFQUNGLEdBVlksZ0JBQUEsY0FBVyxDQUFBLEVBQUE7OztBTDZCdkIsTUFBWUM7QUFBWixHQUFBLFNBQVlBLGlCQUFjO0FBQ3hCLElBQUFBLGdCQUFBQSxnQkFBQSxjQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFdBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsa0JBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsY0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSwwQkFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxRQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFFBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsVUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxhQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGdCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGtCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGlCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLHNCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLG1CQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGlCQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFdBQUEsSUFBQSxJQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsYUFBQSxJQUFBLElBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxLQUFBLElBQUEsSUFBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLFdBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsVUFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxxQkFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxhQUFBLElBQUEsS0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLGVBQUEsSUFBQSxLQUFBLElBQUE7QUFDQSxJQUFBQSxnQkFBQUEsZ0JBQUEsZUFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxvQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSx1QkFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxnQkFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxrQkFBQSxJQUFBLEtBQUEsSUFBQTtBQUNBLElBQUFBLGdCQUFBQSxnQkFBQSxXQUFBLElBQUEsS0FBQSxJQUFBO0FBQ0EsSUFBQUEsZ0JBQUFBLGdCQUFBLHNCQUFBLElBQUEsS0FBQSxJQUFBO0VBQ0YsR0EvQllBLG9CQUFBQSxrQkFBYyxDQUFBLEVBQUE7OztBTXRDMUI7OztBQ0FBOzs7QUNBQTs7O0FDQUE7QUFxQkEsTUFBTSxNQUFzQix1QkFBTyxDQUFDO0FBQ3BDLE1BQU0sTUFBc0IsdUJBQU8sQ0FBQztBQVM5QixXQUFVLE1BQU0sT0FBZ0IsUUFBZ0IsSUFBRTtBQUN0RCxRQUFJLE9BQU8sVUFBVSxXQUFXO0FBQzlCLFlBQU0sU0FBUyxTQUFTLElBQUksS0FBSztBQUNqQyxZQUFNLElBQUksTUFBTSxTQUFTLGdDQUFnQyxPQUFPLEtBQUs7SUFDdkU7QUFDQSxXQUFPO0VBQ1Q7QUFHQSxXQUFTLFdBQVcsR0FBa0I7QUFDcEMsUUFBSSxPQUFPLE1BQU0sVUFBVTtBQUN6QixVQUFJLENBQUMsU0FBUyxDQUFDO0FBQUcsY0FBTSxJQUFJLE1BQU0sbUNBQW1DLENBQUM7SUFDeEU7QUFBTyxjQUFRLENBQUM7QUFDaEIsV0FBTztFQUNUO0FBY00sV0FBVSxZQUFZLEtBQVc7QUFDckMsUUFBSSxPQUFPLFFBQVE7QUFBVSxZQUFNLElBQUksTUFBTSw4QkFBOEIsT0FBTyxHQUFHO0FBQ3JGLFdBQU8sUUFBUSxLQUFLLE1BQU0sT0FBTyxPQUFPLEdBQUc7RUFDN0M7QUFHTSxXQUFVLGdCQUFnQixPQUFpQjtBQUMvQyxXQUFPLFlBQVksV0FBWSxLQUFLLENBQUM7RUFDdkM7QUFDTSxXQUFVLGdCQUFnQixPQUFpQjtBQUMvQyxXQUFPLFlBQVksV0FBWSxVQUFVLE9BQVEsS0FBSyxDQUFDLEVBQUUsUUFBTyxDQUFFLENBQUM7RUFDckU7QUFFTSxXQUFVLGdCQUFnQixHQUFvQixLQUFXO0FBQzdELFlBQVEsR0FBRztBQUNYLFFBQUksV0FBVyxDQUFDO0FBQ2hCLFVBQU0sTUFBTSxXQUFZLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBUyxNQUFNLEdBQUcsR0FBRyxDQUFDO0FBQzdELFFBQUksSUFBSSxXQUFXO0FBQUssWUFBTSxJQUFJLE1BQU0sa0JBQWtCO0FBQzFELFdBQU87RUFDVDtBQUNNLFdBQVUsZ0JBQWdCLEdBQW9CLEtBQVc7QUFDN0QsV0FBTyxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsUUFBTztFQUN4QztBQWtCTSxXQUFVLFVBQVUsT0FBaUI7QUFDekMsV0FBTyxXQUFXLEtBQUssS0FBSztFQUM5QjtBQU9NLFdBQVUsYUFBYSxPQUFhO0FBQ3hDLFdBQU8sV0FBVyxLQUFLLE9BQU8sQ0FBQyxHQUFHLE1BQUs7QUFDckMsWUFBTSxXQUFXLEVBQUUsV0FBVyxDQUFDO0FBQy9CLFVBQUksRUFBRSxXQUFXLEtBQUssV0FBVyxLQUFLO0FBQ3BDLGNBQU0sSUFBSSxNQUNSLHdDQUF3QyxNQUFNLENBQUMsQ0FBQyxlQUFlLFFBQVEsZ0JBQWdCLENBQUMsRUFBRTtNQUU5RjtBQUNBLGFBQU87SUFDVCxDQUFDO0VBQ0g7QUFHQSxNQUFNLFdBQVcsQ0FBQyxNQUFjLE9BQU8sTUFBTSxZQUFZLE9BQU87QUE0QjFELFdBQVUsT0FBTyxHQUFTO0FBQzlCLFFBQUk7QUFDSixTQUFLLE1BQU0sR0FBRyxJQUFJLEtBQUssTUFBTSxLQUFLLE9BQU87QUFBRTtBQUMzQyxXQUFPO0VBQ1Q7QUFzQk8sTUFBTSxVQUFVLENBQUMsT0FBdUIsT0FBTyxPQUFPLENBQUMsS0FBSztBQW9FN0QsV0FBVSxlQUNkLFFBQ0EsU0FBaUMsQ0FBQSxHQUNqQyxZQUFvQyxDQUFBLEdBQUU7QUFFdEMsUUFBSSxDQUFDLFVBQVUsT0FBTyxXQUFXO0FBQVUsWUFBTSxJQUFJLE1BQU0sK0JBQStCO0FBRTFGLGFBQVMsV0FBVyxXQUFpQixjQUFzQixPQUFjO0FBQ3ZFLFlBQU0sTUFBTSxPQUFPLFNBQVM7QUFDNUIsVUFBSSxTQUFTLFFBQVE7QUFBVztBQUNoQyxZQUFNLFVBQVUsT0FBTztBQUN2QixVQUFJLFlBQVksZ0JBQWdCLFFBQVE7QUFDdEMsY0FBTSxJQUFJLE1BQU0sVUFBVSxTQUFTLDBCQUEwQixZQUFZLFNBQVMsT0FBTyxFQUFFO0lBQy9GO0FBQ0EsVUFBTSxPQUFPLENBQUMsR0FBa0IsVUFDOUIsT0FBTyxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxXQUFXLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDL0QsU0FBSyxRQUFRLEtBQUs7QUFDbEIsU0FBSyxXQUFXLElBQUk7RUFDdEI7QUFhTSxXQUFVLFNBQ2QsSUFBNkI7QUFFN0IsVUFBTSxNQUFNLG9CQUFJLFFBQU87QUFDdkIsV0FBTyxDQUFDLFFBQVcsU0FBYztBQUMvQixZQUFNLE1BQU0sSUFBSSxJQUFJLEdBQUc7QUFDdkIsVUFBSSxRQUFRO0FBQVcsZUFBTztBQUM5QixZQUFNLFdBQVcsR0FBRyxLQUFLLEdBQUcsSUFBSTtBQUNoQyxVQUFJLElBQUksS0FBSyxRQUFRO0FBQ3JCLGFBQU87SUFDVDtFQUNGOzs7QUM3UkE7QUFtQkEsTUFBTUMsT0FBc0IsdUJBQU8sQ0FBQztBQUFwQyxNQUF1Q0MsT0FBc0IsdUJBQU8sQ0FBQztBQUFyRSxNQUF3RSxNQUFzQix1QkFBTyxDQUFDO0FBRXRHLE1BQU0sTUFBc0IsdUJBQU8sQ0FBQztBQUFwQyxNQUF1QyxNQUFzQix1QkFBTyxDQUFDO0FBQXJFLE1BQXdFLE1BQXNCLHVCQUFPLENBQUM7QUFFdEcsTUFBTSxNQUFzQix1QkFBTyxDQUFDO0FBQXBDLE1BQXVDLE1BQXNCLHVCQUFPLENBQUM7QUFBckUsTUFBd0UsTUFBc0IsdUJBQU8sQ0FBQztBQUN0RyxNQUFNLE9BQXVCLHVCQUFPLEVBQUU7QUFHaEMsV0FBVSxJQUFJLEdBQVcsR0FBUztBQUN0QyxVQUFNLFNBQVMsSUFBSTtBQUNuQixXQUFPLFVBQVVELE9BQU0sU0FBUyxJQUFJO0VBQ3RDO0FBWU0sV0FBVSxLQUFLLEdBQVcsT0FBZSxRQUFjO0FBQzNELFFBQUksTUFBTTtBQUNWLFdBQU8sVUFBVUUsTUFBSztBQUNwQixhQUFPO0FBQ1AsYUFBTztJQUNUO0FBQ0EsV0FBTztFQUNUO0FBTU0sV0FBVSxPQUFPLFFBQWdCLFFBQWM7QUFDbkQsUUFBSSxXQUFXQTtBQUFLLFlBQU0sSUFBSSxNQUFNLGtDQUFrQztBQUN0RSxRQUFJLFVBQVVBO0FBQUssWUFBTSxJQUFJLE1BQU0sNENBQTRDLE1BQU07QUFFckYsUUFBSSxJQUFJLElBQUksUUFBUSxNQUFNO0FBQzFCLFFBQUksSUFBSTtBQUVSLFFBQUksSUFBSUEsTUFBSyxJQUFJQyxNQUFLLElBQUlBLE1BQUssSUFBSUQ7QUFDbkMsV0FBTyxNQUFNQSxNQUFLO0FBRWhCLFlBQU0sSUFBSSxJQUFJO0FBQ2QsWUFBTSxJQUFJLElBQUk7QUFDZCxZQUFNLElBQUksSUFBSSxJQUFJO0FBQ2xCLFlBQU0sSUFBSSxJQUFJLElBQUk7QUFFbEIsVUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJO0lBQ3pDO0FBQ0EsVUFBTSxNQUFNO0FBQ1osUUFBSSxRQUFRQztBQUFLLFlBQU0sSUFBSSxNQUFNLHdCQUF3QjtBQUN6RCxXQUFPLElBQUksR0FBRyxNQUFNO0VBQ3RCO0FBRUEsV0FBUyxlQUFrQixJQUFlLE1BQVMsR0FBSTtBQUNyRCxRQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUFHLFlBQU0sSUFBSSxNQUFNLHlCQUF5QjtFQUN6RTtBQU1BLFdBQVMsVUFBYSxJQUFlLEdBQUk7QUFDdkMsVUFBTSxVQUFVLEdBQUcsUUFBUUEsUUFBTztBQUNsQyxVQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsTUFBTTtBQUM3QixtQkFBZSxJQUFJLE1BQU0sQ0FBQztBQUMxQixXQUFPO0VBQ1Q7QUFFQSxXQUFTLFVBQWEsSUFBZSxHQUFJO0FBQ3ZDLFVBQU0sVUFBVSxHQUFHLFFBQVEsT0FBTztBQUNsQyxVQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRztBQUN4QixVQUFNLElBQUksR0FBRyxJQUFJLElBQUksTUFBTTtBQUMzQixVQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN0QixVQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ25DLFVBQU0sT0FBTyxHQUFHLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUN6QyxtQkFBZSxJQUFJLE1BQU0sQ0FBQztBQUMxQixXQUFPO0VBQ1Q7QUFJQSxXQUFTLFdBQVcsR0FBUztBQUMzQixVQUFNLE1BQU0sTUFBTSxDQUFDO0FBQ25CLFVBQU0sS0FBSyxjQUFjLENBQUM7QUFDMUIsVUFBTSxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUM7QUFDbkMsVUFBTSxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQ3JCLFVBQU0sS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUM5QixVQUFNLE1BQU0sSUFBSSxPQUFPO0FBQ3ZCLFdBQU8sQ0FBSSxJQUFlLE1BQVE7QUFDaEMsVUFBSSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDdEIsVUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7QUFDeEIsWUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7QUFDMUIsWUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7QUFDMUIsWUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDaEMsWUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDaEMsWUFBTSxHQUFHLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFDMUIsWUFBTSxHQUFHLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFDMUIsWUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDaEMsWUFBTSxPQUFPLEdBQUcsS0FBSyxLQUFLLEtBQUssRUFBRTtBQUNqQyxxQkFBZSxJQUFJLE1BQU0sQ0FBQztBQUMxQixhQUFPO0lBQ1Q7RUFDRjtBQVNNLFdBQVUsY0FBYyxHQUFTO0FBR3JDLFFBQUksSUFBSTtBQUFLLFlBQU0sSUFBSSxNQUFNLHFDQUFxQztBQUVsRSxRQUFJLElBQUksSUFBSUE7QUFDWixRQUFJLElBQUk7QUFDUixXQUFPLElBQUksUUFBUUQsTUFBSztBQUN0QixXQUFLO0FBQ0w7SUFDRjtBQUdBLFFBQUksSUFBSTtBQUNSLFVBQU0sTUFBTSxNQUFNLENBQUM7QUFDbkIsV0FBTyxXQUFXLEtBQUssQ0FBQyxNQUFNLEdBQUc7QUFHL0IsVUFBSSxNQUFNO0FBQU0sY0FBTSxJQUFJLE1BQU0sK0NBQStDO0lBQ2pGO0FBRUEsUUFBSSxNQUFNO0FBQUcsYUFBTztBQUlwQixRQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUNyQixVQUFNLFVBQVUsSUFBSUMsUUFBTztBQUMzQixXQUFPLFNBQVMsWUFBZSxJQUFlLEdBQUk7QUFDaEQsVUFBSSxHQUFHLElBQUksQ0FBQztBQUFHLGVBQU87QUFFdEIsVUFBSSxXQUFXLElBQUksQ0FBQyxNQUFNO0FBQUcsY0FBTSxJQUFJLE1BQU0seUJBQXlCO0FBR3RFLFVBQUksSUFBSTtBQUNSLFVBQUksSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEVBQUU7QUFDekIsVUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDbkIsVUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLE1BQU07QUFJeEIsYUFBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3pCLFlBQUksR0FBRyxJQUFJLENBQUM7QUFBRyxpQkFBTyxHQUFHO0FBQ3pCLFlBQUksSUFBSTtBQUdSLFlBQUksUUFBUSxHQUFHLElBQUksQ0FBQztBQUNwQixlQUFPLENBQUMsR0FBRyxJQUFJLE9BQU8sR0FBRyxHQUFHLEdBQUc7QUFDN0I7QUFDQSxrQkFBUSxHQUFHLElBQUksS0FBSztBQUNwQixjQUFJLE1BQU07QUFBRyxrQkFBTSxJQUFJLE1BQU0seUJBQXlCO1FBQ3hEO0FBR0EsY0FBTSxXQUFXQSxRQUFPLE9BQU8sSUFBSSxJQUFJLENBQUM7QUFDeEMsY0FBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVE7QUFHNUIsWUFBSTtBQUNKLFlBQUksR0FBRyxJQUFJLENBQUM7QUFDWixZQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDZixZQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7TUFDakI7QUFDQSxhQUFPO0lBQ1Q7RUFDRjtBQWFNLFdBQVUsT0FBTyxHQUFTO0FBRTlCLFFBQUksSUFBSSxRQUFRO0FBQUssYUFBTztBQUU1QixRQUFJLElBQUksUUFBUTtBQUFLLGFBQU87QUFFNUIsUUFBSSxJQUFJLFNBQVM7QUFBSyxhQUFPLFdBQVcsQ0FBQztBQUV6QyxXQUFPLGNBQWMsQ0FBQztFQUN4QjtBQWlEQSxNQUFNLGVBQWU7SUFDbkI7SUFBVTtJQUFXO0lBQU87SUFBTztJQUFPO0lBQVE7SUFDbEQ7SUFBTztJQUFPO0lBQU87SUFBTztJQUFPO0lBQ25DO0lBQVE7SUFBUTtJQUFROztBQUVwQixXQUFVLGNBQWlCLE9BQWdCO0FBQy9DLFVBQU0sVUFBVTtNQUNkLE9BQU87TUFDUCxPQUFPO01BQ1AsTUFBTTs7QUFFUixVQUFNLE9BQU8sYUFBYSxPQUFPLENBQUMsS0FBSyxRQUFlO0FBQ3BELFVBQUksR0FBRyxJQUFJO0FBQ1gsYUFBTztJQUNULEdBQUcsT0FBTztBQUNWLG1CQUFlLE9BQU8sSUFBSTtBQUkxQixXQUFPO0VBQ1Q7QUFRTSxXQUFVLE1BQVMsSUFBZUMsTUFBUSxPQUFhO0FBQzNELFFBQUksUUFBUUM7QUFBSyxZQUFNLElBQUksTUFBTSx5Q0FBeUM7QUFDMUUsUUFBSSxVQUFVQTtBQUFLLGFBQU8sR0FBRztBQUM3QixRQUFJLFVBQVVDO0FBQUssYUFBT0Y7QUFDMUIsUUFBSSxJQUFJLEdBQUc7QUFDWCxRQUFJLElBQUlBO0FBQ1IsV0FBTyxRQUFRQyxNQUFLO0FBQ2xCLFVBQUksUUFBUUM7QUFBSyxZQUFJLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDaEMsVUFBSSxHQUFHLElBQUksQ0FBQztBQUNaLGdCQUFVQTtJQUNaO0FBQ0EsV0FBTztFQUNUO0FBT00sV0FBVSxjQUFpQixJQUFlLE1BQVcsV0FBVyxPQUFLO0FBQ3pFLFVBQU0sV0FBVyxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsS0FBSyxXQUFXLEdBQUcsT0FBTyxNQUFTO0FBRTNFLFVBQU0sZ0JBQWdCLEtBQUssT0FBTyxDQUFDLEtBQUtGLE1BQUssTUFBSztBQUNoRCxVQUFJLEdBQUcsSUFBSUEsSUFBRztBQUFHLGVBQU87QUFDeEIsZUFBUyxDQUFDLElBQUk7QUFDZCxhQUFPLEdBQUcsSUFBSSxLQUFLQSxJQUFHO0lBQ3hCLEdBQUcsR0FBRyxHQUFHO0FBRVQsVUFBTSxjQUFjLEdBQUcsSUFBSSxhQUFhO0FBRXhDLFNBQUssWUFBWSxDQUFDLEtBQUtBLE1BQUssTUFBSztBQUMvQixVQUFJLEdBQUcsSUFBSUEsSUFBRztBQUFHLGVBQU87QUFDeEIsZUFBUyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUM7QUFDckMsYUFBTyxHQUFHLElBQUksS0FBS0EsSUFBRztJQUN4QixHQUFHLFdBQVc7QUFDZCxXQUFPO0VBQ1Q7QUFnQk0sV0FBVSxXQUFjLElBQWUsR0FBSTtBQUcvQyxVQUFNLFVBQVUsR0FBRyxRQUFRRyxRQUFPO0FBQ2xDLFVBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxNQUFNO0FBQ2hDLFVBQU0sTUFBTSxHQUFHLElBQUksU0FBUyxHQUFHLEdBQUc7QUFDbEMsVUFBTSxPQUFPLEdBQUcsSUFBSSxTQUFTLEdBQUcsSUFBSTtBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQUksWUFBTSxJQUFJLE1BQU0sZ0NBQWdDO0FBQzFFLFdBQU8sTUFBTSxJQUFJLE9BQU8sSUFBSTtFQUM5QjtBQVVNLFdBQVUsUUFBUSxHQUFXLFlBQW1CO0FBRXBELFFBQUksZUFBZTtBQUFXLGNBQVEsVUFBVTtBQUNoRCxVQUFNLGNBQWMsZUFBZSxTQUFZLGFBQWEsRUFBRSxTQUFTLENBQUMsRUFBRTtBQUMxRSxVQUFNLGNBQWMsS0FBSyxLQUFLLGNBQWMsQ0FBQztBQUM3QyxXQUFPLEVBQUUsWUFBWSxhQUFhLFlBQVc7RUFDL0M7QUFXQSxNQUFNLFNBQU4sTUFBWTtJQUNEO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsT0FBT0M7SUFDUCxNQUFNQztJQUNOO0lBQ0Q7O0lBQ1M7SUFDakIsWUFBWSxPQUFlLE9BQWtCLENBQUEsR0FBRTtBQUM3QyxVQUFJLFNBQVNEO0FBQUssY0FBTSxJQUFJLE1BQU0sNENBQTRDLEtBQUs7QUFDbkYsVUFBSSxjQUFrQztBQUN0QyxXQUFLLE9BQU87QUFDWixVQUFJLFFBQVEsUUFBUSxPQUFPLFNBQVMsVUFBVTtBQUM1QyxZQUFJLE9BQU8sS0FBSyxTQUFTO0FBQVUsd0JBQWMsS0FBSztBQUN0RCxZQUFJLE9BQU8sS0FBSyxTQUFTO0FBQVksZUFBSyxPQUFPLEtBQUs7QUFDdEQsWUFBSSxPQUFPLEtBQUssU0FBUztBQUFXLGVBQUssT0FBTyxLQUFLO0FBQ3JELFlBQUksS0FBSztBQUFnQixlQUFLLFdBQVcsS0FBSyxnQkFBZ0IsTUFBSztBQUNuRSxZQUFJLE9BQU8sS0FBSyxpQkFBaUI7QUFBVyxlQUFLLE9BQU8sS0FBSztNQUMvRDtBQUNBLFlBQU0sRUFBRSxZQUFZLFlBQVcsSUFBSyxRQUFRLE9BQU8sV0FBVztBQUM5RCxVQUFJLGNBQWM7QUFBTSxjQUFNLElBQUksTUFBTSxnREFBZ0Q7QUFDeEYsV0FBSyxRQUFRO0FBQ2IsV0FBSyxPQUFPO0FBQ1osV0FBSyxRQUFRO0FBQ2IsV0FBSyxRQUFRO0FBQ2IsYUFBTyxrQkFBa0IsSUFBSTtJQUMvQjtJQUVBLE9BQU9FLE1BQVc7QUFDaEIsYUFBTyxJQUFJQSxNQUFLLEtBQUssS0FBSztJQUM1QjtJQUNBLFFBQVFBLE1BQVc7QUFDakIsVUFBSSxPQUFPQSxTQUFRO0FBQ2pCLGNBQU0sSUFBSSxNQUFNLGlEQUFpRCxPQUFPQSxJQUFHO0FBQzdFLGFBQU9GLFFBQU9FLFFBQU9BLE9BQU0sS0FBSztJQUNsQztJQUNBLElBQUlBLE1BQVc7QUFDYixhQUFPQSxTQUFRRjtJQUNqQjs7SUFFQSxZQUFZRSxNQUFXO0FBQ3JCLGFBQU8sQ0FBQyxLQUFLLElBQUlBLElBQUcsS0FBSyxLQUFLLFFBQVFBLElBQUc7SUFDM0M7SUFDQSxNQUFNQSxNQUFXO0FBQ2YsY0FBUUEsT0FBTUQsVUFBU0E7SUFDekI7SUFDQSxJQUFJQyxNQUFXO0FBQ2IsYUFBTyxJQUFJLENBQUNBLE1BQUssS0FBSyxLQUFLO0lBQzdCO0lBQ0EsSUFBSSxLQUFhLEtBQVc7QUFDMUIsYUFBTyxRQUFRO0lBQ2pCO0lBRUEsSUFBSUEsTUFBVztBQUNiLGFBQU8sSUFBSUEsT0FBTUEsTUFBSyxLQUFLLEtBQUs7SUFDbEM7SUFDQSxJQUFJLEtBQWEsS0FBVztBQUMxQixhQUFPLElBQUksTUFBTSxLQUFLLEtBQUssS0FBSztJQUNsQztJQUNBLElBQUksS0FBYSxLQUFXO0FBQzFCLGFBQU8sSUFBSSxNQUFNLEtBQUssS0FBSyxLQUFLO0lBQ2xDO0lBQ0EsSUFBSSxLQUFhLEtBQVc7QUFDMUIsYUFBTyxJQUFJLE1BQU0sS0FBSyxLQUFLLEtBQUs7SUFDbEM7SUFDQSxJQUFJQSxNQUFhLE9BQWE7QUFDNUIsYUFBTyxNQUFNLE1BQU1BLE1BQUssS0FBSztJQUMvQjtJQUNBLElBQUksS0FBYSxLQUFXO0FBQzFCLGFBQU8sSUFBSSxNQUFNLE9BQU8sS0FBSyxLQUFLLEtBQUssR0FBRyxLQUFLLEtBQUs7SUFDdEQ7O0lBR0EsS0FBS0EsTUFBVztBQUNkLGFBQU9BLE9BQU1BO0lBQ2Y7SUFDQSxLQUFLLEtBQWEsS0FBVztBQUMzQixhQUFPLE1BQU07SUFDZjtJQUNBLEtBQUssS0FBYSxLQUFXO0FBQzNCLGFBQU8sTUFBTTtJQUNmO0lBQ0EsS0FBSyxLQUFhLEtBQVc7QUFDM0IsYUFBTyxNQUFNO0lBQ2Y7SUFFQSxJQUFJQSxNQUFXO0FBQ2IsYUFBTyxPQUFPQSxNQUFLLEtBQUssS0FBSztJQUMvQjtJQUNBLEtBQUtBLE1BQVc7QUFFZCxVQUFJLENBQUMsS0FBSztBQUFPLGFBQUssUUFBUSxPQUFPLEtBQUssS0FBSztBQUMvQyxhQUFPLEtBQUssTUFBTSxNQUFNQSxJQUFHO0lBQzdCO0lBQ0EsUUFBUUEsTUFBVztBQUNqQixhQUFPLEtBQUssT0FBTyxnQkFBZ0JBLE1BQUssS0FBSyxLQUFLLElBQUksZ0JBQWdCQSxNQUFLLEtBQUssS0FBSztJQUN2RjtJQUNBLFVBQVUsT0FBbUIsaUJBQWlCLE9BQUs7QUFDakQsYUFBTyxLQUFLO0FBQ1osWUFBTSxFQUFFLFVBQVUsZ0JBQWdCLE9BQU8sTUFBTSxPQUFPLE1BQU0sYUFBWSxJQUFLO0FBQzdFLFVBQUksZ0JBQWdCO0FBQ2xCLFlBQUksQ0FBQyxlQUFlLFNBQVMsTUFBTSxNQUFNLEtBQUssTUFBTSxTQUFTLE9BQU87QUFDbEUsZ0JBQU0sSUFBSSxNQUNSLCtCQUErQixpQkFBaUIsaUJBQWlCLE1BQU0sTUFBTTtRQUVqRjtBQUNBLGNBQU0sU0FBUyxJQUFJLFdBQVcsS0FBSztBQUVuQyxlQUFPLElBQUksT0FBTyxPQUFPLElBQUksT0FBTyxTQUFTLE1BQU0sTUFBTTtBQUN6RCxnQkFBUTtNQUNWO0FBQ0EsVUFBSSxNQUFNLFdBQVc7QUFDbkIsY0FBTSxJQUFJLE1BQU0sK0JBQStCLFFBQVEsaUJBQWlCLE1BQU0sTUFBTTtBQUN0RixVQUFJLFNBQVMsT0FBTyxnQkFBZ0IsS0FBSyxJQUFJLGdCQUFnQixLQUFLO0FBQ2xFLFVBQUk7QUFBYyxpQkFBUyxJQUFJLFFBQVEsS0FBSztBQUM1QyxVQUFJLENBQUM7QUFDSCxZQUFJLENBQUMsS0FBSyxRQUFRLE1BQU07QUFDdEIsZ0JBQU0sSUFBSSxNQUFNLGtEQUFrRDs7QUFHdEUsYUFBTztJQUNUOztJQUVBLFlBQVksS0FBYTtBQUN2QixhQUFPLGNBQWMsTUFBTSxHQUFHO0lBQ2hDOzs7SUFHQSxLQUFLLEdBQVcsR0FBVyxXQUFrQjtBQUMzQyxhQUFPLFlBQVksSUFBSTtJQUN6Qjs7QUFzQkksV0FBVSxNQUFNLE9BQWUsT0FBa0IsQ0FBQSxHQUFFO0FBQ3ZELFdBQU8sSUFBSSxPQUFPLE9BQU8sSUFBSTtFQUMvQjtBQWtDTSxXQUFVLG9CQUFvQixZQUFrQjtBQUNwRCxRQUFJLE9BQU8sZUFBZTtBQUFVLFlBQU0sSUFBSSxNQUFNLDRCQUE0QjtBQUNoRixVQUFNLFlBQVksV0FBVyxTQUFTLENBQUMsRUFBRTtBQUN6QyxXQUFPLEtBQUssS0FBSyxZQUFZLENBQUM7RUFDaEM7QUFTTSxXQUFVLGlCQUFpQixZQUFrQjtBQUNqRCxVQUFNLFNBQVMsb0JBQW9CLFVBQVU7QUFDN0MsV0FBTyxTQUFTLEtBQUssS0FBSyxTQUFTLENBQUM7RUFDdEM7QUFlTSxXQUFVLGVBQWUsS0FBaUIsWUFBb0IsT0FBTyxPQUFLO0FBQzlFLFdBQU8sR0FBRztBQUNWLFVBQU0sTUFBTSxJQUFJO0FBQ2hCLFVBQU0sV0FBVyxvQkFBb0IsVUFBVTtBQUMvQyxVQUFNLFNBQVMsaUJBQWlCLFVBQVU7QUFFMUMsUUFBSSxNQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU07QUFDcEMsWUFBTSxJQUFJLE1BQU0sY0FBYyxTQUFTLCtCQUErQixHQUFHO0FBQzNFLFVBQU1DLE9BQU0sT0FBTyxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixHQUFHO0FBRTdELFVBQU0sVUFBVSxJQUFJQSxNQUFLLGFBQWFDLElBQUcsSUFBSUE7QUFDN0MsV0FBTyxPQUFPLGdCQUFnQixTQUFTLFFBQVEsSUFBSSxnQkFBZ0IsU0FBUyxRQUFRO0VBQ3RGOzs7QUZubUJBLE1BQU1DLE9BQXNCLHVCQUFPLENBQUM7QUFDcEMsTUFBTUMsT0FBc0IsdUJBQU8sQ0FBQztBQXFIOUIsV0FBVSxTQUF3QyxXQUFvQixNQUFPO0FBQ2pGLFVBQU0sTUFBTSxLQUFLLE9BQU07QUFDdkIsV0FBTyxZQUFZLE1BQU07RUFDM0I7QUFRTSxXQUFVLFdBQ2QsR0FDQSxRQUFXO0FBRVgsVUFBTSxhQUFhLGNBQ2pCLEVBQUUsSUFDRixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBRSxDQUFDO0FBRXpCLFdBQU8sT0FBTyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JFO0FBRUEsV0FBUyxVQUFVLEdBQVcsTUFBWTtBQUN4QyxRQUFJLENBQUMsT0FBTyxjQUFjLENBQUMsS0FBSyxLQUFLLEtBQUssSUFBSTtBQUM1QyxZQUFNLElBQUksTUFBTSx1Q0FBdUMsT0FBTyxjQUFjLENBQUM7RUFDakY7QUFXQSxXQUFTLFVBQVUsR0FBVyxZQUFrQjtBQUM5QyxjQUFVLEdBQUcsVUFBVTtBQUN2QixVQUFNLFVBQVUsS0FBSyxLQUFLLGFBQWEsQ0FBQyxJQUFJO0FBQzVDLFVBQU0sYUFBYSxNQUFNLElBQUk7QUFDN0IsVUFBTSxZQUFZLEtBQUs7QUFDdkIsVUFBTSxPQUFPLFFBQVEsQ0FBQztBQUN0QixVQUFNLFVBQVUsT0FBTyxDQUFDO0FBQ3hCLFdBQU8sRUFBRSxTQUFTLFlBQVksTUFBTSxXQUFXLFFBQU87RUFDeEQ7QUFFQSxXQUFTLFlBQVksR0FBV0MsU0FBZ0IsT0FBWTtBQUMxRCxVQUFNLEVBQUUsWUFBWSxNQUFNLFdBQVcsUUFBTyxJQUFLO0FBQ2pELFFBQUksUUFBUSxPQUFPLElBQUksSUFBSTtBQUMzQixRQUFJLFFBQVEsS0FBSztBQVFqQixRQUFJLFFBQVEsWUFBWTtBQUV0QixlQUFTO0FBQ1QsZUFBU0Q7SUFDWDtBQUNBLFVBQU0sY0FBY0MsVUFBUztBQUM3QixVQUFNLFNBQVMsY0FBYyxLQUFLLElBQUksS0FBSyxJQUFJO0FBQy9DLFVBQU0sU0FBUyxVQUFVO0FBQ3pCLFVBQU0sUUFBUSxRQUFRO0FBQ3RCLFVBQU0sU0FBU0EsVUFBUyxNQUFNO0FBQzlCLFVBQU0sVUFBVTtBQUNoQixXQUFPLEVBQUUsT0FBTyxRQUFRLFFBQVEsT0FBTyxRQUFRLFFBQU87RUFDeEQ7QUFrQkEsTUFBTSxtQkFBbUIsb0JBQUksUUFBTztBQUNwQyxNQUFNLG1CQUFtQixvQkFBSSxRQUFPO0FBRXBDLFdBQVMsS0FBSyxHQUFNO0FBR2xCLFdBQU8saUJBQWlCLElBQUksQ0FBQyxLQUFLO0VBQ3BDO0FBRUEsV0FBUyxRQUFRLEdBQVM7QUFDeEIsUUFBSSxNQUFNQztBQUFLLFlBQU0sSUFBSSxNQUFNLGNBQWM7RUFDL0M7QUFvQk0sTUFBTyxPQUFQLE1BQVc7SUFDRTtJQUNBO0lBQ0E7SUFDUjs7SUFHVCxZQUFZLE9BQVcsTUFBWTtBQUNqQyxXQUFLLE9BQU8sTUFBTTtBQUNsQixXQUFLLE9BQU8sTUFBTTtBQUNsQixXQUFLLEtBQUssTUFBTTtBQUNoQixXQUFLLE9BQU87SUFDZDs7SUFHQSxjQUFjLEtBQWUsR0FBVyxJQUFjLEtBQUssTUFBSTtBQUM3RCxVQUFJLElBQWM7QUFDbEIsYUFBTyxJQUFJQSxNQUFLO0FBQ2QsWUFBSSxJQUFJQztBQUFLLGNBQUksRUFBRSxJQUFJLENBQUM7QUFDeEIsWUFBSSxFQUFFLE9BQU07QUFDWixjQUFNQTtNQUNSO0FBQ0EsYUFBTztJQUNUOzs7Ozs7Ozs7Ozs7O0lBY1EsaUJBQWlCLE9BQWlCLEdBQVM7QUFDakQsWUFBTSxFQUFFLFNBQVMsV0FBVSxJQUFLLFVBQVUsR0FBRyxLQUFLLElBQUk7QUFDdEQsWUFBTSxTQUFxQixDQUFBO0FBQzNCLFVBQUksSUFBYztBQUNsQixVQUFJLE9BQU87QUFDWCxlQUFTQyxVQUFTLEdBQUdBLFVBQVMsU0FBU0EsV0FBVTtBQUMvQyxlQUFPO0FBQ1AsZUFBTyxLQUFLLElBQUk7QUFFaEIsaUJBQVMsSUFBSSxHQUFHLElBQUksWUFBWSxLQUFLO0FBQ25DLGlCQUFPLEtBQUssSUFBSSxDQUFDO0FBQ2pCLGlCQUFPLEtBQUssSUFBSTtRQUNsQjtBQUNBLFlBQUksS0FBSyxPQUFNO01BQ2pCO0FBQ0EsYUFBTztJQUNUOzs7Ozs7O0lBUVEsS0FBSyxHQUFXLGFBQXlCLEdBQVM7QUFFeEQsVUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7QUFBRyxjQUFNLElBQUksTUFBTSxnQkFBZ0I7QUFFekQsVUFBSSxJQUFJLEtBQUs7QUFDYixVQUFJLElBQUksS0FBSztBQU1iLFlBQU0sS0FBSyxVQUFVLEdBQUcsS0FBSyxJQUFJO0FBQ2pDLGVBQVNBLFVBQVMsR0FBR0EsVUFBUyxHQUFHLFNBQVNBLFdBQVU7QUFFbEQsY0FBTSxFQUFFLE9BQU8sUUFBUSxRQUFRLE9BQU8sUUFBUSxRQUFPLElBQUssWUFBWSxHQUFHQSxTQUFRLEVBQUU7QUFDbkYsWUFBSTtBQUNKLFlBQUksUUFBUTtBQUdWLGNBQUksRUFBRSxJQUFJLFNBQVMsUUFBUSxZQUFZLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELE9BQU87QUFFTCxjQUFJLEVBQUUsSUFBSSxTQUFTLE9BQU8sWUFBWSxNQUFNLENBQUMsQ0FBQztRQUNoRDtNQUNGO0FBQ0EsY0FBUSxDQUFDO0FBSVQsYUFBTyxFQUFFLEdBQUcsRUFBQztJQUNmOzs7Ozs7SUFPUSxXQUNOLEdBQ0EsYUFDQSxHQUNBLE1BQWdCLEtBQUssTUFBSTtBQUV6QixZQUFNLEtBQUssVUFBVSxHQUFHLEtBQUssSUFBSTtBQUNqQyxlQUFTQSxVQUFTLEdBQUdBLFVBQVMsR0FBRyxTQUFTQSxXQUFVO0FBQ2xELFlBQUksTUFBTUY7QUFBSztBQUNmLGNBQU0sRUFBRSxPQUFPLFFBQVEsUUFBUSxNQUFLLElBQUssWUFBWSxHQUFHRSxTQUFRLEVBQUU7QUFDbEUsWUFBSTtBQUNKLFlBQUksUUFBUTtBQUdWO1FBQ0YsT0FBTztBQUNMLGdCQUFNLE9BQU8sWUFBWSxNQUFNO0FBQy9CLGdCQUFNLElBQUksSUFBSSxRQUFRLEtBQUssT0FBTSxJQUFLLElBQUk7UUFDNUM7TUFDRjtBQUNBLGNBQVEsQ0FBQztBQUNULGFBQU87SUFDVDtJQUVRLGVBQWUsR0FBVyxPQUFpQixXQUE0QjtBQUU3RSxVQUFJLE9BQU8saUJBQWlCLElBQUksS0FBSztBQUNyQyxVQUFJLENBQUMsTUFBTTtBQUNULGVBQU8sS0FBSyxpQkFBaUIsT0FBTyxDQUFDO0FBQ3JDLFlBQUksTUFBTSxHQUFHO0FBRVgsY0FBSSxPQUFPLGNBQWM7QUFBWSxtQkFBTyxVQUFVLElBQUk7QUFDMUQsMkJBQWlCLElBQUksT0FBTyxJQUFJO1FBQ2xDO01BQ0Y7QUFDQSxhQUFPO0lBQ1Q7SUFFQSxPQUNFLE9BQ0EsUUFDQSxXQUE0QjtBQUU1QixZQUFNLElBQUksS0FBSyxLQUFLO0FBQ3BCLGFBQU8sS0FBSyxLQUFLLEdBQUcsS0FBSyxlQUFlLEdBQUcsT0FBTyxTQUFTLEdBQUcsTUFBTTtJQUN0RTtJQUVBLE9BQU8sT0FBaUIsUUFBZ0IsV0FBOEIsTUFBZTtBQUNuRixZQUFNLElBQUksS0FBSyxLQUFLO0FBQ3BCLFVBQUksTUFBTTtBQUFHLGVBQU8sS0FBSyxjQUFjLE9BQU8sUUFBUSxJQUFJO0FBQzFELGFBQU8sS0FBSyxXQUFXLEdBQUcsS0FBSyxlQUFlLEdBQUcsT0FBTyxTQUFTLEdBQUcsUUFBUSxJQUFJO0lBQ2xGOzs7O0lBS0EsWUFBWSxHQUFhLEdBQVM7QUFDaEMsZ0JBQVUsR0FBRyxLQUFLLElBQUk7QUFDdEIsdUJBQWlCLElBQUksR0FBRyxDQUFDO0FBQ3pCLHVCQUFpQixPQUFPLENBQUM7SUFDM0I7SUFFQSxTQUFTLEtBQWE7QUFDcEIsYUFBTyxLQUFLLEdBQUcsTUFBTTtJQUN2Qjs7QUFPSSxXQUFVLGNBQ2QsT0FDQSxPQUNBLElBQ0EsSUFBVTtBQUVWLFFBQUksTUFBTTtBQUNWLFFBQUksS0FBSyxNQUFNO0FBQ2YsUUFBSSxLQUFLLE1BQU07QUFDZixXQUFPLEtBQUtGLFFBQU8sS0FBS0EsTUFBSztBQUMzQixVQUFJLEtBQUtDO0FBQUssYUFBSyxHQUFHLElBQUksR0FBRztBQUM3QixVQUFJLEtBQUtBO0FBQUssYUFBSyxHQUFHLElBQUksR0FBRztBQUM3QixZQUFNLElBQUksT0FBTTtBQUNoQixhQUFPQTtBQUNQLGFBQU9BO0lBQ1Q7QUFDQSxXQUFPLEVBQUUsSUFBSSxHQUFFO0VBQ2pCO0FBdUpBLFdBQVMsWUFBZSxPQUFlLE9BQW1CLE1BQWM7QUFDdEUsUUFBSSxPQUFPO0FBQ1QsVUFBSSxNQUFNLFVBQVU7QUFBTyxjQUFNLElBQUksTUFBTSxnREFBZ0Q7QUFDM0Ysb0JBQWMsS0FBSztBQUNuQixhQUFPO0lBQ1QsT0FBTztBQUNMLGFBQU8sTUFBTSxPQUFPLEVBQUUsS0FBSSxDQUFFO0lBQzlCO0VBQ0Y7QUFJTSxXQUFVLGtCQUNkLE1BQ0EsT0FDQSxZQUE4QixDQUFBLEdBQzlCLFFBQWdCO0FBRWhCLFFBQUksV0FBVztBQUFXLGVBQVMsU0FBUztBQUM1QyxRQUFJLENBQUMsU0FBUyxPQUFPLFVBQVU7QUFBVSxZQUFNLElBQUksTUFBTSxrQkFBa0IsSUFBSSxlQUFlO0FBQzlGLGVBQVcsS0FBSyxDQUFDLEtBQUssS0FBSyxHQUFHLEdBQVk7QUFDeEMsWUFBTSxNQUFNLE1BQU0sQ0FBQztBQUNuQixVQUFJLEVBQUUsT0FBTyxRQUFRLFlBQVksTUFBTUU7QUFDckMsY0FBTSxJQUFJLE1BQU0sU0FBUyxDQUFDLDBCQUEwQjtJQUN4RDtBQUNBLFVBQU0sS0FBSyxZQUFZLE1BQU0sR0FBRyxVQUFVLElBQUksTUFBTTtBQUNwRCxVQUFNLEtBQUssWUFBWSxNQUFNLEdBQUcsVUFBVSxJQUFJLE1BQU07QUFDcEQsVUFBTSxLQUFnQixTQUFTLGdCQUFnQixNQUFNO0FBQ3JELFVBQU0sU0FBUyxDQUFDLE1BQU0sTUFBTSxLQUFLLEVBQUU7QUFDbkMsZUFBVyxLQUFLLFFBQVE7QUFFdEIsVUFBSSxDQUFDLEdBQUcsUUFBUSxNQUFNLENBQUMsQ0FBQztBQUN0QixjQUFNLElBQUksTUFBTSxTQUFTLENBQUMsMENBQTBDO0lBQ3hFO0FBQ0EsWUFBUSxPQUFPLE9BQU8sT0FBTyxPQUFPLENBQUEsR0FBSSxLQUFLLENBQUM7QUFDOUMsV0FBTyxFQUFFLE9BQU8sSUFBSSxHQUFFO0VBQ3hCO0FBTU0sV0FBVSxhQUNkLGlCQUNBQyxlQUFvQztBQUVwQyxXQUFPLFNBQVMsT0FBTyxNQUFpQjtBQUN0QyxZQUFNLFlBQVksZ0JBQWdCLElBQUk7QUFDdEMsYUFBTyxFQUFFLFdBQVcsV0FBV0EsY0FBYSxTQUFTLEVBQUM7SUFDeEQ7RUFDRjs7O0FHeG5CQTtBQW9HQSxNQUFNLGFBQWEsQ0FBQ0MsTUFBYSxTQUFpQkEsUUFBT0EsUUFBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPQyxRQUFPO0FBT25GLFdBQVUsaUJBQWlCLEdBQVcsT0FBa0IsR0FBUztBQUlyRSxVQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUk7QUFDN0IsVUFBTSxLQUFLLFdBQVcsS0FBSyxHQUFHLENBQUM7QUFDL0IsVUFBTSxLQUFLLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQztBQUdoQyxRQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSztBQUM1QixRQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssS0FBSztBQUN6QixVQUFNLFFBQVEsS0FBS0M7QUFDbkIsVUFBTSxRQUFRLEtBQUtBO0FBQ25CLFFBQUk7QUFBTyxXQUFLLENBQUM7QUFDakIsUUFBSTtBQUFPLFdBQUssQ0FBQztBQUdqQixVQUFNLFVBQVUsUUFBUSxLQUFLLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUlDO0FBQ3BELFFBQUksS0FBS0QsUUFBTyxNQUFNLFdBQVcsS0FBS0EsUUFBTyxNQUFNLFNBQVM7QUFDMUQsWUFBTSxJQUFJLE1BQU0sMkNBQTJDLENBQUM7SUFDOUQ7QUFDQSxXQUFPLEVBQUUsT0FBTyxJQUFJLE9BQU8sR0FBRTtFQUMvQjtBQStUQSxNQUFNRSxPQUFNLE9BQU8sQ0FBQztBQUFwQixNQUF1QkMsT0FBTSxPQUFPLENBQUM7QUFBckMsTUFBd0NDLE9BQU0sT0FBTyxDQUFDO0FBQXRELE1BQXlEQyxPQUFNLE9BQU8sQ0FBQztBQUF2RSxNQUEwRUMsT0FBTSxPQUFPLENBQUM7QUFxQmxGLFdBQVUsWUFDZCxRQUNBLFlBQXFDLENBQUEsR0FBRTtBQUV2QyxVQUFNLFlBQVksa0JBQWtCLGVBQWUsUUFBUSxTQUFTO0FBQ3BFLFVBQU0sRUFBRSxJQUFJLEdBQUUsSUFBSztBQUNuQixRQUFJLFFBQVEsVUFBVTtBQUN0QixVQUFNLEVBQUUsR0FBRyxVQUFVLEdBQUcsWUFBVyxJQUFLO0FBQ3hDLG1CQUNFLFdBQ0EsQ0FBQSxHQUNBO01BQ0Usb0JBQW9CO01BQ3BCLGVBQWU7TUFDZixlQUFlO01BQ2YsV0FBVztNQUNYLFNBQVM7TUFDVCxNQUFNO0tBQ1A7QUFHSCxVQUFNLEVBQUUsS0FBSSxJQUFLO0FBQ2pCLFFBQUksTUFBTTtBQUVSLFVBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssT0FBTyxLQUFLLFNBQVMsWUFBWSxDQUFDLE1BQU0sUUFBUSxLQUFLLE9BQU8sR0FBRztBQUNyRixjQUFNLElBQUksTUFBTSw0REFBNEQ7TUFDOUU7SUFDRjtBQUVBLFVBQU0sVUFBVSxZQUFZLElBQUksRUFBRTtBQUVsQyxhQUFTLCtCQUE0QjtBQUNuQyxVQUFJLENBQUMsR0FBRztBQUFPLGNBQU0sSUFBSSxNQUFNLDREQUE0RDtJQUM3RjtBQUdBLGFBQVNDLGNBQ1AsSUFDQSxPQUNBLGNBQXFCO0FBRXJCLFlBQU0sRUFBRSxHQUFHLEVBQUMsSUFBSyxNQUFNLFNBQVE7QUFDL0IsWUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLFlBQU0sY0FBYyxjQUFjO0FBQ2xDLFVBQUksY0FBYztBQUNoQixxQ0FBNEI7QUFDNUIsY0FBTSxXQUFXLENBQUMsR0FBRyxNQUFPLENBQUM7QUFDN0IsZUFBTyxZQUFZLFFBQVEsUUFBUSxHQUFHLEVBQUU7TUFDMUMsT0FBTztBQUNMLGVBQU8sWUFBWSxXQUFXLEdBQUcsQ0FBSSxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQztNQUMzRDtJQUNGO0FBQ0EsYUFBUyxlQUFlLE9BQWlCO0FBQ3ZDLGFBQU8sT0FBTyxRQUFXLE9BQU87QUFDaEMsWUFBTSxFQUFFLFdBQVcsTUFBTSx1QkFBdUIsT0FBTSxJQUFLO0FBQzNELFlBQU0sU0FBUyxNQUFNO0FBQ3JCLFlBQU0sT0FBTyxNQUFNLENBQUM7QUFDcEIsWUFBTSxPQUFPLE1BQU0sU0FBUyxDQUFDO0FBRTdCLFVBQUksV0FBVyxTQUFTLFNBQVMsS0FBUSxTQUFTLElBQU87QUFDdkQsY0FBTSxJQUFJLEdBQUcsVUFBVSxJQUFJO0FBQzNCLFlBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUFHLGdCQUFNLElBQUksTUFBTSxxQ0FBcUM7QUFDekUsY0FBTSxLQUFLLG9CQUFvQixDQUFDO0FBQ2hDLFlBQUk7QUFDSixZQUFJO0FBQ0YsY0FBSSxHQUFHLEtBQUssRUFBRTtRQUNoQixTQUFTLFdBQVc7QUFDbEIsZ0JBQU0sTUFBTSxxQkFBcUIsUUFBUSxPQUFPLFVBQVUsVUFBVTtBQUNwRSxnQkFBTSxJQUFJLE1BQU0sMkNBQTJDLEdBQUc7UUFDaEU7QUFDQSxxQ0FBNEI7QUFDNUIsY0FBTSxRQUFRLEdBQUcsTUFBTyxDQUFDO0FBQ3pCLGNBQU0sU0FBUyxPQUFPLE9BQU87QUFDN0IsWUFBSSxVQUFVO0FBQU8sY0FBSSxHQUFHLElBQUksQ0FBQztBQUNqQyxlQUFPLEVBQUUsR0FBRyxFQUFDO01BQ2YsV0FBVyxXQUFXLFVBQVUsU0FBUyxHQUFNO0FBRTdDLGNBQU0sSUFBSSxHQUFHO0FBQ2IsY0FBTSxJQUFJLEdBQUcsVUFBVSxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDMUMsY0FBTSxJQUFJLEdBQUcsVUFBVSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM5QyxZQUFJLENBQUMsVUFBVSxHQUFHLENBQUM7QUFBRyxnQkFBTSxJQUFJLE1BQU0sNEJBQTRCO0FBQ2xFLGVBQU8sRUFBRSxHQUFHLEVBQUM7TUFDZixPQUFPO0FBQ0wsY0FBTSxJQUFJLE1BQ1IseUJBQXlCLE1BQU0seUJBQXlCLElBQUksb0JBQW9CLE1BQU0sRUFBRTtNQUU1RjtJQUNGO0FBRUEsVUFBTSxjQUFjLFVBQVUsV0FBV0E7QUFDekMsVUFBTSxjQUFjLFVBQVUsYUFBYTtBQUMzQyxhQUFTLG9CQUFvQixHQUFJO0FBQy9CLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQztBQUNuQixZQUFNLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQztBQUN2QixhQUFPLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUN2RDtBQUlBLGFBQVMsVUFBVSxHQUFNLEdBQUk7QUFDM0IsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFlBQU0sUUFBUSxvQkFBb0IsQ0FBQztBQUNuQyxhQUFPLEdBQUcsSUFBSSxNQUFNLEtBQUs7SUFDM0I7QUFJQSxRQUFJLENBQUMsVUFBVSxNQUFNLElBQUksTUFBTSxFQUFFO0FBQUcsWUFBTSxJQUFJLE1BQU0sbUNBQW1DO0FBSXZGLFVBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBR0YsSUFBRyxHQUFHQyxJQUFHO0FBQzdDLFVBQU0sUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO0FBQ2hELFFBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxNQUFNLEtBQUssQ0FBQztBQUFHLFlBQU0sSUFBSSxNQUFNLDBCQUEwQjtBQUczRSxhQUFTLE9BQU8sT0FBZSxHQUFNLFVBQVUsT0FBSztBQUNsRCxVQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBTSxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQUksY0FBTSxJQUFJLE1BQU0sd0JBQXdCLEtBQUssRUFBRTtBQUM3RixhQUFPO0lBQ1Q7QUFFQSxhQUFTLFVBQVUsT0FBYztBQUMvQixVQUFJLEVBQUUsaUJBQWlCO0FBQVEsY0FBTSxJQUFJLE1BQU0sNEJBQTRCO0lBQzdFO0FBRUEsYUFBUyxpQkFBaUIsR0FBUztBQUNqQyxVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7QUFBUyxjQUFNLElBQUksTUFBTSxTQUFTO0FBQ3JELGFBQU8saUJBQWlCLEdBQUcsS0FBSyxTQUFTLEdBQUcsS0FBSztJQUNuRDtBQU9BLFVBQU0sZUFBZSxTQUFTLENBQUMsR0FBVSxPQUEwQjtBQUNqRSxZQUFNLEVBQUUsR0FBRyxHQUFHLEVBQUMsSUFBSztBQUVwQixVQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRztBQUFHLGVBQU8sRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFDO0FBQzFDLFlBQU0sTUFBTSxFQUFFLElBQUc7QUFHakIsVUFBSSxNQUFNO0FBQU0sYUFBSyxNQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztBQUM1QyxZQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUN0QixZQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUN0QixZQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUN2QixVQUFJO0FBQUssZUFBTyxFQUFFLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxLQUFJO0FBQ3hDLFVBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUc7QUFBRyxjQUFNLElBQUksTUFBTSxrQkFBa0I7QUFDM0QsYUFBTyxFQUFFLEdBQUcsRUFBQztJQUNmLENBQUM7QUFHRCxVQUFNLGtCQUFrQixTQUFTLENBQUMsTUFBWTtBQUM1QyxVQUFJLEVBQUUsSUFBRyxHQUFJO0FBSVgsWUFBSSxVQUFVLHNCQUFzQixDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFBRztBQUNsRCxjQUFNLElBQUksTUFBTSxpQkFBaUI7TUFDbkM7QUFFQSxZQUFNLEVBQUUsR0FBRyxFQUFDLElBQUssRUFBRSxTQUFRO0FBQzNCLFVBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7QUFBRyxjQUFNLElBQUksTUFBTSxzQ0FBc0M7QUFDNUYsVUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDO0FBQUcsY0FBTSxJQUFJLE1BQU0sbUNBQW1DO0FBQ3pFLFVBQUksQ0FBQyxFQUFFLGNBQWE7QUFBSSxjQUFNLElBQUksTUFBTSx3Q0FBd0M7QUFDaEYsYUFBTztJQUNULENBQUM7QUFFRCxhQUFTLFdBQ1AsVUFDQSxLQUNBLEtBQ0EsT0FDQSxPQUFjO0FBRWQsWUFBTSxJQUFJLE1BQU0sR0FBRyxJQUFJLElBQUksR0FBRyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNyRCxZQUFNLFNBQVMsT0FBTyxHQUFHO0FBQ3pCLFlBQU0sU0FBUyxPQUFPLEdBQUc7QUFDekIsYUFBTyxJQUFJLElBQUksR0FBRztJQUNwQjtJQU9BLE1BQU0sTUFBSzs7TUFFVCxPQUFnQixPQUFPLElBQUksTUFBTSxNQUFNLElBQUksTUFBTSxJQUFJLEdBQUcsR0FBRzs7TUFFM0QsT0FBZ0IsT0FBTyxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUk7OztNQUV6RCxPQUFnQixLQUFLOztNQUVyQixPQUFnQixLQUFLO01BRVo7TUFDQTtNQUNBOztNQUdULFlBQVksR0FBTSxHQUFNLEdBQUk7QUFDMUIsYUFBSyxJQUFJLE9BQU8sS0FBSyxDQUFDO0FBQ3RCLGFBQUssSUFBSSxPQUFPLEtBQUssR0FBRyxJQUFJO0FBQzVCLGFBQUssSUFBSSxPQUFPLEtBQUssQ0FBQztBQUN0QixlQUFPLE9BQU8sSUFBSTtNQUNwQjtNQUVBLE9BQU8sUUFBSztBQUNWLGVBQU87TUFDVDs7TUFHQSxPQUFPLFdBQVcsR0FBaUI7QUFDakMsY0FBTSxFQUFFLEdBQUcsRUFBQyxJQUFLLEtBQUssQ0FBQTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUFHLGdCQUFNLElBQUksTUFBTSxzQkFBc0I7QUFDbEYsWUFBSSxhQUFhO0FBQU8sZ0JBQU0sSUFBSSxNQUFNLDhCQUE4QjtBQUV0RSxZQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFBRyxpQkFBTyxNQUFNO0FBQ3pDLGVBQU8sSUFBSSxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUc7TUFDL0I7TUFFQSxPQUFPLFVBQVUsT0FBaUI7QUFDaEMsY0FBTSxJQUFJLE1BQU0sV0FBVyxZQUFZLE9BQU8sT0FBTyxRQUFXLE9BQU8sQ0FBQyxDQUFDO0FBQ3pFLFVBQUUsZUFBYztBQUNoQixlQUFPO01BQ1Q7TUFFQSxPQUFPLFFBQVEsS0FBVztBQUN4QixlQUFPLE1BQU0sVUFBVSxXQUFXLEdBQUcsQ0FBQztNQUN4QztNQUVBLElBQUksSUFBQztBQUNILGVBQU8sS0FBSyxTQUFRLEVBQUc7TUFDekI7TUFDQSxJQUFJLElBQUM7QUFDSCxlQUFPLEtBQUssU0FBUSxFQUFHO01BQ3pCOzs7Ozs7O01BUUEsV0FBVyxhQUFxQixHQUFHLFNBQVMsTUFBSTtBQUM5QyxhQUFLLFlBQVksTUFBTSxVQUFVO0FBQ2pDLFlBQUksQ0FBQztBQUFRLGVBQUssU0FBU0QsSUFBRztBQUM5QixlQUFPO01BQ1Q7OztNQUlBLGlCQUFjO0FBQ1osd0JBQWdCLElBQUk7TUFDdEI7TUFFQSxXQUFRO0FBQ04sY0FBTSxFQUFFLEVBQUMsSUFBSyxLQUFLLFNBQVE7QUFDM0IsWUFBSSxDQUFDLEdBQUc7QUFBTyxnQkFBTSxJQUFJLE1BQU0sNkJBQTZCO0FBQzVELGVBQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQztNQUNwQjs7TUFHQSxPQUFPLE9BQVk7QUFDakIsa0JBQVUsS0FBSztBQUNmLGNBQU0sRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRSxJQUFLO0FBQ2hDLGNBQU0sRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRSxJQUFLO0FBQ2hDLGNBQU0sS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNoRCxjQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDaEQsZUFBTyxNQUFNO01BQ2Y7O01BR0EsU0FBTTtBQUNKLGVBQU8sSUFBSSxNQUFNLEtBQUssR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO01BQ2pEOzs7OztNQU1BLFNBQU07QUFDSixjQUFNLEVBQUUsR0FBRyxFQUFDLElBQUs7QUFDakIsY0FBTSxLQUFLLEdBQUcsSUFBSSxHQUFHQSxJQUFHO0FBQ3hCLGNBQU0sRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRSxJQUFLO0FBQ2hDLFlBQUksS0FBSyxHQUFHLE1BQU0sS0FBSyxHQUFHLE1BQU0sS0FBSyxHQUFHO0FBQ3hDLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUNqQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDakIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGVBQU8sSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO01BQzdCOzs7OztNQU1BLElBQUksT0FBWTtBQUNkLGtCQUFVLEtBQUs7QUFDZixjQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUUsSUFBSztBQUNoQyxjQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUUsSUFBSztBQUNoQyxZQUFJLEtBQUssR0FBRyxNQUFNLEtBQUssR0FBRyxNQUFNLEtBQUssR0FBRztBQUN4QyxjQUFNLElBQUksTUFBTTtBQUNoQixjQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sR0FBR0EsSUFBRztBQUM5QixZQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsWUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDdEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDakIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUNqQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxF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RSxPQUFPO0FBQ3hCLG1CQUFhLG1CQUFtQjtBQUNoQyw0QkFBc0IsV0FBVyxNQUFNLE9BQU8sR0FBRyxHQUFHO0FBQUEsSUFDeEQsQ0FBQztBQUVELE1BQUUsY0FBYyxHQUFHLGlCQUFpQixTQUFTLE9BQU87QUFDcEQsTUFBRSxnQkFBZ0IsR0FBRyxpQkFBaUIsU0FBUyxTQUFTO0FBQ3hELE1BQUUsV0FBVyxHQUFHLGlCQUFpQixTQUFTLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFBQSxFQUNsRTtBQUlBLGlCQUFlLE9BQU87QUFFbEIsVUFBTSxlQUFlLEVBQUUsY0FBYztBQUNyQyxRQUFJLGNBQWM7QUFDZCxtQkFBYSxZQUFZLHNCQUNyQixNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLGtCQUFrQixJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRTtBQUFBLElBQ25HO0FBRUEsZUFBVztBQUNYLFVBQU0sT0FBTztBQUFBLEVBQ2pCO0FBRUEsV0FBUyxpQkFBaUIsb0JBQW9CLElBQUk7IiwKICAibmFtZXMiOiBbInBpbm8iLCAibG9nZ2VyIiwgInRyYW5zbWl0IiwgImxldmVsIiwgInNldE9wdHMiLCAic2VsZiIsICJsZW4iLCAiaSIsICJudW0iLCAibGVuMiIsICJCdWZmZXIiLCAidXRmOFRvQnl0ZXMiLCAiYmFzZTY0VG9CeXRlcyIsICJpIiwgImFzY2lpVG9CeXRlcyIsICJieXRlTGVuZ3RoIiwgInRhcmdldCIsICJzdGF0ZSIsICJOb3N0ckV2ZW50S2luZCIsICJOb3N0ck1lc3NhZ2VUeXBlIiwgIk5pcDQ2TWV0aG9kIiwgIk5vc3RyRXZlbnRLaW5kIiwgIl8wbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJudW0iLCAiXzBuIiwgIl8xbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJudW0iLCAibnVtIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIndpbmRvdyIsICJfMG4iLCAiXzFuIiwgIndpbmRvdyIsICJfMG4iLCAiZ2V0UHVibGljS2V5IiwgIm51bSIsICJfMm4iLCAiXzBuIiwgIl8xbiIsICJfMG4iLCAiXzFuIiwgIl8ybiIsICJfM24iLCAiXzRuIiwgInBvaW50VG9CeXRlcyIsICJlbmRvIiwgIl8wbiIsICJfMm4iLCAiXzNuIiwgIl8ybiIsICJfMG4iLCAiTG9nTGV2ZWwiLCAicGlubyIsICJjcnlwdG8iLCAiZ2V0Q3J5cHRvIiwgImNyeXB0byJdCn0K
