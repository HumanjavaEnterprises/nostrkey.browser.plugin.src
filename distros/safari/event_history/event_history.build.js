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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3F1aWNrLWZvcm1hdC11bmVzY2FwZWQvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3Bpbm8vYnJvd3Nlci5qcyIsICJub2RlLXN0dWI6Y3J5cHRvIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9iZWNoMzIvZGlzdC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2V2ZW50X2hpc3RvcnkvZXZlbnRfaGlzdG9yeS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvaWRiL2J1aWxkL2luZGV4LmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvZGIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWVkcGhyYXNlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvaGFzaGVzL3NyYy91dGlscy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvc2hhMi50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2hhc2hlcy9zcmMvX21kLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL3R5cGVzL2Jhc2UudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvcHJvdG9jb2wudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9kaXN0L2VzbS90eXBlcy9tZXNzYWdlcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy90eXBlcy9ndWFyZHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdHlwZXMvbmlwNDYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvY3J5cHRvLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy9zZWNwMjU2azEudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0Bub2JsZS9jdXJ2ZXMvc3JjL2Fic3RyYWN0L2N1cnZlLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Abm9ibGUvY3VydmVzL3NyYy91dGlscy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3QvbW9kdWxhci50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQG5vYmxlL2N1cnZlcy9zcmMvYWJzdHJhY3Qvd2VpZXJzdHJhc3MudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdXRpbHMvbG9nZ2VyLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2VuY29kaW5nL2Jhc2U2NC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbm9zdHItY3J5cHRvLXV0aWxzL3NyYy92YWxpZGF0aW9uL2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L2luZGV4LnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L2NyZWF0aW9uLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub3N0ci1jcnlwdG8tdXRpbHMvc3JjL2V2ZW50L3NpZ25pbmcudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMDQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMDEudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMTkudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtMjYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDQudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDYudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvbmlwcy9uaXAtNDkudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL25vc3RyLWNyeXB0by11dGlscy9zcmMvdXRpbHMvZW5jb2RpbmcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIndXNlIHN0cmljdCdcbmZ1bmN0aW9uIHRyeVN0cmluZ2lmeSAobykge1xuICB0cnkgeyByZXR1cm4gSlNPTi5zdHJpbmdpZnkobykgfSBjYXRjaChlKSB7IHJldHVybiAnXCJbQ2lyY3VsYXJdXCInIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtYXRcblxuZnVuY3Rpb24gZm9ybWF0KGYsIGFyZ3MsIG9wdHMpIHtcbiAgdmFyIHNzID0gKG9wdHMgJiYgb3B0cy5zdHJpbmdpZnkpIHx8IHRyeVN0cmluZ2lmeVxuICB2YXIgb2Zmc2V0ID0gMVxuICBpZiAodHlwZW9mIGYgPT09ICdvYmplY3QnICYmIGYgIT09IG51bGwpIHtcbiAgICB2YXIgbGVuID0gYXJncy5sZW5ndGggKyBvZmZzZXRcbiAgICBpZiAobGVuID09PSAxKSByZXR1cm4gZlxuICAgIHZhciBvYmplY3RzID0gbmV3IEFycmF5KGxlbilcbiAgICBvYmplY3RzWzBdID0gc3MoZilcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuOyBpbmRleCsrKSB7XG4gICAgICBvYmplY3RzW2luZGV4XSA9IHNzKGFyZ3NbaW5kZXhdKVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJylcbiAgfVxuICBpZiAodHlwZW9mIGYgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZcbiAgfVxuICB2YXIgYXJnTGVuID0gYXJncy5sZW5ndGhcbiAgaWYgKGFyZ0xlbiA9PT0gMCkgcmV0dXJuIGZcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBhID0gMSAtIG9mZnNldFxuICB2YXIgbGFzdFBvcyA9IC0xXG4gIHZhciBmbGVuID0gKGYgJiYgZi5sZW5ndGgpIHx8IDBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBmbGVuOykge1xuICAgIGlmIChmLmNoYXJDb2RlQXQoaSkgPT09IDM3ICYmIGkgKyAxIDwgZmxlbikge1xuICAgICAgbGFzdFBvcyA9IGxhc3RQb3MgPiAtMSA/IGxhc3RQb3MgOiAwXG4gICAgICBzd2l0Y2ggKGYuY2hhckNvZGVBdChpICsgMSkpIHtcbiAgICAgICAgY2FzZSAxMDA6IC8vICdkJ1xuICAgICAgICBjYXNlIDEwMjogLy8gJ2YnXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBOdW1iZXIoYXJnc1thXSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDEwNTogLy8gJ2knXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PSBudWxsKSAgYnJlYWtcbiAgICAgICAgICBpZiAobGFzdFBvcyA8IGkpXG4gICAgICAgICAgICBzdHIgKz0gZi5zbGljZShsYXN0UG9zLCBpKVxuICAgICAgICAgIHN0ciArPSBNYXRoLmZsb29yKE51bWJlcihhcmdzW2FdKSlcbiAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICBpKytcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDc5OiAvLyAnTydcbiAgICAgICAgY2FzZSAxMTE6IC8vICdvJ1xuICAgICAgICBjYXNlIDEwNjogLy8gJ2onXG4gICAgICAgICAgaWYgKGEgPj0gYXJnTGVuKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBpZiAoYXJnc1thXSA9PT0gdW5kZWZpbmVkKSBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgYXJnc1thXVxuICAgICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc3RyICs9ICdcXCcnICsgYXJnc1thXSArICdcXCcnXG4gICAgICAgICAgICBsYXN0UG9zID0gaSArIDJcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHN0ciArPSBhcmdzW2FdLm5hbWUgfHwgJzxhbm9ueW1vdXM+J1xuICAgICAgICAgICAgbGFzdFBvcyA9IGkgKyAyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0ciArPSBzcyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMTE1OiAvLyAncydcbiAgICAgICAgICBpZiAoYSA+PSBhcmdMZW4pXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9IFN0cmluZyhhcmdzW2FdKVxuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzc6IC8vICclJ1xuICAgICAgICAgIGlmIChsYXN0UG9zIDwgaSlcbiAgICAgICAgICAgIHN0ciArPSBmLnNsaWNlKGxhc3RQb3MsIGkpXG4gICAgICAgICAgc3RyICs9ICclJ1xuICAgICAgICAgIGxhc3RQb3MgPSBpICsgMlxuICAgICAgICAgIGkrK1xuICAgICAgICAgIGEtLVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICArK2FcbiAgICB9XG4gICAgKytpXG4gIH1cbiAgaWYgKGxhc3RQb3MgPT09IC0xKVxuICAgIHJldHVybiBmXG4gIGVsc2UgaWYgKGxhc3RQb3MgPCBmbGVuKSB7XG4gICAgc3RyICs9IGYuc2xpY2UobGFzdFBvcylcbiAgfVxuXG4gIHJldHVybiBzdHJcbn1cbiIsICIndXNlIHN0cmljdCdcblxuY29uc3QgZm9ybWF0ID0gcmVxdWlyZSgncXVpY2stZm9ybWF0LXVuZXNjYXBlZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gcGlub1xuXG5jb25zdCBfY29uc29sZSA9IHBmR2xvYmFsVGhpc09yRmFsbGJhY2soKS5jb25zb2xlIHx8IHt9XG5jb25zdCBzdGRTZXJpYWxpemVycyA9IHtcbiAgbWFwSHR0cFJlcXVlc3Q6IG1vY2ssXG4gIG1hcEh0dHBSZXNwb25zZTogbW9jayxcbiAgd3JhcFJlcXVlc3RTZXJpYWxpemVyOiBwYXNzdGhyb3VnaCxcbiAgd3JhcFJlc3BvbnNlU2VyaWFsaXplcjogcGFzc3Rocm91Z2gsXG4gIHdyYXBFcnJvclNlcmlhbGl6ZXI6IHBhc3N0aHJvdWdoLFxuICByZXE6IG1vY2ssXG4gIHJlczogbW9jayxcbiAgZXJyOiBhc0VyclZhbHVlLFxuICBlcnJXaXRoQ2F1c2U6IGFzRXJyVmFsdWVcbn1cbmZ1bmN0aW9uIGxldmVsVG9WYWx1ZSAobGV2ZWwsIGxvZ2dlcikge1xuICByZXR1cm4gbGV2ZWwgPT09ICdzaWxlbnQnXG4gICAgPyBJbmZpbml0eVxuICAgIDogbG9nZ2VyLmxldmVscy52YWx1ZXNbbGV2ZWxdXG59XG5jb25zdCBiYXNlTG9nRnVuY3Rpb25TeW1ib2wgPSBTeW1ib2woJ3Bpbm8ubG9nRnVuY3MnKVxuY29uc3QgaGllcmFyY2h5U3ltYm9sID0gU3ltYm9sKCdwaW5vLmhpZXJhcmNoeScpXG5cbmNvbnN0IGxvZ0ZhbGxiYWNrTWFwID0ge1xuICBlcnJvcjogJ2xvZycsXG4gIGZhdGFsOiAnZXJyb3InLFxuICB3YXJuOiAnZXJyb3InLFxuICBpbmZvOiAnbG9nJyxcbiAgZGVidWc6ICdsb2cnLFxuICB0cmFjZTogJ2xvZydcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGRMb2dnZXIgKHBhcmVudExvZ2dlciwgY2hpbGRMb2dnZXIpIHtcbiAgY29uc3QgbmV3RW50cnkgPSB7XG4gICAgbG9nZ2VyOiBjaGlsZExvZ2dlcixcbiAgICBwYXJlbnQ6IHBhcmVudExvZ2dlcltoaWVyYXJjaHlTeW1ib2xdXG4gIH1cbiAgY2hpbGRMb2dnZXJbaGllcmFyY2h5U3ltYm9sXSA9IG5ld0VudHJ5XG59XG5cbmZ1bmN0aW9uIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyAobG9nZ2VyLCBsZXZlbHMsIHByb3RvKSB7XG4gIGNvbnN0IGxvZ0Z1bmN0aW9ucyA9IHt9XG4gIGxldmVscy5mb3JFYWNoKGxldmVsID0+IHtcbiAgICBsb2dGdW5jdGlvbnNbbGV2ZWxdID0gcHJvdG9bbGV2ZWxdID8gcHJvdG9bbGV2ZWxdIDogKF9jb25zb2xlW2xldmVsXSB8fCBfY29uc29sZVtsb2dGYWxsYmFja01hcFtsZXZlbF0gfHwgJ2xvZyddIHx8IG5vb3ApXG4gIH0pXG4gIGxvZ2dlcltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdID0gbG9nRnVuY3Rpb25zXG59XG5cbmZ1bmN0aW9uIHNob3VsZFNlcmlhbGl6ZSAoc2VyaWFsaXplLCBzZXJpYWxpemVycykge1xuICBpZiAoQXJyYXkuaXNBcnJheShzZXJpYWxpemUpKSB7XG4gICAgY29uc3QgaGFzVG9GaWx0ZXIgPSBzZXJpYWxpemUuZmlsdGVyKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gayAhPT0gJyFzdGRTZXJpYWxpemVycy5lcnInXG4gICAgfSlcbiAgICByZXR1cm4gaGFzVG9GaWx0ZXJcbiAgfSBlbHNlIGlmIChzZXJpYWxpemUgPT09IHRydWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2VyaWFsaXplcnMpXG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gcGlubyAob3B0cykge1xuICBvcHRzID0gb3B0cyB8fCB7fVxuICBvcHRzLmJyb3dzZXIgPSBvcHRzLmJyb3dzZXIgfHwge31cblxuICBjb25zdCB0cmFuc21pdCA9IG9wdHMuYnJvd3Nlci50cmFuc21pdFxuICBpZiAodHJhbnNtaXQgJiYgdHlwZW9mIHRyYW5zbWl0LnNlbmQgIT09ICdmdW5jdGlvbicpIHsgdGhyb3cgRXJyb3IoJ3Bpbm86IHRyYW5zbWl0IG9wdGlvbiBtdXN0IGhhdmUgYSBzZW5kIGZ1bmN0aW9uJykgfVxuXG4gIGNvbnN0IHByb3RvID0gb3B0cy5icm93c2VyLndyaXRlIHx8IF9jb25zb2xlXG4gIGlmIChvcHRzLmJyb3dzZXIud3JpdGUpIG9wdHMuYnJvd3Nlci5hc09iamVjdCA9IHRydWVcbiAgY29uc3Qgc2VyaWFsaXplcnMgPSBvcHRzLnNlcmlhbGl6ZXJzIHx8IHt9XG4gIGNvbnN0IHNlcmlhbGl6ZSA9IHNob3VsZFNlcmlhbGl6ZShvcHRzLmJyb3dzZXIuc2VyaWFsaXplLCBzZXJpYWxpemVycylcbiAgbGV0IHN0ZEVyclNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemVcblxuICBpZiAoXG4gICAgQXJyYXkuaXNBcnJheShvcHRzLmJyb3dzZXIuc2VyaWFsaXplKSAmJlxuICAgIG9wdHMuYnJvd3Nlci5zZXJpYWxpemUuaW5kZXhPZignIXN0ZFNlcmlhbGl6ZXJzLmVycicpID4gLTFcbiAgKSBzdGRFcnJTZXJpYWxpemUgPSBmYWxzZVxuXG4gIGNvbnN0IGN1c3RvbUxldmVscyA9IE9iamVjdC5rZXlzKG9wdHMuY3VzdG9tTGV2ZWxzIHx8IHt9KVxuICBjb25zdCBsZXZlbHMgPSBbJ2Vycm9yJywgJ2ZhdGFsJywgJ3dhcm4nLCAnaW5mbycsICdkZWJ1ZycsICd0cmFjZSddLmNvbmNhdChjdXN0b21MZXZlbHMpXG5cbiAgaWYgKHR5cGVvZiBwcm90byA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxldmVscy5mb3JFYWNoKGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgcHJvdG9bbGV2ZWxdID0gcHJvdG9cbiAgICB9KVxuICB9XG4gIGlmIChvcHRzLmVuYWJsZWQgPT09IGZhbHNlIHx8IG9wdHMuYnJvd3Nlci5kaXNhYmxlZCkgb3B0cy5sZXZlbCA9ICdzaWxlbnQnXG4gIGNvbnN0IGxldmVsID0gb3B0cy5sZXZlbCB8fCAnaW5mbydcbiAgY29uc3QgbG9nZ2VyID0gT2JqZWN0LmNyZWF0ZShwcm90bylcbiAgaWYgKCFsb2dnZXIubG9nKSBsb2dnZXIubG9nID0gbm9vcFxuXG4gIHNldHVwQmFzZUxvZ0Z1bmN0aW9ucyhsb2dnZXIsIGxldmVscywgcHJvdG8pXG4gIC8vIHNldHVwIHJvb3QgaGllcmFyY2h5IGVudHJ5XG4gIGFwcGVuZENoaWxkTG9nZ2VyKHt9LCBsb2dnZXIpXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsVmFsJywge1xuICAgIGdldDogZ2V0TGV2ZWxWYWxcbiAgfSlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxvZ2dlciwgJ2xldmVsJywge1xuICAgIGdldDogZ2V0TGV2ZWwsXG4gICAgc2V0OiBzZXRMZXZlbFxuICB9KVxuXG4gIGNvbnN0IHNldE9wdHMgPSB7XG4gICAgdHJhbnNtaXQsXG4gICAgc2VyaWFsaXplLFxuICAgIGFzT2JqZWN0OiBvcHRzLmJyb3dzZXIuYXNPYmplY3QsXG4gICAgYXNPYmplY3RCaW5kaW5nc09ubHk6IG9wdHMuYnJvd3Nlci5hc09iamVjdEJpbmRpbmdzT25seSxcbiAgICBmb3JtYXR0ZXJzOiBvcHRzLmJyb3dzZXIuZm9ybWF0dGVycyxcbiAgICByZXBvcnRDYWxsZXI6IG9wdHMuYnJvd3Nlci5yZXBvcnRDYWxsZXIsXG4gICAgbGV2ZWxzLFxuICAgIHRpbWVzdGFtcDogZ2V0VGltZUZ1bmN0aW9uKG9wdHMpLFxuICAgIG1lc3NhZ2VLZXk6IG9wdHMubWVzc2FnZUtleSB8fCAnbXNnJyxcbiAgICBvbkNoaWxkOiBvcHRzLm9uQ2hpbGQgfHwgbm9vcFxuICB9XG4gIGxvZ2dlci5sZXZlbHMgPSBnZXRMZXZlbHMob3B0cylcbiAgbG9nZ2VyLmxldmVsID0gbGV2ZWxcblxuICBsb2dnZXIuaXNMZXZlbEVuYWJsZWQgPSBmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICBpZiAoIXRoaXMubGV2ZWxzLnZhbHVlc1tsZXZlbF0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxldmVscy52YWx1ZXNbbGV2ZWxdID49IHRoaXMubGV2ZWxzLnZhbHVlc1t0aGlzLmxldmVsXVxuICB9XG4gIGxvZ2dlci5zZXRNYXhMaXN0ZW5lcnMgPSBsb2dnZXIuZ2V0TWF4TGlzdGVuZXJzID1cbiAgbG9nZ2VyLmVtaXQgPSBsb2dnZXIuYWRkTGlzdGVuZXIgPSBsb2dnZXIub24gPVxuICBsb2dnZXIucHJlcGVuZExpc3RlbmVyID0gbG9nZ2VyLm9uY2UgPVxuICBsb2dnZXIucHJlcGVuZE9uY2VMaXN0ZW5lciA9IGxvZ2dlci5yZW1vdmVMaXN0ZW5lciA9XG4gIGxvZ2dlci5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBsb2dnZXIubGlzdGVuZXJzID1cbiAgbG9nZ2VyLmxpc3RlbmVyQ291bnQgPSBsb2dnZXIuZXZlbnROYW1lcyA9XG4gIGxvZ2dlci53cml0ZSA9IGxvZ2dlci5mbHVzaCA9IG5vb3BcbiAgbG9nZ2VyLnNlcmlhbGl6ZXJzID0gc2VyaWFsaXplcnNcbiAgbG9nZ2VyLl9zZXJpYWxpemUgPSBzZXJpYWxpemVcbiAgbG9nZ2VyLl9zdGRFcnJTZXJpYWxpemUgPSBzdGRFcnJTZXJpYWxpemVcbiAgbG9nZ2VyLmNoaWxkID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIGNoaWxkLmNhbGwodGhpcywgc2V0T3B0cywgLi4uYXJncykgfVxuXG4gIGlmICh0cmFuc21pdCkgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoKVxuXG4gIGZ1bmN0aW9uIGdldExldmVsVmFsICgpIHtcbiAgICByZXR1cm4gbGV2ZWxUb1ZhbHVlKHRoaXMubGV2ZWwsIHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMZXZlbCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xldmVsXG4gIH1cbiAgZnVuY3Rpb24gc2V0TGV2ZWwgKGxldmVsKSB7XG4gICAgaWYgKGxldmVsICE9PSAnc2lsZW50JyAmJiAhdGhpcy5sZXZlbHMudmFsdWVzW2xldmVsXSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gbGV2ZWwgJyArIGxldmVsKVxuICAgIH1cbiAgICB0aGlzLl9sZXZlbCA9IGxldmVsXG5cbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnZXJyb3InKSAvLyA8LS0gbXVzdCBzdGF5IGZpcnN0XG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2ZhdGFsJylcbiAgICBzZXQodGhpcywgc2V0T3B0cywgbG9nZ2VyLCAnd2FybicpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ2luZm8nKVxuICAgIHNldCh0aGlzLCBzZXRPcHRzLCBsb2dnZXIsICdkZWJ1ZycpXG4gICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgJ3RyYWNlJylcblxuICAgIGN1c3RvbUxldmVscy5mb3JFYWNoKChsZXZlbCkgPT4ge1xuICAgICAgc2V0KHRoaXMsIHNldE9wdHMsIGxvZ2dlciwgbGV2ZWwpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoaWxkIChzZXRPcHRzLCBiaW5kaW5ncywgY2hpbGRPcHRpb25zKSB7XG4gICAgaWYgKCFiaW5kaW5ncykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGJpbmRpbmdzIGZvciBjaGlsZCBQaW5vJylcbiAgICB9XG4gICAgY2hpbGRPcHRpb25zID0gY2hpbGRPcHRpb25zIHx8IHt9XG4gICAgaWYgKHNlcmlhbGl6ZSAmJiBiaW5kaW5ncy5zZXJpYWxpemVycykge1xuICAgICAgY2hpbGRPcHRpb25zLnNlcmlhbGl6ZXJzID0gYmluZGluZ3Muc2VyaWFsaXplcnNcbiAgICB9XG4gICAgY29uc3QgY2hpbGRPcHRpb25zU2VyaWFsaXplcnMgPSBjaGlsZE9wdGlvbnMuc2VyaWFsaXplcnNcbiAgICBpZiAoc2VyaWFsaXplICYmIGNoaWxkT3B0aW9uc1NlcmlhbGl6ZXJzKSB7XG4gICAgICB2YXIgY2hpbGRTZXJpYWxpemVycyA9IE9iamVjdC5hc3NpZ24oe30sIHNlcmlhbGl6ZXJzLCBjaGlsZE9wdGlvbnNTZXJpYWxpemVycylcbiAgICAgIHZhciBjaGlsZFNlcmlhbGl6ZSA9IG9wdHMuYnJvd3Nlci5zZXJpYWxpemUgPT09IHRydWVcbiAgICAgICAgPyBPYmplY3Qua2V5cyhjaGlsZFNlcmlhbGl6ZXJzKVxuICAgICAgICA6IHNlcmlhbGl6ZVxuICAgICAgZGVsZXRlIGJpbmRpbmdzLnNlcmlhbGl6ZXJzXG4gICAgICBhcHBseVNlcmlhbGl6ZXJzKFtiaW5kaW5nc10sIGNoaWxkU2VyaWFsaXplLCBjaGlsZFNlcmlhbGl6ZXJzLCB0aGlzLl9zdGRFcnJTZXJpYWxpemUpXG4gICAgfVxuICAgIGZ1bmN0aW9uIENoaWxkIChwYXJlbnQpIHtcbiAgICAgIHRoaXMuX2NoaWxkTGV2ZWwgPSAocGFyZW50Ll9jaGlsZExldmVsIHwgMCkgKyAxXG5cbiAgICAgIC8vIG1ha2Ugc3VyZSBiaW5kaW5ncyBhcmUgYXZhaWxhYmxlIGluIHRoZSBgc2V0YCBmdW5jdGlvblxuICAgICAgdGhpcy5iaW5kaW5ncyA9IGJpbmRpbmdzXG5cbiAgICAgIGlmIChjaGlsZFNlcmlhbGl6ZXJzKSB7XG4gICAgICAgIHRoaXMuc2VyaWFsaXplcnMgPSBjaGlsZFNlcmlhbGl6ZXJzXG4gICAgICAgIHRoaXMuX3NlcmlhbGl6ZSA9IGNoaWxkU2VyaWFsaXplXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNtaXQpIHtcbiAgICAgICAgdGhpcy5fbG9nRXZlbnQgPSBjcmVhdGVMb2dFdmVudFNoYXBlKFxuICAgICAgICAgIFtdLmNvbmNhdChwYXJlbnQuX2xvZ0V2ZW50LmJpbmRpbmdzLCBiaW5kaW5ncylcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICBDaGlsZC5wcm90b3R5cGUgPSB0aGlzXG4gICAgY29uc3QgbmV3TG9nZ2VyID0gbmV3IENoaWxkKHRoaXMpXG5cbiAgICAvLyBtdXN0IGhhcHBlbiBiZWZvcmUgdGhlIGxldmVsIGlzIGFzc2lnbmVkXG4gICAgYXBwZW5kQ2hpbGRMb2dnZXIodGhpcywgbmV3TG9nZ2VyKVxuICAgIG5ld0xvZ2dlci5jaGlsZCA9IGZ1bmN0aW9uICguLi5hcmdzKSB7IHJldHVybiBjaGlsZC5jYWxsKHRoaXMsIHNldE9wdHMsIC4uLmFyZ3MpIH1cbiAgICAvLyByZXF1aXJlZCB0byBhY3R1YWxseSBpbml0aWFsaXplIHRoZSBsb2dnZXIgZnVuY3Rpb25zIGZvciBhbnkgZ2l2ZW4gY2hpbGRcbiAgICBuZXdMb2dnZXIubGV2ZWwgPSBjaGlsZE9wdGlvbnMubGV2ZWwgfHwgdGhpcy5sZXZlbCAvLyBhbGxvdyBsZXZlbCB0byBiZSBzZXQgYnkgY2hpbGRPcHRpb25zXG4gICAgc2V0T3B0cy5vbkNoaWxkKG5ld0xvZ2dlcilcblxuICAgIHJldHVybiBuZXdMb2dnZXJcbiAgfVxuICByZXR1cm4gbG9nZ2VyXG59XG5cbmZ1bmN0aW9uIGdldExldmVscyAob3B0cykge1xuICBjb25zdCBjdXN0b21MZXZlbHMgPSBvcHRzLmN1c3RvbUxldmVscyB8fCB7fVxuXG4gIGNvbnN0IHZhbHVlcyA9IE9iamVjdC5hc3NpZ24oe30sIHBpbm8ubGV2ZWxzLnZhbHVlcywgY3VzdG9tTGV2ZWxzKVxuICBjb25zdCBsYWJlbHMgPSBPYmplY3QuYXNzaWduKHt9LCBwaW5vLmxldmVscy5sYWJlbHMsIGludmVydE9iamVjdChjdXN0b21MZXZlbHMpKVxuXG4gIHJldHVybiB7XG4gICAgdmFsdWVzLFxuICAgIGxhYmVsc1xuICB9XG59XG5cbmZ1bmN0aW9uIGludmVydE9iamVjdCAob2JqKSB7XG4gIGNvbnN0IGludmVydGVkID0ge31cbiAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpbnZlcnRlZFtvYmpba2V5XV0gPSBrZXlcbiAgfSlcbiAgcmV0dXJuIGludmVydGVkXG59XG5cbnBpbm8ubGV2ZWxzID0ge1xuICB2YWx1ZXM6IHtcbiAgICBmYXRhbDogNjAsXG4gICAgZXJyb3I6IDUwLFxuICAgIHdhcm46IDQwLFxuICAgIGluZm86IDMwLFxuICAgIGRlYnVnOiAyMCxcbiAgICB0cmFjZTogMTBcbiAgfSxcbiAgbGFiZWxzOiB7XG4gICAgMTA6ICd0cmFjZScsXG4gICAgMjA6ICdkZWJ1ZycsXG4gICAgMzA6ICdpbmZvJyxcbiAgICA0MDogJ3dhcm4nLFxuICAgIDUwOiAnZXJyb3InLFxuICAgIDYwOiAnZmF0YWwnXG4gIH1cbn1cblxucGluby5zdGRTZXJpYWxpemVycyA9IHN0ZFNlcmlhbGl6ZXJzXG5waW5vLnN0ZFRpbWVGdW5jdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG51bGxUaW1lLCBlcG9jaFRpbWUsIHVuaXhUaW1lLCBpc29UaW1lIH0pXG5cbmZ1bmN0aW9uIGdldEJpbmRpbmdDaGFpbiAobG9nZ2VyKSB7XG4gIGNvbnN0IGJpbmRpbmdzID0gW11cbiAgaWYgKGxvZ2dlci5iaW5kaW5ncykge1xuICAgIGJpbmRpbmdzLnB1c2gobG9nZ2VyLmJpbmRpbmdzKVxuICB9XG5cbiAgLy8gdHJhdmVyc2UgdXAgdGhlIHRyZWUgdG8gZ2V0IGFsbCBiaW5kaW5nc1xuICBsZXQgaGllcmFyY2h5ID0gbG9nZ2VyW2hpZXJhcmNoeVN5bWJvbF1cbiAgd2hpbGUgKGhpZXJhcmNoeS5wYXJlbnQpIHtcbiAgICBoaWVyYXJjaHkgPSBoaWVyYXJjaHkucGFyZW50XG4gICAgaWYgKGhpZXJhcmNoeS5sb2dnZXIuYmluZGluZ3MpIHtcbiAgICAgIGJpbmRpbmdzLnB1c2goaGllcmFyY2h5LmxvZ2dlci5iaW5kaW5ncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYmluZGluZ3MucmV2ZXJzZSgpXG59XG5cbmZ1bmN0aW9uIHNldCAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpIHtcbiAgLy8gb3ZlcnJpZGUgdGhlIGN1cnJlbnQgbG9nIGZ1bmN0aW9ucyB3aXRoIGVpdGhlciBgbm9vcGAgb3IgdGhlIGJhc2UgbG9nIGZ1bmN0aW9uXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBsZXZlbCwge1xuICAgIHZhbHVlOiAobGV2ZWxUb1ZhbHVlKHNlbGYubGV2ZWwsIHJvb3RMb2dnZXIpID4gbGV2ZWxUb1ZhbHVlKGxldmVsLCByb290TG9nZ2VyKVxuICAgICAgPyBub29wXG4gICAgICA6IHJvb3RMb2dnZXJbYmFzZUxvZ0Z1bmN0aW9uU3ltYm9sXVtsZXZlbF0pLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pXG5cbiAgaWYgKHNlbGZbbGV2ZWxdID09PSBub29wKSB7XG4gICAgaWYgKCFvcHRzLnRyYW5zbWl0KSByZXR1cm5cblxuICAgIGNvbnN0IHRyYW5zbWl0TGV2ZWwgPSBvcHRzLnRyYW5zbWl0LmxldmVsIHx8IHNlbGYubGV2ZWxcbiAgICBjb25zdCB0cmFuc21pdFZhbHVlID0gbGV2ZWxUb1ZhbHVlKHRyYW5zbWl0TGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgY29uc3QgbWV0aG9kVmFsdWUgPSBsZXZlbFRvVmFsdWUobGV2ZWwsIHJvb3RMb2dnZXIpXG4gICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gIH1cblxuICAvLyBtYWtlIHN1cmUgdGhlIGxvZyBmb3JtYXQgaXMgY29ycmVjdFxuICBzZWxmW2xldmVsXSA9IGNyZWF0ZVdyYXAoc2VsZiwgb3B0cywgcm9vdExvZ2dlciwgbGV2ZWwpXG5cbiAgLy8gcHJlcGVuZCBiaW5kaW5ncyBpZiBpdCBpcyBub3QgdGhlIHJvb3QgbG9nZ2VyXG4gIGNvbnN0IGJpbmRpbmdzID0gZ2V0QmluZGluZ0NoYWluKHNlbGYpXG4gIGlmIChiaW5kaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAvLyBlYXJseSBleGl0IGluIGNhc2UgZm9yIHJvb3RMb2dnZXJcbiAgICByZXR1cm5cbiAgfVxuICBzZWxmW2xldmVsXSA9IHByZXBlbmRCaW5kaW5nc0luQXJndW1lbnRzKGJpbmRpbmdzLCBzZWxmW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gcHJlcGVuZEJpbmRpbmdzSW5Bcmd1bWVudHMgKGJpbmRpbmdzLCBsb2dGdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGxvZ0Z1bmMuYXBwbHkodGhpcywgWy4uLmJpbmRpbmdzLCAuLi5hcmd1bWVudHNdKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyYXAgKHNlbGYsIG9wdHMsIHJvb3RMb2dnZXIsIGxldmVsKSB7XG4gIHJldHVybiAoZnVuY3Rpb24gKHdyaXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIExPRyAoKSB7XG4gICAgICBjb25zdCB0cyA9IG9wdHMudGltZXN0YW1wKClcbiAgICAgIGNvbnN0IGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aClcbiAgICAgIGNvbnN0IHByb3RvID0gKE9iamVjdC5nZXRQcm90b3R5cGVPZiAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykgPT09IF9jb25zb2xlKSA/IF9jb25zb2xlIDogdGhpc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG5cbiAgICAgIHZhciBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2VcbiAgICAgIGlmIChvcHRzLnNlcmlhbGl6ZSkge1xuICAgICAgICBhcHBseVNlcmlhbGl6ZXJzKGFyZ3MsIHRoaXMuX3NlcmlhbGl6ZSwgdGhpcy5zZXJpYWxpemVycywgdGhpcy5fc3RkRXJyU2VyaWFsaXplKVxuICAgICAgICBhcmdzSXNTZXJpYWxpemVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG9wdHMuYXNPYmplY3QgfHwgb3B0cy5mb3JtYXR0ZXJzKSB7XG4gICAgICAgIGNvbnN0IG91dCA9IGFzT2JqZWN0KHRoaXMsIGxldmVsLCBhcmdzLCB0cywgb3B0cylcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyICYmIG91dCAmJiBvdXQubGVuZ3RoID4gMCAmJiBvdXRbMF0gJiYgdHlwZW9mIG91dFswXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2FsbGVyID0gZ2V0Q2FsbGVyTG9jYXRpb24oKVxuICAgICAgICAgICAgaWYgKGNhbGxlcikgb3V0WzBdLmNhbGxlciA9IGNhbGxlclxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGUuY2FsbChwcm90bywgLi4ub3V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9wdHMucmVwb3J0Q2FsbGVyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlciA9IGdldENhbGxlckxvY2F0aW9uKClcbiAgICAgICAgICAgIGlmIChjYWxsZXIpIGFyZ3MucHVzaChjYWxsZXIpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuICAgICAgICB3cml0ZS5hcHBseShwcm90bywgYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMudHJhbnNtaXQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNtaXRMZXZlbCA9IG9wdHMudHJhbnNtaXQubGV2ZWwgfHwgc2VsZi5fbGV2ZWxcbiAgICAgICAgY29uc3QgdHJhbnNtaXRWYWx1ZSA9IGxldmVsVG9WYWx1ZSh0cmFuc21pdExldmVsLCByb290TG9nZ2VyKVxuICAgICAgICBjb25zdCBtZXRob2RWYWx1ZSA9IGxldmVsVG9WYWx1ZShsZXZlbCwgcm9vdExvZ2dlcilcbiAgICAgICAgaWYgKG1ldGhvZFZhbHVlIDwgdHJhbnNtaXRWYWx1ZSkgcmV0dXJuXG4gICAgICAgIHRyYW5zbWl0KHRoaXMsIHtcbiAgICAgICAgICB0cyxcbiAgICAgICAgICBtZXRob2RMZXZlbDogbGV2ZWwsXG4gICAgICAgICAgbWV0aG9kVmFsdWUsXG4gICAgICAgICAgdHJhbnNtaXRMZXZlbCxcbiAgICAgICAgICB0cmFuc21pdFZhbHVlOiByb290TG9nZ2VyLmxldmVscy52YWx1ZXNbb3B0cy50cmFuc21pdC5sZXZlbCB8fCBzZWxmLl9sZXZlbF0sXG4gICAgICAgICAgc2VuZDogb3B0cy50cmFuc21pdC5zZW5kLFxuICAgICAgICAgIHZhbDogbGV2ZWxUb1ZhbHVlKHNlbGYuX2xldmVsLCByb290TG9nZ2VyKVxuICAgICAgICB9LCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkKVxuICAgICAgfVxuICAgIH1cbiAgfSkoc2VsZltiYXNlTG9nRnVuY3Rpb25TeW1ib2xdW2xldmVsXSlcbn1cblxuZnVuY3Rpb24gYXNPYmplY3QgKGxvZ2dlciwgbGV2ZWwsIGFyZ3MsIHRzLCBvcHRzKSB7XG4gIGNvbnN0IHtcbiAgICBsZXZlbDogbGV2ZWxGb3JtYXR0ZXIsXG4gICAgbG9nOiBsb2dPYmplY3RGb3JtYXR0ZXIgPSAob2JqKSA9PiBvYmpcbiAgfSA9IG9wdHMuZm9ybWF0dGVycyB8fCB7fVxuICBjb25zdCBhcmdzQ2xvbmVkID0gYXJncy5zbGljZSgpXG4gIGxldCBtc2cgPSBhcmdzQ2xvbmVkWzBdXG4gIGNvbnN0IGxvZ09iamVjdCA9IHt9XG5cbiAgbGV0IGx2bCA9IChsb2dnZXIuX2NoaWxkTGV2ZWwgfCAwKSArIDFcbiAgaWYgKGx2bCA8IDEpIGx2bCA9IDFcblxuICBpZiAodHMpIHtcbiAgICBsb2dPYmplY3QudGltZSA9IHRzXG4gIH1cblxuICBpZiAobGV2ZWxGb3JtYXR0ZXIpIHtcbiAgICBjb25zdCBmb3JtYXR0ZWRMZXZlbCA9IGxldmVsRm9ybWF0dGVyKGxldmVsLCBsb2dnZXIubGV2ZWxzLnZhbHVlc1tsZXZlbF0pXG4gICAgT2JqZWN0LmFzc2lnbihsb2dPYmplY3QsIGZvcm1hdHRlZExldmVsKVxuICB9IGVsc2Uge1xuICAgIGxvZ09iamVjdC5sZXZlbCA9IGxvZ2dlci5sZXZlbHMudmFsdWVzW2xldmVsXVxuICB9XG5cbiAgaWYgKG9wdHMuYXNPYmplY3RCaW5kaW5nc09ubHkpIHtcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZm9ybWF0dGVkTG9nT2JqZWN0ID0gbG9nT2JqZWN0Rm9ybWF0dGVyKGxvZ09iamVjdClcbiAgICByZXR1cm4gW2Zvcm1hdHRlZExvZ09iamVjdCwgLi4uYXJnc0Nsb25lZF1cbiAgfSBlbHNlIHtcbiAgICAvLyBkZWxpYmVyYXRlLCBjYXRjaGluZyBvYmplY3RzLCBhcnJheXNcbiAgICBpZiAobXNnICE9PSBudWxsICYmIHR5cGVvZiBtc2cgPT09ICdvYmplY3QnKSB7XG4gICAgICB3aGlsZSAobHZsLS0gJiYgdHlwZW9mIGFyZ3NDbG9uZWRbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24obG9nT2JqZWN0LCBhcmdzQ2xvbmVkLnNoaWZ0KCkpXG4gICAgICB9XG4gICAgICBtc2cgPSBhcmdzQ2xvbmVkLmxlbmd0aCA/IGZvcm1hdChhcmdzQ2xvbmVkLnNoaWZ0KCksIGFyZ3NDbG9uZWQpIDogdW5kZWZpbmVkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbXNnID09PSAnc3RyaW5nJykgbXNnID0gZm9ybWF0KGFyZ3NDbG9uZWQuc2hpZnQoKSwgYXJnc0Nsb25lZClcbiAgICBpZiAobXNnICE9PSB1bmRlZmluZWQpIGxvZ09iamVjdFtvcHRzLm1lc3NhZ2VLZXldID0gbXNnXG5cbiAgICBjb25zdCBmb3JtYXR0ZWRMb2dPYmplY3QgPSBsb2dPYmplY3RGb3JtYXR0ZXIobG9nT2JqZWN0KVxuICAgIHJldHVybiBbZm9ybWF0dGVkTG9nT2JqZWN0XVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5U2VyaWFsaXplcnMgKGFyZ3MsIHNlcmlhbGl6ZSwgc2VyaWFsaXplcnMsIHN0ZEVyclNlcmlhbGl6ZSkge1xuICBmb3IgKGNvbnN0IGkgaW4gYXJncykge1xuICAgIGlmIChzdGRFcnJTZXJpYWxpemUgJiYgYXJnc1tpXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBhcmdzW2ldID0gcGluby5zdGRTZXJpYWxpemVycy5lcnIoYXJnc1tpXSlcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzW2ldKSAmJiBzZXJpYWxpemUpIHtcbiAgICAgIGZvciAoY29uc3QgayBpbiBhcmdzW2ldKSB7XG4gICAgICAgIGlmIChzZXJpYWxpemUuaW5kZXhPZihrKSA+IC0xICYmIGsgaW4gc2VyaWFsaXplcnMpIHtcbiAgICAgICAgICBhcmdzW2ldW2tdID0gc2VyaWFsaXplcnNba10oYXJnc1tpXVtrXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc21pdCAobG9nZ2VyLCBvcHRzLCBhcmdzLCBhcmdzSXNTZXJpYWxpemVkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2VuZCA9IG9wdHMuc2VuZFxuICBjb25zdCB0cyA9IG9wdHMudHNcbiAgY29uc3QgbWV0aG9kTGV2ZWwgPSBvcHRzLm1ldGhvZExldmVsXG4gIGNvbnN0IG1ldGhvZFZhbHVlID0gb3B0cy5tZXRob2RWYWx1ZVxuICBjb25zdCB2YWwgPSBvcHRzLnZhbFxuICBjb25zdCBiaW5kaW5ncyA9IGxvZ2dlci5fbG9nRXZlbnQuYmluZGluZ3NcblxuICBpZiAoIWFyZ3NJc1NlcmlhbGl6ZWQpIHtcbiAgICBhcHBseVNlcmlhbGl6ZXJzKFxuICAgICAgYXJncyxcbiAgICAgIGxvZ2dlci5fc2VyaWFsaXplIHx8IE9iamVjdC5rZXlzKGxvZ2dlci5zZXJpYWxpemVycyksXG4gICAgICBsb2dnZXIuc2VyaWFsaXplcnMsXG4gICAgICBsb2dnZXIuX3N0ZEVyclNlcmlhbGl6ZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGxvZ2dlci5fc3RkRXJyU2VyaWFsaXplXG4gICAgKVxuICB9XG5cbiAgbG9nZ2VyLl9sb2dFdmVudC50cyA9IHRzXG4gIGxvZ2dlci5fbG9nRXZlbnQubWVzc2FnZXMgPSBhcmdzLmZpbHRlcihmdW5jdGlvbiAoYXJnKSB7XG4gICAgLy8gYmluZGluZ3MgY2FuIG9ubHkgYmUgb2JqZWN0cywgc28gcmVmZXJlbmNlIGVxdWFsaXR5IGNoZWNrIHZpYSBpbmRleE9mIGlzIGZpbmVcbiAgICByZXR1cm4gYmluZGluZ3MuaW5kZXhPZihhcmcpID09PSAtMVxuICB9KVxuXG4gIGxvZ2dlci5fbG9nRXZlbnQubGV2ZWwubGFiZWwgPSBtZXRob2RMZXZlbFxuICBsb2dnZXIuX2xvZ0V2ZW50LmxldmVsLnZhbHVlID0gbWV0aG9kVmFsdWVcblxuICBzZW5kKG1ldGhvZExldmVsLCBsb2dnZXIuX2xvZ0V2ZW50LCB2YWwpXG5cbiAgbG9nZ2VyLl9sb2dFdmVudCA9IGNyZWF0ZUxvZ0V2ZW50U2hhcGUoYmluZGluZ3MpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ0V2ZW50U2hhcGUgKGJpbmRpbmdzKSB7XG4gIHJldHVybiB7XG4gICAgdHM6IDAsXG4gICAgbWVzc2FnZXM6IFtdLFxuICAgIGJpbmRpbmdzOiBiaW5kaW5ncyB8fCBbXSxcbiAgICBsZXZlbDogeyBsYWJlbDogJycsIHZhbHVlOiAwIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhc0VyclZhbHVlIChlcnIpIHtcbiAgY29uc3Qgb2JqID0ge1xuICAgIHR5cGU6IGVyci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgIG1zZzogZXJyLm1lc3NhZ2UsXG4gICAgc3RhY2s6IGVyci5zdGFja1xuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGVycikge1xuICAgIGlmIChvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvYmpba2V5XSA9IGVycltrZXldXG4gICAgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gZ2V0VGltZUZ1bmN0aW9uIChvcHRzKSB7XG4gIGlmICh0eXBlb2Ygb3B0cy50aW1lc3RhbXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gb3B0cy50aW1lc3RhbXBcbiAgfVxuICBpZiAob3B0cy50aW1lc3RhbXAgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG51bGxUaW1lXG4gIH1cbiAgcmV0dXJuIGVwb2NoVGltZVxufVxuXG5mdW5jdGlvbiBtb2NrICgpIHsgcmV0dXJuIHt9IH1cbmZ1bmN0aW9uIHBhc3N0aHJvdWdoIChhKSB7IHJldHVybiBhIH1cbmZ1bmN0aW9uIG5vb3AgKCkge31cblxuZnVuY3Rpb24gbnVsbFRpbWUgKCkgeyByZXR1cm4gZmFsc2UgfVxuZnVuY3Rpb24gZXBvY2hUaW1lICgpIHsgcmV0dXJuIERhdGUubm93KCkgfVxuZnVuY3Rpb24gdW5peFRpbWUgKCkgeyByZXR1cm4gTWF0aC5yb3VuZChEYXRlLm5vdygpIC8gMTAwMC4wKSB9XG5mdW5jdGlvbiBpc29UaW1lICgpIHsgcmV0dXJuIG5ldyBEYXRlKERhdGUubm93KCkpLnRvSVNPU3RyaW5nKCkgfSAvLyB1c2luZyBEYXRlLm5vdygpIGZvciB0ZXN0YWJpbGl0eVxuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIHBmR2xvYmFsVGhpc09yRmFsbGJhY2sgKCkge1xuICBmdW5jdGlvbiBkZWZkIChvKSB7IHJldHVybiB0eXBlb2YgbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbyB9XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGdsb2JhbFRoaXNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ2dsb2JhbFRoaXMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIE9iamVjdC5wcm90b3R5cGUuZ2xvYmFsVGhpc1xuICAgICAgICByZXR1cm4gKHRoaXMuZ2xvYmFsVGhpcyA9IHRoaXMpXG4gICAgICB9LFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICByZXR1cm4gZ2xvYmFsVGhpc1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGRlZmQoc2VsZikgfHwgZGVmZCh3aW5kb3cpIHx8IGRlZmQodGhpcykgfHwge31cbiAgfVxufVxuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gcGlub1xubW9kdWxlLmV4cG9ydHMucGlubyA9IHBpbm9cblxuLy8gQXR0ZW1wdCB0byBleHRyYWN0IHRoZSB1c2VyIGNhbGxzaXRlIChmaWxlOmxpbmU6Y29sdW1uKVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIGdldENhbGxlckxvY2F0aW9uICgpIHtcbiAgY29uc3Qgc3RhY2sgPSAobmV3IEVycm9yKCkpLnN0YWNrXG4gIGlmICghc3RhY2spIHJldHVybiBudWxsXG4gIGNvbnN0IGxpbmVzID0gc3RhY2suc3BsaXQoJ1xcbicpXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBsID0gbGluZXNbaV0udHJpbSgpXG4gICAgLy8gc2tpcCBmcmFtZXMgZnJvbSB0aGlzIGZpbGUgYW5kIGludGVybmFsc1xuICAgIGlmICgvKF5hdFxccyspPyhjcmVhdGVXcmFwfExPR3xzZXRcXHMqXFwofGFzT2JqZWN0fE9iamVjdFxcLmFwcGx5fEZ1bmN0aW9uXFwuYXBwbHkpLy50ZXN0KGwpKSBjb250aW51ZVxuICAgIGlmIChsLmluZGV4T2YoJ2Jyb3dzZXIuanMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgaWYgKGwuaW5kZXhPZignbm9kZTppbnRlcm5hbCcpICE9PSAtMSkgY29udGludWVcbiAgICBpZiAobC5pbmRleE9mKCdub2RlX21vZHVsZXMnKSAhPT0gLTEpIGNvbnRpbnVlXG4gICAgLy8gdHJ5IGZvcm1hdHMgbGlrZTogYXQgZnVuYyAoZmlsZTpsaW5lOmNvbCkgb3IgYXQgZmlsZTpsaW5lOmNvbFxuICAgIGxldCBtID0gbC5tYXRjaCgvXFwoKC4qPyk6KFxcZCspOihcXGQrKVxcKS8pXG4gICAgaWYgKCFtKSBtID0gbC5tYXRjaCgvYXRcXHMrKC4qPyk6KFxcZCspOihcXGQrKS8pXG4gICAgaWYgKG0pIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBtWzFdXG4gICAgICBjb25zdCBsaW5lID0gbVsyXVxuICAgICAgY29uc3QgY29sID0gbVszXVxuICAgICAgcmV0dXJuIGZpbGUgKyAnOicgKyBsaW5lICsgJzonICsgY29sXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG4iLCAibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCAiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5iZWNoMzJtID0gZXhwb3J0cy5iZWNoMzIgPSB2b2lkIDA7XG5jb25zdCBBTFBIQUJFVCA9ICdxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bCc7XG5jb25zdCBBTFBIQUJFVF9NQVAgPSB7fTtcbmZvciAobGV0IHogPSAwOyB6IDwgQUxQSEFCRVQubGVuZ3RoOyB6KyspIHtcbiAgICBjb25zdCB4ID0gQUxQSEFCRVQuY2hhckF0KHopO1xuICAgIEFMUEhBQkVUX01BUFt4XSA9IHo7XG59XG5mdW5jdGlvbiBwb2x5bW9kU3RlcChwcmUpIHtcbiAgICBjb25zdCBiID0gcHJlID4+IDI1O1xuICAgIHJldHVybiAoKChwcmUgJiAweDFmZmZmZmYpIDw8IDUpIF5cbiAgICAgICAgKC0oKGIgPj4gMCkgJiAxKSAmIDB4M2I2YTU3YjIpIF5cbiAgICAgICAgKC0oKGIgPj4gMSkgJiAxKSAmIDB4MjY1MDhlNmQpIF5cbiAgICAgICAgKC0oKGIgPj4gMikgJiAxKSAmIDB4MWVhMTE5ZmEpIF5cbiAgICAgICAgKC0oKGIgPj4gMykgJiAxKSAmIDB4M2Q0MjMzZGQpIF5cbiAgICAgICAgKC0oKGIgPj4gNCkgJiAxKSAmIDB4MmExNDYyYjMpKTtcbn1cbmZ1bmN0aW9uIHByZWZpeENoayhwcmVmaXgpIHtcbiAgICBsZXQgY2hrID0gMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBjID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjIDwgMzMgfHwgYyA+IDEyNilcbiAgICAgICAgICAgIHJldHVybiAnSW52YWxpZCBwcmVmaXggKCcgKyBwcmVmaXggKyAnKSc7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAoYyA+PiA1KTtcbiAgICB9XG4gICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCB2ID0gcHJlZml4LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoaykgXiAodiAmIDB4MWYpO1xuICAgIH1cbiAgICByZXR1cm4gY2hrO1xufVxuZnVuY3Rpb24gY29udmVydChkYXRhLCBpbkJpdHMsIG91dEJpdHMsIHBhZCkge1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgbGV0IGJpdHMgPSAwO1xuICAgIGNvbnN0IG1heFYgPSAoMSA8PCBvdXRCaXRzKSAtIDE7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhbHVlID0gKHZhbHVlIDw8IGluQml0cykgfCBkYXRhW2ldO1xuICAgICAgICBiaXRzICs9IGluQml0cztcbiAgICAgICAgd2hpbGUgKGJpdHMgPj0gb3V0Qml0cykge1xuICAgICAgICAgICAgYml0cyAtPSBvdXRCaXRzO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goKHZhbHVlID4+IGJpdHMpICYgbWF4Vik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhZCkge1xuICAgICAgICBpZiAoYml0cyA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoYml0cyA+PSBpbkJpdHMpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VzcyBwYWRkaW5nJztcbiAgICAgICAgaWYgKCh2YWx1ZSA8PCAob3V0Qml0cyAtIGJpdHMpKSAmIG1heFYpXG4gICAgICAgICAgICByZXR1cm4gJ05vbi16ZXJvIHBhZGRpbmcnO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gdG9Xb3JkcyhieXRlcykge1xuICAgIHJldHVybiBjb252ZXJ0KGJ5dGVzLCA4LCA1LCB0cnVlKTtcbn1cbmZ1bmN0aW9uIGZyb21Xb3Jkc1Vuc2FmZSh3b3Jkcykge1xuICAgIGNvbnN0IHJlcyA9IGNvbnZlcnQod29yZHMsIDUsIDgsIGZhbHNlKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXMpKVxuICAgICAgICByZXR1cm4gcmVzO1xufVxuZnVuY3Rpb24gZnJvbVdvcmRzKHdvcmRzKSB7XG4gICAgY29uc3QgcmVzID0gY29udmVydCh3b3JkcywgNSwgOCwgZmFsc2UpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlcykpXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG59XG5mdW5jdGlvbiBnZXRMaWJyYXJ5RnJvbUVuY29kaW5nKGVuY29kaW5nKSB7XG4gICAgbGV0IEVOQ09ESU5HX0NPTlNUO1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2JlY2gzMicpIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAxO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgRU5DT0RJTkdfQ09OU1QgPSAweDJiYzgzMGEzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbmNvZGUocHJlZml4LCB3b3JkcywgTElNSVQpIHtcbiAgICAgICAgTElNSVQgPSBMSU1JVCB8fCA5MDtcbiAgICAgICAgaWYgKHByZWZpeC5sZW5ndGggKyA3ICsgd29yZHMubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeGNlZWRzIGxlbmd0aCBsaW1pdCcpO1xuICAgICAgICBwcmVmaXggPSBwcmVmaXgudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGNoayBtb2RcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY2hrKTtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHByZWZpeCArICcxJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgeCA9IHdvcmRzW2ldO1xuICAgICAgICAgICAgaWYgKHggPj4gNSAhPT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbiA1LWJpdCB3b3JkJyk7XG4gICAgICAgICAgICBjaGsgPSBwb2x5bW9kU3RlcChjaGspIF4geDtcbiAgICAgICAgICAgIHJlc3VsdCArPSBBTFBIQUJFVC5jaGFyQXQoeCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgIGNoayA9IHBvbHltb2RTdGVwKGNoayk7XG4gICAgICAgIH1cbiAgICAgICAgY2hrIF49IEVOQ09ESU5HX0NPTlNUO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgdiA9IChjaGsgPj4gKCg1IC0gaSkgKiA1KSkgJiAweDFmO1xuICAgICAgICAgICAgcmVzdWx0ICs9IEFMUEhBQkVULmNoYXJBdCh2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBfX2RlY29kZShzdHIsIExJTUlUKSB7XG4gICAgICAgIExJTUlUID0gTElNSVQgfHwgOTA7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoIDwgOClcbiAgICAgICAgICAgIHJldHVybiBzdHIgKyAnIHRvbyBzaG9ydCc7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoID4gTElNSVQpXG4gICAgICAgICAgICByZXR1cm4gJ0V4Y2VlZHMgbGVuZ3RoIGxpbWl0JztcbiAgICAgICAgLy8gZG9uJ3QgYWxsb3cgbWl4ZWQgY2FzZVxuICAgICAgICBjb25zdCBsb3dlcmVkID0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IHVwcGVyZWQgPSBzdHIudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKHN0ciAhPT0gbG93ZXJlZCAmJiBzdHIgIT09IHVwcGVyZWQpXG4gICAgICAgICAgICByZXR1cm4gJ01peGVkLWNhc2Ugc3RyaW5nICcgKyBzdHI7XG4gICAgICAgIHN0ciA9IGxvd2VyZWQ7XG4gICAgICAgIGNvbnN0IHNwbGl0ID0gc3RyLmxhc3RJbmRleE9mKCcxJyk7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gLTEpXG4gICAgICAgICAgICByZXR1cm4gJ05vIHNlcGFyYXRvciBjaGFyYWN0ZXIgZm9yICcgKyBzdHI7XG4gICAgICAgIGlmIChzcGxpdCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAnTWlzc2luZyBwcmVmaXggZm9yICcgKyBzdHI7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHN0ci5zbGljZSgwLCBzcGxpdCk7XG4gICAgICAgIGNvbnN0IHdvcmRDaGFycyA9IHN0ci5zbGljZShzcGxpdCArIDEpO1xuICAgICAgICBpZiAod29yZENoYXJzLmxlbmd0aCA8IDYpXG4gICAgICAgICAgICByZXR1cm4gJ0RhdGEgdG9vIHNob3J0JztcbiAgICAgICAgbGV0IGNoayA9IHByZWZpeENoayhwcmVmaXgpO1xuICAgICAgICBpZiAodHlwZW9mIGNoayA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gY2hrO1xuICAgICAgICBjb25zdCB3b3JkcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRDaGFycy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IHdvcmRDaGFycy5jaGFyQXQoaSk7XG4gICAgICAgICAgICBjb25zdCB2ID0gQUxQSEFCRVRfTUFQW2NdO1xuICAgICAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1Vua25vd24gY2hhcmFjdGVyICcgKyBjO1xuICAgICAgICAgICAgY2hrID0gcG9seW1vZFN0ZXAoY2hrKSBeIHY7XG4gICAgICAgICAgICAvLyBub3QgaW4gdGhlIGNoZWNrc3VtP1xuICAgICAgICAgICAgaWYgKGkgKyA2ID49IHdvcmRDaGFycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB3b3Jkcy5wdXNoKHYpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGsgIT09IEVOQ09ESU5HX0NPTlNUKVxuICAgICAgICAgICAgcmV0dXJuICdJbnZhbGlkIGNoZWNrc3VtIGZvciAnICsgc3RyO1xuICAgICAgICByZXR1cm4geyBwcmVmaXgsIHdvcmRzIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlY29kZVVuc2FmZShzdHIsIExJTUlUKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IF9fZGVjb2RlKHN0ciwgTElNSVQpO1xuICAgICAgICBpZiAodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNvZGUoc3RyLCBMSU1JVCkge1xuICAgICAgICBjb25zdCByZXMgPSBfX2RlY29kZShzdHIsIExJTUlUKTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlcyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGRlY29kZVVuc2FmZSxcbiAgICAgICAgZGVjb2RlLFxuICAgICAgICBlbmNvZGUsXG4gICAgICAgIHRvV29yZHMsXG4gICAgICAgIGZyb21Xb3Jkc1Vuc2FmZSxcbiAgICAgICAgZnJvbVdvcmRzLFxuICAgIH07XG59XG5leHBvcnRzLmJlY2gzMiA9IGdldExpYnJhcnlGcm9tRW5jb2RpbmcoJ2JlY2gzMicpO1xuZXhwb3J0cy5iZWNoMzJtID0gZ2V0TGlicmFyeUZyb21FbmNvZGluZygnYmVjaDMybScpO1xuIiwgIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbi8vIFN1cHBvcnQgZGVjb2RpbmcgVVJMLXNhZmUgYmFzZTY0IHN0cmluZ3MsIGFzIE5vZGUuanMgZG9lcy5cbi8vIFNlZTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0I1VSTF9hcHBsaWNhdGlvbnNcbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIGdldExlbnMgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyBUcmltIG9mZiBleHRyYSBieXRlcyBhZnRlciBwbGFjZWhvbGRlciBieXRlcyBhcmUgZm91bmRcbiAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYmVhdGdhbW1pdC9iYXNlNjQtanMvaXNzdWVzLzQyXG4gIHZhciB2YWxpZExlbiA9IGI2NC5pbmRleE9mKCc9JylcbiAgaWYgKHZhbGlkTGVuID09PSAtMSkgdmFsaWRMZW4gPSBsZW5cblxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlblxuICAgID8gMFxuICAgIDogNCAtICh2YWxpZExlbiAlIDQpXG5cbiAgcmV0dXJuIFt2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuXVxufVxuXG4vLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiBfYnl0ZUxlbmd0aCAoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XG4gIHJldHVybiAoKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0KSAtIHBsYWNlSG9sZGVyc0xlblxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NClcbiAgdmFyIHZhbGlkTGVuID0gbGVuc1swXVxuICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXVxuXG4gIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpXG5cbiAgdmFyIGN1ckJ5dGUgPSAwXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICB2YXIgbGVuID0gcGxhY2VIb2xkZXJzTGVuID4gMFxuICAgID8gdmFsaWRMZW4gLSA0XG4gICAgOiB2YWxpZExlblxuXG4gIHZhciBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfFxuICAgICAgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfFxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICtcbiAgICBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID1cbiAgICAgICgodWludDhbaV0gPDwgMTYpICYgMHhGRjAwMDApICtcbiAgICAgICgodWludDhbaSArIDFdIDw8IDgpICYgMHhGRjAwKSArXG4gICAgICAodWludDhbaSArIDJdICYgMHhGRilcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIHBhcnRzLnB1c2goXG4gICAgICBsb29rdXBbdG1wID4+IDJdICtcbiAgICAgIGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl0gK1xuICAgICAgJz09J1xuICAgIClcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAxMF0gK1xuICAgICAgbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdICtcbiAgICAgICc9J1xuICAgIClcbiAgfVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwgIi8qISBpZWVlNzU0LiBCU0QtMy1DbGF1c2UgTGljZW5zZS4gRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnL29wZW5zb3VyY2U+ICovXG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCAiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbmNvbnN0IGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbmNvbnN0IGN1c3RvbUluc3BlY3RTeW1ib2wgPVxuICAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sWydmb3InXSA9PT0gJ2Z1bmN0aW9uJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA/IFN5bWJvbFsnZm9yJ10oJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkb3Qtbm90YXRpb25cbiAgICA6IG51bGxcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG5jb25zdCBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGNvbnN0IHByb3RvID0geyBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH0gfVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm90bywgVWludDhBcnJheS5wcm90b3R5cGUpXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGFyciwgcHJvdG8pXG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCAncGFyZW50Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclxuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ29mZnNldCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5ieXRlT2Zmc2V0XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAobGVuZ3RoKSB7XG4gIGlmIChsZW5ndGggPiBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIFwiJyArIGxlbmd0aCArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGJ1ZiwgQnVmZmVyLnByb3RvdHlwZSlcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcidcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbmZ1bmN0aW9uIGZyb20gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheVZpZXcodmFsdWUpXG4gIH1cblxuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2UodmFsdWUsIEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBBcnJheUJ1ZmZlcikpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIChpc0luc3RhbmNlKHZhbHVlLCBTaGFyZWRBcnJheUJ1ZmZlcikgfHxcbiAgICAgICh2YWx1ZSAmJiBpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlciwgU2hhcmVkQXJyYXlCdWZmZXIpKSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwidmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSBudW1iZXInXG4gICAgKVxuICB9XG5cbiAgY29uc3QgdmFsdWVPZiA9IHZhbHVlLnZhbHVlT2YgJiYgdmFsdWUudmFsdWVPZigpXG4gIGlmICh2YWx1ZU9mICE9IG51bGwgJiYgdmFsdWVPZiAhPT0gdmFsdWUpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZiwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgY29uc3QgYiA9IGZyb21PYmplY3QodmFsdWUpXG4gIGlmIChiKSByZXR1cm4gYlxuXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9QcmltaXRpdmUgIT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20odmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgnc3RyaW5nJyksIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ1RoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICcgK1xuICAgICdvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgKHR5cGVvZiB2YWx1ZSlcbiAgKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLnByb3RvdHlwZSwgVWludDhBcnJheS5wcm90b3R5cGUpXG5PYmplY3Quc2V0UHJvdG90eXBlT2YoQnVmZmVyLCBVaW50OEFycmF5KVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgXCInICsgc2l6ZSArICdcIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gXCJzaXplXCInKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gIH1cblxuICBjb25zdCBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICBsZXQgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcblxuICBjb25zdCBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIGNvbnN0IGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICBjb25zdCBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheVZpZXcgKGFycmF5Vmlldykge1xuICBpZiAoaXNJbnN0YW5jZShhcnJheVZpZXcsIFVpbnQ4QXJyYXkpKSB7XG4gICAgY29uc3QgY29weSA9IG5ldyBVaW50OEFycmF5KGFycmF5VmlldylcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKGNvcHkuYnVmZmVyLCBjb3B5LmJ5dGVPZmZzZXQsIGNvcHkuYnl0ZUxlbmd0aClcbiAgfVxuICByZXR1cm4gZnJvbUFycmF5TGlrZShhcnJheVZpZXcpXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJvZmZzZXRcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcImxlbmd0aFwiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBsZXQgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YoYnVmLCBCdWZmZXIucHJvdG90eXBlKVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIGNvbnN0IGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgY29uc3QgYnVmID0gY3JlYXRlQnVmZmVyKGxlbilcblxuICAgIGlmIChidWYubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnVmXG4gICAgfVxuXG4gICAgb2JqLmNvcHkoYnVmLCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIGJ1ZlxuICB9XG5cbiAgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYU4ob2JqLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICB9XG4gICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqKVxuICB9XG5cbiAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iai5kYXRhKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZSAmJlxuICAgIGIgIT09IEJ1ZmZlci5wcm90b3R5cGUgLy8gc28gQnVmZmVyLmlzQnVmZmVyKEJ1ZmZlci5wcm90b3R5cGUpIHdpbGwgYmUgZmFsc2Vcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmIChpc0luc3RhbmNlKGEsIFVpbnQ4QXJyYXkpKSBhID0gQnVmZmVyLmZyb20oYSwgYS5vZmZzZXQsIGEuYnl0ZUxlbmd0aClcbiAgaWYgKGlzSW5zdGFuY2UoYiwgVWludDhBcnJheSkpIGIgPSBCdWZmZXIuZnJvbShiLCBiLm9mZnNldCwgYi5ieXRlTGVuZ3RoKVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJidWYxXCIsIFwiYnVmMlwiIGFyZ3VtZW50cyBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5J1xuICAgIClcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIGxldCB4ID0gYS5sZW5ndGhcbiAgbGV0IHkgPSBiLmxlbmd0aFxuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgbGV0IGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICBsZXQgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIGxldCBidWYgPSBsaXN0W2ldXG4gICAgaWYgKGlzSW5zdGFuY2UoYnVmLCBVaW50OEFycmF5KSkge1xuICAgICAgaWYgKHBvcyArIGJ1Zi5sZW5ndGggPiBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIGJ1ZiA9IEJ1ZmZlci5mcm9tKGJ1ZilcbiAgICAgICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgICAgICBidWZmZXIsXG4gICAgICAgICAgYnVmLFxuICAgICAgICAgIHBvc1xuICAgICAgICApXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIH1cbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKSB8fCBpc0luc3RhbmNlKHN0cmluZywgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJzdHJpbmdcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBvciBBcnJheUJ1ZmZlci4gJyArXG4gICAgICAnUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHN0cmluZ1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgY29uc3QgbXVzdE1hdGNoID0gKGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSA9PT0gdHJ1ZSlcbiAgaWYgKCFtdXN0TWF0Y2ggJiYgbGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICBsZXQgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB7XG4gICAgICAgICAgcmV0dXJuIG11c3RNYXRjaCA/IC0xIDogdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgfVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJjaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCAoYW5kIHRoZSBgaXMtYnVmZmVyYCBucG0gcGFja2FnZSlcbi8vIHRvIGRldGVjdCBhIEJ1ZmZlciBpbnN0YW5jZS4gSXQncyBub3QgcG9zc2libGUgdG8gdXNlIGBpbnN0YW5jZW9mIEJ1ZmZlcmBcbi8vIHJlbGlhYmx5IGluIGEgYnJvd3NlcmlmeSBjb250ZXh0IGJlY2F1c2UgdGhlcmUgY291bGQgYmUgbXVsdGlwbGUgZGlmZmVyZW50XG4vLyBjb3BpZXMgb2YgdGhlICdidWZmZXInIHBhY2thZ2UgaW4gdXNlLiBUaGlzIG1ldGhvZCB3b3JrcyBldmVuIGZvciBCdWZmZXJcbi8vIGluc3RhbmNlcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIGFub3RoZXIgY29weSBvZiB0aGUgYGJ1ZmZlcmAgcGFja2FnZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE1NFxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgY29uc3QgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICBjb25zdCBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcgPSBCdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgbGV0IHN0ciA9ICcnXG4gIGNvbnN0IG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5yZXBsYWNlKC8oLnsyfSkvZywgJyQxICcpLnRyaW0oKVxuICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5pZiAoY3VzdG9tSW5zcGVjdFN5bWJvbCkge1xuICBCdWZmZXIucHJvdG90eXBlW2N1c3RvbUluc3BlY3RTeW1ib2xdID0gQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmIChpc0luc3RhbmNlKHRhcmdldCwgVWludDhBcnJheSkpIHtcbiAgICB0YXJnZXQgPSBCdWZmZXIuZnJvbSh0YXJnZXQsIHRhcmdldC5vZmZzZXQsIHRhcmdldC5ieXRlTGVuZ3RoKVxuICB9XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInRhcmdldFwiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXkuICcgK1xuICAgICAgJ1JlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdGFyZ2V0KVxuICAgIClcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIGxldCB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICBsZXQgeSA9IGVuZCAtIHN0YXJ0XG4gIGNvbnN0IGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgY29uc3QgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgY29uc3QgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgW3ZhbF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIGxldCBpbmRleFNpemUgPSAxXG4gIGxldCBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIGxldCB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIGxldCBpXG4gIGlmIChkaXIpIHtcbiAgICBsZXQgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIGNvbnN0IHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBsZXQgaVxuICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKG51bWJlcklzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICBjb25zdCByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIGxldCBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgY29uc3QgcmVzID0gW11cblxuICBsZXQgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgY29uc3QgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgbGV0IGNvZGVQb2ludCA9IG51bGxcbiAgICBsZXQgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKVxuICAgICAgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKVxuICAgICAgICAgID8gM1xuICAgICAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpXG4gICAgICAgICAgICAgID8gMlxuICAgICAgICAgICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIGxldCBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbmNvbnN0IE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICBjb25zdCBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIGxldCByZXMgPSAnJ1xuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgbGV0IHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGxldCByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICBsZXQgb3V0ID0gJydcbiAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gaGV4U2xpY2VMb29rdXBUYWJsZVtidWZbaV1dXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBjb25zdCBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICBsZXQgcmVzID0gJydcbiAgLy8gSWYgYnl0ZXMubGVuZ3RoIGlzIG9kZCwgdGhlIGxhc3QgOCBiaXRzIG11c3QgYmUgaWdub3JlZCAoc2FtZSBhcyBub2RlLmpzKVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgY29uc3QgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICBjb25zdCBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIE9iamVjdC5zZXRQcm90b3R5cGVPZihuZXdCdWYsIEJ1ZmZlci5wcm90b3R5cGUpXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludExFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0XVxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50QkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICBsZXQgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIGxldCBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDggPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDE2TEUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVpbnQzMkxFID1cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVWludDMyQkUgPVxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnVUludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ1VJbnQ2NExFIChvZmZzZXQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGNvbnN0IGZpcnN0ID0gdGhpc1tvZmZzZXRdXG4gIGNvbnN0IGxhc3QgPSB0aGlzW29mZnNldCArIDddXG4gIGlmIChmaXJzdCA9PT0gdW5kZWZpbmVkIHx8IGxhc3QgPT09IHVuZGVmaW5lZCkge1xuICAgIGJvdW5kc0Vycm9yKG9mZnNldCwgdGhpcy5sZW5ndGggLSA4KVxuICB9XG5cbiAgY29uc3QgbG8gPSBmaXJzdCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDI0XG5cbiAgY29uc3QgaGkgPSB0aGlzWysrb2Zmc2V0XSArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgbGFzdCAqIDIgKiogMjRcblxuICByZXR1cm4gQmlnSW50KGxvKSArIChCaWdJbnQoaGkpIDw8IEJpZ0ludCgzMikpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRCaWdVSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnVUludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCBoaSA9IGZpcnN0ICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgdGhpc1srK29mZnNldF1cblxuICBjb25zdCBsbyA9IHRoaXNbKytvZmZzZXRdICogMiAqKiAyNCArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDE2ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogOCArXG4gICAgbGFzdFxuXG4gIHJldHVybiAoQmlnSW50KGhpKSA8PCBCaWdJbnQoMzIpKSArIEJpZ0ludChsbylcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIGxldCB2YWwgPSB0aGlzW29mZnNldF1cbiAgbGV0IG11bCA9IDFcbiAgbGV0IGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICBsZXQgaSA9IGJ5dGVMZW5ndGhcbiAgbGV0IG11bCA9IDFcbiAgbGV0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICBjb25zdCB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkQmlnSW50NjRMRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiByZWFkQmlnSW50NjRMRSAob2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICB2YWxpZGF0ZU51bWJlcihvZmZzZXQsICdvZmZzZXQnKVxuICBjb25zdCBmaXJzdCA9IHRoaXNbb2Zmc2V0XVxuICBjb25zdCBsYXN0ID0gdGhpc1tvZmZzZXQgKyA3XVxuICBpZiAoZmlyc3QgPT09IHVuZGVmaW5lZCB8fCBsYXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICBib3VuZHNFcnJvcihvZmZzZXQsIHRoaXMubGVuZ3RoIC0gOClcbiAgfVxuXG4gIGNvbnN0IHZhbCA9IHRoaXNbb2Zmc2V0ICsgNF0gK1xuICAgIHRoaXNbb2Zmc2V0ICsgNV0gKiAyICoqIDggK1xuICAgIHRoaXNbb2Zmc2V0ICsgNl0gKiAyICoqIDE2ICtcbiAgICAobGFzdCA8PCAyNCkgLy8gT3ZlcmZsb3dcblxuICByZXR1cm4gKEJpZ0ludCh2YWwpIDw8IEJpZ0ludCgzMikpICtcbiAgICBCaWdJbnQoZmlyc3QgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAyNClcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEJpZ0ludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gcmVhZEJpZ0ludDY0QkUgKG9mZnNldCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgdmFsaWRhdGVOdW1iZXIob2Zmc2V0LCAnb2Zmc2V0JylcbiAgY29uc3QgZmlyc3QgPSB0aGlzW29mZnNldF1cbiAgY29uc3QgbGFzdCA9IHRoaXNbb2Zmc2V0ICsgN11cbiAgaWYgKGZpcnN0ID09PSB1bmRlZmluZWQgfHwgbGFzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCB0aGlzLmxlbmd0aCAtIDgpXG4gIH1cblxuICBjb25zdCB2YWwgPSAoZmlyc3QgPDwgMjQpICsgLy8gT3ZlcmZsb3dcbiAgICB0aGlzWysrb2Zmc2V0XSAqIDIgKiogMTYgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiA4ICtcbiAgICB0aGlzWysrb2Zmc2V0XVxuXG4gIHJldHVybiAoQmlnSW50KHZhbCkgPDwgQmlnSW50KDMyKSkgK1xuICAgIEJpZ0ludCh0aGlzWysrb2Zmc2V0XSAqIDIgKiogMjQgK1xuICAgIHRoaXNbKytvZmZzZXRdICogMiAqKiAxNiArXG4gICAgdGhpc1srK29mZnNldF0gKiAyICoqIDggK1xuICAgIGxhc3QpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnRMRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICBsZXQgbXVsID0gMVxuICBsZXQgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludEJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjb25zdCBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIGxldCBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgbGV0IG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50OCA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQxNkxFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVaW50MTZCRSA9XG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVWludDMyTEUgPVxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVpbnQzMkJFID1cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIHdydEJpZ1VJbnQ2NExFIChidWYsIHZhbHVlLCBvZmZzZXQsIG1pbiwgbWF4KSB7XG4gIGNoZWNrSW50QkkodmFsdWUsIG1pbiwgbWF4LCBidWYsIG9mZnNldCwgNylcblxuICBsZXQgbG8gPSBOdW1iZXIodmFsdWUgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0KytdID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBsb1xuICBsZXQgaGkgPSBOdW1iZXIodmFsdWUgPj4gQmlnSW50KDMyKSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0KytdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXQrK10gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCsrXSA9IGhpXG4gIHJldHVybiBvZmZzZXRcbn1cblxuZnVuY3Rpb24gd3J0QmlnVUludDY0QkUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbWluLCBtYXgpIHtcbiAgY2hlY2tJbnRCSSh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCA3KVxuXG4gIGxldCBsbyA9IE51bWJlcih2YWx1ZSAmIEJpZ0ludCgweGZmZmZmZmZmKSlcbiAgYnVmW29mZnNldCArIDddID0gbG9cbiAgbG8gPSBsbyA+PiA4XG4gIGJ1ZltvZmZzZXQgKyA2XSA9IGxvXG4gIGxvID0gbG8gPj4gOFxuICBidWZbb2Zmc2V0ICsgNV0gPSBsb1xuICBsbyA9IGxvID4+IDhcbiAgYnVmW29mZnNldCArIDRdID0gbG9cbiAgbGV0IGhpID0gTnVtYmVyKHZhbHVlID4+IEJpZ0ludCgzMikgJiBCaWdJbnQoMHhmZmZmZmZmZikpXG4gIGJ1ZltvZmZzZXQgKyAzXSA9IGhpXG4gIGhpID0gaGkgPj4gOFxuICBidWZbb2Zmc2V0ICsgMl0gPSBoaVxuICBoaSA9IGhpID4+IDhcbiAgYnVmW29mZnNldCArIDFdID0gaGlcbiAgaGkgPSBoaSA+PiA4XG4gIGJ1ZltvZmZzZXRdID0gaGlcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ1VJbnQ2NExFID0gZGVmaW5lQmlnSW50TWV0aG9kKGZ1bmN0aW9uIHdyaXRlQmlnVUludDY0TEUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRMRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBCaWdJbnQoMCksIEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnVUludDY0QkUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdVSW50NjRCRSAodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgcmV0dXJuIHdydEJpZ1VJbnQ2NEJFKHRoaXMsIHZhbHVlLCBvZmZzZXQsIEJpZ0ludCgwKSwgQmlnSW50KCcweGZmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSAwXG4gIGxldCBtdWwgPSAxXG4gIGxldCBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY29uc3QgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgbGV0IGkgPSBieXRlTGVuZ3RoIC0gMVxuICBsZXQgbXVsID0gMVxuICBsZXQgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUJpZ0ludDY0TEUgPSBkZWZpbmVCaWdJbnRNZXRob2QoZnVuY3Rpb24gd3JpdGVCaWdJbnQ2NExFICh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICByZXR1cm4gd3J0QmlnVUludDY0TEUodGhpcywgdmFsdWUsIG9mZnNldCwgLUJpZ0ludCgnMHg4MDAwMDAwMDAwMDAwMDAwJyksIEJpZ0ludCgnMHg3ZmZmZmZmZmZmZmZmZmZmJykpXG59KVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlQmlnSW50NjRCRSA9IGRlZmluZUJpZ0ludE1ldGhvZChmdW5jdGlvbiB3cml0ZUJpZ0ludDY0QkUgKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gIHJldHVybiB3cnRCaWdVSW50NjRCRSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAtQmlnSW50KCcweDgwMDAwMDAwMDAwMDAwMDAnKSwgQmlnSW50KCcweDdmZmZmZmZmZmZmZmZmZmYnKSlcbn0pXG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FyZ3VtZW50IHNob3VsZCBiZSBhIEJ1ZmZlcicpXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICBjb25zdCBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBVc2UgYnVpbHQtaW4gd2hlbiBhdmFpbGFibGUsIG1pc3NpbmcgZnJvbSBJRTExXG4gICAgdGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKChlbmNvZGluZyA9PT0gJ3V0ZjgnICYmIGNvZGUgPCAxMjgpIHx8XG4gICAgICAgICAgZW5jb2RpbmcgPT09ICdsYXRpbjEnKSB7XG4gICAgICAgIC8vIEZhc3QgcGF0aDogSWYgYHZhbGAgZml0cyBpbnRvIGEgc2luZ2xlIGJ5dGUsIHVzZSB0aGF0IG51bWVyaWMgdmFsdWUuXG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWwgPSBOdW1iZXIodmFsKVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIGxldCBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgICBjb25zdCBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgdmFsdWUgXCInICsgdmFsICtcbiAgICAgICAgJ1wiIGlzIGludmFsaWQgZm9yIGFyZ3VtZW50IFwidmFsdWVcIicpXG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIENVU1RPTSBFUlJPUlNcbi8vID09PT09PT09PT09PT1cblxuLy8gU2ltcGxpZmllZCB2ZXJzaW9ucyBmcm9tIE5vZGUsIGNoYW5nZWQgZm9yIEJ1ZmZlci1vbmx5IHVzYWdlXG5jb25zdCBlcnJvcnMgPSB7fVxuZnVuY3Rpb24gRSAoc3ltLCBnZXRNZXNzYWdlLCBCYXNlKSB7XG4gIGVycm9yc1tzeW1dID0gY2xhc3MgTm9kZUVycm9yIGV4dGVuZHMgQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgc3VwZXIoKVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ21lc3NhZ2UnLCB7XG4gICAgICAgIHZhbHVlOiBnZXRNZXNzYWdlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIC8vIEFkZCB0aGUgZXJyb3IgY29kZSB0byB0aGUgbmFtZSB0byBpbmNsdWRlIGl0IGluIHRoZSBzdGFjayB0cmFjZS5cbiAgICAgIHRoaXMubmFtZSA9IGAke3RoaXMubmFtZX0gWyR7c3ltfV1gXG4gICAgICAvLyBBY2Nlc3MgdGhlIHN0YWNrIHRvIGdlbmVyYXRlIHRoZSBlcnJvciBtZXNzYWdlIGluY2x1ZGluZyB0aGUgZXJyb3IgY29kZVxuICAgICAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgICAgIHRoaXMuc3RhY2sgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgICAgIC8vIFJlc2V0IHRoZSBuYW1lIHRvIHRoZSBhY3R1YWwgbmFtZS5cbiAgICAgIGRlbGV0ZSB0aGlzLm5hbWVcbiAgICB9XG5cbiAgICBnZXQgY29kZSAoKSB7XG4gICAgICByZXR1cm4gc3ltXG4gICAgfVxuXG4gICAgc2V0IGNvZGUgKHZhbHVlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvZGUnLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRvU3RyaW5nICgpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9IFske3N5bX1dOiAke3RoaXMubWVzc2FnZX1gXG4gICAgfVxuICB9XG59XG5cbkUoJ0VSUl9CVUZGRVJfT1VUX09GX0JPVU5EUycsXG4gIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIHJldHVybiBgJHtuYW1lfSBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHNgXG4gICAgfVxuXG4gICAgcmV0dXJuICdBdHRlbXB0IHRvIGFjY2VzcyBtZW1vcnkgb3V0c2lkZSBidWZmZXIgYm91bmRzJ1xuICB9LCBSYW5nZUVycm9yKVxuRSgnRVJSX0lOVkFMSURfQVJHX1RZUEUnLFxuICBmdW5jdGlvbiAobmFtZSwgYWN0dWFsKSB7XG4gICAgcmV0dXJuIGBUaGUgXCIke25hbWV9XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBhY3R1YWx9YFxuICB9LCBUeXBlRXJyb3IpXG5FKCdFUlJfT1VUX09GX1JBTkdFJyxcbiAgZnVuY3Rpb24gKHN0ciwgcmFuZ2UsIGlucHV0KSB7XG4gICAgbGV0IG1zZyA9IGBUaGUgdmFsdWUgb2YgXCIke3N0cn1cIiBpcyBvdXQgb2YgcmFuZ2UuYFxuICAgIGxldCByZWNlaXZlZCA9IGlucHV0XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIoaW5wdXQpICYmIE1hdGguYWJzKGlucHV0KSA+IDIgKiogMzIpIHtcbiAgICAgIHJlY2VpdmVkID0gYWRkTnVtZXJpY2FsU2VwYXJhdG9yKFN0cmluZyhpbnB1dCkpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdiaWdpbnQnKSB7XG4gICAgICByZWNlaXZlZCA9IFN0cmluZyhpbnB1dClcbiAgICAgIGlmIChpbnB1dCA+IEJpZ0ludCgyKSAqKiBCaWdJbnQoMzIpIHx8IGlucHV0IDwgLShCaWdJbnQoMikgKiogQmlnSW50KDMyKSkpIHtcbiAgICAgICAgcmVjZWl2ZWQgPSBhZGROdW1lcmljYWxTZXBhcmF0b3IocmVjZWl2ZWQpXG4gICAgICB9XG4gICAgICByZWNlaXZlZCArPSAnbidcbiAgICB9XG4gICAgbXNnICs9IGAgSXQgbXVzdCBiZSAke3JhbmdlfS4gUmVjZWl2ZWQgJHtyZWNlaXZlZH1gXG4gICAgcmV0dXJuIG1zZ1xuICB9LCBSYW5nZUVycm9yKVxuXG5mdW5jdGlvbiBhZGROdW1lcmljYWxTZXBhcmF0b3IgKHZhbCkge1xuICBsZXQgcmVzID0gJydcbiAgbGV0IGkgPSB2YWwubGVuZ3RoXG4gIGNvbnN0IHN0YXJ0ID0gdmFsWzBdID09PSAnLScgPyAxIDogMFxuICBmb3IgKDsgaSA+PSBzdGFydCArIDQ7IGkgLT0gMykge1xuICAgIHJlcyA9IGBfJHt2YWwuc2xpY2UoaSAtIDMsIGkpfSR7cmVzfWBcbiAgfVxuICByZXR1cm4gYCR7dmFsLnNsaWNlKDAsIGkpfSR7cmVzfWBcbn1cblxuLy8gQ0hFQ0sgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gY2hlY2tCb3VuZHMgKGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIHZhbGlkYXRlTnVtYmVyKG9mZnNldCwgJ29mZnNldCcpXG4gIGlmIChidWZbb2Zmc2V0XSA9PT0gdW5kZWZpbmVkIHx8IGJ1ZltvZmZzZXQgKyBieXRlTGVuZ3RoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYm91bmRzRXJyb3Iob2Zmc2V0LCBidWYubGVuZ3RoIC0gKGJ5dGVMZW5ndGggKyAxKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0ludEJJICh2YWx1ZSwgbWluLCBtYXgsIGJ1Ziwgb2Zmc2V0LCBieXRlTGVuZ3RoKSB7XG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikge1xuICAgIGNvbnN0IG4gPSB0eXBlb2YgbWluID09PSAnYmlnaW50JyA/ICduJyA6ICcnXG4gICAgbGV0IHJhbmdlXG4gICAgaWYgKGJ5dGVMZW5ndGggPiAzKSB7XG4gICAgICBpZiAobWluID09PSAwIHx8IG1pbiA9PT0gQmlnSW50KDApKSB7XG4gICAgICAgIHJhbmdlID0gYD49IDAke259IGFuZCA8IDIke259ICoqICR7KGJ5dGVMZW5ndGggKyAxKSAqIDh9JHtufWBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlID0gYD49IC0oMiR7bn0gKiogJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufSkgYW5kIDwgMiAqKiBgICtcbiAgICAgICAgICAgICAgICBgJHsoYnl0ZUxlbmd0aCArIDEpICogOCAtIDF9JHtufWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZ2UgPSBgPj0gJHttaW59JHtufSBhbmQgPD0gJHttYXh9JHtufWBcbiAgICB9XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfT1VUX09GX1JBTkdFKCd2YWx1ZScsIHJhbmdlLCB2YWx1ZSlcbiAgfVxuICBjaGVja0JvdW5kcyhidWYsIG9mZnNldCwgYnl0ZUxlbmd0aClcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVOdW1iZXIgKHZhbHVlLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IGVycm9ycy5FUlJfSU5WQUxJRF9BUkdfVFlQRShuYW1lLCAnbnVtYmVyJywgdmFsdWUpXG4gIH1cbn1cblxuZnVuY3Rpb24gYm91bmRzRXJyb3IgKHZhbHVlLCBsZW5ndGgsIHR5cGUpIHtcbiAgaWYgKE1hdGguZmxvb3IodmFsdWUpICE9PSB2YWx1ZSkge1xuICAgIHZhbGlkYXRlTnVtYmVyKHZhbHVlLCB0eXBlKVxuICAgIHRocm93IG5ldyBlcnJvcnMuRVJSX09VVF9PRl9SQU5HRSh0eXBlIHx8ICdvZmZzZXQnLCAnYW4gaW50ZWdlcicsIHZhbHVlKVxuICB9XG5cbiAgaWYgKGxlbmd0aCA8IDApIHtcbiAgICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9CVUZGRVJfT1VUX09GX0JPVU5EUygpXG4gIH1cblxuICB0aHJvdyBuZXcgZXJyb3JzLkVSUl9PVVRfT0ZfUkFOR0UodHlwZSB8fCAnb2Zmc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGA+PSAke3R5cGUgPyAxIDogMH0gYW5kIDw9ICR7bGVuZ3RofWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSlcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5jb25zdCBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHRha2VzIGVxdWFsIHNpZ25zIGFzIGVuZCBvZiB0aGUgQmFzZTY0IGVuY29kaW5nXG4gIHN0ciA9IHN0ci5zcGxpdCgnPScpWzBdXG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgbGV0IGNvZGVQb2ludFxuICBjb25zdCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIGxldCBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICBjb25zdCBieXRlcyA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIGNvbnN0IGJ5dGVBcnJheSA9IFtdXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgbGV0IGMsIGhpLCBsb1xuICBjb25zdCBieXRlQXJyYXkgPSBbXVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGxldCBpXG4gIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG4vLyBBcnJheUJ1ZmZlciBvciBVaW50OEFycmF5IG9iamVjdHMgZnJvbSBvdGhlciBjb250ZXh0cyAoaS5lLiBpZnJhbWVzKSBkbyBub3QgcGFzc1xuLy8gdGhlIGBpbnN0YW5jZW9mYCBjaGVjayBidXQgdGhleSBzaG91bGQgYmUgdHJlYXRlZCBhcyBvZiB0aGF0IHR5cGUuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNjZcbmZ1bmN0aW9uIGlzSW5zdGFuY2UgKG9iaiwgdHlwZSkge1xuICByZXR1cm4gb2JqIGluc3RhbmNlb2YgdHlwZSB8fFxuICAgIChvYmogIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IgIT0gbnVsbCAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPSBudWxsICYmXG4gICAgICBvYmouY29uc3RydWN0b3IubmFtZSA9PT0gdHlwZS5uYW1lKVxufVxuZnVuY3Rpb24gbnVtYmVySXNOYU4gKG9iaikge1xuICAvLyBGb3IgSUUxMSBzdXBwb3J0XG4gIHJldHVybiBvYmogIT09IG9iaiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuXG4vLyBDcmVhdGUgbG9va3VwIHRhYmxlIGZvciBgdG9TdHJpbmcoJ2hleCcpYFxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMjE5XG5jb25zdCBoZXhTbGljZUxvb2t1cFRhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgYWxwaGFiZXQgPSAnMDEyMzQ1Njc4OWFiY2RlZidcbiAgY29uc3QgdGFibGUgPSBuZXcgQXJyYXkoMjU2KVxuICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyArK2kpIHtcbiAgICBjb25zdCBpMTYgPSBpICogMTZcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDE2OyArK2opIHtcbiAgICAgIHRhYmxlW2kxNiArIGpdID0gYWxwaGFiZXRbaV0gKyBhbHBoYWJldFtqXVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFibGVcbn0pKClcblxuLy8gUmV0dXJuIG5vdCBmdW5jdGlvbiB3aXRoIEVycm9yIGlmIEJpZ0ludCBub3Qgc3VwcG9ydGVkXG5mdW5jdGlvbiBkZWZpbmVCaWdJbnRNZXRob2QgKGZuKSB7XG4gIHJldHVybiB0eXBlb2YgQmlnSW50ID09PSAndW5kZWZpbmVkJyA/IEJ1ZmZlckJpZ0ludE5vdERlZmluZWQgOiBmblxufVxuXG5mdW5jdGlvbiBCdWZmZXJCaWdJbnROb3REZWZpbmVkICgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdCaWdJbnQgbm90IHN1cHBvcnRlZCcpXG59XG4iLCAiaW1wb3J0IHsgZGVsZXRlREIgfSBmcm9tICdpZGInO1xuaW1wb3J0IHsgZG93bmxvYWRBbGxDb250ZW50cywgZ2V0SG9zdHMsIHNvcnRCeUluZGV4IH0gZnJvbSAnLi4vdXRpbGl0aWVzL2RiJztcbmltcG9ydCB7IGdldFByb2ZpbGVzLCBLSU5EUyB9IGZyb20gJy4uL3V0aWxpdGllcy91dGlscyc7XG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG5cbmNvbnN0IFRPTU9SUk9XID0gbmV3IERhdGUoKTtcblRPTU9SUk9XLnNldERhdGUoVE9NT1JST1cuZ2V0RGF0ZSgpICsgMSk7XG5cbmNvbnN0IHN0YXRlID0ge1xuICAgIGV2ZW50czogW10sXG4gICAgdmlldzogJ2NyZWF0ZWRfYXQnLFxuICAgIG1heDogMTAwLFxuICAgIHNvcnQ6ICdhc2MnLFxuICAgIGFsbEhvc3RzOiBbXSxcbiAgICBob3N0OiAnJyxcbiAgICBhbGxQcm9maWxlczogW10sXG4gICAgcHJvZmlsZTogJycsXG4gICAgcHVia2V5OiAnJyxcbiAgICBzZWxlY3RlZDogbnVsbCxcbiAgICBjb3BpZWQ6IGZhbHNlLFxuXG4gICAgLy8gZGF0ZSB2aWV3XG4gICAgZnJvbUNyZWF0ZWRBdDogJzIwMDgtMTAtMzEnLFxuICAgIHRvQ3JlYXRlZEF0OiBUT01PUlJPVy50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG5cbiAgICAvLyBraW5kIHZpZXdcbiAgICBxdWlja0tpbmQ6ICcnLFxuICAgIGZyb21LaW5kOiAwLFxuICAgIHRvS2luZDogNTAwMDAsXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gZ2V0RnJvbVRpbWUoKSB7XG4gICAgY29uc3QgZHQgPSBuZXcgRGF0ZShzdGF0ZS5mcm9tQ3JlYXRlZEF0KTtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihkdC5nZXRUaW1lKCkgLyAxMDAwKTtcbn1cblxuZnVuY3Rpb24gZ2V0VG9UaW1lKCkge1xuICAgIGNvbnN0IGR0ID0gbmV3IERhdGUoc3RhdGUudG9DcmVhdGVkQXQpO1xuICAgIHJldHVybiBNYXRoLmZsb29yKGR0LmdldFRpbWUoKSAvIDEwMDApO1xufVxuXG5mdW5jdGlvbiBnZXRLZXlSYW5nZSgpIHtcbiAgICBzd2l0Y2ggKHN0YXRlLnZpZXcpIHtcbiAgICAgICAgY2FzZSAnY3JlYXRlZF9hdCc6XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2UuYm91bmQoZ2V0RnJvbVRpbWUoKSwgZ2V0VG9UaW1lKCkpO1xuICAgICAgICBjYXNlICdraW5kJzpcbiAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5ib3VuZChzdGF0ZS5mcm9tS2luZCwgc3RhdGUudG9LaW5kKTtcbiAgICAgICAgY2FzZSAnaG9zdCc6XG4gICAgICAgICAgICBpZiAoc3RhdGUuaG9zdC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLm9ubHkoc3RhdGUuaG9zdCk7XG4gICAgICAgIGNhc2UgJ3B1YmtleSc6XG4gICAgICAgICAgICBpZiAoc3RhdGUucHVia2V5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gSURCS2V5UmFuZ2Uub25seShzdGF0ZS5wdWJrZXkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKGVwb2NoU2Vjb25kcykge1xuICAgIHJldHVybiBuZXcgRGF0ZShlcG9jaFNlY29uZHMgKiAxMDAwKS50b1VUQ1N0cmluZygpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRLaW5kKGtpbmQpIHtcbiAgICBjb25zdCBrID0gS0lORFMuZmluZCgoW2tOdW1dKSA9PiBrTnVtID09PSBraW5kKTtcbiAgICByZXR1cm4gayA/IGAke2tbMV19ICgke2tpbmR9KWAgOiBgVW5rbm93biAoJHtraW5kfSlgO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cikge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi50ZXh0Q29udGVudCA9IHN0cjtcbiAgICByZXR1cm4gZGl2LmlubmVySFRNTDtcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFZpZXcgc2VsZWN0XG4gICAgY29uc3Qgdmlld1NlbGVjdCA9ICQoJ3ZpZXcnKTtcbiAgICBjb25zdCBzb3J0U2VsZWN0ID0gJCgnc29ydCcpO1xuICAgIGNvbnN0IG1heElucHV0ID0gJCgnbWF4Jyk7XG5cbiAgICBpZiAodmlld1NlbGVjdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB2aWV3U2VsZWN0KSB2aWV3U2VsZWN0LnZhbHVlID0gc3RhdGUudmlldztcbiAgICBpZiAoc29ydFNlbGVjdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBzb3J0U2VsZWN0KSBzb3J0U2VsZWN0LnZhbHVlID0gc3RhdGUuc29ydDtcbiAgICBpZiAobWF4SW5wdXQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gbWF4SW5wdXQpIG1heElucHV0LnZhbHVlID0gc3RhdGUubWF4O1xuXG4gICAgLy8gU2hvdy9oaWRlIGZpbHRlciBzZWN0aW9uc1xuICAgIGNvbnN0IGRhdGVGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwiY3JlYXRlZF9hdFwiXScpO1xuICAgIGNvbnN0IGtpbmRGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwia2luZFwiXScpO1xuICAgIGNvbnN0IGhvc3RGaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmlsdGVyPVwiaG9zdFwiXScpO1xuICAgIGNvbnN0IHB1YmtleUZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maWx0ZXI9XCJwdWJrZXlcIl0nKTtcblxuICAgIGRhdGVGaWx0ZXJzLmZvckVhY2goZWwgPT4gZWwuc3R5bGUuZGlzcGxheSA9IHN0YXRlLnZpZXcgPT09ICdjcmVhdGVkX2F0JyA/ICcnIDogJ25vbmUnKTtcbiAgICBraW5kRmlsdGVycy5mb3JFYWNoKGVsID0+IGVsLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS52aWV3ID09PSAna2luZCcgPyAnJyA6ICdub25lJyk7XG4gICAgaG9zdEZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ2hvc3QnID8gJycgOiAnbm9uZScpO1xuICAgIHB1YmtleUZpbHRlcnMuZm9yRWFjaChlbCA9PiBlbC5zdHlsZS5kaXNwbGF5ID0gc3RhdGUudmlldyA9PT0gJ3B1YmtleScgPyAnJyA6ICdub25lJyk7XG5cbiAgICAvLyBEYXRlIGlucHV0c1xuICAgIGNvbnN0IGZyb21DcmVhdGVkQXQgPSAkKCdmcm9tQ3JlYXRlZEF0Jyk7XG4gICAgY29uc3QgdG9DcmVhdGVkQXQgPSAkKCd0b0NyZWF0ZWRBdCcpO1xuICAgIGlmIChmcm9tQ3JlYXRlZEF0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGZyb21DcmVhdGVkQXQpIGZyb21DcmVhdGVkQXQudmFsdWUgPSBzdGF0ZS5mcm9tQ3JlYXRlZEF0O1xuICAgIGlmICh0b0NyZWF0ZWRBdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0b0NyZWF0ZWRBdCkgdG9DcmVhdGVkQXQudmFsdWUgPSBzdGF0ZS50b0NyZWF0ZWRBdDtcblxuICAgIC8vIEtpbmQgaW5wdXRzXG4gICAgY29uc3QgZnJvbUtpbmQgPSAkKCdmcm9tS2luZCcpO1xuICAgIGNvbnN0IHRvS2luZCA9ICQoJ3RvS2luZCcpO1xuICAgIGlmIChmcm9tS2luZCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBmcm9tS2luZCkgZnJvbUtpbmQudmFsdWUgPSBzdGF0ZS5mcm9tS2luZDtcbiAgICBpZiAodG9LaW5kICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRvS2luZCkgdG9LaW5kLnZhbHVlID0gc3RhdGUudG9LaW5kO1xuXG4gICAgLy8gUXVpY2sga2luZCBzZWxlY3RcbiAgICBjb25zdCBraW5kU2hvcnRjdXQgPSAkKCdraW5kU2hvcnRjdXQnKTtcbiAgICBpZiAoa2luZFNob3J0Y3V0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGtpbmRTaG9ydGN1dCkga2luZFNob3J0Y3V0LnZhbHVlID0gc3RhdGUucXVpY2tLaW5kO1xuXG4gICAgLy8gSG9zdCBzZWxlY3RcbiAgICBjb25zdCBob3N0U2VsZWN0ID0gJCgnaG9zdCcpO1xuICAgIGlmIChob3N0U2VsZWN0KSB7XG4gICAgICAgIGhvc3RTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHN0YXRlLmFsbEhvc3RzLm1hcChoID0+IGA8b3B0aW9uIHZhbHVlPVwiJHtlc2NhcGVIdG1sKGgpfVwiICR7c3RhdGUuaG9zdCA9PT0gaCA/ICdzZWxlY3RlZCcgOiAnJ30+JHtlc2NhcGVIdG1sKGgpfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIC8vIFByb2ZpbGVzIHNlbGVjdFxuICAgIGNvbnN0IHByb2ZpbGVTZWxlY3QgPSAkKCdwcm9maWxlcycpO1xuICAgIGlmIChwcm9maWxlU2VsZWN0KSB7XG4gICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lcyA9IHN0YXRlLmFsbFByb2ZpbGVzLm1hcChwID0+IHAubmFtZSk7XG4gICAgICAgIHByb2ZpbGVTZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj48L29wdGlvbj4nICtcbiAgICAgICAgICAgIHByb2ZpbGVOYW1lcy5tYXAocCA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7ZXNjYXBlSHRtbChwKX1cIiAke3N0YXRlLnByb2ZpbGUgPT09IHAgPyAnc2VsZWN0ZWQnIDogJyd9PiR7ZXNjYXBlSHRtbChwKX08L29wdGlvbj5gKS5qb2luKCcnKTtcbiAgICB9XG5cbiAgICAvLyBQdWJrZXkgaW5wdXRcbiAgICBjb25zdCBwdWJrZXlJbnB1dCA9ICQoJ3B1YmtleScpO1xuICAgIGlmIChwdWJrZXlJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBwdWJrZXlJbnB1dCkgcHVia2V5SW5wdXQudmFsdWUgPSBzdGF0ZS5wdWJrZXk7XG5cbiAgICAvLyBFdmVudCBsaXN0XG4gICAgY29uc3QgZXZlbnRMaXN0ID0gJCgnZXZlbnQtbGlzdCcpO1xuICAgIGlmIChldmVudExpc3QpIHtcbiAgICAgICAgZXZlbnRMaXN0LmlubmVySFRNTCA9IHN0YXRlLmV2ZW50cy5tYXAoKGV2ZW50LCBpbmRleCkgPT4gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm10LTMgYm9yZGVyLXNvbGlkIGJvcmRlciBib3JkZXItbW9ub2thaS1iZy1saWdodGVyIHJvdW5kZWQtbGdcIj5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwic2VsZWN0LW5vbmUgZmxleCBjdXJzb3ItcG9pbnRlciB0ZXh0LXNtIG1kOnRleHQteGxcIlxuICAgICAgICAgICAgICAgICAgICBkYXRhLWFjdGlvbj1cInRvZ2dsZS1ldmVudFwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleC1ub25lIHctMTQgcC00IGZvbnQtZXh0cmFib2xkXCI+JHtzdGF0ZS5zZWxlY3RlZCA9PT0gaW5kZXggPyAnLScgOiAnKyd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LTEgdy02NCBwLTRcIj4ke2VzY2FwZUh0bWwoZm9ybWF0RGF0ZShldmVudC5tZXRhZGF0YS5zaWduZWRfYXQpKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChldmVudC5tZXRhZGF0YS5ob3N0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXgtMSB3LTY0IHAtNFwiPiR7ZXNjYXBlSHRtbChmb3JtYXRLaW5kKGV2ZW50LmV2ZW50LmtpbmQpKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGRhdGEtYWN0aW9uPVwiY29weS1ldmVudFwiIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiIGNsYXNzPVwiY3Vyc29yLXBvaW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHByZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJyb3VuZGVkLWItbGcgYmctbW9ub2thaS1iZy1saWdodGVyIHRleHQtc20gbWQ6dGV4dC1iYXNlIHAtNCBvdmVyZmxvdy14LWF1dG9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9XCJkaXNwbGF5OiR7c3RhdGUuc2VsZWN0ZWQgPT09IGluZGV4ID8gJ2Jsb2NrJyA6ICdub25lJ307XCJcbiAgICAgICAgICAgICAgICAgICAgPiR7ZXNjYXBlSHRtbChKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgMikpfTwvcHJlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIGApLmpvaW4oJycpO1xuXG4gICAgICAgIC8vIEJpbmQgZXZlbnQgdG9nZ2xlXG4gICAgICAgIGV2ZW50TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtZXZlbnRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGVsLmRhdGFzZXQuaW5kZXgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkID0gc3RhdGUuc2VsZWN0ZWQgPT09IGlkeCA/IG51bGwgOiBpZHg7XG4gICAgICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQmluZCBjb3B5IGV2ZW50XG4gICAgICAgIGV2ZW50TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJjb3B5LWV2ZW50XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBwYXJzZUludChlbC5kYXRhc2V0LmluZGV4KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBjb3B5RXZlbnQoaWR4KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb3BpZWQgdG9hc3RcbiAgICBjb25zdCBjb3BpZWRUb2FzdCA9ICQoJ2NvcGllZC10b2FzdCcpO1xuICAgIGlmIChjb3BpZWRUb2FzdCkgY29waWVkVG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLmNvcGllZCA/ICdibG9jaycgOiAnbm9uZSc7XG59XG5cbi8vIC0tLSBBY3Rpb25zIC0tLVxuXG5hc3luYyBmdW5jdGlvbiByZWxvYWQoKSB7XG4gICAgY29uc3QgZXZlbnRzID0gYXdhaXQgc29ydEJ5SW5kZXgoXG4gICAgICAgIHN0YXRlLnZpZXcsXG4gICAgICAgIGdldEtleVJhbmdlKCksXG4gICAgICAgIHN0YXRlLnNvcnQgPT09ICdhc2MnLFxuICAgICAgICBzdGF0ZS5tYXgsXG4gICAgKTtcbiAgICBzdGF0ZS5ldmVudHMgPSBldmVudHMubWFwKGUgPT4gKHsgLi4uZSwgY29waWVkOiBmYWxzZSB9KSk7XG5cbiAgICBnZXRIb3N0cygpLnRoZW4oaG9zdHMgPT4geyBzdGF0ZS5hbGxIb3N0cyA9IGhvc3RzOyByZW5kZXIoKTsgfSk7XG5cbiAgICBjb25zdCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgc3RhdGUuYWxsUHJvZmlsZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgcHJvZmlsZXMubWFwKGFzeW5jIChwcm9maWxlLCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcbiAgICAgICAgICAgIHB1YmtleTogYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdnZXROcHViJyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KSksXG4gICAgKTtcblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzYXZlQWxsKCkge1xuICAgIGNvbnN0IGZpbGUgPSBhd2FpdCBkb3dubG9hZEFsbENvbnRlbnRzKCk7XG4gICAgYXBpLnRhYnMuY3JlYXRlKHtcbiAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpLFxuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUFsbCgpIHtcbiAgICBpZiAoY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBBTEwgZXZlbnRzPycpKSB7XG4gICAgICAgIGF3YWl0IGRlbGV0ZURCKCdldmVudHMnKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBxdWlja0tpbmRTZWxlY3QoKSB7XG4gICAgaWYgKHN0YXRlLnF1aWNrS2luZCA9PT0gJycpIHJldHVybjtcbiAgICBjb25zdCBpID0gcGFyc2VJbnQoc3RhdGUucXVpY2tLaW5kKTtcbiAgICBzdGF0ZS5mcm9tS2luZCA9IGk7XG4gICAgc3RhdGUudG9LaW5kID0gaTtcbiAgICByZWxvYWQoKTtcbn1cblxuZnVuY3Rpb24gcGtGcm9tUHJvZmlsZSgpIHtcbiAgICBjb25zdCBmb3VuZCA9IHN0YXRlLmFsbFByb2ZpbGVzLmZpbmQoKHsgbmFtZSB9KSA9PiBuYW1lID09PSBzdGF0ZS5wcm9maWxlKTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgc3RhdGUucHVia2V5ID0gZm91bmQucHVia2V5O1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlFdmVudChpbmRleCkge1xuICAgIGNvbnN0IGV2ZW50ID0gSlNPTi5zdHJpbmdpZnkoc3RhdGUuZXZlbnRzW2luZGV4XSk7XG4gICAgc3RhdGUuY29waWVkID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3RhdGUuY29waWVkID0gZmFsc2U7IHJlbmRlcigpOyB9LCAxMDAwKTtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChldmVudCk7XG59XG5cbi8vIC0tLSBFdmVudCBiaW5kaW5nIC0tLVxuXG5sZXQgbWF4RGVib3VuY2VUaW1lciA9IG51bGw7XG5sZXQgcHVia2V5RGVib3VuY2VUaW1lciA9IG51bGw7XG5cbmZ1bmN0aW9uIGJpbmRFdmVudHMoKSB7XG4gICAgJCgndmlldycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS52aWV3ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgnc29ydCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5zb3J0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgnbWF4Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUubWF4ID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDEwMDtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG1heERlYm91bmNlVGltZXIpO1xuICAgICAgICBtYXhEZWJvdW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiByZWxvYWQoKSwgNzUwKTtcbiAgICB9KTtcblxuICAgICQoJ2Zyb21DcmVhdGVkQXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgc3RhdGUuZnJvbUNyZWF0ZWRBdCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZWxvYWQoKTtcbiAgICB9KTtcblxuICAgICQoJ3RvQ3JlYXRlZEF0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnRvQ3JlYXRlZEF0ID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgna2luZFNob3J0Y3V0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnF1aWNrS2luZCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICBxdWlja0tpbmRTZWxlY3QoKTtcbiAgICB9KTtcblxuICAgICQoJ2Zyb21LaW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmZyb21LaW5kID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDA7XG4gICAgICAgIHJlbG9hZCgpO1xuICAgIH0pO1xuXG4gICAgJCgndG9LaW5kJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnRvS2luZCA9IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSB8fCA1MDAwMDtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdob3N0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLmhvc3QgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVsb2FkKCk7XG4gICAgfSk7XG5cbiAgICAkKCdwcm9maWxlcycpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5wcm9maWxlID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIHBrRnJvbVByb2ZpbGUoKTtcbiAgICB9KTtcblxuICAgICQoJ3B1YmtleScpPy5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChlKSA9PiB7XG4gICAgICAgIHN0YXRlLnB1YmtleSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICBjbGVhclRpbWVvdXQocHVia2V5RGVib3VuY2VUaW1lcik7XG4gICAgICAgIHB1YmtleURlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHJlbG9hZCgpLCA1MDApO1xuICAgIH0pO1xuXG4gICAgJCgnc2F2ZS1hbGwtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUFsbCk7XG4gICAgJCgnZGVsZXRlLWFsbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWxldGVBbGwpO1xuICAgICQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHdpbmRvdy5jbG9zZSgpKTtcbn1cblxuLy8gLS0tIEluaXQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgLy8gUG9wdWxhdGUgdGhlIGtpbmQgc2hvcnRjdXQgc2VsZWN0XG4gICAgY29uc3Qga2luZFNob3J0Y3V0ID0gJCgna2luZFNob3J0Y3V0Jyk7XG4gICAgaWYgKGtpbmRTaG9ydGN1dCkge1xuICAgICAgICBraW5kU2hvcnRjdXQuaW5uZXJIVE1MID0gJzxvcHRpb24+PC9vcHRpb24+JyArXG4gICAgICAgICAgICBLSU5EUy5tYXAoKFtraW5kLCBkZXNjXSkgPT4gYDxvcHRpb24gdmFsdWU9XCIke2tpbmR9XCI+JHtlc2NhcGVIdG1sKGRlc2MpfTwvb3B0aW9uPmApLmpvaW4oJycpO1xuICAgIH1cblxuICAgIGJpbmRFdmVudHMoKTtcbiAgICBhd2FpdCByZWxvYWQoKTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkRhdGFiYXNlLFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJJbmRleCxcbiAgICAgICAgICAgIElEQkN1cnNvcixcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gW1xuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5hZHZhbmNlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZSxcbiAgICAgICAgICAgIElEQkN1cnNvci5wcm90b3R5cGUuY29udGludWVQcmltYXJ5S2V5LFxuICAgICAgICBdKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmIChuZXdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAoISh0YXJnZXQgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSAmJlxuICAgICAgICAhKHByb3AgaW4gdGFyZ2V0KSAmJlxuICAgICAgICB0eXBlb2YgcHJvcCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNhY2hlZE1ldGhvZHMuZ2V0KHByb3ApKVxuICAgICAgICByZXR1cm4gY2FjaGVkTWV0aG9kcy5nZXQocHJvcCk7XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgY2FjaGVkTWV0aG9kcy5zZXQocHJvcCwgbWV0aG9kKTtcbiAgICByZXR1cm4gbWV0aG9kO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQ6ICh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSA9PiBnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlciksXG4gICAgaGFzOiAodGFyZ2V0LCBwcm9wKSA9PiAhIWdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApLFxufSkpO1xuXG5jb25zdCBhZHZhbmNlTWV0aG9kUHJvcHMgPSBbJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleScsICdhZHZhbmNlJ107XG5jb25zdCBtZXRob2RNYXAgPSB7fTtcbmNvbnN0IGFkdmFuY2VSZXN1bHRzID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5ID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGN1cnNvckl0ZXJhdG9yVHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAoIWFkdmFuY2VNZXRob2RQcm9wcy5pbmNsdWRlcyhwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgIGxldCBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdO1xuICAgICAgICBpZiAoIWNhY2hlZEZ1bmMpIHtcbiAgICAgICAgICAgIGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGFkdmFuY2VSZXN1bHRzLnNldCh0aGlzLCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5nZXQodGhpcylbcHJvcF0oLi4uYXJncykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FjaGVkRnVuYztcbiAgICB9LFxufTtcbmFzeW5jIGZ1bmN0aW9uKiBpdGVyYXRlKC4uLmFyZ3MpIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tdGhpcy1hc3NpZ25tZW50XG4gICAgbGV0IGN1cnNvciA9IHRoaXM7XG4gICAgaWYgKCEoY3Vyc29yIGluc3RhbmNlb2YgSURCQ3Vyc29yKSkge1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3Iub3BlbkN1cnNvciguLi5hcmdzKTtcbiAgICB9XG4gICAgaWYgKCFjdXJzb3IpXG4gICAgICAgIHJldHVybjtcbiAgICBjdXJzb3IgPSBjdXJzb3I7XG4gICAgY29uc3QgcHJveGllZEN1cnNvciA9IG5ldyBQcm94eShjdXJzb3IsIGN1cnNvckl0ZXJhdG9yVHJhcHMpO1xuICAgIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LnNldChwcm94aWVkQ3Vyc29yLCBjdXJzb3IpO1xuICAgIC8vIE1hcCB0aGlzIGRvdWJsZS1wcm94eSBiYWNrIHRvIHRoZSBvcmlnaW5hbCwgc28gb3RoZXIgY3Vyc29yIG1ldGhvZHMgd29yay5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb3hpZWRDdXJzb3IsIHVud3JhcChjdXJzb3IpKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIHlpZWxkIHByb3hpZWRDdXJzb3I7XG4gICAgICAgIC8vIElmIG9uZSBvZiB0aGUgYWR2YW5jaW5nIG1ldGhvZHMgd2FzIG5vdCBjYWxsZWQsIGNhbGwgY29udGludWUoKS5cbiAgICAgICAgY3Vyc29yID0gYXdhaXQgKGFkdmFuY2VSZXN1bHRzLmdldChwcm94aWVkQ3Vyc29yKSB8fCBjdXJzb3IuY29udGludWUoKSk7XG4gICAgICAgIGFkdmFuY2VSZXN1bHRzLmRlbGV0ZShwcm94aWVkQ3Vyc29yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHtcbiAgICByZXR1cm4gKChwcm9wID09PSBTeW1ib2wuYXN5bmNJdGVyYXRvciAmJlxuICAgICAgICBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZSwgSURCQ3Vyc29yXSkpIHx8XG4gICAgICAgIChwcm9wID09PSAnaXRlcmF0ZScgJiYgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmVdKSkpO1xufVxucmVwbGFjZVRyYXBzKChvbGRUcmFwcykgPT4gKHtcbiAgICAuLi5vbGRUcmFwcyxcbiAgICBnZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikge1xuICAgICAgICBpZiAoaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSlcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRlO1xuICAgICAgICByZXR1cm4gb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKTtcbiAgICB9LFxufSkpO1xuXG5leHBvcnQgeyBkZWxldGVEQiwgb3BlbkRCLCB1bndyYXAsIHdyYXAgfTtcbiIsICJpbXBvcnQgeyBvcGVuREIgfSBmcm9tICdpZGInO1xuXG5hc3luYyBmdW5jdGlvbiBvcGVuRXZlbnRzRGIoKSB7XG4gICAgcmV0dXJuIGF3YWl0IG9wZW5EQignZXZlbnRzJywgMSwge1xuICAgICAgICB1cGdyYWRlKGRiKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudHMgPSBkYi5jcmVhdGVPYmplY3RTdG9yZSgnZXZlbnRzJywge1xuICAgICAgICAgICAgICAgIGtleVBhdGg6ICdldmVudC5pZCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgncHVia2V5JywgJ2V2ZW50LnB1YmtleScpO1xuICAgICAgICAgICAgZXZlbnRzLmNyZWF0ZUluZGV4KCdjcmVhdGVkX2F0JywgJ2V2ZW50LmNyZWF0ZWRfYXQnKTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgna2luZCcsICdldmVudC5raW5kJyk7XG4gICAgICAgICAgICBldmVudHMuY3JlYXRlSW5kZXgoJ2hvc3QnLCAnbWV0YWRhdGEuaG9zdCcpO1xuICAgICAgICB9LFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUV2ZW50KGV2ZW50KSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgcmV0dXJuIGRiLnB1dCgnZXZlbnRzJywgZXZlbnQpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc29ydEJ5SW5kZXgoaW5kZXgsIHF1ZXJ5LCBhc2MsIG1heCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBldmVudHMgPSBbXTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGJcbiAgICAgICAgLnRyYW5zYWN0aW9uKCdldmVudHMnKVxuICAgICAgICAuc3RvcmUuaW5kZXgoaW5kZXgpXG4gICAgICAgIC5vcGVuQ3Vyc29yKHF1ZXJ5LCBhc2MgPyAnbmV4dCcgOiAncHJldicpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgaWYgKGV2ZW50cy5sZW5ndGggPj0gbWF4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvc3RzKCkge1xuICAgIGxldCBkYiA9IGF3YWl0IG9wZW5FdmVudHNEYigpO1xuICAgIGxldCBob3N0cyA9IG5ldyBTZXQoKTtcbiAgICBsZXQgY3Vyc29yID0gYXdhaXQgZGIudHJhbnNhY3Rpb24oJ2V2ZW50cycpLnN0b3JlLm9wZW5DdXJzb3IoKTtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICAgIGhvc3RzLmFkZChjdXJzb3IudmFsdWUubWV0YWRhdGEuaG9zdCk7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5jb250aW51ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gWy4uLmhvc3RzXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQWxsQ29udGVudHMoKSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuICAgIGxldCBjdXJzb3IgPSBhd2FpdCBkYi50cmFuc2FjdGlvbignZXZlbnRzJykuc3RvcmUub3BlbkN1cnNvcigpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgZXZlbnRzLnB1c2goY3Vyc29yLnZhbHVlLmV2ZW50KTtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICAgIGV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiBKU09OLnN0cmluZ2lmeShlKSk7XG4gICAgZXZlbnRzID0gZXZlbnRzLmpvaW4oJ1xcbicpO1xuICAgIGNvbnNvbGUubG9nKGV2ZW50cyk7XG5cbiAgICBjb25zdCBmaWxlID0gbmV3IEZpbGUoW2V2ZW50c10sICdldmVudHMuanNvbmwnLCB7XG4gICAgICAgIHR5cGU6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtldmVudHNdLCB7IHR5cGU6ICdwbGFpbi90ZXh0JyB9KTtcblxuICAgIHJldHVybiBibG9iO1xufVxuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4vYnJvd3Nlci1wb2x5ZmlsbCc7XG5pbXBvcnQgeyBlbmNyeXB0LCBkZWNyeXB0LCBoYXNoUGFzc3dvcmQsIHZlcmlmeVBhc3N3b3JkIH0gZnJvbSAnLi9jcnlwdG8nO1xuaW1wb3J0IHsgbG9va3NMaWtlU2VlZFBocmFzZSwgaXNWYWxpZFNlZWRQaHJhc2UgfSBmcm9tICcuL3NlZWRwaHJhc2UnO1xuXG5jb25zdCBEQl9WRVJTSU9OID0gNjtcbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9SRUxBWVMgPSBbXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZGFtdXMuaW8nKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9yZWxheS5wcmltYWwubmV0JyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuc25vcnQuc29jaWFsJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkuZ2V0YWxieS5jb20vdjEnKSxcbiAgICBuZXcgVVJMKCd3c3M6Ly9ub3MubG9sJyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gNSkge1xuICAgICAgICBjb25zb2xlLmxvZygnTWlncmF0aW5nIHRvIHZlcnNpb24gNiAocGxhdGZvcm0gc3luYyBzdXBwb3J0KS4nKTtcbiAgICAgICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS51cGRhdGVkQXQgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS51cGRhdGVkQXQgPSBub3c7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwbGF0Zm9ybVN5bmNFbmFibGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdmVyc2lvbiArIDE7XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZXMoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlczogW10gfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLnByb2ZpbGVzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzW2luZGV4XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2ZpbGVOYW1lcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHJldHVybiBwcm9maWxlcy5tYXAocCA9PiBwLm5hbWUpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZUluZGV4KCkge1xuICAgIGNvbnN0IGluZGV4ID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBwcm9maWxlSW5kZXg6IDAgfSk7XG4gICAgcmV0dXJuIGluZGV4LnByb2ZpbGVJbmRleDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVJbmRleChwcm9maWxlSW5kZXgpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVJbmRleCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVByb2ZpbGUoaW5kZXgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlSW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBwcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIGlmIChwcm9maWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBhd2FpdCBjbGVhckRhdGEoKTsgLy8gSWYgd2UgaGF2ZSBkZWxldGVkIGFsbCBvZiB0aGUgcHJvZmlsZXMsIGxldCdzIGp1c3Qgc3RhcnQgZnJlc2ggd2l0aCBhbGwgbmV3IGRhdGFcbiAgICAgICAgYXdhaXQgaW5pdGlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRleCBkZWxldGVkIHdhcyB0aGUgYWN0aXZlIHByb2ZpbGUsIGNoYW5nZSB0aGUgYWN0aXZlIHByb2ZpbGUgdG8gdGhlIG5leHQgb25lXG4gICAgICAgIGxldCBuZXdJbmRleCA9XG4gICAgICAgICAgICBwcm9maWxlSW5kZXggPT09IGluZGV4ID8gTWF0aC5tYXgoaW5kZXggLSAxLCAwKSA6IHByb2ZpbGVJbmRleDtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcywgcHJvZmlsZUluZGV4OiBuZXdJbmRleCB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhckRhdGEoKSB7XG4gICAgbGV0IGlnbm9yZUluc3RhbGxIb29rID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpZ25vcmVJbnN0YWxsSG9vazogZmFsc2UgfSk7XG4gICAgYXdhaXQgc3RvcmFnZS5jbGVhcigpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KGlnbm9yZUluc3RhbGxIb29rKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcml2YXRlS2V5KCkge1xuICAgIHJldHVybiBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdnZW5lcmF0ZVByaXZhdGVLZXknIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcm9maWxlKG5hbWUgPSAnRGVmYXVsdCBOb3N0ciBQcm9maWxlJywgdHlwZSA9ICdsb2NhbCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBwcml2S2V5OiB0eXBlID09PSAnbG9jYWwnID8gYXdhaXQgZ2VuZXJhdGVQcml2YXRlS2V5KCkgOiAnJyxcbiAgICAgICAgaG9zdHM6IHt9LFxuICAgICAgICByZWxheXM6IFJFQ09NTUVOREVEX1JFTEFZUy5tYXAociA9PiAoeyB1cmw6IHIuaHJlZiwgcmVhZDogdHJ1ZSwgd3JpdGU6IHRydWUgfSkpLFxuICAgICAgICByZWxheVJlbWluZGVyOiBmYWxzZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgYnVua2VyVXJsOiBudWxsLFxuICAgICAgICByZW1vdGVQdWJrZXk6IG51bGwsXG4gICAgICAgIHVwZGF0ZWRBdDogTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JTZXREZWZhdWx0KGtleSwgZGVmKSB7XG4gICAgbGV0IHZhbCA9IChhd2FpdCBzdG9yYWdlLmdldChrZXkpKVtrZXldO1xuICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgW2tleV06IGRlZiB9KTtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGVOYW1lKGluZGV4LCBwcm9maWxlTmFtZSkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcHJvZmlsZXNbaW5kZXhdLm5hbWUgPSBwcm9maWxlTmFtZTtcbiAgICBwcm9maWxlc1tpbmRleF0udXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVQcml2YXRlS2V5KGluZGV4LCBwcml2YXRlS2V5KSB7XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBraW5kOiAnc2F2ZVByaXZhdGVLZXknLFxuICAgICAgICBwYXlsb2FkOiBbaW5kZXgsIHByaXZhdGVLZXldLFxuICAgIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3UHJvZmlsZSgpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVByb2ZpbGUoJ05ldyBQcm9maWxlJyk7XG4gICAgcHJvZmlsZXMucHVzaChuZXdQcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3QnVua2VyUHJvZmlsZShuYW1lID0gJ05ldyBCdW5rZXInLCBidW5rZXJVcmwgPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKG5hbWUsICdidW5rZXInKTtcbiAgICBwcm9maWxlLmJ1bmtlclVybCA9IGJ1bmtlclVybDtcbiAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLmxlbmd0aCAtIDE7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZWxheXMocHJvZmlsZUluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKHByb2ZpbGVJbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUucmVsYXlzIHx8IFtdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVJlbGF5cyhwcm9maWxlSW5kZXgsIHJlbGF5cykge1xuICAgIC8vIEhhdmluZyBhbiBBbHBpbmUgcHJveHkgb2JqZWN0IGFzIGEgc3ViLW9iamVjdCBkb2VzIG5vdCBzZXJpYWxpemUgY29ycmVjdGx5IGluIHN0b3JhZ2UsXG4gICAgLy8gc28gd2UgYXJlIHByZS1zZXJpYWxpemluZyBoZXJlIGJlZm9yZSBhc3NpZ25pbmcgaXQgdG8gdGhlIHByb2ZpbGUsIHNvIHRoZSBwcm94eVxuICAgIC8vIG9iaiBkb2Vzbid0IGJ1ZyBvdXQuXG4gICAgbGV0IGZpeGVkUmVsYXlzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZWxheXMpKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbcHJvZmlsZUluZGV4XTtcbiAgICBwcm9maWxlLnJlbGF5cyA9IGZpeGVkUmVsYXlzO1xuICAgIHByb2ZpbGUudXBkYXRlZEF0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldChpdGVtKSB7XG4gICAgcmV0dXJuIChhd2FpdCBzdG9yYWdlLmdldChpdGVtKSlbaXRlbV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9ucyhpbmRleCA9IG51bGwpIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgICBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIH1cbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGxldCBob3N0cyA9IGF3YWl0IHByb2ZpbGUuaG9zdHM7XG4gICAgcmV0dXJuIGhvc3RzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGVybWlzc2lvbihob3N0LCBhY3Rpb24pIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZSA9IGF3YWl0IGdldFByb2ZpbGUoaW5kZXgpO1xuICAgIGNvbnN0IGhvc3RzID0gcHJvZmlsZT8uaG9zdHMgfHwge307XG4gICAgLy8gTkstMDM6IGdyYW50cyBhcmUgbm93IGtleWVkIG9uIHRoZSBmdWxsIG9yaWdpbiAoc2NoZW1lK2hvc3RbOnBvcnRdKS5cbiAgICBpZiAoaG9zdHNbaG9zdF0/LlthY3Rpb25dKSByZXR1cm4gaG9zdHNbaG9zdF1bYWN0aW9uXTtcbiAgICAvLyBUcmFuc2l0aW9uOiBhY2NlcHQgbGVnYWN5IGdyYW50cyB0aGF0IHdlcmUga2V5ZWQgb24gdGhlIGJhcmUgaG9zdG5hbWUuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gbmV3IFVSTChob3N0KS5ob3N0O1xuICAgICAgICBpZiAobGVnYWN5ICYmIGhvc3RzW2xlZ2FjeV0/LlthY3Rpb25dKSByZXR1cm4gaG9zdHNbbGVnYWN5XVthY3Rpb25dO1xuICAgIH0gY2F0Y2ggeyAvKiBob3N0IHdhcyBub3QgYSBmdWxsIG9yaWdpbjsgbm90aGluZyB0byBtaWdyYXRlICovIH1cbiAgICByZXR1cm4gJ2Fzayc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbiwgcGVybSwgaW5kZXggPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbaW5kZXhdO1xuICAgIGxldCBuZXdQZXJtcyA9IHByb2ZpbGUuaG9zdHNbaG9zdF0gfHwge307XG4gICAgbmV3UGVybXMgPSB7IC4uLm5ld1Blcm1zLCBbYWN0aW9uXTogcGVybSB9O1xuICAgIHByb2ZpbGUuaG9zdHNbaG9zdF0gPSBuZXdQZXJtcztcbiAgICBwcm9maWxlLnVwZGF0ZWRBdCA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgIHByb2ZpbGVzW2luZGV4XSA9IHByb2ZpbGU7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuUGVybWlzc2lvbihwKSB7XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZSB3aGVyZSBldmVudCBzaWduaW5nIGluY2x1ZGVzIGEga2luZCBudW1iZXJcbiAgICBpZiAocC5zdGFydHNXaXRoKCdzaWduRXZlbnQ6JykpIHtcbiAgICAgICAgbGV0IFtlLCBuXSA9IHAuc3BsaXQoJzonKTtcbiAgICAgICAgbiA9IHBhcnNlSW50KG4pO1xuICAgICAgICBsZXQgbm5hbWUgPSBLSU5EUy5maW5kKGsgPT4ga1swXSA9PT0gbik/LlsxXSB8fCBgVW5rbm93biAoS2luZCAke259KWA7XG4gICAgICAgIHJldHVybiBgU2lnbiBldmVudDogJHtubmFtZX1gO1xuICAgIH1cblxuICAgIHN3aXRjaCAocCkge1xuICAgICAgICBjYXNlICdnZXRQdWJLZXknOlxuICAgICAgICAgICAgcmV0dXJuICdSZWFkIHB1YmxpYyBrZXknO1xuICAgICAgICBjYXNlICdzaWduRXZlbnQnOlxuICAgICAgICAgICAgcmV0dXJuICdTaWduIGV2ZW50JztcbiAgICAgICAgY2FzZSAnZ2V0UmVsYXlzJzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCByZWxheSBsaXN0JztcbiAgICAgICAgY2FzZSAnbmlwMDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwMDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtMDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZW5jcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0VuY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgY2FzZSAnbmlwNDQuZGVjcnlwdCc6XG4gICAgICAgICAgICByZXR1cm4gJ0RlY3J5cHQgcHJpdmF0ZSBtZXNzYWdlIChOSVAtNDQpJztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnVW5rbm93bic7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVLZXkoa2V5KSB7XG4gICAgY29uc3QgaGV4TWF0Y2ggPSAvXltcXGRhLWZdezY0fSQvaS50ZXN0KGtleSk7XG4gICAgY29uc3QgYjMyTWF0Y2ggPSAvXm5zZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXXs1OH0kLy50ZXN0KGtleSk7XG5cbiAgICByZXR1cm4gaGV4TWF0Y2ggfHwgYjMyTWF0Y2ggfHwgaXNOY3J5cHRzZWMoa2V5KSB8fCBpc1ZhbGlkU2VlZFBocmFzZShrZXkpO1xufVxuXG5leHBvcnQgeyBsb29rc0xpa2VTZWVkUGhyYXNlIH07XG5leHBvcnQgY29uc3QgaXNTZWVkUGhyYXNlID0gaXNWYWxpZFNlZWRQaHJhc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05jcnlwdHNlYyhrZXkpIHtcbiAgICByZXR1cm4gL15uY3J5cHRzZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXSskLy50ZXN0KGtleSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZWF0dXJlKG5hbWUpIHtcbiAgICBsZXQgZm5hbWUgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICBsZXQgZiA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtmbmFtZV06IGZhbHNlIH0pO1xuICAgIHJldHVybiBmW2ZuYW1lXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheVJlbWluZGVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlUmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHByb2ZpbGVzW2luZGV4XS5yZWxheVJlbWluZGVyID0gZmFsc2U7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5wdWIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICB9KTtcbn1cblxuLy8gLS0tIE1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgbWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaXMgYWN0aXZlLlxuICpcbiAqIERlZmVuc2l2ZTogY2hlY2tzIG11bHRpcGxlIGluZGljYXRvcnMsIG5vdCBqdXN0IHRoZSBib29sZWFuIGZsYWcuXG4gKiBJZiBwYXNzd29yZEhhc2ggb3IgZW5jcnlwdGVkIGtleSBibG9icyBleGlzdCBidXQgdGhlIGlzRW5jcnlwdGVkIGZsYWdcbiAqIGlzIGZhbHNlIChpbmNvbnNpc3RlbnQgc3RhdGUgZnJvbSBzZXJ2aWNlIHdvcmtlciBjcmFzaCwgcmFjZSBjb25kaXRpb24sXG4gKiBldGMuKSwgc2VsZi1oZWFscyBieSBzZXR0aW5nIHRoZSBmbGFnIGJhY2sgdG8gdHJ1ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzRW5jcnlwdGVkKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKGRhdGEuaXNFbmNyeXB0ZWQpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gRmFsbGJhY2sgMTogcGFzc3dvcmRIYXNoIGV4aXN0cyBidXQgZmxhZyBpcyBzdGFsZVxuICAgIGlmIChkYXRhLnBhc3N3b3JkSGFzaCkge1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjayAyOiBlbmNyeXB0ZWQgYmxvYnMgZXhpc3QgaW4gcHJvZmlsZXMgYnV0IGZsYWcgKyBoYXNoIGFyZSBtaXNzaW5nXG4gICAgZm9yIChjb25zdCBwcm9maWxlIG9mIGRhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IGlzRW5jcnlwdGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogU3RvcmUgdGhlIHBhc3N3b3JkIHZlcmlmaWNhdGlvbiBoYXNoIChuZXZlciB0aGUgcGFzc3dvcmQgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFBhc3N3b3JkSGFzaChwYXNzd29yZCkge1xuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZnkgYSBwYXNzd29yZCBhZ2FpbnN0IHRoZSBzdG9yZWQgaGFzaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUGFzc3dvcmQocGFzc3dvcmQpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoe1xuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbiAgICBpZiAoIWRhdGEucGFzc3dvcmRIYXNoIHx8ICFkYXRhLnBhc3N3b3JkU2FsdCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2ZXJpZnlQYXNzd29yZChwYXNzd29yZCwgZGF0YS5wYXNzd29yZEhhc2gsIGRhdGEucGFzc3dvcmRTYWx0KTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgbWFzdGVyIHBhc3N3b3JkIHByb3RlY3Rpb24gXHUyMDE0IGNsZWFycyBoYXNoIGFuZCBkZWNyeXB0cyBhbGwga2V5cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVBhc3N3b3JkUHJvdGVjdGlvbihwYXNzd29yZCkge1xuICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgY2hlY2tQYXNzd29yZChwYXNzd29yZCk7XG4gICAgaWYgKCF2YWxpZCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhc3N3b3JkJyk7XG5cbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlc1tpXS5wcml2S2V5KSkge1xuICAgICAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGRlY3J5cHQocHJvZmlsZXNbaV0ucHJpdktleSwgcGFzc3dvcmQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIGlzRW5jcnlwdGVkOiBmYWxzZSxcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBudWxsLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IG51bGwsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRW5jcnlwdCBhbGwgcHJvZmlsZSBwcml2YXRlIGtleXMgd2l0aCBhIG1hc3RlciBwYXNzd29yZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRBbGxLZXlzKHBhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG4vKipcbiAqIFJlLWVuY3J5cHQgYWxsIGtleXMgd2l0aCBhIG5ldyBwYXNzd29yZCAocmVxdWlyZXMgdGhlIG9sZCBwYXNzd29yZCkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGFuZ2VQYXNzd29yZEZvcktleXMob2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2ZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcm9maWxlc1tpXS50eXBlID09PSAnYnVua2VyJykgY29udGludWU7XG4gICAgICAgIGxldCBoZXggPSBwcm9maWxlc1tpXS5wcml2S2V5O1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKGhleCkpIHtcbiAgICAgICAgICAgIGhleCA9IGF3YWl0IGRlY3J5cHQoaGV4LCBvbGRQYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvZmlsZXNbaV0ucHJpdktleSA9IGF3YWl0IGVuY3J5cHQoaGV4LCBuZXdQYXNzd29yZCk7XG4gICAgfVxuICAgIGNvbnN0IHsgaGFzaCwgc2FsdCB9ID0gYXdhaXQgaGFzaFBhc3N3b3JkKG5ld1Bhc3N3b3JkKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7XG4gICAgICAgIHByb2ZpbGVzLFxuICAgICAgICBwYXNzd29yZEhhc2g6IGhhc2gsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogc2FsdCxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IHRydWUsXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIHNpbmdsZSBwcm9maWxlJ3MgcHJpdmF0ZSBrZXksIHJldHVybmluZyB0aGUgaGV4IHN0cmluZy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERlY3J5cHRlZFByaXZLZXkocHJvZmlsZSwgcGFzc3dvcmQpIHtcbiAgICBpZiAocHJvZmlsZS50eXBlID09PSAnYnVua2VyJykgcmV0dXJuICcnO1xuICAgIGlmIChpc0VuY3J5cHRlZEJsb2IocHJvZmlsZS5wcml2S2V5KSkge1xuICAgICAgICByZXR1cm4gZGVjcnlwdChwcm9maWxlLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2ZpbGUucHJpdktleTtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RvcmVkIHZhbHVlIGxvb2tzIGxpa2UgYW4gZW5jcnlwdGVkIGJsb2IuXG4gKiBFbmNyeXB0ZWQgYmxvYnMgYXJlIEpTT04gc3RyaW5ncyBjb250YWluaW5nIHtzYWx0LCBpdiwgY2lwaGVydGV4dH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VuY3J5cHRlZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocGFyc2VkLnNhbHQgJiYgcGFyc2VkLml2ICYmIHBhcnNlZC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uub25DaGFuZ2VkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DaGFuZ2VkOiBfYnJvd3Nlci5zdG9yYWdlPy5vbkNoYW5nZWQgfHwgbnVsbCxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gYWxhcm1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGNocm9tZS5hbGFybXMgc3Vydml2ZXMgTVYzIHNlcnZpY2Utd29ya2VyIGV2aWN0aW9uOyBzZXRUaW1lb3V0IGRvZXMgbm90LlxuYXBpLmFsYXJtcyA9IF9icm93c2VyLmFsYXJtcyA/IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICAvLyBhbGFybXMuY3JlYXRlIGlzIHN5bmNocm9ub3VzIG9uIENocm9tZSwgcmV0dXJucyBQcm9taXNlIG9uIEZpcmVmb3gvU2FmYXJpXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IF9icm93c2VyLmFsYXJtcy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nID8gcmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSxcbiAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5hbGFybXMuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5hbGFybXMsIF9icm93c2VyLmFsYXJtcy5jbGVhcikoLi4uYXJncyk7XG4gICAgfSxcbiAgICBvbkFsYXJtOiBfYnJvd3Nlci5hbGFybXMub25BbGFybSxcbn0gOiBudWxsO1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59IEFFUy0yNTYtR0NNIGtleVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KSB7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3Qga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICAgICAgJ3JhdycsXG4gICAgICAgIGVuYy5lbmNvZGUocGFzc3dvcmQpLFxuICAgICAgICAnUEJLREYyJyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZGVyaXZlS2V5J11cbiAgICApO1xuXG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnUEJLREYyJyxcbiAgICAgICAgICAgIHNhbHQ6IHNhbHQgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gc2FsdCA6IG5ldyBVaW50OEFycmF5KHNhbHQpLFxuICAgICAgICAgICAgaXRlcmF0aW9uczogUEJLREYyX0lURVJBVElPTlMsXG4gICAgICAgICAgICBoYXNoOiAnU0hBLTI1NicsXG4gICAgICAgIH0sXG4gICAgICAgIGtleU1hdGVyaWFsLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J11cbiAgICApO1xufVxuXG4vLyAtLS0gRW5jcnlwdCB3aXRoIHByZS1kZXJpdmVkIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgYW5kIGl0cyBzYWx0LlxuICpcbiAqIFRoaXMgYXZvaWRzIGhvbGRpbmcgdGhlIHJhdyBwYXNzd29yZCBpbiBtZW1vcnkgXHUyMDE0IHRoZSBjYWxsZXIgZGVyaXZlcyB0aGVcbiAqIGtleSBvbmNlICh2aWEgZGVyaXZlS2V5KSBhbmQgcmV1c2VzIGl0IGZvciB0aGUgc2Vzc2lvbi4gIFRoZSBvdXRwdXRcbiAqIGZvcm1hdCBpcyBpZGVudGljYWwgdG8gZW5jcnlwdCgpLCBzbyBkZWNyeXB0KCkgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aFxuICogdGhlIG9yaWdpbmFsIHBhc3N3b3JkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbGFpbnRleHQgICAgICAgICAgLSBUaGUgZGF0YSB0byBlbmNyeXB0XG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAgICAgIC0gQUVTLTI1Ni1HQ00ga2V5IGZyb20gZGVyaXZlS2V5KClcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gc2FsdCAgICAgICAgICAgLSBUaGUgc2FsdCB0aGF0IHdhcyB1c2VkIHRvIGRlcml2ZSBga2V5YFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwga2V5LCBzYWx0KSB7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLy8gLS0tIEVuY3J5cHQgLyBEZWNyeXB0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBwbGFpbnRleHQgc3RyaW5nIHdpdGggYSBwYXNzd29yZC5cbiAqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gc2FsdCAoMTYgYnl0ZXMpIGFuZCBJViAoMTIgYnl0ZXMpLCBkZXJpdmVzIGFuXG4gKiBBRVMtMjU2LUdDTSBrZXkgdmlhIFBCS0RGMiwgYW5kIHJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nXG4gKiBiYXNlNjQtZW5jb2RlZCBzYWx0LCBpdiwgYW5kIGNpcGhlcnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAtIFRoZSBkYXRhIHRvIGVuY3J5cHQgKGUuZy4gaGV4IHByaXZhdGUga2V5KVxuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkICAtIFRoZSBtYXN0ZXIgcGFzc3dvcmRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IEpTT04gc3RyaW5nOiB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gKGFsbCBiYXNlNjQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbmNyeXB0KHBsYWludGV4dCwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCBzYWx0ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShTQUxUX0JZVEVTKSk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHBhc3N3b3JkLCBzYWx0KTtcblxuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGNpcGhlcnRleHQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGVuYy5lbmNvZGUocGxhaW50ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgICAgICBpdjogYXJyYXlCdWZmZXJUb0Jhc2U2NChpdiksXG4gICAgICAgIGNpcGhlcnRleHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoY2lwaGVydGV4dCksXG4gICAgfSk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGhhc2ggPT09IHN0b3JlZEhhc2g7XG59XG4iLCAiLyoqXG4gKiBCSVAzOSBTZWVkIFBocmFzZSB1dGlsaXRpZXMgZm9yIE5vc3RyS2V5LlxuICpcbiAqIEltcGxlbWVudHMgdGhlIHNhbWUgYWxnb3JpdGhtIGFzIGBub3N0ci1uc2VjLXNlZWRwaHJhc2VgOlxuICogdGhlIDMyLWJ5dGUgcHJpdmF0ZSBrZXkgSVMgdGhlIEJJUDM5IGVudHJvcHkgKGJpZGlyZWN0aW9uYWwgZW5jb2RpbmcpLlxuICpcbiAqIFVzZXMgQHNjdXJlL2JpcDM5IChhbHJlYWR5IGEgdHJhbnNpdGl2ZSBkZXAgb2Ygbm9zdHItdG9vbHMpLlxuICovXG5cbmltcG9ydCB7IGVudHJvcHlUb01uZW1vbmljLCBtbmVtb25pY1RvRW50cm9weSwgdmFsaWRhdGVNbmVtb25pYyB9IGZyb20gJ0BzY3VyZS9iaXAzOSc7XG5pbXBvcnQgeyB3b3JkbGlzdCB9IGZyb20gJ0BzY3VyZS9iaXAzOS93b3JkbGlzdHMvZW5nbGlzaC5qcyc7XG5pbXBvcnQgeyBoZXhUb0J5dGVzLCBieXRlc1RvSGV4LCBnZXRQdWJsaWNLZXlTeW5jIH0gZnJvbSAnbm9zdHItY3J5cHRvLXV0aWxzJztcblxuLyoqXG4gKiBDb252ZXJ0IGEgaGV4IHByaXZhdGUga2V5IHRvIGEgMjQtd29yZCBCSVAzOSBtbmVtb25pYy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBoZXhLZXkgLSA2NC1jaGFyIGhleCBwcml2YXRlIGtleVxuICogQHJldHVybnMge3N0cmluZ30gMjQtd29yZCBtbmVtb25pY1xuICovXG5leHBvcnQgZnVuY3Rpb24ga2V5VG9TZWVkUGhyYXNlKGhleEtleSkge1xuICAgIGNvbnN0IGJ5dGVzID0gaGV4VG9CeXRlcyhoZXhLZXkpO1xuICAgIHJldHVybiBlbnRyb3B5VG9NbmVtb25pYyhieXRlcywgd29yZGxpc3QpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBCSVAzOSBtbmVtb25pYyBiYWNrIHRvIGEgaGV4IHByaXZhdGUga2V5ICsgZGVyaXZlZCBwdWJrZXkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlIC0gMjQtd29yZCBtbmVtb25pY1xuICogQHJldHVybnMge3sgaGV4S2V5OiBzdHJpbmcsIHB1YktleTogc3RyaW5nIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkUGhyYXNlVG9LZXkocGhyYXNlKSB7XG4gICAgY29uc3QgZW50cm9weSA9IG1uZW1vbmljVG9FbnRyb3B5KHBocmFzZS50cmltKCkudG9Mb3dlckNhc2UoKSwgd29yZGxpc3QpO1xuICAgIGNvbnN0IGhleEtleSA9IGJ5dGVzVG9IZXgoZW50cm9weSk7XG4gICAgY29uc3QgcHViS2V5ID0gZ2V0UHVibGljS2V5U3luYyhoZXhLZXkpO1xuICAgIHJldHVybiB7IGhleEtleSwgcHViS2V5IH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYSBCSVAzOSBtbmVtb25pYyAoY2hlY2tzdW0gKyB3b3JkbGlzdCkuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGhyYXNlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRTZWVkUGhyYXNlKHBocmFzZSkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZU1uZW1vbmljKHBocmFzZS50cmltKCkudG9Mb3dlckNhc2UoKSwgd29yZGxpc3QpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIEZhc3QgaGV1cmlzdGljOiBkb2VzIHRoZSBpbnB1dCBsb29rIGxpa2UgaXQgY291bGQgYmUgYSBzZWVkIHBocmFzZT9cbiAqICgxMisgc3BhY2Utc2VwYXJhdGVkIGFscGhhYmV0aWMgd29yZHMpXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3NMaWtlU2VlZFBocmFzZShpbnB1dCkge1xuICAgIGlmICghaW5wdXQgfHwgdHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHdvcmRzID0gaW5wdXQudHJpbSgpLnNwbGl0KC9cXHMrLyk7XG4gICAgcmV0dXJuIHdvcmRzLmxlbmd0aCA+PSAxMiAmJiB3b3Jkcy5ldmVyeSh3ID0+IC9eW2EtekEtWl0rJC8udGVzdCh3KSk7XG59XG4iLCAiLyoqXG4gKiBVdGlsaXRpZXMgZm9yIGhleCwgYnl0ZXMsIENTUFJORy5cbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWhhc2hlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuLyoqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgVWludDhBcnJheS4gQmUgY2FyZWZ1bDogbm9kZWpzIEJ1ZmZlciB3aWxsIHJldHVybiB0cnVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQnl0ZXMoYTogdW5rbm93bik6IGEgaXMgVWludDhBcnJheSB7XG4gIHJldHVybiBhIGluc3RhbmNlb2YgVWludDhBcnJheSB8fCAoQXJyYXlCdWZmZXIuaXNWaWV3KGEpICYmIGEuY29uc3RydWN0b3IubmFtZSA9PT0gJ1VpbnQ4QXJyYXknKTtcbn1cblxuLyoqIEFzc2VydHMgc29tZXRoaW5nIGlzIHBvc2l0aXZlIGludGVnZXIuICovXG5leHBvcnQgZnVuY3Rpb24gYW51bWJlcihuOiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKG4pIHx8IG4gPCAwKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGl0bGUgJiYgYFwiJHt0aXRsZX1cIiBgO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtwcmVmaXh9ZXhwZWN0ZWQgaW50ZWdlciA+PSAwLCBnb3QgJHtufWApO1xuICB9XG59XG5cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBVaW50OEFycmF5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFieXRlcyh2YWx1ZTogVWludDhBcnJheSwgbGVuZ3RoPzogbnVtYmVyLCB0aXRsZTogc3RyaW5nID0gJycpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgYnl0ZXMgPSBpc0J5dGVzKHZhbHVlKTtcbiAgY29uc3QgbGVuID0gdmFsdWU/Lmxlbmd0aDtcbiAgY29uc3QgbmVlZHNMZW4gPSBsZW5ndGggIT09IHVuZGVmaW5lZDtcbiAgaWYgKCFieXRlcyB8fCAobmVlZHNMZW4gJiYgbGVuICE9PSBsZW5ndGgpKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGl0bGUgJiYgYFwiJHt0aXRsZX1cIiBgO1xuICAgIGNvbnN0IG9mTGVuID0gbmVlZHNMZW4gPyBgIG9mIGxlbmd0aCAke2xlbmd0aH1gIDogJyc7XG4gICAgY29uc3QgZ290ID0gYnl0ZXMgPyBgbGVuZ3RoPSR7bGVufWAgOiBgdHlwZT0ke3R5cGVvZiB2YWx1ZX1gO1xuICAgIHRocm93IG5ldyBFcnJvcihwcmVmaXggKyAnZXhwZWN0ZWQgVWludDhBcnJheScgKyBvZkxlbiArICcsIGdvdCAnICsgZ290KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKiBBc3NlcnRzIHNvbWV0aGluZyBpcyBoYXNoICovXG5leHBvcnQgZnVuY3Rpb24gYWhhc2goaDogQ0hhc2gpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBoICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBoLmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhc2ggbXVzdCB3cmFwcGVkIGJ5IHV0aWxzLmNyZWF0ZUhhc2hlcicpO1xuICBhbnVtYmVyKGgub3V0cHV0TGVuKTtcbiAgYW51bWJlcihoLmJsb2NrTGVuKTtcbn1cblxuLyoqIEFzc2VydHMgYSBoYXNoIGluc3RhbmNlIGhhcyBub3QgYmVlbiBkZXN0cm95ZWQgLyBmaW5pc2hlZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFleGlzdHMoaW5zdGFuY2U6IGFueSwgY2hlY2tGaW5pc2hlZCA9IHRydWUpOiB2b2lkIHtcbiAgaWYgKGluc3RhbmNlLmRlc3Ryb3llZCkgdGhyb3cgbmV3IEVycm9yKCdIYXNoIGluc3RhbmNlIGhhcyBiZWVuIGRlc3Ryb3llZCcpO1xuICBpZiAoY2hlY2tGaW5pc2hlZCAmJiBpbnN0YW5jZS5maW5pc2hlZCkgdGhyb3cgbmV3IEVycm9yKCdIYXNoI2RpZ2VzdCgpIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkJyk7XG59XG5cbi8qKiBBc3NlcnRzIG91dHB1dCBpcyBwcm9wZXJseS1zaXplZCBieXRlIGFycmF5ICovXG5leHBvcnQgZnVuY3Rpb24gYW91dHB1dChvdXQ6IGFueSwgaW5zdGFuY2U6IGFueSk6IHZvaWQge1xuICBhYnl0ZXMob3V0LCB1bmRlZmluZWQsICdkaWdlc3RJbnRvKCkgb3V0cHV0Jyk7XG4gIGNvbnN0IG1pbiA9IGluc3RhbmNlLm91dHB1dExlbjtcbiAgaWYgKG91dC5sZW5ndGggPCBtaW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiZGlnZXN0SW50bygpIG91dHB1dFwiIGV4cGVjdGVkIHRvIGJlIG9mIGxlbmd0aCA+PScgKyBtaW4pO1xuICB9XG59XG5cbi8qKiBHZW5lcmljIHR5cGUgZW5jb21wYXNzaW5nIDgvMTYvMzItYnl0ZSBhcnJheXMgLSBidXQgbm90IDY0LWJ5dGUuICovXG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCB0eXBlIFR5cGVkQXJyYXkgPSBJbnQ4QXJyYXkgfCBVaW50OENsYW1wZWRBcnJheSB8IFVpbnQ4QXJyYXkgfFxuICBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk7XG5cbi8qKiBDYXN0IHU4IC8gdTE2IC8gdTMyIHRvIHU4LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHU4KGFycjogVHlwZWRBcnJheSk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIGFyci5ieXRlTGVuZ3RoKTtcbn1cblxuLyoqIENhc3QgdTggLyB1MTYgLyB1MzIgdG8gdTMyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHUzMihhcnI6IFR5cGVkQXJyYXkpOiBVaW50MzJBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDMyQXJyYXkoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIE1hdGguZmxvb3IoYXJyLmJ5dGVMZW5ndGggLyA0KSk7XG59XG5cbi8qKiBaZXJvaXplIGEgYnl0ZSBhcnJheS4gV2FybmluZzogSlMgcHJvdmlkZXMgbm8gZ3VhcmFudGVlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbiguLi5hcnJheXM6IFR5cGVkQXJyYXlbXSk6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5cy5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5c1tpXS5maWxsKDApO1xuICB9XG59XG5cbi8qKiBDcmVhdGUgRGF0YVZpZXcgb2YgYW4gYXJyYXkgZm9yIGVhc3kgYnl0ZS1sZXZlbCBtYW5pcHVsYXRpb24uICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVmlldyhhcnI6IFR5cGVkQXJyYXkpOiBEYXRhVmlldyB7XG4gIHJldHVybiBuZXcgRGF0YVZpZXcoYXJyLmJ1ZmZlciwgYXJyLmJ5dGVPZmZzZXQsIGFyci5ieXRlTGVuZ3RoKTtcbn1cblxuLyoqIFRoZSByb3RhdGUgcmlnaHQgKGNpcmN1bGFyIHJpZ2h0IHNoaWZ0KSBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdHIod29yZDogbnVtYmVyLCBzaGlmdDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuICh3b3JkIDw8ICgzMiAtIHNoaWZ0KSkgfCAod29yZCA+Pj4gc2hpZnQpO1xufVxuXG4vKiogVGhlIHJvdGF0ZSBsZWZ0IChjaXJjdWxhciBsZWZ0IHNoaWZ0KSBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGwod29yZDogbnVtYmVyLCBzaGlmdDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuICh3b3JkIDw8IHNoaWZ0KSB8ICgod29yZCA+Pj4gKDMyIC0gc2hpZnQpKSA+Pj4gMCk7XG59XG5cbi8qKiBJcyBjdXJyZW50IHBsYXRmb3JtIGxpdHRsZS1lbmRpYW4/IE1vc3QgYXJlLiBCaWctRW5kaWFuIHBsYXRmb3JtOiBJQk0gKi9cbmV4cG9ydCBjb25zdCBpc0xFOiBib29sZWFuID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBuZXcgVWludDhBcnJheShuZXcgVWludDMyQXJyYXkoWzB4MTEyMjMzNDRdKS5idWZmZXIpWzBdID09PSAweDQ0KSgpO1xuXG4vKiogVGhlIGJ5dGUgc3dhcCBvcGVyYXRpb24gZm9yIHVpbnQzMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVTd2FwKHdvcmQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoXG4gICAgKCh3b3JkIDw8IDI0KSAmIDB4ZmYwMDAwMDApIHxcbiAgICAoKHdvcmQgPDwgOCkgJiAweGZmMDAwMCkgfFxuICAgICgod29yZCA+Pj4gOCkgJiAweGZmMDApIHxcbiAgICAoKHdvcmQgPj4+IDI0KSAmIDB4ZmYpXG4gICk7XG59XG4vKiogQ29uZGl0aW9uYWxseSBieXRlIHN3YXAgaWYgb24gYSBiaWctZW5kaWFuIHBsYXRmb3JtICovXG5leHBvcnQgY29uc3Qgc3dhcDhJZkJFOiAobjogbnVtYmVyKSA9PiBudW1iZXIgPSBpc0xFXG4gID8gKG46IG51bWJlcikgPT4gblxuICA6IChuOiBudW1iZXIpID0+IGJ5dGVTd2FwKG4pO1xuXG4vKiogSW4gcGxhY2UgYnl0ZSBzd2FwIGZvciBVaW50MzJBcnJheSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVTd2FwMzIoYXJyOiBVaW50MzJBcnJheSk6IFVpbnQzMkFycmF5IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBhcnJbaV0gPSBieXRlU3dhcChhcnJbaV0pO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5cbmV4cG9ydCBjb25zdCBzd2FwMzJJZkJFOiAodTogVWludDMyQXJyYXkpID0+IFVpbnQzMkFycmF5ID0gaXNMRVxuICA/ICh1OiBVaW50MzJBcnJheSkgPT4gdVxuICA6IGJ5dGVTd2FwMzI7XG5cbi8vIEJ1aWx0LWluIGhleCBjb252ZXJzaW9uIGh0dHBzOi8vY2FuaXVzZS5jb20vbWRuLWphdmFzY3JpcHRfYnVpbHRpbnNfdWludDhhcnJheV9mcm9taGV4XG5jb25zdCBoYXNIZXhCdWlsdGluOiBib29sZWFuID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICAvLyBAdHMtaWdub3JlXG4gIHR5cGVvZiBVaW50OEFycmF5LmZyb20oW10pLnRvSGV4ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBVaW50OEFycmF5LmZyb21IZXggPT09ICdmdW5jdGlvbicpKCk7XG5cbi8vIEFycmF5IHdoZXJlIGluZGV4IDB4ZjAgKDI0MCkgaXMgbWFwcGVkIHRvIHN0cmluZyAnZjAnXG5jb25zdCBoZXhlcyA9IC8qIEBfX1BVUkVfXyAqLyBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNTYgfSwgKF8sIGkpID0+XG4gIGkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJylcbik7XG5cbi8qKlxuICogQ29udmVydCBieXRlIGFycmF5IHRvIGhleCBzdHJpbmcuIFVzZXMgYnVpbHQtaW4gZnVuY3Rpb24sIHdoZW4gYXZhaWxhYmxlLlxuICogQGV4YW1wbGUgYnl0ZXNUb0hleChVaW50OEFycmF5LmZyb20oWzB4Y2EsIDB4ZmUsIDB4MDEsIDB4MjNdKSkgLy8gJ2NhZmUwMTIzJ1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0hleChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGFieXRlcyhieXRlcyk7XG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKGhhc0hleEJ1aWx0aW4pIHJldHVybiBieXRlcy50b0hleCgpO1xuICAvLyBwcmUtY2FjaGluZyBpbXByb3ZlcyB0aGUgc3BlZWQgNnhcbiAgbGV0IGhleCA9ICcnO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaGV4ICs9IGhleGVzW2J5dGVzW2ldXTtcbiAgfVxuICByZXR1cm4gaGV4O1xufVxuXG4vLyBXZSB1c2Ugb3B0aW1pemVkIHRlY2huaXF1ZSB0byBjb252ZXJ0IGhleCBzdHJpbmcgdG8gYnl0ZSBhcnJheVxuY29uc3QgYXNjaWlzID0geyBfMDogNDgsIF85OiA1NywgQTogNjUsIEY6IDcwLCBhOiA5NywgZjogMTAyIH0gYXMgY29uc3Q7XG5mdW5jdGlvbiBhc2NpaVRvQmFzZTE2KGNoOiBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAoY2ggPj0gYXNjaWlzLl8wICYmIGNoIDw9IGFzY2lpcy5fOSkgcmV0dXJuIGNoIC0gYXNjaWlzLl8wOyAvLyAnMicgPT4gNTAtNDhcbiAgaWYgKGNoID49IGFzY2lpcy5BICYmIGNoIDw9IGFzY2lpcy5GKSByZXR1cm4gY2ggLSAoYXNjaWlzLkEgLSAxMCk7IC8vICdCJyA9PiA2Ni0oNjUtMTApXG4gIGlmIChjaCA+PSBhc2NpaXMuYSAmJiBjaCA8PSBhc2NpaXMuZikgcmV0dXJuIGNoIC0gKGFzY2lpcy5hIC0gMTApOyAvLyAnYicgPT4gOTgtKDk3LTEwKVxuICByZXR1cm47XG59XG5cbi8qKlxuICogQ29udmVydCBoZXggc3RyaW5nIHRvIGJ5dGUgYXJyYXkuIFVzZXMgYnVpbHQtaW4gZnVuY3Rpb24sIHdoZW4gYXZhaWxhYmxlLlxuICogQGV4YW1wbGUgaGV4VG9CeXRlcygnY2FmZTAxMjMnKSAvLyBVaW50OEFycmF5LmZyb20oWzB4Y2EsIDB4ZmUsIDB4MDEsIDB4MjNdKVxuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CeXRlcyhoZXg6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAodHlwZW9mIGhleCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignaGV4IHN0cmluZyBleHBlY3RlZCwgZ290ICcgKyB0eXBlb2YgaGV4KTtcbiAgLy8gQHRzLWlnbm9yZVxuICBpZiAoaGFzSGV4QnVpbHRpbikgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbUhleChoZXgpO1xuICBjb25zdCBobCA9IGhleC5sZW5ndGg7XG4gIGNvbnN0IGFsID0gaGwgLyAyO1xuICBpZiAoaGwgJSAyKSB0aHJvdyBuZXcgRXJyb3IoJ2hleCBzdHJpbmcgZXhwZWN0ZWQsIGdvdCB1bnBhZGRlZCBoZXggb2YgbGVuZ3RoICcgKyBobCk7XG4gIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYWwpO1xuICBmb3IgKGxldCBhaSA9IDAsIGhpID0gMDsgYWkgPCBhbDsgYWkrKywgaGkgKz0gMikge1xuICAgIGNvbnN0IG4xID0gYXNjaWlUb0Jhc2UxNihoZXguY2hhckNvZGVBdChoaSkpO1xuICAgIGNvbnN0IG4yID0gYXNjaWlUb0Jhc2UxNihoZXguY2hhckNvZGVBdChoaSArIDEpKTtcbiAgICBpZiAobjEgPT09IHVuZGVmaW5lZCB8fCBuMiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBjaGFyID0gaGV4W2hpXSArIGhleFtoaSArIDFdO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3Qgbm9uLWhleCBjaGFyYWN0ZXIgXCInICsgY2hhciArICdcIiBhdCBpbmRleCAnICsgaGkpO1xuICAgIH1cbiAgICBhcnJheVthaV0gPSBuMSAqIDE2ICsgbjI7IC8vIG11bHRpcGx5IGZpcnN0IG9jdGV0LCBlLmcuICdhMycgPT4gMTAqMTYrMyA9PiAxNjAgKyAzID0+IDE2M1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBUaGVyZSBpcyBubyBzZXRJbW1lZGlhdGUgaW4gYnJvd3NlciBhbmQgc2V0VGltZW91dCBpcyBzbG93LlxuICogQ2FsbCBvZiBhc3luYyBmbiB3aWxsIHJldHVybiBQcm9taXNlLCB3aGljaCB3aWxsIGJlIGZ1bGxmaWxlZCBvbmx5IG9uXG4gKiBuZXh0IHNjaGVkdWxlciBxdWV1ZSBwcm9jZXNzaW5nIHN0ZXAgYW5kIHRoaXMgaXMgZXhhY3RseSB3aGF0IHdlIG5lZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBuZXh0VGljayA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHt9O1xuXG4vKiogUmV0dXJucyBjb250cm9sIHRvIHRocmVhZCBlYWNoICd0aWNrJyBtcyB0byBhdm9pZCBibG9ja2luZy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhc3luY0xvb3AoXG4gIGl0ZXJzOiBudW1iZXIsXG4gIHRpY2s6IG51bWJlcixcbiAgY2I6IChpOiBudW1iZXIpID0+IHZvaWRcbik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgdHMgPSBEYXRlLm5vdygpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJzOyBpKyspIHtcbiAgICBjYihpKTtcbiAgICAvLyBEYXRlLm5vdygpIGlzIG5vdCBtb25vdG9uaWMsIHNvIGluIGNhc2UgaWYgY2xvY2sgZ29lcyBiYWNrd2FyZHMgd2UgcmV0dXJuIHJldHVybiBjb250cm9sIHRvb1xuICAgIGNvbnN0IGRpZmYgPSBEYXRlLm5vdygpIC0gdHM7XG4gICAgaWYgKGRpZmYgPj0gMCAmJiBkaWZmIDwgdGljaykgY29udGludWU7XG4gICAgYXdhaXQgbmV4dFRpY2soKTtcbiAgICB0cyArPSBkaWZmO1xuICB9XG59XG5cbi8vIEdsb2JhbCBzeW1ib2xzLCBidXQgdHMgZG9lc24ndCBzZWUgdGhlbTogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8zMTUzNVxuZGVjbGFyZSBjb25zdCBUZXh0RW5jb2RlcjogYW55O1xuXG4vKipcbiAqIENvbnZlcnRzIHN0cmluZyB0byBieXRlcyB1c2luZyBVVEY4IGVuY29kaW5nLlxuICogQnVpbHQtaW4gZG9lc24ndCB2YWxpZGF0ZSBpbnB1dCB0byBiZSBzdHJpbmc6IHdlIGRvIHRoZSBjaGVjay5cbiAqIEBleGFtcGxlIHV0ZjhUb0J5dGVzKCdhYmMnKSAvLyBVaW50OEFycmF5LmZyb20oWzk3LCA5OCwgOTldKVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ3N0cmluZyBleHBlY3RlZCcpO1xuICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cikpOyAvLyBodHRwczovL2J1Z3ppbC5sYS8xNjgxODA5XG59XG5cbi8qKiBLREZzIGNhbiBhY2NlcHQgc3RyaW5nIG9yIFVpbnQ4QXJyYXkgZm9yIHVzZXIgY29udmVuaWVuY2UuICovXG5leHBvcnQgdHlwZSBLREZJbnB1dCA9IHN0cmluZyB8IFVpbnQ4QXJyYXk7XG5cbi8qKlxuICogSGVscGVyIGZvciBLREZzOiBjb25zdW1lcyB1aW50OGFycmF5IG9yIHN0cmluZy5cbiAqIFdoZW4gc3RyaW5nIGlzIHBhc3NlZCwgZG9lcyB1dGY4IGRlY29kaW5nLCB1c2luZyBUZXh0RGVjb2Rlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtkZklucHV0VG9CeXRlcyhkYXRhOiBLREZJbnB1dCwgZXJyb3JUaXRsZSA9ICcnKTogVWludDhBcnJheSB7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHJldHVybiB1dGY4VG9CeXRlcyhkYXRhKTtcbiAgcmV0dXJuIGFieXRlcyhkYXRhLCB1bmRlZmluZWQsIGVycm9yVGl0bGUpO1xufVxuXG4vKiogQ29waWVzIHNldmVyYWwgVWludDhBcnJheXMgaW50byBvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0Qnl0ZXMoLi4uYXJyYXlzOiBVaW50OEFycmF5W10pOiBVaW50OEFycmF5IHtcbiAgbGV0IHN1bSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYSA9IGFycmF5c1tpXTtcbiAgICBhYnl0ZXMoYSk7XG4gICAgc3VtICs9IGEubGVuZ3RoO1xuICB9XG4gIGNvbnN0IHJlcyA9IG5ldyBVaW50OEFycmF5KHN1bSk7XG4gIGZvciAobGV0IGkgPSAwLCBwYWQgPSAwOyBpIDwgYXJyYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgYSA9IGFycmF5c1tpXTtcbiAgICByZXMuc2V0KGEsIHBhZCk7XG4gICAgcGFkICs9IGEubGVuZ3RoO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnR5cGUgRW1wdHlPYmogPSB7fTtcbi8qKiBNZXJnZXMgZGVmYXVsdCBvcHRpb25zIGFuZCBwYXNzZWQgb3B0aW9ucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja09wdHM8VDEgZXh0ZW5kcyBFbXB0eU9iaiwgVDIgZXh0ZW5kcyBFbXB0eU9iaj4oXG4gIGRlZmF1bHRzOiBUMSxcbiAgb3B0cz86IFQyXG4pOiBUMSAmIFQyIHtcbiAgaWYgKG9wdHMgIT09IHVuZGVmaW5lZCAmJiB7fS50b1N0cmluZy5jYWxsKG9wdHMpICE9PSAnW29iamVjdCBPYmplY3RdJylcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBvYmplY3Qgb3IgdW5kZWZpbmVkJyk7XG4gIGNvbnN0IG1lcmdlZCA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdHMpO1xuICByZXR1cm4gbWVyZ2VkIGFzIFQxICYgVDI7XG59XG5cbi8qKiBDb21tb24gaW50ZXJmYWNlIGZvciBhbGwgaGFzaGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBIYXNoPFQ+IHtcbiAgYmxvY2tMZW46IG51bWJlcjsgLy8gQnl0ZXMgcGVyIGJsb2NrXG4gIG91dHB1dExlbjogbnVtYmVyOyAvLyBCeXRlcyBpbiBvdXRwdXRcbiAgdXBkYXRlKGJ1ZjogVWludDhBcnJheSk6IHRoaXM7XG4gIGRpZ2VzdEludG8oYnVmOiBVaW50OEFycmF5KTogdm9pZDtcbiAgZGlnZXN0KCk6IFVpbnQ4QXJyYXk7XG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgX2Nsb25lSW50byh0bz86IFQpOiBUO1xuICBjbG9uZSgpOiBUO1xufVxuXG4vKiogUHNldWRvUmFuZG9tIChudW1iZXIpIEdlbmVyYXRvciAqL1xuZXhwb3J0IGludGVyZmFjZSBQUkcge1xuICBhZGRFbnRyb3B5KHNlZWQ6IFVpbnQ4QXJyYXkpOiB2b2lkO1xuICByYW5kb21CeXRlcyhsZW5ndGg6IG51bWJlcik6IFVpbnQ4QXJyYXk7XG4gIGNsZWFuKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogWE9GOiBzdHJlYW1pbmcgQVBJIHRvIHJlYWQgZGlnZXN0IGluIGNodW5rcy5cbiAqIFNhbWUgYXMgJ3NxdWVlemUnIGluIGtlY2Nhay9rMTIgYW5kICdzZWVrJyBpbiBibGFrZTMsIGJ1dCBtb3JlIGdlbmVyaWMgbmFtZS5cbiAqIFdoZW4gaGFzaCB1c2VkIGluIFhPRiBtb2RlIGl0IGlzIHVwIHRvIHVzZXIgdG8gY2FsbCAnLmRlc3Ryb3knIGFmdGVyd2FyZHMsIHNpbmNlIHdlIGNhbm5vdFxuICogZGVzdHJveSBzdGF0ZSwgbmV4dCBjYWxsIGNhbiByZXF1aXJlIG1vcmUgYnl0ZXMuXG4gKi9cbmV4cG9ydCB0eXBlIEhhc2hYT0Y8VCBleHRlbmRzIEhhc2g8VD4+ID0gSGFzaDxUPiAmIHtcbiAgeG9mKGJ5dGVzOiBudW1iZXIpOiBVaW50OEFycmF5OyAvLyBSZWFkICdieXRlcycgYnl0ZXMgZnJvbSBkaWdlc3Qgc3RyZWFtXG4gIHhvZkludG8oYnVmOiBVaW50OEFycmF5KTogVWludDhBcnJheTsgLy8gcmVhZCBidWYubGVuZ3RoIGJ5dGVzIGZyb20gZGlnZXN0IHN0cmVhbSBpbnRvIGJ1ZlxufTtcblxuLyoqIEhhc2ggY29uc3RydWN0b3IgKi9cbmV4cG9ydCB0eXBlIEhhc2hlckNvbnM8VCwgT3B0cyA9IHVuZGVmaW5lZD4gPSBPcHRzIGV4dGVuZHMgdW5kZWZpbmVkID8gKCkgPT4gVCA6IChvcHRzPzogT3B0cykgPT4gVDtcbi8qKiBPcHRpb25hbCBoYXNoIHBhcmFtcy4gKi9cbmV4cG9ydCB0eXBlIEhhc2hJbmZvID0ge1xuICBvaWQ/OiBVaW50OEFycmF5OyAvLyBERVIgZW5jb2RlZCBPSUQgaW4gYnl0ZXNcbn07XG4vKiogSGFzaCBmdW5jdGlvbiAqL1xuZXhwb3J0IHR5cGUgQ0hhc2g8VCBleHRlbmRzIEhhc2g8VD4gPSBIYXNoPGFueT4sIE9wdHMgPSB1bmRlZmluZWQ+ID0ge1xuICBvdXRwdXRMZW46IG51bWJlcjtcbiAgYmxvY2tMZW46IG51bWJlcjtcbn0gJiBIYXNoSW5mbyAmXG4gIChPcHRzIGV4dGVuZHMgdW5kZWZpbmVkXG4gICAgPyB7XG4gICAgICAgIChtc2c6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5O1xuICAgICAgICBjcmVhdGUoKTogVDtcbiAgICAgIH1cbiAgICA6IHtcbiAgICAgICAgKG1zZzogVWludDhBcnJheSwgb3B0cz86IE9wdHMpOiBVaW50OEFycmF5O1xuICAgICAgICBjcmVhdGUob3B0cz86IE9wdHMpOiBUO1xuICAgICAgfSk7XG4vKiogWE9GIHdpdGggb3V0cHV0ICovXG5leHBvcnQgdHlwZSBDSGFzaFhPRjxUIGV4dGVuZHMgSGFzaFhPRjxUPiA9IEhhc2hYT0Y8YW55PiwgT3B0cyA9IHVuZGVmaW5lZD4gPSBDSGFzaDxULCBPcHRzPjtcblxuLyoqIENyZWF0ZXMgZnVuY3Rpb24gd2l0aCBvdXRwdXRMZW4sIGJsb2NrTGVuLCBjcmVhdGUgcHJvcGVydGllcyBmcm9tIGEgY2xhc3MgY29uc3RydWN0b3IuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGFzaGVyPFQgZXh0ZW5kcyBIYXNoPFQ+LCBPcHRzID0gdW5kZWZpbmVkPihcbiAgaGFzaENvbnM6IEhhc2hlckNvbnM8VCwgT3B0cz4sXG4gIGluZm86IEhhc2hJbmZvID0ge31cbik6IENIYXNoPFQsIE9wdHM+IHtcbiAgY29uc3QgaGFzaEM6IGFueSA9IChtc2c6IFVpbnQ4QXJyYXksIG9wdHM/OiBPcHRzKSA9PiBoYXNoQ29ucyhvcHRzKS51cGRhdGUobXNnKS5kaWdlc3QoKTtcbiAgY29uc3QgdG1wID0gaGFzaENvbnModW5kZWZpbmVkKTtcbiAgaGFzaEMub3V0cHV0TGVuID0gdG1wLm91dHB1dExlbjtcbiAgaGFzaEMuYmxvY2tMZW4gPSB0bXAuYmxvY2tMZW47XG4gIGhhc2hDLmNyZWF0ZSA9IChvcHRzPzogT3B0cykgPT4gaGFzaENvbnMob3B0cyk7XG4gIE9iamVjdC5hc3NpZ24oaGFzaEMsIGluZm8pO1xuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShoYXNoQyk7XG59XG5cbi8qKiBDcnlwdG9ncmFwaGljYWxseSBzZWN1cmUgUFJORy4gVXNlcyBpbnRlcm5hbCBPUy1sZXZlbCBgY3J5cHRvLmdldFJhbmRvbVZhbHVlc2AuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tQnl0ZXMoYnl0ZXNMZW5ndGggPSAzMik6IFVpbnQ4QXJyYXkge1xuICBjb25zdCBjciA9IHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JyA/IChnbG9iYWxUaGlzIGFzIGFueSkuY3J5cHRvIDogbnVsbDtcbiAgaWYgKHR5cGVvZiBjcj8uZ2V0UmFuZG9tVmFsdWVzICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgcmV0dXJuIGNyLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShieXRlc0xlbmd0aCkpO1xufVxuXG4vKiogQ3JlYXRlcyBPSUQgb3B0cyBmb3IgTklTVCBoYXNoZXMsIHdpdGggcHJlZml4IDA2IDA5IDYwIDg2IDQ4IDAxIDY1IDAzIDA0IDAyLiAqL1xuZXhwb3J0IGNvbnN0IG9pZE5pc3QgPSAoc3VmZml4OiBudW1iZXIpOiBSZXF1aXJlZDxIYXNoSW5mbz4gPT4gKHtcbiAgb2lkOiBVaW50OEFycmF5LmZyb20oWzB4MDYsIDB4MDksIDB4NjAsIDB4ODYsIDB4NDgsIDB4MDEsIDB4NjUsIDB4MDMsIDB4MDQsIDB4MDIsIHN1ZmZpeF0pLFxufSk7XG4iLCAiLyoqXG4gKiBTSEEyIGhhc2ggZnVuY3Rpb24uIEEuay5hLiBzaGEyNTYsIHNoYTM4NCwgc2hhNTEyLCBzaGE1MTJfMjI0LCBzaGE1MTJfMjU2LlxuICogU0hBMjU2IGlzIHRoZSBmYXN0ZXN0IGhhc2ggaW1wbGVtZW50YWJsZSBpbiBKUywgZXZlbiBmYXN0ZXIgdGhhbiBCbGFrZTMuXG4gKiBDaGVjayBvdXQgW1JGQyA0NjM0XShodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjNDYzNCkgYW5kXG4gKiBbRklQUyAxODAtNF0oaHR0cHM6Ly9udmxwdWJzLm5pc3QuZ292L25pc3RwdWJzL0ZJUFMvTklTVC5GSVBTLjE4MC00LnBkZikuXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IENoaSwgSGFzaE1ELCBNYWosIFNIQTIyNF9JViwgU0hBMjU2X0lWLCBTSEEzODRfSVYsIFNIQTUxMl9JViB9IGZyb20gJy4vX21kLnRzJztcbmltcG9ydCAqIGFzIHU2NCBmcm9tICcuL191NjQudHMnO1xuaW1wb3J0IHsgdHlwZSBDSGFzaCwgY2xlYW4sIGNyZWF0ZUhhc2hlciwgb2lkTmlzdCwgcm90ciB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vKipcbiAqIFJvdW5kIGNvbnN0YW50czpcbiAqIEZpcnN0IDMyIGJpdHMgb2YgZnJhY3Rpb25hbCBwYXJ0cyBvZiB0aGUgY3ViZSByb290cyBvZiB0aGUgZmlyc3QgNjQgcHJpbWVzIDIuLjMxMSlcbiAqL1xuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBTSEEyNTZfSyA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHg0MjhhMmY5OCwgMHg3MTM3NDQ5MSwgMHhiNWMwZmJjZiwgMHhlOWI1ZGJhNSwgMHgzOTU2YzI1YiwgMHg1OWYxMTFmMSwgMHg5MjNmODJhNCwgMHhhYjFjNWVkNSxcbiAgMHhkODA3YWE5OCwgMHgxMjgzNWIwMSwgMHgyNDMxODViZSwgMHg1NTBjN2RjMywgMHg3MmJlNWQ3NCwgMHg4MGRlYjFmZSwgMHg5YmRjMDZhNywgMHhjMTliZjE3NCxcbiAgMHhlNDliNjljMSwgMHhlZmJlNDc4NiwgMHgwZmMxOWRjNiwgMHgyNDBjYTFjYywgMHgyZGU5MmM2ZiwgMHg0YTc0ODRhYSwgMHg1Y2IwYTlkYywgMHg3NmY5ODhkYSxcbiAgMHg5ODNlNTE1MiwgMHhhODMxYzY2ZCwgMHhiMDAzMjdjOCwgMHhiZjU5N2ZjNywgMHhjNmUwMGJmMywgMHhkNWE3OTE0NywgMHgwNmNhNjM1MSwgMHgxNDI5Mjk2NyxcbiAgMHgyN2I3MGE4NSwgMHgyZTFiMjEzOCwgMHg0ZDJjNmRmYywgMHg1MzM4MGQxMywgMHg2NTBhNzM1NCwgMHg3NjZhMGFiYiwgMHg4MWMyYzkyZSwgMHg5MjcyMmM4NSxcbiAgMHhhMmJmZThhMSwgMHhhODFhNjY0YiwgMHhjMjRiOGI3MCwgMHhjNzZjNTFhMywgMHhkMTkyZTgxOSwgMHhkNjk5MDYyNCwgMHhmNDBlMzU4NSwgMHgxMDZhYTA3MCxcbiAgMHgxOWE0YzExNiwgMHgxZTM3NmMwOCwgMHgyNzQ4Nzc0YywgMHgzNGIwYmNiNSwgMHgzOTFjMGNiMywgMHg0ZWQ4YWE0YSwgMHg1YjljY2E0ZiwgMHg2ODJlNmZmMyxcbiAgMHg3NDhmODJlZSwgMHg3OGE1NjM2ZiwgMHg4NGM4NzgxNCwgMHg4Y2M3MDIwOCwgMHg5MGJlZmZmYSwgMHhhNDUwNmNlYiwgMHhiZWY5YTNmNywgMHhjNjcxNzhmMlxuXSk7XG5cbi8qKiBSZXVzYWJsZSB0ZW1wb3JhcnkgYnVmZmVyLiBcIldcIiBjb21lcyBzdHJhaWdodCBmcm9tIHNwZWMuICovXG5jb25zdCBTSEEyNTZfVyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgVWludDMyQXJyYXkoNjQpO1xuXG4vKiogSW50ZXJuYWwgMzItYnl0ZSBiYXNlIFNIQTIgaGFzaCBjbGFzcy4gKi9cbmFic3RyYWN0IGNsYXNzIFNIQTJfMzJCPFQgZXh0ZW5kcyBTSEEyXzMyQjxUPj4gZXh0ZW5kcyBIYXNoTUQ8VD4ge1xuICAvLyBXZSBjYW5ub3QgdXNlIGFycmF5IGhlcmUgc2luY2UgYXJyYXkgYWxsb3dzIGluZGV4aW5nIGJ5IHZhcmlhYmxlXG4gIC8vIHdoaWNoIG1lYW5zIG9wdGltaXplci9jb21waWxlciBjYW5ub3QgdXNlIHJlZ2lzdGVycy5cbiAgcHJvdGVjdGVkIGFic3RyYWN0IEE6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEI6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEM6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEQ6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEU6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEY6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEc6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXRMZW46IG51bWJlcikge1xuICAgIHN1cGVyKDY0LCBvdXRwdXRMZW4sIDgsIGZhbHNlKTtcbiAgfVxuICBwcm90ZWN0ZWQgZ2V0KCk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl0ge1xuICAgIGNvbnN0IHsgQSwgQiwgQywgRCwgRSwgRiwgRywgSCB9ID0gdGhpcztcbiAgICByZXR1cm4gW0EsIEIsIEMsIEQsIEUsIEYsIEcsIEhdO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgc2V0KFxuICAgIEE6IG51bWJlciwgQjogbnVtYmVyLCBDOiBudW1iZXIsIEQ6IG51bWJlciwgRTogbnVtYmVyLCBGOiBudW1iZXIsIEc6IG51bWJlciwgSDogbnVtYmVyXG4gICk6IHZvaWQge1xuICAgIHRoaXMuQSA9IEEgfCAwO1xuICAgIHRoaXMuQiA9IEIgfCAwO1xuICAgIHRoaXMuQyA9IEMgfCAwO1xuICAgIHRoaXMuRCA9IEQgfCAwO1xuICAgIHRoaXMuRSA9IEUgfCAwO1xuICAgIHRoaXMuRiA9IEYgfCAwO1xuICAgIHRoaXMuRyA9IEcgfCAwO1xuICAgIHRoaXMuSCA9IEggfCAwO1xuICB9XG4gIHByb3RlY3RlZCBwcm9jZXNzKHZpZXc6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEV4dGVuZCB0aGUgZmlyc3QgMTYgd29yZHMgaW50byB0aGUgcmVtYWluaW5nIDQ4IHdvcmRzIHdbMTYuLjYzXSBvZiB0aGUgbWVzc2FnZSBzY2hlZHVsZSBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIFNIQTI1Nl9XW2ldID0gdmlldy5nZXRVaW50MzIob2Zmc2V0LCBmYWxzZSk7XG4gICAgZm9yIChsZXQgaSA9IDE2OyBpIDwgNjQ7IGkrKykge1xuICAgICAgY29uc3QgVzE1ID0gU0hBMjU2X1dbaSAtIDE1XTtcbiAgICAgIGNvbnN0IFcyID0gU0hBMjU2X1dbaSAtIDJdO1xuICAgICAgY29uc3QgczAgPSByb3RyKFcxNSwgNykgXiByb3RyKFcxNSwgMTgpIF4gKFcxNSA+Pj4gMyk7XG4gICAgICBjb25zdCBzMSA9IHJvdHIoVzIsIDE3KSBeIHJvdHIoVzIsIDE5KSBeIChXMiA+Pj4gMTApO1xuICAgICAgU0hBMjU2X1dbaV0gPSAoczEgKyBTSEEyNTZfV1tpIC0gN10gKyBzMCArIFNIQTI1Nl9XW2kgLSAxNl0pIHwgMDtcbiAgICB9XG4gICAgLy8gQ29tcHJlc3Npb24gZnVuY3Rpb24gbWFpbiBsb29wLCA2NCByb3VuZHNcbiAgICBsZXQgeyBBLCBCLCBDLCBELCBFLCBGLCBHLCBIIH0gPSB0aGlzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuICAgICAgY29uc3Qgc2lnbWExID0gcm90cihFLCA2KSBeIHJvdHIoRSwgMTEpIF4gcm90cihFLCAyNSk7XG4gICAgICBjb25zdCBUMSA9IChIICsgc2lnbWExICsgQ2hpKEUsIEYsIEcpICsgU0hBMjU2X0tbaV0gKyBTSEEyNTZfV1tpXSkgfCAwO1xuICAgICAgY29uc3Qgc2lnbWEwID0gcm90cihBLCAyKSBeIHJvdHIoQSwgMTMpIF4gcm90cihBLCAyMik7XG4gICAgICBjb25zdCBUMiA9IChzaWdtYTAgKyBNYWooQSwgQiwgQykpIHwgMDtcbiAgICAgIEggPSBHO1xuICAgICAgRyA9IEY7XG4gICAgICBGID0gRTtcbiAgICAgIEUgPSAoRCArIFQxKSB8IDA7XG4gICAgICBEID0gQztcbiAgICAgIEMgPSBCO1xuICAgICAgQiA9IEE7XG4gICAgICBBID0gKFQxICsgVDIpIHwgMDtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBjb21wcmVzc2VkIGNodW5rIHRvIHRoZSBjdXJyZW50IGhhc2ggdmFsdWVcbiAgICBBID0gKEEgKyB0aGlzLkEpIHwgMDtcbiAgICBCID0gKEIgKyB0aGlzLkIpIHwgMDtcbiAgICBDID0gKEMgKyB0aGlzLkMpIHwgMDtcbiAgICBEID0gKEQgKyB0aGlzLkQpIHwgMDtcbiAgICBFID0gKEUgKyB0aGlzLkUpIHwgMDtcbiAgICBGID0gKEYgKyB0aGlzLkYpIHwgMDtcbiAgICBHID0gKEcgKyB0aGlzLkcpIHwgMDtcbiAgICBIID0gKEggKyB0aGlzLkgpIHwgMDtcbiAgICB0aGlzLnNldChBLCBCLCBDLCBELCBFLCBGLCBHLCBIKTtcbiAgfVxuICBwcm90ZWN0ZWQgcm91bmRDbGVhbigpOiB2b2lkIHtcbiAgICBjbGVhbihTSEEyNTZfVyk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlcik7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItMjU2IGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTI1NiBleHRlbmRzIFNIQTJfMzJCPF9TSEEyNTY+IHtcbiAgLy8gV2UgY2Fubm90IHVzZSBhcnJheSBoZXJlIHNpbmNlIGFycmF5IGFsbG93cyBpbmRleGluZyBieSB2YXJpYWJsZVxuICAvLyB3aGljaCBtZWFucyBvcHRpbWl6ZXIvY29tcGlsZXIgY2Fubm90IHVzZSByZWdpc3RlcnMuXG4gIHByb3RlY3RlZCBBOiBudW1iZXIgPSBTSEEyNTZfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQjogbnVtYmVyID0gU0hBMjU2X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEM6IG51bWJlciA9IFNIQTI1Nl9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBEOiBudW1iZXIgPSBTSEEyNTZfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgRTogbnVtYmVyID0gU0hBMjU2X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIEY6IG51bWJlciA9IFNIQTI1Nl9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBHOiBudW1iZXIgPSBTSEEyNTZfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgSDogbnVtYmVyID0gU0hBMjU2X0lWWzddIHwgMDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMzIpO1xuICB9XG59XG5cbi8qKiBJbnRlcm5hbCBTSEEyLTIyNCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEEyMjQgZXh0ZW5kcyBTSEEyXzMyQjxfU0hBMjI0PiB7XG4gIHByb3RlY3RlZCBBOiBudW1iZXIgPSBTSEEyMjRfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQjogbnVtYmVyID0gU0hBMjI0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEM6IG51bWJlciA9IFNIQTIyNF9JVlsyXSB8IDA7XG4gIHByb3RlY3RlZCBEOiBudW1iZXIgPSBTSEEyMjRfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgRTogbnVtYmVyID0gU0hBMjI0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIEY6IG51bWJlciA9IFNIQTIyNF9JVls1XSB8IDA7XG4gIHByb3RlY3RlZCBHOiBudW1iZXIgPSBTSEEyMjRfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgSDogbnVtYmVyID0gU0hBMjI0X0lWWzddIHwgMDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoMjgpO1xuICB9XG59XG5cbi8vIFNIQTItNTEyIGlzIHNsb3dlciB0aGFuIHNoYTI1NiBpbiBqcyBiZWNhdXNlIHU2NCBvcGVyYXRpb25zIGFyZSBzbG93LlxuXG4vLyBSb3VuZCBjb250YW50c1xuLy8gRmlyc3QgMzIgYml0cyBvZiB0aGUgZnJhY3Rpb25hbCBwYXJ0cyBvZiB0aGUgY3ViZSByb290cyBvZiB0aGUgZmlyc3QgODAgcHJpbWVzIDIuLjQwOVxuLy8gcHJldHRpZXItaWdub3JlXG5jb25zdCBLNTEyID0gLyogQF9fUFVSRV9fICovICgoKSA9PiB1NjQuc3BsaXQoW1xuICAnMHg0MjhhMmY5OGQ3MjhhZTIyJywgJzB4NzEzNzQ0OTEyM2VmNjVjZCcsICcweGI1YzBmYmNmZWM0ZDNiMmYnLCAnMHhlOWI1ZGJhNTgxODlkYmJjJyxcbiAgJzB4Mzk1NmMyNWJmMzQ4YjUzOCcsICcweDU5ZjExMWYxYjYwNWQwMTknLCAnMHg5MjNmODJhNGFmMTk0ZjliJywgJzB4YWIxYzVlZDVkYTZkODExOCcsXG4gICcweGQ4MDdhYTk4YTMwMzAyNDInLCAnMHgxMjgzNWIwMTQ1NzA2ZmJlJywgJzB4MjQzMTg1YmU0ZWU0YjI4YycsICcweDU1MGM3ZGMzZDVmZmI0ZTInLFxuICAnMHg3MmJlNWQ3NGYyN2I4OTZmJywgJzB4ODBkZWIxZmUzYjE2OTZiMScsICcweDliZGMwNmE3MjVjNzEyMzUnLCAnMHhjMTliZjE3NGNmNjkyNjk0JyxcbiAgJzB4ZTQ5YjY5YzE5ZWYxNGFkMicsICcweGVmYmU0Nzg2Mzg0ZjI1ZTMnLCAnMHgwZmMxOWRjNjhiOGNkNWI1JywgJzB4MjQwY2ExY2M3N2FjOWM2NScsXG4gICcweDJkZTkyYzZmNTkyYjAyNzUnLCAnMHg0YTc0ODRhYTZlYTZlNDgzJywgJzB4NWNiMGE5ZGNiZDQxZmJkNCcsICcweDc2Zjk4OGRhODMxMTUzYjUnLFxuICAnMHg5ODNlNTE1MmVlNjZkZmFiJywgJzB4YTgzMWM2NmQyZGI0MzIxMCcsICcweGIwMDMyN2M4OThmYjIxM2YnLCAnMHhiZjU5N2ZjN2JlZWYwZWU0JyxcbiAgJzB4YzZlMDBiZjMzZGE4OGZjMicsICcweGQ1YTc5MTQ3OTMwYWE3MjUnLCAnMHgwNmNhNjM1MWUwMDM4MjZmJywgJzB4MTQyOTI5NjcwYTBlNmU3MCcsXG4gICcweDI3YjcwYTg1NDZkMjJmZmMnLCAnMHgyZTFiMjEzODVjMjZjOTI2JywgJzB4NGQyYzZkZmM1YWM0MmFlZCcsICcweDUzMzgwZDEzOWQ5NWIzZGYnLFxuICAnMHg2NTBhNzM1NDhiYWY2M2RlJywgJzB4NzY2YTBhYmIzYzc3YjJhOCcsICcweDgxYzJjOTJlNDdlZGFlZTYnLCAnMHg5MjcyMmM4NTE0ODIzNTNiJyxcbiAgJzB4YTJiZmU4YTE0Y2YxMDM2NCcsICcweGE4MWE2NjRiYmM0MjMwMDEnLCAnMHhjMjRiOGI3MGQwZjg5NzkxJywgJzB4Yzc2YzUxYTMwNjU0YmUzMCcsXG4gICcweGQxOTJlODE5ZDZlZjUyMTgnLCAnMHhkNjk5MDYyNDU1NjVhOTEwJywgJzB4ZjQwZTM1ODU1NzcxMjAyYScsICcweDEwNmFhMDcwMzJiYmQxYjgnLFxuICAnMHgxOWE0YzExNmI4ZDJkMGM4JywgJzB4MWUzNzZjMDg1MTQxYWI1MycsICcweDI3NDg3NzRjZGY4ZWViOTknLCAnMHgzNGIwYmNiNWUxOWI0OGE4JyxcbiAgJzB4MzkxYzBjYjNjNWM5NWE2MycsICcweDRlZDhhYTRhZTM0MThhY2InLCAnMHg1YjljY2E0Zjc3NjNlMzczJywgJzB4NjgyZTZmZjNkNmIyYjhhMycsXG4gICcweDc0OGY4MmVlNWRlZmIyZmMnLCAnMHg3OGE1NjM2ZjQzMTcyZjYwJywgJzB4ODRjODc4MTRhMWYwYWI3MicsICcweDhjYzcwMjA4MWE2NDM5ZWMnLFxuICAnMHg5MGJlZmZmYTIzNjMxZTI4JywgJzB4YTQ1MDZjZWJkZTgyYmRlOScsICcweGJlZjlhM2Y3YjJjNjc5MTUnLCAnMHhjNjcxNzhmMmUzNzI1MzJiJyxcbiAgJzB4Y2EyNzNlY2VlYTI2NjE5YycsICcweGQxODZiOGM3MjFjMGMyMDcnLCAnMHhlYWRhN2RkNmNkZTBlYjFlJywgJzB4ZjU3ZDRmN2ZlZTZlZDE3OCcsXG4gICcweDA2ZjA2N2FhNzIxNzZmYmEnLCAnMHgwYTYzN2RjNWEyYzg5OGE2JywgJzB4MTEzZjk4MDRiZWY5MGRhZScsICcweDFiNzEwYjM1MTMxYzQ3MWInLFxuICAnMHgyOGRiNzdmNTIzMDQ3ZDg0JywgJzB4MzJjYWFiN2I0MGM3MjQ5MycsICcweDNjOWViZTBhMTVjOWJlYmMnLCAnMHg0MzFkNjdjNDljMTAwZDRjJyxcbiAgJzB4NGNjNWQ0YmVjYjNlNDJiNicsICcweDU5N2YyOTljZmM2NTdlMmEnLCAnMHg1ZmNiNmZhYjNhZDZmYWVjJywgJzB4NmM0NDE5OGM0YTQ3NTgxNydcbl0ubWFwKG4gPT4gQmlnSW50KG4pKSkpKCk7XG5jb25zdCBTSEE1MTJfS2ggPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IEs1MTJbMF0pKCk7XG5jb25zdCBTSEE1MTJfS2wgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IEs1MTJbMV0pKCk7XG5cbi8vIFJldXNhYmxlIHRlbXBvcmFyeSBidWZmZXJzXG5jb25zdCBTSEE1MTJfV19IID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG5jb25zdCBTSEE1MTJfV19MID0gLyogQF9fUFVSRV9fICovIG5ldyBVaW50MzJBcnJheSg4MCk7XG5cbi8qKiBJbnRlcm5hbCA2NC1ieXRlIGJhc2UgU0hBMiBoYXNoIGNsYXNzLiAqL1xuYWJzdHJhY3QgY2xhc3MgU0hBMl82NEI8VCBleHRlbmRzIFNIQTJfNjRCPFQ+PiBleHRlbmRzIEhhc2hNRDxUPiB7XG4gIC8vIFdlIGNhbm5vdCB1c2UgYXJyYXkgaGVyZSBzaW5jZSBhcnJheSBhbGxvd3MgaW5kZXhpbmcgYnkgdmFyaWFibGVcbiAgLy8gd2hpY2ggbWVhbnMgb3B0aW1pemVyL2NvbXBpbGVyIGNhbm5vdCB1c2UgcmVnaXN0ZXJzLlxuICAvLyBoIC0tIGhpZ2ggMzIgYml0cywgbCAtLSBsb3cgMzIgYml0c1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQWg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEFsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBCaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgQmw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IENoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBDbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRGg6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IERsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBFaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgRWw6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEZoOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBGbDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgR2g6IG51bWJlcjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IEdsOiBudW1iZXI7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBIaDogbnVtYmVyO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgSGw6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvdXRwdXRMZW46IG51bWJlcikge1xuICAgIHN1cGVyKDEyOCwgb3V0cHV0TGVuLCAxNiwgZmFsc2UpO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgZ2V0KCk6IFtcbiAgICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcixcbiAgICBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlclxuICBdIHtcbiAgICBjb25zdCB7IEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsIH0gPSB0aGlzO1xuICAgIHJldHVybiBbQWgsIEFsLCBCaCwgQmwsIENoLCBDbCwgRGgsIERsLCBFaCwgRWwsIEZoLCBGbCwgR2gsIEdsLCBIaCwgSGxdO1xuICB9XG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcm90ZWN0ZWQgc2V0KFxuICAgIEFoOiBudW1iZXIsIEFsOiBudW1iZXIsIEJoOiBudW1iZXIsIEJsOiBudW1iZXIsIENoOiBudW1iZXIsIENsOiBudW1iZXIsIERoOiBudW1iZXIsIERsOiBudW1iZXIsXG4gICAgRWg6IG51bWJlciwgRWw6IG51bWJlciwgRmg6IG51bWJlciwgRmw6IG51bWJlciwgR2g6IG51bWJlciwgR2w6IG51bWJlciwgSGg6IG51bWJlciwgSGw6IG51bWJlclxuICApOiB2b2lkIHtcbiAgICB0aGlzLkFoID0gQWggfCAwO1xuICAgIHRoaXMuQWwgPSBBbCB8IDA7XG4gICAgdGhpcy5CaCA9IEJoIHwgMDtcbiAgICB0aGlzLkJsID0gQmwgfCAwO1xuICAgIHRoaXMuQ2ggPSBDaCB8IDA7XG4gICAgdGhpcy5DbCA9IENsIHwgMDtcbiAgICB0aGlzLkRoID0gRGggfCAwO1xuICAgIHRoaXMuRGwgPSBEbCB8IDA7XG4gICAgdGhpcy5FaCA9IEVoIHwgMDtcbiAgICB0aGlzLkVsID0gRWwgfCAwO1xuICAgIHRoaXMuRmggPSBGaCB8IDA7XG4gICAgdGhpcy5GbCA9IEZsIHwgMDtcbiAgICB0aGlzLkdoID0gR2ggfCAwO1xuICAgIHRoaXMuR2wgPSBHbCB8IDA7XG4gICAgdGhpcy5IaCA9IEhoIHwgMDtcbiAgICB0aGlzLkhsID0gSGwgfCAwO1xuICB9XG4gIHByb3RlY3RlZCBwcm9jZXNzKHZpZXc6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEV4dGVuZCB0aGUgZmlyc3QgMTYgd29yZHMgaW50byB0aGUgcmVtYWluaW5nIDY0IHdvcmRzIHdbMTYuLjc5XSBvZiB0aGUgbWVzc2FnZSBzY2hlZHVsZSBhcnJheVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKywgb2Zmc2V0ICs9IDQpIHtcbiAgICAgIFNIQTUxMl9XX0hbaV0gPSB2aWV3LmdldFVpbnQzMihvZmZzZXQpO1xuICAgICAgU0hBNTEyX1dfTFtpXSA9IHZpZXcuZ2V0VWludDMyKChvZmZzZXQgKz0gNCkpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMTY7IGkgPCA4MDsgaSsrKSB7XG4gICAgICAvLyBzMCA6PSAod1tpLTE1XSByaWdodHJvdGF0ZSAxKSB4b3IgKHdbaS0xNV0gcmlnaHRyb3RhdGUgOCkgeG9yICh3W2ktMTVdIHJpZ2h0c2hpZnQgNylcbiAgICAgIGNvbnN0IFcxNWggPSBTSEE1MTJfV19IW2kgLSAxNV0gfCAwO1xuICAgICAgY29uc3QgVzE1bCA9IFNIQTUxMl9XX0xbaSAtIDE1XSB8IDA7XG4gICAgICBjb25zdCBzMGggPSB1NjQucm90clNIKFcxNWgsIFcxNWwsIDEpIF4gdTY0LnJvdHJTSChXMTVoLCBXMTVsLCA4KSBeIHU2NC5zaHJTSChXMTVoLCBXMTVsLCA3KTtcbiAgICAgIGNvbnN0IHMwbCA9IHU2NC5yb3RyU0woVzE1aCwgVzE1bCwgMSkgXiB1NjQucm90clNMKFcxNWgsIFcxNWwsIDgpIF4gdTY0LnNoclNMKFcxNWgsIFcxNWwsIDcpO1xuICAgICAgLy8gczEgOj0gKHdbaS0yXSByaWdodHJvdGF0ZSAxOSkgeG9yICh3W2ktMl0gcmlnaHRyb3RhdGUgNjEpIHhvciAod1tpLTJdIHJpZ2h0c2hpZnQgNilcbiAgICAgIGNvbnN0IFcyaCA9IFNIQTUxMl9XX0hbaSAtIDJdIHwgMDtcbiAgICAgIGNvbnN0IFcybCA9IFNIQTUxMl9XX0xbaSAtIDJdIHwgMDtcbiAgICAgIGNvbnN0IHMxaCA9IHU2NC5yb3RyU0goVzJoLCBXMmwsIDE5KSBeIHU2NC5yb3RyQkgoVzJoLCBXMmwsIDYxKSBeIHU2NC5zaHJTSChXMmgsIFcybCwgNik7XG4gICAgICBjb25zdCBzMWwgPSB1NjQucm90clNMKFcyaCwgVzJsLCAxOSkgXiB1NjQucm90ckJMKFcyaCwgVzJsLCA2MSkgXiB1NjQuc2hyU0woVzJoLCBXMmwsIDYpO1xuICAgICAgLy8gU0hBMjU2X1dbaV0gPSBzMCArIHMxICsgU0hBMjU2X1dbaSAtIDddICsgU0hBMjU2X1dbaSAtIDE2XTtcbiAgICAgIGNvbnN0IFNVTWwgPSB1NjQuYWRkNEwoczBsLCBzMWwsIFNIQTUxMl9XX0xbaSAtIDddLCBTSEE1MTJfV19MW2kgLSAxNl0pO1xuICAgICAgY29uc3QgU1VNaCA9IHU2NC5hZGQ0SChTVU1sLCBzMGgsIHMxaCwgU0hBNTEyX1dfSFtpIC0gN10sIFNIQTUxMl9XX0hbaSAtIDE2XSk7XG4gICAgICBTSEE1MTJfV19IW2ldID0gU1VNaCB8IDA7XG4gICAgICBTSEE1MTJfV19MW2ldID0gU1VNbCB8IDA7XG4gICAgfVxuICAgIGxldCB7IEFoLCBBbCwgQmgsIEJsLCBDaCwgQ2wsIERoLCBEbCwgRWgsIEVsLCBGaCwgRmwsIEdoLCBHbCwgSGgsIEhsIH0gPSB0aGlzO1xuICAgIC8vIENvbXByZXNzaW9uIGZ1bmN0aW9uIG1haW4gbG9vcCwgODAgcm91bmRzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4MDsgaSsrKSB7XG4gICAgICAvLyBTMSA6PSAoZSByaWdodHJvdGF0ZSAxNCkgeG9yIChlIHJpZ2h0cm90YXRlIDE4KSB4b3IgKGUgcmlnaHRyb3RhdGUgNDEpXG4gICAgICBjb25zdCBzaWdtYTFoID0gdTY0LnJvdHJTSChFaCwgRWwsIDE0KSBeIHU2NC5yb3RyU0goRWgsIEVsLCAxOCkgXiB1NjQucm90ckJIKEVoLCBFbCwgNDEpO1xuICAgICAgY29uc3Qgc2lnbWExbCA9IHU2NC5yb3RyU0woRWgsIEVsLCAxNCkgXiB1NjQucm90clNMKEVoLCBFbCwgMTgpIF4gdTY0LnJvdHJCTChFaCwgRWwsIDQxKTtcbiAgICAgIC8vY29uc3QgVDEgPSAoSCArIHNpZ21hMSArIENoaShFLCBGLCBHKSArIFNIQTI1Nl9LW2ldICsgU0hBMjU2X1dbaV0pIHwgMDtcbiAgICAgIGNvbnN0IENISWggPSAoRWggJiBGaCkgXiAofkVoICYgR2gpO1xuICAgICAgY29uc3QgQ0hJbCA9IChFbCAmIEZsKSBeICh+RWwgJiBHbCk7XG4gICAgICAvLyBUMSA9IEggKyBzaWdtYTEgKyBDaGkoRSwgRiwgRykgKyBTSEE1MTJfS1tpXSArIFNIQTUxMl9XW2ldXG4gICAgICAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IFQxbGwgPSB1NjQuYWRkNUwoSGwsIHNpZ21hMWwsIENISWwsIFNIQTUxMl9LbFtpXSwgU0hBNTEyX1dfTFtpXSk7XG4gICAgICBjb25zdCBUMWggPSB1NjQuYWRkNUgoVDFsbCwgSGgsIHNpZ21hMWgsIENISWgsIFNIQTUxMl9LaFtpXSwgU0hBNTEyX1dfSFtpXSk7XG4gICAgICBjb25zdCBUMWwgPSBUMWxsIHwgMDtcbiAgICAgIC8vIFMwIDo9IChhIHJpZ2h0cm90YXRlIDI4KSB4b3IgKGEgcmlnaHRyb3RhdGUgMzQpIHhvciAoYSByaWdodHJvdGF0ZSAzOSlcbiAgICAgIGNvbnN0IHNpZ21hMGggPSB1NjQucm90clNIKEFoLCBBbCwgMjgpIF4gdTY0LnJvdHJCSChBaCwgQWwsIDM0KSBeIHU2NC5yb3RyQkgoQWgsIEFsLCAzOSk7XG4gICAgICBjb25zdCBzaWdtYTBsID0gdTY0LnJvdHJTTChBaCwgQWwsIDI4KSBeIHU2NC5yb3RyQkwoQWgsIEFsLCAzNCkgXiB1NjQucm90ckJMKEFoLCBBbCwgMzkpO1xuICAgICAgY29uc3QgTUFKaCA9IChBaCAmIEJoKSBeIChBaCAmIENoKSBeIChCaCAmIENoKTtcbiAgICAgIGNvbnN0IE1BSmwgPSAoQWwgJiBCbCkgXiAoQWwgJiBDbCkgXiAoQmwgJiBDbCk7XG4gICAgICBIaCA9IEdoIHwgMDtcbiAgICAgIEhsID0gR2wgfCAwO1xuICAgICAgR2ggPSBGaCB8IDA7XG4gICAgICBHbCA9IEZsIHwgMDtcbiAgICAgIEZoID0gRWggfCAwO1xuICAgICAgRmwgPSBFbCB8IDA7XG4gICAgICAoeyBoOiBFaCwgbDogRWwgfSA9IHU2NC5hZGQoRGggfCAwLCBEbCB8IDAsIFQxaCB8IDAsIFQxbCB8IDApKTtcbiAgICAgIERoID0gQ2ggfCAwO1xuICAgICAgRGwgPSBDbCB8IDA7XG4gICAgICBDaCA9IEJoIHwgMDtcbiAgICAgIENsID0gQmwgfCAwO1xuICAgICAgQmggPSBBaCB8IDA7XG4gICAgICBCbCA9IEFsIHwgMDtcbiAgICAgIGNvbnN0IEFsbCA9IHU2NC5hZGQzTChUMWwsIHNpZ21hMGwsIE1BSmwpO1xuICAgICAgQWggPSB1NjQuYWRkM0goQWxsLCBUMWgsIHNpZ21hMGgsIE1BSmgpO1xuICAgICAgQWwgPSBBbGwgfCAwO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGNvbXByZXNzZWQgY2h1bmsgdG8gdGhlIGN1cnJlbnQgaGFzaCB2YWx1ZVxuICAgICh7IGg6IEFoLCBsOiBBbCB9ID0gdTY0LmFkZCh0aGlzLkFoIHwgMCwgdGhpcy5BbCB8IDAsIEFoIHwgMCwgQWwgfCAwKSk7XG4gICAgKHsgaDogQmgsIGw6IEJsIH0gPSB1NjQuYWRkKHRoaXMuQmggfCAwLCB0aGlzLkJsIHwgMCwgQmggfCAwLCBCbCB8IDApKTtcbiAgICAoeyBoOiBDaCwgbDogQ2wgfSA9IHU2NC5hZGQodGhpcy5DaCB8IDAsIHRoaXMuQ2wgfCAwLCBDaCB8IDAsIENsIHwgMCkpO1xuICAgICh7IGg6IERoLCBsOiBEbCB9ID0gdTY0LmFkZCh0aGlzLkRoIHwgMCwgdGhpcy5EbCB8IDAsIERoIHwgMCwgRGwgfCAwKSk7XG4gICAgKHsgaDogRWgsIGw6IEVsIH0gPSB1NjQuYWRkKHRoaXMuRWggfCAwLCB0aGlzLkVsIHwgMCwgRWggfCAwLCBFbCB8IDApKTtcbiAgICAoeyBoOiBGaCwgbDogRmwgfSA9IHU2NC5hZGQodGhpcy5GaCB8IDAsIHRoaXMuRmwgfCAwLCBGaCB8IDAsIEZsIHwgMCkpO1xuICAgICh7IGg6IEdoLCBsOiBHbCB9ID0gdTY0LmFkZCh0aGlzLkdoIHwgMCwgdGhpcy5HbCB8IDAsIEdoIHwgMCwgR2wgfCAwKSk7XG4gICAgKHsgaDogSGgsIGw6IEhsIH0gPSB1NjQuYWRkKHRoaXMuSGggfCAwLCB0aGlzLkhsIHwgMCwgSGggfCAwLCBIbCB8IDApKTtcbiAgICB0aGlzLnNldChBaCwgQWwsIEJoLCBCbCwgQ2gsIENsLCBEaCwgRGwsIEVoLCBFbCwgRmgsIEZsLCBHaCwgR2wsIEhoLCBIbCk7XG4gIH1cbiAgcHJvdGVjdGVkIHJvdW5kQ2xlYW4oKTogdm9pZCB7XG4gICAgY2xlYW4oU0hBNTEyX1dfSCwgU0hBNTEyX1dfTCk7XG4gIH1cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBjbGVhbih0aGlzLmJ1ZmZlcik7XG4gICAgdGhpcy5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItNTEyIGhhc2ggY2xhc3MuICovXG5leHBvcnQgY2xhc3MgX1NIQTUxMiBleHRlbmRzIFNIQTJfNjRCPF9TSEE1MTI+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBTSEE1MTJfSVZbMF0gfCAwO1xuICBwcm90ZWN0ZWQgQWw6IG51bWJlciA9IFNIQTUxMl9JVlsxXSB8IDA7XG4gIHByb3RlY3RlZCBCaDogbnVtYmVyID0gU0hBNTEyX0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBTSEE1MTJfSVZbM10gfCAwO1xuICBwcm90ZWN0ZWQgQ2g6IG51bWJlciA9IFNIQTUxMl9JVls0XSB8IDA7XG4gIHByb3RlY3RlZCBDbDogbnVtYmVyID0gU0hBNTEyX0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBTSEE1MTJfSVZbNl0gfCAwO1xuICBwcm90ZWN0ZWQgRGw6IG51bWJlciA9IFNIQTUxMl9JVls3XSB8IDA7XG4gIHByb3RlY3RlZCBFaDogbnVtYmVyID0gU0hBNTEyX0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBTSEE1MTJfSVZbOV0gfCAwO1xuICBwcm90ZWN0ZWQgRmg6IG51bWJlciA9IFNIQTUxMl9JVlsxMF0gfCAwO1xuICBwcm90ZWN0ZWQgRmw6IG51bWJlciA9IFNIQTUxMl9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFNIQTUxMl9JVlsxMl0gfCAwO1xuICBwcm90ZWN0ZWQgR2w6IG51bWJlciA9IFNIQTUxMl9JVlsxM10gfCAwO1xuICBwcm90ZWN0ZWQgSGg6IG51bWJlciA9IFNIQTUxMl9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFNIQTUxMl9JVlsxNV0gfCAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKDY0KTtcbiAgfVxufVxuXG4vKiogSW50ZXJuYWwgU0hBMi0zODQgaGFzaCBjbGFzcy4gKi9cbmV4cG9ydCBjbGFzcyBfU0hBMzg0IGV4dGVuZHMgU0hBMl82NEI8X1NIQTM4ND4ge1xuICBwcm90ZWN0ZWQgQWg6IG51bWJlciA9IFNIQTM4NF9JVlswXSB8IDA7XG4gIHByb3RlY3RlZCBBbDogbnVtYmVyID0gU0hBMzg0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBTSEEzODRfSVZbMl0gfCAwO1xuICBwcm90ZWN0ZWQgQmw6IG51bWJlciA9IFNIQTM4NF9JVlszXSB8IDA7XG4gIHByb3RlY3RlZCBDaDogbnVtYmVyID0gU0hBMzg0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBTSEEzODRfSVZbNV0gfCAwO1xuICBwcm90ZWN0ZWQgRGg6IG51bWJlciA9IFNIQTM4NF9JVls2XSB8IDA7XG4gIHByb3RlY3RlZCBEbDogbnVtYmVyID0gU0hBMzg0X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBTSEEzODRfSVZbOF0gfCAwO1xuICBwcm90ZWN0ZWQgRWw6IG51bWJlciA9IFNIQTM4NF9JVls5XSB8IDA7XG4gIHByb3RlY3RlZCBGaDogbnVtYmVyID0gU0hBMzg0X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gU0hBMzg0X0lWWzExXSB8IDA7XG4gIHByb3RlY3RlZCBHaDogbnVtYmVyID0gU0hBMzg0X0lWWzEyXSB8IDA7XG4gIHByb3RlY3RlZCBHbDogbnVtYmVyID0gU0hBMzg0X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gU0hBMzg0X0lWWzE0XSB8IDA7XG4gIHByb3RlY3RlZCBIbDogbnVtYmVyID0gU0hBMzg0X0lWWzE1XSB8IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoNDgpO1xuICB9XG59XG5cbi8qKlxuICogVHJ1bmNhdGVkIFNIQTUxMi8yNTYgYW5kIFNIQTUxMi8yMjQuXG4gKiBTSEE1MTJfSVYgaXMgWE9SZWQgd2l0aCAweGE1YTVhNWE1YTVhNWE1YTUsIHRoZW4gdXNlZCBhcyBcImludGVybWVkaWFyeVwiIElWIG9mIFNIQTUxMi90LlxuICogVGhlbiB0IGhhc2hlcyBzdHJpbmcgdG8gcHJvZHVjZSByZXN1bHQgSVYuXG4gKiBTZWUgYHRlc3QvbWlzYy9zaGEyLWdlbi1pdi5qc2AuXG4gKi9cblxuLyoqIFNIQTUxMi8yMjQgSVYgKi9cbmNvbnN0IFQyMjRfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4OGMzZDM3YzgsIDB4MTk1NDRkYTIsIDB4NzNlMTk5NjYsIDB4ODlkY2Q0ZDYsIDB4MWRmYWI3YWUsIDB4MzJmZjljODIsIDB4Njc5ZGQ1MTQsIDB4NTgyZjlmY2YsXG4gIDB4MGY2ZDJiNjksIDB4N2JkNDRkYTgsIDB4NzdlMzZmNzMsIDB4MDRjNDg5NDIsIDB4M2Y5ZDg1YTgsIDB4NmExZDM2YzgsIDB4MTExMmU2YWQsIDB4OTFkNjkyYTEsXG5dKTtcblxuLyoqIFNIQTUxMi8yNTYgSVYgKi9cbmNvbnN0IFQyNTZfSVYgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4MjIzMTIxOTQsIDB4ZmMyYmY3MmMsIDB4OWY1NTVmYTMsIDB4Yzg0YzY0YzIsIDB4MjM5M2I4NmIsIDB4NmY1M2IxNTEsIDB4OTYzODc3MTksIDB4NTk0MGVhYmQsXG4gIDB4OTYyODNlZTIsIDB4YTg4ZWZmZTMsIDB4YmU1ZTFlMjUsIDB4NTM4NjM5OTIsIDB4MmIwMTk5ZmMsIDB4MmM4NWI4YWEsIDB4MGViNzJkZGMsIDB4ODFjNTJjYTIsXG5dKTtcblxuLyoqIEludGVybmFsIFNIQTItNTEyLzIyNCBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTJfMjI0IGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMl8yMjQ+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBUMjI0X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBUMjI0X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBUMjI0X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBUMjI0X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBUMjI0X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBUMjI0X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBUMjI0X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBUMjI0X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBUMjI0X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBUMjI0X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBUMjI0X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gVDIyNF9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFQyMjRfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBUMjI0X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gVDIyNF9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFQyMjRfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigyOCk7XG4gIH1cbn1cblxuLyoqIEludGVybmFsIFNIQTItNTEyLzI1NiBoYXNoIGNsYXNzLiAqL1xuZXhwb3J0IGNsYXNzIF9TSEE1MTJfMjU2IGV4dGVuZHMgU0hBMl82NEI8X1NIQTUxMl8yNTY+IHtcbiAgcHJvdGVjdGVkIEFoOiBudW1iZXIgPSBUMjU2X0lWWzBdIHwgMDtcbiAgcHJvdGVjdGVkIEFsOiBudW1iZXIgPSBUMjU2X0lWWzFdIHwgMDtcbiAgcHJvdGVjdGVkIEJoOiBudW1iZXIgPSBUMjU2X0lWWzJdIHwgMDtcbiAgcHJvdGVjdGVkIEJsOiBudW1iZXIgPSBUMjU2X0lWWzNdIHwgMDtcbiAgcHJvdGVjdGVkIENoOiBudW1iZXIgPSBUMjU2X0lWWzRdIHwgMDtcbiAgcHJvdGVjdGVkIENsOiBudW1iZXIgPSBUMjU2X0lWWzVdIHwgMDtcbiAgcHJvdGVjdGVkIERoOiBudW1iZXIgPSBUMjU2X0lWWzZdIHwgMDtcbiAgcHJvdGVjdGVkIERsOiBudW1iZXIgPSBUMjU2X0lWWzddIHwgMDtcbiAgcHJvdGVjdGVkIEVoOiBudW1iZXIgPSBUMjU2X0lWWzhdIHwgMDtcbiAgcHJvdGVjdGVkIEVsOiBudW1iZXIgPSBUMjU2X0lWWzldIHwgMDtcbiAgcHJvdGVjdGVkIEZoOiBudW1iZXIgPSBUMjU2X0lWWzEwXSB8IDA7XG4gIHByb3RlY3RlZCBGbDogbnVtYmVyID0gVDI1Nl9JVlsxMV0gfCAwO1xuICBwcm90ZWN0ZWQgR2g6IG51bWJlciA9IFQyNTZfSVZbMTJdIHwgMDtcbiAgcHJvdGVjdGVkIEdsOiBudW1iZXIgPSBUMjU2X0lWWzEzXSB8IDA7XG4gIHByb3RlY3RlZCBIaDogbnVtYmVyID0gVDI1Nl9JVlsxNF0gfCAwO1xuICBwcm90ZWN0ZWQgSGw6IG51bWJlciA9IFQyNTZfSVZbMTVdIHwgMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigzMik7XG4gIH1cbn1cblxuLyoqXG4gKiBTSEEyLTI1NiBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuIEluIEpTIGl0J3MgdGhlIGZhc3Rlc3Q6IGV2ZW4gZmFzdGVyIHRoYW4gQmxha2UzLiBTb21lIGluZm86XG4gKlxuICogLSBUcnlpbmcgMl4xMjggaGFzaGVzIHdvdWxkIGdldCA1MCUgY2hhbmNlIG9mIGNvbGxpc2lvbiwgdXNpbmcgYmlydGhkYXkgYXR0YWNrLlxuICogLSBCVEMgbmV0d29yayBpcyBkb2luZyAyXjcwIGhhc2hlcy9zZWMgKDJeOTUgaGFzaGVzL3llYXIpIGFzIHBlciAyMDI1LlxuICogLSBFYWNoIHNoYTI1NiBoYXNoIGlzIGV4ZWN1dGluZyAyXjE4IGJpdCBvcGVyYXRpb25zLlxuICogLSBHb29kIDIwMjQgQVNJQ3MgY2FuIGRvIDIwMFRoL3NlYyB3aXRoIDM1MDAgd2F0dHMgb2YgcG93ZXIsIGNvcnJlc3BvbmRpbmcgdG8gMl4zNiBoYXNoZXMvam91bGUuXG4gKi9cbmV4cG9ydCBjb25zdCBzaGEyNTY6IENIYXNoPF9TSEEyNTY+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEEyNTYoKSxcbiAgLyogQF9fUFVSRV9fICovIG9pZE5pc3QoMHgwMSlcbik7XG4vKiogU0hBMi0yMjQgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0ICovXG5leHBvcnQgY29uc3Qgc2hhMjI0OiBDSGFzaDxfU0hBMjI0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMjI0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDQpXG4pO1xuXG4vKiogU0hBMi01MTIgaGFzaCBmdW5jdGlvbiBmcm9tIFJGQyA0NjM0LiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMjogQ0hhc2g8X1NIQTUxMj4gPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlSGFzaGVyKFxuICAoKSA9PiBuZXcgX1NIQTUxMigpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDAzKVxuKTtcbi8qKiBTSEEyLTM4NCBoYXNoIGZ1bmN0aW9uIGZyb20gUkZDIDQ2MzQuICovXG5leHBvcnQgY29uc3Qgc2hhMzg0OiBDSGFzaDxfU0hBMzg0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBMzg0KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDIpXG4pO1xuXG4vKipcbiAqIFNIQTItNTEyLzI1NiBcInRydW5jYXRlZFwiIGhhc2ggZnVuY3Rpb24sIHdpdGggaW1wcm92ZWQgcmVzaXN0YW5jZSB0byBsZW5ndGggZXh0ZW5zaW9uIGF0dGFja3MuXG4gKiBTZWUgdGhlIHBhcGVyIG9uIFt0cnVuY2F0ZWQgU0hBNTEyXShodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDEwLzU0OC5wZGYpLlxuICovXG5leHBvcnQgY29uc3Qgc2hhNTEyXzI1NjogQ0hhc2g8X1NIQTUxMl8yNTY+ID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUhhc2hlcihcbiAgKCkgPT4gbmV3IF9TSEE1MTJfMjU2KCksXG4gIC8qIEBfX1BVUkVfXyAqLyBvaWROaXN0KDB4MDYpXG4pO1xuLyoqXG4gKiBTSEEyLTUxMi8yMjQgXCJ0cnVuY2F0ZWRcIiBoYXNoIGZ1bmN0aW9uLCB3aXRoIGltcHJvdmVkIHJlc2lzdGFuY2UgdG8gbGVuZ3RoIGV4dGVuc2lvbiBhdHRhY2tzLlxuICogU2VlIHRoZSBwYXBlciBvbiBbdHJ1bmNhdGVkIFNIQTUxMl0oaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMC81NDgucGRmKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNoYTUxMl8yMjQ6IENIYXNoPF9TSEE1MTJfMjI0PiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVIYXNoZXIoXG4gICgpID0+IG5ldyBfU0hBNTEyXzIyNCgpLFxuICAvKiBAX19QVVJFX18gKi8gb2lkTmlzdCgweDA1KVxuKTtcbiIsICIvKipcbiAqIEludGVybmFsIE1lcmtsZS1EYW1nYXJkIGhhc2ggdXRpbHMuXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IGFieXRlcywgYWV4aXN0cywgYW91dHB1dCwgY2xlYW4sIGNyZWF0ZVZpZXcsIHR5cGUgSGFzaCB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vKiogQ2hvaWNlOiBhID8gYiA6IGMgKi9cbmV4cG9ydCBmdW5jdGlvbiBDaGkoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoYSAmIGIpIF4gKH5hICYgYyk7XG59XG5cbi8qKiBNYWpvcml0eSBmdW5jdGlvbiwgdHJ1ZSBpZiBhbnkgdHdvIGlucHV0cyBpcyB0cnVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1haihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIChhICYgYikgXiAoYSAmIGMpIF4gKGIgJiBjKTtcbn1cblxuLyoqXG4gKiBNZXJrbGUtRGFtZ2FyZCBoYXNoIGNvbnN0cnVjdGlvbiBiYXNlIGNsYXNzLlxuICogQ291bGQgYmUgdXNlZCB0byBjcmVhdGUgTUQ1LCBSSVBFTUQsIFNIQTEsIFNIQTIuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIYXNoTUQ8VCBleHRlbmRzIEhhc2hNRDxUPj4gaW1wbGVtZW50cyBIYXNoPFQ+IHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHByb2Nlc3MoYnVmOiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0KCk6IG51bWJlcltdO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0KC4uLmFyZ3M6IG51bWJlcltdKTogdm9pZDtcbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgcm91bmRDbGVhbigpOiB2b2lkO1xuXG4gIHJlYWRvbmx5IGJsb2NrTGVuOiBudW1iZXI7XG4gIHJlYWRvbmx5IG91dHB1dExlbjogbnVtYmVyO1xuICByZWFkb25seSBwYWRPZmZzZXQ6IG51bWJlcjtcbiAgcmVhZG9ubHkgaXNMRTogYm9vbGVhbjtcblxuICAvLyBGb3IgcGFydGlhbCB1cGRhdGVzIGxlc3MgdGhhbiBibG9jayBzaXplXG4gIHByb3RlY3RlZCBidWZmZXI6IFVpbnQ4QXJyYXk7XG4gIHByb3RlY3RlZCB2aWV3OiBEYXRhVmlldztcbiAgcHJvdGVjdGVkIGZpbmlzaGVkID0gZmFsc2U7XG4gIHByb3RlY3RlZCBsZW5ndGggPSAwO1xuICBwcm90ZWN0ZWQgcG9zID0gMDtcbiAgcHJvdGVjdGVkIGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKGJsb2NrTGVuOiBudW1iZXIsIG91dHB1dExlbjogbnVtYmVyLCBwYWRPZmZzZXQ6IG51bWJlciwgaXNMRTogYm9vbGVhbikge1xuICAgIHRoaXMuYmxvY2tMZW4gPSBibG9ja0xlbjtcbiAgICB0aGlzLm91dHB1dExlbiA9IG91dHB1dExlbjtcbiAgICB0aGlzLnBhZE9mZnNldCA9IHBhZE9mZnNldDtcbiAgICB0aGlzLmlzTEUgPSBpc0xFO1xuICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYmxvY2tMZW4pO1xuICAgIHRoaXMudmlldyA9IGNyZWF0ZVZpZXcodGhpcy5idWZmZXIpO1xuICB9XG4gIHVwZGF0ZShkYXRhOiBVaW50OEFycmF5KTogdGhpcyB7XG4gICAgYWV4aXN0cyh0aGlzKTtcbiAgICBhYnl0ZXMoZGF0YSk7XG4gICAgY29uc3QgeyB2aWV3LCBidWZmZXIsIGJsb2NrTGVuIH0gPSB0aGlzO1xuICAgIGNvbnN0IGxlbiA9IGRhdGEubGVuZ3RoO1xuICAgIGZvciAobGV0IHBvcyA9IDA7IHBvcyA8IGxlbjsgKSB7XG4gICAgICBjb25zdCB0YWtlID0gTWF0aC5taW4oYmxvY2tMZW4gLSB0aGlzLnBvcywgbGVuIC0gcG9zKTtcbiAgICAgIC8vIEZhc3QgcGF0aDogd2UgaGF2ZSBhdCBsZWFzdCBvbmUgYmxvY2sgaW4gaW5wdXQsIGNhc3QgaXQgdG8gdmlldyBhbmQgcHJvY2Vzc1xuICAgICAgaWYgKHRha2UgPT09IGJsb2NrTGVuKSB7XG4gICAgICAgIGNvbnN0IGRhdGFWaWV3ID0gY3JlYXRlVmlldyhkYXRhKTtcbiAgICAgICAgZm9yICg7IGJsb2NrTGVuIDw9IGxlbiAtIHBvczsgcG9zICs9IGJsb2NrTGVuKSB0aGlzLnByb2Nlc3MoZGF0YVZpZXcsIHBvcyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnVmZmVyLnNldChkYXRhLnN1YmFycmF5KHBvcywgcG9zICsgdGFrZSksIHRoaXMucG9zKTtcbiAgICAgIHRoaXMucG9zICs9IHRha2U7XG4gICAgICBwb3MgKz0gdGFrZTtcbiAgICAgIGlmICh0aGlzLnBvcyA9PT0gYmxvY2tMZW4pIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzKHZpZXcsIDApO1xuICAgICAgICB0aGlzLnBvcyA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGVuZ3RoICs9IGRhdGEubGVuZ3RoO1xuICAgIHRoaXMucm91bmRDbGVhbigpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGRpZ2VzdEludG8ob3V0OiBVaW50OEFycmF5KTogdm9pZCB7XG4gICAgYWV4aXN0cyh0aGlzKTtcbiAgICBhb3V0cHV0KG91dCwgdGhpcyk7XG4gICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgLy8gUGFkZGluZ1xuICAgIC8vIFdlIGNhbiBhdm9pZCBhbGxvY2F0aW9uIG9mIGJ1ZmZlciBmb3IgcGFkZGluZyBjb21wbGV0ZWx5IGlmIGl0XG4gICAgLy8gd2FzIHByZXZpb3VzbHkgbm90IGFsbG9jYXRlZCBoZXJlLiBCdXQgaXQgd29uJ3QgY2hhbmdlIHBlcmZvcm1hbmNlLlxuICAgIGNvbnN0IHsgYnVmZmVyLCB2aWV3LCBibG9ja0xlbiwgaXNMRSB9ID0gdGhpcztcbiAgICBsZXQgeyBwb3MgfSA9IHRoaXM7XG4gICAgLy8gYXBwZW5kIHRoZSBiaXQgJzEnIHRvIHRoZSBtZXNzYWdlXG4gICAgYnVmZmVyW3BvcysrXSA9IDBiMTAwMDAwMDA7XG4gICAgY2xlYW4odGhpcy5idWZmZXIuc3ViYXJyYXkocG9zKSk7XG4gICAgLy8gd2UgaGF2ZSBsZXNzIHRoYW4gcGFkT2Zmc2V0IGxlZnQgaW4gYnVmZmVyLCBzbyB3ZSBjYW5ub3QgcHV0IGxlbmd0aCBpblxuICAgIC8vIGN1cnJlbnQgYmxvY2ssIG5lZWQgcHJvY2VzcyBpdCBhbmQgcGFkIGFnYWluXG4gICAgaWYgKHRoaXMucGFkT2Zmc2V0ID4gYmxvY2tMZW4gLSBwb3MpIHtcbiAgICAgIHRoaXMucHJvY2Vzcyh2aWV3LCAwKTtcbiAgICAgIHBvcyA9IDA7XG4gICAgfVxuICAgIC8vIFBhZCB1bnRpbCBmdWxsIGJsb2NrIGJ5dGUgd2l0aCB6ZXJvc1xuICAgIGZvciAobGV0IGkgPSBwb3M7IGkgPCBibG9ja0xlbjsgaSsrKSBidWZmZXJbaV0gPSAwO1xuICAgIC8vIE5vdGU6IHNoYTUxMiByZXF1aXJlcyBsZW5ndGggdG8gYmUgMTI4Yml0IGludGVnZXIsIGJ1dCBsZW5ndGggaW4gSlMgd2lsbCBvdmVyZmxvdyBiZWZvcmUgdGhhdFxuICAgIC8vIFlvdSBuZWVkIHRvIHdyaXRlIGFyb3VuZCAyIGV4YWJ5dGVzICh1NjRfbWF4IC8gOCAvICgxMDI0Kio2KSkgZm9yIHRoaXMgdG8gaGFwcGVuLlxuICAgIC8vIFNvIHdlIGp1c3Qgd3JpdGUgbG93ZXN0IDY0IGJpdHMgb2YgdGhhdCB2YWx1ZS5cbiAgICB2aWV3LnNldEJpZ1VpbnQ2NChibG9ja0xlbiAtIDgsIEJpZ0ludCh0aGlzLmxlbmd0aCAqIDgpLCBpc0xFKTtcbiAgICB0aGlzLnByb2Nlc3ModmlldywgMCk7XG4gICAgY29uc3Qgb3ZpZXcgPSBjcmVhdGVWaWV3KG91dCk7XG4gICAgY29uc3QgbGVuID0gdGhpcy5vdXRwdXRMZW47XG4gICAgLy8gTk9URTogd2UgZG8gZGl2aXNpb24gYnkgNCBsYXRlciwgd2hpY2ggbXVzdCBiZSBmdXNlZCBpbiBzaW5nbGUgb3Agd2l0aCBtb2R1bG8gYnkgSklUXG4gICAgaWYgKGxlbiAlIDQpIHRocm93IG5ldyBFcnJvcignX3NoYTI6IG91dHB1dExlbiBtdXN0IGJlIGFsaWduZWQgdG8gMzJiaXQnKTtcbiAgICBjb25zdCBvdXRMZW4gPSBsZW4gLyA0O1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5nZXQoKTtcbiAgICBpZiAob3V0TGVuID4gc3RhdGUubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ19zaGEyOiBvdXRwdXRMZW4gYmlnZ2VyIHRoYW4gc3RhdGUnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dExlbjsgaSsrKSBvdmlldy5zZXRVaW50MzIoNCAqIGksIHN0YXRlW2ldLCBpc0xFKTtcbiAgfVxuICBkaWdlc3QoKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBidWZmZXIsIG91dHB1dExlbiB9ID0gdGhpcztcbiAgICB0aGlzLmRpZ2VzdEludG8oYnVmZmVyKTtcbiAgICBjb25zdCByZXMgPSBidWZmZXIuc2xpY2UoMCwgb3V0cHV0TGVuKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIF9jbG9uZUludG8odG8/OiBUKTogVCB7XG4gICAgdG8gfHw9IG5ldyAodGhpcy5jb25zdHJ1Y3RvciBhcyBhbnkpKCkgYXMgVDtcbiAgICB0by5zZXQoLi4udGhpcy5nZXQoKSk7XG4gICAgY29uc3QgeyBibG9ja0xlbiwgYnVmZmVyLCBsZW5ndGgsIGZpbmlzaGVkLCBkZXN0cm95ZWQsIHBvcyB9ID0gdGhpcztcbiAgICB0by5kZXN0cm95ZWQgPSBkZXN0cm95ZWQ7XG4gICAgdG8uZmluaXNoZWQgPSBmaW5pc2hlZDtcbiAgICB0by5sZW5ndGggPSBsZW5ndGg7XG4gICAgdG8ucG9zID0gcG9zO1xuICAgIGlmIChsZW5ndGggJSBibG9ja0xlbikgdG8uYnVmZmVyLnNldChidWZmZXIpO1xuICAgIHJldHVybiB0byBhcyB1bmtub3duIGFzIGFueTtcbiAgfVxuICBjbG9uZSgpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5fY2xvbmVJbnRvKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbml0aWFsIFNIQS0yIHN0YXRlOiBmcmFjdGlvbmFsIHBhcnRzIG9mIHNxdWFyZSByb290cyBvZiBmaXJzdCAxNiBwcmltZXMgMi4uNTMuXG4gKiBDaGVjayBvdXQgYHRlc3QvbWlzYy9zaGEyLWdlbi1pdi5qc2AgZm9yIHJlY29tcHV0YXRpb24gZ3VpZGUuXG4gKi9cblxuLyoqIEluaXRpYWwgU0hBMjU2IHN0YXRlLiBCaXRzIDAuLjMyIG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyLi4xOSAqL1xuZXhwb3J0IGNvbnN0IFNIQTI1Nl9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NmEwOWU2NjcsIDB4YmI2N2FlODUsIDB4M2M2ZWYzNzIsIDB4YTU0ZmY1M2EsIDB4NTEwZTUyN2YsIDB4OWIwNTY4OGMsIDB4MWY4M2Q5YWIsIDB4NWJlMGNkMTksXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBMjI0IHN0YXRlLiBCaXRzIDMyLi42NCBvZiBmcmFjIHBhcnQgb2Ygc3FydCBvZiBwcmltZXMgMjMuLjUzICovXG5leHBvcnQgY29uc3QgU0hBMjI0X0lWOiBVaW50MzJBcnJheSA9IC8qIEBfX1BVUkVfXyAqLyBVaW50MzJBcnJheS5mcm9tKFtcbiAgMHhjMTA1OWVkOCwgMHgzNjdjZDUwNywgMHgzMDcwZGQxNywgMHhmNzBlNTkzOSwgMHhmZmMwMGIzMSwgMHg2ODU4MTUxMSwgMHg2NGY5OGZhNywgMHhiZWZhNGZhNCxcbl0pO1xuXG4vKiogSW5pdGlhbCBTSEEzODQgc3RhdGUuIEJpdHMgMC4uNjQgb2YgZnJhYyBwYXJ0IG9mIHNxcnQgb2YgcHJpbWVzIDIzLi41MyAqL1xuZXhwb3J0IGNvbnN0IFNIQTM4NF9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4Y2JiYjlkNWQsIDB4YzEwNTllZDgsIDB4NjI5YTI5MmEsIDB4MzY3Y2Q1MDcsIDB4OTE1OTAxNWEsIDB4MzA3MGRkMTcsIDB4MTUyZmVjZDgsIDB4ZjcwZTU5MzksXG4gIDB4NjczMzI2NjcsIDB4ZmZjMDBiMzEsIDB4OGViNDRhODcsIDB4Njg1ODE1MTEsIDB4ZGIwYzJlMGQsIDB4NjRmOThmYTcsIDB4NDdiNTQ4MWQsIDB4YmVmYTRmYTQsXG5dKTtcblxuLyoqIEluaXRpYWwgU0hBNTEyIHN0YXRlLiBCaXRzIDAuLjY0IG9mIGZyYWMgcGFydCBvZiBzcXJ0IG9mIHByaW1lcyAyLi4xOSAqL1xuZXhwb3J0IGNvbnN0IFNIQTUxMl9JVjogVWludDMyQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gVWludDMyQXJyYXkuZnJvbShbXG4gIDB4NmEwOWU2NjcsIDB4ZjNiY2M5MDgsIDB4YmI2N2FlODUsIDB4ODRjYWE3M2IsIDB4M2M2ZWYzNzIsIDB4ZmU5NGY4MmIsIDB4YTU0ZmY1M2EsIDB4NWYxZDM2ZjEsXG4gIDB4NTEwZTUyN2YsIDB4YWRlNjgyZDEsIDB4OWIwNTY4OGMsIDB4MmIzZTZjMWYsIDB4MWY4M2Q5YWIsIDB4ZmI0MWJkNmIsIDB4NWJlMGNkMTksIDB4MTM3ZTIxNzksXG5dKTtcbiIsICIvKipcbiAqIEBtb2R1bGUgbm9zdHItY3J5cHRvLXV0aWxzXG4gKiBAZGVzY3JpcHRpb24gQ29yZSBjcnlwdG9ncmFwaGljIHV0aWxpdGllcyBmb3IgTm9zdHIgcHJvdG9jb2xcbiAqL1xuXG4vLyBDb3JlIHR5cGVzXG5leHBvcnQgdHlwZSB7XG4gIE5vc3RyRXZlbnQsXG4gIFVuc2lnbmVkTm9zdHJFdmVudCxcbiAgU2lnbmVkTm9zdHJFdmVudCxcbiAgTm9zdHJGaWx0ZXIsXG4gIE5vc3RyU3Vic2NyaXB0aW9uLFxuICBQdWJsaWNLZXksXG4gIEtleVBhaXIsXG4gIE5vc3RyTWVzc2FnZVR1cGxlLFxufSBmcm9tICcuL3R5cGVzJztcblxuLy8gRXZlbnQga2luZHMsIG1lc3NhZ2UgdHlwZXMsIGFuZCBOSVAtNDYgdHlwZXNcbmV4cG9ydCB7IE5vc3RyRXZlbnRLaW5kLCBOb3N0ck1lc3NhZ2VUeXBlLCBOaXA0Nk1ldGhvZCB9IGZyb20gJy4vdHlwZXMnO1xuZXhwb3J0IHR5cGUge1xuICBOaXA0NlJlcXVlc3QsXG4gIE5pcDQ2UmVzcG9uc2UsXG4gIE5pcDQ2U2Vzc2lvbixcbiAgTmlwNDZTZXNzaW9uSW5mbyxcbiAgQnVua2VyVVJJLFxuICBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0LFxufSBmcm9tICcuL3R5cGVzJztcblxuLy8gQ29yZSBjcnlwdG8gZnVuY3Rpb25zXG5leHBvcnQge1xuICBnZW5lcmF0ZUtleVBhaXIsXG4gIGdldFB1YmxpY0tleSxcbiAgZ2V0UHVibGljS2V5U3luYyxcbiAgdmFsaWRhdGVLZXlQYWlyLFxuICBjcmVhdGVFdmVudCxcbiAgc2lnbkV2ZW50LFxuICBmaW5hbGl6ZUV2ZW50LFxuICB2ZXJpZnlTaWduYXR1cmUsXG4gIGVuY3J5cHQsXG4gIGRlY3J5cHQsXG59IGZyb20gJy4vY3J5cHRvJztcblxuLy8gVmFsaWRhdGlvbiBmdW5jdGlvbnNcbmV4cG9ydCB7XG4gIHZhbGlkYXRlRXZlbnQsXG4gIHZhbGlkYXRlRXZlbnRJZCxcbiAgdmFsaWRhdGVFdmVudFNpZ25hdHVyZSxcbiAgdmFsaWRhdGVTaWduZWRFdmVudCxcbiAgdmFsaWRhdGVFdmVudEJhc2UsXG4gIHZhbGlkYXRlRmlsdGVyLFxuICB2YWxpZGF0ZVN1YnNjcmlwdGlvbixcbiAgdmFsaWRhdGVSZXNwb25zZSxcbn0gZnJvbSAnLi92YWxpZGF0aW9uJztcblxuLy8gRXZlbnQgZnVuY3Rpb25zXG5leHBvcnQge1xuICBjYWxjdWxhdGVFdmVudElkLFxufSBmcm9tICcuL2V2ZW50JztcblxuLy8gTklQLTA0IGVuY3J5cHRpb25cbmV4cG9ydCB7XG4gIGNvbXB1dGVTaGFyZWRTZWNyZXQsXG4gIGVuY3J5cHRNZXNzYWdlLFxuICBkZWNyeXB0TWVzc2FnZSxcbn0gZnJvbSAnLi9uaXBzL25pcC0wNCc7XG5cbi8vIFJlLWV4cG9ydCBOSVBzXG5leHBvcnQgKiBhcyBuaXAwMSBmcm9tICcuL25pcHMvbmlwLTAxJztcbmV4cG9ydCAqIGFzIG5pcDA0IGZyb20gJy4vbmlwcy9uaXAtMDQnO1xuZXhwb3J0ICogYXMgbmlwMTkgZnJvbSAnLi9uaXBzL25pcC0xOSc7XG5leHBvcnQgKiBhcyBuaXAyNiBmcm9tICcuL25pcHMvbmlwLTI2JztcbmV4cG9ydCAqIGFzIG5pcDQ0IGZyb20gJy4vbmlwcy9uaXAtNDQnO1xuZXhwb3J0ICogYXMgbmlwNDYgZnJvbSAnLi9uaXBzL25pcC00Nic7XG5leHBvcnQgKiBhcyBuaXA0OSBmcm9tICcuL25pcHMvbmlwLTQ5JztcblxuLy8gVXRpbHNcbmV4cG9ydCB7XG4gIGhleFRvQnl0ZXMsXG4gIGJ5dGVzVG9IZXgsXG4gIHV0ZjhUb0J5dGVzLFxuICBieXRlc1RvVXRmOCxcbn0gZnJvbSAnLi91dGlscy9lbmNvZGluZyc7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIHR5cGVzXG4gKiBAZGVzY3JpcHRpb24gVHlwZSBkZWZpbml0aW9ucyBmb3IgTm9zdHJcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleURldGFpbHMge1xuICBoZXg6IHN0cmluZztcbiAgYnl0ZXM6IFVpbnQ4QXJyYXk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5UGFpciB7XG4gIHByaXZhdGVLZXk6IHN0cmluZztcbiAgcHVibGljS2V5OiBQdWJsaWNLZXlEZXRhaWxzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyRXZlbnQge1xuICBraW5kOiBudW1iZXI7XG4gIGNyZWF0ZWRfYXQ6IG51bWJlcjtcbiAgdGFnczogc3RyaW5nW11bXTtcbiAgY29udGVudDogc3RyaW5nO1xuICBwdWJrZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaWduZWROb3N0ckV2ZW50IGV4dGVuZHMgTm9zdHJFdmVudCB7XG4gIGlkOiBzdHJpbmc7XG4gIHNpZzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1YmxpY0tleSB7XG4gIGhleDogc3RyaW5nO1xuICBieXRlcz86IFVpbnQ4QXJyYXk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XG4gIGlzVmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZW51bSBOb3N0ckV2ZW50S2luZCB7XG4gIFNFVF9NRVRBREFUQSA9IDAsXG4gIFRFWFRfTk9URSA9IDEsXG4gIFJFQ09NTUVORF9TRVJWRVIgPSAyLFxuICBDT05UQUNUX0xJU1QgPSAzLFxuICBFTkNSWVBURURfRElSRUNUX01FU1NBR0UgPSA0LFxuICBERUxFVEUgPSA1LFxuICBSRVBPU1QgPSA2LFxuICBSRUFDVElPTiA9IDcsXG4gIEJBREdFX0FXQVJEID0gOCxcbiAgQ0hBTk5FTF9DUkVBVEUgPSA0MCxcbiAgQ0hBTk5FTF9NRVRBREFUQSA9IDQxLFxuICBDSEFOTkVMX01FU1NBR0UgPSA0MixcbiAgQ0hBTk5FTF9ISURFX01FU1NBR0UgPSA0MyxcbiAgQ0hBTk5FTF9NVVRFX1VTRVIgPSA0NCxcbiAgQ0hBTk5FTF9SRVNFUlZFID0gNDUsXG4gIFJFUE9SVElORyA9IDE5ODQsXG4gIFpBUF9SRVFVRVNUID0gOTczNCxcbiAgWkFQID0gOTczNSxcbiAgTVVURV9MSVNUID0gMTAwMDAsXG4gIFBJTl9MSVNUID0gMTAwMDEsXG4gIFJFTEFZX0xJU1RfTUVUQURBVEEgPSAxMDAwMixcbiAgQ0xJRU5UX0FVVEggPSAyMjI0MixcbiAgQVVUSF9SRVNQT05TRSA9IDIyMjQzLFxuICBOT1NUUl9DT05ORUNUID0gMjQxMzMsXG4gIENBVEVHT1JJWkVEX1BFT1BMRSA9IDMwMDAwLFxuICBDQVRFR09SSVpFRF9CT09LTUFSS1MgPSAzMDAwMSxcbiAgUFJPRklMRV9CQURHRVMgPSAzMDAwOCxcbiAgQkFER0VfREVGSU5JVElPTiA9IDMwMDA5LFxuICBMT05HX0ZPUk0gPSAzMDAyMyxcbiAgQVBQTElDQVRJT05fU1BFQ0lGSUMgPSAzMDA3OFxufVxuXG4vKipcbiAqIFJlLWV4cG9ydCBhbGwgdHlwZXMgZnJvbSBiYXNlIG1vZHVsZVxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKi9cbmV4cG9ydCAqIGZyb20gJy4vYmFzZSc7XG5cbi8qKiBSZS1leHBvcnQgcHJvdG9jb2wgdHlwZXMgKi9cbmV4cG9ydCAqIGZyb20gJy4vcHJvdG9jb2wnO1xuXG4vKiogUmUtZXhwb3J0IG1lc3NhZ2UgdHlwZXMgKi9cbmV4cG9ydCAqIGZyb20gJy4vbWVzc2FnZXMnO1xuXG4vKiogUmUtZXhwb3J0IHR5cGUgZ3VhcmRzICovXG5leHBvcnQgKiBmcm9tICcuL2d1YXJkcyc7XG5cbi8vIFJlLWV4cG9ydCBOSVAtMTkgdHlwZXNcbmV4cG9ydCB0eXBlIHtcbiAgTmlwMTlEYXRhVHlwZVxufSBmcm9tICcuLi9uaXBzL25pcC0xOSc7XG5cbi8qKiBSZS1leHBvcnQgTklQLTQ2IHR5cGVzICovXG5leHBvcnQgKiBmcm9tICcuL25pcDQ2JztcbiIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvYmFzZVxuICogQGRlc2NyaXB0aW9uIENvcmUgdHlwZSBkZWZpbml0aW9ucyBmb3IgTm9zdHIgcHJvdG9jb2xcbiAqL1xuXG4vLyBLZXkgVHlwZXNcbmV4cG9ydCB0eXBlIFB1YmxpY0tleUhleCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFByaXZhdGVLZXlIZXggPSBzdHJpbmc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGljS2V5RGV0YWlscyB7XG4gIC8qKiBQdWJsaWMga2V5IGluIGhleCBmb3JtYXQgKi9cbiAgaGV4OiBzdHJpbmc7XG4gIC8qKiBOSVAtMDUgaWRlbnRpZmllciAqL1xuICBuaXAwNTogc3RyaW5nO1xuICAvKiogUHVibGljIGtleSBpbiBieXRlcyBmb3JtYXQgKi9cbiAgYnl0ZXM6IFVpbnQ4QXJyYXk7XG59XG5cbmV4cG9ydCB0eXBlIFB1YmxpY0tleSA9IFB1YmxpY0tleUhleCB8IFB1YmxpY0tleURldGFpbHM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5UGFpciB7XG4gIC8qKiBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0ICovXG4gIHByaXZhdGVLZXk6IFByaXZhdGVLZXlIZXg7XG4gIC8qKiBQdWJsaWMga2V5IGRldGFpbHMgKi9cbiAgcHVibGljS2V5OiBQdWJsaWNLZXlEZXRhaWxzO1xufVxuXG4vLyBFdmVudCBUeXBlc1xuZXhwb3J0IGVudW0gTm9zdHJFdmVudEtpbmQge1xuICAvLyBOSVAtMDE6IENvcmUgUHJvdG9jb2xcbiAgU0VUX01FVEFEQVRBID0gMCxcbiAgVEVYVF9OT1RFID0gMSxcbiAgUkVDT01NRU5EX1NFUlZFUiA9IDIsXG4gIENPTlRBQ1RTID0gMyxcbiAgRU5DUllQVEVEX0RJUkVDVF9NRVNTQUdFID0gNCxcbiAgRVZFTlRfREVMRVRJT04gPSA1LFxuICBSRVBPU1QgPSA2LFxuICBSRUFDVElPTiA9IDcsXG5cbiAgLy8gTklQLTI4OiBQdWJsaWMgQ2hhdFxuICBDSEFOTkVMX0NSRUFUSU9OID0gNDAsXG4gIENIQU5ORUxfTUVUQURBVEEgPSA0MSxcbiAgQ0hBTk5FTF9NRVNTQUdFID0gNDIsXG4gIENIQU5ORUxfSElERV9NRVNTQUdFID0gNDMsXG4gIENIQU5ORUxfTVVURV9VU0VSID0gNDQsXG5cbiAgLy8gTklQLTQyOiBBdXRoZW50aWNhdGlvblxuICBBVVRIID0gMjIyNDIsXG4gIEFVVEhfUkVTUE9OU0UgPSAyMjI0M1xufVxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBOb3N0ciBldmVudHMgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZU5vc3RyRXZlbnQge1xuICAvKiogRXZlbnQga2luZCBhcyBkZWZpbmVkIGluIE5JUHMgKi9cbiAga2luZDogbnVtYmVyO1xuICAvKiogQ29udGVudCBvZiB0aGUgZXZlbnQgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKiogQXJyYXkgb2YgdGFncyAqL1xuICB0YWdzOiBzdHJpbmdbXVtdO1xuICAvKiogVW5peCB0aW1lc3RhbXAgaW4gc2Vjb25kcyAqL1xuICBjcmVhdGVkX2F0OiBudW1iZXI7XG59XG5cbi8qKiBJbnRlcmZhY2UgZm9yIGV2ZW50cyB0aGF0IGhhdmVuJ3QgYmVlbiBzaWduZWQgeWV0ICovXG5leHBvcnQgaW50ZXJmYWNlIFVuc2lnbmVkTm9zdHJFdmVudCBleHRlbmRzIEJhc2VOb3N0ckV2ZW50IHtcbiAgLyoqIE9wdGlvbmFsIHB1YmxpYyBrZXkgKi9cbiAgcHVia2V5Pzogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBzaWduZWQgZXZlbnRzICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25lZE5vc3RyRXZlbnQgZXh0ZW5kcyBCYXNlTm9zdHJFdmVudCB7XG4gIC8qKiBQdWJsaWMga2V5IG9mIHRoZSBldmVudCBjcmVhdG9yICovXG4gIHB1YmtleTogc3RyaW5nO1xuICAvKiogRXZlbnQgSUQgKHNoYTI1NiBvZiB0aGUgc2VyaWFsaXplZCBldmVudCkgKi9cbiAgaWQ6IHN0cmluZztcbiAgLyoqIFNjaG5vcnIgc2lnbmF0dXJlIG9mIHRoZSBldmVudCBJRCAqL1xuICBzaWc6IHN0cmluZztcbn1cblxuLyoqIEFsaWFzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5ICovXG5leHBvcnQgdHlwZSBOb3N0ckV2ZW50ID0gU2lnbmVkTm9zdHJFdmVudDtcblxuLyoqIFR5cGUgZm9yIGNyZWF0aW5nIG5ldyBldmVudHMgKi9cbmV4cG9ydCB0eXBlIFVuc2lnbmVkRXZlbnQgPSBPbWl0PE5vc3RyRXZlbnQsICdpZCcgfCAnc2lnJz47XG5cbi8vIEZpbHRlciBUeXBlc1xuZXhwb3J0IGludGVyZmFjZSBOb3N0ckZpbHRlciB7XG4gIGlkcz86IHN0cmluZ1tdO1xuICBhdXRob3JzPzogc3RyaW5nW107XG4gIGtpbmRzPzogTm9zdHJFdmVudEtpbmRbXTtcbiAgc2luY2U/OiBudW1iZXI7XG4gIHVudGlsPzogbnVtYmVyO1xuICBsaW1pdD86IG51bWJlcjtcbiAgJyNlJz86IHN0cmluZ1tdO1xuICAnI3AnPzogc3RyaW5nW107XG4gIHNlYXJjaD86IHN0cmluZztcbiAgLyoqIFN1cHBvcnQgZm9yIGFyYml0cmFyeSB0YWdzIChOSVAtMTIpICovXG4gIFtrZXk6IGAjJHtzdHJpbmd9YF06IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyU3Vic2NyaXB0aW9uIHtcbiAgaWQ6IHN0cmluZztcbiAgZmlsdGVyczogTm9zdHJGaWx0ZXJbXTtcbn1cblxuLy8gTWVzc2FnZSBUeXBlc1xuZXhwb3J0IGVudW0gTm9zdHJNZXNzYWdlVHlwZSB7XG4gIEVWRU5UID0gJ0VWRU5UJyxcbiAgTk9USUNFID0gJ05PVElDRScsXG4gIE9LID0gJ09LJyxcbiAgRU9TRSA9ICdFT1NFJyxcbiAgUkVRID0gJ1JFUScsXG4gIENMT1NFID0gJ0NMT1NFJyxcbiAgQVVUSCA9ICdBVVRIJ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyTWVzc2FnZSB7XG4gIHR5cGU6IE5vc3RyTWVzc2FnZVR5cGU7XG4gIGV2ZW50PzogU2lnbmVkTm9zdHJFdmVudDtcbiAgc3Vic2NyaXB0aW9uSWQ/OiBzdHJpbmc7XG4gIGZpbHRlcnM/OiBOb3N0ckZpbHRlcltdO1xuICBldmVudElkPzogc3RyaW5nO1xuICBhY2NlcHRlZD86IGJvb2xlYW47XG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG4gIGNvdW50PzogbnVtYmVyO1xuICBwYXlsb2FkPzogc3RyaW5nIHwgKHN0cmluZyB8IGJvb2xlYW4pW107ICBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBOb3N0clJlc3BvbnNlIHtcbiAgdHlwZTogTm9zdHJNZXNzYWdlVHlwZTtcbiAgZXZlbnQ/OiBTaWduZWROb3N0ckV2ZW50O1xuICBzdWJzY3JpcHRpb25JZD86IHN0cmluZztcbiAgZmlsdGVycz86IE5vc3RyRmlsdGVyW107XG4gIGV2ZW50SWQ/OiBzdHJpbmc7XG4gIGFjY2VwdGVkPzogYm9vbGVhbjtcbiAgbWVzc2FnZT86IHN0cmluZztcbiAgY291bnQ/OiBudW1iZXI7XG59XG5cbi8vIFV0aWxpdHkgVHlwZXNcbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvblJlc3VsdCB7XG4gIGlzVmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vc3RyRXJyb3Ige1xuICBjb2RlOiBzdHJpbmc7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlcy9wcm90b2NvbFxuICogQGRlc2NyaXB0aW9uIE5vc3RyIHByb3RvY29sIHR5cGVzXG4gKi9cblxuaW1wb3J0IHR5cGUgeyBcbiAgTm9zdHJGaWx0ZXIsIFxuICBQdWJsaWNLZXksXG4gIE5vc3RyTWVzc2FnZVR5cGUsXG4gIE5vc3RyU3Vic2NyaXB0aW9uLFxuICBOb3N0clJlc3BvbnNlLFxuICBOb3N0ckVycm9yXG59IGZyb20gJy4vYmFzZS5qcyc7XG5cbi8vIFJlLWV4cG9ydCB0eXBlcyBmcm9tIGJhc2UgdGhhdCBhcmUgdXNlZCBpbiB0aGlzIG1vZHVsZVxuZXhwb3J0IHR5cGUgeyBcbiAgTm9zdHJGaWx0ZXIsIFxuICBQdWJsaWNLZXksXG4gIE5vc3RyTWVzc2FnZVR5cGUsXG4gIE5vc3RyU3Vic2NyaXB0aW9uLFxuICBOb3N0clJlc3BvbnNlLFxuICBOb3N0ckVycm9yXG59O1xuIiwgImV4cG9ydCB7fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lc3NhZ2VzLmpzLm1hcCIsICIvKipcbiAqIEBtb2R1bGUgdHlwZXMvZ3VhcmRzXG4gKiBAZGVzY3JpcHRpb24gVHlwZSBndWFyZCBmdW5jdGlvbnMgZm9yIE5vc3RyIHR5cGVzXG4gKi9cblxuaW1wb3J0IHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCwgTm9zdHJGaWx0ZXIsIE5vc3RyU3Vic2NyaXB0aW9uLCBOb3N0clJlc3BvbnNlLCBOb3N0ckVycm9yIH0gZnJvbSAnLi9iYXNlJztcblxuLyoqXG4gKiBUeXBlIGd1YXJkIGZvciBOb3N0ckV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05vc3RyRXZlbnQoZXZlbnQ6IHVua25vd24pOiBldmVudCBpcyBOb3N0ckV2ZW50IHtcbiAgaWYgKHR5cGVvZiBldmVudCAhPT0gJ29iamVjdCcgfHwgZXZlbnQgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCB2YWxpZEV2ZW50ID0gZXZlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLy8gUmVxdWlyZWQgZmllbGRzXG4gIGlmICh0eXBlb2YgdmFsaWRFdmVudC5raW5kICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWxpZEV2ZW50LmtpbmQpIHx8IHZhbGlkRXZlbnQua2luZCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQuY29udGVudCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbGlkRXZlbnQuY3JlYXRlZF9hdCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsaWRFdmVudC5jcmVhdGVkX2F0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHB1YmtleSBzdHJ1Y3R1cmVcbiAgaWYgKHZhbGlkRXZlbnQucHVia2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIHZhbGlkRXZlbnQucHVia2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF2YWxpZEV2ZW50LnB1YmtleSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsaWRFdmVudC5wdWJrZXkgPT09ICdvYmplY3QnICYmIHZhbGlkRXZlbnQucHVia2V5ICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBwdWJrZXkgPSB2YWxpZEV2ZW50LnB1YmtleSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGlmICh0eXBlb2YgcHVia2V5LmhleCAhPT0gJ3N0cmluZycgfHwgIXB1YmtleS5oZXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgdGFncyBhcnJheVxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsaWRFdmVudC50YWdzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIHRhZyBhcnJheSBlbGVtZW50c1xuICBpZiAoIXZhbGlkRXZlbnQudGFncy5ldmVyeSh0YWcgPT4gQXJyYXkuaXNBcnJheSh0YWcpICYmIHRhZy5ldmVyeShpdGVtID0+IHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgU2lnbmVkTm9zdHJFdmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTaWduZWROb3N0ckV2ZW50KGV2ZW50OiB1bmtub3duKTogZXZlbnQgaXMgU2lnbmVkTm9zdHJFdmVudCB7XG4gIGlmICghZXZlbnQgfHwgdHlwZW9mIGV2ZW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHNpZ25lZEV2ZW50ID0gZXZlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzIGZyb20gTm9zdHJFdmVudFxuICBpZiAoIWlzTm9zdHJFdmVudChldmVudCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDaGVjayBwdWJrZXkgaXMgcHJlc2VudCBhbmQgdmFsaWRcbiAgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5wdWJrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKCFzaWduZWRFdmVudC5wdWJrZXkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNpZ25lZEV2ZW50LnB1YmtleSA9PT0gJ29iamVjdCcgJiYgc2lnbmVkRXZlbnQucHVia2V5ICE9PSBudWxsKSB7XG4gICAgY29uc3QgcHVia2V5ID0gc2lnbmVkRXZlbnQucHVia2V5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIGlmICh0eXBlb2YgcHVia2V5LmhleCAhPT0gJ3N0cmluZycgfHwgIXB1YmtleS5oZXgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWQgZmllbGRcbiAgaWYgKHR5cGVvZiBzaWduZWRFdmVudC5pZCAhPT0gJ3N0cmluZycgfHwgIXNpZ25lZEV2ZW50LmlkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgc2lnIGZpZWxkXG4gIGlmICh0eXBlb2Ygc2lnbmVkRXZlbnQuc2lnICE9PSAnc3RyaW5nJyB8fCAhc2lnbmVkRXZlbnQuc2lnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJGaWx0ZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJGaWx0ZXIoZmlsdGVyOiB1bmtub3duKTogZmlsdGVyIGlzIE5vc3RyRmlsdGVyIHtcbiAgaWYgKHR5cGVvZiBmaWx0ZXIgIT09ICdvYmplY3QnIHx8IGZpbHRlciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkRmlsdGVyID0gZmlsdGVyIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCB2YWxpZEtleXMgPSBbJ2lkcycsICdhdXRob3JzJywgJ2tpbmRzJywgJ3NpbmNlJywgJ3VudGlsJywgJ2xpbWl0JywgJyNlJywgJyNwJywgJyN0J107XG4gIGNvbnN0IGZpbHRlcktleXMgPSBPYmplY3Qua2V5cyh2YWxpZEZpbHRlcik7XG5cbiAgLy8gQ2hlY2sgaWYgYWxsIGtleXMgaW4gdGhlIGZpbHRlciBhcmUgdmFsaWRcbiAgaWYgKCFmaWx0ZXJLZXlzLmV2ZXJ5KGtleSA9PiB2YWxpZEtleXMuaW5jbHVkZXMoa2V5KSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBhcnJheSBmaWVsZHNcbiAgaWYgKHZhbGlkRmlsdGVyLmlkcyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5pZHMpIHx8ICF2YWxpZEZpbHRlci5pZHMuZXZlcnkoaWQgPT4gdHlwZW9mIGlkID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlci5hdXRob3JzICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyLmF1dGhvcnMpIHx8ICF2YWxpZEZpbHRlci5hdXRob3JzLmV2ZXJ5KGF1dGhvciA9PiB0eXBlb2YgYXV0aG9yID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlci5raW5kcyAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlci5raW5kcykgfHwgIXZhbGlkRmlsdGVyLmtpbmRzLmV2ZXJ5KGtpbmQgPT4gdHlwZW9mIGtpbmQgPT09ICdudW1iZXInICYmIE51bWJlci5pc0ludGVnZXIoa2luZCkgJiYga2luZCA+PSAwKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbGlkRmlsdGVyWycjZSddICE9PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KHZhbGlkRmlsdGVyWycjZSddKSB8fCAhdmFsaWRGaWx0ZXJbJyNlJ10uZXZlcnkoZSA9PiB0eXBlb2YgZSA9PT0gJ3N0cmluZycpKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsaWRGaWx0ZXJbJyNwJ10gIT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkodmFsaWRGaWx0ZXJbJyNwJ10pIHx8ICF2YWxpZEZpbHRlclsnI3AnXS5ldmVyeShwID0+IHR5cGVvZiBwID09PSAnc3RyaW5nJykpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh2YWxpZEZpbHRlclsnI3QnXSAhPT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheSh2YWxpZEZpbHRlclsnI3QnXSkgfHwgIXZhbGlkRmlsdGVyWycjdCddLmV2ZXJ5KHQgPT4gdHlwZW9mIHQgPT09ICdzdHJpbmcnKSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBudW1iZXIgZmllbGRzXG4gIGlmICh2YWxpZEZpbHRlci5zaW5jZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZEZpbHRlci5zaW5jZSAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkRmlsdGVyLnVudGlsICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkRmlsdGVyLnVudGlsICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsaWRGaWx0ZXIubGltaXQgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdmFsaWRGaWx0ZXIubGltaXQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJTdWJzY3JpcHRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9zdHJTdWJzY3JpcHRpb24oc3ViOiB1bmtub3duKTogc3ViIGlzIE5vc3RyU3Vic2NyaXB0aW9uIHtcbiAgaWYgKHR5cGVvZiBzdWIgIT09ICdvYmplY3QnIHx8IHN1YiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHZhbGlkU3ViID0gc3ViIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmICh0eXBlb2YgdmFsaWRTdWIuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbGlkU3ViLmZpbHRlcnMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCF2YWxpZFN1Yi5maWx0ZXJzLmV2ZXJ5KGZpbHRlciA9PiBpc05vc3RyRmlsdGVyKGZpbHRlcikpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJSZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0clJlc3BvbnNlKHJlc3BvbnNlOiB1bmtub3duKTogcmVzcG9uc2UgaXMgTm9zdHJSZXNwb25zZSB7XG4gIGlmICh0eXBlb2YgcmVzcG9uc2UgIT09ICdvYmplY3QnIHx8IHJlc3BvbnNlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRSZXNwb25zZSA9IHJlc3BvbnNlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmICh0eXBlb2YgdmFsaWRSZXNwb25zZS50eXBlICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh2YWxpZFJlc3BvbnNlLnN1YnNjcmlwdGlvbklkICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHZhbGlkUmVzcG9uc2Uuc3Vic2NyaXB0aW9uSWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHZhbGlkUmVzcG9uc2UuZXZlbnQgIT09IHVuZGVmaW5lZCAmJiAhaXNTaWduZWROb3N0ckV2ZW50KHZhbGlkUmVzcG9uc2UuZXZlbnQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHZhbGlkUmVzcG9uc2UubWVzc2FnZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB2YWxpZFJlc3BvbnNlLm1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogVHlwZSBndWFyZCBmb3IgTm9zdHJFcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb3N0ckVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgTm9zdHJFcnJvciB7XG4gIGlmICh0eXBlb2YgZXJyb3IgIT09ICdvYmplY3QnIHx8IGVycm9yID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgdmFsaWRFcnJvciA9IGVycm9yIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHZhbGlkRXJyb3IudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2YgdmFsaWRFcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJ1xuICApO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSB0eXBlcy9uaXA0NlxuICogQGRlc2NyaXB0aW9uIFR5cGUgZGVmaW5pdGlvbnMgZm9yIE5JUC00NiAoTm9zdHIgQ29ubmVjdCAvIFJlbW90ZSBTaWduaW5nKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80Ni5tZFxuICovXG5cbi8qKlxuICogTklQLTQ2IHJlbW90ZSBzaWduaW5nIG1ldGhvZHNcbiAqL1xuZXhwb3J0IGVudW0gTmlwNDZNZXRob2Qge1xuICBDT05ORUNUID0gJ2Nvbm5lY3QnLFxuICBQSU5HID0gJ3BpbmcnLFxuICBHRVRfUFVCTElDX0tFWSA9ICdnZXRfcHVibGljX2tleScsXG4gIFNJR05fRVZFTlQgPSAnc2lnbl9ldmVudCcsXG4gIE5JUDA0X0VOQ1JZUFQgPSAnbmlwMDRfZW5jcnlwdCcsXG4gIE5JUDA0X0RFQ1JZUFQgPSAnbmlwMDRfZGVjcnlwdCcsXG4gIE5JUDQ0X0VOQ1JZUFQgPSAnbmlwNDRfZW5jcnlwdCcsXG4gIE5JUDQ0X0RFQ1JZUFQgPSAnbmlwNDRfZGVjcnlwdCcsXG4gIEdFVF9SRUxBWVMgPSAnZ2V0X3JlbGF5cycsXG59XG5cbi8qKlxuICogUGFyc2VkIGJ1bmtlcjovLyBVUklcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdW5rZXJVUkkge1xuICAvKiogUmVtb3RlIHNpZ25lcidzIHB1YmxpYyBrZXkgKGhleCkgKi9cbiAgcmVtb3RlUHVia2V5OiBzdHJpbmc7XG4gIC8qKiBSZWxheSBVUkxzIGZvciBjb21tdW5pY2F0aW9uICovXG4gIHJlbGF5czogc3RyaW5nW107XG4gIC8qKiBPcHRpb25hbCBzZWNyZXQgZm9yIGluaXRpYWwgY29ubmVjdGlvbiAqL1xuICBzZWNyZXQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogTklQLTQ2IEpTT04tUlBDIHJlcXVlc3QgKGNsaWVudCAtPiBzaWduZXIpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmlwNDZSZXF1ZXN0IHtcbiAgaWQ6IHN0cmluZztcbiAgbWV0aG9kOiBOaXA0Nk1ldGhvZCB8IHN0cmluZztcbiAgcGFyYW1zOiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBOSVAtNDYgSlNPTi1SUEMgcmVzcG9uc2UgKHNpZ25lciAtPiBjbGllbnQpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmlwNDZSZXNwb25zZSB7XG4gIGlkOiBzdHJpbmc7XG4gIHJlc3VsdD86IHN0cmluZztcbiAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBOSVAtNDYgc2Vzc2lvbiBjb250YWluaW5nIHRoZSBlcGhlbWVyYWwga2V5cGFpciBhbmQgY29udmVyc2F0aW9uIGtleVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2U2Vzc2lvbiB7XG4gIC8qKiBDbGllbnQncyBlcGhlbWVyYWwgcHJpdmF0ZSBrZXkgKGhleCkgKi9cbiAgY2xpZW50U2VjcmV0S2V5OiBzdHJpbmc7XG4gIC8qKiBDbGllbnQncyBlcGhlbWVyYWwgcHVibGljIGtleSAoaGV4KSAqL1xuICBjbGllbnRQdWJrZXk6IHN0cmluZztcbiAgLyoqIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpICovXG4gIHJlbW90ZVB1YmtleTogc3RyaW5nO1xuICAvKiogTklQLTQ0IGNvbnZlcnNhdGlvbiBrZXkgKGRlcml2ZWQgZnJvbSBFQ0RIKSAqL1xuICBjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXk7XG59XG5cbi8qKlxuICogUHVibGljIHNlc3Npb24gaW5mbyAoc2FmZSB0byBleHBvc2U7IGV4Y2x1ZGVzIHByaXZhdGUga2V5IGFuZCBjb252ZXJzYXRpb24ga2V5KVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5pcDQ2U2Vzc2lvbkluZm8ge1xuICBjbGllbnRQdWJrZXk6IHN0cmluZztcbiAgcmVtb3RlUHVia2V5OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIHZhbGlkYXRpbmcgYSBidW5rZXI6Ly8gVVJJXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQnVua2VyVmFsaWRhdGlvblJlc3VsdCB7XG4gIGlzVmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xuICB1cmk/OiBCdW5rZXJVUkk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGNyeXB0b1xuICogQGRlc2NyaXB0aW9uIENyeXB0b2dyYXBoaWMgdXRpbGl0aWVzIGZvciBOb3N0clxuICogXG4gKiBJTVBPUlRBTlQ6IE5vc3RyIFByb3RvY29sIENyeXB0b2dyYXBoaWMgUmVxdWlyZW1lbnRzXG4gKiBXaGlsZSBzZWNwMjU2azEgaXMgdGhlIHVuZGVybHlpbmcgZWxsaXB0aWMgY3VydmUgdXNlZCBieSBOb3N0ciwgdGhlIHByb3RvY29sIHNwZWNpZmljYWxseVxuICogcmVxdWlyZXMgc2Nobm9yciBzaWduYXR1cmVzIGFzIGRlZmluZWQgaW4gTklQLTAxLiBUaGlzIG1lYW5zOlxuICogXG4gKiAxLiBBbHdheXMgdXNlIHNjaG5vcnItc3BlY2lmaWMgZnVuY3Rpb25zOlxuICogICAgLSBzY2hub3JyLmdldFB1YmxpY0tleSgpIGZvciBwdWJsaWMga2V5IGdlbmVyYXRpb25cbiAqICAgIC0gc2Nobm9yci5zaWduKCkgZm9yIHNpZ25pbmdcbiAqICAgIC0gc2Nobm9yci52ZXJpZnkoKSBmb3IgdmVyaWZpY2F0aW9uXG4gKiBcbiAqIDIuIEF2b2lkIHVzaW5nIHNlY3AyNTZrMSBmdW5jdGlvbnMgZGlyZWN0bHk6XG4gKiAgICAtIERPTidUIHVzZSBzZWNwMjU2azEuZ2V0UHVibGljS2V5KClcbiAqICAgIC0gRE9OJ1QgdXNlIHNlY3AyNTZrMS5zaWduKClcbiAqICAgIC0gRE9OJ1QgdXNlIHNlY3AyNTZrMS52ZXJpZnkoKVxuICogXG4gKiBXaGlsZSBib3RoIG1pZ2h0IHdvcmsgaW4gc29tZSBjYXNlcyAoYXMgdGhleSB1c2UgdGhlIHNhbWUgY3VydmUpLCB0aGUgc2Nobm9yciBzaWduYXR1cmVcbiAqIHNjaGVtZSBoYXMgc3BlY2lmaWMgcmVxdWlyZW1lbnRzIGZvciBrZXkgYW5kIHNpZ25hdHVyZSBmb3JtYXRzIHRoYXQgYXJlbid0IGd1YXJhbnRlZWRcbiAqIHdoZW4gdXNpbmcgdGhlIGxvd2VyLWxldmVsIHNlY3AyNTZrMSBmdW5jdGlvbnMgZGlyZWN0bHkuXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciwgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgYnl0ZXNUb0hleCwgaGV4VG9CeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBLZXlQYWlyLCBQdWJsaWNLZXlEZXRhaWxzLCBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50LCBQdWJsaWNLZXkgfSBmcm9tICcuL3R5cGVzL2luZGV4JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IGJ5dGVzVG9CYXNlNjQsIGJhc2U2NFRvQnl0ZXMgfSBmcm9tICcuL2VuY29kaW5nL2Jhc2U2NCc7XG5cblxuLyoqXG4gKiBDdXN0b20gY3J5cHRvIGludGVyZmFjZSBmb3IgY3Jvc3MtcGxhdGZvcm0gY29tcGF0aWJpbGl0eVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENyeXB0b1N1YnRsZSB7XG4gIHN1YnRsZToge1xuICAgIGdlbmVyYXRlS2V5KFxuICAgICAgYWxnb3JpdGhtOiBSc2FIYXNoZWRLZXlHZW5QYXJhbXMgfCBFY0tleUdlblBhcmFtcyxcbiAgICAgIGV4dHJhY3RhYmxlOiBib29sZWFuLFxuICAgICAga2V5VXNhZ2VzOiByZWFkb25seSBLZXlVc2FnZVtdXG4gICAgKTogUHJvbWlzZTxDcnlwdG9LZXlQYWlyPjtcbiAgICBpbXBvcnRLZXkoXG4gICAgICBmb3JtYXQ6ICdyYXcnIHwgJ3BrY3M4JyB8ICdzcGtpJyxcbiAgICAgIGtleURhdGE6IEFycmF5QnVmZmVyLFxuICAgICAgYWxnb3JpdGhtOiBSc2FIYXNoZWRJbXBvcnRQYXJhbXMgfCBFY0tleUltcG9ydFBhcmFtcyB8IEFlc0tleUFsZ29yaXRobSxcbiAgICAgIGV4dHJhY3RhYmxlOiBib29sZWFuLFxuICAgICAga2V5VXNhZ2VzOiByZWFkb25seSBLZXlVc2FnZVtdXG4gICAgKTogUHJvbWlzZTxDcnlwdG9LZXk+O1xuICAgIGVuY3J5cHQoXG4gICAgICBhbGdvcml0aG06IHsgbmFtZTogc3RyaW5nOyBpdjogVWludDhBcnJheSB9LFxuICAgICAga2V5OiBDcnlwdG9LZXksXG4gICAgICBkYXRhOiBBcnJheUJ1ZmZlclxuICAgICk6IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICAgIGRlY3J5cHQoXG4gICAgICBhbGdvcml0aG06IHsgbmFtZTogc3RyaW5nOyBpdjogVWludDhBcnJheSB9LFxuICAgICAga2V5OiBDcnlwdG9LZXksXG4gICAgICBkYXRhOiBBcnJheUJ1ZmZlclxuICAgICk6IFByb21pc2U8QXJyYXlCdWZmZXI+O1xuICB9O1xuICBnZXRSYW5kb21WYWx1ZXM8VCBleHRlbmRzIFVpbnQ4QXJyYXkgfCBJbnQ4QXJyYXkgfCBVaW50MTZBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MzJBcnJheSB8IEludDMyQXJyYXk+KGFycmF5OiBUKTogVDtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxuICBpbnRlcmZhY2UgR2xvYmFsIHtcbiAgICBjcnlwdG86IENyeXB0b1N1YnRsZTtcbiAgfVxufVxuXG4vLyBHZXQgdGhlIGFwcHJvcHJpYXRlIGNyeXB0byBpbXBsZW1lbnRhdGlvblxuY29uc3QgZ2V0Q3J5cHRvID0gYXN5bmMgKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlPiA9PiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY3J5cHRvKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jcnlwdG87XG4gIH1cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG8pIHtcbiAgICByZXR1cm4gKGdsb2JhbCBhcyBHbG9iYWwpLmNyeXB0bztcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IGNyeXB0b01vZHVsZSA9IGF3YWl0IGltcG9ydCgnY3J5cHRvJyk7XG4gICAgaWYgKGNyeXB0b01vZHVsZS53ZWJjcnlwdG8pIHtcbiAgICAgIHJldHVybiBjcnlwdG9Nb2R1bGUud2ViY3J5cHRvIGFzIENyeXB0b1N1YnRsZTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIGxvZ2dlci5kZWJ1ZygnTm9kZSBjcnlwdG8gbm90IGF2YWlsYWJsZScpO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdObyBXZWJDcnlwdG8gaW1wbGVtZW50YXRpb24gYXZhaWxhYmxlJyk7XG59O1xuXG4vKipcbiAqIENyeXB0byBpbXBsZW1lbnRhdGlvbiB0aGF0IHdvcmtzIGluIGJvdGggTm9kZS5qcyBhbmQgYnJvd3NlciBlbnZpcm9ubWVudHNcbiAqL1xuY2xhc3MgQ3VzdG9tQ3J5cHRvIHtcbiAgcHJpdmF0ZSBjcnlwdG9JbnN0YW5jZTogQ3J5cHRvU3VidGxlIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaW5pdFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0UHJvbWlzZSA9IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuY3J5cHRvSW5zdGFuY2UgPSBhd2FpdCBnZXRDcnlwdG8oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZW5zdXJlSW5pdGlhbGl6ZWQoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGU+IHtcbiAgICBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuICAgIGlmICghdGhpcy5jcnlwdG9JbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDcnlwdG8gaW1wbGVtZW50YXRpb24gbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyeXB0b0luc3RhbmNlO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3VidGxlKCk6IFByb21pc2U8Q3J5cHRvU3VidGxlWydzdWJ0bGUnXT4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLnN1YnRsZTtcbiAgfVxuXG4gIGFzeW5jIGdldFJhbmRvbVZhbHVlczxUIGV4dGVuZHMgVWludDhBcnJheSB8IEludDhBcnJheSB8IFVpbnQxNkFycmF5IHwgSW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgSW50MzJBcnJheT4oYXJyYXk6IFQpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBjcnlwdG8gPSBhd2FpdCB0aGlzLmVuc3VyZUluaXRpYWxpemVkKCk7XG4gICAgcmV0dXJuIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xuICB9XG59XG5cbi8vIENyZWF0ZSBhbmQgZXhwb3J0IGRlZmF1bHQgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjdXN0b21DcnlwdG8gPSBuZXcgQ3VzdG9tQ3J5cHRvKCk7XG5cbi8vIEV4cG9ydCBzY2hub3JyIGZ1bmN0aW9uc1xuZXhwb3J0IGNvbnN0IHNpZ25TY2hub3JyID0gc2Nobm9yci5zaWduO1xuZXhwb3J0IGNvbnN0IHZlcmlmeVNjaG5vcnJTaWduYXR1cmUgPSBzY2hub3JyLnZlcmlmeTtcblxuLyoqXG4gKiBHZXRzIHRoZSBjb21wcmVzc2VkIHB1YmxpYyBrZXkgKDMzIGJ5dGVzIHdpdGggcHJlZml4KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcHJlc3NlZFB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIHNlY3AyNTZrMS5nZXRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBzY2hub3JyIHB1YmxpYyBrZXkgKDMyIGJ5dGVzIHgtY29vcmRpbmF0ZSkgYXMgcGVyIEJJUDM0MFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2Nobm9yclB1YmxpY0tleShwcml2YXRlS2V5Qnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbmV3IGtleSBwYWlyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUtleVBhaXIoKTogUHJvbWlzZTxLZXlQYWlyPiB7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IHJhbmRvbUJ5dGVzKDMyKTtcbiAgY29uc3QgcHJpdmF0ZUtleSA9IGJ5dGVzVG9IZXgocHJpdmF0ZUtleUJ5dGVzKTtcbiAgcHJpdmF0ZUtleUJ5dGVzLmZpbGwoMCk7IC8vIHplcm8gc291cmNlIG1hdGVyaWFsXG4gIGNvbnN0IHB1YmxpY0tleSA9IGF3YWl0IGdldFB1YmxpY0tleShwcml2YXRlS2V5KTtcblxuICByZXR1cm4ge1xuICAgIHByaXZhdGVLZXksXG4gICAgcHVibGljS2V5XG4gIH07XG59XG5cbi8qKlxuICogR2V0cyBhIHB1YmxpYyBrZXkgZnJvbSBhIHByaXZhdGUga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQdWJsaWNLZXkocHJpdmF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxQdWJsaWNLZXlEZXRhaWxzPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gaGV4VG9CeXRlcyhwcml2YXRlS2V5KTtcbiAgICBjb25zdCBwdWJsaWNLZXlCeXRlcyA9IHNjaG5vcnIuZ2V0UHVibGljS2V5KHByaXZhdGVLZXlCeXRlcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhleDogYnl0ZXNUb0hleChwdWJsaWNLZXlCeXRlcyksXG4gICAgICBieXRlczogcHVibGljS2V5Qnl0ZXNcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZ2V0IHB1YmxpYyBrZXknKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIGtleSBwYWlyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZUtleVBhaXIoa2V5UGFpcjogS2V5UGFpcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGNvbnN0IGRlcml2ZWRQdWJLZXkgPSBhd2FpdCBnZXRQdWJsaWNLZXkoa2V5UGFpci5wcml2YXRlS2V5KTtcbiAgICByZXR1cm4gZGVyaXZlZFB1YktleS5oZXggPT09IGtleVBhaXIucHVibGljS2V5LmhleDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGtleSBwYWlyJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQoZXZlbnQ6IFBhcnRpYWw8Tm9zdHJFdmVudD4pOiBOb3N0ckV2ZW50IHtcbiAgY29uc3QgdGltZXN0YW1wID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICBjcmVhdGVkX2F0OiBldmVudC5jcmVhdGVkX2F0IHx8IHRpbWVzdGFtcCxcbiAgICB0YWdzOiBldmVudC50YWdzIHx8IFtdLFxuICAgIGNvbnRlbnQ6IGV2ZW50LmNvbnRlbnQgfHwgJycsXG4gICAga2luZDogZXZlbnQua2luZCB8fCAxXG4gIH0gYXMgTm9zdHJFdmVudDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBwcml2YXRlIGtleSB0byBoZXggc3RyaW5nIChhY2NlcHRzIGJvdGggaGV4IHN0cmluZyBhbmQgVWludDhBcnJheSlcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplUHJpdmF0ZUtleShwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgaWYgKHByaXZhdGVLZXkgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgcmV0dXJuIGJ5dGVzVG9IZXgocHJpdmF0ZUtleSk7XG4gIH1cbiAgcmV0dXJuIHByaXZhdGVLZXk7XG59XG5cbi8qKlxuICogU2lnbnMgYW4gZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHNpZ25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXkgYXMgaGV4IHN0cmluZyBvciBVaW50OEFycmF5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaWduRXZlbnQoZXZlbnQ6IE5vc3RyRXZlbnQsIHByaXZhdGVLZXk6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFNpZ25lZE5vc3RyRXZlbnQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcml2YXRlS2V5SGV4ID0gbm9ybWFsaXplUHJpdmF0ZUtleShwcml2YXRlS2V5KTtcblxuICAgIC8vIFNlcmlhbGl6ZSBldmVudCBmb3Igc2lnbmluZyAoTklQLTAxIGZvcm1hdClcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGV2ZW50LnB1YmtleSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcblxuICAgIC8vIENhbGN1bGF0ZSBldmVudCBoYXNoXG4gICAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG5cbiAgICAvLyBDb252ZXJ0IHByaXZhdGUga2V5IHRvIGJ5dGVzIGFuZCBzaWduXG4gICAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gaGV4VG9CeXRlcyhwcml2YXRlS2V5SGV4KTtcbiAgICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IHNjaG5vcnIuc2lnbihldmVudEhhc2gsIHByaXZhdGVLZXlCeXRlcyk7XG5cbiAgICAvLyBDcmVhdGUgc2lnbmVkIGV2ZW50XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmV2ZW50LFxuICAgICAgaWQ6IGJ5dGVzVG9IZXgoZXZlbnRIYXNoKSxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWduYXR1cmVCeXRlcylcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gc2lnbiBldmVudCcpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogR2V0cyBhIHB1YmxpYyBrZXkgaGV4IHN0cmluZyBmcm9tIGEgcHJpdmF0ZSBrZXkgKHN5bmNocm9ub3VzKVxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBhcyBoZXggc3RyaW5nIG9yIFVpbnQ4QXJyYXlcbiAqIEByZXR1cm5zIEhleC1lbmNvZGVkIHB1YmxpYyBrZXkgKDMyLWJ5dGUgeC1vbmx5IHNjaG5vcnIga2V5KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljS2V5U3luYyhwcml2YXRlS2V5OiBzdHJpbmcgfCBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgY29uc3QgcHJpdmF0ZUtleUJ5dGVzID0gcHJpdmF0ZUtleSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXlcbiAgICA/IHByaXZhdGVLZXlcbiAgICA6IGhleFRvQnl0ZXMocHJpdmF0ZUtleSk7XG4gIGNvbnN0IHB1YmxpY0tleUJ5dGVzID0gc2Nobm9yci5nZXRQdWJsaWNLZXkocHJpdmF0ZUtleUJ5dGVzKTtcbiAgcmV0dXJuIGJ5dGVzVG9IZXgocHVibGljS2V5Qnl0ZXMpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMsIGhhc2hlcywgYW5kIHNpZ25zIGEgTm9zdHIgZXZlbnQgaW4gb25lIHN0ZXBcbiAqIEBwYXJhbSBldmVudCAtIFBhcnRpYWwgZXZlbnQgKGtpbmQsIGNvbnRlbnQsIHRhZ3MgcmVxdWlyZWQ7IHB1YmtleSBkZXJpdmVkIGlmIG1pc3NpbmcpXG4gKiBAcGFyYW0gcHJpdmF0ZUtleSAtIFByaXZhdGUga2V5IGFzIGhleCBzdHJpbmcgb3IgVWludDhBcnJheVxuICogQHJldHVybnMgRnVsbHkgc2lnbmVkIGV2ZW50IHdpdGggaWQsIHB1YmtleSwgYW5kIHNpZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluYWxpemVFdmVudChcbiAgZXZlbnQ6IFBhcnRpYWw8Tm9zdHJFdmVudD4sXG4gIHByaXZhdGVLZXk6IHN0cmluZyB8IFVpbnQ4QXJyYXlcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICBjb25zdCBwdWJrZXkgPSBldmVudC5wdWJrZXkgfHwgZ2V0UHVibGljS2V5U3luYyhwcml2YXRlS2V5KTtcbiAgY29uc3QgdGltZXN0YW1wID0gZXZlbnQuY3JlYXRlZF9hdCB8fCBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKTtcblxuICBjb25zdCBmdWxsRXZlbnQ6IE5vc3RyRXZlbnQgPSB7XG4gICAga2luZDogZXZlbnQua2luZCB8fCAxLFxuICAgIGNyZWF0ZWRfYXQ6IHRpbWVzdGFtcCxcbiAgICB0YWdzOiBldmVudC50YWdzIHx8IFtdLFxuICAgIGNvbnRlbnQ6IGV2ZW50LmNvbnRlbnQgfHwgJycsXG4gICAgcHVia2V5LFxuICB9O1xuXG4gIHJldHVybiBzaWduRXZlbnQoZnVsbEV2ZW50LCBwcml2YXRlS2V5KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyBhbiBldmVudCBzaWduYXR1cmVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeVNpZ25hdHVyZShldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIC8vIFNlcmlhbGl6ZSBldmVudCBmb3IgdmVyaWZpY2F0aW9uIChOSVAtMDEgZm9ybWF0KVxuICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgICAwLFxuICAgICAgZXZlbnQucHVia2V5LFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuXG4gICAgLy8gQ2FsY3VsYXRlIGV2ZW50IGhhc2hcbiAgICBjb25zdCBldmVudEhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcblxuICAgIC8vIFZlcmlmeSBldmVudCBJRFxuICAgIGNvbnN0IGNhbGN1bGF0ZWRJZCA9IGJ5dGVzVG9IZXgoZXZlbnRIYXNoKTtcbiAgICBpZiAoY2FsY3VsYXRlZElkICE9PSBldmVudC5pZCkge1xuICAgICAgbG9nZ2VyLmVycm9yKCdFdmVudCBJRCBtaXNtYXRjaCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgaGV4IHN0cmluZ3MgdG8gYnl0ZXNcbiAgICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IGhleFRvQnl0ZXMoZXZlbnQuc2lnKTtcbiAgICBjb25zdCBwdWJrZXlCeXRlcyA9IGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KTtcblxuICAgIC8vIFZlcmlmeSBzaWduYXR1cmVcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoc2lnbmF0dXJlQnl0ZXMsIGV2ZW50SGFzaCwgcHVia2V5Qnl0ZXMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmVyaWZ5IHNpZ25hdHVyZScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIEVuY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQoXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgcmVjaXBpZW50UHViS2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcsXG4gIHNlbmRlclByaXZLZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZWNpcGllbnRQdWJLZXlIZXggPSB0eXBlb2YgcmVjaXBpZW50UHViS2V5ID09PSAnc3RyaW5nJyA/IHJlY2lwaWVudFB1YktleSA6IHJlY2lwaWVudFB1YktleS5oZXg7XG4gICAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KGhleFRvQnl0ZXMoc2VuZGVyUHJpdktleSksIGhleFRvQnl0ZXMocmVjaXBpZW50UHViS2V5SGV4KSk7XG4gICAgY29uc3Qgc2hhcmVkWCA9IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKTtcblxuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBJVlxuICAgIGNvbnN0IGl2ID0gcmFuZG9tQnl0ZXMoMTYpO1xuICAgIGNvbnN0IGtleSA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKSk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgLy8gRW5jcnlwdCB0aGUgbWVzc2FnZVxuICAgIGNvbnN0IGRhdGEgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3VzdG9tQ3J5cHRvLmdldFN1YnRsZSgpLnRoZW4oKHN1YnRsZSkgPT4gc3VidGxlLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIGtleSxcbiAgICAgIGRhdGEuYnVmZmVyXG4gICAgKSk7XG5cbiAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0OiBiYXNlNjQoY2lwaGVydGV4dCkgKyBcIj9pdj1cIiArIGJhc2U2NChpdilcbiAgICBjb25zdCBjaXBoZXJ0ZXh0QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChuZXcgVWludDhBcnJheShlbmNyeXB0ZWQpKTtcbiAgICBjb25zdCBpdkJhc2U2NCA9IGJ5dGVzVG9CYXNlNjQoaXYpO1xuXG4gICAgcmV0dXJuIGNpcGhlcnRleHRCYXNlNjQgKyAnP2l2PScgKyBpdkJhc2U2NDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGVuY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogRGVjcnlwdHMgYSBtZXNzYWdlIHVzaW5nIE5JUC0wNFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdChcbiAgZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nLFxuICBzZW5kZXJQdWJLZXk6IFB1YmxpY0tleSB8IHN0cmluZyxcbiAgcmVjaXBpZW50UHJpdktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHNlbmRlclB1YktleUhleCA9IHR5cGVvZiBzZW5kZXJQdWJLZXkgPT09ICdzdHJpbmcnID8gc2VuZGVyUHViS2V5IDogc2VuZGVyUHViS2V5LmhleDtcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhyZWNpcGllbnRQcml2S2V5KSwgaGV4VG9CeXRlcyhzZW5kZXJQdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpO1xuXG4gICAgLy8gUGFyc2UgTklQLTA0IHN0YW5kYXJkIGZvcm1hdDogYmFzZTY0KGNpcGhlcnRleHQpICsgXCI/aXY9XCIgKyBiYXNlNjQoaXYpXG4gICAgLy8gQWxzbyBzdXBwb3J0IGxlZ2FjeSBoZXggZm9ybWF0IChpdiArIGNpcGhlcnRleHQgY29uY2F0ZW5hdGVkKSBhcyBmYWxsYmFja1xuICAgIGxldCBpdjogVWludDhBcnJheTtcbiAgICBsZXQgY2lwaGVydGV4dDogVWludDhBcnJheTtcblxuICAgIGlmIChlbmNyeXB0ZWRNZXNzYWdlLmluY2x1ZGVzKCc/aXY9JykpIHtcbiAgICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXRcbiAgICAgIGNvbnN0IFtjaXBoZXJ0ZXh0QmFzZTY0LCBpdkJhc2U2NF0gPSBlbmNyeXB0ZWRNZXNzYWdlLnNwbGl0KCc/aXY9Jyk7XG4gICAgICBjaXBoZXJ0ZXh0ID0gYmFzZTY0VG9CeXRlcyhjaXBoZXJ0ZXh0QmFzZTY0KTtcbiAgICAgIGl2ID0gYmFzZTY0VG9CeXRlcyhpdkJhc2U2NCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExlZ2FjeSBoZXggZm9ybWF0IGZhbGxiYWNrOiBmaXJzdCAxNiBieXRlcyBhcmUgSVYsIHJlc3QgaXMgY2lwaGVydGV4dFxuICAgICAgY29uc3QgZW5jcnlwdGVkID0gaGV4VG9CeXRlcyhlbmNyeXB0ZWRNZXNzYWdlKTtcbiAgICAgIGl2ID0gZW5jcnlwdGVkLnNsaWNlKDAsIDE2KTtcbiAgICAgIGNpcGhlcnRleHQgPSBlbmNyeXB0ZWQuc2xpY2UoMTYpO1xuICAgIH1cblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGN1c3RvbUNyeXB0by5nZXRTdWJ0bGUoKS50aGVuKChzdWJ0bGUpID0+IHN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZGVjcnlwdCddXG4gICAgKSk7XG5cbiAgICAvLyBaZXJvIHNoYXJlZCBzZWNyZXQgbWF0ZXJpYWwgbm93IHRoYXQgQUVTIGtleSBpcyBpbXBvcnRlZFxuICAgIHNoYXJlZFguZmlsbCgwKTtcbiAgICBzaGFyZWRQb2ludC5maWxsKDApO1xuXG4gICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgY3VzdG9tQ3J5cHRvLmdldFN1YnRsZSgpLnRoZW4oKHN1YnRsZSkgPT4gc3VidGxlLmRlY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIGtleSxcbiAgICAgIGNpcGhlcnRleHQuYnVmZmVyIGFzIEFycmF5QnVmZmVyXG4gICAgKSk7XG5cbiAgICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGRlY3J5cHRlZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBkZWNyeXB0IG1lc3NhZ2UnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuIiwgIi8qKlxuICogU0VDRyBzZWNwMjU2azEuIFNlZSBbcGRmXShodHRwczovL3d3dy5zZWNnLm9yZy9zZWMyLXYyLnBkZikuXG4gKlxuICogQmVsb25ncyB0byBLb2JsaXR6IGN1cnZlczogaXQgaGFzIGVmZmljaWVudGx5LWNvbXB1dGFibGUgR0xWIGVuZG9tb3JwaGlzbSBcdTAzQzgsXG4gKiBjaGVjayBvdXQge0BsaW5rIEVuZG9tb3JwaGlzbU9wdHN9LiBTZWVtcyB0byBiZSByaWdpZCAobm90IGJhY2tkb29yZWQpLlxuICogQG1vZHVsZVxuICovXG4vKiEgbm9ibGUtY3VydmVzIC0gTUlUIExpY2Vuc2UgKGMpIDIwMjIgUGF1bCBNaWxsZXIgKHBhdWxtaWxsci5jb20pICovXG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGNyZWF0ZUtleWdlbiwgdHlwZSBDdXJ2ZUxlbmd0aHMgfSBmcm9tICcuL2Fic3RyYWN0L2N1cnZlLnRzJztcbmltcG9ydCB7IGNyZWF0ZUhhc2hlciwgdHlwZSBIMkNIYXNoZXIsIGlzb2dlbnlNYXAgfSBmcm9tICcuL2Fic3RyYWN0L2hhc2gtdG8tY3VydmUudHMnO1xuaW1wb3J0IHsgRmllbGQsIG1hcEhhc2hUb0ZpZWxkLCBwb3cyIH0gZnJvbSAnLi9hYnN0cmFjdC9tb2R1bGFyLnRzJztcbmltcG9ydCB7XG4gIHR5cGUgRUNEU0EsXG4gIGVjZHNhLFxuICB0eXBlIEVuZG9tb3JwaGlzbU9wdHMsXG4gIG1hcFRvQ3VydmVTaW1wbGVTV1UsXG4gIHR5cGUgV2VpZXJzdHJhc3NQb2ludCBhcyBQb2ludFR5cGUsXG4gIHdlaWVyc3RyYXNzLFxuICB0eXBlIFdlaWVyc3RyYXNzT3B0cyxcbiAgdHlwZSBXZWllcnN0cmFzc1BvaW50Q29ucyxcbn0gZnJvbSAnLi9hYnN0cmFjdC93ZWllcnN0cmFzcy50cyc7XG5pbXBvcnQgeyBhYnl0ZXMsIGFzY2lpVG9CeXRlcywgYnl0ZXNUb051bWJlckJFLCBjb25jYXRCeXRlcyB9IGZyb20gJy4vdXRpbHMudHMnO1xuXG4vLyBTZWVtcyBsaWtlIGdlbmVyYXRvciB3YXMgcHJvZHVjZWQgZnJvbSBzb21lIHNlZWQ6XG4vLyBgUG9pbnRrMS5CQVNFLm11bHRpcGx5KFBvaW50azEuRm4uaW52KDJuLCBOKSkudG9BZmZpbmUoKS54YFxuLy8gLy8gZ2l2ZXMgc2hvcnQgeCAweDNiNzhjZTU2M2Y4OWEwZWQ5NDE0ZjVhYTI4YWQwZDk2ZDY3OTVmOWM2M25cbmNvbnN0IHNlY3AyNTZrMV9DVVJWRTogV2VpZXJzdHJhc3NPcHRzPGJpZ2ludD4gPSB7XG4gIHA6IEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZmYzJmJyksXG4gIG46IEJpZ0ludCgnMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWJhYWVkY2U2YWY0OGEwM2JiZmQyNWU4Y2QwMzY0MTQxJyksXG4gIGg6IEJpZ0ludCgxKSxcbiAgYTogQmlnSW50KDApLFxuICBiOiBCaWdJbnQoNyksXG4gIEd4OiBCaWdJbnQoJzB4NzliZTY2N2VmOWRjYmJhYzU1YTA2Mjk1Y2U4NzBiMDcwMjliZmNkYjJkY2UyOGQ5NTlmMjgxNWIxNmY4MTc5OCcpLFxuICBHeTogQmlnSW50KCcweDQ4M2FkYTc3MjZhM2M0NjU1ZGE0ZmJmYzBlMTEwOGE4ZmQxN2I0NDhhNjg1NTQxOTljNDdkMDhmZmIxMGQ0YjgnKSxcbn07XG5cbmNvbnN0IHNlY3AyNTZrMV9FTkRPOiBFbmRvbW9ycGhpc21PcHRzID0ge1xuICBiZXRhOiBCaWdJbnQoJzB4N2FlOTZhMmI2NTdjMDcxMDZlNjQ0NzllYWMzNDM0ZTk5Y2YwNDk3NTEyZjU4OTk1YzEzOTZjMjg3MTk1MDFlZScpLFxuICBiYXNpc2VzOiBbXG4gICAgW0JpZ0ludCgnMHgzMDg2ZDIyMWE3ZDQ2YmNkZTg2YzkwZTQ5Mjg0ZWIxNScpLCAtQmlnSW50KCcweGU0NDM3ZWQ2MDEwZTg4Mjg2ZjU0N2ZhOTBhYmZlNGMzJyldLFxuICAgIFtCaWdJbnQoJzB4MTE0Y2E1MGY3YThlMmYzZjY1N2MxMTA4ZDlkNDRjZmQ4JyksIEJpZ0ludCgnMHgzMDg2ZDIyMWE3ZDQ2YmNkZTg2YzkwZTQ5Mjg0ZWIxNScpXSxcbiAgXSxcbn07XG5cbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCk7XG5jb25zdCBfMm4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDIpO1xuXG4vKipcbiAqIFx1MjIxQW4gPSBuXigocCsxKS80KSBmb3IgZmllbGRzIHAgPSAzIG1vZCA0LiBXZSB1bndyYXAgdGhlIGxvb3AgYW5kIG11bHRpcGx5IGJpdC1ieS1iaXQuXG4gKiAoUCsxbi80bikudG9TdHJpbmcoMikgd291bGQgcHJvZHVjZSBiaXRzIFsyMjN4IDEsIDAsIDIyeCAxLCA0eCAwLCAxMSwgMDBdXG4gKi9cbmZ1bmN0aW9uIHNxcnRNb2QoeTogYmlnaW50KTogYmlnaW50IHtcbiAgY29uc3QgUCA9IHNlY3AyNTZrMV9DVVJWRS5wO1xuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgY29uc3QgXzNuID0gQmlnSW50KDMpLCBfNm4gPSBCaWdJbnQoNiksIF8xMW4gPSBCaWdJbnQoMTEpLCBfMjJuID0gQmlnSW50KDIyKTtcbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIGNvbnN0IF8yM24gPSBCaWdJbnQoMjMpLCBfNDRuID0gQmlnSW50KDQ0KSwgXzg4biA9IEJpZ0ludCg4OCk7XG4gIGNvbnN0IGIyID0gKHkgKiB5ICogeSkgJSBQOyAvLyB4XjMsIDExXG4gIGNvbnN0IGIzID0gKGIyICogYjIgKiB5KSAlIFA7IC8vIHheN1xuICBjb25zdCBiNiA9IChwb3cyKGIzLCBfM24sIFApICogYjMpICUgUDtcbiAgY29uc3QgYjkgPSAocG93MihiNiwgXzNuLCBQKSAqIGIzKSAlIFA7XG4gIGNvbnN0IGIxMSA9IChwb3cyKGI5LCBfMm4sIFApICogYjIpICUgUDtcbiAgY29uc3QgYjIyID0gKHBvdzIoYjExLCBfMTFuLCBQKSAqIGIxMSkgJSBQO1xuICBjb25zdCBiNDQgPSAocG93MihiMjIsIF8yMm4sIFApICogYjIyKSAlIFA7XG4gIGNvbnN0IGI4OCA9IChwb3cyKGI0NCwgXzQ0biwgUCkgKiBiNDQpICUgUDtcbiAgY29uc3QgYjE3NiA9IChwb3cyKGI4OCwgXzg4biwgUCkgKiBiODgpICUgUDtcbiAgY29uc3QgYjIyMCA9IChwb3cyKGIxNzYsIF80NG4sIFApICogYjQ0KSAlIFA7XG4gIGNvbnN0IGIyMjMgPSAocG93MihiMjIwLCBfM24sIFApICogYjMpICUgUDtcbiAgY29uc3QgdDEgPSAocG93MihiMjIzLCBfMjNuLCBQKSAqIGIyMikgJSBQO1xuICBjb25zdCB0MiA9IChwb3cyKHQxLCBfNm4sIFApICogYjIpICUgUDtcbiAgY29uc3Qgcm9vdCA9IHBvdzIodDIsIF8ybiwgUCk7XG4gIGlmICghRnBrMS5lcWwoRnBrMS5zcXIocm9vdCksIHkpKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIHNxdWFyZSByb290Jyk7XG4gIHJldHVybiByb290O1xufVxuXG5jb25zdCBGcGsxID0gRmllbGQoc2VjcDI1NmsxX0NVUlZFLnAsIHsgc3FydDogc3FydE1vZCB9KTtcbmNvbnN0IFBvaW50azEgPSAvKiBAX19QVVJFX18gKi8gd2VpZXJzdHJhc3Moc2VjcDI1NmsxX0NVUlZFLCB7XG4gIEZwOiBGcGsxLFxuICBlbmRvOiBzZWNwMjU2azFfRU5ETyxcbn0pO1xuXG4vKipcbiAqIHNlY3AyNTZrMSBjdXJ2ZTogRUNEU0EgYW5kIEVDREggbWV0aG9kcy5cbiAqXG4gKiBVc2VzIHNoYTI1NiB0byBoYXNoIG1lc3NhZ2VzLiBUbyB1c2UgYSBkaWZmZXJlbnQgaGFzaCxcbiAqIHBhc3MgYHsgcHJlaGFzaDogZmFsc2UgfWAgdG8gc2lnbiAvIHZlcmlmeS5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGltcG9ydCB7IHNlY3AyNTZrMSB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbiAqIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXkgfSA9IHNlY3AyNTZrMS5rZXlnZW4oKTtcbiAqIC8vIGNvbnN0IHB1YmxpY0tleSA9IHNlY3AyNTZrMS5nZXRQdWJsaWNLZXkoc2VjcmV0S2V5KTtcbiAqIGNvbnN0IG1zZyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSgnaGVsbG8gbm9ibGUnKTtcbiAqIGNvbnN0IHNpZyA9IHNlY3AyNTZrMS5zaWduKG1zZywgc2VjcmV0S2V5KTtcbiAqIGNvbnN0IGlzVmFsaWQgPSBzZWNwMjU2azEudmVyaWZ5KHNpZywgbXNnLCBwdWJsaWNLZXkpO1xuICogLy8gY29uc3Qgc2lnS2VjY2FrID0gc2VjcDI1NmsxLnNpZ24oa2VjY2FrMjU2KG1zZyksIHNlY3JldEtleSwgeyBwcmVoYXNoOiBmYWxzZSB9KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3Qgc2VjcDI1NmsxOiBFQ0RTQSA9IC8qIEBfX1BVUkVfXyAqLyBlY2RzYShQb2ludGsxLCBzaGEyNTYpO1xuXG4vLyBTY2hub3JyIHNpZ25hdHVyZXMgYXJlIHN1cGVyaW9yIHRvIEVDRFNBIGZyb20gYWJvdmUuIEJlbG93IGlzIFNjaG5vcnItc3BlY2lmaWMgQklQMDM0MCBjb2RlLlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2JpdGNvaW4vYmlwcy9ibG9iL21hc3Rlci9iaXAtMDM0MC5tZWRpYXdpa2lcbi8qKiBBbiBvYmplY3QgbWFwcGluZyB0YWdzIHRvIHRoZWlyIHRhZ2dlZCBoYXNoIHByZWZpeCBvZiBbU0hBMjU2KHRhZykgfCBTSEEyNTYodGFnKV0gKi9cbmNvbnN0IFRBR0dFRF9IQVNIX1BSRUZJWEVTOiB7IFt0YWc6IHN0cmluZ106IFVpbnQ4QXJyYXkgfSA9IHt9O1xuZnVuY3Rpb24gdGFnZ2VkSGFzaCh0YWc6IHN0cmluZywgLi4ubWVzc2FnZXM6IFVpbnQ4QXJyYXlbXSk6IFVpbnQ4QXJyYXkge1xuICBsZXQgdGFnUCA9IFRBR0dFRF9IQVNIX1BSRUZJWEVTW3RhZ107XG4gIGlmICh0YWdQID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB0YWdIID0gc2hhMjU2KGFzY2lpVG9CeXRlcyh0YWcpKTtcbiAgICB0YWdQID0gY29uY2F0Qnl0ZXModGFnSCwgdGFnSCk7XG4gICAgVEFHR0VEX0hBU0hfUFJFRklYRVNbdGFnXSA9IHRhZ1A7XG4gIH1cbiAgcmV0dXJuIHNoYTI1Nihjb25jYXRCeXRlcyh0YWdQLCAuLi5tZXNzYWdlcykpO1xufVxuXG4vLyBFQ0RTQSBjb21wYWN0IHBvaW50cyBhcmUgMzMtYnl0ZS4gU2Nobm9yciBpcyAzMjogd2Ugc3RyaXAgZmlyc3QgYnl0ZSAweDAyIG9yIDB4MDNcbmNvbnN0IHBvaW50VG9CeXRlcyA9IChwb2ludDogUG9pbnRUeXBlPGJpZ2ludD4pID0+IHBvaW50LnRvQnl0ZXModHJ1ZSkuc2xpY2UoMSk7XG5jb25zdCBoYXNFdmVuID0gKHk6IGJpZ2ludCkgPT4geSAlIF8ybiA9PT0gXzBuO1xuXG4vLyBDYWxjdWxhdGUgcG9pbnQsIHNjYWxhciBhbmQgYnl0ZXNcbmZ1bmN0aW9uIHNjaG5vcnJHZXRFeHRQdWJLZXkocHJpdjogVWludDhBcnJheSkge1xuICBjb25zdCB7IEZuLCBCQVNFIH0gPSBQb2ludGsxO1xuICBjb25zdCBkXyA9IEZuLmZyb21CeXRlcyhwcml2KTtcbiAgY29uc3QgcCA9IEJBU0UubXVsdGlwbHkoZF8pOyAvLyBQID0gZCdcdTIyQzVHOyAwIDwgZCcgPCBuIGNoZWNrIGlzIGRvbmUgaW5zaWRlXG4gIGNvbnN0IHNjYWxhciA9IGhhc0V2ZW4ocC55KSA/IGRfIDogRm4ubmVnKGRfKTtcbiAgcmV0dXJuIHsgc2NhbGFyLCBieXRlczogcG9pbnRUb0J5dGVzKHApIH07XG59XG4vKipcbiAqIGxpZnRfeCBmcm9tIEJJUDM0MC4gQ29udmVydCAzMi1ieXRlIHggY29vcmRpbmF0ZSB0byBlbGxpcHRpYyBjdXJ2ZSBwb2ludC5cbiAqIEByZXR1cm5zIHZhbGlkIHBvaW50IGNoZWNrZWQgZm9yIGJlaW5nIG9uLWN1cnZlXG4gKi9cbmZ1bmN0aW9uIGxpZnRfeCh4OiBiaWdpbnQpOiBQb2ludFR5cGU8YmlnaW50PiB7XG4gIGNvbnN0IEZwID0gRnBrMTtcbiAgaWYgKCFGcC5pc1ZhbGlkTm90MCh4KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHg6IEZhaWwgaWYgeCBcdTIyNjUgcCcpO1xuICBjb25zdCB4eCA9IEZwLmNyZWF0ZSh4ICogeCk7XG4gIGNvbnN0IGMgPSBGcC5jcmVhdGUoeHggKiB4ICsgQmlnSW50KDcpKTsgLy8gTGV0IGMgPSB4XHUwMEIzICsgNyBtb2QgcC5cbiAgbGV0IHkgPSBGcC5zcXJ0KGMpOyAvLyBMZXQgeSA9IGNeKHArMSkvNCBtb2QgcC4gU2FtZSBhcyBzcXJ0KCkuXG4gIC8vIFJldHVybiB0aGUgdW5pcXVlIHBvaW50IFAgc3VjaCB0aGF0IHgoUCkgPSB4IGFuZFxuICAvLyB5KFApID0geSBpZiB5IG1vZCAyID0gMCBvciB5KFApID0gcC15IG90aGVyd2lzZS5cbiAgaWYgKCFoYXNFdmVuKHkpKSB5ID0gRnAubmVnKHkpO1xuICBjb25zdCBwID0gUG9pbnRrMS5mcm9tQWZmaW5lKHsgeCwgeSB9KTtcbiAgcC5hc3NlcnRWYWxpZGl0eSgpO1xuICByZXR1cm4gcDtcbn1cbmNvbnN0IG51bSA9IGJ5dGVzVG9OdW1iZXJCRTtcbi8qKlxuICogQ3JlYXRlIHRhZ2dlZCBoYXNoLCBjb252ZXJ0IGl0IHRvIGJpZ2ludCwgcmVkdWNlIG1vZHVsby1uLlxuICovXG5mdW5jdGlvbiBjaGFsbGVuZ2UoLi4uYXJnczogVWludDhBcnJheVtdKTogYmlnaW50IHtcbiAgcmV0dXJuIFBvaW50azEuRm4uY3JlYXRlKG51bSh0YWdnZWRIYXNoKCdCSVAwMzQwL2NoYWxsZW5nZScsIC4uLmFyZ3MpKSk7XG59XG5cbi8qKlxuICogU2Nobm9yciBwdWJsaWMga2V5IGlzIGp1c3QgYHhgIGNvb3JkaW5hdGUgb2YgUG9pbnQgYXMgcGVyIEJJUDM0MC5cbiAqL1xuZnVuY3Rpb24gc2Nobm9yckdldFB1YmxpY0tleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIHNjaG5vcnJHZXRFeHRQdWJLZXkoc2VjcmV0S2V5KS5ieXRlczsgLy8gZCc9aW50KHNrKS4gRmFpbCBpZiBkJz0wIG9yIGQnXHUyMjY1bi4gUmV0IGJ5dGVzKGQnXHUyMkM1Rylcbn1cblxuLyoqXG4gKiBDcmVhdGVzIFNjaG5vcnIgc2lnbmF0dXJlIGFzIHBlciBCSVAzNDAuIFZlcmlmaWVzIGl0c2VsZiBiZWZvcmUgcmV0dXJuaW5nIGFueXRoaW5nLlxuICogYXV4UmFuZCBpcyBvcHRpb25hbCBhbmQgaXMgbm90IHRoZSBzb2xlIHNvdXJjZSBvZiBrIGdlbmVyYXRpb246IGJhZCBDU1BSTkcgd29uJ3QgYmUgZGFuZ2Vyb3VzLlxuICovXG5mdW5jdGlvbiBzY2hub3JyU2lnbihcbiAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgc2VjcmV0S2V5OiBVaW50OEFycmF5LFxuICBhdXhSYW5kOiBVaW50OEFycmF5ID0gcmFuZG9tQnl0ZXMoMzIpXG4pOiBVaW50OEFycmF5IHtcbiAgY29uc3QgeyBGbiB9ID0gUG9pbnRrMTtcbiAgY29uc3QgbSA9IGFieXRlcyhtZXNzYWdlLCB1bmRlZmluZWQsICdtZXNzYWdlJyk7XG4gIGNvbnN0IHsgYnl0ZXM6IHB4LCBzY2FsYXI6IGQgfSA9IHNjaG5vcnJHZXRFeHRQdWJLZXkoc2VjcmV0S2V5KTsgLy8gY2hlY2tzIGZvciBpc1dpdGhpbkN1cnZlT3JkZXJcbiAgY29uc3QgYSA9IGFieXRlcyhhdXhSYW5kLCAzMiwgJ2F1eFJhbmQnKTsgLy8gQXV4aWxpYXJ5IHJhbmRvbSBkYXRhIGE6IGEgMzItYnl0ZSBhcnJheVxuICBjb25zdCB0ID0gRm4udG9CeXRlcyhkIF4gbnVtKHRhZ2dlZEhhc2goJ0JJUDAzNDAvYXV4JywgYSkpKTsgLy8gTGV0IHQgYmUgdGhlIGJ5dGUtd2lzZSB4b3Igb2YgYnl0ZXMoZCkgYW5kIGhhc2gvYXV4KGEpXG4gIGNvbnN0IHJhbmQgPSB0YWdnZWRIYXNoKCdCSVAwMzQwL25vbmNlJywgdCwgcHgsIG0pOyAvLyBMZXQgcmFuZCA9IGhhc2gvbm9uY2UodCB8fCBieXRlcyhQKSB8fCBtKVxuICAvLyBMZXQgaycgPSBpbnQocmFuZCkgbW9kIG4uIEZhaWwgaWYgaycgPSAwLiBMZXQgUiA9IGsnXHUyMkM1R1xuICBjb25zdCB7IGJ5dGVzOiByeCwgc2NhbGFyOiBrIH0gPSBzY2hub3JyR2V0RXh0UHViS2V5KHJhbmQpO1xuICBjb25zdCBlID0gY2hhbGxlbmdlKHJ4LCBweCwgbSk7IC8vIExldCBlID0gaW50KGhhc2gvY2hhbGxlbmdlKGJ5dGVzKFIpIHx8IGJ5dGVzKFApIHx8IG0pKSBtb2Qgbi5cbiAgY29uc3Qgc2lnID0gbmV3IFVpbnQ4QXJyYXkoNjQpOyAvLyBMZXQgc2lnID0gYnl0ZXMoUikgfHwgYnl0ZXMoKGsgKyBlZCkgbW9kIG4pLlxuICBzaWcuc2V0KHJ4LCAwKTtcbiAgc2lnLnNldChGbi50b0J5dGVzKEZuLmNyZWF0ZShrICsgZSAqIGQpKSwgMzIpO1xuICAvLyBJZiBWZXJpZnkoYnl0ZXMoUCksIG0sIHNpZykgKHNlZSBiZWxvdykgcmV0dXJucyBmYWlsdXJlLCBhYm9ydFxuICBpZiAoIXNjaG5vcnJWZXJpZnkoc2lnLCBtLCBweCkpIHRocm93IG5ldyBFcnJvcignc2lnbjogSW52YWxpZCBzaWduYXR1cmUgcHJvZHVjZWQnKTtcbiAgcmV0dXJuIHNpZztcbn1cblxuLyoqXG4gKiBWZXJpZmllcyBTY2hub3JyIHNpZ25hdHVyZS5cbiAqIFdpbGwgc3dhbGxvdyBlcnJvcnMgJiByZXR1cm4gZmFsc2UgZXhjZXB0IGZvciBpbml0aWFsIHR5cGUgdmFsaWRhdGlvbiBvZiBhcmd1bWVudHMuXG4gKi9cbmZ1bmN0aW9uIHNjaG5vcnJWZXJpZnkoc2lnbmF0dXJlOiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgY29uc3QgeyBGcCwgRm4sIEJBU0UgfSA9IFBvaW50azE7XG4gIGNvbnN0IHNpZyA9IGFieXRlcyhzaWduYXR1cmUsIDY0LCAnc2lnbmF0dXJlJyk7XG4gIGNvbnN0IG0gPSBhYnl0ZXMobWVzc2FnZSwgdW5kZWZpbmVkLCAnbWVzc2FnZScpO1xuICBjb25zdCBwdWIgPSBhYnl0ZXMocHVibGljS2V5LCAzMiwgJ3B1YmxpY0tleScpO1xuICB0cnkge1xuICAgIGNvbnN0IFAgPSBsaWZ0X3gobnVtKHB1YikpOyAvLyBQID0gbGlmdF94KGludChwaykpOyBmYWlsIGlmIHRoYXQgZmFpbHNcbiAgICBjb25zdCByID0gbnVtKHNpZy5zdWJhcnJheSgwLCAzMikpOyAvLyBMZXQgciA9IGludChzaWdbMDozMl0pOyBmYWlsIGlmIHIgXHUyMjY1IHAuXG4gICAgaWYgKCFGcC5pc1ZhbGlkTm90MChyKSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHMgPSBudW0oc2lnLnN1YmFycmF5KDMyLCA2NCkpOyAvLyBMZXQgcyA9IGludChzaWdbMzI6NjRdKTsgZmFpbCBpZiBzIFx1MjI2NSBuLlxuICAgIGlmICghRm4uaXNWYWxpZE5vdDAocykpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGUgPSBjaGFsbGVuZ2UoRm4udG9CeXRlcyhyKSwgcG9pbnRUb0J5dGVzKFApLCBtKTsgLy8gaW50KGNoYWxsZW5nZShieXRlcyhyKXx8Ynl0ZXMoUCl8fG0pKSVuXG4gICAgLy8gUiA9IHNcdTIyQzVHIC0gZVx1MjJDNVAsIHdoZXJlIC1lUCA9PSAobi1lKVBcbiAgICBjb25zdCBSID0gQkFTRS5tdWx0aXBseVVuc2FmZShzKS5hZGQoUC5tdWx0aXBseVVuc2FmZShGbi5uZWcoZSkpKTtcbiAgICBjb25zdCB7IHgsIHkgfSA9IFIudG9BZmZpbmUoKTtcbiAgICAvLyBGYWlsIGlmIGlzX2luZmluaXRlKFIpIC8gbm90IGhhc19ldmVuX3koUikgLyB4KFIpIFx1MjI2MCByLlxuICAgIGlmIChSLmlzMCgpIHx8ICFoYXNFdmVuKHkpIHx8IHggIT09IHIpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgU2VjcFNjaG5vcnIgPSB7XG4gIGtleWdlbjogKHNlZWQ/OiBVaW50OEFycmF5KSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG4gIGdldFB1YmxpY0tleTogdHlwZW9mIHNjaG5vcnJHZXRQdWJsaWNLZXk7XG4gIHNpZ246IHR5cGVvZiBzY2hub3JyU2lnbjtcbiAgdmVyaWZ5OiB0eXBlb2Ygc2Nobm9yclZlcmlmeTtcbiAgUG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnRDb25zPGJpZ2ludD47XG4gIHV0aWxzOiB7XG4gICAgcmFuZG9tU2VjcmV0S2V5OiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IFVpbnQ4QXJyYXk7XG4gICAgcG9pbnRUb0J5dGVzOiAocG9pbnQ6IFBvaW50VHlwZTxiaWdpbnQ+KSA9PiBVaW50OEFycmF5O1xuICAgIGxpZnRfeDogdHlwZW9mIGxpZnRfeDtcbiAgICB0YWdnZWRIYXNoOiB0eXBlb2YgdGFnZ2VkSGFzaDtcbiAgfTtcbiAgbGVuZ3RoczogQ3VydmVMZW5ndGhzO1xufTtcbi8qKlxuICogU2Nobm9yciBzaWduYXR1cmVzIG92ZXIgc2VjcDI1NmsxLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2JpdGNvaW4vYmlwcy9ibG9iL21hc3Rlci9iaXAtMDM0MC5tZWRpYXdpa2lcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbiAqIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXkgfSA9IHNjaG5vcnIua2V5Z2VuKCk7XG4gKiAvLyBjb25zdCBwdWJsaWNLZXkgPSBzY2hub3JyLmdldFB1YmxpY0tleShzZWNyZXRLZXkpO1xuICogY29uc3QgbXNnID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdoZWxsbycpO1xuICogY29uc3Qgc2lnID0gc2Nobm9yci5zaWduKG1zZywgc2VjcmV0S2V5KTtcbiAqIGNvbnN0IGlzVmFsaWQgPSBzY2hub3JyLnZlcmlmeShzaWcsIG1zZywgcHVibGljS2V5KTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3Qgc2Nobm9ycjogU2VjcFNjaG5vcnIgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+IHtcbiAgY29uc3Qgc2l6ZSA9IDMyO1xuICBjb25zdCBzZWVkTGVuZ3RoID0gNDg7XG4gIGNvbnN0IHJhbmRvbVNlY3JldEtleSA9IChzZWVkID0gcmFuZG9tQnl0ZXMoc2VlZExlbmd0aCkpOiBVaW50OEFycmF5ID0+IHtcbiAgICByZXR1cm4gbWFwSGFzaFRvRmllbGQoc2VlZCwgc2VjcDI1NmsxX0NVUlZFLm4pO1xuICB9O1xuICByZXR1cm4ge1xuICAgIGtleWdlbjogY3JlYXRlS2V5Z2VuKHJhbmRvbVNlY3JldEtleSwgc2Nobm9yckdldFB1YmxpY0tleSksXG4gICAgZ2V0UHVibGljS2V5OiBzY2hub3JyR2V0UHVibGljS2V5LFxuICAgIHNpZ246IHNjaG5vcnJTaWduLFxuICAgIHZlcmlmeTogc2Nobm9yclZlcmlmeSxcbiAgICBQb2ludDogUG9pbnRrMSxcbiAgICB1dGlsczoge1xuICAgICAgcmFuZG9tU2VjcmV0S2V5LFxuICAgICAgdGFnZ2VkSGFzaCxcbiAgICAgIGxpZnRfeCxcbiAgICAgIHBvaW50VG9CeXRlcyxcbiAgICB9LFxuICAgIGxlbmd0aHM6IHtcbiAgICAgIHNlY3JldEtleTogc2l6ZSxcbiAgICAgIHB1YmxpY0tleTogc2l6ZSxcbiAgICAgIHB1YmxpY0tleUhhc1ByZWZpeDogZmFsc2UsXG4gICAgICBzaWduYXR1cmU6IHNpemUgKiAyLFxuICAgICAgc2VlZDogc2VlZExlbmd0aCxcbiAgICB9LFxuICB9O1xufSkoKTtcblxuY29uc3QgaXNvTWFwID0gLyogQF9fUFVSRV9fICovICgoKSA9PlxuICBpc29nZW55TWFwKFxuICAgIEZwazEsXG4gICAgW1xuICAgICAgLy8geE51bVxuICAgICAgW1xuICAgICAgICAnMHg4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZTM4ZGFhYWFhOGM3JyxcbiAgICAgICAgJzB4N2QzZDRjODBiYzMyMWQ1YjlmMzE1Y2VhN2ZkNDRjNWQ1OTVkMmZjMGJmNjNiOTJkZmZmMTA0NGYxN2M2NTgxJyxcbiAgICAgICAgJzB4NTM0YzMyOGQyM2YyMzRlNmUyYTQxM2RlY2EyNWNhZWNlNDUwNjE0NDAzN2M0MDMxNGVjYmQwYjUzZDlkZDI2MicsXG4gICAgICAgICcweDhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhlMzhkYWFhYWE4OGMnLFxuICAgICAgXSxcbiAgICAgIC8vIHhEZW5cbiAgICAgIFtcbiAgICAgICAgJzB4ZDM1NzcxMTkzZDk0OTE4YTljYTM0Y2NiYjdiNjQwZGQ4NmNkNDA5NTQyZjg0ODdkOWZlNmI3NDU3ODFlYjQ5YicsXG4gICAgICAgICcweGVkYWRjNmY2NDM4M2RjMWRmN2M0YjJkNTFiNTQyMjU0MDZkMzZiNjQxZjVlNDFiYmM1MmE1NjYxMmE4YzZkMTQnLFxuICAgICAgICAnMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxJywgLy8gTEFTVCAxXG4gICAgICBdLFxuICAgICAgLy8geU51bVxuICAgICAgW1xuICAgICAgICAnMHg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YmRhMTJmNjg0YjhlMzhlMjNjJyxcbiAgICAgICAgJzB4Yzc1ZTBjMzJkNWNiN2MwZmE5ZDBhNTRiMTJhMGE2ZDU2NDdhYjA0NmQ2ODZkYTZmZGZmYzkwZmMyMDFkNzFhMycsXG4gICAgICAgICcweDI5YTYxOTQ2OTFmOTFhNzM3MTUyMDllZjY1MTJlNTc2NzIyODMwYTIwMWJlMjAxOGE3NjVlODVhOWVjZWU5MzEnLFxuICAgICAgICAnMHgyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjY4NGJkYTEyZjM4ZTM4ZDg0JyxcbiAgICAgIF0sXG4gICAgICAvLyB5RGVuXG4gICAgICBbXG4gICAgICAgICcweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZlZmZmZmY5M2InLFxuICAgICAgICAnMHg3YTA2NTM0YmI4YmRiNDlmZDVlOWU2NjMyNzIyYzI5ODk0NjdjMWJmYzhlOGQ5NzhkZmI0MjVkMjY4NWMyNTczJyxcbiAgICAgICAgJzB4NjQ4NGFhNzE2NTQ1Y2EyY2YzYTcwYzNmYThmZTMzN2UwYTNkMjExNjJmMGQ2Mjk5YTdiZjgxOTJiZmQyYTc2ZicsXG4gICAgICAgICcweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEnLCAvLyBMQVNUIDFcbiAgICAgIF0sXG4gICAgXS5tYXAoKGkpID0+IGkubWFwKChqKSA9PiBCaWdJbnQoaikpKSBhcyBbYmlnaW50W10sIGJpZ2ludFtdLCBiaWdpbnRbXSwgYmlnaW50W11dXG4gICkpKCk7XG5jb25zdCBtYXBTV1UgPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIG1hcFRvQ3VydmVTaW1wbGVTV1UoRnBrMSwge1xuICAgIEE6IEJpZ0ludCgnMHgzZjg3MzFhYmRkNjYxYWRjYTA4YTU1NThmMGY1ZDI3MmU5NTNkMzYzY2I2ZjBlNWQ0MDU0NDdjMDFhNDQ0NTMzJyksXG4gICAgQjogQmlnSW50KCcxNzcxJyksXG4gICAgWjogRnBrMS5jcmVhdGUoQmlnSW50KCctMTEnKSksXG4gIH0pKSgpO1xuXG4vKiogSGFzaGluZyAvIGVuY29kaW5nIHRvIHNlY3AyNTZrMSBwb2ludHMgLyBmaWVsZC4gUkZDIDkzODAgbWV0aG9kcy4gKi9cbmV4cG9ydCBjb25zdCBzZWNwMjU2azFfaGFzaGVyOiBIMkNIYXNoZXI8V2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50Pj4gPSAvKiBAX19QVVJFX18gKi8gKCgpID0+XG4gIGNyZWF0ZUhhc2hlcihcbiAgICBQb2ludGsxLFxuICAgIChzY2FsYXJzOiBiaWdpbnRbXSkgPT4ge1xuICAgICAgY29uc3QgeyB4LCB5IH0gPSBtYXBTV1UoRnBrMS5jcmVhdGUoc2NhbGFyc1swXSkpO1xuICAgICAgcmV0dXJuIGlzb01hcCh4LCB5KTtcbiAgICB9LFxuICAgIHtcbiAgICAgIERTVDogJ3NlY3AyNTZrMV9YTUQ6U0hBLTI1Nl9TU1dVX1JPXycsXG4gICAgICBlbmNvZGVEU1Q6ICdzZWNwMjU2azFfWE1EOlNIQS0yNTZfU1NXVV9OVV8nLFxuICAgICAgcDogRnBrMS5PUkRFUixcbiAgICAgIG06IDEsXG4gICAgICBrOiAxMjgsXG4gICAgICBleHBhbmQ6ICd4bWQnLFxuICAgICAgaGFzaDogc2hhMjU2LFxuICAgIH1cbiAgKSkoKTtcbiIsICIvKipcbiAqIE1ldGhvZHMgZm9yIGVsbGlwdGljIGN1cnZlIG11bHRpcGxpY2F0aW9uIGJ5IHNjYWxhcnMuXG4gKiBDb250YWlucyB3TkFGLCBwaXBwZW5nZXIuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7IGJpdExlbiwgYml0TWFzaywgdHlwZSBTaWduZXIgfSBmcm9tICcuLi91dGlscy50cyc7XG5pbXBvcnQgeyBGaWVsZCwgRnBJbnZlcnRCYXRjaCwgdmFsaWRhdGVGaWVsZCwgdHlwZSBJRmllbGQgfSBmcm9tICcuL21vZHVsYXIudHMnO1xuXG5jb25zdCBfMG4gPSAvKiBAX19QVVJFX18gKi8gQmlnSW50KDApO1xuY29uc3QgXzFuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxKTtcblxuZXhwb3J0IHR5cGUgQWZmaW5lUG9pbnQ8VD4gPSB7XG4gIHg6IFQ7XG4gIHk6IFQ7XG59ICYgeyBaPzogbmV2ZXIgfTtcblxuLy8gV2UgY2FuJ3QgXCJhYnN0cmFjdCBvdXRcIiBjb29yZGluYXRlcyAoWCwgWSwgWjsgYW5kIFQgaW4gRWR3YXJkcyk6IGFyZ3VtZW50IG5hbWVzIG9mIGNvbnN0cnVjdG9yXG4vLyBhcmUgbm90IGFjY2Vzc2libGUuIFNlZSBUeXBlc2NyaXB0IGdoLTU2MDkzLCBnaC00MTU5NC5cbi8vXG4vLyBXZSBoYXZlIHRvIHVzZSByZWN1cnNpdmUgdHlwZXMsIHNvIGl0IHdpbGwgcmV0dXJuIGFjdHVhbCBwb2ludCwgbm90IGNvbnN0YWluZWQgYEN1cnZlUG9pbnRgLlxuLy8gSWYsIGF0IGFueSBwb2ludCwgUCBpcyBgYW55YCwgaXQgd2lsbCBlcmFzZSBhbGwgdHlwZXMgYW5kIHJlcGxhY2UgaXRcbi8vIHdpdGggYGFueWAsIGJlY2F1c2Ugb2YgcmVjdXJzaW9uLCBgYW55IGltcGxlbWVudHMgQ3VydmVQb2ludGAsXG4vLyBidXQgd2UgbG9zZSBhbGwgY29uc3RyYWlucyBvbiBtZXRob2RzLlxuXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGFsbCBlbGxpcHRpYyBjdXJ2ZSBQb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIEN1cnZlUG9pbnQ8RiwgUCBleHRlbmRzIEN1cnZlUG9pbnQ8RiwgUD4+IHtcbiAgLyoqIEFmZmluZSB4IGNvb3JkaW5hdGUuIERpZmZlcmVudCBmcm9tIHByb2plY3RpdmUgLyBleHRlbmRlZCBYIGNvb3JkaW5hdGUuICovXG4gIHg6IEY7XG4gIC8qKiBBZmZpbmUgeSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIC8gZXh0ZW5kZWQgWSBjb29yZGluYXRlLiAqL1xuICB5OiBGO1xuICBaPzogRjtcbiAgZG91YmxlKCk6IFA7XG4gIG5lZ2F0ZSgpOiBQO1xuICBhZGQob3RoZXI6IFApOiBQO1xuICBzdWJ0cmFjdChvdGhlcjogUCk6IFA7XG4gIGVxdWFscyhvdGhlcjogUCk6IGJvb2xlYW47XG4gIG11bHRpcGx5KHNjYWxhcjogYmlnaW50KTogUDtcbiAgYXNzZXJ0VmFsaWRpdHkoKTogdm9pZDtcbiAgY2xlYXJDb2ZhY3RvcigpOiBQO1xuICBpczAoKTogYm9vbGVhbjtcbiAgaXNUb3JzaW9uRnJlZSgpOiBib29sZWFuO1xuICBpc1NtYWxsT3JkZXIoKTogYm9vbGVhbjtcbiAgbXVsdGlwbHlVbnNhZmUoc2NhbGFyOiBiaWdpbnQpOiBQO1xuICAvKipcbiAgICogTWFzc2l2ZWx5IHNwZWVkcyB1cCBgcC5tdWx0aXBseShuKWAgYnkgdXNpbmcgcHJlY29tcHV0ZSB0YWJsZXMgKGNhY2hpbmcpLiBTZWUge0BsaW5rIHdOQUZ9LlxuICAgKiBAcGFyYW0gaXNMYXp5IGNhbGN1bGF0ZSBjYWNoZSBub3cuIERlZmF1bHQgKHRydWUpIGVuc3VyZXMgaXQncyBkZWZlcnJlZCB0byBmaXJzdCBgbXVsdGlwbHkoKWBcbiAgICovXG4gIHByZWNvbXB1dGUod2luZG93U2l6ZT86IG51bWJlciwgaXNMYXp5PzogYm9vbGVhbik6IFA7XG4gIC8qKiBDb252ZXJ0cyBwb2ludCB0byAyRCB4eSBhZmZpbmUgY29vcmRpbmF0ZXMgKi9cbiAgdG9BZmZpbmUoaW52ZXJ0ZWRaPzogRik6IEFmZmluZVBvaW50PEY+O1xuICB0b0J5dGVzKCk6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KCk6IHN0cmluZztcbn1cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhbGwgZWxsaXB0aWMgY3VydmUgUG9pbnQgY29uc3RydWN0b3JzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDdXJ2ZVBvaW50Q29uczxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PiB7XG4gIFtTeW1ib2wuaGFzSW5zdGFuY2VdOiAoaXRlbTogdW5rbm93bikgPT4gYm9vbGVhbjtcbiAgQkFTRTogUDtcbiAgWkVSTzogUDtcbiAgLyoqIEZpZWxkIGZvciBiYXNpYyBjdXJ2ZSBtYXRoICovXG4gIEZwOiBJRmllbGQ8UF9GPFA+PjtcbiAgLyoqIFNjYWxhciBmaWVsZCwgZm9yIHNjYWxhcnMgaW4gbXVsdGlwbHkgYW5kIG90aGVycyAqL1xuICBGbjogSUZpZWxkPGJpZ2ludD47XG4gIC8qKiBDcmVhdGVzIHBvaW50IGZyb20geCwgeS4gRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgZnJvbUFmZmluZShwOiBBZmZpbmVQb2ludDxQX0Y8UD4+KTogUDtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogUDtcbiAgZnJvbUhleChoZXg6IHN0cmluZyk6IFA7XG59XG5cbi8vIFR5cGUgaW5mZXJlbmNlIGhlbHBlcnM6IFBDIC0gUG9pbnRDb25zdHJ1Y3RvciwgUCAtIFBvaW50LCBGcCAtIEZpZWxkIGVsZW1lbnRcbi8vIFNob3J0IG5hbWVzLCBiZWNhdXNlIHdlIHVzZSB0aGVtIGEgbG90IGluIHJlc3VsdCB0eXBlczpcbi8vICogd2UgY2FuJ3QgZG8gJ1AgPSBHZXRDdXJ2ZVBvaW50PFBDPic6IHRoaXMgaXMgZGVmYXVsdCB2YWx1ZSBhbmQgZG9lc24ndCBjb25zdHJhaW4gYW55dGhpbmdcbi8vICogd2UgY2FuJ3QgZG8gJ3R5cGUgWCA9IEdldEN1cnZlUG9pbnQ8UEM+JzogaXQgd29uJ3QgYmUgYWNjZXNpYmxlIGZvciBhcmd1bWVudHMvcmV0dXJuIHR5cGVzXG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PmAgY29uc3RyYWludHMgZnJvbSBpbnRlcmZhY2UgZGVmaW5pdGlvblxuLy8gICB3b24ndCBwcm9wYWdhdGUsIGlmIGBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPGFueT5gOiB0aGUgUCB3b3VsZCBiZSAnYW55Jywgd2hpY2ggaXMgaW5jb3JyZWN0XG4vLyAqIFBDIGNvdWxkIGJlIHN1cGVyIHNwZWNpZmljIHdpdGggc3VwZXIgc3BlY2lmaWMgUCwgd2hpY2ggaW1wbGVtZW50cyBDdXJ2ZVBvaW50PGFueSwgUD4uXG4vLyAgIHRoaXMgbWVhbnMgd2UgbmVlZCB0byBkbyBzdHVmZiBsaWtlXG4vLyAgIGBmdW5jdGlvbiB0ZXN0PFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KGBcbi8vICAgaWYgd2Ugd2FudCB0eXBlIHNhZmV0eSBhcm91bmQgUCwgb3RoZXJ3aXNlIFBDX1A8UEM+IHdpbGwgYmUgYW55XG5cbi8qKiBSZXR1cm5zIEZwIHR5cGUgZnJvbSBQb2ludCAoUF9GPFA+ID09IFAuRikgKi9cbmV4cG9ydCB0eXBlIFBfRjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+PiA9IFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGluZmVyIEYsIFA+ID8gRiA6IG5ldmVyO1xuLyoqIFJldHVybnMgRnAgdHlwZSBmcm9tIFBvaW50Q29ucyAoUENfRjxQQz4gPT0gUEMuUC5GKSAqL1xuZXhwb3J0IHR5cGUgUENfRjxQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+Pj4gPSBQQ1snRnAnXVsnWkVSTyddO1xuLyoqIFJldHVybnMgUG9pbnQgdHlwZSBmcm9tIFBvaW50Q29ucyAoUENfUDxQQz4gPT0gUEMuUCkgKi9cbmV4cG9ydCB0eXBlIFBDX1A8UEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxDdXJ2ZVBvaW50PGFueSwgYW55Pj4+ID0gUENbJ1pFUk8nXTtcblxuLy8gVWdseSBoYWNrIHRvIGdldCBwcm9wZXIgdHlwZSBpbmZlcmVuY2UsIGJlY2F1c2UgaW4gdHlwZXNjcmlwdCBmYWlscyB0byBpbmZlciByZXN1cnNpdmVseS5cbi8vIFRoZSBoYWNrIGFsbG93cyB0byBkbyB1cCB0byAxMCBjaGFpbmVkIG9wZXJhdGlvbnMgd2l0aG91dCBhcHBseWluZyB0eXBlIGVyYXN1cmUuXG4vL1xuLy8gVHlwZXMgd2hpY2ggd29uJ3Qgd29yazpcbi8vICogYEN1cnZlUG9pbnRDb25zPEN1cnZlUG9pbnQ8YW55LCBhbnk+PmAsIHdpbGwgcmV0dXJuIGBhbnlgIGFmdGVyIDEgb3BlcmF0aW9uXG4vLyAqIGBDdXJ2ZVBvaW50Q29uczxhbnk+OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+IGV4dGVuZHMgQ3VydmVQb2ludENvbnM8YW55PiA9IGZhbHNlYFxuLy8gKiBgUCBleHRlbmRzIEN1cnZlUG9pbnQsIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD5gXG4vLyAgICAgKiBJdCBjYW4ndCBpbmZlciBQIGZyb20gUEMgYWxvbmVcbi8vICAgICAqIFRvbyBtYW55IHJlbGF0aW9ucyBiZXR3ZWVuIEYsIFAgJiBQQ1xuLy8gICAgICogSXQgd2lsbCBpbmZlciBQL0YgaWYgYGFyZzogQ3VydmVQb2ludENvbnM8RiwgUD5gLCBidXQgd2lsbCBmYWlsIGlmIFBDIGlzIGdlbmVyaWNcbi8vICAgICAqIEl0IHdpbGwgd29yayBjb3JyZWN0bHkgaWYgdGhlcmUgaXMgYW4gYWRkaXRpb25hbCBhcmd1bWVudCBvZiB0eXBlIFBcbi8vICAgICAqIEJ1dCBnZW5lcmFsbHksIHdlIGRvbid0IHdhbnQgdG8gcGFyYW1ldHJpemUgYEN1cnZlUG9pbnRDb25zYCBvdmVyIGBGYDogaXQgd2lsbCBjb21wbGljYXRlXG4vLyAgICAgICB0eXBlcywgbWFraW5nIHRoZW0gdW4taW5mZXJhYmxlXG4vLyBwcmV0dGllci1pZ25vcmVcbmV4cG9ydCB0eXBlIFBDX0FOWSA9IEN1cnZlUG9pbnRDb25zPFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSxcbiAgQ3VydmVQb2ludDxhbnksXG4gIEN1cnZlUG9pbnQ8YW55LFxuICBDdXJ2ZVBvaW50PGFueSwgYW55PlxuICA+Pj4+Pj4+Pj5cbj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3VydmVMZW5ndGhzIHtcbiAgc2VjcmV0S2V5PzogbnVtYmVyO1xuICBwdWJsaWNLZXk/OiBudW1iZXI7XG4gIHB1YmxpY0tleVVuY29tcHJlc3NlZD86IG51bWJlcjtcbiAgcHVibGljS2V5SGFzUHJlZml4PzogYm9vbGVhbjtcbiAgc2lnbmF0dXJlPzogbnVtYmVyO1xuICBzZWVkPzogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBNYXBwZXI8VD4gPSAoaTogVFtdKSA9PiBUW107XG5cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGVDdDxUIGV4dGVuZHMgeyBuZWdhdGU6ICgpID0+IFQgfT4oY29uZGl0aW9uOiBib29sZWFuLCBpdGVtOiBUKTogVCB7XG4gIGNvbnN0IG5lZyA9IGl0ZW0ubmVnYXRlKCk7XG4gIHJldHVybiBjb25kaXRpb24gPyBuZWcgOiBpdGVtO1xufVxuXG4vKipcbiAqIFRha2VzIGEgYnVuY2ggb2YgUHJvamVjdGl2ZSBQb2ludHMgYnV0IGV4ZWN1dGVzIG9ubHkgb25lXG4gKiBpbnZlcnNpb24gb24gYWxsIG9mIHRoZW0uIEludmVyc2lvbiBpcyB2ZXJ5IHNsb3cgb3BlcmF0aW9uLFxuICogc28gdGhpcyBpbXByb3ZlcyBwZXJmb3JtYW5jZSBtYXNzaXZlbHkuXG4gKiBPcHRpbWl6YXRpb246IGNvbnZlcnRzIGEgbGlzdCBvZiBwcm9qZWN0aXZlIHBvaW50cyB0byBhIGxpc3Qgb2YgaWRlbnRpY2FsIHBvaW50cyB3aXRoIFo9MS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVo8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIGM6IFBDLFxuICBwb2ludHM6IFBbXVxuKTogUFtdIHtcbiAgY29uc3QgaW52ZXJ0ZWRacyA9IEZwSW52ZXJ0QmF0Y2goXG4gICAgYy5GcCxcbiAgICBwb2ludHMubWFwKChwKSA9PiBwLlohKVxuICApO1xuICByZXR1cm4gcG9pbnRzLm1hcCgocCwgaSkgPT4gYy5mcm9tQWZmaW5lKHAudG9BZmZpbmUoaW52ZXJ0ZWRac1tpXSkpKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVXKFc6IG51bWJlciwgYml0czogbnVtYmVyKSB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoVykgfHwgVyA8PSAwIHx8IFcgPiBiaXRzKVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB3aW5kb3cgc2l6ZSwgZXhwZWN0ZWQgWzEuLicgKyBiaXRzICsgJ10sIGdvdCBXPScgKyBXKTtcbn1cblxuLyoqIEludGVybmFsIHdOQUYgb3B0cyBmb3Igc3BlY2lmaWMgVyBhbmQgc2NhbGFyQml0cyAqL1xudHlwZSBXT3B0cyA9IHtcbiAgd2luZG93czogbnVtYmVyO1xuICB3aW5kb3dTaXplOiBudW1iZXI7XG4gIG1hc2s6IGJpZ2ludDtcbiAgbWF4TnVtYmVyOiBudW1iZXI7XG4gIHNoaWZ0Qnk6IGJpZ2ludDtcbn07XG5cbmZ1bmN0aW9uIGNhbGNXT3B0cyhXOiBudW1iZXIsIHNjYWxhckJpdHM6IG51bWJlcik6IFdPcHRzIHtcbiAgdmFsaWRhdGVXKFcsIHNjYWxhckJpdHMpO1xuICBjb25zdCB3aW5kb3dzID0gTWF0aC5jZWlsKHNjYWxhckJpdHMgLyBXKSArIDE7IC8vIFc9OCAzMy4gTm90IDMyLCBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCB3aW5kb3dTaXplID0gMiAqKiAoVyAtIDEpOyAvLyBXPTggMTI4LiBOb3QgMjU2LCBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCBtYXhOdW1iZXIgPSAyICoqIFc7IC8vIFc9OCAyNTZcbiAgY29uc3QgbWFzayA9IGJpdE1hc2soVyk7IC8vIFc9OCAyNTUgPT0gbWFzayAwYjExMTExMTExXG4gIGNvbnN0IHNoaWZ0QnkgPSBCaWdJbnQoVyk7IC8vIFc9OCA4XG4gIHJldHVybiB7IHdpbmRvd3MsIHdpbmRvd1NpemUsIG1hc2ssIG1heE51bWJlciwgc2hpZnRCeSB9O1xufVxuXG5mdW5jdGlvbiBjYWxjT2Zmc2V0cyhuOiBiaWdpbnQsIHdpbmRvdzogbnVtYmVyLCB3T3B0czogV09wdHMpIHtcbiAgY29uc3QgeyB3aW5kb3dTaXplLCBtYXNrLCBtYXhOdW1iZXIsIHNoaWZ0QnkgfSA9IHdPcHRzO1xuICBsZXQgd2JpdHMgPSBOdW1iZXIobiAmIG1hc2spOyAvLyBleHRyYWN0IFcgYml0cy5cbiAgbGV0IG5leHROID0gbiA+PiBzaGlmdEJ5OyAvLyBzaGlmdCBudW1iZXIgYnkgVyBiaXRzLlxuXG4gIC8vIFdoYXQgYWN0dWFsbHkgaGFwcGVucyBoZXJlOlxuICAvLyBjb25zdCBoaWdoZXN0Qml0ID0gTnVtYmVyKG1hc2sgXiAobWFzayA+PiAxbikpO1xuICAvLyBsZXQgd2JpdHMyID0gd2JpdHMgLSAxOyAvLyBza2lwIHplcm9cbiAgLy8gaWYgKHdiaXRzMiAmIGhpZ2hlc3RCaXQpIHsgd2JpdHMyIF49IE51bWJlcihtYXNrKTsgLy8gKH4pO1xuXG4gIC8vIHNwbGl0IGlmIGJpdHMgPiBtYXg6ICsyMjQgPT4gMjU2LTMyXG4gIGlmICh3Yml0cyA+IHdpbmRvd1NpemUpIHtcbiAgICAvLyB3ZSBza2lwIHplcm8sIHdoaWNoIG1lYW5zIGluc3RlYWQgb2YgYD49IHNpemUtMWAsIHdlIGRvIGA+IHNpemVgXG4gICAgd2JpdHMgLT0gbWF4TnVtYmVyOyAvLyAtMzIsIGNhbiBiZSBtYXhOdW1iZXIgLSB3Yml0cywgYnV0IHRoZW4gd2UgbmVlZCB0byBzZXQgaXNOZWcgaGVyZS5cbiAgICBuZXh0TiArPSBfMW47IC8vICsyNTYgKGNhcnJ5KVxuICB9XG4gIGNvbnN0IG9mZnNldFN0YXJ0ID0gd2luZG93ICogd2luZG93U2l6ZTtcbiAgY29uc3Qgb2Zmc2V0ID0gb2Zmc2V0U3RhcnQgKyBNYXRoLmFicyh3Yml0cykgLSAxOyAvLyAtMSBiZWNhdXNlIHdlIHNraXAgemVyb1xuICBjb25zdCBpc1plcm8gPSB3Yml0cyA9PT0gMDsgLy8gaXMgY3VycmVudCB3aW5kb3cgc2xpY2UgYSAwP1xuICBjb25zdCBpc05lZyA9IHdiaXRzIDwgMDsgLy8gaXMgY3VycmVudCB3aW5kb3cgc2xpY2UgbmVnYXRpdmU/XG4gIGNvbnN0IGlzTmVnRiA9IHdpbmRvdyAlIDIgIT09IDA7IC8vIGZha2UgcmFuZG9tIHN0YXRlbWVudCBmb3Igbm9pc2VcbiAgY29uc3Qgb2Zmc2V0RiA9IG9mZnNldFN0YXJ0OyAvLyBmYWtlIG9mZnNldCBmb3Igbm9pc2VcbiAgcmV0dXJuIHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZywgaXNOZWdGLCBvZmZzZXRGIH07XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50czogYW55W10sIGM6IGFueSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkocG9pbnRzKSkgdGhyb3cgbmV3IEVycm9yKCdhcnJheSBleHBlY3RlZCcpO1xuICBwb2ludHMuZm9yRWFjaCgocCwgaSkgPT4ge1xuICAgIGlmICghKHAgaW5zdGFuY2VvZiBjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHBvaW50IGF0IGluZGV4ICcgKyBpKTtcbiAgfSk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFyczogYW55W10sIGZpZWxkOiBhbnkpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjYWxhcnMpKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG9mIHNjYWxhcnMgZXhwZWN0ZWQnKTtcbiAgc2NhbGFycy5mb3JFYWNoKChzLCBpKSA9PiB7XG4gICAgaWYgKCFmaWVsZC5pc1ZhbGlkKHMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyIGF0IGluZGV4ICcgKyBpKTtcbiAgfSk7XG59XG5cbi8vIFNpbmNlIHBvaW50cyBpbiBkaWZmZXJlbnQgZ3JvdXBzIGNhbm5vdCBiZSBlcXVhbCAoZGlmZmVyZW50IG9iamVjdCBjb25zdHJ1Y3RvciksXG4vLyB3ZSBjYW4gaGF2ZSBzaW5nbGUgcGxhY2UgdG8gc3RvcmUgcHJlY29tcHV0ZXMuXG4vLyBBbGxvd3MgdG8gbWFrZSBwb2ludHMgZnJvemVuIC8gaW1tdXRhYmxlLlxuY29uc3QgcG9pbnRQcmVjb21wdXRlcyA9IG5ldyBXZWFrTWFwPGFueSwgYW55W10+KCk7XG5jb25zdCBwb2ludFdpbmRvd1NpemVzID0gbmV3IFdlYWtNYXA8YW55LCBudW1iZXI+KCk7XG5cbmZ1bmN0aW9uIGdldFcoUDogYW55KTogbnVtYmVyIHtcbiAgLy8gVG8gZGlzYWJsZSBwcmVjb21wdXRlczpcbiAgLy8gcmV0dXJuIDE7XG4gIHJldHVybiBwb2ludFdpbmRvd1NpemVzLmdldChQKSB8fCAxO1xufVxuXG5mdW5jdGlvbiBhc3NlcnQwKG46IGJpZ2ludCk6IHZvaWQge1xuICBpZiAobiAhPT0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgd05BRicpO1xufVxuXG4vKipcbiAqIEVsbGlwdGljIGN1cnZlIG11bHRpcGxpY2F0aW9uIG9mIFBvaW50IGJ5IHNjYWxhci4gRnJhZ2lsZS5cbiAqIFRhYmxlIGdlbmVyYXRpb24gdGFrZXMgKiozME1CIG9mIHJhbSBhbmQgMTBtcyBvbiBoaWdoLWVuZCBDUFUqKixcbiAqIGJ1dCBtYXkgdGFrZSBtdWNoIGxvbmdlciBvbiBzbG93IGRldmljZXMuIEFjdHVhbCBnZW5lcmF0aW9uIHdpbGwgaGFwcGVuIG9uXG4gKiBmaXJzdCBjYWxsIG9mIGBtdWx0aXBseSgpYC4gQnkgZGVmYXVsdCwgYEJBU0VgIHBvaW50IGlzIHByZWNvbXB1dGVkLlxuICpcbiAqIFNjYWxhcnMgc2hvdWxkIGFsd2F5cyBiZSBsZXNzIHRoYW4gY3VydmUgb3JkZXI6IHRoaXMgc2hvdWxkIGJlIGNoZWNrZWQgaW5zaWRlIG9mIGEgY3VydmUgaXRzZWxmLlxuICogQ3JlYXRlcyBwcmVjb21wdXRhdGlvbiB0YWJsZXMgZm9yIGZhc3QgbXVsdGlwbGljYXRpb246XG4gKiAtIHByaXZhdGUgc2NhbGFyIGlzIHNwbGl0IGJ5IGZpeGVkIHNpemUgd2luZG93cyBvZiBXIGJpdHNcbiAqIC0gZXZlcnkgd2luZG93IHBvaW50IGlzIGNvbGxlY3RlZCBmcm9tIHdpbmRvdydzIHRhYmxlICYgYWRkZWQgdG8gYWNjdW11bGF0b3JcbiAqIC0gc2luY2Ugd2luZG93cyBhcmUgZGlmZmVyZW50LCBzYW1lIHBvaW50IGluc2lkZSB0YWJsZXMgd29uJ3QgYmUgYWNjZXNzZWQgbW9yZSB0aGFuIG9uY2UgcGVyIGNhbGNcbiAqIC0gZWFjaCBtdWx0aXBsaWNhdGlvbiBpcyAnTWF0aC5jZWlsKENVUlZFX09SREVSIC8gXHVEODM1XHVEQzRBKSArIDEnIHBvaW50IGFkZGl0aW9ucyAoZml4ZWQgZm9yIGFueSBzY2FsYXIpXG4gKiAtICsxIHdpbmRvdyBpcyBuZWNjZXNzYXJ5IGZvciB3TkFGXG4gKiAtIHdOQUYgcmVkdWNlcyB0YWJsZSBzaXplOiAyeCBsZXNzIG1lbW9yeSArIDJ4IGZhc3RlciBnZW5lcmF0aW9uLCBidXQgMTAlIHNsb3dlciBtdWx0aXBsaWNhdGlvblxuICpcbiAqIEB0b2RvIFJlc2VhcmNoIHJldHVybmluZyAyZCBKUyBhcnJheSBvZiB3aW5kb3dzLCBpbnN0ZWFkIG9mIGEgc2luZ2xlIHdpbmRvdy5cbiAqIFRoaXMgd291bGQgYWxsb3cgd2luZG93cyB0byBiZSBpbiBkaWZmZXJlbnQgbWVtb3J5IGxvY2F0aW9uc1xuICovXG5leHBvcnQgY2xhc3Mgd05BRjxQQyBleHRlbmRzIFBDX0FOWT4ge1xuICBwcml2YXRlIHJlYWRvbmx5IEJBU0U6IFBDX1A8UEM+O1xuICBwcml2YXRlIHJlYWRvbmx5IFpFUk86IFBDX1A8UEM+O1xuICBwcml2YXRlIHJlYWRvbmx5IEZuOiBQQ1snRm4nXTtcbiAgcmVhZG9ubHkgYml0czogbnVtYmVyO1xuXG4gIC8vIFBhcmFtZXRyaXplZCB3aXRoIGEgZ2l2ZW4gUG9pbnQgY2xhc3MgKG5vdCBpbmRpdmlkdWFsIHBvaW50KVxuICBjb25zdHJ1Y3RvcihQb2ludDogUEMsIGJpdHM6IG51bWJlcikge1xuICAgIHRoaXMuQkFTRSA9IFBvaW50LkJBU0U7XG4gICAgdGhpcy5aRVJPID0gUG9pbnQuWkVSTztcbiAgICB0aGlzLkZuID0gUG9pbnQuRm47XG4gICAgdGhpcy5iaXRzID0gYml0cztcbiAgfVxuXG4gIC8vIG5vbi1jb25zdCB0aW1lIG11bHRpcGxpY2F0aW9uIGxhZGRlclxuICBfdW5zYWZlTGFkZGVyKGVsbTogUENfUDxQQz4sIG46IGJpZ2ludCwgcDogUENfUDxQQz4gPSB0aGlzLlpFUk8pOiBQQ19QPFBDPiB7XG4gICAgbGV0IGQ6IFBDX1A8UEM+ID0gZWxtO1xuICAgIHdoaWxlIChuID4gXzBuKSB7XG4gICAgICBpZiAobiAmIF8xbikgcCA9IHAuYWRkKGQpO1xuICAgICAgZCA9IGQuZG91YmxlKCk7XG4gICAgICBuID4+PSBfMW47XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB3TkFGIHByZWNvbXB1dGF0aW9uIHdpbmRvdy4gVXNlZCBmb3IgY2FjaGluZy5cbiAgICogRGVmYXVsdCB3aW5kb3cgc2l6ZSBpcyBzZXQgYnkgYHV0aWxzLnByZWNvbXB1dGUoKWAgYW5kIGlzIGVxdWFsIHRvIDguXG4gICAqIE51bWJlciBvZiBwcmVjb21wdXRlZCBwb2ludHMgZGVwZW5kcyBvbiB0aGUgY3VydmUgc2l6ZTpcbiAgICogMl4oXHVEODM1XHVEQzRBXHUyMjEyMSkgKiAoTWF0aC5jZWlsKFx1RDgzNVx1REM1QiAvIFx1RDgzNVx1REM0QSkgKyAxKSwgd2hlcmU6XG4gICAqIC0gXHVEODM1XHVEQzRBIGlzIHRoZSB3aW5kb3cgc2l6ZVxuICAgKiAtIFx1RDgzNVx1REM1QiBpcyB0aGUgYml0bGVuZ3RoIG9mIHRoZSBjdXJ2ZSBvcmRlci5cbiAgICogRm9yIGEgMjU2LWJpdCBjdXJ2ZSBhbmQgd2luZG93IHNpemUgOCwgdGhlIG51bWJlciBvZiBwcmVjb21wdXRlZCBwb2ludHMgaXMgMTI4ICogMzMgPSA0MjI0LlxuICAgKiBAcGFyYW0gcG9pbnQgUG9pbnQgaW5zdGFuY2VcbiAgICogQHBhcmFtIFcgd2luZG93IHNpemVcbiAgICogQHJldHVybnMgcHJlY29tcHV0ZWQgcG9pbnQgdGFibGVzIGZsYXR0ZW5lZCB0byBhIHNpbmdsZSBhcnJheVxuICAgKi9cbiAgcHJpdmF0ZSBwcmVjb21wdXRlV2luZG93KHBvaW50OiBQQ19QPFBDPiwgVzogbnVtYmVyKTogUENfUDxQQz5bXSB7XG4gICAgY29uc3QgeyB3aW5kb3dzLCB3aW5kb3dTaXplIH0gPSBjYWxjV09wdHMoVywgdGhpcy5iaXRzKTtcbiAgICBjb25zdCBwb2ludHM6IFBDX1A8UEM+W10gPSBbXTtcbiAgICBsZXQgcDogUENfUDxQQz4gPSBwb2ludDtcbiAgICBsZXQgYmFzZSA9IHA7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd2luZG93czsgd2luZG93KyspIHtcbiAgICAgIGJhc2UgPSBwO1xuICAgICAgcG9pbnRzLnB1c2goYmFzZSk7XG4gICAgICAvLyBpPTEsIGJjIHdlIHNraXAgMFxuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCB3aW5kb3dTaXplOyBpKyspIHtcbiAgICAgICAgYmFzZSA9IGJhc2UuYWRkKHApO1xuICAgICAgICBwb2ludHMucHVzaChiYXNlKTtcbiAgICAgIH1cbiAgICAgIHAgPSBiYXNlLmRvdWJsZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgZWMgbXVsdGlwbGljYXRpb24gdXNpbmcgcHJlY29tcHV0ZWQgdGFibGVzIGFuZCB3LWFyeSBub24tYWRqYWNlbnQgZm9ybS5cbiAgICogTW9yZSBjb21wYWN0IGltcGxlbWVudGF0aW9uOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGF1bG1pbGxyL25vYmxlLXNlY3AyNTZrMS9ibG9iLzQ3Y2IxNjY5YjZlNTA2YWQ2NmIzNWZlN2Q3NjEzMmFlOTc0NjVkYTIvaW5kZXgudHMjTDUwMi1MNTQxXG4gICAqIEByZXR1cm5zIHJlYWwgYW5kIGZha2UgKGZvciBjb25zdC10aW1lKSBwb2ludHNcbiAgICovXG4gIHByaXZhdGUgd05BRihXOiBudW1iZXIsIHByZWNvbXB1dGVzOiBQQ19QPFBDPltdLCBuOiBiaWdpbnQpOiB7IHA6IFBDX1A8UEM+OyBmOiBQQ19QPFBDPiB9IHtcbiAgICAvLyBTY2FsYXIgc2hvdWxkIGJlIHNtYWxsZXIgdGhhbiBmaWVsZCBvcmRlclxuICAgIGlmICghdGhpcy5Gbi5pc1ZhbGlkKG4pKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2NhbGFyJyk7XG4gICAgLy8gQWNjdW11bGF0b3JzXG4gICAgbGV0IHAgPSB0aGlzLlpFUk87XG4gICAgbGV0IGYgPSB0aGlzLkJBU0U7XG4gICAgLy8gVGhpcyBjb2RlIHdhcyBmaXJzdCB3cml0dGVuIHdpdGggYXNzdW1wdGlvbiB0aGF0ICdmJyBhbmQgJ3AnIHdpbGwgbmV2ZXIgYmUgaW5maW5pdHkgcG9pbnQ6XG4gICAgLy8gc2luY2UgZWFjaCBhZGRpdGlvbiBpcyBtdWx0aXBsaWVkIGJ5IDIgKiogVywgaXQgY2Fubm90IGNhbmNlbCBlYWNoIG90aGVyLiBIb3dldmVyLFxuICAgIC8vIHRoZXJlIGlzIG5lZ2F0ZSBub3c6IGl0IGlzIHBvc3NpYmxlIHRoYXQgbmVnYXRlZCBlbGVtZW50IGZyb20gbG93IHZhbHVlXG4gICAgLy8gd291bGQgYmUgdGhlIHNhbWUgYXMgaGlnaCBlbGVtZW50LCB3aGljaCB3aWxsIGNyZWF0ZSBjYXJyeSBpbnRvIG5leHQgd2luZG93LlxuICAgIC8vIEl0J3Mgbm90IG9idmlvdXMgaG93IHRoaXMgY2FuIGZhaWwsIGJ1dCBzdGlsbCB3b3J0aCBpbnZlc3RpZ2F0aW5nIGxhdGVyLlxuICAgIGNvbnN0IHdvID0gY2FsY1dPcHRzKFcsIHRoaXMuYml0cyk7XG4gICAgZm9yIChsZXQgd2luZG93ID0gMDsgd2luZG93IDwgd28ud2luZG93czsgd2luZG93KyspIHtcbiAgICAgIC8vIChuID09PSBfMG4pIGlzIGhhbmRsZWQgYW5kIG5vdCBlYXJseS1leGl0ZWQuIGlzRXZlbiBhbmQgb2Zmc2V0RiBhcmUgdXNlZCBmb3Igbm9pc2VcbiAgICAgIGNvbnN0IHsgbmV4dE4sIG9mZnNldCwgaXNaZXJvLCBpc05lZywgaXNOZWdGLCBvZmZzZXRGIH0gPSBjYWxjT2Zmc2V0cyhuLCB3aW5kb3csIHdvKTtcbiAgICAgIG4gPSBuZXh0TjtcbiAgICAgIGlmIChpc1plcm8pIHtcbiAgICAgICAgLy8gYml0cyBhcmUgMDogYWRkIGdhcmJhZ2UgdG8gZmFrZSBwb2ludFxuICAgICAgICAvLyBJbXBvcnRhbnQgcGFydCBmb3IgY29uc3QtdGltZSBnZXRQdWJsaWNLZXk6IGFkZCByYW5kb20gXCJub2lzZVwiIHBvaW50IHRvIGYuXG4gICAgICAgIGYgPSBmLmFkZChuZWdhdGVDdChpc05lZ0YsIHByZWNvbXB1dGVzW29mZnNldEZdKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBiaXRzIGFyZSAxOiBhZGQgdG8gcmVzdWx0IHBvaW50XG4gICAgICAgIHAgPSBwLmFkZChuZWdhdGVDdChpc05lZywgcHJlY29tcHV0ZXNbb2Zmc2V0XSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3NlcnQwKG4pO1xuICAgIC8vIFJldHVybiBib3RoIHJlYWwgYW5kIGZha2UgcG9pbnRzOiBKSVQgd29uJ3QgZWxpbWluYXRlIGYuXG4gICAgLy8gQXQgdGhpcyBwb2ludCB0aGVyZSBpcyBhIHdheSB0byBGIGJlIGluZmluaXR5LXBvaW50IGV2ZW4gaWYgcCBpcyBub3QsXG4gICAgLy8gd2hpY2ggbWFrZXMgaXQgbGVzcyBjb25zdC10aW1lOiBhcm91bmQgMSBiaWdpbnQgbXVsdGlwbHkuXG4gICAgcmV0dXJuIHsgcCwgZiB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgZWMgdW5zYWZlIChub24gY29uc3QtdGltZSkgbXVsdGlwbGljYXRpb24gdXNpbmcgcHJlY29tcHV0ZWQgdGFibGVzIGFuZCB3LWFyeSBub24tYWRqYWNlbnQgZm9ybS5cbiAgICogQHBhcmFtIGFjYyBhY2N1bXVsYXRvciBwb2ludCB0byBhZGQgcmVzdWx0IG9mIG11bHRpcGxpY2F0aW9uXG4gICAqIEByZXR1cm5zIHBvaW50XG4gICAqL1xuICBwcml2YXRlIHdOQUZVbnNhZmUoXG4gICAgVzogbnVtYmVyLFxuICAgIHByZWNvbXB1dGVzOiBQQ19QPFBDPltdLFxuICAgIG46IGJpZ2ludCxcbiAgICBhY2M6IFBDX1A8UEM+ID0gdGhpcy5aRVJPXG4gICk6IFBDX1A8UEM+IHtcbiAgICBjb25zdCB3byA9IGNhbGNXT3B0cyhXLCB0aGlzLmJpdHMpO1xuICAgIGZvciAobGV0IHdpbmRvdyA9IDA7IHdpbmRvdyA8IHdvLndpbmRvd3M7IHdpbmRvdysrKSB7XG4gICAgICBpZiAobiA9PT0gXzBuKSBicmVhazsgLy8gRWFybHktZXhpdCwgc2tpcCAwIHZhbHVlXG4gICAgICBjb25zdCB7IG5leHROLCBvZmZzZXQsIGlzWmVybywgaXNOZWcgfSA9IGNhbGNPZmZzZXRzKG4sIHdpbmRvdywgd28pO1xuICAgICAgbiA9IG5leHROO1xuICAgICAgaWYgKGlzWmVybykge1xuICAgICAgICAvLyBXaW5kb3cgYml0cyBhcmUgMDogc2tpcCBwcm9jZXNzaW5nLlxuICAgICAgICAvLyBNb3ZlIHRvIG5leHQgd2luZG93LlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBwcmVjb21wdXRlc1tvZmZzZXRdO1xuICAgICAgICBhY2MgPSBhY2MuYWRkKGlzTmVnID8gaXRlbS5uZWdhdGUoKSA6IGl0ZW0pOyAvLyBSZS11c2luZyBhY2MgYWxsb3dzIHRvIHNhdmUgYWRkcyBpbiBNU01cbiAgICAgIH1cbiAgICB9XG4gICAgYXNzZXJ0MChuKTtcbiAgICByZXR1cm4gYWNjO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmVjb21wdXRlcyhXOiBudW1iZXIsIHBvaW50OiBQQ19QPFBDPiwgdHJhbnNmb3JtPzogTWFwcGVyPFBDX1A8UEM+Pik6IFBDX1A8UEM+W10ge1xuICAgIC8vIENhbGN1bGF0ZSBwcmVjb21wdXRlcyBvbiBhIGZpcnN0IHJ1biwgcmV1c2UgdGhlbSBhZnRlclxuICAgIGxldCBjb21wID0gcG9pbnRQcmVjb21wdXRlcy5nZXQocG9pbnQpO1xuICAgIGlmICghY29tcCkge1xuICAgICAgY29tcCA9IHRoaXMucHJlY29tcHV0ZVdpbmRvdyhwb2ludCwgVykgYXMgUENfUDxQQz5bXTtcbiAgICAgIGlmIChXICE9PSAxKSB7XG4gICAgICAgIC8vIERvaW5nIHRyYW5zZm9ybSBvdXRzaWRlIG9mIGlmIGJyaW5ncyAxNSUgcGVyZiBoaXRcbiAgICAgICAgaWYgKHR5cGVvZiB0cmFuc2Zvcm0gPT09ICdmdW5jdGlvbicpIGNvbXAgPSB0cmFuc2Zvcm0oY29tcCk7XG4gICAgICAgIHBvaW50UHJlY29tcHV0ZXMuc2V0KHBvaW50LCBjb21wKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbXA7XG4gIH1cblxuICBjYWNoZWQoXG4gICAgcG9pbnQ6IFBDX1A8UEM+LFxuICAgIHNjYWxhcjogYmlnaW50LFxuICAgIHRyYW5zZm9ybT86IE1hcHBlcjxQQ19QPFBDPj5cbiAgKTogeyBwOiBQQ19QPFBDPjsgZjogUENfUDxQQz4gfSB7XG4gICAgY29uc3QgVyA9IGdldFcocG9pbnQpO1xuICAgIHJldHVybiB0aGlzLndOQUYoVywgdGhpcy5nZXRQcmVjb21wdXRlcyhXLCBwb2ludCwgdHJhbnNmb3JtKSwgc2NhbGFyKTtcbiAgfVxuXG4gIHVuc2FmZShwb2ludDogUENfUDxQQz4sIHNjYWxhcjogYmlnaW50LCB0cmFuc2Zvcm0/OiBNYXBwZXI8UENfUDxQQz4+LCBwcmV2PzogUENfUDxQQz4pOiBQQ19QPFBDPiB7XG4gICAgY29uc3QgVyA9IGdldFcocG9pbnQpO1xuICAgIGlmIChXID09PSAxKSByZXR1cm4gdGhpcy5fdW5zYWZlTGFkZGVyKHBvaW50LCBzY2FsYXIsIHByZXYpOyAvLyBGb3IgVz0xIGxhZGRlciBpcyB+eDIgZmFzdGVyXG4gICAgcmV0dXJuIHRoaXMud05BRlVuc2FmZShXLCB0aGlzLmdldFByZWNvbXB1dGVzKFcsIHBvaW50LCB0cmFuc2Zvcm0pLCBzY2FsYXIsIHByZXYpO1xuICB9XG5cbiAgLy8gV2UgY2FsY3VsYXRlIHByZWNvbXB1dGVzIGZvciBlbGxpcHRpYyBjdXJ2ZSBwb2ludCBtdWx0aXBsaWNhdGlvblxuICAvLyB1c2luZyB3aW5kb3dlZCBtZXRob2QuIFRoaXMgc3BlY2lmaWVzIHdpbmRvdyBzaXplIGFuZFxuICAvLyBzdG9yZXMgcHJlY29tcHV0ZWQgdmFsdWVzLiBVc3VhbGx5IG9ubHkgYmFzZSBwb2ludCB3b3VsZCBiZSBwcmVjb21wdXRlZC5cbiAgY3JlYXRlQ2FjaGUoUDogUENfUDxQQz4sIFc6IG51bWJlcik6IHZvaWQge1xuICAgIHZhbGlkYXRlVyhXLCB0aGlzLmJpdHMpO1xuICAgIHBvaW50V2luZG93U2l6ZXMuc2V0KFAsIFcpO1xuICAgIHBvaW50UHJlY29tcHV0ZXMuZGVsZXRlKFApO1xuICB9XG5cbiAgaGFzQ2FjaGUoZWxtOiBQQ19QPFBDPik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBnZXRXKGVsbSkgIT09IDE7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmRvbW9ycGhpc20tc3BlY2lmaWMgbXVsdGlwbGljYXRpb24gZm9yIEtvYmxpdHogY3VydmVzLlxuICogQ29zdDogMTI4IGRibCwgMC0yNTYgYWRkcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bEVuZG9VbnNhZmU8UCBleHRlbmRzIEN1cnZlUG9pbnQ8YW55LCBQPiwgUEMgZXh0ZW5kcyBDdXJ2ZVBvaW50Q29uczxQPj4oXG4gIFBvaW50OiBQQyxcbiAgcG9pbnQ6IFAsXG4gIGsxOiBiaWdpbnQsXG4gIGsyOiBiaWdpbnRcbik6IHsgcDE6IFA7IHAyOiBQIH0ge1xuICBsZXQgYWNjID0gcG9pbnQ7XG4gIGxldCBwMSA9IFBvaW50LlpFUk87XG4gIGxldCBwMiA9IFBvaW50LlpFUk87XG4gIHdoaWxlIChrMSA+IF8wbiB8fCBrMiA+IF8wbikge1xuICAgIGlmIChrMSAmIF8xbikgcDEgPSBwMS5hZGQoYWNjKTtcbiAgICBpZiAoazIgJiBfMW4pIHAyID0gcDIuYWRkKGFjYyk7XG4gICAgYWNjID0gYWNjLmRvdWJsZSgpO1xuICAgIGsxID4+PSBfMW47XG4gICAgazIgPj49IF8xbjtcbiAgfVxuICByZXR1cm4geyBwMSwgcDIgfTtcbn1cblxuLyoqXG4gKiBQaXBwZW5nZXIgYWxnb3JpdGhtIGZvciBtdWx0aS1zY2FsYXIgbXVsdGlwbGljYXRpb24gKE1TTSwgUGEgKyBRYiArIFJjICsgLi4uKS5cbiAqIDMweCBmYXN0ZXIgdnMgbmFpdmUgYWRkaXRpb24gb24gTD00MDk2LCAxMHggZmFzdGVyIHRoYW4gcHJlY29tcHV0ZXMuXG4gKiBGb3IgTj0yNTRiaXQsIEw9MSwgaXQgZG9lczogMTAyNCBBREQgKyAyNTQgREJMLiBGb3IgTD01OiAxNTM2IEFERCArIDI1NCBEQkwuXG4gKiBBbGdvcml0aG1pY2FsbHkgY29uc3RhbnQtdGltZSAoZm9yIHNhbWUgTCksIGV2ZW4gd2hlbiAxIHBvaW50ICsgc2NhbGFyLCBvciB3aGVuIHNjYWxhciA9IDAuXG4gKiBAcGFyYW0gYyBDdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGZpZWxkTiBmaWVsZCBvdmVyIENVUlZFLk4gLSBpbXBvcnRhbnQgdGhhdCBpdCdzIG5vdCBvdmVyIENVUlZFLlBcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgTCBjdXJ2ZSBwb2ludHNcbiAqIEBwYXJhbSBzY2FsYXJzIGFycmF5IG9mIEwgc2NhbGFycyAoYWthIHNlY3JldCBrZXlzIC8gYmlnaW50cylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpcHBlbmdlcjxQIGV4dGVuZHMgQ3VydmVQb2ludDxhbnksIFA+LCBQQyBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFA+PihcbiAgYzogUEMsXG4gIHBvaW50czogUFtdLFxuICBzY2FsYXJzOiBiaWdpbnRbXVxuKTogUCB7XG4gIC8vIElmIHdlIHNwbGl0IHNjYWxhcnMgYnkgc29tZSB3aW5kb3cgKGxldCdzIHNheSA4IGJpdHMpLCBldmVyeSBjaHVuayB3aWxsIG9ubHlcbiAgLy8gdGFrZSAyNTYgYnVja2V0cyBldmVuIGlmIHRoZXJlIGFyZSA0MDk2IHNjYWxhcnMsIGFsc28gcmUtdXNlcyBkb3VibGUuXG4gIC8vIFRPRE86XG4gIC8vIC0gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAyNC83NTAucGRmXG4gIC8vIC0gaHR0cHM6Ly90Y2hlcy5pYWNyLm9yZy9pbmRleC5waHAvVENIRVMvYXJ0aWNsZS92aWV3LzEwMjg3XG4gIC8vIDAgaXMgYWNjZXB0ZWQgaW4gc2NhbGFyc1xuICBjb25zdCBmaWVsZE4gPSBjLkZuO1xuICB2YWxpZGF0ZU1TTVBvaW50cyhwb2ludHMsIGMpO1xuICB2YWxpZGF0ZU1TTVNjYWxhcnMoc2NhbGFycywgZmllbGROKTtcbiAgY29uc3QgcGxlbmd0aCA9IHBvaW50cy5sZW5ndGg7XG4gIGNvbnN0IHNsZW5ndGggPSBzY2FsYXJzLmxlbmd0aDtcbiAgaWYgKHBsZW5ndGggIT09IHNsZW5ndGgpIHRocm93IG5ldyBFcnJvcignYXJyYXlzIG9mIHBvaW50cyBhbmQgc2NhbGFycyBtdXN0IGhhdmUgZXF1YWwgbGVuZ3RoJyk7XG4gIC8vIGlmIChwbGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2FycmF5IG11c3QgYmUgb2YgbGVuZ3RoID49IDInKTtcbiAgY29uc3QgemVybyA9IGMuWkVSTztcbiAgY29uc3Qgd2JpdHMgPSBiaXRMZW4oQmlnSW50KHBsZW5ndGgpKTtcbiAgbGV0IHdpbmRvd1NpemUgPSAxOyAvLyBiaXRzXG4gIGlmICh3Yml0cyA+IDEyKSB3aW5kb3dTaXplID0gd2JpdHMgLSAzO1xuICBlbHNlIGlmICh3Yml0cyA+IDQpIHdpbmRvd1NpemUgPSB3Yml0cyAtIDI7XG4gIGVsc2UgaWYgKHdiaXRzID4gMCkgd2luZG93U2l6ZSA9IDI7XG4gIGNvbnN0IE1BU0sgPSBiaXRNYXNrKHdpbmRvd1NpemUpO1xuICBjb25zdCBidWNrZXRzID0gbmV3IEFycmF5KE51bWJlcihNQVNLKSArIDEpLmZpbGwoemVybyk7IC8vICsxIGZvciB6ZXJvIGFycmF5XG4gIGNvbnN0IGxhc3RCaXRzID0gTWF0aC5mbG9vcigoZmllbGROLkJJVFMgLSAxKSAvIHdpbmRvd1NpemUpICogd2luZG93U2l6ZTtcbiAgbGV0IHN1bSA9IHplcm87XG4gIGZvciAobGV0IGkgPSBsYXN0Qml0czsgaSA+PSAwOyBpIC09IHdpbmRvd1NpemUpIHtcbiAgICBidWNrZXRzLmZpbGwoemVybyk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBzbGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IHNjYWxhciA9IHNjYWxhcnNbal07XG4gICAgICBjb25zdCB3Yml0cyA9IE51bWJlcigoc2NhbGFyID4+IEJpZ0ludChpKSkgJiBNQVNLKTtcbiAgICAgIGJ1Y2tldHNbd2JpdHNdID0gYnVja2V0c1t3Yml0c10uYWRkKHBvaW50c1tqXSk7XG4gICAgfVxuICAgIGxldCByZXNJID0gemVybzsgLy8gbm90IHVzaW5nIHRoaXMgd2lsbCBkbyBzbWFsbCBzcGVlZC11cCwgYnV0IHdpbGwgbG9zZSBjdFxuICAgIC8vIFNraXAgZmlyc3QgYnVja2V0LCBiZWNhdXNlIGl0IGlzIHplcm9cbiAgICBmb3IgKGxldCBqID0gYnVja2V0cy5sZW5ndGggLSAxLCBzdW1JID0gemVybzsgaiA+IDA7IGotLSkge1xuICAgICAgc3VtSSA9IHN1bUkuYWRkKGJ1Y2tldHNbal0pO1xuICAgICAgcmVzSSA9IHJlc0kuYWRkKHN1bUkpO1xuICAgIH1cbiAgICBzdW0gPSBzdW0uYWRkKHJlc0kpO1xuICAgIGlmIChpICE9PSAwKSBmb3IgKGxldCBqID0gMDsgaiA8IHdpbmRvd1NpemU7IGorKykgc3VtID0gc3VtLmRvdWJsZSgpO1xuICB9XG4gIHJldHVybiBzdW0gYXMgUDtcbn1cbi8qKlxuICogUHJlY29tcHV0ZWQgbXVsdGktc2NhbGFyIG11bHRpcGxpY2F0aW9uIChNU00sIFBhICsgUWIgKyBSYyArIC4uLikuXG4gKiBAcGFyYW0gYyBDdXJ2ZSBQb2ludCBjb25zdHJ1Y3RvclxuICogQHBhcmFtIGZpZWxkTiBmaWVsZCBvdmVyIENVUlZFLk4gLSBpbXBvcnRhbnQgdGhhdCBpdCdzIG5vdCBvdmVyIENVUlZFLlBcbiAqIEBwYXJhbSBwb2ludHMgYXJyYXkgb2YgTCBjdXJ2ZSBwb2ludHNcbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHdoaWNoIG11bHRpcGxpZXMgcG9pbnRzIHdpdGggc2NhYXJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVjb21wdXRlTVNNVW5zYWZlPFAgZXh0ZW5kcyBDdXJ2ZVBvaW50PGFueSwgUD4sIFBDIGV4dGVuZHMgQ3VydmVQb2ludENvbnM8UD4+KFxuICBjOiBQQyxcbiAgcG9pbnRzOiBQW10sXG4gIHdpbmRvd1NpemU6IG51bWJlclxuKTogKHNjYWxhcnM6IGJpZ2ludFtdKSA9PiBQIHtcbiAgLyoqXG4gICAqIFBlcmZvcm1hbmNlIEFuYWx5c2lzIG9mIFdpbmRvdy1iYXNlZCBQcmVjb21wdXRhdGlvblxuICAgKlxuICAgKiBCYXNlIENhc2UgKDI1Ni1iaXQgc2NhbGFyLCA4LWJpdCB3aW5kb3cpOlxuICAgKiAtIFN0YW5kYXJkIHByZWNvbXB1dGF0aW9uIHJlcXVpcmVzOlxuICAgKiAgIC0gMzEgYWRkaXRpb25zIHBlciBzY2FsYXIgXHUwMEQ3IDI1NiBzY2FsYXJzID0gNyw5MzYgb3BzXG4gICAqICAgLSBQbHVzIDI1NSBzdW1tYXJ5IGFkZGl0aW9ucyA9IDgsMTkxIHRvdGFsIG9wc1xuICAgKiAgIE5vdGU6IFN1bW1hcnkgYWRkaXRpb25zIGNhbiBiZSBvcHRpbWl6ZWQgdmlhIGFjY3VtdWxhdG9yXG4gICAqXG4gICAqIENodW5rZWQgUHJlY29tcHV0YXRpb24gQW5hbHlzaXM6XG4gICAqIC0gVXNpbmcgMzIgY2h1bmtzIHJlcXVpcmVzOlxuICAgKiAgIC0gMjU1IGFkZGl0aW9ucyBwZXIgY2h1bmtcbiAgICogICAtIDI1NiBkb3VibGluZ3NcbiAgICogICAtIFRvdGFsOiAoMjU1IFx1MDBENyAzMikgKyAyNTYgPSA4LDQxNiBvcHNcbiAgICpcbiAgICogTWVtb3J5IFVzYWdlIENvbXBhcmlzb246XG4gICAqIFdpbmRvdyBTaXplIHwgU3RhbmRhcmQgUG9pbnRzIHwgQ2h1bmtlZCBQb2ludHNcbiAgICogLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLVxuICAgKiAgICAgNC1iaXQgICB8ICAgICA1MjAgICAgICAgICB8ICAgICAgMTVcbiAgICogICAgIDgtYml0ICAgfCAgICA0LDIyNCAgICAgICAgfCAgICAgMjU1XG4gICAqICAgIDEwLWJpdCAgIHwgICAxMyw4MjQgICAgICAgIHwgICAxLDAyM1xuICAgKiAgICAxNi1iaXQgICB8ICA1NTcsMDU2ICAgICAgICB8ICA2NSw1MzVcbiAgICpcbiAgICogS2V5IEFkdmFudGFnZXM6XG4gICAqIDEuIEVuYWJsZXMgbGFyZ2VyIHdpbmRvdyBzaXplcyBkdWUgdG8gcmVkdWNlZCBtZW1vcnkgb3ZlcmhlYWRcbiAgICogMi4gTW9yZSBlZmZpY2llbnQgZm9yIHNtYWxsZXIgc2NhbGFyIGNvdW50czpcbiAgICogICAgLSAxNiBjaHVua3M6ICgxNiBcdTAwRDcgMjU1KSArIDI1NiA9IDQsMzM2IG9wc1xuICAgKiAgICAtIH4yeCBmYXN0ZXIgdGhhbiBzdGFuZGFyZCA4LDE5MSBvcHNcbiAgICpcbiAgICogTGltaXRhdGlvbnM6XG4gICAqIC0gTm90IHN1aXRhYmxlIGZvciBwbGFpbiBwcmVjb21wdXRlcyAocmVxdWlyZXMgMjU2IGNvbnN0YW50IGRvdWJsaW5ncylcbiAgICogLSBQZXJmb3JtYW5jZSBkZWdyYWRlcyB3aXRoIGxhcmdlciBzY2FsYXIgY291bnRzOlxuICAgKiAgIC0gT3B0aW1hbCBmb3IgfjI1NiBzY2FsYXJzXG4gICAqICAgLSBMZXNzIGVmZmljaWVudCBmb3IgNDA5Nisgc2NhbGFycyAoUGlwcGVuZ2VyIHByZWZlcnJlZClcbiAgICovXG4gIGNvbnN0IGZpZWxkTiA9IGMuRm47XG4gIHZhbGlkYXRlVyh3aW5kb3dTaXplLCBmaWVsZE4uQklUUyk7XG4gIHZhbGlkYXRlTVNNUG9pbnRzKHBvaW50cywgYyk7XG4gIGNvbnN0IHplcm8gPSBjLlpFUk87XG4gIGNvbnN0IHRhYmxlU2l6ZSA9IDIgKiogd2luZG93U2l6ZSAtIDE7IC8vIHRhYmxlIHNpemUgKHdpdGhvdXQgemVybylcbiAgY29uc3QgY2h1bmtzID0gTWF0aC5jZWlsKGZpZWxkTi5CSVRTIC8gd2luZG93U2l6ZSk7IC8vIGNodW5rcyBvZiBpdGVtXG4gIGNvbnN0IE1BU0sgPSBiaXRNYXNrKHdpbmRvd1NpemUpO1xuICBjb25zdCB0YWJsZXMgPSBwb2ludHMubWFwKChwOiBQKSA9PiB7XG4gICAgY29uc3QgcmVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGFjYyA9IHA7IGkgPCB0YWJsZVNpemU7IGkrKykge1xuICAgICAgcmVzLnB1c2goYWNjKTtcbiAgICAgIGFjYyA9IGFjYy5hZGQocCk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0pO1xuICByZXR1cm4gKHNjYWxhcnM6IGJpZ2ludFtdKTogUCA9PiB7XG4gICAgdmFsaWRhdGVNU01TY2FsYXJzKHNjYWxhcnMsIGZpZWxkTik7XG4gICAgaWYgKHNjYWxhcnMubGVuZ3RoID4gcG9pbnRzLmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJyYXkgb2Ygc2NhbGFycyBtdXN0IGJlIHNtYWxsZXIgdGhhbiBhcnJheSBvZiBwb2ludHMnKTtcbiAgICBsZXQgcmVzID0gemVybztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNodW5rczsgaSsrKSB7XG4gICAgICAvLyBObyBuZWVkIHRvIGRvdWJsZSBpZiBhY2N1bXVsYXRvciBpcyBzdGlsbCB6ZXJvLlxuICAgICAgaWYgKHJlcyAhPT0gemVybykgZm9yIChsZXQgaiA9IDA7IGogPCB3aW5kb3dTaXplOyBqKyspIHJlcyA9IHJlcy5kb3VibGUoKTtcbiAgICAgIGNvbnN0IHNoaWZ0QnkgPSBCaWdJbnQoY2h1bmtzICogd2luZG93U2l6ZSAtIChpICsgMSkgKiB3aW5kb3dTaXplKTtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2NhbGFycy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBuID0gc2NhbGFyc1tqXTtcbiAgICAgICAgY29uc3QgY3VyciA9IE51bWJlcigobiA+PiBzaGlmdEJ5KSAmIE1BU0spO1xuICAgICAgICBpZiAoIWN1cnIpIGNvbnRpbnVlOyAvLyBza2lwIHplcm8gc2NhbGFycyBjaHVua3NcbiAgICAgICAgcmVzID0gcmVzLmFkZCh0YWJsZXNbal1bY3VyciAtIDFdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVmFsaWRDdXJ2ZVBhcmFtczxUPiA9IHtcbiAgcDogYmlnaW50O1xuICBuOiBiaWdpbnQ7XG4gIGg6IGJpZ2ludDtcbiAgYTogVDtcbiAgYj86IFQ7XG4gIGQ/OiBUO1xuICBHeDogVDtcbiAgR3k6IFQ7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVGaWVsZDxUPihvcmRlcjogYmlnaW50LCBmaWVsZD86IElGaWVsZDxUPiwgaXNMRT86IGJvb2xlYW4pOiBJRmllbGQ8VD4ge1xuICBpZiAoZmllbGQpIHtcbiAgICBpZiAoZmllbGQuT1JERVIgIT09IG9yZGVyKSB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkLk9SREVSIG11c3QgbWF0Y2ggb3JkZXI6IEZwID09IHAsIEZuID09IG4nKTtcbiAgICB2YWxpZGF0ZUZpZWxkKGZpZWxkKTtcbiAgICByZXR1cm4gZmllbGQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZpZWxkKG9yZGVyLCB7IGlzTEUgfSkgYXMgdW5rbm93biBhcyBJRmllbGQ8VD47XG4gIH1cbn1cbmV4cG9ydCB0eXBlIEZwRm48VD4gPSB7IEZwOiBJRmllbGQ8VD47IEZuOiBJRmllbGQ8YmlnaW50PiB9O1xuXG4vKiogVmFsaWRhdGVzIENVUlZFIG9wdHMgYW5kIGNyZWF0ZXMgZmllbGRzICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VydmVGaWVsZHM8VD4oXG4gIHR5cGU6ICd3ZWllcnN0cmFzcycgfCAnZWR3YXJkcycsXG4gIENVUlZFOiBWYWxpZEN1cnZlUGFyYW1zPFQ+LFxuICBjdXJ2ZU9wdHM6IFBhcnRpYWw8RnBGbjxUPj4gPSB7fSxcbiAgRnBGbkxFPzogYm9vbGVhblxuKTogRnBGbjxUPiAmIHsgQ1VSVkU6IFZhbGlkQ3VydmVQYXJhbXM8VD4gfSB7XG4gIGlmIChGcEZuTEUgPT09IHVuZGVmaW5lZCkgRnBGbkxFID0gdHlwZSA9PT0gJ2Vkd2FyZHMnO1xuICBpZiAoIUNVUlZFIHx8IHR5cGVvZiBDVVJWRSAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgdmFsaWQgJHt0eXBlfSBDVVJWRSBvYmplY3RgKTtcbiAgZm9yIChjb25zdCBwIG9mIFsncCcsICduJywgJ2gnXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHZhbCA9IENVUlZFW3BdO1xuICAgIGlmICghKHR5cGVvZiB2YWwgPT09ICdiaWdpbnQnICYmIHZhbCA+IF8wbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENVUlZFLiR7cH0gbXVzdCBiZSBwb3NpdGl2ZSBiaWdpbnRgKTtcbiAgfVxuICBjb25zdCBGcCA9IGNyZWF0ZUZpZWxkKENVUlZFLnAsIGN1cnZlT3B0cy5GcCwgRnBGbkxFKTtcbiAgY29uc3QgRm4gPSBjcmVhdGVGaWVsZChDVVJWRS5uLCBjdXJ2ZU9wdHMuRm4sIEZwRm5MRSk7XG4gIGNvbnN0IF9iOiAnYicgfCAnZCcgPSB0eXBlID09PSAnd2VpZXJzdHJhc3MnID8gJ2InIDogJ2QnO1xuICBjb25zdCBwYXJhbXMgPSBbJ0d4JywgJ0d5JywgJ2EnLCBfYl0gYXMgY29uc3Q7XG4gIGZvciAoY29uc3QgcCBvZiBwYXJhbXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKCFGcC5pc1ZhbGlkKENVUlZFW3BdKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ1VSVkUuJHtwfSBtdXN0IGJlIHZhbGlkIGZpZWxkIGVsZW1lbnQgb2YgQ1VSVkUuRnBgKTtcbiAgfVxuICBDVVJWRSA9IE9iamVjdC5mcmVlemUoT2JqZWN0LmFzc2lnbih7fSwgQ1VSVkUpKTtcbiAgcmV0dXJuIHsgQ1VSVkUsIEZwLCBGbiB9O1xufVxuXG50eXBlIEtleWdlbkZuID0gKFxuICBzZWVkPzogVWludDhBcnJheSxcbiAgaXNDb21wcmVzc2VkPzogYm9vbGVhblxuKSA9PiB7IHNlY3JldEtleTogVWludDhBcnJheTsgcHVibGljS2V5OiBVaW50OEFycmF5IH07XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5Z2VuKFxuICByYW5kb21TZWNyZXRLZXk6IEZ1bmN0aW9uLFxuICBnZXRQdWJsaWNLZXk6IFNpZ25lclsnZ2V0UHVibGljS2V5J11cbik6IEtleWdlbkZuIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGtleWdlbihzZWVkPzogVWludDhBcnJheSkge1xuICAgIGNvbnN0IHNlY3JldEtleSA9IHJhbmRvbVNlY3JldEtleShzZWVkKTtcbiAgICByZXR1cm4geyBzZWNyZXRLZXksIHB1YmxpY0tleTogZ2V0UHVibGljS2V5KHNlY3JldEtleSkgfTtcbiAgfTtcbn1cbiIsICIvKipcbiAqIEhleCwgYnl0ZXMgYW5kIG51bWJlciB1dGlsaXRpZXMuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7XG4gIGFieXRlcyBhcyBhYnl0ZXNfLFxuICBhbnVtYmVyLFxuICBieXRlc1RvSGV4IGFzIGJ5dGVzVG9IZXhfLFxuICBjb25jYXRCeXRlcyBhcyBjb25jYXRCeXRlc18sXG4gIGhleFRvQnl0ZXMgYXMgaGV4VG9CeXRlc18sXG59IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuZXhwb3J0IHtcbiAgYWJ5dGVzLFxuICBhbnVtYmVyLFxuICBieXRlc1RvSGV4LFxuICBjb25jYXRCeXRlcyxcbiAgaGV4VG9CeXRlcyxcbiAgaXNCeXRlcyxcbiAgcmFuZG9tQnl0ZXMsXG59IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuY29uc3QgXzBuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgwKTtcbmNvbnN0IF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSk7XG5cbmV4cG9ydCB0eXBlIENIYXNoID0ge1xuICAobWVzc2FnZTogVWludDhBcnJheSk6IFVpbnQ4QXJyYXk7XG4gIGJsb2NrTGVuOiBudW1iZXI7XG4gIG91dHB1dExlbjogbnVtYmVyO1xuICBjcmVhdGUob3B0cz86IHsgZGtMZW4/OiBudW1iZXIgfSk6IGFueTsgLy8gRm9yIHNoYWtlXG59O1xuZXhwb3J0IHR5cGUgRkhhc2ggPSAobWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbmV4cG9ydCBmdW5jdGlvbiBhYm9vbCh2YWx1ZTogYm9vbGVhbiwgdGl0bGU6IHN0cmluZyA9ICcnKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJykge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIGJvb2xlYW4sIGdvdCB0eXBlPScgKyB0eXBlb2YgdmFsdWUpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLy8gVXNlZCBpbiB3ZWllcnN0cmFzcywgZGVyXG5mdW5jdGlvbiBhYmlnbnVtYmVyKG46IG51bWJlciB8IGJpZ2ludCkge1xuICBpZiAodHlwZW9mIG4gPT09ICdiaWdpbnQnKSB7XG4gICAgaWYgKCFpc1Bvc0JpZyhuKSkgdGhyb3cgbmV3IEVycm9yKCdwb3NpdGl2ZSBiaWdpbnQgZXhwZWN0ZWQsIGdvdCAnICsgbik7XG4gIH0gZWxzZSBhbnVtYmVyKG4pO1xuICByZXR1cm4gbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzYWZlbnVtYmVyKHZhbHVlOiBudW1iZXIsIHRpdGxlOiBzdHJpbmcgPSAnJyk6IHZvaWQge1xuICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKHZhbHVlKSkge1xuICAgIGNvbnN0IHByZWZpeCA9IHRpdGxlICYmIGBcIiR7dGl0bGV9XCIgYDtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJlZml4ICsgJ2V4cGVjdGVkIHNhZmUgaW50ZWdlciwgZ290IHR5cGU9JyArIHR5cGVvZiB2YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvSGV4VW5wYWRkZWQobnVtOiBudW1iZXIgfCBiaWdpbnQpOiBzdHJpbmcge1xuICBjb25zdCBoZXggPSBhYmlnbnVtYmVyKG51bSkudG9TdHJpbmcoMTYpO1xuICByZXR1cm4gaGV4Lmxlbmd0aCAmIDEgPyAnMCcgKyBoZXggOiBoZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb051bWJlcihoZXg6IHN0cmluZyk6IGJpZ2ludCB7XG4gIGlmICh0eXBlb2YgaGV4ICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdoZXggc3RyaW5nIGV4cGVjdGVkLCBnb3QgJyArIHR5cGVvZiBoZXgpO1xuICByZXR1cm4gaGV4ID09PSAnJyA/IF8wbiA6IEJpZ0ludCgnMHgnICsgaGV4KTsgLy8gQmlnIEVuZGlhblxufVxuXG4vLyBCRTogQmlnIEVuZGlhbiwgTEU6IExpdHRsZSBFbmRpYW5cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTnVtYmVyQkUoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICByZXR1cm4gaGV4VG9OdW1iZXIoYnl0ZXNUb0hleF8oYnl0ZXMpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTnVtYmVyTEUoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICByZXR1cm4gaGV4VG9OdW1iZXIoYnl0ZXNUb0hleF8oY29weUJ5dGVzKGFieXRlc18oYnl0ZXMpKS5yZXZlcnNlKCkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclRvQnl0ZXNCRShuOiBudW1iZXIgfCBiaWdpbnQsIGxlbjogbnVtYmVyKTogVWludDhBcnJheSB7XG4gIGFudW1iZXIobGVuKTtcbiAgbiA9IGFiaWdudW1iZXIobik7XG4gIGNvbnN0IHJlcyA9IGhleFRvQnl0ZXNfKG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KGxlbiAqIDIsICcwJykpO1xuICBpZiAocmVzLmxlbmd0aCAhPT0gbGVuKSB0aHJvdyBuZXcgRXJyb3IoJ251bWJlciB0b28gbGFyZ2UnKTtcbiAgcmV0dXJuIHJlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJUb0J5dGVzTEUobjogbnVtYmVyIHwgYmlnaW50LCBsZW46IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gbnVtYmVyVG9CeXRlc0JFKG4sIGxlbikucmV2ZXJzZSgpO1xufVxuLy8gVW5wYWRkZWQsIHJhcmVseSB1c2VkXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9WYXJCeXRlc0JFKG46IG51bWJlciB8IGJpZ2ludCk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gaGV4VG9CeXRlc18obnVtYmVyVG9IZXhVbnBhZGRlZChhYmlnbnVtYmVyKG4pKSk7XG59XG5cbi8vIENvbXBhcmVzIDIgdThhLXMgaW4ga2luZGEgY29uc3RhbnQgdGltZVxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsQnl0ZXMoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGxldCBkaWZmID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSBkaWZmIHw9IGFbaV0gXiBiW2ldO1xuICByZXR1cm4gZGlmZiA9PT0gMDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgVWludDhBcnJheS4gV2UgY2FuJ3QgdXNlIHU4YS5zbGljZSgpLCBiZWNhdXNlIHU4YSBjYW4gYmUgQnVmZmVyLFxuICogYW5kIEJ1ZmZlciNzbGljZSBjcmVhdGVzIG11dGFibGUgY29weS4gTmV2ZXIgdXNlIEJ1ZmZlcnMhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5Qnl0ZXMoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShieXRlcyk7XG59XG5cbi8qKlxuICogRGVjb2RlcyA3LWJpdCBBU0NJSSBzdHJpbmcgdG8gVWludDhBcnJheSwgdGhyb3dzIG9uIG5vbi1hc2NpaSBzeW1ib2xzXG4gKiBTaG91bGQgYmUgc2FmZSB0byB1c2UgZm9yIHRoaW5ncyBleHBlY3RlZCB0byBiZSBBU0NJSS5cbiAqIFJldHVybnMgZXhhY3Qgc2FtZSByZXN1bHQgYXMgYFRleHRFbmNvZGVyYCBmb3IgQVNDSUkgb3IgdGhyb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNjaWlUb0J5dGVzKGFzY2lpOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShhc2NpaSwgKGMsIGkpID0+IHtcbiAgICBjb25zdCBjaGFyQ29kZSA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAoYy5sZW5ndGggIT09IDEgfHwgY2hhckNvZGUgPiAxMjcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYHN0cmluZyBjb250YWlucyBub24tQVNDSUkgY2hhcmFjdGVyIFwiJHthc2NpaVtpXX1cIiB3aXRoIGNvZGUgJHtjaGFyQ29kZX0gYXQgcG9zaXRpb24gJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBjaGFyQ29kZTtcbiAgfSk7XG59XG5cbi8vIElzIHBvc2l0aXZlIGJpZ2ludFxuY29uc3QgaXNQb3NCaWcgPSAobjogYmlnaW50KSA9PiB0eXBlb2YgbiA9PT0gJ2JpZ2ludCcgJiYgXzBuIDw9IG47XG5cbmV4cG9ydCBmdW5jdGlvbiBpblJhbmdlKG46IGJpZ2ludCwgbWluOiBiaWdpbnQsIG1heDogYmlnaW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1Bvc0JpZyhuKSAmJiBpc1Bvc0JpZyhtaW4pICYmIGlzUG9zQmlnKG1heCkgJiYgbWluIDw9IG4gJiYgbiA8IG1heDtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIG1pbiA8PSBuIDwgbWF4LiBOT1RFOiBJdCdzIDwgbWF4IGFuZCBub3QgPD0gbWF4LlxuICogQGV4YW1wbGVcbiAqIGFJblJhbmdlKCd4JywgeCwgMW4sIDI1Nm4pOyAvLyB3b3VsZCBhc3N1bWUgeCBpcyBpbiAoMW4uLjI1NW4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhSW5SYW5nZSh0aXRsZTogc3RyaW5nLCBuOiBiaWdpbnQsIG1pbjogYmlnaW50LCBtYXg6IGJpZ2ludCk6IHZvaWQge1xuICAvLyBXaHkgbWluIDw9IG4gPCBtYXggYW5kIG5vdCBhIChtaW4gPCBuIDwgbWF4KSBPUiBiIChtaW4gPD0gbiA8PSBtYXgpP1xuICAvLyBjb25zaWRlciBQPTI1Nm4sIG1pbj0wbiwgbWF4PVBcbiAgLy8gLSBhIGZvciBtaW49MCB3b3VsZCByZXF1aXJlIC0xOiAgICAgICAgICBgaW5SYW5nZSgneCcsIHgsIC0xbiwgUClgXG4gIC8vIC0gYiB3b3VsZCBjb21tb25seSByZXF1aXJlIHN1YnRyYWN0aW9uOiAgYGluUmFuZ2UoJ3gnLCB4LCAwbiwgUCAtIDFuKWBcbiAgLy8gLSBvdXIgd2F5IGlzIHRoZSBjbGVhbmVzdDogICAgICAgICAgICAgICBgaW5SYW5nZSgneCcsIHgsIDBuLCBQKVxuICBpZiAoIWluUmFuZ2UobiwgbWluLCBtYXgpKVxuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgdmFsaWQgJyArIHRpdGxlICsgJzogJyArIG1pbiArICcgPD0gbiA8ICcgKyBtYXggKyAnLCBnb3QgJyArIG4pO1xufVxuXG4vLyBCaXQgb3BlcmF0aW9uc1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgYW1vdW50IG9mIGJpdHMgaW4gYSBiaWdpbnQuXG4gKiBTYW1lIGFzIGBuLnRvU3RyaW5nKDIpLmxlbmd0aGBcbiAqIFRPRE86IG1lcmdlIHdpdGggbkxlbmd0aCBpbiBtb2R1bGFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaXRMZW4objogYmlnaW50KTogbnVtYmVyIHtcbiAgbGV0IGxlbjtcbiAgZm9yIChsZW4gPSAwOyBuID4gXzBuOyBuID4+PSBfMW4sIGxlbiArPSAxKTtcbiAgcmV0dXJuIGxlbjtcbn1cblxuLyoqXG4gKiBHZXRzIHNpbmdsZSBiaXQgYXQgcG9zaXRpb24uXG4gKiBOT1RFOiBmaXJzdCBiaXQgcG9zaXRpb24gaXMgMCAoc2FtZSBhcyBhcnJheXMpXG4gKiBTYW1lIGFzIGAhIStBcnJheS5mcm9tKG4udG9TdHJpbmcoMikpLnJldmVyc2UoKVtwb3NdYFxuICovXG5leHBvcnQgZnVuY3Rpb24gYml0R2V0KG46IGJpZ2ludCwgcG9zOiBudW1iZXIpOiBiaWdpbnQge1xuICByZXR1cm4gKG4gPj4gQmlnSW50KHBvcykpICYgXzFuO1xufVxuXG4vKipcbiAqIFNldHMgc2luZ2xlIGJpdCBhdCBwb3NpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpdFNldChuOiBiaWdpbnQsIHBvczogbnVtYmVyLCB2YWx1ZTogYm9vbGVhbik6IGJpZ2ludCB7XG4gIHJldHVybiBuIHwgKCh2YWx1ZSA/IF8xbiA6IF8wbikgPDwgQmlnSW50KHBvcykpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBtYXNrIGZvciBOIGJpdHMuIE5vdCB1c2luZyAqKiBvcGVyYXRvciB3aXRoIGJpZ2ludHMgYmVjYXVzZSBvZiBvbGQgZW5naW5lcy5cbiAqIFNhbWUgYXMgQmlnSW50KGAwYiR7QXJyYXkoaSkuZmlsbCgnMScpLmpvaW4oJycpfWApXG4gKi9cbmV4cG9ydCBjb25zdCBiaXRNYXNrID0gKG46IG51bWJlcik6IGJpZ2ludCA9PiAoXzFuIDw8IEJpZ0ludChuKSkgLSBfMW47XG5cbi8vIERSQkdcblxudHlwZSBQcmVkPFQ+ID0gKHY6IFVpbnQ4QXJyYXkpID0+IFQgfCB1bmRlZmluZWQ7XG4vKipcbiAqIE1pbmltYWwgSE1BQy1EUkJHIGZyb20gTklTVCA4MDAtOTAgZm9yIFJGQzY5Nzkgc2lncy5cbiAqIEByZXR1cm5zIGZ1bmN0aW9uIHRoYXQgd2lsbCBjYWxsIERSQkcgdW50aWwgMm5kIGFyZyByZXR1cm5zIHNvbWV0aGluZyBtZWFuaW5nZnVsXG4gKiBAZXhhbXBsZVxuICogICBjb25zdCBkcmJnID0gY3JlYXRlSG1hY0RSQkc8S2V5PigzMiwgMzIsIGhtYWMpO1xuICogICBkcmJnKHNlZWQsIGJ5dGVzVG9LZXkpOyAvLyBieXRlc1RvS2V5IG11c3QgcmV0dXJuIEtleSBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUhtYWNEcmJnPFQ+KFxuICBoYXNoTGVuOiBudW1iZXIsXG4gIHFCeXRlTGVuOiBudW1iZXIsXG4gIGhtYWNGbjogKGtleTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheVxuKTogKHNlZWQ6IFVpbnQ4QXJyYXksIHByZWRpY2F0ZTogUHJlZDxUPikgPT4gVCB7XG4gIGFudW1iZXIoaGFzaExlbiwgJ2hhc2hMZW4nKTtcbiAgYW51bWJlcihxQnl0ZUxlbiwgJ3FCeXRlTGVuJyk7XG4gIGlmICh0eXBlb2YgaG1hY0ZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ2htYWNGbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgY29uc3QgdThuID0gKGxlbjogbnVtYmVyKTogVWludDhBcnJheSA9PiBuZXcgVWludDhBcnJheShsZW4pOyAvLyBjcmVhdGVzIFVpbnQ4QXJyYXlcbiAgY29uc3QgTlVMTCA9IFVpbnQ4QXJyYXkub2YoKTtcbiAgY29uc3QgYnl0ZTAgPSBVaW50OEFycmF5Lm9mKDB4MDApO1xuICBjb25zdCBieXRlMSA9IFVpbnQ4QXJyYXkub2YoMHgwMSk7XG4gIGNvbnN0IF9tYXhEcmJnSXRlcnMgPSAxMDAwO1xuXG4gIC8vIFN0ZXAgQiwgU3RlcCBDOiBzZXQgaGFzaExlbiB0byA4KmNlaWwoaGxlbi84KVxuICBsZXQgdiA9IHU4bihoYXNoTGVuKTsgLy8gTWluaW1hbCBub24tZnVsbC1zcGVjIEhNQUMtRFJCRyBmcm9tIE5JU1QgODAwLTkwIGZvciBSRkM2OTc5IHNpZ3MuXG4gIGxldCBrID0gdThuKGhhc2hMZW4pOyAvLyBTdGVwcyBCIGFuZCBDIG9mIFJGQzY5NzkgMy4yOiBzZXQgaGFzaExlbiwgaW4gb3VyIGNhc2UgYWx3YXlzIHNhbWVcbiAgbGV0IGkgPSAwOyAvLyBJdGVyYXRpb25zIGNvdW50ZXIsIHdpbGwgdGhyb3cgd2hlbiBvdmVyIDEwMDBcbiAgY29uc3QgcmVzZXQgPSAoKSA9PiB7XG4gICAgdi5maWxsKDEpO1xuICAgIGsuZmlsbCgwKTtcbiAgICBpID0gMDtcbiAgfTtcbiAgY29uc3QgaCA9ICguLi5tc2dzOiBVaW50OEFycmF5W10pID0+IGhtYWNGbihrLCBjb25jYXRCeXRlc18odiwgLi4ubXNncykpOyAvLyBobWFjKGspKHYsIC4uLnZhbHVlcylcbiAgY29uc3QgcmVzZWVkID0gKHNlZWQ6IFVpbnQ4QXJyYXkgPSBOVUxMKSA9PiB7XG4gICAgLy8gSE1BQy1EUkJHIHJlc2VlZCgpIGZ1bmN0aW9uLiBTdGVwcyBELUdcbiAgICBrID0gaChieXRlMCwgc2VlZCk7IC8vIGsgPSBobWFjKGsgfHwgdiB8fCAweDAwIHx8IHNlZWQpXG4gICAgdiA9IGgoKTsgLy8gdiA9IGhtYWMoayB8fCB2KVxuICAgIGlmIChzZWVkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgIGsgPSBoKGJ5dGUxLCBzZWVkKTsgLy8gayA9IGhtYWMoayB8fCB2IHx8IDB4MDEgfHwgc2VlZClcbiAgICB2ID0gaCgpOyAvLyB2ID0gaG1hYyhrIHx8IHYpXG4gIH07XG4gIGNvbnN0IGdlbiA9ICgpID0+IHtcbiAgICAvLyBITUFDLURSQkcgZ2VuZXJhdGUoKSBmdW5jdGlvblxuICAgIGlmIChpKysgPj0gX21heERyYmdJdGVycykgdGhyb3cgbmV3IEVycm9yKCdkcmJnOiB0cmllZCBtYXggYW1vdW50IG9mIGl0ZXJhdGlvbnMnKTtcbiAgICBsZXQgbGVuID0gMDtcbiAgICBjb25zdCBvdXQ6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgIHdoaWxlIChsZW4gPCBxQnl0ZUxlbikge1xuICAgICAgdiA9IGgoKTtcbiAgICAgIGNvbnN0IHNsID0gdi5zbGljZSgpO1xuICAgICAgb3V0LnB1c2goc2wpO1xuICAgICAgbGVuICs9IHYubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gY29uY2F0Qnl0ZXNfKC4uLm91dCk7XG4gIH07XG4gIGNvbnN0IGdlblVudGlsID0gKHNlZWQ6IFVpbnQ4QXJyYXksIHByZWQ6IFByZWQ8VD4pOiBUID0+IHtcbiAgICByZXNldCgpO1xuICAgIHJlc2VlZChzZWVkKTsgLy8gU3RlcHMgRC1HXG4gICAgbGV0IHJlczogVCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDsgLy8gU3RlcCBIOiBncmluZCB1bnRpbCBrIGlzIGluIFsxLi5uLTFdXG4gICAgd2hpbGUgKCEocmVzID0gcHJlZChnZW4oKSkpKSByZXNlZWQoKTtcbiAgICByZXNldCgpO1xuICAgIHJldHVybiByZXM7XG4gIH07XG4gIHJldHVybiBnZW5VbnRpbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0KFxuICBvYmplY3Q6IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gIGZpZWxkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9LFxuICBvcHRGaWVsZHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuKTogdm9pZCB7XG4gIGlmICghb2JqZWN0IHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHZhbGlkIG9wdGlvbnMgb2JqZWN0Jyk7XG4gIHR5cGUgSXRlbSA9IGtleW9mIHR5cGVvZiBvYmplY3Q7XG4gIGZ1bmN0aW9uIGNoZWNrRmllbGQoZmllbGROYW1lOiBJdGVtLCBleHBlY3RlZFR5cGU6IHN0cmluZywgaXNPcHQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB2YWwgPSBvYmplY3RbZmllbGROYW1lXTtcbiAgICBpZiAoaXNPcHQgJiYgdmFsID09PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICBjb25zdCBjdXJyZW50ID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoY3VycmVudCAhPT0gZXhwZWN0ZWRUeXBlIHx8IHZhbCA9PT0gbnVsbClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgcGFyYW0gXCIke2ZpZWxkTmFtZX1cIiBpcyBpbnZhbGlkOiBleHBlY3RlZCAke2V4cGVjdGVkVHlwZX0sIGdvdCAke2N1cnJlbnR9YCk7XG4gIH1cbiAgY29uc3QgaXRlciA9IChmOiB0eXBlb2YgZmllbGRzLCBpc09wdDogYm9vbGVhbikgPT5cbiAgICBPYmplY3QuZW50cmllcyhmKS5mb3JFYWNoKChbaywgdl0pID0+IGNoZWNrRmllbGQoaywgdiwgaXNPcHQpKTtcbiAgaXRlcihmaWVsZHMsIGZhbHNlKTtcbiAgaXRlcihvcHRGaWVsZHMsIHRydWUpO1xufVxuXG4vKipcbiAqIHRocm93cyBub3QgaW1wbGVtZW50ZWQgZXJyb3JcbiAqL1xuZXhwb3J0IGNvbnN0IG5vdEltcGxlbWVudGVkID0gKCk6IG5ldmVyID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbn07XG5cbi8qKlxuICogTWVtb2l6ZXMgKGNhY2hlcykgY29tcHV0YXRpb24gcmVzdWx0LlxuICogVXNlcyBXZWFrTWFwOiB0aGUgdmFsdWUgaXMgZ29pbmcgYXV0by1jbGVhbmVkIGJ5IEdDIGFmdGVyIGxhc3QgcmVmZXJlbmNlIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZW1vaXplZDxUIGV4dGVuZHMgb2JqZWN0LCBSLCBPIGV4dGVuZHMgYW55W10+KFxuICBmbjogKGFyZzogVCwgLi4uYXJnczogTykgPT4gUlxuKTogKGFyZzogVCwgLi4uYXJnczogTykgPT4gUiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBXZWFrTWFwPFQsIFI+KCk7XG4gIHJldHVybiAoYXJnOiBULCAuLi5hcmdzOiBPKTogUiA9PiB7XG4gICAgY29uc3QgdmFsID0gbWFwLmdldChhcmcpO1xuICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHZhbDtcbiAgICBjb25zdCBjb21wdXRlZCA9IGZuKGFyZywgLi4uYXJncyk7XG4gICAgbWFwLnNldChhcmcsIGNvbXB1dGVkKTtcbiAgICByZXR1cm4gY29tcHV0ZWQ7XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3J5cHRvS2V5cyB7XG4gIGxlbmd0aHM6IHsgc2VlZD86IG51bWJlcjsgcHVibGljPzogbnVtYmVyOyBzZWNyZXQ/OiBudW1iZXIgfTtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xufVxuXG4vKiogR2VuZXJpYyBpbnRlcmZhY2UgZm9yIHNpZ25hdHVyZXMuIEhhcyBrZXlnZW4sIHNpZ24gYW5kIHZlcmlmeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmVyIGV4dGVuZHMgQ3J5cHRvS2V5cyB7XG4gIC8vIEludGVyZmFjZXMgYXJlIGZ1bi4gV2UgY2Fubm90IGp1c3QgYWRkIG5ldyBmaWVsZHMgd2l0aG91dCBjb3B5aW5nIG9sZCBvbmVzLlxuICBsZW5ndGhzOiB7XG4gICAgc2VlZD86IG51bWJlcjtcbiAgICBwdWJsaWM/OiBudW1iZXI7XG4gICAgc2VjcmV0PzogbnVtYmVyO1xuICAgIHNpZ25SYW5kPzogbnVtYmVyO1xuICAgIHNpZ25hdHVyZT86IG51bWJlcjtcbiAgfTtcbiAgc2lnbjogKG1zZzogVWludDhBcnJheSwgc2VjcmV0S2V5OiBVaW50OEFycmF5KSA9PiBVaW50OEFycmF5O1xuICB2ZXJpZnk6IChzaWc6IFVpbnQ4QXJyYXksIG1zZzogVWludDhBcnJheSwgcHVibGljS2V5OiBVaW50OEFycmF5KSA9PiBib29sZWFuO1xufVxuIiwgIi8qKlxuICogVXRpbHMgZm9yIG1vZHVsYXIgZGl2aXNpb24gYW5kIGZpZWxkcy5cbiAqIEZpZWxkIG92ZXIgMTEgaXMgYSBmaW5pdGUgKEdhbG9pcykgZmllbGQgaXMgaW50ZWdlciBudW1iZXIgb3BlcmF0aW9ucyBgbW9kIDExYC5cbiAqIFRoZXJlIGlzIG5vIGRpdmlzaW9uOiBpdCBpcyByZXBsYWNlZCBieSBtb2R1bGFyIG11bHRpcGxpY2F0aXZlIGludmVyc2UuXG4gKiBAbW9kdWxlXG4gKi9cbi8qISBub2JsZS1jdXJ2ZXMgLSBNSVQgTGljZW5zZSAoYykgMjAyMiBQYXVsIE1pbGxlciAocGF1bG1pbGxyLmNvbSkgKi9cbmltcG9ydCB7XG4gIGFieXRlcyxcbiAgYW51bWJlcixcbiAgYnl0ZXNUb051bWJlckJFLFxuICBieXRlc1RvTnVtYmVyTEUsXG4gIG51bWJlclRvQnl0ZXNCRSxcbiAgbnVtYmVyVG9CeXRlc0xFLFxuICB2YWxpZGF0ZU9iamVjdCxcbn0gZnJvbSAnLi4vdXRpbHMudHMnO1xuXG4vLyBOdW1iZXJzIGFyZW4ndCB1c2VkIGluIHgyNTUxOSAvIHg0NDggYnVpbGRzXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8wbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMCksIF8xbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMSksIF8ybiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMik7XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF8zbiA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoMyksIF80biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNCksIF81biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNSk7XG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IF83biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoNyksIF84biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoOCksIF85biA9IC8qIEBfX1BVUkVfXyAqLyBCaWdJbnQoOSk7XG5jb25zdCBfMTZuID0gLyogQF9fUFVSRV9fICovIEJpZ0ludCgxNik7XG5cbi8vIENhbGN1bGF0ZXMgYSBtb2R1bG8gYlxuZXhwb3J0IGZ1bmN0aW9uIG1vZChhOiBiaWdpbnQsIGI6IGJpZ2ludCk6IGJpZ2ludCB7XG4gIGNvbnN0IHJlc3VsdCA9IGEgJSBiO1xuICByZXR1cm4gcmVzdWx0ID49IF8wbiA/IHJlc3VsdCA6IGIgKyByZXN1bHQ7XG59XG4vKipcbiAqIEVmZmljaWVudGx5IHJhaXNlIG51bSB0byBwb3dlciBhbmQgZG8gbW9kdWxhciBkaXZpc2lvbi5cbiAqIFVuc2FmZSBpbiBzb21lIGNvbnRleHRzOiB1c2VzIGxhZGRlciwgc28gY2FuIGV4cG9zZSBiaWdpbnQgYml0cy5cbiAqIEBleGFtcGxlXG4gKiBwb3coMm4sIDZuLCAxMW4pIC8vIDY0biAlIDExbiA9PSA5blxuICovXG5leHBvcnQgZnVuY3Rpb24gcG93KG51bTogYmlnaW50LCBwb3dlcjogYmlnaW50LCBtb2R1bG86IGJpZ2ludCk6IGJpZ2ludCB7XG4gIHJldHVybiBGcFBvdyhGaWVsZChtb2R1bG8pLCBudW0sIHBvd2VyKTtcbn1cblxuLyoqIERvZXMgYHheKDJecG93ZXIpYCBtb2QgcC4gYHBvdzIoMzAsIDQpYCA9PSBgMzBeKDJeNClgICovXG5leHBvcnQgZnVuY3Rpb24gcG93Mih4OiBiaWdpbnQsIHBvd2VyOiBiaWdpbnQsIG1vZHVsbzogYmlnaW50KTogYmlnaW50IHtcbiAgbGV0IHJlcyA9IHg7XG4gIHdoaWxlIChwb3dlci0tID4gXzBuKSB7XG4gICAgcmVzICo9IHJlcztcbiAgICByZXMgJT0gbW9kdWxvO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogSW52ZXJzZXMgbnVtYmVyIG92ZXIgbW9kdWxvLlxuICogSW1wbGVtZW50ZWQgdXNpbmcgW0V1Y2xpZGVhbiBHQ0RdKGh0dHBzOi8vYnJpbGxpYW50Lm9yZy93aWtpL2V4dGVuZGVkLWV1Y2xpZGVhbi1hbGdvcml0aG0vKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChudW1iZXI6IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBiaWdpbnQge1xuICBpZiAobnVtYmVyID09PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBleHBlY3RlZCBub24temVybyBudW1iZXInKTtcbiAgaWYgKG1vZHVsbyA8PSBfMG4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBleHBlY3RlZCBwb3NpdGl2ZSBtb2R1bHVzLCBnb3QgJyArIG1vZHVsbyk7XG4gIC8vIEZlcm1hdCdzIGxpdHRsZSB0aGVvcmVtIFwiQ1QtbGlrZVwiIHZlcnNpb24gaW52KG4pID0gbl4obS0yKSBtb2QgbSBpcyAzMHggc2xvd2VyLlxuICBsZXQgYSA9IG1vZChudW1iZXIsIG1vZHVsbyk7XG4gIGxldCBiID0gbW9kdWxvO1xuICAvLyBwcmV0dGllci1pZ25vcmVcbiAgbGV0IHggPSBfMG4sIHkgPSBfMW4sIHUgPSBfMW4sIHYgPSBfMG47XG4gIHdoaWxlIChhICE9PSBfMG4pIHtcbiAgICAvLyBKSVQgYXBwbGllcyBvcHRpbWl6YXRpb24gaWYgdGhvc2UgdHdvIGxpbmVzIGZvbGxvdyBlYWNoIG90aGVyXG4gICAgY29uc3QgcSA9IGIgLyBhO1xuICAgIGNvbnN0IHIgPSBiICUgYTtcbiAgICBjb25zdCBtID0geCAtIHUgKiBxO1xuICAgIGNvbnN0IG4gPSB5IC0gdiAqIHE7XG4gICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgYiA9IGEsIGEgPSByLCB4ID0gdSwgeSA9IHYsIHUgPSBtLCB2ID0gbjtcbiAgfVxuICBjb25zdCBnY2QgPSBiO1xuICBpZiAoZ2NkICE9PSBfMW4pIHRocm93IG5ldyBFcnJvcignaW52ZXJ0OiBkb2VzIG5vdCBleGlzdCcpO1xuICByZXR1cm4gbW9kKHgsIG1vZHVsbyk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydElzU3F1YXJlPFQ+KEZwOiBJRmllbGQ8VD4sIHJvb3Q6IFQsIG46IFQpOiB2b2lkIHtcbiAgaWYgKCFGcC5lcWwoRnAuc3FyKHJvb3QpLCBuKSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xufVxuXG4vLyBOb3QgYWxsIHJvb3RzIGFyZSBwb3NzaWJsZSEgRXhhbXBsZSB3aGljaCB3aWxsIHRocm93OlxuLy8gY29uc3QgTlVNID1cbi8vIG4gPSA3MjA1NzU5NDAzNzkyNzgxNm47XG4vLyBGcCA9IEZpZWxkKEJpZ0ludCgnMHgxYTAxMTFlYTM5N2ZlNjlhNGIxYmE3YjY0MzRiYWNkNzY0Nzc0Yjg0ZjM4NTEyYmY2NzMwZDJhMGY2YjBmNjI0MWVhYmZmZmViMTUzZmZmZmI5ZmVmZmZmZmZmZmFhYWInKSk7XG5mdW5jdGlvbiBzcXJ0M21vZDQ8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkge1xuICBjb25zdCBwMWRpdjQgPSAoRnAuT1JERVIgKyBfMW4pIC8gXzRuO1xuICBjb25zdCByb290ID0gRnAucG93KG4sIHAxZGl2NCk7XG4gIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5cbmZ1bmN0aW9uIHNxcnQ1bW9kODxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSB7XG4gIGNvbnN0IHA1ZGl2OCA9IChGcC5PUkRFUiAtIF81bikgLyBfOG47XG4gIGNvbnN0IG4yID0gRnAubXVsKG4sIF8ybik7XG4gIGNvbnN0IHYgPSBGcC5wb3cobjIsIHA1ZGl2OCk7XG4gIGNvbnN0IG52ID0gRnAubXVsKG4sIHYpO1xuICBjb25zdCBpID0gRnAubXVsKEZwLm11bChudiwgXzJuKSwgdik7XG4gIGNvbnN0IHJvb3QgPSBGcC5tdWwobnYsIEZwLnN1YihpLCBGcC5PTkUpKTtcbiAgYXNzZXJ0SXNTcXVhcmUoRnAsIHJvb3QsIG4pO1xuICByZXR1cm4gcm9vdDtcbn1cblxuLy8gQmFzZWQgb24gUkZDOTM4MCwgS29uZyBhbGdvcml0aG1cbi8vIHByZXR0aWVyLWlnbm9yZVxuZnVuY3Rpb24gc3FydDltb2QxNihQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIGNvbnN0IEZwXyA9IEZpZWxkKFApO1xuICBjb25zdCB0biA9IHRvbmVsbGlTaGFua3MoUCk7XG4gIGNvbnN0IGMxID0gdG4oRnBfLCBGcF8ubmVnKEZwXy5PTkUpKTsvLyAgMS4gYzEgPSBzcXJ0KC0xKSBpbiBGLCBpLmUuLCAoYzFeMikgPT0gLTEgaW4gRlxuICBjb25zdCBjMiA9IHRuKEZwXywgYzEpOyAgICAgICAgICAgICAgLy8gIDIuIGMyID0gc3FydChjMSkgaW4gRiwgaS5lLiwgKGMyXjIpID09IGMxIGluIEZcbiAgY29uc3QgYzMgPSB0bihGcF8sIEZwXy5uZWcoYzEpKTsgICAgIC8vICAzLiBjMyA9IHNxcnQoLWMxKSBpbiBGLCBpLmUuLCAoYzNeMikgPT0gLWMxIGluIEZcbiAgY29uc3QgYzQgPSAoUCArIF83bikgLyBfMTZuOyAgICAgICAgIC8vICA0LiBjNCA9IChxICsgNykgLyAxNiAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgcmV0dXJuIDxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKSA9PiB7XG4gICAgbGV0IHR2MSA9IEZwLnBvdyhuLCBjNCk7ICAgICAgICAgICAvLyAgMS4gdHYxID0geF5jNFxuICAgIGxldCB0djIgPSBGcC5tdWwodHYxLCBjMSk7ICAgICAgICAgLy8gIDIuIHR2MiA9IGMxICogdHYxXG4gICAgY29uc3QgdHYzID0gRnAubXVsKHR2MSwgYzIpOyAgICAgICAvLyAgMy4gdHYzID0gYzIgKiB0djFcbiAgICBjb25zdCB0djQgPSBGcC5tdWwodHYxLCBjMyk7ICAgICAgIC8vICA0LiB0djQgPSBjMyAqIHR2MVxuICAgIGNvbnN0IGUxID0gRnAuZXFsKEZwLnNxcih0djIpLCBuKTsgLy8gIDUuICBlMSA9ICh0djJeMikgPT0geFxuICAgIGNvbnN0IGUyID0gRnAuZXFsKEZwLnNxcih0djMpLCBuKTsgLy8gIDYuICBlMiA9ICh0djNeMikgPT0geFxuICAgIHR2MSA9IEZwLmNtb3YodHYxLCB0djIsIGUxKTsgICAgICAgLy8gIDcuIHR2MSA9IENNT1YodHYxLCB0djIsIGUxKSAgIyBTZWxlY3QgdHYyIGlmICh0djJeMikgPT0geFxuICAgIHR2MiA9IEZwLmNtb3YodHY0LCB0djMsIGUyKTsgICAgICAgLy8gIDguIHR2MiA9IENNT1YodHY0LCB0djMsIGUyKSAgIyBTZWxlY3QgdHYzIGlmICh0djNeMikgPT0geFxuICAgIGNvbnN0IGUzID0gRnAuZXFsKEZwLnNxcih0djIpLCBuKTsgLy8gIDkuICBlMyA9ICh0djJeMikgPT0geFxuICAgIGNvbnN0IHJvb3QgPSBGcC5jbW92KHR2MSwgdHYyLCBlMyk7Ly8gMTAuICB6ID0gQ01PVih0djEsIHR2MiwgZTMpICAgIyBTZWxlY3Qgc3FydCBmcm9tIHR2MSAmIHR2MlxuICAgIGFzc2VydElzU3F1YXJlKEZwLCByb290LCBuKTtcbiAgICByZXR1cm4gcm9vdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBUb25lbGxpLVNoYW5rcyBzcXVhcmUgcm9vdCBzZWFyY2ggYWxnb3JpdGhtLlxuICogMS4gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmIChwYWdlIDEyKVxuICogMi4gU3F1YXJlIFJvb3RzIGZyb20gMTsgMjQsIDUxLCAxMCB0byBEYW4gU2hhbmtzXG4gKiBAcGFyYW0gUCBmaWVsZCBvcmRlclxuICogQHJldHVybnMgZnVuY3Rpb24gdGhhdCB0YWtlcyBmaWVsZCBGcCAoY3JlYXRlZCBmcm9tIFApIGFuZCBudW1iZXIgblxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9uZWxsaVNoYW5rcyhQOiBiaWdpbnQpOiA8VD4oRnA6IElGaWVsZDxUPiwgbjogVCkgPT4gVCB7XG4gIC8vIEluaXRpYWxpemF0aW9uIChwcmVjb21wdXRhdGlvbikuXG4gIC8vIENhY2hpbmcgaW5pdGlhbGl6YXRpb24gY291bGQgYm9vc3QgcGVyZiBieSA3JS5cbiAgaWYgKFAgPCBfM24pIHRocm93IG5ldyBFcnJvcignc3FydCBpcyBub3QgZGVmaW5lZCBmb3Igc21hbGwgZmllbGQnKTtcbiAgLy8gRmFjdG9yIFAgLSAxID0gUSAqIDJeUywgd2hlcmUgUSBpcyBvZGRcbiAgbGV0IFEgPSBQIC0gXzFuO1xuICBsZXQgUyA9IDA7XG4gIHdoaWxlIChRICUgXzJuID09PSBfMG4pIHtcbiAgICBRIC89IF8ybjtcbiAgICBTKys7XG4gIH1cblxuICAvLyBGaW5kIHRoZSBmaXJzdCBxdWFkcmF0aWMgbm9uLXJlc2lkdWUgWiA+PSAyXG4gIGxldCBaID0gXzJuO1xuICBjb25zdCBfRnAgPSBGaWVsZChQKTtcbiAgd2hpbGUgKEZwTGVnZW5kcmUoX0ZwLCBaKSA9PT0gMSkge1xuICAgIC8vIEJhc2ljIHByaW1hbGl0eSB0ZXN0IGZvciBQLiBBZnRlciB4IGl0ZXJhdGlvbnMsIGNoYW5jZSBvZlxuICAgIC8vIG5vdCBmaW5kaW5nIHF1YWRyYXRpYyBub24tcmVzaWR1ZSBpcyAyXngsIHNvIDJeMTAwMC5cbiAgICBpZiAoWisrID4gMTAwMCkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdDogcHJvYmFibHkgbm9uLXByaW1lIFAnKTtcbiAgfVxuICAvLyBGYXN0LXBhdGg7IHVzdWFsbHkgZG9uZSBiZWZvcmUgWiwgYnV0IHdlIGRvIFwicHJpbWFsaXR5IHRlc3RcIi5cbiAgaWYgKFMgPT09IDEpIHJldHVybiBzcXJ0M21vZDQ7XG5cbiAgLy8gU2xvdy1wYXRoXG4gIC8vIFRPRE86IHRlc3Qgb24gRnAyIGFuZCBvdGhlcnNcbiAgbGV0IGNjID0gX0ZwLnBvdyhaLCBRKTsgLy8gYyA9IHpeUVxuICBjb25zdCBRMWRpdjIgPSAoUSArIF8xbikgLyBfMm47XG4gIHJldHVybiBmdW5jdGlvbiB0b25lbGxpU2xvdzxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogVCB7XG4gICAgaWYgKEZwLmlzMChuKSkgcmV0dXJuIG47XG4gICAgLy8gQ2hlY2sgaWYgbiBpcyBhIHF1YWRyYXRpYyByZXNpZHVlIHVzaW5nIExlZ2VuZHJlIHN5bWJvbFxuICAgIGlmIChGcExlZ2VuZHJlKEZwLCBuKSAhPT0gMSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB2YXJpYWJsZXMgZm9yIHRoZSBtYWluIGxvb3BcbiAgICBsZXQgTSA9IFM7XG4gICAgbGV0IGMgPSBGcC5tdWwoRnAuT05FLCBjYyk7IC8vIGMgPSB6XlEsIG1vdmUgY2MgZnJvbSBmaWVsZCBfRnAgaW50byBmaWVsZCBGcFxuICAgIGxldCB0ID0gRnAucG93KG4sIFEpOyAvLyB0ID0gbl5RLCBmaXJzdCBndWVzcyBhdCB0aGUgZnVkZ2UgZmFjdG9yXG4gICAgbGV0IFIgPSBGcC5wb3cobiwgUTFkaXYyKTsgLy8gUiA9IG5eKChRKzEpLzIpLCBmaXJzdCBndWVzcyBhdCB0aGUgc3F1YXJlIHJvb3RcblxuICAgIC8vIE1haW4gbG9vcFxuICAgIC8vIHdoaWxlIHQgIT0gMVxuICAgIHdoaWxlICghRnAuZXFsKHQsIEZwLk9ORSkpIHtcbiAgICAgIGlmIChGcC5pczAodCkpIHJldHVybiBGcC5aRVJPOyAvLyBpZiB0PTAgcmV0dXJuIFI9MFxuICAgICAgbGV0IGkgPSAxO1xuXG4gICAgICAvLyBGaW5kIHRoZSBzbWFsbGVzdCBpID49IDEgc3VjaCB0aGF0IHReKDJeaSkgXHUyMjYxIDEgKG1vZCBQKVxuICAgICAgbGV0IHRfdG1wID0gRnAuc3FyKHQpOyAvLyB0XigyXjEpXG4gICAgICB3aGlsZSAoIUZwLmVxbCh0X3RtcCwgRnAuT05FKSkge1xuICAgICAgICBpKys7XG4gICAgICAgIHRfdG1wID0gRnAuc3FyKHRfdG1wKTsgLy8gdF4oMl4yKS4uLlxuICAgICAgICBpZiAoaSA9PT0gTSkgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZmluZCBzcXVhcmUgcm9vdCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGV4cG9uZW50IGZvciBiOiAyXihNIC0gaSAtIDEpXG4gICAgICBjb25zdCBleHBvbmVudCA9IF8xbiA8PCBCaWdJbnQoTSAtIGkgLSAxKTsgLy8gYmlnaW50IGlzIGltcG9ydGFudFxuICAgICAgY29uc3QgYiA9IEZwLnBvdyhjLCBleHBvbmVudCk7IC8vIGIgPSAyXihNIC0gaSAtIDEpXG5cbiAgICAgIC8vIFVwZGF0ZSB2YXJpYWJsZXNcbiAgICAgIE0gPSBpO1xuICAgICAgYyA9IEZwLnNxcihiKTsgLy8gYyA9IGJeMlxuICAgICAgdCA9IEZwLm11bCh0LCBjKTsgLy8gdCA9ICh0ICogYl4yKVxuICAgICAgUiA9IEZwLm11bChSLCBiKTsgLy8gUiA9IFIqYlxuICAgIH1cbiAgICByZXR1cm4gUjtcbiAgfTtcbn1cblxuLyoqXG4gKiBTcXVhcmUgcm9vdCBmb3IgYSBmaW5pdGUgZmllbGQuIFdpbGwgdHJ5IG9wdGltaXplZCB2ZXJzaW9ucyBmaXJzdDpcbiAqXG4gKiAxLiBQIFx1MjI2MSAzIChtb2QgNClcbiAqIDIuIFAgXHUyMjYxIDUgKG1vZCA4KVxuICogMy4gUCBcdTIyNjEgOSAobW9kIDE2KVxuICogNC4gVG9uZWxsaS1TaGFua3MgYWxnb3JpdGhtXG4gKlxuICogRGlmZmVyZW50IGFsZ29yaXRobXMgY2FuIGdpdmUgZGlmZmVyZW50IHJvb3RzLCBpdCBpcyB1cCB0byB1c2VyIHRvIGRlY2lkZSB3aGljaCBvbmUgdGhleSB3YW50LlxuICogRm9yIGV4YW1wbGUgdGhlcmUgaXMgRnBTcXJ0T2RkL0ZwU3FydEV2ZW4gdG8gY2hvaWNlIHJvb3QgYmFzZWQgb24gb2RkbmVzcyAodXNlZCBmb3IgaGFzaC10by1jdXJ2ZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnQoUDogYmlnaW50KTogPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpID0+IFQge1xuICAvLyBQIFx1MjI2MSAzIChtb2QgNCkgPT4gXHUyMjFBbiA9IG5eKChQKzEpLzQpXG4gIGlmIChQICUgXzRuID09PSBfM24pIHJldHVybiBzcXJ0M21vZDQ7XG4gIC8vIFAgXHUyMjYxIDUgKG1vZCA4KSA9PiBBdGtpbiBhbGdvcml0aG0sIHBhZ2UgMTAgb2YgaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmXG4gIGlmIChQICUgXzhuID09PSBfNW4pIHJldHVybiBzcXJ0NW1vZDg7XG4gIC8vIFAgXHUyMjYxIDkgKG1vZCAxNikgPT4gS29uZyBhbGdvcml0aG0sIHBhZ2UgMTEgb2YgaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxMi82ODUucGRmIChhbGdvcml0aG0gNClcbiAgaWYgKFAgJSBfMTZuID09PSBfOW4pIHJldHVybiBzcXJ0OW1vZDE2KFApO1xuICAvLyBUb25lbGxpLVNoYW5rcyBhbGdvcml0aG1cbiAgcmV0dXJuIHRvbmVsbGlTaGFua3MoUCk7XG59XG5cbi8vIExpdHRsZS1lbmRpYW4gY2hlY2sgZm9yIGZpcnN0IExFIGJpdCAobGFzdCBCRSBiaXQpO1xuZXhwb3J0IGNvbnN0IGlzTmVnYXRpdmVMRSA9IChudW06IGJpZ2ludCwgbW9kdWxvOiBiaWdpbnQpOiBib29sZWFuID0+XG4gIChtb2QobnVtLCBtb2R1bG8pICYgXzFuKSA9PT0gXzFuO1xuXG4vKiogRmllbGQgaXMgbm90IGFsd2F5cyBvdmVyIHByaW1lOiBmb3IgZXhhbXBsZSwgRnAyIGhhcyBPUkRFUihxKT1wXm0uICovXG5leHBvcnQgaW50ZXJmYWNlIElGaWVsZDxUPiB7XG4gIE9SREVSOiBiaWdpbnQ7XG4gIEJZVEVTOiBudW1iZXI7XG4gIEJJVFM6IG51bWJlcjtcbiAgaXNMRTogYm9vbGVhbjtcbiAgWkVSTzogVDtcbiAgT05FOiBUO1xuICAvLyAxLWFyZ1xuICBjcmVhdGU6IChudW06IFQpID0+IFQ7XG4gIGlzVmFsaWQ6IChudW06IFQpID0+IGJvb2xlYW47XG4gIGlzMDogKG51bTogVCkgPT4gYm9vbGVhbjtcbiAgaXNWYWxpZE5vdDA6IChudW06IFQpID0+IGJvb2xlYW47XG4gIG5lZyhudW06IFQpOiBUO1xuICBpbnYobnVtOiBUKTogVDtcbiAgc3FydChudW06IFQpOiBUO1xuICBzcXIobnVtOiBUKTogVDtcbiAgLy8gMi1hcmdzXG4gIGVxbChsaHM6IFQsIHJoczogVCk6IGJvb2xlYW47XG4gIGFkZChsaHM6IFQsIHJoczogVCk6IFQ7XG4gIHN1YihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIG11bChsaHM6IFQsIHJoczogVCB8IGJpZ2ludCk6IFQ7XG4gIHBvdyhsaHM6IFQsIHBvd2VyOiBiaWdpbnQpOiBUO1xuICBkaXYobGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICAvLyBOIGZvciBOb25Ob3JtYWxpemVkIChmb3Igbm93KVxuICBhZGROKGxoczogVCwgcmhzOiBUKTogVDtcbiAgc3ViTihsaHM6IFQsIHJoczogVCk6IFQ7XG4gIG11bE4obGhzOiBULCByaHM6IFQgfCBiaWdpbnQpOiBUO1xuICBzcXJOKG51bTogVCk6IFQ7XG5cbiAgLy8gT3B0aW9uYWxcbiAgLy8gU2hvdWxkIGJlIHNhbWUgYXMgc2duMCBmdW5jdGlvbiBpblxuICAvLyBbUkZDOTM4MF0oaHR0cHM6Ly93d3cucmZjLWVkaXRvci5vcmcvcmZjL3JmYzkzODAjc2VjdGlvbi00LjEpLlxuICAvLyBOT1RFOiBzZ24wIGlzICduZWdhdGl2ZSBpbiBMRScsIHdoaWNoIGlzIHNhbWUgYXMgb2RkLiBBbmQgbmVnYXRpdmUgaW4gTEUgaXMga2luZGEgc3RyYW5nZSBkZWZpbml0aW9uIGFueXdheS5cbiAgaXNPZGQ/KG51bTogVCk6IGJvb2xlYW47IC8vIE9kZCBpbnN0ZWFkIG9mIGV2ZW4gc2luY2Ugd2UgaGF2ZSBpdCBmb3IgRnAyXG4gIC8vIGxlZ2VuZHJlPyhudW06IFQpOiBUO1xuICBpbnZlcnRCYXRjaDogKGxzdDogVFtdKSA9PiBUW107XG4gIHRvQnl0ZXMobnVtOiBUKTogVWludDhBcnJheTtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBza2lwVmFsaWRhdGlvbj86IGJvb2xlYW4pOiBUO1xuICAvLyBJZiBjIGlzIEZhbHNlLCBDTU9WIHJldHVybnMgYSwgb3RoZXJ3aXNlIGl0IHJldHVybnMgYi5cbiAgY21vdihhOiBULCBiOiBULCBjOiBib29sZWFuKTogVDtcbn1cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgRklFTERfRklFTERTID0gW1xuICAnY3JlYXRlJywgJ2lzVmFsaWQnLCAnaXMwJywgJ25lZycsICdpbnYnLCAnc3FydCcsICdzcXInLFxuICAnZXFsJywgJ2FkZCcsICdzdWInLCAnbXVsJywgJ3BvdycsICdkaXYnLFxuICAnYWRkTicsICdzdWJOJywgJ211bE4nLCAnc3FyTidcbl0gYXMgY29uc3Q7XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWVsZDxUPihmaWVsZDogSUZpZWxkPFQ+KTogSUZpZWxkPFQ+IHtcbiAgY29uc3QgaW5pdGlhbCA9IHtcbiAgICBPUkRFUjogJ2JpZ2ludCcsXG4gICAgQllURVM6ICdudW1iZXInLFxuICAgIEJJVFM6ICdudW1iZXInLFxuICB9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIGNvbnN0IG9wdHMgPSBGSUVMRF9GSUVMRFMucmVkdWNlKChtYXAsIHZhbDogc3RyaW5nKSA9PiB7XG4gICAgbWFwW3ZhbF0gPSAnZnVuY3Rpb24nO1xuICAgIHJldHVybiBtYXA7XG4gIH0sIGluaXRpYWwpO1xuICB2YWxpZGF0ZU9iamVjdChmaWVsZCwgb3B0cyk7XG4gIC8vIGNvbnN0IG1heCA9IDE2Mzg0O1xuICAvLyBpZiAoZmllbGQuQllURVMgPCAxIHx8IGZpZWxkLkJZVEVTID4gbWF4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQnKTtcbiAgLy8gaWYgKGZpZWxkLkJJVFMgPCAxIHx8IGZpZWxkLkJJVFMgPiA4ICogbWF4KSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQnKTtcbiAgcmV0dXJuIGZpZWxkO1xufVxuXG4vLyBHZW5lcmljIGZpZWxkIGZ1bmN0aW9uc1xuXG4vKipcbiAqIFNhbWUgYXMgYHBvd2AgYnV0IGZvciBGcDogbm9uLWNvbnN0YW50LXRpbWUuXG4gKiBVbnNhZmUgaW4gc29tZSBjb250ZXh0czogdXNlcyBsYWRkZXIsIHNvIGNhbiBleHBvc2UgYmlnaW50IGJpdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcFBvdzxUPihGcDogSUZpZWxkPFQ+LCBudW06IFQsIHBvd2VyOiBiaWdpbnQpOiBUIHtcbiAgaWYgKHBvd2VyIDwgXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZXhwb25lbnQsIG5lZ2F0aXZlcyB1bnN1cHBvcnRlZCcpO1xuICBpZiAocG93ZXIgPT09IF8wbikgcmV0dXJuIEZwLk9ORTtcbiAgaWYgKHBvd2VyID09PSBfMW4pIHJldHVybiBudW07XG4gIGxldCBwID0gRnAuT05FO1xuICBsZXQgZCA9IG51bTtcbiAgd2hpbGUgKHBvd2VyID4gXzBuKSB7XG4gICAgaWYgKHBvd2VyICYgXzFuKSBwID0gRnAubXVsKHAsIGQpO1xuICAgIGQgPSBGcC5zcXIoZCk7XG4gICAgcG93ZXIgPj49IF8xbjtcbiAgfVxuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBFZmZpY2llbnRseSBpbnZlcnQgYW4gYXJyYXkgb2YgRmllbGQgZWxlbWVudHMuXG4gKiBFeGNlcHRpb24tZnJlZS4gV2lsbCByZXR1cm4gYHVuZGVmaW5lZGAgZm9yIDAgZWxlbWVudHMuXG4gKiBAcGFyYW0gcGFzc1plcm8gbWFwIDAgdG8gMCAoaW5zdGVhZCBvZiB1bmRlZmluZWQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGcEludmVydEJhdGNoPFQ+KEZwOiBJRmllbGQ8VD4sIG51bXM6IFRbXSwgcGFzc1plcm8gPSBmYWxzZSk6IFRbXSB7XG4gIGNvbnN0IGludmVydGVkID0gbmV3IEFycmF5KG51bXMubGVuZ3RoKS5maWxsKHBhc3NaZXJvID8gRnAuWkVSTyA6IHVuZGVmaW5lZCk7XG4gIC8vIFdhbGsgZnJvbSBmaXJzdCB0byBsYXN0LCBtdWx0aXBseSB0aGVtIGJ5IGVhY2ggb3RoZXIgTU9EIHBcbiAgY29uc3QgbXVsdGlwbGllZEFjYyA9IG51bXMucmVkdWNlKChhY2MsIG51bSwgaSkgPT4ge1xuICAgIGlmIChGcC5pczAobnVtKSkgcmV0dXJuIGFjYztcbiAgICBpbnZlcnRlZFtpXSA9IGFjYztcbiAgICByZXR1cm4gRnAubXVsKGFjYywgbnVtKTtcbiAgfSwgRnAuT05FKTtcbiAgLy8gSW52ZXJ0IGxhc3QgZWxlbWVudFxuICBjb25zdCBpbnZlcnRlZEFjYyA9IEZwLmludihtdWx0aXBsaWVkQWNjKTtcbiAgLy8gV2FsayBmcm9tIGxhc3QgdG8gZmlyc3QsIG11bHRpcGx5IHRoZW0gYnkgaW52ZXJ0ZWQgZWFjaCBvdGhlciBNT0QgcFxuICBudW1zLnJlZHVjZVJpZ2h0KChhY2MsIG51bSwgaSkgPT4ge1xuICAgIGlmIChGcC5pczAobnVtKSkgcmV0dXJuIGFjYztcbiAgICBpbnZlcnRlZFtpXSA9IEZwLm11bChhY2MsIGludmVydGVkW2ldKTtcbiAgICByZXR1cm4gRnAubXVsKGFjYywgbnVtKTtcbiAgfSwgaW52ZXJ0ZWRBY2MpO1xuICByZXR1cm4gaW52ZXJ0ZWQ7XG59XG5cbi8vIFRPRE86IHJlbW92ZVxuZXhwb3J0IGZ1bmN0aW9uIEZwRGl2PFQ+KEZwOiBJRmllbGQ8VD4sIGxoczogVCwgcmhzOiBUIHwgYmlnaW50KTogVCB7XG4gIHJldHVybiBGcC5tdWwobGhzLCB0eXBlb2YgcmhzID09PSAnYmlnaW50JyA/IGludmVydChyaHMsIEZwLk9SREVSKSA6IEZwLmludihyaHMpKTtcbn1cblxuLyoqXG4gKiBMZWdlbmRyZSBzeW1ib2wuXG4gKiBMZWdlbmRyZSBjb25zdGFudCBpcyB1c2VkIHRvIGNhbGN1bGF0ZSBMZWdlbmRyZSBzeW1ib2wgKGEgfCBwKVxuICogd2hpY2ggZGVub3RlcyB0aGUgdmFsdWUgb2YgYV4oKHAtMSkvMikgKG1vZCBwKS5cbiAqXG4gKiAqIChhIHwgcCkgXHUyMjYxIDEgICAgaWYgYSBpcyBhIHNxdWFyZSAobW9kIHApLCBxdWFkcmF0aWMgcmVzaWR1ZVxuICogKiAoYSB8IHApIFx1MjI2MSAtMSAgIGlmIGEgaXMgbm90IGEgc3F1YXJlIChtb2QgcCksIHF1YWRyYXRpYyBub24gcmVzaWR1ZVxuICogKiAoYSB8IHApIFx1MjI2MSAwICAgIGlmIGEgXHUyMjYxIDAgKG1vZCBwKVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnBMZWdlbmRyZTxUPihGcDogSUZpZWxkPFQ+LCBuOiBUKTogLTEgfCAwIHwgMSB7XG4gIC8vIFdlIGNhbiB1c2UgM3JkIGFyZ3VtZW50IGFzIG9wdGlvbmFsIGNhY2hlIG9mIHRoaXMgdmFsdWVcbiAgLy8gYnV0IHNlZW1zIHVubmVlZGVkIGZvciBub3cuIFRoZSBvcGVyYXRpb24gaXMgdmVyeSBmYXN0LlxuICBjb25zdCBwMW1vZDIgPSAoRnAuT1JERVIgLSBfMW4pIC8gXzJuO1xuICBjb25zdCBwb3dlcmVkID0gRnAucG93KG4sIHAxbW9kMik7XG4gIGNvbnN0IHllcyA9IEZwLmVxbChwb3dlcmVkLCBGcC5PTkUpO1xuICBjb25zdCB6ZXJvID0gRnAuZXFsKHBvd2VyZWQsIEZwLlpFUk8pO1xuICBjb25zdCBubyA9IEZwLmVxbChwb3dlcmVkLCBGcC5uZWcoRnAuT05FKSk7XG4gIGlmICgheWVzICYmICF6ZXJvICYmICFubykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIExlZ2VuZHJlIHN5bWJvbCByZXN1bHQnKTtcbiAgcmV0dXJuIHllcyA/IDEgOiB6ZXJvID8gMCA6IC0xO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgVHJ1ZSB3aGVuZXZlciB0aGUgdmFsdWUgeCBpcyBhIHNxdWFyZSBpbiB0aGUgZmllbGQgRi5cbmV4cG9ydCBmdW5jdGlvbiBGcElzU3F1YXJlPFQ+KEZwOiBJRmllbGQ8VD4sIG46IFQpOiBib29sZWFuIHtcbiAgY29uc3QgbCA9IEZwTGVnZW5kcmUoRnAsIG4pO1xuICByZXR1cm4gbCA9PT0gMTtcbn1cblxuZXhwb3J0IHR5cGUgTkxlbmd0aCA9IHsgbkJ5dGVMZW5ndGg6IG51bWJlcjsgbkJpdExlbmd0aDogbnVtYmVyIH07XG4vLyBDVVJWRS5uIGxlbmd0aHNcbmV4cG9ydCBmdW5jdGlvbiBuTGVuZ3RoKG46IGJpZ2ludCwgbkJpdExlbmd0aD86IG51bWJlcik6IE5MZW5ndGgge1xuICAvLyBCaXQgc2l6ZSwgYnl0ZSBzaXplIG9mIENVUlZFLm5cbiAgaWYgKG5CaXRMZW5ndGggIT09IHVuZGVmaW5lZCkgYW51bWJlcihuQml0TGVuZ3RoKTtcbiAgY29uc3QgX25CaXRMZW5ndGggPSBuQml0TGVuZ3RoICE9PSB1bmRlZmluZWQgPyBuQml0TGVuZ3RoIDogbi50b1N0cmluZygyKS5sZW5ndGg7XG4gIGNvbnN0IG5CeXRlTGVuZ3RoID0gTWF0aC5jZWlsKF9uQml0TGVuZ3RoIC8gOCk7XG4gIHJldHVybiB7IG5CaXRMZW5ndGg6IF9uQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9O1xufVxuXG50eXBlIEZwRmllbGQgPSBJRmllbGQ8YmlnaW50PiAmIFJlcXVpcmVkPFBpY2s8SUZpZWxkPGJpZ2ludD4sICdpc09kZCc+PjtcbnR5cGUgU3FydEZuID0gKG46IGJpZ2ludCkgPT4gYmlnaW50O1xudHlwZSBGaWVsZE9wdHMgPSBQYXJ0aWFsPHtcbiAgaXNMRTogYm9vbGVhbjtcbiAgQklUUzogbnVtYmVyO1xuICBzcXJ0OiBTcXJ0Rm47XG4gIGFsbG93ZWRMZW5ndGhzPzogcmVhZG9ubHkgbnVtYmVyW107IC8vIGZvciBQNTIxIChhZGRzIHBhZGRpbmcgZm9yIHNtYWxsZXIgc2l6ZXMpXG4gIG1vZEZyb21CeXRlczogYm9vbGVhbjsgLy8gYmxzMTItMzgxIHJlcXVpcmVzIG1vZChuKSBpbnN0ZWFkIG9mIHJlamVjdGluZyBrZXlzID49IG5cbn0+O1xuY2xhc3MgX0ZpZWxkIGltcGxlbWVudHMgSUZpZWxkPGJpZ2ludD4ge1xuICByZWFkb25seSBPUkRFUjogYmlnaW50O1xuICByZWFkb25seSBCSVRTOiBudW1iZXI7XG4gIHJlYWRvbmx5IEJZVEVTOiBudW1iZXI7XG4gIHJlYWRvbmx5IGlzTEU6IGJvb2xlYW47XG4gIHJlYWRvbmx5IFpFUk8gPSBfMG47XG4gIHJlYWRvbmx5IE9ORSA9IF8xbjtcbiAgcmVhZG9ubHkgX2xlbmd0aHM/OiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBfc3FydDogUmV0dXJuVHlwZTx0eXBlb2YgRnBTcXJ0PiB8IHVuZGVmaW5lZDsgLy8gY2FjaGVkIHNxcnRcbiAgcHJpdmF0ZSByZWFkb25seSBfbW9kPzogYm9vbGVhbjtcbiAgY29uc3RydWN0b3IoT1JERVI6IGJpZ2ludCwgb3B0czogRmllbGRPcHRzID0ge30pIHtcbiAgICBpZiAoT1JERVIgPD0gXzBuKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQ6IGV4cGVjdGVkIE9SREVSID4gMCwgZ290ICcgKyBPUkRFUik7XG4gICAgbGV0IF9uYml0TGVuZ3RoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5pc0xFID0gZmFsc2U7XG4gICAgaWYgKG9wdHMgIT0gbnVsbCAmJiB0eXBlb2Ygb3B0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5CSVRTID09PSAnbnVtYmVyJykgX25iaXRMZW5ndGggPSBvcHRzLkJJVFM7XG4gICAgICBpZiAodHlwZW9mIG9wdHMuc3FydCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5zcXJ0ID0gb3B0cy5zcXJ0O1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLmlzTEUgPT09ICdib29sZWFuJykgdGhpcy5pc0xFID0gb3B0cy5pc0xFO1xuICAgICAgaWYgKG9wdHMuYWxsb3dlZExlbmd0aHMpIHRoaXMuX2xlbmd0aHMgPSBvcHRzLmFsbG93ZWRMZW5ndGhzPy5zbGljZSgpO1xuICAgICAgaWYgKHR5cGVvZiBvcHRzLm1vZEZyb21CeXRlcyA9PT0gJ2Jvb2xlYW4nKSB0aGlzLl9tb2QgPSBvcHRzLm1vZEZyb21CeXRlcztcbiAgICB9XG4gICAgY29uc3QgeyBuQml0TGVuZ3RoLCBuQnl0ZUxlbmd0aCB9ID0gbkxlbmd0aChPUkRFUiwgX25iaXRMZW5ndGgpO1xuICAgIGlmIChuQnl0ZUxlbmd0aCA+IDIwNDgpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWVsZDogZXhwZWN0ZWQgT1JERVIgb2YgPD0gMjA0OCBieXRlcycpO1xuICAgIHRoaXMuT1JERVIgPSBPUkRFUjtcbiAgICB0aGlzLkJJVFMgPSBuQml0TGVuZ3RoO1xuICAgIHRoaXMuQllURVMgPSBuQnl0ZUxlbmd0aDtcbiAgICB0aGlzLl9zcXJ0ID0gdW5kZWZpbmVkO1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh0aGlzKTtcbiAgfVxuXG4gIGNyZWF0ZShudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBpc1ZhbGlkKG51bTogYmlnaW50KSB7XG4gICAgaWYgKHR5cGVvZiBudW0gIT09ICdiaWdpbnQnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGZpZWxkIGVsZW1lbnQ6IGV4cGVjdGVkIGJpZ2ludCwgZ290ICcgKyB0eXBlb2YgbnVtKTtcbiAgICByZXR1cm4gXzBuIDw9IG51bSAmJiBudW0gPCB0aGlzLk9SREVSOyAvLyAwIGlzIHZhbGlkIGVsZW1lbnQsIGJ1dCBpdCdzIG5vdCBpbnZlcnRpYmxlXG4gIH1cbiAgaXMwKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG51bSA9PT0gXzBuO1xuICB9XG4gIC8vIGlzIHZhbGlkIGFuZCBpbnZlcnRpYmxlXG4gIGlzVmFsaWROb3QwKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuICF0aGlzLmlzMChudW0pICYmIHRoaXMuaXNWYWxpZChudW0pO1xuICB9XG4gIGlzT2RkKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIChudW0gJiBfMW4pID09PSBfMW47XG4gIH1cbiAgbmVnKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZCgtbnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBlcWwobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyA9PT0gcmhzO1xuICB9XG5cbiAgc3FyKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChudW0gKiBudW0sIHRoaXMuT1JERVIpO1xuICB9XG4gIGFkZChsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyArIHJocywgdGhpcy5PUkRFUik7XG4gIH1cbiAgc3ViKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBtb2QobGhzIC0gcmhzLCB0aGlzLk9SREVSKTtcbiAgfVxuICBtdWwobGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIG1vZChsaHMgKiByaHMsIHRoaXMuT1JERVIpO1xuICB9XG4gIHBvdyhudW06IGJpZ2ludCwgcG93ZXI6IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgcmV0dXJuIEZwUG93KHRoaXMsIG51bSwgcG93ZXIpO1xuICB9XG4gIGRpdihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbW9kKGxocyAqIGludmVydChyaHMsIHRoaXMuT1JERVIpLCB0aGlzLk9SREVSKTtcbiAgfVxuXG4gIC8vIFNhbWUgYXMgYWJvdmUsIGJ1dCBkb2Vzbid0IG5vcm1hbGl6ZVxuICBzcXJOKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIG51bSAqIG51bTtcbiAgfVxuICBhZGROKGxoczogYmlnaW50LCByaHM6IGJpZ2ludCkge1xuICAgIHJldHVybiBsaHMgKyByaHM7XG4gIH1cbiAgc3ViTihsaHM6IGJpZ2ludCwgcmhzOiBiaWdpbnQpIHtcbiAgICByZXR1cm4gbGhzIC0gcmhzO1xuICB9XG4gIG11bE4obGhzOiBiaWdpbnQsIHJoczogYmlnaW50KSB7XG4gICAgcmV0dXJuIGxocyAqIHJocztcbiAgfVxuXG4gIGludihudW06IGJpZ2ludCkge1xuICAgIHJldHVybiBpbnZlcnQobnVtLCB0aGlzLk9SREVSKTtcbiAgfVxuICBzcXJ0KG51bTogYmlnaW50KTogYmlnaW50IHtcbiAgICAvLyBDYWNoaW5nIF9zcXJ0IHNwZWVkcyB1cCBzcXJ0OW1vZDE2IGJ5IDV4IGFuZCB0b25uZWxpLXNoYW5rcyBieSAxMCVcbiAgICBpZiAoIXRoaXMuX3NxcnQpIHRoaXMuX3NxcnQgPSBGcFNxcnQodGhpcy5PUkRFUik7XG4gICAgcmV0dXJuIHRoaXMuX3NxcnQodGhpcywgbnVtKTtcbiAgfVxuICB0b0J5dGVzKG51bTogYmlnaW50KSB7XG4gICAgcmV0dXJuIHRoaXMuaXNMRSA/IG51bWJlclRvQnl0ZXNMRShudW0sIHRoaXMuQllURVMpIDogbnVtYmVyVG9CeXRlc0JFKG51bSwgdGhpcy5CWVRFUyk7XG4gIH1cbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBza2lwVmFsaWRhdGlvbiA9IGZhbHNlKSB7XG4gICAgYWJ5dGVzKGJ5dGVzKTtcbiAgICBjb25zdCB7IF9sZW5ndGhzOiBhbGxvd2VkTGVuZ3RocywgQllURVMsIGlzTEUsIE9SREVSLCBfbW9kOiBtb2RGcm9tQnl0ZXMgfSA9IHRoaXM7XG4gICAgaWYgKGFsbG93ZWRMZW5ndGhzKSB7XG4gICAgICBpZiAoIWFsbG93ZWRMZW5ndGhzLmluY2x1ZGVzKGJ5dGVzLmxlbmd0aCkgfHwgYnl0ZXMubGVuZ3RoID4gQllURVMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdGaWVsZC5mcm9tQnl0ZXM6IGV4cGVjdGVkICcgKyBhbGxvd2VkTGVuZ3RocyArICcgYnl0ZXMsIGdvdCAnICsgYnl0ZXMubGVuZ3RoXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBwYWRkZWQgPSBuZXcgVWludDhBcnJheShCWVRFUyk7XG4gICAgICAvLyBpc0xFIGFkZCAwIHRvIHJpZ2h0LCAhaXNMRSB0byB0aGUgbGVmdC5cbiAgICAgIHBhZGRlZC5zZXQoYnl0ZXMsIGlzTEUgPyAwIDogcGFkZGVkLmxlbmd0aCAtIGJ5dGVzLmxlbmd0aCk7XG4gICAgICBieXRlcyA9IHBhZGRlZDtcbiAgICB9XG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAhPT0gQllURVMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpZWxkLmZyb21CeXRlczogZXhwZWN0ZWQgJyArIEJZVEVTICsgJyBieXRlcywgZ290ICcgKyBieXRlcy5sZW5ndGgpO1xuICAgIGxldCBzY2FsYXIgPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGJ5dGVzKSA6IGJ5dGVzVG9OdW1iZXJCRShieXRlcyk7XG4gICAgaWYgKG1vZEZyb21CeXRlcykgc2NhbGFyID0gbW9kKHNjYWxhciwgT1JERVIpO1xuICAgIGlmICghc2tpcFZhbGlkYXRpb24pXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZChzY2FsYXIpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmllbGQgZWxlbWVudDogb3V0c2lkZSBvZiByYW5nZSAwLi5PUkRFUicpO1xuICAgIC8vIE5PVEU6IHdlIGRvbid0IHZhbGlkYXRlIHNjYWxhciBoZXJlLCBwbGVhc2UgdXNlIGlzVmFsaWQuIFRoaXMgZG9uZSBzdWNoIHdheSBiZWNhdXNlIHNvbWVcbiAgICAvLyBwcm90b2NvbCBtYXkgYWxsb3cgbm9uLXJlZHVjZWQgc2NhbGFyIHRoYXQgcmVkdWNlZCBsYXRlciBvciBjaGFuZ2VkIHNvbWUgb3RoZXIgd2F5LlxuICAgIHJldHVybiBzY2FsYXI7XG4gIH1cbiAgLy8gVE9ETzogd2UgZG9uJ3QgbmVlZCBpdCBoZXJlLCBtb3ZlIG91dCB0byBzZXBhcmF0ZSBmblxuICBpbnZlcnRCYXRjaChsc3Q6IGJpZ2ludFtdKTogYmlnaW50W10ge1xuICAgIHJldHVybiBGcEludmVydEJhdGNoKHRoaXMsIGxzdCk7XG4gIH1cbiAgLy8gV2UgY2FuJ3QgbW92ZSB0aGlzIG91dCBiZWNhdXNlIEZwNiwgRnAxMiBpbXBsZW1lbnQgaXRcbiAgLy8gYW5kIGl0J3MgdW5jbGVhciB3aGF0IHRvIHJldHVybiBpbiB0aGVyZS5cbiAgY21vdihhOiBiaWdpbnQsIGI6IGJpZ2ludCwgY29uZGl0aW9uOiBib29sZWFuKSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbiA/IGIgOiBhO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZpbml0ZSBmaWVsZC4gTWFqb3IgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uczpcbiAqICogMS4gRGVub3JtYWxpemVkIG9wZXJhdGlvbnMgbGlrZSBtdWxOIGluc3RlYWQgb2YgbXVsLlxuICogKiAyLiBJZGVudGljYWwgb2JqZWN0IHNoYXBlOiBuZXZlciBhZGQgb3IgcmVtb3ZlIGtleXMuXG4gKiAqIDMuIGBPYmplY3QuZnJlZXplYC5cbiAqIEZyYWdpbGU6IGFsd2F5cyBydW4gYSBiZW5jaG1hcmsgb24gYSBjaGFuZ2UuXG4gKiBTZWN1cml0eSBub3RlOiBvcGVyYXRpb25zIGRvbid0IGNoZWNrICdpc1ZhbGlkJyBmb3IgYWxsIGVsZW1lbnRzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLFxuICogaXQgaXMgY2FsbGVyIHJlc3BvbnNpYmlsaXR5IHRvIGNoZWNrIHRoaXMuXG4gKiBUaGlzIGlzIGxvdy1sZXZlbCBjb2RlLCBwbGVhc2UgbWFrZSBzdXJlIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICpcbiAqIE5vdGUgYWJvdXQgZmllbGQgcHJvcGVydGllczpcbiAqICogQ0hBUkFDVEVSSVNUSUMgcCA9IHByaW1lIG51bWJlciwgbnVtYmVyIG9mIGVsZW1lbnRzIGluIG1haW4gc3ViZ3JvdXAuXG4gKiAqIE9SREVSIHEgPSBzaW1pbGFyIHRvIGNvZmFjdG9yIGluIGN1cnZlcywgbWF5IGJlIGNvbXBvc2l0ZSBgcSA9IHBebWAuXG4gKlxuICogQHBhcmFtIE9SREVSIGZpZWxkIG9yZGVyLCBwcm9iYWJseSBwcmltZSwgb3IgY291bGQgYmUgY29tcG9zaXRlXG4gKiBAcGFyYW0gYml0TGVuIGhvdyBtYW55IGJpdHMgdGhlIGZpZWxkIGNvbnN1bWVzXG4gKiBAcGFyYW0gaXNMRSAoZGVmYXVsdDogZmFsc2UpIGlmIGVuY29kaW5nIC8gZGVjb2Rpbmcgc2hvdWxkIGJlIGluIGxpdHRsZS1lbmRpYW5cbiAqIEBwYXJhbSByZWRlZiBvcHRpb25hbCBmYXN0ZXIgcmVkZWZpbml0aW9ucyBvZiBzcXJ0IGFuZCBvdGhlciBtZXRob2RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWVsZChPUkRFUjogYmlnaW50LCBvcHRzOiBGaWVsZE9wdHMgPSB7fSk6IFJlYWRvbmx5PEZwRmllbGQ+IHtcbiAgcmV0dXJuIG5ldyBfRmllbGQoT1JERVIsIG9wdHMpO1xufVxuXG4vLyBHZW5lcmljIHJhbmRvbSBzY2FsYXIsIHdlIGNhbiBkbyBzYW1lIGZvciBvdGhlciBmaWVsZHMgaWYgdmlhIEZwMi5tdWwoRnAyLk9ORSwgRnAyLnJhbmRvbSk/XG4vLyBUaGlzIGFsbG93cyB1bnNhZmUgbWV0aG9kcyBsaWtlIGlnbm9yZSBiaWFzIG9yIHplcm8uIFRoZXNlIHVuc2FmZSwgYnV0IG9mdGVuIHVzZWQgaW4gZGlmZmVyZW50IHByb3RvY29scyAoaWYgZGV0ZXJtaW5pc3RpYyBSTkcpLlxuLy8gd2hpY2ggbWVhbiB3ZSBjYW5ub3QgZm9yY2UgdGhpcyB2aWEgb3B0cy5cbi8vIE5vdCBzdXJlIHdoYXQgdG8gZG8gd2l0aCByYW5kb21CeXRlcywgd2UgY2FuIGFjY2VwdCBpdCBpbnNpZGUgb3B0cyBpZiB3YW50ZWQuXG4vLyBQcm9iYWJseSBuZWVkIHRvIGV4cG9ydCBnZXRNaW5IYXNoTGVuZ3RoIHNvbWV3aGVyZT9cbi8vIHJhbmRvbShieXRlcz86IFVpbnQ4QXJyYXksIHVuc2FmZUFsbG93WmVybyA9IGZhbHNlLCB1bnNhZmVBbGxvd0JpYXMgPSBmYWxzZSkge1xuLy8gICBjb25zdCBMRU4gPSAhdW5zYWZlQWxsb3dCaWFzID8gZ2V0TWluSGFzaExlbmd0aChPUkRFUikgOiBCWVRFUztcbi8vICAgaWYgKGJ5dGVzID09PSB1bmRlZmluZWQpIGJ5dGVzID0gcmFuZG9tQnl0ZXMoTEVOKTsgLy8gX29wdHMucmFuZG9tQnl0ZXM/XG4vLyAgIGNvbnN0IG51bSA9IGlzTEUgPyBieXRlc1RvTnVtYmVyTEUoYnl0ZXMpIDogYnl0ZXNUb051bWJlckJFKGJ5dGVzKTtcbi8vICAgLy8gYG1vZCh4LCAxMSlgIGNhbiBzb21ldGltZXMgcHJvZHVjZSAwLiBgbW9kKHgsIDEwKSArIDFgIGlzIHRoZSBzYW1lLCBidXQgbm8gMFxuLy8gICBjb25zdCByZWR1Y2VkID0gdW5zYWZlQWxsb3daZXJvID8gbW9kKG51bSwgT1JERVIpIDogbW9kKG51bSwgT1JERVIgLSBfMW4pICsgXzFuO1xuLy8gICByZXR1cm4gcmVkdWNlZDtcbi8vIH0sXG5cbmV4cG9ydCBmdW5jdGlvbiBGcFNxcnRPZGQ8VD4oRnA6IElGaWVsZDxUPiwgZWxtOiBUKTogVCB7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3QgaGF2ZSBpc09kZFwiKTtcbiAgY29uc3Qgcm9vdCA9IEZwLnNxcnQoZWxtKTtcbiAgcmV0dXJuIEZwLmlzT2RkKHJvb3QpID8gcm9vdCA6IEZwLm5lZyhyb290KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZwU3FydEV2ZW48VD4oRnA6IElGaWVsZDxUPiwgZWxtOiBUKTogVCB7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcihcIkZpZWxkIGRvZXNuJ3QgaGF2ZSBpc09kZFwiKTtcbiAgY29uc3Qgcm9vdCA9IEZwLnNxcnQoZWxtKTtcbiAgcmV0dXJuIEZwLmlzT2RkKHJvb3QpID8gRnAubmVnKHJvb3QpIDogcm9vdDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRvdGFsIG51bWJlciBvZiBieXRlcyBjb25zdW1lZCBieSB0aGUgZmllbGQgZWxlbWVudC5cbiAqIEZvciBleGFtcGxlLCAzMiBieXRlcyBmb3IgdXN1YWwgMjU2LWJpdCB3ZWllcnN0cmFzcyBjdXJ2ZS5cbiAqIEBwYXJhbSBmaWVsZE9yZGVyIG51bWJlciBvZiBmaWVsZCBlbGVtZW50cywgdXN1YWxseSBDVVJWRS5uXG4gKiBAcmV0dXJucyBieXRlIGxlbmd0aCBvZiBmaWVsZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyOiBiaWdpbnQpOiBudW1iZXIge1xuICBpZiAodHlwZW9mIGZpZWxkT3JkZXIgIT09ICdiaWdpbnQnKSB0aHJvdyBuZXcgRXJyb3IoJ2ZpZWxkIG9yZGVyIG11c3QgYmUgYmlnaW50Jyk7XG4gIGNvbnN0IGJpdExlbmd0aCA9IGZpZWxkT3JkZXIudG9TdHJpbmcoMikubGVuZ3RoO1xuICByZXR1cm4gTWF0aC5jZWlsKGJpdExlbmd0aCAvIDgpO1xufVxuXG4vKipcbiAqIFJldHVybnMgbWluaW1hbCBhbW91bnQgb2YgYnl0ZXMgdGhhdCBjYW4gYmUgc2FmZWx5IHJlZHVjZWRcbiAqIGJ5IGZpZWxkIG9yZGVyLlxuICogU2hvdWxkIGJlIDJeLTEyOCBmb3IgMTI4LWJpdCBjdXJ2ZSBzdWNoIGFzIFAyNTYuXG4gKiBAcGFyYW0gZmllbGRPcmRlciBudW1iZXIgb2YgZmllbGQgZWxlbWVudHMsIHVzdWFsbHkgQ1VSVkUublxuICogQHJldHVybnMgYnl0ZSBsZW5ndGggb2YgdGFyZ2V0IGhhc2hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1pbkhhc2hMZW5ndGgoZmllbGRPcmRlcjogYmlnaW50KTogbnVtYmVyIHtcbiAgY29uc3QgbGVuZ3RoID0gZ2V0RmllbGRCeXRlc0xlbmd0aChmaWVsZE9yZGVyKTtcbiAgcmV0dXJuIGxlbmd0aCArIE1hdGguY2VpbChsZW5ndGggLyAyKTtcbn1cblxuLyoqXG4gKiBcIkNvbnN0YW50LXRpbWVcIiBwcml2YXRlIGtleSBnZW5lcmF0aW9uIHV0aWxpdHkuXG4gKiBDYW4gdGFrZSAobiArIG4vMikgb3IgbW9yZSBieXRlcyBvZiB1bmlmb3JtIGlucHV0IGUuZy4gZnJvbSBDU1BSTkcgb3IgS0RGXG4gKiBhbmQgY29udmVydCB0aGVtIGludG8gcHJpdmF0ZSBzY2FsYXIsIHdpdGggdGhlIG1vZHVsbyBiaWFzIGJlaW5nIG5lZ2xpZ2libGUuXG4gKiBOZWVkcyBhdCBsZWFzdCA0OCBieXRlcyBvZiBpbnB1dCBmb3IgMzItYnl0ZSBwcml2YXRlIGtleS5cbiAqIGh0dHBzOi8vcmVzZWFyY2gua3VkZWxza2lzZWN1cml0eS5jb20vMjAyMC8wNy8yOC90aGUtZGVmaW5pdGl2ZS1ndWlkZS10by1tb2R1bG8tYmlhcy1hbmQtaG93LXRvLWF2b2lkLWl0L1xuICogRklQUyAxODYtNSwgQS4yIGh0dHBzOi8vY3NyYy5uaXN0Lmdvdi9wdWJsaWNhdGlvbnMvZGV0YWlsL2ZpcHMvMTg2LzUvZmluYWxcbiAqIFJGQyA5MzgwLCBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTVcbiAqIEBwYXJhbSBoYXNoIGhhc2ggb3V0cHV0IGZyb20gU0hBMyBvciBhIHNpbWlsYXIgZnVuY3Rpb25cbiAqIEBwYXJhbSBncm91cE9yZGVyIHNpemUgb2Ygc3ViZ3JvdXAgLSAoZS5nLiBzZWNwMjU2azEuUG9pbnQuRm4uT1JERVIpXG4gKiBAcGFyYW0gaXNMRSBpbnRlcnByZXQgaGFzaCBieXRlcyBhcyBMRSBudW1cbiAqIEByZXR1cm5zIHZhbGlkIHByaXZhdGUgc2NhbGFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBIYXNoVG9GaWVsZChrZXk6IFVpbnQ4QXJyYXksIGZpZWxkT3JkZXI6IGJpZ2ludCwgaXNMRSA9IGZhbHNlKTogVWludDhBcnJheSB7XG4gIGFieXRlcyhrZXkpO1xuICBjb25zdCBsZW4gPSBrZXkubGVuZ3RoO1xuICBjb25zdCBmaWVsZExlbiA9IGdldEZpZWxkQnl0ZXNMZW5ndGgoZmllbGRPcmRlcik7XG4gIGNvbnN0IG1pbkxlbiA9IGdldE1pbkhhc2hMZW5ndGgoZmllbGRPcmRlcik7XG4gIC8vIE5vIHNtYWxsIG51bWJlcnM6IG5lZWQgdG8gdW5kZXJzdGFuZCBiaWFzIHN0b3J5LiBObyBodWdlIG51bWJlcnM6IGVhc2llciB0byBkZXRlY3QgSlMgdGltaW5ncy5cbiAgaWYgKGxlbiA8IDE2IHx8IGxlbiA8IG1pbkxlbiB8fCBsZW4gPiAxMDI0KVxuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgJyArIG1pbkxlbiArICctMTAyNCBieXRlcyBvZiBpbnB1dCwgZ290ICcgKyBsZW4pO1xuICBjb25zdCBudW0gPSBpc0xFID8gYnl0ZXNUb051bWJlckxFKGtleSkgOiBieXRlc1RvTnVtYmVyQkUoa2V5KTtcbiAgLy8gYG1vZCh4LCAxMSlgIGNhbiBzb21ldGltZXMgcHJvZHVjZSAwLiBgbW9kKHgsIDEwKSArIDFgIGlzIHRoZSBzYW1lLCBidXQgbm8gMFxuICBjb25zdCByZWR1Y2VkID0gbW9kKG51bSwgZmllbGRPcmRlciAtIF8xbikgKyBfMW47XG4gIHJldHVybiBpc0xFID8gbnVtYmVyVG9CeXRlc0xFKHJlZHVjZWQsIGZpZWxkTGVuKSA6IG51bWJlclRvQnl0ZXNCRShyZWR1Y2VkLCBmaWVsZExlbik7XG59XG4iLCAiLyoqXG4gKiBTaG9ydCBXZWllcnN0cmFzcyBjdXJ2ZSBtZXRob2RzLiBUaGUgZm9ybXVsYSBpczogeVx1MDBCMiA9IHhcdTAwQjMgKyBheCArIGIuXG4gKlxuICogIyMjIERlc2lnbiByYXRpb25hbGUgZm9yIHR5cGVzXG4gKlxuICogKiBJbnRlcmFjdGlvbiBiZXR3ZWVuIGNsYXNzZXMgZnJvbSBkaWZmZXJlbnQgY3VydmVzIHNob3VsZCBmYWlsOlxuICogICBgazI1Ni5Qb2ludC5CQVNFLmFkZChwMjU2LlBvaW50LkJBU0UpYFxuICogKiBGb3IgdGhpcyBwdXJwb3NlIHdlIHdhbnQgdG8gdXNlIGBpbnN0YW5jZW9mYCBvcGVyYXRvciwgd2hpY2ggaXMgZmFzdCBhbmQgd29ya3MgZHVyaW5nIHJ1bnRpbWVcbiAqICogRGlmZmVyZW50IGNhbGxzIG9mIGBjdXJ2ZSgpYCB3b3VsZCByZXR1cm4gZGlmZmVyZW50IGNsYXNzZXMgLVxuICogICBgY3VydmUocGFyYW1zKSAhPT0gY3VydmUocGFyYW1zKWA6IGlmIHNvbWVib2R5IGRlY2lkZWQgdG8gbW9ua2V5LXBhdGNoIHRoZWlyIGN1cnZlLFxuICogICBpdCB3b24ndCBhZmZlY3Qgb3RoZXJzXG4gKlxuICogVHlwZVNjcmlwdCBjYW4ndCBpbmZlciB0eXBlcyBmb3IgY2xhc3NlcyBjcmVhdGVkIGluc2lkZSBhIGZ1bmN0aW9uLiBDbGFzc2VzIGlzIG9uZSBpbnN0YW5jZVxuICogb2Ygbm9taW5hdGl2ZSB0eXBlcyBpbiBUeXBlU2NyaXB0IGFuZCBpbnRlcmZhY2VzIG9ubHkgY2hlY2sgZm9yIHNoYXBlLCBzbyBpdCdzIGhhcmQgdG8gY3JlYXRlXG4gKiB1bmlxdWUgdHlwZSBmb3IgZXZlcnkgZnVuY3Rpb24gY2FsbC5cbiAqXG4gKiBXZSBjYW4gdXNlIGdlbmVyaWMgdHlwZXMgdmlhIHNvbWUgcGFyYW0sIGxpa2UgY3VydmUgb3B0cywgYnV0IHRoYXQgd291bGQ6XG4gKiAgICAgMS4gRW5hYmxlIGludGVyYWN0aW9uIGJldHdlZW4gYGN1cnZlKHBhcmFtcylgIGFuZCBgY3VydmUocGFyYW1zKWAgKGN1cnZlcyBvZiBzYW1lIHBhcmFtcylcbiAqICAgICB3aGljaCBpcyBoYXJkIHRvIGRlYnVnLlxuICogICAgIDIuIFBhcmFtcyBjYW4gYmUgZ2VuZXJpYyBhbmQgd2UgY2FuJ3QgZW5mb3JjZSB0aGVtIHRvIGJlIGNvbnN0YW50IHZhbHVlOlxuICogICAgIGlmIHNvbWVib2R5IGNyZWF0ZXMgY3VydmUgZnJvbSBub24tY29uc3RhbnQgcGFyYW1zLFxuICogICAgIGl0IHdvdWxkIGJlIGFsbG93ZWQgdG8gaW50ZXJhY3Qgd2l0aCBvdGhlciBjdXJ2ZXMgd2l0aCBub24tY29uc3RhbnQgcGFyYW1zXG4gKlxuICogQHRvZG8gaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svcmVsZWFzZS1ub3Rlcy90eXBlc2NyaXB0LTItNy5odG1sI3VuaXF1ZS1zeW1ib2xcbiAqIEBtb2R1bGVcbiAqL1xuLyohIG5vYmxlLWN1cnZlcyAtIE1JVCBMaWNlbnNlIChjKSAyMDIyIFBhdWwgTWlsbGVyIChwYXVsbWlsbHIuY29tKSAqL1xuaW1wb3J0IHsgaG1hYyBhcyBub2JsZUhtYWMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2htYWMuanMnO1xuaW1wb3J0IHsgYWhhc2ggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7XG4gIGFib29sLFxuICBhYnl0ZXMsXG4gIGFJblJhbmdlLFxuICBiaXRMZW4sXG4gIGJpdE1hc2ssXG4gIGJ5dGVzVG9IZXgsXG4gIGJ5dGVzVG9OdW1iZXJCRSxcbiAgY29uY2F0Qnl0ZXMsXG4gIGNyZWF0ZUhtYWNEcmJnLFxuICBoZXhUb0J5dGVzLFxuICBpc0J5dGVzLFxuICBtZW1vaXplZCxcbiAgbnVtYmVyVG9IZXhVbnBhZGRlZCxcbiAgdmFsaWRhdGVPYmplY3QsXG4gIHJhbmRvbUJ5dGVzIGFzIHdjUmFuZG9tQnl0ZXMsXG4gIHR5cGUgQ0hhc2gsXG4gIHR5cGUgU2lnbmVyLFxufSBmcm9tICcuLi91dGlscy50cyc7XG5pbXBvcnQge1xuICBjcmVhdGVDdXJ2ZUZpZWxkcyxcbiAgY3JlYXRlS2V5Z2VuLFxuICBtdWxFbmRvVW5zYWZlLFxuICBuZWdhdGVDdCxcbiAgbm9ybWFsaXplWixcbiAgd05BRixcbiAgdHlwZSBBZmZpbmVQb2ludCxcbiAgdHlwZSBDdXJ2ZUxlbmd0aHMsXG4gIHR5cGUgQ3VydmVQb2ludCxcbiAgdHlwZSBDdXJ2ZVBvaW50Q29ucyxcbn0gZnJvbSAnLi9jdXJ2ZS50cyc7XG5pbXBvcnQge1xuICBGcEludmVydEJhdGNoLFxuICBnZXRNaW5IYXNoTGVuZ3RoLFxuICBtYXBIYXNoVG9GaWVsZCxcbiAgdmFsaWRhdGVGaWVsZCxcbiAgdHlwZSBJRmllbGQsXG59IGZyb20gJy4vbW9kdWxhci50cyc7XG5cbmV4cG9ydCB0eXBlIHsgQWZmaW5lUG9pbnQgfTtcblxudHlwZSBFbmRvQmFzaXMgPSBbW2JpZ2ludCwgYmlnaW50XSwgW2JpZ2ludCwgYmlnaW50XV07XG4vKipcbiAqIFdoZW4gV2VpZXJzdHJhc3MgY3VydmUgaGFzIGBhPTBgLCBpdCBiZWNvbWVzIEtvYmxpdHogY3VydmUuXG4gKiBLb2JsaXR6IGN1cnZlcyBhbGxvdyB1c2luZyAqKmVmZmljaWVudGx5LWNvbXB1dGFibGUgR0xWIGVuZG9tb3JwaGlzbSBcdTAzQzgqKi5cbiAqIEVuZG9tb3JwaGlzbSB1c2VzIDJ4IGxlc3MgUkFNLCBzcGVlZHMgdXAgcHJlY29tcHV0YXRpb24gYnkgMnggYW5kIEVDREggLyBrZXkgcmVjb3ZlcnkgYnkgMjAlLlxuICogRm9yIHByZWNvbXB1dGVkIHdOQUYgaXQgdHJhZGVzIG9mZiAxLzIgaW5pdCB0aW1lICYgMS8zIHJhbSBmb3IgMjAlIHBlcmYgaGl0LlxuICpcbiAqIEVuZG9tb3JwaGlzbSBjb25zaXN0cyBvZiBiZXRhLCBsYW1iZGEgYW5kIHNwbGl0U2NhbGFyOlxuICpcbiAqIDEuIEdMViBlbmRvbW9ycGhpc20gXHUwM0M4IHRyYW5zZm9ybXMgYSBwb2ludDogYFAgPSAoeCwgeSkgXHUyMUE2IFx1MDNDOChQKSA9IChcdTAzQjJcdTAwQjd4IG1vZCBwLCB5KWBcbiAqIDIuIEdMViBzY2FsYXIgZGVjb21wb3NpdGlvbiB0cmFuc2Zvcm1zIGEgc2NhbGFyOiBgayBcdTIyNjEga1x1MjA4MSArIGtcdTIwODJcdTAwQjdcdTAzQkIgKG1vZCBuKWBcbiAqIDMuIFRoZW4gdGhlc2UgYXJlIGNvbWJpbmVkOiBga1x1MDBCN1AgPSBrXHUyMDgxXHUwMEI3UCArIGtcdTIwODJcdTAwQjdcdTAzQzgoUClgXG4gKiA0LiBUd28gMTI4LWJpdCBwb2ludC1ieS1zY2FsYXIgbXVsdGlwbGljYXRpb25zICsgb25lIHBvaW50IGFkZGl0aW9uIGlzIGZhc3RlciB0aGFuXG4gKiAgICBvbmUgMjU2LWJpdCBtdWx0aXBsaWNhdGlvbi5cbiAqXG4gKiB3aGVyZVxuICogKiBiZXRhOiBcdTAzQjIgXHUyMjA4IEZcdTIwOUEgd2l0aCBcdTAzQjJcdTAwQjMgPSAxLCBcdTAzQjIgXHUyMjYwIDFcbiAqICogbGFtYmRhOiBcdTAzQkIgXHUyMjA4IEZcdTIwOTkgd2l0aCBcdTAzQkJcdTAwQjMgPSAxLCBcdTAzQkIgXHUyMjYwIDFcbiAqICogc3BsaXRTY2FsYXIgZGVjb21wb3NlcyBrIFx1MjFBNiBrXHUyMDgxLCBrXHUyMDgyLCBieSB1c2luZyByZWR1Y2VkIGJhc2lzIHZlY3RvcnMuXG4gKiAgIEdhdXNzIGxhdHRpY2UgcmVkdWN0aW9uIGNhbGN1bGF0ZXMgdGhlbSBmcm9tIGluaXRpYWwgYmFzaXMgdmVjdG9ycyBgKG4sIDApLCAoLVx1MDNCQiwgMClgXG4gKlxuICogQ2hlY2sgb3V0IGB0ZXN0L21pc2MvZW5kb21vcnBoaXNtLmpzYCBhbmRcbiAqIFtnaXN0XShodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsbWlsbHIvZWI2NzA4MDY3OTNlODRkZjYyOGE3YzQzNGE4NzMwNjYpLlxuICovXG5leHBvcnQgdHlwZSBFbmRvbW9ycGhpc21PcHRzID0ge1xuICBiZXRhOiBiaWdpbnQ7XG4gIGJhc2lzZXM/OiBFbmRvQmFzaXM7XG4gIHNwbGl0U2NhbGFyPzogKGs6IGJpZ2ludCkgPT4geyBrMW5lZzogYm9vbGVhbjsgazE6IGJpZ2ludDsgazJuZWc6IGJvb2xlYW47IGsyOiBiaWdpbnQgfTtcbn07XG4vLyBXZSBjb25zdHJ1Y3QgYmFzaXMgaW4gc3VjaCB3YXkgdGhhdCBkZW4gaXMgYWx3YXlzIHBvc2l0aXZlIGFuZCBlcXVhbHMgbiwgYnV0IG51bSBzaWduIGRlcGVuZHMgb24gYmFzaXMgKG5vdCBvbiBzZWNyZXQgdmFsdWUpXG5jb25zdCBkaXZOZWFyZXN0ID0gKG51bTogYmlnaW50LCBkZW46IGJpZ2ludCkgPT4gKG51bSArIChudW0gPj0gMCA/IGRlbiA6IC1kZW4pIC8gXzJuKSAvIGRlbjtcblxuZXhwb3J0IHR5cGUgU2NhbGFyRW5kb1BhcnRzID0geyBrMW5lZzogYm9vbGVhbjsgazE6IGJpZ2ludDsgazJuZWc6IGJvb2xlYW47IGsyOiBiaWdpbnQgfTtcblxuLyoqXG4gKiBTcGxpdHMgc2NhbGFyIGZvciBHTFYgZW5kb21vcnBoaXNtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gX3NwbGl0RW5kb1NjYWxhcihrOiBiaWdpbnQsIGJhc2lzOiBFbmRvQmFzaXMsIG46IGJpZ2ludCk6IFNjYWxhckVuZG9QYXJ0cyB7XG4gIC8vIFNwbGl0IHNjYWxhciBpbnRvIHR3byBzdWNoIHRoYXQgcGFydCBpcyB+aGFsZiBiaXRzOiBgYWJzKHBhcnQpIDwgc3FydChOKWBcbiAgLy8gU2luY2UgcGFydCBjYW4gYmUgbmVnYXRpdmUsIHdlIG5lZWQgdG8gZG8gdGhpcyBvbiBwb2ludC5cbiAgLy8gVE9ETzogdmVyaWZ5U2NhbGFyIGZ1bmN0aW9uIHdoaWNoIGNvbnN1bWVzIGxhbWJkYVxuICBjb25zdCBbW2ExLCBiMV0sIFthMiwgYjJdXSA9IGJhc2lzO1xuICBjb25zdCBjMSA9IGRpdk5lYXJlc3QoYjIgKiBrLCBuKTtcbiAgY29uc3QgYzIgPSBkaXZOZWFyZXN0KC1iMSAqIGssIG4pO1xuICAvLyB8azF8L3xrMnwgaXMgPCBzcXJ0KE4pLCBidXQgY2FuIGJlIG5lZ2F0aXZlLlxuICAvLyBJZiB3ZSBkbyBgazEgbW9kIE5gLCB3ZSdsbCBnZXQgYmlnIHNjYWxhciAoYD4gc3FydChOKWApOiBzbywgd2UgZG8gY2hlYXBlciBuZWdhdGlvbiBpbnN0ZWFkLlxuICBsZXQgazEgPSBrIC0gYzEgKiBhMSAtIGMyICogYTI7XG4gIGxldCBrMiA9IC1jMSAqIGIxIC0gYzIgKiBiMjtcbiAgY29uc3QgazFuZWcgPSBrMSA8IF8wbjtcbiAgY29uc3QgazJuZWcgPSBrMiA8IF8wbjtcbiAgaWYgKGsxbmVnKSBrMSA9IC1rMTtcbiAgaWYgKGsybmVnKSBrMiA9IC1rMjtcbiAgLy8gRG91YmxlIGNoZWNrIHRoYXQgcmVzdWx0aW5nIHNjYWxhciBsZXNzIHRoYW4gaGFsZiBiaXRzIG9mIE46IG90aGVyd2lzZSB3TkFGIHdpbGwgZmFpbC5cbiAgLy8gVGhpcyBzaG91bGQgb25seSBoYXBwZW4gb24gd3JvbmcgYmFzaXNlcy4gQWxzbywgbWF0aCBpbnNpZGUgaXMgdG9vIGNvbXBsZXggYW5kIEkgZG9uJ3QgdHJ1c3QgaXQuXG4gIGNvbnN0IE1BWF9OVU0gPSBiaXRNYXNrKE1hdGguY2VpbChiaXRMZW4obikgLyAyKSkgKyBfMW47IC8vIEhhbGYgYml0cyBvZiBOXG4gIGlmIChrMSA8IF8wbiB8fCBrMSA+PSBNQVhfTlVNIHx8IGsyIDwgXzBuIHx8IGsyID49IE1BWF9OVU0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NwbGl0U2NhbGFyIChlbmRvbW9ycGhpc20pOiBmYWlsZWQsIGs9JyArIGspO1xuICB9XG4gIHJldHVybiB7IGsxbmVnLCBrMSwgazJuZWcsIGsyIH07XG59XG5cbi8qKlxuICogT3B0aW9uIHRvIGVuYWJsZSBoZWRnZWQgc2lnbmF0dXJlcyB3aXRoIGltcHJvdmVkIHNlY3VyaXR5LlxuICpcbiAqICogUmFuZG9tbHkgZ2VuZXJhdGVkIGsgaXMgYmFkLCBiZWNhdXNlIGJyb2tlbiBDU1BSTkcgd291bGQgbGVhayBwcml2YXRlIGtleXMuXG4gKiAqIERldGVybWluaXN0aWMgayAoUkZDNjk3OSkgaXMgYmV0dGVyOyBidXQgaXMgc3VzcGVjdGlibGUgdG8gZmF1bHQgYXR0YWNrcy5cbiAqXG4gKiBXZSBhbGxvdyB1c2luZyB0ZWNobmlxdWUgZGVzY3JpYmVkIGluIFJGQzY5NzkgMy42OiBhZGRpdGlvbmFsIGsnLCBhLmsuYS4gYWRkaW5nIHJhbmRvbW5lc3NcbiAqIHRvIGRldGVybWluaXN0aWMgc2lnLiBJZiBDU1BSTkcgaXMgYnJva2VuICYgcmFuZG9tbmVzcyBpcyB3ZWFrLCBpdCB3b3VsZCBTVElMTCBiZSBhcyBzZWN1cmVcbiAqIGFzIG9yZGluYXJ5IHNpZyB3aXRob3V0IEV4dHJhRW50cm9weS5cbiAqXG4gKiAqIGB0cnVlYCBtZWFucyBcImZldGNoIGRhdGEsIGZyb20gQ1NQUk5HLCBpbmNvcnBvcmF0ZSBpdCBpbnRvIGsgZ2VuZXJhdGlvblwiXG4gKiAqIGBmYWxzZWAgbWVhbnMgXCJkaXNhYmxlIGV4dHJhIGVudHJvcHksIHVzZSBwdXJlbHkgZGV0ZXJtaW5pc3RpYyBrXCJcbiAqICogYFVpbnQ4QXJyYXlgIHBhc3NlZCBtZWFucyBcImluY29ycG9yYXRlIGZvbGxvd2luZyBkYXRhIGludG8gayBnZW5lcmF0aW9uXCJcbiAqXG4gKiBodHRwczovL3BhdWxtaWxsci5jb20vcG9zdHMvZGV0ZXJtaW5pc3RpYy1zaWduYXR1cmVzL1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQUV4dHJhRW50cm9weSA9IGJvb2xlYW4gfCBVaW50OEFycmF5O1xuLyoqXG4gKiAtIGBjb21wYWN0YCBpcyB0aGUgZGVmYXVsdCBmb3JtYXRcbiAqIC0gYHJlY292ZXJlZGAgaXMgdGhlIHNhbWUgYXMgY29tcGFjdCwgYnV0IHdpdGggYW4gZXh0cmEgYnl0ZSBpbmRpY2F0aW5nIHJlY292ZXJ5IGJ5dGVcbiAqIC0gYGRlcmAgaXMgQVNOLjEgREVSIGVuY29kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gJ2NvbXBhY3QnIHwgJ3JlY292ZXJlZCcgfCAnZGVyJztcbi8qKlxuICogLSBgcHJlaGFzaGA6IChkZWZhdWx0OiB0cnVlKSBpbmRpY2F0ZXMgd2hldGhlciB0byBkbyBzaGEyNTYobWVzc2FnZSkuXG4gKiAgIFdoZW4gYSBjdXN0b20gaGFzaCBpcyB1c2VkLCBpdCBtdXN0IGJlIHNldCB0byBgZmFsc2VgLlxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVJlY292ZXJPcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbn07XG4vKipcbiAqIC0gYHByZWhhc2hgOiAoZGVmYXVsdDogdHJ1ZSkgaW5kaWNhdGVzIHdoZXRoZXIgdG8gZG8gc2hhMjU2KG1lc3NhZ2UpLlxuICogICBXaGVuIGEgY3VzdG9tIGhhc2ggaXMgdXNlZCwgaXQgbXVzdCBiZSBzZXQgdG8gYGZhbHNlYC5cbiAqIC0gYGxvd1NgOiAoZGVmYXVsdDogdHJ1ZSkgcHJvaGliaXRzIHNpZ25hdHVyZXMgd2hpY2ggaGF2ZSAoc2lnLnMgPj0gQ1VSVkUubi8ybikuXG4gKiAgIENvbXBhdGlibGUgd2l0aCBCVEMvRVRILiBTZXR0aW5nIGBsb3dTOiBmYWxzZWAgYWxsb3dzIHRvIGNyZWF0ZSBtYWxsZWFibGUgc2lnbmF0dXJlcyxcbiAqICAgd2hpY2ggaXMgZGVmYXVsdCBvcGVuc3NsIGJlaGF2aW9yLlxuICogICBOb24tbWFsbGVhYmxlIHNpZ25hdHVyZXMgY2FuIHN0aWxsIGJlIHN1Y2Nlc3NmdWxseSB2ZXJpZmllZCBpbiBvcGVuc3NsLlxuICogLSBgZm9ybWF0YDogKGRlZmF1bHQ6ICdjb21wYWN0JykgJ2NvbXBhY3QnIG9yICdyZWNvdmVyZWQnIHdpdGggcmVjb3ZlcnkgYnl0ZVxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVZlcmlmeU9wdHMgPSB7XG4gIHByZWhhc2g/OiBib29sZWFuO1xuICBsb3dTPzogYm9vbGVhbjtcbiAgZm9ybWF0PzogRUNEU0FTaWduYXR1cmVGb3JtYXQ7XG59O1xuLyoqXG4gKiAtIGBwcmVoYXNoYDogKGRlZmF1bHQ6IHRydWUpIGluZGljYXRlcyB3aGV0aGVyIHRvIGRvIHNoYTI1NihtZXNzYWdlKS5cbiAqICAgV2hlbiBhIGN1c3RvbSBoYXNoIGlzIHVzZWQsIGl0IG11c3QgYmUgc2V0IHRvIGBmYWxzZWAuXG4gKiAtIGBsb3dTYDogKGRlZmF1bHQ6IHRydWUpIHByb2hpYml0cyBzaWduYXR1cmVzIHdoaWNoIGhhdmUgKHNpZy5zID49IENVUlZFLm4vMm4pLlxuICogICBDb21wYXRpYmxlIHdpdGggQlRDL0VUSC4gU2V0dGluZyBgbG93UzogZmFsc2VgIGFsbG93cyB0byBjcmVhdGUgbWFsbGVhYmxlIHNpZ25hdHVyZXMsXG4gKiAgIHdoaWNoIGlzIGRlZmF1bHQgb3BlbnNzbCBiZWhhdmlvci5cbiAqICAgTm9uLW1hbGxlYWJsZSBzaWduYXR1cmVzIGNhbiBzdGlsbCBiZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgaW4gb3BlbnNzbC5cbiAqIC0gYGZvcm1hdGA6IChkZWZhdWx0OiAnY29tcGFjdCcpICdjb21wYWN0JyBvciAncmVjb3ZlcmVkJyB3aXRoIHJlY292ZXJ5IGJ5dGVcbiAqIC0gYGV4dHJhRW50cm9weWA6IChkZWZhdWx0OiBmYWxzZSkgY3JlYXRlcyBzaWdzIHdpdGggaW5jcmVhc2VkIHNlY3VyaXR5LCBzZWUge0BsaW5rIEVDRFNBRXh0cmFFbnRyb3B5fVxuICovXG5leHBvcnQgdHlwZSBFQ0RTQVNpZ25PcHRzID0ge1xuICBwcmVoYXNoPzogYm9vbGVhbjtcbiAgbG93Uz86IGJvb2xlYW47XG4gIGZvcm1hdD86IEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xuICBleHRyYUVudHJvcHk/OiBFQ0RTQUV4dHJhRW50cm9weTtcbn07XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdDogc3RyaW5nKTogRUNEU0FTaWduYXR1cmVGb3JtYXQge1xuICBpZiAoIVsnY29tcGFjdCcsICdyZWNvdmVyZWQnLCAnZGVyJ10uaW5jbHVkZXMoZm9ybWF0KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NpZ25hdHVyZSBmb3JtYXQgbXVzdCBiZSBcImNvbXBhY3RcIiwgXCJyZWNvdmVyZWRcIiwgb3IgXCJkZXJcIicpO1xuICByZXR1cm4gZm9ybWF0IGFzIEVDRFNBU2lnbmF0dXJlRm9ybWF0O1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVNpZ09wdHM8VCBleHRlbmRzIEVDRFNBU2lnbk9wdHMsIEQgZXh0ZW5kcyBSZXF1aXJlZDxFQ0RTQVNpZ25PcHRzPj4oXG4gIG9wdHM6IFQsXG4gIGRlZjogRFxuKTogUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz4ge1xuICBjb25zdCBvcHRzbjogRUNEU0FTaWduT3B0cyA9IHt9O1xuICBmb3IgKGxldCBvcHROYW1lIG9mIE9iamVjdC5rZXlzKGRlZikpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgb3B0c25bb3B0TmFtZV0gPSBvcHRzW29wdE5hbWVdID09PSB1bmRlZmluZWQgPyBkZWZbb3B0TmFtZV0gOiBvcHRzW29wdE5hbWVdO1xuICB9XG4gIGFib29sKG9wdHNuLmxvd1MhLCAnbG93UycpO1xuICBhYm9vbChvcHRzbi5wcmVoYXNoISwgJ3ByZWhhc2gnKTtcbiAgaWYgKG9wdHNuLmZvcm1hdCAhPT0gdW5kZWZpbmVkKSB2YWxpZGF0ZVNpZ0Zvcm1hdChvcHRzbi5mb3JtYXQpO1xuICByZXR1cm4gb3B0c24gYXMgUmVxdWlyZWQ8RUNEU0FTaWduT3B0cz47XG59XG5cbi8qKiBJbnN0YW5jZSBtZXRob2RzIGZvciAzRCBYWVogcHJvamVjdGl2ZSBwb2ludHMuICovXG5leHBvcnQgaW50ZXJmYWNlIFdlaWVyc3RyYXNzUG9pbnQ8VD4gZXh0ZW5kcyBDdXJ2ZVBvaW50PFQsIFdlaWVyc3RyYXNzUG9pbnQ8VD4+IHtcbiAgLyoqIHByb2plY3RpdmUgWCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBhZmZpbmUgeC4gKi9cbiAgcmVhZG9ubHkgWDogVDtcbiAgLyoqIHByb2plY3RpdmUgWSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBhZmZpbmUgeS4gKi9cbiAgcmVhZG9ubHkgWTogVDtcbiAgLyoqIHByb2plY3RpdmUgeiBjb29yZGluYXRlICovXG4gIHJlYWRvbmx5IFo6IFQ7XG4gIC8qKiBhZmZpbmUgeCBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIFguICovXG4gIGdldCB4KCk6IFQ7XG4gIC8qKiBhZmZpbmUgeSBjb29yZGluYXRlLiBEaWZmZXJlbnQgZnJvbSBwcm9qZWN0aXZlIFkuICovXG4gIGdldCB5KCk6IFQ7XG4gIC8qKiBFbmNvZGVzIHBvaW50IHVzaW5nIElFRUUgUDEzNjMgKERFUikgZW5jb2RpbmcuIEZpcnN0IGJ5dGUgaXMgMi8zLzQuIERlZmF1bHQgPSBpc0NvbXByZXNzZWQuICovXG4gIHRvQnl0ZXMoaXNDb21wcmVzc2VkPzogYm9vbGVhbik6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KGlzQ29tcHJlc3NlZD86IGJvb2xlYW4pOiBzdHJpbmc7XG59XG5cbi8qKiBTdGF0aWMgbWV0aG9kcyBmb3IgM0QgWFlaIHByb2plY3RpdmUgcG9pbnRzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBXZWllcnN0cmFzc1BvaW50Q29uczxUPiBleHRlbmRzIEN1cnZlUG9pbnRDb25zPFdlaWVyc3RyYXNzUG9pbnQ8VD4+IHtcbiAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gIG5ldyAoWDogVCwgWTogVCwgWjogVCk6IFdlaWVyc3RyYXNzUG9pbnQ8VD47XG4gIENVUlZFKCk6IFdlaWVyc3RyYXNzT3B0czxUPjtcbn1cblxuLyoqXG4gKiBXZWllcnN0cmFzcyBjdXJ2ZSBvcHRpb25zLlxuICpcbiAqICogcDogcHJpbWUgY2hhcmFjdGVyaXN0aWMgKG9yZGVyKSBvZiBmaW5pdGUgZmllbGQsIGluIHdoaWNoIGFyaXRobWV0aWNzIGlzIGRvbmVcbiAqICogbjogb3JkZXIgb2YgcHJpbWUgc3ViZ3JvdXAgYS5rLmEgdG90YWwgYW1vdW50IG9mIHZhbGlkIGN1cnZlIHBvaW50c1xuICogKiBoOiBjb2ZhY3RvciwgdXN1YWxseSAxLiBoKm4gaXMgZ3JvdXAgb3JkZXI7IG4gaXMgc3ViZ3JvdXAgb3JkZXJcbiAqICogYTogZm9ybXVsYSBwYXJhbSwgbXVzdCBiZSBpbiBmaWVsZCBvZiBwXG4gKiAqIGI6IGZvcm11bGEgcGFyYW0sIG11c3QgYmUgaW4gZmllbGQgb2YgcFxuICogKiBHeDogeCBjb29yZGluYXRlIG9mIGdlbmVyYXRvciBwb2ludCBhLmsuYS4gYmFzZSBwb2ludFxuICogKiBHeTogeSBjb29yZGluYXRlIG9mIGdlbmVyYXRvciBwb2ludFxuICovXG5leHBvcnQgdHlwZSBXZWllcnN0cmFzc09wdHM8VD4gPSBSZWFkb25seTx7XG4gIHA6IGJpZ2ludDtcbiAgbjogYmlnaW50O1xuICBoOiBiaWdpbnQ7XG4gIGE6IFQ7XG4gIGI6IFQ7XG4gIEd4OiBUO1xuICBHeTogVDtcbn0+O1xuXG4vLyBXaGVuIGEgY29mYWN0b3IgIT0gMSwgdGhlcmUgY2FuIGJlIGFuIGVmZmVjdGl2ZSBtZXRob2RzIHRvOlxuLy8gMS4gRGV0ZXJtaW5lIHdoZXRoZXIgYSBwb2ludCBpcyB0b3JzaW9uLWZyZWVcbi8vIDIuIENsZWFyIHRvcnNpb24gY29tcG9uZW50XG5leHBvcnQgdHlwZSBXZWllcnN0cmFzc0V4dHJhT3B0czxUPiA9IFBhcnRpYWw8e1xuICBGcDogSUZpZWxkPFQ+O1xuICBGbjogSUZpZWxkPGJpZ2ludD47XG4gIGFsbG93SW5maW5pdHlQb2ludDogYm9vbGVhbjtcbiAgZW5kbzogRW5kb21vcnBoaXNtT3B0cztcbiAgaXNUb3JzaW9uRnJlZTogKGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LCBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPikgPT4gYm9vbGVhbjtcbiAgY2xlYXJDb2ZhY3RvcjogKGM6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LCBwb2ludDogV2VpZXJzdHJhc3NQb2ludDxUPikgPT4gV2VpZXJzdHJhc3NQb2ludDxUPjtcbiAgZnJvbUJ5dGVzOiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IEFmZmluZVBvaW50PFQ+O1xuICB0b0J5dGVzOiAoXG4gICAgYzogV2VpZXJzdHJhc3NQb2ludENvbnM8VD4sXG4gICAgcG9pbnQ6IFdlaWVyc3RyYXNzUG9pbnQ8VD4sXG4gICAgaXNDb21wcmVzc2VkOiBib29sZWFuXG4gICkgPT4gVWludDhBcnJheTtcbn0+O1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIEVDRFNBIHNpZ25hdHVyZXMgb3ZlciBhIFdlaWVyc3RyYXNzIGN1cnZlLlxuICpcbiAqICogbG93UzogKGRlZmF1bHQ6IHRydWUpIHdoZXRoZXIgcHJvZHVjZWQgLyB2ZXJpZmllZCBzaWduYXR1cmVzIG9jY3VweSBsb3cgaGFsZiBvZiBlY2RzYU9wdHMucC4gUHJldmVudHMgbWFsbGVhYmlsaXR5LlxuICogKiBobWFjOiAoZGVmYXVsdDogbm9ibGUtaGFzaGVzIGhtYWMpIGZ1bmN0aW9uLCB3b3VsZCBiZSB1c2VkIHRvIGluaXQgaG1hYy1kcmJnIGZvciBrIGdlbmVyYXRpb24uXG4gKiAqIHJhbmRvbUJ5dGVzOiAoZGVmYXVsdDogd2ViY3J5cHRvIG9zLWxldmVsIENTUFJORykgY3VzdG9tIG1ldGhvZCBmb3IgZmV0Y2hpbmcgc2VjdXJlIHJhbmRvbW5lc3MuXG4gKiAqIGJpdHMyaW50LCBiaXRzMmludF9tb2ROOiB1c2VkIGluIHNpZ3MsIHNvbWV0aW1lcyBvdmVycmlkZGVuIGJ5IGN1cnZlc1xuICovXG5leHBvcnQgdHlwZSBFQ0RTQU9wdHMgPSBQYXJ0aWFsPHtcbiAgbG93UzogYm9vbGVhbjtcbiAgaG1hYzogKGtleTogVWludDhBcnJheSwgbWVzc2FnZTogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgcmFuZG9tQnl0ZXM6IChieXRlc0xlbmd0aD86IG51bWJlcikgPT4gVWludDhBcnJheTtcbiAgYml0czJpbnQ6IChieXRlczogVWludDhBcnJheSkgPT4gYmlnaW50O1xuICBiaXRzMmludF9tb2ROOiAoYnl0ZXM6IFVpbnQ4QXJyYXkpID0+IGJpZ2ludDtcbn0+O1xuXG4vKipcbiAqIEVsbGlwdGljIEN1cnZlIERpZmZpZS1IZWxsbWFuIGludGVyZmFjZS5cbiAqIFByb3ZpZGVzIGtleWdlbiwgc2VjcmV0LXRvLXB1YmxpYyBjb252ZXJzaW9uLCBjYWxjdWxhdGluZyBzaGFyZWQgc2VjcmV0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFQ0RIIHtcbiAga2V5Z2VuOiAoc2VlZD86IFVpbnQ4QXJyYXkpID0+IHsgc2VjcmV0S2V5OiBVaW50OEFycmF5OyBwdWJsaWNLZXk6IFVpbnQ4QXJyYXkgfTtcbiAgZ2V0UHVibGljS2V5OiAoc2VjcmV0S2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKSA9PiBVaW50OEFycmF5O1xuICBnZXRTaGFyZWRTZWNyZXQ6IChcbiAgICBzZWNyZXRLZXlBOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleUI6IFVpbnQ4QXJyYXksXG4gICAgaXNDb21wcmVzc2VkPzogYm9vbGVhblxuICApID0+IFVpbnQ4QXJyYXk7XG4gIFBvaW50OiBXZWllcnN0cmFzc1BvaW50Q29uczxiaWdpbnQ+O1xuICB1dGlsczoge1xuICAgIGlzVmFsaWRTZWNyZXRLZXk6IChzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpID0+IGJvb2xlYW47XG4gICAgaXNWYWxpZFB1YmxpY0tleTogKHB1YmxpY0tleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkPzogYm9vbGVhbikgPT4gYm9vbGVhbjtcbiAgICByYW5kb21TZWNyZXRLZXk6IChzZWVkPzogVWludDhBcnJheSkgPT4gVWludDhBcnJheTtcbiAgfTtcbiAgbGVuZ3RoczogQ3VydmVMZW5ndGhzO1xufVxuXG4vKipcbiAqIEVDRFNBIGludGVyZmFjZS5cbiAqIE9ubHkgc3VwcG9ydGVkIGZvciBwcmltZSBmaWVsZHMsIG5vdCBGcDIgKGV4dGVuc2lvbiBmaWVsZHMpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVDRFNBIGV4dGVuZHMgRUNESCB7XG4gIHNpZ246IChtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM/OiBFQ0RTQVNpZ25PcHRzKSA9PiBVaW50OEFycmF5O1xuICB2ZXJpZnk6IChcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXk6IFVpbnQ4QXJyYXksXG4gICAgb3B0cz86IEVDRFNBVmVyaWZ5T3B0c1xuICApID0+IGJvb2xlYW47XG4gIHJlY292ZXJQdWJsaWNLZXkoc2lnbmF0dXJlOiBVaW50OEFycmF5LCBtZXNzYWdlOiBVaW50OEFycmF5LCBvcHRzPzogRUNEU0FSZWNvdmVyT3B0cyk6IFVpbnQ4QXJyYXk7XG4gIFNpZ25hdHVyZTogRUNEU0FTaWduYXR1cmVDb25zO1xufVxuZXhwb3J0IGNsYXNzIERFUkVyciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobSA9ICcnKSB7XG4gICAgc3VwZXIobSk7XG4gIH1cbn1cbmV4cG9ydCB0eXBlIElERVIgPSB7XG4gIC8vIGFzbi4xIERFUiBlbmNvZGluZyB1dGlsc1xuICBFcnI6IHR5cGVvZiBERVJFcnI7XG4gIC8vIEJhc2ljIGJ1aWxkaW5nIGJsb2NrIGlzIFRMViAoVGFnLUxlbmd0aC1WYWx1ZSlcbiAgX3Rsdjoge1xuICAgIGVuY29kZTogKHRhZzogbnVtYmVyLCBkYXRhOiBzdHJpbmcpID0+IHN0cmluZztcbiAgICAvLyB2IC0gdmFsdWUsIGwgLSBsZWZ0IGJ5dGVzICh1bnBhcnNlZClcbiAgICBkZWNvZGUodGFnOiBudW1iZXIsIGRhdGE6IFVpbnQ4QXJyYXkpOiB7IHY6IFVpbnQ4QXJyYXk7IGw6IFVpbnQ4QXJyYXkgfTtcbiAgfTtcbiAgLy8gaHR0cHM6Ly9jcnlwdG8uc3RhY2tleGNoYW5nZS5jb20vYS81NzczNCBMZWZ0bW9zdCBiaXQgb2YgZmlyc3QgYnl0ZSBpcyAnbmVnYXRpdmUnIGZsYWcsXG4gIC8vIHNpbmNlIHdlIGFsd2F5cyB1c2UgcG9zaXRpdmUgaW50ZWdlcnMgaGVyZS4gSXQgbXVzdCBhbHdheXMgYmUgZW1wdHk6XG4gIC8vIC0gYWRkIHplcm8gYnl0ZSBpZiBleGlzdHNcbiAgLy8gLSBpZiBuZXh0IGJ5dGUgZG9lc24ndCBoYXZlIGEgZmxhZywgbGVhZGluZyB6ZXJvIGlzIG5vdCBhbGxvd2VkIChtaW5pbWFsIGVuY29kaW5nKVxuICBfaW50OiB7XG4gICAgZW5jb2RlKG51bTogYmlnaW50KTogc3RyaW5nO1xuICAgIGRlY29kZShkYXRhOiBVaW50OEFycmF5KTogYmlnaW50O1xuICB9O1xuICB0b1NpZyhoZXg6IHN0cmluZyB8IFVpbnQ4QXJyYXkpOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH07XG4gIGhleEZyb21TaWcoc2lnOiB7IHI6IGJpZ2ludDsgczogYmlnaW50IH0pOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBBU04uMSBERVIgZW5jb2RpbmcgdXRpbGl0aWVzLiBBU04gaXMgdmVyeSBjb21wbGV4ICYgZnJhZ2lsZS4gRm9ybWF0OlxuICpcbiAqICAgICBbMHgzMCAoU0VRVUVOQ0UpLCBieXRlbGVuZ3RoLCAweDAyIChJTlRFR0VSKSwgaW50TGVuZ3RoLCBSLCAweDAyIChJTlRFR0VSKSwgaW50TGVuZ3RoLCBTXVxuICpcbiAqIERvY3M6IGh0dHBzOi8vbGV0c2VuY3J5cHQub3JnL2RvY3MvYS13YXJtLXdlbGNvbWUtdG8tYXNuMS1hbmQtZGVyLywgaHR0cHM6Ly9sdWNhLm50b3Aub3JnL1RlYWNoaW5nL0FwcHVudGkvYXNuMS5odG1sXG4gKi9cbmV4cG9ydCBjb25zdCBERVI6IElERVIgPSB7XG4gIC8vIGFzbi4xIERFUiBlbmNvZGluZyB1dGlsc1xuICBFcnI6IERFUkVycixcbiAgLy8gQmFzaWMgYnVpbGRpbmcgYmxvY2sgaXMgVExWIChUYWctTGVuZ3RoLVZhbHVlKVxuICBfdGx2OiB7XG4gICAgZW5jb2RlOiAodGFnOiBudW1iZXIsIGRhdGE6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKHRhZyA8IDAgfHwgdGFnID4gMjU2KSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogd3JvbmcgdGFnJyk7XG4gICAgICBpZiAoZGF0YS5sZW5ndGggJiAxKSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogdW5wYWRkZWQgZGF0YScpO1xuICAgICAgY29uc3QgZGF0YUxlbiA9IGRhdGEubGVuZ3RoIC8gMjtcbiAgICAgIGNvbnN0IGxlbiA9IG51bWJlclRvSGV4VW5wYWRkZWQoZGF0YUxlbik7XG4gICAgICBpZiAoKGxlbi5sZW5ndGggLyAyKSAmIDBiMTAwMF8wMDAwKSB0aHJvdyBuZXcgRSgndGx2LmVuY29kZTogbG9uZyBmb3JtIGxlbmd0aCB0b28gYmlnJyk7XG4gICAgICAvLyBsZW5ndGggb2YgbGVuZ3RoIHdpdGggbG9uZyBmb3JtIGZsYWdcbiAgICAgIGNvbnN0IGxlbkxlbiA9IGRhdGFMZW4gPiAxMjcgPyBudW1iZXJUb0hleFVucGFkZGVkKChsZW4ubGVuZ3RoIC8gMikgfCAwYjEwMDBfMDAwMCkgOiAnJztcbiAgICAgIGNvbnN0IHQgPSBudW1iZXJUb0hleFVucGFkZGVkKHRhZyk7XG4gICAgICByZXR1cm4gdCArIGxlbkxlbiArIGxlbiArIGRhdGE7XG4gICAgfSxcbiAgICAvLyB2IC0gdmFsdWUsIGwgLSBsZWZ0IGJ5dGVzICh1bnBhcnNlZClcbiAgICBkZWNvZGUodGFnOiBudW1iZXIsIGRhdGE6IFVpbnQ4QXJyYXkpOiB7IHY6IFVpbnQ4QXJyYXk7IGw6IFVpbnQ4QXJyYXkgfSB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgbGV0IHBvcyA9IDA7XG4gICAgICBpZiAodGFnIDwgMCB8fCB0YWcgPiAyNTYpIHRocm93IG5ldyBFKCd0bHYuZW5jb2RlOiB3cm9uZyB0YWcnKTtcbiAgICAgIGlmIChkYXRhLmxlbmd0aCA8IDIgfHwgZGF0YVtwb3MrK10gIT09IHRhZykgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IHdyb25nIHRsdicpO1xuICAgICAgY29uc3QgZmlyc3QgPSBkYXRhW3BvcysrXTtcbiAgICAgIGNvbnN0IGlzTG9uZyA9ICEhKGZpcnN0ICYgMGIxMDAwXzAwMDApOyAvLyBGaXJzdCBiaXQgb2YgZmlyc3QgbGVuZ3RoIGJ5dGUgaXMgZmxhZyBmb3Igc2hvcnQvbG9uZyBmb3JtXG4gICAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICAgIGlmICghaXNMb25nKSBsZW5ndGggPSBmaXJzdDtcbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBMb25nIGZvcm06IFtsb25nRmxhZygxYml0KSwgbGVuZ3RoTGVuZ3RoKDdiaXQpLCBsZW5ndGggKEJFKV1cbiAgICAgICAgY29uc3QgbGVuTGVuID0gZmlyc3QgJiAwYjAxMTFfMTExMTtcbiAgICAgICAgaWYgKCFsZW5MZW4pIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBpbmRlZmluaXRlIGxlbmd0aCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgIGlmIChsZW5MZW4gPiA0KSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogYnl0ZSBsZW5ndGggaXMgdG9vIGJpZycpOyAvLyB0aGlzIHdpbGwgb3ZlcmZsb3cgdTMyIGluIGpzXG4gICAgICAgIGNvbnN0IGxlbmd0aEJ5dGVzID0gZGF0YS5zdWJhcnJheShwb3MsIHBvcyArIGxlbkxlbik7XG4gICAgICAgIGlmIChsZW5ndGhCeXRlcy5sZW5ndGggIT09IGxlbkxlbikgdGhyb3cgbmV3IEUoJ3Rsdi5kZWNvZGU6IGxlbmd0aCBieXRlcyBub3QgY29tcGxldGUnKTtcbiAgICAgICAgaWYgKGxlbmd0aEJ5dGVzWzBdID09PSAwKSB0aHJvdyBuZXcgRSgndGx2LmRlY29kZShsb25nKTogemVybyBsZWZ0bW9zdCBieXRlJyk7XG4gICAgICAgIGZvciAoY29uc3QgYiBvZiBsZW5ndGhCeXRlcykgbGVuZ3RoID0gKGxlbmd0aCA8PCA4KSB8IGI7XG4gICAgICAgIHBvcyArPSBsZW5MZW47XG4gICAgICAgIGlmIChsZW5ndGggPCAxMjgpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlKGxvbmcpOiBub3QgbWluaW1hbCBlbmNvZGluZycpO1xuICAgICAgfVxuICAgICAgY29uc3QgdiA9IGRhdGEuc3ViYXJyYXkocG9zLCBwb3MgKyBsZW5ndGgpO1xuICAgICAgaWYgKHYubGVuZ3RoICE9PSBsZW5ndGgpIHRocm93IG5ldyBFKCd0bHYuZGVjb2RlOiB3cm9uZyB2YWx1ZSBsZW5ndGgnKTtcbiAgICAgIHJldHVybiB7IHYsIGw6IGRhdGEuc3ViYXJyYXkocG9zICsgbGVuZ3RoKSB9O1xuICAgIH0sXG4gIH0sXG4gIC8vIGh0dHBzOi8vY3J5cHRvLnN0YWNrZXhjaGFuZ2UuY29tL2EvNTc3MzQgTGVmdG1vc3QgYml0IG9mIGZpcnN0IGJ5dGUgaXMgJ25lZ2F0aXZlJyBmbGFnLFxuICAvLyBzaW5jZSB3ZSBhbHdheXMgdXNlIHBvc2l0aXZlIGludGVnZXJzIGhlcmUuIEl0IG11c3QgYWx3YXlzIGJlIGVtcHR5OlxuICAvLyAtIGFkZCB6ZXJvIGJ5dGUgaWYgZXhpc3RzXG4gIC8vIC0gaWYgbmV4dCBieXRlIGRvZXNuJ3QgaGF2ZSBhIGZsYWcsIGxlYWRpbmcgemVybyBpcyBub3QgYWxsb3dlZCAobWluaW1hbCBlbmNvZGluZylcbiAgX2ludDoge1xuICAgIGVuY29kZShudW06IGJpZ2ludCk6IHN0cmluZyB7XG4gICAgICBjb25zdCB7IEVycjogRSB9ID0gREVSO1xuICAgICAgaWYgKG51bSA8IF8wbikgdGhyb3cgbmV3IEUoJ2ludGVnZXI6IG5lZ2F0aXZlIGludGVnZXJzIGFyZSBub3QgYWxsb3dlZCcpO1xuICAgICAgbGV0IGhleCA9IG51bWJlclRvSGV4VW5wYWRkZWQobnVtKTtcbiAgICAgIC8vIFBhZCB3aXRoIHplcm8gYnl0ZSBpZiBuZWdhdGl2ZSBmbGFnIGlzIHByZXNlbnRcbiAgICAgIGlmIChOdW1iZXIucGFyc2VJbnQoaGV4WzBdLCAxNikgJiAwYjEwMDApIGhleCA9ICcwMCcgKyBoZXg7XG4gICAgICBpZiAoaGV4Lmxlbmd0aCAmIDEpIHRocm93IG5ldyBFKCd1bmV4cGVjdGVkIERFUiBwYXJzaW5nIGFzc2VydGlvbjogdW5wYWRkZWQgaGV4Jyk7XG4gICAgICByZXR1cm4gaGV4O1xuICAgIH0sXG4gICAgZGVjb2RlKGRhdGE6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgY29uc3QgeyBFcnI6IEUgfSA9IERFUjtcbiAgICAgIGlmIChkYXRhWzBdICYgMGIxMDAwXzAwMDApIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZSBpbnRlZ2VyOiBuZWdhdGl2ZScpO1xuICAgICAgaWYgKGRhdGFbMF0gPT09IDB4MDAgJiYgIShkYXRhWzFdICYgMGIxMDAwXzAwMDApKVxuICAgICAgICB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmUgaW50ZWdlcjogdW5uZWNlc3NhcnkgbGVhZGluZyB6ZXJvJyk7XG4gICAgICByZXR1cm4gYnl0ZXNUb051bWJlckJFKGRhdGEpO1xuICAgIH0sXG4gIH0sXG4gIHRvU2lnKGJ5dGVzOiBVaW50OEFycmF5KTogeyByOiBiaWdpbnQ7IHM6IGJpZ2ludCB9IHtcbiAgICAvLyBwYXJzZSBERVIgc2lnbmF0dXJlXG4gICAgY29uc3QgeyBFcnI6IEUsIF9pbnQ6IGludCwgX3RsdjogdGx2IH0gPSBERVI7XG4gICAgY29uc3QgZGF0YSA9IGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAnc2lnbmF0dXJlJyk7XG4gICAgY29uc3QgeyB2OiBzZXFCeXRlcywgbDogc2VxTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MzAsIGRhdGEpO1xuICAgIGlmIChzZXFMZWZ0Qnl0ZXMubGVuZ3RoKSB0aHJvdyBuZXcgRSgnaW52YWxpZCBzaWduYXR1cmU6IGxlZnQgYnl0ZXMgYWZ0ZXIgcGFyc2luZycpO1xuICAgIGNvbnN0IHsgdjogckJ5dGVzLCBsOiByTGVmdEJ5dGVzIH0gPSB0bHYuZGVjb2RlKDB4MDIsIHNlcUJ5dGVzKTtcbiAgICBjb25zdCB7IHY6IHNCeXRlcywgbDogc0xlZnRCeXRlcyB9ID0gdGx2LmRlY29kZSgweDAyLCByTGVmdEJ5dGVzKTtcbiAgICBpZiAoc0xlZnRCeXRlcy5sZW5ndGgpIHRocm93IG5ldyBFKCdpbnZhbGlkIHNpZ25hdHVyZTogbGVmdCBieXRlcyBhZnRlciBwYXJzaW5nJyk7XG4gICAgcmV0dXJuIHsgcjogaW50LmRlY29kZShyQnl0ZXMpLCBzOiBpbnQuZGVjb2RlKHNCeXRlcykgfTtcbiAgfSxcbiAgaGV4RnJvbVNpZyhzaWc6IHsgcjogYmlnaW50OyBzOiBiaWdpbnQgfSk6IHN0cmluZyB7XG4gICAgY29uc3QgeyBfdGx2OiB0bHYsIF9pbnQ6IGludCB9ID0gREVSO1xuICAgIGNvbnN0IHJzID0gdGx2LmVuY29kZSgweDAyLCBpbnQuZW5jb2RlKHNpZy5yKSk7XG4gICAgY29uc3Qgc3MgPSB0bHYuZW5jb2RlKDB4MDIsIGludC5lbmNvZGUoc2lnLnMpKTtcbiAgICBjb25zdCBzZXEgPSBycyArIHNzO1xuICAgIHJldHVybiB0bHYuZW5jb2RlKDB4MzAsIHNlcSk7XG4gIH0sXG59O1xuXG4vLyBCZSBmcmllbmRseSB0byBiYWQgRUNNQVNjcmlwdCBwYXJzZXJzIGJ5IG5vdCB1c2luZyBiaWdpbnQgbGl0ZXJhbHNcbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgXzBuID0gQmlnSW50KDApLCBfMW4gPSBCaWdJbnQoMSksIF8ybiA9IEJpZ0ludCgyKSwgXzNuID0gQmlnSW50KDMpLCBfNG4gPSBCaWdJbnQoNCk7XG5cbi8qKlxuICogQ3JlYXRlcyB3ZWllcnN0cmFzcyBQb2ludCBjb25zdHJ1Y3RvciwgYmFzZWQgb24gc3BlY2lmaWVkIGN1cnZlIG9wdGlvbnMuXG4gKlxuICogU2VlIHtAbGluayBXZWllcnN0cmFzc09wdHN9LlxuICpcbiAqIEBleGFtcGxlXG5gYGBqc1xuY29uc3Qgb3B0cyA9IHtcbiAgcDogMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZWZmZmZhYzczbixcbiAgbjogMHgxMDAwMDAwMDAwMDAwMDAwMDAwMDFiOGZhMTZkZmFiOWFjYTE2YjZiM24sXG4gIGg6IDFuLFxuICBhOiAwbixcbiAgYjogN24sXG4gIEd4OiAweDNiNGMzODJjZTM3YWExOTJhNDAxOWU3NjMwMzZmNGY1ZGQ0ZDdlYmJuLFxuICBHeTogMHg5MzhjZjkzNTMxOGZkY2VkNmJjMjgyODY1MzE3MzNjM2YwM2M0ZmVlbixcbn07XG5jb25zdCBzZWNwMTYwazFfUG9pbnQgPSB3ZWllcnN0cmFzcyhvcHRzKTtcbmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd2VpZXJzdHJhc3M8VD4oXG4gIHBhcmFtczogV2VpZXJzdHJhc3NPcHRzPFQ+LFxuICBleHRyYU9wdHM6IFdlaWVyc3RyYXNzRXh0cmFPcHRzPFQ+ID0ge31cbik6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+IHtcbiAgY29uc3QgdmFsaWRhdGVkID0gY3JlYXRlQ3VydmVGaWVsZHMoJ3dlaWVyc3RyYXNzJywgcGFyYW1zLCBleHRyYU9wdHMpO1xuICBjb25zdCB7IEZwLCBGbiB9ID0gdmFsaWRhdGVkO1xuICBsZXQgQ1VSVkUgPSB2YWxpZGF0ZWQuQ1VSVkUgYXMgV2VpZXJzdHJhc3NPcHRzPFQ+O1xuICBjb25zdCB7IGg6IGNvZmFjdG9yLCBuOiBDVVJWRV9PUkRFUiB9ID0gQ1VSVkU7XG4gIHZhbGlkYXRlT2JqZWN0KFxuICAgIGV4dHJhT3B0cyxcbiAgICB7fSxcbiAgICB7XG4gICAgICBhbGxvd0luZmluaXR5UG9pbnQ6ICdib29sZWFuJyxcbiAgICAgIGNsZWFyQ29mYWN0b3I6ICdmdW5jdGlvbicsXG4gICAgICBpc1RvcnNpb25GcmVlOiAnZnVuY3Rpb24nLFxuICAgICAgZnJvbUJ5dGVzOiAnZnVuY3Rpb24nLFxuICAgICAgdG9CeXRlczogJ2Z1bmN0aW9uJyxcbiAgICAgIGVuZG86ICdvYmplY3QnLFxuICAgIH1cbiAgKTtcblxuICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgaWYgKGVuZG8pIHtcbiAgICAvLyB2YWxpZGF0ZU9iamVjdChlbmRvLCB7IGJldGE6ICdiaWdpbnQnLCBzcGxpdFNjYWxhcjogJ2Z1bmN0aW9uJyB9KTtcbiAgICBpZiAoIUZwLmlzMChDVVJWRS5hKSB8fCB0eXBlb2YgZW5kby5iZXRhICE9PSAnYmlnaW50JyB8fCAhQXJyYXkuaXNBcnJheShlbmRvLmJhc2lzZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZW5kbzogZXhwZWN0ZWQgXCJiZXRhXCI6IGJpZ2ludCBhbmQgXCJiYXNpc2VzXCI6IGFycmF5Jyk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbGVuZ3RocyA9IGdldFdMZW5ndGhzKEZwLCBGbik7XG5cbiAgZnVuY3Rpb24gYXNzZXJ0Q29tcHJlc3Npb25Jc1N1cHBvcnRlZCgpIHtcbiAgICBpZiAoIUZwLmlzT2RkKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbXByZXNzaW9uIGlzIG5vdCBzdXBwb3J0ZWQ6IEZpZWxkIGRvZXMgbm90IGhhdmUgLmlzT2RkKCknKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudHMgSUVFRSBQMTM2MyBwb2ludCBlbmNvZGluZ1xuICBmdW5jdGlvbiBwb2ludFRvQnl0ZXMoXG4gICAgX2M6IFdlaWVyc3RyYXNzUG9pbnRDb25zPFQ+LFxuICAgIHBvaW50OiBXZWllcnN0cmFzc1BvaW50PFQ+LFxuICAgIGlzQ29tcHJlc3NlZDogYm9vbGVhblxuICApOiBVaW50OEFycmF5IHtcbiAgICBjb25zdCB7IHgsIHkgfSA9IHBvaW50LnRvQWZmaW5lKCk7XG4gICAgY29uc3QgYnggPSBGcC50b0J5dGVzKHgpO1xuICAgIGFib29sKGlzQ29tcHJlc3NlZCwgJ2lzQ29tcHJlc3NlZCcpO1xuICAgIGlmIChpc0NvbXByZXNzZWQpIHtcbiAgICAgIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKTtcbiAgICAgIGNvbnN0IGhhc0V2ZW5ZID0gIUZwLmlzT2RkISh5KTtcbiAgICAgIHJldHVybiBjb25jYXRCeXRlcyhwcHJlZml4KGhhc0V2ZW5ZKSwgYngpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMoVWludDhBcnJheS5vZigweDA0KSwgYngsIEZwLnRvQnl0ZXMoeSkpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBwb2ludEZyb21CeXRlcyhieXRlczogVWludDhBcnJheSkge1xuICAgIGFieXRlcyhieXRlcywgdW5kZWZpbmVkLCAnUG9pbnQnKTtcbiAgICBjb25zdCB7IHB1YmxpY0tleTogY29tcCwgcHVibGljS2V5VW5jb21wcmVzc2VkOiB1bmNvbXAgfSA9IGxlbmd0aHM7IC8vIGUuZy4gZm9yIDMyLWJ5dGU6IDMzLCA2NVxuICAgIGNvbnN0IGxlbmd0aCA9IGJ5dGVzLmxlbmd0aDtcbiAgICBjb25zdCBoZWFkID0gYnl0ZXNbMF07XG4gICAgY29uc3QgdGFpbCA9IGJ5dGVzLnN1YmFycmF5KDEpO1xuICAgIC8vIE5vIGFjdHVhbCB2YWxpZGF0aW9uIGlzIGRvbmUgaGVyZTogdXNlIC5hc3NlcnRWYWxpZGl0eSgpXG4gICAgaWYgKGxlbmd0aCA9PT0gY29tcCAmJiAoaGVhZCA9PT0gMHgwMiB8fCBoZWFkID09PSAweDAzKSkge1xuICAgICAgY29uc3QgeCA9IEZwLmZyb21CeXRlcyh0YWlsKTtcbiAgICAgIGlmICghRnAuaXNWYWxpZCh4KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZSwgd3JvbmcgeCcpO1xuICAgICAgY29uc3QgeTIgPSB3ZWllcnN0cmFzc0VxdWF0aW9uKHgpOyAvLyB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYlxuICAgICAgbGV0IHk6IFQ7XG4gICAgICB0cnkge1xuICAgICAgICB5ID0gRnAuc3FydCh5Mik7IC8vIHkgPSB5XHUwMEIyIF4gKHArMSkvNFxuICAgICAgfSBjYXRjaCAoc3FydEVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IHNxcnRFcnJvciBpbnN0YW5jZW9mIEVycm9yID8gJzogJyArIHNxcnRFcnJvci5tZXNzYWdlIDogJyc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBpcyBub3Qgb24gY3VydmUsIHNxcnQgZXJyb3InICsgZXJyKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydENvbXByZXNzaW9uSXNTdXBwb3J0ZWQoKTtcbiAgICAgIGNvbnN0IGV2ZW5ZID0gRnAuaXNPZGQhKHkpO1xuICAgICAgY29uc3QgZXZlbkggPSAoaGVhZCAmIDEpID09PSAxOyAvLyBFQ0RTQS1zcGVjaWZpY1xuICAgICAgaWYgKGV2ZW5IICE9PSBldmVuWSkgeSA9IEZwLm5lZyh5KTtcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcbiAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5jb21wICYmIGhlYWQgPT09IDB4MDQpIHtcbiAgICAgIC8vIFRPRE86IG1vcmUgY2hlY2tzXG4gICAgICBjb25zdCBMID0gRnAuQllURVM7XG4gICAgICBjb25zdCB4ID0gRnAuZnJvbUJ5dGVzKHRhaWwuc3ViYXJyYXkoMCwgTCkpO1xuICAgICAgY29uc3QgeSA9IEZwLmZyb21CeXRlcyh0YWlsLnN1YmFycmF5KEwsIEwgKiAyKSk7XG4gICAgICBpZiAoIWlzVmFsaWRYWSh4LCB5KSkgdGhyb3cgbmV3IEVycm9yKCdiYWQgcG9pbnQ6IGlzIG5vdCBvbiBjdXJ2ZScpO1xuICAgICAgcmV0dXJuIHsgeCwgeSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBiYWQgcG9pbnQ6IGdvdCBsZW5ndGggJHtsZW5ndGh9LCBleHBlY3RlZCBjb21wcmVzc2VkPSR7Y29tcH0gb3IgdW5jb21wcmVzc2VkPSR7dW5jb21wfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZW5jb2RlUG9pbnQgPSBleHRyYU9wdHMudG9CeXRlcyB8fCBwb2ludFRvQnl0ZXM7XG4gIGNvbnN0IGRlY29kZVBvaW50ID0gZXh0cmFPcHRzLmZyb21CeXRlcyB8fCBwb2ludEZyb21CeXRlcztcbiAgZnVuY3Rpb24gd2VpZXJzdHJhc3NFcXVhdGlvbih4OiBUKTogVCB7XG4gICAgY29uc3QgeDIgPSBGcC5zcXIoeCk7IC8vIHggKiB4XG4gICAgY29uc3QgeDMgPSBGcC5tdWwoeDIsIHgpOyAvLyB4XHUwMEIyICogeFxuICAgIHJldHVybiBGcC5hZGQoRnAuYWRkKHgzLCBGcC5tdWwoeCwgQ1VSVkUuYSkpLCBDVVJWRS5iKTsgLy8geFx1MDBCMyArIGEgKiB4ICsgYlxuICB9XG5cbiAgLy8gVE9ETzogbW92ZSB0b3AtbGV2ZWxcbiAgLyoqIENoZWNrcyB3aGV0aGVyIGVxdWF0aW9uIGhvbGRzIGZvciBnaXZlbiB4LCB5OiB5XHUwMEIyID09IHhcdTAwQjMgKyBheCArIGIgKi9cbiAgZnVuY3Rpb24gaXNWYWxpZFhZKHg6IFQsIHk6IFQpOiBib29sZWFuIHtcbiAgICBjb25zdCBsZWZ0ID0gRnAuc3FyKHkpOyAvLyB5XHUwMEIyXG4gICAgY29uc3QgcmlnaHQgPSB3ZWllcnN0cmFzc0VxdWF0aW9uKHgpOyAvLyB4XHUwMEIzICsgYXggKyBiXG4gICAgcmV0dXJuIEZwLmVxbChsZWZ0LCByaWdodCk7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB3aGV0aGVyIHRoZSBwYXNzZWQgY3VydmUgcGFyYW1zIGFyZSB2YWxpZC5cbiAgLy8gVGVzdCAxOiBlcXVhdGlvbiB5XHUwMEIyID0geFx1MDBCMyArIGF4ICsgYiBzaG91bGQgd29yayBmb3IgZ2VuZXJhdG9yIHBvaW50LlxuICBpZiAoIWlzVmFsaWRYWShDVVJWRS5HeCwgQ1VSVkUuR3kpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBjdXJ2ZSBwYXJhbXM6IGdlbmVyYXRvciBwb2ludCcpO1xuXG4gIC8vIFRlc3QgMjogZGlzY3JpbWluYW50IFx1MDM5NCBwYXJ0IHNob3VsZCBiZSBub24temVybzogNGFcdTAwQjMgKyAyN2JcdTAwQjIgIT0gMC5cbiAgLy8gR3VhcmFudGVlcyBjdXJ2ZSBpcyBnZW51cy0xLCBzbW9vdGggKG5vbi1zaW5ndWxhcikuXG4gIGNvbnN0IF80YTMgPSBGcC5tdWwoRnAucG93KENVUlZFLmEsIF8zbiksIF80bik7XG4gIGNvbnN0IF8yN2IyID0gRnAubXVsKEZwLnNxcihDVVJWRS5iKSwgQmlnSW50KDI3KSk7XG4gIGlmIChGcC5pczAoRnAuYWRkKF80YTMsIF8yN2IyKSkpIHRocm93IG5ldyBFcnJvcignYmFkIGN1cnZlIHBhcmFtczogYSBvciBiJyk7XG5cbiAgLyoqIEFzc2VydHMgY29vcmRpbmF0ZSBpcyB2YWxpZDogMCA8PSBuIDwgRnAuT1JERVIuICovXG4gIGZ1bmN0aW9uIGFjb29yZCh0aXRsZTogc3RyaW5nLCBuOiBULCBiYW5aZXJvID0gZmFsc2UpIHtcbiAgICBpZiAoIUZwLmlzVmFsaWQobikgfHwgKGJhblplcm8gJiYgRnAuaXMwKG4pKSkgdGhyb3cgbmV3IEVycm9yKGBiYWQgcG9pbnQgY29vcmRpbmF0ZSAke3RpdGxlfWApO1xuICAgIHJldHVybiBuO1xuICB9XG5cbiAgZnVuY3Rpb24gYXByanBvaW50KG90aGVyOiB1bmtub3duKSB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBQb2ludCkpIHRocm93IG5ldyBFcnJvcignV2VpZXJzdHJhc3MgUG9pbnQgZXhwZWN0ZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwbGl0RW5kb1NjYWxhck4oazogYmlnaW50KSB7XG4gICAgaWYgKCFlbmRvIHx8ICFlbmRvLmJhc2lzZXMpIHRocm93IG5ldyBFcnJvcignbm8gZW5kbycpO1xuICAgIHJldHVybiBfc3BsaXRFbmRvU2NhbGFyKGssIGVuZG8uYmFzaXNlcywgRm4uT1JERVIpO1xuICB9XG5cbiAgLy8gTWVtb2l6ZWQgdG9BZmZpbmUgLyB2YWxpZGl0eSBjaGVjay4gVGhleSBhcmUgaGVhdnkuIFBvaW50cyBhcmUgaW1tdXRhYmxlLlxuXG4gIC8vIENvbnZlcnRzIFByb2plY3RpdmUgcG9pbnQgdG8gYWZmaW5lICh4LCB5KSBjb29yZGluYXRlcy5cbiAgLy8gQ2FuIGFjY2VwdCBwcmVjb21wdXRlZCBaXi0xIC0gZm9yIGV4YW1wbGUsIGZyb20gaW52ZXJ0QmF0Y2guXG4gIC8vIChYLCBZLCBaKSBcdTIyMEIgKHg9WC9aLCB5PVkvWilcbiAgY29uc3QgdG9BZmZpbmVNZW1vID0gbWVtb2l6ZWQoKHA6IFBvaW50LCBpej86IFQpOiBBZmZpbmVQb2ludDxUPiA9PiB7XG4gICAgY29uc3QgeyBYLCBZLCBaIH0gPSBwO1xuICAgIC8vIEZhc3QtcGF0aCBmb3Igbm9ybWFsaXplZCBwb2ludHNcbiAgICBpZiAoRnAuZXFsKFosIEZwLk9ORSkpIHJldHVybiB7IHg6IFgsIHk6IFkgfTtcbiAgICBjb25zdCBpczAgPSBwLmlzMCgpO1xuICAgIC8vIElmIGludlogd2FzIDAsIHdlIHJldHVybiB6ZXJvIHBvaW50LiBIb3dldmVyIHdlIHN0aWxsIHdhbnQgdG8gZXhlY3V0ZVxuICAgIC8vIGFsbCBvcGVyYXRpb25zLCBzbyB3ZSByZXBsYWNlIGludlogd2l0aCBhIHJhbmRvbSBudW1iZXIsIDEuXG4gICAgaWYgKGl6ID09IG51bGwpIGl6ID0gaXMwID8gRnAuT05FIDogRnAuaW52KFopO1xuICAgIGNvbnN0IHggPSBGcC5tdWwoWCwgaXopO1xuICAgIGNvbnN0IHkgPSBGcC5tdWwoWSwgaXopO1xuICAgIGNvbnN0IHp6ID0gRnAubXVsKFosIGl6KTtcbiAgICBpZiAoaXMwKSByZXR1cm4geyB4OiBGcC5aRVJPLCB5OiBGcC5aRVJPIH07XG4gICAgaWYgKCFGcC5lcWwoenosIEZwLk9ORSkpIHRocm93IG5ldyBFcnJvcignaW52WiB3YXMgaW52YWxpZCcpO1xuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfSk7XG4gIC8vIE5PVEU6IG9uIGV4Y2VwdGlvbiB0aGlzIHdpbGwgY3Jhc2ggJ2NhY2hlZCcgYW5kIG5vIHZhbHVlIHdpbGwgYmUgc2V0LlxuICAvLyBPdGhlcndpc2UgdHJ1ZSB3aWxsIGJlIHJldHVyblxuICBjb25zdCBhc3NlcnRWYWxpZE1lbW8gPSBtZW1vaXplZCgocDogUG9pbnQpID0+IHtcbiAgICBpZiAocC5pczAoKSkge1xuICAgICAgLy8gKDAsIDEsIDApIGFrYSBaRVJPIGlzIGludmFsaWQgaW4gbW9zdCBjb250ZXh0cy5cbiAgICAgIC8vIEluIEJMUywgWkVSTyBjYW4gYmUgc2VyaWFsaXplZCwgc28gd2UgYWxsb3cgaXQuXG4gICAgICAvLyAoMCwgMCwgMCkgaXMgaW52YWxpZCByZXByZXNlbnRhdGlvbiBvZiBaRVJPLlxuICAgICAgaWYgKGV4dHJhT3B0cy5hbGxvd0luZmluaXR5UG9pbnQgJiYgIUZwLmlzMChwLlkpKSByZXR1cm47XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogWkVSTycpO1xuICAgIH1cbiAgICAvLyBTb21lIDNyZC1wYXJ0eSB0ZXN0IHZlY3RvcnMgcmVxdWlyZSBkaWZmZXJlbnQgd29yZGluZyBiZXR3ZWVuIGhlcmUgJiBgZnJvbUNvbXByZXNzZWRIZXhgXG4gICAgY29uc3QgeyB4LCB5IH0gPSBwLnRvQWZmaW5lKCk7XG4gICAgaWYgKCFGcC5pc1ZhbGlkKHgpIHx8ICFGcC5pc1ZhbGlkKHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogeCBvciB5IG5vdCBmaWVsZCBlbGVtZW50cycpO1xuICAgIGlmICghaXNWYWxpZFhZKHgsIHkpKSB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb2ludDogZXF1YXRpb24gbGVmdCAhPSByaWdodCcpO1xuICAgIGlmICghcC5pc1RvcnNpb25GcmVlKCkpIHRocm93IG5ldyBFcnJvcignYmFkIHBvaW50OiBub3QgaW4gcHJpbWUtb3JkZXIgc3ViZ3JvdXAnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZmluaXNoRW5kbyhcbiAgICBlbmRvQmV0YTogRW5kb21vcnBoaXNtT3B0c1snYmV0YSddLFxuICAgIGsxcDogUG9pbnQsXG4gICAgazJwOiBQb2ludCxcbiAgICBrMW5lZzogYm9vbGVhbixcbiAgICBrMm5lZzogYm9vbGVhblxuICApIHtcbiAgICBrMnAgPSBuZXcgUG9pbnQoRnAubXVsKGsycC5YLCBlbmRvQmV0YSksIGsycC5ZLCBrMnAuWik7XG4gICAgazFwID0gbmVnYXRlQ3QoazFuZWcsIGsxcCk7XG4gICAgazJwID0gbmVnYXRlQ3QoazJuZWcsIGsycCk7XG4gICAgcmV0dXJuIGsxcC5hZGQoazJwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9qZWN0aXZlIFBvaW50IHdvcmtzIGluIDNkIC8gcHJvamVjdGl2ZSAoaG9tb2dlbmVvdXMpIGNvb3JkaW5hdGVzOihYLCBZLCBaKSBcdTIyMEIgKHg9WC9aLCB5PVkvWikuXG4gICAqIERlZmF1bHQgUG9pbnQgd29ya3MgaW4gMmQgLyBhZmZpbmUgY29vcmRpbmF0ZXM6ICh4LCB5KS5cbiAgICogV2UncmUgZG9pbmcgY2FsY3VsYXRpb25zIGluIHByb2plY3RpdmUsIGJlY2F1c2UgaXRzIG9wZXJhdGlvbnMgZG9uJ3QgcmVxdWlyZSBjb3N0bHkgaW52ZXJzaW9uLlxuICAgKi9cbiAgY2xhc3MgUG9pbnQgaW1wbGVtZW50cyBXZWllcnN0cmFzc1BvaW50PFQ+IHtcbiAgICAvLyBiYXNlIC8gZ2VuZXJhdG9yIHBvaW50XG4gICAgc3RhdGljIHJlYWRvbmx5IEJBU0UgPSBuZXcgUG9pbnQoQ1VSVkUuR3gsIENVUlZFLkd5LCBGcC5PTkUpO1xuICAgIC8vIHplcm8gLyBpbmZpbml0eSAvIGlkZW50aXR5IHBvaW50XG4gICAgc3RhdGljIHJlYWRvbmx5IFpFUk8gPSBuZXcgUG9pbnQoRnAuWkVSTywgRnAuT05FLCBGcC5aRVJPKTsgLy8gMCwgMSwgMFxuICAgIC8vIG1hdGggZmllbGRcbiAgICBzdGF0aWMgcmVhZG9ubHkgRnAgPSBGcDtcbiAgICAvLyBzY2FsYXIgZmllbGRcbiAgICBzdGF0aWMgcmVhZG9ubHkgRm4gPSBGbjtcblxuICAgIHJlYWRvbmx5IFg6IFQ7XG4gICAgcmVhZG9ubHkgWTogVDtcbiAgICByZWFkb25seSBaOiBUO1xuXG4gICAgLyoqIERvZXMgTk9UIHZhbGlkYXRlIGlmIHRoZSBwb2ludCBpcyB2YWxpZC4gVXNlIGAuYXNzZXJ0VmFsaWRpdHkoKWAuICovXG4gICAgY29uc3RydWN0b3IoWDogVCwgWTogVCwgWjogVCkge1xuICAgICAgdGhpcy5YID0gYWNvb3JkKCd4JywgWCk7XG4gICAgICB0aGlzLlkgPSBhY29vcmQoJ3knLCBZLCB0cnVlKTtcbiAgICAgIHRoaXMuWiA9IGFjb29yZCgneicsIFopO1xuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ1VSVkUoKTogV2VpZXJzdHJhc3NPcHRzPFQ+IHtcbiAgICAgIHJldHVybiBDVVJWRTtcbiAgICB9XG5cbiAgICAvKiogRG9lcyBOT1QgdmFsaWRhdGUgaWYgdGhlIHBvaW50IGlzIHZhbGlkLiBVc2UgYC5hc3NlcnRWYWxpZGl0eSgpYC4gKi9cbiAgICBzdGF0aWMgZnJvbUFmZmluZShwOiBBZmZpbmVQb2ludDxUPik6IFBvaW50IHtcbiAgICAgIGNvbnN0IHsgeCwgeSB9ID0gcCB8fCB7fTtcbiAgICAgIGlmICghcCB8fCAhRnAuaXNWYWxpZCh4KSB8fCAhRnAuaXNWYWxpZCh5KSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFmZmluZSBwb2ludCcpO1xuICAgICAgaWYgKHAgaW5zdGFuY2VvZiBQb2ludCkgdGhyb3cgbmV3IEVycm9yKCdwcm9qZWN0aXZlIHBvaW50IG5vdCBhbGxvd2VkJyk7XG4gICAgICAvLyAoMCwgMCkgd291bGQndmUgcHJvZHVjZWQgKDAsIDAsIDEpIC0gaW5zdGVhZCwgd2UgbmVlZCAoMCwgMSwgMClcbiAgICAgIGlmIChGcC5pczAoeCkgJiYgRnAuaXMwKHkpKSByZXR1cm4gUG9pbnQuWkVSTztcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSwgRnAuT05FKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5KTogUG9pbnQge1xuICAgICAgY29uc3QgUCA9IFBvaW50LmZyb21BZmZpbmUoZGVjb2RlUG9pbnQoYWJ5dGVzKGJ5dGVzLCB1bmRlZmluZWQsICdwb2ludCcpKSk7XG4gICAgICBQLmFzc2VydFZhbGlkaXR5KCk7XG4gICAgICByZXR1cm4gUDtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUhleChoZXg6IHN0cmluZyk6IFBvaW50IHtcbiAgICAgIHJldHVybiBQb2ludC5mcm9tQnl0ZXMoaGV4VG9CeXRlcyhoZXgpKTtcbiAgICB9XG5cbiAgICBnZXQgeCgpOiBUIHtcbiAgICAgIHJldHVybiB0aGlzLnRvQWZmaW5lKCkueDtcbiAgICB9XG4gICAgZ2V0IHkoKTogVCB7XG4gICAgICByZXR1cm4gdGhpcy50b0FmZmluZSgpLnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2luZG93U2l6ZVxuICAgICAqIEBwYXJhbSBpc0xhenkgdHJ1ZSB3aWxsIGRlZmVyIHRhYmxlIGNvbXB1dGF0aW9uIHVudGlsIHRoZSBmaXJzdCBtdWx0aXBsaWNhdGlvblxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJlY29tcHV0ZSh3aW5kb3dTaXplOiBudW1iZXIgPSA4LCBpc0xhenkgPSB0cnVlKTogUG9pbnQge1xuICAgICAgd25hZi5jcmVhdGVDYWNoZSh0aGlzLCB3aW5kb3dTaXplKTtcbiAgICAgIGlmICghaXNMYXp5KSB0aGlzLm11bHRpcGx5KF8zbik7IC8vIHJhbmRvbSBudW1iZXJcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJldHVybiBgdGhpc2BcbiAgICAvKiogQSBwb2ludCBvbiBjdXJ2ZSBpcyB2YWxpZCBpZiBpdCBjb25mb3JtcyB0byBlcXVhdGlvbi4gKi9cbiAgICBhc3NlcnRWYWxpZGl0eSgpOiB2b2lkIHtcbiAgICAgIGFzc2VydFZhbGlkTWVtbyh0aGlzKTtcbiAgICB9XG5cbiAgICBoYXNFdmVuWSgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IHsgeSB9ID0gdGhpcy50b0FmZmluZSgpO1xuICAgICAgaWYgKCFGcC5pc09kZCkgdGhyb3cgbmV3IEVycm9yKFwiRmllbGQgZG9lc24ndCBzdXBwb3J0IGlzT2RkXCIpO1xuICAgICAgcmV0dXJuICFGcC5pc09kZCh5KTtcbiAgICB9XG5cbiAgICAvKiogQ29tcGFyZSBvbmUgcG9pbnQgdG8gYW5vdGhlci4gKi9cbiAgICBlcXVhbHMob3RoZXI6IFBvaW50KTogYm9vbGVhbiB7XG4gICAgICBhcHJqcG9pbnQob3RoZXIpO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgY29uc3QgeyBYOiBYMiwgWTogWTIsIFo6IFoyIH0gPSBvdGhlcjtcbiAgICAgIGNvbnN0IFUxID0gRnAuZXFsKEZwLm11bChYMSwgWjIpLCBGcC5tdWwoWDIsIFoxKSk7XG4gICAgICBjb25zdCBVMiA9IEZwLmVxbChGcC5tdWwoWTEsIFoyKSwgRnAubXVsKFkyLCBaMSkpO1xuICAgICAgcmV0dXJuIFUxICYmIFUyO1xuICAgIH1cblxuICAgIC8qKiBGbGlwcyBwb2ludCB0byBvbmUgY29ycmVzcG9uZGluZyB0byAoeCwgLXkpIGluIEFmZmluZSBjb29yZGluYXRlcy4gKi9cbiAgICBuZWdhdGUoKTogUG9pbnQge1xuICAgICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLlgsIEZwLm5lZyh0aGlzLlkpLCB0aGlzLlopO1xuICAgIH1cblxuICAgIC8vIFJlbmVzLUNvc3RlbGxvLUJhdGluYSBleGNlcHRpb24tZnJlZSBkb3VibGluZyBmb3JtdWxhLlxuICAgIC8vIFRoZXJlIGlzIDMwJSBmYXN0ZXIgSmFjb2JpYW4gZm9ybXVsYSwgYnV0IGl0IGlzIG5vdCBjb21wbGV0ZS5cbiAgICAvLyBodHRwczovL2VwcmludC5pYWNyLm9yZy8yMDE1LzEwNjAsIGFsZ29yaXRobSAzXG4gICAgLy8gQ29zdDogOE0gKyAzUyArIDMqYSArIDIqYjMgKyAxNWFkZC5cbiAgICBkb3VibGUoKSB7XG4gICAgICBjb25zdCB7IGEsIGIgfSA9IENVUlZFO1xuICAgICAgY29uc3QgYjMgPSBGcC5tdWwoYiwgXzNuKTtcbiAgICAgIGNvbnN0IHsgWDogWDEsIFk6IFkxLCBaOiBaMSB9ID0gdGhpcztcbiAgICAgIGxldCBYMyA9IEZwLlpFUk8sIFkzID0gRnAuWkVSTywgWjMgPSBGcC5aRVJPOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGxldCB0MCA9IEZwLm11bChYMSwgWDEpOyAvLyBzdGVwIDFcbiAgICAgIGxldCB0MSA9IEZwLm11bChZMSwgWTEpO1xuICAgICAgbGV0IHQyID0gRnAubXVsKFoxLCBaMSk7XG4gICAgICBsZXQgdDMgPSBGcC5tdWwoWDEsIFkxKTtcbiAgICAgIHQzID0gRnAuYWRkKHQzLCB0Myk7IC8vIHN0ZXAgNVxuICAgICAgWjMgPSBGcC5tdWwoWDEsIFoxKTtcbiAgICAgIFozID0gRnAuYWRkKFozLCBaMyk7XG4gICAgICBYMyA9IEZwLm11bChhLCBaMyk7XG4gICAgICBZMyA9IEZwLm11bChiMywgdDIpO1xuICAgICAgWTMgPSBGcC5hZGQoWDMsIFkzKTsgLy8gc3RlcCAxMFxuICAgICAgWDMgPSBGcC5zdWIodDEsIFkzKTtcbiAgICAgIFkzID0gRnAuYWRkKHQxLCBZMyk7XG4gICAgICBZMyA9IEZwLm11bChYMywgWTMpO1xuICAgICAgWDMgPSBGcC5tdWwodDMsIFgzKTtcbiAgICAgIFozID0gRnAubXVsKGIzLCBaMyk7IC8vIHN0ZXAgMTVcbiAgICAgIHQyID0gRnAubXVsKGEsIHQyKTtcbiAgICAgIHQzID0gRnAuc3ViKHQwLCB0Mik7XG4gICAgICB0MyA9IEZwLm11bChhLCB0Myk7XG4gICAgICB0MyA9IEZwLmFkZCh0MywgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQodDAsIHQwKTsgLy8gc3RlcCAyMFxuICAgICAgdDAgPSBGcC5hZGQoWjMsIHQwKTtcbiAgICAgIHQwID0gRnAuYWRkKHQwLCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MCwgdDMpO1xuICAgICAgWTMgPSBGcC5hZGQoWTMsIHQwKTtcbiAgICAgIHQyID0gRnAubXVsKFkxLCBaMSk7IC8vIHN0ZXAgMjVcbiAgICAgIHQyID0gRnAuYWRkKHQyLCB0Mik7XG4gICAgICB0MCA9IEZwLm11bCh0MiwgdDMpO1xuICAgICAgWDMgPSBGcC5zdWIoWDMsIHQwKTtcbiAgICAgIFozID0gRnAubXVsKHQyLCB0MSk7XG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpOyAvLyBzdGVwIDMwXG4gICAgICBaMyA9IEZwLmFkZChaMywgWjMpO1xuICAgICAgcmV0dXJuIG5ldyBQb2ludChYMywgWTMsIFozKTtcbiAgICB9XG5cbiAgICAvLyBSZW5lcy1Db3N0ZWxsby1CYXRpbmEgZXhjZXB0aW9uLWZyZWUgYWRkaXRpb24gZm9ybXVsYS5cbiAgICAvLyBUaGVyZSBpcyAzMCUgZmFzdGVyIEphY29iaWFuIGZvcm11bGEsIGJ1dCBpdCBpcyBub3QgY29tcGxldGUuXG4gICAgLy8gaHR0cHM6Ly9lcHJpbnQuaWFjci5vcmcvMjAxNS8xMDYwLCBhbGdvcml0aG0gMVxuICAgIC8vIENvc3Q6IDEyTSArIDBTICsgMyphICsgMypiMyArIDIzYWRkLlxuICAgIGFkZChvdGhlcjogUG9pbnQpOiBQb2ludCB7XG4gICAgICBhcHJqcG9pbnQob3RoZXIpO1xuICAgICAgY29uc3QgeyBYOiBYMSwgWTogWTEsIFo6IFoxIH0gPSB0aGlzO1xuICAgICAgY29uc3QgeyBYOiBYMiwgWTogWTIsIFo6IFoyIH0gPSBvdGhlcjtcbiAgICAgIGxldCBYMyA9IEZwLlpFUk8sIFkzID0gRnAuWkVSTywgWjMgPSBGcC5aRVJPOyAvLyBwcmV0dGllci1pZ25vcmVcbiAgICAgIGNvbnN0IGEgPSBDVVJWRS5hO1xuICAgICAgY29uc3QgYjMgPSBGcC5tdWwoQ1VSVkUuYiwgXzNuKTtcbiAgICAgIGxldCB0MCA9IEZwLm11bChYMSwgWDIpOyAvLyBzdGVwIDFcbiAgICAgIGxldCB0MSA9IEZwLm11bChZMSwgWTIpO1xuICAgICAgbGV0IHQyID0gRnAubXVsKFoxLCBaMik7XG4gICAgICBsZXQgdDMgPSBGcC5hZGQoWDEsIFkxKTtcbiAgICAgIGxldCB0NCA9IEZwLmFkZChYMiwgWTIpOyAvLyBzdGVwIDVcbiAgICAgIHQzID0gRnAubXVsKHQzLCB0NCk7XG4gICAgICB0NCA9IEZwLmFkZCh0MCwgdDEpO1xuICAgICAgdDMgPSBGcC5zdWIodDMsIHQ0KTtcbiAgICAgIHQ0ID0gRnAuYWRkKFgxLCBaMSk7XG4gICAgICBsZXQgdDUgPSBGcC5hZGQoWDIsIFoyKTsgLy8gc3RlcCAxMFxuICAgICAgdDQgPSBGcC5tdWwodDQsIHQ1KTtcbiAgICAgIHQ1ID0gRnAuYWRkKHQwLCB0Mik7XG4gICAgICB0NCA9IEZwLnN1Yih0NCwgdDUpO1xuICAgICAgdDUgPSBGcC5hZGQoWTEsIFoxKTtcbiAgICAgIFgzID0gRnAuYWRkKFkyLCBaMik7IC8vIHN0ZXAgMTVcbiAgICAgIHQ1ID0gRnAubXVsKHQ1LCBYMyk7XG4gICAgICBYMyA9IEZwLmFkZCh0MSwgdDIpO1xuICAgICAgdDUgPSBGcC5zdWIodDUsIFgzKTtcbiAgICAgIFozID0gRnAubXVsKGEsIHQ0KTtcbiAgICAgIFgzID0gRnAubXVsKGIzLCB0Mik7IC8vIHN0ZXAgMjBcbiAgICAgIFozID0gRnAuYWRkKFgzLCBaMyk7XG4gICAgICBYMyA9IEZwLnN1Yih0MSwgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQodDEsIFozKTtcbiAgICAgIFkzID0gRnAubXVsKFgzLCBaMyk7XG4gICAgICB0MSA9IEZwLmFkZCh0MCwgdDApOyAvLyBzdGVwIDI1XG4gICAgICB0MSA9IEZwLmFkZCh0MSwgdDApO1xuICAgICAgdDIgPSBGcC5tdWwoYSwgdDIpO1xuICAgICAgdDQgPSBGcC5tdWwoYjMsIHQ0KTtcbiAgICAgIHQxID0gRnAuYWRkKHQxLCB0Mik7XG4gICAgICB0MiA9IEZwLnN1Yih0MCwgdDIpOyAvLyBzdGVwIDMwXG4gICAgICB0MiA9IEZwLm11bChhLCB0Mik7XG4gICAgICB0NCA9IEZwLmFkZCh0NCwgdDIpO1xuICAgICAgdDAgPSBGcC5tdWwodDEsIHQ0KTtcbiAgICAgIFkzID0gRnAuYWRkKFkzLCB0MCk7XG4gICAgICB0MCA9IEZwLm11bCh0NSwgdDQpOyAvLyBzdGVwIDM1XG4gICAgICBYMyA9IEZwLm11bCh0MywgWDMpO1xuICAgICAgWDMgPSBGcC5zdWIoWDMsIHQwKTtcbiAgICAgIHQwID0gRnAubXVsKHQzLCB0MSk7XG4gICAgICBaMyA9IEZwLm11bCh0NSwgWjMpO1xuICAgICAgWjMgPSBGcC5hZGQoWjMsIHQwKTsgLy8gc3RlcCA0MFxuICAgICAgcmV0dXJuIG5ldyBQb2ludChYMywgWTMsIFozKTtcbiAgICB9XG5cbiAgICBzdWJ0cmFjdChvdGhlcjogUG9pbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChvdGhlci5uZWdhdGUoKSk7XG4gICAgfVxuXG4gICAgaXMwKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKFBvaW50LlpFUk8pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0YW50IHRpbWUgbXVsdGlwbGljYXRpb24uXG4gICAgICogVXNlcyB3TkFGIG1ldGhvZC4gV2luZG93ZWQgbWV0aG9kIG1heSBiZSAxMCUgZmFzdGVyLFxuICAgICAqIGJ1dCB0YWtlcyAyeCBsb25nZXIgdG8gZ2VuZXJhdGUgYW5kIGNvbnN1bWVzIDJ4IG1lbW9yeS5cbiAgICAgKiBVc2VzIHByZWNvbXB1dGVzIHdoZW4gYXZhaWxhYmxlLlxuICAgICAqIFVzZXMgZW5kb21vcnBoaXNtIGZvciBLb2JsaXR6IGN1cnZlcy5cbiAgICAgKiBAcGFyYW0gc2NhbGFyIGJ5IHdoaWNoIHRoZSBwb2ludCB3b3VsZCBiZSBtdWx0aXBsaWVkXG4gICAgICogQHJldHVybnMgTmV3IHBvaW50XG4gICAgICovXG4gICAgbXVsdGlwbHkoc2NhbGFyOiBiaWdpbnQpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmICghRm4uaXNWYWxpZE5vdDAoc2NhbGFyKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcjogb3V0IG9mIHJhbmdlJyk7IC8vIDAgaXMgaW52YWxpZFxuICAgICAgbGV0IHBvaW50OiBQb2ludCwgZmFrZTogUG9pbnQ7IC8vIEZha2UgcG9pbnQgaXMgdXNlZCB0byBjb25zdC10aW1lIG11bHRcbiAgICAgIGNvbnN0IG11bCA9IChuOiBiaWdpbnQpID0+IHduYWYuY2FjaGVkKHRoaXMsIG4sIChwKSA9PiBub3JtYWxpemVaKFBvaW50LCBwKSk7XG4gICAgICAvKiogU2VlIGRvY3MgZm9yIHtAbGluayBFbmRvbW9ycGhpc21PcHRzfSAqL1xuICAgICAgaWYgKGVuZG8pIHtcbiAgICAgICAgY29uc3QgeyBrMW5lZywgazEsIGsybmVnLCBrMiB9ID0gc3BsaXRFbmRvU2NhbGFyTihzY2FsYXIpO1xuICAgICAgICBjb25zdCB7IHA6IGsxcCwgZjogazFmIH0gPSBtdWwoazEpO1xuICAgICAgICBjb25zdCB7IHA6IGsycCwgZjogazJmIH0gPSBtdWwoazIpO1xuICAgICAgICBmYWtlID0gazFmLmFkZChrMmYpO1xuICAgICAgICBwb2ludCA9IGZpbmlzaEVuZG8oZW5kby5iZXRhLCBrMXAsIGsycCwgazFuZWcsIGsybmVnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgcCwgZiB9ID0gbXVsKHNjYWxhcik7XG4gICAgICAgIHBvaW50ID0gcDtcbiAgICAgICAgZmFrZSA9IGY7XG4gICAgICB9XG4gICAgICAvLyBOb3JtYWxpemUgYHpgIGZvciBib3RoIHBvaW50cywgYnV0IHJldHVybiBvbmx5IHJlYWwgb25lXG4gICAgICByZXR1cm4gbm9ybWFsaXplWihQb2ludCwgW3BvaW50LCBmYWtlXSlbMF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTm9uLWNvbnN0YW50LXRpbWUgbXVsdGlwbGljYXRpb24uIFVzZXMgZG91YmxlLWFuZC1hZGQgYWxnb3JpdGhtLlxuICAgICAqIEl0J3MgZmFzdGVyLCBidXQgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aGVuIHlvdSBkb24ndCBjYXJlIGFib3V0XG4gICAgICogYW4gZXhwb3NlZCBzZWNyZXQga2V5IGUuZy4gc2lnIHZlcmlmaWNhdGlvbiwgd2hpY2ggd29ya3Mgb3ZlciAqcHVibGljKiBrZXlzLlxuICAgICAqL1xuICAgIG11bHRpcGx5VW5zYWZlKHNjOiBiaWdpbnQpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGVuZG8gfSA9IGV4dHJhT3B0cztcbiAgICAgIGNvbnN0IHAgPSB0aGlzIGFzIFBvaW50O1xuICAgICAgaWYgKCFGbi5pc1ZhbGlkKHNjKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNjYWxhcjogb3V0IG9mIHJhbmdlJyk7IC8vIDAgaXMgdmFsaWRcbiAgICAgIGlmIChzYyA9PT0gXzBuIHx8IHAuaXMwKCkpIHJldHVybiBQb2ludC5aRVJPOyAvLyAwXG4gICAgICBpZiAoc2MgPT09IF8xbikgcmV0dXJuIHA7IC8vIDFcbiAgICAgIGlmICh3bmFmLmhhc0NhY2hlKHRoaXMpKSByZXR1cm4gdGhpcy5tdWx0aXBseShzYyk7IC8vIHByZWNvbXB1dGVzXG4gICAgICAvLyBXZSBkb24ndCBoYXZlIG1ldGhvZCBmb3IgZG91YmxlIHNjYWxhciBtdWx0aXBsaWNhdGlvbiAoYVAgKyBiUSk6XG4gICAgICAvLyBFdmVuIHdpdGggdXNpbmcgU3RyYXVzcy1TaGFtaXIgdHJpY2ssIGl0J3MgMzUlIHNsb3dlciB0aGFuIG5hXHUwMEVGdmUgbXVsK2FkZC5cbiAgICAgIGlmIChlbmRvKSB7XG4gICAgICAgIGNvbnN0IHsgazFuZWcsIGsxLCBrMm5lZywgazIgfSA9IHNwbGl0RW5kb1NjYWxhck4oc2MpO1xuICAgICAgICBjb25zdCB7IHAxLCBwMiB9ID0gbXVsRW5kb1Vuc2FmZShQb2ludCwgcCwgazEsIGsyKTsgLy8gMzAlIGZhc3RlciB2cyB3bmFmLnVuc2FmZVxuICAgICAgICByZXR1cm4gZmluaXNoRW5kbyhlbmRvLmJldGEsIHAxLCBwMiwgazFuZWcsIGsybmVnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3bmFmLnVuc2FmZShwLCBzYyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgUHJvamVjdGl2ZSBwb2ludCB0byBhZmZpbmUgKHgsIHkpIGNvb3JkaW5hdGVzLlxuICAgICAqIEBwYXJhbSBpbnZlcnRlZFogWl4tMSAoaW52ZXJ0ZWQgemVybykgLSBvcHRpb25hbCwgcHJlY29tcHV0YXRpb24gaXMgdXNlZnVsIGZvciBpbnZlcnRCYXRjaFxuICAgICAqL1xuICAgIHRvQWZmaW5lKGludmVydGVkWj86IFQpOiBBZmZpbmVQb2ludDxUPiB7XG4gICAgICByZXR1cm4gdG9BZmZpbmVNZW1vKHRoaXMsIGludmVydGVkWik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgUG9pbnQgaXMgZnJlZSBvZiB0b3JzaW9uIGVsZW1lbnRzIChpcyBpbiBwcmltZSBzdWJncm91cCkuXG4gICAgICogQWx3YXlzIHRvcnNpb24tZnJlZSBmb3IgY29mYWN0b3I9MSBjdXJ2ZXMuXG4gICAgICovXG4gICAgaXNUb3JzaW9uRnJlZSgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IHsgaXNUb3JzaW9uRnJlZSB9ID0gZXh0cmFPcHRzO1xuICAgICAgaWYgKGNvZmFjdG9yID09PSBfMW4pIHJldHVybiB0cnVlO1xuICAgICAgaWYgKGlzVG9yc2lvbkZyZWUpIHJldHVybiBpc1RvcnNpb25GcmVlKFBvaW50LCB0aGlzKTtcbiAgICAgIHJldHVybiB3bmFmLnVuc2FmZSh0aGlzLCBDVVJWRV9PUkRFUikuaXMwKCk7XG4gICAgfVxuXG4gICAgY2xlYXJDb2ZhY3RvcigpOiBQb2ludCB7XG4gICAgICBjb25zdCB7IGNsZWFyQ29mYWN0b3IgfSA9IGV4dHJhT3B0cztcbiAgICAgIGlmIChjb2ZhY3RvciA9PT0gXzFuKSByZXR1cm4gdGhpczsgLy8gRmFzdC1wYXRoXG4gICAgICBpZiAoY2xlYXJDb2ZhY3RvcikgcmV0dXJuIGNsZWFyQ29mYWN0b3IoUG9pbnQsIHRoaXMpIGFzIFBvaW50O1xuICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHlVbnNhZmUoY29mYWN0b3IpO1xuICAgIH1cblxuICAgIGlzU21hbGxPcmRlcigpOiBib29sZWFuIHtcbiAgICAgIC8vIGNhbiB3ZSB1c2UgdGhpcy5jbGVhckNvZmFjdG9yKCk/XG4gICAgICByZXR1cm4gdGhpcy5tdWx0aXBseVVuc2FmZShjb2ZhY3RvcikuaXMwKCk7XG4gICAgfVxuXG4gICAgdG9CeXRlcyhpc0NvbXByZXNzZWQgPSB0cnVlKTogVWludDhBcnJheSB7XG4gICAgICBhYm9vbChpc0NvbXByZXNzZWQsICdpc0NvbXByZXNzZWQnKTtcbiAgICAgIHRoaXMuYXNzZXJ0VmFsaWRpdHkoKTtcbiAgICAgIHJldHVybiBlbmNvZGVQb2ludChQb2ludCwgdGhpcywgaXNDb21wcmVzc2VkKTtcbiAgICB9XG5cbiAgICB0b0hleChpc0NvbXByZXNzZWQgPSB0cnVlKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBieXRlc1RvSGV4KHRoaXMudG9CeXRlcyhpc0NvbXByZXNzZWQpKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiBgPFBvaW50ICR7dGhpcy5pczAoKSA/ICdaRVJPJyA6IHRoaXMudG9IZXgoKX0+YDtcbiAgICB9XG4gIH1cbiAgY29uc3QgYml0cyA9IEZuLkJJVFM7XG4gIGNvbnN0IHduYWYgPSBuZXcgd05BRihQb2ludCwgZXh0cmFPcHRzLmVuZG8gPyBNYXRoLmNlaWwoYml0cyAvIDIpIDogYml0cyk7XG4gIFBvaW50LkJBU0UucHJlY29tcHV0ZSg4KTsgLy8gRW5hYmxlIHByZWNvbXB1dGVzLiBTbG93cyBkb3duIGZpcnN0IHB1YmxpY0tleSBjb21wdXRhdGlvbiBieSAyMG1zLlxuICByZXR1cm4gUG9pbnQ7XG59XG5cbi8qKiBNZXRob2RzIG9mIEVDRFNBIHNpZ25hdHVyZSBpbnN0YW5jZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRUNEU0FTaWduYXR1cmUge1xuICByZWFkb25seSByOiBiaWdpbnQ7XG4gIHJlYWRvbmx5IHM6IGJpZ2ludDtcbiAgcmVhZG9ubHkgcmVjb3Zlcnk/OiBudW1iZXI7XG4gIGFkZFJlY292ZXJ5Qml0KHJlY292ZXJ5OiBudW1iZXIpOiBFQ0RTQVNpZ25hdHVyZSAmIHsgcmVhZG9ubHkgcmVjb3Zlcnk6IG51bWJlciB9O1xuICBoYXNIaWdoUygpOiBib29sZWFuO1xuICByZWNvdmVyUHVibGljS2V5KG1lc3NhZ2VIYXNoOiBVaW50OEFycmF5KTogV2VpZXJzdHJhc3NQb2ludDxiaWdpbnQ+O1xuICB0b0J5dGVzKGZvcm1hdD86IHN0cmluZyk6IFVpbnQ4QXJyYXk7XG4gIHRvSGV4KGZvcm1hdD86IHN0cmluZyk6IHN0cmluZztcbn1cbi8qKiBNZXRob2RzIG9mIEVDRFNBIHNpZ25hdHVyZSBjb25zdHJ1Y3Rvci4gKi9cbmV4cG9ydCB0eXBlIEVDRFNBU2lnbmF0dXJlQ29ucyA9IHtcbiAgbmV3IChyOiBiaWdpbnQsIHM6IGJpZ2ludCwgcmVjb3Zlcnk/OiBudW1iZXIpOiBFQ0RTQVNpZ25hdHVyZTtcbiAgZnJvbUJ5dGVzKGJ5dGVzOiBVaW50OEFycmF5LCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCk6IEVDRFNBU2lnbmF0dXJlO1xuICBmcm9tSGV4KGhleDogc3RyaW5nLCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCk6IEVDRFNBU2lnbmF0dXJlO1xufTtcblxuLy8gUG9pbnRzIHN0YXJ0IHdpdGggYnl0ZSAweDAyIHdoZW4geSBpcyBldmVuOyBvdGhlcndpc2UgMHgwM1xuZnVuY3Rpb24gcHByZWZpeChoYXNFdmVuWTogYm9vbGVhbik6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVWludDhBcnJheS5vZihoYXNFdmVuWSA/IDB4MDIgOiAweDAzKTtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2hhbGx1ZSBhbmQgdmFuIGRlIFdvZXN0aWpuZSBtZXRob2QgZm9yIGFueSB3ZWllcnN0cmFzcyBjdXJ2ZS5cbiAqIFRPRE86IGNoZWNrIGlmIHRoZXJlIGlzIGEgd2F5IHRvIG1lcmdlIHRoaXMgd2l0aCB1dlJhdGlvIGluIEVkd2FyZHM7IG1vdmUgdG8gbW9kdWxhci5cbiAqIGIgPSBUcnVlIGFuZCB5ID0gc3FydCh1IC8gdikgaWYgKHUgLyB2KSBpcyBzcXVhcmUgaW4gRiwgYW5kXG4gKiBiID0gRmFsc2UgYW5kIHkgPSBzcXJ0KFogKiAodSAvIHYpKSBvdGhlcndpc2UuXG4gKiBAcGFyYW0gRnBcbiAqIEBwYXJhbSBaXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gU1dVRnBTcXJ0UmF0aW88VD4oXG4gIEZwOiBJRmllbGQ8VD4sXG4gIFo6IFRcbik6ICh1OiBULCB2OiBUKSA9PiB7IGlzVmFsaWQ6IGJvb2xlYW47IHZhbHVlOiBUIH0ge1xuICAvLyBHZW5lcmljIGltcGxlbWVudGF0aW9uXG4gIGNvbnN0IHEgPSBGcC5PUkRFUjtcbiAgbGV0IGwgPSBfMG47XG4gIGZvciAobGV0IG8gPSBxIC0gXzFuOyBvICUgXzJuID09PSBfMG47IG8gLz0gXzJuKSBsICs9IF8xbjtcbiAgY29uc3QgYzEgPSBsOyAvLyAxLiBjMSwgdGhlIGxhcmdlc3QgaW50ZWdlciBzdWNoIHRoYXQgMl5jMSBkaXZpZGVzIHEgLSAxLlxuICAvLyBXZSBuZWVkIDJuICoqIGMxIGFuZCAybiAqKiAoYzEtMSkuIFdlIGNhbid0IHVzZSAqKjsgYnV0IHdlIGNhbiB1c2UgPDwuXG4gIC8vIDJuICoqIGMxID09IDJuIDw8IChjMS0xKVxuICBjb25zdCBfMm5fcG93X2MxXzEgPSBfMm4gPDwgKGMxIC0gXzFuIC0gXzFuKTtcbiAgY29uc3QgXzJuX3Bvd19jMSA9IF8ybl9wb3dfYzFfMSAqIF8ybjtcbiAgY29uc3QgYzIgPSAocSAtIF8xbikgLyBfMm5fcG93X2MxOyAvLyAyLiBjMiA9IChxIC0gMSkgLyAoMl5jMSkgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGMzID0gKGMyIC0gXzFuKSAvIF8ybjsgLy8gMy4gYzMgPSAoYzIgLSAxKSAvIDIgICAgICAgICAgICAjIEludGVnZXIgYXJpdGhtZXRpY1xuICBjb25zdCBjNCA9IF8ybl9wb3dfYzEgLSBfMW47IC8vIDQuIGM0ID0gMl5jMSAtIDEgICAgICAgICAgICAgICAgIyBJbnRlZ2VyIGFyaXRobWV0aWNcbiAgY29uc3QgYzUgPSBfMm5fcG93X2MxXzE7IC8vIDUuIGM1ID0gMl4oYzEgLSAxKSAgICAgICAgICAgICAgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gIGNvbnN0IGM2ID0gRnAucG93KFosIGMyKTsgLy8gNi4gYzYgPSBaXmMyXG4gIGNvbnN0IGM3ID0gRnAucG93KFosIChjMiArIF8xbikgLyBfMm4pOyAvLyA3LiBjNyA9IFpeKChjMiArIDEpIC8gMilcbiAgbGV0IHNxcnRSYXRpbyA9ICh1OiBULCB2OiBUKTogeyBpc1ZhbGlkOiBib29sZWFuOyB2YWx1ZTogVCB9ID0+IHtcbiAgICBsZXQgdHYxID0gYzY7IC8vIDEuIHR2MSA9IGM2XG4gICAgbGV0IHR2MiA9IEZwLnBvdyh2LCBjNCk7IC8vIDIuIHR2MiA9IHZeYzRcbiAgICBsZXQgdHYzID0gRnAuc3FyKHR2Mik7IC8vIDMuIHR2MyA9IHR2Ml4yXG4gICAgdHYzID0gRnAubXVsKHR2Mywgdik7IC8vIDQuIHR2MyA9IHR2MyAqIHZcbiAgICBsZXQgdHY1ID0gRnAubXVsKHUsIHR2Myk7IC8vIDUuIHR2NSA9IHUgKiB0djNcbiAgICB0djUgPSBGcC5wb3codHY1LCBjMyk7IC8vIDYuIHR2NSA9IHR2NV5jM1xuICAgIHR2NSA9IEZwLm11bCh0djUsIHR2Mik7IC8vIDcuIHR2NSA9IHR2NSAqIHR2MlxuICAgIHR2MiA9IEZwLm11bCh0djUsIHYpOyAvLyA4LiB0djIgPSB0djUgKiB2XG4gICAgdHYzID0gRnAubXVsKHR2NSwgdSk7IC8vIDkuIHR2MyA9IHR2NSAqIHVcbiAgICBsZXQgdHY0ID0gRnAubXVsKHR2MywgdHYyKTsgLy8gMTAuIHR2NCA9IHR2MyAqIHR2MlxuICAgIHR2NSA9IEZwLnBvdyh0djQsIGM1KTsgLy8gMTEuIHR2NSA9IHR2NF5jNVxuICAgIGxldCBpc1FSID0gRnAuZXFsKHR2NSwgRnAuT05FKTsgLy8gMTIuIGlzUVIgPSB0djUgPT0gMVxuICAgIHR2MiA9IEZwLm11bCh0djMsIGM3KTsgLy8gMTMuIHR2MiA9IHR2MyAqIGM3XG4gICAgdHY1ID0gRnAubXVsKHR2NCwgdHYxKTsgLy8gMTQuIHR2NSA9IHR2NCAqIHR2MVxuICAgIHR2MyA9IEZwLmNtb3YodHYyLCB0djMsIGlzUVIpOyAvLyAxNS4gdHYzID0gQ01PVih0djIsIHR2MywgaXNRUilcbiAgICB0djQgPSBGcC5jbW92KHR2NSwgdHY0LCBpc1FSKTsgLy8gMTYuIHR2NCA9IENNT1YodHY1LCB0djQsIGlzUVIpXG4gICAgLy8gMTcuIGZvciBpIGluIChjMSwgYzEgLSAxLCAuLi4sIDIpOlxuICAgIGZvciAobGV0IGkgPSBjMTsgaSA+IF8xbjsgaS0tKSB7XG4gICAgICBsZXQgdHY1ID0gaSAtIF8ybjsgLy8gMTguICAgIHR2NSA9IGkgLSAyXG4gICAgICB0djUgPSBfMm4gPDwgKHR2NSAtIF8xbik7IC8vIDE5LiAgICB0djUgPSAyXnR2NVxuICAgICAgbGV0IHR2djUgPSBGcC5wb3codHY0LCB0djUpOyAvLyAyMC4gICAgdHY1ID0gdHY0XnR2NVxuICAgICAgY29uc3QgZTEgPSBGcC5lcWwodHZ2NSwgRnAuT05FKTsgLy8gMjEuICAgIGUxID0gdHY1ID09IDFcbiAgICAgIHR2MiA9IEZwLm11bCh0djMsIHR2MSk7IC8vIDIyLiAgICB0djIgPSB0djMgKiB0djFcbiAgICAgIHR2MSA9IEZwLm11bCh0djEsIHR2MSk7IC8vIDIzLiAgICB0djEgPSB0djEgKiB0djFcbiAgICAgIHR2djUgPSBGcC5tdWwodHY0LCB0djEpOyAvLyAyNC4gICAgdHY1ID0gdHY0ICogdHYxXG4gICAgICB0djMgPSBGcC5jbW92KHR2MiwgdHYzLCBlMSk7IC8vIDI1LiAgICB0djMgPSBDTU9WKHR2MiwgdHYzLCBlMSlcbiAgICAgIHR2NCA9IEZwLmNtb3YodHZ2NSwgdHY0LCBlMSk7IC8vIDI2LiAgICB0djQgPSBDTU9WKHR2NSwgdHY0LCBlMSlcbiAgICB9XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogaXNRUiwgdmFsdWU6IHR2MyB9O1xuICB9O1xuICBpZiAoRnAuT1JERVIgJSBfNG4gPT09IF8zbikge1xuICAgIC8vIHNxcnRfcmF0aW9fM21vZDQodSwgdilcbiAgICBjb25zdCBjMSA9IChGcC5PUkRFUiAtIF8zbikgLyBfNG47IC8vIDEuIGMxID0gKHEgLSAzKSAvIDQgICAgICMgSW50ZWdlciBhcml0aG1ldGljXG4gICAgY29uc3QgYzIgPSBGcC5zcXJ0KEZwLm5lZyhaKSk7IC8vIDIuIGMyID0gc3FydCgtWilcbiAgICBzcXJ0UmF0aW8gPSAodTogVCwgdjogVCkgPT4ge1xuICAgICAgbGV0IHR2MSA9IEZwLnNxcih2KTsgLy8gMS4gdHYxID0gdl4yXG4gICAgICBjb25zdCB0djIgPSBGcC5tdWwodSwgdik7IC8vIDIuIHR2MiA9IHUgKiB2XG4gICAgICB0djEgPSBGcC5tdWwodHYxLCB0djIpOyAvLyAzLiB0djEgPSB0djEgKiB0djJcbiAgICAgIGxldCB5MSA9IEZwLnBvdyh0djEsIGMxKTsgLy8gNC4geTEgPSB0djFeYzFcbiAgICAgIHkxID0gRnAubXVsKHkxLCB0djIpOyAvLyA1LiB5MSA9IHkxICogdHYyXG4gICAgICBjb25zdCB5MiA9IEZwLm11bCh5MSwgYzIpOyAvLyA2LiB5MiA9IHkxICogYzJcbiAgICAgIGNvbnN0IHR2MyA9IEZwLm11bChGcC5zcXIoeTEpLCB2KTsgLy8gNy4gdHYzID0geTFeMjsgOC4gdHYzID0gdHYzICogdlxuICAgICAgY29uc3QgaXNRUiA9IEZwLmVxbCh0djMsIHUpOyAvLyA5LiBpc1FSID0gdHYzID09IHVcbiAgICAgIGxldCB5ID0gRnAuY21vdih5MiwgeTEsIGlzUVIpOyAvLyAxMC4geSA9IENNT1YoeTIsIHkxLCBpc1FSKVxuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogaXNRUiwgdmFsdWU6IHkgfTsgLy8gMTEuIHJldHVybiAoaXNRUiwgeSkgaXNRUiA/IHkgOiB5KmMyXG4gICAgfTtcbiAgfVxuICAvLyBObyBjdXJ2ZXMgdXNlcyB0aGF0XG4gIC8vIGlmIChGcC5PUkRFUiAlIF84biA9PT0gXzVuKSAvLyBzcXJ0X3JhdGlvXzVtb2Q4XG4gIHJldHVybiBzcXJ0UmF0aW87XG59XG4vKipcbiAqIFNpbXBsaWZpZWQgU2hhbGx1ZS12YW4gZGUgV29lc3Rpam5lLVVsYXMgTWV0aG9kXG4gKiBodHRwczovL3d3dy5yZmMtZWRpdG9yLm9yZy9yZmMvcmZjOTM4MCNzZWN0aW9uLTYuNi4yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb0N1cnZlU2ltcGxlU1dVPFQ+KFxuICBGcDogSUZpZWxkPFQ+LFxuICBvcHRzOiB7XG4gICAgQTogVDtcbiAgICBCOiBUO1xuICAgIFo6IFQ7XG4gIH1cbik6ICh1OiBUKSA9PiB7IHg6IFQ7IHk6IFQgfSB7XG4gIHZhbGlkYXRlRmllbGQoRnApO1xuICBjb25zdCB7IEEsIEIsIFogfSA9IG9wdHM7XG4gIGlmICghRnAuaXNWYWxpZChBKSB8fCAhRnAuaXNWYWxpZChCKSB8fCAhRnAuaXNWYWxpZChaKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcFRvQ3VydmVTaW1wbGVTV1U6IGludmFsaWQgb3B0cycpO1xuICBjb25zdCBzcXJ0UmF0aW8gPSBTV1VGcFNxcnRSYXRpbyhGcCwgWik7XG4gIGlmICghRnAuaXNPZGQpIHRocm93IG5ldyBFcnJvcignRmllbGQgZG9lcyBub3QgaGF2ZSAuaXNPZGQoKScpO1xuICAvLyBJbnB1dDogdSwgYW4gZWxlbWVudCBvZiBGLlxuICAvLyBPdXRwdXQ6ICh4LCB5KSwgYSBwb2ludCBvbiBFLlxuICByZXR1cm4gKHU6IFQpOiB7IHg6IFQ7IHk6IFQgfSA9PiB7XG4gICAgLy8gcHJldHRpZXItaWdub3JlXG4gICAgbGV0IHR2MSwgdHYyLCB0djMsIHR2NCwgdHY1LCB0djYsIHgsIHk7XG4gICAgdHYxID0gRnAuc3FyKHUpOyAvLyAxLiAgdHYxID0gdV4yXG4gICAgdHYxID0gRnAubXVsKHR2MSwgWik7IC8vIDIuICB0djEgPSBaICogdHYxXG4gICAgdHYyID0gRnAuc3FyKHR2MSk7IC8vIDMuICB0djIgPSB0djFeMlxuICAgIHR2MiA9IEZwLmFkZCh0djIsIHR2MSk7IC8vIDQuICB0djIgPSB0djIgKyB0djFcbiAgICB0djMgPSBGcC5hZGQodHYyLCBGcC5PTkUpOyAvLyA1LiAgdHYzID0gdHYyICsgMVxuICAgIHR2MyA9IEZwLm11bCh0djMsIEIpOyAvLyA2LiAgdHYzID0gQiAqIHR2M1xuICAgIHR2NCA9IEZwLmNtb3YoWiwgRnAubmVnKHR2MiksICFGcC5lcWwodHYyLCBGcC5aRVJPKSk7IC8vIDcuICB0djQgPSBDTU9WKFosIC10djIsIHR2MiAhPSAwKVxuICAgIHR2NCA9IEZwLm11bCh0djQsIEEpOyAvLyA4LiAgdHY0ID0gQSAqIHR2NFxuICAgIHR2MiA9IEZwLnNxcih0djMpOyAvLyA5LiAgdHYyID0gdHYzXjJcbiAgICB0djYgPSBGcC5zcXIodHY0KTsgLy8gMTAuIHR2NiA9IHR2NF4yXG4gICAgdHY1ID0gRnAubXVsKHR2NiwgQSk7IC8vIDExLiB0djUgPSBBICogdHY2XG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHY1KTsgLy8gMTIuIHR2MiA9IHR2MiArIHR2NVxuICAgIHR2MiA9IEZwLm11bCh0djIsIHR2Myk7IC8vIDEzLiB0djIgPSB0djIgKiB0djNcbiAgICB0djYgPSBGcC5tdWwodHY2LCB0djQpOyAvLyAxNC4gdHY2ID0gdHY2ICogdHY0XG4gICAgdHY1ID0gRnAubXVsKHR2NiwgQik7IC8vIDE1LiB0djUgPSBCICogdHY2XG4gICAgdHYyID0gRnAuYWRkKHR2MiwgdHY1KTsgLy8gMTYuIHR2MiA9IHR2MiArIHR2NVxuICAgIHggPSBGcC5tdWwodHYxLCB0djMpOyAvLyAxNy4gICB4ID0gdHYxICogdHYzXG4gICAgY29uc3QgeyBpc1ZhbGlkLCB2YWx1ZSB9ID0gc3FydFJhdGlvKHR2MiwgdHY2KTsgLy8gMTguIChpc19neDFfc3F1YXJlLCB5MSkgPSBzcXJ0X3JhdGlvKHR2MiwgdHY2KVxuICAgIHkgPSBGcC5tdWwodHYxLCB1KTsgLy8gMTkuICAgeSA9IHR2MSAqIHUgIC0+IFogKiB1XjMgKiB5MVxuICAgIHkgPSBGcC5tdWwoeSwgdmFsdWUpOyAvLyAyMC4gICB5ID0geSAqIHkxXG4gICAgeCA9IEZwLmNtb3YoeCwgdHYzLCBpc1ZhbGlkKTsgLy8gMjEuICAgeCA9IENNT1YoeCwgdHYzLCBpc19neDFfc3F1YXJlKVxuICAgIHkgPSBGcC5jbW92KHksIHZhbHVlLCBpc1ZhbGlkKTsgLy8gMjIuICAgeSA9IENNT1YoeSwgeTEsIGlzX2d4MV9zcXVhcmUpXG4gICAgY29uc3QgZTEgPSBGcC5pc09kZCEodSkgPT09IEZwLmlzT2RkISh5KTsgLy8gMjMuICBlMSA9IHNnbjAodSkgPT0gc2duMCh5KVxuICAgIHkgPSBGcC5jbW92KEZwLm5lZyh5KSwgeSwgZTEpOyAvLyAyNC4gICB5ID0gQ01PVigteSwgeSwgZTEpXG4gICAgY29uc3QgdHY0X2ludiA9IEZwSW52ZXJ0QmF0Y2goRnAsIFt0djRdLCB0cnVlKVswXTtcbiAgICB4ID0gRnAubXVsKHgsIHR2NF9pbnYpOyAvLyAyNS4gICB4ID0geCAvIHR2NFxuICAgIHJldHVybiB7IHgsIHkgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0V0xlbmd0aHM8VD4oRnA6IElGaWVsZDxUPiwgRm46IElGaWVsZDxiaWdpbnQ+KSB7XG4gIHJldHVybiB7XG4gICAgc2VjcmV0S2V5OiBGbi5CWVRFUyxcbiAgICBwdWJsaWNLZXk6IDEgKyBGcC5CWVRFUyxcbiAgICBwdWJsaWNLZXlVbmNvbXByZXNzZWQ6IDEgKyAyICogRnAuQllURVMsXG4gICAgcHVibGljS2V5SGFzUHJlZml4OiB0cnVlLFxuICAgIHNpZ25hdHVyZTogMiAqIEZuLkJZVEVTLFxuICB9O1xufVxuXG4vKipcbiAqIFNvbWV0aW1lcyB1c2VycyBvbmx5IG5lZWQgZ2V0UHVibGljS2V5LCBnZXRTaGFyZWRTZWNyZXQsIGFuZCBzZWNyZXQga2V5IGhhbmRsaW5nLlxuICogVGhpcyBoZWxwZXIgZW5zdXJlcyBubyBzaWduYXR1cmUgZnVuY3Rpb25hbGl0eSBpcyBwcmVzZW50LiBMZXNzIGNvZGUsIHNtYWxsZXIgYnVuZGxlIHNpemUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlY2RoKFxuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PixcbiAgZWNkaE9wdHM6IHsgcmFuZG9tQnl0ZXM/OiAoYnl0ZXNMZW5ndGg/OiBudW1iZXIpID0+IFVpbnQ4QXJyYXkgfSA9IHt9XG4pOiBFQ0RIIHtcbiAgY29uc3QgeyBGbiB9ID0gUG9pbnQ7XG4gIGNvbnN0IHJhbmRvbUJ5dGVzXyA9IGVjZGhPcHRzLnJhbmRvbUJ5dGVzIHx8IHdjUmFuZG9tQnl0ZXM7XG4gIGNvbnN0IGxlbmd0aHMgPSBPYmplY3QuYXNzaWduKGdldFdMZW5ndGhzKFBvaW50LkZwLCBGbiksIHsgc2VlZDogZ2V0TWluSGFzaExlbmd0aChGbi5PUkRFUikgfSk7XG5cbiAgZnVuY3Rpb24gaXNWYWxpZFNlY3JldEtleShzZWNyZXRLZXk6IFVpbnQ4QXJyYXkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbnVtID0gRm4uZnJvbUJ5dGVzKHNlY3JldEtleSk7XG4gICAgICByZXR1cm4gRm4uaXNWYWxpZE5vdDAobnVtKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVmFsaWRQdWJsaWNLZXkocHVibGljS2V5OiBVaW50OEFycmF5LCBpc0NvbXByZXNzZWQ/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBwdWJsaWNLZXk6IGNvbXAsIHB1YmxpY0tleVVuY29tcHJlc3NlZCB9ID0gbGVuZ3RocztcbiAgICB0cnkge1xuICAgICAgY29uc3QgbCA9IHB1YmxpY0tleS5sZW5ndGg7XG4gICAgICBpZiAoaXNDb21wcmVzc2VkID09PSB0cnVlICYmIGwgIT09IGNvbXApIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChpc0NvbXByZXNzZWQgPT09IGZhbHNlICYmIGwgIT09IHB1YmxpY0tleVVuY29tcHJlc3NlZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuICEhUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgY3J5cHRvZ3JhcGhpY2FsbHkgc2VjdXJlIHNlY3JldCBrZXkgZnJvbSByYW5kb20gb2Ygc2l6ZVxuICAgKiAoZ3JvdXBMZW4gKyBjZWlsKGdyb3VwTGVuIC8gMikpIHdpdGggbW9kdWxvIGJpYXMgYmVpbmcgbmVnbGlnaWJsZS5cbiAgICovXG4gIGZ1bmN0aW9uIHJhbmRvbVNlY3JldEtleShzZWVkID0gcmFuZG9tQnl0ZXNfKGxlbmd0aHMuc2VlZCkpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbWFwSGFzaFRvRmllbGQoYWJ5dGVzKHNlZWQsIGxlbmd0aHMuc2VlZCwgJ3NlZWQnKSwgRm4uT1JERVIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHB1YmxpYyBrZXkgZm9yIGEgc2VjcmV0IGtleS4gQ2hlY2tzIGZvciB2YWxpZGl0eSBvZiB0aGUgc2VjcmV0IGtleS5cbiAgICogQHBhcmFtIGlzQ29tcHJlc3NlZCB3aGV0aGVyIHRvIHJldHVybiBjb21wYWN0IChkZWZhdWx0KSwgb3IgZnVsbCBrZXlcbiAgICogQHJldHVybnMgUHVibGljIGtleSwgZnVsbCB3aGVuIGlzQ29tcHJlc3NlZD1mYWxzZTsgc2hvcnQgd2hlbiBpc0NvbXByZXNzZWQ9dHJ1ZVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UHVibGljS2V5KHNlY3JldEtleTogVWludDhBcnJheSwgaXNDb21wcmVzc2VkID0gdHJ1ZSk6IFVpbnQ4QXJyYXkge1xuICAgIHJldHVybiBQb2ludC5CQVNFLm11bHRpcGx5KEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpKS50b0J5dGVzKGlzQ29tcHJlc3NlZCk7XG4gIH1cblxuICAvKipcbiAgICogUXVpY2sgYW5kIGRpcnR5IGNoZWNrIGZvciBpdGVtIGJlaW5nIHB1YmxpYyBrZXkuIERvZXMgbm90IHZhbGlkYXRlIGhleCwgb3IgYmVpbmcgb24tY3VydmUuXG4gICAqL1xuICBmdW5jdGlvbiBpc1Byb2JQdWIoaXRlbTogVWludDhBcnJheSk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgc2VjcmV0S2V5LCBwdWJsaWNLZXksIHB1YmxpY0tleVVuY29tcHJlc3NlZCB9ID0gbGVuZ3RocztcbiAgICBpZiAoIWlzQnl0ZXMoaXRlbSkpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgaWYgKCgnX2xlbmd0aHMnIGluIEZuICYmIEZuLl9sZW5ndGhzKSB8fCBzZWNyZXRLZXkgPT09IHB1YmxpY0tleSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBjb25zdCBsID0gYWJ5dGVzKGl0ZW0sIHVuZGVmaW5lZCwgJ2tleScpLmxlbmd0aDtcbiAgICByZXR1cm4gbCA9PT0gcHVibGljS2V5IHx8IGwgPT09IHB1YmxpY0tleVVuY29tcHJlc3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFQ0RIIChFbGxpcHRpYyBDdXJ2ZSBEaWZmaWUgSGVsbG1hbikuXG4gICAqIENvbXB1dGVzIHNoYXJlZCBwdWJsaWMga2V5IGZyb20gc2VjcmV0IGtleSBBIGFuZCBwdWJsaWMga2V5IEIuXG4gICAqIENoZWNrczogMSkgc2VjcmV0IGtleSB2YWxpZGl0eSAyKSBzaGFyZWQga2V5IGlzIG9uLWN1cnZlLlxuICAgKiBEb2VzIE5PVCBoYXNoIHRoZSByZXN1bHQuXG4gICAqIEBwYXJhbSBpc0NvbXByZXNzZWQgd2hldGhlciB0byByZXR1cm4gY29tcGFjdCAoZGVmYXVsdCksIG9yIGZ1bGwga2V5XG4gICAqIEByZXR1cm5zIHNoYXJlZCBwdWJsaWMga2V5XG4gICAqL1xuICBmdW5jdGlvbiBnZXRTaGFyZWRTZWNyZXQoXG4gICAgc2VjcmV0S2V5QTogVWludDhBcnJheSxcbiAgICBwdWJsaWNLZXlCOiBVaW50OEFycmF5LFxuICAgIGlzQ29tcHJlc3NlZCA9IHRydWVcbiAgKTogVWludDhBcnJheSB7XG4gICAgaWYgKGlzUHJvYlB1YihzZWNyZXRLZXlBKSA9PT0gdHJ1ZSkgdGhyb3cgbmV3IEVycm9yKCdmaXJzdCBhcmcgbXVzdCBiZSBwcml2YXRlIGtleScpO1xuICAgIGlmIChpc1Byb2JQdWIocHVibGljS2V5QikgPT09IGZhbHNlKSB0aHJvdyBuZXcgRXJyb3IoJ3NlY29uZCBhcmcgbXVzdCBiZSBwdWJsaWMga2V5Jyk7XG4gICAgY29uc3QgcyA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXlBKTtcbiAgICBjb25zdCBiID0gUG9pbnQuZnJvbUJ5dGVzKHB1YmxpY0tleUIpOyAvLyBjaGVja3MgZm9yIGJlaW5nIG9uLWN1cnZlXG4gICAgcmV0dXJuIGIubXVsdGlwbHkocykudG9CeXRlcyhpc0NvbXByZXNzZWQpO1xuICB9XG5cbiAgY29uc3QgdXRpbHMgPSB7XG4gICAgaXNWYWxpZFNlY3JldEtleSxcbiAgICBpc1ZhbGlkUHVibGljS2V5LFxuICAgIHJhbmRvbVNlY3JldEtleSxcbiAgfTtcbiAgY29uc3Qga2V5Z2VuID0gY3JlYXRlS2V5Z2VuKHJhbmRvbVNlY3JldEtleSwgZ2V0UHVibGljS2V5KTtcblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7IGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCBrZXlnZW4sIFBvaW50LCB1dGlscywgbGVuZ3RocyB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIEVDRFNBIHNpZ25pbmcgaW50ZXJmYWNlIGZvciBnaXZlbiBlbGxpcHRpYyBjdXJ2ZSBgUG9pbnRgIGFuZCBgaGFzaGAgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIFBvaW50IGNyZWF0ZWQgdXNpbmcge0BsaW5rIHdlaWVyc3RyYXNzfSBmdW5jdGlvblxuICogQHBhcmFtIGhhc2ggdXNlZCBmb3IgMSkgbWVzc2FnZSBwcmVoYXNoLWluZyAyKSBrIGdlbmVyYXRpb24gaW4gYHNpZ25gLCB1c2luZyBobWFjX2RyYmcoaGFzaClcbiAqIEBwYXJhbSBlY2RzYU9wdHMgcmFyZWx5IG5lZWRlZCwgc2VlIHtAbGluayBFQ0RTQU9wdHN9XG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiBjb25zdCBwMjU2X1BvaW50ID0gd2VpZXJzdHJhc3MoLi4uKTtcbiAqIGNvbnN0IHAyNTZfc2hhMjU2ID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjU2KTtcbiAqIGNvbnN0IHAyNTZfc2hhMjI0ID0gZWNkc2EocDI1Nl9Qb2ludCwgc2hhMjI0KTtcbiAqIGNvbnN0IHAyNTZfc2hhMjI0X3IgPSBlY2RzYShwMjU2X1BvaW50LCBzaGEyMjQsIHsgcmFuZG9tQnl0ZXM6IChsZW5ndGgpID0+IHsgLi4uIH0gfSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVjZHNhKFxuICBQb2ludDogV2VpZXJzdHJhc3NQb2ludENvbnM8YmlnaW50PixcbiAgaGFzaDogQ0hhc2gsXG4gIGVjZHNhT3B0czogRUNEU0FPcHRzID0ge31cbik6IEVDRFNBIHtcbiAgYWhhc2goaGFzaCk7XG4gIHZhbGlkYXRlT2JqZWN0KFxuICAgIGVjZHNhT3B0cyxcbiAgICB7fSxcbiAgICB7XG4gICAgICBobWFjOiAnZnVuY3Rpb24nLFxuICAgICAgbG93UzogJ2Jvb2xlYW4nLFxuICAgICAgcmFuZG9tQnl0ZXM6ICdmdW5jdGlvbicsXG4gICAgICBiaXRzMmludDogJ2Z1bmN0aW9uJyxcbiAgICAgIGJpdHMyaW50X21vZE46ICdmdW5jdGlvbicsXG4gICAgfVxuICApO1xuICBlY2RzYU9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBlY2RzYU9wdHMpO1xuICBjb25zdCByYW5kb21CeXRlcyA9IGVjZHNhT3B0cy5yYW5kb21CeXRlcyB8fCB3Y1JhbmRvbUJ5dGVzO1xuICBjb25zdCBobWFjID0gZWNkc2FPcHRzLmhtYWMgfHwgKChrZXksIG1zZykgPT4gbm9ibGVIbWFjKGhhc2gsIGtleSwgbXNnKSk7XG5cbiAgY29uc3QgeyBGcCwgRm4gfSA9IFBvaW50O1xuICBjb25zdCB7IE9SREVSOiBDVVJWRV9PUkRFUiwgQklUUzogZm5CaXRzIH0gPSBGbjtcbiAgY29uc3QgeyBrZXlnZW4sIGdldFB1YmxpY0tleSwgZ2V0U2hhcmVkU2VjcmV0LCB1dGlscywgbGVuZ3RocyB9ID0gZWNkaChQb2ludCwgZWNkc2FPcHRzKTtcbiAgY29uc3QgZGVmYXVsdFNpZ09wdHM6IFJlcXVpcmVkPEVDRFNBU2lnbk9wdHM+ID0ge1xuICAgIHByZWhhc2g6IHRydWUsXG4gICAgbG93UzogdHlwZW9mIGVjZHNhT3B0cy5sb3dTID09PSAnYm9vbGVhbicgPyBlY2RzYU9wdHMubG93UyA6IHRydWUsXG4gICAgZm9ybWF0OiAnY29tcGFjdCcgYXMgRUNEU0FTaWduYXR1cmVGb3JtYXQsXG4gICAgZXh0cmFFbnRyb3B5OiBmYWxzZSxcbiAgfTtcbiAgY29uc3QgaGFzTGFyZ2VDb2ZhY3RvciA9IENVUlZFX09SREVSICogXzJuIDwgRnAuT1JERVI7IC8vIFdvbid0IENVUlZFKCkuaCA+IDJuIGJlIG1vcmUgZWZmZWN0aXZlP1xuXG4gIGZ1bmN0aW9uIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcihudW1iZXI6IGJpZ2ludCkge1xuICAgIGNvbnN0IEhBTEYgPSBDVVJWRV9PUkRFUiA+PiBfMW47XG4gICAgcmV0dXJuIG51bWJlciA+IEhBTEY7XG4gIH1cbiAgZnVuY3Rpb24gdmFsaWRhdGVSUyh0aXRsZTogc3RyaW5nLCBudW06IGJpZ2ludCk6IGJpZ2ludCB7XG4gICAgaWYgKCFGbi5pc1ZhbGlkTm90MChudW0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHNpZ25hdHVyZSAke3RpdGxlfTogb3V0IG9mIHJhbmdlIDEuLlBvaW50LkZuLk9SREVSYCk7XG4gICAgcmV0dXJuIG51bTtcbiAgfVxuICBmdW5jdGlvbiBhc3NlcnRTbWFsbENvZmFjdG9yKCk6IHZvaWQge1xuICAgIC8vIEVDRFNBIHJlY292ZXJ5IGlzIGhhcmQgZm9yIGNvZmFjdG9yID4gMSBjdXJ2ZXMuXG4gICAgLy8gSW4gc2lnbiwgYHIgPSBxLnggbW9kIG5gLCBhbmQgaGVyZSB3ZSByZWNvdmVyIHEueCBmcm9tIHIuXG4gICAgLy8gV2hpbGUgcmVjb3ZlcmluZyBxLnggPj0gbiwgd2UgbmVlZCB0byBhZGQgcituIGZvciBjb2ZhY3Rvcj0xIGN1cnZlcy5cbiAgICAvLyBIb3dldmVyLCBmb3IgY29mYWN0b3I+MSwgcituIG1heSBub3QgZ2V0IHEueDpcbiAgICAvLyByK24qaSB3b3VsZCBuZWVkIHRvIGJlIGRvbmUgaW5zdGVhZCB3aGVyZSBpIGlzIHVua25vd24uXG4gICAgLy8gVG8gZWFzaWx5IGdldCBpLCB3ZSBlaXRoZXIgbmVlZCB0bzpcbiAgICAvLyBhLiBpbmNyZWFzZSBhbW91bnQgb2YgdmFsaWQgcmVjaWQgdmFsdWVzICg0LCA1Li4uKTsgT1JcbiAgICAvLyBiLiBwcm9oaWJpdCBub24tcHJpbWUtb3JkZXIgc2lnbmF0dXJlcyAocmVjaWQgPiAxKS5cbiAgICBpZiAoaGFzTGFyZ2VDb2ZhY3RvcilcbiAgICAgIHRocm93IG5ldyBFcnJvcignXCJyZWNvdmVyZWRcIiBzaWcgdHlwZSBpcyBub3Qgc3VwcG9ydGVkIGZvciBjb2ZhY3RvciA+MiBjdXJ2ZXMnKTtcbiAgfVxuICBmdW5jdGlvbiB2YWxpZGF0ZVNpZ0xlbmd0aChieXRlczogVWludDhBcnJheSwgZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgIHZhbGlkYXRlU2lnRm9ybWF0KGZvcm1hdCk7XG4gICAgY29uc3Qgc2l6ZSA9IGxlbmd0aHMuc2lnbmF0dXJlITtcbiAgICBjb25zdCBzaXplciA9IGZvcm1hdCA9PT0gJ2NvbXBhY3QnID8gc2l6ZSA6IGZvcm1hdCA9PT0gJ3JlY292ZXJlZCcgPyBzaXplICsgMSA6IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gYWJ5dGVzKGJ5dGVzLCBzaXplcik7XG4gIH1cblxuICAvKipcbiAgICogRUNEU0Egc2lnbmF0dXJlIHdpdGggaXRzIChyLCBzKSBwcm9wZXJ0aWVzLiBTdXBwb3J0cyBjb21wYWN0LCByZWNvdmVyZWQgJiBERVIgcmVwcmVzZW50YXRpb25zLlxuICAgKi9cbiAgY2xhc3MgU2lnbmF0dXJlIGltcGxlbWVudHMgRUNEU0FTaWduYXR1cmUge1xuICAgIHJlYWRvbmx5IHI6IGJpZ2ludDtcbiAgICByZWFkb25seSBzOiBiaWdpbnQ7XG4gICAgcmVhZG9ubHkgcmVjb3Zlcnk/OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihyOiBiaWdpbnQsIHM6IGJpZ2ludCwgcmVjb3Zlcnk/OiBudW1iZXIpIHtcbiAgICAgIHRoaXMuciA9IHZhbGlkYXRlUlMoJ3InLCByKTsgLy8gciBpbiBbMS4uTi0xXTtcbiAgICAgIHRoaXMucyA9IHZhbGlkYXRlUlMoJ3MnLCBzKTsgLy8gcyBpbiBbMS4uTi0xXTtcbiAgICAgIGlmIChyZWNvdmVyeSAhPSBudWxsKSB7XG4gICAgICAgIGFzc2VydFNtYWxsQ29mYWN0b3IoKTtcbiAgICAgICAgaWYgKCFbMCwgMSwgMiwgM10uaW5jbHVkZXMocmVjb3ZlcnkpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcmVjb3ZlcnkgaWQnKTtcbiAgICAgICAgdGhpcy5yZWNvdmVyeSA9IHJlY292ZXJ5O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZnJvbUJ5dGVzKFxuICAgICAgYnl0ZXM6IFVpbnQ4QXJyYXksXG4gICAgICBmb3JtYXQ6IEVDRFNBU2lnbmF0dXJlRm9ybWF0ID0gZGVmYXVsdFNpZ09wdHMuZm9ybWF0XG4gICAgKTogU2lnbmF0dXJlIHtcbiAgICAgIHZhbGlkYXRlU2lnTGVuZ3RoKGJ5dGVzLCBmb3JtYXQpO1xuICAgICAgbGV0IHJlY2lkOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoZm9ybWF0ID09PSAnZGVyJykge1xuICAgICAgICBjb25zdCB7IHIsIHMgfSA9IERFUi50b1NpZyhhYnl0ZXMoYnl0ZXMpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTaWduYXR1cmUociwgcyk7XG4gICAgICB9XG4gICAgICBpZiAoZm9ybWF0ID09PSAncmVjb3ZlcmVkJykge1xuICAgICAgICByZWNpZCA9IGJ5dGVzWzBdO1xuICAgICAgICBmb3JtYXQgPSAnY29tcGFjdCc7XG4gICAgICAgIGJ5dGVzID0gYnl0ZXMuc3ViYXJyYXkoMSk7XG4gICAgICB9XG4gICAgICBjb25zdCBMID0gbGVuZ3Rocy5zaWduYXR1cmUhIC8gMjtcbiAgICAgIGNvbnN0IHIgPSBieXRlcy5zdWJhcnJheSgwLCBMKTtcbiAgICAgIGNvbnN0IHMgPSBieXRlcy5zdWJhcnJheShMLCBMICogMik7XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZShGbi5mcm9tQnl0ZXMociksIEZuLmZyb21CeXRlcyhzKSwgcmVjaWQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmcm9tSGV4KGhleDogc3RyaW5nLCBmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZnJvbUJ5dGVzKGhleFRvQnl0ZXMoaGV4KSwgZm9ybWF0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzc2VydFJlY292ZXJ5KCk6IG51bWJlciB7XG4gICAgICBjb25zdCB7IHJlY292ZXJ5IH0gPSB0aGlzO1xuICAgICAgaWYgKHJlY292ZXJ5ID09IG51bGwpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCByZWNvdmVyeSBpZDogbXVzdCBiZSBwcmVzZW50Jyk7XG4gICAgICByZXR1cm4gcmVjb3Zlcnk7XG4gICAgfVxuXG4gICAgYWRkUmVjb3ZlcnlCaXQocmVjb3Zlcnk6IG51bWJlcik6IFJlY292ZXJlZFNpZ25hdHVyZSB7XG4gICAgICByZXR1cm4gbmV3IFNpZ25hdHVyZSh0aGlzLnIsIHRoaXMucywgcmVjb3ZlcnkpIGFzIFJlY292ZXJlZFNpZ25hdHVyZTtcbiAgICB9XG5cbiAgICByZWNvdmVyUHVibGljS2V5KG1lc3NhZ2VIYXNoOiBVaW50OEFycmF5KTogV2VpZXJzdHJhc3NQb2ludDxiaWdpbnQ+IHtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHJlY292ZXJ5ID0gdGhpcy5hc3NlcnRSZWNvdmVyeSgpO1xuICAgICAgY29uc3QgcmFkaiA9IHJlY292ZXJ5ID09PSAyIHx8IHJlY292ZXJ5ID09PSAzID8gciArIENVUlZFX09SREVSIDogcjtcbiAgICAgIGlmICghRnAuaXNWYWxpZChyYWRqKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5IGlkOiBzaWcucitjdXJ2ZS5uICE9IFIueCcpO1xuICAgICAgY29uc3QgeCA9IEZwLnRvQnl0ZXMocmFkaik7XG4gICAgICBjb25zdCBSID0gUG9pbnQuZnJvbUJ5dGVzKGNvbmNhdEJ5dGVzKHBwcmVmaXgoKHJlY292ZXJ5ICYgMSkgPT09IDApLCB4KSk7XG4gICAgICBjb25zdCBpciA9IEZuLmludihyYWRqKTsgLy8gcl4tMVxuICAgICAgY29uc3QgaCA9IGJpdHMyaW50X21vZE4oYWJ5dGVzKG1lc3NhZ2VIYXNoLCB1bmRlZmluZWQsICdtc2dIYXNoJykpOyAvLyBUcnVuY2F0ZSBoYXNoXG4gICAgICBjb25zdCB1MSA9IEZuLmNyZWF0ZSgtaCAqIGlyKTsgLy8gLWhyXi0xXG4gICAgICBjb25zdCB1MiA9IEZuLmNyZWF0ZShzICogaXIpOyAvLyBzcl4tMVxuICAgICAgLy8gKHNyXi0xKVItKGhyXi0xKUcgPSAtKGhyXi0xKUcgKyAoc3JeLTEpLiB1bnNhZmUgaXMgZmluZTogdGhlcmUgaXMgbm8gcHJpdmF0ZSBkYXRhLlxuICAgICAgY29uc3QgUSA9IFBvaW50LkJBU0UubXVsdGlwbHlVbnNhZmUodTEpLmFkZChSLm11bHRpcGx5VW5zYWZlKHUyKSk7XG4gICAgICBpZiAoUS5pczAoKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlY292ZXJ5OiBwb2ludCBhdCBpbmZpbmlmeScpO1xuICAgICAgUS5hc3NlcnRWYWxpZGl0eSgpO1xuICAgICAgcmV0dXJuIFE7XG4gICAgfVxuXG4gICAgLy8gU2lnbmF0dXJlcyBzaG91bGQgYmUgbG93LXMsIHRvIHByZXZlbnQgbWFsbGVhYmlsaXR5LlxuICAgIGhhc0hpZ2hTKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcih0aGlzLnMpO1xuICAgIH1cblxuICAgIHRvQnl0ZXMoZm9ybWF0OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCA9IGRlZmF1bHRTaWdPcHRzLmZvcm1hdCkge1xuICAgICAgdmFsaWRhdGVTaWdGb3JtYXQoZm9ybWF0KTtcbiAgICAgIGlmIChmb3JtYXQgPT09ICdkZXInKSByZXR1cm4gaGV4VG9CeXRlcyhERVIuaGV4RnJvbVNpZyh0aGlzKSk7XG4gICAgICBjb25zdCB7IHIsIHMgfSA9IHRoaXM7XG4gICAgICBjb25zdCByYiA9IEZuLnRvQnl0ZXMocik7XG4gICAgICBjb25zdCBzYiA9IEZuLnRvQnl0ZXMocyk7XG4gICAgICBpZiAoZm9ybWF0ID09PSAncmVjb3ZlcmVkJykge1xuICAgICAgICBhc3NlcnRTbWFsbENvZmFjdG9yKCk7XG4gICAgICAgIHJldHVybiBjb25jYXRCeXRlcyhVaW50OEFycmF5Lm9mKHRoaXMuYXNzZXJ0UmVjb3ZlcnkoKSksIHJiLCBzYik7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uY2F0Qnl0ZXMocmIsIHNiKTtcbiAgICB9XG5cbiAgICB0b0hleChmb3JtYXQ/OiBFQ0RTQVNpZ25hdHVyZUZvcm1hdCkge1xuICAgICAgcmV0dXJuIGJ5dGVzVG9IZXgodGhpcy50b0J5dGVzKGZvcm1hdCkpO1xuICAgIH1cbiAgfVxuICB0eXBlIFJlY292ZXJlZFNpZ25hdHVyZSA9IFNpZ25hdHVyZSAmIHsgcmVjb3Zlcnk6IG51bWJlciB9O1xuXG4gIC8vIFJGQzY5Nzk6IGVuc3VyZSBFQ0RTQSBtc2cgaXMgWCBieXRlcyBhbmQgPCBOLiBSRkMgc3VnZ2VzdHMgb3B0aW9uYWwgdHJ1bmNhdGluZyB2aWEgYml0czJvY3RldHMuXG4gIC8vIEZJUFMgMTg2LTQgNC42IHN1Z2dlc3RzIHRoZSBsZWZ0bW9zdCBtaW4obkJpdExlbiwgb3V0TGVuKSBiaXRzLCB3aGljaCBtYXRjaGVzIGJpdHMyaW50LlxuICAvLyBiaXRzMmludCBjYW4gcHJvZHVjZSByZXM+Tiwgd2UgY2FuIGRvIG1vZChyZXMsIE4pIHNpbmNlIHRoZSBiaXRMZW4gaXMgdGhlIHNhbWUuXG4gIC8vIGludDJvY3RldHMgY2FuJ3QgYmUgdXNlZDsgcGFkcyBzbWFsbCBtc2dzIHdpdGggMDogdW5hY2NlcHRhdGJsZSBmb3IgdHJ1bmMgYXMgcGVyIFJGQyB2ZWN0b3JzXG4gIGNvbnN0IGJpdHMyaW50ID1cbiAgICBlY2RzYU9wdHMuYml0czJpbnQgfHxcbiAgICBmdW5jdGlvbiBiaXRzMmludF9kZWYoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBiaWdpbnQge1xuICAgICAgLy8gT3VyIGN1c3RvbSBjaGVjayBcImp1c3QgaW4gY2FzZVwiLCBmb3IgcHJvdGVjdGlvbiBhZ2FpbnN0IERvU1xuICAgICAgaWYgKGJ5dGVzLmxlbmd0aCA+IDgxOTIpIHRocm93IG5ldyBFcnJvcignaW5wdXQgaXMgdG9vIGxhcmdlJyk7XG4gICAgICAvLyBGb3IgY3VydmVzIHdpdGggbkJpdExlbmd0aCAlIDggIT09IDA6IGJpdHMyb2N0ZXRzKGJpdHMyb2N0ZXRzKG0pKSAhPT0gYml0czJvY3RldHMobSlcbiAgICAgIC8vIGZvciBzb21lIGNhc2VzLCBzaW5jZSBieXRlcy5sZW5ndGggKiA4IGlzIG5vdCBhY3R1YWwgYml0TGVuZ3RoLlxuICAgICAgY29uc3QgbnVtID0gYnl0ZXNUb051bWJlckJFKGJ5dGVzKTsgLy8gY2hlY2sgZm9yID09IHU4IGRvbmUgaGVyZVxuICAgICAgY29uc3QgZGVsdGEgPSBieXRlcy5sZW5ndGggKiA4IC0gZm5CaXRzOyAvLyB0cnVuY2F0ZSB0byBuQml0TGVuZ3RoIGxlZnRtb3N0IGJpdHNcbiAgICAgIHJldHVybiBkZWx0YSA+IDAgPyBudW0gPj4gQmlnSW50KGRlbHRhKSA6IG51bTtcbiAgICB9O1xuICBjb25zdCBiaXRzMmludF9tb2ROID1cbiAgICBlY2RzYU9wdHMuYml0czJpbnRfbW9kTiB8fFxuICAgIGZ1bmN0aW9uIGJpdHMyaW50X21vZE5fZGVmKGJ5dGVzOiBVaW50OEFycmF5KTogYmlnaW50IHtcbiAgICAgIHJldHVybiBGbi5jcmVhdGUoYml0czJpbnQoYnl0ZXMpKTsgLy8gY2FuJ3QgdXNlIGJ5dGVzVG9OdW1iZXJCRSBoZXJlXG4gICAgfTtcbiAgLy8gUGFkcyBvdXRwdXQgd2l0aCB6ZXJvIGFzIHBlciBzcGVjXG4gIGNvbnN0IE9SREVSX01BU0sgPSBiaXRNYXNrKGZuQml0cyk7XG4gIC8qKiBDb252ZXJ0cyB0byBieXRlcy4gQ2hlY2tzIGlmIG51bSBpbiBgWzAuLk9SREVSX01BU0stMV1gIGUuZy46IGBbMC4uMl4yNTYtMV1gLiAqL1xuICBmdW5jdGlvbiBpbnQyb2N0ZXRzKG51bTogYmlnaW50KTogVWludDhBcnJheSB7XG4gICAgLy8gSU1QT1JUQU5UOiB0aGUgY2hlY2sgZW5zdXJlcyB3b3JraW5nIGZvciBjYXNlIGBGbi5CWVRFUyAhPSBGbi5CSVRTICogOGBcbiAgICBhSW5SYW5nZSgnbnVtIDwgMl4nICsgZm5CaXRzLCBudW0sIF8wbiwgT1JERVJfTUFTSyk7XG4gICAgcmV0dXJuIEZuLnRvQnl0ZXMobnVtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTXNnQW5kSGFzaChtZXNzYWdlOiBVaW50OEFycmF5LCBwcmVoYXNoOiBib29sZWFuKSB7XG4gICAgYWJ5dGVzKG1lc3NhZ2UsIHVuZGVmaW5lZCwgJ21lc3NhZ2UnKTtcbiAgICByZXR1cm4gcHJlaGFzaCA/IGFieXRlcyhoYXNoKG1lc3NhZ2UpLCB1bmRlZmluZWQsICdwcmVoYXNoZWQgbWVzc2FnZScpIDogbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGVwcyBBLCBEIG9mIFJGQzY5NzkgMy4yLlxuICAgKiBDcmVhdGVzIFJGQzY5Nzkgc2VlZDsgY29udmVydHMgbXNnL3ByaXZLZXkgdG8gbnVtYmVycy5cbiAgICogVXNlZCBvbmx5IGluIHNpZ24sIG5vdCBpbiB2ZXJpZnkuXG4gICAqXG4gICAqIFdhcm5pbmc6IHdlIGNhbm5vdCBhc3N1bWUgaGVyZSB0aGF0IG1lc3NhZ2UgaGFzIHNhbWUgYW1vdW50IG9mIGJ5dGVzIGFzIGN1cnZlIG9yZGVyLFxuICAgKiB0aGlzIHdpbGwgYmUgaW52YWxpZCBhdCBsZWFzdCBmb3IgUDUyMS4gQWxzbyBpdCBjYW4gYmUgYmlnZ2VyIGZvciBQMjI0ICsgU0hBMjU2LlxuICAgKi9cbiAgZnVuY3Rpb24gcHJlcFNpZyhtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM6IEVDRFNBU2lnbk9wdHMpIHtcbiAgICBjb25zdCB7IGxvd1MsIHByZWhhc2gsIGV4dHJhRW50cm9weSB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpOyAvLyBSRkM2OTc5IDMuMiBBOiBoMSA9IEgobSlcbiAgICAvLyBXZSBjYW4ndCBsYXRlciBjYWxsIGJpdHMyb2N0ZXRzLCBzaW5jZSBuZXN0ZWQgYml0czJpbnQgaXMgYnJva2VuIGZvciBjdXJ2ZXNcbiAgICAvLyB3aXRoIGZuQml0cyAlIDggIT09IDAuIEJlY2F1c2Ugb2YgdGhhdCwgd2UgdW53cmFwIGl0IGhlcmUgYXMgaW50Mm9jdGV0cyBjYWxsLlxuICAgIC8vIGNvbnN0IGJpdHMyb2N0ZXRzID0gKGJpdHMpID0+IGludDJvY3RldHMoYml0czJpbnRfbW9kTihiaXRzKSlcbiAgICBjb25zdCBoMWludCA9IGJpdHMyaW50X21vZE4obWVzc2FnZSk7XG4gICAgY29uc3QgZCA9IEZuLmZyb21CeXRlcyhzZWNyZXRLZXkpOyAvLyB2YWxpZGF0ZSBzZWNyZXQga2V5LCBjb252ZXJ0IHRvIGJpZ2ludFxuICAgIGlmICghRm4uaXNWYWxpZE5vdDAoZCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwcml2YXRlIGtleScpO1xuICAgIGNvbnN0IHNlZWRBcmdzID0gW2ludDJvY3RldHMoZCksIGludDJvY3RldHMoaDFpbnQpXTtcbiAgICAvLyBleHRyYUVudHJvcHkuIFJGQzY5NzkgMy42OiBhZGRpdGlvbmFsIGsnIChvcHRpb25hbCkuXG4gICAgaWYgKGV4dHJhRW50cm9weSAhPSBudWxsICYmIGV4dHJhRW50cm9weSAhPT0gZmFsc2UpIHtcbiAgICAgIC8vIEsgPSBITUFDX0soViB8fCAweDAwIHx8IGludDJvY3RldHMoeCkgfHwgYml0czJvY3RldHMoaDEpIHx8IGsnKVxuICAgICAgLy8gZ2VuIHJhbmRvbSBieXRlcyBPUiBwYXNzIGFzLWlzXG4gICAgICBjb25zdCBlID0gZXh0cmFFbnRyb3B5ID09PSB0cnVlID8gcmFuZG9tQnl0ZXMobGVuZ3Rocy5zZWNyZXRLZXkpIDogZXh0cmFFbnRyb3B5O1xuICAgICAgc2VlZEFyZ3MucHVzaChhYnl0ZXMoZSwgdW5kZWZpbmVkLCAnZXh0cmFFbnRyb3B5JykpOyAvLyBjaGVjayBmb3IgYmVpbmcgYnl0ZXNcbiAgICB9XG4gICAgY29uc3Qgc2VlZCA9IGNvbmNhdEJ5dGVzKC4uLnNlZWRBcmdzKTsgLy8gU3RlcCBEIG9mIFJGQzY5NzkgMy4yXG4gICAgY29uc3QgbSA9IGgxaW50OyAvLyBubyBuZWVkIHRvIGNhbGwgYml0czJpbnQgc2Vjb25kIHRpbWUgaGVyZSwgaXQgaXMgaW5zaWRlIHRydW5jYXRlSGFzaCFcbiAgICAvLyBDb252ZXJ0cyBzaWduYXR1cmUgcGFyYW1zIGludG8gcG9pbnQgdyByL3MsIGNoZWNrcyByZXN1bHQgZm9yIHZhbGlkaXR5LlxuICAgIC8vIFRvIHRyYW5zZm9ybSBrID0+IFNpZ25hdHVyZTpcbiAgICAvLyBxID0ga1x1MjJDNUdcbiAgICAvLyByID0gcS54IG1vZCBuXG4gICAgLy8gcyA9IGteLTEobSArIHJkKSBtb2QgblxuICAgIC8vIENhbiB1c2Ugc2NhbGFyIGJsaW5kaW5nIGJeLTEoYm0gKyBiZHIpIHdoZXJlIGIgXHUyMjA4IFsxLHFcdTIyMTIxXSBhY2NvcmRpbmcgdG9cbiAgICAvLyBodHRwczovL3RjaGVzLmlhY3Iub3JnL2luZGV4LnBocC9UQ0hFUy9hcnRpY2xlL3ZpZXcvNzMzNy82NTA5LiBXZSd2ZSBkZWNpZGVkIGFnYWluc3QgaXQ6XG4gICAgLy8gYSkgZGVwZW5kZW5jeSBvbiBDU1BSTkcgYikgMTUlIHNsb3dkb3duIGMpIGRvZXNuJ3QgcmVhbGx5IGhlbHAgc2luY2UgYmlnaW50cyBhcmUgbm90IENUXG4gICAgZnVuY3Rpb24gazJzaWcoa0J5dGVzOiBVaW50OEFycmF5KTogU2lnbmF0dXJlIHwgdW5kZWZpbmVkIHtcbiAgICAgIC8vIFJGQyA2OTc5IFNlY3Rpb24gMy4yLCBzdGVwIDM6IGsgPSBiaXRzMmludChUKVxuICAgICAgLy8gSW1wb3J0YW50OiBhbGwgbW9kKCkgY2FsbHMgaGVyZSBtdXN0IGJlIGRvbmUgb3ZlciBOXG4gICAgICBjb25zdCBrID0gYml0czJpbnQoa0J5dGVzKTsgLy8gQ2Fubm90IHVzZSBmaWVsZHMgbWV0aG9kcywgc2luY2UgaXQgaXMgZ3JvdXAgZWxlbWVudFxuICAgICAgaWYgKCFGbi5pc1ZhbGlkTm90MChrKSkgcmV0dXJuOyAvLyBWYWxpZCBzY2FsYXJzIChpbmNsdWRpbmcgaykgbXVzdCBiZSBpbiAxLi5OLTFcbiAgICAgIGNvbnN0IGlrID0gRm4uaW52KGspOyAvLyBrXi0xIG1vZCBuXG4gICAgICBjb25zdCBxID0gUG9pbnQuQkFTRS5tdWx0aXBseShrKS50b0FmZmluZSgpOyAvLyBxID0ga1x1MjJDNUdcbiAgICAgIGNvbnN0IHIgPSBGbi5jcmVhdGUocS54KTsgLy8gciA9IHEueCBtb2QgblxuICAgICAgaWYgKHIgPT09IF8wbikgcmV0dXJuO1xuICAgICAgY29uc3QgcyA9IEZuLmNyZWF0ZShpayAqIEZuLmNyZWF0ZShtICsgciAqIGQpKTsgLy8gcyA9IGteLTEobSArIHJkKSBtb2QgblxuICAgICAgaWYgKHMgPT09IF8wbikgcmV0dXJuO1xuICAgICAgbGV0IHJlY292ZXJ5ID0gKHEueCA9PT0gciA/IDAgOiAyKSB8IE51bWJlcihxLnkgJiBfMW4pOyAvLyByZWNvdmVyeSBiaXQgKDIgb3IgMyB3aGVuIHEueD5uKVxuICAgICAgbGV0IG5vcm1TID0gcztcbiAgICAgIGlmIChsb3dTICYmIGlzQmlnZ2VyVGhhbkhhbGZPcmRlcihzKSkge1xuICAgICAgICBub3JtUyA9IEZuLm5lZyhzKTsgLy8gaWYgbG93UyB3YXMgcGFzc2VkLCBlbnN1cmUgcyBpcyBhbHdheXMgaW4gdGhlIGJvdHRvbSBoYWxmIG9mIE5cbiAgICAgICAgcmVjb3ZlcnkgXj0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgU2lnbmF0dXJlKHIsIG5vcm1TLCBoYXNMYXJnZUNvZmFjdG9yID8gdW5kZWZpbmVkIDogcmVjb3ZlcnkpO1xuICAgIH1cbiAgICByZXR1cm4geyBzZWVkLCBrMnNpZyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25zIG1lc3NhZ2UgaGFzaCB3aXRoIGEgc2VjcmV0IGtleS5cbiAgICpcbiAgICogYGBgXG4gICAqIHNpZ24obSwgZCkgd2hlcmVcbiAgICogICBrID0gcmZjNjk3OV9obWFjX2RyYmcobSwgZClcbiAgICogICAoeCwgeSkgPSBHIFx1MDBENyBrXG4gICAqICAgciA9IHggbW9kIG5cbiAgICogICBzID0gKG0gKyBkcikgLyBrIG1vZCBuXG4gICAqIGBgYFxuICAgKi9cbiAgZnVuY3Rpb24gc2lnbihtZXNzYWdlOiBVaW50OEFycmF5LCBzZWNyZXRLZXk6IFVpbnQ4QXJyYXksIG9wdHM6IEVDRFNBU2lnbk9wdHMgPSB7fSk6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IHsgc2VlZCwgazJzaWcgfSA9IHByZXBTaWcobWVzc2FnZSwgc2VjcmV0S2V5LCBvcHRzKTsgLy8gU3RlcHMgQSwgRCBvZiBSRkM2OTc5IDMuMi5cbiAgICBjb25zdCBkcmJnID0gY3JlYXRlSG1hY0RyYmc8U2lnbmF0dXJlPihoYXNoLm91dHB1dExlbiwgRm4uQllURVMsIGhtYWMpO1xuICAgIGNvbnN0IHNpZyA9IGRyYmcoc2VlZCwgazJzaWcpOyAvLyBTdGVwcyBCLCBDLCBELCBFLCBGLCBHXG4gICAgcmV0dXJuIHNpZy50b0J5dGVzKG9wdHMuZm9ybWF0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyBhIHNpZ25hdHVyZSBhZ2FpbnN0IG1lc3NhZ2UgYW5kIHB1YmxpYyBrZXkuXG4gICAqIFJlamVjdHMgbG93UyBzaWduYXR1cmVzIGJ5IGRlZmF1bHQ6IHNlZSB7QGxpbmsgRUNEU0FWZXJpZnlPcHRzfS5cbiAgICogSW1wbGVtZW50cyBzZWN0aW9uIDQuMS40IGZyb20gaHR0cHM6Ly93d3cuc2VjZy5vcmcvc2VjMS12Mi5wZGY6XG4gICAqXG4gICAqIGBgYFxuICAgKiB2ZXJpZnkociwgcywgaCwgUCkgd2hlcmVcbiAgICogICB1MSA9IGhzXi0xIG1vZCBuXG4gICAqICAgdTIgPSByc14tMSBtb2QgblxuICAgKiAgIFIgPSB1MVx1MjJDNUcgKyB1Mlx1MjJDNVBcbiAgICogICBtb2QoUi54LCBuKSA9PSByXG4gICAqIGBgYFxuICAgKi9cbiAgZnVuY3Rpb24gdmVyaWZ5KFxuICAgIHNpZ25hdHVyZTogVWludDhBcnJheSxcbiAgICBtZXNzYWdlOiBVaW50OEFycmF5LFxuICAgIHB1YmxpY0tleTogVWludDhBcnJheSxcbiAgICBvcHRzOiBFQ0RTQVZlcmlmeU9wdHMgPSB7fVxuICApOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGxvd1MsIHByZWhhc2gsIGZvcm1hdCB9ID0gdmFsaWRhdGVTaWdPcHRzKG9wdHMsIGRlZmF1bHRTaWdPcHRzKTtcbiAgICBwdWJsaWNLZXkgPSBhYnl0ZXMocHVibGljS2V5LCB1bmRlZmluZWQsICdwdWJsaWNLZXknKTtcbiAgICBtZXNzYWdlID0gdmFsaWRhdGVNc2dBbmRIYXNoKG1lc3NhZ2UsIHByZWhhc2gpO1xuICAgIGlmICghaXNCeXRlcyhzaWduYXR1cmUgYXMgYW55KSkge1xuICAgICAgY29uc3QgZW5kID0gc2lnbmF0dXJlIGluc3RhbmNlb2YgU2lnbmF0dXJlID8gJywgdXNlIHNpZy50b0J5dGVzKCknIDogJyc7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZlcmlmeSBleHBlY3RzIFVpbnQ4QXJyYXkgc2lnbmF0dXJlJyArIGVuZCk7XG4gICAgfVxuICAgIHZhbGlkYXRlU2lnTGVuZ3RoKHNpZ25hdHVyZSwgZm9ybWF0KTsgLy8gZXhlY3V0ZSB0aGlzIHR3aWNlIGJlY2F1c2Ugd2Ugd2FudCBsb3VkIGVycm9yXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNpZyA9IFNpZ25hdHVyZS5mcm9tQnl0ZXMoc2lnbmF0dXJlLCBmb3JtYXQpO1xuICAgICAgY29uc3QgUCA9IFBvaW50LmZyb21CeXRlcyhwdWJsaWNLZXkpO1xuICAgICAgaWYgKGxvd1MgJiYgc2lnLmhhc0hpZ2hTKCkpIHJldHVybiBmYWxzZTtcbiAgICAgIGNvbnN0IHsgciwgcyB9ID0gc2lnO1xuICAgICAgY29uc3QgaCA9IGJpdHMyaW50X21vZE4obWVzc2FnZSk7IC8vIG1vZCBuLCBub3QgbW9kIHBcbiAgICAgIGNvbnN0IGlzID0gRm4uaW52KHMpOyAvLyBzXi0xIG1vZCBuXG4gICAgICBjb25zdCB1MSA9IEZuLmNyZWF0ZShoICogaXMpOyAvLyB1MSA9IGhzXi0xIG1vZCBuXG4gICAgICBjb25zdCB1MiA9IEZuLmNyZWF0ZShyICogaXMpOyAvLyB1MiA9IHJzXi0xIG1vZCBuXG4gICAgICBjb25zdCBSID0gUG9pbnQuQkFTRS5tdWx0aXBseVVuc2FmZSh1MSkuYWRkKFAubXVsdGlwbHlVbnNhZmUodTIpKTsgLy8gdTFcdTIyQzVHICsgdTJcdTIyQzVQXG4gICAgICBpZiAoUi5pczAoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgdiA9IEZuLmNyZWF0ZShSLngpOyAvLyB2ID0gci54IG1vZCBuXG4gICAgICByZXR1cm4gdiA9PT0gcjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3ZlclB1YmxpY0tleShcbiAgICBzaWduYXR1cmU6IFVpbnQ4QXJyYXksXG4gICAgbWVzc2FnZTogVWludDhBcnJheSxcbiAgICBvcHRzOiBFQ0RTQVJlY292ZXJPcHRzID0ge31cbiAgKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgeyBwcmVoYXNoIH0gPSB2YWxpZGF0ZVNpZ09wdHMob3B0cywgZGVmYXVsdFNpZ09wdHMpO1xuICAgIG1lc3NhZ2UgPSB2YWxpZGF0ZU1zZ0FuZEhhc2gobWVzc2FnZSwgcHJlaGFzaCk7XG4gICAgcmV0dXJuIFNpZ25hdHVyZS5mcm9tQnl0ZXMoc2lnbmF0dXJlLCAncmVjb3ZlcmVkJykucmVjb3ZlclB1YmxpY0tleShtZXNzYWdlKS50b0J5dGVzKCk7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh7XG4gICAga2V5Z2VuLFxuICAgIGdldFB1YmxpY0tleSxcbiAgICBnZXRTaGFyZWRTZWNyZXQsXG4gICAgdXRpbHMsXG4gICAgbGVuZ3RocyxcbiAgICBQb2ludCxcbiAgICBzaWduLFxuICAgIHZlcmlmeSxcbiAgICByZWNvdmVyUHVibGljS2V5LFxuICAgIFNpZ25hdHVyZSxcbiAgICBoYXNoLFxuICB9KSBzYXRpc2ZpZXMgU2lnbmVyO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBsb2dnZXJcbiAqIEBkZXNjcmlwdGlvbiBMb2dnZXIgdXRpbGl0eSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gKi9cblxuZW51bSBMb2dMZXZlbCB7XG4gIERFQlVHLFxuICBJTkZPLFxuICBXQVJOLFxuICBFUlJPUlxufVxuXG5pbXBvcnQgcGlubyBmcm9tICdwaW5vJztcblxuLyoqXG4gKiBDcmVhdGUgYSBsb2dnZXIgaW5zdGFuY2Ugd2l0aCBjb25zaXN0ZW50IGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBuYW1lIC0gQ29tcG9uZW50IG9yIG1vZHVsZSBuYW1lIGZvciB0aGUgbG9nZ2VyXG4gKiBAcmV0dXJucyBDb25maWd1cmVkIHBpbm8gbG9nZ2VyIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2dnZXIobmFtZTogc3RyaW5nKTogcGluby5Mb2dnZXIge1xuICByZXR1cm4gcGlubyh7XG4gICAgbmFtZSxcbiAgICBsZXZlbDogcHJvY2Vzcy5lbnYuTE9HX0xFVkVMIHx8ICdpbmZvJyxcbiAgICB0cmFuc3BvcnQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8ge1xuICAgICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBjb2xvcml6ZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNsYXRlVGltZTogJ0hIOk1NOnNzJyxcbiAgICAgICAgaWdub3JlOiAncGlkLGhvc3RuYW1lJyxcbiAgICAgIH1cbiAgICB9IDogdW5kZWZpbmVkLFxuICAgIGZvcm1hdHRlcnM6IHtcbiAgICAgIGxldmVsOiAobGFiZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgbGV2ZWw6IGxhYmVsLnRvVXBwZXJDYXNlKCkgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFNpbXBsZSBsb2cgZnVuY3Rpb24gZm9yIGJhc2ljIGxvZ2dpbmcgbmVlZHNcbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBsb2dcbiAqIEBwYXJhbSBkYXRhIC0gT3B0aW9uYWwgZGF0YSB0byBpbmNsdWRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2cobWVzc2FnZTogc3RyaW5nLCBkYXRhPzogdW5rbm93bik6IHZvaWQge1xuICBjb25zb2xlLmxvZyhtZXNzYWdlLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IGxvZ2dlciBpbnN0YW5jZSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gKiBJbmNsdWRlcyBlbmhhbmNlZCBlcnJvciBoYW5kbGluZyBhbmQgZm9ybWF0dGluZ1xuICovXG5leHBvcnQgY29uc3QgbG9nZ2VyOiBwaW5vLkxvZ2dlciA9IHBpbm8oe1xuICBuYW1lOiAnbm9zdHItY3J5cHRvLXV0aWxzJyxcbiAgbGV2ZWw6IHByb2Nlc3MuZW52LkxPR19MRVZFTCB8fCAnaW5mbycsXG4gIHRyYW5zcG9ydDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyB7XG4gICAgdGFyZ2V0OiAncGluby1wcmV0dHknLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGNvbG9yaXplOiB0cnVlLFxuICAgICAgdHJhbnNsYXRlVGltZTogJ0hIOk1NOnNzJyxcbiAgICAgIGlnbm9yZTogJ3BpZCxob3N0bmFtZScsXG4gICAgfVxuICB9IDogdW5kZWZpbmVkLFxuICBmb3JtYXR0ZXJzOiB7XG4gICAgbGV2ZWw6IChsYWJlbCkgPT4ge1xuICAgICAgcmV0dXJuIHsgbGV2ZWw6IGxhYmVsLnRvVXBwZXJDYXNlKCkgfTtcbiAgICB9LFxuICAgIGxvZzogKG9iajogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgIC8vIENvbnZlcnQgZXJyb3Igb2JqZWN0cyB0byBzdHJpbmdzIGZvciBiZXR0ZXIgbG9nZ2luZ1xuICAgICAgaWYgKG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAnZXJyJyBpbiBvYmopIHtcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5vYmogfTtcbiAgICAgICAgaWYgKG5ld09iai5lcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgIGNvbnN0IGVyciA9IG5ld09iai5lcnIgYXMgRXJyb3I7XG4gICAgICAgICAgbmV3T2JqLmVyciA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgIG5hbWU6IGVyci5uYW1lLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld09iajtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGNsYXNzIEN1c3RvbUxvZ2dlciB7XG4gIHByaXZhdGUgX2xldmVsOiBMb2dMZXZlbDtcblxuICBjb25zdHJ1Y3RvcihsZXZlbDogTG9nTGV2ZWwgPSBMb2dMZXZlbC5JTkZPKSB7XG4gICAgdGhpcy5fbGV2ZWwgPSBsZXZlbDtcbiAgfVxuXG4gIHNldExldmVsKGxldmVsOiBMb2dMZXZlbCk6IHZvaWQge1xuICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gIH1cblxuICBwcml2YXRlIF9sb2cobGV2ZWw6IExvZ0xldmVsLCBtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIGlmIChsZXZlbCA+PSB0aGlzLl9sZXZlbCkge1xuICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgY29uc3QgbGV2ZWxOYW1lID0gTG9nTGV2ZWxbbGV2ZWxdO1xuICAgICAgY29uc3QgY29udGV4dFN0ciA9IGNvbnRleHQgPyBgICR7SlNPTi5zdHJpbmdpZnkoY29udGV4dCl9YCA6ICcnO1xuICAgICAgY29uc29sZS5sb2coYFske3RpbWVzdGFtcH1dICR7bGV2ZWxOYW1lfTogJHttZXNzYWdlfSR7Y29udGV4dFN0cn1gKTtcbiAgICB9XG4gIH1cblxuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5ERUJVRywgbWVzc2FnZSwgY29udGV4dCk7XG4gIH1cblxuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgdGhpcy5fbG9nKExvZ0xldmVsLklORk8sIG1lc3NhZ2UsIGNvbnRleHQpO1xuICB9XG5cbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGNvbnRleHQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5XQVJOLCBtZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxuXG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZyB8IEVycm9yIHwgdW5rbm93biwgY29udGV4dD86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gbWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yID8gbWVzc2FnZS5tZXNzYWdlIDogU3RyaW5nKG1lc3NhZ2UpO1xuICAgIHRoaXMuX2xvZyhMb2dMZXZlbC5FUlJPUiwgZXJyb3JNZXNzYWdlLCBjb250ZXh0KTtcbiAgfVxufVxuXG4vLyBSZS1leHBvcnQgdGhlIExvZ2dlciB0eXBlIGZvciB1c2UgaW4gb3RoZXIgZmlsZXNcbmV4cG9ydCB0eXBlIHsgTG9nZ2VyIH0gZnJvbSAncGlubyc7XG4iLCAiLyoqXG4gKiBCYXNlNjQgZW5jb2RpbmcgdXRpbGl0aWVzIGZvciBOb3N0clxuICogUHJvdmlkZXMgY29uc2lzdGVudCBiYXNlNjQgZW5jb2RpbmcvZGVjb2RpbmcgYWNyb3NzIGFsbCBOb3N0ci1yZWxhdGVkIHByb2plY3RzXG4gKiBVc2VzIGJyb3dzZXItY29tcGF0aWJsZSBBUElzIChubyBOb2RlLmpzIEJ1ZmZlciBkZXBlbmRlbmN5KVxuICovXG5cbi8qKlxuICogQ29udmVydCBzdHJpbmcgdG8gYmFzZTY0XG4gKiBAcGFyYW0gc3RyIFN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb0Jhc2U2NChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cik7XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ5dGVzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBzdHJpbmdcbiAqIEBwYXJhbSBiYXNlNjQgQmFzZTY0IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVVEYtOCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb1N0cmluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbiAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIGJhc2U2NFxuICogQHBhcmFtIGJ1ZmZlciBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBieXRlc1RvQmFzZTY0KGJ1ZmZlcik7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gVWludDhBcnJheVxuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIFVpbnQ4QXJyYXlcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J1ZmZlcihiYXNlNjQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBpZiAoIWlzVmFsaWRCYXNlNjQoYmFzZTY0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBiYXNlNjQgc3RyaW5nJyk7XG4gIH1cbiAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBzdHJpbmcgaXMgdmFsaWQgYmFzZTY0XG4gKiBAcGFyYW0gYmFzZTY0IFN0cmluZyB0byBjaGVja1xuICogQHJldHVybnMgVHJ1ZSBpZiB2YWxpZCBiYXNlNjRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRCYXNlNjQoYmFzZTY0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gQm9vbGVhbihiYXNlNjQubWF0Y2goL15bQS1aYS16MC05Ky9dKj17MCwyfSQvKSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYmFzZTY0IHRvIFVSTC1zYWZlIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NCBTdGFuZGFyZCBiYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b0Jhc2U2NFVybChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlNjQucmVwbGFjZSgvXFwrL2csICctJykucmVwbGFjZSgvXFwvL2csICdfJykucmVwbGFjZSgvPSskLywgJycpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgVVJMLXNhZmUgYmFzZTY0IHRvIHN0YW5kYXJkIGJhc2U2NFxuICogQHBhcmFtIGJhc2U2NHVybCBVUkwtc2FmZSBiYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBTdGFuZGFyZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tQmFzZTY0VXJsKGJhc2U2NHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYmFzZTY0ID0gYmFzZTY0dXJsLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XG4gIGNvbnN0IHBhZGRpbmcgPSAnPScucmVwZWF0KCg0IC0gYmFzZTY0Lmxlbmd0aCAlIDQpICUgNCk7XG4gIHJldHVybiBiYXNlNjQgKyBwYWRkaW5nO1xufVxuXG4vKipcbiAqIENvbnZlcnQgaGV4IHN0cmluZyB0byBiYXNlNjRcbiAqIEBwYXJhbSBoZXggSGV4IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nXG4gKiBAdGhyb3dzIEVycm9yIGlmIGhleCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGV4VG9CYXNlNjQoaGV4OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIWhleC5tYXRjaCgvXlswLTlhLWZBLUZdKiQvKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGV4Lmxlbmd0aDsgaSArPSAyKSB7XG4gICAgYnl0ZXNbaSAvIDJdID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZyhpLCBpICsgMiksIDE2KTtcbiAgfVxuICByZXR1cm4gYnl0ZXNUb0Jhc2U2NChieXRlcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBiYXNlNjQgdG8gaGV4IHN0cmluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEhleCBzdHJpbmdcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0hleChiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBieXRlcyA9IGJhc2U2NFRvQnl0ZXMoYmFzZTY0KTtcbiAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpLm1hcChiID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBiYXNlNjQgc3RyaW5nIGZyb20gYnl0ZSBhcnJheVxuICogQHBhcmFtIGJ5dGVzIEJ5dGUgYXJyYXlcbiAqIEByZXR1cm5zIEJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBsZXQgYmluYXJ5ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gIH1cbiAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGJhc2U2NCB0byBieXRlIGFycmF5XG4gKiBAcGFyYW0gYmFzZTY0IEJhc2U2NCBzdHJpbmdcbiAqIEByZXR1cm5zIEJ5dGUgYXJyYXlcbiAqIEB0aHJvd3MgRXJyb3IgaWYgYmFzZTY0IHN0cmluZyBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjRUb0J5dGVzKGJhc2U2NDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIGlmICghaXNWYWxpZEJhc2U2NChiYXNlNjQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJhc2U2NCBzdHJpbmcnKTtcbiAgfVxuICBjb25zdCBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgfVxuICByZXR1cm4gYnl0ZXM7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIHBhZGRlZCBsZW5ndGggZm9yIGJhc2U2NCBzdHJpbmdcbiAqIEBwYXJhbSBkYXRhTGVuZ3RoIExlbmd0aCBvZiByYXcgZGF0YVxuICogQHJldHVybnMgTGVuZ3RoIG9mIHBhZGRlZCBiYXNlNjQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVCYXNlNjRMZW5ndGgoZGF0YUxlbmd0aDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguY2VpbChkYXRhTGVuZ3RoIC8gMykgKiA0O1xufVxuXG4vKipcbiAqIFJlbW92ZSBiYXNlNjQgcGFkZGluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nXG4gKiBAcmV0dXJucyBCYXNlNjQgc3RyaW5nIHdpdGhvdXQgcGFkZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQmFzZTY0UGFkZGluZyhiYXNlNjQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBiYXNlNjQucmVwbGFjZSgvPSskLywgJycpO1xufVxuXG4vKipcbiAqIEFkZCBiYXNlNjQgcGFkZGluZ1xuICogQHBhcmFtIGJhc2U2NCBCYXNlNjQgc3RyaW5nIHdpdGhvdXQgcGFkZGluZ1xuICogQHJldHVybnMgUHJvcGVybHkgcGFkZGVkIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZEJhc2U2NFBhZGRpbmcoYmFzZTY0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBwYWRkaW5nID0gJz0nLnJlcGVhdCgoNCAtIGJhc2U2NC5sZW5ndGggJSA0KSAlIDQpO1xuICByZXR1cm4gYmFzZTY0ICsgcGFkZGluZztcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgdmFsaWRhdGlvblxuICogQGRlc2NyaXB0aW9uIFZhbGlkYXRpb24gdXRpbGl0aWVzIGZvciBOb3N0ciBldmVudHMsIG1lc3NhZ2VzLCBhbmQgcmVsYXRlZCBkYXRhIHN0cnVjdHVyZXMuXG4gKiBQcm92aWRlcyBmdW5jdGlvbnMgdG8gdmFsaWRhdGUgZXZlbnRzLCBzaWduYXR1cmVzLCBmaWx0ZXJzLCBhbmQgc3Vic2NyaXB0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIE5vc3RyIHByb3RvY29sLlxuICovXG5cbmltcG9ydCB7IFxuICBOb3N0ckV2ZW50LCBcbiAgU2lnbmVkTm9zdHJFdmVudCwgXG4gIE5vc3RyRmlsdGVyLCBcbiAgTm9zdHJTdWJzY3JpcHRpb24sIFxuICBWYWxpZGF0aW9uUmVzdWx0LCBcbiAgUHVibGljS2V5LFxuICBOb3N0ck1lc3NhZ2VUeXBlXG59IGZyb20gJy4uL3R5cGVzL2luZGV4JztcblxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXggfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IHNjaG5vcnIgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5cbi8qKlxuICogR2V0cyB0aGUgaGV4IHN0cmluZyBmcm9tIGEgUHVibGljS2V5IG9yIHN0cmluZ1xuICovXG5mdW5jdGlvbiBnZXRQdWJsaWNLZXlIZXgocHVia2V5OiBQdWJsaWNLZXkgfCBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdHlwZW9mIHB1YmtleSA9PT0gJ3N0cmluZycgPyBwdWJrZXkgOiBwdWJrZXkuaGV4O1xufVxuXG5mdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBuZXcgVWludDhBcnJheShoZXgubWF0Y2goLy57MSwyfS9nKSEubWFwKGJ5dGUgPT4gcGFyc2VJbnQoYnl0ZSwgMTYpKSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnQgSUQgYnkgY2hlY2tpbmcgaWYgaXQgbWF0Y2hlcyB0aGUgU0hBLTI1NiBoYXNoIG9mIHRoZSBjYW5vbmljYWwgZXZlbnQgc2VyaWFsaXphdGlvbi5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnRJZChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudElkKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZCA9IEpTT04uc3RyaW5naWZ5KFtcbiAgICAgIDAsXG4gICAgICBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KSxcbiAgICAgIGV2ZW50LmNyZWF0ZWRfYXQsXG4gICAgICBldmVudC5raW5kLFxuICAgICAgZXZlbnQudGFncyxcbiAgICAgIGV2ZW50LmNvbnRlbnRcbiAgICBdKTtcbiAgICBjb25zdCBoYXNoID0gYnl0ZXNUb0hleChzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGhhc2ggPT09IGV2ZW50LmlkLFxuICAgICAgZXJyb3I6IGhhc2ggPT09IGV2ZW50LmlkID8gdW5kZWZpbmVkIDogJ0ludmFsaWQgZXZlbnQgSUQnXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIGV2ZW50IElEJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgSUQnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IHNpZ25hdHVyZSB1c2luZyBTY2hub3JyIHNpZ25hdHVyZSB2ZXJpZmljYXRpb24uXG4gKiBcbiAqIEBwYXJhbSB7U2lnbmVkTm9zdHJFdmVudH0gZXZlbnQgLSBUaGUgZXZlbnQgdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50KTtcbiAqIGlmICghcmVzdWx0LmlzVmFsaWQpIHtcbiAqICAgY29uc29sZS5lcnJvcihyZXN1bHQuZXJyb3IpO1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50U2lnbmF0dXJlKGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIHRyeSB7XG4gICAgLy8gVmVyaWZ5IHRoZSBzaWduYXR1cmVcbiAgICBjb25zdCBzZXJpYWxpemVkID0gSlNPTi5zdHJpbmdpZnkoW1xuICAgICAgMCxcbiAgICAgIGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpLFxuICAgICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICAgIGV2ZW50LmtpbmQsXG4gICAgICBldmVudC50YWdzLFxuICAgICAgZXZlbnQuY29udGVudFxuICAgIF0pO1xuICAgIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICBjb25zdCBwdWJrZXlIZXggPSBnZXRQdWJsaWNLZXlIZXgoZXZlbnQucHVia2V5KTtcbiAgICBjb25zdCBwdWJrZXlCeXRlcyA9IGhleFRvQnl0ZXMocHVia2V5SGV4KTtcbiAgICBjb25zdCBpc1ZhbGlkID0gc2Nobm9yci52ZXJpZnkoaGV4VG9CeXRlcyhldmVudC5zaWcpLCBoYXNoLCBwdWJrZXlCeXRlcyk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQsXG4gICAgICBlcnJvcjogaXNWYWxpZCA/IHVuZGVmaW5lZCA6ICdJbnZhbGlkIHNpZ25hdHVyZSdcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZXZlbnQgc2lnbmF0dXJlJ1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBjb21wbGV0ZSBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlLCB0aW1lc3RhbXBzLCBJRCwgYW5kIHNpZ25hdHVyZS5cbiAqIFxuICogQHBhcmFtIHtTaWduZWROb3N0ckV2ZW50fSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRXZlbnQoZXZlbnQpO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRXZlbnQoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gRmlyc3QgdmFsaWRhdGUgdGhlIGV2ZW50IHN0cnVjdHVyZVxuICBjb25zdCBiYXNlVmFsaWRhdGlvbiA9IHZhbGlkYXRlRXZlbnRCYXNlKGV2ZW50KTtcbiAgaWYgKCFiYXNlVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgcmV0dXJuIGJhc2VWYWxpZGF0aW9uO1xuICB9XG5cbiAgLy8gVGhlbiB2YWxpZGF0ZSB0aGUgZXZlbnQgSURcbiAgY29uc3QgaWRWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudElkKGV2ZW50KTtcbiAgaWYgKCFpZFZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgIHJldHVybiBpZFZhbGlkYXRpb247XG4gIH1cblxuICAvLyBGaW5hbGx5IHZhbGlkYXRlIHRoZSBzaWduYXR1cmVcbiAgcmV0dXJuIHZhbGlkYXRlRXZlbnRTaWduYXR1cmUoZXZlbnQpO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIHNpZ25lZCBOb3N0ciBldmVudCBieSBjaGVja2luZyBpdHMgc3RydWN0dXJlIGFuZCBzaWduYXR1cmUgZm9ybWF0LlxuICogXG4gKiBAcGFyYW0ge1NpZ25lZE5vc3RyRXZlbnR9IGV2ZW50IC0gVGhlIGV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyB7VmFsaWRhdGlvblJlc3VsdH0gT2JqZWN0IGNvbnRhaW5pbmcgdmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKiBAZXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVTaWduZWRFdmVudChldmVudCk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTaWduZWRFdmVudChldmVudDogU2lnbmVkTm9zdHJFdmVudCk6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIENoZWNrIGJhc2ljIGV2ZW50IHN0cnVjdHVyZVxuICAgIGNvbnN0IGJhc2VWYWxpZGF0aW9uID0gdmFsaWRhdGVFdmVudEJhc2UoZXZlbnQpO1xuICAgIGlmICghYmFzZVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgcmV0dXJuIGJhc2VWYWxpZGF0aW9uO1xuICAgIH1cblxuICAgIC8vIEdldCBwdWJrZXkgaGV4XG4gICAgY29uc3QgcHVia2V5SGV4ID0gZ2V0UHVibGljS2V5SGV4KGV2ZW50LnB1YmtleSk7XG5cbiAgICAvLyBWYWxpZGF0ZSBwdWJrZXkgZm9ybWF0XG4gICAgaWYgKCFwdWJrZXlIZXggfHwgdHlwZW9mIHB1YmtleUhleCAhPT0gJ3N0cmluZycgfHwgcHVia2V5SGV4Lmxlbmd0aCAhPT0gNjQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgcHVibGljIGtleSBmb3JtYXQnXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHNpZ25hdHVyZSBmb3JtYXRcbiAgICBpZiAoIWV2ZW50LnNpZyB8fCB0eXBlb2YgZXZlbnQuc2lnICE9PSAnc3RyaW5nJyB8fCBldmVudC5zaWcubGVuZ3RoICE9PSAxMjgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgc2lnbmF0dXJlIGZvcm1hdCdcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgSUQgZm9ybWF0XG4gICAgaWYgKCFldmVudC5pZCB8fCB0eXBlb2YgZXZlbnQuaWQgIT09ICdzdHJpbmcnIHx8IGV2ZW50LmlkLmxlbmd0aCAhPT0gNjQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ludmFsaWQgZXZlbnQgSUQgZm9ybWF0J1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzaWduZWQgZXZlbnQnKTtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzaWduZWQgZXZlbnQnXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyBhIE5vc3RyIGV2ZW50IGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpZWxkcy5cbiAqIEBwYXJhbSBldmVudCAtIFRoZSBldmVudCB0byB2YWxpZGF0ZVxuICogQHJldHVybnMgVmFsaWRhdGlvbiByZXN1bHQgYW5kIGFueSBlcnJvciBtZXNzYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50QmFzZShldmVudDogTm9zdHJFdmVudCB8IFNpZ25lZE5vc3RyRXZlbnQpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzXG4gIGlmICghZXZlbnQgfHwgdHlwZW9mIGV2ZW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgZXZlbnQgc3RydWN0dXJlJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUga2luZFxuICBpZiAodHlwZW9mIGV2ZW50LmtpbmQgIT09ICdudW1iZXInIHx8IGV2ZW50LmtpbmQgPCAwKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQga2luZCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInIH07XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0aW1lc3RhbXBcbiAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIGlmICh0eXBlb2YgZXZlbnQuY3JlYXRlZF9hdCAhPT0gJ251bWJlcicgfHwgZXZlbnQuY3JlYXRlZF9hdCA+IG5vdyArIDYwKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgdGltZXN0YW1wIGNhbm5vdCBiZSBpbiB0aGUgZnV0dXJlJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgY29udGVudFxuICBpZiAodHlwZW9mIGV2ZW50LmNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgY29udGVudCBtdXN0IGJlIGEgc3RyaW5nJyB9O1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgcHVia2V5IGZvcm1hdFxuICBpZiAoIWV2ZW50LnB1YmtleSkge1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ01pc3NpbmcgcHVibGljIGtleScgfTtcbiAgfVxuXG4gIC8vIEdldCBwdWJrZXkgaGV4XG4gIGNvbnN0IHB1YmtleUhleCA9IGdldFB1YmxpY0tleUhleChldmVudC5wdWJrZXkpO1xuICBpZiAodHlwZW9mIHB1YmtleUhleCAhPT0gJ3N0cmluZycgfHwgIS9eWzAtOWEtZl17NjR9JC8udGVzdChwdWJrZXlIZXgpKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwdWJsaWMga2V5IGZvcm1hdCcgfTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHRhZ3NcbiAgaWYgKCFBcnJheS5pc0FycmF5KGV2ZW50LnRhZ3MpKSB7XG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRXZlbnQgdGFncyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICB9XG5cbiAgZm9yIChjb25zdCB0YWcgb2YgZXZlbnQudGFncykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh0YWcpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdFYWNoIHRhZyBtdXN0IGJlIGFuIGFycmF5JyB9O1xuICAgIH1cbiAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRW1wdHkgdGFncyBhcmUgbm90IGFsbG93ZWQnIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGFnWzBdICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnVGFnIGlkZW50aWZpZXIgbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZmlsdGVyIGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpZWxkcy5cbiAqIFxuICogQHBhcmFtIHtOb3N0ckZpbHRlcn0gZmlsdGVyIC0gVGhlIGZpbHRlciB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlRmlsdGVyKGZpbHRlcik7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyOiBOb3N0ckZpbHRlcik6IFZhbGlkYXRpb25SZXN1bHQge1xuICB0cnkge1xuICAgIC8vIFZhbGlkYXRlIGZpbHRlciBzdHJ1Y3R1cmVcbiAgICBpZiAoIWZpbHRlciB8fCB0eXBlb2YgZmlsdGVyICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBmaWx0ZXIgc3RydWN0dXJlJyB9O1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGlkcyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5pZHMgJiYgKCFBcnJheS5pc0FycmF5KGZpbHRlci5pZHMpIHx8ICFmaWx0ZXIuaWRzLmV2ZXJ5KGlkID0+IHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGlkcyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgYXV0aG9ycyBhcnJheSBpZiBwcmVzZW50XG4gICAgaWYgKGZpbHRlci5hdXRob3JzICYmICghQXJyYXkuaXNBcnJheShmaWx0ZXIuYXV0aG9ycykgfHwgIWZpbHRlci5hdXRob3JzLmV2ZXJ5KGF1dGhvciA9PiB0eXBlb2YgYXV0aG9yID09PSAnc3RyaW5nJykpKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgYXV0aG9ycyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2luZHMgYXJyYXkgaWYgcHJlc2VudFxuICAgIGlmIChmaWx0ZXIua2luZHMpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShmaWx0ZXIua2luZHMpKSB7XG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBraW5kcyBtdXN0IGJlIGFuIGFycmF5IG9mIG51bWJlcnMnIH07XG4gICAgICB9XG4gICAgICBpZiAoIWZpbHRlci5raW5kcy5ldmVyeShraW5kID0+IHR5cGVvZiBraW5kID09PSAnbnVtYmVyJyAmJiBOdW1iZXIuaXNJbnRlZ2VyKGtpbmQpICYmIGtpbmQgPj0gMCkpIHtcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIGtpbmRzIG11c3QgYmUgbm9uLW5lZ2F0aXZlIGludGVnZXJzJyB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHRpbWVzdGFtcHNcbiAgICBpZiAoZmlsdGVyLnNpbmNlICYmIHR5cGVvZiBmaWx0ZXIuc2luY2UgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgc2luY2UgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG4gICAgaWYgKGZpbHRlci51bnRpbCAmJiB0eXBlb2YgZmlsdGVyLnVudGlsICE9PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnRmlsdGVyIHVudGlsIG11c3QgYmUgYSBudW1iZXInIH07XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgbGltaXRcbiAgICBpZiAoZmlsdGVyLmxpbWl0ICYmIHR5cGVvZiBmaWx0ZXIubGltaXQgIT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWx0ZXIgbGltaXQgbXVzdCBiZSBhIG51bWJlcicgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzZWFyY2hcbiAgICBpZiAoZmlsdGVyLnNlYXJjaCAmJiB0eXBlb2YgZmlsdGVyLnNlYXJjaCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZpbHRlciBzZWFyY2ggbXVzdCBiZSBhIHN0cmluZycgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBmaWx0ZXInKTtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGYWlsZWQgdG8gdmFsaWRhdGUgZmlsdGVyJyB9O1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgc3Vic2NyaXB0aW9uIGJ5IGNoZWNraW5nIGl0cyBzdHJ1Y3R1cmUgYW5kIGZpbHRlcnMuXG4gKiBcbiAqIEBwYXJhbSB7Tm9zdHJTdWJzY3JpcHRpb259IHN1YnNjcmlwdGlvbiAtIFRoZSBzdWJzY3JpcHRpb24gdG8gdmFsaWRhdGVcbiAqIEByZXR1cm5zIHtWYWxpZGF0aW9uUmVzdWx0fSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdCBhbmQgYW55IGVycm9yIG1lc3NhZ2VcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBjb25zdCByZXN1bHQgPSB2YWxpZGF0ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pO1xuICogaWYgKCFyZXN1bHQuaXNWYWxpZCkge1xuICogICBjb25zb2xlLmVycm9yKHJlc3VsdC5lcnJvcik7XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbjogTm9zdHJTdWJzY3JpcHRpb24pOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICAvLyBWYWxpZGF0ZSBzdWJzY3JpcHRpb24gc3RydWN0dXJlXG4gICAgaWYgKCFzdWJzY3JpcHRpb24gfHwgdHlwZW9mIHN1YnNjcmlwdGlvbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ludmFsaWQgc3Vic2NyaXB0aW9uIHN0cnVjdHVyZScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBzdWJzY3JpcHRpb24gSURcbiAgICBpZiAoIXN1YnNjcmlwdGlvbi5pZCB8fCB0eXBlb2Ygc3Vic2NyaXB0aW9uLmlkICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnU3Vic2NyaXB0aW9uIG11c3QgaGF2ZSBhIHN0cmluZyBJRCcgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBmaWx0ZXJzIGFycmF5XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN1YnNjcmlwdGlvbi5maWx0ZXJzKSkge1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnU3Vic2NyaXB0aW9uIGZpbHRlcnMgbXVzdCBiZSBhbiBhcnJheScgfTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBlYWNoIGZpbHRlclxuICAgIGZvciAoY29uc3QgZmlsdGVyIG9mIHN1YnNjcmlwdGlvbi5maWx0ZXJzKSB7XG4gICAgICBjb25zdCBmaWx0ZXJWYWxpZGF0aW9uID0gdmFsaWRhdGVGaWx0ZXIoZmlsdGVyKTtcbiAgICAgIGlmICghZmlsdGVyVmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXJWYWxpZGF0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZhbGlkYXRlIHN1YnNjcmlwdGlvbicpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byB2YWxpZGF0ZSBzdWJzY3JpcHRpb24nIH07XG4gIH1cbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciByZWxheSByZXNwb25zZSBtZXNzYWdlLlxuICogXG4gKiBAcGFyYW0ge3Vua25vd259IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byB2YWxpZGF0ZVxuICogQHJldHVybnMge1ZhbGlkYXRpb25SZXN1bHR9IE9iamVjdCBjb250YWluaW5nIHZhbGlkYXRpb24gcmVzdWx0IGFuZCBhbnkgZXJyb3IgbWVzc2FnZVxuICogQGV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGNvbnN0IHJlc3VsdCA9IHZhbGlkYXRlUmVzcG9uc2UoWydFVkVOVCcsIGV2ZW50T2JqXSk7XG4gKiBpZiAoIXJlc3VsdC5pc1ZhbGlkKSB7XG4gKiAgIGNvbnNvbGUuZXJyb3IocmVzdWx0LmVycm9yKTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVSZXNwb25zZShtZXNzYWdlOiB1bmtub3duKTogVmFsaWRhdGlvblJlc3VsdCB7XG4gIC8vIENoZWNrIGlmIG1lc3NhZ2UgaXMgYW4gYXJyYXlcbiAgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbnZhbGlkIG1lc3NhZ2UgZm9ybWF0OiBtdXN0IGJlIGFuIGFycmF5J1xuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBpZiBtZXNzYWdlIGhhcyBhdCBsZWFzdCBvbmUgZWxlbWVudFxuICBpZiAobWVzc2FnZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ludmFsaWQgbWVzc2FnZSBmb3JtYXQ6IGFycmF5IGlzIGVtcHR5J1xuICAgIH07XG4gIH1cblxuICAvLyBDaGVjayBpZiBmaXJzdCBlbGVtZW50IGlzIGEgdmFsaWQgbWVzc2FnZSB0eXBlXG4gIGNvbnN0IHR5cGUgPSBtZXNzYWdlWzBdO1xuICBpZiAoIU9iamVjdC52YWx1ZXMoTm9zdHJNZXNzYWdlVHlwZSkuaW5jbHVkZXModHlwZSBhcyBOb3N0ck1lc3NhZ2VUeXBlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgIGVycm9yOiBgSW52YWxpZCBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gXG4gICAgfTtcbiAgfVxuXG4gIC8vIFR5cGUtc3BlY2lmaWMgdmFsaWRhdGlvblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuRVZFTlQ6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ0VWRU5UIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0ZVNpZ25lZEV2ZW50KG1lc3NhZ2VbMV0gYXMgU2lnbmVkTm9zdHJFdmVudCk7XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuTk9USUNFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnTk9USUNFIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cyB3aXRoIGEgc3RyaW5nIG1lc3NhZ2UnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuT0s6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDQgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnIHx8IFxuICAgICAgICAgIHR5cGVvZiBtZXNzYWdlWzJdICE9PSAnYm9vbGVhbicgfHwgXG4gICAgICAgICAgdHlwZW9mIG1lc3NhZ2VbM10gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdPSyBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDQgZWxlbWVudHM6IFt0eXBlLCBldmVudElkLCBzdWNjZXNzLCBtZXNzYWdlXSdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5FT1NFOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyIHx8IHR5cGVvZiBtZXNzYWdlWzFdICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGVycm9yOiAnRU9TRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5SRVE6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdSRVEgbWVzc2FnZSBtdXN0IGhhdmUgYXQgbGVhc3QgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZVsxXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc1ZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogJ1JFUSBtZXNzYWdlIG11c3QgaGF2ZSBhIHN0cmluZyBzdWJzY3JpcHRpb24gSUQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBWYWxpZGF0ZSBlYWNoIGZpbHRlciBpZiBwcmVzZW50XG4gICAgICBmb3IgKGxldCBpID0gMjsgaSA8IG1lc3NhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZmlsdGVyUmVzdWx0ID0gdmFsaWRhdGVGaWx0ZXIobWVzc2FnZVtpXSBhcyBOb3N0ckZpbHRlcik7XG4gICAgICAgIGlmICghZmlsdGVyUmVzdWx0LmlzVmFsaWQpIHtcbiAgICAgICAgICByZXR1cm4gZmlsdGVyUmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlIH07XG5cbiAgICBjYXNlIE5vc3RyTWVzc2FnZVR5cGUuQ0xPU0U6XG4gICAgICBpZiAobWVzc2FnZS5sZW5ndGggIT09IDIgfHwgdHlwZW9mIG1lc3NhZ2VbMV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdDTE9TRSBtZXNzYWdlIG11c3QgaGF2ZSBleGFjdGx5IDIgZWxlbWVudHMgd2l0aCBhIHN1YnNjcmlwdGlvbiBJRCdcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUgfTtcblxuICAgIGNhc2UgTm9zdHJNZXNzYWdlVHlwZS5BVVRIOlxuICAgICAgaWYgKG1lc3NhZ2UubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6ICdBVVRIIG1lc3NhZ2UgbXVzdCBoYXZlIGV4YWN0bHkgMiBlbGVtZW50cydcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0ZVNpZ25lZEV2ZW50KG1lc3NhZ2VbMV0gYXMgU2lnbmVkTm9zdHJFdmVudCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBgVW5zdXBwb3J0ZWQgbWVzc2FnZSB0eXBlOiAke3R5cGV9YFxuICAgICAgfTtcbiAgfVxufVxuIiwgIi8qKlxuICogQG1vZHVsZSBldmVudFxuICogQGRlc2NyaXB0aW9uIEV2ZW50IGhhbmRsaW5nIHV0aWxpdGllcyBmb3IgTm9zdHJcbiAqL1xuXG5leHBvcnQgeyBjcmVhdGVFdmVudCwgc2VyaWFsaXplRXZlbnQsIGdldEV2ZW50SGFzaCB9IGZyb20gJy4vY3JlYXRpb24nO1xuZXhwb3J0IHsgdmFsaWRhdGVFdmVudCwgY2FsY3VsYXRlRXZlbnRJZCB9IGZyb20gJy4vc2lnbmluZyc7XG4iLCAiLyoqXG4gKiBAbW9kdWxlIGV2ZW50L2NyZWF0aW9uXG4gKiBAZGVzY3JpcHRpb24gRXZlbnQgY3JlYXRpb24gYW5kIHNlcmlhbGl6YXRpb24gdXRpbGl0aWVzIGZvciBOb3N0clxuICovXG5cbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBOb3N0ckV2ZW50S2luZCB9IGZyb20gJy4uL3R5cGVzL2luZGV4JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IE5vc3RyIGV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBwYXJhbWV0ZXJzXG4gKiBAcGFyYW0gcGFyYW1zIC0gRXZlbnQgcGFyYW1ldGVyc1xuICogQHJldHVybnMgQ3JlYXRlZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXZlbnQocGFyYW1zOiB7XG4gIGtpbmQ6IE5vc3RyRXZlbnRLaW5kO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXVtdO1xuICBjcmVhdGVkX2F0PzogbnVtYmVyO1xuICBwdWJrZXk/OiBzdHJpbmc7XG59KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHsgXG4gICAga2luZCwgXG4gICAgY29udGVudCwgXG4gICAgdGFncyA9IFtdLCBcbiAgICBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksIFxuICAgIHB1YmtleSA9ICcnIFxuICB9ID0gcGFyYW1zO1xuICBcbiAgcmV0dXJuIHtcbiAgICBraW5kLFxuICAgIGNvbnRlbnQsXG4gICAgdGFncyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHB1YmtleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgTm9zdHIgZXZlbnQgZm9yIHNpZ25pbmcvaGFzaGluZyAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2VyaWFsaXplXG4gKiBAcmV0dXJucyBTZXJpYWxpemVkIGV2ZW50IEpTT04gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFdmVudChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudFxuICBdKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoYXNoIG9mIGEgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEV2ZW50IGhhc2ggaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXZlbnRIYXNoKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBldmVudCBoYXNoJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgZXZlbnQvc2lnbmluZ1xuICogQGRlc2NyaXB0aW9uIEV2ZW50IHNpZ25pbmcgYW5kIHZlcmlmaWNhdGlvbiB1dGlsaXRpZXMgZm9yIE5vc3RyXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uL3V0aWxzL2xvZ2dlcic7XG5pbXBvcnQgeyBnZXRFdmVudEhhc2ggfSBmcm9tICcuL2NyZWF0aW9uJztcbmltcG9ydCB0eXBlIHsgTm9zdHJFdmVudCwgU2lnbmVkTm9zdHJFdmVudCB9IGZyb20gJy4uL3R5cGVzJztcblxuLyoqXG4gKiBTaWducyBhIE5vc3RyIGV2ZW50IHdpdGggYSBwcml2YXRlIGtleSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBTaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsIFxuICBwcml2YXRlS2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBnZXRFdmVudEhhc2goZXZlbnQpO1xuICAgIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihoZXhUb0J5dGVzKGhhc2gpLCBoZXhUb0J5dGVzKHByaXZhdGVLZXkpKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogaGFzaCxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWcpLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGUgc2lnbmF0dXJlIG9mIGEgc2lnbmVkIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgc2lnbmF0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2Nobm9yci52ZXJpZnkoXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LnNpZyksXG4gICAgICBoZXhUb0J5dGVzKGV2ZW50LmlkKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQucHVia2V5KVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2ZXJpZnkgc2lnbmF0dXJlJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgTm9zdHIgZXZlbnRcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGV2ZW50IGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUV2ZW50KGV2ZW50OiBTaWduZWROb3N0ckV2ZW50KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgLy8gQ2hlY2sgcmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFldmVudC5pZCB8fCAhZXZlbnQucHVia2V5IHx8ICFldmVudC5zaWcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBWZXJpZnkgc2lnbmF0dXJlXG4gICAgcmV0dXJuIHZlcmlmeVNpZ25hdHVyZShldmVudCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0Vycm9yIHZhbGlkYXRpbmcgZXZlbnQnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldmVudCBJRCBmb3IgYSBOb3N0ciBldmVudFxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gY2FsY3VsYXRlIElEIGZvclxuICogQHJldHVybnMgRXZlbnQgSURcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUV2ZW50SWQoZXZlbnQ6IE5vc3RyRXZlbnQpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gZ2V0RXZlbnRIYXNoKGV2ZW50KTtcbn1cbiIsICIvKipcbiAqIEBtb2R1bGUgbmlwcy9uaXAtMDRcbiAqIEBkZXNjcmlwdGlvbiBJbXBsZW1lbnRhdGlvbiBvZiBOSVAtMDQgKEVuY3J5cHRlZCBEaXJlY3QgTWVzc2FnZXMpXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzA0Lm1kXG4gKi9cblxuaW1wb3J0IHsgc2VjcDI1NmsxIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuaW1wb3J0IHsgaGV4VG9CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi4vdXRpbHMvbG9nZ2VyJztcbmltcG9ydCB7IGJ5dGVzVG9CYXNlNjQsIGJhc2U2NFRvQnl0ZXMgfSBmcm9tICcuLi9lbmNvZGluZy9iYXNlNjQnO1xuaW1wb3J0IHR5cGUgeyBDcnlwdG9TdWJ0bGUgfSBmcm9tICcuLi9jcnlwdG8nO1xuXG5cbi8vIENvbmZpZ3VyZSBjcnlwdG8gZm9yIE5vZGUuanMgYW5kIHRlc3QgZW52aXJvbm1lbnRzXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG4gIGludGVyZmFjZSBHbG9iYWwge1xuICAgIGNyeXB0bzogQ3J5cHRvU3VidGxlO1xuICB9XG59XG5cbmNvbnN0IGdldENyeXB0byA9IGFzeW5jICgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4gPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNyeXB0bykge1xuICAgIHJldHVybiB3aW5kb3cuY3J5cHRvO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiAoZ2xvYmFsIGFzIEdsb2JhbCkuY3J5cHRvKSB7XG4gICAgcmV0dXJuIChnbG9iYWwgYXMgR2xvYmFsKS5jcnlwdG87XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBjcnlwdG9Nb2R1bGUgPSBhd2FpdCBpbXBvcnQoJ2NyeXB0bycpO1xuICAgIGlmIChjcnlwdG9Nb2R1bGUud2ViY3J5cHRvKSB7XG4gICAgICByZXR1cm4gY3J5cHRvTW9kdWxlLndlYmNyeXB0byBhcyBDcnlwdG9TdWJ0bGU7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBsb2dnZXIuZGVidWcoJ05vZGUgY3J5cHRvIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gV2ViQ3J5cHRvIGltcGxlbWVudGF0aW9uIGF2YWlsYWJsZScpO1xufTtcblxuY2xhc3MgQ3J5cHRvSW1wbGVtZW50YXRpb24ge1xuICBwcml2YXRlIGNyeXB0b0luc3RhbmNlOiBDcnlwdG9TdWJ0bGUgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBpbml0UHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRQcm9taXNlID0gdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5jcnlwdG9JbnN0YW5jZSA9IGF3YWl0IGdldENyeXB0bygpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBlbnN1cmVJbml0aWFsaXplZCgpOiBQcm9taXNlPENyeXB0b1N1YnRsZT4ge1xuICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgaWYgKCF0aGlzLmNyeXB0b0luc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NyeXB0byBpbXBsZW1lbnRhdGlvbiBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3J5cHRvSW5zdGFuY2U7XG4gIH1cblxuICBhc3luYyBnZXRTdWJ0bGUoKTogUHJvbWlzZTxDcnlwdG9TdWJ0bGVbJ3N1YnRsZSddPiB7XG4gICAgY29uc3QgY3J5cHRvID0gYXdhaXQgdGhpcy5lbnN1cmVJbml0aWFsaXplZCgpO1xuICAgIHJldHVybiBjcnlwdG8uc3VidGxlO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmFuZG9tVmFsdWVzPFQgZXh0ZW5kcyBVaW50OEFycmF5IHwgSW50OEFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDMyQXJyYXkgfCBJbnQzMkFycmF5PihhcnJheTogVCk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGNyeXB0byA9IGF3YWl0IHRoaXMuZW5zdXJlSW5pdGlhbGl6ZWQoKTtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gIH1cbn1cblxuY29uc3QgY3J5cHRvSW1wbCA9IG5ldyBDcnlwdG9JbXBsZW1lbnRhdGlvbigpO1xuXG5pbnRlcmZhY2UgU2hhcmVkU2VjcmV0IHtcbiAgc2hhcmVkU2VjcmV0OiBVaW50OEFycmF5O1xufVxuXG4vKipcbiAqIEVuY3J5cHRzIGEgbWVzc2FnZSB1c2luZyBOSVAtMDQgZW5jcnlwdGlvblxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSBzZW5kZXJQcml2S2V5IC0gU2VuZGVyJ3MgcHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSByZWNpcGllbnRQdWJLZXkgLSBSZWNpcGllbnQncyBwdWJsaWMga2V5XG4gKiBAcmV0dXJucyBFbmNyeXB0ZWQgbWVzc2FnZSBzdHJpbmdcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRNZXNzYWdlKFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIHNlbmRlclByaXZLZXk6IHN0cmluZyxcbiAgcmVjaXBpZW50UHViS2V5OiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgaWYgKCFtZXNzYWdlIHx8ICFzZW5kZXJQcml2S2V5IHx8ICFyZWNpcGllbnRQdWJLZXkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUga2V5c1xuICAgIGlmICghL15bMC05YS1mXXs2NH0kL2kudGVzdChzZW5kZXJQcml2S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByaXZhdGUga2V5IGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSBwdWJsaWMga2V5IGlzIGluIGNvcnJlY3QgZm9ybWF0XG4gICAgY29uc3QgcHViS2V5SGV4ID0gcmVjaXBpZW50UHViS2V5LnN0YXJ0c1dpdGgoJzAyJykgfHwgcmVjaXBpZW50UHViS2V5LnN0YXJ0c1dpdGgoJzAzJykgXG4gICAgICA/IHJlY2lwaWVudFB1YktleSBcbiAgICAgIDogJzAyJyArIHJlY2lwaWVudFB1YktleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhzZW5kZXJQcml2S2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICBjb25zdCBzaGFyZWRYID0gc2hhcmVkUG9pbnQuc2xpY2UoMSwgMzMpOyAvLyBVc2Ugb25seSB4LWNvb3JkaW5hdGVcblxuICAgIC8vIEltcG9ydCBrZXkgZm9yIEFFU1xuICAgIGNvbnN0IHNoYXJlZEtleSA9IGF3YWl0IChhd2FpdCBjcnlwdG9JbXBsLmdldFN1YnRsZSgpKS5pbXBvcnRLZXkoXG4gICAgICAncmF3JyxcbiAgICAgIHNoYXJlZFguYnVmZmVyLFxuICAgICAgeyBuYW1lOiAnQUVTLUNCQycsIGxlbmd0aDogMjU2IH0sXG4gICAgICBmYWxzZSxcbiAgICAgIFsnZW5jcnlwdCddXG4gICAgKTtcblxuICAgIC8vIFplcm8gc2hhcmVkIHNlY3JldCBtYXRlcmlhbCBub3cgdGhhdCBBRVMga2V5IGlzIGltcG9ydGVkXG4gICAgc2hhcmVkWC5maWxsKDApO1xuICAgIHNoYXJlZFBvaW50LmZpbGwoMCk7XG5cbiAgICAvLyBHZW5lcmF0ZSBJViBhbmQgZW5jcnlwdFxuICAgIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgIGF3YWl0IGNyeXB0b0ltcGwuZ2V0UmFuZG9tVmFsdWVzKGl2KTtcblxuICAgIGNvbnN0IGVuY29kZWQgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmVuY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIHNoYXJlZEtleSxcbiAgICAgIGVuY29kZWQuYnVmZmVyXG4gICAgKTtcblxuICAgIC8vIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIGNvbnN0IGNpcGhlcnRleHRCYXNlNjQgPSBieXRlc1RvQmFzZTY0KG5ldyBVaW50OEFycmF5KGVuY3J5cHRlZCkpO1xuICAgIGNvbnN0IGl2QmFzZTY0ID0gYnl0ZXNUb0Jhc2U2NChpdik7XG5cbiAgICByZXR1cm4gY2lwaGVydGV4dEJhc2U2NCArICc/aXY9JyArIGl2QmFzZTY0O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcih7IGVycm9yIH0sICdGYWlsZWQgdG8gZW5jcnlwdCBtZXNzYWdlJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNyeXB0cyBhIG1lc3NhZ2UgdXNpbmcgTklQLTA0IGRlY3J5cHRpb25cbiAqIEBwYXJhbSBlbmNyeXB0ZWRNZXNzYWdlIC0gRW5jcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKiBAcGFyYW0gcmVjaXBpZW50UHJpdktleSAtIFJlY2lwaWVudCdzIHByaXZhdGUga2V5XG4gKiBAcGFyYW0gc2VuZGVyUHViS2V5IC0gU2VuZGVyJ3MgcHVibGljIGtleVxuICogQHJldHVybnMgRGVjcnlwdGVkIG1lc3NhZ2Ugc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0TWVzc2FnZShcbiAgZW5jcnlwdGVkTWVzc2FnZTogc3RyaW5nLFxuICByZWNpcGllbnRQcml2S2V5OiBzdHJpbmcsXG4gIHNlbmRlclB1YktleTogc3RyaW5nXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICB0cnkge1xuICAgIGlmICghZW5jcnlwdGVkTWVzc2FnZSB8fCAhcmVjaXBpZW50UHJpdktleSB8fCAhc2VuZGVyUHViS2V5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQgcGFyYW1ldGVycycpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIGtleXNcbiAgICBpZiAoIS9eWzAtOWEtZl17NjR9JC9pLnRlc3QocmVjaXBpZW50UHJpdktleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcml2YXRlIGtleSBmb3JtYXQnKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgcHVibGljIGtleSBpcyBpbiBjb3JyZWN0IGZvcm1hdFxuICAgIGNvbnN0IHB1YktleUhleCA9IHNlbmRlclB1YktleS5zdGFydHNXaXRoKCcwMicpIHx8IHNlbmRlclB1YktleS5zdGFydHNXaXRoKCcwMycpXG4gICAgICA/IHNlbmRlclB1YktleVxuICAgICAgOiAnMDInICsgc2VuZGVyUHViS2V5O1xuXG4gICAgLy8gR2VuZXJhdGUgc2hhcmVkIHNlY3JldFxuICAgIGNvbnN0IHNoYXJlZFBvaW50ID0gc2VjcDI1NmsxLmdldFNoYXJlZFNlY3JldChoZXhUb0J5dGVzKHJlY2lwaWVudFByaXZLZXkpLCBoZXhUb0J5dGVzKHB1YktleUhleCkpO1xuICAgIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zbGljZSgxLCAzMyk7IC8vIFVzZSBvbmx5IHgtY29vcmRpbmF0ZVxuXG4gICAgLy8gSW1wb3J0IGtleSBmb3IgQUVTXG4gICAgY29uc3Qgc2hhcmVkS2V5ID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmltcG9ydEtleShcbiAgICAgICdyYXcnLFxuICAgICAgc2hhcmVkWC5idWZmZXIsXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgbGVuZ3RoOiAyNTYgfSxcbiAgICAgIGZhbHNlLFxuICAgICAgWydkZWNyeXB0J11cbiAgICApO1xuXG4gICAgLy8gWmVybyBzaGFyZWQgc2VjcmV0IG1hdGVyaWFsIG5vdyB0aGF0IEFFUyBrZXkgaXMgaW1wb3J0ZWRcbiAgICBzaGFyZWRYLmZpbGwoMCk7XG4gICAgc2hhcmVkUG9pbnQuZmlsbCgwKTtcblxuICAgIC8vIFBhcnNlIE5JUC0wNCBzdGFuZGFyZCBmb3JtYXQ6IGJhc2U2NChjaXBoZXJ0ZXh0KSArIFwiP2l2PVwiICsgYmFzZTY0KGl2KVxuICAgIC8vIEFsc28gc3VwcG9ydCBsZWdhY3kgaGV4IGZvcm1hdCAoaXYgKyBjaXBoZXJ0ZXh0IGNvbmNhdGVuYXRlZCkgYXMgZmFsbGJhY2tcbiAgICBsZXQgaXY6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXk7XG5cbiAgICBpZiAoZW5jcnlwdGVkTWVzc2FnZS5pbmNsdWRlcygnP2l2PScpKSB7XG4gICAgICAvLyBOSVAtMDQgc3RhbmRhcmQgZm9ybWF0XG4gICAgICBjb25zdCBbY2lwaGVydGV4dEJhc2U2NCwgaXZCYXNlNjRdID0gZW5jcnlwdGVkTWVzc2FnZS5zcGxpdCgnP2l2PScpO1xuICAgICAgY2lwaGVydGV4dCA9IGJhc2U2NFRvQnl0ZXMoY2lwaGVydGV4dEJhc2U2NCk7XG4gICAgICBpdiA9IGJhc2U2NFRvQnl0ZXMoaXZCYXNlNjQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWdhY3kgaGV4IGZvcm1hdCBmYWxsYmFjazogZmlyc3QgMTYgYnl0ZXMgYXJlIElWLCByZXN0IGlzIGNpcGhlcnRleHRcbiAgICAgIGNvbnN0IGVuY3J5cHRlZCA9IGhleFRvQnl0ZXMoZW5jcnlwdGVkTWVzc2FnZSk7XG4gICAgICBpdiA9IGVuY3J5cHRlZC5zbGljZSgwLCAxNik7XG4gICAgICBjaXBoZXJ0ZXh0ID0gZW5jcnlwdGVkLnNsaWNlKDE2KTtcbiAgICB9XG5cbiAgICAvLyBEZWNyeXB0XG4gICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgKGF3YWl0IGNyeXB0b0ltcGwuZ2V0U3VidGxlKCkpLmRlY3J5cHQoXG4gICAgICB7IG5hbWU6ICdBRVMtQ0JDJywgaXYgfSxcbiAgICAgIHNoYXJlZEtleSxcbiAgICAgIGNpcGhlcnRleHQuYnVmZmVyIGFzIEFycmF5QnVmZmVyXG4gICAgKTtcblxuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGVjcnlwdGVkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGRlY3J5cHQgbWVzc2FnZScpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgc2hhcmVkIHNlY3JldCBmb3IgTklQLTA0IGVuY3J5cHRpb25cbiAqIEBwYXJhbSBwcml2YXRlS2V5IC0gUHJpdmF0ZSBrZXlcbiAqIEBwYXJhbSBwdWJsaWNLZXkgLSBQdWJsaWMga2V5XG4gKiBAcmV0dXJucyBTaGFyZWQgc2VjcmV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNoYXJlZFNlY3JldChcbiAgcHJpdmF0ZUtleTogc3RyaW5nLFxuICBwdWJsaWNLZXk6IHN0cmluZ1xuKTogU2hhcmVkU2VjcmV0IHtcbiAgdHJ5IHtcbiAgICBpZiAoIXByaXZhdGVLZXkgfHwgIXB1YmxpY0tleSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBrZXlzXG4gICAgaWYgKCEvXlswLTlhLWZdezY0fSQvaS50ZXN0KHByaXZhdGVLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJpdmF0ZSBrZXkgZm9ybWF0Jyk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHB1YmxpYyBrZXkgaXMgaW4gY29ycmVjdCBmb3JtYXRcbiAgICBjb25zdCBwdWJLZXlIZXggPSBwdWJsaWNLZXkuc3RhcnRzV2l0aCgnMDInKSB8fCBwdWJsaWNLZXkuc3RhcnRzV2l0aCgnMDMnKVxuICAgICAgPyBwdWJsaWNLZXlcbiAgICAgIDogJzAyJyArIHB1YmxpY0tleTtcblxuICAgIC8vIEdlbmVyYXRlIHNoYXJlZCBzZWNyZXRcbiAgICBjb25zdCBzaGFyZWRQb2ludCA9IHNlY3AyNTZrMS5nZXRTaGFyZWRTZWNyZXQoaGV4VG9CeXRlcyhwcml2YXRlS2V5KSwgaGV4VG9CeXRlcyhwdWJLZXlIZXgpKTtcbiAgICByZXR1cm4geyBzaGFyZWRTZWNyZXQ6IHNoYXJlZFBvaW50LnNsaWNlKDEsIDMzKSB9OyAvLyBSZXR1cm4gb25seSB4LWNvb3JkaW5hdGVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdlbmVyYXRlIHNoYXJlZCBzZWNyZXQnKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5leHBvcnQgeyBnZW5lcmF0ZVNoYXJlZFNlY3JldCBhcyBjb21wdXRlU2hhcmVkU2VjcmV0IH07XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTAxXG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTAxOiBCYXNpYyBQcm90b2NvbCBGbG93IERlc2NyaXB0aW9uXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IHNoYTI1NiB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvc2hhMi5qcyc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuaW1wb3J0IHR5cGUgeyBOb3N0ckV2ZW50LCBTaWduZWROb3N0ckV2ZW50IH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgTm9zdHIgZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHBhcmFtZXRlcnMgKE5JUC0wMSlcbiAqIEBwYXJhbSBwYXJhbXMgLSBFdmVudCBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBDcmVhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFdmVudChwYXJhbXM6IHtcbiAga2luZDogbnVtYmVyO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRhZ3M/OiBzdHJpbmdbXVtdO1xuICBjcmVhdGVkX2F0PzogbnVtYmVyO1xuICBwdWJrZXk/OiBzdHJpbmc7XG59KTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHsgXG4gICAga2luZCwgXG4gICAgY29udGVudCwgXG4gICAgdGFncyA9IFtdLCBcbiAgICBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCksIFxuICAgIHB1YmtleSA9ICcnIFxuICB9ID0gcGFyYW1zO1xuICBcbiAgcmV0dXJuIHtcbiAgICBraW5kLFxuICAgIGNvbnRlbnQsXG4gICAgdGFncyxcbiAgICBjcmVhdGVkX2F0LFxuICAgIHB1YmtleSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGEgTm9zdHIgZXZlbnQgZm9yIHNpZ25pbmcvaGFzaGluZyAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2VyaWFsaXplXG4gKiBAcmV0dXJucyBTZXJpYWxpemVkIGV2ZW50IEpTT04gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFdmVudChldmVudDogTm9zdHJFdmVudCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudFxuICBdKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBoYXNoIG9mIGEgTm9zdHIgZXZlbnQgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIGhhc2hcbiAqIEByZXR1cm5zIEV2ZW50IGhhc2ggaW4gaGV4IGZvcm1hdFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RXZlbnRIYXNoKGV2ZW50OiBOb3N0ckV2ZW50KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzZXJpYWxpemVkID0gc2VyaWFsaXplRXZlbnQoZXZlbnQpO1xuICAgIGNvbnN0IGhhc2ggPSBzaGEyNTYobmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlcmlhbGl6ZWQpKTtcbiAgICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIGdldCBldmVudCBoYXNoJyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBTaWducyBhIE5vc3RyIGV2ZW50IHdpdGggYSBwcml2YXRlIGtleSAoTklQLTAxKVxuICogQHBhcmFtIGV2ZW50IC0gRXZlbnQgdG8gc2lnblxuICogQHBhcmFtIHByaXZhdGVLZXkgLSBQcml2YXRlIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBTaWduZWQgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpZ25FdmVudChcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsIFxuICBwcml2YXRlS2V5OiBzdHJpbmdcbik6IFByb21pc2U8U2lnbmVkTm9zdHJFdmVudD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGhhc2ggPSBhd2FpdCBnZXRFdmVudEhhc2goZXZlbnQpO1xuICAgIGNvbnN0IHNpZyA9IHNjaG5vcnIuc2lnbihoZXhUb0J5dGVzKGhhc2gpLCBoZXhUb0J5dGVzKHByaXZhdGVLZXkpKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZXZlbnQsXG4gICAgICBpZDogaGFzaCxcbiAgICAgIHNpZzogYnl0ZXNUb0hleChzaWcpLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byBzaWduIGV2ZW50Jyk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGUgc2lnbmF0dXJlIG9mIGEgc2lnbmVkIE5vc3RyIGV2ZW50IChOSVAtMDEpXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byB2ZXJpZnlcbiAqIEByZXR1cm5zIFRydWUgaWYgc2lnbmF0dXJlIGlzIHZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2ZXJpZnlTaWduYXR1cmUoZXZlbnQ6IFNpZ25lZE5vc3RyRXZlbnQpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICAvLyBWZXJpZnkgZXZlbnQgSURcbiAgICBjb25zdCBleHBlY3RlZElkID0gY2FsY3VsYXRlRXZlbnRJZChldmVudCk7XG4gICAgaWYgKGV2ZW50LmlkICE9PSBleHBlY3RlZElkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHNpZ25hdHVyZVxuICAgIHJldHVybiBzY2hub3JyLnZlcmlmeShcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuc2lnKSxcbiAgICAgIGhleFRvQnl0ZXMoZXZlbnQuaWQpLFxuICAgICAgaGV4VG9CeXRlcyhldmVudC5wdWJrZXkpXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoeyBlcnJvciB9LCAnRmFpbGVkIHRvIHZlcmlmeSBzaWduYXR1cmUnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldmVudCBJRCBhY2NvcmRpbmcgdG8gTklQLTAxXG4gKiBAcGFyYW0gZXZlbnQgLSBFdmVudCB0byBjYWxjdWxhdGUgSUQgZm9yXG4gKiBAcmV0dXJucyBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVFdmVudElkKGV2ZW50OiBOb3N0ckV2ZW50KTogc3RyaW5nIHtcbiAgY29uc3Qgc2VyaWFsaXplZCA9IHNlcmlhbGl6ZUV2ZW50KGV2ZW50KTtcbiAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc2VyaWFsaXplZCkpO1xuICByZXR1cm4gYnl0ZXNUb0hleChoYXNoKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBOb3N0ciBldmVudCBzdHJ1Y3R1cmUgKE5JUC0wMSlcbiAqIEBwYXJhbSBldmVudCAtIEV2ZW50IHRvIHZhbGlkYXRlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGV2ZW50IHN0cnVjdHVyZSBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFdmVudChldmVudDogTm9zdHJFdmVudCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgZXZlbnQuY29udGVudCAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZW9mIGV2ZW50LmNyZWF0ZWRfYXQgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiBldmVudC5raW5kICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShldmVudC50YWdzKSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlb2YgZXZlbnQucHVia2V5ICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIC8vIFZhbGlkYXRlIHRhZ3Mgc3RydWN0dXJlXG4gICAgZm9yIChjb25zdCB0YWcgb2YgZXZlbnQudGFncykge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRhZykpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0YWcubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAodHlwZW9mIHRhZ1swXSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nZ2VyLmVycm9yKHsgZXJyb3IgfSwgJ0ZhaWxlZCB0byB2YWxpZGF0ZSBldmVudCcpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwgIi8qKlxuICogTklQLTE5OiBiZWNoMzItZW5jb2RlZCBlbnRpdGllc1xuICogSW1wbGVtZW50cyBlbmNvZGluZyBhbmQgZGVjb2Rpbmcgb2YgTm9zdHIgZW50aXRpZXMgdXNpbmcgYmVjaDMyIGZvcm1hdFxuICovXG5cbmltcG9ydCB7IGJlY2gzMiB9IGZyb20gJ2JlY2gzMic7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXInO1xuXG5leHBvcnQgdHlwZSBOaXAxOURhdGFUeXBlID0gJ25wdWInIHwgJ25zZWMnIHwgJ25vdGUnIHwgJ25wcm9maWxlJyB8ICduZXZlbnQnIHwgJ25hZGRyJyB8ICducmVsYXknO1xuXG5jb25zdCBWQUxJRF9QUkVGSVhFUzogTmlwMTlEYXRhVHlwZVtdID0gWyducHViJywgJ25zZWMnLCAnbm90ZScsICducHJvZmlsZScsICduZXZlbnQnLCAnbmFkZHInLCAnbnJlbGF5J107XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmlwMTlEYXRhIHtcbiAgdHlwZTogTmlwMTlEYXRhVHlwZTtcbiAgZGF0YTogc3RyaW5nO1xuICByZWxheXM/OiBzdHJpbmdbXTtcbiAgYXV0aG9yPzogc3RyaW5nO1xuICBraW5kPzogbnVtYmVyO1xuICBpZGVudGlmaWVyPzogc3RyaW5nOyAvLyBGb3IgbmFkZHJcbn1cblxuLy8gVExWIHR5cGUgY29uc3RhbnRzXG5jb25zdCBUTFZfVFlQRVMgPSB7XG4gIFNQRUNJQUw6IDAsICAgLy8gTWFpbiBkYXRhIChoZXgpXG4gIFJFTEFZOiAxLCAgICAgLy8gUmVsYXkgVVJMICh1dGY4KVxuICBBVVRIT1I6IDIsICAgIC8vIEF1dGhvciBwdWJrZXkgKGhleClcbiAgS0lORDogMywgICAgICAvLyBFdmVudCBraW5kICh1aW50OClcbiAgSURFTlRJRklFUjogNCAvLyBJZGVudGlmaWVyICh1dGY4KVxufSBhcyBjb25zdDtcblxuLyoqXG4gKiBFbmNvZGUgYSBwdWJsaWMga2V5IGFzIGFuIG5wdWJcbiAqIEBwYXJhbSBwdWJrZXkgUHVibGljIGtleSBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucHViIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIHB1YmtleSBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucHViRW5jb2RlKHB1YmtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShwdWJrZXksICdoZXgnKTtcbiAgY29uc3Qgd29yZHMgPSBiZWNoMzIudG9Xb3JkcyhkYXRhKTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25wdWInLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgcHJpdmF0ZSBrZXkgYXMgYW4gbnNlY1xuICogQHBhcmFtIHByaXZrZXkgUHJpdmF0ZSBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnNlYyBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwcml2a2V5IGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5zZWNFbmNvZGUocHJpdmtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHJpdmtleSwgNjQpO1xuICBjb25zdCBkYXRhID0gQnVmZmVyLmZyb20ocHJpdmtleSwgJ2hleCcpO1xuICBjb25zdCB3b3JkcyA9IGJlY2gzMi50b1dvcmRzKGRhdGEpO1xuICByZXR1cm4gYmVjaDMyLmVuY29kZSgnbnNlYycsIHdvcmRzLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gZXZlbnQgSUQgYXMgYSBub3RlXG4gKiBAcGFyYW0gZXZlbnRJZCBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBub3RlIHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIGV2ZW50SWQgaXMgaW52YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm90ZUVuY29kZShldmVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZUhleFN0cmluZyhldmVudElkLCA2NCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbShldmVudElkLCAnaGV4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCdub3RlJywgd29yZHMsIDEwMDApO1xufVxuXG4vKipcbiAqIEVuY29kZSBwcm9maWxlIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gcHVia2V5IFB1YmxpYyBrZXkgaW4gaGV4IGZvcm1hdFxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBucHJvZmlsZSBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwdWJrZXkgaXMgaW52YWxpZCBvciByZWxheXMgYXJlIG1hbGZvcm1lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbnByb2ZpbGVFbmNvZGUocHVia2V5OiBzdHJpbmcsIHJlbGF5cz86IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGlmIChyZWxheXMpIHtcbiAgICByZWxheXMuZm9yRWFjaCh2YWxpZGF0ZVJlbGF5VXJsKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBlbmNvZGVUTFYoe1xuICAgIHR5cGU6ICducHJvZmlsZScsXG4gICAgZGF0YTogcHVia2V5LFxuICAgIHJlbGF5c1xuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25wcm9maWxlJywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGV2ZW50IGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gZXZlbnRJZCBFdmVudCBJRCBpbiBoZXggZm9ybWF0XG4gKiBAcGFyYW0gcmVsYXlzIE9wdGlvbmFsIHJlbGF5IFVSTHNcbiAqIEBwYXJhbSBhdXRob3IgT3B0aW9uYWwgYXV0aG9yIHB1YmxpYyBrZXlcbiAqIEBwYXJhbSBraW5kIE9wdGlvbmFsIGV2ZW50IGtpbmRcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5ldmVudCBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXZlbnRFbmNvZGUoXG4gIGV2ZW50SWQ6IHN0cmluZyxcbiAgcmVsYXlzPzogc3RyaW5nW10sXG4gIGF1dGhvcj86IHN0cmluZyxcbiAga2luZD86IG51bWJlclxuKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcoZXZlbnRJZCwgNjQpO1xuICBpZiAocmVsYXlzKSB7XG4gICAgcmVsYXlzLmZvckVhY2godmFsaWRhdGVSZWxheVVybCk7XG4gIH1cbiAgaWYgKGF1dGhvcikge1xuICAgIHZhbGlkYXRlSGV4U3RyaW5nKGF1dGhvciwgNjQpO1xuICB9XG4gIGlmIChraW5kICE9PSB1bmRlZmluZWQgJiYgIU51bWJlci5pc0ludGVnZXIoa2luZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZXZlbnQga2luZCcpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25ldmVudCcsXG4gICAgZGF0YTogZXZlbnRJZCxcbiAgICByZWxheXMsXG4gICAgYXV0aG9yLFxuICAgIGtpbmRcbiAgfSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCduZXZlbnQnLCBkYXRhLCAxMDAwKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gYWRkcmVzcyAoTklQLTMzKVxuICogQHBhcmFtIHB1YmtleSBBdXRob3IncyBwdWJsaWMga2V5XG4gKiBAcGFyYW0ga2luZCBFdmVudCBraW5kXG4gKiBAcGFyYW0gaWRlbnRpZmllciBTdHJpbmcgaWRlbnRpZmllclxuICogQHBhcmFtIHJlbGF5cyBPcHRpb25hbCByZWxheSBVUkxzXG4gKiBAcmV0dXJucyBiZWNoMzItZW5jb2RlZCBuYWRkciBzdHJpbmdcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuYWRkckVuY29kZShcbiAgcHVia2V5OiBzdHJpbmcsXG4gIGtpbmQ6IG51bWJlcixcbiAgaWRlbnRpZmllcjogc3RyaW5nLFxuICByZWxheXM/OiBzdHJpbmdbXVxuKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVIZXhTdHJpbmcocHVia2V5LCA2NCk7XG4gIGlmICghTnVtYmVyLmlzSW50ZWdlcihraW5kKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBldmVudCBraW5kJyk7XG4gIH1cbiAgaWYgKCFpZGVudGlmaWVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJZGVudGlmaWVyIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKHJlbGF5cykge1xuICAgIHJlbGF5cy5mb3JFYWNoKHZhbGlkYXRlUmVsYXlVcmwpO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IGVuY29kZVRMVih7XG4gICAgdHlwZTogJ25hZGRyJyxcbiAgICBkYXRhOiBwdWJrZXksXG4gICAga2luZCxcbiAgICBpZGVudGlmaWVyLFxuICAgIHJlbGF5c1xuICB9KTtcbiAgcmV0dXJuIGJlY2gzMi5lbmNvZGUoJ25hZGRyJywgZGF0YSwgMTAwMCk7XG59XG5cbi8qKlxuICogRW5jb2RlIGEgcmVsYXkgVVJMXG4gKiBAcGFyYW0gdXJsIFJlbGF5IFVSTFxuICogQHJldHVybnMgYmVjaDMyLWVuY29kZWQgbnJlbGF5IHN0cmluZ1xuICogQHRocm93cyB7RXJyb3J9IElmIFVSTCBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBucmVsYXlFbmNvZGUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVJlbGF5VXJsKHVybCk7XG4gIGNvbnN0IGRhdGEgPSBCdWZmZXIuZnJvbSh1cmwsICd1dGY4Jyk7XG4gIGNvbnN0IHdvcmRzID0gYmVjaDMyLnRvV29yZHMoZGF0YSk7XG4gIHJldHVybiBiZWNoMzIuZW5jb2RlKCducmVsYXknLCB3b3JkcywgMTAwMCk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgYmVjaDMyLWVuY29kZWQgTm9zdHIgZW50aXR5XG4gKiBAcGFyYW0gc3RyIGJlY2gzMi1lbmNvZGVkIHN0cmluZ1xuICogQHJldHVybnMgRGVjb2RlZCBkYXRhIHdpdGggdHlwZSBhbmQgbWV0YWRhdGFcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBzdHJpbmcgaXMgaW52YWxpZCBvciBtYWxmb3JtZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShzdHI6IHN0cmluZyk6IE5pcDE5RGF0YSB7XG4gIGlmICghc3RyLmluY2x1ZGVzKCcxJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYmVjaDMyIHN0cmluZycpO1xuICB9XG5cbiAgY29uc3QgcHJlZml4ID0gc3RyLnNwbGl0KCcxJylbMF0udG9Mb3dlckNhc2UoKTtcbiAgaWYgKCFWQUxJRF9QUkVGSVhFUy5pbmNsdWRlcyhwcmVmaXggYXMgTmlwMTlEYXRhVHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJlZml4Jyk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRlY29kZWQgPSBiZWNoMzIuZGVjb2RlKHN0ciwgMTAwMCk7XG4gICAgY29uc3QgZGF0YSA9IEJ1ZmZlci5mcm9tKGJlY2gzMi5mcm9tV29yZHMoZGVjb2RlZC53b3JkcykpO1xuXG4gICAgLy8gRm9yIG5yZWxheSB0eXBlXG4gICAgbGV0IHVybDogc3RyaW5nO1xuICAgIC8vIEZvciBUTFYgdHlwZXNcbiAgICBsZXQgZGVjb2RlZERhdGE6IE5pcDE5RGF0YTtcblxuICAgIHN3aXRjaCAoZGVjb2RlZC5wcmVmaXgpIHtcbiAgICAgIGNhc2UgJ25wdWInOlxuICAgICAgY2FzZSAnbnNlYyc6XG4gICAgICBjYXNlICdub3RlJzpcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcoZGF0YS50b1N0cmluZygnaGV4JyksIDY0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBkZWNvZGVkLnByZWZpeCBhcyBOaXAxOURhdGFUeXBlLFxuICAgICAgICAgIGRhdGE6IGRhdGEudG9TdHJpbmcoJ2hleCcpXG4gICAgICAgIH07XG4gICAgICBjYXNlICducmVsYXknOlxuICAgICAgICB1cmwgPSBkYXRhLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIHZhbGlkYXRlUmVsYXlVcmwodXJsKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnbnJlbGF5JyxcbiAgICAgICAgICBkYXRhOiB1cmxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ25wcm9maWxlJzpcbiAgICAgIGNhc2UgJ25ldmVudCc6XG4gICAgICBjYXNlICduYWRkcic6XG4gICAgICAgIGRlY29kZWREYXRhID0gZGVjb2RlVExWKGRlY29kZWQucHJlZml4IGFzIE5pcDE5RGF0YVR5cGUsIGRhdGEpO1xuICAgICAgICByZXR1cm4gZGVjb2RlZERhdGE7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcHJlZml4Jyk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJlY2gzMiBzdHJpbmcnKTtcbiAgfVxufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbmZ1bmN0aW9uIHZhbGlkYXRlSGV4U3RyaW5nKHN0cjogc3RyaW5nLCBsZW5ndGg/OiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCEvXlswLTlhLWZBLUZdKyQvLnRlc3Qoc3RyKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGxlbmd0aCAmJiBzdHIubGVuZ3RoICE9PSBsZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgaGV4IHN0cmluZyBsZW5ndGggKGV4cGVjdGVkICR7bGVuZ3RofSlgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVJlbGF5VXJsKHVybDogc3RyaW5nKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgIGlmICghWyd3czonLCAnd3NzOiddLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxheSBVUkwgcHJvdG9jb2wnKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxheSBVUkwnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGVUTFYoZGF0YTogTmlwMTlEYXRhKTogbnVtYmVyW10ge1xuICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XG4gIFxuICAvLyBTcGVjaWFsICh0eXBlIDApOiBtYWluIGRhdGFcbiAgY29uc3QgYnl0ZXMgPSBCdWZmZXIuZnJvbShkYXRhLmRhdGEsICdoZXgnKTtcbiAgcmVzdWx0LnB1c2goVExWX1RZUEVTLlNQRUNJQUwsIGJ5dGVzLmxlbmd0aCk7XG4gIHJlc3VsdC5wdXNoKC4uLmJ5dGVzKTtcblxuICAvLyBSZWxheSAodHlwZSAxKTogcmVsYXkgVVJMc1xuICBpZiAoZGF0YS5yZWxheXM/Lmxlbmd0aCkge1xuICAgIGZvciAoY29uc3QgcmVsYXkgb2YgZGF0YS5yZWxheXMpIHtcbiAgICAgIGNvbnN0IHJlbGF5Qnl0ZXMgPSBCdWZmZXIuZnJvbShyZWxheSwgJ3V0ZjgnKTtcbiAgICAgIHJlc3VsdC5wdXNoKFRMVl9UWVBFUy5SRUxBWSwgcmVsYXlCeXRlcy5sZW5ndGgpO1xuICAgICAgcmVzdWx0LnB1c2goLi4ucmVsYXlCeXRlcyk7XG4gICAgfVxuICB9XG5cbiAgLy8gQXV0aG9yICh0eXBlIDIpOiBhdXRob3IgcHVia2V5XG4gIGlmIChkYXRhLmF1dGhvcikge1xuICAgIGNvbnN0IGF1dGhvckJ5dGVzID0gQnVmZmVyLmZyb20oZGF0YS5hdXRob3IsICdoZXgnKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuQVVUSE9SLCBhdXRob3JCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmF1dGhvckJ5dGVzKTtcbiAgfVxuXG4gIC8vIEtpbmQgKHR5cGUgMyk6IGV2ZW50IGtpbmRcbiAgaWYgKGRhdGEua2luZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qga2luZEJ5dGVzID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGtpbmRCeXRlcy53cml0ZVVJbnQzMkJFKGRhdGEua2luZCk7XG4gICAgcmVzdWx0LnB1c2goVExWX1RZUEVTLktJTkQsIGtpbmRCeXRlcy5sZW5ndGgpO1xuICAgIHJlc3VsdC5wdXNoKC4uLmtpbmRCeXRlcyk7XG4gIH1cblxuICAvLyBJZGVudGlmaWVyICh0eXBlIDQpOiBmb3IgbmFkZHJcbiAgaWYgKGRhdGEuaWRlbnRpZmllcikge1xuICAgIGNvbnN0IGlkZW50aWZpZXJCeXRlcyA9IEJ1ZmZlci5mcm9tKGRhdGEuaWRlbnRpZmllciwgJ3V0ZjgnKTtcbiAgICByZXN1bHQucHVzaChUTFZfVFlQRVMuSURFTlRJRklFUiwgaWRlbnRpZmllckJ5dGVzLmxlbmd0aCk7XG4gICAgcmVzdWx0LnB1c2goLi4uaWRlbnRpZmllckJ5dGVzKTtcbiAgfVxuXG4gIHJldHVybiBiZWNoMzIudG9Xb3JkcyhCdWZmZXIuZnJvbShyZXN1bHQpKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVExWKHByZWZpeDogTmlwMTlEYXRhVHlwZSwgZGF0YTogQnVmZmVyKTogTmlwMTlEYXRhIHtcbiAgY29uc3QgcmVzdWx0OiBOaXAxOURhdGEgPSB7XG4gICAgdHlwZTogcHJlZml4LFxuICAgIGRhdGE6ICcnLFxuICAgIHJlbGF5czogW11cbiAgfTtcblxuICBsZXQgaSA9IDA7XG4gIC8vIEZvciByZWxheSB0eXBlXG4gIGxldCByZWxheTogc3RyaW5nO1xuXG4gIHdoaWxlIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICBjb25zdCB0eXBlID0gZGF0YVtpXTtcbiAgICBjb25zdCBsZW5ndGggPSBkYXRhW2kgKyAxXTtcbiAgICBcbiAgICBpZiAoaSArIDIgKyBsZW5ndGggPiBkYXRhLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFRMViBkYXRhJyk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHZhbHVlID0gZGF0YS5zbGljZShpICsgMiwgaSArIDIgKyBsZW5ndGgpO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5TUEVDSUFMOlxuICAgICAgICByZXN1bHQuZGF0YSA9IHZhbHVlLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgdmFsaWRhdGVIZXhTdHJpbmcocmVzdWx0LmRhdGEsIDY0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5SRUxBWTpcbiAgICAgICAgcmVsYXkgPSB2YWx1ZS50b1N0cmluZygndXRmOCcpO1xuICAgICAgICB2YWxpZGF0ZVJlbGF5VXJsKHJlbGF5KTtcbiAgICAgICAgcmVzdWx0LnJlbGF5cyA9IHJlc3VsdC5yZWxheXMgfHwgW107XG4gICAgICAgIHJlc3VsdC5yZWxheXMucHVzaChyZWxheSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuQVVUSE9SOlxuICAgICAgICByZXN1bHQuYXV0aG9yID0gdmFsdWUudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgICB2YWxpZGF0ZUhleFN0cmluZyhyZXN1bHQuYXV0aG9yLCA2NCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUTFZfVFlQRVMuS0lORDpcbiAgICAgICAgcmVzdWx0LmtpbmQgPSB2YWx1ZS5yZWFkVUludDMyQkUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRMVl9UWVBFUy5JREVOVElGSUVSOlxuICAgICAgICByZXN1bHQuaWRlbnRpZmllciA9IHZhbHVlLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gU2tpcCB1bmtub3duIFRMViB0eXBlc1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpICs9IDIgKyBsZW5ndGg7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwgIi8qKlxuICogTklQLTI2OiBEZWxlZ2F0ZWQgRXZlbnQgU2lnbmluZ1xuICogSW1wbGVtZW50cyBkZWxlZ2F0aW9uIG9mIGV2ZW50IHNpZ25pbmcgY2FwYWJpbGl0aWVzXG4gKi9cblxuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IE5vc3RyRXZlbnQgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBzaWduU2Nobm9yciwgdmVyaWZ5U2Nobm9yclNpZ25hdHVyZSB9IGZyb20gJy4uL2NyeXB0byc7XG5pbXBvcnQgeyBieXRlc1RvSGV4LCBoZXhUb0J5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzY2hub3JyIH0gZnJvbSAnQG5vYmxlL2N1cnZlcy9zZWNwMjU2azEuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlbGVnYXRpb25Db25kaXRpb25zIHtcbiAga2luZD86IG51bWJlcjtcbiAgc2luY2U/OiBudW1iZXI7XG4gIHVudGlsPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlbGVnYXRpb24ge1xuICBkZWxlZ2F0b3I6IHN0cmluZztcbiAgZGVsZWdhdGVlOiBzdHJpbmc7XG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zO1xuICB0b2tlbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlbGVnYXRpb24gdG9rZW5cbiAqIEBwYXJhbSBkZWxlZ2F0b3JQcml2YXRlS2V5IERlbGVnYXRvcidzIHByaXZhdGUga2V5ICh1c2VkIGZvciBzaWduaW5nIG9ubHksIG5ldmVyIHJldHVybmVkKVxuICogQHBhcmFtIGRlbGVnYXRlZSBEZWxlZ2F0ZWUncyBwdWJsaWMga2V5XG4gKiBAcGFyYW0gY29uZGl0aW9ucyBEZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEByZXR1cm5zIERlbGVnYXRpb24gdG9rZW4gKGRlbGVnYXRvciBmaWVsZCBjb250YWlucyB0aGUgUFVCTElDIGtleSwgbm90IHRoZSBwcml2YXRlIGtleSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbGVnYXRpb24oXG4gIGRlbGVnYXRvclByaXZhdGVLZXk6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zXG4pOiBEZWxlZ2F0aW9uIHtcbiAgY29uc3QgY29uZGl0aW9uc1N0cmluZyA9IHNlcmlhbGl6ZUNvbmRpdGlvbnMoY29uZGl0aW9ucyk7XG4gIGNvbnN0IHRva2VuID0gc2lnbkRlbGVnYXRpb24oZGVsZWdhdG9yUHJpdmF0ZUtleSwgZGVsZWdhdGVlLCBjb25kaXRpb25zU3RyaW5nKTtcblxuICAvLyBEZXJpdmUgdGhlIHB1YmxpYyBrZXkgZnJvbSB0aGUgcHJpdmF0ZSBrZXkgXHUyMDE0IE5FVkVSIHJldHVybiB0aGUgcHJpdmF0ZSBrZXlcbiAgY29uc3QgZGVsZWdhdG9yUHVibGljS2V5ID0gYnl0ZXNUb0hleChzY2hub3JyLmdldFB1YmxpY0tleShoZXhUb0J5dGVzKGRlbGVnYXRvclByaXZhdGVLZXkpKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkZWxlZ2F0b3I6IGRlbGVnYXRvclB1YmxpY0tleSxcbiAgICBkZWxlZ2F0ZWUsXG4gICAgY29uZGl0aW9ucyxcbiAgICB0b2tlblxuICB9O1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIGRlbGVnYXRpb24gdG9rZW5cbiAqIEBwYXJhbSBkZWxlZ2F0aW9uIERlbGVnYXRpb24gdG8gdmVyaWZ5XG4gKiBAcmV0dXJucyBUcnVlIGlmIHZhbGlkLCBmYWxzZSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeURlbGVnYXRpb24oZGVsZWdhdGlvbjogRGVsZWdhdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBjb25kaXRpb25zU3RyaW5nID0gc2VyaWFsaXplQ29uZGl0aW9ucyhkZWxlZ2F0aW9uLmNvbmRpdGlvbnMpO1xuICByZXR1cm4gYXdhaXQgdmVyaWZ5RGVsZWdhdGlvblNpZ25hdHVyZShcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRvcixcbiAgICBkZWxlZ2F0aW9uLmRlbGVnYXRlZSxcbiAgICBjb25kaXRpb25zU3RyaW5nLFxuICAgIGRlbGVnYXRpb24udG9rZW5cbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhbiBldmVudCBtZWV0cyBkZWxlZ2F0aW9uIGNvbmRpdGlvbnNcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBjaGVja1xuICogQHBhcmFtIGNvbmRpdGlvbnMgRGVsZWdhdGlvbiBjb25kaXRpb25zXG4gKiBAcmV0dXJucyBUcnVlIGlmIGNvbmRpdGlvbnMgYXJlIG1ldFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEZWxlZ2F0aW9uQ29uZGl0aW9ucyhcbiAgZXZlbnQ6IE5vc3RyRXZlbnQsXG4gIGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zXG4pOiBib29sZWFuIHtcbiAgaWYgKGNvbmRpdGlvbnMua2luZCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmtpbmQgIT09IGNvbmRpdGlvbnMua2luZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb25kaXRpb25zLnNpbmNlICE9PSB1bmRlZmluZWQgJiYgZXZlbnQuY3JlYXRlZF9hdCA8IGNvbmRpdGlvbnMuc2luY2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29uZGl0aW9ucy51bnRpbCAhPT0gdW5kZWZpbmVkICYmIGV2ZW50LmNyZWF0ZWRfYXQgPiBjb25kaXRpb25zLnVudGlsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQWRkIGRlbGVnYXRpb24gdGFnIHRvIGFuIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgRXZlbnQgdG8gYWRkIGRlbGVnYXRpb24gdG9cbiAqIEBwYXJhbSBkZWxlZ2F0aW9uIERlbGVnYXRpb24gdG8gYWRkXG4gKiBAcmV0dXJucyBVcGRhdGVkIGV2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWxlZ2F0aW9uVGFnKFxuICBldmVudDogTm9zdHJFdmVudCxcbiAgZGVsZWdhdGlvbjogRGVsZWdhdGlvblxuKTogTm9zdHJFdmVudCB7XG4gIGNvbnN0IHRhZyA9IFtcbiAgICAnZGVsZWdhdGlvbicsXG4gICAgZGVsZWdhdGlvbi5kZWxlZ2F0b3IsXG4gICAgc2VyaWFsaXplQ29uZGl0aW9ucyhkZWxlZ2F0aW9uLmNvbmRpdGlvbnMpLFxuICAgIGRlbGVnYXRpb24udG9rZW5cbiAgXTtcblxuICByZXR1cm4ge1xuICAgIC4uLmV2ZW50LFxuICAgIHRhZ3M6IFsuLi5ldmVudC50YWdzLCB0YWddXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdCBkZWxlZ2F0aW9uIGZyb20gYW4gZXZlbnRcbiAqIEBwYXJhbSBldmVudCBFdmVudCB0byBleHRyYWN0IGRlbGVnYXRpb24gZnJvbVxuICogQHJldHVybnMgRGVsZWdhdGlvbiBvciBudWxsIGlmIG5vdCBmb3VuZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdERlbGVnYXRpb24oZXZlbnQ6IE5vc3RyRXZlbnQpOiBEZWxlZ2F0aW9uIHwgbnVsbCB7XG4gIGNvbnN0IHRhZyA9IGV2ZW50LnRhZ3MuZmluZCh0ID0+IHRbMF0gPT09ICdkZWxlZ2F0aW9uJyk7XG4gIGlmICghdGFnIHx8IHRhZy5sZW5ndGggIT09IDQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGVsZWdhdG9yOiB0YWdbMV0sXG4gICAgZGVsZWdhdGVlOiBldmVudC5wdWJrZXksXG4gICAgY29uZGl0aW9uczogcGFyc2VDb25kaXRpb25zKHRhZ1syXSksXG4gICAgdG9rZW46IHRhZ1szXVxuICB9O1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5mdW5jdGlvbiBzZXJpYWxpemVDb25kaXRpb25zKGNvbmRpdGlvbnM6IERlbGVnYXRpb25Db25kaXRpb25zKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW107XG5cbiAgaWYgKGNvbmRpdGlvbnMua2luZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChga2luZD0ke2NvbmRpdGlvbnMua2luZH1gKTtcbiAgfVxuICBpZiAoY29uZGl0aW9ucy5zaW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcGFydHMucHVzaChgY3JlYXRlZF9hdD4ke2NvbmRpdGlvbnMuc2luY2V9YCk7XG4gIH1cbiAgaWYgKGNvbmRpdGlvbnMudW50aWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHBhcnRzLnB1c2goYGNyZWF0ZWRfYXQ8JHtjb25kaXRpb25zLnVudGlsfWApO1xuICB9XG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyYnKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb25kaXRpb25zKGNvbmRpdGlvbnNTdHJpbmc6IHN0cmluZyk6IERlbGVnYXRpb25Db25kaXRpb25zIHtcbiAgY29uc3QgY29uZGl0aW9uczogRGVsZWdhdGlvbkNvbmRpdGlvbnMgPSB7fTtcbiAgY29uc3QgcGFydHMgPSBjb25kaXRpb25zU3RyaW5nLnNwbGl0KCcmJyk7XG5cbiAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgaWYgKHBhcnQuc3RhcnRzV2l0aCgna2luZD0nKSkge1xuICAgICAgY29uZGl0aW9ucy5raW5kID0gcGFyc2VJbnQocGFydC5zbGljZSg1KSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2NyZWF0ZWRfYXQ+JykpIHtcbiAgICAgIGNvbmRpdGlvbnMuc2luY2UgPSBwYXJzZUludChwYXJ0LnNsaWNlKDExKSk7XG4gICAgfSBlbHNlIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJ2NyZWF0ZWRfYXQ8JykpIHtcbiAgICAgIGNvbmRpdGlvbnMudW50aWwgPSBwYXJzZUludChwYXJ0LnNsaWNlKDExKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmRpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHNpZ25EZWxlZ2F0aW9uKFxuICBkZWxlZ2F0b3I6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IHN0cmluZ1xuKTogc3RyaW5nIHtcbiAgY29uc3QgbWVzc2FnZSA9IGBub3N0cjpkZWxlZ2F0aW9uOiR7ZGVsZWdhdGVlfToke2NvbmRpdGlvbnN9YDtcbiAgY29uc3QgaGFzaCA9IHNoYTI1NihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSkpO1xuICBjb25zdCBzaWduYXR1cmUgPSBzaWduU2Nobm9ycihoYXNoLCBoZXhUb0J5dGVzKGRlbGVnYXRvcikpO1xuICByZXR1cm4gYnl0ZXNUb0hleChzaWduYXR1cmUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB2ZXJpZnlEZWxlZ2F0aW9uU2lnbmF0dXJlKFxuICBkZWxlZ2F0b3I6IHN0cmluZyxcbiAgZGVsZWdhdGVlOiBzdHJpbmcsXG4gIGNvbmRpdGlvbnM6IHN0cmluZyxcbiAgc2lnbmF0dXJlOiBzdHJpbmdcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBtc2dIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShgbm9zdHI6ZGVsZWdhdGlvbjoke2RlbGVnYXRlZX06JHtjb25kaXRpb25zfWApKTtcblxuICByZXR1cm4gdmVyaWZ5U2Nobm9yclNpZ25hdHVyZShoZXhUb0J5dGVzKHNpZ25hdHVyZSksIG1zZ0hhc2gsIGhleFRvQnl0ZXMoZGVsZWdhdG9yKSk7XG59XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ0XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ0IChWZXJzaW9uZWQgRW5jcnlwdGVkIFBheWxvYWRzKVxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci80NC5tZFxuICovXG5cbmltcG9ydCB7IGNoYWNoYTIwIH0gZnJvbSAnQG5vYmxlL2NpcGhlcnMvY2hhY2hhLmpzJztcbmltcG9ydCB7IGVxdWFsQnl0ZXMgfSBmcm9tICdAbm9ibGUvY2lwaGVycy91dGlscy5qcyc7XG5pbXBvcnQgeyBzZWNwMjU2azEgfSBmcm9tICdAbm9ibGUvY3VydmVzL3NlY3AyNTZrMS5qcyc7XG5pbXBvcnQgeyBleHRyYWN0IGFzIGhrZGZfZXh0cmFjdCwgZXhwYW5kIGFzIGhrZGZfZXhwYW5kIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9oa2RmLmpzJztcbmltcG9ydCB7IGhtYWMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL2htYWMuanMnO1xuaW1wb3J0IHsgc2hhMjU2IH0gZnJvbSAnQG5vYmxlL2hhc2hlcy9zaGEyLmpzJztcbmltcG9ydCB7IGNvbmNhdEJ5dGVzLCBoZXhUb0J5dGVzLCByYW5kb21CeXRlcyB9IGZyb20gJ0Bub2JsZS9oYXNoZXMvdXRpbHMuanMnO1xuaW1wb3J0IHsgYmFzZTY0IH0gZnJvbSAnQHNjdXJlL2Jhc2UnO1xuXG5jb25zdCB1dGY4RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuY29uc3QgdXRmOERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuY29uc3QgbWluUGxhaW50ZXh0U2l6ZSA9IDE7XG5jb25zdCBtYXhQbGFpbnRleHRTaXplID0gNjU1MzU7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHBhZGRlZCBsZW5ndGggZm9yIE5JUC00NCBtZXNzYWdlIHBhZGRpbmdcbiAqL1xuZnVuY3Rpb24gY2FsY1BhZGRlZExlbihsZW46IG51bWJlcik6IG51bWJlciB7XG4gIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIobGVuKSB8fCBsZW4gPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHBvc2l0aXZlIGludGVnZXInKTtcbiAgaWYgKGxlbiA8PSAzMikgcmV0dXJuIDMyO1xuICBjb25zdCBuZXh0UG93ZXIgPSAxIDw8IChNYXRoLmZsb29yKE1hdGgubG9nMihsZW4gLSAxKSkgKyAxKTtcbiAgY29uc3QgY2h1bmsgPSBuZXh0UG93ZXIgPD0gMjU2ID8gMzIgOiBuZXh0UG93ZXIgLyA4O1xuICByZXR1cm4gY2h1bmsgKiAoTWF0aC5mbG9vcigobGVuIC0gMSkgLyBjaHVuaykgKyAxKTtcbn1cblxuLyoqXG4gKiBQYWQgcGxhaW50ZXh0IHBlciBOSVAtNDQgc3BlY1xuICovXG5mdW5jdGlvbiBwYWQocGxhaW50ZXh0OiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3QgdW5wYWRkZWQgPSB1dGY4RW5jb2Rlci5lbmNvZGUocGxhaW50ZXh0KTtcbiAgY29uc3QgdW5wYWRkZWRMZW4gPSB1bnBhZGRlZC5sZW5ndGg7XG4gIGlmICh1bnBhZGRlZExlbiA8IG1pblBsYWludGV4dFNpemUgfHwgdW5wYWRkZWRMZW4gPiBtYXhQbGFpbnRleHRTaXplKVxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwbGFpbnRleHQgbGVuZ3RoOiBtdXN0IGJlIGJldHdlZW4gMSBhbmQgNjU1MzUgYnl0ZXMnKTtcbiAgY29uc3QgcHJlZml4ID0gbmV3IFVpbnQ4QXJyYXkoMik7XG4gIG5ldyBEYXRhVmlldyhwcmVmaXguYnVmZmVyKS5zZXRVaW50MTYoMCwgdW5wYWRkZWRMZW4sIGZhbHNlKTsgLy8gYmlnLWVuZGlhblxuICBjb25zdCBzdWZmaXggPSBuZXcgVWludDhBcnJheShjYWxjUGFkZGVkTGVuKHVucGFkZGVkTGVuKSAtIHVucGFkZGVkTGVuKTtcbiAgcmV0dXJuIGNvbmNhdEJ5dGVzKHByZWZpeCwgdW5wYWRkZWQsIHN1ZmZpeCk7XG59XG5cbi8qKlxuICogVW5wYWQgZGVjcnlwdGVkIG1lc3NhZ2UgcGVyIE5JUC00NCBzcGVjXG4gKi9cbmZ1bmN0aW9uIHVucGFkKHBhZGRlZDogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGNvbnN0IHVucGFkZGVkTGVuID0gbmV3IERhdGFWaWV3KHBhZGRlZC5idWZmZXIsIHBhZGRlZC5ieXRlT2Zmc2V0KS5nZXRVaW50MTYoMCwgZmFsc2UpO1xuICBjb25zdCB1bnBhZGRlZCA9IHBhZGRlZC5zdWJhcnJheSgyLCAyICsgdW5wYWRkZWRMZW4pO1xuICBpZiAoXG4gICAgdW5wYWRkZWRMZW4gPCBtaW5QbGFpbnRleHRTaXplIHx8XG4gICAgdW5wYWRkZWRMZW4gPiBtYXhQbGFpbnRleHRTaXplIHx8XG4gICAgdW5wYWRkZWQubGVuZ3RoICE9PSB1bnBhZGRlZExlbiB8fFxuICAgIHBhZGRlZC5sZW5ndGggIT09IDIgKyBjYWxjUGFkZGVkTGVuKHVucGFkZGVkTGVuKVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcGFkZGluZycpO1xuICB9XG4gIHJldHVybiB1dGY4RGVjb2Rlci5kZWNvZGUodW5wYWRkZWQpO1xufVxuXG4vKipcbiAqIERlcml2ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gcHJpdmF0ZSBrZXkgYW5kIHB1YmxpYyBrZXkgdXNpbmcgRUNESCArIEhLREZcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udmVyc2F0aW9uS2V5KHByaXZrZXlBOiBVaW50OEFycmF5LCBwdWJrZXlCOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgY29uc3Qgc2hhcmVkUG9pbnQgPSBzZWNwMjU2azEuZ2V0U2hhcmVkU2VjcmV0KHByaXZrZXlBLCBoZXhUb0J5dGVzKCcwMicgKyBwdWJrZXlCKSk7XG4gIGNvbnN0IHNoYXJlZFggPSBzaGFyZWRQb2ludC5zdWJhcnJheSgxLCAzMyk7XG4gIHJldHVybiBoa2RmX2V4dHJhY3Qoc2hhMjU2LCBzaGFyZWRYLCB1dGY4RW5jb2Rlci5lbmNvZGUoJ25pcDQ0LXYyJykpO1xufVxuXG4vKipcbiAqIERlcml2ZSBtZXNzYWdlIGtleXMgKGNoYWNoYSBrZXksIGNoYWNoYSBub25jZSwgaG1hYyBrZXkpIGZyb20gY29udmVyc2F0aW9uIGtleSBhbmQgbm9uY2VcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5LCBub25jZTogVWludDhBcnJheSk6IHtcbiAgY2hhY2hhX2tleTogVWludDhBcnJheTtcbiAgY2hhY2hhX25vbmNlOiBVaW50OEFycmF5O1xuICBobWFjX2tleTogVWludDhBcnJheTtcbn0ge1xuICBjb25zdCBrZXlzID0gaGtkZl9leHBhbmQoc2hhMjU2LCBjb252ZXJzYXRpb25LZXksIG5vbmNlLCA3Nik7XG4gIHJldHVybiB7XG4gICAgY2hhY2hhX2tleToga2V5cy5zdWJhcnJheSgwLCAzMiksXG4gICAgY2hhY2hhX25vbmNlOiBrZXlzLnN1YmFycmF5KDMyLCA0NCksXG4gICAgaG1hY19rZXk6IGtleXMuc3ViYXJyYXkoNDQsIDc2KSxcbiAgfTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IHBsYWludGV4dCB1c2luZyBOSVAtNDQgdjJcbiAqIEBwYXJhbSBwbGFpbnRleHQgLSBUaGUgbWVzc2FnZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gY29udmVyc2F0aW9uS2V5IC0gMzItYnl0ZSBjb252ZXJzYXRpb24ga2V5IGZyb20gZ2V0Q29udmVyc2F0aW9uS2V5XG4gKiBAcGFyYW0gbm9uY2UgLSBPcHRpb25hbCAzMi1ieXRlIG5vbmNlIChyYW5kb20gaWYgbm90IHByb3ZpZGVkKVxuICogQHJldHVybnMgQmFzZTY0LWVuY29kZWQgZW5jcnlwdGVkIHBheWxvYWRcbiAqL1xuZnVuY3Rpb24gZW5jcnlwdChwbGFpbnRleHQ6IHN0cmluZywgY29udmVyc2F0aW9uS2V5OiBVaW50OEFycmF5LCBub25jZTogVWludDhBcnJheSA9IHJhbmRvbUJ5dGVzKDMyKSk6IHN0cmluZyB7XG4gIGNvbnN0IHsgY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBobWFjX2tleSB9ID0gZ2V0TWVzc2FnZUtleXMoY29udmVyc2F0aW9uS2V5LCBub25jZSk7XG4gIGNvbnN0IHBhZGRlZCA9IHBhZChwbGFpbnRleHQpO1xuICBjb25zdCBjaXBoZXJ0ZXh0ID0gY2hhY2hhMjAoY2hhY2hhX2tleSwgY2hhY2hhX25vbmNlLCBwYWRkZWQpO1xuICBjb25zdCBtYWMgPSBobWFjKHNoYTI1NiwgaG1hY19rZXksIGNvbmNhdEJ5dGVzKG5vbmNlLCBjaXBoZXJ0ZXh0KSk7XG4gIHJldHVybiBiYXNlNjQuZW5jb2RlKGNvbmNhdEJ5dGVzKG5ldyBVaW50OEFycmF5KFsyXSksIG5vbmNlLCBjaXBoZXJ0ZXh0LCBtYWMpKTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgTklQLTQ0IHYyIHBheWxvYWRcbiAqIEBwYXJhbSBwYXlsb2FkIC0gQmFzZTY0LWVuY29kZWQgZW5jcnlwdGVkIHBheWxvYWRcbiAqIEBwYXJhbSBjb252ZXJzYXRpb25LZXkgLSAzMi1ieXRlIGNvbnZlcnNhdGlvbiBrZXkgZnJvbSBnZXRDb252ZXJzYXRpb25LZXlcbiAqIEByZXR1cm5zIERlY3J5cHRlZCBwbGFpbnRleHQgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGRlY3J5cHQocGF5bG9hZDogc3RyaW5nLCBjb252ZXJzYXRpb25LZXk6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCBkYXRhID0gYmFzZTY0LmRlY29kZShwYXlsb2FkKTtcbiAgY29uc3QgdmVyc2lvbiA9IGRhdGFbMF07XG4gIGlmICh2ZXJzaW9uICE9PSAyKSB0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gZW5jcnlwdGlvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gIGlmIChkYXRhLmxlbmd0aCA8IDk5IHx8IGRhdGEubGVuZ3RoID4gNjU2MDMpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwYXlsb2FkIHNpemUnKTtcbiAgY29uc3Qgbm9uY2UgPSBkYXRhLnN1YmFycmF5KDEsIDMzKTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGRhdGEuc3ViYXJyYXkoMzMsIGRhdGEubGVuZ3RoIC0gMzIpO1xuICBjb25zdCBtYWMgPSBkYXRhLnN1YmFycmF5KGRhdGEubGVuZ3RoIC0gMzIpO1xuICBjb25zdCB7IGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgaG1hY19rZXkgfSA9IGdldE1lc3NhZ2VLZXlzKGNvbnZlcnNhdGlvbktleSwgbm9uY2UpO1xuICBjb25zdCBleHBlY3RlZE1hYyA9IGhtYWMoc2hhMjU2LCBobWFjX2tleSwgY29uY2F0Qnl0ZXMobm9uY2UsIGNpcGhlcnRleHQpKTtcbiAgaWYgKCFlcXVhbEJ5dGVzKG1hYywgZXhwZWN0ZWRNYWMpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgTUFDJyk7XG4gIGNvbnN0IHBhZGRlZCA9IGNoYWNoYTIwKGNoYWNoYV9rZXksIGNoYWNoYV9ub25jZSwgY2lwaGVydGV4dCk7XG4gIHJldHVybiB1bnBhZChwYWRkZWQpO1xufVxuXG4vKipcbiAqIHYyIEFQSSBvYmplY3QgbWF0Y2hpbmcgbm9zdHItdG9vbHMgc2hhcGUgZm9yIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGNvbnN0IHYyID0ge1xuICB1dGlsczoge1xuICAgIGdldENvbnZlcnNhdGlvbktleSxcbiAgICBjYWxjUGFkZGVkTGVuLFxuICB9LFxuICBlbmNyeXB0LFxuICBkZWNyeXB0LFxufTtcblxuZXhwb3J0IHsgZ2V0Q29udmVyc2F0aW9uS2V5LCBlbmNyeXB0LCBkZWNyeXB0LCBjYWxjUGFkZGVkTGVuIH07XG4iLCAiLyoqXG4gKiBAbW9kdWxlIG5pcHMvbmlwLTQ2XG4gKiBAZGVzY3JpcHRpb24gSW1wbGVtZW50YXRpb24gb2YgTklQLTQ2IChOb3N0ciBDb25uZWN0IC8gUmVtb3RlIFNpZ25pbmcpXG4gKlxuICogUHVyZSBwcm90b2NvbCBsYXllciBcdTIwMTQgY3J5cHRvLCBlbmNvZGluZywgbWVzc2FnZSBmb3JtYXR0aW5nLlxuICogTm8gV2ViU29ja2V0LCBubyByZWxheSBjb25uZWN0aW9ucywgbm8gSS9PLlxuICogQ29uc3VtZXJzIHByb3ZpZGUgdGhlaXIgb3duIHRyYW5zcG9ydC5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kXG4gKi9cblxuaW1wb3J0IHsgc2Nobm9yciB9IGZyb20gJ0Bub2JsZS9jdXJ2ZXMvc2VjcDI1NmsxLmpzJztcbmltcG9ydCB7IGJ5dGVzVG9IZXgsIGhleFRvQnl0ZXMsIHJhbmRvbUJ5dGVzIH0gZnJvbSAnQG5vYmxlL2hhc2hlcy91dGlscy5qcyc7XG5pbXBvcnQgeyBzaGEyNTYgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NoYTIuanMnO1xuaW1wb3J0IHtcbiAgZ2V0Q29udmVyc2F0aW9uS2V5IGFzIG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5LFxuICBlbmNyeXB0IGFzIG5pcDQ0RW5jcnlwdCxcbiAgZGVjcnlwdCBhcyBuaXA0NERlY3J5cHQsXG59IGZyb20gJy4vbmlwLTQ0JztcbmltcG9ydCB0eXBlIHtcbiAgQnVua2VyVVJJLFxuICBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0LFxuICBOaXA0NlJlcXVlc3QsXG4gIE5pcDQ2UmVzcG9uc2UsXG4gIE5pcDQ2U2Vzc2lvbixcbiAgTmlwNDZTZXNzaW9uSW5mbyxcbiAgU2lnbmVkTm9zdHJFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgTmlwNDZNZXRob2QgfSBmcm9tICcuLi90eXBlcyc7XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCAxLiBCdW5rZXIgVVJJIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIFBhcnNlIGEgYnVua2VyOi8vIFVSSSBpbnRvIGl0cyBjb21wb25lbnRzXG4gKiBAcGFyYW0gdXJpIC0gYnVua2VyOi8vJmx0O3JlbW90ZS1wdWJrZXkmZ3Q7P3JlbGF5PS4uLiZzZWNyZXQ9Li4uXG4gKiBAcmV0dXJucyBQYXJzZWQgQnVua2VyVVJJIG9yIHRocm93cyBvbiBpbnZhbGlkIGlucHV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1bmtlclVSSSh1cmk6IHN0cmluZyk6IEJ1bmtlclVSSSB7XG4gIGlmICghdXJpLnN0YXJ0c1dpdGgoJ2J1bmtlcjovLycpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGJ1bmtlciBVUkk6IG11c3Qgc3RhcnQgd2l0aCBidW5rZXI6Ly8nKTtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IG5ldyBVUkwodXJpLnJlcGxhY2UoJ2J1bmtlcjovLycsICdodHRwczovLycpKTtcbiAgY29uc3QgcmVtb3RlUHVia2V5ID0gdXJsLmhvc3RuYW1lO1xuXG4gIGlmICghL15bMC05YS1mXXs2NH0kLy50ZXN0KHJlbW90ZVB1YmtleSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogcmVtb3RlIHB1YmtleSBtdXN0IGJlIDY0IGhleCBjaGFyYWN0ZXJzJyk7XG4gIH1cblxuICBjb25zdCByZWxheXMgPSB1cmwuc2VhcmNoUGFyYW1zLmdldEFsbCgncmVsYXknKTtcbiAgaWYgKHJlbGF5cy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYnVua2VyIFVSSTogYXQgbGVhc3Qgb25lIHJlbGF5IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBjb25zdCBzZWNyZXQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnc2VjcmV0JykgfHwgdW5kZWZpbmVkO1xuXG4gIHJldHVybiB7IHJlbW90ZVB1YmtleSwgcmVsYXlzLCBzZWNyZXQgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBidW5rZXI6Ly8gVVJJIHN0cmluZ1xuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcGFyYW0gcmVsYXlzIC0gUmVsYXkgVVJMc1xuICogQHBhcmFtIHNlY3JldCAtIE9wdGlvbmFsIGNvbm5lY3Rpb24gc2VjcmV0XG4gKiBAcmV0dXJucyBidW5rZXI6Ly8gVVJJIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnVua2VyVVJJKHJlbW90ZVB1YmtleTogc3RyaW5nLCByZWxheXM6IHN0cmluZ1tdLCBzZWNyZXQ/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIS9eWzAtOWEtZl17NjR9JC8udGVzdChyZW1vdGVQdWJrZXkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdGVQdWJrZXkgbXVzdCBiZSA2NCBoZXggY2hhcmFjdGVycycpO1xuICB9XG4gIGlmIChyZWxheXMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdhdCBsZWFzdCBvbmUgcmVsYXkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIGNvbnN0IHBhcmFtcyA9IHJlbGF5cy5tYXAociA9PiBgcmVsYXk9JHtlbmNvZGVVUklDb21wb25lbnQocil9YCk7XG4gIGlmIChzZWNyZXQpIHtcbiAgICBwYXJhbXMucHVzaChgc2VjcmV0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlY3JldCl9YCk7XG4gIH1cblxuICByZXR1cm4gYGJ1bmtlcjovLyR7cmVtb3RlUHVia2V5fT8ke3BhcmFtcy5qb2luKCcmJyl9YDtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBhIGJ1bmtlcjovLyBVUkkgYW5kIHJldHVybiBzdHJ1Y3R1cmVkIHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCdW5rZXJVUkkodXJpOiBzdHJpbmcpOiBCdW5rZXJWYWxpZGF0aW9uUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUJ1bmtlclVSSSh1cmkpO1xuICAgIHJldHVybiB7IGlzVmFsaWQ6IHRydWUsIHVyaTogcGFyc2VkIH07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6IChlIGFzIEVycm9yKS5tZXNzYWdlIH07XG4gIH1cbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDIuIFNlc3Npb24gTWFuYWdlbWVudCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgTklQLTQ2IHNlc3Npb24gd2l0aCBhbiBlcGhlbWVyYWwga2V5cGFpclxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcmV0dXJucyBTZXNzaW9uIGNvbnRhaW5pbmcgZXBoZW1lcmFsIGtleXMgYW5kIE5JUC00NCBjb252ZXJzYXRpb24ga2V5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZXNzaW9uKHJlbW90ZVB1YmtleTogc3RyaW5nKTogTmlwNDZTZXNzaW9uIHtcbiAgaWYgKCEvXlswLTlhLWZdezY0fSQvLnRlc3QocmVtb3RlUHVia2V5KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncmVtb3RlUHVia2V5IG11c3QgYmUgNjQgaGV4IGNoYXJhY3RlcnMnKTtcbiAgfVxuXG4gIGNvbnN0IGNsaWVudFNlY3JldEtleUJ5dGVzID0gcmFuZG9tQnl0ZXMoMzIpO1xuICBjb25zdCBjbGllbnRTZWNyZXRLZXkgPSBieXRlc1RvSGV4KGNsaWVudFNlY3JldEtleUJ5dGVzKTtcbiAgY29uc3QgY2xpZW50UHVia2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleSA9IGJ5dGVzVG9IZXgoY2xpZW50UHVia2V5Qnl0ZXMpO1xuXG4gIGNvbnN0IGNvbnZlcnNhdGlvbktleSA9IG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzLCByZW1vdGVQdWJrZXkpO1xuXG4gIHJldHVybiB7XG4gICAgY2xpZW50U2VjcmV0S2V5LFxuICAgIGNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXksXG4gICAgY29udmVyc2F0aW9uS2V5LFxuICB9O1xufVxuXG4vKipcbiAqIFJlc3RvcmUgYSBzZXNzaW9uIGZyb20gYSBwcmV2aW91c2x5IHNhdmVkIGVwaGVtZXJhbCBwcml2YXRlIGtleVxuICogQHBhcmFtIGNsaWVudFNlY3JldEtleSAtIEhleC1lbmNvZGVkIGVwaGVtZXJhbCBwcml2YXRlIGtleVxuICogQHBhcmFtIHJlbW90ZVB1YmtleSAtIFJlbW90ZSBzaWduZXIncyBwdWJsaWMga2V5IChoZXgpXG4gKiBAcmV0dXJucyBSZXN0b3JlZCBzZXNzaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlU2Vzc2lvbihjbGllbnRTZWNyZXRLZXk6IHN0cmluZywgcmVtb3RlUHVia2V5OiBzdHJpbmcpOiBOaXA0NlNlc3Npb24ge1xuICBjb25zdCBjbGllbnRTZWNyZXRLZXlCeXRlcyA9IGhleFRvQnl0ZXMoY2xpZW50U2VjcmV0S2V5KTtcbiAgY29uc3QgY2xpZW50UHVia2V5Qnl0ZXMgPSBzY2hub3JyLmdldFB1YmxpY0tleShjbGllbnRTZWNyZXRLZXlCeXRlcyk7XG4gIGNvbnN0IGNsaWVudFB1YmtleSA9IGJ5dGVzVG9IZXgoY2xpZW50UHVia2V5Qnl0ZXMpO1xuXG4gIGNvbnN0IGNvbnZlcnNhdGlvbktleSA9IG5pcDQ0R2V0Q29udmVyc2F0aW9uS2V5KGNsaWVudFNlY3JldEtleUJ5dGVzLCByZW1vdGVQdWJrZXkpO1xuXG4gIHJldHVybiB7XG4gICAgY2xpZW50U2VjcmV0S2V5LFxuICAgIGNsaWVudFB1YmtleSxcbiAgICByZW1vdGVQdWJrZXksXG4gICAgY29udmVyc2F0aW9uS2V5LFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBwdWJsaWMgc2Vzc2lvbiBpbmZvIChzYWZlIHRvIGV4cG9zZSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlc3Npb25JbmZvKHNlc3Npb246IE5pcDQ2U2Vzc2lvbik6IE5pcDQ2U2Vzc2lvbkluZm8ge1xuICByZXR1cm4ge1xuICAgIGNsaWVudFB1YmtleTogc2Vzc2lvbi5jbGllbnRQdWJrZXksXG4gICAgcmVtb3RlUHVia2V5OiBzZXNzaW9uLnJlbW90ZVB1YmtleSxcbiAgfTtcbn1cblxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwIDMuIEpTT04tUlBDIE1lc3NhZ2VzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhIE5JUC00NiBKU09OLVJQQyByZXF1ZXN0XG4gKiBAcGFyYW0gbWV0aG9kIC0gUlBDIG1ldGhvZCBuYW1lXG4gKiBAcGFyYW0gcGFyYW1zIC0gQXJyYXkgb2Ygc3RyaW5nIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBpZCAtIE9wdGlvbmFsIHJlcXVlc3QgSUQgKHJhbmRvbSBpZiBub3QgcHJvdmlkZWQpXG4gKiBAcmV0dXJucyBKU09OLVJQQyByZXF1ZXN0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVxdWVzdChtZXRob2Q6IE5pcDQ2TWV0aG9kIHwgc3RyaW5nLCBwYXJhbXM6IHN0cmluZ1tdLCBpZD86IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGlkIHx8IGJ5dGVzVG9IZXgocmFuZG9tQnl0ZXMoMTYpKSxcbiAgICBtZXRob2QsXG4gICAgcGFyYW1zLFxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIE5JUC00NiBKU09OLVJQQyByZXNwb25zZVxuICogQHBhcmFtIGlkIC0gUmVxdWVzdCBJRCBiZWluZyByZXNwb25kZWQgdG9cbiAqIEBwYXJhbSByZXN1bHQgLSBSZXN1bHQgc3RyaW5nIChvbiBzdWNjZXNzKVxuICogQHBhcmFtIGVycm9yIC0gRXJyb3Igc3RyaW5nIChvbiBmYWlsdXJlKVxuICogQHJldHVybnMgSlNPTi1SUEMgcmVzcG9uc2Ugb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXNwb25zZShpZDogc3RyaW5nLCByZXN1bHQ/OiBzdHJpbmcsIGVycm9yPzogc3RyaW5nKTogTmlwNDZSZXNwb25zZSB7XG4gIGNvbnN0IHJlc3BvbnNlOiBOaXA0NlJlc3BvbnNlID0geyBpZCB9O1xuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHJlc3BvbnNlLnJlc3VsdCA9IHJlc3VsdDtcbiAgaWYgKGVycm9yICE9PSB1bmRlZmluZWQpIHJlc3BvbnNlLmVycm9yID0gZXJyb3I7XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIEpTT04gc3RyaW5nIGludG8gYSBOSVAtNDYgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIGpzb24gLSBKU09OIHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybnMgUGFyc2VkIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGF5bG9hZChqc29uOiBzdHJpbmcpOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlIHtcbiAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaWYgKHR5cGVvZiBvYmouaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIE5JUC00NiBwYXlsb2FkOiBtaXNzaW5nIGlkJyk7XG4gIH1cbiAgcmV0dXJuIG9iaiBhcyB1bmtub3duIGFzIE5pcDQ2UmVxdWVzdCB8IE5pcDQ2UmVzcG9uc2U7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwYXlsb2FkIGlzIGEgTklQLTQ2IHJlcXVlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVxdWVzdChwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlKTogcGF5bG9hZCBpcyBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gJ21ldGhvZCcgaW4gcGF5bG9hZCAmJiAncGFyYW1zJyBpbiBwYXlsb2FkO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcGF5bG9hZCBpcyBhIE5JUC00NiByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNwb25zZShwYXlsb2FkOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlKTogcGF5bG9hZCBpcyBOaXA0NlJlc3BvbnNlIHtcbiAgcmV0dXJuICdyZXN1bHQnIGluIHBheWxvYWQgfHwgJ2Vycm9yJyBpbiBwYXlsb2FkO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNC4gRXZlbnQgV3JhcHBpbmcgKEtpbmQgMjQxMzMpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIEVuY3J5cHQgYW5kIHdyYXAgYSBOSVAtNDYgcGF5bG9hZCBpbnRvIGEga2luZCAyNDEzMyBzaWduZWQgZXZlbnRcbiAqIEBwYXJhbSBwYXlsb2FkIC0gSlNPTi1SUEMgcmVxdWVzdCBvciByZXNwb25zZSB0byBlbmNyeXB0XG4gKiBAcGFyYW0gc2Vzc2lvbiAtIE5JUC00NiBzZXNzaW9uXG4gKiBAcGFyYW0gcmVjaXBpZW50UHVia2V5IC0gVGhlIHJlY2lwaWVudCdzIHB1YmtleSAoaGV4KVxuICogQHJldHVybnMgU2lnbmVkIGtpbmQgMjQxMzMgZXZlbnRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBFdmVudChcbiAgcGF5bG9hZDogTmlwNDZSZXF1ZXN0IHwgTmlwNDZSZXNwb25zZSxcbiAgc2Vzc2lvbjogTmlwNDZTZXNzaW9uLFxuICByZWNpcGllbnRQdWJrZXk6IHN0cmluZ1xuKTogUHJvbWlzZTxTaWduZWROb3N0ckV2ZW50PiB7XG4gIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgY29uc3QgZW5jcnlwdGVkID0gbmlwNDRFbmNyeXB0KGpzb24sIHNlc3Npb24uY29udmVyc2F0aW9uS2V5KTtcblxuICBjb25zdCBjcmVhdGVkX2F0ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gIGNvbnN0IGV2ZW50ID0ge1xuICAgIGtpbmQ6IDI0MTMzLFxuICAgIGNyZWF0ZWRfYXQsXG4gICAgdGFnczogW1sncCcsIHJlY2lwaWVudFB1YmtleV1dLFxuICAgIGNvbnRlbnQ6IGVuY3J5cHRlZCxcbiAgICBwdWJrZXk6IHNlc3Npb24uY2xpZW50UHVia2V5LFxuICB9O1xuXG4gIC8vIFNlcmlhbGl6ZSBmb3IgTklQLTAxIGV2ZW50IElEXG4gIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShbXG4gICAgMCxcbiAgICBldmVudC5wdWJrZXksXG4gICAgZXZlbnQuY3JlYXRlZF9hdCxcbiAgICBldmVudC5raW5kLFxuICAgIGV2ZW50LnRhZ3MsXG4gICAgZXZlbnQuY29udGVudCxcbiAgXSk7XG5cbiAgY29uc3QgZXZlbnRIYXNoID0gc2hhMjU2KG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShzZXJpYWxpemVkKSk7XG4gIGNvbnN0IHByaXZhdGVLZXlCeXRlcyA9IGhleFRvQnl0ZXMoc2Vzc2lvbi5jbGllbnRTZWNyZXRLZXkpO1xuICBjb25zdCBzaWduYXR1cmVCeXRlcyA9IHNjaG5vcnIuc2lnbihldmVudEhhc2gsIHByaXZhdGVLZXlCeXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5ldmVudCxcbiAgICBpZDogYnl0ZXNUb0hleChldmVudEhhc2gpLFxuICAgIHNpZzogYnl0ZXNUb0hleChzaWduYXR1cmVCeXRlcyksXG4gIH07XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbmQgcGFyc2UgYSBraW5kIDI0MTMzIGV2ZW50XG4gKiBAcGFyYW0gZXZlbnQgLSBTaWduZWQga2luZCAyNDEzMyBldmVudFxuICogQHBhcmFtIHNlc3Npb24gLSBOSVAtNDYgc2Vzc2lvblxuICogQHJldHVybnMgRGVjcnlwdGVkIEpTT04tUlBDIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcEV2ZW50KFxuICBldmVudDogU2lnbmVkTm9zdHJFdmVudCxcbiAgc2Vzc2lvbjogTmlwNDZTZXNzaW9uXG4pOiBOaXA0NlJlcXVlc3QgfCBOaXA0NlJlc3BvbnNlIHtcbiAgaWYgKGV2ZW50LmtpbmQgIT09IDI0MTMzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBleHBlY3RlZCBraW5kIDI0MTMzLCBnb3QgJHtldmVudC5raW5kfWApO1xuICB9XG5cbiAgY29uc3QganNvbiA9IG5pcDQ0RGVjcnlwdChldmVudC5jb250ZW50LCBzZXNzaW9uLmNvbnZlcnNhdGlvbktleSk7XG4gIHJldHVybiBwYXJzZVBheWxvYWQoanNvbik7XG59XG5cbi8vIFx1MjUwMFx1MjUwMFx1MjUwMCA1LiBDb252ZW5pZW5jZSBSZXF1ZXN0IENyZWF0b3JzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxuXG4vKipcbiAqIENyZWF0ZSBhICdjb25uZWN0JyByZXF1ZXN0XG4gKiBAcGFyYW0gcmVtb3RlUHVia2V5IC0gUmVtb3RlIHNpZ25lcidzIHB1YmtleVxuICogQHBhcmFtIHNlY3JldCAtIE9wdGlvbmFsIGNvbm5lY3Rpb24gc2VjcmV0IGZyb20gYnVua2VyIFVSSVxuICogQHBhcmFtIHBlcm1pc3Npb25zIC0gT3B0aW9uYWwgY29tbWEtc2VwYXJhdGVkIHBlcm1pc3Npb24gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0UmVxdWVzdChyZW1vdGVQdWJrZXk6IHN0cmluZywgc2VjcmV0Pzogc3RyaW5nLCBwZXJtaXNzaW9ucz86IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIGNvbnN0IHBhcmFtcyA9IFtyZW1vdGVQdWJrZXldO1xuICBpZiAoc2VjcmV0KSBwYXJhbXMucHVzaChzZWNyZXQpO1xuICBlbHNlIGlmIChwZXJtaXNzaW9ucykgcGFyYW1zLnB1c2goJycpO1xuICBpZiAocGVybWlzc2lvbnMpIHBhcmFtcy5wdXNoKHBlcm1pc3Npb25zKTtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuQ09OTkVDVCwgcGFyYW1zKTtcbn1cblxuLyoqIENyZWF0ZSBhICdwaW5nJyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gcGluZ1JlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuUElORywgW10pO1xufVxuXG4vKiogQ3JlYXRlIGEgJ2dldF9wdWJsaWNfa2V5JyByZXF1ZXN0ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHVibGljS2V5UmVxdWVzdCgpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5HRVRfUFVCTElDX0tFWSwgW10pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICdzaWduX2V2ZW50JyByZXF1ZXN0XG4gKiBAcGFyYW0gZXZlbnRKc29uIC0gSlNPTi1zdHJpbmdpZmllZCB1bnNpZ25lZCBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2lnbkV2ZW50UmVxdWVzdChldmVudEpzb246IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLlNJR05fRVZFTlQsIFtldmVudEpzb25dKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSAnbmlwMDRfZW5jcnlwdCcgcmVxdWVzdFxuICogQHBhcmFtIHRoaXJkUGFydHlQdWJrZXkgLSBQdWJsaWMga2V5IG9mIHRoZSBtZXNzYWdlIHJlY2lwaWVudFxuICogQHBhcmFtIHBsYWludGV4dCAtIE1lc3NhZ2UgdG8gZW5jcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwMDRFbmNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIHBsYWludGV4dDogc3RyaW5nKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuTklQMDRfRU5DUllQVCwgW3RoaXJkUGFydHlQdWJrZXksIHBsYWludGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXAwNF9kZWNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2Ugc2VuZGVyXG4gKiBAcGFyYW0gY2lwaGVydGV4dCAtIEVuY3J5cHRlZCBtZXNzYWdlIHRvIGRlY3J5cHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5pcDA0RGVjcnlwdFJlcXVlc3QodGhpcmRQYXJ0eVB1YmtleTogc3RyaW5nLCBjaXBoZXJ0ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVAwNF9ERUNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgY2lwaGVydGV4dF0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhICduaXA0NF9lbmNyeXB0JyByZXF1ZXN0XG4gKiBAcGFyYW0gdGhpcmRQYXJ0eVB1YmtleSAtIFB1YmxpYyBrZXkgb2YgdGhlIG1lc3NhZ2UgcmVjaXBpZW50XG4gKiBAcGFyYW0gcGxhaW50ZXh0IC0gTWVzc2FnZSB0byBlbmNyeXB0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuaXA0NEVuY3J5cHRSZXF1ZXN0KHRoaXJkUGFydHlQdWJrZXk6IHN0cmluZywgcGxhaW50ZXh0OiBzdHJpbmcpOiBOaXA0NlJlcXVlc3Qge1xuICByZXR1cm4gY3JlYXRlUmVxdWVzdChOaXA0Nk1ldGhvZC5OSVA0NF9FTkNSWVBULCBbdGhpcmRQYXJ0eVB1YmtleSwgcGxhaW50ZXh0XSk7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgJ25pcDQ0X2RlY3J5cHQnIHJlcXVlc3RcbiAqIEBwYXJhbSB0aGlyZFBhcnR5UHVia2V5IC0gUHVibGljIGtleSBvZiB0aGUgbWVzc2FnZSBzZW5kZXJcbiAqIEBwYXJhbSBjaXBoZXJ0ZXh0IC0gRW5jcnlwdGVkIG1lc3NhZ2UgdG8gZGVjcnlwdFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmlwNDREZWNyeXB0UmVxdWVzdCh0aGlyZFBhcnR5UHVia2V5OiBzdHJpbmcsIGNpcGhlcnRleHQ6IHN0cmluZyk6IE5pcDQ2UmVxdWVzdCB7XG4gIHJldHVybiBjcmVhdGVSZXF1ZXN0KE5pcDQ2TWV0aG9kLk5JUDQ0X0RFQ1JZUFQsIFt0aGlyZFBhcnR5UHVia2V5LCBjaXBoZXJ0ZXh0XSk7XG59XG5cbi8qKiBDcmVhdGUgYSAnZ2V0X3JlbGF5cycgcmVxdWVzdCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbGF5c1JlcXVlc3QoKTogTmlwNDZSZXF1ZXN0IHtcbiAgcmV0dXJuIGNyZWF0ZVJlcXVlc3QoTmlwNDZNZXRob2QuR0VUX1JFTEFZUywgW10pO1xufVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDAgNi4gRmlsdGVyIEhlbHBlciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcblxuLyoqXG4gKiBDcmVhdGUgYSBOb3N0ciBmaWx0ZXIgZm9yIHN1YnNjcmliaW5nIHRvIE5JUC00NiByZXNwb25zZSBldmVudHNcbiAqIEBwYXJhbSBjbGllbnRQdWJrZXkgLSBPdXIgZXBoZW1lcmFsIHB1YmxpYyBrZXkgKGhleClcbiAqIEBwYXJhbSBzaW5jZSAtIE9wdGlvbmFsIHNpbmNlIHRpbWVzdGFtcFxuICogQHJldHVybnMgRmlsdGVyIG9iamVjdCBmb3Iga2luZCAyNDEzMyBldmVudHMgdGFnZ2VkIHRvIHVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXNwb25zZUZpbHRlcihcbiAgY2xpZW50UHVia2V5OiBzdHJpbmcsXG4gIHNpbmNlPzogbnVtYmVyXG4pOiB7IGtpbmRzOiBudW1iZXJbXTsgJyNwJzogc3RyaW5nW107IHNpbmNlPzogbnVtYmVyIH0ge1xuICBjb25zdCBmaWx0ZXI6IHsga2luZHM6IG51bWJlcltdOyAnI3AnOiBzdHJpbmdbXTsgc2luY2U/OiBudW1iZXIgfSA9IHtcbiAgICBraW5kczogWzI0MTMzXSxcbiAgICAnI3AnOiBbY2xpZW50UHVia2V5XSxcbiAgfTtcbiAgaWYgKHNpbmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICBmaWx0ZXIuc2luY2UgPSBzaW5jZTtcbiAgfVxuICByZXR1cm4gZmlsdGVyO1xufVxuIiwgIi8qKlxuICogQG1vZHVsZSBuaXBzL25pcC00OVxuICogQGRlc2NyaXB0aW9uIEltcGxlbWVudGF0aW9uIG9mIE5JUC00OSAoUHJpdmF0ZSBLZXkgRW5jcnlwdGlvbiAvIG5jcnlwdHNlYylcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDkubWRcbiAqL1xuXG5pbXBvcnQgeyB4Y2hhY2hhMjBwb2x5MTMwNSB9IGZyb20gJ0Bub2JsZS9jaXBoZXJzL2NoYWNoYS5qcyc7XG5pbXBvcnQgeyBzY3J5cHQgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3NjcnlwdC5qcyc7XG5pbXBvcnQgeyBjb25jYXRCeXRlcywgcmFuZG9tQnl0ZXMgfSBmcm9tICdAbm9ibGUvaGFzaGVzL3V0aWxzLmpzJztcbmltcG9ydCB7IGJlY2gzMiBhcyBzY3VyZUJlY2gzMiB9IGZyb20gJ0BzY3VyZS9iYXNlJztcblxudHlwZSBLZXlTZWN1cml0eUJ5dGUgPSAweDAwIHwgMHgwMSB8IDB4MDI7XG5cbi8qKlxuICogRW5jcnlwdCBhIE5vc3RyIHByaXZhdGUga2V5IHdpdGggYSBwYXNzd29yZCwgcHJvZHVjaW5nIGFuIG5jcnlwdHNlYyBiZWNoMzIgc3RyaW5nXG4gKiBAcGFyYW0gc2VjIC0gMzItYnl0ZSBzZWNyZXQga2V5XG4gKiBAcGFyYW0gcGFzc3dvcmQgLSBQYXNzd29yZCBmb3IgZW5jcnlwdGlvblxuICogQHBhcmFtIGxvZ24gLSBTY3J5cHQgbG9nMihOKSBwYXJhbWV0ZXIgKGRlZmF1bHQ6IDE2LCBtZWFuaW5nIE49NjU1MzYpXG4gKiBAcGFyYW0ga3NiIC0gS2V5IHNlY3VyaXR5IGJ5dGU6IDB4MDA9dW5rbm93biwgMHgwMT11bnNhZmUsIDB4MDI9c2FmZSAoZGVmYXVsdDogMHgwMilcbiAqIEByZXR1cm5zIGJlY2gzMi1lbmNvZGVkIG5jcnlwdHNlYyBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHQoXG4gIHNlYzogVWludDhBcnJheSxcbiAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgbG9nbjogbnVtYmVyID0gMTYsXG4gIGtzYjogS2V5U2VjdXJpdHlCeXRlID0gMHgwMlxuKTogc3RyaW5nIHtcbiAgY29uc3Qgc2FsdCA9IHJhbmRvbUJ5dGVzKDE2KTtcbiAgY29uc3QgbiA9IDIgKiogbG9nbjtcbiAgY29uc3Qgbm9ybWFsaXplZFBhc3N3b3JkID0gcGFzc3dvcmQubm9ybWFsaXplKCdORktDJyk7XG4gIGNvbnN0IGtleSA9IHNjcnlwdChub3JtYWxpemVkUGFzc3dvcmQsIHNhbHQsIHsgTjogbiwgcjogOCwgcDogMSwgZGtMZW46IDMyIH0pO1xuICBjb25zdCBub25jZSA9IHJhbmRvbUJ5dGVzKDI0KTtcbiAgY29uc3QgYWFkID0gVWludDhBcnJheS5mcm9tKFtrc2JdKTtcbiAgY29uc3QgY2lwaGVyID0geGNoYWNoYTIwcG9seTEzMDUoa2V5LCBub25jZSwgYWFkKTtcbiAgY29uc3QgY2lwaGVydGV4dCA9IGNpcGhlci5lbmNyeXB0KHNlYyk7XG4gIC8vIEJpbmFyeSBmb3JtYXQ6IHZlcnNpb24oMSkgKyBsb2duKDEpICsgc2FsdCgxNikgKyBub25jZSgyNCkgKyBrc2IoMSkgKyBjaXBoZXJ0ZXh0KDQ4ID0gMzIgKyAxNiB0YWcpXG4gIGNvbnN0IHBheWxvYWQgPSBjb25jYXRCeXRlcyhcbiAgICBVaW50OEFycmF5LmZyb20oWzB4MDJdKSxcbiAgICBVaW50OEFycmF5LmZyb20oW2xvZ25dKSxcbiAgICBzYWx0LFxuICAgIG5vbmNlLFxuICAgIGFhZCxcbiAgICBjaXBoZXJ0ZXh0XG4gICk7XG4gIGNvbnN0IHdvcmRzID0gc2N1cmVCZWNoMzIudG9Xb3JkcyhwYXlsb2FkKTtcbiAgcmV0dXJuIHNjdXJlQmVjaDMyLmVuY29kZSgnbmNyeXB0c2VjJywgd29yZHMsIDIwMCk7XG59XG5cbi8qKlxuICogRGVjcnlwdCBhbiBuY3J5cHRzZWMgYmVjaDMyIHN0cmluZyBiYWNrIHRvIHRoZSAzMi1ieXRlIHNlY3JldCBrZXlcbiAqIEBwYXJhbSBuY3J5cHRzZWMgLSBiZWNoMzItZW5jb2RlZCBuY3J5cHRzZWMgc3RyaW5nXG4gKiBAcGFyYW0gcGFzc3dvcmQgLSBQYXNzd29yZCB1c2VkIGZvciBlbmNyeXB0aW9uXG4gKiBAcmV0dXJucyAzMi1ieXRlIHNlY3JldCBrZXkgYXMgVWludDhBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjcnlwdChuY3J5cHRzZWM6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBjb25zdCB7IHByZWZpeCwgd29yZHMgfSA9IHNjdXJlQmVjaDMyLmRlY29kZShuY3J5cHRzZWMgYXMgYCR7c3RyaW5nfTEke3N0cmluZ31gLCAyMDApO1xuICBpZiAocHJlZml4ICE9PSAnbmNyeXB0c2VjJykgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIG5jcnlwdHNlYyBwcmVmaXgnKTtcbiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHNjdXJlQmVjaDMyLmZyb21Xb3Jkcyh3b3JkcykpO1xuICBjb25zdCB2ZXJzaW9uID0gZGF0YVswXTtcbiAgaWYgKHZlcnNpb24gIT09IDB4MDIpIHRocm93IG5ldyBFcnJvcihgdW5rbm93biBuY3J5cHRzZWMgdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICBjb25zdCBsb2duID0gZGF0YVsxXTtcbiAgY29uc3Qgc2FsdCA9IGRhdGEuc3ViYXJyYXkoMiwgMTgpO1xuICBjb25zdCBub25jZSA9IGRhdGEuc3ViYXJyYXkoMTgsIDQyKTtcbiAgY29uc3Qga3NiID0gZGF0YVs0Ml07XG4gIGNvbnN0IGNpcGhlcnRleHQgPSBkYXRhLnN1YmFycmF5KDQzKTtcbiAgY29uc3QgbiA9IDIgKiogbG9nbjtcbiAgY29uc3Qgbm9ybWFsaXplZFBhc3N3b3JkID0gcGFzc3dvcmQubm9ybWFsaXplKCdORktDJyk7XG4gIGNvbnN0IGtleSA9IHNjcnlwdChub3JtYWxpemVkUGFzc3dvcmQsIHNhbHQsIHsgTjogbiwgcjogOCwgcDogMSwgZGtMZW46IDMyIH0pO1xuICBjb25zdCBhYWQgPSBVaW50OEFycmF5LmZyb20oW2tzYl0pO1xuICBjb25zdCBjaXBoZXIgPSB4Y2hhY2hhMjBwb2x5MTMwNShrZXksIG5vbmNlLCBhYWQpO1xuICByZXR1cm4gY2lwaGVyLmRlY3J5cHQoY2lwaGVydGV4dCk7XG59XG4iLCAiLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIGRhdGFcbiAqL1xuXG4vKipcbiAqIENvbnZlcnQgYSBoZXggc3RyaW5nIHRvIFVpbnQ4QXJyYXlcbiAqIEBwYXJhbSBoZXggSGV4IHN0cmluZyB0byBjb252ZXJ0XG4gKiBAcmV0dXJucyBVaW50OEFycmF5IG9mIGJ5dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXhUb0J5dGVzKGhleDogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShoZXgubGVuZ3RoIC8gMik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZXgubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgYnl0ZXNbaSAvIDJdID0gcGFyc2VJbnQoaGV4LnNsaWNlKGksIGkgKyAyKSwgMTYpO1xuICAgIH1cbiAgICByZXR1cm4gYnl0ZXM7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIGhleCBzdHJpbmdcbiAqIEBwYXJhbSBieXRlcyBVaW50OEFycmF5IHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIEhleCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9IZXgoYnl0ZXM6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzKVxuICAgICAgICAubWFwKGIgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKSlcbiAgICAgICAgLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBVVEYtOCBzdHJpbmcgdG8gVWludDhBcnJheVxuICogQHBhcmFtIHN0ciBVVEYtOCBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybnMgVWludDhBcnJheSBvZiBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICByZXR1cm4gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHN0cik7XG59XG5cbi8qKlxuICogQ29udmVydCBVaW50OEFycmF5IHRvIFVURi04IHN0cmluZ1xuICogQHBhcmFtIGJ5dGVzIFVpbnQ4QXJyYXkgdG8gY29udmVydFxuICogQHJldHVybnMgVVRGLTggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvVXRmOChieXRlczogVWludDhBcnJheSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShieXRlcyk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsTUFNVztBQU5YO0FBQUE7QUFNTyxNQUFJLFVBQVU7QUFBQSxRQUNqQixLQUFLLEVBQUUsVUFBVSxjQUFjLFdBQVcsT0FBTztBQUFBLFFBQ2pELFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFVBQVUsU0FBVSxJQUFJO0FBQ3BCLGNBQUksT0FBTyxNQUFNLFVBQVUsTUFBTSxLQUFLLFdBQVcsQ0FBQztBQUNsRCxrQkFBUSxRQUFRLEVBQUUsS0FBSyxXQUFZO0FBQUUsZUFBRyxNQUFNLE1BQU0s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TUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssT0FBTyxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDakY7QUFB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QUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDdEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLFlBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3RCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksR0FBRyxFQUFFO0FBQ2pCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUU7QUFDbEIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDakIsYUFBSyxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ2xCLGFBQUssR0FBRyxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFLLEdBQUcsSUFB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bUI7QUFDaEMsNEJBQXNCLFdBQVcsTUFBTSxPQUFPLEdBQUcsR0FBRztBQUFBLElBQ3hELENBQUM7QUFFRCxNQUFFLGNBQWMsR0FBRyxpQkFBaUIsU0FBUyxPQUFPO0FBQ3BELE1BQUUsZ0JBQWdCLEdBQUcsaUJBQWlCLFNBQVMsU0FBUztBQUN4RCxNQUFFLFdBQVcsR0FBRyxpQkFBaUIsU0FBUyxNQUFNLE9BQU8sTUFBTSxDQUFDO0FBQUEsRUFDbEU7QUFJQSxpQkFBZSxPQUFPO0FBRWxCLFVBQU0sZUFBZSxFQUFFLGNBQWM7QUFDckMsUUFBSSxjQUFjO0FBQ2QsbUJBQWEsWUFBWSxzQkFDckIsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxrQkFBa0IsSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUU7QUFBQSxJQUNuRztBQUVBLGVBQVc7QUFDWCxVQUFNLE9BQU87QUFBQSxFQUNqQjtBQUVBLFdBQVMsaUJBQWlCLG9CQUFvQixJQUFJOyIsCiAgIm5hbWVzIjogWyJwaW5vIiwgImxvZ2dlciIsICJ0cmFuc21pdCIsICJsZXZlbCIsICJzZXRPcHRzIiwgInNlbGYiLCAibGVuIiwgImkiLCAibnVtIiwgImxlbjIiLCAiQnVmZmVyIiwgInV0ZjhUb0J5dGVzIiwgImJhc2U2NFRvQnl0ZXMiLCAiaSIsICJhc2NpaVRvQnl0ZXMiLCAiYnl0ZUxlbmd0aCIsICJ0YXJnZXQiLCAic3RhdGUiLCAiTm9zdHJFdmVudEtpbmQiLCAiTm9zdHJNZXNzYWdlVHlwZSIsICJOaXA0Nk1ldGhvZCIsICJOb3N0ckV2ZW50S2luZCIsICJfMG4iLCAiXzFuIiwgIl8wbiIsICJfMW4iLCAibnVtIiwgIl8wbiIsICJfMW4iLCAiXzFuIiwgIl8wbiIsICJfMW4iLCAibnVtIiwgIm51bSIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJ3aW5kb3ciLCAiXzBuIiwgIl8xbiIsICJ3aW5kb3ciLCAiXzBuIiwgImdldFB1YmxpY0tleSIsICJudW0iLCAiXzJuIiwgIl8wbiIsICJfMW4iLCAiXzBuIiwgIl8xbiIsICJfMm4iLCAiXzNuIiwgIl80biIsICJwb2ludFRvQnl0ZXMiLCAiZW5kbyIsICJfMG4iLCAiXzJuIiwgIl8zbiIsICJfMm4iLCAiXzBuIiwgIkxvZ0xldmVsIiwgInBpbm8iLCAiY3J5cHRvIiwgImdldENyeXB0byIsICJjcnlwdG8iXQp9Cg==
